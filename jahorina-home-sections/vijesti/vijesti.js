/* =====================================================================
   JAHORINA — OBAVJEŠTENJA I VIJESTI (početna, ispod hero-a)
   Čita najnovije objave iz WordPress kategorije "Vijesti" (REST API) i crta ih
   u stilu hero-a: jedna velika vijest lijevo, tri manje desno.
   Objave se dodaju u WordPressu kao i do sada — ovdje se ništa ne unosi ručno.
   Ugradnja: Elementor HTML widget sa redom iz elementor-html-widget.html
   (<div id="jv-vijesti"></div> + ovaj fajl sa jsDelivr-a).
   Opcije na <div id="jv-vijesti">: data-kategorija="vijesti" (slug),
   data-kategorija-id="123" (preskače traženje ID-a), data-broj="4".
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jv-vijesti');
  if (!root || root.__jv) return;
  root.__jv = true;

  var O = location.origin;
  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var SLUG = root.getAttribute('data-kategorija') || 'vijesti';
  var COUNT = Math.max(1, Math.min(8, parseInt(root.getAttribute('data-broj'), 10) || 4));
  var NIGHT = O + '/wp-content/uploads/2026/09/jahorina-noc.webp';   // ista noćna fotografija kao u hero-u

  var T = EN ? {
    eyebrow: 'News', title: 'Notices and news', all: 'All news',
    notice: 'Notice', news: 'News',
    empty: 'There is no news at the moment.', error: 'News could not be loaded right now.'
  } : {
    eyebrow: 'Vijesti', title: 'Obavještenja i vijesti', all: 'Sve vijesti',
    notice: 'Obavještenje', news: 'Vijest',
    empty: 'Trenutno nema vijesti.', error: 'Vijesti trenutno nije moguće učitati.'
  };
  var ALL = O + (EN ? '/en' : '') + '/category/' + SLUG + '/';

  /* ---------- izgled (sve je pod #jv-vijesti da se ne sudara sa temom) ---------- */
  var CSS = [
    '#V{--bg:#0A1120;--surface:#111A2C;--surface-2:#16213A;--line:rgba(255,255,255,.08);--text:#fff;--text-2:rgba(255,255,255,.74);--text-3:rgba(255,255,255,.5);',
    '--accent:#00B9F2;--warn:#FFB547;--raised:6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14);--inset:inset 4px 4px 10px rgba(0,0,0,.5),inset -4px -4px 9px rgba(70,96,142,.13);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#V.jv--boxed{border-radius:28px;overflow:hidden}',
    '#V *,#V *::before,#V *::after{box-sizing:border-box}',
    '#V a{color:inherit;text-decoration:none;box-shadow:none}',
    '#V h2,#V h3{font-family:var(--fd);color:var(--text);margin:0;padding:0;text-transform:none;text-wrap:balance;border:0}',
    '#V p{margin:0;padding:0}',
    '#V img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#V svg{display:block;flex-shrink:0}',
    '#V a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}',
    '#V .jv-wrap{max-width:1240px;margin:0 auto;padding:clamp(56px,7vw,96px) clamp(16px,4vw,48px)}',

    /* naslov sekcije */
    '#V .jv-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:32px;flex-wrap:wrap}',
    '#V .jv-eyebrow{display:flex;align-items:center;gap:10px;font:600 12px/1 var(--fd);letter-spacing:2.6px;text-transform:uppercase;color:var(--accent);margin-bottom:14px}',
    '#V .jv-eyebrow::before{content:"";width:22px;height:2px;border-radius:2px;background:var(--accent);box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#V h2{font-size:clamp(30px,3.6vw,46px);font-weight:800;line-height:1.02;letter-spacing:-.015em}',
    '#V .jv-more{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:40px;font:600 14px/1 var(--fd);color:var(--text-2);background:var(--surface);box-shadow:var(--raised);transition:color .2s}',
    '#V .jv-more:hover{color:var(--accent)}',
    '#V .jv-more svg{transition:transform .2s}',
    '#V .jv-more:hover svg{transform:translateX(3px)}',

    /* raspored: velika vijest + lista */
    '#V .jv-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:24px}',
    '#V .jv-grid--one{grid-template-columns:minmax(0,1fr)}',
    '#V .jv-feat{position:relative;border-radius:28px;overflow:hidden;min-height:440px;display:flex;align-items:flex-end;background:var(--surface);box-shadow:var(--raised);isolation:isolate}',
    '#V .jv-feat img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:transform .8s cubic-bezier(.2,.7,.2,1)}',
    '#V .jv-feat:hover img{transform:scale(1.04)}',
    '#V .jv-feat::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(10,17,32,.05) 15%,rgba(10,17,32,.78) 52%,rgba(10,17,32,.97) 90%)}',
    '#V .jv-feat__body{position:relative;padding:clamp(22px,3vw,36px);max-width:620px}',
    '#V .jv-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:20px;font:600 11.5px/1 var(--fd);letter-spacing:1.4px;text-transform:uppercase;background:rgba(255,181,71,.14);color:var(--warn);border:1px solid rgba(255,181,71,.35)}',
    '#V .jv-chip--news{background:rgba(0,185,242,.12);color:var(--accent);border-color:rgba(0,185,242,.35)}',
    '#V .jv-feat h3{font-size:clamp(24px,2.6vw,34px);font-weight:800;line-height:1.08;letter-spacing:-.01em;margin:16px 0 12px}',
    '#V .jv-feat h3:first-child{margin-top:0}',
    '#V .jv-feat h3.jv-long{font-size:clamp(21px,2vw,27px);line-height:1.15}',
    '#V .jv-feat p{color:var(--text-2);max-width:56ch;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}',
    '#V .jv-meta{display:flex;align-items:center;gap:8px;margin-top:18px;font-size:14px;line-height:1.3;color:var(--text-3)}',
    '#V .jv-list{display:flex;flex-direction:column;gap:14px}',
    '#V .jv-row{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;align-items:center;padding:12px;border-radius:22px;background:var(--surface);box-shadow:var(--raised);transition:transform .25s,box-shadow .25s}',
    '#V .jv-row:hover{transform:translateY(-2px);box-shadow:var(--raised),0 0 0 1px rgba(0,185,242,.35)}',
    '#V .jv-row__img{aspect-ratio:1;border-radius:16px;overflow:hidden;background:var(--surface-2)}',
    '#V .jv-row__img img{width:100%;height:100%;object-fit:cover}',
    '#V .jv-ph{width:100%;height:100%;display:grid;place-items:center;color:var(--text-3);box-shadow:var(--inset)}',
    '#V .jv-row h3{font-size:17px;font-weight:700;line-height:1.25;margin:8px 0 6px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}',
    '#V .jv-row h3:first-child{margin-top:0}',
    '#V .jv-row .jv-meta{margin-top:0;font-size:13px}',

    /* učitavanje, prazno, greška */
    '#V .jv-sk{background:var(--surface);box-shadow:var(--inset);position:relative;overflow:hidden}',
    '#V .jv-sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:jvShine 1.6s infinite}',
    '#V .jv-feat.jv-sk{box-shadow:var(--inset)}',
    '#V .jv-row.jv-sk{height:120px}',
    '@keyframes jvShine{to{transform:translateX(100%)}}',
    '#V .jv-note{border-radius:28px;padding:clamp(28px,4vw,44px);background:var(--surface);box-shadow:var(--inset);color:var(--text-2);display:flex;flex-direction:column;align-items:flex-start;gap:16px}',
    '#V .jv-note small{color:var(--text-3);font-size:12px}',

    /* tihi ulazak kartica kad sekcija dođe u vidno polje */
    '#V.jv-anim .jv-feat:not(.jv-sk),#V.jv-anim .jv-row:not(.jv-sk){opacity:0;transform:translateY(14px)}',
    '#V.jv-anim.jv-on .jv-feat:not(.jv-sk),#V.jv-anim.jv-on .jv-row:not(.jv-sk){opacity:1;transform:none;transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1),box-shadow .25s}',
    '#V.jv-anim.jv-on .jv-row:nth-child(1){transition-delay:.08s}',
    '#V.jv-anim.jv-on .jv-row:nth-child(2){transition-delay:.16s}',
    '#V.jv-anim.jv-on .jv-row:nth-child(3){transition-delay:.24s}',
    '#V.jv-anim.jv-on .jv-row:nth-child(n+4){transition-delay:.32s}',
    '#V.jv-anim.jv-on .jv-row:hover{transition-delay:0s;transform:translateY(-2px)}',

    /* tablet / telefon */
    '@media (max-width:1060px){#V .jv-grid{grid-template-columns:minmax(0,1fr)}}',
    '@media (max-width:680px){#V .jv-feat{min-height:380px}#V .jv-row{grid-template-columns:76px minmax(0,1fr);gap:14px}#V .jv-row h3{font-size:16px}#V .jv-head{margin-bottom:24px}}',
    '@media (prefers-reduced-motion:reduce){#V *,#V *::after{animation:none!important;transition:none!important}#V .jv-feat,#V .jv-row{opacity:1!important;transform:none!important}}'
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
    cal: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    doc: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3 H14 L19 8 V21 H7 Z M14 3 V8 H19" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
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
      title: generic ? ex : title, excerpt: generic ? '' : clip(ex, 230), link: link, date: p.date || '',
      notice: NOTICE_RE.test(title) || NOTICE_RE.test(ex),
      noticeOnly: NOTICE_ONLY.test(title) && !generic,
      img: sizesOf(media)
    };
  }

  /* ---------- crtanje ---------- */
  function head() {
    return '<div class="jv-head"><div><div class="jv-eyebrow">' + esc(T.eyebrow) + '</div><h2 id="jv-h">' + esc(T.title) + '</h2></div>' +
      '<a class="jv-more" href="' + esc(ALL) + '">' + esc(T.all) + ' ' + ICON.arrow + '</a></div>';
  }
  function chip(n) {
    if (n.notice && n.noticeOnly) return '';   // naslov je već "Obavještenje" — ne ponavljaj
    return n.notice ? '<span class="jv-chip">' + esc(T.notice) + '</span>' : '<span class="jv-chip jv-chip--news">' + esc(T.news) + '</span>';
  }
  function timeTag(n, withDay) {
    var dt = n.date.slice(0, 10), txt = fmtDate(n.date, withDay);
    return txt ? '<time datetime="' + esc(dt) + '">' + esc(txt) + '</time>' : '';
  }
  function feat(n) {
    var src = pickImg(n.img, 900) || NIGHT, set = srcset(n.img);
    return '<a class="jv-feat" href="' + esc(n.link) + '">' +
      '<img src="' + esc(src) + '"' + (set ? ' srcset="' + esc(set) + '" sizes="(max-width:1060px) 100vw, 720px"' : '') + ' alt="" loading="lazy" decoding="async">' +
      '<div class="jv-feat__body">' + chip(n) + '<h3' + (n.title.length > 75 ? ' class="jv-long"' : '') + '>' + esc(clip(n.title, 120)) + '</h3>' +
      (n.excerpt ? '<p>' + esc(n.excerpt) + '</p>' : '') +
      '<div class="jv-meta">' + ICON.cal + timeTag(n, true) + '</div></div></a>';
  }
  function row(n) {
    var src = pickImg(n.img, 150, true);
    var pic = src ? '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" width="96" height="96">' : '<div class="jv-ph">' + ICON.doc + '</div>';
    return '<a class="jv-row" href="' + esc(n.link) + '"><div class="jv-row__img">' + pic + '</div>' +
      '<div>' + chip(n) + '<h3>' + esc(clip(n.title, 110)) + '</h3><div class="jv-meta">' + timeTag(n, false) + '</div></div></a>';
  }
  function frame(inner) {
    root.innerHTML = '<section class="jv-wrap" aria-labelledby="jv-h">' + head() + inner + '</section>';
    boxed();
  }
  function skeleton() {
    frame('<div class="jv-grid" aria-busy="true"><div class="jv-feat jv-sk"></div><div class="jv-list">' +
      new Array(Math.max(0, COUNT - 1) + 1).join('<div class="jv-row jv-sk"></div>') + '</div></div>');
  }
  function note(msg, why) {
    var admin = d.body && d.body.classList.contains('logged-in');   // tehnički detalj vide samo prijavljeni
    frame('<div class="jv-note"><p>' + esc(msg) + '</p><a class="jv-more" href="' + esc(ALL) + '">' + esc(T.all) + ' ' + ICON.arrow + '</a>' +
      (admin && why ? '<small>' + esc(why) + '</small>' : '') + '</div>');
  }
  function render(items) {
    if (!items.length) return note(T.empty);
    var rest = items.slice(1);
    frame('<div class="jv-grid' + (rest.length ? '' : ' jv-grid--one') + '">' + feat(items[0]) +
      (rest.length ? '<div class="jv-list">' + rest.map(row).join('') + '</div>' : '') + '</div>');
    reveal();
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
