#!/usr/bin/env python3
"""Erzeugt js/assets.js aus den Dateien in assets/img (WebP) und assets/music (M4A).

Aufruf im Hauptordner:  python3 tools/assets.py
Immer ausführen, wenn in assets/ ein Bild oder Musikstück dazukommt oder sich ändert.

Jede Datei bekommt eine Prüfsumme als ?v=… angehängt. Ändert sich eine Datei, ändert sich
ihre Adresse, und die App lädt nur diese Datei neu; alles andere bleibt im Speicher des
Service Workers (sw.js) und muss nach einem Update nicht noch einmal geladen werden.
"""
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

entries = []
for sub, ext in (("img", ".webp"), ("music", ".m4a")):
    folder = os.path.join(ROOT, "assets", sub)
    for name in sorted(os.listdir(folder)):
        if not name.endswith(ext):
            continue
        with open(os.path.join(folder, name), "rb") as f:
            digest = hashlib.sha1(f.read()).hexdigest()[:10]
        entries.append((name[: -len(ext)], f"assets/{sub}/{name}?v={digest}"))

keys = [k for k, _ in entries]
dupes = sorted({k for k in keys if keys.count(k) > 1})
if dupes:
    raise SystemExit("Doppelte Namen in assets/: " + ", ".join(dupes))

body = ",\n".join(f"  {json.dumps(k)}: {json.dumps(u)}" for k, u in entries)
js = ("/* Bilder und Musik des Spiels: Schlüssel -> Datei. Erzeugt von tools/assets.py, nicht von Hand ändern.\n"
      "   Wird von der Seite und vom Service Worker (sw.js) geladen, deshalb self statt window. */\n"
      "self.ASSETS = {\n" + body + "\n};\n")
with open(os.path.join(ROOT, "js", "assets.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write(js)
print(len(entries), "Dateien in js/assets.js")
