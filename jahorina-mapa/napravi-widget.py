#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget: interaktivna mapa staza sa jsDelivr-a, zaključana na commit + SRI.

Redoslijed: izmijeni mapa.js / podaci / slike / preuzimanje → test → commit + push → python3 napravi-widget.py →
node test-widget.js → commit + push → korisniku daj novi sadržaj elementor-html-widget.html.

U samom redu je i **statični tekst** (SR + EN): naslov, uvod, žičare, staze, link za preuzimanje, Gorska služba.
To vide Google, Bing, Copilot, ChatGPT i ostali koji ne pokreću JavaScript (korisnik 10. 11.: „za Google i AI je
stranica prazna“). Kad mapa.js krene, zamijeni ga interaktivnom mapom (ako ne krene za 8 s, tekst ostaje vidljiv).
Jezik teksta bira CSS po <html lang> (qTranslate: /en/ = en-…); bez CSS-a se vide oba, sa oznakom lang.

mapa.js čita podaci/mapa.json i slike/ iz istog commita (pored sebe); ako jsDelivr ne isporuči fajl, uzima ga sa
raw.githubusercontent.com (isti puni hash), a sam mapa.js sa githack-a (loader ispod).
Opcije: PREUZMI (adresa zvanične mape u WordPress Medijima; prazno = slika iz preuzimanje/ sa jsDelivr-a),
ATRIBUTI (data-gss="+387 …", data-usluge="1", data-topovi="1", data-popis="1").
"""
import base64, hashlib, html, json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-mapa/mapa.js'
FILES = ['mapa.js', 'podaci', 'slike', 'preuzimanje']
PREUZMI = ''           # npr. 'https://www.oc-jahorina.com/wp-content/uploads/2026/11/mapa-staza-jahorina.pdf'
PREUZMI_FAJL = 'preuzimanje/mapa-staza-jahorina.jpg'
GSS = '+387 66 636 636'
ATRIBUTI = ''

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES).strip():
    raise SystemExit('mapa.js, podaci/, slike/ ili preuzimanje/ imaju nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%H', '--', *FILES).decode().strip()   # puni hash: rezerva sa GitHuba ga traži
if not git('branch', '-r', '--contains', commit).strip():
    raise SystemExit(f'commit {commit[:7]} nije na GitHubu — prvo git push, pa ponovo.')
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
# heš podataka: mapa.js ih učita sa fetch(…, {integrity}) — izmijenjen mapa.json na CDN-u se odbije (kao skripta sa SRI)
podaci = git('show', f'{commit}:jahorina-mapa/podaci/mapa.json')
podaci_sri = 'sha384-' + base64.b64encode(hashlib.sha384(podaci).digest()).decode()
CDN = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/jahorina-mapa/'
url = CDN + 'mapa.js'
dl = PREUZMI or CDN + PREUZMI_FAJL
D = json.loads(podaci)

# ---------- statični tekst iz podataka ----------
e = lambda s: html.escape(str(s), quote=True)
def broj(n, sr1, sr2, sr5):
    d, s = n % 10, n % 100
    return f'{n} ' + (sr1 if d == 1 and s != 11 else sr2 if 2 <= d <= 4 and not 12 <= s <= 14 else sr5)
def red(ids):
    ids = sorted(ids, key=lambda i: (int(''.join(c for c in i if c.isdigit())), i))
    return ', '.join(ids[:-1]) + (' i ' if len(ids) > 1 else '') + ids[-1] if ids else ''
def red_en(ids):
    s = red(ids); return s.replace(' i ', ' and ')
po = lambda t: [s['id'] for s in D['staze'] if s['tez'] == t]
noc = [s['id'] for s in D['staze'] if s['noc']]
fis = [s['id'] for s in D['staze'] if s['fis']]
zic = sorted(D['zicare'], key=lambda z: int(z['id']))
TIP = {'gondola': ('gondola', 'gondola'), 'sestosjed': ('šestosjed', 'six-seater chairlift'), 'dvosjed': ('dvosjed', 'double chairlift'),
       'tanjir': ('ski lift tanjir', 'platter lift'), 'sidro': ('ski lift sidro', 'T-bar lift')}
nS, nZ = len(D['staze']), len(zic)
mn = lambda v, en: (f'{v:g}' if en else f'{v:g}'.replace('.', ','))

def blok(en):
    L = (lambda sr, eng: eng) if en else (lambda sr, eng: sr)
    s_cnt = f'{nS} runs' if en else broj(nS, 'staza', 'staze', 'staza')
    z_cnt = f'{nZ} lifts' if en else broj(nZ, 'žičara', 'žičare', 'žičara')
    r_ = red_en if en else red
    zl = ''.join(
        f'<li>{e(z["id"])} {e(z["ime"])} – {e(TIP.get(z["tip"], ("žičara", "lift"))[1 if en else 0])}, {z["m"]} m, '
        + (f'{mn(z["min"], en)} min ride' if en else f'vožnja {mn(z["min"], en)} min') + '</li>' for z in zic)
    return (
        f'<div class="jm-static" lang="{"en" if en else "sr-Latn"}">'
        f'<h2>{L("Mapa staza Jahorine", "Ski runs of Jahorina")}</h2>'
        f'<p>{L(f"Ski centar Jahorina ima {s_cnt} i {z_cnt}: {len(po("laka"))} plavih, {len(po("srednja"))} crvenih i {len(po("teska"))} crne staze, uz vezne staze između njih.", f"Jahorina ski resort has {s_cnt} and {z_cnt}: {len(po("laka"))} blue, {len(po("srednja"))} red and {len(po("teska"))} black runs, connected by link runs.")} '
        f'{L(f"Za noćno skijanje osvijetljene su staze {r_(noc)}. FIS homologovane staze: {r_(fis)}.", f"Floodlit for night skiing: runs {r_(noc)}. FIS homologated runs: {r_(fis)}.")}</p>'
        f'<h3>{L("Žičare", "Lifts")}</h3><ul>{zl}</ul>'
        f'<h3>{L("Staze", "Runs")}</h3><ul>'
        f'<li>{L("Plave (lake)", "Blue (easy)")}: {r_(po("laka"))}</li>'
        f'<li>{L("Crvene (srednje teške)", "Red (intermediate)")}: {r_(po("srednja"))}</li>'
        f'<li>{L("Crne (teške)", "Black (difficult)")}: {r_(po("teska"))}</li></ul>'
        f'<p><a href="{e(dl)}" target="_blank" rel="noopener">{L("Preuzmi mapu staza", "Download the ski map")}</a></p>'
        f'<p>{L("Gorska služba spasavanja Jahorina", "Jahorina Mountain Rescue Service")}: '
        f'<a href="tel:{e("".join(c for c in GSS if c == "+" or c.isdigit()))}">{e(GSS)}</a></p>'
        '</div>')

STIL = ('<style>#jm-mapa .jm-static{background:#0A1120;color:rgba(255,255,255,.82);padding:48px 24px;font:400 16px/1.6 Barlow,system-ui,sans-serif}'
        '#jm-mapa .jm-static h2,#jm-mapa .jm-static h3{color:#fff!important}#jm-mapa .jm-static a{color:#2CCBF8!important}'
        '#jm-mapa .jm-static[lang="en"],html[lang^="en"] #jm-mapa .jm-static[lang="sr-Latn"],#jm-mapa.jm-js .jm-static{display:none}'
        'html[lang^="en"] #jm-mapa:not(.jm-js) .jm-static[lang="en"]{display:block}</style>')

# Mali ugrađeni loader (radi i na stranici i u Elementor editoru, gdje se HTML ubacuje preko jQuery-ja):
# sakrije statični tekst dok se mapa učitava (vrati ga ako mapa ne krene za 8 s); jsDelivr + SRI; ako ne isporuči
# (greška, zastoj, SRI), ista datoteka iz istog commita sa githack CDN-a.
def loader(url, sri):
    return ("<script>(function(d,u,i){var r=d.getElementById('jm-mapa');if(r){r.classList.add('jm-js');"
            "setTimeout(function(){if(!r.getAttribute('data-jm'))r.classList.remove('jm-js')},8000)}"
            "function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'" + url + "','" + sri + "')</script>")

line = (f'<div id="jm-mapa" data-podaci="{podaci_sri}" data-preuzmi="{e(dl)}"{ATRIBUTI}>'
        f'{STIL}{blok(False)}{blok(True)}</div>{loader(url, sri)}\n')
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line)
print(f'{len(line.encode()) / 1024:.1f} KB')
