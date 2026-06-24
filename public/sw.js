const CACHE_VERSION = 'v3';
const STATIC_CACHE = `previewmd-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `previewmd-dynamic-${CACHE_VERSION}`;

// Assets to cache on install (Next.js static export routes — no .html suffixes)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Critical PWA icons for offline splash screens
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Navigation preload — speeds up page loads while SW boots
// See: https://developer.chrome.com/docs/workbox/navigation-preload/
let navigationPreloadEnabled = false;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('[SW] Failed to cache static assets:', err);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches + enable navigation preload
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil((async () => {
    // Enable navigation preload if supported
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
        navigationPreloadEnabled = true;
        console.log('[SW] Navigation preload enabled');
      } catch (err) {
        console.warn('[SW] Navigation preload not supported:', err);
      }
    }

    // Delete old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) =>
          name.startsWith('previewmd-') &&
          name !== STATIC_CACHE &&
          name !== DYNAMIC_CACHE
        )
        .map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
    );
  })());

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Strategy: Cache First for static assets
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Strategy: Network First for dynamic content
  event.respondWith(networkFirst(request));
});

// Helper: Check if request is for a static/immutable asset
function isStaticAsset(request) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.json', '.txt',
  ];

  const url = new URL(request.url);

  // Next.js fingerprinted static assets — safe to cache forever
  if (url.pathname.startsWith('/_next/static/')) return true;

  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Cache First strategy
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    
    return cached;
  }
  
  // Not in cache, fetch and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return cache.match('/');
    }
    throw error;
  }
}

// Network First strategy with navigation preload support
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    // Use preloaded response for navigations if available
    let networkResponse;
    if (request.mode === 'navigate' && navigationPreloadEnabled) {
      try {
        const preloadResponse = await request.preloadResponse;
        if (preloadResponse) {
          networkResponse = preloadResponse;
        }
      } catch {
        // Preload not available for this request
      }
    }

    // Fall back to normal fetch
    if (!networkResponse) {
      networkResponse = await fetch(request);
    }

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/');
    }

    throw error;
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
