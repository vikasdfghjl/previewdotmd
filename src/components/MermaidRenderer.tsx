'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MermaidRendererProps {
  chart: string;
}

let mermaidInitializedTheme: 'light' | 'dark' | null = null;

async function loadMermaid(theme: 'light' | 'dark') {
  const mermaid = (await import('mermaid')).default;
  if (mermaidInitializedTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'strict',
      fontFamily: 'inherit',
    });
    mermaidInitializedTheme = theme;
  }
  return mermaid;
}

/**
 * Mermaid Diagram Renderer
 *
 * Single Responsibility: Renders Mermaid diagrams from markdown code blocks
 * Uses dynamic import for code-splitting (~1MB off main bundle)
 */
export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Render the diagram via dynamic import. Re-renders when the theme changes
  // since Mermaid bakes colors into the SVG at render time.
  useEffect(() => {
    if (!chart.trim()) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const renderDiagram = async () => {
      try {
        const mermaid = await loadMermaid(theme);
        if (cancelled) return;

        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        // Mermaid emits width="100%" capped by a natural-size max-width,
        // which scales wide diagrams down to the container — unreadably
        // small on phones. Give the svg its natural width instead and let
        // the overflow-auto container scroll horizontally.
        const naturalSvg = renderedSvg
          .replace(/max-width:\s*([\d.]+)px;?/, 'width: $1px;')
          .replace(/\swidth="100%"/, '');
        if (!cancelled) setSvg(naturalSvg);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvg('');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    renderDiagram();

    return () => { cancelled = true; };
  }, [chart, theme]);

  if (isLoading) {
    return (
      <div className="my-4 p-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Rendering diagram...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Diagram Error</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto">
              {chart}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram-container my-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
