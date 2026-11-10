#!/usr/bin/env python3
"""Pregled sekcije VIP gondola za korisnika (artifact "Jahorina VIP gondola").

Olimpijski bar je iznad, kao na početnoj, da se vide prelaz i cik-cak. Pravi pregled/index.html + pregled/slike/
(iste putanje kao pored gondola.js i bar.js na jsDelivr-u, pa oba bloka koriste svoje podrazumijevane fotografije).
WordPress se iz pregleda ne može pitati, pa pregled pokazuje ugrađeni tekst i pakete (isti kao na stranici VIP gondole).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact, sa fajlovima slike/*.webp i slike/meni/*.webp.
Izlaz (index.html, slike/) se ne čuva u gitu — uvijek se pravi iz gondola.js i bar.js.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / 'meni').mkdir(parents=True)
for f in sorted((SEC / 'gondola' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)
for f in sorted((SEC / 'bar' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)
for f in sorted((SEC / 'bar' / 'slike' / 'meni').glob('*.webp')):
    shutil.copy(f, OUT / 'meni' / f.name)

GON = (SEC / 'gondola' / 'gondola.js').read_text(encoding='utf-8')
BAR = (SEC / 'bar' / 'bar.js').read_text(encoding='utf-8')
assert '</script' not in GON and '</script' not in BAR

page = r'''<title>Jahorina VIP gondola</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
.pv-tools{display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 16px 56px;background:#0A1120;font:400 14px/1.5 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.7)}
.pv-tools button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:40px;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.7);background:rgba(20,30,49,.82);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}
.pv-tools button:hover{color:#00B9F2}
.pv-tools button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pv-mail{display:none;width:min(560px,100%);box-sizing:border-box;padding:18px 20px;border-radius:16px;background:#111A2C;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.pv-mail.is-on{display:block}
.pv-mail b{display:block;margin-bottom:10px;font:600 10.5px/1.2 'Archivo',system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#00B9F2}
.pv-mail pre{margin:0;white-space:pre-wrap;font:400 13.5px/1.55 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.82)}
</style>
<div id="jb-bar"></div>
<div id="jg-gondola"></div>
<div class="pv-tools">
  <div class="pv-mail" id="pv-mail" aria-live="polite"><b>Ovako izgleda mail koji otvara dugme Rezerviši</b><pre></pre></div>
  <button type="button" id="pv-replay">&#8635;&nbsp; Ponovi ulazak VIP gondole</button>
</div>
<script>
__BAR__
</script>
<script>
__GON__
</script>
<script>
// samo u pregledu: ponovi ulazak (sa paljenjem LED-a); linkovi se ne otvaraju, a mail se prikaže ispod sekcije
(function () {
  var r = document.getElementById('jg-gondola');
  function led() {
    var t0 = performance.now(), D = 1900;
    (function step() {
      var t = Math.min(1, (performance.now() - t0) / D), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      r.style.setProperty('--led', e.toFixed(3));
      if (t < 1) requestAnimationFrame(step); else r.style.removeProperty('--led');
    })();
  }
  document.getElementById('pv-replay').addEventListener('click', function () {
    if (!r.classList.contains('jg-anim')) return;
    r.classList.remove('jg-on'); r.style.setProperty('--led', '0'); void r.offsetWidth;
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { r.classList.add('jg-on'); setTimeout(led, 850); }, 450);
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#jb-bar a, #jg-gondola a');
    if (!a) return;
    e.preventDefault();
    var h = a.getAttribute('href') || '';
    if (h.indexOf('mailto:') === 0) {
      var u = new URL(h), box = document.getElementById('pv-mail');
      box.querySelector('pre').textContent = 'Za: ' + decodeURIComponent(u.pathname) + '\nNaslov: ' + (u.searchParams.get('subject') || '') + '\n\n' + (u.searchParams.get('body') || '');
      box.classList.add('is-on'); box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();
</script>
'''
(HERE / 'index.html').write_text(page.replace('__BAR__', BAR).replace('__GON__', GON), encoding='utf-8')
print('ok')
