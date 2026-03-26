// ─── TINTAXIS SERVICE WORKER ─────────────────────────────────────────────────
// Strategy: Cache-first for static assets, network-first for pages/API,
// with explicit chapter caching for offline reading.

const CACHE_VERSION = "tintaxis-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const CHAPTER_CACHE = `${CACHE_VERSION}-chapters`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

// App shell — cached on install
const APP_SHELL = [
  "/",
  "/favicon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ─── ACTIVATE — clean old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("tintaxis-") && key !== STATIC_CACHE && key !== CHAPTER_CACHE && key !== PAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // ── Chapter API calls → cache after fetch (offline reading) ──
  if (url.pathname.startsWith("/api/chapter/") || url.pathname.startsWith("/api/book/")) {
    event.respondWith(
      caches.open(CHAPTER_CACHE).then((cache) =>
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // ── Static assets (_next/static, images, fonts) → cache-first ──
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/audio/") ||
    url.pathname.startsWith("/writers/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|woff2?|ttf|ico|css|js)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Pages (HTML navigation) → network-first, cache fallback ──
  if (event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      caches.open(PAGE_CACHE).then((cache) =>
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() =>
            cache.match(event.request).then((cached) =>
              cached || cache.match("/")
            )
          )
      )
    );
    return;
  }

  // ── Everything else → network with cache fallback ──
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ─── MESSAGE HANDLER — explicit cache requests from the app ─────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_CHAPTER") {
    const { url } = event.data;
    caches.open(CHAPTER_CACHE).then((cache) =>
      fetch(url).then((response) => {
        if (response.ok) cache.put(url, response);
      })
    );
  }

  if (event.data?.type === "CACHE_PAGES") {
    const { urls } = event.data;
    caches.open(PAGE_CACHE).then((cache) =>
      Promise.all(
        urls.map((url) =>
          fetch(url).then((response) => {
            if (response.ok) cache.put(url, response);
          }).catch(() => {})
        )
      )
    );
  }
});
