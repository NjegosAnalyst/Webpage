#!/usr/bin/env python3
"""Pregled "Kupi ski pass" na telefonu (artifact "Kupi ski pass").
Iza je blok Planina u brojkama (da se vidi staklo preko fotografije). Dugme se na sajtu prikazuje samo na telefonu;
u pregledu se vidi i na računaru (uže, centrirano), a link je primjer (na sajtu: stavka menija ili data-link).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html (+ slike/*.webp) kao artifact.
"""
import pathlib, shutil
HERE = pathlib.Path(__file__).resolve().parent
SEC = HERE.parent.parent
OUT = HERE / 'slike'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
for f in sorted((SEC / 'brojke' / 'slike').glob('*.webp')):
    shutil.copy(f, OUT / f.name)
BROJ = (SEC / 'brojke' / 'brojke.js').read_text(encoding='utf-8')
SKI = (SEC / 'skipass' / 'skipass.js').read_text(encoding='utf-8')
assert '</script' not in BROJ and '</script' not in SKI
page = r'''<title>Kupi ski pass</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0}
.pv-top{height:70vh;display:flex;align-items:flex-end;justify-content:center;padding:0 16px 40px;text-align:center;font:400 15px/1.5 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.62);background:linear-gradient(#0c1424,#0A1120)}
.pv-top b{display:block;margin-bottom:6px;font:700 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:2.4px;text-transform:uppercase;color:#fff}
.pv-end{height:30vh}
@media (min-width:761px){#jks-dock{display:block!important}}
</style>
<div class="pv-top"><div><b>Skroluj nadolje</b>Dugme „Kupi ski pass“ se pojavi ispod hero-a i stoji pri dnu ekrana. Na sajtu se vidi samo na telefonu.</div></div>
<div id="jpb-brojke" data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"></div>
<div class="pv-end"></div>
<div id="jks-skipass" data-link="#kupi"></div>
<script>
__BROJ__
</script>
<script>
__SKI__
</script>
<script>
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jks-dock a'); if (a) e.preventDefault(); });
</script>
'''
(HERE / 'index.html').write_text(page.replace('__BROJ__', BROJ).replace('__SKI__', SKI), encoding='utf-8')
print('ok')
