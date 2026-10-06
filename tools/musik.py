#!/usr/bin/env python3
"""Komprimiert die Musik-Originale aus originale/musik/ fürs Spiel nach assets/music/ (AAC in M4A).

Aufruf im Hauptordner:  python3 tools/musik.py      (braucht ffmpeg)
Danach wird js/assets.js automatisch neu erzeugt.

- 96 kbit/s AAC, Stereo, 44,1 kHz; Titelbilder aus den MP3s fliegen raus.
- „faststart“: Die Datei beginnt mit dem Inhaltsverzeichnis, so spielt sie schon während des Ladens.
- Lautstärke: Jedes Stück wird mit einer festen Absenkung auf seinen Zielwert gebracht (so laut wie bisher im Spiel).
  Keine Kompression, die Dynamik bleibt.
Neues Stück: Datei nach originale/musik/, Zeile in STUECKE ergänzen (Zielwert um −20 LUFS), in js/ui.js bei TRACKS eintragen.
"""
import os
import re
import runpy
import subprocess

BITRATE = "96k"
STUECKE = {  # Spiel-Schlüssel: (Datei in originale/musik/, Ziel-Lautheit in LUFS)
    "mus0": ("Hamburger_Hafen_1880.mp3", -20.3),
    "mus1": ("Dampf_u_ber_den_Atlantik.m4a", -21.1),
    "mus2": ("Walzer_auf_dem_Ozean.mp3", -20.2),
    "mus3": ("ruhige_Nachtfahrt.mp3", -19.8),
    "mus4": ("Walzer_auf_dem_Ozean_2.mp3", -19.9),
    "mus5": ("ruhige_Nachtfahrt_2.mp3", -20.2),
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def lautheit(pfad):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", pfad, "-map", "0:a:0", "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])


for key, (datei, ziel) in STUECKE.items():
    quelle = os.path.join(ROOT, "originale", "musik", datei)
    aus = os.path.join(ROOT, "assets", "music", f"{key}.m4a")
    gain = ziel - lautheit(quelle)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", quelle, "-map", "0:a:0", "-vn",
                    "-af", f"volume={gain:.2f}dB", "-ar", "44100", "-ac", "2", "-c:a", "aac", "-b:a", BITRATE,
                    "-map_metadata", "-1", "-movflags", "+faststart", aus], check=True)
    print(f"{key}: {datei:32s} {gain:+5.1f} dB -> {lautheit(aus):5.1f} LUFS, {os.path.getsize(aus) / 1e6:.2f} MB")
runpy.run_path(os.path.join(ROOT, "tools", "assets.py"), run_name="__main__")
