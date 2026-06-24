import { type Command } from '@/hooks/useCommandPalette';
import type { LayoutMode } from '@/contexts/LayoutContext';
import { Icons } from '@/constants/icons';
import { APP_CONFIG } from '@/constants/config';

/**
 * createCommands — builds the command palette command list.
 * Extracted from MarkdownPreview.tsx to keep the orchestrator lean
 * and satisfy SRP (commands are data, not component logic).
 */
export function createCommands(deps: {
  handleClear: () => void;
  downloadMarkdown: () => void;
  exportAsHtml: () => void;
  exportAsPdf: () => void;
  toggleFullscreen: () => void;
  toggleReadingMode: () => void;
  toggleSyncScroll: () => void;
  setZoomLevel: (level: number) => void;
  zoomLevelRef: { current: number };
  setLayoutMode: (mode: LayoutMode) => void;
  handleReset: () => void;
}): Command[] {
  const {
    handleClear,
    downloadMarkdown,
    exportAsHtml,
    exportAsPdf,
    toggleFullscreen,
    toggleReadingMode,
    toggleSyncScroll,
    setZoomLevel,
    zoomLevelRef,
    setLayoutMode,
    handleReset,
  } = deps;

  return [
    // ── File ──────────────────────────────────────────────
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

    // ── View ──────────────────────────────────────────────
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
      icon: Icons.eye,
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
      action: () => setZoomLevel(zoomLevelRef.current + 10),
      category: 'View',
    },
    {
      id: 'view-zoom-out',
      label: 'Zoom Out',
      description: 'Decrease preview zoom level',
      shortcut: 'Ctrl+-',
      icon: Icons.zoomOut,
      action: () => setZoomLevel(zoomLevelRef.current - 10),
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

    // ── Layout ────────────────────────────────────────────
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

    // ── Edit ──────────────────────────────────────────────
    {
      id: 'edit-find',
      label: 'Find and Replace',
      description: 'Search and replace text',
      shortcut: 'Ctrl+F',
      icon: Icons.search,
      action: () => {}, // placeholder — no-op (find is triggered by Ctrl+F shortcut)
      category: 'Edit',
    },
    {
      id: 'edit-reset',
      label: 'Load Example Document',
      description: 'Replace editor content with the demo example',
      icon: Icons.reset,
      action: handleReset,
      category: 'Edit',
    },

    // ── Help ──────────────────────────────────────────────
    {
      id: 'app-help',
      label: 'Open GitHub',
      description: 'View source code on GitHub',
      icon: Icons.logo,
      action: () => window.open(APP_CONFIG.github.url, '_blank'),
      category: 'Help',
    },
  ];
}
