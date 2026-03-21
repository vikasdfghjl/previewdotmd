'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';

interface CodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({
  node,
  inline,
  className,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  
  // Choose syntax highlighting theme based on current mode
  const syntaxTheme = isDark ? oneDark : oneLight;
  
  const match = /language-(\w+)/.exec(className || '');
  
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
              {match[1]}
            </span>
          </div>
          
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="btn px-2 py-1 text-xs rounded-md flex items-center gap-1.5 transition-all"
            title={copied ? 'Copied!' : 'Copy code'}
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
          <SyntaxHighlighter
            style={syntaxTheme}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              borderRadius: 0,
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          
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