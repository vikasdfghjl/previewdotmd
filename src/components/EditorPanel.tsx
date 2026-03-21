import React from 'react';
import { ActionButton } from './ActionButton';
import { PanelHeader } from './PanelHeader';

interface EditorPanelProps {
  markdown: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onReset: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  markdown,
  onChange,
  onClear,
  onReset,
  isVisible,
  onToggle,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const actions = (
    <>
      <ActionButton 
        onClick={onClear} 
        title="Clear all markdown"
        variant="danger"
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Clear</span>
        </div>
      </ActionButton>
      <ActionButton 
        onClick={onReset} 
        title="Reset to default example"
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </div>
      </ActionButton>
    </>
  );

  return (
    <div className="panel flex flex-col h-full border-r">
      <PanelHeader
        title="Markdown Input"
        subtitle="Paste or write markdown"
        actions={actions}
        onToggle={onToggle}
        isHidden={!isVisible}
      />
      
      {/* Editor container with subtle gradient overlay */}
      <div className="flex-1 relative">
        <textarea
          className="absolute inset-0 w-full h-full font-mono text-sm resize-none outline-none"
          value={markdown}
          onChange={handleChange}
          placeholder={"# Start writing your markdown...\n\n## Features\n- **Bold** and *italic* text\n- Lists and tables\n- Code blocks with syntax highlighting\n\n```javascript\nconsole.log('Hello World!');\n```\n\n> Beautiful, formatted preview appears on the right"}
          spellCheck={false}
        />
        
        {/* Subtle gradient overlay at edges */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-gray-50/30 dark:to-gray-800/30" />
      </div>
      
      {/* Footer with stats */}
      <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-secondary">
          <span>{markdown.length} characters</span>
          <span>{markdown.split(/\s+/).filter(Boolean).length} words</span>
          <span>{markdown.split('\n').length} lines</span>
        </div>
        <div className="text-xs text-secondary opacity-60">
          Tab size: 2 spaces
        </div>
      </div>
    </div>
  );
};