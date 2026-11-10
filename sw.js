// FORZATO IL BUMP A V9 PER FORZARE L'AGGIORNAMENTO DELLA CACHE CON LIBRERIE LOCALI
const CACHE_NAME = 'gestionale-cache-v9-titanium'; 
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './bootstrap.min.css',
  './bootstrap.bundle.min.js',
  './jspdf.umd.min.js',
  './jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  // ISOLAMENTO RIGIDO: Il traffico delle API non deve MAI essere intercettato o storpiato dalla cache
  if (event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
