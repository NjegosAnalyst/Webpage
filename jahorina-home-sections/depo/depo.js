/* =====================================================================
   JAHORINA — SKI DEPO (početna, ispod VIP gondole) · v2 "Bijela vrata" (30. 10. 2026)
   Tema hero-a (noćni kadar, jedan cyan akcenat, Archivo/Barlow), a jedina svijetla površina u sekciji su VRATA ORMARIĆA:
   bijela kao pravi ormarići u depou (crna gumena traka, broj 61 kao na fotografiji), na njima ono što posjetilac treba
   da zna — cijena po danu, koliko opreme stane i šta ormarić radi (sušenje, grijanje, ventilacija).
     · lijevo prava fotografija otvorenog ormarića 61 (telefon: gore), desno tekst, vrata, koraci i dugmad;
     · jedan pokret: kad sekcija uđe u ekran, odškrinuta vrata se zatvore (svjetlo iz ormarića se ugasi);
       mišem/fokusom se vrata malo odškrinu;
     · koraci 1–3 "Kako do depoa" (pravi redoslijed): ski kasa → kartica depoa (depozit) → skeniranje u stanici.
   Zamijenio je v1 "3D ormarić" (three.js, slaganje opreme) — korisnik: "hoću potpuno da izmijenim".

   SADRŽAJ JE IZ WORDPRESSA (stranica ski depoa, data-stranica = slug; ako slug ne postoji, traži se stranica sa "depo"):
     mali tekst = naslov stranice (dio prije crte); uvod = prva rečenica; cijena za jedan dan, broj setova, depozit za
     kartu, mjesto (gondola …) i oprema depoa (ventilacija, sušenje, grijanje) iz teksta; "Više o ski depou" = link stranice.
     Dok WordPress ne odgovori, stoji ugrađeni tekst (isti kao na stranici 9. 10. 2026). Prijavljeni admin vidi razlog.

   Ugradnja: Elementor HTML widget sa <div id="jsd-depo"></div> + ovaj fajl sa jsDelivr-a (fotografija iz istog commita).
   Podešavanja na <div id="jsd-depo"> (sva su neobavezna):
     data-stranica="ski-depo"      (slug WordPress stranice)
     data-mapa="https://…"         (link dugmeta Lokacija; podrazumijevano Google Maps: gondola Poljice, Jahorina)
     data-slika="https://…"        (zamjena za fotografiju ormarića)
   GA: "Više o ski depou" i Lokacija → depo_klik (cilj: stranica | mapa).
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
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'ski-depo').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var MAP = opt('mapa', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Gondola Poljice, Jahorina'));
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ugrađeni tekst = tekst stranice ski depoa (9. 10. 2026); kratki natpisi na vratima su dizajn; EN je prevod
  var T = EN ? {
    kicker: 'Ski lockers', h: ['Leave your gear', 'on the mountain'],
    lead: 'One of the best and most practical ways to look after your gear is to use a ski locker.',
    day: 'per day', priceA: 'Price per locker per day',
    sets: function (n) { return n + ' full sets of gear'; },
    setsSub: function (n) { return 'Skis, boots, helmets and gloves for ' + ({ 1: 'one person', 2: 'two people', 3: 'three people', 4: 'four people' }[n] || n + ' people'); },
    feat: { dry: 'Drying', heat: 'Heating', vent: 'Ventilation' },
    door: 'Ski locker at a glance',
    how: 'How to get a locker',
    steps: [['Ski ticket office', 'at the {g} gondola base'], ['Locker card', '{d} deposit'], ['Scan your card', 'inside the base station']],
    more: 'More about ski lockers', moreS: 'More', map: 'Location', mapS: 'Location',
    photo: 'Open ski locker 61 with drying holders, gloves, skis and poles',
    why: 'WordPress', whyTail: 'showing built-in content'
  } : {
    kicker: 'Ski depo', h: ['Ostavite opremu', 'na planini'],
    lead: 'Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.',
    day: 'po danu', priceA: 'Cijena po depou za jedan dan',
    sets: function (n) { return n + ' kompletna seta opreme'; },
    setsSub: function (n) { return 'Skije, pancerice, kacige i rukavice za ' + ({ 1: 'jednu osobu', 2: 'dvije osobe', 3: 'tri osobe', 4: 'četiri osobe' }[n] || n + ' osoba'); },
    feat: { dry: 'Sušenje', heat: 'Grijanje', vent: 'Ventilacija' },
    door: 'Ski depo ukratko',
    how: 'Kako do depoa',
    steps: [['Ski kasa', 'na polazu gondole {g}'], ['Kartica depoa', 'depozit {d}'], ['Skenirajte karticu', 'u polaznoj stanici']],
    more: 'Više o ski depou', moreS: 'Više', map: 'Lokacija', mapS: 'Lokacija',
    photo: 'Otvoren ski depo 61 sa nosačima za sušenje, rukavicama, skijama i štapovima',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj'
  };
  // podaci sa stranice (9. 10. 2026); WordPress ih zamijeni kad se promijene
  var DATA = { price: '15', cur: 'KM', dep: '10', depCur: 'KM', sets: 2, place: 'Poljice', feat: { dry: true, heat: true, vent: true } };
  var PHOTO = opt('slika', HERE + 'slike/depo-ormaric.webp'), PHOTO_S = opt('slika', HERE + 'slike/depo-ormaric-900.webp');

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.58);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--nm-surface:rgba(16,25,42,.62);--nm-raised:4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16),inset 1px 1px 0 rgba(255,255,255,.05);',
    /* vrata: bijeli plastificirani lim kao pravi ormarići; tekst na njima tamno-plav, akcenat tamniji cyan (kontrast na bijelom) */
    '--door:#F2F5F8;--door-2:#DFE6ED;--ink:#0D1524;--ink-2:#46546A;--ink-acc:#0083BD;',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsd--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2,#R h3{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;letter-spacing:0;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ol,#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je VIP gondola odmah iznad (.jsd--join), ona već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jsd-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsd--join .jsd-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsd-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jsd-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar: fotografija lijevo (uspravna, kao ormarić), tekst desno */
    '#R .jsd-frame{position:relative;display:grid;grid-template-columns:minmax(0,44fr) minmax(0,56fr);min-height:clamp(620px,48vw,760px);border-radius:26px;overflow:hidden;isolation:isolate;',
    'background:radial-gradient(80% 90% at 70% 40%,#121c30 0,#0b1322 60%,#080e1a 100%);box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsd-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jsd-shot{position:relative;margin:0;min-height:100%;overflow:hidden}',
    '#R .jsd-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:46% 30%;filter:saturate(.78) brightness(.82) contrast(1.06)}',
    /* noćna obrada + prelaz u kadar (desno i dolje), da bijeli ormarići ne "svijetle" jače od vrata */
    '#R .jsd-shot::after{content:"";position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(11,19,34,0) 55%,rgba(11,19,34,.7) 88%,#0b1322 100%),linear-gradient(0deg,rgba(8,14,26,.55) 0%,rgba(8,14,26,0) 30%),linear-gradient(rgba(14,38,78,.22),rgba(14,38,78,.22))}',

    '#R .jsd-body{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0;padding:clamp(48px,5vw,84px) var(--side) clamp(48px,5vw,84px) clamp(28px,3.4vw,56px)}',
    /* mali tekst = naziv usluge (kao novi mali tekst hero-a: obična slova, cyan linija) */
    '#R .jsd-kicker{display:flex;align-items:center;gap:14px;font:600 15px/1.2 var(--fd);letter-spacing:.2px;color:rgba(255,255,255,.82);margin-bottom:20px}',
    '#R .jsd-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(42px,4.4vw,68px);font-weight:800;line-height:.94;letter-spacing:-.022em!important}',
    '#R h2 > span{display:block}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsd-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jsd-lead{margin-top:20px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.6;color:var(--text-2)!important;max-width:46ch;text-wrap:pretty}',

    /* VRATA: šarke lijevo; iza njih unutrašnjost ormarića (svjetlo se vidi samo dok su odškrinuta) */
    '#R .jsd-hinge{position:relative;width:min(100%,540px);margin-top:32px;perspective:1600px}',
    '#R .jsd-hinge::before{content:"";position:absolute;inset:6px 0 6px 6px;border-radius:12px;pointer-events:none;',
    'background:linear-gradient(90deg,#0a0f18 0%,#121a28 60%,#1d2a40 100%);box-shadow:inset -18px 0 26px -10px rgba(200,236,255,.5);opacity:var(--open,0);transition:opacity .5s ease}',
    '#R .jsd-door{position:relative;display:grid;grid-template-columns:clamp(34px,3.2vw,42px) minmax(0,1fr);column-gap:clamp(20px,2.2vw,30px);padding:22px clamp(20px,2.4vw,30px) 24px clamp(14px,1.4vw,20px);border-radius:12px;',
    'color:var(--ink);background:linear-gradient(180deg,var(--door) 0%,var(--door-2) 100%);transform-origin:0 50%;transform:rotateY(calc(var(--open,0) * -16deg));',
    'box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(13,21,36,.08),inset -1px 0 0 rgba(13,21,36,.06),0 34px 60px -34px rgba(0,0,0,.95),0 0 0 1px rgba(255,255,255,.04);',
    'transition:transform .7s cubic-bezier(.2,.7,.2,1)}',
    /* crna gumena traka kao na pravim vratima; gore čitač kartice sa cyan svjetlom (depo se otvara skeniranjem kartice) */
    '#R .jsd-strip{position:relative;grid-row:1 / span 4;align-self:stretch;border-radius:8px;background:linear-gradient(180deg,#1b2029 0%,#111419 100%);box-shadow:inset 0 1px 2px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,255,255,.06)}',
    '#R .jsd-strip::before{content:"";position:absolute;left:22%;right:22%;top:14px;aspect-ratio:1;border-radius:6px;background:#0b0e13;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}',
    '#R .jsd-strip::after{content:"";position:absolute;left:50%;top:14px;width:6px;height:6px;margin:calc(28% - 3px) 0 0 -3px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.9)}',   /* sredina čitača (margin u % = širina trake) */
    '#R .jsd-no{grid-column:2;justify-self:end;font:600 14px/1 var(--fd);letter-spacing:.06em;color:#7E8A9B;margin-bottom:6px}',
    '#R .jsd-price{grid-column:2;display:flex;align-items:baseline;flex-wrap:wrap;column-gap:10px;padding-bottom:16px;border-bottom:1px solid rgba(13,21,36,.12)}',
    '#R .jsd-price b{font:800 clamp(48px,4.6vw,62px)/.9 var(--fd);letter-spacing:-.03em;color:var(--ink);font-variant-numeric:tabular-nums}',
    '#R .jsd-price i{font:700 21px/1 var(--fd);font-style:normal;color:var(--ink-acc)}',
    '#R .jsd-price span{font:500 16px/1 var(--fb);color:var(--ink-2)}',
    '#R .jsd-sets{grid-column:2;padding:15px 0;border-bottom:1px solid rgba(13,21,36,.12)}',
    '#R .jsd-sets b{display:block;font:700 18px/1.25 var(--fd);color:var(--ink)}',
    '#R .jsd-sets span{display:block;margin-top:4px;font:500 14.5px/1.4 var(--fb);color:var(--ink-2)}',
    '#R .jsd-feat{grid-column:2;display:flex;flex-wrap:wrap;gap:8px 20px;padding-top:15px}',
    '#R .jsd-feat li{display:flex;align-items:center;gap:7px;font:600 14.5px/1.2 var(--fd);color:var(--ink)}',
    '#R .jsd-feat svg{width:19px;height:19px;color:var(--ink-acc)}',
    '#R .jsd-feat li.is-off{display:none}',
    /* mišem ili fokusom (tastatura) vrata se malo odškrinu */
    '@media (hover:hover){#R .jsd-hinge:hover{--open:.32}}',
    '#R .jsd-hinge:focus-within{--open:.32}',

    /* koraci (pravi redoslijed): broj u krugu, tanka linija između */
    '#R .jsd-how{margin-top:32px;width:min(100%,560px)}',
    '#R .jsd-how h3{font-size:15px!important;font-weight:600!important;line-height:1.2!important;color:rgba(255,255,255,.82)!important}',
    '#R .jsd-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:16px!important}',
    '#R .jsd-steps li{position:relative;min-width:0}',
    '#R .jsd-steps li::after{content:"";position:absolute;left:40px;right:-8px;top:14px;height:1px;background:linear-gradient(90deg,rgba(0,185,242,.5),rgba(255,255,255,.12))}',
    '#R .jsd-steps li:last-child::after{display:none}',
    '#R .jsd-steps em{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;font:700 13px/1 var(--fd);font-style:normal;color:var(--accent-2);box-shadow:inset 0 0 0 1px rgba(0,185,242,.5)}',
    '#R .jsd-steps b{display:block;margin-top:12px;font:600 15px/1.3 var(--fd);color:#fff}',
    '#R .jsd-steps small{display:block;margin-top:3px;font:500 14px/1.4 var(--fb);color:var(--text-3)}',

    /* dugmad kao u hero-u i ostalim blokovima: cyan pločica + staklena pločica */
    '#R .jsd-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px}',
    '#R .jsd-cta,#R .jsd-pill{display:inline-flex;align-items:center;justify-content:center;gap:9px;height:48px;padding:0 22px!important;border-radius:16px;white-space:nowrap;font:600 15px/1 var(--fd);letter-spacing:0;color:#fff!important;transition:transform .2s ease,box-shadow .25s ease,filter .2s,color .2s}',
    '#R .jsd-cta{font-weight:700;background:linear-gradient(160deg,#45D6FF 0%,#00AEE6 50%,#008BC7 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 0 0 1px rgba(255,255,255,.18),0 10px 24px -10px rgba(0,185,242,.95)}',
    '#R .jsd-cta:hover,#R .jsd-cta:focus-visible{filter:brightness(1.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 0 0 1px rgba(255,255,255,.3),0 12px 28px -8px rgba(0,185,242,1)}',
    '#R .jsd-pill{background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)}',
    '#R .jsd-pill svg{width:16px;height:16px;color:var(--accent)}',
    '#R .jsd-pill:hover,#R .jsd-pill:focus-visible{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.3)}',
    '#R .jsd-cta:active,#R .jsd-pill:active{transform:scale(.96)}',
    '#R .jsd-s{display:none}',
    '#R .jsd-why{display:block;margin-top:14px;font:500 12px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): kadar i tekst se pojave, a odškrinuta vrata se zatvore (jedini veći pokret u sekciji) */
    '#R.jsd-anim .jsd-frame{opacity:0;transform:translateY(24px)}',
    '#R.jsd-anim.jsd-on .jsd-frame{opacity:1;transform:none;transition:opacity .5s ease,transform .7s cubic-bezier(.2,.7,.2,1)}',
    '#R.jsd-anim .jsd-shot img{opacity:0;transform:scale(1.04)}',
    '#R.jsd-anim.jsd-on .jsd-shot img{opacity:1;transform:none;transition:opacity .7s ease,transform 1.2s cubic-bezier(.2,.7,.2,1)}',
    '#R.jsd-anim .jsd-up{opacity:0;transform:translateY(16px)}',
    '#R.jsd-anim.jsd-on .jsd-up{opacity:1;transform:none;transition:opacity .55s ease var(--d,0s),transform .75s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    /* odškrinuta dok sekcija ne uđe (pravilo je poslije :hover, pa ima prednost dok traje ulazak) */
    '#R .jsd-hinge.is-ajar{--open:1}',
    '#R .jsd-hinge.is-closing .jsd-door{transition-duration:1.1s}',
    '#R .jsd-hinge.is-closing::before{transition-duration:.9s}',

    /* manji laptop / tablet uspravno */
    '@media (max-width:1060px){#R .jsd-frame{grid-template-columns:minmax(0,36fr) minmax(0,64fr)}#R .jsd-steps{gap:12px}}',
    /* tablet i telefon: fotografija gore (uska traka ormarića), tekst ispod */
    '@media (max-width:860px){',
    '#R .jsd-frame{grid-template-columns:1fr;min-height:0}',
    '#R .jsd-shot{height:min(70vw,440px);min-height:0}',
    '#R .jsd-shot img{object-position:44% 34%}',
    '#R .jsd-shot::after{background:linear-gradient(0deg,#0b1322 0%,rgba(11,19,34,.6) 28%,rgba(11,19,34,0) 58%),linear-gradient(rgba(14,38,78,.22),rgba(14,38,78,.22))}',
    '#R .jsd-body{margin-top:-64px;padding:0 clamp(22px,6vw,56px) clamp(30px,5vw,52px)}}',
    '@media (max-width:760px){',
    '#R .jsd-frame{border-radius:24px}',
    '#R .jsd-shot{height:min(96vw,420px)}',
    '#R .jsd-body{padding:0 20px 30px}',
    '#R .jsd-kicker{font-size:13.5px;gap:10px;margin-bottom:14px}',
    '#R .jsd-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.4vw,54px)}',
    '#R .jsd-lead{margin-top:16px}',
    '#R .jsd-hinge{margin-top:26px}',
    '#R .jsd-door{grid-template-columns:28px minmax(0,1fr);column-gap:16px;padding:18px 18px 20px 12px;border-radius:11px}',
    '#R .jsd-strip{border-radius:6px}',
    '#R .jsd-strip::before{top:10px;border-radius:4px}',
    '#R .jsd-strip::after{top:10px;width:5px;height:5px;margin:calc(28% - 2.5px) 0 0 -2.5px}',
    '#R .jsd-price b{font-size:50px}',
    '#R .jsd-sets b{font-size:17px}',
    '#R .jsd-sets span{font-size:14px}',
    '#R .jsd-feat{gap:8px 16px}',
    '#R .jsd-feat li{font-size:14px}',
    '#R .jsd-how{margin-top:28px}',
    '#R .jsd-steps{grid-template-columns:1fr;gap:0}',
    '#R .jsd-steps li{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:14px;padding-bottom:16px!important}',
    '#R .jsd-steps li::after{left:13.5px;right:auto;top:32px;bottom:2px;width:1px;height:auto;background:linear-gradient(180deg,rgba(0,185,242,.5),rgba(255,255,255,.12))}',
    '#R .jsd-steps em{grid-row:1 / span 2}',
    '#R .jsd-steps b{margin-top:4px}',
    '#R .jsd-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:22px;width:100%}',
    '#R .jsd-cta,#R .jsd-pill{height:46px;padding:0 14px!important;font-size:14px}',
    '#R .jsd-l{display:none}',
    '#R .jsd-s{display:inline}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jsd-depo');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jsd-css');
  if (!st) { st = d.createElement('style'); st.id = 'jsd-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  // fontovi jednom na stranici: isti link (Archivo 500–800 + Barlow 300–700) dodaje se u <head> samo ako ga još nema
  if (!d.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="family=Archivo"][href*="family=Barlow"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    (d.head || d.documentElement).appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  function svg(p) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    vent: svg('<path d="M3.5 8.5 H13 C15 8.5 16.2 6.8 15.4 5.2 C14.7 3.8 12.7 3.8 12.2 5.3 M3.5 12 H18.4 C20.4 12 21.4 14.1 20.4 15.6 C19.6 16.8 17.8 16.6 17.4 15.3 M3.5 15.5 H11" ' + S + '/>'),
    dry: svg('<path d="M12 3.6 C12 3.6 6.8 9.6 6.8 13.4 C6.8 16.3 9.1 18.6 12 18.6 C14.9 18.6 17.2 16.3 17.2 13.4 C17.2 9.6 12 3.6 12 3.6 Z M5 21 H19 M9.6 13.8 C9.8 15.2 10.8 16.1 12.1 16.3" ' + S + '/>'),
    heat: svg('<path d="M7.8 20 C6.2 17.6 9.4 15.6 7.8 13.2 C6.2 10.8 9.4 8.8 7.8 6.4 M12.2 20 C10.6 17.6 13.8 15.6 12.2 13.2 C10.6 10.8 13.8 8.8 12.2 6.4 M16.6 20 C15 17.6 18.2 15.6 16.6 13.2 C15 10.8 18.2 8.8 16.6 6.4" ' + S + '/>'),
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 9.8 C5.5 6.2 8.4 3.4 12 3.4 C15.6 3.4 18.5 6.2 18.5 9.8 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="9.8" r="2.4" ' + S + '/>')
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
  function stepsHTML() {
    return T.steps.map(function (s, k) {
      return '<li><em>' + (k + 1) + '</em><b>' + esc(s[0]) + '</b><small>' +
        esc(s[1].replace('{g}', DATA.place).replace('{d}', money(DATA.dep) + ' ' + DATA.depCur)) + '</small></li>';
    }).join('');
  }
  function featHTML() {
    return ['dry', 'heat', 'vent'].map(function (k) { return '<li data-f="' + k + '">' + ICON[k] + esc(T.feat[k]) + '</li>'; }).join('');
  }
  root.innerHTML =
    '<section class="jsd-wrap" aria-labelledby="jsd-h"><div class="jsd-frame">' +
      '<figure class="jsd-shot"><img src="' + esc(PHOTO_S) + '" srcset="' + esc(PHOTO_S) + ' 900w, ' + esc(PHOTO) + ' 1334w" sizes="(max-width:860px) 100vw, 44vw" alt="' + esc(T.photo) + '" decoding="async"></figure>' +
      '<div class="jsd-body">' +
        '<div class="jsd-kicker jsd-up" style="--d:.05s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jsd-h"><span class="jsd-up" style="--d:.12s">' + esc(T.h[0]) + '</span> <span class="jsd-o jsd-up" style="--d:.19s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jsd-lead jsd-up" style="--d:.28s">' + esc(T.lead) + '</p>' +
        '<div class="jsd-hinge jsd-up" style="--d:.34s"><div class="jsd-door" role="group" aria-label="' + esc(T.door) + '">' +
          '<span class="jsd-strip" aria-hidden="true"></span>' +
          '<span class="jsd-no" aria-hidden="true">61</span>' +
          '<p class="jsd-price"><b></b><i></i><span>' + esc(T.day) + '</span></p>' +
          '<p class="jsd-sets"><b></b><span></span></p>' +
          '<ul class="jsd-feat">' + featHTML() + '</ul>' +
        '</div></div>' +
        '<div class="jsd-how jsd-up" style="--d:.44s"><h3 id="jsd-hw">' + esc(T.how) + '</h3><ol class="jsd-steps" aria-labelledby="jsd-hw"></ol></div>' +
        '<div class="jsd-acts jsd-up" style="--d:.52s">' +
          '<a class="jsd-cta" href="' + esc(PAGE) + '" data-jsd="stranica">' + lbl(T.more, T.moreS) + '</a>' +
          '<a class="jsd-pill" href="' + esc(MAP) + '" target="_blank" rel="noopener" data-jsd="mapa">' + ICON.pin + lbl(T.map, T.mapS) + '</a>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  var frame = q('.jsd-frame');

  /* ---------- podaci na vratima i u koracima ---------- */
  function renderData() {
    var p = money(DATA.price);
    q('.jsd-price b').textContent = p;
    q('.jsd-price i').textContent = DATA.cur;
    q('.jsd-price').setAttribute('aria-label', T.priceA + ': ' + p + ' ' + DATA.cur);
    q('.jsd-sets b').textContent = T.sets(DATA.sets);
    q('.jsd-sets span').textContent = T.setsSub(DATA.sets);
    ['dry', 'heat', 'vent'].forEach(function (k) { q('.jsd-feat [data-f="' + k + '"]').classList.toggle('is-off', !DATA.feat[k]); });
    q('.jsd-steps').innerHTML = stepsHTML();
  }
  renderData();

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
    if (b) track('depo_klik', { cilj: b.getAttribute('data-jsd') });
  });

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

  /* ---------- pokretanje: raspored; ulazak kad kadar uđe u ekran (vrata se zatvore) ---------- */
  fit();
  w.addEventListener('resize', refit);
  if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);
  if ('IntersectionObserver' in w && !reduced) {
    var hinge = q('.jsd-hinge');
    root.classList.add('jsd-anim'); hinge.classList.add('is-ajar');
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      root.classList.add('jsd-on');
      // vrata se zatvore kad se pojave (tekst iznad je već na mjestu)
      setTimeout(function () {
        hinge.classList.add('is-closing'); hinge.classList.remove('is-ajar');
        setTimeout(function () { hinge.classList.remove('is-closing'); }, 1200);
      }, 650);
    }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(frame);
  }

  /* SEO-BRZINA:POCETAK */
  /* ---------- SEO i brzina (pravila početne, 14. 10.; pravi ga alati/seo-brzina.py) ---------- */
  (function () {
    var SRC = (d.currentScript && d.currentScript.src) || '', DIMS = {"depo-ormaric-900.webp":[900,1349],"depo-ormaric.webp":[1334,2000]};
    var CDN = /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@\/]+)@([0-9a-f]{40})\//i, ok = CDN.test(SRC);
    function fix(im) {
      if (im.__jseo) return;
      im.__jseo = 1;
      if (!im.getAttribute('loading')) im.setAttribute('loading', 'lazy');
      var f = (im.getAttribute('src') || '').split(/[?#]/)[0].split('/').pop();
      if (!im.getAttribute('width') && DIMS[f]) { im.setAttribute('width', DIMS[f][0]); im.setAttribute('height', DIMS[f][1]); }
      if (ok) im.addEventListener('error', function () {
        var u = im.currentSrc || im.src;
        if (im.__jfb || !CDN.test(u)) return;
        im.__jfb = 1; im.removeAttribute('srcset');
        im.src = u.replace(CDN, 'https://raw.githubusercontent.com/$1/$2/$3/');
      });
    }
    function all() { [].forEach.call(root.querySelectorAll('img'), fix); }
    all();
    if ('MutationObserver' in w) new MutationObserver(all).observe(root, { childList: true, subtree: true });
    if ('IntersectionObserver' in w) {
      var pio = new IntersectionObserver(function (es) {
        if (!es.some(function (e) { return e.isIntersecting; })) return;
        pio.disconnect();
        [].forEach.call(root.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = 'eager'; });
      }, { rootMargin: '1600px 0px 1600px 0px' });
      pio.observe(root);
    }
    // šav: bijela traka između ovog bloka i tamnog bloka iznad (razmak između Elementor kontejnera/sekcija, pola piksela)
    var DARK = '#jv-vijesti,#jr-ratrak,#jsu-suvenirnica,#jb-bar,#jg-gondola,#jsd-depo,#jsb-park,#jsk-sankaliste,#jpb-brojke,.jh-hero,rs-module-wrap,rs-fullwidth-wrap';
    // od bloka nagore: prvi nivo (widget, kolona, kontejner, sekcija) koji ima prethodnog vidljivog susjeda; ako je u tom
    // susjedu tamni blok, zatvara se sve od dna tog bloka do vrha ovog: razmak između kontejnera (margin/gap) negativnim
    // margin-top na tom nivou, a bijeli padding oba kontejnera negativnim margin-top na samom bloku (blok ih prekrije)
    function seam() {
      for (var el = root.parentElement; el && el.parentElement && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        // preskaču se nevidljivi i prazni elementi (prazan kontejner, Spacer, prazan widget: bez teksta, slika i videa)
        var prev = el.previousElementSibling;
        while (prev && (!prev.offsetHeight || /^(SCRIPT|STYLE|LINK)$/.test(prev.tagName) ||
          (prev.offsetHeight <= 200 && !prev.matches(DARK) && !prev.querySelector(DARK + ',img,svg,video,iframe,canvas,input,button') && !(prev.textContent || '').trim()))) prev = prev.previousElementSibling;
        if (!prev) continue;
        var dk = prev.matches(DARK) ? [prev] : [].slice.call(prev.querySelectorAll(DARK));
        if (!dk.length) return;
        dk = dk[dk.length - 1];
        // povlači se omotač bloka (pe), ne sam blok: margin-top bloka mijenja fit() (širenje preko ekrana), pa bi se smjenjivali
        var pe = root.parentElement;
        el.style.removeProperty('margin-top');
        if (pe !== el) pe.style.removeProperty('margin-top');
        var gap = el.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;   // i preko praznih elemenata između
        if (gap > .5 && gap <= 160) el.style.setProperty('margin-top', (parseFloat(getComputedStyle(el).marginTop) || 0) - gap + 'px', 'important');
        // ostatak (bijeli padding kontejnera iznad i ispod) prekrije blok
        var rest = root.getBoundingClientRect().top - dk.getBoundingClientRect().bottom;
        if (rest > .5 && rest <= 160) pe.style.setProperty('margin-top', (parseFloat(getComputedStyle(pe).marginTop) || 0) - rest + 'px', 'important');
        root.style.boxShadow = '0 -2px 0 0 #0A1120';   // pola piksela između tamnih blokova
        return;
      }
    }
    // dno: ako je ispod bloka footer (naš .jf-wp ili footer teme), razmak do njega (padding/margin omotača stranice) se zatvori
    // negativnim margin-bottom na nivou čiji je sljedeći susjed footer, pa footer sjedne odmah ispod bloka
    var FOOT = '.jf-wp, .jf-footer, #Footer, footer, .mfn-footer-tmpl, .elementor-location-footer';
    function empty(x) {
      return !x.offsetHeight || /^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE)$/.test(x.tagName) ||
        (x.offsetHeight <= 200 && !x.matches(DARK + ',' + FOOT) && !x.querySelector(DARK + ',' + FOOT + ',img,svg,video,iframe,canvas,input,button') && !(x.textContent || '').trim());
    }
    function seamDown() {
      for (var el = root.parentElement; el && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        var nx = el.nextElementSibling;
        while (nx && empty(nx)) nx = nx.nextElementSibling;
        if (!nx) continue;
        if (!(nx.matches(FOOT) || nx.querySelector('.jf-wp, .jf-footer'))) return;
        el.style.removeProperty('margin-bottom');
        var gap = nx.getBoundingClientRect().top - root.getBoundingClientRect().bottom;
        if (gap > .5 && gap <= 240) el.style.setProperty('margin-bottom', (parseFloat(getComputedStyle(el).marginBottom) || 0) - gap + 'px', 'important');
        return;
      }
    }
    function reseam() { clearTimeout(reseam.t); reseam.t = setTimeout(function () { seam(); seamDown(); }, 160); }
    seamDown();
    seam();
    w.addEventListener('load', reseam);
    w.addEventListener('resize', reseam);
    if ('ResizeObserver' in w) new ResizeObserver(reseam).observe(d.body);
    var ps = d.getElementById('jsd-depo-seo-css');
    if (!ps) { ps = d.createElement('style'); ps.id = 'jsd-depo-seo-css'; (d.head || d.documentElement).appendChild(ps); }
    ps.textContent = "@media (max-width:760px){#jsd-depo *,#jsd-depo *::before,#jsd-depo *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}#jsd-depo img{filter:none!important}#jsd-depo [class$=\"-tint\"]{mix-blend-mode:normal!important;opacity:1!important;background:rgba(14,38,78,.32)!important}}";
  })();
  /* SEO-BRZINA:KRAJ */
})(window, document);
