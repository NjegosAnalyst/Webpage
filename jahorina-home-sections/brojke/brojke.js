/* =====================================================================
   JAHORINA — PLANINA U BROJKAMA (početna, ispod Sankališta) · v2 "uže žičare"
   (v1 "brojčanici" odbijen: tekst i 2 × 2 brojke lijevo uz fotografiju desno, mali crteži iznad brojki — "nije dovoljno
   premium i moderno")
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, fotografija
   u pozadini kadra, naslov sa iscrtanim krajem), sa svojim detaljima:
     · fotografija noćnog skijanja preko CIJELOG kadra (snježne jele, reflektor, snowboarder); reflektor je jedini izvor
       svjetla: pri ulasku se upali hladno bijelo svjetlo oko njega;
     · naslov gore lijevo (cik-cak: Sankalište iznad ima tekst desno), uvod bez brojeva;
     · BROJKE kao naslovna tipografija: jedan red od četiri ogromne brojke pri dnu kadra (54 km · 18 · 10 · 600 m),
       natpis i sitni podnaslov ispod; cifre su koluti kao na mehaničkom brojaču (odometar);
     · ŠESTOSJED (glavni detalj, korisnik: „linija kao uže žičare, na njoj korpe šestosjeda, a u korpi brojevi“; „žičara
       ide sa lijevo na desnu stranu a brojevi su okrenuti kao što su i sad“): uže žičare preko kadra, o njemu vise četiri
       sjedišta šestosjeda IZ PROFILA, tankim linijama (hvataljka, nosač povijen do naslona, klupa naprijed, sigurnosna
       šipka sa osloncem za noge); brojka je u staklenoj ploči u prostoru sjedišta, okrenuta prema posjetiocu; natpis ispod.
       Pri ulasku se uže iscrta, sjedišta jedno za drugim doklize po užetu i zaljuljaju se kad stanu, pa se brojka zavrti.
       Telefon: dva reda po dva sjedišta, svaki red na svom užetu;
     · ispod "54 km": tanka traka staza po težini (plave · crvene · crne, km iz data-plave/-crvene/-crne ili teksta
       WordPress stranice; ugrađeno PRIVREMENO skiresort.info 25 · 24 · 3) + legenda sa kilometrima;
     · sjedišta se blago njišu kao na vjetru dok je blok na ekranu; prelaz mišem zaljulja sjedište i brojka se ponovo zavrti;
     · tih link ispod uvoda (samo ako je zadan data-link).

   SADRŽAJ IZ WORDPRESSA: brojke se čitaju iz teksta WordPress stranice (data-stranica = slug; podrazumijevano
   "pocetna-zima", gdje danas stoje rečenice "54 kilometra … 18 instalacija … 10 homologovanih staza … 600 m
   sankalište"). Kad se broj u tekstu stranice promijeni, promijeni se i ovdje. Broj koji se u tekstu ne nađe ostaje
   ugrađeni (stanje 10. 10. 2026); prijavljeni admin vidi šta nedostaje.

   Ugradnja: Elementor HTML widget sa <div id="jpb-brojke"></div> + ovaj fajl sa jsDelivr-a (slike/ iz istog commita).
   Podešavanja na <div id="jpb-brojke"> (sva su neobavezna):
     data-stranica="pocetna-zima"   (slug WordPress stranice sa brojkama)
     data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"   (ručno, ima prednost nad WordPressom)
     data-plave="25" data-crvene="24" data-crne="3"   (km staza po težini; ručno, ima prednost nad WordPressom)
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
    mix: { plave: 'blue', crvene: 'red', crne: 'black' }, mixT: 'Slopes by difficulty',
    photo: 'Night skiing on Jahorina: a snowboarder on a floodlit slope between snow-covered spruces',
    why: 'WordPress', whyTail: 'showing built-in numbers'
  } : {
    aria: 'Planina u brojkama', eyebrow: 'Planina u brojkama', h: ['Olimpijska', 'planina'],
    lead: 'Staze uređene po FIS standardima, od prvog jutarnjeg spusta do noćnog skijanja pod reflektorima.',
    km: { u: 'km', l: 'alpskih skijaških staza', s: 'Uređene po FIS standardima' },
    zicare: { u: '', l: 'žičara i ski liftova', s: 'Vertikalni transport' },
    nocne: { u: '', l: 'staza za noćno skijanje', s: 'Homologovane' },
    sankanje: { u: 'm', l: 'staza sankališta', s: 'Za cijelu porodicu' },
    mix: { plave: 'plave', crvene: 'crvene', crne: 'crne' }, mixT: 'Staze po težini',
    photo: 'Noćno skijanje na Jahorini: snowboarder na osvijetljenoj stazi između snijegom okovanih jela',
    why: 'WordPress', whyTail: 'prikazane su ugrađene brojke'
  };
  var KEYS = ['km', 'zicare', 'nocne', 'sankanje'];
  // ugrađene brojke (stanje na sajtu 10. 10. 2026); data-* ima prednost, pa WordPress, pa ove
  var NUM = { km: '54', zicare: '18', nocne: '10', sankanje: '600' };
  var FIX = {};
  KEYS.forEach(function (k) { var v = opt(k, '').replace(/[^\d]/g, ''); if (v) { FIX[k] = v; NUM[k] = v; } });
  // staze po težini (km): plave · crvene · crne. PRIVREMENO skiresort.info (25 · 24 · 3 = 52 km) dok korisnik ne pošalje
  // zvanične; data-plave/-crvene/-crne ili tekst WordPress stranice ih zamijene
  var MIXK = ['plave', 'crvene', 'crne'], MIXC = { plave: '#3B82F6', crvene: '#EF4444', crne: '#0B0F18' };
  var MIX = { plave: '25', crvene: '24', crne: '3' };
  MIXK.forEach(function (k) { var v = opt(k, '').replace(/[^\d]/g, ''); if (v) { FIX[k] = v; MIX[k] = v; } });
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

    /* kadar kao u hero-u: fotografija preko CIJELOG kadra; naslov gore lijevo (cik-cak sa Sankalištem), brojke u redu pri dnu */
    '#R .jpb-frame{position:relative;transform-origin:50% 0;display:flex;flex-direction:column;justify-content:space-between;min-height:clamp(720px,58vw,940px);border-radius:26px;overflow:hidden;isolation:isolate;background:var(--bg);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jpb-frame::after{content:"";position:absolute;inset:0;z-index:8;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jpb-bg{position:absolute;inset:0;overflow:hidden}',
    '#R .jpb-ph{position:absolute;inset:0}',
    '#R .jpb-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos,50% 38%);filter:saturate(.8) brightness(var(--lum,.86)) contrast(1.06)}',
    /* svjetlo reflektora (hladno bijelo, jedini izvor svjetla); --lx/--ly računa skripta iz položaja fotografije */
    '#R .jpb-lamp{position:absolute;left:var(--lx,85%);top:var(--ly,27%);width:clamp(280px,28vw,460px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;mix-blend-mode:screen;',
    'background:radial-gradient(circle,rgba(236,246,255,.5) 0,rgba(200,226,255,.2) 16%,rgba(150,196,255,.07) 38%,transparent 66%)}',
    '#R .jpb-beam{position:absolute;left:var(--lx,85%);top:var(--ly,27%);width:clamp(300px,30vw,520px);height:clamp(380px,40vw,640px);transform:translateX(-58%);pointer-events:none;mix-blend-mode:screen;',
    'background:radial-gradient(46% 90% at 58% 0,rgba(214,234,255,.13),rgba(214,234,255,.04) 55%,transparent 78%);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 14%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 14%,transparent 100%)}',
    /* noćna obrada kao u ostalim blokovima; tamno nebo gore lijevo ispod naslova, duboko tamno dno ispod brojki, vinjeta */
    '#R .jpb-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.36}',
    '#R .jpb-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(0deg,rgba(6,11,22,.94) 0%,rgba(6,11,22,.8) 22%,rgba(6,11,22,.3) 40%,rgba(6,11,22,0) 56%),',
    'linear-gradient(90deg,rgba(6,11,22,.78) 0,rgba(6,11,22,.42) calc(var(--side) + 420px),rgba(6,11,22,0) calc(var(--side) + 720px)),',
    'linear-gradient(180deg,rgba(6,11,22,.4) 0%,rgba(6,11,22,0) 22%),radial-gradient(140% 100% at 60% 40%,transparent 56%,rgba(4,8,18,.5) 100%)}',

    '#R .jpb-body{position:relative;z-index:2;padding:clamp(56px,6vw,92px) var(--side) 0;max-width:calc(700px + var(--side))}',
    '#R .jpb-eye{display:flex;align-items:center;gap:14px;margin-bottom:22px;font:600 11px/1 var(--fd);letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.86)}',
    '#R .jpb-eye::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(48px,5.6vw,92px);font-weight:800;line-height:.93;letter-spacing:-.03em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jpb-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jpb-lead{margin-top:22px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:42ch;text-wrap:pretty}',

    /* BROJKE U SJEDIŠTIMA ŠESTOSJEDA: uže žičare preko kadra (crta ga skripta), o njemu vise četiri sjedišta; brojka je u
       staklenom naslonu sjedišta, natpis ispod */
    '#R .jpb-stats{position:relative;z-index:2;margin-top:clamp(40px,5vw,72px);padding:0 var(--side) clamp(44px,4.6vw,72px)}',
    '#R .jpb-cable{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:1}',
    '#R .jpb-wire{fill:none!important;stroke:rgba(255,255,255,.5);stroke-width:1.4;stroke-linecap:round}',
    '#R .jpb-wire2{fill:none!important;stroke:rgba(0,0,0,.35);stroke-width:1}',
    '#R .jpb-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(30px,4vw,48px) clamp(18px,2.4vw,40px)}',
    '#R .jpb-num{position:relative;display:flex!important;flex-direction:column;align-items:center;text-align:center}',
    '#R .jpb-chair{position:relative;z-index:2;width:min(100%,300px);aspect-ratio:300/250;container-type:inline-size;transform-origin:50% 1.6%}',
    '#R .jpb-chair svg{position:absolute;inset:0;width:100%;height:100%}',
    '#R .jpb-cl{fill:none!important;stroke:rgba(255,255,255,.62);stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
    '#R .jpb-cl2{fill:none!important;stroke:rgba(255,255,255,.3);stroke-width:1;stroke-linecap:round;vector-effect:non-scaling-stroke}',
    '#R .jpb-seat{fill:rgba(16,25,42,.72)!important;stroke:rgba(255,255,255,.62);stroke-width:1.3;vector-effect:non-scaling-stroke}',
    '#R .jpb-grip{fill:#0A1120!important;stroke:rgba(255,255,255,.8);stroke-width:1.3;vector-effect:non-scaling-stroke;transition:fill .5s,stroke .5s}',
    '#R .jpb-num.is-on .jpb-grip{fill:var(--accent-2)!important;stroke:#fff;filter:drop-shadow(0 0 5px rgba(0,185,242,.95))}',
    /* naslon = staklena ploča (kao paneli u hero-u); u njoj brojka */
    '#R .jpb-back{position:absolute;left:16%;top:32%;width:69.33%;height:39.2%;display:flex;align-items:center;justify-content:center;border-radius:clamp(10px,4.6cqw,16px);',
    'background:linear-gradient(180deg,rgba(26,38,62,.62),rgba(10,17,32,.72));-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);',
    'box-shadow:inset 0 0 0 1px rgba(255,255,255,.2),inset 0 1px 0 rgba(255,255,255,.16),0 14px 30px -14px rgba(0,0,0,.8)}',
    '#R .jpb-back::before{content:"";position:absolute;left:12%;right:12%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,185,242,.9),transparent);opacity:0;transition:opacity .6s ease .5s}',
    '#R .jpb-num.is-on .jpb-back::before,#R:not(.jpb-anim) .jpb-back::before{opacity:1}',
    '#R .jpb-v{display:flex;align-items:baseline;gap:.08em;font:800 clamp(40px,5.6vw,84px)/1 var(--fd);font-size:25cqw;letter-spacing:-.045em;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#R .jpb-v em{font-style:normal;font:700 .28em/1 var(--fd);letter-spacing:.02em;color:var(--accent-2)}',
    /* kolut cifre (odometar): 0–9 dva puta; --v = krajnji položaj (10 + cifra), u stanju mirovanja stoji na njemu */
    '#R .jpb-ds{display:inline-flex}',
    '#R .jpb-d{position:relative;display:inline-block;height:1em;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent)}',
    '#R .jpb-reel{display:flex;flex-direction:column;transform:translateY(calc(var(--v) * -5%))}',
    '#R .jpb-reel i{display:block;height:1em;margin:0;padding:0;line-height:1;font-style:normal!important;text-align:center;color:inherit!important}',
    '#R .jpb-l{display:block;margin-top:clamp(8px,1vw,14px);font:500 15.5px/1.35 var(--fb);color:#fff}',
    '#R .jpb-s{display:block;margin-top:5px;font:600 10px/1.3 var(--fd);letter-spacing:1.8px;text-transform:uppercase;color:var(--text-3)}',
    /* staze po težini: tanka traka u bojama oznaka staza (plava, crvena, crna sa svijetlim rubom) + legenda */
    '#R .jpb-mix{display:flex;gap:3px;width:min(100%,176px);height:4px;margin-top:11px}',
    '#R .jpb-mix i{display:block;flex:var(--k) 1 0;min-width:4px;border-radius:2px;background:var(--c);transform-origin:left center;transition:transform .5s,filter .3s}',
    '#R .jpb-mix i.jpb-mx--plave{box-shadow:0 0 8px rgba(59,130,246,.55)}',
    '#R .jpb-mix i.jpb-mx--crvene{box-shadow:0 0 8px rgba(239,68,68,.45)}',
    '#R .jpb-mix i.jpb-mx--crne,#R .jpb-key i.jpb-mx--crne{box-shadow:inset 0 0 0 1px rgba(255,255,255,.6)}',
    '#R .jpb-mix i:hover{filter:brightness(1.35)}',
    '#R .jpb-key{display:flex;justify-content:center;gap:10px;margin-top:9px;letter-spacing:1px;font-variant-numeric:tabular-nums}',
    '#R .jpb-key span{display:inline-flex;align-items:center;gap:5px}',
    '#R .jpb-key i{display:block;width:7px;height:7px;border-radius:50%;background:var(--c)}',
    /* sjedišta se blago njišu kao na vjetru (samo dok je blok na ekranu); prelaz mišem ih zaljulja */
    '#R .jpb-sw,#R .jpb-hit{position:absolute;inset:0;transform-origin:50% 1.6%}',
    '#R.jpb-vis .jpb-num.is-on .jpb-sw,#R.jpb-vis:not(.jpb-anim) .jpb-sw{animation:jpbSway var(--sw,5.6s) ease-in-out var(--swd,0s) infinite}',
    '@keyframes jpbSway{0%,100%{transform:rotate(-.6deg)}50%{transform:rotate(.6deg)}}',
    '#R .jpb-num.is-hit .jpb-hit{animation:jpbHit 1.6s cubic-bezier(.3,.6,.3,1)}',
    '@keyframes jpbHit{0%{transform:none}18%{transform:rotate(3.4deg)}42%{transform:rotate(-2.2deg)}66%{transform:rotate(1deg)}84%{transform:rotate(-.35deg)}100%{transform:none}}',
    '#R .jpb-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',

    /* tih link ispod naslova (samo ako je zadan) */
    '#R .jpb-foot{margin-top:22px}',
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
    '#R.jpb-anim.jpb-on .jpb-lamp{opacity:1;transition:opacity 1.4s cubic-bezier(.3,0,.2,1) 1.1s}',
    '#R.jpb-anim.jpb-on .jpb-beam{opacity:1;transition:opacity 1.8s ease 1.4s}',
    '#R.jpb-anim .jpb-up{opacity:0;transform:translateY(20px)}',
    '#R.jpb-anim.jpb-on .jpb-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jpb-anim .jpb-eye::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jpb-anim.jpb-on .jpb-eye::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* uže se iscrta, pa sjedišta jedno za drugim doklize po užetu i zaljuljaju se kad stanu; brojka u naslonu se zavrti */
    '#R.jpb-anim .jpb-wire,#R.jpb-anim .jpb-wire2{stroke-dasharray:1;stroke-dashoffset:1}',
    '#R.jpb-anim.jpb-on .jpb-wire,#R.jpb-anim.jpb-on .jpb-wire2{stroke-dashoffset:0;transition:stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1) .7s}',
    '#R.jpb-anim .jpb-num:not(.is-on) .jpb-chair{opacity:0}',
    '#R.jpb-anim .jpb-num.is-on .jpb-chair{animation:jpbRide 2s cubic-bezier(.22,.7,.25,1) both}',
    '#R.jpb-anim .jpb-num:not(.is-on) .jpb-mix i{transform:scaleX(0)}',
    '#R.jpb-anim .jpb-num.is-on .jpb-mix i{transition:transform .7s cubic-bezier(.2,.7,.2,1) calc(1.1s + var(--d,0s)),filter .3s}',
    '@keyframes jpbRide{0%{opacity:0;transform:translateX(-160px)}12%{opacity:1}48%{transform:translateX(0) rotate(0)}64%{transform:rotate(2.6deg)}79%{transform:rotate(-1.5deg)}91%{transform:rotate(.5deg)}100%{opacity:1;transform:none}}',
    '#R.jpb-anim .jpb-num:not(.is-on) .jpb-reel{transform:none}',
    '#R.jpb-anim .jpb-reel{transition:transform var(--t,1.6s) cubic-bezier(.16,.8,.22,1) .75s}',
    '#R.jpb-anim .jpb-num .jpb-l,#R.jpb-anim .jpb-num .jpb-s,#R.jpb-anim .jpb-num .jpb-v em{opacity:0;transform:translateY(8px);transition:opacity .6s ease 1s,transform .8s cubic-bezier(.2,.7,.2,1) 1s}',
    '#R.jpb-anim .jpb-num.is-on .jpb-l,#R.jpb-anim .jpb-num.is-on .jpb-s,#R.jpb-anim .jpb-num.is-on .jpb-v em{opacity:1;transform:none}',

    /* manji laptop */
    '@media (max-width:1180px){#R .jpb-l{font-size:14.5px}}',
    /* tablet: fotografija gore, naslov i brojke ispod (red od 4) */
    '@media (max-width:980px){',
    '#R .jpb-frame{--mh:min(60vw,500px);justify-content:flex-start;min-height:0}',
    '#R .jpb-bg{position:relative;inset:auto;height:var(--mh);flex-shrink:0;-webkit-mask-image:linear-gradient(180deg,#000 72%,transparent 100%);mask-image:linear-gradient(180deg,#000 72%,transparent 100%)}',
    '#R .jpb-ph img{object-position:var(--mpos,62% 50%)}',
    '#R .jpb-scrim{background:linear-gradient(0deg,rgba(6,11,22,.62) 0%,rgba(6,11,22,0) 42%),linear-gradient(180deg,rgba(6,11,22,.3) 0%,rgba(6,11,22,0) 22%)}',
    '#R .jpb-body{padding:clamp(14px,3vw,28px) clamp(22px,6vw,56px) 0;max-width:none}',
    '#R h2{font-size:clamp(42px,7.4vw,64px)}',
    '#R .jpb-lead{max-width:56ch}',
    '#R .jpb-stats{margin-top:clamp(36px,6vw,52px);padding:0 clamp(22px,6vw,56px) clamp(38px,6vw,56px)}',
    '#R .jpb-l{font-size:14px}',
    '#R .jpb-s{font-size:9px;letter-spacing:1.4px}}',
    /* telefon: dva reda po dva sjedišta, svaki red na svom užetu */
    '@media (max-width:760px){',
    '#R .jpb-frame{--mh:min(96vw,420px);border-radius:24px}',
    '#R .jpb-ph img{object-position:66% 62%}',
    '#R .jpb-body{padding:10px 20px 0}',
    '#R .jpb-eye{gap:10px;margin-bottom:16px;font-size:10px;letter-spacing:3px}',
    '#R .jpb-eye::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.4vw,54px)}',
    '#R .jpb-lead{margin-top:16px}',
    '#R .jpb-stats{margin-top:34px;padding:0 16px 34px}',
    '#R .jpb-nums{grid-template-columns:1fr 1fr;gap:34px 14px}',
    '#R .jpb-l{font-size:13.5px}',
    '#R .jpb-s{font-size:8.5px;letter-spacing:1.2px}}',
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
  // sjedište šestosjeda iz profila (žičara ide slijeva nadesno, putnici gledaju nadesno): hvataljka na užetu, nosač se
  // povija unazad do naslona (lijevo), klupa ide naprijed, sigurnosna šipka se spušta preko sa prednje strane i završava
  // osloncem za noge. Brojka je u staklenoj ploči u prostoru sjedišta, okrenuta prema posjetiocu (HTML, x 48–256, y 80–178)
  var CHAIR = (function () {
    var o = '<path class="jpb-cl" d="M150 12 V28 C150 44 128 50 96 52 L54 56 Q36 58 34 74"/>';
    o += '<path class="jpb-cl" d="M44 64 Q250 56 262 104 V214 H220 V207"/>';
    o += '<rect class="jpb-seat" x="26" y="70" width="14" height="122" rx="7" transform="rotate(-5 33 131)"/>';
    o += '<rect class="jpb-seat" x="30" y="186" width="222" height="14" rx="7"/>';
    o += '<path class="jpb-cl2" d="M40 200 Q60 216 96 209"/>';
    for (var k = 1; k < 6; k++) { var x = f1(30 + 222 * k / 6); o += '<path class="jpb-cl2" d="M' + x + ' 189 V197"/>'; }
    o += '<rect class="jpb-grip" x="139" y="-2" width="22" height="14" rx="4"/>';
    return '<svg viewBox="0 0 300 250" aria-hidden="true" focusable="false">' + o + '</svg>';
  })();
  function numsHTML() {
    return KEYS.map(function (k) {
      var t = T[k], n = NUM[k];
      return '<li class="jpb-num"><div class="jpb-chair"><div class="jpb-sw"><div class="jpb-hit">' + CHAIR +
        '<div class="jpb-back"><div class="jpb-v">' + reels(n, 0) + (t.u ? '<em aria-hidden="true">' + esc(t.u) + '</em>' : '') +
          '<span class="jpb-sr">' + esc(fmt(n) + (t.u ? ' ' + t.u : '')) + '</span></div></div></div></div></div>' +
        '<span class="jpb-l">' + esc(t.l) + '</span>' + (k === 'km' && mixHTML() || '<span class="jpb-s">' + esc(t.s) + '</span>') + '</li>';
    }).join('');
  }
  // traka staza po težini ispod km (plave · crvene · crne) + legenda sa kilometrima
  function mixHTML() {
    var ks = MIXK.filter(function (k) { return +MIX[k] > 0; });
    if (ks.length < 2) return '';
    var sr = ks.map(function (k) { return T.mix[k] + ' ' + MIX[k] + ' km'; }).join(', ');
    return '<span class="jpb-mix" role="img" aria-label="' + esc(T.mixT + ': ' + sr) + '">' + ks.map(function (k, i) {
      return '<i class="jpb-mx--' + k + '" style="--k:' + +MIX[k] + ';--c:' + MIXC[k] + ';--d:' + (i * .14).toFixed(2) + 's" title="' + esc(T.mix[k] + ' ' + MIX[k] + ' km') + '"></i>';
    }).join('') + '</span><span class="jpb-s jpb-key" aria-hidden="true">' + ks.map(function (k) {
      return '<span><i class="jpb-mx--' + k + '" style="--c:' + MIXC[k] + '"></i>' + esc(MIX[k]) + '</span>';
    }).join('') + '<span>km</span></span>';
  }
  root.innerHTML =
    '<section class="jpb-wrap" aria-labelledby="jpb-h"><div class="jpb-frame" style="--pos:50% 34%;--lum:.98">' +
      '<div class="jpb-bg"><div class="jpb-ph">' +
        '<img src="' + esc(IMG.main) + '" srcset="' + esc(IMG.mainS) + ' 1000w, ' + esc(IMG.main) + ' 2000w" sizes="100vw" alt="' + esc(T.photo) + '" decoding="async">' +
        '<span class="jpb-beam"></span><span class="jpb-lamp"></span>' +
      '</div><span class="jpb-tint"></span><span class="jpb-scrim"></span></div>' +
      '<div class="jpb-body">' +
        '<div class="jpb-eye jpb-up" style="--d:.26s">' + esc(T.eyebrow) + '</div>' +
        '<h2 id="jpb-h"><span class="jpb-up" style="--d:.36s">' + esc(T.h[0]) + '</span><span class="jpb-o jpb-up" style="--d:.46s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jpb-lead jpb-up" style="--d:.58s">' + esc(T.lead) + '</p>' +
        (LINK ? '<div class="jpb-foot jpb-up" style="--d:.7s"><a class="jpb-link" href="' + esc(LINK) + '" data-jpb="link">' + esc(LINKT) + ' ' + ARROW + '</a></div>' : '') +
      '</div>' +
      '<div class="jpb-stats"><svg class="jpb-cable" aria-hidden="true" focusable="false"></svg><ul class="jpb-nums"></ul></div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  var frame = q('.jpb-frame'), ph = q('.jpb-ph'), img = q('.jpb-ph img');

  var drawn = '', lit = -1;   // lit = koliko je sjedišta stiglo po užetu (-1 = nijedno)
  function render() {
    var key = KEYS.map(function (k) { return NUM[k]; }).concat(MIXK.map(function (k) { return MIX[k]; })).join('|');
    if (key === drawn) return;
    drawn = key;
    q('.jpb-nums').innerHTML = numsHTML();
    light(lit);
    cable();
  }

  /* ---------- UŽE ŽIČARE: prolazi kroz hvataljke sjedišta; svaki red sjedišta ima svoje uže (telefon: dva reda) ---------- */
  var stats = q('.jpb-stats'), svgEl = q('.jpb-cable');
  function cable() {
    var lis = [].slice.call(root.querySelectorAll('.jpb-num'));
    if (!lis.length || !stats.offsetWidth) return;
    var sr = stats.getBoundingClientRect(), W = stats.offsetWidth, H = stats.offsetHeight, rows = [], o = '';
    // hvataljke (sredina gornjeg dijela) po redovima; mjeri se bez transformacija (sjedište koje upravo klizi ili se ljulja)
    lis.forEach(function (li) {
      var ch = li.querySelector('.jpb-chair'), cw = ch.offsetWidth;
      var x = li.offsetLeft + ch.offsetLeft + cw / 2, y = li.offsetTop + ch.offsetTop + cw * (5 / 300);
      var row = rows.filter(function (r) { return Math.abs(r.y - y) < 6; })[0];
      if (!row) rows.push(row = { y: y, xs: [] });
      row.xs.push(x);
    });
    var L = (sr.left - root.querySelector('.jpb-frame').getBoundingClientRect().left) + 30;
    rows.forEach(function (r) {
      // uže dolazi sa lijeve ivice kadra (malo više), lagano visi između sjedišta i odlazi preko desne ivice
      var pts = [[-L, r.y - 10]].concat(r.xs.map(function (x) { return [x, r.y]; }), [[W + L, r.y - 10]]), d = '', d2 = '';
      pts.forEach(function (p, i) {
        if (!i) { d = 'M' + f1(p[0]) + ' ' + f1(p[1]); d2 = 'M' + f1(p[0]) + ' ' + f1(p[1] + 2); return; }
        var a = pts[i - 1], sag = Math.min(9, (p[0] - a[0]) * .025), cx = (a[0] + p[0]) / 2, cy = (a[1] + p[1]) / 2 + sag * 2;
        d += ' Q' + f1(cx) + ' ' + f1(cy) + ' ' + f1(p[0]) + ' ' + f1(p[1]);
        d2 += ' Q' + f1(cx) + ' ' + f1(cy + 2) + ' ' + f1(p[0]) + ' ' + f1(p[1] + 2);
      });
      o += '<path class="jpb-wire2" pathLength="1" d="' + d2 + '"/><path class="jpb-wire" pathLength="1" d="' + d + '"/>';
    });
    svgEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svgEl.innerHTML = o;
  }
  // upali sjedišta (dođu po užetu) do k
  function light(k) {
    lit = Math.max(lit, k);
    [].forEach.call(root.querySelectorAll('.jpb-num'), function (li, i) {
      li.classList.toggle('is-on', i <= lit);
      li.style.setProperty('--sw', (5.2 + i * .9).toFixed(1) + 's'); li.style.setProperty('--swd', (-i * 1.7).toFixed(1) + 's');
    });
  }
  // sjedišta stižu jedno za drugim
  function ride() {
    KEYS.forEach(function (k, i) { setTimeout(function () { light(i); }, i * 340); });
  }
  function now() { return w.performance && performance.now ? performance.now() : Date.now(); }
  render();

  // prelaz mišem preko sjedišta: zaljulja se, a brojka se još jednom zavrti
  root.addEventListener('pointerover', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse' || reduced) return;
    var li = e.target.closest && e.target.closest('.jpb-num.is-on');
    if (!li || li.classList.contains('is-hit') || (e.relatedTarget && li.contains(e.relatedTarget))) return;
    li.classList.add('is-hit');
    [].forEach.call(li.querySelectorAll('.jpb-reel'), function (r) {
      r.style.transition = 'none'; r.style.transform = 'translateY(0)'; void r.offsetWidth;
      r.style.transition = 'transform ' + (r.style.getPropertyValue('--t') || '1.4s') + ' cubic-bezier(.16,.8,.22,1)'; r.style.transform = '';
    });
  });
  root.addEventListener('animationend', function (e) {
    if (e.animationName === 'jpbHit') { var li = e.target.closest('.jpb-num'); if (li) li.classList.remove('is-hit'); }
  });

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
    cable();
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
  var MRX = {
    plave: /(\d{1,2})\s*(?:km|kilometar[a-z]*|kilometr[a-z]*)\s+(?:plav[a-z]*|lak[a-z]*|blue|easy)|(?:plav[a-z]*|lak[a-z]*|blue|easy)\s*(?:staz[a-z]*|slopes?|runs?)?\s*:?\s*(\d{1,2})\s*km/i,
    crvene: /(\d{1,2})\s*(?:km|kilometar[a-z]*|kilometr[a-z]*)\s+(?:crven[a-z]*|srednj[a-z]*|red|intermediate)|(?:crven[a-z]*|srednj[a-z]*|red|intermediate)\s*(?:staz[a-z]*|slopes?|runs?)?\s*:?\s*(\d{1,2})\s*km/i,
    crne: /(\d{1,2})\s*(?:km|kilometar[a-z]*|kilometr[a-z]*)\s+(?:crn[a-z]*|tešk[a-z]*|black|difficult)|(?:crn[a-z]*|tešk[a-z]*|black|difficult)\s*(?:staz[a-z]*|slopes?|runs?)?\s*:?\s*(\d{1,2})\s*km/i
  };
  function parse(pg) {
    var t = text(pg), r = {};
    MIXK.forEach(function (k) { var m = t.match(MRX[k]); if (m && +(m[1] || m[2]) > 0) r[k] = String(+(m[1] || m[2])); });
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
    MIXK.forEach(function (k) { if (!FIX[k] && r[k]) MIX[k] = r[k]; });
    if (!MIXK.some(function (k) { return FIX[k] || r[k]; })) miss.push(T.mixT.toLowerCase() + ' (privremeno skiresort.info)');
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

  // ulazak jednom, kad brojke dođu u vidno polje: kadar, naslov, uže se iscrta, pa sjedišta doklize jedno za drugim.
  // Bez IntersectionObservera ili uz smanjeno kretanje sve je odmah upaljeno.
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jpb-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        void root.offsetWidth;
        root.classList.add('jpb-on');
        setTimeout(ride, 1300);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(stats);
  } else light(KEYS.length - 1);
  // njihanje samo dok je blok na ekranu
  if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { root.classList.toggle('jpb-vis', es[es.length - 1].isIntersecting); }).observe(stats);
  else root.classList.add('jpb-vis');
})(window, document);
