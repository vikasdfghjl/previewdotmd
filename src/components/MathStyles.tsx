'use client';

import { useEffect, useRef } from 'react';

// Module-level flag — only load once per session, not per component mount.
let cssLoaded = false;
let loadPromise: Promise<void> | null = null;

function ensureCss(): Promise<void> {
  if (cssLoaded) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = import('katex/dist/katex.min.css')
      .then(() => {
        cssLoaded = true;
      })
      .catch(() => {
        // KaTeX CSS failed to load — math will render unstyled
        cssLoaded = true; // don't retry
      });
  }
  return loadPromise;
}

/**
 * MathStyles — injects KaTeX CSS only when markdown contains math syntax.
 * The CSS (~24 KB) is loaded once per session and never loaded if the user
 * never writes math.
 */
export function MathStyles({ markdown }: { markdown: string }) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Quick pre-check for math delimiters
    if (attemptedRef.current || cssLoaded) return;

    const hasMath =
      markdown.includes('$$') ||
      (markdown.match(/\$[^$]+\$/g)?.length ?? 0) > 0;

    if (hasMath) {
      attemptedRef.current = true;
      ensureCss();
    }
  }, [markdown]);

  return null;
}
