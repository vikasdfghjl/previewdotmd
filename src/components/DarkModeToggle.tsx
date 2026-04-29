'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Detect hydration: returns false during SSR/first render, true after mount
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = theme === 'dark';

  // Server-rendered base: no theme-dependent styles to avoid hydration mismatch
  const background = mounted
    ? (isDark ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)')
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';

  const boxShadow = mounted
    ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)')
    : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';

  const glowBackground = mounted
    ? (isDark ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)')
    : 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800"
      style={{
        background,
        boxShadow,
      }}
      aria-label={`Switch to ${mounted && isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${mounted && isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun Icon (Light Mode) */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ease-out ${
            mounted && isDark 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <svg
            className="w-6 h-6 text-amber-500 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Moon Icon (Dark Mode) */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ease-out ${
            mounted && isDark 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}
        >
          <svg
            className="w-6 h-6 text-indigo-300 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
          isDark ? 'opacity-0 hover:opacity-100' : 'opacity-0 hover:opacity-100'
        }`}
        style={{
          background: glowBackground,
        }}
      />
    </button>
  );
};