/* =====================================================================
   JAHORINA — NASLOV UNUTRAŠNJIH STRANICA (Betheme #Subheader)
   Umjesto velikog plavog banera sa fotografijom: niska tamna traka (#0A1120,
   kao footer), H1 lijevo, breadcrumbs iznad naslova, tanka centrirana cyan
   linija pri dnu (ista kao na vrhu footera). Početna se ne dira.

   - H1 ostaje isti element (.title) — samo mijenjamo izgled.
   - Breadcrumbs: čitaju se iz Rank Math schema oznake BreadcrumbList
     (Rank Math → General Settings → Breadcrumbs: uključeno). Ako je nema,
     prikazuje se "Početna › naslov".
   - CSS ubacuje loader (4-naslov-loader.js) odmah u <head>, da nema treptaja
     starog banera; ovaj fajl dodaje samo breadcrumbs.
   ===================================================================== */
(function () {
  'use strict';
  if (window.__jahorinaNaslov) return;
  window.__jahorinaNaslov = true;

  var isEN = /^\/en(\/|$)/.test(location.pathname);
  var HOME = isEN ? { name: 'Home', url: '/en/' } : { name: 'Početna', url: '/' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // nazivi iz schema oznake dolaze sa HTML entitetima (npr. &#8211; za crticu)
  function decode(s) {
    var t = document.createElement('textarea');
    t.innerHTML = s;
    return t.value;
  }

  // qTranslate ponekad ostavi oznake [:SH]…[:en]…[:] u nazivima
  function pickLang(s) {
    s = decode(s);
    if (!/\[:[a-zA-Z]{2}\]/.test(s)) return s;
    var want = isEN ? 'en' : 'sh', out = '', m, re = /\[:([a-zA-Z]{2})\]([\s\S]*?)(?=\[:[a-zA-Z]{0,2}\]|$)/g;
    while ((m = re.exec(s))) { if (m[1].toLowerCase() === want) out = m[2]; }
    return out || s.replace(/\[:[a-zA-Z]{0,2}\]/g, ' ').trim();
  }

  function crumbsFromSchema() {
    var nodes = [];
    [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      try {
        var j = JSON.parse(s.textContent);
        (j['@graph'] || [j]).forEach(function (n) { nodes.push(n); });
      } catch (e) { /* preskoči neispravan blok */ }
    });
    for (var i = 0; i < nodes.length; i++) {
      var t = [].concat(nodes[i]['@type'] || []);
      if (t.indexOf('BreadcrumbList') > -1 && nodes[i].itemListElement) {
        return nodes[i].itemListElement.map(function (it) {
          var item = it.item || {};
          return { name: pickLang(item.name || it.name || ''), url: item['@id'] || item.url || (typeof it.item === 'string' ? it.item : '') };
        }).filter(function (c) { return c.name; });
      }
    }
    return null;
  }

  function build() {
    var sh = document.getElementById('Subheader');
    if (!sh || document.body.classList.contains('home')) return;
    var col = sh.querySelector('.column') || sh.querySelector('.container') || sh;
    var title = sh.querySelector('.title');
    if (!title || col.querySelector('.jsh-bc')) return;

    var list = crumbsFromSchema();
    if (!list || list.length < 2) list = [HOME, { name: title.textContent.trim(), url: '' }];

    // posljednja stavka je ista stranica čiji je naslov (H1) odmah ispod — ne ponavljamo je
    var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim().toLowerCase(); };
    if (list.length > 1 && norm(list[list.length - 1].name) === norm(title.textContent)) list = list.slice(0, -1);

    var html = list.map(function (c, i) {
      var name = (i === 0) ? HOME.name : c.name;
      if (!c.url && i !== 0) return '<span>' + esc(name) + '</span>';
      return '<a href="' + esc(i === 0 ? HOME.url : c.url) + '">' + esc(name) + '</a>';
    }).join('<span class="jsh-sep" aria-hidden="true">›</span>') + '<span class="jsh-sep" aria-hidden="true">›</span>';

    var nav = document.createElement('nav');
    nav.className = 'jsh-bc';
    nav.setAttribute('aria-label', isEN ? 'Breadcrumb' : 'Putanja');
    nav.innerHTML = html;
    col.insertBefore(nav, col.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
