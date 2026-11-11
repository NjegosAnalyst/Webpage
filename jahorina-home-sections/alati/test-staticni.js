// Statičan tekst u redovima za Elementor (alati/staticni.py, 11. 11. 2026). Za svaku sekciju uzima pravi red iz
// elementor-html-widget.html i provjerava:
//  · BEZ skripte (kako ga vidi pretraživač bez JS-a ili posjetilac dok se skripta učitava): tačno 1 H2 sa tekstom,
//    tekst i linkovi postoje, tamna podloga, bijeli naslov i svijetao tekst i uz Betheme stilove (!important), bez
//    vodoravnog skrola (računar i telefon);
//  · SA skriptom (lokalni fajl umjesto jsDelivr-a): statični omotač .jx-s nestane, u sekciji tačno 1 H2 (nema duplog).
// Pokretanje: node alati/test-staticni.js [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FONTS = process.argv[2] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const SEC = { stanje: 'jst-stanje', vijesti: 'jv-vijesti', ratrak: 'jr-ratrak', suvenirnica: 'jsu-suvenirnica', bar: 'jb-bar', gondola: 'jg-gondola', depo: 'jsd-depo', park: 'jsb-park', sankaliste: 'jsk-sankaliste' };
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}
const lines = {};
for (const s of Object.keys(SEC)) lines[s] = fs.readFileSync(path.join(REPO, 'jahorina-home-sections', s, 'elementor-html-widget.html'), 'utf8').trim();
const THEME = `body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff} h2{font-size:30px;line-height:40px;color:#161922!important;text-transform:uppercase}
  h3{color:#161922!important;text-transform:uppercase} p{color:#626262} a{color:#0095eb} ul{margin:0 0 15px 20px} .e-con{padding:10px;max-width:1140px;margin:0 auto}`;
const iso = (dd) => new Date(Date.now() - dd * 864e5).toISOString().slice(0, 19);

async function open(browser, vw, js) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 }, isMobile: vw < 761, javaScriptEnabled: js });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.route('**/*', async (route) => {
    const url = route.request().url(), u = new URL(url);
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: FONTS ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '' });
    if (u.host === 'fonts.gstatic.com') {
      const f = FONTS && path.join(FONTS, u.pathname.slice(1).replace(/\//g, '_'));
      return f && fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
    }
    // jsDelivr / githack / raw sa punim commitom → lokalni fajl
    const m = url.match(/(?:cdn\.jsdelivr\.net\/gh\/NjegosAnalyst\/Webpage@|rawcdn\.githack\.com\/NjegosAnalyst\/Webpage\/|raw\.githubusercontent\.com\/NjegosAnalyst\/Webpage\/)[0-9a-f]{40}\/(.+)$/);
    if (m) {
      const f = path.join(REPO, m[1].split('?')[0]);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ contentType: f.endsWith('.js') ? 'application/javascript' : 'image/webp', body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } });
    }
    const rp = u.searchParams.get('rest_route') || (u.pathname.match(/\/wp-json(\/.*)$/) || [])[1];
    if (u.origin === SITE && rp) {
      if (rp.startsWith('/wp/v2/categories')) return route.fulfill({ json: [{ id: 31 }] });
      if (rp.startsWith('/wp/v2/posts')) return route.fulfill({ json: [1, 2].map((i) => ({ id: i, date: iso(i * 5), link: SITE + '/v' + i + '/', featured_media: 0, title: { rendered: 'Vijest ' + i }, excerpt: { rendered: '<p>Opis ' + i + '.</p>' } })) });
      return route.fulfill({ json: [] });
    }
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/')) return route.fulfill({ status: 404, body: '' });
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${THEME}</style></head><body>` +
      Object.keys(SEC).map((s) => `<div class="e-con"><div class="elementor-widget elementor-widget-html">${lines[s]}</div></div>`).join('') + '</body></html>' });
    return route.abort();
  });
  await p.goto(SITE + '/pocetna-2027/');
  await p.waitForTimeout(js ? 3000 : 300);
  return { ctx, p, errors };
}

(async () => {
  const browser = await chromium.launch();
  for (const vw of [1440, 390]) {
    console.log('\n== bez skripte, ' + vw + ' px');
    const o = await open(browser, vw, false);
    const r = await o.p.evaluate((SEC) => {
      const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
      const out = {};
      for (const [s, id] of Object.entries(SEC)) {
        const root = document.getElementById(id), w = root.querySelector('.jx-s'), h2 = root.querySelectorAll('h2'), p = root.querySelector('p:not(.jx-k)');
        out[s] = { h2: h2.length, h2t: h2[0] ? h2[0].textContent : '', h2c: h2[0] ? lum(getComputedStyle(h2[0]).color) : 0, bg: w ? lum(getComputedStyle(w).backgroundColor) : 1,
          pc: p ? lum(getComputedStyle(p).color) : 0, words: root.textContent.trim().split(/\s+/).length, links: [...root.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
          up: h2[0] ? getComputedStyle(h2[0]).textTransform : '' };
      }
      return { out, scrollW: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    }, SEC);
    for (const [s, x] of Object.entries(r.out)) {
      check(s + ': 1 H2 „' + x.h2t + '“, tekst (' + x.words + ' riječi) i linkovi', x.h2 === 1 && x.h2t.length > 8 && x.words >= 15 && x.links.length >= 1, x.links);
      check(s + ': tamna podloga, bijeli naslov, svijetao tekst (i uz Betheme !important)', x.bg < .08 && x.h2c > .95 && x.pc > .5 && x.up === 'none', [x.bg, x.h2c, x.pc, x.up]);
    }
    check('bez vodoravnog skrola', r.scrollW <= r.cw, [r.scrollW, r.cw]);
    await o.ctx.close();
  }
  for (const vw of [1440, 390]) {
    console.log('\n== sa skriptom, ' + vw + ' px');
    const o = await open(browser, vw, true);
    const r = await o.p.evaluate((SEC) => Object.fromEntries(Object.entries(SEC).map(([s, id]) => {
      const root = document.getElementById(id);
      return [s, { st: root.querySelectorAll('.jx-s').length, h2: root.querySelectorAll('h2').length }];
    })), SEC);
    // park ima H2 u svakom od dva panela (Snowboard park / Ski bike) — tako je i bez statičnog teksta
    for (const [s, x] of Object.entries(r)) check(s + ': statičan tekst zamijenjen, H2 samo iz skripte', x.st === 0 && x.h2 === (s === 'park' ? 2 : 1), x);
    check('bez JS grešaka', o.errors.length === 0, o.errors);
    await o.ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
