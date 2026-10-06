/* =====================================================================
   JAHORINA — PANORAMSKA VOŽNJA RATRAKOM (početna, ispod vijesti)
   Lijevo dvije fotografije (velika + manja preko ugla), desno naslov, uvod, podaci o vožnji
   (trajanje, polazak, cijena) i rezervacija (mail, telefon). Bez animacije.
   Ugradnja: Elementor HTML widget sa <div id="jr-ratrak"></div> + ovaj fajl sa jsDelivr-a.
   Fotografije se učitavaju iz istog commita (slike/ratrak-1.webp i ratrak-2.webp pored ovog fajla);
   druge fotografije: data-slika="…" i data-slika-2="…" na <div id="jr-ratrak">.
   ===================================================================== */
(function (w, d) {
  'use strict';
  var root = d.getElementById('jr-ratrak');
  if (!root || root.__jr) return;
  root.__jr = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var HERE = (d.currentScript && d.currentScript.src || '').replace(/[^\/]*$/, '');
  var IMG1 = root.getAttribute('data-slika') || HERE + 'slike/ratrak-1.webp';
  var IMG2 = root.getAttribute('data-slika-2') || HERE + 'slike/ratrak-2.webp';
  var MAIL = 'skipass@oc-jahorina.com', PHONE = '00387 57 270 003', TEL = '+38757270003';

  // tekst je korisnikov, doslovno (EN je prevod)
  var T = EN ? {
    eyebrow: 'Experience', t1: 'Panoramic', t2: 'snowcat ride',
    alt1: 'Snowcat on a Jahorina slope at sunset', alt2: 'Snowcats grooming the slopes at dusk',
    lead: 'For those who want to enjoy the view of the slopes and peaks of Jahorina a little longer, the 20-minute panoramic ride is the right choice.',
    specs: [['Duration', '20', 'min', ''], ['Departure', '4–6', 'pm', 'Poljice gondola station'], ['Price', '50', 'KM', 'per person']],
    notes: ['Children under 6 ride free.', 'Payment at the Poljice ski ticket office.'],
    book: 'Booking', bookTxt: 'At least one day in advance by email to ' + MAIL + ' or by phone at ' + PHONE + '.',
    mail: 'Book by email', call: 'Call'
  } : {
    eyebrow: 'Doživljaj', t1: 'Panoramska vožnja', t2: 'ratrakom',
    alt1: 'Ratrak na stazi Jahorine u zalasku sunca', alt2: 'Ratraci uređuju staze u sumrak',
    lead: 'Za one koji žele duže uživati u pogledu na staze i vrhove Jahorine, panoramska vožnja u trajanju od 20 minuta pravi je izbor.',
    specs: [['Trajanje', '20', 'min', ''], ['Polazak', '16–18', 'h', 'polaz gondole Poljice'], ['Cijena', '50', 'KM', 'po osobi']],
    notes: ['Za djecu do 6 godina vožnja je besplatna.', 'Plaćanje na ski kasi Poljice.'],
    book: 'Rezervacija', bookTxt: 'Najmanje dan unaprijed na mail ' + MAIL + ' ili putem telefona na broj ' + PHONE + '.',
    mail: 'Rezerviši putem maila', call: 'Pozovi'
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
    '#R p,#R figure,#R dl,#R dt,#R dd{margin:0;padding:0}',
    '#R ul,#R li{list-style:none!important;margin:0!important;padding:0!important;background:none}',
    '#R li::marker{content:none!important}',
    '#R img{display:block;max-width:none;border:0;border-radius:0;box-shadow:none}',
    '#R svg{display:block;flex-shrink:0}',
    '#R svg[fill="none"],#R svg[fill="none"] *:not([fill]){fill:none!important}',
    '#R svg [stroke="currentColor"]{stroke:currentColor!important}',
    '#R a:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '#R .jr-wrap{max-width:1240px;margin:0 auto;padding:clamp(56px,7vw,100px) clamp(16px,4vw,48px)}',
    '#R .jr-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1fr);gap:clamp(40px,6vw,96px);align-items:center}',

    /* fotografije: velika uspravna + manja preko donjeg desnog ugla, ista noćna obrada kao vijesti */
    '#R .jr-media{position:relative;padding:0 15% 13% 0}',
    '#R .jr-photo{position:relative;overflow:hidden;isolation:isolate;background:var(--surface)}',
    '#R .jr-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;filter:saturate(.7) brightness(.84) contrast(1.06)}',
    '#R .jr-photo::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(160deg,#1E4F96 0%,#0E2A55 100%);mix-blend-mode:soft-light;opacity:.7}',
    '#R .jr-photo::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.09)}',
    '#R .jr-photo--main{aspect-ratio:4/5;border-radius:30px;box-shadow:0 50px 90px -50px rgba(0,0,0,.95),var(--raised)}',
    '#R .jr-photo--main img{object-position:50% 58%}',
    '#R .jr-photo--side img{object-position:50% 72%}',
    '#R .jr-photo--main i{position:absolute;inset:auto 0 0 0;height:38%;background:linear-gradient(0deg,rgba(10,17,32,.55),rgba(10,17,32,0))}',
    '#R .jr-photo--side{position:absolute;right:0;bottom:0;width:42%;aspect-ratio:4/5;border-radius:22px;',
    'outline:6px solid var(--bg);box-shadow:0 30px 60px -30px rgba(0,0,0,.9),var(--raised)}',

    /* tekst */
    '#R .jr-text{min-width:0}',
    '#R .jr-eyebrow{display:flex;align-items:center;gap:12px;font:600 12px/1 var(--fd);letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}',
    '#R .jr-eyebrow::before{content:"";width:28px;height:2px;border-radius:2px;background:var(--accent);box-shadow:0 0 10px rgba(0,185,242,.8)}',
    '#R h2{font-size:clamp(34px,4.4vw,58px);font-weight:800;line-height:.98;letter-spacing:-.022em}',
    '#R h2 span{display:inline-block}',
    '@supports (-webkit-text-stroke:1px #fff){#R h2 span{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:1.3px rgba(255,255,255,.82)!important}}',
    '#R .jr-lead{margin-top:24px;font-size:17px;line-height:1.65;color:var(--text-2)!important;max-width:48ch;text-wrap:pretty}',

    /* podaci o vožnji: tihi udubljeni panel, tri kolone odvojene tankom linijom */
    '#R .jr-specs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:34px;border-radius:22px;background:#0E1626;',
    'box-shadow:inset 3px 3px 8px rgba(0,0,0,.5),inset -3px -3px 7px rgba(70,96,142,.09)}',
    '#R .jr-spec{display:flex;flex-direction:column;gap:6px;padding:20px 22px 21px}',
    '#R .jr-spec + .jr-spec{border-left:1px solid var(--line)}',
    '#R .jr-spec dt{font:600 10.5px/1.2 var(--fd);letter-spacing:2.2px;text-transform:uppercase;color:var(--text-3)}',
    '#R .jr-spec dd{display:flex;align-items:baseline;gap:5px;font:700 clamp(26px,2.4vw,32px)/1 var(--fd);letter-spacing:-.02em;color:var(--text);white-space:nowrap;font-variant-numeric:tabular-nums}',
    '#R .jr-spec dd small{font:500 14px/1 var(--fd);letter-spacing:0;color:var(--text-3)}',
    '#R .jr-spec .jr-spec__sub{display:block;font:400 13.5px/1.35 var(--fb);letter-spacing:0;color:var(--text-3);white-space:normal}',
    '#R .jr-spec--accent dd{color:var(--accent)}',
    '#R .jr-notes{display:flex;flex-wrap:wrap;gap:8px 26px;margin-top:18px!important}',
    '#R .jr-notes li{display:flex;align-items:center;gap:10px;font-size:14.5px;line-height:1.4;color:var(--text-2)}',
    '#R .jr-notes li::before{content:""!important;width:6px;height:6px;border-radius:50%;flex:none;background:var(--accent);box-shadow:0 0 8px rgba(0,185,242,.7)}',

    /* rezervacija */
    '#R .jr-book{margin-top:30px;padding-top:26px;border-top:1px solid var(--line)}',
    '#R .jr-book small{display:block;font:600 11px/1 var(--fd);letter-spacing:2.4px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px}',
    '#R .jr-book p{font-size:15.5px;line-height:1.6;color:var(--text-2)!important;max-width:54ch}',
    '#R .jr-book p a{color:var(--text)!important;border-bottom:1px solid rgba(0,185,242,.45);white-space:nowrap}',
    '#R .jr-book p a:hover{color:var(--accent)!important}',
    '#R .jr-acts{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:22px}',
    /* glavno dugme: blago ispupčeno cyan, ikona u plitkom udubljenom krugu (kao .jv-cta) */
    '#R .jr-cta{display:inline-flex;align-items:center;gap:12px;padding:5px 5px 5px 20px;border-radius:40px;font:600 13.5px/1 var(--fd);letter-spacing:.3px;color:#fff!important;',
    'background:linear-gradient(145deg,#27C4F2 0%,#0AAEE6 60%,#03A2D9 100%);transition:box-shadow .25s ease;',
    'box-shadow:5px 5px 12px rgba(0,0,0,.42),-4px -4px 10px rgba(70,110,170,.09),0 10px 22px -16px rgba(0,185,242,.6),inset 1px 1px 0 rgba(255,255,255,.32),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jr-cta__ico{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(0,90,130,.18);box-shadow:inset 2px 2px 4px rgba(0,55,90,.35),inset -1px -1px 3px rgba(255,255,255,.22)}',
    '#R .jr-cta__ico svg{width:15px;height:15px}',
    '#R .jr-cta:hover{box-shadow:6px 7px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(70,110,170,.1),0 12px 26px -14px rgba(0,185,242,.7),inset 1px 1px 0 rgba(255,255,255,.36),inset -2px -2px 5px rgba(0,70,110,.22)}',
    '#R .jr-cta:active{box-shadow:inset 3px 3px 6px rgba(0,60,95,.4),inset -2px -2px 5px rgba(255,255,255,.18)}',
    /* sporedno dugme: tamna neumorfna pilula (kao .jv-more) */
    '#R .jr-more{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;border-radius:40px;font:600 14px/1 var(--fd);letter-spacing:.2px;color:var(--text-2)!important;background:var(--surface);box-shadow:var(--raised);transition:color .2s}',
    '#R .jr-more:hover{color:var(--accent)!important}',
    '#R .jr-more svg{width:16px;height:16px}',

    /* tablet: dvije kolone, podaci u redovima; telefon: fotografije gore, tekst ispod */
    '@media (max-width:980px){',
    '#R .jr-grid{grid-template-columns:minmax(0,.86fr) minmax(0,1fr);gap:clamp(28px,5vw,48px)}',
    '#R .jr-specs{grid-template-columns:1fr;border-radius:18px}',
    '#R .jr-spec{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 16px;padding:15px 18px}',
    '#R .jr-spec + .jr-spec{border-left:0;border-top:1px solid var(--line)}',
    '#R .jr-spec dd{grid-column:2;grid-row:1 / span 2;font-size:24px}',
    '#R .jr-spec .jr-spec__sub{grid-column:1;grid-row:2;font-size:13px}',
    '#R .jr-spec.is-solo dt{grid-row:1 / span 2;align-self:center}',
    '#R .jr-notes{flex-direction:column;gap:8px}}',
    '@media (max-width:760px){',
    '#R .jr-grid{grid-template-columns:1fr;gap:44px}',
    '#R .jr-media{max-width:520px;padding:0 12% 14% 0}',
    '#R .jr-photo--main{border-radius:24px}',
    '#R .jr-photo--side{border-radius:18px;outline-width:5px}',
    '#R .jr-lead{font-size:16px;margin-top:18px}',
    '#R .jr-specs{margin-top:26px}',
    '#R .jr-acts{gap:12px}',
    '#R .jr-acts a{flex:1 1 auto;justify-content:center}',
    '#R .jr-acts .jr-cta{justify-content:space-between}}'
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
  var S = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" ' + S + '/><path d="M4.5 7 L12 12.5 L19.5 7" ' + S + '/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.6 3.8 L9.2 3.6 L10.6 7.6 L8.7 9 C9.6 11.1 11.2 12.8 13.3 13.8 L14.8 11.9 L18.8 13.4 L18.5 16 C18.4 17.2 17.3 18.1 16.1 18 C9.7 17.4 5 12.6 4.5 6.2 C4.4 5 5.3 3.9 6.6 3.8 Z" ' + S + '/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // mail i broj u rečenici postaju linkovi
  function linkify(s) {
    return esc(s).replace(MAIL, '<a href="mailto:' + MAIL + '">' + MAIL + '</a>')
      .replace(PHONE, '<a href="tel:' + TEL + '">' + PHONE + '</a>');
  }

  root.innerHTML =
    '<section class="jr-wrap" aria-labelledby="jr-h"><div class="jr-grid">' +
      '<figure class="jr-media">' +
        '<div class="jr-photo jr-photo--main"><img src="' + esc(IMG1) + '" alt="' + esc(T.alt1) + '" width="640" height="800" decoding="async" loading="lazy"><i></i></div>' +
        '<div class="jr-photo jr-photo--side"><img src="' + esc(IMG2) + '" alt="' + esc(T.alt2) + '" width="399" height="670" decoding="async" loading="lazy"></div>' +
      '</figure>' +
      '<div class="jr-text">' +
        '<div class="jr-eyebrow">' + esc(T.eyebrow) + '</div>' +
        '<h2 id="jr-h">' + esc(T.t1) + ' <span>' + esc(T.t2) + '</span></h2>' +
        '<p class="jr-lead">' + esc(T.lead) + '</p>' +
        '<dl class="jr-specs">' + T.specs.map(function (s, k) {
          return '<div class="jr-spec' + (k === 2 ? ' jr-spec--accent' : '') + (s[3] ? '' : ' is-solo') + '"><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '<small>' + esc(s[2]) + '</small></dd>' +
            (s[3] ? '<dd class="jr-spec__sub">' + esc(s[3]) + '</dd>' : '') + '</div>';
        }).join('') + '</dl>' +
        '<ul class="jr-notes">' + T.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
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
})(window, document);
