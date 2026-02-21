const CACHE = "timer-" + self.registration.scope; // scope değişmez ama yine de isim sabit olur
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    const res = await fetch(e.request);
    // HTML her zaman ağdan gelsin + cache’e yeni yazılsın (güncellemeyi kapar)
    const url = new URL(e.request.url);
    if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
      const cache = await caches.open(CACHE);
      cache.put(e.request, res.clone());
    }
    return res;
  })());
});
