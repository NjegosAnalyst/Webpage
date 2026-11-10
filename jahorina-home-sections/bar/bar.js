/* =====================================================================
   JAHORINA — OLIMPIJSKI BAR (početna, ispod suvenirnice) · v4 „premium restoran“ (10. 11.)
   Korisnik 10. 11.: bez cjenovnika; „da izgleda kao premium restoran svjetskog nivoa, minimalistički“ → jedna mirna
   fotografija u toplim tonovima (bez smjene i bez plave noćne obrade), mali tekst „Après-ski i restoran · 1.879 m“, pun naslov
   (bez obrisa), kratak uvod, jedan tihi red (radno vrijeme · terasa), jedno glavno dugme „Rezerviši sto“ i tihi link
   „Pogledaj atmosferu“ (video); broj telefona i link stranice sitno ispod.
   Tema hero-a, vijesti, ratraka i suvenirnice (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele
   širine, fotografija u pozadini kadra, naslov sa iscrtanim krajem, staklene pločice), sa svojim detaljima:
     · cik-cak sa suvenirnicom iznad (tamo fotografija desno): ovdje je fotografija lijevo, tekst desno;
     · video (YouTube) se otvara preko ekrana tek na klik.
     (Do 10. 11. lijevo je stajao meni-knjiga, a u pozadini su se smjenjivale 3 fotografije — vidi git istoriju.)

   SADRŽAJ JE IZ WORDPRESSA:
     · stranica "Olimpijski bar" (slug olimpijski-bar): naslov = naslov stranice, nadmorska visina (u malom tekstu)
       se čita iz teksta, video = prvi YouTube link/ugradnja na stranici,
       telefon = prvi tel: link na stranici (ako postoji), "Više o baru" = link stranice;
     Uvod je kratak sažetak teksta stranice (u kodu; zamjena: data-uvod). Dok WordPress ne odgovori, stoji ugrađeni tekst.
     Prijavljeni admin vidi tehnički razlog.

   Ugradnja: Elementor HTML widget sa <div id="jb-bar"></div> + ovaj fajl sa jsDelivr-a.
   Podešavanja na <div id="jb-bar"> (sva su neobavezna):
     data-stranica="olimpijski-bar"   (slug WordPress stranice)
     data-telefon="+387…"              (broj za rezervacije; podrazumijevano kontakt OC Jahorina +387 57 270 003)
     data-video="https://youtu.be/…"   (zamjena za video sa stranice)
     data-radno="Otvoreno 9–21h"       (zamjena za radno vrijeme u tihom redu; EN: data-radno-en="Open 9 am – 9 pm")
     data-uvod="…" / data-uvod-en="…"  (zamjena za uvod)
   GA: Rezervacije → bar_rezervacija (nacin: telefon), video → bar_video,
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

  // tekstovi (10. 11., premium restoran): uvod je sažetak teksta stranice (domaća kuhinja, vrhunska pića) + pogled sa vrha kao metafora
  var T = EN ? {
    kicker: 'Après-ski & restaurant', head: 'Olympic Bar', altV: '1,879',
    lead: 'Home-style cooking and fine drinks at the top of Jahorina, with the whole mountain at your feet.',
    hours: 'Open 9 am – 9 pm', place: 'Terrace with a view',
    rez: 'Book a table', rezAria: 'Book a table by phone', rezLine: 'Reservations', video: 'Watch the atmosphere', more: 'More about the Olympic Bar',
    close: 'Close', vid: 'Video: Olympic Bar', why: 'WordPress', whyTail: 'showing built-in content',
    photo: 'Mushroom risotto and a glass of white wine on a set table at the Olympic Bar'
  } : {
    kicker: 'Après-ski i restoran', head: 'Olimpijski bar', altV: '1.879',   // korisnik 10. 11. (ranije „Restoran“)
    lead: 'Domaća kuhinja i vrhunska pića na vrhu Jahorine, gdje vam je cijela planina na dlanu.',   // korisnik 10. 11.: bez jezera, metafora pogleda sa vrha
    hours: 'Otvoreno 9–21h', place: 'Terasa sa pogledom',
    rez: 'Rezerviši sto', rezAria: 'Rezerviši sto telefonom', rezLine: 'Rezervacije', video: 'Pogledaj atmosferu', more: 'Više o Olimpijskom baru',
    close: 'Zatvori', vid: 'Video: Olimpijski bar', why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj',
    photo: 'Rižoto sa pečurkama i čaša bijelog vina na postavljenom stolu Olimpijskog bara'
  };
  var LEAD = opt(EN ? 'uvod-en' : 'uvod', T.lead);
  var RADNO = opt(EN ? 'radno-en' : 'radno', T.hours);   // radno vrijeme (korisnik 10. 11.: od 9 do 21h)

  // jedna mirna fotografija (premium: bez smjene); pozicija na računaru / telefonu i jačina
  var PHOTO = { full: HERE + 'slike/bar-glavna.webp', md: HERE + 'slike/bar-glavna-1000.webp', w: 2000, pos: '60% 56%', mpos: '40% 64%', lum: .88, alt: T.photo };

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
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
       Kad je suvenirnica odmah iznad (.jb--join), ona već daje cijeli razmak ispod sebe, pa bar iznad kadra ne dodaje ništa
       (pravilo od 10. 11.: između dvije naše sekcije jedan razmak — 100 px računar, 56 px telefon) */
    '#R .jb-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jb--join .jb-wrap{--pt:0px}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jb-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jb-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; fotografije su pozadina cijelog kadra */
    '#R .jb-frame{position:relative;transform-origin:50% 0;display:flex;align-items:center;min-height:clamp(640px,48vw,860px);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:0 50px 90px -50px rgba(0,0,0,.95),6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14)}',   /* kao kartica vijesti, ratrak i suvenirnica */
    '#R .jb-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)}',
    /* tanak topli odsjaj na gornjoj ivici, iznad toplog svjetla bara (lijevo) */
    '#R .jb-frame::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent 2%,rgba(255,214,170,.42) 22%,transparent 48%)}',
    '#R .jb-bgs{position:absolute;inset:0;z-index:-1;overflow:hidden}',
    /* fotografija: prirodni topli tonovi (hrana ne smije biti plava — bez noćne obrade iz teme), samo blago prigušena;
       pri ulasku se upali iz mraka. Desna ivica se utapa u tamu ispod teksta */
    '#R .jb-bg{position:absolute;top:0;left:0;width:60%;height:100%;object-fit:cover;opacity:0;',
    'filter:brightness(.3) contrast(1.04);transition:opacity 1.6s ease,filter 2.2s cubic-bezier(.3,.6,.2,1);',
    '-webkit-mask-image:linear-gradient(270deg,transparent 0,#000 34%);mask-image:linear-gradient(270deg,transparent 0,#000 34%)}',   /* računar: fotografija u lijevih 60% (cijeli tanjir i čaša), tekst na mirnoj tami desno */
    '#R .jb-bg.is-on{opacity:1;filter:brightness(var(--lum,.88)) contrast(1.04)}',
    '#R .jb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(270deg,rgba(6,11,22,.93) 0,rgba(6,11,22,.84) calc(var(--side) + 380px),rgba(6,11,22,.55) calc(var(--side) + 590px),rgba(6,11,22,.14) calc(var(--side) + 790px),rgba(6,11,22,0) calc(var(--side) + 930px)),',
    'linear-gradient(90deg,rgba(6,11,22,.42) 0,rgba(6,11,22,0) calc(var(--side) + 180px)),',
    'linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 30%),linear-gradient(180deg,rgba(8,10,16,.28) 0%,rgba(8,10,16,0) 22%),',
    'radial-gradient(130% 100% at 38% 50%,transparent 56%,rgba(4,8,18,.55) 100%)}',
    /* toplo svjetlo bara gore lijevo */
    '#R .jb-light{position:absolute;inset:0;pointer-events:none;background:radial-gradient(30% 54% at var(--lx,22%) 0%,rgba(255,214,170,.17),rgba(255,190,140,.05) 55%,transparent 80%)}',

    /* tekst desno (cik-cak sa suvenirnicom iznad), poravnat sa desnom ivicom mreže 1240px */
    '#R .jb-body{position:relative;z-index:2;width:min(calc(var(--side) + 560px),52%);margin-left:auto;padding:clamp(56px,6vw,96px) var(--side) clamp(56px,6vw,96px) 0}',
    '#R .jb-kicker{display:flex;align-items:center;gap:14px;font:600 15px/1.2 var(--fd);letter-spacing:.2px;color:rgba(255,255,255,.82);margin-bottom:22px}',   /* kao mali tekst hero-a (od 30. 10. bez velikih slova) */
    '#R .jb-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(46px,5vw,78px);font-weight:800;line-height:.93;letter-spacing:-.025em}',
    '#R h2.jb-long{font-size:clamp(36px,3.8vw,58px)}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '#R .jb-lead{margin-top:26px;font-size:clamp(16px,1.25vw,18px);line-height:1.62;color:var(--text-2)!important;max-width:38ch;text-wrap:pretty}',
    /* jedan tihi red (radno vrijeme · terasa) umjesto tri podatka */
    '#R .jb-place{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-top:22px!important;font:500 14px/1.4 var(--fb);letter-spacing:.2px;color:var(--text-3)!important}',
    '#R .jb-place i{font-style:normal;color:var(--accent)}',
    /* jedno glavno dugme (cyan kao „Kupi ski kartu“) + tihi link videa; bez sporednog dugmeta */
    '#R .jb-acts{display:flex;flex-wrap:wrap;align-items:center;gap:10px 26px;margin-top:34px}',
    '#R .jb-btn{all:unset;position:relative!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;height:50px;padding:0 28px!important;border-radius:16px!important;cursor:pointer;',
    'white-space:nowrap;font:700 15px/1 var(--fd)!important;letter-spacing:0!important;color:#fff!important;background:linear-gradient(160deg,#45D6FF 0%,#00AEE6 50%,#008BC7 100%)!important;',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 0 0 1px rgba(255,255,255,.18),0 10px 24px -10px rgba(0,185,242,.95)!important;transition:transform .2s ease,box-shadow .25s ease,filter .2s}',
    '#R .jb-btn:hover,#R .jb-btn:focus-visible{filter:brightness(1.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 0 0 1px rgba(255,255,255,.3),0 12px 28px -8px rgba(0,185,242,1)!important}',
    '#R a.jb-btn:focus-visible{outline-color:#fff!important}',
    '#R .jb-btn:active{transform:scale(.96)}',
    '#R .jb-play{all:unset;position:relative!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:10px;height:48px;cursor:pointer;white-space:nowrap;',
    'font:600 15px/1 var(--fd)!important;letter-spacing:0!important;color:rgba(255,255,255,.88)!important;transition:color .2s}',
    '#R .jb-play svg{width:22px;height:22px;color:#C4EEFF;transition:transform .25s ease}',
    '#R .jb-play:hover{color:#fff!important}',
    '#R .jb-play:hover svg{transform:scale(1.08)}',
    '#R .jb-play:active{transform:scale(.96)}',
    /* sitno ispod: broj za rezervacije i link stranice */
    '#R .jb-meta{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:18px!important;font:500 13.5px/1.4 var(--fb);color:var(--text-3)!important}',
    '#R .jb-meta a{position:relative;color:var(--text-2)!important;white-space:nowrap;text-decoration:underline;text-decoration-color:rgba(0,185,242,.4);text-underline-offset:4px;transition:color .2s}',
    '#R .jb-meta a::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)}',
    '#R .jb-meta a:hover,#R .jb-meta a:focus-visible{color:var(--accent)!important}',
    '#R .jb-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jb-anim/jb-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jb-anim .jb-frame{opacity:0;transform:translateY(28px)}',
    '#R.jb-anim.jb-on .jb-frame{opacity:1;transform:none;transition:opacity .5s ease,transform .7s cubic-bezier(.2,.7,.2,1)}',
    '#R.jb-anim:not(.jb-on) .jb-bg.is-on{opacity:0;filter:saturate(.9) brightness(.3) contrast(1.08) blur(12px)}',
    '#R.jb-anim .jb-light{opacity:0}',
    '#R.jb-anim.jb-on .jb-light{opacity:1;transition:opacity 1.2s ease .4s}',
    '#R.jb-anim .jb-up{opacity:0;transform:translateY(20px)}',
    '#R.jb-anim.jb-on .jb-up{opacity:1;transform:none;transition:opacity .55s ease var(--d,0s),transform .75s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jb-anim .jb-kicker::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jb-anim.jb-on .jb-kicker::before{transform:none;transition:transform .5s cubic-bezier(.2,.7,.2,1) .2s}',
    /* manji laptop */
    '@media (max-width:1180px){#R .jb-body{width:min(calc(var(--side) + 500px),56%)}}',
    /* tablet i telefon: fotografija gore (utapa se nadolje), tekst ispod */
    '@media (max-width:980px){',
    '#R .jb-frame{flex-direction:column;align-items:stretch;min-height:0}',
    '#R .jb-bgs{position:relative;inset:auto;height:min(58vw,500px);-webkit-mask-image:linear-gradient(180deg,#000 64%,transparent 100%);mask-image:linear-gradient(180deg,#000 64%,transparent 100%)}',
    '#R .jb-bg{width:100%;-webkit-mask-image:none;mask-image:none}',
    '#R .jb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 40%),linear-gradient(180deg,rgba(6,18,42,.36) 0%,rgba(6,18,42,0) 26%),linear-gradient(90deg,rgba(6,11,22,.45) 0%,rgba(6,11,22,0) 45%)}',
    '#R .jb-light{--lx:24%}',
    '#R .jb-body{width:auto;margin-left:0;padding:clamp(28px,4vw,40px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.6vw,66px)}',
    '#R .jb-lead{max-width:56ch}}',
    '@media (max-width:760px){',
    '#R .jb-frame{border-radius:24px}',
    '#R .jb-bg{object-position:var(--mpos)!important}',
    /* telefon: fotografija gore kao u ratraku (bez menija niža nego ranije: 124vw → 96vw) */
    '#R .jb-bgs{height:min(96vw,460px)}',
    '#R .jb-light{--lx:50%}',
    '#R .jb-body{padding:14px 22px 30px}',
    '#R .jb-kicker{letter-spacing:.1px;font-size:13.5px;gap:10px;margin-bottom:16px}',
    '#R .jb-kicker::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.6vw,54px)}',
    '#R h2.jb-long{font-size:clamp(30px,8.6vw,42px)}',
    '#R .jb-lead{margin-top:18px}',
    '#R .jb-place{margin-top:18px!important;font-size:13.5px}',
    /* telefon: dugme preko cijele širine, link videa ispod u sredini */
    '#R .jb-acts{gap:4px;margin-top:26px}',
    '#R .jb-btn{flex:1 1 100%;height:48px;font-size:14.5px!important}',
    '#R .jb-play{margin:0 auto;font-size:14.5px!important}',
    '#R .jb-meta{justify-content:center;margin-top:10px!important;font-size:13px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

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
  ].join('\n').replace(/#R/g, '#jb-bar').replace(/#V/g, '#jb-vid');
  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jb-css');
  if (!st) { st = d.createElement('style'); st.id = 'jb-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  // fontovi jednom na stranici: isti link (Archivo 500–800 + Barlow 300–700) dodaje se u <head> samo ako ga još nema
  if (!d.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="family=Archivo"][href*="family=Barlow"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- pomoćno ---------- */
  function svg(p) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    phone: svg('<path d="M6.6 3.8 L9.2 3.6 L10.6 7.6 L8.7 9 C9.6 11.2 11.6 13.4 14.1 14.6 L15.6 12.8 L19.6 14.2 L19.4 16.9 C19.3 18.4 18 19.6 16.4 19.4 C9.9 18.8 4.7 13.6 4.1 7.1 C3.9 5.5 5.1 4 6.6 3.8 Z" ' + S + '/>'),
    play: svg('<circle cx="12" cy="12" r="8.6" ' + S + '/><path d="M10.2 8.9 L15.2 12 L10.2 15.1 Z" ' + S + '/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
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
  // naslov u redove ("Olimpijski / bar"); od 10. 11. pun, bez obrisa (obris je sportski detalj, ovo je restoran)
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
    return lines.map(function (l, i) { return '<span class="jb-up" style="--d:' + (.12 + i * .07).toFixed(2) + 's">' + esc(l) + '</span>'; }).join(' ') +
      ' <span class="jb-up" style="--d:' + (.12 + lines.length * .07).toFixed(2) + 's">' + esc(o) + '</span>';
  }
  function kickerText(alt) { return T.kicker + (alt ? ' · ' + alt + ' m' : ''); }
  function placeHTML() { return (RADNO ? [RADNO, T.place] : [T.place]).map(esc).join('<i aria-hidden="true">·</i>'); }

  /* ---------- crtanje ---------- */
  function bgImg(p) {
    return '<img class="jb-bg is-on" src="' + esc(p.full) + '" srcset="' + esc(p.md) + ' 1000w, ' + esc(p.full) + ' ' + p.w + 'w" sizes="100vw"' +
      ' alt="' + esc(p.alt) + '" style="object-position:' + p.pos + ';--mpos:' + p.mpos + ';--lum:' + p.lum + '" decoding="async" loading="lazy">';
  }
  root.innerHTML =
    '<section class="jb-wrap" aria-labelledby="jb-h"><div class="jb-frame">' +
      '<div class="jb-bgs">' + bgImg(PHOTO) + '<span class="jb-scrim"></span><span class="jb-light"></span></div>' +
      '<div class="jb-body">' +
        '<div class="jb-kicker jb-up" style="--d:.05s">' + esc(kickerText(T.altV)) + '</div>' +
        '<h2 id="jb-h">' + titleHTML(T.head) + '</h2>' +
        '<p class="jb-lead jb-up" style="--d:.3s">' + esc(LEAD) + '</p>' +
        '<p class="jb-place jb-up" style="--d:.38s">' + placeHTML() + '</p>' +
        '<div class="jb-acts jb-up" style="--d:.46s">' +
          '<a class="jb-btn" href="tel:' + esc(TEL) + '" data-jb="rezervacija">' + esc(T.rez) + '</a>' +
          '<button type="button" class="jb-play" data-jb="video" aria-haspopup="dialog">' + ICON.play + esc(T.video) + '</button>' +
        '</div>' +
        '<p class="jb-meta jb-up" style="--d:.54s"><span>' + esc(T.rezLine) + ': <a class="jb-tel" href="tel:' + esc(TEL) + '" data-jb="rezervacija"></a></span>' +
          '<a class="jb-more" href="' + esc(PAGE) + '" data-jb="stranica">' + esc(T.more) + '</a></p>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  function setTel(t) {
    TEL = t;
    var href = 'tel:' + TEL.replace(/[^\d+]/g, '');
    qa('a[data-jb="rezervacija"]').forEach(function (a) { a.setAttribute('href', href); });
    q('.jb-btn').setAttribute('aria-label', T.rezAria + ' ' + telShow(TEL));
    q('.jb-tel').textContent = telShow(TEL);
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
    // suvenirnica je odmah iznad (bez razmaka) → ona već daje razmak, bar ne dodaje svoj
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

  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jb]');
    if (!b) return;
    var k = b.getAttribute('data-jb');
    if (k === 'video') vOpen();
    else if (k === 'rezervacija') track('bar_rezervacija', { nacin: 'telefon' });
    else if (k === 'stranica') track('bar_klik', { cilj: 'stranica' });
  });

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
    vBack = d.activeElement; modal = 'video';
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
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica Olimpijski bar ---------- */
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
    var txt = clean(b.textContent), m, alt = '';
    if ((m = txt.match(/(\d{1,2}[.,]?\d{3})\s*(?:metara|metres|meters|m)\b/i))) alt = m[1];
    var tl = b.querySelector('a[href^="tel:"]');
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    return {
      id: pg.id, link: link, alt: alt, yt: ytId(raw), tel: tl ? tl.getAttribute('href').slice(4).trim() : '',
      title: clean(new DOMParser().parseFromString('<body>' + pickLang(pg.title && pg.title.rendered || ''), 'text/html').body.textContent)
    };
  }
  function load() {
    var pg = api('pages', 'slug=' + encodeURIComponent(SLUG) + '&_fields=id,link,title,content').then(function (j) {
      if (!j || !j[0]) throw new Error('Stranica "' + SLUG + '" nije pronađena');
      return parse(j[0]);
    });
    return pg.then(function (r) { return r; }, function (e) { return { err: e }; });
  }
  function apply(res) {
    var r = res, miss = [];
    if (r && !r.err) {
      if (r.title) {
        var h2 = q('h2');
        if (h2.textContent.replace(/\s+/g, '') !== r.title.replace(/\s+/g, '')) h2.innerHTML = titleHTML(r.title);
        h2.classList.toggle('jb-long', r.title.length > 26);
      }
      // nadmorska visina iz teksta stranice (kad se tekst promijeni, mijenja se i ovdje); bez nje samo „Après-ski i restoran“
      var kt = kickerText(r.alt);
      if (q('.jb-kicker').textContent !== kt) q('.jb-kicker').textContent = kt;
      if (r.link) q('a[data-jb="stranica"]').setAttribute('href', r.link);
      if (!YT_FIXED) { if (r.yt) YT = r.yt; else miss.push('video'); }
      if (!TEL_FIXED && r.tel && r.tel.replace(/[^\d]/g, '').length >= 8) setTel(r.tel);
    } else miss.push('stranica (' + (r && r.err && r.err.message || 'REST') + ')');
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

  // ulazak jednom, kad kadar dođe u vidno polje
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jb-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { root.classList.add('jb-on'); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(q('.jb-frame'));
  }
  /* SEO-BRZINA:POCETAK */
  /* ---------- SEO i brzina (pravila početne, 14. 10.; pravi ga alati/seo-brzina.py) ---------- */
  (function () {
    var SRC = (d.currentScript && d.currentScript.src) || '', DIMS = {"bar-glavna-1000.webp":[1000,668],"bar-glavna.webp":[2000,1336]};
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
    var ps = d.getElementById('jb-bar-seo-css');
    if (!ps) { ps = d.createElement('style'); ps.id = 'jb-bar-seo-css'; (d.head || d.documentElement).appendChild(ps); }
    ps.textContent = "@media (max-width:760px){#jb-bar *,#jb-bar *::before,#jb-bar *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}#jb-bar img{filter:none!important}#jb-bar [class$=\"-tint\"]{mix-blend-mode:normal!important;opacity:1!important;background:rgba(14,38,78,.32)!important}}";
  })();
  /* SEO-BRZINA:KRAJ */
})(window, document);
