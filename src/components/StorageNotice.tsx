'use client';

import React from 'react';
import { useOnboardingHint } from '@/contexts/OnboardingHintContext';

/**
 * StorageNotice — shows a one-time notice that content is saved
 * only to this browser. Queued first with the onboarding hints, so it never
 * appears at the same time as a coachmark; dismisses permanently on "Got it".
 */
export const StorageNotice: React.FC = () => {
  const { active, dismiss } = useOnboardingHint('storage-notice');

  if (!active) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
      <span>
        💡 Your content is saved to <strong>this browser only</strong>. Export to a file for permanent storage.
      </span>
      <button
        onClick={dismiss}
        className="ml-auto px-2 py-0.5 pointer-coarse:min-h-11 pointer-coarse:px-3 rounded bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-medium transition-colors flex-shrink-0"
      >
        Got it
      </button>
    </div>
  );
};
