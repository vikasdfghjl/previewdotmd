'use client';

import React, { useState, useCallback } from 'react';

interface FindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (query: string) => void;
  onReplace: (query: string, replacement: string, replaceAll: boolean) => void;
  matchCount: number;
  currentMatch: number;
  onNext: () => void;
  onPrev: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({
  isOpen,
  onClose,
  onFind,
  onReplace,
  matchCount,
  currentMatch,
  onNext,
  onPrev,
}) => {
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const handleFindChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFindQuery(value);
    onFind(value);
  }, [onFind]);

  const handleReplace = useCallback((replaceAll: boolean) => {
    onReplace(findQuery, replaceQuery, replaceAll);
  }, [findQuery, replaceQuery, onReplace]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  }, [onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-80">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title={showReplace ? 'Hide replace' : 'Show replace'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${showReplace ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <input
          type="text"
          value={findQuery}
          onChange={handleFindChange}
          onKeyDown={handleKeyDown}
          placeholder="Find..."
          className="flex-1 px-2 py-1 text-sm border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-center">
          {matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results'}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={onPrev}
          disabled={matchCount === 0}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          title="Previous (Shift+Enter)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNext}
          disabled={matchCount === 0}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          title="Next (Enter)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Close (Escape)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showReplace && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace..."
              className="flex-1 px-2 py-1 text-sm border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReplace(false)}
              disabled={matchCount === 0}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Replace
            </button>
            <button
              onClick={() => handleReplace(true)}
              disabled={matchCount === 0}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Replace All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
