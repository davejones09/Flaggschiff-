# Konzept v5.0 „Fahrplan und Pünktlichkeit“

*Stand 24. Oktober 2026 · umgesetzt in v5.0*

Bis v4.6 verdiente jedes Schiff jeden Tag einen Bruchteil seiner Fahrten, Kohle kostete täglich, Verspätungen gab es kaum. Jetzt fahren die Schiffe nach Fahrplan: Fahrkarten bringen Geld bei der Abfahrt, Kohle kostet beim Bekohlen, und Verspätungen kosten Fahrgäste an die Konkurrenz. Dazu kommen Schwierigkeitsgrad, neues Tempo mit automatischen Pausen und Serienbestellungen. Dieses Dokument beschreibt, was gebaut wurde, mit den Zahlen nach der Simulation.

## Grundsätze

- Jede Option hat einen spürbaren Nachteil, keine Einstellung ist überall die beste (geprüft für Gegenmittel, Bekohlungsregeln, Fahrstufe und Verpflegung).
- Automatik nur über angestelltes Personal: Der Fahrplan selbst ist keine Automatik, er folgt aus Schiffen und Puffer. Bei Kohlemangel entscheidet ohne Maschineninspektor der Spieler.
- Leicht spielt sich etwa wie v4.6, Normal spürbar schwerer, Schwer deutlich.
- Eine Atlantiklinie ist kein sicherer Gewinn mehr; die Kurzstrecke bleibt so lohnend wie die Langstrecke.
- Alle Zahlen sind Startwerte, per Simulation geprüft und angepasst (siehe „Was die Simulation geändert hat“).
- Alte Spielstände bleiben ladbar, der Speicherschlüssel ist unverändert.
- Muss auf dem iPhone flüssig laufen: Der Tagesschritt braucht bei 55 Schiffen etwa 1 ms (Node am Server).

## 1. Fahrplan

### Umlauf und Takt

- Jedes Schiff fährt im Kreis: Abfahrt → Seezeit → Ankunft → Liegezeit → Rückfahrt. Die Seezeit kommt wie bisher aus Entfernung und Tempo (Fahrstufe, Maschine, Kapitän, Zustand).
- Liegezeit je Endhafen = halbe Wendezeit der Linie (Atlantik 2,5 Tage, Fähre ein paar Stunden), je Zwischenhalt 6 Stunden. Aussteigen dauert 40 % der Liegezeit, Bekohlen läuft parallel und dauert je nach Menge (Zechenhafen 2.500 t am Tag, sonst 1.200 t, mindestens zwei Stunden).
- Umlauf einer Linie = längster Umlauf ihrer Schiffe × (1 + Puffer). Takt = Umlauf ÷ Zahl der Schiffe; die Schiffe fahren abwechselnd von beiden Enden. Schnellere Schiffe liegen länger im Hafen.
- Neue Schiffe (Ablieferung, Werft, Linienwechsel, Überführung) reihen sich in die größte Lücke des Takts ein. Einmal im Monat und bei jeder Änderung der Flotte wird der Takt neu verteilt, wenn die Abstände deutlich schief sind; dabei fährt kein Schiff früher als geplant.
- Ist eine Abfahrt um mehr als ein Viertel Takt (mindestens einen Tag) zu spät, plant das Schiff ab der tatsächlichen Abfahrt neu, statt dem Plan hinterherzulaufen.
- Ein Schiff auf See beendet erst seine Fahrt, bevor es in die Werft geht, die Linie wechselt oder aufgelegt wird.

### Sonderfälle

- **Tagespaket:** Linien mit einem Umlauf unter einem Tag (Hafenfähren, Dover–Calais) werden je Tag in einem Schritt gerechnet. Nebel und Sturm lassen dort Fahrten ausfallen oder verspäten; die Pünktlichkeit zählt als Anteil pünktlicher Fahrten. Gekohlt wird täglich im Heimathafen der Linie.
- **Zwischenhalte:** kurzer Halt in jedem Hafen. Fahrgäste steigen je Teilstrecke ein und aus, der Platz ist auf jeder Teilstrecke begrenzt.
- **Vergnügungsreisen:** Abfahrt nur im Starthafen, die Gäste zahlen die ganze Reise bei der Abfahrt, das Schiff kommt zum Starthafen zurück.

## 2. Fahrgäste

- Jeden Tag kommen neue Reisende je Linie, Richtung und Klasse. Sie wählen wie bisher nach Preis, Tempo, Komfort, Ruf und Erfahrungen, neu auch nach Pünktlichkeit (Abschnitt 5). Wer Sie wählt, wartet auf Ihre nächste Abfahrt in seine Richtung.
- **Abwandern:** Liegt Ihre nächste Abfahrt später als die Hälfte des üblichen Abstands der Rivalen, wechseln Wartende zu ihnen – je Abfahrt eines Rivalen mit 5 × Ungeduld der Kundschaft (Kaufleute 50 %, Pendler und Bahnreisende 40 %, Badegäste 25 %, Auswanderer 15 %, Ausflügler 10 %), anteilig nach der Wartezeit über diese Hälfte hinaus. Ohne Konkurrenz wandert niemand ab.
- **Überfällig:** Ist die Abfahrt mehr als die übliche Verspätung der Linie zu spät (½ Tag, auf langen Strecken bis 15 % der Seezeit), springen Wartende ab (je Tag Kaufleute 10 %, Pendler 8 %, Badegäste 5 %, Auswanderer 3 %, Ausflügler 2 %), und Neue buchen nur zur Hälfte.
- **Einsteigen:** Bei der Abfahrt steigt ein, wer Platz findet; die Fahrkarten werden jetzt bezahlt („Fahrkarten“ im Hauptbuch). Wer keinen Platz bekommt, fährt mit der Konkurrenz. Abgewiesene stehen im Monatsbericht je Klasse und unter „Linien“ („Fahrgäste fanden keinen Platz“).
- **Hafengebühr** je Anlauf. **Verpflegung** je tatsächlichem Tag an Bord, Verspätungen kosten also Essen.
- **Entschädigung** ab zwei Tagen Verspätung je weiterem Tag: 10 % (1. Klasse), 6 % (2. Klasse), 3 % (3. Klasse/Zwischendeck) des Fahrpreises, höchstens die Hälfte.
- Saison, Nachfrage, Klassen und Preise je Klasse bleiben wie bisher.

## 3. Bekohlung

### Tonnen und Preise

- Kohle wird in Tonnen gerechnet. 1 t kostet im Zechenhafen bei Kohlepreis 100 % 15 Mark; damit kostet eine Seemeile so viel wie bis v4.6.
- Bunker eines Schiffs = Reichweite × Verbrauch × 0,85 ÷ 15 t. Verbrauch je Seemeile wie bisher nach Typ, Fahrstufe (quadratisch), Lohnstufe Maschine, Kessel und Kapitän; volle Bunker machen das Schiff bis zu 6 % durstiger.
- Bezahlt wird beim Bekohlen: Tonnen × Hafenpreis × Kohlepreis. Hauptbuch „Bekohlung <Hafen>“, im Kontor als eine Gruppe mit den Häfen darunter.

| Lage | Faktor | Häfen |
|---|---|---|
| Zechenhafen | 100 % | Hamburg, Bremerhaven, Stettin, Rotterdam, Amsterdam, Antwerpen, London, Gravesend, Tilbury, Southampton, Liverpool, Birkenhead, Glasgow, Leith, Hull |
| Europa | 106 % | alle übrigen europäischen Häfen |
| Kohlestation | 118 % | Funchal, Las Palmas, Santa Cruz, St. Thomas, Lissabon, New York, Genua, Neapel, Palma, Alexandria, Havanna, Kingston, Bridgetown, Riga, St. Petersburg |
| Ferne | 140 % | Rio de Janeiro, Buenos Aires, Kapstadt, Schanghai, Konstantinopel, Hammerfest, Fuerteventura |

### Regeln

| Regel | Wo voll getankt wird | Reserve | Wofür |
|---|---|---|---|
| Im Heimathafen volltanken (Standard) | im Heimathafen der Linie (Ihr Heimathafen, wenn die Linie ihn anläuft, sonst ihr Starthafen), unterwegs nur bis dorthin | 15 % | sicher und meist günstig |
| Wo es am billigsten ist | im billigsten Hafen der Linie | 15 % | Linien, die im teuren Hafen beginnen |
| Immer nur das Nötige | nirgends, überall nur bis zum nächsten Hafen | 8 % | wenig Geld im Bunker, aber öfter Kohlemangel |

- Jedes Schiff kann in der Flotte eine eigene Regel bekommen.
- **Kohlemangel:** Frisst ein Sturm die Reserve, kommt das Ereignis „Kohle wird knapp“ (Bild `ev_kohle_knapp`): langsam weiterfahren, im nächsten Hafen mit 30 % Aufschlag nachbunkern oder Holz und Mobiliar verfeuern (Komfort leidet). Ein Maschineninspektor entscheidet selbst: Er bunkert nach, wenn es mehr als 1,2 Tage spart.
- **Lieferverträge** gelten für einen gewählten Hafen (vorgeschlagen wird der, in dem Ihre Schiffe am meisten bunkern). Menge in Tonnen nach dem Bunkern der letzten drei Monate in diesem Hafen; höchstens zwei Verträge, je Hafen zusammen höchstens 100 %; Mindestabnahme 80 %. Bestehende Verträge gelten nach dem Laden für den Heimathafen.
- **Hauszeche:** liefert 20 % billiger in die Häfen ihrer Region (Ruhr: deutsche Nordseehäfen und Rotterdam/Amsterdam/Antwerpen; Südwales: britische Häfen).
- Kohle im Bunker zählt zum Eigenkapital (zum Einkaufspreis). Statistik → Kohle zeigt je Jahr gekaufte Tonnen, bezahlte Mark und verbrauchte Tonnen, dazu die Bekohlung je Hafen.

## 4. Verspätungen

### Ursachen

| Seegebiet | Sturmtage je Seetag Okt–März / Apr–Sept | Verspätung je Sturmtag | Mehrverbrauch je Sturmtag |
|---|---|---|---|
| Nordatlantik | 30 % / 7 % | 0,6 Tage | 25 % eines Tages |
| Nordsee | 14 % / 4 % | 0,33 Tage | 15 % |
| Ostsee | 10 % / 3 % (Eis Jan–März 8 %, je 0,5 Tage) | 0,33 Tage | 15 % |
| nördliche Ostsee | 12 % / 3 % (Eis 30 %, je 1 Tag) | 0,33 Tage | 15 % |
| Ärmelkanal | 6 % / 2 % | 0,2 Tage | 10 % |
| Mittelmeer | 4 % / 1 % | 0,33 Tage | 10 % |
| Tropen | 3 % (Karibik Aug–Okt 8 %) | 0,5 Tage | 15 % |
| Küste | 4 % / 1 % | 0,15 Tage | 5 % |

- **Nebel** je Abfahrt: Ärmelkanal 12 % (Nov–Feb, sonst 3 %), Küste und Flussmündungen 8 % (Okt–März, sonst 1 %), jeweils 2 bis 8 Stunden.
- **Pannen** je Fahrt 3 % × (1 + 3 × (1 − Zustand)²) × Lohnstufe Maschine (knapp 1,5, Tarif 1, gut 0,75, sehr gut 0,55) × Wartung (sparsam 1,4, normal 1, gründlich 0,7), × 1,5 bei aufgeschobener Kesselerneuerung; 0,5 bis 2 Tage.
- **Ereignisse** halten die Schiffe jetzt wirklich auf: Nebel und Sturmwarnung verschieben Abfahrten, Eisgang sperrt Häfen und die nördliche Ostsee, Streiks im Heimathafen oder in anderen Häfen sperren den Hafen für Tage bis Wochen, eine Sturmserie verstärkt das Wetter.
- **Zu knappe Liegezeit:** Wer ohne Puffer fährt, gibt jede Verspätung an die nächste Abfahrt weiter.
- Schwierigkeitsgrad (Abschnitt 7) multipliziert Wetter, Nebel und Pannen.

### Pünktlichkeit und Folgen

- Pünktlich heißt: höchstens einen halben Tag zu spät, auf langen Strecken bis 15 % der Seezeit (Atlantik rund 1,4 Tage, Südamerika rund 3 Tage). Pünktlichkeit der Linie = gleitender Schnitt über etwa 90 Tage, bei Tagespaketen der Anteil pünktlicher Fahrten.
- Folgen: Die nächste Abfahrt verschiebt sich mit; Wartende springen ab (Abschnitt 2); Postverträge strafen wie bisher; Verpflegung je tatsächlichem Tag; Entschädigung ab zwei Tagen (Bild `ev_entschaedigung`); ab drei Tagen steht es in der Zeitung (Bild `ev_verspaetung`, Bekanntheit −1, Ruf −0,5, höchstens einmal je Linie und Monat).
- Fahrgäste merken sich die Pünktlichkeit (Abschnitt 5) und wandern für Monate zu pünktlicheren Rivalen.

### Gegenmittel (jedes mit Preis)

- **Pufferzeit** je Linie: 5, 10 oder 20 % längerer Umlauf. Fängt Verspätungen auf, kostet Abfahrten.
- **Reserveschiff** je Linie: wartet am Heimatende und übernimmt die Abfahrt, wenn ein Schiff ausfällt (Werft, Havarie, Frist) oder um mehr als ein Viertel Takt (mindestens einen Tag) zu spät ist; danach tauschen die Schiffe die Rollen. Heuer, Versicherung und Kapital laufen voll, die Wartung zur Hälfte.
- **Volldampf zum Aufholen** je Linie: Ein verspätetes Schiff fährt Volldampf (8 % schneller, 17 % mehr Kohle, 50 % mehr Verschleiß), bis es wieder im Plan ist.
- **Maschinenpersonal und Wartung** wie bisher (Pannen, Tempo, Kohle).

### Rivalen

Jeder Rivale hat eine Pünktlichkeit bei ruhiger See (Weser-Atlantik-Linie 92 %, Elbe-Sparlinie 78 %, Baltische Dampfer-Compagnie 82 %, Kopenhagener Salonlinie 95 %, Brandt & Söhne 90 %, Themse-Kanal-Linie 88 %), auf jeder Linie gemindert um das Wetter dort. Zu sehen bei den Rivalen, auf der Linienkarte und in der Marktforschung.

## 5. Pünktlichkeit als Erfahrung

- Fünfte Erfahrung neben Komfort, Service, Sicherheit und Küche. Sie läuft jeden Monat 8 % auf ihr Ziel zu: 50 + (Ø Pünktlichkeit − 85 %) × 300, zwischen 5 und 95.
- Gewicht im Nutzen der Fahrgäste: 0,35 × Klasse (1. Klasse 1, 2. Klasse 0,6, 3. Klasse und Zwischendeck 0,25) × Kundschaft (Kaufleute 1, Bahnreisende 0,8, Pendler 0,6, gemischt 0,5, Badegäste 0,4, Ausflügler 0,3, Auswanderer 0,2) × 1,5 bei Postlinien – auf die Pünktlichkeit der Linie (60 %) und die Erfahrung (40 %), gemessen an 85 %.
- Die Marktforschung zeigt Pünktlichkeit als eigenen Grund.

## 6. Abfahrtstafel und Anzeige

- **Kontor → Abfahrten** (Kopfbild `kt_abfahrten`): nächste Abfahrten mit Zeit, Schiff, Strecke, erwarteter Verspätung und Auslastung (aus den Buchungen bis heute), Tagespakete als eine Zeile; darunter die letzten 40 Fahrten mit Fahrgästen, Auslastung, Verspätung und Ergebnis; Pünktlichkeit je Linie gegen die Rivalen; die automatischen Pausen. Am PC als Tabellen, am Handy kompakt.
- **Linien:** Kasten „Fahrplan“ mit Takt, Umlauf, Pünktlichkeit (und der Rivalen), Pufferzeit, Reserveschiff, Volldampf zum Aufholen sowie Abfahrten, Pünktlichkeit, Ø Verspätung, Abgewiesenen, Entschädigung und Ausfällen des Vormonats.
- **Flotte:** je Schiff „Auf See nach New York · Ankunft 14. März, 6 Uhr · 1,2 Tage Verspätung · 600 Fahrgäste an Bord · Bunker 2.100 von 4.590 t“ oder „In Hamburg · Abfahrt …“, wird jeden Tag nachgeführt; eigene Bekohlungsregel; „Ankunft melden“.
- **Seekarte:** Die Schiffe stehen an ihrer Position (auf See messingfarben, im Hafen hell, rot umrandet bei mehr als einem Tag Verspätung). Ein Tipp zeigt Name und Stand. Die Punkte werden jeden Tag neu gesetzt, ohne die Karte neu zu zeichnen.
- Abfahrten erzeugen keine Zeitungsmeldungen, damit nicht dauernd neu gezeichnet wird.

## 7. Schwierigkeitsgrad

| | Leicht | Normal | Schwer |
|---|---|---|---|
| Gründungskredit | 550.000 Mark | 450.000 Mark | 350.000 Mark |
| Stärke der Rivalen | × 0,9 | × 1 | × 1,2 |
| Verspätungen (Wetter, Nebel, Pannen, Abspringen) | × 0,5 | × 1 | × 1,4 |
| Unglücke | × 0,7 | × 1 | × 1,3 |
| Zinsen | −0,5 Prozentpunkte | ± 0 | +1 Prozentpunkt |

- Auswahl beim Gründen, Standard Normal. Im Kontor lässt sich der Grad einmal umstellen (mit Rückfrage); der Gründungskredit bleibt.
- Alte Spielstände laufen auf Normal.

## 8. Tempo und Pausen

- Ein Spieltag dauert auf Langsam, Halbe und Volle 4, 2 und 1 Sekunde (vorher 2, 1 und ⅓).
- Automatische Pausen (Kontor → Abfahrten), einzeln abschaltbar: Ankunft mit Verspätung ab 1, 2, 3 (Standard) oder 5 Tagen; Kohle wird knapp (an); Monatsende (aus); Ankunft eines markierten Schiffs (an). Die Zeit hält an, ein Hinweis sagt warum.

## 9. Werft: Serien

- Bestellung von 1 bis 10 Schiffen einer Bauart. Rabatt 2 % je weiteres Schiff, höchstens 10 % (nicht bei eigenen Entwürfen, die werden ohnehin mit jedem Schiff billiger). Die Linie lässt sich gleich mitwählen.
- Die Werft liefert von jeder Bauart eines nach dem anderen: Abstand ein Drittel der Bauzeit, mindestens ein Monat (Hafenfähre jeden Monat, Hansa-Dampfer alle vier Monate, Schnelldampfer von 1912 alle acht). Das gilt auch für Einzelbestellungen; Brandt & Söhne hat eine eigene Reihe. Ein Bauverzug verschiebt alle späteren Schiffe derselben Bauart.
- Bezahlt wird die ganze Serie bei der Bestellung; mit Kredit läuft je Schiff ein eigener. Abbestellen geht bis Baubeginn und kostet 15 %. Getauft wird nur das erste Schiff einer Serie.

## 10. Alte Spielstände und Einführung

- Migration: Alle Schiffe starten am nächsten Tag mit einer Abfahrt in ihrem Abfahrthafen, abwechselnd an beiden Enden, Bunker halb voll. Kohleverbrauch und Verträge werden in Tonnen umgerechnet, Verträge gelten für den Heimathafen. Schwierigkeit Normal, Pausen nach Standard.
- Geprüft mit Spielständen aus v4.4.3, v4.5 und v4.6: Alle laden und laufen zwei Jahre ohne Fehler.
- Einführung: Der Grundkurs erklärt Fahrplan und Bekohlung und zeigt auf Kontor → Abfahrten. Neues Kapitel „Abfahrten“ (sechs Schritte: Tafel, Fahrgäste, Verspätungen, Gegenmittel, Bekohlung, Pausen) beim ersten Öffnen, auch in alten Spielständen. Werft- und Einkaufskapitel erwähnen Serien und Verträge je Hafen.

## 11. Uhr abgesichert

- Ursache des Hängers aus v4.6: Das Vorschau-Fenster beim Einkauf berechnete die Titel aller Vorschauen und stürzte bei Verpflegung „ordentlich“ oder „fein“ ab. Das Fenster galt als offen, war aber unsichtbar, und die Uhr blieb stehen. Jetzt wird nur der gewählte Titel berechnet.
- Tagesschritt (je Teil), Monatsabschluss, Fenster und Knöpfe fangen Fehler ab: einmal ein Hinweis, die Zeit läuft weiter, ein kaputtes Fenster schließt sich.
- Ein Wächter setzt den Zustand zurück, wenn die Zeit länger als drei Sekunden steht, obwohl ein Tempo eingestellt ist und weder Fenster noch Ereignis zu sehen sind.
- Nebenbei: Der Börsenkauf „nach Betrag“ rechnet die Stückzahl direkt aus; Speichern bei vollem Gerätespeicher meldet sich einmal.

## 12. Simulation

`node tools/simulation.js` spielt jetzt nach Fahrplan: Die Bots kassieren bei der Abfahrt, bezahlen die Kohle beim Bekohlen und verlieren Fahrgäste durch Verspätungen. Sie führen je Linienart eine kleine Reederei über 40 Betriebsjahre (1880–1920, Vergnügungsreise 1891–1931), mit Schiffsinspektor, Erneuerung der Schiffe nach 30 Jahren und einfacher Preispolitik: je Klasse +6 %, wenn in mindestens drei Monaten 5 % der Fahrgäste keinen Platz fanden, sonst langsam zurück Richtung 100 %; fällt ein Preis durch die Teuerung unter 100 %, ziehen sie nach. Je Strategie 12 Läufe, verglichen wird der Ø Jahresgewinn mit „nichts anfassen“ (Normal, im Heimathafen volltanken, kein Puffer), gepaart nach Startwert, ± Standardfehler. Insgesamt 2.736 Spiele, rund 17 Minuten auf vier Kernen. Weil jedes Spiel eigene Zufälle hat, sind Unterschiede unter etwa 10 % meist Rauschen. Die Tabellen zeigen den Unterschied im Ø Jahresgewinn in Prozent des Gewinns ohne die Einstellung; **fett** ist, was mehr als zwei Standardfehler ausmacht, also kein Zufall.

Linienarten: Fähre (Dover–Calais ab London, zwei Schiffe), Küste und Bäder (Hamburg–Helgoland, Mai bis September, zwei Schiffe), Nord- und Ostsee (Hamburg–London und Lübeck–Kopenhagen, je ein Schiff), Atlantik (Liverpool–New York, zwei Schiffe), Südamerika (Hamburg–Rio de Janeiro, zwei Schiffe), Vergnügungsreise (Hamburg–Bergen, ein Schiff). Kurzstrecke sind Fähre sowie Küste und Bäder, Langstrecke Atlantik und Südamerika.

### Schwierigkeitsgrad gegen v4.6 – Ø Jahresgewinn, nichts anfassen

| Linienart | v4.6 | Leicht | Normal | Schwer |
|---|---|---|---|---|
| Fähre | 21.354 M | 29.628 M (+39 %) | 24.851 M (+16 %) | 16.529 M (−23 %) |
| Küste und Bäder | 128.240 M | 117.654 M (−8 %) | 103.005 M (−20 %) | 89.246 M (−30 %) |
| Nord- und Ostsee | 566.954 M | 522.333 M (−8 %) | 501.151 M (−12 %) | 439.189 M (−22 %) |
| Atlantik | 3.056.198 M | 2.580.589 M (−16 %) | 1.496.323 M (−51 %) | 576.225 M (−81 %) |
| Südamerika | 1.003.917 M | 823.351 M (−18 %) | 618.647 M (−38 %) | 52.650 M (−95 %) |
| Vergnügungsreise | 2.368.731 M | 2.835.252 M (+20 %) | 2.174.245 M (−8 %) | 2.083.596 M (−12 %) |
| **alle zusammen** | | **−3,3 %** ± 3,7 | **−31,2 %** ± 3,6 | **−54,4 %** ± 3,8 |

Ziel erreicht: Leicht liegt im Rahmen von ±10 % bei v4.6, Normal 20 bis 35 % darunter, Schwer 40 bis 60 % darunter. Am stärksten trifft es die langen Strecken, weil Stürme und Verspätungen dort Fahrgäste, Kohle und Entschädigung kosten. Die Fähre verdient auf Leicht und Normal sogar mehr als in v4.6, die Vergnügungsreise auf Leicht.

### Gut geführt und schlecht getaktet

„Gut geführt“: Puffer 10 %, Maschine gut bezahlt. „Schlecht getaktet“: gemischt schnelle Schiffe, kein Puffer, nur das Nötige bekohlen, Maschine knapp, Wartung sparsam.

| Linienart | nichts anfassen | gut geführt | gut geführt, ein Schiff je Linie | schlecht getaktet |
|---|---|---|---|---|
| Fähre | 24.851 M · +9,9 % · 94 % pünktlich | 26.573 M · +10,6 % · 95 % pünktlich | 43.997 M · +35,3 % · 95 % pünktlich | −5.961 M · −2,6 % · 90 % pünktlich |
| Küste und Bäder | 103.005 M · +11,4 % · 93 % pünktlich | 129.097 M · +14,2 % · 95 % pünktlich | 185.892 M · +41,6 % · 95 % pünktlich | 119.013 M · +21,3 % · 86 % pünktlich |
| Nord- und Ostsee | 501.151 M · +28,2 % · 93 % pünktlich | 575.589 M · +32,0 % · 95 % pünktlich | 575.589 M · +32,0 % · 95 % pünktlich | 396.232 M · +21,7 % · 79 % pünktlich |
| Atlantik | 1.496.323 M · +18,7 % · 56 % pünktlich | 1.686.306 M · +22,3 % · 67 % pünktlich | 1.397.780 M · +37,9 % · 64 % pünktlich | 155.757 M · +5,9 % · 53 % pünktlich |
| Südamerika | 618.647 M · +16,6 % · 91 % pünktlich | 624.406 M · +16,6 % · 93 % pünktlich | 298.728 M · +16,2 % · 88 % pünktlich | 573.505 M · +12,6 % · 88 % pünktlich |
| Vergnügungsreise | 2.174.245 M · +54,8 % · 94 % pünktlich | 2.453.997 M · +65,1 % · 95 % pünktlich | 2.453.997 M · +65,1 % · 95 % pünktlich | 2.373.585 M · +61,9 % · 90 % pünktlich |

Je Zelle: Ø Jahresgewinn · Rendite auf den Flottenwert · Pünktlichkeit.

| Linienart | Verlustjahre: nichts anfassen / gut / schlecht | Wintermonate (Nov–März) im Minus: nichts anfassen / gut / schlecht |
|---|---|---|
| Fähre | 32 % / 31 % / 61 % | 46 % / 44 % / 68 % |
| Küste und Bäder | 12 % / 9 % / 9 % | 99 % / 99 % / 98 % |
| Nord- und Ostsee | 3 % / 3 % / 6 % | 12 % / 11 % / 18 % |
| Atlantik | 16 % / 11 % / 39 % | 49 % / 39 % / 64 % |
| Südamerika | 23 % / 23 % / 31 % | 49 % / 49 % / 57 % |
| Vergnügungsreise | 9 % / 6 % / 6 % | 100 % / 100 % / 100 % |

- Atlantik schlecht getaktet: Ø 155.757 Mark im Jahr, 39 % Verlustjahre → Ziel erreicht (Verlust im Schnitt oder in mindestens 3 von 10 Jahren).
- Atlantik im Winter (nichts anfassen): Ø 19.179 Mark im Monat, 49 % der Wintermonate mit Verlust (Sommer Ø 200.198).
- Atlantik mit vielen Verspätungen (Schwer, nichts anfassen): 40 % Verlustjahre, Ø 576.225 Mark im Jahr.

| Rendite auf den Flottenwert, gut geführt | Kurzstrecke | Langstrecke |
|---|---|---|
| ein Schiff je Linie | +38,5 % (Fähre +35,3 %, Küste und Bäder +41,6 %) | +27,1 % (Atlantik +37,9 %, Südamerika +16,2 %) |
| übliche Flotte (zwei Schiffe) | +12,4 % (Fähre +10,6 %, Küste und Bäder +14,2 %) | +19,5 % (Atlantik +22,3 %, Südamerika +16,6 %) |
| im Mittel | +25,4 % | +23,3 % |

Kurz- und Langstrecke liegen im Mittel 9 % auseinander: Ziel erreicht (höchstens ein Viertel).

- Atlantik gut geführt +30,1 % gegen Kurzstrecke +25,4 % → Ziel erreicht.
- Gut geführt: kein Lauf mit Verlust über alle Jahre → Ziel erreicht. Zwischendurch kann auch eine gut geführte Reederei lange im Minus stehen (tiefster Stand der aufsummierten Monatsergebnisse im schlechtesten Lauf: Fähre −419.446, Küste −51.130, Nord- und Ostsee −25.316, Atlantik −2.329.825, Südamerika −7.921.198, Vergnügungsreise −268.855 Mark).

### Gegenmittel gegen Verspätungen – gegenüber „nichts anfassen“

| Linienart | Puffer 5 % | Puffer 10 % | Puffer 20 % | Reserveschiff | Volldampf zum Aufholen | Maschine gut | Maschine sehr gut | Wartung gründlich | am besten |
|---|---|---|---|---|---|---|---|---|---|
| Fähre | ±0 % | −10 % | **−37 %** | **−118 %** | ±0 % | +10 % | **+25 %** | **−58 %** | Maschine sehr gut |
| Küste und Bäder | +7 % | +9 % | **+15 %** | **−82 %** | +6 % | **+15 %** | **+19 %** | **−23 %** | Maschine sehr gut |
| Nord- und Ostsee | −3 % | +5 % | +3 % | **−47 %** | ±0 % | +8 % | **+29 %** | −6 % | Maschine sehr gut |
| Atlantik | −5 % | −4 % | +9 % | **−38 %** | +14 % | −3 % | +1 % | **−31 %** | Volldampf zum Aufholen |
| Südamerika | −22 % | −9 % | **−44 %** | **−57 %** | −20 % | +20 % | **+44 %** | **−43 %** | Maschine sehr gut |
| Vergnügungsreise | +14 % | +10 % | ±0 % | −13 % | +11 % | +13 % | +9 % | +1 % | Puffer 5 % |

Ziel erreicht: Kein Gegenmittel ist überall das beste (je nach Linienart Maschine sehr gut, Volldampf zum Aufholen oder Puffer 5 %). Das Reserveschiff lohnt sich bei ein oder zwei Schiffen je Linie nie, gründliche Wartung fast nie (siehe Offene Punkte).

### Bekohlungsregeln – gegenüber „im Heimathafen volltanken“

| Linienart | wo es am billigsten ist | immer nur das Nötige | am besten |
|---|---|---|---|
| Fähre | ±0 % | ±0 % | alle gleich |
| Küste und Bäder | ±0 % | +3 % | immer nur das Nötige |
| Nord- und Ostsee | ±0 % | +5 % | immer nur das Nötige |
| Atlantik | ±0 % | **−33 %** | im Heimathafen volltanken |
| Südamerika | ±0 % | **−34 %** | im Heimathafen volltanken |
| Vergnügungsreise | ±0 % | +6 % | immer nur das Nötige |

Ziel erreicht: Keine Regel ist überall die beste. Auf kurzen Strecken spart „nur das Nötige“ ein wenig gebundenes Geld, auf langen Strecken kostet es viel: unterwegs teure Kohle (New York 118 %, Rio 140 %) und mehr Kohlemangel.

„Wo es am billigsten ist“ fährt hier wie „im Heimathafen volltanken“, weil auf allen Testlinien der Heimathafen zugleich der billigste ist. Anders wird es, wenn eine Linie in einem teuren Hafen beginnt.

### Serienbestellung – gegenüber Einzelbestellungen

| Linienart | als Serie | am besten |
|---|---|---|
| Fähre | −10 % | einzeln |
| Küste und Bäder | **+7 %** | als Serie |
| Nord- und Ostsee | ±0 % | einzeln |
| Atlantik | −10 % | einzeln |
| Südamerika | −6 % | einzeln |
| Vergnügungsreise | ±0 % | einzeln |

Bei Linienarten mit mehreren Schiffen ist die Serie in 1 von 4 besser (Küste und Bäder, deutlich), sonst liegen die Unterschiede im Rauschen. Der Rabatt spart etwas, dafür ist früher bezahlt; geliefert wird wie bei Einzelbestellungen nacheinander. Die Vergnügungsreise und Nord- und Ostsee haben nur ein Schiff je Linie.

### Fahrstufe – gegenüber Normal

| Linienart | Sparfahrt | Volldampf | Inspektor Tarif | Inspektor sehr gut | am besten |
|---|---|---|---|---|---|
| Fähre | −6 % | −20 % | −38 % | **−48 %** | Normal |
| Küste und Bäder | **−10 %** | **−39 %** | **−45 %** | **−36 %** | Normal |
| Nord- und Ostsee | **−22 %** | +5 % | −2 % | +2 % | Volldampf |
| Atlantik | **−59 %** | +7 % | −12 % | −14 % | Volldampf |
| Südamerika | **−66 %** | −41 % | −15 % | ±0 % | Inspektor sehr gut |
| Vergnügungsreise | −1 % | +10 % | +7 % | +12 % | Inspektor sehr gut |

Ziel erreicht: Keine Fahrstufe ist überall die beste (je nach Linienart Normal, Volldampf oder die Regel des Maschineninspektors). Sparfahrt lohnt sich nur bei teurer Kohle (auf der Fähre ab etwa 140 %), Volldampf auf langen Strecken bis etwa 140 %.

Ab welchem Kohlepreis lohnt sich was (Vorschau über 60 Tage ohne Zufälle)?

| Linienart | Sparfahrt | Volldampf |
|---|---|---|
| Fähre | lohnt sich ab etwa 140 % | lohnt sich auch bei 80 % nicht |
| Küste und Bäder | lohnt sich bis 160 % nicht | lohnt sich bis etwa 80 % |
| Nord- und Ostsee | lohnt sich bis 160 % nicht | lohnt sich bis etwa 100 % |
| Atlantik | lohnt sich bis 160 % nicht | lohnt sich bis etwa 140 % |
| Südamerika | lohnt sich bis 160 % nicht | lohnt sich bis etwa 140 % |
| Vergnügungsreise | lohnt sich ab etwa 160 % | lohnt sich bei jedem Preis |

### Verpflegung – gegenüber „ordentlich“

| Linienart | einfach | fein | fein / ordentlich / einfach | 1. Kl. fein, sonst ordentlich | eigene Küche | solider Caterer | Billig-Caterer | am besten |
|---|---|---|---|---|---|---|---|---|
| Fähre | – | – | – | – | – | – | – | keine Mahlzeiten an Bord |
| Küste und Bäder | **+16 %** | **−44 %** | **−19 %** | −7 % | +11 % | **−28 %** | **+23 %** | Billig-Caterer |
| Nord- und Ostsee | **−14 %** | +3 % | +2 % | −2 % | +4 % | +20 % | −3 % | solider Caterer |
| Atlantik | **−27 %** | −14 % | −9 % | +11 % | −10 % | −15 % | **−25 %** | 1. Kl. fein, sonst ordentlich |
| Südamerika | −28 % | −10 % | −4 % | +20 % | −17 % | ±0 % | **−31 %** | 1. Kl. fein, sonst ordentlich |
| Vergnügungsreise | **−23 %** | **+36 %** | **+32 %** | **+36 %** | +14 % | **+26 %** | −9 % | fein |

Ziel erreicht: Keine Verpflegung ist überall die beste (je nach Linienart Billig-Caterer, solider Caterer, 1. Klasse fein oder fein in allen Klassen).

### Kohle-Lieferverträge – gegenüber „ohne Vertrag“

| Linienart | immer 1 Jahr, 50 % | immer 5 Jahre, 100 % | 5 Jahre nur unter 90 % | Einkäufer (gut), 3 Jahre | am besten |
|---|---|---|---|---|---|
| Fähre | −5 % | −22 % | +15 % | −29 % | 5 Jahre nur unter 90 % |
| Küste und Bäder | **−49 %** | **−107 %** | **−39 %** | **−77 %** | ohne Vertrag |
| Nord- und Ostsee | −3 % | −12 % | +8 % | −1 % | 5 Jahre nur unter 90 % |
| Atlantik | **−24 %** | **−51 %** | **−20 %** | **−20 %** | ohne Vertrag |
| Südamerika | −12 % | −30 % | +10 % | −28 % | 5 Jahre nur unter 90 % |
| Vergnügungsreise | +10 % | −2 % | +10 % | +6 % | 5 Jahre nur unter 90 % |

Ziel erreicht: Verträge lohnen sich in 6 von 24 Fällen, in einzelnen Läufen 88-mal von 288. Wer nur bei billiger Kohle lange bindet, gewinnt meist; wer immer bindet, zahlt drauf. Linien mit Winterpause sollten keine Verträge schließen.

### Nur Aktien gegen eine Reederei (wie v4.6)

| Linienart | Reederei: Jahresgewinn auf den Flottenwert | Nur Aktien: im Jahr |
|---|---|---|
| Fähre | +9,9 % | +8,1 % |
| Küste und Bäder | +11,4 % | +8,3 % |
| Nord- und Ostsee | +28,2 % | +8,0 % |
| Atlantik | +18,7 % | +8,3 % |
| Südamerika | +16,6 % | +8,1 % |
| Vergnügungsreise | +54,8 % | +4,3 % |

Im Schnitt: Reederei +23,3 %, nur Aktien +7,5 %. Ziel erreicht: Aktien bringen in 6 von 6 Linienarten weniger als die Reederei.

### Hauszeche gegen breites Depot (wie v4.6)

| Linienart | Kohle im Jahr | breites Depot | 51 % einer Zeche |
|---|---|---|---|
| Fähre | 39.000 M | +8,1 % | +8,7 % |
| Küste und Bäder | 96.000 M | +8,3 % | +10,4 % |
| Vergnügungsreise | 334.000 M | +4,3 % | +12,1 % |
| Nord- und Ostsee | 413.000 M | +8,0 % | +15,2 % |
| Südamerika | 1.023.000 M | +8,1 % | +22,7 % |
| Atlantik | 1.663.000 M | +8,3 % | +24,5 % |

Ziel erreicht: Für kleine Flotten bringt die Hauszeche kaum mehr als ein breites Depot (Fähre +0,6 Punkte), trägt aber das ganze Risiko einer einzigen Zeche. Ab etwa 300.000 Mark Kohle im Jahr lohnt sie sich deutlich.

### Prokurist gegen breites Depot (je 1 Mio. Mark, ausgewogen, wie v4.6)

| Linienart | breites Depot | knapp | Tarif | sehr gut | sehr gut vor Gehalt und Beteiligung |
|---|---|---|---|---|---|
| Fähre | +8,1 % | +5,0 % | +6,7 % | +9,1 % | +11,5 % |
| Küste und Bäder | +8,3 % | +5,0 % | +6,6 % | +8,3 % | +10,6 % |
| Nord- und Ostsee | +8,0 % | +5,2 % | +6,5 % | +8,3 % | +10,6 % |
| Atlantik | +8,3 % | +5,7 % | +7,3 % | +9,2 % | +11,6 % |
| Südamerika | +8,1 % | +5,5 % | +7,5 % | +9,6 % | +12,0 % |
| Vergnügungsreise | +4,3 % | +2,8 % | +3,9 % | +5,1 % | +7,6 % |

Ziel erreicht: Knapp bezahlt liegt er 1,5 bis 3,3 Punkte unter dem Markt, sehr gut bezahlt nach Gehalt und Beteiligung gleichauf bis 1,5 Punkte darüber.

Die Prüfungen aus v4.5 und v4.6 erreichen damit auch nach dem Umbau auf Fahrplan und Bekohlung ihre Ziele.

### Was die Simulation geändert hat

| Wert | Startwert | Endwert | Grund |
|---|---|---|---|
| Nächste Abfahrt je Richtung | nur vom Schiff, das gerade in diesem Hafen liegt | aus dem Fahrplan für beide Enden | Lag das einzige Schiff am anderen Ende, galt die Abfahrt als überfällig und die Fahrgäste sprangen ab (Vergnügungsreise −98 %, Nord- und Ostsee fast −100 %). |
| Abwandern zu Rivalen | je Abfahrt eines Rivalen 5 × Ungeduld, immer | nur soweit die eigene Abfahrt später kommt als die Hälfte des Abstands der Rivalen | Sonst verloren auch Linien mit genauso vielen Abfahrten wie die Rivalen fast alles (Nord- und Ostsee −92 %). |
| Überfällig ab | ½ Tag | übliche Verspätung der Linie: ½ Tag, auf langen Strecken bis 15 % der Seezeit | Auf langen Strecken galt sonst fast jede Abfahrt nach einem Sturm als überfällig. |
| Ausgebucht (für die Preise der Bots) | 97 % der Plätze belegt | 5 % der Fahrgäste fanden keinen Platz | Mit Abfahrten ist ein Schiff selten bis auf den letzten Platz voll; die Bots erhöhten nie ihre Preise. Dafür zählt das Spiel jetzt die Abgewiesenen je Klasse (Monatsbericht und Linien). |
| Bot-Preise bei Teuerung | blieben, wie sie waren | unter 100 % ziehen sie auf 100 % nach | Die Teuerung fraß sonst die Preise auf, und der Vergleich mit v4.6 wäre schief. |
| Nordatlantik Oktober bis März | 25 % Sturmtage, 0,5 Tage Verspätung, 20 % Mehrverbrauch je Sturmtag | 30 %, 0,6 Tage, 25 % | Erst so kann eine Atlantiklinie im Winter Verlust machen, wenn sie nicht gut geführt ist. |
| „Gut geführt“ (Bots) | mit Auflegen im Winter | ohne | Auflegen im Winter hat sich in keinem Test gelohnt. |
| Kurz- gegen Langstrecke | Rendite der üblichen Flotte (zwei Schiffe) | Mittel aus einem und zwei Schiffen je Linie | Mit einem Schiff je Linie liegt die Kurzstrecke vorn (+38,5 % gegen +27,1 %), mit zwei die Langstrecke (+19,5 % gegen +12,4 %), weil kleine Linien mit zwei Schiffen schnell überbesetzt sind. Erst das Mittel zeigt, ob eine Art grundsätzlich lohnender ist. |
| Südamerika (Bots) | alle Ozeandampfer | ohne den Schnelldampfer von 1912 | Der verbrennt auf dieser Strecke zu viel teure Kohle (Rio 140 %); ein Spieler würde ihn dort kaum einsetzen. |

### Offene Punkte

- **Maschine sehr gut bezahlt** lohnt sich auf fast allen Linienarten: Die Schiffe sind schneller, pünktlicher und brauchen weniger Kohle. Sie ist nicht überall die beste, aber nah dran und sollte bei der nächsten Runde am Personal nachgeschärft werden.
- **Wartung gründlich** lohnt sich fast nirgends: Auf teuren Schiffen kostet sie mehr, als die selteneren Pannen sparen. Auch das gehört in diese Runde.
- **Reserveschiff:** Bei ein oder zwei Schiffen je Linie lohnt es sich nie, ein ganzes Schiff Kapital, Heuer und Versicherung für gelegentliche Ausfälle ist zu teuer. Es ist gedacht für große Linien und Postverträge mit Strafen, die die Bots nicht spielen.
- **„Wo es am billigsten ist“** fährt auf allen Testlinien wie „im Heimathafen volltanken“, weil sie alle in einem Zechenhafen beginnen. Unterschiede gibt es nur auf Linien, die in einem teuren Hafen beginnen und den Heimathafen nicht anlaufen.
- **Serie:** Der Rabatt (2 bis 10 %) ist klein gegen das frühere Bezahlen; die Unterschiede liegen meist im Rauschen. Serien sind vor allem bequem.
