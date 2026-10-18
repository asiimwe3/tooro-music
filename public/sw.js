/* Tooro Music service worker — network-first with offline cache fallback.
   Keeps the app shell available offline; never serves stale hashed assets. */
const CACHE = "tooro-music-v1";
const CORE = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/favicon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // App shell + same-origin assets: network first, cached fallback
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
    return;
  }
  // Media (previews, art): cache-first so replayed tracks work offline
  if (/deezer|ytimg|googlevideo|audiomack|vercel-static/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then((m) =>
        m ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => caches.match("/"))
      )
    );
  }
});
