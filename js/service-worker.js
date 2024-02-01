self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('party-play-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/js/spotify-calls.js',
        '/js/params-parser.js'
        // Add other files and dependencies that need to be cached
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
