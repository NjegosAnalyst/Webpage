/* =====================================================================
   JAHORINA — SNOWBOARD PARK I SKI BIKE (početna, ispod Ski depoa) · v1 "razdjelnik"
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, fotografija
   u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · cik-cak sa Ski depoom iznad (tamo tekst desno): ovdje je tekst lijevo, a desno u kadru fotografija;
     · DVIJE PONUDE U JEDNOM KADRU: desno su dvije fotografije (snowboard park i ski bike) razdvojene tankom svijetlom
       linijom sa okruglim dugmetom. Prevlačenjem lijevo/desno (miš, prst, bilo gdje na fotografiji) otkriva se jedna
       ili druga ponuda: fotografija se otkriva iza linije, a tekst lijevo se mijenja zajedno sa pokretom. Pušteno
       "sjedne" na bližu stranu (ili na stranu brzog poteza). Iza linije uvijek viri druga ponuda sa svojim natpisom;
     · nadnaslov su dva natpisa (Snowboard park | Ski bike), klik prebacuje; tastatura: strelice na dugmetu linije;
     · ulazak (jednom): kadar sjedne, park izađe iz mraka, tekst se podigne, linija se otvori i jednom se blago
       pomjeri (pokaže da se prevlači).

   SADRŽAJ JE IZ WORDPRESSA (dvije stranice: data-park i data-bike = slug; ako slug ne postoji, traži se stranica sa
   "snowboard", odnosno "bike" u naslovu): uvod = prva rečenica o samom parku/vožnji; površina (m²), staza i naselje
   (park), cijena i staza (ski bike) iz teksta; fotografije sa stranice idu u galeriju; "Više o …" = link stranice.
   Dok WordPress ne odgovori, stoji ugrađeni tekst (park: stranica od 9. 10. 2026; ski bike: radni tekst dok stranica
   ne stigne). Prijavljeni admin vidi razlog kad nešto nedostaje.

   Ugradnja: Elementor HTML widget sa <div id="jsb-park"></div> + ovaj fajl sa jsDelivr-a (slike/ iz istog commita).
   Podešavanja na <div id="jsb-park"> (sva su neobavezna):
     data-park="snowboard-park"   (slug stranice snowboard parka)
     data-bike="ski-bike"         (slug stranice ski bike-a)
     data-pocetak="bike"          (blok počinje od ski bike-a; podrazumijevano park)
   GA: prebacivanje → park_prebaci (ponuda, nacin: prevlacenje | klik | tastatura), "Više o …" → park_klik (cilj:
       stranica, ponuda), Galerija → park_galerija (ponuda).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jsb-park');
  if (!root || root.__jsb) return;
  root.__jsb = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var K = ['park', 'bike'];
  var SLUG = { park: opt('park', 'snowboard-park').replace(/^\/+|\/+$/g, ''), bike: opt('bike', 'ski-bike').replace(/^\/+|\/+$/g, '') };
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ACT = opt('pocetak', 'park') === 'bike' ? 1 : 0;

  // ugrađeni tekst: park = stranica snowboard parka (9. 10. 2026); ski bike = radni tekst dok stranica ne stigne;
  // naslovi i kratki natpisi su dizajn; EN je prevod
  var T = EN ? {
    tabs: 'Snowboard park or ski bike', drag: 'Drag', more: 'More', gal: 'Gallery',
    knob: ['Show the ski bike (drag left)', 'Show the snowboard park (drag right)'],
    park: { name: 'Snowboard park', h: ['Snowboard', 'park'], more: 'More about the park', moreS: 'Learn more',
      lead: 'This truly authentic mountain gives snowboarders a space they could only dream of until now, and it is reserved just for them.',
      fArea: 'Park area', fSlope: 'Slope', fNear: 'Near the chalet village', photos: ['Snowboarder in a burst of powder in front of a wooden fence, blue sky'] },
    bike: { name: 'Ski bike', h: ['Ski', 'bike'], more: 'More about the ski bike', moreS: 'Learn more',
      lead: 'A bike with skis instead of wheels: take a seat, grab the handlebars and ride down a groomed slope. It is easy to learn, so it is fun even for non-skiers.',
      fPrice: 'Rental', fSlope: 'Slope', per: { h: 'per hour', d: 'per day', r: 'per ride' },
      base: [{ v: '2 skis', l: 'Instead of wheels' }, { v: 'Handlebars', l: 'Rides like a bike' }, { v: 'Suspension', l: 'For a softer ride' }],
      photos: ['Ski bike in action: the rider carves a turn and sprays snow, a chairlift above', 'Rider on a white ski bike with two skis, helmet and goggles'] },
    galT: 'Photos', photo: 'Photo', prev: 'Previous photo', next: 'Next photo', close: 'Close',
    why: 'WordPress', whyTail: 'showing built-in content'
  } : {
    tabs: 'Snowboard park ili ski bike', drag: 'Prevucite', more: 'Više', gal: 'Galerija',
    knob: ['Prikaži ski bike (prevucite ulijevo)', 'Prikaži snowboard park (prevucite udesno)'],
    park: { name: 'Snowboard park', h: ['Snowboard', 'park'], more: 'Više o snowboard parku', moreS: 'Saznaj više',
      lead: 'Ova, po mnogo čemu autentična, planina podariće ljubiteljima snowboarding-a prostor o kojem su do sada mogli samo da sanjaju, i to – rezervisan samo za njih.',
      fArea: 'Površina parka', fSlope: 'Staza', fNear: 'Kod vikend naselja', photos: ['Snowboarder u oblaku snijega ispred drvene ograde, plavo nebo'] },
    bike: { name: 'Ski bike', h: ['Ski', 'bike'], more: 'Više o ski bike-u', moreS: 'Saznaj više',
      lead: 'Bicikl sa skijama umjesto točkova: sjednete, uhvatite volan i spuštate se niz uređenu stazu. Lako se savlada, pa je zabava i za one koji ne skijaju.',
      fPrice: 'Najam', fSlope: 'Staza', per: { h: 'po satu', d: 'po danu', r: 'po vožnji' },
      base: [{ v: '2 skije', l: 'Umjesto točkova' }, { v: 'Volan', l: 'Vozi se kao bicikl' }, { v: 'Amortizer', l: 'Za mekšu vožnju' }],
      photos: ['Ski bike u vožnji: vozač u zavoju podiže snijeg, iznad je žičara', 'Vozač na bijelom ski bike-u sa dvije skije, kacigom i naočarima'] },
    galT: 'Fotografije', photo: 'Fotografija', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija', close: 'Zatvori',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj'
  };
  // podaci sa stranica (ugrađeni = stranica parka od 9. 10. 2026); WordPress ih zamijeni kad se tekst promijeni
  var DATA = {
    park: { lead: T.park.lead, facts: [{ v: EN ? '3,000 m²' : '3.000 m²', l: T.park.fArea }, { v: 'Trnovo', l: T.park.fSlope }, { v: 'Šator', l: T.park.fNear }],
      link: O + (EN ? '/en/' : '/') + SLUG.park + '/' },
    bike: { lead: T.bike.lead, facts: T.bike.base.slice(), link: O + (EN ? '/en/' : '/') + SLUG.bike + '/' }
  };

  // fotografije: park (uspravna, uvećana iz 640 px dok ne stigne veća) i ski bike u vožnji; galerije dobiju i slike sa stranica
  var IMG = { park: HERE + 'slike/park-glavna.webp', bike: HERE + 'slike/bike-glavna.webp', bikeS: HERE + 'slike/bike-glavna-1000.webp' };
  var BASE = {
    park: [{ full: IMG.park, alt: T.park.photos[0] }],
    bike: [{ full: IMG.bike, alt: T.bike.photos[0] }, { full: HERE + 'slike/bike-portret.webp', alt: T.bike.photos[1] }]
  };
  var GAL = { park: BASE.park.slice(), bike: BASE.bike.slice() };

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsb--boxed{border-radius:28px;overflow:hidden}',
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
       Kad je Ski depo odmah iznad (.jsb--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jsb-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsb--join .jsb-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsb-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jsb-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u. --p: 0 = snowboard park, 1 = ski bike (prati prevlačenje); --open: linija se otvara pri ulasku.
       Linija stoji na --x: kod parka blizu desne ivice (iza nje viri ski bike, širine --S), kod ski bike-a na --L (odmah
       desno od teksta), pa tekst nikad nije ispod linije */
    '#R .jsb-frame{--p:0;--open:1;--L:min(calc(var(--side) + 600px),52%);--S:clamp(130px,15%,240px);',
    'position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(620px,46vw,800px);border-radius:26px;overflow:hidden;isolation:isolate;background:var(--bg);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsb-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jsb-stage{--x:calc((100% - var(--S) * var(--open)) * (1 - var(--p)) + var(--L) * var(--p));position:absolute;inset:0;z-index:0;overflow:hidden;',
    'touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}',
    '#R .jsb-stage.is-drag{cursor:grabbing}',
    /* tanak hladan odsjaj na gornjoj ivici, tamo gdje je linija */
    '#R .jsb-stage::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:5;pointer-events:none;opacity:var(--open);',
    'background:linear-gradient(90deg,transparent calc(var(--x) - 18%),rgba(226,238,255,.5) var(--x),transparent calc(var(--x) + 18%))}',
    /* dvije scene (fotografije) jedna preko druge; ski bike se vidi desno od linije */
    '#R .jsb-sc{position:absolute;inset:0;overflow:hidden}',
    '#R .jsb-sc--bike{background:var(--bg);-webkit-clip-path:inset(0 0 0 var(--x));clip-path:inset(0 0 0 var(--x))}',
    '#R .jsb-ph{position:absolute;top:0;bottom:0;right:0;left:calc(var(--L) - 90px);',
    '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 300px);mask-image:linear-gradient(90deg,transparent 0,#000 300px)}',
    '#R .jsb-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos,50% 50%);filter:saturate(.72) brightness(var(--lum,.8)) contrast(1.06)}',
    /* ista noćna obrada za obje fotografije, tamni prelaz slijeva ispod teksta (cik-cak: tekst lijevo), odozdo i vinjeta */
    '#R .jsb-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.36}',
    '#R .jsb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.92) 0,rgba(6,11,22,.82) calc(var(--L) - 150px),rgba(6,11,22,.32) calc(var(--L) + 30px),rgba(6,11,22,0) calc(var(--L) + 230px)),',
    'linear-gradient(0deg,rgba(6,11,22,.46) 0%,rgba(6,11,22,0) 26%),linear-gradient(180deg,rgba(6,11,22,.34) 0%,rgba(6,11,22,0) 16%),radial-gradient(130% 100% at 68% 50%,transparent 58%,rgba(4,8,18,.5) 100%)}',

    /* LINIJA: tanka svijetla crta sa mekim sjajem; ulazi odozgo pri otvaranju */
    '#R .jsb-seam{position:absolute;top:0;bottom:0;left:var(--x);z-index:3;width:1.5px;margin-left:-.75px;pointer-events:none;opacity:var(--open);transform:scaleY(var(--open));transform-origin:50% 0;',
    'background:linear-gradient(180deg,rgba(255,255,255,0) 0,rgba(255,255,255,.88) 14%,rgba(255,255,255,.88) 86%,rgba(255,255,255,0) 100%)}',
    '#R .jsb-seam::before{content:"";position:absolute;top:0;bottom:0;left:-11px;width:23px;',
    'background:linear-gradient(90deg,transparent,rgba(214,232,255,.13) 50%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent);mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent)}',
    /* okruglo stakleno dugme na liniji (blago ispupčeno); dok se vuče, utisne se */
    '#R .jsb-knob{all:unset;position:absolute!important;z-index:4;left:var(--x);top:50%;box-sizing:border-box!important;width:56px!important;height:56px!important;margin:-28px 0 0 -28px!important;padding:0!important;border-radius:50%!important;',
    'display:grid!important;place-items:center;cursor:ew-resize;color:#fff!important;opacity:var(--open);transform:scale(calc(.55 + var(--open) * .45));',
    'background:rgba(14,22,38,.42)!important;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2);transition:color .2s,box-shadow .25s;',
    'box-shadow:4px 4px 12px rgba(0,0,0,.45),-3px -3px 10px rgba(78,104,150,.16),inset 0 0 0 1px rgba(255,255,255,.26),inset 1px 1px 0 rgba(255,255,255,.12)!important}',
    '#R .jsb-knob svg{width:26px;height:26px}',
    '#R .jsb-knob:hover{color:var(--accent)!important;box-shadow:4px 4px 12px rgba(0,0,0,.45),-3px -3px 10px rgba(78,104,150,.16),inset 0 0 0 1px rgba(0,185,242,.5),0 0 22px rgba(0,185,242,.3)!important}',
    '#R .jsb-stage.is-drag .jsb-knob{color:var(--accent)!important;box-shadow:inset 2px 2px 6px rgba(0,0,0,.45),inset -2px -2px 5px rgba(78,104,150,.14),inset 0 0 0 1px rgba(0,185,242,.5)!important}',
    /* uputa ispod dugmeta, nestane poslije prvog prebacivanja */
    '#R .jsb-hint{position:absolute;z-index:3;left:var(--x);top:calc(50% + 42px);transform:translateX(-50%);pointer-events:none;white-space:nowrap;opacity:calc(var(--open) * .78);transition:opacity .5s ease;',
    'font:600 9.5px/1 var(--fd);letter-spacing:2.6px;text-transform:uppercase;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.8)}',
    '#R .jsb-hint.is-gone{opacity:0}',
    /* natpisi uz liniju: park lijevo od nje, ski bike desno; aktivni jači */
    '#R .jsb-lab{position:absolute;z-index:3;top:30px;left:var(--x);display:flex;align-items:center;gap:9px;pointer-events:none;white-space:nowrap;opacity:calc(var(--open) * .55);transition:opacity .45s ease;',
    'font:600 10.5px/1 var(--fd);letter-spacing:2.6px;text-transform:uppercase;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.75)}',
    '#R .jsb-lab b{font:700 10.5px/1 var(--fd);letter-spacing:1px;color:var(--accent-2)}',
    '#R .jsb-lab.is-on{opacity:var(--open)}',
    '#R .jsb-lab--park{transform:translateX(calc(-100% - 20px))}',
    '#R .jsb-lab--bike{transform:translateX(20px)}',
    '#R .jsb-m{position:absolute;top:0;width:0;height:0;visibility:hidden}',
    '#R .jsb-m0{left:calc(100% - var(--S))}',
    '#R .jsb-m1{left:var(--L)}',

    /* tekst lijevo (cik-cak sa Ski depoom iznad), poravnat sa lijevom ivicom mreže 1240px */
    '#R .jsb-body{position:relative;z-index:2;width:min(calc(var(--side) + 540px),50%);padding:clamp(56px,6vw,92px) 0 clamp(56px,6vw,92px) var(--side)}',
    /* nadnaslov = dva natpisa (park | ski bike); aktivni bijel sa tankom cyan linijom */
    '#R .jsb-tabs{display:flex;align-items:center;gap:14px;margin-bottom:24px}',
    '#R .jsb-tabs::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R .jsb-tabs > i{width:1px;height:12px;background:rgba(255,255,255,.22)}',
    '#R .jsb-tab{all:unset;position:relative!important;box-sizing:border-box!important;padding:7px 0!important;cursor:pointer;white-space:nowrap;',
    'font:600 11px/1 var(--fd)!important;letter-spacing:4px!important;text-transform:uppercase!important;color:rgba(255,255,255,.42)!important;transition:color .3s}',
    '#R .jsb-tab:hover{color:rgba(255,255,255,.8)!important}',
    '#R .jsb-tab[aria-selected="true"]{color:rgba(255,255,255,.92)!important}',
    '#R .jsb-tab::after{content:"";position:absolute;left:0;right:4px;bottom:0;height:1.5px;border-radius:2px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7);transform:scaleX(0);transform-origin:0 50%;transition:transform .5s cubic-bezier(.2,.7,.2,1)}',
    '#R .jsb-tab[aria-selected="true"]::after{transform:none}',
    /* dvije ploče teksta na istom mjestu; prelaze jedna u drugu zajedno sa linijom */
    '#R .jsb-pans{display:grid}',
    '#R .jsb-pan{grid-area:1/1;min-width:0}',
    '#R .jsb-pan--park{opacity:clamp(0,calc((.5 - var(--p)) * 3.2),1);transform:translate3d(calc(var(--p) * -28px),0,0)}',
    '#R .jsb-pan--bike{opacity:clamp(0,calc((var(--p) - .5) * 3.2),1);transform:translate3d(calc((1 - var(--p)) * 28px),0,0)}',
    '#R .jsb-pan:not(.is-on){pointer-events:none}',
    '#R h2{font-size:clamp(46px,5vw,80px);font-weight:800;line-height:.95;letter-spacing:-.025em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsb-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jsb-lead{margin-top:24px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:44ch;text-wrap:pretty}',
    /* podaci: tri kolone kao tehnički list (tanka linija gore sa kratkim cyan dijelom, vrijednost, natpis) */
    '#R .jsb-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 18px;margin-top:30px!important;width:min(100%,480px)}',
    '#R .jsb-facts:empty{display:none}',
    '#R .jsb-facts li{position:relative;padding-top:14px!important;border-top:1px solid rgba(255,255,255,.14);min-width:0}',
    '#R .jsb-facts li::before{content:"";position:absolute;left:0;top:-1px;width:22px;height:1px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7)}',
    '#R .jsb-facts b{display:block;font:700 19px/1.1 var(--fd);letter-spacing:-.01em;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}',
    '#R .jsb-facts small{display:block;margin-top:7px;font:500 12px/1.3 var(--fb);color:var(--text-3)}',
    /* dugmad kao u ostalim blokovima: bijelo glavno + stakleno sporedno, iste širine i visine, široka kao podaci */
    '#R .jsb-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:30px;width:min(100%,480px)}',
    '#R .jsb-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 16px!important;border-radius:40px!important;cursor:pointer;',
    'white-space:nowrap;font:600 13.5px/1 var(--fb)!important;letter-spacing:.2px!important}',
    '#R .jsb-btn svg{width:16px;height:16px}',
    '#R .jsb-s{display:none}',
    '#R .jsb-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6)!important;transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)!important}',
    '#R .jsb-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jsb-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)!important}',
    '#R .jsb-btn--solid:hover::after{animation:jsbShine 1.6s ease-in-out}',
    '@keyframes jsbShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jsb-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff!important}',
    '#R .jsb-btn--ghost{color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:color .2s,box-shadow .25s}',
    '#R .jsb-btn--ghost svg{color:var(--accent)}',
    '#R .jsb-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)!important}',
    '#R .jsb-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)!important}',
    '#R .jsb-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jsb-anim/jsb-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsb-anim .jsb-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsb-anim.jsb-on .jsb-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jsb-anim .jsb-sc img{opacity:0;filter:saturate(.72) brightness(.2) contrast(1.06) blur(6px)}',
    '#R.jsb-anim.jsb-on .jsb-sc img{opacity:1;filter:saturate(.72) brightness(var(--lum,.8)) contrast(1.06) blur(0);transition:opacity 1.2s ease .2s,filter 1.6s ease .2s}',
    '#R.jsb-anim .jsb-up{opacity:0;transform:translateY(20px)}',
    '#R.jsb-anim.jsb-on .jsb-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsb-anim .jsb-tabs::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsb-anim.jsb-on .jsb-tabs::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',

    /* manji laptop: uži tekst */
    '@media (max-width:1180px){#R .jsb-frame{--L:min(calc(var(--side) + 520px),53%)}#R .jsb-body{width:min(calc(var(--side) + 460px),49%)}#R .jsb-lead{max-width:40ch}#R .jsb-btn{padding:0 12px!important}',
    '#R .jsb-facts,#R .jsb-acts{width:min(100%,430px)}#R .jsb-facts b{font-size:17px}}',
    /* tablet i telefon: fotografije gore (linija ide preko cijele širine), tekst ispod */
    '@media (max-width:980px){',
    '#R .jsb-frame{--S:24%;--L:var(--S);flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jsb-stage{position:relative;inset:auto;height:min(64vw,520px);-webkit-mask-image:linear-gradient(180deg,#000 72%,transparent 100%);mask-image:linear-gradient(180deg,#000 72%,transparent 100%)}',
    '#R .jsb-ph{left:0;-webkit-mask-image:none;mask-image:none}',
    '#R .jsb-ph img{object-position:var(--mpos,var(--pos,50% 50%))}',
    '#R .jsb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 36%),linear-gradient(180deg,rgba(6,11,22,.42) 0%,rgba(6,11,22,0) 22%)}',
    '#R .jsb-lab{top:20px}',
    '#R .jsb-body{width:auto;padding:clamp(18px,3vw,30px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.4vw,64px)}',
    '#R .jsb-lead{max-width:56ch}',
    '#R .jsb-facts,#R .jsb-acts{width:min(100%,520px)}}',
    '@media (max-width:760px){',
    '#R .jsb-frame{--S:20%;border-radius:24px}',
    '#R .jsb-stage{height:min(108vw,470px)}',
    '#R .jsb-knob{width:48px!important;height:48px!important;margin:-24px 0 0 -24px!important}',
    '#R .jsb-knob svg{width:22px;height:22px}',
    '#R .jsb-hint{top:calc(50% + 36px)}',
    /* telefon: uz liniju samo natpis aktivne ponude (druga strana je uska; oba naziva su u nadnaslovu ispod) */
    '#R .jsb-lab{top:16px;gap:7px;font-size:9.5px;letter-spacing:2px}',
    '#R .jsb-lab b{font-size:9.5px}',
    '#R .jsb-lab--park{transform:translateX(calc(-100% - 14px))}',
    '#R .jsb-lab--bike{transform:translateX(14px)}',
    '#R .jsb-lab:not(.is-on){opacity:0}',
    '#R .jsb-body{padding:8px 20px 30px}',
    '#R .jsb-tabs{gap:10px;margin-bottom:16px}',
    '#R .jsb-tabs::before{width:22px}',
    '#R .jsb-tab{font-size:10px!important;letter-spacing:2.6px!important}',
    '#R h2{font-size:clamp(38px,11.4vw,54px)}',
    '#R .jsb-lead{margin-top:16px}',
    '#R .jsb-facts{margin-top:24px!important;gap:0 12px}',
    '#R .jsb-facts b{font-size:16px}',
    '#R .jsb-facts small{font-size:11.5px}',
    '#R .jsb-acts{gap:8px;margin-top:24px;width:100%}',
    '#R .jsb-btn{height:42px;padding:0 12px!important;font-size:13px!important}',
    '#R .jsb-l{display:none}',
    '#R .jsb-s{display:inline}}',
    '@media (max-width:360px){#R .jsb-acts{grid-template-columns:1fr}#R .jsb-facts b{font-size:15px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

    /* fotografije preko cijelog ekrana (iste kao u ostalim blokovima) */
    '#L{position:fixed;inset:0;z-index:2147483000;display:none;place-items:center;padding:clamp(16px,4vw,56px);background:rgba(6,11,22,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);',
    "opacity:0;transition:opacity .3s ease;color:#fff;font:400 16px/1.5 'Barlow',system-ui,sans-serif;color-scheme:dark}",
    '#L.is-shown{display:grid}',
    '#L.is-open{opacity:1}',
    '#L *{box-sizing:border-box}',
    '#L figure{position:relative;margin:0;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:min(1400px,100%);transform:scale(.97);transition:transform .35s cubic-bezier(.2,.7,.2,1);touch-action:pan-y}',
    '#L.is-open figure{transform:none}',
    '#L img{display:block;max-width:100%;max-height:calc(100vh - 150px);width:auto;height:auto;border:0;border-radius:18px;user-select:none;-webkit-user-drag:none;',
    'box-shadow:0 40px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06)}',
    "#L figcaption{font:600 11.5px/1 'Archivo',system-ui,sans-serif;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.6);font-variant-numeric:tabular-nums}",
    '#L button{all:unset;position:absolute!important;box-sizing:border-box!important;width:48px!important;height:48px!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;display:grid!important;place-items:center;cursor:pointer;',
    'color:rgba(255,255,255,.82)!important;background:#131D31!important;box-shadow:3px 3px 7px rgba(0,0,0,.45),-2px -2px 6px rgba(70,96,142,.1)!important;transition:color .2s}',
    '#L button svg{display:block;width:20px;height:20px}',
    '#L button:hover{color:#00B9F2!important}',
    '#L button:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.55),inset -2px -2px 4px rgba(70,96,142,.1)!important}',
    '#L button:focus-visible{outline:2px solid #00B9F2!important;outline-offset:3px!important}',
    '#L .jsb-lb-close{top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px)}',
    '#L .jsb-lb-prev{left:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L .jsb-lb-next{right:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L.is-one .jsb-lb-prev,#L.is-one .jsb-lb-next{display:none!important}',
    '@media (max-width:760px){#L img{max-height:calc(100vh - 210px);border-radius:14px}#L .jsb-lb-prev,#L .jsb-lb-next{top:auto;bottom:22px;transform:none}#L .jsb-lb-prev{left:calc(50% - 60px)}#L .jsb-lb-next{right:calc(50% - 60px)}}',
    '@media (prefers-reduced-motion:reduce){#L,#L figure{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jsb-park').replace(/#L/g, '#jsb-lb');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jsb-css');
  if (!st) { st = d.createElement('style'); st.id = 'jsb-css'; (d.head || d.documentElement).appendChild(st); }
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
    knob: svg('<path d="M9.6 7.4 L5 12 L9.6 16.6 M14.4 7.4 L19 12 L14.4 16.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    photos: svg('<rect x="3.5" y="6" width="13.5" height="12" rx="2.2" ' + S + '/><path d="M7 3.8 H18.3 C19.5 3.8 20.5 4.8 20.5 6 V14.6 M3.9 15.6 L8 11.6 L11 14.4 L12.8 12.8 L16.8 16.4" ' + S + '/><circle cx="12.6" cy="9.6" r="1.1" ' + S + '/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon)
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jsb-l">' + esc(l) + '</span><span class="jsb-s">' + esc(s) + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function abs(u) { try { return new URL(u, O + '/').href; } catch (e) { return u; } }
  function now() { return w.performance && performance.now ? performance.now() : Date.now(); }
  // qTranslate-XT: "[:SH]tekst[:en]text[:]" → samo jezik ove stranice (isto kao u ostalim blokovima)
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
  // rečenice teksta; tačka u broju (3.000) ne prekida rečenicu
  function sentences(p) { return (clean(p).match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]+|$)/g) || []).map(clean).filter(Boolean); }

  /* ---------- crtanje ---------- */
  function factsHTML(k) {
    return DATA[k].facts.map(function (f) { return '<li><b>' + esc(f.v) + '</b><small>' + esc(f.l) + '</small></li>'; }).join('');
  }
  function panHTML(k, i) {
    var t = T[k];
    return '<div class="jsb-pan jsb-pan--' + k + '" id="jsb-p' + i + '" role="tabpanel" aria-labelledby="jsb-t' + i + '">' +
      '<h2 id="jsb-h' + i + '"><span class="jsb-up" style="--d:.36s">' + esc(t.h[0]) + '</span><span class="jsb-o jsb-up" style="--d:.46s">' + esc(t.h[1]) + '</span></h2>' +
      '<p class="jsb-lead jsb-up" style="--d:.6s">' + esc(DATA[k].lead) + '</p>' +
      '<ul class="jsb-facts jsb-up" style="--d:.72s">' + factsHTML(k) + '</ul>' +
      '<div class="jsb-acts jsb-up" style="--d:.84s">' +
        '<a class="jsb-btn jsb-btn--solid" href="' + esc(DATA[k].link) + '" data-jsb="stranica" data-o="' + k + '">' + ICON.arrow + lbl(t.more, t.moreS) + '</a>' +
        '<button type="button" class="jsb-btn jsb-btn--ghost" data-jsb="galerija" data-o="' + k + '" aria-haspopup="dialog">' + ICON.photos + esc(T.gal) + '</button>' +
      '</div>' +
    '</div>';
  }
  root.innerHTML =
    '<section class="jsb-wrap" aria-labelledby="jsb-h' + ACT + '"><div class="jsb-frame" style="--p:' + ACT + '">' +
      '<div class="jsb-stage">' +
        '<div class="jsb-sc jsb-sc--park" style="--pos:50% 50%;--mpos:30% 50%;--lum:.74"><div class="jsb-ph">' +
          '<img src="' + esc(IMG.park) + '" alt="' + esc(T.park.photos[0]) + '" decoding="async"></div></div>' +
        '<div class="jsb-sc jsb-sc--bike" style="--pos:74% 50%;--mpos:60% 45%;--lum:.76"><div class="jsb-ph">' +
          '<img src="' + esc(IMG.bike) + '" srcset="' + esc(IMG.bikeS) + ' 1000w, ' + esc(IMG.bike) + ' 2000w" sizes="(max-width: 980px) 100vw, 62vw" alt="' + esc(T.bike.photos[0]) + '" decoding="async"></div></div>' +
        '<span class="jsb-tint"></span><span class="jsb-scrim"></span>' +
        '<span class="jsb-seam"></span>' +
        '<span class="jsb-lab jsb-lab--park" aria-hidden="true"><b>01</b>' + esc(T.park.name) + '</span>' +
        '<span class="jsb-lab jsb-lab--bike" aria-hidden="true"><b>02</b>' + esc(T.bike.name) + '</span>' +
        '<button type="button" class="jsb-knob" aria-controls="jsb-p0 jsb-p1">' + ICON.knob + '</button>' +
        '<span class="jsb-hint" aria-hidden="true">' + esc(T.drag) + '</span>' +
        '<i class="jsb-m jsb-m0"></i><i class="jsb-m jsb-m1"></i>' +
      '</div>' +
      '<div class="jsb-body">' +
        '<div class="jsb-tabs jsb-up" style="--d:.26s" role="tablist" aria-label="' + esc(T.tabs) + '">' +
          '<button type="button" class="jsb-tab" role="tab" id="jsb-t0" aria-controls="jsb-p0" data-k="0">' + esc(T.park.name) + '</button><i aria-hidden="true"></i>' +
          '<button type="button" class="jsb-tab" role="tab" id="jsb-t1" aria-controls="jsb-p1" data-k="1">' + esc(T.bike.name) + '</button>' +
        '</div>' +
        '<div class="jsb-pans">' + panHTML('park', 0) + panHTML('bike', 1) + '</div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  var frame = q('.jsb-frame'), stage = q('.jsb-stage'), knob = q('.jsb-knob');

  /* ---------- prebacivanje: --p prati prevlačenje, pušteno "sjedne" na stranu ---------- */
  var P = ACT, pRaf = 0, touched = false;
  function setP(v) { P = v; frame.style.setProperty('--p', v.toFixed(4)); }
  function setOpen(v) { frame.style.setProperty('--open', v.toFixed(3)); }
  function stopP() { if (pRaf) { w.cancelAnimationFrame(pRaf); pRaf = 0; } }
  function animP(to, D, ease, done) {
    stopP();
    var from = P, t0 = now();
    if (!D || reduced) { setP(to); if (done) done(); return; }
    (function step() {
      var t = Math.min(1, (now() - t0) / D);
      setP(from + (to - from) * ease(t));
      if (t < 1) pRaf = w.requestAnimationFrame(step); else { pRaf = 0; if (done) done(); }
    })();
  }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function setActive(k) {
    ACT = k;
    qa('.jsb-pan').forEach(function (p, i) {
      var on = i === k;
      p.classList.toggle('is-on', on);
      if (on) { p.removeAttribute('aria-hidden'); p.removeAttribute('inert'); }
      else { p.setAttribute('aria-hidden', 'true'); p.setAttribute('inert', ''); }
    });
    qa('.jsb-tab').forEach(function (b, i) { b.setAttribute('aria-selected', i === k ? 'true' : 'false'); b.tabIndex = i === k ? 0 : -1; });
    qa('.jsb-lab').forEach(function (l, i) { l.classList.toggle('is-on', i === k); });
    knob.setAttribute('aria-label', T.knob[k]);
    q('.jsb-wrap').setAttribute('aria-labelledby', 'jsb-h' + k);
  }
  function go(k, how) {
    k = k ? 1 : 0;
    var changed = k !== ACT;
    animP(k, 300 + 380 * Math.min(1, Math.abs(k - P) * 1.2), outCubic);
    setActive(k);
    if (how) {
      done();
      if (changed) track('park_prebaci', { ponuda: k ? 'ski_bike' : 'snowboard_park', nacin: how });
    }
  }
  // korisnik je prebacio (ili počeo da vuče): uputa nestaje, pokazni pomak se više ne radi
  function done() { touched = true; q('.jsb-hint').classList.add('is-gone'); }
  setActive(ACT);

  // prevlačenje: bilo gdje na fotografiji (miš i prst); okomit pokret prsta ostaje skrol stranice
  var drag = null, dragged = 0;
  function ends() { return [q('.jsb-m0').offsetLeft, q('.jsb-m1').offsetLeft]; }
  function seamX() { var e = ends(); return e[0] + (e[1] - e[0]) * P; }
  stage.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    var en = ends();
    setOpen(1); stopOpen();
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: P, span: Math.max(40, en[0] - en[1]), axis: null, lx: e.clientX, lt: now(), v: 0 };
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      drag.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (drag.axis === 'x') {
        stopP(); done(); stage.classList.add('is-drag');
        try { stage.setPointerCapture(e.pointerId); } catch (er) {}
      }
    }
    if (drag.axis !== 'x') return;
    e.preventDefault();
    var p = drag.p0 - dx / drag.span;
    if (p < 0) p = Math.max(-.08, p * .25); else if (p > 1) p = Math.min(1.08, 1 + (p - 1) * .25);   // mekan otpor na krajevima
    setP(p);
    var t = now(), dt = Math.max(1, t - drag.lt);
    drag.v = drag.v * .5 + ((e.clientX - drag.lx) / dt) * .5; drag.lx = e.clientX; drag.lt = t;
  });
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var g = drag; drag = null;
    stage.classList.remove('is-drag');
    if (g.axis !== 'x') return;
    dragged = now();
    if (dragged - g.lt > 90) g.v = 0;   // zaustavljeno prije puštanja: nije brz potez
    var k = Math.abs(g.v) > .35 ? (g.v < 0 ? 1 : 0) : (P > .5 ? 1 : 0);   // brz potez ide u svom smjeru
    go(k, 'prevlacenje');
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.id) { var g = drag; drag = null; stage.classList.remove('is-drag'); if (g.axis === 'x') go(P > .5 ? 1 : 0, 'prevlacenje'); } });
  stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // klik: dugme na liniji prebacuje; klik na fotografiju druge ponude (iza linije) je otvara
  stage.addEventListener('click', function (e) {
    if (now() - dragged < 350) return;
    if (e.target.closest && e.target.closest('.jsb-knob')) { go(ACT ? 0 : 1, 'klik'); return; }
    var x = e.clientX - stage.getBoundingClientRect().left, s = seamX();
    if (!ACT && x > s) go(1, 'klik'); else if (ACT && x < s) go(0, 'klik');
  });
  knob.addEventListener('keydown', function (e) {
    var k = { ArrowLeft: 1, ArrowRight: 0, Home: 0, End: 1 }[e.key];
    if (k == null) return;
    e.preventDefault(); go(k, 'tastatura');
  });
  q('.jsb-tabs').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.jsb-tab');
    if (b) go(+b.getAttribute('data-k'), 'klik');
  });
  q('.jsb-tabs').addEventListener('keydown', function (e) {   // strelice između natpisa (tabovi)
    if (!e.target.classList || !e.target.classList.contains('jsb-tab')) return;
    var dk = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!dk) return;
    e.preventDefault();
    var k = ACT ? 0 : 1;
    go(k, 'tastatura'); q('#jsb-t' + k).focus();
  });

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
    root.classList.toggle('jsb--boxed', boxed);
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
    // Ski depo je odmah iznad (bez razmaka) → on već daje razmak, ovdje ostaje samo rub
    var dp = d.getElementById('jsd-depo');
    root.classList.toggle('jsb--join', !boxed && !!dp && !dp.classList.contains('jsd--boxed') &&
      Math.abs(dp.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
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
    var el = frame;
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

  /* ---------- ulazak: linija se otvori (druga ponuda proviri), pa se jednom blago pomjeri ka sredini i vrati ---------- */
  var oRaf = 0;
  function stopOpen() { if (oRaf) { w.cancelAnimationFrame(oRaf); oRaf = 0; } }
  function openSeam() {
    var t0 = now(), D = 950;
    (function step() {
      var t = Math.min(1, (now() - t0) / D);
      setOpen(outCubic(t));
      if (t < 1) oRaf = w.requestAnimationFrame(step); else { oRaf = 0; setTimeout(nudge, 380); }
    })();
  }
  function nudge() {
    if (touched || drag) return;
    var from = ACT, dir = ACT ? -1 : 1, t0 = now(), D = 1250;
    (function step() {
      if (touched || drag) return;
      var t = Math.min(1, (now() - t0) / D);
      setP(from + dir * .085 * Math.sin(Math.PI * t) * (1 - .25 * t));
      if (t < 1) pRaf = w.requestAnimationFrame(step); else { pRaf = 0; setP(from); }
    })();
  }

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
  q('.jsb-pans').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jsb]');
    if (!b) return;
    var o = b.getAttribute('data-o'), ponuda = o === 'bike' ? 'ski_bike' : 'snowboard_park';
    if (b.getAttribute('data-jsb') === 'galerija') lbOpen(o, 0);
    else track('park_klik', { cilj: 'stranica', ponuda: ponuda });
  });

  /* ---------- fotografije preko cijelog ekrana ---------- */
  var lb, lbImg, lbCap, lbCur = 0, lbK = 'park', lbBack = null, lbOverflow = '';
  function lbBuild() {
    lb = d.createElement('div'); lb.id = 'jsb-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<figure><img alt="" decoding="async"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="jsb-lb-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>' +
      '<button type="button" class="jsb-lb-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jsb-lb-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button>';
    d.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('figcaption');
    lb.querySelector('.jsb-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.jsb-lb-prev').addEventListener('click', function () { lbShow(lbCur - 1); });
    lb.querySelector('.jsb-lb-next').addEventListener('click', function () { lbShow(lbCur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });   // klik pored fotografije zatvara
    var sx = 0, sy = 0, down = false, fig = lb.querySelector('figure');
    fig.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sy = e.clientY; });
    fig.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) lbShow(lbCur + (dx < 0 ? 1 : -1));
    });
    fig.addEventListener('pointercancel', function () { down = false; });
  }
  function lbShow(i) {
    var g = GAL[lbK], n = g.length; lbCur = (i % n + n) % n;
    lbImg.src = g[lbCur].full;
    lbImg.alt = g[lbCur].alt || (T.photo + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T[lbK].name);
    lbCap.textContent = T[lbK].name + ' · ' + (lbCur + 1) + ' / ' + n;
    if (n > 1) { var pre = new Image(); pre.src = g[(lbCur + 1) % n].full; }
  }
  function lbKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); lbClose(); }
    else if (e.key === 'ArrowLeft') lbShow(lbCur - 1);
    else if (e.key === 'ArrowRight') lbShow(lbCur + 1);
    else if (e.key === 'Tab') {   // fokus ostaje u galeriji
      var bs = [].slice.call(lb.querySelectorAll('button')).filter(function (b) { return b.offsetParent !== null; });
      var i = bs.indexOf(d.activeElement);
      e.preventDefault(); bs[(i + (e.shiftKey ? -1 : 1) + bs.length) % bs.length].focus();
    }
  }
  function lbOpen(k, i) {
    if (!GAL[k] || !GAL[k].length) return;
    if (!lb) lbBuild();
    lbK = k;
    lb.setAttribute('aria-label', T.galT + ': ' + T[k].name);
    lb.classList.toggle('is-one', GAL[k].length < 2);
    lbBack = d.activeElement; lbShow(i || 0);
    lbOverflow = d.documentElement.style.overflow; d.documentElement.style.overflow = 'hidden';
    lb.classList.add('is-shown'); void lb.offsetWidth; lb.classList.add('is-open');
    lb.querySelector('.jsb-lb-close').focus();
    d.addEventListener('keydown', lbKey);
    track('park_galerija', { ponuda: k === 'bike' ? 'ski_bike' : 'snowboard_park' });
  }
  function lbClose() {
    lb.classList.remove('is-open');
    d.documentElement.style.overflow = lbOverflow;
    d.removeEventListener('keydown', lbKey);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.classList.remove('is-shown'); }, 320);
    if (lbBack && lbBack.focus) lbBack.focus();
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica snowboard parka i stranica ski bike-a ---------- */
  // EN stranice prvo pitaju /en/wp-json (qTranslate tada vraća engleski), pa obični put, pa ?rest_route= rezerva
  var bases = (EN ? [O + '/en/wp-json/'] : []).concat([O + '/wp-json/', O + '/?rest_route=/']);
  // JSON iz odgovora; kad WordPress (prikaz PHP grešaka) ili neki dodatak ispiše tekst prije ili poslije podataka, podaci se izvade iz sredine
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
  // ključ fotografije bez veličine (-1024x683, -scaled), da se ista fotografija ne ponovi
  function key(u) { return String(u).replace(/^https?:\/\/[^\/]+/i, '').replace(/[?#].*$/, '').replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '').replace(/-scaled(?=\.[a-z0-9]+$)/i, '').toLowerCase(); }
  // <img> iz teksta stranice → { full, alt } (najveća do 2048 px iz srcset-a; i odložene slike: data-src, data-lazy-src)
  function fromImg(im) {
    var at = function (n) { return im.getAttribute(n) || ''; };
    var src = at('data-src') || at('data-lazy-src') || at('src');
    var set = at('data-srcset') || at('data-lazy-srcset') || at('srcset');
    var wd = parseInt(at('width'), 10);
    if (wd && wd < 200) return null;   // ikone, logotipi
    var c = set.split(',').map(function (s) { var m = s.trim().match(/^(\S+)\s+(\d+)w$/); return m && { u: m[1], w: +m[2] }; })
      .filter(Boolean).sort(function (a, b) { return a.w - b.w; });
    var big = c.filter(function (x) { return x.w <= 2048; }).pop() || c[c.length - 1];
    var full = big ? big.u : src;
    if (!full || /^data:|\.svg(\?|$)/i.test(full)) return null;
    return { full: abs(full), alt: clean(at('alt')) };
  }
  // slika priložena uz stranicu (media?parent=) → { full, alt }
  function fromMedia(m) {
    if (!m || !m.source_url) return null;
    var sz = (m.media_details && m.media_details.sizes) || {};
    var big = sz['2048x2048'] || sz['1536x1536'] || sz.large || sz.full;
    return { full: big && big.source_url || m.source_url, alt: clean(m.alt_text) };
  }
  // uvod: prva rečenica o samom parku/vožnji (ne o istoriji sporta, sezoni ili navijačima), inače prva rečenica
  var LEAD = {
    park: /prostor|poligon|prepre|skakaonic|\brail|\bbox|jump|obstacle|\bspace\b|terrain/i,
    bike: /bicikl|\bbike|skij|volan|vožnj|vozi|\bride|handlebar/i
  };
  var OFF = /fudbal|navija|olimpijski\s+sport|popularn|\b(?:19|20)\d{2}\b|sezon|football|\bfans?\b|olympic\s+sport|popular/i;
  var CUR = '(KM|BAM|€|EUR)';
  function money(m) { return { v: m[1], cur: /€|eur/i.test(m[2]) ? '€' : 'KM' }; }
  function parse(k, pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    // razmak poslije svakog bloka, da se pasusi ne slijepe u tekstu
    [].forEach.call(b.querySelectorAll('p,li,div,br,h1,h2,h3,h4,h5,h6,td'), function (e) { e.parentNode.insertBefore(b.ownerDocument.createTextNode(' '), e.nextSibling); });
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var txt = clean(b.textContent), m, r = { facts: [] };
    var all = [].concat.apply([], ps.map(sentences)).filter(function (s) { return s.length > 40 && !OFF.test(s) && !/\d\s*(KM|BAM|€)/i.test(s); });
    var hit = all.filter(function (s) { return LEAD[k].test(s); })[0] || all[0] || '';
    r.lead = hit ? clip(hit, 260) : '';
    // staza: "na stazi Trnovo" / "Trnovo slope"
    var slope = (m = txt.match(/\bstaz[aeiu]\s+[„"“]?(?!Jahorin)([A-ZŠĐČĆŽ][a-zšđčćž]+(?:\s+\d)?)/)) ? m[1] : (m = txt.match(/\b([A-ZŠĐČĆŽ][a-zšđčćž]+)\s+(?:slope|run|piste)\b/)) ? m[1] : '';
    if (k === 'park') {
      // površina: "3.000 kvadratnih metara" / "3.000 metara kvadratnih" / "3,000 m²"
      if ((m = txt.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:kvadratn[a-z]*\s+metar[a-z]*|metar[a-z]*\s+kvadratn[a-z]*|m²|m2\b|sq(?:uare)?\.?\s*met[a-z]*|sq\.?\s*m\b)/i)))
        r.facts.push({ v: m[1] + ' m²', l: T.park.fArea });
      if (slope) r.facts.push({ v: slope, l: T.park.fSlope });
      // naselje u blizini: "vikend naselja „Šator“" / "Šator chalet village"
      if ((m = txt.match(/naselj[a-z]*\s+[„"“]?([A-ZŠĐČĆŽ][a-zšđčćž]+)/)) || (m = txt.match(/([A-ZŠĐČĆŽ][a-zšđčćž]+)["”]?\s+(?:chalet|weekend|holiday)\s+(?:village|settlement|resort)/)) ||
          (m = txt.match(/(?:village|settlement)\s+(?:of\s+)?[„"“]?([A-ZŠĐČĆŽ][a-zšđčćž]+)/)))
        r.facts.push({ v: m[1], l: T.park.fNear });
    } else {
      // najam: "20 KM po satu" / "20 KM / 1 h" / "20 KM per hour"
      if ((m = txt.match(new RegExp('(\\d+(?:[.,]\\d{1,2})?)\\s*' + CUR + '\\s*(?:po|per|\\/|za)?\\s*(?:1\\s*)?(sat[a-z]*|h\\b|hour|dan[a-z]*|day|vožnj[a-z]*|ride)?', 'i')))) {
        var pr = money(m), u = (m[3] || '').toLowerCase();
        r.facts.push({ v: pr.v + ' ' + pr.cur, l: T.bike.fPrice + (u ? ' ' + T.bike.per[/^(sat|h|hour)/.test(u) ? 'h' : /^(dan|day)/.test(u) ? 'd' : 'r'] : '') });
      }
      if (slope) r.facts.push({ v: slope, l: T.bike.fSlope });
    }
    var seen = {};
    r.imgs = [].slice.call(b.querySelectorAll('img')).map(fromImg).filter(function (x) {
      if (!x || seen[key(x.full)]) return false; seen[key(x.full)] = 1; return true;
    });
    r.seen = seen; r.id = pg.id;
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    r.link = link;
    return r;
  }
  var FIND = { park: { q: 'snowboard', re: /snowboard|snow\s*park|fun\s*park/i }, bike: { q: 'bike', re: /bike|bicikl|bajk/i } };
  function page(k) {
    var F = '&_fields=id,link,title,content';
    return api('pages', 'slug=' + encodeURIComponent(SLUG[k]) + F).then(function (j) {
      if (j && j[0]) return j[0];
      // slug nije tačan → stranica čiji naslov ima "snowboard" (park), odnosno "bike" (ski bike)
      return api('pages', 'search=' + FIND[k].q + '&per_page=20' + F).then(function (s) {
        var hit = (s || []).filter(function (x) { return FIND[k].re.test(pickLang(x.title && x.title.rendered || '')); })[0];
        if (!hit) throw new Error('stranica "' + SLUG[k] + '" nije pronađena');
        return hit;
      });
    });
  }
  function load(k) {
    return page(k).then(function (pg) {
      var r = parse(k, pg);
      if (r.imgs.length) return r;
      // tekst stranice bez fotografija (npr. galerija kao poseban blok) → slike priložene uz stranicu
      return api('media', 'parent=' + r.id + '&media_type=image&per_page=24&_fields=id,source_url,media_details,alt_text')
        .then(function (ms) {
          (ms || []).map(fromMedia).forEach(function (x) { if (x && !r.seen[key(x.full)]) { r.seen[key(x.full)] = 1; r.imgs.push(x); } });
          return r;
        }, function () { return r; });
    });
  }
  var WHY = {};
  function apply(k, r) {
    var miss = [], pan = q('.jsb-pan--' + k);
    if (r.lead) { DATA[k].lead = r.lead; if (r.lead !== pan.querySelector('.jsb-lead').textContent) pan.querySelector('.jsb-lead').textContent = r.lead; }
    else miss.push('tekst');
    // park: podaci samo sa stranice (ako ih nema, red nestaje); ski bike: podaci sa stranice + kratki opis bicikla (dizajn)
    var f = k === 'bike' ? r.facts.concat(T.bike.base).slice(0, 3) : r.facts;
    if (k === 'park' && !r.facts.length) miss.push('površina, staza, naselje');
    if (k === 'bike' && !r.facts.length) miss.push('cijena najma');
    if (JSON.stringify(f) !== JSON.stringify(DATA[k].facts)) { DATA[k].facts = f; pan.querySelector('.jsb-facts').innerHTML = factsHTML(k); }
    if (r.link) { DATA[k].link = r.link; pan.querySelector('a[data-jsb="stranica"]').setAttribute('href', r.link); }
    if (r.imgs.length) GAL[k] = BASE[k].concat(r.imgs);
    if (miss.length) why(k, 'stranica nema: ' + miss.join(', '));
    ld();
  }
  function why(k, msg) {
    WHY[k] = T[k].name + ': ' + msg;
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jsb-why') || q('.jsb-body').appendChild(d.createElement('small'));
    el.className = 'jsb-why';
    el.textContent = T.why + ' · ' + K.filter(function (x) { return WHY[x]; }).map(function (x) { return WHY[x]; }).join(' · ') + ' (' + T.whyTail + ')';
  }

  /* ---------- schema.org za Google (snowboard park i ski bike na Jahorini) ---------- */
  function ld() {
    var sc = d.getElementById('jsb-ld');
    if (!sc) { sc = d.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'jsb-ld'; (d.head || d.documentElement).appendChild(sc); }
    var resort = { '@type': 'SkiResort', name: 'Olimpijski centar Jahorina', url: O + '/' };
    sc.text = JSON.stringify({
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'SportsActivityLocation', name: 'Snowboard park Jahorina', description: DATA.park.lead, image: abs(IMG.park), url: DATA.park.link, containedInPlace: resort },
        { '@type': 'TouristAttraction', name: 'Ski bike Jahorina', description: DATA.bike.lead, image: abs(IMG.bike), url: DATA.bike.link, containedInPlace: resort }
      ]
    });
  }
  ld();
  if (w.fetch && w.DOMParser && w.Promise) K.forEach(function (k) {
    load(k).then(function (r) { apply(k, r); }).catch(function (e) {
      if (w.console) console.warn('[Jahorina ' + T[k].name + ']', e);
      why(k, e && e.message || 'REST');
    });
  });

  // ulazak jednom, kad kadar dođe u vidno polje; poslije toga se otvori linija
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jsb-anim'); setOpen(0);
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jsb-on'); io.disconnect();
        setTimeout(function () { if (!touched) openSeam(); else setOpen(1); }, 1050);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(frame);
  }
})(window, document);
