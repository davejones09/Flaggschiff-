# Flaggschiff – Regeln für Claude Code

## Das Projekt
- Reederei-Managementspiel: eine Reederei für Personenschifffahrt ab 1880 durch die Jahrzehnte führen.
- Läuft als Web-App (PWA) über GitHub Pages, gespielt auf iPhone und am PC. Aktueller Stand: v4.6.
- Sprachen: Deutsch (Original), Englisch, Spanisch über das eigene Übersetzungssystem (I18N_CORE, I18N_EN, I18N_ES). Neue Texte immer in allen drei Sprachen pflegen.
- Heimathäfen Hamburg, Liverpool, London. Bei britischem Heimathafen Pfund statt Mark (die Währung hängt am Heimathafen, nicht an der Sprache).
- Hausstil: Nachtblau und Messing, weißer achtzackiger Stern. Grafik vollwertig 2D in hoher Auflösung, keine Pixelart, kein 3D.
- Ein Spiel für alle Geräte: Handy-Layout unter 1100 px Breite, PC-Layout ab 1100 px (Seitenleisten, Maschinentelegraf oben, Tastatur: Leertaste, 0–3, Bereichstasten, 1–9, Esc).
- Spielstände müssen nach jedem Update ladbar bleiben (Migration über E.migrate, Speicherschlüssel nicht ändern: `flaggschiff-proto-1880`, `flaggschiff-lang`).
- Das Repo ist öffentlich: keine persönlichen Daten in Code, Commits oder Doku.

## Ordner
- `index.html`, `css/`, `js/`, `assets/`: das Spiel (nach dem Umbau in der ersten Sitzung).
- `assets/`: Bilder als WebP, Musik als M4A, so komprimiert, dass die App auf dem iPhone schnell lädt.
- `originale/`: hochauflösende Bildbögen und Musik-Originale samt `LIESMICH.md` mit der Zuordnung Bildbogen → Spielbild. Nur als Quelle zum Neu-Zuschneiden, nicht in `sw.js` cachen.
- `neue-bilder/`, `neue-musik/`: hier lädt David neue Bilder und Musik hoch. Nach der Übernahme nach `originale/` verschieben. Was in `neue-bilder/spaeter/` liegt, ist für ein späteres Update und bleibt dort, bis ein Auftrag es nennt.
- `docs/`: Updatelog (`updatelog.md`, `Updatelog.pdf`) und Konzepte (`konzept-v4.5.md` und `konzept-v4.6.md` mit den Zahlen und Simulationsergebnissen von „Kohle und Küche“ und „Zeitung, Börse und Einführung“).
- `tools/`: Hilfsskripte (Python, dazu ein Node-Skript). `assets.py` erzeugt `js/assets.js` (nach jeder Änderung in `assets/` ausführen), `bilder.py` schneidet die Spielbilder aus `originale/` (Rahmen in `tools/zuschnitt.json`), `musik.py` komprimiert die Musik, `icons.py` erzeugt die App-Icons aus `originale/icon/app-icon.png`, `updatelog_pdf.py` baut aus `docs/updatelog.md` das PDF. `simulation.js` prüft die Balance: Bots spielen jede Linienart 40 Jahre mit verschiedenen Strategien (`node tools/simulation.js`, einige Minuten; nach Änderungen an Zahlen der Engine laufen lassen).

## Ablauf bei Updates
1. Bevor gebaut wird: sagen, welche neuen Bilder gebraucht werden (Motiv, Format, Dateiname).
2. David lädt die Bilder auf GitHub in den Ordner `neue-bilder/` hoch und schreibt „Bereit für Update".
   Dann zuerst `git pull origin main`, die Bilder prüfen, passend komprimieren und nach `assets/` übernehmen.
3. Erst bauen, wenn David „Updaten" schreibt.
4. Testen: Handy- und PC-Format, Deutsch, Englisch und Spanisch, keine JavaScript-Fehler, ein alter Spielstand lädt noch.
5. Versionsnummer erhöhen und den CACHE-Namen in `sw.js` ändern, damit die App das Update holt.
6. Updatelog fortschreiben (`docs/updatelog.md`) und als PDF ausgeben (`docs/Updatelog.pdf`): alle Versionen, neueste am Ende.
   Dafür `python3 tools/updatelog_pdf.py`. Eine Tester-Ausgabe für Emil gibt es nicht mehr, er kennt das Easter Egg.
7. Am Ende einen Pull Request auf `main` erstellen. David merged selbst.

## Kommunikation
- Lockeres Deutsch, kurz und klar.
- Bei größeren Umbauten erst einen Plan zeigen.
