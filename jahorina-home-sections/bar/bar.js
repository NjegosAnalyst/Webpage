/* =====================================================================
   JAHORINA — OLIMPIJSKI BAR (početna, ispod suvenirnice) · v1 "meni na stolu"
   Tema hero-a, vijesti, ratraka i suvenirnice (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele
   širine, fotografija u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · desno u kadru stoji PRAVI MENI (korica, debljina strana, sjenka); na mišu se korica malo odškrine;
     · klik otvara meni preko cijelog ekrana i strane se LISTAJU KAO PAPIR: strana se savija dok se okreće,
       sjenka pada na stranu ispod, uz povez je tamniji pregib; prevlačenje prstom/mišem, klik na stranu,
       strelice, tastatura; ugao strane se podigne na mišu; "Uvećaj" za čitanje sitnih slova;
     · lijevo naslov, uvod i tri broja iz teksta stranice (nadmorska visina, prostor, događaji);
     · video sa YouTube-a se otvara preko ekrana tek na klik (ne usporava stranicu).

   SADRŽAJ JE IZ WORDPRESSA:
     · stranica "Olimpijski bar" (slug olimpijski-bar): naslov = naslov stranice, uvod = prva rečenica prvog pasusa,
       brojevi se čitaju iz teksta (1.879 metara, 700 m², više od 40 događaja), video = prvi YouTube link/ugradnja
       na stranici, dugme "Više o baru" = link stranice;
     · meni = slike u Medijima sa imenom meni-bar-01, meni-bar-02 … (redni broj = strana; za isti broj vrijedi
       najnovija). Kad se cijene promijene, u Medije se dodaju nove slike sa istim imenima.
     Dok WordPress ne odgovori (ili ako nema tih slika), stoje ugrađeni tekst (isti kao na stranici 8. 10. 2026)
     i ugrađeni meni (12 strana iz slike/meni/ pored ovog fajla). Prijavljeni admin vidi tehnički razlog.

   Ugradnja: Elementor HTML widget sa <div id="jb-bar"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jb-bar"> (sva su neobavezna):
     data-stranica="olimpijski-bar"   (slug WordPress stranice)
     data-video="https://youtu.be/…"   (zamjena za video sa stranice)
     data-meni="url1, url2, …"         (zamjena za meni: slike strana redom)
   GA: otvaranje menija → bar_meni, otvaranje videa → bar_video, klik na "Više o baru" → bar_klik (cilj: stranica).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jb-bar');
  if (!root || root.__jb) return;
  root.__jb = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'olimpijski-bar').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var YT_FIXED = ytId(opt('video', ''));
  var YT = YT_FIXED || '7qo0-fAx5CI';   // "Olimpijski bar OC Jahorina" (YouTube, Olimpijski centar Jahorina)
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ugrađeni tekst = tekst sa stranice Olimpijski bar (8. 10. 2026); EN je prevod. WordPress ga zamijeni kad odgovori.
  var T = EN ? {
    kicker: 'Food & après-ski', head: 'Olympic Bar',
    lead: 'At the top of Jahorina, 1,879 metres above sea level, the Olympic Bar is a favourite of skiers and lovers of good food and fun.',
    facts: [['1,879', 'm', 'above sea level'], ['700', 'm²', 'warm mountain venue'], ['40', '+', 'events a year']],
    menu: 'Browse the menu', menuS: 'Menu', video: 'Watch the video', videoS: 'Video', more: 'More about the Olympic Bar',
    book: 'Menu', pages: 'pages', bookAria: 'Open the menu', reader: 'Olympic Bar menu', readerT: 'Olympic Bar', readerS: 'Menu',
    prev: 'Previous page', next: 'Next page', close: 'Close', zoom: 'Zoom in', unzoom: 'Zoom out', page: 'Page', of: 'of',
    hint: 'Click or drag the page to turn it', vid: 'Video: Olympic Bar', why: 'WordPress', whyTail: 'showing built-in content'
  } : {
    kicker: 'Hrana i après-ski', head: 'Olimpijski bar',
    lead: 'Na vrhu Jahorine, na 1.879 metara nadmorske visine, nalazi se Olimpijski bar, omiljeno mjesto skijaša i ljubitelja dobre hrane i zabave.',
    facts: [['1.879', 'm', 'nadmorske visine'], ['700', 'm²', 'toplog ambijenta'], ['40', '+', 'događaja godišnje']],
    menu: 'Prelistaj meni', menuS: 'Meni', video: 'Pogledaj video', videoS: 'Video', more: 'Više o Olimpijskom baru',
    book: 'Meni', pages: 'strana', bookAria: 'Otvori meni', reader: 'Meni Olimpijskog bara', readerT: 'Olimpijski bar', readerS: 'Cjenovnik',
    prev: 'Prethodna strana', next: 'Sljedeća strana', close: 'Zatvori', zoom: 'Uvećaj', unzoom: 'Smanji', page: 'Strana', of: 'od',
    hint: 'Kliknite ili prevucite stranu', vid: 'Video: Olimpijski bar', why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj'
  };

  // meni: strane redom (ugrađene ili iz data-meni); WordPress ih zamijeni ako u Medijima ima meni-bar-01, -02 …
  var RATIO = 1742 / 1240;   // visina / širina strane
  var MSRC = HERE + 'slike/meni/';
  var FIXED_MENU = !!opt('meni', '');
  var MENU = FIXED_MENU
    ? opt('meni', '').split(',').map(function (x) { return x.trim(); }).filter(Boolean)
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (k) { return MSRC + 'meni-bar-' + (k < 10 ? '0' : '') + k + '.webp'; });
  var SMALL = FIXED_MENU ? MENU.slice(0, 2) : [MSRC + 'mala-01.webp', MSRC + 'mala-02.webp'];   // korica i prva strana za meni u kadru

  // fotografija kadra (topli kadar iz bara) i fotografija enterijera iza otvorenog menija
  var PHOTO = { full: HERE + 'slike/bar-glavna.webp', md: HERE + 'slike/bar-glavna-1000.webp', w: 2000,
    alt: EN ? 'Mushroom risotto and a glass of white wine on the Olympic Bar placemat "Hospitality is part of skiing"'
            : 'Rižoto sa pečurkama i čaša bijelog vina na podmetaču Olimpijskog bara „Hospitality is part of skiing“' };
  var ROOM = HERE + 'slike/bar-enterijer.webp';

  /* ---------- izgled (sve je pod #jb-bar; tokeni iz hero-a, vijesti, ratraka i suvenirnice) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jb--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible,#R button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je suvenirnica odmah iznad (.jb--join), ona već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jb-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jb--join .jb-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jb-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jb-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; fotografija je pozadina cijelog kadra */
    '#R .jb-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(620px,46vw,820px);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jb-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak topli odsjaj na gornjoj ivici, iznad lampe nad menijem */
    '#R .jb-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 52%,rgba(255,214,170,.42) 78%,transparent 98%)}',
    '#R .jb-bgs{position:absolute;inset:0;z-index:-1;overflow:hidden}',
    /* fotografija: blaža noćna obrada nego u vijestima, da topla svjetlost bara ostane (kao zalazak u ratraku) */
    '#R .jb-bg{--bl:max(8%,calc(var(--side) - 140px));position:absolute;top:0;left:var(--bl);width:calc(100% - var(--bl));height:100%;object-fit:cover;object-position:40% 62%;filter:saturate(.9) brightness(.74) contrast(1.08);',
    '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 22%);mask-image:linear-gradient(90deg,transparent 0,#000 22%)}',
    '#R .jb-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.34}',
    '#R .jb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.93) 0,rgba(6,11,22,.84) calc(var(--side) + 360px),rgba(6,11,22,.55) calc(var(--side) + 560px),rgba(6,11,22,.14) calc(var(--side) + 760px),rgba(6,11,22,0) calc(var(--side) + 900px)),',
    'linear-gradient(0deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 30%),linear-gradient(180deg,rgba(6,18,42,.32) 0%,rgba(6,18,42,0) 22%),',
    'radial-gradient(130% 100% at 62% 50%,transparent 56%,rgba(4,8,18,.55) 100%)}',
    /* toplo svjetlo lampe iznad menija (jedini topli izvor; ostalo je noćna obrada) */
    '#R .jb-light{position:absolute;inset:0;pointer-events:none;background:radial-gradient(30% 54% at var(--lx,80%) 0%,rgba(255,214,170,.17),rgba(255,190,140,.05) 55%,transparent 80%)}',

    /* tekst lijevo */
    '#R .jb-body{position:relative;z-index:2;width:min(calc(var(--side) + 520px),52%);padding:clamp(56px,6vw,96px) 0 clamp(56px,6vw,96px) var(--side)}',
    '#R .jb-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-bottom:24px}',
    '#R .jb-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(46px,5vw,78px);font-weight:800;line-height:.93;letter-spacing:-.025em}',
    '#R h2.jb-long{font-size:clamp(36px,3.8vw,58px)}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jb-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important;',
    'filter:drop-shadow(0 0 8px rgba(0,185,242,.35)) drop-shadow(0 6px 30px rgba(0,0,0,.45))}}',
    '#R .jb-lead{margin-top:26px;font-size:clamp(15.5px,1.2vw,17.5px);line-height:1.62;color:var(--text-2)!important;max-width:42ch;text-wrap:pretty}',
    /* tri broja iz teksta stranice: tipografski red bez pločica, jedinica cyan, tanke uspravne crte između */
    '#R .jb-facts{display:flex;align-items:flex-start;margin-top:30px!important}',
    '#R .jb-facts li{padding:2px 24px!important;border-left:1px solid rgba(255,255,255,.14)}',
    '#R .jb-facts li:first-child{padding-left:0!important;border-left:0}',
    '#R .jb-facts b{display:flex;align-items:baseline;gap:3px;font:700 27px/1 var(--fd);letter-spacing:-.015em;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '#R .jb-facts b i{font:600 14px/1 var(--fd);font-style:normal;letter-spacing:0;color:var(--accent-2)}',
    '#R .jb-facts small{display:block;margin-top:9px;font:600 9.5px/1.25 var(--fd);letter-spacing:1.3px;text-transform:uppercase;color:var(--text-3);white-space:nowrap}',
    /* dugmad kao u ratraku: bijelo glavno + stakleno sporedno, iste širine i visine */
    '#R .jb-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:34px;width:min(100%,440px)}',
    '#R .jb-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 20px!important;border-radius:40px!important;cursor:pointer;',
    'white-space:nowrap;font:600 13.5px/1 var(--fb)!important;letter-spacing:.2px!important;font-variant-numeric:tabular-nums}',
    '#R .jb-btn svg{width:15px;height:15px}',
    '#R .jb-s{display:none}',
    '#R .jb-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6)!important;transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)!important}',
    '#R .jb-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jb-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)!important}',
    '#R .jb-btn--solid:hover::after{animation:jbShine 1.6s ease-in-out}',
    '@keyframes jbShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jb-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff!important}',
    '#R .jb-btn--ghost{color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:color .2s,box-shadow .25s}',
    '#R .jb-btn--ghost svg{color:var(--accent)}',
    '#R .jb-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)!important}',
    '#R .jb-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)!important}',
    /* tihi link stranice ispod dugmadi */
    '#R .jb-more{display:inline-flex;align-items:center;gap:8px;margin-top:20px;font:500 13.5px/1.3 var(--fb);color:var(--text-3)!important;transition:color .2s}',
    '#R .jb-more svg{width:14px;height:14px;transition:transform .25s ease}',
    '#R .jb-more:hover{color:var(--accent)!important}',
    '#R .jb-more:hover svg{transform:translateX(3px)}',
    '#R .jb-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* MENI U KADRU: pravi meni (korica, strane ispod, debljina, sjenka), blago okrenut prema tekstu.
       Na mišu/fokusu se korica odškrine i otkrije prvu stranu; klik otvara meni preko cijelog ekrana */
    '#R .jb-book{all:unset;position:absolute!important;z-index:3;box-sizing:border-box!important;display:block!important;right:calc(var(--side) + clamp(0px,3vw,64px));top:50%;height:clamp(320px,30vw,480px);aspect-ratio:1240/1742;',
    'margin-top:calc(clamp(320px,30vw,480px) / -2 - 16px)!important;cursor:pointer;perspective:1700px;-webkit-tap-highlight-color:transparent}',
    '#R .jb-book:focus-visible{outline:none!important}',
    '#R .jb-book:focus-visible .jb-cap{color:var(--accent)}',
    '#R .jb-bk-in{position:absolute;inset:0;transform-style:preserve-3d}',
    '#R .jb-bk{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(-20deg) rotateX(5deg) rotateZ(-1.2deg);transition:transform .9s cubic-bezier(.2,.7,.2,1)}',
    '#R .jb-book:hover .jb-bk,#R .jb-book:focus-visible .jb-bk{transform:rotateY(-13deg) rotateX(3deg) rotateZ(-.6deg) translateZ(18px)}',
    /* blok strana: prva strana menija, sjenka korice pada na nju dok se odškrine */
    '#R .jb-bk-pages{position:absolute;inset:0;border-radius:1px 4px 4px 1px;background:#151515 center/cover no-repeat;',
    'box-shadow:0 34px 50px -22px rgba(0,0,0,.85),22px 30px 70px rgba(0,0,0,.42)}',
    '#R .jb-bk-pages::after{content:"";position:absolute;inset:0;border-radius:inherit;opacity:.9;transition:opacity .9s ease;',
    'background:linear-gradient(90deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.55) 22%,rgba(0,0,0,.2) 48%,rgba(0,0,0,.05) 70%)}',
    '#R .jb-book:hover .jb-bk-pages::after,#R .jb-book:focus-visible .jb-bk-pages::after{opacity:.55}',
    /* debljina menija: rubovi strana sa desne strane (svijetli papir, tanke linije) */
    '#R .jb-bk-edge{position:absolute;top:.6%;bottom:.6%;left:100%;width:9px;transform-origin:0 50%;transform:rotateY(90deg);',
    'background:repeating-linear-gradient(90deg,#d8d2c6 0 1px,#a29b8f 1px 2px);box-shadow:inset 0 0 6px rgba(0,0,0,.45)}',
    '#R .jb-bk-cover{position:absolute;inset:0;transform-origin:0 50%;transform-style:preserve-3d;transform:translateZ(1.5px);transition:transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R .jb-book:hover .jb-bk-cover,#R .jb-book:focus-visible .jb-bk-cover{transform:translateZ(1.5px) rotateY(-30deg)}',
    '#R .jb-bk-cover i{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;border-radius:1px 4px 4px 1px}',
    '#R .jb-bk-f{background:#111 center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}',
    /* pregib uz povez i blagi sjaj laminirane korice */
    '#R .jb-bk-f::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,rgba(255,255,255,.1) 0,rgba(0,0,0,.45) 1.6%,rgba(255,255,255,.08) 3.2%,rgba(0,0,0,.12) 5%,transparent 8%)}',
    '#R .jb-bk-f::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(112deg,transparent 30%,rgba(255,255,255,.07) 44%,rgba(255,255,255,.015) 54%,transparent 64%);',
    'background-size:240% 100%;background-position:100% 0;transition:background-position 1.2s cubic-bezier(.2,.7,.2,1)}',
    '#R .jb-book:hover .jb-bk-f::after{background-position:0 0}',
    '#R .jb-bk-b{transform:rotateY(180deg);background:linear-gradient(90deg,#1b1b1b,#101010)}',
    /* natpis ispod menija */
    '#R .jb-cap{position:absolute;left:0;right:0;top:calc(100% + 34px);display:flex;align-items:center;justify-content:center;gap:10px;font:600 10.5px/1 var(--fd);letter-spacing:2.6px;text-transform:uppercase;',
    'color:rgba(255,255,255,.62);text-shadow:0 1px 10px rgba(0,0,0,.7);white-space:nowrap;transition:color .25s}',
    '#R .jb-cap svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jb-cap em{font-style:normal;color:var(--text-3);font-variant-numeric:tabular-nums}',
    '#R .jb-book:hover .jb-cap{color:#fff}',

    /* ulazak (jednom): klase jb-anim/jb-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jb-anim .jb-frame{opacity:0;transform:translateY(28px)}',
    '#R.jb-anim.jb-on .jb-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jb-anim .jb-bg{opacity:0;filter:saturate(.9) brightness(.3) contrast(1.08) blur(12px)}',
    '#R.jb-anim.jb-on .jb-bg{opacity:1;filter:saturate(.9) brightness(.74) contrast(1.08) blur(0px);transition:opacity 1.2s ease .15s,filter 1.6s cubic-bezier(.2,.7,.2,1) .15s}',
    '#R.jb-anim .jb-light{opacity:0}',
    '#R.jb-anim.jb-on .jb-light{opacity:1;transition:opacity 1.8s ease .8s}',
    '#R.jb-anim .jb-up{opacity:0;transform:translateY(20px)}',
    '#R.jb-anim.jb-on .jb-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jb-anim .jb-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jb-anim.jb-on .jb-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* meni se spusti na mjesto (kao da je položen), pa se korica jednom odškrine */
    '#R.jb-anim .jb-bk-in{opacity:0;transform:translate3d(0,-26px,60px) rotateZ(-4deg)}',
    '#R.jb-anim.jb-on .jb-bk-in{opacity:1;transform:none;transition:opacity .9s ease .55s,transform 1.3s cubic-bezier(.2,.7,.2,1) .55s}',
    '#R.jb-anim .jb-cap{opacity:0}',
    '#R.jb-anim.jb-on .jb-cap{opacity:1;transition:opacity .8s ease 1.3s,color .25s}',
    '#R.jb-peek .jb-bk-cover{animation:jbPeek 1.9s cubic-bezier(.4,0,.2,1)}',
    '#R.jb-peek .jb-bk-pages::after{animation:jbPeekSh 1.9s cubic-bezier(.4,0,.2,1)}',
    '@keyframes jbPeek{0%,100%{transform:translateZ(1.5px)}45%,55%{transform:translateZ(1.5px) rotateY(-34deg)}}',
    '@keyframes jbPeekSh{0%,100%{opacity:.9}45%,55%{opacity:.5}}',

    /* manji laptop */
    '@media (max-width:1180px){#R .jb-body{width:min(calc(var(--side) + 480px),54%)}#R .jb-facts li{padding:2px 18px!important}#R .jb-facts b{font-size:24px}}',
    /* tablet i telefon: fotografija gore (utapa se nadolje) sa menijem na njoj, tekst ispod */
    '@media (max-width:980px){',
    '#R .jb-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jb-bgs{position:relative;inset:auto;height:min(66vw,560px);-webkit-mask-image:linear-gradient(180deg,#000 64%,transparent 100%);mask-image:linear-gradient(180deg,#000 64%,transparent 100%)}',
    '#R .jb-bg{left:0;width:100%;object-position:34% 62%;-webkit-mask-image:none;mask-image:none}',
    '#R .jb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 40%),linear-gradient(180deg,rgba(6,18,42,.36) 0%,rgba(6,18,42,0) 26%),linear-gradient(270deg,rgba(6,11,22,.45) 0%,rgba(6,11,22,0) 45%)}',
    '#R .jb-light{--lx:76%}',
    '#R .jb-book{top:clamp(28px,5vw,52px);right:clamp(30px,7vw,72px);height:min(44vw,380px);margin-top:0!important}',
    '#R .jb-cap{top:calc(100% + 20px)}',
    '#R .jb-body{width:auto;padding:clamp(18px,3vw,34px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.6vw,66px)}',
    '#R .jb-lead{max-width:56ch}}',
    '@media (max-width:760px){',
    '#R .jb-frame{border-radius:24px}',
    '#R .jb-bgs{height:min(112vw,500px)}',
    '#R .jb-bg{object-position:28% 64%}',
    '#R .jb-book{top:clamp(22px,6vw,34px);right:24px;height:min(60vw,290px)}',
    '#R .jb-bk{transform:rotateY(-16deg) rotateX(4deg) rotateZ(-1deg)}',
    '#R .jb-cap{top:calc(100% + 16px);font-size:9.5px;letter-spacing:2px;gap:8px}',
    '#R .jb-body{padding:8px 22px 30px}',
    '#R .jb-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jb-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.6vw,54px)}',
    '#R h2.jb-long{font-size:clamp(30px,8.6vw,42px)}',
    '#R .jb-lead{margin-top:18px}',
    '#R .jb-facts{margin-top:24px!important;justify-content:space-between}',
    '#R .jb-facts li{padding:2px 0 2px 14px!important;flex:1 1 0;min-width:0}',
    '#R .jb-facts b{font-size:21px}',
    '#R .jb-facts b i{font-size:12px}',
    '#R .jb-facts small{font-size:8.5px;letter-spacing:.8px;white-space:normal}',
    '#R .jb-acts{grid-template-columns:1fr 1fr;gap:8px;margin-top:26px;width:100%}',
    '#R .jb-btn{height:42px;padding:0 12px!important;font-size:13px!important}',
    '#R .jb-l{display:none}',
    '#R .jb-s{display:inline}',
    '#R .jb-more{margin-top:18px;font-size:13px}}',
    '@media (max-width:300px){#R .jb-acts{grid-template-columns:1fr}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

    /* ---------- MENI PREKO CIJELOG EKRANA: strane se listaju kao papir ---------- */
    "#L{position:fixed;inset:0;z-index:2147483000;display:none;color:#fff;font:400 16px/1.5 'Barlow',system-ui,sans-serif;color-scheme:dark;background:#060A13;",
    'opacity:0;transition:opacity .35s ease;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain}',
    '#L.is-shown{display:block}',
    '#L.is-open{opacity:1}',
    '#L *{box-sizing:border-box}',
    /* iza menija je enterijer bara, zamućen i taman (kao da meni čitate za stolom) */
    '#L .jb-r-bg{position:absolute;inset:-60px;background:#0A0F1A center/cover no-repeat;filter:blur(24px) saturate(.9) brightness(.52);transform:scale(1.04)}',
    '#L .jb-r-veil{position:absolute;inset:0;background:radial-gradient(70% 62% at 50% 46%,rgba(10,14,24,.15),rgba(4,7,14,.8)),linear-gradient(180deg,rgba(4,7,14,.55),transparent 16%,transparent 80%,rgba(4,7,14,.75))}',
    '#L .jb-r-top{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(12px,2vw,22px) clamp(14px,2.4vw,30px)}',
    "#L .jb-r-title{display:flex;align-items:center;gap:12px;min-width:0;font:600 11px/1.2 'Archivo',system-ui,sans-serif;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.8)}",
    '#L .jb-r-title::before{content:"";width:28px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,#00B9F2,#fff,#00B9F2);box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#L .jb-r-title em{font-style:normal;color:rgba(255,255,255,.5)}',
    '#L .jb-r-tools{display:flex;gap:10px;flex-shrink:0}',
    '#L button{all:unset;box-sizing:border-box!important;display:grid!important;place-items:center;width:46px!important;height:46px!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;cursor:pointer;',
    'color:rgba(255,255,255,.84)!important;background:#131D31!important;box-shadow:3px 3px 7px rgba(0,0,0,.45),-2px -2px 6px rgba(70,96,142,.1)!important;transition:color .2s,opacity .2s}',
    '#L button svg{display:block;width:19px;height:19px}',
    '#L button:hover{color:#00B9F2!important}',
    '#L button:active,#L button[aria-pressed="true"]{color:#00B9F2!important;box-shadow:inset 2px 2px 5px rgba(0,0,0,.55),inset -2px -2px 4px rgba(70,96,142,.1)!important}',
    '#L button:focus-visible{outline:2px solid #00B9F2!important;outline-offset:3px!important}',
    '#L button:disabled{opacity:.32;cursor:default}',
    "#L .jb-r-zbtn{width:auto!important;gap:8px;grid-auto-flow:column;padding:0 18px 0 15px!important;border-radius:40px!important;font:600 13px/1 'Barlow',system-ui,sans-serif!important;letter-spacing:.2px}",
    '#L .jb-r-zbtn svg{width:17px;height:17px;color:#00B9F2}',
    '@media (max-width:760px){#L .jb-r-zbtn{width:42px!important;padding:0!important;border-radius:50%!important}#L .jb-r-zbtn span{display:none}}',
    /* pozornica i knjiga */
    '#L .jb-r-stage{position:absolute;left:0;right:0;top:var(--top,76px);bottom:var(--bot,92px);display:grid;place-items:center;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}',
    '#L .jb-r-fly{position:relative;transform-origin:50% 50%}',
    '#L .jb-r-book{position:relative;perspective:2600px;transform-style:preserve-3d;transition:transform .75s cubic-bezier(.3,.7,.2,1);cursor:grab}',
    '#L .jb-r-stage.is-drag .jb-r-book{cursor:grabbing}',
    /* podloga ispod strana: sjenka knjige i rubovi preostalih strana */
    '#L .jb-r-under{position:absolute;top:0;height:100%;background:#0f0f0f;display:none;box-shadow:0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#L .jb-r-under--r{left:50%;width:50%;border-radius:0 4px 4px 0;box-shadow:1px 1px 0 rgba(214,206,192,.5),2px 2px 0 #2b2926,3px 2px 0 rgba(200,192,178,.38),4px 3px 0 #23211f,0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#L .jb-r-under--l{left:0;width:50%;border-radius:4px 0 0 4px;box-shadow:-1px 1px 0 rgba(214,206,192,.5),-2px 2px 0 #2b2926,-3px 2px 0 rgba(200,192,178,.38),-4px 3px 0 #23211f,0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#L .is-single .jb-r-under--r{left:0;width:100%}',
    '#L .jb-r-under.is-on{display:block}',
    /* list (dvije strane jednog papira): savija se u dva dijela da izgleda kao papir, ne kao karton */
    '#L .jb-leaf{position:absolute;top:0;left:50%;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d;--s:0}',
    '#L .is-single .jb-leaf{left:0;width:100%}',
    '#L .jb-leaf.is-off{visibility:hidden}',
    '#L .jb-seg{position:absolute;top:0;left:0;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d}',
    '#L .jb-seg .jb-seg{left:calc(100% - .5px);width:calc(100% + .5px)}',
    '#L .jb-face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;background-color:#141414;background-repeat:no-repeat;background-size:200% 100%;overflow:hidden}',
    '#L .jb-face[data-h="0"]{background-position:0 0}',
    '#L .jb-face[data-h="1"]{background-position:100% 0}',
    '#L .jb-face--b{transform:rotateY(180deg)}',
    '#L .jb-face--blank{background-image:linear-gradient(90deg,#161616,#0e0e0e)!important;background-size:100% 100%!important}',
    '#L .jb-seg--out > .jb-face--f{border-radius:0 3px 3px 0}',
    '#L .jb-seg--out > .jb-face--b{border-radius:3px 0 0 3px}',
    /* pregib uz povez (stalno) */
    '#L .jb-spread .jb-seg--in > .jb-face--f::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.5) 0,rgba(0,0,0,.18) 5%,rgba(255,255,255,.035) 9%,transparent 16%)}',
    '#L .jb-spread .jb-seg--in > .jb-face--b::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(270deg,rgba(0,0,0,.5) 0,rgba(0,0,0,.18) 5%,rgba(255,255,255,.035) 9%,transparent 16%)}',
    '#L .is-single .jb-seg--in > .jb-face--f::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.35) 0,transparent 5%)}',
    /* svjetlo i sjenka na strani dok se okreće (jačina --s raste do sredine okreta) */
    '#L .jb-face::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--s)}',
    '#L .jb-seg--in > .jb-face--f::after{background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(0,0,0,.08) 70%,rgba(255,255,255,.06))}',
    '#L .jb-seg--out > .jb-face--f::after{background:linear-gradient(90deg,rgba(255,255,255,.1),rgba(0,0,0,.12) 45%,rgba(0,0,0,.42))}',
    '#L .jb-seg--in > .jb-face--b::after{background:linear-gradient(270deg,rgba(0,0,0,.5),rgba(0,0,0,.08) 70%,rgba(255,255,255,.06))}',
    '#L .jb-seg--out > .jb-face--b::after{background:linear-gradient(270deg,rgba(255,255,255,.1),rgba(0,0,0,.12) 45%,rgba(0,0,0,.42))}',
    /* sjenka koju strana u okretu baca na strane ispod */
    '#L .jb-cast{position:absolute;top:0;height:100%;width:50%;pointer-events:none;opacity:0;z-index:50}',
    '#L .jb-cast--r{left:50%;background:linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.25) 40%,rgba(0,0,0,0) 85%)}',
    '#L .jb-cast--l{left:0;background:linear-gradient(270deg,rgba(0,0,0,.62),rgba(0,0,0,.25) 40%,rgba(0,0,0,0) 85%)}',
    '#L .is-single .jb-cast--r{left:0;width:100%}',
    '#L .is-single .jb-cast--l{display:none}',
    /* ugao strane se podigne na mišu (poziv na listanje) */
    '#L .jb-ear{position:absolute;right:0;bottom:0;width:0;height:0;pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;transition:width .3s cubic-bezier(.2,.7,.2,1),height .3s cubic-bezier(.2,.7,.2,1);',
    'background:linear-gradient(315deg,transparent 50%,#3a3a3a 50%,#232323 62%,#151515 100%);filter:drop-shadow(-5px -5px 7px rgba(0,0,0,.55))}',
    '#L .jb-seg--out > .jb-face--f{transition:clip-path .3s cubic-bezier(.2,.7,.2,1);clip-path:polygon(0 0,100% 0,100% 100%,100% 100%,0 100%)}',
    '#L .jb-r-stage.can-next:not(.is-drag):not(.is-anim) .jb-r-book.is-hot .jb-leaf.is-top .jb-seg--out > .jb-face--f,#L .jb-r-stage.jb-hint .jb-leaf.is-top .jb-seg--out > .jb-face--f{clip-path:polygon(0 0,100% 0,100% calc(100% - var(--ear)),calc(100% - var(--ear)) 100%,0 100%)}',
    '#L .jb-r-stage.can-next:not(.is-drag):not(.is-anim) .jb-r-book.is-hot .jb-leaf.is-top .jb-ear,#L .jb-r-stage.jb-hint .jb-leaf.is-top .jb-ear{width:var(--ear);height:var(--ear)}',
    '#L .jb-r-stage{--ear:clamp(30px,4vw,46px)}',
    /* traka dolje: strelice i broj strane sa tankom linijom napretka */
    '#L .jb-r-bar{position:absolute;left:50%;bottom:clamp(14px,2.4vh,26px);z-index:6;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:5px;border-radius:40px;',
    'background:rgba(16,25,42,.6);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.14),inset 0 0 0 1px rgba(255,255,255,.07)}',
    '#L .jb-r-bar button{width:42px!important;height:42px!important;background:rgba(19,29,49,.9)!important}',
    "#L .jb-r-ind{position:relative;min-width:132px;padding:0 10px;text-align:center;font:600 13px/1 'Archivo',system-ui,sans-serif;letter-spacing:1px;font-variant-numeric:tabular-nums;color:#fff}",
    '#L .jb-r-ind em{font-style:normal;color:rgba(255,255,255,.46)}',
    '#L .jb-r-ind i{position:absolute;left:18px;right:18px;bottom:-11px;height:2px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden}',
    '#L .jb-r-ind i s{position:absolute;inset:0;background:#00B9F2;box-shadow:0 0 8px rgba(0,185,242,.8);transform-origin:left center;transform:scaleX(var(--pr,0));transition:transform .5s cubic-bezier(.2,.7,.2,1)}',
    "#L .jb-r-hint{position:absolute;left:50%;top:calc(var(--top,76px) / 2);z-index:5;transform:translate(-50%,-50%);white-space:nowrap;text-align:center;font:500 12.5px/1.3 'Barlow',system-ui,sans-serif;color:rgba(255,255,255,.55);pointer-events:none;transition:opacity .6s ease}",
    '#L .jb-r-hint.is-gone{opacity:0}',
    /* uvećanje: vidljive strane u punoj veličini, pomjeranje prstom/točkićem (i štipanje na telefonu) */
    '#L .jb-r-zoom{position:absolute;inset:0;z-index:5;display:none;overflow:auto;padding:84px 16px 40px;background:rgba(5,8,15,.9);-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom;overscroll-behavior:contain}',
    '#L.is-zoom .jb-r-zoom{display:block}',
    '#L.is-zoom .jb-r-bar,#L.is-zoom .jb-r-hint{display:none}',
    '#L .jb-r-zoom img{display:block;width:min(1240px,100%);height:auto;margin:0 auto 18px;border-radius:4px;box-shadow:0 30px 60px -30px rgba(0,0,0,.9);user-select:none}',
    '@media (max-width:760px){#L .jb-r-zoom{padding:72px 0 28px}#L .jb-r-zoom img{width:230%;max-width:none;margin:0 0 14px}}',
    '@media (max-width:980px){#L .jb-r-hint{display:none}}',
    '@media (max-width:760px){#L .jb-r-title{letter-spacing:2.4px;font-size:10px;gap:9px}#L .jb-r-title::before{width:18px}#L .jb-r-title em{display:none}#L button{width:42px!important;height:42px!important}}',
    '@media (prefers-reduced-motion:reduce){#L,#L *{transition:none!important;animation:none!important}}',

    /* ---------- VIDEO PREKO CIJELOG EKRANA (YouTube se učitava tek na klik) ---------- */
    '#V{position:fixed;inset:0;z-index:2147483000;display:none;place-items:center;padding:clamp(16px,4vw,56px);background:rgba(6,11,22,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;transition:opacity .3s ease;color-scheme:dark}',
    '#V.is-shown{display:grid}',
    '#V.is-open{opacity:1}',
    '#V *{box-sizing:border-box}',
    '#V .jb-v-box{position:relative;width:min(1200px,100%,calc((100vh - 140px) * 16 / 9));aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#000;box-shadow:0 40px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06);transform:scale(.97);transition:transform .35s cubic-bezier(.2,.7,.2,1)}',
    '#V.is-open .jb-v-box{transform:none}',
    '#V iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '#V button{all:unset;position:absolute!important;top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px);box-sizing:border-box!important;width:48px!important;height:48px!important;border-radius:50%!important;display:grid!important;place-items:center;cursor:pointer;',
    'color:rgba(255,255,255,.82)!important;background:#131D31!important;box-shadow:3px 3px 7px rgba(0,0,0,.45),-2px -2px 6px rgba(70,96,142,.1)!important;transition:color .2s}',
    '#V button svg{display:block;width:20px;height:20px}',
    '#V button:hover{color:#00B9F2!important}',
    '#V button:focus-visible{outline:2px solid #00B9F2!important;outline-offset:3px!important}',
    '@media (prefers-reduced-motion:reduce){#V,#V .jb-v-box{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jb-bar').replace(/#L/g, '#jb-meni').replace(/#V/g, '#jb-vid');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jb-css');
  if (!st) { st = d.createElement('style'); st.id = 'jb-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  function svg(p) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    book: svg('<path d="M12 6.5 C10 5 7 4.6 3.5 5 V18.5 C7 18.1 10 18.5 12 20 C14 18.5 17 18.1 20.5 18.5 V5 C17 4.6 14 5 12 6.5 Z M12 6.5 V20" ' + S + '/>'),
    play: svg('<circle cx="12" cy="12" r="8.6" ' + S + '/><path d="M10.2 8.9 L15.2 12 L10.2 15.1 Z" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    zoom: svg('<circle cx="10.5" cy="10.5" r="6" ' + S + '/><path d="M15 15 L20 20 M10.5 8 V13 M8 10.5 H13" ' + S + '/>'),
    unzoom: svg('<circle cx="10.5" cy="10.5" r="6" ' + S + '/><path d="M15 15 L20 20 M8 10.5 H13" ' + S + '/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jb-l">' + esc(l) + '</span><span class="jb-s">' + esc(s) + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function pad(k) { return (k < 10 ? '0' : '') + k; }
  function cssUrl(u) { return 'url("' + String(u).replace(/["\\\n]/g, encodeURIComponent) + '")'; }
  // YouTube ID iz linka ili ugradnje (watch?v=, youtu.be/, embed/, shorts/, nocookie) ili samo ID
  function ytId(s) {
    s = String(s || '').replace(/\\\//g, '/');
    var m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:[^"'\s<>]*?&(?:amp;)?)?v=|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s.trim()) ? s.trim() : '';
  }
  // qTranslate-XT: "[:SH]tekst[:en]text[:]" → samo jezik ove stranice (isto kao u vijestima)
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
  // naslov u redove: zadnja riječ je obris ("Olimpijski / bar"), ostatak u jedan ili dva ujednačena reda
  function titleHTML(s) {
    var wd = clean(s).replace(/[\s!.:,;]+$/, '').split(' ');
    var n = wd.length > 2 && wd[wd.length - 2].length <= 4 ? 2 : 1;
    var o = wd.slice(-n).join(' '), rest = wd.slice(0, -n), lines = [];
    if (rest.length >= 3) {
      var k = 1, best = 1e9;
      for (var i = 1; i < rest.length; i++) {
        var m = Math.max(rest.slice(0, i).join(' ').length, rest.slice(i).join(' ').length);
        if (m <= best) { best = m; k = i; }
      }
      lines = [rest.slice(0, k).join(' '), rest.slice(k).join(' ')];
    } else if (rest.length) lines = [rest.join(' ')];
    return lines.map(function (l, i) { return '<span class="jb-up" style="--d:' + (.36 + i * .1).toFixed(2) + 's">' + esc(l) + '</span>'; }).join('') +
      '<span class="jb-o jb-up" style="--d:' + (.36 + lines.length * .1).toFixed(2) + 's">' + esc(o) + '</span>';
  }
  // uvod: prva rečenica pasusa (i druga, ako je prva vrlo kratka); tačka u broju (1.879) ne prekida rečenicu
  function leadOf(p) {
    var ss = clean(p).match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]+|$)/g) || [p], out = clean(ss[0]);
    if (out.length < 70 && ss[1]) out += ' ' + clean(ss[1]);
    return clip(out, 260);
  }
  function factsHTML(fs) {
    return fs.map(function (f) { return '<li><b>' + esc(f[0]) + '<i>' + esc(f[1]) + '</i></b><small>' + esc(f[2]) + '</small></li>'; }).join('');
  }

  /* ---------- crtanje ---------- */
  root.innerHTML =
    '<section class="jb-wrap" aria-labelledby="jb-h"><div class="jb-frame">' +
      '<div class="jb-bgs"><img class="jb-bg" src="' + esc(PHOTO.full) + '" srcset="' + esc(PHOTO.md) + ' 1000w, ' + esc(PHOTO.full) + ' ' + PHOTO.w + 'w" sizes="100vw" alt="' + esc(PHOTO.alt) + '" decoding="async" loading="lazy">' +
        '<span class="jb-tint"></span><span class="jb-scrim"></span><span class="jb-light"></span></div>' +
      '<button type="button" class="jb-book" aria-haspopup="dialog">' +
        '<span class="jb-bk-in"><span class="jb-bk">' +
          '<span class="jb-bk-pages"></span><span class="jb-bk-edge"></span>' +
          '<span class="jb-bk-cover"><i class="jb-bk-f"></i><i class="jb-bk-b"></i></span>' +
        '</span></span>' +
        '<span class="jb-cap">' + ICON.book + esc(T.book) + ' <em></em></span>' +
      '</button>' +
      '<div class="jb-body">' +
        '<div class="jb-kicker jb-up" style="--d:.26s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jb-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jb-lead jb-up" style="--d:.72s">' + esc(T.lead) + '</p>' +
        '<ul class="jb-facts jb-up" style="--d:.82s">' + factsHTML(T.facts) + '</ul>' +
        '<div class="jb-acts jb-up" style="--d:.94s">' +
          '<button type="button" class="jb-btn jb-btn--solid" data-jb="meni" aria-haspopup="dialog">' + ICON.book + lbl(T.menu, T.menuS) + '</button>' +
          '<button type="button" class="jb-btn jb-btn--ghost" data-jb="video" aria-haspopup="dialog">' + ICON.play + lbl(T.video, T.videoS) + '</button>' +
        '</div>' +
        '<a class="jb-more jb-up" style="--d:1.02s" href="' + esc(PAGE) + '" data-jb="stranica">' + esc(T.more) + ICON.arrow + '</a>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function setBook() {
    q('.jb-bk-f').style.backgroundImage = cssUrl(SMALL[0]);
    q('.jb-bk-pages').style.backgroundImage = cssUrl(SMALL[1] || SMALL[0]);
    q('.jb-cap em').textContent = '· ' + MENU.length + ' ' + T.pages;
    q('.jb-book').setAttribute('aria-label', T.bookAria + ' (' + MENU.length + ' ' + T.pages + ')');
  }
  setBook();

  // blok uvijek ide preko cijele širine ekrana, i kad je kontejner teme/Elementora uži (isto kao ostali blokovi)
  function fit() {
    var st = root.style;
    st.removeProperty('width'); st.removeProperty('max-width'); st.removeProperty('margin-left');
    var cw = d.documentElement.clientWidth, r = root.getBoundingClientRect();
    if (r.width < cw - 1) {
      st.setProperty('width', cw + 'px', 'important');
      st.setProperty('max-width', 'none', 'important');
      st.setProperty('margin-left', -root.getBoundingClientRect().left + 'px', 'important');
    }
    var boxed = root.getBoundingClientRect().width < cw - 24;
    root.classList.toggle('jb--boxed', boxed);
    // Elementor kontejner oko bloka ima svoj padding (podrazumijevano 10px) na bijeloj pozadini → bijela traka; kad je blok
    // jedini widget u njemu, blok prekrije taj padding
    var sh = !boxed && shell(), up = 0, dn = 0;
    if (sh) {
      var a = sh.getBoundingClientRect(), b = root.getBoundingClientRect();
      up = b.top - a.top - (parseFloat(st.getPropertyValue('margin-top')) || 0);
      dn = a.bottom - b.bottom - (parseFloat(st.getPropertyValue('margin-bottom')) || 0);
    }
    if (up > .5 && up <= 40) st.setProperty('margin-top', -up + 'px', 'important'); else st.removeProperty('margin-top');
    if (dn > .5 && dn <= 40) st.setProperty('margin-bottom', -dn + 'px', 'important'); else st.removeProperty('margin-bottom');
    // suvenirnica je odmah iznad (bez razmaka) → ona već daje razmak, ovdje ostaje samo rub
    var su = d.getElementById('jsu-suvenirnica');
    root.classList.toggle('jb--join', !boxed && !!su && !su.classList.contains('jsu--boxed') &&
      Math.abs(su.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
  }
  // najviši Elementor element (kontejner ili sekcija) oko bloka, samo ako je blok jedini vidljivi widget u njemu
  function shell() {
    if (!root.matches) return null;
    for (var e = root; e.parentElement; e = e.parentElement)
      if (e.parentElement.matches('.elementor, .elementor-section-wrap')) {
        if (e === root) return null;
        var n = 0, ws = e.querySelectorAll('.elementor-widget');
        for (var i = 0; i < ws.length; i++) if (ws[i].offsetHeight > 0) n++;
        return n === 1 ? e : null;
      }
    return null;
  }
  function refit() { clearTimeout(fit.t); fit.t = setTimeout(fit, 120); }
  fit();
  w.addEventListener('resize', refit);
  if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);

  /* ---------- dolazak kadra: dok ulazi u ekran, iz malo manjeg „sjedne“ na svoje mjesto (prelaz iz teme, kao ratrak) ---------- */
  (function rise() {
    var el = q('.jb-frame');
    if (!el || !('scale' in el.style) || reduced) return;
    var raf = 0, last = -1;
    function upd() {
      raf = 0;
      var vh = w.innerHeight || d.documentElement.clientHeight, t = el.parentNode.getBoundingClientRect().top + el.offsetTop;
      var k = Math.min(1, Math.max(0, (vh - t) / (vh * .62))); k = 1 - Math.pow(1 - k, 3);
      if (Math.abs(k - last) < .002) return; last = k;
      el.style.scale = k < 1 ? String(1 - (d.documentElement.clientWidth < 761 ? .03 : .06) * (1 - k)) : '';
      el.style.willChange = k > 0 && k < 1 ? 'scale' : '';
    }
    function req() { if (!raf) raf = w.requestAnimationFrame(upd); }
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    req();
  })();

  /* ---------- Google Analytics: gtag (GA4) ili dataLayer (Google Tag Manager); bez njih ništa se ne šalje ---------- */
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
    var b = e.target.closest && e.target.closest('[data-jb], .jb-book');
    if (!b) return;
    var k = b.classList.contains('jb-book') ? 'meni' : b.getAttribute('data-jb');
    if (k === 'meni') rOpen(b);
    else if (k === 'video') vOpen(b);
    else if (k === 'stranica') track('bar_klik', { cilj: 'stranica' });
  });

  /* ---------- zajedničko za oba prozora preko ekrana: fokus ostaje unutra, Esc zatvara, stranica ispod ne skroluje ---------- */
  var htmlOverflow = '';
  function lockScroll(on) {
    if (on) { htmlOverflow = d.documentElement.style.overflow; d.documentElement.style.overflow = 'hidden'; }
    else d.documentElement.style.overflow = htmlOverflow;
  }
  function trap(box, e) {
    var bs = [].slice.call(box.querySelectorAll('button, iframe, [tabindex="0"]')).filter(function (b) { return b.offsetParent !== null && !b.disabled; });
    if (!bs.length) return;
    var i = bs.indexOf(d.activeElement);
    e.preventDefault(); bs[(i + (e.shiftKey ? -1 : 1) + bs.length) % bs.length].focus();
  }

  /* =====================================================================
     MENI PREKO CIJELOG EKRANA — listanje kao papir
     Računar: otvorena knjiga (dvije strane); list = dvije strane jednog papira. Telefon/usko: jedna strana.
     t = broj okrenutih listova. List se okreće oko poveza (rotateY 0 → -180°) i savija se u dva dijela
     (spoljni dio prednjači), uz svjetlo/sjenku na listu i sjenku na stranama ispod.
     ===================================================================== */
  var R = null;   // stanje čitača
  function rBuild() {
    var el = d.createElement('div'); el.id = 'jb-meni';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', T.reader);
    el.innerHTML =
      '<div class="jb-r-bg"></div><div class="jb-r-veil"></div>' +
      '<div class="jb-r-top"><div class="jb-r-title">' + esc(T.readerT) + ' <em>· ' + esc(T.readerS) + '</em></div>' +
        '<div class="jb-r-tools"><button type="button" class="jb-r-zbtn" aria-pressed="false" aria-label="' + esc(T.zoom) + '">' + ICON.zoom + '<span>' + esc(T.zoom) + '</span></button>' +
        '<button type="button" class="jb-r-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button></div></div>' +
      '<div class="jb-r-stage" role="group" aria-roledescription="meni" aria-label="' + esc(T.reader) + '"><div class="jb-r-fly"><div class="jb-r-book"></div></div></div>' +
      '<div class="jb-r-hint">' + esc(T.hint) + '</div>' +
      '<div class="jb-r-bar"><button type="button" class="jb-r-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
        '<div class="jb-r-ind" aria-live="polite"><span></span><i><s></s></i></div>' +
        '<button type="button" class="jb-r-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button></div>' +
      '<div class="jb-r-zoom" tabindex="0"></div>';
    d.body.appendChild(el);
    el.querySelector('.jb-r-bg').style.backgroundImage = cssUrl(ROOM);
    R = { el: el, stage: el.querySelector('.jb-r-stage'), fly: el.querySelector('.jb-r-fly'), book: el.querySelector('.jb-r-book'),
      ind: el.querySelector('.jb-r-ind'), zoomBox: el.querySelector('.jb-r-zoom'), zbtn: el.querySelector('.jb-r-zbtn'),
      prev: el.querySelector('.jb-r-prev'), next: el.querySelector('.jb-r-next'), hint: el.querySelector('.jb-r-hint'),
      mode: '', t: 0, m: 0, leaves: [], anim: null, pw: 0, ph: 0, zoom: false, open: false, built: '' };
    R.prev.addEventListener('click', function () { flip(-1); });
    R.next.addEventListener('click', function () { flip(1); });
    el.querySelector('.jb-r-close').addEventListener('click', rClose);
    R.zbtn.addEventListener('click', function () { zoom(!R.zoom); });
    drag();
    // ugao strane se podigne kad je miš iznad desne strane (ili cijele, na jednoj strani)
    R.stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = R.book.getBoundingClientRect(), x = e.clientX - r.left;
      var hot = e.clientY > r.top && e.clientY < r.bottom && x > (R.mode === 'spread' ? r.width / 2 : r.width * .35) && x < r.width;
      R.book.classList.toggle('is-hot', hot);
    });
    R.stage.addEventListener('pointerleave', function () { R.book.classList.remove('is-hot'); });
    w.addEventListener('resize', function () { if (R.open) { clearTimeout(R.rt); R.rt = setTimeout(layout, 120); } });
  }
  function leafPages(j) {
    // dvije strane: prednja i zadnja (na jednoj strani zadnja je prazan papir)
    if (R.mode === 'spread') return [2 * j, 2 * j + 1 < MENU.length ? 2 * j + 1 : -1];
    return [j, -1];
  }
  function face(cls, h, p) {
    return '<div class="jb-face ' + cls + (p < 0 ? ' jb-face--blank' : '') + '" data-h="' + h + '"' + (p < 0 ? '' : ' data-p="' + p + '"') + '></div>';
  }
  function buildLeaves() {
    var n = MENU.length, m = R.mode === 'spread' ? Math.ceil(n / 2) : n, html = '';
    for (var j = 0; j < m; j++) {
      var pp = leafPages(j);
      html += '<div class="jb-leaf" data-j="' + j + '"><div class="jb-seg jb-seg--in">' +
        face('jb-face--f', 0, pp[0]) + face('jb-face--b', 1, pp[1]) +
        '<div class="jb-seg jb-seg--out">' + face('jb-face--f', 1, pp[0]) + face('jb-face--b', 0, pp[1]) + '<i class="jb-ear"></i></div>' +
        '</div></div>';
    }
    R.book.innerHTML = '<div class="jb-r-under jb-r-under--l"></div><div class="jb-r-under jb-r-under--r"></div>' + html +
      '<div class="jb-cast jb-cast--l"></div><div class="jb-cast jb-cast--r"></div>';
    R.m = m;
    R.leaves = [].slice.call(R.book.querySelectorAll('.jb-leaf')).map(function (el) {
      return { el: el, out: el.querySelector('.jb-seg--out'), faces: [].slice.call(el.querySelectorAll('.jb-face[data-p]')), loaded: false };
    });
    R.castL = R.book.querySelector('.jb-cast--l'); R.castR = R.book.querySelector('.jb-cast--r');
    R.underL = R.book.querySelector('.jb-r-under--l'); R.underR = R.book.querySelector('.jb-r-under--r');
    R.built = R.mode + ':' + MENU.join('|');
  }
  // slike se učitavaju samo za listove oko otvorenih strana
  function ensure() {
    for (var j = Math.max(0, R.t - 2); j <= Math.min(R.m - 1, R.t + 2); j++) {
      var L = R.leaves[j];
      if (L.loaded) continue;
      L.loaded = true;
      L.faces.forEach(function (f) { f.style.backgroundImage = cssUrl(MENU[+f.getAttribute('data-p')]); });
    }
  }
  // prva vidljiva strana (0-based) — da se pri promjeni načina (dvije/jedna strana) ostane na istom mjestu
  function firstPage() { return R.mode === 'spread' ? Math.max(0, 2 * R.t - 1) : R.t; }
  function layout() {
    var vw = w.innerWidth, vh = w.innerHeight;
    var top = vw < 761 ? 66 : Math.max(64, Math.min(84, vh * .09)), bot = vw < 761 ? 84 : Math.max(80, Math.min(100, vh * .11));
    R.el.style.setProperty('--top', top + 'px'); R.el.style.setProperty('--bot', bot + 'px');
    var aw = vw - (vw < 761 ? 24 : 80), ah = vh - top - bot - (vw < 761 ? 8 : 16);
    var pwS = Math.min(aw / 2, ah / RATIO);
    var mode = vw >= 820 && pwS >= 250 && MENU.length > 1 ? 'spread' : 'single';
    var pw = mode === 'spread' ? pwS : Math.min(aw, ah / RATIO, 640);
    pw = Math.floor(pw); var ph = Math.round(pw * RATIO);
    var keep = R.mode ? firstPage() : 0;
    if (R.anim) finish();
    if (mode !== R.mode || R.built !== mode + ':' + MENU.join('|')) {
      R.mode = mode;
      R.stage.classList.toggle('jb-spread', mode === 'spread');
      R.stage.classList.toggle('is-single', mode === 'single');
      buildLeaves();
      R.t = mode === 'spread' ? Math.min(R.m, Math.ceil(keep / 2)) : Math.min(R.m - 1, keep);
    }
    R.pw = pw; R.ph = ph;
    R.book.style.width = (mode === 'spread' ? 2 * pw : pw) + 'px';
    R.book.style.height = ph + 'px';
    render();
  }
  // mirno stanje: okrenuti listovi lijevo (-180°), ostali desno; zatvorena knjiga je centrirana (korica ili zadnja korica)
  function render() {
    var t = R.t, m = R.m, spread = R.mode === 'spread';
    R.leaves.forEach(function (L, j) {
      var f = j < t;
      L.el.style.transform = f ? 'rotateY(-180deg)' : 'none';
      L.out.style.transform = 'none';
      L.el.style.setProperty('--s', 0);
      L.el.style.zIndex = f ? j + 1 : m - j + 1;
      L.el.classList.toggle('is-top', j === t);
      // dalje od otvorenih strana ništa se ne crta; na jednoj strani okrenuti list nestaje lijevo
      L.el.classList.toggle('is-off', Math.abs(j - t) > 2 || (!spread && f));
    });
    R.castL.style.opacity = 0; R.castR.style.opacity = 0;
    R.underL.classList.toggle('is-on', spread && t > 1);
    R.underR.classList.toggle('is-on', t < m - 1);
    R.book.style.transform = shift(t);
    R.stage.classList.toggle('can-next', t < (spread ? m : m - 1));
    ensure(); indicator();
  }
  function shift(t) {
    if (R.mode !== 'spread') return 'none';
    return t === 0 ? 'translateX(-25%)' : t === R.m ? 'translateX(25%)' : 'none';
  }
  function maxT() { return R.mode === 'spread' ? R.m : R.m - 1; }
  function indicator() {
    var n = MENU.length, a, b, txt;
    if (R.mode === 'spread') { a = Math.max(1, 2 * R.t); b = Math.min(n, 2 * R.t + 1); if (R.t === 0) b = 1; if (R.t === R.m) a = b = n; }
    else a = b = R.t + 1;
    txt = (a === b ? pad(a) : pad(a) + '–' + pad(b));
    R.ind.querySelector('span').innerHTML = esc(txt) + ' <em>/ ' + pad(n) + '</em>';
    R.ind.setAttribute('aria-label', T.page + ' ' + (a === b ? a : a + '–' + b) + ' ' + T.of + ' ' + n);
    R.ind.style.setProperty('--pr', (b / n).toFixed(3));
    R.prev.disabled = R.t <= 0; R.next.disabled = R.t >= maxT();
    if (R.zoom) zoomFill();
  }
  // jedan kadar okreta: p = 0 (desno) … 1 (lijevo); spoljni dio lista prednjači u smjeru okreta
  function pose(j, p, dir) {
    var L = R.leaves[j], s = Math.sin(p * Math.PI);
    L.el.classList.remove('is-off');
    L.el.style.zIndex = 200;
    L.el.style.transform = 'rotateY(' + (-180 * p).toFixed(2) + 'deg)';
    L.out.style.transform = 'rotateY(' + (-dir * 32 * s).toFixed(2) + 'deg)';
    L.el.style.setProperty('--s', s.toFixed(3));
    R.castR.style.opacity = p < .5 ? (s * .9).toFixed(3) : 0;
    R.castL.style.opacity = p >= .5 && R.mode === 'spread' ? (s * .9).toFixed(3) : 0;
  }
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  // animacija od p0 do p1; kad završi, list ostaje okrenut (done=true) ili se vraća
  function animate(j, dir, p0, p1, commit) {
    var dur = reduced ? 0 : Math.max(220, 820 * Math.abs(p1 - p0)), t0 = 0;
    R.stage.classList.add('is-anim');
    R.anim = { j: j, dir: dir, p1: p1, commit: commit, raf: 0, auto: !!R.auto };
    R.auto = false;
    if (commit) {   // knjiga se pomjera (zatvorena ↔ otvorena) zajedno sa okretom korice
      var nt = R.t + dir;
      R.book.style.transform = shift(nt);
      R.underL.classList.toggle('is-on', R.mode === 'spread' && Math.min(R.t, nt) > 0);
      R.underR.classList.toggle('is-on', Math.max(R.t, nt) < R.m - (R.mode === 'spread' ? 0 : 1));
    }
    (function step(now) {
      if (!t0) t0 = now;
      var k = dur ? Math.min(1, (now - t0) / dur) : 1;
      pose(j, p0 + (p1 - p0) * ease(k), dir);
      if (k < 1) R.anim.raf = w.requestAnimationFrame(step); else finish();
    })(w.performance ? performance.now() : Date.now());
    if (!dur) finish();
  }
  function finish() {
    var a = R.anim; if (!a) return;
    if (a.raf) w.cancelAnimationFrame(a.raf);
    R.anim = null;
    if (a.commit) R.t += a.dir;
    R.stage.classList.remove('is-anim');
    render();
    if (a.commit && !a.auto) { R.hint.classList.add('is-gone'); R.stage.classList.remove('jb-hint'); }
  }
  function flip(dir) {
    if (R.anim) finish();
    if (dir > 0 && R.t >= maxT()) return;
    if (dir < 0 && R.t <= 0) return;
    var j = dir > 0 ? R.t : R.t - 1;
    animate(j, dir, dir > 0 ? 0 : 1, dir > 0 ? 1 : 0, true);
  }
  function go(t) {   // skok (Home/End)
    if (R.anim) finish();
    R.t = Math.max(0, Math.min(maxT(), t)); render();
  }
  // prevlačenje: strana prati prst/miš; pušteno preko trećine (ili brzo) — okrene se, inače se vrati. Kratak dodir = klik
  function drag() {
    var st = null;
    R.stage.addEventListener('pointerdown', function (e) {
      if (R.zoom || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (R.anim) finish();
      var r = R.book.getBoundingClientRect();
      if (e.clientX < r.left - 30 || e.clientX > r.right + 30 || e.clientY < r.top - 30 || e.clientY > r.bottom + 30) return;
      st = { x: e.clientX, y: e.clientY, id: e.pointerId, r: r, dir: 0, j: -1, p: 0, h: [[Date.now(), e.clientX]] };
      if (R.mode === 'spread') st.side = e.clientX > r.left + r.width / 2 ? 1 : -1;
      else st.side = e.clientX > r.left + r.width * .35 ? 1 : -1;
      try { R.stage.setPointerCapture(e.pointerId); } catch (er) {}
    });
    R.stage.addEventListener('pointermove', function (e) {
      if (!st || e.pointerId !== st.id) return;
      var dx = e.clientX - st.x, now = Date.now();
      // brzina se mjeri samo na zadnjih ~100 ms pokreta (brzo "bacanje" strane je okreće i kad je pomak mali)
      st.h.push([now, e.clientX]); while (st.h.length > 2 && now - st.h[0][0] > 100) st.h.shift();
      if (!st.dir) {
        if (Math.abs(dx) < 8) return;
        // na dvije strane smjer određuje strana koju je uhvatio; na jednoj strani smjer prevlačenja
        st.dir = R.mode === 'spread' ? st.side : (dx < 0 ? 1 : -1);
        if ((st.dir > 0 && R.t >= maxT()) || (st.dir < 0 && R.t <= 0)) { st.dir = 0; st.dead = true; return; }
        st.j = st.dir > 0 ? R.t : R.t - 1;
        R.stage.classList.add('is-drag');
      }
      if (st.dead) return;
      var span = R.pw * (R.mode === 'spread' ? 1.7 : 1.15);
      st.p = st.dir > 0 ? Math.min(1, Math.max(0, -dx / span)) : 1 - Math.min(1, Math.max(0, dx / span));
      pose(st.j, st.p, st.dir);
    });
    function end(e) {
      if (!st || e.pointerId !== st.id) return;
      var s = st; st = null;
      R.stage.classList.remove('is-drag');
      if (!s.dir) {   // klik/dodir na stranu
        if (!s.dead && Math.abs(e.clientX - s.x) < 8 && Math.abs(e.clientY - s.y) < 8) flip(s.side);
        return;
      }
      var h0 = s.h[0], now = Date.now(), v = now - h0[0] > 140 ? 0 : (e.clientX - h0[1]) / Math.max(16, now - h0[0]);   // px/ms
      var done = s.dir > 0 ? (s.p > .32 || v < -.6) : (s.p < .68 || v > .6);
      if (done) animate(s.j, s.dir, s.p, s.dir > 0 ? 1 : 0, true);
      else animate(s.j, s.dir, s.p, s.dir > 0 ? 0 : 1, false);
    }
    R.stage.addEventListener('pointerup', end);
    R.stage.addEventListener('pointercancel', end);
  }
  // uvećanje: vidljive strane kao prave slike (čitljiva sitna slova), skrol i štipanje
  function visiblePages() {
    var n = MENU.length, out = [];
    if (R.mode === 'spread') { if (R.t > 0) out.push(2 * R.t - 1); if (2 * R.t < n && R.t < R.m) out.push(2 * R.t); }
    else out.push(R.t);
    return out.filter(function (p) { return p >= 0 && p < n; });
  }
  function zoomFill() {
    R.zoomBox.innerHTML = visiblePages().map(function (p) {
      return '<img src="' + esc(MENU[p]) + '" alt="' + esc(T.page + ' ' + (p + 1) + ' ' + T.of + ' ' + MENU.length) + '" decoding="async">';
    }).join('');
    R.zoomBox.scrollTop = 0; R.zoomBox.scrollLeft = 0;
  }
  function zoom(on) {
    R.zoom = on;
    R.el.classList.toggle('is-zoom', on);
    R.zbtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    R.zbtn.setAttribute('aria-label', on ? T.unzoom : T.zoom);
    R.zbtn.innerHTML = (on ? ICON.unzoom : ICON.zoom) + '<span>' + esc(on ? T.unzoom : T.zoom) + '</span>';
    if (on) { zoomFill(); R.zoomBox.focus(); } else R.zoomBox.innerHTML = '';
  }
  function rKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); if (R.zoom) zoom(false); else rClose(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); flip(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); flip(-1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(maxT()); }
    else if (e.key === 'Tab') trap(R.el, e);
  }
  var rBack = null;
  function rOpen(from) {
    if (!MENU.length) return;
    if (!R) rBuild();
    rBack = d.activeElement;
    R.open = true;
    if (R.zoom) zoom(false);
    R.mode = R.mode || ''; R.t = 0;
    lockScroll(true);
    R.el.classList.add('is-shown');
    layout();
    R.t = 0; render();
    // meni "doleti" sa mjesta u kadru (samo kad je otvoren klikom na meni), pa se korica otvori (na dvije strane)
    var src = from && from.classList && from.classList.contains('jb-book') ? q('.jb-bk-f') : null;
    if (src && !reduced) {
      var a = src.getBoundingClientRect(), fb = R.book.getBoundingClientRect();
      var cw = R.mode === 'spread' ? fb.width / 2 : fb.width, cx = R.mode === 'spread' ? fb.left + fb.width / 4 : fb.left;
      // korica je u mirnom stanju centrirana (pomak -25%), pa se mjeri njen stvarni položaj
      var sc = a.width / cw;
      R.fly.style.transition = 'none';
      R.fly.style.transform = 'translate(' + (a.left + a.width / 2 - (cx + cw / 2)) + 'px,' + (a.top + a.height / 2 - (fb.top + fb.height / 2)) + 'px) scale(' + sc.toFixed(3) + ')';
      void R.fly.offsetWidth;
      R.fly.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)';
      R.fly.style.transform = 'none';
    } else { R.fly.style.transition = 'none'; R.fly.style.transform = 'none'; }
    void R.el.offsetWidth; R.el.classList.add('is-open');
    R.hint.classList.remove('is-gone');
    R.el.querySelector('.jb-r-next').focus({ preventScroll: true });
    d.addEventListener('keydown', rKey);
    clearTimeout(R.ot);
    if (R.mode === 'spread') R.ot = setTimeout(function () { if (R.open && R.t === 0 && !R.anim) { R.auto = true; flip(1); } }, reduced ? 0 : 760);
    else if (!reduced) {   // jedna strana: ugao se kratko podigne kao poziv na listanje
      R.ot = setTimeout(function () { R.stage.classList.add('jb-hint'); setTimeout(function () { R.stage.classList.remove('jb-hint'); }, 1100); }, 700);
    }
    track('bar_meni', { strana: MENU.length });
  }
  function rClose() {
    if (!R || !R.open) return;
    R.open = false; clearTimeout(R.ot);
    d.removeEventListener('keydown', rKey);
    if (R.anim) finish();
    R.el.classList.remove('is-open');
    lockScroll(false);
    setTimeout(function () { if (!R.open) { R.el.classList.remove('is-shown'); if (R.zoom) zoom(false); } }, 360);
    if (rBack && rBack.focus) rBack.focus({ preventScroll: true });
  }

  /* ---------- VIDEO preko cijelog ekrana (youtube-nocookie, učitava se tek sad) ---------- */
  var V = null, vBack = null;
  function vKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); vClose(); }
    else if (e.key === 'Tab') trap(V, e);
  }
  function vOpen() {
    if (!V) {
      V = d.createElement('div'); V.id = 'jb-vid';
      V.setAttribute('role', 'dialog'); V.setAttribute('aria-modal', 'true'); V.setAttribute('aria-label', T.vid);
      V.innerHTML = '<div class="jb-v-box"></div><button type="button" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>';
      d.body.appendChild(V);
      V.querySelector('button').addEventListener('click', vClose);
      V.addEventListener('click', function (e) { if (e.target === V) vClose(); });
      }
    d.addEventListener('keydown', vKey);
    vBack = d.activeElement;
    V.querySelector('.jb-v-box').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(YT) +
      '?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="' + esc(T.vid) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    lockScroll(true);
    V.classList.add('is-shown'); void V.offsetWidth; V.classList.add('is-open');
    V.querySelector('button').focus();
    track('bar_video', {});
  }
  function vClose() {
    d.removeEventListener('keydown', vKey);
    V.classList.remove('is-open');
    lockScroll(false);
    setTimeout(function () { if (!V.classList.contains('is-open')) { V.classList.remove('is-shown'); V.querySelector('.jb-v-box').innerHTML = ''; } }, 320);
    if (vBack && vBack.focus) vBack.focus({ preventScroll: true });
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica Olimpijski bar + meni iz Medija ---------- */
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
  // brojevi iz teksta stranice: nadmorska visina, površina, broj događaja (SR i EN)
  function factsOf(txt) {
    var f = [], m;
    if ((m = txt.match(/(\d{1,2}[.,]?\d{3})\s*(?:metara|metres|meters|m)\b/i))) f.push([m[1], 'm', T.facts[0][2]]);
    if ((m = txt.match(/(\d[\d.,]*)\s*(?:m²|m2|kvadrat\w*|square\s+met\w*)/i))) f.push([m[1], 'm²', T.facts[1][2]]);
    if ((m = txt.match(/(?:više\s+od|preko|over|more\s+than)\s+(\d+)\s+(?:događaj\w*|manifestacij\w*|events?)/i))) f.push([m[1], '+', T.facts[2][2]]);
    else if ((m = txt.match(/(\d+)\s*\+?\s*(?:događaj\w*|events)/i))) f.push([m[1], '', T.facts[2][2]]);
    return f;
  }
  function parse(pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    return {
      id: pg.id, link: link, ps: ps, facts: factsOf(clean(b.textContent)), yt: ytId(raw),
      title: clean(new DOMParser().parseFromString('<body>' + pickLang(pg.title && pg.title.rendered || ''), 'text/html').body.textContent)
    };
  }
  // meni iz Medija: slike meni-bar-NN (NN = strana); za isti broj vrijedi najnovija; WordPress veličina ~1200 px ako postoji
  function menuOf(ms) {
    var by = {};
    (ms || []).forEach(function (x) {
      var u = x && x.source_url || '', mm = u.match(/\/meni-bar-(\d{1,2})(?:-\d+)?(?:-scaled|-e\d+)?\.(?:jpe?g|png|webp)(?:\?.*)?$/i);
      if (!mm || (x.mime_type && !/^image\//.test(x.mime_type))) return;
      var k = +mm[1], dt = Date.parse(x.date_gmt || x.date || '') || 0;
      if (by[k] && by[k].dt >= dt) return;
      var sz = x.media_details && x.media_details.sizes || {}, best = null;
      Object.keys(sz).forEach(function (s) {
        var v = sz[s]; if (!v || !v.width || !v.source_url) return;
        if (v.width >= 1100 && v.width <= 1800 && (!best || v.width < best.width)) best = v;
      });
      var md = x.media_details || {};
      by[k] = { dt: dt, url: (md.width && md.width <= 1800) || !best ? u : best.source_url, small: (sz.medium_large || sz.large || {}).source_url || u,
        ratio: md.width && md.height ? md.height / md.width : 0 };
    });
    var ks = Object.keys(by).map(Number).sort(function (a, b) { return a - b; });
    return ks.map(function (k) { return by[k]; });
  }
  function load() {
    var pg = api('pages', 'slug=' + encodeURIComponent(SLUG) + '&_fields=id,link,title,content').then(function (j) {
      if (!j || !j[0]) throw new Error('Stranica "' + SLUG + '" nije pronađena');
      return parse(j[0]);
    });
    var mn = FIXED_MENU ? Promise.resolve(null) : api('media', 'search=meni-bar&media_type=image&per_page=100&_fields=id,date,date_gmt,source_url,mime_type,media_details')
      .then(menuOf, function (e) { return { err: e }; });
    return Promise.all([pg.then(function (r) { return r; }, function (e) { return { err: e }; }), mn]);
  }
  function apply(res) {
    var r = res[0], mn = res[1], miss = [];
    if (r && !r.err) {
      if (r.title) {
        var h2 = q('h2');
        if (h2.textContent.replace(/\s+/g, '') !== r.title.replace(/\s+/g, '')) h2.innerHTML = titleHTML(r.title);
        h2.classList.toggle('jb-long', r.title.length > 26);
      }
      if (r.ps.length) { var ld = leadOf(r.ps[0]); if (ld !== q('.jb-lead').textContent) q('.jb-lead').textContent = ld; }
      else miss.push('tekst');
      // brojevi samo ako ih tekst stranice ima (kad se tekst promijeni, mijenjaju se i ovdje)
      var fl = q('.jb-facts');
      if (r.facts.length) { var fh = factsHTML(r.facts); if (fl.innerHTML !== fh) fl.innerHTML = fh; fl.style.display = ''; }
      else fl.style.display = 'none';
      if (r.link) q('a[data-jb="stranica"]').setAttribute('href', r.link);
      if (!YT_FIXED) { if (r.yt) YT = r.yt; else miss.push('video'); }
    } else miss.push('stranica (' + (r && r.err && r.err.message || 'REST') + ')');
    if (mn && !mn.err && mn.length >= 2) {
      var urls = mn.map(function (x) { return x.url; });
      if (urls.join('|') !== MENU.join('|')) {
        MENU = urls; SMALL = [mn[0].small, mn[1].small];
        if (mn[0].ratio > 1 && mn[0].ratio < 2) RATIO = mn[0].ratio;
        setBook();
        if (R && R.open) layout();
      }
    } else if (mn) miss.push('meni u Medijima (meni-bar-01, -02 …)' + (mn.err ? ': ' + mn.err.message : ''));
    if (miss.length) why(miss.join('; '));
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jb-why') || q('.jb-body').appendChild(d.createElement('small'));
    el.className = 'jb-why'; el.textContent = T.why + ': ' + msg + ' (' + T.whyTail + ')';
  }
  if (w.fetch && w.DOMParser && w.Promise) load().then(apply).catch(function (e) {
    if (w.console) console.warn('[Jahorina bar]', e);
    why(e && e.message || 'REST');
  });

  // ulazak jednom, kad kadar dođe u vidno polje; poslije toga se korica menija jednom odškrine
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jb-anim');
    var fr = q('.jb-frame');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jb-on'); io.disconnect();
        setTimeout(function () { root.classList.add('jb-peek'); setTimeout(function () { root.classList.remove('jb-peek'); }, 2000); }, 2100);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(fr);
  }
})(window, document);
