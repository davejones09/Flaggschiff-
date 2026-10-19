# Konzept v4.6 „Zeitung, Börse und Einführung“

*Stand 19. Oktober 2026 · umgesetzt in v4.6*

Die Zeitung bekommt Rubriken und einen Kurszettel. Wer Geld übrig hat, kann es an der Börse anlegen, in Rivalen, Zechen, die Werft und die Caterer. Und der Berater erklärt jeden Bereich beim ersten Besuch. Dieses Dokument beschreibt, was gebaut wurde, mit den endgültigen Zahlen nach der Simulation.

## Grundsätze

- Wer die Börse nie öffnet, spielt wie bisher. Die Börse hat einen eigenen Zufallsgenerator und verbraucht keine Zufallszahlen des Hauptspiels. Bis auf die neuen Krisen-Termine läuft ein Spiel ohne Börse Schritt für Schritt wie v4.5 (bitgleich geprüft über 40 Jahre).
- Börsenmeldungen sieht nur, wer Aktien hält oder die Börse schon einmal geöffnet hat. Allgemeine Krisen und die Rivalen-Meldungen sieht jeder.
- Automatik nur über angestelltes Personal mit Gehalt und Lohnstufe: den Prokuristen.
- Aktien bringen im Schnitt spürbar weniger als eine gut laufende Linie.
- Alle Zahlen sind per Simulation geprüft (siehe unten). Was sich gegenüber den Startwerten im Plan geändert hat, steht unter „Was die Simulation geändert hat“.

## 1. Börse

### Freischaltung und Seite

- Neue Kontor-Unterseite „Börse“ (Kopfbild `bo_saal`). Sie öffnet sich, sobald die Reederei mindestens drei Schiffe und ein abgeschlossenes Geschäftsjahr mit Gewinn hat. Dann kommt die Meldung „Die Börse öffnet Ihnen ihre Türen“ (Rubrik Schifffahrt). Vorher zeigt die Seite die beiden Bedingungen.
- Alte Spielstände prüfen die Bedingung beim Laden.

### Werte (13 Aktien, alle Namen erfunden)

| Gruppe | Werte | Gewinn 1880 im Jahr | Kurs 1880 | hängt an |
|---|---|---|---|---|
| Reedereien (6) | Weser-Atlantik-Linie, Elbe-Sparlinie (GB: Mersey Penny Line), Baltische Dampfer-Compagnie (GB: Clyde & Irish Sea Packet Company), Kopenhagener Salonlinie, Brandt & Söhne, Themse-Kanal-Linie | 200.000 bis 900.000 M | 80 bis 300 M | Konjunktur, Rivalen-Ereignisse (Preiskampf, Schwierigkeiten, Ausbau), die Weser-Atlantik-Linie auch an Auswandererwellen, Brandt auch an Schiffspreisen |
| Zechen (2) | Hamburg: Ruhrtaler Bergbau-AG, Kohlenzeche Hohe Halde AG · Liverpool und London: Rhondda Steam Coal Company, Cwm Du Colliery Company | 150.000 und 110.000 M | 150 und 90 M | Kohlepreis, Konjunktur, Streik und Grubenunglück; ab 1912 1 % und ab 1920 2 % Wertverlust im Jahr (Ölfeuerung, Motorschiffe), höchstens bis auf 30 % |
| Werft (1) | Hamburg: Steinwerder Schiffbau-AG · Liverpool: Wirral Shipbuilding Company · London: Medway Shipbuilding Company | 300.000 M | 200 M | Schiffspreis-Index, Neubauten der Rivalen und Ihre eigenen Bestellungen (Brandt-Bestellungen gehen an Brandt & Söhne) |
| Caterer (4) | die vier Caterer aus v4.5 mit ihren Namen je Heimathafen; das Luxus-Restaurant erst ab 1905 | 25.000 bis 60.000 M | 40 bis 150 M | Konjunktur, Ihre eigenen Caterer-Verträge (8 % Ihrer Verpflegungskosten gehen in ihren Gewinn); der Billiganbieter kann pleitegehen (Kurs auf ein Zehntel, Ihre Aktien fast wertlos, nach einem Jahr Neustart) |

Die Gewinne wachsen mit 1,2 % des Startwerts im Jahr und mit dem Preisindex. Bei britischem Heimathafen erscheint alles in Pfund wie im übrigen Spiel.

### Kurs

- **Innerer Wert** = Gewinn der letzten 12 Monate × 14 (Kurs-Gewinn-Verhältnis) ÷ Zahl der Aktien. Der Gewinn schwankt jeden Monat um ±10 %.
- **Marktstimmung**: läuft jeden Monat 12 % des Wegs zu einem Zielwert, der der Konjunktur folgt (1 + 0,8 × (Konjunktur − 1)), dazu ±3 % Zufall. Grenzen 0,4 bis 1,6.
- **Eigene Note** jeder Firma: ein Trend, der sich langsam ändert, dazu ±2,5 % Zufall im Monat; sie kehrt mit 3 % im Monat zur Mitte zurück. Ereignisse (Preiskampf −5 %, Ausbau +3 %, Schwierigkeiten −25 %, Rivalen-Meldungen, Gerüchte, Zechen-Ereignisse) verschieben sie.
- **Kurs = innerer Wert × Stimmung × eigene Note**, monatlich. Die Detailansicht zeigt den Verlauf der letzten zehn Jahre.
- Normale Kursbewegungen erzeugen keine Meldung, erst ein Sprung ab 15 % im Monat.

### Handel und Depot

- Kaufen und Verkaufen nach Stückzahl oder Betrag (abgerundet auf ganze Aktien). 1 % Gebühr, mindestens 1 Mark. Keine Leerverkäufe, kein Kredit: gekauft wird nur aus der Kasse.
- Große Pakete bewegen den Kurs: Aufschlag beim Kauf (Abschlag beim Verkauf) von 0,25 × Anteil des Pakets an allen Aktien. 10 % einer Firma kosten also im Schnitt 2,5 % über dem Kurs. Ab 2 % einer Firma weist die Detailansicht darauf hin.
- Depot: Stückzahl, Einstand je Aktie (mit Gebühr), Kurs, Wert, Gewinn oder Verlust in Mark und %, Anteil an der Firma.
- Das Depot zählt zum Eigenkapital (Kurswert). Steht die Kasse am Monatsende im Minus, holt die Bank zuerst das Bargeld des Prokuristen und verkauft dann Aktien, bevor sie an die Schiffe geht.
- Im Hauptbuch: realisierte Gewinne als „Kursgewinne“ (Einnahme), Verluste als „Kursverluste“ (Kosten), Dividenden als „Dividenden“.

### Dividende

- Jedes Jahr im Mai für das Vorjahr: 50 % des Gewinns, das sind bei normaler Stimmung etwa 3,5 % des Kurses, in schwachen Phasen mehr. Keine Dividende, wenn das Vorjahr einen Verlust brachte oder unter 60 % des Erwarteten lag. Meldung mit Bild `bo_dividende` (Rubrik Börse).

### Krisen

- Historisch, für alle sichtbar (Bild `ev_krise`, Rubrik Schifffahrt):
  - Panik an den Börsen, Mai 1893: Stimmung −28 %, Konjunktur auf 0,8, Schiffspreise runter, Zinsen +1 Punkt.
  - Bankenpanik in New York, Oktober 1907: Stimmung −30 %, sonst wie oben.
  - Die Börsen schließen, Ende Juli 1914: Stimmung −15 %, kein Handel bis Ende November, Kurse eingefroren, Kaufen und Verkaufen gesperrt. Im Dezember die Meldung „Die Börse öffnet wieder“.
  - Der große Börsenkrach, Oktober 1929: Stimmung −35 %, sonst wie oben.
- Der zufällige „Börsenkrach“ aus v4.5 kommt nur noch fern der historischen Krisen (mehr als fünf Jahre davor oder danach) und deutlich seltener (Gewicht 0,12 statt 1). Gemessen über 40 Spiele von 1880 bis 1960 (80 Jahre): v4.5 im Schnitt 27 Krachs (etwa alle drei Jahre), v4.6 7 Krisen, davon 4 historische. Nach 1935 kommt etwa alle 15 Jahre ein zufälliger Krach. Er wirkt jetzt auch an der Börse (Stimmung −25 %).
- Einen Schalter „historisch / frei“ gibt es weiterhin nicht.

### Zechen-Ereignisse

- Bergarbeiterstreik (`ev_streik`) und Grubenunglück (`ev_grube`): je Zeche etwa einmal in 14 Jahren. Kurs −15 bis −30 %, der Gewinn sinkt ein bis drei Monate auf 30 %. Meldung nur in der Rubrik Börse.
- Die historischen Kohlekrisen aus v4.5 treiben den Kohlepreis und damit den Gewinn der Zechen.

### Hauszeche

- Wer über 50 % einer Zeche hält, hat eine Hauszeche (Meldung mit Bild `bo_hauszeche`, Rubrik Eigene). Kohleschiffe bunkern 20 % unter dem Marktpreis, Öl- und Motorschiffe nicht.
- Begrenzt auf die Förderung der Zeche: Rabatt höchstens für Kohle im Wert des Vierfachen ihres normalen Monatsgewinns. Größere Flotten zahlen für den Rest den Marktpreis.
- Laufende Lieferverträge laufen weiter: zuerst wird die Vertragsmenge geliefert, nur der Rest kommt aus der Hauszeche.
- Streik, Grubenunglück oder ein bestätigtes Streik-Gerücht in der Hauszeche: Kursverlust wie oben und Lieferausfall für ein bis drei Monate (Meldung unter Eigene).
- Die Detailansicht einer Zeche zeigt vor dem Kauf, was sie als Hauszeche im Vormonat gespart hätte.
- 51 % einer Zeche kosten 1880 etwa 0,9 bis 1,2 Mio. Mark (mit Paketaufschlag).

### Prokurist

- Neue Stelle unter Kontor → Personal, sobald die Börse offen ist. Bild `pers_prokurist`. 700 Mark im Monat bei Tarif (× 0,85 / 1 / 1,15 / 1,3 je Lohnstufe, wie das übrige Personal mit der Lohnentwicklung) plus 10 % der Kursgewinne, die er realisiert.
- Er verwaltet ein eigenes Depot mit dem Betrag, den Sie ihm zuteilen (aus der Kasse; ein niedrigerer Betrag geht zurück in die Kasse, dafür verkauft er), und schichtet alle drei Monate um. Ihr eigenes Depot fasst er nicht an.
- Risiko: vorsichtig (nur die großen, ruhigen Werte, 30 % bleiben bar), ausgewogen (alle Werte, je nach Einschätzung gewichtet, höchstens 25 % in einem Wert, 5 % bar), riskant (nur die drei Werte, die er für die besten hält).
- Seine Einschätzung: Trend und Abweichung vom inneren Wert jeder Firma plus ein Irrtum, der von der Lohnstufe abhängt (knapp groß, sehr gut klein) und sich nur langsam ändert. An einer Zeche kauft er höchstens 45 % (keine Hauszeche durch die Hintertür), an anderen Firmen höchstens 12 %.
- Gerüchte schätzt er richtig ein: knapp in 55 %, Tarif 65 %, gut 75 %, sehr gut 85 % der Fälle.
- Aktien von Rivalen ändern in v4.6 nichts an deren Verhalten.

## 2. Zeitung

- Rubriken über den Meldungen: Alle, Eigene, Schifffahrt, Börse (Börse erst nach Freischaltung). Am Handy in der Kontor-Übersicht (8 Meldungen), am PC in der rechten Leiste (10). Die Wahl bleibt im Browser gespeichert.
- Jede Meldung hat eine Rubrik. Alte Meldungen werden nach ihrer bisherigen Art einsortiert (Welt → Schifffahrt, sonst Eigene).
- Kurszettel über den Meldungen: Kohlepreis mit Pfeil, nach Freischaltung bis zu vier Kurse mit Pfeil (zuerst die größten Werte im Depot, dann die Rivalen auf Ihren Linien). Ein Tipp öffnet Einkauf oder die Aktie.
- In „Alle“ belegen Börsenmeldungen höchstens zwei Plätze. Seenot, Unglücke und Meldungen mit Entscheidung aus den letzten drei Monaten bleiben immer sichtbar.
- Neue Rivalen-Meldungen (Rubrik Schifffahrt, für alle, etwa vier im Jahr): neuer Dampfer (+3 bis +6 %), auf Grund gelaufen (−6 bis −12 %), Rekordjahr oder enttäuschende Bilanz (nur im ersten Quartal, nach dem echten Vorjahresgewinn), neue Linie (+2 bis +5 %), Streik an Bord (−4 bis −8 %). Sie bewegen nur den Kurs.
- Gerüchte (Bild `ev_geruecht`, Rubrik Börse, nur nach Freischaltung, etwa vier im Jahr), in der Zeitung mit dem Zusatz „Gerücht“. 60 % treffen zu und lösen nach ein bis drei Monaten einen Kurssprung von 10 bis 25 % aus, sonst „Nichts dran am Gerücht“ mit einer kleinen Gegenbewegung.

## 3. Einführung

- Der Grundkurs hat sieben Schritte (Linie eröffnen, Schiff bestellen, Linie zuweisen, Zeit starten, Hauptbuch, Ausblick auf die Kapitel), für PC und Handy getrennt formuliert, weiter beim Spielstart abwählbar.
- Kapitel beim ersten Öffnen eines Bereichs, je drei bis vier Schritte: Werft, Flotte, Kontor → Einkauf, Kontor → Personal, Markt, Zeitung, Börse. Einkauf und Börse erscheinen auch in alten Spielständen, die übrigen nur in neuen Spielen mit Einführung.
- Der Knopf oder Bereich, um den es geht, bekommt einen leuchtenden Messingrahmen; ist er nicht zu sehen, scrollt die Ansicht hin.
- Fortschrittspunkte, Zurück, Weiter, Überspringen und „Tipps aus“ (schaltet alle Kapitel ab). Unter Kontor → Übersicht → Einführung lässt sich jedes Kapitel neu abspielen.
- Verlässt man den Bereich, ruht das Kapitel und geht beim Zurückkommen weiter. Während ein Ereignis oder ein Fenster offen ist, wartet die Einführung.
- PC: Fenster 760 px breit, unten mittig im Hauptbereich zwischen den Leisten, Text 17 px, Berater-Bild 96 px. Eingabetaste = Weiter, Esc = Überspringen. Handy: Text 15,5 px, Bild 56 px, über der Navigation.

## 4. Musik

| Spiel | Titel | Einsatz |
|---|---|---|
| `mus0` | Hamburger Hafen 1880 (Remaster) | Titelmusik wie bisher |
| `mus1` | Dampf über den Atlantik (Remaster) | Playlist |
| `mus6`, `mus7` | Hafenkneipe, Hafenkneipe (Variante) | Playlist |
| `mus8`, `mus9` | Sommer im Seebad, Sommer im Seebad (Variante) | Playlist, Mai bis September doppelt so oft |
| `mus10`, `mus11` | Abschied der Auswanderer, Abschied der Auswanderer (Variante) | Playlist, nach der Meldung „Auswandererwelle“ als nächstes Stück |

Die Playlist wählt jetzt zufällig ohne direkte Wiederholung. Komprimiert mit `tools/musik.py` (96 kbit/s AAC, um −20 LUFS wie die übrigen). Die Originale liegen in `originale/musik/`.

## 5. Spielstände und Oberfläche

- Speicherschlüssel unverändert. Neue Felder über `E.migrate`: `s.bo` (Börse), `staff.pk` (Prokurist), `s.tut.ch` und `s.tut.cur` (Kapitel), `cat` an jeder Meldung. Getestet mit Spielständen aus v4.4.3 und v4.5.
- Kontor-Reiter: Übersicht, Statistik, Einkauf, Personal, Börse. Am PC zeigt die linke Leiste den Depotwert.
- Alle Texte auf Deutsch, Englisch und Spanisch. Britischer Heimathafen: Beträge in Pfund, Zechen in Südwales, britische Namen.
- 8 neue Bilder aus zwei Bildbögen (siehe `originale/LIESMICH.md`).

## 6. Simulation

`node tools/simulation.js` hat drei neue Prüfungen. Die Bots führen wie in v4.5 je Linienart eine kleine Reederei über 40 Betriebsjahre, je Strategie 24 Läufe, insgesamt 2.640 Spiele in rund sieben Minuten. Für die Börse legen sie zum Start 1 Mio. Mark an. Verglichen wird der Mehrgewinn gegenüber „nichts anfassen“ (Dividenden, realisierte und offene Kursgewinne, abzüglich Gebühren und Gehalt) je Jahr, bezogen auf das angelegte Geld.

### Nur Aktien gegen eine gut geführte Reederei

| Linienart | Reederei: Jahresgewinn auf den Flottenwert | Nur Aktien: im Jahr |
|---|---|---|
| Fähre | +10,2 % | +8,0 % |
| Küste und Bäder | +3,9 % | +7,9 % |
| Nord- und Ostsee | +23,2 % | +8,2 % |
| Hochsee | +38,1 % | +7,9 % |
| Vergnügungsreise | +59,6 % | +4,4 % (erst ab 1891) |
| **Schnitt** | **+27,0 %** | **+7,3 %** |

Ziel erreicht: Aktien bringen im Schnitt deutlich weniger. Nur die Bäderlinie der Bots verdient auf ihren Flottenwert weniger als ein Depot.

### Hauszeche gegen breites Depot

| Linienart | Kohle im Jahr | breites Depot | 51 % einer Zeche |
|---|---|---|---|
| Fähre | 37.000 M | +8,0 % | +8,7 % |
| Küste und Bäder | 95.000 M | +7,9 % | +10,1 % |
| Vergnügungsreise | 312.000 M | +4,4 % | +12,0 % |
| Nord- und Ostsee | 413.000 M | +8,2 % | +16,3 % |
| Hochsee | 1.638.000 M | +7,9 % | +24,6 % |

Ziel erreicht: Für kleine Flotten bringt die Hauszeche kaum mehr als ein breites Depot, trägt aber das ganze Risiko einer einzigen Zeche. Ab etwa 300.000 Mark Kohle im Jahr lohnt sie sich deutlich, bei großen Flotten bremst die Förderung der Zeche den Rabatt.

### Prokurist gegen breites Depot (je 1 Mio. Mark, ausgewogen)

| Linienart | breites Depot | knapp | Tarif | sehr gut | sehr gut vor Gehalt und Beteiligung |
|---|---|---|---|---|---|
| Fähre | +8,0 % | +4,9 % | +6,5 % | +8,9 % | +11,3 % |
| Küste und Bäder | +7,9 % | +4,2 % | +5,5 % | +7,6 % | +9,9 % |
| Nord- und Ostsee | +8,2 % | +5,0 % | +6,2 % | +8,6 % | +10,9 % |
| Hochsee | +7,9 % | +5,2 % | +6,7 % | +9,4 % | +11,8 % |
| Vergnügungsreise | +4,4 % | +2,6 % | +3,7 % | +5,1 % | +7,6 % |

Ziel erreicht: Knapp bezahlt liegt er etwa 3 Punkte unter dem Markt, Tarif etwa 1,5 Punkte darunter, sehr gut bezahlt nach Gehalt und Beteiligung leicht darüber (+0,5 bis +1,5 Punkte), vor Kosten klar darüber. Bei einem kleinen Depot frisst das Gehalt den Vorteil.

### Nichts anfassen: v4.6 gegen v4.5

Ø Kohlepreis v4.5 101,3 %, v4.6 101,7 %. Gewinn aller Linienarten zusammen +13,3 % ± 3,8 %: Wer die Börse ignoriert, steht nicht schlechter da, sondern besser, weil der zufällige Börsenkrach viel seltener kommt (siehe Krisen). Ohne die geänderten Krisen laufen die 40-Jahre-Spiele bitgleich wie v4.5.

Die übrigen Prüfungen aus v4.5 (Fahrstufe, Verpflegung, Lieferverträge) erreichen ihre Ziele weiter: keine Fahrstufe und keine Verpflegung ist überall die beste, Verträge lohnen sich in 5 von 20 Fällen.

### Was die Simulation geändert hat

| Wert | Startwert | Endwert | Grund |
|---|---|---|---|
| Wachstum der Firmengewinne | 2,5 % im Jahr | 1,2 % im Jahr | nur Aktien brachten sonst 10 bis 11 % im Jahr, fast so viel wie eine gute Linie |
| Prokurist: Einschätzung | nur Trend, Irrtum jeden Monat neu | Trend und Abstand zum inneren Wert, Irrtum ändert sich langsam | mit jedes Mal neuem Irrtum schichtete er ständig um und verlor über die Gebühren 3 % im Jahr, selbst sehr gut bezahlt |
| Prokurist: Umschichten | monatlich (knapp), sonst vierteljährlich | immer vierteljährlich, erst ab 5 % Abweichung | knapp bezahlt verlor er sonst fast das ganze Depot |
| Prokurist: höchster Anteil | – | 25 % des Depots, 12 % einer Firma | sonst steckte er alles in einen Wert und zahlte große Paketaufschläge |
| Zufälliger Börsenkrach | Gewicht 0,35 | Gewicht 0,12 | mit 0,35 kamen in 80 Jahren noch rund 6 bis 7 zufällige Krachs, jetzt rund 3 |
