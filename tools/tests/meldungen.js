#!/usr/bin/env node
/* Flaggschiff – Meldungen übersetzt (seit v5.1.3): Spielt die neuen Fälle durch (Kohlelager knapp und leer, Ausbau des Lagers,
   Berater, Flottenadmiralin Julia, Untergänge, alter Spielstand mit Liefervertrag) und prüft, dass jede Meldung, jedes Ereignis
   und jede Antwort auf Englisch und Spanisch übersetzt ist – Satz für Satz wie im Spiel, mit Zahlen, Namen und Schiffsnamen als Platzhalter.
   Aufruf: node tools/tests/meldungen.js */
"use strict";
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
global.window = global;
require(path.join(ROOT, "js", "i18n.js"));
const C = window.I18N_CORE;
function engine(dir) {
  for (const f of ["world.js", "engine.js"]) delete require.cache[path.join(dir, "js", f)];
  global.World = require(path.join(dir, "js", "world.js"));
  return require(path.join(dir, "js", "engine.js"));
}
const E = engine(ROOT);
const texte = new Map(); // Text → Fall
function sammeln(s, fall) {
  const add = x => { if (x && typeof x === "string" && !texte.has(x)) texte.set(x, { fall, s }); };
  for (const l of s.log.slice(0, 40)) { add(l.head); add(l.text); }
  for (const p of s.pending) { add(p.head); add(p.text); add(p.tipText); (p.list || []).forEach(add); if (p.tip) add(p.tip.label); for (const o of E.eventOptions(s, p) || []) { add(o.t); add(o.h); } }
  for (const q of s.pauseQ || []) add(q.text);
}
function tage(s, n, fall, wahl) {
  for (let g = 0; g < n; g++) {
    if (E.duePending(s)) { sammeln(s, fall); E.resolve(s, wahl ? wahl(s.pending[0]) : 0); }
    E.advanceDay(s); if (s.pauseQ && s.pauseQ.length) { sammeln(s, fall); s.pauseQ = []; }
  }
  sammeln(s, fall);
}
function spiel(seed, name, home) {
  let x = seed; Math.random = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  const s = E.newGame(seed, name || "Testreederei", { home: home || "ham", diff: "normal" }); s.cash += 5e6; return s;
}
function linie(s, a, b, type, n) {
  E.openRoute(s, a, b, false, []); const r = s.routes[s.routes.length - 1];
  for (let i = 0; i < (n || 1); i++) E.buyNew(s, type, "bar", null, false, { n: 1, line: r.id });
  return r;
}
const zuLinie = (s, r) => { for (const sh of s.ships) if (!sh.line && sh.ready <= s.m) E.setLine(s, sh.id, r.id); };

// 1. Lager läuft leer, Warnung, Schiff liegt fest, Berater rät zum Einkäufer
{ const s = spiel(11); const r = linie(s, "ham", "hel", "seebad", 2); tage(s, 200, "Lager leer", () => 1); zuLinie(s, r); tage(s, 700, "Lager leer", () => 1); }
// 2. Ausbau in drei Stufen, Berater zum Ausbau
{ const s = spiel(12); linie(s, "ham", "hel", "seebad", 1); E.lagerBuy(s, 3000);
  for (let i = 0; i < 3; i++) { E.lagerBuild(s); tage(s, 220, "Ausbau"); } }
// 3. Julia: Angebot, an Bord, Inspektion, Verkauf; abgelehnt; Reederei „Julia“; Untergang mit Julia
{ const s = spiel(13); const r = linie(s, "ham", "hel", "seebad", 2); tage(s, 200, "Julia"); zuLinie(s, r);
  const sh = s.ships.find(x => x.line); E.rename(s, sh.id, "Julia"); tage(s, 5, "Julia");
  for (let i = 0; i < 240 && !s.log.some(l => /Inspektion/.test(l.head)); i++) { s.cash = Math.max(s.cash, 1e6); E.lagerBuy(s, 1e5); tage(s, 30, "Julia"); }
  E.sellShip(s, sh.id); sammeln(s, "Julia verkauft"); }
{ const s = spiel(14); linie(s, "ham", "hel", "seebad", 1); tage(s, 200, "Julia abgelehnt"); const sh = s.ships[0]; E.rename(s, sh.id, "Julia"); tage(s, 5, "Julia abgelehnt", p => p.id === "julia" ? 1 : 0); }
{ const s = spiel(15, "Julia-Reederei"); const r = linie(s, "ham", "hel", "seebad", 1); tage(s, 240, "Julia-Reederei"); zuLinie(s, r); tage(s, 60, "Julia-Reederei");
  const sh = s.ships.find(x => x.julia); if (sh) { s.pending = []; sh.distress = true; s.pending.unshift({ id: "seenot", day: s.day, ship: sh.id, head: "Seenot", text: "", img: "ev_seenot" }); E.resolve(s, 0); sammeln(s, "Untergang mit Julia"); } }
// 4. Untergänge: aufgeben, pumpen, Hilfe rufen, Kesselexplosion; mit Kredit und Postvertrag
for (const [i, wahl] of [[0, 0], [1, 1], [2, 2], [3, 0], [4, 1]]) {
  const s = spiel(20 + i); const r = linie(s, "ham", "hel", "seebad", 3); tage(s, 220, "Untergang"); zuLinie(s, r); tage(s, 40, "Untergang");
  s.contracts.insel = { name: "Inselpost Helgoland", a: "ham", b: "hel", sub: 2800, pen: 6000, until: s.m + 36, minDeps: 400 };
  for (const sh of s.ships) { sh.insured = i !== 3; if (i === 4) sh.maint = 0; }
  const sh = s.ships.find(x => x.line && x.v && x.v.st === "see") || s.ships.find(x => x.line);
  if (i === 2) s.loans.push({ id: "test", label: "Kredit", out: 1e7, rate: 5, pay: 1000, left: 100, ship: sh.id });
  s.pending = []; sh.distress = true; sh.distressCause = ["Sturm – Leck", "Feuer im Laderaum", "Grundberührung", "Leck", "Sturm – Wassereinbruch im Maschinenraum"][i];
  s.pending.unshift({ id: "seenot", day: s.day, ship: sh.id, head: "Seenot", text: "", img: "ev_seenot" });
  for (let k = 0; k < 30 && s.ships.includes(sh); k++) { Math.random(); E.resolve(s, wahl); if (s.ships.includes(sh)) { sh.distress = true; s.pending.unshift({ id: "seenot", day: s.day, ship: sh.id, head: "Seenot", text: "", img: "ev_seenot" }); } }
  sammeln(s, "Untergang " + i);
  const X = s.pending[0] && s.pending[0].sink;
  if (X) for (const v of [X.place && X.place.sea, X.cause, X.cap && X.cap.fate, X.line && X.line.name].concat((X.line ? X.line.risk : []).map(c => c.name))) if (v && !texte.has(v)) texte.set(v, { fall: "Untergangsfenster", s });
}
// 5. Alter Spielstand (v5.1.2) mit Kohle-Liefervertrag
{ const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flaggschiff-meld-")); fs.mkdirSync(path.join(dir, "js"));
  for (const f of ["world.js", "engine.js"]) fs.writeFileSync(path.join(dir, "js", f), cp.execFileSync("git", ["-C", ROOT, "show", "c7c45c0:js/" + f]));
  try { const A = engine(dir), s = A.newGame(4711, "Altstand", { home: "ham", diff: "normal" }); s.cash = 2e6; A.openRoute(s, "ham", "hel", false, []);
    A.buyNew(s, "seebad", "bar", null, false, { n: 1, line: s.routes[0].id });
    for (let i = 0; i < 160; i++) { A.nextMonth(s); while (A.duePending(s)) A.resolve(s, 0); if (!(s.coalK || []).length && i > 6) { const o = A.coalOffer(s, 3, 1, "ham"); if (o && o.ok) A.signCoal(s, 3, 1, false, "ham"); } if ((s.coalK || []).length) break; }
    const N = engine(ROOT), n = N.migrate(JSON.parse(JSON.stringify(s))); sammeln(n, "alter Spielstand"); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); engine(ROOT); } }

// Prüfen: ganzer Text oder jeder Satz muss im Wörterbuch stehen
const names = s => Object.values(E.PORTS).map(p => p.name).concat(Object.keys(C.NAME_EN), E.MONTHS, Object.values(E.RIV).map(r => r.name), Object.values(E.SPECIAL_CAPS).map(c => c.name), [s.name], E.caps(s).map(c => c.name));
const DIC = { en: window.I18N_EN, es: window.I18N_ES };
C.setCapNames(E.CAP_NAMES.first, E.CAP_NAMES.last);
// wie trSentence im Spiel: Wörterbuch, dann die festen Muster (Vorsilben, „Linie …“, Aufzählungen mit · und Kommas, Typangaben)
function bekannt(sen, D) {
  const core = sen.trim(), key = C.norm(core).key; let m;
  if (D[key] != null || !/[a-zäöüß]{3}/.test(key.replace(/\{[qxn][A-Z]\}/g, ""))) return true;
  if ((m = core.match(/^(Entscheidung|Erfolg|Rat|Linie|Tipp):\s+(.+?)(\.?)$/s))) return bekannt(m[2], D);
  if ((m = core.match(/^Linie (.+?)\.$/))) return bekannt(m[1], D);
  if (core.includes(" · ")) return core.split(" · ").every(x => bekannt(x, D));
  if ((m = core.match(/^(.+?) \(Typ ([^)]+)\)$/))) return bekannt(m[1], D);
  if (core.includes(", ")) { const parts = core.replace(/\.$/, "").split(", "); if (parts.length > 1 && parts.every(x => D[x] != null)) return true; }
  return false;
}
const fehlt = new Map();
for (const [text, { fall, s }] of texte) {
  C.setNames(names(s));
  const core = text.trim().replace(C.PREFIX, "$2");
  for (const L of ["en", "es"]) {
    const D = DIC[L]; if (D[C.norm(core).key] != null) continue;
    for (const sen of C.sentences(core)) if (!bekannt(sen, D)) fehlt.set(L + "|" + C.norm(sen.trim()).key, fall);
  }
}
// diese Meldungen müssen in den Fällen oben vorkommen, sonst prüft der Test sie nicht
const MUSS = [/^Kohle wird knapp im Lager$/, /^Kohlelager leer: /, /^Ausbau des Kohlelagers beauftragt$/, /^Kohlenhof fertig$/, /^Bunkerstation mit eigenen Schuten fertig$/, /^Im letzten Monat lagen Ihre Schiffe/,
  /^Flottenadmiralin Julia kommt an Bord$/, /^Flottenadmiralin Julia übernimmt/, /^Inspektion durch die Flottenadmiralin$/, /^Flottenadmiralin Julia kehrt zur Marine zurück$/, /ging als Letzte von Bord/,
  /^Kohle nur noch aus dem Lager$/, /Liefervertrag ist aufgehoben/, /^Dampfer „.+“ (aufgegeben und )?gesunken$/, /Restschuld von/];
for (const re of MUSS) if (![...texte.keys()].some(x => re.test(x))) fehlt.set("Fall fehlt: " + re, "Abdeckung");
for (const [k, fall] of fehlt) console.log("fehlt  " + k + "   (" + fall + ")");
console.log(texte.size + " Meldungen geprüft, " + (fehlt.size ? fehlt.size + " Sätze ohne Übersetzung" : "alle übersetzt"));
process.exit(fehlt.size ? 1 : 0);
