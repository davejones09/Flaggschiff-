// Alte Spielstände (v5.1.1): Mit der Engine von v4.4.3, v5.0.1 und v5.1 je einen Spielstand drei Jahre spielen,
// dann mit der neuen Engine laden (E.migrate) und zwei Jahre weiterspielen. Prüft: kein Fehler, Kohlelager angelegt,
// Schiffe und Linien noch da, Zahlen endlich. Aufruf: node tools/tests/spielstaende.js
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const STAENDE = [["v4.4.3", "651cc8c"], ["v5.0.1", "c30aa2e"], ["v5.1", "87cccdd"]];
const LINIEN = [["ham", "ham", "hel", "seebad"], ["lpl", "lpl", "bir", "hafen"], ["lon", "lon", "grv", "hafen"]];

function engine(dir) {
  global.window = global;
  for (const f of ["world.js", "engine.js"]) delete require.cache[path.join(dir, "js", f)];
  global.World = require(path.join(dir, "js", "world.js"));
  const E = require(path.join(dir, "js", "engine.js")); if (E.setStrict) E.setStrict(true); return E;
}
function rng(seed) { let x = seed >>> 0 || 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; }
function spielen(E, s, monate) {
  for (let i = 0; i < monate; i++) {
    for (let g = 0; g < 80; g++) { const rep = E.nextMonth(s); if (rep || s.over) break; if (E.duePending(s)) { const o = E.eventOptions ? E.eventOptions(s, s.pending[0]) || [] : []; E.resolve(s, s.pending[0].id === "konzession" ? 1 : Math.max(0, o.length - 1)); } } // Konzession: fair bieten, sonst ablehnen
    if (s.cash < 1e5) s.cash = 1e5;
  }
}
let fehler = 0;
for (const [name, rev] of STAENDE) for (const [home, a, b, type] of LINIEN) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flaggschiff-alt-")); fs.mkdirSync(path.join(dir, "js"));
  for (const f of ["world.js", "engine.js"]) fs.writeFileSync(path.join(dir, "js", f), cp.execFileSync("git", ["-C", ROOT, "show", rev + ":js/" + f]));
  let text;
  try {
    Math.random = rng(77);
    const A = engine(dir), s = A.newGame(4711, "Altstand", { home, diff: "normal" });
    s.cash = 2e6; A.openRoute(s, a, b, false, []); const r = s.routes[s.routes.length - 1];
    for (let i = 0; i < 2; i++) A.buyNew(s, type, "bar", null, false, { n: 1, line: r.id });
    if (A.signCoal && A.coalOffer) { try { const o = A.coalOffer(s, 3, 1, home); if (o && o.ok) A.signCoal(s, 3, 1, false, home); } catch (e) { } }
    spielen(A, s, 36);
    text = JSON.stringify(s);
  } catch (e) { console.log("FEHLER " + name + " " + home + ": alter Stand ließ sich nicht erzeugen – " + e.message); fehler++; continue; }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
  try {
    const E = engine(ROOT), s = E.migrate(JSON.parse(text)), schiffe = s.ships.length, linien = s.routes.length;
    spielen(E, s, 24);
    const probleme = [];
    if (!s.lager) probleme.push("kein Kohlelager");
    if (s.ships.length < schiffe - 1 || s.routes.length < linien) probleme.push("Schiffe oder Linien verloren (" + schiffe + "→" + s.ships.length + ", " + linien + "→" + s.routes.length + ": " + s.log.filter(x => /onzession|geschlossen|aufgegeben|verloren/i.test(x.head + x.text)).slice(0, 3).map(x => x.head).join("; ") + ")");
    if (!Number.isFinite(s.cash) || !Number.isFinite(E.equity(s))) probleme.push("Kasse oder Eigenkapital nicht endlich");
    if (!s.log.some(x => x.head === "Ihr Kohlelager ist eingerichtet")) probleme.push("keine Meldung zum Kohlelager");
    console.log((probleme.length ? "FEHLER " : "ok     ") + (name + " " + home).padEnd(12) + " geladen und zwei Jahre gespielt: " + s.ships.length + " Schiffe, Lager " + Math.round(s.lager.t) + " von " + s.lager.cap + " t, Eigenkapital " + Math.round(E.equity(s)).toLocaleString("de-DE") + (probleme.length ? " – " + probleme.join(", ") : ""));
    fehler += probleme.length;
  } catch (e) { console.log("FEHLER " + name + " " + home + ": " + e.stack.split("\n").slice(0, 3).join(" ")); fehler++; }
}
console.log(fehler ? fehler + " Fehler" : "Alle alten Spielstände laden und laufen");
process.exit(fehler ? 1 : 0);
