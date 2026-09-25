/* =====================================================================
   JAHORINA HERO — DIO 3: JavaScript  (Slider Revolution → Module Settings → Custom JavaScript)
   Ne treba ništa mijenjati.
   ===================================================================== */
(function waitForHero(tries) {
  // Slider Revolution ubacuje slojeve malo kasnije — sačekaj da hero postoji, pa pokreni (samo jednom)
  if (!document.querySelector('.jh-hero')) {
    if ((tries || 0) < 200) setTimeout(function () { waitForHero((tries || 0) + 1); }, 50);
    return;
  }
  if (window.__jahorinaHeroStarted) return;
  window.__jahorinaHeroStarted = true;

(function () {
  var hero = document.querySelector('.jh-hero');
  if (!hero) return;

  // "O nama" dropdown — otvara se na klik, zatvara klikom van ili Esc
  var dd = hero.querySelector('.jh-dropdown');
  var ddBtn = dd.querySelector('button');
  function setDropdown(open) {
    dd.classList.toggle('is-open', open);
    ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  ddBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setDropdown(!dd.classList.contains('is-open'));
  });

  // Hamburger (samo na užim ekranima)
  var header = hero.querySelector('.jh-header');
  var burger = hero.querySelector('.jh-burger');
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

  // ===== Reflektori: pale se uz stazu, tiho dišu, povremeno bljesne filmski zrak =====
  (function floodlights() {
    var photo = hero.querySelector('.jh-photo'), cv = photo.querySelector('.jh-lights'), ctx = cv.getContext('2d');
    // [x, y] u udjelu fotografije (2000×1334), veličina svjetla 0–1, 1 = toplo svjetlo — pronađeno analizom fotografije
    var LIGHTS = [[0.9567,0.8873,0.55,1],[0.2898,0.6649,0.54,0],[0.0752,0.3858,0.22,0],[0.9388,0.8963,0.43,1],[0.8324,0.7261,1,0],[0.8899,0.9188,0.62,1],[0.2229,0.5661,0.12,0],[0.3608,0.8373,0.28,0],[0.8177,0.2039,0.38,1],[0.7823,0.3904,0.17,0],[0.8516,0.4789,0.38,0],[0.8834,0.8795,0.57,1],[0.6613,0.926,0.15,0],[0.3973,0.4085,0.41,0],[0.721,0.7011,0.17,1],[0.4063,0.7691,0.47,0],[0.3835,0.8242,0.2,0],[0.3997,0.8116,0.82,0],[0.3125,0.576,0.09,0],[0.7286,0.339,0.23,0],[0.1369,0.5104,0.11,1],[0.2109,0.7366,0.16,0],[0.4511,0.5993,0.42,0],[0.6991,0.6965,0.3,1],[0.7885,0.2044,0.12,0],[0.2196,0.795,0.95,0],[0.5336,0.5553,0.51,0],[0.9975,0.6177,0.4,0],[0.6798,0.9492,0.17,1],[0.4129,0.3991,0.19,0],[0.2077,0.9387,0.56,1],[0.6448,0.9046,0.15,1],[0.5782,0.5135,0.4,0],[0.4107,0.5122,0.84,0],[0.7485,0.3537,0.27,0],[0.372,0.8599,0.16,1],[0.6816,0.3728,0.33,0],[0.6608,0.8965,0.08,1],[0.5086,0.6036,0.47,0],[0.9314,0.4547,0.04,0],[0.4011,0.3848,0.15,0],[0.2002,0.797,0.71,1],[0.4337,0.4426,0.1,0],[0.4458,0.7357,0.29,0],[0.7998,0.2318,0.38,0],[0.6749,0.73,0.09,1],[0.6431,0.449,0.4,0],[0.4812,0.6772,0.55,0],[0.667,0.3907,0.19,0],[0.2411,0.6867,0.05,1],[0.7217,0.4975,0.41,0],[0.2301,0.7709,0.43,1],[0.6138,0.4791,0.46,0],[0.4167,0.5428,0.15,0],[0.6988,0.3607,0.23,0],[0.7185,0.744,0.05,1],[0.4283,0.5694,0.15,0],[0.5411,0.9323,0.43,0],[0.6559,0.5207,0.88,0],[0.9958,0.6533,0.05,0],[0.3136,0.851,0.06,1],[0.8185,0.721,0.11,0],[0.6637,0.4174,0.28,0],[0.0802,0.4375,0.03,1],[0.4879,0.8625,0.42,0],[0.2378,0.3828,0.03,1],[0.2692,0.6904,0.05,1],[0.4539,0.9119,1,0],[0.7523,0.731,0.05,0],[0.5855,0.8197,0.18,0]];
    var IW = 2000, IH = 1334, dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, pts = [], k = 1;
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
      var ox = (W - IW * k) * px, oy = (H - IH * k) * py, old = pts;
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
    var visible = true, last = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    (function loop(now) {
      if (visible && !document.hidden && now - last > 32) { last = now; draw(now); }   // ~30 fps je dovoljno za svjetlo
      requestAnimationFrame(loop);
    })(performance.now());
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 150); });
  })();

  // ===== Ulazak teksta: kicker se "otkuca", naslov se kristališe, "Jahorine" se iscrta ledom =====
  (function intro() {
    var title = hero.querySelector('.jh-title');
    var ice = hero.querySelector('.jh-ice');
    var rating = hero.querySelector('.jh-rating__value');
    var dotI = ice.querySelector('.jh-i'), dot = ice.querySelector('.jh-dot');

    // Mjeri riječ: položaj svakog slova, osnovnu liniju, profil vrhova slova i tačan položaj tačke na "i"
    function measureIce() {
      var cs = getComputedStyle(ice), box = ice.getBoundingClientRect(), fs = parseFloat(cs.fontSize);
      var font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
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
      return { box: box, fs: fs, font: font, baseY: baseY, chars: chars, dot: dot, profile: profile, asc: asc };
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
    var rz; window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(function () { if (!dot.classList.contains('is-flying')) placeDot(); }, 150);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      title.classList.add('is-live'); ice.classList.add('is-live'); dot.classList.add('is-set'); return;
    }
    var t0 = performance.now();
    function after(sec, fn) { setTimeout(fn, Math.max(0, sec * 1000 - (performance.now() - t0))); }

    // kicker: slovo po slovo, uz blago treperenje
    var kick = hero.querySelector('.jh-kicker'), ktxt = kick.textContent;
    kick.setAttribute('aria-label', ktxt); kick.textContent = '';
    var kwrap = document.createElement('span'); kick.appendChild(kwrap);
    ktxt.split('').forEach(function (c, i) {
      var sp = document.createElement('span');
      sp.className = 'jh-type'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = c;
      sp.style.animationDelay = (0.55 + i * 0.022) + 's';
      kwrap.appendChild(sp);
    });

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
        ln.style.filter = 'drop-shadow(0 0 4px rgba(0,185,242,.9))';
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
            dot.style.transform = ''; dot.classList.add('is-set');
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
