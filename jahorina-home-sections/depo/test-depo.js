// Simulacija sajta za sekciju Ski depo (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica ski depoa), depo.js,
// gondola.js (iznad, za razmak), fotografije i fontovi se služe lokalno. v2 "Bijela vrata" (30. 10. 2026).
// Pokretanje: node test-depo.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2024/11/';
fs.mkdirSync(OUT, { recursive: true });

const theme = `
  /* grubo oponašanje Betheme/Elementor stilova koji bi mogli smetati */
  body{margin:0;font-family:Arial,sans-serif;color:#626262;background:#fff}
  h2{font-size:30px;line-height:40px;font-weight:400;color:#161922!important;margin-bottom:15px}
  a{color:#0095eb;text-decoration:underline} a:hover{color:#007cc3}
  ul,ol{list-style:disc;margin:0 0 15px 30px} li{margin-bottom:8px}
  button{background:#0095eb;color:#fff;padding:10px 20px;border:1px solid red}
  p{margin:0 0 15px} img{max-width:100%;height:auto}
  .before,.after{padding:60px 20px;color:#444} .boxed{max-width:1140px;margin:0 auto;padding:0 10px}`;
function page({ attrs = '', gondola = false, admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Olimpijski bar (iznad)</div>
  ${gondola ? `<div class="boxed"><div class="elementor-widget-html"><div id="jg-gondola"></div>
    <script src="${CDN}jahorina-home-sections/gondola/gondola.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jsd-depo" ${attrs}><a href="/ski-depo/">Ski depo</a></div>
    <script src="${CDN}jahorina-home-sections/depo/depo.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice (screenshot korisnika, 9. 10. 2026) kako ga WordPress vraća
const B = (t) => `<p><strong>${t}</strong></p>`;
const STEPS = (place, dep) => `<h2>Kako do pristupa ski depou?</h2><ol><li><strong>Javite se na vidno obilježenu ski kasu na polazu gondole ${place}.</strong></li>
<li><strong>Prodavac na ski kasi kodiraće i izdati kartu za traženi period korišćenja ski depoa (depozit za kartu iznosi ${dep} KM).</strong></li>
<li><strong>Depo se otvara jednostavno – skeniranjem Vaše ski karte na uređaju koji se nalazi unutar polazne stanice gondole ${place}.</strong></li></ol>`;
const FEAT = (heat = true) => `<h2>Napredan sistem za vašu udobnost</h2><p>Naši ski depoi su opremljeni:</p><p>1. <strong>Ventilacijom</strong> za svježinu opreme</p>
<p>2. <strong>Sistemom za sušenje</strong>, kako bi oprema bila suva i spremna za upotrebu</p>${heat ? '<p>3. <strong>Grijanjem</strong>, osiguravajući udobnost i toplinu opreme</p>' : ''}
<p>Olakšajte svoj boravak na stazi i osigurajte sigurno skladištenje vaše opreme!</p>`;
const CONTENT = {
  stranica: `<h1>Ski depoi – sigurno i praktično čuvanje vaše opreme!</h1>${B('Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.')}
${B('Cijena za korištenje ski depoa za jedan dan iznosi 15 KM po ski depou.')}${B('U jedan ski depo možete smjestiti dva puna seta skijaške ili snowboarding opreme, čineći ga idealnim rješenjem za porodice i grupe!')}
${STEPS('Poljice', '10,00')}${FEAT()}<img src="${UP}depo-sala-1024x683.jpg" srcset="${UP}depo-sala-1024x683.jpg 1024w, ${UP}depo-sala.jpg 1600w" alt="Ski depo"><img src="${UP}ikona.png" width="64" alt="">`,
  // nova cijena i depozit, tri seta, druga gondola, bez grijanja
  izmjene: `${B('Ski depo je najjednostavniji način da vaša oprema ostane na planini.')}${B('Cijena za jedan dan iznosi 18 KM po ski depou.')}
${B('U jedan ski depo možete smjestiti tri puna seta skijaške opreme.')}${STEPS('Ogorjelica', '20,00')}${FEAT(false)}`,
  bezcijene: `${B('Ski depoi su uskoro dostupni na polazu gondole Poljice, više informacija uskoro.')}`,
  qtranslate: `<p>[:SH]<strong>Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.</strong>[:en]<strong>Ski lockers are the easiest way to keep your gear safe on the mountain.</strong>[:]</p>
<p>[:SH]Cijena za korištenje ski depoa za jedan dan iznosi 15 KM po ski depou.[:en]The price for one day is 15 KM per locker.[:]</p>
<p>[:SH]U jedan ski depo možete smjestiti dva puna seta skijaške opreme.[:en]One locker fits two full sets of ski or snowboard gear.[:]</p>
<ol><li>[:SH]Javite se na ski kasu na polazu gondole Poljice.[:en]Visit the ski ticket office at the Poljice gondola base station.[:]</li>
<li>[:SH]Depozit za kartu iznosi 10,00 KM.[:en]The card deposit is 10.00 KM.[:]</li></ol>
<p>[:SH]Ventilacija, sušenje i grijanje.[:en]Ventilation, drying and heating.[:]</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'stranica', slug = 'ski-depo', gondola = false, admin = false, touch = false, wait = 2400 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const p = await ctx.newPage();
  const errors = [], rest = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|GL Driver|WebGL/.test(m.text())) errors.push(m.text()); });
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
      const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.webp') ? 'image/webp' : 'application/octet-stream';
      return route.fulfill({ contentType: ct, body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } });
    }
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/uploads/'))
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike/depo-ormaric-900.webp')) });
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      const q = decodeURIComponent(u.pathname + u.search);
      rest.push(q);
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/pages/.test(q)) {
        if (/slug=vip-gondola/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // gondola iznad: ugrađeni tekst
        const pg = { id: 77, link: SITE + '/' + slug + '/', slug, title: { rendered: wp === 'qtranslate' ? '[:SH]Ski depo[:en]Ski lockers[:]' : 'Ski depo' },
          content: { rendered: CONTENT[wp === 'upozorenje' ? 'stranica' : wp] || '' } };
        const other = { id: 12, link: SITE + '/depozit-opreme/', slug: 'x', title: { rendered: 'Iznajmljivanje opreme' }, content: { rendered: '<p>Depozit za opremu.</p>' } };
        if (wp === 'nema') return route.fulfill({ contentType: 'application/json', body: '[]' });
        if (/search=depo/.test(q)) return route.fulfill({ contentType: 'application/json', body: JSON.stringify([other, pg]) });
        if (!new RegExp('slug=' + slug + '(&|$)').test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });
        const pre = wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '';
        return route.fulfill({ contentType: 'application/json', body: pre + JSON.stringify([pg]) });
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, gondola, admin }) });
    return route.abort();
  });
  await p.addInitScript(({ mode }) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, { mode: ga });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jsd-depo .jsd-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jsd-depo').scrollIntoViewIfNeeded();
  // ulazak: kadar .5 s, vrata se zatvore ~.65 s posle ulaska (1.1 s)
  if (wait) await p.waitForTimeout(Math.min(wait, 2400));
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jsd-depo'), q = (s) => r.querySelector(s), cs = (e) => getComputedStyle(e);
    const im = q('.jsd-shot img');
    return {
      h1: document.querySelectorAll('h1').length, h2: q('h2').textContent.replace(/\s+/g, ' ').trim(), h3: [...r.querySelectorAll('h3')].map((e) => e.textContent),
      kicker: q('.jsd-kicker').textContent, lead: q('.jsd-lead').textContent,
      price: q('.jsd-pv').textContent + ' ' + q('.jsd-price i').textContent, priceA: q('.jsd-price').getAttribute('aria-label'),
      sets: q('.jsd-sets b').textContent, setsSub: q('.jsd-sets span').textContent,
      feat: [...r.querySelectorAll('.jsd-feat li')].filter((e) => cs(e).display !== 'none').map((e) => e.textContent).join('|'),
      steps: [...r.querySelectorAll('.jsd-steps li')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
      more: q('a[data-jsd="stranica"]').href, map: q('a[data-jsd="mapa"]').href,
      why: (q('.jsd-why') || {}).textContent || '',
      ajar: q('.jsd-hinge').classList.contains('is-ajar'), on: r.classList.contains('jsd-on'), anim: r.classList.contains('jsd-anim'),
      doorT: cs(q('.jsd-door')).transform, doorBg: cs(q('.jsd-door')).backgroundImage,
      alt: im.alt, lazy: im.getAttribute('loading'), dims: im.getAttribute('width') + 'x' + im.getAttribute('height'), imgOk: im.complete && im.naturalWidth > 0,
      rootW: r.getBoundingClientRect().width, docW: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth,
      small: [...r.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim() && cs(e).display !== 'none' && parseFloat(cs(e).fontSize) < 12).map((e) => e.className + ':' + e.textContent.trim()),
      caps: [...r.querySelectorAll('*')].filter((e) => cs(e).textTransform === 'uppercase' && e.textContent.trim()).map((e) => e.className),
      blur: [...r.querySelectorAll('*')].some((e) => { const v = cs(e).backdropFilter || cs(e).webkitBackdropFilter; return v && v !== 'none'; }),
      ld: (document.getElementById('jsd-ld') || {}).text || '',
      frameH: r.querySelector('.jsd-frame').getBoundingClientRect().height,
    };
  });
}
(async () => {
  const browser = await chromium.launch();
  let r, S;

  console.log('SR, računar 1440, WordPress stranica');
  r = await open(browser, {});
  S = await state(r.p);
  check('SEO: 0 × H1, H2 „Ostavite opremu na planini“, H3 „Kako do depoa“', S.h1 === 0 && S.h2 === 'Ostavite opremu na planini' && S.h3.join() === 'Kako do depoa', [S.h1, S.h2, S.h3]);
  check('mali tekst = naslov stranice prije crte', S.kicker === 'Ski depo', S.kicker);
  check('uvod sa stranice', S.lead === 'Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.', S.lead);
  check('vrata: 15 KM po danu (i za čitač ekrana)', S.price === '15 KM' && /15 KM/.test(S.priceA), [S.price, S.priceA]);
  check('vrata: 2 kompletna seta, za dvije osobe', S.sets === '2 kompletna seta opreme' && /dvije osobe$/.test(S.setsSub), [S.sets, S.setsSub]);
  check('vrata: sušenje, grijanje, ventilacija', S.feat === 'Sušenje|Grijanje|Ventilacija', S.feat);
  check('koraci redom, mjesto i depozit iz teksta', S.steps === '1Ski kasana polazu gondole Poljice | 2Kartica depoadepozit 10 KM | 3Skenirajte karticuu polaznoj stanici', S.steps);
  check('linkovi: stranica i mapa', /\/ski-depo\/$/.test(S.more) && /google\.com\/maps/.test(S.map), [S.more, S.map]);
  check('vrata su svijetla (biser-bijela površina)', /rgb\(249, 251, 252\)/.test(S.doorBg), S.doorBg);
  check('ulazak: vrata se zatvore', S.on && !S.ajar && (S.doorT === 'none' || /matrix3d\(1, 0, -?0, 0, 0, 1, 0, 0, -?0, 0, 1, 0/.test(S.doorT) || S.doorT === 'matrix(1, 0, 0, 1, 0, 0)'), [S.on, S.ajar, S.doorT]);
  // loading: SEO blok postavi lazy, a test (i predučitavanje ~2 ekrana ranije) ga prebaci na eager
  check('fotografija: alt, lazy (prebačeno na eager), dimenzije, učitana', /ormarić|depo 61/i.test(S.alt) && /^(lazy|eager)$/.test(S.lazy) && S.dims === '900x1349' && S.imgOk, [S.alt, S.lazy, S.dims, S.imgOk]);
  check('bez velikih slova i teksta ispod 12 px', S.caps.length === 0 && S.small.length === 0, [S.caps, S.small]);
  check('puna širina, bez vodoravnog skrola', Math.abs(S.rootW - S.docW) < 1 && S.scrollW <= S.docW, [S.rootW, S.docW, S.scrollW]);
  check('schema.org: usluga, 15 BAM po danu', /"price":"15"/.test(S.ld) && /BAM/.test(S.ld), S.ld.slice(0, 80));
  check('bez 3D (three.js se ne učitava)', !r.rest.some((x) => /three|depo-3d/.test(x)) && !(await r.p.evaluate(() => !!document.querySelector('#jsd-depo canvas'))), '');
  await r.p.hover('#jsd-depo .jsd-door'); await r.p.waitForTimeout(800);
  const hv = await r.p.evaluate(() => getComputedStyle(document.querySelector('#jsd-depo .jsd-door')).transform);
  check('mišem se vrata odškrinu', hv !== 'none' && hv !== S.doorT, hv);
  await r.p.locator('#jsd-depo').screenshot({ path: path.join(OUT, '1-racunar.png') });
  await r.p.click('#jsd-depo a[data-jsd="mapa"]');
  const ev = await r.p.evaluate(() => window.__ev);
  check('GA: depo_klik (mapa)', ev.some((e) => e[1] === 'depo_klik' && e[2].cilj === 'mapa'), ev);
  check('bez grešaka u konzoli', r.errors.length === 0, r.errors);
  await r.ctx.close();

  console.log('Nova cijena, depozit, tri seta, druga gondola, bez grijanja');
  r = await open(browser, { wp: 'izmjene' });
  S = await state(r.p);
  check('vrata i koraci prate stranicu', S.price === '18 KM' && S.sets === '3 kompletna seta opreme' && /tri osobe$/.test(S.setsSub) && S.feat === 'Sušenje|Ventilacija' && /Ogorjelica/.test(S.steps) && /20 KM/.test(S.steps), [S.price, S.sets, S.feat, S.steps]);
  await r.ctx.close();

  console.log('PHP upozorenje ispred JSON-a → podaci se ipak pročitaju');
  r = await open(browser, { wp: 'upozorenje', admin: true });
  S = await state(r.p);
  check('15 KM i bez poruke za admina', S.price === '15 KM' && !S.why, [S.price, S.why]);
  await r.ctx.close();

  console.log('Stranica bez cijene / greška WordPressa (admin vidi razlog, posjetilac ugrađeni sadržaj)');
  r = await open(browser, { wp: 'bezcijene', admin: true });
  S = await state(r.p);
  check('bez cijene: ugrađenih 15 KM, admin vidi šta fali', S.price === '15 KM' && /cijena/.test(S.why), S.why);
  await r.ctx.close();
  r = await open(browser, { wp: 'greska', admin: true });
  S = await state(r.p);
  check('403: ugrađeni sadržaj, admin vidi HTTP 403', S.price === '15 KM' && /HTTP 403/.test(S.why), S.why);
  await r.ctx.close();
  r = await open(browser, { wp: 'greska' });
  S = await state(r.p);
  check('posjetilac ne vidi tehničku poruku', !S.why, S.why);
  await r.ctx.close();

  console.log('Pogrešan slug → stranica sa "depo" u naslovu');
  r = await open(browser, { slug: 'ski-depoi' });
  S = await state(r.p);
  check('nađena preko pretrage', /\/ski-depoi\/$/.test(S.more) && S.price === '15 KM', S.more);
  await r.ctx.close();

  console.log('EN (/en/), qTranslate');
  r = await open(browser, { path: '/en/pocetna-zima/', wp: 'qtranslate' });
  S = await state(r.p);
  check('EN tekst', S.h2 === 'Leave your gear on the mountain' && S.kicker === 'Ski lockers' && S.sets === '2 full sets of gear' && /per day/.test(S.priceA), [S.h2, S.kicker, S.sets]);
  check('EN uvod iz qTranslate', /^Ski lockers are the easiest way/.test(S.lead), S.lead);
  check('EN link stranice /en/', /\/en\/ski-depo\/$/.test(S.more), S.more);
  await r.ctx.close();

  console.log('Smanjeno kretanje: vrata odmah zatvorena, bez klasa za ulazak');
  r = await open(browser, { reduced: true });
  S = await state(r.p);
  check('bez ulaska', !S.anim && !S.ajar, [S.anim, S.ajar]);
  await r.ctx.close();

  console.log('VIP gondola odmah iznad: samo rub između kadrova');
  r = await open(browser, { gondola: true });
  const j = await r.p.evaluate(() => document.getElementById('jsd-depo').classList.contains('jsd--join'));
  check('jsd--join', j, j);
  await r.ctx.close();

  console.log('Ekrani: 1920, 1180, tablet 820, telefon 390 i 360');
  for (const [name, vw, vh, touch] of [['2-racunar-1920', 1920, 1080, false], ['3-laptop-1180', 1180, 800, false], ['4-tablet-820', 820, 1180, true], ['5-telefon-390', 390, 844, true], ['6-telefon-360', 360, 740, true]]) {
    r = await open(browser, { vw, vh, touch });
    S = await state(r.p);
    check(name + ': bez vodoravnog skrola, teksta < 12 px i grešaka', S.scrollW <= S.docW && S.small.length === 0 && r.errors.length === 0, [S.scrollW, S.docW, S.small, r.errors]);
    if (vw <= 760) check(name + ': telefon bez backdrop-filter', !S.blur, S.blur);
    await r.p.locator('#jsd-depo').screenshot({ path: path.join(OUT, name + '.png') });
    await r.ctx.close();
  }

  await browser.close();
  console.log(fails ? '\n' + fails + ' provjera NIJE prošlo' : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
