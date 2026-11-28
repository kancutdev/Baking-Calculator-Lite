/**
 * Baking Calculator Lite - Service Worker
 * Dukungan Offline-First untuk kalkulator HPP dan cache produk affiliate
 */

const CACHE_NAME = 'baking-calc-lite-v1.3.0';

// Daftar aset inti yang di-cache saat install (AFFILIATE JSON TIDAK DI-CACHE)
const CORE_ASSETS = [
  './',
  './index.html',
  './products.html',
  './about.html',
  './404.html',
  './style.css',
  './responsive.css',
  './affiliate-config.js',
  './analytics-config.js',
  './manifest.webmanifest',
  './js/utils.js',
  './js/validation.js',
  './js/storage.js',
  './js/analytics.js',
  './js/calculator.js',
  './js/affiliate.js',
  './js/app.js',
  './js/products-page.js',
  './assets/logo/logo.svg',
  './assets/logo/logo-horizontal.svg',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/images/placeholder-product.svg'
];

// 1. Install Event: Cache seluruh aset inti
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Strategi Network-First untuk JSON/HTML dan Cache-First untuk Aset Statis
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Abaikan request bukan GET atau skema di luar http/https
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Khusus request JSON affiliate: MURNI NETWORK ONLY (Tanpa Cache, Tanpa Fallback Cache)
  if (url.pathname.includes('affiliate-products.json') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
    );
    return;
  }

  // Jika navigasi halaman HTML: Network-first dengan fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Untuk aset CSS, JS, Gambar, Font: Cache-First dengan background revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background revalidate
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});
