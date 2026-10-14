#!/usr/bin/env python3
"""Ugrađuje (ili osvježava) zajednički blok "SEO i brzina" u sekcije početne (pravila početne, 14. 10. 2026).
Blok ide na kraj IIFE-a sekcije, između oznaka /* SEO-BRZINA:POCETAK */ … /* SEO-BRZINA:KRAJ */ (ponovno pokretanje ga zamijeni):
  · slike u bloku: loading="lazy", width/height (iz fajlova u slike/), alt dopunjen sa "— Olimpijska planina Jahorina"
    kad Jahorina nije pomenuta; isto za slike koje se dodaju kasnije (MutationObserver);
  · predučitavanje: kad je blok ~2 ekrana daleko, lazy slike se prebace na eager (Safari inače čeka do ivice ekrana);
  · rezerva: ako slika sa jsDelivr-a ne stigne, učita se sa raw.githubusercontent.com (isti puni commit iz adrese skripte);
  · telefon (≤ 760 px): bez backdrop-filter, bez filtera na slikama, plavi sloj (…-tint) bez mix-blend-mode; EXTRA = posebna pravila.
Upotreba: python3 alati/seo-brzina.py ratrak suvenirnica …
"""
import json, pathlib, re, sys
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent.parent
IDS = {'ratrak': 'jr-ratrak', 'suvenirnica': 'jsu-suvenirnica', 'bar': 'jb-bar', 'gondola': 'jg-gondola', 'depo': 'jsd-depo',
       'park': 'jsb-park', 'sankaliste': 'jsk-sankaliste', 'brojke': 'jpb-brojke'}
# posebna pravila za telefon (blok sa dvije fotografije stopljene lighten-om: na telefonu bez miješanja)
EXTRA = {
  'gondola': '#ID .jg-ph{mix-blend-mode:normal!important}#ID .jg-sky{display:none!important}#ID .jg-glow{mix-blend-mode:normal!important;opacity:.35}#ID .jg-in{display:none!important}',
}
A, B = '  /* SEO-BRZINA:POCETAK */', '  /* SEO-BRZINA:KRAJ */'
for name in sys.argv[1:]:
    js = HERE / name / f'{name}.js'
    s = js.read_text(encoding='utf-8')
    rid = IDS[name]
    dims = {}
    for f in sorted((HERE / name / 'slike').rglob('*')):
        if f.suffix.lower() in ('.webp', '.jpg', '.jpeg', '.png'):
            with Image.open(f) as im:
                dims[f.name] = list(im.size)
    phone = ('@media (max-width:760px){#ID *,#ID *::before,#ID *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'
             '#ID img{filter:none!important}#ID [class$="-tint"]{mix-blend-mode:normal!important;opacity:1!important;background:rgba(14,38,78,.32)!important}'
             + EXTRA.get(name, '') + '}').replace('#ID', '#' + rid)
    block = A + r"""
  /* ---------- SEO i brzina (pravila početne, 14. 10.; pravi ga alati/seo-brzina.py) ---------- */
  (function () {
    var SRC = (d.currentScript && d.currentScript.src) || '', DIMS = __DIMS__;
    var SUF = /^\/en(\/|$)/i.test(location.pathname) ? ' — Olympic Mountain Jahorina' : ' — Olimpijska planina Jahorina';
    var CDN = /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@\/]+)@([0-9a-f]{40})\//i, ok = CDN.test(SRC);
    function fix(im) {
      if (im.__jseo) return;
      im.__jseo = 1;
      if (!im.getAttribute('loading')) im.setAttribute('loading', 'lazy');
      var f = (im.getAttribute('src') || '').split(/[?#]/)[0].split('/').pop();
      if (!im.getAttribute('width') && DIMS[f]) { im.setAttribute('width', DIMS[f][0]); im.setAttribute('height', DIMS[f][1]); }
      var a = im.getAttribute('alt');
      if (a && !/jahorin/i.test(a)) im.setAttribute('alt', a + SUF);
      if (ok) im.addEventListener('error', function () {
        var u = im.currentSrc || im.src;
        if (im.__jfb || !CDN.test(u)) return;
        im.__jfb = 1; im.removeAttribute('srcset');
        im.src = u.replace(CDN, 'https://raw.githubusercontent.com/$1/$2/$3/');
      });
    }
    function all() { [].forEach.call(root.querySelectorAll('img'), fix); }
    all();
    if ('MutationObserver' in w) new MutationObserver(all).observe(root, { childList: true, subtree: true });
    if ('IntersectionObserver' in w) {
      var pio = new IntersectionObserver(function (es) {
        if (!es.some(function (e) { return e.isIntersecting; })) return;
        pio.disconnect();
        [].forEach.call(root.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = 'eager'; });
      }, { rootMargin: '1600px 0px 1600px 0px' });
      pio.observe(root);
    }
    // šav: bijela traka između ovog bloka i tamnog bloka iznad (razmak između Elementor kontejnera/sekcija, pola piksela)
    var DARK = '#jv-vijesti,#jr-ratrak,#jsu-suvenirnica,#jb-bar,#jg-gondola,#jsd-depo,#jsb-park,#jsk-sankaliste,#jpb-brojke,.jh-hero,rs-module-wrap,rs-fullwidth-wrap';
    // od bloka nagore: prvi nivo (widget, kolona, kontejner, sekcija) koji ima prethodnog vidljivog susjeda; ako je u tom
    // susjedu tamni blok, zatvara se sve od dna tog bloka do vrha ovog: razmak između kontejnera (margin/gap) negativnim
    // margin-top na tom nivou, a bijeli padding oba kontejnera negativnim margin-top na samom bloku (blok ih prekrije)
    function seam() {
      for (var el = root.parentElement; el && el.parentElement && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        // preskaču se nevidljivi i prazni elementi (prazan kontejner, Spacer, prazan widget: bez teksta, slika i videa)
        var prev = el.previousElementSibling;
        while (prev && (!prev.offsetHeight || /^(SCRIPT|STYLE|LINK)$/.test(prev.tagName) ||
          (prev.offsetHeight <= 200 && !prev.matches(DARK) && !prev.querySelector(DARK + ',img,svg,video,iframe,canvas,input,button') && !(prev.textContent || '').trim()))) prev = prev.previousElementSibling;
        if (!prev) continue;
        var dk = prev.matches(DARK) ? [prev] : [].slice.call(prev.querySelectorAll(DARK));
        if (!dk.length) return;
        dk = dk[dk.length - 1];
        // povlači se omotač bloka (pe), ne sam blok: margin-top bloka mijenja fit() (širenje preko ekrana), pa bi se smjenjivali
        var pe = root.parentElement;
        el.style.removeProperty('margin-top');
        if (pe !== el) pe.style.removeProperty('margin-top');
        var gap = el.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;   // i preko praznih elemenata između
        if (gap > .5 && gap <= 160) el.style.setProperty('margin-top', (parseFloat(getComputedStyle(el).marginTop) || 0) - gap + 'px', 'important');
        // ostatak (bijeli padding kontejnera iznad i ispod) prekrije blok
        var rest = root.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;
        if (rest > .5 && rest <= 160) pe.style.setProperty('margin-top', (parseFloat(getComputedStyle(pe).marginTop) || 0) - rest + 'px', 'important');
        root.style.boxShadow = '0 -2px 0 0 #0A1120';   // pola piksela između tamnih blokova
        return;
      }
    }
    // dno: ako je ispod bloka footer (naš .jf-wp ili footer teme), razmak do njega (padding/margin omotača stranice) se zatvori
    // negativnim margin-bottom na nivou čiji je sljedeći susjed footer, pa footer sjedne odmah ispod bloka
    var FOOT = '.jf-wp, .jf-footer, #Footer, footer, .mfn-footer-tmpl, .elementor-location-footer';
    function empty(x) {
      return !x.offsetHeight || /^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE)$/.test(x.tagName) ||
        (x.offsetHeight <= 200 && !x.matches(DARK + ',' + FOOT) && !x.querySelector(DARK + ',' + FOOT + ',img,svg,video,iframe,canvas,input,button') && !(x.textContent || '').trim());
    }
    function seamDown() {
      for (var el = root.parentElement; el && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        var nx = el.nextElementSibling;
        while (nx && empty(nx)) nx = nx.nextElementSibling;
        if (!nx) continue;
        if (!(nx.matches(FOOT) || nx.querySelector('.jf-wp, .jf-footer'))) return;
        el.style.removeProperty('margin-bottom');
        var gap = nx.getBoundingClientRect().top - root.getBoundingClientRect().bottom;
        if (gap > .5 && gap <= 240) el.style.setProperty('margin-bottom', (parseFloat(getComputedStyle(el).marginBottom) || 0) - gap + 'px', 'important');
        return;
      }
    }
    function reseam() { clearTimeout(reseam.t); reseam.t = setTimeout(function () { seam(); seamDown(); }, 160); }
    seamDown();
    seam();
    w.addEventListener('load', reseam);
    w.addEventListener('resize', reseam);
    if ('ResizeObserver' in w) new ResizeObserver(reseam).observe(d.body);
    var ps = d.getElementById('__ID__-seo-css');
    if (!ps) { ps = d.createElement('style'); ps.id = '__ID__-seo-css'; (d.head || d.documentElement).appendChild(ps); }
    ps.textContent = __PHONE__;
  })();
""" + B + '\n'
    block = block.replace('__DIMS__', json.dumps(dims, separators=(',', ':'))).replace('__ID__', rid).replace('__PHONE__', json.dumps(phone))
    if A in s:
        s = s[:s.index(A)] + block + s[s.index(B) + len(B) + 1:]
    else:
        i = s.rindex('})(window, document);')
        s = s[:i] + block + s[i:]
    js.write_text(s, encoding='utf-8')
    print('ok', name, len(dims), 'slika')
