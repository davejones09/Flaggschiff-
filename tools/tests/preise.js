#!/usr/bin/env node
/* Flaggschiff – Preistest (seit v5.1.1): Jeder Druck auf + oder − ändert den angezeigten Fahrpreis, in Mark und in Pfund.
   Aufruf: node tools/tests/preise.js */
"use strict";
const path = require("path"), E = require(path.resolve(__dirname, "../../js/engine.js"));
// Anzeige wie in ui.js: eur() und pounds()
const eur = (v, gb) => v.toFixed(v < 100 || gb ? 2 : 0);
function pounds(mark) { const a = Math.abs(mark / 20.43); if (a >= 10 || (a >= 1 && Math.abs(a * 240 - Math.round(a) * 240) < .5)) return "£" + Math.round(a); if (a >= 1) { const d = Math.round(a * 240); return "£" + Math.floor(d / 240) + " " + Math.floor((d % 240) / 12) + "s " + (d % 12) + "d"; } const d = Math.max(1, Math.round(a * 240)); return Math.floor(d / 12) + "s " + (d % 12) + "d"; }
const show = (v, gb) => gb ? pounds(+eur(v, gb)) : eur(v, gb);
let fails = 0, checks = 0;
const paare = [["ham", "bla"], ["gls", "wis"], ["ham", "fin"], ["dag", "wyk"], ["lpl", "bir"], ["lpl", "dou"], ["hol", "dub"], ["lon", "grv"], ["til", "grv"], ["dov", "cal"], ["por", "ryd"], ["ham", "hel"], ["ham", "lon"], ["lpl", "ny"], ["ham", "rio"]];
for (const home of ["ham", "lpl"]) for (const [a, b] of paare) {
  const s = E.newGame(1, "Test", { home }), gb = s.country === "gb";
  if (E.openRoute(s, a, b, false, [])) continue;
  const r = s.routes[s.routes.length - 1];
  for (let c = 0; c < 3; c++) for (const dir of [1, -1]) {
    E.alignPrices(s, r.id);
    for (let k = 0; k < 40; k++) {
      if (!E.canStepPrice(s, r, c, dir)) break;
      const vor = show(r.price[c], gb); E.stepPrice(s, r.id, c, dir); const nach = show(r.price[c], gb); checks++;
      if (vor === nach) { fails++; if (fails < 20) console.log("unverändert:", home, a + "–" + b, "Klasse", c + 1, dir > 0 ? "+" : "−", vor); break; }
    }
  }
}
console.log(checks + " Schritte geprüft, " + (fails ? fails + " ohne sichtbare Änderung" : "alle sichtbar"));
process.exit(fails ? 1 : 0);
