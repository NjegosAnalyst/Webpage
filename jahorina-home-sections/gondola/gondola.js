/* =====================================================================
   JAHORINA — VIP GONDOLA (početna, ispod Olimpijskog bara) · v1.1 "noćna vožnja"
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, fotografija
   u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · cik-cak sa barom iznad (tamo tekst desno): ovdje je tekst lijevo, a desno u kadru noćna fotografija gondole Poljice;
     · LED SE PALI: kad kadar uđe u ekran, kabine su ugašene, pa im se LED rasvjeta upali duž užeta (od dalekih ka
       bliskim), sa mekim plavim sjajem oko bliskih kabina i tankim odsjajem na gornjoj ivici kadra. Jednom, ~2 s;
     · lijevo iza teksta diskretno stoji fotografija kabine iznutra (šampanjac), utopljena u noć;
     · ULAZNICA sa paketima: VIP 1 / VIP 2 (izbor u plitkom žlijebu), šta je uključeno i cijena na otcjepku ulaznice;
       dugme "Rezerviši VIP N" otvara mail sa već upisanim paketom; "Galerija" = fotografije preko ekrana.

   SADRŽAJ JE IZ WORDPRESSA (stranica VIP gondole, data-stranica = slug; ako slug ne postoji, traži se stranica sa "VIP"):
     nadnaslov = naslov stranice; uvod = rečenica "Priuštite sebi …" (ili prva rečenica); paketi = "VIP gondola 1/2 …
     cijena … KM … do 1h … šampanjac … meze" iz teksta; mail = prvi mailto: link (ili link "OVDJE"); "dan ranije" iz
     teksta; fotografije = 3 naše + sve slike sa stranice; "Više o VIP gondoli" = link stranice.
     Dok WordPress ne odgovori, stoji ugrađeni tekst (isti kao na stranici 9. 10. 2026). Prijavljeni admin vidi razlog.

   Ugradnja: Elementor HTML widget sa <div id="jg-gondola"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jg-gondola"> (sva su neobavezna):
     data-stranica="vip-gondola"   (slug WordPress stranice)
     data-mail="…@oc-jahorina.com" (zamjena za mail sa stranice)
     data-galerija="url1, url2"    (zamjena za fotografije)
   GA: izbor paketa → gondola_paket (paket), Rezerviši → gondola_rezervacija (nacin: mail, paket),
       fotografije → gondola_galerija, "Više o VIP gondoli" → gondola_klik (cilj: stranica).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jg-gondola');
  if (!root || root.__jg) return;
  root.__jg = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'vip-gondola').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var MAIL_FIXED = !!opt('mail', '');
  var MAIL = opt('mail', 'skipass@oc-jahorina.com'), RES_URL = '';   // mail prodaje (kao za ratrak) dok ga stranica ne da
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ugrađeni tekst = tekst stranice VIP gondole (9. 10. 2026); naslov je korisnikov dizajn; EN je prevod
  var T = EN ? {
    kicker: 'VIP gondola', h: ['Ride in the', 'VIP gondola'],
    lead: 'Treat yourself to an unforgettable ride: settle into the leather seats, open a bottle of champagne and taste a fine meze platter of delicious local products, prepared for you with great care and love.',
    pick: 'Choose your package', price: 'Package price', ride: 'Ride up to', rideX: 'Panoramic ride', ch: 'Champagne', mz: 'Meze platter',
    book: 'Book', bookS: 'Book', inside: 'Gallery', insideS: 'Gallery', more: 'More about the VIP gondola',
    adv: function (n) { return 'Book by email at least ' + (n ? n + ' days' : 'a day') + ' in advance'; }, advX: 'Book by email',
    name: 'VIP gondola', subj: 'Booking: ', body: 'Hello,\n\nI would like to book the {p} package.\n\nDate:\nPreferred time:\nNumber of guests:\nName:\nPhone:\n\nThank you!',
    gal: 'VIP gondola photos', photo: 'Photo', prev: 'Previous photo', next: 'Next photo', close: 'Close',
    why: 'WordPress', whyTail: 'showing built-in content',
    photos: ['Inside the VIP cabin: black leather seats with Jahorina headrests, a bottle of Moët and a glass on the table, the ski slope through the window',
      'Two hands toasting with champagne in front of a snowy mountain', 'Gondola Poljice at night: cabins with blue LED lights on the cable']
  } : {
    kicker: 'VIP gondola', h: ['Vožnja', 'VIP gondolom'],
    lead: 'Priuštite sebi nezaboravnu vožnju, udobno se smjestite u kožna sjedišta, otvorite bocu šampanjca i probajte izvrsnu mezu sačinjenu od velikog broja preukusnih domaćih proizvoda, pripremljenu za vas sa velikom pažnjom i ljubavlju.',
    pick: 'Izaberite paket', price: 'Cijena paketa', ride: 'Vožnja do', rideX: 'Panoramska vožnja', ch: 'Šampanjac', mz: 'Meze',
    book: 'Rezerviši', bookS: 'Rezerviši', inside: 'Galerija', insideS: 'Galerija', more: 'Više o VIP gondoli',
    adv: function (n) { return 'Rezervacija e-poštom, najmanje ' + (n ? n + ' dana' : 'dan') + ' ranije'; }, advX: 'Rezervacija e-poštom',
    name: 'VIP gondola', subj: 'Rezervacija: ', body: 'Poštovani,\n\nželim da rezervišem paket {p}.\n\nDatum vožnje:\nOkvirno vrijeme:\nBroj osoba:\nIme i prezime:\nKontakt telefon:\n\nHvala!',
    gal: 'Fotografije VIP gondole', photo: 'Fotografija', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija', close: 'Zatvori',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj',
    photos: ['Unutrašnjost VIP kabine: crna kožna sjedišta sa naslonima Jahorine, boca Moët šampanjca i čaša na stolu, staza kroz prozor',
      'Zdravica šampanjcem ispred snijegom pokrivene planine', 'Gondola Poljice noću: kabine sa plavom LED rasvjetom na užetu']
  };
  // paketi (sa stranice 9. 10. 2026); WordPress ih zamijeni kad se cijene ili sadržaj promijene
  var PK = [
    { n: '1', price: '150', cur: 'KM', dur: '1 h', ch: true, mz: false },
    { n: '2', price: '250', cur: 'KM', dur: '1 h', ch: true, mz: true }
  ];
  var ADV = '';   // '' = dan; broj dana ako stranica kaže "najmanje 2 dana"
  var SEL = 0;

  // fotografije: noćna gondola je pozadina kadra; galerija počinje od unutrašnjosti; kabina iznutra je i diskretno lijevo u kadru
  var NIGHT = HERE + 'slike/gondola-noc.webp', INSIDE = HERE + 'slike/gondola-kabina.webp';
  var FIXED_GAL = !!opt('galerija', '');
  var BASE = ['gondola-kabina', 'gondola-zdravica', 'gondola-noc'].map(function (f, k) { return { full: HERE + 'slike/' + f + '.webp', alt: T.photos[k] }; });
  var GAL = FIXED_GAL ? opt('galerija', '').split(',').map(function (x) { x = x.trim(); return x && { full: x }; }).filter(Boolean) : BASE.slice();

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jg--boxed{border-radius:28px;overflow:hidden}',
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
       Kad je bar odmah iznad (.jg--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jg-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jg--join .jg-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jg-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jg-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; noćna fotografija gondole je pozadina, desno */
    '#R .jg-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(600px,44vw,780px);border-radius:26px;overflow:hidden;isolation:isolate;background:var(--bg);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jg-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak hladan odsjaj na gornjoj ivici, iznad kabina (jedini izvor svjetla je LED); pali se sa LED-om */
    '#R .jg-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;opacity:var(--led,1);background:linear-gradient(90deg,transparent 50%,rgba(120,196,255,.46) 76%,transparent 97%)}',
    '#R .jg-bgs{position:absolute;inset:0;z-index:-1;overflow:hidden;cursor:zoom-in}',
    /* fotografija u visini kadra, širina po razmjeri (oštra, bez velikog uvećanja); lijeva ivica se utapa u tamu */
    /* fotografija iznutra (kabina sa šampanjcem), diskretno lijevo iza teksta: boca stoji desno od teksta, slika se utapa
       udesno prije kabina na noćnoj fotografiji */
    '#R .jg-in{position:absolute;inset:0;pointer-events:none;',
    '-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,.85) 0,#000 min(calc(var(--side) + 300px),30%),transparent min(calc(var(--side) + 820px),62%));',
    'mask-image:linear-gradient(90deg,rgba(0,0,0,.85) 0,#000 min(calc(var(--side) + 300px),30%),transparent min(calc(var(--side) + 820px),62%))}',
    '#R .jg-in img{position:absolute;top:0;left:calc(var(--side) + 520px);height:100%;width:auto;transform:translateX(-53%);filter:saturate(.8) brightness(.56) contrast(1.05);',
    '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 24%);mask-image:linear-gradient(90deg,transparent 0,#000 24%)}',
    '#R .jg-ph{position:absolute;top:0;right:0;height:100%;aspect-ratio:1080/675;min-width:58%;mix-blend-mode:lighten;',
    '-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34%);mask-image:linear-gradient(90deg,transparent 0,#000 34%)}',
    '#R .jg-ph img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:50% 56%}',
    /* LED: ugašeno (prigušeno, bez boje) i upaljeno; upaljeni sloj se otkriva slijeva nadesno (--led 0 → 1) */
    '#R .jg-dim{filter:brightness(.4) saturate(.22) contrast(1.05)}',
    '#R .jg-lit{filter:saturate(1.15) brightness(1.06) contrast(1.06);',
    '-webkit-mask-image:linear-gradient(90deg,#000 calc(var(--led,1) * 135% - 35%),transparent calc(var(--led,1) * 135%));mask-image:linear-gradient(90deg,#000 calc(var(--led,1) * 135% - 35%),transparent calc(var(--led,1) * 135%))}',
    /* meki plavi sjaj oko bliskih kabina, kad se LED upali */
    '#R .jg-glow{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:calc((var(--led,1) - .7) * 3.4);',
    'background:radial-gradient(17% 27% at 70.8% 52%,rgba(40,140,255,.24),rgba(40,140,255,.07) 55%,transparent 75%),radial-gradient(14% 23% at 88.7% 62.5%,rgba(40,140,255,.2),rgba(40,140,255,.06) 55%,transparent 75%)}',
    /* crno nebo fotografije postaje boja kadra (bez vidljive ivice fotografije) */
    '#R .jg-sky{position:absolute;inset:0;pointer-events:none;background:var(--bg);mix-blend-mode:lighten}',
    '#R .jg-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.3}',
    '#R .jg-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.9) 0,rgba(6,11,22,.76) calc(var(--side) + 380px),rgba(6,11,22,.38) calc(var(--side) + 580px),rgba(6,11,22,0) calc(var(--side) + 780px)),',
    'linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 28%),radial-gradient(130% 100% at 62% 50%,transparent 58%,rgba(4,8,18,.5) 100%)}',

    /* tekst lijevo (cik-cak sa barom iznad), poravnat sa lijevom ivicom mreže 1240px */
    '#R .jg-body{position:relative;z-index:2;width:min(calc(var(--side) + 560px),58%);padding:clamp(56px,6vw,92px) 0 clamp(56px,6vw,92px) var(--side)}',
    '#R .jg-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.78);margin-bottom:24px}',
    '#R .jg-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(44px,4.7vw,74px);font-weight:800;line-height:.95;letter-spacing:-.025em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    /* iscrtani kraj naslova svijetli kao LED kabine (sjaj raste dok se LED pali) */
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jg-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important;',
    'filter:drop-shadow(0 0 calc(5px + var(--led,1) * 5px) rgba(0,185,242,calc(.18 + var(--led,1) * .22))) drop-shadow(0 6px 30px rgba(0,0,0,.45))}}',
    '#R .jg-lead{margin-top:24px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:46ch;text-wrap:pretty}',

    /* ULAZNICA: lijevo izbor paketa i šta je uključeno, desno (iza perforacije) cijena; zarezi na perforaciji */
    '#R .jg-pass{position:relative;margin-top:30px;width:min(100%,480px);filter:drop-shadow(0 12px 22px rgba(0,0,0,.42))}',
    '#R .jg-pass-in{--px:66%;position:relative;display:grid;grid-template-columns:66% 34%;border-radius:16px;',
    'background:radial-gradient(circle 10px at var(--px) 0,transparent 8.6px,rgba(255,255,255,.1) 9.2px,transparent 10px),radial-gradient(circle 10px at var(--px) 100%,transparent 8.6px,rgba(255,255,255,.1) 9.2px,transparent 10px),',
    'linear-gradient(145deg,rgba(24,36,60,.9),rgba(13,21,37,.9));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 1px 1px 0 rgba(255,255,255,.06);',
    '-webkit-mask:radial-gradient(circle 9px at var(--px) 0,transparent 96%,#000) top/100% 51% no-repeat,radial-gradient(circle 9px at var(--px) 100%,transparent 96%,#000) bottom/100% 51% no-repeat;',
    'mask:radial-gradient(circle 9px at var(--px) 0,transparent 96%,#000) top/100% 51% no-repeat,radial-gradient(circle 9px at var(--px) 100%,transparent 96%,#000) bottom/100% 51% no-repeat}',
    '#R .jg-opt{padding:16px 18px 17px;min-width:0}',
    '#R .jg-lab{display:block;font:600 9.5px/1.2 var(--fd);letter-spacing:1.6px;text-transform:uppercase;color:var(--text-3)}',
    /* izbor u plitkom žlijebu; aktivni je ispupčen, sa tankom cyan linijom; klizi između paketa */
    '#R .jg-tog{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;margin-top:10px;padding:4px;border-radius:40px;background:rgba(5,9,18,.55);',
    'box-shadow:inset 3px 3px 7px rgba(0,0,0,.5),inset -2px -2px 6px rgba(70,96,142,.12)}',
    '#R .jg-tog > i{position:absolute;top:4px;bottom:4px;left:calc(4px + var(--i,0) * (100% - 8px) / var(--n,2));width:calc((100% - 8px) / var(--n,2));border-radius:40px;pointer-events:none;',
    'background:linear-gradient(145deg,#1d2a46,#121b2e);box-shadow:3px 3px 7px rgba(0,0,0,.45),-2px -2px 6px rgba(78,104,150,.14),inset 0 0 0 1px rgba(0,185,242,.22);transition:left .45s cubic-bezier(.2,.7,.2,1)}',
    '#R .jg-tog > i::after{content:"";position:absolute;left:34%;right:34%;bottom:4px;height:1.5px;border-radius:2px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.8)}',
    '#R .jg-tb{all:unset;position:relative!important;z-index:1;box-sizing:border-box!important;display:flex!important;align-items:center;justify-content:center;height:36px;padding:0 10px!important;border-radius:40px!important;cursor:pointer;',
    'font:700 13px/1 var(--fd)!important;letter-spacing:.8px!important;color:var(--text-3)!important;white-space:nowrap;transition:color .3s}',
    '#R .jg-tb:hover{color:#fff!important}',
    '#R .jg-tb[aria-checked="true"]{color:#fff!important}',
    '#R .jg-tog--one > i{display:none}',
    '#R .jg-tog--one .jg-tb{color:#fff!important;cursor:default}',
    /* šta je uključeno: uključeno bijelo sa cyan ikonom, neuključeno prigušeno */
    '#R .jg-inc{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:14px!important}',
    '#R .jg-inc li{display:flex;align-items:center;gap:7px;font:500 13px/1.2 var(--fb);color:var(--text-2);white-space:nowrap;transition:opacity .35s,color .35s}',
    '#R .jg-inc svg{width:16px;height:16px;color:var(--accent);transition:color .35s}',
    '#R .jg-inc li.is-off{opacity:.36}',
    '#R .jg-inc li.is-off svg{color:var(--text-3)}',
    /* otcjepak sa cijenom; perforacija je isprekidana linija između zareza */
    '#R .jg-stub{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 8px;text-align:center}',
    '#R .jg-stub::before{content:"";position:absolute;left:-.75px;top:15px;bottom:15px;border-left:1.5px dashed rgba(255,255,255,.17)}',
    '#R .jg-price{display:flex;align-items:baseline;gap:5px;white-space:nowrap}',
    '#R .jg-price b{font:800 44px/1 var(--fd);letter-spacing:-.02em;color:#fff;font-variant-numeric:tabular-nums}',
    '#R .jg-price i{font:700 14px/1 var(--fd);font-style:normal;color:var(--accent-2)}',
    /* dugmad kao u ratraku i baru: bijelo glavno + stakleno sporedno, iste širine i visine, široka kao ulaznica */
    '#R .jg-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;width:min(100%,480px)}',
    '#R .jg-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 16px!important;border-radius:40px!important;cursor:pointer;',
    'white-space:nowrap;font:600 13.5px/1 var(--fb)!important;letter-spacing:.2px!important}',
    '#R .jg-btn svg{width:15px;height:15px}',
    '#R .jg-s{display:none}',
    '#R .jg-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6)!important;transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)!important}',
    '#R .jg-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jg-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)!important}',
    '#R .jg-btn--solid:hover::after{animation:jgShine 1.6s ease-in-out}',
    '@keyframes jgShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jg-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff!important}',
    '#R .jg-btn--ghost{color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:color .2s,box-shadow .25s}',
    '#R .jg-btn--ghost svg{color:var(--accent)}',
    '#R .jg-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)!important}',
    '#R .jg-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)!important}',
    /* napomena o rezervaciji i tihi link stranice u jednom redu */
    '#R .jg-note{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:18px;font:500 12.5px/1.35 var(--fb);color:var(--text-3)}',
    '#R .jg-adv{display:inline-flex;align-items:center;gap:7px}',
    '#R .jg-adv svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jg-more{display:inline-flex;align-items:center;gap:8px;padding-left:16px;border-left:1px solid rgba(255,255,255,.14);color:var(--text-3)!important;transition:color .2s}',
    '#R .jg-more svg{width:14px;height:14px;transition:transform .25s ease}',
    '#R .jg-more:hover{color:var(--accent)!important}',
    '#R .jg-more:hover svg{transform:translateX(3px)}',
    '#R .jg-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jg-anim/jg-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jg-anim .jg-frame{opacity:0;transform:translateY(28px)}',
    '#R.jg-anim.jg-on .jg-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jg-anim .jg-in{opacity:0}',
    '#R.jg-anim.jg-on .jg-in{opacity:1;transition:opacity 1.5s ease .1s}',
    '#R.jg-anim .jg-ph{opacity:0}',
    '#R.jg-anim.jg-on .jg-ph{opacity:1;transition:opacity 1.3s ease .25s}',
    '#R.jg-anim .jg-up{opacity:0;transform:translateY(20px)}',
    '#R.jg-anim.jg-on .jg-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jg-anim .jg-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jg-anim.jg-on .jg-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',

    /* manji laptop */
    '@media (max-width:1180px){#R .jg-body{width:min(calc(var(--side) + 500px),60%)}#R .jg-price b{font-size:38px}#R .jg-btn{padding:0 12px!important}}',
    /* tablet i telefon: fotografija gore (utapa se nadolje), tekst ispod */
    '@media (max-width:980px){',
    '#R .jg-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jg-bgs{position:relative;inset:auto;height:min(62vw,500px);-webkit-mask-image:linear-gradient(180deg,#000 66%,transparent 100%);mask-image:linear-gradient(180deg,#000 66%,transparent 100%)}',
    '#R .jg-ph{left:0;width:100%;min-width:0;aspect-ratio:auto;-webkit-mask-image:none;mask-image:none}',
    '#R .jg-ph img{object-position:80% 55%}',
    '#R .jg-in{-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,.9) 0,#000 16%,transparent 48%);mask-image:linear-gradient(90deg,rgba(0,0,0,.9) 0,#000 16%,transparent 48%)}',
    '#R .jg-in img{left:21%;-webkit-mask-image:none;mask-image:none}',
    '#R .jg-scrim{background:linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 40%),linear-gradient(90deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 40%)}',
    '#R .jg-body{width:auto;padding:clamp(24px,4vw,40px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.4vw,64px)}',
    '#R .jg-lead{max-width:56ch}',
    '#R .jg-pass,#R .jg-acts{width:min(100%,520px)}}',
    '@media (max-width:760px){',
    '#R .jg-frame{border-radius:24px}',
    '#R .jg-bgs{height:min(92vw,420px)}',
    '#R .jg-ph img{object-position:90% 55%}',
    '#R .jg-in{-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,.7) 0,rgba(0,0,0,.8) 12%,transparent 42%);mask-image:linear-gradient(90deg,rgba(0,0,0,.7) 0,rgba(0,0,0,.8) 12%,transparent 42%)}',
    '#R .jg-in img{left:18%;filter:saturate(.8) brightness(.46) contrast(1.05)}',
    '#R .jg-body{padding:6px 20px 30px}',
    '#R .jg-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jg-kicker::before{width:22px}',
    '#R h2{font-size:clamp(36px,11vw,52px)}',
    '#R .jg-lead{margin-top:18px}',
    '#R .jg-pass{margin-top:24px}',
    '#R .jg-pass-in{--px:67%;grid-template-columns:67% 33%}',
    '#R .jg-opt{padding:14px 14px 15px}',
    '#R .jg-tb{height:34px}',
    '#R .jg-inc{gap:7px 12px}',
    '#R .jg-inc li{font-size:12.5px;gap:6px}',
    '#R .jg-price b{font-size:34px}',
    '#R .jg-price i{font-size:12.5px}',
    '#R .jg-acts{gap:8px;margin-top:16px;width:100%}',
    '#R .jg-btn{height:42px;padding:0 12px!important;font-size:13px!important}',
    '#R .jg-l{display:none}',
    '#R .jg-s{display:inline}',
    '#R .jg-note{flex-direction:column;align-items:flex-start;gap:12px;font-size:12px}',
    '#R .jg-more{padding-left:0;border-left:0;font-size:13px}}',
    '@media (max-width:360px){#R .jg-acts{grid-template-columns:1fr}#R .jg-inc li{font-size:12px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

    /* fotografije preko cijelog ekrana (iste kao u ratraku i suvenirnici) */
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
    '#L .jg-lb-close{top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px)}',
    '#L .jg-lb-prev{left:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L .jg-lb-next{right:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L.is-one .jg-lb-prev,#L.is-one .jg-lb-next{display:none!important}',
    '@media (max-width:760px){#L img{max-height:calc(100vh - 210px);border-radius:14px}#L .jg-lb-prev,#L .jg-lb-next{top:auto;bottom:22px;transform:none}#L .jg-lb-prev{left:calc(50% - 60px)}#L .jg-lb-next{right:calc(50% - 60px)}}',
    '@media (prefers-reduced-motion:reduce){#L,#L figure{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jg-gondola').replace(/#L/g, '#jg-lb');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jg-css');
  if (!st) { st = d.createElement('style'); st.id = 'jg-css'; (d.head || d.documentElement).appendChild(st); }
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
    clock: svg('<circle cx="12" cy="12" r="8.4" ' + S + '/><path d="M12 7.6 V12 L15 13.8" ' + S + '/>'),
    flute: svg('<path d="M9 3.5 H15 L14.4 10.2 C14.2 12 13.2 13.2 12 13.2 C10.8 13.2 9.8 12 9.6 10.2 Z M12 13.2 V19.6 M8.8 20.4 H15.2 M9.5 7.6 H14.5" ' + S + '/>'),
    meze: svg('<path d="M3.5 15.5 H20.5 C20.5 17.7 18.7 19.5 16.5 19.5 H7.5 C5.3 19.5 3.5 17.7 3.5 15.5 Z" ' + S + '/><circle cx="8.4" cy="12.4" r="2" ' + S + '/><path d="M12.4 13.6 L14.6 9.2 L16.8 13.6 M17.6 11.4 C18.6 11.4 19.4 12.2 19.4 13.2" ' + S + '/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.4" ' + S + '/><path d="M4.5 7 L12 12.6 L19.5 7" ' + S + '/>'),
    photos: svg('<rect x="3.5" y="6" width="13.5" height="12" rx="2.2" ' + S + '/><path d="M7 3.8 H18.3 C19.5 3.8 20.5 4.8 20.5 6 V14.6 M3.9 15.6 L8 11.6 L11 14.4 L12.8 12.8 L16.8 16.4" ' + S + '/><circle cx="12.6" cy="9.6" r="1.1" ' + S + '/>'),
    info: svg('<circle cx="12" cy="12" r="8.4" ' + S + '/><path d="M12 11 V16 M12 7.9 V8" ' + S + '/>'),
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon)
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jg-l">' + esc(l) + '</span><span class="jg-s">' + esc(s) + '</span>'; }
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
  // rečenice teksta; tačka u broju (1.879) ne prekida rečenicu
  function sentences(p) { return (clean(p).match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]+|$)/g) || []).map(clean).filter(Boolean); }

  /* ---------- crtanje ---------- */
  function incHTML() {
    var any = function (k) { return PK.some(function (p) { return p[k]; }); };
    return '<li data-f="dur">' + ICON.clock + '<span></span></li>' +
      (any('ch') ? '<li data-f="ch">' + ICON.flute + '<span>' + esc(T.ch) + '</span></li>' : '') +
      (any('mz') ? '<li data-f="mz">' + ICON.meze + '<span>' + esc(T.mz) + '</span></li>' : '');
  }
  function passHTML() {
    var one = PK.length < 2;
    return '<div class="jg-pass-in">' +
      '<div class="jg-opt">' +
        '<span class="jg-lab" id="jg-pl">' + esc(T.pick) + '</span>' +
        '<div class="jg-tog' + (one ? ' jg-tog--one' : '') + '" role="radiogroup" aria-labelledby="jg-pl" style="--n:' + PK.length + '"><i></i>' +
          PK.map(function (p, k) { return '<button type="button" class="jg-tb" role="radio" data-k="' + k + '">VIP ' + esc(p.n) + '</button>'; }).join('') +
        '</div>' +
        '<ul class="jg-inc">' + incHTML() + '</ul>' +
      '</div>' +
      '<div class="jg-stub"><span class="jg-lab">' + esc(T.price) + '</span><span class="jg-price" aria-live="polite"><b></b><i></i></span></div>' +
    '</div>';
  }
  root.innerHTML =
    '<section class="jg-wrap" aria-labelledby="jg-h"><div class="jg-frame">' +
      '<div class="jg-bgs"><div class="jg-in"><img src="' + esc(INSIDE) + '" alt="' + esc(T.photos[0]) + '" decoding="async"></div><div class="jg-ph">' +
        '<img class="jg-dim" src="' + esc(NIGHT) + '" alt="' + esc(T.photos[2]) + '" decoding="async">' +
        '<img class="jg-lit" src="' + esc(NIGHT) + '" alt="" aria-hidden="true" decoding="async">' +
        '<span class="jg-glow"></span>' +
      '</div><span class="jg-sky"></span><span class="jg-tint"></span><span class="jg-scrim"></span></div>' +
      '<div class="jg-body">' +
        '<div class="jg-kicker jg-up" style="--d:.26s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jg-h"><span class="jg-up" style="--d:.36s">' + esc(T.h[0]) + '</span><span class="jg-o jg-up" style="--d:.46s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jg-lead jg-up" style="--d:.62s">' + esc(T.lead) + '</p>' +
        '<div class="jg-pass jg-up" style="--d:.74s">' + passHTML() + '</div>' +
        '<div class="jg-acts jg-up" style="--d:.86s">' +
          '<a class="jg-btn jg-btn--solid" data-jg="rezervacija"></a>' +
          '<button type="button" class="jg-btn jg-btn--ghost" data-jg="galerija" aria-haspopup="dialog">' + ICON.photos + lbl(T.inside, T.insideS) + '</button>' +
        '</div>' +
        '<div class="jg-note jg-up" style="--d:.96s"><span class="jg-adv">' + ICON.info + '<span></span></span>' +
          '<a class="jg-more" href="' + esc(PAGE) + '" data-jg="stranica">' + esc(T.more) + ICON.arrow + '</a></div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }

  /* ---------- ulaznica: izbor paketa, šta je uključeno, cijena, mail sa upisanim paketom ---------- */
  function pkName(p) { return T.name + ' ' + p.n; }
  function mailHref(p) {
    if (RES_URL) return RES_URL;
    var nm = pkName(p) + ' (' + p.price + ' ' + p.cur + ')';
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subj + pkName(p)) + '&body=' + encodeURIComponent(T.body.replace('{p}', nm));
  }
  function num(s) { var x = String(s).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'); return /^\d+(\.\d+)?$/.test(x) ? +x : NaN; }
  function priceTo(p, roll) {
    var b = q('.jg-price b'), from = num(b.textContent), to = num(p.price);
    q('.jg-price i').textContent = p.cur;
    if (w.cancelAnimationFrame) w.cancelAnimationFrame(priceTo.r);
    if (!roll || reduced || isNaN(from) || isNaN(to) || from === to || /[.,]/.test(p.price)) { b.textContent = p.price; return; }
    var t0 = now(), D = 420;
    (function step() {   // cijena se kratko "prebroji" do nove vrijednosti
      var t = Math.min(1, (now() - t0) / D), e = 1 - Math.pow(1 - t, 3);
      b.textContent = t < 1 ? String(Math.round(from + (to - from) * e)) : p.price;
      if (t < 1) priceTo.r = w.requestAnimationFrame(step);
    })();
  }
  function select(k, roll) {
    SEL = Math.max(0, Math.min(PK.length - 1, k));
    var p = PK[SEL];
    q('.jg-tog').style.setProperty('--i', SEL);
    qa('.jg-tb').forEach(function (b, i) { b.setAttribute('aria-checked', i === SEL ? 'true' : 'false'); b.tabIndex = i === SEL ? 0 : -1; });
    var du = q('.jg-inc li[data-f="dur"] span');
    du.textContent = p.dur ? T.ride + ' ' + p.dur : T.rideX;
    qa('.jg-inc li[data-f="ch"], .jg-inc li[data-f="mz"]').forEach(function (li) { li.classList.toggle('is-off', !p[li.getAttribute('data-f')]); });
    priceTo(p, roll);
    var a = q('a[data-jg="rezervacija"]');
    a.setAttribute('href', mailHref(p));
    if (RES_URL) a.setAttribute('target', '_blank'); else a.removeAttribute('target');
    a.innerHTML = ICON.mail + lbl(T.book + ' VIP ' + p.n, T.bookS);
    a.setAttribute('aria-label', T.book + ': ' + pkName(p) + ', ' + p.price + ' ' + p.cur);
  }
  function adv() { q('.jg-adv > span').textContent = ADV === null ? T.advX : T.adv(ADV); }
  function renderPass() {
    q('.jg-pass').innerHTML = passHTML();
    select(Math.min(SEL, PK.length - 1), false);
  }
  q('.jg-pass').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.jg-tb');
    if (!b || PK.length < 2) return;
    var k = +b.getAttribute('data-k');
    if (k !== SEL) { select(k, true); track('gondola_paket', { paket: 'VIP ' + PK[k].n }); }
  });
  q('.jg-pass').addEventListener('keydown', function (e) {   // strelice biraju paket (radio grupa)
    if (!e.target.classList || !e.target.classList.contains('jg-tb') || PK.length < 2) return;
    var dk = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dk) return;
    e.preventDefault();
    var k = (SEL + dk + PK.length) % PK.length;
    select(k, true); q('.jg-tb[data-k="' + k + '"]').focus();
    track('gondola_paket', { paket: 'VIP ' + PK[k].n });
  });
  select(0, false); adv();

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
    root.classList.toggle('jg--boxed', boxed);
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
    // bar je odmah iznad (bez razmaka) → on već daje razmak, ovdje ostaje samo rub
    var br = d.getElementById('jb-bar');
    root.classList.toggle('jg--join', !boxed && !!br && !br.classList.contains('jb--boxed') &&
      Math.abs(br.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
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
    var el = q('.jg-frame');
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

  /* ---------- LED se pali: upaljeni sloj fotografije se otkriva duž užeta (od dalekih kabina ka bliskim), jednom ---------- */
  function setLed(v) { root.style.setProperty('--led', v.toFixed(3)); }
  function ledOn() {
    var t0 = now(), D = 1900;
    (function step() {
      var t = Math.min(1, (now() - t0) / D), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setLed(e);
      if (t < 1) w.requestAnimationFrame(step); else root.style.removeProperty('--led');
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
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jg], .jg-bgs');
    if (!b) return;
    if (b.classList.contains('jg-bgs')) {   // klik na fotografiju: lijevo kabina iznutra, desno noćna gondola
      var fr = b.getBoundingClientRect();
      lbOpen(FIXED_GAL || e.clientX - fr.left < fr.width * .45 ? 0 : 2); return;
    }
    var k = b.getAttribute('data-jg');
    if (k === 'galerija') lbOpen(0);
    else if (k === 'rezervacija') track('gondola_rezervacija', { nacin: RES_URL ? 'stranica' : 'mail', paket: 'VIP ' + PK[SEL].n });
    else if (k === 'stranica') track('gondola_klik', { cilj: 'stranica' });
  });

  /* ---------- fotografije preko cijelog ekrana ---------- */
  var lb, lbImg, lbCap, lbCur = 0, lbBack = null, lbOverflow = '';
  function lbBuild() {
    lb = d.createElement('div'); lb.id = 'jg-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.gal);
    lb.innerHTML = '<figure><img alt="" decoding="async"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="jg-lb-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>' +
      '<button type="button" class="jg-lb-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jg-lb-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button>';
    d.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('figcaption');
    lb.querySelector('.jg-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.jg-lb-prev').addEventListener('click', function () { lbShow(lbCur - 1); });
    lb.querySelector('.jg-lb-next').addEventListener('click', function () { lbShow(lbCur + 1); });
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
    lbImg.alt = GAL[lbCur].alt || (T.photo + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T.kicker);
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
    lb.querySelector('.jg-lb-close').focus();
    d.addEventListener('keydown', lbKey);
    track('gondola_galerija', {});
  }
  function lbClose() {
    lb.classList.remove('is-open');
    d.documentElement.style.overflow = lbOverflow;
    d.removeEventListener('keydown', lbKey);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.classList.remove('is-shown'); }, 320);
    if (lbBack && lbBack.focus) lbBack.focus();
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica VIP gondole ---------- */
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
  // paketi iz teksta: "VIP gondola 1, čija cijena od 150 KM uključuje vožnju … do 1h i konzumaciju šampanjca"
  function pkgsOf(txt) {
    var re = /VIP[\s ]*(?:gondol[a-z]*|kabin[a-z]*|cabin|paket[a-z]*|package)?[\s ]*(\d)(?!\d)/gi, hits = [], m, out = [], seen = {};
    while ((m = re.exec(txt))) hits.push({ n: m[1], i: m.index, j: re.lastIndex });
    hits.forEach(function (h, k) {
      var s = txt.slice(h.j, k + 1 < hits.length ? hits[k + 1].i : h.j + 360);
      var cut = s.search(/Rezervacij|Reservation|To book|\bBook\b/i);
      if (cut > 0) s = s.slice(0, cut);
      var pm = s.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(KM|BAM|€|EUR)/i);
      if (!pm || seen[h.n]) return;
      seen[h.n] = 1;
      var dm = s.match(/(?:\bdo|up\s+to|until)\s*(\d+(?:[.,]\d+)?)\s*(h\b|sat|hour|hr|min)/i);
      out.push({ n: h.n, price: pm[1], cur: /€|eur/i.test(pm[2]) ? '€' : 'KM', dur: dm ? dm[1] + ' ' + (/min/i.test(dm[2]) ? 'min' : 'h') : '',
        ch: /šampanj|champagne|prosecco|pjenuš|sparkling/i.test(s), mz: /\bmez[aeiu]|\bhran[aeiu]|\bfood|platter|zakusk|snack/i.test(s) });
    });
    return out.sort(function (a, b) { return a.n - b.n; });
  }
  function parse(pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    // razmak poslije svakog bloka, da se pasusi ne slijepe u tekstu
    [].forEach.call(b.querySelectorAll('p,li,div,br,h1,h2,h3,h4,h5,h6,td'), function (e) { e.parentNode.insertBefore(b.ownerDocument.createTextNode(' '), e.nextSibling); });
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var txt = clean(b.textContent), m;
    // uvod: rečenica "Priuštite sebi …" (poziv), inače prva rečenica
    var all = [].concat.apply([], ps.map(sentences)), lead = '';
    for (var i = 0; i < all.length && !lead; i++) if (/^(Priušti|Treat yourself|Indulge)/i.test(all[i])) lead = all[i];
    if (!lead && all.length) lead = all[0];
    var ml = b.querySelector('a[href^="mailto:"]'), mail = '', res = '';
    if (ml) mail = decodeURIComponent(ml.getAttribute('href').slice(7).split('?')[0]).trim();
    else [].forEach.call(b.querySelectorAll('a[href]'), function (a) { if (!res && /^(ovdje|ovde|here)$/i.test(clean(a.textContent)) && /^(https?:|\/)/i.test(a.getAttribute('href'))) res = abs(a.getAttribute('href')); });
    var adv = null;
    if ((m = txt.match(/(?:najmanje|barem|bar|at\s+least)\s+(?:najmanje\s+)?(?:(\d+|jedan|dva|tri|četiri|pet|one|two|three)\s+)?(?:dan|dana|days?)\s+(?:ranije|unaprijed|prije|in\s+advance|before)/i)))
      adv = m[1] && !/^(jedan|one|1)$/i.test(m[1]) ? ({ dva: 2, tri: 3, 'četiri': 4, pet: 5, two: 2, three: 3 }[m[1].toLowerCase()] || m[1]) + '' : '';
    var seen = {}, imgs = [].slice.call(b.querySelectorAll('img')).map(fromImg).filter(function (x) {
      if (!x || seen[key(x.full)]) return false; seen[key(x.full)] = 1; return true;
    });
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    return {
      id: pg.id, link: link, lead: clip(lead, 300), pk: pkgsOf(txt), mail: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(mail) ? mail : '', res: res, adv: adv,
      imgs: imgs, seen: seen,
      title: clean(new DOMParser().parseFromString('<body>' + pickLang(pg.title && pg.title.rendered || ''), 'text/html').body.textContent)
    };
  }
  function page() {
    var F = '&_fields=id,link,title,content';
    return api('pages', 'slug=' + encodeURIComponent(SLUG) + F).then(function (j) {
      if (j && j[0]) return j[0];
      // slug nije tačan → stranica čiji naslov ima "VIP" i gondolu/kabinu
      return api('pages', 'search=VIP&per_page=20' + F).then(function (k) {
        var hit = (k || []).filter(function (x) { var t = pickLang(x.title && x.title.rendered || ''); return /VIP/i.test(t) && /gondol|kabin|cabin/i.test(t + ' ' + (x.content && x.content.rendered || '').slice(0, 2000)); })[0];
        if (!hit) throw new Error('Stranica "' + SLUG + '" nije pronađena');
        return hit;
      });
    });
  }
  function load() {
    return page().then(function (pg) {
      var r = parse(pg);
      if (r.imgs.length || FIXED_GAL) return r;
      // tekst stranice bez fotografija (npr. galerija kao poseban blok) → slike priložene uz stranicu
      return api('media', 'parent=' + r.id + '&media_type=image&per_page=24&_fields=id,source_url,media_details,alt_text')
        .then(function (ms) {
          (ms || []).map(fromMedia).forEach(function (x) { if (x && !r.seen[key(x.full)]) { r.seen[key(x.full)] = 1; r.imgs.push(x); } });
          return r;
        }, function () { return r; });
    });
  }
  function apply(r) {
    var miss = [];
    if (r.title && r.title.length <= 32 && r.title !== q('.jg-kicker').textContent) q('.jg-kicker').textContent = r.title;
    if (r.lead) { if (r.lead !== q('.jg-lead').textContent) q('.jg-lead').textContent = r.lead; }
    else miss.push('tekst');
    if (r.pk.length) {
      var same = JSON.stringify(r.pk) === JSON.stringify(PK);
      PK = r.pk;
      if (!same) renderPass();
    } else miss.push('paketi (VIP 1, VIP 2 sa cijenom u KM)');
    if (!MAIL_FIXED) { if (r.mail) MAIL = r.mail; else if (r.res) RES_URL = r.res; else miss.push('mail (mailto: link)'); }
    if (r.adv !== ADV) { ADV = r.adv; adv(); }
    select(SEL, false);
    if (r.link) q('a[data-jg="stranica"]').setAttribute('href', r.link);
    if (!FIXED_GAL && r.imgs.length) GAL = BASE.concat(r.imgs);
    if (miss.length) why('stranica nema: ' + miss.join(', '));
    ld();
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jg-why') || q('.jg-body').appendChild(d.createElement('small'));
    el.className = 'jg-why'; el.textContent = T.why + ': ' + msg + ' (' + T.whyTail + ')';
  }

  /* ---------- schema.org za Google (vožnja sa ponudama i cijenama) ---------- */
  function ld() {
    var sc = d.getElementById('jg-ld');
    if (!sc) { sc = d.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'jg-ld'; (d.head || d.documentElement).appendChild(sc); }
    sc.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'TouristTrip',
      name: T.h.join(' '), description: q('.jg-lead').textContent, image: abs(NIGHT),
      provider: { '@type': 'Organization', name: 'Olimpijski centar Jahorina', url: O + '/' },
      offers: PK.map(function (p) {
        return { '@type': 'Offer', name: pkName(p), price: String(num(p.price)), priceCurrency: p.cur === '€' ? 'EUR' : 'BAM', url: q('a[data-jg="stranica"]').href };
      })
    });
  }
  ld();
  if (w.fetch && w.DOMParser && w.Promise) load().then(apply).catch(function (e) {
    if (w.console) console.warn('[Jahorina VIP gondola]', e);
    why(e && e.message || 'REST');
  });

  // ulazak jednom, kad kadar dođe u vidno polje; poslije toga se upali LED rasvjeta kabina
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jg-anim'); setLed(0);
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jg-on'); io.disconnect();
        setTimeout(ledOn, 850);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(q('.jg-frame'));
  }
})(window, document);
