/* =====================================================================
   JAHORINA — VIDEO GALERIJA (/video-galerija/, EN /en/video-galerija/)
   Video zapisi se dodaju u WordPressu kao i do sada: Elementor widget „Video“ sa YouTube linkom.
   Opciono: Naslov (Heading) widget iznad grupe Video widgeta = album ([:SH]Zima[:en]Winter[:]).
   Kod pročita linkove i prikaže: istaknut prvi video, ostale u mreži (sličice sa YouTube-a,
   naslov sa YouTube-a preko noembed.com), plejer tek na klik — preko cijelog ekrana.
   Originalni Video widgeti se ne pokreću (red widgeta ih „uspava“ prije Elementora), pa stranica
   ne učitava 10 YouTube plejera odjednom. H1 je naslov stranice u traci iznad — ovdje se ne dodaje.
   Ugradnja: Elementor HTML widget na vrhu stranice (red iz elementor-html-widget.html: napravi-widget.py).
   Opcije na <div id="jvg-galerija">: data-uvod="[:SH]…[:en]…[:]", data-lang="en", data-pregled (bez YouTube-a).
   ===================================================================== */
(function (w, d) {
  'use strict';
  function main() {
    var root = d.getElementById('jvg-galerija');
    if (root && root.__jvg) return;
    function unhide() { var s = d.getElementById('jvg-skrij'); if (s) s.parentNode.removeChild(s); }
    if (d.body.classList.contains('elementor-editor-active') || /[?&]elementor-preview=/.test(location.search)) {
      if (root) root.innerHTML = '<p style="margin:0;padding:14px 18px;border-radius:12px;background:#0A1120;color:#C4EEFF;font:500 14px/1.5 Barlow,system-ui,sans-serif">' +
        'Video galerija: ovdje dodaješ Video widgete (YouTube link). Prvi je istaknut. Novi izgled se vidi na stranici.</p>';
      return;
    }

    var EN = /^\/en(\/|$)/i.test(location.pathname) || (root && root.getAttribute('data-lang') === 'en');
    var PREGLED = !!(root && root.hasAttribute('data-pregled'));
    var CHANNEL = 'https://www.youtube.com/@jahorinaoc';
    var T = EN ? {
      eyebrow: 'Jahorina in motion', all: 'All videos', latest: 'Latest video', group: 'Videos from Jahorina',
      intro: 'Videos from Olympic Mountain Jahorina: the slopes, the lifts, events and the atmosphere of the mountain.',
      watch: 'Watch video', yt: 'YouTube channel', more: 'More videos on our YouTube channel', follow: 'Follow us on YouTube',
      play: 'Play video', video: 'Video', viewer: 'Video player', close: 'Close', prev: 'Previous video', next: 'Next video', of: 'of',
      noPlay: 'Preview: the YouTube video plays here on the website.'
    } : {
      eyebrow: 'Jahorina u pokretu', all: 'Svi video zapisi', latest: 'Najnoviji video', group: 'Video zapisi sa Jahorine',
      intro: 'Video zapisi sa Olimpijske planine Jahorina: staze, žičare, događaji i atmosfera planine.',
      watch: 'Pogledaj video', yt: 'YouTube kanal', more: 'Više video zapisa na našem YouTube kanalu', follow: 'Pratite nas na YouTube-u',
      play: 'Pusti video', video: 'Video', viewer: 'Video plejer', close: 'Zatvori', prev: 'Prethodni video', next: 'Sljedeći video', of: 'od',
      noPlay: 'Pregled: ovdje se na sajtu pušta YouTube video.'
    };

    /* ---------- izgled (sve pod #jvg-galerija; pregled preko cijelog ekrana pod #jvg-lb) ---------- */
    var CSS = [
      '#R{--bg:#0A1120;--surface:#111A2C;--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);--accent:#00B9F2;',
      "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
      'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
      '#R.jvg--boxed{border-radius:28px;overflow:hidden}',
      '#R *,#R *::before,#R *::after{box-sizing:border-box}',
      '#R a{color:inherit;text-decoration:none;box-shadow:none}',
      '#R h2,#R h3{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;',
      'margin:0!important;padding:0!important;text-transform:none!important;text-wrap:balance;border:0!important}',
      '#R h2{font-size:clamp(24px,2.5vw,34px)!important;font-weight:800!important;line-height:1.05!important;letter-spacing:-.5px!important}',
      '#R h3{font-size:17px!important;font-weight:600!important;line-height:1.3!important;letter-spacing:0!important}',
      '#R p{margin:0;padding:0}',
      '#R ul,#R li{list-style:none;margin:0;padding:0}',
      '#R li::before,#R li::after{content:none}',
      '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
      '#R svg{display:block;flex-shrink:0}',
      '#R a:focus-visible,#R button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
      '#R .jvg-wrap{max-width:1240px;margin:0 auto;padding:clamp(20px,2.4vw,34px) clamp(16px,4vw,48px) clamp(40px,5vw,72px)}',
      /* vrh: nadnaslov (mali tekst iz hero-a) + uvod */
      '#R .jvg-eyebrow{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:16px}',
      '#R .jvg-eyebrow::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
      '#R .jvg-intro{max-width:62ch;color:var(--text-2);font-size:clamp(16px,1.3vw,18px);line-height:1.6;text-wrap:pretty}',
      '#R .jvg-top{margin-bottom:clamp(36px,4.4vw,56px)}',
      /* naslov grupe: H2 — linija — broj */
      '#R .jvg-head{display:flex;align-items:center;gap:18px;margin-bottom:clamp(16px,1.8vw,22px)}',
      '#R .jvg-rule{flex:1;height:1px;min-width:24px;background:linear-gradient(90deg,rgba(0,185,242,.55),rgba(255,255,255,.07) 70%)}',
      '#R .jvg-count{font:600 11px/1 var(--fd);letter-spacing:2.5px;text-transform:uppercase;color:var(--text-3);white-space:nowrap}',
      '#R .jvg-groups{display:flex;flex-direction:column;gap:clamp(52px,6.4vw,88px)}',
      /* sličica: 16:9, staklena ivica, dugme za pokretanje */
      '#R .jvg-thumb{all:unset;display:block;position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;cursor:pointer;background:var(--surface);isolation:isolate;-webkit-tap-highlight-color:transparent}',
      '#R .jvg-thumb img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}',
      '#R .jvg-thumb::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(10,17,32,0) 45%,rgba(10,17,32,.55))}',
      '#R .jvg-thumb::after{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),inset 0 1px 0 rgba(255,255,255,.12);transition:box-shadow .25s}',
      '#R .jvg-play{position:absolute;left:50%;top:50%;z-index:3;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;display:grid;place-items:center;color:#fff;',
      'background:linear-gradient(160deg,#45D6FF,#00AEE6 50%,#008BC7);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 12px 28px -8px rgba(0,185,242,.9);transition:transform .25s}',
      '#R .jvg-play svg{width:22px;height:22px;margin-left:3px}',
      '#R .jvg-thumb:focus-visible{outline-offset:3px!important}',
      '@media (hover:hover){#R .jvg-thumb:hover img{transform:scale(1.035)}#R .jvg-thumb:hover::after{box-shadow:inset 0 0 0 1px rgba(111,219,255,.6),inset 0 1px 0 rgba(255,255,255,.18)}#R .jvg-thumb:hover .jvg-play{transform:scale(1.08)}}',
      /* istaknut video */
      '#R .jvg-feat{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:clamp(20px,3vw,44px);align-items:center;margin-bottom:clamp(52px,6.4vw,88px)}',
      '#R .jvg-feat .jvg-thumb{border-radius:20px}',
      '#R .jvg-feat .jvg-play{width:76px;height:76px;margin:-38px 0 0 -38px}',
      '#R .jvg-feat .jvg-play svg{width:28px;height:28px}',
      '#R .jvg-feat h2{font-size:clamp(24px,2.4vw,32px)!important;line-height:1.15!important;margin-top:14px!important}',
      '#R .jvg-kick{font:600 11px/1 var(--fd);letter-spacing:3px;text-transform:uppercase;color:#9BE6FF}',
      '#R .jvg-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}',
      /* dugmad iz hero-a: glavno cyan, sporedno staklo */
      '#R .jvg-cta,#R .jvg-more{all:unset;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:10px;height:48px;padding:0 18px!important;border-radius:16px!important;cursor:pointer;',
      'font:700 12.5px/1 var(--fd)!important;letter-spacing:1.8px!important;text-transform:uppercase!important;transition:box-shadow .25s,transform .2s,filter .2s}',
      '#R .jvg-cta{color:#fff!important;background:linear-gradient(160deg,#45D6FF,#00AEE6 50%,#008BC7)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 0 0 1px rgba(255,255,255,.25),0 10px 24px -10px rgba(0,185,242,.9)!important}',
      '#R .jvg-cta::after{content:"\\2192";font:600 18px/1 var(--fd);letter-spacing:0;transition:transform .25s}',
      '#R .jvg-cta:hover{filter:brightness(1.07)}#R .jvg-cta:hover::after{transform:translateX(3px)}',
      '#R .jvg-more{color:rgba(255,255,255,.88)!important;font-weight:600!important;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.11)!important}',
      '#R .jvg-more svg{width:18px;height:18px;color:#C4EEFF}',
      '#R .jvg-more:hover{color:#fff!important;transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(111,219,255,.38),inset 0 1px 0 rgba(255,255,255,.14),0 0 18px -4px rgba(0,185,242,.45)!important}',
      '#R .jvg-cta:active,#R .jvg-more:active{transform:scale(.96)}',
      /* mreža */
      '#R .jvg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2vw,28px) clamp(14px,1.6vw,22px)}',
      '#R .jvg-item h3{margin-top:12px!important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;min-height:2.6em}',
      '#R .jvg-item h3 a:hover{color:#9BE6FF}',
      /* naslov stiže sa YouTube-a: dok ne stigne, tiha linija (bez animacije) */
      '#R .jvg-wait{display:block;height:.7em;width:70%;margin-top:.35em;border-radius:4px;background:rgba(255,255,255,.08)}',
      /* poziv na kanal */
      '#R .jvg-follow{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px 28px;margin-top:clamp(52px,6.4vw,88px);padding:clamp(20px,2.4vw,28px) clamp(20px,2.6vw,32px);border-radius:22px;',
      'background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.015));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px 0 rgba(255,255,255,.1)}',
      '#R .jvg-follow p{font:600 clamp(17px,1.6vw,21px)/1.3 var(--fd);color:#fff;max-width:36ch}',
      '@media (max-width:1100px){#R .jvg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media (max-width:860px){#R .jvg-feat{grid-template-columns:minmax(0,1fr);gap:18px}}',
      '@media (max-width:760px){',
      '#R .jvg-eyebrow{letter-spacing:4px;font-size:10.5px}',
      '#R h2{font-size:22px!important}',
      '#R .jvg-feat h2{font-size:21px!important;margin-top:10px!important}',
      '#R .jvg-feat .jvg-thumb{border-radius:14px}',
      '#R .jvg-feat .jvg-play{width:62px;height:62px;margin:-31px 0 0 -31px}',
      '#R .jvg-acts{margin-top:18px}',
      /* telefon: red = sličica lijevo, naslov desno (kraća stranica) */
      '#R .jvg-grid{grid-template-columns:minmax(0,1fr);gap:14px}',
      '#R .jvg-item{display:grid;grid-template-columns:44% minmax(0,1fr);gap:12px;align-items:center}',
      '#R .jvg-item .jvg-thumb{border-radius:10px}',
      '#R .jvg-item .jvg-play{width:38px;height:38px;margin:-19px 0 0 -19px}',
      '#R .jvg-item .jvg-play svg{width:15px;height:15px;margin-left:2px}',
      '#R .jvg-item h3{margin-top:0!important;font-size:15px!important;-webkit-line-clamp:3;min-height:0}',
      '#R .jvg-follow{border-radius:18px}}',
      '@media (prefers-reduced-motion:reduce){#R *,#R *::before,#R *::after{transition:none!important;animation:none!important}}'
    ].join('\n').replace(/#R/g, '#jvg-galerija');

    var LCSS = [
      "#L{--accent:#00B9F2;--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
      'position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:#050912;color:#fff;',
      'font:400 15px/1.5 var(--fb);text-align:left;color-scheme:dark;opacity:0;transition:opacity .2s ease;-webkit-tap-highlight-color:transparent}',
      '#L[hidden]{display:none!important}',
      '#L.is-open{opacity:1}',
      '#L *,#L *::before,#L *::after{box-sizing:border-box}',
      '#L .jvg-lb__top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px 12px}',
      '#L .jvg-lb__count{font:600 15px/1 var(--fd);letter-spacing:1px;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.5)}',
      '#L .jvg-lb__count b{font-weight:700;color:#fff}',
      '#L .jvg-lb__stage{position:relative;display:grid;place-items:center;margin:0 96px;min-height:0}',
      '#L .jvg-lb__frame{position:relative;width:min(100%,calc((100vh - 170px) * 16 / 9));aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 30px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06)}',
      '#L .jvg-lb__frame iframe,#L .jvg-lb__frame img{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;object-fit:cover}',
      '#L .jvg-lb__note{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;font:500 14px/1.4 var(--fb);color:#C4EEFF;background:linear-gradient(180deg,rgba(5,9,18,0),rgba(5,9,18,.85))}',
      '#L .jvg-lb__bottom{display:flex;align-items:center;justify-content:center;gap:14px;padding:14px 24px 22px}',
      '#L .jvg-lb__cap{margin:0;max-width:72ch;min-height:1.45em;text-align:center;font:600 16px/1.45 var(--fd);color:rgba(255,255,255,.88)}',
      '#L .jvg-lb__btn{all:unset;box-sizing:border-box!important;display:grid!important;place-items:center;width:48px!important;height:46px!important;padding:0!important;margin:0!important;border-radius:14px!important;cursor:pointer;flex-shrink:0;',
      'color:#C4EEFF!important;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),inset 0 1px 0 rgba(255,255,255,.11)!important;transition:box-shadow .25s,transform .2s,color .2s}',
      '#L .jvg-lb__btn svg{display:block;width:20px;height:20px}',
      '#L .jvg-lb__btn svg *{fill:none!important;stroke:currentColor!important}',
      '#L .jvg-lb__btn:hover{color:#fff!important;box-shadow:inset 0 0 0 1px rgba(111,219,255,.42),inset 0 1px 0 rgba(255,255,255,.14),0 0 18px -4px rgba(0,185,242,.5)!important}',
      '#L .jvg-lb__btn:active{transform:scale(.96)}',
      '#L .jvg-lb__btn:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
      '#L .jvg-lb__prev,#L .jvg-lb__next{position:absolute;top:50%;margin-top:-23px!important}',
      '#L .jvg-lb__prev{left:24px}#L .jvg-lb__next{right:24px}',
      '#L.is-one .jvg-lb__prev,#L.is-one .jvg-lb__next{visibility:hidden}',
      '@media (max-width:760px){#L .jvg-lb__top{padding:12px}#L .jvg-lb__stage{margin:0}#L .jvg-lb__frame{width:100%;border-radius:0;box-shadow:none}',
      '#L .jvg-lb__bottom{justify-content:space-between;gap:10px;padding:10px 12px max(14px,env(safe-area-inset-bottom))}',
      '#L .jvg-lb__prev,#L .jvg-lb__next{position:static;margin:0!important}',
      '#L .jvg-lb__cap{flex:1;min-width:0;font-size:14px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
      '#L .jvg-lb__btn{width:46px!important;height:44px!important}}',
      '@media (prefers-reduced-motion:reduce){#L,#L *{transition:none!important;animation:none!important}}',
      'html.jvg-lock,html.jvg-lock body{overflow:hidden!important}'
    ].join('\n').replace(/#L/g, '#jvg-lb');

    var ICON = {
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
      yt: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 9.3v5.4l4.6-2.7z" fill="currentColor"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      prev: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      next: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
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
    function ytId(u) {
      var m = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(u || '');
      return m ? m[1] : '';
    }
    function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    /* ---------- 1. Video widgeti sa stranice (i Naslov widgeti kao albumi) ---------- */
    var scope = d.querySelector('.elementor[data-elementor-type="wp-page"]') || d.querySelector('.entry-content') || d.body;
    var groups = [], cur = null, srcNodes = [], seen = {};
    [].forEach.call(scope.querySelectorAll('.elementor-widget-heading, .elementor-widget-video'), function (n) {
      if (root && root.contains(n)) return;
      if (n.classList.contains('elementor-widget-heading')) { cur = { title: clean(pickLang(n.textContent)), items: [], head: n }; groups.push(cur); return; }
      var st = {};
      try { st = JSON.parse(n.getAttribute('data-jvg-settings') || n.getAttribute('data-settings') || '{}'); } catch (e) {}
      var id = ytId(st.youtube_url);
      if (!id) return;   // nije YouTube — widget ostaje kakav jeste
      srcNodes.push(n);
      if (seen[id]) return;
      seen[id] = 1;
      if (!cur) { cur = { title: '', items: [] }; groups.push(cur); }
      cur.items.push({ id: id });
    });
    groups = groups.filter(function (g) { if (!g.items.length) return false; if (g.head) srcNodes.push(g.head); return true; });
    if (!groups.length) { unhide(); return; }
    if (!root) {
      root = d.createElement('div'); root.id = 'jvg-galerija';
      srcNodes[0].parentNode.insertBefore(root, srcNodes[0]);
    }
    root.__jvg = true;

    if (!d.getElementById('jvg-css')) {
      var st = d.createElement('style'); st.id = 'jvg-css';
      st.textContent = CSS + '\n' + LCSS + '\nhtml.jvg-page,html.jvg-page body,body.jvg-page #Wrapper,body.jvg-page #Content{background:#0A1120!important}';
      (d.head || d.documentElement).appendChild(st);
    }
    if (!d.querySelector('link[href*="family=Archivo"][href*="family=Barlow"]')) {
      var fl = d.createElement('link'); fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
      d.head.appendChild(fl);
    }

    /* ---------- 2. prikaz ---------- */
    var list = [];
    groups.forEach(function (g) { g.items.forEach(function (it) { list.push(it); }); });
    var feat = list[0];
    function thumb(it, big, eager) {
      // sličice sa YouTube-a: hqdefault (480×360, isječe se na 16:9); istaknuti probaju maxresdefault (1280×720)
      var base = 'https://i.ytimg.com/vi/' + it.id + '/', TB = root.getAttribute('data-thumbs');   // data-thumbs: samo za pregled
      return '<button type="button" class="jvg-thumb" data-k="' + list.indexOf(it) + '" aria-label="' + esc(T.play) + '">' +
        (TB ? '<img src="' + esc(TB.replace('{id}', it.id)) + '"'
            : '<img src="' + base + (big ? 'maxresdefault.jpg' : 'hqdefault.jpg') + '"' + (big ? ' data-fb="' + base + 'hqdefault.jpg"' : '')) +
        ' width="' + (big ? 1280 : 480) + '" height="' + (big ? 720 : 360) + '" alt=""' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
        '<span class="jvg-play" aria-hidden="true">' + ICON.play + '</span></button>';
    }
    function titleHtml(it) { return '<span class="jvg-t" data-id="' + it.id + '"><span class="jvg-wait"></span></span>'; }
    var intro = clean(pickLang(root.getAttribute('data-uvod') || '')) || T.intro;
    var h = '<div class="jvg-wrap"><div class="jvg-top"><div class="jvg-eyebrow">' + esc(T.eyebrow) + '</div><p class="jvg-intro">' + esc(intro) + '</p></div>' +
      '<section class="jvg-feat" aria-labelledby="jvg-h-feat">' + thumb(feat, true, true) +
      '<div><div class="jvg-kick">' + esc(T.latest) + '</div><h2 id="jvg-h-feat">' + titleHtml(feat) + '</h2>' +
      '<div class="jvg-acts"><button type="button" class="jvg-cta" data-k="0">' + esc(T.watch) + '</button>' +
      '<a class="jvg-more" href="' + CHANNEL + '" target="_blank" rel="noopener">' + ICON.yt + esc(T.yt) + '</a></div></div></section><div class="jvg-groups">';
    groups.forEach(function (g, gi) {
      var items = g.items.filter(function (it) { return it !== feat; });
      if (!items.length) return;
      var name = g.title || (groups.length > 1 ? T.group : T.all);
      h += '<section class="jvg-group" aria-labelledby="jvg-h-' + gi + '"><div class="jvg-head"><h2 id="jvg-h-' + gi + '">' + esc(name) + '</h2><span class="jvg-rule" aria-hidden="true"></span>' +
        '<span class="jvg-count">' + items.length + ' ' + (EN ? (items.length === 1 ? 'video' : 'videos') : 'video') + '</span></div><ul class="jvg-grid">' +
        items.map(function (it) {
          return '<li class="jvg-item">' + thumb(it, false, false) + '<h3><a href="https://www.youtube.com/watch?v=' + it.id + '" data-k="' + list.indexOf(it) + '">' + titleHtml(it) + '</a></h3></li>';
        }).join('') + '</ul></section>';
    });
    h += '</div><div class="jvg-follow"><p>' + esc(T.more) + '</p><a class="jvg-cta" href="' + CHANNEL + '" target="_blank" rel="noopener">' + esc(T.follow) + '</a></div></div>';
    root.innerHTML = h;
    // originalni widgeti (i Naslovi albuma) se uklone — bez duplih naslova i bez YouTube plejera u pozadini
    srcNodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    d.body.classList.add('jvg-page'); d.documentElement.classList.add('jvg-page');
    unhide();
    // maxresdefault ne postoji za svaki video (YouTube tada vrati sivu sličicu 120×90)
    [].forEach.call(root.querySelectorAll('img[data-fb]'), function (img) {
      function chk() { if (img.naturalWidth && img.naturalWidth <= 120) { img.src = img.getAttribute('data-fb'); img.removeAttribute('data-fb'); } }
      img.addEventListener('load', chk); img.addEventListener('error', function () { img.src = img.getAttribute('data-fb'); });
      if (img.complete) chk();
    });

    /* ---------- 3. naslovi sa YouTube-a (noembed.com — YouTube oEmbed bez CORS ograničenja), keš 7 dana ---------- */
    function setTitle(id, t) {
      list.forEach(function (it) { if (it.id === id) it.title = t; });
      [].forEach.call(root.querySelectorAll('.jvg-t[data-id="' + id + '"]'), function (s) { s.textContent = t; });
      [].forEach.call(root.querySelectorAll('.jvg-thumb'), function (b) { var it = list[+b.getAttribute('data-k')]; if (it && it.id === id) b.setAttribute('aria-label', T.play + ': ' + t); });
    }
    list.forEach(function (it) {
      var c = stored('jvgT:' + it.id), m = c && /^(\d+)\|(.*)$/.exec(c);
      if (m && Date.now() - m[1] < 7 * 864e5) { setTitle(it.id, m[2]); return; }
      if (PREGLED && w.__jvgTitles) { setTitle(it.id, w.__jvgTitles[it.id] || T.video); return; }
      fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + it.id))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var t = clean(j && j.title);
          if (!t) throw new Error('bez naslova');
          setTitle(it.id, t); store('jvgT:' + it.id, Date.now() + '|' + t);
        })
        .catch(function () { setTitle(it.id, T.video + ' ' + (list.indexOf(it) + 1)); });
    });

    /* ---------- puna širina ---------- */
    function fit() {
      var s = root.style;
      s.removeProperty('width'); s.removeProperty('max-width'); s.removeProperty('margin-left');
      var cw = d.documentElement.clientWidth, r = root.getBoundingClientRect();
      if (r.width < cw - 1) {
        s.setProperty('width', cw + 'px', 'important');
        s.setProperty('max-width', 'none', 'important');
        s.setProperty('margin-left', -r.left + 'px', 'important');
      }
      root.classList.toggle('jvg--boxed', root.getBoundingClientRect().width < cw - 24);
    }
    function refit() { clearTimeout(fit.t); fit.t = setTimeout(fit, 120); }
    w.addEventListener('resize', refit);
    if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);
    fit();

    /* ---------- 4. plejer preko cijelog ekrana (YouTube se učita tek ovdje) ---------- */
    var lb, frame, cap, cnt, btnClose, btnPrev, btnNext, curK = -1, pushed = false, closing = 0, opener = null;
    var REDUCE = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-k]');
      if (!t || (t.tagName === 'A' && (e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0))) return;
      e.preventDefault();
      opener = t; open(+t.getAttribute('data-k'));
    });
    function build() {
      lb = d.createElement('div');
      lb.id = 'jvg-lb'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.viewer);
      lb.innerHTML = '<div class="jvg-lb__top"><span class="jvg-lb__count"></span>' +
        '<button type="button" class="jvg-lb__btn jvg-lb__close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button></div>' +
        '<div class="jvg-lb__stage"><div class="jvg-lb__frame"></div></div>' +
        '<div class="jvg-lb__bottom"><button type="button" class="jvg-lb__btn jvg-lb__prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
        '<p class="jvg-lb__cap" aria-live="polite"></p>' +
        '<button type="button" class="jvg-lb__btn jvg-lb__next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button></div>';
      d.body.appendChild(lb);
      frame = lb.querySelector('.jvg-lb__frame'); cap = lb.querySelector('.jvg-lb__cap'); cnt = lb.querySelector('.jvg-lb__count');
      btnClose = lb.querySelector('.jvg-lb__close'); btnPrev = lb.querySelector('.jvg-lb__prev'); btnNext = lb.querySelector('.jvg-lb__next');
      btnClose.addEventListener('click', close);
      btnPrev.addEventListener('click', function () { show(curK - 1); });
      btnNext.addEventListener('click', function () { show(curK + 1); });
      // dodir/klik van videa zatvara
      lb.addEventListener('click', function (e) { if (!e.target.closest('.jvg-lb__frame, button')) close(); });
    }
    function show(k) {
      var n = list.length;
      curK = (k % n + n) % n;
      var it = list[curK];
      frame.innerHTML = PREGLED
        ? '<img src="' + esc(root.querySelector('.jvg-thumb[data-k="' + curK + '"] img').currentSrc) + '" alt=""><span class="jvg-lb__note">' + esc(T.noPlay) + '</span>'
        : '<iframe src="https://www.youtube-nocookie.com/embed/' + it.id + '?autoplay=1&rel=0&playsinline=1" title="' + esc(it.title || T.video) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      cap.textContent = it.title || '';
      cnt.innerHTML = '<b>' + (curK + 1) + '</b> / ' + n;
    }
    function open(k) {
      if (!lb) build();
      clearTimeout(closing);
      lb.classList.toggle('is-one', list.length < 2);
      var sb = w.innerWidth - d.documentElement.clientWidth;
      d.documentElement.classList.add('jvg-lock');
      if (sb > 0) d.body.style.paddingRight = sb + 'px';
      lb.hidden = false;
      show(k);
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      btnClose.focus({ preventScroll: true });
      d.addEventListener('keydown', onKey);
      try { history.pushState({ jvg: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    }
    function close() {
      if (!lb || lb.hidden) return;
      if (pushed) { pushed = false; try { history.back(); } catch (e) {} closing = setTimeout(shut, 350); return; }
      shut();
    }
    function shut() {
      clearTimeout(closing);
      if (!lb || lb.hidden) return;
      lb.classList.remove('is-open');
      frame.innerHTML = '';   // zaustavi video
      d.removeEventListener('keydown', onKey);
      setTimeout(function () {
        lb.hidden = true;
        d.documentElement.classList.remove('jvg-lock');
        d.body.style.paddingRight = '';
        if (opener) opener.focus({ preventScroll: true });
      }, REDUCE ? 0 : 200);
    }
    w.addEventListener('popstate', function () { if (lb && !lb.hidden) { pushed = false; shut(); } });
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(curK + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(curK - 1); }
      else if (e.key === 'Tab') {
        var f = [btnClose, btnPrev, btnNext].filter(function (b) { return b.offsetParent && getComputedStyle(b).visibility !== 'hidden'; });
        var i = f.indexOf(d.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', main); else main();
})(window, document);
