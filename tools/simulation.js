#!/usr/bin/env node
/* Flaggschiff – Balance-Simulation für „Kohle und Küche“ (v4.5) und „Zeitung, Börse und Einführung“ (v4.6)

   Bots führen je Linienart eine kleine Reederei über 40 Betriebsjahre und spielen dabei feste Strategien.
   Verglichen wird der Gewinn (Summe der Monatsergebnisse, ohne Schiffskäufe), gemittelt über viele Läufe.
   Geprüft wird:
     fahrt    Sparfahrt, Normal, Volldampf, Regel des Maschineninspektors: keine Stufe überall die beste
     kueche   einfach, ordentlich, fein, eigene Küche, Caterer: keine Stufe überall die beste
     vertrag  Kohle-Lieferverträge lohnen sich nicht immer
     boerse   „nur Aktien“ bringt im Schnitt weniger als eine gut geführte Reederei (Rendite auf das eingesetzte Kapital)
     hauszeche  über 50 % einer Zeche lohnt sich nur für große Flotten (verglichen mit demselben Geld in einem breiten Depot)
     prokurist  knapp bezahlt liegt er unter dem Markt, sehr gut leicht darüber (verglichen mit einem breiten Depot ohne Prokurist)
     alt      wer nichts Neues anfasst, steht im Schnitt nicht schlechter da als mit v4.5

   Aufruf im Hauptordner (Node 18 oder neuer, für „alt“ auch git):
     node tools/simulation.js                  alle Prüfungen (einige Minuten, nutzt alle Prozessorkerne)
     node tools/simulation.js --laeufe 8       weniger Läufe je Strategie (Standard 24): schneller, aber ungenauer
     node tools/simulation.js --nur fahrt      nur eine Prüfung (fahrt, kueche, vertrag, boerse, hauszeche, prokurist, alt; mehrere mit Komma)
     node tools/simulation.js --linien hochsee nur bestimmte Linienarten (Schlüssel siehe LINIEN)
     node tools/simulation.js --jahre 40       Betriebsjahre je Lauf
     node tools/simulation.js --alt eb1bb23    Vergleichsstand für „alt“ (Standard: v4.5)
     node tools/simulation.js --json datei     Ergebnisse zusätzlich als JSON speichern
*/
"use strict";
const path = require("path"), fs = require("fs"), os = require("os"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..");

// ---------- Linienarten: Heimathafen, Linien, Schiffe je Linie, Schiffstypen nach Baujahr ----------
const LINIEN = {
  faehre: { name: "Fähre (Dover–Calais)", home: "lon", start: 1880, routes: [["dov", "cal"]], per: 2, types: ["moewe", "f12", "f35"] },
  kueste: { name: "Küste und Bäder (Hamburg–Helgoland, Mai bis September)", home: "ham", start: 1880, routes: [["ham", "hel"]], per: 2, types: ["seebad", "kaiserbad", "f24"], saison: [4, 8] },
  see: { name: "Nord- und Ostsee (Hamburg–London, Lübeck–Kopenhagen)", home: "ham", start: 1880, routes: [["ham", "lon"], ["lue", "kop"]], per: 1, types: ["nordsee", "nacht", "turbine", "n24"] },
  hochsee: { name: "Hochsee (Liverpool–New York)", home: "lpl", start: 1880, routes: [["lpl", "ny"]], per: 2, types: ["hansa", "o12", "o24"] },
  kreuz: { name: "Vergnügungsreise (Hamburg–Bergen, ab 1891)", home: "ham", start: 1891, routes: [["ham", "ber", true]], per: 1, types: ["kreuz", "o24"] },
};

// ---------- Strategien ----------
const kq = (a, b, c) => (E, s) => { E.setKq(s, 0, a); E.setKq(s, 1, b); E.setKq(s, 2, c); };
const caterer = (k, q) => ({
  start: (E, s) => { q(E, s); E.signCaterer(s, k, 3); },
  monat: (E, s) => { const K = E.kueche(s); if (!E.catOn(s, K.cat) && !(K.notUntil >= s.m) && !s.pending.some(p => p.id === "catverl")) E.signCaterer(s, k, 3); },
});
const vertrag = (years, share) => ({ monat: (E, s) => { if (!E.coalActive(s).length && E.coalOffer(s, years, share).ok) E.signCoal(s, years, share); } });
// Börse: Kapital, das die Bots anlegen (Mark von 1880)
const KAPITAL = 1e6;
const breit = (E, s, betrag) => { const ks = E.BO_ORDER.filter(k => E.boListed(s, k)); for (const k of ks) E.boBuy(s, k, E.boFor(s, k, betrag / ks.length)); };
const boStart = f => (E, s) => { s.bo.on = true; s.cash += KAPITAL * 1.3; f(E, s); };
const STRAT = {
  basis: { gruppe: ["fahrt", "kueche", "vertrag", "alt", "boerse", "hauszeche", "prokurist"], name: "nichts anfassen (Normal, ordentlich, ohne Vertrag)" },
  aktien: { gruppe: ["boerse", "hauszeche", "prokurist"], name: "1 Mio. Mark breit in Aktien, halten", kapital: KAPITAL, start: boStart((E, s) => breit(E, s, KAPITAL)) },
  hz: { gruppe: ["hauszeche"], name: "Hauszeche: 51 % einer Zeche", kapital: KAPITAL, start: boStart((E, s) => { const c = s.bo.co.zeche1; E.boBuy(s, "zeche1", Math.ceil(c.n * .51)); }) },
  pk0: { gruppe: ["prokurist"], name: "Prokurist knapp, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 0); E.pkSet(s, KAPITAL); }) },
  pk1: { gruppe: ["prokurist"], name: "Prokurist Tarif, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 1); E.pkSet(s, KAPITAL); }) },
  pk3: { gruppe: ["prokurist"], name: "Prokurist sehr gut, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 3); E.pkSet(s, KAPITAL); }) },
  spar: { gruppe: ["fahrt"], name: "Sparfahrt", start: (E, s) => E.setFahrt(s, "spar") },
  voll: { gruppe: ["fahrt"], name: "Volldampf", start: (E, s) => E.setFahrt(s, "voll") },
  regel: { gruppe: ["fahrt"], name: "Maschineninspektor (Tarif), Regel 125 % / 90 %", start: (E, s) => E.setStaff(s, "mi", 1) },
  regelSG: { gruppe: ["fahrt"], name: "Maschineninspektor (sehr gut), Regel 125 % / 90 %", start: (E, s) => E.setStaff(s, "mi", 3) },
  einfach: { gruppe: ["kueche"], name: "einfach in allen Klassen", start: kq(0, 0, 0) },
  fein: { gruppe: ["kueche"], name: "fein in allen Klassen", start: kq(2, 2, 2) },
  gemischt: { gruppe: ["kueche"], name: "1. Klasse fein, 2. ordentlich, Zwischendeck einfach", start: kq(2, 1, 0) },
  fein1: { gruppe: ["kueche"], name: "1. Klasse fein, sonst ordentlich", start: kq(2, 1, 1) },
  eigen: { gruppe: ["kueche"], name: "eigene Küche (Proviantmeister Tarif), ordentlich", start: (E, s) => { E.setStaff(s, "pm", 1); E.setEigen(s, true); } },
  solide: Object.assign({ gruppe: ["kueche"], name: "solider Caterer, 1. Klasse fein, sonst ordentlich" }, caterer("solide", kq(2, 1, 1))),
  billig: Object.assign({ gruppe: ["kueche"], name: "Billig-Caterer, einfach in allen Klassen" }, caterer("billig", kq(0, 0, 0))),
  v1: Object.assign({ gruppe: ["vertrag"], name: "immer 1 Jahr, 50 % des Verbrauchs" }, vertrag(1, .5)),
  v5: Object.assign({ gruppe: ["vertrag"], name: "immer 5 Jahre, 100 % des Verbrauchs" }, vertrag(5, 1)),
  guenstig: Object.assign({ gruppe: ["vertrag"], name: "5 Jahre, 100 %, nur wenn Kohle unter 90 % kostet" }, { monat: (E, s) => { if (!E.coalActive(s).length && s.coal < .9 && E.coalOffer(s, 5, 1).ok) E.signCoal(s, 5, 1); } }),
  einkauf: { gruppe: ["vertrag"], name: "Kohleneinkäufer (gut): 3 Jahre 100 %, verlängert unter 105 %",
    start: (E, s) => { E.setStaff(s, "ke", 2); E.setStaff(s, "keRenew", 105); }, monat: (E, s) => { if (!E.coalActive(s).length && s.coal < 1.05 && E.coalOffer(s, 3, 1).ok) E.signCoal(s, 3, 1); } },
  alt: { gruppe: ["alt"], name: "nichts anfassen mit v4.5", engine: "alt" },
};

// ---------- ein Spiel ----------
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296); }
const ABLEHNEN = new Set(["sonder", "kapitan", "berater", "uebernahme", "charter", "koch", "kaufangebot", "altschiff"]);
function entscheiden(E, s, ev) {
  const opts = E.eventOptions(s, ev) || [];
  if (!opts.length) return 0;
  if (ABLEHNEN.has(ev.id)) return opts.length - 1;
  if (ev.id === "seenot") return Math.min(2, opts.length - 1);
  let i = 0; while (i < opts.length - 1 && opts[i].ok === false) i++;
  return i;
}
const STUFEN = [.8, 1, 1.2, 1.4, 1.6];
function schwelle(E, s, acc) {
  const h = s.coalHist || []; if (!h.length || !E.prevFahrt) return;
  const alt = h[h.length - 1].c;
  STUFEN.forEach((c, i) => { h[h.length - 1].c = c; for (const st of ["spar", "voll"]) acc[st][i] += E.prevFahrt(s, st).net; });
  h[h.length - 1].c = alt; acc.n++;
}
function spielen(E, li, key, seed, jahre, mitSchwelle) {
  const L = LINIEN[li], st = STRAT[key];
  { const R = rng(seed * 7919 + 17); Math.random = R; } // Schiffsnamen würfelt das Spiel mit Math.random
  const s = E.newGame(seed, "Simulation", { home: L.home });
  let startM = 0; while (E.cal(startM).y < L.start) startM++;
  const endY = L.start + jahre, geld = n => { if (s.cash < n) s.cash += n - s.cash + 2e6; };
  const neu = (r) => {
    const t = L.types.filter(t => { try { return E.typeOpen(s, t) && !E.canServe(s, t, r.a, r.b, r.cruise, r.stops); } catch (e) { return false; } }).pop();
    if (!t) return;
    geld(E.newPrice(s, t) * 1.2 + 1e6);
    if (E.buyNew(s, t, "bar", null, false, {})) return;
    const sh = s.ships[s.ships.length - 1]; sh.simLinie = r.id;
    E.setLine(s, sh.id, r.id);
    if (L.saison) E.setPlan(s, sh.id, [{ from: L.saison[0], to: L.saison[1], line: r.id }, { from: (L.saison[1] + 1) % 12, to: (L.saison[0] + 11) % 12, line: "" }]);
  };
  // Preise wie ein aufmerksamer Spieler: je Klasse +6 %, wenn sie in mindestens drei Monaten ausgebucht war, sonst −4 % zurück Richtung 100 %
  const preis = {};
  const buchen = () => { for (const r of s.routes) { const L = r.last; if (!L || !L.cls) continue; const P = preis[r.id] || (preis[r.id] = [0, 1, 2].map(() => ({ voll: 0, n: 0, last: 0 })));
    L.cls.forEach((c, i) => { if (c.cap > 0 && c.dem > 0) { P[i].n++; P[i].last += c.pax / c.cap; if (c.pax >= .97 * c.cap) P[i].voll++; } }); } };
  const preise = r => { const P = preis[r.id]; if (!P) return; P.forEach((x, c) => { if (x.n) { const f = E.pricePct(s, r, c); E.setPrice(s, r.id, c, x.voll >= 3 ? Math.min(2.5, f * 1.06) : f > 1 ? Math.max(1, f * .96) : f); } x.voll = x.n = x.last = 0; }); };
  let auf = false, kohleSum = 0, kohleN = 0, flotteSum = 0, kapital = 0;
  const sw = { spar: STUFEN.map(() => 0), voll: STUFEN.map(() => 0), n: 0 };
  while (!s.over && E.yearOf(s) < endY) {
    if (s.m >= startM) {
      if (!auf) {
        auf = true; geld(1e6); E.setStaff(s, "insp", true);
        for (const [a, b, c] of L.routes) E.openRoute(s, a, b, !!c, []);
        if (st.start) { const c0 = s.cash; st.start(E, s); kapital = st.kapital || 0; }
      }
      if (E.cal(s.m).mo === 0) for (const r of s.routes) { // jedes Jahr: Preise anpassen, Schiffe über 30 Jahre ersetzen
        preise(r);
        for (const sh of s.ships.filter(x => x.simLinie === r.id && x.age >= 360 && x.ready <= s.m)) { geld(1e6); E.sellShip(s, sh.id); }
      }
      for (const r of s.routes) { let n = s.ships.filter(x => x.simLinie === r.id).length; while (n++ < L.per) neu(r); }
      if (st.monat) st.monat(E, s);
    }
    for (let g = 0; g < 80; g++) { if (E.nextMonth(s) || s.over) break; if (E.duePending(s)) E.resolve(s, entscheiden(E, s, s.pending[0])); }
    buchen(); geld(3e5);
    if (s.m >= startM) { kohleSum += s.coal; kohleN++; flotteSum += E.fleetValue(s); if (mitSchwelle && (s.m - startM) % 11 === 6) schwelle(E, s, sw); }
  }
  const ys = Object.keys(s.years).map(Number).filter(y => y >= L.start && y < endY), sum = k => ys.reduce((a, y) => a + (s.years[y][k] || 0), 0);
  const cost = k => ys.reduce((a, y) => a + ((s.years[y].costs || {})[k] || 0), 0);
  // Börse: nicht realisierte Gewinne zählen mit (Kurswert minus Einstand)
  let offen = 0; if (s.bo && s.bo.co) for (const D of [s.bo.dep, s.bo.pk.dep]) for (const k in D) offen += D[k].n * s.bo.co[k].px - D[k].cost;
  const pkKosten = s.bo && s.bo.pk ? (s.bo.pk.lohn || 0) + (s.bo.pk.paid || 0) : 0;
  return { li, key, seed, jahre: ys.length, offen, pkKosten, kapital, flotte: kohleN ? flotteSum / kohleN : 0, profit: sum("profit"), rev: sum("rev"), pax: sum("pax"), kohle: cost("Kohle"), verpf: cost("Verpflegung"), over: !!s.over,
    kohleIdx: kohleN ? kohleSum / kohleN : null, sw: mitSchwelle ? sw : null };
}

// ---------- Engines laden ----------
function ladeEngine(dir) {
  global.window = global;
  for (const f of ["world.js", "engine.js"]) delete require.cache[path.join(dir, "js", f)];
  global.World = require(path.join(dir, "js", "world.js"));
  const E = require(path.join(dir, "js", "engine.js"));
  if (E.setStrict) E.setStrict(true); // Fehler sollen in der Simulation auffallen, nicht verschluckt werden
  return E;
}
function altOrdner(rev) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flaggschiff-alt-"));
  fs.mkdirSync(path.join(dir, "js"));
  try { for (const f of ["world.js", "engine.js"]) fs.writeFileSync(path.join(dir, "js", f), cp.execFileSync("git", ["-C", ROOT, "show", rev + ":js/" + f], { stdio: ["ignore", "pipe", "ignore"] })); }
  catch (e) { fs.rmSync(dir, { recursive: true, force: true }); throw e; }
  return dir;
}

// ---------- Arbeiter ----------
if (process.argv[2] === "--arbeiter") {
  const engines = {};
  process.on("message", job => {
    if (job.ende) process.exit(0);
    const dir = job.engine === "alt" ? job.altDir : ROOT;
    const E = engines[dir] || (engines[dir] = ladeEngine(dir));
    let res; try { res = spielen(E, job.li, job.key, job.seed, job.jahre, job.schwelle); } catch (e) { res = { li: job.li, key: job.key, seed: job.seed, fehler: String(e && e.stack || e) }; }
    process.send(res);
  });
  return;
}

// ---------- Auswertung ----------
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const LAEUFE = +arg("laeufe", 24), JAHRE = +arg("jahre", 40), ALT = arg("alt", "eb1bb23"), JSON_OUT = arg("json", null);
const NUR = (arg("nur", "fahrt,kueche,vertrag,boerse,hauszeche,prokurist,alt")).split(","), NUR_L = (arg("linien", Object.keys(LINIEN).join(","))).split(",");
const keys = Object.keys(STRAT).filter(k => STRAT[k].gruppe.some(g => NUR.includes(g)));
let altDir = null;
if (keys.includes("alt")) {
  try { altDir = altOrdner(ALT); }
  catch (e) { console.log(`Prüfung „alt“ übersprungen: Der Stand ${ALT} ist nicht per git erreichbar (${String(e.message).split("\n")[0]}).`); keys.splice(keys.indexOf("alt"), 1); NUR.splice(NUR.indexOf("alt"), 1); }
}
const jobs = [];
for (const li of NUR_L) for (const key of keys) for (let i = 0; i < LAEUFE; i++) jobs.push({ li, key, seed: 1000 + i * 97, jahre: JAHRE, engine: STRAT[key].engine || "neu", altDir, schwelle: key === "basis" && NUR.includes("fahrt") });
const t0 = Date.now(), results = [];
const N = Math.max(1, Math.min(os.cpus().length, jobs.length));
console.log(`Flaggschiff-Simulation: ${jobs.length} Spiele (${NUR_L.length} Linienarten × ${keys.length} Strategien × ${LAEUFE} Läufe, je ${JAHRE} Betriebsjahre) auf ${N} Kernen …`);
let next = 0, done = 0;
const workers = Array.from({ length: N }, () => cp.fork(__filename, ["--arbeiter"]));
for (const w of workers) {
  w.on("message", r => { results.push(r); done++; if (done % 25 === 0) process.stdout.write(`  ${done}/${jobs.length}\r`); feed(w); });
  feed(w);
}
function feed(w) { if (next < jobs.length) w.send(jobs[next++]); else { w.send({ ende: true }); if (done === jobs.length) fertig(); } }
let printed = false;
function fertig() {
  if (printed) return; printed = true;
  if (altDir) fs.rmSync(altDir, { recursive: true, force: true });
  const fehler = results.filter(r => r.fehler);
  if (fehler.length) { console.log("Fehler in " + fehler.length + " Spielen, zum Beispiel:\n" + fehler[0].fehler); process.exitCode = 1; }
  const ok = results.filter(r => !r.fehler);
  const by = (li, key) => ok.filter(r => r.li === li && r.key === key).sort((a, b) => a.seed - b.seed);
  const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / Math.max(1, a.length - 1)); };
  const fmt = n => Math.round(n).toLocaleString("de-DE");
  const pc = x => (x >= 0 ? "+" : "") + (x * 100).toFixed(1) + " %";
  const out = { laeufe: LAEUFE, jahre: JAHRE, linien: {}, gruppen: {} };
  console.log(`\nfertig in ${Math.round((Date.now() - t0) / 1000)} s. Gewinn = Ø Jahresgewinn über ${JAHRE} Betriebsjahre; Δ = Unterschied zu „nichts anfassen“ (± Standardfehler, gepaart nach Startwert).\n`);
  for (const g of ["fahrt", "kueche", "vertrag", "boerse", "hauszeche", "prokurist", "alt"].filter(g => NUR.includes(g))) {
    const titel = { fahrt: "1. Fahrstufe", kueche: "2. Verpflegung", vertrag: "3. Kohle-Lieferverträge", boerse: "4. Börse: nur Aktien gegen eine gut geführte Reederei", hauszeche: "5. Hauszeche gegen breites Depot", prokurist: "6. Prokurist gegen breites Depot", alt: "7. Nichts anfassen: v4.6 gegen v4.5" }[g];
    console.log("=== " + titel + " ===");
    if (["boerse", "hauszeche", "prokurist"].includes(g)) { boAuswertung(g); continue; }
    const sk = keys.filter(k => STRAT[k].gruppe.includes(g));
    out.gruppen[g] = {};
    for (const li of NUR_L) {
      const base = by(li, "basis"), rows = [];
      for (const k of sk) {
        const rs = by(li, k); if (!rs.length) continue;
        const py = rs.map(r => r.profit / r.jahre), d = rs.map((r, i) => base[i] ? (r.profit - base[i].profit) / r.jahre : 0);
        const kohleAnteil = mean(rs.map(r => r.kohle / Math.max(1, r.rev - r.profit)));
        rows.push({ k, name: STRAT[k].name, gewinn: mean(py), delta: mean(d), se: sd(d) / Math.sqrt(d.length), pax: mean(rs.map(r => r.pax / r.jahre)), kohle: mean(rs.map(r => r.kohle / r.jahre)), verpf: mean(rs.map(r => r.verpf / r.jahre)), kohleAnteil, pleite: rs.filter(r => r.over).length });
      }
      const best = rows.slice().sort((a, b) => b.gewinn - a.gewinn)[0], ohneEssen = g === "kueche" && rows.every(r => r.verpf === 0);
      console.log("\n" + LINIEN[li].name + (ohneEssen ? "   → keine Mahlzeiten an Bord, die Verpflegung spielt hier keine Rolle" : best ? "   → am besten: " + best.name : ""));
      if (ohneEssen) rows.forEach(r => { r.ohneEssen = true; });
      for (const r of rows) console.log(`  ${r.name.padEnd(56)} Gewinn ${fmt(r.gewinn).padStart(10)}  Δ ${(r.k === "basis" ? "–" : (r.delta >= 0 ? "+" : "") + fmt(r.delta) + " ± " + fmt(r.se)).padStart(20)}  Fahrgäste ${fmt(r.pax).padStart(8)}  Kohle ${fmt(r.kohle).padStart(9)} (${Math.round(r.kohleAnteil * 100)} % der Kosten)  Verpflegung ${fmt(r.verpf).padStart(8)}${r.pleite ? "  Pleiten " + r.pleite : ""}`);
      out.gruppen[g][li] = rows; out.linien[li] = LINIEN[li].name;
    }
    if (g === "fahrt") {
      console.log("\n  Ab welchem Kohlepreis lohnt sich was? (Vormonat nachgerechnet, ohne Zufälle; Ø Monatsergebnis gegenüber Normal)");
      out.schwellen = {};
      for (const li of NUR_L) {
        const rs = by(li, "basis").filter(r => r.sw && r.sw.n), n = rs.reduce((a, r) => a + r.sw.n, 0); if (!n) continue;
        const avg = st => STUFEN.map((c, i) => rs.reduce((a, r) => a + r.sw[st][i], 0) / n);
        const sp = avg("spar"), vo = avg("voll"), z = v => (v >= 0 ? "+" : "") + fmt(v);
        const ab = sp.findIndex(v => v > 0), bis = vo.map(v => v > 0).lastIndexOf(true);
        console.log(`  ${LINIEN[li].name.split(" (")[0].padEnd(22)} Kohle ${STUFEN.map(c => Math.round(c * 100) + " %").join(" / ")}`);
        console.log(`    Sparfahrt  ${sp.map(z).join(" / ")}  → ${ab < 0 ? "lohnt sich bis 160 % nicht" : "lohnt sich ab etwa " + Math.round(STUFEN[ab] * 100) + " %"}`);
        console.log(`    Volldampf  ${vo.map(z).join(" / ")}  → ${bis < 0 ? "lohnt sich auch bei 80 % nicht" : bis === STUFEN.length - 1 ? "lohnt sich bei jedem Preis" : "lohnt sich bis etwa " + Math.round(STUFEN[bis] * 100) + " %"}`);
        out.schwellen[li] = { stufen: STUFEN, spar: sp, voll: vo };
      }
    }
    if (g === "fahrt" || g === "kueche") {
      const sieger = NUR_L.map(li => (out.gruppen[g][li] || []).filter(r => !r.ohneEssen).sort((a, b) => b.gewinn - a.gewinn)[0]).filter(Boolean).map(r => r.k);
      const ueberall = sieger.length > 1 && sieger.every(k => k === sieger[0]);
      console.log("\n  " + (ueberall ? "ACHTUNG: „" + STRAT[sieger[0]].name + "“ ist überall die beste." : "Ziel erreicht: keine Einstellung ist auf allen Linienarten die beste (" + [...new Set(sieger)].map(k => STRAT[k].name).join(", ") + ")."));
    }
    if (g === "vertrag") {
      const v = NUR_L.flatMap(li => (out.gruppen[g][li] || []).filter(r => r.k !== "basis"));
      const plus = v.filter(r => r.delta > 0).length;
      console.log("\n  " + (plus && plus < v.length ? `Ziel erreicht: Verträge lohnen sich in ${plus} von ${v.length} Fällen, sonst nicht.` : plus ? "ACHTUNG: Verträge lohnen sich immer." : "ACHTUNG: Verträge lohnen sich nie."));
      const einzel = NUR_L.flatMap(li => sk.filter(k => k !== "basis").map(k => { const rs = by(li, k), b = by(li, "basis"); return rs.map((r, i) => b[i] ? r.profit - b[i].profit : 0); })).flat();
      if (einzel.length) console.log(`  In einzelnen Läufen: ${einzel.filter(x => x > 0).length} von ${einzel.length} Läufen mit Vertrag besser als ohne.`);
    }
    if (g === "alt") {
      // je Linienart der Mittelwert, zusammengezählt; Standardfehler aus den gepaarten Unterschieden
      let neu = 0, alt = 0, var2 = 0; const ka = [], kn = [];
      for (const li of NUR_L) {
        const a = by(li, "alt"), b = by(li, "basis"), d = [];
        a.forEach((r, i) => { if (b[i]) { d.push(b[i].profit / b[i].jahre - r.profit / r.jahre); ka.push(r.kohleIdx); kn.push(b[i].kohleIdx); } });
        alt += mean(a.map(r => r.profit / r.jahre)); neu += mean(b.map(r => r.profit / r.jahre)); var2 += d.length > 1 ? sd(d) ** 2 / d.length : 0;
      }
      const m = alt ? (neu - alt) / Math.abs(alt) : 0, se = alt ? Math.sqrt(var2) / Math.abs(alt) : 0, ok = m >= -.01 || m >= -2 * se;
      console.log(`\n  Ø Kohlepreis: v4.5 ${(mean(ka) * 100).toFixed(1)} %, v4.6 ${(mean(kn) * 100).toFixed(1)} %.`);
      console.log(`  Alle Linienarten zusammen: v4.6 ohne Börse ${m >= 0 ? "+" : ""}${(m * 100).toFixed(1)} % ± ${(se * 100).toFixed(1)} % Gewinn gegenüber v4.5 → ${ok ? "Ziel erreicht (nicht schlechter" + (m < 0 ? " im Rahmen der Messgenauigkeit" : "") + ")." : "ACHTUNG: schlechter als v4.5."}`);
      out.alt = { neu, alt, rel: m, se, kohleAlt: mean(ka), kohleNeu: mean(kn) };
    }
    console.log("");
  }
  // Rendite einer Börsen-Strategie: Mehrgewinn gegenüber „nichts anfassen“ (inklusive offener Kursgewinne) je Jahr, bezogen auf das angelegte Kapital
  function rendite(li, k, brutto) {
    const rs = by(li, k), b = by(li, "basis"), d = rs.map((r, i) => b[i] && r.kapital ? (r.profit + r.offen + (brutto ? r.pkKosten : 0) - b[i].profit - b[i].offen) / r.jahre / r.kapital : null).filter(x => x != null);
    return { m: mean(d), se: sd(d) / Math.sqrt(Math.max(1, d.length)), n: d.length };
  }
  function boAuswertung(g) {
    out.gruppen[g] = {};
    if (g === "boerse") {
      let schlechter = 0; const rocs = [], aks = [];
      for (const li of NUR_L) {
        const b = by(li, "basis"), roc = mean(b.map(r => r.flotte ? r.profit / r.jahre / r.flotte : 0)), a = rendite(li, "aktien");
        console.log(`  ${LINIEN[li].name.padEnd(62)} Reederei ${pc(roc).padStart(8)} auf den Flottenwert   nur Aktien ${pc(a.m).padStart(8)} ± ${(a.se * 100).toFixed(1)} %`);
        if (a.m < roc) schlechter++; rocs.push(roc); aks.push(a.m);
        out.gruppen[g][li] = { reederei: roc, aktien: a };
      }
      const ok = mean(aks) < mean(rocs);
      console.log(`\n  Im Schnitt: Reederei ${pc(mean(rocs))}, nur Aktien ${pc(mean(aks))}. ${ok ? "Ziel erreicht" : "ACHTUNG"}: Aktien bringen in ${schlechter} von ${NUR_L.length} Linienarten weniger als die Reederei.`);
    }
    if (g === "hauszeche" || g === "prokurist") {
      const ks = g === "hauszeche" ? ["aktien", "hz"] : ["aktien", "pk0", "pk1", "pk3"];
      for (const li of NUR_L) {
        const kohle = mean(by(li, "basis").map(r => r.kohle / r.jahre));
        console.log("  " + LINIEN[li].name + (g === "hauszeche" ? `   (Kohle ${fmt(kohle)} Mark im Jahr)` : ""));
        out.gruppen[g][li] = {};
        for (const k of ks) { const a = rendite(li, k), br = k.startsWith("pk") ? rendite(li, k, true) : null; out.gruppen[g][li][k] = Object.assign(a, br ? { brutto: br.m } : {});
          console.log(`    ${STRAT[k].name.padEnd(52)} ${pc(a.m).padStart(8)} ± ${(a.se * 100).toFixed(1)} % im Jahr` + (br ? `   vor Gehalt und Beteiligung ${pc(br.m)}` : "")); }
      }
    }
    console.log("");
  }
  if (JSON_OUT) { fs.writeFileSync(JSON_OUT, JSON.stringify(out, null, 1)); console.log("Ergebnisse gespeichert: " + JSON_OUT); }
}
