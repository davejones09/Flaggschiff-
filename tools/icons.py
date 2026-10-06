#!/usr/bin/env python3
"""Erzeugt die App-Icons aus originale/icon/app-icon.png (quadratisch, Goldrahmen mit runden Ecken auf weißem Grund).

Aufruf im Hauptordner:  python3 tools/icons.py      (braucht Pillow und numpy)

  apple-touch-icon.png   180 px  iPhone-Homescreen: mit Goldrahmen; iOS rundet selbst ab, der weiße Rand außen
                                 wird golden gefüllt, damit in den Ecken nichts Weißes durchscheint
  icon-192.png, icon-512.png     Browser-Tab, Android, PC: mit Goldrahmen, Ecken durchsichtig
  icon-maskable-512.png  512 px  Android schneidet selbst rund oder abgerundet aus: ohne Rahmen, Bild auf 88 % verkleinert,
                                 damit im sicheren Kreis (80 %) das ganze Schiff bleibt; der Rand setzt das Bild fort
Danach CACHE-Namen in sw.js ändern. Auf dem iPhone erscheint ein neues Icon erst, wenn die Web-App neu
zum Home-Bildschirm hinzugefügt wird (vorher Spielstand exportieren).
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img = Image.open(os.path.join(ROOT, "originale", "icon", "app-icon.png")).convert("RGB")
W, H = img.size
a = np.asarray(img).astype(np.int16)

# Weißer Hintergrund = fast weiß und mit dem Bildrand verbunden (Wolken im Bild bleiben unberührt)
marker = img.copy()
for seed in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)):
    ImageDraw.floodfill(marker, seed, (255, 0, 255), thresh=40)
bg = np.all(np.asarray(marker) == (255, 0, 255), axis=2)
ys, xs = np.where(~bg)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()

# Eckradius des Rahmens: Kreisbogen an die linke Kante der oberen Zeilen anpassen
def fehler(r):
    e = []
    for y in range(y0, y0 + r, 4):
        inside = np.where(~bg[y])[0]
        if len(inside):
            dy = y0 + r - y
            e.append((inside.min() - (x0 + r - np.sqrt(max(r * r - dy * dy, 0)))) ** 2)
    return np.mean(e)
R = min(range(int((x1 - x0) * .1), int((x1 - x0) * .4), 2), key=fehler)


def rundrechteck(inset, scale=1, mehr_rund=0):
    m = Image.new("L", (W * scale, H * scale), 0)
    ImageDraw.Draw(m).rounded_rectangle([(x0 + inset) * scale, (y0 + inset) * scale, (x1 - inset) * scale, (y1 - inset) * scale],
                                        radius=max(R - inset + mehr_rund, 1) * scale, fill=255)
    return m.resize((W, H), Image.LANCZOS) if scale > 1 else m


ring = (np.asarray(rundrechteck(4)) > 0) & ~(np.asarray(rundrechteck(12)) > 0)
gold = np.median(a[ring], axis=0).astype(np.uint8)
seite = max(x1 - x0 + 1, y1 - y0 + 1)
cx, cy = (x0 + x1 + 1) / 2, (y0 + y1 + 1) / 2
box = tuple(int(round(v)) for v in (cx - seite / 2, cy - seite / 2, cx + seite / 2, cy + seite / 2))


def speichern(bild, name, groesse):
    bild.resize((groesse, groesse), Image.LANCZOS).save(os.path.join(ROOT, name), optimize=True)
    print(f"{name:24s} {groesse} px  {os.path.getsize(os.path.join(ROOT, name)) / 1024:6.1f} KB")


# iPhone: Rahmen bleibt, außen golden
voll = np.asarray(img).copy()
voll[bg] = gold
speichern(Image.fromarray(voll).crop(box), "apple-touch-icon.png", 180)

# Browser, Android, PC: Rahmen bleibt, Ecken durchsichtig (Maske leicht nach innen, damit kein weißer Saum bleibt)
mit_alpha = img.copy()
mit_alpha.putalpha(rundrechteck(1.5, scale=4))
mit_alpha = mit_alpha.crop(box)
speichern(mit_alpha, "icon-192.png", 192)
speichern(mit_alpha, "icon-512.png", 512)

# Android maskable: Innenbild ohne Rahmen; die runden Ecken außerhalb des Bildes von innen her auffüllen
t = round(seite * .02)  # Rahmenbreite mit etwas Luft
innen = np.asarray(rundrechteck(t, mehr_rund=60)) > 0  # in den Ecken ist der Rahmen breiter: dort weiter innen bleiben


def auffuellen(rgb, known):
    """Push-Pull: Lücken mit den Farben der Umgebung füllen (Mittelwert-Pyramide)."""
    w = known.astype(np.float64)
    c = rgb.astype(np.float64) * w[..., None]
    stufen = []
    while min(w.shape) > 1:
        stufen.append((c, w))
        h2, w2 = (w.shape[0] + 1) // 2 * 2, (w.shape[1] + 1) // 2 * 2
        c = np.pad(c, ((0, h2 - c.shape[0]), (0, w2 - c.shape[1]), (0, 0)))
        w = np.pad(w, ((0, h2 - w.shape[0]), (0, w2 - w.shape[1])))
        c = c.reshape(h2 // 2, 2, w2 // 2, 2, 3).sum((1, 3))
        w = w.reshape(h2 // 2, 2, w2 // 2, 2).sum((1, 3))
    farbe = c / np.maximum(w, 1e-9)[..., None]
    for c, w in reversed(stufen):
        grob = np.asarray(Image.fromarray(farbe.clip(0, 255).astype(np.uint8)).resize((w.shape[1], w.shape[0]), Image.BILINEAR)).astype(np.float64)
        farbe = np.where((w > 0)[..., None], c / np.maximum(w, 1e-9)[..., None], grob)
    return farbe.clip(0, 255).astype(np.uint8)


gefuellt = auffuellen(np.asarray(img), innen)
weich = np.asarray(Image.fromarray(gefuellt).filter(ImageFilter.GaussianBlur(6)))
gefuellt = np.where(innen[..., None], np.asarray(img), weich)
ix0, iy0, ix1, iy1 = x0 + t, y0 + t, x1 - t + 1, y1 - t + 1
s = min(ix1 - ix0, iy1 - iy0)
mx, my = (ix0 + ix1 - s) // 2, (iy0 + iy1 - s) // 2
# Android zeigt sicher nur einen Kreis mit 80 % Durchmesser: Bild auf 88 % verkleinern, Rand aus dem Bild heraus fortsetzen
quad = np.asarray(Image.fromarray(gefuellt).crop((mx, my, mx + s, my + s)))
G = round(s / .88)
off = (G - s) // 2
leinwand = np.zeros((G, G, 3), np.uint8)
bekannt = np.zeros((G, G), bool)
leinwand[off:off + s, off:off + s] = quad
bekannt[off:off + s, off:off + s] = True
rand = np.asarray(Image.fromarray(auffuellen(leinwand, bekannt)).filter(ImageFilter.GaussianBlur(10)))
speichern(Image.fromarray(np.where(bekannt[..., None], leinwand, rand)), "icon-maskable-512.png", 512)
print(f"Rahmen {x0}–{x1} × {y0}–{y1}, Eckradius {R} px, Gold {tuple(int(v) for v in gold)}")
