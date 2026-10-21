#!/usr/bin/env python3
"""Pregled video galerije za korisnika (artifact "Jahorina video galerija"): samo galerija.

Stranica kao na sajtu (traka naslova + 10 Elementor Video widgeta sa pravim YouTube linkovima),
preko nje radi pravi video.js. YouTube se iz artifacta (i iz kontejnera) ne može učitati, pa su
sličice probne (fotografije Jahorine iz foto galerije, 16:9) i naslovi probni — na sajtu stižu sa YouTube-a.
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html + img/*.jpg.
"""
import json, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
FOTO = HERE.parents[1] / 'jahorina-foto-galerija/pregled/img'
IMG = HERE / 'img'
IMG.mkdir(exist_ok=True)

# video ID sa sajta → (probna sličica iz foto galerije, probni naslov SR, EN)
VIDEO = [   # spisak videa od korisnika (21. 10.), ovim redoslijedom — prvi je istaknut
    ('5Gt2nuFdaGQ', 31303, 'Noćno skijanje na Jahorini', 'Night skiing on Jahorina'),
    ('atZBt4H14xY', 31414, 'Skijanje po sunčanom danu', 'Skiing on a sunny day'),
    ('7hppyf-WdJg', 28936, 'Vožnja gondolom kroz zaleđenu šumu', 'Gondola ride through the frosted forest'),
    ('7qo0-fAx5CI', 29840, 'Jahorina iz vazduha', 'Jahorina from the air'),
    ('JbX0lYckAws', 31423, 'More oblaka sa vrha staze', 'Sea of clouds from the top of the slope'),
]
for vid, foto, *_ in VIDEO:
    out = IMG / f'{vid}.jpg'
    if not out.exists():
        im = Image.open(FOTO / f'{foto}-1024.jpg').convert('RGB')
        w, h = im.size
        ch = int(w * 9 / 16)
        if ch > h:
            cw = int(h * 16 / 9); im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
        else:
            im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
        im.resize((1024, 576)).save(out, quality=82)

widgets = ''.join(
    '<div class="elementor-element elementor-widget elementor-widget-video" data-settings="' +
    json.dumps({'youtube_url': f'https://www.youtube.com/watch?v={v}', 'video_type': 'youtube', 'controls': 'yes'}).replace('"', '&quot;') +
    '" data-widget_type="video.default"><div class="elementor-widget-container"><div class="elementor-wrapper elementor-open-inline"><div class="elementor-video"></div></div></div></div>'
    for v, *_ in VIDEO)
titles = {'sr': {v: sr for v, _, sr, _ in VIDEO}, 'en': {v: en for v, _, _, en in VIDEO}}

SRC = (HERE.parent / 'video.js').read_text(encoding='utf-8')
assert '</script' not in SRC
page = r'''<title>Jahorina video galerija</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%;font-family:Barlow,system-ui,sans-serif}
.pg-sub{position:relative;background:#0A1120;padding:40px clamp(16px,4vw,48px) 26px}
.pg-sub::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,185,242,.7),rgba(0,0,0,0))}
.pg-in{max-width:1240px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
.pg-bc{margin:0 0 8px;font:400 13px/1.4 Barlow,Archivo,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.52)}
.pg-bc a{color:rgba(255,255,255,.72);text-decoration:none}
.pg-sub h1{margin:0;font:800 clamp(26px,2.6vw,36px)/1.15 Archivo,system-ui,sans-serif;letter-spacing:-.01em;color:#fff}
.pg-lang{display:flex;gap:6px;padding:5px;border-radius:16px;background:rgba(9,14,26,.88);box-shadow:inset 0 0 0 1px rgba(255,255,255,.09)}
.pg-lang button{all:unset;cursor:pointer;display:grid;place-items:center;min-width:44px;height:40px;padding:0 10px;border-radius:12px;font:600 12px/1 Archivo,sans-serif;letter-spacing:1.4px;color:rgba(255,255,255,.7);
  background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.pg-lang button[aria-pressed="true"]{color:#9BE6FF;box-shadow:inset 0 0 0 1px rgba(111,219,255,.42),0 0 16px -6px rgba(0,185,242,.5)}
.pg-lang button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pg-note{margin:0;padding:0 16px 30px;text-align:center;font:400 13px/1.5 Barlow,sans-serif;color:rgba(255,255,255,.45)}
@media (max-width:760px){.pg-sub{padding:24px 16px 18px}.pg-sub h1{font-size:24px}.pg-bc{font-size:12px;margin-bottom:6px}}
</style>
<header class="pg-sub"><div class="pg-in"><div><p class="pg-bc"><a href="#" id="pg-home">Početna</a> <span>›</span></p><h1 id="pg-h1">Video galerija</h1></div>
<div class="pg-lang" role="group" aria-label="Jezik pregleda"><button type="button" data-l="sr" aria-pressed="true">SR</button><button type="button" data-l="en" aria-pressed="false">EN</button></div></div></header>
<main id="Content"><div data-elementor-type="wp-page" class="elementor elementor-957"><section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-element elementor-widget elementor-widget-html"><div class="elementor-widget-container"><div id="jvg-galerija" data-pregled data-thumbs="img/{id}.jpg"></div></div></div>
__WIDGETS__
</div></div></div></section></div></main>
<p class="pg-note" id="pg-note"></p>
<script type="text/plain" id="pg-kod">__SRC__</script>
<script>
(function () {
  var d = document, KOD = d.getElementById('pg-kod').textContent, TITLES = __TITLES__;
  var WRAP = d.querySelector('.elementor-widget-wrap'), IZVOR = WRAP.innerHTML;
  var TXT = { sr: { h1: 'Video galerija', home: 'Početna', note: 'Pregled: probne sličice (fotografije Jahorine) i probni naslovi. Na sajtu sličice i naslovi stižu sa vašeg YouTube kanala, a video se pušta preko cijelog ekrana.' },
              en: { h1: 'Video Gallery', home: 'Home', note: 'Preview: sample thumbnails and titles. On the website they come from your YouTube channel.' } };
  function run(lang) {
    var lb = d.getElementById('jvg-lb'); if (lb) lb.remove();
    WRAP.innerHTML = IZVOR;
    var root = d.getElementById('jvg-galerija');
    if (lang === 'en') root.setAttribute('data-lang', 'en');
    window.__jvgTitles = TITLES[lang];
    try { Object.keys(TITLES.sr).forEach(function (id) { localStorage.removeItem('jvgT:' + id); }); } catch (e) {}
    d.documentElement.lang = lang;
    d.getElementById('pg-h1').textContent = TXT[lang].h1;
    d.getElementById('pg-home').textContent = TXT[lang].home;
    d.getElementById('pg-note').textContent = TXT[lang].note;
    [].forEach.call(d.querySelectorAll('.pg-lang button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === lang ? 'true' : 'false'); });
    var s = d.createElement('script'); s.textContent = KOD; d.body.appendChild(s);
  }
  d.getElementById('pg-home').addEventListener('click', function (e) { e.preventDefault(); });
  d.addEventListener('click', function (e) { var a = e.target.closest('#jvg-galerija a[target="_blank"]'); if (a) e.preventDefault(); });
  d.querySelector('.pg-lang').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b && b.getAttribute('aria-pressed') !== 'true') run(b.getAttribute('data-l'));
  });
  run('sr');
})();
</script>
'''
page = page.replace('__WIDGETS__', widgets).replace('__SRC__', SRC).replace('__TITLES__', json.dumps(titles, ensure_ascii=False))
(HERE / 'index.html').write_text(page, encoding='utf-8')
print('pregled/index.html', len(page) // 1024, 'KB ·', len(VIDEO), 'videa')
