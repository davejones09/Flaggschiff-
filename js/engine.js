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
    // v5.1: Fährtypen für den Start als Fährreederei
    wagenfaehre: { name: "Dampffähre für Fuhrwerke", cls: "Typ Fuhrmann", price: 85000, seats: 80, sb: [0, 0, 80], speed: 7, comfort: 1, crew: 380, coal: .55, build: 2, from: 1880, range: 30, shallow: true, wagons: 10 },
    flussrad: { name: "Fluss-Raddampfer", cls: "Typ Strom", price: 110000, seats: 400, sb: [0, 120, 280], speed: 8.5, comfort: 2, crew: 560, coal: .8, build: 3, from: 1880, range: 60, shallow: true, river: true, excursion: .3 },
    inselpost: { name: "Inselpostdampfer", cls: "Typ Hallig", price: 145000, seats: 160, sb: [0, 60, 100], speed: 10.5, comfort: 2, crew: 560, coal: .75, build: 3, from: 1880, range: 200, shallow: true, cargo: .25, post: true, sturdy: true },
    kanalrad: { name: "Kanal-Raddampfer", cls: "Typ Kanal", price: 180000, seats: 240, sb: [60, 100, 80], speed: 14, comfort: 3, crew: 1300, coal: 2.0, build: 3, from: 1880, range: 120, post: true, rough: 1.5, wear: 1.2 },
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
  const FERRY_TYPES = ["hafen", "wagenfaehre", "flussrad", "inselpost", "kanalrad"];
  const TYPE_ORDER = ["hafen", "wagenfaehre", "flussrad", "inselpost", "kanalrad", "moewe", "watt", "seebad", "kaiserbad", "trajekt", "nordsee", "nacht", "ostsee", "turbine", "levante", "kurier", "sued", "hansa", "komet", "reichspost", "meteor", "kreuz"];
  const TYPE_NOTE = {
    hafen: "Klein, billig, unermüdlich – pendelt im Takt über den Hafen.",
    wagenfaehre: "Breites Deck für Fuhrwerke und Vieh, dazu ein paar Plätze. Langsam, aber auf jeder Querung gefragt.",
    flussrad: "Viele Plätze, gemächlich und gemütlich – für Pendler und die Sonntags- und Sommerausflüge. Fährt nur auf Flüssen.",
    inselpost: "Seefest und zuverlässig: bringt Post, Waren und im Sommer Badegäste zu den Inseln.",
    kanalrad: "Schnell und elegant, mit Post an Bord – für Dover–Calais oder Holyhead–Dublin. Bei Seegang empfindlich.",
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
  function maintCost(s, sh, lvl) { return PS(s, sh) * .035 / 12 * MAINT[lvl == null ? sh.maint : lvl].cost * ageCost(sh); }
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
  // Fehlerfänger (v5.0): Ein Fehler in einem Teil des Tages hält die Zeit nicht an. In Tests und in der Simulation (strict) wird er geworfen.
  let STRICT = false; const ERRS = [];
  function guard(s, what, fn) {
    if (STRICT) return fn();
    try { return fn(); }
    catch (e) { ERRS.push({ what, msg: String((e && e.message) || e), m: s.m, day: s.day }); if (ERRS.length > 20) ERRS.shift(); try { console.error("Flaggschiff-Engine (" + what + "):", e); } catch (x) { } return undefined; }
  }
  const setStrict = v => { STRICT = !!v; }, takeErrors = () => ERRS.splice(0);
  const pick = (s, arr) => arr[Math.floor(rnd(s) * arr.length)];
  function cal(m) { const k = START_MONTH + m; return { y: START_YEAR + Math.floor(k / 12), mo: k % 12 }; }
  function dateStr(m) { const c = cal(m); return MONTHS[c.mo] + " " + c.y; }
  function dim(m) { const c = cal(m); return new Date(c.y, c.mo + 1, 0).getDate(); }
  function dayStr(s) { return s.day + ". " + dateStr(s.m); }
  // Kalendertag eines Zeitpunkts im Tageszähler (auch in der Vergangenheit), auf Wunsch mit Uhrzeit
  function tDate(s, T, hour) {
    let m = s.m, d = s.day + Math.floor(T) - Math.floor(s.t || 0);
    while (d > dim(m)) { d -= dim(m); m++; }
    while (d < 1) { m--; d += dim(m); }
    return d + ". " + MONTHS[cal(m).mo] + (cal(m).y !== cal(s.m).y ? " " + cal(m).y : "") + (hour ? ", " + Math.floor((T - Math.floor(T)) * 24) + " Uhr" : "");
  }
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
  function sendToDock(s, sh, days) { const at = sh.v && sh.v.st === "see" ? Math.max(s.t, Math.ceil(sh.v.eta)) : s.t; sh.dockUntil = Math.max(sh.dockUntil || 0, at) + days; return sh.dockUntil - s.t; }
  const MAJOR = { kessel: { name: "Kesselerneuerung", every: 144, pct: .12, text: "Die Kessel sind nach vielen Jahren verschlissen. Ohne neue Kessel steigt die Gefahr von Havarien, und das Schiff verbraucht mehr Kohle." },
    rumpf: { name: "Rumpferneuerung", every: 240, pct: .18, text: "Platten und Spanten sind vom Rost gezeichnet. Ohne Erneuerung nutzt sich das Schiff schneller ab und wird nie wieder richtig gut." } };
  function majorCost(s, sh, k) { return Math.round(PS(s, sh) * MAJOR[k].pct / 1000) * 1000; }
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
  const PS = (s, sh) => P(s, TYPES[sh.type]) * (sh.pb || 1); // v5.1: Schiffe aus älteren Spielständen behalten ihre alte Preisbasis
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
  // v5.1: Langstrecke – höhere Fahrpreise und Frachtraten (passend zu den teureren Schiffen), dafür viel höhere Fixkosten der Hochseeschiffe:
  // Heuer, Versicherung und Hafengebühren. So kostet ein halbleerer Ozeandampfer richtig Geld (Werte per Simulation, docs/konzept-v5.1.md)
  const FARE_LONG = .7, OCEAN_CREW = 2, OCEAN_INS = 4.5, OCEAN_FEE = 5, FERRY_COMP = .55, POST_BONUS = 1.25;
  const fareF = d => 1 + FARE_LONG * clamp(Math.log(Math.max(1, d) / 350) / Math.log(9), 0, 1);
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
    ref *= fareF(d);
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
    if (d < 20 && ((share.local || 0) + (share.transit || 0) > .45 || PORTS[a].shallow || PORTS[b].shallow)) compDeps *= FERRY_COMP; // v5.1: auf kurzen Querungen fahren weniger Rivalen
    const compSpeed = (d < 20 && (share.local || 0) > .5 ? 8.5 : d < 200 ? 10 : d < 800 ? 12 : (a === "ny" || b === "ny") ? 13.5 : 12.5) + .08 * (y - 1880); // v5.1: Hafenfähren der Rivalen mit 8,5 statt 10 Knoten
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
    if (t.river && info.areas.some(x => x !== "river" && x !== "canal")) return "Fluss-Raddampfer fahren nur auf Flüssen.";
    if (t.trajekt && !info.rail) return "Eisenbahnfähren fahren nur zwischen Fährbahnhöfen.";
    if (t.cruiseOnly && !cruise) return "Das Traumschiff fährt nur Vergnügungsreisen.";
    if (cruise && t.comfort < 3) return "Für Vergnügungsreisen zu wenig Komfort (mindestens drei Sterne).";
    return null;
  }
  const routeOf = (s, sh) => sh.line && s.routes.find(r => r.id === sh.line);
  function compDepsOf(s, r, info) { if (konzOn(s, r)) return 0; const base = r.compOverride != null ? r.compOverride : info.comp.deps; return base * (r.compMult || 1); }
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
  function shipValue(s, sh) { return Math.round(PS(s, sh) * Math.pow(0.95, sh.age / 12) * (0.75 + 0.25 * sh.cond / 100) * s.shipIdx); }
  function fleetValue(s) { return s.ships.reduce((a, sh) => a + (sh.ready <= s.m ? shipValue(s, sh) : sh.paid || 0), 0); }
  function debt(s) { return s.loans.reduce((a, l) => a + l.out, 0); }
  function equity(s) { return s.cash + fleetValue(s) + boValue(s) + bunkerValue(s) + lagerValue(s) - debt(s); }
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
    return Math.round((s.base + diffOf(s).zins + (r.idx === 4 ? 6 : spread) + (kind === "werft" ? 2.2 : 0)) * 10) / 10;
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
    const now = Math.round(price * f.down), loan = price - now, ci = creditInfo(s);
    if (loan > ci.room) return { ok: false, over: true, now, loan, rate, pay: Math.round(annuity(loan, rate, f.months)), months: f.months, name: f.name, note: f.note, room: ci.room,
      reason: (kind === "werft" ? "Die Werft" : "Die Bank") + " gibt den Kredit nicht: " + fmt(loan) + " Mark sind zu viel für Ihren Kreditrahmen, frei sind noch " + fmt(ci.room) + " Mark (Eigenkapital " + fmt(ci.eq) + " Mark, Ergebnis der letzten 12 Monate " + fmt(ci.res) + " Mark, Bonität " + ci.grade + ")." };
    return { ok: s.cash >= now, now, loan, rate, pay: Math.round(annuity(loan, rate, f.months)), months: f.months, name: f.name, note: f.note, reason: s.cash < now ? "Nicht genug Geld für die Anzahlung." : "" };
  }
  // v5.1: Kreditrahmen für Bank und Werft nach Eigenkapital, Ergebnis der letzten 12 Monate und Bonität; bestehende Kredite zählen dagegen, der Gründungskredit nicht
  // Das Ergebnis zählt erst mit einem vollen Geschäftsjahr (vorher nur Verluste)
  const CREDIT = { eq: .25, res: .6, grade: [1.2, 1, .85, .5, 0], diff: { leicht: 1, normal: 1, schwer: .85 } };
  function creditInfo(s) {
    const eq = equity(s), h = (s.hist || []).slice(-12), sum = h.reduce((a, x) => a + (x.profit || 0), 0), res = h.length >= 12 ? sum : Math.min(0, sum), r = rating(s), gf = CREDIT.grade[r.idx], df = CREDIT.diff[s.diff] || 1;
    const used = s.loans.filter(l => !l.founder).reduce((a, l) => a + l.out, 0);
    const limit = Math.max(0, Math.round((CREDIT.eq * Math.max(0, eq) + CREDIT.res * res) * gf * df / 1000) * 1000);
    return { eq: Math.round(eq), res: Math.round(res), months: h.length, grade: r.grade, gf, df, used: Math.round(used), limit, room: Math.max(0, limit - Math.round(used)) };
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
    s.home = HOMES[opt.home] ? opt.home : "ham"; s.country = HOMES[s.home].country; s.diff = DIFF[opt.diff] ? opt.diff : "normal";
    migrate(s);
    const loan = diffOf(s).loan; s.cash = loan;
    s.loans.push({ id: uid(s), label: "Gründungskredit " + HOMES[s.home].bank, out: loan, rate: 3.5, pay: Math.round(loan * .035 / 12), left: 240, grace: 36, founder: true });
    s.flags.hadFounder = true;
    if (isEmil(s.name)) s.flags.emilFirm = true;
    addListing(s, "moewe", 14 * 12); addListing(s, "seebad", 9 * 12); addListing(s, "kurier", 19 * 12);
    const first = opt.start ? startFleet(s, opt.start === true ? null : opt.start, opt.start2) : null;
    s.log.unshift({ m: 0, head: "Eine neue Reederei in " + homeName(s), text: first ? s.name + " eröffnet ihr Kontor am Hafen. " + (first.ships.length > 1 ? "Die ersten Fähren „" + first.ships.map(x => x.name).join("“ und „") + "“ fahren" : "Die erste Fähre „" + first.ships[0].name + "“ fährt") + " ab sofort auf " + first.name + "." : s.name + " eröffnet ihr Kontor am Hafen. Noch fährt kein einziges Schiff unter ihrer Flagge.", kind: "news" });
    return s;
  }
  // v5.1: Gründung als Fährreederei. Startlinien je Heimathafen, der erste Typ ist der empfohlene
  const STARTS = {
    ham: [["ham", "bla", ["flussrad", "hafen"], "Elbabwärts nach Blankenese: Pendler und im Sommer viele Ausflügler."],
      ["gls", "wis", ["wagenfaehre"], "Die Elbquerung für Fuhrwerke und Vieh zwischen Holstein und Kehdingen."],
      ["ham", "fin", ["flussrad", "hafen"], "Kurze Querung über die Elbe: viele Pendler zu Werften und Fischern, dazu Fuhrwerke."],
      ["dag", "wyk", ["inselpost", "hafen"], "Zur Insel Föhr: Post und Versorgung, im Sommer Badegäste."]],
    lpl: [["lpl", "bir", ["wagenfaehre", "hafen"], "Über den Mersey: sehr viele Pendler und Fuhrwerke."],
      ["lpl", "dou", ["inselpost", "kanalrad"], "Zur Isle of Man: Post und Versorgung, im Sommer viele Badegäste."],
      ["hol", "dub", ["inselpost", "kanalrad"], "Über die Irische See nach Dublin: Bahnreisende und Post. Der Kanal-Raddampfer ist schneller und schafft die 12 Knoten für den Postvertrag, leidet aber unter dem rauen Wetter."]],
    lon: [["lon", "grv", ["flussrad"], "Themseabwärts nach Gravesend: Reisende und Sommerausflügler."],
      ["til", "grv", ["wagenfaehre"], "Kurze Querung der Themse für Fuhrwerke und Vieh."],
      ["dov", "cal", ["kanalrad", "hafen"], "Über den Kanal nach Calais: Bahnreisende und Post."],
      ["por", "ryd", ["inselpost", "hafen"], "Zur Isle of Wight: Pendler, Post und im Sommer Badegäste."]],
  };
  function startOptions(home) {
    const st = { m: 0, pm: {}, pmVer: 0, pair: {} };
    return (STARTS[home] || STARTS.ham).map(([a, b, rec, note]) => {
      const i = routeInfo(st, a, b, false); if (!i) return null;
      const types = rec.filter(k => !canServe(st, k, a, b, false));
      return { a, b, name: i.name, dist: i.dist, who: i.who, note, types, rec: types[0], wagons: !!WAGON[pairKey(a, b)], zk: zkPossible(i), contract: ipKind({ a, b }) };
    }).filter(Boolean);
  }
  // Leicht: zwei Fähren auf zwei Startlinien (zwei Fähren auf einer Linie verdienen weniger als eine); st2 wählt die zweite Linie
  function startFleet(s, st, st2) {
    const list = startOptions(s.home), find = x => x && list.find(y => (y.a === x.a && y.b === x.b) || (y.a === x.b && y.b === x.a));
    const L = find(st) || list[0]; if (!L) return null;
    const D = diffOf(s), lines = [[L, st]];
    if ((D.ferries || 1) > 1) { const L2 = (find(st2) !== L && find(st2)) || list.find(x => x !== L); if (L2) lines.push([L2, st2]); }
    const ships = [], names = [];
    for (const [X, sel] of lines) {
      const type = sel && X.types.includes(sel.type) ? sel.type : X.rec, age = D.ferryAge || 0;
      openRoute(s, X.a, X.b, false, [], { free: true });
      const r = s.routes[s.routes.length - 1];
      const sh = initShip(s, { id: uid(s), name: randomName(s, ships.map(x => x.name).join(" ")), type, age, cond: age ? Math.round(58 + rnd(s) * 12) : 100, line: r.id, laid: false, insured: true, maint: 1, ready: s.m, paid: 0, eq: {}, founder: s.m + 36 }, { fresh: !age });
      s.ships.push(sh); ships.push(sh); names.push(X.name);
    }
    s.flags.ferryStart = { a: L.a, b: L.b, type: ships[0].type };
    return { ships, name: names.join(" und ") };
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
    if (s.exp.ku == null) s.exp.ku = 50; if (s.expHit.ku == null) s.expHit.ku = 0;
    if (!FAHRT[s.fahrt]) s.fahrt = "normal"; kueche(s); staff(s); boState(s); boUnlock(s); s.coalK = s.coalK || []; s.coalHist = s.coalHist || []; s.coalUse = s.coalUse || [];
    if (s.t == null) { let t = 0; for (let m = 0; m < s.m; m++) t += dim(m); s.t = t + s.day - 1; }
    if (s.m > 0 && !s.flags.hadFounder) s.flags.hadFounder = true;
    s.ships.forEach((sh, i) => { if (sh.repair != null) { if (sh.repair >= s.m) sh.dockUntil = s.t + 10; delete sh.repair; } if (sh.survey == null) sh.survey = s.t + 120 + (i * 337) % 1300; initShip(s, sh); });
    // v5.0: Fahrplan, Bekohlung und Pünktlichkeit. Alte Spielstände: Schiffe fahren am nächsten Tag ab, Bunker halb voll, Schwierigkeit Normal
    if (!s.v5) {
      s.v5 = 1;
      if (!DIFF[s.diff]) s.diff = "normal";
      if (s.coalUse && s.coalUse.length) { s.coalUse = s.coalUse.map(x => Math.round(x / COAL_T)); s.coalPort = s.coalPort || {}; s.coalPort[s.home || "ham"] = s.coalUse.slice(); }
      for (const k of s.coalK || []) if (!k.port) { k.port = s.home || "ham"; k.qty = (k.qty || 0) / COAL_T; k.pt = COAL_T * TIER[portTier(k.port)] * (k.price || 1); }
      for (const sh of s.ships) if (sh.ready <= s.m && !sh.museum && !sh.v) { initV(s, sh, s.home, true); sh.v.mig = 1; }
    }
    if (!BUNK_RES[s.bunk]) s.bunk = "heim";
    s.pause = Object.assign({}, PAUSE_DEF, s.pause || {}); s.fahrten = s.fahrten || []; s.blk = s.blk || {}; s.coalPort = s.coalPort || {};
    if (s.exp.p == null) s.exp.p = 50;
    for (const r of s.routes) { if (r.pk == null) r.pk = pkStart(s, r); if (r.buf == null) r.buf = 0; r.q = r.q || {}; }
    // v5.1: Fährreederei und Spieltempo. Alte Spielstände behalten ihren Start; vorhandene Schiffe behalten ihre Preisbasis (Wert, Versicherung, Wartung),
    // die Fahrpreise der Langstrecke ziehen mit den neuen Grundpreisen mit
    if (!s.v51) {
      s.v51 = 1;
      for (const sh of s.ships) { const t = TYPES[sh.type], b = t && (t.design ? TYPES[t.base] : t); if (b && b.price0 && b.price && Math.abs(b.price0 / b.price - 1) > 1e-6) sh.pb = b.price0 / b.price; }
      for (const r of s.routes) { const i = routeInfo(s, r.a, r.b, r.cruise), f = i ? fareF(i.dist) : 1; if (f > 1.0001 && Array.isArray(r.price)) r.price = r.price.map(x => roundPrice(x * f)); }
    }
    // v5.1.1: Kohlelager im Heimathafen statt Bekohlungsregeln. Alte Spielstände bekommen Platz für zwei Monate Bunkern im Heimathafen, mindestens 3.000 t;
    // die Bunker bleiben, Lieferverträge liefern ab jetzt ins Lager
    // v5.1.1: Betriebsfähige Museumsschiffe brauchen eine gültige Frist; abgelaufene bekommen beim ersten Laden drei Monate Aufschub
    if (!s.musFrist) { s.musFrist = true; for (const sh of s.ships) if (sh.museum === "aktiv" && sh.survey != null && sh.survey < s.t + 90) sh.survey = s.t + 90; }
    if (!s.lager) {
      const old = (s.hist && s.hist.length > 0) || s.ships.some(sh => sh.v);
      s.lager = { t: 0, v: 0, cap: Math.max(LAGER_CAP, Math.ceil(2 * coalBase(s, s.home || "ham") / 100) * 100), use: [] };
      for (const k of s.coalK || []) k.port = s.home || "ham";
      if (old) s.log.unshift({ m: s.m, head: "Ihr Kohlelager ist eingerichtet", text: "Im Heimathafen haben Sie jetzt ein Kohlelager für " + fmt(s.lager.cap) + " Tonnen. Kaufen Sie unter Kontor → Einkauf Kohle, sonst bunkern Ihre Schiffe zu Hause am Kai, 15 % teurer. Die Bekohlungsregeln gibt es nicht mehr: Auswärts nehmen die Schiffe so viel, wie sie bis nach Hause brauchen.", kind: "own", img: "ev_bunkern" });
    }
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
  function openRoute(s, a, b, cruise, stops, opt) {
    cruise = !!cruise; stops = cruise ? [] : (stops || []).filter(x => x && x !== a && x !== b).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 2); opt = opt || {};
    if (a === b) return "Start und Ziel sind gleich.";
    if (!cruise && !stops.length && s.konzBlock && s.konzBlock[pairKey(a, b)] > s.m) return "Auf dieser Querung fährt bis " + dateStr(s.konzBlock[pairKey(a, b)]) + " ein Rivale mit Konzession.";
    const sk = r => (r.stops || []).join(",");
    if (s.routes.some(r => !!r.cruise === cruise && sk(r) === stops.join(",") && ((r.a === a && r.b === b) || (r.a === b && r.b === a && !stops.length)))) return "Diese Linie betreiben Sie bereits.";
    if (cruise && !tourOpen(s, b) && !tourOpen(s, a)) return "Zu diesem Ziel gibt es (noch) keine Vergnügungsreisen.";
    const info = stops.length ? stopInfo(s, [a, ...stops, b]) : routeInfo(s, a, b, cruise); if (!info) return "Keine Seeverbindung.";
    const cost = opt.free ? 0 : Math.round(2000 * s.pidx);
    if (s.cash < cost) return "Nicht genug Geld für Agentur und Anleger.";
    if (cost) expense(s, "Agenturen", cost);
    const r = { id: uid(s), a, b, cruise, stops: stops.length ? stops : undefined, price: info.refC.map(x => roundPriceS(s, x * s.pidx)), compMult: 1, demMult: 1, opened: s.m, buf: 0, q: {} };
    r.pk = pkStart(s, r);
    s.routes.push(r);
    if (!opt.free) s.log.unshift({ m: s.m, head: "Neue Linie: " + info.name, text: "Agentur und Anleger kosten " + fmt(cost) + " Mark. Jetzt fehlen nur noch Schiffe.", kind: "own", route: r.id });
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
    opt = opt || {};
    const eqSel = (opt.eq || []).filter(k => FACTORY_PCT[k] && yearOf(s) >= EQUIP[k].from);
    const t = TYPES[type], O = orderInfo(s, type, brandt, opt.n || 1, eqSel), q = quote(s, O.total, kind);
    if (!q.ok) return q.reason || "Nicht genug Geld.";
    const line = opt.line && s.routes.find(r => r.id === opt.line) && !canServe(s, type, s.routes.find(r => r.id === opt.line).a, s.routes.find(r => r.id === opt.line).b, s.routes.find(r => r.id === opt.line).cruise, s.routes.find(r => r.id === opt.line).stops) ? opt.line : null;
    s.cash -= q.now;
    const sid = O.n > 1 ? uid(s) : null, made = [];
    for (let i = 0; i < O.n; i++) {
      const price = O.prices[i];
      const sh = initShip(s, { id: uid(s), name: i === 0 ? (cleanName(name) || randomName(s)) : randomName(s, made.map(x => x.name).join(" ")), type, age: 0, cond: 100, line, laid: !line, insured: true, maint: 1, ready: O.plan[i], paid: price, isNew: true, eq: {}, spd: brandt ? .7 : 0, brandt: !!brandt }, { fresh: true });
      if (sid) { sh.series = sid; if (i === 0) sh.seriesFirst = true; }
      if (yearOf(s) >= 1912) sh.eq.boote = true;
      for (const k of eqSel) sh.eq[k] = true;
      if (t.design && s.designs && s.designs[t.design]) s.designs[t.design].built++;
      s.ships.push(sh); made.push(sh);
      if (q.loan) { const loan = Math.round(q.loan * price / O.total); addLoan(s, { loan, rate: q.rate, pay: Math.round(annuity(loan, q.rate, q.months)), months: q.months }, sh, kind === "werft" ? "Werftkredit" : "Bankkredit"); }
      emilCheck(s, sh);
    }
    if (brandt) { const st = rivState(s, "brandt"); st.boost = Math.min(.5, st.boost + .04 * O.n); }
    if (s.bo) s.bo.ord[brandt ? "brandt" : "werft"] += O.total;
    const sh0 = made[0];
    if (O.n === 1) s.log.unshift({ m: s.m, head: "Neubau bestellt: „" + sh0.name + "“", text: t.name + " (" + t.cls + ")" + (brandt ? " · in Brandt-Bauart, 0,7 Knoten schneller – Brandt & Söhne verdient kräftig mit" : "") + " · Ablieferung " + dateStr(sh0.ready) + ".", kind: "own", img: brandt ? "ev_brandtwerft" : undefined });
    else s.log.unshift({ m: s.m, head: "Serie bestellt: " + O.n + " Schiffe", text: t.name + " (" + t.cls + ") · Ablieferung ab " + dateStr(O.plan[0]) + ", dann " + (O.gap === 1 ? "jeden Monat" : "alle " + O.gap + " Monate") + ", das letzte Schiff im " + dateStr(O.plan[O.n - 1]) + ". Serienrabatt " + Math.round(O.disc * 100) + " %, zusammen " + fmt(O.total) + " Mark.", kind: "own", img: brandt ? "ev_brandtwerft" : "wf_buero" });
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
    const old = sh.line && s.routes.find(x => x.id === sh.line);
    if (old && old.res === sh.id && old.id !== routeId) { old.res = null; if (sh.v) sh.v.res = false; }
    sh.line = routeId || null; sh.laid = !routeId;
    if (old && old.id !== routeId && !s.sim) respace(s, old);
    return null;
  }
  const refNow = (s, r, c) => { const i = rInfo(s, r); return i ? i.refC[c] * s.pidx : 0; };
  const roundPrice = v => v < 10 ? Math.round(v * 20) / 20 : v < 100 ? Math.round(v * 2) / 2 : Math.round(v);
  // v5.1.1: jeder Schritt ändert den Preis sichtbar – mindestens eine Rundungsstufe (in Pfund: ein Penny, ab £10 ein Pfund)
  const GBP = 20.43;
  const priceUnit = (s, v) => s && s.country === "gb" ? (v < 10 * GBP ? GBP / 240 : GBP) : v < 10 ? .05 : v < 100 ? .5 : 1;
  const roundPriceS = (s, v) => s && s.country === "gb" ? (u => Math.round(v / u) * u)(priceUnit(s, v)) : roundPrice(v);
  function priceStep(s, r, c, dir) {
    const ref = refNow(s, r, c), lo = ref * .3, hi = ref * 2.5, p = r.price[c];
    let n = roundPriceS(s, clamp(p + dir * .05 * ref, lo, hi));
    if (Math.abs(n - p) < 1e-9) n = roundPriceS(s, p + dir * priceUnit(s, p + (dir < 0 ? -1e-9 : 0)));
    if (n < lo - 1e-9 || n > hi + 1e-9) n = roundPriceS(s, dir > 0 ? hi : lo);
    if (dir > 0 ? n > hi + 1e-9 || n <= p + 1e-9 : n < lo - 1e-9 || n >= p - 1e-9) return null;
    return n;
  }
  function stepPrice(s, id, c, dir) { const r = s.routes.find(x => x.id === id); if (!r) return; const n = priceStep(s, r, c, dir); if (n != null) r.price[c] = n; }
  const canStepPrice = (s, r, c, dir) => priceStep(s, r, c, dir) != null;
  function avgPct(s) { const v = []; for (const r of s.routes) if (s.ships.some(x => x.line === r.id)) for (let c = 0; c < 3; c++) { const p = pricePct(s, r, c); if (p > 0 && isFinite(p)) v.push(p); } return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 1; }
  function oldShips(s) { return s.ships.filter(x => !x.museum && x.ready <= s.m && x.age >= 360).sort((a, b) => b.age - a.age); }
  function alignPrices(s, id) { const r = s.routes.find(x => x.id === id); if (!r) return; for (let c = 0; c < 3; c++) r.price[c] = roundPriceS(s, refNow(s, r, c)); }
  function setPrice(s, id, c, factor) { const r = s.routes.find(x => x.id === id); if (r) r.price[c] = roundPriceS(s, refNow(s, r, c) * clamp(factor, .3, 2.5)); }
  function routePrice(s, r, c) { return r.price[c]; }
  function pricePct(s, r, c) { const ref = refNow(s, r, c); return ref ? r.price[c] / ref : 1; }
  function setMaint(s, id, lvl) { const sh = s.ships.find(x => x.id === id); if (sh) sh.maint = lvl; }
  function setInsured(s, id, on) {
    const sh = s.ships.find(x => x.id === id); if (!sh) return;
    if (!on && s.loans.some(l => l.ship === id)) return "Die Bank verlangt eine Versicherung, solange der Kredit läuft.";
    sh.insured = on; return null;
  }
  function equipCost(s, sh, k) { return Math.round(PS(s, sh) * EQUIP[k].pct / 100) * 100; }
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
    return { days: dockDays(sh.type, "dock"), cost: Math.round(PS(s, sh) * .05 * (staff(s).insp ? .95 : 1)) };
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
    return { left, days: dockDays(sh.type, "frist"), cost: Math.round(PS(s, sh) * .045 * (staff(s).insp ? .95 : 1) / 100) * 100, can: left <= 365 };
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
    if (sh.founder > s.m) return "Die Gründer haben die Fähre eingebracht: Verkaufen können Sie sie erst ab " + dateStr(sh.founder) + ".";
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
  function tripsOf(s, sh, info, fz) {
    const t = TYPES[sh.type], spd = (t.speed + (sh.spd || 0)) * (0.85 + 0.15 * sh.cond / 100) * SPD_LV[staff(s).maschine] * capFx(s, sh).spd * (fz != null ? fz : fahrtF(s, sh));
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
    return info.D0 * info.season[mo] * s.konj * (r.demMult || 1) * modFactor(s, r, info, "demand") * (1 + .025 * s.m / 12) * agency * (r.adOn ? 1.12 : 1) * cruiseBonus(s, r) * (r.cruise ? 1 + KU_CRUISE * ((s.exp && s.exp.ku != null ? s.exp.ku : 50) - 50) / 50 : 1) *
      (zkOn(r) ? 1 + ZK_DEM * (sh.local || 0) : 1) * excBonus(s, r, info, mo);
  }
  /* ---------- Fährgeschäft (v5.1) ----------
     Fuhrwerke und Vieh auf den großen Querungen (nur Schiffe mit Wagendeck), Zeitkarten für Pendler, Insel- und Postverträge, Fährkonzession. */
  const WAGON = { "gls|wis": 600, "bir|lpl": 500, "grv|til": 600, "fin|ham": 250, "dag|wyk": 120, "ndd|nor": 80, "por|ryd": 150, "cal|dov": 80 }; // Fuhrwerke im Monat 1880, beide Richtungen
  const wagCap = t => t.wagons || (t.cars ? Math.round(20 * t.cars) : 0);
  const wagFare = (s, d) => (6 + .2 * d) * (s.pidx || 1);
  const RIV_WAG = 6; // Fuhrwerke, die ein Rivale je Abfahrt mitnimmt
  function wagDemand(s, r) { if (r.cruise || (r.stops && r.stops.length)) return 0; return (WAGON[pairKey(r.a, r.b)] || 0) * s.konj * (1 + .015 * s.m / 12); }
  const ZK_DEM = .25, ZK_TAKE = .5, ZK_RIDES = 40, ZK_FARE = 30, ZK_PK = .9;
  const zkPossible = i => !!i && !i.cruise && !i.multi && i.dist <= 25 && (i.share.local || 0) >= .2 && Math.max(PORTS[i.a].pop, PORTS[i.b].pop) >= 100;
  const zkOn = r => !!(r.zk && r.zk.on);
  const zkPrice = (s, r) => ZK_FARE * (.2 * r.price[1] + .8 * r.price[2]);
  function setZk(s, id, on) {
    const r = s.routes.find(x => x.id === id); if (!r) return "Linie unbekannt.";
    if (on && !zkPossible(rInfo(s, r))) return "Zeitkarten gibt es nur auf kurzen Linien mit Pendlern an einer großen Stadt.";
    r.zk = on ? Object.assign(r.zk || { n: 0 }, { on: true }) : null; if (!on) r.zkF = 1;
    s.log.unshift({ m: s.m, head: (on ? "Zeitkarten eingeführt: " : "Zeitkarten abgeschafft: ") + rInfo(s, r).name, text: on ? "Pendler können ab sofort eine Monatskarte kaufen. Sie bringt jeden Monat festes Geld, aber nur, solange die Fähren pünktlich fahren." : "Ab jetzt zahlt jeder Fahrgast wieder einzeln.", kind: "own", route: r.id, img: "fa_pendler" });
    return null;
  }
  // Zeitkarten zum Monatsende (v5.1.1): Maßstab ist die Pünktlichkeit der Rivalen auf der Querung, ohne Rivalen das in diesem Monat Übliche.
  // Wer mindestens so pünktlich ist (2 Punkte Spielraum), verliert keine Pendler; darunter kündigen je Punkt Rückstand 1 % der Karten, höchstens 10 % im Monat.
  // Wer wieder auf dem Maßstab liegt, gewinnt die Gekündigten nach und nach zurück.
  const ZK_TOL = .02, ZK_LOSS = 1, ZK_LOSS_MAX = .1;
  function zkRef(s, r, info) {
    const G = lineGeo(s, r), mo = cal(s.m).mo; if (!G) return { pk: ZK_PK, who: null };
    const rv = compDepsOf(s, r, info) > 0 ? rivalsOf(s, r, info) : [];
    if (rv.length) { let w = 0, v = 0, best = null; for (const x of rv) { const p = rivalPk(s, x.k, G, mo); w += x.w; v += x.w * p; if (!best || x.w > best.w) best = x; } return { pk: w ? v / w : .9, who: best ? best.k : null }; }
    return { pk: clamp(.97 - .8 * wxLate(s, G, mo), .5, .97), who: null };
  }
  function zkMonthly(s) {
    for (const r of s.routes) {
      if (!zkOn(r)) { r.zkF = 1; continue; }
      const info = rInfo(s, r), loc = info ? info.share.local || 0 : 0, rides = r.last ? r.last.pax * loc : 0, Z = r.zk, goal = ZK_TAKE * rides / ZK_RIDES, pk = r.pk == null ? .9 : r.pk;
      const ref = info ? zkRef(s, r, info) : { pk: ZK_PK, who: null }, gap = ref.pk - ZK_TOL - pk;
      Z.ref = ref.pk; Z.refWho = ref.who; Z.lostM = 0; Z.backM = 0;
      if (gap <= 0) {
        const before = Z.n; Z.n += (goal - Z.n) * (goal > Z.n ? .35 : .5);
        const back = Math.min(Z.lost || 0, Math.max(0, Z.n - before)); Z.lost = Math.max(0, (Z.lost || 0) - back); Z.backM = back;
        if (back >= Math.max(5, Z.n * .03) && !s.sim && !(Z.back > s.m - 3)) { Z.back = s.m; s.log.unshift({ m: s.m, head: "Pendler kommen zurück", text: "Die Fähren auf " + info.name + " laufen wieder: " + Math.round(pk * 100) + " % pünktlich" + (ref.who ? ", die " + RIV[ref.who].name + " schafft " + Math.round(ref.pk * 100) + " %" : "") + ". " + Math.round(back) + " Pendler kaufen wieder eine Monatskarte.", kind: "good", route: r.id, img: "fa_pendler" }); }
      } else {
        const lost = Z.n * Math.min(ZK_LOSS_MAX, gap * ZK_LOSS); Z.n -= lost; Z.lost = (Z.lost || 0) + lost; Z.lostM = lost;
        if (lost >= Math.max(5, Z.n * .03) && !(Z.warn > s.m - 3)) { Z.warn = s.m; s.log.unshift({ m: s.m, head: "Pendler kündigen ihre Zeitkarten", text: "Auf " + info.name + " waren nur " + Math.round(pk * 100) + " % der Fahrten pünktlich, " + (ref.who ? "die " + RIV[ref.who].name + " schaffte " + Math.round(ref.pk * 100) + " %" : "üblich wären in diesem Monat " + Math.round(ref.pk * 100) + " %") + ". " + Math.round(lost) + " Pendler haben ihre Monatskarte gekündigt.", kind: "bad", route: r.id, img: "fa_pendler" }); }
      }
      Z.n = Math.max(0, Z.n); Z.pk = pk;
      r.zkF = 1 - loc * Math.min(.9, Z.n * ZK_RIDES / Math.max(1, rides));
    }
  }
  const ISLANDS = ["hel", "wyk", "syl", "nor", "bor", "dou", "ryd"], POSTLINES = ["cal|dov", "dub|hol"];
  function ipKind(r) { if (r.cruise || (r.stops && r.stops.length)) return null; if (POSTLINES.includes(pairKey(r.a, r.b))) return "post"; return ISLANDS.includes(r.a) || ISLANDS.includes(r.b) ? "insel" : null; }
  const konzOn = (s, r) => !!(r.konz && r.konz.until > s.m);
  // Welche Schiffe die Rivalen auf einer Linie fahren (zur Anzeige)
  function rivalTypes(s, r, info) {
    if (!info) return [];
    let L;
    if (info.cruise) L = ["kreuz", "komet"];
    else if (info.ocean) L = (info.share.ausw || 0) > .4 ? ["hansa", "kurier"] : ["kurier", "komet"];
    else if (info.kind.cat === "Nord-/Ostsee") L = ["nordsee", "ostsee", "nacht"];
    else if (info.kind.cat === "Küste") L = (info.share.bath || 0) > .4 ? ["moewe", "seebad"] : ["moewe", "watt"];
    else {
      L = []; const riverOnly = info.areas.every(a => a === "river" || a === "canal");
      if (info.kind.sub === "Hafenfähre" || info.dist < 12) L.push("hafen");
      if (WAGON[pairKey(r.a, r.b)]) L.push("wagenfaehre");
      if (riverOnly && info.dist <= 60) L.push("flussrad");
      if (ISLANDS.includes(r.a) || ISLANDS.includes(r.b)) L.push("inselpost");
      if (POSTLINES.includes(pairKey(r.a, r.b))) L.push("kanalrad");
      if (!L.length) L.push("moewe");
    }
    return L.filter(k => TYPES[k] && yearOf(s) >= TYPES[k].from);
  }
  // Sommerausflüge mit dem Fluss-Raddampfer (Mai bis September)
  function excBonus(s, r, info, mo) {
    if (mo < 4 || mo > 8) return 1;
    let e = 0; for (const sh of s.ships) if (sh.line === r.id && TYPES[sh.type].excursion) e = Math.max(e, TYPES[sh.type].excursion);
    return e ? 1 + e * ((info.share.bath || 0) + .5 * (info.share.gen || 0) + .3 * (info.share.local || 0)) : 1;
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
  /* ---------- Fahrplan, Bekohlung und Pünktlichkeit (v5.0) ----------
     Jedes Schiff fährt im Umlauf: Abfahrt, Seezeit, Ankunft, Liegezeit (Abfertigung und Bekohlen), Rückfahrt.
     Fahrgäste sammeln sich je Linie und Richtung bis zur nächsten Abfahrt, Fahrkarten werden bei der Abfahrt bezahlt.
     Kohle kostet erst beim Bekohlen (Menge × Hafenpreis × Kohlepreis-Index). Linien mit einem Umlauf unter einem Tag
     laufen als Tagespaket: alle Fahrten eines Tages in einem Schritt, Pünktlichkeit als Quote. */
  const COAL_T = 15; // Mark je Tonne bei Index 100 % im Zechenhafen (so kostet die Seemeile so viel wie bis v4.6)
  const TIER = { zeche: 1, europa: 1.06, station: 1.18, ferne: 1.4 };
  const TIER_NAME = { zeche: "Zechenhafen", europa: "Europa", station: "Kohlestation", ferne: "Ferne" };
  const TIER_PORTS = {
    zeche: ["ham", "bhv", "ste", "rot", "ams", "ant", "lon", "grv", "til", "sou", "lpl", "bir", "gla", "lei", "hul"],
    station: ["fun", "lpa", "sct", "sth", "lis", "ny", "gen", "nea", "pal", "ale", "hva", "kin", "bgi", "rig", "stp"],
    ferne: ["rio", "bue", "kap", "sha", "kon", "hmf", "fue"] };
  const portTier = p => TIER_PORTS.zeche.includes(p) ? "zeche" : TIER_PORTS.station.includes(p) ? "station" : TIER_PORTS.ferne.includes(p) ? "ferne" : "europa";
  const bunkRate = p => portTier(p) === "zeche" ? 2500 : 1200; // Tonnen am Tag (parallel zum Ein- und Aussteigen)
  const BUNK_RES = { heim: .15, billig: .15, noetig: .08 }, BUNK_ORDER = ["heim", "billig", "noetig"];
  const BUNK = { heim: { name: "im Heimathafen volltanken" }, billig: { name: "wo es am billigsten ist" }, noetig: { name: "immer nur das Nötige" } };
  const BUF = [0, .05, .1, .2], BUF_NAME = ["keine", "klein", "mittel", "groß"];
  const NOTKOHLE = 1.3, LADUNG = .06;
  // Wetter je Seegebiet: Sturmtage je Seetag [Okt–März, Apr–Sept], Verzögerung in Tagen und Mehrverbrauch je Sturmtag
  const STORM_MO = [9, 10, 11, 0, 1, 2], ICE_MO = [0, 1, 2], HURR_MO = [7, 8, 9], FOGCH_MO = [10, 11, 0, 1];
  const WX = {
    atlantic: { p: [.3, .07], eff: .6, coal: .25 }, north: { p: [.14, .04], eff: .33, coal: .15 },
    baltic: { p: [.1, .03], eff: .33, coal: .15, ice: .08, iceEff: .5 }, balticn: { p: [.12, .03], eff: .33, coal: .15, ice: .3, iceEff: 1 },
    channel: { p: [.06, .02], eff: .2, coal: .1 }, med: { p: [.04, .01], eff: .33, coal: .1 }, tropic: { p: [.03, .03], eff: .5, coal: .15 },
    coast: { p: [.04, .01], eff: .15, coal: .05 } };
  const FOG = { channel: [.12, .03], coast: [.08, .01], river: [.08, .01] }; // je Abfahrt: Kanal Nov–Feb, Küste und Fluss Okt–März
  const CARIB = ["sth", "hva", "kin", "bgi"];
  const BRK = .03, BRK_LV = [1.5, 1, .75, .55], BRK_MAINT = [1.4, 1, .7];
  const IMPAT = { biz: .1, transit: .08, local: .08, gen: .05, bath: .05, ausw: .03, tour: .02 }; // Abspringen je Tag bei überfälliger Abfahrt
  const TAKT_W = 5, TAKT_DEM = .2; // v5.1.1: Wartezeit im Nutzen (je Ungeduld IMPAT), Zusatznachfrage je Halbierung des Abstands
  function impOf(oi) { if (oi._imp != null) return oi._imp; let imp = 0, iw = 0; for (const k in IMPAT) { const x = oi.share[k] || 0; imp += x * IMPAT[k]; iw += x; } return (oi._imp = iw ? imp / iw : .05); }
  // Takt gegen die Rivalen und vorsichtige Schätzung für ein Schiff mehr (v5.1.1): Marktanteil nach dem Logit-Modell mit mehr Plätzen und kürzerer Wartezeit,
  // davon 80 % gerechnet, abzüglich Betriebskosten eines Schiffs wie bisher je Schiff und 10 % Kapitalkosten im Jahr auf den Neupreis.
  function taktInfo(s, r) {
    const info = rInfo(s, r), l = r.last && r.last.m === s.m - 1 ? r.last : null; if (!info || r.cruise) return null;
    const ships = s.ships.filter(x => x.line === r.id && x.ready <= s.m && !x.laid && x.id !== r.res), n = ships.length;
    const out = { n, mine: l ? (l.dep || 0) / 2 : 0, riv: compDepsOf(s, r, info), gain: 0, worth: false };
    if (!l || !n || !(l.pax > 0)) return out;
    let dem = 0, no = 0; for (const c of l.cls || []) { dem += c.dem || 0; no += c.no || 0; }
    if (!(dem > 0)) return out;
    const sig = clamp(l.pax / dem, .01, .99), k = (n + 1) / n * Math.exp(TAKT_W * impOf(info) * Math.log((n + 1) / n)), sig2 = k * sig / (k * sig + 1 - sig);
    const perPax = l.rev / l.pax, extra = (l.pax * (sig2 / sig - 1) + no) * perPax * .8;
    const perShip = ((l.cost || 0) + (l.fixed || 0)) / n, cap = newPrice(s, ships[0].type) * .1 / 12;
    out.gain = extra - perShip - cap; out.worth = out.gain > Math.max(500 * (s.pidx || 1), .2 * Math.max(0, l.rev - (l.cost || 0) - (l.fixed || 0)));
    return out;
  }
  const SKIM = 5; // Wartende wechseln je Abfahrt eines Rivalen mit SKIM × IMPAT (Kaufleute 50 %, Auswanderer 15 %), soweit die eigene Abfahrt später kommt als die übliche der Rivalen
  const PK_SEG = { biz: 1, transit: .8, local: .6, gen: .5, bath: .4, tour: .3, ausw: .2 }, PK_CLS = [1, .6, .25], W_PK = .35, PK_REF = .85;
  const CMP = [.1, .06, .03], LATE_OK = .5, LATE_REL = .15, PK_MEM = 90;
  const lateTol = seaD => Math.max(LATE_OK, LATE_REL * seaD); // pünktlich: höchstens ½ Tag oder 15 % der Seezeit zu spät
  const RIV_PK = { weser: .92, elbe: .78, balt: .82, kopen: .95, brandt: .9, themse: .88 };
  const DIFF = {
    leicht: { name: "Leicht", loan: 150000, ferries: 2, ferryAge: 0, riv: .9, delay: .5, risk: .7, zins: -.5 },
    normal: { name: "Normal", loan: 100000, ferries: 1, ferryAge: 0, riv: 1, delay: 1, risk: 1, zins: 0 },
    schwer: { name: "Schwer", loan: 60000, ferries: 1, ferryAge: 240, riv: 1.2, delay: 1.4, risk: 1.3, zins: 1 } }; // v5.1: Start mit Fähre(n), bis v5.0.1 kein Schiff und 550.000 / 450.000 / 350.000 Mark
  const DIFF_ORDER = ["leicht", "normal", "schwer"];
  const diffOf = s => DIFF[s.diff] || DIFF.normal;
  const PAUSE_DEF = { late: 3, coal: true, month: false, mark: true }; // Verspätung ab 3 Tagen: mit 2 hielt eine große Flotte im Winter etwa jeden vierten Tag an
  const mod = (x, m) => ((x % m) + m) % m;
  function poisson(s, lam) { if (lam <= 0) return 0; if (lam > 30) return Math.max(0, Math.round(lam + Math.sqrt(lam) * (rnd(s) + rnd(s) + rnd(s) - 1.5) * 2)); const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= rnd(s); } while (p > L && k < 100); return k - 1; }

  // Geometrie einer Linie: Häfen, Teilstrecken, Liegezeiten, Fahrgast-Strecken
  let geoCache = { key: null, map: {} };
  function lineGeo(s, r) {
    const ck = s.m + ":" + (s.pmVer || 0); if (geoCache.key !== ck) geoCache = { key: ck, map: {} };
    const key = (s.home || "ham") + "|" + r.a + ">" + r.b + "|" + (r.stops || []).join(",") + (r.cruise ? "|c" : "");
    if (geoCache.map[key] !== undefined) return geoCache.map[key];
    const info = rInfo(s, r); if (!info) return (geoCache.map[key] = null);
    const ports = info.multi ? info.ports.slice() : [r.a, r.b], n = ports.length, legs = info.multi ? info.legs : [info];
    const hi = ports.indexOf(s.home || "ham");
    const ods = info.multi ? info.ods.map(o => ({ i: o.i, j: o.j, info: o.info, legs: o.legs })) : [{ i: 0, j: 1, info, legs: [0] }];
    const meal = !!info.cruise || info.dist >= 40;
    const g = { info, ports, n, legs, legDist: legs.map(l => l.dist), legAreas: legs.map(l => l.path.areas), homeIdx: hi >= 0 ? hi : 0, resEnd: hi === n - 1 ? n - 1 : 0,
      stopT: .25, endLiege: Math.max(.1, (info.turn - (info.multi ? .5 * (n - 2) : 0)) / 2), ods, meal, cruise: !!r.cruise, dist: info.dist };
    return (geoCache.map[key] = g);
  }
  const isEnd = (G, i) => i === 0 || i === G.n - 1;
  const legOf = (i, d) => d > 0 ? i : i - 1;
  function shipSpd(s, sh, fz) { const t = TYPES[sh.type]; return (t.speed + (sh.spd || 0)) * (0.85 + 0.15 * sh.cond / 100) * SPD_LV[staff(s).maschine] * capFx(s, sh).spd * fz; }
  const legDays = (s, sh, G, k, fz) => G.legDist[k] / (shipSpd(s, sh, fz) * 24);
  function seaDays(s, sh, G, fz) { let d = 0; for (let k = 0; k < G.legDist.length; k++) d += legDays(s, sh, G, k, fz); return d; }
  function shipCycle(s, sh, G) { return 2 * seaDays(s, sh, G, fahrtF(s, sh)) + 2 * G.endLiege + 2 * (G.n - 2) * G.stopT; }
  // Der Bunker fasst Kohle für 125 % der Reichweite bei normaler Fahrt (v5.0.1): So passen auf Strecken bis zur Reichweite
  // auch die Reserve, das Gewicht des vollen Bunkers und knapp bezahltes Maschinenpersonal (vorher fehlte dort bei jeder Abfahrt Kohle).
  const BUNK_X = 1.25;
  const coalCap = sh => { const t = TYPES[sh.type]; return Math.max(1, (t.range || 100) * (t.coal || .1) * .85 / COAL_T * BUNK_X); };
  function coalSm(s, sh, fz) {
    const t = TYPES[sh.type], st = staff(s); if (!(t.coal > 0)) return 0;
    return t.coal * .85 / COAL_T * fz * fz * (sh.majLate && sh.majLate.kessel ? 1.1 : 1) * COAL_LV[st.maschine] * capFx(s, sh).coal * (st.mi === 3 ? .97 : 1);
  }
  const legCoal = (s, sh, G, k, fz) => G.legDist[k] * coalSm(s, sh, fz || fahrtF(s, sh)) * (1 + LADUNG / 2);
  // Schiffe im Fahrplan einer Linie (auch solche in der Werft: Ihre Abfahrten fallen aus oder übernimmt das Reserveschiff)
  function lineShips(s, r) { return s.ships.filter(sh => sh.line === r.id && !sh.laid && sh.ready <= s.m && !sh.museum && sh.id !== r.res && !(sh.charter >= s.m)); }
  const usable = (s, sh) => !inDock(s, sh) && !offDuty(s, sh) && !detained(s, sh) && !(sh.charter >= s.m) && !sh.laid && !sh.museum;
  function lineTT(s, r, G) {
    const ships = lineShips(s, r); let P = 0, ref = null;
    for (const sh of ships) { const c = shipCycle(s, sh, G); if (c > P) { P = c; ref = sh; } }
    P *= 1 + BUF[r.buf || 0];
    const n = ships.length;
    return { ships, P, n, H: n ? P / n : 0, ref, short: n > 0 && P < 1 };
  }
  // Zeitpunkte im Umlauf (ab Abfahrt in Hafen 0), zu denen ein Schiff aus Hafen i in Richtung d abfährt – für Takt und Lücken
  function lineOffsets(s, G, P, ref) {
    const ld = G.legDist.map((_, k) => legDays(s, ref, G, k, fahrtF(s, ref))), sea = ld.reduce((a, b) => a + b, 0);
    const endW = Math.max(G.endLiege, (P - 2 * sea - 2 * (G.n - 2) * G.stopT) / 2), off = { "0+": 0 };
    let t = 0;
    for (let i = 1; i < G.n; i++) { t += ld[i - 1]; if (i < G.n - 1) { t += G.stopT; off[i + "+"] = t; } }
    t += endW; off[(G.n - 1) + "-"] = t;
    for (let i = G.n - 2; i >= 1; i--) { t += ld[i] + G.stopT; off[i + "-"] = t; }
    return off;
  }
  const dkey = (i, d) => i + (d > 0 ? "+" : "-");
  // nächste geplante Abfahrt eines Schiffs: Hafen, Richtung, Zeit
  function nextPlan(G, v) {
    if (v.st === "see") { const d = isEnd(G, v.to) ? (v.to === 0 ? 1 : -1) : v.d; return { i: v.to, d, t: v.pln }; }
    return { i: v.i, d: v.d, t: v.pl };
  }
  function phaseOf(G, v, off, P) { const np = nextPlan(G, v); return mod(np.t - (off[dkey(np.i, np.d)] || 0), P); }
  // Wartezeit am Ende so, dass jedes Schiff den Takt der Linie fährt
  function endWait(s, sh, G, P) { return Math.max(G.endLiege, (P - 2 * seaDays(s, sh, G, fahrtF(s, sh)) - 2 * (G.n - 2) * G.stopT) / 2); }

  // Ein Schiff reiht sich in den Takt seiner Linie ein (neu, nach Werft, Linienwechsel, Überführung)
  function joinLine(s, sh, r, G, tReady, end) {
    const v = sh.v, tt = lineTT(s, r, G);
    v.r = r.id; v.i = end; v.d = end === 0 ? 1 : -1; v.p = G.ports[end]; v.st = "hafen"; v.rdy = Math.max(v.rdy || 0, tReady); v.res = false; v.knDec = null; v.knAsk = false;
    const others = tt.ships.filter(x => x !== sh && x.v && x.v.r === r.id && (x.v.st === "hafen" || x.v.st === "see"));
    if (tt.short || !others.length || !(tt.P > 0)) { v.pl = tReady; return; }
    const P = tt.P, off = lineOffsets(s, G, P, tt.ref), phs = others.map(x => phaseOf(G, x.v, off, P)).sort((a, b) => a - b);
    const gaps = phs.map((p, k) => { const q = k + 1 < phs.length ? phs[k + 1] : phs[0] + P; return { mid: mod((p + q) / 2, P), len: q - p }; });
    const need = 2 * .8 * P / (others.length + 1), my = off[dkey(end, v.d)] || 0;
    let cand = gaps.filter(g => g.len >= need); if (!cand.length) cand = [gaps.slice().sort((a, b) => b.len - a.len)[0]];
    v.pl = Math.min(...cand.map(g => tReady + mod(g.mid + my - tReady, P)));
  }
  // Takt neu verteilen, wenn die Abstände deutlich schief sind: Schiffe warten länger, keines fährt früher als geplant
  function respace(s, r) {
    const G = lineGeo(s, r); if (!G) return; const tt = lineTT(s, r, G); if (tt.short || tt.n < 2) return;
    const P = tt.P, off = lineOffsets(s, G, P, tt.ref);
    const it = tt.ships.filter(x => x.v && x.v.r === r.id && !x.v.res && (x.v.st === "hafen" || x.v.st === "see")).map(x => ({ x, ph: phaseOf(G, x.v, off, P) })).sort((a, b) => a.ph - b.ph);
    const n = it.length; if (n < 2) return;
    const H = P / n; let maxGap = 0; it.forEach((a, k) => { const q = k + 1 < n ? it[k + 1].ph : it[0].ph + P; maxGap = Math.max(maxGap, q - a.ph); });
    if (maxGap < 1.5 * H) return;
    let best = null;
    for (let o = 0; o < n; o++) {
      const u = []; for (let k = 0; k < n; k++) u.push(it[(o + k) % n].ph + (o + k >= n ? P : 0));
      let base = -Infinity; u.forEach((x, k) => { base = Math.max(base, x - k * H); });
      const tot = u.reduce((a, x, k) => a + base + k * H - x, 0);
      if (!best || tot < best.tot) best = { o, u, base, tot };
    }
    best.u.forEach((x, k) => { const sh = best.base + k * H - x, v = it[(best.o + k) % n].x.v; if (sh > .01) { if (v.st === "see") v.pln += sh; else v.pl += sh; } });
  }
  // Bekohlung: Hafenpreis, Verträge, Hauszeche, Regeln
  const coalPortPrice = (s, p) => COAL_T * TIER[portTier(p)] * s.coal;
  function hzRegion(s, p) {
    const reg = PORTS[p] && PORTS[p].reg;
    if ((s.country || "de") === "gb") return reg === "Britische Inseln" || ["lon", "grv", "til", "dov", "por", "ryd", "ply", "har", "hul", "lei", "sou"].includes(p);
    return reg === "Deutsche Nordsee" || reg === "Deutsche Ostsee" || ["rot", "ams", "hoe", "ant"].includes(p);
  }
  // Kohlelager (v5.1.1): im Heimathafen bunkern die Schiffe aus dem Lager zum Einstandspreis, ist es leer, am Kai mit Aufschlag; auswärts zum Hafenpreis
  const LAGER_CAP = 3000, KAI = 1.15, LAGERGELD = .1, RUECKNAHME = .8;
  const lagerValue = s => (s.lager && s.lager.v > 0 ? s.lager.v : 0);
  const lagerPrice = s => coalPortPrice(s, s.home || "ham");
  function buyCoal(s, sh, p, tons, emergency) {
    const cur = s.cur, home = p === (s.home || "ham"), mkt = coalPortPrice(s, p) * (emergency ? NOTKOHLE : home ? KAI : 1);
    let left = tons, cost = 0;
    if (home && !emergency && s.lager && s.lager.t > 0) {
      const L = s.lager, take = Math.min(left, L.t), val = L.v * take / L.t;
      L.t -= take; L.v -= val; if (L.t < 1e-6) { L.t = 0; L.v = 0; } left -= take;
      cur.lagT = (cur.lagT || 0) + take; expense(s, "Kohle aus dem Lager", val); cost += val;
    }
    if (left > 0) { const c = left * mkt; expense(s, "Bekohlung " + PORTS[p].name + (home && !emergency ? " (Kai)" : ""), c); cost += c; if (home && !emergency) cur.kaiT = (cur.kaiT || 0) + left; }
    cur.cbT = (cur.cbT || 0) + tons; cur.cbM = (cur.cbM || 0) + cost;
    const cp = cur.cp || (cur.cp = {}); cp[p] = (cp[p] || 0) + tons;
    const sc = sh.cur || (sh.cur = { pax: 0, cap: 0, rev: 0, cost: 0 }); sc.coal = (sc.coal || 0) + cost; sc.cost = (sc.cost || 0) + cost;
    const r = routeOf(s, sh); if (r && r.cur) { r.cur.coal = (r.cur.coal || 0) + cost; r.cur.cost = (r.cur.cost || 0) + cost; }
    return cost;
  }
  // Kohle ins Lager kaufen: Heimathafenpreis mal Kohlepreis, die Hauszeche liefert ihren Anteil 20 % billiger. Zählt nicht als Kosten, erst beim Bunkern.
  function lagerQuote(s, tons) {
    const L = s.lager, room = Math.max(0, L.cap - L.t), t = Math.max(0, Math.min(tons, room)), mkt = lagerPrice(s);
    let hz = 0; if (s.bo && s.bo.hz && !(s.bo.hzStop >= s.m)) { const capT = BO_HZ_CAP * BO[s.bo.hz].g / 12 * boGrow(s) / COAL_T; hz = Math.min(t, Math.max(0, capT - ((s.cur && s.cur.hzUsed) || 0))); }
    return { t, room, hz, mkt, cost: hz * mkt * (1 - BO_HZ) + (t - hz) * mkt };
  }
  function lagerBuy(s, tons) {
    if (!s.lager) return "Kein Kohlelager.";
    const q = lagerQuote(s, tons); if (q.t < 1) return q.room < 1 ? "Das Lager ist voll." : "Bitte eine Menge angeben.";
    if (q.cost > Math.max(0, s.cash)) return "Dafür reicht das Geld in der Kasse nicht.";
    const L = s.lager, cur = s.cur; s.cash -= q.cost; L.t += q.t; L.v += q.cost;
    if (q.hz) { cur.hzUsed = (cur.hzUsed || 0) + q.hz; cur.hzSave = (cur.hzSave || 0) + q.hz * q.mkt * BO_HZ; }
    cur.lagKauf = (cur.lagKauf || 0) + q.cost; cur.lagKaufT = (cur.lagKaufT || 0) + q.t;
    return null;
  }
  // Lieferung ins Lager (Verträge); was nicht passt, nimmt der Händler zu 80 % zurück
  function lagerDeliver(s, k, add) {
    const L = s.lager, fit = Math.min(k.qty, Math.max(0, L.cap - L.t)), over = Math.max(0, k.qty - fit);
    s.cash -= fit * k.pt; L.t += fit; L.v += fit * k.pt;
    if (s.cur) { s.cur.lagKauf = (s.cur.lagKauf || 0) + fit * k.pt; s.cur.lagKaufT = (s.cur.lagKaufT || 0) + fit; }
    if (over > .5) { const loss = over * k.pt * (1 - RUECKNAHME); if (add) { add("Rücknahme Kohle", loss); s.cash -= loss; } else expense(s, "Rücknahme Kohle", loss); }
    return over;
  }
  // für wie viele Tage reicht der Vorrat (nach dem Verbrauch aus Lager und Kai im Heimathafen der letzten drei Monate)
  function lagerDays(s) { const u = (s.lager.use || []).slice(-3), cur = s.cur ? (s.cur.lagT || 0) + (s.cur.kaiT || 0) : 0, days = (s.cur && s.cur.days) || 0; const tot = u.reduce((a, b) => a + b, 0) + cur, d = u.length * 30.4 + days; return tot > 0 && d > 0 ? s.lager.t / (tot / d) : null; }
  // Reserve beim Bunkern (v5.1.1): deckt einen Sturmtag im rauesten Seegebiet der Linie (Nordsee rund 25 %, Atlantik 35 %, Küste 15 %)
  function bunkRes(G) { if (G.bRes != null) return G.bRes; let m = 0; for (const A of G.legAreas) for (const a in A) if (WX[a]) m = Math.max(m, WX[a].coal); return (G.bRes = .1 + m); }
  // Kohle bis zum Hafen „target“ entlang des Umlaufs (mit Wenden an den Enden)
  function coalUntil(s, sh, G, from, d, target) {
    let i = from, dd = d, sum = 0;
    for (let n = 0; n < 2 * G.n; n++) { const k = legOf(i, dd); sum += legCoal(s, sh, G, k); i += dd; if (isEnd(G, i)) dd = -dd; if (i === target) break; }
    return sum;
  }
  // Kohlestreik (v5.1.1): wer in einem betroffenen Land am Kai bunkert, wartet ein bis zwei Tage
  function coalStrikeAt(s, p) { const k = s.coalStrike; if (!k || k.until < s.m) return false; const reg = PORTS[p] && PORTS[p].reg; return k.c === "gb" ? reg === "Britische Inseln" || ["lon", "grv", "til", "dov", "por", "ryd", "ply", "har", "hul", "lei", "sou"].includes(p) : reg === "Deutsche Nordsee" || reg === "Deutsche Ostsee"; }
  // Bekohlen im Hafen: im Heimathafen der Linie voll, sonst bis dorthin mit Reserve; Kosten, Dauer in Tagen
  function bunkerAt(s, sh, G, X, d) {
    const v = sh.v, cap = coalCap(sh), r = routeOf(s, sh), res = bunkRes(G);
    // mit „Volldampf zum Aufholen“ reicht die Kohle für die nächste Strecke auch bei Volldampf
    const next = legCoal(s, sh, G, legOf(X, d), r && r.auf ? Math.max(fahrtF(s, sh), FAHRT.voll.f) : 0) * (1 + res);
    let target = X === G.homeIdx ? cap : coalUntil(s, sh, G, X, d, G.homeIdx) * (1 + res);
    target = Math.min(cap, Math.max(target, next));
    const buy = target - v.b;
    if (buy < .05) return 0;
    const p = G.ports[X], fromLager = p === (s.home || "ham") && s.lager ? Math.min(buy, s.lager.t) : 0;
    const cost = buyCoal(s, sh, p, buy, false);
    v.b += buy; v.bv += cost;
    let wait = 0; if (buy - fromLager > .5 && coalStrikeAt(s, p)) { wait = s.sim ? 1.5 : 1 + rnd(s); addWhy(v.wyP || (v.wyP = {}), "streik", wait); }
    return Math.max(1 / 12, buy / bunkRate(p)) + wait;
  }
  // Wert des Bunkervorrats (zum Einkaufspreis) – zählt zum Eigenkapital
  function bunkerValue(s) { let v = 0; for (const sh of s.ships) if (sh.v && sh.v.bv > 0) v += sh.v.bv; return v; }
  function burnCoal(s, sh, tons) {
    const v = sh.v, use = Math.min(v.b, Math.max(0, tons)), val = v.b > 0 ? v.bv * use / v.b : 0;
    v.b -= use; v.bv -= val; const cur = s.cur; cur.cuT = (cur.cuT || 0) + use; cur.cuM = (cur.cuM || 0) + val;
    return val;
  }

  // Wetter, Nebel und Pannen auf einer Teilstrecke. det = ohne Zufall (Vorschau): Erwartungswerte
  function wxLeg(s, sh, G, k, days, mo, det) {
    const areas = G.legAreas[k], tot = G.legDist[k] || 1, f = diffOf(s).delay * modWx(s, G), win = STORM_MO.includes(mo), sf = seaF(TYPES[sh.type]);
    let extra = 0, storm = 0, coalX = 0, ice = 0;
    for (const a in areas) {
      const w = WX[a]; if (!w) continue; const dd = days * areas[a] / tot;
      let p = w.p[win ? 0 : 1] * f;
      if (a === "tropic" && HURR_MO.includes(mo) && G.ports.some(x => CARIB.includes(x))) p = .08 * f;
      p *= sf; const n = det ? dd * p : poisson(s, dd * p); storm += n; extra += n * w.eff; coalX += n * w.coal;
      if (w.ice && ICE_MO.includes(mo)) { const ni = det ? dd * w.ice * f : poisson(s, dd * w.ice * f); extra += ni * w.iceEff; ice += ni * w.iceEff; coalX += ni * .1; }
    }
    let fog = 0, pf = 0;
    for (const a in areas) if (FOG[a]) pf = Math.max(pf, FOG[a][(a === "channel" ? FOGCH_MO : STORM_MO).includes(mo) ? 0 : 1] * f);
    fog = det ? pf * 5 / 24 : (rnd(s) < pf ? (2 + rnd(s) * 6) / 24 : 0);
    const st = staff(s), q = Math.min(.5, BRK * (1 + 3 * Math.pow(1 - sh.cond / 100, 2)) * BRK_LV[st.maschine] * BRK_MAINT[sh.maint] * (sh.majLate && sh.majLate.kessel ? 1.5 : 1) * diffOf(s).delay);
    const brk = det ? q * 1.25 : (rnd(s) < q ? .5 + rnd(s) * 1.5 : 0);
    return { extra, storm, coalX, fog, brk, ice };
  }
  function modWx(s, G) { let f = 1; for (const md of s.mods) if (md.key === "wx" && md.until >= s.m && (md.line === "*" || (md.area && G.legAreas.some(a => a[md.area])))) f *= md.f; return f; }
  // erwarteter Anteil verspäteter Fahrten für ein durchschnittliches Schiff (12 Knoten), gleiche Regel wie bei Ihnen
  function wxLate(s, G, mo) {
    let late = 0; const f = diffOf(s).delay, win = STORM_MO.includes(mo);
    for (let k = 0; k < G.legDist.length; k++) {
      const days = G.legDist[k] / (12 * 24), areas = G.legAreas[k], tot = G.legDist[k] || 1;
      let lam = 0, effW = 0;
      for (const a in areas) { const w = WX[a]; if (!w) continue; const l = days * areas[a] / tot * (w.p[win ? 0 : 1] + (w.ice && ICE_MO.includes(mo) ? w.ice : 0)) * f; lam += l; effW += l * w.eff; }
      const eff = lam > 0 ? effW / lam : .5, kmax = Math.floor(lateTol(days) / Math.max(.05, eff) + 1e-9);
      let pOk = 0, term = Math.exp(-lam); for (let n = 0; n <= kmax; n++) { pOk += term; term *= lam / (n + 1); }
      let pf = 0; for (const a in areas) if (FOG[a]) pf = Math.max(pf, FOG[a][(a === "channel" ? FOGCH_MO : STORM_MO).includes(mo) ? 0 : 1] * f);
      late = Math.max(late, 1 - pOk + (days < 1 ? pf * .5 : 0) + BRK * f);
    }
    return Math.min(.8, late);
  }
  function rivalPk(s, k, G, mo) { const key = mo + "|" + (s.diff || "normal"); if (G.wxLk !== key) { G.wxLk = key; G.wxL = wxLate(s, G, mo); } const st = s.bo && s.bo.co && s.bo.co[k] && s.bo.co[k].strike === s.m ? .15 : 0; return clamp(RIV_PK[k] - .6 * G.wxL - st, .3, .99); } // v5.1.1: Streik an Bord beim Rivalen
  // Pünktlichkeit im Nutzen der Fahrgäste
  function pkSeg(info) { let v = 0, n = 0; for (const k in PK_SEG) { const w = info.share[k] || 0; v += w * PK_SEG[k]; n += w; } return n ? v / n : .5; }
  function pkU(s, r, info, c, pkLine, expP) { const post = Object.values(s.contracts || {}).some(x => (x.a === r.a && x.b === r.b) || (x.a === r.b && x.b === r.a)) ? 1.5 : 1; return W_PK * PK_CLS[c] * pkSeg(info) * post * (.6 * (pkLine - PK_REF) / .2 + .4 * (expP - 50) / 50); }
  function pkUpdate(s, r, ok, dt) { const a = 1 - Math.exp(-Math.max(.05, dt) / PK_MEM); r.pk = (r.pk == null ? .9 : r.pk) + (ok - (r.pk == null ? .9 : r.pk)) * a; }

  // Pausen und Fahrtenbuch
  function pauseReq(s, k, text, ship) { const P = s.pause || PAUSE_DEF; if (s.sim) return; if (k === "late" ? P.late > 0 : P[k]) (s.pauseQ = s.pauseQ || []).push({ k, text, ship }); }
  function logVoyage(s, rec) { if (s.sim) return; const F = s.fahrten || (s.fahrten = []); F.unshift(rec); if (F.length > 40) F.length = 40; }

  function pkStart(s, r) { const G = lineGeo(s, r); return G ? clamp(.97 - .8 * wxLate(s, G, cal(s.m).mo), .5, .97) : .9; }
  // Einstellungen (v5.0)
  // bis v5.1: Bekohlungsregeln (seit v5.1.1 ohne Wirkung, für alte Aufrufe)
  function setBunkRule() { return null; }
  function setShipBunk() { }
  function setBuffer(s, id, lvl) { const r = s.routes.find(x => x.id === id); if (!r) return; r.buf = clamp(lvl | 0, 0, BUF.length - 1); }
  function setCatchUp(s, id, on) { const r = s.routes.find(x => x.id === id); if (r) r.auf = !!on; }
  function markShip(s, id, on) { const sh = s.ships.find(x => x.id === id); if (sh) { if (on) sh.mark = true; else delete sh.mark; } }
  function setPause(s, k, v) { s.pause = Object.assign({}, PAUSE_DEF, s.pause || {}); if (k === "late") s.pause.late = clamp(+v || 0, 0, 9); else if (k in PAUSE_DEF) s.pause[k] = !!v; }
  function setReserve(s, id, shipId) {
    const r = s.routes.find(x => x.id === id); if (!r) return "Linie unbekannt.";
    const old = r.res && s.ships.find(x => x.id === r.res);
    if (!shipId) { r.res = null; if (old && old.v) { old.v.res = false; if (old.v.st === "res") { old.v.st = "hafen"; old.v.r = null; } } return null; }
    const sh = s.ships.find(x => x.id === shipId); if (!sh) return "Schiff unbekannt.";
    if (sh.ready > s.m) return "Das Schiff ist noch im Bau.";
    const why = canServe(s, sh.type, r.a, r.b, r.cruise, r.stops); if (why) return why;
    if (old && old !== sh) setReserve(s, id, null);
    for (const x of s.routes) if (x !== r && x.res === sh.id) x.res = null;
    sh.line = r.id; sh.laid = false; r.res = sh.id;
    if (sh.v) { if (sh.v.st === "see") sh.v.res = true; else sh.v.r = null; }
    return null;
  }
  function setDifficulty(s, d) {
    if (!DIFF[d]) return "Unbekannter Schwierigkeitsgrad.";
    if (s.diffSet) return "Der Schwierigkeitsgrad lässt sich nur einmal umstellen.";
    if (d === (s.diff || "normal")) return null;
    s.diff = d; s.diffSet = true;
    s.log.unshift({ m: s.m, head: "Schwierigkeitsgrad: " + DIFF[d].name, text: "Ab sofort gelten Rivalen, Verspätungen, Unglücke und Zinsen für „" + DIFF[d].name + "“. Der Gründungskredit bleibt, wie er ist.", kind: "own" });
    return null;
  }
  // Werft: Serien und Takt je Schiffstyp. Von jedem Typ liefert eine Werft höchstens ein Schiff je Abstand.
  const yardGap = t => Math.max(1, Math.round((t.build || 3) / 3));
  const yardBuild = (t, brandt) => Math.max(2, (t.build || 3) - (brandt ? 1 : 0));
  function yardPlan(s, type, brandt, n) {
    const t = TYPES[type], gap = yardGap(t); let last = -Infinity;
    for (const sh of s.ships) if (sh.type === type && !!sh.brandt === !!brandt && sh.ready > s.m) last = Math.max(last, sh.ready);
    const out = []; let m = Math.max(s.m + yardBuild(t, brandt), last + gap);
    for (let i = 0; i < n; i++) { out.push(m); m += gap; }
    return out;
  }
  const seriesDisc = (type, n) => TYPES[type] && TYPES[type].design ? 0 : Math.min(.1, .02 * Math.max(0, n - 1));
  // Preise je Schiff einer Bestellung (eigene Entwürfe werden mit jedem Schiff billiger, sonst Serienrabatt)
  function orderPrices(s, type, brandt, n, eqSel) {
    const t = TYPES[type], eq = (eqSel || []).reduce((a, k) => a + factoryEqCost(s, type, k), 0), disc = seriesDisc(type, n), out = [];
    for (let i = 0; i < n; i++) {
      let base;
      if (t.design && s.designs && s.designs[t.design]) { const d = s.discount && s.discount.until >= s.m ? s.discount.f : 1; base = Math.round(P(s, t) * d * (1 - Math.min(.2, .08 * (s.designs[t.design].built + i))) / 1000) * 1000; if (brandt) base = Math.round(base * 1.12 / 1000) * 1000; }
      else base = brandt ? brandtPrice(s, type) : newPrice(s, type);
      out.push(Math.round(base * (1 - disc) / 1000) * 1000 + eq);
    }
    return out;
  }
  function orderInfo(s, type, brandt, n, eqSel) { n = clamp(n | 0 || 1, 1, 10); const prices = orderPrices(s, type, brandt, n, eqSel), plan = yardPlan(s, type, brandt, n); return { n, prices, total: prices.reduce((a, b) => a + b, 0), plan, gap: yardGap(TYPES[type]), disc: seriesDisc(type, n) }; }
  // Abbestellen, solange der Bau noch nicht begonnen hat (15 % Gebühr)
  function cancelInfo(s, sh) { const t = TYPES[sh.type]; if (!sh || sh.ready <= s.m) return null; const start = sh.ready - yardBuild(t, sh.brandt); const fee = Math.round((sh.paid || 0) * .15 / 100) * 100; return { can: start > s.m, start, fee }; }
  function cancelOrder(s, id) {
    const sh = s.ships.find(x => x.id === id); const ci = cancelInfo(s, sh); if (!ci) return "Das Schiff ist schon abgeliefert.";
    if (!ci.can) return "Der Bau hat schon begonnen – abbestellen geht nicht mehr.";
    let back = (sh.paid || 0) - ci.fee; for (const l of s.loans.filter(l => l.ship === id)) back -= l.out;
    s.loans = s.loans.filter(l => l.ship !== id); s.cash += back; s.ships = s.ships.filter(x => x !== sh);
    { const c = caps(s).find(x => x.ship === id); if (c) s.caps = caps(s).filter(x => x !== c); }
    s.log.unshift({ m: s.m, head: "Neubau „" + sh.name + "“ abbestellt", text: "Die Werft behält " + fmt(ci.fee) + " Mark. " + (back >= 0 ? "Zurück in die Kasse: " + fmt(back) + " Mark." : "Die Restschuld von " + fmt(-back) + " Mark wird fällig."), kind: "own", img: "wf_buero" });
    return null;
  }
  // Monatswerte einer Linie
  const newRcur = () => ({ pax: 0, cap: 0, rev: 0, cost: 0, fixed: 0, D: 0, cp: [0, 0, 0], cc: [0, 0, 0], cx: [0, 0, 0], dem: [0, 0, 0], ships: 0, rp: {}, legPax: 0, dep: 0, late: 0, arr: 0, lateA: 0, lateSum: 0, comp: 0, cancel: 0, wag: 0, wagD: 0, wagRev: 0 });
  const shipCur = sh => sh.cur || (sh.cur = { pax: 0, cap: 0, rev: 0, cost: 0 });
  const odKey = (i, j) => i + ">" + j;
  const mainRivalK = (s, r, info) => { const rv = rivalsOf(s, r, info); return rv.length ? rv.slice().sort((a, b) => b.w - a.w)[0].k : null; };
  function lostToRival(s, r, G, n) { if (!(n > 0)) return; const k = mainRivalK(s, r, G.info); if (k && r.cur) r.cur.rp[k] = (r.cur.rp[k] || 0) + n; }

  // Nachfrage eines Tages: Wer bei Ihnen bucht, wartet auf Ihre nächste Abfahrt in seine Richtung.
  function demandDay(s, r, G, tt, ctx) {
    const { mo, fd, pid, st, myEx, kuX, odCount, T0 } = ctx, info = G.info, acc = r.cur;
    const avail = tt.ships.filter(sh => usable(s, sh) && sh.v && sh.v.r === r.id);
    const capC = [0, 0, 0], kSw = [0, 0, 0]; let capT = 0, spdW = 0, comW = 0, firstB = 0;
    const legsPer = tt.P > 0 ? (G.cruise ? 1 : 2) / tt.P : 0;
    for (const sh of avail) {
      const fz = fahrtF(s, sh), t = TYPES[sh.type], c = t.sb.map(x => x * legsPer), ct = c[0] + c[1] + c[2], cf = capFx(s, sh);
      for (let i = 0; i < 3; i++) { capC[i] += c[i]; if (c[i]) { const q = kqEff(s, sh, i); kSw[i] += c[i] * (Math.min(100, kScore(s, q, i) + (i === 0 && s.chef && s.chef.ship === sh.id ? 20 : 0)) - 50); } }
      capT += ct; spdW += shipSpd(s, sh, fz) * (1 + FAHRT_SPD * (fz - 1)) / fz * ct; comW += (t.comfort * (0.7 + 0.3 * sh.cond / 100) + cf.com) * ct; if (cf.first) firstB = Math.max(firstB, cf.first);
    }
    if (avail.length) r.used = true;
    const kSc = [0, 1, 2].map(o => 50 + (capC[o] ? kSw[o] / capC[o] : 0)), meal = G.meal ? 1 : 0;
    const nLegs = G.legDist.length, mainRef = info.refC, compMod = modFactor(s, r, info, "comp");
    const myBonusBase = ((r.b === "ny" || r.a === "ny") && s.stats.band ? .3 : 0) + mkBonus(s, r, info);
    const spd0 = capT ? spdW / capT : 0, com = capT ? comW / capT + SVC_LV[st.service] : 0;
    const pkLine = r.pk == null ? .9 : r.pk, expP = s.exp && s.exp.p != null ? s.exp.p : 50, rf = diffOf(s).riv;
    const postF = Object.values(s.contracts || {}).some(x => (x.a === r.a && x.b === r.b) || (x.a === r.b && x.b === r.a)) ? 1.5 : 1, myPkT = .6 * (pkLine - PK_REF) / .2 + .4 * (expP - 50) / 50;
    const q0 = r.q || (r.q = {}), first = !r.qi && !tt.short && tt.n > 0, qa = r.qa = {}, tolD = G.cruise || !tt.ref ? LATE_OK : lateTol(seaDays(s, tt.ref, G, 1));
    let Dsum = 0;
    // Takt (v5.1.1): Mit mehreren Schiffen fährt die Linie öfter. Die Wartezeit sinkt gegenüber einem Schiff allein, das zählt im Nutzen
    // (Kaufleute und Pendler stark, Ausflügler kaum), und ein dichter Takt weckt auf Pendler- und Bahnlinien zusätzliche Nachfrage.
    const nT = G.cruise ? 1 : avail.length, lnT = nT > 1 ? Math.log(nT) : 0, taktH = nT > 1 ? Math.log2(nT) : 0;
    for (const od of G.ods) {
      const oi = od.info, w = oi.w, cs = oi.comp, a = G.ports[od.i], b = G.ports[od.j], hops = od.j - od.i;
      let along = 0; for (const k of od.legs) along += G.legDist[k];
      const taktD = taktH ? 1 + TAKT_DEM * ((oi.share.local || 0) + (oi.share.transit || 0)) * 2 * (1 - Math.pow(.5, taktH)) : 1;
      const D = demandNow(s, r, oi, mo) * fd / (odCount[pairKey(a, b) + (G.cruise ? "c" : "")] || 1) * (info.multi && hops < nLegs ? .6 : 1) * taktD; Dsum += D;
      const compDeps = compDepsOf(s, r, oi);
      const holder = info.multi ? ((r.odRiv = r.odRiv || {})[od.i + "-" + od.j] = r.odRiv[od.i + "-" + od.j] || {}) : r;
      const rv = rivalsOf(s, r, oi, holder).map(x => Object.assign({ k: x.k, w: x.w }, rivalStats(s, r, oi, x.k)));
      const base = (speed, comfort, repu, c) => w.s * 4 * (speed / cs.speed - 1) + w.c * CLS_WC[c] * .5 * (comfort - 3) + w.r * (repu - 50) / 50;
      const price = [0, 1, 2].map(o => r.price[o] * (oi.refC[o] / (mainRef[o] || oi.refC[o] || 1)));
      const spd = spd0 * (oi.dist / Math.max(oi.dist, along)) * Math.pow(.94, hops - 1);
      const want = [0, 0, 0], pkW = W_PK * pkSeg(oi) * postF, rvPk = rv.map(x => .6 * (rivalPk(s, x.k, G, mo) - PK_REF) / .2 + .4 * (clamp(50 + (RIV_PK[x.k] - PK_REF) * 300, 5, 95) - 50) / 50);
      for (let c = 0; c < 3; c++) {
        const Dc = D * oi.mix[c]; if (Dc <= 0) continue;
        acc.dem[c] += Dc;
        const ccBase = compDeps * oi.compSeats * (G.cruise ? 1 : 2) * fd * oi.mix[c];
        let them = 0; const themK = [];
        for (let xi = 0; xi < rv.length; xi++) { const x = rv[xi], u = w.p * CLS_WP[c] * (1 - x.pf * compMod) + base(x.spd, x.com, x.rep, c) + x.eu + pkW * PK_CLS[c] * rvPk[xi]; const v = ccBase * x.w * x.capF * rf * Math.exp(u); them += v; themK.push([x.k, v]); }
        let my = 0, bo = -1;
        if (capT > 0) {
          const bonus = myBonusBase + expU(oi, myEx) + pkW * PK_CLS[c] * myPkT + (lnT ? TAKT_W * impOf(oi) * lnT : 0);
          let best = -Infinity;
          for (let o = 0; o < 3; o++) { if (capC[o] <= 0) continue; const u = w.p * CLS_WP[c] * (1 - price[o] / (oi.refC[c] * pid)) + base(spd, com, s.rep, c) - (o > c ? (.7 + 1.0 * CLS_T(oi.dist)) * (o - c) : 0) + bonus + (c === 0 ? firstB : 0) + (meal ? KU_W * KU_CLS[c] * (.5 * (kSc[o] - 50) / 50 + .5 * kuX) : 0); if (u > best) { best = u; bo = o; } }
          if (bo >= 0) my = capC[bo] * Math.exp(best);
        }
        const den = my + them + KAPPA * Dc;
        if (bo >= 0) want[bo] += Dc * my / den;
        for (const [k, v] of themK) acc.rp[k] = (acc.rp[k] || 0) + Dc * v / den;
      }
      // in die Warteschlangen je Richtung; ist die nächste Abfahrt überfällig, buchen Neue lieber woanders und Wartende springen ab
      const dirs = G.cruise ? [["c", 0, 1, 1]] : [[odKey(od.i, od.j), od.i, 1, .5], [odKey(od.j, od.i), od.j, -1, .5]];
      let imp = 0, iw = 0; for (const k in IMPAT) { const x = oi.share[k] || 0; imp += x * IMPAT[k]; iw += x; } imp = iw ? imp / iw : .05;
      // Während Ihre Fahrgäste warten, fahren die Rivalen ab und nehmen einen Teil mit – soweit Ihre nächste Abfahrt später kommt als die übliche der Rivalen
      const hR = compDeps > 0 ? 30.4 / compDeps : 0, skR = SKIM * imp * rf / Math.max(1, hR);
      // überfällig erst, wenn die Abfahrt mehr als die übliche Verspätung der Linie hinter dem Plan liegt (lange Linien: bis 15 % der Seezeit)
      for (const [key, from, d, part] of dirs) {
        const pool = q0[key] || (q0[key] = [0, 0, 0]);
        const nx = r.nx ? r.nx[dkey(from, d)] : undefined, over = !tt.short && (nx == null || T0 > nx + tolD);
        const w = nx == null ? tt.H : Math.max(0, nx - T0), skim = tt.short || !hR || w <= hR / 2 ? 0 : 1 - Math.exp(-skR * (1 - hR / 2 / w));
        let lost = 0;
        for (let c = 0; c < 3; c++) {
          let add = want[c] * part;
          if (skim > 0 && pool[c] > 0) { const l = pool[c] * skim; pool[c] -= l; lost += l; }
          if (over) { const l = pool[c] * (1 - Math.exp(-imp * diffOf(s).delay)) + add * .5; pool[c] -= pool[c] * (1 - Math.exp(-imp * diffOf(s).delay)); add *= .5; lost += l; }
          if (first) pool[c] += add * Math.max(0, tt.H / 2 - 1);
          pool[c] += add; qa[key] = (qa[key] || 0) + add;
        }
        lostToRival(s, r, G, lost);
      }
    }
    if (first) r.qi = 1;
    acc.D += Dsum; acc.ships = Math.max(acc.ships, avail.length);
    return { capC, kSc };
  }

  // Fahrpreis, Verpflegung je Seetag und Küchenwerte einer Fahrgast-Strecke für ein Schiff
  function fareOf(s, r, G, odi, odj, o) { const oi = odInfo(G, odi, odj); return r.price[o] * (oi.refC[o] / (G.info.refC[o] || oi.refC[o] || 1)); }
  function odInfo(G, i, j) { const a = Math.min(i, j), b = Math.max(i, j); const od = G.ods.find(x => x.i === a && x.j === b); return od ? od.info : G.info; }
  function caterDay(s, sh, G, odi, odj, o) {
    if (!G.meal) return 0;
    const oi = odInfo(G, odi, odj), a = Math.min(odi, odj), b = Math.max(odi, odj);
    let along = 0; for (let k = a; k < b; k++) along += G.legDist[k];
    const days = G.cruise ? 2 * legDays(s, sh, G, 0, 1) + 2 * G.endLiege : Math.max(.05, along / (shipSpd(s, sh, 1) * 24));
    return oi.caterC[o] * kCostF(s, kqEff(s, sh, o), o) * s.wage / days;
  }
  // Einsteigen bei der Abfahrt aus Hafen X in Richtung d: Wer Platz findet, fährt mit, der Rest fährt mit der Konkurrenz
  function boardAt(s, sh, r, G, X, d, t, fzP) {
    const v = sh.v, T = TYPES[sh.type], acc = r.cur, cur = s.cur, sc = shipCur(sh), q0 = r.q || (r.q = {});
    const onb = [0, 0, 0]; for (const g of v.pax) for (let c = 0; c < 3; c++) onb[c] += g.n[c];
    const free = T.sb.map((x, c) => Math.max(0, x - onb[c]));
    const keys = G.cruise ? (X === 0 ? [["c", 0]] : []) : [];
    if (!G.cruise) for (let j = X + d; j >= 0 && j < G.n; j += d) keys.push([odKey(X, j), j]);
    const tot = [0, 0, 0]; for (const [k] of keys) { const p = q0[k]; if (p) for (let c = 0; c < 3; c++) tot[c] += p[c]; }
    const f = tot.map((x, c) => x > free[c] ? free[c] / x : 1), pen = [0, 1, 2].map(o => G.cruise ? 0 : SEA_REV * Math.max(0, 1 / fzP - 1) * (o === 0 ? 2 : 1));
    let rev = 0, n = 0, lost = 0;
    const kSc = [0, 1, 2].map(o => Math.min(100, kScore(s, kqEff(s, sh, o), o) + (o === 0 && s.chef && s.chef.ship === sh.id ? 20 : 0)));
    for (const [k, j] of keys) {
      const p = q0[k]; if (!p) continue;
      const g = { j: G.cruise ? 0 : j, n: [0, 0, 0], f: [0, 0, 0], cr: [0, 0, 0], t0: t, cruise: G.cruise ? 1 : 0 };
      for (let c = 0; c < 3; c++) {
        const nb = p[c] * f[c]; lost += p[c] - nb; acc.cx[c] += p[c] - nb; p[c] = 0; if (!(nb > 0)) continue;
        const fare = fareOf(s, r, G, X, G.cruise ? 1 : j, c) * (1 - pen[c]) * (r.zkF || 1);
        g.n[c] = nb; g.f[c] = fare; g.cr[c] = caterDay(s, sh, G, X, G.cruise ? 1 : j, c);
        rev += nb * fare; n += nb; acc.cp[c] += nb;
        if (G.meal && g.cr[c] > 0) { cur.kuS = (cur.kuS || 0) + nb * KU_CLS[c] * (kSc[c] - 50); cur.kuW = (cur.kuW || 0) + nb * KU_CLS[c]; if (kSc[c] >= 75) cur.fine = true; }
      }
      if (g.n[0] + g.n[1] + g.n[2] > 0) v.pax.push(g);
    }
    lostToRival(s, r, G, lost);
    for (let c = 0; c < 3; c++) acc.cc[c] += T.sb[c];
    if (rev) { s.cash += rev; cur.rev += rev; acc.rev += rev; sc.rev = (sc.rev || 0) + rev; }
    let aboardNow = 0; for (const g of v.pax) aboardNow += g.n[0] + g.n[1] + g.n[2];
    acc.pax += n; acc.cap += T.seats; acc.legPax += aboardNow; sc.pax += n; sc.cap += T.seats; s.stats.pax += n;
    return { rev, n, aboard: aboardNow };
  }
  // Aussteigen: Verpflegung für die tatsächlichen Tage an Bord, Entschädigung ab zwei Tagen Verspätung
  function alightAt(s, sh, r, G, Y, t, lateA) {
    const v = sh.v, acc = r.cur, sc = shipCur(sh); let cater = 0, comp = 0, n = 0;
    v.pax = v.pax.filter(g => {
      if (g.j !== Y || (g.cruise && Y !== 0)) return true;
      const days = Math.max(0, t - g.t0);
      for (let c = 0; c < 3; c++) { if (!g.n[c]) continue; cater += g.n[c] * g.cr[c] * days; n += g.n[c]; if (lateA > 2) comp += g.n[c] * g.f[c] * Math.min(.5, (lateA - 2) * CMP[c]); }
      return false;
    });
    if (cater > 0) { expense(s, "Verpflegung", cater); acc.cost += cater; sc.cost = (sc.cost || 0) + cater; sc.cater = (sc.cater || 0) + cater; sc.catC = sc.catC || [0, 0, 0]; }
    if (comp > 0) { expense(s, "Entschädigungen", comp); acc.comp += comp; acc.cost += comp; sc.cost = (sc.cost || 0) + comp; }
    return { cater, comp, n };
  }
  function legFee(s, sh, G, k) {
    const T = TYPES[sh.type], size = Math.max(.15, T.seats / 500), d = G.legDist[k], nL = G.legDist.length;
    // v5.1: kurze Fährfahrten (unter 40 sm) zahlen Anlegergebühren am kleineren Hafen, anteilig zur Strecke, statt der vollen Hafengebühr
    if (d < 40 && nL === 1) { const pier = Math.min(W.portVal(s.pm, G.ports[0], "fee"), W.portVal(s.pm, G.ports[1], "fee")); return (pier * Math.min(1, .25 + d / 40) + 60 * d / 100 * Math.sqrt(s.sizeM || 1)) * size * s.feeMult * s.wage; }
    return ((G.info.fee * Math.min(1, .25 + d / 40) + 60 * Math.min(1, d / 100) * Math.sqrt(s.sizeM || 1)) + (nL > 1 ? 120 * (nL - 1) / nL : 0)) * size * s.feeMult * s.wage * (G.info.ocean ? OCEAN_FEE : 1);
  }
  function legFreight(s, sh, G, k) {
    const T = TYPES[sh.type], d = G.legDist[k], pid = s.pidx; let x = 0;
    if (T.trajekt && G.info.rail) x += 250 * pid;
    if (T.cargo && !G.cruise) x += T.cargo * 1.9 * d * pid * s.konj * fareF(d);
    if (T.cars && !G.cruise && G.dist < 700) x += T.cars * (60 + 1.5 * d) * pid * s.konj;
    return x;
  }
  function postServed(s, r, sh, n) {
    for (const k of Object.keys(s.contracts || {})) { const c = s.contracts[k]; if (((r.a === c.a && r.b === c.b) || (r.a === c.b && r.b === c.a)) && TYPES[sh.type].speed * fahrtF(s, sh) >= (c.minSpeed || 0)) c.served = (c.served || 0) + (n == null ? 1 : n); }
  }
  const seaF = t => (t.rough || 1) * (t.sturdy ? .6 : 1);

  // Gründe für Verspätungen (v5.1.1): jede Fahrt merkt sich, woher ihre Verspätung kommt
  const WHY = { nebel: "Nebel", sturm: "Sturm", eis: "Eis", panne: "Panne", streik: "Streik", bekohlen: "Bekohlen", kohle: "Kohle knapp", folge: "Folgeverspätung", rettung: "Seenotrettung" };
  const WHY_TIP = { folge: "Pufferzeit", panne: "Maschinenpersonal und Wartung", bekohlen: "Kohle im Lager", kohle: "Kohle im Lager", sturm: "seefeste Schiffe und Pufferzeit", nebel: "Pufferzeit", eis: "Pufferzeit im Winter", streik: "gut bezahltes Personal" };
  function addWhy(o, k, d) { if (d > 0 && k) o[k] = (o[k] || 0) + d; return o; }
  function scaleWhy(o, late) { const sum = Object.values(o || {}).reduce((a, b) => a + b, 0), out = {}; if (!(late > .01)) return out; if (sum <= 1e-9) { out.folge = late; return out; } const f = late / sum; for (const k in o) if (o[k] > 0) out[k] = o[k] * f; if (sum < late * .999 && !(sum > 0)) out.folge = late; return out; }
  const blockEnd = (s, p) => Math.max((s.blk && s.blk[p]) || 0, s.blkAll || 0);
  const blockWhy = (s, p) => ((s.blk && s.blk[p]) || 0) >= (s.blkAll || 0) ? ((s.blkWhy && s.blkWhy[p]) || "streik") : "streik";
  // Verspätung einer Abfahrt im Hafen aufteilen: Folgeverspätung, Bekohlen, Aufenthalte durch Ereignisse, gesperrter Hafen
  function portWhy(s, v, tDep) {
    const late = Math.max(0, tDep - v.pl); if (late <= .01) return {};
    const o = {}; addWhy(o, "folge", Math.max(0, (v.rdy0 != null ? v.rdy0 : v.pl) - v.pl)); addWhy(o, "bekohlen", v.bkT || 0);
    for (const k in v.wyP || {}) addWhy(o, k, v.wyP[k]);
    if (v.blkT) addWhy(o, v.blkW || "streik", Math.max(0, v.blkT - Math.max(v.pl, v.rdy0 != null ? v.rdy0 : v.pl)));
    const sum = Object.values(o).reduce((a, b) => a + b, 0);
    if (sum < late) addWhy(o, "folge", late - sum);
    return scaleWhy(o, late);
  }
  // Gründe zum Anzeigen: [[Grund, Tage]] absteigend
  function lateWhy(s, sh) {
    const v = sh && sh.v; if (!v) return [];
    let o = {};
    if (v.st === "see") { const late = (v.eta || 0) - (v.pa || 0); if (late > .05) { const x = Object.assign({}, v.why || {}); for (const k in v.wyS || {}) addWhy(x, k, v.wyS[k]); o = scaleWhy(x, late); } }
    else if (v.st === "hafen" && v.pl != null) { const exp = Math.max(v.pl, v.rdy || 0, blockEnd(s, v.p)); if (blockEnd(s, v.p) > Math.max(v.pl, v.rdy || 0)) { v.blkT = blockEnd(s, v.p); v.blkW = blockWhy(s, v.p); } o = portWhy(s, v, exp); }
    else if (v.st === "pendel") { const r = routeOf(s, sh); const dw = r && r.dayW; if (dw) return Object.entries(dw).map(([k, x]) => [k, x]).sort((a, b) => (b[1].late + b[1].cancel) - (a[1].late + a[1].cancel)); return []; }
    return Object.entries(o).filter(x => x[1] >= .05).sort((a, b) => b[1] - a[1]);
  }
  // Was hat im letzten Vierteljahr am meisten gekostet? (Tage auf langen Linien, Fahrten im Tagespaket)
  function whyQuarter(s, r) {
    const o = {}; for (const h of (r.whyH || []).slice(0, 2)) for (const k in h) addWhy(o, k, h[k]);
    const cur = r.cur && (r.tt && r.tt.short ? r.cur.whyF : r.cur.why); for (const k in cur || {}) addWhy(o, k, cur[k]);
    return { short: !!(r.tt && r.tt.short), list: Object.entries(o).filter(x => x[1] >= .05).sort((a, b) => b[1] - a[1]) };
  }

  // Abfahrt aus dem Hafen v.i in Richtung v.d
  function depart(s, sh, r, G, tt, t, ctx) {
    const v = sh.v, X = v.i, d = v.d, to = X + d, k = legOf(X, d), acc = r.cur, sc = shipCur(sh);
    const fzP = fahrtF(s, sh), late = Math.max(0, t - v.pl);
    // Kohle für die Strecke bei ruhiger See (ein voller Bunker wiegt mit). Volldampf zum Aufholen nur, wenn die Kohle dafür reicht;
    // reicht der Bunker schon für die eingestellte Fahrstufe nicht, fährt der Chief so sparsam, dass die Kohle reicht (v5.0.1)
    const ladF = 1 + LADUNG * Math.min(1, v.b / coalCap(sh)), calm = f => G.legDist[k] * coalSm(s, sh, f) * ladF;
    const catchUp = r.auf && late > .25 && fzP < FAHRT.voll.f && calm(FAHRT.voll.f) * 1.08 <= v.b;
    let fz = catchUp ? FAHRT.voll.f : fzP;
    if (calm(fz) > v.b && v.b >= .8 * calm(fz)) { fz *= Math.sqrt(v.b / calm(fz)) * .99; ecoNote(s, sh, r); }
    const B = boardAt(s, sh, r, G, X, d, t, fzP);
    const fee = legFee(s, sh, G, k); expense(s, "Hafengebühren", fee); acc.cost += fee; sc.cost = (sc.cost || 0) + fee;
    const fr = legFreight(s, sh, G, k); if (fr) { s.cash += fr; s.cur.rev += fr; s.cur.freight = (s.cur.freight || 0) + fr; acc.rev += fr; sc.rev = (sc.rev || 0) + fr; }
    // Fahrzeit: geplant mit der eigenen Fahrstufe, tatsächlich mit Wetter, Nebel und Pannen
    const pd = legDays(s, sh, G, k, fzP), ad0 = legDays(s, sh, G, k, fz), wx = wxLeg(s, sh, G, k, ad0, ctx.mo, !!s.sim);
    let ad = ad0 + wx.extra + wx.fog + wx.brk;
    // Kohle für die Strecke: Wetter frisst mit
    const daily = G.legDist[k] * coalSm(s, sh, fz) / Math.max(.05, ad0);
    let burn = calm(fz) + wx.coalX * daily;
    let short = 0;
    if (burn > v.b + .01) { short = burn - v.b; const slow = .5 + short / Math.max(.01, burn) * ad0 * 1.5; ad += slow; burn = v.b; v.kn = { short, slow }; }
    v.sf = tt.P > 0 ? Math.min(1, 2 * seaDays(s, sh, G, fzP) / tt.P) : 1;
    const why = portWhy(s, v, t); addWhy(why, "sturm", wx.extra - (wx.ice || 0)); addWhy(why, "eis", wx.ice || 0); addWhy(why, "nebel", wx.fog); addWhy(why, "panne", wx.brk); addWhy(why, "kohle", Math.max(0, ad0 - pd) + (short > 0 ? ad - ad0 - wx.extra - wx.fog - wx.brk : 0));
    v.why = why; v.wyS = {}; v.wyP = {}; v.bkT = 0; v.blkT = 0; v.blkW = null; v.rdy0 = null;
    v.burn = burn; v.pd = pd; v.st = "see"; v.toP = G.ports[to]; v.t0 = t; v.eta = t + ad; v.pa = v.pl + pd; v.to = to; v.k = k; v.fzA = fz; v.late = late;
    const base = late > Math.max(1, tt.H / 4) ? t : v.pl; // ab einer Verspätung von einem Viertel Takt (mindestens einem Tag) wird neu geplant
    v.pln = base + pd + (isEnd(G, to) ? endWait(s, sh, G, tt.P) : G.stopT);
    v.lg = { from: X, rev: B.rev + fr, n: B.n, cap: TYPES[sh.type].seats, fee, aboard: B.aboard };
    acc.dep += 1; if (late > LATE_OK) acc.late += 1; sc.dep = (sc.dep || 0) + 1;
    postServed(s, r, sh);
    // v5.1.1: fehlt weniger als 5 % der Strecke, streckt der Chief die Kohle still (etwas langsamer, Grund „Kohle knapp“)
    if (short > .05 * calm(fz)) coalShort(s, sh, r, G); else v.kn = null;
  }
  // Ankunft im Hafen v.to
  function arrive(s, sh, r, G, tt, t, ctx) {
    const v = sh.v, Y = v.to, lateA = t - v.pa, acc = r.cur;
    const coalV = burnCoal(s, sh, v.burn || 0);
    v.st = "hafen"; v.i = Y; v.p = G.ports[Y]; v.burn = 0;
    if (Y === G.homeIdx) { v.knDec = null; v.knAsk = false; } // zurück im Heimathafen der Linie: die Entscheidung bei Kohlemangel ist erledigt
    const A = alightAt(s, sh, r, G, Y, t, lateA);
    if (isEnd(G, Y)) v.d = Y === 0 ? 1 : -1;
    const tol = lateTol(v.pd || 0);
    acc.arr += 1; if (lateA > tol) acc.lateA += 1; acc.lateSum += Math.max(0, lateA);
    { const x = Object.assign({}, v.why || {}); for (const k in v.wyS || {}) addWhy(x, k, v.wyS[k]); const w = scaleWhy(x, lateA); v.lw = { late: Math.max(0, lateA), w }; const aw = acc.why || (acc.why = {}); for (const k in w) addWhy(aw, k, w[k]); v.why = {}; v.wyS = {}; }
    pkUpdate(s, r, lateA <= tol ? 1 : 0, tt.H > 0 ? tt.H / (G.cruise ? 1 : 2) : 1);
    const lg = v.lg || {};
    logVoyage(s, { t, sh: sh.id, nm: sh.name, r: r.id, a: G.ports[lg.from != null ? lg.from : Y], b: G.ports[Y], n: Math.round(lg.n || 0), aboard: Math.round(lg.aboard || 0), cap: lg.cap || TYPES[sh.type].seats,
      rev: Math.round(lg.rev || 0), late: Math.round(Math.max(0, lateA) * 10) / 10, why: Object.entries(v.lw.w).filter(x => x[1] >= .05).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, d]) => [k, Math.round(d * 10) / 10]), res: Math.round((lg.rev || 0) - (lg.fee || 0) - coalV - A.cater - A.comp) });
    if (!s.sim) {
      if (lateA >= 3 && (r.newsM == null || r.newsM < s.m)) { r.newsM = s.m; s.mk.brand = clamp(s.mk.brand - 1, 0, 100); up(s, "rep", -.5);
        s.log.unshift({ m: s.m, head: "Große Verspätung: „" + sh.name + "“", text: "Die „" + sh.name + "“ erreicht " + PORTS[G.ports[Y]].name + " mit " + fmtD(lateA) + " Verspätung. Die Zeitungen berichten, die Fahrgäste schimpfen.", kind: "bad", img: "ev_verspaetung" }); }
      if (A.comp >= 2000 * (s.pidx || 1) && (s.compM == null || s.compM < s.m)) { s.compM = s.m; s.log.unshift({ m: s.m, head: "Entschädigung für die Fahrgäste der „" + sh.name + "“", text: fmtD(lateA) + " Verspätung: Die Reederei zahlt " + fmt(A.comp) + " Mark Entschädigung.", kind: "bad", img: "ev_entschaedigung" }); }
      if (sh.mark) pauseReq(s, "mark", "Die „" + sh.name + "“ ist in " + PORTS[G.ports[Y]].name + " angekommen.", sh.id);
      const P = s.pause || PAUSE_DEF; if (P.late > 0 && lateA >= P.late) pauseReq(s, "late", "Die „" + sh.name + "“ kommt mit " + fmtD(lateA) + " Verspätung in " + PORTS[G.ports[Y]].name + " an.", sh.id);
    }
    v.pl = v.pln;
    if (v.res) { toReserve(s, sh, r, G, t); return; }
    const bt = bunkerAt(s, sh, G, Y, v.d), handle = isEnd(G, Y) ? G.endLiege * .4 : G.stopT * .5;
    v.rdy = t + Math.max(handle, bt); v.rdy0 = t + handle; v.bkT = Math.max(0, bt - handle); v.wyP = {}; v.blkT = 0;
  }
  const fmtD = d => { const x = Math.round(d * 10) / 10; return (x === 1 ? "1 Tag" : String(x).replace(".", ",") + " Tage"); };

  // Kohle reicht nicht für die Strecke (Sturm hat die Reserve gefressen). Eine Entscheidung gilt für die ganze Fahrt,
  // bis das Schiff wieder im Heimathafen der Linie ist; bis dahin wird nicht neu gefragt und nicht neu gemeldet (v5.0.1)
  function coalShort(s, sh, r, G) {
    const v = sh.v, kn = v.kn; if (!kn || s.sim) return;
    const st = staff(s), home = PORTS[G.ports[G.homeIdx]].name;
    if (st.mi >= 0) { // der Maschineninspektor entscheidet jedes Mal nach Regel: nachbunkern, wenn es mehr als 1,2 Tage spart
      const pick = kn.slow > 1.2 ? 1 : 0; coalShortResolve(s, sh, pick);
      if (v.knDec != null) return; v.knDec = pick;
      pauseReq(s, "coal", "Auf der „" + sh.name + "“ wird die Kohle knapp.", sh.id);
      s.log.unshift({ m: s.m, head: "Kohle knapp auf der „" + sh.name + "“", text: "Ihr Maschineninspektor " + (pick ? "lässt den nächsten Hafen anlaufen und teuer nachbunkern." : "lässt langsam weiterfahren.") + " Bis zur Rückkehr nach " + home + " entscheidet er weiter selbst.", kind: "own", img: "ev_kohle_knapp" });
      return;
    }
    if (v.knDec != null) { coalShortResolve(s, sh, v.knDec); return; }
    if (s.pending.some(p => p.id === "kohleknapp" && p.ship === sh.id)) return;
    pauseReq(s, "coal", "Auf der „" + sh.name + "“ wird die Kohle knapp.", sh.id);
    v.knAsk = true;
    s.pending.unshift({ id: "kohleknapp", day: s.day, ship: sh.id, img: "ev_kohle_knapp", head: "Kohle wird knapp auf der „" + sh.name + "“",
      text: "Schwere See hat mehr Kohle gekostet als geplant. Der Chief meldet: Bis " + PORTS[G.ports[v.to]].name + " reicht der Vorrat nur bei langsamer Fahrt. Ihre Entscheidung gilt für die ganze Fahrt bis zur Rückkehr nach " + home + "." });
  }
  // Entscheidung des Spielers: gilt, bis das Schiff wieder im Heimathafen der Linie ist
  function coalDecide(s, ev, idx) { const sh = shipById(s, ev.ship), v = sh && sh.v; if (v && v.knAsk) v.knDec = idx; return coalShortResolve(s, sh, idx); }
  // Reicht der Bunker schon bei ruhiger See nicht für die eingestellte Fahrstufe, fährt der Chief sparsamer – gemeldet einmal je Schiff und Linie
  function ecoNote(s, sh, r) {
    if (s.sim || sh.ecoLog === r.id) return; sh.ecoLog = r.id;
    s.log.unshift({ m: s.m, head: "Sparsame Fahrt auf der „" + sh.name + "“", text: "Der Bunker reicht auf dieser Linie nicht für die eingestellte Fahrstufe. Der Chief fährt so sparsam, dass die Kohle reicht.", kind: "own", img: "ev_kohle_knapp" });
  }
  function coalShortResolve(s, sh, idx) {
    const v = sh && sh.v, kn = v && v.kn; if (!kn || v.st !== "see") return "";
    v.kn = null;
    if (idx === 1) { const G = lineGeo(s, routeOf(s, sh) || {}); const p = G ? G.ports[v.to] : s.home; const cost = buyCoal(s, sh, p, kn.short, true); v.b += kn.short; v.bv += cost; v.burn += kn.short; v.eta -= Math.max(0, kn.slow - .6); return "Nachbunkern kostet " + fmt(cost) + " Mark, die Verspätung wird kürzer."; }
    if (idx === 2) { v.eta -= Math.max(0, kn.slow - .25); sh.cond = Math.max(5, sh.cond - 4); const hit = s.expHit || (s.expHit = { si: 0, k: 0 }); hit.k = (hit.k || 0) + 3; return "Holz und Mobiliar halten die Kessel unter Dampf. Der Komfort leidet."; }
    return "Das Schiff fährt mit halber Kraft weiter.";
  }
  // Reserveschiff: wartet am Heimatende der Linie und übernimmt eine Abfahrt, wenn ein Schiff ausfällt oder stark verspätet ist
  function toReserve(s, sh, r, G, t) {
    const v = sh.v; v.res = false;
    if (r.res !== sh.id) return;
    if (v.i !== G.resEnd) { const d = coalUntil(s, sh, G, v.i, v.d, G.resEnd); const days = Math.ceil(G.dist / (shipSpd(s, sh, 1) * 24)); burnCoal(s, sh, d); sh.offUntil = Math.max(sh.offUntil || 0, Math.ceil(t) + days); v.i = G.resEnd; v.p = G.ports[G.resEnd]; }
    v.st = "res"; v.d = G.resEnd === 0 ? 1 : -1; v.rdy = t;
  }
  function reserveCheck(s, r, G, tt, T0, T1) {
    const rs = r.res && s.ships.find(x => x.id === r.res); if (!rs || !rs.v) return;
    if (rs.v.st !== "res" || !usable(s, rs) || rs.line !== r.id) return;
    const thr = Math.max(1, tt.H / 4), e = G.resEnd, dE = e === 0 ? 1 : -1;
    for (const sh of tt.ships) {
      const v = sh.v; if (!v || v.r !== r.id || v.res) continue;
      const np = nextPlan(G, v); if (np.i !== e || np.d !== dE || np.t >= T1) continue;
      const ok = usable(s, sh), te = !ok ? Infinity : v.st === "see" ? v.eta + G.endLiege * .4 : Math.max(v.pl, v.rdy || 0, (s.blk && s.blk[v.p]) || 0, s.blkAll || 0);
      if (te - np.t < thr) continue;
      // Rollen tauschen
      const rv = rs.v; rv.r = r.id; rv.st = "hafen"; rv.i = e; rv.d = dE; rv.p = G.ports[e]; rv.pl = np.t; rv.res = false;
      if (rv.b < legCoal(s, rs, G, legOf(e, dE)) * 1.15) { const bt = bunkerAt(s, rs, G, e, dE); rv.rdy = Math.max(T0, T0 + bt * .5); } else rv.rdy = T0;
      v.res = true; r.res = sh.id;
      if (v.st === "hafen" && v.i === e && ok) { v.st = "res"; }
      if (!s.sim) s.log.unshift({ m: s.m, head: "Reserveschiff „" + rs.name + "“ springt ein", text: "Die „" + sh.name + "“ " + (ok ? "ist zu spät dran" : "fällt aus") + ". Die „" + rs.name + "“ übernimmt ihre Abfahrt" + (G.info ? " auf " + G.info.name : "") + ".", kind: "own", img: "ship_" + rs.type });
      return;
    }
  }

  // Tagespaket für kurze Linien (Umlauf unter einem Tag): alle Fahrten des Tages in einem Schritt
  function shortDay(s, r, G, tt, ctx) {
    const acc = r.cur, mo = ctx.mo, f = diffOf(s).delay, det = !!s.sim;
    const ships = tt.ships.filter(sh => usable(s, sh) && sh.v && sh.v.r === r.id), q0 = r.q || (r.q = {});
    if (!ships.length) { for (const k in q0) { lostToRival(s, r, G, q0[k][0] + q0[k][1] + q0[k][2]); q0[k] = [0, 0, 0]; } return; }
    // Wetter, Nebel und Pannen des Tages
    let late = 0, cancel = 0;
    const areas = {}; for (const A of G.legAreas) for (const a in A) areas[a] = (areas[a] || 0) + A[a];
    let pf = 0, ps = 0, top = null; for (const a in areas) { if (FOG[a]) pf = Math.max(pf, FOG[a][(a === "channel" ? FOGCH_MO : STORM_MO).includes(mo) ? 0 : 1] * f); if (WX[a] && (!top || areas[a] > areas[top])) top = a; }
    let iceSh = 0; if (top) { const pI = WX[top].ice && ICE_MO.includes(mo) ? WX[top].ice : 0; ps = (WX[top].p[STORM_MO.includes(mo) ? 0 : 1] + pI) * f; iceSh = ps > 0 ? pI * f / ps : 0; }
    ps *= ships.reduce((a, sh) => a + seaF(TYPES[sh.type]), 0) / ships.length; // v5.1: Kanal-Raddampfer leiden mehr unter Seegang, Inselpostdampfer weniger
    const riv = [11, 0, 1].includes(mo) ? ships.filter(sh => TYPES[sh.type].river).length / ships.length : 0; // Eis auf dem Fluss
    // v5.1.1: jeder Teil des Tages bekommt seinen Grund (Nebel, Sturm, Eis, Panne, Streik)
    let dw = {}; const dwA = (k, l, c) => { if (!(l > 0 || c > 0)) return; const x = dw[k] || (dw[k] = { late: 0, cancel: 0 }); x.late += l || 0; x.cancel += c || 0; };
    const dwS = (l, c) => { dwA("sturm", l * (1 - iceSh), c * (1 - iceSh)); dwA("eis", l * iceSh, c * iceSh); };
    if (det) { late += pf * .55 + ps * .35; cancel += pf * .12 + ps * .25 + riv * .08 * f; dwA("nebel", pf * .55, pf * .12); dwS(ps * .35, ps * .25); dwA("eis", 0, riv * .08 * f); }
    else { if (rnd(s) < pf) { const l = .3 + rnd(s) * .5, c = rnd(s) * .25; late += l; cancel += c; dwA("nebel", l, c); } if (rnd(s) < ps) { const l = .2 + rnd(s) * .3, c = .1 + rnd(s) * .3; late += l; cancel += c; dwS(l, c); } if (riv && rnd(s) < .25 * f) { const c = (.2 + rnd(s) * .4) * riv; cancel += c; dwA("eis", 0, c); } }
    const st = staff(s); let qb = 0; for (const sh of ships) qb += Math.min(.5, BRK * (1 + 3 * Math.pow(1 - sh.cond / 100, 2)) * BRK_LV[st.maschine] * BRK_MAINT[sh.maint] * f); qb /= ships.length;
    { const l = det ? qb : qb * (.5 + rnd(s)); late += l; dwA("panne", l, 0); }
    const rs = r.res && s.ships.find(x => x.id === r.res); if (rs && usable(s, rs)) { late *= .3; cancel *= .3; for (const k in dw) { dw[k].late *= .3; dw[k].cancel *= .3; } }
    { const bp = G.ports.find(p => s.blk && s.blk[p] > ctx.T0); if (bp || (s.blkAll || 0) > ctx.T0) { cancel = 1; dw = {}; dwA(bp ? blockWhy(s, bp) : "streik", 0, 1); } }
    { const c0 = cancel, l0 = late; cancel = clamp(cancel, 0, 1); late = clamp(late, 0, 1 - cancel); for (const k in dw) { if (c0 > 0) dw[k].cancel *= cancel / c0; if (l0 > 0) dw[k].late *= late / l0; } }
    r.dayW = dw; { const per = 2 * G.legDist.length / tt.P * ships.length, wf = acc.whyF || (acc.whyF = {}); for (const k in dw) addWhy(wf, k, (dw[k].late + dw[k].cancel) * per); }
    pkUpdate(s, r, 1 - late - cancel, 1);
    // Fahrten: jedes Schiff fährt den Takt der Linie; Platz je Teilstrecke und Richtung begrenzt
    const nd = 1 / tt.P * (1 - cancel), capS = ships.map(sh => TYPES[sh.type].sb.map(x => x * nd)), cap = [0, 1, 2].map(c => capS.reduce((a, x) => a + x[c], 0));
    const pen = [0, 1, 2].map(o => SEA_REV * (ships.reduce((a, sh) => a + Math.max(0, 1 / fahrtF(s, sh) - 1), 0) / ships.length) * (o === 0 ? 2 : 1));
    let rev = 0, n = 0, cater = 0, legPax = 0;
    for (const d of [1, -1]) {
      const keys = []; for (const od of G.ods) keys.push(d > 0 ? [odKey(od.i, od.j), od] : [odKey(od.j, od.i), od]);
      const load = Array.from({ length: G.legDist.length }, () => [0, 0, 0]);
      for (const [k, od] of keys) { const p = q0[k]; if (!p) continue; for (const L of od.legs) for (let c = 0; c < 3; c++) load[L][c] += p[c]; }
      for (const [k, od] of keys) {
        const p = q0[k]; if (!p) continue; const oi = od.info, a = d > 0 ? od.i : od.j, b = d > 0 ? od.j : od.i;
        for (let c = 0; c < 3; c++) {
          const fac = Math.min(1, ...od.legs.map(L => load[L][c] > cap[c] ? cap[c] / load[L][c] : 1)), sv = p[c] * fac;
          lostToRival(s, r, G, p[c] - sv); acc.cx[c] += p[c] - sv; p[c] = 0; if (!(sv > 0)) continue;
          rev += sv * fareOf(s, r, G, a, b, c) * (1 - pen[c]) * (r.zkF || 1); n += sv; acc.cp[c] += sv; legPax += sv * od.legs.length;
          if (G.meal) { const cc = sv * oi.caterC[c] * kCostF(s, kqEff(s, ships[0], c), c) * s.wage; cater += cc; }
        }
      }
    }
    for (let c = 0; c < 3; c++) acc.cc[c] += cap[c] * 2;
    if (rev) { s.cash += rev; s.cur.rev += rev; acc.rev += rev; }
    // Fuhrwerke und Vieh (v5.1): nur Schiffe mit Wagendeck; Rivalen nehmen einen Teil mit
    const W = wagDemand(s, r) * ctx.fd; let wRev = 0;
    if (W > 0) {
      const capW = ships.reduce((a, sh) => a + wagCap(TYPES[sh.type]), 0) * 2 * G.legDist.length * nd, rivW = compDepsOf(s, r, G.info) * 2 * ctx.fd * RIV_WAG;
      const carried = capW > 0 ? Math.min(capW, W * capW / (capW + rivW)) : 0;
      acc.wagD += W; acc.wag += carried;
      if (carried > 0) { wRev = carried * wagFare(s, G.dist); income(s, "Fuhrwerke", wRev); acc.rev += wRev; acc.wagRev += wRev; }
    }
    if (cater) { expense(s, "Verpflegung", cater); acc.cost += cater; }
    acc.pax += n; acc.legPax += legPax; s.stats.pax += n;
    const capTot = cap.reduce((a, x) => a + x, 0) * 2 * G.legDist.length; acc.cap += capTot;
    // je Schiff: Einnahmen anteilig, Kohle (wird täglich nachgebunkert), Gebühren, Fracht
    const legsDay = 2 * G.legDist.length * nd, capSum = capS.reduce((a, x) => a + x[0] + x[1] + x[2], 0) || 1;
    for (let i = 0; i < ships.length; i++) {
      const sh = ships[i], v = sh.v, sc = shipCur(sh), share = (capS[i][0] + capS[i][1] + capS[i][2]) / capSum;
      sc.rev = (sc.rev || 0) + (rev + wRev) * share; sc.pax += n * share; sc.cap += TYPES[sh.type].seats * legsDay; sc.cater = (sc.cater || 0) + cater * share; sc.cost = (sc.cost || 0) + cater * share;
      let tons = 0, fee = 0, fr = 0; for (let k = 0; k < G.legDist.length; k++) { tons += G.legDist[k] * coalSm(s, sh, fahrtF(s, sh)) * (1 + LADUNG / 2) * 2 * nd; fee += legFee(s, sh, G, k) * 2 * nd; fr += legFreight(s, sh, G, k) * 2 * nd; }
      if (tons > 0) { const p = G.ports[G.homeIdx]; const cost = buyCoal(s, sh, p, tons, false); v.b += tons; v.bv += cost; burnCoal(s, sh, tons); }
      expense(s, "Hafengebühren", fee); acc.cost += fee; sc.cost = (sc.cost || 0) + fee;
      if (fr) { s.cash += fr; s.cur.rev += fr; s.cur.freight = (s.cur.freight || 0) + fr; acc.rev += fr; sc.rev = (sc.rev || 0) + fr; }
      sc.dep = (sc.dep || 0) + legsDay; if (legsDay > 0) postServed(s, r, sh, legsDay);
      v.st = "pendel"; v.p = G.ports[0];
    }
    acc.dep += legsDay * ships.length; acc.late += legsDay * ships.length * late; acc.cancel += 2 * G.legDist.length / tt.P * cancel * ships.length;
    acc.arr += legsDay * ships.length; acc.lateA += legsDay * ships.length * late;
  }

  // Abfahrtstafel: die nächsten Abfahrten aller Linien (kurze Linien als Sammelzeile)
  function departures(s, n) {
    const out = [];
    for (const r of s.routes) {
      const G = lineGeo(s, r); if (!G) continue; const tt = r.tt || {};
      if (tt.short) {
        const ships = s.ships.filter(sh => sh.line === r.id && sh.v && sh.v.r === r.id && usable(s, sh));
        if (ships.length) out.push({ short: true, r: r.id, from: G.ports[0], to: G.ports[G.n - 1], t: s.t, per: 2 * G.legDist.length / tt.P * ships.length, pk: r.pk, ships: ships.length, why: r.dayW ? Object.entries(r.dayW).filter(x => x[1].late + x[1].cancel >= .005).sort((a, b) => (b[1].late + b[1].cancel) - (a[1].late + a[1].cancel)) : [] });
        continue;
      }
      for (const sh of s.ships) {
        const v = sh.v; if (!v || v.r !== r.id || v.res || sh.line !== r.id || (v.st !== "hafen" && v.st !== "see")) continue;
        const np = nextPlan(G, v); if (!isFinite(np.t)) continue;
        const ok = usable(s, sh) || v.st === "see", ready = v.st === "see" ? v.eta + (isEnd(G, v.to) ? G.endLiege * .4 : G.stopT * .5) : Math.max(v.rdy || 0, s.t);
        const exp = ok ? Math.max(np.t, ready, (s.blk && s.blk[G.ports[np.i]]) || 0, s.blkAll || 0) : null;
        let wait = 0, rate = 0;
        for (const k in (r.q || {})) { const ok2 = k === "c" ? np.i === 0 : (() => { const [i, j] = k.split(">").map(Number); return i === np.i && Math.sign(j - i) === np.d; })(); if (ok2) { wait += r.q[k][0] + r.q[k][1] + r.q[k][2]; rate += (r.qa && r.qa[k]) || 0; } }
        const at = exp != null ? exp : np.t, seats = TYPES[sh.type].seats;
        out.push({ r: r.id, ship: sh.id, nm: sh.name, type: sh.type, from: G.ports[np.i], to: G.ports[np.i + np.d], plan: np.t, exp, late: exp == null ? null : Math.max(0, exp - np.t), why: exp != null && exp - np.t > .05 ? lateWhy(s, sh) : [], load: Math.min(1, (wait + rate * Math.max(0, at - s.t)) / Math.max(1, seats)), st: v.st, ok });
      }
    }
    return out.sort((a, b) => (a.exp != null ? a.exp : a.plan != null ? a.plan : a.t) - (b.exp != null ? b.exp : b.plan != null ? b.plan : b.t)).slice(0, n || 15);
  }
  // Zustand eines Schiffs für Flotte und Karte
  function shipStatus(s, sh) {
    const v = sh.v; if (!v) return null;
    const r = routeOf(s, sh), G = r ? lineGeo(s, r) : null, o = { st: v.st, port: v.p, b: v.b, cap: coalCap(sh), bv: v.bv, res: !!(r && r.res === sh.id), mark: !!sh.mark };
    if (v.st === "see") { o.to = v.toP; o.eta = v.eta; o.late = Math.max(0, v.eta - v.pa); let n = 0; for (const g of v.pax) n += g.n[0] + g.n[1] + g.n[2]; o.pax = Math.round(n); }
    if (G && v.r === (r && r.id) && (v.st === "hafen" || v.st === "see") && !v.res) { const np = nextPlan(G, v); o.next = { plan: np.t, from: G.ports[np.i], to: G.ports[np.i + np.d] }; if (v.st === "hafen") o.next.exp = Math.max(np.t, v.rdy || 0, (s.blk && s.blk[v.p]) || 0, s.blkAll || 0); }
    return o;
  }
  // Position auf der Seekarte (Breite, Länge)
  const posCache = {};
  function legPts(G, k) {
    const L = G.legs[k], key = (L.path.nodes || []).join(">"); if (posCache[key]) return posCache[key];
    const pts = (L.path.nodes || []).length ? W.drawPath(L.path.nodes) : [], cum = [0];
    for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; cum.push(cum[i - 1] + Math.hypot(c - a, (d - b) * Math.cos((a + c) / 2 * Math.PI / 180))); }
    return (posCache[key] = { pts, cum });
  }
  // Punkt auf einer Linie (Anteil f des gezeichneten Wegs über alle Teilstrecken)
  function lineAt(G, f) {
    const P = [], C = [0]; for (let k = 0; k < G.legs.length; k++) { const { pts } = legPts(G, k); for (let i = k ? 1 : 0; i < pts.length; i++) { const q = pts[i]; if (P.length) { const [a, b] = P[P.length - 1]; C.push(C[C.length - 1] + Math.hypot(q[0] - a, (q[1] - b) * Math.cos((a + q[0]) / 2 * Math.PI / 180))); } P.push(q); } }
    const x = clamp(f, 0, 1) * (C[C.length - 1] || 1); let i = 1; while (i < C.length - 1 && C[i] < x) i++;
    if (P.length < 2) return P[0] ? { lat: P[0][0], lon: P[0][1] } : null;
    const u = C[i] > C[i - 1] ? (x - C[i - 1]) / (C[i] - C[i - 1]) : 0, [a, b] = P[i - 1], [c, d] = P[i];
    return { lat: a + (c - a) * u, lon: b + (d - b) * u };
  }
  // tod = Uhrzeit im Spieltag (0 bis 1); die Karte rückt die Punkte damit zwischen zwei Tagen weiter (v5.1.1)
  function shipPos(s, sh, tod) {
    const v = sh.v; if (!v) return null; if (tod == null) tod = .5;
    const r = routeOf(s, sh), G = r ? lineGeo(s, r) : null;
    if (v.st === "see" && G && v.r === r.id && v.k != null && G.legs[v.k]) {
      const { pts, cum } = legPts(G, v.k), tot = cum[cum.length - 1] || 1;
      let f = clamp((s.t + tod - v.t0) / Math.max(.01, v.eta - v.t0), 0, 1); if (v.d < 0) f = 1 - f;
      const x = f * tot; let i = 1; while (i < cum.length - 1 && cum[i] < x) i++;
      const u = cum[i] > cum[i - 1] ? (x - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0, [a, b] = pts[i - 1], [c, d] = pts[i];
      return { lat: a + (c - a) * u, lon: b + (d - b) * u, sea: true };
    }
    // Tagespaket (v5.1.1): die Fähren pendeln von 6 bis 22 Uhr im Takt der Linie, gegeneinander versetzt; nachts und an Ausfalltagen liegen sie im Hafen
    if (v.st === "pendel" && G) {
      const mates = s.ships.filter(x => x.v && x.v.st === "pendel" && x.line === sh.line), n = Math.max(1, mates.length), idx = Math.max(0, mates.indexOf(sh));
      const P = (r.tt && r.tt.P) || .25, h = tod * 24, off = (r.dayW && Object.values(r.dayW).reduce((a, x) => a + x.cancel, 0) >= .99) || h < 6 || h > 22;
      const endP = e => { const p = PORTS[G.ports[e ? G.n - 1 : 0]]; return p ? { lat: p.lat, lon: p.lon, sea: false } : null; };
      if (off) return endP(idx % 2);
      const ph = mod((h - 6) / 24 / P + idx / n, 1), dwell = .08, half = ph < .5 ? ph * 2 : (ph - .5) * 2, f = clamp((half - dwell) / (1 - 2 * dwell), 0, 1), along = ph < .5 ? f : 1 - f;
      if (half < dwell || half > 1 - dwell) return endP((ph < .5 ? (half < dwell ? 0 : 1) : (half < dwell ? 1 : 0)) ^ (idx % 2));
      const q = lineAt(G, idx % 2 ? 1 - along : along); return q ? { lat: q.lat, lon: q.lon, sea: true } : null;
    }
    const p = PORTS[v.p]; return p ? { lat: p.lat, lon: p.lon, sea: false } : null;
  }

  // Zustand eines Schiffs anlegen (neu abgeliefert oder alter Spielstand)
  function initV(s, sh, port, half) {
    const cap = coalCap(sh), b = half ? cap / 2 : 0;
    sh.v = { st: "hafen", p: port || s.home || "ham", i: -1, d: 1, pl: s.t, rdy: s.t, b, bv: b * coalPortPrice(s, port || s.home || "ham"), pax: [], r: null, res: false };
    return sh.v;
  }
  // Schiff an seine Linie bringen: Überführung bis zum nächsten Ende, dann in den Takt
  function toLine(s, sh, r, G, T0, end, noBunker) {
    const v = sh.v, here = v.p;
    let e = end, dist = 0;
    if (e == null) {
      const i0 = G.ports.indexOf(here);
      if (i0 === 0 || i0 === G.n - 1) e = i0;
      else { let best = Infinity; for (const x of [0, G.n - 1]) { const p = G.ports[x] === here ? { dist: 0 } : seaPath(here, G.ports[x], yearOf(s)); const dd = p ? p.dist : 1e9; if (dd < best) { best = dd; e = x; } } dist = best < 1e9 ? best : 0; }
    }
    let ready = T0;
    if (dist > 0) { const days = Math.ceil(dist / (TYPES[sh.type].speed * 24)); const tons = dist * coalSm(s, sh, 1); if (v.b < tons) { const c = buyCoal(s, sh, here, tons - v.b, false); v.bv += c; v.b = tons; } burnCoal(s, sh, tons); sh.offUntil = Math.max(sh.offUntil || 0, Math.ceil(T0) + days); ready = T0 + days; }
    v.pax = []; v.st = "hafen"; v.i = e; v.d = e === 0 ? 1 : -1; v.p = G.ports[e];
    if (r.res !== sh.id && !noBunker) ready += bunkerAt(s, sh, G, e, v.d); // vor der ersten Abfahrt bekohlen – das plant der Fahrplan mit ein
    joinLine(s, sh, r, G, ready, e);
    if (r.res === sh.id) { v.st = "res"; v.i = G.resEnd; v.p = G.ports[G.resEnd]; v.d = G.resEnd === 0 ? 1 : -1; }
    else if (!s.sim) respace(s, r);
  }

  // Ereignisse eines Schiffs an einem Tag: Ankunft → Bekohlen → Abfahrt (auch mehrere, wenn es schnell geht)
  function shipEvents(s, sh, r, G, tt, T0, T1, ctx) {
    const v = sh.v;
    for (let n = 0; n < 8; n++) {
      if (v.st === "see") { if (v.eta < T1) { arrive(s, sh, r, G, tt, Math.max(T0, v.eta), ctx); if (!s.ships.includes(sh)) return; continue; } return; }
      if (v.st !== "hafen" || v.res || sh.line !== r.id || !usable(s, sh) || !(v.i >= 0)) return;
      const td = Math.max(v.pl, v.rdy || 0, (s.blk && s.blk[v.p]) || 0, s.blkAll || 0);
      if (blockEnd(s, v.p) > Math.max(v.pl, v.rdy || 0) && v.pl < T1) { v.blkT = Math.max(v.blkT || 0, Math.min(td, blockEnd(s, v.p))); v.blkW = blockWhy(s, v.p); }
      if (td >= T1) return;
      if (v.b < legCoal(s, sh, G, legOf(v.i, v.d)) * (1 + bunkRes(G)) - .01 && !v.bunkT) { const bt = bunkerAt(s, sh, G, v.i, v.d); v.bunkT = 1; v.rdy = Math.max(v.rdy || 0, td) + bt; v.bkT = (v.bkT || 0) + bt; continue; }
      v.bunkT = 0;
      depart(s, sh, r, G, tt, Math.max(T0, td), ctx);
    }
  }
  // Fahrt ohne Linie zu Ende bringen (Linie geschlossen, während das Schiff unterwegs war)
  function orphanArrive(s, sh, T1) { const v = sh.v; if (v.st !== "see" || v.eta >= T1) return; burnCoal(s, sh, v.burn || 0); v.st = "hafen"; v.p = v.toP || v.p; v.r = null; v.pax = []; v.burn = 0; v.i = -1; }

  function dayTick(s) {
    const mo = cal(s.m).mo, winter = WINTER.includes(mo), fd = 1 / dim(s.m), cur = s.cur, pid = s.pidx, st = staff(s), myEx = myExp(s), kuX = ((s.exp && s.exp.ku != null ? s.exp.ku : 50) - 50) / 50;
    const T0 = s.t || 0, T1 = T0 + 1;
    let dCost = 0;
    const add = (k, v) => { cur.cost[k] = (cur.cost[k] || 0) + v; dCost += v; };
    cur.days += 1;
    const odCount = {}, lines = [];
    for (const r of s.routes) { const G = lineGeo(s, r); if (!G) continue; for (const od of G.ods) { const k = pairKey(G.ports[od.i], G.ports[od.j]) + (G.cruise ? "c" : ""); odCount[k] = (odCount[k] || 0) + 1; } }
    const ctx = { mo, fd, pid, st, myEx, kuX, odCount, T0, T1 };
    for (const r of s.routes) if (r.res && !s.ships.some(x => x.id === r.res && x.line === r.id)) r.res = null;
    // neu abgelieferte Schiffe bekommen ihren Zustand, Schiffe ohne Fahrt auf ihrer Linie werden dorthin gebracht
    for (const sh of s.ships) if (sh.ready <= s.m && !sh.museum && !sh.v) initV(s, sh, s.home, false);
    for (const r of s.routes) {
      const G = lineGeo(s, r); if (!G) continue;
      const acc = r.cur || (r.cur = newRcur()); for (const k in RCUR0) if (acc[k] == null) acc[k] = Array.isArray(RCUR0[k]) ? [0, 0, 0] : typeof RCUR0[k] === "object" ? {} : 0; acc.rp = acc.rp || {};
      for (const sh of s.ships) {
        const v = sh.v; if (sh.line !== r.id || !v || sh.laid || sh.museum || v.st === "see" || v.r === r.id || !usable(s, sh)) continue;
        if (v.mig) { const k = (r.migN = (r.migN || 0) + 1) - 1, e = k % 2 ? G.n - 1 : 0; v.mig = 0; v.p = G.ports[e]; v.i = e; toLine(s, sh, r, G, T0 + 1, e, true); }
        else toLine(s, sh, r, G, T0, null);
      }
      const tt = lineTT(s, r, G); r.tt = { P: tt.P, H: tt.H, n: tt.n, short: tt.short };
      lines.push([r, G, tt]);
    }
    // Nachfrage: neue Buchungen in die Warteschlangen
    for (const [r, G, tt] of lines) demandDay(s, r, G, tt, ctx);
    // Fahrten
    for (const [r, G, tt] of lines) {
      if (tt.short) { shortDay(s, r, G, tt, ctx); r.nx = {}; continue; }
      if (r.res) reserveCheck(s, r, G, tt, T0, T1);
      for (const sh of s.ships.filter(x => x.v && x.v.r === r.id)) {
        const v = sh.v;
        if (v.res && v.st === "hafen" && usable(s, sh)) { toReserve(s, sh, r, G, T0); continue; }
        if (v.st === "hafen" && !v.res && sh.line === r.id && usable(s, sh) && isEnd(G, v.i) && v.pl < T0 - Math.max(2, tt.H)) joinLine(s, sh, r, G, T0, v.i); // nach langem Ausfall neu einreihen
        shipEvents(s, sh, r, G, tt, T0, T1, ctx);
      }
      // v5.1.1: ein Tag, an dem eine fällige Abfahrt wegen Streik oder Sperre ausfällt, zählt wie im Tagespaket als unpünktlich
      r.dayW = null;
      if (tt.ships.some(sh => { const v = sh.v; return v && v.r === r.id && v.st === "hafen" && !v.res && usable(s, sh) && v.pl < T1 && blockEnd(s, v.p) >= T1; })) { pkUpdate(s, r, 0, 1); r.cur.blkD = (r.cur.blkD || 0) + 1; }
      // nächste geplante Abfahrt je Hafen und Richtung; liegt sie im Umlauf eines Schiffs erst später, zählt der Fahrplan (sonst gälte sie als überfällig)
      r.nx = {};
      const off = tt.P > 0 ? lineOffsets(s, G, tt.P, tt.ref) : null;
      for (const sh of tt.ships) {
        const v = sh.v; if (!v || v.r !== r.id || v.res || !usable(s, sh)) continue;
        const np = nextPlan(G, v), k0 = dkey(np.i, np.d); if (!(r.nx[k0] <= np.t)) r.nx[k0] = np.t;
        if (off) for (const k in off) { if (k === k0) continue; const t = np.t + mod(off[k] - (off[k0] || 0), tt.P); if (!(r.nx[k] <= t)) r.nx[k] = t; }
      }
    }
    for (const sh of s.ships) if (sh.v && sh.v.st === "see" && !lines.some(([r]) => r.id === sh.v.r)) orphanArrive(s, sh, T1);
    // laufende Kosten, Verschleiß, Unglücke (nur auf See), Werft
    for (const sh of s.ships.slice()) {
      const t = TYPES[sh.type];
      if (sh.ready > s.m) continue;
      if (sh.museum) { museumShipDay(s, sh, fd, add); continue; }
      const sc = shipCur(sh);
      if (sh.charter >= s.m) { const ch = sh.charterRate * fd; income(s, "Charter", ch); sc.rev = (sc.rev || 0) + ch; const hc = crewCost(s, t) * s.crewMult * s.wage * .3 * fd; add("Heuer", hc); sc.cost = (sc.cost || 0) + hc; continue; }
      const r = routeOf(s, sh), isRes = !!(r && r.res === sh.id), act = active(s, sh), laid = !sh.line || sh.laid, info = r ? rInfo(s, r) : null, val = shipValue(s, sh), cfx = capFx(s, sh);
      let fixed = crewCost(s, t) * s.crewMult * s.wage * (laid ? .25 : 1) * cfx.crew * fd;
      add("Heuer", fixed);
      const mc = maintCost(s, sh) * (laid || isRes ? .5 : 1) * fd + (sh.eq.funk ? 60 * s.wage * fd : 0); add("Wartung", mc); fixed += mc;
      if (sh.insured) {
        const lr = info ? info.risk[winter ? 1 : 0] : .005;
        let pct = (1.2 + lr * 60 + (100 - sh.cond) / 100 * 1.5) * (t.ocean ? OCEAN_INS : 1);
        if (s.flags.boote1912 && !sh.eq.boote) pct *= 1.5;
        const ic = val * pct / 100 / 12 * (laid ? .4 : 1) * s.insMult * fd; add("Versicherung", ic); fixed += ic;
      }
      sc.cost = (sc.cost || 0) + fixed;
      if (r && r.cur && sh.line && !sh.laid) r.cur.fixed = (r.cur.fixed || 0) + fixed;
      const v = sh.v, atSea = !!v && (v.st === "see" || v.st === "pendel");
      if (act && info && !isRes) {
        const late = sh.majLate || {}, emil = sh.emil ? .5 : 1, voll = (v && v.st === "see" && v.fzA > 1.001) || fahrtOf(s, sh) === "voll";
        sh.cond -= (info.wear[winter ? 1 : 0] * .6 * MAINT[sh.maint].wear * (t.wear || 1) * (late.rumpf ? 1.3 : 1) * ageWear(sh)) * fd * (voll ? VOLL_WEAR : 1);
        if (late.rumpf) sh.cond = Math.min(sh.cond, 70);
        if (atSea) {
          const scale = v.st === "pendel" ? 1 : 1 / Math.max(.25, v.sf || 1);
          const p = info.risk[winter ? 1 : 0] * (1 + 3 * Math.pow(1 - sh.cond / 100, 2)) * modFactor(s, r, info, "risk") * (t.safe || 1) * (late.kessel ? 1.4 : 1) * (late.rumpf ? 1.2 : 1) * (sh.defects && sh.defects.includes("maschine") ? 1.15 : 1) * emil * RISK_LV[st.deck] * cfx.risk * (winter ? cfx.winter : 1) * fd * (t.hydro && winter ? 1.6 : 1) * (sh.eq.radar ? .8 : 1) * (t.ice && winter ? .5 : 1) * diffOf(s).risk * scale;
          if (!s.sim && rnd(s) < p) incident(s, sh);
        }
      } else if (!inDock(s, sh)) sh.cond -= .15 * fd;
      if (s.ships.includes(sh)) sh.cond = clamp(sh.cond, 5, 100);
      if (!s.sim && inDock(s, sh) && sh.dockUntil - s.t > 1 && rnd(s) < .025 && !s.pending.some(p => p.ship === sh.id)) werftEvent(s, sh);
    }
    // Postverträge: Zuschuss täglich, solange ein schnelles Schiff die Linie bedient
    for (const k of Object.keys(s.contracts)) {
      const c = s.contracts[k];
      const srv = s.ships.filter(sh => { if (!active(s, sh) || !sh.v || sh.v.r !== sh.line) return false; const r = routeOf(s, sh); return r && ((r.a === c.a && r.b === c.b) || (r.a === c.b && r.b === c.a)) && TYPES[sh.type].speed * fahrtF(s, sh) >= (c.minSpeed || 0); });
      if (srv.length) income(s, "Postverträge", c.sub * fd * (srv.some(sh => TYPES[sh.type].post) ? POST_BONUS : 1)); // v5.1: mit Postraum an Bord zahlt die Post mehr
    }
    // Zeitkarten (v5.1): fester Monatsbetrag der Pendler, solange auf der Linie gefahren wird
    for (const r of s.routes) if (zkOn(r) && r.zk.n > 0 && s.ships.some(sh => sh.line === r.id && active(s, sh))) { const v = r.zk.n * zkPrice(s, r) * fd; income(s, "Zeitkarten", v); if (r.cur) r.cur.rev += v; }
    const mkCost = MK_BUDGET[s.mk.budget].cost + Object.keys(s.mk.ag).filter(k => s.mk.ag[k]).reduce((a, k) => a + MK_AGENCY[k].cost, 0);
    const adCost = s.routes.filter(r => r.adOn).reduce((a, r) => a + campaignCost(s, r), 0);
    if (mkCost || adCost) add("Werbung", (mkCost * s.wage + adCost) * fd);
    const pers = staffMonthly(s); if (pers) add("Personal", pers * fd);
    const capCost = caps(s).reduce((a, c) => a + capPay(s, c), 0); if (capCost) add("Kapitäne", capCost * fd);
    add("Kontor", (400 + 100 * s.ships.length + 50 * s.routes.length) * fd);
    s.cash -= dCost;
    if (s.cash < 0) { const od = -s.cash * .012 * fd; s.cash -= od; cur.cost["Überziehungszins"] = (cur.cost["Überziehungszins"] || 0) + od; }
  }
  const RCUR0 = newRcur();
  function finalize(s) {
    const cur = s.cur, ex = cur.extra || {}, exSum = Object.values(ex).reduce((a, b) => a + b, 0);
    const rep = { m: s.m, hzSave: Math.round(cur.hzSave || 0), lines: {}, rev: cur.rev + exSum, tickets: cur.rev - (cur.freight || 0), freight: cur.freight || 0, extra: Object.assign({}, ex), cost: Object.assign({}, cur.cost), profit: 0, events: [],
      coal: { buyT: Math.round(cur.cbT || 0), buyM: Math.round(cur.cbM || 0), useT: Math.round(cur.cuT || 0), useM: Math.round(cur.cuM || 0), ports: Object.fromEntries(Object.entries(cur.cp || {}).map(([k, v]) => [k, Math.round(v)])) } };
    for (const r of s.routes) {
      const a = r.cur; if (!a) { r.last = null; continue; }
      r.last = { pax: Math.round(a.pax), cap: Math.round(a.cap), share: a.D ? a.pax / a.D : 0, load: a.cap ? (a.legPax || a.pax) / a.cap : 0, rev: Math.round(a.rev), cost: Math.round(a.cost), ships: a.ships, D: Math.round(a.D), m: s.m, coal: Math.round(a.coal || 0),
        cls: [0, 1, 2].map(o => ({ pax: Math.round(a.cp[o]), cap: Math.round(a.cc[o]), dem: Math.round(a.dem[o]), no: Math.round((a.cx || [0, 0, 0])[o]) })), fixed: Math.round(a.fixed || 0), riv: Object.fromEntries(Object.entries(a.rp || {}).map(([k, v]) => [k, Math.round(v)])),
        dep: Math.round((a.dep || 0) * 10) / 10, late: Math.round((a.late || 0) * 10) / 10, arr: Math.round((a.arr || 0) * 10) / 10, lateA: Math.round((a.lateA || 0) * 10) / 10, avgLate: a.arr ? Math.round(a.lateSum / a.arr * 100) / 100 : 0, pk: r.pk == null ? null : Math.round(r.pk * 1000) / 1000, comp: Math.round(a.comp || 0), cancel: Math.round((a.cancel || 0) * 10) / 10,
        wag: Math.round(a.wag || 0), wagD: Math.round(a.wagD || 0), wagRev: Math.round(a.wagRev || 0), zk: zkOn(r) ? Math.round(r.zk.n) : 0, blkD: a.blkD || 0 };
      { const w = r.tt && r.tt.short ? a.whyF : a.why, o = {}; for (const k in w || {}) if (w[k] >= .01) o[k] = Math.round(w[k] * 100) / 100; r.whyH = [o].concat(r.whyH || []).slice(0, 3); }
      rep.lines[r.id] = r.last; r.cur = null;
    }
    rep.pax = s.routes.reduce((x, r) => x + (r.last ? r.last.pax : 0), 0);
    for (const sh of s.ships) if (sh.cur) { sh.lastPax = Math.round(sh.cur.pax); sh.lastLoad = sh.cur.cap ? sh.cur.pax / sh.cur.cap : 0; sh.last = { rev: Math.round(sh.cur.rev || 0), cost: Math.round(sh.cur.cost || 0), pax: Math.round(sh.cur.pax), load: sh.lastLoad, m: s.m, coal: Math.round(sh.cur.coal || 0), cater: Math.round(sh.cur.cater || 0), catC: (sh.cur.catC || [0, 0, 0]).map(Math.round), dep: Math.round((sh.cur.dep || 0) * 10) / 10 }; sh.cur = null; }
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
      if ((c.served || 0) >= (c.minDeps || 1e-6)) { c.miss = 0; }
      else {
        add("Vertragsstrafen", c.pen); s.cash -= c.pen; c.miss = (c.miss || 0) + 1;
        rep.events.push(c.name + ": " + (c.minDeps ? "nur " + Math.floor(c.served || 0) + " von " + c.minDeps + " Fahrten" : "keine Fahrt") + " – Vertragsstrafe " + fmt(c.pen) + " Mark." + (c.miss >= 3 ? " Nach drei Ausfällen ist der Vertrag gekündigt." : ""));
        if (c.miss >= 3) delete s.contracts[k];
      }
      c.served = 0;
    }
    // Fährkonzession (v5.1): Pacht und fester Takt in jedem Monat
    for (const r of s.routes) {
      r.rh = (r.rh || []).concat(r.last ? r.last.rev : 0).slice(-12);
      const K = r.konz; if (!K || K.until <= s.m) continue;
      add("Konzession", K.pacht); s.cash -= K.pacht;
      const dep = r.last ? r.last.dep : 0;
      if (dep < K.takt) {
        K.miss = (K.miss || 0) + 1; add("Vertragsstrafen", K.pacht); s.cash -= K.pacht;
        rep.events.push("Fährkonzession " + rInfo(s, r).name + ": nur " + Math.round(dep) + " statt " + K.takt + " Abfahrten – Strafe " + fmt(K.pacht) + " Mark." + (K.miss >= 3 ? " Nach drei Verstößen ist die Konzession entzogen." : ""));
        if (K.miss >= 3) { r.konz = null; r.compMult = 1; }
      }
    }
    coalMonthEnd(s, add); kitchenMonthEnd(s, add);
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
      const full = Math.round(PS(s, sh) * .09), ins = sh.insured && !detained(s, sh), cost = ins ? Math.round(full * .15) : full; expense(s, "Reparaturen", cost); sh.cond = Math.max(5, sh.cond - 15); up(s, "rep", -3);
      if (sh.v && sh.v.st === "see") sh.v.eta += 1 + rnd(s) * 2;
      const days = sendToDock(s, sh, dockDays(sh.type, "havarie", sh.cond));
      const n = aboard(s, sh), hurt = Math.round(n * (.01 + rnd(s) * .03) * RISK_LV[staff(s).deck]), dead = rnd(s) < .12 ? Math.max(1, Math.round(n * rnd(s) * .01)) : 0;
      s.log.unshift({ m: s.m, head: "Havarie: „" + sh.name + "“ schwer beschädigt", text: "Linie " + lineOf(s, sh) + ". Reparatur " + fmt(full) + " Mark" + (ins ? ", davon zahlen Sie den Selbstbehalt von " + fmt(cost) + " Mark" : " – die Versicherung zahlt nicht") + ". " + days + " Tage in der Werft, bis zum " + dateAfter(s, days) + "." + compensate(s, sh, dead, hurt), kind: "bad", img: "wf_dock" });
    } else {
      const full = Math.round(PS(s, sh) * .02), cost = sh.insured ? Math.round(full * .15) : full; expense(s, "Reparaturen", cost); sh.cond = Math.max(5, sh.cond - 6); up(s, "rep", -1);
      if (sh.v && sh.v.st === "see") sh.v.eta += .5 + rnd(s);
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
    const t = TYPES[sh.type], full = Math.round(PS(s, sh) * .12), cost = sh.insured ? Math.round(full * .15) : full;
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
  function staff(s) {
    const st = s.staff || (s.staff = { deck: 1, maschine: 1, service: 1, insp: false, inspMin: 60, markt: false });
    if (st.mi == null) Object.assign(st, { mi: -1, miAuto: true, miSpar: 125, miVoll: 90, miPlan: null, ke: -1, keRenew: 95, pm: -1 });
    if (st.pk == null) st.pk = -1;
    return st;
  }

  /* ---------- Kohle und Küche (v4.5) ---------- */
  const FAHRT = { spar: { f: .85, name: "Sparfahrt" }, normal: { f: 1, name: "Normal" }, voll: { f: 1.08, name: "Volldampf" } };
  const FAHRT_ORDER = ["spar", "normal", "voll"];
  const SEA_REV = .15, VOLL_WEAR = 1.5, FAHRT_SPD = .5; // Erlösabschlag je längerer Seezeit, Verschleiß bei Volldampf, Anteil des Tempos, den die Fahrgäste merken
  const KQ = [{ name: "einfach", cost: .75, score: 30 }, { name: "ordentlich", cost: 1, score: 50 }, { name: "fein", cost: 1.6, score: 78 }, { name: "à la carte", cost: 2.24, score: 95 }];
  const KU_CLS = [1.2, .6, .2], KU_W = 1, KU_CRUISE = .4; // Gewicht der Küche je Klasse; Ruf der Küche wirkt bei Vergnügungsreisen auch auf die Nachfrage
  const MI_PAY = 500, KE_PAY = 400, PM_PAY = 450, CHEF_PAY = 700;
  const COAL_SURCH = { 1: .03, 3: .06, 5: .1 };
  const CATERERS = {
    billig: { cost: .9, levels: [0, 1], fail: .6, names: { ham: "Hafenküche Billwerder", lpl: "Dockside Victualling Company", lon: "Wapping Galley Works" }, note: "Billiganbieter: nur einfach und ordentlich, 10 % billiger, die Qualität schwankt" },
    solide: { cost: 1, levels: [0, 1, 2], fail: .15, names: { ham: "Hanseatische Proviant-Gesellschaft", lpl: "Mersey Provision Company", lon: "Thames Provision Company" }, note: "Solider Caterer: alle Stufen zum Normalpreis" },
    hotel: { cost: 1.05, levels: [1, 2], fail: .1, names: { ham: "Alster-Hotel-Gesellschaft", lpl: "Wellington Hotel Company", lon: "Strand Hotel Company" }, note: "Hotel-Caterer: ordentlich und fein, 5 % teurer, feine Küche bringt Ansehen" },
    luxus: { cost: 1, levels: [3], first: true, from: 1905, fail: .1, names: { ham: "Restaurant-Gesellschaft Imperial", lpl: "Restaurant Excelsior", lon: "Restaurant Monarch" }, note: "Luxus-Restaurant: nur 1. Klasse, à la carte, 40 % teurer als fein, bringt Prestige" } };
  const CAT_ORDER = ["billig", "solide", "hotel", "luxus"];
  function catName(s, k) { return CATERERS[k].names[s.home || "ham"] || CATERERS[k].names.ham; }
  function postNeed(s, sh) {
    const r = routeOf(s, sh); if (!r) return 0;
    let m = 0;
    for (const k of Object.keys(s.contracts || {})) { const c = s.contracts[k]; if ((r.a === c.a && r.b === c.b) || (r.a === c.b && r.b === c.a)) m = Math.max(m, c.minSpeed || 0); }
    return m;
  }
  function postSlow(s, sh, stage) { const need = postNeed(s, sh); return need > 0 && TYPES[sh.type].speed * FAHRT[stage].f < need; }
  function fahrtOf(s, sh) {
    if (sh.fahrt && FAHRT[sh.fahrt]) return sh.fahrt;
    const f = FAHRT[s.fahrt] ? s.fahrt : "normal";
    if (f === "spar" && staff(s).mi >= 1 && postSlow(s, sh, "spar")) return "normal";
    return f;
  }
  function fahrtF(s, sh) { return FAHRT[fahrtOf(s, sh)].f; }
  function setFahrt(s, stage) {
    if (!FAHRT[stage]) return "Unbekannte Fahrstufe.";
    const st = staff(s); s.fahrt = stage;
    if (st.mi >= 0 && st.miAuto) { st.miAuto = false; st.miPlan = null; return "Von Hand gestellt – die Regel des Maschineninspektors ist ausgeschaltet."; }
    return null;
  }
  function setShipFahrt(s, id, stage) { const sh = s.ships.find(x => x.id === id); if (!sh) return; if (stage && FAHRT[stage]) sh.fahrt = stage; else delete sh.fahrt; }
  function fahrtAuto(s) {
    const st = staff(s); if (st.mi < 0 || !st.miAuto) { st.miPlan = null; return; }
    const idx = s.coal * 100, want = idx >= st.miSpar ? "spar" : idx < st.miVoll ? "voll" : "normal";
    if (want === (s.fahrt || "normal")) { st.miPlan = null; return; }
    if (!st.miPlan || st.miPlan.stage !== want) st.miPlan = { stage: want, at: s.m + [2, 1, 0, 0][st.mi] };
    if (s.m >= st.miPlan.at) {
      s.fahrt = want; st.miPlan = null;
      s.log.unshift({ m: s.m, head: "Die Flotte fährt jetzt " + FAHRT[want].name, text: "Ihr Maschineninspektor stellt die Reederei-Fahrstufe um – der Kohlepreis steht bei " + Math.round(idx) + " %.", kind: "own", img: want === "spar" ? "fs_sparfahrt" : want === "voll" ? "fs_volldampf" : "pers_maschineninspektor" });
    }
  }
  function kueche(s) { return s.kueche || (s.kueche = { q: [1, 1, 1], eigen: false, cat: null, lux: null, notUntil: -1, wob: 0 }); }
  const catOn = (s, c) => !!(c && c.start <= s.m && c.until >= s.m);
  function kqOf(s, sh, c) { const o = sh && sh.kq ? sh.kq[c] : null; return o != null ? o : kueche(s).q[c]; }
  function kqEff(s, sh, c) {
    const K = kueche(s);
    if (K.notUntil >= s.m) return 0;
    if (c === 0 && catOn(s, K.lux)) return 3;
    let q = kqOf(s, sh, c);
    if (catOn(s, K.cat)) { const L = CATERERS[K.cat.k].levels; q = clamp(q, L[0], L[L.length - 1]); }
    return q;
  }
  function kScore(s, q, c) {
    const K = kueche(s), st = staff(s); let v = KQ[q].score;
    if (q === 3) return v;
    if (catOn(s, K.cat)) { if (K.cat.k === "billig") v += K.wob || 0; if (K.cat.k === "hotel" && q === 2) v += 4; }
    else if (K.eigen && st.pm >= 0) { if (q === 2 && st.pm === 0) v -= 8; v += [0, 0, 3, 6][st.pm]; }
    return clamp(v, 5, 100);
  }
  function kCostF(s, q, c) {
    const K = kueche(s), f = KQ[q].cost;
    if (q === 3) return f * (K.lux ? K.lux.wage / s.wage : 1);
    if (catOn(s, K.cat)) return f * CATERERS[K.cat.k].cost * K.cat.wage / s.wage;
    if (K.eigen && staff(s).pm >= 0) return f * .9;
    return f;
  }
  function setKq(s, c, q) { if (c < 0 || c > 2 || q < 0 || q > 2) return; kueche(s).q[c] = q; }
  function setShipKq(s, id, c, q) {
    const sh = s.ships.find(x => x.id === id); if (!sh) return;
    sh.kq = sh.kq || [null, null, null]; sh.kq[c] = q == null || q < 0 ? null : clamp(q, 0, 2);
    if (sh.kq.every(x => x == null)) delete sh.kq;
  }
  function setEigen(s, on) {
    const K = kueche(s);
    if (on && staff(s).pm < 0) return "Für eine eigene Küche brauchen Sie einen Proviantmeister.";
    if (on && catOn(s, K.cat)) return "Solange ein Caterer-Vertrag läuft, gibt es keine eigene Küche.";
    K.eigen = !!on; return null;
  }
  function catOffers(s) { const y = yearOf(s); return CAT_ORDER.filter(k => !CATERERS[k].from || y >= CATERERS[k].from).map(k => ({ k, name: catName(s, k), note: CATERERS[k].note, levels: CATERERS[k].levels, first: !!CATERERS[k].first })); }
  function signCaterer(s, k, years) {
    const C = CATERERS[k]; if (!C) return "Unbekannter Caterer.";
    if (C.from && yearOf(s) < C.from) return "Diesen Caterer gibt es erst ab " + C.from + ".";
    const K = kueche(s); years = years === 3 ? 3 : 1;
    if (C.first ? catOn(s, K.lux) : catOn(s, K.cat)) return "Es läuft schon ein solcher Vertrag.";
    const c = { k, start: s.m, until: s.m + years * 12 - 1, years, wage: s.wage };
    if (C.first) K.lux = c; else { K.cat = c; K.eigen = false; }
    s.log.unshift({ m: s.m, head: "Vertrag mit " + catName(s, k), text: (years === 1 ? "Ein Jahr" : "Drei Jahre") + " fester Preis pro Fahrgast" + (C.first ? " für die 1. Klasse" : "") + ".", kind: "own", img: C.first ? "kue_alacarte" : "kue_caterer" });
    return null;
  }
  function catCancelFee(s, c) {
    if (!c) return 0;
    const v = s.ships.reduce((a, sh) => a + (sh.last && sh.last.catC ? (CATERERS[c.k].first ? sh.last.catC[0] : sh.last.catC[0] + sh.last.catC[1] + sh.last.catC[2]) : 0), 0);
    return Math.round(Math.max(0, c.until - s.m + 1) * v * .25);
  }
  function cancelCaterer(s, which) {
    const K = kueche(s), c = which === "lux" ? K.lux : K.cat; if (!catOn(s, c)) return "Kein laufender Vertrag.";
    const fee = catCancelFee(s, c); expense(s, "Sonderausgaben", fee);
    if (which === "lux") K.lux = null; else K.cat = null;
    s.log.unshift({ m: s.m, head: "Vertrag mit " + catName(s, c.k) + " gekündigt", text: "Die Kündigung kostet " + fmt(fee) + " Mark – ein Viertel der Restsumme.", kind: "own", img: "kue_caterer" });
    return null;
  }
  function coalIdx(s) { return Math.round(s.coal * 100); }
  function coalTrend(s) { const h = s.coalHist || [], p = h.length ? h[h.length - 1].c : s.coal; return s.coal > p + .004 ? 1 : s.coal < p - .004 ? -1 : 0; }
  function coalActive(s) { return (s.coalK || []).filter(k => k.start <= s.m && k.until >= s.m); }
  // Ø Tonnen, die Ihre Schiffe in den letzten drei Monaten in einem Hafen gebunkert haben (ohne Hafen: insgesamt verbraucht)
  function coalBase(s, port) { const u = (port ? (s.coalPort || {})[port] || [] : s.coalUse || []).slice(-3); return u.length ? u.reduce((a, b) => a + b, 0) / u.length : 0; }
  function coalOffer(s, years, share, port) {
    years = COAL_SURCH[years] != null ? +years : 1; share = share >= 1 ? 1 : .5; port = s.home || "ham"; // v5.1.1: Verträge liefern ins Lager im Heimathafen
    const st = staff(s), red = st.ke >= 0 ? (st.ke + 1) / 100 : 0, act = coalActive(s), used = act.filter(k => (k.port || s.home) === port).reduce((a, k) => a + k.share, 0);
    const base = coalBase(s, port), qty = Math.round(base * share), surch = COAL_SURCH[years] - red, mkt = coalPortPrice(s, port);
    const pt = Math.round(mkt * (1 + surch) * 100) / 100, price = Math.round(s.coal * (1 + surch) * 1000) / 1000;
    const why = act.length >= 2 ? "Höchstens zwei Verträge gleichzeitig." : used + share > 1.001 ? "Zusammen höchstens 100 % der Kohle, die Ihre Schiffe im Heimathafen bunkern." : qty < 10 ? "Im Heimathafen haben Ihre Schiffe in den letzten drei Monaten kaum Kohle gebunkert." : "";
    return { years, share, port, qty, pt, price, surch, months: years * 12, monthly: Math.round(qty * pt), total: Math.round(qty * pt * years * 12), now: Math.round(qty * (pt - mkt)), ok: !why, why };
  }
  // Häfen, in denen Ihre Schiffe zuletzt gebunkert haben (für die Wahl des Vertragshafens)
  function coalPorts(s) { const P = s.coalPort || {}; const list = Object.keys(P).filter(p => PORTS[p] && P[p].slice(-3).some(x => x > 0)).sort((a, b) => coalBase(s, b) - coalBase(s, a)); if (!list.includes(s.home || "ham")) list.unshift(s.home || "ham"); return list; }
  function signCoal(s, years, share, renew, port) {
    const o = coalOffer(s, years, share, port); if (!o.ok) return o.why;
    s.coalK = s.coalK || [];
    const k = { id: uid(s), port: o.port, start: renew ? s.m + 1 : s.m, until: s.m + o.months - (renew ? 0 : 1), years: o.years, share: o.share, qty: o.qty, pt: o.pt, price: o.price, stop: -1, warned: false };
    s.coalK.push(k);
    if (!renew && s.lager) { k.dlv = s.m; lagerDeliver(s, k, null); }
    s.log.unshift({ m: s.m, head: renew ? "Kohle-Liefervertrag verlängert" : "Kohle-Liefervertrag geschlossen", text: (o.years === 1 ? "Ein Jahr" : o.years + " Jahre") + ", " + fmt(o.qty) + " Tonnen im Monat ins Kohlelager zu " + Math.round(o.price * 100) + " % des Normalpreises.", kind: "own", img: "ev_kohlevertrag" });
    return null;
  }
  function coalCancelFee(s, k) { return Math.round(Math.max(0, k.until - s.m + 1) * k.qty * (k.pt || COAL_T * k.price) * .25); }
  function cancelCoal(s, id) {
    const k = (s.coalK || []).find(x => x.id === id); if (!k) return "Vertrag nicht gefunden.";
    const fee = coalCancelFee(s, k); expense(s, "Sonderausgaben", fee); s.coalK = s.coalK.filter(x => x !== k);
    s.log.unshift({ m: s.m, head: "Kohle-Liefervertrag gekündigt", text: "Die Kündigung kostet " + fmt(fee) + " Mark – ein Viertel der Restsumme.", kind: "own", img: "ev_kohlevertrag" });
    return null;
  }
  function coalShock(s, de, gb, months) {
    s.coal = clamp(s.coal * ((s.country || "de") === "gb" ? gb : de), .75, 1.8);
    if (months) s.coalFloor = { until: s.m + months - 1, min: Math.round(s.coal * .95 * 1000) / 1000 };
  }
  function coalMonthEnd(s, add) {
    const cur = s.cur, st = staff(s);
    s.coalUse = (s.coalUse || []).concat([Math.round(cur.cuT || 0)]).slice(-6);
    s.coalHist = (s.coalHist || []).concat([{ m: s.m, c: Math.round(s.coal * 1000) / 1000 }]).slice(-120);
    const cp = s.coalPort || (s.coalPort = {});
    for (const p of new Set(Object.keys(cp).concat(Object.keys(cur.cp || {})))) { cp[p] = (cp[p] || []).concat([Math.round((cur.cp && cur.cp[p]) || 0)]).slice(-6); if (cp[p].every(x => !x)) delete cp[p]; }
    // Kohlelager (v5.1.1): Lagergeld, Verbrauch im Heimathafen merken
    if (s.lager) { const L = s.lager; L.use = (L.use || []).concat([Math.round((cur.lagT || 0) + (cur.kaiT || 0))]).slice(-6); const fee = L.t * LAGERGELD * (s.pidx || 1); if (fee >= 1) { add("Lagergeld", fee); s.cash -= fee; } }
    for (const k of (s.coalK || []).slice()) {
      if (k.until === s.m + 3 && st.ke >= 0 && !k.warned) {
        k.warned = true;
        if (st.ke > 0 || rnd(s) > .35) s.log.unshift({ m: s.m, head: "Kohlevertrag läuft in drei Monaten aus", text: "Ihr Kohleneinkäufer erinnert Sie: Der Vertrag über " + Math.round(k.share * 100) + " % der Kohle in " + PORTS[k.port || s.home].name + " endet im " + dateStr(k.until) + ". " + (s.coal * 100 < st.keRenew ? "Bei heutigem Preis würde er verlängern." : "Bei heutigem Preis würde er nicht verlängern."), kind: "own", img: "pers_einkaeufer" });
      }
      if (k.until <= s.m) {
        s.coalK = s.coalK.filter(x => x !== k);
        if (st.ke >= 0 && s.coal * 100 < st.keRenew && !signCoal(s, k.years, k.share, true, k.port)) continue;
        s.log.unshift({ m: s.m, head: "Kohle-Liefervertrag ausgelaufen", text: "Ab jetzt kaufen Sie die Kohle für Ihr Lager wieder selbst, zum Tagespreis.", kind: "own", img: "ev_bunkern" });
      }
    }
    // Lieferverträge liefern die Menge des nächsten Monats ins Lager; Lieferausfall und Zechenstreik setzen aus
    if (s.lager) for (const k of s.coalK || []) {
      if (k.start > s.m + 1 || k.until < s.m + 1 || k.stop >= s.m + 1 || k.dlv >= s.m + 1) continue;
      k.dlv = s.m + 1; const over = lagerDeliver(s, k, add);
      if (over > .5 && !s.sim && !(s.lagerFull > s.m - 3)) { s.lagerFull = s.m; s.log.unshift({ m: s.m, head: "Kohlelager voll", text: "Vom Liefervertrag passten " + fmt(over) + " Tonnen nicht mehr ins Lager. Der Händler hat sie zu 80 % des Preises zurückgenommen.", kind: "bad", img: "ev_bunkern" }); }
    }
  }
  function kitchenMonthEnd(s, add) {
    const cur = s.cur, K = kueche(s);
    s.kuMonth = cur.kuW ? 50 + cur.kuS / cur.kuW : null;
    if (catOn(s, K.cat) && K.cat.k === "billig") K.wob = Math.round((rnd(s) - .5) * 16);
    if (catOn(s, K.cat) && K.cat.k === "hotel" && cur.fine) up(s, "rep", .3);
    if (catOn(s, K.lux) && cur.fine) { s.prestige = (s.prestige || 0) + .2; s.mk.brand = clamp(s.mk.brand + .2, 0, 100); }
    for (const w of ["cat", "lux"]) {
      const c = K[w]; if (!c || c.until !== s.m) continue;
      const raise = Math.round(3 + rnd(s) * 9);
      s.pending.push({ id: "catverl", which: w, k: c.k, years: c.years, raise, day: 2, img: CATERERS[c.k].first ? "kue_alacarte" : "kue_caterer", head: catName(s, c.k) + " will verlängern",
        text: "Der Vertrag läuft aus. " + catName(s, c.k) + " bietet die Verlängerung um " + (c.years === 1 ? "ein Jahr" : "drei Jahre") + " an – " + raise + " % teurer als bisher." });
    }
    if (s.chef && !s.ships.some(x => x.id === s.chef.ship)) {
      const sh = mealShips(s).filter(x => TYPES[x.type].sb[0] > 0).sort((a, b) => TYPES[b.type].sb[0] - TYPES[a.type].sb[0])[0];
      if (sh) s.chef.ship = sh.id; else { s.log.unshift({ m: s.m, head: "Der Meisterkoch geht von Bord", text: "Ohne Schiff mit 1. Klasse auf langer Strecke sucht er sich eine neue Stelle.", kind: "own", img: "ev_koch" }); s.chef = null; }
    }
  }
  function mealShips(s) { return s.ships.filter(sh => { if (!active(s, sh)) return false; const i = infoOf(s, sh); return i && (i.cruise || i.dist >= 40); }); }
  function usesLevel(s, q) { const K = kueche(s); return K.q.includes(q) || s.ships.some(sh => sh.kq && sh.kq.includes(q)); }
  function provRisk(s) {
    const K = kueche(s), st = staff(s); let r = 0;
    if (catOn(s, K.cat) && K.cat.k === "billig") r += .9;
    if (usesLevel(s, 0)) r += .35;
    if (K.eigen && st.pm >= 0 && !catOn(s, K.cat)) r += [.5, .22, .14, .08][st.pm];
    return r;
  }
  function sickness(s, sh) {
    const n = Math.max(5, Math.round(aboard(s, sh) * (.05 + rnd(s) * .1))), sum = Math.round(n * 60 * (s.pidx || 1) / 100) * 100;
    sh.offUntil = Math.max(sh.offUntil || 0, s.t) + 14; expense(s, "Entschädigungen", sum); up(s, "rep", -3);
    const hit = s.expHit || (s.expHit = { si: 0, k: 0 }); hit.ku = (hit.ku || 0) + 15;
    s.log.unshift({ m: s.m, head: "Krankheit an Bord der „" + sh.name + "“", text: n + " Fahrgäste sind nach dem Essen erkrankt. Das Schiff liegt 14 Tage in Quarantäne, die Reederei zahlt " + fmt(sum) + " Mark Entschädigung.", kind: "bad", img: "ev_cholera" });
  }
  function chefShips(s) { return mealShips(s).filter(sh => TYPES[sh.type].sb[0] > 0 && kqEff(s, sh, 0) >= 2); }
  function fineServed(s) { return mealShips(s).filter(sh => [0, 1, 2].some(c => kqEff(s, sh, c) >= 2 && TYPES[sh.type].sb[c] > 0)); }
  // Vorschau (v5.0): Die nächsten 60 Tage werden zweimal vorausgerechnet – unverändert und mit der neuen Einstellung, ohne Zufälle
  const PREV_DAYS = 60;
  function simRun(x) {
    for (let i = 0; i < PREV_DAYS; i++) { dayTick(x); x.t += 1; x.day += 1; }
    const ku = x.cur.kuW ? 50 + x.cur.kuS / x.cur.kuW : null, rep = finalize(x);
    const buy = Object.keys(rep.cost).filter(k => k.startsWith("Bekohlung")).reduce((a, k) => a + rep.cost[k], 0);
    rep.coalUse = rep.coal.useM; rep.profit = rep.rev - Object.values(rep.cost).reduce((a, b) => a + b, 0) + buy - rep.coal.useM; rep.ku = ku; return rep;
  }
  function whatIf(s, apply, kitchen) {
    const json = JSON.stringify(Object.assign({}, s, { log: [], pending: [], fahrten: [] }));
    const mk = () => { const x = JSON.parse(json); x.sim = true; x.cur = newCur(x); for (const sh of x.ships) sh.cur = null; for (const r of x.routes) r.cur = null; return x; };
    const A = mk(), B = mk(); apply(B);
    const a = simRun(A); let b = simRun(B);
    // Küche: Die Fahrgäste merken sich das Essen – auf Dauer zählt auch die Erfahrung „Küche“
    if (kitchen && a.ku != null && b.ku != null && Math.abs(b.ku - a.ku) > .5) { const C = mk(); apply(C); C.exp.ku = clamp((C.exp.ku != null ? C.exp.ku : 50) + b.ku - a.ku, 5, 95); b = simRun(C); }
    const f = 30.4 / PREV_DAYS, d = k => Math.round(((b.cost[k] || 0) - (a.cost[k] || 0)) * f);
    return { coal: Math.round((b.coalUse - a.coalUse) * f), cater: d("Verpflegung"), rev: Math.round((b.rev - a.rev) * f), pax: Math.round((b.pax - a.pax) * f), paxPct: a.pax ? (b.pax - a.pax) / a.pax : 0, net: Math.round((b.profit - a.profit) * f),
      base: { coal: Math.round(a.coalUse * f), cater: Math.round((a.cost.Verpflegung || 0) * f), rev: Math.round(a.rev * f), pax: a.pax * f }, m: s.m, days: PREV_DAYS };
  }
  function prevFahrt(s, stage, shipId) {
    const r = whatIf(s, x => { if (shipId) setShipFahrt(x, shipId, stage); else x.fahrt = stage; });
    const S = shipId ? s : Object.assign({}, s, { fahrt: stage });
    r.post = s.ships.filter(sh => (!shipId || sh.id === shipId) && postNeed(s, sh) > 0).filter(sh => {
      const nsh = shipId ? Object.assign({}, sh, { fahrt: stage || undefined }) : sh, now = fahrtOf(s, sh), next = fahrtOf(S, nsh);
      return postSlow(s, sh, next) && !postSlow(s, sh, now);
    }).map(sh => sh.name);
    return r;
  }
  function prevKq(s, c, q, shipId) { return whatIf(s, x => { if (shipId) setShipKq(x, shipId, c, q); else setKq(x, c, q); }, true); }
  function prevCat(s, k, years) {
    const C = CATERERS[k], r = whatIf(s, x => { x.log = []; signCaterer(x, k, years); }, true);
    r.lower = []; r.upper = [];
    if (!C.first) for (let c = 0; c < 3; c++) { const q = kueche(s).q[c]; if (q < C.levels[0]) r.upper.push(c); if (q > C.levels[C.levels.length - 1]) r.lower.push(c); }
    return r;
  }
  function prevEigen(s, on) { return whatIf(s, x => { kueche(x).eigen = !!on; }, true); }
  function crewCost(s, t) { const st = staff(s); return t.crew * (t.ocean ? OCEAN_CREW : 1) * (DEPT.deck.share * STAFF_PAY[st.deck] + DEPT.maschine.share * STAFF_PAY[st.maschine] + DEPT.service.share * STAFF_PAY[st.service]); }
  function setStaff(s, k, v) {
    const st = staff(s);
    if (DEPT[k]) st[k] = clamp(v | 0, 0, 3);
    else if (k === "insp") st.insp = !!v; else if (k === "inspMin") st.inspMin = clamp(v | 0, 40, 80); else if (k === "markt") st.markt = !!v;
    else if (k === "pk") { st.pk = clamp(v | 0, -1, 3); if (st.pk < 0) pkFire(s); }
    else if (k === "mi" || k === "ke" || k === "pm") { st[k] = clamp(v | 0, -1, 3); if (k === "pm" && st.pm < 0) kueche(s).eigen = false; if (k === "mi") { st.miPlan = null; if (st.mi >= 0) st.miAuto = true; } }
    else if (k === "miAuto") { st.miAuto = !!v; st.miPlan = null; } else if (k === "miSpar") st.miSpar = clamp(v | 0, 100, 150); else if (k === "miVoll") st.miVoll = clamp(v | 0, 60, 100); else if (k === "keRenew") st.keRenew = clamp(v | 0, 70, 150);
  }
  function staffMonthly(s) {
    const st = staff(s), lv = (k, pay) => st[k] >= 0 ? pay * STAFF_PAY[st[k]] : 0;
    return ((st.insp ? INSP_PAY : 0) + (st.markt ? MARKT_PAY : 0) + lv("mi", MI_PAY) + lv("ke", KE_PAY) + lv("pm", PM_PAY) + lv("pk", PK_PAY) + (s.chef ? CHEF_PAY : 0)) * s.wage;
  }
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
    if (x.ku == null) x.ku = 50;
    const tKu = clamp((s.kuMonth != null ? s.kuMonth : 50) - (hit.ku || 0), 5, 95); x.ku += (tKu - x.ku) * .08; hit.ku = (hit.ku || 0) * .9;
    let pw = 0, pv = 0; for (const r of s.routes) { if (r.pk == null || !r.last || !r.last.pax) continue; pw += r.last.pax; pv += r.last.pax * r.pk; }
    if (x.p == null) x.p = 50; if (pw) { const tP = clamp(50 + (pv / pw - PK_REF) * 300, 5, 95); x.p += (tP - x.p) * .08; }
  }
  function rivalMonthly(s) {
    for (const k of RIV_ORDER) { const st = rivState(s, k); st.modern += k === "brandt" ? .004 : 0; st.comBoost = Math.max(0, st.comBoost - .002); }
    for (const r of s.routes) {
      const info = rInfo(s, r); if (!info || !r.last) continue;
      const rv = rivalsOf(s, r, info);
      if (rv.length && r.last.ships && r.last.share > .35 && rnd(s) < .02 * diffOf(s).riv) {
        const k = rv.slice().sort((a, b) => b.w - a.w)[0].k, st = rivState(s, k), R = RIV[k]; st.mood += 1;
        let txt;
        if (k === "elbe" || k === "themse") { s.mods.push({ route: r.id, key: "comp", f: k === "elbe" ? .85 : .92, until: s.m + 6 }); txt = R.name + " senkt auf " + info.name + " die Preise – ein halbes Jahr lang wird es eng."; }
        else if (k === "kopen") { st.comBoost = Math.min(1, st.comBoost + .3); txt = R.name + " lässt die Salons neu ausstatten. Die Fahrgäste schwärmen."; }
        else { r.compMult = (r.compMult || 1) * 1.25; txt = R.name + " setzt mehr Schiffe auf " + info.name + " ein."; }
        s.log.unshift({ m: s.m, head: R.name + " reagiert auf Ihren Erfolg", text: txt, kind: "news", img: R.img });
      }
      if (!rv.length && r.last.pax > 400 && !konzOn(s, r) && !r.konzLost && rnd(s) < .03) {
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
    const meal = info.cruise || info.dist >= 40;
    const row = (spd, com, rep, pf, eu, br, ku, pk) => ({ Preis: w.p * CLS_WP[c] * (1 - pf), Tempo: w.s * 4 * (spd / cs.speed - 1), Komfort: w.c * CLS_WC[c] * .5 * (com - 3), Ruf: w.r * (rep - 50) / 50, Erfahrungen: eu, Bekanntheit: br, "Küche": ku || 0, "Pünktlichkeit": pk || 0 });
    const G = lineGeo(s, r), mo = cal(s.m).mo;
    let me = null;
    if (mine.length) {
      const t0 = mine.map(x => TYPES[x.type]); const spd = mine.reduce((a, x) => a + (TYPES[x.type].speed + (x.spd || 0)) * SPD_LV[staff(s).maschine] * (1 + FAHRT_SPD * (fahrtF(s, x) - 1)), 0) / mine.length;
      const com = t0.reduce((a, t) => a + t.comfort, 0) / t0.length + SVC_LV[staff(s).service];
      const kc = mine.filter(x => TYPES[x.type].sb[c] > 0), kSc = kc.length ? kc.reduce((a, x) => a + Math.min(100, kScore(s, kqEff(s, x, c), c) + (c === 0 && s.chef && s.chef.ship === x.id ? 20 : 0)), 0) / kc.length : 50;
      const ku = meal ? KU_W * KU_CLS[c] * (.5 * (kSc - 50) / 50 + .5 * ((s.exp && s.exp.ku != null ? s.exp.ku : 50) - 50) / 50) : 0;
      me = row(spd, com, s.rep, r.price[c] / (info.refC[c] * pid), expU(info, myExp(s)), mkBonus(s, r, info), ku, pkU(s, r, info, c, r.pk == null ? .9 : r.pk, s.exp && s.exp.p != null ? s.exp.p : 50));
    }
    const riv = rivalsOf(s, r, info).map(x => { const q = rivalStats(s, r, info, x.k); return { k: x.k, name: RIV[x.k].name, img: RIV[x.k].img, row: row(q.spd, q.com, q.rep, q.pf * modFactor(s, r, info, "comp"), q.eu, 0, 0, G ? pkU(s, r, info, c, rivalPk(s, x.k, G, mo), clamp(50 + (RIV_PK[x.k] - PK_REF) * 300, 5, 95)) : 0), pk: G ? rivalPk(s, x.k, G, mo) : null }; });
    const last = r.last || {}, D = last.D || 0;
    return { cls: c, me, riv, pk: r.pk, share: D ? (last.pax || 0) / D : 0, rivShare: Object.fromEntries(Object.entries(last.riv || {}).map(([k, v]) => [k, D ? v / D : 0])) };
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
  function aboard(s, sh) { const v = sh.v, t = TYPES[sh.type]; if (v && v.st === "see" && v.pax && v.pax.length) { let n = 0; for (const g of v.pax) n += g.n[0] + g.n[1] + g.n[2]; return clamp(Math.round(n), 1, t.seats); } return clamp(Math.round(t.seats * clamp(sh.lastLoad || .5, .05, 1)), 1, t.seats); }
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
    teile: { w: 1, img: "wf_buero", news: (s, sh) => { const c = Math.round(PS(s, sh) * .012 / 100) * 100; income(s, "Werft-Gutschriften", c); return ["Gebrauchte Teile zum halben Preis", "Die Werft baut in die „" + sh.name + "“ gut erhaltene Teile aus einem Abwrackschiff ein. Sie sparen " + fmt(c) + " Mark."]; } },
    rabatt: { w: .8, img: "wf_buero", news: (s, sh) => { const c = Math.round(PS(s, sh) * .008 / 100) * 100; income(s, "Werft-Gutschriften", c); return ["Stammkundenrabatt", "Die Werft erlässt Ihnen für die Arbeiten an der „" + sh.name + "“ " + fmt(c) + " Mark – als treuem Kunden."]; } },
    unfall: { w: .6, img: "wf_dock", news: (s, sh) => { const c = Math.round(PS(s, sh) * .01 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 4); return ["Missgeschick beim Ausdocken", "Die „" + sh.name + "“ ist von den Pallen gerutscht. Die Schäden kosten " + fmt(c) + " Mark und vier Tage."]; } },
    material: { w: 1, img: "wf_dock", head: "Stahlplatten fehlen", text: sh => "Für die Arbeiten an der „" + sh.name + "“ fehlen Stahlplatten. Die Werft kann sie teuer aus England kommen lassen – oder man wartet auf die nächste Lieferung.",
      opts: [{ t: "Teuer nachkaufen", h: (s, sh) => fmt(Math.round(PS(s, sh) * .015 / 100) * 100) + " Mark, keine Verzögerung", f: (s, sh) => { const c = Math.round(PS(s, sh) * .015 / 100) * 100; expense(s, "Werft", c); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Auf die Lieferung warten", h: () => "8 bis 18 Tage länger im Dock", f: (s, sh) => { const d = 8 + Math.floor(rnd(s) * 11); sendToDock(s, sh, d); return d + " Tage Verzögerung."; } }] },
    rost: { w: 1, img: "wf_besichtigung", head: "Verdeckter Rostschaden", text: sh => "Unter der Farbe der „" + sh.name + "“ kommt Rost zum Vorschein, schlimmer als gedacht. Der Werftmeister rät zur gründlichen Sanierung.",
      opts: [{ t: "Gründlich sanieren", h: (s, sh) => fmt(Math.round(PS(s, sh) * .03 / 100) * 100) + " Mark, rund eine Woche länger, Zustand steigt", f: (s, sh) => { const c = Math.round(PS(s, sh) * .03 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 6 + Math.floor(rnd(s) * 5)); sh.cond = Math.min(100, sh.cond + 12); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Nur überstreichen", h: () => "billig, aber der Rost frisst weiter", f: (s, sh) => { const c = Math.round(PS(s, sh) * .004 / 100) * 100; expense(s, "Werft", c); sh.cond = Math.max(5, sh.cond - 10); return "Kosten " + fmt(c) + " Mark. Der Zustand leidet."; } }] },
    ingenieur: { w: .8, img: "wf_buero", head: "Der Werftingenieur hat eine Idee", text: sh => "Ein junger Ingenieur schlägt für die „" + sh.name + "“ einen neuen Propeller nach englischem Muster vor. Das Schiff würde spürbar schneller.",
      opts: [{ t: "Umbauen lassen", h: (s, sh) => fmt(Math.round(PS(s, sh) * .04 / 100) * 100) + " Mark, fünf Tage länger, dauerhaft +0,3 Knoten", f: (s, sh) => { if ((sh.spd || 0) >= .9) return "Mehr ist aus diesem Schiff nicht herauszuholen."; const c = Math.round(PS(s, sh) * .04 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, 5); sh.spd = Math.round(((sh.spd || 0) + .3) * 10) / 10; return "Kosten " + fmt(c) + " Mark. Die „" + sh.name + "“ läuft jetzt " + kn2(TYPES[sh.type].speed + sh.spd) + " Knoten."; } },
        { t: "Ablehnen", h: () => "alles bleibt, wie es ist", f: () => "" }] },
    befund: { w: 0, img: "wf_besichtigung", opts: [
        { t: "Sofort beheben", h: (s, sh) => fmt(Math.round(PS(s, sh) * .025 / 100) * 100) + " Mark, " + dockDays(sh.type, "befund") + " Tage länger, Zustand steigt", f: (s, sh) => { const c = Math.round(PS(s, sh) * .025 / 100) * 100; expense(s, "Werft", c); sendToDock(s, sh, dockDays(sh.type, "befund")); sh.cond = Math.min(100, sh.cond + 10); return "Kosten " + fmt(c) + " Mark. Die Frist gilt volle vier Jahre."; } },
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
    let c = t.crew * (t.ocean ? OCEAN_CREW : 1) * s.crewMult * s.wage * (laid ? .25 : 1) + maintCost(s, sh) * (laid ? .5 : 1);
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
    // Geld kommt seit v5.0 in Schüben (bei der Abfahrt): der Berater rechnet mit dem Schnitt der letzten drei Monate
    const h3 = (s.hist || []).slice(-3), avgP = h3.length ? h3.reduce((a, x) => a + x.profit, 0) / h3.length : rep.profit, flow = avgP - (rep.principal || 0);
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

  // Verspätungen durch Ereignisse (v5.0): Schiffe im Hafen fahren später ab, Schiffe auf See kommen später an
  function holdShips(s, list, days, why) { for (const sh of list) { const v = sh.v; if (!v) continue; if (v.st === "see") { v.eta += days; addWhy(v.wyS || (v.wyS = {}), why || "sturm", days); } else { v.rdy = Math.max(v.rdy || 0, s.t) + days; addWhy(v.wyP || (v.wyP = {}), why || "sturm", days); } } return list.length; }
  // Insel- und Postverträge (v5.1): Angebot für Linien zu den Inseln (Sommer bis Herbst) und für die Kanalpost
  function ipLines(s) {
    return s.routes.filter(r => { const k = ipKind(r); if (!k || (k === "insel" && !monthIn(s, [5, 6, 7, 8, 9])) || s.flags["ipA_" + pairKey(r.a, r.b)] > s.m - 12) return false;
      if (Object.values(s.contracts).some(c => pairKey(c.a, c.b) === pairKey(r.a, r.b))) return false;
      return s.ships.some(sh => sh.line === r.id && active(s, sh) && (k !== "post" || TYPES[sh.type].speed >= 12)); });
  }
  function ipEvent(s, r) {
    const info = rInfo(s, r), kind = ipKind(r), sub = Math.round((kind === "post" ? 900 + 25 * info.dist : 1300 + 25 * info.dist) * s.pidx / 100) * 100, pen = 2 * sub;
    s.flags["ipA_" + pairKey(r.a, r.b)] = s.m;
    if (kind === "post") return { a: r.a, b: r.b, kind, sub, pen, minDeps: 26, minSpeed: 12, cname: "Kanalpost " + info.name, head: "Die Post bietet einen Vertrag für " + info.name,
      text: "Die Post sucht eine Reederei für die Kanalpost: " + fmt(sub) + " Mark im Monat für drei Jahre. Dafür fahren Sie jeden Monat mindestens 26-mal mit 12 Knoten oder mehr. Sonst " + fmt(pen) + " Mark Strafe; nach drei verfehlten Monaten ist der Vertrag gekündigt." };
    const isl = PORTS[ISLANDS.includes(r.b) ? r.b : r.a].name;
    return { a: r.a, b: r.b, kind, sub, pen, minDeps: 8, cname: "Inselvertrag " + isl, head: "Inselvertrag für " + isl,
      text: "Die Postverwaltung und die Gemeinde auf " + isl + " suchen eine Reederei für Post und Versorgung: " + fmt(sub) + " Mark im Monat für drei Jahre. Dafür fahren Sie das ganze Jahr, auch im Winter, mindestens 8-mal im Monat. Sonst " + fmt(pen) + " Mark Strafe; nach drei verfehlten Monaten ist der Vertrag gekündigt." };
  }
  // Fährkonzession (v5.1): Versteigerung gegen den Rivalen, zehn Jahre ohne Konkurrenz gegen Pacht und festen Takt
  const KONZ_BID = [.08, .15, .25], KONZ_WIN = [.4, .8, .97];
  function konzLines(s) {
    return s.routes.filter(r => { if (r.cruise || (r.stops && r.stops.length) || r.konz || r.konzLost || s.m - (r.opened || 0) < 36 || r.konzAt > s.m - 120) return false;
      const i = rInfo(s, r); return i && i.kind.cat === "Fähre" && i.dist <= 15 && compDepsOf(s, r, i) > 0 && s.ships.some(sh => sh.line === r.id && active(s, sh)); });
  }
  function konzEvent(s, r, renew) {
    const info = rInfo(s, r), rev = (r.rh || []).reduce((a, x) => a + x, 0), base = Math.max(rev, 6000 * s.pidx), bid = KONZ_BID.map(f => Math.round(base * f / 100) * 100);
    const k = mainRival(s, r, info) || RIV_ORDER.map(x => [x, RIV[x].fit(info)]).sort((a, b) => b[1] - a[1])[0][0];
    r.konzAt = s.m;
    return { id: "konzession", route: r.id, bid, riv: k, img: "ev_konzession", head: (renew ? "Die Fährkonzession läuft aus: " : "Die Stadt versteigert die Fährkonzession: ") + info.name,
      text: "Die Stadt vergibt die Konzession für die Querung " + info.name + " für zehn Jahre. Wer sie bekommt, fährt dort ohne Konkurrenz, zahlt aber jedes Jahr Pacht und muss das ganze Jahr im festen Takt fahren. " + RIV[k].name + " bietet mit. Verlieren Sie, müssen Sie die Querung in sechs Monaten räumen." };
  }
  function konzBid(s, ev, idx) {
    const r = s.routes.find(x => x.id === ev.route); if (!r) return "Die Linie gibt es nicht mehr.";
    const name = rInfo(s, r).name, R = RIV[ev.riv] || RIV.elbe;
    if (idx < 3 && rnd(s) < Math.pow(KONZ_WIN[idx], diffOf(s).riv)) {
      const takt = Math.max(4, Math.round((r.last ? r.last.dep : 0) * .8));
      r.konz = { until: s.m + 120, pacht: Math.round(ev.bid[idx] / 12), takt, miss: 0, since: s.m }; r.konzLost = null; r.compMult = 1;
      return "Zuschlag! Zehn Jahre lang fahren Sie auf " + name + " ohne Konkurrenz. Pacht " + fmt(ev.bid[idx]) + " Mark im Jahr, Pflicht: mindestens " + takt + " Abfahrten in jedem Monat, auch im Winter.";
    }
    r.konzLost = { until: s.m + 6, k: ev.riv }; s.konzBlock = s.konzBlock || {}; s.konzBlock[pairKey(r.a, r.b)] = s.m + 126;
    return R.name + " bekommt den Zuschlag. Sie müssen die Querung bis " + dateStr(s.m + 6) + " räumen.";
  }
  // am Monatsanfang: Zeitkarten, auslaufende Konzessionen, geräumte Querungen
  function ferryMonthly(s) {
    zkMonthly(s);
    { const L = ipLines(s); if (L.length && !s.pending.some(p => p.id === "inselvertrag") && rnd(s) < .35) { const r = pick(s, L); s.pending.push(Object.assign({ id: "inselvertrag", img: "fa_inselpost" }, ipEvent(s, r))); } }
    for (const r of s.routes.slice()) {
      const info = rInfo(s, r);
      if (r.konz && r.konz.until <= s.m) { r.konz = null; if (s.ships.some(sh => sh.line === r.id) && info) s.pending.push(konzEvent(s, r, true)); }
      if (r.konzLost && r.konzLost.until <= s.m) {
        for (const sh of s.ships.filter(x => x.line === r.id)) setLine(s, sh.id, null);
        s.routes = s.routes.filter(x => x !== r);
        s.log.unshift({ m: s.m, head: "Querung geräumt: " + (info ? info.name : ""), text: "Die Konzession gehört jetzt " + (RIV[r.konzLost.k] || RIV.elbe).name + ". Ihre Schiffe liegen auf und warten auf eine neue Linie.", kind: "bad", img: "ev_konzession" });
      }
    }
  }
  function blockPort(s, p, days, why) { s.blk = s.blk || {}; s.blk[p] = Math.max(s.blk[p] || 0, s.t) + days; (s.blkWhy = s.blkWhy || {})[p] = why || "streik"; }
  const inPorts = s => s.ships.filter(sh => sh.v && sh.v.st === "hafen" && active(s, sh));
  const EVENTS = {
    proviant: { when: s => provRisk(s) > 0 && mealShips(s).length > 0, w: s => provRisk(s), cd: 8, img: "ev_proviant",
      make: s => { const sh = pick(s, mealShips(s)), cost = Math.round(Math.max(2000, (sh.last && sh.last.cater || 0) * .6) / 100) * 100; return { ship: sh.id, cost, head: "Verdorbener Proviant auf der „" + sh.name + "“", text: "Beim Bunkern merkt der Koch: Ein Teil der Vorräte ist verdorben. Was soll geschehen?" }; },
      opts: [
        { t: "Alles ersetzen", h: (s, ev) => fmt(ev.cost) + " Mark, kein Risiko", f: (s, ev) => { expense(s, "Sonderausgaben", ev.cost); const hit = s.expHit || (s.expHit = { si: 0, k: 0 }); hit.ku = (hit.ku || 0) + 3; return "Frische Vorräte kommen an Bord."; } },
        { t: "Aussortieren und weiterfahren", h: "billig, aber Fahrgäste könnten krank werden", f: (s, ev) => { const sh = s.ships.find(x => x.id === ev.ship); const hit = s.expHit || (s.expHit = { si: 0, k: 0 }); if (sh && rnd(s) < .4) { sickness(s, sh); return "Das ging schief."; } hit.ku = (hit.ku || 0) + 6; return "Die Fahrgäste murren über das Essen, aber alle bleiben gesund."; } },
      ] },
    koch: { when: s => yearOf(s) >= 1885 && !s.chef && chefShips(s).length > 0, w: .4, cd: 120, img: "ev_koch", ok: (s, ev) => [s.cash >= ev.fee, true],
      make: s => { const sh = chefShips(s).sort((a, b) => TYPES[b.type].sb[0] - TYPES[a.type].sb[0])[0], fee = Math.round(5000 * (s.pidx || 1) / 100) * 100; return { ship: sh.id, fee, head: "Ein berühmter Koch will an Bord", text: "Ein Meisterkoch aus den besten Häusern der Stadt möchte die Küche der „" + sh.name + "“ übernehmen. Er ist teuer – aber die 1. Klasse würde von nichts anderem mehr reden." }; },
      opts: [
        { t: "Anstellen", h: (s, ev) => "Handgeld " + fmt(ev.fee) + " Mark, dazu " + fmt(Math.round(CHEF_PAY * s.wage)) + " Mark im Monat", f: (s, ev) => { expense(s, "Sonderausgaben", ev.fee); s.chef = { ship: ev.ship, since: s.m }; s.mk.brand = clamp(s.mk.brand + 3, 0, 100); return "Ab sofort kocht er in der 1. Klasse."; } },
        { t: "Ablehnen", h: "er sucht sich eine andere Reederei", f: s => "Er zieht weiter." },
      ] },
    kohleknapp: { when: () => false, w: 0, img: "ev_kohle_knapp",
      opts: [
        { t: "Langsam weiterfahren", h: "spart Kohle, kommt später an", f: (s, ev) => coalDecide(s, ev, 0) },
        { t: "Nächsten Hafen anlaufen und nachbunkern", h: "Notkohle 30 % teurer, weniger Verspätung", f: (s, ev) => coalDecide(s, ev, 1) },
        { t: "Holz und Mobiliar verheizen", h: "kaum Verspätung, aber Komfort und Zustand leiden", f: (s, ev) => coalDecide(s, ev, 2) },
      ] },
    catverl: { when: () => false, w: 0, img: "kue_caterer",
      opts: [
        { t: "Verlängern", h: (s, ev) => ev.raise + " % teurer", f: (s, ev) => { const K = kueche(s), c = { k: ev.k, start: s.m, until: s.m + ev.years * 12 - 1, years: ev.years, wage: s.wage * (1 + ev.raise / 100) }; if (CATERERS[ev.k].first) K.lux = c; else { K.cat = c; K.eigen = false; } return "Der Vertrag läuft weiter."; } },
        { t: "Auslaufen lassen", h: "zurück zur eigenen Verpflegung", f: s => "Ab jetzt verpflegen Sie wieder selbst." },
      ] },
    eis: { when: s => monthIn(s, [2, 3, 4]) && inArea(s, "atlantic").length > 0, w: 3, img: "ev_eis",
      head: "Eiswarnung auf dem Nordatlantik", text: "Ihre Kapitäne melden Treibeis auf der nördlichen Route. Wie sollen sie fahren?",
      opts: [
        { t: "Kurs halten", h: "pünktlich, aber riskant", f: s => { if (rnd(s) < .15) hit(s, inArea(s, "atlantic")); else { up(s, "rep", 2); return "Alle Schiffe kamen pünktlich an."; } } },
        { t: "Südliche Route", h: "sicher, rund 9.000 Mark Mehrkosten je Schiff und einen halben Tag länger", f: s => { expense(s, "Sonderausgaben", 9000 * s.pidx * inArea(s, "atlantic").length); holdShips(s, inArea(s, "atlantic"), .5, "eis"); return "Der Umweg kostet Kohle und Zeit, aber alle kommen sicher an."; } },
        { t: "Fahrt verringern", h: "Atlantikfahrten einen Tag länger, geringes Risiko", f: s => { holdShips(s, inArea(s, "atlantic"), 1, "eis"); if (rnd(s) < .03) hit(s, inArea(s, "atlantic")); } },
      ] },
    streik: { when: s => actives(s).length >= 2, w: s => 1 + 1.5 * ["deck", "maschine", "service"].filter(k => staff(s)[k] === 0).length, cd: 30, img: "ev_streik",
      head: "Heizer im Ausstand", text: "Die Heizer fordern mehr Lohn und drohen, die Kessel kalt zu lassen.",
      opts: [
        { t: "Lohn erhöhen", h: "Heuer dauerhaft +5 %", f: s => { s.crewMult *= 1.05; up(s, "rep", 1); } },
        { t: "Kompromiss anbieten", h: "+2,5 % – wenn sie annehmen", f: s => { if (rnd(s) < .55) { s.crewMult *= 1.025; return "Die Heizer nehmen an."; } s.blkAll = Math.max(s.blkAll || 0, s.t) + 3 + Math.floor(rnd(s) * 3); up(s, "rep", -3); return "Abgelehnt – einige Tage lang fährt kein Schiff ab."; } },
        { t: "Aussitzen", h: "eine Woche lang fährt kaum ein Schiff ab", f: s => { s.blkAll = Math.max(s.blkAll || 0, s.t) + 5 + Math.floor(rnd(s) * 4); up(s, "rep", -6); } },
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
    insel: { when: () => false, w: 0, img: "line_helgo", // seit v5.1 als Inselvertrag für alle Inseln (inselvertrag)
      make: s => { const r = routeOf(s, pick(s, onPort(s, "hel"))); return { a: r.a, b: r.b }; },
      head: "Konzession für die Inselpost Helgoland", text: "2.800 Mark im Monat für drei Jahre – aber auch im Winter muss jeden Monat ein Schiff nach Helgoland fahren. Sonst 6.000 Mark Strafe.",
      opts: [
        { t: "Annehmen", h: "Einnahmen im Winter, aber kein Auflegen", f: (s, ev) => { s.contracts.insel = { name: "Inselpost Helgoland", a: ev.a, b: ev.b, sub: 2800, pen: 6000, until: s.m + 36 }; } },
        { t: "Ablehnen", h: "im Winter flexibel bleiben", f: s => { } },
      ] },
    inselvertrag: { when: () => false, w: 0, img: "fa_inselpost", // kommt über ferryMonthly
      opts: [
        { t: "Annehmen", h: "fester Zuschuss, feste Pflicht auch im Winter", f: (s, ev) => { s.contracts["ip_" + pairKey(ev.a, ev.b)] = { name: ev.cname, a: ev.a, b: ev.b, sub: ev.sub, pen: ev.pen, until: s.m + 36, minDeps: ev.minDeps, minSpeed: ev.minSpeed || 0, kind: ev.kind }; s.prestige += 1; return "Der Vertrag läuft ab sofort drei Jahre."; } },
        { t: "Ablehnen", h: "im Winter frei bleiben", f: s => "Die Post sucht sich eine andere Reederei." },
      ] },
    konzession: { when: s => s.m >= 48 && konzLines(s).length > 0, w: 2.5, cd: 4, img: "ev_konzession", make: s => konzEvent(s, pick(s, konzLines(s)), false),
      opts: [
        { t: "Vorsichtig bieten", h: (s, ev) => fmt(ev.bid[0]) + " Mark Pacht im Jahr – gut möglich, dass der Rivale mehr bietet", f: (s, ev) => konzBid(s, ev, 0) },
        { t: "Fair bieten", h: (s, ev) => fmt(ev.bid[1]) + " Mark Pacht im Jahr – meistens reicht das", f: (s, ev) => konzBid(s, ev, 1) },
        { t: "Hoch bieten", h: (s, ev) => fmt(ev.bid[2]) + " Mark Pacht im Jahr – so gut wie sicher", f: (s, ev) => konzBid(s, ev, 2) },
        { t: "Nicht bieten", h: "der Rivale bekommt die Querung, Sie räumen sie in sechs Monaten", f: (s, ev) => konzBid(s, ev, 3) },
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
        { t: "Vor Anker gehen", h: s => "Abfahrten ab " + homeName(s) + " einen Tag später, kein Risiko", f: s => { blockPort(s, s.home || "ham", 1, "nebel"); holdShips(s, onPort(s, s.home || "ham").filter(x => x.v && x.v.st === "see" && x.v.toP === (s.home || "ham")), 1, "nebel"); } },
        { t: "Zusätzliche Lotsen", h: s => fmt(fine(s, 4000)) + " Mark Lotsengeld, geringes Risiko", f: s => { expense(s, "Lotsengeld", fine(s, 4000)); if (rnd(s) < .03) hit(s, onPort(s, s.home || "ham")); } },
      ] },
    rettung: { when: s => seaShips(s).length > 0, w: 1.5, cd: 18, img: "ev_rettung",
      make: s => { const sh = pick(s, seaShips(s)); return { ship: sh.id, text: "Die Besatzung der „" + sh.name + "“ sichtet im Sturm ein sinkendes Fischerboot. Die Männer im Wasser winken verzweifelt." }; },
      head: "Schiffbrüchige in Seenot",
      opts: [
        { t: "Rettung einleiten", h: "Verspätung, aber großes Ansehen", f: (s, ev) => { s.flags.rescued = true; { const sh = shipById(s, ev.ship); if (sh && capFx(s, sh).rescue > 1) { up(s, "rep", 8); s.mk.brand = clamp(s.mk.brand + 4, 0, 100); } } up(s, "rep", 8); s.prestige += 4; s.mk.brand = clamp(s.mk.brand + 6, 0, 100); const sh = shipById(s, ev.ship); if (sh) holdShips(s, [sh], .5, "rettung"); return "Alle Fischer wurden gerettet. Die Zeitungen feiern Ihre Mannschaft."; } },
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
        { t: "Streikbrecher anheuern", h: "Ruf sinkt, Gefahr von Sabotage, langsameres Laden", f: s => { up(s, "rep", -8); holdShips(s, onPort(s, s.home || "ham").filter(x => x.v && x.v.st === "hafen"), 1 + rnd(s), "streik"); if (rnd(s) < .3) { hit(s, onPort(s, s.home || "ham")); return "Auf einem Schiff wurde sabotiert."; } } },
        { t: "Abwarten", h: s => homeName(s) + " ist ein bis zwei Wochen gesperrt", f: s => { const d = 7 + Math.floor(rnd(s) * 8); blockPort(s, s.home || "ham", d); return d + " Tage lang wird im Heimathafen nicht gearbeitet."; } },
      ] },
    eisgang: { when: s => monthIn(s, [0, 1]) && ((s.home === "ham" ? onPort(s, "ham").length : 0) + inArea(s, "balticn").length) > 0, w: 2.5, cd: 11, img: "ev_eisgang",
      head: "Eisgang auf Elbe und Ostsee", text: "Treibeis versperrt das Fahrwasser. Ohne Hilfe kommen Ihre Schiffe kaum voran.",
      opts: [
        { t: "Eisbrecher chartern", h: s => fmt(fine(s, 12000)) + " Mark, der Betrieb läuft weiter", f: s => { const c = expense(s, "Sonderausgaben", fine(s, 12000)); return "Kosten " + fmt(c) + " Mark."; } },
        { t: "Liegen bleiben", h: s => "Abfahrten ab " + homeName(s) + " und in der nördlichen Ostsee vier bis acht Tage später", f: s => { const d = 4 + Math.floor(rnd(s) * 5); if (s.home === "ham") blockPort(s, "ham", d, "eis"); holdShips(s, inArea(s, "balticn"), d, "eis"); return d + " Tage Stillstand."; } },
        { t: "Durchfahren", h: "riskant", f: s => { if (rnd(s) < .2) { hit(s, onPort(s, s.home || "ham")); return "Das Eis hat einen Rumpf aufgerissen."; } return "Mit Glück kamen alle durch."; } },
      ] },
    sturmwarnung: { when: s => monthIn(s, [9, 10, 11, 0, 1, 2]) && seaShips(s).length > 0, w: 2.2, cd: 6, img: "ev_sturmwarnung",
      head: "Sturmwarnung der Seewarte", text: "Die Seewarte meldet einen schweren Orkan. Ihre Schiffe liegen zum Auslaufen bereit.",
      opts: [
        { t: "Planmäßig auslaufen", h: "keine Ausfälle, aber gefährlich", f: s => { if (rnd(s) < .35) { hit(s, seaShips(s)); return "Der Sturm hat zugeschlagen."; } return "Alle Schiffe haben den Sturm abgewettert."; } },
        { t: "Im Hafen abwarten", h: "Schiffe im Hafen laufen ein bis zwei Tage später aus", f: s => { holdShips(s, inPorts(s).filter(x => seaShips(s).includes(x)), 1 + rnd(s)); } },
        { t: "Nur große Schiffe auslaufen lassen", h: "kleine Schiffe laufen später aus, große riskieren den Sturm", f: s => { holdShips(s, inPorts(s).filter(x => seaShips(s).includes(x) && TYPES[x.type].seats < 450), 1 + rnd(s)); if (rnd(s) < .12) { hit(s, seaShips(s).filter(x => TYPES[x.type].seats >= 450)); return "Ein großes Schiff geriet in Schwierigkeiten."; } } },
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
        { t: "Sofort in die Werft", h: "Dockung, einige Tage Ausfall, Zustand steigt", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; const c = Math.round(PS(s, sh) * .035); expense(s, "Werft", c); const d = sendToDock(s, sh, dockDays(sh.type, "dock")); sh.cond = Math.min(100, sh.cond + 20); return "Kosten " + fmt(c) + " Mark, " + d + " Tage Werft."; } },
        { t: "Druck ablassen und weiterfahren", h: "einen Tag langsamer, kleines Risiko", f: (s, ev) => { const sh = shipById(s, ev.ship); if (!sh) return; holdShips(s, [sh], 1, "panne"); if (rnd(s) < .08) { incident(s, sh); return "Trotzdem kam es zum Schaden."; } } },
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
          text: rivalNames(s, r, info) + " " + (rivalsOf(s, r, info).length > 1 ? "stecken in Schwierigkeiten und bieten" : "steckt in Schwierigkeiten und bietet") + " Ihnen " + typeAcc(TYPES[type].name) + " (Baujahr " + (yearOf(s) - Math.floor(age / 12)) + ") für " + fmt(price) + " Mark an – weit unter Marktwert. Die Konkurrenz auf " + info.name + " würde schwächer." };
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
        { t: "Großes Fest mit Kapelle", h: "kostet etwas, Prestige, Ruf und Bekanntheit steigen", f: (s, ev) => { const sh = shipById(s, ev.ship); const cost = sh ? Math.round(2000 + PS(s, sh) * .002) : 2000; expense(s, "Sonderausgaben", cost); s.prestige += 2 + (sh ? Math.round(TYPES[sh.type].price / 2e6) : 0); up(s, "rep", 2); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); return "Kosten: " + fmt(cost) + " Mark."; } },
        { t: "Schlichte Taufe im kleinen Kreis", h: "kein Aufwand", f: s => { } },
      ] },
  };

  const KRISE_W = .12; // zufälliger Börsenkrach nur fern der historischen Krisen, im Schnitt etwa alle 15 bis 20 Jahre (v4.5: w 1, etwa alle drei Jahre)
  const NEWS = {
    welle: { when: s => true, w: 1.2, img: "ev_welle", f: s => { s.mods.push({ line: "*", key: "demand", seg: "ausw", f: 1.45, until: s.m + 8 }); return ["Auswandererwelle erreicht die Häfen", "Tausende warten auf eine Überfahrt nach Amerika. Die Nachfrage der Auswanderer steigt deutlich."]; } },
    krise: { when: s => s.konj > .9 && !boNearCrisis(s), w: KRISE_W, img: "ev_krise", f: s => { boCrisis(s, .75); return ["Börsenkrach – die Wirtschaft stockt", "Weniger Reisende, fallende Schiffspreise, steigende Zinsen. Banken prüfen ihre Kredite genauer."]; } },
    boom: { when: s => s.konj < 1.1, w: .8, f: s => { s.konj = Math.min(1.25, s.konj + .15); return ["Die Geschäfte brummen", "Handel und Industrie wachsen kräftig. Es wird mehr gereist als je zuvor."]; } },
    preis: { when: s => ownRoutesWithComp(s).length > 0, w: 1.3, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i); s.mods.push({ route: r.id, key: "comp", f: .8, until: s.m + 6 }); boHit(s, k, -.05); return ["Preiskampf auf " + i.name, RIV[k].name + " senkt dort die Fahrpreise um 20 % – vorerst für ein halbes Jahr.", RIV[k].img]; } },
    kaiser: { when: s => monthIn(s, [3, 4, 5]), w: 1, img: "line_helgo", f: s => { s.mods.push({ port: "hel", key: "demand", f: 1.5, until: s.m + 2 }); return ["Kaiserbesuch auf Helgoland angekündigt", "Die Insel erwartet einen Ansturm von Schaulustigen."]; } },
    konk: { when: s => ownRoutesWithComp(s).length > 0, w: 1, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i); r.compMult = (r.compMult || 1) * 1.3; r.compSpeedAdd = (r.compSpeedAdd || 0) + .5; boHit(s, k, .03); return [RIV[k].name + " verstärkt die Flotte", "Mehr Abfahrten und schnellere Schiffe auf " + i.name + ".", RIV[k].img]; } },
    kohle: { when: s => s.coal < 1.15, w: .7, img: "ev_kohle", f: s => { s.coal = 1.3; return ["Kohle wird teuer", "Streiks in den Zechen treiben den Kohlepreis um 30 % nach oben."]; } },
    verzug: { when: s => s.ships.some(sh => sh.ready > s.m + 1), w: 1.5, f: s => { const sh = pick(s, s.ships.filter(x => x.ready > s.m + 1)), r0 = sh.ready; for (const x of s.ships) if (x !== sh && x.type === sh.type && !!x.brandt === !!sh.brandt && x.ready >= r0) x.ready += 2; sh.ready += 2; return ["Bauverzug bei der Werft", "Die Ablieferung der „" + sh.name + "“ verschiebt sich auf " + dateStr(sh.ready) + "."]; } },
    rabatt: { when: s => !(s.discount && s.discount.until >= s.m), w: .8, f: s => { s.discount = { f: .9, until: s.m + 3 }; return ["Werft bietet Sonderkonditionen", "Freie Hellingplätze: 10 % Rabatt auf alle Neubauten, die bis " + dateStr(s.m + 3) + " bestellt werden."]; } },
    sturmflut: { when: s => monthIn(s, [9, 10, 11, 0, 1, 2]), w: .8, img: "ev_sturmflut", f: s => { const cost = Math.round(8000 + fleetValue(s) * .003); expense(s, "Sonderausgaben", cost); const hh = onPort(s, s.home || "ham"); if (hh.length) { const sh = pick(s, hh); sh.cond = Math.max(5, sh.cond - 8); } return ["Sturmflut im Hamburger Hafen", "Das Wasser steht über den Kais. Schäden an Anlegern und Schiffen kosten Sie " + fmt(cost) + " Mark."]; } },
    sturmserie: { when: s => monthIn(s, [10, 11, 0, 1]) && seaShips(s).length > 0, w: .9, img: "ev_sturmwarnung", f: s => { s.mods.push({ line: "*", key: "risk", f: 1.8, until: s.m + 2 }); s.mods.push({ line: "*", key: "wx", f: 1.5, until: s.m + 2 }); return ["Orkane über der Nordsee", "Die Seewarte erwartet eine ganze Serie schwerer Stürme. Die Gefahr für Schiffe auf See ist deutlich erhöht."]; } },
    rekord: { when: s => actives(s).length > 0, w: .8, f: s => { const sh = pick(s, actives(s)); s.prestige += 2; up(s, "rep", 1); s.mk.brand = clamp(s.mk.brand + 2, 0, 100); return ["Neuer Streckenrekord", "Die „" + sh.name + "“ schafft die Fahrt schneller als je ein Schiff zuvor."]; } },
    band: { when: s => !s.stats.band && shipsWhere(s, (i, r, sh) => (r.a === "ny" || r.b === "ny") && TYPES[sh.type].speed >= i.comp.speed + 3).length > 0, w: 4, f: s => { s.stats.band = true; s.prestige += 25; up(s, "rep", 5); s.mk.brand = clamp(s.mk.brand + 15, 0, 100); return ["Das Blaue Band geht nach Hamburg!", s.name + " stellt einen neuen Rekord über den Atlantik auf. Die Buchungen nach New York ziehen an."]; } },
    bahn: { when: s => s.routes.some(r => !r.railHit && rInfo(s, r) && rInfo(s, r).dist < 150 && !rInfo(s, r).areas.includes("north") && r.a !== "hel" && r.b !== "hel"), w: .6, img: "line_kiel",
      f: s => { const list = s.routes.filter(r => !r.railHit && rInfo(s, r).dist < 150 && !rInfo(s, r).areas.includes("north") && r.a !== "hel" && r.b !== "hel"); const r = pick(s, list), i = rInfo(s, r); r.railHit = true; r.demMult = (r.demMult || 1) * .8; return ["Neue Eisenbahn parallel zu " + i.name, "Die Bahn ist schneller und fährt öfter. Ein Teil der Fahrgäste steigt dauerhaft um."]; } },
    hafenausbau: { when: s => s.routes.length > 0, w: .7, f: s => { const r = pick(s, s.routes), p = pick(s, [r.a, r.b]); s.pm[p] = Object.assign({}, s.pm[p], { fee: ((s.pm[p] || {}).fee || 1) * .85 }); s.pmVer++; return ["Hafen " + PORTS[p].name + " wird ausgebaut", "Neue Kais und Kräne – die Liegezeiten werden kürzer, und mehr Reisende kommen in die Stadt."]; } },
    versicherung: { when: s => s.insMult <= 1 && s.stats.sunk > 0, w: .8, f: s => { s.insMult = 1.25; s.mods.push({ line: "*", key: "ins", f: 1, until: s.m + 12 }); s.flags.insUntil = s.m + 12; return ["Versicherer erhöhen die Prämien", "Nach mehreren Unglücken verlangen die Seeversicherer ein Jahr lang 25 % mehr."]; } },
    pleite: { when: s => ownRoutesWithComp(s).length > 0, w: .7, f: s => { const r = pick(s, ownRoutesWithComp(s)), i = rInfo(s, r), k = mainRival(s, r, i), st = rivState(s, k); st.weak = .5; st.weakUntil = s.m + 12; boHit(s, k, -.25); return [RIV[k].name + " in Schwierigkeiten", "Der Rivale muss sparen und streicht für ein Jahr viele Abfahrten. Seine Fahrgäste suchen neue Schiffe.", RIV[k].img]; } },
    epidemie: { when: s => s.routes.some(r => ["rio", "bue", "sha", "ale"].includes(r.a) || ["rio", "bue", "sha", "ale"].includes(r.b)), w: .6, f: s => { const p = pick(s, ["rio", "bue", "sha", "ale"].filter(x => s.routes.some(r => r.a === x || r.b === x))); s.mods.push({ port: p, key: "demand", f: .6, until: s.m + 4 }); return ["Gelbfieber in " + PORTS[p].name, "Die Behörden raten von Reisen ab. Die Buchungen gehen für einige Monate deutlich zurück."]; } },
  };
  Object.assign(NEWS, {
    lieferausfall: { when: s => coalActive(s).some(k => !(k.stop >= s.m)), w: .5, img: "ev_bunkern", f: s => { const k = pick(s, coalActive(s).filter(k => !(k.stop >= s.m))), n = 1 + Math.floor(rnd(s) * 3); k.stop = s.m + n - 1; return [rnd(s) < .5 ? "Streik bei Ihrem Kohlenlieferanten" : "Grubenunglück bei Ihrem Kohlenlieferanten", "Der Lieferant kann " + (n === 1 ? "einen Monat" : n + " Monate") + " lang nicht liefern. Bis dahin bunkern Ihre Schiffe zum Marktpreis."]; } },
    kuechenlob: { when: s => fineServed(s).length > 0, w: s => .3 + .1 * Math.min(5, fineServed(s).length), img: "ev_presse", f: s => { const sh = pick(s, fineServed(s)); s.mk.brand = clamp(s.mk.brand + 3, 0, 100); up(s, "rep", 2); const hit = s.expHit || (s.expHit = { si: 0, k: 0 }); hit.ku = (hit.ku || 0) - 6; return ["Lob für Ihre Küche", "Die Zeitung schwärmt vom Essen an Bord der „" + sh.name + "“. Reisende fragen gezielt nach Ihrer Reederei."]; } },
    krankheit: { when: s => mealShips(s).length > 0 && (usesLevel(s, 0) || (catOn(s, kueche(s).cat) && kueche(s).cat.k === "billig")), w: .15, img: "ev_cholera", f: s => { sickness(s, pick(s, mealShips(s))); return null; } },
    caterpleite: { when: s => catOn(s, kueche(s).cat), w: s => CATERERS[kueche(s).cat.k].fail * .5, img: "kue_caterer", f: s => { const K = kueche(s), n = catName(s, K.cat.k); K.cat = null; K.notUntil = s.m; return [n + " ist pleite", "Ihr Caterer hat Konkurs angemeldet. Diesen Monat gibt es an Bord nur Notverpflegung, danach verpflegen Sie wieder selbst."]; } },
    kochweg: { when: s => s.chef && s.m - s.chef.since >= 12, w: .25, img: "ev_koch", f: s => { s.chef = null; const st = rivState(s, "kopen"); st.comBoost += .15; return ["Ihr Meisterkoch wird abgeworben", "Die Kopenhagener Salonlinie bietet ihm mehr Geld. Er geht – und nimmt seine Rezepte mit."]; } },
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
    { y: 1893, mo: 4, key: "panik93", img: "ev_krise", f: s => { boCrisis(s, .72); return ["Panik an den Börsen", "In New York und London brechen die Kurse ein, Banken schließen ihre Schalter. Weniger Reisende, fallende Schiffspreise, steigende Zinsen."]; } },
    { y: 1907, mo: 9, key: "panik07", img: "ev_krise", f: s => { boCrisis(s, .7); return ["Bankenpanik in New York", "Ein Ansturm auf die Banken reißt die Börsen in aller Welt mit. Die Wirtschaft stockt, Banken prüfen ihre Kredite genauer."]; } },
    { y: 1914, mo: 6, key: "schluss14", img: "ev_krise", f: s => { boCrash(s, .85); s.bo.closed = s.m + 4; return ["Die Börsen schließen", "Ende Juli stellen die Börsen in London, Berlin und New York den Handel ein. Bis Dezember ruht der Aktienhandel, die Kurse sind eingefroren."]; } },
    { y: 1929, mo: 9, key: "krach29", img: "ev_krise", f: s => { boCrisis(s, .65); return ["Der große Börsenkrach", "An der Wall Street stürzen die Kurse ins Bodenlose. Die Krise erfasst die ganze Welt: weniger Reisende, fallende Schiffspreise, steigende Zinsen."]; } },
    { y: 1882, mo: 4, key: "irland82", img: "gb_queenstown", f: s => { s.mods.push({ port: "que", key: "demand", f: 1.4, until: s.m + 12 }); return ["Auswanderungswelle aus Irland", "Missernten und Not treiben Zehntausende nach Amerika. In Queenstown drängen sich die Auswanderer an den Tendern."]; } },
    { y: 1886, mo: 4, key: "tilbury86", img: "gb_dover", f: s => { s.pmVer++; return ["Die Tilbury Docks eröffnen", "Unterhalb von London entstehen neue, tiefe Docks. Die Bahn bringt Reisende bis an die Schiffe – Tilbury wird zum Fährbahnhof."]; } },
    { y: 1889, mo: 4, key: "kohle89", img: "ev_bunkern", f: s => { s.coalStrike = { c: "de", until: s.m + 2 }; coalShock(s, 1.25, 1.1, 3); return ["Bergarbeiterstreik an der Ruhr", "Zehntausende Bergleute legen die Arbeit nieder. Kohle wird knapp und teuer."]; } },
    { y: 1893, mo: 7, key: "kohle93", img: "ev_bunkern", f: s => { coalShock(s, 1.1, 1.3, 4); return ["Aussperrung im britischen Kohlenbergbau", "Die Grubenbesitzer sperren Hunderttausende Bergleute aus. Britische Kohle wird knapp und teuer."]; } },
    { y: 1905, mo: 0, key: "kohle05", img: "ev_bunkern", f: s => { s.coalStrike = { c: "de", until: s.m + 1 }; coalShock(s, 1.2, 1.05, 2); return ["Großer Bergarbeiterstreik an der Ruhr", "Der größte Streik seit 1889 legt die Zechen still. Die Reedereien bunkern teure Auslandskohle."]; } },
    { y: 1912, mo: 2, key: "kohle12", img: "ev_bunkern", f: s => { s.coalStrike = { c: "gb", until: s.m + 1 }; coalShock(s, 1.15, 1.4, 2); return ["Britischer Kohlestreik", "Fast eine Million Bergleute streiken für einen Mindestlohn. In britischen Häfen liegen Schiffe ohne Kohle fest."]; } },
    { y: 1923, mo: 0, key: "kohle23", img: "ev_bunkern", f: s => { coalShock(s, 1.4, 1.1, 6); return ["Ruhrbesetzung", "Französische und belgische Truppen besetzen das Ruhrgebiet. Deutsche Kohle wird knapp, die Reedereien kaufen in England."]; } },
    { y: 1926, mo: 4, key: "kohle26", img: "ev_bunkern", f: s => { s.coalStrike = { c: "gb", until: s.m + 6 }; coalShock(s, 1.1, 1.45, 7); return ["Britischer Bergarbeiterstreik", "Nach dem Generalstreik bleiben die Bergleute monatelang den Zechen fern. Kohle wird knapp und teuer."]; } },
    { y: 1889, mo: 8, key: "dockstrike89", img: "gb_streik", f: s => { s.mods.push({ port: "lon", key: "demand", f: .6, until: s.m + 1 }); blockPort(s, "lon", 10); return ["Großer Hafenstreik in London", "Zehntausende Dockarbeiter kämpfen um sechs Pence Stundenlohn. Der Londoner Hafen steht fast einen Monat still."]; } },
    { c: "gb", y: 1894, mo: 4, key: "shipcanal94", img: "gb_kanal", f: s => { s.mods.push({ port: "lpl", key: "demand", seg: "bath", f: 1.15, until: s.m + 12 }); s.mods.push({ port: "lpl", key: "demand", seg: "biz", f: .95, until: s.m + 24 }); return ["Der Manchester-Schiffskanal ist eröffnet", "Große Schiffe fahren jetzt bis nach Manchester. Liverpool verliert etwas Handel – aber Ausflüge durch den neuen Kanal sind der Renner des Sommers."]; } },
    { y: 1911, mo: 5, key: "lplstrike11", img: "gb_streik", f: s => { s.mods.push({ port: "lpl", key: "demand", f: .5, until: s.m + 2 }); blockPort(s, "lpl", 14); return ["Generalstreik im Liverpooler Hafen", "Hafenarbeiter, Seeleute und Eisenbahner legen die Arbeit nieder. Zwei Monate lang geht im Liverpooler Hafen fast nichts."]; } },
    { c: "de", y: 1881, mo: 5, key: "cuxbahn", img: "line_cux", f: s => { s.pair[pairKey("ham", "cux")] = .75; s.pmVer++; return ["Eisenbahn nach Cuxhaven eröffnet", "Die neue Niederelbebahn bringt Ausflügler in zwei Stunden an die Küste. Die Dampfer nach Cuxhaven verlieren Fahrgäste."]; } },
    { y: 1886, mo: 8, key: "gold86", img: "line_sued", f: s => { s.pm.kap = Object.assign({}, s.pm.kap, { ziel: 4 }); s.pmVer++; return ["Goldfunde am Witwatersrand", "In Südafrika wurde Gold entdeckt. Tausende wollen nach Kapstadt."]; } },
    { y: 1889, mo: 4, key: "expo89", img: "ev_expo", f: s => { for (const p of ["lon", "hav", "rot", "ant", "ams"]) s.mods.push({ port: p, key: "demand", f: 1.35, until: s.m + 6 }); return ["Weltausstellung in Paris eröffnet", "Der neue Eiffelturm lockt Besucher aus ganz Europa. Die Nachfrage nach London, Le Havre und den Niederlanden steigt."]; } },
    { c: "de", y: 1892, mo: 5, key: "norddeich92", img: "line_norder", f: s => { s.pm.ndd = Object.assign({}, s.pm.ndd, { pop: 2.5 }); s.pmVer++; return ["Die Bahn fährt bis Norddeich", "Badegäste aus dem ganzen Reich kommen jetzt direkt an die Mole. Die Inseln erwarten Rekordsommer."]; } },
    { c: "de", y: 1892, mo: 7, key: "cholera92", img: "ev_cholera", f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .55, until: s.m + 3 }); s.mods.push({ line: "*", key: "demand", seg: "ausw", f: .5, until: s.m + 4 }); return ["Cholera in Hamburg", "Eine Epidemie wütet in der Stadt. Viele Häfen verweigern Hamburger Schiffen die Einfahrt, Auswanderer bleiben aus."]; } },
    { y: 1893, mo: 4, key: "expo93", img: "line_ny", f: s => { s.mods.push({ port: "ny", key: "demand", f: 1.3, until: s.m + 6 }); return ["Weltausstellung in Chicago", "Ganz Europa will Amerika sehen. Die Buchungen nach New York steigen."]; } },
    { y: 1895, mo: 5, key: "kanal95", img: "line_kanal", f: s => { s.pmVer++; return ["Der Kaiser-Wilhelm-Kanal ist eröffnet", "Von Hamburg in die Ostsee ohne den Umweg um Skagen: Fahrten nach Kiel, Kopenhagen oder Stockholm werden viel kürzer."]; } },
    { c: "de", y: 1896, mo: 10, key: "streik96", img: "ev_hafenstreik", f: s => { s.mods.push({ port: s.home || "ham", key: "demand", f: .65, until: s.m + 3 }); blockPort(s, "ham", 12); return ["Großer Hafenarbeiterstreik in Hamburg", "Zehntausende legen die Arbeit nieder. Der Hafen steht still – für Wochen."]; } },
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
  // Schiffstyp mit unbestimmtem Artikel im Akkusativ (v5.1: vorher immer „einen“, auch bei Fähren)
  const typeAcc = n => /fähre$|Fähre$/.test(n.split(" ")[0]) || /fähre$/.test(n) ? "eine " + n : /(schiff|boot)\b/.test(n.split(" mit ")[0]) ? "ein " + n : "einen " + n.replace(/^(\S+)er (?=\S)/, "$1en ").replace(/riese$/, "riesen");
  const typeNom = n => /fähre$|Fähre$/.test(n.split(" ")[0]) || /fähre$/.test(n) ? "Ihre neue " + n : /(schiff|boot)\b/.test(n.split(" mit ")[0]) ? "Ihr neues " + n : "Ihr neuer " + n;
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
    s.coal += (1 - s.coal) * .07 + (rnd(s) - .5) * .06; s.coal = clamp(s.coal, .75, 1.6);
    if (s.coalFloor && s.coalFloor.until >= s.m) s.coal = Math.max(s.coal, s.coalFloor.min);
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
    // Ereignisse vom Monatsletzten sind am Ersten des neuen Monats fällig (v5.0.1: vorher erst am selben Tag des Folgemonats)
    for (const p of s.pending) if (p.day != null && p.day < s.day) p.day = 1;
    guard(s, "Börse", () => boRescue(s));
    let rep = guard(s, "Monatsabschluss", () => monthEnd(s));
    if (!rep) { rep = { m: s.m, lines: {}, rev: 0, tickets: 0, freight: 0, extra: {}, cost: {}, profit: 0, events: [], principal: 0 }; s.cur = newCur(s); }
    const delivered = s.ships.filter(sh => sh.ready === s.m + 1);
    for (const sh of delivered) { const r = routeOf(s, sh); s.log.unshift({ m: s.m + 1, head: "„" + sh.name + "“ abgeliefert", text: "Das neue Schiff liegt bereit" + (r ? " und fährt ab jetzt auf " + rInfo(s, r).name + "." : ". Weisen Sie ihm in der Flotte eine Linie zu."), kind: "own", img: "ship_" + sh.type }); }
    for (const sh of s.ships) if (sh.charter === s.m) s.log.unshift({ m: s.m, head: "„" + sh.name + "“ zurück aus der Charter", text: "Das Schiff steht wieder für Ihre Linien bereit.", kind: "own" });
    s.last = rep;
    const costSum = Object.values(rep.cost).reduce((a, b) => a + b, 0);
    s.hist.push({ m: s.m, cash: Math.round(s.cash), eq: Math.round(equity(s)), profit: Math.round(rep.profit), rev: Math.round(rep.rev), cost: Math.round(costSum), pax: Math.round(rep.pax || 0), ships: s.ships.length });
    s.years = s.years || {}; const yy = cal(s.m).y, Y = s.years[yy] || (s.years[yy] = { rev: 0, cost: 0, profit: 0, pax: 0, eq: 0, ships: 0 });
    Y.rev += Math.round(rep.rev); Y.cost += Math.round(costSum); Y.profit += Math.round(rep.profit); Y.pax += Math.round(rep.pax || 0); Y.eq = Math.round(equity(s)); Y.ships = s.ships.length; Y.costs = Y.costs || {}; for (const k in rep.cost) Y.costs[k] = Math.round((Y.costs[k] || 0) + rep.cost[k]);
    if (rep.coal) { const C = Y.coal || (Y.coal = { bt: 0, bm: 0, ut: 0, um: 0 }); C.bt += rep.coal.buyT; C.bm += rep.coal.buyM; C.ut += rep.coal.useT; C.um += rep.coal.useM; }
    if (s.hist.length > 360) s.hist.shift();
    for (const x of rep.events) s.log.unshift({ m: s.m, head: "Vertragsstrafe", text: x, kind: "bad" });
    if (s.negMonths >= 4 || s.cash < -Math.max(80000, fleetValue(s) * .15)) {
      s.over = "konkurs"; s.log.unshift({ m: s.m, head: s.name + " ist zahlungsunfähig", text: "Das Konkursgericht übernimmt die Geschäfte.", kind: "bad" }); return rep;
    }
    guard(s, "Berater", () => advisorCheck(s, rep));
    s.m += 1; s.day = 1; s.cur = newCur(s);
    if (s.musDue) { s.musDue = false; guard(s, "Museum", () => museumMonthly(s)); }
    guard(s, "Welt", () => world(s));
    guard(s, "Börse", () => boMonthly(s));
    guard(s, "Fahrstufe", () => fahrtAuto(s));
    guard(s, "Fährgeschäft", () => ferryMonthly(s));
    guard(s, "Saisonfahrplan", () => { for (const sh of s.ships) applyPlan(s, sh); });
    guard(s, "Werft", () => majorCheck(s));
    guard(s, "Saison", () => seasonCheck(s));
    guard(s, "Emil", () => emilMonthly(s));
    guard(s, "Kapitäne", () => capOffer(s));
    guard(s, "Altschiffe", () => lateMonthly(s));
    if (!s.flags.traum && !s.flags.traumOffered && SPECIAL_ORDER.every(k => s.ships.some(x => x.type === k))) { s.flags.traumOffered = true; s.pending.push({ id: "traum", day: 2, img: "ev_traumkai", head: "Ein Wunder am Kai", text: "Heute Morgen lag es plötzlich im Hafen: ein strahlend weißes Schiff ohne Masten und Segel, mit Palmen an Deck und Liegestühlen in der Sonne. Der Kapitän überreicht Ihnen die Papiere – ausgestellt auf Ihre Reederei. Ganz Hamburg reibt sich die Augen." }); }
    for (const sh of delivered) if (sh.isNew && s.ships.includes(sh)) { sh.isNew = false; if (sh.series && !sh.seriesFirst) continue; s.pending.push({ id: "taufe", day: 1, ship: sh.id, head: "Schiffstaufe der „" + sh.name + "“", text: typeNom(TYPES[sh.type].name) + " liegt festlich beflaggt an der Werft. Wie soll getauft werden?", img: "ev_taufe" }); }
    guard(s, "Ereignisse", () => rollEvents(s));
    guard(s, "Takt", () => { for (const r of s.routes) respace(s, r); });
    for (const p in (s.blk || {})) if (s.blk[p] < s.t) delete s.blk[p];
    if (s.blkAll != null && s.blkAll < s.t) delete s.blkAll;
    for (const p of s.pending) if (p.day == null) p.day = 3 + Math.floor(rnd(s) * 22);
    s.pending.sort((x, y) => x.day - y.day);
    s.log = s.log.slice(0, 60);
    return rep;
  }
  // Ein Tag vergeht. null = angehalten (fälliges Ereignis oder Spielende)
  function advanceDay(s) {
    if (s.over || duePending(s)) return null;
    s.pauseQ = [];
    guard(s, "Tag", () => dayTick(s));
    s.day += 1; s.t = (s.t || 0) + 1;
    guard(s, "Inspektor", () => inspectorDay(s));
    guard(s, "Kapitäne", () => captainsDay(s));
    guard(s, "Erfolge", () => achCheck(s));
    guard(s, "Schiffe", () => shipsDay(s));
    const pause = s.pauseQ || []; delete s.pauseQ;
    if (s.day > dim(s.m)) { const month = closeMonth(s); if ((s.pause || PAUSE_DEF).month && !s.over) pause.push({ k: "month", text: dateStr(month.m) + " ist abgeschlossen." }); return { month, pause }; }
    return { day: s.day, pause };
  }
  function shipsDay(s) {
    for (const sh of s.ships) {
      if (sh.dockUntil === s.t) { const r = routeOf(s, sh); s.log.unshift({ m: s.m, head: "„" + sh.name + "“ ist zurück im Dienst", text: "Die Werft hat die Arbeiten abgeschlossen. " + (r && !sh.laid ? "Das Schiff fährt wieder auf " + rInfo(s, r).name + "." : "Weisen Sie ihm in der Flotte eine Linie zu."), kind: "own", img: "ship_" + sh.type }); }
      if (sh.survey != null && sh.ready <= s.m && !inDock(s, sh) && sh.museum && sh.museum === "aktiv" && !(sh.restoreUntil > s.t)) { // v5.1.1: Frist der betriebsfähigen Museumsschiffe
        if (sh.survey - s.t === 30) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ läuft in 30 Tagen ab", text: "Erneuern Sie die Frist im Museum, sonst darf das Schiff keine Nostalgiefahrten mehr machen.", kind: "bad", img: "wf_besichtigung" });
        if (sh.survey === s.t) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ abgelaufen", text: "Das Museumsschiff darf erst wieder fahren, wenn die Frist erneuert ist.", kind: "bad", img: "wf_besichtigung" });
      }
      if (sh.survey != null && sh.ready <= s.m && !inDock(s, sh) && !sh.museum) {
        if (sh.survey - s.t === 30) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ läuft in 30 Tagen ab", text: "Erneuern Sie die Frist in der Flotte, sonst darf das Schiff nicht mehr auslaufen.", kind: "bad", img: "wf_besichtigung" });
        if (sh.survey === s.t) s.log.unshift({ m: s.m, head: "Frist der „" + sh.name + "“ abgelaufen", text: "Das Schiff liegt fest und ist nicht versichert, bis die Frist erneuert ist.", kind: "bad", img: "wf_besichtigung" });
      }
    }
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
  // v5.1: Der Preis steigt mit Reichweite (ab 500 sm) und Größe (ab 600 Plätzen) deutlich stärker als bis v5.0.1 (price0)
  const priceF = t => (t.range > 500 ? 1 + .5 * Math.log10(t.range / 500) : 1) * (t.seats > 600 ? 1 + .08 * Math.log2(t.seats / 600) : 1);
  for (const k in TYPES) { const t = TYPES[k]; t.price0 = t.price; t.price = Math.round(t.price * priceF(t) / 1000) * 1000; }
  for (const k of ["watt", "seebad", "kaiserbad", "flussrad", "kanalrad"]) TYPES[k].paddle = true;
  for (const k of ["turbine", "lusitania", "titanic"]) if (TYPES[k]) TYPES[k].turbineDrive = true;
  for (const k of ["kurier", "sued", "hansa", "komet", "reichspost", "meteor", "paris", "augusta"]) if (TYPES[k]) TYPES[k].figure = true;
  { const ins = (after, keys) => { const i = TYPE_ORDER.indexOf(after); TYPE_ORDER.splice(i + 1, 0, ...keys); };
    ins("trajekt", ["f12", "f24", "f35", "f50", "f60"]); ins("turbine", ["n12", "n24", "n35", "n50", "n60"]); ins("kreuz", ["o12", "o24", "o35", "o50", "o60"]); }
  const typeGroup = k => { const t = TYPES[k]; if (t.grp != null) return t.grp; if (t.design) return 0; return t.ocean ? 2 : ["hafen", "wagenfaehre", "flussrad", "inselpost", "kanalrad", "moewe", "watt", "seebad", "kaiserbad", "trajekt"].includes(k) ? 0 : 1; };

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
    extras: { sonne: { name: "Sonnendeck" }, laderaum: { name: "Kleiner Laderaum" }, eis: { name: "Eisverstärkung" }, wagendeck: { name: "Wagendeck" }, postraum: { name: "Postraum" } },
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
    let wagons = b.wagons || 0; if (ex.wagendeck && !wagons) { wagons = clamp(Math.round(b.seats / 30), 4, 8); seats *= .7; price *= 1.05; } // v5.1
    if (ex.postraum) { cargo += .1; seats *= .95; price *= 1.02; }
    if ((d.funnels || 1) > 1) price *= 1.02;
    seats = Math.max(20, Math.round(seats / 10) * 10);
    const f = seats / b.seats, sb = b.sb.map(x => Math.round(x * f / 10) * 10); sb[sb.indexOf(Math.max(...sb))] += seats - sb.reduce((a, c) => a + c, 0);
    return { name: b.name, cls: "Eigener Entwurf „" + d.name + "“", price: Math.round(price / 1000) * 1000, seats, sb, speed: Math.round(spd * 10) / 10, comfort: Math.round(comfort * 10) / 10, crew: Math.round(crew), coal: Math.round(coal * 100) / 100,
      build: b.build + 1, from: b.from, range: b.range, shallow, cargo: cargo || undefined, motor: d.drive === "motor" || b.motor, paddle: d.drive === "rad", ice: !!ex.eis, design: d.id, base: d.base, prestige: (d.funnels || 1) > 1 ? 2 : 0,
      wagons: wagons || undefined, post: !!(ex.postraum || b.post) || undefined, river: b.river, sturdy: b.sturdy, rough: b.rough, wear: b.wear, excursion: b.excursion };
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
  function scrapValue(s, sh) { return Math.round(PS(s, sh) * .05 / 100) * 100; }
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
  function restoreCost(s, sh) { return Math.round(PS(s, sh) * .3 / 1000) * 1000; }
  function restoreDays(sh) { return clamp(Math.round(180 + TYPES[sh.type].seats / 8), 180, 365); }
  function museumMode(s, id, mode) {
    const sh = s.ships.find(x => x.id === id); if (!sh || !sh.museum) return;
    if (mode === "still") { sh.museum = "still"; sh.restoreUntil = null; return null; }
    if (sh.museum === "aktiv") return null;
    const c = restoreCost(s, sh); if (s.cash < c) return "Nicht genug Geld für die Restaurierung.";
    expense(s, "Museumsbau", c); sh.museum = "aktiv"; sh.restoreUntil = s.t + restoreDays(sh); sh.cond = 100; sh.survey = sh.restoreUntil + 1460; // v5.1.1: Restaurierung mit Fristprüfung
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
    if (M.trips && mo >= 4 && mo <= 8) for (const sh of s.ships.filter(x => x.museum === "aktiv" && !(x.restoreUntil > s.t) && !inDock(s, x) && !detained(s, x))) { // v5.1.1: nur mit gültiger Frist
      const t = TYPES[sh.type], seats = Math.min(t.seats, 600);
      trips += Math.round(seats * 7 * (.6 + s.mk.brand / 150) * (.8 + t.comfort / 10) * s.pidx - seats * 2.5 * s.pidx);
      if (rnd(s) < .01) { const c = Math.round(PS(s, sh) * .01); expense(s, "Museumsbau", c); s.log.unshift({ m: s.m, head: "Panne bei der Nostalgiefahrt", text: "Die „" + sh.name + "“ musste mit Kesselschaden zurückgeschleppt werden. Reparatur " + fmt(c) + " Mark, die Fahrgäste bekamen ihr Geld zurück.", kind: "bad", img: "mus_nostalgie" }); }
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

  /* ---------- Börse (v4.6) ----------
     Eigener Zufallsgenerator (s.bo.r): Die Börse verbraucht keine Zufallszahlen des Hauptspiels.
     Wer sie nie öffnet, spielt bis auf die gewollten Änderungen (Krisen-Termine) genau wie in v4.5. */
  const BO_KGV = 14, BO_PAYOUT = .5, BO_FEE = .01, BO_IMPACT = .25, BO_HZ = .2, BO_HZ_CAP = 4, PK_PAY = 700, PK_SHARE = .1;
  const BO = {
    weser: { grp: "reederei", g: 900000, px: 300 }, elbe: { grp: "reederei", g: 200000, px: 80 }, balt: { grp: "reederei", g: 250000, px: 120 },
    kopen: { grp: "reederei", g: 300000, px: 200 }, brandt: { grp: "reederei", g: 500000, px: 250 }, themse: { grp: "reederei", g: 400000, px: 180 },
    zeche1: { grp: "zeche", g: 150000, px: 150, names: { de: "Ruhrtaler Bergbau-AG", gb: "Rhondda Steam Coal Company" } },
    zeche2: { grp: "zeche", g: 110000, px: 90, names: { de: "Kohlenzeche Hohe Halde AG", gb: "Cwm Du Colliery Company" } },
    werft: { grp: "werft", g: 300000, px: 200, names: { ham: "Steinwerder Schiffbau-AG", lpl: "Wirral Shipbuilding Company", lon: "Medway Shipbuilding Company" } },
    billig: { grp: "caterer", g: 25000, px: 40 }, solide: { grp: "caterer", g: 50000, px: 100 }, hotel: { grp: "caterer", g: 60000, px: 120 }, luxus: { grp: "caterer", g: 45000, px: 150, from: 1905 },
  };
  const BO_ORDER = ["weser", "elbe", "balt", "kopen", "brandt", "themse", "zeche1", "zeche2", "werft", "billig", "solide", "hotel", "luxus"];
  const BO_GRP = { reederei: "Reedereien", zeche: "Zechen", werft: "Werft", caterer: "Caterer" };
  const BO_CRISES = [1893, 1907, 1914, 1929];
  const PK_RISK = { vorsichtig: { name: "vorsichtig", cash: .3, temp: 25 }, ausgewogen: { name: "ausgewogen", cash: .05, temp: 50 }, riskant: { name: "riskant", cash: 0, top: 3 } };
  const PK_SIG = [.009, .006, .004, .003], PK_RUM = [.55, .65, .75, .85];
  function brnd(s) {
    const b = s.bo; b.r = (b.r + 0x6D2B79F5) | 0;
    let t = b.r; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const bpick = (s, arr) => arr[Math.floor(brnd(s) * arr.length)];
  const bgauss = s => Math.sqrt(-2 * Math.log(1 - brnd(s))) * Math.cos(2 * Math.PI * brnd(s));
  function boName(s, k) {
    const B = BO[k]; if (!B) return k;
    if (B.grp === "reederei") return RIV[k].name;
    if (B.grp === "caterer") return catName(s, k);
    if (B.grp === "zeche") return B.names[(s.country || "de") === "gb" ? "gb" : "de"];
    return B.names[s.home || "ham"] || B.names.ham;
  }
  function boImg(s, k) {
    const B = BO[k]; if (!B) return null;
    if (B.grp === "reederei") return RIV[k].img;
    if (B.grp === "zeche") return (s.country || "de") === "gb" ? "bo_zeche_wales" : "bo_zeche_ruhr";
    if (B.grp === "werft") return "wf_dock";
    return k === "luxus" ? "kue_alacarte" : "kue_caterer";
  }
  const boGrow = s => (1 + .012 * s.m / 12) * (s.pidx || 1);
  function boListed(s, k) { const B = BO[k]; return !!B && (!B.from || yearOf(s) >= B.from) && !(s.bo.co[k].pleite >= s.m); }
  function boState(s) {
    if (s.bo && s.bo.co) return s.bo;
    const b = s.bo = { r: ((s.seed | 0) ^ 0x5bd1e995) | 0, on: false, seen: false, mk: 1, mkOff: 0, co: {}, dep: {}, pk: { amt: 0, cash: 0, dep: {}, risk: "ausgewogen", last: -1 }, closed: -1, rum: [], ord: { werft: 0, brandt: 0 }, hz: null, hzStop: -1, tut: {} };
    for (const k of BO_ORDER) {
      const B = BO[k], g = B.g / 12 * boGrow(s);
      b.co[k] = { n: Math.round(B.g * BO_KGV / B.px), g: Array(12).fill(Math.round(g)), y: {}, idio: 1, tr: 0, hit: null, px: 0, prev: 0, hist: [], pleite: -1, ev: -1 };
    }
    for (const k of BO_ORDER) { const c = b.co[k]; c.px = c.prev = boPrice(s, k); }
    return b;
  }
  function boPrice(s, k) {
    const b = s.bo, c = b.co[k], B = BO[k], sum = c.g.reduce((a, v) => a + v, 0);
    const w = Math.max(sum, B.g * boGrow(s) * .08) * BO_KGV / c.n;
    return Math.max(1, Math.round(w * b.mk * c.idio * 100) / 100);
  }
  // Gewinn einer Firma im laufenden Monat
  function boDriver(s, k) {
    const B = BO[k], b = s.bo, y = yearOf(s), konj = s.konj;
    if (B.grp === "reederei") {
      const st = rivState(s, k);
      let d = Math.pow(konj, 1.5) * (st.weakUntil >= s.m ? .45 : 1) * (st.pUntil >= s.m && st.pmod < 1 ? .85 : 1) * (1 + .6 * (st.boost || 0)) * (1 + .5 * (st.comBoost || 0));
      if (k === "weser") d *= 1 + .5 * (s.mods.some(md => md.seg === "ausw" && md.key === "demand" && md.f > 1) ? 1 : 0);
      if (k === "brandt") d = .6 * d + .4 * Math.pow(s.shipIdx, 2);
      return d;
    }
    if (B.grp === "zeche") { const dec = y < 1912 ? 1 : y < 1920 ? Math.pow(.99, y - 1912) : Math.max(.3, Math.pow(.99, 8) * Math.pow(.98, y - 1920)); return clamp((s.coal - .62) / .38, .05, 3) * Math.sqrt(konj) * dec; }
    if (B.grp === "werft") return Math.pow(s.shipIdx, 2);
    return konj * (k === "luxus" ? Math.min(1.5, 1 + (y - 1905) * .02) : 1);
  }
  function boProfit(s, k) {
    const B = BO[k], b = s.bo, c = b.co[k];
    let g = B.g / 12 * boGrow(s) * boDriver(s, k) * (1 + (brnd(s) - .5) * .2);
    if (c.hit && c.hit.until >= s.m) g *= c.hit.f;
    if (k === "werft" || k === "brandt") { const o = b.ord[k]; g += o * .005; b.ord[k] = o * 11 / 12; }
    if (B.grp === "caterer") { const K = kueche(s), own = [K.cat, K.lux].some(x => catOn(s, x) && x.k === k); if (own && s.last && s.last.cost) g += (s.last.cost.Verpflegung || 0) * .08; }
    return g;
  }
  function boVisible(s) { const b = s.bo; return !!(b && (b.seen || boHeld(s))); }
  function boHeld(s) { const b = s.bo; return !!b && (Object.values(b.dep).some(d => d.n > 0) || Object.values(b.pk.dep).some(d => d.n > 0)); }
  function boLog(s, head, text, img, cat, extra) { s.log.unshift(Object.assign({ m: s.m, head, text, kind: cat === "eigen" ? "own" : "news", cat: cat || "boerse", img }, extra || {})); }
  function boHit(s, k, f) { if (!s.bo || !s.bo.co[k]) return; const c = s.bo.co[k]; c.idio = clamp(c.idio * (1 + f), .3, 3); c.ev = s.m; }
  function boCrash(s, f) { const b = boState(s); b.mk = clamp(b.mk * f, .4, 1.6); b.mkOff -= .2; }
  function boNearCrisis(s) { const y = yearOf(s); return BO_CRISES.some(c => Math.abs(y - c) < 6); }
  function boCrisis(s, f) { s.konj = Math.min(s.konj, .8); s.shipIdx = Math.min(s.shipIdx, .85); s.base += 1; boCrash(s, f); }
  // Monatsabschluss der Börse
  function boMonthly(s) {
    const b = boState(s), c0 = cal(s.m), y = c0.y, vis = boVisible(s);
    const closed = b.closed >= s.m;
    if (b.closed === s.m - 1) s.log.unshift({ m: s.m, head: "Die Börse öffnet wieder", text: "Nach Monaten der Schließung wird wieder gehandelt – zunächst vorsichtig und mit festen Mindestkursen.", kind: "news", cat: "welt", img: "bo_saal" });
    b.mkOff *= .96;
    const target = clamp(1 + .8 * (s.konj - 1) + b.mkOff, .5, 1.5);
    if (!closed) b.mk = clamp(b.mk + (target - b.mk) * .12 + (brnd(s) - .5) * .06, .4, 1.6);
    for (const k of BO_ORDER) {
      const c = b.co[k], B = BO[k];
      c.g.push(Math.round(boProfit(s, k))); c.g.shift();
      c.y[y] = (c.y[y] || 0) + c.g[11];
      c.tr = .85 * c.tr + (brnd(s) - .5) * .004;
      if (!closed) { c.idio = clamp(c.idio * (1 + c.tr + (brnd(s) - .5) * .05), .3, 3); c.idio += (1 - c.idio) * .03; }
      // Zechen: Streik und Grubenunglück
      if (B.grp === "zeche") {
        const r = brnd(s), hz = b.hz === k;
        if (r < .004 || r > .998) {
          const strike = r < .004, n = 1 + Math.floor(brnd(s) * 3), f = strike ? -.15 - brnd(s) * .1 : -.2 - brnd(s) * .1;
          c.hit = { f: .3, until: s.m + n - 1 }; boHit(s, k, f);
          if (hz) b.hzStop = s.m + n - 1;
          const head = boName(s, k) + (strike ? ": Die Bergleute streiken" : ": Grubenunglück");
          const text = (strike ? "Die Bergleute legen die Arbeit nieder. " : "Schlagende Wetter in der Tiefe – die Grube steht still, die Rettungsmannschaften sind unterwegs. ") + "Der Kurs fällt um " + Math.round(-f * 100) + " %." + (hz ? " Ihre Hauszeche liefert " + (n === 1 ? "einen Monat" : n + " Monate") + " keine Kohle – Ihre Schiffe bunkern so lange zum Marktpreis." : "");
          if (hz) boLog(s, head, text, strike ? "ev_streik" : "ev_grube", "eigen"); else if (vis) boLog(s, head, text, strike ? "ev_streik" : "ev_grube");
        }
      }
      if (k === "billig" && !(c.pleite >= s.m) && c0.mo === 0 && brnd(s) < .04) {
        c.pleite = s.m + 11; const lost = boLiquidate(s, k, .1);
        if (vis || lost) boLog(s, boName(s, k) + " ist pleite", "Die Aktie stürzt auf ein Zehntel und wird vom Kurszettel gestrichen." + (lost ? " Ihre Aktien sind fast nichts mehr wert: Sie bekommen " + fmt(lost) + " Mark." : "") + " In einem Jahr will ein neuer Besitzer wieder an die Börse.", "kue_caterer", lost ? "eigen" : "boerse");
      }
      if (k === "billig" && c.pleite === s.m - 1) { c.idio = .7; c.g = c.g.map(v => Math.round(Math.max(v, B.g / 12 * boGrow(s) * .8))); }
    }
    rivalNews(s);
    rumMonthly(s);
    for (const k of BO_ORDER) {
      const c = b.co[k];
      if (!closed) c.px = boPrice(s, k);
      c.hist.push({ m: s.m, p: c.px }); if (c.hist.length > 120) c.hist.shift();
      const ch = c.prev ? c.px / c.prev - 1 : 0;
      if (b.on && vis && !closed && Math.abs(ch) >= .15 && c.ev !== s.m && boListed(s, k)) boLog(s, boName(s, k) + (ch > 0 ? ": Kurssprung" : ": Kurssturz"), "Die Aktie " + (ch > 0 ? "steigt" : "fällt") + " im " + MONTHS[cal(s.m - 1).mo] + " um " + Math.round(Math.abs(ch) * 100) + " % auf " + fmt(c.px) + " Mark.", boImg(s, k));
      c.prev = c.px;
    }
    if (c0.mo === 4) boDividend(s);
    hzCheck(s);
    if (staff(s).pk >= 0 && b.on && !closed) pkMonthly(s);
    boUnlock(s);
  }
  function boDividend(s) {
    const b = s.bo, y = cal(s.m).y - 1; let sum = 0; const got = [];
    for (const k of BO_ORDER) {
      const c = b.co[k], B = BO[k], yp = c.y[y] || 0, exp = B.g * boGrow(s) * .7;
      c.div = 0;
      if (!boListed(s, k) || yp <= 0 || yp < exp * .6) { c.divY = y; continue; }
      c.div = Math.round(yp * BO_PAYOUT / c.n * 100) / 100; c.divY = y;
      const n = (b.dep[k] ? b.dep[k].n : 0) + (b.pk.dep[k] ? b.pk.dep[k].n : 0);
      if (n > 0) { const v = n * c.div; sum += v; got.push(boName(s, k)); }
    }
    for (const y0 of Object.keys(b.co.weser.y)) if (+y0 < y - 1) for (const k of BO_ORDER) delete b.co[k].y[y0];
    if (sum > 0) {
      income(s, "Dividenden", Math.round(sum)); b.divLast = { y, sum: Math.round(sum) };
      boLog(s, "Dividende für " + y, "Ihre Aktien bringen " + fmt(sum) + " Mark Dividende" + (got.length <= 3 ? " – von " + got.join(", ") : " aus " + got.length + " Firmen") + ".", "bo_dividende", "eigen");
    } else if (b.on && boVisible(s)) {
      const none = BO_ORDER.filter(k => boListed(s, k) && !b.co[k].div).map(k => boName(s, k));
      if (none.length) boLog(s, "Die Dividenden für " + y + " sind beschlossen", none.length === BO_ORDER.length ? "Ein schlechtes Jahr: Keine Firma zahlt eine Dividende." : "Keine Dividende zahlen " + none.join(", ") + ".", "bo_dividende");
    }
  }
  function boUnlock(s) {
    const b = s.bo; if (!b || b.on) return;
    const y = cal(s.m).y;
    if (s.ships.length >= 3 && Object.keys(s.years || {}).some(yy => +yy < y && s.years[yy].profit > 0)) {
      b.on = true;
      s.log.unshift({ m: s.m, head: "Die Börse öffnet Ihnen ihre Türen", text: s.name + " gilt jetzt als feste Größe im Hafen. Unter Kontor → Börse können Sie Aktien der Rivalen, der Zechen, der Werft und der Caterer kaufen.", kind: "news", cat: "welt", img: "bo_saal" });
    }
  }
  // Meldungen über die Rivalen: für alle sichtbar, sie bewegen nur den Kurs
  function rivalNews(s) {
    if (brnd(s) >= .35) return;
    const k = bpick(s, RIV_ORDER), R = RIV[k], mo = cal(s.m).mo, ports = Object.keys(PORTS).filter(p => PORTS[p].reg !== "Übersee" || k === "weser");
    const types = ["schiff", "schiff", "unglueck", "linie", "streik"].concat(mo < 3 ? ["rekord", "rekord"] : []);
    const t = bpick(s, types); let head, text, f;
    if (t === "schiff") { f = .03 + brnd(s) * .03; s.bo.ord[k === "brandt" ? "brandt" : "werft"] += Math.round((800000 + brnd(s) * 2200000) * (s.pidx || 1)); head = R.name + " stellt einen neuen Dampfer in Dienst"; text = "Festlich beflaggt läuft der Neubau zur ersten Reise aus. Die Aktie legt um " + Math.round(f * 100) + " % zu."; }
    if (t === "unglueck") { f = -.06 - brnd(s) * .06; head = R.name + ": Dampfer auf Grund gelaufen"; text = "Menschen kamen nicht zu Schaden, doch die Reparatur wird teuer. Die Aktie verliert " + Math.round(-f * 100) + " %."; s.bo.co[k].hit = { f: .8, until: s.m }; }
    if (t === "linie") { f = .02 + brnd(s) * .03; head = R.name + " eröffnet eine neue Linie"; text = "Ab sofort fährt sie auch nach " + PORTS[bpick(s, ports)].name + ". Die Aktie legt um " + Math.round(f * 100) + " % zu."; }
    if (t === "streik") { f = -.04 - brnd(s) * .04; head = R.name + ": Streik an Bord"; text = "Heizer und Matrosen fordern mehr Lohn, die Schiffe bleiben einige Tage im Hafen. Die Aktie verliert " + Math.round(-f * 100) + " %."; s.bo.co[k].hit = { f: .7, until: s.m }; s.bo.co[k].strike = s.m; }
    if (t === "rekord") { const yp = s.bo.co[k].y[cal(s.m).y - 1] || 0, ok = yp > RIV_BASE(s, k); f = ok ? .05 + brnd(s) * .05 : -.03 - brnd(s) * .03; head = R.name + (ok ? " meldet ein Rekordjahr" : " legt eine enttäuschende Bilanz vor"); text = ok ? "So viele Fahrgäste wie nie zuvor. Die Aktie legt um " + Math.round(f * 100) + " % zu." : "Die Bilanz enttäuscht die Aktionäre. Die Aktie verliert " + Math.round(-f * 100) + " %."; }
    boHit(s, k, f);
    s.log.unshift({ m: s.m, head, text, kind: "news", cat: "welt", img: R.img });
  }
  const RIV_BASE = (s, k) => BO[k].g * boGrow(s);
  // Gerüchte: nur nach Freischaltung, etwa 60 % treffen zu
  const RUM = {
    reederei: [["plant einen neuen Schnelldampfer", .1, .2], ["steckt in Geldnot", -.15, -.25]],
    zeche: [["steht vor einem Streik", -.15, -.25], ["hat ein reiches Flöz entdeckt", .12, .2]],
    werft: [["erhält einen Großauftrag aus Übersee", .12, .2], ["verliert einen Großauftrag", -.12, -.2]],
    caterer: [["gewinnt einen großen Hotelvertrag", .1, .18], ["hat Ärger mit der Gesundheitsbehörde", -.12, -.2]],
  };
  function rumMonthly(s) {
    const b = s.bo, st = staff(s);
    for (const r of b.rum.slice()) {
      if (r.due > s.m) continue;
      b.rum = b.rum.filter(x => x !== r);
      const c = b.co[r.k]; if (!c) continue;
      if (r.ok) {
        boHit(s, r.k, r.f);
        if (r.f < 0) c.hit = { f: .6, until: s.m + 1 };
        if (BO[r.k].grp === "zeche" && r.f < 0 && b.hz === r.k) b.hzStop = s.m;
        if (boVisible(s)) boLog(s, "Das Gerücht bestätigt sich", boName(s, r.k) + " " + r.what + ". Die Aktie " + (r.f > 0 ? "steigt" : "fällt") + " um " + Math.round(Math.abs(r.f) * 100) + " %.", "ev_geruecht");
      } else {
        boHit(s, r.k, -r.f * .15);
        if (boVisible(s)) boLog(s, "Nichts dran am Gerücht", "Es hieß, " + boName(s, r.k) + " " + r.what + ". Das hat sich nicht bestätigt.", "ev_geruecht");
      }
    }
    if (!b.on || b.closed >= s.m || brnd(s) >= .33) return;
    const list = BO_ORDER.filter(k => boListed(s, k) && !b.rum.some(r => r.k === k));
    if (!list.length) return;
    const k = bpick(s, list), R = bpick(s, RUM[BO[k].grp]), ok = brnd(s) < .6, f = R[1] + (R[2] - R[1]) * brnd(s);
    const r = { k, what: R[0], f, ok, due: s.m + 1 + Math.floor(brnd(s) * 3) };
    let label = null;
    if (st.pk >= 0) { const right = brnd(s) < PK_RUM[st.pk]; label = (ok === right) ? "glaubwürdig" : "zweifelhaft"; }
    r.label = label; r.shown = boVisible(s); b.rum.push(r);
    if (boVisible(s)) boLog(s, "Gerücht: " + boName(s, k) + " " + R[0], "An der Börse wird es hinter vorgehaltener Hand erzählt. Ob etwas dran ist, weiß niemand." + (label ? " Ihr Prokurist hält das Gerücht für " + label + "." : ""), "ev_geruecht", "boerse", { rum: label || "?" });
  }
  // Wert der Depots
  function boValue(s) {
    const b = s.bo; if (!b || !b.co) return 0;
    let v = b.pk.cash || 0;
    for (const D of [b.dep, b.pk.dep]) for (const k in D) if (D[k].n > 0) v += D[k].n * b.co[k].px;
    return v;
  }
  function boOwn(s, k) { const b = s.bo; return (b.dep[k] ? b.dep[k].n : 0) + (b.pk.dep[k] ? b.pk.dep[k].n : 0); }
  // Preis eines Auftrags: große Pakete bewegen den Kurs (im Schnitt ein Viertel des Anteils an der Firma)
  function boQuote(s, k, n, sell) {
    const b = boState(s), c = b.co[k]; n = Math.max(0, Math.floor(n || 0));
    const imp = 1 + (sell ? -1 : 1) * BO_IMPACT * n / c.n, gross = n * c.px * imp, fee = Math.max(n ? 1 : 0, gross * BO_FEE);
    return { n, px: c.px * imp, gross: Math.round(gross), fee: Math.round(fee), total: Math.round(sell ? gross - fee : gross + fee) };
  }
  function boCanTrade(s, k) {
    const b = boState(s);
    if (!b.on) return "Die Börse ist erst ab drei Schiffen und einem Geschäftsjahr mit Gewinn für Sie offen.";
    if (b.closed >= s.m) return "Die Börse ist geschlossen. Der Handel ruht.";
    if (!BO[k] || !boListed(s, k)) return "Diese Aktie wird derzeit nicht gehandelt.";
    return null;
  }
  // Anzahl zu einem Betrag (abgerundet, inklusive Gebühr)
  function boFor(s, k, amount) {
    const b = boState(s), c = b.co[k]; if (!(amount > 0)) return 0;
    // Gesamtpreis = n · Kurs · (1 + Aufschlag · n / Aktien) · (1 + Gebühr): quadratische Gleichung, dann höchstens ein paar Schritte nachjustieren
    const A = c.px * BO_IMPACT / c.n * (1 + BO_FEE), B = c.px * (1 + BO_FEE);
    let n = Math.max(0, Math.floor((-B + Math.sqrt(B * B + 4 * A * amount)) / (2 * A)));
    for (let i = 0; i < 50 && n > 0 && boQuote(s, k, n).total > amount; i++) n--;
    for (let i = 0; i < 50 && boQuote(s, k, n + 1).total <= amount; i++) n++;
    return n;
  }
  function buyInto(s, D, k, n) { const q = boQuote(s, k, n); const d = D[k] || (D[k] = { n: 0, cost: 0 }); d.n += q.n; d.cost += q.total; return q; }
  function sellFrom(s, D, k, n) {
    const d = D[k]; n = Math.min(n, d ? d.n : 0); if (n <= 0) return null;
    const q = boQuote(s, k, n, true), basis = d.cost * n / d.n; d.n -= n; d.cost -= basis; if (d.n <= 0) delete D[k];
    return { q, gain: q.total - basis };
  }
  function bookGain(s, g) { const c = s.cur; if (!c) return; if (g >= 0) { c.extra = c.extra || {}; c.extra.Kursgewinne = (c.extra.Kursgewinne || 0) + g; } else c.cost.Kursverluste = (c.cost.Kursverluste || 0) - g; }
  function boBuy(s, k, n) {
    const err = boCanTrade(s, k); if (err) return err;
    n = Math.floor(n); if (!(n > 0)) return "Bitte eine Stückzahl oder einen Betrag angeben.";
    const b = s.bo; if (boOwn(s, k) + n > b.co[k].n) return "So viele Aktien gibt es nicht.";
    const q = boQuote(s, k, n); if (q.total > s.cash) return "Nicht genug Geld in der Kasse. Aktien kaufen Sie nur bar, ohne Kredit.";
    s.cash -= q.total; buyInto(s, b.dep, k, n); b.seen = true;
    s.log.unshift({ m: s.m, head: "Aktien gekauft: " + boName(s, k), text: fmt(n) + " Stück zu " + fmt(q.px) + " Mark, mit Gebühr " + fmt(q.total) + " Mark.", kind: "own", cat: "boerse", img: "bo_saal" });
    hzCheck(s);
    return null;
  }
  function boSell(s, k, n) {
    const err = boCanTrade(s, k); if (err) return err;
    const r = sellFrom(s, s.bo.dep, k, Math.floor(n)); if (!r) return "Davon haben Sie keine Aktien.";
    s.cash += r.q.total; bookGain(s, r.gain);
    s.log.unshift({ m: s.m, head: "Aktien verkauft: " + boName(s, k), text: fmt(r.q.n) + " Stück zu " + fmt(r.q.px) + " Mark, nach Gebühr " + fmt(r.q.total) + " Mark. " + (r.gain >= 0 ? "Gewinn " : "Verlust ") + fmt(Math.abs(r.gain)) + " Mark.", kind: "own", cat: "boerse", img: "bo_saal" });
    hzCheck(s);
    return null;
  }
  // Pleite einer Firma: Aktien zum Zehntel abrechnen
  function boLiquidate(s, k, f) {
    const b = s.bo; let got = 0;
    for (const D of [b.dep, b.pk.dep]) { const d = D[k]; if (!d || !d.n) continue; const v = Math.round(d.n * b.co[k].px * f); got += v; bookGain(s, v - d.cost); if (D === b.dep) s.cash += v; else b.pk.cash += v; delete D[k]; }
    b.co[k].idio *= f; b.co[k].px = boPrice(s, k); b.co[k].ev = s.m;
    return got;
  }
  // Notverkauf, wenn die Kasse im Minus ist
  function boRescue(s) {
    const b = s.bo; if (!b || s.cash >= 0 || !boHeld(s) && !b.pk.cash) return;
    if (b.pk.cash > 0) { const t = Math.min(b.pk.cash, -s.cash + 5000); b.pk.cash -= t; s.cash += t; b.pk.amt = Math.max(0, b.pk.amt - t); }
    let got = 0;
    for (const D of [b.dep, b.pk.dep]) for (const k of Object.keys(D)) {
      if (s.cash >= 0) break;
      const d = D[k], need = Math.ceil((-s.cash + 5000) / (b.co[k].px * .97)), r = sellFrom(s, D, k, Math.min(d.n, need)); if (!r) continue;
      s.cash += r.q.total; got += r.q.total; bookGain(s, r.gain);
    }
    if (got) { if (b.pk.amt) b.pk.amt = Math.max(0, b.pk.amt - got); s.log.unshift({ m: s.m, head: "Die Bank verkauft Ihre Aktien", text: "Die Kasse war im Minus. Die Bank hat Aktien für " + fmt(got) + " Mark verkauft, bevor sie an die Schiffe geht.", kind: "bad", cat: "eigen", img: "ev_krise" }); }
  }
  // Hauszeche: über 50 % einer Zeche
  function hzCheck(s) {
    const b = s.bo; if (!b) return;
    const k = ["zeche1", "zeche2"].find(z => boOwn(s, z) > b.co[z].n / 2) || null;
    if (k === b.hz) return;
    if (k) s.log.unshift({ m: s.m, head: "Eine eigene Zeche", text: "Sie halten jetzt die Mehrheit an " + boName(s, k) + ". Ihre Kohleschiffe bunkern ab sofort 20 % unter dem Marktpreis. Laufende Lieferverträge bleiben bestehen.", kind: "own", cat: "eigen", img: "bo_hauszeche" });
    else s.log.unshift({ m: s.m, head: "Die Hauszeche ist abgegeben", text: "Sie halten nicht mehr die Mehrheit an " + boName(s, b.hz) + ". Ihre Schiffe bunkern wieder zum Marktpreis.", kind: "own", cat: "eigen", img: "ev_bunkern" });
    b.hz = k;
  }
  const coalShip = t => !t.motor && !t.oil && (!!t.design || t.from < 1920);
  // Vorschau: was eine Hauszeche im Vormonat gespart hätte (ohne Lieferverträge gerechnet)
  function hzPreview(s, k) {
    const ports = (s.last && s.last.coal && s.last.coal.ports) || {}; let tons = 0;
    for (const p in ports) if (hzRegion(s, p)) tons += ports[p];
    const coalShare = s.ships.some(sh => coalShip(TYPES[sh.type])) ? 1 : 0, capT = BO_HZ_CAP * BO[k].g / 12 * boGrow(s) / COAL_T;
    return Math.round(Math.min(tons * coalShare, capT) * COAL_T * s.coal * BO_HZ);
  }
  // Prokurist: verwaltet ein eigenes Depot
  function pkTarget(s) {
    const b = s.bo, st = staff(s), R = PK_RISK[b.pk.risk] || PK_RISK.ausgewogen;
    const list = BO_ORDER.filter(k => boListed(s, k) && (b.pk.risk !== "vorsichtig" || ["weser", "kopen", "themse", "werft", "solide", "hotel"].includes(k)));
    // Einschätzung des Prokuristen: Trend plus Irrtum, der sich nur langsam ändert (sonst handelt er sich arm)
    const nz = b.pk.nz || (b.pk.nz = {}), sig = {};
    for (const k of list) { nz[k] = .7 * (nz[k] || 0) + .71 * bgauss(s) * PK_SIG[st.pk]; sig[k] = 2 * b.co[k].tr + .03 * (1 - b.co[k].idio) + nz[k]; }
    let w = {};
    if (R.top) list.slice().sort((x, y) => sig[y] - sig[x]).slice(0, R.top).forEach(k => { w[k] = 1; });
    else for (const k of list) w[k] = Math.exp(R.temp / 50 * clamp(sig[k] / .006, -2, 2));
    const tot = Object.values(w).reduce((a, v) => a + v, 0); for (const k in w) w[k] = Math.min(.25, w[k] / tot * (1 - R.cash));
    return w;
  }
  function pkMonthly(s) {
    const b = s.bo, P = b.pk, st = staff(s);
    if (st.pk >= 0) P.lohn = (P.lohn || 0) + PK_PAY * STAFF_PAY[st.pk] * s.wage;
    if (s.m - P.last < 3) return;
    P.last = s.m;
    let val = P.cash; for (const k in P.dep) val += P.dep[k].n * b.co[k].px;
    if (val < 1000) return;
    const w = pkTarget(s); let gain = 0;
    for (const k of Object.keys(P.dep)) {
      const want = Math.floor((w[k] || 0) * val / b.co[k].px), have = P.dep[k].n;
      if (have > want && (have - want) * b.co[k].px > val * .05) { const r = sellFrom(s, P.dep, k, have - want); if (r) { P.cash += r.q.total; gain += r.gain; } }
    }
    for (const k of Object.keys(w)) {
      const have = P.dep[k] ? P.dep[k].n : 0, cap = Math.max(0, Math.min(Math.floor(b.co[k].n * (BO[k].grp === "zeche" ? .45 : .6)) - boOwn(s, k), Math.floor(b.co[k].n * .12) - have));
      let n = Math.min(cap, Math.floor(w[k] * val / b.co[k].px) - have);
      if (n <= 0 || n * b.co[k].px < val * (P.cash > val * .15 ? .01 : .05)) continue;
      while (n > 0 && boQuote(s, k, n).total > P.cash) n = Math.floor(n * .9);
      if (n > 0) { P.cash -= buyInto(s, P.dep, k, n).total; }
    }
    if (gain) { bookGain(s, gain); if (gain > 0) { const fee = Math.round(gain * PK_SHARE); expense(s, "Personal", fee); P.paid = (P.paid || 0) + fee; } }
  }
  function pkSet(s, amt) {
    const b = boState(s), P = b.pk; amt = Math.max(0, Math.round(amt));
    if (staff(s).pk < 0) return "Erst einen Prokuristen einstellen (Kontor → Personal).";
    let val = P.cash; for (const k in P.dep) val += P.dep[k].n * b.co[k].px;
    if (amt > val) { const add = amt - val; if (add > s.cash) return "Nicht genug Geld in der Kasse."; s.cash -= add; P.cash += add; }
    else if (amt < val) {
      let need = val - amt - P.cash;
      for (const k of Object.keys(P.dep)) { if (need <= 0) break; const r = sellFrom(s, P.dep, k, Math.min(P.dep[k].n, Math.ceil(need / (b.co[k].px * .97)))); if (r) { P.cash += r.q.total; need -= r.q.total; bookGain(s, r.gain); } }
      const back = Math.max(0, Math.min(P.cash, val - amt)); P.cash -= back; s.cash += back;
    }
    P.amt = amt; P.last = -99;
    return null;
  }
  function pkFire(s) {
    const b = s.bo; if (!b) return; const P = b.pk; let back = P.cash, gain = 0;
    for (const k of Object.keys(P.dep)) { const r = sellFrom(s, P.dep, k, P.dep[k].n); if (r) { back += r.q.total; gain += r.gain; } }
    if (gain) bookGain(s, gain);
    s.cash += back; P.cash = 0; P.amt = 0; P.dep = {};
  }
  // Börse unter Kontor geöffnet
  function boSeen(s) { const b = boState(s); if (b.on) b.seen = true; }

  const api = { taktInfo, lagerBuy, lagerQuote, lagerDays, lagerPrice, lagerValue, LAGER_CAP, KAI, LAGERGELD, zkRef, canStepPrice, lateWhy, whyQuarter, WHY, WHY_TIP, creditInfo, CREDIT, OCEAN_CREW, startOptions, STARTS, FERRY_TYPES, setZk, zkPossible, zkOn, zkPrice, wagDemand, wagCap, wagFare, WAGON, ipKind, ISLANDS, konzOn, rivalTypes, fareF, ZK_PK,
    setStrict, takeErrors, tDate, departures, shipStatus, shipPos, lineGeo, coalCap, portTier, coalPortPrice, coalPorts, bunkerValue, rivalPk, pkStart, RIV_PK, TIER, TIER_NAME, BUNK, BUNK_ORDER, BUF, BUF_NAME, DIFF, DIFF_ORDER, PAUSE_DEF, COAL_T, diffOf,
    setBunkRule, setShipBunk, setBuffer, setReserve, setCatchUp, markShip, setPause, setDifficulty, orderInfo, cancelInfo, cancelOrder, yardGap, MONTHS, TYPES, TYPE_ORDER, SPECIAL_ORDER, TYPE_NOTE, MAINT, EQUIP, MK_BUDGET, MK_AGENCY, FIN, PORTS, REGIONS, HOME, SEG, World: W,
    cal, dateStr, fmt, newGame, migrate, nextMonth, resolve, eventOptions, buyNew, buyUsed, rename, randomName, openRoute, closeRoute, routeInfo, canServe, routePrice,
    survey, setLine, setPrice, setMaint, setInsured, equip, equipCost, dock, sellShip, repay, quote, newPrice, shipValue, fleetValue, debt, equity, rating, loanRate,
    tripsOf, active, score, compDepsOf, GEN_TYPES, typeGroup, factoryEqOptions, factoryEqCost, DES, designBases, designType, saveDesign, seriesFactor, EXHIBITS, partsFor, partCost, scrapValue, scrapShip, donateShip, MUS_PRICE, museumUnlocked, museumCost, hallSlots, hallCost, buildMuseum, expandHall, toMuseum, restoreCost, restoreDays, museumMode, museumFest, museumDraw, bankruptReport, avgPct, CAP_NAMES: { first: CAP_FIRST.concat(CAP_FIRST_GB), last: CAP_LAST.concat(CAP_LAST_GB) }, stopInfo, HOMES, homeName, applyCountry, CAP_SPEC, CAP_XP, SPECIAL_CAPS, caps, capOf, capLevel, capPay, capFx, assignCaptain, hireCaptain, dismissCaptain, lineOf, STAFF_LV, STAFF_PAY, DEPT, INSP_PAY, MARKT_PAY, staff, setStaff, crewCost, RIV, RIV_ORDER, rivalsOf, rivState, rivalNames, marketResearch, myExp, setPlan, planTarget, brandtPrice, ACH, stepPrice, alignPrices, pricePct, refNow, maintCost, ageY, fristInfo, renewFrist, reportInfo, isEmil, tourOpen, rInfo, advanceDay,
    FAHRT, FAHRT_ORDER, KQ, CATERERS, CAT_ORDER, KU_CLS, MI_PAY, KE_PAY, PM_PAY, CHEF_PAY, COAL_SURCH, fahrtOf, setFahrt, setShipFahrt, postNeed, postSlow,
    kueche, kqOf, kqEff, kScore, setKq, setShipKq, setEigen, catOffers, catName, signCaterer, cancelCaterer, catCancelFee, catOn,
    BO, BO_ORDER, BO_GRP, BO_FEE, BO_HZ, PK_PAY, PK_RISK, boState, boName, boImg, boListed, boValue, boOwn, boQuote, boFor, boBuy, boSell, boCanTrade, boSeen, boVisible, boHeld, pkSet, coalShip, hzPreview,
    coalIdx, coalTrend, coalActive, coalBase, coalOffer, signCoal, cancelCoal, coalCancelFee, prevFahrt, prevKq, prevCat, prevEigen, mealShips, duePending, dim, dayStr, clsName, CLS_K, inDock, offDuty, detained, dateAfter, dockDays, dockInfo, majorRepair, majorCost, MAJOR, shipFixed, simulateMonth, typeOpen, setBudget, setAgency, campaign, campaignCost, buildHallen, pressTrip, riskOf, suggest, distressOdds, routeOf, infoOf, yearOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Engine = api;
})(this);

