# Konzept v5.1 „Fährreederei und Spieltempo“

*Stand 24. Oktober 2026 · umgesetzt in v5.1*

Bis v5.0 begann jede Reederei mit 450.000 Mark Gründungskredit und ohne Schiff. Mit 15 % Anzahlung beim Werftkredit war ein großer Dampfer im ersten Jahr greifbar, der Atlantik nach wenigen Spieljahren. Eine Fähre verdiente auf Normal rund 25.000 Mark im Jahr, und ein Drittel der Fährjahre endete im Minus. Jetzt beginnt jede neue Reederei mit einer Fähre auf einer Querung nahe dem Heimathafen. Das Fährgeschäft hat eigene Einnahmen, große Schiffe sind teurer und kosten auf hoher See mehr, und Bank und Werft leihen nur so viel, wie die Reederei tragen kann. Dazu kommen ein neues Hauptmenü und drei Spielstände. Dieses Dokument beschreibt, was gebaut wurde, mit den Zahlen nach der Simulation.

## Grundsätze

- Jede Option hat einen spürbaren Nachteil, keine Einstellung ist überall die beste: Zeitkarten binden an die Pünktlichkeit, Verträge an Fahrten auch im Winter, die Konzession an Pacht und Takt.
- Automatik nur über angestelltes Personal. Das Fährgeschäft läuft ohne neue Automatik; Zeitkarten schaltet der Spieler je Linie ein.
- Kurzstrecke und Langstrecke sind gleichwertige Wege, gemessen an der Rendite auf das eingesetzte Kapital.
- Der Weg zum Atlantik dauert auf Normal gut gespielt 15 bis 20 Spieljahre, bei halber Fahrt einige Spielstunden.
- Alle Zahlen sind Startwerte, per Simulation geprüft und angepasst (siehe „Was die Simulation geändert hat“).
- Alte Spielstände bleiben ladbar, der Speicherschlüssel ist unverändert. Der Fährstart gilt nur für neue Spiele.

## 1. Start mit einer Fähre

### Gründung

Die Gründung hat zwei Schritte: zuerst Name, Heimathafen und Schwierigkeit, dann Startlinie und Fährtyp. Zu jeder Linie zeigt die Karte das Bild des empfohlenen Schiffs, die Entfernung, wer dort fährt und was das Fährgeschäft bietet (Zeitkarten, Fuhrwerke, Insel- oder Postvertrag). Die Linie ist nach der Gründung eröffnet (ohne Agenturkosten), das Schiff fährt ab dem ersten Tag.

| | Leicht | Normal | Schwer |
|---|---|---|---|
| Startflotte | 2 neue Fähren | 1 neue Fähre | 1 gebrauchte Fähre, 20 Jahre alt |
| Gründungskredit | 150.000 Mark | 100.000 Mark | 60.000 Mark |
| bisher (v5.0) | kein Schiff, 550.000 Mark | kein Schiff, 450.000 Mark | kein Schiff, 350.000 Mark |

- Auf Leicht fährt die zweite Fähre auf einer zweiten Startlinie (Auswahl im zweiten Schritt, Vorschlag ist die nächste passende Querung). Zwei Fähren auf einer kurzen Querung brachten in der Simulation weniger als eine, weil sie sich die Fahrgäste teilen.
- Die Startschiffe sind bezahlt; ihr Wert zählt zum Eigenkapital. Verkaufen lassen sie sich erst nach drei Jahren.
- Der Gründungskredit läuft wie bisher: Zinsen ab dem ersten Monat, Tilgung nach Wahl. Er zählt nicht gegen den Kreditrahmen.

### Startlinien

| Heimathafen | Linie | Entfernung | Fahrgäste | Fährtypen (empfohlen zuerst) | Fährgeschäft |
|---|---|---|---|---|---|
| Hamburg | Hamburg – Blankenese | 8 sm | Pendler 78 %, Badegäste 22 % | Fluss-Raddampfer, Hafenfähre | Zeitkarten |
| Hamburg | Glückstadt – Wischhafen | 2 sm | Pendler 100 % | Dampffähre für Fuhrwerke | Fuhrwerke |
| Hamburg | Hamburg – Finkenwerder | 4 sm | Pendler 100 % | Fluss-Raddampfer, Hafenfähre | Zeitkarten, Fuhrwerke |
| Hamburg | Dagebüll – Wyk auf Föhr | 6 sm | Badegäste 62 %, Pendler 38 % | Inselpostdampfer, Hafenfähre | Fuhrwerke, Inselvertrag |
| Liverpool | Liverpool – Birkenhead | 1 sm | Pendler 100 % | Dampffähre für Fuhrwerke, Hafenfähre | Zeitkarten, Fuhrwerke |
| Liverpool | Liverpool – Douglas (Isle of Man) | 75 sm | Badegäste 88 %, Reisende 12 % | Inselpostdampfer, Kanal-Raddampfer | Inselvertrag |
| Liverpool | Holyhead – Dublin | 66 sm | Bahnreisende 91 %, Reisende 9 % | Inselpostdampfer, Kanal-Raddampfer | Postvertrag |
| London | London – Gravesend | 22 sm | Reisende 52 %, Badegäste 48 % | Fluss-Raddampfer | – |
| London | Tilbury – Gravesend | 1 sm | Pendler 98 % | Dampffähre für Fuhrwerke | Fuhrwerke |
| London | Dover – Calais | 21 sm | Bahnreisende 87 %, Reisende 13 % | Kanal-Raddampfer, Hafenfähre | Fuhrwerke, Postvertrag |
| London | Portsmouth – Ryde (Isle of Wight) | 6 sm | Pendler 56 %, Badegäste 44 % | Inselpostdampfer, Hafenfähre | Zeitkarten, Fuhrwerke, Inselvertrag |

Alle Häfen gab es schon. Wyk auf Föhr zieht mehr Badegäste an als bisher (Bäderwert 1,4 statt 0,9), damit die Inselfähre im Sommer etwas zu tun hat.

### Was die Startlinien bringen

Normal, eine Fähre des empfohlenen Typs, Zeitkarten eingeschaltet, Verträge angenommen, bei der Konzession mittleres Gebot, sonst nichts angefasst. Ø Jahresgewinn der Reederei (mit Zinsen des Gründungskredits) in den ersten fünf vollen Jahren, je 8 Läufe:

| Linie | Fähre | Ø Gewinn im Jahr | Verlustjahre | Einnahmen im Jahr (Ø) |
|---|---|---|---|---|
| Hamburg – Blankenese | Fluss-Raddampfer | 32.800 | 0 von 40 | Fahrkarten 65.000, Zeitkarten 26.000 |
| Glückstadt – Wischhafen | Dampffähre für Fuhrwerke | 28.900 | 2 von 40 | Fuhrwerke 45.000, Fahrkarten 9.000 |
| Hamburg – Finkenwerder | Fluss-Raddampfer | 15.300 | 6 von 40 | Fahrkarten 39.000, Zeitkarten 23.000 |
| Dagebüll – Wyk auf Föhr | Inselpostdampfer | 19.200 | 5 von 40 | Fahrkarten 40.000, Inselvertrag 18.000 |
| Liverpool – Birkenhead | Dampffähre für Fuhrwerke | 47.400 | 0 von 40 | Fuhrwerke 30.000, Fahrkarten 28.000, Zeitkarten 19.000 |
| Liverpool – Douglas | Inselpostdampfer | 32.400 | 7 von 40 | Fahrkarten 53.000, Inselvertrag 35.000 |
| Holyhead – Dublin | Inselpostdampfer | 27.000 | 3 von 40 | Fahrkarten 95.000 (Postvertrag erst mit 12 Knoten) |
| London – Gravesend | Fluss-Raddampfer | 44.100 | 2 von 40 | Fahrkarten 103.000 |
| Tilbury – Gravesend | Dampffähre für Fuhrwerke | 29.700 | 2 von 40 | Fuhrwerke 43.000, Fahrkarten 10.000 |
| Dover – Calais | Kanal-Raddampfer | 27.800 | 7 von 40 | Fahrkarten 110.000, Postvertrag 20.000 |
| Portsmouth – Ryde | Inselpostdampfer | 57.700 | 0 von 40 | Fahrkarten 63.000, Zeitkarten 15.000, Inselvertrag 17.000 |

Bisher verdiente eine Fähre auf Normal rund 25.000 Mark im Jahr, ein Drittel der Jahre endete im Minus. Jetzt bringt die erste Fähre je nach Linie 15.000 bis 58.000 Mark, 8 % der Jahre enden im Minus, meist im ersten Winter. Beträge bei britischem Heimathafen im Spiel in Pfund.

### Grundkurs

Wer mit einer Fähre startet, bekommt einen eigenen Grundkurs in acht Schritten: die eigene Fähre und ihre Linie, Nachfrage und Preise, das Fährgeschäft (Zeitkarten einschalten, wo es sie gibt), die Zeit starten, das Hauptbuch mit Fahrkarten, Fuhrwerken, Zeitkarten und Postzuschüssen, der Kreditrahmen in der Bank, die Abfahrten und der Ausblick: weitere Fähren, dann die Küste, später Nord- und Ostsee und irgendwann der Atlantik. Alte Spielstände behalten den bisherigen Grundkurs.

## 2. Fährtypen ab 1880

| Typ | Klasse | Preis | Plätze (1./2./3.) | Knoten | Komfort | Heuer/Monat | Kohle/sm | Reichweite | Besonderheit |
|---|---|---|---|---|---|---|---|---|---|
| Hafenfähre (wie bisher) | – | 58.000 | 120 (–/–/120) | 8 | ★ | 300 | 0,5 | 25 sm | billig, pendelt im Takt |
| Dampffähre für Fuhrwerke | Typ Fuhrmann | 85.000 | 80 (–/–/80) | 7 | ★ | 380 | 0,55 | 30 sm | Wagendeck für 10 Fuhrwerke, flach |
| Fluss-Raddampfer | Typ Strom | 110.000 | 400 (–/120/280) | 8,5 | ★★ | 560 | 0,8 | 60 sm | nur auf Flüssen, Sommerausflüge +30 %, flach, Eis im Winter |
| Inselpostdampfer | Typ Hallig | 145.000 | 160 (–/60/100) | 10,5 | ★★ | 560 | 0,75 | 200 sm | Postraum, Fracht 25 %, seefest (Seegang × 0,6), flach |
| Kanal-Raddampfer | Typ Kanal | 180.000 | 240 (60/100/80) | 14 | ★★★ | 1.300 | 2,0 | 120 sm | Postraum, schnell, empfindlich bei Seegang (× 1,5), Verschleiß × 1,2 |
| Küstendampfer (wie bisher) | – | 182.000 | 150 (–/150/–) | 10 | ★★ | 750 | 1,0 | 160 sm | zum Vergleich |

- **Fuhrwerke:** Nur Schiffe mit Wagendeck nehmen Fuhrwerke und Vieh mit (Abschnitt 3).
- **Fluss:** Der Fluss-Raddampfer fährt nur Linien, die ganz auf Flüssen liegen. Von Dezember bis Februar kann Eis ihn aufhalten.
- **Ausflüge:** Von Mai bis September bringt ein Fluss-Raddampfer auf seiner Linie mehr Fahrgäste: +30 % × (Badegäste + halbe Gelegenheitsreisende + 0,3 × Pendler).
- **Postraum:** Mit Postraum an Bord zahlt die Post auf Insel- und Postverträgen 25 % mehr.
- **Seegang:** Seefeste Schiffe verlieren bei Sturm weniger Zeit, empfindliche mehr.
- **Rivalen:** Auf Fährlinien setzen die Rivalen passende Fähren ein, je nach Querung Hafenfähre, Dampffähre für Fuhrwerke, Fluss-Raddampfer, Inselpostdampfer oder Kanal-Raddampfer. Die Linienkarte zeigt, womit sie fahren.
- **Konfigurator:** Zwei neue Extras für eigene Entwürfe. Wagendeck: 4 bis 8 Fuhrwerke (Plätze ÷ 30), 30 % weniger Plätze, Preis +5 %. Postraum: 5 % weniger Plätze, Fracht +10 %, Preis +2 %, zählt als Postraum für die Verträge.

## 3. Fährgeschäft

Jede Fährlinie zeigt unter „Linien“ einen Kasten „Fährgeschäft“ mit dem, was auf dieser Querung möglich ist, und dem Ergebnis des letzten Monats.

### Fuhrwerke und Vieh

- Nachfrage je Querung, Fuhrwerke im Monat: Glückstadt – Wischhafen 600, Tilbury – Gravesend 600, Liverpool – Birkenhead 500, Hamburg – Finkenwerder 250, Portsmouth – Ryde 150, Dagebüll – Wyk 120, Norddeich – Norderney 80, Dover – Calais 80. Sie wächst mit der Konjunktur und um 1,5 % im Jahr.
- Preis je Fuhrwerk (6 + 0,2 × Seemeilen) Mark mal Teuerung, bezahlt je Fahrt.
- Mitgenommen wird je Abfahrt bis zur Zahl der Wagenplätze. Jeder Rivale nimmt je Abfahrt 6 Fuhrwerke mit.
- Angelehnt an die Rechnung für Autofähren: Autofähren ab 1950 haben weiterhin ihre Autoplätze, jetzt auch als Wagenplätze (20 je Autodeck).

### Zeitkarten

- Möglich auf Linien bis 25 Seemeilen ohne Zwischenhalt, mit mindestens 20 % Pendlern und einer Stadt mit mindestens 100.000 Einwohnern an einem Ende.
- Eingeschaltet je Linie unter „Fährgeschäft“. Danach kommen 25 % mehr Pendler auf die Linie.
- Eine Karte kostet im Monat das 30-fache des Fahrpreises (20 % 2. Klasse, 80 % 3. Klasse) und gilt für rund 40 Fahrten. Bis zur Hälfte der Pendlerfahrten wird mit Karten gefahren; die Zahl der Karten wächst jeden Monat um ein Drittel des Abstands dazu.
- Karteninhaber zahlen keine Einzelfahrkarten. Das Geld kommt Tag für Tag als „Zeitkarten“ ins Hauptbuch.
- Fällt die Pünktlichkeit der Linie unter 90 %, kündigen jeden Monat (90 % − Pünktlichkeit) × 2 der Karten, höchstens die Hälfte. Bei vielen Kündigungen meldet das Logbuch es mit Bild.

### Insel- und Postverträge

- Angebot wie der Postvertrag New York: Ein Ereignis mit Bild bietet einen Vertrag für drei Jahre an, „Annehmen“ oder „Ablehnen“. Pro Monat 35 % Chance, wenn eine Linie in Frage kommt, je Linie höchstens einmal im Jahr.
- **Inselvertrag** (Linien nach Helgoland, Föhr, Sylt, Norderney, Borkum, Isle of Man, Isle of Wight; angeboten von Juni bis Oktober): (1.300 + 25 × Seemeilen) Mark im Monat mal Teuerung, dafür mindestens 8 Fahrten jeden Monat, auch im Winter.
- **Postvertrag** (Dover – Calais, Holyhead – Dublin; nur mit Schiffen ab 12 Knoten): (900 + 25 × Seemeilen) Mark im Monat, dafür mindestens 26 Fahrten im Monat mit 12 Knoten oder mehr.
- Verfehlt: Strafe in Höhe von zwei Monatszuschüssen, nach drei verfehlten Monaten ist der Vertrag gekündigt. Mit Postraum an Bord gibt es 25 % mehr.
- Die alten Ereignisse „Inselpost Helgoland“ und „Insel“ ersetzt dieses Angebot.

### Fährkonzession

- Die Stadt versteigert die Konzession für eine Querung bis 15 Seemeilen, auf der Rivalen fahren, frühestens nach drei Jahren Betrieb und ab dem fünften Spieljahr. Ereignis mit Bild.
- Drei Gebote, gemessen am Umsatz der Linie im letzten Jahr (mindestens 6.000 Mark mal Teuerung): 8 %, 15 % oder 25 % als jährliche Pacht. Zuschlag mit 40, 80 oder 97 % Wahrscheinlichkeit (auf Schwer etwas seltener, auf Leicht etwas öfter). Oder nicht mitbieten.
- **Gewonnen:** zehn Jahre keine Rivalen auf der Querung. Die Pacht kommt monatlich, dazu die Pflicht, jeden Monat mindestens 80 % der bisherigen Abfahrten zu fahren (mindestens 4). Wer den Takt verfehlt, zahlt eine Monatspacht Strafe; nach drei Verstößen ist die Konzession entzogen. Nach zehn Jahren wird neu versteigert.
- **Verloren oder nicht geboten:** Der Rivale bekommt die Querung. Nach sechs Monaten muss die Linie geräumt werden, die Schiffe liegen dann auf und warten auf eine neue Linie. Zehn Jahre lang lässt sich die Querung nicht neu eröffnen.

### Was Fähren sonst verdienen

- Auf Fährlinien unter 20 Seemeilen mit vielen Pendlern und Durchreisenden (oder flachen Querungen) zählen die Abfahrten der Rivalen nur zu 55 %, ihre Schiffe fahren dort 8,5 Knoten: Eine kurze Querung lebt von Takt und Pünktlichkeit, nicht von der Größe der Konkurrenz.
- Kurze Linien unter 40 Seemeilen mit einem Abschnitt zahlen Anlegergebühren statt voller Hafengebühren: die Gebühr des billigeren Hafens, anteilig zur Entfernung (mindestens ein Viertel).

## 4. Langsamerer Aufstieg

### Schiffspreise nach Reichweite und Größe

Preis = Grundpreis × Reichweitenfaktor × Größenfaktor, auf 1.000 Mark gerundet.

- Reichweitenfaktor: 1 bis 500 Seemeilen, darüber 1 + 0,5 × log₁₀(Reichweite ÷ 500), also 1,15 bei 1.000, 1,46 bei 4.200, 1,72 bei 12.000 Seemeilen.
- Größenfaktor: 1 bis 600 Plätze, darüber 1 + 0,08 × log₂(Plätze ÷ 600), also 1,08 bei 1.200, 1,15 bei 1.800, 1,28 bei 3.500 Plätzen.

| Typ | Reichweite | Plätze | bisher | jetzt | Faktor |
|---|---|---|---|---|---|
| Küstendampfer | 160 sm | 150 | 182.000 | 182.000 | 1,00 |
| Bäderdampfer | 350 sm | 450 | 416.000 | 416.000 | 1,00 |
| Seedampfer | 700 sm | 260 | 600.000 | 644.000 | 1,07 |
| Ostseedampfer | 1.400 sm | 380 | 900.000 | 1.101.000 | 1,22 |
| Levantedampfer | 4.200 sm | 320 | 950.000 | 1.389.000 | 1,46 |
| Postdampfer | 4.200 sm | 450 | 1.430.000 | 2.091.000 | 1,46 |
| Auswandererdampfer | 9.000 sm | 1.200 | 3.380.000 | 5.942.000 | 1,76 |
| Schnelldampfer | 7.000 sm | 1.300 | 6.760.000 | 11.583.000 | 1,71 |
| Reichspostdampfer | 14.000 sm | 700 | 4.420.000 | 7.754.000 | 1,75 |
| Turbinen-Ozeanriese (1912) | 7.000 sm | 3.500 | 14.000.000 | 26.506.000 | 1,89 |
| Moderner Ozeanliner (1950) | 9.000 sm | 1.700 | 15.000.000 | 27.349.000 | 1,82 |

Fähren, Küsten- und Bäderschiffe bleiben, wie sie sind. Gebrauchte Schiffe, Brandt & Söhne, eigene Entwürfe und Verschrottungswerte folgen dem neuen Preis. Schiffe aus alten Spielständen behalten ihren alten Wert (siehe Abschnitt 6).

### Höhere Fixkosten auf hoher See

- Hochseeschiffe (Typen für den Ozean) zahlen doppelte Heuer und 4,5-fache Versicherung, auch auf kurzen Linien.
- Hochseelinien zahlen fünffache Hafengebühren.
- Damit kostet ein halbleerer Ozeandampfer richtig Geld: Auf dem Atlantik schlecht getaktet endet ein Drittel der Jahre im Minus.

### Fahrpreise auf langen Strecken

Der Richtpreis steigt mit der Entfernung: × 1 bis 350 Seemeilen, darüber bis × 1,7 bei 3.150 Seemeilen und mehr (logarithmisch). Ohne das hätten die höheren Kosten die Langstrecke gegenüber der Kurzstrecke unrentabel gemacht. Alte Spielstände bekommen die neuen Preise auf ihren Linien gleich mit.

### Kreditrahmen

- Bank und Werft leihen zusammen höchstens:
  Rahmen = (25 % des Eigenkapitals + 60 % des Ergebnisses der letzten 12 Monate) × Bonität × Schwierigkeit.
- Bonität: A × 1,2, B × 1, C × 0,85, D × 0,5, E nichts. Schwierigkeit: Leicht und Normal × 1, Schwer × 0,85.
- Solange die Reederei keine 12 Monate alt ist, zählt das Ergebnis nur, wenn es negativ ist.
- Bestehende Kredite zählen gegen den Rahmen, der Gründungskredit nicht. Bestehende Kredite bleiben, wie sie sind.
- Die Bank zeigt Rahmen, genutzten Teil, Rest und die Rechnung dahinter. Ist ein Kredit zu groß, sagt die Werft oder die Bank, warum: wie viel zu viel, was frei ist, Eigenkapital, Ergebnis und Bonität.
- Beispiel Normal, Gründung: Eigenkapital 110.000 Mark (Fähre 110.000, Kasse 100.000, Gründungskredit 100.000), Rahmen 33.000 Mark. Ein Küstendampfer (182.000 Mark) braucht mit Werftkredit 154.700 Mark Kredit, bei Bonität A also rund 520.000 Mark Eigenkapital allein oder, bei 110.000 Mark Eigenkapital, ein Jahresergebnis um 170.000 Mark. Oder mehr Geld in bar.

### Zeitziele

Gut gespielt (Bot „Aufsteiger“, Abschnitt 7) erreicht eine Reederei die erste Küsten- oder Bäderlinie, die erste Nord- oder Ostseelinie und die erste Atlantiklinie nach:

| | Küste | Nord-/Ostsee | Atlantik |
|---|---|---|---|
| Ziel Leicht | 1 – 4 Jahre | 5 – 10 Jahre | 11 – 17 Jahre |
| Ziel Normal | 3 – 5 Jahre | 8 – 12 Jahre | 15 – 20 Jahre |
| Ziel Schwer | 4 – 8 Jahre | 11 – 18 Jahre | 18 – 28 Jahre |

Die erreichten Werte stehen in Abschnitt 7.

### Schwierigkeitsgrad

| | Leicht | Normal | Schwer |
|---|---|---|---|
| Startflotte | 2 neue Fähren | 1 neue Fähre | 1 Fähre, 20 Jahre alt |
| Gründungskredit | 150.000 Mark | 100.000 Mark | 60.000 Mark |
| Kreditrahmen | × 1 | × 1 | × 0,85 |
| Stärke der Rivalen | × 0,9 | × 1 | × 1,2 |
| Verspätungen | × 0,5 | × 1 | × 1,4 |
| Unglücke | × 0,7 | × 1 | × 1,3 |
| Zinsen | −0,5 Prozentpunkte | ± 0 | +1 Prozentpunkt |

## 5. Hauptmenü und drei Spielstände

- Neues Hauptmenü mit Titelbild, am PC im Breitformat (`title_wide`, 1.672 × 941). Es erscheint beim Start, wenn der zuletzt gespielte Platz leer ist, und jederzeit über die Flagge oben links (am PC auch mit Esc). Solange es offen ist, steht die Zeit.
- Punkte: Weiterspielen (der zuletzt gespielte Stand), Neue Reederei, Spielstände, Einstellungen (Sprache, Ton, Musik), Neu in Version 5.1. Am PC mit Pfeiltasten, Esc und 1 bis 3.
- Drei Spielstand-Plätze. Jeder zeigt Reederei, Heimathafen, Schwierigkeit, Datum, Eigenkapital, Schiffe und wann zuletzt gespielt. Je Platz: Spielen, Exportieren, Importieren, Löschen (mit Rückfrage). Eine neue Reederei kommt auf den ersten freien Platz oder auf einen gewählten.
- Platz 1 ist der bisherige Speicherschlüssel `flaggschiff-proto-1880`, Platz 2 und 3 heißen `flaggschiff-proto-1880-2` und `-3`, der zuletzt gewählte Platz steht unter `flaggschiff-proto-1880-platz`. Ein alter Spielstand liegt nach dem Update also auf Platz 1 und startet wie bisher direkt.
- Im Kontor ersetzen „Spielstände“ und „Hauptmenü“ den bisherigen Knopf „Neues Spiel“.

## 6. Alte Spielstände

- Laden wie bisher und spielen ohne Fährstart weiter.
- Schiffe behalten ihren bisherigen Wert: Jedes Schiff bekommt einen Preisfaktor (alter ÷ neuer Typpreis), so springt das Eigenkapital beim Laden nicht. Neue Schiffe kosten den neuen Preis.
- Die Fahrpreise ihrer Linien werden auf die neuen Richtpreise für lange Strecken angehoben.
- Höhere Heuer, Versicherung und Hafengebühren auf hoher See gelten ab dem Laden. Wer Hochseeschiffe auf kurzen Linien fährt, zahlt das ebenfalls.
- Der Kreditrahmen gilt für neue Kredite; laufende Kredite bleiben.
- Geprüft mit Spielständen aus v4.4.3 bis v5.0.1: Alle laden und laufen zwei Jahre ohne Fehler.

## 7. Simulation

Alle Zahlen sind mit v5.1 gerechnet. `node tools/simulation.js` spielt wie bisher sechs Linienarten über 40 Betriebsjahre mit 38 Strategien (je 12 Läufe), dazu neu die Start-Bots: 3 Heimathäfen × 2 Bots × 3 Schwierigkeiten × 12 Läufe über 30 Jahre ab der Gründung. Insgesamt 2.952 Spiele, rund 12 Minuten auf vier Kernen. Die Linien-Bots bekommen ihre Schiffe wie bisher gestellt und sind nicht an den Kreditrahmen gebunden; sie zeigen, was eine Linie verdient. Die Start-Bots beginnen mit Fähre und Gründungskredit wie im Spiel und müssen alles selbst bezahlen. Weil jedes Spiel eigene Zufälle hat, sind Unterschiede unter etwa 10 % meist Rauschen; **fett** ist, was mehr als zwei Standardfehler ausmacht.

### Neue Bots

- **Fährreederei:** startet auf der ersten Startlinie, schaltet Zeitkarten ein, nimmt Verträge an, bietet bei der Konzession hoch. Sie eröffnet weitere Startlinien und setzt zweite Schiffe auf volle Linien, sobald Kasse und Kreditrahmen es tragen: bar, wenn danach eine Reserve bleibt (40.000 Mark mal Teuerung, mindestens sechs Monate Kosten), sonst Bankkredit, wenn alle Raten zusammen höchstens 60 % des Jahresergebnisses kosten. Keine Geldspritze.
- **Aufsteiger:** wie die Fährreederei, will aber so schnell wie möglich nach oben: erst eine Küsten- oder Bäderlinie (Hamburg – Helgoland, Liverpool – Dublin, London – Dover), dann Nord- und Ostsee (Hamburg – London, Liverpool – London, London – Hamburg), dann den Atlantik (New York). Er kauft das jeweils nächste Schiff, sobald es bar, über die Bank oder über die Werft im Rahmen geht. Gemessen wird das Spieljahr der Bestellung.

### Zeitziele (Aufsteiger)

Median über 36 Läufe je Schwierigkeit (in Klammern die mittlere Hälfte der Läufe), Spieljahre ab der Gründung bis zur Bestellung des ersten Schiffs; ein halbes Jahr Spielraum zum Ziel:

| | Küste | Nord-/Ostsee | Atlantik | Ergebnis |
|---|---|---|---|---|
| Leicht | 0,8 (0,6–1,0) · Ziel 1–4 | 6,3 (4,6–6,7) · Ziel 5–10 | 10,8 (9,5–12,3) · Ziel 11–17 | erreicht, alle Läufe schaffen den Atlantik |
| Normal | 3,3 (2,4–3,5) · Ziel 3–5 | 11,3 (9,4–13,2) · Ziel 8–12 | 17,5 (15,4–19,8) · Ziel 15–20 | erreicht, 97 % schaffen den Atlantik in 30 Jahren |
| Schwer | 4,8 (4,3–6,3) · Ziel 4–8 | 17,5 (11,1–19,6) · Ziel 11–18 | 22,7 (19,4–24,9) · Ziel 18–28 | erreicht, 78 % schaffen den Atlantik, 2 von 36 Läufen gehen pleite |

Je Heimathafen auf Normal: Hamburg 3,6 / 11,4 / 17,4, Liverpool 3,3 / 10,4 / 18,1, London 2,2 / 9,6 / 17,9 Jahre. Bei halber Fahrt (2 Sekunden je Tag) sind 17,5 Spieljahre gut 3½ Stunden reine Spielzeit.

### Fährreederei

Ohne Geldspritze, wächst nur mit Fähren, kauft bar oder mit Bankkredit:

| | Ø Gewinn im Jahr, erste 10 Jahre | Ø Gewinn, 30 Jahre | Verlustjahre | Schiffe nach 10 / 20 Jahren |
|---|---|---|---|---|
| Leicht | 244.725 | 262.227 | 0 % | 4 / 5 |
| Normal | 210.163 | 240.098 | 1 % | 4 / 4 |
| Schwer | 146.305 | 188.039 | 4 % | 4 / 4 |

Auf Normal: Hamburg (Start Blankenese) 135.062, Liverpool (Birkenhead) 196.734, London (Gravesend) 298.692 Mark im Jahr in den ersten zehn Jahren. → **Ziel erreicht:** Eine reine Fährreederei verdient verlässlich, Verlustjahre sind selten, und sie wächst aus eigener Kraft auf vier bis fünf Fähren. Mehr tragen die Fährlinien nicht; das große Geld liegt weiter draußen.

### Schwierigkeitsgrad gegen v5.0.1 – Ø Jahresgewinn, nichts anfassen (Linien-Bots)

| Linienart | v5.0.1 (Normal) | Leicht | Normal | Schwer |
|---|---|---|---|---|
| Fähre | 24.760 | 35.814 (+44,6 %) | 30.616 (+23,7 %) | 21.864 (−11,7 %) |
| Küste und Bäder | 102.900 | 116.693 (+13,4 %) | 105.331 (+2,4 %) | 81.566 (−20,7 %) |
| Nord- und Ostsee | 492.610 | 642.069 (+30,3 %) | 553.305 (+12,3 %) | 507.927 (+3,1 %) |
| Atlantik | 1.291.323 | 3.987.853 (+208,8 %) | 1.831.921 (+41,9 %) | 244.895 (−81,0 %) |
| Südamerika | 518.316 | 1.468.870 (+183,4 %) | 925.548 (+78,6 %) | 201.565 (−61,1 %) |
| Vergnügungsreise | 2.300.606 | 2.072.716 (−9,9 %) | 1.801.136 (−21,7 %) | 1.365.245 (−40,7 %) |
| alle zusammen | | +76,0 % | +10,9 % | −48,8 % |

- Normal gegenüber Leicht −37,0 % ± 4,4 % (Ziel −35 % bis −20 %), Schwer gegenüber Leicht −70,9 % ± 5,1 % (Ziel −65 % bis −45 %) → **im Rahmen** (innerhalb der Unsicherheit).
- Die Linien-Bots fahren mit gestellten Schiffen, deshalb fehlen hier die höheren Schiffspreise; die Zinsen auf die teureren Schiffe zahlen nur Start-Bots und Spieler. Die höheren Fahrpreise auf langen Strecken heben den Gewinn einer laufenden Atlantiklinie, die höheren Fixkosten treffen sie umso härter, je mehr Verspätungen und leere Plätze es gibt: auf Leicht (halb so viele Verspätungen) +209 %, auf Schwer −81 %.

### Gut geführt und schlecht getaktet (Normal)

| Linienart | nichts anfassen | gut geführt (Puffer 10 %, Maschine gut) | gut geführt, ein Schiff je Linie | schlecht getaktet |
|---|---|---|---|---|
| Fähre (Dover – Calais) | 30.616 · 22 % Verlustjahre | 30.088 | **49.684** | **1.797** · 52 % Verlustjahre |
| Küste und Bäder | 105.331 · 13 % | **122.734** | **182.460** | **120.212** |
| Nord- und Ostsee | 553.305 · 3 % | **636.551** | **636.551** | 488.610 |
| Atlantik | 1.831.921 · 23 % | **2.598.916** · 18 % | 2.447.255 | **455.894** · 34 % |
| Südamerika | 925.548 · 30 % | 1.064.013 | **625.048** | 1.168.804 |
| Vergnügungsreise | 1.801.136 · 17 % | 1.918.549 | 1.918.549 | 1.999.220 |

- Atlantik schlecht getaktet: Ø 455.894 Mark im Jahr, 34 % Verlustjahre → **Ziel erreicht** (Verlust im Schnitt oder in mindestens 3 von 10 Jahren). Im Winter verliert eine Atlantiklinie ohne Gegenmittel Ø 62.656 Mark im Monat, 59 % der Wintermonate sind im Minus.
- Gut geführt: kein Lauf mit Verlust über alle Jahre → **Ziel erreicht**.
- Rendite auf den Flottenwert, gut geführt: ein Schiff je Linie Kurzstrecke +38,8 %, Langstrecke +26,1 %; übliche Flotte (zwei Schiffe) Kurzstrecke +12,5 %, Langstrecke +17,5 %; im Mittel Kurzstrecke +25,7 %, Langstrecke +21,8 % → 15 % Unterschied, **Ziel erreicht** (höchstens ein Viertel). Atlantik gut geführt +26,0 % gegen Kurzstrecke +25,7 % → **Ziel erreicht**.

### Prüfungen aus v4.5 bis v5.0

Alle gelten weiter (Einzelheiten in der Ausgabe von `node tools/simulation.js`):

| Prüfung | Ergebnis |
|---|---|
| Gegenmittel gegen Verspätungen: keine Einstellung überall die beste | erreicht (am besten: Maschine sehr gut bezahlt, auf Küste und Bäder Pufferzeit groß) |
| Bekohlungsregeln: keine überall die beste | erreicht (Heimathafen volltanken oder nur das Nötige) |
| Serienbestellung | besser in 1 von 4 Linienarten mit mehreren Schiffen, deutlich in keiner: Rabatt ja, sonst wie Einzelbestellung |
| Fahrstufe: keine überall die beste | erreicht (Normal, Maschineninspektor, Volldampf auf Atlantik und Südamerika) |
| Verpflegung: keine überall die beste | erreicht (Billig-Caterer auf Küste und Bäder, fein/ordentlich/einfach auf Nordsee, Atlantik, Vergnügungsreise) |
| Kohle-Lieferverträge | lohnen sich in 11 von 24 Fällen |
| Nur Aktien gegen eine Reederei | Reederei Ø +17,9 %, nur Aktien +5,6 % auf den Flottenwert, Aktien schlechter in 6 von 6 Linienarten |
| Hauszeche gegen breites Depot | Hauszeche besser auf allen sechs Linienarten, am meisten bei viel Kohle (Atlantik +21,5 % gegen +2,2 %) |
| Prokurist gegen breites Depot | nur ein sehr gut bezahlter Prokurist schlägt das Depot, und nur knapp |

### Was die Simulation geändert hat

| Wert | Startwert | jetzt | Grund |
|---|---|---|---|
| Kreditrahmen | 50 % Eigenkapital + 150 % Jahresergebnis, Bonität A–E × 1,5 / 1,25 / 1 / 0,6 / 0, Leicht × 1,25, Schwer × 0,8 | 25 % + 60 %, × 1,2 / 1 / 0,85 / 0,5 / 0, Leicht × 1, Schwer × 0,85 | Der Aufsteiger kam auf Normal nach einem halben Jahr an die Küste und nach gut 11 Jahren auf den Atlantik; jetzt nach 3,3 und 17,5. |
| Mehrpreis auf langen Strecken | bis +40 % | bis +70 % | Mit den teureren Schiffen und höheren Fixkosten lohnte sich die Langstrecke nicht mehr. |
| Heuer auf Hochseeschiffen | × 1,25 | × 2 | Mit höheren Fahrpreisen war der Atlantik auch schlecht getaktet ein sicherer Gewinn. |
| Versicherung auf Hochseeschiffen | wie bisher | × 4,5 | ebenso |
| Hafengebühren auf Hochseelinien | × 1,6 | × 5 | ebenso; danach 34 % Verlustjahre bei schlechtem Takt |
| Hafengebühren kurzer Fährlinien | volle Gebühr beider Häfen | Anlegergebühr: billigerer Hafen, anteilig zur Entfernung | London – Gravesend zahlte 69.000 Mark Gebühren im Jahr, mehr als die Fähre einnahm. |
| Rivalen auf Fährlinien | zählten zu 55 % auf allen Linien unter 120 Seemeilen mit vielen Pendlern und Durchreisenden | nur unter 20 Seemeilen | Die Fähre kam auf 70 % Rendite, weit vor der Langstrecke. |
| Fährkonzession | Querungen bis 30 Seemeilen, Gebote 10 / 20 / 32 %, Zuschlag 35 / 70 / 95 % | bis 15 Seemeilen, 8 / 15 / 25 %, 40 / 80 / 97 % | Verlorene Konzessionen trieben Start-Bots in die Pleite, und Dover – Calais ist keine städtische Querung. Ein hohes Gebot gewinnt jetzt fast sicher, kostet aber spürbar Pacht. |
| Zweite Fähre auf Leicht | auf derselben Linie | auf einer zweiten Startlinie | Zwei Fähren auf einer kurzen Querung brachten weniger als eine. |
| Bäderwert Wyk auf Föhr | 0,9 | 1,4 | Die Inselfähre nach Föhr verdiente nur mit dem Vertrag. |
| Linien-Bots bei der Konzession | vorsichtig bieten | hoch bieten | Sonst verloren sie ihre Testlinie. |

### Offene Punkte

- Die Fährreederei hat eine hohe Rendite auf den Flottenwert (Normal +78 %), weil ihre Fähren billig und bald abgeschrieben sind. Absolut bleibt sie mit gut 200.000 Mark im Jahr klein, denn mehr als vier bis fünf Fähren tragen die Querungen nicht. Für den Vergleich Kurz gegen Lang gilt deshalb weiter die Rechnung der Linien-Bots.
- Auf Leicht verdient eine laufende Atlantiklinie dreimal so viel wie in v5.0.1, auf Schwer ein Fünftel. Der Abstand der Stufen liegt im Ziel, ist auf dem Atlantik aber groß. Falls Schwer sich zäh anfühlt: Verspätungen auf Schwer × 1,3 statt × 1,4.
- Alte Spielstände mit Hochseeschiffen zahlen ab dem Laden mehr Heuer und Versicherung. Spielstände mit einem halbleeren Ozeandampfer können dadurch ins Minus rutschen.
- Holyhead – Dublin bekommt den Postvertrag erst mit 12 Knoten, also mit dem Kanal-Raddampfer. Der empfohlene Inselpostdampfer ist billiger, aber zu langsam dafür; das steht in der Gründung und bei der Linie.

