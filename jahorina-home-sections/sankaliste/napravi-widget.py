#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija Sankalište sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni sankaliste.js → test → commit + push → python3 napravi-widget.py → commit + push → korisniku daj novi
sadržaj elementor-html-widget.html. Fotografije se učitavaju iz istog commita (slike/ pored sankaliste.js).
Tekst, podaci, radno vrijeme, link za cijene i video se čitaju sa WordPress stranice (data-stranica = slug; ako ga nema,
kod traži stranicu sa "sank" u naslovu). SEZONA (npr. "15.12-31.3") = van tih datuma status je "Ne radi · van sezone";
prazno = bez provjere sezone.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/sankaliste/sankaliste.js'
SLUG = 'sankaliste'
SEZONA = ''
FILES = ['sankaliste.js', 'slike']

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES).strip():
    raise SystemExit('sankaliste.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', *FILES).decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'
# Učitavanje kroz mali ugrađeni loader (radi i na stranici i u Elementor editoru, gdje se HTML ubacuje preko jQuery-ja):
# jsDelivr + SRI; ako ne isporuči (greška, zastoj, SRI), ista datoteka iz istog commita sa githack CDN-a.
def loader(url, sri):
    return ("<script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'" + url + "','" + sri + "')</script>")

sez = f' data-sezona="{SEZONA}"' if SEZONA else ''
line = (f'<div id="jsk-sankaliste" data-stranica="{SLUG}"{sez}><a href="/{SLUG}/">Sankalište</a></div>'
        f'{loader(url, sri)}\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
