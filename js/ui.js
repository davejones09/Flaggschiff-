(function () {
  "use strict";
  const E = window.Engine;
  const KEY = "flaggschiff-proto-1880";
  let S = null, tab = "kontor", sheet = null, confirmSell = null, confirmReset = false, toastT = null, showLocked = false;
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const M = n => E.fmt(n) + " M";
  const signed = n => (n < 0 ? '<span class="neg">' : "") + E.fmt(n) + (n < 0 ? "</span>" : "");
  const kn = v => String(v).replace(".", ",");

  let saveWarned = false;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); saveWarned = false; } catch (e) { if (!saveWarned) { saveWarned = true; toast("Speichern fehlgeschlagen: Der Speicher des Geräts ist voll. Exportieren Sie den Spielstand im Kontor."); } } }
  // Fehler einmal melden, das Spiel läuft weiter (v5.0: Uhr absichern)
  let errAt = 0;
  function reportErr(e, where) {
    try { console.error("Flaggschiff-Fehler (" + where + "):", e); } catch (x) { }
    if (Date.now() - errAt > 30000) { errAt = Date.now(); try { toast("Ein Fehler ist aufgetreten. Das Fenster wurde geschlossen, das Spiel läuft weiter."); } catch (x) { } }
  }
  function load() { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(KEY); } catch (e) { } }

  function star(cx, cy, R, r, fill) {
    let p = []; for (let k = 0; k < 16; k++) { const a = Math.PI / 2 + k * Math.PI / 8, rr = k % 2 ? r : R; p.push((cx + rr * Math.cos(a)).toFixed(2) + "," + (cy - rr * Math.sin(a)).toFixed(2)); }
    return '<polygon points="' + p.join(" ") + '" fill="' + fill + '"/>';
  }
  const FLAG = '<svg class="flag" viewBox="0 0 38 26" aria-hidden="true"><rect x=".5" y=".5" width="37" height="25" fill="#1E3A63" stroke="#B08D57"/>' + star(19, 13, 8.5, 3.4, "#fff") + "</svg>";

  /* ---------- Klang und Musik ---------- */
  const TRACKS = [["mus0", "Hamburger Hafen 1880"], ["mus1", "Dampf über den Atlantik"], ["mus2", "Walzer auf dem Ozean"], ["mus4", "Walzer auf dem Ozean (Variante)"], ["mus3", "Ruhige Nachtfahrt"], ["mus5", "Ruhige Nachtfahrt (Variante)"],
    ["mus6", "Hafenkneipe"], ["mus7", "Hafenkneipe (Variante)"], ["mus8", "Sommer im Seebad"], ["mus9", "Sommer im Seebad (Variante)"], ["mus10", "Abschied der Auswanderer"], ["mus11", "Abschied der Auswanderer (Variante)"]];
  const SUMMER = ["mus8", "mus9"], FAREWELL = ["mus10", "mus11"];
  const Snd = (function () {
    let ctx = null, on = true, amb = null, musicOn = true, audio = null, track = 0;
    try { on = localStorage.getItem(KEY + "-ton") !== "0"; musicOn = localStorage.getItem(KEY + "-musik") !== "0"; } catch (e) { }
    const A = window.ASSETS || {};
    const list = TRACKS.filter(t => A[t[0]]);
    if (list.length) {
      audio = new Audio(); audio.preload = "none"; audio.volume = .35; audio.src = A[list[0][0]];
      audio.addEventListener("ended", () => next(true));
    }
    function music() { if (!audio) return; if (on && musicOn) { const p = audio.play(); if (p && p.catch) p.catch(() => { }); } else audio.pause(); }
    let queued = null;
    // Nächstes Stück: zufällig, nie zweimal dasselbe; „Sommer im Seebad“ von Mai bis September doppelt so oft
    function pickNext() {
      if (queued != null) { const q = list.findIndex(t => t[0] === queued); queued = null; if (q >= 0 && q !== track) return q; }
      const mo = S ? E.cal(S.m).mo : -1, summer = mo >= 4 && mo <= 8, w = list.map((t, i) => i === track ? 0 : SUMMER.includes(t[0]) && summer ? 2 : 1), tot = w.reduce((a, b) => a + b, 0);
      if (!tot) return 0; let r = Math.random() * tot; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; } return 0;
    }
    function next(auto) { if (!audio) return; track = pickNext(); audio.src = A[list[track][0]]; if (on && musicOn) music(); if (!auto) render(); }
    function queue(keys) { const k = keys[Math.floor(Math.random() * keys.length)]; if (list.some(t => t[0] === k)) queued = k; }
    function ac() {
      if (!on) return null;
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function brown(c, sec) { const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; } return b; }
    function bell(when, f, vol) {
      const c = ac(); if (!c) return; const t = c.currentTime + (when || 0), out = c.createGain(); out.gain.value = vol || .16; out.connect(c.destination);
      [[1, 1, 2.2], [2.76, .5, 1.3], [5.4, .25, .7], [8.93, .12, .4]].forEach(([m, a, d]) => { const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = (f || 620) * m; env(g, t, .004, a, d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .1); });
    }
    function horn(when) {
      const c = ac(); if (!c) return; const t = c.currentTime + (when || 0);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 850;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.14, t + .2); g.gain.setValueAtTime(.14, t + 1.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
      lp.connect(g); g.connect(c.destination);
      [[110, .6], [165.5, .35], [220.4, .18]].forEach(([f, v]) => { const o = c.createOscillator(), og = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(); o.type = "sawtooth"; o.frequency.value = f; og.gain.value = v; lfo.frequency.value = 5; lg.gain.value = 1.1; lfo.connect(lg); lg.connect(o.frequency); o.connect(og); og.connect(lp); o.start(t); o.stop(t + 2); lfo.start(t); lfo.stop(t + 2); });
    }
    function coins(when) { const c = ac(); if (!c) return; [0, .08, .17].forEach((dt, i) => { const t = c.currentTime + (when || 0) + dt; [2600, 3900, 5200].forEach(f => { const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = f * (1 + i * .03); env(g, t, .002, .045, .18); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .25); }); }); }
    function thud(when) { const c = ac(); if (!c) return; const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + .3); env(g, t, .005, .22, .35); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .45); }
    function telegraph(when) {
      const c = ac(); if (!c) return; let t = c.currentTime + (when || 0);
      for (const d of [.06, .06, .17, .06, .17, .06]) { const o = c.createOscillator(), g = c.createGain(); o.type = "square"; o.frequency.value = 760; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .005); g.gain.setValueAtTime(.05, t + d); g.gain.exponentialRampToValueAtTime(0.0001, t + d + .01); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .03); t += d + .07; }
    }
    function storm(when) {
      const c = ac(); if (!c) return; const t = c.currentTime + (when || 0), src = c.createBufferSource(), lp = c.createBiquadFilter(), g = c.createGain();
      src.buffer = brown(c, 3); lp.type = "lowpass"; lp.frequency.setValueAtTime(250, t); lp.frequency.linearRampToValueAtTime(1300, t + 1.2); lp.frequency.linearRampToValueAtTime(300, t + 3);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .8); g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
      src.connect(lp); lp.connect(g); g.connect(c.destination); src.start(t); src.stop(t + 3.1);
    }
    function ambient() {
      const c = ac(); if (!c || amb) return;
      const src = c.createBufferSource(), lp = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      src.buffer = brown(c, 8); src.loop = true; lp.type = "lowpass"; lp.frequency.value = 420;
      g.gain.value = audio && musicOn ? .025 : .045; lfo.frequency.value = .09; lg.gain.value = audio && musicOn ? .015 : .03; lfo.connect(lg); lg.connect(g.gain);
      src.connect(lp); lp.connect(g); g.connect(c.destination); src.start(); lfo.start(); amb = { src, lfo };
    }
    function stopAmbient() { if (amb) { try { amb.src.stop(); amb.lfo.stop(); } catch (e) { } amb = null; } }
    function toggle() { on = !on; try { localStorage.setItem(KEY + "-ton", on ? "1" : "0"); } catch (e) { } if (on) { ambient(); bell(0, 620, .12); } else stopAmbient(); music(); }
    function toggleMusic() { musicOn = !musicOn; try { localStorage.setItem(KEY + "-musik", musicOn ? "1" : "0"); } catch (e) { } stopAmbient(); ambient(); music(); }
    function wake() { ambient(); music(); }
    return { bell, horn, coins, thud, telegraph, storm, ambient, toggle, toggleMusic, wake, next, queue, get on() { return on; }, get musicOn() { return musicOn; }, get hasMusic() { return !!audio; }, get title() { return list.length ? list[track][1] : ""; } };
  })();
  const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  /* ---------- Bilder ---------- */
  const A = window.ASSETS || {};
  const IMG_ALIAS = { ship_nordsee: "ship_seebad", ship_ostsee: "ship_kurier", ship_levante: "ship_sued", ship_nacht: "ship_kurier", ship_kaiserbad: "ship_seebad", ship_turbine: "ship_komet" };
  const img = (key, cls, alt, sh) => { if (key && key.startsWith("ship_d_")) return kitImg(key.slice(5), cls, sh); if (key && !A[key] && IMG_ALIAS[key]) key = IMG_ALIAS[key]; return key && A[key] ? '<img class="' + cls + '" src="' + A[key] + '" alt="' + esc(alt || "") + '" loading="lazy" decoding="async">' : ""; };
  function newsImg(l) {
    if (l.img && A[l.img]) return l.img;
    if (/Havarie|gesunken|Seenot/.test(l.head)) return "ev_sturm";
    if (/Eine neue Reederei/.test(l.head)) return "title";
    if (/Blaue Band/.test(l.head)) return "ship_komet";
    if (l.route && S) { const r = S.routes.find(x => x.id === l.route); if (r) return routeImg(r); }
    const q = l.head.match(/„([^“]+)“/);
    if (q) { const sh = S.ships.find(x => x.name === q[1]); if (sh) return "ship_" + sh.type; }
    return null;
  }

  /* ---------- Kopf ---------- */
  function renderHeader() {
    const c = S.cash;
    $("hdr").innerHTML = FLAG + '<div><div class="firm">' + esc(S.name) + '</div><div class="date">' + E.dayStr(S) + "</div></div>" +
      '<div class="cash"><span>Kasse</span><b class="' + (c < 0 ? "neg" : "") + '">' + M(c) + "</b></div>" +
      '<button class="snd" data-act="snd" aria-label="' + (Snd.on ? "Ton ausschalten" : "Ton einschalten") + '">' + (Snd.on ? ICON_ON : ICON_OFF) + "</button>";
    const names = ["Stopp", "Langsam", "Halbe", "Volle"], over = S.over === "konkurs";
    $("tele").innerHTML = '<div class="mprog" aria-hidden="true"><i style="width:' + Math.round((S.day - 1) / E.dim(S.m) * 100) + '%"></i></div>' +
      '<div class="seg4" role="group" aria-label="Maschinentelegraf">' + names.map((n, i) => '<button data-act="speed"' + (DESK ? ' title="Taste ' + i + '"' : "") + ' data-v="' + i + '" aria-pressed="' + (S.speed === i) + '"' + (over ? " disabled" : "") + ">" + n + "</button>").join("") + "</div>";
    for (const b of $("tabs").children) b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false");
  }

  /* ---------- Sprache und Währung ---------- */
  const I18 = window.I18N_CORE, DICTS = { en: window.I18N_EN || {}, es: window.I18N_ES || {} }, TYPESL = { en: window.I18N_TYPES || {}, es: window.I18N_TYPES_ES || {} };
  const okLang = l => (l === "en" || l === "es") ? l : "de";
  let LANG = (() => { try { return okLang(localStorage.getItem("flaggschiff-lang")); } catch (e) { return "de"; } })();
  const D = () => DICTS[LANG] || {}, TYP = () => TYPESL[LANG] || {}, PORTL = () => LANG === "es" ? I18.PORT_ES : I18.PORT_EN, NAMEL = () => LANG === "es" ? I18.NAME_ES : I18.NAME_EN;
  const RL = {
    en: { pre: { Entscheidung: "Decision", Erfolg: "Achievement", Rat: "Advice", Linie: "Line", Tipp: "Tip" }, line: "Line ", comfort: "Comfort ", effect: "Effect: ", and: " and ", suitable: "Suitable ships: ", none: "none at present",
      cls: x => x + " class", saved: "Saved for the museum: ", removal: " (removal ", marks: " marks).", of: (a, b, c) => (a ? a + " " : "") + "of the “" + b + "” (" + c + ")", basis: "Own design based on ", own: x => "Own design “" + x + "”",
      ships: "Your ships: ", cruise: "pleasure cruise ", SEG: { Auswanderer: "Emigrants", Kaufleute: "Merchants", Reisende: "Travellers", Badegäste: "Bathers", Bahnreisende: "Rail travellers", Pendler: "Commuters", Vergnügungsreisende: "Cruise passengers" }, q: ["“", "”"], mark: "marks" },
    es: { pre: { Entscheidung: "Decisión", Erfolg: "Logro", Rat: "Consejo", Linie: "Línea", Tipp: "Consejo" }, line: "Línea ", comfort: "Confort ", effect: "Efecto: ", and: " y ", suitable: "Barcos adecuados: ", none: "ninguno por ahora",
      cls: x => "clase " + x, saved: "Reservado para el museo: ", removal: " (desmontaje ", marks: " marcos).", of: (a, b, c) => (a ? a + " " : "") + "del «" + b + "» (" + c + ")", basis: "Diseño propio basado en ", own: x => "Diseño propio «" + x + "»",
      ships: "Sus barcos: ", cruise: "crucero ", SEG: { Auswanderer: "Emigrantes", Kaufleute: "Comerciantes", Reisende: "Viajeros", Badegäste: "Bañistas", Bahnreisende: "Viajeros de tren", Pendler: "Pendulares", Vergnügungsreisende: "Pasajeros de crucero" }, q: ["«", "»"], mark: "marcos" },
  };
  const R = () => RL[LANG];
  const trCache = new Map();
  function setLang(l) { LANG = okLang(l); try { localStorage.setItem("flaggschiff-lang", LANG); } catch (e) { } trCache.clear(); document.documentElement.lang = LANG; }
  const isGB = () => !!(S && S.country === "gb");
  let nameSig = "";
  function syncNames() {
    const list = Object.values(E.PORTS).map(p => p.name).concat(Object.keys(I18.NAME_EN), E.MONTHS, Object.values(E.RIV).map(r => r.name), Object.values(E.SPECIAL_CAPS).map(c => c.name));
    if (S) list.push(S.name, ...E.caps(S).map(c => c.name), ...S.routes.filter(r => r.cruise).map(r => { const i = E.rInfo(S, r); return i ? i.name : ""; }));
    const sig = list.length + "|" + (S ? S.name + E.caps(S).length : "");
    if (sig !== nameSig) { nameSig = sig; I18.setNames(list); trCache.clear(); }
  }
  const enNum = x => x.replace(/\./g, "§").replace(/,/g, ".").replace(/§/g, ",");
  const lnum = x => LANG === "en" ? enNum(x) : x;
  function fill(tpl, v) {
    const P = PORTL(), N = NAMEL(), DD = D();
    return tpl.replace(/\{([qxn])([A-Z])\}/g, (_, t, c) => { const val = v[t][c.charCodeAt(0) - 65]; if (val == null) return ""; if (t === "n") return lnum(val); if (t === "x") { if (val.startsWith("Vergnügungsreise ")) return R().cruise + val.slice(17).split(" – ").map(p => P[p] || p).join(" – "); return P[val] || N[val] || val; } return DD[val] || val; });
  }
  function trSentence(sen) {
    const core = sen.trim(); if (!core) return sen;
    const DD = D(), TY = TYP(), r = R(), { key, v } = I18.norm(core), tr = DD[key];
    if (tr != null) return fill(tr, v);
    let m;
    if ((m = core.match(/^(Entscheidung|Erfolg|Rat|Linie|Tipp):\s+(.+?)(\.?)$/s))) return r.pre[m[1]] + ": " + trSentence(m[2]) + m[3];
    if ((m = core.match(/^Linie (.+?)\.$/))) return r.line + trSentence(m[1]) + ".";
    if (core.includes(" · ")) return core.split(" · ").map(trSentence).join(" · ");
    if ((m = core.match(/^Komfort (★+)$/))) return r.comfort + m[1];
    if ((m = core.match(/^Wirkung: (.+)$/))) return r.effect + trSentence(m[1]);
    if ((m = core.match(/^([A-Za-zÄÖÜäöü]+) und ([A-Za-zÄÖÜäöü]+)(\.?)$/)) && DD[m[1]] && DD[m[2]]) return DD[m[1]] + r.and + DD[m[2]] + m[3];
    if ((m = core.match(/^([A-Za-zÄÖÜäöü]+)(\.)$/)) && DD[m[1]]) return DD[m[1]] + ".";
    if ((m = core.match(/^Passende Schiffe: (.+?)(\.?)$/))) return r.suitable + (m[1] === "derzeit keine" ? r.none : m[1].split(", ").map(x => TY[x] || x).join(", ")) + m[2];
    if ((m = core.match(/^(.+?) \(Typ ([^)]+)\)$/))) return trSentence(m[1]) + " (" + r.cls(m[2]) + ")";
    if ((m = core.match(/^Typ (\S+)$/))) return r.cls(m[1]);
    if (/^[A-Za-zÄÖÜäöü]+ [\d.,]+ %(, [A-Za-zÄÖÜäöü]+ [\d.,]+ %)*$/.test(core)) { let ok = true; const outS = core.split(", ").map(x => { const [w, n] = x.split(/ (?=[\d])/); if (!r.SEG[w]) ok = false; return (r.SEG[w] || w) + " " + lnum(n); }); if (ok) return outS.join(", "); }
    if ((m = core.match(/^Ihre Schiffe: (.+)$/))) return r.ships + m[1];
    if ((m = core.match(/^der „(.+)“ \((.+)\)$/))) return r.of("", m[1], m[2]);
    if (core.includes(", ")) { const parts = core.replace(/\.$/, "").split(", "); if (parts.length > 1 && parts.every(x => DD[x] != null)) return parts.map(x => DD[x]).join(", ") + (core.endsWith(".") ? "." : ""); }
    if ((m = core.match(/^Für das Museum gesichert: (.+) \(Ausbau ([\d.,]+) Mark\)\.$/))) return r.saved + m[1].split(", ").map(x => DD[x] || x).join(", ") + r.removal + lnum(m[2]) + r.marks;
    if ((m = core.match(/^(.+) der „(.+)“ \((.+)\)$/)) && DD[m[1]]) return r.of(DD[m[1]], m[2], m[3]);
    if ((m = core.match(/^Eigener Entwurf auf Basis (.+)$/))) return r.basis + (DD[m[1]] || TY[m[1]] || m[1]);
    if ((m = core.match(/^Eigener Entwurf „(.+)“$/))) return r.own(m[1]);
    if (TY[core]) return TY[core][0].toUpperCase() + TY[core].slice(1);
    return core;
  }
  function pounds(mark) {
    const p = mark / 20.43, neg = p < 0, a = Math.abs(p);
    if (a < 1 / 480) return "£0";
    let s;
    if (a >= 1) { const r = Math.round(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g, LANG === "en" ? "," : "."); s = "£" + r; }
    else { const d = Math.max(1, Math.round(a * 240)), sh = Math.floor(d / 12), pe = d % 12; s = (sh ? sh + "s" : "") + (sh && pe ? " " : "") + (pe ? pe + "d" : ""); }
    return (neg ? "−" : "") + s;
  }
  function parseNum(num) {
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(num)) return parseFloat(num.replace(/\./g, "").replace(",", "."));
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(num)) return parseFloat(num.replace(/,/g, ""));
    if (/^\d+,\d+$/.test(num)) return parseFloat(num.replace(",", "."));
    return parseFloat(num);
  }
  function money(t) {
    return t.replace(/([−-]?)(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s?(?:marks|marcos|Mark|M)(?![A-Za-zÄÖÜäöü])/g, (_, sg, num) => { const v = parseNum(num); return pounds(sg ? -v : v); });
  }
  function TR(text) {
    if (text == null) return text;
    if (LANG === "de" && !isGB()) return text;
    const ck = (isGB() ? "g" : "d") + LANG + text;
    const hit = trCache.get(ck); if (hit != null) return hit;
    let out = text;
    if (LANG === "en" && !/[A-Za-zÄÖÜäöüß]/.test(text)) out = text.replace(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+,\d+/g, enNum);
    else if (LANG !== "de" && /[A-Za-zÄÖÜäöüß]/.test(text)) {
      const DD = D(), r = R(), lead0 = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], pm = text.trim().match(I18.PREFIX), lead = lead0 + (pm ? pm[1] : ""), core = pm ? pm[2] : text.trim();
      const whole = I18.norm(core);
      if (DD[whole.key] != null) out = lead + fill(DD[whole.key], whole.v) + trail;
      else out = lead + I18.sentences(core).map(x => { const y = trSentence(x); return /^[A-ZÄÖÜ]/.test(x.trim()) && /^[a-záéíóúñ]/.test(y) ? y[0].toUpperCase() + y.slice(1) : y; }).join(" ") + trail;
      if (/^[A-ZÄÖÜ]/.test(core) && out.trim() && /^[a-záéíóúñ]/.test(out.trim())) { const i = out.search(/\S/); out = out.slice(0, i) + out[i].toUpperCase() + out.slice(i + 1); }
      out = out.replace(/„([^“„]*)“/g, r.q[0] + "$1" + r.q[1]).replace(/„/g, r.q[0]).replace(/(\d) Mark\b/g, "$1 " + r.mark);
      if (LANG === "en") out = out.replace(/\b1 (class|cl\.)/g, "1st $1").replace(/\b2 (class|cl\.)/g, "2nd $1").replace(/\b3 (class|cl\.)/g, "3rd $1");
    }
    if (isGB()) out = money(out);
    if (trCache.size > 6000) trCache.clear();
    trCache.set(ck, out); return out;
  }
  function translateDom(root) {
    if (!root || (LANG === "de" && !isGB())) return;
    syncNames();
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; const list = [];
    while ((n = w.nextNode())) { const p = n.parentElement; if (p && !p.closest("script,style,textarea")) list.push(n); }
    for (const t of list) { const v = t.nodeValue; if (/[A-Za-zÄÖÜäöüß0-9]/.test(v)) { const r = TR(v); if (r !== v) t.nodeValue = r; } }
    root.querySelectorAll && root.querySelectorAll("[aria-label],[placeholder],[title]").forEach(e => { for (const a of ["aria-label", "placeholder", "title"]) { const v = e.getAttribute(a); if (v) { const r = TR(v); if (r !== v) e.setAttribute(a, r); } } });
  }
  I18.setCapNames(E.CAP_NAMES.first, E.CAP_NAMES.last);
  document.documentElement.lang = LANG;
  /* ---------- Karte ---------- */
  const Wd = E.World, PORTS = E.PORTS;
  const clampI = (x, a, b) => Math.max(a, Math.min(b, x));
  const MAIN = { key: "main", lon0: -10.6, lon1: 31, lat0: 49, lat1: 61.5, W: 360, H: 189, grid: 5, edges: true, rose: [26, 26, 15],
    seas: [["Nordsee", 72, 100, 12], ["Ostsee", 244, 116, 11], ["Skagerrak", 124, 64, 8.5]] };
  const BIGHT = { key: "bight", lon0: 6.3, lon1: 11.3, lat0: 53.25, lat1: 55.15, W: 360, H: 234, grid: 1, rose: [334, 24, 13],
    seas: [["Deutsche Bucht", 38, 92, 12], ["Elbe", 222, 176, 9], ["Kieler Bucht", 272, 58, 9], ["Wattenmeer", 104, 196, 8.5]] };
  let mapPick = null;
  const reduceMotion = (() => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  const laneCache = {};
  function rose(x, y, r) {
    let p = "";
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 - Math.PI / 2, L = k % 2 ? r * .55 : r, w = r * .16;
      const tip = [x + L * Math.cos(a), y + L * Math.sin(a)], l = [x + w * Math.cos(a - Math.PI / 2), y + w * Math.sin(a - Math.PI / 2)], rr = [x + w * Math.cos(a + Math.PI / 2), y + w * Math.sin(a + Math.PI / 2)];
      p += '<path d="M' + l.map(v => v.toFixed(1)).join(",") + "L" + tip.map(v => v.toFixed(1)).join(",") + "L" + x + "," + y + 'Z" fill="var(--brass)"/>';
      p += '<path d="M' + rr.map(v => v.toFixed(1)).join(",") + "L" + tip.map(v => v.toFixed(1)).join(",") + "L" + x + "," + y + 'Z" fill="var(--ink)" opacity=".85"/>';
    }
    return '<g aria-hidden="true"><circle cx="' + x + '" cy="' + y + '" r="' + (r * .72).toFixed(1) + '" fill="none" stroke="var(--coast)" stroke-width=".5"/>' + p +
      '<text x="' + x + '" y="' + (y - r - 2) + '" font-size="7" text-anchor="middle" fill="var(--coast)" font-family="Old Standard TT, Georgia, serif">N</text></g>';
  }
  function drawMap(cfg, hideIn) {
    const P = (lat, lon) => [(lon - cfg.lon0) / (cfg.lon1 - cfg.lon0) * cfg.W, (cfg.lat1 - lat) / (cfg.lat1 - cfg.lat0) * cfg.H];
    const inside = ([x, y]) => x >= 0 && x <= cfg.W && y >= 0 && y <= cfg.H;
    const XY = id => P(...Wd.coord(id)), f1 = v => v.toFixed(1);
    const kwk = E.yearOf(S) >= 1895, ck = cfg.key + (kwk ? "k" : "");
    if (!laneCache[ck]) {
      let g = "";
      for (let lo = Math.ceil(cfg.lon0 / cfg.grid) * cfg.grid; lo < cfg.lon1; lo += cfg.grid) { const x = P(0, lo)[0]; g += '<line x1="' + f1(x) + '" y1="0" x2="' + f1(x) + '" y2="' + cfg.H + '"/>'; }
      for (let la = Math.ceil(cfg.lat0 / cfg.grid) * cfg.grid; la < cfg.lat1; la += cfg.grid) { const y = P(la, 0)[1]; g += '<line x1="0" y1="' + f1(y) + '" x2="' + cfg.W + '" y2="' + f1(y) + '"/>'; }
      let o = "";
      for (const [a, b, , , from] of Wd.EDGES) { if (from && !kwk) continue; const p = XY(a), q = XY(b); if (!inside(p) && !inside(q)) continue; o += '<line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '"/>'; }
      const land = (window.MAPDATA || {})[cfg.key] || "";
      laneCache[ck] = '<defs><path id="land-' + cfg.key + '" d="' + land + '"/></defs>' +
        '<rect width="' + cfg.W + '" height="' + cfg.H + '" fill="var(--sea)"/>' +
        '<g stroke="var(--grid)" stroke-width=".5">' + g + "</g>" +
        '<use href="#land-' + cfg.key + '" fill="none" stroke="var(--waterline)" stroke-width="5" opacity=".22" stroke-linejoin="round"/>' +
        '<use href="#land-' + cfg.key + '" fill="none" stroke="var(--waterline)" stroke-width="2.2" opacity=".35" stroke-linejoin="round"/>' +
        '<use href="#land-' + cfg.key + '" fill="var(--land)" stroke="var(--coast)" stroke-width=".55" stroke-linejoin="round"/>' +
        '<g stroke="var(--waterline)" stroke-width=".8" stroke-dasharray="1.2 2.4" opacity=".9">' + o + "</g>" +
        '<g font-family="Old Standard TT, Georgia, serif" font-style="italic" fill="var(--waterline)" letter-spacing=".04em">' + cfg.seas.map(s => '<text x="' + s[1] + '" y="' + s[2] + '" font-size="' + s[3] + '">' + s[0] + "</text>").join("") + "</g>" +
        rose(...cfg.rose);
    }
    let out = '<svg class="map" viewBox="0 0 ' + cfg.W + " " + cfg.H + '" role="img" aria-label="Seekarte Ihrer Linien">' + laneCache[ck];
    if (hideIn) { const a = P(hideIn.lat1, hideIn.lon0), b = P(hideIn.lat0, hideIn.lon1); out += '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(b[0] - a[0]) + '" height="' + f1(b[1] - a[1]) + '" fill="none" stroke="var(--brass)" stroke-width="1" stroke-dasharray="3 2"/>'; }
    const used = new Map([[S.home || "ham", 9]]), edgeLabels = [];
    for (const r of S.routes) {
      const info = E.rInfo(S, r); if (!info) continue;
      const pts = info.path.nodes.map(XY);
      if (!pts.some(inside)) continue;
      const n = S.ships.filter(sh => E.active(S, sh) && sh.line === r.id).length;
      const d = "M" + pts.map(p => f1(p[0]) + "," + f1(p[1])).join(" L");
      out += '<path d="' + d + '" fill="none" stroke="' + (n ? (r.cruise ? "var(--brass-2)" : "var(--ink)") : "var(--muted)") + '" stroke-width="' + (n ? 1.3 + Math.min(n, 4) * .45 : .9) + '" stroke-dasharray="' + (n ? "none" : "3 3") + '" stroke-linejoin="round" stroke-linecap="round"' + (n ? "" : ' opacity=".7"') + "/>";
      for (const id of [r.a, r.b]) {
        if (inside(XY(id))) used.set(id, (used.get(id) || 0) + 1);
        else { const out1 = id === r.b ? pts.findIndex(p => !inside(p)) - 1 : pts.map(inside).lastIndexOf(false) + 1; const p = pts[clampI(out1, 0, pts.length - 1)]; if (p && inside(p)) edgeLabels.push([p, PORTS[id].name]); }
      }
    }
    const hidden = id => hideIn && id !== (S.home || "ham") && (() => { const [la, lo] = Wd.coord(id); return la >= hideIn.lat0 && la <= hideIn.lat1 && lo >= hideIn.lon0 && lo <= hideIn.lon1; })();
    if (mapPick && inside(XY(mapPick)) && !hidden(mapPick)) used.set(mapPick, 99);
    for (const id of Object.keys(PORTS)) { const p = XY(id); if (!inside(p) || used.has(id)) continue; out += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="1.3" fill="var(--coast)" opacity=".55"/>'; }
    const boxes = [[cfg.rose[0] - cfg.rose[2], cfg.rose[1] - cfg.rose[2] - 10, cfg.rose[0] + cfg.rose[2], cfg.rose[1] + cfg.rose[2]]];
    const hitBox = b => b[0] < 0 || b[2] > cfg.W || b[1] < 0 || b[3] > cfg.H || boxes.some(o => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3]));
    const order = [...used.keys()].sort((x, y) => (x === mapPick ? -1 : y === mapPick ? 1 : x === (S.home || "ham") ? -1 : y === (S.home || "ham") ? 1 : used.get(y) - used.get(x)));
    for (const id of order) { const p = XY(id); boxes.push([p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3]); }
    for (const id of order) {
      const p = XY(id);
      out += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + (id === (S.home || "ham") ? 3.8 : 2.6) + '" fill="' + (id === "ham" ? "var(--brass)" : "var(--ink)") + '" stroke="var(--sea)" stroke-width=".8"/>';
      if (hidden(id)) continue;
      const name = PORTS[id].name, w = name.length * 5 + 2;
      const cand = [[p[0] + 5, p[1] - 4, "start"], [p[0] - 5, p[1] - 4, "end"], [p[0], p[1] - 8, "middle"], [p[0], p[1] + 13, "middle"], [p[0] + 5, p[1] + 10, "start"], [p[0] - 5, p[1] + 10, "end"]];
      const fits = cand.find(([x, y, anc]) => { const x0 = anc === "start" ? x : anc === "end" ? x - w : x - w / 2; return !hitBox([x0, y - 8, x0 + w, y + 1]); });
      for (const [x, y, anc] of fits ? [fits] : (id === (S.home || "ham") || id === mapPick) ? [cand[0]] : []) {
        const x0 = anc === "start" ? x : anc === "end" ? x - w : x - w / 2, b = [x0, y - 8, x0 + w, y + 1];
        boxes.push(b);
        out += '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="9.5" text-anchor="' + anc + '" fill="var(--text)" font-family="Alegreya Sans, sans-serif" font-weight="500" paint-order="stroke" stroke="var(--sea)" stroke-width="2.6" stroke-linejoin="round">' + esc(name) + "</text>";
        break;
      }
    }
    const seen = new Set();
    for (const [p, name] of cfg.edges ? edgeLabels : []) { if (seen.has(name)) continue; seen.add(name); const right = p[0] > cfg.W - 60; out += '<text x="' + clampI(p[0] + (right ? -3 : 3), 2, cfg.W - 2).toFixed(1) + '" y="' + clampI(p[1] + 11, 10, cfg.H - 3).toFixed(1) + '" font-size="10" font-style="italic" fill="var(--coast)" font-family="Old Standard TT, Georgia, serif" paint-order="stroke" stroke="var(--sea)" stroke-width="2.4" text-anchor="' + (right ? "end" : "start") + '">→ ' + esc(name) + "</text>"; }
    if (mapPick && inside(XY(mapPick)) && !hidden(mapPick)) { const p = XY(mapPick); out += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="6" fill="none" stroke="var(--brass)" stroke-width="1.6"/>'; }
    for (const id of DESK ? Object.keys(PORTS).sort((x, y) => (x === (S.home || "ham")) - (y === (S.home || "ham"))) : Object.keys(PORTS)) { const p = XY(id); if (!inside(p) || hidden(id)) continue; out += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + (DESK ? 5.5 : 9) + '" fill="transparent" data-act="mapPort" data-p="' + id + '" role="button" aria-label="' + esc(PORTS[id].name) + '" style="cursor:pointer"' + (DESK ? "><title>" + esc(PORTS[id].name) + "</title></circle>" : "/>"); }
    out += '<g class="mships" data-map="' + cfg.key + '">' + mapShips(cfg) + "</g>";
    out += '<rect x="1.5" y="1.5" width="' + (cfg.W - 3) + '" height="' + (cfg.H - 3) + '" fill="none" stroke="var(--coast)" stroke-width=".6"/>';
    return out + "</svg>";
  }
  // Schiffe auf der Karte (v5.0): auf See an ihrer Position, im Hafen leicht versetzt nebeneinander; wird jeden Tag neu gesetzt
  function mapShips(cfg) {
    const P = (lat, lon) => [(lon - cfg.lon0) / (cfg.lon1 - cfg.lon0) * cfg.W, (cfg.lat1 - lat) / (cfg.lat1 - cfg.lat0) * cfg.H], inPort = {};
    let o = "";
    for (const sh of S.ships) {
      if (sh.museum || sh.ready > S.m || !sh.v || !sh.line || sh.laid) continue;
      const pos = E.shipPos(S, sh); if (!pos) continue;
      let [x, y] = P(pos.lat, pos.lon);
      if (x < 0 || x > cfg.W || y < 0 || y > cfg.H) continue;
      if (!pos.sea) { const k = Math.round(x) + "," + Math.round(y), n = inPort[k] = (inPort[k] || 0) + 1; x += 3.2 * n; y -= 2.6; }
      const sel = mapShip === sh.id, late = sh.v.st === "see" && sh.v.eta - sh.v.pa >= 1;
      o += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (sel ? 3.8 : pos.sea ? 2.7 : 2.1) + '" fill="' + (pos.sea ? "var(--brass)" : "var(--paper)") + '" stroke="' + (late ? "var(--red)" : "var(--ink)") + '" stroke-width="' + (sel ? 1.5 : .8) + '" data-act="mapShip" data-id="' + sh.id + '" role="button" aria-label="„' + esc(sh.name) + '“" style="cursor:pointer">' + (DESK ? "<title>„" + esc(sh.name) + "“</title>" : "") + "</circle>";
    }
    return o;
  }
  function mapShipsLive() { document.querySelectorAll("svg.map g.mships").forEach(g => { const cfg = g.dataset.map === "bight" ? BIGHT : MAIN; g.innerHTML = mapShips(cfg); }); const i = $("mapship"); if (i) { i.innerHTML = mapShipInfo(); translateDom(i); } }
  function mapShipInfo() { const sh = mapShip && S.ships.find(x => x.id === mapShip); return sh && sh.v ? "<b>„" + esc(sh.name) + "“</b> · " + voyLine(sh).replace(/^<div class="meta voy">|<\/div>$/g, "") : ""; }
  function mapSVG() {
    const inB = id => { const [la, lo] = Wd.coord(id); return la >= BIGHT.lat0 && la <= BIGHT.lat1 && lo >= BIGHT.lon0 && lo <= BIGHT.lon1; };
    const needInset = (S.home || "ham") === "ham" && S.routes.some(r => (r.a !== "ham" && inB(r.a)) || (r.b !== "ham" && inB(r.b)));
    let h = '<div class="mapwrap">' + drawMap(MAIN, needInset ? BIGHT : null) + "</div>" + '<div class="meta" id="mapship" style="margin:2px 0 0">' + mapShipInfo() + "</div>";
    h += '<div class="meta" style="margin:2px 0 6px">' + (mapPick ? "Start: <b>" + esc(PORTS[mapPick].name) + "</b> – " + (DESK ? "klicken" : "tippen") + " Sie jetzt den Zielhafen an." : (DESK ? "Klicken" : "Tippen") + " Sie zwei Häfen an, um eine neue Linie zu planen.") + "</div>";
    if (needInset) h += '<div class="mapcap">Deutsche Bucht und westliche Ostsee</div><div class="mapwrap">' + drawMap(BIGHT, null) + "</div>";
    return h;
  }

  /* ---------- Kontor ---------- */
  const SPECIAL_COST = ["Werft", "Reparaturen", "Strafen", "Lotsengeld", "Schadenersatz", "Bergelohn", "Gutachten", "Agenturen", "Sonderausgaben", "Museumsbau", "Entschädigungen", "Kursverluste"];
  const LEDGER_ORDER = ["Kohle", "Heuer", "Verpflegung", "Hafengebühren", "Wartung", "Versicherung", "Werbung", "Zinsen", "Vertragsstrafen", "Überziehungszins", "Kontor"];
  function ledgerOld() {
    const c = S.cur, prev = S.last, ex = c.extra || {};
    const costSum = Object.values(c.cost).reduce((a, b) => a + b, 0), exSum = Object.values(ex).reduce((a, b) => a + b, 0);
    let h = '<div class="ledger" id="ledger"><h4>Laufender Monat · ' + (c.days ? "1.–" + c.days + ". " : "") + E.dateStr(S.m) + "</h4>";
    h += '<div class="l"><span>Fahrkarten</span><span>' + E.fmt(c.rev - (c.freight || 0)) + "</span></div>";
    if (c.freight > 1) h += '<div class="l"><span>Fracht</span><span>' + E.fmt(c.freight) + "</span></div>";
    const exKeys = Object.keys(ex).filter(k => ex[k] > .5);
    if (exKeys.length) { h += '<div class="l sub"><span>Sondereinnahmen</span><span></span></div>'; for (const k of exKeys) h += '<div class="l ind"><span>' + k + "</span><span>" + E.fmt(ex[k]) + "</span></div>"; }
    const costKeys = LEDGER_ORDER.filter(k => c.cost[k] > .5).concat(Object.keys(c.cost).filter(k => !LEDGER_ORDER.includes(k) && c.cost[k] > .5 && !SPECIAL_COST.includes(k)));
    for (const k of costKeys) h += '<div class="l"><span>' + k + "</span><span>−" + E.fmt(c.cost[k]) + "</span></div>";
    const spKeys = SPECIAL_COST.filter(k => c.cost[k] > .5);
    if (spKeys.length) { h += '<div class="l sub"><span>Sonderausgaben</span><span></span></div>'; for (const k of spKeys) h += '<div class="l ind"><span>' + k + "</span><span>−" + E.fmt(c.cost[k]) + "</span></div>"; }
    h += '<div class="l sum"><span>Ergebnis bisher</span><span>' + signed(c.rev + exSum - costSum) + "</span></div>";
    if (prev) h += '<div class="l sum2"><span>Vormonat (' + E.dateStr(prev.m) + ")</span><span>" + signed(prev.profit) + "</span></div>" + (prev.principal > 1 ? '<div class="l sum2"><span>Tilgung im Vormonat</span><span>−' + E.fmt(prev.principal) + "</span></div>" : "");
    return h + '<div class="meta" style="margin-top:6px">Zinsen und Tilgung werden am Monatsende gebucht.</div></div>';
  }
  function kontor() {
    const rt = E.rating(S), eq = E.equity(S), yr = Math.floor(S.m / 12) + 1;
    let h = "";
    if (!S.ships.length) h += '<div class="hint">Noch fährt kein Schiff unter Ihrer Flagge. Eröffnen Sie unter „Linien“ eine Verbindung, bestellen Sie in der „Werft“ ein Schiff und weisen Sie es in der „Flotte“ der Linie zu.</div>';
    if (S.cash < 0) h += '<div class="hint bad">Die Kasse ist im Minus. Nach vier Monaten in Folge – oder bei zu hohen Schulden – ist die Reederei zahlungsunfähig.</div>';
    if (S.speed === 0 && !S.over) h += '<div class="hint">Die Zeit steht still. Mit „Langsam“ am Maschinentelegrafen ' + (DESK ? "oben oder der Leertaste" : "unten") + ' geht es los – ein Tag dauert dann vier Sekunden.</div>';
    const over = S.ships.filter(sh => E.detained(S, sh)), soon = S.ships.filter(sh => !E.detained(S, sh) && sh.survey != null && sh.ready <= S.m && sh.survey - S.t <= 60);
    if (over.length) h += '<div class="hint bad">Frist abgelaufen: ' + over.map(sh => "„" + esc(sh.name) + "“").join(", ") + ". Diese Schiffe liegen fest, bis die Frist erneuert ist.</div>";
    if (soon.length) h += '<div class="hint">Frist läuft bald ab: ' + soon.map(sh => "„" + esc(sh.name) + "“ (" + (sh.survey - S.t) + " Tage)").join(", ") + ". Unter Flotte erneuern.</div>";
    const risky = S.ships.filter(sh => { const r = E.riskOf(S, sh); return r && r.label === "hoch" && sh.cond < 60; });
    if (risky.length) h += '<div class="hint bad">Hohe Sinkgefahr: ' + risky.map(sh => "„" + esc(sh.name) + "“").join(", ") + " – der Zustand ist schlecht. Docken, gründlichere Wartung oder Schotten helfen.</div>";
    h += '<h2>Kontor</h2><p class="sub">' + yr + ". Geschäftsjahr · Reederei-Index " + E.fmt(E.score(S)) + "</p>";
    h += '<div class="kv"><div><b>' + M(eq) + '</b><span>Eigenkapital</span></div><div><b>' + rt.grade + "</b><span>Bonität bei der Bank</span></div>" +
      "<div><b>" + Math.round(S.rep) + '</b><span>Ruf (50 ist Durchschnitt)</span></div><div><b>' + Math.round(S.mk.brand) + "</b><span>Bekanntheit</span></div></div>";
    h += coalBar();
    if (!DESK) h += mapSVG();
    h += ledger2();
    const got = E.ACH.filter(a => S.ach && S.ach[a.id]);
    h += '<details class="sec" data-sec="ach"' + (openSec.ach ? " open" : "") + '><summary><span>Erfolge</span><span class="cnt">' + got.length + "/" + E.ACH.length + "</span></summary>" + img("ev_erfolge", "banner", "Vitrine mit Auszeichnungen") + '<div class="achgrid">' +
      E.ACH.map(a => { const on = S.ach && S.ach[a.id]; return '<div class="ach' + (on ? " on" : "") + '"><b>' + (on ? "★ " : "☆ ") + a.name + "</b><span>" + a.desc + (on ? " · " + E.dateStr(on - 1) : "") + "</span></div>"; }).join("") + "</div></details>";
    if (!DESK) h += '<h2>' + paperName() + '</h2>' + newsBox(8);
    h += '<details><summary>So funktioniert ' + (DESK ? "das Spiel" : "der Prototyp") + '</summary><ul>' +
      (DESK ? "<li>Tastatur: Die Leertaste hält die Zeit an oder lässt sie weiterlaufen, 0 bis 3 stellen den Maschinentelegrafen, K, L, F, W, M und B wechseln die Bereiche. Bei Ereignissen wählen 1 bis 9 die Antwort, Esc schließt Fenster.</li>" : "") + "<li>Unter <b>Kontor</b> finden Sie auch Statistiken zu Schiffen, Linien und Finanzen sowie Ihr Personal. Unter <b>Markt</b> stehen Werbung, die sechs Rivalen und die Marktforschung.</li>" +
      "<li>Die Zeit läuft von selbst: Ein Tag dauert auf „Langsam“ vier Sekunden, auf „Halbe“ zwei und auf „Volle“ eine. " + (DESK ? "Am Maschinentelegrafen oben halten Sie an oder geben mehr Fahrt – oder mit der Leertaste und den Tasten 0 bis 3." : "Am Maschinentelegrafen unten halten Sie an oder geben mehr Fahrt.") + " Bei Ereignissen stoppt die Zeit.</li>" +
      "<li>Ihre Schiffe fahren nach Fahrplan: Abfahrt, Seezeit, Ankunft, Liegezeit. Die Fahrgäste zahlen bei der Abfahrt. Wer zu lange auf Ihr Schiff warten muss, fährt mit der Konkurrenz. Kontor → Abfahrten zeigt die Tafel, unter Linien stellen Sie Puffer, Reserveschiff und Aufholen ein.</li>" +
      "<li>Kohle kostet erst beim Bekohlen: Menge mal Hafenpreis. Nah an den Zechen ist sie billig, in der Ferne teuer. Die Regel dafür steht unter Kontor → Einkauf, einzelne Schiffe stellen Sie in der Flotte anders ein.</li>" +
      "<li>Sturm, Nebel, Eis, Streiks und Pannen bringen Verspätungen. Ab zwei Tagen zahlen Sie Entschädigung, große Verspätungen stehen in der Zeitung, und unpünktliche Linien verlieren Fahrgäste.</li>" +
      (DESK ? "<li>Unter <b>Linien</b> wählen Sie Start- und Zielhafen frei aus rund 50 Häfen – oder klicken zwei Häfen auf der Seekarte rechts an.</li>" : "<li>Unter <b>Linien</b> wählen Sie Start- und Zielhafen frei aus rund 50 Häfen – oder tippen zwei Häfen auf der Karte an.</li>") +
      "<li>Größere Schiffe haben Klassen: 1. und 2. Klasse, dazu 3. Klasse oder Zwischendeck. Jede Linie hat ihre eigene Nachfrage je Klasse, und Sie setzen die Preise je Klasse. Kleine Fähren fahren mit einer Einheitsklasse.</li>" +
      "<li>Jeder Hafen hat seine Kundschaft: Badegäste auf den Inseln, Bahnreisende an den Fährhäfen, Kaufleute in den großen Städten, Auswanderer nach Übersee.</li>" +
      "<li>Vergnügungsreisen (ab 1891/92) sind eine eigene Linienart: Nordland im Sommer, Mittelmeer und Orient im Winter.</li>" +
      "<li><b>Werbung</b> macht Sie bekannter und bringt mehr Fahrgäste – laufende Anzeigen, Agenturen, Kampagnen für einzelne Linien.</li>" +
      "<li>Unter Kontor → Einkauf kaufen Sie Kohle auf Vertrag für einen Hafen und bestimmen die Verpflegung an Bord. In der Flotte wählen Sie die Fahrstufe: Sparfahrt spart Kohle, Volldampf schafft mehr Fahrten.</li>" +
      "<li>Ab drei Schiffen und einem Geschäftsjahr mit Gewinn öffnet sich unter Kontor → Börse der Aktienhandel. Wer ihn nicht nutzt, verpasst nichts.</li>" +
      "<li>Auf See droht Seenot. Dann entscheiden Sie: aufgeben, pumpen oder Hilfe rufen. Rettungsboote, Schotten und Funk verbessern die Aussichten.</li>" +
      "<li>Das Spiel läuft endlos. Löhne, Preise und Reisende nehmen über die Jahrzehnte zu, neue Technik und Bahnverbindungen verändern die Märkte.</li></ul></details>";
    h += '<div class="toggles"><button class="btn" data-act="snd">' + (Snd.on ? "Ton ausschalten" : "Ton einschalten") + '</button><button class="btn" data-act="music" ' + (Snd.on && Snd.hasMusic ? "" : "disabled") + ">" +
      (Snd.musicOn ? "Musik ausschalten" : "Musik einschalten") + '</button><button class="btn" data-act="nexttrack" ' + (Snd.on && Snd.musicOn && Snd.hasMusic ? "" : "disabled") + ">Nächstes Stück</button></div>";
    if (Snd.hasMusic && Snd.on && Snd.musicOn) h += '<div class="now">Es spielt: „' + esc(Snd.title) + "“</div>";
    h += diffBox();
    h += '<label class="field">Sprache</label><div class="seg" role="group" aria-label="Sprache">' + [["de", "Deutsch"], ["en", "English"], ["es", "Español"]].map(([k, n]) => '<button data-act="setLang" data-v="' + k + '" aria-pressed="' + (LANG === k) + '">' + n + "</button>").join("") + "</div>";
    h += tutList();
    h += '<div class="actions"><button class="btn" data-act="exportOpen">Spielstand exportieren</button><button class="btn" data-act="importOpen">Spielstand importieren</button></div>';
    h += '<div class="actions"><button class="btn warn" data-act="reset">' + (confirmReset ? "Wirklich alles löschen und neu beginnen?" : "Neues Spiel beginnen") + "</button></div>";
    return h;
  }

  /* ---------- Linien ---------- */
  const PORT_IMG = { fun: "line_madeira", lpa: "line_kanaren", sct: "line_kanaren", fue: "line_fuerte", pal: "line_mallorca", sth: "line_karibik", kin: "line_karibik", bgi: "line_karibik", hva: "line_havanna", hmf: "line_nordland", lpl: "gb_liverpool", bir: "gb_liverpool", dov: "gb_dover", cal: "gb_dover", dou: "gb_douglas", que: "gb_queenstown", gla: "gb_clyde", bel: "gb_clyde", hol: "gb_holyhead", dub: "gb_holyhead", por: "line_insel", ryd: "line_insel", grv: "line_london", til: "line_london", ply: "line_ny", bla: "line_hafen", gls: "line_hafen", wis: "line_hafen", jui: "line_insel", dag: "line_insel", wyk: "line_insel", lab: "line_kiel", tra: "line_kopen", ros: "line_faehre", str: "line_faehre", alt: "line_faehre", hsr: "line_faehre", hsb: "line_faehre", fin: "line_hafen", cux: "line_cux", hel: "line_helgo", nor: "line_norder", ndd: "line_norder", bor: "line_insel", syl: "line_insel", hoy: "line_insel", emd: "line_insel",
    kie: "line_kiel", kor: "line_kiel", fre: "line_kiel", kop: "line_kopen", mal: "line_kopen", lue: "line_kopen", dan: "line_kopen", kgb: "line_kopen", ste: "line_kopen",
    sto: "line_stockholm", rig: "line_stockholm", stp: "line_stockholm", got: "line_stockholm",
    war: "line_faehre", ged: "line_faehre", sas: "line_faehre", tre: "line_faehre", har: "line_faehre", hoe: "line_faehre", rot: "line_rot", ams: "line_rot", ant: "line_rot", bhv: "line_rot",
    lon: "line_london", hul: "line_london", lei: "line_london", sou: "line_london", hav: "line_london", ny: "line_ny", rio: "line_sued", bue: "line_sued", kap: "line_sued",
    lis: "line_neapel", gen: "line_neapel", nea: "line_neapel", sha: "line_asien", ale: "line_asien", ber: "line_nordland", osl: "line_nordland", kon: "line_orient" };
  const routeImg = r => {
    if (r.cruise) { const d = [r.a, r.b].find(x => PORTS[x].tour > 0) || r.b; return PORTS[d].tourSeason === "nord" ? "line_nordland" : (d === "nea" || d === "gen" || d === "lis") ? "line_neapel" : "line_orient"; }
    if (r.a === "kie" && r.b === "ham" || r.a === "ham" && r.b === "kie") return E.yearOf(S) >= 1895 ? "line_kanal" : "line_kiel";
    return (r.a === "ham" ? PORT_IMG[r.b] : PORT_IMG[r.b] && r.b !== "ham" ? PORT_IMG[r.b] : PORT_IMG[r.a]) || "title";
  };
  function seasonBar(season) {
    const mo = E.cal(S.m).mo, mx = Math.max.apply(null, season) || 1;
    let h = '<span class="season" aria-label="Saison">';
    for (let i = 0; i < 12; i++) h += '<i class="' + (season[i] / mx > .55 ? "on" : "") + (i === mo ? " now" : "") + '" title="' + E.MONTHS[i] + '"></i>';
    return h + "</span>";
  }
  const fitTypes = (a, b, cruise, stops) => E.TYPE_ORDER.filter(k => E.typeOpen(S, k) && !E.canServe(S, k, a, b, cruise, stops));
  let selA = "ham", selB = "", selCruise = false, selStops = [];
  function portOptions(sel, placeholder) {
    let o = placeholder ? '<option value="">' + placeholder + "</option>" : "";
    for (const reg of E.REGIONS) {
      o += '<optgroup label="' + reg + '">';
      for (const id of Object.keys(PORTS).filter(x => PORTS[x].reg === reg).sort((x, y) => PORTS[x].name.localeCompare(PORTS[y].name, "de")))
        o += '<option value="' + id + '"' + (id === sel ? " selected" : "") + ">" + esc(PORTS[id].name) + "</option>";
      o += "</optgroup>";
    }
    return o;
  }
  const eur = v => v.toFixed(v < 100 ? 2 : 0).replace(".", ",");
  function clsLine(info) { return [0, 1, 2].filter(i => info.mix[i] >= .04).map(i => E.clsName(i, info.ocean).replace(" Klasse", " Kl.") + " " + Math.round(info.mix[i] * 100) + " % · " + eur(info.refC[i] * S.pidx) + " M").join("<br>"); }
  const kindLabel = info => info.kind.cat + (info.kind.sub ? " · " + info.kind.sub : "");
  function builder() {
    let h = '<div class="builder"><h3 style="font-size:19px">Neue Linie eröffnen</h3><div class="two"><div><label class="field" for="selA">Start</label><select id="selA" data-act="selA">' + portOptions(selA) +
      '</select></div><div><label class="field" for="selB">Ziel</label><select id="selB" data-act="selB">' + (selA ? portOptionsDist(selB, "Hafen wählen …") : portOptions(selB, "Hafen wählen …")) + "</select></div></div>" + (selA ? distChips() : "");
    const tourOk = selB && (E.tourOpen(S, selB) || E.tourOpen(S, selA));
    if (tourOk) h += '<label class="check"><input type="checkbox" id="selCruise" data-act="selCruise" ' + (selCruise ? "checked" : "") + "> Als Vergnügungsreise anbieten (Rundreise für Touristen)</label>";
    const cruiseSel = tourOk && selCruise;
    if (selA && selB && selA !== selB && !cruiseSel) {
      h += '<div class="stops">' + selStops.map((x, i) => '<div class="two stoprow"><div><label class="field">Zwischenhalt ' + (i + 1) + '</label><select data-act="selStop" data-i="' + i + '">' + portOptions(x, "Hafen wählen …") + '</select></div><div><button class="btn" data-act="stopDel" data-i="' + i + '" aria-label="Zwischenhalt entfernen" style="margin-top:22px">✕</button></div></div>').join("") +
        (selStops.length < 2 ? '<button class="linkbtn" data-act="stopAdd">+ Zwischenhalt hinzufügen</button>' : "") + "</div>";
    }
    if (selA && selB && selA !== selB) {
      const cruise = tourOk && selCruise, stops = cruise ? [] : selStops.filter(x => x && x !== selA && x !== selB), info = stops.length ? E.stopInfo(S, [selA, ...stops, selB]) : E.routeInfo(S, selA, selB, cruise);
      if (!info) h += '<div class="hint">Keine Seeverbindung.</div>';
      else {
        const D = Math.round(info.D0 * (1 + .025 * S.m / 12) * S.konj), fits = fitTypes(selA, selB, cruise, stops);
        const dup = S.routes.some(r => !!r.cruise === !!cruise && (r.stops || []).join(",") === stops.join(",") && ((r.a === selA && r.b === selB) || (r.a === selB && r.b === selA && !stops.length)));
        h += '<div style="margin-top:12px">' + img(routeImg({ a: selA, b: selB, cruise }), "banner", info.name) + "<h3 style=\"font-size:18px\">" + esc(info.name) + "</h3>";
        h += '<table class="fin" style="width:100%"><tr><td>Entfernung</td><td>' + E.fmt(info.dist) + " sm" + (info.path.canalFee ? " (mit Kanal)" : "") + "</td></tr><tr><td>Nachfrage (Jahresmittel)</td><td>" +
          (D ? "ca. " + E.fmt(D) + " Reisende im Monat" : "kaum") + "</td></tr><tr><td>Linientyp</td><td><b>" + kindLabel(info) + "</b></td></tr><tr><td>Kundschaft</td><td>" + esc(info.who) + "</td></tr><tr><td>Klassen</td><td>" + clsLine(info) + "</td></tr><tr><td>Konkurrenz</td><td>" + (info.comp.deps > 0 ? "ca. " + Math.max(1, Math.round(info.comp.deps)) + " Abfahrten/Monat" : "keine") + "</td></tr><tr><td>Saison</td><td>" + seasonBar(info.season) + "</td></tr></table>";
        if (info.multi) {
          const g = 1 + .025 * S.m / 12;
          h += '<div class="tblwrap"><table class="stat"><thead><tr><th>Teilstrecke</th><th class="n">Entfernung</th><th class="n">Reisende/Monat</th></tr></thead><tbody>' +
            info.ods.map(o => "<tr><td>" + esc(o.info.name) + '</td><td class="n">' + E.fmt(o.along) + ' sm</td><td class="n">' + E.fmt(Math.round(o.info.D0 * g * S.konj * (o.j - o.i < info.legs.length ? .6 : 1))) + "</td></tr>").join("") + "</tbody></table></div>" +
            '<div class="meta">In jedem Zwischenhafen wird Kohle gebunkert – es zählt die längste Teilstrecke. Jeder Halt kostet Liegezeit und Anlegegebühren, Durchreisende sind etwas länger unterwegs.</div>';
        }
        if (info.shallow) h += '<div class="meta" style="margin-top:6px">Flacher Hafen – nur flach gebaute Schiffe.</div>';
        if (info.ocean) h += '<div class="meta">Führt über den Ozean – nur hochseetaugliche Schiffe.</div>';
        h += '<div class="meta" style="margin-top:6px">Passende Schiffe: ' + (fits.length ? fits.map(k => E.TYPES[k].name).join(", ") : "derzeit keine") + ". In der Werft zu finden unter „" + GROUP_NAME[info.kind.grp] + "“.</div>";
        h += '<div class="actions"><button class="btn solid" data-act="openRoute" ' + (dup ? "disabled" : "") + ">" + (dup ? "Linie besteht bereits" : "Linie eröffnen (" + M(Math.round(2000 * S.pidx)) + ")") + "</button></div></div>";
      }
    }
    if (selA && !selB) h += flowBox(selA);
    const sug = E.suggest(S, 8);
    if (sug.length) h += '<div class="meta" style="margin-top:12px">Gefragte Verbindungen:</div><div class="chips">' + sug.map(x => '<button class="chip" data-act="pickPair" data-a="' + x.a + '" data-b="' + x.b + '">' + esc(PORTS[x.a].name) + " – " + esc(PORTS[x.b].name) + "</button>").join("") + "</div>";
    return h + "</div>";
  }
  function routeCard(r) {
    const info = E.rInfo(S, r); if (!info) return "";
    const last = r.last && r.last.m === S.m - 1 ? r.last : null, mine = S.ships.filter(sh => sh.line === r.id);
    const cd = E.compDepsOf(S, r, info);
    let h = '<div class="item">' + img(routeImg(r), "banner", info.name) + '<div class="row"><h3>' + esc(info.name) + "</h3>" + seasonBar(info.season) + "</div>";
    h += '<div class="meta"><span class="kind">' + kindLabel(info) + "</span> " + esc(info.who) + " · " + E.fmt(info.dist) + " sm</div>";
    const rvs = E.rivalsOf(S, r, info);
    h += '<div class="meta">Konkurrenz: ' + (cd > 0 && rvs.length ? rvs.map(x => E.RIV[x.k].name + (last && last.riv && last.D ? " (" + Math.round((last.riv[x.k] || 0) / last.D * 100) + " %)" : "")).join(", ") : "keine") + (r.adOn ? ' <span class="tag">Werbung läuft</span>' : "") + "</div>";
    h += '<div class="meta">Ihre Schiffe: ' + (mine.length ? mine.map(sh => "„" + esc(sh.name) + "“" + (sh.ready > S.m ? " (im Bau)" : sh.laid || !sh.line ? " (aufgelegt)" : "")).join(", ") : "keine") + "</div>";
    const offered = [0, 1, 2].map(i => mine.some(sh => E.TYPES[sh.type].sb[i] > 0));
    for (const i of [0, 1, 2]) {
      if (info.mix[i] < .04 && !offered[i]) continue;
      const lc = last && last.cls ? last.cls[i] : null;
      const st = !offered[i] ? "nicht im Angebot" : lc && lc.cap ? Math.round(lc.pax / lc.cap * 100) + " % belegt" : "noch keine Fahrt";
      h += '<div class="clsrow"><div class="cn"><b>' + E.clsName(i, info.ocean) + "</b><span>" + Math.round(info.mix[i] * 100) + " % der Nachfrage · " + st + '</span></div><div class="stepper sm"><button data-act="price" data-id="' + r.id + '" data-c="' + i + '" data-d="-1" aria-label="Preis senken">−</button><div class="val"><b>' + eur(E.routePrice(S, r, i)) +
        " M</b><span>" + Math.round(E.pricePct(S, r, i) * 100) + ' % üblich</span></div><button data-act="price" data-id="' + r.id + '" data-c="' + i + '" data-d="1" aria-label="Preis erhöhen">+</button></div></div>';
    }
    const low = [0, 1, 2].some(i => (info.mix[i] >= .04 || offered[i]) && E.pricePct(S, r, i) < .97);
    h += '<div class="actions" style="margin-top:4px"><button class="btn" data-act="align" data-id="' + r.id + '"' + (low ? "" : " disabled") + ">Auf übliche Preise anheben</button></div>";
    if (low) h += '<div class="meta">Die üblichen Preise sind mit der Inflation gestiegen. Anheben bis 100 % kostet keine Fahrgäste.</div>';
    if (last && last.ships) h += '<div class="stats"><div><b>' + E.fmt(last.pax) + '</b><span>Fahrgäste</span></div><div><b>' + Math.round(last.load * 100) + ' %</b><span>Auslastung</span></div><div><b>' + Math.round(last.share * 100) + ' %</b><span>Marktanteil</span></div></div><div class="meta">Beitrag nach Kohle, Hafen und Verpflegung: ' + signed(last.rev - last.cost) + " Mark</div>";
    else h += '<div class="meta" style="margin-top:8px">Letzten Monat ohne eigene Schiffe im Einsatz. Passende Schiffe: ' + (fitTypes(r.a, r.b, r.cruise).map(k => E.TYPES[k].name).join(", ") || "keine") + "</div>";
    if (mine.length) h += fahrplanBox(r, info);
    if (!mine.length) h += '<div class="actions"><button class="btn warn" data-act="closeRoute" data-id="' + r.id + '">Linie schließen</button></div>';
    return h + "</div>";
  }
  function linien() {
    let h = '<h2>Linien</h2><p class="sub">Sie bestimmen, wohin Ihre Schiffe fahren und was jede Klasse kostet. Preisänderungen gelten sofort.</p>';
    h += builder();
    h += '<h2>Ihre Linien</h2>' + (S.routes.length ? S.routes.map(routeCard).join("") : '<div class="hint">Noch keine Linie. Wählen Sie oben Start und Ziel.</div>');
    return h;
  }

  /* ---------- Flotte ---------- */
  function condBar(c) { return '<div class="bar"><i class="' + (c < 40 ? "crit" : c < 65 ? "warn" : "") + '" style="width:' + Math.round(c) + '%"></i></div>'; }
  function lineSelect(sh) {
    let o = '<select id="l' + sh.id + '" data-act="line" data-id="' + sh.id + '"><option value="">Aufgelegt (kaum Kosten)</option>', n = 0;
    for (const r of S.routes) { if (E.canServe(S, sh.type, r.a, r.b, r.cruise, r.stops)) continue; n++; o += '<option value="' + r.id + '" ' + (sh.line === r.id ? "selected" : "") + ">" + esc(E.rInfo(S, r).name) + "</option>"; }
    o += "</select>";
    if (!n) o += '<div class="meta">Keine Ihrer Linien passt zu diesem Schiff. Eröffnen Sie unter Linien eine passende Verbindung.</div>';
    return o;
  }
  function seatsText(t) {
    const n = t.sb.filter(x => x > 0).length;
    if (n === 1) return "Einheitsklasse (zählt als " + E.clsName(t.sb.findIndex(x => x > 0), t.ocean) + "), " + E.fmt(t.seats) + " Plätze";
    return t.sb.map((x, i) => x ? E.clsName(i, t.ocean).replace(" Klasse", " Kl.") + " " + E.fmt(x) : "").filter(Boolean).join(" · ");
  }
  function fristLine(sh) {
    if (sh.survey == null || sh.ready > S.m) return "";
    const fi = E.fristInfo(S, sh), btn = fi.can && !E.inDock(S, sh) ? '<div class="actions"><button class="btn" data-act="frist" data-id="' + sh.id + '">Frist erneuern (' + fi.days + " Tage, " + M(fi.cost) + ")</button></div>" : "";
    if (fi.left < 0) return '<div class="hint bad"><b>Frist abgelaufen.</b> Das Schiff darf nicht auslaufen und ist nicht versichert.' + btn + "</div>";
    return '<div class="meta">Frist gültig bis ' + E.dateAfter(S, fi.left) + (fi.left <= 90 ? ' <span class="badge hoch">läuft bald ab</span>' : fi.left <= 365 ? ' <span class="badge erhöht">im nächsten Jahr</span>' : "") + "</div>" + btn;
  }
  function storyBox(k) {
    const t = E.TYPES[k];
    return '<details class="story"><summary>' + (k === "american" ? "Die Legende der American Star" : "Die wahre Geschichte") + "</summary>" + (k === "american" ? img("ev_wrack", "plateimg", "Das Wrack der American Star vor Fuerteventura") : "") + "<p>" + esc(t.story) + "</p></details>";
  }
  function typeSpecs(t) { return "Reichweite " + E.fmt(t.range) + " sm" + (t.shallow ? " · flach gebaut" : "") + (t.ocean ? " · hochseetauglich" : "") + (t.trajekt ? " · nur Fährbahnhöfe, mit Güterwagen" : "") + (t.cargo ? " · Frachtraum" : ""); }
  const TYPE_GROUP = t => t.ocean ? 2 : t.range > 350 ? 1 : 0;
  const GROUP_NAME = ["Hafen, Küste und Fähren", "Nord- und Ostsee", "Hochsee: Mittelmeer und Übersee"];
  const openShip = new Set();
  function shipStatus(sh) {
    if (sh.ready > S.m) return ["Im Bau bis " + E.dateStr(sh.ready), ""];
    if (sh.charter >= S.m) return ["Verchartert", ""];
    if (E.inDock(S, sh)) return ["In der Werft", "warn"];
    if (sh.survey != null && sh.survey < S.t) return ["Frist abgelaufen", "bad"];
    if (!sh.line || sh.laid) return ["aufgelegt", ""];
    const r = S.routes.find(x => x.id === sh.line), i = r && E.rInfo(S, r);
    return [i ? i.name : "Linie", "ok"];
  }
  function shipCard(sh) {
    let h = "";
      const t = E.TYPES[sh.type], built = E.cal(S.m).y - Math.floor(sh.age / 12), risk = E.riskOf(S, sh);
      h += '<div class="item">' + img("ship_" + sh.type, "shipimg", t.name, sh) + '<div class="row"><h3>„' + esc(sh.name) + '“' + (t.special ? '<span class="tag gold">Sonderschiff</span>' : "") + (sh.emil ? '<span class="tag gold">Kapitän Emil</span>' : "") + (sh.brandt ? '<span class="tag">Brandt-Bauart</span>' : "") + "</h3>" + (t.special ? "" : '<button class="btn" style="min-height:36px;padding:0 10px;font-size:14px" data-act="renameOpen" data-id="' + sh.id + '">Umbenennen</button>') + "</div>" +
        '<div class="meta">' + t.name + " (" + t.cls + ") · " + kn(Math.round((t.speed + Math.max(0, sh.spd || 0)) * 10) / 10) + " Knoten" + (sh.ready > S.m ? "" : " · Baujahr " + built) + "</div><div class=\"meta\">" + seatsText(t) + "</div><div class=\"meta\">" + typeSpecs(t) + "</div>";
      if (t.special) h += '<div class="trait">' + esc(t.trait) + "</div>" + storyBox(sh.type);
      if (sh.ready > S.m) {
        const ser = sh.series ? S.ships.filter(x => x.series === sh.series).sort((a, b) => a.ready - b.ready) : null, ci = E.cancelInfo(S, sh);
        h += '<div class="hint">Im Bau – Ablieferung ' + E.dateStr(sh.ready) + "." + (ser && ser.length > 1 ? " Schiff " + (ser.indexOf(sh) + 1) + " von " + ser.length + " einer Serie." : "") + '</div><label class="field" for="l' + sh.id + '">Linie nach Ablieferung</label>' + lineSelect(sh) + planBox(sh) + capBox(sh);
        if (ci) h += ci.can ? '<div class="actions"><button class="btn warn" data-act="cancelOrder" data-id="' + sh.id + '">' + (confirmCancel === sh.id ? "Wirklich abbestellen? Die Werft behält " + M(ci.fee) : "Abbestellen (Werft behält " + M(ci.fee) + ")") + "</button></div>" : '<div class="meta">Der Bau hat begonnen – abbestellen geht nicht mehr.</div>';
        return h + "</div>";
      }
      if (sh.charter >= S.m) { h += '<div class="hint">Verchartert an die Marine bis ' + E.dateStr(sh.charter) + " – " + M(sh.charterRate) + " im Monat.</div></div>"; return h; }
      const val = E.shipValue(S, sh), loan = S.loans.find(l => l.ship === sh.id);
      h += '<div class="row" style="margin-top:8px"><span>Zustand ' + Math.round(sh.cond) + " %" + (risk ? '<span class="badge ' + risk.label + '">Sinkgefahr ' + risk.label + "</span>" : "") + '</span><span class="num">Wert ' + M(val) + "</span></div>" + condBar(sh.cond);
      if (E.inDock(S, sh)) h += '<div class="hint">In der Werft bis zum ' + E.dateAfter(S, sh.dockUntil - S.t) + " – noch <span data-dock=\"" + sh.id + "\">" + (sh.dockUntil - S.t) + " Tag" + (sh.dockUntil - S.t === 1 ? "" : "e") + "</span>.</div>";
      else if (sh.v) h += '<div data-voy="' + sh.id + '">' + voyLine(sh) + "</div>";
      if (E.offDuty(S, sh)) h += '<div class="hint">Auf Sonderfahrt – zurück in ' + (sh.offUntil - S.t) + " Tagen.</div>";
      h += fristLine(sh);
      if (sh.defects && sh.defects.length) h += '<div class="hint">Mängel: ' + sh.defects.map(d => d === "maschine" ? "Maschine läuft unruhig (−0,3 Knoten, etwas höhere Havariegefahr)" : "Schraube verbogen (−0,2 Knoten)").join("; ") + ". Werden bei der nächsten Dockung behoben.</div>";
      if (sh.emil) h += '<div class="trait">Kapitän Emil an Bord: Glücksschiff mit halber Havariegefahr und besseren Aussichten in Seenot.</div>';
      for (const k of ["kessel", "rumpf"]) if (sh.majLate && sh.majLate[k]) h += '<div class="hint bad">' + E.MAJOR[k].name + " aufgeschoben – " + (k === "kessel" ? "höhere Havariegefahr, mehr Kohle." : "schnellerer Verschleiß, Zustand höchstens 70 %.") + '<div class="actions"><button class="btn" data-act="major" data-id="' + sh.id + '" data-k="' + k + '">Jetzt erneuern (' + M(E.majorCost(S, sh, k)) + ", " + E.dockDays(sh.type, k) + " Tage)</button></div></div>";
      if (sh.line && sh.lastPax != null && E.active(S, sh)) h += '<div class="meta">Letzter Monat: ' + E.fmt(sh.lastPax) + " Fahrgäste, " + Math.round((sh.lastLoad || 0) * 100) + " % Auslastung</div>";
      if (sh.last && sh.last.m === S.m - 1) h += '<div class="meta">Ergebnis im Vormonat: ' + signed(sh.last.rev - sh.last.cost) + " Mark (Umsatz " + E.fmt(sh.last.rev) + ")</div>";
      if (sh.last && sh.last.m === S.m - 1 && sh.last.coal != null) h += '<div class="meta">Kohle im Vormonat: ' + E.fmt(sh.last.coal) + " Mark, " + Math.round(sh.last.coal / Math.max(1, sh.last.cost) * 100) + " % der Kosten" + (sh.last.cater ? " · Verpflegung " + E.fmt(sh.last.cater) + " Mark" : "") + "</div>";
      h += capBox(sh) + '<label class="field" for="l' + sh.id + '">Linie</label>' + lineSelect(sh) + planBox(sh) + shipFahrtBox(sh) + shipBunkBox(sh);
      h += '<label class="field">Wartung</label><div class="seg maint" role="group">' + E.MAINT.map((mm, i) => '<button data-act="maint" data-id="' + sh.id + '" data-v="' + i + '" aria-pressed="' + (sh.maint === i) + '">' + mm.name + "<small>" + M(E.maintCost(S, sh, i)) + "/Monat</small></button>").join("") + "</div>" + (E.ageY(sh) >= 10 ? '<div class="meta">Mit ' + Math.floor(E.ageY(sh)) + " Jahren ist das Schiff schwerer instand zu halten: Wartung wirkt schwächer und kostet mehr.</div>" : "");
      h += '<label class="field">Sicherheit</label><div>';
      for (const k of Object.keys(E.EQUIP)) {
        const q = E.EQUIP[k], has = sh.eq && sh.eq[k], avail = E.yearOf(S) >= q.from;
        h += '<div class="eqrow"><span>' + q.name + '<br><span class="meta">' + q.note + "</span></span>" + (has ? '<span class="done">✓ an Bord</span>' : avail ? '<button class="btn" data-act="equip" data-id="' + sh.id + '" data-k="' + k + '">Einbauen (' + M(E.equipCost(S, sh, k)) + ")</button>" : '<span class="meta">ab ' + q.from + "</span>") + "</div>";
      }
      h += "</div>";
      h += '<div class="switch"><span>Versichert' + (loan ? ' <span class="meta">(Pflicht wegen Kredit)</span>' : "") + '</span><input type="checkbox" data-act="ins" data-id="' + sh.id + '" ' + (sh.insured ? "checked" : "") + (loan ? " disabled" : "") + ' aria-label="Versichert"></div>';
      if (loan) h += '<div class="meta">Kredit: noch ' + M(loan.out) + " offen</div>";
      const di = E.dockInfo(S, sh), sellVal = Math.round(val * .9);
      h += '<div class="actions"><button class="btn" data-act="dock" data-id="' + sh.id + '" ' + (E.inDock(S, sh) ? "disabled" : "") + ">Docken (" + di.days + " Tage, " + M(di.cost) + ")</button>" +
        '<button class="btn warn" data-act="sell" data-id="' + sh.id + '">' + (confirmSell === sh.id ? "Wirklich für " + M(sellVal) + " verkaufen?" : "Verkaufen") + "</button>" +
        '<button class="btn" data-act="retireOpen" data-id="' + sh.id + '">Außer Dienst stellen</button></div></div>';
    return h;
  }
  function flotte() {
    const ms = S.ships.filter(x => x.museum).length;
    let h = '<div class="subnav" role="tablist"><button data-act="flSub" data-v="schiffe" aria-selected="' + (flSub === "schiffe") + '">Schiffe</button><button data-act="flSub" data-v="museum" aria-selected="' + (flSub === "museum") + '">Museum' + (ms ? " (" + ms + ")" : "") + "</button></div>";
    if (flSub === "museum") return h + museumView();
    const ships = S.ships.filter(x => !x.museum);
    h += '<h2>Flotte</h2><p class="sub">' + (ships.length ? ships.length + " Schiff" + (ships.length > 1 ? "e" : "") + " · " : "") + (DESK ? "Klicken" : "Tippen") + " Sie auf ein Schiff, um es aufzuklappen.</p>";
    if (!ships.length) return h + '<div class="hint">Noch keine Schiffe. Die Werft wartet auf Ihren Auftrag.</div>';
    h += fahrtBox();
    h += '<div class="actions" style="margin-bottom:8px"><button class="btn" data-act="shipsAll" data-v="1">Alle aufklappen</button><button class="btn" data-act="shipsAll" data-v="0">Alle zuklappen</button></div>';
    const groups = [["bau", "Im Bau", ships.filter(x => x.ready > S.m)]].concat([0, 1, 2].map(g => ["g" + g, GROUP_NAME[g], ships.filter(x => x.ready <= S.m && E.typeGroup(x.type) === g)]));
    for (const [id, title, list] of groups) {
      if (!list.length) continue;
      if (openSec["fl" + id] === undefined) openSec["fl" + id] = true;
      let b = "";
      for (const sh of list) {
        const [st, cls] = shipStatus(sh), t = E.TYPES[sh.type];
        const vs = sh.ready <= S.m && !E.inDock(S, sh) ? voyShort(sh) : null;
        b += '<details class="shipd" data-ship="' + sh.id + '"' + (openShip.has(sh.id) ? " open" : "") + '><summary>' + img("ship_" + sh.type, "mini", t.name, sh) + '<span class="sn"><b>„' + esc(sh.name) + '“</b><span class="meta">' + t.name + (sh.ready <= S.m ? " · " + Math.round(sh.cond) + " %" : "") + (vs ? " · " + esc(vs) : "") + '</span>' + shipTags(sh) + '</span><span class="st ' + cls + '">' + esc(st) + "</span></summary>" + shipCard(sh) + "</details>";
      }
      h += sec("fl" + id, title, list.length, b);
    }
    return h;
  }

  /* ---------- Werft ---------- */
  const openSec = {};
  const sec = (id, title, count, body) => '<details class="sec" data-sec="' + id + '"' + (openSec[id] ? " open" : "") + '><summary><span>' + title + '</span><span class="cnt">' + count + "</span></summary>" + (DESK ? '<div class="secbody">' + body + "</div>" : body) + "</details>";
  function reportBox(L) {
    const ri = E.reportInfo(S, L);
    let h = '<div class="report"><b>Gutachten</b><div>Zustand: ' + Math.round(L.cond) + " %</div>";
    h += "<div>Frist: " + (ri.left < 0 ? '<span class="neg">abgelaufen</span> – vor dem ersten Einsatz erneuern (' + M(ri.fcost) + ")" : ri.left < 60 ? "läuft in " + ri.left + " Tagen ab – Erneuerung " + M(ri.fcost) : "gültig bis " + E.dateAfter(S, ri.left)) + "</div>";
    h += ri.dmg.length ? "<div>Schäden:</div><ul>" + ri.dmg.map(d => "<li>" + esc(d.name) + " – " + M(d.cost) + "</li>").join("") + "</ul>" : "<div>Keine nennenswerten Schäden.</div>";
    h += '<div class="sum">Reparaturen insgesamt: etwa ' + M(ri.total) + "</div></div>";
    return h;
  }
  function werft() {
    const open = E.TYPE_ORDER.filter(k => E.typeOpen(S, k)), later = E.TYPE_ORDER.filter(k => !E.typeOpen(S, k));
    let h = '<h2>Werft</h2><p class="sub">Neubauten brauchen Zeit. Kredite laufen erst ab der Ablieferung. ' + (DESK ? "Klicken" : "Tippen") + ' Sie auf eine Kategorie, um sie aufzuklappen.</p>';
    if (S.discount && S.discount.until >= S.m) h += '<div class="sale">Sonderkonditionen: 10 % Rabatt auf Neubauten bis ' + E.dateStr(S.discount.until) + ".</div>";
    for (const g of [0, 1, 2]) {
      const ks0 = open.filter(k => E.typeGroup(k) === g), yr0 = E.yearOf(S), ks = ks0.filter(k => E.TYPES[k].from >= yr0 - 35 || E.TYPES[k].special), olds = ks0.filter(k => !ks.includes(k)); if (!ks0.length) continue;
      let b = "";
      for (const k of ks) {
        const t = E.TYPES[k];
        b += '<div class="item"><figure class="plate" style="margin-left:0;margin-right:0">' + img("ship_" + k, "", t.name + ", " + t.cls) + '</figure><div class="row"><h3>' + t.name + '</h3><span class="num">' + M(E.newPrice(S, k)) + '</span></div><div class="meta">' + t.cls + " · " + seatsText(t) + " · " +
          kn(t.speed) + " Knoten · Komfort " + "★".repeat(t.comfort) + " · Bauzeit " + t.build + " Monate</div><p style=\"margin-top:6px\">" + E.TYPE_NOTE[k] + '</p><div class="meta">' + typeSpecs(t) + " · Heuer " + M(t.crew * (S.wage || 1)) + ' im Monat</div><div class="actions"><button class="btn solid" data-act="buyNew" data-type="' + k + '">Bestellen</button></div></div>';
      }
      if (olds.length) b += '<details class="olds"><summary>Ältere Bauarten (' + olds.length + ")</summary>" + olds.map(k => { const t = E.TYPES[k]; return '<div class="eqrow">' + img("ship_" + k, "mini", t.name) + '<span style="flex:1">' + t.name + '<br><span class="meta">' + t.cls + " · seit " + t.from + " · " + kn(t.speed) + " Knoten · " + E.fmt(t.seats) + " Plätze</span></span><button class=\"btn\" data-act=\"buyNew\" data-type=\"" + k + "\">" + M(E.newPrice(S, k)) + "</button></div>"; }).join("") + "</details>";
      if (g === 0) b = designList() + b;
      h += sec("g" + g, GROUP_NAME[g], ks0.length, b);
    }
    const bks = open.filter(k => !E.TYPES[k].trajekt);
    h += sec("brandt", "Werft Brandt & Söhne", bks.length, img("ev_brandtwerft", "banner", "Werft der Konkurrenz") + '<div class="item rival">' + img("riv_brandt", "rivimg", "Brandt") + '<div class="rtxt"><p style="margin:0">Der Rivale Brandt baut auch für andere Reedereien – in seiner eigenen Bauart: <b>0,7 Knoten schneller</b> und einen Monat früher fertig, dafür 12 % teurer. Jeder Auftrag macht Brandt & Söhne stärker.</p></div></div>' +
      bks.map(k => { const t = E.TYPES[k]; return '<div class="eqrow">' + img("ship_" + k, "mini", t.name) + '<span style="flex:1">' + t.name + '<br><span class="meta">' + kn(t.speed + .7) + " Knoten · Bauzeit " + Math.max(2, t.build - 1) + ' Monate</span></span><button class="btn" data-act="buyBrandt" data-type="' + k + '">' + M(E.brandtPrice(S, k)) + "</button></div>"; }).join(""));
    if (later.length) h += sec("later", "Bald auf der Werft", later.length, '<p class="sub">Neue Technik, die in den kommenden Jahren bestellbar wird.</p>' + later.map(k => { const t = E.TYPES[k]; return '<div class="item compact locked">' + img("ship_" + k, "", t.name) + "<div><h3>" + t.name + '<span class="tag">ab ' + t.from + '</span></h3><div class="meta">' + E.TYPE_NOTE[k] + "</div></div></div>"; }).join(""));
    let sp = '<p class="sub">Berühmte Schiffe kann man nicht bestellen. Sie tauchen nur ganz selten als Angebot eines Maklers auf – manche nie.</p>';
    for (const k of E.SPECIAL_ORDER) {
      const t = E.TYPES[k], own = S.ships.some(x => x.type === k), seen = (S.flags && S.flags["sp_" + k]) || 0;
      sp += '<div class="item' + (own ? "" : " special-locked") + '"><figure class="plate" style="margin-left:0;margin-right:0">' + img("ship_" + k, "", t.ship) + '</figure><div class="row"><h3>„' + t.ship + "“</h3>" + (own ? '<span class="tag gold">In Ihrer Flotte</span>' : "") + '</div><div class="meta">' + t.name + " · " + seatsText(t) + " · " + kn(t.speed) + " Knoten · Komfort " + "★".repeat(t.comfort) + '</div><div class="trait">' + esc(t.trait) + '</div><div class="meta">' +
        (own ? "" : (k === "american" ? "Kann ab " + t.from + " auftauchen." : "Frühestens ab " + t.from + ".") + (seen && seen < 99 ? " Wurde Ihnen schon " + (seen === 1 ? "einmal" : "zweimal") + " angeboten." : "")) + "</div>" + storyBox(k) + "</div>";
    }
    { const tr = E.TYPES.traum, own = S.ships.some(x => x.type === "traum");
      sp += own ? '<div class="item"><figure class="plate" style="margin-left:0;margin-right:0">' + img("ship_traum", "", tr.ship) + '</figure><div class="row"><h3>„' + tr.ship + '“</h3><span class="tag gold">In Ihrer Flotte</span></div><div class="trait">' + esc(tr.trait) + "</div>" + storyBox("traum") + "</div>"
        : '<div class="item special-locked"><h3>Ein Gerücht im Hafen …</h3><p class="meta">Die Alten am Kai erzählen: Wer alle berühmten Schiffe zugleich besitzt, dem geschieht eines Morgens ein Wunder.</p></div>'; }
    h += sec("special", "Sonderschiffe", S.ships.filter(x => E.TYPES[x.type].special).length + "/" + E.SPECIAL_ORDER.length, sp);
    let mk = '<p class="sub">Sofort verfügbar. Der Zustand ist nur geschätzt – ein Gutachten zeigt Frist, Schäden und Reparaturkosten.</p>';
    if (!S.market.length) mk += '<div class="hint">Gerade keine Angebote. Schauen Sie nächsten Monat wieder vorbei.</div>';
    for (const L of S.market) {
      const t = E.TYPES[L.type], built = E.cal(S.m).y - Math.floor(L.age / 12);
      mk += '<div class="item">' + img("ship_" + L.type, "shipimg", t.name) + '<div class="row"><h3>„' + esc(L.name) + '“</h3><span class="num">' + M(L.price) + '</span></div><div class="meta">' + t.name + " (" + t.cls + ") · Baujahr " + built + " · " + typeSpecs(t) + "</div>" +
        (L.surveyed ? reportBox(L) : '<div class="row" style="margin-top:6px"><span>Zustand etwa ' + Math.round(L.est) + " % (geschätzt)</span></div>" + condBar(L.est)) +
        '<div class="actions">' + (L.surveyed ? "" : '<button class="btn" data-act="survey" data-id="' + L.id + '">Gutachten (' + M(Math.round(L.price * .008)) + ")</button>") +
        '<button class="btn solid" data-act="buyUsed" data-id="' + L.id + '">Kaufen</button></div></div>';
    }
    h += sec("market", "Gebrauchtmarkt", S.market.length, mk);
    return h;
  }


  /* ---------- Werbung ---------- */
  const AG_IMG = { ausw: "mk_agentur", bahn: "line_faehre", reise: "mk_reise" };
  function werbung() {
    const mk = S.mk, y = E.yearOf(S), w = S.wage || 1;
    let h = img("mk_reklame", "banner", "Reklame am Hafen") + '<h2>Werbung</h2><p class="sub">Wer bekannt ist, wird gebucht. Bekanntheit steigt mit Werbung und guten Nachrichten – und sinkt, wenn Sie nichts tun oder ein Unglück passiert.</p>';
    h += '<div class="row"><span>Bekanntheit</span><b class="num">' + Math.round(mk.brand) + " / 100</b></div><div class=\"meter\"><i style=\"width:" + Math.round(mk.brand) + '%"></i></div><div class="meta">Ab etwa 30 bringt Bekanntheit spürbar mehr Fahrgäste auf allen Linien.</div>';
    h += '<h3 style="margin-top:18px">Laufende Werbung</h3><div class="seg" role="group" style="grid-template-columns:repeat(4,1fr)">' + E.MK_BUDGET.map((b, i) => '<button data-act="budget" data-v="' + i + '" aria-pressed="' + (mk.budget === i) + '" style="font-size:13.5px">' + b.name + "</button>").join("") + "</div>";
    h += '<div class="meta" style="margin-top:6px">' + (mk.budget ? "Kostet " + M(E.MK_BUDGET[mk.budget].cost * w) + " im Monat." : "Ohne Werbung sinkt die Bekanntheit langsam.") + "</div>";
    h += '<h3 style="margin-top:18px">Agenturen und Partner</h3>';
    for (const k of Object.keys(E.MK_AGENCY)) {
      const a = E.MK_AGENCY[k], avail = y >= a.from;
      h += '<div class="eqrow">' + img(AG_IMG[k], "mini", "") + '<span style="flex:1">' + a.name + '<br><span class="meta">' + a.note + " " + (avail ? M(a.cost * w) + " im Monat." : "Ab " + a.from + ".") + '</span></span>' + (avail ? '<input type="checkbox" style="width:26px;height:26px;accent-color:#13294B" data-act="agency" data-k="' + k + '" ' + (mk.ag[k] ? "checked" : "") + ' aria-label="' + a.name + '">' : "") + "</div>";
    }
    h += '<h3 style="margin-top:18px">Werbung für einzelne Linien</h3><p class="sub" style="margin-bottom:4px">Anzeigen und Plakate für genau eine Linie: mehr Nachfrage und mehr Marktanteil. Läuft dauerhaft, bis Sie sie beenden.</p>';
    if (!S.routes.length) h += '<div class="hint">Noch keine Linie.</div>';
    for (const r of S.routes) {
      const i = E.rInfo(S, r); if (!i) continue;
      h += '<div class="eqrow"><span>' + esc(i.name) + '<br><span class="meta">' + (r.adOn ? "läuft – etwa " : "etwa ") + M(E.campaignCost(S, r)) + " im Monat</span></span>" + '<button class="btn' + (r.adOn ? " warn" : "") + '" data-act="campaign" data-id="' + r.id + '">' + (r.adOn ? "Beenden" : "Starten") + "</button></div>";
    }
    h += '<h3 style="margin-top:18px">Einmalige Aktionen</h3>';
    h += '<div class="eqrow"><span>Presse an Bord einladen<br><span class="meta">Bekanntheit +6, einmal im Monat.</span></span><button class="btn" data-act="press">' + M(Math.round(3000 * S.pidx)) + "</button></div>";
    h += '<div class="eqrow">' + img("mk_hallen", "mini", "") + '<span style="flex:1">Auswandererhallen am Hafen<br><span class="meta">Mehr Auswanderer wählen Ihre Schiffe, Ruf und Prestige steigen.</span></span>' + (mk.hallen ? '<span class="done">✓ gebaut</span>' : y >= 1885 ? '<button class="btn" data-act="hallen">' + M(Math.round(60000 * S.pidx)) + "</button>" : '<span class="meta">ab 1885</span>') + "</div>";
    return h;
  }

  /* ---------- Kohle und Küche ---------- */
  let coalYears = 3, coalShare = .5;
  const KQ_NAME = ["einfach", "ordentlich", "fein"];
  const pctSign = x => { const r = Math.round(x * 100); return (r > 0 ? "+" : r < 0 ? "−" : "±") + Math.abs(r) + " %"; };
  const plusM = v => (v > 0 ? "+" : "") + E.fmt(v) + " M";
  const coalArrow = () => { const t = E.coalTrend(S); return t > 0 ? '<span class="cup" title="steigt">▲</span>' : t < 0 ? '<span class="cdown" title="fällt">▼</span>' : '<span class="cflat" title="unverändert">◆</span>'; };
  const fsNote = k => { const f = E.FAHRT[k].f; return k === "normal" ? "wie gewohnt" : "Tempo " + pctSign(f - 1) + " · Kohle " + pctSign(f * f - 1); };
  const kqNote = q => q === 1 ? "wie gewohnt" : "Kosten " + pctSign(E.KQ[q].cost - 1);
  function spark(H, W, Ht) {
    if (!H || H.length < 2) return "";
    const v = H.map(x => x.c), mn = Math.min(.9, ...v), mx = Math.max(1.1, ...v), xs = i => 2 + i * (W - 4) / (v.length - 1), ys = c => Ht - 2 - (c - mn) / (mx - mn) * (Ht - 4);
    return '<svg class="spark" viewBox="0 0 ' + W + " " + Ht + '" preserveAspectRatio="none" aria-hidden="true"><line x1="2" x2="' + (W - 2) + '" y1="' + ys(1).toFixed(1) + '" y2="' + ys(1).toFixed(1) + '" stroke="var(--rule)" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/><path d="' + v.map((c, i) => (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(c).toFixed(1)).join(" ") + '" fill="none" stroke="var(--brass-2)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';
  }
  function coalBar() {
    const H = (S.coalHist || []).slice(-24).concat([{ m: S.m, c: S.coal }]), n = E.coalActive(S).length;
    return '<button class="coalbar" data-act="coalGo"><span class="cl">Kohlepreis</span><b>' + E.coalIdx(S) + " % " + coalArrow() + "</b>" + spark(H, 120, 30) + '<span class="cr">' + (n ? n + (n > 1 ? " Lieferverträge" : " Liefervertrag") : "Einkauf") + " ›</span></button>";
  }
  function coalChart(H) {
    const W = 340, Ht = 150, v = H.map(x => x.c * 100), mn = Math.min(70, Math.floor(Math.min(...v) / 10) * 10), mx = Math.max(130, Math.ceil(Math.max(...v) / 10) * 10);
    const xs = i => 42 + i * (W - 50) / Math.max(1, H.length - 1), ys = c => 8 + (mx - c) / (mx - mn) * (Ht - 30);
    let o = '<svg class="chart coalchart" viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Verlauf des Kohlepreises">';
    for (const g of [mn, 100, mx]) o += '<line x1="42" x2="' + (W - 8) + '" y1="' + ys(g).toFixed(1) + '" y2="' + ys(g).toFixed(1) + '" stroke="var(--rule)"' + (g === 100 ? ' stroke-dasharray="4 3"' : "") + '/><text x="38" y="' + (ys(g) + 4).toFixed(1) + '" font-size="10" fill="var(--muted)" text-anchor="end">' + g + " %</text>";
    let lastY = -9;
    H.forEach((x, i) => { const c = E.cal(x.m); if (c.mo === 0 && c.y - lastY >= (H.length > 60 ? 2 : 1)) { lastY = c.y; o += '<line x1="' + xs(i).toFixed(1) + '" x2="' + xs(i).toFixed(1) + '" y1="' + (Ht - 22) + '" y2="' + (Ht - 18) + '" stroke="var(--muted)"/><text x="' + xs(i).toFixed(1) + '" y="' + (Ht - 6) + '" font-size="10" fill="var(--muted)" text-anchor="middle">' + c.y + "</text>"; } });
    o += '<path d="' + v.map((c, i) => (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(c).toFixed(1)).join(" ") + '" fill="none" stroke="var(--ink)" stroke-width="2"/>';
    return o + "</svg>";
  }
  function kohleStat() {
    const H = (S.coalHist || []).slice(-120), v = H.map(x => x.c);
    let h = '<h3 style="margin-top:12px">Kohlepreis</h3><p class="sub">In Prozent des Normalpreises, jeden Monat aufgezeichnet – bis zu zehn Jahre zurück.</p>';
    h += '<div class="kv"><div><b>' + E.coalIdx(S) + " % " + coalArrow() + '</b><span>heute</span></div>' + (v.length ? '<div><b>' + Math.round(v.slice(-12).reduce((a, b) => a + b, 0) / v.slice(-12).length * 100) + ' %</b><span>Schnitt der letzten 12 Monate</span></div><div><b>' + Math.round(Math.min(...v) * 100) + ' %</b><span>am billigsten</span></div><div><b>' + Math.round(Math.max(...v) * 100) + " %</b><span>am teuersten</span></div>" : "") + "</div>";
    h += H.length < 2 ? '<div class="hint">Der Verlauf wird jeden Monat aufgezeichnet. Nach zwei Monatsabschlüssen erscheint hier das Diagramm.</div>' : coalChart(H);
    const years = Object.keys(S.years || {}).sort().reverse().slice(0, 10), coalCost = Y => Object.keys(Y.costs || {}).filter(k => k === "Kohle" || k === "Kohle-Mindestabnahme" || k.startsWith("Bekohlung")).reduce((a, k) => a + Y.costs[k], 0);
    if (years.length) h += '<h3 style="margin-top:16px">Kohle je Jahr</h3><div class="tblwrap"><table class="stat"><thead><tr><th>Jahr</th><th class="n">gekauft</th><th class="n">bezahlt</th><th class="n">verbraucht</th><th class="n">Anteil an den Kosten</th></tr></thead><tbody>' +
      years.map(y => { const Y = S.years[y], C = Y.coal, k = coalCost(Y); return "<tr><td>" + y + '</td><td class="n">' + (C ? E.fmt(C.bt) + " t" : "–") + '</td><td class="n">' + E.fmt(k) + '</td><td class="n">' + (C ? E.fmt(C.ut) + " t" : "–") + '</td><td class="n">' + (Y.cost ? Math.round(k / Y.cost * 100) + " %" : "–") + "</td></tr>"; }).join("") + "</tbody></table></div>";
    const Yn = S.years && S.years[E.cal(S.m).y], bk = Yn && Yn.costs ? Object.keys(Yn.costs).filter(k => k.startsWith("Bekohlung ")).sort((a, b) => Yn.costs[b] - Yn.costs[a]) : [];
    if (bk.length) h += '<h3 style="margin-top:16px">Bekohlung nach Häfen (' + E.cal(S.m).y + ')</h3><div class="tblwrap"><table class="stat"><tbody>' + bk.map(k => "<tr><td>" + esc(k.slice(10)) + '</td><td class="n">' + E.fmt(Yn.costs[k]) + " Mark</td></tr>").join("") + "</tbody></table></div>";
    return h + '<div class="meta" style="margin-top:8px">Gekauft wird beim Bekohlen, verbraucht auf See – was dazwischen im Bunker liegt, zählt zum Eigenkapital. Pro Schiff und pro Linie steht die Kohle in den Reitern Schiffe und Linien – jede Spalte lässt sich sortieren.</div>';
  }
  function shipTags(sh) {
    let t = "";
    if (sh.fahrt) t += '<span class="tag">' + E.FAHRT[sh.fahrt].name + "</span>";
    if (sh.kq) t += '<span class="tag">eigene Verpflegung</span>';
    return t ? '<span class="tags">' + t + "</span>" : "";
  }
  function fahrtBox() {
    const cur = S.fahrt || "normal", st = E.staff(S), ex = S.ships.filter(x => !x.museum && x.fahrt).length;
    let h = '<div class="item fahrt">' + (cur !== "normal" ? img(cur === "spar" ? "fs_sparfahrt" : "fs_volldampf", "banner", E.FAHRT[cur].name) : "") + '<div class="row"><h3>Reederei-Fahrstufe</h3><span class="meta">Kohlepreis ' + E.coalIdx(S) + " % " + coalArrow() + "</span></div>";
    h += '<div class="seg lv" role="group" aria-label="Reederei-Fahrstufe">' + E.FAHRT_ORDER.map(k => '<button data-act="fahrtSet" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + E.FAHRT[k].name + "<small>" + fsNote(k) + "</small></button>").join("") + "</div>";
    h += '<div class="meta" style="margin-top:6px">Gilt für alle Schiffe ohne eigene Fahrstufe' + (ex ? "; " + ex + (ex > 1 ? " Ausnahmen sind" : " Ausnahme ist") + " in der Liste markiert" : "") + ". Sparfahrt spart Kohle, kostet aber Fahrten, Zeit und Einnahmen. Volldampf schafft mehr Fahrten, braucht mehr Kohle und nutzt die Schiffe schneller ab.</div>";
    if (st.mi >= 0) h += '<div class="meta">' + (st.miAuto ? "Ihr Maschineninspektor stellt um: Sparfahrt ab " + st.miSpar + " %, Volldampf unter " + st.miVoll + " % Kohlepreis." + (st.miPlan ? " Geplant: " + E.FAHRT[st.miPlan.stage].name + " ab " + E.dateStr(st.miPlan.at) + "." : "") : "Die Regel des Maschineninspektors ist ausgeschaltet.") + "</div>";
    return h + "</div>";
  }
  function shipFahrtBox(sh) {
    const own = sh.fahrt || "", eff = E.fahrtOf(S, sh), t = E.TYPES[sh.type];
    let h = '<label class="field">Fahrstufe</label><div class="seg" role="group" style="grid-template-columns:repeat(4,1fr)">' + [["", "Reederei"]].concat(E.FAHRT_ORDER.map(k => [k, E.FAHRT[k].name])).map(([k, n]) => '<button data-act="shipFahrt" data-id="' + sh.id + '" data-v="' + k + '" aria-pressed="' + (own === k) + '" style="font-size:13.5px">' + n + "</button>").join("") + "</div>";
    h += '<div class="meta">' + (own ? "Eigene Fahrstufe – die Reederei-Fahrstufe gilt für dieses Schiff nicht." : "Folgt der Reederei-Fahrstufe: " + E.FAHRT[eff].name + ".") + "</div>";
    const need = E.postNeed(S, sh);
    if (need && E.postSlow(S, sh, eff)) h += '<div class="hint bad">Zu langsam für den Postvertrag: Mit ' + E.FAHRT[eff].name + " schafft das Schiff die verlangten " + kn(need) + " Knoten nicht.</div>";
    const cls = [0, 1, 2].filter(c => t.sb[c] > 0);
    if (!cls.length) return h;
    const info = E.infoOf(S, sh), meal = !info || info.cruise || info.dist >= 40;
    h += '<details class="story"><summary>Verpflegung an Bord' + (sh.kq ? " · eigene Einstellung" : "") + "</summary>";
    if (!meal) h += '<div class="meta">Auf dieser kurzen Strecke gibt es keine Mahlzeiten an Bord.</div>';
    for (const c of cls) {
      const v = sh.kq && sh.kq[c] != null ? sh.kq[c] : -1;
      h += '<div class="kqrow"><span>' + E.clsName(c, t.ocean) + '</span><div class="seg" role="group" style="grid-template-columns:repeat(4,1fr)">' + [-1, 0, 1, 2].map(q => '<button data-act="shipKq" data-id="' + sh.id + '" data-c="' + c + '" data-v="' + q + '" aria-pressed="' + (v === q) + '" style="font-size:13px">' + (q < 0 ? "Reederei" : KQ_NAME[q]) + "</button>").join("") + "</div></div>";
    }
    return h + '<div class="meta">„Reederei“ übernimmt die Verpflegung aus Kontor → Einkauf.</div></details>';
  }
  function ruleSeg(k, cur, vals) { return '<div class="seg" role="group" style="grid-template-columns:repeat(' + vals.length + ',1fr)">' + vals.map(v => '<button data-act="staff" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (cur === v) + '">' + v + " %</button>").join("") + "</div>"; }
  function staffCard(k, im, title, pay, text, fx, extra) {
    const st = E.staff(S), lv = st[k], w = S.wage || 1;
    return '<div class="item">' + img(im, "banner", title) + '<div class="row"><h3>' + title + '</h3><span class="num">' + (lv >= 0 ? M(pay * E.STAFF_PAY[lv] * w) + " / Monat" : "nicht angestellt") + "</span></div><p>" + text + "</p>" +
      '<div class="seg lv lv5" role="group" aria-label="' + title + '">' + [-1, 0, 1, 2, 3].map(i => '<button data-act="staff" data-k="' + k + '" data-v="' + i + '" aria-pressed="' + (lv === i) + '">' + (i < 0 ? "keiner" : E.STAFF_LV[i]) + "<small>" + (i < 0 ? "–" : M(pay * E.STAFF_PAY[i] * w)) + "</small></button>").join("") + "</div>" +
      (lv >= 0 ? '<div class="meta" style="margin-top:6px">Wirkung: ' + fx[lv] + ".</div>" + extra() : "") + "</div>";
  }
  function einkauf() {
    const st = E.staff(S), K = E.kueche(S), y = E.yearOf(S);
    let h = img("ev_kohlevertrag", "banner", "Kohlenhändler im Kontor") + '<h2>Einkauf</h2><p class="sub">Kohle und Verpflegung für die ganze Reederei. Einzelne Schiffe stellen Sie in der Flotte anders ein.</p>';
    // Kohle (seit v5.0 in Tonnen, bezahlt beim Bekohlen, Verträge je Hafen)
    const ports = E.coalPorts(S), use = (S.coalUse || []).slice(-3), useT = use.length ? use.reduce((a, b) => a + b, 0) / use.length : 0;
    if (!coalPort || !ports.includes(coalPort)) coalPort = ports.slice().sort((a, b) => E.coalBase(S, b) - E.coalBase(S, a))[0];
    h += '<h3>Kohle</h3><div class="kv" data-tut="coal"><div><b>' + E.coalIdx(S) + " % " + coalArrow() + '</b><span>Kohlepreis</span></div><div><b>' + E.fmt(Math.round(useT)) + ' t</b><span>Verbrauch im Monat</span></div><div><b>' + M(E.bunkerValue(S)) + "</b><span>Kohle in den Bunkern</span></div></div>" + spark((S.coalHist || []).slice(-36).concat([{ m: S.m, c: S.coal }]), 340, 44);
    h += '<div class="meta">Bezahlt wird beim Bekohlen: Tonnen mal Hafenpreis mal Kohlepreis. Nah an den Zechen ist die Kohle billig, an Kohlestationen mittel, in der Ferne teuer. Der Kohlepreis schwankt jeden Monat um bis zu 3 %; Streiks und neue Zechen bewegen ihn stärker.</div>';
    h += bunkBox();
    const tierOf = p => E.TIER_NAME[E.portTier(p)];
    h += '<div class="tblwrap"><table class="stat"><thead><tr><th>Hafen</th><th>Lage</th><th class="n">Preis je Tonne</th><th class="n">Bekohlt im Monat</th></tr></thead><tbody>' +
      ports.map(p => "<tr><td>" + pName(p) + (p === (S.home || "ham") ? " ★" : "") + "</td><td>" + tierOf(p) + '</td><td class="n">' + eur(E.coalPortPrice(S, p)) + ' M</td><td class="n">' + E.fmt(Math.round(E.coalBase(S, p))) + " t</td></tr>").join("") + "</tbody></table></div>";
    for (const k of S.coalK || []) {
      h += '<div class="item"><div class="row"><h3>Liefervertrag in ' + pName(k.port || S.home) + '</h3></div><div class="meta">' + E.fmt(k.qty) + " t im Monat zu " + eur(k.pt || 0) + " M je Tonne · " + (k.years === 1 ? "1 Jahr" : k.years + " Jahre") + " · fest " + M(k.qty * (k.pt || 0)) + " im Monat · bis " + E.dateStr(k.until) + "</div>" +
        (k.stop >= S.m ? '<div class="hint bad">Lieferausfall bis ' + E.dateStr(k.stop) + " – bis dahin bunkern Ihre Schiffe zum Marktpreis.</div>" : "") +
        '<div class="actions"><button class="btn warn" data-act="coalCancel" data-id="' + k.id + '">Kündigen (' + M(E.coalCancelFee(S, k)) + ")</button></div></div>";
    }
    const o = E.coalOffer(S, coalYears, coalShare, coalPort);
    h += '<div class="item" data-tut="coalnew"><h3>Neuer Liefervertrag</h3><label class="field" for="coalport">Hafen</label><select id="coalport" data-act="coalPort">' + ports.map(p => '<option value="' + p + '"' + (p === coalPort ? " selected" : "") + ">" + pName(p) + " – " + E.fmt(Math.round(E.coalBase(S, p))) + " t im Monat</option>").join("") + "</select>" +
      '<label class="field">Laufzeit</label><div class="seg lv" role="group">' + [1, 3, 5].map(n => '<button data-act="coalY" data-v="' + n + '" aria-pressed="' + (coalYears === n) + '">' + (n === 1 ? "1 Jahr" : n + " Jahre") + "<small>Aufschlag " + pctSign(E.coalOffer(S, n, coalShare, coalPort).surch) + "</small></button>").join("") + "</div>" +
      '<label class="field">Menge</label><div class="seg" role="group" style="grid-template-columns:repeat(2,1fr)">' + [.5, 1].map(v => '<button data-act="coalS" data-v="' + v + '" aria-pressed="' + (coalShare === v) + '">' + Math.round(v * 100) + " % der Kohle aus diesem Hafen</button>").join("") + "</div>";
    if (o.qty >= 10) h += '<table class="fin" style="width:100%;margin-top:10px"><tr><td>Menge</td><td>' + E.fmt(o.qty) + " t im Monat</td></tr><tr><td>Preis</td><td>" + eur(o.pt) + " M je Tonne (" + Math.round(o.price * 100) + " % des Normalpreises, heute " + E.coalIdx(S) + " %)</td></tr><tr><td>Fest im Monat</td><td>" + M(o.monthly) + "</td></tr><tr><td>" + (o.now >= 0 ? "Mehrkosten zum heutigen Preis" : "Ersparnis zum heutigen Preis") + "</td><td>" + M(Math.abs(o.now)) + " im Monat</td></tr><tr><td>Lohnt sich ab</td><td>Kohlepreis über " + Math.round(o.price * 100) + " %</td></tr></table>";
    h += '<div class="meta">Der Vertrag gilt nur für diesen Hafen. Mindestabnahme 80 % der vereinbarten Menge, Mehrbedarf zum Marktpreis. Höchstens zwei Verträge, je Hafen zusammen höchstens 100 %. Eine Kündigung kostet ein Viertel der Restsumme.' + (st.ke >= 0 ? " Ihr Kohleneinkäufer drückt den Aufschlag." : "") + "</div>" +
      (o.ok ? '<div class="actions"><button class="btn solid" data-act="coalSign">Vertrag schließen</button></div>' : '<div class="hint">' + esc(o.why) + "</div>") + "</div>";
    // Verpflegung
    const ku = S.exp && S.exp.ku != null ? S.exp.ku : 50, cat = E.catOn(S, K.cat) ? K.cat : null, lux = E.catOn(S, K.lux) ? K.lux : null;
    h += '<h3 style="margin-top:20px" data-tut="kq">Verpflegung</h3>' + img("kue_fein", "banner", "Speisesaal der 1. Klasse") +
      '<div class="row"><span>Erfahrung „Küche“</span><b class="num">' + Math.round(ku) + ' / 100</b></div><div class="meter"><i style="width:' + Math.round(ku) + '%"></i></div>' +
      '<div class="meta">Gutes Essen spricht sich herum: In der 1. Klasse zählt es viel, in der 2. Klasse mittel, im Zwischendeck wenig. Bei Vergnügungsreisen bringt eine gute Küche mehr Buchungen. Längere Seezeit durch Sparfahrt bedeutet mehr Mahlzeiten.</div>';
    if (K.notUntil >= S.m) h += '<div class="hint bad">Diesen Monat gibt es an Bord nur Notverpflegung („einfach“).</div>';
    for (const c of [0, 1, 2]) {
      const lim = cat ? E.CATERERS[cat.k].levels : null;
      h += '<div class="kqrow"><span><b>' + ["1. Klasse", "2. Klasse", "3. Klasse und Zwischendeck"][c] + "</b>" + (c === 0 && lux ? '<span class="meta">à la carte: ' + esc(E.catName(S, lux.k)) + "</span>" : lim && (K.q[c] < lim[0] || K.q[c] > lim[lim.length - 1]) ? '<span class="meta">Ihr Caterer liefert hier „' + KQ_NAME[Math.max(lim[0], Math.min(lim[lim.length - 1], K.q[c]))] + "“</span>" : "") + '</span><div class="seg lv" role="group">' +
        [0, 1, 2].map(q => '<button data-act="kqSet" data-c="' + c + '" data-v="' + q + '" aria-pressed="' + (K.q[c] === q) + '">' + KQ_NAME[q] + "<small>" + kqNote(q) + "</small></button>").join("") + "</div></div>";
    }
    // eigene Küche
    h += '<div class="item">' + img("kue_bordkueche", "banner", "Bordküche") + '<div class="row"><h3>Eigene Küche</h3>' + (K.eigen && st.pm >= 0 ? '<span class="tag gold">eingerichtet</span>' : "") + "</div>" +
      "<p>Ihre eigenen Köche kaufen ein und kochen: 10 % billiger. Dafür brauchen Sie einen Proviantmeister – wie gut gekocht wird und wie oft der Proviant verdirbt, hängt an seiner Lohnstufe.</p>" +
      (st.pm < 0 ? '<div class="meta">Noch kein Proviantmeister – einstellen unter Kontor → Personal.</div>' : cat ? '<div class="meta">Solange ein Caterer-Vertrag läuft, gibt es keine eigene Küche.</div>' :
        '<div class="actions"><button class="btn' + (K.eigen ? " warn" : " solid") + '" data-act="eigenSet" data-v="' + (K.eigen ? 0 : 1) + '">' + (K.eigen ? "Eigene Küche auflösen" : "Eigene Küche einrichten") + "</button></div>") + "</div>";
    // Caterer
    h += '<div class="item">' + img("kue_caterer", "banner", "Ein Caterer liefert an den Kai") + '<div class="row"><h3>Caterer</h3></div><p>Ein Caterer liefert zu einem festen Preis pro Fahrgast – ein oder drei Jahre ohne Teuerung. Beim Verlängern will er meist mehr.</p>';
    if (cat) h += '<div class="report"><b>' + esc(E.catName(S, cat.k)) + "</b><br>" + esc(E.CATERERS[cat.k].note) + "<br>Vertrag bis " + E.dateStr(cat.until) + '</div><div class="actions"><button class="btn warn" data-act="catCancel" data-v="cat">Kündigen (' + M(E.catCancelFee(S, cat)) + ")</button></div>";
    else h += E.catOffers(S).filter(x => !x.first).map(x => '<div class="eqrow"><span>' + esc(x.name) + '<br><span class="meta">' + esc(x.note) + '</span></span><span class="btns"><button class="btn" data-act="catSign" data-k="' + x.k + '" data-y="1">1 Jahr</button><button class="btn" data-act="catSign" data-k="' + x.k + '" data-y="3">3 Jahre</button></span></div>').join("");
    h += "</div>";
    // Luxus-Restaurant ab 1905
    if (y >= E.CATERERS.luxus.from || lux) {
      h += '<div class="item">' + img("kue_alacarte", "banner", "Restaurant à la carte an Bord") + '<div class="row"><h3>Restaurant à la carte</h3>' + (lux ? '<span class="tag gold">an Bord</span>' : "") + "</div><p>" + esc(E.CATERERS.luxus.note) + ". Gilt für die 1. Klasse aller Schiffe, unabhängig vom übrigen Caterer.</p>";
      h += lux ? '<div class="report"><b>' + esc(E.catName(S, lux.k)) + "</b><br>Vertrag bis " + E.dateStr(lux.until) + '</div><div class="actions"><button class="btn warn" data-act="catCancel" data-v="lux">Kündigen (' + M(E.catCancelFee(S, lux)) + ")</button></div>"
        : '<div class="eqrow"><span>' + esc(E.catName(S, "luxus")) + '</span><span class="btns"><button class="btn" data-act="catSign" data-k="luxus" data-y="1">1 Jahr</button><button class="btn" data-act="catSign" data-k="luxus" data-y="3">3 Jahre</button></span></div>';
      h += "</div>";
    }
    if (S.chef) { const sh = S.ships.find(x => x.id === S.chef.ship); h += '<div class="item compact">' + img("ev_koch", "", "Der Meisterkoch") + '<div><h3>Meisterkoch an Bord</h3><div class="meta">' + (sh ? "Er kocht in der 1. Klasse der „" + esc(sh.name) + "“. " : "") + "Heuer " + M(E.CHEF_PAY * (S.wage || 1)) + " im Monat.</div></div></div>"; }
    return h;
  }
  function previewSheet() {
    const P = sheet, p = P.p, K = E.kueche(S);
    // nur den Titel der gewählten Vorschau berechnen (v4.5–v4.6 rechnete alle und stürzte bei „ordentlich“ und „fein“ ab)
    const fahrtName = v => (E.FAHRT[v] || {}).name || "";
    const T = ({
      fahrt: () => ["Reederei-Fahrstufe: " + fahrtName(P.v), P.v === "spar" ? "fs_sparfahrt" : P.v === "voll" ? "fs_volldampf" : null],
      shipFahrt: () => { const sh = S.ships.find(x => x.id === P.id); return ["Fahrstufe der „" + (sh ? sh.name : "") + "“: " + (P.v ? fahrtName(P.v) : "wie die Reederei"), P.v === "spar" ? "fs_sparfahrt" : P.v === "voll" ? "fs_volldampf" : null]; },
      kq: () => [["1. Klasse", "2. Klasse", "3. Klasse und Zwischendeck"][P.c] + ": Verpflegung „" + KQ_NAME[P.v] + "“", P.v === 0 ? "kue_einfach" : P.v === 2 ? "kue_fein" : null],
      shipKq: () => { const sh = S.ships.find(x => x.id === P.id); return ["„" + (sh ? sh.name : "") + "“, " + E.clsName(P.c, sh && E.TYPES[sh.type].ocean) + ": " + (P.v < 0 ? "Verpflegung wie die Reederei" : "Verpflegung „" + KQ_NAME[P.v] + "“"), P.v === 0 ? "kue_einfach" : P.v === 2 ? "kue_fein" : null]; },
      eigen: () => [P.v ? "Eigene Küche einrichten" : "Eigene Küche auflösen", "kue_bordkueche"],
      cat: () => [(P.k ? E.catName(S, P.k) : "") + " – " + (P.y === 3 ? "3 Jahre" : "1 Jahr"), P.k === "luxus" ? "kue_alacarte" : "kue_caterer"],
      catCancel: () => ["Vertrag mit " + (P.name || "") + " kündigen", "kue_caterer"],
      coal: () => ["Kohle-Liefervertrag schließen", "ev_kohlevertrag"],
      coalCancel: () => ["Kohle-Liefervertrag kündigen", "ev_kohlevertrag"],
    }[P.what] || (() => ["Vorschau", null]))();
    let h = '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true">' + (T[1] ? img(T[1], "banner", "") : "") + '<div class="kicker">Vorschau</div><h3>' + esc(T[0]) + "</h3>";
    if (P.what === "coal") {
      const o = P.o;
      h += '<table class="fin" style="width:100%"><tr><td>Hafen</td><td>' + pName(o.port) + "</td></tr><tr><td>Laufzeit</td><td>" + (o.years === 1 ? "1 Jahr" : o.years + " Jahre") + "</td></tr><tr><td>Menge</td><td>" + E.fmt(o.qty) + " t im Monat (" + Math.round(o.share * 100) + " % der Kohle aus diesem Hafen)</td></tr><tr><td>Preis</td><td>" + eur(o.pt) + " M je Tonne (" + Math.round(o.price * 100) + " % des Normalpreises)</td></tr><tr><td>Fest im Monat</td><td>" + M(o.monthly) + "</td></tr><tr><td>" + (o.now >= 0 ? "Mehrkosten zum heutigen Preis" : "Ersparnis zum heutigen Preis") + "</td><td>" + M(Math.abs(o.now)) + " im Monat</td></tr><tr><td>Summe über die Laufzeit</td><td>" + M(o.total) + "</td></tr></table>" +
        '<p class="meta">Berechnet mit dem, was Ihre Schiffe in den letzten drei Monaten dort gebunkert haben. Auf die Fahrgäste wirkt ein Liefervertrag nicht. Steigt der Kohlepreis über ' + Math.round(o.price * 100) + " %, sparen Sie; fällt er, zahlen Sie drauf. Mindestabnahme 80 %.</p>";
    } else if (P.what === "coalCancel" || P.what === "catCancel") {
      h += "<p>Die Kündigung kostet " + M(P.fee) + " – ein Viertel der Restsumme.</p>";
    } else {
      const has = p && p.base && (p.base.pax > 0 || p.base.coal > 0);
      if (!has) h += "<p>In den nächsten zwei Monaten fährt noch kein Schiff. Eine Vorschau gibt es, sobald Ihre Schiffe nach Fahrplan fahren.</p>";
      else {
        const row = (n, v, good) => "<tr><td>" + n + '</td><td class="' + (v === 0 ? "" : (v > 0) === good ? "pos" : "neg") + '">' + plusM(v) + "</td></tr>";
        h += '<p class="meta">So laufen die nächsten 60 Tage mit der neuen Einstellung, ohne Zufälle gerechnet und auf einen Monat umgelegt' + (/kq|shipKq|eigen|cat/.test(P.what) ? " – auf Dauer, denn die Fahrgäste merken sich, wie an Bord gegessen wird" : "") + ".</p>";
        h += '<table class="fin prev" style="width:100%">' + row("Kohlekosten", p.coal, false) + row("Verpflegung", p.cater, false) + row("Einnahmen", p.rev, true) +
          '<tr class="sum"><td><b>' + (p.net >= 0 ? "Ersparnis im Monat" : "Mehrkosten im Monat") + '</b></td><td class="' + (p.net >= 0 ? "pos" : "neg") + '"><b>' + M(Math.abs(p.net)) + "</b></td></tr>" +
          "<tr><td>Fahrgäste</td><td>" + (p.pax > 0 ? "+" : "") + E.fmt(p.pax) + " (" + pctSign(p.paxPct) + ")</td></tr></table>";
      }
      if (p && p.post && p.post.length) h += '<div class="hint bad">' + p.post.map(n => "„" + esc(n) + "“").join(", ") + (p.post.length > 1 ? " wären" : " wäre") + " zu langsam für den Postvertrag. Dann zahlt die Post nicht, und es drohen Vertragsstrafen.</div>";
      if (p && p.lower && p.lower.length) h += '<div class="hint">' + esc(E.catName(S, P.k)) + " liefert nicht „fein“ – dort gibt es dann „ordentlich“.</div>";
      if (p && p.upper && p.upper.length) h += '<div class="hint">' + esc(E.catName(S, P.k)) + " liefert nicht „einfach“ – dort gibt es dann „ordentlich“.</div>";
      if (P.what === "cat" && E.catOn(S, K.cat) && P.k !== "luxus") h += '<div class="hint">Es läuft schon ein Caterer-Vertrag. Kündigen Sie ihn zuerst.</div>';
      if (P.what === "eigen" && P.v && E.staff(S).pm === 0) h += '<div class="meta">Ihr Proviantmeister ist knapp bezahlt: „fein“ gelingt nicht ganz, und der Proviant verdirbt öfter.</div>';
      if (P.what === "kq" && P.v === 0) h += '<div class="meta">Bei einfacher Kost erkranken häufiger Fahrgäste – dann drohen Quarantäne und Entschädigungen.</div>';
    }
    return h + '<div class="actions"><button class="btn solid" data-act="prevOk" style="flex:1">' + (/Cancel/.test(P.what) ? "Kündigen" : P.what === "coal" || P.what === "cat" ? "Abschließen" : "Übernehmen") + '</button><button class="btn" data-act="close" style="flex:1">Abbrechen</button></div></div></div>';
  }

  /* ---------- Fahrplan, Bekohlung und Pünktlichkeit (v5.0) ---------- */
  const tD = (T, h) => E.tDate(S, T, h).replace(/ \d{4}(?=,|$)/, "");
  const pName = id => esc(PORTS[id] ? PORTS[id].name : "");
  const dDays = d => { const x = Math.round(d * 10) / 10; return x === 1 ? "1 Tag" : String(x).replace(".", ",") + " Tage"; };
  const lateTxt = d => !(d >= .05) ? "pünktlich" : d < 1 ? "+" + Math.max(1, Math.round(d * 24)) + " Std." : "+" + dDays(d);  // „+5 Std.“, „+1 Tag“, „+2,5 Tage“
  const lateLong = d => (d < 1 ? Math.max(1, Math.round(d * 24)) + " Std." : dDays(d)) + " Verspätung";
  const pkTxt = p => p == null ? "–" : Math.round(p * 100) + " %";
  const pkCls = p => p == null ? "" : p >= .85 ? "pos" : p < .65 ? "neg" : "";
  const capF = t => t.charAt(0).toUpperCase() + t.slice(1);
  const BUNK_SHORT = { heim: "Heimathafen", billig: "am billigsten", noetig: "das Nötige" };
  const BUNK_NOTE = { heim: "Volltanken im Heimathafen der Linie, unterwegs nur das Nötige. Sicher und meist günstig.", billig: "Volltanken im billigsten Hafen der Linie. Spart Geld, wenn ein Ende in der Ferne liegt.", noetig: "Überall nur das Nötige mit knapper Reserve. Wenig Geld im Bunker, aber öfter Kohlemangel bei Sturm." };
  const DIFF_NOTE = { leicht: "Größerer Gründungskredit, schwächere Rivalen, halb so viele Verspätungen, seltener Unglücke, niedrigere Zinsen.", normal: "Das Spiel, wie es gedacht ist.", schwer: "Kleinerer Gründungskredit, stärkere Rivalen, mehr Verspätungen und Unglücke, höhere Zinsen." };
  let confirmDiff = null, confirmCancel = null, mapShip = null, abfAll = false, coalPort = null;
  // Wo ist das Schiff, wann fährt es ab, wie voll ist der Bunker?
  // Abschnitte mit „ · “ getrennt, damit Datum und Verspätung einzeln übersetzt werden
  function voyLine(sh) {
    const o = E.shipStatus(S, sh); if (!o) return "";
    const p = [];
    if (o.res) p.push("Reserveschiff");
    if (o.st === "see") { p.push("Auf See nach " + pName(o.to), "Ankunft " + tD(o.eta, true)); if (o.late >= .05) p.push(lateLong(o.late)); if (o.pax) p.push(E.fmt(o.pax) + " Fahrgäste an Bord"); }
    else if (o.st === "res") p.push("Wartet in " + pName(o.port) + " auf seinen Einsatz");
    else if (o.st === "pendel") { const r = E.routeOf(S, sh), i = r && E.rInfo(S, r); p.push("Fährt im Tagespaket"); if (i) p.push(esc(i.name)); }
    else if (o.next) { const ex = o.next.exp != null ? o.next.exp : o.next.plan, late = ex - o.next.plan; p.push("In " + pName(o.port), "Abfahrt " + tD(ex, true) + " nach " + pName(o.next.to)); if (late >= .05) p.push(lateLong(late)); }
    else p.push("In " + pName(o.port));
    p.push("Bunker " + E.fmt(Math.round(o.b)) + " von " + E.fmt(Math.round(o.cap)) + " t");
    return '<div class="meta voy">' + p.join(" · ") + "</div>";
  }
  // kurzer Stand für die Liste in der Flotte
  function voyShort(sh) {
    const v = sh.v; if (!v) return null;
    if (v.st === "see") return "→ " + (PORTS[v.toP] ? PORTS[v.toP].name : "");
    if (v.st === "res") return "Reserve";
    return null;
  }
  function shipBunkBox(sh) {
    const own = sh.bunk || "";
    let h = '<label class="field">Bekohlung</label><div class="seg" role="group" style="grid-template-columns:repeat(4,1fr)">' + [["", "Reederei"]].concat(E.BUNK_ORDER.map(k => [k, BUNK_SHORT[k]])).map(([k, n]) => '<button data-act="shipBunk" data-id="' + sh.id + '" data-v="' + k + '" aria-pressed="' + (own === k) + '" style="font-size:13.5px">' + n + "</button>").join("") + "</div>";
    h += '<div class="meta">' + (own ? "Eigene Regel: " + E.BUNK[own].name + "." : "Folgt der Regel der Reederei: " + E.BUNK[S.bunk || "heim"].name + ".") + "</div>";
    return h + '<div class="switch"><span>Ankunft melden <span class="meta">(hält die Zeit an)</span></span><input type="checkbox" data-act="markShip" data-id="' + sh.id + '" ' + (sh.mark ? "checked" : "") + ' aria-label="Ankunft melden"></div>';
  }
  // Fahrplan einer Linie: Takt, Pünktlichkeit, Puffer, Reserveschiff, Aufholen
  function fahrplanBox(r, info) {
    const tt = r.tt || {}, last = r.last && r.last.m === S.m - 1 ? r.last : null, G = E.lineGeo(S, r), mo = E.cal(S.m).mo;
    const rv = G ? E.rivalsOf(S, r, info).map(x => E.rivalPk(S, x.k, G, mo)) : [];
    let h = '<div class="fplan" data-tut="fplan"><div class="row"><h3>Fahrplan</h3><span class="meta">Pünktlichkeit <b class="' + pkCls(r.pk) + '">' + pkTxt(r.pk) + "</b>" + (rv.length ? " · Rivalen " + (rv.length > 1 ? Math.round(Math.min(...rv) * 100) + "–" : "") + Math.round(Math.max(...rv) * 100) + " %" : "") + "</span></div>";
    if (!tt.n) h += '<div class="meta">Noch kein Schiff im Fahrplan.</div>';
    else if (tt.short) h += '<div class="meta">Tagespaket: etwa ' + kn(Math.round(tt.n / tt.P * 10) / 10) + " Abfahrten am Tag je Richtung, Umlauf " + Math.max(1, Math.round(tt.P * 24)) + " Stunden. Die Pünktlichkeit zählt als Anteil pünktlicher Fahrten.</div>";
    else h += '<div class="meta">Abfahrt alle ' + dDays(tt.H) + (r.cruise ? "" : " je Richtung") + ", Umlauf " + dDays(tt.P) + (tt.n > 1 ? " mit " + tt.n + " Schiffen" : "") + ". Das langsamste Schiff bestimmt den Takt.</div>";
    h += '<label class="field">Pufferzeit</label><div class="seg lv" role="group" aria-label="Pufferzeit" style="grid-template-columns:repeat(4,1fr)">' + E.BUF.map((b, i) => '<button data-act="bufSet" data-id="' + r.id + '" data-v="' + i + '" aria-pressed="' + ((r.buf || 0) === i) + '">' + capF(E.BUF_NAME[i]) + "<small>" + (b ? "+" + Math.round(b * 100) + " % Umlauf" : "eng getaktet") + "</small></button>").join("") + "</div>";
    h += '<div class="meta">Puffer fängt Verspätungen auf, kostet aber Abfahrten: Die Schiffe liegen länger im Hafen.</div>';
    const cands = S.ships.filter(sh => !sh.museum && sh.ready <= S.m && (sh.line === r.id || !sh.line || sh.laid) && !E.canServe(S, sh.type, r.a, r.b, r.cruise, r.stops) && !S.routes.some(x => x !== r && x.res === sh.id));
    h += '<label class="field" for="res' + r.id + '">Reserveschiff</label><select id="res' + r.id + '" data-act="resSel" data-id="' + r.id + '"><option value="">keines</option>' + cands.map(sh => '<option value="' + sh.id + '"' + (r.res === sh.id ? " selected" : "") + ">„" + esc(sh.name) + "“ · " + esc(E.TYPES[sh.type].name) + "</option>").join("") + "</select>";
    h += '<div class="meta">Es wartet ' + (G ? "in " + pName(G.ports[G.resEnd]) : "am Heimatende der Linie") + " und springt ein, wenn ein Schiff ausfällt oder deutlich zu spät ist. Heuer, Versicherung und Kapital laufen auch im Stillstand, die Wartung zur Hälfte.</div>";
    h += '<div class="switch"><span>Volldampf zum Aufholen <span class="meta">(mehr Kohle und Verschleiß)</span></span><input type="checkbox" data-act="catchUp" data-id="' + r.id + '" ' + (r.auf ? "checked" : "") + ' aria-label="Volldampf zum Aufholen"></div>';
    if (last && (last.dep || last.arr)) {
      h += '<div class="stats"><div><b>' + E.fmt(Math.round(last.dep)) + '</b><span>Abfahrten</span></div><div><b>' + (last.arr ? Math.round((1 - last.lateA / last.arr) * 100) + " %" : "–") + '</b><span>pünktlich angekommen</span></div><div><b>' + (last.avgLate >= .05 ? lateTxt(last.avgLate) : "–") + "</b><span>Ø Verspätung</span></div></div>";
      const no = (last.cls || []).reduce((a, c) => a + (c.no || 0), 0), bits = [];
      if (no >= 1) bits.push(E.fmt(no) + " Fahrgäste fanden keinen Platz");
      if (last.comp >= 1) bits.push("Entschädigung " + E.fmt(last.comp) + " Mark");
      if (last.cancel >= .5) bits.push(E.fmt(Math.round(last.cancel)) + " Fahrten ausgefallen");
      if (bits.length) h += '<div class="meta">Im Vormonat · ' + bits.join(" · ") + "</div>";
    }
    return h + "</div>";
  }
  // Kontor → Abfahrten: nächste Abfahrten, letzte Fahrten, Pünktlichkeit je Linie, automatische Pausen
  function abfahrten() {
    let h = img("kt_abfahrten", "banner", "Abfahrtstafel im Kontor") + '<h2>Abfahrten</h2><p class="sub">Die nächsten Abfahrten Ihrer Schiffe und die letzten Fahrten mit Ergebnis.</p>';
    const deps = E.departures(S, abfAll ? 60 : 12);
    const when = x => x.short ? "täglich" : x.exp == null ? '<span class="neg">fällt aus</span>' : tD(x.exp, true);
    const late = x => x.short ? (x.pk != null ? pkTxt(x.pk) + " pünktlich" : "") : x.exp == null ? "" : '<span class="' + (x.late >= 1 ? "neg" : "") + '">' + lateTxt(x.late) + "</span>";
    const load = x => x.short ? Math.round(x.per) + " Fahrten am Tag" : Math.round(x.load * 100) + " %";
    const ship = x => x.short ? x.ships + (x.ships > 1 ? " Schiffe" : " Schiff") : "„" + esc(x.nm) + "“" + (x.st === "see" ? ' <span class="meta">noch auf See</span>' : "");
    h += '<h3 style="margin-top:12px">Nächste Abfahrten</h3>';
    if (!deps.length) h += '<div class="hint">Noch fährt kein Schiff nach Fahrplan. Weisen Sie in der Flotte einem Schiff eine Linie zu.</div>';
    else if (DESK) h += '<div class="tblwrap"><table class="stat abf"><thead><tr><th>Abfahrt</th><th>Schiff</th><th>Strecke</th><th class="n">Verspätung</th><th class="n">Auslastung</th></tr></thead><tbody>' +
      deps.map(x => "<tr><td>" + when(x) + "</td><td>" + ship(x) + "</td><td>" + pName(x.from) + " → " + pName(x.to) + '</td><td class="n">' + late(x) + '</td><td class="n">' + load(x) + "</td></tr>").join("") + "</tbody></table></div>" + '<div class="meta">Auslastung: erwartet bei der Abfahrt, nach den Buchungen bis heute.</div>';
    else h += '<div class="abfl">' + deps.map(x => '<div class="abfr"><div><b>' + when(x) + "</b> " + late(x) + '</div><div class="meta">' + ship(x) + " · " + pName(x.from) + " → " + pName(x.to) + " · " + load(x) + "</div></div>").join("") + "</div>";
    if (deps.length >= 12 || abfAll) h += '<div class="actions"><button class="btn" data-act="abfAll">' + (abfAll ? "Weniger zeigen" : "Mehr zeigen") + "</button></div>";
    const F = (S.fahrten || []).slice(0, abfAll ? 40 : 12);
    h += '<h3 style="margin-top:16px">Letzte Fahrten</h3>';
    if (!F.length) h += '<div class="hint">Hier erscheinen die Fahrten Ihrer Schiffe, sobald sie angekommen sind. Kurze Linien im Tagespaket zählen nur in der Linienstatistik.</div>';
    else if (DESK) h += '<div class="tblwrap"><table class="stat abf"><thead><tr><th>Ankunft</th><th>Schiff</th><th>Strecke</th><th class="n">Fahrgäste</th><th class="n">Auslastung</th><th class="n">Verspätung</th><th class="n">Ergebnis</th></tr></thead><tbody>' +
      F.map(f => "<tr><td>" + tD(f.t) + "</td><td>„" + esc(f.nm) + "“</td><td>" + pName(f.a) + " → " + pName(f.b) + '</td><td class="n">' + E.fmt(f.aboard || f.n) + '</td><td class="n">' + (f.cap ? Math.round((f.aboard || f.n) / f.cap * 100) + " %" : "–") + '</td><td class="n">' + '<span class="' + (f.late >= 1 ? "neg" : "") + '">' + lateTxt(f.late) + "</span>" + '</td><td class="n">' + num(f.res) + "</td></tr>").join("") + "</tbody></table></div>";
    else h += '<div class="abfl">' + F.map(f => '<div class="abfr"><div><b>„' + esc(f.nm) + "“</b> " + pName(f.a) + " → " + pName(f.b) + '</div><div class="meta">' + tD(f.t) + " · " + E.fmt(f.aboard || f.n) + " Fahrgäste · " + lateTxt(f.late) + ' <span class="' + (f.res < 0 ? "neg" : "") + '">· Ergebnis ' + E.fmt(f.res) + " Mark</span></div></div>").join("") + "</div>";
    const lines = S.routes.filter(r => r.tt && r.tt.n);
    if (lines.length) {
      h += '<h3 style="margin-top:16px">Pünktlichkeit je Linie</h3><div class="tblwrap"><table class="stat"><thead><tr><th>Linie</th><th class="n">Ihre Schiffe</th><th class="n">Rivalen</th><th class="n">Abfahrten im Vormonat</th></tr></thead><tbody>' +
        lines.map(r => { const i = E.rInfo(S, r), G = E.lineGeo(S, r), mo = E.cal(S.m).mo, rv = G && i ? E.rivalsOf(S, r, i).map(x => E.rivalPk(S, x.k, G, mo)) : [], l = r.last && r.last.m === S.m - 1 ? r.last : null;
          return "<tr><td>" + esc(i ? i.name : "?") + '</td><td class="n ' + pkCls(r.pk) + '">' + pkTxt(r.pk) + '</td><td class="n">' + (rv.length ? Math.round(rv.reduce((a, b) => a + b, 0) / rv.length * 100) + " %" : "–") + '</td><td class="n">' + (l ? E.fmt(Math.round(l.dep || 0)) : "–") + "</td></tr>"; }).join("") + "</tbody></table></div>";
      h += '<div class="meta">Pünktlich heißt: höchstens einen halben Tag zu spät, auf langen Strecken bis 15 % der Seezeit. Wer oft zu spät kommt, verliert für Monate Fahrgäste an pünktlichere Rivalen – vor allem in der 1. Klasse und bei der Post.</div>';
    }
    return h + pauseBox();
  }
  function pauseBox() {
    const P = Object.assign({}, E.PAUSE_DEF, S.pause || {});
    let h = '<h3 style="margin-top:18px" data-tut="pause">Automatische Pausen</h3><p class="sub">Die Zeit hält von selbst an, wenn …</p>';
    h += '<label class="field">… ein Schiff mit so viel Verspätung ankommt</label><div class="seg" role="group" style="grid-template-columns:repeat(5,1fr)">' + [0, 1, 2, 3, 5].map(v => '<button data-act="pauseSet" data-v="' + v + '" aria-pressed="' + (P.late === v) + '">' + (v ? (v === 1 ? "1 Tag" : v + " Tage") : "nie") + "</button>").join("") + "</div>";
    for (const [k, n] of [["coal", "… auf einem Schiff die Kohle knapp wird"], ["month", "… ein Monat abgeschlossen ist"], ["mark", "… ein markiertes Schiff ankommt"]])
      h += '<div class="switch"><span>' + n + '</span><input type="checkbox" data-act="pauseChk" data-k="' + k + '" ' + (P[k] ? "checked" : "") + ' aria-label="' + n + '"></div>';
    return h + '<div class="meta">Schiffe markieren Sie in der Flotte mit „Ankunft melden“.</div>';
  }
  function diffBox() {
    const d = S.diff || "normal";
    let h = '<label class="field">Schwierigkeitsgrad</label>';
    if (S.diffSet) return h + '<div class="meta">' + E.DIFF[d].name + " · " + DIFF_NOTE[d] + " Der Schwierigkeitsgrad wurde schon einmal umgestellt.</div>";
    h += '<div class="seg" role="group" aria-label="Schwierigkeitsgrad">' + E.DIFF_ORDER.map(k => '<button data-act="diffSet" data-v="' + k + '" aria-pressed="' + ((confirmDiff || d) === k) + '">' + E.DIFF[k].name + "</button>").join("") + "</div>";
    h += '<div class="meta">' + DIFF_NOTE[confirmDiff || d] + " Umstellen geht einmal, der Gründungskredit bleibt, wie er ist.</div>";
    if (confirmDiff && confirmDiff !== d) h += '<div class="actions"><button class="btn solid" data-act="diffOk">Auf „' + E.DIFF[confirmDiff].name + '“ umstellen</button><button class="btn" data-act="diffNo">Abbrechen</button></div>';
    return h;
  }
  function bunkBox() {
    const cur = S.bunk || "heim", ex = S.ships.filter(x => !x.museum && x.bunk).length;
    let h = '<div class="item" data-tut="bunk"><div class="row"><h3>Bekohlung</h3></div><div class="seg lv" role="group" aria-label="Bekohlung">' + E.BUNK_ORDER.map(k => '<button data-act="bunkSet" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + capF(E.BUNK[k].name) + "</button>").join("") + "</div>";
    return h + '<div class="meta" style="margin-top:6px">' + BUNK_NOTE[cur] + " Gilt für alle Schiffe ohne eigene Regel" + (ex ? "; " + ex + (ex > 1 ? " Schiffe haben" : " Schiff hat") + " eine eigene" : "") + ". Bekohlen verlängert die Liegezeit, je nach Menge.</div></div>";
  }

  /* ---------- Unternavigation ---------- */
  let kontorSub = "uebersicht", marktSub = "werbung", statView = "schiffe", statSort = { schiffe: ["erg", -1], linien: ["erg", -1] }, mrRoute = null;
  const subnav = (act, cur, items) => '<div class="subnav" role="tablist">' + items.map(([k, n]) => '<button data-act="' + act + '" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + n + "</button>").join("") + "</div>";
  const pct = x => Math.round(x * 100) + " %";
  const num = (v, neg) => (v < 0 ? '<span class="neg">' : "") + E.fmt(v) + (v < 0 ? "</span>" : "");

  /* ---------- Kontor ---------- */
  function kontorView() {
    let h = subnav("ksub", kontorSub, [["uebersicht", "Übersicht"], ["abfahrten", "Abfahrten"], ["statistik", "Statistik"], ["einkauf", "Einkauf"], ["personal", "Personal"], ["boerse", "Börse"]]);
    if (kontorSub === "abfahrten") return h + abfahrten();
    if (kontorSub === "statistik") return h + statistik();
    if (kontorSub === "boerse") return h + boerse();
    if (kontorSub === "einkauf") return h + einkauf();
    if (kontorSub === "personal") return h + personal();
    return h + kontor();
  }

  /* ---------- Statistik ---------- */
  function sortTable(key, cols, rows) {
    const [sk, dir] = statSort[key] || [cols[0].k, 1];
    rows.sort((a, b) => { const x = a[sk], y = b[sk]; return (typeof x === "string" ? String(x).localeCompare(String(y), "de") : (x || 0) - (y || 0)) * dir; });
    let h = '<div class="tblwrap"><table class="stat"><thead><tr>' + cols.map(c => '<th data-act="sort" data-t="' + key + '" data-k="' + c.k + '" class="' + (c.num ? "n" : "") + (sk === c.k ? " on" : "") + '">' + c.n + (sk === c.k ? "<span> " + (dir > 0 ? "▲" : "▼") + "</span>" : "") + "</th>").join("") + "</tr></thead><tbody>";
    for (const r of rows) h += "<tr>" + cols.map(c => '<td class="' + (c.num ? "n" : "") + '">' + (c.f ? c.f(r) : esc(r[c.k])) + "</td>").join("") + "</tr>";
    return h + "</tbody></table></div>";
  }
  function statistik() {
    let h = img("ev_statistik", "banner", "Buchhalter im Kontor") + subnav("sview", statView, [["schiffe", "Schiffe"], ["linien", "Linien"], ["kohle", "Kohle"], ["finanzen", "Finanzen"]]);
    if (statView === "kohle") return h + kohleStat();
    if (statView === "schiffe") {
      if (!S.ships.length) return h + '<div class="hint">Noch keine Schiffe.</div>';
      const rows = S.ships.map(sh => { const r = E.routeOf(S, sh), l = sh.last && sh.last.m === S.m - 1 ? sh.last : null;
        return { name: sh.name, linie: sh.ready > S.m ? "im Bau" : E.inDock(S, sh) ? "Werft" : r && !sh.laid ? E.rInfo(S, r).name : "aufgelegt", zust: Math.round(sh.cond), ausl: l ? l.load : 0, pax: l ? l.pax : 0, ums: l ? l.rev : 0, erg: l ? l.rev - l.cost : 0, kohle: l ? l.coal || 0 : 0, alter: Math.floor(sh.age / 12) }; });
      h += '<p class="sub">Werte des Vormonats. ' + (DESK ? "Klicken" : "Tippen") + ' Sie auf eine Spalte, um zu sortieren.</p>' + sortTable("schiffe", [
        { k: "name", n: "Schiff", f: r => "„" + esc(r.name) + "“" }, { k: "linie", n: "Linie" }, { k: "erg", n: "Ergebnis", num: 1, f: r => num(r.erg) },
        { k: "ums", n: "Umsatz", num: 1, f: r => E.fmt(r.ums) }, { k: "kohle", n: "Kohle", num: 1, f: r => E.fmt(r.kohle) }, { k: "ausl", n: "Auslastung", num: 1, f: r => pct(r.ausl) }, { k: "pax", n: "Fahrgäste", num: 1, f: r => E.fmt(r.pax) },
        { k: "zust", n: "Zustand", num: 1, f: r => r.zust + " %" }, { k: "alter", n: "Alter", num: 1, f: r => r.alter + " J." }], rows);
      return h;
    }
    if (statView === "linien") {
      if (!S.routes.length) return h + '<div class="hint">Noch keine Linien.</div>';
      const rows = S.routes.map(r => { const i = E.rInfo(S, r), l = r.last && r.last.m === S.m - 1 ? r.last : null;
        return { name: i ? i.name : "?", typ: i ? i.kind.cat : "", schiffe: S.ships.filter(x => x.line === r.id).length, pax: l ? l.pax : 0, ausl: l ? l.load : 0, anteil: l ? l.share : 0, ums: l ? l.rev : 0, kohle: l ? l.coal || 0 : 0, erg: l ? l.rev - l.cost - (l.fixed || 0) : 0 }; });
      h += '<p class="sub">Werte des Vormonats. Das Ergebnis enthält Heuer, Wartung und Versicherung der eingesetzten Schiffe.</p>' + sortTable("linien", [
        { k: "name", n: "Linie" }, { k: "erg", n: "Ergebnis", num: 1, f: r => num(r.erg) }, { k: "ums", n: "Umsatz", num: 1, f: r => E.fmt(r.ums) }, { k: "kohle", n: "Kohle", num: 1, f: r => E.fmt(r.kohle) },
        { k: "ausl", n: "Auslastung", num: 1, f: r => pct(r.ausl) }, { k: "anteil", n: "Marktanteil", num: 1, f: r => pct(r.anteil) }, { k: "pax", n: "Fahrgäste", num: 1, f: r => E.fmt(r.pax) },
        { k: "schiffe", n: "Schiffe", num: 1, f: r => r.schiffe }, { k: "typ", n: "Typ" }], rows);
      return h;
    }
    const years = Object.keys(S.years || {}).sort();
    h += '<h3 style="margin-top:12px">Jahre</h3>';
    if (!years.length) h += '<div class="hint">Nach dem ersten Monatsabschluss erscheinen hier die Zahlen.</div>';
    else h += '<div class="tblwrap"><table class="stat"><thead><tr><th>Jahr</th><th class="n">Umsatz</th><th class="n">Kosten</th><th class="n">Ergebnis</th><th class="n">Fahrgäste</th><th class="n">Schiffe</th><th class="n">Eigenkapital</th></tr></thead><tbody>' +
      years.slice().reverse().map(y => { const Y = S.years[y]; return "<tr><td>" + y + '</td><td class="n">' + E.fmt(Y.rev) + '</td><td class="n">' + E.fmt(Y.cost) + '</td><td class="n">' + num(Y.profit) + '</td><td class="n">' + E.fmt(Y.pax) + '</td><td class="n">' + Y.ships + '</td><td class="n">' + num(Y.eq) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    const hs = (S.hist || []).slice(-24).reverse();
    if (hs.length) h += '<h3 style="margin-top:16px">Letzte Monate</h3><div class="tblwrap"><table class="stat"><thead><tr><th>Monat</th><th class="n">Umsatz</th><th class="n">Kosten</th><th class="n">Ergebnis</th><th class="n">Fahrgäste</th><th class="n">Kasse</th></tr></thead><tbody>' +
      hs.map(x => "<tr><td>" + E.dateStr(x.m) + '</td><td class="n">' + (x.rev != null ? E.fmt(x.rev) : "–") + '</td><td class="n">' + (x.cost != null ? E.fmt(x.cost) : "–") + '</td><td class="n">' + num(x.profit) + '</td><td class="n">' + (x.pax != null ? E.fmt(x.pax) : "–") + '</td><td class="n">' + num(x.cash) + "</td></tr>").join("") + "</tbody></table></div>";
    return h;
  }

  /* ---------- Personal ---------- */
  function personal() {
    const st = E.staff(S), w = S.wage || 1;
    const crewAll = S.ships.filter(x => x.ready <= S.m).reduce((a, x) => a + E.TYPES[x.type].crew, 0) * w * (S.crewMult || 1);
    let h = '<h2>Personal</h2><p class="sub">Bessere Bezahlung kostet mehr, bringt aber spürbare Vorteile. Bei knapper Bezahlung drohen öfter Streiks.</p>';
    for (const k of ["deck", "maschine", "service"]) {
      const D = E.DEPT[k];
      h += '<div class="item">' + img(D.img, "banner", D.who) + '<div class="row"><h3>' + D.name + '</h3><span class="meta">' + D.who + "</span></div>" +
        '<div class="seg lv" role="group">' + E.STAFF_LV.map((n, i) => '<button data-act="staff" data-k="' + k + '" data-v="' + i + '" aria-pressed="' + (st[k] === i) + '">' + n + "<small>" + (i === 1 ? "±0" : (E.STAFF_PAY[i] > 1 ? "+" : "−") + Math.round(Math.abs(E.STAFF_PAY[i] - 1) * 100) + " %") + "</small></button>").join("") + "</div>" +
        '<div class="meta" style="margin-top:6px">Wirkung: ' + D.fx[st[k]] + ". Lohnkosten dieser Abteilung derzeit etwa " + M(crewAll * D.share * E.STAFF_PAY[st[k]]) + " im Monat.</div></div>";
    }
    h += capList();
    h += '<h2 data-tut="kontorstaff">Angestellte im Kontor</h2>';
    h += '<div class="item">' + img("pers_inspektor", "banner", "Schiffsinspektor") + '<div class="row"><h3>Schiffsinspektor</h3><span class="num">' + M(E.INSP_PAY * w) + ' / Monat</span></div>' +
      '<p>Er erneuert Fristen rechtzeitig und schickt Schiffe ins Dock, sobald ihr Zustand unter die gewählte Grenze fällt. Bei der Werft handelt er 5 % Rabatt heraus. Er lässt immer 20.000 Mark Reserve in der Kasse.</p>' +
      '<div class="switch"><span>Eingestellt</span><input type="checkbox" data-act="staffchk" data-k="insp" ' + (st.insp ? "checked" : "") + ' aria-label="Schiffsinspektor"></div>' +
      (st.insp ? '<label class="field">Docken unter</label><div class="seg" role="group">' + [50, 60, 70].map(v => '<button data-act="staff" data-k="inspMin" data-v="' + v + '" aria-pressed="' + (st.inspMin === v) + '">' + v + " %</button>").join("") + "</div>" : "") + "</div>";
    h += '<div class="item">' + img("ev_marktforschung", "banner", "Marktforschung") + '<div class="row"><h3>Marktforschungsabteilung</h3><span class="num">' + M(E.MARKT_PAY * w) + ' / Monat</span></div>' +
      "<p>Befragt Reisende an den Kais und zeigt Ihnen unter Markt → Marktforschung für jede Linie, warum Fahrgäste zu Ihnen kommen – und warum zur Konkurrenz.</p>" +
      '<div class="switch"><span>Eingestellt</span><input type="checkbox" data-act="staffchk" data-k="markt" ' + (st.markt ? "checked" : "") + ' aria-label="Marktforschung"></div></div>';
    h += '<h2>Kohle und Küche</h2><p class="sub">Diese drei arbeiten nach Lohnstufe: Wer knapp bezahlt wird, macht mehr Fehler.</p>';
    h += staffCard("mi", "pers_maschineninspektor", "Maschineninspektor", E.MI_PAY, "Er stellt die Reederei-Fahrstufe nach Ihrer Regel um, sobald sich der Kohlepreis bewegt. Schiffe mit eigener Fahrstufe lässt er in Ruhe.",
      ["stellt erst zwei Monate später um und übersieht Postverträge", "stellt einen Monat später um und achtet auf Postverträge", "stellt sofort um und achtet auf Postverträge", "stellt sofort um, achtet auf Postverträge und spart 3 % Kohle in der ganzen Flotte"], () =>
        '<div class="switch"><span>Regel anwenden</span><input type="checkbox" data-act="staffchk" data-k="miAuto" ' + (st.miAuto ? "checked" : "") + ' aria-label="Regel anwenden"></div>' +
        (st.miAuto ? '<label class="field">Sparfahrt ab Kohlepreis</label>' + ruleSeg("miSpar", st.miSpar, [115, 125, 135, 150]) + '<label class="field">Volldampf unter Kohlepreis</label>' + ruleSeg("miVoll", st.miVoll, [80, 85, 90, 95]) +
          '<div class="meta">' + (st.miPlan ? "Geplant: " + E.FAHRT[st.miPlan.stage].name + " ab " + E.dateStr(st.miPlan.at) + "." : "Derzeit fährt die Flotte " + E.FAHRT[S.fahrt || "normal"].name + ", der Kohlepreis steht bei " + E.coalIdx(S) + " %.") + "</div>" : '<div class="meta">Regel ausgeschaltet – Sie stellen die Fahrstufe in der Flotte von Hand.</div>'));
    h += staffCard("ke", "pers_einkaeufer", "Kohleneinkäufer", E.KE_PAY, "Er handelt bei Lieferverträgen einen kleineren Aufschlag heraus, warnt drei Monate vor dem Ende eines Vertrags und verlängert ihn nach Ihrer Regel.",
      ["Aufschlag 1 Punkt niedriger, vergisst die Warnung manchmal", "Aufschlag 2 Punkte niedriger", "Aufschlag 3 Punkte niedriger", "Aufschlag 4 Punkte niedriger"], () =>
        '<label class="field">Verlängern, wenn Kohle weniger kostet als</label>' + ruleSeg("keRenew", st.keRenew, [90, 95, 100, 105]));
    h += staffCard("pm", "pers_proviantmeister", "Proviantmeister", E.PM_PAY, "Er führt die eigene Bordküche: Einkauf, Vorräte und Köche. Mit eigener Küche kostet die Verpflegung 10 % weniger.",
      ["„fein“ gelingt nicht ganz, öfter verdorbener Proviant", "solide Küche", "bessere Küche, selten Ärger mit dem Proviant", "beste Küche, kaum Ärger mit dem Proviant"], () =>
        '<div class="meta">' + (E.kueche(S).eigen ? "Die eigene Küche ist eingerichtet." : "Die eigene Küche richten Sie unter Kontor → Einkauf ein.") + "</div>");
    if (S.bo && S.bo.on) {
      h += '<h2>Börse</h2>';
      h += staffCard("pk", "pers_prokurist", "Prokurist", E.PK_PAY, "Er verwaltet ein eigenes Depot mit dem Betrag, den Sie ihm zuteilen, und schätzt Gerüchte ein. Dazu bekommt er 10 % der Kursgewinne, die er realisiert.",
        ["liegt oft daneben und schätzt Gerüchte selten richtig ein", "bleibt etwas hinter dem Markt zurück", "hält ungefähr mit dem Markt mit und liegt bei Gerüchten meist richtig", "schlägt den Markt leicht und schätzt Gerüchte fast immer richtig ein"], () =>
          '<div class="meta">Depot und Risiko stellen Sie unter Kontor → Börse ein.' + (E.staff(S).pk >= 0 && S.bo.pk.amt ? " Zugeteilt: " + M(S.bo.pk.amt) + "." : "") + "</div>");
    }
    return h;
  }

  /* ---------- Börse (v4.6) ---------- */
  const toMark = v => isGB() ? v * 20.43 : v;
  const pxM = v => (v >= 100 ? E.fmt(v) : kn(v.toFixed(v >= 10 ? 1 : 2))) + " M";
  const arrowOf = ch => ch >= .005 ? '<span class="kup">▲</span>' : ch <= -.005 ? '<span class="kdown">▼</span>' : '<span class="cflat">◆</span>';
  function boChange(k, months) { const H = S.bo.co[k].hist, n = months || 1; if (H.length < 2) return 0; const a = H[Math.max(0, H.length - 1 - n)].p, b = H[H.length - 1].p; return a ? b / a - 1 : 0; }
  function boDepRows(D) {
    const b = S.bo; let val = 0, cost = 0;
    const rows = Object.keys(D).filter(k => D[k].n > 0).map(k => { const d = D[k], c = b.co[k], v = d.n * c.px; val += v; cost += d.cost; return { k, d, c, v, g: v - d.cost }; });
    return { rows, val, cost };
  }
  function boDepTable(D) {
    const r = boDepRows(D); if (!r.rows.length) return "";
    return '<div class="tblwrap"><table class="stat bodep"><thead><tr><th>Aktie</th><th class="n">Stück</th><th class="n">Einstand</th><th class="n">Kurs</th><th class="n">Wert</th><th class="n">Gewinn</th><th class="n">Anteil</th></tr></thead><tbody>' +
      r.rows.map(x => '<tr data-act="boOpen" data-k="' + x.k + '"><td>' + esc(E.boName(S, x.k)) + '</td><td class="n">' + E.fmt(x.d.n) + '</td><td class="n">' + pxM(x.d.cost / x.d.n) + '</td><td class="n">' + pxM(x.c.px) + '</td><td class="n">' + M(x.v) + '</td><td class="n">' + signed(x.g) + " M (" + pctSign(x.d.cost ? x.g / x.d.cost : 0) + ')</td><td class="n">' + kn((x.d.n / x.c.n * 100).toFixed(1)) + " %</td></tr>").join("") +
      '</tbody><tfoot><tr><td><b>Summe</b></td><td></td><td></td><td></td><td class="n"><b>' + M(r.val) + '</b></td><td class="n"><b>' + signed(r.val - r.cost) + " M</b></td><td></td></tr></tfoot></table></div>";
  }
  function boerse() {
    const b = E.boState(S), st = E.staff(S);
    let h = img("bo_saal", "banner", "Börsensaal") + '<h2>Börse</h2>';
    if (!b.on) {
      const yrs = Object.keys(S.years || {}).filter(y => +y < E.cal(S.m).y), good = yrs.some(y => S.years[y].profit > 0);
      return h + '<p class="sub">Aktien der Rivalen, der Zechen, der Werft und der Caterer.</p><div class="hint">Die Börse öffnet sich Ihnen, sobald Ihre Reederei mindestens drei Schiffe hat und ein Geschäftsjahr mit Gewinn abgeschlossen ist. Sie bekommen dann eine Meldung in der Zeitung.</div>' +
        '<div class="kv"><div><b>' + S.ships.length + " / 3</b><span>Schiffe</span></div><div><b>" + (good ? "✓" : "–") + "</b><span>Geschäftsjahr mit Gewinn</span></div></div>" +
        '<div class="meta">Wer die Börse nicht nutzt, verpasst nichts: Sie ist ein Zusatz für Reedereien mit Geld übrig. Aktien bringen im Schnitt weniger als eine gut laufende Linie.</div>';
    }
    E.boSeen(S);
    const own = boDepRows(b.dep), pk = boDepRows(b.pk.dep);
    h += '<p class="sub">Der Kurs folgt dem Gewinn der Firma und der Stimmung am Markt. Jeder Auftrag kostet 1 % Gebühr, gekauft wird nur bar.</p>';
    if (b.closed >= S.m) h += '<div class="hint bad">Die Börse ist geschlossen. Der Handel ruht bis ' + E.dateStr(b.closed + 1) + ".</div>";
    h += '<div class="kv bokv"><div><b>' + M(own.val) + '</b><span>Ihr Depot</span></div><div><b>' + signed(own.val - own.cost) + ' M</b><span>Gewinn oder Verlust</span></div><div><b>' + Math.round(b.mk * 100) + ' %</b><span>Stimmung am Markt</span></div><div><b>' + (b.divLast ? M(b.divLast.sum) : "–") + "</b><span>" + (b.divLast ? "Dividende für " + b.divLast.y : "Dividende") + "</span></div></div>";
    if (b.hz) h += '<div class="item compact">' + img("bo_hauszeche", "", "Hauszeche") + '<div><h3>Hauszeche: ' + esc(E.boName(S, b.hz)) + '</h3><div class="meta">Ihre Kohleschiffe bunkern 20 % unter dem Marktpreis, bis zur Förderung der Zeche.' + (b.hzStop >= S.m ? " Derzeit fällt die Lieferung aus – bis " + E.dateStr(b.hzStop) + " zahlen Sie den Marktpreis." : "") + (S.last && S.last.hzSave ? " Im Vormonat gespart: " + M(S.last.hzSave) + "." : "") + "</div></div></div>";
    h += '<h3 style="margin-top:14px">Ihr Depot</h3>' + (own.rows.length ? boDepTable(b.dep) : '<div class="meta bodepot">Noch keine Aktien. ' + (DESK ? "Klicken" : "Tippen") + " Sie unten auf eine Aktie, um sie zu kaufen.</div>");
    h += '<h3 style="margin-top:16px">Kurszettel</h3><div class="bolist">';
    for (const g of Object.keys(E.BO_GRP)) {
      const ks = E.BO_ORDER.filter(k => E.BO[k].grp === g);
      h += '<div class="bogrp">' + E.BO_GRP[g] + "</div>";
      for (const k of ks) {
        const c = b.co[k], listed = E.boListed(S, k), ch = boChange(k), n = E.boOwn(S, k);
        h += '<button class="borow" data-act="boOpen" data-k="' + k + '"' + (listed ? "" : " disabled") + ">" + img(E.boImg(S, k), "bothumb", "") + '<span class="bon">' + esc(E.boName(S, k)) + (n ? '<small>' + E.fmt(n) + " Stück im Besitz" + (b.hz === k ? " · Hauszeche" : "") + "</small>" : !listed ? "<small>" + (E.BO[k].from && E.yearOf(S) < E.BO[k].from ? "an der Börse ab " + E.BO[k].from : "derzeit nicht gehandelt") + "</small>" : "") + '</span><span class="bop">' + pxM(c.px) + '</span><span class="boc">' + arrowOf(ch) + " " + pctSign(ch) + "</span></button>";
      }
    }
    h += "</div>";
    const rum = (b.rum || []).filter(r => r.shown);
    if (rum.length) h += '<h3 style="margin-top:16px">Gerüchte im Umlauf</h3>' + rum.map(r => '<div class="eqrow">' + img("ev_geruecht", "mini", "") + '<span style="flex:1">' + esc(E.boName(S, r.k)) + " " + esc(r.what) + (r.label ? '<br><span class="meta">Ihr Prokurist: ' + r.label + "</span>" : "") + "</span></div>").join("");
    // Prokurist
    h += '<div class="item pkbox">' + img("pers_prokurist", "banner", "Prokurist") + '<div class="row"><h3>Prokurist</h3>' + (st.pk >= 0 ? '<span class="tag">' + E.STAFF_LV[st.pk] + "</span>" : "") + "</div>";
    if (st.pk < 0) h += '<p>Ein Prokurist verwaltet ein eigenes Depot mit einem festen Betrag und schätzt Gerüchte ein. Einstellen unter Kontor → Personal.</p>';
    else {
      const P = b.pk, val = pk.val + (P.cash || 0);
      h += '<div class="kv"><div><b>' + M(P.amt) + '</b><span>zugeteilt</span></div><div><b>' + M(val) + '</b><span>Wert heute</span></div><div><b>' + M(P.cash || 0) + "</b><span>davon in bar</span></div></div>";
      h += '<label class="field">Risiko</label><div class="seg" role="group">' + Object.keys(E.PK_RISK).map(k => '<button data-act="pkRisk" data-v="' + k + '" aria-pressed="' + (P.risk === k) + '">' + E.PK_RISK[k].name + "</button>").join("") + "</div>";
      h += '<div class="meta">' + { vorsichtig: "Vorsichtig: nur große, ruhige Werte, ein knappes Drittel bleibt in bar.", ausgewogen: "Ausgewogen: breit über alle Werte verteilt.", riskant: "Riskant: nur die drei Werte, die er für die besten hält." }[P.risk] + " Er schichtet alle drei Monate um.</div>";
      h += '<label class="field" for="pkamt">Betrag für sein Depot</label><div class="namebox"><input class="name" id="pkamt" inputmode="numeric" value="' + Math.round(isGB() ? P.amt / 20.43 : P.amt) + '"><button class="btn solid" data-act="pkSet">Übernehmen</button></div>';
      h += '<div class="meta">Ein höherer Betrag geht aus der Kasse in sein Depot, ein niedrigerer zurück in die Kasse – dafür verkauft er Aktien. Er bekommt 10 % der Kursgewinne, die er realisiert.</div>' + boDepTable(b.pk.dep);
    }
    h += "</div>";
    return h;
  }
  function boChart(H) {
    const W = 340, Ht = 150, v = H.map(x => x.p), lo = Math.min(...v), hi = Math.max(...v), mn = lo * .92, mx = hi * 1.05;
    const xs = i => 48 + i * (W - 56) / Math.max(1, H.length - 1), ys = c => 8 + (mx - c) / (mx - mn || 1) * (Ht - 30);
    let o = '<svg class="chart coalchart" viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Kursverlauf">';
    for (const g of [lo, hi]) o += '<line x1="48" x2="' + (W - 8) + '" y1="' + ys(g).toFixed(1) + '" y2="' + ys(g).toFixed(1) + '" stroke="var(--rule)"/><text x="44" y="' + (ys(g) + 4).toFixed(1) + '" font-size="10" fill="var(--muted)" text-anchor="end">' + pxM(g) + "</text>";
    let lastY = -9;
    H.forEach((x, i) => { const c = E.cal(x.m); if (c.mo === 0 && c.y - lastY >= (H.length > 60 ? 2 : 1)) { lastY = c.y; o += '<text x="' + xs(i).toFixed(1) + '" y="' + (Ht - 6) + '" font-size="10" fill="var(--muted)" text-anchor="middle">' + c.y + "</text>"; } });
    o += '<path d="' + v.map((c, i) => (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(c).toFixed(1)).join(" ") + '" fill="none" stroke="var(--ink)" stroke-width="2"/>';
    return o + "</svg>";
  }
  function boQuoteHtml() {
    const P = sheet, k = P.k, raw = Math.max(0, Math.floor(+P.v || 0)), n = P.mode === "amt" ? E.boFor(S, k, toMark(raw)) : raw;
    if (!n) return '<div class="meta">' + (P.mode === "amt" ? "Betrag eingeben – das Spiel rechnet die Stückzahl aus." : "Stückzahl eingeben.") + "</div>";
    const qb = E.boQuote(S, k, n), have = S.bo.dep[k] ? S.bo.dep[k].n : 0, qs = E.boQuote(S, k, Math.min(n, have), true);
    return '<table class="fin" style="width:100%"><tr><td>Stück</td><td>' + E.fmt(n) + "</td></tr><tr><td>Kaufen</td><td>" + M(qb.total) + " (Gebühr " + M(qb.fee) + ")</td></tr>" + (have ? "<tr><td>Verkaufen" + (n > have ? " (" + E.fmt(have) + " Stück)" : "") + "</td><td>" + M(qs.total) + " (Gebühr " + M(qs.fee) + ")</td></tr>" : "") + "</table>" +
      (n / S.bo.co[k].n > .02 ? '<div class="meta">Ein großes Paket bewegt den Kurs: Im Schnitt zahlen Sie ' + pctSign(qb.px / S.bo.co[k].px - 1) + " auf den Kurs.</div>" : "");
  }
  function boSheet() {
    const P = sheet, k = P.k, b = S.bo, c = b.co[k], B = E.BO[k], d = b.dep[k], err = E.boCanTrade(S, k), last12 = c.g.reduce((a, v) => a + v, 0);
    let h = '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true">' + img(E.boImg(S, k), "banner", "") + '<div class="kicker">' + E.BO_GRP[B.grp] + "</div><h3>" + esc(E.boName(S, k)) + "</h3>";
    h += '<div class="kv"><div><b>' + pxM(c.px) + " " + arrowOf(boChange(k)) + '</b><span>Kurs</span></div><div><b>' + pctSign(boChange(k, 12)) + '</b><span>in zwölf Monaten</span></div><div><b>' + M(last12) + '</b><span>Gewinn der Firma in zwölf Monaten</span></div><div><b>' + (c.div ? pxM(c.div) + " (" + kn((c.div / c.px * 100).toFixed(1)) + " %)" : "keine") + "</b><span>letzte Dividende je Aktie</span></div></div>";
    if (c.hist.length > 1) h += boChart(c.hist);
    h += '<div class="meta">' + { reederei: "Reedereien verdienen, wenn viel gereist wird. Preiskämpfe, Unglücke und neue Schiffe bewegen den Kurs.", zeche: "Zechen verdienen an teurer Kohle. Streiks und Grubenunglücke drücken den Kurs. Mit Ölfeuerung und Motorschiffen verlieren sie ab 1912 langsam an Wert. Wer mehr als die Hälfte hält, bunkert für seine Kohleschiffe 20 % billiger.", werft: "Die Werft lebt von Aufträgen – auch von Ihren eigenen Neubauten.", caterer: "Caterer verdienen an jedem Fahrgast – auch an Ihren, wenn Sie einen Vertrag mit ihnen haben." }[B.grp] + " " + E.fmt(c.n) + " Aktien insgesamt.</div>";
    if (B.grp === "zeche" && b.hz !== k) { const sv = E.hzPreview(S, k); if (sv > 0) h += '<div class="meta">Als Hauszeche hätte sie Ihren Kohleschiffen im Vormonat etwa ' + M(sv) + " gespart.</div>"; }
    if (d) h += '<div class="report">Im Besitz: ' + E.fmt(d.n) + " Stück · Einstand " + pxM(d.cost / d.n) + " · Wert " + M(d.n * c.px) + " · " + kn((d.n / c.n * 100).toFixed(1)) + " % der Firma</div>";
    if (err) h += '<div class="hint">' + esc(err) + "</div>";
    else {
      h += '<div class="seg" role="group" style="grid-template-columns:repeat(2,1fr);margin-top:10px">' + [["n", "nach Stückzahl"], ["amt", "nach Betrag"]].map(([m, t]) => '<button data-act="boMode" data-v="' + m + '" aria-pressed="' + (P.mode === m) + '">' + t + "</button>").join("") + "</div>";
      h += '<div class="namebox" style="margin-top:8px"><input class="name" id="boqty" inputmode="numeric" placeholder="' + (P.mode === "amt" ? (isGB() ? "Betrag in Pfund" : "Betrag in Mark") : "Stück") + '" value="' + (P.v || "") + '"></div><div id="boq">' + boQuoteHtml() + "</div>";
      h += '<div class="actions"><button class="btn solid" data-act="boBuy" style="flex:1">Kaufen</button>' + (d ? '<button class="btn" data-act="boSell" style="flex:1">Verkaufen</button>' : "") + "</div>";
      if (d) h += '<div class="actions"><button class="btn warn" data-act="boSellAll" style="flex:1">Alle ' + E.fmt(d.n) + " verkaufen (" + M(E.boQuote(S, k, d.n, true).total) + ")</button></div>";
    }
    return h + '<div class="actions"><button class="btn" data-act="close" style="flex:1">Schließen</button></div></div></div>';
  }
  // Kurszettel über den Meldungen
  function ticker() {
    const H = (S.coalHist || []).slice(-1), b = S.bo, rows = ['<button class="tk" data-act="coalGo"><span>Kohle</span><b>' + E.coalIdx(S) + " % " + coalArrow() + "</b></button>"];
    if (b && b.on) {
      let ks = E.BO_ORDER.filter(k => E.boOwn(S, k) > 0).sort((x, y) => E.boOwn(S, y) * b.co[y].px - E.boOwn(S, x) * b.co[x].px);
      if (ks.length < 4) { const riv = []; for (const r of S.routes) for (const x of (r.riv || [])) if (!riv.includes(x.k)) riv.push(x.k); ks = ks.concat(riv.filter(k => !ks.includes(k)), E.BO_ORDER.filter(k => E.BO[k].grp === "reederei")); }
      ks = [...new Set(ks)].filter(k => E.boListed(S, k)).slice(0, 4);
      for (const k of ks) rows.push('<button class="tk" data-act="boOpen" data-k="' + k + '"><span>' + esc(E.boName(S, k)) + "</span><b>" + pxM(b.co[k].px) + " " + arrowOf(boChange(k)) + "</b></button>");
    }
    return '<div class="ticker">' + rows.join("") + "</div>";
  }
  // Zeitung mit Rubriken
  let newsCat = (() => { try { return localStorage.getItem(KEY + "-zeitung") || "alle"; } catch (e) { return "alle"; } })();
  const catOf = l => l.cat || (l.kind === "news" ? "welt" : "eigen");
  const pinned = l => (l.kind === "bad" || /Seenot|Havarie|gesunken/.test(l.head) || /^Entscheidung:/.test(l.text || "")) && S.m - l.m <= 3;
  function newsPick(n) {
    const cat = newsCat === "boerse" && !(S.bo && S.bo.on) ? "alle" : newsCat, L = S.log;
    if (cat !== "alle") return L.filter(l => catOf(l) === cat).slice(0, n);
    let out = [], bo = 0;
    for (const l of L) { if (out.length >= n) break; if (catOf(l) === "boerse") { if (bo >= 2) continue; bo++; } out.push(l); }
    for (const l of L.filter(x => pinned(x) && !out.includes(x))) { let i = out.length - 1; while (i >= 0 && pinned(out[i])) i--; if (i < 0) break; out.splice(i, 1); out.push(l); }
    return out.sort((a, b) => L.indexOf(a) - L.indexOf(b));
  }
  function newsBox(n) {
    const cats = [["alle", "Alle"], ["eigen", "Eigene"], ["welt", "Schifffahrt"]].concat(S.bo && S.bo.on ? [["boerse", "Börse"]] : []), cur = cats.some(c => c[0] === newsCat) ? newsCat : "alle";
    let h = ticker() + '<div class="newschips" role="group" aria-label="Rubriken">' + cats.map(([k, t]) => '<button class="chip" data-act="newsCat" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + t + "</button>").join("") + '</div><div class="news">';
    const list = newsPick(n);
    if (!list.length) h += '<div class="meta">In dieser Rubrik gibt es noch keine Meldungen.</div>';
    for (const l of list) { const k = newsImg(l); h += '<article class="' + (l.kind === "bad" ? "bad" : "") + '">' + (k ? img(k, "thumb", "") : "") + "<time>" + E.dateStr(l.m) + (l.rum ? ' · <span class="rumtag">Gerücht</span>' : "") + "</time><h4>" + esc(l.head.replace(/^Gerücht: /, "")) + "</h4><p>" + esc(l.text) + "</p></article>"; }
    return h + "</div>";
  }

  /* ---------- Markt ---------- */
  function marktView() {
    let h = subnav("msub", marktSub, [["werbung", "Werbung"], ["rivalen", "Rivalen"], ["forschung", "Marktforschung"]]);
    if (marktSub === "rivalen") return h + rivalen();
    if (marktSub === "forschung") return h + forschung();
    return h + werbung();
  }
  function rivalen() {
    let h = '<h2>Die Konkurrenz</h2><p class="sub">Sechs Reedereien kämpfen mit Ihnen um die Fahrgäste. Jede hat ihre Stärken – und ihre Schwächen.</p>';
    for (const k of E.RIV_ORDER) {
      const R = E.RIV[k], st = E.rivState(S, k);
      const mine = S.routes.filter(r => { const i = E.rInfo(S, r); return i && E.rivalsOf(S, r, i).some(x => x.k === k); });
      let their = 0, dem = 0; for (const r of mine) if (r.last && r.last.riv) { their += r.last.riv[k] || 0; dem += r.last.D || 0; }
      h += '<div class="item rival">' + img(R.img, "rivimg", R.name) + '<div class="rtxt"><h3>' + R.name + '</h3><div class="meta">' + R.city + " · Pünktlichkeit etwa " + Math.round(E.RIV_PK[k] * 100) + " % bei ruhiger See" + '</div><div class="pro">＋ ' + R.strong + '</div><div class="con">− ' + R.weak + "</div>" +
        '<div class="meta" style="margin-top:4px">' + (mine.length ? "Auf " + mine.length + " Ihrer Linien" + (dem ? ", dort etwa " + pct(their / dem) + " der Fahrgäste" : "") + "." : "Noch keine gemeinsamen Linien.") + (st.mood >= 3 ? " Ist auf Sie nicht gut zu sprechen." : st.mood >= 1 ? " Beobachtet Sie genau." : "") + "</div></div></div>";
    }
    return h;
  }
  const MR_KEYS = ["Preis", "Tempo", "Komfort", "Ruf", "Erfahrungen", "Bekanntheit", "Küche", "Pünktlichkeit"];
  function forschung() {
    const st = E.staff(S);
    let h = img("ev_marktforschung", "banner", "Befragung am Kai") + "<h2>Marktforschung</h2>";
    const x = E.myExp(S);
    h += '<p class="sub">So erleben die Fahrgäste Ihre Reederei (50 ist Durchschnitt):</p><div class="expbars">' + [["Komfort", x[0]], ["Service", x[1]], ["Sicherheit", x[2]], ["Küche", S.exp && S.exp.ku != null ? S.exp.ku : 50], ["Pünktlichkeit", S.exp && S.exp.p != null ? S.exp.p : 50]].map(([n, v]) => '<div class="eb"><span>' + n + '</span><div class="meter"><i style="width:' + Math.round(v) + '%"></i></div><b>' + Math.round(v) + "</b></div>").join("") + "</div>";
    if (!st.markt) return h + '<div class="hint">Für die Auswertung einzelner Linien brauchen Sie eine Marktforschungsabteilung. Sie können sie unter Kontor → Personal einstellen.</div>';
    const routes = S.routes.filter(r => E.rInfo(S, r));
    if (!routes.length) return h + '<div class="hint">Noch keine Linien.</div>';
    if (!mrRoute || !routes.some(r => r.id === mrRoute)) mrRoute = routes[0].id;
    h += '<label class="field" for="mrsel">Linie</label><select id="mrsel" data-act="mrsel">' + routes.map(r => '<option value="' + r.id + '"' + (r.id === mrRoute ? " selected" : "") + ">" + esc(E.rInfo(S, r).name) + "</option>").join("") + "</select>";
    const r = routes.find(z => z.id === mrRoute), mr = E.marketResearch(S, r);
    if (!mr) return h;
    const info = E.rInfo(S, r);
    h += '<p class="sub" style="margin-top:10px">Betrachtet wird die wichtigste Kundschaft: ' + E.clsName(mr.cls, info.ocean) + ". Positive Werte ziehen Fahrgäste an, negative treiben sie fort.</p>";
    const cols = [{ n: "Sie", row: mr.me }].concat(mr.riv.map(q => ({ n: q.name, row: q.row })));
    h += '<div class="tblwrap"><table class="stat mr"><thead><tr><th>Grund</th>' + cols.map(c => '<th class="n">' + esc(c.n) + "</th>").join("") + "</tr></thead><tbody>" +
      MR_KEYS.map(k => "<tr><td>" + k + "</td>" + cols.map(c => { if (!c.row) return '<td class="n">–</td>'; const v = c.row[k] || 0; return '<td class="n ' + (v > .05 ? "pos" : v < -.05 ? "neg" : "") + '">' + (v > 0 ? "+" : "") + v.toFixed(2).replace(".", ",") + "</td>"; }).join("") + "</tr>").join("") +
      '<tr class="tot"><td>Anteil der Reisenden</td><td class="n">' + pct(mr.share) + "</td>" + mr.riv.map(q => '<td class="n">' + pct(mr.rivShare[q.k] || 0) + "</td>").join("") + "</tr></tbody></table></div>";
    if (mr.me && mr.riv.length) {
      const avg = k => mr.riv.reduce((a, q) => a + q.row[k], 0) / mr.riv.length, diff = MR_KEYS.map(k => [k, mr.me[k] - avg(k)]).sort((a, b) => b[1] - a[1]);
      const good = diff.filter(d => d[1] > .05).slice(0, 2).map(d => d[0]), bad = diff.filter(d => d[1] < -.05).slice(-2).reverse().map(d => d[0]);
      h += '<div class="report"><b>Warum Fahrgäste zu Ihnen kommen:</b> ' + (good.length ? good.join(" und ") : "nichts Besonderes – Sie sind eine Wahl unter vielen") + '.<br><b>Warum sie zur Konkurrenz gehen:</b> ' + (bad.length ? bad.join(" und ") : "kaum ein Grund") + ".</div>";
    } else if (!mr.me) h += '<div class="hint">Auf dieser Linie fahren gerade keine eigenen Schiffe.</div>';
    return h;
  }

  /* ---------- Saisonfahrplan ---------- */
  const MON3 = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  function planBox(sh) {
    const plan = sh.plan || [], t = E.TYPES[sh.type];
    const opts = sel => '<option value=""' + (sel === "" ? " selected" : "") + ">aufgelegt</option>" + S.routes.filter(r => !E.canServe(S, sh.type, r.a, r.b, r.cruise, r.stops)).map(r => '<option value="' + r.id + '"' + (sel === r.id ? " selected" : "") + ">" + esc(E.rInfo(S, r).name) + "</option>").join("");
    const mSel = (i, f, v) => '<select data-act="plan" data-id="' + sh.id + '" data-i="' + i + '" data-f="' + f + '">' + MON3.map((n, j) => '<option value="' + j + '"' + (j === v ? " selected" : "") + ">" + n + "</option>").join("") + "</select>";
    let strip = '<div class="planstrip">';
    for (let mo = 0; mo < 12; mo++) { const p = plan.findIndex(x => x.from <= x.to ? mo >= x.from && mo <= x.to : mo >= x.from || mo <= x.to); strip += '<i class="p' + (p < 0 ? "x" : plan[p].line ? p : "l") + (mo === E.cal(S.m).mo ? " now" : "") + '" title="' + MON3[mo] + '">' + MON3[mo][0] + "</i>"; }
    strip += "</div>";
    let h = '<details class="story plan"' + (openPlan[sh.id] ? " open" : "") + ' data-plan="' + sh.id + '"><summary>Saisonfahrplan' + (plan.length ? " · " + plan.length + (plan.length > 1 ? " Zeiträume" : " Zeitraum") : "") + "</summary>" + strip;
    plan.forEach((p, i) => { h += '<div class="planrow"><span class="pdot p' + (p.line ? i : "l") + '"></span>' + mSel(i, "from", p.from) + "<span>bis</span>" + mSel(i, "to", p.to) + '<select data-act="plan" data-id="' + sh.id + '" data-i="' + i + '" data-f="line">' + opts(p.line) + '</select><button class="btn" data-act="planDel" data-id="' + sh.id + '" data-i="' + i + '" aria-label="Zeitraum löschen">✕</button></div>'; });
    if (plan.length < 3) h += '<div class="actions"><button class="btn" data-act="planAdd" data-id="' + sh.id + '">Zeitraum hinzufügen</button></div>';
    h += '<div class="meta">Zu Monatsbeginn wechselt das Schiff automatisch. Die Überfahrt zur neuen Linie dauert je nach Entfernung einige Tage. Monate ohne Eintrag bleiben unverändert.</div></details>';
    return h;
  }
  const openPlan = {};

  /* ---------- Fahrgastströme ---------- */
  function flows(a) {
    const out = [];
    for (const b of Object.keys(E.PORTS)) {
      if (b === a) continue;
      const i = E.routeInfo(S, a, b); if (!i || i.D0 < 150) continue;
      out.push({ b, i, D: Math.round(i.D0 * (1 + .025 * S.m / 12) * S.konj) });
    }
    return out.sort((x, y) => y.D - x.D).slice(0, 10);
  }
  function flowBox(a) {
    const fl = flows(a); if (!fl.length) return "";
    const mx = fl[0].D;
    let h = '<div class="flows"><h4>Fahrgastströme ab ' + esc(E.PORTS[a].name) + "</h4>" + flowMap(a, fl) + '<div class="tblwrap"><table class="stat flow"><thead><tr><th>Ziel</th><th class="n">Reisende/Monat</th><th>Kundschaft</th><th>Typ</th></tr></thead><tbody>';
    for (const f of fl) h += '<tr data-act="pickB" data-b="' + f.b + '"><td><b>' + esc(E.PORTS[f.b].name) + '</b><div class="fbar"><i style="width:' + Math.round(f.D / mx * 100) + '%"></i></div></td><td class="n">' + E.fmt(f.D) + "</td><td>" + esc(f.i.who.split(",")[0].replace(/ \d+ %$/, "")) + "</td><td>" + f.i.kind.cat + "</td></tr>";
    return h + '</tbody></table></div><div class="meta">' + (DESK ? "Klicken" : "Tippen") + ' Sie auf ein Ziel, um es zu übernehmen.</div></div>';
  }
  function flowMap(a, fl) {
    const cfg = MAIN, P = (lat, lon) => [(lon - cfg.lon0) / (cfg.lon1 - cfg.lon0) * cfg.W, (cfg.lat1 - lat) / (cfg.lat1 - cfg.lat0) * cfg.H], XY = id => P(...Wd.coord(id)), mx = fl[0].D;
    let o = '<svg class="map" viewBox="0 0 ' + cfg.W + " " + cfg.H + '"><defs><path id="land-flow" d="' + ((window.MAPDATA || {}).main || "") + '"/></defs><rect width="' + cfg.W + '" height="' + cfg.H + '" fill="var(--sea)"/><use href="#land-flow" fill="var(--land)" stroke="var(--coast)" stroke-width=".5"/>';
    for (const f of fl.slice().reverse()) { const pts = f.i.path.nodes.map(XY); o += '<polyline points="' + pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ") + '" fill="none" stroke="var(--brass-2)" stroke-opacity=".85" stroke-width="' + (1 + 5 * f.D / mx).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
    const pa = XY(a); o += '<circle cx="' + pa[0].toFixed(1) + '" cy="' + pa[1].toFixed(1) + '" r="4" fill="var(--ink)"/>';
    return o + "</svg>";
  }

  /* ---------- Kapitäne ---------- */
  const stars = L => "★".repeat(L) + "☆".repeat(5 - L);
  function capTitle(c) { return c.sp ? E.SPECIAL_CAPS[c.sp].title : E.CAP_SPEC[c.spec].name + " – " + E.CAP_SPEC[c.spec].fx; }
  function capBox(sh) {
    const c = E.capOf(S, sh);
    let h = '<div class="capbox">';
    if (!c) {
      h += '<div class="captxt"><b>Kein Kapitän</b><div class="meta">Ohne Kapitän kein Bonus. Weisen Sie einen aus der Reserve zu.</div></div>';
    } else {
      const L = E.capLevel(c), nx = E.CAP_XP[L], pr = L >= 5 ? 1 : (c.xp - E.CAP_XP[L - 1]) / (nx - E.CAP_XP[L - 1]);
      h += img(c.img, "capimg", c.name) + '<div class="captxt"><b>' + esc(c.name) + '</b><div class="stars">' + stars(L) + "</div><div class=\"meta\">" + esc(capTitle(c)) + "</div>" +
        (c.sp ? '<div class="meta">' + esc(E.SPECIAL_CAPS[c.sp].fx) + "</div>" : '<div class="xp"><i style="width:' + Math.round(pr * 100) + '%"></i></div><div class="meta">' + (L >= 5 ? "Höchste Stufe erreicht" : "Erfahrung " + c.xp + " von " + nx + " Tagen auf See") + "</div>") +
        '<div class="meta">' + (E.capPay(S, c) > 1 ? "Zuschlag " + M(E.capPay(S, c)) + " im Monat" : "kein Zuschlag") + (c.bound ? " · fest an dieses Schiff gebunden" : "") + "</div></div>";
    }
    h += "</div>";
    if (c && c.sp && E.SPECIAL_CAPS[c.sp].story) h += '<details class="story"><summary>Die wahre Geschichte</summary><p>' + esc(E.SPECIAL_CAPS[c.sp].story) + "</p></details>";
    if (!c || !c.bound) {
      const others = E.caps(S).filter(x => x !== c && !x.bound);
      if (others.length || c) {
        h += '<select data-act="capswap" data-id="' + sh.id + '" aria-label="Kapitän wechseln"><option value="">Kapitän wechseln …</option>' + (c ? '<option value="__res">' + esc(c.name) + " in die Reserve schicken</option>" : "") +
          others.map(x => { const on = x.ship ? S.ships.find(y => y.id === x.ship) : null; return '<option value="' + x.id + '">' + (on ? "Tauschen mit „" + esc(on.name) + "“: " : "Reserve: ") + esc(x.name) + " (Stufe " + E.capLevel(x) + ")</option>"; }).join("") + "</select>";
      }
    }
    return h;
  }
  function capList() {
    const all = E.caps(S);
    let h = '<h2>Kapitäne</h2><p class="sub">Kapitäne sammeln mit jedem Tag auf See Erfahrung und steigen bis Stufe 5 auf. Jede Stufe verstärkt ihren Schwerpunkt und hilft in Seenot. Die Grundheuer steckt in der Heuer der Mannschaft; erfahrene Kapitäne verlangen einen Zuschlag. Reserve-Kapitäne erhalten ein Wartegeld.</p>';
    if (!all.length) h += '<div class="hint">Noch keine Kapitäne. Jedes neue Schiff bringt einen mit.</div>';
    for (const c of all) {
      const on = c.ship ? S.ships.find(y => y.id === c.ship) : null;
      h += '<div class="eqrow capline">' + img(c.img, "capmini", c.name) + '<span style="flex:1"><b>' + esc(c.name) + '</b> <span class="stars">' + stars(E.capLevel(c)) + '</span><br><span class="meta">' + esc(c.sp ? E.SPECIAL_CAPS[c.sp].title : E.CAP_SPEC[c.spec].name) + " · " + (on ? "„" + esc(on.name) + "“" : "Reserve") + " · " + M(E.capPay(S, c)) + "/Monat</span></span>" +
        (!c.ship && !c.bound ? '<button class="btn" data-act="capfire" data-id="' + c.id + '">Entlassen</button>' : "") + "</div>";
    }
    h += '<div class="actions"><button class="btn" data-act="caphire">Kapitän anwerben (' + M(Math.round(1500 * S.pidx / 100) * 100) + ")</button></div>";
    return h;
  }

  /* ---------- Einführung: Grundkurs und Kapitel (v4.6) ---------- */
  const tapW = (d, m) => DESK ? d : m;
  const TUT = [
    { get t() { return "Willkommen in Ihrem Kontor! Die Zeit steht still, bis Sie sie starten. Eröffnen wir zuerst eine Linie: " + tapW("Klicken Sie links auf „Linien“ (Taste L).", "Tippen Sie unten auf „Linien“."); }, sel: '#tabs [data-tab="linien"]', ok: () => tab === "linien" },
    { get t() { return "Wählen Sie Start und Ziel. Für den Anfang eignet sich eine kurze Fähre, zum Beispiel " + ({ ham: "Hamburg – Blankenese", lpl: "Liverpool – Birkenhead", lon: "London – Gravesend" }[S.home || "ham"]) + ". Die Tabelle zeigt, wohin viele Menschen reisen wollen. Dann " + tapW("auf „Linie eröffnen“ klicken.", "„Linie eröffnen“ tippen."); }, get sel() { return tab === "linien" ? '[data-act="openRoute"]' : '#tabs [data-tab="linien"]'; }, ok: () => S.routes.length > 0 },
    { get t() { return "Jetzt fehlt ein Schiff. " + tapW("Klicken Sie auf „Werft“ (Taste W)", "Tippen Sie auf „Werft“") + ", klappen Sie „Hafen, Küste und Fähren“ auf und bestellen Sie ein passendes Schiff. Eine Hafenfähre ist billig und robust."; }, get sel() { return tab === "werft" ? '[data-act="buyNew"]' : '#tabs [data-tab="werft"]'; }, ok: () => S.ships.length > 0 },
    { t: "In der „Flotte“ weisen Sie dem Schiff die Linie zu, über das Auswahlfeld „Linie“. Neubauten brauchen ein paar Monate, die Zuweisung gilt ab der Ablieferung.", get sel() { return tab === "flotte" ? '[data-act="line"]' : '#tabs [data-tab="flotte"]'; }, ok: () => S.ships.some(x => x.line) },
    { get t() { return "Starten Sie die Zeit: " + tapW("oben am Maschinentelegrafen auf „Langsam“ klicken oder die Leertaste drücken.", "unten am Maschinentelegrafen auf „Langsam“ tippen.") + " Ein Tag dauert dann vier Sekunden. Ereignisse halten die Zeit automatisch an."; }, sel: '#tele [data-act="speed"][data-v="1"]', ok: () => S.speed > 0 },
    { t: "Im Kontor zeigt das Hauptbuch Tag für Tag Einnahmen und Kosten. Die Fahrgäste zahlen bei der Abfahrt, die Kohle kostet beim Bekohlen – das Geld kommt also in Schüben. Die Zinsen Ihres Gründungskredits laufen schon.", get sel() { return tab === "kontor" ? "#ledger" : '#tabs [data-tab="kontor"]'; }, next: true },
    { t: "Ihre Schiffe fahren nach Fahrplan. Unter Kontor → Abfahrten sehen Sie, wann sie ablegen, wie voll sie wohl werden und wie pünktlich sie ankommen.", get sel() { return tab === "kontor" ? '[data-act="ksub"][data-v="abfahrten"]' : '#tabs [data-tab="kontor"]'; }, next: true },
    { t: "Das war der Grundkurs. Wenn Sie einen Bereich zum ersten Mal öffnen – Werft, Flotte, Abfahrten, Einkauf, Personal, Markt, Zeitung oder Börse –, erklärt Ihnen der Berater dort das Wichtigste in wenigen Schritten. Viel Erfolg!", next: true, last: true },
  ];
  const CHAP = {
    werft: { name: "Werft", when: () => tab === "werft", go: () => { tab = "werft"; }, steps: [
      { t: "Hier bestellen Sie Neubauten. Die Schiffe sind nach Einsatz sortiert: Hafen, Küste und Fähren, Nord- und Ostsee, Übersee. Ältere Bauarten stehen jeweils am Ende.", sel: "main details.sec" },
      { t: "Ein Neubau braucht einige Monate. Sie zahlen bar mit 3 % Skonto oder mit Kredit von Bank oder Werft – die Raten laufen erst ab der Ablieferung. Mehrere Schiffe einer Bauart bestellen Sie als Serie mit Rabatt; die Werft liefert sie nacheinander.", sel: '[data-act="buyNew"]' },
      { t: "Gebrauchte Schiffe sind sofort da und billiger, aber älter. Ein Gutachten verrät ihren wahren Zustand, bevor Sie kaufen.", sel: '[data-act="buyUsed"]' } ] },
    flotte: { name: "Flotte", when: () => tab === "flotte" && flSub === "schiffe" && S.ships.some(x => !x.museum), go: () => { tab = "flotte"; flSub = "schiffe"; }, steps: [
      { t: "Jedes Schiff hat hier seine Karte: Linie, Wartung, Versicherung und Zustand. " + "Aufklappen zeigt alle Einstellungen.", sel: "main details.sec" },
      { t: "Die Reederei-Fahrstufe gilt für die ganze Flotte: Sparfahrt spart Kohle, Volldampf schafft mehr Fahrten. Einzelne Schiffe können Sie ausnehmen.", sel: "main .item.fahrt" },
      { t: "Aufgeklappt zeigt jedes Schiff, wo es gerade ist, wann es abfährt und wie viel Kohle es im Bunker hat. Mit „Ankunft melden“ hält die Zeit an, wenn es ankommt." },
      { t: "Bäderlinien lohnen nur im Sommer. Mit dem Saisonfahrplan liegt ein Schiff im Winter auf und spart Kohle und drei Viertel der Heuer.", sel: '[data-act="planAdd"]' },
      { t: "Läuft die Frist eines Schiffs ab, darf es nicht mehr auslaufen. Erneuern Sie sie rechtzeitig – oder stellen Sie unter Kontor → Personal einen Schiffsinspektor ein, der das übernimmt." } ] },
    einkauf: { name: "Einkauf", old: true, when: () => tab === "kontor" && kontorSub === "einkauf", go: () => { tab = "kontor"; kontorSub = "einkauf"; }, steps: [
      { t: "Hier kaufen Sie Kohle und Verpflegung für die ganze Reederei. Oben steht der Kohlepreis mit seinem Verlauf.", sel: '[data-tut="coal"]' },
      { t: "Die Kohle bezahlen Sie beim Bekohlen, und jeder Hafen hat seinen Preis: nah an den Zechen billig, in der Ferne teuer. Die Regel legt fest, wo Ihre Schiffe volltanken.", sel: '[data-tut="bunk"]' },
      { t: "Ein Liefervertrag gilt für einen Hafen und sichert den heutigen Preis mit Aufschlag. Er lohnt sich, wenn die Kohle danach teurer wird – und kostet, wenn sie billiger wird.", sel: '[data-tut="coalnew"]' },
      { t: "Die Verpflegung stellen Sie je Klasse ein. In der 1. Klasse zählt gutes Essen viel, im Zwischendeck wenig. Auf kurzen Fähren gibt es keine Mahlzeiten.", sel: '[data-tut="kq"]' },
      { t: "Vor jeder Änderung rechnet eine Vorschau die nächsten zwei Monate mit der neuen Einstellung voraus. So probieren Sie ohne Risiko." } ] },
    abfahrten: { name: "Abfahrten", old: true, when: () => tab === "kontor" && kontorSub === "abfahrten", go: () => { tab = "kontor"; kontorSub = "abfahrten"; }, steps: [
      { t: "Ihre Schiffe fahren nach Fahrplan: Abfahrt, Seezeit, Ankunft, Liegezeit. Die Tafel zeigt die nächsten Abfahrten mit erwarteter Verspätung und Auslastung, darunter die letzten Fahrten mit ihrem Ergebnis.", sel: "main .banner" },
      { t: "Die Fahrgäste sammeln sich bis zur nächsten Abfahrt und zahlen beim Einsteigen. Wer zu lange warten muss oder keinen Platz bekommt, fährt mit der Konkurrenz – Kaufleute schneller als Auswanderer." },
      { t: "Sturm, Nebel, Eis, Streiks und Pannen verspäten die Schiffe. Ab zwei Tagen Verspätung zahlen Sie Entschädigung, und eine unpünktliche Linie verliert für Monate Fahrgäste an pünktlichere Rivalen." },
      { t: "Dagegen helfen Pufferzeit, ein Reserveschiff, Volldampf zum Aufholen, gutes Maschinenpersonal und gründliche Wartung – jedes Mittel kostet etwas. Puffer, Reserve und Aufholen stellen Sie je Linie unter „Linien“ ein." },
      { t: "Kohle kostet erst beim Bekohlen, nah an den Zechen billig, in der Ferne teuer. Wo Ihre Schiffe volltanken, legen Sie unter Kontor → Einkauf fest." },
      { t: "Hier unten bestimmen Sie, wann die Zeit von selbst anhält: bei großer Verspätung, wenn die Kohle knapp wird, am Monatsende oder wenn ein markiertes Schiff ankommt.", sel: '[data-tut="pause"]' } ] },
    personal: { name: "Personal", when: () => tab === "kontor" && kontorSub === "personal", go: () => { tab = "kontor"; kontorSub = "personal"; }, steps: [
      { t: "Deck, Maschine und Service bezahlen Sie nach Lohnstufe. Knapp bezahlte Leute machen mehr Fehler und streiken öfter, gut bezahlte bringen spürbare Vorteile.", sel: "main .item" },
      { t: "Jedes Schiff hat einen Kapitän. Mit den Jahren sammelt er Erfahrung – erfahrene Kapitäne fahren sicherer.", sel: "main .capline" },
      { t: "Angestellte im Kontor nehmen Ihnen Arbeit ab: der Schiffsinspektor Fristen und Docken, später Maschineninspektor, Kohleneinkäufer, Proviantmeister und Prokurist. Jeder kostet ein festes Gehalt.", sel: '[data-tut="kontorstaff"]' } ] },
    markt: { name: "Markt", when: () => tab === "werbung", go: () => { tab = "werbung"; marktSub = "werbung"; }, steps: [
      { t: "Wer bekannt ist, wird gebucht. Unter Werbung schalten Sie Anzeigen, Agenturen und Kampagnen für einzelne Linien.", sel: '[data-act="msub"][data-v="werbung"]' },
      { t: "Unter Rivalen sehen Sie, wer auf Ihren Linien fährt, was er gut kann und wie er auf Ihren Erfolg reagiert.", sel: '[data-act="msub"][data-v="rivalen"]' },
      { t: "Die Marktforschung zeigt für jede Linie, warum Fahrgäste zu Ihnen kommen oder zur Konkurrenz gehen. Dafür brauchen Sie die Abteilung unter Kontor → Personal.", sel: '[data-act="msub"][data-v="forschung"]' } ] },
    zeitung: { name: "Zeitung", when: () => DESK || (tab === "kontor" && kontorSub === "uebersicht" && S.ships.length > 0), go: () => { tab = "kontor"; kontorSub = "uebersicht"; }, steps: [
      { get t() { return "Die Zeitung " + (DESK ? "rechts" : "unten im Kontor") + " meldet, was in der Welt der Schifffahrt passiert. Mit den Rubriken filtern Sie: Eigene, Schifffahrt und später Börse."; }, sel: ".newschips" },
      { t: "Der Kurszettel zeigt den Kohlepreis und, sobald die Börse für Sie offen ist, Ihre wichtigsten Kurse. Ein Tipp darauf führt zum Einkauf oder zur Aktie.", sel: ".ticker" },
      { t: "Seenot, Unglücke und Ihre Entscheidungen bleiben immer sichtbar. Gerüchte tragen den Zusatz „Gerücht“ – nicht alle stimmen." } ] },
    boerse: { name: "Börse", old: true, when: () => tab === "kontor" && kontorSub === "boerse" && S.bo && S.bo.on, go: () => { tab = "kontor"; kontorSub = "boerse"; }, steps: [
      { t: "Willkommen an der Börse. Hier handeln Sie Aktien der Rivalen, der Zechen, der Werft und der Caterer. Der Kurs folgt dem Gewinn der Firma und der Stimmung am Markt.", sel: ".bolist" },
      { get t() { return tapW("Ein Klick", "Ein Tipp") + " auf eine Aktie öffnet sie: Kurs, Verlauf, Kaufen und Verkaufen – nach Stückzahl oder Betrag. Jeder Auftrag kostet 1 % Gebühr, gekauft wird nur bar."; }, sel: ".borow" },
      { t: "Im Mai zahlen Firmen mit gutem Vorjahr eine Dividende. Wer mehr als die Hälfte einer Zeche hält, bunkert für seine Kohleschiffe 20 % billiger – das lohnt sich erst für große Flotten.", sel: ".bokv" },
      { t: "Ein Prokurist verwaltet auf Wunsch ein eigenes Depot und schätzt Gerüchte ein. Bedenken Sie: Aktien bringen im Schnitt weniger als eine gut laufende Linie.", sel: ".pkbox" } ] },
  };
  const CHAP_ORDER = ["werft", "flotte", "abfahrten", "einkauf", "personal", "markt", "zeitung", "boerse"];
  function tutState() { if (!S) return null; const T = S.tut || (S.tut = { done: true }); T.ch = T.ch || {}; return T; }
  function tutCur() {
    const T = tutState(); if (!T || T.off) return null;
    if (!T.done) { const st = TUT[T.step]; return st ? { st, i: T.step, n: TUT.length, base: true } : null; }
    // ein Kapitel ruht, solange man den Bereich verlassen hat, und geht weiter, wenn man zurückkommt
    if (T.cur && CHAP[T.cur.k]) { const C = CHAP[T.cur.k], st = C.steps[T.cur.i]; return st && C.when() ? { st, i: T.cur.i, n: C.steps.length, name: C.name } : null; }
    return null;
  }
  function tutBox() {
    const c = tutCur(); if (!c || sheet || (S.pending.length && E.duePending(S))) return "";
    const st = c.st, last = c.base ? !!st.last : c.i === c.n - 1, canNext = c.base ? (st.next || S.tut.held) : true;
    const dots = '<span class="tutdots" aria-hidden="true">' + Array.from({ length: c.n }, (_, i) => '<i class="' + (i === c.i ? "on" : i < c.i ? "done" : "") + '"></i>').join("") + "</span>";
    return '<div class="tut" role="status">' + img("ev_berater", "tutimg", "Berater") + '<div class="tuttxt"><div class="kicker">' + (c.base ? "Grundkurs" : "Einführung · " + c.name) + " · Schritt " + (c.i + 1) + " von " + c.n + dots + "</div><p>" + st.t + '</p><div class="tutbtn">' +
      (c.i > 0 ? '<button class="btn" data-act="tutBack">Zurück</button>' : "") + (canNext ? '<button class="btn solid" data-act="tutNext">' + (last ? "Fertig" : "Weiter") + "</button>" : "") +
      '<button class="btn" data-act="tutSkip">Überspringen</button><button class="btn linkish" data-act="tutOff">Tipps aus</button></div></div></div>';
  }
  function tutCheck() {
    const T = tutState(); if (!T || T.off) return false;
    if (!T.done) {
      const st = TUT[T.step];
      if (st && st.ok && !T.held && st.ok()) { T.step++; if (T.step >= TUT.length) T.done = true; return true; }
      return false;
    }
    if (T.cur || sheet || (S.pending.length && E.duePending(S))) return false;
    for (const k of CHAP_ORDER) { const C = CHAP[k]; if (!T.ch[k] && (T.full || C.old) && C.when()) { T.cur = { k, i: 0 }; return true; } }
    return false;
  }
  function tutAct(a) {
    const T = tutState(); if (!T) return;
    if (a === "tutOff") { T.off = true; T.done = true; T.cur = null; return; }
    if (!T.done) {
      if (a === "tutNext") { T.held = false; T.step++; if (T.step >= TUT.length) T.done = true; }
      else if (a === "tutBack") { T.step = Math.max(0, T.step - 1); T.held = true; }
      else if (a === "tutSkip") { T.done = true; T.held = false; }
      return;
    }
    if (!T.cur) return;
    const C = CHAP[T.cur.k];
    if (a === "tutNext") { T.cur.i++; if (T.cur.i >= C.steps.length) { T.ch[T.cur.k] = 1; T.cur = null; } }
    else if (a === "tutBack") T.cur.i = Math.max(0, T.cur.i - 1);
    else if (a === "tutSkip") { T.ch[T.cur.k] = 1; T.cur = null; }
  }
  function tutReplay(k) {
    const T = tutState(); T.off = false;
    if (k === "grund") { T.done = false; T.step = 0; T.held = true; T.cur = null; tab = "kontor"; return; }
    if (!CHAP[k]) return;
    T.done = true; T.cur = { k, i: 0 }; CHAP[k].go();
  }
  // Messingrahmen um den Bereich, um den es geht; ist er nicht zu sehen, scrollt die Ansicht hin
  let tutGlowKey = "";
  function tutGlow() {
    document.querySelectorAll(".tutglow").forEach(e => e.classList.remove("tutglow"));
    const c = tutCur(); if (!c || sheet || (S.pending.length && E.duePending(S))) { tutGlowKey = ""; return; }
    const sel = c.st.sel; if (!sel) return;
    const el = Array.from(document.querySelectorAll(sel)).find(e => e.offsetParent !== null || e.getClientRects().length);
    if (!el) return;
    el.classList.add("tutglow");
    const key = (c.base ? "b" : c.name) + c.i + sel;
    if (key === tutGlowKey) return; tutGlowKey = key;
    const r = el.getBoundingClientRect(), box = document.querySelector("#tutbox .tut"), bottom = window.innerHeight - (box ? box.getBoundingClientRect().height + 30 : 160) - (DESK ? 0 : 150), top = DESK ? 80 : 70;
    if (r.top < top || r.bottom > bottom) { const scroller = el.closest(".side") || null; try { if (scroller) el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); else window.scrollTo({ top: Math.max(0, window.scrollY + r.top - Math.max(top, (bottom - r.height) / 2)), behavior: reduceMotion ? "auto" : "smooth" }); } catch (e) { el.scrollIntoView(); } }
  }
  function tutList() {
    const T = tutState();
    return '<details class="sec" data-sec="tut"' + (openSec.tut ? " open" : "") + '><summary><span>Einführung</span><span class="cnt">' + (T.off ? "Tipps aus" : "") + "</span></summary>" +
      '<p class="meta">Jedes Kapitel lässt sich hier neu abspielen. ' + (T.off ? "Die Tipps sind ausgeschaltet; ein Kapitel zu starten schaltet sie wieder ein." : "") + '</p><div class="tutlist">' +
      [["grund", "Grundkurs"]].concat(CHAP_ORDER.filter(k => k !== "boerse" || (S.bo && S.bo.on)).map(k => [k, CHAP[k].name])).map(([k, n]) => '<button class="btn" data-act="tutReplay" data-v="' + k + '">' + (k !== "grund" && T.ch[k] ? "✓ " : "") + n + "</button>").join("") + "</div></details>";
  }
  /* ---------- Baukasten-Bild ---------- */
  const KIT = { hull_s: [265, 76], hull_m: [360, 81], hull_l: [470, 101], sup_haus: [291, 109], sup_salon: [310, 114], sup_sonne: [330, 95], fun_hoch: [197, 240], fun_motor: [163, 132], mast: [186, 261], rad: [306, 134], boote: [264, 151] };
  function kitLayers(d, boats) {
    const b = E.TYPES[d.base] || { seats: 300 }, hk = b.seats < 300 ? "hull_s" : b.seats < 800 ? "hull_m" : "hull_l";
    const hullW = { hull_s: 470, hull_m: 560, hull_l: 600 }[hk] * (d.hull === "schlank" ? 1.06 : d.hull === "bauchig" ? .97 : 1);
    const hf = d.hull === "schlank" ? .94 : d.hull === "bauchig" ? 1.1 : 1, wl = 270, L = [];
    const byW = (k, w) => ({ k, w, h: KIT[k][1] * w / KIT[k][0] }), byH = (k, h) => ({ k, h, w: KIT[k][0] * h / KIT[k][1] });
    const hull = byW(hk, hullW); hull.h *= hf;
    const x0 = (920 - hullW) / 2, hy = wl - hull.h * .70;
    const sk = d.interior === "komfort" ? "sup_salon" : d.extras && d.extras.sonne ? "sup_sonne" : "sup_haus";
    const sup = byW(sk, hullW * (sk === "sup_sonne" ? .82 : .78)), sx = x0 + hullW * .09, sy = hy - sup.h + hull.h * (sk === "sup_sonne" ? .2 : .16);
    const mast = byH("mast", sup.h * 1.8); L.push(Object.assign(mast, { x: sx + sup.w - mast.w * .62, y: sy + sup.h - mast.h }));
    const fk = d.drive === "motor" ? "fun_motor" : "fun_hoch";
    for (let i = 0; i < (d.funnels || 1); i++) { const f = byH(fk, sup.h * .85 * (fk === "fun_motor" ? 1.1 : 1)); L.push(Object.assign(f, { x: sx + sup.w * (.36 + .2 * i) - f.w / 2, y: sy - f.h + sup.h * .30 })); }
    L.push(Object.assign(sup, { x: sx, y: sy }));
    if (boats) { const bt = byW("boote", hullW * .22); L.push(Object.assign(bt, { x: sx + sup.w * .03, y: sy - bt.h + sup.h * .45 })); }
    L.push(Object.assign(hull, { x: x0, y: hy }));
    if (d.drive === "rad") { const r = byW("rad", hullW * .28); L.push(Object.assign(r, { x: x0 + hullW * .42, y: hy - r.h * .42 })); }
    return L;
  }
  function kitHTML(d, boats, cls) {
    const L = kitLayers(d, boats), pct = (v, of) => (v / of * 100).toFixed(2) + "%";
    const layer = L.map(l => '<img src="' + (A["kit_" + l.k] || "") + '" alt="" style="left:' + pct(l.x, 920) + ";top:" + pct(l.y, 400) + ";width:" + pct(l.w, 920) + '">').join("");
    return '<div class="kit ' + (cls || "") + '" role="img" aria-label="' + esc(d.name || "Eigener Entwurf") + '" style="background-image:url(' + (A.kit_bg || "") + ')"><div class="kl">' + layer + '</div><div class="kr">' + layer + "</div></div>";
  }
  function kitImg(typeKey, cls, sh) {
    const t = E.TYPES[typeKey], d = t && S && S.designs && S.designs[t.design]; if (!d) return "";
    return kitHTML(d, sh ? !!(sh.eq && sh.eq.boote) : true, cls);
  }

  /* ---------- Fähren-Konfigurator ---------- */
  let draft = null;
  function designNew() { const bases = E.designBases(S); draft = { base: bases[0], hull: "normal", drive: "dampf", interior: "einfach", extras: {}, funnels: 1, name: ({ en: "Design ", es: "Diseño " }[LANG] || "Entwurf ") + (Object.keys(S.designs || {}).length + 1) }; sheet = { kind: "design" }; }
  function designSheet() {
    const d = draft, bases = E.designBases(S), y = E.yearOf(S); if (!bases.includes(d.base)) d.base = bases[0]; d.year = y;
    const t = E.designType(d), price = Math.round(t.price * S.pidx / 1000) * 1000;
    const four = opts => opts.length === 4; // vier Knöpfe (Antrieb) in einer Zeile, wie bei der Werbung
    const seg = (key, opts) => '<div class="seg" role="group"' + (four(opts) ? ' style="grid-template-columns:repeat(4,1fr)"' : "") + ">" + opts.map(([v, n, dis]) => '<button data-act="dset" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (String(d[key]) === String(v)) + '"' + (dis ? " disabled" : "") + (four(opts) ? ' style="font-size:13.5px"' : "") + ">" + n + "</button>").join("") + "</div>";
    let h = '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">Fähren-Konfigurator</div><h3>Eigenen Entwurf zeichnen</h3>' + kitHTML(d, true, "big");
    h += '<label class="field" for="dbase">Grundtyp</label><select id="dbase" data-act="dbase">' + bases.map(k => '<option value="' + k + '"' + (k === d.base ? " selected" : "") + ">" + E.TYPES[k].name + " (" + E.TYPES[k].cls + ")</option>").join("") + "</select>";
    h += '<label class="field">Rumpf</label>' + seg("hull", [["schlank", "Schlank"], ["normal", "Normal"], ["bauchig", "Bauchig"]]);
    h += '<label class="field">Antrieb</label>' + seg("drive", [["dampf", "Dampf"], ["rad", "Raddampfer"], ["oel", "Ölfeuerung", y < 1912], ["motor", "Motor", y < 1912]]);
    h += '<label class="field">Einrichtung</label>' + seg("interior", [["einfach", "Einfach"], ["komfort", "Komfortabel"]]);
    h += '<label class="field">Extras</label>' + ["sonne", "laderaum", "eis"].map(k => '<label class="check"><input type="checkbox" data-act="dext" data-k="' + k + '"' + (d.extras[k] ? " checked" : "") + "> " + E.DES.extras[k].name + "</label>").join("");
    h += '<label class="field">Schornsteine</label>' + seg("funnels", [[1, "Einer"], [2, "Zwei"]]);
    h += '<label class="field" for="dname">Name des Entwurfs</label><input class="name" id="dname" value="' + esc(d.name) + '" maxlength="24" autocomplete="off">';
    const b = E.TYPES[d.base];
    h += '<table class="fin" style="width:100%;margin-top:10px"><tr><td>Tempo</td><td>' + kn(t.speed) + " Knoten" + (Math.abs(t.speed - b.speed) > .05 ? ' <span class="meta">(Grundtyp ' + kn(b.speed) + ")</span>" : "") + "</td></tr><tr><td>Plätze</td><td>" + E.fmt(t.seats) + ' <span class="meta">(Grundtyp ' + E.fmt(b.seats) + ")</span></td></tr><tr><td>Komfort</td><td>" + "★".repeat(Math.round(t.comfort)) + "</td></tr><tr><td>Reichweite</td><td>" + E.fmt(t.range) + " sm" + (t.shallow ? " · flach gebaut" : "") + "</td></tr><tr><td>Kohle je Seemeile</td><td>" + kn(t.coal) + ' <span class="meta">(Grundtyp ' + kn(b.coal) + ")</span></td></tr><tr><td>Heuer im Monat</td><td>" + M(t.crew * S.wage) + "</td></tr><tr><td>Baupreis</td><td>" + M(price) + "</td></tr><tr><td>Bauzeit</td><td>" + t.build + " Monate</td></tr></table>";
    h += '<div class="meta" style="margin-top:6px">Gespeicherte Entwürfe finden Sie in der Werft. Jedes weitere Schiff desselben Entwurfs wird 8 % günstiger, höchstens 20 %.</div>';
    return h + '<div class="actions"><button class="btn solid" data-act="dsave" style="flex:1">Speichern und bestellen</button><button class="btn" data-act="close" style="flex:1">Abbrechen</button></div></div></div>';
  }
  function designList() {
    const ds = Object.values(S.designs || {}).filter(d => E.TYPES["d_" + d.id] && E.typeOpen(S, "d_" + d.id));
    let h = '<div class="actions" style="margin:4px 0 10px"><button class="btn solid" data-act="designNew">Eigenen Entwurf zeichnen</button></div>';
    for (const d of ds) {
      const k = "d_" + d.id, t = E.TYPES[k];
      h += '<div class="item">' + kitHTML(d, true) + '<div class="row"><h3>„' + esc(d.name) + '“</h3><span class="num">' + M(E.newPrice(S, k)) + "</span></div>" +
        '<div class="meta">Eigener Entwurf auf Basis ' + E.TYPES[d.base].name + " · " + kn(t.speed) + " Knoten · " + E.fmt(t.seats) + " Plätze · Komfort " + "★".repeat(Math.round(t.comfort)) + (d.built ? " · " + d.built + " gebaut, Serienrabatt " + Math.round((1 - E.seriesFactor(S, k)) * 100) + " %" : "") + "</div>" +
        '<div class="actions"><button class="btn solid" data-act="buyNew" data-type="' + k + '">Bestellen</button></div></div>';
    }
    return h;
  }

  /* ---------- Ausrüstung ab Werft im Bestelldialog ---------- */
  function factoryBox() {
    if (!sheet || sheet.kind !== "new") return "";
    sheet.eq = sheet.eq || {};
    const opts = E.factoryEqOptions(S, sheet.type); if (!opts.length) return "";
    return '<label class="field">Ausrüstung ab Werft</label>' + opts.map(o => '<label class="check"><input type="checkbox" data-act="feq" data-k="' + o.k + '"' + (sheet.eq[o.k] ? " checked" : "") + "> " + o.name + ' – ' + M(o.cost) + ' <span class="meta">(nachgerüstet ' + M(o.later) + ")</span></label>").join("");
  }

  /* ---------- Außer Dienst stellen ---------- */
  function retireSheet() {
    const sh = S.ships.find(x => x.id === sheet.id); if (!sh) { sheet = null; return ""; }
    const t = E.TYPES[sh.type], val = Math.round(E.shipValue(S, sh) * .9), parts = E.partsFor(S, sh), sel = sheet.parts || (sheet.parts = {});
    let h = '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true">' + img("ev_abwracken", "banner", "Abwrackwerft") + '<div class="kicker">' + t.name + " · " + Math.floor(sh.age / 12) + " Jahre</div><h3>„" + esc(sh.name) + "“ außer Dienst stellen</h3>";
    if (S.museum) h += '<button class="opt" data-act="retire" data-k="still"><b>Ins eigene Museum – stillgelegt</b><span>Ausstellungsstück, kostet kaum noch etwas</span></button><button class="opt" data-act="retire" data-k="aktiv"><b>Ins eigene Museum – betriebsfähig</b><span>für Nostalgiefahrten und Feste, deutlich teurer im Unterhalt</span></button>';
    else h += '<div class="meta" style="margin-bottom:6px">' + (E.museumUnlocked(S) ? "Mit einem eigenen Museum (Flotte → Museum) könnten Sie das Schiff selbst ausstellen." : "Ein eigenes Museum wird möglich, wenn Ihre Reederei 30 Jahre Geschichte hat.") + "</div>";
    h += '<button class="opt" data-act="retire" data-k="spende"><b>Einem Museum spenden</b><span>Ruf, Bekanntheit und Prestige steigen</span></button>';
    h += '<button class="opt" data-act="retire" data-k="verkauf"><b>Verkaufen – ' + M(val) + "</b><span>ein Käufer übernimmt das Schiff</span></button>";
    const pc = parts.filter(k => sel[k]).reduce((a, k) => a + E.partCost(S, sh, k), 0);
    h += '<label class="field">Abwracken – Teile fürs Museum behalten</label>' + parts.map(k => '<label class="check"><input type="checkbox" data-act="rpart" data-k="' + k + '"' + (sel[k] ? " checked" : "") + "> " + E.EXHIBITS[k].name + ' <span class="meta">– Ausbau ' + M(E.partCost(S, sh, k)) + "</span></label>").join("");
    h += '<div class="meta">Schrottwert ' + M(E.scrapValue(S, sh)) + (pc ? " · Ausbau der Teile " + M(pc) : "") + (S.museum ? " · Platz in der Ausstellung: " + (S.exhibits || []).length + " von " + E.hallSlots(S) : " · Teile werden eingelagert, bis Sie ein Museum haben") + "</div>";
    h += '<button class="opt warn" data-act="retire" data-k="abwracken"><b>Abwracken</b><span>' + (pc ? Object.keys(sel).filter(k => sel[k]).length + " Teile kommen ins Museum" : "alles geht an den Schrotthändler") + "</span></button>";
    return h + '<div class="actions"><button class="btn" data-act="close" style="width:100%">Abbrechen</button></div></div></div>';
  }

  /* ---------- Museum ---------- */
  let flSub = "schiffe";
  function museumView() {
    const M0 = S.museum, ex = S.exhibits || [];
    let h = "";
    if (!M0) {
      h += img("mus_hafen", "banner", "Museumshafen") + '<h2>Reederei-Museum</h2><p class="sub">Alte Schiffe ausstellen, Teile abgewrackter Schiffe zeigen, Eintritt verlangen – und mit betriebsfähigen Schiffen Nostalgiefahrten anbieten.</p>';
      if (ex.length) h += '<div class="hint">Eingelagert: ' + ex.length + " Exponat" + (ex.length > 1 ? "e" : "") + ".</div>";
      if (!E.museumUnlocked(S)) return h + '<div class="hint">Ein eigenes Museum wird möglich, wenn Ihre Reederei 30 Jahre Geschichte hat oder eines Ihrer Schiffe 30 Jahre alt ist.</div>';
      return h + '<div class="actions"><button class="btn solid" data-act="musBuild">Museum bauen (' + M(E.museumCost(S)) + ")</button></div>";
    }
    const ships = S.ships.filter(x => x.museum), slots = E.hallSlots(S), pr = E.MUS_PRICE;
    h += img("mus_hafen", "banner", "Museumshafen") + '<h2>Reederei-Museum</h2><p class="sub">Am Hafen von ' + esc(E.PORTS[S.home || "ham"].name) + " · seit " + E.dateStr(M0.built) + "</p>";
    h += '<div class="kv"><div><b>' + E.fmt(M0.vis || 0) + "</b><span>Besucher im Vormonat</span></div><div><b>" + M(M0.rev || 0) + "</b><span>Einnahmen im Vormonat</span></div></div>";
    h += '<label class="field">Eintrittspreis</label><div class="seg" role="group">' + pr.map((p, i) => '<button data-act="musPrice" data-v="' + i + '" aria-pressed="' + (M0.price === i) + '">' + p.name + "</button>").join("") + "</div>";
    h += '<div class="switch"><span>Nostalgiefahrten im Sommer<br><span class="meta">mit betriebsfähigen Museumsschiffen, Mai bis September</span></span><input type="checkbox" data-act="musTrips"' + (M0.trips ? " checked" : "") + "></div>";
    h += '<div class="actions"><button class="btn" data-act="musFest"' + (S.m - M0.fest < 12 ? " disabled" : "") + ">Museumsfest (" + M(Math.round(4000 * S.pidx / 100) * 100) + ")</button></div>";
    h += "<h2>Schiffe im Museum</h2>";
    if (!ships.length) h += '<div class="hint">Noch keine Schiffe. Alte Schiffe stellen Sie in der Flotte über „Außer Dienst stellen“ ins Museum.</div>';
    for (const sh of ships) {
      const t = E.TYPES[sh.type], rest = sh.restoreUntil > S.t;
      h += '<div class="item">' + img("ship_" + sh.type, "shipimg", t.name, sh) + '<div class="row"><h3>„' + esc(sh.name) + '“</h3><span class="tag ' + (sh.museum === "aktiv" ? "gold" : "") + '">' + (rest ? "In Restaurierung" : sh.museum === "aktiv" ? "Betriebsfähig" : "Stillgelegt") + "</span></div>" +
        '<div class="meta">' + t.name + " · " + Math.floor(sh.age / 12) + " Jahre</div>";
      if (rest) h += '<div class="hint">Restaurierung bis ' + E.dateAfter(S, sh.restoreUntil - S.t) + ".</div>";
      h += '<div class="actions">' + (sh.museum === "aktiv" ? '<button class="btn" data-act="musMode" data-id="' + sh.id + '" data-v="still">Stilllegen</button>' : '<button class="btn" data-act="musMode" data-id="' + sh.id + '" data-v="aktiv">Wieder flottmachen (' + E.restoreDays(sh) + " Tage, " + M(E.restoreCost(S, sh)) + ")</button>") + "</div></div>";
    }
    h += "<h2>Ausstellungshalle</h2>" + img("mus_halle", "banner", "Ausstellungshalle") + '<p class="sub">' + ex.length + " Exponat" + (ex.length === 1 ? "" : "e") + " · Platz für " + slots + (ex.length > slots ? " – die übrigen liegen im Magazin" : "") + "</p>";
    if (!ex.length) h += '<div class="hint">Noch leer. Beim Abwracken können Sie Glocken, Steuerräder, Maschinen und mehr behalten.</div>';
    for (const e of ex.slice().sort((a, b) => E.EXHIBITS[b.k].draw * b.fame - E.EXHIBITS[a.k].draw * a.fame)) h += '<div class="eqrow"><span style="flex:1"><b>' + E.EXHIBITS[e.k].name + "</b> der „" + esc(e.ship) + "“ (" + e.years + ")</span></div>";
    h += '<div class="actions"><button class="btn" data-act="musHall">Halle erweitern (+12 Plätze, ' + M(E.hallCost(S)) + ")</button></div>";
    if (E.EXHIBITS) h += img("mus_maschinen", "banner", "Maschinenhalle");
    return h;
  }

  /* ---------- Entfernungsfilter im Linienbau ---------- */
  let selDist = 0;
  const DIST_F = [["alle", 0, 1e9], ["bis 50 sm", 0, 50], ["50–300 sm", 50, 300], ["300–1.000 sm", 300, 1000], ["über 1.000 sm", 1000, 1e9]];
  function distChips() { return '<div class="chips" role="group" aria-label="Entfernung">' + DIST_F.map((f, i) => '<button class="chip" data-act="selDist" data-v="' + i + '" aria-pressed="' + (selDist === i) + '">' + f[0] + "</button>").join("") + "</div>"; }
  function portOptionsDist(sel, placeholder) {
    let o = placeholder ? '<option value="">' + placeholder + "</option>" : "";
    const [, lo, hi] = DIST_F[selDist];
    for (const reg of E.REGIONS) {
      const ids = Object.keys(PORTS).filter(x => PORTS[x].reg === reg && x !== selA).map(x => { const p = E.World.seaPath(selA, x, E.yearOf(S)); return { x, d: p ? p.dist : null }; })
        .filter(o2 => o2.d != null && ((o2.d >= lo && o2.d < hi) || o2.x === sel)).sort((p1, p2) => p1.d - p2.d);
      if (!ids.length) continue;
      o += '<optgroup label="' + reg + '">' + ids.map(o2 => '<option value="' + o2.x + '"' + (o2.x === sel ? " selected" : "") + ">" + esc(PORTS[o2.x].name) + " (" + E.fmt(o2.d) + " sm)</option>").join("") + "</optgroup>";
    }
    return o;
  }

  /* ---------- Hauptbuch: feste Zeilen, Vormonat, Hochrechnung ---------- */
  let ledgerOpen = true;
  function ledger2() {
    const c = S.cur, p = S.last, ex = c.extra || {}, pex = (p && p.extra) || {}, days = c.days || 0, cc = E.cal(S.m), dim = new Date(cc.y, cc.mo + 1, 0).getDate();
    const keysRev = ["Fahrkarten"].concat((c.freight > 1 || (p && p.freight > 1)) ? ["Fracht"] : []);
    const exKeys = [...new Set(Object.keys(ex).filter(k => ex[k] > .5).concat(Object.keys(pex).filter(k => pex[k] > .5)))];
    const pc = (p && p.cost) || {}, allCost = [...new Set(LEDGER_ORDER.filter(k => c.cost[k] > .5 || pc[k] > .5).concat(Object.keys(c.cost).concat(Object.keys(pc)).filter(k => !LEDGER_ORDER.includes(k) && ((c.cost[k] || 0) > .5 || (pc[k] || 0) > .5))))];
    const curRev = { Fahrkarten: c.rev - (c.freight || 0), Fracht: c.freight || 0 }, prevRev = p ? { Fahrkarten: p.rev - (p.freight || 0), Fracht: p.freight || 0 } : {};
    const exSum = Object.values(ex).reduce((a, b) => a + b, 0), costSum = Object.values(c.cost).reduce((a, b) => a + b, 0), res = c.rev + exSum - costSum;
    const spec = SPECIAL_COST.reduce((a, k) => a + (c.cost[k] || 0), 0), runRes = c.rev - (costSum - spec), proj = days ? runRes * dim / days + exSum - spec : 0;
    const row = (name, a, b, neg, cls) => '<div class="l3' + (cls ? " " + cls : "") + '"><span>' + name + "</span><span>" + (p ? (b == null ? "" : (neg && b > .5 ? "−" : "") + E.fmt(b)) : "") + "</span><span>" + (a == null ? "" : (neg && a > .5 ? "−" : "") + E.fmt(a)) + "</span></div>";
    let h = '<details class="ledger2" id="ledger"' + (ledgerOpen ? " open" : "") + '><summary><span>Hauptbuch</span><span class="lres">' + signed(res) + " M</span></summary>";
    h += '<div class="lprog"><i style="width:' + Math.round(days / dim * 100) + '%"></i></div><div class="meta">Tag ' + days + " von " + dim + " · " + E.dateStr(S.m) + "</div>";
    h += '<div class="l3 head"><span></span><span>' + (p ? "Vormonat" : "") + "</span><span>laufend</span></div>";
    for (const k of keysRev) h += row(k, curRev[k], prevRev[k], false);
    if (exKeys.length) { h += row("Sondereinnahmen", null, null, false, "sub"); for (const k of exKeys) h += row(k, ex[k] || 0, pex[k] || 0, false, "ind"); }
    const bk = allCost.filter(k => k.startsWith("Bekohlung ")), sumK = (o, ks) => ks.reduce((a, k) => a + (o[k] || 0), 0);
    if (bk.length) { h += row("Bekohlung", sumK(c.cost, bk), sumK(pc, bk), true); for (const k of bk) h += row(esc(k.slice(10)), c.cost[k] || 0, pc[k] || 0, true, "ind"); }
    for (const k of allCost) if (!k.startsWith("Bekohlung ")) h += row(k, c.cost[k] || 0, pc[k] || 0, true);
    h += '<div class="l3 sum"><span>Ergebnis</span><span>' + (p ? signed(p.profit) : "") + "</span><span>" + signed(res) + "</span></div>";
    if (days) h += '<div class="l3 sum2"><span>Hochrechnung Monatsende</span><span></span><span>' + signed(proj) + "</span></div>";
    return h + '<div class="meta" style="margin-top:6px">Beträge in ' + (S.country === "gb" ? "Pfund umgerechnet" : "Mark") + ". Zinsen und Tilgung werden am Monatsende gebucht.</div></details>";
  }

  /* ---------- Pleite-Analyse ---------- */
  function endAnalysis() {
    const r = E.bankruptReport(S); let h = "<h4>Woran es lag</h4><ul>" + r.reasons.map(x => "<li>" + esc(x.text) + "</li>").join("") + "</ul>";
    if (r.years.length > 1) {
      const max = Math.max(1, ...r.years.map(y => Math.abs(y.profit)));
      h += '<h4>Ergebnis der letzten Jahre</h4><div class="bars">' + r.years.map(y => '<div class="bar ' + (y.profit < 0 ? "neg" : "") + '" title="' + y.y + '"><i style="height:' + Math.round(Math.abs(y.profit) / max * 100) + '%"></i><span>' + String(y.y).slice(2) + "</span></div>").join("") + "</div>";
    }
    h += '<table class="fin" style="width:100%"><tr><td>Preisniveau</td><td>' + Math.round(r.pricePct * 100) + " % des Üblichen</td></tr><tr><td>Durchschnittsalter der Flotte</td><td>" + Math.round(r.avgAge) + " Jahre</td></tr>" + (r.oldest.length ? "<tr><td>Älteste Schiffe</td><td>" + r.oldest.map(o => "„" + esc(o.name) + "“ (" + o.age + ")").join(", ") + "</td></tr>" : "") + "</table>";
    return h;
  }
  /* ---------- Bank ---------- */
  function chart() {
    const H = S.hist.slice(-120); if (H.length < 2) return "";
    const W = 340, Ht = 120, xs = i => 8 + i * (W - 16) / (H.length - 1);
    const vals = H.map(x => x.eq).concat(H.map(x => x.cash)); let mn = Math.min(0, ...vals), mx = Math.max(...vals); if (mx === mn) mx = mn + 1;
    const ys = v => Ht - 14 - (v - mn) / (mx - mn) * (Ht - 30);
    const path = key => H.map((x, i) => (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(x[key]).toFixed(1)).join(" ");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Verlauf Eigenkapital und Kasse">' +
      '<line x1="8" x2="' + (W - 8) + '" y1="' + ys(0) + '" y2="' + ys(0) + '" stroke="var(--rule)"/>' +
      '<path d="' + path("eq") + '" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="' + path("cash") + '" fill="none" stroke="var(--brass)" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<text x="8" y="12" font-size="11" fill="var(--muted)">' + E.fmt(mx) + '</text><text x="' + (W - 8) + '" y="' + (Ht - 2) + '" font-size="11" fill="var(--muted)" text-anchor="end">' + E.dateStr(H[H.length - 1].m) + "</text></svg>" +
      '<div class="meta">Durchgezogen: Eigenkapital · gestrichelt: Kasse (letzte zehn Jahre)</div>';
  }
  function bank() {
    const rt = E.rating(S), fv = E.fleetValue(S), d = E.debt(S);
    let h = '<h2>Bank</h2><p class="sub">Bonität ' + rt.grade + " – Eigenkapitalquote " + Math.round(Math.max(0, rt.q) * 100) + " %. Leitzins derzeit " + S.base.toFixed(1).replace(".", ",") + " %.</p>";
    h += '<div class="kv"><div><b>' + M(fv) + '</b><span>Wert der Flotte</span></div><div><b>' + M(d) + '</b><span>Schulden</span></div></div>';
    h += chart();
    h += "<h2>Kredite</h2>";
    if (!S.loans.length) h += '<p class="sub">Keine Kredite. Neue Kredite gibt es beim Schiffskauf in der Werft.</p>';
    for (const l of S.loans) {
      h += '<div class="item"><h3 style="font-size:18px">' + esc(l.label) + '</h3><table class="fin" style="width:100%"><tr><td>Restschuld</td><td>' + M(l.out) + "</td></tr><tr><td>Rate im Monat</td><td>" + M(l.pay) +
        "</td></tr><tr><td>Zins</td><td>" + kn(l.rate) + " %</td></tr><tr><td>Restlaufzeit</td><td>" + l.left + " Monate" + (l.grace > 0 ? " (erst " + l.grace + " Monate nur Zinsen)" : "") + "</td></tr></table>" +
        '<div class="actions"><button class="btn" data-act="repay" data-id="' + l.id + '" data-a="50000">50.000 tilgen</button><button class="btn" data-act="repay" data-id="' + l.id + '" data-a="all">Ganz tilgen</button></div></div>';
    }
    const cs = Object.values(S.contracts);
    h += "<h2>Verträge</h2>" + (cs.length ? cs.map(c => '<div class="item"><h3 style="font-size:18px">' + c.name + '</h3><div class="meta">' + M(c.sub) + " im Monat bis " + E.dateStr(c.until) + ". Ohne Fahrt: " + M(c.pen) + " Strafe.</div></div>").join("") :
      '<p class="sub">Keine Verträge. Angebote kommen als Ereignis – etwa ein Postvertrag, wenn Sie schnelle Schiffe nach New York oder Ostasien schicken.</p>');
    return h;
  }

  /* ---------- Dialoge ---------- */
  let evKey = null, evReadyAt = 0, startTut = false;
  // Fenster zeichnen; wirft das Zeichnen einen Fehler, wird das Fenster geschlossen, damit die Uhr nicht hängen bleibt
  function renderModal() {
    try { renderModal0(); }
    catch (e) {
      reportErr(e, "Fenster");
      const m = $("modal");
      if (S && S.pending.length && E.duePending(S)) { try { if (eventFallback(m)) return; renderModal0(); return; } catch (x) { reportErr(x, "Fenster"); } }
      sheet = null; if (m) m.innerHTML = "";
    }
  }
  // schlichtes Ereignisfenster als Ersatz; lassen sich nicht einmal die Antworten bestimmen, wird das Ereignis übersprungen
  function eventFallback(m) {
    const ev = S.pending[0]; let opts = null;
    try { opts = E.eventOptions(S, ev); } catch (x) { opts = null; }
    if (!opts || !opts.length) { S.pending.shift(); evKey = null; return false; }
    evReadyAt = 0;
    m.innerHTML = '<div class="veil"><div class="sheet" role="dialog" aria-modal="true"><h3>' + esc(ev.head || "") + "</h3><p>" + esc(ev.text || "") + '</p><div class="opts">' +
      opts.map((o, i) => '<button class="opt" data-act="choose" data-i="' + i + '"' + (o.ok === false ? " disabled" : "") + "><b>" + esc(o.t) + "</b><span>" + esc(o.h || "") + "</span></button>").join("") + "</div></div></div>";
    return true;
  }
  function renderModal0() {
    const m = $("modal");
    if (!S) { m.innerHTML = sheet && sheet.kind === "import" ? importSheet() : startSheet(); return; }
    if (S.over === "konkurs") { m.innerHTML = endSheet(); return; }
    if (S.pending.length && E.duePending(S)) {
      const ev = S.pending[0], opts = E.eventOptions(S, ev), key = ev.id + "|" + ev.head + "|" + (ev.day || 0) + "|" + S.t;
      if (key !== evKey) { evKey = key; evReadyAt = Date.now() + 1500; setTimeout(() => { const box = document.querySelector("#modal .opts"); if (box) { box.classList.remove("wait"); box.querySelectorAll("button").forEach(b => { if (!b.dataset.blocked) b.disabled = false; }); } }, 1500); }
      const wait = Date.now() < evReadyAt, ikey = ev.id === "margin" ? "ev_krise" : ev.img, alarm = ev.id === "seenot";
      m.innerHTML = '<div class="veil"><div class="sheet' + (alarm ? " alarm" : "") + '" role="dialog" aria-modal="true" aria-labelledby="evh">' + img(ikey, "evimg", "") + '<div class="kicker">' + (alarm ? "SEENOT · " : ev.id === "sonder" ? "Vertrauliches Angebot · " : ev.id === "berater" ? "Unter vier Augen · " : ev.id === "emil" ? "Besuch am Kai · " : ev.id === "werft" || ev.id === "major" ? "Nachricht von der Werft · " : "Eilmeldung im Kontor · ") + E.dayStr(S) + '</div><h3 id="evh">' + esc(ev.head) + "</h3>" + (ev.ship ? (() => { const sh = S.ships.find(x => x.id === ev.ship); return sh ? '<div class="evship">„' + esc(sh.name) + "“ · " + esc(E.lineOf(S, sh)) + "</div>" : ""; })() : "") + "<p>" + esc(ev.text) + "</p>" + (ev.list ? '<ul class="adv">' + ev.list.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "") + (ev.tipText ? '<p class="tip"><b>Mein Rat:</b> ' + esc(ev.tipText) + "</p>" : "") + (ev.img2 ? img(ev.img2, "plateimg", "") : "") + '<div class="opts' + (wait ? " wait" : "") + '">' +
        opts.map((o, i) => '<button class="opt" data-act="choose" data-i="' + i + '" ' + (o.ok === false ? 'disabled data-blocked="1"' : wait ? "disabled" : "") + "><b>" + esc(o.t) + "</b><span>" + esc(o.h) + "</span></button>").join("") + "</div></div></div>";
      return;
    }
    if (sheet) { m.innerHTML = sheet.kind === "bo" ? boSheet() : sheet.kind === "prev" ? previewSheet() : sheet.kind === "rename" ? renameSheet() : sheet.kind === "export" ? exportSheet() : sheet.kind === "import" ? importSheet() : sheet.kind === "design" ? designSheet() : sheet.kind === "retire" ? retireSheet() : buySheet(); return; }
    m.innerHTML = "";
  }
  let startHome = "ham", startDiff = "normal";
  function startSheet() {
    const hn = { ham: "Hamburg", lpl: "Liverpool", lon: "London" }[startHome], loan = E.DIFF[startDiff].loan;
    return '<div class="veil light"><div class="sheet" role="dialog" aria-modal="true">' + (startHome !== "ham" ? img(startHome === "lpl" ? "gb_liverpool" : "gb_dover", "banner", hn) : "") + '<div class="kicker">' + hn + ', im März 1880</div><h3>Gründen Sie Ihre Reederei</h3>' +
      '<div class="seg" role="group" aria-label="Sprache" style="margin-bottom:10px">' + [["de", "Deutsch"], ["en", "English"], ["es", "Español"]].map(([k, n]) => '<button data-act="setLang" data-v="' + k + '" aria-pressed="' + (LANG === k) + '">' + n + "</button>").join("") + "</div>" +
      '<label class="field">Heimathafen</label><div class="seg" role="group" style="margin-bottom:10px">' + [["ham", "Hamburg"], ["lpl", "Liverpool"], ["lon", "London"]].map(([k, n]) => '<button data-act="setHome" data-v="' + k + '" aria-pressed="' + (startHome === k) + '">' + n + "</button>").join("") + "</div>" +
      '<label class="field">Schwierigkeitsgrad</label><div class="seg" role="group" aria-label="Schwierigkeitsgrad">' + E.DIFF_ORDER.map(k => '<button data-act="setDiff0" data-v="' + k + '" aria-pressed="' + (startDiff === k) + '">' + E.DIFF[k].name + "</button>").join("") + '</div><div class="meta" style="margin-bottom:10px">' + DIFF_NOTE[startDiff] + "</div>" +
      "<p>" + (startHome === "ham" ? E.fmt(loan) + " Mark Gründungskredit der Hamburger Bank" : E.fmt(Math.round(loan / 20.43 / 100) * 100) + " Pfund Gründungskredit einer Londoner Bank") + ", ein Kontor am Hafen und über 70 Häfen zwischen Dublin und Shanghai. Welche Verbindungen Sie eröffnen, entscheiden Sie.</p>" +
      '<label class="field" for="nm">Name der Reederei</label><div class="namebox"><input class="name" id="nm" value="' + esc(startName) + '" maxlength="28" autocomplete="off"><button class="dice" data-act="rollfirm" aria-label="Anderer Name">🎲</button></div>' +
      '<div class="actions"><button class="btn solid" data-act="start" style="width:100%">Reederei gründen</button></div><label class="switch" style="margin-top:12px"><span>Mit Einführung spielen</span><input type="checkbox" id="tutchk"' + (startTut ? " checked" : "") + '></label><button class="linkbtn" data-act="importOpen">Vorhandenen Spielstand importieren</button></div></div>';
  }
  const FIRM_FAM = ["Petersen", "Lorenzen", "Brodersen", "Thiessen", "Hinrichs", "Carstens", "Jessen", "Kröger", "Harms", "Paulsen", "Rohwer", "Sievers", "Ohlsen", "Martens", "Clausen", "Detlefsen", "Hansen", "Wulff", "Behrens", "Iversen"];
  const FIRM_ADJ = ["Hanseatische", "Norddeutsche", "Hamburger", "Nordische", "Vereinigte", "Neue", "Altonaer", "Elbische"];
  const FIRM_SYM = ["Nordstern", "Seestern", "Möwen", "Kompass", "Elbstern", "Leuchtfeuer", "Anker", "Albatros", "Morgenstern", "Windrosen"];
  const FIRM_GB = ["Mersey & Atlantic Steam Navigation Co.", "Liverpool Steam Packet Co.", "Albion Line", "Royal Mail Steam Packet Co.", "Northern Star Line", "Britannia Steamship Co.", "Thames & Channel Steamers", "Anchor & Crown Line", "Red Rose Line", "Western Isles Steam Co.", "Merchant Navigation Co.", "Seagull Line", "Lion Steamship Co.", "Union Jack Line"];
  function randomFirm() {
    const r = a => a[Math.floor(Math.random() * a.length)];
    if (startHome !== "ham") { for (let i = 0; i < 10; i++) { const n = r(FIRM_GB); if (n.length <= 28) return n; } return "Albion Line"; }
    const opts = [
      () => "Reederei " + r(FIRM_FAM) + " & Söhne", () => r(FIRM_FAM) + " & " + r(FIRM_FAM), () => "Reederei " + r(FIRM_FAM), () => r(FIRM_FAM) + " & Co.",
      () => r(FIRM_ADJ) + " Dampfschiffahrt", () => r(FIRM_ADJ) + " Reederei", () => r(FIRM_ADJ) + " Seelinie", () => r(FIRM_SYM) + "-Linie", () => r(FIRM_SYM) + "-Reederei", () => "Dampferlinie " + r(FIRM_SYM)];
    for (let i = 0; i < 20; i++) { const n = r(opts)(); if (n.length <= 28 && !(n.includes(" & ") && n.split(" & ")[0].split(" ").pop() === n.split(" & ")[1])) return n; }
    return "Reederei " + r(FIRM_FAM);
  }
  let startName = randomFirm();
  function endSheet() {
    const eq = E.equity(S), sc = E.score(S);
    return '<div class="veil"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">' + E.dateStr(S.m) + "</div><h3>Konkurs</h3>" +
      "<p>Die Kasse ist leer, die Bank hat die Geduld verloren. So weit ist " + esc(S.name) + " gekommen:</p>" + endAnalysis() +
      '<table class="fin" style="width:100%"><tr><td>Geschäftsjahre</td><td>' + (Math.floor(S.m / 12) + 1) + "</td></tr><tr><td>Eigenkapital</td><td>" + M(eq) + "</td></tr><tr><td>Beförderte Fahrgäste</td><td>" + E.fmt(S.stats.pax) +
      "</td></tr><tr><td>Prestige</td><td>" + S.prestige + "</td></tr><tr><td>Verlorene Schiffe</td><td>" + S.stats.sunk + '</td></tr><tr><td><b>Reederei-Index</b></td><td><b>' + E.fmt(sc) + "</b></td></tr></table>" +
      '<div class="actions"><button class="btn solid" data-act="reset2">Neue Reederei gründen</button></div></div></div>';
  }
  function nameBox(v) {
    return '<label class="field" for="shipname">Name des Schiffs</label><div class="namebox"><input id="shipname" value="' + esc(v) + '" maxlength="28" autocomplete="off"><button class="dice" data-act="rollname" aria-label="Zufälliger Name">🎲</button></div>';
  }
  // Bestellung: ein Schiff oder eine Serie (v5.0); die Werft liefert je Bauart eines nach dem anderen
  function orderBox(t) {
    const n = sheet.n || 1, O = E.orderInfo(S, sheet.type, !!sheet.brandt, n, Object.keys(sheet.eq || {}).filter(k => sheet.eq[k]));
    let h = '<label class="field">Anzahl</label><div class="stepper"><button data-act="orderN" data-d="-1" aria-label="Weniger"' + (n <= 1 ? " disabled" : "") + '>−</button><div class="val"><b>' + n + (n > 1 ? " Schiffe" : " Schiff") + "</b><span>" + (O.disc > 0 ? "Serienrabatt " + Math.round(O.disc * 100) + " %" : n > 1 ? "kein Serienrabatt" : "Einzelbestellung") + '</span></div><button data-act="orderN" data-d="1" aria-label="Mehr"' + (n >= 10 ? " disabled" : "") + ">+</button></div>";
    h += '<div class="meta">Ablieferung ' + (n === 1 ? E.dateStr(O.plan[0]) : "ab " + E.dateStr(O.plan[0]) + ", dann " + (O.gap === 1 ? "jeden Monat eines" : "alle " + O.gap + " Monate eines") + ", das letzte im " + E.dateStr(O.plan[n - 1])) + ". Die Werft baut von jeder Bauart ein Schiff nach dem anderen" + (O.plan[0] > S.m + Math.max(2, t.build - (sheet.brandt ? 1 : 0)) ? " – vor Ihnen liegen noch eigene Aufträge dieser Bauart" : "") + ".</div>";
    if (n > 1) h += '<div class="meta">Bezahlt wird die ganze Serie bei der Bestellung, bei Krediten läuft je Schiff ein eigener. Abbestellen geht bis Baubeginn und kostet 15 %. Getauft wird nur das erste Schiff.</div>';
    const fit = S.routes.filter(r => !E.canServe(S, sheet.type, r.a, r.b, r.cruise, r.stops));
    if (fit.length) h += '<label class="field" for="ordline">Linie nach Ablieferung</label><select id="ordline" data-act="orderLine"><option value="">später zuweisen</option>' + fit.map(r => '<option value="' + r.id + '"' + (sheet.line === r.id ? " selected" : "") + ">" + esc(E.rInfo(S, r).name) + "</option>").join("") + "</select>";
    return { h, O };
  }
  function buySheet() {
    let price, title, kinds, ob = null;
    if (sheet.kind === "new") { const t = E.TYPES[sheet.type]; ob = orderBox(t); price = ob.O.total; title = t.name + (sheet.brandt ? " in Brandt-Bauart" : "") + " bestellen"; kinds = ["bar", "bank", "werft"]; }
    else { const L = S.market.find(x => x.id === sheet.id); if (!L) { sheet = null; return ""; } price = L.price; title = "„" + L.name + "“ kaufen"; kinds = ["bar", "used"]; }
    let h = '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">' + (ob && ob.O.n > 1 ? "Zusammen " + M(price) : "Kaufpreis " + M(price)) + "</div><h3>" + esc(title) + "</h3>" + nameBox(sheet.name) + factoryBox() + (ob ? ob.h : "") + '<p style="margin-top:12px">Wie wollen Sie bezahlen?</p>';
    for (const k of kinds) {
      const q = E.quote(S, price, k);
      h += '<button class="opt" data-act="pay" data-k="' + k + '" ' + (q.ok ? "" : "disabled") + "><b>" + q.name + " – jetzt " + (q.now != null ? M(q.now) : "–") + "</b><span>" +
        (k === "bar" ? q.note : q.rate != null && q.pay ? M(q.pay) + " im Monat · " + kn(q.rate) + " % Zins · " + q.months + " Monate" : "") + (q.ok ? "" : " · " + (q.reason || "nicht möglich")) + "</span></button>";
    }
    return h + '<div class="actions"><button class="btn" data-act="close" style="width:100%">Abbrechen</button></div></div></div>';
  }
  function renameSheet() {
    const sh = S.ships.find(x => x.id === sheet.id); if (!sh) { sheet = null; return ""; }
    return '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">' + E.TYPES[sh.type].name + '</div><h3>„' + esc(sh.name) + '“ umbenennen</h3>' + nameBox(sheet.name) +
      '<div class="actions"><button class="btn solid" data-act="renameSave" style="flex:1">Speichern</button><button class="btn" data-act="close" style="flex:1">Abbrechen</button></div></div></div>';
  }
  function saveCode() { const j = JSON.stringify(S); return "FLAGGSCHIFF1:" + btoa(unescape(encodeURIComponent(j))); }
  function exportSheet() {
    return '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">Spielstand sichern</div><h3>Spielstand exportieren</h3>' +
      '<p>Kopieren Sie diesen Code und fügen Sie ihn in der App unter „Spielstand importieren“ ein. Er dient auch als Sicherung.</p>' +
      '<textarea id="savecode" class="code" readonly>' + saveCode() + '</textarea>' +
      '<div class="actions"><button class="btn solid" data-act="copySave" style="flex:1">Kopieren</button><button class="btn" data-act="close" style="flex:1">Schließen</button></div></div></div>';
  }
  function importSheet() {
    return '<div class="veil" data-act="close"><div class="sheet" role="dialog" aria-modal="true"><div class="kicker">Spielstand laden</div><h3>Spielstand importieren</h3>' +
      '<p>Fügen Sie hier den exportierten Code ein. ' + (S ? "Ihr aktuelles Spiel wird dabei ersetzt." : "") + '</p>' +
      '<textarea id="importcode" class="code" placeholder="FLAGGSCHIFF1:…"></textarea>' +
      '<div class="actions"><button class="btn solid" data-act="doImport" style="flex:1">Laden</button><button class="btn" data-act="close" style="flex:1">Abbrechen</button></div></div></div>';
  }
  function shipSVG() {
    let s = '<g transform="translate(20,18)">';
    s += '<path d="M0,72 L262,72 L280,50 L-8,50 L-2,62 Z" fill="#13294B"/><rect x="-6" y="52" width="283" height="2" fill="#B08D57"/>';
    s += '<rect x="30" y="38" width="196" height="12" fill="#F4EFE2" stroke="#13294B" stroke-width=".6"/><rect x="52" y="28" width="150" height="10" fill="#F4EFE2" stroke="#13294B" stroke-width=".6"/>';
    for (let i = 0; i < 18; i++) s += '<circle cx="' + (40 + i * 10.5) + '" cy="44" r="1.6" fill="#13294B"/>';
    for (const fx of [92, 142]) s += '<path d="M' + fx + ",28 L" + (fx + 20) + ",28 L" + (fx + 24) + ",-6 L" + (fx + 4) + ',-6 Z" fill="#1E3A63"/><path d="M' + (fx + 1.5) + ",8 L" + (fx + 21.2) + ",8 L" + (fx + 22.6) + ",-3 L" + (fx + 2.8) + ',-3 Z" fill="#B08D57"/>' + star(fx + 12, 2.5, 4.2, 1.7, "#fff");
    return s + '</g><path d="M0,92 Q20,88 40,92 T80,92 T120,92 T160,92 T200,92 T240,92 T280,92 T320,92" fill="none" stroke="var(--rule)" stroke-width="1.4"/>';
  }


  /* ---------- PC-Version ---------- */
  const MQ = window.matchMedia ? window.matchMedia("(min-width: 1100px)") : null;
  let DESK = false, lastSpeed = 1;
  const TABKEYS = { kontor: ["K", "O", "O"], linien: ["L", "L", "L"], flotte: ["F", "F", "F"], werft: ["W", "S", "A"], werbung: ["M", "M", "M"], bank: ["B", "B", "B"] };
  const KEYTAB = { k: "kontor", o: "kontor", l: "linien", f: "flotte", w: "werft", s: "werft", a: "werft", m: "werbung", b: "bank" };
  const paperName = () => { try { return ({ ham: "Hamburger Nachrichten", lpl: "Liverpool Mercury", lon: "The Shipping Gazette" }[S.home || "ham"]); } catch (e) { return "Hamburger Nachrichten"; } };
  function newsList(n) {
    let h = '<div class="news">';
    for (const l of S.log.slice(0, n)) { const k = newsImg(l); h += '<article class="' + (l.kind === "bad" ? "bad" : "") + '">' + (k ? img(k, "thumb", "") : "") + "<time>" + E.dateStr(l.m) + "</time><h4>" + esc(l.head) + "</h4><p>" + esc(l.text) + "</p></article>"; }
    return h + "</div>";
  }
  function layout() {
    DESK = !!(MQ && MQ.matches);
    document.body.classList.toggle("desk", DESK);
    const tele = $("tele"), tabs = $("tabs"), nav = document.querySelector("nav.bottom .in");
    if (DESK) { document.querySelector("header.top").appendChild(tele); $("railNav").appendChild(tabs); }
    else { nav.appendChild(tele); nav.appendChild(tabs); for (const b of tabs.children) b.removeAttribute("title"); }
  }
  function railStats() {
    if (!S) return "";
    const rt = E.rating(S), eq = E.equity(S), act = S.ships.filter(sh => E.active(S, sh)).length;
    const rows = [["Eigenkapital", M(eq), eq < 0], ["Bonität", rt.grade], ["Ruf", Math.round(S.rep)], ["Bekanntheit", Math.round(S.mk.brand)],
      ["Kohlepreis", E.coalIdx(S) + " % " + coalArrow()], ["Schiffe", S.ships.length ? S.ships.length + " (" + act + " im Dienst)" : "keine"], ["Linien", S.routes.length || "keine"]].concat((() => { const L = S.routes.filter(r => r.tt && r.tt.n && r.pk != null); return L.length ? [["Pünktlichkeit", pkTxt(L.reduce((a, r) => a + r.pk, 0) / L.length)]] : []; })()).concat([["Reederei-Index", E.fmt(E.score(S))]]).concat(S.bo && E.boHeld(S) ? [["Depot", M(E.boValue(S))]] : []);
    return '<dl class="rs">' + rows.map(r => "<div><dt>" + r[0] + '</dt><dd class="' + (r[2] ? "neg" : "") + '">' + r[1] + "</dd></div>").join("") + "</dl>";
  }
  function sidePanel() {
    return '<h3 class="sidehd">Seekarte</h3>' + mapSVG() + '<h3 class="sidehd next">' + paperName() + "</h3>" + newsBox(10);
  }
  function keyLetters() {
    const li = { de: 0, en: 1, es: 2 }[typeof LANG !== "undefined" ? LANG : "de"] || 0, word = ["Taste ", "Key ", "Tecla "][li];
    for (const b of $("tabs").children) { const k = TABKEYS[b.dataset.tab]; if (!k) continue; const L = k[li], sp = b.querySelector(".k"); if (sp) sp.textContent = L; b.title = word + L; }
    const kt = $("kbdTabs"); if (kt) kt.textContent = Object.values(TABKEYS).map(k => k[li]).join(" ");
  }
  function deskRender() {
    document.body.classList.toggle("nogame", !S);
    if (!DESK) return;
    keyLetters();
    $("side").innerHTML = S ? sidePanel() : "";
    $("railStats").innerHTML = railStats();
  }
  function onKey(e) {
    if (!DESK || e.ctrlKey || e.metaKey || e.altKey) return;
    const a = document.activeElement, k = e.key;
    if (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) { if (k === "Escape") a.blur(); return; }
    if (!S) return;
    if (S.pending.length && E.duePending(S)) {
      if (/^[1-9]$/.test(k)) { const b = document.querySelector('#modal [data-act="choose"][data-i="' + (+k - 1) + '"]'); if (b && !b.disabled) { e.preventDefault(); act("choose", { i: String(+k - 1) }); } }
      return;
    }
    if (!sheet && $("tutbox").firstChild && (k === "Enter" || k === "Escape")) { const b = $("tutbox").querySelector(k === "Enter" ? '[data-act="tutNext"]' : '[data-act="tutSkip"]'); if (b) { e.preventDefault(); act(b.dataset.act, {}); return; } }
    if (k === "Escape") { if (sheet) { e.preventDefault(); act("close", {}); } else if (mapPick) { mapPick = null; render(); } return; }
    if (sheet || S.over) return;
    if (k === " " || k === "Spacebar") { e.preventDefault(); if (S.speed > 0) { lastSpeed = S.speed; act("speed", { v: "0" }); } else act("speed", { v: String(lastSpeed || 1) }); return; }
    if (/^[0-3]$/.test(k)) { e.preventDefault(); if (+k) lastSpeed = +k; act("speed", { v: k }); return; }
    const T = KEYTAB[k.toLowerCase()];
    if (T) { e.preventDefault(); tab = T; confirmSell = null; mapPick = null; render(); window.scrollTo(0, 0); }
  }

  /* ---------- Rendern ---------- */
  function render() {
    try { render0(); }
    catch (e) { reportErr(e, "Anzeige"); if (sheet) { sheet = null; try { render0(); } catch (x) { } } }
  }
  function render0() {
    if (!S) {
      $("hdr").innerHTML = FLAG + '<div class="firm">Flaggschiff</div><div></div>';
      $("main").innerHTML = A.title ? '<div class="hero-img">' + img("title", "", "Hamburger Hafen 1880") + '<div class="ttl"><h1>Flaggschiff</h1><p>Spielbarer Prototyp · Personenschifffahrt ab 1880</p></div></div>'
        : '<div class="hero"><svg viewBox="0 0 320 120" aria-hidden="true">' + shipSVG() + "</svg><h1>Flaggschiff</h1><p>Spielbarer Prototyp · Personenschifffahrt ab 1880</p></div>";
      deskRender(); renderModal(); translateDom(document.body); return;
    }
    renderHeader();
    if (S.uiRetire && !E.duePending(S)) { sheet = { kind: "retire", id: S.uiRetire }; S.uiRetire = null; }
    const views = { kontor: kontorView, linien, flotte, werft, werbung: marktView, bank };
    tutCheck();
    $("main").innerHTML = views[tab]();
    deskRender();
    $("tutbox").innerHTML = tutBox(); document.body.classList.toggle("tut-on", !!$("tutbox").firstChild);
    renderModal();
    translateDom(document.body);
    tutGlow();
  }
  function toast(msg) {
    const t = $("toast"); t.innerHTML = '<div class="toast" role="status">' + msg + "</div>"; translateDom(t);
    clearTimeout(toastT); toastT = setTimeout(() => { t.innerHTML = ""; }, 3200);
  }
  const typedName = () => { const i = $("shipname"); return i ? i.value : ""; };

  /* ---------- Aktionen ---------- */
  function act(a, d) {
    try { act0(a, d); }
    catch (e) { reportErr(e, "Aktion"); sheet = null; try { if (S) save(); render(); } catch (x) { reportErr(x, "Anzeige"); } }
  }
  function act0(a, d) {
    let err = null;
    switch (a) {
      case "rollfirm": { startName = randomFirm(); const i = $("nm"); if (i) { i.value = startName; return; } break; }
      case "start": { Snd.wake(); Snd.horn(.2); const nm = ($("nm").value || "").trim().slice(0, 28) || randomFirm(); S = E.newGame((Date.now() ^ (Math.random() * 1e9)) | 0, nm, { home: startHome, diff: startDiff }); selA = S.home; const tc = $("tutchk"); if (tc && tc.checked) { S.tut = { step: 0, full: true, ch: {} }; tab = "kontor"; } else { S.tut = { done: true, ch: {} }; tab = "werft"; } break; }
      case "choose": { if (Date.now() < evReadyAt) return; const was = S.pending[0] && S.pending[0].id, n = S.stats.sunk; E.resolve(S, +d.i); if (was === "seenot") { if (S.stats.sunk > n) Snd.storm(0); else Snd.horn(0); toast(esc(S.log[0].head)); } else Snd.bell(0, 520, .1); break; }
      case "price": E.stepPrice(S, d.id, +d.c, +d.d); break;
      case "align": E.alignPrices(S, d.id); Snd.bell(0, 660, .08); break;
      case "speed": S.speed = +d.v; if (S.speed) Snd.telegraph(0); break;
      case "openRoute": { const tourOk = E.tourOpen(S, selB) || E.tourOpen(S, selA); err = E.openRoute(S, selA, selB, tourOk && selCruise, selStops.filter(Boolean)); if (!err) { Snd.bell(0, 660, .1); selB = ""; selCruise = false; selStops = []; } break; }
      case "stopAdd": selStops.push(""); break;
      case "stopDel": selStops.splice(+d.i, 1); break;
      case "closeRoute": err = E.closeRoute(S, d.id); break;
      case "pickPair": selA = d.a; selB = d.b; selCruise = false; break;
      case "mapPort": {
        const p = d.p; if (!E.PORTS[p]) break;
        if (!mapPick) { mapPick = p; Snd.bell(0, 880, .06); toast("Start: " + esc(E.PORTS[p].name) + " – " + (DESK ? "klicken" : "tippen") + " Sie jetzt den Zielhafen an."); }
        else if (mapPick === p) mapPick = null;
        else { selA = mapPick; selB = p; selCruise = false; mapPick = null; tab = "linien"; Snd.bell(0, 660, .08); if (S) save(); render(); window.scrollTo(0, 0); return; }
        break;
      }
      case "equip": err = E.equip(S, d.id, d.k); break;
      case "major": err = E.majorRepair(S, d.id, d.k); if (!err) Snd.bell(0, 520, .1); break;
      case "frist": err = E.renewFrist(S, d.id); if (!err) Snd.bell(0, 520, .1); break;
      case "ksub": kontorSub = d.v; window.scrollTo(0, 0); break;
      case "coalGo": kontorSub = "einkauf"; window.scrollTo(0, 0); break;
      case "msub": marktSub = d.v; window.scrollTo(0, 0); break;
      case "sview": statView = d.v; break;
      case "sort": { const cur = statSort[d.t] || [d.k, 1]; statSort[d.t] = [d.k, cur[0] === d.k ? -cur[1] : (d.k === "name" || d.k === "linie" || d.k === "typ" ? 1 : -1)]; break; }
      case "staff": E.setStaff(S, d.k, +d.v); break;
      case "fahrtSet": if ((S.fahrt || "normal") !== d.v) sheet = { kind: "prev", what: "fahrt", v: d.v, p: E.prevFahrt(S, d.v) }; break;
      case "shipFahrt": { const sh = S.ships.find(x => x.id === d.id); if (sh && (sh.fahrt || "") !== d.v) sheet = { kind: "prev", what: "shipFahrt", id: d.id, v: d.v, p: E.prevFahrt(S, d.v || null, d.id) }; break; }
      case "kqSet": if (E.kueche(S).q[+d.c] !== +d.v) sheet = { kind: "prev", what: "kq", c: +d.c, v: +d.v, p: E.prevKq(S, +d.c, +d.v) }; break;
      case "shipKq": { const sh = S.ships.find(x => x.id === d.id), cur = sh && sh.kq && sh.kq[+d.c] != null ? sh.kq[+d.c] : -1; if (sh && cur !== +d.v) sheet = { kind: "prev", what: "shipKq", id: d.id, c: +d.c, v: +d.v, p: E.prevKq(S, +d.c, +d.v < 0 ? null : +d.v, d.id) }; break; }
      case "eigenSet": sheet = { kind: "prev", what: "eigen", v: d.v === "1", p: E.prevEigen(S, d.v === "1") }; break;
      case "catSign": sheet = { kind: "prev", what: "cat", k: d.k, y: +d.y, p: E.prevCat(S, d.k, +d.y) }; break;
      case "catCancel": { const K = E.kueche(S), c = d.v === "lux" ? K.lux : K.cat; if (c) sheet = { kind: "prev", what: "catCancel", v: d.v, fee: E.catCancelFee(S, c), name: E.catName(S, c.k) }; break; }
      case "coalY": coalYears = +d.v; break;
      case "coalS": coalShare = +d.v; break;
      case "coalSign": { const o = E.coalOffer(S, coalYears, coalShare, coalPort); if (!o.ok) err = o.why; else sheet = { kind: "prev", what: "coal", o }; break; }
      case "coalCancel": { const k = (S.coalK || []).find(x => x.id === d.id); if (k) sheet = { kind: "prev", what: "coalCancel", id: d.id, fee: E.coalCancelFee(S, k) }; break; }
      case "prevOk": {
        const P = sheet; if (!P || P.kind !== "prev") break;
        if (P.what === "fahrt") { const msg = E.setFahrt(S, P.v); if (msg) toast(esc(msg)); }
        else if (P.what === "shipFahrt") E.setShipFahrt(S, P.id, P.v || null);
        else if (P.what === "kq") E.setKq(S, P.c, P.v);
        else if (P.what === "shipKq") E.setShipKq(S, P.id, P.c, P.v < 0 ? null : P.v);
        else if (P.what === "eigen") err = E.setEigen(S, P.v);
        else if (P.what === "cat") err = E.signCaterer(S, P.k, P.y);
        else if (P.what === "catCancel") err = E.cancelCaterer(S, P.v);
        else if (P.what === "coal") err = E.signCoal(S, P.o.years, P.o.share, false, P.o.port);
        else if (P.what === "coalCancel") err = E.cancelCoal(S, P.id);
        if (!err) { sheet = null; Snd.bell(0, 660, .08); }
        break;
      }
      case "planAdd": { const sh = S.ships.find(x => x.id === d.id); if (sh) { const p = (sh.plan || []).slice(); p.push({ from: 4, to: 8, line: sh.line || "" }); openPlan[sh.id] = true; E.setPlan(S, sh.id, p); } break; }
      case "planDel": { const sh = S.ships.find(x => x.id === d.id); if (sh) { const p = (sh.plan || []).slice(); p.splice(+d.i, 1); E.setPlan(S, sh.id, p); } break; }
      case "pickB": selB = d.b; selCruise = false; window.scrollTo(0, 0); break;
      case "caphire": err = E.hireCaptain(S); break;
      case "designNew": designNew(); break;
      case "dset": draft[d.k] = d.k === "funnels" ? +d.v : d.v; break;
      case "dsave": { const nmEl = $("dname"); if (nmEl) draft.name = nmEl.value; const r = E.saveDesign(S, draft); if (r.err) err = r.err; else { sheet = { kind: "new", type: r.type, name: E.randomName(S) }; } break; }
      case "retireOpen": sheet = { kind: "retire", id: d.id }; break;
      case "retire": { const sh = S.ships.find(x => x.id === sheet.id); if (!sh) { sheet = null; break; }
        if (d.k === "still" || d.k === "aktiv") err = E.toMuseum(S, sh.id, d.k); else if (d.k === "spende") err = E.donateShip(S, sh.id); else if (d.k === "verkauf") err = E.sellShip(S, sh.id);
        else if (d.k === "abwracken") err = E.scrapShip(S, sh.id, Object.keys(sheet.parts || {}).filter(k => sheet.parts[k]));
        if (!err) { sheet = null; if (d.k === "still" || d.k === "aktiv") flSub = "museum"; } break; }
      case "musBuild": err = E.buildMuseum(S); break;
      case "musPrice": S.museum.price = +d.v; break;
      case "musFest": err = E.museumFest(S); break;
      case "musMode": err = E.museumMode(S, d.id, d.v); break;
      case "musHall": err = E.expandHall(S); break;
      case "flSub": flSub = d.v; break;
      case "selDist": selDist = +d.v; break;
      case "shipsAll": for (const sh of S.ships) { if (d.v === "1") openShip.add(sh.id); else openShip.delete(sh.id); } if (d.v === "1") for (const g of ["flbau", "flg0", "flg1", "flg2"]) openSec[g] = true; break;
      case "capfire": err = E.dismissCaptain(S, d.id); break;
      case "tutNext": case "tutBack": case "tutSkip": case "tutOff": tutAct(a); tutGlowKey = ""; break;
      case "tutReplay": tutReplay(d.v); tutGlowKey = ""; window.scrollTo(0, 0); break;
      case "newsCat": newsCat = d.v; try { localStorage.setItem(KEY + "-zeitung", d.v); } catch (e) { } break;
      case "boOpen": if (E.BO[d.k]) { E.boSeen(S); sheet = { kind: "bo", k: d.k, mode: "n", v: "" }; } break;
      case "boMode": sheet.mode = d.v; sheet.v = ""; break;
      case "boBuy": case "boSell": case "boSellAll": {
        const P = sheet, raw0 = Math.max(0, Math.floor(+P.v || 0)), raw = P.mode === "amt" ? toMark(raw0) : raw0, have = S.bo.dep[P.k] ? S.bo.dep[P.k].n : 0;
        const n = a === "boSellAll" ? have : P.mode === "amt" ? (a === "boBuy" ? E.boFor(S, P.k, raw) : Math.min(have, Math.ceil(raw / (S.bo.co[P.k].px * (1 - E.BO_FEE))))) : raw;
        err = a === "boBuy" ? E.boBuy(S, P.k, n) : E.boSell(S, P.k, Math.min(n, have));
        if (!err) { P.v = ""; Snd.coins(); }
        break;
      }
      case "pkRisk": S.bo.pk.risk = d.v; S.bo.pk.last = -99; break;
      case "pkSet": { const v = parseInt(((($("pkamt") || {}).value) || "0").replace(/[^0-9]/g, ""), 10) || 0; err = E.pkSet(S, isGB() ? v * 20.43 : v); if (!err) Snd.bell(0, 660, .08); break; }
      case "setLang": setLang(d.v); break;
      case "setHome": startHome = d.v; startName = randomFirm(); break;
      case "setDiff0": startDiff = E.DIFF[d.v] ? d.v : "normal"; break;
      // Fahrplan, Bekohlung, Pausen und Schwierigkeit (v5.0)
      case "abfAll": abfAll = !abfAll; break;
      case "bufSet": E.setBuffer(S, d.id, +d.v); break;
      case "bunkSet": err = E.setBunkRule(S, d.v); break;
      case "shipBunk": E.setShipBunk(S, d.id, d.v || null); break;
      case "pauseSet": E.setPause(S, "late", +d.v); break;
      case "diffSet": confirmDiff = d.v === (S.diff || "normal") ? null : d.v; render(); return;
      case "diffNo": confirmDiff = null; break;
      case "diffOk": if (confirmDiff) { err = E.setDifficulty(S, confirmDiff); confirmDiff = null; if (!err) Snd.bell(0, 660, .08); } break;
      case "cancelOrder": if (confirmCancel === d.id) { err = E.cancelOrder(S, d.id); confirmCancel = null; if (!err) openShip.delete(d.id); } else { confirmCancel = d.id; render(); return; } break;
      case "mapShip": mapShip = mapShip === d.id ? null : d.id; break;
      case "orderN": sheet.n = Math.max(1, Math.min(10, (sheet.n || 1) + +d.d)); renderModal(); translateDom($("modal")); return;
      case "buyBrandt": sheet = { kind: "new", type: d.type, name: E.randomName(S), brandt: true }; break;
      case "budget": E.setBudget(S, +d.v); break;
      case "campaign": err = E.campaign(S, d.id); break;
      case "press": err = E.pressTrip(S); break;
      case "hallen": err = E.buildHallen(S); break;
      case "maint": E.setMaint(S, d.id, +d.v); break;
      case "dock": err = E.dock(S, d.id); break;
      case "sell": if (confirmSell === d.id) { err = E.sellShip(S, d.id); confirmSell = null; } else { confirmSell = d.id; render(); return; } break;
      case "buyNew": sheet = { kind: "new", type: d.type, name: E.randomName(S) }; break;
      case "buyUsed": { const L = S.market.find(x => x.id === d.id); sheet = { kind: "used", id: d.id, name: L ? L.name : E.randomName(S) }; break; }
      case "renameOpen": { const sh = S.ships.find(x => x.id === d.id); sheet = { kind: "rename", id: d.id, name: sh ? sh.name : "" }; break; }
      case "rollname": sheet.name = E.randomName(S, typedName()); { const i = $("shipname"); if (i) { i.value = sheet.name; return; } } break;
      case "renameSave": err = E.rename(S, sheet.id, typedName()); if (!err) sheet = null; break;
      case "survey": err = E.survey(S, d.id); break;
      case "pay": {
        const used = sheet.kind === "used", name = typedName();
        const n = sheet.kind === "new" ? sheet.n || 1 : 1, line = sheet.kind === "new" ? sheet.line || null : null;
        err = sheet.kind === "new" ? E.buyNew(S, sheet.type, d.k, name, sheet.brandt, { eq: Object.keys(sheet.eq || {}).filter(k => sheet.eq[k]), n, line }) : E.buyUsed(S, sheet.id, d.k, name);
        if (!err) { sheet = null; tab = "flotte"; toast(line ? (n > 1 ? "Bestellt. Die Schiffe fahren nach der Ablieferung auf der gewählten Linie." : "Bestellt. Das Schiff fährt nach der Ablieferung auf der gewählten Linie.") : n > 1 ? "Bestellt. Weisen Sie den Schiffen eine Linie zu." : "Gekauft. Weisen Sie dem Schiff eine Linie zu."); Snd.coins(); if (used) Snd.horn(.4); }
        break;
      }
      case "close": sheet = null; break;
      case "exportOpen": sheet = { kind: "export" }; break;
      case "importOpen": sheet = { kind: "import" }; break;
      case "copySave": {
        const ta = $("savecode"); if (!ta) return;
        const done = () => toast("Code kopiert.");
        try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(ta.value).then(done, () => { ta.focus(); ta.select(); document.execCommand("copy"); done(); }); return; } } catch (e) { }
        ta.focus(); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Bitte den Code markieren und kopieren."); }
        return;
      }
      case "doImport": {
        const raw = (($("importcode") || {}).value || "").trim();
        try {
          const b64 = raw.replace(/^FLAGGSCHIFF1:/, "").replace(/\s+/g, "");
          const st = JSON.parse(decodeURIComponent(escape(atob(b64))));
          if (!st || !Array.isArray(st.ships) || typeof st.m !== "number") throw new Error("ungültig");
          S = E.migrate(st); sheet = null; tab = "kontor"; save(); toast("Spielstand geladen: " + esc(S.name));
        } catch (e) { toast("Der Code ist ungültig oder unvollständig."); return; }
        break;
      }
      case "snd": Snd.toggle(); break;
      case "music": Snd.toggleMusic(); break;
      case "nexttrack": Snd.next(false); return;
      case "repay": { const l = S.loans.find(x => x.id === d.id); if (l) err = E.repay(S, d.id, d.a === "all" ? l.out : 50000); break; }
      case "reset": if (confirmReset) { wipe(); S = null; tab = "kontor"; confirmReset = false; } else { confirmReset = true; render(); return; } break;
      case "reset2": wipe(); S = null; tab = "kontor"; startName = randomFirm(); break;
    }
    if (a !== "sell") confirmSell = null;
    if (a !== "cancelOrder") confirmCancel = null;
    if (a !== "reset") confirmReset = false;
    if (err) toast(esc(err));
    if (S) save();
    render();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.classList.contains("veil") && e.target !== t) return;
    if (t.tagName === "INPUT" || t.tagName === "SELECT") return;
    act(t.dataset.act, t.dataset);
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.act === "line") { const err = E.setLine(S, t.dataset.id, t.value || null); if (err) toast(esc(err)); save(); render(); }
    if (t.dataset.act === "ins") { const err = E.setInsured(S, t.dataset.id, t.checked); if (err) toast(esc(err)); save(); render(); }
    if (t.dataset.act === "agency") { const err = E.setAgency(S, t.dataset.k, t.checked); if (err) toast(esc(err)); save(); render(); }
    if (t.dataset.act === "selA") { selA = t.value; if (selA === selB) selB = ""; render(); }
    if (t.dataset.act === "selB") { selB = t.value; render(); }
    if (t.dataset.act === "selStop") { selStops[+t.dataset.i] = t.value; render(); }
    if (t.dataset.act === "selCruise") { selCruise = t.checked; render(); }
    if (t.dataset.act === "dbase") { draft.base = t.value; renderModal(); translateDom($("modal")); }
    if (t.dataset.act === "dext") { draft.extras[t.dataset.k] = t.checked; renderModal(); translateDom($("modal")); }
    if (t.dataset.act === "feq") { sheet.eq = sheet.eq || {}; sheet.eq[t.dataset.k] = t.checked; renderModal(); translateDom($("modal")); }
    if (t.dataset.act === "rpart") { sheet.parts = sheet.parts || {}; sheet.parts[t.dataset.k] = t.checked; renderModal(); translateDom($("modal")); }
    if (t.dataset.act === "musTrips") { S.museum.trips = t.checked; save(); }
    if (t.dataset.act === "capswap") { const v = t.value; if (v) { const err = v === "__res" ? E.assignCaptain(S, t.dataset.id, null) : E.assignCaptain(S, t.dataset.id, v); if (err) toast(esc(err)); save(); render(); } }
    if (t.dataset.act === "staffchk") { E.setStaff(S, t.dataset.k, t.checked); save(); render(); }
    if (t.dataset.act === "mrsel") { mrRoute = t.value; render(); }
    if (t.dataset.act === "resSel") { const err = E.setReserve(S, t.dataset.id, t.value || null); if (err) toast(esc(err)); save(); render(); }
    if (t.dataset.act === "catchUp") { E.setCatchUp(S, t.dataset.id, t.checked); save(); render(); }
    if (t.dataset.act === "markShip") { E.markShip(S, t.dataset.id, t.checked); save(); render(); }
    if (t.dataset.act === "pauseChk") { E.setPause(S, t.dataset.k, t.checked); save(); render(); }
    if (t.dataset.act === "coalPort") { coalPort = t.value; render(); }
    if (t.dataset.act === "orderLine") { sheet.line = t.value || null; renderModal(); translateDom($("modal")); }
    if (t.dataset.act === "plan") { const sh = S.ships.find(x => x.id === t.dataset.id); if (sh) { const p = (sh.plan || []).map(x => Object.assign({}, x)), i = +t.dataset.i; if (p[i]) { p[i][t.dataset.f] = t.dataset.f === "line" ? t.value : +t.value; openPlan[sh.id] = true; E.setPlan(S, sh.id, p); save(); render(); } } }
  });
  document.addEventListener("input", e => { if (e.target.id === "boqty" && sheet && sheet.kind === "bo") { sheet.v = e.target.value.replace(/[^0-9]/g, ""); const q = $("boq"); if (q) { q.innerHTML = boQuoteHtml(); translateDom(q); } } if (e.target.id === "shipname" && sheet) sheet.name = e.target.value; if (e.target.id === "nm") startName = e.target.value; });
  $("tabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (!b || !S) return; tab = b.dataset.tab; confirmSell = null; mapPick = null; render(); window.scrollTo(0, 0); });
  /* ---------- Uhr ---------- */
  const SEC = [0, 4, 2, 1];
  let accT = 0, lastT = performance.now(), dirty = false;
  const busy = () => { const a = document.activeElement; return !!(a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) && a.closest("#main")); };
  const running = () => S && !S.over && S.speed > 0 && !sheet && !document.hidden && !E.duePending(S);
  function renderFull() { if (busy()) { dirty = true; renderLive(); renderModal(); translateDom($("modal")); } else render(); }
  function renderLive() {
    const d = document.querySelector("#hdr .date"), c = document.querySelector("#hdr .cash b"), p = document.querySelector("#tele .mprog i");
    if (!d || !c || !p) { renderHeader(); } else {
      d.textContent = E.dayStr(S); c.textContent = M(S.cash); c.className = S.cash < 0 ? "neg" : "";
      p.style.width = Math.round((S.day - 1) / E.dim(S.m) * 100) + "%";
      document.querySelectorAll("#tele [data-act=speed]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === S.speed)));
    }
    let l = $("ledger"); if (l && tab === "kontor") { const tmp = document.createElement("div"); tmp.innerHTML = ledger2(); const n = tmp.firstElementChild; n.open = l.open; l.replaceWith(n); l = n; }
    if (DESK && S) { const rs = $("railStats"); if (rs) { rs.innerHTML = railStats(); translateDom(rs); } }
    mapShipsLive();
    document.querySelectorAll("[data-voy]").forEach(el => { const sh = S.ships.find(x => x.id === el.dataset.voy); if (sh) { el.innerHTML = voyLine(sh); translateDom(el); } });
    if (tutCheck()) { $("tutbox").innerHTML = tutBox(); document.body.classList.toggle("tut-on", !!$("tutbox").firstChild); translateDom($("tutbox")); tutGlow(); }
    translateDom($("hdr")); translateDom($("tele")); if (l) translateDom(l);
    document.querySelectorAll("[data-dock]").forEach(el => { const sh = S.ships.find(x => x.id === el.dataset.dock); if (sh) { const n = Math.max(0, (sh.dockUntil || 0) - S.t); el.textContent = n + " Tag" + (n === 1 ? "" : "e"); translateDom(el); } });
  }
  function monthFx(rep, logTop) {
    const fresh = []; for (const l of S.log) { if (l === logTop) break; fresh.push(l); }
    Snd.bell(0); Snd.bell(.45);
    const res = rep.profit - (rep.principal || 0);
    if (res >= 0) Snd.coins(.9); else Snd.thud(.9);
    if (fresh.some(l => /abgeliefert/.test(l.head))) Snd.horn(1.2);
    if (fresh.some(l => /^Auswandererwelle/.test(l.head))) Snd.queue(FAREWELL);
    toast(E.dateStr(rep.m) + " abgeschlossen: Ergebnis " + (rep.profit >= 0 ? "+" : "") + E.fmt(rep.profit) + " Mark");
  }
  function step() {
    const logTop = S.log[0];
    const r = E.advanceDay(S);
    { const er = E.takeErrors(); if (er.length) reportErr(er[0].msg, er[0].what); }
    if (!r) { save(); renderFull(); return false; }
    if (r.month) monthFx(r.month, logTop);
    // automatische Pausen (Verspätung, Kohle knapp, Monatsende, markiertes Schiff)
    if (r.pause && r.pause.length && !E.duePending(S)) {
      S.speed = 0; Snd.telegraph(0);
      const pz = r.pause.find(x => x.k !== "month") || r.pause[0];
      toast((pz.k === "month" && r.month ? E.dateStr(r.month.m) + " abgeschlossen: Ergebnis " + (r.month.profit >= 0 ? "+" : "") + E.fmt(r.month.profit) + " Mark · Die Zeit ist angehalten." : esc(pz.text) + " Die Zeit ist angehalten."));
      if (pz.ship) { openShip.add(pz.ship); }
      save(); renderFull(); return false;
    }
    if (E.duePending(S)) { const ev = S.pending[0]; if (ev.id === "seenot") Snd.storm(0); else Snd.telegraph(0); save(); renderFull(); return false; }
    if (r.month || S.log[0] !== logTop || S.over) { save(); renderFull(); return true; }
    if (S.day % 3 === 0) save();
    renderLive();
    return true;
  }
  setInterval(() => {
    const now = performance.now(), dt = Math.min(1, (now - lastT) / 1000); lastT = now;
    try {
      if (!running()) { accT = 0; return; }
      accT += dt;
      const sec = SEC[S.speed];
      for (let i = 0; i < 4 && accT >= sec; i++) { accT -= sec; if (!step()) { accT = 0; break; } }
    } catch (e) { reportErr(e, "Tagesschritt"); accT = 0; }
  }, 100);
  // Wächter: Steht die Zeit länger als 3 s, obwohl ein Tempo eingestellt ist und weder Fenster noch Ereignis zu sehen sind,
  // wird der hängende Zustand zurückgesetzt (unsichtbares Fenster schließen, fälliges Ereignis neu zeichnen)
  let wdT = null, wdSince = 0, wdNote = 0;
  setInterval(() => {
    const now = performance.now();
    if (!S || S.over || !(S.speed > 0) || document.hidden) { wdSince = now; return; }
    if (S.t !== wdT) { wdT = S.t; wdSince = now; return; }
    const box = $("modal") && $("modal").firstElementChild, shown = !!(box && box.getClientRects().length);
    if (shown) { wdSince = now; return; }
    if (now - wdSince < (SEC[S.speed] || 1) * 1000 + 3000) return;
    wdSince = now;
    sheet = null; evKey = null; dirty = false; accT = 0;
    try { render(); } catch (e) { reportErr(e, "Wächter"); }
    if (Date.now() - wdNote > 60000) { wdNote = Date.now(); toast("Die Zeit hing. Das Spiel hat sich wieder in Gang gesetzt."); }
  }, 1000);
  document.addEventListener("toggle", e => { const d = e.target; if (d && d.id === "ledger") ledgerOpen = d.open; if (d && d.dataset && d.dataset.ship) { if (d.open) openShip.add(d.dataset.ship); else openShip.delete(d.dataset.ship); } if (d && d.dataset && d.dataset.sec) openSec[d.dataset.sec] = d.open; if (d && d.dataset && d.dataset.plan) openPlan[d.dataset.plan] = d.open; }, true);
  document.addEventListener("focusout", () => setTimeout(() => { if (dirty && !busy()) { dirty = false; render(); } }, 60));
  document.addEventListener("visibilitychange", () => { if (document.hidden && S) save(); });
  let woke = false;
  document.addEventListener("pointerdown", () => { if (!woke) { woke = true; Snd.wake(); } }, { capture: true });
  document.addEventListener("keydown", onKey);
  if (MQ) { const f = () => { layout(); render(); }; if (MQ.addEventListener) MQ.addEventListener("change", f); else if (MQ.addListener) MQ.addListener(f); }
  layout();
  S = load(); if (S) E.migrate(S);
  render();
})();

