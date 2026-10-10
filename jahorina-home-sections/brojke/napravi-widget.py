#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija Planina u brojkama sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni brojke.js → test → commit + push → python3 napravi-widget.py → commit + push → korisniku daj novi
sadržaj elementor-html-widget.html. Fotografija se učitava iz istog commita (slike/ pored brojke.js).
Brojke se čitaju iz teksta WordPress stranice (data-stranica = SLUG). LINK/LINK_TEKST = tih link ispod brojki (prazno = bez linka).
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/brojke/brojke.js'
SLUG = 'pocetna-zima'
LINK = ''
LINK_TEKST = ''
FILES = ['brojke.js', 'slike']

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES).strip():
    raise SystemExit('brojke.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%h', '--', *FILES).decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

lk = f' data-link="{LINK}"' + (f' data-link-tekst="{LINK_TEKST}"' if LINK_TEKST else '') if LINK else ''
line = (f'<div id="jpb-brojke" data-stranica="{SLUG}"{lk}></div>'
        f'<script src="{url}" integrity="{sri}" crossorigin="anonymous" defer></script>\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
