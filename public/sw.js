const CACHE_NAME = "uitku-shell-v1";
const APP_SHELL = ["/", "/add", "/history", "/reports", "/settings", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});

self.addEventListener("notificationclick", (event) => {
  const url = event.notification.data?.url || "/add";
  event.notification.close();
  event.waitUntil(self.clients.openWindow(url));
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "Catatan Keuanganku", {
    body: data.body || "Sudah mencatat transaksi hari ini?",
    icon: "/icon-192x192.webp",
    badge: "/icon-192x192.webp",
    data: { url: data.url || "/add" },
  }));
});
