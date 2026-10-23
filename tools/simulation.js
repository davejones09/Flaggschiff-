#!/usr/bin/env node
/* Flaggschiff – Balance-Simulation (seit v4.5, für v5.0 „Fahrplan und Pünktlichkeit“ umgebaut)

   Bots führen je Linienart eine kleine Reederei über 40 Betriebsjahre und spielen dabei feste Strategien.
   Seit v5.0 fahren die Schiffe nach Fahrplan: Fahrkarten zahlen die Gäste bei der Abfahrt, Kohle kostet beim Bekohlen,
   Verspätungen kosten Fahrgäste. Verglichen wird der Gewinn (Summe der Monatsergebnisse, ohne Schiffskäufe),
   gemittelt über viele Läufe. Geprüft wird:
     schwierigkeit  Leicht liegt etwa bei v4.6 (±10 %), Normal 20–35 % darunter, Schwer 40–60 % darunter
     fuehrung       „schlecht getaktet“ macht auf dem Atlantik Verlust (im Schnitt oder in mindestens 3 von 10 Jahren),
                    „gut geführt“ geht nirgends unter und bringt auf dem Atlantik mindestens so viel wie auf der Kurzstrecke;
                    Kurzstrecke (Fähre, Küste) und Langstrecke (Atlantik, Südamerika) liegen in der Rendite auf den Flottenwert
                    (gut geführt, im Mittel aus einem und zwei Schiffen je Linie) höchstens ein Viertel auseinander
     gegen          Pufferzeit, Reserveschiff, Volldampf zum Aufholen, Maschine, Wartung: keines ist überall das beste
     bunker         im Heimathafen volltanken, wo es am billigsten ist, nur das Nötige: keine Regel ist überall die beste
     serie          Serienbestellung gegen Einzelbestellungen (zur Information)
     fahrt          Sparfahrt, Normal, Volldampf, Regel des Maschineninspektors: keine Stufe ist überall die beste
     kueche         einfach, ordentlich, fein, eigene Küche, Caterer: keine Stufe ist überall die beste
     vertrag        Kohle-Lieferverträge lohnen sich nicht immer
     boerse         „nur Aktien“ bringt im Schnitt weniger als eine gut geführte Reederei (Rendite auf das eingesetzte Kapital)
     hauszeche      über 50 % einer Zeche lohnt sich nur für große Flotten (verglichen mit demselben Geld in einem breiten Depot)
     prokurist      knapp bezahlt liegt er unter dem Markt, sehr gut leicht darüber (verglichen mit einem breiten Depot ohne Prokurist)

   Aufruf im Hauptordner (Node 18 oder neuer, für „schwierigkeit“ auch git):
     node tools/simulation.js                     alle Prüfungen (rund eine Viertelstunde, nutzt alle Prozessorkerne)
     node tools/simulation.js --laeufe 6          weniger Läufe je Strategie (Standard 12): schneller, aber ungenauer
     node tools/simulation.js --nur gegen,bunker  nur bestimmte Prüfungen (Schlüssel siehe oben, mehrere mit Komma)
     node tools/simulation.js --linien hochsee    nur bestimmte Linienarten (Schlüssel siehe LINIEN)
     node tools/simulation.js --jahre 40          Betriebsjahre je Lauf
     node tools/simulation.js --alt cd82205       Vergleichsstand für „Leicht ≈ v4.6“ (Standard: v4.6)
     node tools/simulation.js --json datei        Ergebnisse zusätzlich als JSON speichern
*/
"use strict";
const path = require("path"), fs = require("fs"), os = require("os"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..");

// ---------- Linienarten: Heimathafen, Linien, Schiffe je Linie, Schiffstypen nach Baujahr, andere Typen für „gemischt“, Art (kurz/lang) ----------
const LINIEN = {
  faehre: { name: "Fähre (Dover–Calais)", home: "lon", start: 1880, routes: [["dov", "cal"]], per: 2, types: ["moewe", "f12", "f35"], mix: ["watt"], art: "kurz" },
  kueste: { name: "Küste und Bäder (Hamburg–Helgoland, Mai bis September)", home: "ham", start: 1880, routes: [["ham", "hel"]], per: 2, types: ["seebad", "kaiserbad", "f24"], mix: ["moewe"], saison: [4, 8], art: "kurz" },
  see: { name: "Nord- und Ostsee (Hamburg–London, Lübeck–Kopenhagen)", home: "ham", start: 1880, routes: [["ham", "lon"], ["lue", "kop"]], per: 1, types: ["nordsee", "nacht", "turbine", "n24"] },
  hochsee: { name: "Atlantik (Liverpool–New York)", home: "lpl", start: 1880, routes: [["lpl", "ny"]], per: 2, types: ["hansa", "o12", "o24"], mix: ["kurier"], art: "lang" },
  sued: { name: "Südamerika (Hamburg–Rio de Janeiro)", home: "ham", start: 1880, routes: [["ham", "rio"]], per: 2, types: ["sued", "o24"], mix: ["hansa"], art: "lang" }, // ohne den Schnelldampfer von 1912: der verbrennt auf dieser Strecke zu viel teure Kohle
  kreuz: { name: "Vergnügungsreise (Hamburg–Bergen, ab 1891)", home: "ham", start: 1891, routes: [["ham", "ber", true]], per: 1, types: ["kreuz", "o24"] },
};

// ---------- Strategien ----------
const kq = (a, b, c) => (E, s) => { E.setKq(s, 0, a); E.setKq(s, 1, b); E.setKq(s, 2, c); };
const caterer = (k, q) => ({
  start: (E, s) => { q(E, s); E.signCaterer(s, k, 3); },
  monat: (E, s) => { const K = E.kueche(s); if (!E.catOn(s, K.cat) && !(K.notUntil >= s.m) && !s.pending.some(p => p.id === "catverl")) E.signCaterer(s, k, 3); },
});
// Lieferverträge gelten seit v5.0 für einen Hafen: die Bots nehmen den, in dem ihre Schiffe am meisten bunkern
const vertragsHafen = (E, s) => E.coalPorts(s).map(p => [p, E.coalOffer(s, 1, 1, p).qty]).sort((a, b) => b[1] - a[1])[0][0];
const vertragen = (E, s, years, share) => { const p = vertragsHafen(E, s); if (E.coalOffer(s, years, share, p).ok) E.signCoal(s, years, share, false, p); };
const vertrag = (years, share) => ({ monat: (E, s) => { if (!E.coalActive(s).length) vertragen(E, s, years, share); } });
const linien = f => (E, s) => { for (const r of s.routes) f(E, s, r); };
// Börse: Kapital, das die Bots anlegen (Mark von 1880)
const KAPITAL = 1e6;
const breit = (E, s, betrag) => { const ks = E.BO_ORDER.filter(k => E.boListed(s, k)); for (const k of ks) E.boBuy(s, k, E.boFor(s, k, betrag / ks.length)); };
const boStart = f => (E, s) => { s.bo.on = true; s.cash += KAPITAL * 1.3; f(E, s); };
const ALLE = ["schwierigkeit", "fuehrung", "gegen", "bunker", "serie", "fahrt", "kueche", "vertrag", "boerse", "hauszeche", "prokurist"];
const STRAT = {
  basis: { gruppe: ALLE, name: "nichts anfassen (Normal, im Heimathafen volltanken)" },
  // Schwierigkeitsgrad und Vergleich mit v4.6
  leicht: { gruppe: ["schwierigkeit"], name: "Leicht, sonst nichts anfassen", diff: "leicht" },
  schwer: { gruppe: ["schwierigkeit"], name: "Schwer, sonst nichts anfassen", diff: "schwer" },
  alt: { gruppe: ["schwierigkeit"], name: "nichts anfassen mit v4.6", engine: "alt" },
  // Führung
  gut: { gruppe: ["fuehrung"], name: "gut geführt: Puffer 10 %, Maschine gut", start: (E, s) => { E.setStaff(s, "maschine", 2); for (const r of s.routes) E.setBuffer(s, r.id, 2); } },
  gut1: { gruppe: ["fuehrung"], name: "gut geführt mit einem Schiff je Linie", per: 1, start: (E, s) => { E.setStaff(s, "maschine", 2); for (const r of s.routes) E.setBuffer(s, r.id, 2); } },
  schlecht: { gruppe: ["fuehrung"], name: "schlecht getaktet: gemischt schnelle Schiffe, kein Puffer, nur das Nötige, Maschine knapp, Wartung sparsam", mix: true, wartung: 0,
    start: (E, s) => { E.setStaff(s, "maschine", 0); E.setBunkRule(s, "noetig"); } },
  // Gegenmittel gegen Verspätungen
  puffer1: { gruppe: ["gegen"], name: "Pufferzeit klein (5 % des Umlaufs)", start: linien((E, s, r) => E.setBuffer(s, r.id, 1)) },
  puffer2: { gruppe: ["gegen"], name: "Pufferzeit mittel (10 %)", start: linien((E, s, r) => E.setBuffer(s, r.id, 2)) },
  puffer3: { gruppe: ["gegen"], name: "Pufferzeit groß (20 %)", start: linien((E, s, r) => E.setBuffer(s, r.id, 3)) },
  reserve: { gruppe: ["gegen"], name: "ein Reserveschiff je Linie", reserve: true },
  aufholen: { gruppe: ["gegen"], name: "Volldampf zum Aufholen", start: linien((E, s, r) => E.setCatchUp(s, r.id, true)) },
  maschine2: { gruppe: ["gegen"], name: "Maschine gut bezahlt", start: (E, s) => E.setStaff(s, "maschine", 2) },
  maschine3: { gruppe: ["gegen"], name: "Maschine sehr gut bezahlt", start: (E, s) => E.setStaff(s, "maschine", 3) },
  wartung2: { gruppe: ["gegen"], name: "Wartung gründlich", wartung: 2 },
  // Bekohlungsregeln (Standard: im Heimathafen volltanken)
  kBillig: { gruppe: ["bunker"], name: "bekohlen, wo es am billigsten ist", start: (E, s) => E.setBunkRule(s, "billig") },
  kNoetig: { gruppe: ["bunker"], name: "immer nur das Nötige bekohlen", start: (E, s) => E.setBunkRule(s, "noetig") },
  // Werft
  serie: { gruppe: ["serie"], name: "Schiffe einer Linie als Serie bestellen", serie: true },
  // Fahrstufe (v4.5)
  spar: { gruppe: ["fahrt"], name: "Sparfahrt", start: (E, s) => E.setFahrt(s, "spar") },
  voll: { gruppe: ["fahrt"], name: "Volldampf", start: (E, s) => E.setFahrt(s, "voll") },
  regel: { gruppe: ["fahrt"], name: "Maschineninspektor (Tarif), Regel 125 % / 90 %", start: (E, s) => E.setStaff(s, "mi", 1) },
  regelSG: { gruppe: ["fahrt"], name: "Maschineninspektor (sehr gut), Regel 125 % / 90 %", start: (E, s) => E.setStaff(s, "mi", 3) },
  // Verpflegung (v4.5)
  einfach: { gruppe: ["kueche"], name: "einfach in allen Klassen", start: kq(0, 0, 0) },
  fein: { gruppe: ["kueche"], name: "fein in allen Klassen", start: kq(2, 2, 2) },
  gemischt: { gruppe: ["kueche"], name: "1. Klasse fein, 2. ordentlich, Zwischendeck einfach", start: kq(2, 1, 0) },
  fein1: { gruppe: ["kueche"], name: "1. Klasse fein, sonst ordentlich", start: kq(2, 1, 1) },
  eigen: { gruppe: ["kueche"], name: "eigene Küche (Proviantmeister Tarif), ordentlich", start: (E, s) => { E.setStaff(s, "pm", 1); E.setEigen(s, true); } },
  solide: Object.assign({ gruppe: ["kueche"], name: "solider Caterer, 1. Klasse fein, sonst ordentlich" }, caterer("solide", kq(2, 1, 1))),
  billig: Object.assign({ gruppe: ["kueche"], name: "Billig-Caterer, einfach in allen Klassen" }, caterer("billig", kq(0, 0, 0))),
  // Lieferverträge (v4.5, seit v5.0 je Hafen)
  v1: Object.assign({ gruppe: ["vertrag"], name: "immer 1 Jahr, 50 % des Verbrauchs" }, vertrag(1, .5)),
  v5: Object.assign({ gruppe: ["vertrag"], name: "immer 5 Jahre, 100 % des Verbrauchs" }, vertrag(5, 1)),
  guenstig: { gruppe: ["vertrag"], name: "5 Jahre, 100 %, nur wenn Kohle unter 90 % kostet", monat: (E, s) => { if (!E.coalActive(s).length && s.coal < .9) vertragen(E, s, 5, 1); } },
  einkauf: { gruppe: ["vertrag"], name: "Kohleneinkäufer (gut): 3 Jahre 100 %, verlängert unter 105 %",
    start: (E, s) => { E.setStaff(s, "ke", 2); E.setStaff(s, "keRenew", 105); }, monat: (E, s) => { if (!E.coalActive(s).length && s.coal < 1.05) vertragen(E, s, 3, 1); } },
  // Börse (v4.6)
  aktien: { gruppe: ["boerse", "hauszeche", "prokurist"], name: "1 Mio. Mark breit in Aktien, halten", kapital: KAPITAL, start: boStart((E, s) => breit(E, s, KAPITAL)) },
  hz: { gruppe: ["hauszeche"], name: "Hauszeche: 51 % einer Zeche", kapital: KAPITAL, start: boStart((E, s) => { const c = s.bo.co.zeche1; E.boBuy(s, "zeche1", Math.ceil(c.n * .51)); }) },
  pk0: { gruppe: ["prokurist"], name: "Prokurist knapp, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 0); E.pkSet(s, KAPITAL); }) },
  pk1: { gruppe: ["prokurist"], name: "Prokurist Tarif, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 1); E.pkSet(s, KAPITAL); }) },
  pk3: { gruppe: ["prokurist"], name: "Prokurist sehr gut, ausgewogen, 1 Mio. Mark", kapital: KAPITAL, start: boStart((E, s) => { E.setStaff(s, "pk", 3); E.pkSet(s, KAPITAL); }) },
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
// Ab welchem Kohlepreis lohnt sich Spar- oder Volldampf? Die Vorschau rechnet die nächsten Wochen ohne Zufälle voraus;
// die Kohle geht dort mit dem heutigen Preis ein, für die anderen Preisstufen wird ihr Anteil umgerechnet.
const STUFEN = [.8, 1, 1.2, 1.4, 1.6];
function schwelle(E, s, acc) {
  if (!E.prevFahrt) return;
  const c0 = s.coal || 1;
  for (const st of ["spar", "voll"]) { const p = E.prevFahrt(s, st); STUFEN.forEach((c, i) => { acc[st][i] += p.net - p.coal * (c / c0 - 1); }); }
  acc.n++;
}
function spielen(E, li, key, seed, jahre, mitSchwelle) {
  const L = LINIEN[li], st = STRAT[key], v5 = !!E.setBuffer;
  { const R = rng(seed * 7919 + 17); Math.random = R; } // Schiffsnamen würfelt das Spiel mit Math.random
  const s = E.newGame(seed, "Simulation", { home: L.home, diff: st.diff || "normal" });
  let startM = 0; while (E.cal(startM).y < L.start) startM++;
  const endY = L.start + jahre, geld = n => { if (s.cash < n) s.cash += n - s.cash + 2e6; };
  const per = st.per || L.per, soll = per + (st.reserve ? 1 : 0);
  const typen = (r, liste) => (liste || L.types).filter(t => { try { return E.typeOpen(s, t) && !E.canServe(s, t, r.a, r.b, r.cruise, r.stops); } catch (e) { return false; } });
  const saison = (sh, r, von, bis) => E.setPlan(s, sh.id, [{ from: von, to: bis, line: r.id }, { from: (bis + 1) % 12, to: (von + 11) % 12, line: "" }]);
  // Neubau: der neueste passende Typ; „schlecht getaktet“ nimmt für jedes zweite Schiff einen anders schnellen Typ
  const kaufen = (r, n) => {
    const ts = typen(r); if (!ts.length) return false;
    const auf = s.ships.filter(x => x.simLinie === r.id), anders = st.mix && auf.length % 2 ? typen(r, L.mix || []) : [];
    const t = anders.length ? anders[anders.length - 1] : st.mix && auf.length % 2 ? ts[0] : ts[ts.length - 1];
    if (!v5) n = 1;
    geld((E.newPrice(s, t) * 1.2 + 2e5) * n + 1e6);
    const vorher = s.ships.length;
    if (E.buyNew(s, t, "bar", null, false, { n, line: r.id })) return false;
    for (const sh of s.ships.slice(vorher)) {
      sh.simLinie = r.id;
      if (sh.line !== r.id) E.setLine(s, sh.id, r.id);
      if (st.wartung != null) E.setMaint(s, sh.id, st.wartung);
      if (L.saison) saison(sh, r, L.saison[0], L.saison[1]);
    }
    return true;
  };
  // Preise wie ein aufmerksamer Spieler: je Klasse +6 %, wenn sie in mindestens drei Monaten ausgebucht war, sonst −4 % zurück Richtung 100 %;
  // unter 100 % (die Teuerung frisst die Preise auf) zieht er auf 100 % nach.
  // Ausgebucht heißt seit v5.0: mindestens 5 % der Fahrgäste fanden bei der Abfahrt keinen Platz (vorher: 97 % der Plätze belegt).
  const preis = {};
  const buchen = () => { for (const r of s.routes) { const L = r.last; if (!L || !L.cls) continue; const P = preis[r.id] || (preis[r.id] = [0, 1, 2].map(() => ({ voll: 0, n: 0, last: 0 })));
    L.cls.forEach((c, i) => { if (c.cap > 0 && c.dem > 0) { P[i].n++; P[i].last += c.pax / c.cap; if (c.no != null ? c.no > 0 && c.no >= .05 * c.pax : c.pax >= .97 * c.cap) P[i].voll++; } }); } };
  const preise = r => { const P = preis[r.id]; if (!P) return; P.forEach((x, c) => { if (x.n) { const f = E.pricePct(s, r, c); E.setPrice(s, r.id, c, x.voll >= 3 ? Math.min(2.5, Math.max(1, f) * 1.06) : f > 1 ? Math.max(1, f * .96) : 1); } x.voll = x.n = x.last = 0; }); };
  let auf = false, kohleSum = 0, kohleN = 0, flotteSum = 0, kapital = 0, summe = 0, tief = 0;
  const sw = { spar: STUFEN.map(() => 0), voll: STUFEN.map(() => 0), n: 0 };
  const mon = Array(12).fill(0), monN = Array(12).fill(0), monL = Array(12).fill(0), pk = { s: 0, n: 0 }, fahrten = { dep: 0, arr: 0, spaet: 0, verspSum: 0, entsch: 0 }, einn = { Fahrkarten: 0, Fracht: 0 };
  while (!s.over && E.yearOf(s) < endY) {
    if (s.m >= startM) {
      if (!auf) {
        auf = true; geld(1e6); E.setStaff(s, "insp", true);
        for (const [a, b, c] of L.routes) E.openRoute(s, a, b, !!c, []);
        if (st.start) { st.start(E, s); kapital = st.kapital || 0; }
      }
      if (E.cal(s.m).mo === 0) for (const r of s.routes) { // jedes Jahr: Preise anpassen, Schiffe über 30 Jahre ersetzen
        preise(r);
        for (const sh of s.ships.filter(x => x.simLinie === r.id && x.age >= 360 && x.ready <= s.m)) { geld(1e6); E.sellShip(s, sh.id); }
      }
      for (const r of s.routes) for (let g = 0; g < 10; g++) { const fehlt = soll - s.ships.filter(x => x.simLinie === r.id).length; if (fehlt <= 0 || !kaufen(r, st.serie ? fehlt : 1)) break; }
      // Reserveschiff: das älteste Schiff der Linie, sobald alle abgeliefert sind
      if (st.reserve && v5) for (const r of s.routes) {
        if (r.res && s.ships.some(x => x.id === r.res && x.line === r.id)) continue;
        const da = s.ships.filter(x => x.simLinie === r.id && x.ready <= s.m && x.line === r.id && !x.laid);
        if (da.length >= soll) E.setReserve(s, r.id, da.sort((a, b) => b.age - a.age)[0].id);
      }
      if (st.monat) st.monat(E, s);
    }
    let rep = null;
    for (let g = 0; g < 80; g++) { rep = E.nextMonth(s); if (rep || s.over) break; if (E.duePending(s)) E.resolve(s, entscheiden(E, s, s.pending[0])); }
    buchen(); geld(3e5);
    if (s.m > startM && rep) {
      const mo = E.cal(rep.m).mo; mon[mo] += rep.profit; monN[mo]++; if (rep.profit < 0) monL[mo]++; summe += rep.profit; tief = Math.min(tief, summe);
      einn.Fahrkarten += rep.tickets || 0; einn.Fracht += rep.freight || 0; for (const k in rep.extra || {}) einn[k] = (einn[k] || 0) + rep.extra[k];
      kohleSum += s.coal; kohleN++; flotteSum += E.fleetValue(s);
      for (const r of s.routes) { const x = r.last; if (!x || !s.ships.some(sh => sh.line === r.id)) continue;
        if (x.pk != null) { pk.s += x.pk; pk.n++; }
        fahrten.dep += x.dep || 0; fahrten.arr += x.arr || 0; fahrten.spaet += x.lateA || 0; fahrten.verspSum += (x.avgLate || 0) * (x.arr || 0); fahrten.entsch += x.comp || 0; }
      if (mitSchwelle && (s.m - startM) % 23 === 6) schwelle(E, s, sw);
    }
  }
  const ys = Object.keys(s.years).map(Number).filter(y => y >= L.start && y < endY), sum = k => ys.reduce((a, y) => a + (s.years[y][k] || 0), 0);
  const cost = f => ys.reduce((a, y) => { const c = s.years[y].costs || {}; return a + Object.keys(c).filter(f).reduce((b, k) => b + c[k], 0); }, 0);
  // Börse: nicht realisierte Gewinne zählen mit (Kurswert minus Einstand)
  let offen = 0; if (s.bo && s.bo.co) for (const D of [s.bo.dep, s.bo.pk.dep]) for (const k in D) offen += D[k].n * s.bo.co[k].px - D[k].cost;
  const pkKosten = s.bo && s.bo.pk ? (s.bo.pk.lohn || 0) + (s.bo.pk.paid || 0) : 0;
  return { li, key, seed, jahre: ys.length, offen, pkKosten, kapital, flotte: kohleN ? flotteSum / kohleN : 0, profit: sum("profit"), rev: sum("rev"), pax: sum("pax"),
    kohle: cost(k => k === "Kohle" || k.startsWith("Bekohlung") || k === "Kohle-Mindestabnahme"), verpf: cost(k => k === "Verpflegung"), entsch: cost(k => k === "Entschädigungen"), over: !!s.over,
    jahrGewinn: ys.map(y => s.years[y].profit), mon, monN, monL, tief, pk: pk.n ? pk.s / pk.n : null, fahrten, einn, preisEnde: s.routes.map(r => [0, 1, 2].map(c => E.pricePct(s, r, c))),
    costs: ys.reduce((a, y) => { const c = s.years[y].costs || {}; for (const k in c) a[k] = (a[k] || 0) + c[k]; return a; }, {}),
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
const LAEUFE = +arg("laeufe", 12), JAHRE = +arg("jahre", 40), ALT = arg("alt", "cd82205"), JSON_OUT = arg("json", null);
const NUR = (arg("nur", ALLE.join(","))).split(","), NUR_L = (arg("linien", Object.keys(LINIEN).join(","))).split(",");
const keys = Object.keys(STRAT).filter(k => STRAT[k].gruppe.some(g => NUR.includes(g)));
let altDir = null;
if (keys.includes("alt")) {
  try { altDir = altOrdner(ALT); }
  catch (e) { console.log(`Vergleich mit v4.6 übersprungen: Der Stand ${ALT} ist nicht per git erreichbar (${String(e.message).split("\n")[0]}).`); keys.splice(keys.indexOf("alt"), 1); }
}
const jobs = [];
for (const li of NUR_L) for (const key of keys) for (let i = 0; i < LAEUFE; i++) jobs.push({ li, key, seed: 1000 + i * 97, jahre: JAHRE, engine: STRAT[key].engine || "neu", altDir, schwelle: key === "basis" && NUR.includes("fahrt") });
// lange Spiele zuerst, damit am Ende kein Kern allein rechnet
const dauer = j => (j.li === "faehre" ? 3 : j.li === "kreuz" ? .6 : 1) * (j.schwelle ? 1.4 : 1);
jobs.sort((a, b) => dauer(b) - dauer(a));
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
  const kurz = li => LINIEN[li].name.split(" (")[0];
  const roi = r => r.flotte ? r.profit / r.jahre / r.flotte : 0;
  const verlustJahre = r => r.jahrGewinn.filter(x => x < 0).length / Math.max(1, r.jahrGewinn.length);
  const pkt = r => r.fahrten && r.fahrten.arr ? 1 - r.fahrten.spaet / r.fahrten.arr : null;
  const out = { laeufe: LAEUFE, jahre: JAHRE, linien: {}, gruppen: {} };
  for (const li of NUR_L) out.linien[li] = LINIEN[li].name;
  console.log(`\nfertig in ${Math.round((Date.now() - t0) / 1000)} s. Gewinn = Ø Jahresgewinn über ${JAHRE} Betriebsjahre; Δ = Unterschied zu „nichts anfassen“ (± Standardfehler, gepaart nach Startwert).\n`);
  // eine Zeile je Strategie: Gewinn, Unterschied zu „nichts anfassen“, Rendite, Pünktlichkeit, Kohle
  function zeilen(li, sk) {
    const base = by(li, "basis"), rows = [];
    for (const k of sk) {
      const rs = by(li, k); if (!rs.length) continue;
      const py = rs.map(r => r.profit / r.jahre), d = rs.map((r, i) => base[i] ? (r.profit - base[i].profit) / r.jahre : 0);
      const pks = rs.map(pkt).filter(x => x != null);
      rows.push({ k, name: STRAT[k].name, gewinn: mean(py), delta: mean(d), se: sd(d) / Math.sqrt(d.length), roi: mean(rs.map(roi)), verlust: mean(rs.map(verlustJahre)),
        pax: mean(rs.map(r => r.pax / r.jahre)), kohle: mean(rs.map(r => r.kohle / r.jahre)), verpf: mean(rs.map(r => r.verpf / r.jahre)), entsch: mean(rs.map(r => r.entsch / r.jahre)),
        kohleAnteil: mean(rs.map(r => r.kohle / Math.max(1, r.rev - r.profit))), puenktlich: pks.length ? mean(pks) : null, pleite: rs.filter(r => r.over).length, tief: Math.min(...rs.map(r => r.tief)), minus: rs.filter(r => r.profit < 0).length });
    }
    return rows;
  }
  const zeile = r => `  ${r.name.padEnd(60)} Gewinn ${fmt(r.gewinn).padStart(10)}  Δ ${(r.k === "basis" ? "–" : (r.delta >= 0 ? "+" : "") + fmt(r.delta) + " ± " + fmt(r.se)).padStart(20)}  Rendite ${pc(r.roi).padStart(8)}` +
    `${r.puenktlich != null ? "  pünktlich " + Math.round(r.puenktlich * 100) + " %" : ""}  Kohle ${fmt(r.kohle).padStart(9)}  Verpflegung ${fmt(r.verpf).padStart(8)}${r.entsch ? "  Entschädigung " + fmt(r.entsch) : ""}${r.pleite ? "  Pleiten " + r.pleite : ""}`;
  const sieger = (g, liste) => liste.map(li => (out.gruppen[g][li] || []).filter(r => !r.ohneEssen).sort((a, b) => b.gewinn - a.gewinn)[0]).filter(Boolean).map(r => r.k);
  const keinerUeberall = (g, liste) => {
    const s = sieger(g, liste), ueberall = s.length > 1 && s.every(k => k === s[0]);
    console.log("\n  " + (ueberall ? "ACHTUNG: „" + STRAT[s[0]].name + "“ ist überall die beste." : "Ziel erreicht: keine Einstellung ist auf allen Linienarten die beste (" + [...new Set(s)].map(k => STRAT[k].name).join(", ") + ")."));
    return !ueberall;
  };
  const titel = { schwierigkeit: "1. Schwierigkeitsgrad gegen v4.6", fuehrung: "2. Gut geführt und schlecht getaktet", gegen: "3. Gegenmittel gegen Verspätungen", bunker: "4. Bekohlungsregeln", serie: "5. Serienbestellung",
    fahrt: "6. Fahrstufe", kueche: "7. Verpflegung", vertrag: "8. Kohle-Lieferverträge", boerse: "9. Börse: nur Aktien gegen eine gut geführte Reederei", hauszeche: "10. Hauszeche gegen breites Depot", prokurist: "11. Prokurist gegen breites Depot" };
  for (const g of ALLE.filter(g => NUR.includes(g))) {
    console.log("=== " + titel[g] + " ===");
    if (["boerse", "hauszeche", "prokurist"].includes(g)) { boAuswertung(g); continue; }
    if (g === "schwierigkeit") { schwierigkeit(); continue; }
    const sk = keys.filter(k => STRAT[k].gruppe.includes(g));
    out.gruppen[g] = {};
    for (const li of NUR_L) {
      const rows = zeilen(li, sk);
      const best = rows.slice().sort((a, b) => b.gewinn - a.gewinn)[0], ohneEssen = g === "kueche" && rows.every(r => r.verpf === 0);
      console.log("\n" + LINIEN[li].name + (ohneEssen ? "   → keine Mahlzeiten an Bord, die Verpflegung spielt hier keine Rolle" : best ? "   → am besten: " + best.name : ""));
      if (ohneEssen) rows.forEach(r => { r.ohneEssen = true; });
      for (const r of rows) console.log(zeile(r));
      out.gruppen[g][li] = rows;
    }
    if (g === "fuehrung") fuehrung();
    if (g === "fahrt") schwellen();
    if (["fahrt", "kueche", "gegen", "bunker"].includes(g)) keinerUeberall(g, NUR_L);
    if (g === "vertrag") {
      const v = NUR_L.flatMap(li => (out.gruppen[g][li] || []).filter(r => r.k !== "basis"));
      const plus = v.filter(r => r.delta > 0).length;
      console.log("\n  " + (plus && plus < v.length ? `Ziel erreicht: Verträge lohnen sich in ${plus} von ${v.length} Fällen, sonst nicht.` : plus ? "ACHTUNG: Verträge lohnen sich immer." : "ACHTUNG: Verträge lohnen sich nie."));
      const einzel = NUR_L.flatMap(li => sk.filter(k => k !== "basis").map(k => { const rs = by(li, k), b = by(li, "basis"); return rs.map((r, i) => b[i] ? r.profit - b[i].profit : 0); })).flat();
      if (einzel.length) console.log(`  In einzelnen Läufen: ${einzel.filter(x => x > 0).length} von ${einzel.length} Läufen mit Vertrag besser als ohne.`);
    }
    if (g === "serie") {
      const d = NUR_L.filter(li => LINIEN[li].per > 1).map(li => (out.gruppen[g][li] || []).find(r => r.k === "serie")).filter(Boolean), klar = d.filter(r => Math.abs(r.delta) > 2 * r.se);
      console.log(`\n  Linienarten mit mehreren Schiffen: Serie besser in ${d.filter(r => r.delta > 0).length} von ${d.length}, deutlich (über zwei Standardfehler) in ${klar.length}. Der Rabatt spart etwas, sonst liefert die Werft wie bei Einzelbestellungen nacheinander.`);
    }
    if (g === "bunker") console.log("  „Wo es am billigsten ist“ fährt hier wie „im Heimathafen volltanken“: Auf allen Testlinien ist der Heimathafen zugleich der billigste. Anders wird es, wenn eine Linie im teuren Hafen beginnt.");
    console.log("");
  }
  // 1. Schwierigkeitsgrad: je Linienart der Mittelwert, zusammengezählt; Standardfehler aus den gepaarten Unterschieden
  function schwierigkeit() {
    out.gruppen.schwierigkeit = {};
    const ziel = { leicht: [-.1, .1], basis: [-.35, -.2], schwer: [-.6, -.4] }, name = { leicht: "Leicht", basis: "Normal", schwer: "Schwer" };
    console.log(`  ${"".padEnd(26)} ${"v4.6".padStart(11)} ${["Leicht", "Normal", "Schwer"].map(x => x.padStart(18)).join("")}`);
    const tot = { alt: 0 }, vari = {};
    for (const li of NUR_L) {
      const a = by(li, "alt"); if (!a.length) continue;
      const ma = mean(a.map(r => r.profit / r.jahre)); tot.alt += ma;
      const cells = [];
      for (const k of ["leicht", "basis", "schwer"]) {
        const b = by(li, k); if (!b.length) { cells.push("–".padStart(18)); continue; }
        const mb = mean(b.map(r => r.profit / r.jahre)), d = b.map((r, i) => a[i] ? r.profit / r.jahre - a[i].profit / a[i].jahre : 0);
        tot[k] = (tot[k] || 0) + mb; vari[k] = (vari[k] || 0) + (d.length > 1 ? sd(d) ** 2 / d.length : 0);
        cells.push((fmt(mb) + " (" + pc(ma ? (mb - ma) / Math.abs(ma) : 0) + ")").padStart(18));
        out.gruppen.schwierigkeit[li] = Object.assign(out.gruppen.schwierigkeit[li] || { alt: ma }, { [k]: mb });
      }
      console.log(`  ${kurz(li).padEnd(26)} ${fmt(ma).padStart(11)} ${cells.join("")}`);
    }
    console.log("");
    for (const k of ["leicht", "basis", "schwer"]) {
      if (tot[k] == null || !tot.alt) continue;
      const m = (tot[k] - tot.alt) / Math.abs(tot.alt), se = Math.sqrt(vari[k]) / Math.abs(tot.alt), [lo, hi] = ziel[k], okk = m >= lo - 2 * se && m <= hi + 2 * se;
      console.log(`  ${name[k].padEnd(7)} alle Linienarten zusammen ${pc(m)} ± ${(se * 100).toFixed(1)} % gegenüber v4.6 (Ziel ${pc(lo)} bis ${pc(hi)}) → ${okk ? "Ziel erreicht" : "ACHTUNG"}.`);
      out.gruppen.schwierigkeit["gesamt_" + k] = { rel: m, se };
    }
    console.log("");
  }
  // 2. Führung: Atlantik schlecht getaktet, im Winter und mit vielen Verspätungen; gut geführt gegen Kurzstrecke; kurz gegen lang
  function fuehrung() {
    const G = out.gruppen.fuehrung, row = (li, k) => (G[li] || []).find(r => r.k === k);
    const WIN = [10, 11, 0, 1, 2], SOM = [3, 4, 5, 6, 7, 8, 9];
    const winter = rs => ({ avg: mean(rs.map(r => WIN.reduce((a, m) => a + r.mon[m], 0) / Math.max(1, WIN.reduce((a, m) => a + r.monN[m], 0)))),
      som: mean(rs.map(r => SOM.reduce((a, m) => a + r.mon[m], 0) / Math.max(1, SOM.reduce((a, m) => a + r.monN[m], 0)))),
      minus: mean(rs.map(r => WIN.reduce((a, m) => a + r.monL[m], 0) / Math.max(1, WIN.reduce((a, m) => a + r.monN[m], 0)))) });
    const NAME = { basis: "nichts anfassen", gut: "gut geführt", schlecht: "schlecht getaktet" };
    console.log("\n  Verlustjahre (Anteil der Jahre mit Minus) und Winter (Ø Monatsergebnis November bis März, Anteil der Wintermonate mit Minus; Ø Sommermonat):");
    for (const li of NUR_L) {
      const parts = [];
      for (const k of ["basis", "gut", "schlecht"]) { const rs = by(li, k); if (!rs.length) continue; const w = winter(rs);
        parts.push(`${NAME[k]} ${Math.round(mean(rs.map(verlustJahre)) * 100)} % (Winter ${fmt(w.avg)}, ${Math.round(w.minus * 100)} % im Minus; Sommer ${fmt(w.som)})`); }
      console.log(`    ${kurz(li).padEnd(18)} ${parts.join("   ")}`);
    }
    out.atlantik = {};
    const at = row("hochsee", "schlecht");
    if (at) {
      const rs = by("hochsee", "schlecht"), vj = mean(rs.map(verlustJahre)), okk = at.gewinn < 0 || vj >= .3;
      console.log(`\n  Atlantik schlecht getaktet: Ø ${fmt(at.gewinn)} Mark im Jahr, ${Math.round(vj * 100)} % Verlustjahre → ${okk ? "Ziel erreicht (Verlust im Schnitt oder in mindestens 3 von 10 Jahren)" : "ACHTUNG: zu sicher"}.`);
      Object.assign(out.atlantik, { schlecht: at.gewinn, schlechtVerlustjahre: vj, ok: okk });
    }
    const ab = by("hochsee", "basis");
    if (ab.length) { const w = winter(ab); console.log(`  Atlantik im Winter (nichts anfassen): Ø ${fmt(w.avg)} Mark im Monat, ${Math.round(w.minus * 100)} % der Wintermonate mit Verlust (Sommer Ø ${fmt(w.som)}).`); out.atlantik.winter = w; }
    const asch = by("hochsee", "schwer");
    if (asch.length) { const vj = mean(asch.map(verlustJahre)); console.log(`  Atlantik mit vielen Verspätungen (Schwer, nichts anfassen): ${Math.round(vj * 100)} % Verlustjahre, Ø ${fmt(mean(asch.map(r => r.profit / r.jahre)))} Mark im Jahr.`); out.atlantik.schwer = vj; }
    // Kurz gegen lang: Mit einem Schiff liegt die Kurzstrecke vorn, mit zweien die Langstrecke (zwei Fähren sind für Dover–Calais zu viel) – verglichen wird das Mittel
    const roiOf = (li, k) => { const r = row(li, k); return r ? r.roi : null; }, KZ = ["faehre", "kueste"], LG = ["hochsee", "sued"];
    const both = li => roiOf(li, "gut1") != null && roiOf(li, "gut") != null ? (roiOf(li, "gut1") + roiOf(li, "gut")) / 2 : null;
    const kz = KZ.filter(li => both(li) != null), lg = LG.filter(li => both(li) != null);
    if (kz.length && lg.length) {
      console.log("\n  Rendite auf den Flottenwert, gut geführt:");
      for (const [k, t] of [["gut1", "ein Schiff je Linie"], ["gut", "übliche Flotte (zwei Schiffe)"]])
        console.log(`    ${t.padEnd(30)} Kurzstrecke ${pc(mean(kz.map(li => roiOf(li, k))))} (${kz.map(li => kurz(li) + " " + pc(roiOf(li, k))).join(", ")}), Langstrecke ${pc(mean(lg.map(li => roiOf(li, k))))} (${lg.map(li => kurz(li) + " " + pc(roiOf(li, k))).join(", ")})`);
      const a = mean(kz.map(both)), b = mean(lg.map(both)), diff = Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)), at2 = both("hochsee");
      console.log(`    ${"im Mittel".padEnd(30)} Kurzstrecke ${pc(a)}, Langstrecke ${pc(b)} → ${Math.round(diff * 100)} % Unterschied: ${diff <= .25 ? "Ziel erreicht (höchstens ein Viertel)" : "ACHTUNG: mehr als ein Viertel"}.`);
      if (at2 != null) console.log(`  Atlantik gut geführt ${pc(at2)} gegen Kurzstrecke ${pc(a)} → ${at2 >= a ? "Ziel erreicht" : "ACHTUNG: Atlantik bringt weniger als die Kurzstrecke"}.`);
      out.kurzLang = { kurz: a, lang: b, diff, atlantik: at2 };
    }
    const unter = NUR_L.flatMap(li => ["gut", "gut1"].map(k => [li, row(li, k)])).filter(([, r]) => r && (r.minus || r.gewinn < 0));
    console.log(`  Gut geführt: ${unter.length ? "ACHTUNG, Verlust über alle Jahre in " + unter.map(([li, r]) => kurz(li) + " (" + r.minus + " Läufe, " + r.k + ")").join(", ") : "kein Lauf mit Verlust über alle Jahre → Ziel erreicht"}; tiefster Stand der aufsummierten Ergebnisse ${NUR_L.map(li => row(li, "gut")).filter(Boolean).map(r => fmt(r.tief)).join(" / ")} Mark.`);
  }
  // 6. Fahrstufe: Schwellen beim Kohlepreis
  function schwellen() {
    console.log("\n  Ab welchem Kohlepreis lohnt sich was? (Vorschau über 60 Tage ohne Zufälle; Ø Monatsergebnis gegenüber Normal)");
    out.schwellen = {};
    for (const li of NUR_L) {
      const rs = by(li, "basis").filter(r => r.sw && r.sw.n), n = rs.reduce((a, r) => a + r.sw.n, 0); if (!n) continue;
      const avg = st => STUFEN.map((c, i) => rs.reduce((a, r) => a + r.sw[st][i], 0) / n);
      const sp = avg("spar"), vo = avg("voll"), z = v => (v >= 0 ? "+" : "") + fmt(v);
      const ab = sp.findIndex(v => v > 0), bis = vo.map(v => v > 0).lastIndexOf(true);
      console.log(`  ${kurz(li).padEnd(22)} Kohle ${STUFEN.map(c => Math.round(c * 100) + " %").join(" / ")}`);
      console.log(`    Sparfahrt  ${sp.map(z).join(" / ")}  → ${ab < 0 ? "lohnt sich bis 160 % nicht" : "lohnt sich ab etwa " + Math.round(STUFEN[ab] * 100) + " %"}`);
      console.log(`    Volldampf  ${vo.map(z).join(" / ")}  → ${bis < 0 ? "lohnt sich auch bei 80 % nicht" : bis === STUFEN.length - 1 ? "lohnt sich bei jedem Preis" : "lohnt sich bis etwa " + Math.round(STUFEN[bis] * 100) + " %"}`);
      out.schwellen[li] = { stufen: STUFEN, spar: sp, voll: vo };
    }
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
        const roc = mean(by(li, "basis").map(roi)), a = rendite(li, "aktien");
        console.log(`  ${LINIEN[li].name.padEnd(62)} Reederei ${pc(roc).padStart(8)} auf den Flottenwert   nur Aktien ${pc(a.m).padStart(8)} ± ${(a.se * 100).toFixed(1)} %`);
        if (a.m < roc) schlechter++; rocs.push(roc); aks.push(a.m);
        out.gruppen[g][li] = { reederei: roc, aktien: a };
      }
      const okk = mean(aks) < mean(rocs);
      console.log(`\n  Im Schnitt: Reederei ${pc(mean(rocs))}, nur Aktien ${pc(mean(aks))}. ${okk ? "Ziel erreicht" : "ACHTUNG"}: Aktien bringen in ${schlechter} von ${NUR_L.length} Linienarten weniger als die Reederei.`);
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
