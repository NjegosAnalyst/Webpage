#!/usr/bin/env python3
"""Pregled sekcije Sankalište za korisnika (artifact "Sankalište").

Snowboard park i Ski bike je iznad, kao na početnoj, da se vide prelaz i cik-cak. Pravi pregled/index.html + pregled/slike/
(iste putanje kao pored park.js i sankaliste.js na jsDelivr-u, pa oba bloka koriste svoje podrazumijevane fotografije).
WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađeni tekst (tekst stranice Sankalište od 10. 10. 2026);
video sa stranice se vidi tek na sajtu. Ispod sekcije su dugmad za probu statusa (stvarno vrijeme, 16:30, 19:00, danas
ne radi) i ponovni ulazak.
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz park.js i sankaliste.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for d in ('park', 'sankaliste'):
    for f in sorted((SEC / d / 'slike').glob('*.webp')):
        shutil.copy(f, OUT / f.name)

PARK = (SEC / 'park' / 'park.js').read_text(encoding='utf-8')
SANK = (SEC / 'sankaliste' / 'sankaliste.js').read_text(encoding='utf-8')
assert '</script' not in PARK and '</script' not in SANK

page = r'''<title>Sankalište</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-tools{display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 16px 56px;background:#0A1120;font:400 14px/1.5 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.7)}
.pv-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.pv-lbl{font:600 10.5px/1 'Archivo',system-ui,sans-serif;letter-spacing:2.6px;text-transform:uppercase;color:rgba(255,255,255,.5)}
.pv-tools button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-tools button:hover{color:#00B9F2}
.pv-tools button[aria-pressed="true"]{color:#fff;box-shadow:inset 2px 2px 5px rgba(0,0,0,.45),inset -2px -2px 5px rgba(78,104,150,.13),inset 0 0 0 1px rgba(0,185,242,.45)}
.pv-tools button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pv-note{display:none;width:min(560px,100%);box-sizing:border-box;padding:14px 18px;border-radius:14px;background:#111A2C;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);text-align:center}
.pv-note.is-on{display:block}
</style>
<div id="jsb-park"></div>
<div id="jsk-sankaliste"></div>
<div class="pv-tools">
  <span class="pv-lbl">Proba statusa</span>
  <div class="pv-row" role="group" aria-label="Proba statusa">
    <button type="button" data-sat="" aria-pressed="true">Stvarno vrijeme</button>
    <button type="button" data-sat="16:30" aria-pressed="false">16:30 · radi</button>
    <button type="button" data-sat="19:00" aria-pressed="false">19:00 · ne radi</button>
    <button type="button" data-sat="16:30" data-st="ne-radi" aria-pressed="false">Danas ne radi</button>
  </div>
  <div class="pv-note" id="pv-note" aria-live="polite"></div>
  <button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak sekcije</button>
</div>
<script>
__PARK__
</script>
<script>
__SANK__
</script>
<script>
// samo u pregledu: proba statusa, ponovi ulazak (stranica se učita ponovo i skroluje do sekcije); linkovi se ne otvaraju
(function () {
  var r = document.getElementById('jsk-sankaliste');
  try {
    if (sessionStorage.getItem('pv-sank')) {
      sessionStorage.removeItem('pv-sank');
      var g = document.getElementById('jsb-park');
      window.scrollTo(0, g.getBoundingClientRect().bottom + window.scrollY - 40);
      setTimeout(function () { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    }
  } catch (e) {}
  document.getElementById('pv-replay').addEventListener('click', function () {
    try { sessionStorage.setItem('pv-sank', '1'); } catch (e) {}
    location.reload();
  });
  [].forEach.call(document.querySelectorAll('.pv-row button'), function (b, i, all) {
    b.addEventListener('click', function () {
      [].forEach.call(all, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var t = b.getAttribute('data-sat');
      if (t) r.setAttribute('data-sat', t); else r.removeAttribute('data-sat');
      if (b.getAttribute('data-st')) r.setAttribute('data-status', b.getAttribute('data-st')); else r.removeAttribute('data-status');
      if (r.__jskTick) r.__jskTick();
    });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#jsb-park a, #jsk-sankaliste a');
    if (!a || a.getAttribute('target') === '_blank') return;
    e.preventDefault();
    var n = document.getElementById('pv-note');
    n.textContent = a.getAttribute('data-jsk') === 'cijene'
      ? 'Na sajtu ovo vodi na link „OVDJE“ sa stranice Sankalište (cijene karata).'
      : 'Na sajtu ovo vodi na stranicu: ' + (a.getAttribute('href') || '').replace(/^https?:\/\/[^\/]+/, '');
    n.classList.add('is-on');
  });
})();
</script>
'''
(HERE / 'index.html').write_text(page.replace('__PARK__', PARK).replace('__SANK__', SANK), encoding='utf-8')
print('ok')
