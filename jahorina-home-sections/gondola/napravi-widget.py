#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija VIP gondola sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni gondola.js → commit + push → python3 napravi-widget.py → commit + push
→ korisniku daj novi sadržaj elementor-html-widget.html.
Fotografije se učitavaju iz istog commita (slike/ pored gondola.js). Tekst, paketi i cijene, mail i fotografije stranice
se čitaju sa WordPress stranice VIP gondole (data-stranica = slug; ako ga nema, kod traži stranicu sa "VIP" u naslovu).
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/gondola/gondola.js'
SLUG = 'vip-gondola'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', 'gondola.js', 'slike').strip():
    raise SystemExit('gondola.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%h', '--', 'gondola.js', 'slike').decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

line = (f'<div id="jg-gondola" data-stranica="{SLUG}">'
        f'<a href="/{SLUG}/">VIP gondola</a></div>'
        f'<script src="{url}" integrity="{sri}" crossorigin="anonymous" defer></script>\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
