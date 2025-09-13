const CACHE_NAME = 'wwe-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/calendar.html',
  '/logo.png',
  '/WWE_Logo.svg',
  '/blank.jpg',
  '/manifest.json',
  '/apikey.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Network-first for API requests, cache-first for static assets. Provide image fallback.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // serve same-origin assets from cache first
  if (url.origin === self.location.origin) {
    if (event.request.destination === 'image') {
      event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request).then(networkResp => {
          const copy = networkResp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return networkResp;
        }).catch(()=> caches.match('/blank.jpg')))
      );
      return;
    }

    // Navigation or html -> try network then cache fallback
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
      event.respondWith(fetch(event.request).catch(()=> caches.match('/index.html')));
      return;
    }

    // For other same-origin assets, try cache first
    event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      return r;
    })).catch(()=> caches.match('/index.html')));
    return;
  }

  // For cross-origin (TMDB) requests use network-only (do not cache to avoid storing sensitive data)
  event.respondWith(fetch(event.request).catch(()=> new Response('[]', {status: 200, headers: {'Content-Type':'application/json'}})));
});
