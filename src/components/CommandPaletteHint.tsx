'use client';

import React, { useEffect } from 'react';
import { useOnboardingHint } from '@/contexts/OnboardingHintContext';
import { HintCallout } from './HintCallout';

interface CommandPaletteHintProps {
  /** Dismisses the hint the moment the user discovers the palette on their own. */
  hasBeenOpened: boolean;
}

/**
 * One-time callout pointing at the Command Palette button. The palette (16
 * commands: export, layout, zoom, GitHub, etc.) has no other discoverable
 * entry point once the demo document — the only place that mentions
 * Ctrl+Shift+P — gets cleared or replaced.
 */
export const CommandPaletteHint: React.FC<CommandPaletteHintProps> = ({ hasBeenOpened }) => {
  const { active, dismiss } = useOnboardingHint('command-palette');

  useEffect(() => {
    if (hasBeenOpened) dismiss();
  }, [hasBeenOpened, dismiss]);

  if (!active) return null;

  return (
    <HintCallout onDismiss={dismiss}>
      💡 <strong className="text-gray-900 dark:text-gray-100">Command Palette</strong> — quick access to every action. Open it anytime with{' '}
      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
        Ctrl+Shift+P
      </kbd>{' '}
      or this button.
    </HintCallout>
  );
};
