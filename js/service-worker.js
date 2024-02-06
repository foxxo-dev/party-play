const CACHE_NAME = 'party-play-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/spotify-calls.js',
  '/js/params-parser.js',
  '/become-host/main.js',
  '/become-host/index.html'
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not found in cache, fetch from network
        return fetch(event.request).then((response) => {
          // Check if valid response received
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone response to store in cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch((error) => {
        console.error('Error in fetch event:', error);
        // If fetch fails, return a fallback response
        return new Response('Fallback response goes here');
      })
  );
});
