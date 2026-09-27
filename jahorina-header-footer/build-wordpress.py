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

/* --- meni na telefonu (Betheme bočni meni): tamna pozadina --- */
#Side_slide{background:#111a2c!important}
#Side_slide #menu ul li a,#Side_slide .extras a{color:rgba(255,255,255,.88)!important;font-family:'Barlow',sans-serif!important}
#Side_slide #menu ul li a:hover{color:#00B9F2!important}
"""

out = HERE / 'wordpress'
out.mkdir(exist_ok=True)
(out / '1-footer-snippet.html').write_text(footer_snippet)
(out / '2-header-style.css').write_text(header_css)
print('Gotovo: wordpress/1-footer-snippet.html i wordpress/2-header-style.css')
