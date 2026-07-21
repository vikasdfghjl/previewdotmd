'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

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

const PREFS_KEY = 'previewmd-layout-prefs';
const LAYOUT_MODES: LayoutMode[] = ['split', 'stacked', 'tabbed'];

interface PersistedPrefs {
  layoutMode?: LayoutMode;
  syncScroll?: boolean;
  zoomLevel?: number;
  editorWidth?: number;
}

/** Reads and sanitizes persisted layout preferences; null when absent/invalid. */
function loadPrefs(): PersistedPrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPrefs;
    const prefs: PersistedPrefs = {};
    if (LAYOUT_MODES.includes(parsed.layoutMode as LayoutMode)) prefs.layoutMode = parsed.layoutMode;
    if (typeof parsed.syncScroll === 'boolean') prefs.syncScroll = parsed.syncScroll;
    if (typeof parsed.zoomLevel === 'number') prefs.zoomLevel = Math.max(50, Math.min(200, parsed.zoomLevel));
    if (typeof parsed.editorWidth === 'number') prefs.editorWidth = Math.max(10, Math.min(90, parsed.editorWidth));
    return prefs;
  } catch {
    return null;
  }
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Slow-changing layout state (mode, toggles, tabs, zoom).
  // Always starts from DEFAULT_STATE so the client's first render matches
  // the server-rendered HTML (SSR has no `window`, so it can't know the
  // viewport size — branching on matchMedia here would mismatch on hydration).
  const [state, setState] = useState<LayoutState>(DEFAULT_STATE);
  // Fast-changing editor width (updated per-frame during resize drag)
  const [editorWidth, setEditorWidthState] = useState<number>(DEFAULT_EDITOR_WIDTH);

  // True once the user explicitly picks a layout this session — from then on
  // viewport changes stop auto-switching the mode out from under them.
  const userChoseLayoutRef = useRef(false);
  // Guards the persist effect so defaults aren't written before prefs load.
  const prefsLoadedRef = useRef(false);

  // Restore persisted preferences and adapt the layout to the viewport.
  // Runs post-hydration (client-only) so it doesn't affect the first render,
  // which has to match SSR output (the server can't know viewport or prefs).
  useEffect(() => {
    const prefs = loadPrefs();
    const mq = window.matchMedia('(max-width: 767px)');

    // Narrow viewports always start tabbed — split view leaves each pane too
    // cramped on a phone, even if a wider device persisted another mode.
    const initialMode: LayoutMode = mq.matches
      ? 'tabbed'
      : prefs?.layoutMode ?? DEFAULT_STATE.layoutMode;

    requestAnimationFrame(() => {
      setState(prev => ({
        ...prev,
        layoutMode: initialMode,
        syncScroll: prefs?.syncScroll ?? prev.syncScroll,
        zoomLevel: prefs?.zoomLevel ?? prev.zoomLevel,
      }));
      if (prefs?.editorWidth !== undefined) setEditorWidthState(prefs.editorWidth);
      prefsLoadedRef.current = true;
    });

    // Rotation / window resize across the breakpoint re-picks the mode,
    // unless the user explicitly chose one this session.
    const onChange = (e: MediaQueryListEvent) => {
      if (userChoseLayoutRef.current) return;
      setState(prev => ({
        ...prev,
        layoutMode: e.matches ? 'tabbed' : loadPrefs()?.layoutMode ?? DEFAULT_STATE.layoutMode,
      }));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    userChoseLayoutRef.current = true;
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
    userChoseLayoutRef.current = false;
    try {
      localStorage.removeItem(PREFS_KEY);
    } catch (err) {
      console.warn('[LayoutContext] Unable to clear layout preferences from storage:', err);
    }
    setState(DEFAULT_STATE);
    setEditorWidthState(DEFAULT_EDITOR_WIDTH);
  }, []);

  // Persist preferences (debounced — editorWidth updates per-frame while the
  // split divider is dragged). An auto-selected mode (narrow viewport →
  // tabbed) is NOT saved as the layout preference; only explicit choices are,
  // so a phone session doesn't overwrite the mode picked on desktop.
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    const timer = setTimeout(() => {
      try {
        const layoutMode = userChoseLayoutRef.current ? state.layoutMode : loadPrefs()?.layoutMode;
        const prefs: PersistedPrefs = {
          ...(layoutMode !== undefined && { layoutMode }),
          syncScroll: state.syncScroll,
          zoomLevel: state.zoomLevel,
          editorWidth,
        };
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // storage full/unavailable — non-fatal
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [state.layoutMode, state.syncScroll, state.zoomLevel, editorWidth]);

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
