/* =====================================================================
   JAHORINA — SUVENIRNICA (početna, ispod ratraka) · v2 "vitrina"
   Tema hero-a, vijesti i ratraka (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine,
   naslov sa iscrtanim krajem, neumorfni detalji), ali sa svojim detaljima — korisnik: "tema da, detalji različiti":
     · desno je VITRINA: fotografije proizvoda kao kartice različite visine na staklenoj polici (odsjaj u staklu,
       toplo svjetlo vitrine odozgo); klik na karticu otvara galeriju preko cijelog ekrana;
     · lijevo nadnaslov, naslov, uvod, vrste poklona i ŠEMA GONDOLE POLJICE: kosa sajla od polazne do izlazne
       stanice, suvenirnica na obje, kabina jednom prođe sajlom;
     · dugmad kao u vijestima (cyan sa strelicom u udubljenom krugu + tamna pilula);
     · ulazak: kartice se jedna za drugom spuste na policu, tekst se podiže odozdo.

   SADRŽAJ JE IZ WORDPRESSA: stranica "Suvenirnica" (slug suvenirnica) preko REST API-ja.
     nadnaslov = naslov stranice, naslov = prvi naslov (h1–h4) u tekstu stranice, uvod = prva rečenica prvog pasusa,
     dugme "Više o suvenirnici" = link stranice, galerija = 3 fotografije iz vitrine + sve fotografije sa stranice
     (iz teksta stranice, a ako ih tamo nema, slike priložene uz stranicu). qTranslate oznake [:SH]…[:en]…[:] se razdvajaju.
     Dok WordPress ne odgovori (ili ako ne odgovori), stoji ugrađeni tekst — isti kao na stranici 8. 10. 2026,
     pa se ništa ne mijenja pred očima. Prijavljeni admin vidi tehnički razlog ako čitanje ne uspije.
   Vrste poklona i stanice gondole su sažetak teksta stranice i stoje u kodu.

   Ugradnja: Elementor HTML widget sa <div id="jsu-suvenirnica"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jsu-suvenirnica"> (sva su neobavezna):
     data-stranica="suvenirnica"   (slug WordPress stranice)
     data-mapa="https://…"          (dugme "Kako do nas"; podrazumijevano Google Maps: Gondola Poljice, Jahorina)
     data-galerija="url1, url2, …"  (zamjena za fotografije vitrine iz slike/ pored ovog fajla; prve tri idu na policu)
   GA: klik na dugmad → suvenirnica_klik (cilj: stranica | mapa), otvaranje galerije → suvenirnica_galerija.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jsu-suvenirnica');
  if (!root || root.__jsu) return;
  root.__jsu = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'suvenirnica').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var MAPA = /^https?:\/\//i.test(opt('mapa', '')) ? opt('mapa', '')
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Gondola Poljice, Jahorina');

  // ugrađeni tekst = tekst sa stranice Suvenirnica (8. 10. 2026); EN je prevod. WordPress ga zamijeni kad odgovori.
  var T = EN ? {
    kicker: 'Souvenir shop', head: 'Take a piece of Jahorina with you!',
    lead: 'Visit our souvenir shops at the lower and upper stations of the Poljice gondola and find gifts that warm the heart.',
    tags: ['Local artisans', 'Natural cosmetics', 'Warm textiles', 'For pets'],
    gondola: 'Poljice gondola', up: 'Upper station', down: 'Lower station', both: 'Souvenir shop at both stations',
    caps: ['Neck gaiters and textiles', 'Magnets', 'Winter accessories'],
    page: 'More about the shop', pageS: 'Learn more', map: 'How to find us', mapS: 'Directions',
    gal: 'All photos', galLabel: 'Souvenir shop gallery', galOpen: 'Open gallery', photo: 'Photo', close: 'Close', prev: 'Previous photo', next: 'Next photo',
    why: 'WordPress', whyTail: 'showing built-in text'
  } : {
    kicker: 'Suvenirnica', head: 'Ponesite dio Jahorine sa sobom!',
    lead: 'Svratite u naše suvenirnice na polaznoj i izlaznoj stanici gondole Poljice i pronađite poklone koji griju srce.',
    tags: ['Lokalni majstori', 'Prirodna kozmetika', 'Topli tekstil', 'Za ljubimce'],
    gondola: 'Gondola Poljice', up: 'Izlazna stanica', down: 'Polazna stanica', both: 'Suvenirnica na obje stanice',
    caps: ['Marame i tekstil', 'Magneti', 'Zimski dodaci'],
    page: 'Više o suvenirnici', pageS: 'Saznaj više', map: 'Kako do nas', mapS: 'Kako do nas',
    gal: 'Sve fotografije', galLabel: 'Galerija: suvenirnica', galOpen: 'Otvori galeriju', photo: 'Fotografija', close: 'Zatvori', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni tekst'
  };

  // vitrina: 3 fotografije ovog bloka (prve tri idu na policu); fotografije sa WordPress stranice se dodaju u galeriju kad stignu
  var FIXED = !!root.getAttribute('data-galerija');
  var BASE = FIXED
    ? opt('galerija', '').split(',').map(function (x) { x = x.trim(); return x && { full: x }; }).filter(Boolean)
    : ['suvenirnica-glavna', 'suvenirnica-1', 'suvenirnica-2'].map(function (f, k) {
        return { full: HERE + 'slike/' + f + '.webp', cap: T.caps[k], pos: ['58% 50%', '50% 40%', '46% 50%'][k] };
      });
  var GAL = BASE.slice();

  /* ---------- izgled (sve je pod #jsu-suvenirnica; tokeni iz hero-a, vijesti i ratraka) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(20,30,49,.72);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    '--nm-inset:inset 3px 3px 8px rgba(0,0,0,.42),inset -3px -3px 7px rgba(78,104,150,.14);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsu--boxed{border-radius:28px;overflow:hidden}',
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
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je ratrak odmah iznad (.jsu--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub (kao ratrak ispod vijesti) */
    '#R .jsu-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsu--join .jsu-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsu-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',

    /* kadar (isti okvir kao hero, vijesti i ratrak); unutra tekst lijevo, vitrina desno, na tamnoj pozadini sa svjetlom vitrine */
    '#R .jsu-frame{position:relative;transform-origin:50% 0;display:grid;grid-template-columns:minmax(0,41fr) minmax(0,59fr);align-items:center;column-gap:clamp(28px,3.4vw,64px);',
    'padding:clamp(48px,5vw,80px) max(clamp(28px,4vw,60px),var(--in)) clamp(48px,5vw,80px) max(clamp(28px,4.4vw,68px),var(--in));border-radius:26px;overflow:hidden;isolation:isolate;',
    'background:radial-gradient(70% 90% at 0% 100%,rgba(30,79,150,.16),transparent 60%),linear-gradient(180deg,#0F182B 0%,#0B1324 100%);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsu-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* toplo svjetlo vitrine odozgo (jedini topli ton) i tanak odsjaj na gornjoj ivici iznad njega */
    '#R .jsu-light{position:absolute;z-index:-1;pointer-events:none;top:0;right:0;width:66%;height:100%;',
    'background:radial-gradient(56% 62% at 50% 0%,rgba(255,226,190,.12),rgba(255,206,160,.04) 55%,transparent 80%)}',
    '#R .jsu-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 46%,rgba(255,226,190,.42) 67%,transparent 88%)}',

    /* tekst */
    '#R .jsu-body{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0}',
    '#R .jsu-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:22px}',
    '#R .jsu-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(40px,4.2vw,62px);font-weight:800;line-height:.95;letter-spacing:-.02em}',
    '#R h2.jsu-long{font-size:clamp(34px,3.4vw,50px)}',
    '#R h2 > span{display:block}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsu-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.5px rgba(255,255,255,.92)!important;filter:drop-shadow(0 0 8px rgba(0,185,242,.35))}}',
    '#R .jsu-lead{margin-top:24px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:42ch;text-wrap:pretty}',
    /* vrste poklona (iz teksta stranice): dvije tihe kolone sa cyan tačkicama */
    '#R .jsu-tags{display:grid;grid-template-columns:repeat(2,max-content);gap:7px 26px;margin-top:16px!important}',
    '#R .jsu-tags li{display:flex;align-items:center;gap:9px;font:500 13.5px/1.3 var(--fb);color:var(--text-3)}',
    '#R .jsu-tags li::before{content:""!important;width:4px;height:4px;flex:none;border-radius:50%;background:var(--accent);box-shadow:0 0 6px rgba(0,185,242,.9)}',

    /* šema gondole Poljice: kosa sajla od polazne (dolje lijevo) do izlazne stanice (gore desno), suvenirnica na obje */
    '#R .jsu-route{position:relative;width:min(100%,420px);margin-top:28px;padding:14px 18px 13px;border-radius:20px;background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-inset)}',
    '#R .jsu-route__row{display:flex;justify-content:space-between;align-items:center;gap:12px}',
    '#R .jsu-route__name{font:600 9.5px/1 var(--fd);letter-spacing:2.4px;text-transform:uppercase;color:var(--text-3);white-space:nowrap}',
    '#R .jsu-st{display:inline-flex;align-items:center;gap:6px;font:600 12.5px/1 var(--fb);color:#fff;white-space:nowrap}',
    '#R .jsu-st svg{width:14px;height:14px;color:var(--accent)}',
    '#R .jsu-route__note{font:500 11.5px/1.2 var(--fb);color:var(--text-3);text-align:right}',
    '#R .jsu-track{position:relative;height:42px;margin:9px 4px 8px}',
    '#R .jsu-track svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '#R .jsu-track line{stroke:rgba(255,255,255,.34);stroke-width:1.2}',
    '#R .jsu-track line + line{stroke:rgba(0,185,242,.5);stroke-width:1}',
    '#R .jsu-dot{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(0,185,242,.18),0 0 10px rgba(0,185,242,.9)}',
    '#R .jsu-dot--a{left:0;top:100%}',
    '#R .jsu-dot--b{left:100%;top:0}',
    /* kabina visi na sajli; stoji na 58% puta (ulazak je dovede od polazne stanice) */
    '#R .jsu-cab{position:absolute;left:58%;top:42%;width:13px;height:17px;margin-left:-6.5px;color:rgba(255,255,255,.9)}',
    '#R .jsu-cab svg{width:13px;height:17px}',

    /* dugmad kao u vijestima: blago ispupčeno cyan dugme sa strelicom u plitkom udubljenom krugu + tamna neumorfna pilula */
    '#R .jsu-acts{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:28px}',
    '#R .jsu-cta{display:inline-flex;align-items:center;gap:12px;height:44px;padding:0 6px 0 20px!important;border-radius:40px;white-space:nowrap;font:600 13.5px/1 var(--fd);letter-spacing:.3px;color:#fff!important;',
    'background:linear-gradient(145deg,#27C4F2 0%,#0AAEE6 60%,#03A2D9 100%);transition:transform .25s ease,box-shadow .25s ease;',
    'box-shadow:5px 5px 12px rgba(0,0,0,.42),-4px -4px 10px rgba(70,110,170,.09),0 10px 22px -16px rgba(0,185,242,.6),inset 1px 1px 0 rgba(255,255,255,.32),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jsu-cta__ico{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:rgba(0,90,130,.18);box-shadow:inset 2px 2px 4px rgba(0,55,90,.35),inset -1px -1px 3px rgba(255,255,255,.22)}',
    '#R .jsu-cta__ico svg{width:14px;height:14px;transition:transform .25s ease}',
    '#R .jsu-cta:hover{transform:translateY(-1px);box-shadow:6px 7px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(70,110,170,.1),0 12px 26px -14px rgba(0,185,242,.7),inset 1px 1px 0 rgba(255,255,255,.36),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jsu-cta:hover .jsu-cta__ico svg{transform:translateX(2px)}',
    '#R .jsu-cta:active{transform:none;box-shadow:inset 3px 3px 6px rgba(0,60,95,.4),inset -2px -2px 5px rgba(255,255,255,.18)}',
    '#R .jsu-pill,#R .jsu-gal{all:unset;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:9px;height:44px;padding:0 20px!important;margin:0!important;border:0!important;border-radius:40px!important;cursor:pointer;white-space:nowrap;',
    'font:600 13.5px/1 var(--fd)!important;letter-spacing:.2px!important;text-transform:none!important;color:var(--text-2)!important;background:var(--surface)!important;box-shadow:6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14)!important;transition:color .2s}',
    '#R .jsu-pill svg,#R .jsu-gal svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jsu-pill:hover,#R .jsu-gal:hover{color:var(--accent)!important}',
    '#R .jsu-pill:active,#R .jsu-gal:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.45),inset -2px -2px 5px rgba(60,84,128,.13)!important}',
    '#R .jsu-gal:focus-visible,#R .jsu-card:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '#R .jsu-gal i{font-style:normal;color:var(--text-3);font-variant-numeric:tabular-nums}',
    '#R .jsu-s{display:none}',
    /* tehnički razlog kad WordPress ne odgovori — vidi ga samo prijavljeni admin */
    '#R .jsu-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* vitrina: kartice različite visine stoje na staklenoj polici (bez odsjaja: preslikavao bi i natpise) */
    '#R .jsu-case{position:relative;min-width:0;display:flex;flex-direction:column}',
    '#R .jsu-shelf{position:relative;display:grid;grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:clamp(12px,1.4vw,22px);height:clamp(340px,31vw,480px);padding:0 2%}',
    '#R .jsu-card{all:unset;position:relative!important;box-sizing:border-box!important;display:block!important;height:var(--h,100%);min-height:0;border-radius:18px!important;overflow:hidden;cursor:zoom-in;isolation:isolate;',
    'background:#0E1828!important;box-shadow:0 22px 40px -22px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.07)!important;transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}',
    '#R .jsu-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.86) brightness(.8) contrast(1.08);transition:filter .45s,transform .9s cubic-bezier(.2,.7,.2,1)}',
    /* noćna obrada: plavi sloj + toplo svjetlo odozgo + tamni prelaz ispod natpisa */
    '#R .jsu-card::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.42}',
    '#R .jsu-card::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(90% 50% at 50% 0%,rgba(255,220,180,.14),transparent 70%),linear-gradient(0deg,rgba(6,11,22,.72) 0%,rgba(6,11,22,0) 38%)}',
    '#R .jsu-cap{position:absolute;left:14px;right:14px;bottom:13px;z-index:2;font:600 12.5px/1.25 var(--fd);letter-spacing:.2px;color:#fff}',
    '#R .jsu-card:hover{transform:translateY(-6px);box-shadow:0 30px 44px -24px rgba(0,0,0,.95),0 0 0 1px rgba(255,255,255,.14)!important}',
    '#R .jsu-card:hover img{filter:saturate(.95) brightness(.93) contrast(1.06);transform:scale(1.03)}',
    /* staklena polica: svijetla ivica i providna ploča ispod kartica */
    '#R .jsu-glass{position:relative;display:block;height:16px;margin:0 -1%;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,0))}',
    '#R .jsu-glass::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(220,236,255,.38) 18%,rgba(170,228,255,.62) 50%,rgba(220,236,255,.38) 82%,transparent);box-shadow:0 0 14px rgba(0,185,242,.22)}',
    '#R .jsu-case__foot{display:flex;justify-content:flex-end;margin-top:30px}',

    /* ulazak (jednom): klase jsu-anim/jsu-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsu-anim .jsu-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsu-anim.jsu-on .jsu-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    /* tekst se podiže odozdo, red po red */
    '#R.jsu-anim .jsu-up{opacity:0;transform:translateY(18px)}',
    '#R.jsu-anim.jsu-on .jsu-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .9s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsu-anim .jsu-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsu-anim.jsu-on .jsu-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* polica se upali od sredine, kartice se jedna za drugom spuste na nju, svjetlo vitrine se upali */
    '#R.jsu-anim .jsu-glass{transform:scaleX(0);opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-glass{transform:none;opacity:1;transition:transform .9s cubic-bezier(.2,.7,.2,1) .3s,opacity .6s ease .3s}',
    '#R.jsu-anim .jsu-card{opacity:0;transform:translateY(-34px)}',
    '#R.jsu-anim.jsu-on .jsu-card{opacity:1;transform:none;transition:opacity .6s ease var(--d,0s),transform .9s cubic-bezier(.25,1.25,.4,1) var(--d,0s),box-shadow .45s}',
    '#R.jsu-anim.jsu-on .jsu-card:hover{transform:translateY(-6px);transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}',
    '#R.jsu-anim .jsu-light{opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-light{opacity:1;transition:opacity 1.6s ease .5s}',
    /* sajla se iscrta od polazne stanice, kabina je pređe do svog mjesta */
    '#R.jsu-anim .jsu-track svg{clip-path:inset(0 100% 0 0)}',
    '#R.jsu-anim.jsu-on .jsu-track svg{clip-path:inset(0 0 0 0);transition:clip-path .8s cubic-bezier(.4,0,.2,1) .85s}',
    '#R.jsu-anim .jsu-cab{left:4%;top:96%;opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-cab{left:58%;top:42%;opacity:1;transition:left 1.9s cubic-bezier(.45,0,.25,1) 1.1s,top 1.9s cubic-bezier(.45,0,.25,1) 1.1s,opacity .4s ease 1.1s}',

    '@media (max-width:1060px){#R .jsu-frame{grid-template-columns:minmax(0,46fr) minmax(0,54fr)}#R .jsu-shelf{height:clamp(320px,36vw,400px)}}',
    /* tablet: tekst gore, vitrina ispod preko cijele širine */
    '@media (max-width:980px){',
    '#R .jsu-frame{grid-template-columns:1fr;row-gap:44px;padding:clamp(40px,6vw,60px) clamp(22px,6vw,56px)}',
    '#R .jsu-light{width:100%;background:radial-gradient(64% 34% at 50% 50%,rgba(255,226,190,.1),rgba(255,206,160,.035) 55%,transparent 80%)}',
    '#R .jsu-frame::before{background:linear-gradient(90deg,transparent 20%,rgba(255,226,190,.3) 50%,transparent 80%)}',
    '#R h2{font-size:clamp(40px,7.4vw,62px)}',
    '#R .jsu-lead{max-width:56ch}',
    '#R .jsu-shelf{height:min(56vw,460px)}}',
    /* telefon: vitrina postaje red kartica koji se prevlači prstom (druga kartica proviruje), bez odsjaja */
    '@media (max-width:760px){',
    '#R .jsu-frame{border-radius:24px;padding:34px 22px 30px;row-gap:30px}',
    '#R .jsu-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jsu-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.4vw,52px)}',
    '#R h2.jsu-long{font-size:clamp(30px,8.6vw,42px)}',
    '#R .jsu-lead{margin-top:18px}',
    '#R .jsu-route{width:100%;margin-top:24px}',
    '#R .jsu-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:24px;width:100%}',
    '#R .jsu-cta{height:42px;padding:0 5px 0 16px!important;font-size:13px;justify-content:space-between}',
    '#R .jsu-cta__ico{width:30px;height:30px}',
    '#R .jsu-pill{height:42px!important;justify-content:center;font-size:13px!important}',
    '#R .jsu-l{display:none}',
    '#R .jsu-s{display:inline}',
    '#R .jsu-body{order:1}',
    '#R .jsu-case{order:2;margin:0 -22px}',
    '#R .jsu-shelf{display:flex;height:auto;gap:12px;padding:0 22px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 22px;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
    '#R .jsu-shelf::-webkit-scrollbar{display:none}',
    '#R .jsu-card{flex:0 0 68%;height:min(96vw,380px)!important;scroll-snap-align:start}',
    '#R .jsu-glass{margin:0 22px}',
    '#R .jsu-case__foot{justify-content:flex-start;margin:18px 22px 0}}',
    '@media (max-width:400px){#R .jsu-route{padding:13px 14px 12px}#R .jsu-route__name{letter-spacing:1.6px}#R .jsu-route__note{display:none}#R .jsu-tags{column-gap:18px}#R .jsu-tags li{font-size:13px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

    /* galerija preko cijelog ekrana (ista kao u ratraku) */
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
    '#L .jsu-lb-close{top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px)}',
    '#L .jsu-lb-prev{left:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L .jsu-lb-next{right:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L.is-one .jsu-lb-prev,#L.is-one .jsu-lb-next{display:none!important}',
    '@media (max-width:760px){#L img{max-height:calc(100vh - 210px);border-radius:14px}#L .jsu-lb-prev,#L .jsu-lb-next{top:auto;bottom:22px;transform:none}#L .jsu-lb-prev{left:calc(50% - 60px)}#L .jsu-lb-next{right:calc(50% - 60px)}}',
    '@media (prefers-reduced-motion:reduce){#L,#L figure{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jsu-suvenirnica').replace(/#L/g, '#jsu-lb');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jsu-css');
  if (!st) { st = d.createElement('style'); st.id = 'jsu-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  function svg(p, vb) { return '<svg width="22" height="22" viewBox="' + (vb || '0 0 24 24') + '" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 10 A6.5 6.5 0 0 1 18.5 10 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="10" r="2.3" ' + S + '/>'),
    bag: svg('<path d="M5.5 8.5 H18.5 L17.6 19.4 A1.8 1.8 0 0 1 15.8 21 H8.2 A1.8 1.8 0 0 1 6.4 19.4 Z" ' + S + '/><path d="M9 10.5 V7 A3 3 0 0 1 15 7 V10.5" ' + S + '/>'),
    gallery: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" ' + S + '/><path d="M3.8 15.5 L8.5 11 L12 14.2 L14.6 12 L20.2 16.8" ' + S + '/><circle cx="15.5" cy="9" r="1.4" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    // kabina gondole: vješalica, tijelo i osvijetljen prozor
    cab: svg('<path d="M6.5 0.5 V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="1" y="4" width="11" height="12" rx="3" stroke="currentColor" stroke-width="1.3" fill="#0E1828"/><rect x="2.8" y="6" width="7.4" height="3.6" rx="1" fill="rgba(0,185,242,.75)"/>', '0 0 13 17'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon, da oba dugmeta stanu u jedan red)
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jsu-l">' + esc(l) + '</span><span class="jsu-s">' + esc(s) + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function abs(u) { try { return new URL(u, O + '/').href; } catch (e) { return u; } }
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
  // naslov u redove: zadnja riječ (sa kratkom riječi ispred, npr. "sa sobom") je obris, ostatak u jedan ili dva ujednačena reda
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
    return lines.map(function (l, i) { return '<span class="jsu-up" style="--d:' + (.34 + i * .1).toFixed(2) + 's">' + esc(l) + '</span>'; }).join('') +
      '<span class="jsu-o jsu-up" style="--d:' + (.34 + lines.length * .1).toFixed(2) + 's">' + esc(o) + '</span>';
  }
  // uvod: prva rečenica pasusa (i druga, ako je prva vrlo kratka)
  function leadOf(p) {
    var ss = clean(p).match(/[^.!?]+(?:[.!?]+|$)/g) || [p], out = clean(ss[0]);
    if (out.length < 70 && ss[1]) out += ' ' + clean(ss[1]);
    return clip(out, 260);
  }

  /* ---------- crtanje ---------- */
  var H = ['82%', '100%', '88%'];   // visine kartica na polici (srednja najviša)
  function card(g, k) {
    return '<button type="button" class="jsu-card" data-k="' + k + '" style="--h:' + H[k] + ';--d:' + (.45 + k * .14).toFixed(2) + 's" aria-haspopup="dialog" aria-label="' +
      esc(T.galOpen + (g.cap ? ': ' + g.cap : '')) + '"><img src="' + esc(g.full) + '" alt="" decoding="async" loading="lazy"' + (g.pos ? ' style="object-position:' + g.pos + '"' : '') + '>' +
      (g.cap ? '<span class="jsu-cap">' + esc(g.cap) + '</span>' : '') + '</button>';
  }
  root.innerHTML =
    '<section class="jsu-wrap" aria-labelledby="jsu-h"><div class="jsu-frame"><span class="jsu-light" aria-hidden="true"></span>' +
      '<div class="jsu-body">' +
        '<div class="jsu-kicker jsu-up" style="--d:.25s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jsu-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jsu-lead jsu-up" style="--d:.7s">' + esc(T.lead) + '</p>' +
        '<ul class="jsu-tags jsu-up" style="--d:.8s">' + T.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="jsu-route jsu-up" style="--d:.9s" role="img" aria-label="' + esc(T.gondola + ': ' + T.both + ' (' + T.down + ', ' + T.up + ')') + '">' +
          '<div class="jsu-route__row"><span class="jsu-route__name">' + esc(T.gondola) + '</span><span class="jsu-st">' + ICON.bag + esc(T.up) + '</span></div>' +
          '<div class="jsu-track"><svg viewBox="0 0 100 42" preserveAspectRatio="none"><line x1="0" y1="42" x2="100" y2="0" vector-effect="non-scaling-stroke"/>' +
            '<line x1="0" y1="42" x2="100" y2="0" vector-effect="non-scaling-stroke" transform="translate(0 3)"/></svg>' +
            '<i class="jsu-dot jsu-dot--a"></i><i class="jsu-dot jsu-dot--b"></i><span class="jsu-cab">' + ICON.cab + '</span></div>' +
          '<div class="jsu-route__row"><span class="jsu-st">' + ICON.bag + esc(T.down) + '</span><span class="jsu-route__note">' + esc(T.both) + '</span></div>' +
        '</div>' +
        '<div class="jsu-acts jsu-up" style="--d:1s">' +
          '<a class="jsu-cta" href="' + esc(PAGE) + '" data-jsu="stranica">' + lbl(T.page, T.pageS) + '<b class="jsu-cta__ico">' + ICON.arrow + '</b></a>' +
          '<a class="jsu-pill" href="' + esc(MAPA) + '" target="_blank" rel="noopener" data-jsu="mapa">' + ICON.pin + lbl(T.map, T.mapS) + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="jsu-case">' +
        '<div class="jsu-shelf">' + GAL.slice(0, 3).map(card).join('') + '</div>' +
        '<i class="jsu-glass" aria-hidden="true"></i>' +
        '<div class="jsu-case__foot"><button type="button" class="jsu-gal" aria-haspopup="dialog">' + ICON.gallery + esc(T.gal) + ' <i></i></button></div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function galCount() {
    var b = q('.jsu-gal');
    b.querySelector('i').textContent = GAL.length;
    b.setAttribute('aria-label', T.galOpen + ' (' + GAL.length + ')');
  }
  galCount();

  // blok uvijek ide preko cijele širine ekrana, i kad je kontejner teme/Elementora uži (isto kao vijesti i ratrak)
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
    root.classList.toggle('jsu--boxed', boxed);
    // Elementor kontejner oko bloka ima svoj padding (podrazumijevano 10px) na bijeloj pozadini → bijela traka; kad je blok
    // jedini widget u njemu, blok prekrije taj padding (margine se računaju uz trenutnu marginu, bez skidanja i vraćanja)
    var sh = !boxed && shell(), up = 0, dn = 0;
    if (sh) {
      var a = sh.getBoundingClientRect(), b = root.getBoundingClientRect();
      up = b.top - a.top - (parseFloat(st.getPropertyValue('margin-top')) || 0);
      dn = a.bottom - b.bottom - (parseFloat(st.getPropertyValue('margin-bottom')) || 0);
    }
    if (up > .5 && up <= 40) st.setProperty('margin-top', -up + 'px', 'important'); else st.removeProperty('margin-top');
    if (dn > .5 && dn <= 40) st.setProperty('margin-bottom', -dn + 'px', 'important'); else st.removeProperty('margin-bottom');
    // ratrak je odmah iznad (bez razmaka) → on već daje razmak, ovdje ostaje samo rub
    var rt = d.getElementById('jr-ratrak');
    root.classList.toggle('jsu--join', !boxed && !!rt && !rt.classList.contains('jr--boxed') &&
      Math.abs(rt.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
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
  function rise() {
    var el = q('.jsu-frame');
    if (!el || !('scale' in el.style) || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
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
  }
  rise();

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
    var a = e.target.closest && e.target.closest('a[data-jsu]');
    if (a) track('suvenirnica_klik', { cilj: a.getAttribute('data-jsu') });
  });

  /* ---------- galerija preko cijelog ekrana ---------- */
  var lb, lbImg, lbCap, lbCur = 0, lbBack = null, lbOverflow = '';
  function lbBuild() {
    lb = d.createElement('div'); lb.id = 'jsu-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.galLabel);
    lb.innerHTML = '<figure><img alt="" decoding="async"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="jsu-lb-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>' +
      '<button type="button" class="jsu-lb-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jsu-lb-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button>';
    d.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('figcaption');
    lb.querySelector('.jsu-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.jsu-lb-prev').addEventListener('click', function () { lbShow(lbCur - 1); });
    lb.querySelector('.jsu-lb-next').addEventListener('click', function () { lbShow(lbCur + 1); });
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
    lbImg.alt = GAL[lbCur].cap || GAL[lbCur].alt || (T.photo + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T.kicker);
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
    lb.querySelector('.jsu-lb-close').focus();
    d.addEventListener('keydown', lbKey);
    track('suvenirnica_galerija', {});
  }
  function lbClose() {
    lb.classList.remove('is-open');
    d.documentElement.style.overflow = lbOverflow;
    d.removeEventListener('keydown', lbKey);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.classList.remove('is-shown'); }, 320);
    if (lbBack && lbBack.focus) lbBack.focus();
  }
  q('.jsu-shelf').addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('.jsu-card');
    if (c) lbOpen(+c.getAttribute('data-k') || 0);
  });
  q('.jsu-gal').addEventListener('click', function () { lbOpen(0); });

  /* ---------- sadržaj iz WordPressa (REST API): stranica Suvenirnica ---------- */
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
  function parse(pg) {
    var html = pickLang(pg.content && pg.content.rendered || '');
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    var h = b.querySelector('h1,h2,h3,h4');
    var seen = {}, imgs = [].slice.call(b.querySelectorAll('img')).map(fromImg).filter(function (x) {
      if (!x || seen[key(x.full)]) return false; seen[key(x.full)] = 1; return true;
    });
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    return {
      id: pg.id, link: link, imgs: imgs, seen: seen,
      title: clean(new DOMParser().parseFromString('<body>' + pickLang(pg.title && pg.title.rendered || ''), 'text/html').body.textContent),
      head: h ? clean(h.textContent) : '',
      ps: [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; })
    };
  }
  function load() {
    return api('pages', 'slug=' + encodeURIComponent(SLUG) + '&_fields=id,link,title,content').then(function (j) {
      if (!j || !j[0]) throw new Error('Stranica "' + SLUG + '" nije pronađena');
      var r = parse(j[0]);
      if (r.imgs.length) return r;
      // tekst stranice bez fotografija (npr. BeBuilder ili galerija kao poseban blok) → slike priložene uz stranicu
      return api('media', 'parent=' + r.id + '&media_type=image&per_page=24&_fields=id,source_url,media_details,alt_text')
        .then(function (ms) {
          (ms || []).map(fromMedia).forEach(function (x) { if (x && !r.seen[key(x.full)]) { r.seen[key(x.full)] = 1; r.imgs.push(x); } });
          return r;
        }, function () { return r; });
    });
  }
  function apply(r) {
    var miss = [];
    if (r.title && r.title !== q('.jsu-kicker').textContent) q('.jsu-kicker').textContent = r.title;
    if (r.head) {
      var h2 = q('h2');
      if (h2.textContent.replace(/\s+/g, '') !== r.head.replace(/[\s!.:,;]+$/, '').replace(/\s+/g, '')) h2.innerHTML = titleHTML(r.head);
      h2.classList.toggle('jsu-long', r.head.length > 40);
    } else miss.push('naslov');
    if (r.ps.length) { var ld = leadOf(r.ps[0]); if (ld !== q('.jsu-lead').textContent) q('.jsu-lead').textContent = ld; }
    else miss.push('tekst');
    if (r.link) q('a[data-jsu="stranica"]').setAttribute('href', r.link);
    if (!FIXED && r.imgs.length) { GAL = BASE.concat(r.imgs); galCount(); }
    else if (!r.imgs.length) miss.push('fotografije');
    if (miss.length) why('stranica "' + SLUG + '" nema: ' + miss.join(', '));
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jsu-why') || q('.jsu-body').appendChild(d.createElement('small'));
    el.className = 'jsu-why'; el.textContent = T.why + ': ' + msg + ' (' + T.whyTail + ')';
  }
  if (w.fetch && w.DOMParser) load().then(apply).catch(function (e) {
    if (w.console) console.warn('[Jahorina suvenirnica]', e);
    why(e && e.message || 'REST');
  });

  // ulazak jednom, kad kadar dođe u vidno polje
  var still = !('IntersectionObserver' in w) || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!still) {
    root.classList.add('jsu-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { root.classList.add('jsu-on'); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(q('.jsu-frame'));
  }
})(window, document);
