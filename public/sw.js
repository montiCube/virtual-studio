/// <reference lib="webworker" />

const CACHE_NAME = 'virtual-studio-v1';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// URL patterns that should NEVER be cached (sensitive data)
const SENSITIVE_PATTERNS = [
  '/api/checkout',
  '/api/payment',
  '/api/user',
  '/api/order',
  '/api/auth',
  '/checkout',
  '/account',
];

/**
 * Check if a URL should be excluded from caching for security reasons
 */
function isSensitiveUrl(url) {
  const pathname = url.pathname.toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => pathname.includes(pattern));
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE contain sensitive data)
  if (request.method !== 'GET') return;

  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // SECURITY: Never cache sensitive URLs (checkout, payment, user data)
  if (isSensitiveUrl(url)) {
    return; // Let the browser handle these requests normally
  }

  // Skip cross-origin requests (external APIs, CDNs)
  if (url.origin !== self.location.origin) {
    // For external images (like Unsplash), use cache-first strategy
    if (request.destination === 'image') {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            // Don't cache non-ok responses
            if (!response.ok) return response;
            
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
            return response;
          });
        })
      );
    }
    return;
  }

  // For same-origin requests, use stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Update cache with fresh response
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw new Error('Network unavailable');
        });

      // Return cached response immediately if available, while fetching update
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
