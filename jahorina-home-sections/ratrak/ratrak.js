/* =====================================================================
   JAHORINA — PANORAMSKA VOŽNJA RATRAKOM (početna, ispod vijesti)
   Lijevo noćna snježna scena u koju ulazi ratrak (jednom, kad sekcija uđe u vidno polje),
   desno tekst, tri kartice (trajanje, polazak, cijena) i rezervacija (mail, telefon).
   Ugradnja: Elementor HTML widget sa <div id="jr-ratrak"></div> + ovaj fajl sa jsDelivr-a.
   Ratrak se učitava iz istog commita (slike/ratrak-sekcija.webp pored ovog fajla), a pozadina je
   noćna fotografija Jahorine iz hero-a (Mediji). Drugačije slike: data-slika="…" i data-pozadina="…"
   na <div id="jr-ratrak">.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jr-ratrak');
  if (!root || root.__jr) return;
  root.__jr = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  var IMG = root.getAttribute('data-slika') || HERE + 'slike/ratrak-sekcija.webp';
  var PANO = root.getAttribute('data-pozadina') || location.origin + '/wp-content/uploads/2026/09/jahorina-noc.webp';
  var MAIL = 'skipass@oc-jahorina.com', TEL = '+38757270003';

  // tekst je korisnikov, doslovno (EN je prevod)
  var T = EN ? {
    eyebrow: 'Experience', t1: 'Panoramic', t2: 'snowcat ride', scene: 'Snowcat on a Jahorina slope at night',
    lead: 'For those who want to enjoy the view of the slopes and peaks of Jahorina a little longer, the 20-minute panoramic ride is the right choice.',
    f: [['Duration', '20 min', ''], ['Departure', '4–6 pm', 'Poljice gondola station'], ['Price', '50 KM', 'per person · children under 6 ride free']],
    book: 'Booking', bookTxt: 'At least one day in advance by email to ' + MAIL + ' or by phone at 00387 57 270 003. Payment at the Poljice ski ticket office.',
    mail: 'Send an email', call: 'Call'
  } : {
    eyebrow: 'Doživljaj', t1: 'Panoramska vožnja', t2: 'ratrakom', scene: 'Ratrak na noćnoj stazi Jahorine',
    lead: 'Za one koji žele duže uživati u pogledu na staze i vrhove Jahorine, panoramska vožnja u trajanju od 20 minuta pravi je izbor.',
    f: [['Trajanje', '20 min', ''], ['Polazak', '16–18h', 'polaz gondole Poljice'], ['Cijena', '50 KM', 'po osobi · djeca do 6 g. besplatno']],
    book: 'Rezervacija', bookTxt: 'Najmanje dan unaprijed na mail ' + MAIL + ' ili putem telefona na broj 00387 57 270 003. Plaćanje na ski kasi Poljice.',
    mail: 'Pošalji mail', call: 'Pozovi'
  };

  /* ---------- izgled (sve je pod #jr-ratrak da se ne sudara sa temom) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--surface:#111A2C;--surface-2:#16213A;--line:rgba(255,255,255,.08);--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);',
    '--accent:#00B9F2;--accent-2:#2CCBF8;--raised:6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14);--inset:inset 4px 4px 10px rgba(0,0,0,.5),inset -4px -4px 9px rgba(70,96,142,.13);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jr--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;text-wrap:balance;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::before,#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '#R .jr-wrap{max-width:1240px;margin:0 auto;padding:clamp(56px,7vw,100px) clamp(16px,4vw,48px)}',
    '#R .jr-grid{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,1fr);gap:clamp(28px,4.4vw,72px);align-items:stretch}',

    /* scena: noćna panorama Jahorine (ista fotografija i obrada kao hero/vijesti, blago zamućena kao daljina),
       u prvom planu snježni brijeg sa uređenom stazom po kojoj ratrak ulazi */
    '#R .jr-scene{--cl:4%;--cw:min(80%,520px);position:relative;min-height:clamp(400px,40vw,540px);border-radius:30px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:0 50px 90px -50px rgba(0,0,0,.95),var(--raised)}',
    '#R .jr-scene::after{content:"";position:absolute;inset:0;z-index:9;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)}',
    '#R .jr-pano{position:absolute;inset:0 0 18% 0;width:100%;height:82%;object-fit:cover;object-position:56% 46%;z-index:-3;filter:saturate(.7) brightness(.62) contrast(1.06) blur(1.6px);transform:scale(1.04)}',
    '#R .jr-tint{position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.7}',
    '#R .jr-scene::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(10,17,32,.55) 0%,rgba(10,17,32,0) 26%,rgba(10,17,32,0) 46%,rgba(10,17,32,.5) 66%)}',
    '#R .jr-hill{position:absolute;left:0;right:0;bottom:0;width:100%;height:44%}',
    /* manšester: tragovi uređene staze, otkrivaju se iza ratraka dok ulazi */
    '#R .jr-track{position:absolute;left:0;width:calc(var(--cl) + var(--cw) * .55);bottom:9%;height:17%;',
    'background:repeating-linear-gradient(180deg,rgba(205,225,255,.09) 0 1.5px,rgba(205,225,255,0) 1.5px 5px);',
    '-webkit-mask-image:linear-gradient(180deg,transparent,#000 25%,#000 75%,transparent),linear-gradient(90deg,transparent,#000 35%);-webkit-mask-composite:source-in;',
    'mask-image:linear-gradient(180deg,transparent,#000 25%,#000 75%,transparent),linear-gradient(90deg,transparent,#000 35%);mask-composite:intersect}',
    '#R .jr-glow{position:absolute;right:-8%;bottom:0;width:50%;height:30%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,226,170,.13),rgba(255,226,170,0));pointer-events:none}',

    /* ratrak (okrenut nadesno, da ulazi vozeći naprijed) */
    '#R .jr-cat{position:absolute;left:var(--cl);bottom:8%;width:var(--cw);aspect-ratio:488/288;z-index:3}',
    '#R .jr-body{position:absolute;inset:0;transform-origin:55% 96%}',
    '#R .jr-img{position:absolute;inset:0;width:100%;height:100%;transform:scaleX(-1);filter:saturate(.78) brightness(.94) contrast(1.04) drop-shadow(0 10px 14px rgba(0,0,0,.35))}',
    '#R .jr-shadow{position:absolute;left:4%;right:2%;bottom:-5%;height:16%;border-radius:50%;background:radial-gradient(closest-side,rgba(2,6,14,.7),rgba(2,6,14,0))}',
    /* snijeg koji plug gura ispred sebe (pokriva i mjesto gdje je plug odsječen na fotografiji) */
    '#R .jr-berm{position:absolute;right:-13%;bottom:-4%;width:30%;height:21%;border-radius:50%;',
    'background:radial-gradient(70% 60% at 42% 38%,rgba(178,198,232,.42) 0%,rgba(150,172,212,.2) 48%,rgba(150,172,212,0) 74%);filter:blur(2px)}',
    '#R .jr-berm::after{content:"";position:absolute;left:12%;right:30%;top:22%;height:22%;border-radius:50%;background:radial-gradient(closest-side,rgba(214,228,250,.32),rgba(214,228,250,0))}',
    /* snježna prašina iza ratraka */
    '#R .jr-dust{position:absolute;left:-10%;bottom:-2%;width:42%;height:50%;pointer-events:none;opacity:0}',
    '#R .jr-dust i{position:absolute;bottom:0;border-radius:50%;background:radial-gradient(closest-side,rgba(200,216,244,.34),rgba(200,216,244,.12) 55%,rgba(200,216,244,0));filter:blur(6px)}',
    '#R .jr-dust i:nth-child(1){left:28%;width:72%;height:62%}',
    '#R .jr-dust i:nth-child(2){left:4%;width:66%;height:52%;bottom:8%}',
    '#R .jr-dust i:nth-child(3){left:-18%;width:62%;height:44%;bottom:2%}',

    /* ulazak: s lijeve strane, usporava, blago se zaljulja kad stane (jednom) */
    '#R.jr-ready .jr-cat{transform:translateX(-125%)}',
    '#R.jr-ready .jr-track{clip-path:inset(0 100% 0 0)}',
    '#R.jr-ready .jr-glow{opacity:0}',
    '#R.jr-go .jr-cat{animation:jrDrive 1.25s cubic-bezier(.3,.55,.28,1) both}',
    '#R.jr-go .jr-body{animation:jrBrake .8s ease-out 1.02s both}',
    '#R.jr-go .jr-track{animation:jrTrack 1.25s cubic-bezier(.3,.55,.28,1) both}',
    '#R.jr-go .jr-dust{animation:jrDustBox 1.6s ease-out both}',
    '#R.jr-go .jr-dust i{animation:jrPuff 1.5s ease-out both}',
    '#R.jr-go .jr-dust i:nth-child(2){animation-delay:.12s}',
    '#R.jr-go .jr-dust i:nth-child(3){animation-delay:.26s}',
    '#R.jr-go .jr-glow{animation:jrFade 1s ease 1.05s both}',
    '@keyframes jrDrive{from{transform:translateX(-125%)}to{transform:none}}',
    '@keyframes jrBrake{0%{transform:none}28%{transform:rotate(1.3deg) translateY(1px)}58%{transform:rotate(-.55deg)}80%{transform:rotate(.2deg)}100%{transform:none}}',
    '@keyframes jrTrack{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}',
    '@keyframes jrDustBox{0%{opacity:0}12%{opacity:1}70%{opacity:.85}100%{opacity:0}}',
    '@keyframes jrPuff{from{transform:translate(0,0) scale(.5)}to{transform:translate(-60%,-22%) scale(1.8)}}',
    '@keyframes jrFade{from{opacity:0}to{opacity:1}}',

    /* tekst */
    '#R .jr-text{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0}',
    '#R .jr-text > *{opacity:1}',
    '#R .jr-eyebrow{display:flex;align-items:center;gap:12px;font:600 12px/1 var(--fd);letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}',
    '#R .jr-eyebrow::before{content:"";width:28px;height:2px;border-radius:2px;background:var(--accent);box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(34px,4.1vw,54px);font-weight:800;line-height:.98;letter-spacing:-.022em}',
    '#R h2 span{display:inline-block}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 span{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.3px rgba(255,255,255,.82)!important}}',
    '#R .jr-lead{margin-top:22px;font-size:17px;line-height:1.6;color:var(--text-2)!important;max-width:50ch}',

    /* tri kartice */
    '#R .jr-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:100%;margin-top:30px!important}',
    '#R .jr-fact{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:16px 16px 17px!important;border-radius:18px;background:var(--surface)!important;',
    'box-shadow:4px 4px 12px rgba(0,0,0,.45),-3px -3px 10px rgba(60,84,128,.1),inset 0 1px 0 rgba(255,255,255,.04)}',
    '#R .jr-ico{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;margin-bottom:10px;color:var(--accent);background:#0E1626;',
    'box-shadow:inset 2px 2px 5px rgba(0,0,0,.55),inset -2px -2px 4px rgba(70,96,142,.1)}',
    '#R .jr-ico svg{width:17px;height:17px}',
    '#R .jr-fact small{font:600 10.5px/1.2 var(--fd);letter-spacing:2px;text-transform:uppercase;color:var(--text-3)}',
    '#R .jr-fact b{font:700 clamp(19px,1.7vw,23px)/1.15 var(--fd);letter-spacing:-.01em;color:var(--text);white-space:nowrap}',
    '#R .jr-sub{font-size:13.5px;line-height:1.35;color:var(--text-3)}',

    /* rezervacija */
    '#R .jr-book{width:100%;margin-top:26px;padding-top:22px;border-top:1px solid var(--line)}',
    '#R .jr-book small{display:block;font:600 11px/1 var(--fd);letter-spacing:2.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px}',
    '#R .jr-book p{font-size:15.5px;line-height:1.6;color:var(--text-2)!important;max-width:56ch}',
    '#R .jr-book p a{color:var(--text)!important;border-bottom:1px solid rgba(0,185,242,.45);white-space:nowrap}',
    '#R .jr-book p a:hover{color:var(--accent)!important}',
    '#R .jr-acts{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:20px}',
    /* glavno dugme: blago ispupčeno cyan, ikona u plitkom udubljenom krugu (kao .jv-cta) */
    '#R .jr-cta{display:inline-flex;align-items:center;gap:12px;padding:5px 5px 5px 20px;border-radius:40px;font:600 13.5px/1 var(--fd);letter-spacing:.3px;color:#fff!important;',
    'background:linear-gradient(145deg,#27C4F2 0%,#0AAEE6 60%,#03A2D9 100%);transition:transform .25s ease,box-shadow .25s ease;',
    'box-shadow:5px 5px 12px rgba(0,0,0,.42),-4px -4px 10px rgba(70,110,170,.09),0 10px 22px -16px rgba(0,185,242,.6),inset 1px 1px 0 rgba(255,255,255,.32),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jr-cta__ico{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(0,90,130,.18);box-shadow:inset 2px 2px 4px rgba(0,55,90,.35),inset -1px -1px 3px rgba(255,255,255,.22)}',
    '#R .jr-cta__ico svg{width:15px;height:15px}',
    '#R .jr-cta:hover{transform:translateY(-1px);box-shadow:6px 7px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(70,110,170,.1),0 12px 26px -14px rgba(0,185,242,.7),inset 1px 1px 0 rgba(255,255,255,.36),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jr-cta:active{transform:none;box-shadow:inset 3px 3px 6px rgba(0,60,95,.4),inset -2px -2px 5px rgba(255,255,255,.18)}',
    /* sporedno dugme: tamna neumorfna pilula (kao .jv-more) */
    '#R .jr-more{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;border-radius:40px;font:600 14px/1 var(--fd);letter-spacing:.2px;color:var(--text-2)!important;background:var(--surface);box-shadow:var(--raised);transition:color .2s}',
    '#R .jr-more:hover{color:var(--accent)!important}',
    '#R .jr-more svg{width:16px;height:16px}',

    /* tablet / telefon: ratrak gore, tekst ispod */
    '@media (max-width:980px){#R .jr-grid{grid-template-columns:1fr;gap:34px}#R .jr-scene{--cl:6%;--cw:min(76%,480px);min-height:0;height:clamp(260px,56vw,440px)}}',
    '@media (max-width:620px){',
    '#R .jr-scene{--cl:5%;--cw:80%;border-radius:24px;height:clamp(230px,64vw,330px)}',
    '#R .jr-lead{font-size:16px;margin-top:18px}',
    '#R .jr-facts{grid-template-columns:1fr;gap:10px;margin-top:24px!important}',
    '#R .jr-fact{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:2px 14px;padding:12px 16px 12px 12px!important;border-radius:16px}',
    '#R .jr-ico{grid-row:span 2;margin:0}',
    '#R .jr-fact small{grid-column:2}',
    '#R .jr-fact b{grid-column:3;grid-row:1 / span 2;font-size:20px}',
    '#R .jr-sub{grid-column:2;font-size:13px}',
    '#R .jr-fact.is-solo small{grid-row:1 / span 2;align-self:center}',
    '#R .jr-acts{gap:12px}',
    '#R .jr-acts a{flex:1 1 auto;justify-content:center}',
    '#R .jr-acts .jr-cta{justify-content:space-between}}',
    '@media (prefers-reduced-motion:reduce){#R *,#R *::before,#R *::after{animation:none!important;transition:none!important}#R .jr-cat,#R .jr-body{transform:none!important}#R .jr-track{clip-path:none!important}#R .jr-glow{opacity:1!important}}'
  ].join('\n').replace(/#R/g, '#jr-ratrak');

  if (!d.getElementById('jr-css')) {
    var st = d.createElement('style'); st.id = 'jr-css'; st.textContent = CSS;
    (d.head || d.documentElement).appendChild(st);
  }
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }

  /* ---------- crtanje ---------- */
  function svg(p) { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    time: svg('<circle cx="12" cy="12" r="8.5" ' + S + '/><path d="M12 7.5 V12 L15 14" ' + S + '/>'),
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 10 A6.5 6.5 0 0 1 18.5 10 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="10" r="2.3" ' + S + '/>'),
    ticket: svg('<path d="M4 7.5 H20 V10 A2 2 0 0 0 20 14 V16.5 H4 V14 A2 2 0 0 0 4 10 Z" ' + S + '/><path d="M14.5 7.5 V16.5" ' + S + ' stroke-dasharray="1.6 2.2"/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" ' + S + '/><path d="M4.5 7 L12 12.5 L19.5 7" ' + S + '/>'),
    phone: svg('<path d="M6.6 3.8 L9.2 3.6 L10.6 7.6 L8.7 9 C9.6 11.1 11.2 12.8 13.3 13.8 L14.8 11.9 L18.8 13.4 L18.5 16 C18.4 17.2 17.3 18.1 16.1 18 C9.7 17.4 5 12.6 4.5 6.2 C4.4 5 5.3 3.9 6.6 3.8 Z" ' + S + '/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // mail i broj u rečenici postaju linkovi
  function linkify(s) {
    return esc(s).replace(MAIL, '<a href="mailto:' + MAIL + '">' + MAIL + '</a>')
      .replace('00387 57 270 003', '<a href="tel:' + TEL + '">00387 57 270 003</a>');
  }
  var icons = [ICON.time, ICON.pin, ICON.ticket];

  root.innerHTML =
    '<section class="jr-wrap" aria-labelledby="jr-h"><div class="jr-grid">' +
      '<div class="jr-scene" role="img" aria-label="' + esc(T.scene) + '">' +
        '<img class="jr-pano" src="' + esc(PANO) + '" alt="" decoding="async" loading="lazy"><span class="jr-tint"></span>' +
        '<svg class="jr-hill" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true"><defs>' +
          '<linearGradient id="jr-hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E4064"/><stop offset=".22" stop-color="#1F2D4A"/><stop offset="1" stop-color="#111B30"/></linearGradient>' +
          '<linearGradient id="jr-hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#BFD4F5" stop-opacity="0"/><stop offset=".45" stop-color="#BFD4F5" stop-opacity=".35"/><stop offset="1" stop-color="#BFD4F5" stop-opacity=".08"/></linearGradient></defs>' +
          '<path d="M0 46 C120 30 230 22 330 26 C430 30 520 44 600 38 V240 H0 Z" fill="url(#jr-hg)"/>' +
          '<path d="M0 46 C120 30 230 22 330 26 C430 30 520 44 600 38" stroke="url(#jr-hl)" stroke-width="1.2" fill="none"/>' +
        '</svg>' +
        '<div class="jr-track"></div><div class="jr-glow"></div>' +
        '<div class="jr-cat"><div class="jr-body">' +
          '<span class="jr-dust"><i></i><i></i><i></i></span>' +
          '<span class="jr-shadow"></span>' +
          '<img class="jr-img" src="' + esc(IMG) + '" alt="" decoding="async" width="488" height="288">' +
          '<span class="jr-berm"></span>' +
        '</div></div>' +
      '</div>' +
      '<div class="jr-text">' +
        '<div class="jr-eyebrow">' + esc(T.eyebrow) + '</div>' +
        '<h2 id="jr-h">' + esc(T.t1) + ' <span>' + esc(T.t2) + '</span></h2>' +
        '<p class="jr-lead">' + esc(T.lead) + '</p>' +
        '<ul class="jr-facts">' + T.f.map(function (f, k) {
          return '<li class="jr-fact' + (f[2] ? '' : ' is-solo') + '"><span class="jr-ico">' + icons[k] + '</span><small>' + esc(f[0]) + '</small><b>' + esc(f[1]) + '</b>' + (f[2] ? '<span class="jr-sub">' + esc(f[2]) + '</span>' : '') + '</li>';
        }).join('') + '</ul>' +
        '<div class="jr-book"><small>' + esc(T.book) + '</small><p>' + linkify(T.bookTxt) + '</p>' +
          '<div class="jr-acts">' +
            '<a class="jr-cta" href="mailto:' + MAIL + '">' + esc(T.mail) + '<b class="jr-cta__ico">' + ICON.mail + '</b></a>' +
            '<a class="jr-more" href="tel:' + TEL + '">' + ICON.phone + esc(T.call) + '</a>' +
          '</div></div>' +
      '</div>' +
    '</div></section>';

  // blok uvijek ide preko cijele širine ekrana, i kad je kontejner teme/Elementora uži (isto kao vijesti)
  function fit() {
    var st = root.style;
    st.removeProperty('width'); st.removeProperty('max-width'); st.removeProperty('margin-left');
    var cw = d.documentElement.clientWidth, r = root.getBoundingClientRect();
    if (r.width < cw - 1) {
      st.setProperty('width', cw + 'px', 'important');
      st.setProperty('max-width', 'none', 'important');
      st.setProperty('margin-left', -r.left + 'px', 'important');
    }
    root.classList.toggle('jr--boxed', root.getBoundingClientRect().width < cw - 24);
  }
  function refit() { clearTimeout(fit.t); fit.t = setTimeout(fit, 120); }
  fit();
  w.addEventListener('resize', refit);
  if ('ResizeObserver' in w) new ResizeObserver(refit).observe(d.body);

  // ratrak ulazi jednom, kad scena uđe u vidno polje
  var still = !('IntersectionObserver' in w) || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!still) {
    root.classList.add('jr-ready');
    var scene = root.querySelector('.jr-scene');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { root.classList.add('jr-go'); io.disconnect(); }
    }, { threshold: .4 });
    io.observe(scene);
  }
})(window, document);
