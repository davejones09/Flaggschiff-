#!/usr/bin/env node
/* Flaggschiff – „Kohle wird knapp“ (seit v5.1.1): Auf Hamburg – Amsterdam und anderen Linien nahe der Reichweite
   meldet kein Schiff öfter als einmal im Jahr Kohlemangel. Jeder Schiffstyp, der die Linie fahren darf, ab seinem Baujahr, 6 Läufe über 400 Tage.
   Aufruf: node tools/tests/kohle.js [von-nach …]   (Standard: ham-ams) */
"use strict";
const path = require("path"), E = require(path.resolve(__dirname, "../../js/engine.js"));
const linien = process.argv.slice(2).length ? process.argv.slice(2).map(x => x.split("-")) : [["ham", "ams"]];
let fails = 0;
for (const [a, b] of linien) for (const ty of E.TYPE_ORDER) {
  const T = E.TYPES[ty]; let sum = 0, n = 0, why = null;
  for (let seed = 1; seed <= 6; seed++) {
    const s = E.newGame(seed, "Test", { home: a === "lpl" || a === "lon" ? a : "ham" }); s.cash += 1e8;
    while (E.cal(s.m).y < (T.from || 1880)) s.m++;
    if (E.openRoute(s, a, b, false, [])) { why = "Linie"; break; }
    const r = s.routes[s.routes.length - 1]; why = E.canServe(s, ty, a, b, false, []); if (why) break;
    for (const sh of s.ships) E.setLine(s, sh.id, null);
    why = E.buyNew(s, ty, "bar", null, false, { n: 1, line: r.id }); if (why) break;
    E.lagerBuy(s, 1e9);
    let k = 0, t0 = null;
    for (let g = 0; g < 4000; g++) {
      if (E.duePending(s)) { if (s.pending[0].id === "kohleknapp") k++; E.resolve(s, 0); }
      const x = E.advanceDay(s); if (!x) continue;
      if (x.month) { s.cash += 1e6; E.lagerBuy(s, 1e9); }
      if (t0 == null && s.ships.some(q => q.line === r.id && q.ready <= s.m)) t0 = s.t;
      if (t0 != null && s.t - t0 >= 400) break;
    }
    sum += k; n++;
  }
  if (why) continue;
  const proJahr = sum / n * 365 / 400, ok = proJahr <= 1; if (!ok) fails++;
  console.log((ok ? "ok    " : "FEHLER") + " " + a + "–" + b + " " + T.name + " (" + (T.from || 1880) + ", Reichweite " + T.range + " sm): " + proJahr.toFixed(2) + " Meldungen im Jahr");
}
process.exit(fails ? 1 : 0);
