#!/usr/bin/env node
/* Flaggschiff – Kohle und Kasse (seit v5.1.3): Jede Tonne kostet genau einmal Geld und genau einmal Kosten.
   Spielt drei Reedereien je drei Jahre (von Hand gefüllt, mit Kohleneinkäufer und Ausbau, eine Linie ohne Heimathafen mit Fracht)
   und prüft: Was ins Lager gekauft wird, kostet nur Geld; was aus dem Lager gebunkert wird, kostet nur Kosten (zum Einstandspreis),
   Fracht und Kai kosten beides; über die ganze Zeit gilt Kauf + Startbestand = Kosten aus dem Lager + Bestand am Ende;
   Kauf und Ausbau ändern das Eigenkapital nicht. Aufruf: node tools/tests/kohlekasse.js */
"use strict";
const path = require("path"), E = require(path.resolve(__dirname, "../../js/engine.js"));
let fehler = 0;
const fail = (fall, text) => { fehler++; console.log("FEHLER " + fall + ": " + text); };
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(a), Math.abs(b));
const wert = s => { const L = s.lager, ow = E.lagerOw(s); return L.v + ow.v; };

// Jede Änderung der Kasse mitschreiben, mit der Funktion, aus der sie kam
function kasse(s) {
  let cash = s.cash; const log = [];
  Object.defineProperty(s, "cash", { enumerable: true, configurable: true, get: () => cash, set: v => {
    const st = (new Error().stack || "").split("\n").slice(2, 7).map(l => (l.match(/at (?:Object\.)?([\w$]+)/) || [])[1]).filter(Boolean);
    log.push({ d: v - cash, st }); cash = v; } });
  return log;
}
const aus = (log, fn) => log.filter(x => x.st.includes(fn)).reduce((a, x) => a + x.d, 0);

const FAELLE = [
  { name: "Hamburg, von Hand", home: "ham", linie: ["ham", "hel"], typ: "seebad", n: 2, ke: -1 },
  { name: "Liverpool, Einkäufer und Ausbau", home: "lpl", linie: ["lpl", "ny"], typ: "hansa", n: 2, ke: 1, ausbau: true },
  { name: "Hamburg, Linie ohne Heimathafen", home: "ham", linie: ["lue", "kop"], typ: "nordsee", n: 1, ke: 1 },
];
for (const F of FAELLE) {
  let seed = 4242; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const s = E.newGame(777, "Kohlekasse", { home: F.home, diff: "normal" }); s.cash += 2e7;
  if (E.openRoute(s, F.linie[0], F.linie[1], false, [])) { fail(F.name, "Linie lässt sich nicht eröffnen"); continue; }
  const r = s.routes[s.routes.length - 1];
  for (let i = 0; i < F.n; i++) { const w = E.buyNew(s, F.typ, "bar", null, false, { n: 1, line: r.id }); if (w) { fail(F.name, "Kauf: " + w); } }
  if (F.ke >= 0) E.setStaff(s, "ke", F.ke);
  const v0 = wert(s), log = kasse(s);
  let kauf = 0, ausLager = 0, fracht = 0, kai = 0, tage = 0, ausbauGeld = 0, cur = s.cur, c0 = { k: cur.lagKauf || 0, a: cur.cost["Kohle aus dem Lager"] || 0, f: cur.cost["Kohlefracht"] || 0 };
  const kaiK = c => Object.keys(c.cost).filter(k => k.endsWith("(Kai)")).reduce((a, k) => a + c.cost[k], 0);
  let kai0 = kaiK(cur);
  const fold = c => { kauf += (c.lagKauf || 0) - c0.k; ausLager += (c.cost["Kohle aus dem Lager"] || 0) - c0.a; fracht += (c.cost["Kohlefracht"] || 0) - c0.f; kai += kaiK(c) - kai0; };
  while (E.cal(s.m).y < 1880 + 4 && !s.over) {
    // von Hand: unter 30 Tagen auf 60 Tage nachkaufen; Kauf ändert das Eigenkapital nicht
    if (F.ke < 0 && (E.lagerDays(s) == null || E.lagerDays(s) < 30)) { const q0 = s.cash, e0 = E.equity(s); if (!E.lagerBuy(s, 2000)) { if (!near(E.equity(s), e0, 1e-9)) fail(F.name, "Kauf ändert das Eigenkapital: " + (E.equity(s) - e0)); if (!(s.cash < q0)) fail(F.name, "Kauf kostet kein Geld"); } }
    if (F.ausbau && !s.lager.bau && E.lagerNext(s) && E.lagerLv(s).cap < E.coalCap(s.ships[0]) * 2) { const e0 = E.equity(s), q0 = s.cash, n = E.lagerNext(s); if (!E.lagerBuild(s)) { ausbauGeld += q0 - s.cash; if (!near(q0 - s.cash, n.price)) fail(F.name, "Ausbau kostet nicht den Preis"); if (!near(E.equity(s), e0, 1e-9)) fail(F.name, "Ausbau ändert das Eigenkapital: " + (E.equity(s) - e0)); } }
    if (E.duePending(s)) { E.resolve(s, 0); continue; }
    const x = E.advanceDay(s); tage++;
    if (s.cur !== cur) { fold(cur); cur = s.cur; c0 = { k: 0, a: 0, f: 0 }; kai0 = 0; }
    if (x && x.month) s.cash = Math.max(s.cash, 1e6);
  }
  fold(cur); c0 = { k: cur.lagKauf || 0, a: cur.cost["Kohle aus dem Lager"] || 0, f: cur.cost["Kohlefracht"] || 0 };
  const v1 = wert(s);
  // 1. Kauf + Startbestand = Kosten aus dem Lager + Bestand am Ende
  if (!near(kauf + v0, ausLager + v1, 1e-6)) fail(F.name, `Kohle geht verloren oder entsteht: Kauf ${Math.round(kauf)} + Start ${Math.round(v0)} ≠ aus dem Lager ${Math.round(ausLager)} + Ende ${Math.round(v1)}`);
  // 2. Geld für Kohle ins Lager: genau der Kaufpreis, nur in lagerBuy
  const geldKauf = -aus(log, "lagerBuy");
  if (!near(geldKauf, kauf, 1e-6)) fail(F.name, `Geld für Lagerkohle ${Math.round(geldKauf)} statt ${Math.round(kauf)}`);
  // 3. Bunkern aus dem Lager kostet kein Geld, nur Fracht und Kai
  const geldBunkern = -aus(log, "takeLager");
  if (!near(geldBunkern, fracht + kai, 1e-6)) fail(F.name, `Bunkern aus dem Lager kostet ${Math.round(geldBunkern)} Geld, erwartet Fracht ${Math.round(fracht)} + Kai ${Math.round(kai)}`);
  // 4. Fracht: 10 % des Einstandspreises, nur wo nicht im Heimathafen gebunkert wird (die erste Füllung bei der Ablieferung im Heimathafen ist frei)
  if (F.linie[0] !== F.home && F.linie[1] !== F.home) { if (!(fracht > .95 * ausLager * E.FRACHT) || fracht > ausLager * E.FRACHT * (1 + 1e-9)) fail(F.name, `Fracht ${Math.round(fracht)} statt rund ${Math.round(ausLager * E.FRACHT)}`); }
  else if (fracht > 0) fail(F.name, "Fracht im Heimathafen: " + Math.round(fracht));
  const deps = s.routes.reduce((a, x) => a + ((x.last && x.last.dep) || 0), 0);
  if (!(ausLager > 0) || !deps) fail(F.name, "es wurde nicht gefahren oder nicht gebunkert");
  console.log((fehler ? "" : "ok    ") + F.name + `: ${tage} Tage, Kauf ${Math.round(kauf).toLocaleString("de-DE")} M, aus dem Lager ${Math.round(ausLager).toLocaleString("de-DE")} M, Fracht ${Math.round(fracht).toLocaleString("de-DE")} M, Bestand ${Math.round(v1).toLocaleString("de-DE")} M` + (ausbauGeld ? `, Ausbau ${Math.round(ausbauGeld).toLocaleString("de-DE")} M (Stufe ${s.lager.lv})` : ""));
}
console.log(fehler ? fehler + " Fehler" : "Jede Tonne Lagerkohle kostet genau einmal Geld und einmal Kosten.");
process.exit(fehler ? 1 : 0);
