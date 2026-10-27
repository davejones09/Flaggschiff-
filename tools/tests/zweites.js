// Zweites Schiff je Linie (v5.1.1): Lohnt sich ein zweites Schiff auf einer starken Linie, und bleibt es auf einer schwachen ein Verlust?
// Jede Linie wird mit einem und mit zwei Schiffen gleichen Typs gespielt, ab Ablieferung fünf Jahre lang, über mehrere Seeds gemittelt.
// Gezählt wird das Linienergebnis (Einnahmen minus Kohle, Gebühren, Heuer, Wartung, Versicherung) abzüglich Kapitalkosten der Schiffe
// (5 % Zins und 5 % Abschreibung im Jahr auf den Neupreis). Aufruf: node tools/tests/zweites.js [--laeufe N] [--engine DIR]
const path = require("path");
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const DIR = arg("--engine") || path.join(__dirname, "..", "..");
global.window = global;
global.World = require(path.join(DIR, "js", "world.js"));
const E = require(path.join(DIR, "js", "engine.js"));
const LAEUFE = +(arg("--laeufe") || 4), JAHRE = 5;

const LINIEN = [
  { home: "lon", a: "lon", b: "grv", type: "flussrad", stark: true },
  { home: "lpl", a: "lpl", b: "bir", type: "wagenfaehre", stark: true },
  { home: "ham", a: "ham", b: "hel", type: "seebad", stark: false }, // 1880 fährt ein Seebäderschiff schon fast jeden Tag, und Badegäste warten gern
  { home: "ham", a: "ham", b: "lon", type: "nordsee", stark: true },
  { home: "ham", a: "dag", b: "wyk", type: "inselpost", stark: false },
  { home: "lon", a: "til", b: "grv", type: "wagenfaehre", stark: false },
];

// Ereignisse wie die Bots in simulation.js entscheiden
const ABLEHNEN = new Set(["sonder", "kapitan", "berater", "uebernahme", "charter", "koch", "kaufangebot", "altschiff"]);
function entscheiden(s, ev) {
  const opts = E.eventOptions(s, ev) || []; if (!opts.length) return 0;
  if (ABLEHNEN.has(ev.id)) return opts.length - 1;
  if (ev.id === "seenot") return Math.min(2, opts.length - 1);
  if (ev.id === "konzession") return 2;
  let i = 0; while (i < opts.length - 1 && opts[i].ok === false) i++; return i;
}
function rng(seed) { let x = seed >>> 0 || 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; }
function spielen(L, n, seed) {
  Math.random = rng(seed * 7919 + 13);
  const s = E.newGame(seed, "Test", { home: L.home, diff: "normal" });
  s.cash = 1e6 + n * 1.2 * E.newPrice(s, L.type);
  if (E.openRoute(s, L.a, L.b, false, [])) throw new Error("Linie geht nicht: " + L.a + "-" + L.b);
  const r = s.routes[s.routes.length - 1];
  for (let i = 0; i < n; i++) { const e = E.buyNew(s, L.type, "bar", null, false, { n: 1, line: r.id }); if (e) throw new Error(e); }
  const preis = E.newPrice(s, L.type), kapital = n * preis * .10 / 12;
  let erg = 0, mon = 0, pax = 0, load = 0, ab = null, no = 0, dem = 0;
  for (let g = 0; g < 12 * (JAHRE + 3) && mon < 12 * JAHRE; g++) {
    for (let k = 0; k < 80; k++) { const rep = E.nextMonth(s); if (rep || s.over) break; if (E.duePending(s)) E.resolve(s, entscheiden(s, s.pending[0])); }
    if (s.cash < 2e5) s.cash = 2e5;
    if (ab == null) { if (s.ships.every(x => x.ready <= s.m - 1) && r.last && r.last.m === s.m - 1) ab = s.m; else continue; }
    const l = r.last; if (!l || l.m !== s.m - 1) continue;
    erg += l.rev - l.cost - (l.fixed || 0) - kapital; pax += l.pax || 0; load += l.load || 0; mon++; for (const c of l.cls || []) { no += c.no || 0; dem += c.dem || 0; }
  }
  return { jahr: erg / mon * 12, pax: pax / mon * 12, load: load / mon, ab: no / Math.max(1, pax + no), dem: dem / mon * 12 };
}

let fehler = 0;
for (const L of LINIEN) {
  const R = [1, 2].map(n => { const xs = []; for (let i = 0; i < LAEUFE; i++) xs.push(spielen(L, n, 101 + i)); return { jahr: xs.reduce((a, x) => a + x.jahr, 0) / xs.length, pax: xs.reduce((a, x) => a + x.pax, 0) / xs.length, load: xs.reduce((a, x) => a + x.load, 0) / xs.length, ab: xs.reduce((a, x) => a + x.ab, 0) / xs.length, dem: xs.reduce((a, x) => a + x.dem, 0) / xs.length }; });
  const plus = R[0].jahr > 0 ? R[1].jahr / R[0].jahr - 1 : null;
  const ok = L.stark ? R[1].jahr >= R[0].jahr + .2 * Math.abs(R[0].jahr) : R[1].jahr < R[0].jahr;
  if (!ok) fehler++;
  console.log((ok ? "ok     " : "FEHLER ") + (L.stark ? "stark   " : "schwach ") + (L.a + "–" + L.b).padEnd(9) + " " + L.type.padEnd(12) +
    " 1 Schiff: " + Math.round(R[0].jahr).toLocaleString("de-DE").padStart(9) + " M/J, " + Math.round(R[0].pax).toLocaleString("de-DE").padStart(7) + " Fahrg., Ausl. " + Math.round(R[0].load * 100) + " %, abgewiesen " + Math.round(R[0].ab * 100) + " %, Nachfrage " + Math.round(R[0].dem).toLocaleString("de-DE") +
    " | 2 Schiffe: " + Math.round(R[1].jahr).toLocaleString("de-DE").padStart(9) + " M/J, " + Math.round(R[1].pax).toLocaleString("de-DE").padStart(7) + " Fahrg., Ausl. " + Math.round(R[1].load * 100) + " %" +
    (plus != null ? " | " + (plus >= 0 ? "+" : "") + Math.round(plus * 100) + " %" : ""));
}
console.log(fehler ? fehler + " Linien verfehlen das Ziel" : "Alle Linien erfüllen das Ziel");
process.exit(fehler ? 1 : 0);
