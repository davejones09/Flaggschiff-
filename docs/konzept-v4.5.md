# Konzept v4.5 „Kohle und Küche“

*Stand 18. Oktober 2026 · umgesetzt in v4.5*

Kohle war bisher ein fester Kostenblock. Mit v4.5 wird sie zur Stellschraube – und das Essen an Bord zu einem Grund, warum Fahrgäste kommen oder gehen. Dieses Dokument beschreibt, was gebaut wurde, mit den endgültigen Zahlen nach der Simulation.

## Grundsätze

- Alles Neue startet auf dem bisherigen Verhalten: Fahrstufe Normal, Verpflegung „ordentlich“ ohne Vertrag, keine Lieferverträge. Wer nichts anfasst, spielt wie bisher. Alte Spielstände bekommen diese Werte beim Laden (E.migrate).
- Jede Option hat einen spürbaren Nachteil. Keine Einstellung ist überall die beste.
- Automatik gibt es nur über angestelltes Personal mit Gehalt und Lohnstufe (knapp, Tarif, gut, sehr gut). Ohne Personal geht alles von Hand.
- Einstellungen gelten für die ganze Reederei, einzelne Schiffe lassen sich ausnehmen.
- Alle Zahlen sind per Simulation geprüft (siehe unten). Was sich gegenüber den Startwerten geändert hat, steht im Abschnitt „Was die Simulation geändert hat“.

## 1. Kohlepreis

- Der Kohlepreis ist ein Index in Prozent des Normalpreises. Er steht mit Pfeil (steigt, fällt, unverändert) in der Kontor-Übersicht und am PC in der linken Leiste. Ein Tipp auf die Kohlepreis-Leiste führt zum Einkauf.
- Jeden Monat bewegt er sich um bis zu ±3 % (bisher ±1 %) und kehrt langsam zu 100 % zurück. Grenzen 75 bis 160 %.
- Weiter gibt es die Nachrichten „Kohle wird teuer“ (springt auf 130 %, Gewicht 0,7) und „Kohle so billig wie lange nicht“ (fällt auf 75 %).
- Historische Kohlekrisen, je nach Land unterschiedlich stark (Faktor Deutschland / Großbritannien, Dauer in Monaten, in der der Preis nicht unter 95 % des Krisenwerts fällt):

| Jahr | Ereignis | Deutschland | Großbritannien | Dauer |
|---|---|---|---|---|
| 1889 | Bergarbeiterstreik an der Ruhr | ×1,25 | ×1,10 | 3 Monate |
| 1893 | Aussperrung im britischen Kohlenbergbau | ×1,10 | ×1,30 | 4 Monate |
| 1905 | Großer Bergarbeiterstreik an der Ruhr | ×1,20 | ×1,05 | 2 Monate |
| 1912 | Britischer Kohlestreik | ×1,15 | ×1,40 | 2 Monate |
| 1923 | Ruhrbesetzung | ×1,40 | ×1,10 | 6 Monate |
| 1926 | Britischer Bergarbeiterstreik | ×1,10 | ×1,45 | 7 Monate |

- Der Preis wird jeden Monat gespeichert (zehn Jahre). Kontor → Statistik → Kohle zeigt den Verlauf als Liniendiagramm, dazu Schnitt der letzten 12 Monate, Tiefst- und Höchstwert und die Kohlekosten je Jahr mit Anteil an den Kosten.
- In den Statistik-Tabellen Schiffe und Linien gibt es die sortierbare Spalte „Kohle“. Die Schiffsansicht zeigt Kohle und Verpflegung im Vormonat und den Anteil der Kohle an den Kosten.
- Öl- und Motorschiffe hängen weiter am selben Brennstoffpreis.

## 2. Fahrstufen

| | Sparfahrt | Normal | Volldampf |
|---|---|---|---|
| Tempo | −15 % | – | +8 % |
| Kohle je Fahrt (Tempo²) | −28 % | – | +17 % |
| Fahrten im Monat | weniger | – | mehr |
| Verpflegung je Fahrgast | +18 % (längere Seezeit) | – | −7 % |
| Erlös | −1,5 % je 10 % längerer Seezeit, 1. Klasse doppelt (also −2,6 % bzw. −5,3 %); nicht bei Vergnügungsreisen | – | – |
| Verschleiß | – | – | +50 % |

- Die Fahrgäste merken die Hälfte der Tempoänderung (bei der Wahl zwischen Ihnen und der Konkurrenz).
- Postverträge: Ein Schiff erfüllt den Vertrag nur, wenn sein Tempo mal Fahrstufe die Mindestgeschwindigkeit schafft. Die Vorschau und die Schiffsansicht warnen.
- Reederei-Fahrstufe oben in der Flotte, Ausnahme pro Schiff in der Schiffsansicht. Ausnahmen sind in der Flottenliste markiert.
- Maschineninspektor (500 M Tarif): Regel „Sparfahrt ab __ %“ (Standard 125 %) und „Volldampf unter __ %“ (Standard 90 %) für alle Schiffe, die der Reederei-Fahrstufe folgen. Knapp: zwei Monate Verzug, übersieht Postverträge. Tarif: ein Monat Verzug. Gut: sofort. Sehr gut: sofort und 3 % weniger Kohle in der ganzen Flotte. Ab Tarif nimmt er Schiffe mit Postvertrag von der Sparfahrt aus. Wer die Fahrstufe von Hand ändert, schaltet die Regel aus.

## 3. Kohle-Lieferverträge

- Neue Kontor-Unterseite „Einkauf“.
- Laufzeit 1, 3 oder 5 Jahre zum heutigen Preis plus 3, 6 oder 10 % Aufschlag.
- Menge 50 oder 100 % des Verbrauchs (Schnitt der letzten drei Monate). Mehrverbrauch zum Marktpreis, Mindestabnahme 80 %: Was darunter liegt, wird trotzdem berechnet.
- Höchstens zwei Verträge, zusammen höchstens 100 % des Verbrauchs. Kündigung kostet ein Viertel der Restsumme.
- Ereignis Lieferausfall (Streik oder Grubenunglück beim Lieferanten): 1 bis 3 Monate Marktpreis.
- Kohleneinkäufer (400 M Tarif): Aufschlag 1/2/3/4 Prozentpunkte niedriger je Lohnstufe, warnt drei Monate vor Vertragsende, verlängert zu gleichen Bedingungen, wenn die Kohle unter einer wählbaren Grenze liegt (Standard 95 %). Knapp bezahlt vergisst er die Warnung manchmal (35 %).

## 4. Verpflegung

| Stufe | Kosten | Küchenwert |
|---|---|---|
| einfach | −25 % | 30 |
| ordentlich | wie bisher | 50 |
| fein | +60 % | 78 |
| à la carte (nur Restaurant, 1. Klasse) | +124 % (fein +40 %) | 95 |

- Einstellbar pro Klasse für die ganze Reederei (Kontor → Einkauf), Ausnahme pro Schiff und Klasse.
- Wirkung auf die Fahrgäste nur auf Strecken mit Mahlzeiten (ab 40 Seemeilen und bei Vergnügungsreisen): zur Hälfte sofort über das Essen an Bord, zur Hälfte über die neue Erfahrung „Küche“ (neben Komfort, Service, Sicherheit), die sich über Monate einstellt. Gewicht 1,2 in der 1. Klasse, 0,6 in der 2. Klasse, 0,2 im Zwischendeck.
- Bei Vergnügungsreisen wirkt der Ruf der Küche zusätzlich auf die Nachfrage (bis ±36 %).
- Längere Seezeit durch Sparfahrt bedeutet mehr Mahlzeiten (gewollt).
- Eigene Küche: 10 % billiger, braucht einen Proviantmeister (450 M Tarif). Knapp bezahlt gelingt „fein“ nicht ganz (Küchenwert −8) und der Proviant verdirbt öfter; gut +3, sehr gut +6.
- Caterer auf der Einkaufsseite, 1 oder 3 Jahre, fester Preis pro Fahrgast (keine Teuerung während der Laufzeit). Beim Verlängern 3 bis 12 % teurer. Pleite: einen Monat Notverpflegung „einfach“, danach wieder eigene Verpflegung.

| Caterer | Stufen | Preis | Besonderheit | Hamburg | Liverpool | London |
|---|---|---|---|---|---|---|
| Billiganbieter | einfach, ordentlich | −10 % | Qualität schwankt, öfter Ärger | Hafenküche Billwerder | Dockside Victualling Company | Wapping Galley Works |
| solider Caterer | alle | Normalpreis | – | Hanseatische Proviant-Gesellschaft | Mersey Provision Company | Thames Provision Company |
| Hotel-Caterer | ordentlich, fein | +5 % | fein bringt Ansehen | Alster-Hotel-Gesellschaft | Wellington Hotel Company | Strand Hotel Company |
| Luxus-Restaurant (ab 1905) | nur 1. Klasse, à la carte | fein +40 % | Prestige und Bekanntheit | Restaurant-Gesellschaft Imperial | Restaurant Excelsior | Restaurant Monarch |

- Ereignisse: verdorbener Proviant (ersetzen oder aussortieren – dann droht Krankheit), Krankheit an Bord mit 14 Tagen Quarantäne und Entschädigungen, Lob für die Küche in der Zeitung, berühmter Koch (teuer anstellen: Küchenwert +20 in der 1. Klasse eines Schiffs, 700 M im Monat – oder ablehnen; nach einem Jahr kann ihn die Kopenhagener Salonlinie abwerben), Caterer-Pleite, Preiserhöhung beim Verlängern. Die neuen Ereignisse kommen nur, wenn man die neuen Möglichkeiten nutzt.

## 5. Vorschau

Vor jeder Änderung bei Fahrstufe, Verpflegung, eigener Küche und Caterern rechnet das Spiel den Vormonat zweimal nach – einmal wie gespielt, einmal mit der neuen Einstellung, ohne Zufälle – und zeigt die Unterschiede bei Kohle, Verpflegung, Einnahmen, Ergebnis und Fahrgästen. Bei der Verpflegung ist die Wirkung auf Dauer gerechnet (mit eingespielter Erfahrung „Küche“). Bei Kohleverträgen zeigt die Vorschau Preis, festen Monatsbetrag, Mehrkosten zum heutigen Preis, Summe über die Laufzeit und ab welchem Kohlepreis sich der Vertrag lohnt.

## 6. Spielstände und Oberfläche

- Speicherschlüssel unverändert. Alte Spielstände (alle Versionen seit v1.0 getestet) laden und spielen weiter. Neue Felder: fahrt, kueche, coalK, coalHist, coalUse, exp.ku, Personal mi/ke/pm.
- Mit Standardwerten rechnet v4.5 Schritt für Schritt genau wie v4.4.3 (bitgleich geprüft); die einzigen Unterschiede für Nichtstuer sind die stärkere Monatsschwankung, die Kohlekrisen und die seltenere Nachricht „Kohle wird teuer“.
- Alle Texte auf Deutsch, Englisch und Spanisch. Britischer Heimathafen: Beträge in Pfund.
- 14 neue Bilder aus vier Bildbögen (siehe originale/LIESMICH.md).

## 7. Simulation

`node tools/simulation.js` – Bots führen je Linienart eine kleine Reederei über 40 Betriebsjahre (1880–1920, Vergnügungsreise 1891–1931), mit Schiffsinspektor, Erneuerung alter Schiffe und einfacher Preispolitik (Preise rauf, wenn eine Klasse oft ausgebucht ist). Je Strategie 24 Läufe, verglichen wird der durchschnittliche Jahresgewinn mit „nichts anfassen“ (gepaart nach Startwert, ± Standardfehler). Insgesamt 2.040 Spiele, rund vier Minuten. Weil jedes Spiel seine eigenen Zufälle hat, liegen Unterschiede unter etwa 5 % im Rauschen.

Linienarten: Fähre (Dover–Calais, London), Küste und Bäder (Hamburg–Helgoland, Mai bis September), Nord- und Ostsee (Hamburg–London, Lübeck–Kopenhagen), Hochsee (Liverpool–New York), Vergnügungsreise (Hamburg–Bergen).

### Fahrstufe – Ø Jahresgewinn gegenüber Normal

| Linienart | Sparfahrt | Volldampf | Inspektor Tarif | Inspektor sehr gut | am besten |
|---|---|---|---|---|---|
| Fähre | −3 % | −39 % | −53 % | −61 % | Normal |
| Küste und Bäder | −15 % | −47 % | −39 % | −34 % | Normal |
| Nord- und Ostsee | −43 % | −3 % | −4 % | +8 % | Inspektor sehr gut |
| Hochsee | −26 % | +7 % | +3 % | +13 % | Inspektor sehr gut |
| Vergnügungsreise | −10 % | −6 % | −1 % | −3 % | Normal |

Ab welchem Kohlepreis lohnt sich was (Vormonat nachgerechnet, ohne Langzeitfolgen wie Verschleiß)?

| Linienart | Sparfahrt lohnt sich | Volldampf lohnt sich |
|---|---|---|
| Fähre | ab etwa 120 % | nie |
| Küste und Bäder | ab etwa 100 % | nie |
| Nord- und Ostsee | erst ab etwa 160 % | bis etwa 80 % |
| Hochsee | bis 160 % nicht | bis etwa 120 % |
| Vergnügungsreise | bis 160 % nicht | im Monat immer, auf Dauer frisst der Verschleiß den Vorteil |

Sparfahrt ist ein Werkzeug für teure Kohle auf kurzen Strecken, Volldampf eines für billige Kohle auf langen, umkämpften Strecken. Kleine Flotten lohnen den Maschineninspektor nicht – sein Gehalt frisst den Vorteil.

### Verpflegung – Ø Jahresgewinn gegenüber „ordentlich“

| Linienart | einfach | fein | 1. Kl. fein, sonst ordentlich | eigene Küche | solider Caterer (1. Kl. fein) | Billig-Caterer (einfach) | am besten |
|---|---|---|---|---|---|---|---|
| Küste und Bäder | +61 % | −301 % | −104 % | +3 % | −149 % | +73 % | Billig-Caterer |
| Nord- und Ostsee | −32 % | +18 % | +8 % | +6 % | +16 % | −29 % | fein |
| Hochsee | +1 % | +6 % | +15 % | +5 % | +7 % | +8 % | 1. Kl. fein |
| Vergnügungsreise | −41 % | +7 % | +9 % | +1 % | +9 % | −27 % | solider Caterer |

Auf der Fähre (21 Seemeilen) gibt es keine Mahlzeiten. Kurze Bäderfahrten vertragen einfache Kost, Geschäftsreisende und Kreuzfahrer wollen fein essen, auf Auswandererlinien zahlt sich „fein“ vor allem in der 1. Klasse aus.

### Kohle-Lieferverträge – Ø Jahresgewinn gegenüber „ohne Vertrag“

| Linienart | immer 1 Jahr, 50 % | immer 5 Jahre, 100 % | 5 Jahre nur unter 90 % | Einkäufer (gut), 3 Jahre |
|---|---|---|---|---|
| Fähre | +1 % | −24 % | +28 % | −16 % |
| Küste und Bäder (Winterpause) | −245 % | −592 % | −182 % | −343 % |
| Nord- und Ostsee | −1 % | −9 % | −7 % | −4 % |
| Hochsee | +5 % | +1 % | +5 % | +2 % |
| Vergnügungsreise | +3 % | −2 % | +3 % | −4 % |

Verträge lohnen sich in 8 von 20 Fällen, in einzelnen Läufen 174-mal von 480. Wer billig einkauft, gewinnt; wer immer lange bindet, zahlt den Aufschlag. Linien mit Winterpause sollten keine Verträge schließen – die Mindestabnahme läuft weiter.

### Nichts anfassen: v4.5 gegen v4.4.3

Ø Kohlepreis v4.4.3 102,3 %, v4.5 101,3 % (mit Kohlekrisen). Gewinn aller Linienarten zusammen −1,6 % ± 3,6 % – im Rahmen der Messgenauigkeit nicht schlechter. Ohne die drei gewollten Änderungen am Kohlepreis laufen die 40-Jahre-Spiele bitgleich.

### Was die Simulation geändert hat

| Wert | Startwert | Endwert | Grund |
|---|---|---|---|
| Erlösabschlag Sparfahrt | −3 % je 10 % Seezeit | −1,5 % je 10 % Seezeit | Sparfahrt war sonst nirgends sinnvoll |
| Tempo bei der Fahrgastwahl | voll | zur Hälfte | volles Tempo machte Volldampf auf langen Strecken übermächtig und Sparfahrt zum Ruin |
| Erlösabschlag bei Vergnügungsreisen | ja | nein | die Reise ist das Produkt; mehr Mahlzeiten kosten trotzdem |
| Gewicht der Küche | 0,5 (1,0 / 0,6 / 0,25) | 1,0 (1,2 / 0,6 / 0,2) | „einfach“ war sonst überall am besten |
| Ruf der Küche bei Vergnügungsreisen | – | Nachfrage bis ±36 % | Kreuzfahrten sind in der Saison ausgebucht, gute Küche wirkte sonst kaum |
| Küche der Konkurrenz | je Rivale verschieden | alle „ordentlich“ | sonst wurde Nichtstun schlechter als v4.4.3 |
| Nachricht „Kohle wird teuer“ | Gewicht 1 | Gewicht 0,7 | gleicht die Kohlekrisen im Schnitt aus |
| Regel Maschineninspektor | – | Sparfahrt ab 125 %, Volldampf unter 90 % | Sparfahrt lohnt erst bei teurer Kohle |
