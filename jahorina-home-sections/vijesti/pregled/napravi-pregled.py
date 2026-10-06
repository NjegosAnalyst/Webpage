#!/usr/bin/env python3
"""Pregled bloka vijesti za korisnika (artifact "Jahorina vijesti"): samo sekcija, probne objave.

Pravi pregled/index.html + pregled/img/ (kadrovi isječeni iz fotografija hero-a, ImageMagick).
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html kao artifact (isti URL:
https://claude.ai/artifact/YVHQy2joUTm9avVS1mP3Wv), sa fajlovima img/*.jpg.
Izlaz (index.html, img/) se ne čuva u gitu — uvijek se pravi iz vijesti.js.
"""
import pathlib, subprocess
HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
IMG = HERE / 'img'
IMG.mkdir(exist_ok=True)

# pet različitih kadrova iz dvije fotografije (noćni pogled iz hero-a + drveće sa reflektorom)
NOC = REPO / 'jahorina-hero-v2/assets/jahorina-noc.jpg'
DRV = REPO / 'project/assets/jahorina-hero.jpg'
CROPS = {
    's1-noc': (NOC, None),
    's2-drvece': (DRV, None),
    's3-naselje': (NOC, '1000x667+0+560'),
    's4-reflektor': (DRV, '1300x867+1150+150'),
    's5-staza': (NOC, '1100x733+880+90'),
}
for name, (img, crop) in CROPS.items():
    out = IMG / (name + '.jpg')
    if not out.exists():
        cmd = ['convert', str(img)] + (['-crop', crop, '+repage'] if crop else []) + ['-resize', '1600x', '-quality', '82', str(out)]
        subprocess.run(cmd, check=True)
        subprocess.run(['convert', str(out), '-resize', '300x300^', '-gravity', 'center', '-extent', '300x300', '-quality', '80', str(IMG / (name + '-300.jpg'))], check=True)

SRC = (HERE.parent / 'vijesti.js').read_text(encoding='utf-8')
assert "var O = location.origin;" in SRC
SRC = SRC.replace("var O = location.origin;", "var O = window.__O || location.origin;")
assert '</script' not in SRC

page = r'''<title>Jahorina vijesti</title>
<style>
:root{color-scheme:dark}
html,body{background:#0A1120}
body{margin:0;min-height:100%}
</style>
<div id="jv-vijesti"></div>
<script>
(function () {
  // probne objave u obliku kao ih vraća WordPress (pregled ne može čitati pravi sajt)
  var O = 'https://www.oc-jahorina.com', IMG = new URL('img/', location.href).href;
  window.__O = O;
  function m(id, f) { return { id: id, source_url: IMG + f + '.jpg', media_details: { sizes: {
    thumbnail: { width: 300, height: 300, source_url: IMG + f + '-300.jpg' },
    large: { width: 1600, height: 1067, source_url: IMG + f + '.jpg' } } } }; }
  function P(id, date, slug, media, title, ex) {
    return { id: id, date: date, link: O + '/' + slug + '/', featured_media: id, title: { rendered: title }, excerpt: { rendered: '<p>' + ex + ' [&hellip;]</p>' },
      _embedded: { 'wp:featuredmedia': [m(id, media)] } };
  }
  var POSTS = [
    P(105, '2026-10-01T10:00:00', 'pretprodaja-ski-karata', 's1-noc', 'Pretprodaja ski karata za sezonu 2026/27 počinje 20. septembra',
      'Pretprodaja sezonskih ski karata počinje 20. septembra na blagajnama Olimpijskog centra i u web shopu.'),
    P(104, '2026-09-28T09:12:00', 'obavjestenje-otvaranje-ponuda', 's4-reflektor', 'Obavještenje',
      'Obavještenje U prostorijama Akcionarskog društva Olimpijski centar &#8222;Jahorina&#8220; Pale &#8211; Ruski dom, Jahorina bb, u utorak 06.10. 2026. godine u 12,00 časova pristupiće se otvaranju ponuda koje su pristigle na javni poziv'),
    P(103, '2026-09-18T08:30:00', 'pripreme-staza', 's5-staza', 'Počinju pripreme staza za zimsku sezonu 2026/27',
      'Na stazama su u toku radovi na održavanju i pripremi sistema za vještačko osnježavanje pred početak zimske sezone.'),
    P(102, '2026-09-04T08:00:00', 'odluka-o-cijenama', 's3-naselje', 'Odluka o cijenama usluga za zimsku sezonu 2026/27',
      'Skupština Akcionarskog društva usvojila je odluku o cijenama usluga za zimsku sezonu 2026/27.'),
    P(101, '2026-07-21T15:40:00', 'izmjena-radnog-vremena', 's2-drvece', 'Izmjena radnog vremena ljetnih atrakcija',
      'OBAVJEŠTENJE Zbog remonta žičare u srijedu 22.07. i četvrtak 23.07. doći će do izmjene radnog vremena ljetnih atrakcija.')
  ];
  function res(b) { return Promise.resolve(new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } })); }
  window.fetch = function (url) {
    url = String(url);
    return new Promise(function (r) { setTimeout(r, 350); }).then(function () {
      if (/wp\/v2\/categories/.test(url)) return res([{ id: 7 }]);
      if (/wp\/v2\/posts/.test(url)) return res(POSTS);
      return res([]);
    });
  };
  // u pregledu linkovi ne vode na sajt
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('#jv-vijesti a'); if (a) e.preventDefault(); });
})();
</script>
<script>
__SRC__
</script>
'''
(HERE / 'index.html').write_text(page.replace('__SRC__', SRC), encoding='utf-8')
print('ok')
