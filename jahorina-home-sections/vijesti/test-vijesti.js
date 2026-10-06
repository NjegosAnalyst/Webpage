// Simulacija sajta za blok vijesti (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com: stranica, WordPress REST API, slike i fontovi se služe lokalno.
// Pokretanje: node test-vijesti.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
fs.mkdirSync(OUT, { recursive: true });

const img = {
  promo: fs.readFileSync(path.join(REPO, 'project/assets/jahorina-hero.jpg')),
  noc: fs.readFileSync(path.join(REPO, 'jahorina-hero-v2/assets/jahorina-noc.jpg')),
  nocWebp: fs.readFileSync(path.join(REPO, 'jahorina-hero-v2/assets/jahorina-noc.webp')),
};

// objave u obliku kao ih vraća WordPress (qTranslate-XT oznake u tekstu)
const media = {
  11: { id: 11, source_url: SITE + '/wp-content/uploads/2026/08/skijas.jpg', media_details: { sizes: {
    thumbnail: { width: 150, height: 150, source_url: SITE + '/wp-content/uploads/2026/08/skijas-150x150.jpg' },
    medium_large: { width: 768, height: 512, source_url: SITE + '/wp-content/uploads/2026/08/skijas-768x512.jpg' },
    large: { width: 1024, height: 683, source_url: SITE + '/wp-content/uploads/2026/08/skijas-1024x683.jpg' },
    full: { width: 2560, height: 1707, source_url: SITE + '/wp-content/uploads/2026/08/skijas.jpg' } } } },
  12: { id: 12, source_url: SITE + '/wp-content/uploads/2026/09/gondola.jpg', media_details: { sizes: {
    thumbnail: { width: 150, height: 150, source_url: SITE + '/wp-content/uploads/2026/09/gondola-150x150.jpg' },
    large: { width: 1024, height: 683, source_url: SITE + '/wp-content/uploads/2026/09/gondola-1024x683.jpg' } } } },
  13: { id: 13, source_url: SITE + '/wp-content/uploads/2026/07/atrakcije.jpg', media_details: { sizes: {
    thumbnail: { width: 150, height: 150, source_url: SITE + '/wp-content/uploads/2026/07/atrakcije-150x150.jpg' } } } },
};
const posts = [
  { id: 101, date: '2026-08-10T09:12:00', link: SITE + '/obavjestenje-otvaranje-ponuda/', featured_media: 11,
    title: { rendered: '[:SH]Obavještenje[:en]Notice[:]' },
    excerpt: { rendered: '<p>[:SH]Obavještenje U prostorijama Akcionarskog društva Olimpijski centar &#8222;Jahorina&#8220; Pale &#8211; Ruski dom, Jahorina bb, u utorak 18.08. 2026. godine u 12,00 časova pristupiće se otvaranju ponuda koje su pristigle na javni poziv za nabavku usluga održavanja [&hellip;][:en]Notice On Tuesday, 18 August 2026 at 12:00, the bids received in response to the public call for maintenance services will be opened at the premises of Olympic Centre Jahorina, Ruski dom, Jahorina bb [&hellip;][:]</p>\n' } },
  { id: 102, date: '2026-07-21T15:40:00', link: SITE + '/izmjena-radnog-vremena/', featured_media: 13,
    title: { rendered: '[:SH]Izmjena radnog vremena ljetnih atrakcija[:en]Change of summer attractions opening hours[:]' },
    excerpt: { rendered: '<p>[:SH]OBAVJEŠTENJE Zbog remonta žičare u srijedu 22.07. i četvrtak 23.07. doći će do izmjene radnog vremena. Sve ljetnje atrakcije biće dostupne od 10 do 17 časova.[:en]NOTICE Due to scheduled maintenance, the operating hours of our summer attractions will change on Wednesday, July 22, and Thursday, July 23.[:]</p>' } },
  { id: 103, date: '2026-09-15T10:00:00', link: SITE + '/pretprodaja-ski-karata/', featured_media: 12,
    title: { rendered: '[:SH]Pretprodaja ski karata za sezonu 2026/27 počinje 20. septembra[:en]Ski pass pre-sale for the 2026/27 season starts on 20 September[:]' },
    excerpt: { rendered: '<p>[:SH]Pretprodaja počinje 20. septembra.[:en]Pre-sale starts on 20 September.[:]</p>' } },
  { id: 104, date: '2026-09-04T08:00:00', link: SITE + '/odluka-o-cijenama/', featured_media: 0,
    title: { rendered: '[:SH]Odluka o cijenama usluga za zimsku sezonu 2026/27[:en]Decision on service prices for the 2026/27 winter season[:]' },
    excerpt: { rendered: '<p>[:SH]Skupština društva usvojila je odluku o cijenama.[:en]The shareholders adopted the price decision.[:]</p>' } },
];
// redoslijed kao na sajtu: najnovije prvo
let sorted = [posts[2], posts[3], posts[0], posts[1]];
const noticeFirst = [Object.assign({}, posts[0], { date: '2026-10-02T09:12:00' }), posts[2], posts[3], posts[1]];

const theme = `
  /* grubo oponašanje Betheme/Elementor stilova koji bi mogli smetati */
  body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff}
  h2{font-size:30px;line-height:40px;font-weight:400;color:#161922!important;margin-bottom:15px}   /* Betheme na pravom sajtu nameće boju naslova */
  h3{font-size:25px;line-height:29px;color:#161922;margin-bottom:15px;text-transform:uppercase}
  a{color:#0095eb;text-decoration:underline} a:hover{color:#007cc3}
  p{margin:0 0 15px} img{max-width:100%;height:auto}
  .hero{height:260px;background:#0A1120 url(${SITE}/wp-content/uploads/2026/09/jahorina-noc.webp) center/cover}
  .after{padding:60px 20px;color:#444} .boxed{max-width:1140px;margin:40px auto;padding:0 10px}`;
function page(boxed) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${theme}</style></head><body class="home page logged-in"><div class="hero"></div>
  <div class="${boxed ? 'boxed' : ''}"><div class="elementor-widget-html"><div id="jv-vijesti"><a href="${SITE}/category/vijesti/">Sve vijesti</a></div>
  <script src="${SITE}/__test/vijesti.js" defer></script></div></div>
  <div class="after">Trenutno nema događaja...</div></body></html>`;
}

async function run(name, { url, viewport, boxed = false, rest = 'ok', fullPage = false, order = 'normal' }) {
  sorted = order === 'notice' ? noticeFirst : [posts[2], posts[3], posts[0], posts[1]];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const log = [];
  p.on('console', (m) => log.push(m.type() + ': ' + m.text()));
  p.on('pageerror', (e) => log.push('PAGEERROR: ' + e.message));
  await p.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'fonts.googleapis.com') {
      const css = FONTS ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '';
      return route.fulfill({ contentType: 'text/css', body: css });
    }
    if (u.host === 'fonts.gstatic.com') {
      const f = FONTS && path.join(FONTS, u.pathname.slice(1).replace(/\//g, '_'));
      return f && fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
    }
    if (u.origin !== SITE) return route.abort();
    const pth = u.pathname, q = u.searchParams;
    const restPath = q.get('rest_route') || (pth.match(/\/wp-json(\/.*)$/) || [])[1];
    if (pth === '/__test/vijesti.js') return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vijesti.js')) });
    if (restPath) {
      log.push('REST ' + pth + u.search.slice(0, 90));
      if (rest === 'fail') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (rest === 'noen' && pth.startsWith('/en/')) return route.fulfill({ status: 404, contentType: 'text/html', body: '<html>404</html>' });
      if (restPath.startsWith('/wp/v2/categories')) return route.fulfill({ json: q.get('slug') === 'vijesti' ? [{ id: 7 }] : [] });
      if (restPath.startsWith('/wp/v2/posts')) {
        const n = +q.get('per_page') || 10;
        const embed = rest !== 'noembed';
        return route.fulfill({ json: sorted.slice(0, n).map((x) => Object.assign({}, x, embed && x.featured_media ? { _embedded: { 'wp:featuredmedia': [media[x.featured_media]] } } : {})) });
      }
      if (restPath.startsWith('/wp/v2/media')) return route.fulfill({ json: q.get('include').split(',').map((id) => media[id]).filter(Boolean) });
      return route.fulfill({ status: 404, json: { code: 'rest_no_route' } });
    }
    if (pth.startsWith('/wp-content/uploads/')) {
      if (pth.endsWith('.webp')) return route.fulfill({ contentType: 'image/webp', body: img.nocWebp });
      return route.fulfill({ contentType: 'image/jpeg', body: /gondola/.test(pth) ? img.noc : img.promo });
    }
    return route.fulfill({ contentType: 'text/html', body: page(boxed) });
  });
  await p.goto(url);
  await p.waitForSelector('#jv-vijesti .jv-slide, #jv-vijesti .jv-note', { timeout: 8000 });
  await p.evaluate(() => document.fonts.ready);
  await p.locator('#jv-vijesti').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);   // ulazna animacija kartica
  const info = await p.evaluate(() => {
    const r = document.getElementById('jv-vijesti');
    return {
      boxed: r.classList.contains('jv--boxed'),
      titles: [...r.querySelectorAll('h3')].map((h) => h.textContent),
      chips: [...r.querySelectorAll('.jv-chip')].map((c) => c.textContent),
      dates: [...r.querySelectorAll('time')].map((t) => t.textContent),
      links: [...r.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      excerpt: (r.querySelector('.jv-slide.is-on p') || {}).textContent,
      active: (r.querySelector('.jv-slide.is-on h3') || {}).textContent,
      note: (r.querySelector('.jv-note') || {}).textContent,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      h2: getComputedStyle(r.querySelector('h2')).fontFamily + ' ' + getComputedStyle(r.querySelector('h2')).color,
      bleed: (() => { const b = r.getBoundingClientRect(); return Math.round(b.left) + '/' + Math.round(b.width) + ' od ' + document.documentElement.clientWidth; })(),
    };
  });
  const file = path.join(OUT, name + '.png');
  if (fullPage) await p.screenshot({ path: file, fullPage: true });
  else await p.locator('#jv-vijesti').screenshot({ path: file });
  console.log('\n== ' + name + '\n' + JSON.stringify(info, null, 1) + '\n' + log.filter((l) => !/^debug/.test(l)).join('\n'));
  await browser.close();
}

(async () => {
  await run('1-desktop-sr', { url: SITE + '/pocetna-zima/', viewport: { width: 1440, height: 900 } });
  await run('2-telefon-sr', { url: SITE + '/pocetna-zima/', viewport: { width: 390, height: 844 } });
  await run('3-desktop-en-bez-en-rest', { url: SITE + '/en/pocetna-zima/', viewport: { width: 1280, height: 860 }, rest: 'noen' });
  await run('4-boxed-bez-embed', { url: SITE + '/pocetna-zima/', viewport: { width: 1366, height: 860 }, boxed: true, rest: 'noembed', fullPage: true });
  await run('5-greska', { url: SITE + '/pocetna-zima/', viewport: { width: 1280, height: 800 }, rest: 'fail' });
  await run('7-obavjestenje-prvo', { url: SITE + '/pocetna-zima/', viewport: { width: 1440, height: 900 }, order: 'notice' });
  await run('6-tablet-sr', { url: SITE + '/pocetna-zima/', viewport: { width: 820, height: 1180 } });
})().catch((e) => { console.error(e); process.exit(1); });
