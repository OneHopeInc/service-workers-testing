const CACHE_NAME = 'site-cache-v4';
const ASSETS_TO_CACHE = [
  '/',              // Home page canonical URL
  '/style.css',
  '/test.js',
  '/view-controller.js',  // View controller script
  // Add more assets/pages here
];

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        ASSETS_TO_CACHE.map(async url => {
          try {
            const response = await fetch(url, {cache: 'reload'});
            if (response.ok && !response.redirected) {
              await cache.put(url, response.clone());
              console.log(`[SW] Cached: ${url}`);
            } else {
              console.warn(`[SW] Not cached (bad response): ${url}`, response.status, response.redirected);
            }
          } catch (err) {
            console.error(`[SW] Failed to cache: ${url}`, err);
          }
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => {
          console.log(`[SW] Deleting old cache: ${name}`);
          return caches.delete(name);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  let request = event.request;
  const url = new URL(request.url);
  const requestUrl = request.url; // Store the original URL for logging

  // Skip external requests (like Google Fonts) - let them go to network
  if (url.origin !== location.origin) {
    console.log(`[SW] External request, letting it go to network: ${requestUrl}`);
    return;
  }

  // Handle navigation requests for multipage support
  if (request.mode === 'navigate') {
    // If the path ends with a slash (directory), try to serve /path/
    if (url.pathname.endsWith('/')) {
      if (ASSETS_TO_CACHE.includes(url.pathname)) {
        request = url.pathname;
        console.log(`[SW] Rewriting navigation to: ${url.pathname}`);
      } else if (url.pathname === '/') {
        request = '/';
        console.log('[SW] Rewriting navigation to: /');
      }
    } else if (ASSETS_TO_CACHE.includes(url.pathname)) {
      request = url.pathname;
      console.log(`[SW] Navigation to cached file: ${url.pathname}`);
    } else {
      request = '/';
      console.log('[SW] Navigation fallback to: /');
    }
  }

  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        console.log(`[SW] Serving from cache: ${requestUrl}`);
        return response;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse.ok && !networkResponse.redirected) {
          console.log(`[SW] Fetched from network: ${requestUrl}`);
          return networkResponse;
        } else {
          console.warn(`[SW] Network fetch failed or redirected: ${requestUrl}`);
          if (event.request.mode === 'navigate') {
            return caches.match('/').then(fallback => {
              if (fallback) {
                return fallback;
              }
              // Return a simple offline page if / is not cached
              return new Response('<h1>Offline</h1><p>The page is not available offline.</p>', {
                headers: { 'Content-Type': 'text/html' },
                status: 200
              });
            });
          }
          return new Response('', { status: 404, statusText: 'Not Found' });
        }
      }).catch(err => {
        console.error(`[SW] Fetch error for: ${requestUrl}`, err);
        if (event.request.mode === 'navigate') {
          return caches.match('/').then(fallback => {
            if (fallback) {
              return fallback;
            }
            // Return a simple offline page if / is not cached
            return new Response('<h1>Offline</h1><p>The page is not available offline.</p>', {
              headers: { 'Content-Type': 'text/html' },
              status: 200
            });
          });
        }
        return new Response('', { status: 404, statusText: 'Not Found' });
      });
    })
  );
}); 