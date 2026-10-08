/* =====================================================================
   JAHORINA — SUVENIRNICA (početna, ispod ratraka) · v3 "izlog"
   Tema hero-a, vijesti i ratraka (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine,
   naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima (korisnik: "tema da, detalji
   različiti"; v2 bez fotografije u pozadini: "prejednostavno, nije premium, fotografiju koristi i u pozadini"):
     · fotografija proizvoda je pozadina cijelog kadra, a proizvodi se SMJENJUJU (marama → magneti → vitrina):
       meki prelaz iz zamućenog u oštro, bez zumiranja;
     · dolje desno TIHI IZBOR PROIZVODA direktno na fotografiji (bez ploče): tri tanke linije sa brojem i nazivom,
       aktivna se puni cyan bojom; klik bira proizvod, "Sve fotografije" otvara galeriju preko cijelog ekrana;
     · lijevo veliki naslov, uvod, vrste poklona, dugmad kao u vijestima (cyan sa strelicom u udubljenom krugu + pilula).
   Smjena svakih 6,5 s; staje na mišu, fokusu, van ekrana i uz smanjeno kretanje; na telefonu i prevlačenje prstom.

   SADRŽAJ JE IZ WORDPRESSA: stranica "Suvenirnica" (slug suvenirnica) preko REST API-ja.
     nadnaslov = naslov stranice, naslov = prvi naslov (h1–h4) u tekstu stranice, uvod = prva rečenica prvog pasusa,
     dugme "Više o suvenirnici" = link stranice, galerija = 3 fotografije izloga + sve fotografije sa stranice
     (iz teksta stranice, a ako ih tamo nema, slike priložene uz stranicu). qTranslate oznake [:SH]…[:en]…[:] se razdvajaju.
     Dok WordPress ne odgovori (ili ako ne odgovori), stoji ugrađeni tekst — isti kao na stranici 8. 10. 2026,
     pa se ništa ne mijenja pred očima. Prijavljeni admin vidi tehnički razlog ako čitanje ne uspije.
   Vrste poklona su sažetak teksta stranice i stoje u kodu.

   Ugradnja: Elementor HTML widget sa <div id="jsu-suvenirnica"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jsu-suvenirnica"> (sva su neobavezna):
     data-stranica="suvenirnica"   (slug WordPress stranice)
     data-mapa="https://…"          (dugme "Kako do nas"; podrazumijevano Google Maps: Gondola Poljice, Jahorina)
     data-galerija="url1, url2, …"  (zamjena za fotografije izloga iz slike/ pored ovog fajla; prve tri se smjenjuju)
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
  var DUR = 6500;   // smjena proizvoda (ms)

  // ugrađeni tekst = tekst sa stranice Suvenirnica (8. 10. 2026); EN je prevod. WordPress ga zamijeni kad odgovori.
  var T = EN ? {
    kicker: 'Souvenir shop', head: 'Take a piece of Jahorina with you!',
    lead: 'Visit our souvenir shops at the lower and upper stations of the Poljice gondola and find gifts that warm the heart.',
    tags: ['Local artisans', 'Natural cosmetics', 'Warm textiles', 'For pets'],
    caps: ['Neck gaiters', 'Magnets', 'Accessories'], capsS: ['Textiles', 'Magnets', 'Accessories'],
    alts: ['Neck gaiter with the Olympic Centre Jahorina logo on a shop shelf', 'Jahorina magnets: ski boots, trees, gondola cabins, snowboards', 'Display case with Jahorina neck gaiters, gloves, goggles and ski socks'],
    pick: 'From the shop', show: 'Show', page: 'More about the shop', pageS: 'Learn more', map: 'How to find us', mapS: 'Directions',
    gal: 'All photos', galLabel: 'Souvenir shop gallery', galOpen: 'Open gallery', photo: 'Photo', close: 'Close', prev: 'Previous photo', next: 'Next photo',
    why: 'WordPress', whyTail: 'showing built-in text'
  } : {
    kicker: 'Suvenirnica', head: 'Ponesite dio Jahorine sa sobom!',
    lead: 'Svratite u naše suvenirnice na polaznoj i izlaznoj stanici gondole Poljice i pronađite poklone koji griju srce.',
    tags: ['Lokalni majstori', 'Prirodna kozmetika', 'Topli tekstil', 'Za ljubimce'],
    caps: ['Marame i tekstil', 'Magneti', 'Zimski dodaci'], capsS: ['Tekstil', 'Magneti', 'Zimski dodaci'],
    alts: ['Marama za vrat sa logom Olimpijskog centra Jahorina na polici suvenirnice', 'Magneti Jahorina: ski cipele, jelke, kabine gondole, daske', 'Vitrina sa maramama Jahorina, rukavicama, naočarama i ski čarapama'],
    pick: 'Iz ponude', show: 'Prikaži', page: 'Više o suvenirnici', pageS: 'Saznaj više', map: 'Kako do nas', mapS: 'Kako do nas',
    gal: 'Sve fotografije', galLabel: 'Galerija: suvenirnica', galOpen: 'Otvori galeriju', photo: 'Fotografija', close: 'Zatvori', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni tekst'
  };

  // izlog: 3 fotografije ovog bloka (smjenjuju se u pozadini); fotografije sa WordPress stranice se dodaju u galeriju kad stignu
  var FIXED = !!root.getAttribute('data-galerija');
  var BASE = FIXED
    ? opt('galerija', '').split(',').map(function (x) { x = x.trim(); return x && { full: x }; }).filter(Boolean)
    : ['suvenirnica-glavna', 'suvenirnica-1', 'suvenirnica-2'].map(function (f, k) {
        var u = HERE + 'slike/' + f;
        return { full: u + '.webp', md: u + '-1000.webp', cap: T.caps[k], capS: T.capsS[k], alt: T.alts[k],
          w: k === 1 ? 1334 : 2000, pos: ['60% 50%', '50% 32%', '50% 56%'][k], r: !k, mpos: ['56% 50%', '50% 30%', '50% 50%'][k], lum: [.78, .8, .62][k] };
      });
  var SHOW = BASE.slice(0, 3), N = SHOW.length;
  var GAL = BASE.slice();

  /* ---------- izgled (sve je pod #jsu-suvenirnica; tokeni iz hero-a, vijesti i ratraka) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;--dur:" + DUR + 'ms;',
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
    '#R a:focus-visible,#R button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je ratrak odmah iznad (.jsu--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub (kao ratrak ispod vijesti) */
    '#R .jsu-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsu--join .jsu-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsu-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jsu-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; fotografija je pozadina cijelog kadra */
    '#R .jsu-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(620px,48vw,860px);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsu-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak topli odsjaj na gornjoj ivici, iznad svjetla izloga */
    '#R .jsu-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 44%,rgba(255,226,190,.4) 70%,transparent 94%)}',
    '#R .jsu-bgs{position:absolute;inset:0;z-index:-1;overflow:hidden;touch-action:pan-y}',
    /* fotografije izloga: aktivna je oštra, ostale čekaju zamućene i tamne (prelaz bez zumiranja) */
    '#R .jsu-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;filter:saturate(.86) brightness(.5) contrast(1.1) blur(14px);',
    'transition:opacity 1.2s ease,filter 1.5s cubic-bezier(.2,.7,.2,1)}',
    /* proizvod (marama) stoji desno od teksta: fotografija počinje od 16% i lijevom ivicom se utapa u tamu */
    '#R .jsu-bg--r{left:16%;width:84%;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 24%);mask-image:linear-gradient(90deg,transparent 0,#000 24%)}',
    '#R .jsu-bg.is-on{opacity:1;filter:saturate(.88) brightness(var(--lum,.78)) contrast(1.1) blur(0px)}',
    /* noćna obrada: plavi sloj, tamni prelaz slijeva (ispod teksta) i odozdo (ispod izbora), vinjeta, toplo svjetlo izloga gore desno */
    '#R .jsu-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.5}',
    '#R .jsu-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.9) 0,rgba(6,11,22,.78) calc(var(--side) + 300px),rgba(6,11,22,.42) calc(var(--side) + 520px),rgba(6,11,22,.08) calc(var(--side) + 740px),rgba(6,11,22,0) calc(var(--side) + 880px)),',
    'linear-gradient(0deg,rgba(6,11,22,.62) 0%,rgba(6,11,22,0) 34%),linear-gradient(180deg,rgba(6,18,42,.3) 0%,rgba(6,18,42,0) 20%),',
    'radial-gradient(130% 100% at 60% 50%,transparent 58%,rgba(4,8,18,.5) 100%)}',
    '#R .jsu-light{position:absolute;inset:0;pointer-events:none;background:radial-gradient(38% 56% at 72% 0%,rgba(255,222,184,.16),rgba(255,200,150,.05) 55%,transparent 80%)}',

    /* tekst lijevo */
    '#R .jsu-body{position:relative;z-index:2;width:min(calc(var(--side) + 540px),56%);padding:clamp(56px,6vw,96px) 0 clamp(56px,6vw,96px) var(--side)}',
    '#R .jsu-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-bottom:24px}',
    '#R .jsu-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(46px,5vw,78px);font-weight:800;line-height:.93;letter-spacing:-.025em}',
    '#R h2.jsu-long{font-size:clamp(36px,3.8vw,58px)}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsu-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important;',
    'filter:drop-shadow(0 0 8px rgba(0,185,242,.35)) drop-shadow(0 6px 30px rgba(0,0,0,.45))}}',
    '#R .jsu-lead{margin-top:26px;font-size:clamp(15.5px,1.2vw,17.5px);line-height:1.62;color:var(--text-2)!important;max-width:42ch;text-wrap:pretty}',
    /* vrste poklona (iz teksta stranice): dvije tihe kolone sa cyan tačkicama */
    '#R .jsu-tags{display:grid;grid-template-columns:repeat(2,max-content);gap:8px 28px;margin-top:20px!important}',
    '#R .jsu-tags li{display:flex;align-items:center;gap:10px;font:500 13.5px/1.3 var(--fb);color:rgba(255,255,255,.66)}',
    '#R .jsu-tags li::before{content:""!important;width:4px;height:4px;flex:none;border-radius:50%;background:var(--accent);box-shadow:0 0 6px rgba(0,185,242,.9)}',
    /* dugmad kao u vijestima: blago ispupčeno cyan dugme sa strelicom u plitkom udubljenom krugu + tamna staklena pilula */
    '#R .jsu-acts{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:34px}',
    '#R .jsu-cta{display:inline-flex;align-items:center;gap:14px;height:46px;padding:0 6px 0 22px!important;border-radius:40px;white-space:nowrap;font:600 14px/1 var(--fd);letter-spacing:.3px;color:#fff!important;',
    'background:linear-gradient(145deg,#27C4F2 0%,#0AAEE6 60%,#03A2D9 100%);transition:transform .25s ease,box-shadow .25s ease;',
    'box-shadow:5px 5px 12px rgba(0,0,0,.42),-4px -4px 10px rgba(70,110,170,.09),0 10px 22px -16px rgba(0,185,242,.6),inset 1px 1px 0 rgba(255,255,255,.32),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jsu-cta__ico{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(0,90,130,.18);box-shadow:inset 2px 2px 4px rgba(0,55,90,.35),inset -1px -1px 3px rgba(255,255,255,.22)}',
    '#R .jsu-cta__ico svg{width:14px;height:14px;transition:transform .25s ease}',
    '#R .jsu-cta:hover{transform:translateY(-1px);box-shadow:6px 7px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(70,110,170,.1),0 12px 26px -14px rgba(0,185,242,.7),inset 1px 1px 0 rgba(255,255,255,.36),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jsu-cta:hover .jsu-cta__ico svg{transform:translateX(2px)}',
    '#R .jsu-cta:active{transform:none;box-shadow:inset 3px 3px 6px rgba(0,60,95,.4),inset -2px -2px 5px rgba(255,255,255,.18)}',
    '#R .jsu-pill{display:inline-flex;align-items:center;gap:9px;height:46px;padding:0 22px!important;border-radius:40px;white-space:nowrap;font:600 14px/1 var(--fd);letter-spacing:.2px;color:#fff!important;',
    'background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08);transition:color .2s,box-shadow .25s}',
    '#R .jsu-pill svg{width:16px;height:16px;color:var(--accent)}',
    '#R .jsu-pill:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.3)}',
    '#R .jsu-s{display:none}',
    /* tehnički razlog kad WordPress ne odgovori — vidi ga samo prijavljeni admin */
    '#R .jsu-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* izbor proizvoda dolje desno: tiha navigacija direktno na fotografiji (bez ploče, korisnik: "da se uklopi u pozadinu,
       a da se opet može kliknuti"): tanka linija, broj i naziv; aktivni je bijel i linija mu se puni cyan bojom; na kraju tihi link galerije */
    '#R .jsu-pick{position:absolute;z-index:3;right:var(--side);bottom:clamp(28px,3vw,46px);display:flex;align-items:flex-end;gap:24px}',
    '#R .jsu-segs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;width:min(430px,31vw)}',
    '#R .jsu-seg{all:unset;position:relative!important;box-sizing:border-box!important;display:block!important;min-width:0;padding:14px 0 2px!important;cursor:pointer}',
    '#R .jsu-seg i{position:absolute;left:0;right:0;top:0;height:2px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,.2);transition:background .3s}',
    '#R .jsu-seg i s{position:absolute;inset:0;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.8);transform:scaleX(0);transform-origin:left center}',
    '#R .jsu-seg.is-on i s{transform:none}',
    '#R.jsu-auto .jsu-seg.is-on i s{transform:scaleX(0);animation:jsuProg var(--dur) linear forwards}',
    '#R.jsu-hold .jsu-seg.is-on i s{animation-play-state:paused}',
    '@keyframes jsuProg{to{transform:none}}',
    '#R .jsu-seg em{display:block;margin-bottom:7px;font:600 10.5px/1 var(--fd);font-style:normal;letter-spacing:1.6px;color:rgba(255,255,255,.42);font-variant-numeric:tabular-nums;transition:color .3s}',
    '#R .jsu-seg .jsu-n{display:block;font:500 14px/1.25 var(--fb);color:rgba(255,255,255,.52);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 10px rgba(0,0,0,.6);transition:color .3s}',
    '#R .jsu-seg:hover i{background:rgba(255,255,255,.38)}',
    '#R .jsu-seg:hover .jsu-n{color:rgba(255,255,255,.86)}',
    '#R .jsu-seg.is-on em{color:var(--accent-2)}',
    '#R .jsu-seg.is-on .jsu-n{color:#fff}',
    '#R .jsu-gal{all:unset;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:8px;height:34px;padding:0 0 0 24px!important;border-left:1px solid rgba(255,255,255,.16)!important;cursor:pointer;white-space:nowrap;',
    'font:600 13px/1 var(--fd)!important;letter-spacing:.2px!important;color:rgba(255,255,255,.72)!important;text-shadow:0 1px 10px rgba(0,0,0,.6);transition:color .2s}',
    '#R .jsu-gal svg{width:16px;height:16px;color:var(--accent)}',
    '#R .jsu-gal i{font-style:normal;color:var(--text-3);font-variant-numeric:tabular-nums}',
    '#R .jsu-gal:hover{color:var(--accent)!important}',

    /* ulazak (jednom): klase jsu-anim/jsu-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsu-anim .jsu-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsu-anim.jsu-on .jsu-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    /* fotografija izađe iz mraka i izoštri se; svjetlo izloga se upali */
    '#R.jsu-anim:not(.jsu-on) .jsu-bg.is-on{opacity:0;filter:saturate(.86) brightness(.3) contrast(1.1) blur(14px)}',
    '#R.jsu-anim .jsu-light{opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-light{opacity:1;transition:opacity 1.8s ease .6s}',
    /* tekst se podiže odozdo, red po red */
    '#R.jsu-anim .jsu-up{opacity:0;transform:translateY(20px)}',
    '#R.jsu-anim.jsu-on .jsu-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsu-anim .jsu-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsu-anim.jsu-on .jsu-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* izbor uplovi odozdo, linije izbora se iscrtaju jedna za drugom */
    '#R.jsu-anim .jsu-pick{opacity:0;transform:translateY(16px)}',
    '#R.jsu-anim.jsu-on .jsu-pick{opacity:1;transform:none;transition:opacity .8s ease .8s,transform 1s cubic-bezier(.2,.7,.2,1) .8s}',
    '#R.jsu-anim .jsu-seg i{transform:scaleX(0);transform-origin:left center}',
    '#R.jsu-anim.jsu-on .jsu-seg i{transform:none;transition:transform .8s cubic-bezier(.2,.7,.2,1) var(--d,0s),background .3s}',

    /* manji laptop: šira kolona teksta */
    /* manji laptop: link galerije ide iznad linija, da izbor ne priđe dugmadi */
    '@media (max-width:1180px){#R .jsu-pick{flex-direction:column-reverse;align-items:flex-end;gap:16px}#R .jsu-segs{width:min(380px,34vw)}#R .jsu-gal{height:auto;padding:0!important;border-left:0!important}}',
    /* tablet i telefon: fotografija gore (utapa se nadolje), izbor proizvoda na njenoj donjoj ivici, tekst ispod */
    '@media (max-width:980px){',
    '#R .jsu-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jsu-bgs{position:relative;inset:auto;height:min(64vw,560px);-webkit-mask-image:linear-gradient(180deg,#000 62%,transparent 100%);mask-image:linear-gradient(180deg,#000 62%,transparent 100%)}',
    '#R .jsu-bg--r{left:0;width:100%;-webkit-mask-image:none;mask-image:none}',
    '#R .jsu-scrim{background:linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 40%),linear-gradient(180deg,rgba(6,18,42,.36) 0%,rgba(6,18,42,0) 26%)}',
    '#R .jsu-light{background:radial-gradient(60% 60% at 60% 0%,rgba(255,222,184,.14),transparent 75%)}',
    '#R .jsu-pick{position:relative;right:auto;bottom:auto;flex-direction:row;align-items:flex-end;justify-content:space-between;gap:20px;margin:-88px clamp(22px,6vw,56px) 0}',
    '#R .jsu-segs{width:min(480px,72%)}',
    '#R .jsu-gal{height:34px;padding:0 0 0 20px!important;border-left:1px solid rgba(255,255,255,.16)!important}',
    '#R .jsu-body{width:auto;padding:clamp(30px,5vw,48px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.6vw,66px)}',
    '#R .jsu-lead{max-width:56ch}}',
    '@media (max-width:760px){',
    '#R .jsu-frame{border-radius:24px}',
    '#R .jsu-bgs{height:min(108vw,480px)}',
    '#R .jsu-bg[data-k]{object-position:var(--mpos)!important}',
    '#R .jsu-pick{position:static;margin:-74px 22px 0}',
    '#R .jsu-segs{flex:1;width:auto;gap:12px}',
    '#R .jsu-seg .jsu-n{font-size:12.5px}',
    '#R .jsu-gal{position:absolute!important;z-index:3;top:clamp(16px,4vw,28px);right:14px;height:38px;padding:0 13px!important;border:0!important;border-radius:40px!important;text-shadow:none;',
    'background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.07)!important}',
    '#R .jsu-gal b{display:none}',
    '#R .jsu-body{padding:26px 22px 30px}',
    '#R .jsu-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jsu-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.6vw,54px)}',
    '#R h2.jsu-long{font-size:clamp(30px,8.6vw,42px)}',
    '#R .jsu-lead{margin-top:18px}',
    '#R .jsu-tags{column-gap:18px}',
    '#R .jsu-tags li{font-size:13px}',
    '#R .jsu-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:26px;width:100%}',
    '#R .jsu-cta{height:42px;padding:0 5px 0 16px!important;font-size:13px;justify-content:space-between}',
    '#R .jsu-cta__ico{width:30px;height:30px}',
    '#R .jsu-pill{height:42px;justify-content:center;font-size:13px;padding:0 14px!important}',
    '#R .jsu-l{display:none}',
    '#R .jsu-s{display:inline}}',
    '@media (max-width:380px){#R .jsu-segs{gap:9px}#R .jsu-seg .jsu-n{font-size:12px}}',
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
    gallery: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" ' + S + '/><path d="M3.8 15.5 L8.5 11 L12 14.2 L14.6 12 L20.2 16.8" ' + S + '/><circle cx="15.5" cy="9" r="1.4" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
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
  function pad(k) { return (k < 9 ? '0' : '') + (k + 1); }
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
    return lines.map(function (l, i) { return '<span class="jsu-up" style="--d:' + (.36 + i * .1).toFixed(2) + 's">' + esc(l) + '</span>'; }).join('') +
      '<span class="jsu-o jsu-up" style="--d:' + (.36 + lines.length * .1).toFixed(2) + 's">' + esc(o) + '</span>';
  }
  // uvod: prva rečenica pasusa (i druga, ako je prva vrlo kratka)
  function leadOf(p) {
    var ss = clean(p).match(/[^.!?]+(?:[.!?]+|$)/g) || [p], out = clean(ss[0]);
    if (out.length < 70 && ss[1]) out += ' ' + clean(ss[1]);
    return clip(out, 260);
  }

  /* ---------- crtanje ---------- */
  function bg(g, k) {
    var set = g.md ? ' srcset="' + esc(g.md) + ' 1000w, ' + esc(g.full) + ' ' + (g.w || 2000) + 'w" sizes="100vw"' : '';
    return '<img class="jsu-bg' + (g.r ? ' jsu-bg--r' : '') + (k ? '' : ' is-on') + '" data-k="' + k + '" src="' + esc(g.full) + '"' + set + ' alt="' + esc(g.alt || '') + '"' +
      (k ? ' aria-hidden="true"' : '') + ' style="' + (g.pos ? 'object-position:' + g.pos + ';' : '') + (g.mpos ? '--mpos:' + g.mpos + ';' : '') + (g.lum ? '--lum:' + g.lum : '') + '" decoding="async" loading="lazy">';
  }
  function seg(g, k) {
    var cap = g.cap || T.photo + ' ' + (k + 1);
    return '<button type="button" class="jsu-seg' + (k ? '' : ' is-on') + '" data-k="' + k + '" style="--d:' + (1 + k * .12).toFixed(2) + 's" aria-pressed="' + (k ? 'false' : 'true') + '"' +
      ' aria-label="' + esc(T.show + ': ' + cap) + '"><i><s></s></i><em>' + pad(k) + '</em><span class="jsu-n">' + lbl(cap, g.capS || cap) + '</span></button>';
  }
  root.innerHTML =
    '<section class="jsu-wrap" aria-labelledby="jsu-h"><div class="jsu-frame">' +
      '<div class="jsu-bgs">' + SHOW.map(bg).join('') + '<span class="jsu-tint"></span><span class="jsu-scrim"></span><span class="jsu-light"></span></div>' +
      '<nav class="jsu-pick" aria-label="' + esc(T.pick) + '"><div class="jsu-segs">' + SHOW.map(seg).join('') + '</div>' +
        '<button type="button" class="jsu-gal" aria-haspopup="dialog">' + ICON.gallery + '<b>' + esc(T.gal) + '</b> <i></i></button></nav>' +
      '<div class="jsu-body">' +
        '<div class="jsu-kicker jsu-up" style="--d:.26s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jsu-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jsu-lead jsu-up" style="--d:.72s">' + esc(T.lead) + '</p>' +
        '<ul class="jsu-tags jsu-up" style="--d:.82s">' + T.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="jsu-acts jsu-up" style="--d:.94s">' +
          '<a class="jsu-cta" href="' + esc(PAGE) + '" data-jsu="stranica">' + lbl(T.page, T.pageS) + '<b class="jsu-cta__ico">' + ICON.arrow + '</b></a>' +
          '<a class="jsu-pill" href="' + esc(MAPA) + '" target="_blank" rel="noopener" data-jsu="mapa">' + ICON.pin + lbl(T.map, T.mapS) + '</a>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
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

  /* ---------- izlog: smjena proizvoda u pozadini ---------- */
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO = N > 1 && !reduced && 'IntersectionObserver' in w;
  var cur = 0, timer = 0, t0 = 0, left = DUR, hov = false, foc = false, vis = false, on = false;
  function hold() { return hov || foc || !vis || !on || d.hidden; }
  function stop() {
    if (timer) { clearTimeout(timer); timer = 0; left = Math.max(0, left - (Date.now() - t0)); }
    root.classList.add('jsu-hold');
  }
  function go() {
    if (!AUTO || timer) return;
    if (hold()) { root.classList.add('jsu-hold'); return; }
    root.classList.remove('jsu-hold');
    t0 = Date.now(); timer = setTimeout(function () { timer = 0; show(cur + 1); }, left);
  }
  function show(k) {
    k = (k % N + N) % N;
    if (timer) { clearTimeout(timer); timer = 0; }
    left = DUR;
    if (k !== cur) {
      cur = k;
      qa('.jsu-bg').forEach(function (im) {
        var a = +im.getAttribute('data-k') === k;
        im.classList.toggle('is-on', a);
        if (a) im.removeAttribute('aria-hidden'); else im.setAttribute('aria-hidden', 'true');
      });
      qa('.jsu-seg').forEach(function (b) {
        var a = +b.getAttribute('data-k') === k;
        b.classList.toggle('is-on', a); b.setAttribute('aria-pressed', a ? 'true' : 'false');
      });
    }
    go();
  }
  if (AUTO) root.classList.add('jsu-auto');
  q('.jsu-segs').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.jsu-seg');
    if (b) show(+b.getAttribute('data-k'));
  });
  var fr = q('.jsu-frame');
  fr.addEventListener('mouseenter', function () { hov = true; stop(); });
  fr.addEventListener('mouseleave', function () { hov = false; go(); });
  fr.addEventListener('focusin', function () { foc = true; stop(); });
  fr.addEventListener('focusout', function (e) { if (!fr.contains(e.relatedTarget)) { foc = false; go(); } });
  d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else go(); });
  if ('IntersectionObserver' in w) new IntersectionObserver(function (es) {
    vis = es[es.length - 1].isIntersecting; if (vis) go(); else stop();
  }, { threshold: .25 }).observe(fr);
  // prevlačenje prstom preko fotografije bira sljedeći/prethodni proizvod
  (function () {
    var bx = q('.jsu-bgs'), sx = 0, sy = 0, down = false;
    bx.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; down = true; sx = e.clientX; sy = e.clientY; });
    bx.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(cur + (dx < 0 ? 1 : -1));
    });
    bx.addEventListener('pointercancel', function () { down = false; });
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
    lbImg.alt = GAL[lbCur].alt || GAL[lbCur].cap || (T.photo + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T.kicker);
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
  q('.jsu-gal').addEventListener('click', function () { lbOpen(cur); });   // galerija počinje od proizvoda koji je u izlogu

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

  // ulazak jednom, kad kadar dođe u vidno polje; smjena proizvoda kreće tek poslije ulaska
  var still = !('IntersectionObserver' in w) || reduced;
  if (still) on = true;
  else {
    root.classList.add('jsu-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jsu-on'); io.disconnect();
        setTimeout(function () { on = true; go(); }, 1600);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(fr);
  }
})(window, document);
