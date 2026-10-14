// Zajednička provjera "SEO i brzina" (alati/seo-brzina.py) za sekcije početne.
// Svaka sekcija se učita sama, sa skriptom sa jsDelivr-a zaključanom na puni (lažni) hash; WordPress vraća prazno (ugrađeni
// sadržaj), a jsDelivr ne vraća slike → slike moraju stići sa raw.githubusercontent.com. Provjerava: 0 × H1, H2 postoji,
// slike lazy + alt sa "Jahorina" + width/height, rezerva sa GitHuba, telefon bez backdrop-filter i mix-blend-mode na tint-u.
// Pokretanje: node alati/test-seo-brzina.js [folder-sa-fontovima] [sekcija …]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FONTS = process.argv[2] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const HASH = 'b'.repeat(40);
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@' + HASH + '/';
const RAW = 'https://raw.githubusercontent.com/NjegosAnalyst/Webpage/' + HASH + '/';
const IDS = { ratrak: 'jr-ratrak', suvenirnica: 'jsu-suvenirnica', bar: 'jb-bar', gondola: 'jg-gondola', depo: 'jsd-depo', park: 'jsb-park', sankaliste: 'jsk-sankaliste' };
const LIST = process.argv.slice(3).length ? process.argv.slice(3).filter((x) => IDS[x]) : Object.keys(IDS);
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}
async function open(browser, sec, vw, vh, pth = '/') {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 761, hasTouch: vw < 761 });
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
    if (url.startsWith(CDN) || url.startsWith(RAW)) {
      const rel = url.slice(url.startsWith(CDN) ? CDN.length : RAW.length).split('?')[0];
      if (url.startsWith(CDN) && /\.(webp|jpe?g|png)$/i.test(rel)) return route.fulfill({ status: 502, body: 'jsDelivr greška' });
      const f = path.join(REPO, rel);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nema' });
      const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return route.fulfill({ contentType: ct, body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } });
    }
    if (u.origin === SITE && (/wp-json/.test(u.pathname) || u.searchParams.get('rest_route'))) return route.fulfill({ contentType: 'application/json', body: '[]' });
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;background:#fff"><div style="height:120px"></div><div id="${IDS[sec]}"></div>
      <script src="${CDN}jahorina-home-sections/${sec}/${sec}.js" defer></script><div style="height:1200px"></div></body></html>` });
    return route.abort();
  });
  await p.goto(SITE + pth);
  await p.waitForSelector('#' + IDS[sec] + ' h2', { timeout: 15000 });
  await p.locator('#' + IDS[sec] + ' h2').first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(3500);
  return { ctx, p, errors };
}
const info = (p, id) => p.evaluate((id) => {
  const r = document.getElementById(id), cs = (e) => getComputedStyle(e);
  const imgs = [...r.querySelectorAll('img')];
  const blur = [...r.querySelectorAll('*')].filter((e) => { const b = cs(e).backdropFilter || cs(e).webkitBackdropFilter; return b && b !== 'none'; }).length;
  const tint = [...r.querySelectorAll('[class$="-tint"]')].map((e) => cs(e).mixBlendMode);
  return {
    h1: document.querySelectorAll('h1').length, h2: r.querySelectorAll('h2').length,
    imgs: imgs.length, lazy: imgs.filter((i) => i.getAttribute('loading')).length, dims: imgs.filter((i) => i.getAttribute('width') && i.getAttribute('height')).length,
    altBad: imgs.filter((i) => i.getAttribute('alt') && !/jahorin/i.test(i.alt)).map((i) => i.alt),
    loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length, raw: imgs.filter((i) => /raw\.githubusercontent\.com/.test(i.currentSrc || i.src)).length,
    unloaded: imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => (i.currentSrc || i.src).split('/').pop()),
    blur, tint, scrollW: document.documentElement.scrollWidth,
  };
}, id);

(async () => {
  const browser = await chromium.launch();
  for (const sec of LIST) {
    console.log('\n== ' + sec);
    let r = await open(browser, sec, 1440, 900);
    let i = await info(r.p, IDS[sec]);
    check('bez JS grešaka', r.errors.length === 0, r.errors);
    check('SEO: 0 × H1, H2 postoji', i.h1 === 0 && i.h2 >= 1, [i.h1, i.h2]);
    check('slike: lazy, width/height, alt sa „Jahorina“', i.imgs > 0 && i.lazy === i.imgs && i.dims === i.imgs && i.altBad.length === 0, i);
    check('jsDelivr bez slika → slike stigle sa GitHuba (raw)', i.raw > 0 && i.loaded === i.imgs, [i.loaded, i.imgs, i.raw, i.unloaded]);
    await r.ctx.close();
    r = await open(browser, sec, 390, 844);
    i = await info(r.p, IDS[sec]);
    check('telefon: bez backdrop-filter i mix-blend-mode na plavom sloju, bez skrola', i.blur === 0 && i.tint.every((m) => m === 'normal') && i.scrollW <= 390, [i.blur, i.tint, i.scrollW]);
    check('telefon: bez JS grešaka', r.errors.length === 0, r.errors);
    await r.ctx.close();
    r = await open(browser, sec, 1440, 900, '/en/');
    i = await info(r.p, IDS[sec]);
    check('EN: alt sa „Jahorina“', i.altBad.length === 0, i.altBad);
    await r.ctx.close();
  }
  // šav: tri bloka u zasebnim Elementor kontejnerima sa razmakom (margin 24 px + padding 10 px na bijeloj pozadini)
  if (!process.argv.slice(3).length || process.argv.includes('sav')) {
    console.log('\n== šav između sekcija (Elementor kontejneri sa razmakom)');
    for (const [vw, vh, wrap] of [[1440, 900, 'elementor'], [1440, 900, 'mfn-builder-content'], [390, 844, 'elementor'], [390, 844, 'mfn-builder-content']]) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 761 });
      const p = await ctx.newPage();
      await p.route('**/*', async (route) => {
        const url = route.request().url(), u = new URL(url);
        if (url.startsWith(CDN)) { const f = path.join(REPO, url.slice(CDN.length).split('?')[0]); return fs.existsSync(f) ? route.fulfill({ contentType: f.endsWith('.js') ? 'application/javascript' : 'image/webp', body: fs.readFileSync(f) }) : route.fulfill({ status: 404, body: '' }); }
        if (u.origin === SITE && /wp-json/.test(u.pathname)) return route.fulfill({ contentType: 'application/json', body: '[]' });
        if (u.origin === SITE) {
          const box = (id, sec, attrs = '') => `<div class="e-con" style="margin-top:24px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:20px"><div class="elementor-widget elementor-widget-html"><div id="${id}" ${attrs}></div><script src="${CDN}jahorina-home-sections/${sec}/${sec}.js" defer></script></div></div>`;
          return route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#fff"><div class="${wrap}"><div class="elementor-section-x">
            ${box('jsk-sankaliste', 'sankaliste')}${box('jpb-brojke', 'brojke', 'data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"')}
            <div class="e-con" style="margin-top:24px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:20px"><div class="elementor-widget elementor-widget-html"><div id="jsd-depo"></div><script src="${CDN}jahorina-home-sections/depo/depo.js" defer></script></div>
            <div class="elementor-widget elementor-widget-html"><div id="jr-ratrak"></div><script src="${CDN}jahorina-home-sections/ratrak/ratrak.js" defer></script></div></div></div></div><div style="height:600px"></div></body></html>` });
        }
        return route.abort();
      });
      await p.goto(SITE + '/');
      await p.waitForSelector('#jr-ratrak h2');
      await p.waitForTimeout(1500);
      const g = await p.evaluate(() => {
        const R = (id) => document.getElementById(id).getBoundingClientRect(), a = R('jsk-sankaliste'), b = R('jpb-brojke'), dp = R('jsd-depo'), c = R('jr-ratrak');
        const q = (x) => Math.round(x * 100) / 100;
        return { g1: q(b.top - a.bottom), g2: q(dp.top - b.bottom), g3: q(c.top - dp.bottom), y1: a.bottom + scrollY, y2: b.bottom + scrollY, y3: dp.bottom + scrollY };
      });
      check(vw + ' px, ' + wrap + ': nema razmaka između blokova (kontejner–kontejner i widget–widget u istom kontejneru)', g.g1 <= 0.01 && g.g2 <= 0.01 && g.g3 <= 0.01, g);
      // stabilno: i 3 s kasnije (fit() i šav se ne smjenjuju)
      const later = [];
      for (let k = 0; k < 6; k++) {
        await p.waitForTimeout(500);
        later.push(await p.evaluate(() => { const R = (id) => document.getElementById(id).getBoundingClientRect(); return Math.max(R('jpb-brojke').top - R('jsk-sankaliste').bottom, R('jsd-depo').top - R('jpb-brojke').bottom, R('jr-ratrak').top - R('jsd-depo').bottom); }));
      }
      check(vw + ' px, ' + wrap + ': razmak ostaje zatvoren (6 mjerenja u 3 s)', later.every((x) => x <= 0.01), later);
      // na samom spoju (lijevi rub, van kadra) mora biti jedan od naših tamnih blokova, ne bijela pozadina
      const white = [];
      for (const y of [g.y1, g.y2, g.y3]) {
        await p.evaluate((y) => window.scrollTo(0, y - 200), y);
        await p.waitForTimeout(200);
        const bad = await p.evaluate(() => [-1.5, -0.5, 0, 0.5, 1.5].filter((dy) => {
          const y = 200 + dy, el = document.elementFromPoint(3, y);
          return !(el && el.closest('#jsk-sankaliste, #jpb-brojke, #jsd-depo, #jr-ratrak'));
        }).map((dy) => { const el = document.elementFromPoint(3, 200 + dy); return dy + ':' + (el ? el.className || el.tagName : '-'); }));
        if (bad.length) white.push(bad);
      }
      check(vw + ' px, ' + wrap + ': na spoju je tamni blok, ne bijela pozadina', white.length === 0, white);
      await ctx.close();
    }
  }
  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
