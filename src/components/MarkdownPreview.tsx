'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useMarkdownState } from '@/hooks/useMarkdownState';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useLayout } from '@/contexts/LayoutContext';
import { EditorPanel, EditorPanelRef } from './EditorPanel';
import { PreviewPanel, PreviewPanelRef } from './PreviewPanel';
import { DarkModeToggle } from './DarkModeToggle';
import { LayoutControls } from './LayoutControls';
import { Resizer } from './Resizer';
import { APP_CONFIG } from '@/constants/config';

const MarkdownPreview: React.FC = () => {
  const { markdown, handleChange, handleClear, handleReset } = useMarkdownState();
  const {
    layoutMode,
    syncScroll,
    fullscreen,
    readingMode,
    zoomLevel,
    activeTab,
    editorWidth,
    setActiveTab,
    toggleFullscreen,
    toggleReadingMode,
    setEditorWidth,
  } = useLayout();

  const editorRef = useRef<EditorPanelRef>(null);
  const previewRef = useRef<PreviewPanelRef>(null);

  const {
    handleFileUpload,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    exportAsPlainText,
  } = useFileOperations({ markdown, onMarkdownChange: handleChange });

  // Sync scroll handlers
  const handleEditorScroll = useCallback((percentage: number) => {
    if (syncScroll) {
      previewRef.current?.scrollToPercentage(percentage);
    }
  }, [syncScroll]);

  const handlePreviewScroll = useCallback((percentage: number) => {
    if (syncScroll) {
      editorRef.current?.scrollToPercentage(percentage);
    }
  }, [syncScroll]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 or Ctrl+Shift+F for fullscreen
      if (e.key === 'F11' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        toggleFullscreen();
      }
      // Escape to exit fullscreen or reading mode
      if (e.key === 'Escape') {
        if (fullscreen) toggleFullscreen();
        if (readingMode) toggleReadingMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen, readingMode, toggleFullscreen, toggleReadingMode]);

  // Get layout container class
  const getMainClass = () => {
    if (readingMode) return 'flex-1 overflow-hidden';
    if (fullscreen) return 'flex-1 overflow-hidden';
    if (layoutMode === 'stacked') return 'flex-1 flex flex-col overflow-hidden';
    if (layoutMode === 'tabbed') return 'flex-1 flex flex-col overflow-hidden';
    return 'flex-1 flex overflow-hidden'; // split
  };

  const getEditorWrapperStyle = () => {
    if (layoutMode === 'split') {
      return { width: `${editorWidth}%` };
    }
    return {};
  };

  const getPreviewWrapperStyle = () => {
    if (layoutMode === 'split') {
      return { width: `${100 - editorWidth}%` };
    }
    return {};
  };

  const getEditorWrapperClass = () => {
    if (readingMode) return 'hidden';
    if (layoutMode === 'tabbed') {
      return activeTab === 'editor' ? 'flex-1' : 'hidden';
    }
    if (layoutMode === 'stacked') return 'flex-1 min-h-0';
    return 'min-w-0 overflow-hidden'; // split
  };

  const getPreviewWrapperClass = () => {
    if (layoutMode === 'tabbed') {
      return activeTab === 'preview' ? 'flex-1' : 'hidden';
    }
    if (layoutMode === 'stacked') return 'flex-1 min-h-0';
    return 'min-w-0 overflow-hidden'; // split
  };

  const getContainerClass = () => {
    if (fullscreen) return 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col';
    return 'flex flex-col h-screen w-full relative';
  };

  return (
    <div className={getContainerClass()}>
      {/* Header - hidden in fullscreen */}
      {!fullscreen && (
        <header className="panel-header flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-primary tracking-tight">
                Preview<span className="text-blue-500">.md</span>
              </h1>
            </div>

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 bg-blue-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-secondary">
                Live editing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Layout Controls */}
            <LayoutControls className="hidden md:flex" />

            {/* Keyboard shortcuts hint */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-secondary font-mono">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">B</kbd>
              <span className="ml-1">Toggle panels</span>
            </div>

            {/* GitHub repository link */}
            <a
              href={APP_CONFIG.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>

            <DarkModeToggle />
          </div>
        </header>
      )}

      {/* Fullscreen exit button */}
      {fullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-gray-800/80 text-white hover:bg-gray-800 transition-colors"
          title="Exit fullscreen (Escape)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Tab bar for tabbed mode */}
      {layoutMode === 'tabbed' && !readingMode && (
        <div className="flex border-b bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'editor'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editor
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </div>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className={getMainClass()}>
        {layoutMode === 'stacked' ? (
          <>
            {/* Editor Panel - Stacked */}
            <div className={`${getEditorWrapperClass()} ${readingMode ? '' : 'border-b'}`}>
              <EditorPanel
                ref={editorRef}
                markdown={markdown}
                onChange={handleChange}
                onClear={handleClear}
                onReset={handleReset}
                isVisible={true}
                onToggle={() => {}}
                onFileUpload={handleFileUpload}
                onDownload={downloadMarkdown}
                onScroll={handleEditorScroll}
              />
            </div>

            {/* Preview Panel - Stacked */}
            <div className={getPreviewWrapperClass()}>
              <PreviewPanel
                ref={previewRef}
                markdown={markdown}
                isVisible={true}
                onToggle={() => {}}
                onExportHtml={exportAsHtml}
                onExportPdf={exportAsPdf}
                onExportPlainText={exportAsPlainText}
                zoomLevel={zoomLevel}
                onScroll={handlePreviewScroll}
              />
            </div>
          </>
        ) : layoutMode === 'split' ? (
          <>
            {/* Editor Panel - Split */}
            <div className={getEditorWrapperClass()} style={getEditorWrapperStyle()}>
              <EditorPanel
                ref={editorRef}
                markdown={markdown}
                onChange={handleChange}
                onClear={handleClear}
                onReset={handleReset}
                isVisible={true}
                onToggle={() => {}}
                onFileUpload={handleFileUpload}
                onDownload={downloadMarkdown}
                onScroll={handleEditorScroll}
              />
            </div>

            {/* Resizer */}
            <Resizer
              onResize={setEditorWidth}
              minPercent={10}
              maxPercent={90}
            />

            {/* Preview Panel - Split */}
            <div className={getPreviewWrapperClass()} style={getPreviewWrapperStyle()}>
              <PreviewPanel
                ref={previewRef}
                markdown={markdown}
                isVisible={true}
                onToggle={() => {}}
                onExportHtml={exportAsHtml}
                onExportPdf={exportAsPdf}
                onExportPlainText={exportAsPlainText}
                zoomLevel={zoomLevel}
                onScroll={handlePreviewScroll}
              />
            </div>
          </>
        ) : (
          <>
            {/* Editor Panel - Tabbed */}
            <div className={getEditorWrapperClass()}>
              <EditorPanel
                ref={editorRef}
                markdown={markdown}
                onChange={handleChange}
                onClear={handleClear}
                onReset={handleReset}
                isVisible={true}
                onToggle={() => {}}
                onFileUpload={handleFileUpload}
                onDownload={downloadMarkdown}
                onScroll={handleEditorScroll}
              />
            </div>

            {/* Preview Panel - Tabbed */}
            <div className={getPreviewWrapperClass()}>
              <PreviewPanel
                ref={previewRef}
                markdown={markdown}
                isVisible={true}
                onToggle={() => {}}
                onExportHtml={exportAsHtml}
                onExportPdf={exportAsPdf}
                onExportPlainText={exportAsPlainText}
                zoomLevel={zoomLevel}
                onScroll={handlePreviewScroll}
              />
            </div>
          </>
        )}
      </main>

      {/* Mobile layout controls */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <LayoutControls className="flex bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1" />
      </div>
    </div>
  );
};

export default MarkdownPreview;
