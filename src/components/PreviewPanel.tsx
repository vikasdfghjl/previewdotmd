import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeRenderer } from './CodeRenderer';
import { PanelHeader } from './PanelHeader';
import { ActionButton } from './ActionButton';

interface PreviewPanelProps {
  markdown: string;
  isVisible: boolean;
  onToggle: () => void;
  onExportHtml?: () => void;
  onExportPdf?: () => void;
  onExportPlainText?: () => void;
  zoomLevel?: number;
  onScroll?: (percentage: number) => void;
}

export interface PreviewPanelRef {
  scrollToPercentage: (percentage: number) => void;
}

export const PreviewPanel = forwardRef<PreviewPanelRef, PreviewPanelProps>(({
  markdown,
  isVisible,
  onToggle,
  onExportHtml,
  onExportPdf,
  onExportPlainText,
  zoomLevel = 100,
  onScroll,
}, ref) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    scrollToPercentage: (percentage: number) => {
      if (!scrollContainerRef.current) return;
      isScrollingRef.current = true;
      const el = scrollContainerRef.current;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      el.scrollTop = scrollHeight * percentage;
      requestAnimationFrame(() => {
        isScrollingRef.current = false;
      });
    },
  }));

  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    const el = scrollContainerRef.current;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const percentage = scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;
    onScroll?.(percentage);
  };

  const exportActions = (
    <div className="relative">
      <ActionButton
        onClick={() => setShowExportMenu(!showExportMenu)}
        title="Export options"
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export</span>
        </div>
      </ActionButton>
      
      {showExportMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowExportMenu(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            {onExportHtml && (
              <button
                onClick={() => {
                  onExportHtml();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Export as HTML
              </button>
            )}
            {onExportPdf && (
              <button
                onClick={() => {
                  onExportPdf();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export as PDF
              </button>
            )}
            {onExportPlainText && (
              <button
                onClick={() => {
                  onExportPlainText();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as Plain Text
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="panel flex flex-col h-full">
      <PanelHeader
        title="Live Preview"
        subtitle="Formatted output"
        actions={exportActions}
        onToggle={onToggle}
        isHidden={!isVisible}
      />
      
      {/* Preview container with improved scrolling */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
      >
        <div
          className="p-6 max-w-none"
          style={{ fontSize: `${zoomLevel}%` }}
        >
          {/* Empty state when no content */}
          {markdown.trim() === '' ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No markdown content</h3>
              <p className="text-sm text-secondary max-w-sm">
                Start writing markdown in the editor panel to see your formatted preview here.
              </p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeRenderer as any,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer with preview info */}
      <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-secondary">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Real-time preview</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>GitHub Flavored Markdown</span>
        </div>
      </div>
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';