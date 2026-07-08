'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Single Responsibility: Layout mode definitions
export type LayoutMode = 'split' | 'stacked' | 'tabbed';
export type ActiveTab = 'editor' | 'preview';

interface LayoutState {
  layoutMode: LayoutMode;
  syncScroll: boolean;
  fullscreen: boolean;
  readingMode: boolean;
  zoomLevel: number;
  activeTab: ActiveTab;
}

interface LayoutActions {
  setLayoutMode: (mode: LayoutMode) => void;
  toggleSyncScroll: () => void;
  toggleFullscreen: () => void;
  toggleReadingMode: () => void;
  setZoomLevel: (levelOrUpdater: number | ((prev: number) => number)) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setEditorWidth: (width: number) => void;
  resetLayout: () => void;
}

type LayoutContextType = LayoutState & { editorWidth: number } & LayoutActions;

// Split into three contexts:
// - LayoutState: slow-changing values (layout mode, toggles, tab, zoom)
// - EditorWidth: fast-changing during resize drag
// - LayoutActions: stable function references
// This prevents components that don't use editorWidth from re-rendering
// during resize (LayoutControls, TabBar, Header, etc.)
const LayoutStateContext = createContext<LayoutState | undefined>(undefined);
const EditorWidthContext = createContext<number | undefined>(undefined);
const LayoutActionsContext = createContext<LayoutActions | undefined>(undefined);

const DEFAULT_STATE: LayoutState = {
  layoutMode: 'split',
  syncScroll: false,
  fullscreen: false,
  readingMode: false,
  zoomLevel: 100,
  activeTab: 'editor',
};

const DEFAULT_EDITOR_WIDTH = 50;

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Slow-changing layout state (mode, toggles, tabs, zoom)
  const [state, setState] = useState<LayoutState>(DEFAULT_STATE);
  // Fast-changing editor width (updated per-frame during resize drag)
  const [editorWidth, setEditorWidthState] = useState<number>(DEFAULT_EDITOR_WIDTH);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setState(prev => ({ ...prev, layoutMode: mode }));
  }, []);

  const toggleSyncScroll = useCallback(() => {
    setState(prev => ({ ...prev, syncScroll: !prev.syncScroll }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
  }, []);

  const toggleReadingMode = useCallback(() => {
    setState(prev => ({ ...prev, readingMode: !prev.readingMode }));
  }, []);

  const setZoomLevel = useCallback((levelOrUpdater: number | ((prev: number) => number)) => {
    setState(prev => {
      const level = typeof levelOrUpdater === 'function' ? levelOrUpdater(prev.zoomLevel) : levelOrUpdater;
      const clamped = Math.max(50, Math.min(200, level));
      return { ...prev, zoomLevel: clamped };
    });
  }, []);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setEditorWidth = useCallback((width: number) => {
    const clamped = Math.max(10, Math.min(90, width));
    setEditorWidthState(clamped);
  }, []);

  const resetLayout = useCallback(() => {
    setState(DEFAULT_STATE);
    setEditorWidthState(DEFAULT_EDITOR_WIDTH);
  }, []);

  // Memoize actions — stable reference, never changes
  const actions = useMemo<LayoutActions>(() => ({
    setLayoutMode,
    toggleSyncScroll,
    toggleFullscreen,
    toggleReadingMode,
    setZoomLevel,
    setActiveTab,
    setEditorWidth,
    resetLayout,
  }), [
    setLayoutMode,
    toggleSyncScroll,
    toggleFullscreen,
    toggleReadingMode,
    setZoomLevel,
    setActiveTab,
    setEditorWidth,
    resetLayout,
  ]);

  return (
    <LayoutStateContext.Provider value={state}>
      <EditorWidthContext.Provider value={editorWidth}>
        <LayoutActionsContext.Provider value={actions}>
          {children}
        </LayoutActionsContext.Provider>
      </EditorWidthContext.Provider>
    </LayoutStateContext.Provider>
  );
}

/**
 * useLayout — combined hook that reads all three contexts.
 * Returns a merged object like the previous single-context API.
 */
export function useLayout(): LayoutContextType {
  const state = useContext(LayoutStateContext);
  const editorWidth = useContext(EditorWidthContext);
  const actions = useContext(LayoutActionsContext);

  if (state === undefined || editorWidth === undefined || actions === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }

  return useMemo(() => ({
    ...state,
    editorWidth,
    ...actions,
  }), [state, editorWidth, actions]);
}

/**
 * Selective hooks — use these when a component only needs a subset.
 * Components subscribing only to LayoutStateContext will NOT re-render
 * when editorWidth changes during resize drag.
 */

/** Slow-changing layout state + zoom */
export function useLayoutState(): LayoutState {
  const ctx = useContext(LayoutStateContext);
  if (ctx === undefined) throw new Error('useLayoutState must be used within a LayoutProvider');
  return ctx;
}

/** Editor width only (fast-changing during resize) */
export function useEditorWidth(): number {
  const ctx = useContext(EditorWidthContext);
  if (ctx === undefined) throw new Error('useEditorWidth must be used within a LayoutProvider');
  return ctx;
}

/** Stable action callbacks */
export function useLayoutActions(): LayoutActions {
  const ctx = useContext(LayoutActionsContext);
  if (ctx === undefined) throw new Error('useLayoutActions must be used within a LayoutProvider');
  return ctx;
}
