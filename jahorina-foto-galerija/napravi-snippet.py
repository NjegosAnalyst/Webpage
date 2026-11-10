#!/usr/bin/env python3
"""Pravi jednokratni WPCode PHP snippet (wordpress-snippet.php) za stranicu Foto galerija.

Snippet je mali (bez HTML-a i <script>, zbog ModSecurity firewalla): albume, alt tekstove i red
HTML widgeta čita sa jsDelivr-a (rezerva raw.githubusercontent.com), zaključano na commit i
provjereno SHA-256. Šta radi: vidi komentar na vrhu wordpress-snippet.php.

Redoslijed: napravi-widget.py → commit + push (albumi.json i elementor-html-widget.html moraju
biti u tom commitu) → python3 napravi-snippet.py → commit + push → korisniku sadržaj snippeta.
"""
import hashlib, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
FILES = {'albumi': 'albumi.json', 'red': 'elementor-html-widget.html'}

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

if git('status', '--porcelain', '--', *FILES.values()).strip():
    raise SystemExit('albumi.json / elementor-html-widget.html imaju nesačuvane izmjene — prvo commit + push.')
commit = git('log', '-1', '--format=%H', '--', *FILES.values()).decode().strip()
sha = {k: hashlib.sha256(git('show', f'{commit}:jahorina-foto-galerija/{f}')).hexdigest() for k, f in FILES.items()}

php = (HERE / 'wordpress-snippet.sablon.php').read_text(encoding='utf-8')
php = php.replace('__COMMIT__', commit).replace('__SHA_ALBUMI__', sha['albumi']).replace('__SHA_RED__', sha['red'])
assert not any(k in php for k in ('__COMMIT__', '__SHA_ALBUMI__', '__SHA_RED__'))
(HERE / 'wordpress-snippet.php').write_text(php, encoding='utf-8')
print(php)
