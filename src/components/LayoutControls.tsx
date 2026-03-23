'use client';

import React from 'react';
import { useLayout, LayoutMode } from '@/contexts/LayoutContext';
import { ToolbarButton } from './ToolbarButton';

// DRY: SVG icons defined once
const Icons = {
  split: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
    </svg>
  ),
  stacked: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
    </svg>
  ),
  tabbed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
  syncScroll: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  fullscreen: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  readingMode: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  zoomIn: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  ),
  zoomOut: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
  ),
};

// Interface Segregation: Small, focused props
interface LayoutControlsProps {
  className?: string;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({ className = '' }) => {
  const {
    layoutMode,
    syncScroll,
    fullscreen,
    readingMode,
    zoomLevel,
    setLayoutMode,
    toggleSyncScroll,
    toggleFullscreen,
    toggleReadingMode,
    setZoomLevel,
  } = useLayout();

  const layoutModes: { mode: LayoutMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'split', label: 'Split View', icon: Icons.split },
    { mode: 'stacked', label: 'Stacked', icon: Icons.stacked },
    { mode: 'tabbed', label: 'Tabbed', icon: Icons.tabbed },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Layout mode selector */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
        {layoutModes.map(({ mode, label, icon }) => (
          <ToolbarButton
            key={mode}
            onClick={() => setLayoutMode(mode)}
            isActive={layoutMode === mode}
            title={label}
          >
            {icon}
          </ToolbarButton>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Sync scroll toggle */}
      <ToolbarButton
        onClick={toggleSyncScroll}
        isActive={syncScroll}
        title={syncScroll ? 'Disable sync scroll' : 'Enable sync scroll'}
      >
        {Icons.syncScroll}
      </ToolbarButton>

      {/* Reading mode */}
      <ToolbarButton
        onClick={toggleReadingMode}
        isActive={readingMode}
        title={readingMode ? 'Exit reading mode' : 'Reading mode'}
      >
        {Icons.readingMode}
      </ToolbarButton>

      {/* Fullscreen */}
      <ToolbarButton
        onClick={toggleFullscreen}
        isActive={fullscreen}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {Icons.fullscreen}
      </ToolbarButton>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => setZoomLevel(zoomLevel - 10)}
          title="Zoom out"
        >
          {Icons.zoomOut}
        </ToolbarButton>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center select-none">
          {zoomLevel}%
        </span>
        <ToolbarButton
          onClick={() => setZoomLevel(zoomLevel + 10)}
          title="Zoom in"
        >
          {Icons.zoomIn}
        </ToolbarButton>
      </div>
    </div>
  );
};
