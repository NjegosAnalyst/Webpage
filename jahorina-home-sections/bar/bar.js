/* =====================================================================
   JAHORINA — OLIMPIJSKI BAR (početna, ispod suvenirnice) · v2 "meni na stolu"
   Tema hero-a, vijesti, ratraka i suvenirnice (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele
   širine, fotografija u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · u pozadini kadra se SMJENJUJU fotografije bara (rižoto → enterijer → losos): nova se upali iz mraka, kao svjetlo;
     · cik-cak sa suvenirnicom iznad (tamo tekst lijevo): ovdje je meni lijevo, tekst desno;
     · lijevo u kadru stoji PRAVI MENI (3D, debljina strana, sjenka) koji LEŽI NA STOLU i, dok se skrolom dolazi do
       sekcije, PODIŽE SE SA STOLA i uspravi (skrol nazad ga opet spusti); kad stane, korica se jednom odškrine.
       Klik/dodir otvara meni preko cijelog ekrana za listanje i čitanje;
     · preko ekrana: otvorena knjiga, strane se okreću kao papir (prevlačenje, klik, strelice, tastatura), "Uvećaj";
     · desno naslov, uvod, tri podatka (nadmorska visina · Bar · restoran · terasa / après-ski i koncerti · 40+ događaja),
       dugmad "Rezervacije" (telefon) i "Pogledaj video" (YouTube preko ekrana tek na klik).

   SADRŽAJ JE IZ WORDPRESSA:
     · stranica "Olimpijski bar" (slug olimpijski-bar): naslov = naslov stranice, uvod = prva rečenica prvog pasusa,
       nadmorska visina i broj događaja se čitaju iz teksta, video = prvi YouTube link/ugradnja na stranici,
       telefon = prvi tel: link na stranici (ako postoji), "Više o baru" = link stranice;
     · meni = slike u Medijima sa imenom meni-bar-01, meni-bar-02 … (redni broj = strana; za isti broj vrijedi
       najnovija). Kad se cijene promijene, u Medije se dodaju nove slike sa istim imenima.
     Dok WordPress ne odgovori (ili ako nema tih slika), stoje ugrađeni tekst (isti kao na stranici 8. 10. 2026)
     i ugrađeni meni (12 strana iz slike/meni/ pored ovog fajla). Prijavljeni admin vidi tehnički razlog.

   Ugradnja: Elementor HTML widget sa <div id="jb-bar"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jb-bar"> (sva su neobavezna):
     data-stranica="olimpijski-bar"   (slug WordPress stranice)
     data-telefon="+387…"              (broj za rezervacije; podrazumijevano kontakt OC Jahorina +387 57 270 003)
     data-video="https://youtu.be/…"   (zamjena za video sa stranice)
     data-meni="url1, url2, …"         (zamjena za meni: slike strana redom)
   GA: Rezervacije → bar_rezervacija (nacin: telefon), otvaranje menija → bar_meni, video → bar_video,
       "Više o baru" → bar_klik (cilj: stranica).
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
  var TEL_FIXED = !!opt('telefon', '');
  var TEL = opt('telefon', '+38757270003');   // kontakt telefon OC Jahorina (marketing i prodaja, kao rezervacije ratraka)
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 7000;   // smjena fotografija (ms)

  // ugrađeni tekst = tekst sa stranice Olimpijski bar (8. 10. 2026); srednji podatak je korisnikov; EN je prevod
  var T = EN ? {
    kicker: 'Food & après-ski', head: 'Olympic Bar',
    lead: 'At the top of Jahorina, 1,879 metres above sea level, the Olympic Bar is a favourite of skiers and lovers of good food and fun.',
    alt: ['m', 'above sea level'], mid: ['Bar · restaurant · terrace', 'après-ski & concerts'], ev: ['+', 'events a year'],
    altV: '1,879', evV: '40',
    rez: 'Book', rezS: 'Reservations', rezAria: 'Reservations by phone', video: 'Watch the video', videoS: 'Video', more: 'More about the Olympic Bar',
    book: 'Menu', pages: 'pages', capM: 'Click to browse the menu', capT: 'Tap to browse the menu',
    bookAria: 'Open the menu',
    reader: 'Olympic Bar menu', readerT: 'Olympic Bar', readerS: 'Menu',
    prev: 'Previous page', next: 'Next page', close: 'Close', zoom: 'Zoom in', unzoom: 'Zoom out', page: 'Page', of: 'of',
    hint: 'Click or drag the page to turn it', vid: 'Video: Olympic Bar', why: 'WordPress', whyTail: 'showing built-in content',
    photos: ['Mushroom risotto and a glass of white wine on the Olympic Bar placemat "Hospitality is part of skiing"',
      'Olympic Bar interior: velvet chairs, wooden tables and warm lights by the large windows',
      'Salmon fillet with grilled vegetables and Dalmatian stew']
  } : {
    kicker: 'Hrana i après-ski', head: 'Olimpijski bar',
    lead: 'Na vrhu Jahorine, na 1.879 metara nadmorske visine, nalazi se Olimpijski bar, omiljeno mjesto skijaša i ljubitelja dobre hrane i zabave.',
    alt: ['m', 'nadmorske visine'], mid: ['Bar · restoran · terasa', 'après-ski i koncerti'], ev: ['+', 'događaja godišnje'],
    altV: '1.879', evV: '40',
    rez: 'Rezervacije', rezS: 'Rezervacije', rezAria: 'Rezervacije telefonom', video: 'Pogledaj video', videoS: 'Video', more: 'Više o Olimpijskom baru',
    book: 'Meni', pages: 'strana', capM: 'Kliknite za listanje menija', capT: 'Dodirnite za listanje menija',
    bookAria: 'Otvori meni',
    reader: 'Meni Olimpijskog bara', readerT: 'Olimpijski bar', readerS: 'Cjenovnik',
    prev: 'Prethodna strana', next: 'Sljedeća strana', close: 'Zatvori', zoom: 'Uvećaj', unzoom: 'Smanji', page: 'Strana', of: 'od',
    hint: 'Kliknite ili prevucite stranu', vid: 'Video: Olimpijski bar', why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj',
    photos: ['Rižoto sa pečurkama i čaša bijelog vina na podmetaču Olimpijskog bara „Hospitality is part of skiing“',
      'Enterijer Olimpijskog bara: plišane stolice, drveni stolovi i topla svjetla uz velike prozore',
      'Losos sa grilovanim povrćem i dalmatinskim varivom']
  };

  // meni: strane redom (velike za čitanje, male za meni u kadru); WordPress ih zamijeni ako u Medijima ima meni-bar-01, -02 …
  var RATIO = 1742 / 1240;   // visina / širina strane
  var MSRC = HERE + 'slike/meni/';
  var FIXED_MENU = !!opt('meni', '');
  function nn(k) { return (k < 10 ? '0' : '') + k; }
  var MENU = FIXED_MENU
    ? opt('meni', '').split(',').map(function (x) { return x.trim(); }).filter(Boolean)
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (k) { return MSRC + 'meni-bar-' + nn(k) + '.webp'; });
  var MENU_S = FIXED_MENU ? MENU.slice() : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (k) { return MSRC + 'mala-' + nn(k) + '.webp'; });

  // fotografije kadra (smjenjuju se): pozicija na računaru / telefonu i jačina (svaka fotografija ima svoju svjetlinu)
  var PHOTOS = [
    { f: 'bar-glavna', w: 2000, pos: '40% 62%', mpos: '40% 64%', lum: .74 },
    { f: 'bar-enterijer', w: 1336, pos: '50% 50%', mpos: '50% 50%', lum: .8 },
    { f: 'bar-losos', w: 1300, pos: '50% 50%', mpos: '50% 50%', lum: .64 }
  ].map(function (p, k) { p.full = HERE + 'slike/' + p.f + '.webp'; p.md = HERE + 'slike/' + p.f + '-1000.webp'; p.alt = T.photos[k]; return p; });
  var ROOM = HERE + 'slike/bar-enterijer-1000.webp';

  /* ---------- izgled ---------- */
  // listovi menija: isti CSS za meni u kadru (#R) i meni preko ekrana (#L)
  var LEAF = [
    /* slojevi su malo razmaknuti po dubini (podloga iza, list u okretu ispred), da se ravni u 3D ne preklapaju */
    '#B .jb-under{position:absolute;top:0;height:100%;background:#0f0f0f;display:none;transform:translateZ(-2px);box-shadow:0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#B .jb-under--r{left:50%;width:50%;border-radius:0 4px 4px 0}',
    '#B .jb-under--l{left:0;width:50%;border-radius:4px 0 0 4px}',
    /* rubovi preostalih strana (svijetli papir) */
    '#B .jb-under--r.has-more{box-shadow:1px 1px 0 rgba(214,206,192,.5),2px 2px 0 #2b2926,3px 2px 0 rgba(200,192,178,.38),4px 3px 0 #23211f,0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#B .jb-under--l.has-more{box-shadow:-1px 1px 0 rgba(214,206,192,.5),-2px 2px 0 #2b2926,-3px 2px 0 rgba(200,192,178,.38),-4px 3px 0 #23211f,0 46px 70px -34px rgba(0,0,0,.95),0 18px 40px rgba(0,0,0,.4)}',
    '#B .is-single .jb-under--r{left:0;width:100%}',
    '#B .jb-under.is-on{display:block}',
    /* list (dvije strane jednog papira): savija se u dva dijela da izgleda kao papir, ne kao karton */
    '#B .jb-leaf{position:absolute;top:0;left:50%;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d;--s:0}',
    '#B .is-single .jb-leaf{left:0;width:100%}',
    '#B .jb-leaf.is-off{visibility:hidden}',
    '#B .jb-seg{position:absolute;top:0;left:0;width:50%;height:100%;transform-origin:0 50%;transform-style:preserve-3d}',
    '#B .jb-seg .jb-seg{left:calc(100% - .5px);width:calc(100% + .5px)}',
    '#B .jb-face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;background-color:#141414;background-repeat:no-repeat;background-size:200% 100%;overflow:hidden}',
    '#B .jb-face[data-h="0"]{background-position:0 0}',
    '#B .jb-face[data-h="1"]{background-position:100% 0}',
    '#B .jb-face--b{transform:rotateY(180deg)}',
    '#B .jb-face--blank{background-image:linear-gradient(90deg,#161616,#0e0e0e)!important;background-size:100% 100%!important}',
    '#B .jb-seg--out > .jb-face--f{border-radius:0 3px 3px 0}',
    '#B .jb-seg--out > .jb-face--b{border-radius:3px 0 0 3px}',
    /* pregib uz povez (stalno) */
    '#B .jb-spread .jb-seg--in > .jb-face--f::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.5) 0,rgba(0,0,0,.18) 5%,rgba(255,255,255,.035) 9%,transparent 16%)}',
    '#B .jb-spread .jb-seg--in > .jb-face--b::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(270deg,rgba(0,0,0,.5) 0,rgba(0,0,0,.18) 5%,rgba(255,255,255,.035) 9%,transparent 16%)}',
    '#B .is-single .jb-seg--in > .jb-face--f::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.08) 0,rgba(0,0,0,.4) 1.5%,rgba(0,0,0,.12) 4%,transparent 8%)}',
    /* svjetlo i sjenka na strani dok se okreće (jačina --s raste do sredine okreta) */
    '#B .jb-face::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--s)}',
    '#B .jb-seg--in > .jb-face--f::after{background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(0,0,0,.08) 70%,rgba(255,255,255,.06))}',
    '#B .jb-seg--out > .jb-face--f::after{background:linear-gradient(90deg,rgba(255,255,255,.1),rgba(0,0,0,.12) 45%,rgba(0,0,0,.42))}',
    '#B .jb-seg--in > .jb-face--b::after{background:linear-gradient(270deg,rgba(0,0,0,.5),rgba(0,0,0,.08) 70%,rgba(255,255,255,.06))}',
    '#B .jb-seg--out > .jb-face--b::after{background:linear-gradient(270deg,rgba(255,255,255,.1),rgba(0,0,0,.12) 45%,rgba(0,0,0,.42))}',
    /* sjenka koju strana u okretu baca na strane ispod */
    '#B .jb-cast{position:absolute;top:0;height:100%;width:50%;pointer-events:none;opacity:0;z-index:50;transform:translateZ(.25px)}',
    '#B .jb-cast--r{left:50%;background:linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.25) 40%,rgba(0,0,0,0) 85%)}',
    '#B .jb-cast--l{left:0;background:linear-gradient(270deg,rgba(0,0,0,.62),rgba(0,0,0,.25) 40%,rgba(0,0,0,0) 85%)}',
    '#B .is-single .jb-cast--r{left:0;width:100%}',
    '#B .is-single .jb-cast--l{display:none}',
    '#B .jb-ear{position:absolute;right:0;bottom:0;width:0;height:0;pointer-events:none}'
  ];
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

    /* kadar kao u hero-u; fotografije su pozadina cijelog kadra */
    '#R .jb-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(640px,48vw,860px);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jb-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak topli odsjaj na gornjoj ivici, iznad lampe nad menijem (lijevo) */
    '#R .jb-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 2%,rgba(255,214,170,.42) 22%,transparent 48%)}',
    '#R .jb-bgs{position:absolute;inset:0;z-index:-1;overflow:hidden}',
    /* fotografije: blaža noćna obrada nego u vijestima, da topla svjetlost bara ostane. Smjena: nova se upali iz mraka
       (kao svjetlo), stara se ugasi; bez zumiranja i pomjeranja. Desna ivica se utapa u tamu ispod teksta */
    '#R .jb-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;',
    'filter:saturate(.9) brightness(.22) contrast(1.08);transition:opacity 1.6s ease,filter 2.2s cubic-bezier(.3,.6,.2,1);',
    '-webkit-mask-image:linear-gradient(270deg,transparent 0,#000 24%);mask-image:linear-gradient(270deg,transparent 0,#000 24%)}',
    '#R .jb-bg.is-on{opacity:1;filter:saturate(.9) brightness(var(--lum,.74)) contrast(1.08)}',
    '#R .jb-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.34}',
    '#R .jb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(270deg,rgba(6,11,22,.93) 0,rgba(6,11,22,.84) calc(var(--side) + 380px),rgba(6,11,22,.55) calc(var(--side) + 590px),rgba(6,11,22,.14) calc(var(--side) + 790px),rgba(6,11,22,0) calc(var(--side) + 930px)),',
    'linear-gradient(90deg,rgba(6,11,22,.42) 0,rgba(6,11,22,0) calc(var(--side) + 180px)),',
    'linear-gradient(0deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 30%),linear-gradient(180deg,rgba(6,18,42,.32) 0%,rgba(6,18,42,0) 22%),',
    'radial-gradient(130% 100% at 38% 50%,transparent 56%,rgba(4,8,18,.55) 100%)}',
    /* toplo svjetlo lampe iznad menija (jedini topli izvor; ostalo je noćna obrada) */
    '#R .jb-light{position:absolute;inset:0;pointer-events:none;background:radial-gradient(30% 54% at var(--lx,22%) 0%,rgba(255,214,170,.17),rgba(255,190,140,.05) 55%,transparent 80%)}',

    /* tekst desno (cik-cak sa suvenirnicom iznad), poravnat sa desnom ivicom mreže 1240px */
    '#R .jb-body{position:relative;z-index:2;width:min(calc(var(--side) + 560px),52%);margin-left:auto;padding:clamp(56px,6vw,96px) var(--side) clamp(56px,6vw,96px) 0}',
    '#R .jb-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-bottom:24px}',
    '#R .jb-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(46px,5vw,78px);font-weight:800;line-height:.93;letter-spacing:-.025em}',
    '#R h2.jb-long{font-size:clamp(36px,3.8vw,58px)}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jb-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important;',
    'filter:drop-shadow(0 0 8px rgba(0,185,242,.35)) drop-shadow(0 6px 30px rgba(0,0,0,.45))}}',
    '#R .jb-lead{margin-top:26px;font-size:clamp(15.5px,1.2vw,17.5px);line-height:1.62;color:var(--text-2)!important;max-width:42ch;text-wrap:pretty}',
    /* tri podatka: tipografski red bez pločica, jedinica i tačkice cyan, tanke uspravne crte između; vrijednosti stoje na istoj liniji */
    '#R .jb-facts{display:flex;align-items:flex-start;margin-top:30px!important}',
    '#R .jb-facts li{padding:2px 22px!important;border-left:1px solid rgba(255,255,255,.14);min-width:0}',
    '#R .jb-facts li:first-child{padding-left:0!important;border-left:0}',
    '#R .jb-facts b{display:flex;align-items:flex-end;gap:3px;height:27px;font:700 27px/1 var(--fd);letter-spacing:-.015em;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '#R .jb-facts b i{font:600 14px/1 var(--fd);font-style:normal;letter-spacing:0;color:var(--accent-2);padding-bottom:2px}',
    '#R .jb-facts .jb-f-txt b{gap:7px;font-size:16.5px;letter-spacing:.1px;padding-bottom:1px}',
    '#R .jb-facts .jb-f-txt b i{font:700 16px/1 var(--fd);padding-bottom:1px}',
    '#R .jb-facts small{display:block;margin-top:9px;font:600 9.5px/1.25 var(--fd);letter-spacing:1.3px;text-transform:uppercase;color:var(--text-3);white-space:nowrap}',
    /* dugmad kao u ratraku: bijelo glavno + stakleno sporedno, iste širine i visine */
    '#R .jb-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:34px;width:min(100%,500px)}',
    '#R .jb-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px!important;border-radius:40px!important;cursor:pointer;',
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
    '#R .jb-btn--solid em{font-style:normal;font-weight:500;color:#3a4a63}',
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

    /* MENI U KADRU: pravi meni (debljina strana, sjenka), blago okrenut prema tekstu. Dok sekcija ulazi u ekran, meni se
       podiže sa stola (--k: 0 = leži, 1 = stoji; računa skripta iz skrola); klik/dodir ga otvara preko cijelog ekrana */
    '#R .jb-book{all:unset;position:absolute!important;z-index:3;box-sizing:border-box!important;display:block!important;left:calc(var(--side) + clamp(0px,3vw,64px));top:50%;height:clamp(340px,35vw,560px);aspect-ratio:1240/1742;',
    'margin-top:calc(clamp(340px,35vw,560px) / -2 - 26px)!important;cursor:pointer;perspective:2400px;touch-action:pan-y;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}',
    '#R .jb-book:focus-visible{outline:none!important}',
    '#R .jb-book:focus-visible .jb-cap b{color:var(--accent)}',
    '#R .jb-bk-in{position:absolute;inset:0;transform-style:preserve-3d}',
    /* podizanje sa stola: okreće se oko donje ivice (koja ostaje na stolu), malo se odigne i primakne */
    '#R .jb-bk-lift{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:50% 100%;',
    'transform:translate3d(0,calc((1 - var(--k,1)) * 20px),calc(var(--k,1) * 14px)) rotateX(calc((1 - var(--k,1)) * 76deg))}',
    /* sjenka na stolu ispod menija: dok leži je tamna i uska, kad se podigne razlije se i oslabi */
    '#R .jb-bk-floor{position:absolute;left:-8%;right:-14%;bottom:-5%;height:16%;pointer-events:none;border-radius:50%;',
    'background:radial-gradient(closest-side,rgba(0,0,0,.62),rgba(0,0,0,.28) 55%,transparent);opacity:calc(.35 + (1 - var(--k,1)) * .55);transform:scale(calc(1.15 - (1 - var(--k,1)) * .25),calc(.75 + (1 - var(--k,1)) * .5))}',
    '#R .jb-bk{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(20deg) rotateX(5deg) rotateZ(1.2deg);transition:transform .9s cubic-bezier(.2,.7,.2,1)}',
    '#R .jb-book:hover .jb-bk,#R .jb-book:focus-visible .jb-bk{transform:rotateY(12deg) rotateX(3deg) rotateZ(.6deg) translateZ(22px)}',
    /* meni u kadru je jedna ravna cjelina (listovi se slažu po redu, bez 3D preklapanja); odškrinjanje korice ima svoju perspektivu */
    '#R .jb-fb{position:absolute;inset:0;transform-style:flat;perspective:1400px}',
    /* blagi sjaj laminirane korice preko svega */
    '#R .jb-fb::after{content:"";position:absolute;inset:0;z-index:300;pointer-events:none;transform:translateZ(1.5px);border-radius:1px 4px 4px 1px;background:linear-gradient(112deg,transparent 30%,rgba(255,255,255,.06) 44%,rgba(255,255,255,.012) 54%,transparent 64%);',
    'background-size:240% 100%;background-position:100% 0;transition:background-position 1.2s cubic-bezier(.2,.7,.2,1)}',
    '#R .jb-book:hover .jb-fb::after{background-position:0 0}',
    /* natpis ispod menija: "Meni · 12 strana" (dok se lista: "Meni · 03 / 12") + kako se koristi */
    '#R .jb-cap{position:absolute;left:-60px;right:-60px;top:calc(100% + 30px);display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;pointer-events:none}',
    '#R .jb-cap b{display:flex;align-items:center;gap:10px;font:600 10.5px/1 var(--fd);letter-spacing:2.6px;text-transform:uppercase;color:rgba(255,255,255,.72);text-shadow:0 1px 10px rgba(0,0,0,.7);white-space:nowrap;font-variant-numeric:tabular-nums;transition:color .25s}',
    '#R .jb-cap b svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jb-cap small{font:500 12px/1.3 var(--fb);color:var(--text-3);text-shadow:0 1px 10px rgba(0,0,0,.7)}',
    '#R .jb-book:hover .jb-cap b{color:#fff}',
    '#R .jb-ct{display:none}',
    '@media (hover:none),(pointer:coarse){#R .jb-cm{display:none}#R .jb-ct{display:inline}}',

    /* ulazak (jednom): klase jb-anim/jb-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jb-anim .jb-frame{opacity:0;transform:translateY(28px)}',
    '#R.jb-anim.jb-on .jb-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jb-anim:not(.jb-on) .jb-bg.is-on{opacity:0;filter:saturate(.9) brightness(.3) contrast(1.08) blur(12px)}',
    '#R.jb-anim .jb-light{opacity:0}',
    '#R.jb-anim.jb-on .jb-light{opacity:1;transition:opacity 1.8s ease .8s}',
    '#R.jb-anim .jb-up{opacity:0;transform:translateY(20px)}',
    '#R.jb-anim.jb-on .jb-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jb-anim .jb-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jb-anim.jb-on .jb-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* meni se pojavi na stolu (podiže ga skrol), pa se korica jednom odškrine */
    '#R.jb-anim .jb-bk-in{opacity:0}',
    '#R.jb-anim.jb-on .jb-bk-in{opacity:1;transition:opacity .9s ease .45s}',
    '#R.jb-anim .jb-cap{opacity:0}',
    '#R.jb-anim.jb-on .jb-cap{opacity:1;transition:opacity .8s ease 1.3s}',

    /* manji laptop */
    '@media (max-width:1180px){#R .jb-body{width:min(calc(var(--side) + 500px),56%)}#R .jb-facts li{padding:2px 15px!important}#R .jb-facts b{font-size:23px;height:23px}',
    '#R .jb-facts .jb-f-txt b{font-size:14.5px;gap:5px}#R .jb-facts .jb-f-txt b i{font-size:14px}#R .jb-facts small{letter-spacing:1px}#R .jb-acts{width:min(100%,470px)}#R .jb-btn{padding:0 14px!important}}',
    /* tablet i telefon: fotografija gore (utapa se nadolje) sa menijem na njoj, tekst ispod */
    '@media (max-width:980px){',
    '#R .jb-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jb-bgs{position:relative;inset:auto;height:min(66vw,560px);-webkit-mask-image:linear-gradient(180deg,#000 64%,transparent 100%);mask-image:linear-gradient(180deg,#000 64%,transparent 100%)}',
    '#R .jb-bg{-webkit-mask-image:none;mask-image:none}',
    '#R .jb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 40%),linear-gradient(180deg,rgba(6,18,42,.36) 0%,rgba(6,18,42,0) 26%),linear-gradient(90deg,rgba(6,11,22,.45) 0%,rgba(6,11,22,0) 45%)}',
    '#R .jb-light{--lx:24%}',
    '#R .jb-book{top:clamp(28px,5vw,52px);left:clamp(30px,7vw,72px);height:min(44vw,380px);margin-top:0!important}',
    '#R .jb-cap{top:calc(100% + 18px)}',
    '#R .jb-body{width:auto;margin-left:0;padding:clamp(28px,4vw,40px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.6vw,66px)}',
    '#R .jb-lead{max-width:56ch}}',
    '@media (max-width:760px){',
    '#R .jb-frame{border-radius:24px}',
    '#R .jb-bg{object-position:var(--mpos)!important}',
    /* telefon: meni veći i u sredini fotografije (korisnik), skoro okrenut ka posjetiocu; ispod samo "Meni" */
    '#R .jb-bgs{height:min(124vw,540px)}',
    '#R .jb-book{top:clamp(22px,6vw,34px);left:50%;height:min(78vw,370px);margin-left:calc(min(78vw,370px) * -.356)!important}',
    '#R .jb-bk{transform:rotateY(8deg) rotateX(4deg) rotateZ(.5deg)}',
    '#R .jb-light{--lx:50%}',
    '#R .jb-cap{top:calc(100% + 14px)}',
    '#R .jb-cap b{font-size:9.5px;letter-spacing:2.4px;gap:8px}',
    '#R .jb-cap small,#R .jb-cap-n{display:none}',
    '#R .jb-body{padding:14px 22px 30px}',
    '#R .jb-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jb-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.6vw,54px)}',
    '#R h2.jb-long{font-size:clamp(30px,8.6vw,42px)}',
    '#R .jb-lead{margin-top:18px}',
    /* telefon: brojevi gore u dva stupca, "Bar · restoran · terasa" ispod preko cijele širine */
    '#R .jb-facts{display:grid;grid-template-columns:1fr 1fr;row-gap:16px;margin-top:24px!important}',
    '#R .jb-facts li{padding:2px 0 2px 16px!important}',
    '#R .jb-facts b{font-size:23px;height:23px}',
    '#R .jb-facts .jb-f-txt{grid-column:1 / -1;order:3;border-left:0;padding:14px 0 0!important;border-top:1px solid rgba(255,255,255,.12)}',
    '#R .jb-facts .jb-f-txt b{font-size:15px}',
    '#R .jb-facts small{font-size:9px;letter-spacing:1px}',
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
    /* ugao strane se podigne na mišu (poziv na listanje) */
    '#L .jb-ear{-webkit-backface-visibility:hidden;backface-visibility:hidden;transition:width .3s cubic-bezier(.2,.7,.2,1),height .3s cubic-bezier(.2,.7,.2,1);',
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
  ].concat(LEAF.map(function (s) { return s.replace(/#B/g, '#L'); }), LEAF.map(function (s) { return s.replace(/#B/g, '#R'); }))
    .join('\n').replace(/#R/g, '#jb-bar').replace(/#L/g, '#jb-meni').replace(/#V/g, '#jb-vid');
  // podloga menija u kadru: uvijek vidljiva (sjenka na fotografiji); mora doći poslije opšteg pravila za listove
  // povez lijevo (meni je okrenut prema tekstu desno) i rubovi strana desno su tanke ivice podloge
  CSS += '\n#jb-bar .jb-fb .jb-under--r{display:block;box-shadow:-3px 0 0 #1d1d1d,-4px 0 0 rgba(255,255,255,.07),0 34px 50px -22px rgba(0,0,0,.85),22px 30px 70px rgba(0,0,0,.42)}' +
    '\n#jb-bar .jb-fb .jb-under--r.has-more{box-shadow:-3px 0 0 #1d1d1d,-4px 0 0 rgba(255,255,255,.07),1px 1px 0 rgba(214,206,192,.5),2px 2px 0 #2b2926,3px 2px 0 rgba(200,192,178,.38),0 34px 50px -22px rgba(0,0,0,.85),22px 30px 70px rgba(0,0,0,.42)}';

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
    phone: svg('<path d="M6.6 3.8 L9.2 3.6 L10.6 7.6 L8.7 9 C9.6 11.2 11.6 13.4 14.1 14.6 L15.6 12.8 L19.6 14.2 L19.4 16.9 C19.3 18.4 18 19.6 16.4 19.4 C9.9 18.8 4.7 13.6 4.1 7.1 C3.9 5.5 5.1 4 6.6 3.8 Z" ' + S + '/>'),
    play: svg('<circle cx="12" cy="12" r="8.6" ' + S + '/><path d="M10.2 8.9 L15.2 12 L10.2 15.1 Z" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    zoom: svg('<circle cx="10.5" cy="10.5" r="6" ' + S + '/><path d="M15 15 L20 20 M10.5 8 V13 M8 10.5 H13" ' + S + '/>'),
    unzoom: svg('<circle cx="10.5" cy="10.5" r="6" ' + S + '/><path d="M15 15 L20 20 M8 10.5 H13" ' + S + '/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon); oba su već HTML
  function lbl(l, s) { return l === s ? l : '<span class="jb-l">' + l + '</span><span class="jb-s">' + s + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function pad(k) { return (k < 10 ? '0' : '') + k; }
  function cssUrl(u) { return 'url("' + String(u).replace(/["\\\n]/g, encodeURIComponent) + '")'; }
  function now() { return w.performance && performance.now ? performance.now() : Date.now(); }
  // YouTube ID iz linka ili ugradnje (watch?v=, youtu.be/, embed/, shorts/, nocookie) ili samo ID
  function ytId(s) {
    s = String(s || '').replace(/\\\//g, '/');
    var m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:[^"'\s<>]*?&(?:amp;)?)?v=|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s.trim()) ? s.trim() : '';
  }
  // broj za prikaz: lokalno 057 270 003 (SR) ili +387 57 270 003 (EN)
  function telShow(t) {
    var x = String(t).replace(/[^\d]/g, '');
    if (x.indexOf('00387') === 0) x = x.slice(5); else if (x.indexOf('387') === 0) x = x.slice(3);
    x = x.replace(/^0/, '');
    var g = x.slice(0, 2) + ' ' + x.slice(2, 5) + ' ' + x.slice(5);
    return EN ? '+387 ' + g : '0' + g;
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
  // tri podatka: nadmorska visina i događaji (iz teksta stranice, ako postoje) + "Bar · restoran · terasa"
  function factsHTML(alt, ev) {
    var out = '';
    if (alt) out += '<li class="jb-f-alt"><b>' + esc(alt) + '<i>' + esc(T.alt[0]) + '</i></b><small>' + esc(T.alt[1]) + '</small></li>';
    out += '<li class="jb-f-txt"><b>' + T.mid[0].split(' · ').map(esc).join('<i>·</i>') + '</b><small>' + esc(T.mid[1]) + '</small></li>';
    if (ev) out += '<li class="jb-f-ev"><b>' + esc(ev) + '<i>' + esc(T.ev[0]) + '</i></b><small>' + esc(T.ev[1]) + '</small></li>';
    return out;
  }
  function rezHTML() {
    return ICON.phone + lbl(esc(T.rez) + (EN ? ': ' : ' · ') + '<em>' + esc(telShow(TEL)) + '</em>', esc(T.rezS));
  }

  /* ---------- crtanje ---------- */
  function bgImg(p, k) {
    return '<img class="jb-bg' + (k ? '' : ' is-on') + '" data-k="' + k + '" src="' + esc(p.full) + '" srcset="' + esc(p.md) + ' 1000w, ' + esc(p.full) + ' ' + p.w + 'w" sizes="100vw"' +
      ' alt="' + esc(p.alt) + '"' + (k ? ' aria-hidden="true"' : '') + ' style="object-position:' + p.pos + ';--mpos:' + p.mpos + ';--lum:' + p.lum + '" decoding="async" loading="lazy">';
  }
  root.innerHTML =
    '<section class="jb-wrap" aria-labelledby="jb-h"><div class="jb-frame">' +
      '<div class="jb-bgs">' + PHOTOS.map(bgImg).join('') + '<span class="jb-tint"></span><span class="jb-scrim"></span><span class="jb-light"></span></div>' +
      '<button type="button" class="jb-book" aria-haspopup="dialog">' +
        '<span class="jb-bk-in"><span class="jb-bk-floor"></span><span class="jb-bk-lift"><span class="jb-bk"><span class="jb-fb"></span></span></span></span>' +
        '<span class="jb-cap"><b>' + ICON.book + '<span><span class="jb-cap-t"></span><span class="jb-cap-n"></span></span></b><small><span class="jb-cm">' + esc(T.capM) + '</span><span class="jb-ct">' + esc(T.capT) + '</span></small></span>' +
      '</button>' +
      '<div class="jb-body">' +
        '<div class="jb-kicker jb-up" style="--d:.26s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jb-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jb-lead jb-up" style="--d:.72s">' + esc(T.lead) + '</p>' +
        '<ul class="jb-facts jb-up" style="--d:.82s">' + factsHTML(T.altV, T.evV) + '</ul>' +
        '<div class="jb-acts jb-up" style="--d:.94s">' +
          '<a class="jb-btn jb-btn--solid" href="tel:' + esc(TEL) + '" data-jb="rezervacija"></a>' +
          '<button type="button" class="jb-btn jb-btn--ghost" data-jb="video" aria-haspopup="dialog">' + ICON.play + lbl(esc(T.video), esc(T.videoS)) + '</button>' +
        '</div>' +
        '<a class="jb-more jb-up" style="--d:1.02s" href="' + esc(PAGE) + '" data-jb="stranica">' + esc(T.more) + ICON.arrow + '</a>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  function setTel(t) {
    TEL = t;
    var a = q('a[data-jb="rezervacija"]');
    a.setAttribute('href', 'tel:' + TEL.replace(/[^\d+]/g, ''));
    a.setAttribute('aria-label', T.rezAria + ' ' + telShow(TEL));
    a.innerHTML = rezHTML();
  }
  setTel(TEL);

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

  /* ---------- zajedničko za oba prozora preko ekrana: fokus ostaje unutra, Esc zatvara, stranica ispod ne skroluje ---------- */
  var htmlOverflow = '', modal = null;
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
     KNJIGA — zajednički mehanizam listanja (meni u kadru i meni preko ekrana)
     Jedna strana (single) ili otvorena knjiga (spread; list = dvije strane jednog papira). t = broj okrenutih listova.
     List se okreće oko poveza (rotateY 0 → -180°) i savija se u dva dijela (spoljni dio prednjači), uz svjetlo/sjenku
     na listu i sjenku na stranama ispod.
     ===================================================================== */
  function makeBook(el, o) {
    var B = { el: el, mode: '', t: 0, m: 0, leaves: [], anim: null, built: '', auto: false };
    var stage = o.stage || el;
    function src(p) { return (o.small ? MENU_S : MENU)[p]; }
    function face(cls, h, p) {
      return '<span class="jb-face ' + cls + (p < 0 ? ' jb-face--blank' : '') + '" data-h="' + h + '"' + (p < 0 ? '' : ' data-p="' + p + '"') + '></span>';
    }
    B.build = function (mode) {
      var n = MENU.length, m = mode === 'spread' ? Math.ceil(n / 2) : n, html = '';
      for (var j = 0; j < m; j++) {
        var a = mode === 'spread' ? 2 * j : j, b = mode === 'spread' && 2 * j + 1 < n ? 2 * j + 1 : -1;
        html += '<span class="jb-leaf" data-j="' + j + '"><span class="jb-seg jb-seg--in">' + face('jb-face--f', 0, a) + face('jb-face--b', 1, b) +
          '<span class="jb-seg jb-seg--out">' + face('jb-face--f', 1, a) + face('jb-face--b', 0, b) + '<i class="jb-ear"></i></span></span></span>';
      }
      el.innerHTML = '<span class="jb-under jb-under--l"></span><span class="jb-under jb-under--r"></span>' + html +
        '<span class="jb-cast jb-cast--l"></span><span class="jb-cast jb-cast--r"></span>';
      B.mode = mode; B.m = m; B.anim = null; B.built = mode + ':' + MENU.join('|');
      B.leaves = [].slice.call(el.querySelectorAll('.jb-leaf')).map(function (x) {
        return { el: x, out: x.querySelector('.jb-seg--out'), faces: [].slice.call(x.querySelectorAll('.jb-face[data-p]')), loaded: false };
      });
      B.castL = el.querySelector('.jb-cast--l'); B.castR = el.querySelector('.jb-cast--r');
      B.underL = el.querySelector('.jb-under--l'); B.underR = el.querySelector('.jb-under--r');
      el.classList.toggle('jb-spread', mode === 'spread'); el.classList.toggle('is-single', mode !== 'spread');
      B.t = Math.max(0, Math.min(B.t, B.maxT()));
    };
    B.maxT = function () { return B.mode === 'spread' ? B.m : B.m - 1; };
    // slike se učitavaju samo za listove oko otvorenih strana
    B.load = function (all) {
      var lo = all ? 0 : Math.max(0, B.t - 2), hi = all ? B.m - 1 : Math.min(B.m - 1, B.t + 2);
      for (var j = lo; j <= hi; j++) {
        var L = B.leaves[j];
        if (L.loaded) continue;
        L.loaded = true;
        L.faces.forEach(function (f) { f.style.backgroundImage = cssUrl(src(+f.getAttribute('data-p'))); });
      }
    };
    // zatvorena knjiga je centrirana (korica ili zadnja korica); samo na dvije strane
    B.shift = function (t) {
      if (B.mode !== 'spread') return 'none';
      return t === 0 ? 'translateX(-25%)' : t === B.m ? 'translateX(25%)' : 'none';
    };
    function unders(a, b) {
      var sp = B.mode === 'spread', lo = Math.min(a, b), hi = Math.max(a, b);
      B.underL.classList.toggle('is-on', sp && hi > 0);
      B.underL.classList.toggle('has-more', sp && lo > 1);
      B.underR.classList.toggle('is-on', !sp || lo < B.m);
      B.underR.classList.toggle('has-more', hi < B.m - 1);
    }
    // mirno stanje: okrenuti listovi lijevo (-180°), ostali desno
    B.render = function () {
      var t = B.t, m = B.m, sp = B.mode === 'spread';
      B.leaves.forEach(function (L, j) {
        var f = j < t, z = -.5 * (f ? t - 1 - j : j - t);   // dublje od otvorenih strana
        L.el.style.transform = 'translateZ(' + z + 'px)' + (f ? ' rotateY(-180deg)' : '');
        L.out.style.transform = 'none';
        L.el.style.setProperty('--s', 0);
        L.el.style.zIndex = f ? j + 1 : m - j + 1;
        L.el.classList.toggle('is-top', j === t);
        // dalje od otvorenih strana ništa se ne crta; na jednoj strani okrenuti list nestaje lijevo
        L.el.classList.toggle('is-off', Math.abs(j - t) > 2 || (!sp && f));
      });
      B.castL.style.opacity = 0; B.castR.style.opacity = 0;
      unders(t, t);
      el.style.transform = B.shift(t);
      stage.classList.toggle('can-next', t < B.maxT());
      B.load(false);
      if (o.onRender) o.onRender(B);
    };
    // jedan kadar okreta: p = 0 (desno) … 1 (lijevo); spoljni dio lista prednjači u smjeru okreta
    B.pose = function (j, p, dir) {
      var L = B.leaves[j], s = Math.sin(p * Math.PI);
      L.el.classList.remove('is-off');
      L.el.style.zIndex = 200;
      L.el.style.transform = 'translateZ(1px) rotateY(' + (-180 * p).toFixed(2) + 'deg)';
      L.out.style.transform = 'rotateY(' + (-dir * 32 * s).toFixed(2) + 'deg)';
      L.el.style.setProperty('--s', s.toFixed(3));
      B.castR.style.opacity = p < .5 ? (s * .9).toFixed(3) : 0;
      B.castL.style.opacity = p >= .5 && B.mode === 'spread' ? (s * .9).toFixed(3) : 0;
    };
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    // animacija od p0 do p1; commit = list ostaje okrenut, inače se vraća
    B.animate = function (j, dir, p0, p1, commit) {
      var dur = reduced ? 0 : Math.max(220, 820 * Math.abs(p1 - p0)), t0 = now();
      stage.classList.add('is-anim');
      B.anim = { j: j, dir: dir, commit: commit, raf: 0, auto: B.auto };
      B.auto = false;
      if (commit) { var nt = B.t + dir; el.style.transform = B.shift(nt); unders(B.t, nt); }
      function step() {
        if (!B.anim) return;
        var k = dur ? Math.min(1, (now() - t0) / dur) : 1;
        B.pose(j, p0 + (p1 - p0) * ease(k), dir);
        if (k < 1) B.anim.raf = w.requestAnimationFrame(step); else B.finish();
      }
      step();
    };
    B.finish = function () {
      var a = B.anim; if (!a) return;
      if (a.raf) w.cancelAnimationFrame(a.raf);
      B.anim = null;
      if (a.commit) B.t += a.dir;
      stage.classList.remove('is-anim');
      B.render();
      if (a.commit && o.onCommit) o.onCommit(a);
    };
    B.flip = function (dir) {
      if (B.anim) B.finish();
      if (dir > 0 && B.t >= B.maxT()) return false;
      if (dir < 0 && B.t <= 0) return false;
      B.animate(dir > 0 ? B.t : B.t - 1, dir, dir > 0 ? 0 : 1, dir > 0 ? 1 : 0, true);
      return true;
    };
    B.go = function (t) {
      if (B.anim) B.finish();
      B.t = Math.max(0, Math.min(B.maxT(), t)); B.render();
    };
    return B;
  }

  /* ---------- MENI U KADRU: leži na stolu i podiže se dok se skrolom dolazi do sekcije; klik otvara meni preko ekrana ---------- */
  var bookEl = q('.jb-book');
  function capUpdate(B) {
    q('.jb-cap-t').textContent = T.book;
    q('.jb-cap-n').textContent = ' · ' + MENU.length + ' ' + T.pages;   // na telefonu se ne prikazuje
    bookEl.setAttribute('aria-label', T.bookAria + ' (' + MENU.length + ' ' + T.pages + ')');
  }
  var FB = makeBook(q('.jb-fb'), { small: true, stage: bookEl, onRender: capUpdate });
  function buildFrameBook() { FB.t = 0; FB.build('single'); FB.render(); }
  buildFrameBook();
  // poslije podizanja se korica jednom odškrine (poziv na listanje)
  function peek() {
    if (reduced || FB.anim) return;
    var t0 = now(), dur = 1700;
    (function stp() {
      if (FB.anim) return;
      var k = Math.min(1, (now() - t0) / dur);
      FB.pose(0, .2 * Math.sin(Math.PI * k), 1);
      if (k < 1) w.requestAnimationFrame(stp); else FB.render();
    })();
  }
  // podizanje sa stola prati skrol: sredina menija na dnu ekrana = leži (0), na ~52 % visine ekrana = stoji (1)
  (function lift() {
    var raf = 0, last = -1, peeked = false;
    if (reduced) { bookEl.style.setProperty('--k', 1); return; }
    function upd() {
      raf = 0;
      var vh = w.innerHeight || d.documentElement.clientHeight, r = bookEl.getBoundingClientRect(), cy = r.top + r.height / 2;
      var k = Math.min(1, Math.max(0, (vh * 1.02 - cy) / (vh * .5)));
      k = 1 - Math.pow(1 - k, 2.2);
      if (k > .985 && !peeked && root.classList.contains('jb-on')) { peeked = true; setTimeout(peek, 450); }
      if (Math.abs(k - last) < .001) return; last = k;
      bookEl.style.setProperty('--k', k.toFixed(3));
    }
    function req() { if (!raf) raf = w.requestAnimationFrame(upd); }
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    root.__jbLift = req;
    req();
  })();

  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jb], .jb-book');
    if (!b) return;
    if (b === bookEl) { rOpen(bookEl, 0); return; }
    var k = b.getAttribute('data-jb');
    if (k === 'video') vOpen();
    else if (k === 'rezervacija') track('bar_rezervacija', { nacin: 'telefon' });
    else if (k === 'stranica') track('bar_klik', { cilj: 'stranica' });
  });

  /* ---------- smjena fotografija u pozadini (nova se upali iz mraka; bez zumiranja) ---------- */
  var BG = { cur: 0, timer: 0, vis: false, on: false };
  var AUTO = PHOTOS.length > 1 && !reduced && 'IntersectionObserver' in w;
  function bgHold() { return !BG.vis || !BG.on || d.hidden || !!modal; }
  function bgGo() {
    clearTimeout(BG.timer); BG.timer = 0;
    if (!AUTO || bgHold()) return;
    BG.timer = setTimeout(function () { bgShow(BG.cur + 1); }, DUR);
  }
  function bgShow(k) {
    var n = PHOTOS.length; k = (k % n + n) % n; BG.cur = k;
    qa('.jb-bg').forEach(function (im) {
      var a = +im.getAttribute('data-k') === k;
      if (a) { im.loading = 'eager'; im.removeAttribute('aria-hidden'); } else im.setAttribute('aria-hidden', 'true');
      im.classList.toggle('is-on', a);
    });
    var nx = q('.jb-bg[data-k="' + ((k + 1) % n) + '"]'); if (nx) nx.loading = 'eager';   // sljedeća se učita na vrijeme
    bgGo();
  }
  d.addEventListener('visibilitychange', function () { bgGo(); });
  if ('IntersectionObserver' in w) new IntersectionObserver(function (es) {
    BG.vis = es[es.length - 1].isIntersecting; bgGo();
  }, { threshold: .25 }).observe(q('.jb-frame'));

  /* =====================================================================
     MENI PREKO CIJELOG EKRANA — za čitanje
     Računar: otvorena knjiga (dvije strane). Telefon/usko: jedna strana. Prevlačenje, klik na stranu, strelice, tastatura,
     "Uvećaj" za sitna slova.
     ===================================================================== */
  var R = null;
  function rBuild() {
    var el = d.createElement('div'); el.id = 'jb-meni';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', T.reader);
    el.innerHTML =
      '<div class="jb-r-bg"></div><div class="jb-r-veil"></div>' +
      '<div class="jb-r-top"><div class="jb-r-title">' + esc(T.readerT) + ' <em>· ' + esc(T.readerS) + '</em></div>' +
        '<div class="jb-r-tools"><button type="button" class="jb-r-zbtn" aria-pressed="false" aria-label="' + esc(T.zoom) + '">' + ICON.zoom + '<span>' + esc(T.zoom) + '</span></button>' +
        '<button type="button" class="jb-r-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button></div></div>' +
      '<div class="jb-r-stage" role="group" aria-label="' + esc(T.reader) + '"><div class="jb-r-fly"><div class="jb-r-book"></div></div></div>' +
      '<div class="jb-r-hint">' + esc(T.hint) + '</div>' +
      '<div class="jb-r-bar"><button type="button" class="jb-r-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
        '<div class="jb-r-ind" aria-live="polite"><span></span><i><s></s></i></div>' +
        '<button type="button" class="jb-r-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button></div>' +
      '<div class="jb-r-zoom" tabindex="0"></div>';
    d.body.appendChild(el);
    el.querySelector('.jb-r-bg').style.backgroundImage = cssUrl(ROOM);
    R = { el: el, stage: el.querySelector('.jb-r-stage'), fly: el.querySelector('.jb-r-fly'), bookEl: el.querySelector('.jb-r-book'),
      ind: el.querySelector('.jb-r-ind'), zoomBox: el.querySelector('.jb-r-zoom'), zbtn: el.querySelector('.jb-r-zbtn'),
      prev: el.querySelector('.jb-r-prev'), next: el.querySelector('.jb-r-next'), hint: el.querySelector('.jb-r-hint'), zoom: false, open: false };
    R.B = makeBook(R.bookEl, { stage: R.stage, onRender: indicator, onCommit: function (a) { if (!a.auto) { R.hint.classList.add('is-gone'); R.stage.classList.remove('jb-hint'); } } });
    R.prev.addEventListener('click', function () { R.B.flip(-1); });
    R.next.addEventListener('click', function () { R.B.flip(1); });
    el.querySelector('.jb-r-close').addEventListener('click', rClose);
    R.zbtn.addEventListener('click', function () { zoom(!R.zoom); });
    drag();
    // ugao strane se podigne kad je miš iznad desne strane (ili cijele, na jednoj strani)
    R.stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = R.bookEl.getBoundingClientRect(), x = e.clientX - r.left;
      var hot = e.clientY > r.top && e.clientY < r.bottom && x > (R.B.mode === 'spread' ? r.width / 2 : r.width * .35) && x < r.width;
      R.bookEl.classList.toggle('is-hot', hot);
    });
    R.stage.addEventListener('pointerleave', function () { R.bookEl.classList.remove('is-hot'); });
    w.addEventListener('resize', function () { if (R.open) { clearTimeout(R.rt); R.rt = setTimeout(layout, 120); } });
  }
  // strana (0-based) → broj okrenutih listova, i obrnuto (prva vidljiva strana)
  function pageToT(p) { return R.B.mode === 'spread' ? Math.min(R.B.m, Math.ceil(p / 2)) : Math.min(R.B.m - 1, p); }
  function firstPage() { return R.B.mode === 'spread' ? Math.max(0, 2 * R.B.t - 1) : R.B.t; }
  function layout() {
    var vw = w.innerWidth, vh = w.innerHeight;
    var top = vw < 761 ? 66 : Math.max(64, Math.min(84, vh * .09)), bot = vw < 761 ? 84 : Math.max(80, Math.min(100, vh * .11));
    R.el.style.setProperty('--top', top + 'px'); R.el.style.setProperty('--bot', bot + 'px');
    var aw = vw - (vw < 761 ? 24 : 80), ah = vh - top - bot - (vw < 761 ? 8 : 16);
    var pwS = Math.min(aw / 2, ah / RATIO);
    var mode = vw >= 820 && pwS >= 250 && MENU.length > 1 ? 'spread' : 'single';
    var pw = Math.floor(mode === 'spread' ? pwS : Math.min(aw, ah / RATIO, 640)), ph = Math.round(pw * RATIO);
    if (mode !== R.B.mode || R.B.built !== mode + ':' + MENU.join('|')) {
      var keep = R.B.mode ? firstPage() : 0;
      R.B.build(mode); R.B.t = pageToT(keep);
    } else if (R.B.anim) R.B.finish();
    R.B.pw = pw;
    R.bookEl.style.width = (mode === 'spread' ? 2 * pw : pw) + 'px';
    R.bookEl.style.height = ph + 'px';
    R.B.render();
  }
  function indicator(B) {
    var n = MENU.length, a, b;
    if (B.mode === 'spread') { a = Math.max(1, 2 * B.t); b = Math.min(n, 2 * B.t + 1); if (B.t === 0) b = 1; if (B.t === B.m) a = b = n; }
    else a = b = B.t + 1;
    R.ind.querySelector('span').innerHTML = esc(a === b ? pad(a) : pad(a) + '–' + pad(b)) + ' <em>/ ' + pad(n) + '</em>';
    R.ind.setAttribute('aria-label', T.page + ' ' + (a === b ? a : a + '–' + b) + ' ' + T.of + ' ' + n);
    R.ind.style.setProperty('--pr', (b / n).toFixed(3));
    R.prev.disabled = B.t <= 0; R.next.disabled = B.t >= B.maxT();
    if (R.zoom) zoomFill();
  }
  // prevlačenje: strana prati prst/miš; pušteno preko trećine (ili brzo) — okrene se, inače se vrati. Kratak dodir = klik
  function drag() {
    var s0 = null;
    R.stage.addEventListener('pointerdown', function (e) {
      if (R.zoom || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (R.B.anim) R.B.finish();
      var r = R.bookEl.getBoundingClientRect();
      if (e.clientX < r.left - 30 || e.clientX > r.right + 30 || e.clientY < r.top - 30 || e.clientY > r.bottom + 30) return;
      s0 = { x: e.clientX, y: e.clientY, id: e.pointerId, dir: 0, j: -1, p: 0, h: [[Date.now(), e.clientX]] };
      s0.side = R.B.mode === 'spread' ? (e.clientX > r.left + r.width / 2 ? 1 : -1) : (e.clientX > r.left + r.width * .35 ? 1 : -1);
      try { R.stage.setPointerCapture(e.pointerId); } catch (er) {}
    });
    R.stage.addEventListener('pointermove', function (e) {
      if (!s0 || e.pointerId !== s0.id) return;
      var dx = e.clientX - s0.x, t = Date.now(), B = R.B;
      // brzina se mjeri samo na zadnjih ~100 ms pokreta (brzo "bacanje" strane je okreće i kad je pomak mali)
      s0.h.push([t, e.clientX]); while (s0.h.length > 2 && t - s0.h[0][0] > 100) s0.h.shift();
      if (!s0.dir) {
        if (Math.abs(dx) < 8) return;
        // na dvije strane smjer određuje strana koju je uhvatio; na jednoj strani smjer prevlačenja
        s0.dir = B.mode === 'spread' ? s0.side : (dx < 0 ? 1 : -1);
        if ((s0.dir > 0 && B.t >= B.maxT()) || (s0.dir < 0 && B.t <= 0)) { s0.dir = 0; s0.dead = true; return; }
        s0.j = s0.dir > 0 ? B.t : B.t - 1;
        R.stage.classList.add('is-drag');
      }
      if (s0.dead) return;
      var span = B.pw * (B.mode === 'spread' ? 1.7 : 1.15);
      s0.p = s0.dir > 0 ? Math.min(1, Math.max(0, -dx / span)) : 1 - Math.min(1, Math.max(0, dx / span));
      B.pose(s0.j, s0.p, s0.dir);
    });
    function end(e) {
      if (!s0 || e.pointerId !== s0.id) return;
      var s = s0; s0 = null;
      R.stage.classList.remove('is-drag');
      if (!s.dir) {   // klik/dodir na stranu
        if (!s.dead && Math.abs(e.clientX - s.x) < 8 && Math.abs(e.clientY - s.y) < 8) R.B.flip(s.side);
        return;
      }
      var h0 = s.h[0], t = Date.now(), v = t - h0[0] > 140 ? 0 : (e.clientX - h0[1]) / Math.max(16, t - h0[0]);   // px/ms
      var done = s.dir > 0 ? (s.p > .32 || v < -.6) : (s.p < .68 || v > .6);
      if (done) R.B.animate(s.j, s.dir, s.p, s.dir > 0 ? 1 : 0, true);
      else R.B.animate(s.j, s.dir, s.p, s.dir > 0 ? 0 : 1, false);
    }
    R.stage.addEventListener('pointerup', end);
    R.stage.addEventListener('pointercancel', end);
  }
  // uvećanje: vidljive strane kao prave slike (čitljiva sitna slova), skrol i štipanje
  function visiblePages() {
    var B = R.B, n = MENU.length, out = [];
    if (B.mode === 'spread') { if (B.t > 0) out.push(2 * B.t - 1); if (2 * B.t < n && B.t < B.m) out.push(2 * B.t); }
    else out.push(B.t);
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
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); R.B.flip(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); R.B.flip(-1); }
    else if (e.key === 'Home') { e.preventDefault(); R.B.go(0); }
    else if (e.key === 'End') { e.preventDefault(); R.B.go(R.B.maxT()); }
    else if (e.key === 'Tab') trap(R.el, e);
  }
  var rBack = null;
  function rOpen(from, page) {
    if (!MENU.length) return;
    if (!R) rBuild();
    rBack = d.activeElement;
    page = Math.max(0, Math.min(MENU.length - 1, page || 0));
    R.open = true; modal = 'meni'; bgGo();
    if (R.zoom) zoom(false);
    lockScroll(true);
    R.el.classList.add('is-shown');
    R.bookEl.style.transition = 'none';
    layout();
    R.B.t = pageToT(page); R.B.render();
    void R.bookEl.offsetWidth;
    // meni "doleti" sa mjesta u kadru: strana koja je bila u kadru dođe na svoje mjesto u otvorenoj knjizi
    var src = from === bookEl ? q('.jb-fb') : null;
    if (src && !reduced) {
      var a = src.getBoundingClientRect(), fb = R.bookEl.getBoundingClientRect(), sp = R.B.mode === 'spread';
      // na dvije strane: korica i strane sa neparnim rednim brojem stoje desno, ostale lijevo
      var right = !sp || page === 0 || page % 2 === 0, cw = sp ? fb.width / 2 : fb.width;
      var cx = !sp ? fb.left : (right ? fb.left + fb.width / 2 : fb.left);
      R.fly.style.transition = 'none';
      R.fly.style.transform = 'translate(' + (a.left + a.width / 2 - (cx + cw / 2)) + 'px,' + (a.top + a.height / 2 - (fb.top + fb.height / 2)) + 'px) scale(' + (a.width / cw).toFixed(3) + ')';
      void R.fly.offsetWidth;
      R.fly.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1)';
      R.fly.style.transform = 'none';
    } else { R.fly.style.transition = 'none'; R.fly.style.transform = 'none'; }
    R.bookEl.style.transition = '';
    void R.el.offsetWidth; R.el.classList.add('is-open');
    R.hint.classList.remove('is-gone');
    R.el.querySelector('.jb-r-next').focus({ preventScroll: true });
    d.addEventListener('keydown', rKey);
    clearTimeout(R.ot);
    // od korice na računaru: korica se sama otvori; inače se ugao kratko podigne kao poziv na listanje
    if (R.B.mode === 'spread' && R.B.t === 0) R.ot = setTimeout(function () { if (R.open && R.B.t === 0 && !R.B.anim) { R.B.auto = true; R.B.flip(1); } }, reduced ? 0 : 760);
    else if (!reduced) R.ot = setTimeout(function () { R.stage.classList.add('jb-hint'); setTimeout(function () { R.stage.classList.remove('jb-hint'); }, 1100); }, 700);
    track('bar_meni', { strana: MENU.length });
  }
  function rClose() {
    if (!R || !R.open) return;
    R.open = false; modal = null; clearTimeout(R.ot);
    d.removeEventListener('keydown', rKey);
    if (R.B.anim) R.B.finish();
    R.el.classList.remove('is-open');
    lockScroll(false);
    setTimeout(function () { if (!R.open) { R.el.classList.remove('is-shown'); if (R.zoom) zoom(false); } }, 360);
    if (rBack && rBack.focus) rBack.focus({ preventScroll: true });
    bgGo();
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
    vBack = d.activeElement; modal = 'video'; bgGo();
    V.querySelector('.jb-v-box').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(YT) +
      '?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="' + esc(T.vid) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    lockScroll(true);
    V.classList.add('is-shown'); void V.offsetWidth; V.classList.add('is-open');
    V.querySelector('button').focus();
    d.addEventListener('keydown', vKey);
    track('bar_video', {});
  }
  function vClose() {
    d.removeEventListener('keydown', vKey);
    V.classList.remove('is-open'); modal = null;
    lockScroll(false);
    setTimeout(function () { if (!V.classList.contains('is-open')) { V.classList.remove('is-shown'); V.querySelector('.jb-v-box').innerHTML = ''; } }, 320);
    if (vBack && vBack.focus) vBack.focus({ preventScroll: true });
    bgGo();
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica Olimpijski bar + meni iz Medija ---------- */
  // EN stranice prvo pitaju /en/wp-json (qTranslate tada vraća engleski), pa obični put, pa ?rest_route= rezerva
  var bases = (EN ? [O + '/en/wp-json/'] : []).concat([O + '/wp-json/', O + '/?rest_route=/']);
  // JSON iz odgovora; kad WordPress (prikaz PHP grešaka) ili neki dodatak ispiše tekst prije ili poslije podataka
  // (Safari tada javlja "The string did not match the expected pattern"), podaci se izvade iz sredine
  function json(t, path) {
    try { return JSON.parse(t); } catch (e) {}
    var ss = [t.indexOf('[{"'), t.indexOf('{"'), t.indexOf('[]')].filter(function (x) { return x >= 0; }).sort(function (a, b) { return a - b; });
    var es = [t.lastIndexOf(']'), t.lastIndexOf('}')].sort(function (a, b) { return b - a; });
    for (var i = 0; i < ss.length; i++) for (var k = 0; k < es.length; k++)
      if (es[k] > ss[i]) try { return JSON.parse(t.slice(ss[i], es[k] + 1)); } catch (e) {}
    var snip = clean(String(t).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ')).slice(0, 110);
    throw new Error('odgovor nije JSON · ' + path + (snip ? ': „' + snip + '“' : ' (prazan)'));
  }
  function api(path, query) {
    var i = 0, first = null;
    function attempt(err) {
      if (err && !first && err.message !== 'REST') first = err;   // admin vidi prvi (najkorisniji) razlog
      if (i >= bases.length) return Promise.reject(first || err);
      var b = bases[i++], url = b + 'wp/v2/' + path + (b.indexOf('?') > -1 ? '&' : '?') + query;
      return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' · ' + path);
          return r.text().then(function (t) { return json(t, path); });
        })
        .then(function (j) { bases = [b].concat(bases.filter(function (x) { return x !== b; })); return j; }, attempt);
    }
    return attempt(new Error('REST'));
  }
  function parse(pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var txt = clean(b.textContent), m, alt = '', ev = '';
    if ((m = txt.match(/(\d{1,2}[.,]?\d{3})\s*(?:metara|metres|meters|m)\b/i))) alt = m[1];
    if ((m = txt.match(/(?:više\s+od|preko|over|more\s+than)\s+(\d+)\s+(?:događaj\w*|manifestacij\w*|events?)/i))) ev = m[1];
    var tl = b.querySelector('a[href^="tel:"]');
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    return {
      id: pg.id, link: link, ps: ps, alt: alt, ev: ev, yt: ytId(raw), tel: tl ? tl.getAttribute('href').slice(4).trim() : '',
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
    return Object.keys(by).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return by[k]; });
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
      // nadmorska visina i broj događaja samo ako ih tekst stranice ima (kad se tekst promijeni, mijenjaju se i ovdje)
      var fl = q('.jb-facts'), fh = factsHTML(r.alt, r.ev);
      if (fl.innerHTML !== fh) fl.innerHTML = fh;
      if (r.link) q('a[data-jb="stranica"]').setAttribute('href', r.link);
      if (!YT_FIXED) { if (r.yt) YT = r.yt; else miss.push('video'); }
      if (!TEL_FIXED && r.tel && r.tel.replace(/[^\d]/g, '').length >= 8) setTel(r.tel);
    } else miss.push('stranica (' + (r && r.err && r.err.message || 'REST') + ')');
    if (mn && !mn.err && mn.length >= 2) {
      var urls = mn.map(function (x) { return x.url; });
      if (urls.join('|') !== MENU.join('|')) {
        MENU = urls; MENU_S = mn.map(function (x) { return x.small; });
        if (mn[0].ratio > 1 && mn[0].ratio < 2) RATIO = mn[0].ratio;
        buildFrameBook();
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

  // ulazak jednom, kad kadar dođe u vidno polje; poslije toga se korica menija jednom odškrine i kreće smjena fotografija
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jb-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jb-on'); io.disconnect();
        setTimeout(function () { if (root.__jbLift) root.__jbLift(); }, 1200);   // meni već stoji → korica se odškrine
        setTimeout(function () { BG.on = true; bgGo(); }, 1800);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(q('.jb-frame'));
  } else { BG.on = true; bgGo(); }
})(window, document);
