// Rutas relativas: funciona en la raiz o en una subcarpeta (ej. htmlhoster.com/p/ID/public/)
importScripts("baremux/index.js");
importScripts("uv/uv.bundle.js");
importScripts("uv/uv.config.js");
importScripts(__uv$config.sw || "uv/uv.sw.js");
const uv = new UVServiceWorker();

// Scramjet (motor nuevo, para YouTube/Google/Discord...). Si falla al cargar, UV sigue funcionando.
let sj = null;
const SJP = new URL("scramjet/", self.location.href).pathname;
try {
  importScripts("scram/scramjet.all.js");
  const { ScramjetServiceWorker } = $scramjetLoadWorker();
  sj = new ScramjetServiceWorker();
} catch (e) { sj = null; }

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    try {
      if (uv.route(event)) return await uv.fetch(event);
      if (sj && new URL(event.request.url).pathname.startsWith(SJP)) {
        await sj.loadConfig();
        if (sj.route(event)) return await sj.fetch(event);
      }
      return await fetch(event.request);
    } catch (err) {
      return new Response("Proxy error: " + err, { status: 502 });
    }
  })());
});
