'use client';

import React from 'react';
import { Icons } from '@/constants/icons';

interface ScrollSyncIndicatorProps {
  isActive: boolean;
  className?: string;
}

/**
 * ScrollSyncIndicator - Visual indicator showing scroll synchronization status
 * Displays a pulsing indicator when scroll sync is active
 */
export const ScrollSyncIndicator: React.FC<ScrollSyncIndicatorProps> = ({
  isActive,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
        transition-all duration-300 ease-in-out
        ${isActive 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        }
        ${className}
      `}
      aria-live="polite"
      aria-label={`Scroll sync is ${isActive ? 'active' : 'inactive'}`}
    >
      <div className="relative flex items-center justify-center w-3.5 h-3.5">
        {/* Static icon */}
        <span className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
          {Icons.syncScroll}
        </span>
        
        {/* Pulsing ring when active */}
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
        )}
      </div>
      
      <span className="hidden sm:inline">
        {isActive ? 'Sync On' : 'Sync Off'}
      </span>
    </div>
  );
};

export default ScrollSyncIndicator;
