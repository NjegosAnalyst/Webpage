#!/usr/bin/env python3
"""Pregled sekcije ratraka za korisnika (artifact "Jahorina ratrak"): samo sekcija.

Pravi pregled/index.html + pregled/img/ (ratrak-sekcija.webp i noćna fotografija iz hero-a).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima img/*.webp.
Izlaz (index.html, img/) se ne čuva u gitu — uvijek se pravi iz ratrak.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE / 'img'
IMG.mkdir(exist_ok=True)
REPO = HERE.parents[2]
shutil.copy(HERE.parent / 'slike' / 'ratrak-sekcija.webp', IMG / 'ratrak-sekcija.webp')
shutil.copy(REPO / 'jahorina-hero-v2' / 'assets' / 'jahorina-noc.webp', IMG / 'jahorina-noc.webp')

SRC = (HERE.parent / 'ratrak.js').read_text(encoding='utf-8')
assert '</script' not in SRC

page = r'''<title>Jahorina ratrak</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-replay{display:flex;justify-content:center;padding:0 16px 48px;background:#0A1120}
.pv-replay button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.2px;color:rgba(255,255,255,.62);background:#111A2C;box-shadow:4px 4px 12px rgba(0,0,0,.45),-3px -3px 10px rgba(60,84,128,.1)}
.pv-replay button:hover{color:#00B9F2}
.pv-replay button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
</style>
<div id="jr-ratrak" data-slika="img/ratrak-sekcija.webp" data-pozadina="img/jahorina-noc.webp"></div>
<div class="pv-replay"><button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak ratraka</button></div>
<script>
__SRC__
</script>
<script>
// samo u pregledu: ponovi animaciju i ne otvaraj mail/telefon
document.getElementById('pv-replay').addEventListener('click', function () {
  var r = document.getElementById('jr-ratrak');
  r.classList.remove('jr-go'); void r.offsetWidth; r.classList.add('jr-go');
  r.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jr-ratrak a'); if (a) e.preventDefault(); });
</script>
'''
(HERE / 'index.html').write_text(page.replace('__SRC__', SRC), encoding='utf-8')
print('ok')
