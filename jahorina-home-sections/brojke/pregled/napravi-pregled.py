#!/usr/bin/env python3
"""Pregled sekcije Planina u brojkama za korisnika (artifact "Planina u brojkama").

Pravi pregled/index.html + pregled/slike/ (iste putanje kao pored brojke.js na jsDelivr-u).
WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađene brojke (54 km · 18 · 10 · 600 m, stanje sa sajta
10. 10. 2026). Ispod sekcije je dugme za ponovni ulazak (koluti i crteži).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz brojke.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for dd in ('brojke',):
    for f in sorted((SEC / dd / 'slike').glob('*.webp')):
        shutil.copy(f, OUT / f.name)

BROJ = (SEC / 'brojke' / 'brojke.js').read_text(encoding='utf-8')
assert '</script' not in BROJ

page = r'''<title>Planina u brojkama</title>
<meta name="description" content="Pregled sekcije Planina u brojkama za početnu oc-jahorina.com">
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-pad{height:40vh}
.pv-tools{display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 16px 56px;background:#0A1120;font:400 14px/1.5 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.7)}
.pv-tools button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-tools button:hover{color:#00B9F2}
.pv-tools button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pv-note{max-width:560px;text-align:center;color:rgba(255,255,255,.52);font-size:13px}
</style>
<div class="pv-pad"></div>
<div id="jpb-brojke" data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"></div>
<div class="pv-tools">
  <button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak sekcije</button>
  <p class="pv-note">Brojke su upisane u red za Elementor (data-km, data-zicare, data-nocne, data-sankanje).</p>
</div>
<script>
__BROJ__
</script>
<script>
// samo u pregledu: ponovi ulazak (stranica se učita ponovo i skroluje do sekcije)
(function () {
  var r = document.getElementById('jpb-brojke');
  try {
    if (sessionStorage.getItem('pv-broj')) {
      sessionStorage.removeItem('pv-broj');
      setTimeout(function () { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    }
  } catch (e) {}
  document.getElementById('pv-replay').addEventListener('click', function () {
    try { sessionStorage.setItem('pv-broj', '1'); } catch (e) {}
    location.reload();
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#jpb-brojke a');
    if (a) e.preventDefault();
  });
})();
</script>
'''
(HERE / 'index.html').write_text(page.replace('__BROJ__', BROJ), encoding='utf-8')
print('ok')
