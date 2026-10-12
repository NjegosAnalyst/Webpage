/* =====================================================================
   JAHORINA — "KUPI SKI PASS" NA TELEFONU (plutajuće dugme pri dnu ekrana) · v2
   Tema hero-a i ostalih blokova: tamno staklo, jedan cyan akcenat, Archivo/Barlow, bijelo glavno dugme.
     · samo na telefonu (do 760 px); na računaru i tabletu se ne prikazuje;
     · v2 (korisnik: „ljepši i profesionalniji, istaknut, ali da ne ometa pretragu i preglednost“): kompaktna plutajuća
       pilula DOLJE DESNO (ne preko cijele širine): tamno staklo, cyan krug sa ikonom karte + "Ski pass" / "KUPI ONLINE";
       dok se skroluje nadolje (čitanje) skupi se u krug, nagore se raširi; prvi put cyan prsten dvaput tiho pulsira;
     · pojavi se kad se skroluje ispod hero-a (60 % visine ekrana), klizne odozdo; nestane kad se dođe do footera
       (da ne prekrije kontakte) i kad je otvoren prozor preko ekrana (galerija, meni, video) ili tastatura;
     · uz smanjeno kretanje bez klizanja.

   LINK IZ WORDPRESSA: dugme vodi na stavku menija (Izgled → Izbornici) čiji tekst ili adresa liči na kupovinu ski
   pass-a ("Ski pass", "Web shop", "Kupi", "Online"); data-link ima prednost. Bez linka se dugme ne prikazuje, a
   prijavljeni admin u konzoli vidi razlog. Spoljni link (drugi domen) se otvara u novoj kartici.

   Ugradnja (jedno od dva):
     · samo početna: Elementor HTML widget sa <div id="jks-skipass" data-link="https://…"></div> + ovaj fajl;
     · cijeli sajt: WPCode JavaScript snippet (Site Wide Footer) sa loaderom (napravi-widget.py pravi oba reda).
   Podešavanja na <div id="jks-skipass"> (neobavezna): data-link, data-tekst ("Ski pass"), data-podnaslov ("Kupi online").
   GA: klik → skipass_klik (mjesto: dock).
   ===================================================================== */
(function (w, d) {
  'use strict';
  if (w.__jks) return;
  w.__jks = true;

  var EN = /^\/en(\/|$)/i.test(location.pathname);
  var cfg = d.getElementById('jks-skipass') || d.createElement('div');
  function opt(k, def) { var v = cfg.getAttribute('data-' + k); return v == null || !v.trim() ? def : v.trim(); }
  var T = {
    t: opt('tekst', 'Ski pass'),
    s: opt('podnaslov', EN ? 'Buy online' : 'Kupi online'),
    aria: EN ? 'Buy a ski pass online' : 'Kupi ski pass online'
  };

  /* kompaktna plutajuća pilula dolje desno (kao dugme u aplikacijama): tamno staklo (vidi se i na bijelim i na tamnim
     stranicama), cyan krug sa ikonom karte, tekst pored; dok se skroluje nadolje skupi se u krug, nagore se raširi */
  var CSS = [
    '#D{--accent:#00B9F2;--accent-2:#2CCBF8;--fd:\'Archivo\',system-ui,-apple-system,\'Segoe UI\',sans-serif;--fb:\'Barlow\',system-ui,-apple-system,\'Segoe UI\',sans-serif;',
    'position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147482000;display:none;pointer-events:none;color-scheme:dark}',
    '@media (max-width:760px){#D{display:block}}',
    '#D *,#D *::before,#D *::after{box-sizing:border-box}',
    '#D a.jks-pill{all:unset;box-sizing:border-box!important;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;position:relative;display:flex!important;align-items:center;height:56px;padding:5px!important;border-radius:30px!important;',
    'background:rgba(11,18,33,.86)!important;-webkit-backdrop-filter:blur(16px) saturate(1.3);backdrop-filter:blur(16px) saturate(1.3);',
    'box-shadow:0 14px 30px -10px rgba(4,9,20,.7),0 2px 6px rgba(4,9,20,.35),inset 0 0 0 1px rgba(255,255,255,.14),inset 0 1px 0 rgba(255,255,255,.12)!important;',
    'transform:translateY(calc(100% + 30px)) scale(.9);opacity:0;transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .35s ease,box-shadow .3s}',
    '#D.is-on a.jks-pill{transform:none;opacity:1}',
    /* cyan krug sa ikonom karte (jedini akcenat) */
    '#D .jks-ico{position:relative;flex-shrink:0;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;color:#fff;',
    'background:radial-gradient(circle at 32% 28%,#4FD8FF,#00B9F2 55%,#0791C9);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -3px 6px rgba(0,60,100,.35),0 4px 14px -4px rgba(0,185,242,.8)}',
    '#D .jks-ico svg{display:block;width:22px;height:22px;transform:rotate(-12deg)}',
    '#D .jks-ico::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(0,185,242,.75);opacity:0;pointer-events:none}',
    '#D.is-new .jks-ico::after{animation:jksPing 1.8s ease-out .5s 2}',
    '@keyframes jksPing{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.45);opacity:0}}',
    /* tekst pored kruga; kad se pilula skupi, širina mu ide na 0 */
    '#D .jks-txt{display:flex;flex-direction:column;justify-content:center;gap:4px;max-width:160px;overflow:hidden;padding:0 18px 0 12px;white-space:nowrap;',
    'transition:max-width .45s cubic-bezier(.2,.8,.2,1),padding .45s cubic-bezier(.2,.8,.2,1),opacity .3s ease}',
    '#D .jks-txt b{font:700 15px/1 var(--fd)!important;letter-spacing:.1px;color:#fff!important}',
    '#D .jks-txt small{font:600 10.5px/1 var(--fd)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--accent-2)!important}',
    '#D.is-mini .jks-txt{max-width:0;padding:0;opacity:0}',
    '#D a.jks-pill:active{transform:scale(.96)!important}',
    '#D a.jks-pill:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '@media (prefers-reduced-motion:reduce){#D a.jks-pill,#D .jks-txt{transition:opacity .2s ease!important}#D a.jks-pill{transform:none!important}#D .jks-ico::after{animation:none!important}}'
  ].join('\n').replace(/#D/g, '#jks-dock');

  var st = d.getElementById('jks-css');
  if (!st) { st = d.createElement('style'); st.id = 'jks-css'; (d.head || d.documentElement).appendChild(st); }
  st.textContent = CSS;
  if (!d.querySelector('link[href*="family=Archivo"]')) {
    var fl = d.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap';
    d.head.appendChild(fl);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // link: data-link, pa stavka menija iz WordPressa koja liči na kupovinu ski pass-a
  var BUY = /ski[\s-]*pass|skipass|web[\s-]*shop|webshop|online\s*(?:prodaj|kupovin|shop)|\bkupi\b|\bbuy\b|e-?shop|ticket\s*shop/i;
  function findLink() {
    var l = opt('link', '');
    if (l) return l;
    var as = [].slice.call(d.querySelectorAll('.jf-header a[href], header a[href], nav a[href], .menu a[href], #menu a[href]'));
    var hit = as.filter(function (a) {
      var h = a.getAttribute('href') || '';
      if (!h || h === '#' || /^(mailto:|tel:|javascript:)/i.test(h)) return false;
      return BUY.test(a.textContent || '') || /shop|skipass|ski-pass|webshop/i.test(h);
    });
    // prednost: link na prodavnicu (shop/online) ispred cjenovnika
    hit.sort(function (a, b) { return (/shop|online|kupi|buy/i.test(b.textContent + b.href) ? 1 : 0) - (/shop|online|kupi|buy/i.test(a.textContent + a.href) ? 1 : 0); });
    return hit[0] ? hit[0].href : '';
  }

  var dock = null, pill = null, on = false, footVis = false;
  function build(href) {
    dock = d.createElement('div'); dock.id = 'jks-dock';
    var ext = false;
    try { ext = new URL(href, location.href).host !== location.host; } catch (e) {}
    dock.innerHTML = '<a class="jks-pill" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + esc(T.aria) + '">' +
      '<span class="jks-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 7.5 C4 6.7 4.7 6 5.5 6 H18.5 C19.3 6 20 6.7 20 7.5 V9.6 C18.9 9.8 18.1 10.8 18.1 12 C18.1 13.2 18.9 14.2 20 14.4 V16.5 C20 17.3 19.3 18 18.5 18 H5.5 C4.7 18 4 17.3 4 16.5 V14.4 C5.1 14.2 5.9 13.2 5.9 12 C5.9 10.8 5.1 9.8 4 9.6 Z M14.5 6.4 V8 M14.5 11.2 V12.8 M14.5 16 V17.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span class="jks-txt"><b>' + esc(T.t) + '</b><small>' + esc(T.s) + '</small></span>' +
      '</a>';
    d.body.appendChild(dock);
    pill = dock.querySelector('a');
    pill.setAttribute('tabindex', '-1');
    pill.addEventListener('click', function () { track('skipass_klik', { mjesto: 'dock' }); });
  }
  // vidljivo: ispod hero-a, prije footera, bez otvorenog prozora preko ekrana i bez tastature (fokus u polju)
  var lastY = 0, firstShow = true;
  function update() {
    if (!dock) return;
    var y = w.scrollY || d.documentElement.scrollTop || 0, vh = w.innerHeight || 700;
    var locked = d.documentElement.style.overflow === 'hidden' || d.body.style.overflow === 'hidden';
    var ae = d.activeElement, typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
    // nadolje (čita se) → samo krug; nagore → raširi se. Mali pomaci (< 8 px) ne mijenjaju stanje
    if (Math.abs(y - lastY) > 8) { dock.classList.toggle('is-mini', y > lastY); lastY = y; }
    var want = y > vh * .6 && !footVis && !locked && !typing;
    if (want === on) return;
    on = want;
    if (on) { dock.classList.remove('is-mini'); lastY = y; }
    if (on && firstShow) { firstShow = false; dock.classList.add('is-new'); }
    dock.classList.toggle('is-on', on);
    pill.setAttribute('tabindex', on ? '0' : '-1');
    pill.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  function track(name, params) {
    params = params || {}; params.jezik = EN ? 'en' : 'sr';
    try {
      if (typeof w.gtag === 'function') w.gtag('event', name, params);
      else if (w.dataLayer && typeof w.dataLayer.push === 'function') {
        var ev = { event: name }; for (var k in params) ev[k] = params[k]; w.dataLayer.push(ev);
      }
    } catch (e) {}
  }
  function start(again) {
    var href = findLink();
    if (!href && !again) { setTimeout(function () { start(true); }, 1500); return; }   // meni (naš header) se možda još crta
    if (!href) {
      if (d.body && d.body.classList.contains('logged-in') && w.console) console.warn('[Jahorina Ski pass] nema linka: dodaj data-link ili stavku menija "Ski pass" / "Web shop"');
      return;
    }
    build(href);
    var raf = 0;
    function req() { if (!raf) raf = w.requestAnimationFrame(function () { raf = 0; update(); }); }
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    d.addEventListener('focusin', req); d.addEventListener('focusout', function () { setTimeout(req, 50); });
    // prozori preko ekrana (galerija, meni bara, video) zaključaju skrol na <html> → dugme se skloni
    if ('MutationObserver' in w) new MutationObserver(req).observe(d.documentElement, { attributes: true, attributeFilter: ['style'] });
    // footer (naš ili Betheme): kad se pojavi, dugme se skloni
    var foot = d.querySelector('.jf-wp, .jf-footer, #Footer, footer');
    if (foot && 'IntersectionObserver' in w) new IntersectionObserver(function (es) { footVis = es[es.length - 1].isIntersecting; req(); }).observe(foot);
    req();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { start(); }); else start();
})(window, document);
