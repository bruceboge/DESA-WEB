
const CACHE_NAME = "desa-pwa-v2";
const NAVIGATION_CACHE = "desa-pwa-pages-v2";
const RUNTIME_CACHE = "desa-pwa-assets-v2";
const OFFLINE_PAGE = "/offline.html";
const PRECACHE_URLS = [OFFLINE_PAGE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          const response = await fetch(url, { cache: "reload" });
          if (!response.ok) {
            throw new Error(`Failed to cache ${url}`);
          }
          await cache.put(url, response.clone());
        })
      );
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
              name !== CACHE_NAME &&
              name !== NAVIGATION_CACHE &&
              name !== RUNTIME_CACHE
          )
          .map((name) => caches.delete(name))
      )
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) {
      const cache = await caches.open(NAVIGATION_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(request, { ignoreSearch: true });
    if (cachedResponse) {
      return cachedResponse;
    }

    const cachedHome = await caches.match("/", { ignoreSearch: true });
    if (cachedHome) {
      return cachedHome;
    }

    const offlinePage = await caches.match(OFFLINE_PAGE);
    return (
      offlinePage ||
      new Response("You are offline. Please reconnect to the internet.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

async function networkFirstAsset(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(networkFirstAsset(request));
  }
});
