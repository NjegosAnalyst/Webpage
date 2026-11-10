// Simulacija sajta za red iz elementor-html-widget.html (sajt se iz cloud okruženja ne može otvoriti).
// Stranica liči na Betheme + Elementor (uži kontejner, stilovi teme, footer); CDN-ovi se služe iz lokalnih fajlova.
// Slučajevi: obično, EN, telefon, Elementor editor (jQuery ubacivanje), jsDelivr pao (githack), podaci/slike sa jsDelivr-a
// padnu (raw.githubusercontent). Pokretanje: NODE_PATH=$(npm root -g) node test-widget.js [screenshotovi] [fontovi]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const LINE0 = fs.readFileSync(path.join(__dirname, 'elementor-html-widget.html'), 'utf8').trim();
let LINE = LINE0;
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.js': 'application/javascript', '.json': 'application/json', '.webp': 'image/webp' };

const theme = `
  body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff}
  #Header{height:90px;background:#0A1120}
  .section_wrapper{max-width:1220px;margin:0 auto;padding:40px 20px}
  h2{font-size:30px;line-height:40px;font-weight:400;color:#161922!important;margin-bottom:15px}
  h3{font-size:25px;color:#161922!important}
  p{margin:0 0 15px}
  ul li{list-style:disc;margin-left:20px}
  button{background:#0089F7;color:#fff;border-radius:5px;padding:10px 20px;border:0}
  a{color:#0089F7}
  img{max-width:100%;height:auto}
  #Footer{background:#0c1424;color:#fff;height:240px}
  .elementor-widget-container{padding:10px}`;

function page(lang, editor) {
  const widget = editor ? '<div class="elementor-widget-container" id="w"></div>' : `<div class="elementor-widget-container">${LINE}</div>`;
  const inject = editor ? `<script src="https://code.jquery.test/jquery.js"></script><script>setTimeout(function(){ $('#w').html(${JSON.stringify(LINE).replace(/<\//g, '<\\/')}); }, 300);</script>` : '';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${theme}</style></head>
<body><div id="Header"></div><div id="Content"><div class="section_wrapper">
<div class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-html">${widget}</div></div></div></div>
</div></div><footer id="Footer">footer</footer>${inject}</body></html>`;
}

// mali jQuery: .html() izvrši <script> kao pravi jQuery (Elementor editor)
const JQ = `window.$=function(s){var el=document.querySelector(s);return{html:function(h){el.innerHTML=h;[].forEach.call(el.querySelectorAll('script'),function(o){var n=document.createElement('script');n.text=o.text;o.parentNode.replaceChild(n,o);});}}};`;

async function serve(pg, opts) {
  await pg.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const send = (rel, host) => {
      const f = path.join(__dirname, rel);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nema' });
      let body = fs.readFileSync(f);
      // napad: izmijenjen mapa.json (HTML ubačen u putanju staze)
      if (rel.endsWith('mapa.json') && (opts.tamper === 'all' || (opts.tamper === 'cdn' && host === 'cdn'))) body = body.toString().replace('"d":"M', '"d":"\\"><img src=x onerror=window.__pwn=1>M');
      return route.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body });
    };
    const rel = (p) => p.replace(/^.*?\/jahorina-mapa\//, '');
    if (url.hostname === 'www.oc-jahorina.com') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: page(opts.lang, opts.editor) });
    if (url.hostname === 'code.jquery.test') return route.fulfill({ status: 200, contentType: 'application/javascript', body: JQ });
    if (url.hostname === 'cdn.jsdelivr.net') {
      if (opts.cdnDown) return route.abort();
      if (opts.cdnAssetsDown && !url.pathname.endsWith('mapa.js')) return route.fulfill({ status: 503, body: 'x' });
      return send(rel(url.pathname), 'cdn');
    }
    if (url.hostname === 'rawcdn.githack.com' || url.hostname === 'raw.githubusercontent.com') { opts.used.add(url.hostname); return send(rel(url.pathname)); }
    if (url.hostname === 'fonts.googleapis.com' && FONTS) return route.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') });
    if (url.hostname === 'fonts.gstatic.com' && FONTS) {
      const f = path.join(FONTS, url.pathname.replace(/^\//, '').replace(/\//g, '_'));
      if (fs.existsSync(f)) return route.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
    }
    return route.abort();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (c, msg) => { console.log((c ? 'OK   ' : 'GREŠKA ') + msg); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch();
  const cases = [
    { name: 'sr-racunar', lang: 'sr', url: '/mapa-staza/', vp: { width: 1440, height: 900 } },
    { name: 'en-racunar', lang: 'en', url: '/en/mapa-staza/', vp: { width: 1440, height: 900 } },
    { name: 'sr-telefon', lang: 'sr', url: '/mapa-staza/', vp: { width: 390, height: 844 }, touch: true },
    { name: 'editor', lang: 'sr', url: '/mapa-staza/', vp: { width: 1280, height: 800 }, editor: true },
    { name: 'jsdelivr-pao', lang: 'sr', url: '/mapa-staza/', vp: { width: 1440, height: 900 }, cdnDown: true, expect: 'rawcdn.githack.com' },
    { name: 'slike-sa-githuba', lang: 'sr', url: '/mapa-staza/', vp: { width: 1440, height: 900 }, cdnAssetsDown: true, expect: 'raw.githubusercontent.com' },
  ];
  for (const c of cases) {
    const ctx = await browser.newContext({ viewport: c.vp, hasTouch: !!c.touch, isMobile: !!c.touch });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));
    // namjerno pokvareni odgovori: preglednik sam prijavi neuspio SRI (očekivano, rezerva ga zamijeni)
    pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text()) && !(c.cdnAssetsDown && /integrity|SRI/.test(m.text()))) errors.push(m.text()); });
    const opts = { lang: c.lang, editor: !!c.editor, cdnDown: !!c.cdnDown, cdnAssetsDown: !!c.cdnAssetsDown, used: new Set() };
    await serve(pg, opts);
    await pg.goto('https://www.oc-jahorina.com' + c.url, { waitUntil: 'load' });
    try { await pg.waitForSelector('#jm-mapa .jm-pm', { timeout: 15000 }); } catch (e) { /* provjera ispod */ }
    await sleep(1500);
    const r = await pg.evaluate(() => {
      const root = document.getElementById('jm-mapa'); if (!root) return null;
      const img = root.querySelector('.jm-img-d'), h2 = root.querySelector('h2'), b = root.getBoundingClientRect();
      const foot = document.getElementById('Footer').getBoundingClientRect();
      return {
        runs: root.querySelectorAll('.jm-world .jm-pm').length, w: Math.round(b.width), cw: document.documentElement.clientWidth,
        left: Math.round(b.left), img: img && img.naturalWidth, h2: h2 && h2.textContent, h2c: h2 && getComputedStyle(h2).color,
        overflow: document.documentElement.scrollWidth - innerWidth, gapFoot: Math.round(foot.top - b.bottom),
        bullets: [...root.querySelectorAll('li')].filter((li) => getComputedStyle(li).listStyleType !== 'none').length,
      };
    });
    ok(r && r.runs >= 24, `${c.name}: mapa prikazana (${r && r.runs} oznaka staza)`);
    ok(r && r.w === r.cw && r.left === 0 && r.overflow <= 0, `${c.name}: puna širina ${r && r.w}/${r && r.cw}, lijevo ${r && r.left}, bez skrola`);
    ok(r && r.img > 0, `${c.name}: podloga učitana (${r && r.img}px)`);
    ok(r && /rgb\(255, 255, 255\)/.test(r.h2c), `${c.name}: naslov bijel uprkos temi (${r && r.h2c})`);
    ok(r && r.bullets === 0, `${c.name}: bez tačaka liste iz teme`);
    ok(r && Math.abs(r.gapFoot) <= 1, `${c.name}: footer odmah ispod (razmak ${r && r.gapFoot}px)`);
    if (c.lang === 'en') ok(r && /Ski runs of\s+Jahorina/.test(r.h2), `${c.name}: engleski naslov "${r && r.h2}"`);
    if (c.expect) ok(opts.used.has(c.expect), `${c.name}: rezerva ${c.expect} korištena`);
    // izbor staze radi i na sajtu
    const sel = await pg.evaluate(() => { const b = document.querySelector('#jm-mapa .jm-pm[data-run="3"]'); if (!b) return null; b.click(); return true; });
    await sleep(700);
    const card = await pg.evaluate(() => { const h = document.querySelector('#jm-mapa .jm-card.on h3'); return h && h.textContent; });
    ok(sel && /3$/.test(card || ''), `${c.name}: kartica staze 3 ("${card}")`);
    await pg.screenshot({ path: path.join(OUT, `widget-${c.name}.png`), fullPage: false });
    ok(errors.length === 0, `${c.name}: bez grešaka ${errors.join(' | ')}`);
    await ctx.close();
  }
  // napad na podatke: izmijenjen mapa.json se odbije (heš iz reda), u stranicu ne ulazi ništa
  for (const t of [
    { name: 'podaci-izmijenjeni-na-jsdelivr', tamper: 'cdn', line: LINE0, expectMap: true },
    { name: 'podaci-izmijenjeni-svuda', tamper: 'all', line: LINE0, expectMap: false },
    { name: 'podaci-izmijenjeni-bez-heša', tamper: 'all', line: LINE0.replace(/ data-podaci="[^"]*"/, ''), expectMap: false },
  ]) {
    LINE = t.line;
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pg = await ctx.newPage();
    const opts = { lang: 'sr', used: new Set(), tamper: t.tamper };
    await serve(pg, opts);
    await pg.goto('https://www.oc-jahorina.com/mapa-staza/', { waitUntil: 'load' });
    await sleep(2500);
    const r = await pg.evaluate(() => ({ pwn: window.__pwn, runs: document.querySelectorAll('#jm-mapa .jm-world .jm-pm').length, img: document.querySelectorAll('#jm-mapa img[src="x"]').length, msg: (document.querySelector('#jm-mapa .jm-view') || {}).textContent }));
    ok(r.pwn === undefined && r.img === 0, `${t.name}: ubačeni kod se nije izvršio`);
    ok(t.expectMap ? r.runs >= 24 : r.runs === 0 && /ne može učitati/.test(r.msg), `${t.name}: ${t.expectMap ? 'mapa iz rezerve (' + r.runs + ')' : 'mapa odbijena, poruka prikazana'}`);
    await ctx.close();
  }
  LINE = LINE0;
  await browser.close();
  console.log(fails ? `\n${fails} grešaka` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
