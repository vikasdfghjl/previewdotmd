'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterWrapperProps {
  language: string;
  children: string;
  isDark: boolean;
}

export const SyntaxHighlighterWrapper: React.FC<SyntaxHighlighterWrapperProps> = ({
  language,
  children,
  isDark,
}) => {
  const syntaxTheme = isDark ? oneDark : oneLight;

  return (
    <SyntaxHighlighter
      style={syntaxTheme}
      language={language}
      PreTag="div"
      customStyle={{
        margin: 0,
        padding: '1.25rem',
        borderRadius: 0,
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
};
