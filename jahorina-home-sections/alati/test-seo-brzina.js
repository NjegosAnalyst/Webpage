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
const LIST = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(IDS);
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
  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
