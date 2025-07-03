const CACHE_NAME = 'site-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/test.js',
  '/other/index.html',
  // Add more assets here if needed (e.g., '/styles.css', '/main.js')
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  let request = event.request;
  const url = new URL(request.url);

  // Handle navigation requests for multipage support
  if (request.mode === 'navigate') {
    // If the path ends with a slash (directory), try to serve /path/index.html
    if (url.pathname.endsWith('/')) {
      const indexPath = url.pathname + 'index.html';
      // If we have this index.html in the cache list, rewrite the request
      if (ASSETS_TO_CACHE.includes(indexPath)) {
        request = indexPath;
      } else if (url.pathname === '/') {
        request = '/index.html';
      }
    } else if (ASSETS_TO_CACHE.includes(url.pathname)) {
      // If the path is a known HTML file, serve it
      request = url.pathname;
    } else {
      // Fallback to main index.html for navigation
      request = '/index.html';
    }
  }

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).catch(() => {
        // For navigation, fallback to /index.html if offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 404, statusText: 'Not Found' });
      });
    })
  );
}); 