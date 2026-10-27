// Oberflächentest: Spielstand erzeugen (neu und mit der Engine von main), dann alle Bereiche
// am Handy (390 px) und am PC (1440 px) in Deutsch, Englisch und Spanisch öffnen.
// Meldet JavaScript-Fehler und deutsche Reste in der Übersetzung. Aufruf: node tools/tests/ui.js [--bilder DIR] [--alt REV]
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process"), http = require("http");
const ROOT = path.join(__dirname, "..", "..");
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BILDER = arg("--bilder"), ALT = arg("--alt") || "main";

function engine(dir) {
  global.window = global;
  for (const f of ["world.js", "engine.js"]) delete require.cache[path.join(dir, "js", f)];
  global.World = require(path.join(dir, "js", "world.js"));
  return require(path.join(dir, "js", "engine.js"));
}
function spielen(E, home, monate) {
  let seed = 4711; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const s = E.newGame(12345, "Testreederei", { home, diff: "normal", start: true });
  for (let i = 0; i < monate; i++) {
    for (let g = 0; g < 80; g++) { const rep = E.nextMonth(s); if (rep || s.over) break; if (E.duePending(s)) E.resolve(s, 0); }
    if (E.lagerBuy && i % 3 === 0) E.lagerBuy(s, 500);
  }
  s.tut = { done: true, ch: {} };
  return s;
}
function altEngine(rev) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flaggschiff-ui-"));
  fs.mkdirSync(path.join(dir, "js"));
  for (const f of ["world.js", "engine.js"]) fs.writeFileSync(path.join(dir, "js", f), cp.execFileSync("git", ["-C", ROOT, "show", rev + ":js/" + f]));
  return dir;
}

const saves = {};
{ const E = engine(ROOT); saves.ham = spielen(E, "ham", 30); saves.lon = spielen(E, "lon", 30); }
{ const dir = altEngine(ALT); const E = engine(dir); saves.alt = spielen(E, "ham", 30); delete saves.alt.lager; fs.rmSync(dir, { recursive: true, force: true }); }

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".m4a": "audio/mp4", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });

const VIEWS = [["kontor", "uebersicht"], ["kontor", "abfahrten"], ["kontor", "statistik", "finanzen"], ["kontor", "statistik", "kohle"], ["kontor", "statistik", "linien"], ["kontor", "einkauf"], ["kontor", "personal"], ["linien"], ["flotte"], ["werft"], ["markt"], ["bank"]];
// typische deutsche Wörter, die in EN/ES nicht mehr stehen dürfen
const DE_WORDS = /\b(Kohlelager|Einstandspreis|Lagergeld|Bekohlung|Betrieb|Sonstiges|Monatsergebnis|Kosten nach Gruppen|Grund|Folgeverspätung|Nebel|Sturm|Streik|Panne|Pendler kommen|Vierteljahr|Auffüllen|Liefervertrag|Zeitkarten|Hauptbuch|Kai\))\b/;

(async () => {
  await new Promise(r => server.listen(0, r));
  const url = "http://localhost:" + server.address().port + "/index.html";
  const { chromium } = require("playwright");
  const br = await chromium.launch();
  let fehler = 0, reste = 0; const MISS = new Set();
  for (const [vw, vh] of [[390, 844], [1440, 900]]) for (const lang of ["de", "en", "es"]) for (const key of Object.keys(saves)) {
    if (key !== "ham" && lang !== "de" && !(key === "lon" && lang === "en")) continue;
    const ctx = await br.newContext({ viewport: { width: vw, height: vh }, serviceWorkers: "block" });
    const pg = await ctx.newPage(), errs = [];
    pg.on("pageerror", e => errs.push(e.message)); pg.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await pg.addInitScript(([s, l]) => { if (!sessionStorage.getItem("init")) { sessionStorage.setItem("init", "1"); localStorage.clear(); localStorage.setItem("flaggschiff-proto-1880", s); localStorage.setItem("flaggschiff-lang", l); localStorage.setItem("flaggschiff-proto-1880-platz", "1"); } window.I18_MISS = new Set(); }, [JSON.stringify(saves[key]), lang]);
    await pg.goto(url); await pg.waitForTimeout(600);
    // Weiter-Knopf auf dem Startbildschirm, falls vorhanden
    for (const sel of ['[data-act="continue"]', '[data-act="load"]', '[data-act="cont"]']) { const b = await pg.$(sel); if (b) { await b.click().catch(() => {}); await pg.waitForTimeout(300); break; } }
    for (const [t, sub, sv] of VIEWS) {
      const tb = await pg.$('#tabs [data-tab="' + t + '"], [data-tab="' + t + '"]'); if (tb) await tb.click().catch(() => {}); await pg.waitForTimeout(150);
      if (sub) { const b = await pg.$('[data-act="ksub"][data-v="' + sub + '"], [data-act="msub"][data-v="' + sub + '"]'); if (b) await b.click().catch(() => {}); await pg.waitForTimeout(150); }
      if (sv) { const b = await pg.$('[data-act="sview"][data-v="' + sv + '"]'); if (b) await b.click().catch(() => {}); await pg.waitForTimeout(150);
        const g = await pg.$('[data-act="fgrp"]'); if (g) { await g.click().catch(() => {}); await pg.waitForTimeout(100); } }
      const txt = await pg.evaluate(() => document.querySelector("main") ? document.querySelector("main").innerText : document.body.innerText);
      if (lang !== "de") { const m = txt.split("\n").filter(l => DE_WORDS.test(l)); if (m.length) { reste += m.length; console.log("  DE-Rest", lang, vw, t, sub || "", sv || "", "→", m.slice(0, 4).join(" | ")); } }
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 2) console.log("  waagrecht scrollbar:", vw, lang, key, t, sub || "", over + " px");
      if (BILDER) { fs.mkdirSync(BILDER, { recursive: true }); await pg.screenshot({ path: path.join(BILDER, [key, lang, vw, t, sub, sv].filter(Boolean).join("_") + ".png"), fullPage: true }); }
    }
    if (lang !== "de") for (const k of await pg.evaluate(() => [...window.I18_MISS])) MISS.add(k);
    if (key === "alt") { const ok = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem("flaggschiff-proto-1880") || "null"); return !!(s && s.lager); }); if (!ok) errs.push("alter Spielstand: kein Kohlelager nach dem Laden"); }
    console.log((errs.length ? "FEHLER " : "ok     ") + vw + " " + lang + " " + key + (errs.length ? ": " + [...new Set(errs)].slice(0, 5).join(" / ") : ""));
    fehler += errs.length; await ctx.close();
  }
  await br.close(); server.close();
  const neu = [...MISS].filter(k => /[A-Za-zÄÖÜäöüß]{3}/.test(k.slice(3))).sort();
  if (process.argv.includes("--fehlend")) fs.writeFileSync(arg("--fehlend"), neu.join("\n"));
  if (neu.length) console.log(neu.length + " Sätze ohne Übersetzung" + (process.argv.includes("--fehlend") ? " (Liste in " + arg("--fehlend") + ")" : ""));
  console.log(fehler ? fehler + " JavaScript-Fehler" : "Keine JavaScript-Fehler", "·", reste ? reste + " deutsche Reste" : "keine deutschen Reste");
  process.exit(fehler ? 1 : 0);
})();
