/* Interaktivna mapa staza — Olimpijska planina Jahorina
   Ugradnja: <div id="jm-mapa"></div> + ovaj fajl. Podaci (podaci/mapa.json) i slike (slike/) se čitaju
   pored ovog fajla (ili iz data-base). Jezik: /en/ adrese = engleski, ili data-lang="sr|en".
   Podatke pravi alati/napravi-podatke.py iz PSD-a mape. Prefiks klasa: jm-. */
(function () {
  'use strict';
  var SRC = (document.currentScript && document.currentScript.src) || '';
  var root = document.getElementById('jm-mapa');
  if (!root || root.getAttribute('data-jm')) return;
  root.setAttribute('data-jm', '1');
  var BASE = root.getAttribute('data-base') || SRC.replace(/[^\/]*(\?.*)?$/, '');
  var EN = (root.getAttribute('data-lang') || (/^\/en(\/|$)/.test(location.pathname) ? 'en' : 'sr')) === 'en';

  /* ---------- tekstovi ---------- */
  var T = EN ? {
    kicker: 'Piste map', h1: 'Ski runs of', h2: 'Jahorina',
    lead: '25 runs, link runs and 14 lifts of the Jahorina ski resort on one map. Tap a run or a lift for details, switch on night view to see the floodlit runs.',
    laka: 'Easy', srednja: 'Intermediate', teska: 'Difficult', zicare: 'Lifts', usluge: 'Services', noc: 'Night skiing',
    run: 'Run', lift: 'Lift', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Whole map', full: 'Full screen', fullOff: 'Close full screen',
    close: 'Close', hintWheel: 'Hold Ctrl and scroll to zoom', hintTouch: 'Swipe sideways to move · pinch to zoom',
    help: 'Drag to move · Ctrl + scroll to zoom · Click a run for details', helpTouch: 'Swipe sideways · pinch to zoom · full screen for more room',
    lit: 'Floodlit for night skiing', fis: 'FIS homologated', upper: 'Upper part difficult, lower part intermediate',
    gore: 'Lift to the top', dole: 'At the bottom', od: 'Branches off run', u: 'Joins run', fromTop: 'Runs from the top',
    ride: 'ride', listLifts: 'Lifts', listRuns: 'Runs', mapLabel: 'Interactive piste map of Jahorina. Use the lists below the map to pick a run or a lift.',
    tip: { gondola: 'Gondola', sestosjed: 'Six-seater chairlift', dvosjed: 'Double chairlift', tanjir: 'Platter lift', sidro: 'T-bar lift' },
    lvl: { laka: 'Easy run', srednja: 'Intermediate run', teska: 'Difficult run' },
    poi: { skikasa: 'Ski pass sales', karte24: 'Ski pass sales 24/7', parking: 'Parking', restoran: 'Restaurant', bar: 'Olimp bar',
      hotel: 'Hotel', smjestaj: 'Resort accommodation', skola: 'Ski school booking', poligon: 'Ski practice area', snowboard: 'Snowboard park',
      sankaliste: 'Sledding area', gondola: 'Poljice gondola', rent: 'Ski rental', wc: 'Toilets', gss: 'Mountain rescue',
      hitna: 'Medical station', policija: 'Police', snowfactory: 'Snow factory', uprava: 'Administration', snowboardpark: 'Snowboard park',
      skibike: 'Ski bike', sanke: 'Snowmobile trail', pjesacka: 'Walking trail', pasarela: 'Footbridge' },
    info: { gondola: ['Ski pass office', 'Ski storage', 'Currency exchange', 'Souvenir shop', 'Ski pass sales 24/7', 'Ski school booking', 'Toilets'],
      bar: ['Restaurant', 'Outdoor bar', 'Souvenir shop', 'Reservoir lake'],
      poligon: ['Practice slope', 'Magic carpet', 'Tubing', 'Kids playground', 'Ski school booking', 'Practice area ticket office'] },
    here: 'On site', snow: 'Snowmaking', fisOn: 'FIS',
    peak: 'Ogorjelica', and: ', ', km: 'm'
  } : {
    kicker: 'Ski mapa', h1: 'Mapa staza', h2: 'Jahorine',
    lead: '25 staza, vezne staze i 14 žičara ski centra Jahorina na jednoj mapi. Dodirni stazu ili žičaru za detalje, a noćni prikaz pokazuje osvijetljene staze.',
    laka: 'Lake', srednja: 'Srednje', teska: 'Teške', zicare: 'Žičare', usluge: 'Usluge', noc: 'Noćno skijanje',
    run: 'Staza', lift: 'Žičara', zoomIn: 'Uvećaj', zoomOut: 'Umanji', reset: 'Cijela mapa', full: 'Cijeli ekran', fullOff: 'Zatvori cijeli ekran',
    close: 'Zatvori', hintWheel: 'Drži Ctrl i skroluj za zum', hintTouch: 'Prevuci lijevo-desno · dva prsta za zum',
    help: 'Prevuci za pomjeranje · Ctrl + točkić za zum · klik na stazu za detalje', helpTouch: 'Prevuci lijevo-desno · dva prsta za zum · cijeli ekran za više prostora',
    lit: 'Osvijetljena za noćno skijanje', fis: 'FIS homologovana', upper: 'Gornji dio težak, donji srednje težak',
    gore: 'Žičara do vrha', dole: 'Na dnu', od: 'Odvaja se od staze', u: 'Spaja se sa stazom', fromTop: 'Staze sa vrha',
    ride: 'vožnje', listLifts: 'Žičare', listRuns: 'Staze', mapLabel: 'Interaktivna mapa staza Jahorine. Stazu ili žičaru možeš izabrati i iz popisa ispod mape.',
    tip: { gondola: 'Gondola', sestosjed: 'Šestosjed', dvosjed: 'Dvosjed', tanjir: 'Ski lift tanjir', sidro: 'Ski lift sidro' },
    lvl: { laka: 'Laka staza', srednja: 'Srednje teška staza', teska: 'Teška staza' },
    poi: { skikasa: 'Prodaja ski karata', karte24: 'Prodaja ski karata 0–24', parking: 'Parking', restoran: 'Restoran', bar: 'Olimp bar',
      hotel: 'Hotel', smjestaj: 'Smještaj ski centra', skola: 'Booking ski škole', poligon: 'Ski poligon', snowboard: 'Snowboard poligon',
      sankaliste: 'Sankalište', gondola: 'Gondola Poljice', rent: 'Ski renta', wc: 'Toalet', gss: 'Gorska služba spasavanja Jahorina',
      hitna: 'Ambulanta', policija: 'Policija', snowfactory: 'Snow factory', uprava: 'Uprava', snowboardpark: 'Snowboard park',
      skibike: 'Ski bike', sanke: 'Staza za ski sanke', pjesacka: 'Pješačka staza', pasarela: 'Pasarela' },
    info: { gondola: ['Ski kasa', 'Ski depo', 'Mjenjačnica', 'Suvenirnica', 'Prodaja ski karata 0–24', 'Booking ski škole', 'Toalet'],
      bar: ['Restoran', 'Vanjski šank', 'Suvenirnica', 'Akumulaciono jezero'],
      poligon: ['Ski staza', 'Pokretna traka', 'Tjubing', 'Dječije igralište', 'Booking ski škole', 'Ski kasa za poligon'] },
    here: 'Ovdje', snow: 'Osnježavanje', fisOn: 'FIS',
    peak: 'Ogorjelica', and: ', ', km: 'm'
  };
  var NAZ_TEZ = { laka: EN ? 'easy' : 'laka', srednja: EN ? 'intermediate' : 'srednja', teska: EN ? 'difficult' : 'teška' };

  /* ---------- fontovi (jednom za sve sekcije) ---------- */
  var hasFonts = [].some.call(document.querySelectorAll('link[rel=stylesheet]'), function (l) {
    return /family=Archivo/.test(l.href) && /family=Barlow/.test(l.href);
  });
  if (!hasFonts) {
    var lf = document.createElement('link'); lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(lf);
  }

  /* ---------- CSS ---------- */
  var css = '' +
  '#jm-mapa{--bg:#0A1120;--surface:#111A2C;--surface-2:#16213A;--line:rgba(255,255,255,.08);--text:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);' +
  '--accent:#00B9F2;--accent-2:#2CCBF8;--ice:#C4EEFF;--warm:#FFD27A;--c-laka:#1E8FE6;--c-srednja:#E3343C;--c-teska:#121722;' +
  '--fd:"Archivo",system-ui,sans-serif;--fb:"Barlow",system-ui,sans-serif;' +
  'position:relative;background:var(--bg);color:var(--text);font-family:var(--fb);padding:clamp(56px,7vw,100px) clamp(16px,4vw,48px);box-sizing:border-box;overflow:hidden}' +
  '#jm-mapa *,#jm-mapa *::before,#jm-mapa *::after{box-sizing:border-box}' +
  '#jm-mapa .jm-in{max-width:1480px;margin:0 auto;display:flex;flex-direction:column;gap:22px}' +
  '#jm-mapa .jm-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:18px 48px;align-items:end}' +
  '#jm-mapa .jm-kicker{font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:14px;margin:0 0 18px}' +
  '#jm-mapa .jm-kicker::before{content:"";width:34px;height:1.5px;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 8px rgba(0,185,242,.6)}' +
  '#jm-mapa h2.jm-title{font:800 clamp(32px,4.2vw,56px)/1.02 var(--fd)!important;letter-spacing:-1px!important;color:#fff!important;margin:0!important;padding:0!important;text-transform:none!important;text-wrap:balance}' +
  '#jm-mapa h2.jm-title span{display:block}' +
  '#jm-mapa h2.jm-title .jm-o{color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.92)}' +
  '#jm-mapa .jm-lead{font:400 17px/1.55 var(--fb);color:var(--text-2);margin:0;max-width:60ch}' +
  /* traka filtera */
  '#jm-mapa .jm-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}' +
  '#jm-mapa .jm-chips{display:flex;flex-wrap:wrap;gap:8px}' +
  '#jm-mapa .jm-chip,#jm-mapa .jm-nt,#jm-mapa .jm-ctl,#jm-mapa .jm-x,#jm-mapa .jm-li,#jm-mapa .jm-rc{all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
  '#jm-mapa .jm-chip{display:inline-flex;align-items:center;gap:9px;min-height:44px;padding:0 16px 0 13px;border-radius:40px;font:600 12px/1 var(--fd)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--text-2)!important;' +
  'background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);transition:color .2s,box-shadow .2s,opacity .2s}' +
  '#jm-mapa .jm-chip .jm-sw{width:18px;height:4px;border-radius:2px;background:var(--sw,currentColor)}' +
  '#jm-mapa .jm-chip[aria-pressed=true]{color:#fff!important;box-shadow:inset 0 0 0 1px rgba(0,185,242,.55),0 0 14px rgba(0,185,242,.12)}' +
  '#jm-mapa .jm-chip[aria-pressed=false]{opacity:.55}' +
  '#jm-mapa .jm-chip[aria-pressed=false] .jm-sw{background:transparent!important;box-shadow:inset 0 0 0 1.5px currentColor!important}' +
  '#jm-mapa .jm-chip b{font:700 12px/1 var(--fd);color:var(--text-3);letter-spacing:0}' +
  '#jm-mapa .jm-nt{display:inline-flex;align-items:center;gap:12px;min-height:44px;padding:0 8px 0 16px;border-radius:40px;font:600 12px/1 var(--fd)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--text-2)!important;' +
  'background:linear-gradient(180deg,rgba(18,27,45,.78),rgba(9,14,26,.88));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}' +
  '#jm-mapa .jm-nt i{position:relative;width:46px;height:28px;border-radius:20px;background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);transition:background .25s}' +
  '#jm-mapa .jm-nt i::after{content:"";position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;background:#dfe9f5;transition:transform .25s,background .25s,box-shadow .25s}' +
  '#jm-mapa .jm-nt[aria-checked=true]{color:#fff!important}' +
  '#jm-mapa .jm-nt[aria-checked=true] i{background:rgba(255,210,122,.22)}' +
  '#jm-mapa .jm-nt[aria-checked=true] i::after{transform:translateX(18px);background:var(--warm);box-shadow:0 0 12px rgba(255,210,122,.7)}' +
  /* okvir mape */
  '#jm-mapa .jm-frame{position:relative;border-radius:28px;overflow:hidden;background:#0c1424;height:clamp(420px,62vw,860px);max-height:82vh;' +
  'box-shadow:6px 6px 16px rgba(0,0,0,.55),-5px -5px 14px rgba(60,84,128,.14),inset 0 0 0 1px var(--line);isolation:isolate}' +
  '#jm-mapa .jm-view{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:pan-y;outline:none;user-select:none;-webkit-user-select:none}' +
  '#jm-mapa .jm-view.jm-drag{cursor:grabbing}' +
  '#jm-mapa .jm-view:focus-visible{box-shadow:inset 0 0 0 2px var(--accent)}' +
  '#jm-mapa .jm-world{position:absolute;left:0;top:0;width:3543px;height:1996px;transform-origin:0 0;--inv:1;--lw:1;--ms:1}' +
  '#jm-mapa .jm-world.jm-moving{will-change:transform}' +
  '#jm-mapa .jm-img{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;display:block;pointer-events:none}' +
  '#jm-mapa .jm-img-n{opacity:0;transition:opacity .6s ease}' +
  '#jm-mapa.jm-night .jm-img-n{opacity:1}' +
  '#jm-mapa svg.jm-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}' +
  '#jm-mapa .jm-svg path,#jm-mapa .jm-svg line{fill:none;stroke-linecap:round;stroke-linejoin:round}' +
  '#jm-mapa .jm-gr{stroke:#F2C14E;stroke-width:calc(var(--lw)*2.2px);stroke-dasharray:0 calc(var(--lw)*7px);opacity:.75}' +
  '#jm-mapa .jm-pj{stroke:#7DB86A;stroke-width:calc(var(--lw)*1.6px);stroke-dasharray:0 calc(var(--lw)*4.5px);opacity:.7}' +
  '#jm-mapa .jm-ve{stroke-width:calc(var(--lw)*3.2px);stroke-dasharray:0 calc(var(--lw)*7.5px)}' +
  '#jm-mapa .jm-ve-k{stroke:#fff;stroke-width:calc(var(--lw)*5.6px);stroke-dasharray:0 calc(var(--lw)*7.5px);opacity:.75}' +
  '#jm-mapa .t-laka{stroke:var(--c-laka)}#jm-mapa .t-srednja{stroke:var(--c-srednja)}#jm-mapa .t-teska{stroke:var(--c-teska)}' +
  '#jm-mapa .jm-cas{stroke:#fff;stroke-width:calc(var(--lw)*7px);opacity:.82}' +
  '#jm-mapa .jm-ln{stroke-width:calc(var(--lw)*3.6px)}' +
  '#jm-mapa .jm-hit{stroke:transparent;stroke-width:calc(var(--inv)*26px);pointer-events:stroke;cursor:pointer}' +
  '#jm-mapa .jm-p,#jm-mapa .jm-l,#jm-mapa .jm-ves,#jm-mapa .jm-un{transition:opacity .25s}' +
  '#jm-mapa .jm-glow{stroke:#fff;stroke-width:calc(var(--lw)*15px);opacity:0;transition:opacity .25s}' +
  '#jm-mapa .jm-p.on .jm-glow{opacity:.55}' +
  '#jm-mapa .jm-p.on .jm-ln{stroke-width:calc(var(--lw)*5.2px)}' +
  '#jm-mapa .jm-p.hov .jm-ln{stroke-width:calc(var(--lw)*5px)}' +
  '#jm-mapa .jm-p.hov .jm-cas{stroke-width:calc(var(--lw)*9.5px)}' +
  '#jm-mapa.jm-sel .jm-p:not(.on),#jm-mapa.jm-sel .jm-ves,#jm-mapa.jm-sel .jm-un{opacity:.22}' +
  '#jm-mapa.jm-sel .jm-l:not(.on){opacity:.3}' +
  '#jm-mapa .jm-lc{stroke:#fff;stroke-width:calc(var(--lw)*4.6px);opacity:.6}' +
  '#jm-mapa .jm-ll{stroke:#0B1222;stroke-width:calc(var(--lw)*2.2px)}' +
  '#jm-mapa .jm-le{fill:#0B1222;stroke:#fff;stroke-width:calc(var(--lw)*1.6px)}' +
  '#jm-mapa .jm-l.on .jm-ll{stroke:var(--accent);stroke-width:calc(var(--lw)*3.4px)}' +
  '#jm-mapa .jm-l.on .jm-le{fill:var(--accent)}' +
  '#jm-mapa .jm-lh{stroke-width:calc(var(--inv)*20px)}' +
  /* noć */
  '#jm-mapa .jm-nl{stroke:var(--warm);opacity:0;transition:opacity .6s}' +
  '#jm-mapa .jm-nl-a{stroke-width:calc(var(--lw)*30px)}#jm-mapa .jm-nl-b{stroke-width:calc(var(--lw)*11px)}' +
  '#jm-mapa.jm-night .jm-nl-a{opacity:.13}#jm-mapa.jm-night .jm-nl-b{opacity:.24}' +
  '#jm-mapa.jm-night .jm-p:not(.lit),#jm-mapa.jm-night .jm-ves,#jm-mapa.jm-night .jm-un{opacity:.32}' +
  '#jm-mapa.jm-night .jm-p.lit .jm-cas{stroke:var(--warm);opacity:.9}' +
  '#jm-mapa.jm-night .jm-ll{stroke:#E4F1FF}#jm-mapa.jm-night .jm-lc{stroke:#0B1222;opacity:.7}#jm-mapa.jm-night .jm-le{fill:#E4F1FF;stroke:#0B1222}' +
  '#jm-mapa.jm-night.jm-sel .jm-p:not(.on){opacity:.18}' +
  '#jm-mapa.jm-night .jm-gr{opacity:.45}' +
  /* skriveni slojevi */
  '#jm-mapa.f-laka .t-p-laka,#jm-mapa.f-srednja .t-p-srednja,#jm-mapa.f-teska .t-p-teska{display:none}' +
  '#jm-mapa.f-laka .jm-ve.t-laka,#jm-mapa.f-laka .jm-ve-k.t-laka,#jm-mapa.f-srednja .jm-ve.t-srednja,#jm-mapa.f-srednja .jm-ve-k.t-srednja,#jm-mapa.f-teska .jm-ve.t-teska,#jm-mapa.f-teska .jm-ve-k.t-teska{display:none}' +
  '#jm-mapa.f-laka .jm-rb.t-laka,#jm-mapa.f-srednja .jm-rb.t-srednja,#jm-mapa.f-teska .jm-rb.t-teska{display:none}' +
  '#jm-mapa.f-zicare .jm-l,#jm-mapa.f-zicare .jm-world .jm-lb,#jm-mapa.f-zicare .jm-lh{display:none}' +
  '#jm-mapa.f-usluge .jm-poi,#jm-mapa.f-usluge .jm-sks,#jm-mapa.f-usluge .jm-nat{display:none}#jm-mapa.f-topovi .jm-top{display:none}' +
  '#jm-mapa .jm-skc{stroke:rgba(11,18,34,.35);stroke-width:calc(var(--lw)*6px)}#jm-mapa .jm-sk{stroke:#fff;stroke-width:calc(var(--lw)*3.4px)}' +
  '#jm-mapa .jm-top{width:18px;height:18px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s,visibility .25s}#jm-mapa .jm-top svg{width:18px;height:18px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}' +
  '#jm-mapa .jm-fis{padding:3px 5px;border-radius:5px;background:#fff;box-shadow:0 0 0 1.2px #E3343C,0 2px 4px rgba(0,0,0,.25);font:800 9px/1 var(--fd);letter-spacing:.5px;color:#1E8FE6;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s,visibility .25s}#jm-mapa .jm-fis i{font-style:normal;color:#E3343C}' +
  '#jm-mapa .jm-nat{font:600 11px/1.15 var(--fd);letter-spacing:.6px;color:#0B3550;text-shadow:0 0 3px #fff,0 0 6px #fff;white-space:nowrap;pointer-events:none;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}' +
  '#jm-mapa.jm-z2 .jm-top,#jm-mapa.jm-z2 .jm-fis,#jm-mapa.jm-z2 .jm-nat{opacity:1;visibility:visible}' +
  '#jm-mapa.jm-sel .jm-top,#jm-mapa.jm-sel .jm-fis{opacity:.35}#jm-mapa.jm-night .jm-top{opacity:.5}#jm-mapa.jm-night .jm-nat{color:#E4F1FF;text-shadow:0 0 4px #0A1120}' +
  '#jm-mapa .jm-poi.k-snowboardpark{background:rgba(10,17,32,.88)}#jm-mapa .jm-poi.k-pasarela{width:22px;height:18px;border-radius:6px}' +
  /* oznake (HTML u svijetu, stalna veličina na ekranu) */
  '#jm-mapa .jm-world .jm-mk{position:absolute;left:0;top:0;transform:translate(-50%,-50%) scale(calc(var(--inv)*var(--ms)));transform-origin:50% 50%}' +
  '#jm-mapa .jm-pm{all:unset;box-sizing:border-box;cursor:pointer;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:800 14px/1 var(--fd)!important;letter-spacing:-.5px;color:#fff!important;' +
  'box-shadow:0 0 0 2.5px #fff,0 3px 8px rgba(0,0,0,.35);transition:box-shadow .2s,opacity .25s}' +
  '#jm-mapa .jm-pm small{font:800 10px/1 var(--fd);margin-left:.5px;transform:translateY(1.5px)}' +
  '#jm-mapa .jm-pm.t-laka{background:var(--c-laka)}#jm-mapa .jm-pm.t-srednja{background:var(--c-srednja)}#jm-mapa .jm-pm.t-teska{background:var(--c-teska)}' +
  '#jm-mapa .jm-pm:focus-visible,#jm-mapa .jm-lb:focus-visible{box-shadow:0 0 0 2.5px #fff,0 0 0 5px var(--accent)}' +
  '#jm-mapa .jm-pm.on{box-shadow:0 0 0 2.5px #fff,0 0 0 6px rgba(0,185,242,.55),0 4px 12px rgba(0,0,0,.4)}' +
  '#jm-mapa.jm-sel .jm-world .jm-pm:not(.on),#jm-mapa.jm-sel .jm-rb{opacity:.35}' +
  '#jm-mapa.jm-night .jm-world .jm-pm:not(.lit){opacity:.45}' +
  '#jm-mapa .jm-rb{width:22px;height:22px;display:grid;place-items:center;pointer-events:none;transition:opacity .25s}' +
  '#jm-mapa .jm-rb::before{content:"";position:absolute;inset:3px;transform:rotate(45deg);background:#fff;border:1.6px solid currentColor;border-radius:3px}' +
  '#jm-mapa .jm-rb span{position:relative;font:800 9.5px/1 var(--fd);letter-spacing:-.3px}' +
  '#jm-mapa .jm-rb.t-laka{color:var(--c-laka)}#jm-mapa .jm-rb.t-srednja{color:var(--c-srednja)}#jm-mapa .jm-rb.t-teska{color:var(--c-teska)}' +
  '#jm-mapa .jm-lb{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 9px 0 6px;border-radius:9px;white-space:nowrap;' +
  'background:linear-gradient(180deg,rgba(18,27,45,.94),rgba(9,14,26,.96));box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 3px 8px rgba(0,0,0,.35);color:var(--ice)!important;font:700 13px/1 var(--fd)!important;transition:box-shadow .2s,opacity .25s}' +
  '#jm-mapa .jm-lb svg{width:17px;height:17px;flex:none}' +
  '#jm-mapa .jm-world .jm-lb{padding:0 8px;height:24px;border-radius:8px;font-size:12px!important}#jm-mapa .jm-world .jm-lb svg{display:none}' +
  '#jm-mapa.jm-z2 .jm-world .jm-lb{padding:0 9px 0 6px;height:28px;border-radius:9px;font-size:13px!important}#jm-mapa.jm-z2 .jm-world .jm-lb svg{display:block}' +
  '#jm-mapa .jm-lb b{color:#fff;font-weight:700}' +
  '#jm-mapa .jm-lb.on{box-shadow:inset 0 0 0 1.5px var(--accent),0 0 14px rgba(0,185,242,.45)}' +
  '#jm-mapa.jm-sel .jm-world .jm-lb:not(.on){opacity:.45}' +
  '#jm-mapa .jm-poi{all:unset;box-sizing:border-box;cursor:pointer;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:rgba(10,17,32,.88);' +
  'box-shadow:inset 0 0 0 1px rgba(196,238,255,.3),0 2px 6px rgba(0,0,0,.3);color:var(--ice)!important;font:800 11px/1 var(--fd)!important;letter-spacing:-.3px;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}' +
  '#jm-mapa .jm-poi svg{width:15px;height:15px}' +
  '#jm-mapa .jm-poi.k-gss,#jm-mapa .jm-poi.k-hitna{background:#C8303A;color:#fff!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4)}' +
  '#jm-mapa .jm-poi.k-bar{width:auto;padding:0 8px;gap:5px;display:inline-flex;align-items:center;font:700 11px/1 var(--fd)!important;letter-spacing:1px;text-transform:uppercase;white-space:nowrap}' +
  '#jm-mapa.jm-z1 .jm-poi.l1,#jm-mapa.jm-z2 .jm-poi{opacity:1;visibility:visible}' +
  '#jm-mapa .jm-rb{opacity:0}#jm-mapa.jm-z2 .jm-rb{opacity:1}' +
  '#jm-mapa.jm-sel .jm-world .jm-poi{opacity:.4}' +
  '#jm-mapa .jm-pk{display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;transform:translate(-50%,-100%) scale(calc(var(--inv)*var(--ms)))!important;transform-origin:50% 100%!important}' +
  '#jm-mapa .jm-pk span{font:700 11px/1 var(--fd);letter-spacing:2px;text-transform:uppercase;color:#fff;padding:6px 10px;border-radius:8px;background:rgba(10,17,32,.72);white-space:nowrap}' +
  '#jm-mapa .jm-pk span b{color:var(--ice);font-weight:600;letter-spacing:.5px}' +
  '#jm-mapa .jm-pk i{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid rgba(10,17,32,.72)}' +
  /* kontrole */
  '#jm-mapa .jm-ctls{position:absolute;right:14px;top:14px;display:flex;flex-direction:column;gap:8px;z-index:3}' +
  '#jm-mapa .jm-ctl{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:var(--ice)!important;background:linear-gradient(180deg,rgba(18,27,45,.86),rgba(9,14,26,.92));' +
  'box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 4px 12px rgba(0,0,0,.35);transition:box-shadow .2s,transform .12s}' +
  '#jm-mapa .jm-ctl svg{width:19px;height:19px}' +
  '#jm-mapa .jm-ctl:hover{box-shadow:inset 0 0 0 1px rgba(0,185,242,.6),0 0 14px rgba(0,185,242,.2)}' +
  '#jm-mapa .jm-ctl:active{transform:scale(.96)}' +
  '#jm-mapa .jm-ctl:focus-visible,#jm-mapa .jm-chip:focus-visible,#jm-mapa .jm-nt:focus-visible,#jm-mapa .jm-x:focus-visible,#jm-mapa .jm-li:focus-visible,#jm-mapa .jm-rc:focus-visible,#jm-mapa .jm-poi:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
  '#jm-mapa .jm-ctl-gap{height:4px}' +
  '#jm-mapa .jm-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 18px;border-radius:14px;background:rgba(9,14,26,.86);color:#fff;font:500 15px/1.3 var(--fb);pointer-events:none;opacity:0;transition:opacity .3s;z-index:4;text-align:center;max-width:80%}' +
  '#jm-mapa .jm-hint.on{opacity:1}' +
  '#jm-mapa .jm-tt{position:absolute;left:0;top:0;padding:7px 11px;border-radius:9px;background:rgba(9,14,26,.92);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);color:#fff;font:600 13px/1 var(--fd);pointer-events:none;white-space:nowrap;opacity:0;transition:opacity .15s;z-index:4}' +
  '#jm-mapa .jm-tt.on{opacity:1}' +
  /* kartica */
  '#jm-mapa .jm-card{position:absolute;left:16px;bottom:16px;width:min(340px,calc(100% - 92px));padding:20px 20px 18px;border-radius:22px;z-index:5;' +
  'background:linear-gradient(180deg,rgba(18,27,45,.9),rgba(9,14,26,.94));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1),0 14px 34px rgba(0,0,0,.45);' +
  'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transform:translateY(8px);opacity:0;visibility:hidden;transition:opacity .22s,transform .22s,visibility .22s}' +
  '#jm-mapa .jm-card.on{opacity:1;transform:none;visibility:visible}' +
  '#jm-mapa .jm-x{position:absolute;right:10px;top:10px;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;color:var(--text-2)!important}' +
  '#jm-mapa .jm-x:hover{color:#fff!important;background:rgba(255,255,255,.06)}' +
  '#jm-mapa .jm-x svg{width:16px;height:16px}' +
  '#jm-mapa .jm-ch{display:flex;align-items:center;gap:13px;padding-right:40px}' +
  '#jm-mapa .jm-ch .jm-pm{flex:none;cursor:default;width:40px;height:40px;font-size:18px!important}' +
  '#jm-mapa .jm-ch .jm-pm small{font-size:12px}' +
  '#jm-mapa .jm-ch .jm-lb{flex:none;cursor:default;height:40px;padding:0 12px 0 9px;font-size:17px!important;border-radius:12px}' +
  '#jm-mapa .jm-ch .jm-lb svg{width:22px;height:22px}' +
  '#jm-mapa .jm-ct{min-width:0}' +
  '#jm-mapa .jm-ct h3{font:800 20px/1.1 var(--fd)!important;color:#fff!important;margin:0!important;padding:0!important;letter-spacing:-.3px!important;text-transform:none!important}' +
  '#jm-mapa .jm-ct p{margin:5px 0 0;font:500 14px/1.3 var(--fb);color:var(--text-2)}' +
  '#jm-mapa .jm-cl{list-style:none;margin:16px 0 0;padding:14px 0 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:9px}' +
  '#jm-mapa .jm-cl li{display:flex;gap:10px;align-items:baseline;font:400 14px/1.4 var(--fb);color:var(--text-2)}' +
  '#jm-mapa .jm-cl li span{flex:none;min-width:112px;font:600 11px/1.6 var(--fd);letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3)}' +
  '#jm-mapa .jm-cl li strong{color:#fff;font-weight:600}' +
  '#jm-mapa .jm-cl li>div{flex:1;min-width:0}' +
  '#jm-mapa .jm-inf{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}#jm-mapa .jm-inf .jm-tags{margin-top:0}' +
  '#jm-mapa .jm-inf-l{display:block;margin-bottom:10px;font:600 11px/1 var(--fd);letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3)}' +
  '#jm-mapa .jm-inf .jm-tag{text-transform:none;letter-spacing:.1px;font:500 13.5px/1 var(--fb);padding:7px 11px}' +
  '#jm-mapa .jm-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}' +
  '#jm-mapa .jm-tag{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:30px;font:600 11px/1 var(--fd);letter-spacing:1px;text-transform:uppercase;color:var(--ice);background:rgba(196,238,255,.08);box-shadow:inset 0 0 0 1px rgba(196,238,255,.16)}' +
  '#jm-mapa .jm-tag.w{color:var(--warm);background:rgba(255,210,122,.08);box-shadow:inset 0 0 0 1px rgba(255,210,122,.22)}' +
  '#jm-mapa .jm-stats{display:flex;gap:22px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}' +
  '#jm-mapa .jm-stats div{display:flex;flex-direction:column;gap:4px}' +
  '#jm-mapa .jm-stats strong{font:800 24px/1 var(--fd);color:#fff;font-variant-numeric:tabular-nums}' +
  '#jm-mapa .jm-stats strong small{font:600 13px/1 var(--fd);color:var(--text-2);margin-left:3px}' +
  '#jm-mapa .jm-stats span{font:600 10.5px/1 var(--fd);letter-spacing:1.4px;text-transform:uppercase;color:var(--text-3)}' +
  '#jm-mapa .jm-rcs{display:flex;flex-wrap:wrap;gap:6px}' +
  '#jm-mapa .jm-rc{display:inline-grid;place-items:center;min-width:30px;height:26px;padding:0 7px;border-radius:13px;color:#fff!important;font:800 12px/1 var(--fd)!important}' +
  '#jm-mapa .jm-rc.t-laka{background:var(--c-laka)}#jm-mapa .jm-rc.t-srednja{background:var(--c-srednja)}#jm-mapa .jm-rc.t-teska{background:var(--c-teska);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}' +
  '#jm-mapa .jm-rc.z{background:rgba(196,238,255,.1);color:var(--ice)!important;box-shadow:inset 0 0 0 1px rgba(196,238,255,.2)}' +
  '#jm-mapa .jm-help{font:500 13px/1.4 var(--fb);color:var(--text-3);margin:0}' +
  /* popis ispod mape */
  '#jm-mapa .jm-lists{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:28px;margin-top:10px}' +
  '#jm-mapa .jm-lists h3{font:600 11px/1 var(--fd)!important;letter-spacing:5px!important;text-transform:uppercase!important;color:rgba(255,255,255,.75)!important;margin:0 0 14px!important;padding:0!important}' +
  '#jm-mapa .jm-lifts{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 18px}' +
  '#jm-mapa .jm-li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;min-height:48px;padding:6px 10px 6px 6px;border-radius:13px;transition:background .2s}' +
  '#jm-mapa .jm-li:hover,#jm-mapa .jm-li.on{background:rgba(255,255,255,.05)}' +
  '#jm-mapa .jm-li .jm-lb{cursor:pointer;height:32px}' +
  '#jm-mapa .jm-li-n{min-width:0}' +
  '#jm-mapa .jm-li-n strong{display:block;font:700 15px/1.2 var(--fd);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '#jm-mapa .jm-li-n span{display:block;font:400 13px/1.3 var(--fb);color:var(--text-3)}' +
  '#jm-mapa .jm-li-m{font:600 13px/1.2 var(--fd);color:var(--text-2);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}' +
  '#jm-mapa .jm-li-m small{display:block;font:500 12px/1.3 var(--fb);color:var(--text-3)}' +
  '#jm-mapa .jm-runs{display:flex;flex-direction:column;gap:16px}' +
  '#jm-mapa .jm-rg{display:flex;flex-direction:column;gap:8px}' +
  '#jm-mapa .jm-rg>span{font:500 13px/1 var(--fb);color:var(--text-3)}' +
  '#jm-mapa .jm-runs .jm-rc{min-width:44px;height:36px;border-radius:18px;font-size:14px!important}' +
  '#jm-mapa .jm-runs .jm-rc.on{box-shadow:0 0 0 2px #fff,0 0 0 5px rgba(0,185,242,.5)}' +
  /* cijeli ekran */
  '#jm-mapa.jm-fs .jm-frame{position:fixed;inset:0;height:auto;max-height:none;border-radius:0;z-index:2147483000;box-shadow:none}' +
  '#jm-mapa.jm-fs .jm-view{touch-action:none}' +
  '#jm-mapa.jm-fs .jm-ctls{top:calc(14px + env(safe-area-inset-top,0px));right:calc(14px + env(safe-area-inset-right,0px))}' +
  '#jm-mapa.jm-fs .jm-card{bottom:calc(16px + env(safe-area-inset-bottom,0px));left:calc(16px + env(safe-area-inset-left,0px))}' +
  '#jm-mapa .jm-fsbar{display:none}' +
  '#jm-mapa.jm-fs .jm-fsbar{display:flex;position:absolute;left:calc(14px + env(safe-area-inset-left,0px));top:calc(14px + env(safe-area-inset-top,0px));z-index:3;gap:8px;flex-wrap:wrap;max-width:calc(100% - 90px)}' +
  '#jm-mapa .jm-fsbar .jm-chip,#jm-mapa .jm-fsbar .jm-nt{background:linear-gradient(180deg,rgba(18,27,45,.88),rgba(9,14,26,.92))}' +
  '@media (max-width:900px){#jm-mapa .jm-head{grid-template-columns:1fr}#jm-mapa .jm-lists{grid-template-columns:1fr}}' +
  '@media (max-width:760px){' +
  '#jm-mapa{padding-left:0;padding-right:0}#jm-mapa .jm-head,#jm-mapa .jm-bar,#jm-mapa .jm-lists,#jm-mapa .jm-help{padding-left:16px;padding-right:16px}' +
  '#jm-mapa .jm-frame{border-radius:0;height:min(78vh,560px);box-shadow:inset 0 1px 0 var(--line),inset 0 -1px 0 var(--line)}' +
  '#jm-mapa .jm-bar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;justify-content:flex-start}#jm-mapa .jm-bar::-webkit-scrollbar{display:none}' +
  '#jm-mapa .jm-chips{flex-wrap:nowrap}#jm-mapa .jm-chip,#jm-mapa .jm-nt{flex:none}' +
  '#jm-mapa .jm-card{left:10px;right:10px;bottom:10px;width:auto;backdrop-filter:none;-webkit-backdrop-filter:none;background:rgba(9,14,26,.95)}' +
  '#jm-mapa .jm-lifts{grid-template-columns:1fr}' +
  '#jm-mapa .jm-runs .jm-rc{min-width:48px;height:44px;border-radius:22px}#jm-mapa .jm-card .jm-rc{height:40px;padding:0 12px;border-radius:20px}' +
  '#jm-mapa .jm-ctls{right:10px;top:10px}' +
  '#jm-mapa.jm-fs .jm-fsbar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}' +
  '}' +
  '@media (prefers-reduced-motion:reduce){#jm-mapa *{transition:none!important}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- ikonice ---------- */
  var I = {
    gondola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l18-2"/><path d="M12 3.4V7"/><rect x="6" y="7" width="12" height="13" rx="3"/><path d="M6 12h12"/><path d="M10 7v5M14 7v5"/></svg>',
    sestosjed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l18-2"/><path d="M12 3.4V8"/><path d="M5 8h14"/><path d="M5 8v5h14V8"/><path d="M5 17h14M5 13v4M19 13v4M9.7 13v4M14.3 13v4"/></svg>',
    dvosjed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l18-2"/><path d="M12 3.4V9"/><path d="M8 9h8v6H8z"/><path d="M8 15v4M16 15v4M8 19h8"/></svg>',
    tanjir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3l16 4"/><path d="M13 5.3l-2 7"/><circle cx="10.4" cy="13.4" r="1.6"/><circle cx="14.5" cy="11" r="1.6"/><path d="M14 12.6l-1.4 4.4 2.4 2.4M12.6 17l-3 1.2"/><path d="M5 21l14-3"/></svg>',
    sidro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4l18 3"/><path d="M12 5.5V10M8 10h8"/><circle cx="8" cy="12.6" r="1.5"/><circle cx="16" cy="12.6" r="1.5"/><path d="M8 14.2v4M16 14.2v4M6 21h4M14 21h4"/></svg>',
    lift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l18-2"/><path d="M12 3.4V9"/><circle cx="9.5" cy="11.5" r="1.5"/><circle cx="14.5" cy="11.5" r="1.5"/><path d="M7 14h10v4M7 14v4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-7 4 5 3-4 6 6"/><path d="M3 20h18"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    unfull: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  var P = { // usluge: tekst ili ikonica
    parking: 'P', hotel: 'H', poligon: 'L', wc: 'WC', karte24: '24',
    skikasa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/></svg>',
    restoran: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M16 21V3c-2 2-3 5-3 8h3"/></svg>',
    bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.5 2 2 3.3 0 5.5C10 6.3 10.5 5 12 3z"/><path d="M8 10h8l-2 11h-4z"/></svg>',
    smjestaj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/></svg>',
    skola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="5" r="2"/><path d="M9 7v6l4 3M9 13l-3 4M4 20l14-4"/><path d="M15 4v7" /><path d="M15 4h4l-1.5 1.8L19 7.5h-4"/></svg>',
    snowboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="1.5" width="6" height="21" rx="3" transform="rotate(35 12 12)"/></svg>',
    sankaliste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h15a3 3 0 003-3"/><path d="M6 15v-4h10v4M9 11V8M13 11V8"/><path d="M3 19h16"/></svg>',
    gondola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l18-2M12 3.4V7"/><rect x="6" y="7" width="12" height="13" rx="3"/><path d="M6 12h12"/></svg>',
    rent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 18L15 4c1-1.2 2.6-.4 2 1M8 20L19 6c1-1.2 2.6-.4 2 1"/><path d="M8 13l3 2.4M12 8l3 2.4" stroke-width="1.6"/></svg>',
    gss: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20l7-11 4 6 2.5-3.5L22 20z"/><path d="M15 2.5h2v2h2v2h-2v2h-2v-2h-2v-2h2z"/></svg>',
    hitna: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg>',
    policija: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6z"/><path d="M12 8l1.2 2.5 2.7.3-2 1.8.6 2.7-2.5-1.4-2.5 1.4.6-2.7-2-1.8 2.7-.3z" fill="currentColor" stroke="none"/></svg>',
    uprava: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M6.5 16l4-6 2.5 3.5 1.5-2 3 4.5z" fill="currentColor" stroke="none"/></svg>',
    snowboardpark: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3" fill="#F26A21"/></svg>',
    skibike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19l7-1.5M13 17l8-1.5"/><path d="M7 18l3-6h5l2 4M10 12l1-4h3"/><circle cx="15" cy="5" r="1.4"/></svg>',
    sanke: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h13l3-3h2"/><path d="M5 17l1-4h7l2-3h3"/><circle cx="10" cy="7" r="1.5"/><path d="M3 20h16"/></svg>',
    pjesacka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="4.5" r="1.6"/><path d="M9 7v6l-2 7M9 13l3 3 1 4M9 9l-3 3M9 9l3 2"/><circle cx="17" cy="6.5" r="1.4"/><path d="M17 9v5l-1.5 6M17 14l2 2v4"/></svg>',
    pasarela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 18c2-7 14-7 16 0"/></svg>',
    top: '<svg viewBox="0 0 24 24"><path d="M5 9l9-5 2 4-8 4z" fill="#F2C14E"/><path d="M9 12l2 9h-3l1-9z" fill="#1a2233"/><circle cx="18" cy="6" r="1" fill="#C4EEFF"/><circle cx="20" cy="9" r="1" fill="#C4EEFF"/><circle cx="21" cy="5" r=".8" fill="#C4EEFF"/></svg>',
    snowfactory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/></svg>'
  };
  var L1 = { skikasa: 1, karte24: 1, gondola: 1, bar: 1 };
  var liftIcon = function (t) { return I[t] || I.lift; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (id) { var m = /^(\d+)([a-z]?)$/.exec(id); return m ? m[1] + (m[2] ? '<small>' + m[2] + '</small>' : '') : esc(id); };
  var fmt = function (v) { return EN ? String(v) : String(v).replace('.', ','); };
  var isTouch = window.matchMedia && matchMedia('(pointer:coarse)').matches;

  /* ---------- kostur ---------- */
  root.innerHTML =
    '<div class="jm-in">' +
      '<div class="jm-head"><div><div class="jm-kicker">' + T.kicker + '</div>' +
      '<h2 class="jm-title"><span>' + T.h1 + '</span> <span class="jm-o">' + T.h2 + '</span></h2></div>' +
      '<p class="jm-lead">' + T.lead + '</p></div>' +
      '<div class="jm-bar"><div class="jm-chips" role="group"></div></div>' +
      '<div class="jm-frame">' +
        '<div class="jm-view" tabindex="0" role="application" aria-label="' + esc(T.mapLabel) + '"><div class="jm-world"></div></div>' +
        '<div class="jm-fsbar"></div>' +
        '<div class="jm-ctls">' +
          '<button class="jm-ctl" type="button" data-a="in" aria-label="' + T.zoomIn + '" title="' + T.zoomIn + '">' + I.plus + '</button>' +
          '<button class="jm-ctl" type="button" data-a="out" aria-label="' + T.zoomOut + '" title="' + T.zoomOut + '">' + I.minus + '</button>' +
          '<button class="jm-ctl" type="button" data-a="fit" aria-label="' + T.reset + '" title="' + T.reset + '">' + I.fit + '</button>' +
          '<span class="jm-ctl-gap"></span>' +
          '<button class="jm-ctl" type="button" data-a="fs" aria-label="' + T.full + '" title="' + T.full + '">' + I.full + '</button>' +
        '</div>' +
        '<div class="jm-hint" aria-hidden="true"></div><div class="jm-tt" aria-hidden="true"></div>' +
        '<div class="jm-card" role="dialog" aria-live="polite"><button class="jm-x" type="button" aria-label="' + T.close + '">' + I.x + '</button><div class="jm-cb"></div></div>' +
      '</div>' +
      '<p class="jm-help">' + (isTouch ? T.helpTouch : T.help) + '</p>' +
      '<div class="jm-lists"><div><h3>' + T.listLifts + '</h3><ul class="jm-lifts"></ul></div><div><h3>' + T.listRuns + '</h3><div class="jm-runs"></div></div></div>' +
    '</div>';

  var $ = function (s) { return root.querySelector(s); };
  var frame = $('.jm-frame'), view = $('.jm-view'), world = $('.jm-world'), card = $('.jm-card'), cardBody = $('.jm-cb');
  var hint = $('.jm-hint'), tt = $('.jm-tt');

  fetch(BASE + 'podaci/mapa.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(start).catch(function (e) {
      world.innerHTML = '';
      view.insertAdjacentHTML('beforeend', '<p style="position:absolute;inset:auto 0 45%;text-align:center;color:rgba(255,255,255,.7);font:500 15px var(--fb)">' +
        (EN ? 'The map could not be loaded.' : 'Mapa se trenutno ne može učitati.') + '</p>');
      if (window.console) console.warn('jm-mapa', e);
    });

  function start(D) {
    var W = D.w, H = D.h;
    var byRun = {}, byLift = {};
    D.staze.forEach(function (s) { byRun[s.id] = s; });
    D.zicare.forEach(function (z) { byLift[z.id] = z; });
    var order = function (a, b) { return parseInt(a.id, 10) - parseInt(b.id, 10) || (a.id < b.id ? -1 : 1); };
    var runs = D.staze.slice().sort(order);

    /* --- slike --- */
    var big = (window.innerWidth || 1200) * (window.devicePixelRatio || 1) > 1500;
    var imgD = new Image(), imgN = new Image();
    imgD.className = 'jm-img'; imgD.alt = EN ? 'Painted panorama of the Jahorina ski resort with the Ogorjelica peak' : 'Naslikana panorama ski centra Jahorina sa vrhom Ogorjelica';
    imgD.width = W; imgD.height = H; imgD.decoding = 'async';
    imgD.src = BASE + 'slike/mapa-dan-' + (big ? 3543 : 2000) + '.webp';
    imgN.className = 'jm-img jm-img-n'; imgN.alt = ''; imgN.setAttribute('aria-hidden', 'true'); imgN.width = W; imgN.height = H; imgN.decoding = 'async';
    var nightLoaded = false;
    function loadNight() { if (!nightLoaded) { nightLoaded = true; imgN.src = BASE + 'slike/mapa-noc-' + (big ? 3543 : 2000) + '.webp'; } }
    var upgraded = big;
    function upgrade() {
      if (upgraded) return; upgraded = true;
      var hi = new Image(); hi.onload = function () { imgD.src = hi.src; if (nightLoaded) imgN.src = BASE + 'slike/mapa-noc-3543.webp'; };
      hi.src = BASE + 'slike/mapa-dan-3543.webp'; big = true;
    }

    /* --- SVG --- */
    var s = [];
    s.push('<svg class="jm-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">');
    s.push('<g>' + D.granica.map(function (d) { return '<path class="jm-gr" d="' + d + '"/>'; }).join('') + '</g>');
    s.push('<g>' + D.pjesacke.map(function (d) { return '<path class="jm-pj" d="' + d + '"/>'; }).join('') + '</g>');
    s.push('<g class="jm-sks">' + (D.sanke || []).map(function (d) { return '<path class="jm-skc" d="' + d + '"/>'; }).join('') +
      (D.sanke || []).map(function (d) { return '<path class="jm-sk" d="' + d + '"/>'; }).join('') + '</g>');
    s.push('<g class="jm-nls">' + D.nocne.map(function (d) { return '<path class="jm-nl jm-nl-a" d="' + d + '"/><path class="jm-nl jm-nl-b" d="' + d + '"/>'; }).join('') + '</g>');
    s.push('<g class="jm-ves">' + D.veze.map(function (v) { return '<path class="jm-ve-k t-' + v.t + '" d="' + v.d + '"/>'; }).join('') +
      D.veze.map(function (v) { return '<path class="jm-ve t-' + v.t + '" d="' + v.d + '"/>'; }).join('') + '</g>');
    s.push('<g class="jm-un">' + D.neimenovane.map(function (v) { return '<path class="jm-cas" d="' + v.d + '"/><path class="jm-ln t-' + v.t + '" d="' + v.d + '"/>'; }).join('') + '</g>');
    // staze: prvo sve podloge, pa linije (teže staze iznad lakših)
    var rank = { laka: 0, srednja: 1, teska: 2 };
    var sorted = D.staze.slice().sort(function (a, b) { return rank[a.tez] - rank[b.tez]; });
    sorted.forEach(function (r) {
      s.push('<g class="jm-p t-p-' + r.tez + (r.noc ? ' lit' : '') + '" data-run="' + r.id + '">');
      r.seg.forEach(function (g) { s.push('<path class="jm-glow" d="' + g.d + '"/>'); });
      r.seg.forEach(function (g) { s.push('<path class="jm-cas" d="' + g.d + '"/>'); });
      r.seg.forEach(function (g) { s.push('<path class="jm-ln t-' + g.t + '" d="' + g.d + '"/>'); });
      s.push('</g>');
    });
    D.zicare.forEach(function (z) {
      var l = 'x1="' + z.a[0] + '" y1="' + z.a[1] + '" x2="' + z.b[0] + '" y2="' + z.b[1] + '"';
      s.push('<g class="jm-l" data-lift="' + z.id + '"><line class="jm-lc" ' + l + '/><line class="jm-ll" ' + l + '/>' +
        '<circle class="jm-le" cx="' + z.a[0] + '" cy="' + z.a[1] + '" r="5"/><circle class="jm-le" cx="' + z.b[0] + '" cy="' + z.b[1] + '" r="5"/></g>');
    });
    s.push('<g class="jm-hits">');
    D.zicare.forEach(function (z) { s.push('<line class="jm-hit jm-lh" data-lift="' + z.id + '" x1="' + z.a[0] + '" y1="' + z.a[1] + '" x2="' + z.b[0] + '" y2="' + z.b[1] + '"/>'); });
    sorted.forEach(function (r) { r.seg.forEach(function (g) { s.push('<path class="jm-hit t-p-' + r.tez + '" data-run="' + r.id + '" d="' + g.d + '"/>'); }); });
    s.push('</g></svg>');

    /* --- HTML oznake --- */
    var m = [];
    var pos = function (x, y) { return 'style="left:' + x + 'px;top:' + y + 'px"'; };
    (D.topovi || []).forEach(function (t) { m.push('<span class="jm-mk jm-top" ' + pos(t[0], t[1]) + ' aria-hidden="true">' + P.top + '</span>'); });
    (D.fis || []).forEach(function (f) { m.push('<span class="jm-mk jm-fis" ' + pos(f[0], f[1]) + ' aria-hidden="true">F<i>I</i>S</span>'); });
    (D.natpisi || []).forEach(function (n) { m.push('<span class="jm-mk jm-nat" ' + pos(n.x, n.y) + '>' + esc(n.t) + '</span>'); });
    D.usluge.forEach(function (u) {
      var g = P[u.k] || '•', name = T.poi[u.k] || u.k;
      var inner = g.charAt(0) === '<' ? g : esc(g);
      if (u.k === 'bar') inner = g + '<span>' + esc(name) + '</span>';
      m.push('<button type="button" tabindex="-1" class="jm-mk jm-poi k-' + u.k + (L1[u.k] ? ' l1' : '') + '" ' + pos(u.x, u.y) + ' data-poi="' + u.k + '"' + (u.i ? ' data-info="' + u.i + '"' : '') + ' aria-label="' + esc(name) + '" title="' + esc(name) + '">' + inner + '</button>');
    });
    D.romboidi.forEach(function (r) { m.push('<span class="jm-mk jm-rb t-' + r.t + '" ' + pos(r.x, r.y) + ' aria-hidden="true"><span>' + esc(r.l) + '</span></span>'); });
    D.vrhovi.forEach(function (v) { m.push('<span class="jm-mk jm-pk" ' + pos(v.x, v.y) + '><span>' + esc(v.ime) + ' <b>' + v.v + ' m</b></span><i></i></span>'); });
    D.zicare.forEach(function (z) {
      m.push('<button type="button" class="jm-mk jm-lb" ' + pos(z.o[0], z.o[1]) + ' data-lift="' + z.id + '" aria-label="' + esc(T.lift + ' ' + z.id + ' ' + z.ime) + '">' + liftIcon(z.tip) + '<b>' + z.id + '</b></button>');
    });
    runs.forEach(function (r) {
      r.o.forEach(function (o) {
        m.push('<button type="button" class="jm-mk jm-pm t-' + r.tez + ' t-p-' + r.tez + (r.noc ? ' lit' : '') + '" ' + pos(o[0], o[1]) + ' data-run="' + r.id + '" aria-label="' + esc(T.run + ' ' + r.id + ', ' + T.lvl[r.tez]) + '">' + num(r.id) + '</button>');
      });
    });
    world.innerHTML = s.join('') + m.join('');
    world.insertBefore(imgN, world.firstChild);
    world.insertBefore(imgD, world.firstChild);

    /* --- filteri --- */
    var cnt = { laka: 0, srednja: 0, teska: 0 };
    D.staze.forEach(function (r) { cnt[r.tez]++; });
    function chipsHTML() {
      return ['laka', 'srednja', 'teska'].map(function (k) {
        return '<button type="button" class="jm-chip" data-f="' + k + '" aria-pressed="true"><span class="jm-sw" style="--sw:var(--c-' + k + ')' + (k === 'teska' ? ';box-shadow:0 0 0 1.5px rgba(255,255,255,.85)' : '') + '"></span>' + T[k] + '<b>' + cnt[k] + '</b></button>';
      }).join('') +
      '<button type="button" class="jm-chip" data-f="zicare" aria-pressed="true"><span class="jm-sw" style="--sw:#0B1222;height:2px;box-shadow:0 0 0 1.5px rgba(255,255,255,.85)"></span>' + T.zicare + '<b>' + D.zicare.length + '</b></button>' +
      '<button type="button" class="jm-chip" data-f="usluge" aria-pressed="true"><span class="jm-sw" style="--sw:rgba(10,17,32,.9);width:13px;height:13px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(196,238,255,.6)"></span>' + T.usluge + '</button>' +
      ((D.topovi || []).length ? '<button type="button" class="jm-chip" data-f="topovi" aria-pressed="true"><span class="jm-sw" style="--sw:#F2C14E;width:8px;height:12px;border-radius:2px 2px 4px 4px"></span>' + T.snow + '<b>' + D.topovi.length + '</b></button>' : '') +
      '<button type="button" class="jm-nt" role="switch" aria-checked="false">' + T.noc + '<i></i></button>';
    }
    $('.jm-chips').innerHTML = chipsHTML();
    $('.jm-fsbar').innerHTML = chipsHTML();
    var off = {};
    function setFilter(k, on) {
      off[k] = !on; root.classList.toggle('f-' + k, !on);
      [].forEach.call(root.querySelectorAll('.jm-chip[data-f="' + k + '"]'), function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    var night = false;
    function setNight(v) {
      night = v; if (v) loadNight();
      root.classList.toggle('jm-night', v);
      [].forEach.call(root.querySelectorAll('.jm-nt'), function (b) { b.setAttribute('aria-checked', v ? 'true' : 'false'); });
    }
    root.addEventListener('click', function (e) {
      var c = e.target.closest('.jm-chip'); if (c && root.contains(c)) { var k = c.getAttribute('data-f'); setFilter(k, !!off[k]); return; }
      var n = e.target.closest('.jm-nt'); if (n && root.contains(n)) { setNight(!night); }
    });

    /* --- popis --- */
    $('.jm-lifts').innerHTML = D.zicare.slice().sort(order).map(function (z) {
      return '<li><button type="button" class="jm-li" data-lift="' + z.id + '"><span class="jm-lb">' + liftIcon(z.tip) + '<b>' + z.id + '</b></span>' +
        '<span class="jm-li-n"><strong>' + esc(z.ime) + '</strong><span>' + (z.tip ? T.tip[z.tip] : T.lift) + '</span></span>' +
        '<span class="jm-li-m">' + z.m + ' m<small>' + fmt(z.min) + ' min</small></span></button></li>';
    }).join('');
    $('.jm-runs').innerHTML = ['laka', 'srednja', 'teska'].map(function (k) {
      return '<div class="jm-rg"><span>' + T.lvl[k] + '</span><div class="jm-rcs">' + runs.filter(function (r) { return r.tez === k; }).map(function (r) {
        return '<button type="button" class="jm-rc t-' + k + '" data-run="' + r.id + '" aria-label="' + esc(T.run + ' ' + r.id) + '">' + esc(r.id) + '</button>';
      }).join('') + '</div></div>';
    }).join('');

    /* --- kamera --- */
    var k = 1, tx = 0, ty = 0, vw = 1, vh = 1, kMin = .1, kMax = 1.6, anim = null;
    var setVar = function (n, v) { world.style.setProperty(n, v); };
    function bounds() { vw = view.clientWidth || 1; vh = view.clientHeight || 1; kMin = Math.min(vw / W, vh / H); kMax = big ? 1.6 : 1.15; if (vw < 700) kMax = 1.3; }
    function clamp() {
      k = Math.max(kMin, Math.min(kMax, k));
      var w = W * k, h = H * k;
      // dok je kartica otvorena, mapa smije ići dalje za njenu veličinu (da izabrano ne ostane ispod kartice)
      var open = card.classList.contains('on'), eb = open && vw < 700 ? card.offsetHeight + 10 : 0, el = open && vw >= 700 ? card.offsetWidth + 24 : 0;
      tx = w <= vw ? (vw - w) / 2 : Math.min(el, Math.max(vw - w, tx));
      ty = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h - eb, ty));
    }
    var lastK = -1;
    function apply() {
      clamp();
      world.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + k.toFixed(5) + ')';
      if (Math.abs(k - lastK) > 1e-6) {
        lastK = k;
        setVar('--inv', (1 / k).toFixed(5));
        var f = Math.max(.72, Math.min(1.7, Math.pow(k / .4, .38)));
        setVar('--lw', (f / k).toFixed(5));
        setVar('--ms', Math.max(.62, Math.min(1.06, Math.pow(k / .5, .5))).toFixed(3));
        root.classList.toggle('jm-z1', k >= .22);
        root.classList.toggle('jm-z2', k >= .5);
        if (k > .62) upgrade();
      }
    }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function goTo(nk, ntx, nty, ms) {
      if (anim) cancelAnimationFrame(anim);
      var k0 = k, x0 = tx, y0 = ty;
      // cilj kroz clamp
      var sk = k, sx = tx, sy = ty; k = nk; tx = ntx; ty = nty; clamp(); var k1 = k, x1 = tx, y1 = ty; k = sk; tx = sx; ty = sy;
      if (reduce || !ms) { k = k1; tx = x1; ty = y1; apply(); return; }
      var t0 = performance.now(); world.classList.add('jm-moving');
      (function step(now) {
        var p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
        // zum po logaritmu da izgleda ravnomjerno
        k = Math.exp(Math.log(k0) + (Math.log(k1) - Math.log(k0)) * e);
        var cx = (x0 + (x1 - x0) * e), cy = (y0 + (y1 - y0) * e);
        tx = cx; ty = cy; apply();
        if (p < 1) anim = requestAnimationFrame(step); else { anim = null; world.classList.remove('jm-moving'); }
      })(t0);
    }
    function zoomAt(f, px, py, ms) {
      var nk = Math.max(kMin, Math.min(kMax, k * f)); var X = (px - tx) / k, Y = (py - ty) / k;
      goTo(nk, px - X * nk, py - Y * nk, ms);
    }
    function fitBox(x0, y0, x1, y1, ms, maxK) {
      var pad = vw < 700 ? 40 : 90, cardH = card.classList.contains('on') ? (vw < 700 ? card.offsetHeight + 10 : 0) : 0;
      var cardW = card.classList.contains('on') && vw >= 700 ? card.offsetWidth + 24 : 0;
      var aw = vw - pad * 2 - cardW, ah = vh - pad * 2 - cardH;
      var nk = Math.min(aw / Math.max(60, x1 - x0), ah / Math.max(60, y1 - y0), maxK || kMax);
      nk = Math.max(kMin, nk);
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      goTo(nk, cardW + pad + aw / 2 - cx * nk, pad + ah / 2 - cy * nk, ms);
    }
    function home(ms) {
      bounds();
      var cover = Math.max(vw / W, vh / H);
      if (vw / vh < 1.25) { var nk = Math.max(kMin, vh / 1700); goTo(nk, vw / 2 - 1700 * nk, vh / 2 - 1080 * nk, ms); } // telefon: jezgro skijališta, vrh u kadru
      else goTo(cover, (vw - W * cover) / 2, (vh - H * cover) / 2, ms);
    }
    bounds(); home(0);
    // stalni prikaz poslije promjene veličine
    var rT;
    window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { var cx = (vw / 2 - tx) / k, cy = (vh / 2 - ty) / k, rel = k / kMin; bounds(); k = kMin * rel; tx = vw / 2 - cx * k; ty = vh / 2 - cy * k; apply(); }, 120); });

    /* --- izbor --- */
    var sel = null;
    function clearSel() {
      var wasOpen = card.classList.contains('on');
      sel = null; root.classList.remove('jm-sel');
      [].forEach.call(root.querySelectorAll('.on'), function (e) { if (!e.classList.contains('jm-card')) e.classList.remove('on'); });
      card.classList.remove('on');
      if (wasOpen) goTo(k, tx, ty, 250); // vrati mapu u granice
    }
    function mark(selector) { [].forEach.call(root.querySelectorAll(selector), function (e) { e.classList.add('on'); }); }
    function liftChip(id) { var z = byLift[id]; return z ? '<button type="button" class="jm-rc z" data-lift="' + id + '">' + id + ' · ' + esc(z.ime) + '</button>' : ''; }
    function runChip(id) { var r = byRun[id]; return r ? '<button type="button" class="jm-rc t-' + r.tez + '" data-run="' + id + '">' + esc(id) + '</button>' : ''; }
    function row(label, html) { return html ? '<li><span>' + label + '</span><div class="jm-rcs">' + html + '</div></li>' : ''; }
    function selectRun(id, focus) {
      var r = byRun[id]; if (!r) return;
      clearSel(); sel = { run: id }; root.classList.add('jm-sel');
      mark('[data-run="' + id + '"]');
      r.gore.forEach(function (l) { mark('.jm-l[data-lift="' + l + '"],.jm-lb[data-lift="' + l + '"]'); });
      var mixed = r.seg.length > 1 && r.seg[0].t !== r.seg[r.seg.length - 1].t;
      var tags = (r.noc ? '<span class="jm-tag w">' + T.lit + '</span>' : '') + (r.fis ? '<span class="jm-tag">' + T.fis + '</span>' : '');
      cardBody.innerHTML = '<div class="jm-ch"><span class="jm-pm t-' + r.tez + '" aria-hidden="true">' + num(r.id) + '</span><div class="jm-ct"><h3>' + T.run + ' ' + esc(r.id) + '</h3><p>' +
        (mixed ? T.upper : T.lvl[r.tez]) + '</p></div></div>' + (tags ? '<div class="jm-tags">' + tags + '</div>' : '') +
        '<ul class="jm-cl">' + row(T.gore, r.gore.map(liftChip).join('')) + row(T.od, r.od.map(runChip).join('')) +
        row(T.u, r.u.map(runChip).join('')) + row(T.dole, r.dole.map(liftChip).join('')) + '</ul>';
      card.classList.add('on');
      if (focus !== false) fitBox(r.bb[0], r.bb[1], r.bb[2], r.bb[3], 520);
    }
    function selectLift(id, focus) {
      var z = byLift[id]; if (!z) return;
      clearSel(); sel = { lift: id }; root.classList.add('jm-sel');
      mark('[data-lift="' + id + '"]');
      var fromTop = D.staze.filter(function (r) { return r.gore.indexOf(id) >= 0; }).sort(order);
      fromTop.forEach(function (r) { mark('.jm-p[data-run="' + r.id + '"],.jm-pm[data-run="' + r.id + '"]'); });
      cardBody.innerHTML = '<div class="jm-ch"><span class="jm-lb" aria-hidden="true">' + liftIcon(z.tip) + '<b>' + z.id + '</b></span><div class="jm-ct"><h3>' + esc(z.ime) + '</h3><p>' +
        T.lift + ' ' + z.id + (z.tip ? ' · ' + T.tip[z.tip] : '') + '</p></div></div>' +
        '<div class="jm-stats"><div><strong>' + z.m + '<small>m</small></strong><span>' + (EN ? 'length' : 'dužina') + '</span></div>' +
        '<div><strong>' + fmt(z.min) + '<small>min</small></strong><span>' + T.ride + '</span></div></div>' +
        (fromTop.length ? '<ul class="jm-cl">' + row(T.fromTop, fromTop.map(function (r) { return runChip(r.id); }).join('')) + '</ul>' : '');
      card.classList.add('on');
      if (focus !== false) fitBox(Math.min(z.a[0], z.b[0]), Math.min(z.a[1], z.b[1]), Math.max(z.a[0], z.b[0]), Math.max(z.a[1], z.b[1]), 520, .9);
    }
    function selectPoi(btn, focus) {
      clearSel();

      var name = btn.getAttribute('aria-label'); btn.classList.add('on');
      var inf = T.info[btn.getAttribute('data-info')];
      cardBody.innerHTML = '<div class="jm-ch"><span class="jm-poi k-' + btn.getAttribute('data-poi') + '" style="opacity:1;visibility:visible;min-width:40px;height:40px;border-radius:11px" aria-hidden="true">' + btn.innerHTML + '</span><div class="jm-ct"><h3>' + esc(name) + '</h3></div></div>' +
        (inf ? '<div class="jm-inf"><span class="jm-inf-l">' + T.here + '</span><div class="jm-tags">' + inf.map(function (x) { return '<span class="jm-tag">' + esc(x) + '</span>'; }).join('') + '</div></div>' : '');
      card.classList.add('on');
      // usluga u slobodan dio kadra (pored kartice na računaru, iznad nje na telefonu)
      var px = parseFloat(btn.style.left), py = parseFloat(btn.style.top), sx = tx + px * k, sy = ty + py * k;
      var narrow = vw < 700, x0 = narrow ? 0 : card.offsetWidth + 24, y1 = narrow ? vh - card.offsetHeight - 10 : vh;
      if (focus !== false && (sx < x0 + 30 || sy < 30 || sx > vw - 70 || sy > y1 - 30)) {
        var nk = Math.max(k, .55); goTo(nk, (x0 + vw) / 2 - px * nk, y1 / 2 - py * nk, 450);
      }
    }
    $('.jm-x').addEventListener('click', function () { clearSel(); view.focus({ preventScroll: true }); });

    // klik: oznake, popis, kartica
    root.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      var t = e.target.closest('[data-run],[data-lift],[data-poi]');
      if (!t || !root.contains(t)) return;
      if (t.closest('.jm-chip')) return;
      var inList = !!t.closest('.jm-lists');
      if (inList) { var fr = frame.getBoundingClientRect(); if (fr.top < 0 || fr.bottom > innerHeight) frame.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
      if (t.hasAttribute('data-poi')) selectPoi(t);
      else if (t.hasAttribute('data-run')) selectRun(t.getAttribute('data-run'));
      else selectLift(t.getAttribute('data-lift'));
    });

    /* --- pokreti --- */
    var pts = {}, moved = false, down = null, pinch = null;
    function pcount() { return Object.keys(pts).length; }
    function rel(e) { var r = view.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    view.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      if (e.target.closest('.jm-pm,.jm-lb,.jm-poi') && e.pointerType === 'mouse') return;
      pts[e.pointerId] = rel(e);
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      if (pcount() === 1) { down = { x: pts[e.pointerId].x, y: pts[e.pointerId].y, tx: tx, ty: ty, t: Date.now() }; moved = false; }
      if (pcount() === 2) {
        var ids = Object.keys(pts), a = pts[ids[0]], b = pts[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: k, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: tx, ty: ty };
        moved = true;
      }
      world.classList.add('jm-moving');
    });
    view.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) { hover(e); return; }
      pts[e.pointerId] = rel(e);
      if (pcount() >= 2 && pinch) {
        var ids = Object.keys(pts), a = pts[ids[0]], b = pts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var nk = Math.max(kMin, Math.min(kMax, pinch.k * d / pinch.d));
        var X = (pinch.mx - pinch.tx) / pinch.k, Y = (pinch.my - pinch.ty) / pinch.k;
        k = nk; tx = mx - X * nk; ty = my - Y * nk; apply(); return;
      }
      if (down) {
        var p = pts[e.pointerId], dx = p.x - down.x, dy = p.y - down.y;
        if (!moved && Math.hypot(dx, dy) > 5) {
          moved = true; view.classList.add('jm-drag');
          try { view.setPointerCapture(e.pointerId); } catch (_) {}
        }
        if (moved) { tx = down.tx + dx; ty = down.ty + dy; apply(); hideTT(); }
      }
    });
    function up(e) {
      delete pts[e.pointerId];
      if (pcount() < 2) pinch = null;
      if (pcount() === 1) { var id = Object.keys(pts)[0]; down = { x: pts[id].x, y: pts[id].y, tx: tx, ty: ty }; }
      if (!pcount()) {
        view.classList.remove('jm-drag'); world.classList.remove('jm-moving');
        if (down && !moved && e.type === 'pointerup') tap(e);
        down = null;
        setTimeout(function () { moved = false; }, 0);
      }
    }
    view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
    view.addEventListener('lostpointercapture', function (e) { if (pts[e.pointerId]) up(e); });

    var lastTap = 0;
    function tap(e) {
      var t = e.target;
      if (t.classList && t.classList.contains('jm-hit')) {
        if (t.hasAttribute('data-run')) selectRun(t.getAttribute('data-run')); else selectLift(t.getAttribute('data-lift'));
        moved = true; return;
      }
      if (t.closest('.jm-pm,.jm-lb,.jm-poi')) return; // klik ih obrađuje
      var now = Date.now(), p = rel(e);
      if (now - lastTap < 320) { zoomAt(1.8, p.x, p.y, 300); lastTap = 0; return; }
      lastTap = now;
      if (sel || card.classList.contains('on')) clearSel();
    }

    function showHint(txt) { hint.textContent = txt; hint.classList.add('on'); clearTimeout(showHint.t); showHint.t = setTimeout(function () { hint.classList.remove('on'); }, 1300); }
    view.addEventListener('wheel', function (e) {
      var fs = root.classList.contains('jm-fs');
      if (!(e.ctrlKey || e.metaKey || fs)) { showHint(T.hintWheel); return; }
      e.preventDefault();
      var p = rel(e), dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      var f = Math.exp(-dy * (e.ctrlKey && !fs ? .01 : .0022));
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      var nk = Math.max(kMin, Math.min(kMax, k * f)), X = (p.x - tx) / k, Y = (p.y - ty) / k;
      k = nk; tx = p.x - X * nk; ty = p.y - Y * nk; apply();
    }, { passive: false });
    if (isTouch) {
      view.addEventListener('touchstart', function (e) { if (e.touches.length === 1 && !root.classList.contains('jm-fs') && !sessionHintShown) { sessionHintShown = true; showHint(T.hintTouch); } }, { passive: true });
    }
    var sessionHintShown = false;

    // tooltip na prelaz mišem
    var hovered = null;
    function hideTT() { tt.classList.remove('on'); if (hovered) { hovered.classList.remove('hov'); hovered = null; } }
    function hover(e) {
      if (e.pointerType !== 'mouse') return;
      var t = e.target, g = t.classList && t.classList.contains('jm-hit') ? t : null;
      var b = !g && t.closest ? t.closest('.jm-pm,.jm-lb,.jm-poi') : null;
      var label = '';
      if (g && g.hasAttribute('data-run')) { var r = byRun[g.getAttribute('data-run')]; label = T.run + ' ' + r.id + ' · ' + NAZ_TEZ[r.tez]; }
      else if (g) { var z = byLift[g.getAttribute('data-lift')]; label = T.lift + ' ' + z.id + ' · ' + z.ime; }
      else if (b && b.hasAttribute('data-poi')) label = b.getAttribute('aria-label');
      else if (b && b.hasAttribute('data-lift')) { var z2 = byLift[b.getAttribute('data-lift')]; label = T.lift + ' ' + z2.id + ' · ' + z2.ime; }
      else if (b && b.hasAttribute('data-run')) { var r2 = byRun[b.getAttribute('data-run')]; label = T.run + ' ' + r2.id + ' · ' + NAZ_TEZ[r2.tez]; }
      var hg = g && g.hasAttribute('data-run') ? world.querySelector('.jm-p[data-run="' + g.getAttribute('data-run') + '"]') : null;
      if (hovered && hovered !== hg) { hovered.classList.remove('hov'); hovered = null; }
      if (hg) { hg.classList.add('hov'); hovered = hg; }
      if (!label) { tt.classList.remove('on'); return; }
      var p = rel(e); tt.textContent = label;
      var x = Math.min(vw - tt.offsetWidth - 8, p.x + 14), y = Math.max(8, p.y - 38);
      tt.style.transform = 'translate(' + x + 'px,' + y + 'px)'; tt.classList.add('on');
    }
    view.addEventListener('pointerleave', hideTT);

    // tastatura
    view.addEventListener('keydown', function (e) {
      var step = 80, c = { x: vw / 2, y: vh / 2 };
      if (e.key === '+' || e.key === '=') zoomAt(1.4, c.x, c.y, 220);
      else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.4, c.x, c.y, 220);
      else if (e.key === 'ArrowLeft') goTo(k, tx + step, ty, 160);
      else if (e.key === 'ArrowRight') goTo(k, tx - step, ty, 160);
      else if (e.key === 'ArrowUp') goTo(k, tx, ty + step, 160);
      else if (e.key === 'ArrowDown') goTo(k, tx, ty - step, 160);
      else if (e.key === 'Escape') { if (root.classList.contains('jm-fs')) setFs(false); else clearSel(); }
      else return;
      e.preventDefault();
    });

    // kontrole
    function setFs(v) {
      var c = { x: (vw / 2 - tx) / k, y: (vh / 2 - ty) / k }, rel_ = k / kMin;
      root.classList.toggle('jm-fs', v);
      document.documentElement.style.overflow = v ? 'hidden' : '';
      var b = root.querySelector('[data-a="fs"]'); b.innerHTML = v ? I.unfull : I.full; b.setAttribute('aria-label', v ? T.fullOff : T.full); b.title = v ? T.fullOff : T.full;
      bounds(); k = Math.max(kMin, kMin * rel_); tx = vw / 2 - c.x * k; ty = vh / 2 - c.y * k; apply();
      if (v) view.focus({ preventScroll: true });
    }
    root.querySelector('.jm-ctls').addEventListener('click', function (e) {
      var b = e.target.closest('.jm-ctl'); if (!b) return;
      var a = b.getAttribute('data-a'), c = { x: vw / 2, y: vh / 2 };
      if (a === 'in') zoomAt(1.6, c.x, c.y, 280);
      else if (a === 'out') zoomAt(1 / 1.6, c.x, c.y, 280);
      else if (a === 'fit') { clearSel(); home(420); }
      else if (a === 'fs') setFs(!root.classList.contains('jm-fs'));
    });

    // noćna slika unaprijed kad je pregledač slobodan
    (window.requestIdleCallback || function (f) { setTimeout(f, 2500); })(function () { setTimeout(loadNight, 1500); });
    root.dispatchEvent(new CustomEvent('jm:spremno'));
    root.__jm = { selectRun: selectRun, selectLift: selectLift, setNight: setNight, home: home, setFs: setFs };
  }
})();
