/* Web-App: Titelbild früh anfordern, Service Worker anmelden und danach Bilder und Musik
   still im Hintergrund in den Speicher holen, damit das Spiel auch offline vollständig läuft. */
(function () {
  "use strict";
  const A = self.ASSETS || {};
  // Ohne Spielstand kommt zuerst der Startbildschirm: Titelbild schon laden, während der Code noch kommt
  try { if (A.title && !localStorage.getItem("flaggschiff-proto-1880")) new Image().src = A.title; } catch (e) { }
  if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  // Eins nach dem anderen, nur was noch fehlt; bricht ohne Netz ab und macht beim nächsten Start weiter
  async function warm() {
    if (!navigator.serviceWorker.controller || !self.caches) return;
    for (const url of Object.values(A)) {
      if (!navigator.onLine) return;
      try {
        if (await caches.match(url)) continue;
        const r = await fetch(url);
        if (!r.ok) continue;
        await r.arrayBuffer();
        await new Promise(res => setTimeout(res, 120));
      } catch (e) { return; }
    }
  }
  const later = () => setTimeout(warm, 5000);
  if (navigator.serviceWorker.controller) window.addEventListener("load", later);
  else navigator.serviceWorker.addEventListener("controllerchange", later, { once: true });
})();
