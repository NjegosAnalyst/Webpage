// Simulacija sajta za sekciju „Stanje skijališta i brzi linkovi“ (sajt se iz cloud okruženja ne može koristiti za test).
// Stranica kao „Početna 2027“: hero u omotaču Slider Revolutiona (omotač niži od hero-a, overflow hidden), pa Elementor
// kontejneri (bijela pozadina, razmak i padding) sa stanjem, vijestima i ratrakom. REST: stranica Ski info sa brojačima
// dodatka „OC dnevni info“ (i <style> ISPRED JSON-a, kao na sajtu 11. 11.), vijesti.
// Pokretanje: node test-stanje.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@' + 'c'.repeat(40) + '/';
fs.mkdirSync(OUT, { recursive: true });

let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}
// markup brojača kao na stranici Ski info (11. 11. 2026)
function skiInfo({ lifts = '0/14', slopes = '0/25', snow = '0 cm', hours = '09:00–16:00', upd = '09.11.2026. 18:20' } = {}) {
  return `<div class="oc-dsi-frontend"><div class="oc-dsi-hero-updated"><span class="oc-dsi-live-dot" aria-hidden="true"></span>
    Posljednje ažurirano<br />\n\t\t\t\t<strong>\n\t<time class="oc-dsi-relative-time" data-timestamp="1794244801" data-lang="sh">\n\t\t${upd}\t\t</time>\n</strong></div>
    <div class="oc-dsi-weather"><span class="oc-dsi-weather-temp">13°</span><span class="oc-dsi-weather-label">Oblačno</span>
    <span class="oc-dsi-weather-depth">Snijeg: <strong>${snow}</strong></span><span class="oc-dsi-weather-wind">Vjetar <strong>8 km/h</strong></span></div>
    <p class="oc-dsi-hours-badge">Radno vrijeme: <strong>${hours}</strong></p>
    <div class="oc-dsi-summary-grid">
      <div class="oc-dsi-summary-tile"><span class="oc-dsi-summary-value">${lifts}</span><span class="oc-dsi-summary-label">Žičare · rade</span></div>
      <div class="oc-dsi-summary-tile"><span class="oc-dsi-summary-value">${slopes}</span><span class="oc-dsi-summary-label">Staze · otvorene</span></div>
      <div class="oc-dsi-summary-tile"><span class="oc-dsi-summary-value">0/4</span><span class="oc-dsi-summary-label">Ski vrtić · otvoreni</span></div>
      <div class="oc-dsi-summary-tile"><span class="oc-dsi-summary-value">0/1</span><span class="oc-dsi-summary-label">Sankalište · radi</span></div>
    </div><div class="oc-dsi-card"><h3 class="oc-dsi-card-title">Žičare</h3><span class="oc-dsi-card-hours">09:00–16:00</span></div></div>
    <h2>Skijalište Jahorina ukratko</h2><p>Jahorina ima 54 km uređenih alpskih staza i 14 žičara.</p>`;
}
const iso = (dd) => new Date(Date.now() - dd * 864e5).toISOString().slice(0, 19);
const POSTS = [1, 2, 3].map((i) => ({ id: i, date: iso(i * 9), link: SITE + '/vijest-' + i + '/', featured_media: 0,
  title: { rendered: 'Pretprodaja ski karata, vijest ' + i }, excerpt: { rendered: '<p>Kratak opis vijesti ' + i + '.</p>' } }));
const STATIC = '<h2>Stanje skijališta Jahorina</h2><p>Jahorina ima 54 km uređenih staza i 14 žičara.</p><ul><li><a href="https://webshop.oc-jahorina.com/">Kupi ski kartu online</a></li></ul>';

function page({ admin = false } = {}) {
  const box = (inner) => `<div class="e-con" style="margin-top:24px;padding:10px;background:#fff;display:flex;flex-direction:column"><div class="elementor-widget elementor-widget-html">${inner}</div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff} h2{font-size:30px;color:#161922!important;margin-bottom:15px;text-transform:uppercase}
  a{color:#0095eb;text-decoration:underline} ul{margin:0 0 15px 20px} li{list-style:disc} .srwrap{overflow:hidden;height:min(86vh,760px)}
  .jh-hero{height:calc(min(86vh,760px) + 40px);background:linear-gradient(#0f1a30,#0C1424)}</style></head>
  <body class="home${admin ? ' logged-in' : ''}"><div class="elementor">
  <div class="e-con" style="padding:10px;background:#fff"><rs-module-wrap class="srwrap" style="display:block"><section class="jh-hero"></section></rs-module-wrap></div>
  ${box(`<div id="jst-stanje">${STATIC}</div><script src="${CDN}jahorina-home-sections/stanje/stanje.js" defer></script>`)}
  ${box(`<div id="jv-vijesti"></div><script src="${CDN}jahorina-home-sections/vijesti/vijesti.js" defer></script>`)}
  ${box(`<div id="jr-ratrak"></div><script src="${CDN}jahorina-home-sections/ratrak/ratrak.js" defer></script>`)}
  </div><div style="height:600px"></div></body></html>`;
}
async function open(browser, { vw = 1440, vh = 900, pth = '/pocetna-2027/', rest = 'ok', data = {}, admin = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 761, hasTouch: vw < 761 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await p.route('**/*', async (route) => {
    const url = route.request().url(), u = new URL(url);
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: FONTS ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '' });
    if (u.host === 'fonts.gstatic.com') {
      const f = FONTS && path.join(FONTS, u.pathname.slice(1).replace(/\//g, '_'));
      return f && fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
    }
    if (url.startsWith(CDN)) {
      const f = path.join(REPO, url.slice(CDN.length).split('?')[0]);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ contentType: f.endsWith('.js') ? 'application/javascript' : 'image/webp', body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } });
    }
    const rp = u.searchParams.get('rest_route') || (u.pathname.match(/\/wp-json(\/.*)$/) || [])[1];
    if (u.origin === SITE && rp) {
      if (rp.startsWith('/wp/v2/pages')) {
        if (rest === 'fail') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
        const j = JSON.stringify([{ modified: '2026-11-09T18:24:49', content: { rendered: rest === 'empty' ? '<p>Stranica bez brojača.</p>' : skiInfo(data) } }]);
        return route.fulfill({ contentType: 'application/json', body: '<style id="elementor-post-9950">.elementor-9950{max-width:990px}</style>' + j });
      }
      if (rp.startsWith('/wp/v2/categories')) return route.fulfill({ json: [{ id: 31 }] });
      if (rp.startsWith('/wp/v2/posts')) return route.fulfill({ json: POSTS });
      return route.fulfill({ json: [] });
    }
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/')) return route.fulfill({ status: 404, body: '' });
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ admin }) });
    return route.abort();
  });
  await p.addInitScript(() => { window.__ev = []; window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }, true); });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jst-stanje .jst-panel:not(.is-wait)', { timeout: 10000 });
  await p.waitForSelector('#jv-vijesti .jv-slide, #jv-vijesti .jv-note', { timeout: 10000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  return { ctx, p, errors };
}
const info = (p) => p.evaluate(() => {
  const r = document.getElementById('jst-stanje'), q = (s) => r.querySelector(s), cs = (e) => getComputedStyle(e);
  const stat = (k) => { const li = q('[data-k="' + k + '"]'); return li && cs(li).display !== 'none' ? li.querySelector('b').textContent : null; };
  const cards = [...r.querySelectorAll('.jst-card')].map((a) => { const b = a.getBoundingClientRect(); return { t: a.querySelector('b').textContent, href: a.getAttribute('href'), target: a.target, x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; });
  const small = [...r.querySelectorAll('*')].filter((e) => e.offsetHeight && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs(e).fontSize) < 13).map((e) => e.className + ':' + cs(e).fontSize);
  const blur = [...r.querySelectorAll('*')].filter((e) => { const b = cs(e).backdropFilter; return b && b !== 'none'; }).length;
  return {
    h1: r.querySelectorAll('h1').length, h2: (q('h2') || {}).textContent, staticGone: !r.querySelector('ul:not(.jst-stats)'),
    st: q('.jst-st span').textContent, upd: q('.jst-st small').textContent, open: q('.jst-st').classList.contains('is-open'),
    none: q('.jst-panel').classList.contains('is-none'),
    lifts: stat('lifts'), slopes: stat('slopes'), snow: stat('snow'), hours: stat('hours'),
    all: q('.jst-all').getAttribute('href'), cards, small, blur, why: (q('.jst-why') || {}).textContent || '',
    scrollW: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    w: Math.round(r.getBoundingClientRect().width), h: Math.round(r.getBoundingClientRect().height),
  };
});
// spojevi: hero (vidljivo dno omotača) → stanje → vijesti; na liniji spoja mora biti tamni blok, ne bijela pozadina
const seams = async (p) => {
  const g = await p.evaluate(() => {
    const R = (s) => document.querySelector(s).getBoundingClientRect();
    const hb = Math.min(R('.jh-hero').bottom, R('.srwrap').bottom);
    return { g1: Math.round((R('#jst-stanje').top - hb) * 100) / 100, g2: Math.round((R('#jv-vijesti').top - R('#jst-stanje').bottom) * 100) / 100,
      y1: hb + scrollY, y2: R('#jst-stanje').bottom + scrollY };
  });
  const white = [];
  for (const y of [g.y1, g.y2]) {
    await p.evaluate((y) => window.scrollTo(0, y - 200), y);
    await p.waitForTimeout(150);
    const bad = await p.evaluate(() => {
      const out = [];
      for (const dy of [-1.5, -.5, 0, .5, 1.5]) for (const x of [3, innerWidth / 2, innerWidth - 4]) {
        const el = document.elementFromPoint(x, 200 + dy);
        if (!(el && el.closest('#jst-stanje, #jv-vijesti, .jh-hero'))) out.push(Math.round(x) + '@' + dy + ':' + (el ? el.className || el.tagName : '-'));
      }
      return out;
    });
    if (bad.length) white.push(bad.slice(0, 4));
  }
  return { g, white };
};

(async () => {
  const browser = await chromium.launch();
  let o, i, s;

  console.log('\n1) Računar 1440, SR: stanje sa stranice Ski info (sezona još nije počela)');
  o = await open(browser);
  i = await info(o.p);
  check('bez JS grešaka', o.errors.length === 0, o.errors);
  check('SEO: 0 × H1, H2 „Stanje skijališta Jahorina“; statični linkovi zamijenjeni', i.h1 === 0 && i.h2 === 'Stanje skijališta Jahorina' && i.staticGone, [i.h1, i.h2, i.staticGone]);
  check('brojke: žičare 0/14, staze 0/25, snijeg 0 cm, 9–16 h', i.lifts === '0/14' && i.slopes === '0/25' && i.snow === '0 cm' && i.hours === '9–16 h', [i.lifts, i.slopes, i.snow, i.hours]);
  check('status: Trenutno ne radi · Ažurirano 9. 11. u 18:20 (podaci i kad je <style> ispred JSON-a)', i.st === 'Trenutno ne radi' && !i.open && i.upd === 'Ažurirano 9. 11. u 18:20', [i.st, i.upd]);
  check('5 kartica u jednom redu, prva Kupi ski kartu (web shop, nova kartica)', i.cards.length === 5 && new Set(i.cards.map((c) => c.y)).size === 1 && i.cards[0].t === 'Kupi ski kartu' && i.cards[0].href === 'https://webshop.oc-jahorina.com/' && i.cards[0].target === '_blank', i.cards.map((c) => c.t + ' ' + c.y));
  check('linkovi: cjenovnik 2026/27, ski mapa, kamere (naša stranica), noćno skijanje, ski info',
    i.cards[1].href === SITE + '/cjenovnik-ski-karata-sezona-2026-27/' && i.cards[2].href === SITE + '/ski-mapa/' && i.cards[3].href === SITE + '/jahorina-tv-web-kamere/' && i.cards[4].href === SITE + '/nocno-skijanje/' && i.all === SITE + '/ski-info/', i.cards.map((c) => c.href).concat(i.all));
  check('puna širina, bez vodoravnog skrola, tekst ≥ 13 px', i.w === i.cw && i.scrollW <= i.cw && i.small.length === 0, [i.w, i.cw, i.scrollW, i.small]);
  s = await seams(o.p);
  check('spoj hero → stanje → vijesti bez razmaka i bez bijelog', s.g.g1 <= 0.01 && s.g.g2 <= 0.01 && s.white.length === 0, s);
  await o.p.evaluate(() => scrollTo(0, 0));
  await o.p.click('#jst-stanje .jst-card[data-jst="kamere"]');
  await o.p.click('#jst-stanje .jst-all');
  const ev = await o.p.evaluate(() => window.__ev.filter((e) => e[1] === 'stanje_klik').map((e) => e[2].cilj + '/' + e[2].jezik));
  check('GA4: stanje_klik (kamere, ski_info)', ev.join(',') === 'kamere/sr,ski_info/sr', ev);
  await o.p.locator('#jst-stanje').screenshot({ path: path.join(OUT, '1-racunar-1440.png') });
  await o.ctx.close();

  console.log('\n2) Skijalište radi, druge širine');
  o = await open(browser, { vw: 1280, data: { lifts: '9/14', slopes: '17/25', snow: '45 cm', hours: '09:00–16:30' } });
  i = await info(o.p);
  check('radi: „Radi sada“, 9/14, 17/25, 45 cm, 9–16:30 h', i.open && i.st === 'Radi sada' && i.lifts === '9/14' && i.slopes === '17/25' && i.snow === '45 cm' && i.hours === '9–16:30 h', [i.st, i.lifts, i.slopes, i.snow, i.hours]);
  await o.p.locator('#jst-stanje').screenshot({ path: path.join(OUT, '2-radi-1280.png') });
  await o.ctx.close();
  for (const vw of [1024, 820]) {
    o = await open(browser, { vw, vh: 1000 });
    i = await info(o.p);
    const rows = [...new Set(i.cards.map((c) => c.y))].length;
    check(vw + ' px: kartice u 2 reda (3 + 2), bez skrola, bez grešaka', rows === 2 && i.scrollW <= vw && o.errors.length === 0, [rows, i.scrollW, o.errors]);
    s = await seams(o.p);
    check(vw + ' px: spojevi bez bijelog', s.g.g1 <= 0.01 && s.g.g2 <= 0.01 && s.white.length === 0, s);
    await o.p.locator('#jst-stanje').screenshot({ path: path.join(OUT, '3-' + vw + '.png') });
    await o.ctx.close();
  }

  console.log('\n3) Telefon 390 i 340');
  for (const vw of [390, 340]) {
    o = await open(browser, { vw, vh: 844 });
    i = await info(o.p);
    const c = i.cards;
    check(vw + ' px: Kupi ski kartu preko cijele širine, ostale 2 × 2', c[0].w > vw - 40 && c[1].y === c[2].y && c[3].y === c[4].y && c[3].y > c[1].y && c[1].x < c[2].x, c.map((k) => [k.x, k.y, k.w]));
    check(vw + ' px: kartice najmanje 44 px, tekst ≥ 13 px, bez backdrop-filter, bez skrola', c.every((k) => k.h >= 44) && i.small.length === 0 && i.blur === 0 && i.scrollW <= vw, [c.map((k) => k.h), i.small, i.blur, i.scrollW]);
    check(vw + ' px: visina sekcije razumna (≤ 620 px)', i.h <= 620, i.h);
    s = await seams(o.p);
    check(vw + ' px: spojevi bez bijelog', s.g.g1 <= 0.01 && s.g.g2 <= 0.01 && s.white.length === 0, s);
    await o.p.locator('#jst-stanje').screenshot({ path: path.join(OUT, '4-telefon-' + vw + '.png') });
    await o.ctx.close();
  }

  console.log('\n4) Engleski');
  o = await open(browser, { pth: '/en/pocetna-2027/' });
  i = await info(o.p);
  check('EN: naslov, status, ažurirano', i.h2 === 'Jahorina ski resort today' && i.st === 'Currently closed' && i.upd === 'Updated 9 Nov, 18:20', [i.h2, i.st, i.upd]);
  check('EN: kartice i linkovi na /en/ (web shop isti)', i.cards.map((c) => c.t).join('|') === 'Buy a ski pass|Ski pass prices|Ski map|Live cameras|Night skiing' &&
    i.cards[1].href === SITE + '/en/cjenovnik-ski-karata-sezona-2026-27/' && i.cards[3].href === SITE + '/en/jahorina-tv-web-kamere/' && i.all === SITE + '/en/ski-info/' && i.cards[0].href === 'https://webshop.oc-jahorina.com/', i.cards.map((c) => c.href));
  await o.ctx.close();

  console.log('\n5) Greška i stranica bez brojača');
  o = await open(browser, { rest: 'fail', admin: true });
  i = await info(o.p);
  check('REST ne radi: bez brojki, kartice i link ostaju; admin vidi razlog', i.none && i.cards.length === 5 && /Stanje staza i žičara uživo/.test(i.st) && /HTTP 403/.test(i.why) && o.errors.length === 0, [i.none, i.st, i.why, o.errors]);
  s = await seams(o.p);
  check('i tada spojevi bez bijelog', s.g.g1 <= 0.01 && s.g.g2 <= 0.01 && s.white.length === 0, s);
  await o.p.locator('#jst-stanje').screenshot({ path: path.join(OUT, '5-greska.png') });
  await o.ctx.close();
  o = await open(browser, { rest: 'empty' });
  i = await info(o.p);
  check('stranica bez brojača: bez brojki, posjetilac ne vidi grešku', i.none && i.why === '' && o.errors.length === 0, [i.none, i.why]);
  await o.ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
