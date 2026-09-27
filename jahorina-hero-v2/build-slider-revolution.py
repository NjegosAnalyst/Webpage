#!/usr/bin/env python3
"""Pravi Slider Revolution verziju hero-a iz index.html.

Opcija A: meni dolazi iz Betheme teme, pa se gornji red hero-a (logo + meni)
uklanja, a dugmad "Web shop" i "Ski mapa" prelaze ispod opisa.

Izlaz (za SR se lijepe na 3 mjesta):
  slider-revolution/          — sa oznakama ZAMIJENI-URL-... za slike
  slider-revolution-spremno/  — sa već upisanim URL-ovima iz WordPress Medija

Pokretanje:  python3 build-slider-revolution.py
"""
import re
from pathlib import Path

HERE = Path(__file__).parent
MEDIA = 'https://oc-jahorina.com/wp-content/uploads/2026/09/'

src = (HERE / 'index.html').read_text()
css = src[src.index('<style>') + 7:src.index('</style>')].replace('  html,body{margin:0;padding:0}\n', '')
body = src[src.index('<body>') + 6:src.index('</body>')]
html = body[:body.index('<script>')]
js = body[body.index('<script>') + 8:body.rindex('</script>')].strip()

# --- HTML: ukloni gornji red, dugmad premjesti ispod opisa -----------------
header = re.search(r'\s*<!-- ===== HEADER ===== -->\s*<header class="jh-header">.*?</header>', html, re.S)
assert header, 'header nije pronađen'
ski = re.search(r'<a href="[^"]*" class="jh-btn jh-btn--ghost">.*?</a>', header.group(0), re.S).group(0)
shop = re.search(r'<a href="[^"]*" class="jh-btn jh-btn--solid">.*?</a>', header.group(0), re.S).group(0)
html = html.replace(header.group(0), '')

intro = re.search(r'<div class="jh-intro">(.*?)\n    </div>', html, re.S)
assert intro, 'jh-intro nije pronađen'
html = html.replace(intro.group(0),
    '<div class="jh-intro"><div class="jh-intro__row">' + intro.group(1) + '</div>'
    '<div class="jh-ctas">' + shop + ski + '</div>\n    </div>')

# SR svaki novi red u sloju pretvara u <br> — sve u jedan red, bez komentara
html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
html = re.sub(r'\s*\n\s*', ' ', html).strip()
html = re.sub(r'>\s+<', '><', html)

# --- CSS -------------------------------------------------------------------
SR_RESET = """
/* Slider Revolution sloju daje svoje stilove teksta (nowrap, line-height, veličina) — ovdje ih poništavamo */
.jh-hero{white-space:normal!important;line-height:normal;letter-spacing:normal;text-align:left;font-size:16px;font-weight:400;color:#fff;width:100%}
.jh-hero *{white-space:inherit}
.jh-hero .jh-btn,.jh-hero .jh-rating{white-space:nowrap}
.jh-hero .jh-ch,.jh-hero .jh-type{white-space:pre}

/* --- zaštita od Slider Revolution stilova: SVG ikonice i razmak redova --- */
.jh-hero br{display:none!important}   /* SR pretvara nove redove u <br> */
.jh-hero svg{overflow:visible}
.jh-hero svg [stroke]:not([stroke="none"]){stroke:currentColor!important}
.jh-hero svg [fill]:not([fill="none"]){fill:currentColor!important}
.jh-hero svg[fill="none"],.jh-hero svg [fill="none"]{fill:none!important}
.jh-hero .jh-quick__item,.jh-hero .jh-btn--ghost,.jh-hero .jh-burger,.jh-hero .jh-nav__link{color:#fff}
.jh-hero .jh-quick__item svg{display:block;width:22px;height:22px;flex-shrink:0}
.jh-hero .jh-title{line-height:.94!important}
.jh-hero .jh-title > span{display:block!important;line-height:.94!important}
.jh-hero .jh-ch,.jh-hero .jh-type{line-height:inherit!important}
.jh-hero .jh-nav__link,.jh-hero .jh-btn,.jh-hero .jh-kicker{line-height:1.2!important}
.jh-hero .jh-dropdown__menu a{line-height:1.3!important}
.jh-hero .jh-intro p{line-height:1.55!important}
.jh-hero .jh-rating,.jh-hero .jh-rating *{line-height:1!important}
.jh-hero .jh-quick__label{line-height:1.1!important}
.jh-hero .jh-nav__link,.jh-hero .jh-btn{align-items:center!important}
"""

SR_LAYOUT = """
/* ===== Opcija A: meni je iz teme; Web shop i Ski mapa su ispod opisa ===== */
.jh-hero .jh-intro{flex-direction:column;align-items:flex-start;gap:22px;max-width:none}
.jh-intro__row{display:flex;align-items:flex-end;gap:26px;max-width:420px}
.jh-ctas{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
/* naslov se prilagođava i visini ekrana, da ne udari u dugmad na nižim ekranima */
.jh-hero .jh-title{font-size:clamp(46px,min(8.4vw,13vh),132px)}
.jh-hero .jh-headline{top:clamp(140px,22%,220px)}
@media (max-width:760px){
  .jh-hero .jh-headline{padding-top:130px}
  .jh-hero .jh-ctas{padding:0}
  .jh-hero .jh-ctas .jh-btn--ghost{display:inline-flex}
  .jh-hero .jh-ctas .jh-btn{padding:12px 20px;font-size:14px}
}
"""

css_out = ("/* =====================================================================\n"
           "   JAHORINA HERO — DIO 2: CSS  (Slider Revolution → ⚙ → CSS/jQuery → CUSTOM CSS)\n"
           "   ===================================================================== */\n"
           "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap');\n"
           + SR_RESET + css.strip() + "\n" + SR_LAYOUT)

js_out = ("/* =====================================================================\n"
          "   JAHORINA HERO — DIO 3: JavaScript  (Slider Revolution → ⚙ → CSS/jQuery → CUSTOM JS SR6)\n"
          "   Ne treba ništa mijenjati.\n"
          "   ===================================================================== */\n"
          "(function waitForHero(tries) {\n"
          "  // Slider Revolution ubacuje slojeve malo kasnije — sačekaj da hero postoji, pa pokreni (samo jednom)\n"
          "  if (!document.querySelector('.jh-hero')) {\n"
          "    if ((tries || 0) < 200) setTimeout(function () { waitForHero((tries || 0) + 1); }, 50);\n"
          "    return;\n"
          "  }\n"
          "  if (window.__jahorinaHeroStarted) return;\n"
          "  window.__jahorinaHeroStarted = true;\n\n"
          + js + "\n})();\n")


def with_urls(text, prefix):
    for f in ('jahorina-noc.webp', 'jahorina-noc.jpg', 'logo-white-lockup.png'):
        text = text.replace('assets/' + f, prefix + f)
    return text


# --- engleska verzija: isti hero, prevedeni tekstovi i engleski linkovi ------
EN = [
    ('aria-label="Olimpijski centar Jahorina"', 'aria-label="Olympic Centre Jahorina"'),
    ('aria-label="Noćno skijanje na Jahorini"', 'aria-label="Night skiing on Jahorina"'),
    ('>Olimpijski centar Jahorina<', '>Olympic Centre Jahorina<'),
    ('aria-label="Otkrij čaroliju Jahorine"', 'aria-label="Discover the magic of Jahorina"'),
    ('<span>Otkrij</span>', '<span>Discover</span>'),
    ('<span>čaroliju</span>', '<span>the magic of</span>'),
    ('<span class="jh-dot"></span></span>ne</span>', '<span class="jh-dot"></span></span>na</span>'),
    ('Olimpijske staze, noćno skijanje i vrhunsko gostoprimstvo — doživi zimu na najpoznatijoj planini regije.',
     'Olympic slopes, night skiing and first-class hospitality — experience winter on the most famous mountain in the region.'),
    ('aria-label="Ocjena 4.8"', 'aria-label="Rating 4.8"'),
    ('https://www.oc-jahorina.com/ski-mapa/', 'https://www.oc-jahorina.com/en/ski-mapa/'),
    ('Ski mapa', 'Ski map'),
    ('https://www.oc-jahorina.com/ski-info/', 'https://www.oc-jahorina.com/en/ski-info/'),
    ('aria-label="Dnevno skijanje" title="Dnevno skijanje"', 'aria-label="Day skiing" title="Day skiing"'),
    ('>DNEVNO<', '>DAY<'),
    ('https://www.oc-jahorina.com/nocno-skijanje-info/', 'https://www.oc-jahorina.com/en/nocno-skijanje-info/'),
    ('aria-label="Noćno skijanje" title="Noćno skijanje"', 'aria-label="Night skiing" title="Night skiing"'),
    ('>NOĆNO<', '>NIGHT<'),
    ('aria-label="Virtuelna tura 360°" title="Virtuelna tura 360°"', 'aria-label="360° virtual tour" title="360° virtual tour"'),
    ('aria-label="Kamere uživo" title="Kamere uživo"', 'aria-label="Live cameras" title="Live cameras"'),
    ('>UŽIVO<', '>LIVE<'),
]
html_en = html
for a, b_ in EN:
    assert a in html_en, 'EN: nije pronađeno ' + a
    html_en = html_en.replace(a, b_)

for folder, prefix, h in (('slider-revolution', 'ZAMIJENI-URL-', html),
                          ('slider-revolution-spremno', MEDIA, html),
                          ('slider-revolution-EN-spremno', MEDIA, html_en)):
    out = HERE / folder
    out.mkdir(exist_ok=True)
    (out / '1-html.html').write_text(with_urls(h, prefix) + '\n')
    (out / '2-css.css').write_text(with_urls(css_out, prefix))
    (out / '3-js.js').write_text(js_out)
    for f in ('1-html.html', '2-css.css', '3-js.js'):
        assert 'assets/' not in (out / f).read_text(), f
print('Gotovo: slider-revolution/, slider-revolution-spremno/ i slider-revolution-EN-spremno/')
