'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MermaidRenderer } from './MermaidRenderer';

type SyntaxHighlighterComponent = React.ComponentType<{
  language: string;
  children: string;
  isDark: boolean;
}>;

// Cache the module across all CodeRenderer instances — only loaded once
let highlighterPromise: Promise<SyntaxHighlighterComponent> | null = null;
let HighlighterModule: SyntaxHighlighterComponent | null = null;

function loadHighlighter(): Promise<SyntaxHighlighterComponent> {
  if (HighlighterModule) return Promise.resolve(HighlighterModule);
  if (!highlighterPromise) {
    highlighterPromise = import('./SyntaxHighlighterWrapper').then(
      (mod) => {
        HighlighterModule = mod.SyntaxHighlighterWrapper;
        return HighlighterModule;
      },
    );
  }
  return highlighterPromise;
}

type CodeRendererProps = React.ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  isDark?: boolean;
};

/**
 * CodeRenderer — renders inline code and fenced code blocks.
 *
 * The syntax highlighter (~200 KB) is only loaded when a fenced code block
 * with a recognized language is actually rendered. If the markdown has no
 * code blocks (or only plain ``` fences), the highlighter is never fetched.
 */
export const CodeRenderer = React.memo<CodeRendererProps>(({
  className = '',
  children,
  inline = false,
  isDark = false,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const [Highlighter, setHighlighter] = useState<SyntaxHighlighterComponent | null>(null);
  const [highlighterLoading, setHighlighterLoading] = useState(false);
  const mountedRef = useRef(true);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Handle Mermaid diagrams
  if (!inline && language === 'mermaid') {
    return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
  }

  // Trigger lazy load of the syntax highlighter only when a language is detected
  useEffect(() => {
    if (!inline && match && !Highlighter && !highlighterLoading) {
      setHighlighterLoading(true);
      loadHighlighter().then((mod) => {
        if (mountedRef.current) {
          setHighlighter(mod);
        }
      });
    }
    return () => { mountedRef.current = false; };
  }, [inline, !!match, Highlighter, highlighterLoading]);

  // Copy to clipboard function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!inline && match) {
    // Fallback while highlighter is loading (or if it failed to load)
    const CodeBlock = Highlighter;
    const rawCode = String(children).replace(/\n$/, '');

    return (
      <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Code block header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs font-medium text-secondary ml-2">
              {language}
            </span>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="btn px-3 py-2 min-h-[44px] text-xs rounded-md flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            title={copied ? 'Copied!' : 'Copy code'}
            aria-label={copied ? `Code copied to clipboard. ${language} language` : `Copy ${language} code to clipboard`}
            aria-live="polite"
            aria-atomic="true"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600 dark:text-green-400">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code content */}
        <div className="relative">
          {CodeBlock ? (
            <CodeBlock language={language} isDark={isDark}>
              {rawCode}
            </CodeBlock>
          ) : (
            <pre className="m-0 p-5 text-sm font-mono bg-gray-50 dark:bg-gray-900 overflow-x-auto">
              <code>{rawCode}</code>
            </pre>
          )}

          {/* Fade effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/5 to-transparent dark:from-black/20 pointer-events-none" />
        </div>
      </div>
    );
  }

  // Inline code styling
  return (
    <code
      className="px-1.5 py-0.5 rounded-md text-sm font-mono bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 border border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </code>
  );
});

CodeRenderer.displayName = 'CodeRenderer';
