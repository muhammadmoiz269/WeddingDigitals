// Minimal service worker — satisfies Chrome PWA installability requirement.
// Network-first with no precaching to avoid install failures in dev/SSR.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Let the browser handle everything — SW is registered only for PWA installability.
});

// ─── Web Push ─────────────────────────────────────────────────────────────────

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Failed to parse push payload', e);
  }

  const {
    heading = 'Shahi Bulawa',
    description = '',
    bannerImageUrl,
    iconUrl,
    ctaUrl,
    campaignId,
  } = data;

  // Normalize to an absolute URL so openWindow never resolves relative to sw.js
  const target = new URL(ctaUrl && ctaUrl.trim() ? ctaUrl : '/', self.location.origin).href;

  const showAndTrack = async () => {
    await self.registration.showNotification(heading, {
      body: description,
      image: bannerImageUrl || undefined,
      icon: iconUrl || '/images/logo.ico.png',
      badge: '/images/logo.ico.png',
      data: { ctaUrl: target, campaignId },
    });

    // Fire-and-forget delivery tracking
    if (campaignId) {
      try {
        const sub = await self.registration.pushManager.getSubscription();
        if (sub) {
          fetch('/api/push/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              endpoint: sub.endpoint,
              type: 'delivered',
            }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error('[SW:push] Failed to track delivery:', err);
      }
    }
  };

  event.waitUntil(showAndTrack());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const { ctaUrl, campaignId } = event.notification.data || {};

  // ctaUrl is already normalized to an absolute URL by the push handler
  const target = new URL(ctaUrl && ctaUrl.trim() ? ctaUrl : '/', self.location.origin).href;

  const handleClick = async () => {
    // Track open
    if (campaignId) {
      try {
        const sub = await self.registration.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              endpoint: sub.endpoint,
              type: 'opened',
            }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error('[SW:notificationclick] Failed to track open:', err);
      }
    }

    // Focus an open tab or open a new window
    const clientsList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });
    for (const client of clientsList) {
      if (client.url === target && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(target);
    }
  };

  event.waitUntil(handleClick());
});
