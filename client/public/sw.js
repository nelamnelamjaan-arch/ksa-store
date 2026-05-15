/**
 * KSA Store PWA — minimal service worker (pass-through fetch).
 * Extend with precache / runtime strategies when you add offline flows.
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
