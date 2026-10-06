# Originale – Bildbögen und Musik

Hochauflösende Quellen für alle Spielbilder und die Musik. Nur zum Neu-Zuschneiden und Neu-Komprimieren, nicht direkt im Spiel laden und nicht in `sw.js` cachen.

- Bildbögen: `bilder/bogen_<ID>.webp`, WebP in hoher Qualität (aus den PNG-Originalen, ohne sichtbaren Verlust).
- Musik: `musik/`, die unveränderten Originaldateien.

## Zuordnung Bildbogen → Spielbild

Die genauen Ausschnitte (Rahmen in Pixeln des Bogens) stehen in `tools/zuschnitt.json`; `python3 tools/bilder.py` schneidet daraus alle Spielbilder neu (volle Auflösung des Bogens, höchstens 1200 px breit, WebP-Qualität 80). Die Rahmen wurden in v4.4.2 per automatischem Bildvergleich mit den Bildern aus v4.4 ermittelt; unsichere Treffer und alle Ergebnisse im Vergleich alt/neu wurden von Hand geprüft. Die Lage unten ist nur zur Orientierung.

### bogen_046D46DF.webp
- `ev_bergung` – Mitte rechts
- `ev_feuer` – oben rechts
- `ev_kessel` – Mitte links
- `ev_seenot` – oben links
- `ev_sturmwarnung` – unten, ganze Breite

### bogen_04FC6F4A.webp
- `ship_lusitania` – oben rechts
- `ship_nomadic` – unten rechts
- `ship_titanic` – unten links

### bogen_06DDC95A.webp
Unten links ungenutzt.
- `ship_o12` – oben links
- `ship_o24` – oben rechts
- `ship_o50` – unten rechts

### bogen_099D0330.webp
- `ev_erfolge` – unten rechts
- `ship_turbine` – unten links

### bogen_0DFCAEC5.webp
- `line_cux` – oben links
- `line_helgo` – oben rechts
- `line_kiel` – Mitte links
- `line_ny` – unten links
- `line_rot` – Mitte rechts

### bogen_1855C40C.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_1BFA3DD7.webp
Baukasten-Teile für den Fähren-Konfigurator, echte Transparenz. `kit_bg` (Himmel und Meer) stammt nicht von diesem Bogen; dafür gibt es kein Original, es bleibt das Bild aus v4.4.
- `kit_boote` – unten rechts
- `kit_fun_hoch` – unten links
- `kit_fun_motor` – unten links
- `kit_hull_l` – oben rechts
- `kit_hull_m` – oben Mitte
- `kit_hull_s` – oben links
- `kit_mast` – unten Mitte
- `kit_rad` – unten Mitte
- `kit_sup_haus` – Mitte links
- `kit_sup_salon` – Mitte
- `kit_sup_sonne` – Mitte rechts

### bogen_1E9CE06C.webp
- `cap_1` – oben links
- `cap_2` – oben Mitte
- `cap_3` – oben rechts
- `cap_4` – unten links
- `cap_5` – unten Mitte
- `cap_6` – unten rechts

### bogen_1F36143A.webp
- `ev_abwracken` – unten rechts
- `ship_f60` – oben links
- `ship_n60` – oben rechts
- `ship_o60` – unten links

### bogen_22D05053.webp
- `ship_komet` – ganzes Bild

### bogen_24ABA818.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_2C16173D.webp
- `cap_rostron` – oben rechts
- `cap_smith` – oben links
- `ev_traumkai` – unten rechts
- `ship_traum` – unten links

### bogen_2C2B7F74.webp
- `title` – ganzes Bild

### bogen_2F0A2901.webp
- `ship_kaiserbad` – oben rechts
- `ship_levante` – oben links
- `ship_sued` – unten rechts
- `ship_trajekt` – unten links

### bogen_334C5109.webp
- `ship_hafen` – ganzes Bild

### bogen_38D78243.webp
- `line_fuerte` – oben rechts
- `line_havanna` – unten rechts
- `line_kanaren` – oben Mitte
- `line_karibik` – unten Mitte
- `line_madeira` – oben links
- `line_mallorca` – unten links

### bogen_400A1EE3.webp
- `ship_carpathia` – oben rechts

### bogen_40C6067C.webp
- `ev_entwurf` – unten links
- `ev_hotelschiff` – oben rechts
- `ev_museumsschiff` – oben links
- `ev_radar` – unten rechts

### bogen_40C9517A.webp
- `riv_balt` – oben rechts
- `riv_brandt` – unten Mitte
- `riv_elbe` – oben Mitte
- `riv_kopen` – unten links
- `riv_themse` – unten rechts
- `riv_weser` – oben links

### bogen_410E22FB.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_41CEB3AC.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_49FF1D16.webp
- `ship_hansa` – ganzes Bild

### bogen_4B9E9196.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_4C9A01E0.webp
- `ship_moewe` – ganzes Bild

### bogen_4CEFA2EA.webp
- `ev_wrack` – ganzes Bild

### bogen_4F08213B.webp
- `ev_berater` – unten rechts
- `ship_american` – oben links

### bogen_55CDD656.webp
- `line_faehre` – unten rechts
- `line_insel` – oben links
- `line_neapel` – unten links
- `line_stockholm` – oben rechts

### bogen_56336410.webp
- `line_asien` – Mitte rechts
- `line_hafen` – oben links
- `line_kopen` – Mitte links
- `line_london` – Mitte rechts
- `line_norder` – oben rechts
- `line_nordland` – unten links
- `line_orient` – unten rechts
- `line_sued` – Mitte links

### bogen_65572DAA.webp
Ersatzbogen 1935 im Art-déco-Stil. Oben links Reserve.
- `ship_f35` – unten rechts
- `ship_n35` – oben rechts
- `ship_o35` – unten links

### bogen_66ABF5C8.webp
- `line_kanal` – ganzes Bild

### bogen_70CB5B18.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_806B7DBD.webp
- `pers_deck` – oben rechts
- `pers_inspektor` – oben links
- `pers_maschine` – unten links
- `pers_service` – unten rechts

### bogen_87C1F7B1.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_8E8507F4.webp
- `ship_n12` – oben links
- `ship_n24` – oben rechts
- `ship_n50` – unten rechts

### bogen_9072D2A6.webp
Ganzes Bild in voller Breite; bis v4.4.1 war das Spielbild seitlich erweitert, seit v4.4.2 ist das Schiff etwas größer im Bild.
- `ship_paris` – Mitte, ganze Breite

### bogen_926403F0.webp
- `ev_emil` – unten rechts
- `ship_nordsee` – unten links
- `ship_ostsee` – oben rechts
- `ship_seebad` – oben links

### bogen_970C9C9F.webp
- `ev_cholera` – Mitte links
- `ev_eis` – oben links
- `ev_gast` – Mitte links
- `ev_krise` – unten links
- `ev_post` – Mitte rechts
- `ev_streik` – oben rechts
- `ev_sturm` – Mitte rechts
- `ev_welle` – unten rechts

### bogen_9BCB8772.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_AFF422F4.webp
Die drei übrigen Schiffe sind frühere Fassungen oder Reserve: Carpathia, Nordsee-, Bäder- und Ostseedampfer stammen aus 400A1EE3 bzw. 926403F0 (bis v4.4.1 hier falsch zugeordnet).
- `ship_nacht` – unten rechts

### bogen_B20BCB8F.webp
- `ship_f12` – oben links
- `ship_f24` – oben rechts
- `ship_f50` – unten rechts

### bogen_C3A6AE0C.webp
- `ev_kohle` – oben links
- `ev_orden` – oben rechts
- `ev_presse` – unten rechts
- `ev_zoll` – unten links

### bogen_C6400F6A.webp
- `gb_clyde` – oben links
- `gb_holyhead` – oben rechts
- `gb_kanal` – unten links
- `gb_streik` – unten rechts

### bogen_CABEBE78.webp
- `mus_halle` – oben, ganze Breite
- `mus_maschinen` – unten, ganze Breite

### bogen_CC40F3D5.webp
Ganzes Bild in voller Breite; bis v4.4.1 war das Spielbild seitlich erweitert, seit v4.4.2 ist das Schiff etwas größer im Bild.
- `ship_augusta` – Mitte, ganze Breite

### bogen_CEE8C52B.webp
- `ship_kreuz` – unten links
- `ship_meteor` – Mitte rechts
- `ship_reichspost` – Mitte links
- `ship_watt` – oben links

### bogen_D00DCE21.webp
- `gb_liverpool` – ganzes Bild

### bogen_D31C83D3.webp
Das Liverpool-Motiv oben links wird nicht genutzt (dafür D00DCE21).
- `gb_douglas` – unten links
- `gb_dover` – oben rechts
- `gb_queenstown` – unten rechts

### bogen_DB0C6FDE.webp
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_DFDDAB21.webp
- `ev_brief` – unten rechts
- `ev_hochzeit` – unten links
- `ev_koenig` – oben links
- `ev_regatta` – oben rechts

### bogen_EAC9A2F7.webp
- `spec_eis` – oben links
- `spec_gent` – unten Mitte
- `spec_rekord` – oben Mitte
- `spec_retter` – oben rechts
- `spec_spar` – unten links
- `spec_watt` – unten rechts

### bogen_EE5F0284.webp
- `ev_makler` – unten, ganze Breite

### bogen_EFB0B6AF.webp
- `ev_blinde` – Mitte links
- `ev_eisgang` – unten links
- `ev_expo` – Mitte rechts
- `ev_hafenstreik` – Mitte rechts
- `ev_nebel` – oben links
- `ev_rettung` – oben rechts
- `ev_sturmflut` – unten rechts
- `ev_taufe` – Mitte links

### bogen_F46E0B32.webp
- `ev_brandtwerft` – oben links
- `ev_marktforschung` – oben rechts
- `ev_seeamt` – unten rechts
- `ev_statistik` – unten links

### bogen_F5DFA459.webp
Museumshalle als Einzelbild (Alternative zu `mus_halle`).
- (keine Zuordnung: Reserve oder ältere Variante)

### bogen_F75E2A6D.webp
- `ship_kurier` – ganzes Bild

### bogen_FCAC4CC4.webp
- `wf_besichtigung` – unten links
- `wf_buero` – unten rechts
- `wf_dock` – oben links
- `wf_kessel` – oben rechts

### bogen_FD13F8E1.webp
- `mus_fest` – oben rechts
- `mus_hafen` – oben links
- `mus_nostalgie` – unten links
- `mus_restaurierung` – unten rechts

### bogen_FF59C3CB.webp
- `mk_agentur` – oben rechts
- `mk_hallen` – unten rechts
- `mk_reise` – unten links
- `mk_reklame` – oben links

## Musik

| Spiel | Titel | Datei |
|---|---|---|
| `mus0` | Hamburger Hafen 1880 | `musik/Hamburger_Hafen_1880.mp3` |
| `mus1` | Dampf über den Atlantik | `musik/Dampf_u_ber_den_Atlantik.m4a` |
| `mus2` | Walzer auf dem Ozean | `musik/Walzer_auf_dem_Ozean.mp3` |
| `mus4` | Walzer auf dem Ozean (Variante) | `musik/Walzer_auf_dem_Ozean_2.mp3` |
| `mus3` | Ruhige Nachtfahrt | `musik/ruhige_Nachtfahrt.mp3` |
| `mus5` | Ruhige Nachtfahrt (Variante) | `musik/ruhige_Nachtfahrt_2.mp3` |

Seit v4.4.2 liegt die Musik im Spiel mit 96 kbit/s AAC (M4A) vor, so laut wie vorher (etwa −20 LUFS). `python3 tools/musik.py` erzeugt sie aus den Originalen neu.
