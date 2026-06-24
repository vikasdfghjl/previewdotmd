'use client';

import React, { useState, useEffect } from 'react';

const DISMISSED_KEY = 'previewmd-storage-notice-dismissed';

/**
 * StorageNotice — shows a one-time notice that content is saved
 * only to this browser. Dismisses permanently when the user clicks "Got it".
 */
export const StorageNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) !== '1') {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — no point showing the notice
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
      <span>
        💡 Your content is saved to <strong>this browser only</strong>. Export to a file for permanent storage.
      </span>
      <button
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem(DISMISSED_KEY, '1');
          } catch {
            // ignore
          }
        }}
        className="ml-auto px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-medium transition-colors flex-shrink-0"
      >
        Got it
      </button>
    </div>
  );
};
