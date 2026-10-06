/* FLAGGSCHIFF – Prototyp-Engine v3: freie Linien, Werbung, Seenot */
(function (root) {
  "use strict";
  const W = root.World || (typeof require !== "undefined" ? require("./world.js") : null);
  const { PORTS, REGIONS, HOME, SEG, TOUR_SEASON, AREA_RISK, OCEAN, seaPath, segments, baseFare } = W;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const START_YEAR = 1880, START_MONTH = 2;

  /* ---------- Schiffstypen ---------- */
  const TYPES = {
    hafen: { name: "Hafenfähre", cls: "Typ Barkasse", price: 58000, seats: 120, sb: [0, 0, 120], speed: 8, comfort: 1, crew: 300, coal: .5, build: 2, from: 1880, range: 25, shallow: true },
    moewe: { name: "Küstendampfer", cls: "Typ Möwe", price: 182000, seats: 150, sb: [0, 150, 0], speed: 10, comfort: 2, crew: 750, coal: 1.0, build: 3, from: 1880, range: 160, shallow: true },
    watt: { name: "Wattendampfer", cls: "Typ Priel", price: 156000, seats: 300, sb: [0, 0, 300], speed: 9, comfort: 2, crew: 700, coal: .9, build: 3, from: 1880, range: 130, shallow: true },
    seebad: { name: "Bäderdampfer", cls: "Typ Seebad", price: 416000, seats: 450, sb: [90, 360, 0], speed: 12, comfort: 3, crew: 1650, coal: 1.9, build: 5, from: 1880, range: 350 },
    nordsee: { name: "Seedampfer", cls: "Typ Elbe", price: 600000, seats: 260, sb: [30, 90, 140], speed: 12, comfort: 2, crew: 1500, coal: 2.2, build: 5, from: 1880, range: 700, cargo: .4 },
    ostsee: { name: "Ostseedampfer", cls: "Typ Baltic", price: 900000, seats: 380, sb: [60, 130, 190], speed: 12.5, comfort: 3, crew: 2400, coal: 3.0, build: 7, from: 1880, range: 1400, cargo: .5 },
    levante: { name: "Levantedampfer", cls: "Typ Levante", price: 950000, seats: 320, sb: [40, 80, 200], speed: 11.5, comfort: 2, crew: 3000, coal: 3.2, build: 8, from: 1882, range: 4200, ocean: true, cargo: 1.2 },
    nacht: { name: "Nachtdampfer", cls: "Typ Nordexpress", price: 1800000, seats: 520, sb: [140, 220, 160], speed: 16, comfort: 4, crew: 4200, coal: 7, build: 9, from: 1886, range: 600 },
    kaiserbad: { name: "Großer Seebäderdampfer", cls: "Typ Kaiserbad", price: 1000000, seats: 1100, sb: [250, 850, 0], speed: 15, comfort: 4, crew: 3200, coal: 4.0, build: 9, from: 1889, range: 400 },
    turbine: { name: "Turbinendampfer", cls: "Typ Blitz", price: 2300000, seats: 900, sb: [200, 350, 350], speed: 20.5, comfort: 4, crew: 6500, coal: 9.0, build: 12, from: 1905, range: 900 },
    kurier: { name: "Postdampfer", cls: "Typ Kurier", price: 1430000, seats: 450, sb: [90, 120, 240], speed: 13, comfort: 3, crew: 4950, coal: 4.2, build: 8, from: 1880, range: 4200, ocean: true, cargo: .3 },
    sued: { name: "Südamerika-Dampfer", cls: "Typ Pampa", price: 2470000, seats: 900, sb: [60, 140, 700], speed: 12.5, comfort: 2, crew: 9900, coal: 7.0, build: 10, from: 1880, range: 12000, ocean: true, cargo: 1 },
    hansa: { name: "Auswandererdampfer", cls: "Typ Hansa", price: 3380000, seats: 1200, sb: [80, 150, 970], speed: 14, comfort: 3, crew: 13200, coal: 9.0, build: 12, from: 1880, range: 9000, ocean: true },
    komet: { name: "Schnelldampfer", cls: "Typ Komet", price: 6760000, seats: 1300, sb: [350, 350, 600], speed: 17.5, comfort: 5, crew: 18700, coal: 14.0, build: 16, from: 1880, range: 7000, ocean: true },
    reichspost: { name: "Reichspostdampfer", cls: "Typ Orient", price: 4420000, seats: 700, sb: [150, 150, 400], speed: 14, comfort: 4, crew: 15400, coal: 9.5, build: 14, from: 1886, range: 14000, ocean: true },
    meteor: { name: "Doppelschrauben-Schnelldampfer", cls: "Typ Meteor", price: 9750000, seats: 1800, sb: [450, 400, 950], speed: 19.5, comfort: 5, crew: 26400, coal: 19.0, build: 18, from: 1889, range: 7000, ocean: true, safe: .6 },
    kreuz: { name: "Vergnügungsdampfer", cls: "Typ Prinzessin", price: 4940000, seats: 400, sb: [400, 0, 0], speed: 15, comfort: 5, crew: 14300, coal: 8.0, build: 14, from: 1891, range: 9000, ocean: true },
    trajekt: { name: "Eisenbahnfähre", cls: "Typ Trajekt", price: 2080000, seats: 600, sb: [80, 220, 300], speed: 13, comfort: 3, crew: 5500, coal: 4.5, build: 10, from: 1903, range: 120, trajekt: true },
  };
  const SPECIAL = {
    nomadic: { name: "Tender", ship: "Nomadic", cls: "Tender von Cherbourg", price: 900000, seats: 1000, sb: [300, 700, 0], speed: 12, comfort: 4, crew: 2500, coal: 3, build: 0, from: 1911, range: 120, prestige: 5,
      trait: "Liebling der Fotografen: Ihre Bekanntheit steigt jeden Monat ein wenig.",
      story: "Gebaut 1911 als Zubringer im Hafen von Cherbourg. Im April 1912 brachte sie Passagiere an Bord der Titanic. Heute liegt sie als Museumsschiff in Belfast – der letzte erhaltene Dampfer ihrer Reederei." },
    carpathia: { name: "Passagierdampfer", ship: "Carpathia", cls: "Retterin von 1912", price: 4200000, seats: 1700, sb: [100, 200, 1400], speed: 14.5, comfort: 3, crew: 15000, coal: 10, build: 0, from: 1903, range: 9000, ocean: true, cargo: .8, prestige: 10,
      trait: "Die Retterin: Gerät eines Ihrer Schiffe in Seenot, eilt sie zu Hilfe – bessere Aussichten für die ganze Flotte.",
      story: "In Dienst seit 1903, ein solider Dampfer für Auswanderer. Berühmt wurde sie in der Nacht zum 15. April 1912: Mit voller Kraft durch das Eis nahm sie über 700 Überlebende der Titanic auf." },
    lusitania: { name: "Turbinen-Schnelldampfer", ship: "Lusitania", cls: "Blaues Band 1907", price: 11000000, seats: 2200, sb: [550, 460, 1190], speed: 25, comfort: 5, crew: 33000, coal: 32, build: 0, from: 1907, range: 7000, ocean: true, prestige: 20,
      trait: "Das schnellste Schiff ihrer Zeit – das Blaue Band ist zum Greifen nah.",
      story: "Ein britischer Turbinen-Schnelldampfer von 1907. Noch im selben Jahr gewann sie das Blaue Band. 1915 wurde sie von einem U-Boot versenkt." },
    titanic: { name: "Ozeanriese", ship: "Titanic", cls: "Größtes Schiff 1912", price: 14500000, seats: 2440, sb: [830, 610, 1000], speed: 21, comfort: 5, crew: 38000, coal: 28, build: 0, from: 1911, range: 7000, ocean: true, prestige: 30, eq: { schotten: true },
      trait: "Der größte Luxus auf See und gewaltiges Prestige. Wasserdichte Schotten ab Werft.",
      story: "1912 das größte Schiff der Welt. Auf ihrer Jungfernfahrt sank sie nach einer Kollision mit einem Eisberg, über 1.500 Menschen kamen ums Leben. In diesem Spiel fährt sie unter Ihrer Flagge weiter." },
    american: { name: "Legendärer Ozeandampfer", ship: "American Star", cls: "„America“ von 1940", price: 12000000, seats: 1200, sb: [450, 420, 330], speed: 22.5, comfort: 5, crew: 22000, coal: 22, build: 0, from: 1915, range: 9000, ocean: true, prestige: 25, safe: .5, wear: .5,
      trait: "Ihrer Zeit weit voraus: nutzt sich nur halb so schnell ab und gerät seltener in Not.",
      story: "In einer anderen Zeit lief sie 1940 als „America“ vom Stapel, fuhr im Krieg als „West Point“, trug später die Namen „Australis“, „Italis“, „Noga“ und „Alferdoss“. 1994 riss sie sich als „American Star“ im Sturm vom Schlepper los und strandete an der Westküste von Fuerteventura. Lange ragte ihr Wrack dort aus der Brandung – eine Legende der Kanaren." },
  };
  SPECIAL.augusta = { name: "Schnelldampfer", ship: "Augusta Victoria", cls: "Erste Kreuzfahrt 1891", price: 7000000, seats: 1100, sb: [400, 120, 580], speed: 18.5, comfort: 5, crew: 16000, coal: 14, build: 0, from: 1890, range: 7000, ocean: true, prestige: 15, cruiseBonus: 1.3,
    trait: "Die Erfinderin der Kreuzfahrt: Auf Vergnügungsreisen buchen deutlich mehr Gäste.",
    story: "1889 bei der AG Vulcan in Stettin gebaut, das erste deutsche Schnelldampfer und der erste Doppelschrauben-Liner vom europäischen Festland. Am 22. Januar 1891 lief sie in Cuxhaven zur ersten Vergnügungsreise der Welt aus – zwei Monate durchs Mittelmeer bis in den Orient. Ihr Name war übrigens falsch geschrieben: Die Kaiserin hieß Auguste Victoria. 1897 wurde der Name still berichtigt." };
  SPECIAL.paris = { name: "Schnelldampfer", ship: "City of Paris", cls: "Blaues Band 1889", price: 8500000, seats: 1740, sb: [540, 200, 1000], speed: 20, comfort: 5, crew: 22000, coal: 18, build: 0, from: 1890, range: 7000, ocean: true, prestige: 15, eq: { schotten: true }, safe: .75,
    trait: "Rekordhalterin mit 20 Knoten und wasserdichten Schotten ab Werft – kaum ein Schiff ist so schwer zu versenken.",
    story: "1889 für die britische Inman Line gebaut, einer der ersten Schnelldampfer mit zwei Schrauben. Noch im selben Jahr holte sie das Blaue Band und überquerte als erstes Passagierschiff den Atlantik in weniger als sechs Tagen. Im März 1890 brach auf hoher See eine Schraubenwelle, die Maschinenräume liefen voll – doch dank ihrer vielen Schotten blieb sie schwimmfähig." };
  const SPECIAL_ORDER = ["american", "augusta", "paris", "nomadic", "carpathia", "lusitania", "titanic"];
  SPECIAL.traum = { name: "Kreuzfahrtschiff", ship: "Das Traumschiff", cls: "aus einer fernen Zukunft", price: 15000000, seats: 600, sb: [600, 0, 0], speed: 18, comfort: 5, crew: 12000, coal: 8, build: 0, from: 1880, range: 12000, ocean: true, prestige: 50, cruiseOnly: true, safe: .3,
    trait: "Fährt nur Vergnügungsreisen – dort will jeder mit: doppelte Nachfrage.", story: "Eines Morgens lag es einfach am Kai: strahlend weiß, mit Palmen an Deck und Liegestühlen in der Sonne. Die Hamburger rieben sich die Augen. Woher es kam, weiß bis heute niemand." };
  for (const k of SPECIAL_ORDER.concat(["traum"])) TYPES[k] = Object.assign({ special: true }, SPECIAL[k]);
  const TYPE_ORDER = ["hafen", "moewe", "watt", "seebad", "kaiserbad", "trajekt", "nordsee", "nacht", "ostsee", "turbine", "levante", "kurier", "sued", "hansa", "komet", "reichspost", "meteor", "kreuz"];
  const TYPE_NOTE = {
    hafen: "Klein, billig, unermüdlich – pendelt im Takt über den Hafen.",
    moewe: "Klein, sparsam und flach gebaut. Für kurze Küsten- und Inselfahrten.",
    watt: "Sehr flach und geräumig – kommt auch bei Niedrigwasser zu den Inseln.",
    seebad: "Geräumig und bequem – für Bäderverkehr und Fahrten über Nord- und Ostsee.",
    nordsee: "Der Arbeitsesel der Nordsee: robust, sparsam, mit drei Klassen. Für Rotterdam, London, Kopenhagen oder Norwegen.",
    ostsee: "Größer und bequemer als der Seedampfer, mit Reichweite bis St. Petersburg. Für Stockholm, Riga und Danzig.",
    levante: "Langsam, aber genügsam und hochseetauglich. Bringt Reisende und Auswanderer nach Lissabon und ins Mittelmeer.",
    nacht: "Schnell, mit Schlafkabinen und feinem Salon. Für Nachtfahrten über Kanal und Nordsee – Anschluss an die Züge inklusive.",
    kaiserbad: "Ein schwimmender Kurpark: riesige Decks, Musik an Bord. Für den großen Bäderverkehr nach Helgoland und an die Ostseeküste.",
    turbine: "Neue Dampfturbinen, fast ohne Vibration und rasend schnell. Für die schnellen Linien nach London, Kopenhagen oder Kristiania – mit Kohlehunger.",
    kurier: "Schnell und hochseetauglich. Stark auf mittleren Strecken, reicht bis New York.",
    sued: "Robust und geräumig, mit Ladebäumen. Für die lange Fahrt nach Südamerika.",
    hansa: "Viel Platz im Zwischendeck. Für die Auswanderer nach Übersee gebaut.",
    komet: "Das Prestigeschiff: schnell, luxuriös, teuer im Betrieb. Taugt auch für Vergnügungsreisen.",
    reichspost: "Langstreckentauglich, sparsam und komfortabel – bis nach Ostasien.",
    meteor: "Zwei Schrauben, drei Schornsteine, kaum zu schlagen. Fällt seltener aus.",
    kreuz: "Weißer Rumpf, Sonnendecks, wenige, aber zahlungskräftige Gäste.",
    trajekt: "Nimmt ganze Eisenbahnwaggons mit – nur zwischen Fährbahnhöfen, mit Fracht-Einnahmen.",
  };
  const MAINT = [{ name: "Sparsam", cost: .5, wear: 2.1 }, { name: "Normal", cost: 1, wear: 1 }, { name: "Gründlich", cost: 1.7, wear: .35 }];
  const ageY = sh => (sh.age || 0) / 12;
  const ageWear = sh => 1 + Math.max(0, ageY(sh) - 10) * .08;
  const ageCost = sh => 1 + Math.max(0, ageY(sh) - 10) * .06;
  function maintCost(s, sh, lvl) { const t = TYPES[sh.type]; return P(s, t) * .035 / 12 * MAINT[lvl == null ? sh.maint : lvl].cost * ageCost(sh); }
  const EQUIP = {
    boote: { name: "Rettungsboote für alle", pct: .015, from: 1880, note: "Bei einem Untergang werden alle gerettet." },
    schotten: { name: "Wasserdichte Schotten", pct: .04, from: 1880, note: "Seenot seltener, Rettung des Schiffs wahrscheinlicher." },
    funk: { name: "Funkanlage", pct: .01, from: 1900, monthly: 60, note: "Hilfe kommt schneller. Kostet 60 Mark im Monat." },
  };
  const MK_BUDGET = [{ name: "Keine", cost: 0, gain: 0 }, { name: "Anzeigen", cost: 1500, gain: 1.6 }, { name: "Plakate", cost: 5000, gain: 3.6 }, { name: "Große Kampagne", cost: 15000, gain: 6.5 }];
  const MK_AGENCY = {
    ausw: { name: "Auswandereragenturen im Binnenland", cost: 2500, from: 1880, note: "Mehr Auswanderer buchen bei Ihnen." },
    bahn: { name: "Anschlussfahrkarten mit der Bahn", cost: 1500, from: 1880, note: "Pendler und Bahnreisende bevorzugen Ihre Fähren." },
    reise: { name: "Reisebüros und Kataloge", cost: 2000, from: 1890, note: "Badegäste und Vergnügungsreisende buchen öfter bei Ihnen." },
  };
  const NAMES_GB = ["Seagull", "Mermaid", "Northern Star", "Kittiwake", "Britannia", "Albion", "Mersey Belle", "Lady of the Isles", "Sea Breeze", "Pride of Erin", "Countess", "Duchess of Lancaster", "Highland Mary", "Ivanhoe", "Lorna Doone", "Rob Roy", "Waverley", "Puffin", "Curlew", "Cormorant", "Sunbeam", "Star of Hope", "Royal Charter", "Iona", "Columba", "Gael", "Sea King", "Neptune", "Victoria", "Prince of Wales", "Snaefell", "Tynwald", "Manxman", "Lady Margaret", "Seahorse", "Kingfisher", "Osprey", "Falcon", "Shamrock", "Thistle"];
  const CAP_FIRST_GB = ["William", "John", "Thomas", "James", "George", "Henry", "Arthur", "Edward", "Robert", "Charles", "Alfred", "Frederick", "Samuel", "Joseph", "Patrick", "Hugh", "Angus", "Owen", "David", "Walter"];
  const CAP_LAST_GB = ["Jones", "Williams", "Taylor", "Davies", "Evans", "Roberts", "Hughes", "Walker", "Wright", "Thompson", "Murray", "McLeod", "Campbell", "O'Brien", "Kelly", "Price", "Morgan", "Pritchard", "Harrison", "Fletcher"];
  const HOMES = { ham: { country: "de", river: "Elbe", bank: "der Hamburger Bank" }, lpl: { country: "gb", river: "Mersey", bank: "einer Londoner Bank" }, lon: { country: "gb", river: "Themse", bank: "einer Londoner Bank" } };
  let HOMEP = "ham", COUNTRY = "de";
  const RIV_DE = { elbe: { name: "Elbe-Sparlinie", city: "Hamburg" }, balt: { name: "Baltische Dampfer-Compagnie", city: "Stettin" } };
  const RIV_GB = { elbe: { name: "Mersey Penny Line", city: "Liverpool" }, balt: { name: "Clyde & Irish Sea Packet Company", city: "Glasgow" } };
  function applyCountry(s) {
    s.home = s.home || "ham"; s.country = s.country || HOMES[s.home].country; HOMEP = s.home; COUNTRY = s.country;
    if (typeof RIV !== "undefined") for (const k of ["elbe", "balt"]) Object.assign(RIV[k], (COUNTRY === "gb" ? RIV_GB : RIV_DE)[k]);
  }
  const homeName = s => PORTS[s.home || "ham"].name, river = s => HOMES[s.home || "ham"].river;
  const NAMES = ["Seestern", "Möwe", "Albatros", "Kormoran", "Nixe", "Auguste", "Wilhelmine", "Nordlicht", "Sturmvogel", "Hansestadt", "Elbstrand",
    "Vineta", "Undine", "Delphin", "Meerkönig", "Helene", "Pollux", "Castor", "Orion", "Thetis", "Brunhilde", "Lotsenstern", "Frieda", "Marianne",
    "Stadt Hamburg", "Stadt Altona", "Blankenese", "Alsterperle", "Elbe", "Weser", "Neptun", "Triton", "Poseidon", "Aurora", "Fortuna", "Concordia",
    "Hoffnung", "Zuversicht", "Eintracht", "Glückauf", "Wiking", "Walküre", "Loreley", "Germania", "Hammonia", "Polarstern", "Morgenstern", "Abendstern",
    "Sirius", "Wega", "Kassiopeia", "Andromeda", "Seeadler", "Kranich", "Pelikan", "Schwan", "Reiher", "Falke", "Luise", "Charlotte", "Mathilde",
    "Emma", "Clara", "Johanna", "Sophie", "Theodor", "Heinrich", "Ferdinand", "Senator", "Bürgermeister", "Kaufmann", "Kapitän Lührs", "Strandgut",
    "Ostwind", "Westwind", "Brise", "Passat", "Klabautermann", "Seemannsglück", "Deichgraf", "Leuchtfeuer", "Lotsenbote", "Hanseat", "Möwenschrei"];
  const WINTER = [0, 1, 2, 10, 11];
  const CLS_T = d => Math.max(0, Math.min(1, (d - 150) / 650));
  const CLS_K = d => { const t = CLS_T(d); return [1.5 + .9 * t, 1.1 + .35 * t, .85]; };
  const KAPPA = .4;
  const CLS_WP = [.6, 1, 1.4], CLS_WC = [1.5, 1, .6], CLS_CATER = [2.2, 1.1, .55];
  const clsName = (i, ocean) => i === 0 ? "1. Klasse" : i === 1 ? "2. Klasse" : ocean ? "Zwischendeck" : "3. Klasse";

  /* ---------- Hilfen ---------- */
  function rnd(s) {
    s.r = (s.r + 0x6D2B79F5) | 0;
    let t = s.r; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const pick = (s, arr) => arr[Math.floor(rnd(s) * arr.length)];
  function cal(m) { const k = START_MONTH + m; return { y: START_YEAR + Math.floor(k / 12), mo: k % 12 }; }
  function dateStr(m) { const c = cal(m); return MONTHS[c.mo] + " " + c.y; }
  function dim(m) { const c = cal(m); return new Date(c.y, c.mo + 1, 0).getDate(); }
  function dayStr(s) { return s.day + ". " + dateStr(s.m); }
  function newCur(s) { return { m: s.m, rev: 0, cost: {}, extra: {}, days: 0 }; }
  function income(s, label, v) { s.cash += v; const c = s.cur; if (c) { c.extra = c.extra || {}; c.extra[label] = (c.extra[label] || 0) + v; } return v; }
  function expense(s, label, v) { s.cash -= v; const c = s.cur; if (c) c.cost[label] = (c.cost[label] || 0) + v; return v; }
  const fine = (s, base) => Math.round(base * (s.pidx || 1) * (s.sizeM || 1) / 100) * 100;
  function dateAfter(s, n) { let m = s.m, d = s.day + Math.max(0, Math.round(n)); while (d > dim(m)) { d -= dim(m); m++; } return d + ". " + dateStr(m); }
  const inDock = (s, sh) => (sh.dockUntil || 0) > s.t;
  const offDuty = (s, sh) => (sh.offUntil || 0) > s.t;
  const detained = (s, sh) => sh.survey != null && sh.survey < s.t && sh.ready <= s.m;
  function dockDays(type, kind, cond) {
    const z = TYPES[type].seats;
    const d = { frist: 5 + z / 150, dock: 4 + z / 150, havarie: (8 + z / 60) * (1 + (100 - (cond == null ? 70 : cond)) / 150), maschine: 3 + z / 300, seenot: 10 + z / 50, kessel: 20 + z / 40, rumpf: 28 + z / 35, befund: 5 + z / 200 }[kind] || 7;
    return Math.max(2, Math.round(d));
  }
  function sendToDock(s, sh, days) { sh.dockUntil = Math.max(sh.dockUntil || 0, s.t) + days; return sh.dockUntil - s.t; }
  const MAJOR = { kessel: { name: "Kesselerneuerung", every: 144, pct: .12, text: "Die Kessel sind nach vielen Jahren verschlissen. Ohne neue Kessel steigt die Gefahr von Havarien, und das Schiff verbraucht mehr Kohle." },
    rumpf: { name: "Rumpferneuerung", every: 240, pct: .18, text: "Platten und Spanten sind vom Rost gezeichnet. Ohne Erneuerung nutzt sich das Schiff schneller ab und wird nie wieder richtig gut." } };
  function majorCost(s, sh, k) { return Math.round(P(s, TYPES[sh.type]) * MAJOR[k].pct / 1000) * 1000; }
  function initShip(s, sh, opt) {
    opt = opt || {};
    const A = sh.age || 0;
    sh.maj = sh.maj || { kessel: A >= 144 ? A - Math.floor(rnd(s) * 144) : 0, rumpf: A >= 240 ? A - Math.floor(rnd(s) * 240) : 0 };
    sh.majLate = sh.majLate || {};
    if (sh.survey == null) sh.survey = s.t + (opt.fresh ? (sh.ready - s.m) * 30 + 1460 : 60 + Math.floor(rnd(s) * 1300));
    if (!opt.noCap) captainFor(s, sh, opt.fresh ? 1 : 1 + Math.floor(rnd(s) * 3));
    return sh;
  }
  function uid(s) { s.nextId = (s.nextId || 1) + 1; return "x" + s.nextId; }

  /* ---------- Kapitäne ---------- */
  const CAP_SPEC = { nav: { name: "Navigator", fx: "schneller unterwegs" }, sich: { name: "Sicherheit", fx: "weniger Havarien" }, gast: { name: "Gastgeber", fx: "mehr Komfort" }, oeko: { name: "Ökonom", fx: "weniger Kohle" } };
  const CAP_XP = [0, 180, 540, 1100, 2000];
  const CAP_FIRST = ["Hinrich", "Jan", "Peter", "Johann", "Claas", "Hans", "Wilhelm", "Friedrich", "Carl", "Heinrich", "Jürgen", "Ole", "Lars", "Nils", "August", "Theodor", "Ernst", "Hermann", "Otto", "Fritz"];
  const CAP_LAST = ["Petersen", "Jansen", "Hansen", "Carstens", "Brodersen", "Thießen", "Lorenzen", "Ohlsen", "Behrens", "Harms", "Wulff", "Ketelsen", "Rickmers", "Paulsen", "Möller", "Asmussen", "Boysen", "Nissen", "Frerichs", "Janssen"];
  const SPECIAL_CAPS = {
    eis: { name: "Kapitän Ragnar Holm", title: "Der Eislotse", img: "spec_eis", fx: "Im Winter nur halbe Gefahr – Eis, Nebel und Sturmwarnungen können seinem Schiff nichts anhaben.", pay: 2 },
    rekord: { name: "Kommodore Albert von Stetten", title: "Der Rekordjäger", img: "spec_rekord", fx: "5 % schneller – ein Kandidat fürs Blaue Band.", pay: 2.2 },
    retter: { name: "Kapitän Hauke Dirksen", title: "Der Retter", img: "spec_retter", fx: "Viel bessere Aussichten in Seenot, Rettungen bringen doppeltes Ansehen.", pay: 1.8 },
    spar: { name: "Kapitän Eduard Knickrehm", title: "Der Sparfuchs", img: "spec_spar", fx: "15 % weniger Kohle und eine genügsame Mannschaft.", pay: 1.6 },
    gent: { name: "Captain Charles Whitmore", title: "Der Gentleman", img: "spec_gent", fx: "Deutlich mehr Komfort – Kaufleute und Vergnügungsreisende lieben ihn.", pay: 2 },
    watt: { name: "Kapitän Momme Jessen", title: "Der Wattenkenner", img: "spec_watt", fx: "Auf Fähr- und Küstenlinien 10 % schneller und nur halb so viele Havarien.", pay: 1.6 },
    smith: { name: "Kapitän Edward John Smith", title: "Der Millionärskapitän", img: "cap_smith", fx: "Die reichen Stammgäste folgen ihm: mehr Komfort und viel mehr Fahrgäste in der 1. Klasse.", pay: 3, bound: "titanic",
      story: "Edward John Smith (1850–1912) war der dienstälteste Kapitän seiner Reederei und bei wohlhabenden Reisenden so beliebt, dass man ihn den „Millionärskapitän“ nannte. Die Jungfernfahrt der Titanic im April 1912 sollte angeblich seine letzte Reise vor dem Ruhestand sein; er ging mit seinem Schiff unter. In diesem Spiel steht er weiter auf der Brücke." },
    rostron: { name: "Kapitän Arthur Rostron", title: "Der Held der Carpathia", img: "cap_rostron", fx: "Führt Rettungen meisterhaft: viel bessere Aussichten in Seenot für sein Schiff, Rettungen bringen doppeltes Ansehen.", pay: 2.2, bound: "carpathia",
      story: "Arthur Rostron (1869–1940) führte im April 1912 die Carpathia mit voller Kraft durch das Eisfeld zur Unglücksstelle der Titanic und nahm über 700 Überlebende an Bord. Später wurde er Kommodore seiner Reederei und für die Rettung vielfach geehrt." },
    emil: { name: "Kapitän Emil", title: "Der Glücksbringer", img: "ev_emil", fx: "Glücksschiff: nur halb so viele Havarien, bessere Aussichten in Seenot.", pay: 1, bound: "emil" },
  };
  const OFFER_CAPS = ["eis", "rekord", "retter", "spar", "gent", "watt"];
  function capLevel(c) { if (c.sp) return 5; let l = 1; for (let i = 1; i < CAP_XP.length; i++) if (c.xp >= CAP_XP[i]) l = i + 1; return l; }
  function caps(s) { return s.caps || (s.caps = []); }
  function capOf(s, sh) { return caps(s).find(c => c.ship === sh.id); }
  function newCaptain(s, lvl) {
    const specs = Object.keys(CAP_SPEC);
    const gb = (s.country || COUNTRY) === "gb", c = { id: uid(s), name: pick(s, gb ? CAP_FIRST_GB : CAP_FIRST) + " " + pick(s, gb ? CAP_LAST_GB : CAP_LAST), img: "cap_" + (1 + Math.floor(rnd(s) * 6)), spec: pick(s, specs), xp: CAP_XP[clamp((lvl || 1) - 1, 0, 4)] + Math.floor(rnd(s) * 60), ship: null };
    caps(s).push(c); return c;
  }
  function specialCaptain(s, key) { const K = SPECIAL_CAPS[key]; const c = { id: uid(s), name: K.name, img: K.img, spec: null, sp: key, xp: 2000, ship: null, bound: !!K.bound }; caps(s).push(c); return c; }
  function capPay(s, c) {
    const L = capLevel(c), sh = c.ship ? s.ships.find(x => x.id === c.ship) : null;
    if (c.sp) return 150 * SPECIAL_CAPS[c.sp].pay * s.wage * (sh ? 1 : .5);
    if (!sh) return 60 * (1 + .3 * (L - 1)) * s.wage;
    return (40 + TYPES[sh.type].crew * .04) * .3 * (L - 1) * s.wage;
  }
  function captainFor(s, sh, lvl) {
    if (capOf(s, sh)) return;
    if (sh.type === "titanic" && !caps(s).some(c => c.sp === "smith")) { specialCaptain(s, "smith").ship = sh.id; return; }
    if (sh.type === "carpathia" && !caps(s).some(c => c.sp === "rostron")) { specialCaptain(s, "rostron").ship = sh.id; return; }
    newCaptain(s, lvl).ship = sh.id;
  }
  function capFx(s, sh) {
    const c = capOf(s, sh), f = { spd: 1, risk: 1, com: 0, coal: 1, seenot: 0, crew: 1, first: 0, winter: 1, noHit: false, rescue: 1 };
    if (!c) return f;
    const L = capLevel(c) - 1; f.seenot += .02 * L;
    if (c.spec === "nav") f.spd *= 1 + .01 * L; if (c.spec === "sich") f.risk *= 1 - .06 * L; if (c.spec === "gast") f.com += .12 * L; if (c.spec === "oeko") f.coal *= 1 - .03 * L;
    switch (c.sp) {
      case "eis": f.winter = .5; f.noHit = true; break;
      case "rekord": f.spd *= 1.05; break;
      case "retter": case "rostron": f.seenot += .2; f.rescue = 2; break;
      case "spar": f.coal *= .85; f.crew = .9; break;
      case "gent": f.com += .6; break;
      case "watt": { const i = infoOf(s, sh); if (i && (i.kind.cat === "Fähre" || i.kind.cat === "Küste")) { f.spd *= 1.1; f.risk *= .5; } break; }
      case "smith": f.com += .5; f.first = .35; break;
    }
    return f;
  }
  function assignCaptain(s, shipId, capId) {
    const sh = s.ships.find(x => x.id === shipId); if (!sh) return;
    const cur = capOf(s, sh);
    if (cur && cur.bound) return cur.name + " bleibt bei „seinem“ Schiff.";
    const c = caps(s).find(x => x.id === capId);
    if (!c) { if (cur) cur.ship = null; return null; }
    if (c.bound) return c.name + " fährt nur auf „seinem“ Schiff.";
    const from = c.ship ? s.ships.find(x => x.id === c.ship) : null;
    if (cur) cur.ship = from ? from.id : null;
    c.ship = sh.id;
    return null;
  }
  function hireCaptain(s) { const cost = Math.round(1500 * s.pidx / 100) * 100; if (s.cash < cost) return "Nicht genug Geld."; expense(s, "Sonderausgaben", cost); const c = newCaptain(s, 1); s.log.unshift({ m: s.m, head: "Neuer Kapitän: " + c.name, text: "Er wartet in der Reserve auf ein Schiff. Handgeld " + fmt(cost) + " Mark.", kind: "own", img: c.img }); return null; }
  function dismissCaptain(s, id) { const c = caps(s).find(x => x.id === id); if (!c || c.ship || c.bound) return "Nur Kapitäne in der Reserve können entlassen werden."; s.caps = caps(s).filter(x => x !== c); return null; }
  function captainsDay(s) {
    for (const c of caps(s)) {
      if (c.sp || !c.ship) continue;
      const sh = s.ships.find(x => x.id === c.ship); if (!sh || !active(s, sh)) continue;
      const L0 = capLevel(c); c.xp += 1; const L1 = capLevel(c);
      if (L1 > L0) s.log.unshift({ m: s.m, head: c.name + " ist jetzt Kapitän der Stufe " + L1, text: "Erfahrung macht sich bezahlt: " + CAP_SPEC[c.spec].name + " – " + CAP_SPEC[c.spec].fx + ". Seine Heuer steigt etwas.", kind: "own", img: c.img });
    }
  }
  function capOffer(s) {
    const free = OFFER_CAPS.filter(k => !caps(s).some(c => c.sp === k) && (s.flags["cap_" + k] || 0) < 2);
    if (!free.length || s.pending.length || rnd(s) > .015 || !s.ships.length) return;
    const k = pick(s, free), K = SPECIAL_CAPS[k], fee = Math.round(6000 * K.pay * s.pidx / 100) * 100;
    s.flags["cap_" + k] = (s.flags["cap_" + k] || 0) + 1;
    s.pending.push({ id: "kapitan", key: k, fee, day: 3 + Math.floor(rnd(s) * 20), img: K.img, head: K.title + " sucht ein Kommando", text: K.name + " ist in allen Häfen bekannt und bietet Ihrer Reederei seine Dienste an. " + K.fx + " Er verlangt ein Handgeld von " + fmt(fee) + " Mark und eine hohe Heuer." });
  }
  function fmt(n) { n = Math.round(n); const neg = n < 0; let x = Math.abs(n).toString(); x = x.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return (neg ? "−" : "") + x; }
  const P = (s, t) => t.price * (s.pidx || 1);
  const yearOf = s => cal(s.m).y;
  const typeOpen = (s, k) => !!TYPES[k] && yearOf(s) >= TYPES[k].from;
  const pairKey = (a, b) => a < b ? a + "|" + b : b + "|" + a;
  const up = (s, k, v) => { s[k] = clamp(s[k] + v, 0, 100); };

  function randomName(s, avoid) {
    if ((s.country || COUNTRY) === "gb") { const used = new Set(s.ships.map(x => x.name).concat(avoid || [])), free = NAMES_GB.filter(n => !used.has(n)); return free.length ? pick(s, free) : pick(s, NAMES_GB) + " " + ["II", "III", "IV"][Math.floor(rnd(s) * 3)]; }
    const used = new Set(s.ships.map(x => x.name).concat(s.market.map(x => x.name)).concat(avoid ? [avoid] : []));
    const free = NAMES.filter(n => !used.has(n));
    const r = Math.floor(Math.random() * 1e9);
    if (free.length) return free[r % free.length];
    return NAMES[r % NAMES.length] + " " + (["II", "III", "IV", "V"][r % 4]);
  }
  function cleanName(n) { return String(n || "").replace(/[<>"]/g, "").trim().slice(0, 28); }

  /* ---------- Streckenmodell ---------- */
  let infoCache = { key: null, map: {} };
  function tourOpen(s, id) { const p = PORTS[id]; return p.tour > 0 && yearOf(s) >= p.tourFrom; }
  function routeInfo(s, a, b, cruise) {
    const y = yearOf(s), ck = s.m + ":" + (s.pmVer || 0);
    if (infoCache.key !== ck) infoCache = { key: ck, map: {} };
    const key = a + ">" + b + (cruise ? ">c" : "");
    if (infoCache.map[key]) return infoCache.map[key];
    const path = seaPath(a, b, y);
    if (!path) return null;
    const d = path.dist, seg = segments(a, b, d, y, s.pm), pm = (s.pair && s.pair[pairKey(a, b)]) || 1;
    if (cruise) { for (const k in seg) if (k !== "tour") seg[k] = 0; } else seg.tour = 0;
    let D0 = 0; for (const k in seg) D0 += seg[k];
    D0 *= pm;
    const share = {}; for (const k in seg) share[k] = D0 > 0 ? seg[k] * pm / D0 : 0;
    const w = { p: 0, s: 0, c: 0, r: 0, f: 0 }, season = new Array(12).fill(0);
    const tourS = [PORTS[a], PORTS[b]].filter(p => p.tour > 0 && p.tourSeason).map(p => TOUR_SEASON[p.tourSeason])[0] || TOUR_SEASON.nord;
    for (const k in SEG) {
      const sh = share[k] || 0; if (!sh) continue;
      for (const q in w) w[q] += SEG[k].w[q] * sh;
      const se = k === "tour" ? tourS : SEG[k].season;
      for (let i = 0; i < 12; i++) season[i] += se[i] * sh;
    }
    if (D0 === 0) { Object.assign(w, SEG.gen.w); for (let i = 0; i < 12; i++) season[i] = 1; }
    const bf = baseFare(d), minFare = { bath: 2.5 * Math.min(1, (d + 3) / 10), local: .3, transit: 2.5 * Math.min(1, (d + 5) / 60) };
    let ref = 0; for (const k in SEG) if (k !== "tour") ref += (share[k] || 0) * Math.max(minFare[k] || 0, bf * SEG[k].fare);
    if (cruise) ref = 150 + .25 * d;
    if (!ref) ref = bf;
    const areas = Object.keys(path.areas);
    const ocean = areas.some(x => OCEAN[x]);
    let risk = [0, 0]; for (const ar of areas) { risk[0] = Math.max(risk[0], AREA_RISK[ar][0]); risk[1] = Math.max(risk[1], AREA_RISK[ar][1]); }
    risk = risk.map(x => x + .001 * d / 1000);
    const wear = [.45 + .3 * Math.exp(-d / 200), (.45 + .3 * Math.exp(-d / 200)) * 1.3];
    const turn = (d < 10 ? .15 : d < 100 ? .5 : d < 200 ? 1 : d < 1000 ? 2 : d < 2000 ? 3 : d < 5000 ? 5 : 8) + (cruise ? 3 : 0);
    const fee = (W.portVal(s.pm, a, "fee") + W.portVal(s.pm, b, "fee")) / 2 + path.canalFee;
    const cater = cruise ? .06 * d : d < 40 ? 0 : d * .0075;
    const compSeats = cruise ? 200 : d < 120 ? 150 : d < 400 ? 300 : d < 1500 ? 400 : 1000;
    let compDeps = D0 * (.95 + .95 * (1 - CLS_T(d))) / (compSeats * 2); if (compDeps < .4) compDeps = 0;
    const compSpeed = (d < 200 ? 10 : d < 800 ? 12 : (a === "ny" || b === "ny") ? 13.5 : 12.5) + .08 * (y - 1880);
    const compComfort = (share.tour || 0) > .4 ? 4 : d > 800 ? 3 : (share.bath || 0) > .4 ? 3 : 2;
    const tr = id => y >= PORTS[id].trFrom && PORTS[id].tr > 0;
    const shallow = PORTS[a].shallow || PORTS[b].shallow;
    const names = ["Vereinigte", "Nordische", "Hanseatische", "Königliche", "Freie", "Neue", "Baltische", "Atlantische"];
    const h = (a + b).split("").reduce((x, c) => x + c.charCodeAt(0), 0);
    const compName = names[h % names.length] + " " + (d < 200 ? "Dampfschiffahrt" : "Dampfer-Linie");
    const top = Object.keys(share).filter(k => share[k] > .08).sort((x, y2) => share[y2] - share[x]).map(k => SEG[k].name + " " + Math.round(share[k] * 100) + " %");
    const SEG_MIX = { local: [0, .2, .8], bath: [.25, .5, .25], transit: [.15, .45, .4], biz: [.4, .45, .15], ausw: [.03, .12, .85], tour: [1, 0, 0], gen: [.1, .35, .55] };
    let mix = [0, 0, 0]; for (const k in share) for (let i = 0; i < 3; i++) mix[i] += (share[k] || 0) * SEG_MIX[k][i];
    if (mix[0] + mix[1] + mix[2] < .5) mix = [.1, .35, .55];
    const kk = CLS_K(d), avgk = mix[0] * kk[0] + mix[1] * kk[1] + mix[2] * kk[2];
    const refC = kk.map(x => ref * x / avgk), caterC = CLS_CATER.map(x => cater * x);
    const kind = cruise ? { cat: "Vergnügungsreise", grp: 2 } : areas.some(x => OCEAN[x]) ? { cat: "Hochsee", grp: 2 } : d > 350 ? { cat: "Nord-/Ostsee", grp: 1 } :
      (d < 120 && ((share.local || 0) + (share.transit || 0) > .45 || PORTS[a].shallow || PORTS[b].shallow)) ? { cat: "Fähre", grp: 0 } : { cat: "Küste", grp: 0 };
    kind.sub = cruise ? "" : d < 20 && (share.local || 0) > .5 ? "Hafenfähre" : tr(a) && tr(b) ? "Bahnanschluss" : (share.bath || 0) > .5 ? "Bäderlinie" : (share.ausw || 0) > .4 ? "Auswandererlinie" : (share.biz || 0) > .5 ? "Geschäftslinie" : "";
    const info = { a, b, cruise: !!cruise, mix, refC, caterC, compSeats, kind, name: (cruise ? "Vergnügungsreise " : "") + PORTS[a].name + " – " + PORTS[b].name, dist: d, path, areas, ocean, D0, share, w, season, ref, risk, wear, turn, fee, cater, shallow,
      rail: tr(a) && tr(b), comp: { deps: compDeps, speed: compSpeed, comfort: compComfort, name: compName }, who: top.join(", ") || "kaum Nachfrage" };
    infoCache.map[key] = info;
    return info;
  }
  function canServe(s, type, a, b, cruise, stops) {
    if (stops && stops.length) {
      const t = TYPES[type], ports = [a, ...stops, b];
      if (t.trajekt) return "Eisenbahnfähren fahren nur direkt zwischen Fährbahnhöfen.";
      if (t.cruiseOnly) return "Das Traumschiff fährt nur Vergnügungsreisen.";
      for (let k = 0; k < ports.length - 1; k++) { const w = canServe(s, type, ports[k], ports[k + 1], false); if (w) return PORTS[ports[k]].name + " – " + PORTS[ports[k + 1]].name + ": " + w; }
      return null;
    }
    const t = TYPES[type], info = routeInfo(s, a, b, cruise);
    if (!info) return "Keine Seeverbindung.";
    if (info.dist > t.range) return "Zu weit für diesen Schiffstyp (Reichweite " + fmt(t.range) + " sm).";
    if (info.shallow && !t.shallow) return "Der Hafen ist zu flach – nur flach gebaute Schiffe.";
    if (info.ocean && !t.ocean) return "Die Strecke führt über den Ozean – nur hochseetaugliche Schiffe.";
    if (t.trajekt && !info.rail) return "Eisenbahnfähren fahren nur zwischen Fährbahnhöfen.";
    if (t.cruiseOnly && !cruise) return "Das Traumschiff fährt nur Vergnügungsreisen.";
    if (cruise && t.comfort < 3) return "Für Vergnügungsreisen zu wenig Komfort (mindestens drei Sterne).";
    return null;
  }
  const routeOf = (s, sh) => sh.line && s.routes.find(r => r.id === sh.line);
  function compDepsOf(s, r, info) { const base = r.compOverride != null ? r.compOverride : info.comp.deps; return base * (r.compMult || 1); }
  const infoOf = (s, sh) => { const r = routeOf(s, sh); return r ? routeInfo(s, r.a, r.b, r.cruise) : null; };
  function stopInfo(s, ports) {
    const ck = s.m + ":" + (s.pmVer || 0); if (infoCache.key !== ck) infoCache = { key: ck, map: {} };
    const key = "S" + ports.join(">"); if (infoCache.map[key]) return infoCache.map[key];
    const legs = []; for (let k = 0; k < ports.length - 1; k++) { const L = routeInfo(s, ports[k], ports[k + 1], false); if (!L) return null; legs.push(L); }
    const main = routeInfo(s, ports[0], ports[ports.length - 1], false); if (!main) return null;
    const ods = [];
    for (let i = 0; i < ports.length - 1; i++) for (let j = i + 1; j < ports.length; j++) {
      const I = i === 0 && j === ports.length - 1 ? main : routeInfo(s, ports[i], ports[j], false); if (!I) continue;
      let along = 0; for (let k = i; k < j; k++) along += legs[k].dist;
      ods.push({ i, j, info: I, along, legs: Array.from({ length: j - i }, (_, n) => i + n) });
    }
    const dist = legs.reduce((a, L) => a + L.dist, 0), nodes = [];
    legs.forEach((L, k) => { const n = L.path.nodes; nodes.push(...(k ? n.slice(1) : n)); });
    const areas = [...new Set(legs.flatMap(L => L.areas))], ocean = legs.some(L => L.ocean), shallow = legs.some(L => L.shallow);
    const wavg = f => legs.reduce((a, L) => a + f(L) * L.dist, 0) / Math.max(1, dist);
    const D0 = ods.reduce((a, o) => a + o.info.D0, 0), share = {};
    for (const o of ods) for (const k in o.info.share) share[k] = (share[k] || 0) + o.info.share[k] * o.info.D0 / Math.max(1, D0);
    const mix = [0, 1, 2].map(c => ods.reduce((a, o) => a + o.info.mix[c] * o.info.D0, 0) / Math.max(1, D0));
    const info = Object.assign({}, main, { stops: ports.slice(1, -1), ports, legs, ods, multi: true,
      name: ports.map(p => PORTS[p].name).join(" – "), dist, path: { nodes, dist }, areas, ocean, shallow, D0, share, mix,
      risk: [0, 1].map(x => wavg(L => L.risk[x])), wear: [0, 1].map(x => wavg(L => L.wear[x])),
      fee: ports.reduce((a, p) => a + PORTS[p].fee, 0) / ports.length, turn: main.turn + .5 * (ports.length - 2),
      kind: Object.assign({}, dist > 350 && !ocean ? { cat: "Nord-/Ostsee", grp: 1 } : main.kind, { sub: "mit Zwischenhalt" }),
      who: main.who, rail: false });
    infoCache.map[key] = info; return info;
  }
  const rInfo = (s, r) => r.stops && r.stops.length ? stopInfo(s, [r.a, ...r.stops, r.b]) : routeInfo(s, r.a, r.b, r.cruise);

  /* ---------- Werte ---------- */
  function shipValue(s, sh) { const t = TYPES[sh.type]; return Math.round(P(s, t) * Math.pow(0.95, sh.age / 12) * (0.75 + 0.25 * sh.cond / 100) * s.shipIdx); }
  function fleetValue(s) { return s.ships.reduce((a, sh) => a + (sh.ready <= s.m ? shipValue(s, sh) : sh.paid || 0), 0); }
  function debt(s) { return s.loans.reduce((a, l) => a + l.out, 0); }
  function equity(s) { return s.cash + fleetValue(s) - debt(s); }
  function rating(s) {
    const assets = Math.max(1, Math.max(0, s.cash) + fleetValue(s));
    const q = (s.cash + fleetValue(s) - s.loans.filter(l => !l.founder).reduce((a, l) => a + l.out, 0)) / assets;
    let g = q >= .6 ? 0 : q >= .45 ? 1 : q >= .3 ? 2 : q >= .15 ? 3 : 4;
    g = Math.min(4, g + (s.strikes || 0));
    return { grade: "ABCDE"[g], idx: g, q };
  }
  function loanRate(s, kind) {
    const r = rating(s), spread = [1.0, 1.6, 2.5, 4.0, 99][r.idx];
    if (spread > 50 && kind !== "werft") return null;
    return Math.round((s.base + (r.idx === 4 ? 6 : spread) + (kind === "werft" ? 2.2 : 0)) * 10) / 10;
  }
  const FIN = {
    bar: { name: "Barkauf", down: 1, months: 0, note: "3 % Skonto, keine Raten" },
    bank: { name: "Bankkredit", down: .3, months: 120, note: "30 % Anzahlung, 10 Jahre, Versicherung Pflicht" },
    werft: { name: "Werftkredit", down: .15, months: 84, note: "15 % Anzahlung, 7 Jahre, teurer Zins" },
    used: { name: "Bankkredit", down: .4, months: 72, note: "40 % Anzahlung, 6 Jahre, Versicherung Pflicht" },
  };
  function annuity(Pn, ratePct, n) { const r = ratePct / 100 / 12; return r === 0 ? Pn / n : Pn * r / (1 - Math.pow(1 + r, -n)); }
  function newPrice(s, type) { const d = s.discount && s.discount.until >= s.m ? s.discount.f : 1; return Math.round(P(s, TYPES[type]) * d * seriesFactor(s, type) / 1000) * 1000; }
  function quote(s, price, kind) {
    const f = FIN[kind];
    if (kind === "bar") return { ok: s.cash >= Math.round(price * .97), now: Math.round(price * .97), loan: 0, rate: 0, pay: 0, months: 0, name: f.name, note: f.note, reason: "Nicht genug Geld." };
    const rate = loanRate(s, kind);
    if (rate === null) return { ok: false, reason: "Die Bank gibt bei Bonität E keinen Kredit.", name: f.name, note: f.note };
    const now = Math.round(price * f.down), loan = price - now;
    return { ok: s.cash >= now, now, loan, rate, pay: Math.round(annuity(loan, rate, f.months)), months: f.months, name: f.name, note: f.note, reason: s.cash < now ? "Nicht genug Geld für die Anzahlung." : "" };
  }

  /* ---------- Spielstart und Migration ---------- */
  function newGame(seed, name, opt) {
    opt = opt || {};
    const s = { v: 3, seed, r: seed | 0, m: 0, name: name || "Neue Reederei", cash: 450000, rep: 50, prestige: 0,
      konj: 1, shipIdx: 1, coal: 1, base: 4.5, crewMult: 1, feeMult: 1, wage: 1, pidx: 1, strikes: 0, negMonths: 0,
      routes: [], ships: [], loans: [], market: [], contracts: {}, mods: [], log: [], pending: [], hist: [], seen: {}, done: {},
      stats: { pax: 0, sunk: 0, lost: 0, profitSum: 0, band: false }, last: null, over: null, nextId: 1, discount: null,
      mk: { budget: 0, ag: {}, brand: 10, hallen: false }, pm: {}, pmVer: 0, pair: {}, insMult: 1, flags: {}, day: 1, speed: 0, t: 0 };
    s.cur = newCur(s);
    s.home = HOMES[opt.home] ? opt.home : "ham"; s.country = HOMES[s.home].country;
    migrate(s);
    s.loans.push({ id: uid(s), label: "Gründungskredit " + HOMES[s.home].bank, out: 450000, rate: 3.5, pay: Math.round(450000 * .035 / 12), left: 240, grace: 36, founder: true });
    s.flags.hadFounder = true;
    if (isEmil(s.name)) s.flags.emilFirm = true;
    addListing(s, "moewe", 14 * 12); addListing(s, "seebad", 9 * 12); addListing(s, "kurier", 19 * 12);
    s.log.unshift({ m: 0, head: "Eine neue Reederei in " + homeName(s), text: s.name + " eröffnet ihr Kontor am Hafen. Noch fährt kein einziges Schiff unter ihrer Flagge.", kind: "news" });
    return s;
  }
  const OLD_LINES = { hafen: ["ham", "fin"], cux: ["ham", "cux"], helgo: ["ham", "hel"], norder: ["ndd", "nor"], kiel: ["kie", "kor"], kopen: ["lue", "kop"], gedser: ["war", "ged"],
    rot: ["ham", "rot"], london: ["ham", "lon"], ny: ["ham", "ny"], sued: ["ham", "rio"], asien: ["ham", "sha"], nordland: ["ham", "ber"], orient: ["ham", "kon"] };
  function migrate(s) {
    if (!s) return s;
    s.seen = s.seen || {}; s.done = s.done || {}; s.feeMult = s.feeMult || 1; s.wage = s.wage || 1; s.pidx = s.pidx || 1;
    s.mk = s.mk || { budget: 0, ag: {}, brand: 10, hallen: false }; s.pm = s.pm || {}; s.pmVer = s.pmVer || 0; s.pair = s.pair || {}; s.insMult = s.insMult || 1; s.flags = s.flags || {};
    s.stats.lost = s.stats.lost || 0;
    if (s.over === "ende") s.over = null;
    if (!s.routes) {
      s.routes = [];
      const map = {};
      for (const sh of s.ships) {
        sh.eq = sh.eq || {};
        if (sh.line && OLD_LINES[sh.line]) {
          const old = sh.line, [a, b] = OLD_LINES[old];
          if (!map[old]) { const pf = s.lines && s.lines[old] ? s.lines[old].price / refOld(old) : 1; const r = { id: uid(s), a, b, cruise: old === "nordland" || old === "orient", pf: clamp(pf || 1, .5, 1.8), compMult: 1, demMult: 1, opened: s.m }; s.routes.push(r); map[old] = r.id; }
          sh.line = map[old];
        } else sh.line = null;
      }
      const cmap = { post: ["ham", "ny"], insel: ["ham", "hel"], asien: ["ham", "sha"] };
      for (const k of Object.keys(s.contracts || {})) { const c = s.contracts[k]; if (cmap[k]) { c.a = cmap[k][0]; c.b = cmap[k][1]; delete c.line; } else delete s.contracts[k]; }
      s.pending = (s.pending || []).filter(p => p.id === "margin" || p.id === "taufe");
      delete s.lines;
    }
    for (const sh of s.ships) sh.eq = sh.eq || {};
    for (const r of s.routes) if (!Array.isArray(r.pf)) { const f = r.pf || 1; r.pf = [f, f, f]; }
    for (const r of s.routes) if (!r.price) { const i = routeInfo(s, r.a, r.b, r.cruise); r.price = [0, 1, 2].map(c => i ? Math.round(i.refC[c] * r.pf[c] * (s.pidx || 1) * 100) / 100 : 1); }
    for (const r of s.routes) if (r.adOn == null) r.adOn = r.camp != null && r.camp >= s.m;
    s.day = s.day || 1; s.cur = s.cur || newCur(s); if (s.speed == null) s.speed = 1;
    applyCountry(s); registerDesigns(s); staff(s); caps(s);
    if (yearOf(s) >= 1925) PORTS.osl.name = "Oslo"; else PORTS.osl.name = "Kristiania";
    if (PORTS.fue) PORTS.fue.name = yearOf(s) >= 1956 ? "Puerto del Rosario (Fuerteventura)" : "Puerto de Cabras (Fuerteventura)";
    for (const sh of s.ships) { if (sh.emil && !caps(s).some(c => c.sp === "emil")) specialCaptain(s, "emil").ship = sh.id; if (!capOf(s, sh)) captainFor(s, sh, 1 + Math.min(4, Math.floor((sh.age || 0) / 36))); }
    if (!s.exp) s.exp = { k: 50, s: 50, si: 50 }; if (!s.expHit) s.expHit = { si: 0, k: 0 }; if (!s.years) s.years = {};
    if (s.t == null) { let t = 0; for (let m = 0; m < s.m; m++) t += dim(m); s.t = t + s.day - 1; }
    if (s.m > 0 && !s.flags.hadFounder) s.flags.hadFounder = true;
    s.ships.forEach((sh, i) => { if (sh.repair != null) { if (sh.repair >= s.m) sh.dockUntil = s.t + 10; delete sh.repair; } if (sh.survey == null) sh.survey = s.t + 120 + (i * 337) % 1300; initShip(s, sh); });
    s.v = 3;
    return s;
  }
  function refOld(id) { return { hafen: .25, cux: 2.2, helgo: 6, norder: 2.2, kiel: 4.5, kopen: 9, gedser: 3.5, rot: 24, london: 30, ny: 95, sued: 120, asien: 380, nordland: 220, orient: 700 }[id] || 1; }

  function addListing(s, type, ageM) {
    const age = ageM != null ? ageM : Math.floor((3 + rnd(s) * 20) * 12);
    const cond = Math.round(clamp(35 + rnd(s) * 60 - age / 12, 20, 95));
    const est = Math.round(clamp(cond + (rnd(s) * 30 - 15), 15, 100));
    const price = Math.round(shipValue(s, { type, age, cond }) * (0.95 + rnd(s) * 0.2) / 1000) * 1000;
    const L = { id: uid(s), type, age, cond, est, surveyed: false, price, name: randomName(s) };
    report(s, L); s.market.push(L);
  }
  // Verdeckte Mängel und Frist eines Gebrauchtschiffs (bleiben bis zum Kauf gleich)
  function report(s, L) {
    if (L.rep) return L.rep;
    const t = TYPES[L.type], p = P(s, t), r = () => rnd(s), dmg = [];
    const roll = r(), frist = roll < .3 ? -Math.floor(10 + r() * 200) : roll < .6 ? Math.floor(30 + r() * 335) : Math.floor(365 + r() * 1100);
    if (L.age >= 144 && r() < .6) dmg.push({ k: "kessel", name: "Kessel verschlissen – Erneuerung nötig", cost: Math.round(p * MAJOR.kessel.pct / 1000) * 1000 });
    if (L.age >= 240 && r() < .6) dmg.push({ k: "rumpf", name: "Rumpf stark angerostet – Erneuerung nötig", cost: Math.round(p * MAJOR.rumpf.pct / 1000) * 1000 });
    if (L.cond < 65) dmg.push({ k: "rost", name: "Rost an Deck und Aufbauten", cost: Math.round(p * .02 / 100) * 100 });
    if (r() < .35) dmg.push({ k: "maschine", name: "Maschine läuft unruhig, Lager ausgeschlagen", cost: Math.round(p * .015 / 100) * 100 });
    if (r() < .2) dmg.push({ k: "schraube", name: "Schraube verbogen", cost: Math.round(p * .01 / 100) * 100 });
    L.rep = { frist, fristAt: s.t, dmg };
    return L.rep;
  }
  function reportInfo(s, L) {
    const R = report(s, L), left = R.frist - (s.t - R.fristAt), fcost = Math.round(P(s, TYPES[L.type]) * .02 / 100) * 100;
    const total = R.dmg.reduce((a, d) => a + d.cost, 0) + (left < 60 ? fcost : 0);
    return { left, fcost, dmg: R.dmg, total };
  }

  /* ---------- Befehle ---------- */
  function openRoute(s, a, b, cruise, stops) {
    cruise = !!cruise; stops = cruise ? [] : (stops || []).filter(x => x && x !== a && x !== b).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 2);
    if (a === b) return "Start und Ziel sind gleich.";
    const sk = r => (r.stops || []).join(",");
    if (s.routes.some(r => !!r.cruise === cruise && sk(r) === stops.join(",") && ((r.a === a && r.b === b) || (r.a === b && r.b === a && !stops.length)))) return "Diese Linie betreiben Sie bereits.";
    if (cruise && !tourOpen(s, b) && !tourOpen(s, a)) return "Zu diesem Ziel gibt es (noch) keine Vergnügungsreisen.";
    const info = stops.length ? stopInfo(s, [a, ...stops, b]) : routeInfo(s, a, b, cruise); if (!info) return "Keine Seeverbindung.";
    const cost = Math.round(2000 * s.pidx);
    if (s.cash < cost) return "Nicht genug Geld für Agentur und Anleger.";
    expense(s, "Agenturen", cost);
    const r = { id: uid(s), a, b, cruise, stops: stops.length ? stops : undefined, price: info.refC.map(x => roundPrice(x * s.pidx)), compMult: 1, demMult: 1, opened: s.m };
    s.routes.push(r);
    s.log.unshift({ m: s.m, head: "Neue Linie: " + info.name, text: "Agentur und Anleger kosten " + fmt(cost) + " Mark. Jetzt fehlen nur noch Schiffe.", kind: "own", route: r.id });
    return null;
  }
  function closeRoute(s, id) {
    const r = s.routes.find(x => x.id === id); if (!r) return;
    if (s.ships.some(sh => sh.line === id)) return "Auf der Linie fahren noch Schiffe.";
    s.routes = s.routes.filter(x => x !== r);
    return null;
  }
  function brandtPrice(s, type) { return Math.round(newPrice(s, type) * 1.12 / 1000) * 1000; }
  function buyNew(s, type, kind, name, brandt, opt) {
    if (!typeOpen(s, type)) return "Diesen Schiffstyp baut noch keine Werft.";
    const eqSel = ((opt && opt.eq) || []).filter(k => FACTORY_PCT[k] && yearOf(s) >= EQUIP[k].from);
    const t = TYPES[type], price = (brandt ? brandtPrice(s, type) : newPrice(s, type)) + eqSel.reduce((a, k) => a + factoryEqCost(s, type, k), 0), q = quote(s, price, kind);
    if (!q.ok) return q.reason || "Nicht genug Geld.";
    s.cash -= q.now;
    const sh = initShip(s, { id: uid(s), name: cleanName(name) || randomName(s), type, age: 0, cond: 100, line: null, laid: false, insured: true, maint: 1, ready: s.m + Math.max(2, t.build - (brandt ? 1 : 0)), paid: price, isNew: true, eq: {}, spd: brandt ? .7 : 0, brandt: !!brandt }, { fresh: true });
    if (brandt) { const st = rivState(s, "brandt"); st.boost = Math.min(.5, st.boost + .04); }
    if (yearOf(s) >= 1912) sh.eq.boote = true;
    for (const k of eqSel) sh.eq[k] = true;
    if (t.design && s.designs && s.designs[t.design]) s.designs[t.design].built++;
    s.ships.push(sh);
    if (q.loan) addLoan(s, q, sh, kind === "werft" ? "Werftkredit" : "Bankkredit");
    emilCheck(s, sh);
    s.log.unshift({ m: s.m, head: "Neubau bestellt: „" + sh.name + "“", text: t.name + " (" + t.cls + ")" + (brandt ? " in Brandt-Bauart – 0,7 Knoten schneller. Brandt & Söhne verdient kräftig mit" : "") + ", Ablieferung " + dateStr(sh.ready) + ".", kind: "own", img: brandt ? "ev_brandtwerft" : undefined });
    return null;
  }
  function buyUsed(s, id, kind, name) {
    const L = s.market.find(x => x.id === id); if (!L) return "Angebot nicht mehr verfügbar.";
    const q = quote(s, L.price, kind === "bar" ? "bar" : "used");
    if (!q.ok) return q.reason || "Nicht genug Geld.";
    s.cash -= q.now;
    const ri = reportInfo(s, L);
    const sh = initShip(s, { id: uid(s), name: cleanName(name) || L.name, type: L.type, age: L.age, cond: L.cond, line: null, laid: false, insured: true, maint: 1, ready: s.m, paid: L.price, eq: {}, survey: s.t + ri.left,
      maj: { kessel: ri.dmg.some(d => d.k === "kessel") ? L.age - 144 : L.age, rumpf: ri.dmg.some(d => d.k === "rumpf") ? L.age - 240 : Math.max(0, L.age - Math.floor(rnd(s) * 200)) },
      defects: ri.dmg.filter(d => d.k === "maschine" || d.k === "schraube").map(d => d.k) });
    sh.spd = -(sh.defects.includes("maschine") ? .3 : 0) - (sh.defects.includes("schraube") ? .2 : 0);
    s.ships.push(sh);
    if (q.loan) addLoan(s, q, sh, "Bankkredit");
    s.market = s.market.filter(x => x.id !== id);
    let txt = TYPES[sh.type].name + ", Baujahr " + (yearOf(s) - Math.floor(sh.age / 12)) + ".";
    if (!L.surveyed) {
      const found = ri.dmg.map(d => d.name);
      if (ri.left < 0) found.unshift("die Frist ist abgelaufen");
      txt += found.length ? " Ohne Gutachten gekauft – jetzt zeigt sich: " + found.join(", ") + "." : " Ohne Gutachten gekauft – und Glück gehabt, keine versteckten Mängel.";
      if (L.cond < L.est - 8) txt += " Der Zustand ist schlechter als angegeben.";
    } else if (ri.left < 0) txt += " Denken Sie daran: Die Frist ist abgelaufen, das Schiff darf erst nach der Fristprüfung auslaufen.";
    s.log.unshift({ m: s.m, head: "Gebraucht gekauft: „" + sh.name + "“", text: txt, kind: "own", img: "ship_" + sh.type });
    emilCheck(s, sh);
    return null;
  }
  function rename(s, id, name) {
    const sh = s.ships.find(x => x.id === id); if (!sh) return;
    if (TYPES[sh.type].special) return "Sonderschiffe behalten ihren berühmten Namen.";
    const n = cleanName(name); if (!n) return "Bitte einen Namen eingeben.";
    if (s.ships.some(x => x !== sh && x.name === n)) return "Diesen Namen trägt schon ein anderes Schiff Ihrer Flotte.";
    const old = sh.name; sh.name = n;
    for (const l of s.loans) if (l.ship === id) l.label = l.label.replace("„" + old + "“", "„" + n + "“");
    s.log.unshift({ m: s.m, head: "„" + old + "“ heißt jetzt „" + n + "“", text: "Neuer Name am Bug, neue Einträge im Schiffsregister.", kind: "own" });
    emilCheck(s, sh);
    return null;
  }
  function survey(s, id) {
    const L = s.market.find(x => x.id === id); if (!L || L.surveyed) return;
    const cost = Math.round(L.price * .008);
    if (s.cash < cost) return "Nicht genug Geld für das Gutachten.";
    expense(s, "Gutachten", cost); L.surveyed = true; L.est = L.cond;
    s.log.unshift({ m: s.m, head: "Gutachten für die „" + L.name + "“ liegt vor", text: "Den vollständigen Bericht finden Sie in der Werft beim Angebot.", kind: "own", img: "wf_besichtigung" });
    return null;
  }
  function addLoan(s, q, sh, label) { s.loans.push({ id: uid(s), label: label + " „" + sh.name + "“", out: q.loan, rate: q.rate, pay: q.pay, left: q.months, ship: sh.id }); sh.insured = true; }
  function setLine(s, shipId, routeId) {
    const sh = s.ships.find(x => x.id === shipId); if (!sh) return;
    if (routeId) { const r = s.routes.find(x => x.id === routeId); if (!r) return "Linie unbekannt."; const why = canServe(s, sh.type, r.a, r.b, r.cruise, r.stops); if (why) return why; }
    sh.line = routeId || null; sh.laid = !routeId; return null;
  }
  const refNow = (s, r, c) => { const i = rInfo(s, r); return i ? i.refC[c] * s.pidx : 0; };
  const roundPrice = v => v < 10 ? Math.round(v * 20) / 20 : v < 100 ? Math.round(v * 2) / 2 : Math.round(v);
  function stepPrice(s, id, c, dir) { const r = s.routes.find(x => x.id === id); if (!r) return; const ref = refNow(s, r, c); r.price[c] = roundPrice(clamp(r.price[c] + dir * .05 * ref, ref * .3, ref * 2.5)); }
  function avgPct(s) { const v = []; for (const r of s.routes) if (s.ships.some(x => x.line === r.id)) for (let c = 0; c < 3; c++) { const p = pricePct(s, r, c); if (p > 0 && isFinite(p)) v.push(p); } return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 1; }
  function oldShips(s) { return s.ships.filter(x => !x.museum && x.ready <= s.m && x.age >= 360).sort((a, b) => b.age - a.age); }
  function alignPrices(s, id) { const r = s.routes.find(x => x.id === id); if (!r) return; for (let c = 0; c < 3; c++) r.price[c] = roundPrice(refNow(s, r, c)); }
  function setPrice(s, id, c, factor) { const r = s.routes.find(x => x.id === id); if (r) r.price[c] = roundPrice(refNow(s, r, c) * clamp(factor, .3, 2.5)); }
  function routePrice(s, r, c) { return r.price[c]; }
  function pricePct(s, r, c) { const ref = refNow(s, r, c); return ref ? r.price[c] / ref : 1; }
  function setMaint(s, id, lvl) { const sh = s.ships.find(x => x.id === id); if (sh) sh.maint = lvl; }
  function setInsured(s, id, on) {
    const sh = s.ships.find(x => x.id === id); if (!sh) return;
    if (!on && s.loans.some(l => l.ship === id)) return "Die Bank verlangt eine Versicherung, solange der Kredit läuft.";
    sh.insured = on; return null;
  }
  function equipCost(s, sh, k) { return Math.round(P(s, TYPES[sh.type]) * EQUIP[k].pct / 100) * 100; }
  function equip(s, id, k) {
    const sh = s.ships.find(x => x.id === id); if (!sh || !EQUIP[k] || sh.eq[k]) return;
    if (yearOf(s) < EQUIP[k].from) return "Gibt es erst ab " + EQUIP[k].from + ".";
    const c = equipCost(s, sh, k); if (s.cash < c) return "Nicht genug Geld.";
    s.cash -= c; sh.eq[k] = true;
    if (EQUIP[k].dock) sendToDock(s, sh, EQUIP[k].dock);
    s.log.unshift({ m: s.m, head: EQUIP[k].name + " für die „" + sh.name + "“", text: "Eingebaut für " + fmt(c) + " Mark.", kind: "own" });
    return null;
  }
  function dockInfo(s, sh) {
    return { days: dockDays(sh.type, "dock"), cost: Math.round(P(s, TYPES[sh.type]) * .05 * (staff(s).insp ? .95 : 1)) };
  }
  function dock(s, id) {
    const sh = s.ships.find(x => x.id === id); if (!sh || sh.ready > s.m) return;
    if (inDock(s, sh)) return "Das Schiff liegt bereits in der Werft.";
    const di = dockInfo(s, sh);
    if (s.cash < di.cost) return "Nicht genug Geld für die Dockung.";
    expense(s, "Werft", di.cost); sendToDock(s, sh, di.days); sh.cond = Math.min(sh.majLate && sh.majLate.rumpf ? 70 : 100, sh.cond + 25);
    let txt = "Rumpf gereinigt, Maschine überholt. Das Schiff liegt " + di.days + " Tage im Dock, bis zum " + dateAfter(s, di.days) + ".";
    if (sh.defects && sh.defects.length) { txt += " Dabei werden auch Maschine und Schraube instand gesetzt."; sh.defects = []; sh.spd = Math.max(0, sh.spd || 0); }
    s.log.unshift({ m: s.m, head: "„" + sh.name + "“ im Dock", text: txt, kind: "own", img: "wf_dock" });
    return null;
  }
  function fristInfo(s, sh) {
    const left = sh.survey == null ? 9999 : sh.survey - s.t;
    return { left, days: dockDays(sh.type, "frist"), cost: Math.round(P(s, TYPES[sh.type]) * .045 * (staff(s).insp ? .95 : 1) / 100) * 100, can: left <= 365 };
  }
  function renewFrist(s, id) {
    const sh = s.ships.find(x => x.id === id); if (!sh || sh.ready > s.m) return;
    const fi = fristInfo(s, sh);
    if (!fi.can) return "Die Frist kann frühestens ein Jahr vor Ablauf erneuert werden.";
    if (s.cash < fi.cost) return "Nicht genug Geld für die Fristprüfung.";
    expense(s, "Werft", fi.cost); sendToDock(s, sh, fi.days);
    sh.survey = sh.dockUntil + 1460; sh.cond = sh.majLate && sh.majLate.rumpf ? 70 : 100;
    if (sh.defects && sh.defects.length) { sh.defects = []; sh.spd = Math.max(0, sh.spd || 0); }
    s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ erneuert", text: "Der Prüfer nimmt das Schiff " + fi.days + " Tage lang unter die Lupe, die Werft bringt alles wieder in Bestzustand. Die neue Frist gilt bis " + dateAfter(s, sh.dockUntil - s.t + 1460) + ".", kind: "own", img: "wf_besichtigung" });
    if (rnd(s) < (sh.cond < 50 ? .5 : .15)) s.pending.unshift({ id: "werft", kind: "befund", day: s.day, ship: sh.id, head: "Der Prüfer findet Mängel an der „" + sh.name + "“", text: "Bei der Fristprüfung klopft der Prüfer an mehreren Stellen hohl. Er verlangt eine Reparatur – oder er verlängert die Frist nur mit Auflagen um ein Jahr.", img: "wf_besichtigung" });
    return null;
  }
  const isEmil = n => /(^|[^a-zäöüß])emil([^a-zäöüß]|$)/i.test(String(n || ""));
  function emilCheck(s, sh) {
    if (s.flags.emil || !sh || !isEmil(sh.name)) return;
    if (sh.ready > s.m) { s.flags.emilWait = sh.id; return; }
    offerEmil(s, sh);
  }
  function offerEmil(s, sh) {
    s.flags.emil = "offered"; s.flags.emilWait = null;
    s.pending.unshift({ id: "emil", ship: sh.id, day: s.day, head: "Kapitän Emil meldet sich", img: "ev_emil",
      text: "Am Kai steht ein alter Seebär mit weißem Bart und Pfeife und zwinkert: „Moin! Man erzählt sich, hier gibt’s ein Schiff mit meinem Namen. Fünfzig Jahre fahr ich zur See und hab noch nie eins verloren. Na, wie wär’s?“" });
  }
  function emilMonthly(s) {
    if (s.flags.emil) return;
    if (s.flags.emilWait) { const sh = s.ships.find(x => x.id === s.flags.emilWait); if (sh && sh.ready <= s.m) offerEmil(s, sh); return; }
    if (s.flags.emilFirm) { const sh = s.ships.find(x => x.ready <= s.m); if (sh) offerEmil(s, sh); }
  }
  function majorRepair(s, id, k) {
    const sh = s.ships.find(x => x.id === id); if (!sh || !MAJOR[k]) return;
    const c = majorCost(s, sh, k); if (s.cash < c) return "Nicht genug Geld.";
    const days = dockDays(sh.type, k);
    expense(s, "Werft", c); sendToDock(s, sh, days); sh.maj[k] = sh.age; sh.majLate[k] = false; sh.cond = Math.min(100, sh.cond + (k === "rumpf" ? 30 : 20));
    s.log.unshift({ m: s.m, head: MAJOR[k].name + " für die „" + sh.name + "“", text: "Kosten " + fmt(c) + " Mark, " + days + " Tage in der Werft bis zum " + dateAfter(s, days) + ".", kind: "own", img: k === "kessel" ? "wf_kessel" : "wf_dock" });
    return null;
  }
  function sellShip(s, id) {
    const sh = s.ships.find(x => x.id === id); if (!sh || sh.ready > s.m) return "Schiffe im Bau können nicht verkauft werden.";
    const val = Math.round(shipValue(s, sh) * .9); let cash = val;
    for (const l of s.loans.filter(l => l.ship === id)) cash -= l.out;
    s.loans = s.loans.filter(l => l.ship !== id); s.cash += cash; s.ships = s.ships.filter(x => x.id !== id);
    { const c = caps(s).find(x => x.ship === id); if (c) { if (c.bound) s.caps = caps(s).filter(x => x !== c); else c.ship = null; } }
    if (sh.emil) { s.flags.emil = "retired"; s.log.unshift({ m: s.m, head: "Kapitän Emil geht in den Ruhestand", text: "Ohne „sein“ Schiff will der alte Seebär nicht mehr fahren. Zum Abschied gibt es eine Buddel Rum und ein Zwinkern.", kind: "own", img: "ev_emil" }); }
    s.log.unshift({ m: s.m, head: "„" + sh.name + "“ verkauft", text: "Erlös " + fmt(val) + " Mark" + (cash !== val ? ", nach Tilgung des Kredits bleiben " + fmt(cash) + " Mark." : "."), kind: "own" });
    return null;
  }
  function repay(s, id, amount) {
    const l = s.loans.find(x => x.id === id); if (!l) return;
    const a = Math.min(amount, l.out, Math.max(0, s.cash)); if (a <= 0) return "Nicht genug Geld.";
    s.cash -= a; l.out -= a;
    if (l.out <= 1) s.loans = s.loans.filter(x => x !== l); else l.pay = Math.round(annuity(l.out, l.rate, Math.max(1, l.left)));
    return null;
  }
  // Werbung
  function setBudget(s, lvl) { s.mk.budget = clamp(lvl | 0, 0, 3); }
  function setAgency(s, k, on) { if (!MK_AGENCY[k]) return; if (on && yearOf(s) < MK_AGENCY[k].from) return "Gibt es erst ab " + MK_AGENCY[k].from + "."; s.mk.ag[k] = !!on; return null; }
  function campaignCost(s, r) { const last = r.last ? r.last.rev : 0; return Math.round(Math.max(800 * s.pidx, last * .05) / 100) * 100; }
  function campaign(s, id) {
    const r = s.routes.find(x => x.id === id); if (!r) return;
    r.adOn = !r.adOn;
    s.log.unshift({ m: s.m, head: (r.adOn ? "Werbung gestartet: " : "Werbung beendet: ") + rInfo(s, r).name, text: r.adOn ? "Anzeigen und Plakate laufen ab jetzt dauerhaft, derzeit etwa " + fmt(campaignCost(s, r)) + " Mark im Monat." : "Die Anzeigen für diese Linie sind vorerst eingestellt.", kind: "own", route: r.id, img: "mk_reklame" });
    return null;
  }
  function buildHallen(s) {
    if (s.mk.hallen) return; if (yearOf(s) < 1885) return "Gibt es erst ab 1885.";
    const c = Math.round(60000 * s.pidx); if (s.cash < c) return "Nicht genug Geld.";
    s.cash -= c; s.mk.hallen = true; up(s, "rep", 3); s.prestige += 2;
    s.log.unshift({ m: s.m, head: "Auswandererhallen eröffnet", text: "Saubere Schlafsäle, Kantine und Arzt am Hafen – Auswanderer erzählen es weiter.", kind: "own", img: "mk_hallen" });
    return null;
  }
  function pressTrip(s) {
    const c = Math.round(3000 * s.pidx); if (s.cash < c) return "Nicht genug Geld.";
    if (s.flags.pressM === s.m) return "Diesen Monat war die Presse schon an Bord.";
    expense(s, "Werbung", c); s.flags.pressM = s.m; s.mk.brand = clamp(s.mk.brand + 6, 0, 100); s.prestige += 1;
    s.log.unshift({ m: s.m, head: "Presse an Bord", text: "Journalisten fahren auf Ihre Kosten mit und schreiben begeistert.", kind: "own" });
    return null;
  }

  /* ---------- Monatssimulation ---------- */
  function modFactor(s, r, info, key) {
    let f = 1;
    for (const md of s.mods) {
      if (md.key !== key || md.until < s.m) continue;
      let hit = md.line === "*" || (md.route && md.route === r.id) || (md.port && (r.a === md.port || r.b === md.port)) || (md.area && info.areas.includes(md.area));
      if (!hit) continue;
      if (md.seg) f *= 1 + (md.f - 1) * (info.share[md.seg] || 0); else f *= md.f;
    }
    return f;
  }
  function tripsOf(s, sh, info) {
    const t = TYPES[sh.type], spd = (t.speed + (sh.spd || 0)) * (0.85 + 0.15 * sh.cond / 100) * SPD_LV[staff(s).maschine] * capFx(s, sh).spd;
    const rt = 2 * info.dist / (spd * 24) + info.turn;
    return { trips: 30.4 / rt, spd, rt };
  }
  function active(s, sh) { return sh.ready <= s.m && sh.line && !sh.laid && !inDock(s, sh) && !offDuty(s, sh) && !(sh.charter >= s.m) && !detained(s, sh); }
  function demandNow(s, r, info, mo) {
    const mk = s.mk, sh = info.share;
    let agency = 1;
    if (mk.ag.ausw) agency *= 1 + .12 * (sh.ausw || 0);
    if (mk.ag.reise) agency *= 1 + .12 * ((sh.tour || 0) + (sh.bath || 0));
    if (mk.ag.bahn) agency *= 1 + .08 * ((sh.transit || 0) + (sh.local || 0) + (sh.gen || 0));
    return info.D0 * info.season[mo] * s.konj * (r.demMult || 1) * modFactor(s, r, info, "demand") * (1 + .025 * s.m / 12) * agency * (r.adOn ? 1.12 : 1) * cruiseBonus(s, r);
  }
  function cruiseBonus(s, r) { if (!r.cruise) return 1; return (s.ships.some(x => (x.type === "augusta" || TYPES[x.type].cruiseB) && x.line === r.id) ? 1.3 : 1) * (s.ships.some(x => x.type === "traum" && x.line === r.id) ? 2 : 1); }
  function mkBonus(s, r, info) {
    const mk = s.mk, sh = info.share;
    let u = (mk.brand - 30) / 70 * .6;
    if (mk.ag.ausw) u += .45 * (sh.ausw || 0);
    if (mk.ag.reise) u += .45 * ((sh.tour || 0) + (sh.bath || 0));
    if (mk.ag.bahn) u += .35 * ((sh.transit || 0) + (sh.local || 0) + (sh.gen || 0));
    if (mk.hallen) u += .3 * (sh.ausw || 0);
    if (r.adOn) u += .3;
    return u;
  }
  function dayTick(s) {
    const mo = cal(s.m).mo, winter = WINTER.includes(mo), fd = 1 / dim(s.m), cur = s.cur, pid = s.pidx, st = staff(s), myEx = myExp(s);
    let dRev = 0, dCost = 0;
    const add = (k, v) => { cur.cost[k] = (cur.cost[k] || 0) + v; dCost += v; };
    cur.days += 1;
    const odsOf = info => info.multi ? info.ods.map(o => ({ a: info.ports[o.i], b: info.ports[o.j], info: o.info, along: o.along, legs: o.legs, hops: o.j - o.i, key: o.i + "-" + o.j })) : [{ a: info.a, b: info.b, info, along: info.dist, legs: [0], hops: 1, key: "" }];
    const odCount = {};
    for (const r of s.routes) { const i = rInfo(s, r); if (!i) continue; for (const od of odsOf(i)) { const k = pairKey(od.a, od.b) + (i.cruise ? "c" : ""); odCount[k] = (odCount[k] || 0) + 1; } }
    for (const r of s.routes) {
      const info = rInfo(s, r); if (!info) continue;
      const acc = r.cur || (r.cur = { pax: 0, cap: 0, rev: 0, cost: 0, fixed: 0, D: 0, cp: [0, 0, 0], cc: [0, 0, 0], dem: [0, 0, 0], ships: 0, rp: {} });
      acc.rp = acc.rp || {}; acc.fixed = acc.fixed || 0;
      const ships = s.ships.filter(sh => active(s, sh) && sh.line === r.id);
      if (ships.length) r.used = true;
      const capC = [0, 0, 0]; let capT = 0, deps = 0, spdW = 0, comW = 0, firstB = 0;
      const per = ships.map(sh => {
        const t = TYPES[sh.type], tr = tripsOf(s, sh, info), mul = (info.cruise ? 1 : 2) * tr.trips * fd, c = t.sb.map(x => x * mul), ct = c[0] + c[1] + c[2];
        for (let i = 0; i < 3; i++) capC[i] += c[i];
        const cf = capFx(s, sh);
        capT += ct; deps += tr.trips; spdW += tr.spd * ct; comW += (t.comfort * (0.7 + 0.3 * sh.cond / 100) + cf.com) * ct; if (cf.first) firstB = Math.max(firstB, cf.first);
        return { sh, tr, c, ct, cf };
      });
      const nLegs = info.multi ? info.legs.length : 1, ods = odsOf(info), mainRef = info.refC;
      const compMod = modFactor(s, r, info, "comp"), myBonusBase = ((r.b === "ny" || r.a === "ny") && s.stats.band ? .3 : 0) + mkBonus(s, r, info);
      const spd0 = capT ? spdW / capT : 0, com = capT ? comW / capT + SVC_LV[st.service] : 0;
      const want = ods.map(() => [0, 0, 0]), odPrice = [];
      let Dsum = 0;
      for (let q = 0; q < ods.length; q++) {
        const od = ods[q], oi = od.info, w = oi.w, cs = oi.comp;
        const D = demandNow(s, r, oi, mo) * fd / (odCount[pairKey(od.a, od.b) + (info.cruise ? "c" : "")] || 1) * (info.multi && od.hops < nLegs ? .6 : 1); Dsum += D;
        const compDeps = compDepsOf(s, r, oi);
        const holder = info.multi ? ((r.odRiv = r.odRiv || {})[od.key] = r.odRiv[od.key] || {}) : r;
        const rv = rivalsOf(s, r, oi, holder).map(x => Object.assign({ k: x.k, w: x.w }, rivalStats(s, r, oi, x.k)));
        const base = (speed, comfort, repu, c) => w.s * 4 * (speed / cs.speed - 1) + w.c * CLS_WC[c] * .5 * (comfort - 3) + w.r * (repu - 50) / 50;
        const price = [0, 1, 2].map(o => r.price[o] * (oi.refC[o] / (mainRef[o] || oi.refC[o] || 1))); odPrice.push(price);
        const spd = spd0 * (oi.dist / Math.max(oi.dist, od.along)) * Math.pow(.94, od.hops - 1);
        for (let c = 0; c < 3; c++) {
          const Dc = D * oi.mix[c]; if (Dc <= 0) continue;
          acc.dem[c] += Dc;
          const ccBase = compDeps * oi.compSeats * (info.cruise ? 1 : 2) * fd * oi.mix[c];
          let them = 0; const themK = [];
          for (const x of rv) { const u = w.p * CLS_WP[c] * (1 - x.pf * compMod) + base(x.spd, x.com, x.rep, c) + x.eu; const v = ccBase * x.w * x.capF * Math.exp(u); them += v; themK.push([x.k, v]); }
          let my = 0, bo = -1;
          if (capT > 0) {
            const bonus = myBonusBase + expU(oi, myEx);
            let best = -Infinity;
            for (let o = 0; o < 3; o++) { if (capC[o] <= 0) continue; const u = w.p * CLS_WP[c] * (1 - price[o] / (oi.refC[c] * pid)) + base(spd, com, s.rep, c) - (o > c ? (.7 + 1.0 * CLS_T(oi.dist)) * (o - c) : 0) + bonus + (c === 0 ? firstB : 0); if (u > best) { best = u; bo = o; } }
            if (bo >= 0) my = capC[bo] * Math.exp(best);
          }
          const den = my + them + KAPPA * Dc;
          if (bo >= 0) want[q][bo] += Dc * my / den;
          for (const [k, v] of themK) acc.rp[k] = (acc.rp[k] || 0) + Dc * v / den;
        }
      }
      // Platz auf jeder Teilstrecke begrenzt die Buchungen
      const fac = Array.from({ length: nLegs }, () => [1, 1, 1]);
      for (let L = 0; L < nLegs; L++) for (let o = 0; o < 3; o++) { let load = 0; for (let q = 0; q < ods.length; q++) if (ods[q].legs.includes(L)) load += want[q][o]; fac[L][o] = load > capC[o] ? capC[o] / load : 1; }
      const served = [0, 0, 0]; let pax = 0, rev = 0, cater = 0, legPax = 0;
      for (let q = 0; q < ods.length; q++) for (let o = 0; o < 3; o++) {
        const f = Math.min(...ods[q].legs.map(L => fac[L][o])), sv = want[q][o] * f; if (!sv) continue;
        served[o] += sv; pax += sv; rev += sv * odPrice[q][o]; cater += sv * ods[q].info.caterC[o]; legPax += sv * ods[q].legs.length;
      }
      cater *= s.wage;
      let cost = 0;
      if (cater) { add("Verpflegung", cater); cost += cater; }
      for (const p of per) {
        const t = TYPES[p.sh.type], size = Math.max(.15, t.seats / 500);
        const coal = t.coal * .85 * 2 * info.dist * p.tr.trips * fd * s.coal * (p.sh.majLate && p.sh.majLate.kessel ? 1.1 : 1) * COAL_LV[st.maschine] * p.cf.coal;
        const fees = ((info.fee * Math.min(1, .25 + info.dist / nLegs / 40) + 60 * Math.min(1, info.dist / nLegs / 100) * Math.sqrt(s.sizeM || 1)) * 2 * nLegs + 120 * 2 * (nLegs - 1)) * p.tr.trips * fd * size * s.feeMult * s.wage;
        let shipRev = 0;
        if (t.trajekt && info.rail) { const x = 250 * pid * 2 * p.tr.trips * fd; rev += x; shipRev += x; }
        if (t.cargo && !info.cruise) { const fr = t.cargo * 1.9 * info.dist * pid * s.konj * 2 * p.tr.trips * fd; rev += fr; shipRev += fr; cur.freight = (cur.freight || 0) + fr; }
        if (t.cars && !info.cruise && info.dist < 700) { const cr = t.cars * (60 + 1.5 * info.dist) * pid * s.konj * 2 * p.tr.trips * fd; rev += cr; shipRev += cr; cur.freight = (cur.freight || 0) + cr; }
        add("Kohle", coal); add("Hafengebühren", fees); cost += coal + fees;
        const share = capT ? p.ct / capT : 0, sp = pax * share;
        let tick = 0; for (let q = 0; q < ods.length; q++) for (let o = 0; o < 3; o++) if (capC[o] > 0) { const f = Math.min(...ods[q].legs.map(L => fac[L][o])); tick += want[q][o] * f * odPrice[q][o] * p.c[o] / capC[o]; }
        shipRev += tick;
        const sc = p.sh.cur || (p.sh.cur = { pax: 0, cap: 0, rev: 0, cost: 0 });
        sc.pax += sp; sc.cap += p.ct; sc.rev = (sc.rev || 0) + shipRev; sc.cost = (sc.cost || 0) + coal + fees + cater * share;
      }
      s.stats.pax += pax;
      acc.pax += pax; acc.cap += capT * nLegs; acc.rev += rev; acc.cost += cost; acc.D += Dsum; acc.ships = Math.max(acc.ships, ships.length);
      acc.legPax = (acc.legPax || 0) + legPax;
      for (let o = 0; o < 3; o++) { acc.cp[o] += served[o]; acc.cc[o] += capC[o]; }
      dRev += rev;
    }
    for (const sh of s.ships.slice()) {
      const t = TYPES[sh.type];
      if (sh.ready > s.m) continue;
      if (sh.museum) { museumShipDay(s, sh, fd, add); continue; }
      const sc = sh.cur || (sh.cur = { pax: 0, cap: 0, rev: 0, cost: 0 });
      if (sh.charter >= s.m) { const ch = sh.charterRate * fd; income(s, "Charter", ch); sc.rev = (sc.rev || 0) + ch; const hc = crewCost(s, t) * s.crewMult * s.wage * .3 * fd; add("Heuer", hc); sc.cost = (sc.cost || 0) + hc; continue; }
      const act = active(s, sh), laid = !sh.line || sh.laid, info = infoOf(s, sh), val = shipValue(s, sh);
      const cfx = capFx(s, sh);
      let fixed = crewCost(s, t) * s.crewMult * s.wage * (laid ? .25 : 1) * cfx.crew * fd;
      add("Heuer", fixed);
      const mc = maintCost(s, sh) * (laid ? .5 : 1) * fd + (sh.eq.funk ? 60 * s.wage * fd : 0); add("Wartung", mc); fixed += mc;
      if (sh.insured) {
        const lr = info ? info.risk[winter ? 1 : 0] : .005;
        let pct = 1.2 + lr * 60 + (100 - sh.cond) / 100 * 1.5;
        if (s.flags.boote1912 && !sh.eq.boote) pct *= 1.5;
        const ic = val * pct / 100 / 12 * (laid ? .4 : 1) * s.insMult * fd; add("Versicherung", ic); fixed += ic;
      }
      sc.cost = (sc.cost || 0) + fixed;
      if (sh.line && !sh.laid) { const rr = s.routes.find(x => x.id === sh.line); if (rr && rr.cur) rr.cur.fixed = (rr.cur.fixed || 0) + fixed; }
      if (act && info) {
        const late = sh.majLate || {}, emil = sh.emil ? .5 : 1;
        sh.cond -= (info.wear[winter ? 1 : 0] * .6 * MAINT[sh.maint].wear * (t.wear || 1) * (late.rumpf ? 1.3 : 1) * ageWear(sh)) * fd;
        if (late.rumpf) sh.cond = Math.min(sh.cond, 70);
        const p = info.risk[winter ? 1 : 0] * (1 + 3 * Math.pow(1 - sh.cond / 100, 2)) * modFactor(s, routeOf(s, sh), info, "risk") * (t.safe || 1) * (late.kessel ? 1.4 : 1) * (late.rumpf ? 1.2 : 1) * (sh.defects && sh.defects.includes("maschine") ? 1.15 : 1) * emil * RISK_LV[st.deck] * cfx.risk * (winter ? cfx.winter : 1) * fd * (t.hydro && winter ? 1.6 : 1) * (sh.eq.radar ? .8 : 1) * (t.ice && winter ? .5 : 1);
        if (rnd(s) < p) incident(s, sh);
      } else if (!inDock(s, sh)) sh.cond -= .15 * fd;
      if (s.ships.includes(sh)) sh.cond = clamp(sh.cond, 5, 100);
      if (inDock(s, sh) && sh.dockUntil - s.t > 1 && rnd(s) < .025 && !s.pending.some(p => p.ship === sh.id)) werftEvent(s, sh);
    }
    for (const k of Object.keys(s.contracts)) {
      const c = s.contracts[k];
      if (s.ships.some(sh => { if (!active(s, sh)) return false; const r = routeOf(s, sh); return r && ((r.a === c.a && r.b === c.b) || (r.a === c.b && r.b === c.a)) && TYPES[sh.type].speed >= (c.minSpeed || 0); })) { c.served = (c.served || 0) + 1; income(s, "Postverträge", c.sub * fd); }
    }
    const mkCost = MK_BUDGET[s.mk.budget].cost + Object.keys(s.mk.ag).filter(k => s.mk.ag[k]).reduce((a, k) => a + MK_AGENCY[k].cost, 0);
    const adCost = s.routes.filter(r => r.adOn).reduce((a, r) => a + campaignCost(s, r), 0);
    if (mkCost || adCost) add("Werbung", (mkCost * s.wage + adCost) * fd);
    const pers = staffMonthly(s); if (pers) add("Personal", pers * fd);
    const capCost = caps(s).reduce((a, c) => a + capPay(s, c), 0); if (capCost) add("Kapitäne", capCost * fd);
    add("Kontor", (400 + 100 * s.ships.length + 50 * s.routes.length) * fd);
    cur.rev += dRev;
    s.cash += dRev - dCost;
    if (s.cash < 0) { const od = -s.cash * .012 * fd; s.cash -= od; cur.cost["Überziehungszins"] = (cur.cost["Überziehungszins"] || 0) + od; }
  }
  function finalize(s) {
    const cur = s.cur, ex = cur.extra || {}, exSum = Object.values(ex).reduce((a, b) => a + b, 0);
    const rep = { m: s.m, lines: {}, rev: cur.rev + exSum, tickets: cur.rev - (cur.freight || 0), freight: cur.freight || 0, extra: Object.assign({}, ex), cost: Object.assign({}, cur.cost), profit: 0, events: [] };
    for (const r of s.routes) {
      const a = r.cur; if (!a) { r.last = null; continue; }
      r.last = { pax: Math.round(a.pax), cap: Math.round(a.cap), share: a.D ? a.pax / a.D : 0, load: a.cap ? (a.legPax || a.pax) / a.cap : 0, rev: Math.round(a.rev), cost: Math.round(a.cost), ships: a.ships, D: Math.round(a.D), m: s.m,
        cls: [0, 1, 2].map(o => ({ pax: Math.round(a.cp[o]), cap: Math.round(a.cc[o]), dem: Math.round(a.dem[o]) })), fixed: Math.round(a.fixed || 0), riv: Object.fromEntries(Object.entries(a.rp || {}).map(([k, v]) => [k, Math.round(v)])) };
      rep.lines[r.id] = r.last; r.cur = null;
    }
    rep.pax = s.routes.reduce((x, r) => x + (r.last ? r.last.pax : 0), 0);
    for (const sh of s.ships) if (sh.cur) { sh.lastPax = Math.round(sh.cur.pax); sh.lastLoad = sh.cur.cap ? sh.cur.pax / sh.cur.cap : 0; sh.last = { rev: Math.round(sh.cur.rev || 0), cost: Math.round(sh.cur.cost || 0), pax: Math.round(sh.cur.pax), load: sh.lastLoad, m: s.m }; sh.cur = null; }
    return rep;
  }
  function simulateMonth(s) {
    const n = dim(s.m); for (let i = 0; i < n; i++) dayTick(s);
    const rep = finalize(s); rep.profit = rep.rev - Object.values(rep.cost).reduce((a, b) => a + b, 0); s.cur = newCur(s);
    return rep;
  }
  function monthEnd(s) {
    const rep = finalize(s);
    const add = (k, v) => { rep.cost[k] = (rep.cost[k] || 0) + v; };
    let interest = 0, principal = 0;
    for (const l of s.loans.slice()) {
      const lsh = l.ship && s.ships.find(x => x.id === l.ship);
      if (lsh && lsh.ready > s.m) continue;
      if (l.grace > 0) { const i = l.out * l.rate / 100 / 12; interest += i; l.grace -= 1; if (l.grace === 0) l.pay = Math.round(annuity(l.out, l.rate, l.left)); continue; }
      const i = l.out * l.rate / 100 / 12, pr = Math.min(l.out, Math.max(0, l.pay - i));
      interest += i; principal += pr; l.out -= pr; l.left -= 1;
      if (l.out <= 1 || l.left <= 0) { principal += Math.max(0, l.out); l.out = 0; s.loans = s.loans.filter(x => x !== l); }
    }
    if (interest) add("Zinsen", interest);
    s.cash -= interest + principal;
    for (const k of Object.keys(s.contracts)) {
      const c = s.contracts[k];
      if (c.until < s.m) { delete s.contracts[k]; s.log.unshift({ m: s.m, head: c.name + " ausgelaufen", text: "Der Vertrag ist beendet.", kind: "own" }); continue; }
      if (c.served > 0) { c.miss = 0; }
      else {
        add("Vertragsstrafen", c.pen); s.cash -= c.pen; c.miss = (c.miss || 0) + 1;
        rep.events.push(c.name + ": keine Fahrt – Vertragsstrafe " + fmt(c.pen) + " Mark." + (c.miss >= 3 ? " Nach drei Ausfällen ist der Vertrag gekündigt." : ""));
        if (c.miss >= 3) delete s.contracts[k];
      }
      c.served = 0;
    }
    rep.profit = rep.rev - Object.values(rep.cost).reduce((a, b) => a + b, 0);
    rep.principal = principal;
    if (s.cash < 0) s.negMonths += 1; else s.negMonths = 0;
    s.stats.profitSum += rep.profit;
    for (const sh of s.ships) if (sh.ready <= s.m) sh.age += 1;
    return rep;
  }

  /* ---------- Zwischenfälle und Seenot ---------- */
  function incident(s, sh) {
    if (!sh || !s.ships.includes(sh) || sh.distress) return;
    const t = TYPES[sh.type], r = rnd(s), info = infoOf(s, sh), winter = WINTER.includes(cal(s.m).mo);
    const sea = info && !info.areas.every(a => a === "river" || a === "canal");
    const seenotP = (info && info.ocean && winter ? .13 : .08) * (sh.eq.schotten ? .6 : 1) * (t.safe || 1);
    if (sea && r < .006) return sink(s, sh, "nach einer Kesselexplosion gesunken", { sudden: true });
    if (sea && r < seenotP) return distress(s, sh);
    if (r < .32) {
      const full = Math.round(P(s, t) * .09), ins = sh.insured && !detained(s, sh), cost = ins ? Math.round(full * .15) : full; expense(s, "Reparaturen", cost); sh.cond = Math.max(5, sh.cond - 15); up(s, "rep", -3);
      const days = sendToDock(s, sh, dockDays(sh.type, "havarie", sh.cond));
      const n = aboard(s, sh), hurt = Math.round(n * (.01 + rnd(s) * .03) * RISK_LV[staff(s).deck]), dead = rnd(s) < .12 ? Math.max(1, Math.round(n * rnd(s) * .01)) : 0;
      s.log.unshift({ m: s.m, head: "Havarie: „" + sh.name + "“ schwer beschädigt", text: "Linie " + lineOf(s, sh) + ". Reparatur " + fmt(full) + " Mark" + (ins ? ", davon zahlen Sie den Selbstbehalt von " + fmt(cost) + " Mark" : " – die Versicherung zahlt nicht") + ". " + days + " Tage in der Werft, bis zum " + dateAfter(s, days) + "." + compensate(s, sh, dead, hurt), kind: "bad", img: "wf_dock" });
    } else {
      const full = Math.round(P(s, t) * .02), cost = sh.insured ? Math.round(full * .15) : full; expense(s, "Reparaturen", cost); sh.cond = Math.max(5, sh.cond - 6); up(s, "rep", -1);
      const days = sendToDock(s, sh, dockDays(sh.type, "maschine"));
      s.log.unshift({ m: s.m, head: "Maschinenschaden auf der „" + sh.name + "“", text: "Linie " + lineOf(s, sh) + ". Reparatur " + fmt(full) + " Mark" + (sh.insured ? " (Selbstbehalt " + fmt(cost) + " Mark)" : ", unversichert") + ", " + days + " Tage Ausfall.", kind: "bad", img: "ev_kessel" });
    }
  }
  function distressOdds(s, sh) {
    const info = infoOf(s, sh), winter = WINTER.includes(cal(s.m).mo), coastal = info ? !info.ocean : true, radio = !!sh.eq.funk;
    const helper = s.ships.some(x => x !== sh && x.type === "carpathia" && x.ready <= s.m) ? 1 : 0, emil = (sh.emil ? .15 : 0) + capFx(s, sh).seenot;
    const pump = clamp(.3 + (sh.eq.schotten ? .3 : 0) + .25 * sh.cond / 100 + (coastal ? .1 : 0) + (radio ? .1 : 0) - (winter && !coastal ? .1 : 0) + .1 * helper + emil + SEENOT_LV[staff(s).deck], .1, .95);
    const call = clamp(.35 + (coastal ? .3 : 0) + (radio ? .3 : 0) + (sh.eq.schotten ? .1 : 0) - (winter && !coastal ? .1 : 0) + .25 * helper + emil + SEENOT_LV[staff(s).deck], .15, .97);
    return { pump, call, helper, salvage: Math.round(shipValue(s, sh) * .1 * (sh.insured ? .3 : 1)) };
  }
  function lineOf(s, sh) { const i = infoOf(s, sh); return i ? i.name : "ohne Linie"; }
  function distress(s, sh) {
    sh.distress = true;
    const info = infoOf(s, sh), where = info ? (info.ocean ? "auf hoher See" : "vor der Küste") : "auf See";
    const causes = ["ist leckgeschlagen", "hat Wassereinbruch im Maschinenraum", "hat nach einer Grundberührung schwere Schlagseite", "brennt im Laderaum"];
    s.pending.unshift({ id: "seenot", day: s.day, ship: sh.id, head: "Seenot! Die „" + sh.name + "“ " + pick(s, causes),
      text: "Linie " + lineOf(s, sh) + ". Das Schiff ist " + where + " in Not, " + fmt(Math.max(20, Math.round((sh.lastPax || TYPES[sh.type].seats) / 6))) + " Menschen an Bord. Der Kapitän erwartet Ihre Anweisung.", img: "ev_seenot" });
  }
  function sink(s, sh, how, opt) {
    const lineName = lineOf(s, sh);
    opt = opt || {};
    const val = shipValue(s, sh), neglect = sh.cond < 45 || sh.maint === 0;
    const saved = opt.saved != null ? opt.saved : (sh.eq.boote || TYPES[sh.type].seats <= 300);
    let text = "Ein Seeamt untersucht den Fall.";
    let payout = 0;
    if (sh.insured && detained(s, sh)) text += " Die Frist war abgelaufen – die Versicherung zahlt nichts.";
    else if (sh.insured) { payout = Math.round(val * (neglect ? .7 : 1)); text += neglect ? " Es stellt Wartungsmängel fest – die Versicherung kürzt die Zahlung um 30 %." : " Die Versicherung zahlt den Zeitwert."; }
    else text += " Das Schiff war nicht versichert.";
    { const n = aboard(s, sh);
      if (saved) { text += " Alle Menschen an Bord wurden gerettet."; text += compensate(s, sh, 0, Math.round(n * (.05 + rnd(s) * .1))); }
      else { const dead = Math.max(1, Math.round(n * (.15 + rnd(s) * .25) * (sh.eq.boote ? .3 : 1) * (sh.eq.funk ? .7 : 1) * (sh.eq.schotten ? .8 : 1))); s.stats.lost += 1; text += " Nicht alle konnten gerettet werden."; text += compensate(s, sh, dead, Math.round(n * .1)); } }
    for (const l of s.loans.filter(l => l.ship === sh.id)) {
      const use = Math.min(payout, l.out); payout -= use; l.out -= use;
      if (l.out > 1) { l.ship = null; l.label = "Restschuld ohne Schiff („" + sh.name + "“)"; text += " Die Restschuld von " + fmt(l.out) + " Mark läuft weiter."; }
    }
    s.loans = s.loans.filter(l => l.out > 1);
    s.cash += payout; s.ships = s.ships.filter(x => x !== sh);
    up(s, "rep", saved ? -8 : -25); s.mk.brand = clamp(s.mk.brand - (saved ? 3 : 10), 0, 100); s.stats.sunk += 1;
    if (s.expHit) s.expHit.si += saved ? 12 : 25;
    if (sh.emil) { s.flags.emil = "retired"; text += " Kapitän Emil ging als Letzter von Bord und setzt sich nun zur Ruhe."; }
    { const c = caps(s).find(x => x.ship === sh.id); if (c) { if (c.bound || (!saved && rnd(s) < .5)) { s.caps = caps(s).filter(x => x !== c); if (!sh.emil) text += " " + c.name + (saved ? " setzt sich zur Ruhe." : " ist beim Untergang ums Leben gekommen."); } else { c.ship = null; text += " " + c.name + " hat überlebt und wartet in der Reserve auf ein neues Kommando."; } } }
    if (sh.type === "american") { s.log.unshift({ m: s.m, head: "Die „American Star“ ist gestrandet", text: "Im Sturm wurde sie gegen eine ferne Vulkanküste getrieben und brach in der Brandung auseinander. " + text + " Ihr Wrack wird noch lange aus dem Meer ragen.", kind: "bad", img: "ev_wrack" }); return; }
    s.log.unshift({ m: s.m, head: "Dampfer „" + sh.name + "“ " + how, text: "Linie " + lineName + ". " + text, kind: "bad", img: saved ? "ev_seenot" : "ev_seeamt" });
  }
  function repairAfter(s, sh, pay) {
    const t = TYPES[sh.type], full = Math.round(P(s, t) * .12), cost = sh.insured ? Math.round(full * .15) : full;
    expense(s, "Reparaturen", cost); if (pay) expense(s, "Bergelohn", pay); sh.cond = Math.max(5, sh.cond - 20); sh.distress = false;
    const days = sendToDock(s, sh, dockDays(sh.type, "seenot"));
    return "Reparatur " + fmt(full) + " Mark" + (sh.insured ? " (Selbstbehalt " + fmt(cost) + ")" : "") + (pay ? ", Bergelohn " + fmt(pay) + " Mark" : "") + ". " + days + " Tage in der Werft, bis zum " + dateAfter(s, days) + ".";
  }

  /* ---------- Personal ---------- */
  const STAFF_LV = ["knapp", "Tarif", "gut", "sehr gut"], STAFF_PAY = [.85, 1, 1.15, 1.3];
  const DEPT = {
    deck: { name: "Deck", who: "Kapitäne, Offiziere und Matrosen", share: .45, img: "pers_deck", fx: ["mehr Havarien und Verletzte", "normal", "etwas sicherer unterwegs", "deutlich sicherer, bessere Aussichten in Seenot"] },
    maschine: { name: "Maschine", who: "Maschinisten und Heizer", share: .35, img: "pers_maschine", fx: ["2 % langsamer, 6 % mehr Kohle", "normal", "2 % schneller, 5 % weniger Kohle", "4 % schneller, 10 % weniger Kohle"] },
    service: { name: "Service", who: "Stewards und Köche", share: .2, img: "pers_service", fx: ["Fahrgäste fühlen sich schlecht umsorgt", "normal", "spürbar mehr Komfort", "erstklassiger Service"] } };
  const RISK_LV = [1.25, 1, .85, .7], SPD_LV = [.98, 1, 1.02, 1.04], COAL_LV = [1.06, 1, .95, .9], SVC_LV = [-.4, 0, .3, .6], SEENOT_LV = [-.05, 0, .05, .1];
  const INSP_PAY = 450, MARKT_PAY = 600;
  function staff(s) { return s.staff || (s.staff = { deck: 1, maschine: 1, service: 1, insp: false, inspMin: 60, markt: false }); }
  function crewCost(s, t) { const st = staff(s); return t.crew * (DEPT.deck.share * STAFF_PAY[st.deck] + DEPT.maschine.share * STAFF_PAY[st.maschine] + DEPT.service.share * STAFF_PAY[st.service]); }
  function setStaff(s, k, v) {
    const st = staff(s);
    if (DEPT[k]) st[k] = clamp(v | 0, 0, 3);
    else if (k === "insp") st.insp = !!v; else if (k === "inspMin") st.inspMin = clamp(v | 0, 40, 80); else if (k === "markt") st.markt = !!v;
  }
  function staffMonthly(s) { const st = staff(s); return ((st.insp ? INSP_PAY : 0) + (st.markt ? MARKT_PAY : 0)) * s.wage; }
  function inspectorDay(s) {
    const st = staff(s); if (!st.insp) return;
    for (const sh of s.ships) {
      if (sh.ready > s.m || inDock(s, sh) || sh.charter >= s.m || sh.museum) continue;
      const fi = fristInfo(s, sh);
      if (fi.left <= 60 && s.cash >= fi.cost + 20000) { renewFrist(s, sh.id); continue; }
      const di = dockInfo(s, sh);
      if (sh.cond < st.inspMin && s.cash >= di.cost + 20000) dock(s, sh.id);
    }
  }

  /* ---------- Rivalen ---------- */
  const REG = id => PORTS[id].reg;
  const RIV = {
    weser: { name: "Weser-Atlantik-Linie", city: "Bremen", img: "riv_weser", strong: "Große, schnelle Ozeandampfer – stark bei Auswanderern.", weak: "An der Küste und in der Ostsee kaum vertreten.",
      fit: i => i.ocean ? 3 : i.kind.cat === "Nord-/Ostsee" ? .6 : .05, price: 1.05, speed: .3, comfort: -.2, rep: 2, cap: 1, exp: [50, 48, 52] },
    elbe: { name: "Elbe-Sparlinie", city: "Hamburg", img: "riv_elbe", strong: "Die billigsten Fahrkarten weit und breit.", weak: "Wenig Komfort und ein wackeliger Ruf bei der Sicherheit.",
      fit: i => i.ocean || i.cruise ? .2 : i.dist > 500 ? .6 : COUNTRY === "gb" ? ([i.a, i.b].some(x => REG(x) === "Britische Inseln" || ["lon", "grv", "til", "dov", "por", "ryd", "sou", "ply", "har", "hul", "lei"].includes(x)) ? 2.5 : .8) : (REG(i.a) === "Deutsche Nordsee" || REG(i.b) === "Deutsche Nordsee") ? 2.5 : 1.2, price: .88, speed: -.4, comfort: -.8, rep: -8, cap: 1, exp: [38, 42, 38] },
    balt: { name: "Baltische Dampfer-Compagnie", city: "Stettin", img: "riv_balt", strong: "Dichte Fahrpläne in der Ostsee und auf den Fähren.", weak: "Alte, langsame Schiffe.",
      fit: i => { if (COUNTRY === "gb") { const n = [i.a, i.b].filter(x => REG(x) === "Britische Inseln").length; return n === 2 ? 3 : n === 1 ? 1.2 : .1; } const n = [i.a, i.b].filter(x => REG(x) === "Deutsche Ostsee" || REG(x) === "Ostsee-Osten" || ["kop", "mal", "tre", "hsr", "hsb", "kor", "ged", "sto"].includes(x)).length; return n === 2 ? 3 : n === 1 ? 1.2 : .1; }, price: .97, speed: -.8, comfort: -.3, rep: 0, cap: 1.15, exp: [46, 50, 50] },
    kopen: { name: "Kopenhagener Salonlinie", city: "Kopenhagen", img: "riv_kopen", strong: "Der beste Komfort und Service auf See.", weak: "Teure Fahrkarten.",
      fit: i => (REG(i.a) === "Skandinavien" || REG(i.b) === "Skandinavien" ? 2 : 0) + ((i.share.bath || 0) + (i.share.tour || 0) > .4 ? 1.5 : 0) + .3, price: 1.15, speed: 0, comfort: 1, rep: 4, cap: .8, exp: [66, 66, 55] },
    brandt: { name: "Brandt & Söhne", city: "Hamburg", img: "riv_brandt", strong: "Eigene Werft – modernisiert schneller als alle anderen.", weak: "Verkauft seine Neubauten auch an die Konkurrenz.",
      fit: i => (i.a === "ham" || i.b === "ham") ? 1.6 : .9, price: 1, speed: .3, comfort: 0, rep: 0, cap: 1, exp: [50, 50, 50] },
    themse: { name: "Themse-Kanal-Linie", city: "London", img: "riv_themse", strong: "Stark in Westeuropa und im Mittelmeer.", weak: "In der Ostsee kaum zu finden.",
      fit: i => { const n = [i.a, i.b].filter(x => REG(x) === "Westeuropa" || REG(x) === "Süden").length; return n === 2 ? 3 : n === 1 ? 2 : .1; }, price: 1, speed: .2, comfort: .1, rep: 2, cap: 1, exp: [53, 53, 50] },
  };
  const RIV_ORDER = ["weser", "elbe", "balt", "kopen", "brandt", "themse"];
  function rivState(s, k) { s.riv = s.riv || {}; return s.riv[k] || (s.riv[k] = { pmod: 1, pUntil: -1, boost: 0, modern: 0, weak: 0, weakUntil: -1, comBoost: 0, mood: 0 }); }
  function rivalsOf(s, r, info, holder) {
    holder = holder || r;
    if (compDepsOf(s, r, info) <= 0) return [];
    if (!holder.riv) {
      const h = (r.a + r.b).split("").reduce((x, c) => x * 31 + c.charCodeAt(0) >>> 0, 7);
      const sc = RIV_ORDER.map((k, i) => [k, RIV[k].fit(info) * (1 + ((h >> i) % 7) / 40)]).sort((x, y) => y[1] - x[1]);
      holder.riv = sc[1][1] >= .45 * sc[0][1] ? [{ k: sc[0][0], w: .6 }, { k: sc[1][0], w: .4 }] : [{ k: sc[0][0], w: 1 }];
    }
    return holder.riv;
  }
  const EXPW = { tour: [.6, .3, .1], bath: [.5, .3, .2], biz: [.3, .5, .2], ausw: [.2, .2, .6], local: [.3, .3, .4], transit: [.3, .3, .4], gen: [.3, .3, .4] };
  function expU(info, ex) { let v = 0, n = 0; for (const k in EXPW) { const w = info.share[k] || 0; if (!w) continue; v += w * (EXPW[k][0] * ex[0] + EXPW[k][1] * ex[1] + EXPW[k][2] * ex[2]); n += w; } return n ? .4 * (v / n - 50) / 50 : 0; }
  function myExp(s) { const x = s.exp || (s.exp = { k: 50, s: 50, si: 50 }); return [x.k, x.s, x.si]; }
  function rivalStats(s, r, info, k) {
    const R = RIV[k], st = rivState(s, k), cs = info.comp;
    return { spd: cs.speed + (r.compSpeedAdd || 0) + R.speed + st.modern, com: cs.comfort + R.comfort + st.comBoost, pf: R.price * (st.pUntil >= s.m ? st.pmod : 1),
      rep: 50 + R.rep, eu: expU(info, R.exp), capF: R.cap * (1 + st.boost) * (st.weakUntil >= s.m ? 1 - st.weak : 1) };
  }
  function expMonthly(s) {
    const x = s.exp || (s.exp = { k: 50, s: 50, si: 50 }), st = staff(s), act = s.ships.filter(sh => sh.ready <= s.m);
    let seats = 0, com = 0, eq = 0; for (const sh of act) { const t = TYPES[sh.type]; seats += t.seats; com += t.comfort * (.7 + .3 * sh.cond / 100) * t.seats; eq += (sh.eq.boote ? 1 : 0) + (sh.eq.schotten ? 1 : 0) + (sh.eq.funk ? 1 : 0); }
    const avgCom = seats ? com / seats : 3, eqShare = act.length ? eq / (act.length * 3) : 0;
    const hit = s.expHit || (s.expHit = { si: 0, k: 0 });
    const tK = clamp(52 + (avgCom - 3) * 8 + SVC_LV[st.service] * 15 - hit.k, 5, 95), tS = clamp(50 + (st.service - 1) * 15 + (s.mk.hallen ? 3 : 0), 5, 95), tSi = clamp(50 + (st.deck - 1) * 8 + eqShare * 15 - hit.si, 5, 95);
    x.k += (tK - x.k) * .08; x.s += (tS - x.s) * .08; x.si += (tSi - x.si) * .08;
    hit.si *= .9; hit.k *= .9;
  }
  function rivalMonthly(s) {
    for (const k of RIV_ORDER) { const st = rivState(s, k); st.modern += k === "brandt" ? .004 : 0; st.comBoost = Math.max(0, st.comBoost - .002); }
    for (const r of s.routes) {
      const info = rInfo(s, r); if (!info || !r.last) continue;
      const rv = rivalsOf(s, r, info);
      if (rv.length && r.last.ships && r.last.share > .35 && rnd(s) < .02) {
        const k = rv.slice().sort((a, b) => b.w - a.w)[0].k, st = rivState(s, k), R = RIV[k]; st.mood += 1;
        let txt;
        if (k === "elbe" || k === "themse") { s.mods.push({ route: r.id, key: "comp", f: k === "elbe" ? .85 : .92, until: s.m + 6 }); txt = R.name + " senkt auf " + info.name + " die Preise – ein halbes Jahr lang wird es eng."; }
        else if (k === "kopen") { st.comBoost = Math.min(1, st.comBoost + .3); txt = R.name + " lässt die Salons neu ausstatten. Die Fahrgäste schwärmen."; }
        else { r.compMult = (r.compMult || 1) * 1.25; txt = R.name + " setzt mehr Schiffe auf " + info.name + " ein."; }
        s.log.unshift({ m: s.m, head: R.name + " reagiert auf Ihren Erfolg", text: txt, kind: "news", img: R.img });
      }
      if (!rv.length && r.last.pax > 400 && rnd(s) < .03) {
        const k = RIV_ORDER.map(x => [x, RIV[x].fit(info)]).sort((a, b) => b[1] - a[1])[0][0];
        r.compOverride = Math.max(1, r.last.pax / 700); r.riv = [{ k, w: 1 }];
        s.log.unshift({ m: s.m, head: RIV[k].name + " steigt auf " + info.name + " ein", text: "Ihr Erfolg hat sich herumgesprochen – ab sofort fährt die Konkurrenz auch hier.", kind: "news", img: RIV[k].img });
      }
    }
  }
  function marketResearch(s, r) {
    const info = rInfo(s, r); if (!info) return null;
    const c = info.mix.indexOf(Math.max.apply(null, info.mix)), w = info.w, cs = info.comp, pid = s.pidx;
    const mine = s.ships.filter(x => x.line === r.id && x.ready <= s.m);
    const row = (spd, com, rep, pf, eu, br) => ({ Preis: w.p * CLS_WP[c] * (1 - pf), Tempo: w.s * 4 * (spd / cs.speed - 1), Komfort: w.c * CLS_WC[c] * .5 * (com - 3), Ruf: w.r * (rep - 50) / 50, Erfahrungen: eu, Bekanntheit: br });
    let me = null;
    if (mine.length) {
      const t0 = mine.map(x => TYPES[x.type]); const spd = mine.reduce((a, x) => a + (TYPES[x.type].speed + (x.spd || 0)) * SPD_LV[staff(s).maschine], 0) / mine.length;
      const com = t0.reduce((a, t) => a + t.comfort, 0) / t0.length + SVC_LV[staff(s).service];
      me = row(spd, com, s.rep, r.price[c] / (info.refC[c] * pid), expU(info, myExp(s)), mkBonus(s, r, info));
    }
    const riv = rivalsOf(s, r, info).map(x => { const q = rivalStats(s, r, info, x.k); return { k: x.k, name: RIV[x.k].name, img: RIV[x.k].img, row: row(q.spd, q.com, q.rep, q.pf * modFactor(s, r, info, "comp"), q.eu, 0) }; });
    const last = r.last || {}, D = last.D || 0;
    return { cls: c, me, riv, share: D ? (last.pax || 0) / D : 0, rivShare: Object.fromEntries(Object.entries(last.riv || {}).map(([k, v]) => [k, D ? v / D : 0])) };
  }

  /* ---------- Saisonfahrplan ---------- */
  const inRange = (mo, f, t) => f <= t ? mo >= f && mo <= t : mo >= f || mo <= t;
  function planTarget(s, sh) { const mo = cal(s.m).mo; for (const p of sh.plan || []) if (inRange(mo, p.from, p.to)) return p.line || null; return undefined; }
  function setPlan(s, id, plan) {
    const sh = s.ships.find(x => x.id === id); if (!sh) return;
    sh.plan = (plan || []).filter(p => p && p.from >= 0 && p.from < 12 && p.to >= 0 && p.to < 12).slice(0, 3).map(p => ({ from: p.from | 0, to: p.to | 0, line: p.line || "" }));
    applyPlan(s, sh);
    return null;
  }
  function applyPlan(s, sh) {
    if (!sh.plan || !sh.plan.length || sh.ready > s.m || sh.charter >= s.m) return;
    const tgt = planTarget(s, sh); if (tgt === undefined) return;
    const newR = tgt ? s.routes.find(r => r.id === tgt) : null;
    if (tgt && (!newR || canServe(s, sh.type, newR.a, newR.b, newR.cruise, newR.stops))) return;
    const curL = sh.laid || !sh.line ? null : sh.line;
    if (curL === (tgt || null)) return;
    const oldR = s.routes.find(r => r.id === (sh.line || sh.lastRoute));
    let days = 0;
    if (newR) {
      const from = oldR ? [oldR.a, oldR.b] : ["ham"], to = [newR.a, newR.b];
      let d = 1e9; for (const x of from) for (const y of to) { if (x === y) { d = 0; break; } const p = seaPath(x, y, yearOf(s)); if (p) d = Math.min(d, p.dist); }
      if (d < 1e9) days = Math.ceil(d / (TYPES[sh.type].speed * 24));
    }
    if (sh.line) sh.lastRoute = sh.line;
    sh.line = tgt || null; sh.laid = !tgt;
    if (days > 0) sh.offUntil = Math.max(sh.offUntil || 0, s.t + days);
    s.log.unshift({ m: s.m, head: "Fahrplan: „" + sh.name + "“ " + (newR ? "wechselt auf " + rInfo(s, newR).name : "wird aufgelegt"), text: newR ? (days ? "Die Überführung dauert " + days + " Tag" + (days === 1 ? "" : "e") + "." : "Das Schiff fährt ab sofort dort.") : "Laut Saisonfahrplan ruht das Schiff bis zur nächsten Saison.", kind: "own", img: "ship_" + sh.type });
  }

  /* ---------- Entschädigungen ---------- */
  function aboard(s, sh) { const info = infoOf(s, sh), t = TYPES[sh.type]; if (!info || !sh.lastPax) return Math.round(t.seats * .5); return clamp(Math.round(sh.lastPax / Math.max(1, 2 * tripsOf(s, sh, info).trips)), 1, t.seats); }
  function compensate(s, sh, dead, hurt) {
    if (!dead && !hurt) return "";
    const f = (s.pidx || 1) * Math.sqrt(s.sizeM || 1), sum = Math.round((dead * 3000 + hurt * 300) * f / 100) * 100;
    expense(s, "Entschädigungen", sum); s.stats.deaths = (s.stats.deaths || 0) + dead;
    if (s.expHit) s.expHit.si += dead ? 10 : 2;
    return " " + (dead ? dead + (dead === 1 ? " Toter" : " Tote") + (hurt ? " und " : "") : "") + (hurt ? hurt + (hurt === 1 ? " Verletzter" : " Verletzte") : "") + " – die Reederei zahlt " + fmt(sum) + " Mark Entschädigung.";
  }

  /* ---------- Erfolge ---------- */
  const sailsTo = (s, p) => s.ships.some(x => { if (!active(s, x)) return false; const r = routeOf(s, x); return r && (r.a === p || r.b === p); });
  const ACH = [
    { id: "linie", name: "Leinen los", desc: "Die erste Linie eröffnen.", f: s => s.routes.length > 0 },
    { id: "schiff", name: "Stapellauf", desc: "Das erste eigene Schiff in Dienst stellen.", f: s => s.ships.some(x => x.ready <= s.m) },
    { id: "flotte5", name: "Kleine Flotte", desc: "Fünf Schiffe besitzen.", f: s => s.ships.length >= 5 },
    { id: "flotte10", name: "Stattliche Flotte", desc: "Zehn Schiffe besitzen.", f: s => s.ships.length >= 10 },
    { id: "flotte25", name: "Armada", desc: "25 Schiffe besitzen.", f: s => s.ships.length >= 25 },
    { id: "netz", name: "Netzwerk", desc: "Zehn Linien gleichzeitig bedienen.", f: s => s.routes.filter(r => s.ships.some(x => x.line === r.id)).length >= 10 },
    { id: "pax100k", name: "Hunderttausend an Bord", desc: "100.000 Fahrgäste befördern.", f: s => s.stats.pax >= 1e5 },
    { id: "pax1m", name: "Eine Million an Bord", desc: "Eine Million Fahrgäste befördern.", f: s => s.stats.pax >= 1e6 },
    { id: "mio", name: "Millionär", desc: "Eine Million Mark Eigenkapital.", f: s => equity(s) >= 1e6 },
    { id: "mio10", name: "Großreeder", desc: "Zehn Millionen Mark Eigenkapital.", f: s => equity(s) >= 1e7 },
    { id: "frei", name: "Schuldenfrei", desc: "Alle Kredite getilgt – auch den Gründungskredit.", f: s => !!s.flags.hadFounder && !s.loans.length },
    { id: "band", name: "Blaues Band", desc: "Die schnellste Überfahrt nach New York.", f: s => !!s.stats.band },
    { id: "nothafen", name: "Rettung in letzter Minute", desc: "Ein eigenes Schiff aus Seenot retten.", f: s => (s.stats.saved || 0) > 0 },
    { id: "retter", name: "Retter der Schiffbrüchigen", desc: "Schiffbrüchigen auf See helfen.", f: s => !!s.flags.rescued },
    { id: "sonder", name: "Sammler", desc: "Ein Sonderschiff erwerben.", f: s => s.ships.some(x => TYPES[x.type].special) },
    { id: "sonderall", name: "Museumsreif", desc: "Alle Sonderschiffe gleichzeitig besitzen.", f: s => SPECIAL_ORDER.every(k => s.ships.some(x => x.type === k)) },
    { id: "kreuz", name: "Vergnügungsreise", desc: "Eine Vergnügungsreise mit eigenem Schiff anbieten.", f: s => s.routes.some(r => r.cruise && s.ships.some(x => x.line === r.id && active(s, x))) },
    { id: "ny", name: "Über den großen Teich", desc: "Mit eigenem Schiff nach New York fahren.", f: s => sailsTo(s, "ny") },
    { id: "asien", name: "Bis ans Ende der Welt", desc: "Mit eigenem Schiff nach Shanghai fahren.", f: s => sailsTo(s, "sha") },
    { id: "kanal", name: "Die Abkürzung", desc: "Eine Linie durch den Kaiser-Wilhelm-Kanal bedienen.", f: s => s.routes.some(r => { const i = rInfo(s, r); return i && i.path.nodes.includes("rendsb") && s.ships.some(x => x.line === r.id && active(s, x)); }) },
    { id: "koenig", name: "Hoher Besuch", desc: "Einen Monarchen festlich an Bord empfangen.", f: s => !!s.flags.koenigFest },
    { id: "regatta", name: "Schnellstes Schiff im Hafen", desc: "Eine Wettfahrt gewinnen.", f: s => !!s.flags.regattaWin },
    { id: "emil", name: "Glücksbringer", desc: "Einen ganz besonderen Kapitän anheuern.", f: s => !!s.flags.emilEver },
    { id: "bekannt", name: "Stadtgespräch", desc: "Eine Bekanntheit von 80 erreichen.", f: s => s.mk.brand >= 80 },
    { id: "ruf", name: "Ehrbarer Kaufmann", desc: "Einen Ruf von 80 erreichen.", f: s => s.rep >= 80 },
    { id: "zehn", name: "Zehn Jahre am Kai", desc: "Zehn Jahre Reederei.", f: s => s.m >= 120 },
    { id: "1900", name: "Jahrhundertwende", desc: "Das Jahr 1900 erleben.", f: s => yearOf(s) >= 1900 },
    { id: "dreissig", name: "Eine Generation", desc: "30 Jahre Reederei.", f: s => s.m >= 360 },
    { id: "kap5", name: "Alter Hase", desc: "Einen Kapitän bis zur höchsten Stufe führen.", f: s => caps(s).some(c => !c.sp && capLevel(c) >= 5) },
    { id: "sonderkap", name: "Berühmte Namen", desc: "Einen Sonderkapitän anheuern.", f: s => caps(s).some(c => c.sp && !SPECIAL_CAPS[c.sp].bound) },
    { id: "museum", name: "Museumsdirektor", desc: "Ein eigenes Museum mit drei Schiffen oder zehn Exponaten.", f: s => !!s.museum && (s.ships.filter(x => x.museum).length >= 3 || (s.exhibits || []).length >= 10) },
    { id: "spende", name: "Stifter", desc: "Einem Museum ein Schiff schenken.", f: s => (s.flags.donated || 0) > 0 },
    { id: "entwurf", name: "Eigene Handschrift", desc: "Ein Schiff nach eigenem Entwurf bauen.", f: s => s.ships.some(x => TYPES[x.type] && TYPES[x.type].design) },
    { id: "generation", name: "Mit der Zeit gehen", desc: "Ein Schiff einer neuen Generation (ab 1912) bestellen.", f: s => s.ships.some(x => GEN_TYPES[x.type]) },
    { id: "traum", name: "Das Traumschiff", desc: "Ein Schiff aus einer anderen Zeit.", f: s => s.ships.some(x => x.type === "traum") },
  ];
  function achCheck(s) {
    s.ach = s.ach || {};
    const got = [];
    for (const a of ACH) if (!s.ach[a.id] && a.f(s)) { s.ach[a.id] = s.m + 1; got.push(a); }
    if (!got.length) return;
    if (got.length > 3) s.log.unshift({ m: s.m, head: got.length + " Erfolge freigeschaltet", text: got.map(a => a.name).join(", ") + ".", kind: "own", img: "ev_erfolge" });
    else for (const a of got) s.log.unshift({ m: s.m, head: "Erfolg: " + a.name, text: a.desc, kind: "own", img: "ev_erfolge" });
  }

  /* ---------- Werft ---------- */
  const WERFT = {
    streik: { w: 1, img: "ev_streik", news: (s, sh) => { const d = 4 + Math.floor(rnd(s) * 9); sendToDock(s, sh, d); return ["Streik auf der Werft", "Die Werftarbeiter legen die Arbeit nieder. Die „" + sh.name + "“ bleibt " + d + " Tage länger im Dock."]; } },
    frueher: { w: 1.2, img: "wf_dock", news: (s, sh) => { const d = Math.max(1, Math.floor((sh.dockUntil - s.t) * (.3 + rnd(s) * .3))); sh.dockUntil -= d; return ["Die Werft ist früher fertig", "Die Arbeiten an der „" + sh.name + "“ gehen flott voran – sie ist " + d + " Tage früher zurück im Dienst."]; } },
    teile: { w: 1, img: "wf_buero", news: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .012 / 100) * 100; income(s, "Werft-Gutschriften", c); return ["Gebrauchte Teile zum halben Preis", "Die Werft baut in die „" + sh.name + "“ gut erhaltene Teile aus einem Abwrackschiff ein. Sie sparen " + fmt(c) + " Mark."]; } },
    rabatt: { w: .8, img: "wf_buero", news: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .008 / 100) * 100; income(s, "Werft-Gutschriften", c); return ["Stammkundenrabatt", "Die Werft erlässt Ihnen für die Arbeiten an der „" + sh.name + "“ " + fmt(c) + " Mark – als treuem Kunden."]; } },
    unfall: { w: .6, img: "wf_dock", news: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .01 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 4); return ["Missgeschick beim Ausdocken", "Die „" + sh.name + "“ ist von den Pallen gerutscht. Die Schäden kosten " + fmt(c) + " Mark und vier Tage."]; } },
    material: { w: 1, img: "wf_dock", head: "Stahlplatten fehlen", text: sh => "Für die Arbeiten an der „" + sh.name + "“ fehlen Stahlplatten. Die Werft kann sie teuer aus England kommen lassen – oder man wartet auf die nächste Lieferung.",
      opts: [{ t: "Teuer nachkaufen", h: (s, sh) => fmt(Math.round(P(s, TYPES[sh.type]) * .015 / 100) * 100) + " Mark, keine Verzögerung", f: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .015 / 100) * 100; expense(s, "Werft", c); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Auf die Lieferung warten", h: () => "8 bis 18 Tage länger im Dock", f: (s, sh) => { const d = 8 + Math.floor(rnd(s) * 11); sendToDock(s, sh, d); return d + " Tage Verzögerung."; } }] },
    rost: { w: 1, img: "wf_besichtigung", head: "Verdeckter Rostschaden", text: sh => "Unter der Farbe der „" + sh.name + "“ kommt Rost zum Vorschein, schlimmer als gedacht. Der Werftmeister rät zur gründlichen Sanierung.",
      opts: [{ t: "Gründlich sanieren", h: (s, sh) => fmt(Math.round(P(s, TYPES[sh.type]) * .03 / 100) * 100) + " Mark, rund eine Woche länger, Zustand steigt", f: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .03 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 6 + Math.floor(rnd(s) * 5)); sh.cond = Math.min(100, sh.cond + 12); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Nur überstreichen", h: () => "billig, aber der Rost frisst weiter", f: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .004 / 100) * 100; expense(s, "Werft", c); sh.cond = Math.max(5, sh.cond - 10); return "Kosten " + fmt(c) + " Mark. Der Zustand leidet."; } }] },
    ingenieur: { w: .8, img: "wf_buero", head: "Der Werftingenieur hat eine Idee", text: sh => "Ein junger Ingenieur schlägt für die „" + sh.name + "“ einen neuen Propeller nach englischem Muster vor. Das Schiff würde spürbar schneller.",
      opts: [{ t: "Umbauen lassen", h: (s, sh) => fmt(Math.round(P(s, TYPES[sh.type]) * .04 / 100) * 100) + " Mark, fünf Tage länger, dauerhaft +0,3 Knoten", f: (s, sh) => { if ((sh.spd || 0) >= .9) return "Mehr ist aus diesem Schiff nicht herauszuholen."; const c = Math.round(P(s, TYPES[sh.type]) * .04 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 5); sh.spd = Math.round(((sh.spd || 0) + .3) * 10) / 10; return "Kosten " + fmt(c) + " Mark. Die „" + sh.name + "“ läuft jetzt " + kn2(TYPES[sh.type].speed + sh.spd) + " Knoten."; } },
        { t: "Ablehnen", h: () => "alles bleibt, wie es ist", f: () => "" }] },
    befund: { w: 0, img: "wf_besichtigung", opts: [
        { t: "Sofort beheben", h: (s, sh) => fmt(Math.round(P(s, TYPES[sh.type]) * .025 / 100) * 100) + " Mark, " + dockDays(sh.type, "befund") + " Tage länger, Zustand steigt", f: (s, sh) => { const c = Math.round(P(s, TYPES[sh.type]) * .025 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, dockDays(sh.type, "befund")); sh.cond = Math.min(100, sh.cond + 10); return "Kosten " + fmt(c) + " Mark. Die Frist gilt volle vier Jahre."; } },
        { t: "Frist mit Auflagen", h: () => "kein Aufwand, aber die Frist gilt nur ein Jahr", f: (s, sh) => { sh.survey = Math.min(sh.survey, s.t + 365); sh.cond = Math.max(5, sh.cond - 5); return "Die nächste Fristprüfung ist in einem Jahr fällig."; } }] },
  };
  const kn2 = v => (Math.round(v * 10) / 10).toString().replace(".", ",");
  function werftEvent(s, sh) {
    const ids = Object.keys(WERFT).filter(k => WERFT[k].w > 0);
    const tot = ids.reduce((a, k) => a + WERFT[k].w, 0); let r = rnd(s) * tot, k = ids[0];
    for (const id of ids) { r -= WERFT[id].w; if (r <= 0) { k = id; break; } }
    const W = WERFT[k];
    if (W.news) { const [h, t] = W.news(s, sh); s.log.unshift({ m: s.m, head: h, text: t, kind: /früher|halben|Stammkunden/.test(h) ? "own" : "bad", img: W.img }); return; }
    s.pending.unshift({ id: "werft", kind: k, day: s.day, ship: sh.id, head: W.head + ": „" + sh.name + "“", text: W.text(sh), img: W.img });
  }
  function shipFixed(s, sh) {
    const t = TYPES[sh.type], laid = !sh.line || sh.laid;
    let c = t.crew * s.crewMult * s.wage * (laid ? .25 : 1) + maintCost(s, sh) * (laid ? .5 : 1);
    if (sh.insured) c += shipValue(s, sh) * 1.5 / 100 / 12 * (laid ? .4 : 1);
    return c;
  }
  function seasonCheck(s) {
    const mo = cal(s.m).mo, pm = (mo + 11) % 12;
    for (const r of s.routes) {
      if (!r.used) continue;
      const i = rInfo(s, r); if (!i) continue;
      const mx = Math.max.apply(null, i.season) || 1, a = i.season[pm] / mx, b = i.season[mo] / mx;
      if (a >= .45 && b < .45) s.log.unshift({ m: s.m, head: "Nebensaison auf " + i.name, text: "Ab " + MONTHS[mo] + " kommen kaum noch Fahrgäste – nur noch etwa " + Math.max(1, Math.round(b * 100)) + " % der Hauptsaison. Tipp: Legen Sie die Schiffe in der Flotte auf, das spart Kohle und drei Viertel der Heuer.", kind: "news", route: r.id });
      else if (a < .45 && b >= .45) s.log.unshift({ m: s.m, head: "Die Saison auf " + i.name + " beginnt", text: "Die Nachfrage zieht an. Zeit, die Schiffe wieder einzusetzen.", kind: "news", route: r.id });
    }
  }
  function majorCheck(s) {
    for (const sh of s.ships) {
      if (sh.ready > s.m || !sh.maj) continue;
      for (const k of ["kessel", "rumpf"]) {
        const due = sh.age >= (sh.maj[k] || 0) + MAJOR[k].every;
        sh.majAsk = sh.majAsk || {};
        if (!due || (sh.majAsk[k] || -1) > s.m || s.pending.some(p => p.ship === sh.id)) continue;
        sh.majAsk[k] = s.m + 12;
        s.pending.push({ id: "major", kind: k, ship: sh.id, day: 4 + Math.floor(rnd(s) * 18), head: MAJOR[k].name + " für die „" + sh.name + "“?", text: "Die „" + sh.name + "“ ist " + Math.floor(sh.age / 12) + " Jahre alt. " + MAJOR[k].text, img: k === "kessel" ? "wf_kessel" : "wf_dock" });
        return;
      }
    }
  }
  function advisorCheck(s, rep) {
    const flow = rep.profit - (rep.principal || 0);
    const danger = s.cash < 0 || (flow < 0 && s.cash < -flow * 4);
    if (!danger || (s.flags.advM != null && s.flags.advM > s.m - (s.cash < 0 ? 3 : 6))) return;
    const mo = cal(s.m).mo, items = [];
    const rows = s.routes.map(r => {
      const info = rInfo(s, r), ships = s.ships.filter(x => x.line === r.id && x.ready <= s.m && !x.laid), last = r.last;
      if (!info || !last || !ships.length) return null;
      return { r, info, ships, net: last.rev - last.cost - ships.reduce((a, x) => a + shipFixed(s, x), 0), load: last.load, low: info.season[mo] < .5 };
    }).filter(Boolean).sort((a, b) => a.net - b.net);
    const laid = s.ships.filter(x => x.ready <= s.m && (!x.line || x.laid)), laidCost = laid.reduce((a, x) => a + shipFixed(s, x), 0);
    const loanPay = s.loans.reduce((a, l) => a + l.pay, 0), mk = rep.cost.Werbung || 0;
    for (const w of rows.filter(x => x.net < 0).slice(0, 2)) items.push("Linie " + w.info.name + ": " + fmt(w.net) + " Mark im Monat, Auslastung " + Math.round(w.load * 100) + " %" + (w.low ? " – gerade Nebensaison" : ""));
    if (laidCost > 500) items.push("Aufgelegte Schiffe: −" + fmt(laidCost) + " Mark für Heuer, Wartung und Versicherung");
    if (loanPay > 0) items.push("Kreditraten: −" + fmt(loanPay) + " Mark im Monat");
    if (mk > 0) items.push("Werbung: −" + fmt(mk) + " Mark im Monat");
    let tip = null, tipText = "Senken Sie auf schwach ausgelasteten Linien die Preise oder setzen Sie die Schiffe auf stärkeren Linien ein.";
    const worst = rows[0];
    if (worst && worst.net < 0 && worst.low) { tip = { kind: "layup", route: worst.r.id, label: "Schiffe auf " + worst.info.name + " auflegen" }; tipText = "Legen Sie die Schiffe auf " + worst.info.name + " bis zur Saison auf. Das spart Kohle und drei Viertel der Heuer."; }
    else if (laid.length && laidCost > Math.abs(flow) * .25) { const x = laid.slice().sort((a, b) => shipFixed(s, b) - shipFixed(s, a))[0]; tip = { kind: "sell", ship: x.id, label: "„" + x.name + "“ verkaufen" }; tipText = "Verkaufen Sie die aufgelegte „" + x.name + "“. Sie kostet nur Geld und bringt etwa " + fmt(shipValue(s, x) * .9) + " Mark."; }
    else if (mk > Math.abs(flow) * .3) { tip = { kind: "mk", label: "Werbung einstellen" }; tipText = "Stellen Sie die Werbung vorerst ein – sie kostet mehr, als sie gerade bringt."; }
    else if (worst && worst.net < 0 && worst.load < .45) { tip = { kind: "layup", route: worst.r.id, label: "Schiffe auf " + worst.info.name + " auflegen" }; tipText = "Auf " + worst.info.name + " fahren die Schiffe fast leer. Legen Sie sie auf oder setzen Sie sie auf einer besseren Linie ein."; }
    else if (avgPct(s) < .85) { tip = { kind: "prices", label: "Alle Preise auf das übliche Niveau anheben" }; tipText = "Ihre Fahrpreise liegen im Schnitt nur bei " + Math.round(avgPct(s) * 100) + " % des Üblichen. Löhne und Kohle sind über die Jahre teurer geworden – heben Sie die Preise an."; }
    else if (oldShips(s).length) { const x = oldShips(s)[0]; tip = { kind: "sell", ship: x.id, label: "„" + x.name + "“ verkaufen" }; tipText = "Die „" + x.name + "“ ist " + Math.floor(x.age / 12) + " Jahre alt und frisst Wartung und Kohle. Ersetzen Sie alte Schiffe durch moderne – die Werft hat längst bessere."; }
    else if (worst && worst.net < 0) tipText = "Auf " + worst.info.name + " reichen die Einnahmen nicht. Prüfen Sie Preise und Schiffstyp – oft passt die Klassenaufteilung nicht zur Kundschaft.";
    const left = Math.max(1, 4 - s.negMonths);
    const text = (flow < 0 ? "Im letzten Monat ist " + fmt(-flow) + " Mark mehr hinaus- als hereingegangen." : "Die Kasse ist fast leer.") +
      (s.cash < 0 ? " Die Kasse steht im Minus. Nach vier Monaten im Minus ist die Reederei zahlungsunfähig – Ihnen bleiben höchstens noch " + left + " Monat" + (left === 1 ? "" : "e") + "." : " So reicht das Geld nur noch wenige Monate.") + " Die größten Posten:";
    s.pending.push({ id: "berater", day: 2, head: s.cash < 0 ? "Ihr Berater schlägt Alarm" : "Ihr Berater bittet um ein Gespräch", text, list: items.length ? items : ["Die laufenden Kosten sind höher als die Einnahmen."], tipText, tip, img: "ev_berater" });
    s.flags.advM = s.m;
  }

  /* ---------- Ereignisse ---------- */
  const actives = s => s.ships.filter(sh => active(s, sh));
  const shipsWhere = (s, f) => actives(s).filter(sh => { const i = infoOf(s, sh); return i && f(i, routeOf(s, sh), sh); });
  const onPort = (s, p) => shipsWhere(s, (i, r) => r.a === p || r.b === p);
  const inArea = (s, ar) => shipsWhere(s, i => i.areas.includes(ar));
  const seaShips = s => shipsWhere(s, i => !i.areas.every(a => a === "river" || a === "canal"));
  const bySeg = (s, seg, min) => shipsWhere(s, i => (i.share[seg] || 0) >= min);
  const shipById = (s, id) => s.ships.find(x => x.id === id);
  const hit = (s, list) => { list = list.filter(sh => !capFx(s, sh).noHit && !(sh.eq.radar && rnd(s) < .6)); if (list.length) incident(s, pick(s, list)); };
  const monthIn = (s, arr) => arr.includes(cal(s.m).mo);
  const ownRoutesWithComp = s => s.routes.filter(r => { const i = rInfo(s, r); return i && compDepsOf(s, r, i) > 0; });

  const EVENTS = {
    eis: { when: s => monthIn(s, [2, 3, 4]) && inArea(s, "atlantic").length > 0, w: 3, img: "ev_eis",
      head: "Eiswarnung auf dem Nordatlantik", text: "Ihre Kapitäne melden Treibeis auf der nördlichen Route. Wie sollen sie fahren?",
      opts: [
        { t: "Kurs halten", h: "pünktlich, aber riskant", f: s => { if (rnd(s) < .15) hit(s, inArea(s, "atlantic")); else { up(s, "rep", 2); return "Alle Schiffe kamen pünktlich an."; } } },
        { t: "Südliche Route", h: "sicher, rund 9.000 Mark Mehrkosten je Schiff", f: s => { expense(s, "Sonderausgaben", 9000 * s.pidx * inArea(s, "atlantic").length); return "Der Umweg kostet Kohle, aber alle kommen sicher an."; } },
        { t: "Fahrt verringern", h: "etwas weniger Fahrgäste nächsten Monat, geringes Risiko", f: s => { s.mods.push({ area: "atlantic", key: "demand", f: .9, until: s.m + 1 }); if (rnd(s) < .03) hit(s, inArea(s, "atlantic")); } },
      ] },
    streik: { when: s => actives(s).length >= 2, w: s => 1 + 1.5 * ["deck", "maschine", "service"].filter(k => staff(s)[k] === 0).length, cd: 30, img: "ev_streik",
      head: "Heizer im Ausstand", text: "Die Heizer fordern mehr Lohn und drohen, die Kessel kalt zu lassen.",
      opts: [
        { t: "Lohn erhöhen", h: "Heuer dauerhaft +5 %", f: s => { s.crewMult *= 1.05; up(s, "rep", 1); } },
        { t: "Kompromiss anbieten", h: "+2,5 % – wenn sie annehmen", f: s => { if (rnd(s) < .55) { s.crewMult *= 1.025; return "Die Heizer nehmen an."; } s.mods.push({ line: "*", key: "demand", f: .5, until: s.m + 1 }); up(s, "rep", -3); return "Abgelehnt – nächsten Monat wird gestreikt."; } },
        { t: "Aussitzen", h: "nächsten Monat fällt viel aus", f: s => { s.mods.push({ line: "*", key: "demand", f: .4, until: s.m + 1 }); up(s, "rep", -6); } },
      ] },
    cholera: { when: s => bySeg(s, "ausw", .3).length > 0, w: 1.5, img: "ev_cholera",
      head: "Choleraverdacht an Bord", text: "Auf einem Ihrer Auswandererschiffe sind mehrere Fahrgäste erkrankt. Der Hafenarzt ist noch nicht informiert.",
      opts: [
        { t: "Quarantäne", h: s => fmt(fine(s, 6000)) + " Mark, Ruf steigt", f: s => { expense(s, "Sonderausgaben", fine(s, 6000)); up(s, "rep", 3); } },
        { t: "Weiterfahren und schweigen", h: "vermutlich geht es gut – fliegt es auf, droht ein Skandal und ein Buchungseinbruch", f: s => { if (rnd(s) < .35) { up(s, "rep", -15); s.mk.brand = clamp(s.mk.brand - 8, 0, 100); s.mods.push({ line: "*", key: "demand", seg: "ausw", f: .5, until: s.m + 3 }); return "Der Fall wird bekannt. Ein Skandal – die Buchungen brechen ein."; } return "Niemand hat etwas bemerkt."; } },
      ] },
    post: { when: s => !s.contracts.post && shipsWhere(s, (i, r, sh) => (r.a === "ny" || r.b === "ny") && TYPES[sh.type].speed >= 13).length > 0, w: 2, img: "ev_post",
      make: s => { const sh = pick(s, shipsWhere(s, (i, r, x) => (r.a === "ny" || r.b === "ny") && TYPES[x.type].speed >= 13)); const r = routeOf(s, sh); return { a: r.a, b: r.b }; },
      head: "Das Reichspostamt bietet einen Postvertrag", text: "9.000 Mark Zuschuss im Monat für fünf Jahre. Bedingung: Jeden Monat fährt mindestens ein Schiff mit 13 Knoten oder mehr auf Ihrer New-York-Linie. Sonst 20.000 Mark Strafe.",
      opts: [
        { t: "Annehmen", h: "sichere Einnahme, feste Pflicht", f: (s, ev) => { s.contracts.post = { name: "Postvertrag New York", a: ev.a, b: ev.b, minSpeed: 13, sub: 9000, pen: 20000, until: s.m + 60 }; s.prestige += 5; } },
        { t: "Ablehnen", h: "frei bleiben", f: s => { } },
      ] },
    postasien: { when: s => !s.contracts.asien && shipsWhere(s, (i, r, sh) => (r.a === "sha" || r.b === "sha") && TYPES[sh.type].speed >= 14).length > 0, w: 4, img: "line_asien",
      make: s => { const sh = pick(s, shipsWhere(s, (i, r, x) => (r.a === "sha" || r.b === "sha") && TYPES[x.type].speed >= 14)); const r = routeOf(s, sh); return { a: r.a, b: r.b }; },
      head: "Reichspostlinie nach Ostasien", text: "Das Reich sucht eine Reederei für die Post nach China: 30.000 Mark Zuschuss im Monat für zehn Jahre. Bedingung: jeden Monat ein Schiff mit mindestens 14 Knoten auf Ihrer Shanghai-Linie. Sonst 60.000 Mark Strafe.",
      opts: [
        { t: "Annehmen", h: "großer Zuschuss, große Pflicht", f: (s, ev) => { s.contracts.asien = { name: "Reichspost Ostasien", a: ev.a, b: ev.b, minSpeed: 14, sub: 30000, pen: 60000, until: s.m + 120 }; s.prestige += 8; } },
        { t: "Ablehnen", h: "frei bleiben", f: s => { } },
      ] },
    insel: { when: s => !s.contracts.insel && monthIn(s, [7, 8]) && onPort(s, "hel").length > 0, w: 3, img: "line_helgo",
      make: s => { const r = routeOf(s, pick(s, onPort(s, "hel"))); return { a: r.a, b: r.b }; },
      head: "Konzession für die Inselpost Helgoland", text: "2.800 Mark im Monat für drei Jahre – aber auch im Winter muss jeden Monat ein Schiff nach Helgoland fahren. Sonst 6.000 Mark Strafe.",
      opts: [
        { t: "Annehmen", h: "Einnahmen im Winter, aber kein Auflegen", f: (s, ev) => { s.contracts.insel = { name: "Inselpost Helgoland", a: ev.a, b: ev.b, sub: 2800, pen: 6000, until: s.m + 36 }; } },
        { t: "Ablehnen", h: "im Winter flexibel bleiben", f: s => { } },
      ] },
    gast: { when: s => shipsWhere(s, (i, r, sh) => ((i.share.biz || 0) + (i.share.tour || 0)) > .3 && TYPES[sh.type].comfort >= 3).length > 0, w: 1.5, img: "ev_gast",
      head: "Berühmter Erfinder bucht eine Passage", text: "Ein gefeierter Erfinder reist mit Ihrer Reederei. Die Zeitungen werden berichten.",
      opts: [
        { t: "Kostenlos in die beste Kabine", h: "800 Mark, Ruf, Bekanntheit und Prestige steigen", f: s => { expense(s, "Sonderausgaben", 800); up(s, "rep", 4); s.prestige += 3; s.mk.brand = clamp(s.mk.brand + 4, 0, 100); } },
        { t: "Wie jeden Gast behandeln", h: "kein Aufwand", f: s => { } },
      ] },
    nebel: { when: s => monthIn(s, [9, 10, 11, 0, 1, 2]) && onPort(s, s.home || "ham").length > 0, w: 2, cd: 10, img: "ev_nebel",
      head: "Dichter Nebel auf dem Fluss", text: "Seit Tagen liegt Nebel über dem Fluss. Die Lotsen raten zur Vorsicht.",
      opts: [
        { t: "Nach Fahrplan fahren", h: "pünktlich, aber Kollisionsgefahr", f: s => { if (rnd(s) < .12) { hit(s, onPort(s, s.home || "ham")); return "Im Nebel kam es zum Zusammenstoß."; } up(s, "rep", 1); return "Alle Schiffe kamen durch."; } },
        { t: "Vor Anker gehen", h: s => "nächsten Monat weniger Fahrgäste ab " + homeName(s) + ", kein Risiko", f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .85, until: s.m + 1 }); } },
        { t: "Zusätzliche Lotsen", h: s => fmt(fine(s, 4000)) + " Mark Lotsengeld, geringes Risiko", f: s => { expense(s, "Lotsengeld", fine(s, 4000)); if (rnd(s) < .03) hit(s, onPort(s, s.home || "ham")); } },
      ] },
    rettung: { when: s => seaShips(s).length > 0, w: 1.5, cd: 18, img: "ev_rettung",
      make: s => { const sh = pick(s, seaShips(s)); return { ship: sh.id, text: "Die Besatzung der „" + sh.name + "“ sichtet im Sturm ein sinkendes Fischerboot. Die Männer im Wasser winken verzweifelt." }; },
      head: "Schiffbrüchige in Seenot",
      opts: [
        { t: "Rettung einleiten", h: "Verspätung, aber großes Ansehen", f: (s, ev) => { s.flags.rescued = true; { const sh = shipById(s, ev.ship); if (sh && capFx(s, sh).rescue > 1) { up(s, "rep", 8); s.mk.brand = clamp(s.mk.brand + 4, 0, 100); } } up(s, "rep", 8); s.prestige += 4; s.mk.brand = clamp(s.mk.brand + 6, 0, 100); const sh = shipById(s, ev.ship); if (sh && sh.line) s.mods.push({ route: sh.line, key: "demand", f: .92, until: s.m + 1 }); return "Alle Fischer wurden gerettet. Die Zeitungen feiern Ihre Mannschaft."; } },
        { t: "Weiterfahren", h: "Fahrplan halten", f: s => { if (rnd(s) < .4) { up(s, "rep", -10); s.mk.brand = clamp(s.mk.brand - 5, 0, 100); return "Ein Passagier hat alles gesehen und berichtet der Presse. Der Ruf leidet."; } return "Niemand erfährt davon."; } },
      ] },
    blinde: { when: s => bySeg(s, "ausw", .3).length > 0, w: 1.5, cd: 14, img: "ev_blinde",
      make: s => { const sh = pick(s, bySeg(s, "ausw", .3)); return { ship: sh.id, text: "Im Laderaum der „" + sh.name + "“ werden fünf blinde Passagiere entdeckt – ausgehungert und verängstigt." }; },
      head: "Blinde Passagiere entdeckt",
      opts: [
        { t: "Der Hafenpolizei übergeben", h: "korrekt, kein Aufwand", f: s => { } },
        { t: "Als Hilfskräfte mitnehmen", h: s => "spart Heuer – fliegt es auf, " + fmt(fine(s, 5000)) + " Mark Strafe", f: s => { if (rnd(s) < .7) { income(s, "Sonstige Einnahmen", 1500); up(s, "rep", 1); return "Die fünf packen kräftig mit an."; } const c = expense(s, "Strafen", fine(s, 5000)); return "Die Behörden verhängen eine Strafe von " + fmt(c) + " Mark."; } },
        { t: "Die Überfahrt nachträglich kassieren", h: "etwas Geld, der Ruf leidet", f: s => { income(s, "Sonstige Einnahmen", 800); up(s, "rep", -4); } },
      ] },
    hafenstreik: { when: s => yearOf(s) >= 1885 && onPort(s, s.home || "ham").length > 0, w: 1, cd: 36, img: "ev_hafenstreik",
      head: "Hafenarbeiter im Ausstand", text: "Die Hafenarbeiter in Ihrem Heimathafen legen die Arbeit nieder. Schiffe werden nicht mehr be- und entladen.",
      opts: [
        { t: "Den Arbeitern entgegenkommen", h: "Hafengebühren steigen dauerhaft um 10 %", f: s => { s.feeMult *= 1.1; up(s, "rep", 2); } },
        { t: "Streikbrecher anheuern", h: "Ruf sinkt, Gefahr von Sabotage", f: s => { up(s, "rep", -8); if (rnd(s) < .3) { hit(s, onPort(s, s.home || "ham")); return "Auf einem Schiff wurde sabotiert."; } } },
        { t: "Abwarten", h: s => "nächsten Monat halbe Fahrgastzahlen ab " + homeName(s), f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .5, until: s.m + 1 }); } },
      ] },
    eisgang: { when: s => monthIn(s, [0, 1]) && ((s.home === "ham" ? onPort(s, "ham").length : 0) + inArea(s, "balticn").length) > 0, w: 2.5, cd: 11, img: "ev_eisgang",
      head: "Eisgang auf Elbe und Ostsee", text: "Treibeis versperrt das Fahrwasser. Ohne Hilfe kommen Ihre Schiffe kaum voran.",
      opts: [
        { t: "Eisbrecher chartern", h: s => fmt(fine(s, 12000)) + " Mark, der Betrieb läuft weiter", f: s => { const c = expense(s, "Sonderausgaben", fine(s, 12000)); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Liegen bleiben", h: s => "nächsten Monat halbe Fahrgastzahlen ab " + homeName(s), f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .5, until: s.m + 1 }); } },
        { t: "Durchfahren", h: "riskant", f: s => { if (rnd(s) < .2) { hit(s, onPort(s, s.home || "ham")); return "Das Eis hat einen Rumpf aufgerissen."; } return "Mit Glück kamen alle durch."; } },
      ] },
    sturmwarnung: { when: s => monthIn(s, [9, 10, 11, 0, 1, 2]) && seaShips(s).length > 0, w: 2.2, cd: 6, img: "ev_sturmwarnung",
      head: "Sturmwarnung der Seewarte", text: "Die Seewarte meldet einen schweren Orkan. Ihre Schiffe liegen zum Auslaufen bereit.",
      opts: [
        { t: "Planmäßig auslaufen", h: "keine Ausfälle, aber gefährlich", f: s => { if (rnd(s) < .35) { hit(s, seaShips(s)); return "Der Sturm hat zugeschlagen."; } return "Alle Schiffe haben den Sturm abgewettert."; } },
        { t: "Im Hafen abwarten", h: "nächsten Monat 20 % weniger Fahrgäste", f: s => { s.mods.push({ line: "*", key: "demand", f: .8, until: s.m + 1 }); } },
        { t: "Nur große Schiffe auslaufen lassen", h: "ein Kompromiss", f: s => { s.mods.push({ line: "*", key: "demand", f: .9, until: s.m + 1 }); if (rnd(s) < .12) { hit(s, seaShips(s).filter(x => TYPES[x.type].seats >= 450)); return "Ein großes Schiff geriet in Schwierigkeiten."; } } },
      ] },
    feuer: { when: s => seaShips(s).length > 0, w: 1.2, cd: 16, img: "ev_feuer",
      make: s => { const sh = pick(s, seaShips(s)); return { ship: sh.id, text: "Im Laderaum der „" + sh.name + "“ schwelt ein Brand. Die Mannschaft kämpft mit Pumpen und Eimern." }; },
      head: "Feuer an Bord",
      opts: [
        { t: "Nächsten Hafen anlaufen", h: "Reparatur und einige Wochen Werft, sicher", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; return repairAfter(s, sh, 0); } },
        { t: "Weiterfahren und löschen", h: "meistens geht es gut", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; const p = .7 + .2 * sh.cond / 100; if (rnd(s) < p) { sh.cond = Math.max(5, sh.cond - 5); return "Das Feuer ist gelöscht, der Schaden gering."; } distress(s, sh); return "Das Feuer ist außer Kontrolle!"; } },
      ] },
    kessel: { when: s => actives(s).some(sh => sh.cond < 75), w: 1.4, cd: 12, img: "ev_kessel",
      make: s => { const list = actives(s).filter(x => x.cond < 75); const sh = pick(s, list); return { ship: sh.id, text: "Der Maschinist der „" + sh.name + "“ meldet gefährlichen Überdruck im Kessel. Das Manometer zittert im roten Bereich." }; },
      head: "Überdruck im Kessel",
      opts: [
        { t: "Sofort in die Werft", h: "Dockung, einige Tage Ausfall, Zustand steigt", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; const c = Math.round(P(s, TYPES[sh.type]) * .035); expense(s, "Werft", c); const d = sendToDock(s, sh, dockDays(sh.type, "dock")); sh.cond = Math.min(100, sh.cond + 20); return "Kosten " + fmt(c) + " Mark, " + d + " Tage Werft."; } },
        { t: "Druck ablassen und weiterfahren", h: "langsamer, kleines Risiko", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; if (sh.line) s.mods.push({ route: sh.line, key: "demand", f: .9, until: s.m + 1 }); if (rnd(s) < .08) { incident(s, sh); return "Trotzdem kam es zum Schaden."; } } },
        { t: "Volle Kraft voraus", h: "Fahrplan halten – riskant", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; if (rnd(s) < .25) { incident(s, sh); return "Der Kessel hat nachgegeben."; } return "Es ging gut – diesmal."; } },
      ] },
    kapitaen: { when: s => actives(s).length > 0, w: .9, cd: 20, img: "ev_gast",
      make: s => { const sh = pick(s, actives(s)); return { ship: sh.id, text: "Der Kapitän der „" + sh.name + "“ wurde betrunken auf der Brücke erwischt. Die Mannschaft ist beunruhigt." }; },
      head: "Ärger auf der Brücke",
      opts: [
        { t: "Kapitän entlassen", h: s => fmt(fine(s, 1000)) + " Mark Abfindung, Ruf steigt", f: s => { expense(s, "Sonderausgaben", fine(s, 1000)); up(s, "rep", 2); } },
        { t: "Verwarnen", h: "kein Aufwand, etwas Risiko", f: (s, ev) => { const sh = shipById(s, ev.ship); if (sh && rnd(s) < .15) { incident(s, sh); return "Wenige Wochen später passierte es."; } } },
      ] },
    charter: { when: s => yearOf(s) >= 1884 && actives(s).some(sh => TYPES[sh.type].seats >= 450 && !s.loans.some(l => l.ship === sh.id)), w: .9, cd: 24, img: "ev_post",
      make: s => { const sh = pick(s, actives(s).filter(x => TYPES[x.type].seats >= 450 && !s.loans.some(l => l.ship === x.id))); const rate = Math.round(shipValue(s, sh) * .045 / 100) * 100; return { ship: sh.id, rate, text: "Die Kaiserliche Marine sucht Transporter und möchte die „" + sh.name + "“ für drei Monate chartern: " + fmt(rate) + " Mark im Monat, Besatzung stellt die Marine zum Teil." }; },
      head: "Charteranfrage der Marine",
      opts: [
        { t: "Verchartern", h: "feste Einnahme, das Schiff fehlt drei Monate", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; sh.charter = s.m + 3; sh.charterRate = ev.rate; s.prestige += 1; return "Die „" + sh.name + "“ ist bis " + dateStr(s.m + 3) + " verchartert."; } },
        { t: "Ablehnen", h: "Linie weiter bedienen", f: s => { } },
      ] },
    presse: { when: s => s.ships.length > 0, w: 1, cd: 20, img: "ev_presse",
      head: "Eine Zeitung plant eine Reportage", text: "Die Illustrirte Zeitung möchte über Ihre Reederei berichten und bittet um eine Mitfahrt.",
      opts: [
        { t: "Journalisten einladen", h: "1.500 Mark, meist ein guter Artikel", f: s => { expense(s, "Werbung", 1500); const avg = s.ships.reduce((a, x) => a + x.cond, 0) / Math.max(1, s.ships.length); if (avg < 60 && rnd(s) < .5) { s.mk.brand = clamp(s.mk.brand - 4, 0, 100); up(s, "rep", -3); return "Der Artikel spottet über rostige Schiffe."; } s.mk.brand = clamp(s.mk.brand + 8, 0, 100); up(s, "rep", 2); return "Ein begeisterter Bericht auf zwei Seiten."; } },
        { t: "Ablehnen", h: "kein Risiko", f: s => { } },
      ] },
    uebernahme: { when: s => yearOf(s) >= 1882 && s.cash > 120000 && ownRoutesWithComp(s).length > 0, w: 1, cd: 30, img: "ev_krise",
      make: s => {
        const r = pick(s, ownRoutesWithComp(s)), info = rInfo(s, r);
        const types = TYPE_ORDER.filter(k => typeOpen(s, k) && !canServe(s, k, r.a, r.b));
        if (!types.length) return { skip: true };
        const type = pick(s, types), age = Math.floor((8 + rnd(s) * 8) * 12), cond = Math.round(60 + rnd(s) * 25);
        const price = Math.round(shipValue(s, { type, age, cond }) * .6 / 1000) * 1000;
        return { route: r.id, type, age, cond, price, name: randomName(s),
          text: rivalNames(s, r, info) + " " + (rivalsOf(s, r, info).length > 1 ? "stecken" : "steckt") + " in Schwierigkeiten und bietet Ihnen einen " + TYPES[type].name + " (Baujahr " + (yearOf(s) - Math.floor(age / 12)) + ") für " + fmt(price) + " Mark an – weit unter Marktwert. Die Konkurrenz auf " + info.name + " würde schwächer." };
      },
      head: "Ein Konkurrent muss verkaufen", ok: (s, ev) => [s.cash >= ev.price, true],
      opts: [
        { t: "Kaufen", h: "sofort einsatzbereit", f: (s, ev) => {
          if (s.cash < ev.price) return "Nicht genug Geld.";
          const r = s.routes.find(x => x.id === ev.route);
          s.cash -= ev.price;
          s.ships.push(initShip(s, { id: uid(s), name: ev.name, type: ev.type, age: ev.age, cond: ev.cond, line: r ? r.id : null, laid: !r, insured: true, maint: 1, ready: s.m, paid: ev.price, eq: {} }));
          if (r) r.compMult = (r.compMult || 1) * .7;
          return "Die „" + ev.name + "“ fährt ab sofort unter Ihrer Flagge.";
        } },
        { t: "Ablehnen", h: "kein Interesse", f: s => { } },
      ] },
    hallen: { when: s => yearOf(s) >= 1885 && !s.mk.hallen && bySeg(s, "ausw", .3).length > 0, w: 1, cd: 36, img: "mk_hallen",
      head: "Elend in den Auswandererquartieren", text: "Tausende warten in feuchten Kellern am Hafen auf ihr Schiff. Der Senat drängt die Reedereien, eigene Auswandererhallen zu bauen.",
      opts: [
        { t: "Auswandererhallen bauen", h: "einmalig rund 60.000 Mark, mehr Auswanderer wählen Sie", f: s => buildHallen(s) || "Die Hallen sind im Bau." },
        { t: "Später", h: "jederzeit unter Werbung möglich", f: s => { } },
      ] },
    koenig: { when: s => actives(s).some(sh => TYPES[sh.type].comfort >= 3), w: .9, cd: 36, img: "ev_koenig",
      make: s => { const sh = pick(s, actives(s).filter(x => TYPES[x.type].comfort >= 3)); return { ship: sh.id, text: "Der Hof lässt anfragen: Ein Monarch möchte eine Fahrt auf der „" + sh.name + "“ unternehmen. Ganz Hamburg wird zuschauen." }; },
      head: "Königlicher Besuch angekündigt",
      opts: [
        { t: "Festlich empfangen", h: s => fmt(Math.round(4000 * s.pidx)) + " Mark für Schmuck und Musik, großes Ansehen", f: (s, ev) => { const c = expense(s, "Sonderausgaben", Math.round(4000 * s.pidx)); s.flags.koenigFest = true; s.prestige += 6; up(s, "rep", 4); s.mk.brand = clamp(s.mk.brand + 10, 0, 100); const sh = shipById(s, ev.ship); if (sh && sh.line) s.mods.push({ route: sh.line, key: "demand", f: 1.25, until: s.m + 3 }); return "Die Zeitungen sind voll davon. Kosten " + fmt(c) + " Mark."; } },
        { t: "Schlicht und würdig", h: "kaum Kosten, etwas Ansehen", f: s => { s.prestige += 2; up(s, "rep", 1); } } ] },
    regatta: { when: s => actives(s).length > 0, w: 1, cd: 20, img: "ev_regatta",
      make: s => { const sh = actives(s).slice().sort((a, b) => TYPES[b.type].speed + (b.spd || 0) - TYPES[a.type].speed - (a.spd || 0))[0]; return { ship: sh.id, text: "Ein Konkurrent fordert Sie heraus: eine Wettfahrt auf dem Fluss vor der Stadt, Ihre schnellste „" + sh.name + "“ gegen seinen besten Dampfer. Tausende wollen zuschauen." }; },
      head: "Herausforderung zur Wettfahrt",
      opts: [
        { t: "Herausforderung annehmen", h: "Ruhm und Wettgewinn bei Sieg, Spott bei Niederlage", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; const p = clamp(.35 + (TYPES[sh.type].speed + (sh.spd || 0) - 11 - .08 * (yearOf(s) - 1880)) * .08 + sh.cond / 400, .1, .9); if (rnd(s) < p) { s.mk.brand = clamp(s.mk.brand + 12, 0, 100); s.prestige += 4; up(s, "rep", 3); const prize = income(s, "Wettgewinne", Math.round(3000 * s.pidx)); s.flags.regattaWin = true; return "Sieg! Die „" + sh.name + "“ gewinnt mit einer Schiffslänge Vorsprung. Wettgewinn " + fmt(prize) + " Mark."; } s.mk.brand = clamp(s.mk.brand - 3, 0, 100); sh.cond = Math.max(5, sh.cond - 3); return "Knapp verloren. Die Zeitungen spotten ein wenig."; } },
        { t: "Ablehnen", h: "kein Risiko", f: s => { } } ] },
    hochzeit: { when: s => actives(s).some(sh => TYPES[sh.type].comfort >= 2 && !TYPES[sh.type].ocean), w: 1.1, cd: 10, img: "ev_hochzeit",
      make: s => { const sh = pick(s, actives(s).filter(x => TYPES[x.type].comfort >= 2 && !TYPES[x.type].ocean)); const pay = Math.round((1500 + TYPES[sh.type].seats * 3) * s.pidx / 100) * 100; return { ship: sh.id, pay, text: "Eine wohlhabende Hamburger Familie möchte die „" + sh.name + "“ für eine Hochzeitsfahrt chartern: zwei Tage, " + fmt(pay) + " Mark, Musik und Blumen inklusive." }; },
      head: "Eine Hochzeitsgesellschaft möchte chartern",
      opts: [
        { t: "Gern – Sonderfahrt übernehmen", h: "gutes Geld, das Schiff fehlt zwei Tage auf der Linie", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; income(s, "Sonderfahrten", ev.pay); sh.offUntil = s.t + 2; s.mk.brand = clamp(s.mk.brand + 3, 0, 100); return "Ein rauschendes Fest – und " + fmt(ev.pay) + " Mark in der Kasse."; } },
        { t: "Ablehnen", h: "Fahrplan geht vor", f: s => { } } ] },
    zoll: { when: s => seaShips(s).length > 0, w: .9, cd: 18, img: "ev_zoll",
      make: s => { const sh = pick(s, seaShips(s)); return { ship: sh.id, text: "Zollbeamte durchsuchen den Laderaum der „" + sh.name + "“ und finden Tabak und Branntwein, die ein Steward schmuggeln wollte." }; },
      head: "Schmuggel an Bord",
      opts: [
        { t: "Mit dem Zoll zusammenarbeiten", h: s => fmt(fine(s, 2000)) + " Mark Strafe zahlen, Steward entlassen", f: s => { const c = expense(s, "Strafen", fine(s, 2000)); up(s, "rep", 1); return "Strafe " + fmt(c) + " Mark. Der Zoll lobt Ihre Offenheit."; } },
        { t: "Den Steward decken", h: s => "vielleicht geht es gut – sonst " + fmt(fine(s, 9000)) + " Mark Strafe und schlechte Presse", f: s => { if (rnd(s) < .5) return "Der Zoll lässt die Sache fallen."; const c = expense(s, "Strafen", fine(s, 9000)); up(s, "rep", -6); return "Es kommt heraus: " + fmt(c) + " Mark Strafe und schlechte Presse."; } } ] },
    taufe: { when: () => false, w: 0, img: "ev_taufe", head: "Schiffstaufe",
      opts: [
        { t: "Großes Fest mit Kapelle", h: "kostet etwas, Prestige, Ruf und Bekanntheit steigen", f: (s, ev) => { const sh = shipById(s, ev.ship); const cost = sh ? Math.round(2000 + P(s, TYPES[sh.type]) * .002) : 2000; expense(s, "Sonderausgaben", cost); s.prestige += 2 + (sh ? Math.round(TYPES[sh.type].price / 2e6) : 0); up(s, "rep", 2); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); return "Kosten: " + fmt(cost) + " Mark."; } },
        { t: "Schlichte Taufe im kleinen Kreis", h: "kein Aufwand", f: s => { } },
      ] },
  };

  const NEWS = {
    welle: { when: s => true, w: 1.2, img: "ev_welle", f: s => { s.mods.push({ line: "*", key: "demand", seg: "ausw", f: 1.45, until: s.m + 8 }); return ["Auswandererwelle erreicht die Häfen", "Tausende warten auf eine Überfahrt nach Amerika. Die Nachfrage der Auswanderer steigt deutlich."]; } },
    krise: { when: s => s.konj > .9, w: 1, img: "ev_krise", f: s => { s.konj = .8; s.shipIdx = Math.min(s.shipIdx, .85); s.base += 1; return ["Börsenkrach – die Wirtschaft stockt", "Weniger Reisende, fallende Schiffspreise, steigende Zinsen. Banken prüfen ihre Kredite genauer."]; } },
    boom: { when: s => s.konj < 1.1, w: .8, f: s => { s.konj = Math.min(1.25, s.konj + .15); return ["Die Geschäfte brummen", "Handel und Industrie wachsen kräftig. Es wird mehr gereist als je zuvor."]; } },
    preis: { when: s => ownRoutesWithComp(s).length > 0, w: 1.3, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i); s.mods.push({ route: r.id, key: "comp", f: .8, until: s.m + 6 }); return ["Preiskampf auf " + i.name, RIV[k].name + " senkt dort die Fahrpreise um 20 % – vorerst für ein halbes Jahr.", RIV[k].img]; } },
    kaiser: { when: s => monthIn(s, [3, 4, 5]), w: 1, img: "line_helgo", f: s => { s.mods.push({ port: "hel", key: "demand", f: 1.5, until: s.m + 2 }); return ["Kaiserbesuch auf Helgoland angekündigt", "Die Insel erwartet einen Ansturm von Schaulustigen."]; } },
    konk: { when: s => ownRoutesWithComp(s).length > 0, w: 1, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i); r.compMult = (r.compMult || 1) * 1.3; r.compSpeedAdd = (r.compSpeedAdd || 0) + .5; return [RIV[k].name + " verstärkt die Flotte", "Mehr Abfahrten und schnellere Schiffe auf " + i.name + ".", RIV[k].img]; } },
    kohle: { when: s => s.coal < 1.15, w: 1, img: "ev_kohle", f: s => { s.coal = 1.3; return ["Kohle wird teuer", "Streiks in den Zechen treiben den Kohlepreis um 30 % nach oben."]; } },
    verzug: { when: s => s.ships.some(sh => sh.ready > s.m + 1), w: 1.5, f: s => { const sh = pick(s, s.ships.filter(x => x.ready > s.m + 1)); sh.ready += 2; return ["Bauverzug bei der Werft", "Die Ablieferung der „" + sh.name + "“ verschiebt sich auf " + dateStr(sh.ready) + "."]; } },
    rabatt: { when: s => !(s.discount && s.discount.until >= s.m), w: .8, f: s => { s.discount = { f: .9, until: s.m + 3 }; return ["Werft bietet Sonderkonditionen", "Freie Hellingplätze: 10 % Rabatt auf alle Neubauten, die bis " + dateStr(s.m + 3) + " bestellt werden."]; } },
    sturmflut: { when: s => monthIn(s, [9, 10, 11, 0, 1, 2]), w: .8, img: "ev_sturmflut", f: s => { const cost = Math.round(8000 + fleetValue(s) * .003); expense(s, "Sonderausgaben", cost); const hh = onPort(s, s.home || "ham"); if (hh.length) { const sh = pick(s, hh); sh.cond = Math.max(5, sh.cond - 8); } return ["Sturmflut im Hamburger Hafen", "Das Wasser steht über den Kais. Schäden an Anlegern und Schiffen kosten Sie " + fmt(cost) + " Mark."]; } },
    sturmserie: { when: s => monthIn(s, [10, 11, 0, 1]) && seaShips(s).length > 0, w: .9, img: "ev_sturmwarnung", f: s => { s.mods.push({ line: "*", key: "risk", f: 1.8, until: s.m + 2 }); return ["Orkane über der Nordsee", "Die Seewarte erwartet eine ganze Serie schwerer Stürme. Die Gefahr für Schiffe auf See ist deutlich erhöht."]; } },
    rekord: { when: s => actives(s).length > 0, w: .8, f: s => { const sh = pick(s, actives(s)); s.prestige += 2; up(s, "rep", 1); s.mk.brand = clamp(s.mk.brand + 2, 0, 100); return ["Neuer Streckenrekord", "Die „" + sh.name + "“ schafft die Fahrt schneller als je ein Schiff zuvor."]; } },
    band: { when: s => !s.stats.band && shipsWhere(s, (i, r, sh) => (r.a === "ny" || r.b === "ny") && TYPES[sh.type].speed >= i.comp.speed + 3).length > 0, w: 4, f: s => { s.stats.band = true; s.prestige += 25; up(s, "rep", 5); s.mk.brand = clamp(s.mk.brand + 15, 0, 100); return ["Das Blaue Band geht nach Hamburg!", s.name + " stellt einen neuen Rekord über den Atlantik auf. Die Buchungen nach New York ziehen an."]; } },
    bahn: { when: s => s.routes.some(r => !r.railHit && rInfo(s, r) && rInfo(s, r).dist < 150 && !rInfo(s, r).areas.includes("north") && r.a !== "hel" && r.b !== "hel"), w: .6, img: "line_kiel",
      f: s => { const list = s.routes.filter(r => !r.railHit && rInfo(s, r).dist < 150 && !rInfo(s, r).areas.includes("north") && r.a !== "hel" && r.b !== "hel"); const r = pick(s, list), i = rInfo(s, r); r.railHit = true; r.demMult = (r.demMult || 1) * .8; return ["Neue Eisenbahn parallel zu " + i.name, "Die Bahn ist schneller und fährt öfter. Ein Teil der Fahrgäste steigt dauerhaft um."]; } },
    hafenausbau: { when: s => s.routes.length > 0, w: .7, f: s => { const r = pick(s, s.routes), p = pick(s, [r.a, r.b]); s.pm[p] = Object.assign({}, s.pm[p], { fee: ((s.pm[p] || {}).fee || 1) * .85 }); s.pmVer++; return ["Hafen " + PORTS[p].name + " wird ausgebaut", "Neue Kais und Kräne – die Liegezeiten werden kürzer, und mehr Reisende kommen in die Stadt."]; } },
    versicherung: { when: s => s.insMult <= 1 && s.stats.sunk > 0, w: .8, f: s => { s.insMult = 1.25; s.mods.push({ line: "*", key: "ins", f: 1, until: s.m + 12 }); s.flags.insUntil = s.m + 12; return ["Versicherer erhöhen die Prämien", "Nach mehreren Unglücken verlangen die Seeversicherer ein Jahr lang 25 % mehr."]; } },
    pleite: { when: s => ownRoutesWithComp(s).length > 0, w: .7, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i), st = rivState(s, k); st.weak = .5; st.weakUntil = s.m + 12; return [RIV[k].name + " in Schwierigkeiten", "Der Rivale muss sparen und streicht für ein Jahr viele Abfahrten. Seine Fahrgäste suchen neue Schiffe.", RIV[k].img]; } },
    epidemie: { when: s => s.routes.some(r => ["rio", "bue", "sha", "ale"].includes(r.a) || ["rio", "bue", "sha", "ale"].includes(r.b)), w: .6, f: s => { const p = pick(s, ["rio", "bue", "sha", "ale"].filter(x => s.routes.some(r => r.a === x || r.b === x))); s.mods.push({ port: p, key: "demand", f: .6, until: s.m + 4 }); return ["Gelbfieber in " + PORTS[p].name, "Die Behörden raten von Reisen ab. Die Buchungen gehen für einige Monate deutlich zurück."]; } },
  };
  Object.assign(NEWS, {
    brief: { when: s => true, w: .7, img: "ev_brief", f: s => { const k = pick(s, [["Eine alte Schuld wird beglichen", "Ein Geschäftspartner, von dem Sie nichts mehr erwartet hatten, zahlt ein altes Darlehen zurück."], ["Beitragsrückerstattung", "Die Seeversicherung erstattet Ihnen einen Teil der Prämien – wegen guter Führung."], ["Ein Vermächtnis", "Ein alter Kapitän hat Ihrer Reederei in seinem Testament eine Summe vermacht."]]); const c = Math.round((3000 + rnd(s) * 9000) * s.pidx / 100) * 100; income(s, "Sonstige Einnahmen", c); return [k[0], k[1] + " " + fmt(c) + " Mark gehen auf Ihrem Konto ein."]; } },
    kohlebillig: { when: s => s.coal > .9, w: .9, img: "ev_kohle", f: s => { s.coal = .75; return ["Kohle so billig wie lange nicht", "Neue Zechen an der Ruhr fördern mehr als je zuvor. Der Kohlepreis fällt um ein Viertel."]; } },
    orden: { when: s => s.ships.length > 0, w: .6, img: "ev_orden", f: s => { const sh = pick(s, s.ships); up(s, "rep", 4); s.mk.brand = clamp(s.mk.brand + 5, 0, 100); s.prestige += 2; return ["Orden für einen Ihrer Kapitäne", "Der Kapitän der „" + sh.name + "“ erhält auf dem Kai die Rettungsmedaille. Ganz Hamburg applaudiert Ihrer Reederei."]; } },
    lob: { when: s => s.ships.length > 0, w: .8, img: "ev_presse", f: s => { s.mk.brand = clamp(s.mk.brand + 6, 0, 100); up(s, "rep", 2); return ["Die Zeitung lobt Ihre Reederei", "„Pünktlich, sauber, freundlich“ – ein Reporter ist heimlich mitgefahren und schreibt einen begeisterten Artikel."]; } },
    bergelohn: { when: s => seaShips(s).length > 0, w: .5, img: "ev_bergung", f: s => { const sh = pick(s, seaShips(s)), c = Math.round((4000 + rnd(s) * 11000) * s.pidx / 100) * 100; income(s, "Bergelohn", c); up(s, "rep", 2); return ["Bergelohn für die „" + sh.name + "“", "Die Mannschaft hat ein treibendes, verlassenes Frachtschiff in den Hafen geschleppt. Das Seeamt spricht Ihnen " + fmt(c) + " Mark Bergelohn zu."]; } },
    messe: { when: s => s.routes.length > 0, w: .7, img: "ev_expo", f: s => { s.mods.push({ line: "*", key: "demand", seg: "biz", f: 1.3, until: s.m + 4 }); return ["Große Handelsmesse in Hamburg", "Kaufleute aus ganz Europa reisen an. Für einige Monate buchen deutlich mehr Geschäftsreisende."]; } },
    flaschenpost: { when: s => s.flags.emil === "aboard" && s.ships.some(x => x.emil), w: .7, img: "ev_emil", f: s => { const c = Math.round((2000 + rnd(s) * 6000) * s.pidx / 100) * 100; income(s, "Fundsachen", c); return ["Kapitän Emil fischt eine Flaschenpost aus dem Wasser", "Darin: die Schatzkarte eines längst vergessenen Kaperfahrers. Emil schwört, er kenne die Stelle – und tatsächlich: " + fmt(c) + " Mark für die Reedereikasse."]; } },
    seemannsgarn: { when: s => s.flags.emil === "aboard" && s.ships.some(x => x.emil && x.line), w: .6, img: "ev_emil", f: s => { const sh = s.ships.find(x => x.emil); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); if (sh.line) s.mods.push({ route: sh.line, key: "demand", f: 1.1, until: s.m + 2 }); return ["Kapitän Emils Seemannsgarn", "Von Seeschlangen, Klabautermännern und dem Sturm von ’48 – die Fahrgäste lieben seine Geschichten und buchen extra seine Fahrten auf der „" + sh.name + "“."]; } },
    ausflug: { when: s => monthIn(s, [4, 5, 6, 7]), w: .8, img: "line_insel", f: s => { s.mods.push({ line: "*", key: "demand", seg: "bath", f: 1.25, until: s.m + 3 }); return ["Ein Rekordsommer kündigt sich an", "Hitze in den Städten – wer kann, fährt an die See. Die Bäderlinien erwarten Hochbetrieb."]; } },
  });
  const HISTORY = [
    { y: 1882, mo: 4, key: "irland82", img: "gb_queenstown", f: s => { s.mods.push({ port: "que", key: "demand", f: 1.4, until: s.m + 12 }); return ["Auswanderungswelle aus Irland", "Missernten und Not treiben Zehntausende nach Amerika. In Queenstown drängen sich die Auswanderer an den Tendern."]; } },
    { y: 1886, mo: 4, key: "tilbury86", img: "gb_dover", f: s => { s.pmVer++; return ["Die Tilbury Docks eröffnen", "Unterhalb von London entstehen neue, tiefe Docks. Die Bahn bringt Reisende bis an die Schiffe – Tilbury wird zum Fährbahnhof."]; } },
    { y: 1889, mo: 8, key: "dockstrike89", img: "gb_streik", f: s => { s.mods.push({ port: "lon", key: "demand", f: .6, until: s.m + 1 }); return ["Großer Hafenstreik in London", "Zehntausende Dockarbeiter kämpfen um sechs Pence Stundenlohn. Der Londoner Hafen steht fast einen Monat still."]; } },
    { c: "gb", y: 1894, mo: 4, key: "shipcanal94", img: "gb_kanal", f: s => { s.mods.push({ port: "lpl", key: "demand", seg: "bath", f: 1.15, until: s.m + 12 }); s.mods.push({ port: "lpl", key: "demand", seg: "biz", f: .95, until: s.m + 24 }); return ["Der Manchester-Schiffskanal ist eröffnet", "Große Schiffe fahren jetzt bis nach Manchester. Liverpool verliert etwas Handel – aber Ausflüge durch den neuen Kanal sind der Renner des Sommers."]; } },
    { y: 1911, mo: 5, key: "lplstrike11", img: "gb_streik", f: s => { s.mods.push({ port: "lpl", key: "demand", f: .5, until: s.m + 2 }); return ["Generalstreik im Liverpooler Hafen", "Hafenarbeiter, Seeleute und Eisenbahner legen die Arbeit nieder. Zwei Monate lang geht im Liverpooler Hafen fast nichts."]; } },
    { c: "de", y: 1881, mo: 5, key: "cuxbahn", img: "line_cux", f: s => { s.pair[pairKey("ham", "cux")] = .75; s.pmVer++; return ["Eisenbahn nach Cuxhaven eröffnet", "Die neue Niederelbebahn bringt Ausflügler in zwei Stunden an die Küste. Die Dampfer nach Cuxhaven verlieren Fahrgäste."]; } },
    { y: 1886, mo: 8, key: "gold86", img: "line_sued", f: s => { s.pm.kap = Object.assign({}, s.pm.kap, { ziel: 4 }); s.pmVer++; return ["Goldfunde am Witwatersrand", "In Südafrika wurde Gold entdeckt. Tausende wollen nach Kapstadt."]; } },
    { y: 1889, mo: 4, key: "expo89", img: "ev_expo", f: s => { for (const p of ["lon", "hav", "rot", "ant", "ams"]) s.mods.push({ port: p, key: "demand", f: 1.35, until: s.m + 6 }); return ["Weltausstellung in Paris eröffnet", "Der neue Eiffelturm lockt Besucher aus ganz Europa. Die Nachfrage nach London, Le Havre und den Niederlanden steigt."]; } },
    { c: "de", y: 1892, mo: 5, key: "norddeich92", img: "line_norder", f: s => { s.pm.ndd = Object.assign({}, s.pm.ndd, { pop: 2.5 }); s.pmVer++; return ["Die Bahn fährt bis Norddeich", "Badegäste aus dem ganzen Reich kommen jetzt direkt an die Mole. Die Inseln erwarten Rekordsommer."]; } },
    { c: "de", y: 1892, mo: 7, key: "cholera92", img: "ev_cholera", f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .55, until: s.m + 3 }); s.mods.push({ line: "*", key: "demand", seg: "ausw", f: .5, until: s.m + 4 }); return ["Cholera in Hamburg", "Eine Epidemie wütet in der Stadt. Viele Häfen verweigern Hamburger Schiffen die Einfahrt, Auswanderer bleiben aus."]; } },
    { y: 1893, mo: 4, key: "expo93", img: "line_ny", f: s => { s.mods.push({ port: "ny", key: "demand", f: 1.3, until: s.m + 6 }); return ["Weltausstellung in Chicago", "Ganz Europa will Amerika sehen. Die Buchungen nach New York steigen."]; } },
    { y: 1895, mo: 5, key: "kanal95", img: "line_kanal", f: s => { s.pmVer++; return ["Der Kaiser-Wilhelm-Kanal ist eröffnet", "Von Hamburg in die Ostsee ohne den Umweg um Skagen: Fahrten nach Kiel, Kopenhagen oder Stockholm werden viel kürzer."]; } },
    { c: "de", y: 1896, mo: 10, key: "streik96", img: "ev_hafenstreik", f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .65, until: s.m + 3 }); return ["Großer Hafenarbeiterstreik in Hamburg", "Zehntausende legen die Arbeit nieder. Der Hafen steht still – für Wochen."]; } },
    { y: 1900, mo: 3, key: "expo00", img: "ev_expo", f: s => { for (const p of ["lon", "hav", "rot", "ant", "ams"]) s.mods.push({ port: p, key: "demand", f: 1.35, until: s.m + 7 }); return ["Weltausstellung in Paris", "Das neue Jahrhundert beginnt mit einem Fest. Reisende strömen über die Kanalhäfen nach Paris."]; } },
    { y: 1903, mo: 9, key: "gedser03", img: "line_faehre", f: s => { s.pmVer++; return ["Eisenbahnfähre Warnemünde–Gedser", "Die kürzeste Verbindung von Berlin nach Kopenhagen führt jetzt über das Wasser – samt Zug. Eisenbahnfähren sind gefragt."]; } },
    { y: 1909, mo: 6, key: "koenig09", img: "line_faehre", f: s => { s.pmVer++; return ["Königslinie Sassnitz–Trelleborg eröffnet", "Züge von Berlin nach Stockholm fahren nun per Fähre über die Ostsee."]; } },
    { y: 1912, mo: 3, key: "boote12", img: "ev_eis", f: s => { s.flags.boote1912 = true; const own = s.ships.some(x => x.type === "titanic"); return ["Schweres Unglück auf dem Nordatlantik", "Nach dem Untergang eines großen Passagierdampfers schreiben die Staaten Rettungsboote für alle an Bord vor. Schiffe ohne ausreichende Boote zahlen deutlich höhere Versicherungsprämien." + (own ? " Ihre „Titanic“ ist wohlauf – doch auch für sie gilt die neue Pflicht." : "")]; } },
    { y: 1914, mo: 7, key: "panama14", img: "line_sued", f: s => ["Panamakanal eröffnet", "Zwischen Atlantik und Pazifik liegt nur noch ein Kanal. Die Welt der Schifffahrt wird kleiner."] },
  ];

  function rollEvents(s) {
    const c = cal(s.m);
    for (const l of s.loans) {
      const sh = s.ships.find(x => x.id === l.ship);
      if (!sh || sh.ready + 24 > s.m || l.called) continue;
      const v = shipValue(s, sh);
      if (l.out > v * 1.05) { l.called = true; const demand = Math.round((l.out - v * .9) / 1000) * 1000;
        s.pending.push({ id: "margin", loan: l.id, ship: sh.id, demand, head: "Die Bank verlangt eine Sondertilgung", text: "Der Wert der „" + sh.name + "“ deckt den Kredit nicht mehr. Die Bank fordert " + fmt(demand) + " Mark Sondertilgung.", img: "ev_krise" }); }
    }
    if (c.mo === 0) {
      for (const k of TYPE_ORDER) if (TYPES[k].from === c.y && c.y > START_YEAR) s.log.unshift({ m: s.m, head: "Neu auf der Werft: " + TYPES[k].name, text: TYPE_NOTE[k], kind: "news", img: GEN_TYPES[k] ? "ev_entwurf" : "ship_" + k });
      if (c.y % 10 === 0) s.log.unshift({ m: s.m, head: "Bilanz eines Jahrzehnts", text: s.name + " startet ins Jahr " + c.y + " mit " + fmt(equity(s)) + " Mark Eigenkapital, " + s.ships.length + " Schiffen, " + s.routes.length + " Linien und einem Reederei-Index von " + fmt(score(s)) + ".", kind: "news" });
      if (c.y === 1890) s.log.unshift({ m: s.m, head: "Reisebüros entdecken die Seereise", text: "Unter Werbung können Sie jetzt Reisebüros und Kataloge nutzen.", kind: "news", img: "mk_reise" });
      if (c.y === 1900) s.log.unshift({ m: s.m, head: "Funken über das Meer", text: "Die ersten Funkanlagen für Schiffe sind zu haben – in der Flotte unter Sicherheit.", kind: "news" });
    }
    for (const h of HISTORY) if (!s.done[h.key] && c.y === h.y && c.mo === h.mo && (!h.c || h.c === (s.country || "de"))) { s.done[h.key] = true; const [hd, t] = h.f(s); s.log.unshift({ m: s.m, head: hd, text: t, kind: "news", img: h.img }); }
    if (rnd(s) < .32) {
      const ids = Object.keys(NEWS).filter(k => NEWS[k].when(s));
      if (ids.length) { const k = weighted(s, ids, NEWS); const r = NEWS[k].f(s); if (r) s.log.unshift({ m: s.m, head: r[0], text: r[1], kind: "news", img: r[2] || NEWS[k].img }); }
    }
    const spec = SPECIAL_ORDER.filter(k => yearOf(s) >= TYPES[k].from && !s.ships.some(x => x.type === k) && (s.flags["sp_" + k] || 0) < 2 && !((s.flags["spm_" + k] || -99) > s.m - 60));
    if (!s.pending.length && spec.length && rnd(s) < .012) {
      const k = pick(s, spec), t = TYPES[k], age = k === "american" ? 0 : Math.max(0, (yearOf(s) - t.from) * 12);
      const price = Math.round(shipValue(s, { type: k, age, cond: 95 }) * (k === "american" ? .8 : .95) / 10000) * 10000;
      const intro = {
        american: "Eine amerikanische Werft hat einen Ozeandampfer gebaut, der seiner Zeit Jahrzehnte voraus scheint. Der Auftraggeber ist pleite, und der Makler bietet ihn nur wenigen Reedereien an:",
        nomadic: "Ein britischer Hafentender, elegant wie eine Yacht, sucht einen neuen Eigner:",
        carpathia: "Eine britische Reederei trennt sich von einem bewährten Dampfer:",
        lusitania: "Eine britische Reederei braucht dringend Geld und bietet ihren schnellsten Dampfer an:",
        titanic: "Kurz vor der Jungfernfahrt gerät der Eigner in Geldnot. Der größte Dampfer der Welt steht zum Verkauf:",
        augusta: "Eine große Hamburger Reederei ordnet ihre Flotte neu und bietet Ihnen ein berühmtes Schiff an:",
        paris: "Eine britische Reederei steckt in Schwierigkeiten und bietet ihren Rekordhalter an:" }[k];
      s.pending.push({ id: "sonder", type: k, age, price, img: "ev_makler", img2: "ship_" + k, head: "Ein seltenes Angebot: die „" + t.ship + "“",
        text: intro + " die „" + t.ship + "“ für " + fmt(price) + " Mark. " + t.trait + " Ein solches Angebot kommt vielleicht nie wieder." });
      s.flags["sp_" + k] = (s.flags["sp_" + k] || 0) + 1; s.flags["spm_" + k] = s.m;
    }
    if (!s.pending.length && rnd(s) < .34) {
      const ids = Object.keys(EVENTS).filter(k => wOf(s, EVENTS[k]) > 0 && EVENTS[k].when(s) && !(s.seen[k] > s.m - (EVENTS[k].cd || 12)));
      if (ids.length) {
        const k = weighted(s, ids, EVENTS), E = EVENTS[k];
        const ev = Object.assign({ id: k, head: E.head, text: E.text, img: E.img }, E.make ? E.make(s) : {});
        if (!ev.skip) { s.pending.push(ev); s.seen[k] = s.m; }
      }
    }
  }
  const wOf = (s, x) => typeof x.w === "function" ? x.w(s) : x.w;
  function weighted(s, ids, tbl) { const tot = ids.reduce((a, k) => a + wOf(s, tbl[k]), 0); let r = rnd(s) * tot; for (const k of ids) { r -= wOf(s, tbl[k]); if (r <= 0) return k; } return ids[ids.length - 1]; }
  function rivalNames(s, r, info) { const rv = rivalsOf(s, r, info); return rv.length ? rv.map(x => RIV[x.k].name).join(" und ") : "die Konkurrenz"; }
  const mainRival = (s, r, info) => { const rv = rivalsOf(s, r, info); return rv.length ? rv.slice().sort((a, b) => b.w - a.w)[0].k : null; };

  function eventOptions(s, ev) {
    if (ev.id === "margin") return [
      { t: "Sondertilgung zahlen", h: fmt(ev.demand) + " Mark", ok: s.cash >= ev.demand },
      { t: "Schiff verkaufen", h: "zum aktuellen Marktpreis" },
      { t: "Aussitzen", h: "Bonität sinkt, Zins steigt – beim nächsten Mal zieht die Bank das Schiff ein" }];
    if (ev.id === "werft") { const sh = shipById(s, ev.ship), W = WERFT[ev.kind]; if (!sh || !W) return [{ t: "Weiter", h: "" }]; return W.opts.map(o => ({ t: o.t, h: o.h(s, sh) })); }
    if (ev.id === "major") {
      const sh = shipById(s, ev.ship); if (!sh) return [{ t: "Weiter", h: "" }];
      const c = majorCost(s, sh, ev.kind), d = dockDays(sh.type, ev.kind);
      return [{ t: "Jetzt erneuern", h: fmt(c) + " Mark, " + d + " Tage in der Werft", ok: s.cash >= c },
        { t: "Aufschieben", h: ev.kind === "kessel" ? "höhere Havariegefahr und mehr Kohleverbrauch – in einem Jahr wird wieder gefragt" : "schnellerer Verschleiß, Zustand höchstens 70 % – in einem Jahr wird wieder gefragt" },
        { t: "Schiff verkaufen", h: "etwa " + fmt(shipValue(s, sh) * .9) + " Mark" }];
    }
    { const lo = lateOptions(s, ev); if (lo) return lo; }
    if (ev.id === "kapitan") return [{ t: "Anheuern", h: fmt(ev.fee) + " Mark Handgeld, danach in der Flotte einem Schiff zuweisen", ok: s.cash >= ev.fee }, { t: "Ablehnen", h: "vielleicht fragt er später noch einmal" }];
    if (ev.id === "traum") return [{ t: "Willkommen an Bord!", h: "ein Geschenk aus einer anderen Zeit" }];
    if (ev.id === "emil") return [{ t: "Anheuern – willkommen an Bord!", h: "sein Schiff wird zum Glücksschiff" }, { t: "Danke, wir sind gut besetzt", h: "er zieht weiter" }];
    if (ev.id === "berater") return ev.tip ? [{ t: "Rat befolgen", h: ev.tip.label }, { t: "Danke, ich kümmere mich selbst", h: "" }] : [{ t: "Verstanden", h: "" }];
    if (ev.id === "sonder") {
      const qb = quote(s, ev.price, "bar"), qc = quote(s, ev.price, "used");
      return [
        { t: "Bar kaufen", h: fmt(qb.now) + " Mark mit Skonto", ok: qb.ok },
        { t: "Mit Bankkredit kaufen", h: qc.rate != null && qc.now != null ? fmt(qc.now) + " Mark Anzahlung, " + fmt(qc.pay) + " Mark im Monat" : "Die Bank gibt keinen Kredit", ok: !!qc.ok },
        { t: "Ablehnen", h: "vielleicht kommt sie eines Tages wieder" }];
    }
    if (ev.id === "seenot") {
      const sh = shipById(s, ev.ship); if (!sh) return [{ t: "Weiter", h: "" }];
      const o = distressOdds(s, sh), pct = x => "Aussicht etwa " + Math.round(x * 100) + " %";
      return [
        { t: "Schiff aufgeben – alle in die Boote", h: "das Schiff ist verloren" + (sh.eq.boote || TYPES[sh.type].seats <= 300 ? ", die Menschen sind sicher" : " – es gibt nicht genug Rettungsboote") },
        { t: "Pumpen und Nothafen anlaufen", h: pct(o.pump) + " – misslingt es, sinkt das Schiff mit Opfern" },
        { t: sh.eq.funk ? "Hilfe per Funk rufen" : "Notsignale schießen", h: pct(o.call) + ", Bergelohn " + fmt(o.salvage) + " Mark – misslingt es, sinkt das Schiff, die Menschen werden gerettet" }];
    }
    const E = EVENTS[ev.id], oks = E.ok ? E.ok(s, ev) : [];
    return E.opts.map((o, i) => ({ t: o.t, h: ev.id === "uebernahme" && i === 0 ? fmt(ev.price) + " Mark, sofort einsatzbereit" : typeof o.h === "function" ? o.h(s, ev) : o.h, ok: oks[i] !== false }));
  }
  function resolve(s, idx) {
    const ev = s.pending.shift(); if (!ev) return;
    let msg = "";
    if (ev.id === "margin") {
      const l = s.loans.find(x => x.id === ev.loan); if (!l) return;
      if (idx === 0 && s.cash >= ev.demand) { s.cash -= ev.demand; l.out -= ev.demand; l.pay = Math.round(annuity(l.out, l.rate, Math.max(1, l.left))); l.called = false; msg = "Sondertilgung geleistet."; }
      else if (idx === 1) { sellShip(s, ev.ship); msg = "Das Schiff wurde verkauft."; }
      else if (l.warned) { const sh = shipById(s, ev.ship); s.ships = s.ships.filter(x => x.id !== ev.ship); s.loans = s.loans.filter(x => x !== l); s.strikes = Math.min(4, s.strikes + 1); msg = "Die Bank hat die „" + (sh ? sh.name : "?") + "“ eingezogen."; }
      else { l.warned = true; l.called = false; l.rate += 1.5; l.pay = Math.round(annuity(l.out, l.rate, Math.max(1, l.left))); s.strikes = Math.min(4, s.strikes + 1); msg = "Die Bank erhöht den Zins um 1,5 Punkte und behält Sie im Auge."; }
      s.log.unshift({ m: s.m, head: ev.head, text: "Entscheidung: " + ["Sondertilgung", "Verkauf", "Aussitzen"][idx] + ". " + msg, kind: "own", img: "ev_krise" });
      return;
    }
    if (ev.id === "werft") {
      const sh = shipById(s, ev.ship), W = WERFT[ev.kind]; if (!sh || !W) return;
      const o = W.opts[idx] || W.opts[W.opts.length - 1], msg = o.f(s, sh) || "";
      s.log.unshift({ m: s.m, head: ev.head, text: "Entscheidung: " + o.t + ". " + msg + (inDock(s, sh) ? " Fertig voraussichtlich am " + dateAfter(s, sh.dockUntil - s.t) + "." : ""), kind: "own", img: ev.img });
      return;
    }
    if (ev.id === "major") {
      const sh = shipById(s, ev.ship); if (!sh) return;
      if (idx === 0) { const err = majorRepair(s, sh.id, ev.kind); if (err) { sh.majLate[ev.kind] = true; s.log.unshift({ m: s.m, head: ev.head, text: err + " Die Arbeiten werden aufgeschoben.", kind: "bad", img: ev.img }); } return; }
      if (idx === 1) { sh.majLate[ev.kind] = true; s.log.unshift({ m: s.m, head: MAJOR[ev.kind].name + " aufgeschoben", text: "Die „" + sh.name + "“ fährt vorerst so weiter. In der Flotte können Sie die Arbeiten jederzeit nachholen.", kind: "own", img: ev.img }); return; }
      sellShip(s, sh.id); return;
    }
    if (lateResolve(s, ev, idx)) return;
    if (ev.id === "kapitan") {
      const K = SPECIAL_CAPS[ev.key];
      if (idx === 0 && s.cash >= ev.fee) { expense(s, "Sonderausgaben", ev.fee); specialCaptain(s, ev.key); s.log.unshift({ m: s.m, head: K.name + " heuert an", text: K.title + ": " + K.fx + " Weisen Sie ihn in der Flotte einem Schiff zu.", kind: "own", img: K.img }); }
      return;
    }
    if (ev.id === "traum") {
      const t = TYPES.traum, sh = initShip(s, { id: uid(s), name: t.ship, type: "traum", age: 0, cond: 100, line: null, laid: false, insured: true, maint: 1, ready: s.m, paid: 0, eq: { boote: true, schotten: true, funk: true }, survey: s.t + 1460 });
      s.ships.push(sh); s.flags.traum = true; s.prestige += t.prestige; s.mk.brand = clamp(s.mk.brand + 20, 0, 100); up(s, "rep", 10);
      s.log.unshift({ m: s.m, head: "Das Traumschiff fährt jetzt unter Ihrer Flagge", text: "Niemand weiß, woher es kam. Es fährt nur Vergnügungsreisen – dort will jeder mit. Eröffnen Sie eine Vergnügungsreise und weisen Sie es in der Flotte zu.", kind: "own", img: "ship_traum" });
      return;
    }
    if (ev.id === "emil") {
      const sh = shipById(s, ev.ship);
      if (idx === 0 && sh) { sh.emil = true; s.flags.emil = "aboard"; s.flags.emilEver = true; { const old = capOf(s, sh); if (old) old.ship = null; specialCaptain(s, "emil").ship = sh.id; } up(s, "rep", 2); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); s.log.unshift({ m: s.m, head: "Kapitän Emil übernimmt die „" + sh.name + "“", text: "Ab sofort gilt sie als Glücksschiff: nur halb so oft Havarien, und in Seenot weiß der Alte immer noch einen Ausweg.", kind: "own", img: "ev_emil" }); }
      else { s.flags.emil = "declined"; s.log.unshift({ m: s.m, head: "Kapitän Emil zieht weiter", text: "„Man sieht sich immer zweimal im Hafen“, brummt er und schlendert pfeifend davon.", kind: "own", img: "ev_emil" }); }
      return;
    }
    if (ev.id === "berater") {
      if (idx === 0 && ev.tip) {
        const tp = ev.tip; let msg = "";
        if (tp.kind === "layup") { const list = s.ships.filter(x => x.line === tp.route); for (const x of list) { x.line = null; x.laid = true; } msg = list.length + " Schiff" + (list.length === 1 ? "" : "e") + " aufgelegt."; }
        else if (tp.kind === "sell") { sellShip(s, tp.ship); msg = "Das Schiff ist verkauft."; }
        else if (tp.kind === "mk") { s.mk.budget = 0; s.mk.ag = {}; msg = "Werbung und Agenturen sind gekündigt."; }
        else if (tp.kind === "prices") { for (const r of s.routes) alignPrices(s, r.id); msg = "Alle Preise liegen jetzt auf dem üblichen Niveau."; }
        s.log.unshift({ m: s.m, head: "Rat des Beraters befolgt", text: msg, kind: "own", img: "ev_berater" });
      }
      return;
    }
    if (ev.id === "sonder") {
      const t = TYPES[ev.type];
      if (idx === 2) { s.log.unshift({ m: s.m, head: "Angebot abgelehnt: die „" + t.ship + "“", text: "Der Makler zieht weiter. Ob sie je wieder angeboten wird?", kind: "own", img: "ship_" + ev.type }); return; }
      const q = idx === 0 ? quote(s, ev.price, "bar") : quote(s, ev.price, "used");
      if (!q.ok) { s.log.unshift({ m: s.m, head: "Kauf der „" + t.ship + "“ gescheitert", text: q.reason || "Nicht genug Geld.", kind: "bad" }); return; }
      s.cash -= q.now;
      const sh = initShip(s, { id: uid(s), name: t.ship, type: ev.type, age: ev.age, cond: 95, line: null, laid: false, insured: true, maint: 1, ready: s.m, paid: ev.price, eq: Object.assign({}, t.eq || {}), survey: s.t + 1460 });
      if (yearOf(s) >= 1912) sh.eq.boote = true;
      s.ships.push(sh);
      if (q.loan) addLoan(s, q, sh, "Bankkredit");
      s.flags["sp_" + ev.type] = 99;
      s.prestige += t.prestige || 0; up(s, "rep", 5); s.mk.brand = clamp(s.mk.brand + 12, 0, 100);
      s.log.unshift({ m: s.m, head: "Die „" + t.ship + "“ fährt jetzt unter Ihrer Flagge", text: "Die ganze Stadt spricht davon. Weisen Sie ihr in der Flotte eine Linie zu. " + t.trait, kind: "own", img: "ship_" + ev.type });
      return;
    }
    if (ev.id === "seenot") {
      const sh = shipById(s, ev.ship); if (!sh) return;
      const o = distressOdds(s, sh);
      if (idx === 0) { sink(s, sh, "aufgegeben und gesunken", {}); return; }
      if (idx === 1) {
        if (rnd(s) < o.pump) { msg = repairAfter(s, sh, 0); up(s, "rep", 2); s.stats.saved = (s.stats.saved || 0) + 1; s.log.unshift({ m: s.m, head: "Gerettet: die „" + sh.name + "“ erreicht den Nothafen", text: "Die Mannschaft hat das Schiff gehalten. " + msg, kind: "own", img: "ev_bergung" }); }
        else sink(s, sh, "gesunken", { saved: false });
        return;
      }
      if (rnd(s) < o.call) { msg = repairAfter(s, sh, o.salvage); s.stats.saved = (s.stats.saved || 0) + 1; s.log.unshift({ m: s.m, head: "Die „" + sh.name + "“ wurde in den Hafen geschleppt", text: (o.helper ? "Die „Carpathia“ eilte zu Hilfe und blieb an ihrer Seite, bis der Schlepper kam. " : "Ein Bergungsschlepper kam rechtzeitig. ") + msg, kind: "own", img: "ev_bergung" }); }
      else sink(s, sh, "gesunken", { saved: true });
      return;
    }
    const E = EVENTS[ev.id];
    msg = E.opts[idx].f(s, ev) || "";
    s.log.unshift({ m: s.m, head: ev.head, text: "Entscheidung: " + E.opts[idx].t + ". " + msg, kind: "own", img: ev.img });
  }

  /* ---------- Welt ---------- */
  function world(s) {
    s.konj += (1 - s.konj) * .04 + (rnd(s) - .5) * .03; s.konj = clamp(s.konj, .6, 1.3);
    s.shipIdx += (Math.pow(s.konj, 1.2) - s.shipIdx) * .05; s.shipIdx = clamp(s.shipIdx, .75, 1.2);
    s.coal += (1 - s.coal) * .07 + (rnd(s) - .5) * .02; s.coal = clamp(s.coal, .8, 1.5);
    s.base += (4.5 - s.base) * .03 + (rnd(s) - .5) * .1; s.base = clamp(s.base, 3, 8);
    s.mods = s.mods.filter(md => md.until >= s.m);
    if (s.flags.insUntil && s.flags.insUntil < s.m) { s.insMult = 1; s.flags.insUntil = 0; }
    if (s.strikes > 0 && rnd(s) < .04) s.strikes -= 1;
    const open = TYPE_ORDER.filter(k => typeOpen(s, k) && k !== "trajekt");
    if (rnd(s) < .4 && s.market.length < 6) addListing(s, pick(s, open.filter(k => TYPES[k].price < 2500000)));
    if (rnd(s) < .2 && s.market.length > 2) s.market.shift();
    for (const L of s.market) L.age += 1;
    for (const r of s.routes) { r.compMult = 1 + ((r.compMult || 1) - 1) * .97; r.compSpeedAdd = (r.compSpeedAdd || 0) * .98; }
    s.rep += (50 - s.rep) * .01;
    if (s.ships.some(x => x.type === "nomadic")) s.mk.brand = clamp(s.mk.brand + .5, 0, 100);
    const mk = s.mk; mk.brand = clamp(mk.brand + MK_BUDGET[mk.budget].gain + (Object.values(mk.ag).filter(Boolean).length * .4) - .04 * (mk.brand - 10), 0, 100);
    s.wage *= 1.0012; s.pidx *= 1.0008;
    s.sizeM = clamp(Math.sqrt(fleetValue(s) / 1e6), 1, 8);
    rivalMonthly(s); expMonthly(s);
  }

  function duePending(s) { return s.pending.length > 0 && (s.pending[0].day || 0) <= s.day; }
  function closeMonth(s) {
    const rep = monthEnd(s);
    const delivered = s.ships.filter(sh => sh.ready === s.m + 1);
    for (const sh of delivered) { const r = routeOf(s, sh); s.log.unshift({ m: s.m + 1, head: "„" + sh.name + "“ abgeliefert", text: "Das neue Schiff liegt bereit" + (r ? " und fährt ab jetzt auf " + rInfo(s, r).name + "." : ". Weisen Sie ihm in der Flotte eine Linie zu."), kind: "own", img: "ship_" + sh.type }); }
    for (const sh of s.ships) if (sh.charter === s.m) s.log.unshift({ m: s.m, head: "„" + sh.name + "“ zurück aus der Charter", text: "Das Schiff steht wieder für Ihre Linien bereit.", kind: "own" });
    s.last = rep;
    const costSum = Object.values(rep.cost).reduce((a, b) => a + b, 0);
    s.hist.push({ m: s.m, cash: Math.round(s.cash), eq: Math.round(equity(s)), profit: Math.round(rep.profit), rev: Math.round(rep.rev), cost: Math.round(costSum), pax: Math.round(rep.pax || 0), ships: s.ships.length });
    s.years = s.years || {}; const yy = cal(s.m).y, Y = s.years[yy] || (s.years[yy] = { rev: 0, cost: 0, profit: 0, pax: 0, eq: 0, ships: 0 });
    Y.rev += Math.round(rep.rev); Y.cost += Math.round(costSum); Y.profit += Math.round(rep.profit); Y.pax += Math.round(rep.pax || 0); Y.eq = Math.round(equity(s)); Y.ships = s.ships.length; Y.costs = Y.costs || {}; for (const k in rep.cost) Y.costs[k] = Math.round((Y.costs[k] || 0) + rep.cost[k]);
    if (s.hist.length > 360) s.hist.shift();
    for (const x of rep.events) s.log.unshift({ m: s.m, head: "Vertragsstrafe", text: x, kind: "bad" });
    if (s.negMonths >= 4 || s.cash < -Math.max(80000, fleetValue(s) * .15)) {
      s.over = "konkurs"; s.log.unshift({ m: s.m, head: s.name + " ist zahlungsunfähig", text: "Das Konkursgericht übernimmt die Geschäfte.", kind: "bad" }); return rep;
    }
    advisorCheck(s, rep);
    s.m += 1; s.day = 1; s.cur = newCur(s);
    if (s.musDue) { s.musDue = false; museumMonthly(s); }
    world(s);
    for (const sh of s.ships) applyPlan(s, sh);
    majorCheck(s);
    seasonCheck(s);
    emilMonthly(s);
    capOffer(s);
    lateMonthly(s);
    if (!s.flags.traum && !s.flags.traumOffered && SPECIAL_ORDER.every(k => s.ships.some(x => x.type === k))) { s.flags.traumOffered = true; s.pending.push({ id: "traum", day: 2, img: "ev_traumkai", head: "Ein Wunder am Kai", text: "Heute Morgen lag es plötzlich im Hafen: ein strahlend weißes Schiff ohne Masten und Segel, mit Palmen an Deck und Liegestühlen in der Sonne. Der Kapitän überreicht Ihnen die Papiere – ausgestellt auf Ihre Reederei. Ganz Hamburg reibt sich die Augen." }); }
    for (const sh of delivered) if (sh.isNew && s.ships.includes(sh)) { sh.isNew = false; s.pending.push({ id: "taufe", day: 1, ship: sh.id, head: "Schiffstaufe der „" + sh.name + "“", text: "Ihr neuer " + TYPES[sh.type].name + " liegt festlich beflaggt an der Werft. Wie soll getauft werden?", img: "ev_taufe" }); }
    rollEvents(s);
    for (const p of s.pending) if (p.day == null) p.day = 3 + Math.floor(rnd(s) * 22);
    s.pending.sort((x, y) => x.day - y.day);
    s.log = s.log.slice(0, 60);
    return rep;
  }
  // Ein Tag vergeht. null = angehalten (fälliges Ereignis oder Spielende)
  function advanceDay(s) {
    if (s.over || duePending(s)) return null;
    dayTick(s);
    s.day += 1; s.t = (s.t || 0) + 1;
    inspectorDay(s);
    captainsDay(s);
    achCheck(s);
    for (const sh of s.ships) {
      if (sh.dockUntil === s.t) { const r = routeOf(s, sh); s.log.unshift({ m: s.m, head: "„" + sh.name + "“ ist zurück im Dienst", text: "Die Werft hat die Arbeiten abgeschlossen. " + (r && !sh.laid ? "Das Schiff fährt wieder auf " + rInfo(s, r).name + "." : "Weisen Sie ihm in der Flotte eine Linie zu."), kind: "own", img: "ship_" + sh.type }); }
      if (sh.survey != null && sh.ready <= s.m && !inDock(s, sh) && !sh.museum) {
        if (sh.survey - s.t === 30) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ läuft in 30 Tagen ab", text: "Erneuern Sie die Frist in der Flotte, sonst darf das Schiff nicht mehr auslaufen.", kind: "bad", img: "wf_besichtigung" });
        if (sh.survey === s.t) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ abgelaufen", text: "Das Schiff liegt fest und ist nicht versichert, bis die Frist erneuert ist.", kind: "bad", img: "wf_besichtigung" });
      }
    }
    if (s.day > dim(s.m)) return { month: closeMonth(s) };
    return { day: s.day };
  }
  // Läuft bis Monatsende oder bis ein Ereignis fällig ist (für Tests und Bots)
  function nextMonth(s) { for (let i = 0; i < 40; i++) { const r = advanceDay(s); if (!r) return null; if (r.month) return r.month; } return null; }

  function riskOf(s, sh) {
    const info = infoOf(s, sh); if (!info || !active(s, sh)) return null;
    const winter = WINTER.includes(cal(s.m).mo), t = TYPES[sh.type];
    const p = info.risk[winter ? 1 : 0] * (1 + 3 * Math.pow(1 - sh.cond / 100, 2)) * (t.safe || 1);
    const sea = !info.areas.every(a => a === "river" || a === "canal");
    const sp = sea ? (info.ocean && winter ? .13 : .08) * (sh.eq.schotten ? .6 : 1) * (t.safe || 1) : 0;
    const v = p * sp * 12; // Seenot-Wahrscheinlichkeit pro Jahr
    return { yearly: v, label: v < .008 ? "gering" : v < .025 ? "erhöht" : "hoch" };
  }
  function suggest(s, n) {
    const y = yearOf(s), ids = Object.keys(PORTS), out = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], b = ids[j];
      if (s.routes.some(r => !r.cruise && ((r.a === a && r.b === b) || (r.a === b && r.b === a)))) continue;
      const inf = routeInfo(s, a, b); if (!inf || inf.D0 < 300) continue;
      const types = TYPE_ORDER.filter(k => typeOpen(s, k) && !canServe(s, k, a, b)); if (!types.length) continue;
      out.push({ a, b, D: inf.D0, name: inf.name, dist: inf.dist });
    }
    return out.sort((x, z) => z.D - x.D).slice(0, n || 8);
  }
  function score(s) { return Math.round(equity(s) / 10000 + s.prestige * 3 + s.stats.pax / 20000 + s.rep / 2 + s.mk.brand / 4 - s.stats.sunk * 25 - s.stats.lost * 25); }

  /* ---------- Schiffsgenerationen ---------- */
  const GEN_TYPES = {
    f12: { name: "Motorfähre", cls: "Typ Delphin", price: 210000, seats: 220, sb: [0, 0, 220], speed: 11, comfort: 2, crew: 400, coal: .45, build: 3, from: 1912, range: 160, shallow: true, motor: true, grp: 0 },
    f24: { name: "Seebäderschiff", cls: "Typ Bäderkönigin", price: 950000, seats: 1300, sb: [300, 1000, 0], speed: 16.5, comfort: 4, crew: 2600, coal: 3.1, build: 8, from: 1924, range: 450, grp: 0 },
    f35: { name: "Stromlinien-Motorfähre", cls: "Typ Pfeil", price: 950000, seats: 700, sb: [120, 580, 0], speed: 17, comfort: 4, crew: 1600, coal: 2.0, build: 6, from: 1935, range: 400, motor: true, grp: 0 },
    f50: { name: "Autofähre", cls: "Typ Rampe", price: 1100000, seats: 900, sb: [100, 300, 500], speed: 16, comfort: 4, crew: 1600, coal: 2.4, build: 8, from: 1950, range: 300, motor: true, cars: 1, grp: 0 },
    f60: { name: "Tragflügelboot", cls: "Typ Libelle", price: 620000, seats: 140, sb: [0, 140, 0], speed: 34, comfort: 4, crew: 300, coal: 2.0, build: 5, from: 1960, range: 220, motor: true, hydro: true, grp: 0 },
    n12: { name: "Turbinen-Nachtschiff", cls: "Typ Kronprinz", price: 2600000, seats: 1000, sb: [250, 400, 350], speed: 21, comfort: 5, crew: 6000, coal: 9.0, build: 12, from: 1912, range: 900, turbineDrive: true, grp: 1 },
    n24: { name: "Motorschiff", cls: "Typ Hanseat", price: 2200000, seats: 600, sb: [150, 250, 200], speed: 16, comfort: 4, crew: 3200, coal: 3.2, build: 9, from: 1924, range: 2500, cargo: .4, motor: true, grp: 1 },
    n35: { name: "Schnelles Motorschiff", cls: "Typ Prinz", price: 3400000, seats: 900, sb: [250, 350, 300], speed: 23, comfort: 5, crew: 5000, coal: 7.0, build: 11, from: 1935, range: 1000, motor: true, grp: 1 },
    n50: { name: "Fährschiff mit Autodeck", cls: "Typ Skandia", price: 3000000, seats: 1300, sb: [250, 550, 500], speed: 19, comfort: 5, crew: 4500, coal: 5.0, build: 12, from: 1950, range: 1200, motor: true, cars: 1.5, grp: 1 },
    n60: { name: "Moderne Ostseefähre", cls: "Typ Nordlicht", price: 4200000, seats: 1600, sb: [300, 700, 600], speed: 21, comfort: 5, crew: 4600, coal: 5.5, build: 13, from: 1960, range: 1500, motor: true, cars: 2, grp: 1 },
    o12: { name: "Turbinen-Ozeanriese", cls: "Typ Kolossus", price: 14000000, seats: 3500, sb: [700, 800, 2000], speed: 23, comfort: 5, crew: 40000, coal: 30, build: 24, from: 1912, range: 7000, ocean: true, safe: .5, turbineDrive: true, grp: 2 },
    o24: { name: "Motor-Ozeanliner", cls: "Typ Atlantis", price: 9000000, seats: 1600, sb: [350, 450, 800], speed: 18, comfort: 5, crew: 15000, coal: 9, build: 18, from: 1924, range: 12000, ocean: true, motor: true, grp: 2 },
    o35: { name: "Stromlinien-Ozeanliner", cls: "Typ Stromer", price: 16000000, seats: 2000, sb: [600, 600, 800], speed: 29, comfort: 5, crew: 32000, coal: 26, build: 26, from: 1935, range: 7000, ocean: true, safe: .5, turbineDrive: true, prestige: 10, grp: 2 },
    o50: { name: "Moderner Ozeanliner", cls: "Typ Nordwind", price: 15000000, seats: 1700, sb: [400, 600, 700], speed: 25, comfort: 5, crew: 22000, coal: 16, build: 22, from: 1950, range: 9000, ocean: true, safe: .4, turbineDrive: true, grp: 2 },
    o60: { name: "Kreuzfahrtliner", cls: "Typ Riviera", price: 12000000, seats: 1400, sb: [700, 700, 0], speed: 24, comfort: 5, crew: 20000, coal: 14, build: 22, from: 1960, range: 10000, ocean: true, safe: .4, turbineDrive: true, cruiseB: 1.25, grp: 2 },
  };
  const GEN_NOTE = {
    f12: "Der Dieselmotor erobert den Hafen: kleine Mannschaft, kaum Brennstoff.",
    f24: "Ölfeuerung statt Kohle: viel weniger Heizer, große Promenadendecks.",
    f35: "Stromlinie und Dieselmotor – schnell, sparsam und elegant.",
    f50: "Autos und Busse fahren über die Heckklappe an Bord: Einnahmen aus jedem Wagen.",
    f60: "Auf Tragflächen über das Wasser – doppelt so schnell wie jede Fähre, im Winter aber heikel.",
    n12: "Dampfturbinen, zwei hohe Schornsteine und Kabinen für die ganze Nacht.",
    n24: "Dieselantrieb: sparsam, kleine Mannschaft, große Reichweite.",
    n35: "Doppelschrauben-Motorschiff – das Schnellste, was auf Nord- und Ostsee fährt.",
    n50: "Fährschiff mit Autodeck und Radar – Reisende nehmen ihr Auto mit.",
    n60: "Groß, komfortabel, mit viel Platz für Autos.",
    o12: "Ein Ozeanriese für Tausende Fahrgäste – drei Schornsteine, Turbinen, gewaltiges Prestige.",
    o24: "Der Motorliner: elegant und viel sparsamer als jeder Dampfer.",
    o35: "Turbo-elektrischer Stromlinien-Liner – gebaut, um das Blaue Band zu holen.",
    o50: "Modern, sicher und schnell, mit Radar und Rettungsbooten für alle.",
    o60: "Weiß, mit Pool und Sonnendecks – für Linie und Kreuzfahrt gleichermaßen.",
  };
  Object.assign(TYPES, GEN_TYPES);
  Object.assign(TYPE_NOTE, GEN_NOTE);
  for (const k of ["watt", "seebad", "kaiserbad"]) TYPES[k].paddle = true;
  for (const k of ["turbine", "lusitania", "titanic"]) if (TYPES[k]) TYPES[k].turbineDrive = true;
  for (const k of ["kurier", "sued", "hansa", "komet", "reichspost", "meteor", "paris", "augusta"]) if (TYPES[k]) TYPES[k].figure = true;
  { const ins = (after, keys) => { const i = TYPE_ORDER.indexOf(after); TYPE_ORDER.splice(i + 1, 0, ...keys); };
    ins("trajekt", ["f12", "f24", "f35", "f50", "f60"]); ins("turbine", ["n12", "n24", "n35", "n50", "n60"]); ins("kreuz", ["o12", "o24", "o35", "o50", "o60"]); }
  const typeGroup = k => { const t = TYPES[k]; if (t.grp != null) return t.grp; if (t.design) return 0; return t.ocean ? 2 : ["hafen", "moewe", "watt", "seebad", "kaiserbad", "trajekt"].includes(k) ? 0 : 1; };

  /* ---------- Ausrüstung ab Werft ---------- */
  EQUIP.radar = { name: "Radar", pct: .02, from: 1946, note: "Kollisionen im Nebel werden selten: weniger Havarien, Nebel und Treibeis schrecken kaum noch." };
  EQUIP.schotten.pct = .07; EQUIP.schotten.dock = 21; EQUIP.schotten.note = "Seenot seltener, Rettung des Schiffs wahrscheinlicher. Nachrüsten heißt drei Wochen Werft.";
  const FACTORY_PCT = { boote: .015, schotten: .04, funk: .01, radar: .02 };
  function factoryEqCost(s, type, k) { return Math.round(P(s, TYPES[type]) * FACTORY_PCT[k] * .6 / 100) * 100; }
  function factoryEqOptions(s, type) { return Object.keys(FACTORY_PCT).filter(k => yearOf(s) >= EQUIP[k].from).map(k => ({ k, name: EQUIP[k].name, cost: factoryEqCost(s, type, k), later: equipCost(s, { type }, k) })); }

  /* ---------- Fähren-Konfigurator ---------- */
  const DES = {
    hull: { schlank: { name: "Schlank", spd: 1.08, seats: .85, price: 1.05 }, normal: { name: "Normal", spd: 1, seats: 1, price: 1 }, bauchig: { name: "Bauchig", spd: .93, seats: 1.15, price: 1.03 } },
    drive: { dampf: { name: "Dampfmaschine", from: 1880 }, rad: { name: "Raddampfer", from: 1880 }, oel: { name: "Ölfeuerung", from: 1912 }, motor: { name: "Motor (Diesel)", from: 1912 } },
    interior: { einfach: { name: "Einfach" }, komfort: { name: "Komfortabel" } },
    extras: { sonne: { name: "Sonnendeck" }, laderaum: { name: "Kleiner Laderaum" }, eis: { name: "Eisverstärkung" } },
  };
  function designBases(s) { return TYPE_ORDER.filter(k => typeGroup(k) === 0 && !TYPES[k].trajekt && !TYPES[k].hydro && typeOpen(s, k)); }
  function designType(d) {
    const b = TYPES[d.base], H = DES.hull[d.hull] || DES.hull.normal, y = d.year || 1880, ex = d.extras || {};
    let spd = b.speed * H.spd, seats = b.seats * H.seats, comfort = b.comfort, crew = b.crew, coal = b.coal, price = b.price * H.price, shallow = !!b.shallow, cargo = b.cargo || 0;
    if (d.drive === "rad") { spd *= .95; coal *= 1.1; shallow = true; }
    if (d.drive === "oel") { crew *= .75; coal *= .9; price *= 1.05; }
    if (d.drive === "motor") { crew *= .6; coal *= .55; price *= 1.12; if (y < 1930) comfort -= .5; }
    if (d.interior === "komfort") { seats *= .8; comfort = Math.min(5, comfort + 1); price *= 1.08; } else seats *= 1.1;
    if (ex.sonne) { comfort = Math.min(5, comfort + .3); price *= 1.03; }
    if (ex.laderaum) { cargo += .3; seats *= .92; price *= 1.03; }
    if (ex.eis) price *= 1.06;
    if ((d.funnels || 1) > 1) price *= 1.02;
    seats = Math.max(20, Math.round(seats / 10) * 10);
    const f = seats / b.seats, sb = b.sb.map(x => Math.round(x * f / 10) * 10); sb[sb.indexOf(Math.max(...sb))] += seats - sb.reduce((a, c) => a + c, 0);
    return { name: b.name, cls: "Eigener Entwurf „" + d.name + "“", price: Math.round(price / 1000) * 1000, seats, sb, speed: Math.round(spd * 10) / 10, comfort: Math.round(comfort * 10) / 10, crew: Math.round(crew), coal: Math.round(coal * 100) / 100,
      build: b.build + 1, from: b.from, range: b.range, shallow, cargo: cargo || undefined, motor: d.drive === "motor" || b.motor, paddle: d.drive === "rad", ice: !!ex.eis, design: d.id, base: d.base, prestige: (d.funnels || 1) > 1 ? 2 : 0 };
  }
  function registerDesigns(s) { for (const id in (s.designs || {})) TYPES["d_" + id] = designType(s.designs[id]); }
  function saveDesign(s, d) {
    if (!TYPES[d.base] || !designBases(s).includes(d.base)) return { err: "Diesen Grundtyp gibt es (noch) nicht." };
    if ((d.drive === "oel" || d.drive === "motor") && yearOf(s) < 1912) return { err: "Diesen Antrieb gibt es erst ab 1912." };
    s.designs = s.designs || {};
    const id = d.id && s.designs[d.id] ? d.id : uid(s);
    s.designs[id] = { id, name: cleanName(d.name) || "Entwurf " + (Object.keys(s.designs).length + 1), base: d.base, hull: d.hull, drive: d.drive, interior: d.interior, extras: d.extras || {}, funnels: d.funnels || 1, year: yearOf(s), built: (s.designs[id] && s.designs[id].built) || 0 };
    TYPES["d_" + id] = designType(s.designs[id]);
    return { id, type: "d_" + id };
  }
  function seriesFactor(s, type) { const t = TYPES[type]; if (!t || !t.design || !s.designs || !s.designs[t.design]) return 1; return 1 - Math.min(.2, .08 * s.designs[t.design].built); }

  /* ---------- Exponate und Abwracken ---------- */
  const EXHIBITS = {
    glocke: { name: "Schiffsglocke", cost: 300, draw: .12 }, steuerrad: { name: "Steuerrad", cost: 300, draw: .1 }, namensbrett: { name: "Namensbrett", cost: 200, draw: .06 },
    kompass: { name: "Kompasshaus", cost: 400, draw: .08 }, laterne: { name: "Positionslaterne", cost: 150, draw: .05 }, bullauge: { name: "Bullauge", cost: 100, draw: .03 },
    anker: { name: "Anker", cost: 1200, draw: .12, big: true }, telegraf: { name: "Maschinentelegraf", cost: 400, draw: .1 }, pfeife: { name: "Dampfpfeife", cost: 250, draw: .06 },
    dampfmaschine: { name: "Dampfmaschine", cost: 9000, draw: .7, big: true }, kessel: { name: "Schiffskessel", cost: 6000, draw: .45, big: true }, turbine: { name: "Dampfturbine", cost: 9000, draw: .75, big: true },
    diesel: { name: "Schiffsdiesel", cost: 6000, draw: .5, big: true }, schraube: { name: "Schiffsschraube", cost: 2500, draw: .3, big: true }, schaufelrad: { name: "Schaufelrad", cost: 4000, draw: .5, big: true },
    galion: { name: "Galionsfigur", cost: 1500, draw: .5 }, salon: { name: "Salonausstattung", cost: 3500, draw: .45, big: true }, funk: { name: "Funkanlage", cost: 500, draw: .15 }, radar: { name: "Radaranlage", cost: 800, draw: .2 },
  };
  function partsFor(s, sh) {
    const t = TYPES[sh.type], L = ["glocke", "steuerrad", "namensbrett", "kompass", "laterne", "bullauge", "anker", "telegraf"];
    if (!t.motor) L.push("pfeife", "kessel");
    L.push(t.turbineDrive ? "turbine" : t.motor ? "diesel" : "dampfmaschine", t.paddle ? "schaufelrad" : "schraube");
    if (t.figure) L.push("galion"); if (t.comfort >= 4) L.push("salon"); if (sh.eq.funk) L.push("funk"); if (sh.eq.radar) L.push("radar");
    return L;
  }
  function partCost(s, sh, k) { const t = TYPES[sh.type], E = EXHIBITS[k]; return Math.round(E.cost * (E.big ? clamp(t.seats / 500, .3, 4) : 1) * s.pidx / 10) * 10; }
  function scrapValue(s, sh) { return Math.round(P(s, TYPES[sh.type]) * .05 / 100) * 100; }
  function shipYears(s, sh) { const to = yearOf(s), from = to - Math.floor((sh.age || 0) / 12); return from + "–" + to; }
  function shipFame(s, sh) { const t = TYPES[sh.type]; return 1 + (t.special ? 2.5 : 0) + Math.max(0, sh.age / 12 - 30) / 40 + (t.prestige || 0) / 40; }
  function removeShip(s, sh, cash) {
    for (const l of s.loans.filter(l => l.ship === sh.id)) cash -= l.out;
    s.loans = s.loans.filter(l => l.ship !== sh.id); s.ships = s.ships.filter(x => x !== sh);
    { const c = caps(s).find(x => x.ship === sh.id); if (c) { if (c.bound) s.caps = caps(s).filter(x => x !== c); else c.ship = null; } }
    if (sh.emil) s.flags.emil = "retired";
    return cash;
  }
  function scrapShip(s, id, parts) {
    const sh = s.ships.find(x => x.id === id); if (!sh || sh.ready > s.m) return "Dieses Schiff kann nicht abgewrackt werden.";
    parts = (parts || []).filter(k => partsFor(s, sh).includes(k));
    const pc = parts.reduce((a, k) => a + partCost(s, sh, k), 0), sv = scrapValue(s, sh);
    if (s.cash + sv < pc) return "Nicht genug Geld für den Ausbau.";
    const cash = removeShip(s, sh, sv);
    s.cash += cash; if (pc) expense(s, "Museumsbau", pc);
    s.exhibits = s.exhibits || [];
    for (const k of parts) s.exhibits.push({ id: uid(s), k, ship: sh.name, years: shipYears(s, sh), fame: shipFame(s, sh) });
    s.log.unshift({ m: s.m, head: "„" + sh.name + "“ abgewrackt", text: "Der Schrotthändler zahlt " + fmt(sv) + " Mark." + (parts.length ? " Für das Museum gesichert: " + parts.map(k => EXHIBITS[k].name).join(", ") + " (Ausbau " + fmt(pc) + " Mark)." : "") + (cash !== sv ? " Nach Tilgung des Kredits bleiben " + fmt(cash) + " Mark." : ""), kind: "own", img: "ev_abwracken" });
    return null;
  }
  function donateShip(s, id) {
    const sh = s.ships.find(x => x.id === id); if (!sh || sh.ready > s.m) return "Dieses Schiff kann nicht gespendet werden.";
    const t = TYPES[sh.type], cash = removeShip(s, sh, 0);
    s.cash += cash; up(s, "rep", 3); s.mk.brand = clamp(s.mk.brand + 4 + (t.special ? 6 : 0), 0, 100); s.prestige += 3 + (t.prestige || 0) / 2; s.flags.donated = (s.flags.donated || 0) + 1;
    s.log.unshift({ m: s.m, head: "„" + sh.name + "“ geht ins Museum", text: "Ein Schifffahrtsmuseum übernimmt das Schiff als Geschenk. Die Zeitungen loben Ihre Reederei, Ruf und Bekanntheit steigen." + (cash < 0 ? " Den Restkredit von " + fmt(-cash) + " Mark lösen Sie ab." : ""), kind: "good", img: "ev_museumsschiff" });
    return null;
  }

  /* ---------- Eigenes Museum ---------- */
  const MUS_PRICE = [{ name: "Niedrig", p: .25, f: 1.35 }, { name: "Normal", p: .5, f: 1 }, { name: "Hoch", p: .9, f: .7 }];
  function museumUnlocked(s) { return yearOf(s) - START_YEAR >= 30 || s.ships.some(x => x.age >= 360); }
  function museumCost(s) { return Math.round(80000 * s.pidx / 1000) * 1000; }
  function hallSlots(s) { return s.museum ? 12 * s.museum.level : 0; }
  function buildMuseum(s) {
    if (s.museum) return "Sie haben bereits ein Museum.";
    if (!museumUnlocked(s)) return "Ein Museum lohnt sich erst, wenn Ihre Reederei 30 Jahre Geschichte hat.";
    const c = museumCost(s); if (s.cash < c) return "Nicht genug Geld.";
    expense(s, "Museumsbau", c);
    s.museum = { built: s.m, level: 1, price: 1, trips: true, fest: -99, vis: 0, rev: 0 };
    s.log.unshift({ m: s.m, head: "Das Reederei-Museum öffnet", text: "Am " + homeName(s) + "er Hafen steht jetzt Ihr eigenes Museum. Stellen Sie alte Schiffe hinein, sammeln Sie Exponate – und verlangen Sie Eintritt.", kind: "good", img: "mus_hafen" });
    return null;
  }
  function expandHall(s) { if (!s.museum) return; const c = Math.round(30000 * s.museum.level * s.pidx / 1000) * 1000; if (s.cash < c) return "Nicht genug Geld."; expense(s, "Museumsbau", c); s.museum.level++; return null; }
  function hallCost(s) { return s.museum ? Math.round(30000 * s.museum.level * s.pidx / 1000) * 1000 : 0; }
  function toMuseum(s, id, mode) {
    const sh = s.ships.find(x => x.id === id); if (!sh || !s.museum) return "Sie haben noch kein eigenes Museum.";
    if (sh.ready > s.m) return "Schiffe im Bau können nicht ins Museum.";
    sh.line = null; sh.laid = true; sh.plan = null; sh.museum = mode === "aktiv" ? "aktiv" : "still";
    { const c = caps(s).find(x => x.ship === sh.id); if (c && !c.bound) c.ship = null; }
    s.log.unshift({ m: s.m, head: "„" + sh.name + "“ kommt ins Museum", text: sh.museum === "aktiv" ? "Das Schiff bleibt betriebsfähig – für Nostalgiefahrten und Feste. Eine Stammbesatzung hält es in Schuss." : "Das Schiff wird als Ausstellungsstück stillgelegt. Das kostet kaum noch etwas.", kind: "own", img: "mus_hafen" });
    return null;
  }
  function restoreCost(s, sh) { return Math.round(P(s, TYPES[sh.type]) * .3 / 1000) * 1000; }
  function restoreDays(sh) { return clamp(Math.round(180 + TYPES[sh.type].seats / 8), 180, 365); }
  function museumMode(s, id, mode) {
    const sh = s.ships.find(x => x.id === id); if (!sh || !sh.museum) return;
    if (mode === "still") { sh.museum = "still"; sh.restoreUntil = null; return null; }
    if (sh.museum === "aktiv") return null;
    const c = restoreCost(s, sh); if (s.cash < c) return "Nicht genug Geld für die Restaurierung.";
    expense(s, "Museumsbau", c); sh.museum = "aktiv"; sh.restoreUntil = s.t + restoreDays(sh); sh.cond = 100;
    s.log.unshift({ m: s.m, head: "Restaurierung der „" + sh.name + "“", text: "Kessel, Maschine, Planken und Farbe: Die Werft braucht " + restoreDays(sh) + " Tage und " + fmt(c) + " Mark, bis das Schiff wieder fahren darf.", kind: "own", img: "mus_restaurierung" });
    return null;
  }
  function museumShipDay(s, sh, fd, add) {
    const t = TYPES[sh.type], aktiv = sh.museum === "aktiv" && !(sh.restoreUntil > s.t);
    const c = (crewCost(s, t) * s.wage * (aktiv ? .3 : .04) + maintCost(s, sh) * (aktiv ? .4 : .1)) * fd;
    add("Museum", c);
    if (!aktiv) sh.cond = Math.max(40, sh.cond - .02 * fd);
  }
  function museumFest(s) { const M = s.museum; if (!M) return; if (s.m - M.fest < 12) return "Das letzte Museumsfest ist noch kein Jahr her."; const c = Math.round(4000 * s.pidx / 100) * 100; if (s.cash < c) return "Nicht genug Geld."; expense(s, "Museumsbau", c); M.fest = s.m; s.mk.brand = clamp(s.mk.brand + 4, 0, 100); s.log.unshift({ m: s.m, head: "Großes Museumsfest", text: "Blaskapelle, Wimpel und Gedränge an den Stegen – diesen Monat kommen mehr als doppelt so viele Besucher.", kind: "good", img: "mus_fest" }); return null; }
  function museumDraw(s) {
    const ships = s.ships.filter(x => x.museum), slots = hallSlots(s);
    let d = .5;
    for (const sh of ships) d += (.8 + (sh.age / 12) / 50 + (TYPES[sh.type].special ? 2.5 : 0) + (TYPES[sh.type].prestige || 0) / 20) * (sh.museum === "aktiv" ? 1.2 : 1);
    const ex = (s.exhibits || []).slice().sort((a, b) => EXHIBITS[b.k].draw * b.fame - EXHIBITS[a.k].draw * a.fame).slice(0, slots);
    for (const e of ex) d += EXHIBITS[e.k].draw * e.fame;
    return d;
  }
  function museumMonthly(s) {
    const M = s.museum; if (!M) return;
    const mo = cal(s.m).mo, season = [.6, .6, .8, 1, 1.2, 1.4, 1.6, 1.6, 1.2, .9, .7, .7][mo], pr = MUS_PRICE[M.price];
    const vis = Math.round(Math.sqrt(PORTS[s.home || "ham"].pop) * 60 * museumDraw(s) * (.5 + s.mk.brand / 100) * season * pr.f * (M.fest === s.m ? 2.5 : 1));
    const rev = Math.round(vis * pr.p * s.pidx);
    let trips = 0;
    if (M.trips && mo >= 4 && mo <= 8) for (const sh of s.ships.filter(x => x.museum === "aktiv" && !(x.restoreUntil > s.t))) {
      const t = TYPES[sh.type], seats = Math.min(t.seats, 600);
      trips += Math.round(seats * 7 * (.6 + s.mk.brand / 150) * (.8 + t.comfort / 10) * s.pidx - seats * 2.5 * s.pidx);
      if (rnd(s) < .01) { const c = Math.round(P(s, t) * .01); expense(s, "Museumsbau", c); s.log.unshift({ m: s.m, head: "Panne bei der Nostalgiefahrt", text: "Die „" + sh.name + "“ musste mit Kesselschaden zurückgeschleppt werden. Reparatur " + fmt(c) + " Mark, die Fahrgäste bekamen ihr Geld zurück.", kind: "bad", img: "mus_nostalgie" }); }
    }
    const upkeep = Math.round(300 * M.level * s.pidx);
    M.vis = vis; M.rev = rev + trips;
    if (rev) income(s, "Museum", rev); if (trips > 0) income(s, "Museum", trips); else if (trips < 0) expense(s, "Museum", -trips);
    expense(s, "Museum", upkeep);
  }

  /* ---------- Alte Schiffe: Meldungen und Angebote ---------- */
  function lateMonthly(s) {
    const y = yearOf(s);
    s.musDue = true;
    if (y >= 1925 && PORTS.osl.name !== "Oslo") PORTS.osl.name = "Oslo";
    if (y >= 1956 && PORTS.fue && PORTS.fue.name.startsWith("Puerto de Cabras")) PORTS.fue.name = "Puerto del Rosario (Fuerteventura)";
    if (s.pending.length) return;
    for (const sh of s.ships) {
      if (sh.museum || sh.ready > s.m) continue;
      if (sh.age >= 420 && (!sh.oldNote || s.m - sh.oldNote >= 60)) { sh.oldNote = s.m; s.pending.push({ id: "altschiff", ship: sh.id, day: 2 + Math.floor(rnd(s) * 10), img: "ev_abwracken", head: "Die „" + sh.name + "“ wird unwirtschaftlich", text: "Mit " + Math.floor(sh.age / 12) + " Jahren frisst das Schiff Wartung, Kohle und Ersatzteile. Moderne Schiffe sind schneller und bequemer – die Fahrgäste merken das. Es ist Zeit, über die Zukunft der „" + sh.name + "“ zu entscheiden." }); return; }
    }
    const old = s.ships.filter(x => !x.museum && x.ready <= s.m && x.age >= 300);
    if (old.length && rnd(s) < .03) {
      const sh = pick(s, old), t = TYPES[sh.type], hotel = t.comfort >= 4 && sh.age < 480 && rnd(s) < .5;
      const museumOk = sh.age >= 360 && rnd(s) < (y < 1950 ? .3 : 1);
      if (!hotel && !museumOk) return;
      const price = Math.round(shipValue(s, sh) * (hotel ? 1.8 : 1.5) * (t.special ? 2 : 1) / 100) * 100;
      s.pending.push({ id: "kaufangebot", ship: sh.id, buyer: hotel ? "hotel" : "museum", price, day: 3 + Math.floor(rnd(s) * 15), img: hotel ? "ev_hotelschiff" : "ev_museumsschiff",
        head: hotel ? "Ein Hotelinvestor will die „" + sh.name + "“" : "Ein Museum interessiert sich für die „" + sh.name + "“",
        text: hotel ? "Ein Investor möchte das Schiff als schwimmendes Hotel an einen Kai legen – mit Salons, Ballsaal und Lichterketten. Er bietet " + fmt(price) + " Mark, weit über dem Restwert." : "Ein Schifffahrtsmuseum möchte die „" + sh.name + "“ erhalten und der Öffentlichkeit zeigen. Es bietet " + fmt(price) + " Mark – und ewigen Ruhm für Ihre Reederei." });
    }
  }
  function altOpts(s, ev) {
    const o = [{ k: "weiter", t: "Weiterfahren", h: "in fünf Jahren wird wieder gefragt" }];
    if (s.museum) o.push({ k: "eigen", t: "Ins eigene Museum", h: "stillgelegt als Ausstellungsstück" });
    o.push({ k: "spende", t: "Einem Museum spenden", h: "Ruf, Bekanntheit und Prestige steigen" }, { k: "verkauf", t: "Verkaufen", h: "zum Restwert" }, { k: "abwracken", t: "Abwracken …", h: "Teile fürs Museum aussuchen" });
    return o;
  }
  function lateOptions(s, ev) {
    if (ev.id === "altschiff") return altOpts(s, ev).map(o => ({ t: o.t, h: o.h }));
    if (ev.id === "kaufangebot") return [{ t: "Verkaufen", h: fmt(ev.price) + " Mark" + (ev.buyer === "museum" ? ", der Ruf steigt" : "") }, { t: "Ablehnen", h: "das Schiff bleibt in der Flotte" }];
    return null;
  }
  function lateResolve(s, ev, idx) {
    const sh = s.ships.find(x => x.id === ev.ship);
    if (ev.id === "altschiff") {
      if (!sh) return true;
      const k = (altOpts(s, ev)[idx] || {}).k;
      if (k === "eigen") toMuseum(s, sh.id, "still");
      else if (k === "spende") donateShip(s, sh.id);
      else if (k === "verkauf") sellShip(s, sh.id);
      else if (k === "abwracken") s.uiRetire = sh.id;
      return true;
    }
    if (ev.id === "kaufangebot") {
      if (idx === 0 && sh) {
        const cash = removeShip(s, sh, ev.price); s.cash += cash; if (ev.buyer === "museum") { up(s, "rep", 2); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); }
        s.log.unshift({ m: s.m, head: "„" + sh.name + "“ verkauft an " + (ev.buyer === "hotel" ? "einen Hotelinvestor" : "ein Museum"), text: "Erlös " + fmt(ev.price) + " Mark" + (cash !== ev.price ? ", nach Tilgung des Kredits bleiben " + fmt(cash) + " Mark." : ".") + (ev.buyer === "hotel" ? " Bald leuchten an ihrem neuen Liegeplatz die Lichterketten." : " Bald gehen Schulklassen über ihre Gangway."), kind: "good", img: ev.buyer === "hotel" ? "ev_hotelschiff" : "ev_museumsschiff" });
      }
      return true;
    }
    return false;
  }

  /* ---------- Pleite-Analyse ---------- */
  function bankruptReport(s) {
    const ys = Object.keys(s.years || {}).map(Number).sort((a, b) => a - b).slice(-12);
    const years = ys.map(y => ({ y, eq: s.years[y].eq, profit: s.years[y].profit, rev: s.years[y].rev, cost: s.years[y].cost }));
    const pcts = []; for (const r of s.routes) for (let c = 0; c < 3; c++) { const v = pricePct(s, r, c); if (v > 0 && isFinite(v)) pcts.push(v); }
    const pricePctAvg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 1;
    const act = s.ships.filter(x => !x.museum), avgAge = act.length ? act.reduce((a, x) => a + x.age, 0) / act.length / 12 : 0, oldest = act.slice().sort((a, b) => b.age - a.age).slice(0, 3);
    const lines = s.routes.filter(r => r.last).map(r => ({ name: rInfo(s, r) ? rInfo(s, r).name : "", net: (r.last.rev || 0) - (r.last.cost || 0) - (r.last.fixed || 0) })).sort((a, b) => a.net - b.net).slice(0, 3);
    const reasons = [];
    if (pricePctAvg < .8) reasons.push({ k: "preise", text: "Ihre Fahrpreise lagen im Schnitt nur bei " + Math.round(pricePctAvg * 100) + " % des Üblichen. Löhne, Kohle und Gebühren steigen jedes Jahr – die Preise müssen mitwachsen." });
    if (avgAge > 25) reasons.push({ k: "alter", text: "Ihre Flotte war im Schnitt " + Math.round(avgAge) + " Jahre alt. Alte Schiffe kosten viel Wartung, sind langsam und verlieren Fahrgäste an modernere Konkurrenz." });
    if (lines.length && lines[0].net < 0) reasons.push({ k: "linien", text: "Die größten Verlustlinien: " + lines.filter(l => l.net < 0).map(l => l.name + " (" + fmt(l.net) + " Mark im Monat)").join(", ") + "." });
    if (s.loans.length) reasons.push({ k: "kredite", text: "Kreditraten von zuletzt " + fmt(s.loans.reduce((a, l) => a + (l.pay || 0), 0)) + " Mark im Monat drückten zusätzlich." });
    if (!reasons.length) reasons.push({ k: "sonst", text: "Die laufenden Kosten waren über längere Zeit höher als die Einnahmen." });
    return { years, pricePct: pricePctAvg, avgAge, oldest: oldest.map(x => ({ name: x.name, age: Math.floor(x.age / 12) })), lines, reasons };
  }

  const api = { MONTHS, TYPES, TYPE_ORDER, SPECIAL_ORDER, TYPE_NOTE, MAINT, EQUIP, MK_BUDGET, MK_AGENCY, FIN, PORTS, REGIONS, HOME, SEG, World: W,
    cal, dateStr, fmt, newGame, migrate, nextMonth, resolve, eventOptions, buyNew, buyUsed, rename, randomName, openRoute, closeRoute, routeInfo, canServe, routePrice,
    survey, setLine, setPrice, setMaint, setInsured, equip, equipCost, dock, sellShip, repay, quote, newPrice, shipValue, fleetValue, debt, equity, rating, loanRate,
    tripsOf, active, score, compDepsOf, GEN_TYPES, typeGroup, factoryEqOptions, factoryEqCost, DES, designBases, designType, saveDesign, seriesFactor, EXHIBITS, partsFor, partCost, scrapValue, scrapShip, donateShip, MUS_PRICE, museumUnlocked, museumCost, hallSlots, hallCost, buildMuseum, expandHall, toMuseum, restoreCost, restoreDays, museumMode, museumFest, museumDraw, bankruptReport, avgPct, CAP_NAMES: { first: CAP_FIRST.concat(CAP_FIRST_GB), last: CAP_LAST.concat(CAP_LAST_GB) }, stopInfo, HOMES, homeName, applyCountry, CAP_SPEC, CAP_XP, SPECIAL_CAPS, caps, capOf, capLevel, capPay, capFx, assignCaptain, hireCaptain, dismissCaptain, lineOf, STAFF_LV, STAFF_PAY, DEPT, INSP_PAY, MARKT_PAY, staff, setStaff, crewCost, RIV, RIV_ORDER, rivalsOf, rivState, rivalNames, marketResearch, myExp, setPlan, planTarget, brandtPrice, ACH, stepPrice, alignPrices, pricePct, refNow, maintCost, ageY, fristInfo, renewFrist, reportInfo, isEmil, tourOpen, rInfo, advanceDay, duePending, dim, dayStr, clsName, CLS_K, inDock, offDuty, detained, dateAfter, dockDays, dockInfo, majorRepair, majorCost, MAJOR, shipFixed, simulateMonth, typeOpen, setBudget, setAgency, campaign, campaignCost, buildHallen, pressTrip, riskOf, suggest, distressOdds, routeOf, infoOf, yearOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Engine = api;
})(this);

