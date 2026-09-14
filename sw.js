// ponytail: hardcoded precache list, bump CACHE_NAME when the file list changes
const CACHE_NAME = 'drpciv-v1';
const ASSETS = [
  'index.html',
  'study.html',
  'ids.js',
  'translations_ru.js',
  'topics.js',
  'unresolved.js',
  'questions.js',
  ...Array.from({ length: 15 }, (_, i) => `qchunks/questions.part${String(i).padStart(2, '0')}.js`),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
