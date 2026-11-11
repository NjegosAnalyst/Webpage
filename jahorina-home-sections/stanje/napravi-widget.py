#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija „Stanje skijališta i brzi linkovi“ sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni stanje.js → test → commit + push → python3 napravi-widget.py → commit + push
→ korisniku daj novi sadržaj elementor-html-widget.html.
Widget ide ODMAH ISPOD HERO-A (iznad vijesti). U <div id="jst-stanje"> je statičan tekst sa linkovima (vide ga
pretraživači i AI alati i kad ne izvrše skriptu); skripta ga zamijeni izgledom sekcije i stanjem uživo sa stranice Ski info.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/stanje/stanje.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', 'stanje.js').strip():
    raise SystemExit('stanje.js ima nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', 'stanje.js').decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

def loader(url, sri):
    return ("<script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'" + url + "','" + sri + "')</script>")

# statičan sadržaj (SEO): naslov, rečenica sa ključnim pojmovima i isti linkovi kao kartice
STATIC = ('<h2>Stanje skijališta Jahorina</h2>'
          '<p>Jahorina ima 54 km uređenih staza i 14 žičara. Stanje staza i žičara, visinu snijega i radno vrijeme '
          'pratite uživo na stranici <a href="/ski-info/">Ski info</a>.</p>'
          '<ul>'
          '<li><a href="https://webshop.oc-jahorina.com/">Kupi ski kartu online</a></li>'
          '<li><a href="/cjenovnik-ski-karata-sezona-2026-27/">Cijene ski karata, sezona 2026/27</a></li>'
          '<li><a href="/ski-mapa/">Ski mapa Jahorine</a></li>'
          '<li><a href="/jahorina-tv-web-kamere/">Kamere uživo (Jahorina TV)</a></li>'
          '<li><a href="/nocno-skijanje/">Noćno skijanje</a></li>'
          '</ul>')
line = f'<div id="jst-stanje">{STATIC}</div>{loader(url, sri)}\n'
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
