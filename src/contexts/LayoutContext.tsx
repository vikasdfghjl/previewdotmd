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
  editorWidth: number; // percentage for split mode (10-90)
}

interface LayoutActions {
  setLayoutMode: (mode: LayoutMode) => void;
  toggleSyncScroll: () => void;
  toggleFullscreen: () => void;
  toggleReadingMode: () => void;
  setZoomLevel: (level: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setEditorWidth: (width: number) => void;
  resetLayout: () => void;
}

type LayoutContextType = LayoutState & LayoutActions;

// Open/Closed: Default values are easily extensible
const DEFAULT_STATE: LayoutState = {
  layoutMode: 'split',
  syncScroll: false,
  fullscreen: false,
  readingMode: false,
  zoomLevel: 100,
  activeTab: 'editor',
  editorWidth: 50,
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LayoutState>(DEFAULT_STATE);

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

  const setZoomLevel = useCallback((level: number) => {
    const clamped = Math.max(50, Math.min(200, level));
    setState(prev => ({ ...prev, zoomLevel: clamped }));
  }, []);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setEditorWidth = useCallback((width: number) => {
    const clamped = Math.max(10, Math.min(90, width));
    setState(prev => ({ ...prev, editorWidth: clamped }));
  }, []);

  const resetLayout = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  // Dependency Inversion: Memoize context value to prevent unnecessary re-renders
  const value = useMemo<LayoutContextType>(() => ({
    ...state,
    setLayoutMode,
    toggleSyncScroll,
    toggleFullscreen,
    toggleReadingMode,
    setZoomLevel,
    setActiveTab,
    setEditorWidth,
    resetLayout,
  }), [
    state,
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
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextType {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
