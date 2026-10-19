# Neue Musik für v4.6

Alle Stücke sind Instrumentals aus Suno (MP3, etwa 190 kbit/s, etwa −16 LUFS). Nach der Übernahme nach `originale/musik/` verschieben, in `tools/musik.py` bei `STUECKE` eintragen (Ziel um −20 LUFS wie die übrigen) und in `js/ui.js` bei `TRACKS` ergänzen. Titel in allen drei Sprachen.

## Remaster – ersetzen die alten Originale

Spiel-Schlüssel und Titel bleiben gleich, nur die Quelle wird getauscht. Die alten Dateien aus `originale/musik/` löschen.

| Datei | ersetzt | Schlüssel | Einsatz |
| --- | --- | --- | --- |
| `Hamburger_Hafen_1880_Remastered.mp3` | `Hamburger_Hafen_1880.mp3` | mus0 | Titelmusik auf dem Startbildschirm, wie bisher |
| `Dampf_ueber_den_Atlantik_Remastered.mp3` | `Dampf_u_ber_den_Atlantik.m4a` | mus1 | normale Playlist, wie bisher |

## Neue Stücke – jeweils beide Fassungen einbauen

Die zweite Fassung läuft wie bei „Walzer auf dem Ozean“ als eigener Titel mit dem Zusatz „(Variante)“, EN „(variation)“, ES „(variación)“.

| Dateien | Titel DE | EN | ES | Einsatz |
| --- | --- | --- | --- | --- |
| `Hafenkneipe.mp3`, `Hafenkneipe_2.mp3` | Hafenkneipe | Harbour Tavern | Taberna del puerto | normale Playlist |
| `Sommer_im_Seebad.mp3`, `Sommer_im_Seebad_2.mp3` | Sommer im Seebad | Summer at the Seaside | Verano en el balneario | normale Playlist, von Mai bis September doppelt so oft |
| `Abschied_der_Auswanderer.mp3`, `Abschied_der_Auswanderer_2.mp3` | Abschied der Auswanderer | The Emigrants' Farewell | La despedida de los emigrantes | normale Playlist, nach der Meldung „Auswandererwelle“ als nächstes Stück |

Hafenkneipe ist mit 80 und 95 Sekunden kürzer als die übrigen Stücke, das ist so gewollt.

## Noch offen

Ostsee-Winter, Seenot, Salon der ersten Klasse, Nordlandfahrt, Mittelmeer-Vergnügungsreise und Schiffstaufe-Fanfare kommen später. Im Updatelog unter „Als Nächstes geplant“ nur die eingebauten Stücke streichen.
