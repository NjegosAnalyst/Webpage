#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget na vrhu stranice Foto galerija: galerija.js sa jsDelivr-a,
zaključan na commit + SRI (rezerva: isti fajl iz istog commita sa githack CDN-a).

Red sakrije originalne Elementor galerije i naslove albuma dok galerija.js ne prikaže novu
(ako ne stigne za 8 s, originali se vrate), a pozadinu sadržaja stranice oboji tamno.
U Elementor editoru se ništa ne sakriva (body.elementor-editor-active).

Redoslijed: izmijeni galerija.js → commit + push → python3 napravi-widget.py → commit + push
→ python3 napravi-snippet.py (jednokratni WPCode snippet koji red ubaci na stranicu).
"""
import base64, hashlib, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-foto-galerija/galerija.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

PROBA = '--proba' in sys.argv   # za test: radni fajl, adresa @proba, ništa se ne upisuje
if PROBA:
    commit, body = 'proba', (HERE / 'galerija.js').read_bytes()
else:
    commit = git('log', '-1', '--format=%H', '--', 'galerija.js').decode().strip()
    if git('status', '--porcelain', '--', 'galerija.js').strip():
        raise SystemExit('galerija.js ima nesačuvane izmjene — prvo commit + push, pa ponovo.')
    body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

# isti loader kao u sekcijama početne (radi i na stranici i u Elementor editoru) + rezerva za skrivene originale
def loader(url, sri):
    return ("<script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i);"
            "setTimeout(function(){if(!d.querySelector('#jfg-galerija .jfg-wrap')){var s=d.getElementById('jfg-skrij');"
            "if(s)s.parentNode.removeChild(s)}},8000)})(document,'" + url + "','" + sri + "')</script>")

NE = 'body:not(.elementor-editor-active)'
line = (f'<style id="jfg-skrij">{NE} .elementor-widget-image-gallery,{NE} .elementor-widget-heading{{visibility:hidden}}</style>'
        f'<style>{NE} #Content{{background:#0A1120}}</style>'
        '<div id="jfg-galerija"></div>'
        f'{loader(url, sri)}\n')
if not PROBA:
    (HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line, end='')
