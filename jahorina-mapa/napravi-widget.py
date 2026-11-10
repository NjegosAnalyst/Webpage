#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: interaktivna mapa staza sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni mapa.js / podaci / slike → test → commit + push → python3 napravi-widget.py → commit + push →
korisniku daj novi sadržaj elementor-html-widget.html.
mapa.js čita podaci/mapa.json i slike/ iz istog commita (pored sebe); ako jsDelivr ne isporuči fajl, uzima ga sa
raw.githubusercontent.com (isti puni hash), a sam mapa.js sa githack-a (loader ispod).
Jezik: /en/ adrese = engleski (qTranslate), ostalo srpski. Opcije na <div>: data-gss="+387 …" (broj Gorske službe),
data-usluge="1", data-topovi="1", data-popis="1" (vraćaju sakrivene dijelove).
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-mapa/mapa.js'
FILES = ['mapa.js', 'podaci', 'slike']
ATRIBUTI = ''          # npr. ' data-gss="+387 66 636 636"' (podrazumijevani broj je već u mapa.js)

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES).strip():
    raise SystemExit('mapa.js, podaci/ ili slike/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', *FILES).decode().strip()   # puni hash: rezerva sa GitHuba ga traži
if not git('branch', '-r', '--contains', commit).strip():
    raise SystemExit(f'commit {commit[:7]} nije na GitHubu — prvo git push, pa ponovo.')
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

# Mali ugrađeni loader (radi i na stranici i u Elementor editoru, gdje se HTML ubacuje preko jQuery-ja):
# jsDelivr + SRI; ako ne isporuči (greška, zastoj, SRI), ista datoteka iz istog commita sa githack CDN-a.
def loader(url, sri):
    return ("<script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'" + url + "','" + sri + "')</script>")

line = f'<div id="jm-mapa"{ATRIBUTI}></div>{loader(url, sri)}\n'
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
