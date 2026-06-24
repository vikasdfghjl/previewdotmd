'use client';

import React, { useState, useEffect } from 'react';

interface SyntaxHighlighterWrapperProps {
  language: string;
  children: string;
  isDark: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Module-level cache — only loaded when first code block renders
let HL: any = null;
let oneDarkTheme: any = null;
let oneLightTheme: any = null;
let loadPromise: Promise<void> | null = null;
/* eslint-enable @typescript-eslint/no-explicit-any */

function loadSyntaxHighlighter(): Promise<void> {
  if (HL) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = Promise.all([
      import('react-syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism'),
    ]).then(([hlModule, styleModule]) => {
      HL = hlModule.Prism;
      oneDarkTheme = styleModule.oneDark;
      oneLightTheme = styleModule.oneLight;
    });
  }
  return loadPromise;
}

/**
 * SyntaxHighlighterWrapper — renders syntax-highlighted code.
 * react-syntax-highlighter (~200 KB) is loaded ONLY when this component
 * first mounts (i.e., when the user's markdown contains a fenced code
 * block with a recognized language). Until then, zero bytes are fetched.
 */
export const SyntaxHighlighterWrapper: React.FC<SyntaxHighlighterWrapperProps> = ({
  language,
  children,
  isDark,
}) => {
  const [ready, setReady] = useState(!!HL);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!HL) {
      loadSyntaxHighlighter()
        .then(() => setReady(true))
        .catch(() => setLoadError(true));
    }
  }, []);

  // Fallback while loading (or if loading failed)
  if (!ready || loadError || !HL) {
    return (
      <pre className="m-0 p-5 text-sm font-mono bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        <code>{children}</code>
      </pre>
    );
  }

  const style = isDark ? oneDarkTheme : oneLightTheme;
  const Highlighter = HL;

  return (
    <Highlighter
      style={style ?? {}}
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
    </Highlighter>
  );
};
