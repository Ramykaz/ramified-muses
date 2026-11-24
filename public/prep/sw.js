/* Offline copy of the app, so it works on the metro with no signal. */
const CACHE = "prep-v3";
const FILES = ["/prep/", "/prep/index.html", "/prep/prep.css", "/prep/prep.js", "/prep/prep-data.js", "/prep/icon.svg", "/prep/manifest.webmanifest",
  // GRE Quant lives inside Commute Prep, so one install covers both
  "/prep/math/", "/prep/math/index.html", "/prep/math/math.css", "/prep/math/math.js", "/prep/math/l-arith.js", "/prep/math/l-alg.js", "/prep/math/l-geo.js", "/prep/math/l-data.js", "/prep/math/l-more.js", "/prep/math/mock.js", "/prep/math/mock2.js", "/prep/math/widgets.js", "/prep/math/katex/katex.min.js", "/prep/math/katex/katex.min.css", "/prep/math/katex/fonts/KaTeX_AMS-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Caligraphic-Bold.woff2", "/prep/math/katex/fonts/KaTeX_Caligraphic-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Fraktur-Bold.woff2", "/prep/math/katex/fonts/KaTeX_Fraktur-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Main-Bold.woff2", "/prep/math/katex/fonts/KaTeX_Main-BoldItalic.woff2", "/prep/math/katex/fonts/KaTeX_Main-Italic.woff2", "/prep/math/katex/fonts/KaTeX_Main-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Math-BoldItalic.woff2", "/prep/math/katex/fonts/KaTeX_Math-Italic.woff2", "/prep/math/katex/fonts/KaTeX_SansSerif-Bold.woff2", "/prep/math/katex/fonts/KaTeX_SansSerif-Italic.woff2", "/prep/math/katex/fonts/KaTeX_SansSerif-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Script-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Size1-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Size2-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Size3-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Size4-Regular.woff2", "/prep/math/katex/fonts/KaTeX_Typewriter-Regular.woff2"];
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
  const key = req.mode === "navigate" ? (url.pathname.startsWith("/prep/math") ? "/prep/math/index.html" : "/prep/index.html") : url.pathname;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key);
    const fresh = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
    return hit || (await fresh) || new Response("Offline", { status: 503 });
  }));
});
