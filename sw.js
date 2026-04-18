const CACHE_NAME = 'webpos-v1';
const urlsToCache = [
  './',
  './index.html',
  './page-kasir.html',
  './page-produk.html',
  './page-riwayat.html',
  './page-setting.html',
  './js/firebase-config.js',
  './js/utils.js',
  './js/auth.js'
];

// Install - Cache dengan error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache file satu per satu, skip yang error
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              console.warn(`[SW] Skip cache: ${url} (not found)`);
            })
            .catch(err => {
              console.warn(`[SW] Failed cache: ${url}`, err);
            });
        });
        return Promise.allSettled(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch - Cache First dengan fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached atau fetch baru
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Opsional: Update cache dengan versi baru
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback kalau offline & tidak ada cache
        return new Response('Offline mode - Data tidak tersedia');
      })
  );
});

// Activate - Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
