// sw-offline.js
// Handles service worker registration only

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
        // Optionally log registration errors
      });
    });
  }
}

// For non-module usage (inline <script>), expose to window
typeof window !== 'undefined' && (window.swOffline = { registerServiceWorker });
