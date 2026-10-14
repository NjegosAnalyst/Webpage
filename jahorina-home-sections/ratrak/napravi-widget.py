#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: sekcija ratraka sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni ratrak.js → commit + push → python3 napravi-widget.py → commit + push
→ korisniku daj novi sadržaj elementor-html-widget.html.
Fotografije se učitavaju iz istog commita (slike/ pored ratrak.js). Cijena, termin, trajanje i link
za web shop su podešavanja u samom redu (data-…), pa ih korisnik mijenja u Elementoru bez novog koda.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/ratrak/ratrak.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', 'ratrak.js', 'slike').strip():
    raise SystemExit('ratrak.js ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', 'ratrak.js', 'slike').decode().strip()
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

line = ('<div id="jr-ratrak" data-trajanje="20 min" data-polazak="16–18h" data-polazak-en="4–6 pm" data-cijena="50 KM" data-webshop="">'
        '<a href="mailto:skipass@oc-jahorina.com">Panoramska vožnja ratrakom: rezervacija</a></div>'
        f'{loader(url, sri)}\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
