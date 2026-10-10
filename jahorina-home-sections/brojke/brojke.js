/* =====================================================================
   JAHORINA — PLANINA U BROJKAMA (početna, ispod Sankališta) · v1 "brojčanici"
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, fotografija
   u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · cik-cak sa Sankalištem iznad (tamo je tekst desno): ovdje su tekst i brojke lijevo, fotografija desno;
     · fotografija: noćno skijanje pod reflektorom (snježne jele, snowboarder na stazi); reflektor je jedini izvor
       svjetla: pri ulasku se upali hladno bijelo svjetlo oko njega (bez toplog tona);
     · BROJKE (glavni detalj): četiri podatka u mreži 2 × 2; svaka cifra je kolut kao na mehaničkom brojaču
       (odometar) i pri ulasku se jednom zavrti do svoje vrijednosti; iznad svake brojke je mali crtež tankim linijama
       umjesto ikone: staza koja vijuga (km staza), uže sa 18 tačaka (žičare), 10 reflektora koji se pale jedan za
       drugim (noćno skijanje), kosina sa kotom i sankama koje jednom kliznu (sankalište);
     · tih link ispod (samo ako je zadan data-link).
   Brojke se ne ponavljaju u tekstu (uvod govori o FIS stazama i noćnom skijanju, bez brojeva).

   SADRŽAJ IZ WORDPRESSA: brojke se čitaju iz teksta WordPress stranice (data-stranica = slug; podrazumijevano
   "pocetna-zima", gdje danas stoje rečenice "54 kilometra … 18 instalacija … 10 homologovanih staza … 600 m
   sankalište"). Kad se broj u tekstu stranice promijeni, promijeni se i ovdje. Broj koji se u tekstu ne nađe ostaje
   ugrađeni (stanje 10. 10. 2026); prijavljeni admin vidi šta nedostaje.

   Ugradnja: Elementor HTML widget sa <div id="jpb-brojke"></div> + ovaj fajl sa jsDelivr-a (slike/ iz istog commita).
   Podešavanja na <div id="jpb-brojke"> (sva su neobavezna):
     data-stranica="pocetna-zima"   (slug WordPress stranice sa brojkama)
     data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"   (ručno, ima prednost nad WordPressom)
     data-link="/ski-staze/" data-link-tekst="Mapa staza"   (tih link ispod brojki; bez njega linka nema)
   GA: klik na link → brojke_klik (cilj: link).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jpb-brojke');
  if (!root || root.__jpb) return;
  root.__jpb = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'pocetna-zima').replace(/^\/+|\/+$/g, '');
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // naslov, uvod i natpisi su dizajn (brojke su sa stranice); EN je prevod
  var T = EN ? {
    aria: 'The mountain in numbers', eyebrow: 'The mountain in numbers', h: ['An Olympic', 'mountain'],
    lead: 'Slopes groomed to FIS standards, from the first morning run to night skiing under the floodlights.',
    km: { u: 'km', l: 'of alpine ski slopes', s: 'Groomed to FIS standards' },
    zicare: { u: '', l: 'lifts and ski tows', s: 'Vertical transport' },
    nocne: { u: '', l: 'night skiing slopes', s: 'Homologated' },
    sankanje: { u: 'm', l: 'sledding track', s: 'For the whole family' },
    photo: 'Night skiing on Jahorina: a snowboarder on a floodlit slope between snow-covered spruces',
    why: 'WordPress', whyTail: 'showing built-in numbers'
  } : {
    aria: 'Planina u brojkama', eyebrow: 'Planina u brojkama', h: ['Olimpijska', 'planina'],
    lead: 'Staze uređene po FIS standardima, od prvog jutarnjeg spusta do noćnog skijanja pod reflektorima.',
    km: { u: 'km', l: 'alpskih skijaških staza', s: 'Uređene po FIS standardima' },
    zicare: { u: '', l: 'žičara i ski liftova', s: 'Vertikalni transport' },
    nocne: { u: '', l: 'staza za noćno skijanje', s: 'Homologovane' },
    sankanje: { u: 'm', l: 'staza sankališta', s: 'Za cijelu porodicu' },
    photo: 'Noćno skijanje na Jahorini: snowboarder na osvijetljenoj stazi između snijegom okovanih jela',
    why: 'WordPress', whyTail: 'prikazane su ugrađene brojke'
  };
  var KEYS = ['km', 'zicare', 'nocne', 'sankanje'];
  // ugrađene brojke (stanje na sajtu 10. 10. 2026); data-* ima prednost, pa WordPress, pa ove
  var NUM = { km: '54', zicare: '18', nocne: '10', sankanje: '600' };
  var FIX = {};
  KEYS.forEach(function (k) { var v = opt(k, '').replace(/[^\d]/g, ''); if (v) { FIX[k] = v; NUM[k] = v; } });
  var LINK = opt('link', ''), LINKT = opt('link-tekst', EN ? 'Slopes and lifts' : 'Staze i žičare');

  var IMG = { main: HERE + 'slike/brojke-glavna.webp', mainS: HERE + 'slike/brojke-glavna-1000.webp' };
  // položaj reflektora na fotografiji (udio širine i visine), za svjetlo oko njega
  var LAMP = [.853, .268];

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jpb--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0;overflow:visible}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je blok iznad odmah tu (.jpb--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jpb-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jpb--join .jpb-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jpb-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jpb-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; --L = širina dijela sa tekstom (lijevo), fotografija je desno od njega i utapa se u tamu */
    '#R .jpb-frame{--L:min(calc(var(--side) + 600px),54%);position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(660px,47vw,820px);border-radius:26px;overflow:hidden;isolation:isolate;background:var(--bg);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jpb-frame::after{content:"";position:absolute;inset:0;z-index:8;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jpb-bg{position:absolute;inset:0;overflow:hidden}',
    '#R .jpb-ph{position:absolute;top:0;bottom:0;right:0;left:calc(var(--L) - 260px);-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 320px);mask-image:linear-gradient(90deg,transparent 0,#000 320px)}',
    '#R .jpb-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos,50% 50%);filter:saturate(.8) brightness(var(--lum,.86)) contrast(1.06)}',
    /* svjetlo reflektora (hladno bijelo, jedini izvor svjetla); --lx/--ly računa skripta iz položaja fotografije */
    '#R .jpb-lamp{position:absolute;left:var(--lx,85%);top:var(--ly,27%);width:clamp(260px,26vw,420px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;mix-blend-mode:screen;',
    'background:radial-gradient(circle,rgba(236,246,255,.5) 0,rgba(200,226,255,.2) 16%,rgba(150,196,255,.07) 38%,transparent 66%)}',
    '#R .jpb-beam{position:absolute;left:var(--lx,85%);top:var(--ly,27%);width:clamp(300px,30vw,520px);height:clamp(380px,40vw,640px);transform:translateX(-58%);pointer-events:none;mix-blend-mode:screen;',
    'background:radial-gradient(46% 90% at 58% 0,rgba(214,234,255,.13),rgba(214,234,255,.04) 55%,transparent 78%);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 14%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 14%,transparent 100%)}',
    /* noćna obrada kao u ostalim blokovima; tamni prelaz slijeva ispod teksta, odozdo, odozgo i vinjeta */
    '#R .jpb-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.36}',
    '#R .jpb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,.94) 0,rgba(6,11,22,.86) calc(var(--L) - 140px),rgba(6,11,22,.34) calc(var(--L) + 40px),rgba(6,11,22,0) calc(var(--L) + 240px)),',
    'linear-gradient(0deg,rgba(6,11,22,.45) 0%,rgba(6,11,22,0) 26%),linear-gradient(180deg,rgba(6,11,22,.4) 0%,rgba(6,11,22,0) 26%),radial-gradient(130% 100% at 68% 50%,transparent 58%,rgba(4,8,18,.5) 100%)}',

    /* tekst i brojke lijevo (cik-cak sa Sankalištem iznad), lijeva ivica poravnata sa mrežom 1240px */
    '#R .jpb-body{position:relative;z-index:2;width:calc(560px + var(--side));max-width:56%;padding:clamp(56px,6vw,90px) 0 clamp(56px,6vw,90px) var(--side)}',
    '#R .jpb-eye{display:flex;align-items:center;gap:14px;margin-bottom:22px;font:600 11px/1 var(--fd);letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.86)}',
    '#R .jpb-eye::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(44px,4.6vw,74px);font-weight:800;line-height:.95;letter-spacing:-.025em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jpb-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jpb-lead{margin-top:20px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:44ch;text-wrap:pretty}',

    /* BROJKE: mreža 2 × 2; svaka ima mali crtež tankim linijama, brojku (koluti cifara) i natpis */
    '#R .jpb-nums{display:grid;grid-template-columns:1fr 1fr;gap:30px 40px;margin-top:38px!important;width:min(100%,560px)}',
    '#R .jpb-num{position:relative;padding-top:18px!important;border-top:1px solid rgba(255,255,255,.12)}',
    '#R .jpb-num::before{content:"";position:absolute;left:0;top:-1px;width:22px;height:1px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7)}',
    '#R .jpb-g{width:132px;height:36px;margin-bottom:14px;color:rgba(255,255,255,.34)}',
    '#R .jpb-g svg{width:100%;height:100%}',
    '#R .jpb-v{display:flex;align-items:baseline;gap:6px;font:800 clamp(52px,4.9vw,78px)/1 var(--fd);letter-spacing:-.03em;color:#fff;font-variant-numeric:tabular-nums}',
    '#R .jpb-v em{font-style:normal;font:700 .34em/1 var(--fd);letter-spacing:.02em;color:var(--accent-2)}',
    /* kolut cifre (odometar): 0–9 dva puta; --v = krajnji položaj (10 + cifra), u stanju mirovanja stoji na njemu */
    '#R .jpb-ds{display:inline-flex}',
    '#R .jpb-d{position:relative;display:inline-block;height:1em;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent)}',
    '#R .jpb-reel{display:flex;flex-direction:column;transform:translateY(calc(var(--v) * -5%))}',
    '#R .jpb-reel i{display:block;height:1em;margin:0;padding:0;line-height:1;font-style:normal!important;text-align:center;color:inherit!important}',
    '#R .jpb-l{display:block;margin-top:10px;font:500 15px/1.35 var(--fb);color:var(--text-2)}',
    '#R .jpb-s{display:block;margin-top:3px;font:600 10px/1.3 var(--fd);letter-spacing:1.8px;text-transform:uppercase;color:var(--text-3)}',
    '#R .jpb-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',
    /* crteži: tanke bijele linije, cyan samo ono što nosi broj */
    '#R .jpb-ln{stroke:currentColor;stroke-width:1.1;stroke-linecap:round;fill:none!important}',
    '#R .jpb-ac{stroke:var(--accent-2);stroke-width:1.5;stroke-linecap:round;fill:none!important;filter:drop-shadow(0 0 3px rgba(0,185,242,.8))}',
    '#R .jpb-dot{fill:var(--accent-2)!important;filter:drop-shadow(0 0 2.5px rgba(0,185,242,.9))}',
    '#R .jpb-wh{fill:#fff!important}',
    '#R .jpb-glow{fill:#fff!important;filter:drop-shadow(0 0 3px rgba(214,236,255,.95)) drop-shadow(0 0 7px rgba(0,185,242,.55))}',
    '#R .jpb-cap{font:600 6.4px/1 var(--fd);letter-spacing:.8px;fill:rgba(255,255,255,.55)!important}',
    '#R .jpb-sled{offset-rotate:auto;offset-distance:100%}',

    /* tih link ispod brojki (samo ako je zadan) */
    '#R .jpb-foot{margin-top:30px}',
    '#R .jpb-link{all:unset;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:8px;padding:4px 0!important;cursor:pointer;font:500 13.5px/1.3 var(--fb)!important;color:rgba(255,255,255,.76)!important;transition:color .2s}',
    '#R .jpb-link svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jpb-link:hover{color:var(--accent)!important}',
    '#R .jpb-why{display:block;margin-top:16px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jpb-anim/jpb-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jpb-anim .jpb-frame{opacity:0;transform:translateY(28px)}',
    '#R.jpb-anim.jpb-on .jpb-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jpb-anim .jpb-ph img{opacity:0;filter:saturate(.8) brightness(.2) contrast(1.06) blur(6px)}',
    '#R.jpb-anim.jpb-on .jpb-ph img{opacity:1;filter:saturate(.8) brightness(var(--lum,.86)) contrast(1.06) blur(0);transition:opacity 1.2s ease .2s,filter 1.6s ease .2s}',
    /* reflektor se upali poslije fotografije: kratko, kao da se lampa zagrije */
    '#R.jpb-anim .jpb-lamp,#R.jpb-anim .jpb-beam{opacity:0}',
    '#R.jpb-anim.jpb-on .jpb-lamp{opacity:1;transition:opacity 1.4s cubic-bezier(.3,0,.2,1) 1.2s}',
    '#R.jpb-anim.jpb-on .jpb-beam{opacity:1;transition:opacity 1.8s ease 1.5s}',
    '#R.jpb-anim .jpb-up{opacity:0;transform:translateY(20px)}',
    '#R.jpb-anim.jpb-on .jpb-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jpb-anim .jpb-eye::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jpb-anim.jpb-on .jpb-eye::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* koluti: stoje na nuli, pa se zavrte do vrijednosti (desne cifre se vrte duže, kao na brojaču) */
    '#R.jpb-anim .jpb-reel{transform:none}',
    '#R.jpb-anim.jpb-on .jpb-reel{transform:translateY(calc(var(--v) * -5%));transition:transform var(--t,1.6s) cubic-bezier(.16,.8,.22,1) var(--d,1s)}',
    '#R.jpb-anim .jpb-num::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jpb-anim.jpb-on .jpb-num::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) var(--d,1s)}',
    /* crteži: linije se iscrtaju, tačke i reflektori se pale jedan za drugim, sanke jednom kliznu niz kosinu */
    '#R.jpb-anim .jpb-dw{stroke-dasharray:1;stroke-dashoffset:1}',
    '#R.jpb-anim.jpb-on .jpb-dw{stroke-dashoffset:0;transition:stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1) var(--d,1s)}',
    '#R.jpb-anim .jpb-pop{opacity:0}',
    '#R.jpb-anim.jpb-on .jpb-pop{opacity:1;transition:opacity .35s ease var(--d,1s)}',
    '#R.jpb-anim .jpb-sled{offset-distance:0%}',
    '#R.jpb-anim.jpb-on .jpb-sled{offset-distance:100%;transition:offset-distance 1.5s cubic-bezier(.45,0,.25,1) var(--d,1.6s)}',

    /* manji laptop: uži tekst */
    '@media (max-width:1180px){#R .jpb-frame{--L:min(calc(var(--side) + 520px),58%)}#R .jpb-body{width:calc(500px + var(--side));max-width:60%}#R .jpb-nums{gap:26px 30px}#R .jpb-g{width:118px}}',
    /* tablet i telefon: fotografija gore (reflektor i snowboarder u kadru), tekst i brojke ispod */
    '@media (max-width:980px){',
    '#R .jpb-frame{--mh:min(60vw,500px);flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:0}',
    '#R .jpb-bg{position:relative;inset:auto;height:var(--mh);flex-shrink:0;-webkit-mask-image:linear-gradient(180deg,#000 74%,transparent 100%);mask-image:linear-gradient(180deg,#000 74%,transparent 100%)}',
    '#R .jpb-ph{left:0;-webkit-mask-image:none;mask-image:none}',
    '#R .jpb-ph img{object-position:var(--mpos,60% 60%)}',
    '#R .jpb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.62) 0%,rgba(6,11,22,0) 42%),linear-gradient(180deg,rgba(6,11,22,.3) 0%,rgba(6,11,22,0) 22%)}',
    '#R .jpb-body{width:auto;max-width:none;padding:clamp(14px,3vw,28px) clamp(22px,6vw,56px) clamp(34px,5vw,54px)}',
    '#R h2{font-size:clamp(42px,7.4vw,64px)}',
    '#R .jpb-lead{max-width:56ch}',
    '#R .jpb-nums{width:min(100%,620px)}}',
    '@media (max-width:760px){',
    '#R .jpb-frame{--mh:min(96vw,420px);border-radius:24px}',
    '#R .jpb-ph img{object-position:66% 62%}',
    '#R .jpb-body{padding:10px 20px 32px}',
    '#R .jpb-eye{gap:10px;margin-bottom:16px;font-size:10px;letter-spacing:3px}',
    '#R .jpb-eye::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.4vw,54px)}',
    '#R .jpb-lead{margin-top:16px}',
    '#R .jpb-nums{gap:24px 18px;margin-top:28px!important;width:100%}',
    '#R .jpb-num{padding-top:14px!important}',
    '#R .jpb-g{width:min(100%,112px);height:30px;margin-bottom:10px}',
    '#R .jpb-v{font-size:clamp(40px,12vw,54px)}',
    '#R .jpb-l{font-size:14px}',
    '#R .jpb-s{font-size:9px;letter-spacing:1.4px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jpb-brojke');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jpb-css');
  if (!st) { st = d.createElement('style'); st.id = 'jpb-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  var ARROW = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function f1(x) { return Math.round(x * 100) / 100; }
  // 600 → "600", 1200 → "1.200" (EN "1,200")
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, EN ? ',' : '.'); }
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

  /* ---------- crteži iznad brojki (viewBox 132 × 36) ---------- */
  function pd(dly) { return ' style="--d:' + dly.toFixed(2) + 's"'; }
  function art(k, n, D) {
    var o = '', i, x, y, c = Math.max(1, Math.min(+n || 1, 40));
    if (k === 'km') {
      // staza vijuga niz planinu: blijeda šira traka + cyan linija, tačke na startu i cilju
      var P = 'M3 5 C 26 4, 34 15, 52 16 S 74 10, 88 20 S 112 33, 129 31';
      o += '<path class="jpb-ln" d="' + P + '" stroke-width="5" opacity=".14"/>';
      o += '<path class="jpb-ac jpb-dw" pathLength="1" d="' + P + '"' + pd(D) + '/>';
      o += '<circle class="jpb-wh jpb-pop" cx="3" cy="5" r="1.7"' + pd(D) + '/><circle class="jpb-dot jpb-pop" cx="129" cy="31" r="2"' + pd(D + 1) + '/>';
    } else if (k === 'zicare') {
      // uže žičare (dvije niti) i n tačaka (žičara) duž njega, pale se jedna za drugom
      o += '<path class="jpb-ln jpb-dw" pathLength="1" d="M3 32 Q 66 24 129 4"' + pd(D) + '/>';
      o += '<path class="jpb-ln jpb-dw" pathLength="1" d="M3 35 Q 66 27 129 7" opacity=".45"' + pd(D + .1) + '/>';
      for (i = 0; i < c; i++) {
        var t = c > 1 ? i / (c - 1) : .5, u = 1 - t;
        x = u * u * 3 + 2 * u * t * 66 + t * t * 129; y = u * u * 32 + 2 * u * t * 24 + t * t * 4;
        o += '<circle class="jpb-dot jpb-pop" cx="' + f1(x) + '" cy="' + f1(y + 1.5) + '" r="1.5"' + pd(D + .3 + i * .055) + '/>';
      }
    } else if (k === 'nocne') {
      // n reflektora uz stazu (stub + glava); glave se pale jedna za drugom
      o += '<path class="jpb-ln jpb-dw" pathLength="1" d="M2 34 L130 34"' + pd(D) + '/>';
      for (i = 0; i < c; i++) {
        x = 6 + (c > 1 ? i * (120 / (c - 1)) : 60);
        o += '<path class="jpb-ln jpb-pop" d="M' + f1(x) + ' 34 V' + 13 + ' M' + f1(x - 2.6) + ' 13 H' + f1(x + 2.6) + '"' + pd(D + .15 + i * .04) + '/>';
        o += '<circle class="jpb-glow jpb-pop" cx="' + f1(x) + '" cy="11" r="2"' + pd(D + .55 + i * .09) + '/>';
      }
    } else {
      // kosina sankališta sa kotom dužine; sanke jednom kliznu od vrha do dna
      o += '<path class="jpb-ln jpb-dw" pathLength="1" d="M3 9 L129 31"' + pd(D) + '/>';
      o += '<path class="jpb-ln jpb-pop" d="M4.9 2.3 L1.1 15.7 M130.9 24.3 L127.1 37.7" opacity=".7"' + pd(D + .4) + '/>';
      o += '<path class="jpb-ln jpb-pop" d="M3 9 L129 31" stroke-dasharray="1.5 3" transform="translate(-1.6 -9.2)" opacity=".55"' + pd(D + .5) + '/>';
      o += '<text class="jpb-cap jpb-pop" x="70" y="12" text-anchor="middle" transform="rotate(9.9 70 12)"' + pd(D + .6) + '>' + esc(fmt(n)) + ' M</text>';
      o += '<g class="jpb-sled" style="offset-path:path(\'M3 9 L129 31\');--d:' + (D + .7).toFixed(2) + 's"><rect class="jpb-dot" x="-4" y="-3.6" width="8" height="2.2" rx="1.1"/></g>';
    }
    return '<svg viewBox="0 0 132 36" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">' + o + '</svg>';
  }
  // brojka kao niz kolutova (odometar); tačka hiljada stoji mirno
  function reels(n, D) {
    var s = fmt(n), o = '', di = 0;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (!/\d/.test(ch)) { o += '<span>' + esc(ch) + '</span>'; continue; }
      var strip = '';
      for (var r = 0; r < 20; r++) strip += '<i>' + (r % 10) + '</i>';
      // desne cifre se vrte duže, kao na mehaničkom brojaču
      o += '<span class="jpb-d"><span class="jpb-reel" style="--v:' + (10 + +ch) + ';--t:' + (1.2 + di++ * .28).toFixed(2) + 's;--d:' + D.toFixed(2) + 's">' + strip + '</span></span>';
    }
    return '<span class="jpb-ds" aria-hidden="true">' + o + '</span>';
  }

  /* ---------- crtanje ---------- */
  function numsHTML() {
    return KEYS.map(function (k, i) {
      var t = T[k], n = NUM[k], D = 1 + i * .16;
      return '<li class="jpb-num jpb-up" style="--d:' + (.7 + i * .08).toFixed(2) + 's">' +
        '<div class="jpb-g">' + art(k, n, D) + '</div>' +
        '<div class="jpb-v">' + reels(n, D) + (t.u ? '<em aria-hidden="true">' + esc(t.u) + '</em>' : '') +
          '<span class="jpb-sr">' + esc(fmt(n) + (t.u ? ' ' + t.u : '')) + '</span></div>' +
        '<span class="jpb-l">' + esc(t.l) + '</span><span class="jpb-s">' + esc(t.s) + '</span></li>';
    }).join('');
  }
  root.innerHTML =
    '<section class="jpb-wrap" aria-labelledby="jpb-h"><div class="jpb-frame" style="--pos:58% 46%;--lum:.88">' +
      '<div class="jpb-bg"><div class="jpb-ph">' +
        '<img src="' + esc(IMG.main) + '" srcset="' + esc(IMG.mainS) + ' 1000w, ' + esc(IMG.main) + ' 2000w" sizes="(max-width: 980px) 100vw, 70vw" alt="' + esc(T.photo) + '" decoding="async">' +
        '<span class="jpb-beam"></span><span class="jpb-lamp"></span>' +
      '</div><span class="jpb-tint"></span><span class="jpb-scrim"></span></div>' +
      '<div class="jpb-body">' +
        '<div class="jpb-eye jpb-up" style="--d:.26s">' + esc(T.eyebrow) + '</div>' +
        '<h2 id="jpb-h"><span class="jpb-up" style="--d:.36s">' + esc(T.h[0]) + '</span><span class="jpb-o jpb-up" style="--d:.46s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jpb-lead jpb-up" style="--d:.58s">' + esc(T.lead) + '</p>' +
        '<ul class="jpb-nums"></ul>' +
        (LINK ? '<div class="jpb-foot jpb-up" style="--d:1.1s"><a class="jpb-link" href="' + esc(LINK) + '" data-jpb="link">' + esc(LINKT) + ' ' + ARROW + '</a></div>' : '') +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  var frame = q('.jpb-frame'), ph = q('.jpb-ph'), img = q('.jpb-ph img');

  var drawn = '';
  function render() {
    var key = KEYS.map(function (k) { return NUM[k]; }).join('|');
    if (key === drawn) return;
    drawn = key;
    q('.jpb-nums').innerHTML = numsHTML();
  }
  render();

  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-jpb="link"]');
    if (a) track('brojke_klik', { cilj: 'link' });
  });

  // svjetlo reflektora prati fotografiju (object-fit: cover): položaj lampe u pikselima unutar .jpb-ph
  function lamp() {
    var cw = ph.clientWidth, ch = ph.clientHeight, iw = img.naturalWidth || 2000, ih = img.naturalHeight || 1334;
    if (!cw || !ch) return;
    var s = Math.max(cw / iw, ch / ih), rw = iw * s, rh = ih * s;
    var pos = (getComputedStyle(img).objectPosition || '50% 50%').split(' ');
    var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || pos[0]) / 100;
    if (isNaN(px)) px = .5; if (isNaN(py)) py = .5;
    ph.style.setProperty('--lx', f1((cw - rw) * px + LAMP[0] * rw) + 'px');
    ph.style.setProperty('--ly', f1((ch - rh) * py + LAMP[1] * rh) + 'px');
  }
  img.addEventListener('load', lamp);

  // blok uvijek ide preko cijele širine ekrana, i kad je kontejner teme/Elementora uži (isto kao ostali blokovi)
  var ABOVE = ['jsk-sankaliste', 'jsb-park', 'jsd-depo', 'jg-gondola', 'jb-bar', 'jsu-suvenirnica', 'jr-ratrak', 'jv-vijesti'];
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
    root.classList.toggle('jpb--boxed', boxed);
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
    // naš blok odmah ispod (bez razmaka) → on već daje razmak, ovdje ostaje samo rub
    var top = root.getBoundingClientRect().top;
    root.classList.toggle('jpb--join', !boxed && ABOVE.some(function (id) {
      var el = d.getElementById(id);
      return el && el.getBoundingClientRect().width >= cw - 24 && Math.abs(el.getBoundingClientRect().bottom - top) < 3;
    }));
    lamp();
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

  /* ---------- brojke iz WordPressa (REST API): tekst stranice ---------- */
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
  // tekst stranice (bez HTML-a; razmak poslije svakog bloka, da se brojka i natpis iz susjednih widgeta ne slijepe)
  function text(pg) {
    var html = pickLang(pg.content && pg.content.rendered || '');
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    [].forEach.call(b.querySelectorAll('script,style,noscript'), function (e) { e.parentNode.removeChild(e); });
    [].forEach.call(b.querySelectorAll('p,li,div,br,h1,h2,h3,h4,h5,h6,td,span'), function (e) { e.parentNode.insertBefore(b.ownerDocument.createTextNode(' '), e.nextSibling); });
    return clean(b.textContent).replace(/(\d)\.(\d{3})\b/g, '$1$2');   // 1.200 → 1200
  }
  // brojke iz teksta (SR i EN rečenice kakve su na sajtu)
  var RX = {
    km: [/(\d{1,3})\s*(?:km|kilometar[a-z]*|kilometr[a-z]*|kilomet(?:er|re)s?)\b[^.]{0,80}?(?:staz|slope|pist|run|trail)/i, /(?:staz|slope|pist)[a-z]*[^.\d]{0,40}?(\d{1,3})\s*(?:km|kilomet)/i],
    zicare: [/(\d{1,2})\s+(?:instalacij[a-z]*|žičar[a-z]*|ski[\s-]*liftov[a-z]*|vertical\s+transport|(?:ski\s+)?lifts?\b)/i, /(?:ukupno|in\s+total)\s*:?\s*(\d{1,2})\b/i],
    nocne: [/(\d{1,2})\s+(?:homologovan[a-z]*\s+|homologated\s+)?(?:\S+\s+){0,3}?(?:(?:staz[a-z]*|ski\s+(?:slopes|trails|runs)|slopes|trails|runs)\s+(?:za|for)\s+noćn|noćn[a-z]*\s+staz|night\s+ski|ski\s+(?:slopes|trails|runs)\s+for\s+night|(?:slopes|trails|runs)\s+for\s+night)/i,
      /(\d{1,2})\s+homolog[a-z]*\s+(?:night|noćn)/i],
    sankanje: [/(\d{2,4})\s*(?:m|metar[a-z]*|metr[a-z]*|meters?|metres?)\b[^.\d]{0,40}?(?:sank|sled|toboggan)/i, /(?:sankali[a-zš]*|sled(?:ding)?\s+track)[^.\d]{0,60}?(\d{2,4})\s*(?:m\b|metar|metr|meter|metre)/i]
  };
  function parse(pg) {
    var t = text(pg), r = {};
    KEYS.forEach(function (k) {
      for (var i = 0; i < RX[k].length; i++) { var m = t.match(RX[k][i]); if (m && +m[1] > 0) { r[k] = String(+m[1]); return; } }
    });
    return r;
  }
  function load() {
    return api('pages', 'slug=' + encodeURIComponent(SLUG) + '&_fields=id,link,title,content').then(function (j) {
      if (!j || !j[0]) throw new Error('stranica "' + SLUG + '" nije pronađena');
      return parse(j[0]);
    });
  }
  function apply(r) {
    var miss = [];
    KEYS.forEach(function (k) {
      if (FIX[k]) return;
      if (r[k]) NUM[k] = r[k]; else miss.push(T[k].l);
    });
    render();
    if (miss.length) why('stranica "' + SLUG + '" nema: ' + miss.join(', '));
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jpb-why') || q('.jpb-body').appendChild(d.createElement('small'));
    el.className = 'jpb-why'; el.textContent = T.why + ' · ' + T.aria + ': ' + msg + ' (' + T.whyTail + ')';
  }
  var wpDone = !(w.fetch && w.DOMParser && w.Promise) || KEYS.every(function (k) { return FIX[k]; });
  if (!wpDone) {
    load().then(apply).catch(function (e) {
      if (w.console) console.warn('[Jahorina Planina u brojkama]', e);
      why(e && e.message || 'REST');
    });
  }

  // ulazak jednom, kad kadar dođe u vidno polje (ako WordPress promijeni brojke prije toga, koluti se vrte do novih)
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jpb-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        void root.offsetWidth;
        root.classList.add('jpb-on');
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(frame);
  }
})(window, document);
