/* =====================================================================
   JAHORINA — SKI DEPO (početna, ispod VIP gondole) · v1 "3D ormarić"
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, scena u
   pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · cik-cak sa VIP gondolom iznad (tamo tekst lijevo): ovdje je tekst desno, a lijevo u kadru 3D ormarić;
     · 3D ORMARIĆ (three.js, depo-3d.js): noćni red ormarića, broj 61 se otvori i osvijetljen je iznutra; unutra nosači
       za sušenje sa perforiranim rozetama i ventilacija na plafonu (po fotografiji pravog depoa). Prevlačenjem se okreće;
     · SPAKUJTE DEPO: dva reda (set 1, set 2) × skije, pancerice, kaciga, rukavice; klik dodaje/uklanja opremu u
       ormariću (infografika "dva puna seta"); kad su pancerice i rukavice na nosačima, rupice rozeta tiho zažare;
     · INFOGRAFIKA NA ORMARIĆU: tanke linije do ventilacije, sušenja i grijanja; privjesak sa cijenom na vratima;
     · KORACI 01–03 "Kako do depoa" (ski kasa → kartica sa depozitom → skeniranje u stanici).
   Bez WebGL-a (ili dok 3D ne stigne) stoji fotografija pravog ormarića, a infografika ostaje kao tekst.

   SADRŽAJ JE IZ WORDPRESSA (stranica ski depoa, data-stranica = slug; ako slug ne postoji, traži se stranica sa "depo"):
     nadnaslov = naslov stranice (dio prije crte); uvod = prva rečenica; cijena za jedan dan, broj setova, depozit za
     kartu, mjesto (gondola …) i oprema depoa (ventilacija, sušenje, grijanje) iz teksta; "Više o ski depou" = link stranice.
     Dok WordPress ne odgovori, stoji ugrađeni tekst (isti kao na stranici 9. 10. 2026). Prijavljeni admin vidi razlog.

   Ugradnja: Elementor HTML widget sa <div id="jsd-depo"></div> + ovaj fajl sa jsDelivr-a (depo-3d.js i slike/ se
   učitavaju iz istog commita, 3D tek kad se sekcija približi).
   Podešavanja na <div id="jsd-depo"> (sva su neobavezna):
     data-stranica="ski-depo"      (slug WordPress stranice)
     data-mapa="https://…"         (link dugmeta Lokacija; podrazumijevano Google Maps: gondola Poljice, Jahorina)
     data-galerija="url1, url2"    (zamjena za fotografije depoa)
   GA: oprema → depo_oprema (predmet, set, akcija), okretanje → depo_okretanje (jednom), "Više o ski depou" i
       Lokacija → depo_klik (cilj: stranica | mapa), fotografije → depo_galerija.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jsd-depo');
  if (!root || root.__jsd) return;
  root.__jsd = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var SCRIPT = d.currentScript && d.currentScript.src || '';
  var HERE = SCRIPT.replace(/[^\/]*$/, '');
  // SRI za depo-3d.js (upisuje ga napravi-3d.mjs; isti commit kao ovaj fajl)
  var SRI3D = 'sha384-9FGx87eCHr3yPNR67WHH8wyC0nTrnOFutrcqC1s7UnTLvw3wYYAHyGF9edGRdHTY';
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'ski-depo').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var MAP = opt('mapa', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Gondola Poljice, Jahorina'));
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = w.matchMedia && w.matchMedia('(hover: none)').matches;
  // slabiji uređaji (do 2 GB memorije ili 2 jezgra) crtaju 3D bez sjenki i zaglađivanja; __JSD_LOW služi testovima
  var nav = w.navigator || {};
  var LOW = w.__JSD_LOW != null ? !!w.__JSD_LOW : ((nav.deviceMemory || 8) <= 2 || (nav.hardwareConcurrency || 8) <= 2);

  // ugrađeni tekst = tekst stranice ski depoa (9. 10. 2026); naslov i kratki natpisi infografike su korisnikov dizajn; EN je prevod
  var T = EN ? {
    kicker: 'Ski lockers', h: ['Leave your gear', 'on the mountain'],
    lead: 'One of the best and most practical ways to look after your gear is to use a ski locker.',
    pack: function (n) { return 'One locker fits ' + n + ' full sets'; }, packSub: 'of ski or snowboard gear · tap to add',
    sets: { 2: 'two', 3: 'three', 4: 'four' },
    cols: ['Skis', 'Boots', 'Helmet', 'Gloves'], items: ['skis and poles', 'ski boots', 'helmet', 'gloves'], set: 'Set',
    add: 'Add', rem: 'Remove', fill: function (n, m) { return 'Filled ' + n + ' / ' + m; },
    feat: { vent: ['Ventilation', 'keeps gear fresh'], dry: ['Drying', 'dry and ready to go'], heat: ['Heating', 'warm and comfortable'] },
    day: 'per day', tagA: 'Price per locker per day',
    how: 'How to get a locker',
    steps: [['Ski ticket office', 'at the {g} gondola base'], ['Locker card', '{d} deposit'], ['Scan your card', 'inside the base station']],
    more: 'More about ski lockers', moreS: 'More', map: 'Location', mapS: 'Location',
    hint: touch ? 'Swipe to rotate' : 'Drag to rotate', photo: 'Locker photo',
    alt: '3D view of the ski lockers: open locker 61 with drying holders, skis, ski boots, helmet and gloves',
    gal: 'Ski locker photos', photoN: 'Photo', prev: 'Previous photo', next: 'Next photo', close: 'Close',
    photos: ['Open ski locker 61 with drying holders, gloves, skis and poles'],
    why: 'WordPress', whyTail: 'showing built-in content'
  } : {
    kicker: 'Ski depo', h: ['Ostavite opremu', 'na planini'],
    lead: 'Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.',
    pack: function (n) { return 'U jedan depo stanu ' + n + ' puna seta'; }, packSub: 'skijaške ili snowboard opreme · dodajte klikom',
    sets: { 2: 'dva', 3: 'tri', 4: 'četiri' },
    cols: ['Skije', 'Pancerice', 'Kaciga', 'Rukavice'], items: ['skije i štapove', 'pancerice', 'kacigu', 'rukavice'], set: 'Set',
    add: 'Dodaj', rem: 'Ukloni', fill: function (n, m) { return 'Popunjeno ' + n + ' / ' + m; },
    feat: { vent: ['Ventilacija', 'za svježinu opreme'], dry: ['Sušenje', 'oprema suva i spremna'], heat: ['Grijanje', 'udobnost i toplina'] },
    day: 'po danu', tagA: 'Cijena po depou za jedan dan',
    how: 'Kako do depoa',
    steps: [['Ski kasa', 'na polazu gondole {g}'], ['Kartica depoa', 'depozit {d}'], ['Skenirajte kartu', 'u polaznoj stanici']],
    more: 'Više o ski depou', moreS: 'Više', map: 'Lokacija', mapS: 'Lokacija',
    hint: touch ? 'Prevucite za okretanje' : 'Povucite za okretanje', photo: 'Fotografija depoa',
    alt: '3D prikaz ski depoa: otvoren ormarić 61 sa nosačima za sušenje, skijama, pancericama, kacigom i rukavicama',
    gal: 'Fotografije ski depoa', photoN: 'Fotografija', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija', close: 'Zatvori',
    photos: ['Otvoren ski depo 61 sa nosačima za sušenje, rukavicama, skijama i štapovima'],
    why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj'
  };
  // podaci sa stranice (9. 10. 2026); WordPress ih zamijeni kad se promijene
  var DATA = { price: '15', cur: 'KM', dep: '10', depCur: 'KM', sets: 2, place: 'Poljice', feat: { vent: true, dry: true, heat: true } };
  var KINDS = ['ski', 'boot', 'helmet', 'glove'];
  var STATE = { ski0: true, boot0: true, helmet0: true, glove0: true, ski1: false, boot1: false, helmet1: false, glove1: false };

  var PHOTO = HERE + 'slike/depo-ormaric.webp', PHOTO_S = HERE + 'slike/depo-ormaric-900.webp';
  var FIXED_GAL = !!opt('galerija', '');
  var BASE = [{ full: PHOTO, alt: T.photos[0] }];
  var GAL = FIXED_GAL ? opt('galerija', '').split(',').map(function (x) { x = x.trim(); return x && { full: x }; }).filter(Boolean) : BASE.slice();

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsd--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ol,#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible,#R button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je VIP gondola odmah iznad (.jsd--join), ona već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jsd-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsd--join .jsd-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsd-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jsd-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; 3D scena (red ormarića u noći) je pozadina cijelog kadra */
    '#R .jsd-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;justify-content:flex-end;min-height:clamp(700px,54vw,860px);border-radius:26px;overflow:hidden;isolation:isolate;',
    'background:radial-gradient(70% 90% at 28% 60%,#111b2e 0,#0b1322 55%,#080e1a 100%);box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsd-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak hladno-bijeli odsjaj na gornjoj ivici iznad otvorenog ormarića (jedini izvor svjetla) */
    '#R .jsd-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;opacity:var(--lamp,1);background:linear-gradient(90deg,transparent calc(var(--fx,.3) * 100% - 22%),rgba(214,228,255,.42) calc(var(--fx,.3) * 100%),transparent calc(var(--fx,.3) * 100% + 24%))}',
    '#R .jsd-stage{position:absolute;inset:0;z-index:0}',
    '#R .jsd-3d{position:absolute;inset:0;z-index:0;touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}',
    '#R .jsd-3d.is-drag{cursor:grabbing}',
    '#R .jsd-3d canvas{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;opacity:0;transition:opacity .9s ease}',
    '#R .jsd-3d.is-ready canvas{opacity:1}',
    /* fotografija pravog ormarića: dok 3D ne stigne i kad WebGL ne radi */
    '#R .jsd-photo{position:absolute;top:0;bottom:0;left:calc(var(--fx,.3) * 100% - min(22vw,300px));width:min(44vw,600px);transition:opacity .9s ease;',
    '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 22%,#000 70%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 22%,#000 70%,transparent 100%)}',
    '#R .jsd-photo img{width:100%;height:100%;object-fit:cover;object-position:50% 40%;filter:saturate(.7) brightness(.62) contrast(1.06)}',
    '#R .jsd-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.42}',
    '#R .jsd-3d.is-ready .jsd-photo{opacity:0}',
    /* tamni prelaz zdesna ispod teksta (cik-cak: tekst desno), blagi odozdo i vinjeta */
    '#R .jsd-scrim{position:absolute;inset:0;z-index:1;pointer-events:none;',
    'background:linear-gradient(270deg,rgba(6,11,22,.93) 0,rgba(6,11,22,.84) calc(var(--side) + 440px),rgba(6,11,22,.45) calc(var(--side) + 620px),rgba(6,11,22,0) calc(var(--side) + 780px)),',
    'linear-gradient(0deg,rgba(6,11,22,.42) 0%,rgba(6,11,22,0) 22%),radial-gradient(120% 100% at 30% 50%,transparent 60%,rgba(4,8,18,.5) 100%)}',

    /* infografika na ormariću: tačka, tanka linija i natpis; položaj računa 3D scena (--x, --y, --len) */
    '#R .jsd-ov{position:absolute;inset:0;z-index:2;pointer-events:none}',
    '#R .jsd-co{position:absolute;left:0;top:0;transform:translate3d(var(--x,0),var(--y,0),0);opacity:0;transition:opacity .5s ease}',
    '#R .jsd-co.is-on{opacity:1}',
    '#R .jsd-co.is-off{opacity:0!important}',
    '#R .jsd-co i{position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(0,185,242,.22),0 0 12px rgba(0,185,242,.9)}',
    '#R .jsd-co s{position:absolute;left:6px;top:-.5px;height:1px;width:var(--len,80px);text-decoration:none;transform-origin:0 50%;transform:scaleX(0);transition:transform .55s cubic-bezier(.2,.7,.2,1) .1s;',
    'background:linear-gradient(90deg,rgba(0,185,242,.85),rgba(255,255,255,.55) 40%,rgba(255,255,255,.4))}',
    '#R .jsd-co.is-on s{transform:none}',
    '#R .jsd-co s::after{content:"";position:absolute;right:-2px;top:-2px;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.8)}',
    '#R .jsd-co span{position:absolute;left:calc(var(--len,80px) + 16px);top:0;transform:translate(-6px,-50%);opacity:0;transition:opacity .45s ease .45s,transform .6s cubic-bezier(.2,.7,.2,1) .45s;white-space:nowrap}',
    '#R .jsd-co.is-on span{opacity:1;transform:translate(0,-50%)}',
    '#R .jsd-co b{display:flex;align-items:center;gap:8px;font:600 11px/1 var(--fd);letter-spacing:2.4px;text-transform:uppercase;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.8)}',
    '#R .jsd-co b svg{width:16px;height:16px;color:var(--accent)}',
    '#R .jsd-co small{display:block;margin:6px 0 0 24px;font:400 13px/1.2 var(--fb);color:var(--text-2);text-shadow:0 1px 10px rgba(0,0,0,.9)}',
    /* privjesak sa cijenom: visi sa ivice otvorenih vrata (konac + stakleni listić sa rupicom) */
    '#R .jsd-tag{position:absolute;left:0;top:0;transform:translate3d(var(--x,0),var(--y,0),0);opacity:0;transition:opacity .6s ease}',
    '#R .jsd-tag.is-on{opacity:1}',
    /* bez 3D: privjesak stoji pored fotografije */
    '#R .jsd--flat .jsd-tag{opacity:1;transform:none;left:calc(var(--fx,.3) * 100% + min(15vw,190px));top:22%}',
    '#R .jsd-tag-in{position:absolute;left:0;top:0;transform-origin:50% 0;transform:translate(-50%,0) rotate(var(--sw,0deg));transition:transform 1.2s cubic-bezier(.3,1.6,.4,1)}',
    '#R .jsd-tag-in::before{content:"";position:absolute;left:50%;top:0;width:1px;height:26px;background:linear-gradient(180deg,rgba(255,255,255,.75),rgba(255,255,255,.35))}',
    '#R .jsd-tag-b{position:relative;margin-top:24px;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:86px;padding:22px 14px 12px;border-radius:14px 14px 16px 16px;text-align:center;',
    'background:linear-gradient(150deg,rgba(28,41,68,.82),rgba(12,20,36,.86));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 14px 26px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.1),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jsd-tag-b::before{content:"";position:absolute;left:50%;top:8px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#070c17;box-shadow:inset 0 1px 2px rgba(0,0,0,.9),0 0 0 1.5px rgba(255,255,255,.22)}',
    '#R .jsd-tag-p{display:flex;align-items:baseline;gap:4px;white-space:nowrap}',
    '#R .jsd-tag-p b{font:800 26px/1 var(--fd);letter-spacing:-.02em;color:#fff;font-variant-numeric:tabular-nums}',
    '#R .jsd-tag-p i{font:700 12px/1 var(--fd);font-style:normal;color:var(--accent-2)}',
    '#R .jsd-tag-b small{font:600 9px/1.2 var(--fd);letter-spacing:1.6px;text-transform:uppercase;color:var(--text-3)}',
    /* tiha uputa za okretanje i link na fotografiju, dolje lijevo na sceni */
    '#R .jsd-meta{position:absolute;left:calc(var(--side));bottom:clamp(20px,2.4vw,32px);z-index:3;display:flex;align-items:center;gap:16px;font:500 12.5px/1.2 var(--fb);color:var(--text-3)}',
    '#R .jsd-hint{display:inline-flex;align-items:center;gap:8px;transition:opacity .6s ease}',
    '#R .jsd-hint svg{width:18px;height:18px;color:var(--accent)}',
    '#R .jsd-hint.is-gone{opacity:0}',
    '#R .jsd-hint.is-gone + .jsd-ph{border-left-color:transparent}',
    '#R .jsd-3d:not(.is-ready) ~ .jsd-meta .jsd-hint{display:none}',
    '#R .jsd-ph{all:unset;display:inline-flex!important;align-items:center;gap:8px;padding-left:16px!important;border-left:1px solid rgba(255,255,255,.14);cursor:pointer;color:var(--text-3)!important;font:500 12.5px/1.2 var(--fb)!important;transition:color .2s}',
    '#R .jsd-3d:not(.is-ready) ~ .jsd-meta .jsd-ph{padding-left:0!important;border-left:0}',
    '#R .jsd-ph svg{width:16px;height:16px}',
    '#R .jsd-ph:hover{color:var(--accent)!important}',

    /* tekst desno (cik-cak sa VIP gondolom), poravnat sa desnom ivicom mreže 1240px */
    '#R .jsd-body{position:relative;z-index:3;width:min(calc(var(--side) + 500px),52%);padding:clamp(56px,6vw,88px) var(--side) clamp(56px,6vw,88px) 0}',
    '#R .jsd-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-bottom:22px}',
    '#R .jsd-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(42px,4.4vw,68px);font-weight:800;line-height:.96;letter-spacing:-.025em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsd-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jsd-lead{margin-top:20px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.6;color:var(--text-2)!important;max-width:44ch;text-wrap:pretty}',

    /* SPAKUJTE DEPO: dva reda (set 1, set 2) × četiri vrste opreme; prazno mjesto = isprekidan obris sa +, puno = ispupčeno */
    '#R .jsd-pack{margin-top:28px;width:min(100%,460px)}',
    '#R .jsd-pack-h{font:500 15px/1.35 var(--fb);color:#fff}',
    '#R .jsd-pack-h small{display:block;margin-top:3px;font:400 13px/1.35 var(--fb);color:var(--text-3)}',
    '#R .jsd-grid{display:grid;grid-template-columns:44px repeat(4,1fr);gap:8px 9px;margin-top:14px;align-items:center}',
    '#R .jsd-ch{font:600 9.5px/1.2 var(--fd);letter-spacing:1.3px;text-transform:uppercase;color:var(--text-3);text-align:center;white-space:nowrap}',
    '#R .jsd-rh{font:600 9.5px/1.2 var(--fd);letter-spacing:1.6px;text-transform:uppercase;color:var(--text-3);white-space:nowrap}',
    '#R .jsd-it{all:unset;position:relative!important;box-sizing:border-box!important;display:grid!important;place-items:center;height:48px;border-radius:13px!important;cursor:pointer;color:rgba(255,255,255,.4)!important;',
    'border:1px dashed rgba(255,255,255,.17)!important;background:rgba(5,9,18,.3)!important;transition:color .25s,border-color .25s,background .3s,box-shadow .3s}',
    '#R .jsd-it svg{width:26px;height:26px;transition:transform .35s cubic-bezier(.2,.7,.2,1)}',
    '#R .jsd-it::before{content:"+";position:absolute;top:5px;right:7px;font:600 12px/1 var(--fd);color:var(--accent);transition:opacity .25s}',
    '#R .jsd-it:hover{color:#fff!important;border-color:rgba(0,185,242,.55)!important}',
    '#R .jsd-it[aria-pressed="true"]{color:#fff!important;border:1px solid transparent!important;background:linear-gradient(145deg,#1b2742,#111a2c)!important;',
    'box-shadow:3px 3px 8px rgba(0,0,0,.45),-2px -2px 6px rgba(78,104,150,.14),inset 0 0 0 1px rgba(255,255,255,.06)!important}',
    '#R .jsd-it[aria-pressed="true"]::before{opacity:0}',
    '#R .jsd-it::after{content:"";position:absolute;left:36%;right:36%;bottom:5px;height:1.5px;border-radius:2px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.8);opacity:0;transition:opacity .3s}',
    '#R .jsd-it[aria-pressed="true"]::after{opacity:1}',
    '#R .jsd-it[aria-pressed="true"]:hover{box-shadow:3px 3px 8px rgba(0,0,0,.45),-2px -2px 6px rgba(78,104,150,.14),inset 0 0 0 1px rgba(0,185,242,.4)!important}',
    '#R .jsd-it.is-pop svg{transform:scale(.82)}',
    '#R .jsd-it[aria-disabled="true"]{cursor:default}',
    '#R .jsd-fill{display:flex;align-items:center;gap:12px;margin-top:14px;font:500 12px/1 var(--fb);color:var(--text-3);font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#R .jsd-fill i{position:relative;flex:1;height:2px;border-radius:2px;background:rgba(255,255,255,.1)}',
    '#R .jsd-fill i::after{content:"";position:absolute;left:0;top:0;bottom:0;width:calc(var(--f,.5) * 100%);border-radius:2px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7);transition:width .6s cubic-bezier(.2,.7,.2,1)}',

    /* KORACI 01–03: tanka linija sa tačkama, broj, naziv i kratko objašnjenje */
    '#R .jsd-how{margin-top:28px;width:min(100%,460px)}',
    '#R .jsd-lab{display:block;font:600 9.5px/1.2 var(--fd);letter-spacing:1.8px;text-transform:uppercase;color:var(--text-3)}',
    '#R .jsd-steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:14px!important;padding-top:16px!important}',
    '#R .jsd-steps::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,rgba(0,185,242,.7),rgba(255,255,255,.14) 34%,rgba(255,255,255,.14))}',
    '#R .jsd-steps li{position:relative}',
    '#R .jsd-steps li::before{content:"";position:absolute;left:0;top:-19.5px;width:7px;height:7px;border-radius:50%;background:#0b1322;box-shadow:0 0 0 1.5px rgba(255,255,255,.4)}',
    '#R .jsd-steps li:first-child::before{background:var(--accent);box-shadow:0 0 0 3px rgba(0,185,242,.22),0 0 10px rgba(0,185,242,.8)}',
    '#R .jsd-steps em{display:block;font:700 11px/1 var(--fd);font-style:normal;letter-spacing:1.5px;color:var(--accent-2)}',
    '#R .jsd-steps b{display:block;margin-top:8px;font:600 14.5px/1.25 var(--fd);color:#fff}',
    '#R .jsd-steps small{display:block;margin-top:4px;font:400 13px/1.35 var(--fb);color:var(--text-3)}',

    /* dugmad kao u ostalim blokovima: bijelo glavno + stakleno sporedno, iste širine i visine */
    '#R .jsd-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:30px;width:min(100%,460px)}',
    '#R .jsd-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 16px!important;border-radius:40px!important;cursor:pointer;',
    'white-space:nowrap;font:600 13.5px/1 var(--fb)!important;letter-spacing:.2px!important}',
    '#R .jsd-btn svg{width:15px;height:15px}',
    '#R .jsd-s{display:none}',
    '#R .jsd-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6)!important;transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)!important}',
    '#R .jsd-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jsd-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)!important}',
    '#R .jsd-btn--solid:hover::after{animation:jsdShine 1.6s ease-in-out}',
    '@keyframes jsdShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jsd-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff!important}',
    '#R .jsd-btn--ghost{color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:color .2s,box-shadow .25s}',
    '#R .jsd-btn--ghost svg{color:var(--accent)}',
    '#R .jsd-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)!important}',
    '#R .jsd-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)!important}',
    '#R .jsd-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jsd-anim/jsd-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsd-anim .jsd-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsd-anim.jsd-on .jsd-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jsd-anim .jsd-up{opacity:0;transform:translateY(20px)}',
    '#R.jsd-anim.jsd-on .jsd-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsd-anim .jsd-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsd-anim.jsd-on .jsd-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    '#R.jsd-anim .jsd-steps::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsd-anim.jsd-on .jsd-steps::before{transform:none;transition:transform 1.1s cubic-bezier(.2,.7,.2,1) 1.2s}',

    /* manji laptop */
    '@media (max-width:1180px){#R .jsd-body{width:min(calc(var(--side) + 470px),54%)}#R .jsd-btn{padding:0 12px!important}}',
    '@media (max-width:1180px) and (min-width:981px){#R .jsd-co small{display:none}}',
    /* tablet i telefon: 3D scena gore (utapa se nadolje), tekst ispod */
    '@media (max-width:980px){',
    '#R .jsd-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jsd-stage{position:relative;height:min(84vw,620px)}',
    '#R .jsd-3d{-webkit-mask-image:linear-gradient(180deg,#000 80%,transparent 100%);mask-image:linear-gradient(180deg,#000 80%,transparent 100%)}',
    '#R .jsd-scrim{background:radial-gradient(120% 100% at 50% 40%,transparent 60%,rgba(4,8,18,.5) 100%)}',
    '#R .jsd-photo{left:calc(50% - min(30vw,260px));width:min(60vw,520px)}',
    '#R .jsd-meta{left:clamp(22px,6vw,56px);bottom:14px}',
    '#R .jsd-body{width:auto;padding:clamp(18px,3vw,30px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(40px,7.2vw,62px)}',
    '#R .jsd-lead{max-width:56ch}',
    '#R .jsd-pack,#R .jsd-how,#R .jsd-acts{width:min(100%,520px)}}',
    '@media (max-width:760px){',
    '#R .jsd-frame{border-radius:24px}',
    '#R .jsd-stage{height:min(132vw,560px)}',
    '#R .jsd-co b{font-size:10px;letter-spacing:1.8px;gap:6px}',
    '#R .jsd-co small{display:none}',
    '#R .jsd-co b svg{width:14px;height:14px}',
    '#R .jsd-co span{left:calc(var(--len,40px) + 10px)}',
    '#R .jsd-tag-b{min-width:70px;padding:19px 10px 10px;border-radius:12px 12px 14px 14px}',
    '#R .jsd-tag-p b{font-size:21px}',
    '#R .jsd-tag-in::before{height:20px}',
    '#R .jsd-tag-b{margin-top:18px}',
    '#R .jsd-meta{gap:12px;font-size:12px}',
    '#R .jsd-ph{font-size:12px!important;padding-left:12px!important}',
    '#R .jsd-body{padding:4px 20px 30px}',
    '#R .jsd-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jsd-kicker::before{width:22px}',
    '#R h2{font-size:clamp(34px,10.4vw,50px)}',
    '#R .jsd-lead{margin-top:16px}',
    '#R .jsd-pack{margin-top:24px}',
    '#R .jsd-pack-h{font-size:14.5px}',
    '#R .jsd-grid{grid-template-columns:34px repeat(4,1fr);gap:7px 7px}',
    '#R .jsd-ch{font-size:8.5px;letter-spacing:.6px}',
    '#R .jsd-rh{font-size:8.5px;letter-spacing:1px}',
    '#R .jsd-it{height:46px}',
    '#R .jsd-it svg{width:24px;height:24px}',
    '#R .jsd-steps{grid-template-columns:1fr;gap:14px;padding:0 0 0 22px!important}',
    '#R .jsd-steps::before{left:3px;right:auto;top:4px;bottom:4px;width:1px;height:auto;background:linear-gradient(180deg,rgba(0,185,242,.7),rgba(255,255,255,.14) 40%)}',
    '#R .jsd-steps li::before{left:-22px;top:1px}',
    '#R .jsd-steps li{display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:baseline}',
    '#R .jsd-steps em{grid-row:span 2}',
    '#R .jsd-steps b{margin-top:0}',
    '#R.jsd-anim .jsd-steps::before{transform:scaleY(0);transform-origin:center top}',
    '#R .jsd-acts{gap:8px;margin-top:26px;width:100%}',
    '#R .jsd-btn{height:42px;padding:0 12px!important;font-size:13px!important}',
    '#R .jsd-l{display:none}',
    '#R .jsd-s{display:inline}}',
    '@media (max-width:360px){#R .jsd-acts{grid-template-columns:1fr}#R .jsd-ch{font-size:8px;letter-spacing:.3px}}',
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
    '#L .jsd-lb-close{top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px)}',
    '#L .jsd-lb-prev{left:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L .jsd-lb-next{right:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L.is-one .jsd-lb-prev,#L.is-one .jsd-lb-next{display:none!important}',
    '@media (max-width:760px){#L img{max-height:calc(100vh - 210px);border-radius:14px}#L .jsd-lb-prev,#L .jsd-lb-next{top:auto;bottom:22px;transform:none}#L .jsd-lb-prev{left:calc(50% - 60px)}#L .jsd-lb-next{right:calc(50% - 60px)}}',
    '@media (prefers-reduced-motion:reduce){#L,#L figure{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jsd-depo').replace(/#L/g, '#jsd-lb');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jsd-css');
  if (!st) { st = d.createElement('style'); st.id = 'jsd-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  function svg(p, vb) { return '<svg width="22" height="22" viewBox="' + (vb || '0 0 24 24') + '" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    ski: svg('<path d="M4.6 20.6 L16.9 6 C17.7 5 19.2 5.1 19.5 6.4 M19.4 20.6 L7.1 6 C6.3 5 4.8 5.1 4.5 6.4 M9.6 16.6 L11.2 18 M14.4 16.6 L12.8 18" ' + S + '/>'),
    boot: svg('<path d="M7.6 3.4 H14.2 L14.9 10.6 L19.2 12.6 C20.2 13.1 20.8 14 20.8 15.1 V17.6 H5.2 V15.2 L6.8 12 Z M4.4 20.4 H21.4 M8.9 7.2 H14.4 M8.4 10.4 H14.8 M15.2 13.6 L16.6 12" ' + S + '/>'),
    helmet: svg('<path d="M3.6 15.8 C3.6 9.6 7.8 5.4 13 5.4 C17.8 5.4 20.8 9 20.8 13.6 V15.4 H11.4 L9.6 18.6 H5 C4.2 18.6 3.6 18 3.6 17.2 Z M11.4 15.4 V12.2 H20.8 M9.8 8.2 L11.2 10.4 M13.8 7.4 L14.6 9.8" ' + S + '/>'),
    glove: svg('<path d="M7.4 21 V13 L5.3 10 C4.7 9.1 5.7 8 6.7 8.6 L8.5 9.9 V5.4 C8.5 4.3 10.1 4.3 10.1 5.4 V9.6 V4 C10.1 2.9 11.7 2.9 11.7 4 V9.6 V4.6 C11.7 3.5 13.3 3.5 13.3 4.6 V10 V6 C13.3 4.9 14.9 4.9 14.9 6 V13.4 C14.9 15.5 14.1 17 13.3 17.6 V21 M7.4 18.4 H13.3" ' + S + '/>'),
    vent: svg('<path d="M3.5 8.5 H13 C15 8.5 16.2 6.8 15.4 5.2 C14.7 3.8 12.7 3.8 12.2 5.3 M3.5 12 H18.4 C20.4 12 21.4 14.1 20.4 15.6 C19.6 16.8 17.8 16.6 17.4 15.3 M3.5 15.5 H11" ' + S + '/>'),
    dry: svg('<path d="M12 3.6 C12 3.6 6.8 9.6 6.8 13.4 C6.8 16.3 9.1 18.6 12 18.6 C14.9 18.6 17.2 16.3 17.2 13.4 C17.2 9.6 12 3.6 12 3.6 Z M5 21 H19 M9.6 13.8 C9.8 15.2 10.8 16.1 12.1 16.3" ' + S + '/>'),
    heat: svg('<path d="M7.8 20 C6.2 17.6 9.4 15.6 7.8 13.2 C6.2 10.8 9.4 8.8 7.8 6.4 M12.2 20 C10.6 17.6 13.8 15.6 12.2 13.2 C10.6 10.8 13.8 8.8 12.2 6.4 M16.6 20 C15 17.6 18.2 15.6 16.6 13.2 C15 10.8 18.2 8.8 16.6 6.4" ' + S + '/>'),
    turn: svg('<path d="M4.6 10.4 C3.6 11 3 11.7 3 12.5 C3 15 7 17 12 17 C17 17 21 15 21 12.5 C21 11.7 20.4 11 19.4 10.4 M9.6 19.4 L12 17 L9.6 14.6 M12 4 V12" ' + S + '/>'),
    photos: svg('<rect x="3.5" y="6" width="13.5" height="12" rx="2.2" ' + S + '/><path d="M7 3.8 H18.3 C19.5 3.8 20.5 4.8 20.5 6 V14.6 M3.9 15.6 L8 11.6 L11 14.4 L12.8 12.8 L16.8 16.4" ' + S + '/><circle cx="12.6" cy="9.6" r="1.1" ' + S + '/>'),
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 9.8 C5.5 6.2 8.4 3.4 12 3.4 C15.6 3.4 18.5 6.2 18.5 9.8 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="9.8" r="2.4" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon)
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jsd-l">' + esc(l) + '</span><span class="jsd-s">' + esc(s) + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function abs(u) { try { return new URL(u, O + '/').href; } catch (e) { return u; } }
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
  // rečenice teksta; tačka u broju (1.879) ne prekida rečenicu
  function sentences(p) { return (clean(p).match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]+|$)/g) || []).map(clean).filter(Boolean); }
  // "10,00" → "10"; "12,50" ostaje
  function money(s) { return String(s).replace(/[.,]0{1,2}$/, ''); }

  /* ---------- crtanje ---------- */
  function setWord(n) { return T.sets[n] || String(n); }
  function stepsHTML() {
    return T.steps.map(function (s, k) {
      return '<li><em>' + ('0' + (k + 1)) + '</em><b>' + esc(s[0]) + '</b><small>' +
        esc(s[1].replace('{g}', DATA.place).replace('{d}', money(DATA.dep) + ' ' + DATA.depCur)) + '</small></li>';
    }).join('');
  }
  function gridHTML() {
    var h = '<span></span>' + T.cols.map(function (c) { return '<span class="jsd-ch" aria-hidden="true">' + esc(c) + '</span>'; }).join('');
    [0, 1].forEach(function (s) {
      h += '<span class="jsd-rh" aria-hidden="true">' + esc(T.set + ' ' + (s + 1)) + '</span>';
      KINDS.forEach(function (k, i) {
        h += '<button type="button" class="jsd-it" data-k="' + k + '" data-s="' + s + '" aria-pressed="false">' + ICON[k] + '</button>';
      });
    });
    return h;
  }
  function coHTML(k) {
    var f = T.feat[k];
    return '<div class="jsd-co" data-co="' + k + '"><i></i><s></s><span><b>' + ICON[k] + esc(f[0]) + '</b><small>' + esc(f[1]) + '</small></span></div>';
  }
  root.innerHTML =
    '<section class="jsd-wrap" aria-labelledby="jsd-h"><div class="jsd-frame">' +
      '<div class="jsd-stage">' +
        '<div class="jsd-3d" role="img" aria-label="' + esc(T.alt) + '">' +
          '<div class="jsd-photo"><img src="' + esc(PHOTO_S) + '" srcset="' + esc(PHOTO_S) + ' 900w, ' + esc(PHOTO) + ' 1334w" sizes="(max-width:980px) 60vw, 44vw" alt="" decoding="async"></div>' +
        '</div>' +
        '<div class="jsd-ov">' + coHTML('vent') + coHTML('dry') + coHTML('heat') +
          '<div class="jsd-tag"><div class="jsd-tag-in"><div class="jsd-tag-b"><span class="jsd-tag-p"><b></b><i></i></span><small>' + esc(T.day) + '</small></div></div></div>' +
        '</div>' +
        '<span class="jsd-scrim"></span>' +
        '<div class="jsd-meta"><span class="jsd-hint">' + ICON.turn + esc(T.hint) + '</span>' +
          '<button type="button" class="jsd-ph" data-jsd="galerija" aria-haspopup="dialog">' + ICON.photos + esc(T.photo) + '</button></div>' +
      '</div>' +
      '<div class="jsd-body">' +
        '<div class="jsd-kicker jsd-up" style="--d:.26s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jsd-h"><span class="jsd-up" style="--d:.36s">' + esc(T.h[0]) + '</span><span class="jsd-o jsd-up" style="--d:.46s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jsd-lead jsd-up" style="--d:.6s">' + esc(T.lead) + '</p>' +
        '<div class="jsd-pack jsd-up" style="--d:.72s" role="group" aria-labelledby="jsd-pk">' +
          '<p class="jsd-pack-h" id="jsd-pk"><span class="jsd-pk-t"></span><small>' + esc(T.packSub) + '</small></p>' +
          '<div class="jsd-grid">' + gridHTML() + '</div>' +
          '<div class="jsd-fill"><i></i><span aria-live="polite"></span></div>' +
        '</div>' +
        '<div class="jsd-how jsd-up" style="--d:.84s"><span class="jsd-lab" id="jsd-hw">' + esc(T.how) + '</span><ol class="jsd-steps" aria-labelledby="jsd-hw">' + stepsHTML() + '</ol></div>' +
        '<div class="jsd-acts jsd-up" style="--d:.96s">' +
          '<a class="jsd-btn jsd-btn--solid" href="' + esc(PAGE) + '" data-jsd="stranica">' + ICON.arrow + lbl(T.more, T.moreS) + '</a>' +
          '<a class="jsd-btn jsd-btn--ghost" href="' + esc(MAP) + '" target="_blank" rel="noopener" data-jsd="mapa">' + ICON.pin + lbl(T.map, T.mapS) + '</a>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  var frame = q('.jsd-frame'), host = q('.jsd-3d'), ov = q('.jsd-ov');

  /* ---------- podaci u tekstu (cijena na privjesku, setovi, koraci) ---------- */
  function renderData() {
    q('.jsd-tag-p b').textContent = money(DATA.price);
    q('.jsd-tag-p i').textContent = DATA.cur;
    q('.jsd-tag').setAttribute('aria-label', T.tagA + ': ' + money(DATA.price) + ' ' + DATA.cur);
    q('.jsd-pk-t').textContent = T.pack(setWord(DATA.sets));
    q('.jsd-steps').innerHTML = stepsHTML();
    ['vent', 'dry', 'heat'].forEach(function (k) { q('.jsd-co[data-co="' + k + '"]').classList.toggle('is-off', !DATA.feat[k]); });
  }

  /* ---------- SPAKUJTE DEPO: dugmad ↔ oprema u 3D ormariću ---------- */
  var api = null, flat = false;
  function itemName(k) { return T.items[KINDS.indexOf(k)]; }
  function syncBtns() {
    var n = 0;
    qa('.jsd-it').forEach(function (b) {
      var key = b.getAttribute('data-k') + b.getAttribute('data-s'), on = !!STATE[key];
      if (on) n++;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', (on ? T.rem : T.add) + ': ' + itemName(b.getAttribute('data-k')) + ', ' + T.set + ' ' + (+b.getAttribute('data-s') + 1));
      if (flat) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    q('.jsd-fill').style.setProperty('--f', (n / 8).toFixed(3));
    q('.jsd-fill span').textContent = T.fill(n, 8);
  }
  q('.jsd-grid').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.jsd-it');
    if (!b || flat) return;
    var k = b.getAttribute('data-k'), s = +b.getAttribute('data-s'), key = k + s, on = !STATE[key];
    STATE[key] = on; syncBtns();
    b.classList.add('is-pop'); setTimeout(function () { b.classList.remove('is-pop'); }, 180);
    if (api) api.set(k, s, on, true);
    track('depo_oprema', { predmet: k, set: s + 1, akcija: on ? 'dodaj' : 'ukloni' });
  });
  renderData(); syncBtns();

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
    root.classList.toggle('jsd--boxed', boxed);
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
    // VIP gondola je odmah iznad (bez razmaka) → ona već daje razmak, ovdje ostaje samo rub
    var gn = d.getElementById('jg-gondola');
    root.classList.toggle('jsd--join', !boxed && !!gn && !gn.classList.contains('jg--boxed') &&
      Math.abs(gn.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
    layout();
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

  /* ---------- raspored scene: ormarić 61 na sredini lijevog dijela kadra (računar) ili scene (tablet/telefon) ---------- */
  var FX = .3, stacked = false;
  function layout() {
    var fw = frame.clientWidth || 1;
    stacked = w.getComputedStyle(frame).flexDirection === 'column';
    var bw = q('.jsd-body').offsetWidth;
    // računar: sredina prostora lijevo od teksta (malo ulijevo, da desno stanu natpisi); telefon: malo lijevo od sredine
    FX = stacked ? (fw < 761 ? .36 : .4) : Math.max(.2, (fw - bw) * .44 / fw);
    frame.style.setProperty('--fx', FX.toFixed(3));
    if (api) { api.setLayout({ fx: FX, minWidth: stacked ? 1.05 : 1.3 }); }
  }

  /* ---------- infografika na ormariću: prati 3D (tačke, linije do zajedničke kolone natpisa, privjesak) ---------- */
  var coOn = false;
  function place(a) {
    if (!a || !a.r) return;
    var hw = host.clientWidth, col = Math.min(a.r.x + (stacked ? 26 : 56), hw - (stacked ? 110 : 190));
    ['vent', 'dry', 'heat'].forEach(function (k) {
      var el = q('.jsd-co[data-co="' + k + '"]'), p = a[k];
      el.style.setProperty('--x', p.x.toFixed(1) + 'px');
      el.style.setProperty('--y', p.y.toFixed(1) + 'px');
      el.style.setProperty('--len', Math.max(14, col - p.x).toFixed(1) + 'px');
    });
    var tg = q('.jsd-tag'), t = a.tag;
    tg.style.setProperty('--x', t.x.toFixed(1) + 'px');
    tg.style.setProperty('--y', t.y.toFixed(1) + 'px');
    tg.classList.toggle('is-on', coOn && a.door > .85 && t.z < 1);
  }
  function showCallouts() {
    coOn = true;
    qa('.jsd-co').forEach(function (el, i) { setTimeout(function () { el.classList.add('is-on'); }, reduced ? 0 : i * 170); });
    if (api) place(api.anchors());
    // privjesak se jednom lagano zanjiše kad se pojavi
    var tin = q('.jsd-tag-in');
    if (!reduced) { tin.style.setProperty('--sw', '9deg'); setTimeout(function () { tin.style.setProperty('--sw', '0deg'); }, 80); }
  }

  /* ---------- 3D: učitava se tek kad se sekcija približi; bez WebGL-a ostaje fotografija ---------- */
  function webgl() { try { var c = d.createElement('canvas'); return !!(w.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  var loading = null;
  function load3d() {
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      if (!webgl()) return rej(new Error('WebGL'));
      if (w.JSD3D) return res(w.JSD3D);
      var s = d.createElement('script');
      s.src = HERE + 'depo-3d.js'; s.async = true;
      if (/^sha384-[A-Za-z0-9+\/=]{40,}$/.test(SRI3D) && /^https:/.test(s.src)) { s.integrity = SRI3D; s.crossOrigin = 'anonymous'; }
      s.onload = function () { w.JSD3D ? res(w.JSD3D) : rej(new Error('3D')); };
      s.onerror = function () { rej(new Error('depo-3d.js')); };
      d.head.appendChild(s);
    }).then(function (lib) {
      api = lib.create(host, {
        reduced: reduced, low: LOW, font: "'Barlow', Arial, sans-serif",
        onFrame: place,
        onDrag: function () {
          host.classList.add('is-drag'); q('.jsd-hint').classList.add('is-gone');
          if (!load3d.turned) { load3d.turned = true; track('depo_okretanje', {}); }
        }
      });
      root.__jsd3d = api;   // za testove i provjeru u konzoli
      layout();
      // stanje dugmadi = stanje ormarića; prije ulaska vrata su zatvorena i ormarić prazan
      if (entered) start(); else api.setOpen(0);
      host.classList.add('is-ready');
      return api;
    });
    loading.catch(function (e) {
      flat = true; syncBtns(); frame.classList.add('jsd--flat');
      if (w.console) console.warn('[Jahorina Ski depo] 3D', e);
    });
    return loading;
  }
  function up() { host.classList.remove('is-drag'); }
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

  // ulazak: vrata se otvore (svjetlo iz ormarića), oprema prvog seta uleti jedna za drugom, pa se iscrta infografika
  var entered = false, started = false;
  function start() {
    if (started || !api) return; started = true;
    if (reduced) {
      api.setOpen(1);
      KINDS.forEach(function (k) { [0, 1].forEach(function (s) { if (STATE[k + s]) api.set(k, s, true, false); }); });
      showCallouts(); return;
    }
    setTimeout(function () {
      api.open().then(function () {}, function () {});
      var t = 900;
      KINDS.forEach(function (k) {
        [0, 1].forEach(function (s) {
          if (!STATE[k + s]) return;
          setTimeout(function () { if (STATE[k + s]) api.set(k, s, true, true); }, t); t += 190;
        });
      });
      setTimeout(showCallouts, t + 450);
    }, 650);
  }

  /* ---------- dolazak kadra: dok ulazi u ekran, iz malo manjeg „sjedne“ na svoje mjesto (prelaz iz teme, kao ratrak) ---------- */
  (function rise() {
    if (!('scale' in frame.style) || reduced) return;
    var raf = 0, last = -1;
    function upd() {
      raf = 0;
      var vh = w.innerHeight || d.documentElement.clientHeight, t = frame.parentNode.getBoundingClientRect().top + frame.offsetTop;
      var k = Math.min(1, Math.max(0, (vh - t) / (vh * .62))); k = 1 - Math.pow(1 - k, 3);
      if (Math.abs(k - last) < .002) return; last = k;
      frame.style.scale = k < 1 ? String(1 - (d.documentElement.clientWidth < 761 ? .03 : .06) * (1 - k)) : '';
      frame.style.willChange = k > 0 && k < 1 ? 'scale' : '';
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
    var b = e.target.closest && e.target.closest('[data-jsd]');
    if (!b) return;
    var k = b.getAttribute('data-jsd');
    if (k === 'galerija') lbOpen(0);
    else track('depo_klik', { cilj: k });
  });

  /* ---------- fotografije preko cijelog ekrana ---------- */
  var lb, lbImg, lbCap, lbCur = 0, lbBack = null, lbOverflow = '';
  function lbBuild() {
    lb = d.createElement('div'); lb.id = 'jsd-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.gal);
    lb.innerHTML = '<figure><img alt="" decoding="async"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="jsd-lb-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>' +
      '<button type="button" class="jsd-lb-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jsd-lb-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button>';
    d.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('figcaption');
    lb.querySelector('.jsd-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.jsd-lb-prev').addEventListener('click', function () { lbShow(lbCur - 1); });
    lb.querySelector('.jsd-lb-next').addEventListener('click', function () { lbShow(lbCur + 1); });
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
  function lbShow(k) {
    var n = GAL.length; lbCur = (k % n + n) % n;
    lbImg.src = GAL[lbCur].full;
    lbImg.alt = GAL[lbCur].alt || (T.photoN + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T.kicker);
    lbCap.textContent = (lbCur + 1) + ' / ' + n;
    if (n > 1) { var pre = new Image(); pre.src = GAL[(lbCur + 1) % n].full; }
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
  function lbOpen(k) {
    if (!GAL.length) return;
    if (!lb) lbBuild();
    lb.classList.toggle('is-one', GAL.length < 2);
    lbBack = d.activeElement; lbShow(k || 0);
    lbOverflow = d.documentElement.style.overflow; d.documentElement.style.overflow = 'hidden';
    lb.classList.add('is-shown'); void lb.offsetWidth; lb.classList.add('is-open');
    lb.querySelector('.jsd-lb-close').focus();
    d.addEventListener('keydown', lbKey);
    track('depo_galerija', {});
  }
  function lbClose() {
    lb.classList.remove('is-open');
    d.documentElement.style.overflow = lbOverflow;
    d.removeEventListener('keydown', lbKey);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.classList.remove('is-shown'); }, 320);
    if (lbBack && lbBack.focus) lbBack.focus();
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica ski depoa ---------- */
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
  function api2(path, query) {
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
  var NUMW = { jedan: 1, jedna: 1, dva: 2, dvije: 2, tri: 3, 'četiri': 4, cetiri: 4, one: 1, two: 2, three: 3, four: 4 };
  function parse(pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    // razmak poslije svakog bloka, da se pasusi ne slijepe u tekstu
    [].forEach.call(b.querySelectorAll('p,li,div,br,h1,h2,h3,h4,h5,h6,td'), function (e) { e.parentNode.insertBefore(b.ownerDocument.createTextNode(' '), e.nextSibling); });
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var txt = clean(b.textContent), m, r = { feat: null };
    // uvod: prva rečenica prvog pasusa (bez naslova i cijene)
    var all = [].concat.apply([], ps.map(sentences)).filter(function (s) { return !/\d\s*(KM|BAM|€)/i.test(s); });
    r.lead = all.length ? clip(all[0], 260) : '';
    // cijena za jedan dan
    if ((m = txt.match(/(?:jedan\s+dan|dnevn[a-z]*|one\s+day|a\s+day|per\s+day|daily)[^.]{0,90}?(\d+(?:[.,]\d{1,2})?)\s*(KM|BAM|€|EUR)/i)) ||
        (m = txt.match(/(\d+(?:[.,]\d{1,2})?)\s*(KM|BAM|€|EUR)\s*(?:po|per|\/)\s*(?:ski\s*)?(?:depo|dan|day|locker)/i)))
      r.price = { v: m[1], cur: /€|eur/i.test(m[2]) ? '€' : 'KM' };
    // depozit za karticu
    if ((m = txt.match(/(?:depozit|deposit)[^.\d]{0,60}(\d+(?:[.,]\d{1,2})?)\s*(KM|BAM|€|EUR)/i)))
      r.dep = { v: m[1], cur: /€|eur/i.test(m[2]) ? '€' : 'KM' };
    // koliko setova stane
    if ((m = txt.match(/(\d|jedan|jedna|dva|dvije|tri|četiri|cetiri|one|two|three|four)\s+(?:pun[a-z]*\s+set|full\s+set|set[a-z]*\s+(?:skijašk|ski\b|oprem))/i)))
      r.sets = /^\d$/.test(m[1]) ? +m[1] : NUMW[m[1].toLowerCase()];
    // mjesto: "na polazu gondole Poljice" / "Poljice gondola"
    if ((m = txt.match(/gondol[a-z]*\s+([A-ZŠĐČĆŽ][a-zšđčćž]{3,})/)) || (m = txt.match(/([A-ZŠĐČĆŽ][a-zšđčćž]{3,})\s+gondola/))) r.place = m[1];
    // oprema depoa (ako stranica nabraja ventilaciju, sušenje, grijanje)
    var fv = /ventila/i.test(txt), fd = /sušen|susen|\bdry|drying/i.test(txt), fh = /grijan|grejan|heat/i.test(txt);
    if (fv || fd || fh) r.feat = { vent: fv, dry: fd, heat: fh };
    var seen = {};
    r.imgs = [].slice.call(b.querySelectorAll('img')).map(fromImg).filter(function (x) {
      if (!x || seen[key(x.full)]) return false; seen[key(x.full)] = 1; return true;
    });
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    r.link = link;
    r.title = clean(new DOMParser().parseFromString('<body>' + pickLang(pg.title && pg.title.rendered || ''), 'text/html').body.textContent);
    return r;
  }
  function page() {
    var F = '&_fields=id,link,title,content';
    return api2('pages', 'slug=' + encodeURIComponent(SLUG) + F).then(function (j) {
      if (j && j[0]) return j[0];
      // slug nije tačan → stranica čiji naslov ima "depo" (ski depo, ski depoi, ski locker)
      return api2('pages', 'search=depo&per_page=20' + F).then(function (k) {
        var hit = (k || []).filter(function (x) { var t = pickLang(x.title && x.title.rendered || ''); return /depo|locker|ormari/i.test(t); })[0];
        if (!hit) throw new Error('Stranica "' + SLUG + '" nije pronađena');
        return hit;
      });
    });
  }
  function apply(r) {
    var miss = [];
    // nadnaslov: naslov stranice, dio prije crte ("Ski depoi – sigurno …" → "Ski depoi")
    var kt = r.title.split(/\s[–—-]\s|[:|]/)[0].trim();
    if (kt && kt.length <= 32 && kt !== q('.jsd-kicker').textContent) q('.jsd-kicker').textContent = kt;
    if (r.lead) { if (r.lead !== q('.jsd-lead').textContent) q('.jsd-lead').textContent = r.lead; } else miss.push('tekst');
    if (r.price) { DATA.price = r.price.v; DATA.cur = r.price.cur; } else miss.push('cijena za jedan dan (npr. "15 KM")');
    if (r.dep) { DATA.dep = r.dep.v; DATA.depCur = r.dep.cur; }
    if (r.sets) DATA.sets = r.sets;
    if (r.place) DATA.place = r.place;
    if (r.feat) DATA.feat = r.feat;
    renderData();
    if (r.link) q('a[data-jsd="stranica"]').setAttribute('href', r.link);
    if (!FIXED_GAL && r.imgs.length) GAL = BASE.concat(r.imgs);
    if (miss.length) why('stranica nema: ' + miss.join(', '));
    ld();
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jsd-why') || q('.jsd-body').appendChild(d.createElement('small'));
    el.className = 'jsd-why'; el.textContent = T.why + ': ' + msg + ' (' + T.whyTail + ')';
  }

  /* ---------- schema.org za Google (usluga sa cijenom po danu) ---------- */
  function ld() {
    var sc = d.getElementById('jsd-ld');
    if (!sc) { sc = d.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'jsd-ld'; (d.head || d.documentElement).appendChild(sc); }
    var pr = String(money(DATA.price)).replace(',', '.');
    sc.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Ski locker',
      name: T.kicker, description: q('.jsd-lead').textContent, image: abs(PHOTO),
      provider: { '@type': 'Organization', name: 'Olimpijski centar Jahorina', url: O + '/' },
      areaServed: { '@type': 'Place', name: 'Jahorina' },
      offers: { '@type': 'Offer', url: q('a[data-jsd="stranica"]').href,
        priceSpecification: { '@type': 'UnitPriceSpecification', price: pr, priceCurrency: DATA.cur === '€' ? 'EUR' : 'BAM', unitText: EN ? 'day' : 'dan', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' } } }
    });
  }
  ld();
  if (w.fetch && w.DOMParser && w.Promise) page().then(function (pg) { apply(parse(pg)); }).catch(function (e) {
    if (w.console) console.warn('[Jahorina Ski depo]', e);
    why(e && e.message || 'REST');
  });

  /* ---------- pokretanje: raspored, 3D kad se sekcija približi, ulazak kad uđe u ekran, pauza van ekrana ---------- */
  fit();
  w.addEventListener('resize', refit);
  if ('ResizeObserver' in w) { new ResizeObserver(refit).observe(d.body); new ResizeObserver(function () { if (api) api.resize(); }).observe(host); }
  if ('IntersectionObserver' in w) {
    var near = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { near.disconnect(); load3d(); }
    }, { rootMargin: '1200px 0px 1200px 0px' });
    near.observe(frame);
    // van ekrana se ne crta (štedi bateriju)
    new IntersectionObserver(function (es) {
      if (!api) return;
      if (es[0].isIntersecting) api.resume(); else api.pause();
    }).observe(frame);
    if (!reduced) {
      root.classList.add('jsd-anim');
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { root.classList.add('jsd-on'); io.disconnect(); entered = true; start(); }
      }, { rootMargin: '0px 0px -12% 0px' });
      io.observe(frame);
    } else entered = true;
  } else { entered = true; load3d(); }
})(window, document);
