const CACHE_NAME = 'trading-app-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/market-data/,
    /\/api\/predictions/,
    /\/api\/portfolio/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE)
                .then(cache => {
                    return fetch(request)
                        .then(response => {
                            // Cache successful responses
                            if (response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return cached version if network fails
                            return cache.match(request);
                        });
                })
        );
        return;
    }

    // Handle static assets
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then(response => {
                        // Cache new resources
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle queued actions when back online
            handleBackgroundSync()
        );
    }
});

async function handleBackgroundSync() {
    // Implement queued action processing
    console.log('Processing background sync');
}