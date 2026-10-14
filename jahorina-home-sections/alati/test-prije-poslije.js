// Snimak sekcija za poređenje "prije / poslije" (SEO ispravke bez vizuelne promjene).
// Svaka sekcija se učita sama (lokalni fajlovi umjesto jsDelivr-a, WordPress vraća prazno → ugrađeni sadržaj), uz smanjeno
// kretanje (bez animacija, da snimci budu uporedivi), na 1440×900 i 375×812. Ispisuje textContent svih H2/H3, sve alt
// tekstove, link "Cijene karata" (sankalište), broj <link> za fontove i greške u konzoli; snimak sekcije ide u <izlaz>/<sekcija>-<širina>.png.
// Pokretanje: node alati/test-prije-poslije.js <izlaz> <fontovi> [sekcija …]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@' + 'c'.repeat(40) + '/';
const IDS = { brojke: 'jpb-brojke', ratrak: 'jr-ratrak', suvenirnica: 'jsu-suvenirnica', bar: 'jb-bar', gondola: 'jg-gondola', depo: 'jsd-depo', park: 'jsb-park', sankaliste: 'jsk-sankaliste' };
const ATTR = { brojke: 'data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"' };
const LIST = process.argv.slice(4).length ? process.argv.slice(4) : Object.keys(IDS);
fs.mkdirSync(OUT, { recursive: true });
const report = {};

(async () => {
  const browser = await chromium.launch();
  for (const sec of LIST) {
    report[sec] = {};
    for (const [vw, vh] of [[1440, 900], [375, 812]]) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 761, hasTouch: vw < 761, reducedMotion: 'reduce' });
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
          const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : 'image/jpeg';
          return route.fulfill({ contentType: ct, body: fs.readFileSync(f) });
        }
        if (u.origin === SITE && (/wp-json/.test(u.pathname) || u.searchParams.get('rest_route'))) return route.fulfill({ contentType: 'application/json', body: '[]' });
        if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;background:#fff"><div id="${IDS[sec]}" ${ATTR[sec] || ''}></div><script src="${CDN}jahorina-home-sections/${sec}/${sec}.js" defer></script></body></html>` });
        return route.abort();
      });
      await p.goto(SITE + '/');
      await p.waitForSelector('#' + IDS[sec] + ' h2');
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
      await p.waitForTimeout(1200);
      const info = await p.evaluate((id) => {
        const r = document.getElementById(id);
        return {
          h2: [...r.querySelectorAll('h2')].map((h) => h.textContent),
          h3: [...r.querySelectorAll('h3')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
          alt: [...r.querySelectorAll('img')].map((i) => (i.getAttribute('src') || '').split('/').pop() + ' → "' + i.getAttribute('alt') + '"'),
          cijene: (r.querySelector('a[data-jsk="cijene"]') || {}).href || '',
          fontLinks: document.querySelectorAll('link[href*="fonts.googleapis.com"]').length,
        };
      }, IDS[sec]);
      info.errors = errors;
      report[sec][vw] = info;
      await p.locator('#' + IDS[sec]).screenshot({ path: path.join(OUT, `${sec}-${vw}.png`) });
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'izvjestaj.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})();
