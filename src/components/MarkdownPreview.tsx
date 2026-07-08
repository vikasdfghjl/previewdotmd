'use client';

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useMarkdownState } from '@/hooks/useMarkdownState';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useLayout } from '@/contexts/LayoutContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { EditorPanel, EditorPanelRef } from './EditorPanel';
import { PreviewPanel, PreviewPanelRef } from './PreviewPanel';
import { LayoutControls } from './LayoutControls';
import { Resizer } from './Resizer';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { CommandPalette } from './CommandPalette';
import { APP_CONFIG } from '@/constants/config';
import { Icons } from '@/constants/icons';
import { createCommands } from '@/constants/commands';

const MarkdownPreview: React.FC = () => {
  const { markdown, previewMarkdown, handleChange, handleClear, handleReset, lastSaved, isDirty, storageWarning } = useMarkdownState();
  const {
    layoutMode,
    syncScroll,
    fullscreen,
    readingMode,
    zoomLevel,
    activeTab,
    editorWidth,
    toggleFullscreen,
    toggleReadingMode,
    setEditorWidth,
    setLayoutMode,
    toggleSyncScroll,
    setZoomLevel,
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

  // Define all available commands (extracted — see src/constants/commands.tsx)
  const commands = useMemo(() => createCommands({
    handleClear,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    toggleFullscreen,
    toggleReadingMode,
    toggleSyncScroll,
    setZoomLevel,
    setLayoutMode,
    handleReset,
  }), [
    handleClear,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    toggleFullscreen,
    toggleReadingMode,
    toggleSyncScroll,
    setZoomLevel,
    setLayoutMode,
    handleReset,
  ]);

  // Command palette hook
  const {
    isOpen: commandPaletteOpen,
    query: commandQuery,
    filteredCommands,
    selectedIndex: selectedCommandIndex,
    setQuery: setCommandQuery,
    selectNext: selectNextCommand,
    selectPrev: selectPrevCommand,
    executeSelected: executeSelectedCommand,
    close: closeCommandPalette,
  } = useCommandPalette({ commands });

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

  // Layout configuration — single useMemo replaces 4 separate useCallbacks
  const layoutConfig = useMemo(() => ({
    containerClass: fullscreen
      ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col'
      : 'flex flex-col h-dvh w-full relative',
    mainClass: (readingMode || fullscreen || layoutMode === 'split')
      ? 'flex-1 flex overflow-hidden'
      : 'flex-1 flex flex-col overflow-hidden',
    editorStyle: layoutMode === 'split' ? { width: `${editorWidth}%` } : ({} as React.CSSProperties),
    previewStyle: layoutMode === 'split' ? { width: `${100 - editorWidth}%` } : ({} as React.CSSProperties),
  }), [readingMode, fullscreen, layoutMode, editorWidth]);

  return (
    <div className={layoutConfig.containerClass}>
      {/* Header - hidden in fullscreen */}
      {!fullscreen && (
        <Header
          githubUrl={APP_CONFIG.github.url}
        />
      )}

      {/* Fullscreen exit button */}
      {fullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-gray-800/80 text-white hover:bg-gray-800 transition-colors"
          title="Exit fullscreen (Escape)"
          aria-label="Exit fullscreen"
        >
          <span className="w-5 h-5">{Icons.close}</span>
        </button>
      )}

      {/* Tab bar for tabbed mode */}
      {layoutMode === 'tabbed' && !readingMode && <TabBar />}

      {/* Main Content Area */}
      <main id="main-content" className={layoutConfig.mainClass}>
        {layoutMode === 'stacked' ? (
          <>
            {/* Editor Panel - Stacked (skip mount entirely in reading mode) */}
            {!readingMode && (
              <div className="flex-1 min-h-0 border-b">
                <EditorPanel
                  ref={editorRef}
                  markdown={markdown}
                  onChange={handleChange}
                  onClear={handleClear}
                  onReset={handleReset}
                  isVisible={true}
                  onFileUpload={handleFileUpload}
                  onDownload={downloadMarkdown}
                  onScroll={handleEditorScroll}
                  zoomLevel={zoomLevel}
                  lastSaved={lastSaved}
                  isDirty={isDirty}
                  storageWarning={storageWarning}
                />
              </div>
            )}

            {/* Preview Panel - Stacked */}
            <div className="flex-1 min-h-0">
              <PreviewPanel
                ref={previewRef}
                markdown={previewMarkdown}
                isVisible={true}
                onExportHtml={exportAsHtml}
                onExportPdf={exportAsPdf}
                onExportPlainText={exportAsPlainText}
                zoomLevel={zoomLevel}
                onScroll={handlePreviewScroll}
                syncScrollActive={syncScroll}
              />
            </div>
          </>
        ) : layoutMode === 'split' ? (
          <>
            {/* Editor Panel - Split (skip mount entirely in reading mode) */}
            {!readingMode && (
              <div className="min-w-0 overflow-hidden" style={layoutConfig.editorStyle}>
                <EditorPanel
                  ref={editorRef}
                  markdown={markdown}
                  onChange={handleChange}
                  onClear={handleClear}
                  onReset={handleReset}
                  isVisible={true}
                  onFileUpload={handleFileUpload}
                  onDownload={downloadMarkdown}
                  onScroll={handleEditorScroll}
                  zoomLevel={zoomLevel}
                  lastSaved={lastSaved}
                  isDirty={isDirty}
                  storageWarning={storageWarning}
                />
              </div>
            )}

            {/* Resizer */}
            {!readingMode && (
              <Resizer
                onResize={setEditorWidth}
                minPercent={10}
                maxPercent={90}
              />
            )}

            {/* Preview Panel - Split */}
            <div className="min-w-0 overflow-hidden" style={readingMode ? undefined : layoutConfig.previewStyle}>
              <PreviewPanel
                ref={previewRef}
                markdown={previewMarkdown}
                isVisible={true}
                onExportHtml={exportAsHtml}
                onExportPdf={exportAsPdf}
                onExportPlainText={exportAsPlainText}
                zoomLevel={zoomLevel}
                onScroll={handlePreviewScroll}
                syncScrollActive={syncScroll}
              />
            </div>
          </>
        ) : (
          <>
            {/* Editor Panel - Tabbed (skip mount when preview tab is active) */}
            {activeTab === 'editor' && !readingMode && (
              <div className="flex-1">
                <EditorPanel
                  ref={editorRef}
                  markdown={markdown}
                  onChange={handleChange}
                  onClear={handleClear}
                  onReset={handleReset}
                  isVisible={true}
                  onFileUpload={handleFileUpload}
                  onDownload={downloadMarkdown}
                  onScroll={handleEditorScroll}
                  zoomLevel={zoomLevel}
                  lastSaved={lastSaved}
                  isDirty={isDirty}
                  storageWarning={storageWarning}
                />
              </div>
            )}

            {/* Preview Panel - Tabbed (skip mount when editor tab is active) */}
            {activeTab === 'preview' && (
              <div className="flex-1">
                <PreviewPanel
                  ref={previewRef}
                  markdown={previewMarkdown}
                  isVisible={true}
                  onExportHtml={exportAsHtml}
                  onExportPdf={exportAsPdf}
                  onExportPlainText={exportAsPlainText}
                  zoomLevel={zoomLevel}
                  onScroll={handlePreviewScroll}
                  syncScrollActive={syncScroll}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile layout controls */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <LayoutControls className="flex bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1" />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        query={commandQuery}
        commands={filteredCommands}
        selectedIndex={selectedCommandIndex}
        onQueryChange={setCommandQuery}
        onSelect={() => {}}
        onExecute={executeSelectedCommand}
        onClose={closeCommandPalette}
        onSelectNext={selectNextCommand}
        onSelectPrev={selectPrevCommand}
      />
    </div>
  );
};

export default MarkdownPreview;
