# Konzept v5.0 „Fahrplan und Pünktlichkeit“

*Stand 24. Oktober 2026 · umgesetzt in v5.0, Kohlemangel nachgebessert in v5.0.1*

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
- Bunker eines Schiffs = Reichweite × Verbrauch × 0,85 ÷ 15 t × 1,25: Kohle für 125 % der Reichweite bei normaler Fahrt (seit v5.0.1, vorher 100 %). So passen auch auf Strecken bis zur Reichweite die Reserve, das Gewicht des vollen Bunkers und knapp bezahltes Maschinenpersonal. Verbrauch je Seemeile wie bisher nach Typ, Fahrstufe (quadratisch), Lohnstufe Maschine, Kessel und Kapitän; volle Bunker machen das Schiff bis zu 6 % durstiger.
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
- **Kohlemangel:** Frisst ein Sturm die Reserve, kommt das Ereignis „Kohle wird knapp“ (Bild `ev_kohle_knapp`): langsam weiterfahren, im nächsten Hafen mit 30 % Aufschlag nachbunkern oder Holz und Mobiliar verfeuern (Komfort leidet). Die Entscheidung gilt für die ganze Fahrt, bis das Schiff wieder im Heimathafen seiner Linie ist; bis dahin wird nicht neu gefragt und nicht neu angehalten (seit v5.0.1). Ein Maschineninspektor entscheidet selbst – er bunkert nach, wenn es mehr als 1,2 Tage spart – und meldet sich einmal je Fahrt.
- **Sparsame Fahrt:** Reicht der Bunker schon bei ruhiger See nicht für die eingestellte Fahrstufe (etwa Volldampf auf einer Strecke an der Reichweite), fährt das Schiff so viel langsamer, dass die Kohle reicht (höchstens etwa 10 %), statt bei jeder Abfahrt Kohlemangel zu melden. Das steht einmal je Schiff und Linie im Logbuch. Bei noch weniger Kohle kommt das Ereignis.
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
- **Volldampf zum Aufholen** je Linie: Ein verspätetes Schiff fährt Volldampf (8 % schneller, 17 % mehr Kohle, 50 % mehr Verschleiß), bis es wieder im Plan ist. Die Schiffe der Linie nehmen dafür Kohle für Volldampf mit und fahren nur Volldampf, wenn sie mit Reserve reicht (seit v5.0.1; vorher löste das Aufholen selbst den nächsten Kohlemangel aus).
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
- Ereignisse, die am letzten Tag eines Monats entstehen, sind am Ersten des neuen Monats fällig (seit v5.0.1). Vorher behielten sie ihren Tag und kamen erst einen Monat später; eine Pause wie „Kohle wird knapp“ hielt dann die Zeit an, ohne dass ein Fenster erschien.
- Nebenbei: Der Börsenkauf „nach Betrag“ rechnet die Stückzahl direkt aus; Speichern bei vollem Gerätespeicher meldet sich einmal.

## 12. Simulation

Alle Zahlen sind mit v5.0.1 gerechnet (größerer Bunker, Volldampf zum Aufholen nur mit genug Kohle, Ereignisse vom Monatsletzten sofort fällig). `node tools/simulation.js` spielt nach Fahrplan: Die Bots kassieren bei der Abfahrt, bezahlen die Kohle beim Bekohlen und verlieren Fahrgäste durch Verspätungen. Sie führen je Linienart eine kleine Reederei über 40 Betriebsjahre (1880–1920, Vergnügungsreise 1891–1931), mit Schiffsinspektor, Erneuerung der Schiffe nach 30 Jahren und einfacher Preispolitik: je Klasse +6 %, wenn in mindestens drei Monaten 5 % der Fahrgäste keinen Platz fanden, sonst langsam zurück Richtung 100 %; fällt ein Preis durch die Teuerung unter 100 %, ziehen sie nach. Je Strategie 12 Läufe, verglichen wird der Ø Jahresgewinn mit „nichts anfassen“ (Normal, im Heimathafen volltanken, kein Puffer), gepaart nach Startwert, ± Standardfehler. Insgesamt 2.736 Spiele, rund 17 Minuten auf vier Kernen. Weil jedes Spiel eigene Zufälle hat, sind Unterschiede unter etwa 10 % meist Rauschen. Die Tabellen zeigen den Unterschied im Ø Jahresgewinn in Prozent des Gewinns ohne die Einstellung; **fett** ist, was mehr als zwei Standardfehler ausmacht, also kein Zufall.

Linienarten: Fähre (Dover–Calais ab London, zwei Schiffe), Küste und Bäder (Hamburg–Helgoland, Mai bis September, zwei Schiffe), Nord- und Ostsee (Hamburg–London und Lübeck–Kopenhagen, je ein Schiff), Atlantik (Liverpool–New York, zwei Schiffe), Südamerika (Hamburg–Rio de Janeiro, zwei Schiffe), Vergnügungsreise (Hamburg–Bergen, ein Schiff). Kurzstrecke sind Fähre sowie Küste und Bäder, Langstrecke Atlantik und Südamerika.

### Schwierigkeitsgrad gegen v4.6 – Ø Jahresgewinn, nichts anfassen

| Linienart | v4.6 | Leicht | Normal | Schwer |
|---|---|---|---|---|
| Fähre | 21.354 M | 29.624 M (+39 %) | 24.760 M (+16 %) | 16.646 M (−22 %) |
| Küste und Bäder | 128.240 M | 116.693 M (−9 %) | 102.900 M (−20 %) | 91.096 M (−29 %) |
| Nord- und Ostsee | 566.954 M | 536.014 M (−6 %) | 492.610 M (−13 %) | 424.235 M (−25 %) |
| Atlantik | 3.056.198 M | 2.575.868 M (−16 %) | 1.291.323 M (−58 %) | 461.103 M (−85 %) |
| Südamerika | 1.003.917 M | 818.867 M (−18 %) | 518.316 M (−48 %) | 24.773 M (−98 %) |
| Vergnügungsreise | 2.368.731 M | 2.507.325 M (+6 %) | 2.300.606 M (−3 %) | 1.896.063 M (−20 %) |
| **alle zusammen** | | **−7,9 %** ± 4,6 | **−33,8 %** ± 3,7 | **−59,2 %** ± 3,7 |

Ziel erreicht: Leicht liegt im Rahmen von ±10 % bei v4.6, Normal 20 bis 35 % darunter, Schwer 40 bis 60 % darunter. Mit 24 statt 12 Läufen: Leicht −6,5 %, Normal −31,8 %, Schwer −58,0 % (je ± 2,6 bis 2,8). Am stärksten trifft es die langen Strecken, weil Stürme und Verspätungen dort Fahrgäste, Kohle und Entschädigung kosten. Die Fähre verdient auf Leicht und Normal sogar mehr als in v4.6, die Vergnügungsreise auf Leicht.

### Gut geführt und schlecht getaktet

„Gut geführt“: Puffer 10 %, Maschine gut bezahlt. „Schlecht getaktet“: gemischt schnelle Schiffe, kein Puffer, nur das Nötige bekohlen, Maschine knapp, Wartung sparsam.

| Linienart | nichts anfassen | gut geführt | gut geführt, ein Schiff je Linie | schlecht getaktet |
|---|---|---|---|---|
| Fähre | 24.760 M · +9,8 % · 94 % pünktlich | 24.388 M · +9,7 % · 95 % pünktlich | 44.764 M · +35,8 % · 95 % pünktlich | −5.532 M · −2,4 % · 90 % pünktlich |
| Küste und Bäder | 102.900 M · +11,3 % · 93 % pünktlich | 129.812 M · +14,3 % · 95 % pünktlich | 185.819 M · +41,6 % · 95 % pünktlich | 111.836 M · +20,3 % · 86 % pünktlich |
| Nord- und Ostsee | 492.610 M · +27,9 % · 93 % pünktlich | 540.687 M · +30,2 % · 95 % pünktlich | 540.687 M · +30,2 % · 95 % pünktlich | 395.689 M · +22,7 % · 79 % pünktlich |
| Atlantik | 1.291.323 M · +17,1 % · 56 % pünktlich | 1.743.017 M · +21,9 % · 67 % pünktlich | 1.321.450 M · +34,4 % · 64 % pünktlich | 221.802 M · +8,4 % · 54 % pünktlich |
| Südamerika | 518.316 M · +14,0 % · 91 % pünktlich | 647.600 M · +17,0 % · 92 % pünktlich | 354.624 M · +19,3 % · 88 % pünktlich | 521.096 M · +10,5 % · 89 % pünktlich |
| Vergnügungsreise | 2.300.606 M · +60,0 % · 94 % pünktlich | 2.393.966 M · +63,1 % · 95 % pünktlich | 2.393.966 M · +63,1 % · 95 % pünktlich | 2.324.203 M · +60,1 % · 90 % pünktlich |

Je Zelle: Ø Jahresgewinn · Rendite auf den Flottenwert · Pünktlichkeit.

| Linienart | Verlustjahre: nichts anfassen / gut / schlecht | Wintermonate (Nov–März) im Minus: nichts anfassen / gut / schlecht |
|---|---|---|
| Fähre | 32 % / 31 % / 60 % | 46 % / 46 % / 68 % |
| Küste und Bäder | 12 % / 9 % / 9 % | 99 % / 98 % / 99 % |
| Nord- und Ostsee | 3 % / 3 % / 8 % | 12 % / 11 % / 18 % |
| Atlantik | 18 % / 12 % / 36 % | 49 % / 41 % / 62 % |
| Südamerika | 27 % / 21 % / 37 % | 51 % / 46 % / 60 % |
| Vergnügungsreise | 7 % / 6 % / 7 % | 100 % / 100 % / 100 % |

- Atlantik schlecht getaktet: Ø 221.802 Mark im Jahr, 36 % Verlustjahre → Ziel erreicht (Verlust im Schnitt oder in mindestens 3 von 10 Jahren).
- Atlantik im Winter (nichts anfassen): Ø 3.396 Mark im Monat, 49 % der Wintermonate mit Verlust (Sommer Ø 182.073).
- Atlantik mit vielen Verspätungen (Schwer, nichts anfassen): 43 % Verlustjahre, Ø 461.103 Mark im Jahr.

| Rendite auf den Flottenwert, gut geführt | Kurzstrecke | Langstrecke |
|---|---|---|
| ein Schiff je Linie | +38,7 % (Fähre +35,8 %, Küste und Bäder +41,6 %) | +26,9 % (Atlantik +34,4 %, Südamerika +19,3 %) |
| übliche Flotte (zwei Schiffe) | +12,0 % (Fähre +9,7 %, Küste und Bäder +14,3 %) | +19,4 % (Atlantik +21,9 %, Südamerika +17,0 %) |
| im Mittel | +25,4 % | +23,2 % |

Kurz- und Langstrecke liegen im Mittel 9 % auseinander: Ziel erreicht (höchstens ein Viertel).

- Atlantik gut geführt +28,1 % gegen Kurzstrecke +25,4 % → Ziel erreicht.
- Gut geführt: Ziel knapp verfehlt – ein Lauf von 12 endet über alle Jahre im Minus, die Fähre mit zwei Schiffen (Startwert 1097, −1.900 Mark im Jahr). Er läuft bis 1900 Mark für Mark wie in v5.0; danach kommt ein Ereignis zu einem anderen Zeitpunkt (Ereignisse vom Monatsletzten sind jetzt sofort fällig), und die Zufälle laufen anders. Schon in v5.0 verdiente dieser Lauf nur 8.000 Mark im Jahr statt rund 28.000 im Schnitt: Zwei Schiffe sind für Dover–Calais zu viel. Mit 36 Läufen liegt „gut geführt“ auf der Fähre bei 28.000 Mark im Jahr (v5.0: 28.800).
- Zwischendurch kann auch eine gut geführte Reederei lange im Minus stehen (tiefster Stand der aufsummierten Monatsergebnisse im schlechtesten Lauf: Fähre −421.992, Küste −51.424, Nord- und Ostsee −25.843, Atlantik −2.628.953, Südamerika −2.262.508, Vergnügungsreise −355.605 Mark).

### Gegenmittel gegen Verspätungen – gegenüber „nichts anfassen“

| Linienart | Puffer 5 % | Puffer 10 % | Puffer 20 % | Reserveschiff | Volldampf zum Aufholen | Maschine gut | Maschine sehr gut | Wartung gründlich | am besten |
|---|---|---|---|---|---|---|---|---|---|
| Fähre | −7 % | −16 % | **−36 %** | **−108 %** | ±0 % | **+11 %** | **+24 %** | **−60 %** | Maschine sehr gut |
| Küste und Bäder | +9 % | +9 % | **+16 %** | **−77 %** | +9 % | **+15 %** | **+19 %** | **−26 %** | Maschine sehr gut |
| Nord- und Ostsee | +6 % | +13 % | +1 % | **−42 %** | +13 % | **+16 %** | **+33 %** | ±0 % | Maschine sehr gut |
| Atlantik | +7 % | +16 % | **+21 %** | **−42 %** | +20 % | **+36 %** | +18 % | −8 % | Maschine gut |
| Südamerika | −5 % | +4 % | −23 % | −6 % | **+31 %** | **+44 %** | **+75 %** | −14 % | Maschine sehr gut |
| Vergnügungsreise | +3 % | +1 % | −12 % | **−20 %** | +9 % | +1 % | +15 % | +9 % | Maschine sehr gut |

Ziel formal erreicht: Am besten ist je nach Linienart „Maschine sehr gut“ oder „Maschine gut“ – also dasselbe Mittel in zwei Lohnstufen. Gutes Maschinenpersonal lohnt sich praktisch überall (siehe Offene Punkte). Das Reserveschiff lohnt sich bei ein oder zwei Schiffen je Linie nie, gründliche Wartung fast nie.

### Bekohlungsregeln – gegenüber „im Heimathafen volltanken“

| Linienart | wo es am billigsten ist | immer nur das Nötige | am besten |
|---|---|---|---|
| Fähre | ±0 % | ±0 % | immer nur das Nötige |
| Küste und Bäder | ±0 % | +11 % | immer nur das Nötige |
| Nord- und Ostsee | ±0 % | −1 % | im Heimathafen volltanken |
| Atlantik | ±0 % | −17 % | im Heimathafen volltanken |
| Südamerika | ±0 % | −13 % | im Heimathafen volltanken |
| Vergnügungsreise | ±0 % | +5 % | immer nur das Nötige |

Ziel erreicht: Keine Regel ist überall die beste. Auf kurzen Strecken spart „nur das Nötige“ gebundenes Geld (Küste und Bäder +11 %), auf langen Strecken kostet es: unterwegs teure Kohle (New York 118 %, Rio 140 %) und häufiger Kohlemangel.

„Wo es am billigsten ist“ fährt hier wie „im Heimathafen volltanken“, weil auf allen Testlinien der Heimathafen zugleich der billigste ist. Anders wird es, wenn eine Linie in einem teuren Hafen beginnt.

### Serienbestellung – gegenüber Einzelbestellungen

| Linienart | als Serie | am besten |
|---|---|---|
| Fähre | −11 % | einzeln |
| Küste und Bäder | **+7 %** | als Serie |
| Nord- und Ostsee | ±0 % | einzeln |
| Atlantik | +1 % | als Serie |
| Südamerika | +27 % | als Serie |
| Vergnügungsreise | ±0 % | einzeln |

Bei Linienarten mit mehreren Schiffen ist die Serie in 3 von 4 besser, deutlich nur bei Küste und Bäder; die übrigen Unterschiede liegen im Rauschen. Der Rabatt spart etwas, dafür ist früher bezahlt; geliefert wird wie bei Einzelbestellungen nacheinander. Die Vergnügungsreise und Nord- und Ostsee haben nur ein Schiff je Linie.

### Fahrstufe – gegenüber Normal

| Linienart | Sparfahrt | Volldampf | Inspektor Tarif | Inspektor sehr gut | am besten |
|---|---|---|---|---|---|
| Fähre | −8 % | −15 % | −38 % | **−48 %** | Normal |
| Küste und Bäder | **−10 %** | **−39 %** | **−43 %** | **−32 %** | Normal |
| Nord- und Ostsee | **−23 %** | −1 % | **+16 %** | +3 % | Inspektor Tarif |
| Atlantik | **−50 %** | +13 % | +4 % | +21 % | Inspektor sehr gut |
| Südamerika | **−75 %** | +24 % | +14 % | +25 % | Inspektor sehr gut |
| Vergnügungsreise | −1 % | +7 % | ±0 % | +12 % | Inspektor sehr gut |

Ziel erreicht: Keine Fahrstufe ist überall die beste (je nach Linienart Normal oder die Regel des Maschineninspektors). Sparfahrt lohnt sich nur bei teurer Kohle (auf der Fähre ab etwa 140 %). Volldampf lohnt sich auf langen Strecken jetzt bei jedem Kohlepreis: Mit dem größeren Bunker reicht die Kohle dafür, in v5.0 lief der Bunker auf der Südamerika-Linie bei Volldampf fast immer leer (damals −41 %, jetzt +24 %).

Ab welchem Kohlepreis lohnt sich was (Vorschau über 60 Tage ohne Zufälle)?

| Linienart | Sparfahrt | Volldampf |
|---|---|---|
| Fähre | lohnt sich ab etwa 140 % | lohnt sich auch bei 80 % nicht |
| Küste und Bäder | lohnt sich bis 160 % nicht | lohnt sich bis etwa 80 % |
| Nord- und Ostsee | lohnt sich bis 160 % nicht | lohnt sich bis etwa 100 % |
| Atlantik | lohnt sich bis 160 % nicht | lohnt sich bei jedem Preis |
| Südamerika | lohnt sich bis 160 % nicht | lohnt sich bei jedem Preis |
| Vergnügungsreise | lohnt sich bis 160 % nicht | lohnt sich bis etwa 120 % |

### Verpflegung – gegenüber „ordentlich“

| Linienart | einfach | fein | fein / ordentlich / einfach | 1. Kl. fein, sonst ordentlich | eigene Küche | solider Caterer | Billig-Caterer | am besten |
|---|---|---|---|---|---|---|---|---|
| Fähre | – | – | – | – | – | – | – | keine Mahlzeiten an Bord |
| Küste und Bäder | **+17 %** | **−49 %** | **−18 %** | **−13 %** | +10 % | **−25 %** | **+21 %** | Billig-Caterer |
| Nord- und Ostsee | −5 % | −1 % | +11 % | +2 % | **+15 %** | +13 % | **−7 %** | eigene Küche |
| Atlantik | −22 % | −5 % | +2 % | +15 % | ±0 % | −5 % | −12 % | 1. Kl. fein, sonst ordentlich |
| Südamerika | −21 % | **+18 %** | +19 % | +29 % | −2 % | +17 % | −41 % | 1. Kl. fein, sonst ordentlich |
| Vergnügungsreise | **−23 %** | +13 % | **+24 %** | +14 % | −3 % | **+22 %** | **−32 %** | fein / ordentlich / einfach |

Ziel erreicht: Keine Verpflegung ist überall die beste (je nach Linienart Billig-Caterer, eigene Küche, 1. Klasse fein oder fein, ordentlich und einfach nach Klassen).

### Kohle-Lieferverträge – gegenüber „ohne Vertrag“

| Linienart | immer 1 Jahr, 50 % | immer 5 Jahre, 100 % | 5 Jahre nur unter 90 % | Einkäufer (gut), 3 Jahre | am besten |
|---|---|---|---|---|---|
| Fähre | −5 % | −26 % | +8 % | −29 % | 5 Jahre nur unter 90 % |
| Küste und Bäder | **−51 %** | **−105 %** | **−39 %** | **−74 %** | ohne Vertrag |
| Nord- und Ostsee | +3 % | −9 % | **+22 %** | −1 % | 5 Jahre nur unter 90 % |
| Atlantik | +5 % | −4 % | −1 % | +14 % | Einkäufer (gut), 3 Jahre |
| Südamerika | +9 % | −15 % | +19 % | −24 % | 5 Jahre nur unter 90 % |
| Vergnügungsreise | −1 % | −6 % | +8 % | +7 % | 5 Jahre nur unter 90 % |

Ziel erreicht: Verträge lohnen sich in 9 von 24 Fällen, in einzelnen Läufen 120-mal von 288. Wer nur bei billiger Kohle lange bindet, gewinnt meist; wer immer bindet, zahlt drauf. Linien mit Winterpause sollten keine Verträge schließen.

### Nur Aktien gegen eine Reederei (wie v4.6)

| Linienart | Reederei: Jahresgewinn auf den Flottenwert | Nur Aktien: im Jahr |
|---|---|---|
| Fähre | +9,8 % | +8,0 % |
| Küste und Bäder | +11,3 % | +8,2 % |
| Nord- und Ostsee | +27,9 % | +7,9 % |
| Atlantik | +17,1 % | +8,2 % |
| Südamerika | +14,0 % | +7,7 % |
| Vergnügungsreise | +60,0 % | +4,2 % |

Im Schnitt: Reederei +23,4 %, nur Aktien +7,4 %. Ziel erreicht: Aktien bringen in 6 von 6 Linienarten weniger als die Reederei.

### Hauszeche gegen breites Depot (wie v4.6)

| Linienart | Kohle im Jahr | breites Depot | 51 % einer Zeche |
|---|---|---|---|
| Fähre | 39.000 M | +8,0 % | +8,6 % |
| Küste und Bäder | 96.000 M | +8,2 % | +10,3 % |
| Vergnügungsreise | 337.000 M | +4,2 % | +12,6 % |
| Nord- und Ostsee | 420.000 M | +7,9 % | +15,7 % |
| Südamerika | 988.000 M | +7,7 % | +22,7 % |
| Atlantik | 1.614.000 M | +8,2 % | +24,6 % |

Ziel erreicht: Für kleine Flotten bringt die Hauszeche kaum mehr als ein breites Depot (Fähre +0,6 Punkte), trägt aber das ganze Risiko einer einzigen Zeche. Ab etwa 300.000 Mark Kohle im Jahr lohnt sie sich deutlich.

### Prokurist gegen breites Depot (je 1 Mio. Mark, ausgewogen, wie v4.6)

| Linienart | breites Depot | knapp | Tarif | sehr gut | sehr gut vor Gehalt und Beteiligung |
|---|---|---|---|---|---|
| Fähre | +8,0 % | +4,9 % | +6,6 % | +8,9 % | +11,3 % |
| Küste und Bäder | +8,2 % | +5,0 % | +6,5 % | +8,1 % | +10,4 % |
| Nord- und Ostsee | +7,9 % | +4,5 % | +6,0 % | +8,0 % | +10,3 % |
| Atlantik | +8,2 % | +5,3 % | +7,5 % | +10,0 % | +12,4 % |
| Südamerika | +7,7 % | +5,0 % | +9,9 % | +9,2 % | +11,6 % |
| Vergnügungsreise | +4,2 % | +2,8 % | +4,0 % | +5,4 % | +8,0 % |

Ziel erreicht: Knapp bezahlt liegt er 1,4 bis 3,4 Punkte unter dem Markt, sehr gut bezahlt nach Gehalt und Beteiligung etwa gleichauf bis 1,8 Punkte darüber.

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
| Kurz- gegen Langstrecke | Rendite der üblichen Flotte (zwei Schiffe) | Mittel aus einem und zwei Schiffen je Linie | Mit einem Schiff je Linie liegt die Kurzstrecke vorn (+38,7 % gegen +26,9 %), mit zwei die Langstrecke (+19,4 % gegen +12,0 %), weil kleine Linien mit zwei Schiffen schnell überbesetzt sind. Erst das Mittel zeigt, ob eine Art grundsätzlich lohnender ist. |
| Südamerika (Bots) | alle Ozeandampfer | ohne den Schnelldampfer von 1912 | Der verbrennt auf dieser Strecke zu viel teure Kohle (Rio 140 %); ein Spieler würde ihn dort kaum einsetzen. |
| Bunker (v5.0.1) | Kohle für 100 % der Reichweite | 125 % | Auf Strecken nahe der Reichweite fehlte trotz vollem Bunker bei fast jeder Abfahrt Kohle (Küstendampfer Hamburg–Emden: 22 Meldungen in acht Monaten), Volldampf auf langen Strecken ließ den Bunker fast immer leerlaufen. Jetzt am Reichweitenlimit etwa 2 Meldungen je Schiff und Jahr, auf üblichen Linien 0,02 bis 0,08. |
| Volldampf zum Aufholen (v5.0.1) | immer, wenn verspätet | nur, wenn die Kohle mit Reserve reicht; die Schiffe nehmen Kohle für Volldampf mit | Das Aufholen löste selbst Kohlemangel aus, der das Schiff wieder verspätete: am Reichweitenlimit bis 20 Meldungen je Schiff und Jahr, jetzt etwa eine. |
| Kohlemangel-Entscheidung (v5.0.1) | je Abfahrt neu | gilt bis zur Rückkehr in den Heimathafen der Linie | Bei täglichen Abfahrten kam die Frage jeden Tag. |

### Offene Punkte

- **Gutes Maschinenpersonal** lohnt sich auf allen Linienarten: „Maschine sehr gut“ oder „Maschine gut“ ist überall das beste Gegenmittel. Die Schiffe sind schneller, pünktlicher und brauchen weniger Kohle. Das sollte bei der nächsten Runde am Personal nachgeschärft werden.
- **Wartung gründlich** lohnt sich fast nirgends: Auf teuren Schiffen kostet sie mehr, als die selteneren Pannen sparen. Auch das gehört in diese Runde.
- **Reserveschiff:** Bei ein oder zwei Schiffen je Linie lohnt es sich nie, ein ganzes Schiff Kapital, Heuer und Versicherung für gelegentliche Ausfälle ist zu teuer. Es ist gedacht für große Linien und Postverträge mit Strafen, die die Bots nicht spielen.
- **„Wo es am billigsten ist“** fährt auf allen Testlinien wie „im Heimathafen volltanken“, weil sie alle in einem Zechenhafen beginnen. Unterschiede gibt es nur auf Linien, die in einem teuren Hafen beginnen und den Heimathafen nicht anlaufen.
- **Serie:** Der Rabatt (2 bis 10 %) ist klein gegen das frühere Bezahlen; die Unterschiede liegen meist im Rauschen. Serien sind vor allem bequem.
- **„Immer nur das Nötige“** bringt auf üblichen Linien 2 bis 3 Kohlemangel-Meldungen je Schiff und Jahr, weil ein Sturm auf einer kurzen Strecke mehr Kohle kostet als die Reserve von 8 %. Das ist der gewollte Preis der Regel; gefragt wird höchstens einmal je Rundreise.
- **Fähre mit zwei Schiffen:** Ein Lauf von 12 endet mit „gut geführt“ über 40 Jahre knapp im Minus (siehe oben). Zwei Schiffe sind für Dover–Calais zu viel; mit einem Schiff liegt die Rendite bei rund 34 %.
