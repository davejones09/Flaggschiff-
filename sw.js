/* Flaggschiff – Service Worker
   Code (HTML, CSS, JS) kommt zuerst aus dem Netz, damit Updates sofort ankommen; offline aus dem Speicher.
   Bilder und Musik kommen zuerst aus dem Speicher. Ihre Adressen tragen eine Prüfsumme (js/assets.js),
   deshalb bleiben sie über Updates hinweg gespeichert, und nur geänderte Dateien werden neu geladen.
   originale/, neue-bilder/, docs/ und tools/ werden nie gespeichert. */
const CACHE = "flaggschiff-1791306574";
const MEDIA = "flaggschiff-medien";
importScripts("js/assets.js");
const CORE = ["./", "./index.html", "./css/style.css", "./js/assets.js", "./js/pwa.js", "./js/world.js", "./js/mapdata.js",
  "./js/i18n.js", "./js/engine.js", "./js/ui.js", "./manifest.webmanifest", "./icon-192.png", "./apple-touch-icon.png"];
// icon-512.png und icon-maskable-512.png braucht nur das Betriebssystem beim Installieren, deshalb nicht im Speicher
const MEDIA_URLS = new Set(Object.values(self.ASSETS).map(u => new URL(u, location.href).href));
const BASE = new URL("./", location.href).pathname;

// Beim Installieren nur das Nötigste; Bilder und Musik holt js/pwa.js danach im Hintergrund
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.map(u => new Request(u, { cache: "reload" })));
    const t = self.ASSETS.title, m = await caches.open(MEDIA);
    if (t && !(await m.match(t))) await m.add(new Request(t, { cache: "reload" }));
    await self.skipWaiting();
  })());
});

// Alte Versionen aufräumen: alter Code und Bilder oder Musik, die nicht mehr in js/assets.js stehen
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("flaggschiff-") && k !== CACHE && k !== MEDIA) await caches.delete(k);
    const m = await caches.open(MEDIA);
    for (const r of await m.keys()) if (new URL(r.url).origin === location.origin && !MEDIA_URLS.has(r.url)) await m.delete(r);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const path = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : url.pathname;
    if (/^(originale|neue-bilder|docs|tools)\//.test(path)) return;
    e.respondWith(path.startsWith("assets/") ? media(req) : code(req));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(MEDIA).then(c => c.put(req, cp)); }
      return r;
    })));
  }
});

// Netz zuerst (mit Nachfrage beim Server, damit nichts Veraltetes aus dem Browser-Cache kommt), offline aus dem Speicher
async function code(req) {
  const c = await caches.open(CACHE);
  try {
    const r = req.mode === "navigate" ? await fetch(req.url, { cache: "no-cache", credentials: "same-origin" }) : await fetch(req, { cache: "no-cache" });
    if (r.ok) c.put(req, r.clone()).catch(() => {});
    return r;
  } catch (err) {
    if (req.mode === "navigate") return (await c.match(req, { ignoreSearch: true })) || (await c.match("./")) || Response.error();
    return (await caches.match(req)) || Response.error();
  }
}

// Speicher zuerst; Musik fragt stückweise an (Range), das beantworten wir aus der gespeicherten Datei
async function media(req) {
  const m = await caches.open(MEDIA), range = req.headers.get("range");
  const hit = await m.match(req.url);
  if (hit) return range ? partial(hit, range) : hit;
  try {
    if (range) return await fetch(req); // erstes Abspielen: direkt aus dem Netz, gespeichert wird beim Nachladen
    const r = await fetch(req);
    if (r.status === 200) m.put(req.url, r.clone()).catch(() => {});
    return r;
  } catch (err) { return Response.error(); }
}

async function partial(res, range) {
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let a = 0, b = size - 1;
  if (m && m[1] !== "") { a = +m[1]; if (m[2] !== "") b = Math.min(+m[2], size - 1); }
  else if (m && m[2] !== "") a = Math.max(0, size - +m[2]);
  if (!m || a >= size || a > b) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
  return new Response(buf.slice(a, b + 1), {
    status: 206, statusText: "Partial Content",
    headers: { "Content-Type": res.headers.get("Content-Type") || "audio/mp4", "Content-Length": String(b - a + 1),
      "Content-Range": "bytes " + a + "-" + b + "/" + size, "Accept-Ranges": "bytes" }
  });
}
