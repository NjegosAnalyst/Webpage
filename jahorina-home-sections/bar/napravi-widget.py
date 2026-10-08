#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija Olimpijski bar sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni bar.js → commit + push → python3 napravi-widget.py → commit + push
→ korisniku daj novi sadržaj elementor-html-widget.html.
Fotografije i ugrađeni meni se učitavaju iz istog commita (slike/ pored bar.js). Tekst, brojevi i video se čitaju sa
WordPress stranice (data-stranica = slug), a meni iz Medija (slike meni-bar-01, meni-bar-02 …) kad postoje.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/bar/bar.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', 'bar.js', 'slike').strip():
    raise SystemExit('bar.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%h', '--', 'bar.js', 'slike').decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

line = ('<div id="jb-bar" data-stranica="olimpijski-bar">'
        '<a href="/olimpijski-bar/">Olimpijski bar</a></div>'
        f'<script src="{url}" integrity="{sri}" crossorigin="anonymous" defer></script>\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
