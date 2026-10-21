/* =====================================================================
   JAHORINA — FOTO GALERIJA (/foto-galerija/, EN /en/foto-galerija/)
   Fotografije se dodaju u WordPressu kao i do sada: Elementor widget „Basic Gallery“
   (osnovna galerija). Svaki takav widget je jedan album; naziv albuma je Naslov (Heading)
   widget iznad njega (dva jezika: [:SH]Skijanje[:en]Skiing[:]). Kod pročita fotografije,
   iz Medija uzme alt tekst, dimenzije i manje verzije slika (REST API) i prikaže ih:
   albumi (H2) jedan ispod drugog, mreža bez sječenja, pregled preko cijelog ekrana.
   H1 je naslov stranice u traci iznad (4-naslov) — ovdje se ne dodaje.
   Ugradnja: Elementor HTML widget na vrhu stranice: <div id="jfg-galerija"></div> + ovaj fajl.
   Opcije na <div id="jfg-galerija">: data-uvod="[:SH]…[:en]…[:]" (rečenica ispod naslova),
   data-lang="en" (jezik, ako nije /en/ adresa).
   ===================================================================== */
(function (w, d) {
  'use strict';
  function main() {
    var root = d.getElementById('jfg-galerija');
    if (root && root.__jfg) return;

    var O = location.origin;
    var EN = /^\/en(\/|$)/i.test(location.pathname) || (root && root.getAttribute('data-lang') === 'en');
    var T = EN ? {
      photos: ['photo', 'photos', 'photos'], albums: ['album', 'albums', 'albums'],
      intro: 'Winter on Olympic Mountain Jahorina: slopes, lifts, the sea of clouds at sunset and night skiing.',
      album: 'Photos from Jahorina', viewer: 'Photo viewer', close: 'Close', prev: 'Previous photo', next: 'Next photo',
      noAlt: 'No alt text', of: 'of'
    } : {
      photos: ['fotografija', 'fotografije', 'fotografija'], albums: ['album', 'albuma', 'albuma'],
      intro: 'Zima na Olimpijskoj planini Jahorina: staze, žičare, more oblaka u zalazak sunca i noćno skijanje.',
      album: 'Fotografije sa Jahorine', viewer: 'Pregled fotografija', close: 'Zatvori', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija',
      noAlt: 'Bez alt teksta', of: 'od'
    };

    /* ---------- izgled galerije (sve pod #jfg-galerija) ---------- */
    var CSS = [
      '#R{--bg:#0A1120;--surface:#111A2C;--line:rgba(255,255,255,.08);--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);',
      '--accent:#00B9F2;--warn:#FFB547;--rh:236px;--gap:10px;',
      "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
      'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
      '#R.jfg--boxed{border-radius:28px;overflow:hidden}',
      '#R *,#R *::before,#R *::after{box-sizing:border-box}',
      '#R a{color:inherit;text-decoration:none;box-shadow:none}',
      '#R h2{font-family:var(--fd)!important;font-size:clamp(24px,2.5vw,34px)!important;font-weight:800!important;line-height:1.05!important;letter-spacing:-.5px!important;',
      'color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;',
      'margin:0!important;padding:0!important;text-transform:none!important;text-wrap:balance;border:0!important}',
      '#R p{margin:0;padding:0}',
      '#R ul,#R li{list-style:none;margin:0;padding:0}',
      '#R li::before,#R li::after{content:none}',
      '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
      '#R svg{display:block;flex-shrink:0}',
      '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
      '#R .jfg-wrap{max-width:1240px;margin:0 auto;padding:clamp(36px,4.5vw,64px) clamp(16px,4vw,48px) clamp(56px,7vw,100px)}',

      /* vrh: broj fotografija (stil malog teksta iz hero-a) + uvod */
      '#R .jfg-eyebrow{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:16px;font-variant-numeric:tabular-nums}',
      '#R .jfg-eyebrow::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
      '#R .jfg-intro{max-width:62ch;color:var(--text-2);font-size:clamp(16px,1.3vw,18px);line-height:1.6;text-wrap:pretty}',
      '#R .jfg-top{margin-bottom:clamp(40px,4.6vw,60px)}',

      /* album: H2 — linija — broj fotografija */
      '#R .jfg-albums{display:flex;flex-direction:column;gap:clamp(52px,6.4vw,88px)}',
      '#R .jfg-ahead{display:flex;align-items:center;gap:18px;margin-bottom:clamp(16px,1.8vw,22px)}',
      '#R .jfg-rule{flex:1;height:1px;min-width:24px;background:linear-gradient(90deg,rgba(0,185,242,.55),rgba(255,255,255,.07) 70%)}',
      '#R .jfg-count{font:600 11px/1 var(--fd);letter-spacing:2.5px;text-transform:uppercase;color:var(--text-3);white-space:nowrap;font-variant-numeric:tabular-nums}',

      /* mreža: puni redovi skoro iste visine, svaka fotografija u svom obliku (bez sječenja); širine računa layout() */
      '#R .jfg-grid{display:flex;flex-wrap:wrap;gap:var(--gap)}',
      '#R .jfg-grid::after{content:"";flex:999999 1 0px}',
      '#R .jfg-item{position:relative;flex-shrink:1;flex-basis:calc(var(--r) * var(--rh));min-width:0}',
      '#R .jfg-link{display:block;position:relative;width:100%;aspect-ratio:var(--r);border-radius:12px;overflow:hidden;background:var(--surface);isolation:isolate;-webkit-tap-highlight-color:transparent}',
      '#R .jfg-link img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;opacity:0;transition:opacity .4s ease,transform .6s cubic-bezier(.2,.7,.2,1)}',
      '#R .jfg-link img.is-ld{opacity:1}',
      /* tanka svijetla ivica (staklo) */
      '#R .jfg-link::after{content:"";position:absolute;inset:0;z-index:1;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),inset 0 1px 0 rgba(255,255,255,.12);transition:box-shadow .25s}',
      '@media (hover:hover){#R .jfg-link:hover img{transform:scale(1.035)}#R .jfg-link:hover::after{box-shadow:inset 0 0 0 1px rgba(111,219,255,.6),inset 0 1px 0 rgba(255,255,255,.18)}}',
      '#R .jfg-link:focus-visible{outline-offset:2px!important}',
      /* samo za prijavljenog admina: fotografija bez alt teksta u Medijima */
      '#R .jfg-warn{position:absolute;left:8px;top:8px;z-index:2;padding:5px 8px;border-radius:20px;font:600 10px/1 var(--fd);letter-spacing:1px;text-transform:uppercase;color:var(--warn);background:rgba(10,17,32,.86);box-shadow:inset 0 0 0 1px rgba(255,181,71,.5)}',

      '@media (max-width:1100px){#R{--rh:190px}}',
      '@media (max-width:760px){#R{--rh:112px;--gap:6px}',
      '#R .jfg-link{border-radius:9px}',
      '#R .jfg-ahead{gap:12px}',
      '#R h2{font-size:22px!important}',
      '#R .jfg-eyebrow{letter-spacing:4px;font-size:10.5px}}',
      '@media (prefers-reduced-motion:reduce){#R *,#R *::before,#R *::after{transition:none!important;animation:none!important}}'
    ].join('\n').replace(/#R/g, '#jfg-galerija');

    /* ---------- izgled pregleda preko cijelog ekrana (#jfg-lb, dodaje se u <body>) ---------- */
    var LCSS = [
      "#L{--accent:#00B9F2;--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
      'position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:#050912;color:#fff;',
      'font:400 15px/1.5 var(--fb);text-align:left;color-scheme:dark;touch-action:pinch-zoom;opacity:0;transition:opacity .2s ease;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}',
      '#L[hidden]{display:none!important}',
      '#L.is-open{opacity:1}',
      '#L *,#L *::before,#L *::after{box-sizing:border-box}',
      '#L .jfg-lb__top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px 12px}',
      '#L .jfg-lb__info{display:flex;flex-direction:column;gap:9px;min-width:0}',
      '#L .jfg-lb__album{display:flex;align-items:center;gap:12px;font:600 11px/1 var(--fd);letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#L .jfg-lb__album::before{content:"";width:26px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
      '#L .jfg-lb__count{font:600 15px/1 var(--fd);letter-spacing:1px;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.5)}',
      '#L .jfg-lb__count b{font-weight:700;color:#fff}',
      '#L .jfg-lb__stage{position:relative;overflow:hidden;margin:0 96px}',
      '#L .jfg-lb__fig{position:absolute;left:0;top:0;margin:0;padding:0;border-radius:10px;overflow:hidden;background:#0c1424;box-shadow:0 30px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06)}',
      '#L .jfg-lb__fig img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:contain;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;-webkit-user-drag:none}',
      '#L .jfg-lb__img{opacity:0;transition:opacity .25s ease}',
      '#L .jfg-lb__img.is-ld{opacity:1}',
      '#L .jfg-lb__fig.is-back{transition:transform .25s cubic-bezier(.2,.7,.2,1)}',
      '#L .jfg-lb__fig.in-r{animation:jfgInR .26s cubic-bezier(.2,.7,.2,1)}',
      '#L .jfg-lb__fig.in-l{animation:jfgInL .26s cubic-bezier(.2,.7,.2,1)}',
      '#L .jfg-lb__fig.in-o{animation:jfgOpen .24s cubic-bezier(.2,.7,.2,1)}',
      '@keyframes jfgInR{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:none}}',
      '@keyframes jfgInL{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}',
      '@keyframes jfgOpen{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}',
      '#L .jfg-lb__bottom{display:flex;align-items:center;justify-content:center;gap:14px;padding:14px 24px 22px}',
      '#L .jfg-lb__cap{margin:0;max-width:72ch;min-height:1.45em;text-align:center;font:400 15px/1.45 var(--fb);color:rgba(255,255,255,.8)}',
      /* staklena dugmad kao u hero-u, ledeno-plave ikonice */
      '#L .jfg-lb__btn{all:unset;box-sizing:border-box!important;display:grid!important;place-items:center;width:48px!important;height:46px!important;padding:0!important;margin:0!important;border:0!important;border-radius:14px!important;cursor:pointer;flex-shrink:0;',
      'color:#C4EEFF!important;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),inset 0 1px 0 rgba(255,255,255,.11)!important;transition:box-shadow .25s,transform .2s,color .2s}',
      '#L .jfg-lb__btn svg{display:block;width:20px;height:20px}',
      '#L .jfg-lb__btn svg *{fill:none!important;stroke:currentColor!important}',
      '#L .jfg-lb__btn:hover{color:#fff!important;box-shadow:inset 0 0 0 1px rgba(111,219,255,.42),inset 0 1px 0 rgba(255,255,255,.14),0 0 18px -4px rgba(0,185,242,.5)!important}',
      '#L .jfg-lb__btn:active{transform:scale(.96)}',
      '#L .jfg-lb__btn:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
      '#L .jfg-lb__prev,#L .jfg-lb__next{position:absolute;top:50%;margin-top:-23px!important}',
      '#L .jfg-lb__prev{left:24px}',
      '#L .jfg-lb__next{right:24px}',
      '#L.is-one .jfg-lb__prev,#L.is-one .jfg-lb__next{visibility:hidden}',
      '@media (max-width:760px){',
      '#L .jfg-lb__top{padding:12px 12px 8px}',
      '#L .jfg-lb__album{font-size:10px;letter-spacing:3px}',
      '#L .jfg-lb__count{font-size:14px}',
      '#L .jfg-lb__stage{margin:0}',
      '#L .jfg-lb__fig{border-radius:0;box-shadow:none}',
      '#L .jfg-lb__bottom{justify-content:space-between;gap:10px;padding:10px 12px max(14px,env(safe-area-inset-bottom))}',
      '#L .jfg-lb__prev,#L .jfg-lb__next{position:static;margin:0!important}',
      '#L .jfg-lb__cap{flex:1;min-width:0;font-size:13px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
      '#L .jfg-lb__btn{width:46px!important;height:44px!important}}',
      '@media (max-width:760px) and (orientation:landscape){#L .jfg-lb__top{padding:6px 12px 4px}#L .jfg-lb__bottom{padding:4px 12px 8px}}',
      '@media (prefers-reduced-motion:reduce){#L,#L *{transition:none!important;animation:none!important}}',
      'html.jfg-lock,html.jfg-lock body{overflow:hidden!important}'
    ].join('\n').replace(/#L/g, '#jfg-lb');

    /* ---------- pomoćno ---------- */
    var ICON = {
      close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      prev: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      next: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
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
    // 1 fotografija, 2–4 fotografije, 5+ fotografija (11–14 fotografija)
    function plural(n, f) {
      if (EN) return n === 1 ? f[0] : f[1];
      var a = n % 10, b = n % 100;
      return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2];
    }
    function slugify(s) {
      s = s.toLowerCase().replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj');
      return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'album';
    }
    // naziv iz fotoaparata/telefona ("IMG-2025…", "WhatsApp slika…", "DSC_8558", "default") nije opis slike
    function cameraName(s) { return !s || /^(img|dsc|dji|gopr|pxl|mvimg|whatsapp|image|default|photo|foto|screenshot|snimak|jd_|p\d|\d)/i.test(s) || !/[a-zA-Zčćšžđ]{3}/.test(s); }

    /* ---------- 1. fotografije koje je WordPress već ispisao (Elementor „Basic Gallery“) ---------- */
    var scope = d.querySelector('.elementor[data-elementor-type="wp-page"]') || d.querySelector('.entry-content') || d.body;
    function parseItems(box) {
      return [].map.call(box.querySelectorAll('.gallery-item, .blocks-gallery-item, .wp-block-image'), function (it) {
        var a = it.querySelector('a'), img = it.querySelector('img');
        if (!img) return null;
        var id = 0, url = a ? a.getAttribute('href') || '' : '';
        var hash = a && a.getAttribute('data-e-action-hash');   // Elementor lightbox: base64 JSON sa ID-em priloga
        if (hash) try {
          var j = JSON.parse(atob(decodeURIComponent(hash).split('settings=')[1]));
          id = parseInt(j.id, 10) || 0;
          if (!url && j.url) url = j.url;
        } catch (e) {}
        if (!id) { var m = /wp-image-(\d+)/.exec(img.className) || [0, img.getAttribute('data-id')]; id = parseInt(m[1], 10) || 0; }
        if (!/\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i.test(url)) url = (img.getAttribute('src') || '').replace(/-\d+x\d+(?=\.\w+$)/, '');
        return {
          id: id, full: url, thumb: img.getAttribute('src') || '', alt: clean(img.getAttribute('alt')),
          title: clean(it.getAttribute('data-title') || (a && a.getAttribute('data-elementor-lightbox-title')) || '')
        };
      }).filter(Boolean);
    }
    function collect() {
      var nodes = scope.querySelectorAll('.elementor-widget-heading, .elementor-widget-image-gallery'), out = [], head = null;
      [].forEach.call(nodes, function (n) {
        if (root && root.contains(n)) return;
        if (n.classList.contains('elementor-widget-heading')) { head = n; return; }
        var items = parseItems(n);
        if (items.length) out.push({ title: head ? clean(pickLang(head.textContent)) : '', src: [n].concat(head ? [head] : []), items: items });
        head = null;
      });
      if (!out.length) {   // bez Elementora: obična WordPress galerija
        [].forEach.call(scope.querySelectorAll('.gallery, .wp-block-gallery'), function (g) {
          if (root && root.contains(g)) return;
          if (g.parentNode && g.parentNode.closest && g.parentNode.closest('.gallery, .wp-block-gallery')) return;
          var items = parseItems(g);
          if (items.length) out.push({ title: '', src: [g], items: items });
        });
      }
      return out;
    }
    var albums = collect();
    if (!albums.length) return;
    if (!root) {   // bez HTML widgeta: galerija ide na mjesto prve
      root = d.createElement('div'); root.id = 'jfg-galerija';
      albums[0].src[albums[0].src.length - 1].parentNode.insertBefore(root, albums[0].src[albums[0].src.length - 1]);
    }
    root.__jfg = true;

    if (!d.getElementById('jfg-css')) {
      var st = d.createElement('style'); st.id = 'jfg-css'; st.textContent = CSS + '\n' + LCSS +
        '\n.jfg-izvor{display:none!important}\nbody.jfg-page #Content{background:#0A1120!important}';
      (d.head || d.documentElement).appendChild(st);
    }
    if (!d.querySelector('link[href*="family=Archivo"][href*="family=Barlow"]')) {
      var fl = d.createElement('link'); fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
      d.head.appendChild(fl);
    }

    /* ---------- 2. Mediji (REST API): alt, dimenzije, manje verzije ---------- */
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
    function media(ids) {
      var parts = [];
      for (var i = 0; i < ids.length; i += 100) parts.push(ids.slice(i, i + 100));
      var all = Promise.all(parts.map(function (p) {
        return api('media', 'include=' + p.join(',') + '&per_page=' + p.length + '&_fields=id,alt_text,media_details');
      })).then(function (rs) {
        var map = {};
        rs.forEach(function (r) { (r || []).forEach(function (m) { if (m && m.id) map[m.id] = m; }); });
        return map;
      });
      var late = new Promise(function (res, rej) { setTimeout(function () { rej(new Error('REST: isteklo vrijeme')); }, 8000); });
      return Promise.race([all, late]);
    }

    // jedna fotografija: dimenzije, verzije istog oblika (srcset), alt
    function model(src, m, albumName) {
      var md = m && m.media_details, W = md && +md.width, H = md && +md.height, set = [];
      if (W && H) {
        var r0 = W / H, sz = md.sizes || {};
        Object.keys(sz).forEach(function (k) {
          var s = sz[k];
          if (!s || !s.source_url || !s.width || !s.height || s.width < 280) return;
          if (Math.abs(s.width / s.height - r0) > 0.02 * r0) return;   // isječene verzije (kvadrati, baneri) ne
          set.push({ w: +s.width, u: s.source_url });
        });
        if (!set.some(function (s) { return s.w === W; })) set.push({ w: W, u: (sz.full && sz.full.source_url) || src.full });
        set.sort(function (a, b) { return a.w - b.w; });
        set = set.filter(function (s, i) { return !i || s.w !== set[i - 1].w; });
      }
      var alt = clean(pickLang(m && m.alt_text)) || clean(pickLang(src.alt)), missing = !alt;
      if (!alt) {
        var t = clean(pickLang(src.title));
        alt = !cameraName(t) ? t : /jahorin/i.test(albumName) ? albumName : albumName + ', Jahorina';
      }
      var mid = set.filter(function (s) { return s.w >= 700; })[0] || set[set.length - 1];
      return {
        W: W || 0, H: H || 0, r: W && H ? W / H : 1.5, alt: alt, missing: missing, full: src.full,
        srcset: set.length > 1 ? set.map(function (s) { return s.u + ' ' + s.w + 'w'; }).join(', ') : '',
        src: mid ? mid.u : src.full
      };
    }

    /* ---------- 3. prikaz ---------- */
    var list = [];
    var ADMIN = d.body.classList.contains('logged-in') || !!d.getElementById('wpadminbar');
    function render(map) {
      var used = {};
      albums.forEach(function (al, k) {
        al.name = al.title || (albums.length > 1 ? T.album + ' ' + (k + 1) : T.album);
        var s = slugify(al.name);
        while (used[s]) s += '-2';
        used[s] = 1; al.slug = s;
      });
      var total = albums.reduce(function (n, al) { return n + al.items.length; }, 0), multi = albums.length > 1, first = true;
      var intro = clean(pickLang(root.getAttribute('data-uvod') || '')) || T.intro;
      var h = '<div class="jfg-wrap"><div class="jfg-top">' +
        '<div class="jfg-eyebrow">' + total + ' ' + plural(total, T.photos) + (multi ? ' · ' + albums.length + ' ' + plural(albums.length, T.albums) : '') + '</div>' +
        '<p class="jfg-intro">' + esc(intro) + '</p></div>';
      h += '<div class="jfg-albums">';
      albums.forEach(function (al) {
        var hid = 'jfg-h-' + al.slug;
        h += '<section class="jfg-album" id="jfg-' + esc(al.slug) + '" aria-labelledby="' + hid + '">' +
          '<div class="jfg-ahead"><h2 id="' + hid + '">' + esc(al.name) + '</h2><span class="jfg-rule" aria-hidden="true"></span>' +
          '<span class="jfg-count">' + al.items.length + ' ' + plural(al.items.length, T.photos) + '</span></div><ul class="jfg-grid">';
        al.items.forEach(function (src) {
          var it = model(src, map[src.id], al.name), k = list.length, r = Math.round(it.r * 1000) / 1000;
          it.album = al.name; it.slug = al.slug;
          list.push(it);
          // širina u kojoj se sličica stvarno prikazuje (pretraživač je pomnoži gustinom ekrana i izabere verziju)
          var sizes = '(max-width:760px) ' + Math.round(r * 112) + 'px, (max-width:1100px) ' + Math.round(r * 210) + 'px, ' + Math.round(r * 260) + 'px';
          var eager = first && k < 4;
          h += '<li class="jfg-item" style="--r:' + r + ';flex-grow:' + Math.round(r * 100) + '">' +
            '<a class="jfg-link" href="' + esc(it.full) + '" data-k="' + k + '" data-elementor-open-lightbox="no">' +
            '<img src="' + esc(it.src) + '"' + (it.srcset ? ' srcset="' + esc(it.srcset) + '" sizes="' + sizes + '"' : '') +
            (it.W ? ' width="' + it.W + '" height="' + it.H + '"' : '') + ' alt="' + esc(it.alt) + '"' +
            (eager ? (k ? '' : ' fetchpriority="high"') : ' loading="lazy"') + ' decoding="async">' +
            (ADMIN && it.missing ? '<span class="jfg-warn" aria-hidden="true">' + esc(T.noAlt) + '</span>' : '') +
            '</a></li>';
        });
        first = false;
        h += '</ul></section>';
      });
      h += '</div></div>';
      root.innerHTML = h;
      list.forEach(function (it, i) { it.el = root.querySelector('.jfg-link[data-k="' + i + '"]'); });

      albums.forEach(function (al) { al.src.forEach(function (n) { n.classList.add('jfg-izvor'); }); });
      d.body.classList.add('jfg-page');
      [].forEach.call(root.querySelectorAll('.jfg-link img'), function (img) {
        if (img.complete && img.naturalWidth) loaded(img);
      });
      fit();
      layout();
    }
    // sličica se pojavi kad stigne; bez dimenzija iz Medija oblik se uzme iz same slike
    function loaded(img) {
      img.classList.add('is-ld');
      var li = img.closest('.jfg-item'), it = list[+img.parentNode.getAttribute('data-k')];
      if (it && !it.W && img.naturalWidth) {
        it.W = img.naturalWidth; it.H = img.naturalHeight; it.r = it.W / it.H;
        li.style.setProperty('--r', Math.round(it.r * 1000) / 1000); li.style.flexGrow = Math.round(it.r * 100);
        layout.w = 0; clearTimeout(loaded.t); loaded.t = setTimeout(layout, 200);
      }
    }
    // redovi: fotografije albuma podijeljene u redove tako da je svaki red pun, a visine što ujednačenije
    // (širine su u % reda, pa se računa samo kad se promijeni širina galerije; skrolovanje ništa ne pokreće)
    function rows(rs, W, h0, gap) {
      var n = rs.length, P = [0], i, j, m;
      for (i = 0; i < n; i++) P.push(P[i] + rs[i]);
      var k = Math.min(n, Math.max(1, Math.round((P[n] * h0 + gap * (n - 1)) / W))), target = P[n] / k;
      var best = [], from = [];
      for (m = 0; m <= k; m++) { best.push([]); from.push([]); for (j = 0; j <= n; j++) best[m].push(Infinity); }
      best[0][0] = 0;
      for (m = 1; m <= k; m++) for (j = m; j <= n; j++) for (i = m - 1; i < j; i++) {
        var c = best[m - 1][i] + Math.pow(P[j] - P[i] - target, 2);
        if (c < best[m][j]) { best[m][j] = c; from[m][j] = i; }
      }
      var out = [];
      for (j = n, m = k; m > 0; m--) { i = from[m][j]; out.unshift([i, j]); j = i; }
      return out;
    }
    function layout() {
      var box = root.querySelector('.jfg-albums'), W = box && box.clientWidth;
      if (!W || W === layout.w) return;
      layout.w = W;
      var cs = getComputedStyle(root), h0 = parseFloat(cs.getPropertyValue('--rh')) || 236, gap = parseFloat(cs.getPropertyValue('--gap')) || 10;
      [].forEach.call(root.querySelectorAll('.jfg-grid'), function (g) {
        var lis = [].slice.call(g.children), rs = lis.map(function (li) { return parseFloat(li.style.getPropertyValue('--r')) || 1.5; });
        rows(rs, W, h0, gap).forEach(function (row) {
          var n = row[1] - row[0], sum = 0, i;
          for (i = row[0]; i < row[1]; i++) sum += rs[i];
          var full = (W - gap * (n - 1)) / sum <= h0 * 1.6;   // premalo fotografija za pun red: ostaju u osnovnoj visini
          for (i = row[0]; i < row[1]; i++) {
            lis[i].style.flex = full ? '0 0 calc((100% - ' + gap * (n - 1) + 'px - .5px) * ' + (rs[i] / sum).toFixed(5) + ')' : '0 0 ' + (rs[i] * h0).toFixed(1) + 'px';
          }
        });
      });
    }
    root.addEventListener('load', function (e) { if (e.target.tagName === 'IMG' && e.target.closest('.jfg-link')) loaded(e.target); }, true);
    root.addEventListener('error', function (e) {
      var img = e.target;
      if (img.tagName !== 'IMG' || img.__jfgErr) return;
      img.__jfgErr = true; img.removeAttribute('srcset'); img.src = img.parentNode.getAttribute('href');   // rezerva: originalna slika
    }, true);

    root.addEventListener('click', function (e) {
      var a = e.target.closest('.jfg-link');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
      e.preventDefault(); e.stopPropagation();   // ne Elementorov/Betheme lightbox
      open(+a.getAttribute('data-k'));
    });

    /* ---------- puna širina (kontejner teme je uži od ekrana) ---------- */
    function fit() {
      var s = root.style;
      s.removeProperty('width'); s.removeProperty('max-width'); s.removeProperty('margin-left');
      var cw = d.documentElement.clientWidth, r = root.getBoundingClientRect();
      if (r.width < cw - 1) {
        s.setProperty('width', cw + 'px', 'important');
        s.setProperty('max-width', 'none', 'important');
        s.setProperty('margin-left', -r.left + 'px', 'important');
      }
      root.classList.toggle('jfg--boxed', root.getBoundingClientRect().width < cw - 24);
    }
    function refit() { clearTimeout(fit.t); fit.t = setTimeout(function () { fit(); layout(); }, 120); }
    w.addEventListener('resize', refit);
    if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);

    /* ---------- 4. pregled preko cijelog ekrana ---------- */
    var lb, fig, lo, hi, cap, cnt, alb, btnClose, btnPrev, btnNext, seq = [], cur = -1, pushed = false, closing = 0;
    var REDUCE = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function build() {
      lb = d.createElement('div');
      lb.id = 'jfg-lb'; lb.className = 'jfg-lb'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.viewer);
      lb.innerHTML =
        '<div class="jfg-lb__top"><div class="jfg-lb__info"><span class="jfg-lb__album"></span><span class="jfg-lb__count"></span></div>' +
        '<button type="button" class="jfg-lb__btn jfg-lb__close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button></div>' +
        '<div class="jfg-lb__stage"><figure class="jfg-lb__fig"><img class="jfg-lb__lo" alt="" aria-hidden="true"><img class="jfg-lb__img" alt=""></figure></div>' +
        '<div class="jfg-lb__bottom"><button type="button" class="jfg-lb__btn jfg-lb__prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
        '<p class="jfg-lb__cap" aria-live="polite"></p>' +
        '<button type="button" class="jfg-lb__btn jfg-lb__next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button></div>';
      d.body.appendChild(lb);
      fig = lb.querySelector('.jfg-lb__fig'); lo = lb.querySelector('.jfg-lb__lo'); hi = lb.querySelector('.jfg-lb__img');
      cap = lb.querySelector('.jfg-lb__cap'); cnt = lb.querySelector('.jfg-lb__count'); alb = lb.querySelector('.jfg-lb__album');
      btnClose = lb.querySelector('.jfg-lb__close'); btnPrev = lb.querySelector('.jfg-lb__prev'); btnNext = lb.querySelector('.jfg-lb__next');
      btnClose.addEventListener('click', function () { close(); });
      btnPrev.addEventListener('click', function () { go(-1); });
      btnNext.addEventListener('click', function () { go(1); });
      hi.addEventListener('load', function () {
        var it = seq[cur];
        if (it && !it.W && hi.naturalWidth) { it.W = hi.naturalWidth; it.H = hi.naturalHeight; place(); }
        if (hi.__k === cur) hi.classList.add('is-ld');
      });
      gestures();
    }
    function stage() { return lb.querySelector('.jfg-lb__stage'); }
    // okvir fotografije: što veći, a da cijela stane (bez sječenja)
    function place() {
      var it = seq[cur]; if (!it) return;
      var sg = stage(), sw = sg.clientWidth, sh = sg.clientHeight, W = it.W || 1500, H = it.H || 1000;
      var s = Math.min(sw / W, sh / H), bw = Math.max(1, Math.round(W * s)), bh = Math.max(1, Math.round(H * s));
      fig.style.width = bw + 'px'; fig.style.height = bh + 'px';
      fig.style.left = Math.round((sw - bw) / 2) + 'px'; fig.style.top = Math.round((sh - bh) / 2) + 'px';
      // telefon: najviše ~1080 px (brže), računar do ~2100 px
      var dpr = w.devicePixelRatio || 1, cap = w.innerWidth <= 760 ? 1080 : 2100;
      hi.sizes = Math.round(Math.min(bw * dpr, cap) / dpr) + 'px';
    }
    function show(k, dir) {
      var n = seq.length;
      cur = (k % n + n) % n;
      var it = seq[cur], thumb = it.el.querySelector('img');
      lo.src = (thumb && (thumb.currentSrc || thumb.src)) || it.src;
      hi.classList.remove('is-ld'); hi.__k = cur;
      place();
      if (it.srcset) hi.srcset = it.srcset; else hi.removeAttribute('srcset');
      hi.src = it.src; hi.alt = it.alt;
      if (hi.complete && hi.naturalWidth) hi.classList.add('is-ld');
      cap.textContent = it.alt;
      cnt.innerHTML = '<b>' + (cur + 1) + '</b> / ' + n;
      cnt.setAttribute('aria-label', (cur + 1) + ' ' + T.of + ' ' + n);
      alb.textContent = it.album;
      fig.style.transform = '';
      if (!REDUCE) {
        fig.classList.remove('in-r', 'in-l', 'in-o', 'is-back');
        void fig.offsetWidth;
        fig.classList.add(dir > 0 ? 'in-r' : dir < 0 ? 'in-l' : 'in-o');
      }
      [cur + 1, cur - 1].forEach(function (j) {   // susjedne fotografije unaprijed
        var p = seq[(j % n + n) % n];
        if (p && p !== it) { var im = new Image(); im.sizes = hi.sizes; if (p.srcset) im.srcset = p.srcset; im.src = p.src; }
      });
    }
    function go(dir) { if (seq.length > 1) show(cur + dir, dir); }
    function open(k) {
      if (!lb) build();
      clearTimeout(closing);
      seq = list;
      lb.classList.toggle('is-one', seq.length < 2);
      var sb = w.innerWidth - d.documentElement.clientWidth;
      d.documentElement.classList.add('jfg-lock');
      if (sb > 0) d.body.style.paddingRight = sb + 'px';
      lb.hidden = false;
      show(k, 0);
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      btnClose.focus({ preventScroll: true });
      d.addEventListener('keydown', onKey);
      w.addEventListener('resize', place);
      // dugme „nazad“ na telefonu zatvara pregled, ne napušta stranicu
      try { history.pushState({ jfg: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    }
    function close() {
      if (!lb || lb.hidden) return;
      if (pushed) {
        pushed = false;
        try { history.back(); } catch (e) {}
        closing = setTimeout(shut, 350);   // ako „nazad“ ne stigne, zatvori ipak
        return;
      }
      shut();
    }
    function shut() {
      clearTimeout(closing);
      if (!lb || lb.hidden) return;
      lb.classList.remove('is-open');
      d.removeEventListener('keydown', onKey);
      w.removeEventListener('resize', place);
      var it = seq[cur];
      setTimeout(function () {
        lb.hidden = true;
        d.documentElement.classList.remove('jfg-lock');
        d.body.style.paddingRight = '';
        if (it && it.el) {   // fokus na sličicu fotografije koja je bila otvorena
          it.el.focus({ preventScroll: true });
          var r = it.el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > w.innerHeight) it.el.scrollIntoView({ block: 'center' });
        }
      }, REDUCE ? 0 : 200);
    }
    w.addEventListener('popstate', function () { if (lb && !lb.hidden) { pushed = false; shut(); } });
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, -1); }
      else if (e.key === 'End') { e.preventDefault(); show(seq.length - 1, 1); }
      else if (e.key === 'Tab') {   // fokus ostaje u pregledu
        var f = [btnClose, btnPrev, btnNext].filter(function (b) { return b.offsetParent && getComputedStyle(b).visibility !== 'hidden'; });
        var i = f.indexOf(d.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }
    // prevlačenje: lijevo/desno = sljedeća/prethodna, dolje = zatvori; dodir van fotografije = zatvori
    function gestures() {
      var p = null;
      lb.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
        p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), dx: 0, dy: 0, axis: '', touch: e.pointerType !== 'mouse', onImg: !!e.target.closest('.jfg-lb__fig') };
        try { lb.setPointerCapture(e.pointerId); } catch (er) {}
      });
      lb.addEventListener('pointermove', function (e) {
        if (!p || e.pointerId !== p.id) return;
        p.dx = e.clientX - p.x; p.dy = e.clientY - p.y;
        if (!p.axis && Math.abs(p.dx) + Math.abs(p.dy) > 8) p.axis = Math.abs(p.dx) > Math.abs(p.dy) ? 'x' : 'y';
        if (p.axis === 'x' && seq.length > 1) fig.style.transform = 'translateX(' + p.dx + 'px)';
        else if (p.axis === 'y' && p.touch && p.dy > 0) { fig.style.transform = 'translateY(' + p.dy + 'px)'; lb.style.opacity = Math.max(.35, 1 - p.dy / 420); }
      });
      function end(e, cancel) {
        if (!p || e.pointerId !== p.id) return;
        var q = p; p = null;
        lb.style.opacity = '';
        if (cancel) { back(); return; }
        if (!q.axis) { if (!q.onImg) close(); return; }   // dodir: van fotografije zatvara
        var v = Math.abs(q.dx) / Math.max(1, Date.now() - q.t);
        if (q.axis === 'x' && seq.length > 1 && (Math.abs(q.dx) > 70 || (v > .45 && Math.abs(q.dx) > 24))) go(q.dx < 0 ? 1 : -1);
        else if (q.axis === 'y' && q.touch && q.dy > 110) close();
        else back();
      }
      function back() {
        fig.classList.remove('in-r', 'in-l', 'in-o'); fig.classList.add('is-back'); fig.style.transform = '';
        setTimeout(function () { fig.classList.remove('is-back'); }, 260);
      }
      lb.addEventListener('pointerup', function (e) { end(e, false); });
      lb.addEventListener('pointercancel', function (e) { end(e, true); });
      lb.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }

    /* ---------- start ---------- */
    var ids = [];
    albums.forEach(function (al) { al.items.forEach(function (it) { if (it.id && ids.indexOf(it.id) < 0) ids.push(it.id); }); });
    (ids.length ? media(ids) : Promise.resolve({})).catch(function (e) {
      if (w.console) console.warn('[Jahorina galerija]', e);   // bez Medija: prikaz sa onim što je na stranici
      return {};
    }).then(render);
  }
  // galerije su ispod HTML widgeta — sačekaj da ih pretraživač pročita
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', main); else main();
})(window, document);
