#!/usr/bin/env python3
"""Pravi dva reda za "Kupi ski pass" na telefonu (skipass.js sa jsDelivr-a, zaključan na commit + SRI):
  elementor-html-widget.html — samo početna: Elementor HTML widget (bilo gdje na stranici; dugme pluta pri dnu ekrana);
  wpcode-loader.js           — cijeli sajt: WPCode → JavaScript snippet → Auto Insert → Site Wide Footer.
LINK = adresa kupovine ski pass-a (prazno = stavka menija iz WordPressa koja liči na "Ski pass" / "Web shop" / "Kupi").
Redoslijed: izmijeni skipass.js → test → commit + push → python3 napravi-widget.py → commit + push → korisniku novi red.
"""
import base64, hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-home-sections/skipass/skipass.js'
LINK = ''

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', 'skipass.js').strip():
    raise SystemExit('skipass.js ima nesačuvane izmjene — prvo commit + push, pa ponovo.')
commit = git('log', '-1', '--format=%h', '--', 'skipass.js').decode().strip()
body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

lk = f' data-link="{LINK}"' if LINK else ''
line = f'<div id="jks-skipass"{lk}></div><script src="{url}" integrity="{sri}" crossorigin="anonymous" defer></script>\n'
(HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
cfg = (f"var c=d.createElement('div');c.id='jks-skipass';c.setAttribute('data-link','{LINK}');c.hidden=true;(d.body||d.documentElement).appendChild(c);" if LINK else '')
loader = (f"(function(d){{{cfg}var s=d.createElement('script');s.src='{url}';s.integrity='{sri}';s.crossOrigin='anonymous';s.defer=true;"
          f"(d.head||d.documentElement).appendChild(s);}})(document);\n")
(HERE / 'wpcode-loader.js').write_text(loader, encoding='utf-8')
print(line + '\n' + loader)
