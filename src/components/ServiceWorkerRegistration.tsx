'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegistration - Component to register the PWA service worker
 * This runs only on the client side
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, show update notification
                    console.log('[PWA] New content available, please refresh');
                    
                    // Optional: Dispatch custom event for update UI
                    window.dispatchEvent(new CustomEvent('sw-update', { 
                      detail: { registration } 
                    }));
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}

export default ServiceWorkerRegistration;
