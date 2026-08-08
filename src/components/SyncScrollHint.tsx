'use client';

import React, { useEffect } from 'react';
import { useOnboardingHint } from '@/contexts/OnboardingHintContext';
import { HintCallout } from './HintCallout';

interface SyncScrollHintProps {
  /** Dismisses the hint the moment the user toggles sync scroll themselves. */
  hasBeenToggled: boolean;
}

/**
 * One-time callout pointing at the Sync Scroll toggle — its icon alone
 * doesn't convey what it does, and it's easy to write a whole document
 * without ever noticing the editor and preview can scroll together.
 */
export const SyncScrollHint: React.FC<SyncScrollHintProps> = ({ hasBeenToggled }) => {
  const { active, dismiss } = useOnboardingHint('sync-scroll');

  useEffect(() => {
    if (hasBeenToggled) dismiss();
  }, [hasBeenToggled, dismiss]);

  if (!active) return null;

  return (
    <HintCallout onDismiss={dismiss}>
      💡 <strong className="text-gray-900 dark:text-gray-100">Sync Scroll</strong> — turn this on to keep the editor and preview scrolled to the same spot as you write.
    </HintCallout>
  );
};
