#!/usr/bin/env python3
"""Pregled cjenovnika ski karata za korisnika (artifact "Jahorina cjenovnik"): samo cjenovnik.

Stranica kao na sajtu (traka naslova + Elementor widgeti), preko nje radi pravi cjenovnik.js.
Cijene su u widgetima „Uređivač teksta“ — tako bi se ubuduće uređivale u WordPressu — prepisane
iz zvaničnih cjenovnika na sajtu (slike Cjenovnik-Zima-2026-*-KM-1 / EUR-3 / EUR-1, sezona 2026/27).
Ispod su i stari widgeti (naslov „Sezona“ kao H1, slike, dugmad „Preuzmi ovdje!“) — kod ih ukloni,
a linkove na zvanične cjenovnike prikaže kao dugmad za preuzimanje.
Pokretanje: python3 napravi-pregled.py → objavi pregled/index.html.
"""
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
UP = 'https://www.oc-jahorina.com/wp-content/uploads/2026/09/'

# ---- zvanični cjenovnici (prepisano sa slika na sajtu) ----
IND = [  # naziv, KM (djeca, odrasli, seniori i tinejdžeri), EUR
    ('panoramska vožnja', '15 | 30 | 23', '8 | 15,5 | 12'),
    ('noćno skijanje', '67 | 80 | 73', '34,5 | 41 | 37,5'),
    ('ski vrtić dnevna', '40 | 60 | 45', '20,5 | 31 | 23'),
    ('ski vrtić 4 sata', '30 | 40 | 35', '15 | 20 | 17'),
    ('4 sata dnevna', '67 | 80 | 73', '34,5 | 41 | 37,5'),
    ('dnevna', '83 | 98 | 90', '42,5 | 50,5 | 46'),
    ('dnevno noćna', '127 | 150 | 138', '65 | 77 | 70,5'),
    ('2-dnevna', '140 | 166 | 154', '71,5 | 85 | 79'),
    ('2-dnevna D+N', '237 | 280 | 258', '121,5 | 143,5 | 132'),
    ('3-dnevna', '203 | 240 | 221', '104 | 123 | 113'),
    ('3-dnevna D+N', '310 | 365 | 337', '158,5 | 187 | 172,5'),
    ('4-dnevna', '250 | 295 | 272', '128 | 151 | 139'),
    ('4-dnevna D+N', '380 | 450 | 415', '194,5 | 230 | 212,5'),
    ('5-dnevna', '292 | 345 | 318', '149,5 | 176,5 | 162,5'),
    ('5-dnevna D+N', '440 | 520 | 480', '225 | 266 | 245,5'),
    ('6-dnevna', '352 | 415 | 384', '180 | 212,5 | 196,5'),
    ('6-dnevna D+N', '529 | 625 | 577', '270,5 | 319,50 | 295'),
    ('7-dnevna', '364 | 430 | 397', '186,5 | 220 | 203'),
    ('7-dnevna D+N', '550 | 650 | 600', '281,5 | 332,5 | 307'),
    ('10 u sezoni D ili N', '520 | 750 | 577', '266 | 383,5 | 295'),
    ('10 u sezoni D+N', '852 | 1,100 | 946', '436 | 562,5 | 484'),
    ('10 U SEZONI D+N KORPORATIVNA', ' | 1,500 | ', ' | 767 | '),
    ('sezonski pers. /pon. - petak/ D', '683 | 1,250 | 1,126', '349,5 | 639,5 | 576'),
    ('sezonski pers /pon - petak/D+N', '930 | 1,700 | 1,531', '475,5 | 869,5 | 783'),
    ('sezonski personalizovani D', '1,093 | 2,000 | 1,800', '559 | 1022,5 | 920,5'),
    ('sezonski personalizovani D+N', '1,337 | 2,500 | 2,210', '684 | 1278,5 | 1,130'),
    ('sankalište 1 vožnja (sanke + lift Poljice)', ' | 20 | ', ' | 10,5 | '),
]
FAM = [  # naziv, KM (prvo dijete, drugo i ostala djeca, odrasli), EUR — pik sezone
    ('4-dnevna', '225 | 213 | 281', '115 | 109 | 144'),
    ('4-dnevna D+N', '342 | 323 | 428', '175 | 165,5 | 219'),
    ('5-dnevna', '263 | 248 | 328', '134,5 | 127 | 168'),
    ('5-dnevna D+N', '396 | 374 | 494', '202,5 | 191,5 | 252,5'),
    ('6-dnevna', '317 | 299 | 394', '162 | 153 | 201,5'),
    ('6-dnevna D+N', '476 | 450 | 594', '243,5 | 230 | 304'),
    ('7-dnevna', '328 | 309 | 409', '168 | 158 | 209,5'),
    ('7-dnevna D+N', '495 | 468 | 618', '253 | 239,5 | 316'),
    ('10 u sezoni', '468 | 442 | 713', '239,5 | 226 | 364,5'),
    ('10 u sezoni D+N', '767 | 724 | 1,045', '392,5 | 370,5 | 543,5'),
    ('sezonski pers /pon - petak/D+N', '837 | 791 | 1,615', '428 | 404,5 | 826'),
    ('sezonski personalizovani', '984 | 929 | 1,900', '503,5 | 475 | 971,5'),
    ('sezonski personalizovani D+N', '1,203 | 1,136 | 2,375', '615 | 581 | 1214,5'),
]
OSTALO = '''POPUSTI PREMA PERIODIMA
do 6.12.2026 | 20%
7.12.2026 – 20.12.2026 | 15%
21.12.2026 – 17.1.2027 | redovne cijene
18.1.2027 – 7.2.2027 | 15%
8.2.2027 – 28.2.2027 | redovne cijene
1.3.2027 – 7.3.2027 | 15%
od 8.3.2027 | 30%
Navedeni popust se ne primjenjuje na cijenu panoramske vožnje, ski vrtića (4 sata), sankališta, na ski karte 10 u sezoni i sve sezonske ski karte.
KATEGORIJE KORISNIKA
Djeca do 6 godina | do 6 | Besplatno skijanje u pratnji jedne odrasle osobe, osim u ski vrtiću.
Djeca | 6–14 | Navršenih 6 do navršenih 14 godina u vrijeme korištenja ski karte.
Tinejdžeri | 14–19 | Navršenih 14 do navršenih 19 godina u vrijeme korištenja ski karte.
Odrasli | 19–65 | Navršenih 19 do navršenih 65 godina u vrijeme korištenja ski karte.
Seniori | 65+ | Navršenih 65 godina u vrijeme korištenja ski karte.
NAPOMENE
Karta za panoramsku (pojedinačnu) vožnju gondolom se može iskoristiti na Gondoli Poljice i Gondoli Partizan bez skijaške opreme.
Doplata za pratnju (bez skijaške opreme) iznosi 5 KM po osobi za ski vrtić.
Karta koja važi za skijalište ne može se koristiti u ski vrtiću.
Od 4-dnevne karte na više obavezna je fotografija.
Karte od 2-dnevne do 7-dnevne koriste se u kontinuitetu.
Zamjena oštećene ili izgubljene karte se naplaćuje 10 KM po karti.
Depozit za key card je 10 KM.
Panoramska vožnja tabačem 50 KM/20 minuta.
U porodičnom cjenovniku odrasli su osobe od navršenih 14 do navršenih 65 godina.'''


def text_widget(lines):   # Elementor „Uređivač teksta“: jedan pasus, redovi razdvojeni <br>
    return ('<div class="elementor-element elementor-widget elementor-widget-text-editor" data-widget_type="text-editor.default">'
            '<div class="elementor-widget-container"><p>' + '<br>\n'.join(lines) + '</p></div></div>')


def price_widget(title, cols, rows, k):
    return text_widget([title, 'vrsta karte | ' + cols] + [f'{n} | {r[k]}' for n, *r in rows])


IND_COLS, FAM_COLS = 'djeca | odrasli | seniori i tinejdžeri', 'prvo dijete | drugo i ostala djeca | odrasli'
widgets = '\n'.join([
    price_widget('CJENOVNIK sezona 2026/27 INDIVIDUALNI KM', IND_COLS, IND, 0),
    price_widget('CJENOVNIK sezona 2026/27 INDIVIDUALNI EUR', IND_COLS, IND, 1),
    price_widget('CJENOVNIK sezona 2026/27 PORODIČNI KM (pik sezone)', FAM_COLS, FAM, 0),
    price_widget('CJENOVNIK sezona 2026/27 PORODIČNI EUR (pik sezone)', FAM_COLS, FAM, 1),
    text_widget(OSTALO.split('\n')),
])
# stari widgeti sa sadašnje stranice (kod ih ukloni; linkovi na cjenovnike postanu dugmad za preuzimanje)
old = ('<div class="elementor-element elementor-widget elementor-widget-heading"><div class="elementor-widget-container">'
       '<h1 class="elementor-heading-title">--Sezona 2026/27</h1></div></div>' +
       ''.join('<div class="elementor-element elementor-widget elementor-widget-button"><div class="elementor-widget-container">'
               f'<a class="elementor-button" href="{UP}Cjenovnik-Zima-2026-{f}.pdf">Preuzmi ovdje!</a></div></div>'
               for f in ('Individualni-KM', 'Individualni-EUR', 'Porodicni-KM', 'Porodicni-EUR')))

SRC = (HERE.parent / 'cjenovnik.js').read_text(encoding='utf-8')
assert '</script' not in SRC
page = r'''<title>Jahorina cjenovnik</title>
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
.pg-lang{display:flex;gap:6px;padding:5px;border-radius:16px;background:rgba(9,14,26,.88);box-shadow:inset 0 0 0 1px rgba(255,255,255,.09);flex-shrink:0}
.pg-lang button{all:unset;cursor:pointer;display:grid;place-items:center;min-width:44px;height:40px;padding:0 10px;border-radius:12px;font:600 12px/1 Archivo,sans-serif;letter-spacing:1.4px;color:rgba(255,255,255,.7);
  background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.pg-lang button[aria-pressed="true"]{color:#9BE6FF;box-shadow:inset 0 0 0 1px rgba(111,219,255,.42),0 0 16px -6px rgba(0,185,242,.5)}
.pg-lang button:focus-visible{outline:2px solid #00B9F2;outline-offset:3px}
.pg-note{margin:0;padding:0 16px 30px;text-align:center;font:400 13px/1.5 Barlow,sans-serif;color:rgba(255,255,255,.45)}
@media (max-width:760px){.pg-sub{padding:24px 16px 18px}.pg-sub h1{font-size:22px}.pg-bc{font-size:12px;margin-bottom:6px}}
</style>
<header class="pg-sub"><div class="pg-in"><div><p class="pg-bc"><a href="#" id="pg-home">Početna</a> <span>›</span></p><h1 id="pg-h1">Cjenovnik ski karata – sezona 2026/27</h1></div>
<div class="pg-lang" role="group" aria-label="Jezik pregleda"><button type="button" data-l="sr" aria-pressed="true">SR</button><button type="button" data-l="en" aria-pressed="false">EN</button></div></div></header>
<main id="Content"><div data-elementor-type="wp-page" class="elementor elementor-26674"><section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-element elementor-widget elementor-widget-html"><div class="elementor-widget-container"><div id="jck-cjenovnik" data-danas="2026-12-10"></div></div></div>
__WIDGETS__
__OLD__
</div></div></div></section></div></main>
<p class="pg-note" id="pg-note"></p>
<script type="text/plain" id="pg-kod">__SRC__</script>
<script>
(function () {
  var d = document, KOD = d.getElementById('pg-kod').textContent;
  var WRAP = d.querySelector('.elementor-widget-wrap'), IZVOR = WRAP.innerHTML;
  var TXT = { sr: { h1: 'Cjenovnik ski karata – sezona 2026/27', home: 'Početna', note: 'Pregled: datum je postavljen na 10. 12. 2026. da se vidi oznaka „Danas“. Cijene su prepisane iz zvaničnih cjenovnika na sajtu.' },
              en: { h1: 'Ski pass prices – season 2026/27', home: 'Home', note: 'Preview: the date is set to 10 Dec 2026 to show the “Today” label. Prices are copied from the official price lists on the website.' } };
  function run(lang) {
    WRAP.innerHTML = IZVOR;
    var root = d.getElementById('jck-cjenovnik');
    if (lang === 'en') root.setAttribute('data-lang', 'en');
    try { localStorage.removeItem('jckCur'); } catch (e) {}
    d.documentElement.lang = lang;
    d.getElementById('pg-h1').textContent = TXT[lang].h1;
    d.getElementById('pg-home').textContent = TXT[lang].home;
    d.getElementById('pg-note').textContent = TXT[lang].note;
    [].forEach.call(d.querySelectorAll('.pg-lang button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === lang ? 'true' : 'false'); });
    var s = d.createElement('script'); s.textContent = KOD; d.body.appendChild(s);
  }
  d.getElementById('pg-home').addEventListener('click', function (e) { e.preventDefault(); });
  d.querySelector('.pg-lang').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b && b.getAttribute('aria-pressed') !== 'true') run(b.getAttribute('data-l'));
  });
  run('sr');
})();
</script>
'''
page = page.replace('__WIDGETS__', widgets).replace('__OLD__', old).replace('__SRC__', SRC)
(HERE / 'index.html').write_text(page, encoding='utf-8')
print('pregled/index.html', len(page) // 1024, 'KB')
