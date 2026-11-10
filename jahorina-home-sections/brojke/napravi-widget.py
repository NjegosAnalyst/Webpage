#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija Planina u brojkama sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni brojke.js → test → commit + push → python3 napravi-widget.py → commit + push → korisniku daj novi
sadržaj elementor-html-widget.html. Fotografija se učitava iz istog commita (slike/ pored brojke.js).
Brojke su upisane RUČNO u red (BROJKE; korisnik 12. 10. 2026: „ručno ih upiši u red“), pa se WordPress ne pita.
Kad se broj promijeni: izmijeni BROJKE → python3 napravi-widget.py → commit + push → korisniku novi red (brojke.js se ne mijenja).
Prazan BROJKE = brojke iz teksta WordPress stranice SLUG. LINK/LINK_TEKST = tih link ispod uvoda (prazno = bez linka).
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/brojke/brojke.js'
SLUG = 'pocetna-zima'
BROJKE = {'km': '54', 'zicare': '18', 'nocne': '10', 'sankanje': '600'}
LINK = ''
LINK_TEKST = ''
FILES = ['brojke.js', 'slike']

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES).strip():
    raise SystemExit('brojke.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', *FILES).decode().strip()   # puni hash: i rezerva sa GitHuba (raw) ga traži
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

lk = f' data-link="{LINK}"' + (f' data-link-tekst="{LINK_TEKST}"' if LINK_TEKST else '') if LINK else ''
br = ''.join(f' data-{k}="{v}"' for k, v in BROJKE.items()) if BROJKE else f' data-stranica="{SLUG}"'
line = (f'<div id="jpb-brojke"{br}{lk}></div>'
        f'{loader(url, sri)}\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
