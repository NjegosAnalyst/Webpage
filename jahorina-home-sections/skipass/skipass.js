/* =====================================================================
   JAHORINA — "KUPI SKI PASS" NA TELEFONU (plutajuće dugme pri dnu ekrana) · v1
   Tema hero-a i ostalih blokova: tamno staklo, jedan cyan akcenat, Archivo/Barlow, bijelo glavno dugme.
     · samo na telefonu (do 760 px); na računaru i tabletu se ne prikazuje;
     · staklena pilula pri dnu ekrana (iznad trake telefona, safe-area): lijevo tiha cyan tačka + "Ski pass" i
       "Kupovina online", desno bijelo dugme "Kupi" sa strelicom u plitkom krugu; cijela pilula je link;
     · pojavi se kad se skroluje ispod hero-a (60 % visine ekrana), klizne odozdo; nestane kad se dođe do footera
       (da ne prekrije kontakte) i kad je otvoren prozor preko ekrana (galerija, meni, video) ili tastatura;
     · uz smanjeno kretanje bez klizanja.

   LINK IZ WORDPRESSA: dugme vodi na stavku menija (Izgled → Izbornici) čiji tekst ili adresa liči na kupovinu ski
   pass-a ("Ski pass", "Web shop", "Kupi", "Online"); data-link ima prednost. Bez linka se dugme ne prikazuje, a
   prijavljeni admin u konzoli vidi razlog. Spoljni link (drugi domen) se otvara u novoj kartici.

   Ugradnja (jedno od dva):
     · samo početna: Elementor HTML widget sa <div id="jks-skipass" data-link="https://…"></div> + ovaj fajl;
     · cijeli sajt: WPCode JavaScript snippet (Site Wide Footer) sa loaderom (napravi-widget.py pravi oba reda).
   Podešavanja na <div id="jks-skipass"> (neobavezna): data-link, data-tekst ("Ski pass"), data-podnaslov
   ("Kupovina online"), data-dugme ("Kupi").
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
    s: opt('podnaslov', EN ? 'Buy online' : 'Kupovina online'),
    b: opt('dugme', EN ? 'Buy' : 'Kupi'),
    aria: EN ? 'Buy a ski pass online' : 'Kupi ski pass online'
  };

  var CSS = [
    '#D{--accent:#00B9F2;--accent-2:#2CCBF8;--fd:\'Archivo\',system-ui,-apple-system,\'Segoe UI\',sans-serif;--fb:\'Barlow\',system-ui,-apple-system,\'Segoe UI\',sans-serif;',
    'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;display:none;pointer-events:none;color-scheme:dark}',
    '@media (max-width:760px){#D{display:block}}',
    '#D *,#D *::before,#D *::after{box-sizing:border-box}',
    '#D a.jks-pill{all:unset;box-sizing:border-box!important;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex!important;align-items:center;gap:12px;width:100%;max-width:440px;margin:0 auto;height:62px;padding:0 7px 0 18px!important;border-radius:32px!important;',
    'background:rgba(13,21,38,.74)!important;-webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2);',
    'box-shadow:0 18px 40px -14px rgba(0,0,0,.85),inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.14)!important;',
    'transform:translateY(calc(100% + 30px));opacity:0;transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .35s ease}',
    '#D.is-on a.jks-pill{transform:none;opacity:1}',
    '#D .jks-dot{position:relative;flex-shrink:0;width:8px;height:8px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 10px rgba(0,185,242,.9)}',
    '#D .jks-dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(0,185,242,.6);opacity:0;animation:jksPing 2.8s ease-out infinite}',
    '@keyframes jksPing{0%{transform:scale(.6);opacity:.8}70%,100%{transform:scale(1.6);opacity:0}}',
    '#D .jks-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}',
    '#D .jks-txt b{font:700 15px/1 var(--fd)!important;letter-spacing:.2px;color:#fff!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#D .jks-txt small{font:500 11.5px/1.1 var(--fb)!important;letter-spacing:.3px;color:rgba(255,255,255,.62)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* bijelo glavno dugme kao u ostalim blokovima, sa strelicom u plitkom udubljenom krugu */
    '#D .jks-btn{position:relative;overflow:hidden;flex-shrink:0;display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 6px 0 20px;border-radius:26px;',
    'font:700 14px/1 var(--fb)!important;letter-spacing:.3px;color:#0d1524!important;background:linear-gradient(145deg,#fff,#E6EEF6);',
    'box-shadow:inset -2px -2px 4px rgba(13,21,36,.1),inset 2px 2px 3px #fff,0 6px 16px -6px rgba(0,0,0,.6)}',
    '#D .jks-btn::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;transform:skewX(-20deg);',
    'background:linear-gradient(100deg,transparent,rgba(0,185,242,.35),rgba(255,255,255,.9),rgba(0,185,242,.35),transparent)}',
    '#D.is-on .jks-btn::after{animation:jksShine 1.6s ease-in-out .6s 1}',
    '@keyframes jksShine{0%{left:-60%}100%{left:130%}}',
    '#D .jks-ico{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#E9F0F7;box-shadow:inset 2px 2px 4px rgba(13,21,36,.16),inset -2px -2px 4px #fff}',
    '#D .jks-ico svg{display:block;width:17px;height:17px;color:#0d1524}',
    '#D a.jks-pill:active .jks-btn{box-shadow:inset 3px 3px 7px rgba(13,21,36,.25),inset -3px -3px 6px #fff}',
    '#D a.jks-pill:focus-visible{outline:2px solid var(--accent)!important;outline-offset:3px!important}',
    '@media (max-width:340px){#D .jks-txt small{display:none}}',
    '@media (prefers-reduced-motion:reduce){#D a.jks-pill{transition:opacity .2s ease!important;transform:none!important}#D .jks-dot::after,#D .jks-btn::after{animation:none!important}}'
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
      '<span class="jks-dot" aria-hidden="true"></span>' +
      '<span class="jks-txt"><b>' + esc(T.t) + '</b><small>' + esc(T.s) + '</small></span>' +
      '<span class="jks-btn">' + esc(T.b) + '<span class="jks-ico"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>' +
      '</a>';
    d.body.appendChild(dock);
    pill = dock.querySelector('a');
    pill.setAttribute('tabindex', '-1');
    pill.addEventListener('click', function () { track('skipass_klik', { mjesto: 'dock' }); });
  }
  // vidljivo: ispod hero-a, prije footera, bez otvorenog prozora preko ekrana i bez tastature (fokus u polju)
  function update() {
    if (!dock) return;
    var y = w.scrollY || d.documentElement.scrollTop || 0, vh = w.innerHeight || 700;
    var locked = d.documentElement.style.overflow === 'hidden' || d.body.style.overflow === 'hidden';
    var ae = d.activeElement, typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
    var want = y > vh * .6 && !footVis && !locked && !typing;
    if (want === on) return;
    on = want;
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
