#!/usr/bin/env python3
"""Pregled sekcije ratraka za korisnika (artifact "Jahorina ratrak"): samo sekcija.

Pravi pregled/index.html + pregled/img/ (fotografije ratraka iz ../slike/).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact
(isti URL: https://claude.ai/artifact/L7sAdcd13XrkaA4mRZ9Z5N), sa fajlovima img/*.webp.
Izlaz (index.html, img/) se ne čuva u gitu — uvijek se pravi iz ratrak.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE / 'img'
if IMG.exists():
    shutil.rmtree(IMG)
IMG.mkdir()
for f in ('ratrak-1.webp', 'ratrak-2.webp'):
    shutil.copy(HERE.parent / 'slike' / f, IMG / f)

SRC = (HERE.parent / 'ratrak.js').read_text(encoding='utf-8')
assert '</script' not in SRC

page = r'''<title>Jahorina ratrak</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
</style>
<div id="jr-ratrak" data-slika="img/ratrak-1.webp" data-slika-2="img/ratrak-2.webp"></div>
<script>
__SRC__
</script>
<script>
// u pregledu mail i telefon se ne otvaraju
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jr-ratrak a'); if (a) e.preventDefault(); });
</script>
'''
(HERE / 'index.html').write_text(page.replace('__SRC__', SRC), encoding='utf-8')
print('ok')
