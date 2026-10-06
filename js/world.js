/* FLAGGSCHIFF – Häfen, Seewege und Nachfragemodell */
(function (root) {
  "use strict";
  // Häfen: lat, lon, Einzugsgebiet (Tsd.), Wohlstand, Handel, Auswanderung (Ausgang), Einwanderungsziel, Bad, Tourismus, Durchgangsverkehr, Gebühr
  const P = (name, reg, lat, lon, o) => Object.assign({ name, reg, lat, lon, pop: 10, wealth: 1, trade: 0, ausw: 0, ziel: 0, bad: 0, tour: 0, tourSeason: null, tourFrom: 0, tr: 0, trFrom: 0, fee: 30, shallow: false }, o);
  const PORTS = {
    ham: P("Hamburg", "Deutsche Nordsee", 53.54, 9.97, { pop: 600, wealth: 1.2, trade: 1, ausw: 1, fee: 40 }),
    fin: P("Finkenwerder", "Deutsche Nordsee", 53.53, 9.87, { pop: 25, wealth: .8, fee: 5 }),
    cux: P("Cuxhaven", "Deutsche Nordsee", 53.87, 8.70, { pop: 12, bad: .9, fee: 20 }),
    hel: P("Helgoland", "Deutsche Nordsee", 54.18, 7.89, { pop: 2, bad: 1, fee: 50 }),
    bhv: P("Bremerhaven", "Deutsche Nordsee", 53.55, 8.57, { pop: 300, wealth: 1.15, trade: .5, ausw: .9, fee: 45 }),
    emd: P("Emden", "Deutsche Nordsee", 53.36, 7.20, { pop: 15, trade: .05, fee: 20 }),
    ndd: P("Norddeich", "Deutsche Nordsee", 53.63, 7.16, { pop: 120, fee: 15, shallow: true }),
    nor: P("Norderney", "Deutsche Nordsee", 53.71, 7.15, { pop: 3, bad: 1, fee: 15, shallow: true }),
    bor: P("Borkum", "Deutsche Nordsee", 53.59, 6.66, { pop: 2, bad: .7, fee: 15, shallow: true }),
    hoy: P("Hoyer", "Deutsche Nordsee", 54.97, 8.69, { pop: 40, fee: 10, shallow: true }),
    syl: P("Sylt", "Deutsche Nordsee", 54.90, 8.35, { pop: 2, bad: .8, fee: 15, shallow: true }),
    bla: P("Blankenese", "Deutsche Nordsee", 53.557, 9.80, { pop: 12, bad: .12, fee: 6 }),
    gls: P("Glückstadt", "Deutsche Nordsee", 53.79, 9.42, { pop: 15, fee: 8 }),
    wis: P("Wischhafen", "Deutsche Nordsee", 53.78, 9.33, { pop: 12, fee: 5 }),
    jui: P("Juist", "Deutsche Nordsee", 53.68, 7.00, { pop: 2, bad: .6, fee: 12, shallow: true }),
    dag: P("Dagebüll", "Deutsche Nordsee", 54.73, 8.69, { pop: 30, fee: 8, shallow: true }),
    wyk: P("Wyk auf Föhr", "Deutsche Nordsee", 54.69, 8.57, { pop: 3, bad: .9, fee: 12, shallow: true }),
    kie: P("Kiel", "Deutsche Ostsee", 54.32, 10.14, { pop: 60, trade: .2, tr: .5, fee: 30 }),
    lue: P("Lübeck", "Deutsche Ostsee", 53.87, 10.69, { pop: 70, trade: .45, bad: .3, fee: 30 }),
    lab: P("Laboe", "Deutsche Ostsee", 54.40, 10.22, { pop: 3, bad: .5, fee: 6 }),
    tra: P("Travemünde", "Deutsche Ostsee", 53.96, 10.88, { pop: 5, bad: .6, fee: 10 }),
    ros: P("Rostock", "Deutsche Ostsee", 54.09, 12.14, { pop: 80, trade: .1, fee: 20 }),
    str: P("Stralsund", "Deutsche Ostsee", 54.31, 13.09, { pop: 40, trade: .05, fee: 12 }),
    alt: P("Altefähr (Rügen)", "Deutsche Ostsee", 54.33, 13.07, { pop: 15, bad: .5, fee: 5 }),
    war: P("Warnemünde", "Deutsche Ostsee", 54.18, 12.09, { pop: 60, bad: .3, tr: .7, trFrom: 1903, fee: 25 }),
    sas: P("Sassnitz", "Deutsche Ostsee", 54.51, 13.64, { pop: 10, bad: .8, tr: .8, trFrom: 1909, fee: 20 }),
    ste: P("Stettin", "Deutsche Ostsee", 53.90, 14.27, { pop: 200, trade: .5, ausw: .2, fee: 50 }),
    dan: P("Danzig", "Deutsche Ostsee", 54.40, 18.67, { pop: 120, trade: .3, fee: 50 }),
    kgb: P("Königsberg", "Deutsche Ostsee", 54.64, 19.90, { pop: 150, trade: .3, fee: 50 }),
    kor: P("Korsør", "Skandinavien", 55.33, 11.14, { pop: 5, tr: 1, fee: 20 }),
    ged: P("Gedser", "Skandinavien", 54.57, 11.93, { pop: 2, tr: .7, trFrom: 1903, fee: 15 }),
    hsr: P("Helsingør", "Skandinavien", 56.04, 12.61, { pop: 12, tr: .6, trFrom: 1892, fee: 10 }),
    hsb: P("Helsingborg", "Skandinavien", 56.05, 12.69, { pop: 20, tr: .6, trFrom: 1892, fee: 10 }),
    kop: P("Kopenhagen", "Skandinavien", 55.69, 12.60, { tour: .75, tourSeason: "ostsee", tourFrom: 1895, pop: 300, wealth: 1.1, trade: .5, fee: 60 }),
    mal: P("Malmö", "Skandinavien", 55.61, 13.00, { pop: 40, trade: .2, fee: 30 }),
    tre: P("Trelleborg", "Skandinavien", 55.37, 13.15, { pop: 10, tr: .8, trFrom: 1909, fee: 20 }),
    got: P("Göteborg", "Skandinavien", 57.70, 11.95, { pop: 100, trade: .3, ausw: .15, fee: 50 }),
    fre: P("Frederikshavn", "Skandinavien", 57.44, 10.54, { pop: 8, tr: .4, fee: 15 }),
    osl: P("Kristiania", "Skandinavien", 59.91, 10.75, { pop: 150, trade: .3, tour: .4, tourSeason: "nord", tourFrom: 1888, fee: 50 }),
    ber: P("Bergen", "Skandinavien", 60.39, 5.32, { pop: 60, trade: .1, tour: 1.1, tourSeason: "nord", tourFrom: 1888, fee: 50 }),
    sto: P("Stockholm", "Skandinavien", 59.33, 18.07, { tour: .95, tourSeason: "ostsee", tourFrom: 1895, pop: 250, trade: .55, fee: 60 }),
    rig: P("Riga", "Ostsee-Osten", 56.95, 24.10, { pop: 180, trade: .45, ausw: .2, fee: 60 }),
    stp: P("St. Petersburg", "Ostsee-Osten", 59.93, 30.30, { pop: 900, trade: .9, fee: 80 }),
    ams: P("Amsterdam", "Westeuropa", 52.37, 4.90, { pop: 300, trade: .5, fee: 60 }),
    rot: P("Rotterdam", "Westeuropa", 51.90, 4.48, { pop: 170, trade: .45, ausw: .3, fee: 240 }),
    hoe: P("Hoek van Holland", "Westeuropa", 51.98, 4.13, { pop: 20, tr: 1, fee: 30 }),
    ant: P("Antwerpen", "Westeuropa", 51.23, 4.40, { pop: 250, trade: .45, ausw: .3, fee: 220 }),
    lon: P("London", "Westeuropa", 51.50, 0.00, { pop: 4000, wealth: 1.3, trade: .35, fee: 280 }),
    grv: P("Gravesend", "Westeuropa", 51.44, 0.37, { pop: 25, bad: .15, fee: 10 }),
    til: P("Tilbury", "Westeuropa", 51.46, 0.36, { pop: 6, tr: .4, trFrom: 1886, fee: 8 }),
    dov: P("Dover", "Westeuropa", 51.12, 1.32, { pop: 30, tr: .6, fee: 30 }),
    cal: P("Calais", "Westeuropa", 50.96, 1.85, { pop: 60, tr: .6, fee: 30 }),
    por: P("Portsmouth", "Westeuropa", 50.80, -1.10, { pop: 130, tr: .3, fee: 20 }),
    ryd: P("Ryde (Isle of Wight)", "Westeuropa", 50.73, -1.16, { pop: 10, bad: .8, fee: 8 }),
    ply: P("Plymouth", "Westeuropa", 50.37, -4.14, { pop: 80, trade: .2, ausw: .2, fee: 25 }),
    hmf: P("Hammerfest (Nordkap)", "Skandinavien", 70.66, 23.68, { pop: 2, tour: 1.1, tourSeason: "nord", tourFrom: 1888, fee: 10 }),
    fun: P("Funchal (Madeira)", "Süden", 32.64, -16.91, { pop: 40, trade: .1, tour: .9, tourSeason: "atlantik", tourFrom: 1888, fee: 25 }),
    lpa: P("Las Palmas", "Süden", 28.14, -15.41, { pop: 50, trade: .3, tour: .7, tourSeason: "atlantik", tourFrom: 1888, fee: 25 }),
    sct: P("Santa Cruz de Tenerife", "Süden", 28.47, -16.25, { pop: 40, trade: .2, tour: .7, tourSeason: "atlantik", tourFrom: 1888, fee: 25 }),
    fue: P("Puerto de Cabras (Fuerteventura)", "Süden", 28.50, -13.86, { pop: 3, tour: .8, tourSeason: "atlantik", tourFrom: 1965, fee: 8 }),
    pal: P("Palma (Mallorca)", "Süden", 39.57, 2.65, { pop: 60, trade: .2, tour: .6, tourSeason: "mittel", tourFrom: 1905, fee: 30 }),
    sth: P("St. Thomas", "Übersee", 18.34, -64.93, { pop: 12, trade: .5, tour: .7, tourSeason: "karibik", tourFrom: 1900, fee: 30 }),
    hva: P("Havanna", "Übersee", 23.14, -82.36, { pop: 250, wealth: 1.05, trade: .6, ziel: .3, tour: .8, tourSeason: "karibik", tourFrom: 1900, fee: 60 }),
    kin: P("Kingston", "Übersee", 17.97, -76.79, { pop: 50, trade: .3, tour: .5, tourSeason: "karibik", tourFrom: 1900, fee: 30 }),
    bgi: P("Bridgetown", "Übersee", 13.10, -59.62, { pop: 40, trade: .3, tour: .6, tourSeason: "karibik", tourFrom: 1900, fee: 30 }),
    lpl: P("Liverpool", "Britische Inseln", 53.41, -3.00, { pop: 550, wealth: 1.1, trade: .5, ausw: 1, fee: 45 }),
    bir: P("Birkenhead", "Britische Inseln", 53.39, -3.01, { pop: 30, fee: 12 }),
    gla: P("Glasgow", "Britische Inseln", 55.86, -4.25, { tour: .45, tourSeason: "brit", tourFrom: 1888, pop: 600, wealth: 1.05, trade: .45, ausw: .6, bad: .3, fee: 40 }),
    bel: P("Belfast", "Britische Inseln", 54.60, -5.92, { pop: 210, trade: .3, ausw: .3, fee: 25 }),
    dub: P("Dublin", "Britische Inseln", 53.35, -6.22, { tour: .3, tourSeason: "brit", tourFrom: 1888, pop: 350, trade: .35, ausw: .4, tr: .6, fee: 25 }),
    hol: P("Holyhead", "Britische Inseln", 53.31, -4.63, { pop: 8, tr: .8, fee: 12 }),
    dou: P("Douglas (Isle of Man)", "Britische Inseln", 54.15, -4.47, { pop: 15, bad: 1, fee: 12 }),
    que: P("Queenstown", "Britische Inseln", 51.85, -8.30, { pop: 10, ausw: 1, fee: 15 }),
    har: P("Harwich", "Westeuropa", 51.95, 1.29, { pop: 10, tr: 1, fee: 25 }),
    hul: P("Hull", "Westeuropa", 53.74, -0.30, { pop: 200, trade: .3, ausw: .1, fee: 60 }),
    lei: P("Leith", "Westeuropa", 55.98, -3.17, { tour: .35, tourSeason: "brit", tourFrom: 1888, pop: 300, trade: .3, fee: 60 }),
    sou: P("Southampton", "Westeuropa", 50.90, -1.40, { pop: 60, trade: .3, ausw: .15, fee: 60 }),
    hav: P("Le Havre", "Westeuropa", 49.49, 0.10, { pop: 110, trade: .4, ausw: .3, fee: 70 }),
    lis: P("Lissabon", "Süden", 38.70, -9.15, { pop: 300, trade: .35, tour: .45, tourSeason: "mittel", tourFrom: 1888, fee: 60 }),
    gen: P("Genua", "Süden", 44.40, 8.93, { pop: 180, trade: .45, ausw: .3, tour: .6, tourSeason: "mittel", tourFrom: 1888, fee: 70 }),
    nea: P("Neapel", "Süden", 40.84, 14.25, { pop: 500, trade: .35, ausw: .4, tour: .75, tourSeason: "mittel", tourFrom: 1888, fee: 60 }),
    kon: P("Konstantinopel", "Süden", 41.00, 28.98, { pop: 900, trade: .5, tour: .55, tourSeason: "orient", tourFrom: 1891, fee: 90 }),
    ale: P("Alexandria", "Süden", 31.20, 29.90, { pop: 250, trade: .4, tour: .5, tourSeason: "orient", tourFrom: 1891, fee: 80 }),
    ny: P("New York", "Übersee", 40.60, -74.00, { pop: 1500, wealth: 1.2, trade: 1, ziel: 1, fee: 1960 }),
    rio: P("Rio de Janeiro", "Übersee", -22.90, -43.20, { pop: 500, trade: .4, ziel: .55, fee: 2160 }),
    bue: P("Buenos Aires", "Übersee", -34.60, -58.40, { pop: 400, trade: .4, ziel: .5, fee: 2200 }),
    kap: P("Kapstadt", "Übersee", -33.90, 18.40, { pop: 60, trade: .2, ziel: .08, fee: 1500 }),
    sha: P("Shanghai", "Übersee", 31.20, 121.50, { pop: 400, trade: 1.2, ziel: .1, fee: 2400 }),
  };
  const REGIONS = ["Deutsche Nordsee", "Deutsche Ostsee", "Skandinavien", "Ostsee-Osten", "Westeuropa", "Britische Inseln", "Süden", "Übersee"];
  const HOME = "ham";

  // Wegpunkte auf See
  const WP = {
    elbe: [53.95, 8.45], brunsb: [53.90, 9.14], weser: [53.85, 8.10], dbight: [54.05, 7.50], ostfries: [53.78, 6.95], nfries: [54.60, 7.90], jutland: [57.20, 7.80],
    skag: [57.95, 10.60], kattn: [57.70, 11.60], katts: [56.60, 11.90], sund: [55.72, 12.88], gbelt: [55.30, 10.95], kbucht: [54.50, 10.30], fehm: [54.60, 11.30],
    lbucht: [54.10, 11.00], kadet: [54.45, 12.05], bornw: [55.00, 13.00], arkona: [54.75, 13.55], trel: [55.30, 13.20], pomm: [54.20, 14.30], borne: [55.50, 15.50],
    danbay: [54.55, 18.95], gotl: [57.20, 19.60], stoapp: [59.30, 19.20], rigab: [57.50, 23.50], finnw: [59.60, 22.00], finn: [59.90, 27.00], oslofj: [59.00, 10.60],
    nsc: [55.50, 4.00], nsn: [57.90, 3.00], wnorway: [60.30, 4.90], wfries: [53.60, 5.00], ijm: [52.50, 4.40], maas: [52.00, 3.90], schelde: [51.50, 3.40],
    harw: [51.95, 1.60], thames: [51.50, 1.40], dover: [51.00, 1.60], humber: [53.60, 0.40], forth: [56.10, -2.40], chmid: [50.20, -1.00], solent: [50.77, -1.12],
    seine: [49.60, -0.10], chw: [49.90, -5.30], clear: [51.00, -10.50], ushant: [48.40, -5.80], finis: [43.00, -9.80], tejo: [38.60, -9.50], stvin: [36.90, -9.20],
    gib: [36.00, -5.60], alboran: [36.50, -2.00], sard: [38.50, 8.50], corsica: [42.50, 9.80], ligur: [44.00, 9.00], napb: [40.60, 14.00], mess: [38.20, 15.60],
    matap: [36.20, 22.50], aeg: [38.50, 25.50], dard: [40.10, 26.30], marmara: [40.80, 28.50], alexw: [31.40, 29.80], portsaid: [31.30, 32.30], suezs: [29.90, 32.60],
    babel: [12.60, 43.30], ceylon: [5.90, 80.50], sing: [1.20, 103.80], hkapp: [22.00, 114.50], yangtze: [31.00, 122.50], canary: [28.00, -16.00],
    capeverde: [15.00, -24.00], rioapp: [-23.10, -43.00], plata: [-35.00, -56.00], capeapp: [-34.00, 18.00], nyapp: [40.40, -73.50],
    oslo1: [59.60, 10.62], oresn: [56.18, 12.45], hels: [56.04, 12.65], odde: [56.00, 10.95], beltn: [55.60, 10.78], fehmo: [54.35, 11.40], falst: [55.30, 12.70],
    jasm: [54.52, 13.85], rozewie: [54.95, 18.50], irbe: [57.87, 22.40], norfolk: [53.10, 1.90], suffolk: [52.40, 2.00], yorks: [54.30, 0.00], northd: [55.20, -1.20],
    stabbs: [55.95, -1.95], ven: [55.92, 12.78], merb: [53.53, -3.35], nkap: [71.3, 23.0], andoy: [69.8, 14.6], lofot: [68.0, 12.0], vestfj: [65.5, 9.0], stadt: [62.3, 4.6], madw: [32.4, -16.6], antil: [14.5, -60.5], virgin: [18.1, -64.6], windw: [20.0, -73.8], oldbah: [22.6, -78.6], jamwp: [17.7, -76.6], bahamas: [25.5, -76.5], azores: [38.5, -28.0], balear: [39.3, 2.6], calsh: [50.82, -1.31], angl: [53.45, -4.6], irsea: [53.85, -4.6], dublb: [53.33, -6.0], belf: [54.72, -5.45], nchan: [55.2, -5.6], clydew: [55.45, -4.95], malin: [55.6, -7.6], sgc: [52.0, -5.7], corkh: [51.75, -8.25], startp: [50.15, -3.6], travem: [53.97, 10.90], warnow: [54.17, 12.10], bornsud: [54.85, 14.90], ems: [53.45, 6.90], rendsb: [54.30, 9.67], holt: [54.37, 10.14],
  };
  // Kanten: [a, b, Gebiet, feste Distanz (optional), ab Jahr, Kanalgebühr]
  const EDGES = [
    ["ham", "fin", "river", 4], ["ham", "bla", "river", 8], ["fin", "bla", "river", 4], ["bla", "gls", "river", 18], ["ham", "gls", "river", 25], ["gls", "wis", "river", 2], ["gls", "brunsb", "river", 13], ["wis", "brunsb", "river", 12], ["ham", "brunsb", "river", 38], ["fin", "brunsb", "river", 34], ["brunsb", "elbe", "river", 25], ["cux", "elbe", "coast", 6],
    ["elbe", "hel", "coast", 32], ["elbe", "dbight", "north"], ["hel", "dbight", "north"], ["bhv", "weser", "river", 20], ["weser", "dbight", "north"], ["weser", "elbe", "coast"],
    ["ostfries", "dbight", "north"], ["nor", "ostfries", "coast", 8], ["ndd", "nor", "coast", 7], ["ndd", "jui", "coast", 9], ["jui", "ostfries", "coast", 5], ["bor", "ostfries", "coast", 18], ["emd", "ems", "coast", 12], ["ems", "bor", "coast", 13], ["ndd", "bor", "coast", 16],
    ["nfries", "dbight", "north"], ["nfries", "elbe", "coast"], ["syl", "nfries", "coast", 20], ["hoy", "syl", "coast", 12], ["dag", "wyk", "coast", 6], ["wyk", "nfries", "coast", 14], ["nfries", "jutland", "north"], ["jutland", "skag", "north"],
    ["jutland", "nsc", "north"], ["dbight", "nsc", "north"], ["nsc", "nsn", "north"], ["nsn", "wnorway", "north"], ["ber", "wnorway", "coast", 10], ["nsn", "skag", "north"],
    ["skag", "oslofj", "north"], ["osl", "oslo1", "coast", 20], ["oslo1", "oslofj", "coast", 35], ["skag", "kattn", "north"], ["fre", "skag", "coast", 25], ["got", "kattn", "coast", 10], ["kattn", "katts", "baltic"],
    ["katts", "oresn", "baltic"], ["oresn", "hels", "baltic"], ["hels", "ven", "baltic"], ["hsr", "hels", "coast", 1], ["hsb", "hels", "coast", 1.5], ["ven", "sund", "baltic"], ["katts", "odde", "baltic"], ["odde", "beltn", "baltic"], ["beltn", "gbelt", "baltic"], ["kor", "gbelt", "coast", 5], ["gbelt", "kbucht", "baltic"], ["kie", "kbucht", "coast", 12], ["kie", "lab", "coast", 7], ["lab", "kbucht", "coast", 5], ["kbucht", "fehm", "baltic"],
    ["lue", "travem", "river", 10], ["tra", "travem", "coast", 0.5], ["travem", "lbucht", "coast", 3], ["lbucht", "fehmo", "baltic"], ["fehmo", "fehm", "baltic"], ["fehmo", "kadet", "baltic"], ["fehm", "kadet", "baltic"], ["war", "kadet", "coast", 12], ["ros", "warnow", "river", 7], ["war", "warnow", "coast", 0.5], ["warnow", "kadet", "coast", 12], ["ged", "kadet", "coast", 6], ["kadet", "bornw", "baltic"],
    ["kop", "sund", "coast", 5], ["mal", "sund", "coast", 10], ["sund", "falst", "baltic"], ["falst", "bornw", "baltic"], ["bornw", "arkona", "baltic"], ["sas", "jasm", "coast", 10], ["str", "alt", "coast", 1], ["str", "arkona", "coast", 35], ["jasm", "arkona", "baltic"], ["jasm", "trel", "baltic"], ["jasm", "pomm", "baltic"], ["jasm", "bornsud", "baltic"], ["pomm", "bornsud", "baltic"], ["bornsud", "rozewie", "baltic"], ["tre", "trel", "coast", 3],
    ["trel", "arkona", "baltic"], ["trel", "falst", "baltic"], ["arkona", "pomm", "baltic"], ["ste", "pomm", "coast", 40], ["bornw", "borne", "baltic"], 
    ["borne", "rozewie", "baltic"], ["rozewie", "danbay", "baltic"], ["dan", "danbay", "coast", 8], ["kgb", "danbay", "coast", 40], ["borne", "gotl", "baltic"], ["danbay", "gotl", "baltic"], ["gotl", "stoapp", "baltic"],
    ["sto", "stoapp", "coast", 40], ["gotl", "irbe", "baltic"], ["irbe", "rigab", "baltic"], ["rig", "rigab", "coast", 40], ["gotl", "finnw", "balticn"], ["stoapp", "finnw", "balticn"], ["finnw", "finn", "balticn"],
    ["stp", "finn", "balticn", 100], ["brunsb", "rendsb", "canal", 30, 1895, 60], ["rendsb", "holt", "canal", 22, 1895], ["holt", "kbucht", "coast", null, 1895],
    ["dbight", "wfries", "north"], ["ostfries", "wfries", "north"], ["wfries", "ijm", "north"], ["ams", "ijm", "coast", 15], ["ijm", "maas", "north"], ["rot", "maas", "coast", 20],
    ["hoe", "maas", "coast", 3], ["maas", "schelde", "north"], ["ant", "schelde", "coast", 45], ["schelde", "dover", "north"], ["maas", "harw", "north"], ["har", "harw", "coast", 5],
    ["harw", "thames", "coast"], ["lon", "thames", "river", 45], ["lon", "grv", "river", 22], ["grv", "til", "river", 1], ["grv", "thames", "river", 24], ["til", "thames", "river", 24], ["dov", "dover", "coast", 10], ["cal", "dover", "coast", 11], ["por", "solent", "coast", 4], ["ryd", "solent", "coast", 2], ["chmid", "startp", "channel"], ["startp", "chw", "channel"], ["ply", "startp", "coast", 25], ["thames", "dover", "coast"], ["wfries", "humber", "north"], ["hul", "humber", "coast", 30], ["humber", "norfolk", "north"], ["norfolk", "suffolk", "north"], ["suffolk", "harw", "north"],
    ["humber", "yorks", "north"], ["yorks", "northd", "north"], ["northd", "stabbs", "north"], ["stabbs", "forth", "north"], ["lei", "forth", "coast", 30], ["forth", "nsc", "north"], ["forth", "nsn", "north"], ["dover", "chmid", "channel"], ["hav", "seine", "coast", 10],
    ["seine", "chmid", "channel"], ["sou", "calsh", "coast", 8], ["calsh", "solent", "coast", 8], ["solent", "chmid", "channel"], ["chmid", "chw", "channel"], ["chw", "clear", "atlantic"], ["ems", "ostfries", "coast", 22], ["hmf", "nkap", "coast", 25], ["nkap", "andoy", "north"], ["andoy", "lofot", "north"], ["lofot", "vestfj", "north"], ["vestfj", "stadt", "north"], ["stadt", "nsn", "north"], ["ber", "stadt", "coast", 120], ["fun", "madw", "coast", 10], ["madw", "stvin", "atlantic"], ["madw", "canary", "atlantic"], ["lpa", "canary", "coast", 35], ["sct", "canary", "coast", 15], ["fue", "canary", "coast", 120], ["lpa", "sct", "coast", 55], ["lpa", "fue", "coast", 85],
    ["pal", "balear", "coast", 8], ["balear", "alboran", "med"], ["balear", "sard", "med"], ["balear", "ligur", "med"], ["finis", "azores", "atlantic"], ["azores", "antil", "atlantic"], ["capeverde", "antil", "atlantic"], ["bgi", "antil", "coast", 25], ["antil", "virgin", "atlantic"], ["sth", "virgin", "coast", 6], ["virgin", "windw", "atlantic"], ["windw", "jamwp", "coast"], ["kin", "jamwp", "coast", 8], ["windw", "oldbah", "coast"], ["hva", "oldbah", "coast", 260], ["oldbah", "bahamas", "coast"], ["bahamas", "nyapp", "atlantic"], ["virgin", "nyapp", "atlantic"], ["lpl", "bir", "river", 1], ["lpl", "merb", "river", 15], ["bir", "merb", "river", 15], ["merb", "angl", "coast", 45], ["merb", "dou", "coast", 60], ["merb", "irsea", "coast", 60], ["hol", "angl", "coast", 8], ["angl", "dublb", "coast", 50], ["angl", "irsea", "coast", 40], ["dou", "irsea", "coast", 30], ["dub", "dublb", "coast", 8], ["irsea", "dublb", "coast", 55], ["irsea", "belf", "coast", 75], ["bel", "belf", "coast", 12], ["belf", "nchan", "coast", 35], ["nchan", "clydew", "coast", 30], ["gla", "clydew", "river", 40], ["nchan", "malin", "atlantic", 70], ["malin", "nyapp", "atlantic"], ["angl", "sgc", "coast", 90], ["dublb", "sgc", "coast", 80], ["sgc", "corkh", "coast", 100], ["que", "corkh", "coast", 5], ["corkh", "clear", "atlantic", 75], ["sgc", "chw", "channel", 130], ["chw", "ushant", "atlantic"],
    ["clear", "nyapp", "atlantic"], ["ny", "nyapp", "coast", 25], ["ushant", "finis", "atlantic"], ["finis", "tejo", "atlantic"], ["lis", "tejo", "coast", 15], ["tejo", "stvin", "atlantic"],
    ["stvin", "gib", "atlantic"], ["gib", "alboran", "med"], ["alboran", "sard", "med"], ["sard", "corsica", "med"], ["corsica", "ligur", "med"], ["gen", "ligur", "coast", 25],
    ["sard", "napb", "med"], ["nea", "napb", "coast", 20], ["napb", "mess", "med"], ["mess", "matap", "med"], ["matap", "aeg", "med"], ["aeg", "dard", "med"], ["dard", "marmara", "med"],
    ["kon", "marmara", "coast", 25], ["matap", "alexw", "med"], ["ale", "alexw", "coast", 10], ["alexw", "portsaid", "med"], ["portsaid", "suezs", "canal", 90, 0, 1500],
    ["suezs", "babel", "tropic"], ["babel", "ceylon", "tropic"], ["ceylon", "sing", "tropic"], ["sing", "hkapp", "tropic"], ["hkapp", "yangtze", "tropic"], ["sha", "yangtze", "coast", 50],
    ["finis", "canary", "atlantic"], ["stvin", "canary", "atlantic"], ["canary", "capeverde", "tropic"], ["capeverde", "rioapp", "tropic"], ["rio", "rioapp", "coast", 10],
    ["rioapp", "plata", "atlantic"], ["bue", "plata", "coast", 120], ["capeverde", "capeapp", "tropic"], ["kap", "capeapp", "coast", 10],
  ];
  const AREA_RISK = { river: [.002, .0025], coast: [.004, .006], north: [.008, .018], baltic: [.006, .016], balticn: [.007, .03], channel: [.008, .016], atlantic: [.014, .038], tropic: [.012, .014], med: [.005, .009], canal: [.002, .003] };
  const OCEAN = { atlantic: 1, tropic: 1 };

  function coord(id) { const p = PORTS[id]; return p ? [p.lat, p.lon] : WP[id]; }
  function hav(a, b) {
    const [la1, lo1] = coord(a), [la2, lo2] = coord(b), R = 3440;
    const d1 = (la2 - la1) * Math.PI / 180, d2 = (lo2 - lo1) * Math.PI / 180;
    const x = Math.sin(d1 / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(d2 / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x)) * 1.06;
  }
  const ADJ = {};
  for (const [a, b, area, fixed, from, fee] of EDGES) {
    const d = fixed || Math.round(hav(a, b));
    (ADJ[a] = ADJ[a] || []).push({ to: b, d, area, from: from || 0, fee: fee || 0 });
    (ADJ[b] = ADJ[b] || []).push({ to: a, d, area, from: from || 0, fee: fee || 0 });
  }
  const pathCache = {};
  function seaPath(a, b, year) {
    const kwk = year >= 1895 ? 1 : 0, key = a + "|" + b + "|" + kwk;
    if (pathCache[key]) return pathCache[key];
    const dist = { [a]: 0 }, prev = {}, done = new Set(), q = [a];
    while (q.length) {
      q.sort((x, y) => dist[x] - dist[y]); const u = q.shift();
      if (done.has(u)) continue; done.add(u); if (u === b) break;
      for (const e of ADJ[u] || []) {
        if (e.from > year) continue;
        if (PORTS[e.to] && e.to !== b) continue; // Häfen sind keine Durchgangsstationen
        const nd = dist[u] + e.d;
        if (dist[e.to] === undefined || nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = { u, e }; q.push(e.to); }
      }
    }
    if (dist[b] === undefined) return null;
    const nodes = [b], areas = {}; let fee = 0, n = b;
    while (n !== a) { const p = prev[n]; areas[p.e.area] = (areas[p.e.area] || 0) + p.e.d; fee += p.e.fee; n = p.u; nodes.unshift(n); }
    return (pathCache[key] = { dist: Math.round(dist[b]), nodes, areas, canalFee: fee });
  }

  /* ---------- Nachfrage-Segmente ---------- */
  const SEG = {
    local: { name: "Pendler", season: [.95, .95, 1, 1, 1, 1, 1, 1, 1, 1, 1, .95], w: { p: 3, s: .2, c: .1, r: .3, f: 1.2 }, fare: .9 },
    bath: { name: "Badegäste", season: [.03, .03, .08, .3, .8, 1.6, 2.3, 2.2, 1.1, .3, .05, .03], w: { p: 2.2, s: .3, c: 1.4, r: .5, f: .5 }, fare: 1.6 },
    transit: { name: "Bahnreisende", season: [.85, .85, .9, .95, 1.05, 1.2, 1.3, 1.3, 1.1, 1, .9, .85], w: { p: 2.5, s: .4, c: .4, r: .5, f: 1.0 }, fare: 1.25 },
    biz: { name: "Kaufleute", season: [.85, .85, .95, 1, 1.05, 1.1, 1.1, 1.05, 1.05, 1, .95, .9], w: { p: 2.2, s: 1.0, c: .5, r: .8, f: .5 }, fare: 1 },
    ausw: { name: "Auswanderer", season: [.6, .6, .8, 1.2, 1.4, 1.3, 1.1, 1, 1, .9, .7, .6], w: { p: 2.5, s: .8, c: .5, r: 1.0, f: .35 }, fare: 1.35 },
    tour: { name: "Vergnügungsreisende", season: null, w: { p: 1.5, s: .2, c: 1.9, r: .8, f: .25 }, fare: 0 },
    gen: { name: "Reisende", season: [.85, .85, .9, .95, 1.05, 1.15, 1.25, 1.25, 1.1, 1, .9, .85], w: { p: 2.5, s: .5, c: .5, r: .6, f: .7 }, fare: 1.1 },
  };
  const TOUR_SEASON = { nord: [0, 0, 0, 0, .9, 1.9, 2.4, 2.2, 1.0, 0, 0, 0], ostsee: [0, 0, 0, 0, .3, 1.8, 2.3, 2.2, 1.2, 0, 0, 0], brit: [0, 0, 0, .3, 1.2, 1.8, 2.1, 2.0, 1.0, .2, 0, 0],
    sued: [1.0, 1.2, 1.8, 2.0, 1.4, .3, 0, 0, .9, 1.7, 1.4, 1.0], mittel: [1.0, 1.2, 1.8, 2.0, 1.4, .3, 0, 0, .9, 1.7, 1.4, 1.0], orient: [2.0, 2.1, 1.8, 1.0, 0, 0, 0, 0, 0, .3, 1.3, 1.9],
    atlantik: [2.0, 2.0, 1.7, 1.1, .5, 0, 0, 0, 0, .7, 1.5, 1.9], karibik: [2.2, 2.4, 2.2, 1.4, 0, 0, 0, 0, 0, 0, .5, 1.6] };
  const K = { local: 350, bath: 100, transit: 50000, biz: 21500, ausw: 4900, tour: 25.5, gen: 100 };
  const FARE_PTS = [[0, .2], [5, .3], [25, 1.2], [60, 2.2], [100, 3.8], [150, 8], [330, 21], [450, 29], [1000, 45], [3500, 95], [5500, 125], [10500, 380], [20000, 520]];
  function baseFare(d) { for (let i = 1; i < FARE_PTS.length; i++) { const [x1, y1] = FARE_PTS[i - 1], [x2, y2] = FARE_PTS[i]; if (d <= x2) return y1 + (y2 - y1) * (d - x1) / (x2 - x1); } return 520; }

  function portVal(pm, id, key) { const p = PORTS[id]; const mult = pm && pm[id] && pm[id][key] != null ? pm[id][key] : 1; return p[key] * mult; }
  function segments(a, b, d, year, pm) {
    const A = PORTS[a], B = PORTS[b], v = (id, k) => portVal(pm, id, k);
    const pa = v(a, "pop"), pb = v(b, "pop");
    const src = id => Math.pow(v(id, "pop"), .8) * PORTS[id].wealth;
    const lux = id => Math.sqrt(v(id, "pop")) * PORTS[id].wealth * PORTS[id].wealth;
    const tr = id => year >= PORTS[id].trFrom ? PORTS[id].tr : 0;
    const tourW = id => PORTS[id].tour * (year >= PORTS[id].tourFrom ? 1 : .15);
    const s = {};
    s.local = d <= 20 ? K.local * Math.sqrt(pa * pb) * Math.exp(-d / 6) : 0;
    s.bath = K.bath * (src(a) * v(b, "bad") + src(b) * v(a, "bad")) * Math.exp(-d / 100);
    s.transit = K.transit * tr(a) * tr(b) * Math.exp(-d / 60);
    s.biz = K.biz * Math.pow(v(a, "trade") * v(b, "trade"), .9) / Math.pow(1 + d / 150, .75);
    s.ausw = K.ausw * (v(a, "ausw") * v(b, "ziel") + v(b, "ausw") * v(a, "ziel"));
    s.tour = K.tour * (lux(a) * tourW(b) + lux(b) * tourW(a));
    s.gen = d >= 10 ? K.gen * Math.sqrt(pa * pb) / Math.pow(1 + d / 40, 2) : 0;
    return s;
  }

  const api = { PORTS, REGIONS, HOME, WP, EDGES, ADJ, AREA_RISK, OCEAN, SEG, TOUR_SEASON, coord, seaPath, segments, baseFare, portVal };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.World = api;
})(this);
