import React, { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ActionButton } from './ActionButton';
import { PanelHeader } from './PanelHeader';
import { FindReplace } from './FindReplace';
import { SyntaxHighlightOverlay } from './SyntaxHighlightOverlay';

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
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const isScrollingRef = useRef(false);

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

  const lineCount = useMemo(() => {
    return markdown.split('\n').length || 1;
  }, [markdown]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

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

  // Find/Replace functions
  const handleFind = useCallback((query: string) => {
    if (!query) {
      setMatches([]);
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const foundMatches: number[] = [];
    let index = 0;
    const lowerMarkdown = markdown.toLowerCase();
    const lowerQuery = query.toLowerCase();

    while ((index = lowerMarkdown.indexOf(lowerQuery, index)) !== -1) {
      foundMatches.push(index);
      index += 1;
    }

    setMatches(foundMatches);
    setMatchCount(foundMatches.length);
    setCurrentMatch(foundMatches.length > 0 ? 1 : 0);
  }, [markdown]);

  const handleReplace = useCallback((query: string, replacement: string, replaceAll: boolean) => {
    if (!query) return;

    if (replaceAll) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      onChange(markdown.replace(regex, replacement));
      setMatches([]);
      setMatchCount(0);
      setCurrentMatch(0);
    } else if (matches.length > 0 && currentMatch > 0) {
      const matchIndex = matches[currentMatch - 1];
      const newContent = markdown.slice(0, matchIndex) + replacement + markdown.slice(matchIndex + query.length);
      onChange(newContent);
    }
  }, [markdown, onChange, matches, currentMatch]);

  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const nextMatch = currentMatch >= matches.length ? 1 : currentMatch + 1;
    setCurrentMatch(nextMatch);
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(matches[nextMatch - 1], matches[nextMatch - 1] + 1);
      textareaRef.current.focus();
    }
  }, [matches, currentMatch]);

  const goToPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prevMatch = currentMatch <= 1 ? matches.length : currentMatch - 1;
    setCurrentMatch(prevMatch);
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(matches[prevMatch - 1], matches[prevMatch - 1] + 1);
      textareaRef.current.focus();
    }
  }, [matches, currentMatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
      if (e.key === 'Escape') {
        setFindReplaceOpen(false);
      }

      // Markdown formatting shortcuts when textarea is focused
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdown.slice(start, end);

        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
          e.preventDefault();
          const wrapped = `**${selectedText}**`;
          onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 2, end + 2);
          }, 0);
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          const wrapped = `*${selectedText}*`;
          onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 1, end + 1);
          }, 0);
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const wrapped = `[${selectedText}](url)`;
          onChange(markdown.slice(0, start) + wrapped + markdown.slice(end));
          setTimeout(() => {
            if (selectedText) {
              textarea.setSelectionRange(start + wrapped.length - 1, start + wrapped.length - 4);
            } else {
              textarea.setSelectionRange(start + 1, end + 1);
            }
          }, 0);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [markdown, onChange]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

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
      <ActionButton
        onClick={() => fileInputRef.current?.click()}
        title="Upload markdown file"
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload</span>
        </div>
      </ActionButton>
      <ActionButton
        onClick={() => setFindReplaceOpen(!findReplaceOpen)}
        title="Find & Replace (Ctrl+F)"
      >
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Find</span>
        </div>
      </ActionButton>
      {onDownload && (
        <ActionButton
          onClick={onDownload}
          title="Download markdown file"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </div>
        </ActionButton>
      )}
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
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Editor container with line numbers */}
      <div 
        className="flex-1 relative flex overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Find & Replace panel */}
        <FindReplace
          isOpen={findReplaceOpen}
          onClose={() => setFindReplaceOpen(false)}
          onFind={handleFind}
          onReplace={handleReplace}
          matchCount={matchCount}
          currentMatch={currentMatch}
          onNext={goToNextMatch}
          onPrev={goToPrevMatch}
        />
        {/* Line numbers gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 flex-shrink-0 overflow-hidden text-right pr-2 pt-4 pb-4 font-mono text-xs text-gray-400 dark:text-gray-500 select-none bg-gray-50/50 dark:bg-gray-800/30"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5 h-5">
              {num}
            </div>
          ))}
        </div>

        {/* Editor textarea with syntax highlighting */}
        <div className="flex-1 relative">
          <SyntaxHighlightOverlay markdown={markdown} />
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full font-mono text-sm resize-none outline-none p-4 pt-4 pb-4 leading-5 bg-transparent text-transparent caret-gray-900 dark:caret-white"
            value={markdown}
            onChange={handleChange}
            placeholder={"# Start writing your markdown...\n\n## Features\n- **Bold** and *italic* text\n- Lists and tables\n- Code blocks with syntax highlighting\n\n```javascript\nconsole.log('Hello World!');\n```\n\n> Beautiful, formatted preview appears on the right"}
            spellCheck={false}
          />
        </div>
        
        {/* Drag and drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Drop markdown file here</p>
            </div>
          </div>
        )}
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
});

EditorPanel.displayName = 'EditorPanel';