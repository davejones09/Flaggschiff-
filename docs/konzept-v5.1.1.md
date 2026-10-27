# Konzept v5.1.1 „Feinschliff und Kohlelager“

*Stand 27. Oktober 2026 · umgesetzt in v5.1.1, Korrektur in v5.1.2*

v5.1.1 räumt auf, was beim Spielen von v5.1 aufgefallen ist: Linien über Land, stehende Punkte auf der Karte, Preise, die sich beim Klicken nicht bewegen, Streiks ohne Wirkung auf die Pünktlichkeit, strenge Zeitkarten und ein zweites Schiff, das sich nie lohnte. Dazu kommt das Kohlelager, das die drei Bekohlungsregeln ersetzt. v5.1.2 behebt einen Buchungsfehler im Lager, der erst in der vollen Simulation auffiel. Dieses Dokument beschreibt, was gebaut wurde, mit den Zahlen nach der Simulation.

## Grundsätze

- Keine Einstellung ist überall die beste; das gilt auch für das Kohlelager.
- Entfernungen, Fahrzeiten und Speicherschlüssel bleiben, wie sie sind. Alte Spielstände laden und bekommen ein Lager.
- Alle neuen Texte gibt es auf Deutsch, Englisch und Spanisch, Beträge bei britischem Heimathafen in Pfund.

## 1. Seekarte

- **Linien über Land:** Die Wege laufen weiter über dieselben Wegpunkte (die Entfernungen bleiben gleich). Für die Zeichnung kommen Zwischenpunkte dazu, zum Beispiel IJmuiden vor Amsterdam, die Maas vor Rotterdam, die Schelde vor Antwerpen, der Humber, der Mersey, der Clyde, Belfast Lough, die Kieler Bucht, der Fehmarnbelt und Kap Arkona. Flüsse, Kanäle und Fahrrinnen (Elbe, Weser, Themse, Nord-Ostsee-Kanal ab 1895, Wattfahrwasser, Fjorde) sind als schmales Wasser gezeichnet.
- **Test:** `node tools/seekarte.js` prüft alle Kanten und alle Hafenpaare auf beiden Karten (Übersicht und Deutsche Bucht) vor und nach 1895: 6.824 Wege, keiner über Land. Mit `--bilder ORDNER` zeichnet er die sechs gemeldeten Linien (Hamburg – Amsterdam, London – Amsterdam, Glasgow – Belfast, Liverpool – Dublin, Kiel – Kopenhagen, Lübeck – Kopenhagen).
- **Punkte, die sich bewegen:** Die Karte rückt die Schiffe achtmal je Spieltag weiter, nicht nur einmal am Tag. Fähren im Tagespaket pendeln zwischen 6 und 22 Uhr sichtbar hin und her, mit kurzer Liegezeit an beiden Enden, nachts und an ausgefallenen Tagen liegen sie im Hafen. `tools/tests/karte.js` prüft, dass sich die Punkte auf langen Linien und im Tagespaket bewegen.

## 2. Verspätungen mit Grund

Jede Verspätung trägt ihre Gründe mit Dauer: Nebel, Sturm, Eis, Panne, Streik, Bekohlen, Kohle knapp, Folgeverspätung und Seenotrettung. Die Gründe entstehen dort, wo die Zeit verloren geht (Wetter auf See, Liegen im Hafen, gesperrte Häfen, Ereignisse wie Eisberg, Eisgang, Nebel vor Anker, Überdruck, Streik und Rettung) und werden bei der Ankunft auf die tatsächliche Verspätung umgerechnet.

- Abfahrtstafel und letzte Fahrten: am PC eigene Spalte „Grund“, am Handy der wichtigste Grund in der Zeile.
- Flotte: bei verspäteten Schiffen die Gründe in Klammern, im Tagespaket „Heute: …“.
- Karte: im Tipp des Schiffs.
- Linie: „Im letzten Vierteljahr kostete am meisten: …“ mit einem Rat, was hilft (Pufferzeit, Maschinenpersonal und Wartung, Kohle im Lager, seefeste Schiffe, gut bezahltes Personal). Die Abfahrten zeigen je Linie die zwei wichtigsten Gründe.

## 3. Preise

Jeder Druck auf + oder − ändert den angezeigten Preis. Die Schrittweite ist mindestens eine sichtbare Einheit: in Mark 0,05 unter 1 Mark, 0,50 unter 10 Mark, sonst 1 Mark; in Pfund ein Penny unter £10, sonst £1. Zwischen £1 und £10 zeigt das Spiel Schilling und Pence. An den Grenzen (30 % und 250 % des Üblichen) sind die Knöpfe gesperrt. `tools/tests/preise.js`: 3.085 Schritte geprüft, alle sichtbar.

## 4. Streiks in der Pünktlichkeit

- Lange Linien: Ein Tag, an dem eine fällige Abfahrt wegen Streik oder Sperre nicht ablegen kann, zählt als unpünktliche Fahrt.
- Tagespaket: Ausgefallene Fahrten zählen mit, die Gründe stehen je Tag.
- Alle Streikereignisse geben ihren Grund mit (Hafenstreik, Heizerstreik, Streikbrecher, Kohlestreik). „Streikbrecher anheuern“ hält die Schiffe im Heimathafen ein bis zwei Tage fest.
- Ein Bordstreik bei einem Rivalen senkt dessen Pünktlichkeit in diesem Monat um 15 Punkte.

## 5. Zeitkarten

| | bisher (v5.1) | jetzt |
|---|---|---|
| Maßstab | 90 % pünktlich | Pünktlichkeit der Rivalen auf der Linie (nach Abfahrten gewichtet), ohne Rivalen das in der Jahreszeit Übliche (97 % abzüglich Wetter, 50–97 %) |
| Kündigungen | je Monat nach Abstand, ohne Grenze | erst ab 2 Punkten unter dem Maßstab, höchstens 10 % im Monat |
| Rückkehr | keine | wer wieder pünktlicher als der Maßstab ist, gewinnt Pendler zurück, Meldung „Pendler kommen zurück“ |
| Meldung | Zahl der Kündigungen | nennt den Rivalen oder das Übliche mit seiner Pünktlichkeit |

Die Linienkarte zeigt Vormonat, Maßstab, Kündigungen und Rückkehrer.

## 6. Mehr als ein Schiff je Linie

**Vorher:** Ein zweites Schiff verdoppelte die Plätze, zählte im Nutzen aber nur über die Platzzahl. Die Kosten verdoppelten sich, die Fahrgäste nicht.

**Jetzt:**
- **Wartezeit im Nutzen:** Mit n Schiffen bekommt die Linie im Nutzen der Fahrgäste TAKT_W × Ungeduld × ln n dazu (TAKT_W = 5, Ungeduld wie beim Abwandern: Kaufleute 0,10, Pendler und Bahnreisende 0,08, Badegäste und Allgemein 0,05, Auswanderer 0,03, Ausflügler 0,02). Mit einem Schiff ändert sich nichts.
- **Dichter Takt weckt Nachfrage:** auf Pendler- und Bahnlinien je Verdopplung der Schiffe bis +20 % Pendler und Bahnreisende, mit abnehmendem Ertrag (2 Schiffe +20 %, 4 Schiffe +30 %, Grenze +40 %).
- **Linienkarte:** „Takt im Vormonat: x Abfahrten je Richtung, die Rivalen y“. Rechnet das Spiel vorsichtig (80 % des Mehrumsatzes, Kosten eines weiteren Schiffs wie die bisherigen je Schiff, 10 % Kapitalkosten im Jahr), meldet es „Ein zweites Schiff würde sich hier lohnen“ mit dem Betrag.

**Prüfung** (`tools/tests/zweites.js`, je Linie ein und zwei Schiffe gleichen Typs ab 1880, fünf Jahre ab Ablieferung, vier Läufe, Linienergebnis abzüglich 10 % Kapitalkosten):

| Linie | Typ | ein Schiff | zwei Schiffe | Ziel |
|---|---|---|---|---|
| London – Gravesend | Fluss-Raddampfer | 29.014 | 61.560 (+112 %) | stark: mindestens +20 % → erreicht |
| Liverpool – Birkenhead | Dampffähre für Fuhrwerke | 36.142 | 55.027 (+52 %) | stark → erreicht |
| Hamburg – London | Nordseedampfer | 2.294 | 63.753 | stark → erreicht |
| Hamburg – Helgoland | Seebäderschiff | −34.198 | −162.272 | schwach: weniger als eins → erreicht |
| Dagebüll – Wyk | Inselpostdampfer | −3.220 | −34.126 | schwach → erreicht |
| Tilbury – Gravesend | Dampffähre für Fuhrwerke | 24.654 | 7.124 | schwach → erreicht |

Hamburg – Helgoland stand im Plan bei den starken Linien. 1880 fährt dort aber schon ein Seebäderschiff fast täglich, die Badegäste warten gern, und eine Auslastung von 14 % lässt keinen Platz für ein zweites; deshalb zählt es hier als schwache Linie.

## 7. Kohle knapp auf Hamburg – Amsterdam

Ursache: Die Schiffe nahmen 15 % Reserve und meldeten schon Fehlmengen von 0,3 Tonnen. Jetzt richtet sich die Reserve nach dem rauesten Seegebiet der Strecke (10 % plus Mehrverbrauch bei Sturm, Nordsee rund 25 %), und eine Fehlmenge unter 5 % der Fahrt bei ruhiger See fährt still mit (als „Kohle knapp“ in den Gründen, ohne Ereignis). `tools/tests/kohle.js` prüft alle 27 auf der Linie zugelassenen Typen: höchstens 0,61 Meldungen im Jahr (Seebäderschiff 1924), Ziel höchstens eine.

## 8. Statistik Finanzen

Einnahmen grün, Kosten rot, Ergebnis nach Vorzeichen, in Hell und Dunkel. Kosten in vier aufklappbaren Gruppen:
- **Betrieb:** Kohle (Lager, Kai, Häfen), Lagergeld, Rücknahme, Heuer, Kapitäne, Personal, Verpflegung, Hafengebühren, Lotsengeld, Kontor, Konzession
- **Schiffe:** Wartung, Versicherung, Werft, Reparaturen, Gutachten
- **Finanzen:** Zinsen, Überziehungszins, Kursverluste, Börsengebühren
- **Sonstiges:** alles Übrige

Darüber die Monatsergebnisse der letzten 24 Monate als Balken (über der Linie Gewinn, darunter Verlust, Tipp mit Monat und Betrag). Das Hauptbuch im Kontor hat dieselben Farben und Gruppen.

## 9. Kohlelager

| | |
|---|---|
| Größe | 3.000 t (alte Spielstände: so viel, wie ihre Schiffe in zwei Monaten zu Hause bunkern, mindestens 3.000 t) |
| Kaufpreis | Heimathafenpreis × Kohlepreis; Hauszeche 20 % billiger bis zu ihrer Förderung |
| Bunkern zu Hause | aus dem Lager zum Einstandspreis (gleitender Durchschnitt), sonst am Kai +15 % |
| Bunkern auswärts | automatisch bis zum nächsten Heimathafen plus Reserve, zum Hafenpreis |
| Lagergeld | 0,10 Mark je t und Monat (mit der Teuerung) |
| Lieferverträge | liefern monatlich ins Lager; Überschuss nimmt der Händler zu 80 % zurück |
| Buchung | Der Kauf kostet Kasse, aber keine Kosten; Kosten entstehen beim Bunkern („Kohle aus dem Lager“). Das Lager zählt zum Eigenkapital. |

Weggefallen: die drei Bekohlungsregeln, die Regel je Schiff, die Mindestabnahme der Verträge und die Wahl des Vertragshafens.

**Korrektur v5.1.2:** In v5.1.1 kostete Kohle aus dem Lager beim Bunkern ein zweites Mal Kasse (schon beim Kauf bezahlt, beim Bunkern noch einmal abgebucht). In der Simulation trieb das den Aufsteiger auf Normal in 9 von 36 Läufen in die Pleite. Jetzt wird beim Bunkern nur noch gebucht. Spielstände aus v5.1.1 bekommen beim Laden den doppelt bezahlten Betrag zurück (Summe aller Buchungen „Kohle aus dem Lager“) und eine Meldung.

## 10. Museum: Fristen

Betriebsfähige Museumsschiffe haben eine Frist wie die Flotte. Das Museum zeigt sie mit „Frist erneuern“, warnt 30 Tage vorher, und Nostalgiefahrten gibt es nur mit gültiger Frist. Eine Restaurierung bringt eine neue Frist mit. Alte Spielstände bekommen für abgelaufene Fristen drei Monate Aufschub. Stillgelegte Ausstellungsstücke brauchen keine.

## 11. Simulation

`node tools/simulation.js`, 12 Läufe je Strategie, 40 Betriebsjahre, dazu die Start-Bots über 30 Jahre. Neu:
- Die Bots spielen Tag für Tag und füllen das Lager wie ein aufmerksamer Spieler: Fällt der Vorrat unter 30 Tage, kaufen sie auf 60 Tage nach (höchstens bis voll, mit höchstens der Hälfte der Kasse).
- Prüfung „Kohlelager“ statt „Bekohlungsregeln“, dazu „Zweites Schiff“ und „Kohle knapp“, die die Testskripte aufrufen.

### Ergebnisse (v5.1.2)

| Prüfung | Ergebnis |
|---|---|
| Schwierigkeit | Normal −35,9 % ± 5,0 % gegen Leicht (Ziel −35 bis −20 %), Schwer −64,3 % ± 5,6 % (Ziel −65 bis −45 %) → erreicht, beide am Rand |
| Zeitziele Aufsteiger | Leicht 0,9 / 6,2 / 10,7 Jahre, Normal 2,9 / 10,8 / 17,4 (97 % schaffen den Atlantik), Schwer 4,5 / 17,4 / 22,4 → erreicht |
| Fährreederei | Normal Ø 213.274 Mark im Jahr in den ersten zehn Jahren (v5.1: 210.163), 0 % Verlustjahre → erreicht |
| Kurz gegen Lang | Rendite gut geführt Kurzstrecke +30,1 %, Langstrecke +24,4 %, 19 % Unterschied (Ziel höchstens ein Viertel) → erreicht |
| Atlantik schlecht getaktet | 31 % Verlustjahre → erreicht |
| Gegenmittel, Fahrstufe, Verpflegung | keine Einstellung überall die beste → erreicht |
| Kohlelager | keine Strategie überall die beste → erreicht |
| Lieferverträge | lohnen sich in 7 von 24 Fällen → erreicht |
| Börse | Aktien bringen in 5 von 6 Linienarten weniger als die Reederei → erreicht |
| Zweites Schiff | alle sechs Linien im Ziel (Abschnitt 6) |
| Kohle knapp | alle 27 Typen höchstens 0,61 Meldungen im Jahr |

### Kohlelager (Normal, Ø Jahresgewinn)

| Linienart | auffüllen (Standard) | nur unter 95 % | kein Lager |
|---|---|---|---|
| Fähre | 80.028 | 80.018 | **80.080** |
| Küste und Bäder | **114.845** | 91.831 | 88.616 |
| Nord- und Ostsee | 673.043 | **690.440** | 677.594 |
| Atlantik | **2.258.638** | 2.145.230 | 2.138.275 |
| Südamerika | **1.061.950** | 1.025.683 | 963.980 |
| Vergnügungsreise | 1.797.091 | **1.939.705** | 1.857.807 |

Eine kleine Fähre verbraucht so wenig, dass das Lager kaum etwas ausmacht. Große Verbraucher sparen mit dem Lager 5 bis 10 % der Kohlekosten. Wer nur bei billiger Kohle kauft, gewinnt, wenn die Kohle lange teuer ist und die Linie saisonal fährt.

### Schwierigkeitsgrad – Ø Jahresgewinn, nichts anfassen (Linien-Bots)

| Linienart | v5.1 (Normal) | Leicht | Normal | Schwer |
|---|---|---|---|---|
| Fähre | 30.616 | 79.465 | 80.028 | 70.915 |
| Küste und Bäder | 105.331 | 125.909 | 114.845 | 91.547 |
| Nord- und Ostsee | 553.305 | 627.983 | 673.043 | 539.937 |
| Atlantik | 1.831.921 | 4.571.788 | 2.258.638 | 911.415 |
| Südamerika | 925.548 | 1.870.555 | 1.061.950 | 365.187 |
| Vergnügungsreise | 1.801.136 | 2.068.629 | 1.797.091 | 1.361.158 |

Die Linien-Bots fahren auf Fähre, Küste, Atlantik und Südamerika zwei Schiffe je Linie. Mit dem Takt bringt das zweite Schiff jetzt mehr; am stärksten auf Dover – Calais (Kaufleute und Bahnreisende, viele Rivalen).

### Was die Simulation geändert hat

| Wert | Startwert | jetzt | Grund |
|---|---|---|---|
| Lagerkauf der Bots | auffüllen, sobald halb leer | auf 60 Tage nachkaufen, sobald unter 30 Tagen | Ein volles Lager band bei kleinen Reedereien zu viel Geld. |
| Kohle aus dem Lager | Kasse beim Kauf und beim Bunkern | Kasse nur beim Kauf | Buchungsfehler (v5.1.2), siehe Abschnitt 9 |
| Hamburg – Helgoland in der Prüfung | starke Linie | schwache Linie | Ein Schiff ist dort 1880 nur zu 14 % ausgelastet. |

### Offene Punkte

- Die Fährlinien der Linien-Bots verdienen mit zwei Schiffen jetzt gut doppelt so viel wie in v5.1. Kurz gegen Lang bleibt im Ziel, die Rendite der Fähre (+31,7 % mit zwei Schiffen) liegt aber über dem Atlantik (+25,0 %). Falls Fähren zu leicht wirken: TAKT_W von 5 auf 4.
- Normal und Schwer liegen beim Abstand zu Leicht am Rand des Ziels.
- Die Hinweis-Rechnung für ein weiteres Schiff ist bewusst vorsichtig; auf Hamburg – London meldet sie nichts, obwohl das zweite Schiff dort viel bringt (die festen Kosten der Linie zählen sie wie Schiffskosten).
- Eine Nachkaufregel fürs Lager und der Ausbau des Lagers kommen mit v5.2.
