#!/usr/bin/env node
/* Flaggschiff – Aufgeklapptes bleibt offen (seit v5.1.3): Jeder aufklappbare Bereich im Code braucht einen Schlüssel
   (data-sec, data-ship, data-plan, data-line oder id), sonst klappt er beim Neuzeichnen zu. Dazu im Browser (Handy und PC):
   in Werft, Flotte, Linien und Personal Bereiche auf- und zuklappen, nach unten scrollen, die Zeit laufen lassen und prüfen,
   dass Zustand und Scrollposition bleiben. Aufruf: node tools/tests/aufklappen.js */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, "..", "..");
let fehler = 0; const fail = t => { fehler++; console.log("FEHLER " + t); };

// 1. Im Code: jedes <details mit Schlüssel
const src = fs.readFileSync(path.join(ROOT, "js", "ui.js"), "utf8");
for (const m of src.matchAll(/<details[^>]{0,160}/g)) if (!/data-(sec|ship|plan|line)=|dsec\(|\bid="/.test(m[0])) fail("aufklappbarer Bereich ohne Schlüssel: " + m[0].slice(0, 90));

// 2. Im Browser
global.window = global; global.World = require(path.join(ROOT, "js", "world.js"));
const E = require(path.join(ROOT, "js", "engine.js"));
let seed = 4711; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const s = E.newGame(12345, "Testreederei", { home: "ham", diff: "normal", start: true });
for (let i = 0; i < 30; i++) { for (let g = 0; g < 80; g++) { const rep = E.nextMonth(s); if (rep || s.over) break; if (E.duePending(s)) E.resolve(s, 0); } E.lagerBuy(s, 500); }
s.tut = { done: true, ch: {} }; s.cash += 2e6;
{ const r = s.routes[0]; if (r) for (let i = 0; i < 2; i++) E.buyNew(s, "seebad", "bar", null, false, { n: 1, line: r.id }); } // mehr Linien und Schiffe: längere Seiten
E.openRoute(s, "ham", "hel", false, []); E.openRoute(s, "ham", "cux", false, []);
while (E.duePending(s)) E.resolve(s, 0);
const save = JSON.stringify(s);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".m4a": "audio/mp4", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });

// Schlüssel eines Bereichs, wie ihn der Code merkt
const KEY = d => d.dataset.sec ? "sec:" + d.dataset.sec : d.dataset.ship ? "ship:" + d.dataset.ship : d.dataset.plan ? "plan:" + d.dataset.plan : d.dataset.line ? "line:" + d.dataset.line : d.id ? "id:" + d.id : null;
(async () => {
  await new Promise(r => server.listen(0, r));
  const url = "http://localhost:" + server.address().port + "/index.html";
  const { chromium } = require("playwright");
  const br = await chromium.launch();
  for (const [vw, vh] of [[390, 844], [1440, 900]]) {
    const ctx = await br.newContext({ viewport: { width: vw, height: vh }, serviceWorkers: "block" }), pg = await ctx.newPage(), errs = [];
    pg.on("pageerror", e => errs.push(e.message));
    await pg.addInitScript(sv => { if (!sessionStorage.getItem("init")) { sessionStorage.setItem("init", "1"); localStorage.clear(); localStorage.setItem("flaggschiff-proto-1880", sv); localStorage.setItem("flaggschiff-lang", "de"); localStorage.setItem("flaggschiff-proto-1880-platz", "1"); } }, save);
    await pg.goto(url); await pg.waitForTimeout(600);
    for (const sel of ['[data-act="continue"]', '[data-act="load"]', '[data-act="cont"]']) { const b = await pg.$(sel); if (b) { await b.click().catch(() => {}); await pg.waitForTimeout(300); break; } }
    const zeit = async ms => { // Zeit laufen lassen, Ereignisse wegklicken, dann anhalten
      await pg.evaluate(() => { const b = document.querySelector('[data-act="speed"][data-v="3"]'); if (b) b.click(); });
      const t0 = Date.now(); while (Date.now() - t0 < ms) { await pg.waitForTimeout(400); await pg.evaluate(() => { const b = document.querySelector('#modal [data-act="choose"], #modal [data-act="close"], #modal [data-act="ok"]'); if (b) b.click(); }); }
      await pg.evaluate(() => { const b = document.querySelector('[data-act="speed"][data-v="0"]'); if (b) b.click(); }); await pg.waitForTimeout(300);
    };
    for (const [tab, sub] of [["werft"], ["flotte"], ["linien"], ["kontor", "personal"]]) {
      await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(200);
      if (sub) { await pg.click('[data-act="ksub"][data-v="' + sub + '"]').catch(() => {}); await pg.waitForTimeout(200); }
      // jeden zweiten Bereich umschalten (auf oder zu), Zustand merken, nach unten scrollen
      const want = await pg.evaluate(KEYsrc => { const KEY = eval(KEYsrc), w = {};
        [...document.querySelectorAll("main details")].forEach((d, i) => { const k = KEY(d); if (!k || i % 2) return; d.open = !d.open; w[k] = d.open; });
        return w; }, KEY.toString());
      await pg.waitForTimeout(200);
      const y0 = await pg.evaluate(() => { const H = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, Math.round(H * .6)); return window.scrollY; });
      // Zeit laufen lassen, bis der Bereich ganz neu gezeichnet ist (Monatswechsel oder neue Meldung)
      await pg.evaluate(() => { const m = document.querySelector("main"); if (m && m.firstElementChild) m.firstElementChild.dataset.alt = "1"; });
      let neu = false; for (let k = 0; k < 8 && !neu; k++) { await zeit(5000); neu = await pg.evaluate(() => !document.querySelector("main [data-alt]")); }
      if (!neu) fail(vw + " " + tab + ": Bereich wurde nicht neu gezeichnet");
      const got = await pg.evaluate(KEYsrc => { const KEY = eval(KEYsrc), g = {}; for (const d of document.querySelectorAll("main details")) { const k = KEY(d); if (k) g[k] = d.open; } return { g, y: window.scrollY, tab: document.querySelector("main") ? 1 : 0 }; }, KEY.toString());
      const falsch = Object.keys(want).filter(k => k in got.g && got.g[k] !== want[k]);
      if (!Object.keys(want).length) console.log("  (keine Bereiche in " + tab + ")");
      if (falsch.length) fail(vw + " " + tab + ": nach dem Neuzeichnen " + falsch.length + " von " + Object.keys(want).length + " Bereichen anders: " + falsch.slice(0, 4).join(", "));
      if (y0 > 50 && Math.abs(got.y - y0) > 40) fail(vw + " " + tab + ": Ansicht gesprungen von " + y0 + " auf " + got.y);
      console.log((falsch.length || (y0 > 50 && Math.abs(got.y - y0) > 40) ? "      " : "ok    ") + vw + " " + tab + ": " + Object.keys(want).length + " Bereiche umgeschaltet, Ansicht " + y0 + " → " + got.y);
    }
    if (errs.length) fail(vw + ": " + [...new Set(errs)].slice(0, 3).join(" / "));
    await ctx.close();
  }
  await br.close(); server.close();
  console.log(fehler ? fehler + " Fehler" : "Aufgeklapptes und Ansicht bleiben beim Neuzeichnen erhalten.");
  process.exit(fehler ? 1 : 0);
})();
