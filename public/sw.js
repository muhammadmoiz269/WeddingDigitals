// Minimal service worker — satisfies Chrome PWA installability requirement.
// Network-first with no precaching to avoid install failures in dev/SSR.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle everything — SW is registered only for PWA installability.
});
