import React, { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, useDeferredValue } from 'react';
import { ActionButton } from './ActionButton';
import { PanelHeader } from './PanelHeader';
import { FindReplace } from './FindReplace';
import { SyntaxHighlightOverlay } from './SyntaxHighlightOverlay';
import { useFindReplace } from '@/hooks/useFindReplace';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { useBracketMatching } from '@/hooks/useBracketMatching';
import { useSmartTyping } from '@/hooks/useSmartTyping';
import { useColumnSelection } from '@/hooks/useColumnSelection';
import { useAutoComplete } from '@/hooks/useAutoComplete';
import { Icons } from '@/constants/icons';

interface EditorPanelProps {
  markdown: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onReset: () => void;
  isVisible: boolean;
  onToggle: () => void;
  onFileUpload?: (file: File) => void;
  onDownload?: () => void;
  onScroll?: (percentage: number) => void;
  zoomLevel?: number;
}

export interface EditorPanelRef {
  scrollToPercentage: (percentage: number) => void;
}

export const EditorPanel = forwardRef<EditorPanelRef, EditorPanelProps>(({
  markdown,
  onChange,
  onClear,
  onReset,
  isVisible,
  onToggle,
  onFileUpload,
  onDownload,
  onScroll,
  zoomLevel = 100,
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isScrollingRef = useRef(false);

  // Defer syntax highlighting to avoid blocking textarea input
  const deferredMarkdown = useDeferredValue(markdown);

  const {
    isOpen: findReplaceOpen,
    matchCount,
    currentMatch,
    open: openFindReplace,
    close: closeFindReplace,
    toggle: toggleFindReplace,
    handleFind,
    handleReplace,
    goToNextMatch,
    goToPrevMatch,
  } = useFindReplace({ markdown, onChange, textareaRef });

  // Bracket matching
  const {
    activeMatch: activeBracketMatch,
    handleCursorChange: handleBracketCursorChange,
  } = useBracketMatching(markdown);

  useEditorShortcuts({
    markdown,
    onChange,
    textareaRef,
    onOpenFindReplace: openFindReplace,
  });

  // Smart typing - auto-close brackets, quotes, and markdown pairs
  const { handleKeyDown: handleSmartTyping } = useSmartTyping(textareaRef, {
    autoCloseBrackets: true,
    autoCloseQuotes: true,
    autoCloseMarkdown: true,
  });

  // Column selection - Alt+Drag for rectangular selection
  const {
    handleMouseDown: handleColumnMouseDown,
    handleMouseMove: handleColumnMouseMove,
    handleMouseUp: handleColumnMouseUp,
  } = useColumnSelection(textareaRef, markdown);

  // Auto-completion - Markdown syntax suggestions
  const {
    suggestions,
    selectedIndex,
    isVisible: showAutoComplete,
    handleInput: handleAutoCompleteInput,
    handleKeyDown: handleAutoCompleteKeyDown,
    insertSuggestion,
  } = useAutoComplete(textareaRef, markdown);

  useImperativeHandle(ref, () => ({
    scrollToPercentage: (percentage: number) => {
      if (!textareaRef.current) return;
      isScrollingRef.current = true;
      const el = textareaRef.current;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      el.scrollTop = scrollHeight * percentage;
      requestAnimationFrame(() => {
        isScrollingRef.current = false;
      });
    },
  }));

  const lineCount = useMemo(() => markdown.split('\n').length || 1, [markdown]);
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (textareaRef.current && !isScrollingRef.current) {
      const el = textareaRef.current;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const percentage = scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;
      onScroll?.(percentage);
    }
  }, [onScroll]);

  // Handle cursor position change for bracket matching
  const handleCursorChange = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;

      // Convert position to line and column
      const textBeforeCursor = markdown.slice(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const cursorLine = lines.length - 1;
      const cursorColumn = lines[lines.length - 1].length;

      handleBracketCursorChange(cursorLine, cursorColumn);
    }
  }, [markdown, handleBracketCursorChange]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
      textarea.addEventListener('keyup', handleCursorChange);
      textarea.addEventListener('click', handleCursorChange);
      return () => {
        textarea.removeEventListener('scroll', handleScroll);
        textarea.removeEventListener('keyup', handleCursorChange);
        textarea.removeEventListener('click', handleCursorChange);
      };
    }
  }, [handleScroll, handleCursorChange]);

  // Combined keydown handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Try auto-complete first
    if (handleAutoCompleteKeyDown(e)) return;
    
    // Then smart typing
    if (handleSmartTyping(e)) return;
  }, [handleAutoCompleteKeyDown, handleSmartTyping]);

  // Combined input handler
  const handleInput = useCallback(() => {
    handleAutoCompleteInput();
  }, [handleAutoCompleteInput]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const actions = (
    <>
      <ActionButton onClick={() => fileInputRef.current?.click()} title="Upload markdown file">
        <div className="flex items-center gap-1.5">{Icons.upload}<span>Upload</span></div>
      </ActionButton>
      <ActionButton onClick={toggleFindReplace} title="Find & Replace (Ctrl+F)">
        <div className="flex items-center gap-1.5">{Icons.search}<span>Find</span></div>
      </ActionButton>
      {onDownload && (
        <ActionButton onClick={onDownload} title="Download markdown file">
          <div className="flex items-center gap-1.5">{Icons.download}<span>Download</span></div>
        </ActionButton>
      )}
      <ActionButton onClick={onClear} title="Clear all markdown" variant="danger">
        <div className="flex items-center gap-1.5">{Icons.trash}<span>Clear</span></div>
      </ActionButton>
      <ActionButton onClick={onReset} title="Reset to default example">
        <div className="flex items-center gap-1.5">{Icons.reset}<span>Reset</span></div>
      </ActionButton>
    </>
  );

  return (
    <div className="panel flex flex-col h-full border-r">
      <PanelHeader
        title="Markdown Input"
        subtitle="Paste or write markdown"
        icon={Icons.edit}
        actions={actions}
        onToggle={onToggle}
        isHidden={!isVisible}
      />

      <input ref={fileInputRef} type="file" accept=".md,.markdown" onChange={handleFileSelect} className="hidden" />

      <div
        className="flex-1 relative flex overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FindReplace
          isOpen={findReplaceOpen}
          onClose={closeFindReplace}
          onFind={handleFind}
          onReplace={handleReplace}
          matchCount={matchCount}
          currentMatch={currentMatch}
          onNext={goToNextMatch}
          onPrev={goToPrevMatch}
        />

        <div
          ref={lineNumbersRef}
          className="w-12 flex-shrink-0 overflow-hidden text-right pr-2 pt-4 pb-4 font-mono text-sm text-gray-500 dark:text-gray-400 select-none bg-gray-50/50 dark:bg-gray-800/30"
          aria-label="Line numbers"
          aria-hidden="true"
        >
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="leading-6 h-6 flex items-center justify-end"
            >
              <span>{num}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <SyntaxHighlightOverlay
            markdown={deferredMarkdown}
            activeBracketMatch={activeBracketMatch}
            zoomLevel={zoomLevel}
          />
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full font-mono text-sm resize-none outline-none p-4 pt-4 pb-4 leading-5 bg-transparent text-transparent caret-gray-900 dark:caret-white focus:ring-2 focus:ring-inset focus:ring-blue-500/30"
            style={{ fontSize: `${zoomLevel}%` }}
            value={markdown}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onMouseDown={handleColumnMouseDown}
            onMouseMove={handleColumnMouseMove}
            onMouseUp={handleColumnMouseUp}
            onMouseLeave={handleColumnMouseUp}
            placeholder="# Start writing your markdown..."
            spellCheck={false}
            aria-label="Markdown editor. Enter markdown content here."
            aria-describedby="editor-stats"
            aria-autocomplete="list"
            aria-controls={showAutoComplete ? 'autocomplete-list' : undefined}
            aria-expanded={showAutoComplete}
          />
          
          {/* Auto-complete suggestions */}
          {showAutoComplete && (
            <div
              id="autocomplete-list"
              className="absolute z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              style={{
                bottom: '100%',
                left: '1rem',
                marginBottom: '0.5rem',
              }}
              role="listbox"
              aria-label="Markdown syntax suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.label}
                  className={`
                    w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-4
                    ${index === selectedIndex 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                  `}
                  onClick={() => insertSuggestion(suggestion)}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <span className="font-medium">{suggestion.label}</span>
                  {suggestion.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <span className="text-blue-500">{Icons.drag}</span>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Drop markdown file here</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
        <div id="editor-stats" className="flex items-center gap-4 text-xs text-secondary" aria-label="Editor statistics">
          <span>{markdown.length} characters</span>
          <span>{markdown.split(/\s+/).filter(Boolean).length} words</span>
          <span>{markdown.split('\n').length} lines</span>
        </div>
        <div className="text-xs text-secondary opacity-60">Tab size: 2 spaces</div>
      </div>
    </div>
  );
});

EditorPanel.displayName = 'EditorPanel';
