import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeRenderer } from './CodeRenderer';
import { PanelHeader } from './PanelHeader';

interface PreviewPanelProps {
  markdown: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  markdown,
  isVisible,
  onToggle,
}) => {
  return (
    <div className="panel flex flex-col h-full">
      <PanelHeader
        title="Live Preview"
        subtitle="Formatted output"
        onToggle={onToggle}
        isHidden={!isVisible}
      />
      
      {/* Preview container with improved scrolling */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-none">
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
};