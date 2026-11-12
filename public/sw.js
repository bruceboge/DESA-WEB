
const CACHE_VERSION = "desa-pwa-v2";

const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const OFFLINE_PAGE = "/offline.html";

// Only public pages approved for automatic offline page caching.
const PUBLIC_PAGES = [
  "/",
  "/about",
  "/departments",
  "/leadership",
  "/news-events",
];

function isPublicPage(pathname) {
  if (PUBLIC_PAGES.includes(pathname)) {
    return true;
  }

  // Published news and event articles.
  return /^\/news-events\/[^/]+$/.test(pathname);
}

function isCacheableStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function saveResponse(
  cacheName,
  request,
  response,
  allowNoStore = false
) {
  if (!response || !response.ok || response.type !== "basic") {
    return;
  }

  const cacheControl = response.headers.get("Cache-Control") || "";

  // Never save private responses.
  if (/private/i.test(cacheControl)) {
    return;
  }

  // Approved public pages may be saved even with no-store.
  if (/no-store/i.test(cacheControl) && !allowNoStore) {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => {
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
              ![PAGE_CACHE, STATIC_CACHE].includes(name)
          )
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never cache requests to external websites.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Public page navigation: network first, saved page if offline.
  if (request.mode === "navigate") {
    if (!isPublicPage(url.pathname)) {
      return;
    }

    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          await saveResponse(PAGE_CACHE, request, response, true);

          return response;
        } catch {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          const offlinePage = await caches.match(OFFLINE_PAGE);

          return (
            offlinePage ||
            new Response(
              "You are offline. Please reconnect to the internet.",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/plain",
                },
              }
            )
          );
        }
      })()
    );

    return;
  }

  // Cache static Next.js files and public images.
  if (isCacheableStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedAsset = await cache.match(request);

        const networkRequest = fetch(request)
          .then(async (response) => {
            await saveResponse(STATIC_CACHE, request, response);
            return response;
          })
          .catch(() => null);

        // Return a saved asset immediately, updating it in the background.
        if (cachedAsset) {
          event.waitUntil(networkRequest);
          return cachedAsset;
        }

        const networkResponse = await networkRequest;

        return (
          networkResponse ||
          new Response("", { status: 503 })
        );
      })()
    );
  }
});
