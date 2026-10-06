#!/usr/bin/env python3
"""Baut aus docs/updatelog.md die beiden PDFs:

  docs/Updatelog.pdf       vollständig
  docs/Updatelog_Emil.pdf  Tester-Ausgabe für Emil: alles zum Easter Egg um Kapitän Emil geschwärzt

Aufruf im Hauptordner:  python3 tools/updatelog_pdf.py     (braucht reportlab: pip install reportlab)

Aufbau von docs/updatelog.md:
  # Updatelog                         Titel, darunter eine kursive Zeile (*…*) und ein Absatz
  ## v4.4 · Español · aktuell         Version · Titel, „· aktuell“ nur bei der neuesten Version
  *Kurzbeschreibung*                  kursive Zeile unter der Version
  **NEU**                             Abschnitte: NEU, GEÄNDERT, BEHOBEN, BALANCE, ÜBERNOMMEN
  - Punkt                             ein Punkt pro Zeile
  ## Als Nächstes geplant             Überschrift ohne Version

Alles zum Easter Egg um Kapitän Emil steht zwischen <!--emil--> und <!--/emil-->. In der
Tester-Ausgabe wird es durch schwarze Balken ersetzt; der Text selbst steht dann nicht im PDF.
"""
import os
import re
import struct
import tempfile
import zlib

from reportlab import rl_config
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer, Table,
                                TableStyle)
from reportlab.platypus.flowables import HRFlowable

rl_config.invariant = 1  # gleiche Eingabe ergibt die gleiche Datei

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = os.path.join(ROOT, "docs", "updatelog.md")

INK, BRASS, MUTED, RULE = HexColor("#13294B"), HexColor("#B08D57"), HexColor("#5A6478"), HexColor("#9AA0AA")

# Schriften: Liberation (wie bisher), sonst die eingebauten PDF-Schriften
FONT_DIRS = ["/usr/share/fonts/truetype/liberation", "/usr/share/fonts/liberation", "/Library/Fonts", "C:/Windows/Fonts"]
FONTS = {"serif-b": ("LiberationSerif-Bold.ttf", "Times-Bold"), "serif-i": ("LiberationSerif-Italic.ttf", "Times-Italic"),
         "sans": ("LiberationSans-Regular.ttf", "Helvetica"), "sans-b": ("LiberationSans-Bold.ttf", "Helvetica-Bold")}
F = {}
for key, (ttf, builtin) in FONTS.items():
    path = next((os.path.join(d, ttf) for d in FONT_DIRS if os.path.exists(os.path.join(d, ttf))), None)
    if path:
        pdfmetrics.registerFont(TTFont(ttf[:-4], path))
        F[key] = ttf[:-4]
    else:
        F[key] = builtin

ST = {
    "title": ParagraphStyle("title", fontName=F["serif-b"], fontSize=24, leading=28, textColor=INK, spaceAfter=2),
    "subtitle": ParagraphStyle("subtitle", fontName=F["serif-i"], fontSize=11, leading=14, textColor=MUTED, spaceAfter=10),
    "intro": ParagraphStyle("intro", fontName=F["sans"], fontSize=9.5, leading=13, textColor=INK, spaceAfter=12),
    "vtitle": ParagraphStyle("vtitle", fontName=F["serif-b"], fontSize=15.5, leading=18.5, textColor=INK),
    "vsub": ParagraphStyle("vsub", fontName=F["serif-i"], fontSize=10, leading=13, textColor=MUTED, spaceBefore=3, spaceAfter=4),
    "label": ParagraphStyle("label", fontName=F["sans-b"], fontSize=9, leading=12, textColor=BRASS, spaceBefore=5, spaceAfter=2),
    "bullet": ParagraphStyle("bullet", fontName=F["sans"], fontSize=9, leading=12, textColor=INK, leftIndent=11,
                             bulletIndent=1, bulletFontName=F["sans"], bulletFontSize=9, bulletColor=BRASS),
    "badge": ParagraphStyle("badge", fontName=F["sans-b"], fontSize=9.5, leading=11, textColor=white, alignment=1),
}

def _chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


BLACK_PNG = os.path.join(tempfile.mkdtemp(), "schwarz.png")
with open(BLACK_PNG, "wb") as f:  # 1×1 Pixel schwarz für die Schwärzungen
    f.write(b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
            + _chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00")) + _chunk(b"IEND", b""))


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline(text, style, emil):
    """Markdown-Text -> ReportLab-Markup; Emil-Stellen entfernen oder schwärzen."""
    out, pos = [], 0
    for m in re.finditer(r"<!--emil-->(.*?)<!--/emil-->", text):
        out.append(esc(text[pos:m.start()]))
        if emil:
            bars = []
            for word in m.group(1).split():
                w = pdfmetrics.stringWidth(word, style.fontName, style.fontSize)
                bars.append(f'<img src="{BLACK_PNG}" width="{w:.1f}" height="{style.fontSize * 0.95:.1f}" valign="-1.5"/>')
            out.append(" ".join(bars))
        else:
            out.append(esc(m.group(1)))
        pos = m.end()
    out.append(esc(text[pos:]))
    return "".join(out)


def parse():
    doc = {"title": "", "subtitle": "", "intro": [], "blocks": []}
    cur = None
    for raw in open(MD, encoding="utf-8").read().splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("# "):
            doc["title"] = line[2:]
        elif line.startswith("## "):
            parts = line[3:].split(" · ")
            current = parts[-1] == "aktuell"
            if current:
                parts = parts[:-1]
            if re.match(r"v\d", parts[0]):
                cur = {"version": parts[0], "title": " · ".join(parts[1:]), "current": current, "sub": "", "items": []}
            else:
                cur = {"version": None, "title": " · ".join(parts), "current": False, "sub": "", "items": []}
            doc["blocks"].append(cur)
        elif re.fullmatch(r"\*[^*].*\*", line):
            if cur is None:
                doc["subtitle"] = line[1:-1]
            else:
                cur["sub"] = line[1:-1]
        elif re.fullmatch(r"\*\*.+\*\*", line):
            cur["items"].append(("label", line[2:-2]))
        elif line.startswith("- "):
            cur["items"].append(("bullet", line[2:]))
        elif cur is None:
            doc["intro"].append(line)
        else:
            cur["items"].append(("text", line))
    return doc


def story(doc, emil):
    s = [Paragraph(esc(doc["title"]), ST["title"]), Paragraph(inline(doc["subtitle"], ST["subtitle"], emil), ST["subtitle"])]
    s += [Paragraph(inline(t, ST["intro"], emil), ST["intro"]) for t in doc["intro"]]
    for i, b in enumerate(doc["blocks"]):
        head = []
        if b["version"]:
            title = inline(b["title"], ST["vtitle"], emil)
            if b["current"]:
                title += f'<font name="{F["serif-b"]}" size="9" color="#B08D57"> · aktuell</font>'
            t = Table([[Paragraph(esc(b["version"]), ST["badge"]), Paragraph(title, ST["vtitle"])]], colWidths=[22 * mm, None])
            t.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, 0), BRASS if b["current"] else INK), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                                   ("LEFTPADDING", (0, 0), (0, 0), 2), ("RIGHTPADDING", (0, 0), (0, 0), 2),
                                   ("TOPPADDING", (0, 0), (0, 0), 3.5), ("BOTTOMPADDING", (0, 0), (0, 0), 3.5),
                                   ("LEFTPADDING", (1, 0), (1, 0), 9)]))
            t.hAlign = "LEFT"
            head.append(t)
        else:
            head.append(Paragraph(inline(b["title"], ST["vtitle"], emil), ST["vtitle"]))
        if b["sub"]:
            head.append(Paragraph(inline(b["sub"], ST["vsub"], emil), ST["vsub"]))
        body = []
        for kind, text in b["items"]:
            if kind == "label":
                body.append(Paragraph(esc(text.upper()), ST["label"]))
            elif kind == "bullet":
                body.append(Paragraph(inline(text, ST["bullet"], emil), ST["bullet"], bulletText="•"))
            else:
                body.append(Paragraph(inline(text, ST["intro"], emil), ST["intro"]))
        # Kopf nie allein am Seitenende: mit den ersten Zeilen zusammenhalten
        s.append(KeepTogether(head + body[:3]))
        s += body[3:]
        last = i == len(doc["blocks"]) - 1
        if not last:
            nxt = doc["blocks"][i + 1]
            s.append(HRFlowable(width="100%", thickness=0.7, color=RULE if nxt["version"] else BRASS, spaceBefore=8, spaceAfter=12))
    return s


def build(out, emil):
    right = "Updatelog des spielbaren Prototyps" + (" · Tester-Ausgabe" if emil else "")

    def page(c, d):
        w, h = A4
        c.saveState()
        c.setFillColor(INK)
        c.rect(0, h - 17 * mm, w, 17 * mm, stroke=0, fill=1)
        c.setFillColor(BRASS)
        c.rect(0, h - 17.8 * mm, w, 0.8 * mm, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont(F["serif-b"], 11)
        c.drawString(20 * mm, h - 10.4 * mm, "FLAGGSCHIFF")
        c.setFont(F["sans"], 7.5)
        c.drawRightString(w - 20 * mm, h - 10.2 * mm, right)
        c.setFillColor(MUTED)
        c.setFont(F["sans"], 7)
        c.drawCentredString(w / 2, 12 * mm, f"Seite {d.page}")
        c.restoreState()

    d = BaseDocTemplate(out, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=29 * mm, bottomMargin=22 * mm,
                        title="Flaggschiff – Updatelog" + (" (Tester-Ausgabe)" if emil else ""),
                        subject="Änderungen aller Versionen", author="Flaggschiff-Prototyp", creator="tools/updatelog_pdf.py")
    frame = Frame(d.leftMargin, d.bottomMargin, d.width, d.height, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    d.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=page)])
    d.build(story(parse(), emil))


if __name__ == "__main__":
    build(os.path.join(ROOT, "docs", "Updatelog.pdf"), emil=False)
    build(os.path.join(ROOT, "docs", "Updatelog_Emil.pdf"), emil=True)
    print("docs/Updatelog.pdf und docs/Updatelog_Emil.pdf geschrieben")
