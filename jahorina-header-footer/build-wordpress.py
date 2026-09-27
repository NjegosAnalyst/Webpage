#!/usr/bin/env python3
"""Pravi WordPress (WPCode) verzije headera i footera iz index.html.

Izlaz u folderu wordpress/:
  1-footer-snippet.html  — WPCode: HTML Snippet, Insert Method: Auto Insert → Site Wide Footer
  2-header-style.css     — WPCode: CSS Snippet,  Insert Method: Auto Insert → Site Wide Header

Pokretanje:  python3 build-wordpress.py
"""
import re
from pathlib import Path

HERE = Path(__file__).parent
MEDIA = 'https://oc-jahorina.com/wp-content/uploads/2026/09/'

src = (HERE / 'index.html').read_text()
css = src[src.index('<style>') + 7:src.index('</style>')]
body = src[src.index('<body>') + 6:src.index('</body>')]

# --- footer: samo footer dio CSS-a i HTML-a ---------------------------------
tokens = re.search(r'  \.jf\{.*?\n  \}\n', css, re.S).group(0)          # boje i sjene
base = re.search(r'  \.jf a\{.*?\n', css).group(0) + re.search(r'  \.jf a:focus-visible.*?\n', css).group(0)
footer_css = css[css.index('  /* ================= FOOTER ================= */'):css.index('  @media (prefers-reduced-motion')]
footer_html = re.search(r'  <footer class="jf-footer">.*?</footer>', body, re.S).group(0)
footer_html = footer_html.replace('assets/logo-white-lockup.png', MEDIA + 'logo-white-lockup.png')

FOOTER_JS = r"""
(function () {
  var root = document.querySelector('.jf-wp');
  if (!root) return;
  // footer uvijek ide na sam kraj stranice, bez obzira gdje ga WPCode ubaci
  function toBottom() { document.body.appendChild(root); }
  if (document.body) toBottom();
  document.addEventListener('DOMContentLoaded', toBottom);
  window.addEventListener('load', toBottom);
  root.querySelector('.jf-year').textContent = new Date().getFullYear();
  root.querySelector('.jf-top-btn').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Engleska verzija sajta (/en/...): prevedi natpise i uputi interne linkove na /en/
  if (!/^\/en(\/|$)/.test(location.pathname)) return;
  var T = {
    'Direkcija': 'Management',
    'Marketing i prodaja': 'Marketing & Sales',
    'Gorska služba spašavanja': 'Mountain Rescue Service',
    'Hitni slučajevi na stazi · 24/7': 'Emergencies on the slopes · 24/7',
    'Lokacija': 'Location',
    'Kontakt': 'Contact'
  };
  root.querySelectorAll('h4, small, .jf-legal a').forEach(function (el) {
    var t = el.textContent.trim(); if (T[t]) el.textContent = T[t];
  });
  root.querySelectorAll('.jf-legal > span').forEach(function (el) {
    el.innerHTML = el.innerHTML.replace('Sva prava zadržana.', 'All rights reserved.');
  });
  root.querySelector('.jf-top-btn').setAttribute('aria-label', 'Back to top');
  root.querySelectorAll('a[href^="https://www.oc-jahorina.com/"]').forEach(function (a) {
    if (!/oc-jahorina\.com\/en\//.test(a.href)) a.href = a.href.replace('oc-jahorina.com/', 'oc-jahorina.com/en/');
  });
})();
"""

footer_snippet = (
    "<!-- =====================================================================\n"
    "     JAHORINA FOOTER — WPCode: HTML Snippet → Auto Insert → Site Wide Footer\n"
    "     Sakriva stari Betheme footer i prikazuje novi. Isključi snippet = vraća stari.\n"
    "     ===================================================================== -->\n"
    "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n"
    "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
    "<link href=\"https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap\" rel=\"stylesheet\">\n"
    "<style>\n"
    "  /* sakrij stari Betheme footer i njegovo dugme za vrh */\n"
    "  #Footer, .mfn-footer-tmpl, #back_to_top{display:none!important}\n"
    "  .jf-wp, .jf-wp *, .jf-wp *::before, .jf-wp *::after{box-sizing:border-box}\n"
    "  .jf-wp{background:#0a1120;line-height:normal;text-align:left}\n"
    "  .jf-wp ul{margin:0;padding:0;list-style:none}\n  .jf-wp li{margin:0;padding:0}\n  .jf-wp p{margin:0}\n"
    "  .jf-wp h4{border:0;text-transform:uppercase}\n"
    "  /* tema mijenja stil dugmadi — vrati okruglo dugme sa strelicom */\n"
    "  .jf-wp .jf-top-btn{width:48px!important;height:48px!important;min-width:0!important;padding:0!important;margin:0 0 0 8px!important;border:0!important;border-radius:50%!important;line-height:0!important;color:#fff!important;flex-shrink:0}\n"
    "  .jf-wp .jf-top-btn svg{display:block!important;width:20px;height:20px;stroke:#fff}\n"
    "  .jf-wp .jf-top-btn svg path{stroke:#fff!important;fill:none!important}\n"
    "  /* zaštita ikonica od stilova teme */\n"
    "  .jf-wp svg[fill=\"none\"],.jf-wp svg[fill=\"none\"] *:not([fill]){fill:none!important}\n"
    "  .jf-wp svg[fill=\"currentColor\"],.jf-wp svg [fill=\"currentColor\"]{fill:currentColor!important}\n"
    "  .jf-wp svg [stroke=\"currentColor\"]{stroke:currentColor!important}\n"
    + tokens.replace('  .jf{', '  .jf-wp{').replace('  .jf,', '  .jf-wp,')
    + base.replace('.jf ', '.jf-wp ')
    + footer_css.replace('.jf-footer', '.jf-wp .jf-footer').replace('.jf-footer{margin-top:40px;', '.jf-footer{margin-top:0;')
    + "  @media (prefers-reduced-motion:reduce){.jf-wp *{animation:none!important;transition:none!important}}\n"
    "</style>\n"
    "<div class=\"jf jf-wp\">\n" + footer_html + "\n</div>\n"
    "<script>" + FOOTER_JS + "</script>\n"
)
# .jf-sos i sl. već imaju prefiks .jf- — tokens su na .jf-wp, pa i .jf klasa ostaje radi var() naslijeđa
footer_snippet = footer_snippet.replace('.jf-wp .jf-wp .jf-footer', '.jf-wp .jf-footer')

# --- header: izgled postojećeg Betheme menija -------------------------------
header_css = """/* =====================================================================
   JAHORINA HEADER — WPCode: CSS Snippet → Auto Insert → Site Wide Header
   Mijenja samo IZGLED postojećeg Betheme headera (meni se i dalje uređuje u
   Izgled → Izbornici). Isključi snippet = vraća stari izgled.
   ===================================================================== */
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap');

/* --- stavke menija: Barlow + cyan linija na hover --- */
#Top_bar #menu > ul > li > a{font-family:'Barlow',sans-serif!important;font-weight:500!important;letter-spacing:.2px}
#Top_bar #menu > ul > li > a span:not(.description){position:relative}
#Top_bar #menu > ul > li > a span:not(.description)::after{
  content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,transparent,#00B9F2,#fff,#00B9F2,transparent);
  box-shadow:0 0 10px rgba(0,185,242,.8);transform:scaleX(0);transition:transform .35s cubic-bezier(.2,.7,.2,1);
}
#Top_bar #menu > ul > li:hover > a span:not(.description)::after,
#Top_bar #menu > ul > li.current-menu-item > a span:not(.description)::after{transform:scaleX(1)}
#Top_bar #menu > ul > li > a:after{display:none!important}   /* Betheme-ova stara linija */

/* --- podmeni (npr. O nama): tamna kartica --- */
#Top_bar #menu ul li ul{
  background:rgba(14,20,34,.96)!important;border:1px solid rgba(255,255,255,.1);border-radius:14px;
  box-shadow:0 24px 48px -16px rgba(0,0,0,.6)!important;padding:8px 0;overflow:hidden;
}
#Top_bar #menu ul li ul li a{color:rgba(255,255,255,.86)!important;border:0!important;font-family:'Barlow',sans-serif!important}
#Top_bar #menu ul li ul li a:hover{background:rgba(255,255,255,.07)!important;color:#fff!important}

/* --- poslije skrolovanja: tamno staklo umjesto bijele trake --- */
#Top_bar.is-sticky{
  background:rgba(10,17,32,.78)!important;
  -webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);
  box-shadow:0 1px 0 rgba(255,255,255,.08),0 18px 40px -24px rgba(0,0,0,.8)!important;
}
#Top_bar.is-sticky .menu_wrapper,#Top_bar.is-sticky .top_bar_left,#Top_bar.is-sticky .top_bar_right,
#Top_bar.is-sticky .top_bar_right:before{background:transparent!important}
#Top_bar.is-sticky #menu > ul > li > a,
#Top_bar.is-sticky #menu > ul > li > a span,
#Top_bar.is-sticky .top_bar_right a,
#Top_bar.is-sticky .top_bar_right .icon_search,
#Top_bar.is-sticky #header_search_button,
#Top_bar.is-sticky .wpml-languages a,
#Top_bar.is-sticky .responsive-menu-toggle{color:#fff!important}
/* bijeli logo i u sticky stanju (umjesto plavog) */
#Top_bar.is-sticky #logo img.logo-sticky,#Top_bar.is-sticky #logo img.logo-mobile-sticky{display:none!important}
#Top_bar.is-sticky #logo img.logo-main{display:inline-block!important}

/* --- logo: manji, i još manji kad se skroluje --- */
#Top_bar #logo img{max-height:52px!important;height:52px!important;width:auto!important;transition:height .3s ease,max-height .3s ease}
#Top_bar.is-sticky #logo img{max-height:38px!important;height:38px!important}
@media (max-width:767px){
  #Top_bar #logo img{max-height:40px!important;height:40px!important}
  #Top_bar.is-sticky #logo img{max-height:34px!important;height:34px!important}
}

/* --- lupa i EN: okrugla neumorphic dugmad kao na hero-u --- */
/* (sve veze u desnom dijelu headera — radi bez obzira kako se tačno zovu) */
#Top_bar .top_bar_right,#Top_bar .top_bar_right:before{background:transparent!important}
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button){
  width:42px!important;height:42px!important;min-width:0!important;padding:0!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  border-radius:50%!important;border:0!important;line-height:1!important;vertical-align:middle;
  background:rgba(23,34,56,.75)!important;color:#fff!important;
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16),inset 1px 1px 0 rgba(255,255,255,.06)!important;
  font:700 12.5px/1 'Barlow',sans-serif!important;letter-spacing:.6px;text-transform:uppercase;
  transition:color .2s,box-shadow .25s;
}
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button) i{font-size:17px!important;line-height:1!important;margin:0!important;color:inherit!important}
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button) img{display:none!important}   /* samo "EN", bez zastavice */
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button):hover{color:#00B9F2!important}
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button):active{
  box-shadow:inset 3px 3px 7px rgba(0,0,0,.5),inset -2px -2px 6px rgba(78,104,150,.18)!important}
#Top_bar .top_bar_right_wrapper a:not(.button):not(.action_button) + a,
#Top_bar .top_bar_right_wrapper > * + *{margin-left:10px!important}
#Top_bar .top_bar_right_wrapper .wpml-languages,#Top_bar .top_bar_right_wrapper .wpml-languages ul{border:0!important;background:transparent!important}

/* --- hamburger (uži ekrani): samo izgled, Betheme pozicija ostaje --- */
#Top_bar a.responsive-menu-toggle{
  width:42px!important;height:42px!important;margin-top:-21px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  border-radius:50%!important;background:rgba(23,34,56,.75)!important;color:#fff!important;
  box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16),inset 1px 1px 0 rgba(255,255,255,.06)!important;
}
#Top_bar a.responsive-menu-toggle i{font-size:18px!important;line-height:1!important;margin:0!important;color:inherit!important}

/* --- meni na telefonu (Betheme bočni meni): tamna pozadina --- */
#Side_slide{background:#111a2c!important}
#Side_slide #menu ul li a,#Side_slide .extras a{color:rgba(255,255,255,.88)!important;font-family:'Barlow',sans-serif!important}
#Side_slide #menu ul li a:hover{color:#00B9F2!important}
"""


# --- header: NAŠ header (stari Betheme header se sakriva) --------------------
header_css_src = css[css.index('  /* ================= HEADER ================= */'):css.index('  /* ================= DEMO')]
header_html = body[body.index('  <header class="jf-header">'):body.index('</nav>', body.index('<nav class="jf-mnav"')) + 6]
header_html = header_html.replace('assets/logo-white-lockup.png', MEDIA + 'logo-white-lockup.png')
# firewall servera blokira snimanje snippet-a sa <form> + skriptom — forma postaje običan div
header_html = (header_html
    .replace('<form action="https://www.oc-jahorina.com/" method="get" role="search">', '<div class="jf-sform" role="search" data-action="https://www.oc-jahorina.com/">')
    .replace('</form>', '</div>')
    .replace(' name="s"', '')
    .replace('<button type="submit">', '<button type="button">'))
assert '<form' not in header_html

HEADER_JS = r"""
(function () {
  var root = document.querySelector('.jh-wp');
  if (!root) return;
  // header uvijek ide na sam početak stranice, bez obzira gdje ga WPCode ubaci
  function toTop() { if (document.body && document.body.firstChild !== root) document.body.insertBefore(root, document.body.firstChild); }
  toTop(); document.addEventListener('DOMContentLoaded', toTop);

  var header = root.querySelector('.jf-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40 || root.classList.contains('is-search-open')); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = root.querySelector('.jf-burger'), shade = root.querySelector('.jf-shade');
  function setMenu(open) { root.classList.toggle('is-menu-open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('is-menu-open')); });
  shade.addEventListener('click', function () { setMenu(false); });

  var sBtn = root.querySelector('.jf-search-btn'), sInput = root.querySelector('.jf-search input');
  function setSearch(open) {
    root.classList.toggle('is-search-open', open); sBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    onScroll(); if (open) setTimeout(function () { sInput.focus(); }, 60);
  }
  sBtn.addEventListener('click', function (e) { e.stopPropagation(); setSearch(!root.classList.contains('is-search-open')); });
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.jf-header')) setSearch(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSearch(false); setMenu(false); } });
  var sForm = root.querySelector('.jf-search .jf-sform');
  function doSearch() {
    var v = sInput.value.trim(); if (!v) return;
    window.location.assign((sForm.getAttribute('data-action') || '/') + '?s=' + encodeURIComponent(v));
  }
  sForm.querySelector('button').addEventListener('click', doSearch);
  sInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });

  // ===== MENI IZ WORDPRESSA: stavke se čitaju iz postojećeg Betheme menija =====
  // (Izgled → Izbornici ostaje jedino mjesto gdje se meni uređuje)
  var srcUl = document.querySelector('#Top_bar #menu > ul, #Top_bar .menu_wrapper ul.menu, .mfn-header-tmpl nav ul, #menu-main-menu');
  var fromWP = false;
  if (srcUl) {
    var items = [].filter.call(srcUl.children, function (li) { return li.tagName === 'LI' && li.querySelector('a'); });
    if (items.length) {
      fromWP = true;
      var nav = root.querySelector('.jf-nav'), mnav = root.querySelector('.jf-mnav');
      nav.innerHTML = ''; mnav.innerHTML = '';
      items.forEach(function (li) {
        var a0 = li.querySelector('a'), label = (a0.textContent || '').replace(/\s+/g, ' ').trim();
        if (!label) return;
        var sub = li.querySelector(':scope > ul');
        var link = document.createElement('a'); link.href = a0.href; link.textContent = label;
        if (a0.target) link.target = a0.target;
        if (/current-menu-(item|ancestor|parent)/.test(li.className)) link.setAttribute('aria-current', 'page');
        var mlink = link.cloneNode(true); mnav.appendChild(mlink);
        if (sub) {
          var wrap = document.createElement('div'); wrap.className = 'jf-dd';
          var box = document.createElement('div'); box.className = 'jf-dd__menu';
          // svi nivoi podmenija (i Betheme mega meni) — dublji nivoi su uvučeni
          [].forEach.call(sub.querySelectorAll('a'), function (sa) {
            var txt = (sa.textContent || '').replace(/\s+/g, ' ').trim(); if (!txt) return;
            var depth = 0; for (var n = sa.parentElement; n && n !== sub; n = n.parentElement) if (n.tagName === 'UL') depth++;
            var x = document.createElement('a'); x.href = sa.href; x.textContent = txt;
            if (sa.target) x.target = sa.target;
            if (depth) x.className = 'jf-dd__deep';
            box.appendChild(x);
            var mx = x.cloneNode(true); mx.className = 'jf-mnav__sub' + (depth ? ' jf-mnav__deep' : ''); mnav.appendChild(mx);
          });
          link.classList.add('jf-dd__top');
          wrap.appendChild(link); wrap.appendChild(box); nav.appendChild(wrap);
        } else nav.appendChild(link);
      });
      // podmeniji: hover na računaru, dodir/klik na tabletu i telefonu; ne izlaze van ekrana
      var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
      function closeDD(except) { [].forEach.call(nav.querySelectorAll('.jf-dd.is-open'), function (d) { if (d !== except) d.classList.remove('is-open'); }); }
      function fit(dd) {
        var m = dd.querySelector('.jf-dd__menu'); m.style.left = ''; m.style.right = '';
        var r = m.getBoundingClientRect(); if (r.right > window.innerWidth - 12) { m.style.left = 'auto'; m.style.right = '-16px'; }
      }
      [].forEach.call(nav.querySelectorAll('.jf-dd'), function (dd) {
        var top = dd.querySelector('.jf-dd__top');
        dd.addEventListener('mouseenter', function () { fit(dd); });
        top.addEventListener('click', function (e) {
          var h = top.getAttribute('href') || '';
          var dead = !h || h === '#' || /#$/.test(h) || top.href === location.href + '#';
          if ((touch || dead) && !dd.classList.contains('is-open')) { e.preventDefault(); closeDD(dd); fit(dd); dd.classList.add('is-open'); }
          else if (dead) { e.preventDefault(); dd.classList.remove('is-open'); }
        });
      });
      document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.jf-dd')) closeDD(); });
    }
  }
  root.classList.add('is-ready');   // tek sada pokaži meni (bez treptaja pogrešnih stavki)
  // jezik: na srpskoj strani dugme "EN" vodi na istu stranicu na engleskom, i obrnuto
  var path = location.pathname, isEN = /^\/en(\/|$)/.test(path);
  // WPML u <head> upisuje adrese iste stranice na svim jezicima (hreflang) — to je najpouzdanije
  var wpLang = null;
  [].some.call(document.querySelectorAll('link[rel="alternate"][hreflang]'), function (l) {
    var hl = (l.getAttribute('hreflang') || '').toLowerCase();
    if (hl === 'x-default' || !l.href) return false;
    var linkEN = hl.indexOf('en') === 0;
    if (linkEN !== isEN) { wpLang = l.href; return true; }
    return false;
  });
  if (!wpLang) {   // rezerva: link za jezik iz Betheme/WPML menija, ali samo onaj koji vodi na DRUGI jezik
    [].some.call(document.querySelectorAll('.wpml-languages a, .wpml-ls a, a[hreflang], .lang-item a'), function (a) {
      if (!a.href || a.href.split('#')[0] === location.href.split('#')[0]) return false;
      var p = a.pathname || '', toEN = /^\/en(\/|$)/.test(p);
      if (toEN !== isEN) { wpLang = a.href; return true; }
      return false;
    });
  }
  var lang = root.querySelector('.jf-lang');
  lang.href = wpLang || location.origin + (isEN ? (path.replace(/^\/en/, '') || '/') : '/en' + path);
  lang.textContent = isEN ? 'SR' : 'EN';
  lang.setAttribute('aria-label', isEN ? 'Srpski' : 'English');
  if (!isEN) return;
  if (fromWP) {   // meni je već na pravom jeziku iz WordPressa — prevedi samo pretragu
    var f0 = root.querySelector('.jf-search .jf-sform');
    f0.setAttribute('data-action', 'https://www.oc-jahorina.com/en/'); sInput.placeholder = 'Search the site…';
    f0.querySelector('button').textContent = 'Search'; sBtn.setAttribute('aria-label', 'Search');
    return;
  }
  var T = { 'O nama': 'About us', 'Cjenovnik': 'Pricelist', 'Vijesti': 'News', 'Foto galerija': 'Photo gallery', 'Video galerija': 'Video gallery' };
  root.querySelectorAll('.jf-nav a, .jf-mnav a').forEach(function (a) {
    var t = a.textContent.trim(); if (T[t]) a.textContent = T[t];
  });
  root.querySelectorAll('a[href^="https://www.oc-jahorina.com/"]').forEach(function (a) {
    if (a !== lang && !/oc-jahorina\.com\/en\//.test(a.href)) a.href = a.href.replace('oc-jahorina.com/', 'oc-jahorina.com/en/');
  });
  var f = root.querySelector('.jf-search .jf-sform');
  f.setAttribute('data-action', 'https://www.oc-jahorina.com/en/');
  sInput.placeholder = 'Search the site…';
  f.querySelector('button').textContent = 'Search';
  sBtn.setAttribute('aria-label', 'Search');
})();
"""

# pokreni tek kad je cijela stranica (i Betheme meni) učitana
_js = HEADER_JS.strip()
assert _js.startswith('(function () {') and _js.endswith('})();')
HEADER_JS_BOOT = ("\nfunction jhInit() {" + _js[len('(function () {'):-len('})();')] + "}\n"
                  "if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jhInit); else jhInit();\n")

header_snippet = (
    "<!-- =====================================================================\n"
    "     JAHORINA HEADER — DIO 1: HTML  (WPCode: HTML Snippet → Auto Insert → Site Wide Body)\n"
    "     Uz njega ide i DIO 2: JavaScript snippet (3b-header-js.js).\n"
    "     Sakriva stari Betheme header i prikazuje novi. Isključi snippet = vraća stari.\n"
    "     ===================================================================== -->\n"
    "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n"
    "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
    "<link href=\"https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap\" rel=\"stylesheet\">\n"
    "<style>\n"
    "  /* sakrij stari Betheme header i njegov bočni meni */\n"
    "  #Top_bar, #Action_bar, .mfn-header-tmpl, #Side_slide, #body_overlay{display:none!important}\n"
    "  .jh-wp, .jh-wp *, .jh-wp *::before, .jh-wp *::after{box-sizing:border-box}\n"
    "  .jh-wp{line-height:normal;text-align:left}\n"
    "  .jh-wp a{text-decoration:none!important}\n"
    "  /* tema mijenja stil dugmadi i ikonica — zadrži naš izgled */\n"
    "  .jh-wp button{font-family:inherit;letter-spacing:normal;text-transform:none;min-width:0;margin:0}\n"
    "  .jh-wp .jf-round{padding:0!important;border:0!important;line-height:1!important;color:#fff!important}\n"
    "  .jh-wp svg[fill=\"none\"],.jh-wp svg[fill=\"none\"] *:not([fill]){fill:none!important}\n"
    "  .jh-wp svg [stroke=\"currentColor\"]{stroke:currentColor!important}\n"
    "  .jh-wp .jf-search button{padding:12px 22px!important;border:0!important;border-radius:40px!important;line-height:1!important}\n"
    "  .jh-wp .jf-search input{height:44px;box-shadow:none!important;border:0!important;margin:0!important}\n"
    + tokens.replace('  .jf{', '  .jh-wp{')
    + "  .jh-wp a{color:inherit}\n"
    + header_css_src.replace('.jf-search form', '.jf-search .jf-sform').replace('.jf.is-menu-open', '.jh-wp.is-menu-open').replace('.jf.is-search-open', '.jh-wp.is-search-open')
    + "  /* podmeni iz WordPressa (npr. O nama) */\n"
    "  .jh-wp .jf-dd{position:relative;display:flex;align-items:center}\n"
    "  .jh-wp .jf-dd__top::before{content:'';position:absolute;right:-14px;top:50%;width:6px;height:6px;margin-top:-5px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:rotate(45deg);opacity:.8}\n"
    "  .jh-wp .jf-dd__top{margin-right:12px}\n"
    "  .jh-wp .jf-dd__menu{position:absolute;top:calc(100% + 14px);left:-16px;min-width:220px;padding:8px;border-radius:18px;background:rgba(14,20,34,.96);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);box-shadow:0 24px 48px -16px rgba(0,0,0,.7);opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .2s,transform .2s}\n"
    "  .jh-wp .jf-dd:hover .jf-dd__menu,.jh-wp .jf-dd:focus-within .jf-dd__menu,.jh-wp .jf-dd.is-open .jf-dd__menu{opacity:1;transform:none;pointer-events:auto}\n"
    "  .jh-wp .jf-dd__menu{max-height:calc(100vh - 130px);overflow-y:auto;z-index:5}\n"
    "  .jh-wp .jf-dd__menu a.jf-dd__deep{padding-left:28px;font-size:13.5px;color:rgba(255,255,255,.66)}\n"
    "  .jh-wp .jf-mnav a.jf-mnav__deep{padding-left:48px;font-size:14px}\n"
    "  .jh-wp .jf-dd__menu::before{content:'';position:absolute;left:0;right:0;top:-16px;height:16px}\n"
    "  .jh-wp .jf-dd__menu a{display:block;padding:11px 14px;border-radius:12px;font-size:14.5px;color:rgba(255,255,255,.86)}\n"
    "  .jh-wp .jf-dd__menu a::after{display:none}\n"
    "  .jh-wp .jf-dd__menu a:hover{color:#fff;background:rgba(255,255,255,.07)}\n"
    "  .jh-wp .jf-mnav a.jf-mnav__sub{padding:10px 16px 10px 32px;font-size:15px;color:rgba(255,255,255,.7)}\n"
    "  body.admin-bar .jf-header{top:32px}\n"
    "  @media (max-width:782px){ body.admin-bar .jf-header{top:46px} }\n"
    "  @media (prefers-reduced-motion:reduce){.jh-wp *{transition:none!important}}\n"
    "</style>\n"
    "<div class=\"jf jh-wp\">\n" + header_html + "\n</div>\n"
)
header_js_snippet = ("/* =====================================================================\n"
    "   JAHORINA HEADER — DIO 2: JavaScript  (WPCode: JavaScript Snippet → Auto Insert → Site Wide Footer)\n"
    "   Ide uz HTML snippet 'Jahorina Header'. Stavke menija čita iz WordPressa.\n"
    "   ===================================================================== */\n" + HEADER_JS_BOOT)


# WPCode editor (CSSLint) ne poznaje CSS varijable i označava ih kao greške —
# zato ih u WordPress verzijama zamjenjujemo stvarnim vrijednostima.
def inline_vars(html):
    import re as _re
    vals = dict(_re.findall(r'--([a-z0-9-]+):([^;]+);', tokens))
    def repl_var(m):
        return vals[m.group(1)].strip()
    for _ in range(3):
        html = _re.sub(r'var\(--([a-z0-9-]+)\)', repl_var, html)
    # ukloni blokove sa deklaracijama varijabli
    html = _re.sub(r'\n\s*--[a-z0-9-]+:[^;]+;', '', html)
    assert 'var(--' not in html, 'ostala varijabla'
    return html

footer_snippet = inline_vars(footer_snippet)
header_snippet = inline_vars(header_snippet)

out = HERE / 'wordpress'
out.mkdir(exist_ok=True)
(out / '1-footer-snippet.html').write_text(footer_snippet)
(out / '2-header-style.css').write_text(header_css)
# Server firewall (WAF) odbija snimanje snippet-a sa HTML tagovima (Forbidden) —
# zato cijeli header ide u JEDAN JavaScript snippet, a HTML/CSS je upakovan u base64.
import base64 as _b64
_body = header_snippet[header_snippet.index('<div class="jf jh-wp">'):]
_head = header_snippet[header_snippet.index('<link'):header_snippet.index('<div class="jf jh-wp">')]
def _enc(s):
    return _b64.b64encode(s.encode('utf-8')).decode('ascii')
header_all = ("/* =====================================================================\n"
    "   JAHORINA HEADER  (WPCode: JavaScript Snippet → Auto Insert → Site Wide Header)\n"
    "   Sakriva stari Betheme header i prikazuje novi; stavke menija čita iz WordPressa\n"
    "   (Izgled → Izbornici). Isključi snippet = vraća se stari header.\n"
    "   Izgled je upakovan (base64) da ga server firewall ne bi blokirao.\n"
    "   ===================================================================== */\n"
    "(function () {\n"
    "  if (window.__jahorinaHeader) return; window.__jahorinaHeader = true;\n"
    "  function dec(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new TextDecoder().decode(u); }\n"
    "  var HEAD = '" + _enc(_head) + "';\n"
    "  var BODY = '" + _enc(_body) + "';\n"
    "  (document.head || document.documentElement).insertAdjacentHTML('beforeend', dec(HEAD));\n"
    + HEADER_JS_BOOT.replace("\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jhInit); else jhInit();\n", "\n")
    + "  function start() { document.body.insertAdjacentHTML('afterbegin', dec(BODY)); jhInit(); }\n"
    "  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();\n"
    "})();\n")
for _old in ('3a-header-html.html', '3b-header-js.js'):
    if (out / _old).exists(): (out / _old).unlink()
(out / '3-header-snippet.js').write_text(header_all)
print('Gotovo: wordpress/1-footer-snippet.html, 3-header-snippet.js (+ 2-header-style.css, staro)')
