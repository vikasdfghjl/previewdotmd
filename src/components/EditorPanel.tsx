import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, useDeferredValue } from 'react';
import { ActionButton } from './ActionButton';
import { PanelHeader } from './PanelHeader';
import { FindReplace } from './FindReplace';
import { SyntaxHighlightOverlay } from './SyntaxHighlightOverlay';
import { FormattingToolbar } from './FormattingToolbar';
import { ConfirmDialog } from './ConfirmDialog';
import { StorageNotice } from './StorageNotice';
import { DragDropHint } from './DragDropHint';
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
  /** Set when a dropped/selected file fails the .md/.markdown check; shown as a dismissible toast. */
  uploadError?: string | null;
  onDismissUploadError?: () => void;
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
  uploadError = null,
  onDismissUploadError,
  ref,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const isScrollingRef = useRef(false);

  // Bracket matching scans the full document, so defer it to avoid blocking
  // keystrokes on large documents. The syntax overlay itself must stay in sync
  // with the textarea (its text is what the user sees), so it gets `markdown`.
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
      if (scrollRef.current) {
        scrollToPercentage(scrollRef.current, percentage, isScrollingRef);
      }
    },
  }));

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingRef.current) {
      onScroll?.(getScrollPercentage(scrollRef.current));
    }
  }, [onScroll]);

  // Scrolls the caret's line into view. The textarea doesn't scroll itself
  // (the shared container does), so the browser won't do this for us.
  const scrollCaretLineIntoView = useCallback(() => {
    const textarea = textareaRef.current;
    const container = scrollRef.current;
    if (!textarea || !container) return;
    const line = textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1;
    const row = container.querySelectorAll('.editor-line')[line];
    row?.scrollIntoView({ block: 'nearest' });
  }, []);

  // Handle cursor position change for bracket matching + caret visibility
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
      scrollCaretLineIntoView();
    }
  }, [markdown, handleBracketCursorChange, scrollCaretLineIntoView]);

  // After each edit, keep the caret's line visible once the overlay rows
  // have re-rendered for the new content.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && document.activeElement === textarea) {
      scrollCaretLineIntoView();
    }
  }, [markdown, scrollCaretLineIntoView]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keyup', handleCursorChange);
      textarea.addEventListener('click', handleCursorChange);
      return () => {
        textarea.removeEventListener('keyup', handleCursorChange);
        textarea.removeEventListener('click', handleCursorChange);
      };
    }
  }, [handleCursorChange]);

  // Keep the active find/replace match visible when match navigation
  // moves the selection.
  useEffect(() => {
    if (!findReplaceOpen || matchCount === 0) return;
    scrollCaretLineIntoView();
  }, [findReplaceOpen, currentMatch, matchCount, scrollCaretLineIntoView]);

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
      <div className="relative">
        <ActionButton onClick={() => fileInputRef.current?.click()} title="Upload markdown file">
          <div className="flex items-center gap-1.5">{Icons.upload}<span className="hidden sm:inline">Upload</span></div>
        </ActionButton>
        <DragDropHint />
      </div>
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
        showTitle={false}
      />

      <input ref={fileInputRef} type="file" accept=".md,.markdown" onChange={handleFileSelect} className="hidden" />

      <FormattingToolbar
        textareaRef={textareaRef}
        markdown={markdown}
        onChange={onChange}
      />

      {/* Docked in normal flow (not an overlay) so it pushes the editor down
          instead of covering the very matches it's helping you find. */}
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
        className="flex-1 relative overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Shared scroll container — the overlay (visible text + line numbers)
            defines the content height and the textarea stretches over it, so
            one scrollbar serves both layers and they can never drift apart. */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-auto"
        >
          <div className="relative min-h-full">
            {/* Gutter background strip behind the line numbers */}
            <div
              className="absolute inset-y-0 left-0 w-12 bg-gray-50/50 dark:bg-gray-800/30 pointer-events-none"
              aria-hidden="true"
            />
            <SyntaxHighlightOverlay
              markdown={markdown}
              activeBracketMatch={activeBracketMatch}
              zoomLevel={zoomLevel}
            />
            {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
            <textarea
              ref={textareaRef}
              className="editor-text absolute inset-0 w-full h-full resize-none outline-none overflow-hidden py-4 pr-4 pl-16 bg-transparent text-transparent caret-gray-900 dark:caret-white"
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
          </div>
        </div>

        {/* Auto-complete suggestions — anchored to the panel, not the scrolling content */}
        {showAutoComplete && (
          <div
            id="autocomplete-list"
            className="absolute bottom-2 left-16 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
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

        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <span className="text-blue-500">{Icons.drag}</span>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Drop markdown file here</p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div
          role="alert"
          className="flex items-center gap-3 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
        >
          <span>⚠️ {uploadError}</span>
          <button
            onClick={onDismissUploadError}
            className="ml-auto px-2 py-0.5 pointer-coarse:min-h-11 pointer-coarse:px-3 rounded bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-800 dark:text-red-200 font-medium transition-colors flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* One-time notice about local-only storage — full-width banner above the stats row. */}
      <StorageNotice />

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
        <div className="text-xs text-secondary">Tab size: 2 spaces</div>
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
