'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// Order matters — hints are shown one at a time, in this sequence, so a
// first-time user is never looking at more than one coachmark at once.
const HINT_KEYS = ['command-palette', 'sync-scroll', 'drag-drop-upload'] as const;
type HintKey = (typeof HINT_KEYS)[number];

function storageKey(key: HintKey) {
  return `previewmd-hint-${key}-dismissed`;
}

function isDismissed(key: HintKey): boolean {
  if (typeof window === 'undefined') return true; // hide during server prerender
  try {
    return localStorage.getItem(storageKey(key)) === '1';
  } catch {
    return true; // localStorage unavailable — no point showing hints
  }
}

function persistDismissed(key: HintKey) {
  try {
    localStorage.setItem(storageKey(key), '1');
  } catch {
    // ignore
  }
}

interface OnboardingHintContextValue {
  isActive: (key: HintKey) => boolean;
  dismiss: (key: HintKey) => void;
}

const OnboardingHintContext = createContext<OnboardingHintContextValue | undefined>(undefined);

export const OnboardingHintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dismissedKeys, setDismissedKeys] = useState<Set<HintKey>>(
    () => new Set(HINT_KEYS.filter(isDismissed)),
  );
  const [visibleKey, setVisibleKey] = useState<HintKey | null>(null);

  // The next hint in the queue that hasn't been dismissed yet.
  const nextKey = useMemo(
    () => HINT_KEYS.find((k) => !dismissedKeys.has(k)) ?? null,
    [dismissedKeys],
  );

  // Delay before showing it — re-checked when it fires, not just when
  // scheduled, so discovering the feature during the delay cancels it cleanly.
  useEffect(() => {
    if (!nextKey) return;
    const timer = setTimeout(() => {
      if (!isDismissed(nextKey)) setVisibleKey(nextKey);
    }, 1200);
    return () => clearTimeout(timer);
  }, [nextKey]);

  const dismiss = useCallback((key: HintKey) => {
    persistDismissed(key);
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setVisibleKey((current) => (current === key ? null : current));
  }, []);

  const isActive = useCallback((key: HintKey) => visibleKey === key, [visibleKey]);

  const value = useMemo(() => ({ isActive, dismiss }), [isActive, dismiss]);

  return (
    <OnboardingHintContext.Provider value={value}>
      {children}
    </OnboardingHintContext.Provider>
  );
};

/** Returns whether `key`'s hint should render, plus a dismiss callback bound to it. */
export function useOnboardingHint(key: HintKey) {
  const ctx = useContext(OnboardingHintContext);
  if (!ctx) throw new Error('useOnboardingHint must be used within OnboardingHintProvider');
  const active = ctx.isActive(key);
  const dismiss = useCallback(() => ctx.dismiss(key), [ctx, key]);
  return { active, dismiss };
}
