/* =====================================================================
   JAHORINA — OBAVJEŠTENJA I VIJESTI (početna, ispod hero-a)
   Slajder sa 5 najnovijih objava iz WordPress kategorije "Vijesti" (REST API):
   jedna vijest u kadru preko cijele kartice, ostale se smjenjuju (strelice,
   brojevi, prevlačenje prstom, samo od sebe na 7 s; staje kad je miš iznad).
   Objave se dodaju u WordPressu kao i do sada — ovdje se ništa ne unosi ručno.
   Ugradnja: Elementor HTML widget sa redom iz elementor-html-widget.html
   (<div id="jv-vijesti"></div> + ovaj fajl sa jsDelivr-a).
   Opcije na <div id="jv-vijesti">: data-kategorija="vijesti" (slug),
   data-kategorija-id="123" (preskače traženje ID-a), data-broj="5".
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jv-vijesti');
  if (!root || root.__jv) return;
  root.__jv = true;

  var O = location.origin;
  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var SLUG = root.getAttribute('data-kategorija') || 'vijesti';
  var COUNT = Math.max(1, Math.min(8, parseInt(root.getAttribute('data-broj'), 10) || 5));
  var DUR = 7000;   // koliko jedna vijest stoji prije sljedeće (ms)
  var NIGHT = O + '/wp-content/uploads/2026/09/jahorina-noc.webp';   // ista noćna fotografija kao u hero-u

  var T = EN ? {
    eyebrow: 'News', t1: 'Notices', t2: 'and news', all: 'All news',
    notice: 'Notice', news: 'News', read: 'Read more',
    carousel: 'Latest news', rd: 'carousel', srd: 'slide', of: 'of',
    prev: 'Previous news', next: 'Next news', pause: 'Pause', play: 'Play', go: 'Show news',
    empty: 'There is no news at the moment.', error: 'News could not be loaded right now.'
  } : {
    eyebrow: 'Vijesti', t1: 'Obavještenja', t2: 'i vijesti', all: 'Sve vijesti',
    notice: 'Obavještenje', news: 'Vijest', read: 'Pročitaj više',
    carousel: 'Najnovije vijesti', rd: 'slajder', srd: 'slajd', of: 'od',
    prev: 'Prethodna vijest', next: 'Sljedeća vijest', pause: 'Zaustavi', play: 'Pokreni', go: 'Prikaži vijest',
    empty: 'Trenutno nema vijesti.', error: 'Vijesti trenutno nije moguće učitati.'
  };
  var ALL = O + (EN ? '/en' : '') + '/category/' + SLUG + '/';

  /* ---------- izgled (sve je pod #jv-vijesti da se ne sudara sa temom) ---------- */
  var CSS = [
    '#V{--bg:#0A1120;--surface:#111A2C;--surface-2:#16213A;--line:rgba(255,255,255,.08);--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);',
    '--accent:#00B9F2;--accent-2:#2CCBF8;--warn:#FFB547;--raised:6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14);--inset:inset 4px 4px 10px rgba(0,0,0,.5),inset -4px -4px 9px rgba(70,96,142,.13);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#V.jv--boxed{border-radius:28px;overflow:hidden}',
    '#V *,#V *::before,#V *::after{box-sizing:border-box}',
    '#V a{color:inherit;text-decoration:none;box-shadow:none}',
    '#V h2,#V h3{font-family:var(--fd);color:var(--text);margin:0;padding:0;text-transform:none;text-wrap:balance;border:0}',
    '#V p{margin:0;padding:0}',
    '#V img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#V svg{display:block;flex-shrink:0}',
    '#V svg[fill="none"],#V svg[fill="none"] *:not([fill]){fill:none!important}',
    '#V svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#V svg [fill="currentColor"]{fill:currentColor!important}',
    '#V a:focus-visible,#V button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '#V .jv-wrap{max-width:1240px;margin:0 auto;padding:clamp(56px,7vw,100px) clamp(16px,4vw,48px)}',

    /* naslov sekcije — drugi dio naslova iscrtan linijom, kao "Jahorine" u hero-u */
    '#V .jv-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px 32px;margin-bottom:clamp(28px,3.4vw,44px);flex-wrap:wrap}',
    '#V .jv-eyebrow{display:flex;align-items:center;gap:12px;font:600 12px/1 var(--fd);letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}',
    '#V .jv-eyebrow::before{content:"";width:28px;height:2px;border-radius:2px;background:var(--accent);box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#V h2{font-size:clamp(34px,4.4vw,58px);font-weight:800;line-height:.98;letter-spacing:-.022em}',
    '#V h2 span{display:inline-block}',
    '@supports (-webkit-text-stroke:1px #fff){#V h2 span{color:transparent;-webkit-text-stroke:1.3px rgba(255,255,255,.82)}}',
    '#V .jv-more{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;border-radius:40px;font:600 14px/1 var(--fd);letter-spacing:.2px;color:var(--text-2);background:var(--surface);box-shadow:var(--raised);transition:color .2s}',
    '#V .jv-more:hover{color:var(--accent)}',
    '#V .jv-more svg{transition:transform .2s}',
    '#V .jv-more:hover svg{transform:translateX(3px)}',

    /* scena slajdera */
    '#V .jv-stage{position:relative;height:clamp(500px,46vw,620px);border-radius:30px;overflow:hidden;background:var(--surface);isolation:isolate;touch-action:pan-y;',
    'box-shadow:0 50px 90px -50px rgba(0,0,0,.95),var(--raised)}',
    '#V .jv-stage::after{content:"";position:absolute;inset:0;z-index:5;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)}',
    '#V .jv-slide{position:absolute;inset:0;display:flex;align-items:center;opacity:0;visibility:hidden;z-index:1;transition:opacity .9s ease,visibility 0s linear .9s}',
    '#V .jv-slide.is-on{opacity:1;visibility:visible;z-index:2;transition:opacity .9s ease}',
    '#V .jv-slide img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}',
    '#V .jv-slide::before{content:"";position:absolute;inset:0;z-index:-1;',
    'background:linear-gradient(90deg,rgba(10,17,32,.97) 0%,rgba(10,17,32,.86) 30%,rgba(10,17,32,.4) 60%,rgba(10,17,32,.08) 100%),linear-gradient(0deg,rgba(10,17,32,.92) 0%,rgba(10,17,32,0) 34%)}',
    '#V .jv-body{display:flex;flex-direction:column;align-items:flex-start;width:min(660px,64%);padding:56px 56px 112px}',
    '#V .jv-body > *{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .8s cubic-bezier(.2,.7,.2,1)}',
    '#V .is-on .jv-body > *{opacity:1;transform:none}',
    '#V .is-on .jv-body > :nth-child(1){transition-delay:.22s}',
    '#V .is-on .jv-body > :nth-child(2){transition-delay:.3s}',
    '#V .is-on .jv-body > :nth-child(3){transition-delay:.38s}',
    '#V .is-on .jv-body > :nth-child(4){transition-delay:.46s}',
    '#V .jv-meta{display:flex;align-items:center;flex-wrap:wrap;gap:10px 16px;font-size:14px;line-height:1.3;color:var(--text-3)}',
    '#V .jv-meta time{display:inline-flex;align-items:center;gap:8px}',
    '#V .jv-chip{display:inline-flex;align-items:center;padding:7px 12px;border-radius:20px;font:600 11.5px/1 var(--fd);letter-spacing:1.4px;text-transform:uppercase;background:rgba(255,181,71,.14);color:var(--warn);border:1px solid rgba(255,181,71,.38)}',
    '#V .jv-chip--news{background:rgba(0,185,242,.12);color:var(--accent);border-color:rgba(0,185,242,.38)}',
    '#V .jv-slide h3{font-size:clamp(30px,3.3vw,46px);font-weight:800;line-height:1.04;letter-spacing:-.018em;margin:22px 0 16px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}',
    '#V .jv-slide h3.jv-long{font-size:clamp(23px,2.3vw,32px);line-height:1.14}',
    '#V .jv-slide h3 a::after{content:"";position:absolute;inset:0;z-index:1}',   // cijela kartica je link
    '#V .jv-slide p{font-size:17px;line-height:1.6;color:var(--text-2);max-width:54ch;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}',
    /* dugme: ispupčeno (neumorfno) u cyan boji, strelica u udubljenom krugu */
    '#V .jv-cta{margin-top:30px;display:inline-flex;align-items:center;gap:14px;padding:7px 7px 7px 24px;border-radius:40px;font:700 14px/1 var(--fd);letter-spacing:.3px;color:#fff;text-shadow:0 1px 1px rgba(0,60,95,.35);',
    'background:linear-gradient(145deg,#3AD3FB 0%,#0FB4EC 55%,#009ED3 100%);',
    'box-shadow:8px 8px 18px rgba(0,0,0,.55),-6px -6px 14px rgba(70,110,170,.16),0 16px 30px -16px rgba(0,185,242,.9),inset 1px 1px 0 rgba(255,255,255,.5),inset -3px -3px 8px rgba(0,70,110,.35)}',
    '#V .jv-cta__ico{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#0098CC,#2BC6F5);box-shadow:inset 3px 3px 6px rgba(0,55,90,.5),inset -2px -2px 5px rgba(255,255,255,.32)}',
    '#V .jv-cta__ico svg{transition:transform .25s ease}',
    '#V .is-on .jv-cta{transition:opacity .6s ease .46s,transform .25s ease,box-shadow .25s ease}',
    '#V .jv-slide.is-on:hover .jv-cta{transform:translateY(-2px);box-shadow:10px 12px 22px rgba(0,0,0,.55),-6px -6px 14px rgba(70,110,170,.18),0 20px 36px -14px rgba(0,185,242,.95),inset 1px 1px 0 rgba(255,255,255,.55),inset -3px -3px 8px rgba(0,70,110,.35)}',
    '#V .jv-slide.is-on:hover .jv-cta__ico svg{transform:translateX(2px)}',
    '#V .jv-slide.is-on:active .jv-cta{transform:translateY(0);box-shadow:inset 4px 4px 9px rgba(0,60,95,.55),inset -3px -3px 8px rgba(255,255,255,.28)}',

    /* broj vijesti gore desno — iscrtan linijom */
    '#V .jv-count{position:absolute;top:34px;right:44px;z-index:3;display:flex;align-items:baseline;gap:10px;font-family:var(--fd);pointer-events:none}',
    '#V .jv-count b{font-size:clamp(58px,6vw,92px);font-weight:800;line-height:.8;letter-spacing:-.03em;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.3)}',
    '@supports (-webkit-text-stroke:1px #fff){#V .jv-count b{color:transparent;-webkit-text-stroke:1.2px rgba(255,255,255,.55)}}',
    '#V .jv-count span{font-size:14px;font-weight:600;letter-spacing:1.2px;color:var(--text-3)}',

    /* traka: brojevi sa linijom napretka + strelice */
    /* donja traka: neumorfni panel (kao dugmad u hero-u) — brojevi vijesti u udubljenom žlijebu + okrugla dugmad */
    '#V .jv-bar{position:absolute;right:28px;bottom:28px;z-index:3;display:flex;align-items:center;gap:14px;padding:10px;border-radius:26px;',
    'background:rgba(13,20,36,.8);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);',
    'box-shadow:0 26px 50px -22px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.06),inset 1px 1px 0 rgba(255,255,255,.05)}',
    '#V .jv-steps{display:flex;gap:8px;padding:6px;border-radius:19px;background:#0B1222;box-shadow:inset 4px 4px 9px rgba(0,0,0,.6),inset -3px -3px 8px rgba(70,96,142,.13)}',
    '#V .jv-step{all:unset;position:relative!important;overflow:hidden!important;cursor:pointer;box-sizing:border-box!important;display:grid!important;place-items:center;width:48px!important;height:42px!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:13px!important;',
    'font:700 12.5px/1 var(--fd)!important;letter-spacing:.8px!important;text-transform:none!important;font-variant-numeric:tabular-nums;color:var(--text-3)!important;',
    'background:linear-gradient(145deg,#17233D,#0F1829)!important;box-shadow:4px 4px 9px rgba(0,0,0,.55),-3px -3px 8px rgba(70,96,142,.15),inset 1px 1px 0 rgba(255,255,255,.05)!important;transition:color .2s,box-shadow .25s,transform .2s}',
    '#V .jv-step:hover{color:#fff!important;transform:translateY(-1px)}',
    '#V .jv-step.is-done{color:var(--text-2)!important}',
    '#V .jv-step.is-on{color:#fff!important;text-shadow:0 1px 1px rgba(0,60,95,.4);background:linear-gradient(145deg,#3AD3FB 0%,#0FB4EC 55%,#009ED3 100%)!important;',
    'box-shadow:0 10px 22px -8px rgba(0,185,242,.8),inset 1px 1px 0 rgba(255,255,255,.5),inset -2px -2px 6px rgba(0,70,110,.35)!important}',
    '#V .jv-step i{position:absolute;left:10px;right:10px;bottom:6px;height:2px;border-radius:2px;background:transparent;overflow:hidden}',
    '#V .jv-step.is-on i{background:rgba(0,60,95,.35)}',
    '#V .jv-step i s{display:block;height:100%;width:100%;text-decoration:none;transform-origin:left center;transform:scaleX(0);background:#fff;box-shadow:0 0 8px rgba(255,255,255,.9)}',
    '#V .jv-step:not(.is-on) i s{visibility:hidden}',
    '#V .jv-step.is-on i s{animation:jvFill var(--dur) linear forwards}',
    '#V .jv-car.is-paused .jv-step.is-on i s{animation-play-state:paused}',
    '#V .jv-car.is-still .jv-step.is-on i s{animation:none;transform:scaleX(1)}',
    '@keyframes jvFill{to{transform:scaleX(1)}}',
    '#V .jv-nav{display:flex;align-items:center;gap:10px}',
    '#V .jv-btn{all:unset;box-sizing:border-box!important;width:48px!important;height:48px!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;display:grid!important;place-items:center;cursor:pointer;line-height:1!important;',
    'color:#fff!important;background:linear-gradient(145deg,#1A2742,#0F1829)!important;box-shadow:5px 5px 12px rgba(0,0,0,.58),-4px -4px 10px rgba(70,96,142,.17),inset 1px 1px 0 rgba(255,255,255,.07)!important;transition:color .2s,box-shadow .25s}',
    '#V .jv-btn:hover{color:var(--accent)!important;box-shadow:5px 5px 12px rgba(0,0,0,.58),-4px -4px 10px rgba(70,96,142,.17),inset 1px 1px 0 rgba(255,255,255,.07),0 0 18px rgba(0,185,242,.28)!important}',
    '#V .jv-btn:active{color:var(--accent)!important;box-shadow:inset 4px 4px 9px rgba(0,0,0,.6),inset -3px -3px 8px rgba(70,96,142,.15)!important}',
    '#V .jv-btn--sm{width:40px!important;height:40px!important;color:var(--text-2)!important}',
    '#V .jv-car.is-one .jv-bar,#V .jv-car.is-one .jv-count{display:none}',
    '#V .jv-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',

    /* učitavanje, prazno, greška */
    '#V .jv-stage.jv-sk{box-shadow:var(--inset)}',
    '#V .jv-sk::before{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:jvShine 1.6s infinite}',
    '@keyframes jvShine{to{transform:translateX(100%)}}',
    '#V .jv-note{border-radius:28px;padding:clamp(28px,4vw,44px);background:var(--surface);box-shadow:var(--inset);color:var(--text-2);display:flex;flex-direction:column;align-items:flex-start;gap:16px}',
    '#V .jv-note small{color:var(--text-3);font-size:12px}',

    /* tihi ulazak kad sekcija dođe u vidno polje */
    '#V.jv-anim .jv-car{opacity:0;transform:translateY(18px)}',
    '#V.jv-anim.jv-on .jv-car{opacity:1;transform:none;transition:opacity .8s ease,transform .9s cubic-bezier(.2,.7,.2,1)}',

    /* tablet / telefon */
    '@media (max-width:1060px){#V .jv-body{width:min(640px,78%)}}',
    '@media (max-width:760px){',
    '#V .jv-stage{height:min(680px,max(560px,150vw));border-radius:24px}',
    '#V .jv-slide{align-items:flex-end}',
    '#V .jv-slide::before{background:linear-gradient(180deg,rgba(10,17,32,.15) 0%,rgba(10,17,32,.5) 36%,rgba(10,17,32,.96) 70%)}',
    '#V .jv-body{width:100%;padding:24px 22px 104px}',
    '#V .jv-slide h3{font-size:27px;margin:16px 0 12px}',
    '#V .jv-slide h3.jv-long{font-size:22px}',
    '#V .jv-slide p{font-size:15.5px}',
    '#V .jv-cta{margin-top:20px;padding:6px 6px 6px 20px;font-size:13.5px}',
    '#V .jv-cta__ico{width:32px;height:32px}',
    '#V .jv-count{top:20px;right:22px}',
    '#V .jv-count b{font-size:54px}',
    '#V .jv-bar{left:12px;right:12px;bottom:12px;justify-content:space-between;gap:8px;padding:8px;border-radius:22px}',
    '#V .jv-steps{gap:7px;padding:9px 10px;border-radius:16px;align-items:center}',
    '#V .jv-step{width:10px!important;height:10px!important;border-radius:6px!important;font-size:0!important;transition:width .35s cubic-bezier(.2,.7,.2,1),color .2s,box-shadow .25s}',
    '#V .jv-step.is-on{width:30px!important}',
    '#V .jv-step i{left:0;right:0;top:0;bottom:0;height:auto;border-radius:inherit}',
    '#V .jv-step.is-on i{background:transparent}',
    '#V .jv-step i s{background:rgba(255,255,255,.45);box-shadow:none}',
    '#V .jv-btn{width:42px!important;height:42px!important}',
    '#V .jv-btn--sm{width:36px!important;height:36px!important}',
    '#V .jv-nav{gap:8px}}',
    '@media (prefers-reduced-motion:reduce){#V *,#V *::before,#V *::after{animation:none!important;transition:none!important}#V .jv-body > *,#V .jv-car{opacity:1!important;transform:none!important}}'
  ].join('\n').replace(/#V/g, '#jv-vijesti');

  if (!d.getElementById('jv-css')) {
    var st = d.createElement('style'); st.id = 'jv-css'; st.textContent = CSS;
    (d.head || d.documentElement).appendChild(st);
  }
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  var ICON = {
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cal: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // HTML iz WordPressa → čist tekst (DOMParser ne izvršava skripte i ne učitava slike)
  function toText(html) {
    var t = new DOMParser().parseFromString('<!doctype html><body>' + (html || ''), 'text/html').body.textContent || '';
    return t.replace(/\s+/g, ' ').trim();
  }
  // qTranslate-XT: "[:SH]tekst[:en]text[:]" → samo jezik ove stranice
  function pickLang(s) {
    s = s || '';
    var re = /\[:([a-z]{2})?\]|\{:([a-z]{2})?\}|<!--:([a-z]{2})?-->/gi;
    if (!re.test(s)) return s;
    re.lastIndex = 0;
    var segs = [], cur = null, last = 0, m, langs = [];
    while ((m = re.exec(s))) {
      segs.push([cur, s.slice(last, m.index)]);
      cur = (m[1] || m[2] || m[3] || '').toLowerCase() || null;
      if (cur && langs.indexOf(cur) < 0) langs.push(cur);
      last = re.lastIndex;
    }
    segs.push([cur, s.slice(last)]);
    var want = EN ? 'en' : langs.filter(function (l) { return l !== 'en'; })[0];
    if (!want || langs.indexOf(want) < 0) want = langs[0];
    return segs.filter(function (g) { return !g[0] || g[0] === want; }).map(function (g) { return g[1]; }).join('');
  }
  var MS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  var DS = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
  var ME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function fmtDate(iso, withDay) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!m) return '';
    var y = +m[1], mo = +m[2] - 1, da = +m[3], wd = new Date(y, mo, da).getDay();
    return EN ? (withDay ? DE[wd] + ', ' : '') + da + ' ' + ME[mo] + ' ' + y
              : (withDay ? DS[wd] + ', ' : '') + da + '. ' + MS[mo] + ' ' + y + '.';
  }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  var NOTICE_RE = /^\s*(obavje[sš]tenj[ea]|notice|announcement)(?![a-zčćšđž])/i;
  var NOTICE_ONLY = /^\s*(obavje[sš]tenje|notice)\s*[.!:]?\s*$/i;

  /* ---------- objava iz REST odgovora → ono što crtamo ---------- */
  function sizesOf(media) {
    if (!media || media.code || !media.source_url) return null;
    var list = [], seen = {}, sz = (media.media_details && media.media_details.sizes) || {};
    Object.keys(sz).forEach(function (k) {
      var s = sz[k]; if (!s || !s.source_url || !s.width || seen[s.width]) return;
      seen[s.width] = 1; list.push({ k: k, w: s.width, h: s.height, url: s.source_url });
    });
    list.sort(function (a, b) { return a.w - b.w; });
    return { full: media.source_url, list: list };
  }
  function pickImg(img, minW, square) {
    if (!img) return null;
    var c = img.list.filter(function (s) { return (!square || s.k === 'thumbnail' || Math.abs(s.w - s.h) < 4) && s.w >= minW; })[0]
         || img.list.filter(function (s) { return s.w >= minW; })[0];
    return c ? c.url : img.full;
  }
  function srcset(img) {
    if (!img || !img.list.length) return '';
    return img.list.filter(function (s) { return s.k !== 'thumbnail' && Math.abs(s.w - s.h) > 3; })
      .map(function (s) { return s.url.replace(/ /g, '%20').replace(/,/g, '%2C') + ' ' + s.w + 'w'; }).join(', ');
  }
  function normalize(p, media) {
    var title = toText(pickLang(p.title && p.title.rendered)) || (EN ? 'News' : 'Vijest');
    var ex = toText(pickLang(p.excerpt && p.excerpt.rendered))
      .replace(/\s*(\[(…|\.\.\.|&hellip;)\]|…|\.\.\.)\s*$/, '')
      .replace(/\s*(pročitaj(te)? više|opširnije|read more|continue reading)\s*»?\s*$/i, '');
    if (ex.toLowerCase().indexOf(title.toLowerCase()) === 0) ex = ex.slice(title.length).replace(/^[\s:.–—-]+/, '');
    var link = p.link || ALL;
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    // naslov samo "Obavještenje" ništa ne govori — tada je naslov početak teksta, a "Obavještenje" ide u oznaku
    var generic = NOTICE_ONLY.test(title) && ex.length > 0;
    return {
      title: generic ? ex : title, excerpt: generic ? '' : clip(ex, 210), link: link, date: p.date || '',
      notice: NOTICE_RE.test(title) || NOTICE_RE.test(ex),
      noticeOnly: NOTICE_ONLY.test(title) && !generic,
      img: sizesOf(media)
    };
  }

  /* ---------- crtanje ---------- */
  ICON.prev = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  ICON.next = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  ICON.pause = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5 V19 M16 5 V19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  ICON.play = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4.5 L19 12 L7 19.5 Z" fill="currentColor"/></svg>';
  function pad(k) { return (k < 9 ? '0' : '') + (k + 1); }
  function head() {
    return '<div class="jv-head"><div><div class="jv-eyebrow">' + esc(T.eyebrow) + '</div><h2 id="jv-h">' + esc(T.t1) + ' <span>' + esc(T.t2) + '</span></h2></div>' +
      '<a class="jv-more" href="' + esc(ALL) + '">' + esc(T.all) + ' ' + ICON.arrow + '</a></div>';
  }
  function chip(n) {
    if (n.notice && n.noticeOnly) return '';   // naslov je već "Obavještenje" — ne ponavljaj
    return n.notice ? '<span class="jv-chip">' + esc(T.notice) + '</span>' : '<span class="jv-chip jv-chip--news">' + esc(T.news) + '</span>';
  }
  function timeTag(n) {
    var txt = fmtDate(n.date, true);
    return txt ? '<time datetime="' + esc(n.date.slice(0, 10)) + '">' + ICON.cal + esc(txt) + '</time>' : '';
  }
  function slide(n, k, all) {
    var src = pickImg(n.img, 1200) || NIGHT, set = srcset(n.img);
    return '<article class="jv-slide' + (k ? '' : ' is-on') + '" role="group" aria-roledescription="' + T.srd + '" aria-label="' + (k + 1) + ' ' + T.of + ' ' + all + '"' + (k ? ' aria-hidden="true"' : '') + '>' +
      '<img src="' + esc(src) + '"' + (set ? ' srcset="' + esc(set) + '" sizes="(max-width:760px) 100vw, (max-width:1340px) 92vw, 1240px"' : '') + ' alt="" decoding="async"' + (k ? ' loading="lazy"' : '') + '>' +
      '<div class="jv-body"><div class="jv-meta">' + chip(n) + timeTag(n) + '</div>' +
      '<h3' + (n.title.length > 75 ? ' class="jv-long"' : '') + '><a href="' + esc(n.link) + '"' + (k ? ' tabindex="-1"' : '') + '>' + esc(clip(n.title, 130)) + '</a></h3>' +
      (n.excerpt ? '<p>' + esc(n.excerpt) + '</p>' : '') +
      '<span class="jv-cta" aria-hidden="true">' + esc(T.read) + '<b class="jv-cta__ico">' + ICON.arrow + '</b></span></div></article>';
  }
  function frame(inner) {
    root.innerHTML = '<section class="jv-wrap" aria-labelledby="jv-h">' + head() + inner + '</section>';
    boxed();
  }
  function skeleton() { frame('<div class="jv-stage jv-sk" aria-busy="true"></div>'); }
  function note(msg, why) {
    var admin = d.body && d.body.classList.contains('logged-in');   // tehnički detalj vide samo prijavljeni
    frame('<div class="jv-note"><p>' + esc(msg) + '</p><a class="jv-more" href="' + esc(ALL) + '">' + esc(T.all) + ' ' + ICON.arrow + '</a>' +
      (admin && why ? '<small>' + esc(why) + '</small>' : '') + '</div>');
  }
  function render(items) {
    if (!items.length) return note(T.empty);
    var n = items.length;
    frame('<div class="jv-car' + (n < 2 ? ' is-one' : '') + '" role="region" aria-roledescription="' + T.rd + '" aria-label="' + esc(T.carousel) + '" style="--n:' + n + ';--dur:' + DUR + 'ms">' +
      '<div class="jv-stage" aria-live="off">' + items.map(function (it, k) { return slide(it, k, n); }).join('') +
      '<div class="jv-count" aria-hidden="true"><b>01</b><span>/ ' + pad(n - 1) + '</span></div>' +
      '<div class="jv-bar"><div class="jv-steps">' + items.map(function (it, k) {
        return '<button type="button" class="jv-step' + (k ? '' : ' is-on') + '" aria-label="' + esc(T.go + ' ' + (k + 1) + ': ' + clip(it.title, 80)) + '"' + (k ? '' : ' aria-current="true"') + '>' + pad(k) + '<i><s></s></i></button>';
      }).join('') + '</div>' +
      '<div class="jv-nav"><button type="button" class="jv-btn jv-btn--sm jv-pause" aria-label="' + esc(T.pause) + '">' + ICON.pause + '</button>' +
      '<button type="button" class="jv-btn jv-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jv-btn jv-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button></div></div>' +
      '</div></div>');
    reveal();
    if (n > 1) slider(n);
  }

  /* ---------- slajder ---------- */
  function slider(n) {
    var car = root.querySelector('.jv-car'), stage = car.querySelector('.jv-stage');
    var slides = [].slice.call(car.querySelectorAll('.jv-slide')), steps = [].slice.call(car.querySelectorAll('.jv-step'));
    var count = car.querySelector('.jv-count b'), pauseBtn = car.querySelector('.jv-pause');
    var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0, timer = null, started = 0, left = DUR;
    var userPaused = !!reduce, hover = false, focus = false, inView = false;

    function running() { return !userPaused && !hover && !focus && inView && !d.hidden; }
    function schedule() {
      clearTimeout(timer); timer = null;
      var on = running();
      car.classList.toggle('is-paused', !on);
      car.classList.toggle('is-still', userPaused);
      stage.setAttribute('aria-live', on ? 'off' : 'polite');
      if (on) { started = Date.now(); timer = setTimeout(function () { go(cur + 1); }, left); }
    }
    function update() { if (timer) left = Math.max(0, left - (Date.now() - started)); schedule(); }
    function go(k) {
      cur = (k + n) % n;
      slides.forEach(function (s, j) {
        var on = j === cur;
        s.classList.toggle('is-on', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        var a = s.querySelector('h3 a'); if (a) { if (on) a.removeAttribute('tabindex'); else a.tabIndex = -1; }
      });
      steps.forEach(function (b, j) {
        b.classList.remove('is-on'); b.classList.toggle('is-done', j < cur);
        if (j === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      void car.offsetWidth;   // linija napretka kreće ispočetka
      steps[cur].classList.add('is-on');
      count.textContent = pad(cur);
      var nx = slides[(cur + 1) % n].querySelector('img'); if (nx) nx.loading = 'eager';   // sljedeća slika se učita unaprijed
      left = DUR; schedule();
    }
    function setPause(p) {
      userPaused = p;
      pauseBtn.innerHTML = p ? ICON.play : ICON.pause;
      pauseBtn.setAttribute('aria-label', p ? T.play : T.pause);
      if (!p && left <= 0) left = DUR;
      update();
    }

    car.querySelector('.jv-prev').addEventListener('click', function () { go(cur - 1); });
    car.querySelector('.jv-next').addEventListener('click', function () { go(cur + 1); });
    steps.forEach(function (b, j) { b.addEventListener('click', function () { go(j); }); });
    pauseBtn.addEventListener('click', function () { setPause(!userPaused); });
    car.addEventListener('mouseenter', function () { hover = true; update(); });
    car.addEventListener('mouseleave', function () { hover = false; update(); });
    car.addEventListener('focusin', function () { focus = true; update(); });
    car.addEventListener('focusout', function (e) { if (!car.contains(e.relatedTarget)) { focus = false; update(); } });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
    });
    d.addEventListener('visibilitychange', update);

    // prevlačenje prstom (i mišem) lijevo/desno
    var sx = 0, sy = 0, down = false, swiped = false;
    stage.addEventListener('pointerdown', function (e) { if (e.target.closest('.jv-bar')) return; down = true; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = true; go(cur + (dx < 0 ? 1 : -1)); setTimeout(function () { swiped = false; }, 350); }
    });
    stage.addEventListener('pointercancel', function () { down = false; });
    stage.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); e.stopPropagation(); } }, true);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; update(); }, { threshold: .35 }).observe(stage);
    } else inView = true;
    setPause(userPaused);
  }

  // tamni blok u uskom (boxed) Elementor kontejneru dobija zaobljene ivice
  function boxed() { root.classList.toggle('jv--boxed', root.getBoundingClientRect().width < d.documentElement.clientWidth - 24); }
  w.addEventListener('resize', function () { clearTimeout(boxed.t); boxed.t = setTimeout(boxed, 150); });
  function reveal() {
    if (!('IntersectionObserver' in w) || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    root.classList.add('jv-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { root.classList.add('jv-on'); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(root);
  }

  /* ---------- podaci (WordPress REST API) ---------- */
  // EN stranice prvo pitaju /en/wp-json (qTranslate tada vraća engleski), pa obični put, pa ?rest_route= rezerva
  var bases = (EN ? [O + '/en/wp-json/'] : []).concat([O + '/wp-json/', O + '/?rest_route=/']);
  function api(path, query) {
    var i = 0;
    function attempt(err) {
      if (i >= bases.length) return Promise.reject(err);
      var b = bases[i++], url = b + 'wp/v2/' + path + (b.indexOf('?') > -1 ? '&' : '?') + query;
      return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' · ' + path); return r.json(); })
        .then(function (j) { bases = [b].concat(bases.filter(function (x) { return x !== b; })); return j; }, attempt);
    }
    return attempt(new Error('REST'));
  }
  var CK = 'jv-cat-' + SLUG;
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function categoryId(fresh) {
    var fixed = parseInt(root.getAttribute('data-kategorija-id'), 10);
    if (fixed) return Promise.resolve({ id: fixed });
    var c = !fresh && parseInt(stored(CK), 10);
    if (c) return Promise.resolve({ id: c, cached: true });
    return api('categories', 'slug=' + encodeURIComponent(SLUG) + '&_fields=id').then(function (j) {
      if (!j || !j[0] || !j[0].id) throw new Error('Kategorija "' + SLUG + '" nije pronađena');
      store(CK, j[0].id); return { id: j[0].id };
    });
  }
  function posts(cat) {
    return api('posts', 'categories=' + cat + '&per_page=' + COUNT + '&_embed=wp:featuredmedia' +
      '&_fields=id,date,link,title,excerpt,featured_media,_links,_embedded');
  }
  // ako server ne ugradi slike u odgovor, dohvati ih jednim dodatnim pozivom
  function withMedia(list) {
    var map = {}, need = [];
    list.forEach(function (p) {
      var e = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0];
      if (e && e.source_url) map[p.featured_media] = e;
      else if (p.featured_media) need.push(p.featured_media);
    });
    if (!need.length) return Promise.resolve({ list: list, map: map });
    return api('media', 'include=' + need.join(',') + '&per_page=' + need.length + '&_fields=id,source_url,media_details')
      .then(function (ms) { (ms || []).forEach(function (m) { map[m.id] = m; }); }, function () {})
      .then(function () { return { list: list, map: map }; });
  }
  function load(fresh) {
    return categoryId(fresh).then(function (cat) {
      return posts(cat.id).then(function (list) {
        if ((!list || !list.length) && cat.cached) { store(CK, null); return load(true); }   // stari ID iz memorije — pitaj ponovo
        return withMedia(list || []).then(function (r) {
          render(r.list.map(function (p) { return normalize(p, r.map[p.featured_media]); }));
        });
      });
    });
  }

  skeleton();
  load(false).catch(function (e) {
    if (w.console) console.warn('[Jahorina vijesti]', e);
    note(T.error, e && e.message);
  });
})(window, document);
