// __BUILD_ID__ is replaced by scripts/stamp-sw.mjs after each build so every
// deploy gets a fresh cache and stale entries are dropped on activate.
const CACHE_NAME = 'modapp-__BUILD_ID__';
const STATIC_ASSETS = [
  '/manifest.json',
];

// الملفات التي يتم تخزينها مؤقتاً أثناء الاستخدام
const RUNTIME_CACHE_PATTERNS = [
  /\/assets\//,
  /\/icon-/,
  /\.css$/,
  /\.js$/,
  /\.woff2?$/,
  /\.png$/,
  /\.svg$/,
  /\.jpg$/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/ws')) return;

  if (req.mode === 'navigate') {
    // Always prefer the network for HTML — a cached index.html references
    // hashed chunks that may no longer exist after a new deploy.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            // تخزين الملفات المطابقة للأنماط المحددة
            const shouldCache = RUNTIME_CACHE_PATTERNS.some((pattern) =>
              pattern.test(url.pathname)
            );
            if (shouldCache) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
            }
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
