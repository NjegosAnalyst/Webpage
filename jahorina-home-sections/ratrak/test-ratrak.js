// Simulacija sajta za sekciju ratraka (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, ratrak.js, fotografije i fontovi se služe lokalno.
// Pokretanje: node test-ratrak.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
fs.mkdirSync(OUT, { recursive: true });

const theme = `
  /* grubo oponašanje Betheme/Elementor stilova koji bi mogli smetati */
  body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff}
  h2{font-size:30px;line-height:40px;font-weight:400;color:#161922!important;margin-bottom:15px}
  a{color:#0095eb;text-decoration:underline} a:hover{color:#007cc3}
  ul{list-style:disc;margin:0 0 15px 30px} li{margin-bottom:8px}
  button{background:#0095eb;color:#fff;padding:10px 20px;border:1px solid red}
  p{margin:0 0 15px} img{max-width:100%;height:auto}
  .before,.after{padding:60px 20px;color:#444} .boxed{max-width:1140px;margin:0 auto;padding:0 10px}`;
function page(attrs) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home">
  <div class="before">Vijesti (iznad)</div>
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jr-ratrak" ${attrs || ''}></div>
    <script src="${CDN}jahorina-home-sections/ratrak/ratrak.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: FONTS ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '' });
    if (u.host === 'fonts.gstatic.com') {
      const f = FONTS && path.join(FONTS, u.pathname.slice(1).replace(/\//g, '_'));
      return f && fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
    }
    if (route.request().url().startsWith(CDN)) {
      const f = path.join(REPO, route.request().url().slice(CDN.length).split('?')[0]);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nema' });
      const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.webp') ? 'image/webp' : 'application/octet-stream';
      return route.fulfill({ contentType: ct, body: fs.readFileSync(f) });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page(attrs) });
    return route.abort();
  });
  await p.addInitScript((mode) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    // test ne otvara mail/telefon/web shop
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, ga);
  await p.goto(SITE + pth);
  await p.waitForSelector('#jr-ratrak .jr-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jr-ratrak').scrollIntoViewIfNeeded();
  await p.waitForTimeout(2600);   // ulazak traje ~2 s
  return { p, ctx, errors };
}
async function layout(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jr-ratrak'), b = r.getBoundingClientRect();
    const h2 = r.querySelector('h2 span');
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      bullets: getComputedStyle(r.querySelector('.jr-notes li')).listStyleType,
      hidden: [...r.querySelectorAll('.jr-sl,.jr-tile,.jr-shot')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      imgOk: [...r.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0),
    };
  });
}

(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, uži kontejner teme, GA4 (gtag)');
  let { p, ctx, errors } = await open(browser);
  let L = await layout(p);
  check('bez vodoravnog skrola, preko cijele širine', L.scroll === 0 && L.left === 0 && L.width === L.cw, L);
  check('naslov bijeli i Archivo uprkos temi', L.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(L.h2font), [L.h2color, L.h2font]);
  check('bez tačkica liste iz teme', L.bullets === 'none', L.bullets);
  check('sve vidljivo poslije ulaska', L.hidden === 0, L.hidden);
  check('fotografije učitane iz istog commita', L.imgOk);
  const tiles = await p.$$eval('#jr-ratrak .jr-tile b', (els) => els.map((e) => e.textContent));
  check('pločice: 20 min / 16–18h / 50 KM', tiles.join('|') === '20 min|16–18h|50 KM', tiles);
  const ld = await p.evaluate(() => JSON.parse(document.getElementById('jr-ld').text));
  check('schema.org TouristTrip, 50 BAM', ld['@type'] === 'TouristTrip' && ld.offers.price === '50' && ld.offers.priceCurrency === 'BAM', ld.offers);
  await p.screenshot({ path: path.join(OUT, 'sr-racunar.png'), fullPage: true });
  await p.click('#jr-ratrak .jr-btn--solid');
  await p.click('#jr-ratrak .jr-btn--ghost');
  let ev = await p.evaluate(() => window.__ev);
  check('GA4: klik mail i telefon', JSON.stringify(ev) === JSON.stringify([['event', 'ratrak_rezervacija', { nacin: 'mail', jezik: 'sr' }], ['event', 'ratrak_rezervacija', { nacin: 'telefon', jezik: 'sr' }]]), ev);
  // galerija
  await p.click('#jr-ratrak .jr-gal');
  await p.waitForTimeout(400);
  let g = await p.evaluate(() => { const lb = document.getElementById('jr-lb'); return { shown: getComputedStyle(lb).display, op: getComputedStyle(lb).opacity, cap: lb.querySelector('figcaption').textContent, focus: document.activeElement.className, overflow: document.documentElement.style.overflow }; });
  check('galerija se otvara (fokus na Zatvori, stranica ne skroluje)', g.shown === 'grid' && g.op === '1' && g.cap === '1 / 3' && g.focus === 'jr-lb-close' && g.overflow === 'hidden', g);
  await p.evaluate(() => document.querySelector('#jr-lb img').decode().catch(() => {}));
  await p.screenshot({ path: path.join(OUT, 'galerija-racunar.png') });
  await p.keyboard.press('ArrowRight');
  check('strelica desno → 2 / 3', (await p.textContent('#jr-lb figcaption')) === '2 / 3');
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  check('Tab ostaje u galeriji', await p.evaluate(() => !!document.activeElement.closest('#jr-lb')));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(450);
  g = await p.evaluate(() => ({ shown: getComputedStyle(document.getElementById('jr-lb')).display, focus: document.activeElement.className, overflow: document.documentElement.style.overflow }));
  check('Esc zatvara, fokus se vraća na dugme Galerija', g.shown === 'none' && g.focus === 'jr-gal' && g.overflow === '', g);
  ev = await p.evaluate(() => window.__ev.map((e) => e[1]));
  check('GA4: otvaranje galerije', ev.includes('ratrak_galerija'), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('EN, računar, Google Tag Manager (dataLayer)');
  ({ p, ctx, errors } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm' }));
  const en = await p.evaluate(() => ({ h: document.querySelector('#jr-ratrak h2').textContent, t: [...document.querySelectorAll('#jr-ratrak .jr-tile b')].map((e) => e.textContent).join('|') }));
  check('engleski tekst i 4–6 pm', en.h === 'Panoramicsnowcatride' && en.t === '20 min|4–6 pm|50 KM', en);
  await p.click('#jr-ratrak .jr-btn--solid');
  ev = await p.evaluate(() => window.__ev);
  check('dataLayer: ratrak_rezervacija', JSON.stringify(ev) === JSON.stringify([{ event: 'ratrak_rezervacija', nacin: 'mail', jezik: 'en' }]), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.screenshot({ path: path.join(OUT, 'en-racunar.png'), fullPage: true });
  await ctx.close();

  console.log('Web shop i podešavanja u redu za widget, bez Google Analytics');
  ({ p, ctx, errors } = await open(browser, { ga: 'none', attrs: 'data-webshop="https://webshop.oc-jahorina.com/ratrak" data-cijena="55 KM" data-polazak="15–17h" data-trajanje="25 min"' }));
  const ws = await p.evaluate(() => ({
    solid: document.querySelector('#jr-ratrak .jr-btn--solid').getAttribute('href') + ' | ' + document.querySelector('#jr-ratrak .jr-btn--solid').textContent,
    ghosts: [...document.querySelectorAll('#jr-ratrak .jr-btn--ghost')].map((a) => a.getAttribute('href')).join(' | '),
    tiles: [...document.querySelectorAll('#jr-ratrak .jr-tile b')].map((e) => e.textContent).join('|'),
    ld: JSON.parse(document.getElementById('jr-ld').text).offers,
  }));
  check('glavno dugme vodi u web shop, mail i telefon sporedni', ws.solid === 'https://webshop.oc-jahorina.com/ratrak | Rezerviši online' && ws.ghosts === 'mailto:skipass@oc-jahorina.com | tel:+38757270003', ws);
  check('pločice iz podešavanja', ws.tiles === '25 min|15–17h|55 KM', ws.tiles);
  check('schema.org cijena 55, link na web shop', ws.ld.price === '55' && ws.ld.url === 'https://webshop.oc-jahorina.com/ratrak', ws.ld);
  await p.click('#jr-ratrak .jr-btn--solid');
  check('bez GA nema grešaka pri kliku', errors.length === 0, errors);
  await p.screenshot({ path: path.join(OUT, 'webshop-racunar.png'), fullPage: true });
  await ctx.close();

  for (const [name, vw, vh] of [['tablet', 900, 1100], ['telefon', 390, 844]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh }));
    L = await layout(p);
    check('bez vodoravnog skrola, preko cijele širine', L.scroll === 0 && L.left === 0 && L.width === L.cw, L);
    check('sve vidljivo poslije ulaska', L.hidden === 0, L.hidden);
    await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
    if (name === 'telefon') {
      await p.click('#jr-ratrak .jr-gal');
      await p.waitForTimeout(400);
      await p.evaluate(() => document.querySelector('#jr-lb img').decode().catch(() => {}));
      const box = await p.evaluate(() => { const r = document.querySelector('#jr-lb img').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth }; });
      check('galerija na telefonu staje u ekran', box.w <= box.vw && box.h > 100, box);
      await p.screenshot({ path: path.join(OUT, 'galerija-telefon.png') });
      await p.click('#jr-lb .jr-lb-close');
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska)');
  ({ p, ctx, errors } = await open(browser, { reduced: true }));
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jr-ratrak').className, hidden: [...document.querySelectorAll('#jr-ratrak .jr-sl,#jr-ratrak .jr-tile')].filter((e) => getComputedStyle(e).opacity !== '1').length }));
  check('odmah vidljivo, bez klasa za ulazak', !/jr-anim/.test(rm.cls) && rm.hidden === 0, rm);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
