'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/safeStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';

function wasDismissed(): boolean {
  return getStorageItem(DISMISSED_KEY) === '1';
}

/**
 * useInstallPrompt — captures the beforeinstallprompt event so the app
 * can show a custom install button instead of relying on the browser's
 * one-time native prompt.
 *
 * Respects a localStorage flag so users who dismiss won't be nagged again
 * until the next session (or until they clear site data).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(wasDismissed);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt,
    );

    // If the app was installed, clear the prompt
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setIsDismissed(true);
    setStorageItem(DISMISSED_KEY, '1');
  }, []);

  /** True when we should show an install button. */
  const showInstall = deferredPrompt !== null && !isDismissed;

  return { showInstall, promptInstall, dismissInstall };
}
