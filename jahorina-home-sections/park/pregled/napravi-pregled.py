#!/usr/bin/env python3
"""Pregled sekcije Snowboard park i Ski bike za korisnika (artifact "Snowboard park i Ski bike").

Ski depo je iznad, kao na početnoj, da se vide prelaz i cik-cak. Pravi pregled/index.html + pregled/slike/
(iste putanje kao pored park.js i depo.js na jsDelivr-u, pa oba bloka koriste svoje podrazumijevane fotografije).
3D Ski depoa (depo-3d.js) je ugrađen u stranicu, pa pregled ne zavisi od učitavanja dodatnog fajla.
WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađeni tekst (park: tekst stranice; ski bike: radni tekst).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz park.js, depo.js i depo-3d.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for d in ('depo', 'park'):
    for f in sorted((SEC / d / 'slike').glob('*.webp')):
        shutil.copy(f, OUT / f.name)

PARK = (SEC / 'park' / 'park.js').read_text(encoding='utf-8')
DEPO = (SEC / 'depo' / 'depo.js').read_text(encoding='utf-8')
D3 = (SEC / 'depo' / 'depo-3d.js').read_text(encoding='utf-8')
assert '</script' not in PARK and '</script' not in DEPO and '</script' not in D3

page = r'''<title>Snowboard park i Ski bike</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-tools{display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 16px 56px;background:#0A1120;font:400 14px/1.5 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.7)}
.pv-tools button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-tools button:hover{color:#00B9F2}
.pv-tools button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pv-note{display:none;width:min(560px,100%);box-sizing:border-box;padding:14px 18px;border-radius:14px;background:#111A2C;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);text-align:center}
.pv-note.is-on{display:block}
</style>
<div id="jsd-depo"></div>
<div id="jsb-park"></div>
<div class="pv-tools">
  <div class="pv-note" id="pv-note" aria-live="polite"></div>
  <button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak sekcije</button>
</div>
<script>
__D3__
</script>
<script>
__DEPO__
</script>
<script>
__PARK__
</script>
<script>
// samo u pregledu: ponovi ulazak (stranica se učita ponovo i skroluje do sekcije); linkovi stranica se ne otvaraju
(function () {
  var r = document.getElementById('jsb-park');
  try {
    if (sessionStorage.getItem('pv-park')) {
      sessionStorage.removeItem('pv-park');
      var g = document.getElementById('jsd-depo');
      window.scrollTo(0, g.getBoundingClientRect().bottom + window.scrollY - 40);
      setTimeout(function () { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    }
  } catch (e) {}
  document.getElementById('pv-replay').addEventListener('click', function () {
    try { sessionStorage.setItem('pv-park', '1'); } catch (e) {}
    location.reload();
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#jsd-depo a, #jsb-park a');
    if (!a || a.getAttribute('target') === '_blank') return;
    e.preventDefault();
    var n = document.getElementById('pv-note');
    n.textContent = 'Na sajtu ovo vodi na stranicu: ' + (a.getAttribute('href') || '').replace(/^https?:\/\/[^\/]+/, '');
    n.classList.add('is-on');
  });
})();
</script>
'''
(HERE / 'index.html').write_text(page.replace('__D3__', D3).replace('__DEPO__', DEPO).replace('__PARK__', PARK), encoding='utf-8')
print('ok')
