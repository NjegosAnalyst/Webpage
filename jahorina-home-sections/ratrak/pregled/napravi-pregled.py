#!/usr/bin/env python3
"""Pregled sekcije ratraka za korisnika (artifact "Jahorina ratrak"): samo sekcija.

Pravi pregled/index.html + pregled/img/ (fotografije iz ../slike/).
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
.pv-replay{display:flex;justify-content:center;padding:0 16px 56px;background:#0A1120}
.pv-replay button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-replay button:hover{color:#00B9F2}
.pv-replay button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
</style>
<div id="jr-ratrak" data-slika="img/ratrak-1.webp" data-galerija="img/ratrak-1.webp, img/ratrak-2.webp"></div>
<div class="pv-replay"><button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak</button></div>
<script>
__SRC__
</script>
<script>
// samo u pregledu: ponovi ulazak; mail i telefon se ne otvaraju
document.getElementById('pv-replay').addEventListener('click', function () {
  var r = document.getElementById('jr-ratrak');
  if (!r.classList.contains('jr-anim')) return;
  r.classList.remove('jr-on'); void r.offsetWidth;
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () { r.classList.add('jr-on'); }, 450);
});
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jr-ratrak a'); if (a) e.preventDefault(); });
</script>
'''
(HERE / 'index.html').write_text(page.replace('__SRC__', SRC), encoding='utf-8')
print('ok')
