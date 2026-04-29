'use client';

import React from 'react';
import { Command } from '@/hooks/useCommandPalette';

interface CommandPaletteProps {
  isOpen: boolean;
  query: string;
  commands: Command[];
  selectedIndex: number;
  onQueryChange: (query: string) => void;
  onSelect: (index: number) => void;
  onExecute: () => void;
  onClose: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
}

/**
 * CommandPalette - Modal command palette for quick access to all commands
 * Similar to VS Code's command palette (Ctrl+Shift+P)
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  query,
  commands,
  selectedIndex,
  onQueryChange,
  onSelect,
  onExecute,
  onClose,
  onSelectNext,
  onSelectPrev,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onSelectNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelectPrev();
        break;
      case 'Enter':
        e.preventDefault();
        onExecute();
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Group commands by category
  const groupedCommands = commands.reduce((acc, cmd) => {
    const category = cmd.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const categories = Object.keys(groupedCommands);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Palette container */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autoFocus
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {commands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No commands found</p>
              <p className="text-sm mt-1 opacity-70">
                Try a different search term
              </p>
            </div>
          ) : (
            <div role="listbox" aria-label="Available commands">
              {categories.map((category) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase tracking-wider">
                    {category}
                  </div>
                  {groupedCommands[category].map((cmd, idx) => {
                    // Find the actual index in the full commands array
                    const actualIndex = commands.findIndex(c => c.id === cmd.id);
                    const isSelected = actualIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelect(actualIndex);
                          onExecute();
                        }}
                        onMouseEnter={() => onSelect(actualIndex)}
                        className={`
                          w-full px-4 py-3 flex items-center gap-3 text-left
                          transition-colors duration-150
                          ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }
                        `}
                      >
                        {/* Icon */}
                        <span className="flex-shrink-0 w-5 h-5 opacity-70">
                          {cmd.icon || (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          )}
                        </span>

                        {/* Label and description */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-sm opacity-70 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>

                        {/* Shortcut */}
                        {cmd.shortcut && (
                          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border">↵</kbd>
              to select
            </span>
          </div>
          <span>{commands.length} commands</span>
        </div>
      </div>
    </div>
  );
};

