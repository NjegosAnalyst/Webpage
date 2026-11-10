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
    // „cijela mapa“: dugme (na telefonu postoji samo u cijelom ekranu, inače početni prikaz)
    const home = () => page.evaluate(() => { const b = document.querySelector('#jm-mapa [data-a="fit"]'); if (b && b.offsetParent) b.click(); else document.getElementById('jm-mapa').__jm.home(0); });
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

    // bez usluga, osnježavanja i popisa ispod mape (korisnik 9. 11.); filteri niski
    const bez = await page.evaluate(() => ({
      chip: document.querySelector('#jm-mapa .jm-bar .jm-chip').getBoundingClientRect().height,
      poi: document.querySelectorAll('#jm-mapa .jm-poi, #jm-mapa .jm-top, #jm-mapa .jm-sks, #jm-mapa .jm-nat').length,
      chips: [...document.querySelectorAll('#jm-mapa .jm-bar .jm-chip')].map((c) => c.dataset.f).join(','),
      pop: document.querySelectorAll('#jm-mapa .jm-pop, #jm-mapa .jm-lists').length,
    }));
    ok(bez.chip <= 34, `${v.name}: filteri ${bez.chip}px`);
    // 25 staza / 14 žičara kao ski info; preuzimanje; svi filteri na ekranu (telefon: dva reda, bez povlačenja)
    const ui = await page.evaluate(() => {
      const r = document.getElementById('jm-mapa'), dl = r.querySelector('.jm-dl'), fr = r.querySelector('.jm-frame').getBoundingClientRect();
      const chips = [...r.querySelectorAll('.jm-bar .jm-chip, .jm-bar .jm-nt')].map((c) => c.getBoundingClientRect());
      const inF = (sel) => { const e = r.querySelector(sel); if (!e) return false; const b = e.getBoundingClientRect(); return b.left >= fr.left - 2 && b.right <= fr.right + 2 && b.top >= fr.top - 2 && b.bottom <= fr.bottom + 2; };
      return { lead: r.querySelector('.jm-lead').textContent, dl: dl && dl.getAttribute('href'), chipsIn: chips.every((b) => b.left >= 0 && b.right <= innerWidth), rows: new Set(chips.map((b) => Math.round(b.top))).size,
        fh: Math.round(fr.height), vh: innerHeight, edges: inF('.jm-pm[data-run="6c"]') && inF('.jm-pm[data-run="7"]') && inF('.jm-pm[data-run="9b"]') };
    });
    ok(/^25 staza,.* 14 žičara/.test(ui.lead), `${v.name}: uvod „${ui.lead.slice(0, 48)}…“`);
    ok(/preuzimanje\/mapa-staza-jahorina\.jpg$/.test(ui.dl || ''), `${v.name}: dugme za preuzimanje (${ui.dl})`);
    ok(ui.chipsIn, `${v.name}: svi filteri na ekranu (${ui.rows} ${ui.rows === 1 ? 'red' : 'reda'})`);
    ok(ui.edges, `${v.name}: na otvaranju se vidi cijelo skijalište (6c, 7, 9b u kadru)`);
    if (v.touch) ok(ui.fh <= ui.vh * 0.45, `${v.name}: okvir mape ${ui.fh}px od ${ui.vh}px ekrana`);
    ok(bez.poi === 0 && bez.pop === 0 && bez.chips === 'laka,srednja,teska,zicare', `${v.name}: bez usluga/topova/popisa (oznaka ${bez.poi}, popis ${bez.pop}, filteri ${bez.chips})`);

    // izbor staze (oznaka na mapi)
    // 3b ne kreće od žičare: kartica nudi žičaru 2 preko staze 2
    await page.evaluate(() => document.querySelector('#jm-mapa .jm-pm[data-run="3b"]').click()); await sleep(700);
    const c3b = await page.evaluate(() => document.querySelector('#jm-mapa .jm-card').textContent);
    ok(/Žičara do starta/.test(c3b) && /2 · Ogorjelica I/.test(c3b) && /preko staze\s*2/.test(c3b), `${v.name}: kartica 3b ima žičaru do starta (${c3b.replace(/\s+/g, ' ').slice(0, 90)})`);
    await page.evaluate(() => document.querySelector('#jm-mapa .jm-pm[data-run="4a"]').click());
    await sleep(800);
    const card = await page.evaluate(() => { const c = document.querySelector('#jm-mapa .jm-card'); return c.classList.contains('on') && c.textContent; });
    ok(card && /4a/.test(card), `${v.name}: kartica staze 4a (${(card || '').slice(0, 80)})`);
    const cw = await page.evaluate(() => { const c = document.querySelector('#jm-mapa .jm-card').getBoundingClientRect(), f = document.querySelector('#jm-mapa .jm-frame').getBoundingClientRect(); return { w: Math.round(c.width), h: Math.round(c.height), fh: Math.round(f.height) }; });
    ok(v.touch ? cw.h <= cw.fh * 0.47 : cw.w <= 290, `${v.name}: kartica ${cw.w}×${cw.h}px (okvir ${cw.fh}px)`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-3-staza-4a.png`) });
    // broj Gorske službe spasavanja ispod mape
    const sos = await page.evaluate(() => { const a = document.querySelector('#jm-mapa .jm-sos a'); if (!a) return null; const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), t: a.textContent, h: Math.round(r.height), right: Math.round(r.right), vw: innerWidth }; });
    ok(sos && sos.href === 'tel:+38766636636' && /636 636/.test(sos.t) && sos.h >= 44 && sos.right <= sos.vw, `${v.name}: Gorska služba ${sos && sos.t} (${sos && sos.h}px)`);
    // poravnanje: SVG linije, slike i HTML oznake u istim koordinatama (svijet = veličina podataka)
    const por = await page.evaluate(() => {
      const w = document.querySelector('#jm-mapa .jm-world'), m = w.querySelector('.jm-pm[data-run="4a"]'), r = m.getBoundingClientRect();
      const path = w.querySelector('.jm-p[data-run="4a"] .jm-ln'), L = path.getTotalLength(), M = path.getScreenCTM();
      let best = 1e9; const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      for (let i = 0; i <= 400; i++) { const q = path.getPointAtLength(L * i / 400); best = Math.min(best, Math.hypot(q.x * M.a + M.e - cx, q.y * M.d + M.f - cy)); }
      const img = w.querySelector('.jm-img-d');
      return { d: best, wh: w.offsetHeight, ih: img.offsetHeight };
    });
    ok(por.d < 2 && por.wh === por.ih, `${v.name}: oznaka na liniji (${por.d.toFixed(1)} px), svijet ${por.wh} = slika ${por.ih}`);
    // svjetlosna linija niz stazu: postoji i pomjera se
    const fl1 = await page.evaluate(() => { const p = document.querySelector('#jm-mapa .jm-flw'); return p ? parseFloat(p.style.strokeDashoffset) : null; });
    await sleep(500);
    const fl2 = await page.evaluate(() => { const p = document.querySelector('#jm-mapa .jm-flw'); return p ? parseFloat(p.style.strokeDashoffset) : null; });
    ok(fl1 !== null && fl2 !== null && fl1 !== fl2, `${v.name}: svjetlosna linija niz stazu (${fl1} → ${fl2})`);
    const slika = await page.evaluate(() => ({ lq: !!document.querySelector('#jm-mapa img[src$="mapa-dan-96.webp"]'), op: getComputedStyle(document.querySelector('#jm-mapa .jm-img-d')).opacity }));
    ok(slika.lq && slika.op === '1', `${v.name}: mutna slika ispod, oštra vidljiva (${slika.op})`);

    // izbor žičare
    await page.evaluate(() => document.querySelector('#jm-mapa .jm-world .jm-lb[data-lift="2"]').click());
    await sleep(800);
    const cab = await page.evaluate(() => { const c = document.querySelector('#jm-mapa .jm-cab'); return c ? c.style.transform : null; });
    ok(cab && /translate3d/.test(cab), `${v.name}: kabina po žičari 2 (${cab})`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-4-zicara-2.png`) });

    // žičara sidro (iz legende)
    await page.evaluate(() => document.querySelector('#jm-mapa .jm-world .jm-lb[data-lift="11"]').click()); await sleep(600);
    const sidro = await page.evaluate(() => document.querySelector('#jm-mapa .jm-card').textContent);
    ok(/sidro/.test(sidro), `${v.name}: žičara 11 je ski lift sidro`);

    // noćni prikaz
    await page.click('#jm-mapa .jm-x');
    await page.click('#jm-mapa .jm-bar .jm-nt');
    await sleep(1400);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-5-noc.png`) });
    await page.click('#jm-mapa .jm-bar .jm-nt');

    // zum dugmetom (vezne staze se pojave)
    await home(); await sleep(500);
    for (let i = 0; i < (v.touch ? 4 : 2); i++) { await page.click('#jm-mapa [data-a="in"]'); await sleep(450); }
    await sleep(300);
    const veze = await page.evaluate(() => getComputedStyle(document.querySelector('#jm-mapa .jm-lod2')).opacity);
    ok(veze === '1', `${v.name}: vezne staze vidljive poslije zuma`);
    await frame.screenshot({ path: path.join(OUT, `${v.name}-6-zum.png`) });

    // klik na stazu na mapi (putanja)
    await home(); await sleep(500);
    if (v.touch) { await page.click('#jm-mapa [data-a="in"]'); await sleep(450); await page.click('#jm-mapa [data-a="in"]'); await sleep(600); } await sleep(500);
    const hit = await page.evaluate(() => {
      // tačka na liniji staze 3 koja je unutar okvira (dalje od ivica i kontrola)
      const p = document.querySelector('#jm-mapa .jm-hits [data-run="3"]'), fr = document.querySelector('#jm-mapa .jm-frame').getBoundingClientRect();
      const L = p.getTotalLength(), m = p.getScreenCTM();
      for (let f = 0.3; f < 0.97; f += 0.02) {
        const pt = p.getPointAtLength(L * f), x = pt.x * m.a + m.e, y = pt.y * m.d + m.f;
        const el = document.elementFromPoint(x, y);
        // dalje od dugmadi (oznake žičara/usluga): telefon „prilijepi“ dodir za najbliže dugme
        const nearBtn = [...document.querySelectorAll('#jm-mapa .jm-world button')].some((btn) => {
          const r = btn.getBoundingClientRect(); return r.width && x > r.left - 28 && x < r.right + 28 && y > r.top - 28 && y < r.bottom + 28;
        });
        if (x > fr.left + 30 && x < fr.right - 70 && y > fr.top + 30 && y < fr.bottom - 30 && el && el.getAttribute('data-run') === '3' && !nearBtn) return { x, y };
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
