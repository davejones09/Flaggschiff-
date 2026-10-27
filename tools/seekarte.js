#!/usr/bin/env node
/* Flaggschiff – Seekarten-Test (seit v5.1.1): Keine gezeichnete Linie läuft über Land.
   Für alle Hafenpaare und beide Karten (Hauptkarte und Deutsche Bucht), vor und nach 1895 (Kaiser-Wilhelm-Kanal), wird der gezeichnete Weg
   (Kanten mit ihren Zwischenpunkten aus world.js) in kleinen Schritten abgetastet. Auf offener See darf kein Punkt auf Land liegen,
   außer im ersten Stück am Hafen. Flüsse, Kanäle und Fahrrinnen zeichnet die Karte als schmales Wasser; sie gelten als Wasser.
   Aufruf: node tools/seekarte.js            Prüfung, Ausgabe der Kanten über Land
           node tools/seekarte.js --bilder D  zusätzlich Bilder der gemeldeten Linien nach D (braucht Playwright) */
"use strict";
const fs = require("fs"), path = require("path"), ROOT = path.resolve(__dirname, "..");
global.window = {}; eval(fs.readFileSync(path.join(ROOT, "js/mapdata.js"), "utf8"));
const W = require(path.join(ROOT, "js/world.js"));
// wie MAIN und BIGHT in ui.js; r = Pixel am Hafen, die nicht zählen
const KARTEN = { main: { lon0: -10.6, lon1: 31, lat0: 49, lat1: 61.5, W: 360, H: 189, r: 1.2 }, bight: { lon0: 6.3, lon1: 11.3, lat0: 53.25, lat1: 55.15, W: 360, H: 234, r: 3 } };
function polys(d) { return d.split("Z").filter(x => x.trim()).map(p => { const pts = p.replace("M", "").trim().split(/\s+/).map(q => q.split(",").map(Number)); const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); return { pts, bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] }; }); }
function inPoly(pt, { pts, bb }) { if (pt[0] < bb[0] || pt[0] > bb[2] || pt[1] < bb[1] || pt[1] > bb[3]) return false; let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
const fehler = {};
for (const k in KARTEN) {
  const c = KARTEN[k], PL = polys(window.MAPDATA[k]), P = ([la, lo]) => [(lo - c.lon0) / (c.lon1 - c.lon0) * c.W, (c.lat1 - la) / (c.lat1 - c.lat0) * c.H];
  const land = p => PL.reduce((n, pl) => n + (inPoly(p, pl) ? 1 : 0), 0) % 2 === 1;
  for (const [a, b, area] of W.EDGES) {
    if (W.isWater(a, b, area)) continue;
    const pts = W.drawPath([a, b]).map(P), ends = [W.PORTS[a] ? pts[0] : null, W.PORTS[b] ? pts[pts.length - 1] : null].filter(Boolean);
    let bad = 0;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i], L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.ceil(L / .2));
      for (let t = 0; t <= n; t++) { const x = [p[0] + (q[0] - p[0]) * t / n, p[1] + (q[1] - p[1]) * t / n]; if (x[0] < 0 || x[0] > c.W || x[1] < 0 || x[1] > c.H) continue; if (ends.some(e => Math.hypot(e[0] - x[0], e[1] - x[1]) < c.r)) continue; if (land(x)) bad += L / n; }
    }
    if (bad >= .4) fehler[k + " " + a + "–" + b] = bad;
  }
}
// alle Hafenpaare: ein Paar ist in Ordnung, wenn keine seiner Kanten über Land läuft
const badEdge = new Set(Object.keys(fehler).map(x => x.split(" ")[1]));
const ids = Object.keys(W.PORTS); let paare = 0, schlecht = [];
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) for (const y of [1880, 1900]) {
  const sp = W.seaPath(ids[i], ids[j], y); if (!sp) continue; paare++;
  for (let n = 1; n < sp.nodes.length; n++) { const a = sp.nodes[n - 1], b = sp.nodes[n]; if (badEdge.has(a + "–" + b) || badEdge.has(b + "–" + a)) { schlecht.push(W.PORTS[ids[i]].name + " – " + W.PORTS[ids[j]].name); break; } }
}
schlecht = [...new Set(schlecht)];
for (const k of Object.keys(fehler)) console.log("über Land:", k, fehler[k].toFixed(1) + " px");
console.log(paare + " Wege geprüft (" + ids.length + " Häfen, vor und nach 1895), " + (schlecht.length ? schlecht.length + " Hafenpaare laufen über Land, z. B. " + schlecht.slice(0, 5).join(", ") : "keiner läuft über Land"));
const bi = process.argv.indexOf("--bilder");
if (bi > 0) {
  const dir = process.argv[bi + 1] || "."; const { chromium } = require("playwright"), c = KARTEN.main, P = ([la, lo]) => [(lo - c.lon0) / (c.lon1 - c.lon0) * c.W, (c.lat1 - la) / (c.lat1 - c.lat0) * c.H];
  const paare2 = [["ham", "ams"], ["lon", "ams"], ["gla", "bel"], ["lpl", "dub"], ["kie", "kop"], ["lue", "kop"]];
  (async () => {
    const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 600, height: 600 } });
    const ww = W.waterways(1900).map(l => '<path d="M' + l.map(P).map(q => q.map(v => v.toFixed(2)).join(",")).join(" L") + '" fill="none" stroke="#bcd" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>').join("");
    for (const [a, b] of paare2) {
      const pts = W.drawPath(W.seaPath(a, b, 1900).nodes).map(P), xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), x0 = Math.min(...xs) - 3, y0 = Math.min(...ys) - 3, sz = Math.max(Math.max(...xs) + 3 - x0, Math.max(...ys) + 3 - y0);
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [x0, y0, sz, sz].join(" ") + '" width="600" height="600"><rect x="-10" y="-10" width="380" height="210" fill="#bcd"/><path d="' + window.MAPDATA.main + '" fill="#dcb" stroke="#865" stroke-width="' + sz / 400 + '"/>' + ww + '<path d="M' + pts.map(q => q.map(v => v.toFixed(2)).join(",")).join(" L") + '" fill="none" stroke="red" stroke-width="' + sz / 200 + '"/></svg>';
      await pg.setContent('<body style="margin:0">' + svg + "</body>"); await pg.screenshot({ path: path.join(dir, a + "-" + b + ".png") });
    }
    await br.close();
  })();
}
process.exitCode = Object.keys(fehler).length ? 1 : 0;
