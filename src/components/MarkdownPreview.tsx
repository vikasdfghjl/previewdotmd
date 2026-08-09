'use client';

import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { useMarkdownState } from '@/hooks/useMarkdownState';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useLayout } from '@/contexts/LayoutContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { OnboardingHintProvider } from '@/contexts/OnboardingHintContext';
import { EditorPanel, EditorPanelRef } from './EditorPanel';
import { PreviewPanel, PreviewPanelRef } from './PreviewPanel';
import { LayoutControls } from './LayoutControls';
import { Resizer } from './Resizer';
import { Header } from './Header';
import { TabBar, tabPanelId } from './TabBar';
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
    uploadError,
    dismissUploadError,
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
    open: openCommandPalette,
  } = useCommandPalette({ commands });

  // Tracks whether the palette has ever been opened, so the onboarding hint
  // in Header dismisses itself once the user finds the feature on their own.
  const [hasOpenedCommandPalette, setHasOpenedCommandPalette] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-way ratchet on a prop, not derivable at render time
    if (commandPaletteOpen) setHasOpenedCommandPalette(true);
  }, [commandPaletteOpen]);

  // Same ratchet, for the sync-scroll onboarding hint.
  const [hasToggledSyncScroll, setHasToggledSyncScroll] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-way ratchet on a prop, not derivable at render time
    if (syncScroll) setHasToggledSyncScroll(true);
  }, [syncScroll]);

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

  // Shared props for EditorPanel/PreviewPanel — built once per render and
  // spread into whichever layout branch below is active, instead of
  // repeating the same ~10 props in three near-identical JSX blocks.
  const editorPanelProps = {
    ref: editorRef,
    markdown,
    onChange: handleChange,
    onClear: handleClear,
    onReset: handleReset,
    isVisible: true,
    onFileUpload: handleFileUpload,
    onDownload: downloadMarkdown,
    onScroll: handleEditorScroll,
    zoomLevel,
    lastSaved,
    isDirty,
    storageWarning,
    uploadError,
    onDismissUploadError: dismissUploadError,
  };

  const previewPanelProps = {
    ref: previewRef,
    markdown: previewMarkdown,
    isVisible: true,
    onExportHtml: exportAsHtml,
    onExportPdf: exportAsPdf,
    onExportPlainText: exportAsPlainText,
    zoomLevel,
    onScroll: handlePreviewScroll,
    syncScrollActive: syncScroll,
  };

  // Layout configuration — single useMemo replaces 4 separate useCallbacks
  const layoutConfig = useMemo(() => ({
    // Below lg, bottom padding reserves space for the docked layout-controls
    // bar so it never covers the panel status bars.
    containerClass: fullscreen
      ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col'
      : 'flex flex-col h-dvh w-full relative pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0',
    mainClass: (readingMode || fullscreen || layoutMode === 'split')
      ? 'flex-1 flex overflow-hidden'
      : 'flex-1 flex flex-col overflow-hidden',
    editorStyle: layoutMode === 'split' ? { width: `${editorWidth}%` } : ({} as React.CSSProperties),
    previewStyle: layoutMode === 'split' ? { width: `${100 - editorWidth}%` } : ({} as React.CSSProperties),
  }), [readingMode, fullscreen, layoutMode, editorWidth]);

  return (
    <OnboardingHintProvider>
    <div className={layoutConfig.containerClass}>
      {/* Header - hidden in fullscreen */}
      {!fullscreen && (
        <Header
          githubUrl={APP_CONFIG.github.url}
          onOpenCommandPalette={openCommandPalette}
          hasOpenedCommandPalette={hasOpenedCommandPalette}
          hasToggledSyncScroll={hasToggledSyncScroll}
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
                <EditorPanel {...editorPanelProps} />
              </div>
            )}

            {/* Preview Panel - Stacked */}
            <div className="flex-1 min-h-0">
              <PreviewPanel {...previewPanelProps} />
            </div>
          </>
        ) : layoutMode === 'split' ? (
          <>
            {/* Editor Panel - Split (skip mount entirely in reading mode) */}
            {!readingMode && (
              <div className="min-w-0 overflow-hidden" style={layoutConfig.editorStyle}>
                <EditorPanel {...editorPanelProps} />
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
              <PreviewPanel {...previewPanelProps} />
            </div>
          </>
        ) : (
          <>
            {/* Tabbed panels stay mounted and toggle via CSS — unmounting the
                editor would discard the textarea's undo history every time
                the user peeks at the preview. */}
            <div
              id={tabPanelId('editor')}
              role="tabpanel"
              aria-labelledby="editor-tab"
              className={activeTab === 'editor' && !readingMode ? 'flex-1 min-h-0' : 'hidden'}
            >
              <EditorPanel {...editorPanelProps} />
            </div>

            <div
              id={tabPanelId('preview')}
              role="tabpanel"
              aria-labelledby="preview-tab"
              className={activeTab === 'preview' || readingMode ? 'flex-1 min-h-0' : 'hidden'}
            >
              <PreviewPanel {...previewPanelProps} />
            </div>
          </>
        )}
      </main>

      {/* Mobile / tablet layout controls — docked bottom bar. The container's
          bottom padding (see layoutConfig) reserves this space so the bar
          never overlaps the editor/preview status bars. */}
      {!fullscreen && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
          <div className="overflow-x-auto">
            <LayoutControls className="flex w-max mx-auto px-2 py-1" />
          </div>
        </div>
      )}

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
    </OnboardingHintProvider>
  );
};

export default MarkdownPreview;
