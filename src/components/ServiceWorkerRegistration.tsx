'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * ServiceWorkerRegistration — registers the PWA service worker,
 * shows an update prompt when new content is available,
 * and displays an offline banner when the network is down.
 */
export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ── SW Registration ───────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check if an update was already found while registering
          if (registration.installing) {
            trackInstalling(registration.installing);
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) trackInstalling(newWorker);
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    };

    const trackInstalling = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New content available — update ready');
          setUpdateAvailable(true);
        }
      });
    };

    // Listen for sw-update custom events (fired from SW)
    const handleSwUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update', handleSwUpdate);

    // Listen for SW messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SKIP_WAITING') {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Register after load to avoid competing with initial render
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    return () => {
      window.removeEventListener('sw-update', handleSwUpdate);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // ── Offline detection ─────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // navigator.onLine and the 'offline' event only reflect whether the OS
    // reports a network interface as connected — not whether the site is
    // actually reachable. It's known to false-positive (brief Wi-Fi/VPN
    // blips, some browser network-stack quirks), so confirm with a real
    // fetch before showing the banner instead of trusting it directly.
    const verifyOffline = async () => {
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    if (!navigator.onLine) verifyOffline();

    const goOffline = () => verifyOffline();
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // ── Update action ─────────────────────────────────────
  const applyUpdate = useCallback(() => {
    setUpdateAvailable(false);
    // Post SKIP_WAITING to the waiting SW, then reload
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Also post to any waiting worker
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    // Reload after a brief delay to let the SW activate
    setTimeout(() => window.location.reload(), 300);
  }, []);

  const dismissUpdate = useCallback(() => setDismissed(true), []);

  // ── Render ────────────────────────────────────────────
  return (
    <>
      {/* Offline banner */}
      {isOffline && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black text-sm font-medium text-center py-2 px-4 shadow-md"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M16.95 7.05a7 7 0 010 9.9M15.536 8.464a5 5 0 010 7.072M12 6v6l4 2" />
            </svg>
            You&apos;re offline — showing cached content
          </span>
        </div>
      )}

      {/* Update available prompt */}
      {updateAvailable && !dismissed && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white text-sm font-medium rounded-lg shadow-xl px-4 py-3 flex items-center gap-4"
        >
          <span>A new version is available.</span>
          <button
            onClick={applyUpdate}
            className="px-3 py-1 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={dismissUpdate}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
