#!/usr/bin/env python3
"""Skuplja sve redove za Elementor („Početna 2027“) u POCETNA-2027-REDOVI.md, redom kojim idu na stranicu.
Pokrenuti poslije svakog napravi-widget.py (python3 alati/napravi-redove.py). Datum stanja = argument (npr. „11. 11. 2026“)."""
import pathlib, sys
H = pathlib.Path(__file__).resolve().parent.parent
DATUM = sys.argv[1] if len(sys.argv) > 1 else ''
def line(s): return (H / s / 'elementor-html-widget.html').read_text(encoding='utf-8').strip()
ORDER = [('stanje', 'Stanje skijališta i brzi linkovi', 'Novi HTML widget odmah ispod hero-a (iznad vijesti).'),
         ('vijesti', 'Obavještenja i vijesti', 'Ako na sajtu postoji i WPCode snippet „Jahorina vijesti“, zamijeni i njega (sadržaj `vijesti/wpcode-vijesti.js`) — inače se može učitati stara verzija.'),
         ('ratrak', 'Panoramska vožnja ratrakom', ''), ('suvenirnica', 'Suvenirnica', ''), ('bar', 'Olimpijski bar', ''),
         ('gondola', 'VIP gondola', ''), ('depo', 'Ski depo', ''), ('park', 'Snowboard park i Ski bike', ''),
         ('sankaliste', 'Sankalište (zadnja sekcija prije footera)', 'U ISTI widget, ispod njegovog reda, ide i red dugmeta „Ski pass“ (ispod).')]
out = ['# Početna 2027 — redovi za Elementor' + (f' (stanje {DATUM})' if DATUM else ''), '',
       'Redoslijed na stranici: hero → **stanje** → vijesti → ratrak → suvenirnica → Olimpijski bar → VIP gondola → Ski depo → Snowboard park i Ski bike → Sankalište (+ Ski pass) → footer.',
       'Poslije zamjene: **Ažuriraj** u Elementoru, obriši keš (WP Fastest Cache), provjeri računar i telefon. Fajl pravi `alati/napravi-redove.py` — ne mijenjati ručno.', '']
for i, (s, t, n) in enumerate(ORDER, 1):
    out += [f'## {i}. {t}', ''] + ([n, ''] if n else []) + ['```html', line(s), '```', '']
out += ['## Ski pass (dugme na telefonu)', '', 'U isti HTML widget kao Sankalište, ispod njegovog reda.', '', '```html', line('skipass'), '```', '',
        '## Hero (Slider Revolution) i WPCode', '',
        '- Moduli **Jahorina Hero 2027** i **Jahorina Hero 2027 EN**: HTML sloja i Custom CSS iz `jahorina-hero-v2/slider-revolution-spremno/1-html.html` + `2-css.css` (EN: `slider-revolution-EN-spremno/`).',
        '- WPCode snippet **„Jahorina brzi start“** (Site Wide Header): sadržaj `jahorina-hero-v2/wordpress-ubrzanje.js`.', '']
(H / 'POCETNA-2027-REDOVI.md').write_text('\n'.join(out), encoding='utf-8')
print('ok POCETNA-2027-REDOVI.md')
