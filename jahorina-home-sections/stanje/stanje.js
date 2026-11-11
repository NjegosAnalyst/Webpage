/* =====================================================================
   JAHORINA — STANJE SKIJALIŠTA I BRZI LINKOVI (početna, odmah ispod hero-a) · v1 (11. 11. 2026)
   Analiza nove početne (11. 11.): posjetilac odmah traži stanje staza, cijene ski karata, mapu i kamere, a početna ih
   nije imala. Sekcija ima dva dijela:
     · staklena traka STANJA: žičare (rade / ukupno), staze (otvorene / ukupno), snijeg, radno vrijeme dnevnog
       skijanja i vrijeme ažuriranja — podaci uživo sa stranice Ski info (dodatak „OC dnevni info“, REST API);
     · pet BRZIH KARTICA: Kupi ski kartu (web shop, cyan), Cijene ski karata, Ski mapa, Kamere uživo, Noćno skijanje.
   Tema sekcija (TEMA.md): tamna noćna pozadina (#0C1424, ista boja kao traka oko hero-a i vrh vijesti), staklene
   pločice, jedno cyan dugme, obična slova; bez fotografija i bez dugih animacija (sekcija je visoko na stranici).
   Ugradnja: Elementor HTML widget odmah ispod hero-a (red iz elementor-html-widget.html: <div id="jst-stanje"> sa
   statičkim linkovima za pretraživače + loader). Podešavanja na <div> (neobavezna): data-shop, data-cijene,
   data-mapa, data-kamere, data-nocno, data-info (adrese), data-stranica (slug stranice Ski info, „ski-info“).
   GA: klik na karticu ili „Sve staze i žičare“ → stanje_klik (cilj: webshop / cijene / mapa / kamere / nocno / ski_info).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jst-stanje');
  if (!root || root.__jst) return;
  root.__jst = true;

  var O = location.origin;
  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var L = EN ? '/en' : '';
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'ski-info');
  var LINK = {
    shop: opt('shop', 'https://webshop.oc-jahorina.com/'),
    cijene: opt('cijene', O + L + '/cjenovnik-ski-karata-sezona-2026-27/'),
    mapa: opt('mapa', O + L + '/ski-mapa/'),
    kamere: opt('kamere', O + L + '/jahorina-tv-web-kamere/'),
    nocno: opt('nocno', O + L + '/nocno-skijanje/'),
    info: opt('info', O + L + '/' + SLUG + '/')
  };

  var T = EN ? {
    h: 'Jahorina ski resort today', open: 'Open now', closed: 'Currently closed', wait: 'Loading the status…',
    upd: function (dd, mm, hm) { return 'Updated ' + dd + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mm - 1] + ', ' + hm; },
    lifts: 'lifts open', slopes: 'slopes open', snow: 'snow depth', hours: 'day skiing',
    all: 'All slopes and lifts', allAria: 'Live status of all slopes and lifts on Jahorina', nav: 'Quick links',
    noData: 'Live status of slopes and lifts', why: 'Ski info', whyTail: 'showing links only',
    cards: [
      ['shop', 'Buy a ski pass', 'Online, skip the queue'],
      ['cijene', 'Ski pass prices', 'Season 2026/27'],
      ['mapa', 'Ski map', '54 km of slopes'],
      ['kamere', 'Live cameras', 'Jahorina TV'],
      ['nocno', 'Night skiing', 'Floodlit slopes']
    ]
  } : {
    h: 'Stanje skijališta Jahorina', open: 'Radi sada', closed: 'Trenutno ne radi', wait: 'Učitava se stanje…',
    upd: function (dd, mm, hm) { return 'Ažurirano ' + dd + '. ' + mm + '. u ' + hm; },
    lifts: 'žičare rade', slopes: 'staze otvorene', snow: 'snijega', hours: 'dnevno skijanje',
    all: 'Sve staze i žičare', allAria: 'Stanje svih staza i žičara na Jahorini uživo', nav: 'Brzi linkovi',
    noData: 'Stanje staza i žičara uživo', why: 'Ski info', whyTail: 'prikazani su samo linkovi',
    cards: [
      ['shop', 'Kupi ski kartu', 'Online, bez čekanja'],
      ['cijene', 'Cijene ski karata', 'Sezona 2026/27'],
      ['mapa', 'Ski mapa', '54 km staza'],
      ['kamere', 'Kamere uživo', 'Jahorina TV'],
      ['nocno', 'Noćno skijanje', 'Pod reflektorima']
    ]
  };
  var GOAL = { shop: 'webshop', cijene: 'cijene', mapa: 'mapa', kamere: 'kamere', nocno: 'nocno' };

  /* ---------- izgled (sve pod #jst-stanje; Betheme nameće naslove i linkove, pa !important) ---------- */
  var CSS = [
    '#S{--bg:#0C1424;--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;--ice:#C4EEFF;--ok:#4ADE80;',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;position:relative;isolation:isolate;background:var(--bg);color:var(--text);font:400 16px/1.5 var(--fb);text-align:left;color-scheme:dark}',
    '#S.jst--boxed{border-radius:28px;overflow:hidden}',
    '#S *,#S *::before,#S *::after{box-sizing:border-box}',
    '#S a{color:inherit;text-decoration:none!important;box-shadow:none;border:0}',
    '#S h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0!important;padding:0!important;text-transform:none!important;border:0;letter-spacing:-.01em!important}',
    '#S p,#S ul{margin:0!important;padding:0!important;list-style:none!important}',
    '#S li{margin:0!important;padding:0!important;list-style:none!important;background:none!important}',
    '#S li::before,#S li::marker{content:none!important;display:none!important}',
    '#S svg{display:block;flex-shrink:0}',
    '#S svg[fill="none"],#S svg[fill="none"] *:not([fill]){fill:none!important}',
    '#S svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#S a:focus-visible{outline:2px solid #fff!important;outline-offset:3px!important}',
    '#S .jst-wrap{max-width:1240px;margin:0 auto;padding:clamp(28px,3.4vw,48px) clamp(16px,4vw,48px) 0}',

    /* traka stanja: staklo kao trake sekcija, tanka ivica, okvir kao kartica vijesti */
    '#S .jst-panel{position:relative;display:grid;grid-template-columns:minmax(220px,auto) 1fr auto;align-items:center;gap:clamp(18px,2.4vw,36px);padding:20px clamp(20px,2.4vw,30px);border-radius:24px;',
    'background:linear-gradient(180deg,rgba(18,27,45,.78),rgba(9,14,26,.88));box-shadow:0 30px 60px -40px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.1)}',
    '#S .jst-head{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '#S h2{font-size:clamp(19px,1.7vw,22px)!important;line-height:1.2!important;font-weight:800!important}',
    '#S .jst-st{display:inline-flex;align-items:center;gap:8px;font:600 14px/1.2 var(--fd);color:var(--text-2)}',
    '#S .jst-st i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.35);box-shadow:0 0 0 3px rgba(255,255,255,.06)}',
    '#S .jst-st.is-open i{background:var(--ok);box-shadow:0 0 0 3px rgba(74,222,128,.16),0 0 10px rgba(74,222,128,.6)}',
    '#S .jst-st small{font:500 13px/1.2 var(--fb);color:var(--text-3)}',
    '#S .jst-st small:not(:empty)::before{content:"·";margin:0 7px 0 1px;color:var(--text-3)}',
    /* brojke: veliki broj + mali natpis, tanka linija između */
    '#S .jst-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0}',
    '#S .jst-stats li{display:flex;flex-direction:column;gap:5px;padding:2px clamp(12px,1.6vw,22px)!important;border-left:1px solid rgba(255,255,255,.1)}',
    '#S .jst-stats b{font:800 clamp(22px,2.1vw,28px)/1 var(--fd);letter-spacing:-.01em;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#S .jst-stats b span{font-weight:600;font-size:.62em;color:var(--text-3);margin-left:1px}',
    '#S .jst-stats small{font:500 13px/1.25 var(--fb);color:var(--text-3)}',
    '#S .jst-panel.is-wait .jst-stats b{color:rgba(255,255,255,.28)}',
    '#S .jst-panel.is-none .jst-stats{display:none}',
    '#S .jst-panel.is-none{grid-template-columns:1fr auto}',
    /* sporedno dugme: staklena pločica (kao „Sve vijesti“) */
    '#S .jst-all{all:unset;position:relative!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 18px!important;border-radius:16px!important;cursor:pointer;white-space:nowrap;',
    'font:600 14px/1 var(--fd)!important;color:rgba(255,255,255,.92)!important;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))!important;',
    'box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.11)!important;transition:transform .2s,box-shadow .2s,color .2s}',
    '#S .jst-all svg{width:16px;height:16px;color:var(--ice)}',
    '#S .jst-all:hover{color:#fff!important;transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(111,219,255,.38),inset 0 1px 0 rgba(255,255,255,.14),0 0 18px -4px rgba(0,185,242,.45)!important}',
    '#S .jst-all:active{transform:scale(.96)}',

    /* brze kartice: 5 u redu (računar), staklo; prva = glavno cyan dugme */
    '#S .jst-links{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:14px}',
    '#S .jst-card{all:unset;position:relative!important;box-sizing:border-box!important;display:flex!important;align-items:center;gap:12px;min-width:0;min-height:72px;padding:14px 16px!important;border-radius:18px!important;cursor:pointer;',
    'background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.11)!important;transition:transform .2s,box-shadow .2s,filter .2s}',
    '#S .jst-card svg{width:24px;height:24px;color:var(--ice)}',
    '#S .jst-card span{display:flex;flex-direction:column;gap:4px;min-width:0}',
    '#S .jst-card b{font:700 15px/1.2 var(--fd);color:#fff;letter-spacing:0}',
    '#S .jst-card small{font:500 13px/1.25 var(--fb);color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#S .jst-card:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(111,219,255,.38),inset 0 1px 0 rgba(255,255,255,.14),0 0 18px -4px rgba(0,185,242,.45)!important}',
    '#S .jst-card:active{transform:scale(.97)}',
    '#S .jst-card--buy{background:linear-gradient(160deg,#45D6FF 0%,#00AEE6 50%,#008BC7 100%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 10px 24px -12px rgba(0,174,230,.8)!important}',
    '#S .jst-card--buy svg{color:#fff}',
    '#S .jst-card--buy small{color:rgba(255,255,255,.88)}',
    '#S .jst-card--buy:hover{filter:brightness(1.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 12px 26px -12px rgba(0,174,230,.9)!important}',
    '#S .jst-why{display:block;margin-top:10px;font:400 12.5px/1.4 var(--fb);color:#FFB547}',

    /* manji laptop i tablet: stanje u dva reda (naslov + dugme, pa brojke), kartice 3 + 2 */
    '@media (max-width:1100px){#S .jst-panel{grid-template-columns:1fr auto}#S .jst-stats{grid-column:1 / -1;grid-row:2;margin:4px -2px 0}',
    '#S .jst-stats li:first-child{border-left:0;padding-left:2px!important}#S .jst-links{grid-template-columns:repeat(6,minmax(0,1fr))}',
    '#S .jst-card{grid-column:span 2}#S .jst-card:nth-child(n+4){grid-column:span 3}}',
    /* telefon: brojke 2 × 2, kupovina preko cijele širine, ostale kartice 2 × 2; bez sjena i zamućenja */
    '@media (max-width:760px){',
    '#S .jst-wrap{padding:24px 16px 0}',
    '#S .jst-panel{grid-template-columns:1fr;gap:16px;padding:18px 18px 16px;border-radius:20px}',
    '#S .jst-stats{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:14px;margin:0}',
    '#S .jst-stats li,#S .jst-stats li:first-child{padding:0 12px!important;border-left:1px solid rgba(255,255,255,.1)}',
    '#S .jst-stats li:nth-child(odd){border-left:0;padding-left:0!important}',
    '#S .jst-stats b{font-size:24px}',
    '#S .jst-all{width:100%;height:46px}',
    '#S .jst-panel.is-none{grid-template-columns:1fr}',
    '#S .jst-links{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}',
    '#S .jst-card,#S .jst-card:nth-child(n+4){grid-column:auto;min-height:64px;padding:12px 14px!important;gap:10px;border-radius:16px!important}',
    '#S .jst-card--buy{grid-column:1 / -1!important;justify-content:center}',
    '#S .jst-card svg{width:22px;height:22px}',
    '#S .jst-card b{font-size:14px}}',
    '@media (max-width:360px){#S .jst-card small{display:none}#S .jst-card--buy small{display:block}}',
    '@media (prefers-reduced-motion:reduce){#S *{transition:none!important}}'
  ].join('\n').replace(/#S/g, '#jst-stanje');

  var st = d.getElementById('jst-css');
  if (!st) { st = d.createElement('style'); st.id = 'jst-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="family=Archivo"][href*="family=Barlow"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    (d.head || d.documentElement).appendChild(fl);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function ext(u) { try { return new URL(u, location.href).host !== location.host; } catch (e) { return false; } }

  // ikonice (crte, kao u hero-u)
  var I = {
    shop: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5C4 6.7 4.7 6 5.5 6h13c.8 0 1.5.7 1.5 1.5v2.1a2.4 2.4 0 0 0 0 4.8v2.1c0 .8-.7 1.5-1.5 1.5h-13C4.7 18 4 17.3 4 16.5v-2.1a2.4 2.4 0 0 0 0-4.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14.5 6.4V8M14.5 11.2v1.6M14.5 16v1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    cijene: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 12.6V5a1.5 1.5 0 0 1 1.5-1.5h7.6l8 8a1.5 1.5 0 0 1 0 2.1l-7 7a1.5 1.5 0 0 1-2.1 0Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.3" cy="8.3" r="1.6" stroke="currentColor" stroke-width="1.6"/></svg>',
    mapa: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" stroke="currentColor" stroke-width="1.6"/></svg>',
    kamere: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="m16 10.2 5-3v9.6l-5-3" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    nocno: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M17 3.5v3M15.5 5h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- crtanje ---------- */
  function cardHTML(c) {
    var u = LINK[c[0]], x = ext(u);
    return '<a class="jst-card' + (c[0] === 'shop' ? ' jst-card--buy' : '') + '" href="' + esc(u) + '"' + (x ? ' target="_blank" rel="noopener"' : '') +
      ' data-jst="' + GOAL[c[0]] + '">' + I[c[0]] + '<span><b>' + esc(c[1]) + '</b><small>' + esc(c[2]) + '</small></span></a>';
  }
  root.innerHTML =
    '<section class="jst-wrap" aria-labelledby="jst-h">' +
      '<div class="jst-panel is-wait">' +
        '<div class="jst-head"><h2 id="jst-h">' + esc(T.h) + '</h2>' +
          '<p class="jst-st" role="status"><i aria-hidden="true"></i><span>' + esc(T.wait) + '</span><small></small></p></div>' +
        '<ul class="jst-stats">' +
          '<li data-k="lifts"><b>–</b><small>' + esc(T.lifts) + '</small></li>' +
          '<li data-k="slopes"><b>–</b><small>' + esc(T.slopes) + '</small></li>' +
          '<li data-k="snow"><b>–</b><small>' + esc(T.snow) + '</small></li>' +
          '<li data-k="hours"><b>–</b><small>' + esc(T.hours) + '</small></li>' +
        '</ul>' +
        '<a class="jst-all" href="' + esc(LINK.info) + '" data-jst="ski_info" aria-label="' + esc(T.allAria) + '">' + esc(T.all) + I.info + '</a>' +
      '</div>' +
      '<nav class="jst-links" aria-label="' + esc(T.nav) + '">' + T.cards.map(cardHTML).join('') + '</nav>' +
    '</section>';
  function q(s) { return root.querySelector(s); }

  /* ---------- GA ---------- */
  function track(name, params) {
    params = params || {}; params.jezik = EN ? 'en' : 'sr';
    try {
      if (typeof w.gtag === 'function') w.gtag('event', name, params);
      else if (w.dataLayer && typeof w.dataLayer.push === 'function') {
        var ev = { event: name }; for (var k in params) ev[k] = params[k]; w.dataLayer.push(ev);
      }
    } catch (e) {}
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-jst]');
    if (a) track('stanje_klik', { cilj: a.getAttribute('data-jst') });
  });

  /* ---------- puna širina i spoj sa susjedima (kao vijesti: fit + closeGaps) ---------- */
  function fit() {
    var s = root.style;
    s.removeProperty('width'); s.removeProperty('max-width'); s.removeProperty('margin-left');
    var cw = d.documentElement.clientWidth, r = root.getBoundingClientRect();
    if (r.width < cw - 1) {
      s.setProperty('width', cw + 'px', 'important');
      s.setProperty('max-width', 'none', 'important');
      s.setProperty('margin-left', -r.left + 'px', 'important');
    }
    root.classList.toggle('jst--boxed', root.getBoundingClientRect().width < cw - 24);
    closeGaps();
  }
  var GAP_MAX = 160, GAP_HERO = 260;
  function neighbour(dir) {   // najbliži vidljivi element prije/poslije bloka (preskače skripte, fiksirane i skrivene elemente)
    for (var n = root; n && n !== d.body; n = n.parentElement) {
      for (var s = dir < 0 ? n.previousElementSibling : n.nextElementSibling; s; s = dir < 0 ? s.previousElementSibling : s.nextElementSibling) {
        if (/^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE|META)$/.test(s.tagName)) continue;
        var cs = getComputedStyle(s);
        if (cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none') continue;
        var b = s.getBoundingClientRect();
        if (b.height > 2 && b.width > 2) return { el: s, box: b };
      }
    }
    return null;
  }
  // dno elementa koje se stvarno vidi: roditelj sa overflow:hidden/clip ga može odsjeći ranije (omotač Slider Revolutiona)
  function visBottom(el) {
    var b = el.getBoundingClientRect().bottom;
    for (var n = el.parentElement; n && n !== d.body && n !== d.documentElement; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.overflowY === 'hidden' || cs.overflowY === 'clip' || cs.overflow === 'hidden') b = Math.min(b, n.getBoundingClientRect().bottom);
    }
    return b;
  }
  function closeGaps() {
    var s = root.style;
    s.removeProperty('margin-top'); s.removeProperty('margin-bottom'); s.removeProperty('z-index');
    var r = root.getBoundingClientRect(), up = neighbour(-1), dn = neighbour(1);
    var hero = d.querySelector('.jh-hero'), hv = hero && hero.getBoundingClientRect().height > 50 ? visBottom(hero) : null;
    if (hv !== null && hv <= r.top + 2) up = { el: hero, box: { bottom: hv }, hero: true };
    if (up) {
      var g = r.top - up.box.bottom;   // bez zaokruživanja: i dio piksela se vidi kao svijetla linija
      if (g > .01 && g <= (up.hero ? GAP_HERO : GAP_MAX)) {
        s.setProperty('margin-top', -(g + 1) + 'px', 'important');   // 1 px preklopa (iste boje)
        s.setProperty('z-index', '2', 'important');
      }
    }
    if (dn) { var g2 = dn.box.top - r.bottom; if (g2 > .01 && g2 <= GAP_MAX) s.setProperty('margin-bottom', -g2 + 'px', 'important'); }
  }
  function refit() { clearTimeout(fit.t); fit.t = setTimeout(fit, 120); }
  fit();
  w.addEventListener('resize', refit);
  w.addEventListener('load', refit);
  if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);

  /* ---------- stanje sa stranice Ski info (REST API; podaci isti za SR i EN) ---------- */
  var bases = [O + '/wp-json/', O + '/?rest_route=/'];
  // JSON iz odgovora; Elementor/dodatak na sajtu ispiše <style> PRIJE podataka (11. 11.), pa se podaci izvade iz sredine
  function json(t) {
    try { return JSON.parse(t); } catch (e) {}
    var ss = [t.indexOf('[{"'), t.indexOf('{"'), t.indexOf('[]')].filter(function (x) { return x >= 0; }).sort(function (a, b) { return a - b; });
    var es = [t.lastIndexOf(']'), t.lastIndexOf('}')].sort(function (a, b) { return b - a; });
    for (var i = 0; i < ss.length; i++) for (var k = 0; k < es.length; k++)
      if (es[k] > ss[i]) try { return JSON.parse(t.slice(ss[i], es[k] + 1)); } catch (e) {}
    throw new Error('odgovor nije JSON');
  }
  function api(path, query) {
    var i = 0, first = null;
    function attempt(err) {
      if (err && !first && err.message !== 'REST') first = err;
      if (i >= bases.length) return Promise.reject(first || err);
      var b = bases[i++], url = b + 'wp/v2/' + path + (b.indexOf('?') > -1 ? '&' : '?') + query;
      return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text().then(json); })
        .then(function (j) { bases = [b].concat(bases.filter(function (x) { return x !== b; })); return j; }, attempt);
    }
    return attempt(new Error('REST'));
  }
  // "09:00–16:00" → "9–16 h" (minute samo kad nisu :00)
  function hrs(s) {
    var m = String(s || '').match(/(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/);
    if (!m) return '';
    var f = function (h, mi) { return (+h) + (mi !== '00' ? ':' + mi : ''); };
    return f(m[1], m[2]) + '–' + f(m[3], m[4]) + ' h';
  }
  function parse(html) {
    var b = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html').body;
    var r = {}, tiles = [].slice.call(b.querySelectorAll('.oc-dsi-summary-tile'));
    tiles.forEach(function (t) {
      var v = clean((t.querySelector('.oc-dsi-summary-value') || {}).textContent), l = clean((t.querySelector('.oc-dsi-summary-label') || {}).textContent);
      var m = v.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) return;
      if (/žičar|lift/i.test(l) && !r.lifts) r.lifts = [+m[1], +m[2]];
      else if (/staz|slope/i.test(l) && !r.slopes) r.slopes = [+m[1], +m[2]];
    });
    var dp = b.querySelector('.oc-dsi-weather-depth strong, .oc-dsi-weather-depth');
    var dm = dp && clean(dp.textContent).match(/(\d+)\s*cm/i);
    if (dm) r.snow = +dm[1];
    var hb = b.querySelector('.oc-dsi-hours-badge strong, .oc-dsi-hours-badge');
    if (hb) r.hours = hrs(hb.textContent);
    var um = clean(b.textContent).match(/(?:Posljednje ažurirano|Last updated)\s*:?\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?\s*(\d{1,2}[:.]\d{2})/i);
    if (um) r.upd = [+um[1], +um[2], um[4].replace('.', ':')];
    return r;
  }
  function render(r) {
    var p = q('.jst-panel');
    p.classList.remove('is-wait');
    if (!r || !r.lifts) { p.classList.add('is-none'); q('.jst-st span').textContent = T.noData; return false; }
    var set = function (k, html) { q('.jst-stats [data-k="' + k + '"] b').innerHTML = html; };
    set('lifts', r.lifts[0] + '<span>/' + r.lifts[1] + '</span>');
    if (r.slopes) set('slopes', r.slopes[0] + '<span>/' + r.slopes[1] + '</span>'); else q('[data-k="slopes"]').style.display = 'none';
    if (r.snow != null) set('snow', r.snow + '<span> cm</span>'); else q('[data-k="snow"]').style.display = 'none';
    if (r.hours) set('hours', esc(r.hours)); else q('[data-k="hours"]').style.display = 'none';
    var open = r.lifts[0] > 0, s = q('.jst-st');
    s.classList.toggle('is-open', open);
    s.querySelector('span').textContent = open ? T.open : T.closed;
    s.querySelector('small').textContent = r.upd ? T.upd(r.upd[0], r.upd[1], r.upd[2]) : '';
    return true;
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički razlog vide samo prijavljeni
    var el = q('.jst-why') || q('.jst-wrap').appendChild(d.createElement('small'));
    el.className = 'jst-why'; el.textContent = T.why + ': ' + msg + ' (' + T.whyTail + ')';
  }
  if (w.fetch && w.DOMParser && w.Promise) {
    api('pages', 'slug=' + encodeURIComponent(SLUG) + '&_fields=content,modified').then(function (j) {
      var pg = j && j[0];
      if (!pg || !pg.content) throw new Error('stranica "' + SLUG + '" nije pronađena');
      if (!render(parse(pg.content.rendered || ''))) why('na stranici nema brojača „OC dnevni info“');
      refit();
    }).catch(function (e) {
      render(null); refit();
      if (w.console) console.warn('[Jahorina stanje]', e);
      why(e && e.message || 'REST');
    });
  } else render(null);
})(window, document);
