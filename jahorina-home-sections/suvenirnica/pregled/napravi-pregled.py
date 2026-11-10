#!/usr/bin/env python3
"""Pregled sekcije suvenirnice za korisnika (artifact "Jahorina suvenirnica").

Ratrak je iznad, kao na početnoj, da se vidi prelaz i da su u istoj temi. Pravi pregled/index.html + pregled/slike/
(iste putanje kao pored suvenirnica.js i ratrak.js na jsDelivr-u, pa oba bloka koriste svoje podrazumijevane fotografije).
WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađeni tekst (isti kao na stranici Suvenirnica).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz suvenirnica.js i ratrak.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for f in sorted((SEC / 'suvenirnica' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)
for f in ('ratrak-glavna.webp', 'ratrak-glavna-960.webp', 'ratrak-1.webp', 'ratrak-2.webp'):
    shutil.copy(SEC / 'ratrak' / 'slike' / f, OUT / f)

SUV = (SEC / 'suvenirnica' / 'suvenirnica.js').read_text(encoding='utf-8')
RAT = (SEC / 'ratrak' / 'ratrak.js').read_text(encoding='utf-8')
assert '</script' not in SUV and '</script' not in RAT

page = r'''<title>Jahorina suvenirnica</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-replay{display:flex;justify-content:center;padding:0 16px 56px;background:#0A1120}
.pv-replay button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-replay button:hover{color:#00B9F2}
.pv-replay button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
</style>
<div id="jr-ratrak"></div>
<div id="jsu-suvenirnica"></div>
<div class="pv-replay"><button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak suvenirnice</button></div>
<script>
__RAT__
</script>
<script>
__SUV__
</script>
<script>
// samo u pregledu: ponovi ulazak; linkovi (mail, telefon, stranica, mapa) se ne otvaraju
document.getElementById('pv-replay').addEventListener('click', function () {
  var r = document.getElementById('jsu-suvenirnica');
  if (!r.classList.contains('jsu-anim')) return;
  r.classList.remove('jsu-on'); void r.offsetWidth;
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () { r.classList.add('jsu-on'); }, 450);
});
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jr-ratrak a, #jsu-suvenirnica a'); if (a) e.preventDefault(); });
</script>
'''
(HERE / 'index.html').write_text(page.replace('__RAT__', RAT).replace('__SUV__', SUV), encoding='utf-8')
print('ok')
