#!/usr/bin/env node
/* Flaggschiff – Punkte auf der Seekarte (seit v5.1.1): Auf langen Linien rückt jedes Schiff jeden Tag weiter,
   Fähren im Tagespaket pendeln im Lauf des Tages hin und her. Aufruf: node tools/tests/karte.js */
"use strict";
const path = require("path"), E = require(path.resolve(__dirname, "../../js/engine.js"));
let fails = 0;
const linien = [["ham", "hel", "seebad"], ["ham", "lon", "nordsee"], ["lpl", "ny", "hansa"], ["dov", "cal", "kanalrad"], ["ham", "bla", "flussrad"], ["lpl", "bir", "wagenfaehre"]];
for (const [a, b, typ] of linien) {
  const s = E.newGame(2, "Test", { home: a === "lpl" ? "lpl" : a === "dov" ? "lon" : "ham" }); s.cash += 1e8;
  for (const sh of s.ships) E.setLine(s, sh.id, null);
  if (E.openRoute(s, a, b, false, [])) { console.log("Linie geht nicht:", a, b); fails++; continue; }
  const r = s.routes[s.routes.length - 1], err = E.buyNew(s, typ, "bar", null, false, { n: 1, line: r.id });
  if (err) { console.log(typ, err); fails++; continue; }
  let g = 0; while (g++ < 900 && !(s.ships.some(x => x.line === r.id && x.v && (x.v.st === "see" || x.v.st === "pendel")))) { if (E.duePending(s)) E.resolve(s, 0); E.advanceDay(s); }
  const sh = s.ships.find(x => x.line === r.id); let still = 0, seaDays = 0, moved = 0;
  for (let d = 0; d < 30; d++) {
    if (E.duePending(s)) E.resolve(s, 0);
    if (sh.v.st === "pendel") { const p = [.3, .45, .6, .75].map(t => E.shipPos(s, sh, t)); const ps = new Set(p.map(q => q.lat.toFixed(4) + q.lon.toFixed(4))); seaDays++; if (ps.size > 1) moved++; }
    else if (sh.v.st === "see" && sh.v.eta > s.t + 1.2) { const p0 = E.shipPos(s, sh, .5); E.advanceDay(s); if (sh.v.st === "see") { const p1 = E.shipPos(s, sh, .5); seaDays++; if (p0.lat === p1.lat && p0.lon === p1.lon) still++; else moved++; } continue; }
    E.advanceDay(s);
  }
  const ok = seaDays > 0 && still === 0 && moved > 0; if (!ok) fails++;
  console.log((ok ? "ok    " : "FEHLER") + " " + typ + " " + a + "–" + b + ": " + seaDays + " Tage geprüft, " + moved + "-mal bewegt, " + still + "-mal stehen geblieben");
}
process.exit(fails ? 1 : 0);
