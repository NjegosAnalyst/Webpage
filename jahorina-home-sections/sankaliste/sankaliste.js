/* =====================================================================
   JAHORINA — SANKALIŠTE (početna, ispod Snowboard parka i Ski bike-a) · v1 "sat sankališta"
   Tema hero-a i ostalih blokova (noćni ton, jedan cyan akcenat, Archivo/Barlow, kadar preko cijele širine, fotografija
   u pozadini kadra, naslov sa iscrtanim krajem, staklo i blagi neumorfizam), sa svojim detaljima:
     · cik-cak sa blokom iznad (Snowboard park počinje sa tekstom lijevo): ovdje je tekst desno, fotografija lijevo;
     · SAT SANKALIŠTA (glavni detalj): tanki 24-satni brojčanik na fotografiji (dan gore, noć dolje). Blijedi luk
       dnevnog skijanja, cyan luk sankanja (16–18 h, iz teksta stranice) i blijedi luk noćnog skijanja; kazaljka
       pokazuje trenutno vrijeme na Jahorini (Europe/Sarajevo);
     · STATUS (zeleno / crveno, iznad sata): "Radi sada · do 18:00" ili "Ne radi · otvara se u 16:00"; računa se
       iz radnog vremena sa stranice, a osvježava se sam (svakih 20 s);
     · podaci kao spisak sa tankim linijama (staza, lokacija, sidro, sanke), dugmad bijelo "Cijene karata" (link
       "OVDJE" sa stranice) + stakleno "Galerija", ispod tihi linkovi "Više o sankalištu" i video (ako ga stranica ima);
     · ulazak (jednom): kadar sjedne, fotografija izađe iz sumraka, tekst se podigne, sat se iscrta (lukovi, pa
       kazaljka prođe dan do trenutnog vremena) i upali se status.

   SADRŽAJ JE IZ WORDPRESSA (data-stranica = slug; ako slug ne postoji, traži se stranica sa "sank" u naslovu):
   nadnaslov = naslov stranice; uvod = rečenica o mališanima / prvom sankalištu (inače prva rečenica o sankanju);
   dužina i širina staze, broj staze i mjesto, sidro, radno vrijeme ("od 16h do 18h"), najam sanki na ski kasi,
   "svoje sanke ostavite kući", link za cijene ("OVDJE"), YouTube video i fotografije iz teksta stranice. Ako tekst
   stranice kaže da sankalište danas/trenutno ne radi, status je crven sa tim razlogom. Dok WordPress ne odgovori,
   stoji ugrađeni tekst (stranica od 10. 10. 2026). Prijavljeni admin vidi razlog kad nešto nedostaje.

   Ugradnja: Elementor HTML widget sa <div id="jsk-sankaliste"></div> + ovaj fajl sa jsDelivr-a (slike/ iz istog commita).
   Podešavanja na <div id="jsk-sankaliste"> (sva su neobavezna):
     data-stranica="sankaliste"   (slug WordPress stranice)
     data-sezona="15.12-31.3"     (van tih datuma status je "Ne radi · van sezone"; prazno = bez provjere sezone)
     data-status="ne-radi"        (ručno: danas ne radi, npr. vjetar; podrazumijevano "auto")
     data-cijene="https://…"      (zamjena za link "OVDJE" sa stranice)
     data-video="https://youtu.be/…"  (zamjena za video sa stranice)
     data-sat="2026-12-20 16:30"  (samo za probu: zamišljeno vrijeme umjesto stvarnog)
   GA: Cijene karata → sankaliste_klik (cilj: cijene), "Više o sankalištu" → sankaliste_klik (cilj: stranica),
       Galerija → sankaliste_galerija, video → sankaliste_video.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jsk-sankaliste');
  if (!root || root.__jsk) return;
  root.__jsk = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var O = location.origin;
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  function opt(k, def) { var v = root.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var SLUG = opt('stranica', 'sankaliste').replace(/^\/+|\/+$/g, '');
  var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ugrađeni tekst = tekst stranice Sankalište (10. 10. 2026); naslov i kratki natpisi su dizajn; EN je prevod
  var T = EN ? {
    aria: 'Sledding track', eyebrow: 'Sledding track', h: ['Sledding', 'like old times'],
    lead: 'If you have little ones, or you simply miss that carefree feeling from 20, 30 or more years ago, it is time to get excited, because Jahorina has built its first sledding track!',
    prices: 'Ticket prices', pricesS: 'Prices', gal: 'Gallery', more: 'More about the sledding track', video: 'Watch the video', vid: 'Video: sledding track',
    fSize: 'Length × width', fLen: 'Track length', fWhere: 'Location', slope: 'Slope', fLift: 'Up the hill', lift: function (n) { return n + ' T-bar'; },
    fSled: 'Sleds', sled: function (n) { return 'Rent at the ' + n + ' ski desk'; }, sledAny: 'Rent at the ski desk', own: 'Bring none: the T-bar takes adapted sleds only',
    dial: 'Sledding', daily: 'every day', day: 'DAY SKIING', night: 'NIGHT', clockAria: function (a, b) { return 'Sledding track hours: every day from ' + a + ' to ' + b + ', between day and night skiing'; },
    open: 'Open now', closed: 'Closed', closedToday: 'Closed today', until: function (t) { return 'until ' + t; },
    opens: function (t) { return 'opens at ' + t; }, opensTmr: function (t) { return 'opens tomorrow at ' + t; },
    season: 'off season', seasonFrom: function (dd, mm) { return 'opens ' + dd + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mm - 1]; },
    photos: ['Parent and child on a wooden sled at dusk, snow spraying behind them', 'A smiling sledder takes a turn under the floodlights at night', 'A couple sledding down a groomed run through a lit forest'],
    galT: 'Photos', photo: 'Photo', prev: 'Previous photo', next: 'Next photo', close: 'Close',
    why: 'WordPress', whyTail: 'showing built-in content'
  } : {
    aria: 'Sankalište', eyebrow: 'Sankalište', h: ['Sankanje', 'kao nekad'],
    lead: 'Ukoliko sada imate mališane, ili ste se i sami uželjeli tog bezbrižnog osjećaja od prije 20, 30 ili više godina, vrijeme je da počnete da se radujete, jer je na Jahorini izgrađeno prvo Sankalište!',
    prices: 'Cijene karata', pricesS: 'Cijene', gal: 'Galerija', more: 'Više o sankalištu', video: 'Pogledaj video', vid: 'Video: Sankalište',
    fSize: 'Dužina i širina', fLen: 'Dužina staze', fWhere: 'Lokacija', slope: 'Staza', fLift: 'Na vrh', lift: function (n) { return 'Sidro ' + n; },
    fSled: 'Sanke', sled: function (n) { return 'Najam na ski kasi ' + n; }, sledAny: 'Najam na ski kasi', own: 'Svoje ostavite kod kuće: za sidro trebaju sanke sa adapterom',
    dial: 'Sankanje', daily: 'svaki dan', day: 'DNEVNO SKIJANJE', night: 'NOĆNO', clockAria: function (a, b) { return 'Radno vrijeme sankališta: svaki dan od ' + a + ' do ' + b + ', između dnevnog i noćnog skijanja'; },
    open: 'Radi sada', closed: 'Ne radi', closedToday: 'Danas ne radi', until: function (t) { return 'do ' + t; },
    opens: function (t) { return 'otvara se u ' + t; }, opensTmr: function (t) { return 'otvara se sutra u ' + t; },
    season: 'van sezone', seasonFrom: function (dd, mm) { return 'otvara se ' + dd + '. ' + mm + '.'; },
    photos: ['Roditelj i dijete na drvenim sankama u sumrak, iza njih prši snijeg', 'Nasmijana sankašica u zavoju pod rasvjetom staze, noću', 'Par na sankama na uređenoj stazi kroz osvijetljenu šumu'],
    galT: 'Fotografije', photo: 'Fotografija', prev: 'Prethodna fotografija', next: 'Sljedeća fotografija', close: 'Zatvori',
    why: 'WordPress', whyTail: 'prikazan je ugrađeni sadržaj'
  };
  function ytId(s) {
    s = String(s || '').replace(/\\\//g, '/');
    var m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:[^"'\s<>]*?&(?:amp;)?)?v=|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s.trim()) ? s.trim() : '';
  }
  // podaci sa stranice (ugrađeni = stranica od 10. 10. 2026); WordPress ih zamijeni kad se tekst promijeni
  var PAGE = O + (EN ? '/en/' : '/') + SLUG + '/';
  var FIX = { prices: opt('cijene', ''), yt: ytId(opt('video', '')) };
  var DATA = {
    eyebrow: T.eyebrow, lead: T.lead, from: 16 * 60, to: 18 * 60, closed: false, why: '',
    facts: [], link: PAGE, prices: FIX.prices || PAGE, yt: FIX.yt
  };
  DATA.facts = factsOf({ len: '600', wid: '5', slope: '7', place: 'Poljice', lift: 'Poljice', rent: true, desk: 'Poljice', own: true });

  // fotografije: roditelj i dijete u sumrak (pozadina kadra), noćna vožnja i šuma idu u galeriju; galerija dobije i slike sa stranice
  var IMG = { main: HERE + 'slike/sank-glavna.webp', mainS: HERE + 'slike/sank-glavna-1000.webp' };
  var BASE = [{ full: IMG.main, alt: T.photos[0] }, { full: HERE + 'slike/sank-noc.webp', alt: T.photos[1] }, { full: HERE + 'slike/sank-suma.webp', alt: T.photos[2] }];
  var GAL = BASE.slice();

  /* ---------- izgled ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;--accent-2:#2CCBF8;',
    '--ok:#4ADE80;--no:#FF5C5C;--surface:#111A2C;--nm-surface:rgba(16,25,42,.62);--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jsk--boxed{border-radius:28px;overflow:hidden}',
    '#R *,#R *::before,#R *::after{box-sizing:border-box}',
    '#R a{color:inherit;text-decoration:none;box-shadow:none}',
    '#R h2{font-family:var(--fd)!important;color:var(--text)!important;-webkit-text-fill-color:currentColor!important;opacity:1!important;background:none!important;text-shadow:none!important;margin:0;padding:0;text-transform:none!important;border:0}',
    '#R p{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0;overflow:visible}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible,#R button:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    /* puna širina ekrana, isti rub kao kadar hero-a; --in poravnava sadržaj sa mrežom 1240px; --gap = ritam između blokova.
       Kad je Snowboard park odmah iznad (.jsk--join), on već daje cijeli razmak ispod sebe, pa ovdje ostaje samo rub */
    '#R .jsk-wrap{--g:clamp(14px,1.6vw,22px);--gap:clamp(56px,7vw,100px);--pt:calc(var(--gap) / 2 + var(--g));--in:max(0px,calc((100vw - 1240px) / 2 + 48px - var(--g)));position:relative;padding:var(--pt) var(--g) var(--gap)}',
    '#R.jsk--join .jsk-wrap{--pt:var(--g)}',
    '#R{container-type:inline-size}',
    '@supports (width:1cqw){#R .jsk-wrap{--in:max(0px,calc((100cqw - 1240px) / 2 + 48px - var(--g)))}}',
    '#R .jsk-wrap{--side:max(clamp(26px,3.2vw,52px),var(--in))}',

    /* kadar kao u hero-u; --L = širina dijela sa tekstom (desno), fotografija je lijevo od njega i utapa se u tamu */
    '#R .jsk-frame{--st:var(--no);--st-r:rgba(255,92,92,.4);--st-g:rgba(255,92,92,.2);--L:min(calc(var(--side) + 560px),50%);--dz:clamp(176px,14vw,236px);--cx:max(clamp(24px,2.6vw,44px),calc(var(--side) - var(--in) * .45));--cy:clamp(40px,4.4vw,70px);',
    'position:relative;transform-origin:50% 0;display:flex;align-items:center;justify-content:flex-end;min-height:clamp(640px,46vw,800px);border-radius:26px;overflow:hidden;isolation:isolate;background:var(--bg);',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jsk-frame::after{content:"";position:absolute;inset:0;z-index:8;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    '#R .jsk-bg{position:absolute;inset:0;overflow:hidden;cursor:zoom-in;-webkit-tap-highlight-color:transparent}',
    '#R .jsk-ph{position:absolute;top:0;bottom:0;left:0;right:calc(var(--L) - 120px);-webkit-mask-image:linear-gradient(270deg,transparent 0,#000 300px);mask-image:linear-gradient(270deg,transparent 0,#000 300px)}',
    '#R .jsk-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--pos,72% 50%);filter:saturate(.8) brightness(var(--lum,.8)) contrast(1.06)}',
    /* noćna obrada kao u ostalim blokovima; tamni prelaz zdesna ispod teksta, odozdo, odozgo (ispod sata) i vinjeta */
    '#R .jsk-tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.34}',
    '#R .jsk-scrim{position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(270deg,rgba(6,11,22,.93) 0,rgba(6,11,22,.84) calc(var(--L) - 150px),rgba(6,11,22,.34) calc(var(--L) + 30px),rgba(6,11,22,0) calc(var(--L) + 230px)),',
    'linear-gradient(0deg,rgba(6,11,22,.5) 0%,rgba(6,11,22,0) 28%),linear-gradient(180deg,rgba(6,11,22,.42) 0%,rgba(6,11,22,0) 30%),radial-gradient(130% 100% at 32% 55%,transparent 56%,rgba(4,8,18,.5) 100%)}',

    /* SAT SANKALIŠTA: status iznad, pa stakleni brojčanik (24 h, podne gore) */
    '#R .jsk-clock{position:absolute;z-index:3;left:var(--cx);top:var(--cy);display:flex;flex-direction:column;align-items:flex-start;gap:16px;pointer-events:none}',
    '#R .jsk-dial{position:relative;width:var(--dz);height:var(--dz);border-radius:50%;',
    'background:radial-gradient(circle at 50% 38%,rgba(20,31,52,.42),rgba(8,13,24,.62) 72%);-webkit-backdrop-filter:blur(12px) saturate(1.1);backdrop-filter:blur(12px) saturate(1.1);',
    'box-shadow:0 22px 44px -22px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.13),inset 0 1px 0 rgba(255,255,255,.1),inset 0 -10px 24px rgba(0,0,0,.25)}',
    '#R .jsk-dial svg{position:absolute;inset:0;width:100%;height:100%}',
    '#R .jsk-tk{stroke:rgba(255,255,255,.3);stroke-width:.9;stroke-linecap:round}',
    '#R .jsk-tk--m{stroke:rgba(255,255,255,.62);stroke-width:1.3}',
    '#R .jsk-ring{fill:none;stroke:rgba(255,255,255,.1);stroke-width:1}',
    '#R .jsk-seg{fill:none;stroke:#fff;stroke-width:2;stroke-linecap:butt}',
    '#R .jsk-arc{fill:none;stroke:var(--accent-2);stroke-width:3.6;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(0,185,242,.85))}',
    "#R .jsk-lb{font:600 6.4px/1 'Archivo',system-ui,sans-serif;letter-spacing:1.5px;fill:rgba(255,255,255,.5)}",
    /* kazaljka: od ivice natpisa u sredini do prstena, kuglica na prstenu u boji statusa */
    '#R .jsk-hand{transform-box:view-box;transform-origin:100px 100px;transform:rotate(var(--a,0deg))}',
    '#R .jsk-hand line{stroke:rgba(255,255,255,.92);stroke-width:1.4;stroke-linecap:round}',
    '#R.jsk--open .jsk-frame{--st:var(--ok);--st-r:rgba(74,222,128,.4);--st-g:rgba(74,222,128,.2)}',
    '#R .jsk-hand circle{fill:var(--st);stroke:#0A1120;stroke-width:1.2;filter:drop-shadow(0 0 3px var(--st))}',
    '#R .jsk-dial-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:5px}',
    '#R .jsk-dial-c small{font:600 calc(var(--dz) * .04)/1 var(--fd);letter-spacing:2.4px;text-transform:uppercase;color:rgba(255,255,255,.6)}',
    '#R .jsk-dial-c b{font:800 calc(var(--dz) * .13)/1 var(--fd);letter-spacing:-.02em;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#R .jsk-dial-c b i{font-style:normal;font-weight:600;font-size:.5em;margin-left:2px;color:rgba(255,255,255,.7)}',
    /* STATUS (zeleno = radi, crveno = ne radi): staklena pilula sa svjetlom */
    '#R .jsk-st{display:inline-flex;align-items:center;gap:10px;height:38px;padding:0 16px 0 14px;border-radius:40px;white-space:nowrap;',
    'background:rgba(10,17,32,.52);-webkit-backdrop-filter:blur(12px) saturate(1.15);backdrop-filter:blur(12px) saturate(1.15);',
    'box-shadow:4px 4px 12px rgba(0,0,0,.38),-3px -3px 10px rgba(78,104,150,.12),inset 0 0 0 1px var(--st-r),inset 1px 1px 0 rgba(255,255,255,.08)}',
    '#R .jsk-st i{position:relative;width:9px;height:9px;border-radius:50%;flex-shrink:0;background:var(--st);box-shadow:0 0 0 3px var(--st-g),0 0 12px var(--st)}',
    '#R.jsk--open .jsk-st i::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1.5px solid var(--st);opacity:0;animation:jskPing 2.6s ease-out infinite}',
    '@keyframes jskPing{0%{transform:scale(.7);opacity:.7}70%,100%{transform:scale(2.3);opacity:0}}',
    '#R .jsk-st b{font:700 11px/1 var(--fd);letter-spacing:2.2px;text-transform:uppercase;color:var(--st)}',
    '#R .jsk-st span{position:relative;padding-left:11px;font:500 13.5px/1 var(--fb);color:rgba(255,255,255,.86)}',
    '#R .jsk-st span:empty{display:none}',
    '#R .jsk-st span::before{content:"";position:absolute;left:0;top:50%;width:1px;height:14px;margin-top:-7px;background:rgba(255,255,255,.22)}',

    /* tekst desno (cik-cak sa Snowboard parkom iznad), desna ivica poravnata sa mrežom 1240px */
    '#R .jsk-body{position:relative;z-index:2;width:calc(480px + var(--side));max-width:50%;padding:clamp(56px,6vw,90px) var(--side) clamp(56px,6vw,90px) 0}',
    '#R .jsk-eye{display:flex;align-items:center;gap:14px;margin-bottom:22px;font:600 11px/1 var(--fd);letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.86)}',
    '#R .jsk-eye::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(46px,5vw,80px);font-weight:800;line-height:.95;letter-spacing:-.025em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.45))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jsk-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.94)!important}}',
    '#R .jsk-lead{margin-top:22px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:46ch;text-wrap:pretty}',
    /* podaci: spisak sa tankim linijama (natpis lijevo, vrijednost desno) */
    '#R .jsk-spec{margin-top:26px!important;width:min(100%,480px);border-bottom:1px solid rgba(255,255,255,.12)}',
    '#R .jsk-spec:empty{display:none}',
    '#R .jsk-spec li{position:relative;display:flex;align-items:baseline;justify-content:space-between;gap:18px;padding:11px 0!important;border-top:1px solid rgba(255,255,255,.12)}',
    '#R .jsk-spec li:first-child::before{content:"";position:absolute;left:0;top:-1px;width:22px;height:1px;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7)}',
    '#R .jsk-spec small{flex-shrink:0;font:500 13px/1.3 var(--fb);color:var(--text-3)}',
    '#R .jsk-spec b{font:600 15px/1.3 var(--fd);letter-spacing:.005em;color:#fff;text-align:right;font-variant-numeric:tabular-nums}',
    '#R .jsk-spec b em{display:block;margin-top:3px;font:400 12px/1.35 var(--fb);font-style:normal;letter-spacing:0;color:var(--text-3)}',
    /* dugmad kao u ostalim blokovima: bijelo glavno + stakleno sporedno, iste širine i visine, široka kao spisak */
    '#R .jsk-acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:26px;width:min(100%,480px)}',
    '#R .jsk-btn{all:unset;position:relative!important;isolation:isolate;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 16px!important;border-radius:40px!important;cursor:pointer;',
    'white-space:nowrap;font:600 13.5px/1 var(--fb)!important;letter-spacing:.2px!important}',
    '#R .jsk-btn svg{width:16px;height:16px}',
    '#R .jsk-s{display:none}',
    '#R .jsk-btn--solid{overflow:hidden;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6)!important;transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)!important}',
    '#R .jsk-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jsk-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)!important}',
    '#R .jsk-btn--solid:hover::after{animation:jskShine 1.6s ease-in-out}',
    '@keyframes jskShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jsk-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff!important}',
    '#R .jsk-btn--ghost{color:#fff!important;background:var(--nm-surface)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:color .2s,box-shadow .25s}',
    '#R .jsk-btn--ghost svg{color:var(--accent)}',
    '#R .jsk-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),inset 0 0 0 1px rgba(0,185,242,.4),0 0 22px rgba(0,185,242,.35)!important}',
    '#R .jsk-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)!important}',
    /* tihi linkovi ispod dugmadi: "Više o sankalištu" | video (ako ga stranica ima) */
    '#R .jsk-foot{display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px;margin-top:18px;font:500 13px/1.3 var(--fb);color:var(--text-3)}',
    '#R .jsk-link{all:unset;box-sizing:border-box!important;display:inline-flex!important;align-items:center;gap:7px;padding:4px 0!important;cursor:pointer;font:500 13px/1.3 var(--fb)!important;color:rgba(255,255,255,.72)!important;transition:color .2s}',
    '#R .jsk-link svg{width:15px;height:15px;color:var(--accent)}',
    '#R .jsk-link:hover{color:var(--accent)!important}',
    '#R .jsk-foot > i{width:1px;height:14px;background:rgba(255,255,255,.2)}',
    '#R .jsk-why{display:block;margin-top:14px;font:500 11.5px/1.4 var(--fb);color:#FFB547}',

    /* ulazak (jednom): klase jsk-anim/jsk-on dodaje skripta samo kad postoji IntersectionObserver i nije uključeno smanjeno kretanje */
    '#R.jsk-anim .jsk-frame{opacity:0;transform:translateY(28px)}',
    '#R.jsk-anim.jsk-on .jsk-frame{opacity:1;transform:none;transition:opacity .8s ease,transform 1s cubic-bezier(.2,.7,.2,1)}',
    '#R.jsk-anim .jsk-ph img{opacity:0;filter:saturate(.8) brightness(.2) contrast(1.06) blur(6px)}',
    '#R.jsk-anim.jsk-on .jsk-ph img{opacity:1;filter:saturate(.8) brightness(var(--lum,.8)) contrast(1.06) blur(0);transition:opacity 1.2s ease .2s,filter 1.6s ease .2s}',
    '#R.jsk-anim .jsk-up{opacity:0;transform:translateY(20px)}',
    '#R.jsk-anim.jsk-on .jsk-up{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .95s cubic-bezier(.2,.7,.2,1) var(--d,0s)}',
    '#R.jsk-anim .jsk-eye::before{transform:scaleX(0);transform-origin:left center}',
    '#R.jsk-anim.jsk-on .jsk-eye::before{transform:none;transition:transform .6s cubic-bezier(.2,.7,.2,1) .5s}',
    /* sat: brojčanik se pojavi, podjele i lukovi se iscrtaju, kazaljka prođe dan do sada, pa se upali status */
    '#R.jsk-anim .jsk-dial{opacity:0;transform:scale(.94)}',
    '#R.jsk-anim.jsk-on .jsk-dial{opacity:1;transform:none;transition:opacity .9s ease .55s,transform 1.1s cubic-bezier(.2,.7,.2,1) .55s}',
    '#R.jsk-anim .jsk-tk,#R.jsk-anim .jsk-lb,#R.jsk-anim .jsk-dial-c{opacity:0}',
    '#R.jsk-anim.jsk-on .jsk-tk,#R.jsk-anim.jsk-on .jsk-lb,#R.jsk-anim.jsk-on .jsk-dial-c{opacity:1;transition:opacity .6s ease var(--d,.9s)}',
    '#R.jsk-anim .jsk-seg,#R.jsk-anim .jsk-arc{stroke-dasharray:1;stroke-dashoffset:1}',
    '#R.jsk-anim.jsk-on .jsk-seg,#R.jsk-anim.jsk-on .jsk-arc{stroke-dashoffset:0;transition:stroke-dashoffset .55s cubic-bezier(.4,0,.2,1) var(--d,1s)}',
    '#R.jsk-anim .jsk-hand{opacity:0}',
    '#R.jsk-anim.jsk-on .jsk-hand{opacity:1;transition:opacity .4s ease 1.5s}',
    '#R.jsk-anim .jsk-st{opacity:0;transform:translateY(-8px)}',
    '#R.jsk-anim.jsk-on .jsk-st{opacity:1;transform:none;transition:opacity .6s ease 2.9s,transform .8s cubic-bezier(.2,.7,.2,1) 2.9s}',

    /* manji laptop: uži tekst, manji sat */
    '@media (max-width:1180px){#R .jsk-frame{--L:min(calc(var(--side) + 500px),53%);--dz:clamp(164px,15vw,190px)}#R .jsk-body{width:calc(430px + var(--side))}',
    '#R .jsk-lead{max-width:42ch}#R .jsk-btn{padding:0 12px!important}#R .jsk-spec,#R .jsk-acts{width:min(100%,430px)}}',
    /* tablet i telefon: fotografija gore (sat na njenoj donjoj lijevoj strani, status pored), tekst ispod */
    '@media (max-width:980px){',
    '#R .jsk-frame{--mh:min(66vw,540px);--dz:clamp(132px,22vw,168px);flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:0}',
    '#R .jsk-bg{position:relative;inset:auto;height:var(--mh);flex-shrink:0;-webkit-mask-image:linear-gradient(180deg,#000 74%,transparent 100%);mask-image:linear-gradient(180deg,#000 74%,transparent 100%)}',
    '#R .jsk-ph{right:0;-webkit-mask-image:none;mask-image:none}',
    '#R .jsk-ph img{object-position:var(--mpos,62% 55%)}',
    '#R .jsk-scrim{background:linear-gradient(0deg,rgba(6,11,22,.62) 0%,rgba(6,11,22,0) 42%),linear-gradient(180deg,rgba(6,11,22,.36) 0%,rgba(6,11,22,0) 22%),linear-gradient(90deg,rgba(6,11,22,.38) 0%,rgba(6,11,22,0) 46%)}',
    '#R .jsk-clock{left:clamp(16px,4vw,40px);top:calc(var(--mh) - var(--dz) - clamp(14px,3vw,30px));flex-direction:row-reverse;align-items:flex-end;gap:14px}',
    '#R .jsk-st{margin-bottom:6px}',
    '#R .jsk-body{width:auto;max-width:none;padding:clamp(18px,3vw,30px) clamp(22px,6vw,56px) clamp(32px,5vw,52px)}',
    '#R h2{font-size:clamp(42px,7.4vw,64px)}',
    '#R .jsk-lead{max-width:56ch}',
    '#R .jsk-spec,#R .jsk-acts{width:min(100%,520px)}}',
    '@media (max-width:760px){',
    '#R .jsk-frame{--mh:min(112vw,480px);--dz:clamp(118px,34vw,138px);border-radius:24px}',
    '#R .jsk-clock{left:14px;top:14px;gap:10px;align-items:center}',
    '#R .jsk-st{flex-direction:column;align-items:flex-start;justify-content:center;gap:6px;height:auto;padding:10px 14px 10px 30px;border-radius:18px;margin-bottom:0}',
    '#R .jsk-st i{position:absolute;left:13px;top:13px;width:8px;height:8px}',
    '#R .jsk-st b{font-size:10.5px;letter-spacing:2px}',
    '#R .jsk-st span{padding-left:0;font-size:12.5px;line-height:1.2;white-space:normal;max-width:150px}',
    '#R .jsk-st span::before{display:none}',
    '#R .jsk-body{padding:12px 20px 30px}',
    '#R .jsk-eye{gap:10px;margin-bottom:16px;font-size:10px;letter-spacing:3px}',
    '#R .jsk-eye::before{width:22px}',
    '#R h2{font-size:clamp(38px,11.4vw,54px)}',
    '#R .jsk-lead{margin-top:16px}',
    '#R .jsk-spec{margin-top:22px!important}',
    '#R .jsk-spec li{padding:10px 0!important}',
    '#R .jsk-spec small{font-size:12.5px}',
    '#R .jsk-spec b{font-size:14px}',
    '#R .jsk-acts{gap:8px;margin-top:22px;width:100%}',
    '#R .jsk-btn{height:42px;padding:0 12px!important;font-size:13px!important}',
    '#R .jsk-l{display:none}',
    '#R .jsk-s{display:inline}}',
    '@media (max-width:360px){#R .jsk-acts{grid-template-columns:1fr}#R .jsk-st span{max-width:120px}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}',

    /* fotografije preko cijelog ekrana (iste kao u ostalim blokovima) */
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
    '#L .jsk-lb-close{top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px)}',
    '#L .jsk-lb-prev{left:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L .jsk-lb-next{right:clamp(10px,2vw,28px);top:50%;transform:translateY(-50%)}',
    '#L.is-one .jsk-lb-prev,#L.is-one .jsk-lb-next{display:none!important}',
    '@media (max-width:760px){#L img{max-height:calc(100vh - 210px);border-radius:14px}#L .jsk-lb-prev,#L .jsk-lb-next{top:auto;bottom:22px;transform:none}#L .jsk-lb-prev{left:calc(50% - 60px)}#L .jsk-lb-next{right:calc(50% - 60px)}}',
    '@media (prefers-reduced-motion:reduce){#L,#L figure{transition:none!important}}',

    /* video preko cijelog ekrana (YouTube se učitava tek na klik, kao u baru) */
    '#V{position:fixed;inset:0;z-index:2147483000;display:none;place-items:center;padding:clamp(16px,4vw,56px);background:rgba(6,11,22,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;transition:opacity .3s ease;color-scheme:dark}',
    '#V.is-shown{display:grid}',
    '#V.is-open{opacity:1}',
    '#V *{box-sizing:border-box}',
    '#V .jsk-v-box{position:relative;width:min(1200px,100%,calc((100vh - 140px) * 16 / 9));aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#000;box-shadow:0 40px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06);transform:scale(.97);transition:transform .35s cubic-bezier(.2,.7,.2,1)}',
    '#V.is-open .jsk-v-box{transform:none}',
    '#V iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '#V button{all:unset;position:absolute!important;top:clamp(12px,2vw,24px);right:clamp(12px,2vw,24px);box-sizing:border-box!important;width:48px!important;height:48px!important;border-radius:50%!important;display:grid!important;place-items:center;cursor:pointer;',
    'color:rgba(255,255,255,.82)!important;background:#131D31!important;box-shadow:3px 3px 7px rgba(0,0,0,.45),-2px -2px 6px rgba(70,96,142,.1)!important;transition:color .2s}',
    '#V button svg{display:block;width:20px;height:20px}',
    '#V button:hover{color:#00B9F2!important}',
    '#V button:focus-visible{outline:2px solid #00B9F2!important;outline-offset:3px!important}',
    '@media (prefers-reduced-motion:reduce){#V,#V .jsk-v-box{transition:none!important}}'
  ].join('\n').replace(/#R/g, '#jsk-sankaliste').replace(/#L/g, '#jsk-lb').replace(/#V/g, '#jsk-vid');

  // stil se uvijek osvježi: Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi ostao stil stare verzije
  var st = d.getElementById('jsk-css');
  if (!st) { st = d.createElement('style'); st.id = 'jsk-css'; (d.head || d.documentElement).appendChild(st); }
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
    arrow: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    ticket: svg('<path d="M4 7.5 C4 6.7 4.7 6 5.5 6 H18.5 C19.3 6 20 6.7 20 7.5 V9.6 C18.9 9.8 18.1 10.8 18.1 12 C18.1 13.2 18.9 14.2 20 14.4 V16.5 C20 17.3 19.3 18 18.5 18 H5.5 C4.7 18 4 17.3 4 16.5 V14.4 C5.1 14.2 5.9 13.2 5.9 12 C5.9 10.8 5.1 9.8 4 9.6 Z M14.5 6.4 V8 M14.5 11.2 V12.8 M14.5 16 V17.6" ' + S + '/>'),
    photos: svg('<rect x="3.5" y="6" width="13.5" height="12" rx="2.2" ' + S + '/><path d="M7 3.8 H18.3 C19.5 3.8 20.5 4.8 20.5 6 V14.6 M3.9 15.6 L8 11.6 L11 14.4 L12.8 12.8 L16.8 16.4" ' + S + '/><circle cx="12.6" cy="9.6" r="1.1" ' + S + '/>'),
    play: svg('<circle cx="12" cy="12" r="8.6" ' + S + '/><path d="M10.4 8.9 L15.2 12 L10.4 15.1 Z" fill="currentColor" stroke="none"/>'),
    prev: svg('<path d="M19 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg('<path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    close: svg('<path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // dugi natpis (računar) i kratki (telefon)
  function lbl(l, s) { return l === s ? esc(l) : '<span class="jsk-l">' + esc(l) + '</span><span class="jsk-s">' + esc(s) + '</span>'; }
  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clip(s, n) {
    if (s.length <= n) return s;
    s = s.slice(0, n); var i = s.lastIndexOf(' ');
    return (i > n * .6 ? s.slice(0, i) : s).replace(/[\s,;:.–—-]+$/, '') + '…';
  }
  function abs(u) { try { return new URL(u, O + '/').href; } catch (e) { return u; } }
  function now() { return w.performance && performance.now ? performance.now() : Date.now(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hm(min) { return pad(Math.floor(min / 60) % 24) + ':' + pad(min % 60); }
  function hh(min) { return min % 60 ? hm(min) : String(min / 60 | 0); }
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
  // rečenice teksta; tačka u broju (3.000) ne prekida rečenicu
  function sentences(p) { return (clean(p).match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]+|$)/g) || []).map(clean).filter(Boolean); }

  // podaci za spisak: staza (dužina × širina), lokacija (broj staze · mjesto), sidro, sanke (najam na ski kasi)
  function factsOf(f) {
    var r = [];
    if (f.len && f.wid) r.push({ l: T.fSize, v: f.len + ' m × ' + f.wid + ' m' });
    else if (f.len) r.push({ l: T.fLen, v: f.len + ' m' });
    var where = [f.slope ? T.slope + ' ' + f.slope : '', f.place || ''].filter(Boolean).join(' · ');
    if (where) r.push({ l: T.fWhere, v: where });
    if (f.lift) r.push({ l: T.fLift, v: T.lift(f.lift) });
    if (f.rent) r.push({ l: T.fSled, v: f.desk ? T.sled(f.desk) : T.sledAny, s: f.own ? T.own : '' });
    return r;
  }

  /* ---------- SAT SANKALIŠTA (SVG, 24 h, podne gore) ---------- */
  function ang(min) { return (min / 60 - 12) * 15; }   // ugao kazaljke: 12 h gore, 18 h desno, ponoć dolje
  function pt(a, r) { var t = (a - 90) * Math.PI / 180; return [100 + r * Math.cos(t), 100 + r * Math.sin(t)]; }
  function f1(x) { return Math.round(x * 100) / 100; }
  function arcD(a0, a1, r, ccw) {
    var p0 = pt(a0, r), p1 = pt(a1, r), big = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + ' A' + r + ' ' + r + ' 0 ' + big + ' ' + (ccw ? 0 : 1) + ' ' + f1(p1[0]) + ' ' + f1(p1[1]);
  }
  function dialSVG() {
    var o = '', R = 81, h, a, p, q, i;
    // podjele: svaki sat, duže na 0, 6, 12 i 18 h
    for (h = 0; h < 24; h++) {
      a = h * 15; var m = h % 6 === 0;
      p = pt(a, m ? 86.5 : 88.5); q = pt(a, 93);
      o += '<line class="jsk-tk' + (m ? ' jsk-tk--m' : '') + '" x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '" style="--d:' + (.75 + h * .02).toFixed(2) + 's"/>';
    }
    o += '<circle class="jsk-ring" cx="100" cy="100" r="' + R + '"/>';
    // dnevno skijanje (ulazi iz blijedog do početka sankanja) i noćno skijanje (od kraja sankanja, nestaje u noć)
    var f = DATA.from, t = DATA.to;
    for (i = 0; i < 7; i++) {
      var s0 = f - (7 - i) * 60, s1 = s0 + 60;
      o += '<path class="jsk-seg" pathLength="1" d="' + arcD(ang(s0), ang(s1) - .6, R) + '" style="opacity:' + (.14 + i * .07).toFixed(2) + ';--d:' + (1 + i * .06).toFixed(2) + 's"/>';
    }
    for (i = 0; i < 4; i++) {
      var n0 = t + i * 60, n1 = n0 + 60;
      o += '<path class="jsk-seg" pathLength="1" d="' + arcD(ang(n0) + .6, ang(n1), R) + '" style="opacity:' + (.52 - i * .12).toFixed(2) + ';--d:' + (1.62 + i * .06).toFixed(2) + 's"/>';
    }
    // natpisi uz lukove (kao na prstenu sata): dnevno skijanje gore, noćno desno dolje (čita se slijeva nadesno)
    var dm = (ang(f - 7 * 60) + ang(f)) / 2;
    o += '<path id="jsk-pd" d="' + arcD(dm - 60, dm + 60, 70) + '" fill="none"/>';
    o += '<path id="jsk-pn" d="' + arcD(ang(t + 150) + 40, ang(t + 150) - 40, 74, true) + '" fill="none"/>';
    o += '<text class="jsk-lb" style="--d:1.3s"><textPath href="#jsk-pd" xlink:href="#jsk-pd" startOffset="50%" text-anchor="middle">' + esc(T.day) + '</textPath></text>';
    o += '<text class="jsk-lb" style="--d:1.5s"><textPath href="#jsk-pn" xlink:href="#jsk-pn" startOffset="50%" text-anchor="middle">' + esc(T.night) + '</textPath></text>';
    // sankanje: cyan luk
    o += '<path class="jsk-arc" pathLength="1" d="' + arcD(ang(f), ang(t), R) + '" style="--d:1.25s"/>';
    // kazaljka (sadašnje vrijeme) sa kuglicom u boji statusa
    p = pt(0, 37); q = pt(0, 75); var b = pt(0, R);
    o += '<g class="jsk-hand"><line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '"/><circle cx="' + f1(b[0]) + '" cy="' + f1(b[1]) + '" r="3.6"/></g>';
    return '<svg viewBox="0 0 200 200" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false">' + o + '</svg>';
  }
  function dialHTML() {
    return dialSVG() + '<div class="jsk-dial-c" style="--d:1.1s"><small>' + esc(T.dial) + '</small><b>' + esc(hh(DATA.from)) + '–' + esc(hh(DATA.to)) + '<i>h</i></b><small>' + esc(T.daily) + '</small></div>';
  }

  /* ---------- crtanje ---------- */
  function specHTML() {
    return DATA.facts.map(function (f) {
      return '<li><small>' + esc(f.l) + '</small><b>' + esc(f.v) + (f.s ? '<em>' + esc(f.s) + '</em>' : '') + '</b></li>';
    }).join('');
  }
  function footHTML() {
    return '<a class="jsk-link" href="' + esc(DATA.link) + '" data-jsk="stranica">' + esc(T.more) + ' ' + ICON.arrow + '</a>' +
      (DATA.yt ? '<i></i><button type="button" class="jsk-link" data-jsk="video" aria-haspopup="dialog">' + ICON.play + esc(T.video) + '</button>' : '');
  }
  root.innerHTML =
    '<section class="jsk-wrap" aria-labelledby="jsk-h"><div class="jsk-frame" style="--pos:72% 50%;--mpos:64% 58%;--lum:.84">' +
      '<div class="jsk-bg" data-jsk="galerija" role="presentation"><div class="jsk-ph">' +
        '<img src="' + esc(IMG.main) + '" srcset="' + esc(IMG.mainS) + ' 1000w, ' + esc(IMG.main) + ' 2000w" sizes="(max-width: 980px) 100vw, 60vw" alt="' + esc(T.photos[0]) + '" decoding="async">' +
      '</div><span class="jsk-tint"></span><span class="jsk-scrim"></span></div>' +
      '<div class="jsk-clock">' +
        '<div class="jsk-st" role="status" aria-live="polite"><i aria-hidden="true"></i><b></b><span></span></div>' +
        '<div class="jsk-dial" role="img"></div>' +
      '</div>' +
      '<div class="jsk-body">' +
        '<div class="jsk-eye jsk-up" style="--d:.26s"></div>' +
        '<h2 id="jsk-h"><span class="jsk-up" style="--d:.36s">' + esc(T.h[0]) + '</span><span class="jsk-o jsk-up" style="--d:.46s">' + esc(T.h[1]) + '</span></h2>' +
        '<p class="jsk-lead jsk-up" style="--d:.6s"></p>' +
        '<ul class="jsk-spec jsk-up" style="--d:.72s"></ul>' +
        '<div class="jsk-acts jsk-up" style="--d:.84s">' +
          '<a class="jsk-btn jsk-btn--solid" href="#" data-jsk="cijene">' + ICON.ticket + lbl(T.prices, T.pricesS) + '</a>' +
          '<button type="button" class="jsk-btn jsk-btn--ghost" data-jsk="galerija" aria-haspopup="dialog">' + ICON.photos + esc(T.gal) + '</button>' +
        '</div>' +
        '<div class="jsk-foot jsk-up" style="--d:.94s"></div>' +
      '</div>' +
    '</div></section>';
  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  var frame = q('.jsk-frame'), dial = q('.jsk-dial'), stEl = q('.jsk-st');

  // tekst i podaci (ugrađeni, pa iz WordPressa): mijenja se samo ono što je drugačije
  var drawn = {};
  function set(sel, prop, val) { var el = q(sel); if (el && drawn[sel + prop] !== val) { drawn[sel + prop] = val; el[prop] = val; } }
  function render() {
    set('.jsk-eye', 'textContent', DATA.eyebrow);
    set('.jsk-lead', 'textContent', DATA.lead);
    set('.jsk-spec', 'innerHTML', specHTML());
    set('.jsk-foot', 'innerHTML', footHTML());
    q('a[data-jsk="cijene"]').setAttribute('href', DATA.prices);
    var key = DATA.from + '-' + DATA.to;
    if (drawn.dial !== key) {
      var had = drawn.dial; drawn.dial = key;
      dial.innerHTML = dialHTML();
      dial.setAttribute('aria-label', T.clockAria(hm(DATA.from), hm(DATA.to)));
      if (had) tick(true);
    }
  }
  render();

  /* ---------- STATUS: radi / ne radi (radno vrijeme sa stranice, vrijeme na Jahorini, sezona, ručno) ---------- */
  // sada na Jahorini (Europe/Sarajevo); data-sat="2026-12-20 16:30" = zamišljeno vrijeme (proba)
  function jahNow() {
    var fx = root.getAttribute('data-sat');
    if (fx) {
      var dt = fx.match(/(\d{4})-(\d{1,2})-(\d{1,2})/), tm = fx.match(/(\d{1,2})[:.](\d{2})/), n0 = new Date();
      return { y: dt ? +dt[1] : n0.getFullYear(), mo: dt ? +dt[2] : n0.getMonth() + 1, d: dt ? +dt[3] : n0.getDate(), min: tm ? +tm[1] * 60 + +tm[2] : 0 };
    }
    var n = new Date();
    try {
      var p = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sarajevo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(n).forEach(function (x) { p[x.type] = x.value; });
      if (p.hour != null) return { y: +p.year, mo: +p.month, d: +p.day, min: (+p.hour % 24) * 60 + +p.minute };
    } catch (e) {}
    return { y: n.getFullYear(), mo: n.getMonth() + 1, d: n.getDate(), min: n.getHours() * 60 + n.getMinutes() };
  }
  // sezona "15.12-31.3" (preko Nove godine ili unutar godine)
  function season() {
    var m = (root.getAttribute('data-sezona') || '').match(/(\d{1,2})\.\s*(\d{1,2})\.?\s*[–—-]\s*(\d{1,2})\.\s*(\d{1,2})/);
    return m ? { sd: +m[1], sm: +m[2], ed: +m[3], em: +m[4] } : null;
  }
  function inSeason(s, mo, dd) {
    var a = s.sm * 100 + s.sd, b = s.em * 100 + s.ed, x = mo * 100 + dd;
    return a <= b ? x >= a && x <= b : x >= a || x <= b;
  }
  function status() {
    var n = jahNow(), s = season(), F = DATA.from, To = DATA.to;
    var man = (root.getAttribute('data-status') || '').toLowerCase().replace(/\s+/g, '-');
    if (/^ne-?radi|^zatvoren|^closed/.test(man)) return { open: false, b: T.closedToday, s: '', min: n.min };
    if (DATA.closed) return { open: false, b: T.closedToday, s: DATA.why, min: n.min };
    if (s && !inSeason(s, n.mo, n.d)) {
      // van sezone: do 45 dana prije početka piše datum otvaranja
      var t0 = Date.UTC(n.y, n.mo - 1, n.d), st0 = Date.UTC(n.y, s.sm - 1, s.sd);
      if (st0 < t0) st0 = Date.UTC(n.y + 1, s.sm - 1, s.sd);
      return { open: false, b: T.closed, s: (st0 - t0) / 864e5 <= 45 ? T.seasonFrom(s.sd, s.sm) : T.season, min: n.min };
    }
    if (n.min >= F && n.min < To) return { open: true, b: T.open, s: T.until(hm(To)), min: n.min };
    if (n.min < F) return { open: false, b: T.closed, s: T.opens(hm(F)), min: n.min };
    // poslije radnog vremena: sutra (ako je sutra još sezona)
    var tm = new Date(Date.UTC(n.y, n.mo - 1, n.d + 1));
    if (s && !inSeason(s, tm.getUTCMonth() + 1, tm.getUTCDate())) return { open: false, b: T.closed, s: T.season, min: n.min };
    return { open: false, b: T.closed, s: T.opensTmr(hm(F)), min: n.min };
  }
  // kazaljka ide samo naprijed (bez vraćanja unazad oko sata)
  var handA = null, lastSt = '';
  function tick(force) {
    var r = status(), a = ang(r.min);
    if (handA == null) handA = a; else { while (a < handA - .01) a += 360; if (a - handA > 360) a -= 360; handA = a; }
    var h = q('.jsk-hand');
    if (h) h.style.setProperty('--a', handA.toFixed(2) + 'deg');
    var k = r.open + '|' + r.b + '|' + r.s;
    if (k === lastSt && !force) return;
    lastSt = k;
    stEl.classList.toggle('is-open', r.open);
    stEl.querySelector('b').textContent = r.b;
    stEl.querySelector('span').textContent = r.s;
    root.classList.toggle('jsk--open', r.open);
  }
  // ulazak: kazaljka kreće od jutra (sat prije dnevnog skijanja) i prođe dan do trenutnog vremena
  function sweep() {
    var h = q('.jsk-hand'), r = status(), to = ang(r.min), from = ang(DATA.from - 7 * 60 - 60);
    while (to < from) to += 360;
    if (!h || reduced) { tick(true); return; }
    var t0 = now(), D = 1500 + Math.min(1, (to - from) / 300) * 700;
    handA = from; tick(true);
    (function step() {
      var t = Math.min(1, (now() - t0) / D), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      handA = from + (to - from) * e;
      h.style.setProperty('--a', handA.toFixed(2) + 'deg');
      if (t < 1) w.requestAnimationFrame(step); else { handA = null; tick(true); }
    })();
  }
  tick(true);
  setInterval(function () { if (!d.hidden) tick(); }, 20000);
  d.addEventListener('visibilitychange', function () { if (!d.hidden) tick(); });
  root.__jskTick = function () { tick(true); };   // proba: poslije promjene data-sat / data-status

  /* ---------- klik: galerija (fotografija ili dugme), cijene, stranica, video ---------- */
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jsk]');
    if (!b) return;
    var k = b.getAttribute('data-jsk');
    if (k === 'galerija') lbOpen(0);
    else if (k === 'video') vOpen();
    else if (k === 'cijene') track('sankaliste_klik', { cilj: 'cijene' });
    else if (k === 'stranica') track('sankaliste_klik', { cilj: 'stranica' });
  });

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
    root.classList.toggle('jsk--boxed', boxed);
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
    // Snowboard park je odmah iznad (bez razmaka) → on već daje razmak, ovdje ostaje samo rub
    var pk = d.getElementById('jsb-park');
    root.classList.toggle('jsk--join', !boxed && !!pk && !pk.classList.contains('jsb--boxed') &&
      Math.abs(pk.getBoundingClientRect().bottom - root.getBoundingClientRect().top) < 3);
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
  function trap(box, e) {   // fokus ostaje u prozoru preko ekrana
    var bs = [].slice.call(box.querySelectorAll('button, iframe')).filter(function (b) { return b.offsetParent !== null || b.tagName === 'IFRAME'; });
    if (!bs.length) return;
    var i = bs.indexOf(d.activeElement);
    e.preventDefault(); bs[(i + (e.shiftKey ? -1 : 1) + bs.length) % bs.length].focus();
  }
  var overflow0 = '';
  function lockScroll(on) { var s = d.documentElement.style; if (on) { overflow0 = s.overflow; s.overflow = 'hidden'; } else s.overflow = overflow0; }

  /* ---------- fotografije preko cijelog ekrana ---------- */
  var lb, lbImg, lbCap, lbCur = 0, lbBack = null;
  function lbBuild() {
    lb = d.createElement('div'); lb.id = 'jsk-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', T.galT + ': ' + T.aria);
    lb.innerHTML = '<figure><img alt="" decoding="async"><figcaption aria-live="polite"></figcaption></figure>' +
      '<button type="button" class="jsk-lb-close" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>' +
      '<button type="button" class="jsk-lb-prev" aria-label="' + esc(T.prev) + '">' + ICON.prev + '</button>' +
      '<button type="button" class="jsk-lb-next" aria-label="' + esc(T.next) + '">' + ICON.next + '</button>';
    d.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('figcaption');
    lb.querySelector('.jsk-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.jsk-lb-prev').addEventListener('click', function () { lbShow(lbCur - 1); });
    lb.querySelector('.jsk-lb-next').addEventListener('click', function () { lbShow(lbCur + 1); });
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
  function lbShow(i) {
    var n = GAL.length; lbCur = (i % n + n) % n;
    lbImg.src = GAL[lbCur].full;
    lbImg.alt = GAL[lbCur].alt || (T.photo + ' ' + (lbCur + 1) + ' / ' + n + ': ' + T.aria);
    lbCap.textContent = DATA.eyebrow + ' · ' + (lbCur + 1) + ' / ' + n;
    if (n > 1) { var pre = new Image(); pre.src = GAL[(lbCur + 1) % n].full; }
  }
  function lbKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); lbClose(); }
    else if (e.key === 'ArrowLeft') lbShow(lbCur - 1);
    else if (e.key === 'ArrowRight') lbShow(lbCur + 1);
    else if (e.key === 'Tab') trap(lb, e);
  }
  function lbOpen(i) {
    if (!GAL.length) return;
    if (!lb) lbBuild();
    lb.classList.toggle('is-one', GAL.length < 2);
    lbBack = d.activeElement; lbShow(i || 0);
    lockScroll(true);
    lb.classList.add('is-shown'); void lb.offsetWidth; lb.classList.add('is-open');
    lb.querySelector('.jsk-lb-close').focus();
    d.addEventListener('keydown', lbKey);
    track('sankaliste_galerija', {});
  }
  function lbClose() {
    lb.classList.remove('is-open');
    lockScroll(false);
    d.removeEventListener('keydown', lbKey);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.classList.remove('is-shown'); }, 320);
    if (lbBack && lbBack.focus) lbBack.focus({ preventScroll: true });
  }

  /* ---------- video preko cijelog ekrana (youtube-nocookie, učitava se tek na klik) ---------- */
  var V = null, vBack = null;
  function vKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); vClose(); }
    else if (e.key === 'Tab') trap(V, e);
  }
  function vOpen() {
    if (!DATA.yt) return;
    if (!V) {
      V = d.createElement('div'); V.id = 'jsk-vid';
      V.setAttribute('role', 'dialog'); V.setAttribute('aria-modal', 'true'); V.setAttribute('aria-label', T.vid);
      V.innerHTML = '<div class="jsk-v-box"></div><button type="button" aria-label="' + esc(T.close) + '">' + ICON.close + '</button>';
      d.body.appendChild(V);
      V.querySelector('button').addEventListener('click', vClose);
      V.addEventListener('click', function (e) { if (e.target === V) vClose(); });
    }
    vBack = d.activeElement;
    V.querySelector('.jsk-v-box').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(DATA.yt) +
      '?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="' + esc(T.vid) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    lockScroll(true);
    V.classList.add('is-shown'); void V.offsetWidth; V.classList.add('is-open');
    V.querySelector('button').focus();
    d.addEventListener('keydown', vKey);
    track('sankaliste_video', {});
  }
  function vClose() {
    d.removeEventListener('keydown', vKey);
    V.classList.remove('is-open');
    lockScroll(false);
    setTimeout(function () { if (!V.classList.contains('is-open')) { V.classList.remove('is-shown'); V.querySelector('.jsk-v-box').innerHTML = ''; } }, 320);
    if (vBack && vBack.focus) vBack.focus({ preventScroll: true });
  }

  /* ---------- sadržaj iz WordPressa (REST API): stranica Sankalište ---------- */
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
    if ((wd && wd < 200) || /(^|\s)(emoji|wp-smiley)(\s|$)/.test(at('class')) || /\/emoji\//.test(src)) return null;   // ikone, logotipi, emotikoni
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
  var UP = '([A-ZŠĐČĆŽ][a-zšđčćž]+)';
  // "danas / trenutno / privremeno ne radi (zbog …)" u tekstu stranice → status crven, sa razlogom
  var CLOSED = /\b(?:danas|trenutno|privremeno|do\s+daljnjeg|today|currently|temporarily)\b[^.!?]{0,60}?\b(?:ne\s+radi|nije\s+u\s+funkciji|van\s+funkcije|zatvoren[a-z]*|closed|not\s+(?:open|operating|running))\b/i;
  // uvod: rečenica o mališanima / prvom sankalištu, pa prva rečenica o sankanju, inače prva rečenica
  var LEAD = [/mališan|uželjel|prvo\s+sankali|little\s+ones|first\s+sledding/i, /sank|sled|toboggan/i];
  var NOLEAD = /cijen|ovdje|price|\bhere\b|\d+\s*h\b|\d+\s*metar|\d+\s*m\b|kas[ia]\b|desk|office/i;
  // "Poljicama" → "Poljice" (mjesto u lokativu → naziv)
  function nom(s) { return s.replace(/ama$/, 'e').replace(/ima$/, 'a').replace(/(sk|čk|šk|ck)oj$/, '$1a'); }
  function parse(pg) {
    var raw = pg.content && pg.content.rendered || '', html = pickLang(raw);
    var b = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html').body;   // ne izvršava skripte, ne učitava slike
    // razmak poslije svakog bloka, da se pasusi ne slijepe u tekstu
    [].forEach.call(b.querySelectorAll('p,li,div,br,h1,h2,h3,h4,h5,h6,td'), function (e) { e.parentNode.insertBefore(b.ownerDocument.createTextNode(' '), e.nextSibling); });
    var ps = [].slice.call(b.querySelectorAll('p')).map(function (p) { return clean(p.textContent); }).filter(function (t) { return t.length > 30; });
    var txt = clean(b.textContent), m, r = {}, f = {};
    var allS = sentences(txt);
    var off = allS.filter(function (s) { return CLOSED.test(s); })[0] || '';
    r.closed = !!off;
    r.why = off && (m = off.match(/\b(?:zbog|due\s+to|because\s+of)\s+[^.!?,;]{3,48}/i)) ? clip(m[0], 56) : '';
    var all = [].concat.apply([], (ps.length ? ps : [txt]).map(sentences)).filter(function (s) { return s.length > 40 && !NOLEAD.test(s) && !CLOSED.test(s); });
    var hit = '';
    LEAD.forEach(function (re) { if (!hit) hit = all.filter(function (s) { return re.test(s); })[0] || ''; });
    hit = hit || all[0] || '';
    r.lead = hit ? clip(hit, 240) : '';
    // dužina i širina staze: "Dužine čak 600 metara, te širine od čak 5 metara" / "600 m long and 5 m wide"
    var N = '(\\d{1,4}(?:[.,]\\d+)?)\\s*(?:metar[a-z]*|metr[a-z]*|m\\b|meters?|metres?)';
    f.len = (m = txt.match(new RegExp('dužin[a-z]*\\s+(?:od\\s+)?(?:čak\\s+|oko\\s+|preko\\s+|cca\\.?\\s+)?' + N, 'i'))) || (m = txt.match(new RegExp(N + '\\s+(?:dug[a-z]*|long)\\b', 'i'))) ||
      (m = txt.match(/length\s+of\s+(?:about\s+|around\s+)?(\d{1,4})/i)) ? m[1] : '';
    f.wid = (m = txt.match(new RegExp('širin[a-z]*\\s+(?:od\\s+)?(?:čak\\s+|oko\\s+|cca\\.?\\s+)?' + N, 'i'))) || (m = txt.match(new RegExp(N + '\\s+(?:širok[a-z]*|wide)\\b', 'i'))) ||
      (m = txt.match(/width\s+of\s+(?:about\s+|around\s+)?(\d{1,2}(?:[.,]\d)?)/i)) ? m[1] : '';
    // broj staze i mjesto: "na Poljicama, tačnije na stazi 7" / "slope 7 at Poljice"
    f.slope = (m = txt.match(/\bstaz[aeiu]\s+(?:broj\s+|br\.\s*)?(\d{1,2})\b/i)) || (m = txt.match(/\b(?:slope|run|piste|trail)\s+(?:no\.?\s*|number\s+)?(\d{1,2})\b/i)) ? m[1] : '';
    f.lift = (m = txt.match(new RegExp('\\bsidr(?:o|a|u|om)\\s+[„"“]?' + UP))) || (m = txt.match(new RegExp(UP + '\\s+(?:T-bar|drag\\s+lift|ski\\s+tow|surface\\s+lift)'))) ||
      (m = txt.match(new RegExp('(?:T-bar|drag\\s+lift|ski\\s+tow)\\s+' + UP))) ? m[1] : '';
    f.place = (m = txt.match(new RegExp('nalazi\\s+se\\s+na\\s+' + UP))) || (m = txt.match(new RegExp('\\bna\\s+' + UP + ',\\s+tačnije'))) ||
      (m = txt.match(new RegExp('\\b(?:located|is)\\s+(?:at|on|in)\\s+' + UP))) ? nom(m[1]) : f.lift;
    // radno vrijeme: "od 16h do 18h" / "16:00 – 18:00" / "from 4 pm to 6 pm"
    var hrs = null;
    if ((m = txt.match(/\bod\s*(\d{1,2})(?:[:.](\d{2}))?\s*(?:h|č|sati)?\s*(?:do|–|-)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(?:h\b|č|sati)/i)) ||
        (m = txt.match(/\b(\d{1,2})[:.](\d{2})\s*(?:h\s*)?[–—-]\s*(\d{1,2})[:.](\d{2})/)))
      hrs = [+m[1] * 60 + (+m[2] || 0), +m[3] * 60 + (+m[4] || 0)];
    else if ((m = txt.match(/\bfrom\s+(\d{1,2})(?::(\d{2}))?\s*(h\b|pm|p\.m\.)?\s*(?:to|until|till|–|-)\s*(\d{1,2})(?::(\d{2}))?\s*(h\b|pm|p\.m\.)?/i))) {
      var pm = /p/i.test(m[6] || m[3] || '');
      hrs = [(+m[1] + (pm && +m[1] < 12 ? 12 : 0)) * 60 + (+m[2] || 0), (+m[4] + (pm && +m[4] < 12 ? 12 : 0)) * 60 + (+m[5] || 0)];
    }
    if (hrs && hrs[0] >= 0 && hrs[1] <= 24 * 60 && hrs[1] > hrs[0]) r.hrs = hrs;
    // sanke: najam na ski kasi (i "svoje sanke ostavite kući")
    f.rent = /unajm|iznajm|najam|\brent|\bhire/i.test(txt);
    f.desk = (m = txt.match(new RegExp('ski[\\s-]*kas[aieu]\\s+[„"“]?' + UP, 'i'))) || (m = txt.match(new RegExp(UP + '\\s+(?:ski\\s+desk|ticket\\s+office|ski\\s*pass\\s+office)'))) ? m[1] : '';
    f.own = /svoje\s+sanke|vlastite\s+sanke|own\s+sled/i.test(txt);
    r.facts = factsOf(f);
    r.f = f;
    // cijene: link "OVDJE" (ili link u rečenici o cijenama)
    var as = [].slice.call(b.querySelectorAll('a[href]')).filter(function (a) { return !/^(#|mailto:|tel:|javascript:)/i.test(a.getAttribute('href')); });
    var pa = as.filter(function (a) {
      var par = a.closest('p,li,div,h1,h2,h3,h4,h5,h6') || a.parentNode;
      return /cijen|cjenovnik|karat|price|ticket/i.test(clean(par && par.textContent)) || /cijen|cjenovnik|price|webshop/i.test(a.getAttribute('href'));
    })[0];
    r.prices = pa ? abs(pa.getAttribute('href')) : '';
    r.yt = ytId(raw);
    r.title = clean(pickLang(pg.title && pg.title.rendered || '').replace(/<[^>]*>/g, ' ').replace(/&#8211;|&ndash;/g, '–').replace(/&amp;/g, '&')).split(/\s+[–—-]\s+/)[0];
    var seen = {};
    r.imgs = [].slice.call(b.querySelectorAll('img')).map(fromImg).filter(function (x) {
      if (!x || seen[key(x.full)]) return false; seen[key(x.full)] = 1; return true;
    });
    r.seen = seen; r.id = pg.id;
    var link = pg.link || '';
    if (EN && link.indexOf(O + '/') === 0 && link.indexOf(O + '/en/') !== 0) link = O + '/en' + link.slice(O.length);
    r.link = link;
    return r;
  }
  function page() {
    var F = '&_fields=id,link,title,content';
    return api('pages', 'slug=' + encodeURIComponent(SLUG) + F).then(function (j) {
      if (j && j[0]) return j[0];
      // slug nije tačan → stranica čiji naslov ima "sank" (sankalište, sankanje) ili "sled"
      return api('pages', 'search=sank&per_page=20' + F).then(function (s) {
        var hit = (s || []).filter(function (x) { return /sank|sled|toboggan/i.test(pickLang(x.title && x.title.rendered || '')); })[0];
        if (!hit) throw new Error('stranica "' + SLUG + '" nije pronađena');
        return hit;
      });
    });
  }
  function load() {
    return page().then(function (pg) {
      var r = parse(pg);
      if (r.imgs.length) return r;
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
    if (r.title && r.title.length <= 32) DATA.eyebrow = r.title;
    if (r.lead) DATA.lead = r.lead; else miss.push('tekst');
    if (r.facts.length) DATA.facts = r.facts; else miss.push('dužina, staza, sidro');
    if (r.hrs) { DATA.from = r.hrs[0]; DATA.to = r.hrs[1]; } else miss.push('radno vrijeme (od … do …)');
    DATA.closed = r.closed; DATA.why = r.why;
    if (r.link) DATA.link = r.link;
    if (!FIX.prices) { if (r.prices) DATA.prices = r.prices; else { DATA.prices = DATA.link; miss.push('link za cijene'); } }
    if (!FIX.yt) DATA.yt = r.yt || '';
    if (r.imgs.length) GAL = BASE.concat(r.imgs);
    render();
    tick(true);
    if (miss.length) why('stranica nema: ' + miss.join(', '));
    ld();
  }
  function why(msg) {
    if (!(d.body && d.body.classList.contains('logged-in'))) return;   // tehnički detalj vide samo prijavljeni
    var el = q('.jsk-why') || q('.jsk-body').appendChild(d.createElement('small'));
    el.className = 'jsk-why'; el.textContent = T.why + ' · ' + T.aria + ': ' + msg + ' (' + T.whyTail + ')';
  }

  /* ---------- schema.org za Google (sankalište sa radnim vremenom) ---------- */
  function ld() {
    var sc = d.getElementById('jsk-ld');
    if (!sc) { sc = d.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'jsk-ld'; (d.head || d.documentElement).appendChild(sc); }
    sc.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'SportsActivityLocation', name: EN ? 'Jahorina sledding track' : 'Sankalište Jahorina',
      description: DATA.lead, image: abs(IMG.main), url: DATA.link,
      openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: hm(DATA.from), closes: hm(DATA.to) },
      containedInPlace: { '@type': 'SkiResort', name: 'Olimpijski centar Jahorina', url: O + '/' }
    });
  }
  ld();
  if (w.fetch && w.DOMParser && w.Promise) {
    load().then(apply).catch(function (e) {
      if (w.console) console.warn('[Jahorina Sankalište]', e);
      why(e && e.message || 'REST');
    });
  }

  // ulazak jednom, kad kadar dođe u vidno polje; kazaljka prođe dan do trenutnog vremena
  if ('IntersectionObserver' in w && !reduced) {
    root.classList.add('jsk-anim');
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        root.classList.add('jsk-on'); io.disconnect();
        setTimeout(sweep, 1450);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(frame);
  }
})(window, document);
