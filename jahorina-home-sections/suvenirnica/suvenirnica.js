/* =====================================================================
   JAHORINA — SUVENIRNICA (početna, ispod ratraka)
   Isti jezik kao ratrak (uzor ratrak/ratrak.js), samo u ogledalu: tekst lijevo, fotografija desno, pa se
   vijesti → ratrak → suvenirnica smjenjuju. Jedan veliki uokvireni kadar preko cijele širine; fotografija
   (polica suvenirnice) je pozadina kadra, desno, i utapa se u zamućenu sebe ispod teksta; lijevo nadnaslov,
   naslov u tri reda (zadnje riječi iscrtane, kao "Jahorine"), uvod, stakleni panel sa pločicama i dva dugmeta.
   Na fotografiji je staklena pilula sa sličicama: otvara galeriju preko cijelog ekrana.

   SADRŽAJ JE IZ WORDPRESSA: stranica "Suvenirnica" (slug suvenirnica) preko REST API-ja.
     nadnaslov = naslov stranice, naslov = prvi naslov (h1–h4) u tekstu stranice, uvod = prva rečenica prvog pasusa,
     dugme "Više o suvenirnici" = link stranice, galerija = 3 fotografije ovog bloka + sve fotografije sa stranice
     (iz teksta stranice, a ako ih tamo nema, slike priložene uz stranicu). qTranslate oznake [:SH]…[:en]…[:] se razdvajaju.
     Dok WordPress ne odgovori (ili ako ne odgovori), stoji ugrađeni tekst — isti kao na stranici 8. 10. 2026,
     pa se ništa ne mijenja pred očima. Prijavljeni admin vidi tehnički razlog ako čitanje ne uspije.
   Pločice (Poljice / Domaće / Pokloni) su sažetak druge rečenice sa stranice i stoje u kodu.

   Ugradnja: Elementor HTML widget sa <div id="jsu-suvenirnica"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jsu-suvenirnica"> (sva su neobavezna):
     data-stranica="suvenirnica"   (slug WordPress stranice)
     data-mapa="https://…"          (dugme "Kako do nas"; podrazumijevano Google Maps: Gondola Poljice, Jahorina)
     data-slika="…"  data-galerija="url1, url2, …"   (zamjena za fotografije iz slike/ pored ovog fajla)
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
  var OWN = !root.getAttribute('data-slika');
  var IMG = opt('slika', HERE + 'slike/suvenirnica-glavna.webp');
  var IMG_SM = OWN ? HERE + 'slike/suvenirnica-glavna-960.webp' : IMG;
  var SRCSET = OWN ? IMG_SM + ' 960w, ' + IMG + ' 1600w' : '';
  var SLUG = opt('stranica', 'suvenirnica').replace(/^\/+|\/+$/g, '');
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var MAPA = /^https?:\/\//i.test(opt('mapa', '')) ? opt('mapa', '')
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Gondola Poljice, Jahorina');
  // galerija: 3 fotografije ovog bloka (+ fotografije sa WordPress stranice, kad stignu); mini = sličica za pilulu
  var BASE = root.getAttribute('data-galerija')
    ? opt('galerija', '').split(',').map(function (x) { x = x.trim(); return x && { full: x, mini: x }; }).filter(Boolean)
    : [['suvenirnica-glavna', 1], ['suvenirnica-1'], ['suvenirnica-2']].map(function (f) {
        return { full: f[1] ? IMG : HERE + 'slike/' + f[0] + '.webp', mini: OWN || !f[1] ? HERE + 'slike/' + f[0] + '-mini.webp' : IMG };
      });
  var FIXED = !!root.getAttribute('data-galerija');
  var GAL = BASE.slice();

  // ugrađeni tekst = tekst sa stranice Suvenirnica (8. 10. 2026); EN je prevod. WordPress ga zamijeni kad odgovori.
  var T = EN ? {
    kicker: 'Souvenir shop', head: 'Take a piece of Jahorina with you!',
    lead: 'Visit our souvenir shops at the lower and upper stations of the Poljice gondola and find gifts that warm the heart.',
    alt: 'Neck gaiter with the Olympic Centre Jahorina logo on a souvenir shop shelf',
    tiles: [['pin', 'Poljice', 'Both gondola stations'], ['heart', 'Local', 'Local artisans'], ['gift', 'Gifts', 'Cosmetics, textiles']],
    page: 'More about the shop', pageS: 'Learn more', map: 'How to find us', mapS: 'Directions',
    gal: 'Gallery', galLabel: 'Souvenir shop gallery', galOpen: 'Open gallery', photo: 'Photo', close: 'Close', prev: 'Previous photo', next: 'Next photo',
    why: 'WordPress', whyTail: 'showing built-in text'
  } : {
    kicker: 'Suvenirnica', head: 'Ponesite dio Jahorine sa sobom!',
    lead: 'Svratite u naše suvenirnice na polaznoj i izlaznoj stanici gondole Poljice i pronađite poklone koji griju srce.',
    alt: 'Marama za vrat sa logom Olimpijskog centra Jahorina na polici suvenirnice',
    tiles: [['pin', 'Poljice', 'Obje stanice gondole'], ['heart', 'Domaće', 'Lokalni majstori'], ['gift', 'Pokloni', 'Kozmetika i tekstil']],
    page: 'Više o suvenirnici', pageS: 'Saznaj više', map: 'Kako do nas', mapS: 'Kako do nas',
    gal: 'Galerija', galLabel: 'Galerija: suvenirnica', galOpen: 'Otvori galeriju', photo: 'Fotografija', close: 'Zatvori', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni tekst'
  };

  /* ---------- izgled (sve je pod #jsu-suvenirnica; tokeni i obrasci iz hero-a, vijesti i ratraka) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;',
    '--nm-surface:rgba(20,30,49,.72);--nm-surface-2:#172238;--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    '--nm-raised-sm:3px 3px 7px var(--nm-dark),-2px -2px 6px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    '--nm-inset:inset 3px 3px 8px rgba(0,0,0,.42),inset -3px -3px 7px rgba(78,104,150,.14);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsu--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;border:0}',
    '#R p,#R figure{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava tekst sa mrežom 1240px; --gap = ritam između blokova.
       Kad je ratrak odmah iznad (.jsu--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub (kao ratrak ispod vijesti) */
    '#R .jsu-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsu--join .jsu-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsu-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',

    /* okvir kao u hero-u i ratraku; tekst lijevo, fotografija desno */
    '#R .jsu-frame{--ix:34%;position:relative;transform-origin:50% 0;display:grid;grid-template-columns:minmax(0,52fr) minmax(0,48fr);min-height:clamp(600px,46vw,880px);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsu-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* tanak hladni odsjaj na gornjoj ivici, iznad svjetla sa prozora na fotografiji (desno) */
    '#R .jsu-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 50%,rgba(214,232,255,.42) 78%,transparent 98%)}',
    /* ista fotografija, jako zamućena i zatamnjena, preko cijelog kadra: na nju se fotografija utapa ispod teksta */
    '#R .jsu-amb{position:absolute;inset:-12%;width:124%;height:124%;object-fit:cover;object-position:62% 50%;z-index:-3;filter:blur(46px) saturate(.55) brightness(.42)}',
    '#R .jsu-shade{position:absolute;inset:0;z-index:-2;pointer-events:none;',
    'background:linear-gradient(rgba(10,24,56,.46),rgba(10,24,56,.46)),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(4,8,18,.5) 100%)}',
    /* fotografija desno; lijeva ivica se meko utapa u zamućeni kadar (bez šava ispod teksta) */
    '#R .jsu-shot{position:absolute;top:0;bottom:0;right:0;left:var(--ix);z-index:-1;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 34%);mask-image:linear-gradient(90deg,transparent 0,#000 34%)}',
    '#R .jsu-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:58% 46%;cursor:zoom-in;filter:saturate(.88) brightness(.76) contrast(1.12)}',
    '#R .jsu-shot::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.5}',
    /* blago toplo svjetlo izloga na proizvodu (jedini topli ton; ostalo je noćna obrada) */
    '#R .jsu-shot::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;',
    'background:radial-gradient(30% 48% at 58% 42%,rgba(255,196,140,.14),rgba(255,170,110,.05) 50%,transparent 76%),linear-gradient(0deg,rgba(6,11,22,.6) 0%,rgba(6,11,22,0) 34%),linear-gradient(180deg,rgba(6,18,42,.22) 0%,rgba(6,18,42,0) 16%),',
    'radial-gradient(120% 90% at 60% 50%,transparent 56%,rgba(4,8,18,.42) 100%)}',
    /* tamni prelaz slijeva, ispod teksta (kao naslov u hero-u) */
    '#R .jsu-scrim{position:absolute;inset:0;z-index:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.8) 0%,rgba(6,11,22,.66) 30%,rgba(6,11,22,.3) 46%,rgba(6,11,22,.06) 56%,rgba(6,11,22,0) 62%)}',

    /* galerija: staklena pilula sa sličicama na fotografiji (kao dugmad u hero-u) */
    '#R .jsu-gal{all:unset;position:absolute!important;right:20px;top:20px;z-index:3;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:10px;padding:6px 15px 6px 7px!important;margin:0!important;border:0!important;border-radius:40px!important;cursor:pointer;',
    'font:600 13px/1 var(--fd)!important;letter-spacing:.3px!important;text-transform:none!important;color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised)!important;transition:color .2s,box-shadow .25s}',
    '#R .jsu-thumbs{display:flex;padding-left:9px}',
    '#R .jsu-thumbs img{width:30px;height:30px;margin-left:-9px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #142034;filter:saturate(.85) brightness(.92)}',
    '#R .jsu-gal i{font-style:normal;color:var(--text-3);font-variant-numeric:tabular-nums}',
    '#R .jsu-gal:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),0 0 22px rgba(0,185,242,.4)!important}',
    '#R .jsu-gal:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',

    /* tekst preko kadra, lijevo */
    '#R .jsu-body{grid-column:1;position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0;padding:clamp(44px,4.4vw,64px) clamp(8px,1.2vw,18px) clamp(44px,4.4vw,64px) max(clamp(28px,4.4vw,68px),var(--in))}',
    '#R .jsu-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:22px}',
    '#R .jsu-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    /* naslov u tri reda, zadnje riječi samo obris (kao "Jahorine") */
    '#R h2{font-size:clamp(44px,4.7vw,70px);font-weight:800;line-height:.94;letter-spacing:-.02em}',
    '#R h2.jsu-long{font-size:clamp(36px,3.7vw,54px)}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.4))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsu-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.92)!important;',
    'filter:drop-shadow(0 0 8px rgba(0,185,242,.35)) drop-shadow(0 6px 30px rgba(0,0,0,.4))}}',
    '#R .jsu-lead{margin-top:26px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:44ch;text-wrap:pretty}',

    /* stakleni panel sa pločicama (isti kao u ratraku) */
    '#R .jsu-dock{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:30px!important;padding:7px!important;border-radius:22px;width:min(100%,440px);',
    'background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-inset)}',
    '#R .jsu-tile{display:grid;grid-template-rows:18px auto 2.5em;justify-items:center;align-content:start;row-gap:9px;padding:15px 8px 9px!important;border-radius:15px;text-align:center;',
    'background:var(--nm-surface-2);box-shadow:var(--nm-raised-sm)}',
    '#R .jsu-tile svg{width:18px;height:18px;color:rgba(255,255,255,.72)}',
    '#R .jsu-tile b{font:700 17px/1 var(--fd);letter-spacing:-.005em;color:#fff;white-space:nowrap}',
    '#R .jsu-tile small{font:600 9px/1.25 var(--fd);letter-spacing:.6px;text-transform:uppercase;color:rgba(255,255,255,.56)}',
    /* istaknuta je lokacija: samo cyan vrijednost i tanak cyan rub */
    '#R .jsu-tile--accent{box-shadow:var(--nm-raised-sm),inset 0 0 0 1px rgba(0,185,242,.3)}',
    '#R .jsu-tile--accent svg,#R .jsu-tile--accent b{color:#2CCBF8}',

    /* dva dugmeta iste širine i visine, red tačno širok kao panel iznad; ikona ispred teksta; bijelo glavno + stakleno sporedno */
    '#R .jsu-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:28px;width:min(100%,440px)}',
    '#R .jsu-btn{position:relative;isolation:isolate;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 20px!important;border-radius:40px;white-space:nowrap;font:600 13.5px/1 var(--fb);letter-spacing:.2px}',
    '#R .jsu-btn svg{width:15px;height:15px}',
    '#R .jsu-s{display:none}',
    '#R .jsu-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6);transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}',
    '#R .jsu-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jsu-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)}',
    '#R .jsu-btn--solid:hover::after{animation:jsuShine 1.6s ease-in-out}',
    '@keyframes jsuShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jsu-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff}',
    '#R .jsu-btn--ghost{color:#fff!important;background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08);transition:color .2s,box-shadow .25s}',
    '#R .jsu-btn--ghost svg{color:var(--accent)}',
    '#R .jsu-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)}',
    '#R .jsu-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)}',
    /* tehnički razlog kad WordPress ne odgovori — vidi ga samo prijavljeni admin */
    '#R .jsu-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jsu-anim/jsu-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsu-anim .jsu-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsu-anim.jsu-on .jsu-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    /* fotografija: ulazi zdesna, mrak se razilazi i izoštri se */
    '#R.jsu-anim .jsu-shot{opacity:0;transform:translateX(56px);filter:brightness(.3) blur(8px)}',
    '#R.jsu-anim.jsu-on .jsu-shot{opacity:1;transform:none;filter:none;transition:opacity 1s ease .1s,transform 1.3s cubic-bezier(.2,.7,.2,1) .1s,filter 1.4s cubic-bezier(.2,.7,.2,1) .1s}',
    '#R.jsu-anim .jsu-amb{opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-amb{opacity:1;transition:opacity 1.6s ease .2s}',
    /* tekst: ulazi slijeva, red po red (kašnjenje u --d) */
    '#R.jsu-anim .jsu-sl{opacity:0;transform:translateX(-44px)}',
    '#R.jsu-anim.jsu-on .jsu-sl{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsu-anim .jsu-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsu-anim.jsu-on .jsu-kicker::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .55s}',
    '#R.jsu-anim .jsu-tile{opacity:0}',
    '#R.jsu-anim.jsu-on .jsu-tile{animation:jsuTileOn .6s cubic-bezier(.2,.7,.2,1) var(--d,0s) both}',
    '@keyframes jsuTileOn{0%{opacity:0;transform:translateY(10px) scale(.9);filter:brightness(2.2)}60%{opacity:1;filter:brightness(1.4)}100%{opacity:1;transform:none;filter:brightness(1)}}',

    '@media (min-width:1500px){#R .jsu-frame{--ix:38%}}',
    /* manji laptop: šira kolona teksta, fotografija uža */
    '@media (max-width:1060px){#R .jsu-frame{--ix:40%;grid-template-columns:minmax(0,58fr) minmax(0,42fr)}#R h2{font-size:clamp(40px,5.2vw,56px)}}',
    /* tablet i telefon: fotografija preko cijele širine gore (utapa se nadolje), tekst ispod na zamućenom kadru */
    '@media (max-width:980px){',
    '#R .jsu-frame{grid-template-columns:1fr;min-height:0}',
    '#R .jsu-frame::before{background:linear-gradient(90deg,transparent 30%,rgba(214,232,255,.42) 70%,transparent 96%)}',
    '#R .jsu-shot{position:relative;inset:auto;height:min(60vw,540px);-webkit-mask-image:linear-gradient(180deg,#000 58%,transparent 100%);mask-image:linear-gradient(180deg,#000 58%,transparent 100%)}',
    '#R .jsu-shot img{object-position:56% 50%}',
    '#R .jsu-shot::after{background:radial-gradient(40% 46% at 54% 38%,rgba(255,196,140,.14),rgba(255,170,110,.05) 50%,transparent 76%),linear-gradient(0deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 40%),linear-gradient(180deg,rgba(6,18,42,.3) 0%,rgba(6,18,42,0) 18%)}',
    '#R .jsu-scrim{display:none}',
    '#R .jsu-shade{background:linear-gradient(180deg,rgba(6,11,22,0) 30%,rgba(6,11,22,.5) 50%,rgba(6,11,22,.66) 100%),linear-gradient(rgba(10,24,56,.46),rgba(10,24,56,.46)),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(4,8,18,.5) 100%)}',
    '#R .jsu-body{grid-column:1;margin-top:-110px;padding:0 clamp(22px,6vw,56px) clamp(30px,5vw,52px)}',
    '#R h2{font-size:clamp(40px,7.4vw,64px)}',
    '#R h2.jsu-long{font-size:clamp(34px,6vw,52px)}',
    '#R .jsu-lead{max-width:56ch}}',
    '@media (max-width:760px){',
    '#R .jsu-frame{border-radius:24px}',
    '#R .jsu-shot{height:min(96vw,460px)}',
    '#R .jsu-shot img{object-position:58% 50%}',
    '#R .jsu-gal{right:14px;top:14px}',
    '#R .jsu-body{margin-top:-96px;padding:0 22px 30px}',
    '#R .jsu-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jsu-kicker::before{width:22px}',
    '#R h2{font-size:clamp(40px,12vw,54px)}',
    '#R h2.jsu-long{font-size:clamp(32px,9vw,44px)}',
    '#R .jsu-lead{margin-top:18px}',
    '#R .jsu-dock{width:100%;margin-top:24px!important}',
    '#R .jsu-tile{padding:14px 4px 8px!important}',
    '#R .jsu-tile small{letter-spacing:.3px}',
    '#R .jsu-acts{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:24px;width:100%}',
    '#R .jsu-btn{flex:1 1 auto;height:42px;padding:0 12px!important;font-size:13px}',
    '#R .jsu-l{display:none}',
    '#R .jsu-s{display:inline}}',
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
  function svg(p) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 10 A6.5 6.5 0 0 1 18.5 10 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="10" r="2.3" ' + S + '/>'),
    heart: svg('<path d="M12 19.5 C12 19.5 4 14.6 4 9.2 A4.2 4.2 0 0 1 12 7.4 A4.2 4.2 0 0 1 20 9.2 C20 14.6 12 19.5 12 19.5 Z" ' + S + '/>'),
    gift: svg('<rect x="4" y="9" width="16" height="11" rx="1.8" ' + S + '/><path d="M3.5 9 H20.5 M12 9 V20 M12 9 C10.5 5.2 6.8 5.4 7.2 7.4 C7.5 8.7 10 9 12 9 Z M12 9 C13.5 5.2 17.2 5.4 16.8 7.4 C16.5 8.7 14 9 12 9 Z" ' + S + '/>'),
    bag: svg('<path d="M5.5 8.5 H18.5 L17.6 19.4 A1.8 1.8 0 0 1 15.8 21 H8.2 A1.8 1.8 0 0 1 6.4 19.4 Z" ' + S + '/><path d="M9 10.5 V7 A3 3 0 0 1 15 7 V10.5" ' + S + '/>'),
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
    return lines.map(function (l, i) { return '<span class="jsu-sl" style="--d:' + (.4 + i * .1).toFixed(2) + 's">' + esc(l) + '</span>'; }).join('') +
      '<span class="jsu-o jsu-sl" style="--d:' + (.4 + lines.length * .1).toFixed(2) + 's">' + esc(o) + '</span>';
  }
  // uvod: prva rečenica pasusa (i druga, ako je prva vrlo kratka)
  function leadOf(p) {
    var ss = clean(p).match(/[^.!?]+(?:[.!?]+|$)/g) || [p], out = clean(ss[0]);
    if (out.length < 70 && ss[1]) out += ' ' + clean(ss[1]);
    return clip(out, 260);
  }
  function thumbs() {
    return GAL.slice(0, 3).map(function (g) { return '<img src="' + esc(g.mini || g.full) + '" alt="" decoding="async" loading="lazy">'; }).join('');
  }

  /* ---------- crtanje ---------- */
  root.innerHTML =
    '<section class="jsu-wrap" aria-labelledby="jsu-h"><div class="jsu-frame">' +
      '<img class="jsu-amb" src="' + esc(IMG_SM) + '" alt="" aria-hidden="true" decoding="async" loading="lazy"><span class="jsu-shade"></span>' +
      '<figure class="jsu-shot"><img src="' + esc(IMG) + '"' + (SRCSET ? ' srcset="' + esc(SRCSET) + '" sizes="(max-width:980px) 100vw, 66vw"' : '') +
        ' alt="' + esc(T.alt) + '" width="1600" height="1067" decoding="async" loading="lazy"></figure>' +
      '<span class="jsu-scrim"></span>' +
      '<button type="button" class="jsu-gal" aria-haspopup="dialog"><span class="jsu-thumbs">' + thumbs() + '</span>' + esc(T.gal) + ' <i></i></button>' +
      '<div class="jsu-body">' +
        '<div class="jsu-kicker jsu-sl" style="--d:.3s">' + esc(T.kicker) + '</div>' +
        '<h2 id="jsu-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jsu-lead jsu-sl" style="--d:.72s">' + esc(T.lead) + '</p>' +
        '<ul class="jsu-dock jsu-sl" style="--d:.84s">' + T.tiles.map(function (t, k) {
          return '<li class="jsu-tile' + (k ? '' : ' jsu-tile--accent') + '" style="--d:' + (1.08 + k * .09).toFixed(2) + 's">' + ICON[t[0]] + '<b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></li>';
        }).join('') + '</ul>' +
        '<div class="jsu-acts jsu-sl" style="--d:1.02s">' +
          '<a class="jsu-btn jsu-btn--solid" href="' + esc(PAGE) + '" data-jsu="stranica">' + ICON.bag + lbl(T.page, T.pageS) + '</a>' +
          '<a class="jsu-btn jsu-btn--ghost" href="' + esc(MAPA) + '" target="_blank" rel="noopener" data-jsu="mapa">' + ICON.pin + lbl(T.map, T.mapS) + '</a>' +
        '</div>' +
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

  /* ---------- dolazak kadra: dok ulazi u ekran, iz malo manjeg „sjedne“ na svoje mjesto (kao ratrak) ---------- */
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
  q('.jsu-shot').addEventListener('click', function () { lbOpen(0); });
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
  // <img> iz teksta stranice → { full, mini } (najveća do 2048 px iz srcset-a; i odložene slike: data-src, data-lazy-src)
  function fromImg(im) {
    var at = function (n) { return im.getAttribute(n) || ''; };
    var src = at('data-src') || at('data-lazy-src') || at('src');
    var set = at('data-srcset') || at('data-lazy-srcset') || at('srcset');
    var wd = parseInt(at('width'), 10);
    if (wd && wd < 200) return null;   // ikone, logotipi
    var c = set.split(',').map(function (s) { var m = s.trim().match(/^(\S+)\s+(\d+)w$/); return m && { u: m[1], w: +m[2] }; })
      .filter(Boolean).sort(function (a, b) { return a.w - b.w; });
    var big = c.filter(function (x) { return x.w <= 2048; }).pop() || c[c.length - 1];
    var sm = c.filter(function (x) { return x.w >= 150; })[0];
    var full = big ? big.u : src;
    if (!full || /^data:|\.svg(\?|$)/i.test(full)) return null;
    return { full: abs(full), mini: abs(sm ? sm.u : full), alt: clean(at('alt')) };
  }
  // slika priložena uz stranicu (media?parent=) → { full, mini }
  function fromMedia(m) {
    if (!m || !m.source_url) return null;
    var sz = (m.media_details && m.media_details.sizes) || {};
    var big = sz['2048x2048'] || sz['1536x1536'] || sz.large || sz.full, sm = sz.thumbnail || sz.medium;
    return { full: big && big.source_url || m.source_url, mini: sm && sm.source_url || m.source_url, alt: clean(m.alt_text) };
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
    if (!FIXED && r.imgs.length) {
      GAL = BASE.concat(r.imgs);
      q('.jsu-thumbs').innerHTML = thumbs();
      galCount();
    } else if (!r.imgs.length) miss.push('fotografije');
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
