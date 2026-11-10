#!/usr/bin/env python3
"""Pregled sekcije Olimpijski bar za korisnika (artifact "Jahorina Olimpijski bar").

Suvenirnica je iznad, kao na početnoj, da se vidi prelaz i da su u istoj temi. Pravi pregled/index.html + pregled/slike/
(iste putanje kao pored bar.js i suvenirnica.js na jsDelivr-u, pa oba bloka koriste svoje podrazumijevane fotografije,
a meni svoje ugrađene strane iz slike/meni/). WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađeni tekst
(isti kao na stranici Olimpijski bar) i ugrađeni meni.
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp i slike/meni/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz bar.js i suvenirnica.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / 'meni').mkdir(parents=True)
for f in sorted((SEC / 'bar' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)
for f in sorted((SEC / 'bar' / 'slike' / 'meni').glob('*.webp')):
    shutil.copy(f, OUT / 'meni' / f.name)
for f in sorted((SEC / 'suvenirnica' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)

BAR = (SEC / 'bar' / 'bar.js').read_text(encoding='utf-8')
SUV = (SEC / 'suvenirnica' / 'suvenirnica.js').read_text(encoding='utf-8')
assert '</script' not in BAR and '</script' not in SUV

page = r'''<title>Jahorina Olimpijski bar</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-replay{display:flex;justify-content:center;padding:0 16px 56px;background:#0A1120}
.pv-replay button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-replay button:hover{color:#00B9F2}
.pv-replay button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
</style>
<div id="jsu-suvenirnica"></div>
<div id="jb-bar"></div>
<div class="pv-replay"><button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak bara</button></div>
<script>
__SUV__
</script>
<script>
__BAR__
</script>
<script>
// samo u pregledu: ponovi ulazak; linkovi (stranica, mapa, telefon) se ne otvaraju
document.getElementById('pv-replay').addEventListener('click', function () {
  var r = document.getElementById('jb-bar');
  if (!r.classList.contains('jb-anim')) return;
  r.classList.remove('jb-on'); void r.offsetWidth;
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () { r.classList.add('jb-on'); }, 450);
});
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jsu-suvenirnica a, #jb-bar a:not(.pv-yt)'); if (a) e.preventDefault(); });
// pregled ne smije ugraditi YouTube, pa dugme za video ovdje otvara video na YouTube-u (na sajtu se video otvara preko ekrana)
(function () {
  var b = document.querySelector('#jb-bar .jb-btn--ghost'); if (!b) return;
  var a = document.createElement('a'); a.className = b.className + ' pv-yt'; a.innerHTML = b.innerHTML;
  a.href = 'https://www.youtube.com/watch?v=7qo0-fAx5CI'; a.target = '_blank'; a.rel = 'noopener';
  b.parentNode.replaceChild(a, b);
})();
</script>
'''
(HERE / 'index.html').write_text(page.replace('__SUV__', SUV).replace('__BAR__', BAR), encoding='utf-8')
print('ok')
