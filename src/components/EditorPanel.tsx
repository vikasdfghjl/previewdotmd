import React, { useRef, useState, useEffect, useMemo, useCallback, useImperativeHandle, useDeferredValue } from 'react';
import { ActionButton } from './ActionButton';
import { PanelHeader } from './PanelHeader';
import { FindReplace } from './FindReplace';
import { SyntaxHighlightOverlay } from './SyntaxHighlightOverlay';
import { FormattingToolbar } from './FormattingToolbar';
import { ConfirmDialog } from './ConfirmDialog';
import { StorageNotice } from './StorageNotice';
import { useFindReplace } from '@/hooks/useFindReplace';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { useBracketMatching } from '@/hooks/useBracketMatching';
import { useSmartTyping } from '@/hooks/useSmartTyping';
import { useColumnSelection } from '@/hooks/useColumnSelection';
import { useAutoComplete } from '@/hooks/useAutoComplete';
import { scrollToPercentage, getScrollPercentage } from '@/lib/scroll';
import { Icons } from '@/constants/icons';

interface EditorPanelProps {
  markdown: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onReset: () => void;
  isVisible: boolean;
  onToggle?: () => void;
  onFileUpload?: (file: File) => void;
  onDownload?: () => void;
  onScroll?: (percentage: number) => void;
  zoomLevel?: number;
  lastSaved?: Date | null;
  isDirty?: boolean;
  storageWarning?: boolean;
}

export interface EditorPanelRef {
  scrollToPercentage: (percentage: number) => void;
}

/** Returns a human-readable relative time string (e.g. "just now", "2 min ago"). */
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const EditorPanel = React.memo<EditorPanelProps & { ref?: React.Ref<EditorPanelRef> }>(({
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
  lastSaved = null,
  isDirty = false,
  storageWarning = false,
  ref,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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

  // Bracket matching — scans the full document, so defer it like the
  // syntax overlay to avoid blocking keystrokes on large documents.
  const {
    activeMatch: activeBracketMatch,
    handleCursorChange: handleBracketCursorChange,
  } = useBracketMatching(deferredMarkdown);

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
      if (textareaRef.current) {
        scrollToPercentage(textareaRef.current, percentage, isScrollingRef);
      }
    },
  }));

  const lineCount = useMemo(() => markdown.split('\n').length || 1, [markdown]);
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (textareaRef.current && !isScrollingRef.current) {
      onScroll?.(getScrollPercentage(textareaRef.current));
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
        <div className="flex items-center gap-1.5">{Icons.upload}<span className="hidden sm:inline">Upload</span></div>
      </ActionButton>
      <ActionButton onClick={toggleFindReplace} title="Find & Replace (Ctrl+F)">
        <div className="flex items-center gap-1.5">{Icons.search}<span className="hidden sm:inline">Find</span></div>
      </ActionButton>
      {onDownload && (
        <ActionButton onClick={onDownload} title="Download markdown file">
          <div className="flex items-center gap-1.5">{Icons.download}<span className="hidden sm:inline">Download</span></div>
        </ActionButton>
      )}
      <ActionButton onClick={() => setShowClearConfirm(true)} title="Clear all markdown content" variant="danger">
        <div className="flex items-center gap-1.5">{Icons.trash}<span className="hidden sm:inline">Clear All</span></div>
      </ActionButton>
      <ActionButton onClick={onReset} title="Load the demo example document">
        <div className="flex items-center gap-1.5">{Icons.reset}<span className="hidden sm:inline">Load Example</span></div>
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

      <FormattingToolbar
        textareaRef={textareaRef}
        markdown={markdown}
        onChange={onChange}
      />

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
          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
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
        <div id="editor-stats" className="flex items-center gap-4 text-xs text-secondary flex-wrap" aria-label="Editor statistics">
          <span>{markdown.length} characters</span>
          <span>{markdown.split(/\s+/).filter(Boolean).length} words</span>
          <span>{markdown.split('\n').length} lines</span>
          {/* Auto-save status indicator */}
          <span className="flex items-center gap-1.5" aria-live="polite">
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
            {isDirty ? (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            ) : lastSaved ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Saved {formatRelativeTime(lastSaved)}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            )}
          </span>
          {storageWarning && (
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1" title="Browser storage is full or unavailable. Your content won't be saved.">
              ⚠️ Storage full
            </span>
          )}
        </div>
        {/* One-time notice about local-only storage */}
        <StorageNotice />
        <div className="text-xs text-secondary opacity-60">Tab size: 2 spaces</div>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear all content?"
        message="This will permanently clear the editor. Your content is auto-saved to this browser and can be recovered by reloading the page if you haven't typed since the last save."
        confirmLabel="Clear All"
        cancelLabel="Keep Content"
        variant="danger"
        onConfirm={() => {
          onClear();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
});

EditorPanel.displayName = 'EditorPanel';
