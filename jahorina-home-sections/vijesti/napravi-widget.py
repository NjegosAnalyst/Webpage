#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: blok vijesti sa jsDelivr-a, zaključan na commit + SRI.

Redoslijed: izmijeni vijesti.js → commit + push → python3 napravi-widget.py → commit + push
→ korisniku daj novi sadržaj elementor-html-widget.html.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/vijesti/vijesti.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

commit = git('log', '-1', '--format=%h', '--', 'vijesti.js').decode().strip()
if git('status', '--porcelain', '--', 'vijesti.js').strip():
    raise SystemExit('vijesti.js ima nesačuvane izmjene — prvo commit + push, pa ponovo.')
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

line = ('<div id="jv-vijesti"><a href="https://www.oc-jahorina.com/category/vijesti/">Sve vijesti</a></div>'
        f'<script src="{url}" integrity="{sri}" crossorigin="anonymous" defer></script>\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
