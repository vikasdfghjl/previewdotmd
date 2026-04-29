'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { MermaidRenderer } from './MermaidRenderer';

const SyntaxHighlighterWrapper = dynamic(
  () => import('./SyntaxHighlighterWrapper').then(mod => ({ default: mod.SyntaxHighlighterWrapper })),
  {
    ssr: false,
    loading: () => <div className="p-5 text-sm text-secondary font-mono">Loading syntax highlighter...</div>,
  }
);

type CodeRendererProps = React.ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

export const CodeRenderer: React.FC<CodeRendererProps> = ({
  className = '',
  children,
  inline = false,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Handle Mermaid diagrams
  if (!inline && language === 'mermaid') {
    return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
  }

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
        
        {/* Lazy-loaded code content */}
        <div className="relative">
          <SyntaxHighlighterWrapper
            language={match[1]}
            isDark={isDark}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighterWrapper>

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
};