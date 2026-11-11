#!/usr/bin/env python3
"""Ugrađuje (ili osvježava) zajednički blok "SEO i brzina" u sekcije početne (pravila početne, 14. 10. 2026).
Blok ide na kraj IIFE-a sekcije, između oznaka /* SEO-BRZINA:POCETAK */ … /* SEO-BRZINA:KRAJ */ (ponovno pokretanje ga zamijeni):
  · slike u bloku: loading="lazy", width/height (iz fajlova u slike/); isto za slike koje se dodaju kasnije (MutationObserver);
    alt se NE dopunjuje (SEO pravilo 15. 10.: alt samo opisuje šta je na slici, bez dodataka ključnih riječi);
  · predučitavanje: kad je blok ~2 ekrana daleko, lazy slike se prebace na eager (Safari inače čeka do ivice ekrana);
  · rezerva: ako slika sa jsDelivr-a ne stigne, učita se sa raw.githubusercontent.com (isti puni commit iz adrese skripte);
  · telefon (≤ 760 px): bez backdrop-filter, bez filtera na slikama, plavi sloj (…-tint) bez mix-blend-mode; EXTRA = posebna pravila.
Upotreba: python3 alati/seo-brzina.py ratrak suvenirnica …
"""
import json, pathlib, re, struct, sys


def img_size(f):
    """Širina i visina slike (webp, png, jpg) iz zaglavlja fajla — bez PIL-a (11. 11.: PIL u kontejneru ne radi)."""
    b = pathlib.Path(f).read_bytes()
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return list(struct.unpack('>II', b[16:24]))
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        c = b[12:16]
        if c == b'VP8X':
            return [int.from_bytes(b[24:27], 'little') + 1, int.from_bytes(b[27:30], 'little') + 1]
        if c == b'VP8L':
            v = int.from_bytes(b[21:25], 'little')
            return [(v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1]
        if c == b'VP8 ':
            w, h = struct.unpack('<HH', b[26:30])
            return [w & 0x3FFF, h & 0x3FFF]
    if b[:2] == b'\xff\xd8':
        i = 2
        while i < len(b):
            while b[i] == 0xFF:
                i += 1
            m = b[i]; i += 1
            if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7:
                continue
            ln = struct.unpack('>H', b[i:i + 2])[0]
            if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack('>HH', b[i + 3:i + 7])
                return [w, h]
            i += ln
    raise ValueError('nepoznat format slike: %s' % f)
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
            dims[f.name] = img_size(f)
    phone = ('@media (max-width:760px){#ID *,#ID *::before,#ID *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'
             '#ID img{filter:none!important}#ID [class$="-tint"]{mix-blend-mode:normal!important;opacity:1!important;background:rgba(14,38,78,.32)!important}'
             + EXTRA.get(name, '') + '}').replace('#ID', '#' + rid)
    block = A + r"""
  /* ---------- SEO i brzina (pravila početne, 14. 10.; pravi ga alati/seo-brzina.py) ---------- */
  (function () {
    var SRC = (d.currentScript && d.currentScript.src) || '', DIMS = __DIMS__;
    var CDN = /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@\/]+)@([0-9a-f]{40})\//i, ok = CDN.test(SRC);
    function fix(im) {
      if (im.__jseo) return;
      im.__jseo = 1;
      if (!im.getAttribute('loading')) im.setAttribute('loading', 'lazy');
      var f = (im.getAttribute('src') || '').split(/[?#]/)[0].split('/').pop();
      if (!im.getAttribute('width') && DIMS[f]) { im.setAttribute('width', DIMS[f][0]); im.setAttribute('height', DIMS[f][1]); }
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
    var DARK = '#jst-stanje,#jv-vijesti,#jr-ratrak,#jsu-suvenirnica,#jb-bar,#jg-gondola,#jsd-depo,#jsb-park,#jsk-sankaliste,#jpb-brojke,.jh-hero,rs-module-wrap,rs-fullwidth-wrap';
    // od bloka nagore: prvi nivo (widget, kolona, kontejner, sekcija) koji ima prethodnog vidljivog susjeda; ako je u tom
    // susjedu tamni blok, zatvara se sve od dna tog bloka do vrha ovog: razmak između kontejnera (margin/gap) negativnim
    // margin-top na tom nivou, a bijeli padding oba kontejnera negativnim margin-top na samom bloku (blok ih prekrije)
    function seam() {
      for (var el = root.parentElement; el && el.parentElement && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        // preskaču se nevidljivi i prazni elementi (prazan kontejner, Spacer, prazan widget: bez teksta, slika i videa)
        var prev = el.previousElementSibling;
        // (11. 11.: ista provjera kao za footer — i elementi van toka stranice, fiksirani/apsolutni, se preskaču)
        while (prev && empty(prev)) prev = prev.previousElementSibling;
        if (!prev) continue;
        var dk = prev.matches(DARK) ? [prev] : [].slice.call(prev.querySelectorAll(DARK));
        if (!dk.length) return;
        dk = dk[dk.length - 1];
        // povlači se omotač bloka (pe), ne sam blok: margin-top bloka mijenja fit() (širenje preko ekrana), pa bi se smjenjivali
        var pe = root.parentElement;
        el.style.removeProperty('margin-top');
        if (pe !== el) pe.style.removeProperty('margin-top');
        var gap = el.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;   // i preko praznih elemenata između
        // 11. 11. (analiza: bijela linija iznad ratraka na ~1000 px): zatvara se i razmak manji od pola piksela (ekrani sa
        // skaliranjem, npr. 125 %), a blok sjedne 1 px preko prethodnog — kao spoj sa footerom
        if (gap > .01 && gap <= 160) el.style.setProperty('margin-top', (parseFloat(getComputedStyle(el).marginTop) || 0) - gap + 'px', 'important');
        // ostatak (bijeli padding kontejnera iznad i ispod) prekrije blok
        var rest = root.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;
        if (rest > -1 && rest <= 160) pe.style.setProperty('margin-top', (parseFloat(getComputedStyle(pe).marginTop) || 0) - rest - 1 + 'px', 'important');
        SH.up = true; shadow();   // pola piksela između tamnih blokova
        return;
      }
    }
    // dno: ako je ispod bloka footer (naš .jf-wp ili footer teme), razmak do njega (padding/margin omotača stranice) se zatvori
    // negativnim margin-bottom na nivou čiji je sljedeći susjed footer, pa footer sjedne odmah ispod bloka
    var FOOT = '.jf-wp, .jf-footer, #Footer, footer, .mfn-footer-tmpl, .elementor-location-footer';
    // prazno = nevidljivo, skripta/stil, van toka stranice (fiksirano/apsolutno: Betheme #Side_slide i #body_overlay između
    // stranice i footera — 11. 11. su zaustavljali spoj, pa je ostajala bijela traka) ili mali element bez sadržaja
    function outOfFlow(x) { var cs = getComputedStyle(x); return cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none'; }
    function empty(x) {
      return !x.offsetHeight || /^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE)$/.test(x.tagName) || (!x.matches(FOOT) && outOfFlow(x)) ||
        (x.offsetHeight <= 200 && !x.matches(DARK + ',' + FOOT) && !x.querySelector(DARK + ',' + FOOT + ',img,svg,video,iframe,canvas,input,button') && !(x.textContent || '').trim());
    }
    // tamna sjenka od 2 px iznad (spoj sa blokom iznad) i ispod (spoj sa footerom): spoj na dijelu piksela preko bijele
    // pozadine stranice inače daje tanku svijetlu liniju (mjereno: telefon DPR 2,625 — red na spoju 40 umjesto ~18)
    var SH = { up: false, down: false };
    function shadow() {
      var a = [];
      if (SH.up) a.push('0 -2px 0 0 #0A1120');
      if (SH.down) a.push('0 2px 0 0 #0A1120');
      root.style.boxShadow = a.join(',');
    }
    function seamDown() {
      for (var el = root.parentElement; el && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        var nx = el.nextElementSibling;
        while (nx && empty(nx)) nx = nx.nextElementSibling;
        if (!nx) continue;
        if (!(nx.matches(FOOT) || nx.querySelector('.jf-wp, .jf-footer'))) return;
        el.style.removeProperty('margin-bottom');
        // bez zaokruživanja (i razmak od dijela piksela) i sa 1 px preklopa: footer sjedne 1 px preko dna bloka (oba su #0A1120)
        var gap = nx.getBoundingClientRect().top - root.getBoundingClientRect().bottom;
        if (gap > -1 && gap <= 240) el.style.setProperty('margin-bottom', (parseFloat(getComputedStyle(el).marginBottom) || 0) - gap - 1 + 'px', 'important');
        SH.down = true; shadow();
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
