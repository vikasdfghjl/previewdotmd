'use client';

import React from 'react';
import { LayoutControls } from './LayoutControls';
import { DarkModeToggle } from './DarkModeToggle';
import { Icons } from '../constants/icons';

interface HeaderProps {
  onToggleFullscreen: () => void;
  onToggleReadingMode: () => void;
  githubUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleFullscreen,
  onToggleReadingMode,
  githubUrl,
}) => {
  return (
    <header className="panel-header flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            Preview<span className="text-blue-500">.md</span>
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 bg-blue-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-secondary">Live editing</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LayoutControls className="hidden md:flex" />

        <DarkModeToggle />

        <button
          onClick={onToggleReadingMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Reading Mode"
        >
          <span className="w-5 h-5 text-secondary">{Icons.readingMode}</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Fullscreen"
        >
          <span className="w-5 h-5 text-secondary">{Icons.fullscreen}</span>
        </button>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="View on GitHub"
        >
          <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </header>
  );
};

