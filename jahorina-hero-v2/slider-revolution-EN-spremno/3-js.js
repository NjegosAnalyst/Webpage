/* =====================================================================
   JAHORINA HERO — DIO 3: JavaScript  (Slider Revolution → ⚙ → CSS/jQuery → CUSTOM JS SR6)
   Ne treba ništa mijenjati.
   ===================================================================== */
(function underHeaderEarly() {
  var hero = document.querySelector('.jh-hero');
  if (!hero || !document.querySelector('.jf-header')) {   // header stiže sa CDN-a — provjera u svakom kadru, prije crtanja (najduže 8 s)
    if (performance.now() < 8000) requestAnimationFrame(underHeaderEarly);
    return;
  }
  // >>> rano
  (function underHeader() {
    if (hero.__jhFit) return hero.__jhFit();   // već namješteno ranije — samo provjeri
    var hdr = document.querySelector('.jf-header');
    if (!hdr) return;
    function fit() {
      var wrap = hero.closest('rs-fullwidth-wrap') || hero.closest('rs-module-wrap') || hero.closest('rs-module');
      if (hero.__jhWrap) hero.__jhWrap.style.marginTop = '';
      hero.__jhPull = 0; hero.__jhWrap = null;
      if (!wrap || !window.matchMedia('(max-width:760px)').matches) return;
      var y = window.scrollY || 0;
      var top = wrap.getBoundingClientRect().top + y, hTop = hdr.getBoundingClientRect().top + y;   // hTop = ispod admin trake, ako postoji
      var pull = Math.round(top - hTop);
      if (pull > 0 && pull <= hdr.offsetHeight + 90) {
        wrap.style.marginTop = (-pull) + 'px';
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
        wrap.style.zIndex = '1';
        hero.__jhPull = pull; hero.__jhWrap = wrap;
      }
    }
    hero.__jhFit = fit;
    fit(); window.addEventListener('load', fit);
    // telefon javlja "resize" i kad se pri skrolovanju sakrije traka adrese — tada nema šta da se mijenja
    var t, lw = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth === lw) return; lw = window.innerWidth; clearTimeout(t); t = setTimeout(fit, 200); });
  })();
})();

(function waitForHero(tries) {
  // Slider Revolution ubaci sloj, ali ga prikaže tek kad učita slajd.
  // Čekamo da hero bude STVARNO vidljiv, pa tek onda pokrećemo sve animacije (samo jednom).
  tries = tries || 0;
  var el = document.querySelector('.jh-hero');
  function visible(node) {
    var r = node.getBoundingClientRect();
    if (r.width < 50 || r.height < 50) return false;
    for (var n = node; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.9) return false;
    }
    return true;
  }
  if (!el || !visible(el)) {
    if (tries < 400) setTimeout(function () { waitForHero(tries + 1); }, 50);
    else if (el) el.classList.add('jh-go');
    if (tries < 400) return;
  }
  if (!el || window.__jahorinaHeroStarted) return;
  window.__jahorinaHeroStarted = true;
  // pušta CSS animacije koje su do sada bile pauzirane — tek kadar POSLIJE pripreme ispod,
  // da teški posao (mjerenje slova, platno za svjetla) ne padne usred pokreta (to je bio trzaj na otvaranju)
  function go() { el.classList.add('jh-go'); }
  requestAnimationFrame(function () { requestAnimationFrame(go); });
  setTimeout(go, 150);   // rezerva (npr. stranica otvorena u pozadinskoj kartici)

(function () {
  var hero = document.querySelector('.jh-hero');
  if (!hero) return;

  // dijagnostika za podešavanje: dodaj ?jhdebug na adresu stranice → poslije 6 s prikaže mjere hero-a (posjetioci to ne vide)
  if (/[?&#]jhdebug/.test(location.href)) setTimeout(function () {
    function q(s) { return hero.querySelector(s); }
    function r(el) { if (!el) return '-'; var b = el.getBoundingClientRect(); return Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height); }
    function c(el, p) { return el ? getComputedStyle(el)[p] : '-'; }
    var ice = q('.jh-ice'), qk = q('.jh-quick'), L = [
      'ekran ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio + ' doc ' + document.documentElement.clientWidth,
      'hero ' + r(hero) + ' pad ' + c(hero, 'paddingLeft'),
      'frame ' + r(q('.jh-frame')) + ' ' + c(q('.jh-frame'), 'display'),
      'headline ' + r(q('.jh-headline')) + ' ' + c(q('.jh-headline'), 'position') + ' ta ' + c(q('.jh-headline'), 'textAlign'),
      'kicker ' + r(q('.jh-kicker')) + ' ta ' + c(q('.jh-kicker > span'), 'textAlign') + ' ls ' + c(q('.jh-kicker'), 'letterSpacing'),
      'title ' + r(q('.jh-title')) + ' ta ' + c(q('.jh-title'), 'textAlign') + '/' + c(q('.jh-title > span'), 'textAlign') + ' fs ' + c(q('.jh-title'), 'fontSize'),
      'ice ' + r(ice) + ' ' + c(ice, 'display') + ' ml ' + c(ice, 'marginLeft') + ' mr ' + c(ice, 'marginRight') + ' w ' + c(ice, 'width'),
      'quick ' + r(qk) + ' l ' + c(qk, 'left') + ' r ' + c(qk, 'right') + ' w ' + c(qk, 'width') + ' ml ' + c(qk, 'marginLeft'),
      'ispod headera: pomak ' + (hero.__jhPull || 0) + ' header ' + r(document.querySelector('.jf-header')) + ' na y=40: ' + (function () { var e = document.elementFromPoint(innerWidth / 2, 40); return e ? e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '') : '-'; })()
    ];
    for (var n = hero.parentElement, i = 0; n && i < 5; n = n.parentElement, i++) L.push('^' + n.tagName.toLowerCase() + (n.className && n.className.baseVal === undefined ? '.' + String(n.className).split(' ')[0] : '') + ' ' + r(n) + ' tf ' + c(n, 'transform').slice(0, 30));
    var d = document.createElement('pre'); d.textContent = L.join('\n');
    d.style.cssText = 'position:fixed;left:6px;right:6px;top:64px;z-index:2147483647;margin:0;background:rgba(0,0,0,.88);color:#7CFC9A;font:10px/1.35 monospace;padding:8px;border-radius:8px;white-space:pre-wrap;word-break:break-all;pointer-events:none';
    document.body.appendChild(d);
  }, 6000);

  // "O nama" dropdown i hamburger — samo ako hero ima svoj meni
  // (u Slider Revolution verziji meni dolazi iz teme, pa ovog dijela nema)
  var dd = hero.querySelector('.jh-dropdown');
  var header = hero.querySelector('.jh-header');
  var burger = hero.querySelector('.jh-burger');
  if (dd && header && burger) {
    var ddBtn = dd.querySelector('button');
    var setDropdown = function (open) {
      dd.classList.toggle('is-open', open);
      ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setDropdown(!dd.classList.contains('is-open'));
    });
    // Hamburger (samo na užim ekranima)
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !header.classList.contains('is-menu-open');
      header.classList.toggle('is-menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) setDropdown(false);
      if (!header.contains(e.target)) {
        header.classList.remove('is-menu-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setDropdown(false);
        header.classList.remove('is-menu-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ===== Telefon: hero ide ispod providnog headera sve do vrha ekrana (bez šava ispod headera) =====
  // Radi samo na sajtu (gdje postoji naš header .jf-header i Slider Revolution omotač) i samo ako je hero odmah ispod headera.
  // U Slider Revolution verziji ovaj dio se pokrene odmah pri učitavanju, prije prikaza slajda (da slika ne "skoči" pred posjetiocem).
  // >>> rano
  (function underHeader() {
    if (hero.__jhFit) return hero.__jhFit();   // već namješteno ranije — samo provjeri
    var hdr = document.querySelector('.jf-header');
    if (!hdr) return;
    function fit() {
      var wrap = hero.closest('rs-fullwidth-wrap') || hero.closest('rs-module-wrap') || hero.closest('rs-module');
      if (hero.__jhWrap) hero.__jhWrap.style.marginTop = '';
      hero.__jhPull = 0; hero.__jhWrap = null;
      if (!wrap || !window.matchMedia('(max-width:760px)').matches) return;
      var y = window.scrollY || 0;
      var top = wrap.getBoundingClientRect().top + y, hTop = hdr.getBoundingClientRect().top + y;   // hTop = ispod admin trake, ako postoji
      var pull = Math.round(top - hTop);
      if (pull > 0 && pull <= hdr.offsetHeight + 90) {
        wrap.style.marginTop = (-pull) + 'px';
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
        wrap.style.zIndex = '1';
        hero.__jhPull = pull; hero.__jhWrap = wrap;
      }
    }
    hero.__jhFit = fit;
    fit(); window.addEventListener('load', fit);
    // telefon javlja "resize" i kad se pri skrolovanju sakrije traka adrese — tada nema šta da se mijenja
    var t, lw = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth === lw) return; lw = window.innerWidth; clearTimeout(t); t = setTimeout(fit, 200); });
  })();
  // <<< rano

  // ===== Vremenska prognoza: gore desno, odmah ispod menija (vodoravna traka u stilu dugmadi) =====
  // Podaci: MET Norway (Locationforecast 2.0, besplatno i za komercijalne sajtove, uz navođenje izvora).
  // Svaki posjetilac pita najviše jednom u 30 min (keš u pregledniku). Ako ne uspije — widget se ne prikazuje.
  (function weather() {
    var LAT = 43.733, LON = 18.567, ALT = 1600;   // Jahorina; ALT = visina (m) za koju se računa temperatura
    var frame = hero.querySelector('.jh-frame');
    if (!frame || !window.fetch || hero.querySelector('.jh-wx')) return;
    var en = /^en/i.test(document.documentElement.lang || '') || /^\/en(\/|$)/.test(location.pathname) ||
      /Olympic/.test(hero.getAttribute('aria-label') || '');   // EN modul hero-a
    var L = en ? {
      label: 'Weather forecast for Jahorina', wind: 'Wind', src: 'MET Norway', srcS: 'met.no',
      d: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      k: { clear: 'Clear', fair: 'Mostly clear', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog', lrain: 'Light rain', rain: 'Rain', hrain: 'Heavy rain',
        rshow: 'Showers', sleet: 'Sleet', lsnow: 'Light snow', snow: 'Snow', hsnow: 'Heavy snow', sshow: 'Snow showers', thunder: 'Thunder' }
    } : {
      label: 'Vremenska prognoza za Jahorinu', wind: 'Vjetar', src: 'MET Norway', srcS: 'met.no',
      d: ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'],
      k: { clear: 'Vedro', fair: 'Pretežno vedro', partly: 'Djelimično oblačno', cloudy: 'Oblačno', fog: 'Magla', lrain: 'Slaba kiša', rain: 'Kiša', hrain: 'Jaka kiša',
        rshow: 'Pljuskovi', sleet: 'Susnježica', lsnow: 'Slab snijeg', snow: 'Snijeg', hsnow: 'Jak snijeg', sshow: 'Snježni pljuskovi', thunder: 'Grmljavina' }
    };
    var t0 = performance.now(), box = document.createElement('div'), shown = false, tries = 0;
    box.className = 'jh-wx'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', L.label);
    frame.appendChild(box);

    // MET simbol (npr. "lightsnowshowers_night") → vrsta vremena
    function kind(code) {
      var c = String(code || '').replace(/_(day|night|polartwilight)$/, '');
      if (/thunder/.test(c)) return 'thunder';
      if (/sleet/.test(c)) return 'sleet';
      if (/snowshowers/.test(c)) return 'sshow';
      if (/snow/.test(c)) return /^heavy/.test(c) ? 'hsnow' : /^light/.test(c) ? 'lsnow' : 'snow';
      if (/rainshowers/.test(c)) return 'rshow';
      if (/rain/.test(c)) return /^heavy/.test(c) ? 'hrain' : /^light/.test(c) ? 'lrain' : 'rain';
      if (c === 'fog') return 'fog';
      if (c === 'cloudy') return 'cloudy';
      if (c === 'partlycloudy') return 'partly';
      if (c === 'fair') return 'fair';
      return 'clear';
    }
    // ikonice: tanke linije kao dugmad (svaki element ima stroke — tako ga štite i pravila za SR)
    function P(d) { return '<path d="' + d + '" stroke="currentColor"/>'; }
    function D(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="1.1" fill="currentColor" stroke="none"/>'; }
    var CLOUD = P('M7.2 19h10.3a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.6A3.2 3.2 0 0 0 7.2 19Z'),
      CLOUD_HI = P('M7.2 15h10.3a3.6 3.6 0 0 0 .4-7.2 5.4 5.4 0 0 0-10.4 1.4A2.9 2.9 0 0 0 7.2 15Z'),
      CLOUD_SM = P('M9.6 20h8.2a3.3 3.3 0 0 0 .4-6.6 4.9 4.9 0 0 0-9.4 1.3A2.7 2.7 0 0 0 9.6 20Z'),
      SUN = '<circle cx="12" cy="12" r="4.2" stroke="currentColor"/>' + P('M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.4 5.4 7 7M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6'),
      MOON = P('M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.1 6.1 0 0 0 10.1 10.1Z'),
      SUN_SM = '<circle cx="8" cy="7.6" r="2.6" stroke="currentColor"/>' + P('M8 2.4v1.3M2.4 7.6h1.3M4 3.6l.9.9M12 3.6l-.9.9M4 11.6l.9-.9'),
      MOON_SM = P('M11.6 9.8A4.6 4.6 0 1 1 5.7 3.9a3.6 3.6 0 0 0 5.9 5.9Z');
    function icon(k, night) {
      var g;
      if (k === 'clear') g = night ? MOON : SUN;
      else if (k === 'fair' || k === 'partly') g = (night ? MOON_SM : SUN_SM) + CLOUD_SM;
      else if (k === 'cloudy') g = CLOUD;
      else if (k === 'fog') g = P('M4 8.5h16M6.5 12.5h11M4 16.5h16');
      else if (k === 'sleet') g = CLOUD_HI + P('M8.8 18 7.8 20.6') + D(13, 19.2) + P('M17.2 18l-1 2.6');
      else if (k === 'thunder') g = CLOUD_HI + P('M12.8 15.6 10.6 19h3.2l-2 3.2');
      else if (/snow|sshow/.test(k)) g = CLOUD_HI + D(8, 18.4) + D(12, 20.6) + D(16, 18.4);
      else g = CLOUD_HI + P('M8.5 18 7.5 20.6M12.5 18l-1 2.6M16.5 18l-1 2.6');
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' + g + '</svg>';
    }
    function deg(t) { var r = Math.round(t); return (r < 0 ? '−' + (-r) : String(r)) + '°'; }

    // datum, sat i dan u sedmici po vremenu na Jahorini (CET/CEST po pravilu EU), i kad je posjetilac u drugoj zoni.
    // Bez Intl.DateTimeFormat: njegovo pokretanje sa vremenskom zonom je na telefonu sporo (~20 ms) i pada usred ulaska.
    function lastSun(y, m) { var e = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, e.getUTCDate() - e.getUTCDay(), 1); }
    function parts(d) {
      var ms = d.getTime(), y = d.getUTCFullYear(), dst = ms >= lastSun(y, 2) && ms < lastSun(y, 9);
      var l = new Date(ms + (dst ? 2 : 1) * 3600000);   // lokalno vrijeme, čita se UTC poljima
      return { k: l.getUTCFullYear() + '-' + l.getUTCMonth() + '-' + l.getUTCDate(), h: l.getUTCHours(), wd: l.getUTCDay() };
    }
    function sym(x) {
      return (x.next_1_hours && x.next_1_hours.summary.symbol_code) || (x.next_6_hours && x.next_6_hours.summary.symbol_code) ||
        (x.next_12_hours && x.next_12_hours.summary.symbol_code) || '';
    }
    // odgovor MET-a → sada + sljedeća 3 dana (najviša/najniža temperatura i vrijeme oko podneva)
    function parse(j) {
      var ts = j && j.properties && j.properties.timeseries;
      if (!ts || !ts.length || !ts[0].data || !ts[0].data.instant) return null;
      var f = ts[0].data, now = { t: f.instant.details.air_temperature, w: f.instant.details.wind_speed, code: sym(f) };
      var today = parts(new Date()).k, days = {}, order = [];
      ts.forEach(function (e) {
        var p = parts(new Date(e.time)); if (p.k === today) return;
        var o = days[p.k];
        if (!o) { o = days[p.k] = { wd: p.wd, hi: -99, lo: 99, code: '', dist: 99 }; order.push(p.k); }
        var t = e.data.instant.details.air_temperature, n6 = e.data.next_6_hours;
        if (t != null) { o.hi = Math.max(o.hi, t); o.lo = Math.min(o.lo, t); }
        if (n6 && n6.details) {
          if (n6.details.air_temperature_max != null) o.hi = Math.max(o.hi, n6.details.air_temperature_max);
          if (n6.details.air_temperature_min != null) o.lo = Math.min(o.lo, n6.details.air_temperature_min);
        }
        var s = (n6 && n6.summary.symbol_code) || (e.data.next_12_hours && e.data.next_12_hours.summary.symbol_code) || '';
        if (s && Math.abs(p.h - 12) < o.dist) { o.dist = Math.abs(p.h - 12); o.code = s; }
      });
      var out = order.slice(0, 3).map(function (k) { var o = days[k]; return { wd: o.wd, hi: o.hi, lo: o.lo, code: o.code }; })
        .filter(function (o) { return o.hi > -99; });
      return now.t == null ? null : { now: now, days: out };
    }

    function render(d) {
      var k = kind(d.now.code), night = /_night$/.test(d.now.code);
      box.innerHTML =
        '<div class="jh-wx__now"><span class="jh-wx__ico">' + icon(k, night) + '</span>' +
        '<span class="jh-wx__t">' + deg(d.now.t) + '</span>' +
        '<span class="jh-wx__meta"><span class="jh-wx__desc">' + L.k[k] + '</span>' +
        (d.now.w != null ? '<span class="jh-wx__wind">' + L.wind + ' ' + Math.round(d.now.w * 3.6) + ' km/h</span>' : '') + '</span></div>' +
        '<div class="jh-wx__days">' + d.days.map(function (x) {
          var kk = kind(x.code);
          return '<div class="jh-wx__day" title="' + L.k[kk] + '"><span class="jh-wx__dn">' + L.d[x.wd] + '</span>' +
            '<span class="jh-wx__di">' + icon(kk, false) + '</span><span class="jh-wx__mm">' + deg(x.hi) + '<i>' + deg(x.lo) + '</i></span></div>';
        }).join('') + '</div>' +
        '<a class="jh-wx__src" href="https://www.met.no/en" target="_blank" rel="noopener" title="' + (en ? 'Forecast data' : 'Podaci o prognozi') + ': MET Norway (CC BY 4.0)">' +
        '<span class="jh-wx__src-l">' + L.src + '</span><span class="jh-wx__src-s">' + L.srcS + '</span></a>';
      shown = true; place(topPx);
    }

    // tačno ispod menija: na telefonu je slika ispod providnog headera, pa widget mora ispod dugmadi headera.
    // Položaj se mjeri unaprijed (dok sve miruje), da dolazak podataka usred animacije ne traži novo mjerenje.
    var topPx = measure();
    function measure() {
      var hdr = document.querySelector('.jf-header') || hero.querySelector('.jh-header');
      if (!hdr && document.querySelector('script[src*="header-snippet"]') && performance.now() < 8000) return null;   // naš header još stiže sa CDN-a
      var y = window.scrollY || 0, top = 0;
      if (hdr && hdr.offsetHeight) {
        var hcs = getComputedStyle(hdr), hb = hdr.getBoundingClientRect().bottom + (hcs.position === 'fixed' ? 0 : y);
        if (hcs.transform && hcs.transform !== 'none' && window.DOMMatrix) hb -= new DOMMatrix(hcs.transform).m42;   // header koji upravo "ulazi" animacijom
        top = Math.round(hb - (frame.getBoundingClientRect().top + y) + 12);
      }
      return Math.max(top, window.matchMedia('(max-width:760px)').matches ? 12 : 22);
    }
    function place(px) {
      if (!shown) return;
      if (px == null) px = measure();
      if (px == null) { if (tries++ < 50) setTimeout(function () { place(); }, 150); return; }
      box.style.top = px + 'px';
      if (!box.classList.contains('is-on')) {
        box.style.setProperty('--wx-d', Math.max(0, 1.7 - (performance.now() - t0) / 1000).toFixed(2) + 's');   // ulazi zajedno sa trakom dugmadi
        box.classList.add('is-on');
      }
    }
    window.addEventListener('load', function () { place(); });
    var rw, lw = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth === lw) return; lw = window.innerWidth; clearTimeout(rw); rw = setTimeout(function () { place(); }, 220); });

    var KEY = 'jhWx1', MAX = 30 * 60 * 1000, c = null;
    try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (c && c.d && Date.now() - c.t < MAX) { render(c.d); return; }
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
    fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + LAT + '&lon=' + LON + '&altitude=' + ALT, ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var d = parse(j); if (!d) return;
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
        render(d);
      })
      .catch(function () { box.remove(); });
  })();

  // ===== Reflektori: pale se uz stazu, tiho dišu, povremeno bljesne filmski zrak =====
  (function floodlights() {
    var photo = hero.querySelector('.jh-photo'), cv = photo.querySelector('.jh-lights'), ctx = cv.getContext('2d');
    // [x, y] u udjelu fotografije (2000×1334), veličina svjetla 0–1, 1 = toplo svjetlo — pronađeno analizom fotografije
    var LIGHTS = [[0.9567,0.8873,0.55,1],[0.2898,0.6649,0.54,0],[0.0752,0.3858,0.22,0],[0.9388,0.8963,0.43,1],[0.8324,0.7261,1,0],[0.8899,0.9188,0.62,1],[0.2229,0.5661,0.12,0],[0.3608,0.8373,0.28,0],[0.8177,0.2039,0.38,1],[0.7823,0.3904,0.17,0],[0.8516,0.4789,0.38,0],[0.8834,0.8795,0.57,1],[0.6613,0.926,0.15,0],[0.3973,0.4085,0.41,0],[0.721,0.7011,0.17,1],[0.4063,0.7691,0.47,0],[0.3835,0.8242,0.2,0],[0.3997,0.8116,0.82,0],[0.3125,0.576,0.09,0],[0.7286,0.339,0.23,0],[0.1369,0.5104,0.11,1],[0.2109,0.7366,0.16,0],[0.4511,0.5993,0.42,0],[0.6991,0.6965,0.3,1],[0.7885,0.2044,0.12,0],[0.2196,0.795,0.95,0],[0.5336,0.5553,0.51,0],[0.9975,0.6177,0.4,0],[0.6798,0.9492,0.17,1],[0.4129,0.3991,0.19,0],[0.2077,0.9387,0.56,1],[0.6448,0.9046,0.15,1],[0.5782,0.5135,0.4,0],[0.4107,0.5122,0.84,0],[0.7485,0.3537,0.27,0],[0.372,0.8599,0.16,1],[0.6816,0.3728,0.33,0],[0.6608,0.8965,0.08,1],[0.5086,0.6036,0.47,0],[0.9314,0.4547,0.04,0],[0.4011,0.3848,0.15,0],[0.2002,0.797,0.71,1],[0.4337,0.4426,0.1,0],[0.4458,0.7357,0.29,0],[0.7998,0.2318,0.38,0],[0.6749,0.73,0.09,1],[0.6431,0.449,0.4,0],[0.4812,0.6772,0.55,0],[0.667,0.3907,0.19,0],[0.2411,0.6867,0.05,1],[0.7217,0.4975,0.41,0],[0.2301,0.7709,0.43,1],[0.6138,0.4791,0.46,0],[0.4167,0.5428,0.15,0],[0.6988,0.3607,0.23,0],[0.7185,0.744,0.05,1],[0.4283,0.5694,0.15,0],[0.5411,0.9323,0.43,0],[0.6559,0.5207,0.88,0],[0.9958,0.6533,0.05,0],[0.3136,0.851,0.06,1],[0.8185,0.721,0.11,0],[0.6637,0.4174,0.28,0],[0.0802,0.4375,0.03,1],[0.4879,0.8625,0.42,0],[0.2378,0.3828,0.03,1],[0.2692,0.6904,0.05,1],[0.4539,0.9119,1,0],[0.7523,0.731,0.05,0],[0.5855,0.8197,0.18,0]];
    // zvijezde: samo na tamnom nebu iznad horizonta (pronađeno analizom fotografije) — [x, y, sjaj 0–1]
    var STARS = [[0.4524,0.2056,0.13],[0.4466,0.0322,0.26],[0.1575,0.0016,0.01],[0.0832,0.0707,0.0],[0.0005,0.0546,0.94],[0.6749,0.1036,0.07],[0.4649,0.1703,0.13],[0.3838,0.1284,0.65],[0.2107,0.1281,0.0],[0.2132,0.0724,0.03],[0.1357,0.1245,0.01],[0.2495,0.0477,0.01],[0.2934,0.0429,0.01],[0.0692,0.1357,0.02],[0.5722,0.0291,0.94],[0.5984,0.0136,0.0],[0.0753,0.1988,0.4],[0.3416,0.0161,0.63],[0.625,0.1229,0.0],[0.1156,0.072,0.82],[0.581,0.1488,0.42],[0.7538,0.1059,0.01],[0.6659,0.0507,0.76],[0.1362,0.1748,0.36],[0.8219,0.0237,0.57],[0.0415,0.2827,0.5],[0.984,0.0244,0.26],[0.1993,0.1648,0.11],[0.0362,0.0606,0.85],[0.9062,0.0167,0.0],[0.0067,0.2008,0.55],[0.7177,0.0559,0.93],[0.5047,0.0053,0.02],[0.1644,0.1833,0.3],[0.9684,0.1882,0.15],[0.0049,0.1206,0.77],[0.5387,0.1367,0.02],[0.493,0.1048,0.78],[0.3221,0.1113,0.39],[0.8906,0.0494,0.0],[0.1325,0.017,0.83],[0.7899,0.0275,0.0],[0.5699,0.1123,0.35],[0.6857,0.0475,0.0],[0.4813,0.0477,0.0],[0.3268,0.161,0.22],[0.634,0.006,0.05],[0.4053,0.0496,0.0],[0.7226,0.0126,0.0],[0.5147,0.1754,0.06],[0.0228,0.2337,0.06],[0.0996,0.1505,0.3],[0.3986,0.0936,0.02],[0.0528,0.0947,0.38],[0.4295,0.1659,0.14],[0.7064,0.008,0.64],[0.4556,0.0738,0.47],[0.8466,0.0787,0.34],[0.8788,0.0057,0.08],[0.2792,0.1911,0.01],[0.3633,0.1287,0.18],[0.2815,0.0026,0.18],[0.0817,0.2981,0.25],[0.9156,0.0677,0.32],[0.0364,0.0225,0.01],[0.2466,0.1402,0.46],[0.5161,0.2448,0.15],[0.6671,0.0117,0.3],[0.376,0.1957,0.06],[0.6217,0.0291,0.01],[0.4068,0.0131,0.13],[0.2055,0.0341,0.78],[0.5483,0.1101,0.36],[0.9984,0.2817,0.0],[0.6971,0.1004,0.1],[0.2386,0.2104,0.77],[0.5479,0.0139,0.96],[0.7633,0.0374,0.15],[0.2391,0.0911,0.0],[0.9665,0.2598,0.52],[0.3062,0.1554,0.0],[0.9954,0.0519,0.68],[0.2739,0.1397,0.88],[0.3725,0.2579,0.01],[0.5849,0.0002,0.0],[0.18,0.0353,0.08],[0.4871,0.196,0.02],[0.1026,0.1178,0.61],[0.2981,0.2623,0.33],[0.0723,0.0049,0.03],[0.3844,0.1055,0.35],[0.2346,0.0,0.01],[0.3331,0.2723,0.07],[0.5137,0.0275,0.0],[0.8556,0.0415,0.66],[0.981,0.1259,0.51],[0.0071,0.311,0.04],[0.1758,0.0034,0.0],[0.5942,0.0748,0.0],[0.4307,0.0008,0.03],[0.3247,0.1944,0.24],[0.1518,0.1158,0.04],[0.2785,0.2274,0.0],[0.008,0.0122,0.66],[0.9497,0.0028,0.05],[0.6572,0.1392,0.98],[0.5981,0.1171,0.2],[0.3734,0.0174,0.06],[0.118,0.0966,0.0],[0.4724,0.0042,0.31],[0.3497,0.2214,0.19],[0.1993,0.1934,0.45],[0.1953,0.1165,0.86],[0.5267,0.1109,0.35],[0.1395,0.0488,0.83],[0.3162,0.041,0.76],[0.7702,0.0739,0.04],[1.0,0.1391,0.98],[0.0138,0.176,0.76],[0.0676,0.0379,0.03],[0.4538,0.1186,0.83],[0.2618,0.018,0.78],[0.1437,0.2154,0.2],[0.2287,0.2535,0.14],[0.5807,0.0897,0.0],[0.5551,0.247,0.02],[0.9532,0.0995,0.12],[0.2736,0.1126,0.05],[0.0576,0.2169,0.04],[0.8723,0.0606,0.37],[0.3623,0.0751,0.99],[0.0392,0.156,0.79],[0.3213,0.0728,0.26],[0.0067,0.2696,0.68],[0.5681,0.1803,0.0],[0.2897,0.083,0.51],[0.3418,0.0699,0.07],[0.4209,0.0957,0.41],[0.5454,0.0494,0.27],[0.6427,0.0697,0.51]];
    // svjetla su meka, pa je dovoljna niža rezolucija platna: telefon 1×, računar do 1.5× (4× manje posla)
    var mobile = window.matchMedia('(max-width:760px)').matches;
    var IW = 2000, IH = 1334, dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5), W = 0, H = 0, pts = [], k = 1;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function sprite(r, g, b) {
      var c = document.createElement('canvas'), x = c.getContext('2d'); c.width = c.height = 128;
      var gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.07, 'rgba(' + r + ',' + g + ',' + b + ',.9)');
      gr.addColorStop(0.28, 'rgba(' + r + ',' + g + ',' + b + ',.26)');
      gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return c;
    }
    var COLD = sprite(185, 226, 255), WARM = sprite(255, 176, 88);
    var STAR = (function () {   // sitna zvijezda: oštro bijelo jezgro i jedva vidljiv plavičast oreol
      var c = document.createElement('canvas'), x = c.getContext('2d'); c.width = c.height = 32;
      var g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.16, 'rgba(235,245,255,.9)');
      g.addColorStop(0.4, 'rgba(170,205,255,.18)'); g.addColorStop(1, 'rgba(170,205,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
    })();
    var stars = [];
    // oštar horizontalni zrak (anamorfni flare): svijetlo jezgro u sredini, vrhovi se gube
    var STREAK = (function () {
      var c = document.createElement('canvas'), x = c.getContext('2d'); c.width = 512; c.height = 32;
      var h = x.createLinearGradient(0, 0, 512, 0);
      h.addColorStop(0, 'rgba(120,200,255,0)'); h.addColorStop(0.3, 'rgba(120,200,255,.35)');
      h.addColorStop(0.47, 'rgba(210,240,255,.95)'); h.addColorStop(0.5, 'rgba(255,255,255,1)');
      h.addColorStop(0.53, 'rgba(210,240,255,.95)'); h.addColorStop(0.7, 'rgba(120,200,255,.35)'); h.addColorStop(1, 'rgba(120,200,255,0)');
      x.fillStyle = h; x.fillRect(0, 0, 512, 32);
      x.globalCompositeOperation = 'destination-in';                // suzi prema gore i dolje
      var v = x.createLinearGradient(0, 0, 0, 32);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = v; x.fillRect(0, 0, 512, 32);
      return c;
    })();

    function layout() {
      W = photo.clientWidth; H = photo.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pos = getComputedStyle(photo).backgroundPosition.split(' ');
      var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || '50%') / 100;
      k = Math.max(W / IW, H / IH);
      var ox = (W - IW * k) * px, oy = (H - IH * k) * py, old = pts, oldS = stars;
      stars = STARS.map(function (s, i) {
        var o = oldS[i] || {};
        return { x: ox + s[0] * IW * k, y: oy + s[1] * IH * k, b: s[2],
          ph: o.ph || rnd(0, 6.28), f: o.f || rnd(0.12, 0.35), on: o.on || 2.4 + rnd(0, 1.6) };
      });
      pts = LIGHTS.map(function (l, i) {
        var o = old[i] || {};
        return {
          x: ox + l[0] * IW * k, y: oy + l[1] * IH * k, s: l[2], warm: l[3],
          ph: o.ph || rnd(0, 6.28), f1: o.f1 || rnd(0.25, 0.6), f2: o.f2 || rnd(0.7, 1.4),
          on: 0.5 + (1 - l[1]) * 1.9 + rnd(0, 0.15)          // pale se od podnožja ka vrhu staze
        };
      });
    }

    var flares = [], t0 = performance.now(), nextFlare = 4.5;
    function intensity(p, t) {
      if (reduce) return 1;
      var u = t - p.on;
      if (u < 0) return 0;
      if (u < 0.32) return [0.55, 0.1, 0.9, 0.35, 1][Math.floor(u / 0.065)] || 1;   // treptaj pri paljenju
      return 0.84 + 0.09 * Math.sin(t * p.f1 * 6.28 + p.ph) + 0.07 * Math.sin(t * p.f2 * 14.4 + p.ph * 2);
    }
    function draw(now) {
      var t = (now - t0) / 1000, sc = Math.sqrt(k);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      // zvijezde se pojave jedna po jedna kad se upale reflektori, pa tiho trepere
      for (var j = 0; j < stars.length; j++) {
        var z = stars[j], fade = reduce ? 1 : Math.min(1, Math.max(0, (t - z.on) / 1.4));
        if (!fade) continue;
        var tw = reduce ? 0.85 : 0.62 + 0.38 * Math.sin(t * z.f * 6.28 + z.ph) * Math.sin(t * z.f * 2.1 + z.ph * 1.7);
        var sr = (2.6 + z.b * 5) * Math.max(0.8, Math.sqrt(k));
        ctx.globalAlpha = Math.min(1, fade * tw * (0.6 + 0.6 * z.b) * 1.1);
        ctx.drawImage(STAR, z.x - sr, z.y - sr, sr * 2, sr * 2);
      }
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], a = intensity(p, t); if (!a) continue;
        var r = (12 + p.s * 26) * sc * 1.35;
        ctx.globalAlpha = a * (p.warm ? 0.5 : 0.62);
        ctx.drawImage(p.warm ? WARM : COLD, p.x - r, p.y - r, r * 2, r * 2);
      }
      // filmski zrak svjetla na nekom od velikih reflektora
      if (!reduce && t > nextFlare) {
        var big = pts.filter(function (p) { return !p.warm && p.s > 0.25; });
        if (big.length) flares.push({ p: big[Math.floor(Math.random() * big.length)], t: t, d: 2.6 });
        nextFlare = t + rnd(3.5, 6);
      }
      flares = flares.filter(function (f) { return t - f.t < f.d; });
      flares.forEach(function (f) {
        var u = (t - f.t) / f.d, e = Math.sin(Math.PI * u), R = (14 + f.p.s * 26) * sc;
        var len = R * (9 + 5 * e);
        ctx.globalAlpha = e * 0.35; ctx.drawImage(COLD, f.p.x - len * 0.55, f.p.y - R * 0.5, len * 1.1, R);          // meki sjaj oko zraka
        ctx.globalAlpha = e * 0.95; ctx.drawImage(STREAK, f.p.x - len, f.p.y - R * 0.1, len * 2, R * 0.2);          // oštar horizontalni zrak
        ctx.save(); ctx.translate(f.p.x, f.p.y); ctx.rotate(Math.PI / 2);
        ctx.globalAlpha = e * 0.45; ctx.drawImage(STREAK, -R * 2.6, -R * 0.07, R * 5.2, R * 0.14);                 // kratki vertikalni zrak
        ctx.restore();
        ctx.globalAlpha = e * 0.7;  ctx.drawImage(COLD, f.p.x - R * 1.8, f.p.y - R * 1.8, R * 3.6, R * 3.6);          // jače jezgro
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    layout();
    if (reduce) { draw(performance.now()); return; }
    var visible = true, last = 0, scrolled = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    // telefon: dok prst skroluje, svjetla miruju (sav rad ide na glatko pomjeranje stranice)
    if (mobile) window.addEventListener('scroll', function () { scrolled = performance.now(); }, { passive: true });
    (function loop(now) {
      if (visible && !document.hidden && now - last > (mobile ? 55 : 32) && now - scrolled > 160) { last = now; draw(now); }   // ~30 fps (telefon ~18) je dovoljno za meko svjetlo
      requestAnimationFrame(loop);
    })(performance.now());
    var rz, lw = photo.clientWidth, lh = photo.clientHeight;
    window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(function () {
        if (photo.clientWidth === lw && photo.clientHeight === lh) return;   // traka adrese na telefonu: slika ista, platno se ne pravi ponovo
        lw = photo.clientWidth; lh = photo.clientHeight; layout();
      }, 150);
    });
  })();

  // ===== Ulazak teksta: kicker se "otkuca", naslov se kristališe, "Jahorine" se iscrta ledom =====
  (function intro() {
    var title = hero.querySelector('.jh-title');
    var ice = hero.querySelector('.jh-ice');
    var rating = hero.querySelector('.jh-rating__value');
    var dotI = ice.querySelector('.jh-i'), dot = ice.querySelector('.jh-dot');
    var phone = window.matchMedia('(max-width:760px)').matches;

    // Mjeri riječ: položaj svakog slova, osnovnu liniju, profil vrhova slova i tačan položaj tačke na "i"
    var mCache = null;
    function measureIce() {
      var cs = getComputedStyle(ice), box = ice.getBoundingClientRect(), fs = parseFloat(cs.fontSize);
      var font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      // isto slovo, ista veličina → mjerenje se ne ponavlja (skupo je, a pada baš usred animacije ulaska)
      var key = box.width + '|' + font + '|' + cs.letterSpacing + '|' + (document.fonts ? document.fonts.status : '');
      if (mCache && mCache.key === key) { mCache.box = box; return mCache; }
      var probe = document.createElement('i');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      ice.insertBefore(probe, ice.firstChild);
      var baseY = probe.getBoundingClientRect().top - box.top;
      probe.remove();

      var chars = [], range = document.createRange();
      var walker = document.createTreeWalker(ice, NodeFilter.SHOW_TEXT), node;
      while ((node = walker.nextNode())) {
        for (var i = 0; i < node.length; i++) {
          if (!node.data[i].trim()) continue;
          range.setStart(node, i); range.setEnd(node, i + 1);
          var r = range.getBoundingClientRect();
          chars.push({ c: node.data[i], x: r.left - box.left, w: r.width });
        }
      }

      var cv = document.createElement('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      // tačka na "i": razlika između "i" i "ı" nacrtanih na istom mjestu
      var S = Math.ceil(fs * 1.6), ox = Math.ceil(fs * 0.3), oy = Math.ceil(fs * 1.25);
      cv.width = S; cv.height = S; g.font = font; g.textBaseline = 'alphabetic';
      g.fillText('i', ox, oy); var A = g.getImageData(0, 0, S, S).data;
      g.clearRect(0, 0, S, S); g.fillText('\u0131', ox, oy); var B = g.getImageData(0, 0, S, S).data;
      var x0 = S, x1 = -1, y0 = S, y1 = -1;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
        var k = (y * S + x) * 4 + 3;
        if (A[k] > 110 && B[k] < 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      var dw, dh, dx, dy;
      if (x1 < 0) { dw = dh = fs * 0.2; dx = fs * 0.03; dy = -fs * 0.93; }      // rezervna procjena
      else { dw = x1 - x0 + 1; dh = y1 - y0 + 1; dx = x0 - ox; dy = y0 - oy; }
      var iC = chars.filter(function (c) { return c.c === '\u0131'; })[0] || chars[5];
      var dot = { x: iC.x + dx - 1, y: baseY + dy - 1, w: dw + 2, h: dh + 2 };
      dot.cx = dot.x + dot.w / 2; dot.cy = dot.y + dot.h / 2;

      // profil vrhova slova (za klizanje tačke)
      var PW = Math.ceil(box.width), PH = Math.ceil(box.height);
      cv.width = PW; cv.height = PH; g.font = font; g.textBaseline = 'alphabetic';
      chars.forEach(function (c) { g.fillText(c.c, c.x, baseY); });
      var img = g.getImageData(0, 0, PW, PH).data, profile = new Array(PW);
      for (var px = 0; px < PW; px++) {
        profile[px] = baseY;
        for (var py = 0; py < PH; py++) if (img[(py * PW + px) * 4 + 3] > 110) { profile[px] = py; break; }
      }
      g.font = font;
      var asc = g.measureText('h').actualBoundingBoxAscent || fs * 0.72;
      return (mCache = { key: key, box: box, fs: fs, font: font, baseY: baseY, chars: chars, dot: dot, profile: profile, asc: asc });
    }
    // postavi tačku tačno na mjesto (u koordinatama slova "ı", pa prati i razmak slova na hover)
    function placeDot() {
      var m = measureIce(), ib = dotI.getBoundingClientRect(), ibx = ib.left - m.box.left, iby = ib.top - m.box.top;
      dot.style.left = (m.dot.x - ibx) + 'px'; dot.style.top = (m.dot.y - iby) + 'px';
      dot.style.width = m.dot.w + 'px'; dot.style.height = m.dot.h + 'px';
      return m;
    }
    var fontsReady = new Promise(function (res) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(res);
      else res();
      setTimeout(res, 2500);
    });
    fontsReady.then(placeDot);
    // rezerva: ako tema/dodatak sakrije tačku (npr. pravilo span:empty{display:none}), prikaži obično "i"
    function fixDot() {
      var cs = getComputedStyle(dot), b = dot.getBoundingClientRect();
      if (b.width > 1 && cs.display !== 'none' && cs.visibility !== 'hidden') return;
      var tn = dotI.firstChild; if (tn && tn.nodeType === 3) tn.data = tn.data.replace('\u0131', 'i');
      dot.style.display = 'none';
    }
    setTimeout(fixDot, 9000);
    var rz, lw = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lw) return;   // veličina slova zavisi samo od širine ekrana
      lw = window.innerWidth;
      clearTimeout(rz); rz = setTimeout(function () { if (!dot.classList.contains('is-flying')) placeDot(); }, 150);
    });

    // kicker (H1): slovo po slovo, uz blago treperenje; " · " je mjesto preloma na telefonu
    var kick = hero.querySelector('.jh-kicker'), ktxt = kick.textContent.replace(/\s+/g, ' ').trim();
    kick.setAttribute('aria-label', ktxt); kick.textContent = '';
    var kwrap = document.createElement('span'); kick.appendChild(kwrap);
    var sepAt = ktxt.indexOf(' \u00b7 ');
    ktxt.split('').forEach(function (c, i) {
      var sp = document.createElement('span');
      sp.className = 'jh-type';
      if (sepAt >= 0 && i >= sepAt && i <= sepAt + 2) sp.className += i === sepAt + 1 ? ' jh-sep jh-sep--dot' : ' jh-sep';
      sp.setAttribute('aria-hidden', 'true'); sp.textContent = c;
      sp.style.animationDelay = (0.55 + i * 0.022) + 's';
      kwrap.appendChild(sp);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      title.classList.add('is-live'); ice.classList.add('is-live'); dot.classList.add('is-set'); fontsReady.then(fixDot); return;
    }
    var t0 = performance.now();
    function after(sec, fn) { setTimeout(fn, Math.max(0, sec * 1000 - (performance.now() - t0))); }


    // "Otkrij čaroliju": svako slovo se kristališe iz zamućenja
    var lines = [].slice.call(title.children).filter(function (el) { return el !== ice; });
    var n = 0, last = 0;
    lines.forEach(function (line) {
      var t = line.textContent; line.dataset.text = t; line.textContent = '';
      t.split('').forEach(function (c) {
        var ch = document.createElement('span');
        ch.className = 'jh-ch'; ch.textContent = c;
        last = 0.7 + n++ * 0.038; ch.style.animationDelay = last + 's';
        line.appendChild(ch);
      });
    });
    after(last + 0.8, function () {
      lines.forEach(function (line) { line.textContent = line.dataset.text; });
      title.classList.add('is-live');
    });

    // ocjena broji od 0.0 do 4.8
    if (rating) {
    var target = parseFloat(rating.textContent) || 0;
    rating.textContent = '0.0';
    after(1.5, function () {
      var s0 = performance.now();
      (function tick() {
        var p = Math.min(1, (performance.now() - s0) / 1000), e = 1 - Math.pow(1 - p, 3);
        rating.textContent = (target * e).toFixed(1);
        if (p < 1) requestAnimationFrame(tick);
      })();
    });
    }

    // "Jahorine": svjetlosna olovka iscrta obris, tačka na "i" skače kao skijaš, slova se zalede
    ice.classList.add('is-drawing');
    dot.classList.add('is-waiting');

    function drawIce() {
      var m = measureIce(), box = m.box, fs = m.fs, baseY = m.baseY, W = box.width;
      var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'jh-ice__svg'); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', W); svg.setAttribute('height', box.height);
      svg.innerHTML =
        '<defs><linearGradient id="jhFrostGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="0">' +
        '<stop offset="0" stop-color="#BFF1FF" stop-opacity="0"/>' +
        '<stop offset=".42" stop-color="#BFF1FF" stop-opacity="0"/>' +
        '<stop offset=".48" stop-color="#E8FBFF" stop-opacity=".95"/>' +
        '<stop offset=".52" stop-color="#6FDBFF" stop-opacity=".55"/>' +
        '<stop offset=".6" stop-color="#BFF1FF" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#BFF1FF" stop-opacity="0"/>' +
        '<animateTransform attributeName="gradientTransform" type="translate" from="' + (-W) + ' 0" to="' + W + ' 0" dur="1.3s" begin="indefinite" fill="freeze" calcMode="spline" keySplines=".3 .6 .2 1" keyTimes="0;1"/>' +
        '</linearGradient></defs>';

      var len = Math.round(fs * 6), head = Math.round(fs * 0.12), step = 0.085, dur = 0.95;
      m.chars.forEach(function (g, k) {
        ['jh-trail', 'jh-pen'].forEach(function (cls) {
          var t = document.createElementNS(NS, 'text');
          t.textContent = g.c; t.setAttribute('class', cls);
          t.setAttribute('x', g.x); t.setAttribute('y', baseY);
          t.style.font = m.font;
          t.style.strokeDasharray = cls === 'jh-pen' ? head + ' ' + (len * 2) : len + ' ' + len;
          t.style.setProperty('--len', len + 'px');
          t.style.setProperty('--h', head + 'px');
          t.style.setProperty('--delay', (k * step) + 's');
          t.style.setProperty('--dur', dur + 's');
          svg.appendChild(t);
        });
      });
      ice.appendChild(svg);

      function fx(cls, css, life) {
        var el = document.createElement('span');
        el.className = cls; el.style.cssText = css; ice.appendChild(el);
        setTimeout(el.remove.bind(el), life);
      }

      // tačka kreće kad je "h" nacrtano, a doskoči tačno na početak zamrzavanja
      skiJump(m, 900, function land(cx, cy) {
        fx('jh-ring', 'left:' + cx + 'px;top:' + cy + 'px;--s:' + (m.dot.h * 1.6) + 'px', 900);
        freeze();
      });

      function freeze() {
        [].forEach.call(svg.querySelectorAll('.jh-pen'), function (t) { t.remove(); });
        [].forEach.call(svg.querySelectorAll('.jh-trail'), function (t) { t.style.strokeDasharray = 'none'; });
        svg.classList.add('is-frost');
        var sweep = svg.querySelector('animateTransform');
        if (sweep && sweep.beginElement) sweep.beginElement();
        ice.classList.add('is-breath');
        fx('jh-flare', 'top:' + (baseY - fs * 0.36) + 'px', 1400);
        m.chars.forEach(function (g, k) {
          if (k % 2 && Math.random() < 0.5) return;
          var gx = g.x + g.w * (0.25 + Math.random() * 0.5), gy = baseY - fs * (0.55 + Math.random() * 0.2);
          fx('jh-glint', 'left:' + gx + 'px;top:' + gy + 'px;--s:' + (10 + Math.random() * 12) + 'px;--d:' + (0.08 + k * 0.07) + 's', 1800);
        });
        for (var j = 0; j < 9; j++) {
          var size = 5 + Math.random() * 7, sx = Math.random() * W, sy = baseY - Math.random() * fs * 0.6;
          fx('jh-spark', 'left:' + (sx - size / 2) + 'px;top:' + (sy - size / 2) + 'px;--s:' + size + 'px;' +
            '--dx:' + ((Math.random() - 0.5) * fs * 0.5) + 'px;--dy:' + (-fs * (0.5 + Math.random() * 0.7)) + 'px;' +
            '--r:' + ((Math.random() - 0.5) * 180) + 'deg;--t:' + (1.6 + Math.random() * 0.9) + 's;--d:' + (0.1 + Math.random() * 0.5) + 's', 3200);
        }
        setTimeout(function () {
          svg.remove();
          ice.classList.remove('is-drawing', 'is-breath');
          ice.classList.add('is-live');
        }, 1550);
      }
    }

    // ---- skok tačke: uleti slijeva, klizi preko "h" i "o", odskoči, preleti "r" i doskoči na "ı" ----
    function skiJump(m, startDelay, onLand) {
      var fs = m.fs, R = m.dot.h / 2, fx0 = m.dot.cx, fy0 = m.dot.cy;
      var hC = m.chars[2], oC = m.chars[3], aC = m.chars[1];
      // profil vrhova slova: najviša tačka "mastila" po svakom pikselu širine
      var top = m.profile, Wp = top.length, Rr = Math.max(R * 2.2, fs * 0.12);
      function surf(x) { // centar tačke koja klizi po slovima (kotrljajuća kugla, zaglađuje procjepe)
        var best = Infinity;
        for (var dx = -Rr; dx <= Rr; dx++) {
          var xi = Math.round(x + dx); if (xi < 0 || xi >= Wp) continue;
          var c = top[xi] - Math.sqrt(Rr * Rr - dx * dx); if (c < best) best = c;
        }
        return best + (Rr - R);
      }
      var xs = hC.x + R * 1.2, xe = oC.x + oC.w * 0.72;   // odraz sa zaobljenja "o", let preko "r"
      var P0 = { x: aC.x - fs * 0.15, y: m.baseY - m.asc - fs * 0.62 };
      var P1 = { x: hC.x - fs * 0.02, y: m.baseY - m.asc - fs * 0.62 };
      var P2 = { x: xs, y: surf(xs) };
      var L = { x: xe, y: surf(xe) }, D = { x: fx0, y: fy0 };
      var C = { x: (L.x + D.x) / 2, y: D.y - fs * 0.5 };
      var T1 = 260, T2 = 480, T3 = 620, T4 = 380, TOTAL = T1 + T2 + T3;
      function qb(a, b, c, t) { var u = 1 - t; return { x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, y: u * u * a.y + 2 * u * t * b.y + t * t * c.y }; }

      // svjetleći trag iza tačke
      var NS = 'http://www.w3.org/2000/svg', tsvg = document.createElementNS(NS, 'svg'), segs = [], hist = [];
      tsvg.setAttribute('class', 'jh-trailsvg'); tsvg.setAttribute('width', m.box.width); tsvg.setAttribute('height', m.box.height);
      for (var i = 0; i < 22; i++) {
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('stroke-linecap', 'round');
        ln.setAttribute('stroke', i > 16 ? '#E8FBFF' : '#39CFFF');
        if (!phone) ln.style.filter = 'drop-shadow(0 0 4px rgba(0,185,242,.9))';   // telefon: bez sjaja na 22 dijela traga (skupo u svakom kadru)
        tsvg.appendChild(ln); segs.push(ln);
      }
      ice.appendChild(tsvg);

      function drawTrail() {
        for (var i = 0; i < segs.length; i++) {
          var a = hist[hist.length - 1 - (segs.length - i)], b = hist[hist.length - (segs.length - i)];
          if (!a || !b) { segs[i].setAttribute('stroke-opacity', 0); continue; }
          var k = i / segs.length;
          segs[i].setAttribute('x1', a.x); segs[i].setAttribute('y1', a.y);
          segs[i].setAttribute('x2', b.x); segs[i].setAttribute('y2', b.y);
          segs[i].setAttribute('stroke-width', (0.5 + k * R * 1.1).toFixed(2));
          segs[i].setAttribute('stroke-opacity', (k * k * 0.9).toFixed(3));
        }
      }
      function place(p, rot, sx, sy) {
        dot.style.transform = 'translate(' + (p.x - fx0) + 'px,' + (p.y - fy0) + 'px) rotate(' + rot + 'deg) scale(' + sx + ',' + sy + ')';
      }

      setTimeout(function () {
        dot.classList.remove('is-waiting'); dot.classList.add('is-flying');
        var s0 = performance.now(), prev = P0;
        (function frame() {
          var t = performance.now() - s0, p, rot = 0, sx = 1, sy = 1;
          if (t < T1) {                                   // 1) uleti odozgo slijeva i spusti se na "h"
            var u = t / T1; p = qb(P0, P1, P2, u * u);
            sx = 1.2; sy = 0.85;
            rot = Math.atan2(p.y - prev.y, p.x - prev.x) * 57.3;
          } else if (t < T1 + T2) {                       // 2) klizi po vrhovima slova, sve brže
            var v = (t - T1) / T2, e = v * v * (1.6 - 0.6 * v);
            var x = xs + (xe - xs) * e; p = { x: x, y: surf(x) };
            var ang = Math.atan2(p.y - prev.y, Math.max(0.01, p.x - prev.x)) * 57.3;
            rot = Math.max(-40, Math.min(40, ang)); sx = 1.25; sy = 0.8;
          } else if (t < TOTAL) {                         // 3) odskok sa "r": luk kroz vazduh uz jedan okret
            var w = (t - T1 - T2) / T3; p = qb(L, C, D, w);
            rot = 360 * (1 - Math.pow(1 - w, 2.2));
            var st = 1 + 0.25 * Math.sin(w * Math.PI); sx = 1 / st; sy = st;
          } else if (t < TOTAL + T4) {                    // 4) doskok: ugib i povratak, kao skijaš
            if (!frame.landed) { frame.landed = true; dot.classList.remove('is-flying'); onLand(fx0, fy0); }
            var q = (t - TOTAL) / T4, d = Math.exp(-6 * q) * Math.cos(q * 14);
            p = D; sx = 1 + 0.35 * d; sy = 1 - 0.35 * d;
          } else {
            dot.style.transform = ''; dot.classList.add('is-set'); setTimeout(fixDot, 50);
            tsvg.style.transition = 'opacity .4s'; tsvg.style.opacity = 0;
            setTimeout(tsvg.remove.bind(tsvg), 450);
            return;
          }
          if (t < TOTAL) { hist.push(p); if (hist.length > 60) hist.shift(); }
          else if (hist.length) hist.shift();
          drawTrail(); place(p, rot, sx, sy); prev = p;
          requestAnimationFrame(frame);
        })();
      }, startDelay);
    }

    // crta tek kad se font učita (da obris tačno legne na slova), najranije u 1.1 s
    fontsReady.then(function () { after(1.1, drawIce); });
  })();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Parallax — fotografija se blago pomjera za mišem
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function tick() {
    cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
    hero.style.setProperty('--mx', cx.toFixed(3));
    hero.style.setProperty('--my', cy.toFixed(3));
    raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : null;
  }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });


})();
})();
