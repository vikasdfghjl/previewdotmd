'use client';

import React from 'react';
import { useLayoutState, useLayoutActions, LayoutMode } from '@/contexts/LayoutContext';
import { ToolbarButton } from './ToolbarButton';
import { Icons } from '@/constants/icons';

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
  } = useLayoutState();
  const {
    setLayoutMode,
    toggleSyncScroll,
    toggleFullscreen,
    toggleReadingMode,
    setZoomLevel,
  } = useLayoutActions();

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
        {Icons.eye}
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
