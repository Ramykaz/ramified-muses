/* Offline copy of the app, so it works on the metro with no signal. */
const CACHE = "prep-v1";
const FILES = ["/prep/", "/prep/index.html", "/prep/prep.css", "/prep/prep.js", "/prep/prep-data.js", "/prep/icon.svg", "/prep/manifest.webmanifest"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// cached copy first (fast, works offline), then refresh it in the background
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || !url.pathname.startsWith("/prep")) return;
  const key = req.mode === "navigate" ? "/prep/index.html" : url.pathname;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key);
    const fresh = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
    return hit || (await fresh) || new Response("Offline", { status: 503 });
  }));
});
