
const CACHE_NAME = "desa-pwa-v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_PAGE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("desa-pwa-") &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (
    request.method !== "GET" ||
    request.mode !== "navigate"
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cachedPage = await caches.match(OFFLINE_PAGE);

      return cachedPage || new Response(
        "You are offline. Please reconnect to the internet.",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain"
          }
        }
      );
    })
  );
});
