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

<<STARTLINIEN>>

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

<<SIMULATION>>
