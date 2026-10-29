# Konzept v5.1.3 „Lager, Einstellungen und Julia“

*Stand 28. Oktober 2026 · umgesetzt in v5.1.3*

v5.1.3 macht das Kohlelager zur einzigen Kohlequelle der Reederei: Ausbau in Stufen, keine Lieferverträge, kein Kai mehr. Dazu kommen Bedienung (aufgeklappte Bereiche bleiben offen, Linien zum Einklappen, Sprache über Flaggen, zwei Lautstärkeregler), das Untergangsfenster und die Flottenadmiralin Julia. Dieses Dokument beschreibt, was gebaut wurde, mit den Zahlen nach der Simulation. Im Updatelog steht zu Julia nur „eine neue Überraschung“.

## Grundsätze

- Keine Einstellung ist überall die beste; das gilt auch für den Ausbau des Lagers.
- Speicherschlüssel bleiben, wie sie sind; neu sind nur die zwei Schlüssel für die Lautstärke. Alte Spielstände laden, ihr Lager wird zur passenden Stufe.
- Alle neuen Texte gibt es auf Deutsch, Englisch und Spanisch, Beträge bei britischem Heimathafen in Pfund.

## 1. Aufgeklappte Bereiche und Linien

**Ursache:** Das Spiel zeichnet bei jeder Meldung und jedem Monatswechsel den ganzen Bereich neu. Gemerkt wurden nur einige Bereiche; Geschichten der Sonderschiffe, „Ältere Bauarten“, die Verpflegung je Schiff, „Die wahre Geschichte“ der Sonderkapitäne und „So funktioniert das Spiel“ klappten zu, die Seite wurde kürzer, und der Browser sprang nach oben.

- Jeder aufklappbare Bereich hat einen festen Schlüssel (`data-sec`, dazu wie bisher `data-ship`, `data-plan`, `data-line` und das Hauptbuch). Als Sicherheitsnetz merkt sich das Neuzeichnen offene Bereiche ohne Schlüssel nach ihrer Überschrift.
- Die Ansicht (Fenster und Seitenleisten am PC) bleibt beim Neuzeichnen im selben Bereich, wo sie war; beim Wechsel des Bereichs geht es wie bisher nach oben.
- **Linien einklappbar** wie die Schiffe in der Flotte. Eingeklappt eine Zeile: Name, Schiffe, Ergebnis des Vormonats (grün oder rot), Auslastung, Pünktlichkeit, dazu Warnzeichen mit Text für Bildschirmleser: Verlust (▼), viele Verspätungen (pünktlich unter 80 %), Kohle knapp (ein Schiff liegt ohne Lagerkohle fest oder meldete „Kohle knapp“), kein Schiff. „Alle auf“ und „Alle zu“ darüber. Neue Linien starten aufgeklappt.
- **Test** `tools/tests/aufklappen.js`: sucht im Code nach aufklappbaren Bereichen ohne Schlüssel und schaltet im Browser (390 px und 1.440 px) in Werft, Flotte, Linien und Personal jeden zweiten Bereich um, scrollt nach unten und lässt die Zeit laufen, bis der Bereich ganz neu gezeichnet ist. Ergebnis: alle Bereiche wie vorher, die Ansicht springt nicht.

## 2. Hauptmenü und Einstellungen

- **Sprache nur im Hauptmenü,** als drei Flaggen (Deutschland, Großbritannien, Spanien ohne Wappen), als Vektorgrafik im Hausstil mit dünnem Messingrahmen; die gewählte bekommt einen kräftigen Messingring. Jeder Knopf heißt für Bildschirmleser „Deutsch“, „English“ oder „Español“ (`aria-label`, `lang`, `aria-pressed`). Die Flaggen stehen für die Sprache, die Währung hängt weiter am Heimathafen.
- **Zwei Regler** in den Einstellungen, „Lautstärke Sound“ und „Lautstärke Musik“ (0–100 %, Schritte von 5 %), darunter wie bisher Ton aus, Musik aus, nächstes Stück. Gespeichert je Gerät unter `flaggschiff-proto-1880-tonlaut` und `flaggschiff-proto-1880-musiklaut`, Standard 100 %. Die Musik läuft über einen eigenen Lautstärkeknoten (Web Audio), weil Safari auf dem iPhone `audio.volume` nicht verändern lässt; klappt das nicht, nimmt das Spiel `audio.volume`.

## 3. Kohle nur über das Lager

### Bunkern

- **Bunkerhafen der Linie:** der Heimathafen, sonst der erste Hafen der Linie. Dort nehmen die Schiffe nur Kohle aus dem Lager, so viel, wie der Bunker fasst, mindestens die ganze Rundreise mit Reserve (Reserve wie seit v5.1.1 nach dem rauesten Seegebiet).
- **Linien ohne Heimathafen** (zum Beispiel Glückstadt – Wischhafen, Dagebüll – Wyk, Holyhead – Dublin, Tilbury – Gravesend, Dover – Calais, Portsmouth – Ryde) bekommen die Kohle aus dem Lager an ihren Bunkerhafen gebracht, mit **10 % Fracht** auf den Einstandspreis (Kostenart „Kohlefracht“). Entschieden als Variante A: Das Lager versorgt alle Linien.
- **Auswärts** kaufen die Schiffe nur, was der Bunker für die Rundreise nicht fasst, zum Hafenpreis. Dazu bleibt die Notkohle in Seenot und bei „Kohle knapp“ auf See.
- **Zu wenig im Lager:** Das Schiff nimmt, was da ist, und wartet; jeden Tag nimmt es nach, was neu ankommt. Es fährt erst mit der Mindestmenge ab.
- **Lager leer:** Die Schiffe liegen im Bunkerhafen fest. Jede fällige Abfahrt fällt aus und zählt als unpünktlich, die Fahrgäste wandern ab. Grund „Kohlelager leer“ in Abfahrtstafel, Flotte und Karte, Meldung „Kohlelager leer: die „…“ liegt fest“.
- **Warnung vorher:** Reicht der Vorrat (Bestand und unterwegs) nach dem Verbrauch der letzten drei Monate nur noch für etwa 14 Tage, hält die Zeit an („Kohle wird knapp im Lager“). Sie kommt erst wieder, wenn der Vorrat zwischendurch wieder reichte.
- **Lager kleiner als ein Bunker:** Werft und Flotte zeigen einen Hinweis, wenn eine Bunkerfüllung mehr ist, als das Lager fasst.

### Ausbau

| Stufe | Bild | Fasst | Bauzeit | Kosten (1880) | Unterhalt im Monat | Zulauf je Tag | Abgabe beim Bunkern | Kohle |
|---|---|---|---|---|---|---|---|---|
| Kohlenschuppen | geb_kohlenschuppen | 3.000 t | – | – | 150 | 500 t | 1.200 t am Tag | Heimathafenpreis |
| Kohlenhof | geb_kohlenhof | 10.000 t | 2 Monate | 25.000 | 400 | 1.500 t | 2.000 t am Tag | Heimathafenpreis |
| Lager mit Kran und Bahnanschluss | geb_kohlenlager | 30.000 t | 4 Monate | 80.000 | 1.000 | 5.000 t | 3.000 t am Tag | 5 % billiger |
| Bunkerstation mit eigenen Schuten | geb_bunkerstation | 80.000 t | 6 Monate | 220.000 | 2.500 | 12.000 t | 6.000 t am Tag | 5 % billiger, Bekohlen neben dem Ein- und Aussteigen |

- Kosten und Unterhalt steigen mit der Teuerung, in Pfund bei britischem Heimathafen. Ausbau nur Stufe für Stufe, bezahlt beim Auftrag; während des Baus bleibt das alte Lager nutzbar. Fertig gibt es eine Meldung mit dem Bild der neuen Stufe.
- **Zulauf je Tag:** Gekaufte Kohle kommt höchstens mit dem Zulauf der Stufe ins Lager, der Rest ist „unterwegs“ (Anzeige im Einkauf) und zählt beim Vorrat mit. Mit einer größeren Flotte verbrauchen die Schiffe mehr, als der Schuppen am Tag annimmt; dann hilft nur der Ausbau. Das ist der Hebel, der den Ausbau ab einer mittleren Flotte lohnend macht.
- **Abgabe beim Bunkern:** im Heimathafen nach der Stufe, auswärts nach dem Hafen wie bisher.
- **Buchung:** Der Ausbau kostet Kasse, aber keine Kosten; er zählt als Anlage zum Eigenkapital und verliert 2 % im Jahr. Das Lagergeld je Tonne fällt weg, dafür der feste Unterhalt (Kostenart „Kohlelager“).
- **Neue Reederei:** Der Kohlenhändler liefert die erste Füllung für den Schuppen (1.000 t).

### Lieferverträge, Hauszeche, Kohleneinkäufer

- **Lieferverträge** gibt es nicht mehr. Laufende Verträge enden beim Laden ohne Kosten, mit Meldung.
- **Hauszeche** bleibt: 20 % billiger bis zu ihrer Förderung, mit dem Kranlager zusammen 25 %.
- **Kohleneinkäufer:** hält das Lager voll. Er kauft jeden Tag nach, was nicht liegt oder unterwegs ist, und lässt mindestens die Hälfte der Kosten des Vormonats in der Kasse. Knapp bezahlt vergisst er an 35 % der Tage den Einkauf. Die Regel „Verlängern unter … %“ fällt weg.
- **Von Hand:** 100 t, 500 t, 1.000 t und „Auffüllen“ im Einkauf, mit Preis. Der Lagerkasten zeigt Stufe, Bestand, unterwegs, Zulauf je Tag und wie lange der Vorrat reicht.

### Buchungen

| Vorgang | Kasse | Kosten | Eigenkapital |
|---|---|---|---|
| Kohle ins Lager kaufen | − Kaufpreis | – | gleich (Kasse wird Lagerbestand) |
| Bunkern im Heimathafen | – | + Einstandspreis („Kohle aus dem Lager“) | − Einstandspreis |
| Bunkern an einer Linie ohne Heimathafen | − 10 % Fracht | + Einstandspreis und Fracht | − beides |
| Bunkern auswärts, Notkohle | − Hafenpreis | + Hafenpreis | − Hafenpreis |
| Ausbau | − Preis | – | gleich (Kasse wird Anlage), dann 2 % im Jahr weniger |
| Unterhalt | − im Monat | + im Monat | − im Monat |

**Test** `tools/tests/kohlekasse.js` (Lehre aus v5.1.1): Drei Reedereien spielen je vier Jahre Tag für Tag (Hamburg von Hand, Liverpool mit Einkäufer und Ausbau, Hamburg mit Lübeck – Kopenhagen ohne Heimathafen). Jede Änderung der Kasse wird mit der Funktion mitgeschrieben, aus der sie kommt. Geprüft wird: Kauf und Startbestand ergeben genau Kosten aus dem Lager und Endbestand; Geld fließt nur beim Kauf (genau der Kaufpreis) und beim Bunkern nur für Fracht und Kai; die Fracht ist 10 % des Einstandspreises, nur ohne Heimathafen (die erste Füllung bei der Ablieferung ist frei); Kauf und Ausbau ändern das Eigenkapital nicht. Ergebnis: alles stimmt.

### Alte Spielstände

- Das bisherige Lager wird zur kleinsten Stufe, die mindestens so viel fasst, ohne Kosten. Bestand und Einstandspreis bleiben.
- 30 Tage Übergang: Ist das Lager leer, bunkern die Schiffe noch am Kai (im Heimathafen 15 % teurer, sonst mit Fracht). Meldung „Kohle nur noch aus dem Lager“ mit dem Datum.
- Lieferverträge enden ohne Kosten, die Regel des Einkäufers fällt weg.

## 4. Flottenadmiralin Julia

| | |
|---|---|
| Name | Flottenadmiralin Julia · Fleet Admiral Julia · Almirante de la Flota Julia, Titel „Die Admiralin“ |
| Auftauchen | wie Kapitän Emil: sobald ein Schiff oder die Reederei „Julia“ heißt (eigenes Wort, groß oder klein); ist das Schiff noch im Bau, bei der Ablieferung |
| Angebot | Ereignis mit Bild `ev_julia`, „Zu Befehl, Frau Admiralin!“ oder „Danke, wir sind gut besetzt“ |
| Bindung | an ihr Schiff. Verkauft oder abgewrackt: kehrt zur Marine zurück. Gesunken: geht als Letzte von Bord und kehrt zur Marine zurück. Kommt Emil auf ihr Schiff, geht sie (und umgekehrt) |
| Wirkung | Deck, Maschine und Service arbeiten auf ihrem Schiff eine Lohnstufe besser, ohne mehr Lohn (weniger Havarien und Pannen, bessere Aussichten in Seenot, mehr Komfort, etwas schneller und sparsamer). Über „sehr gut“ hinaus gibt es noch einmal den halben Schritt. Läuft ihr Schiff Fuerteventura an, ist es auf der ganzen Linie 10 % schneller |
| Heuer | einfacher Satz wie Emil |
| Ereignis | „Inspektion durch die Flottenadmiralin“, selten und nur mit ihr an Bord: +2 Ruf, +2 Zustand |
| Erfolg | „Respekt!“ – Eine ganz besondere Admiralin an Bord begrüßen |

**Kapitän Emil** hat ein neues Bild (`ev_emil` aus `emil.png`, 754 × 498 aus dem 16:9-Bild, Gesicht, Pfeife und Flaschenpost mittig). Seine Wirkung bleibt gleich.

## 5. Untergang als Fenster

Ein Untergang hält die Zeit an und öffnet ein eigenes Fenster (in der Simulation nicht). Die Meldung in der Zeitung bleibt.

- **Oben:** Bild `ev_meeresgrund` (die American Star strandet wie bisher mit `ev_wrack`), der Name des Schiffs und als Band in Messing die Linie mit Ort und Ursache. Ort: das gefährlichste Seegebiet der Strecke und „zwischen A und B“. Ursache: Sturm, Kesselexplosion, Leck, Wassereinbruch, Grundberührung oder Feuer; die Seenot merkt sich ihre Ursache, und der Sturm zählt, wenn es auf der Strecke gerade stürmt. „Schiff aufgegeben“, wenn der Spieler es aufgab.
- **Menschen:** an Bord, gerettet, Opfer, Verletzte.
- **Folgen:** Versicherung (Zeitwert, gekürzt wegen Wartungsmängeln, oder nichts, wenn nicht versichert oder die Frist abgelaufen ist), davon an die Bank, Entschädigungen, Restschuld, Ruf, Bekanntheit, was aus dem Kapitän wird.
- **Was das für die Linie bedeutet:** Schiffe vorher und nachher, Abfahrten im Monat vorher und geschätzt nachher, Verträge in Gefahr (Post, Inselpost, Fährkonzession mit Mindesttakt und Strafe, Zeitkarten, wenn kein Schiff mehr fährt).
- **Knöpfe:** „Schließen“ und „Zur Linie“ (öffnet unter Linien diese Linie aufgeklappt).

## 6. Bilder

| Datei | Spielbild |
|---|---|
| `bogen_kohlelager.png` | `geb_kohlenschuppen`, `geb_kohlenhof`, `geb_kohlenlager`, `geb_bunkerstation` |
| `julia.png` | `ev_julia` |
| `meeresgrund.png` | `ev_meeresgrund` |
| `emil.png` | `ev_emil` (neu) |

Rahmen in `tools/zuschnitt.json`, Originale in `originale/bilder/`, Zuordnung in `originale/LIESMICH.md`.

## 7. Simulation

`node tools/simulation.js`, 12 Läufe je Strategie, 40 Betriebsjahre, dazu die Start-Bots über 30 Jahre (2.808 Spiele, rund 17 Minuten). Neu:

- **Lager-Bots:** „von Hand“ (Standard für alle Bots: unter 30 Tagen Vorrat auf 60 Tage nachkaufen, mit höchstens der Hälfte der Kasse), „Kohleneinkäufer Tarif“, „Kohleneinkäufer knapp bezahlt“, „von Hand, nie ausbauen“ und „kauft nie nach“ (nur die Startkohle). Ausgebaut wird, sobald das Lager weniger als 45 Tage fasst, der Zulauf unter dem 1,5-Fachen des Tagesverbrauchs liegt oder eine Bunkerfüllung des größten Schiffs nicht hineinpasst, und nur, wenn der Ausbau höchstens ein Viertel der Kasse kostet.
- **Prüfung „Kohlelager“** mit drei Zielen: rechtzeitig gefüllt (höchstens 1 % der Schiffstage ohne Kohle), Ausbau lohnt sich erst ab einer größeren Flotte, ohne Nachkauf bleibt die Reederei liegen. Die Prüfung „Lieferverträge“ fällt weg.
- **„Schlecht getaktet“** füllt sein Lager über einen knapp bezahlten Einkäufer und baut nie aus (bisher: kein Lager und „nur das Nötige“ bunkern, beides gibt es nicht mehr).
- `tools/tests/zweites.js` und `tools/tests/kohle.js` stellen einen Kohleneinkäufer ein; ohne ihn lagen die Schiffe nach der Startkohle fest.

### Ergebnisse (v5.1.3)

| Prüfung | Ergebnis |
|---|---|
| Schwierigkeit | Normal −29,1 % ± 4,5 % gegen Leicht (Ziel −35 bis −20 %, v5.1.2: −35,9 %), Schwer −62,4 % ± 4,4 % (Ziel −65 bis −45 %, v5.1.2: −64,3 %) → erreicht, beide jetzt weiter weg vom Rand |
| Zeitziele Aufsteiger | Leicht 0,7 / 6,3 / 10,9 Jahre bis Küste / Nordsee / Atlantik, Normal 2,8 / 11,5 / 17,5 (97 % schaffen den Atlantik), Schwer 4,4 / 17,6 / 22,4 (3 Pleiten in 36 Läufen) → erreicht |
| Fährreederei | Normal Ø 215.627 im Jahr in den ersten zehn Jahren (v5.1.2: 213.274), 0 % Verlustjahre → erreicht |
| Kurz gegen Lang | Rendite gut geführt Kurzstrecke +29,0 %, Langstrecke +23,5 %, 19 % Unterschied (Ziel höchstens ein Viertel) → erreicht |
| Atlantik gut geführt gegen Kurzstrecke | +27,5 % gegen +29,0 % → **knapp verfehlt** (v5.1.2: +31,0 % gegen +30,1 %, knapp erreicht) |
| Atlantik schlecht getaktet | Ø 808.642 im Jahr, 27 % Verlustjahre (Ziel Verlust im Schnitt oder mindestens 30 %) → **knapp verfehlt** (v5.1.2: 31 %) |
| Gut geführt | kein Lauf mit Verlust über alle Jahre → erreicht |
| Gegenmittel, Fahrstufe, Verpflegung | keine Einstellung überall die beste → erreicht |
| Kohlelager | rechtzeitig gefüllt, Ausbau ab rund 5.500 t im Monat, ohne Nachkauf liegen → alle drei erreicht |
| Börse | Aktien bringen in 6 von 6 Linienarten weniger als die Reederei → erreicht |
| Zweites Schiff | alle sechs Linien im Ziel |
| Kohle knapp | alle zugelassenen Typen höchstens 0,46 Meldungen im Jahr (Autofähre 1950) |

### Kohlelager (Normal, Ø Jahresgewinn nach Ausbau)

| Linienart | Verbrauch im Monat | von Hand, bei Bedarf ausbauen | Einkäufer Tarif | Einkäufer knapp | von Hand, nie ausbauen | kauft nie nach |
|---|---|---|---|---|---|---|
| Fähre | 203 t | **76.927** | 70.513 | 68.964 | **76.927** | −89.782 |
| Küste und Bäder | 525 t | 109.848 | 103.118 | 98.464 | **110.728** | −157.588 |
| Vergnügungsreise | 1.833 t | **1.892.775** | 1.874.038 | 1.765.877 | 1.875.141 | −2.013.317 |
| Nord- und Ostsee | 2.175 t | 591.592 | 584.811 | **621.123** | 584.857 | −357.871 |
| Südamerika | 5.482 t | 1.226.285 | **1.313.728** | 1.261.127 | 448.221 | −2.406.357 |
| Atlantik | 8.903 t | **2.967.294** | 2.295.685 | 2.312.110 | 1.043.118 | −4.492.052 |

- **Rechtzeitig:** Von Hand und mit Einkäufer liegen die Schiffe höchstens 0,01 % der Schiffstage ohne Kohle. Wer auf dem Atlantik nie ausbaut, liegt 1,65 % der Tage fest und ist nur noch zu 43 % pünktlich (sonst 59 %).
- **Ausbau:** bei Fähre, Küste, Vergnügungsreise und Nord- und Ostsee kein klarer Unterschied (Küste −880 im Jahr, ein Kohlenhof lohnt sich dort nicht). Ab Südamerika (5.482 t im Monat) +0,78 Mio. im Jahr, Atlantik +1,92 Mio.
- **Liegen bleiben:** Ohne Einkäufer und ohne Nachkauf fährt ab dem dritten Jahr kein Schiff mehr, Verlust in jedem Lauf.
- **Einkäufer:** kostet bei kleinen Flotten rund 6.500 im Jahr gegen den Einkauf von Hand. Auf dem Atlantik bindet er viel Geld, weil er ein großes Lager immer voll hält; die Flotte wächst langsamer (−0,67 Mio. im Jahr). Auf Südamerika bringt er mehr (+87.000).

### Schwierigkeitsgrad – Ø Jahresgewinn, nichts anfassen (Linien-Bots)

| Linienart | v5.1.2 (Normal) | Leicht | Normal | Schwer |
|---|---|---|---|---|
| Fähre | 80.028 | 75.878 | 76.927 | 67.342 |
| Küste und Bäder | 114.845 | 124.687 | 109.965 | 93.576 |
| Nord- und Ostsee | 673.043 | 622.728 | 592.038 | 577.525 |
| Atlantik | 2.258.638 | 4.428.682 | 2.969.077 | 1.203.550 |
| Südamerika | 1.061.950 | 1.984.964 | 1.227.716 | 285.235 |
| Vergnügungsreise | 1.797.091 | 2.456.406 | 1.893.161 | 1.415.094 |

- **Nord- und Ostsee −12 %:** Auf den Linien selbst ändert sich wenig. Ein Schiff allein (je sechs Läufe über fünf Jahre) hat auf Hamburg – London und Lübeck – Kopenhagen dieselben Verspätungsgründe, 1 bis 3 % weniger Abfahrten und billigere Kohle, auf Lübeck – Kopenhagen trotz 10 % Fracht. Der Rest liegt in der Streuung der Bots (Standardfehler rund ± 50.000) und darin, dass sie jetzt Geld im Lager und im Ausbau binden.
- **Atlantik +31 %, Südamerika +16 %:** Die Schiffe nehmen die Kohle für die ganze Rundreise aus dem Lager im Heimathafen statt sie in New York oder Rio zum Hafenpreis zu kaufen. Die Kohlekosten auf dem Atlantik sinken von 1,71 auf 1,55 Mio. im Jahr, die Entschädigungen für Verspätungen von 281.000 auf 210.000.

### Gut geführt und schlecht getaktet (Normal, Ø Jahresgewinn)

| Linienart | nichts anfassen | gut geführt | gut geführt, ein Schiff je Linie | schlecht getaktet |
|---|---|---|---|---|
| Fähre | 76.927 | 76.367 | 42.835 | 38.361 |
| Küste und Bäder | 109.965 | 131.083 | 177.852 | 129.947 |
| Nord- und Ostsee | 592.038 | 626.559 | 626.559 | 505.147 |
| Atlantik | 2.969.077 | 2.925.115 | 2.004.709 | 808.642 |
| Südamerika | 1.227.716 | 1.439.153 | 568.896 | 85.320 |
| Vergnügungsreise | 1.893.161 | 1.751.444 | 1.751.444 | 1.622.430 |

### Was die Simulation geändert hat

| Wert | Startwert | jetzt | Grund |
|---|---|---|---|
| „Schlecht getaktet“ | Lager von Hand gefüllt, nie ausgebaut | Einkäufer knapp bezahlt, nie ausgebaut | Der Bot verlor mit dem Kai und der Regel „nur das Nötige“ seine schlechte Kohlewirtschaft; mit dem Lager von Hand machte er auf dem Atlantik nur 25 % Verlustjahre. |
| Test „Zweites Schiff“ und „Kohle knapp“ | ohne Einkäufer | Einkäufer Tarif | Ohne Nachkauf lagen die Schiffe fest, das zweite Schiff verlor auf Hamburg – London alles. |

Die Zahlen des Lagers (Stufen, Zulauf, Abgabe, Fracht 10 %, Startkohle 1.000 t, 2 % Wertverlust im Jahr, 30 Tage Übergang) bleiben wie geplant: Die drei Lagerziele sind ohne Änderung erreicht.

### Offene Punkte

- **Atlantik:** Mit Kohle aus dem eigenen Lager ist er leichter geworden. „Schlecht getaktet“ macht dort 27 % Verlustjahre (Ziel 30 %), und gut geführt bringt er 1,5 Punkte weniger Rendite als die Kurzstrecke. Beides liegt in der Streuung der zwölf Läufe, war aber auch in v5.1.2 nur knapp erreicht. Eigene Kohlestationen in v5.2 sind der natürliche Hebel; sonst ginge es über eine höhere Reserve auf langen Strecken oder teurere Ozeankohle.
- **Einkäufer auf großen Linien:** Er hält das Lager immer voll und bindet auf dem Atlantik so viel Geld, dass die Flotte langsamer wächst. Eine Nachkaufregel („Vorrat für … Tage“) kommt mit v5.2.
- Normal liegt jetzt bei −29 % gegen Leicht, mitten im Ziel; die Fährreederei verdient wie in v5.1.2.

## 8. Tests

| Test | Prüft | Ergebnis |
|---|---|---|
| `tools/tests/ui.js` | alle Bereiche am Handy (390 px) und am PC (1.440 px) in Deutsch, Englisch und Spanisch, dazu Hauptmenü mit Flaggen, Einstellungen mit zwei Reglern, Untergangsfenster mit „Zur Linie“, Spielstand mit leerem Lager und ein Spielstand aus der Engine von `main` | keine JavaScript-Fehler, keine deutschen Reste, keine fehlenden Sätze |
| `tools/tests/meldungen.js` | spielt Lager leer, Ausbau, Julia (Angebot, an Bord, Inspektion, Verkauf, abgelehnt, Reederei „Julia“, Untergang), fünf Untergänge mit Kredit und Postvertrag und einen Spielstand aus v5.1.2 mit Liefervertrag; prüft jede Meldung, jedes Ereignis und jede Antwort Satz für Satz auf Englisch und Spanisch | 575 Meldungen, alle übersetzt |
| `tools/tests/kohlekasse.js` | Kassenbuchungen der Kohle (Abschnitt 3) | alle stimmen |
| `tools/tests/aufklappen.js` | Aufgeklapptes und Ansicht beim Neuzeichnen (Abschnitt 1) | alle Bereiche wie vorher, keine Sprünge |
| `tools/tests/spielstaende.js` | Spielstände aus v5.0.1, v5.1 und v5.1.2 (Hamburg, Liverpool, London) laden und zwei Jahre weiterspielen | alle laden und laufen, Lager als Kohlenschuppen |
| `tools/tests/zweites.js`, `kohle.js`, `karte.js`, `preise.js` | wie in v5.1.1 | alle im Ziel |
