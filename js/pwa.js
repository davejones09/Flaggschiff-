/* Web-App: Titelbild früh anfordern, Service Worker anmelden und danach Bilder und Musik
   still im Hintergrund in den Speicher holen, damit das Spiel auch offline vollständig läuft. */
(function () {
  "use strict";
  const A = self.ASSETS || {};
  // Ist der zuletzt gewählte Spielstand-Platz leer, kommt zuerst das Hauptmenü: Titelbild (am PC das breite) schon laden, während der Code noch kommt
  try {
    const n = +localStorage.getItem("flaggschiff-proto-1880-platz") || 1, key = "flaggschiff-proto-1880" + (n > 1 ? "-" + n : "");
    const t = window.matchMedia && matchMedia("(min-width: 1100px)").matches && A.title_wide ? A.title_wide : A.title;
    if (t && !localStorage.getItem(key)) new Image().src = t;
  } catch (e) { }
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
