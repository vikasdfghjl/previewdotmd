'use client';

import React from 'react';
import { useOnboardingHint } from '@/contexts/OnboardingHintContext';
import { HintCallout } from './HintCallout';

/**
 * One-time callout on the Upload button revealing that you can also drag a
 * .md file straight onto the editor — there's no other signposting for
 * this; the drop-zone overlay only appears once a drag is already in
 * progress, so a user who never tries it will never find out it exists.
 */
export const DragDropHint: React.FC = () => {
  const { active, dismiss } = useOnboardingHint('drag-drop-upload');

  if (!active) return null;

  return (
    <HintCallout onDismiss={dismiss} align="left">
      💡 <strong className="text-gray-900 dark:text-gray-100">Tip:</strong> you can also drag a <code className="px-1 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded">.md</code> file straight onto the editor to open it.
    </HintCallout>
  );
};
