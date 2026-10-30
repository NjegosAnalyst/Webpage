// Test interaktivne mape u Chromiumu (bez interneta): pregled/index.html + mapa.js + podaci + slike se služe lokalno.
// Pokretanje: NODE_PATH=$(npm root -g) node test-mapa.js <folder-za-screenshotove> [folder-sa-fontovima]
// Fontove preuzima: bash ../jahorina-home-sections/alati/preuzmi-fontove.sh <folder>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const ORIGIN = 'https://pregled.test/';
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.webp': 'image/webp', '.css': 'text/css', '.woff2': 'font/woff2' };

async function serve(page) {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin + '/' === ORIGIN) {
      let p = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      const file = p === 'index.html' ? path.join(__dirname, 'pregled/index.html') : path.join(__dirname, p);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'nema' });
      let body = fs.readFileSync(file);
      // isti kostur kao pri objavi artifacta: charset + viewport
      if (p === 'index.html') body = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + body + '</body></html>';
      const ct = TYPES[path.extname(file)] || 'application/octet-stream';
      return route.fulfill({ status: 200, contentType: /text|javascript|json/.test(ct) ? ct + '; charset=utf-8' : ct, body });
    }
    if (url.hostname === 'fonts.googleapis.com' && FONTS) {
      const css = fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8').replace(/https:\/\/fonts\.gstatic\.com\/([^)]*)/g, (m, f) => 'https://fonts.gstatic.com/' + f);
      return route.fulfill({ status: 200, contentType: 'text/css', body: css });
    }
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
  for (const v of [
    { name: 'racunar', viewport: { width: 1440, height: 900 }, touch: false },
    { name: 'telefon', viewport: { width: 390, height: 844 }, touch: true, dpr: 3 },
  ]) {
    const ctx = await browser.newContext({ viewport: v.viewport, hasTouch: v.touch, isMobile: v.touch, deviceScaleFactor: v.dpr || 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await serve(page);
    await page.goto(ORIGIN, { waitUntil: 'load' });
    await page.waitForSelector('#jm-mapa .jm-pm', { timeout: 10000 });
    await sleep(900);
    const info = await page.evaluate(() => {
      const r = document.getElementById('jm-mapa');
      return {
        runs: r.querySelectorAll('.jm-world .jm-pm').length, lifts: r.querySelectorAll('.jm-world .jm-lb').length,
        paths: r.querySelectorAll('.jm-p').length, overflow: document.documentElement.scrollWidth - window.innerWidth,
        h1: document.querySelectorAll('h1').length, h2: (r.querySelector('h2') || {}).textContent,
        img: (() => { const i = r.querySelector('.jm-img'); return i && i.complete && i.naturalWidth; })(),
      };
    });
    ok(info.runs >= 25, `${v.name}: oznake staza ${info.runs}`);
    ok(info.lifts === 14, `${v.name}: žičare ${info.lifts}`);
    ok(info.paths === 25, `${v.name}: staze u SVG-u ${info.paths}`);
    ok(info.overflow <= 0, `${v.name}: bez vodoravnog skrola (${info.overflow})`);
    ok(info.h1 === 0, `${v.name}: bez H1`);
    ok(/Mapa staza\s+Jahorine/.test(info.h2), `${v.name}: H2 "${info.h2}"`);
    ok(info.img > 0, `${v.name}: slika učitana (${info.img}px)`);
    await page.screenshot({ path: path.join(OUT, `${v.name}-1-pocetak.png`) });
    const frame = await page.$('#jm-mapa .jm-frame');
    await frame.screenshot({ path: path.join(OUT, `${v.name}-2-mapa.png`) });

    // zbijen prikaz: filteri niski, popis zatvoren dok se ne klikne
    const kompakt = await page.evaluate(() => ({
      chip: document.querySelector('#jm-mapa .jm-bar .jm-chip').getBoundingClientRect().height,
      open: document.querySelector('#jm-mapa .jm-pop').open,
    }));
    ok(kompakt.chip <= 34 && !kompakt.open, `${v.name}: filteri ${kompakt.chip}px, popis zatvoren`);
    await page.click('#jm-mapa .jm-pop summary'); await sleep(200);

    // izbor staze iz popisa
    await page.click('#jm-mapa .jm-runs .jm-rc[data-run="4a"]');
    await sleep(800);
    const card = await page.evaluate(() => { const c = document.querySelector('#jm-mapa .jm-card'); return c.classList.contains('on') && c.textContent; });
    ok(card && /4a/.test(card), `${v.name}: kartica staze 4a (${(card || '').slice(0, 80)})`);
    const cw = await page.evaluate(() => { const c = document.querySelector('#jm-mapa .jm-card').getBoundingClientRect(), f = document.querySelector('#jm-mapa .jm-frame').getBoundingClientRect(); return { w: Math.round(c.width), h: Math.round(c.height), fh: Math.round(f.height) }; });
    ok(v.touch ? cw.h <= cw.fh * 0.47 : cw.w <= 290, `${v.name}: kartica ${cw.w}×${cw.h}px (okvir ${cw.fh}px)`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-3-staza-4a.png`) });

    // izbor žičare
    await page.click('#jm-mapa .jm-lifts .jm-li[data-lift="2"]');
    await sleep(800);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-4-zicara-2.png`) });

    // žičara sidro i usluga sa popisom (usklađeno sa zvaničnom slikom mape)
    await page.click('#jm-mapa .jm-lifts .jm-li[data-lift="11"]'); await sleep(600);
    const sidro = await page.evaluate(() => document.querySelector('#jm-mapa .jm-card').textContent);
    ok(/sidro/.test(sidro), `${v.name}: žičara 11 je ski lift sidro`);
    await page.evaluate(() => document.querySelector('#jm-mapa .jm-poi[data-info="gondola"]').click()); await sleep(400);
    const gond = await page.evaluate(() => document.querySelector('#jm-mapa .jm-card').textContent);
    ok(/Ski depo/.test(gond) && /Mjenjačnica/.test(gond), `${v.name}: kartica Gondola Poljice sa uslugama`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-4b-gondola.png`) });

    // noćni prikaz
    await page.click('#jm-mapa .jm-x');
    await page.click('#jm-mapa .jm-bar .jm-nt');
    await sleep(1400);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-5-noc.png`) });
    await page.click('#jm-mapa .jm-bar .jm-nt');

    // zum dugmetom (prikaz usluga)
    await page.click('#jm-mapa [data-a="fit"]'); await sleep(500);
    await page.click('#jm-mapa [data-a="in"]'); await sleep(400);
    await page.click('#jm-mapa [data-a="in"]'); await sleep(600);
    const pois = await page.evaluate(() => [...document.querySelectorAll('#jm-mapa .jm-poi')].filter((e) => getComputedStyle(e).visibility === 'visible').length);
    ok(pois > 0, `${v.name}: usluge vidljive poslije zuma (${pois})`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-6-zum.png`) });

    // klik na stazu na mapi (putanja)
    await page.click('#jm-mapa [data-a="fit"]'); await sleep(500);
    const hit = await page.evaluate(() => {
      // tačka na liniji staze 3 koja je unutar okvira (dalje od ivica i kontrola)
      const p = document.querySelector('#jm-mapa .jm-hits [data-run="3"]'), fr = document.querySelector('#jm-mapa .jm-frame').getBoundingClientRect();
      const L = p.getTotalLength(), m = p.getScreenCTM();
      for (let f = 0.5; f < 0.95; f += 0.03) {
        const pt = p.getPointAtLength(L * f), x = pt.x * m.a + m.e, y = pt.y * m.d + m.f;
        if (x > fr.left + 30 && x < fr.right - 70 && y > fr.top + 30 && y < fr.bottom - 30) return { x, y };
      }
      return null;
    });
    if (v.touch) await page.touchscreen.tap(hit.x, hit.y); else await page.mouse.click(hit.x, hit.y);
    await sleep(800);
    const sel = await page.evaluate(() => document.querySelector('#jm-mapa .jm-card h3') && document.querySelector('#jm-mapa .jm-card h3').textContent);
    ok(/ 3$/.test(sel || ''), `${v.name}: klik na liniju staze 3 → "${sel}"`);

    // cijeli ekran (na telefonu su kontrole skrivene dok je kartica otvorena)
    const ctlHidden = await page.evaluate(() => getComputedStyle(document.querySelector('#jm-mapa .jm-ctls')).pointerEvents === 'none');
    ok(v.touch ? ctlHidden : !ctlHidden, `${v.name}: kontrole ${ctlHidden ? 'skrivene' : 'vidljive'} dok je kartica otvorena`);
    await page.click('#jm-mapa .jm-x'); await sleep(300);
    await page.click('#jm-mapa [data-a="fs"]'); await sleep(500);
    await page.screenshot({ path: path.join(OUT, `${v.name}-7-cijeli-ekran.png`) });
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

    // engleski
    await page.click('#pv-en'); await page.waitForSelector('#jm-mapa .jm-pm'); await sleep(600);
    const en = await page.evaluate(() => document.querySelector('#jm-mapa h2').textContent);
    ok(/Ski runs of\s+Jahorina/.test(en), `${v.name}: EN naslov "${en}"`);
    await page.screenshot({ path: path.join(OUT, `${v.name}-8-en.png`) });

    ok(errors.length === 0, `${v.name}: bez grešaka u konzoli ${errors.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} grešaka` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
