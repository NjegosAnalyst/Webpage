// Simulacija sajta za "Kupi ski pass" na telefonu (sajt se iz cloud okruženja ne može otvoriti).
// Stranica sa menijem (kao naš header iz WordPress menija), blokom Planina u brojkama i footerom; skipass.js i brojke.js
// se služe lokalno. Pokretanje: node test-skipass.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
fs.mkdirSync(OUT, { recursive: true });

const MENUS = {
  shop: '<a href="/o-nama/">O nama</a><a href="/cjenovnik-zima/">Cjenovnik</a><a href="https://webshop.oc-jahorina.com/">Web shop</a>',
  skipass: '<a href="/o-nama/">O nama</a><a href="/ski-pass-online/">Ski pass</a>',
  nema: '<a href="/o-nama/">O nama</a><a href="/galerija/">Galerija</a>',
};
function page({ menu = 'shop', attrs = '', admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;font-family:Arial,sans-serif;background:#fff;color:#444} a{color:#0095eb;text-decoration:underline}
  .jf-header{position:sticky;top:0;z-index:5;height:56px;background:#0a1120;display:flex;gap:12px;align-items:center;padding:0 16px}
  .jf-header a{color:#fff;font-size:12px} .hero{height:110vh;background:linear-gradient(#0c1424,#18263f)}
  .jf-wp{height:600px;background:#0a1120;color:#fff;padding:20px} input{margin:20px}</style></head>
  <body class="home${admin ? ' logged-in' : ''}"><header class="jf-header"><nav class="jf-nav">${MENUS[menu]}</nav></header>
  <div class="hero"></div>
  <div class="elementor-widget-html"><div id="jpb-brojke" data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"></div>
  <script src="${CDN}jahorina-home-sections/brojke/brojke.js" defer></script></div>
  <div style="height:400px;background:#0a1120"><input id="polje" placeholder="pretraga"></div>
  <div class="elementor-widget-html"><div id="jks-skipass" ${attrs}></div><script src="${CDN}jahorina-home-sections/skipass/skipass.js" defer></script></div>
  <footer class="jf-wp">Footer: kontakti</footer></body></html>`;
}
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}
async function open(browser, { vw = 390, vh = 844, menu = 'shop', attrs = '', admin = false, reduced = false, pth = '/' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, hasTouch: vw < 761, isMobile: vw < 761, deviceScaleFactor: 2, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errors = [], logs = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'warning') logs.push(m.text()); if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await p.route('**/*', async (route) => {
    const url = route.request().url(), u = new URL(url);
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: FONTS ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '' });
    if (u.host === 'fonts.gstatic.com') {
      const f = FONTS && path.join(FONTS, u.pathname.slice(1).replace(/\//g, '_'));
      return f && fs.existsSync(f) ? route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : route.abort();
    }
    if (url.startsWith(CDN)) {
      const f = path.join(REPO, url.slice(CDN.length).split('?')[0]);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nema' });
      return route.fulfill({ contentType: f.endsWith('.js') ? 'application/javascript' : 'image/webp', body: fs.readFileSync(f) });
    }
    if (u.origin === SITE && /wp-json/.test(u.pathname)) return route.fulfill({ contentType: 'application/json', body: '[]' });
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ menu, attrs, admin }) });
    return route.abort();
  });
  await p.addInitScript(() => { window.__ev = []; window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }); });
  await p.goto(SITE + pth);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  return { ctx, p, errors, logs };
}
const st = (p) => p.evaluate(() => {
  const d = document.getElementById('jks-dock'); if (!d) return { exists: false };
  const a = d.querySelector('a'), r = a.getBoundingClientRect(), cs = getComputedStyle(a);
  return { exists: true, on: d.classList.contains('is-on'), display: getComputedStyle(d).display, op: +cs.opacity, href: a.getAttribute('href'), target: a.target || '',
    tab: a.getAttribute('tabindex'), bottom: Math.round(innerHeight - r.bottom), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
    text: a.textContent.replace(/\s+/g, ' ').trim(), mini: d.classList.contains('is-mini'), right: Math.round(innerWidth - r.right), font: getComputedStyle(a.querySelector('b')).fontFamily, scrollW: document.documentElement.scrollWidth };
});
const scrollTo = async (p, y) => { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(700); };

(async () => {
  const browser = await chromium.launch();
  let r, s;

  console.log('\n1) Telefon 390: link iz menija (Web shop), pojavljivanje i sklanjanje');
  r = await open(browser);
  s = await st(r.p);
  check('nema JS grešaka', r.errors.length === 0, r.errors);
  check('na vrhu (hero) dugme nije prikazano', s.exists && !s.on && s.op < .05 && s.tab === '-1', s);
  check('link iz menija: Web shop (spoljni → nova kartica)', s.href === 'https://webshop.oc-jahorina.com/' && s.target === '_blank', [s.href, s.target]);
  await scrollTo(r.p, 1100);
  s = await st(r.p);
  check('ispod hero-a: dugme klizne odozdo', s.on && s.op > .95 && s.tab === '0', s);
  check('kompaktna pilula dolje desno (16 px), 56 px, ne preko cijele širine', s.bottom === 16 && s.right === 16 && s.h === 56 && s.w < 230 && s.w > 150, [s.bottom, s.right, s.w, s.h]);
  check('tekst: Ski pass · Kupi online, Archivo', s.text === 'Ski passKupi online' && /Archivo/.test(s.font), [s.text, s.font]);
  await scrollTo(r.p, 1500);
  s = await st(r.p);
  check('skrol nadolje (čitanje) → skupi se u krug', s.mini && s.w === 56 && s.on, [s.mini, s.w]);
  await r.p.screenshot({ path: path.join(OUT, '1b-telefon-krug.png') });
  await scrollTo(r.p, 1250);
  s = await st(r.p);
  check('skrol nagore → raširi se', !s.mini && s.w > 150, [s.mini, s.w]);
  check('bez horizontalnog skrola', s.scrollW <= 390, s.scrollW);
  await r.p.screenshot({ path: path.join(OUT, '1-telefon-dugme.png') });
  await r.p.click('#jks-dock a');
  const ev = await r.p.evaluate(() => window.__ev);
  check('GA: skipass_klik (mjesto: dock)', ev.some((e) => e[1] === 'skipass_klik' && e[2].mjesto === 'dock' && e[2].jezik === 'sr'), ev);
  await r.p.focus('#polje'); await r.p.waitForTimeout(300);
  s = await st(r.p);
  check('tastatura (fokus u polju) → dugme se skloni', !s.on, s.on);
  await r.p.evaluate(() => document.activeElement.blur()); await scrollTo(r.p, 1100);
  await r.p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; }); await r.p.waitForTimeout(300);
  s = await st(r.p);
  check('prozor preko ekrana (skrol zaključan) → dugme se skloni', !s.on, s.on);
  await r.p.evaluate(() => { document.documentElement.style.overflow = ''; }); await r.p.waitForTimeout(300);
  await scrollTo(r.p, 1100);   // fokus u polju je pomjerio stranicu
  check('prozor zatvoren → dugme se vrati', (await st(r.p)).on, '');
  await scrollTo(r.p, 99999);
  s = await st(r.p);
  check('footer na ekranu → dugme se skloni (ne prekriva kontakte)', !s.on, s.on);
  await scrollTo(r.p, 0);
  check('nazad na vrh → skriveno', !(await st(r.p)).on, '');
  await r.ctx.close();

  console.log('\n2) Računar i tablet: ne prikazuje se');
  for (const vw of [1440, 820]) {
    r = await open(browser, { vw, vh: 900 });
    await scrollTo(r.p, 1100);
    s = await st(r.p);
    check(vw + ' px: dugme se ne prikazuje', s.display === 'none', s.display);
    await r.ctx.close();
  }

  console.log('\n3) Link: stavka "Ski pass", data-link, bez linka');
  r = await open(browser, { menu: 'skipass' });
  s = await st(r.p);
  check('stavka menija "Ski pass" (isti domen → ista kartica)', s.href === SITE + '/ski-pass-online/' && s.target === '', [s.href, s.target]);
  await r.ctx.close();
  r = await open(browser, { menu: 'shop', attrs: 'data-link="/kupi-online/" data-podnaslov="Bez čekanja"' });
  s = await st(r.p);
  check('data-link i data-podnaslov imaju prednost', s.href === '/kupi-online/' && /Bez čekanja$/.test(s.text), [s.href, s.text]);
  await r.ctx.close();
  r = await open(browser, { menu: 'nema', admin: true });
  await r.p.waitForTimeout(1800);
  s = await st(r.p);
  check('bez linka: nema dugmeta, admin vidi razlog u konzoli', !s.exists && r.logs.some((l) => /nema linka/.test(l)), [s.exists, r.logs]);
  await r.ctx.close();

  console.log('\n4) EN i smanjeno kretanje');
  r = await open(browser, { pth: '/en/' });
  await scrollTo(r.p, 1100);
  s = await st(r.p);
  check('EN: Ski pass · Buy online', s.text === 'Ski passBuy online', s.text);
  await r.ctx.close();
  r = await open(browser, { reduced: true });
  await scrollTo(r.p, 1100);
  s = await st(r.p);
  check('smanjeno kretanje: prikazano, bez greške', s.on && s.op > .95 && r.errors.length === 0, [s.on, s.op]);
  await r.ctx.close();

  console.log('\n5) Uski telefon 340');
  r = await open(browser, { vw: 340, vh: 700 });
  await scrollTo(r.p, 1100);
  s = await st(r.p);
  check('340 px: stane, bez skrola', s.w < 230 && s.scrollW <= 340, [s.w, s.scrollW]);
  await r.p.screenshot({ path: path.join(OUT, '2-telefon-340.png') });
  await r.ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
