'use client';

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useMarkdownState } from '@/hooks/useMarkdownState';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useLayout } from '@/contexts/LayoutContext';
import { useCommandPalette, Command } from '@/hooks/useCommandPalette';
import { EditorPanel, EditorPanelRef } from './EditorPanel';
import { PreviewPanel, PreviewPanelRef } from './PreviewPanel';
import { LayoutControls } from './LayoutControls';
import { Resizer } from './Resizer';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { CommandPalette } from './CommandPalette';
import { APP_CONFIG } from '@/constants/config';
import { Icons } from '@/constants/icons';

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
    toggleFullscreen,
    toggleReadingMode,
    setEditorWidth,
    setLayoutMode,
    toggleSyncScroll,
    setZoomLevel,
    resetLayout,
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

  // Define all available commands
  const commands = useMemo<Command[]>(() => [
    {
      id: 'file-new',
      label: 'New Document',
      description: 'Clear the editor and start fresh',
      shortcut: 'Ctrl+Shift+N',
      icon: Icons.document,
      action: handleClear,
      category: 'File',
    },
    {
      id: 'file-download',
      label: 'Download Markdown',
      description: 'Save current document as .md file',
      shortcut: 'Ctrl+S',
      icon: Icons.download,
      action: downloadMarkdown,
      category: 'File',
    },
    {
      id: 'file-export-html',
      label: 'Export as HTML',
      description: 'Export formatted preview as HTML',
      icon: Icons.code,
      action: exportAsHtml,
      category: 'File',
    },
    {
      id: 'file-export-pdf',
      label: 'Export as PDF',
      description: 'Export formatted preview as PDF',
      icon: Icons.file,
      action: exportAsPdf,
      category: 'File',
    },
    {
      id: 'view-fullscreen',
      label: 'Toggle Fullscreen',
      description: 'Enter or exit fullscreen mode',
      shortcut: 'F11',
      icon: Icons.fullscreen,
      action: toggleFullscreen,
      category: 'View',
    },
    {
      id: 'view-reading',
      label: 'Toggle Reading Mode',
      description: 'Show preview only',
      icon: Icons.readingMode,
      action: toggleReadingMode,
      category: 'View',
    },
    {
      id: 'view-sync-scroll',
      label: 'Toggle Sync Scroll',
      description: 'Synchronize editor and preview scrolling',
      icon: Icons.syncScroll,
      action: toggleSyncScroll,
      category: 'View',
    },
    {
      id: 'view-zoom-in',
      label: 'Zoom In',
      description: 'Increase preview zoom level',
      shortcut: 'Ctrl++',
      icon: Icons.zoomIn,
      action: () => setZoomLevel(zoomLevel + 10),
      category: 'View',
    },
    {
      id: 'view-zoom-out',
      label: 'Zoom Out',
      description: 'Decrease preview zoom level',
      shortcut: 'Ctrl+-',
      icon: Icons.zoomOut,
      action: () => setZoomLevel(zoomLevel - 10),
      category: 'View',
    },
    {
      id: 'view-zoom-reset',
      label: 'Reset Zoom',
      description: 'Reset zoom to 100%',
      shortcut: 'Ctrl+0',
      action: () => setZoomLevel(100),
      category: 'View',
    },
    {
      id: 'layout-split',
      label: 'Split Layout',
      description: 'Show editor and preview side by side',
      icon: Icons.split,
      action: () => setLayoutMode('split'),
      category: 'Layout',
    },
    {
      id: 'layout-stacked',
      label: 'Stacked Layout',
      description: 'Show editor above preview',
      icon: Icons.stacked,
      action: () => setLayoutMode('stacked'),
      category: 'Layout',
    },
    {
      id: 'layout-tabbed',
      label: 'Tabbed Layout',
      description: 'Switch between editor and preview',
      icon: Icons.tabbed,
      action: () => setLayoutMode('tabbed'),
      category: 'Layout',
    },
    {
      id: 'edit-find',
      label: 'Find and Replace',
      description: 'Search and replace text',
      shortcut: 'Ctrl+F',
      icon: Icons.search,
      action: () => {
        // Focus editor and trigger find
        editorRef.current?.scrollToPercentage(0);
      },
      category: 'Edit',
    },
    {
      id: 'edit-reset',
      label: 'Reset to Example',
      description: 'Load example markdown',
      icon: Icons.reset,
      action: handleReset,
      category: 'Edit',
    },
    {
      id: 'app-help',
      label: 'Open GitHub',
      description: 'View source code on GitHub',
      icon: Icons.logo,
      action: () => window.open(APP_CONFIG.github.url, '_blank'),
      category: 'Help',
    },
  ], [handleClear, downloadMarkdown, exportAsHtml, exportAsPdf, toggleFullscreen, toggleReadingMode, toggleSyncScroll, zoomLevel, setZoomLevel, setLayoutMode, handleReset]);

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

  // Helper functions to get layout classes and styles
  const getMainClass = useCallback(() => {
    if (readingMode) return 'flex-1 overflow-hidden';
    if (fullscreen) return 'flex-1 overflow-hidden';
    if (layoutMode === 'stacked') return 'flex-1 flex flex-col overflow-hidden';
    if (layoutMode === 'tabbed') return 'flex-1 flex flex-col overflow-hidden';
    return 'flex-1 flex overflow-hidden'; // split
  }, [readingMode, fullscreen, layoutMode]);

  const getEditorWrapperStyle = useCallback(() => {
    if (layoutMode === 'split') {
      return { width: `${editorWidth}%` };
    }
    return {};
  }, [editorWidth, layoutMode]);

  const getPreviewWrapperStyle = useCallback(() => {
    if (layoutMode === 'split') {
      return { width: `${100 - editorWidth}%` };
    }
    return {};
  }, [editorWidth, layoutMode]);

  const getEditorWrapperClass = useCallback(() => {
    if (readingMode) return 'hidden';
    if (layoutMode === 'tabbed') {
      return activeTab === 'editor' ? 'flex-1' : 'hidden';
    }
    if (layoutMode === 'stacked') return 'flex-1 min-h-0';
    return 'min-w-0 overflow-hidden'; // split
  }, [readingMode, layoutMode, activeTab]);

  const getPreviewWrapperClass = useCallback(() => {
    if (layoutMode === 'tabbed') {
      return activeTab === 'preview' ? 'flex-1' : 'hidden';
    }
    if (layoutMode === 'stacked') return 'flex-1 min-h-0';
    return 'min-w-0 overflow-hidden'; // split
  }, [layoutMode, activeTab]);

  const getContainerClass = useCallback(() => {
    if (fullscreen) return 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col';
    return 'flex flex-col h-screen w-full relative';
  }, [fullscreen]);

  return (
    <div className={getContainerClass()}>
      {/* Header - hidden in fullscreen */}
      {!fullscreen && (
        <Header
          onToggleFullscreen={toggleFullscreen}
          onToggleReadingMode={toggleReadingMode}
          githubUrl={APP_CONFIG.github.url}
        />
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
      {layoutMode === 'tabbed' && !readingMode && <TabBar />}

      {/* Main Content Area */}
      <main id="main-content" className={getMainClass()}>
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
                syncScrollActive={syncScroll}
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
                syncScrollActive={syncScroll}
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
                syncScrollActive={syncScroll}
              />
            </div>
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
        onSelect={(index) => {}}
        onExecute={executeSelectedCommand}
        onClose={closeCommandPalette}
        onSelectNext={selectNextCommand}
        onSelectPrev={selectPrevCommand}
      />
    </div>
  );
};

export default MarkdownPreview;
