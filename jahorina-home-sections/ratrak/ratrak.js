/* =====================================================================
   JAHORINA — PANORAMSKA VOŽNJA RATRAKOM (početna, ispod vijesti)
   Jedan veliki uokvireni kadar kao hero: lijevo oštra fotografija ratraka, koja se meko utapa
   u istu fotografiju zamućenu preko cijele kartice; desno naslov u tri reda (zadnja riječ
   iscrtana, kao "Jahorine"), uvod, stakleni panel sa pločicama (trajanje, polazak, cijena)
   i rezervacija. Bez animacije.
   Ugradnja: Elementor HTML widget sa <div id="jr-ratrak"></div> + ovaj fajl sa jsDelivr-a.
   Fotografija se učitava iz istog commita (slike/ratrak-1.webp pored ovog fajla);
   druga fotografija: data-slika="…" na <div id="jr-ratrak">.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jr-ratrak');
  if (!root || root.__jr) return;
  root.__jr = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  var IMG = root.getAttribute('data-slika') || HERE + 'slike/ratrak-1.webp';
  var MAIL = 'skipass@oc-jahorina.com', PHONE = '00387 57 270 003', TEL = '+38757270003';

  // tekst je korisnikov, doslovno (EN je prevod)
  var T = EN ? {
    kicker: 'Experience at Jahorina', t: ['Panoramic', 'snowcat'], o: 'ride', alt: 'Snowcat on a Jahorina slope at sunset',
    lead: 'For those who want to enjoy the view of the slopes and peaks of Jahorina a little longer, the 20-minute panoramic ride is the right choice.',
    tiles: [['time', '20 min', 'Duration'], ['pin', '4–6 pm', 'Poljice gondola'], ['ticket', '50 KM', 'Per person']],
    notes: ['Children under 6 ride free.', 'Payment at the Poljice ski ticket office.'],
    book: 'Book at least one day in advance by email to ' + MAIL + ' or by phone at ' + PHONE + '.',
    mail: 'Book by email', call: PHONE
  } : {
    kicker: 'Doživljaj na Jahorini', t: ['Panoramska', 'vožnja'], o: 'ratrakom', alt: 'Ratrak na stazi Jahorine u zalasku sunca',
    lead: 'Za one koji žele duže uživati u pogledu na staze i vrhove Jahorine, panoramska vožnja u trajanju od 20 minuta pravi je izbor.',
    tiles: [['time', '20 min', 'Trajanje'], ['pin', '16–18h', 'Polaz gondole Poljice'], ['ticket', '50 KM', 'Po osobi']],
    notes: ['Za djecu do 6 godina vožnja je besplatna.', 'Plaćanje na ski kasi Poljice.'],
    book: 'Rezervacija najmanje dan unaprijed na mail ' + MAIL + ' ili putem telefona na broj ' + PHONE + '.',
    mail: 'Rezerviši putem maila', call: PHONE
  };

  /* ---------- izgled (sve je pod #jr-ratrak; tokeni i obrasci iz hero-a i vijesti) ---------- */
  var CSS = [
    '#R{--bg:#0A1120;--line:rgba(255,255,255,.1);--text:#fff;--text-2:rgba(255,255,255,.8);--text-3:rgba(255,255,255,.56);--accent:#00B9F2;',
    '--nm-surface:rgba(20,30,49,.72);--nm-surface-2:#172238;--nm-dark:rgba(0,0,0,.42);--nm-light:rgba(78,104,150,.16);',
    '--nm-raised:4px 4px 10px var(--nm-dark),-3px -3px 9px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    '--nm-raised-sm:3px 3px 7px var(--nm-dark),-2px -2px 6px var(--nm-light),inset 1px 1px 0 rgba(255,255,255,.05);',
    '--nm-inset:inset 3px 3px 8px rgba(0,0,0,.42),inset -3px -3px 7px rgba(78,104,150,.14);',
    "--fd:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--fb:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif;",
    'display:block;background:var(--bg);color:var(--text);font:400 16px/1.55 var(--fb);text-align:left;color-scheme:dark}',
    '#R.jr--boxed{border-radius:28px;overflow:hidden}',
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
    '#R .jr-wrap{max-width:1240px;margin:0 auto;padding:clamp(56px,7vw,100px) clamp(16px,4vw,48px)}',

    /* okvir kao u hero-u */
    '#R .jr-frame{position:relative;display:grid;grid-template-columns:minmax(0,48fr) minmax(0,52fr);border-radius:26px;overflow:hidden;isolation:isolate;background:#0B1324;',
    'box-shadow:10px 10px 26px rgba(0,0,0,.55),-8px -8px 22px rgba(46,64,98,.22)}',
    '#R .jr-frame::after{content:"";position:absolute;inset:0;z-index:6;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.08)}',
    /* ista fotografija, jako zamućena i zatamnjena, preko cijelog kadra (topli odsjaj zalaska ide iza teksta) */
    '#R .jr-amb{position:absolute;inset:-12%;width:124%;height:124%;object-fit:cover;object-position:70% 30%;z-index:-3;filter:blur(46px) saturate(.5) brightness(.46)}',
    '#R .jr-shade{position:absolute;inset:0;z-index:-2;pointer-events:none;',
    'background:linear-gradient(90deg,rgba(6,11,22,0) 30%,rgba(6,11,22,.42) 52%,rgba(6,11,22,.62) 100%),linear-gradient(rgba(10,24,56,.42),rgba(10,24,56,.42)),',
    'linear-gradient(180deg,rgba(6,18,42,.3) 0%,rgba(6,18,42,0) 40%),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(4,8,18,.5) 100%)}',
    /* oštra fotografija lijevo, desna ivica se meko utapa u zamućeni kadar */
    '#R .jr-shot{position:relative;min-height:100%;z-index:-1;-webkit-mask-image:linear-gradient(90deg,#000 58%,transparent 100%);mask-image:linear-gradient(90deg,#000 58%,transparent 100%)}',
    '#R .jr-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:0% 62%;filter:saturate(.72) brightness(.86) contrast(1.07)}',
    '#R .jr-shot::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.6}',
    '#R .jr-shot::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(0deg,rgba(6,11,22,.55) 0%,rgba(6,11,22,0) 30%),linear-gradient(180deg,rgba(6,11,22,.3) 0%,rgba(6,11,22,0) 18%)}',

    /* tekst preko kadra */
    '#R .jr-body{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0;padding:clamp(44px,4.4vw,64px) clamp(28px,4.4vw,68px) clamp(44px,4.4vw,64px) clamp(8px,1.2vw,18px)}',
    /* nadnaslov kao u hero-u: svijetla linija + razmaknuta slova */
    '#R .jr-kicker{display:flex;align-items:center;gap:14px;font:600 11px/1 var(--fd);letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:22px}',
    '#R .jr-kicker::before{content:"";width:34px;height:1.5px;flex-shrink:0;background:linear-gradient(90deg,var(--accent),#fff,var(--accent));box-shadow:0 0 10px rgba(0,185,242,.8)}',
    /* naslov u tri reda, zadnja riječ samo obris (kao "Jahorine") */
    '#R h2{font-size:clamp(44px,4.7vw,70px);font-weight:800;line-height:.94;letter-spacing:-.02em}',
    '#R h2 > span{display:block;filter:drop-shadow(0 6px 30px rgba(0,0,0,.4))}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 > span.jr-o{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.6px rgba(255,255,255,.92)!important;',
    'filter:drop-shadow(0 0 8px rgba(0,185,242,.35)) drop-shadow(0 6px 30px rgba(0,0,0,.4))}}',
    '#R .jr-lead{margin-top:26px;font-size:clamp(15.5px,1.15vw,17px);line-height:1.62;color:var(--text-2)!important;max-width:46ch;text-wrap:pretty}',

    /* stakleni panel sa pločicama (isti kao brzi linkovi u hero-u) */
    '#R .jr-dock{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:32px!important;padding:8px!important;border-radius:24px;width:min(100%,480px);',
    'background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-inset)}',
    '#R .jr-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-height:104px;padding:14px 8px 13px!important;border-radius:16px;text-align:center;',
    'background:var(--nm-surface-2);box-shadow:var(--nm-raised-sm)}',
    '#R .jr-tile svg{width:22px;height:22px;color:#fff;opacity:.92}',
    '#R .jr-tile b{font:700 clamp(18px,1.5vw,21px)/1 var(--fd);letter-spacing:-.01em;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '#R .jr-tile small{font:700 9.5px/1.25 var(--fd);letter-spacing:.4px;text-transform:uppercase;color:rgba(255,255,255,.66)}',
    '#R .jr-tile--accent{background:linear-gradient(145deg,#2CCBF8,#00A6DB);',
    'box-shadow:3px 3px 7px rgba(0,0,0,.4),-2px -2px 6px rgba(78,104,150,.16),inset 1px 1px 0 rgba(255,255,255,.35),0 0 20px -6px rgba(0,185,242,.5)}',
    '#R .jr-tile--accent small{color:rgba(255,255,255,.9)}',
    '#R .jr-notes{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:16px!important}',
    '#R .jr-notes li{display:flex;align-items:center;gap:9px;font-size:14px;line-height:1.4;color:var(--text-2)}',
    '#R .jr-notes li::before{content:""!important;width:5px;height:5px;border-radius:50%;flex:none;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.8)}',

    /* rezervacija: dugmad kao u hero-u (bijelo puno + stakleno) */
    '#R .jr-acts{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:30px}',
    '#R .jr-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:10px;border-radius:40px;white-space:nowrap;font:600 15px/1 var(--fb);letter-spacing:.3px}',
    '#R .jr-btn--solid{overflow:hidden;padding:15px 26px;font-weight:700;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6);transition:transform .2s,box-shadow .2s;',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,4px 4px 10px rgba(0,0,0,.42),-3px -3px 9px rgba(78,104,150,.16)}',
    '#R .jr-btn--solid svg{width:17px;height:17px}',
    '#R .jr-btn--solid::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#R .jr-btn--solid:hover{transform:translateY(-2px);box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 0 0 1px rgba(0,185,242,.5),0 0 26px rgba(0,185,242,.55)}',
    '#R .jr-btn--solid:hover::after{animation:jrShine 1.6s ease-in-out}',
    '@keyframes jrShine{0%{left:-60%}35%,100%{left:130%}}',
    '#R .jr-btn--solid:active{transform:none;box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff}',
    '#R .jr-btn--ghost{padding:14px 22px;color:#fff!important;background:var(--nm-surface);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:var(--nm-raised);transition:color .2s,box-shadow .25s;font-variant-numeric:tabular-nums}',
    '#R .jr-btn--ghost svg{width:16px;height:16px}',
    '#R .jr-btn--ghost:hover{color:var(--accent)!important;box-shadow:var(--nm-raised),0 0 22px rgba(0,185,242,.4)}',
    '#R .jr-btn--ghost:active{box-shadow:inset 2px 2px 5px rgba(0,0,0,.4),inset -2px -2px 5px rgba(78,104,150,.13)}',
    '#R .jr-book{margin-top:16px;font-size:13.5px;line-height:1.55;color:var(--text-3)!important;max-width:62ch}',
    '#R .jr-book a{color:var(--text-2)!important;border-bottom:1px solid rgba(0,185,242,.4);white-space:nowrap}',
    '#R .jr-book a:hover{color:var(--accent)!important}',

    /* tablet: uži tekst, fotografija ostaje lijevo */
    '@media (max-width:1060px){#R .jr-frame{grid-template-columns:minmax(0,42fr) minmax(0,58fr)}#R h2{font-size:clamp(40px,5.4vw,58px)}}',
    /* telefon: fotografija gore (utapa se nadolje), tekst ispod na zamućenom kadru */
    '@media (max-width:760px){',
    '#R .jr-frame{grid-template-columns:1fr;border-radius:24px}',
    '#R .jr-shot{min-height:0;height:min(118vw,520px);-webkit-mask-image:linear-gradient(180deg,#000 66%,transparent 100%);mask-image:linear-gradient(180deg,#000 66%,transparent 100%)}',
    '#R .jr-shot img{object-position:38% 64%}',
    '#R .jr-amb{object-position:40% 70%}',
    '#R .jr-shade{background:linear-gradient(180deg,rgba(6,11,22,0) 30%,rgba(6,11,22,.5) 50%,rgba(6,11,22,.66) 100%),linear-gradient(rgba(10,24,56,.42),rgba(10,24,56,.42)),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(4,8,18,.5) 100%)}',
    '#R .jr-body{margin-top:-96px;padding:0 22px 30px}',
    '#R .jr-kicker{letter-spacing:2.6px;font-size:10px;gap:10px;margin-bottom:16px}',
    '#R .jr-kicker::before{width:22px}',
    '#R h2{font-size:clamp(40px,12vw,54px)}',
    '#R .jr-lead{margin-top:18px}',
    '#R .jr-dock{width:100%;margin-top:24px!important;gap:7px;padding:7px!important;border-radius:22px}',
    '#R .jr-tile{min-height:96px;padding:12px 4px!important}',
    '#R .jr-tile small{font-size:9px;letter-spacing:.2px}',
    '#R .jr-notes{flex-direction:column;gap:6px}',
    '#R .jr-acts{margin-top:24px;width:100%}',
    '#R .jr-btn{flex:1 1 auto;justify-content:center}}',
    '@media (prefers-reduced-motion:reduce){#R *{animation:none!important;transition:none!important}}'
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
  function svg(p) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + p + '</svg>'; }
  var S = 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    time: svg('<circle cx="12" cy="12" r="8.5" ' + S + '/><path d="M12 7.5 V12 L15 14" ' + S + '/>'),
    pin: svg('<path d="M12 21 C12 21 5.5 14.6 5.5 10 A6.5 6.5 0 0 1 18.5 10 C18.5 14.6 12 21 12 21 Z" ' + S + '/><circle cx="12" cy="10" r="2.3" ' + S + '/>'),
    ticket: svg('<path d="M4 7.5 H20 V10 A2 2 0 0 0 20 14 V16.5 H4 V14 A2 2 0 0 0 4 10 Z" ' + S + '/><path d="M14.5 8.5 V15.5" ' + S + ' stroke-dasharray="1.5 2.2"/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" ' + S + '/><path d="M4.5 7 L12 12.5 L19.5 7" ' + S + '/>'),
    phone: svg('<path d="M6.6 3.8 L9.2 3.6 L10.6 7.6 L8.7 9 C9.6 11.1 11.2 12.8 13.3 13.8 L14.8 11.9 L18.8 13.4 L18.5 16 C18.4 17.2 17.3 18.1 16.1 18 C9.7 17.4 5 12.6 4.5 6.2 C4.4 5 5.3 3.9 6.6 3.8 Z" ' + S + '/>')
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // mail i broj u rečenici postaju linkovi
  function linkify(s) {
    return esc(s).replace(MAIL, '<a href="mailto:' + MAIL + '">' + MAIL + '</a>')
      .replace(PHONE, '<a href="tel:' + TEL + '">' + PHONE + '</a>');
  }

  root.innerHTML =
    '<section class="jr-wrap" aria-labelledby="jr-h"><div class="jr-frame">' +
      '<img class="jr-amb" src="' + esc(IMG) + '" alt="" aria-hidden="true" decoding="async" loading="lazy"><span class="jr-shade"></span>' +
      '<figure class="jr-shot"><img src="' + esc(IMG) + '" alt="' + esc(T.alt) + '" width="640" height="800" decoding="async" loading="lazy"></figure>' +
      '<div class="jr-body">' +
        '<div class="jr-kicker">' + esc(T.kicker) + '</div>' +
        '<h2 id="jr-h"><span>' + esc(T.t[0]) + '</span><span>' + esc(T.t[1]) + '</span><span class="jr-o">' + esc(T.o) + '</span></h2>' +
        '<p class="jr-lead">' + esc(T.lead) + '</p>' +
        '<ul class="jr-dock">' + T.tiles.map(function (t, k) {
          return '<li class="jr-tile' + (k === 2 ? ' jr-tile--accent' : '') + '">' + ICON[t[0]] + '<b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></li>';
        }).join('') + '</ul>' +
        '<ul class="jr-notes">' + T.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
        '<div class="jr-acts">' +
          '<a class="jr-btn jr-btn--solid" href="mailto:' + MAIL + '">' + esc(T.mail) + ICON.mail + '</a>' +
          '<a class="jr-btn jr-btn--ghost" href="tel:' + TEL + '">' + ICON.phone + esc(T.call) + '</a>' +
        '</div>' +
        '<p class="jr-book">' + linkify(T.book) + '</p>' +
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
})(window, document);
