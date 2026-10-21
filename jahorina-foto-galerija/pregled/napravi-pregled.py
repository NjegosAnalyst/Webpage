#!/usr/bin/env python3
"""Pregled foto galerije za korisnika (artifact "Jahorina foto galerija"): samo galerija.

Pravi pregled/index.html: stranica kao na sajtu (traka naslova sa H1 + Elementor widgeti
„Naslov“ i „Basic Gallery“ po albumima iz albumi.json), a preko nje radi prava galerija.js.
REST odgovor Medija je simuliran (alt iz albumi.json, verzije slika iz pregled/img/).
Fotografije: pregled/img/<id>-480|768|1024.jpg — ako nedostaju, preuzmu se sa www.oc-jahorina.com.
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact sa fajlovima img/*.jpg.
Izlaz (index.html, img/) se ne čuva u gitu — uvijek se pravi iz galerija.js i albumi.json.
"""
import base64, json, pathlib, subprocess, urllib.parse
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE / 'img'
IMG.mkdir(exist_ok=True)
DATA = json.loads((HERE.parent / 'albumi.json').read_text(encoding='utf-8'))
SITE = 'https://www.oc-jahorina.com'
SIZES = (('mobile-srcset', 480), ('medium_large', 768), ('large', 1024))

ids = [i for al in DATA['albumi'] for i in al['ids']]
assert len(ids) == len(set(ids)), 'ista fotografija u dva albuma'
assert set(map(str, ids)) == set(DATA['alt']), 'alt i albumi se ne poklapaju'

# fotografije koje nedostaju: verzije iz Medija sa sajta
missing = [i for i in ids if not all((IMG / f'{i}-{w}.jpg').exists() for _, w in SIZES)]
if missing:
    q = urllib.parse.urlencode({'include': ','.join(map(str, missing)), 'per_page': 100, '_fields': 'id,media_details'})
    media = json.loads(subprocess.run(['curl', '-sS', '-m', '60', f'{SITE}/wp-json/wp/v2/media?{q}'],
                                      check=True, capture_output=True).stdout)
    for m in media:
        for key, w in SIZES:
            subprocess.run(['curl', '-sS', '-m', '60', '-o', str(IMG / f"{m['id']}-{w}.jpg"),
                            m['media_details']['sizes'][key]['source_url']], check=True)

def dims(i, w):
    with Image.open(IMG / f'{i}-{w}.jpg') as im:
        return im.size

# simulirani odgovor /wp-json/wp/v2/media (oblik kao na sajtu)
MEDIA = {}
for i in ids:
    sizes = {}
    for key, w in SIZES:
        W, H = dims(i, w)
        sizes[key] = {'width': W, 'height': H, 'source_url': f'img/{i}-{w}.jpg'}
    sizes['thumbnail'] = {'width': 150, 'height': 150, 'source_url': f'img/{i}-480.jpg'}
    W, H = sizes['large']['width'], sizes['large']['height']
    sizes['full'] = dict(sizes['large'])
    sr, en = DATA['alt'][str(i)]
    MEDIA[i] = {'id': i, 'alt_text': f'[:SH]{sr}[:en]{en}[:]', 'media_details': {'width': W, 'height': H, 'sizes': sizes}}

# Elementor stranica kao na sajtu: HTML widget sa galerijom, pa po album Naslov + Basic Gallery
def item(i):
    s = base64.b64encode(json.dumps({'id': i, 'url': f'img/{i}-1024.jpg', 'slideshow': 'g'}).encode()).decode()
    h = urllib.parse.quote(f'#elementor-action:action=lightbox&settings={s}', safe='')
    return (f"<dl class='gallery-item' data-title='IMG-{i}'><div class='gallery-item-wrapper'><dt class='gallery-icon landscape'>"
            f'<a data-elementor-open-lightbox="yes" data-e-action-hash="{h}" href="img/{i}-1024.jpg">'
            f'<img loading="lazy" width="150" height="150" src="img/{i}-480.jpg" class="attachment-thumbnail size-thumbnail" alt=""></a></dt></div></dl>')

widgets = ''.join(
    '<div class="elementor-element elementor-widget elementor-widget-heading"><div class="elementor-widget-container">'
    f'<h2 class="elementor-heading-title elementor-size-default">[:SH]{al["sr"]}[:en]{al["en"]}[:]</h2></div></div>'
    '<div class="elementor-element elementor-widget elementor-widget-image-gallery"><div class="elementor-widget-container">'
    '<div class="elementor-image-gallery"><div class="gallery gallery-columns-8 gallery-size-thumbnail">'
    + ''.join(item(i) for i in al['ids']) + '</div></div></div></div>'
    for al in DATA['albumi'])

SRC = (HERE.parent / 'galerija.js').read_text(encoding='utf-8')
assert '</script' not in SRC

page = r'''<title>Jahorina foto galerija</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%;font-family:Barlow,system-ui,sans-serif}
/* traka naslova kao na sajtu (4-naslov): breadcrumbs, H1, cyan linija */
.pg-sub{position:relative;background:#0A1120;padding:40px clamp(16px,4vw,48px) 26px}
.pg-sub::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,185,242,.7),rgba(0,0,0,0))}
.pg-in{max-width:1240px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
.pg-bc{margin:0 0 8px;font:400 13px/1.4 Barlow,Archivo,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.52)}
.pg-bc a{color:rgba(255,255,255,.72);text-decoration:none}
.pg-sub h1{margin:0;font:800 clamp(26px,2.6vw,36px)/1.15 Archivo,system-ui,sans-serif;letter-spacing:-.01em;color:#fff}
/* samo za pregled: izbor jezika */
.pg-lang{display:flex;gap:6px;padding:5px;border-radius:16px;background:rgba(9,14,26,.88);box-shadow:inset 0 0 0 1px rgba(255,255,255,.09)}
.pg-lang button{all:unset;cursor:pointer;display:grid;place-items:center;min-width:44px;height:40px;padding:0 10px;border-radius:12px;font:600 12px/1 Archivo,sans-serif;letter-spacing:1.4px;color:rgba(255,255,255,.7);
  background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.pg-lang button[aria-pressed="true"]{color:#9BE6FF;box-shadow:inset 0 0 0 1px rgba(111,219,255,.42),0 0 16px -6px rgba(0,185,242,.5)}
.pg-lang button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pg-note{margin:0;padding:22px 16px 30px;text-align:center;font:400 13px/1.5 Barlow,sans-serif;color:rgba(255,255,255,.45)}
@media (max-width:760px){.pg-sub{padding:24px 16px 18px}.pg-sub h1{font-size:24px}.pg-bc{font-size:12px;margin-bottom:6px}.pg-lang button{min-width:40px;height:40px}}
</style>
<header class="pg-sub"><div class="pg-in"><div><p class="pg-bc"><a href="#" id="pg-home">Početna</a> <span>›</span></p><h1 id="pg-h1">Foto galerija</h1></div>
<div class="pg-lang" role="group" aria-label="Jezik pregleda"><button type="button" data-l="sr" aria-pressed="true">SR</button><button type="button" data-l="en" aria-pressed="false">EN</button></div></div></header>
<main id="Content"><div data-elementor-type="wp-page" class="elementor elementor-935"><section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-element elementor-widget elementor-widget-html"><div class="elementor-widget-container" id="pg-slot"><div id="jfg-galerija"></div></div></div>
__WIDGETS__
</div></div></div></section></div></main>
<p class="pg-note" id="pg-note">Pregled: prave fotografije sa sajta, albumi i alt tekstovi su prijedlog. Na sajtu fotografije i dalje dodaješ u Elementor widget „Basic Gallery“.</p>
<script>
(function () {
  // Mediji kao ih vraća WordPress (pregled ne može čitati pravi sajt)
  var MEDIA = __MEDIA__;
  function res(b) { return Promise.resolve(new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } })); }
  window.fetch = function (url) {
    url = String(url);
    return new Promise(function (r) { setTimeout(r, 250); }).then(function () {
      var m = /wp\/v2\/media.*[?&]include=([\d,]+)/.exec(url);
      return res(m ? m[1].split(',').map(function (id) { return MEDIA[id]; }).filter(Boolean) : []);
    });
  };
  // u pregledu linkovi ne vode na sajt
  document.getElementById('pg-home').addEventListener('click', function (e) { e.preventDefault(); });
})();
</script>
<script type="text/plain" id="pg-kod">__SRC__</script>
<script>
(function () {
  var d = document, KOD = d.getElementById('pg-kod').textContent;
  var TXT = { sr: { h1: 'Foto galerija', home: 'Početna', note: 'Pregled: prave fotografije sa sajta, albumi i alt tekstovi su prijedlog. Na sajtu fotografije i dalje dodaješ u Elementor widget „Basic Gallery“.' },
              en: { h1: 'Photo Gallery', home: 'Home', note: 'Preview: real photos from the site; albums and alt texts are a proposal.' } };
  function run(lang) {
    var old = d.getElementById('jfg-galerija'), lb = d.getElementById('jfg-lb');
    if (lb) lb.remove();
    [].forEach.call(d.querySelectorAll('.jfg-izvor'), function (n) { n.classList.remove('jfg-izvor'); });
    var root = d.createElement('div'); root.id = 'jfg-galerija';
    if (lang === 'en') root.setAttribute('data-lang', 'en');
    old.replaceWith(root);
    d.documentElement.lang = lang === 'en' ? 'en' : 'sr';
    d.getElementById('pg-h1').textContent = TXT[lang].h1;
    d.getElementById('pg-home').textContent = TXT[lang].home;
    d.getElementById('pg-note').textContent = TXT[lang].note;
    [].forEach.call(d.querySelectorAll('.pg-lang button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === lang ? 'true' : 'false'); });
    var s = d.createElement('script'); s.textContent = KOD; d.body.appendChild(s);
  }
  d.querySelector('.pg-lang').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b && b.getAttribute('aria-pressed') !== 'true') run(b.getAttribute('data-l'));
  });
  run('sr');
})();
</script>
'''
page = (page.replace('__WIDGETS__', widgets)
            .replace('__MEDIA__', json.dumps({str(k): v for k, v in MEDIA.items()}, ensure_ascii=False))
            .replace('__SRC__', SRC))
(HERE / 'index.html').write_text(page, encoding='utf-8')
print('pregled/index.html', len(page) // 1024, 'KB ·', len(ids), 'fotografija ·', len(DATA['albumi']), 'albuma')
