// Cache name bumps invalidate old caches.
const CACHE_NAME = 'prakriti-v2';

const ASSETS_TO_CACHE = [
  './',
  './index_bootstrap.html',
  './prakriti_classifier.js',
  './real_prakriti_model.js',
  './advanced_prakriti_model.js',
  './ayurvedic_feature_enhancer.js',
  './enhanced_decision_tree.js',
  './enhanced_dataset_model.js',
  './assessment.js',
  './safe_html.js',
  './ayurvedic_dosha_dataset.csv',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // addAll fails the install if any single asset 404s, which is the safer default —
      // a partial install that silently drops a critical script is worse than no SW at all.
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache same-origin GETs. Don't intercept Gemini calls or other cross-origin POSTs.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((res) => {
        // Cache successful responses for next visit.
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      })
    )
  );
});
