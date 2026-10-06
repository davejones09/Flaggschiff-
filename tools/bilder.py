#!/usr/bin/env python3
"""Schneidet die Spielbilder aus den Bildbögen in originale/bilder/ zu und speichert sie als WebP in assets/img/.

Aufruf im Hauptordner:
  python3 tools/bilder.py                  alle Bilder aus tools/zuschnitt.json
  python3 tools/bilder.py gb_dover ev_feuer   nur diese
Braucht Pillow (pip install pillow). Danach wird js/assets.js automatisch neu erzeugt.

tools/zuschnitt.json:  Schlüssel -> {"bogen": "D31C83D3", "rahmen": [x, y, breite, höhe]}   (Pixel im Bogen)
  optional "leeren": [[x, y, breite, höhe], ...]  Bereiche im Ausschnitt durchsichtig machen (Nachbarteile im Baukasten)
Neues Bild: Bogen nach originale/bilder/, Rahmen eintragen, Skript laufen lassen, Zuordnung in originale/LIESMICH.md ergänzen.

Bilder werden in der vollen Auflösung des Bogens geschnitten (nie hochgerechnet), höchstens MAX_BREITE breit,
als WebP mit QUALITAET. Baukasten-Teile (kit_*) behalten ihre Transparenz.
"""
import json
import os
import runpy
import sys

from PIL import Image

QUALITAET = 80
MAX_BREITE = 1200

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABELLE = json.load(open(os.path.join(ROOT, "tools", "zuschnitt.json"), encoding="utf-8"))


def schneide(key, e):
    bogen = Image.open(os.path.join(ROOT, "originale", "bilder", f"bogen_{e['bogen']}.webp"))
    alpha = key.startswith("kit_")
    x, y, w, h = e["rahmen"]
    if x < 0 or y < 0 or x + w > bogen.width or y + h > bogen.height:
        raise SystemExit(f"{key}: Rahmen liegt außerhalb des Bogens {e['bogen']} ({bogen.width}×{bogen.height})")
    bild = bogen.convert("RGBA" if alpha else "RGB").crop((x, y, x + w, y + h))
    for lx, ly, lw, lh in e.get("leeren", []):
        bild.paste((0, 0, 0, 0), (lx, ly, lx + lw, ly + lh))
    if w > MAX_BREITE:
        bild = bild.resize((MAX_BREITE, round(h * MAX_BREITE / w)), Image.LANCZOS)
    ziel = os.path.join(ROOT, "assets", "img", f"{key}.webp")
    bild.save(ziel, "WEBP", quality=QUALITAET, method=6, **({"alpha_quality": 100} if alpha else {}))
    return bild.size, os.path.getsize(ziel)


def main(keys):
    unbekannt = [k for k in keys if k not in TABELLE]
    if unbekannt:
        raise SystemExit("Nicht in tools/zuschnitt.json: " + ", ".join(unbekannt))
    summe = 0
    for key in keys or sorted(TABELLE):
        (w, h), n = schneide(key, TABELLE[key])
        summe += n
        print(f"{key:20s} {w:5d} × {h:<5d} {n / 1024:6.1f} KB")
    print(f"{len(keys or TABELLE)} Bilder, zusammen {summe / 1e6:.2f} MB")
    runpy.run_path(os.path.join(ROOT, "tools", "assets.py"), run_name="__main__")


if __name__ == "__main__":
    main(sys.argv[1:])
