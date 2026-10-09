// Simulacija sajta za sekciju Ski depo (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica ski depoa), depo.js, depo-3d.js,
// gondola.js (iznad, za razmak i cik-cak), fotografije i fontovi se služe lokalno. 3D se crta softverski (SwiftShader).
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

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'stranica', slug = 'ski-depo', gondola = false, admin = false, touch = false, wait = 6500, nogl = false, low = true } = {}) {
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
  await p.addInitScript(({ mode, nogl, low }) => {
    window.__ev = [];
    window.__JSD_LOW = low;   // softversko crtanje: bez sjenki i zaglađivanja (brže); jedan prolaz je u punom kvalitetu
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    if (nogl) { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/.test(t) ? null : g.apply(this, arguments); }; }
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, { mode: ga, nogl, low });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jsd-depo .jsd-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jsd-depo').scrollIntoViewIfNeeded();
  // 3D + ulazak (vrata, oprema, infografika) ~3,5 s; softversko crtanje (SwiftShader) je sporije, pa se čeka kraj ulaska
  if (wait) {
    await p.waitForFunction(() => { const r = document.getElementById('jsd-depo'); return r.querySelector('.jsd--flat') || (r.querySelectorAll('.jsd-co.is-on').length === 3 && getComputedStyle(r.querySelector('.jsd-tag')).opacity === '1'); }, null, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(Math.min(wait, 1600));
  }
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jsd-depo'), b = r.getBoundingClientRect();
    const h2 = r.querySelector('h2 span');
    const f = r.querySelector('.jsd-frame').getBoundingClientRect(), body = r.querySelector('.jsd-body').getBoundingClientRect();
    const pack = r.querySelector('.jsd-pack').getBoundingClientRect(), acts = r.querySelector('.jsd-acts').getBoundingClientRect(), how = r.querySelector('.jsd-how').getBoundingClientRect();
    const host = r.querySelector('.jsd-3d'), cv = host.querySelector('canvas');
    const hit = (a, c) => a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1;
    const texts = [...r.querySelectorAll('.jsd-kicker, h2 span, .jsd-lead, .jsd-pack, .jsd-how, .jsd-acts')].map((e) => e.getBoundingClientRect());
    const cos = [...r.querySelectorAll('.jsd-co')].map((c) => { const s = c.querySelector('span').getBoundingClientRect(), i = c.querySelector('i').getBoundingClientRect(); return { k: c.dataset.co, on: c.classList.contains('is-on'), off: c.classList.contains('is-off'), s, i, txt: c.querySelector('b').textContent + ' ' + c.querySelector('small').textContent }; });
    const tag = r.querySelector('.jsd-tag'), tb = r.querySelector('.jsd-tag-b').getBoundingClientRect();
    const api = r.__jsd3d;
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      lines: [...r.querySelectorAll('h2 span')].map((s) => s.textContent), outline: r.querySelector('h2 .jsd-o').textContent,
      kicker: r.querySelector('.jsd-kicker').textContent, lead: r.querySelector('.jsd-lead').textContent,
      packH: r.querySelector('.jsd-pk-t').textContent,
      btns: [...r.querySelectorAll('.jsd-it')].map((t) => (t.getAttribute('aria-pressed') === 'true' ? 1 : 0)).join(''),
      fill: r.querySelector('.jsd-fill span').textContent,
      steps: [...r.querySelectorAll('.jsd-steps li')].map((li) => li.querySelector('b').textContent + ' / ' + li.querySelector('small').textContent),
      price: r.querySelector('.jsd-tag-p').textContent, tagOn: getComputedStyle(tag).opacity === '1', tagBox: [Math.round(tb.left), Math.round(tb.top), Math.round(tb.right), Math.round(tb.bottom)],
      tagIn: tb.left >= f.left - 1 && tb.right <= f.right + 1 && tb.top >= f.top - 1,
      cos: cos.map((c) => c.k + (c.on ? '+' : '') + (c.off ? '(-)' : '') + ':' + c.txt),
      coIn: cos.filter((c) => c.on && !c.off).every((c) => c.s.left >= f.left && c.s.right <= f.right + 1 && c.i.top >= f.top && c.i.bottom <= f.bottom),
      coFree: cos.filter((c) => c.on && !c.off).every((c) => !texts.some((t) => hit(c.s, t))),
      coApart: (() => { const v = cos.filter((c) => c.on && !c.off).map((c) => c.s).sort((a, c) => a.top - c.top); return v.every((s, i) => !i || s.top >= v[i - 1].bottom - 1); })(),
      tagFree: !texts.some((t) => hit(tb, t)),
      ready: host.classList.contains('is-ready'), flat: r.querySelector('.jsd-frame').classList.contains('jsd--flat'),
      canvas: cv ? [cv.width, cv.height, Math.round(cv.getBoundingClientRect().width), Math.round(cv.getBoundingClientRect().height)] : null,
      photoOp: getComputedStyle(r.querySelector('.jsd-photo')).opacity,
      has: api ? ['ski', 'boot', 'helmet', 'glove'].map((k) => [0, 1].map((s) => (api.has(k, s) ? 1 : 0)).join('')).join(' ') : '',
      yaw: api ? +api.yaw.toFixed(3) : null,
      page: r.querySelector('a[data-jsd="stranica"]').getAttribute('href'), map: [r.querySelector('a[data-jsd="mapa"]').getAttribute('href'), r.querySelector('a[data-jsd="mapa"]').getAttribute('target')],
      btxt: [...r.querySelectorAll('.jsd-btn')].map((a) => a.innerText.trim()),
      why: (r.querySelector('.jsd-why') || {}).textContent || '',
      hidden: [...r.querySelectorAll('.jsd-up')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      bodyIn: body.left >= f.left - 1 && body.right <= f.right + 1 && body.bottom <= f.bottom + 1,
      packW: Math.round(pack.width), actsW: Math.round(acts.width), howW: Math.round(how.width), packL: Math.round(pack.left), actsL: Math.round(acts.left),
      acts: [...r.querySelectorAll('.jsd-btn')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      fit: [...r.querySelectorAll('.jsd-btn, .jsd-ch, .jsd-steps b')].every((a) => a.scrollWidth <= a.clientWidth + 1) && [...r.querySelectorAll('.jsd-ch')].every((c) => c.getBoundingClientRect().width <= c.nextElementSibling ? 1 : 1),
      chFit: (() => { const ch = [...r.querySelectorAll('.jsd-ch')], it = [...r.querySelectorAll('.jsd-it')]; return ch.every((c, i) => { const a = c.getBoundingClientRect(), t = it[i].getBoundingClientRect(); return a.left >= t.left - 6 && a.right <= t.right + 6; }); })(),
      ld: (() => { try { const j = JSON.parse(document.getElementById('jsd-ld').text); return j['@type'] + ':' + j.offers.priceSpecification.price + ' ' + j.offers.priceSpecification.priceCurrency + '/' + j.offers.priceSpecification.unitText; } catch (e) { return 'nema'; } })(),
    };
  });
}
async function lb(p) {
  return p.evaluate(() => {
    const m = document.getElementById('jsd-lb');
    if (!m) return { shown: 'none' };
    return { shown: getComputedStyle(m).display, src: m.querySelector('img').getAttribute('src').replace(/^.*\//, ''), cap: m.querySelector('figcaption').textContent,
      inside: !!(document.activeElement && document.activeElement.closest('#jsd-lb')), overflow: document.documentElement.style.overflow, focus: document.activeElement.className };
  });
}
const shot = (p, name) => p.locator('#jsd-depo .jsd-frame').screenshot({ path: path.join(OUT, name + '.png'), timeout: 90000 });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  console.log('SR, računar, VIP gondola iznad, uži kontejner teme, GA4 (gtag), WordPress stranica ski depoa');
  let { p, ctx, errors, rest } = await open(browser, { gondola: true });
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('naslov "Ostavite opremu / na planini", kraj iscrtan', S.lines.join('|') === 'Ostavite opremu|na planini' && S.outline === 'na planini', S.lines);
  check('nadnaslov = naslov stranice', S.kicker === 'Ski depo', S.kicker);
  check('uvod = prva rečenica stranice', S.lead === 'Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.', S.lead);
  check('3D spreman: platno preko kadra, fotografija sakrivena', S.ready && !S.flat && S.canvas && S.canvas[2] > 1000 && S.photoOp === '0', [S.ready, S.canvas, S.photoOp]);
  check('set 1 u ormariću i na dugmadi, set 2 prazan; 4 / 8', S.has === '10 10 10 10' && S.btns === '11110000' && S.fill === 'Popunjeno 4 / 8', [S.has, S.btns, S.fill]);
  check('infografika: ventilacija, sušenje, grijanje upaljeni', S.cos.join('|') === 'vent+:Ventilacija za svježinu opreme|dry+:Sušenje oprema suva i spremna|heat+:Grijanje udobnost i toplina', S.cos);
  check('natpisi u kadru, ne preko teksta, jedan ispod drugog', S.coIn && S.coFree && S.coApart, [S.coIn, S.coFree, S.coApart]);
  check('privjesak: 15 KM po danu, vidljiv, u kadru, ne preko teksta', S.price === '15KM' && S.tagOn && S.tagIn && S.tagFree, [S.price, S.tagOn, S.tagBox]);
  check('"U jedan depo stanu dva puna seta"', S.packH === 'U jedan depo stanu dva puna seta', S.packH);
  check('koraci sa stranice: Poljice, depozit 10 KM', S.steps.join('|') === 'Ski kasa / na polazu gondole Poljice|Kartica depoa / depozit 10 KM|Skenirajte kartu / u polaznoj stanici', S.steps);
  check('dugmad: Više o ski depou (stranica) + Lokacija (mapa, nova kartica)', S.btxt.join('|') === 'Više o ski depou|Lokacija' && S.page === SITE + '/ski-depo/' && /google\.com\/maps/.test(S.map[0]) && S.map[1] === '_blank', [S.btxt, S.page, S.map]);
  check('spakuj, koraci i dugmad iste širine, poravnati', S.packW === S.actsW && S.howW === S.actsW && S.packL === S.actsL, [S.packW, S.howW, S.actsW]);
  check('dugmad: isti red, ista širina i visina (44px), natpisi staju', S.acts[0][0] === S.acts[1][0] && S.acts[0][1] === S.acts[1][1] && S.acts[0][2] === 44 && S.fit && S.chFit, [S.acts, S.fit, S.chFit]);
  check('sve vidljivo poslije ulaska, tekst u kadru', S.hidden === 0 && S.bodyIn, [S.hidden, S.bodyIn]);
  check('admin poruka se ne vidi', S.why === '', S.why);
  check('schema.org: usluga 15 BAM po danu', S.ld === 'Service:15 BAM/dan', S.ld);
  rest = rest.filter((x) => !/vip-gondola|search=VIP/.test(x));
  check('jedan poziv WP-u: stranica (slug=ski-depo)', rest.length === 1 && /pages\?slug=ski-depo/.test(rest[0]), rest);
  const j = await p.evaluate(() => {
    const r = document.getElementById('jsd-depo'), a = document.querySelector('#jg-gondola .jg-frame').getBoundingClientRect(), b = r.querySelector('.jsd-frame').getBoundingClientRect();
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jsd-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jsd--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap + gg) };
  });
  check('VIP gondola iznad: jsd--join, razmak kadar → kadar = --gap + --g', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'gondola-depo.png'), fullPage: true });
  await shot(p, 'sr-racunar-kadar');
  // dodaj drugi set: skije i pancerice; ukloni rukavice prvog seta
  await p.click('#jsd-depo .jsd-it[data-k="ski"][data-s="1"]'); await p.waitForTimeout(150);
  await p.click('#jsd-depo .jsd-it[data-k="boot"][data-s="1"]');
  await p.click('#jsd-depo .jsd-it[data-k="glove"][data-s="0"]'); await p.waitForTimeout(1400);
  S = await state(p);
  check('klik: set 2 skije i pancerice dodani, rukavice seta 1 uklonjene (dugmad = ormarić); 5 / 8', S.has === '11 11 10 00' && S.btns === '11101100' && S.fill === 'Popunjeno 5 / 8', [S.has, S.btns, S.fill]);
  const lab = await p.evaluate(() => [...document.querySelectorAll('#jsd-depo .jsd-it')].slice(0, 5).map((b) => b.getAttribute('aria-label')));
  check('dugmad imaju natpis za čitače ekrana', lab[0] === 'Ukloni: skije i štapove, Set 1' && lab[3] === 'Dodaj: rukavice, Set 1' && lab[4] === 'Ukloni: skije i štapove, Set 2', lab);
  await shot(p, 'sr-racunar-set2');
  // napuni sve
  for (const k of ['helmet', 'glove']) await p.click(`#jsd-depo .jsd-it[data-k="${k}"][data-s="1"]`);
  await p.click('#jsd-depo .jsd-it[data-k="glove"][data-s="0"]'); await p.waitForTimeout(1400);
  S = await state(p);
  check('pun depo: 8 / 8', S.has === '11 11 11 11' && S.fill === 'Popunjeno 8 / 8', [S.has, S.fill]);
  await shot(p, 'sr-racunar-pun');
  // okretanje prevlačenjem
  const fb = await p.locator('#jsd-depo .jsd-frame').boundingBox();
  await p.mouse.move(fb.x + fb.width * .2, fb.y + fb.height * .5); await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(fb.x + fb.width * .2 - i * 22, fb.y + fb.height * .5, { steps: 2 });
  await p.mouse.up(); await p.waitForTimeout(900);
  S = await state(p);
  const hint = await p.evaluate(() => document.querySelector('#jsd-depo .jsd-hint').classList.contains('is-gone'));
  check('prevlačenje okreće ormarić, uputa nestaje', Math.abs(S.yaw) > .1 && hint, [S.yaw, hint]);
  check('natpisi prate okretanje i ostaju u kadru', S.coIn && S.coApart, [S.coIn, S.coApart]);
  await shot(p, 'sr-racunar-okrenut');
  // fotografija depoa
  await p.click('#jsd-depo .jsd-ph'); await p.waitForTimeout(450);
  let L = await lb(p);
  check('Fotografija depoa: naša fotografija, 1 / 2 (+1 sa stranice, ikona preskočena), fokus unutra', L.shown === 'grid' && L.src === 'depo-ormaric.webp' && L.cap === '1 / 2' && L.inside && L.overflow === 'hidden', L);
  await p.keyboard.press('ArrowRight');
  L = await lb(p);
  check('strelica: najveća fotografija sa stranice (1600w)', L.cap === '2 / 2' && L.src === 'depo-sala.jpg', L);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  L = await lb(p);
  check('Esc zatvara, fokus nazad, skrol vraćen', L.shown === 'none' && /jsd-ph/.test(L.focus) && L.overflow === '', L);
  await p.click('#jsd-depo a[data-jsd="stranica"]'); await p.click('#jsd-depo a[data-jsd="mapa"]');
  const ev = await p.evaluate(() => window.__ev.filter((e) => /^depo_/.test(e[1])).map((e) => e[1] + ':' + JSON.stringify(e[2])));
  check('GA4: depo_oprema ×6, depo_okretanje, depo_galerija, depo_klik ×2', JSON.stringify(ev) === JSON.stringify([
    'depo_oprema:{"predmet":"ski","set":2,"akcija":"dodaj","jezik":"sr"}', 'depo_oprema:{"predmet":"boot","set":2,"akcija":"dodaj","jezik":"sr"}',
    'depo_oprema:{"predmet":"glove","set":1,"akcija":"ukloni","jezik":"sr"}', 'depo_oprema:{"predmet":"helmet","set":2,"akcija":"dodaj","jezik":"sr"}',
    'depo_oprema:{"predmet":"glove","set":2,"akcija":"dodaj","jezik":"sr"}', 'depo_oprema:{"predmet":"glove","set":1,"akcija":"dodaj","jezik":"sr"}',
    'depo_okretanje:{"jezik":"sr"}', 'depo_galerija:{"jezik":"sr"}', 'depo_klik:{"cilj":"stranica","jezik":"sr"}', 'depo_klik:{"cilj":"mapa","jezik":"sr"}']), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Ulazak: vrata se otvore, oprema uleti, pa infografika');
  ({ p, ctx, errors } = await open(browser, { wait: 0, ga: 'none', gondola: true }));   // gondola iznad → depo je ispod ekrana dok se ne skroluje
  const seq = [];
  for (let i = 0; i < 160; i++) {   // uzorak svakih 250 ms (softversko crtanje je sporo, pa se ne mjeri tačno vrijeme)
    const v = await p.evaluate(() => { const r = document.getElementById('jsd-depo'), a = r.__jsd3d; return [a ? +a.anchors().door.toFixed(2) : -1, r.querySelectorAll('.jsd-co.is-on').length]; });
    seq.push(v);
    if (v[0] > .2 && v[0] < .8 && !seq.shot) { seq.shot = 1; await p.screenshot({ path: path.join(OUT, 'sr-racunar-ulazak.png') }); }
    if (v[1] === 3) break;
    await p.waitForTimeout(250);
  }
  const fst = seq.find((v) => v[0] >= 0), mid = seq.some((v) => v[0] > 0 && v[0] < 1), firstCo = seq.findIndex((v) => v[1] > 0);
  check('vrata: zatvorena → otvaraju se → otvorena; infografika tek kad su vrata otvorena', fst && fst[0] === 0 && fst[1] === 0 && mid && firstCo > 0 && seq[firstCo][0] === 1 && seq[seq.length - 1][1] === 3,
    seq.filter((v, i) => !i || v[0] !== seq[i - 1][0] || v[1] !== seq[i - 1][1]));
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Izmijenjena stranica: 18 KM, depozit 20 KM, tri seta, gondola Ogorjelica, bez grijanja');
  ({ p, ctx, errors } = await open(browser, { wp: 'izmjene', admin: true }));
  S = await state(p);
  check('cijena 18 KM, tri seta, novi koraci', S.price === '18KM' && S.packH === 'U jedan depo stanu tri puna seta' && /Ogorjelica/.test(S.steps[0]) && /depozit 20 KM/.test(S.steps[1]), [S.price, S.packH, S.steps]);
  check('grijanje sakriveno (stranica ga ne nabraja)', S.cos.join('|') === 'vent+:Ventilacija za svježinu opreme|dry+:Sušenje oprema suva i spremna|heat+(-):Grijanje udobnost i toplina', S.cos);
  check('novi uvod, admin bez poruke', /^Ski depo je najjednostavniji/.test(S.lead) && S.why === '', [S.lead, S.why]);
  check('schema.org: 18 BAM', S.ld === 'Service:18 BAM/dan', S.ld);
  await ctx.close();

  console.log('Pogrešan slug → stranica se nađe pretragom "depo"');
  ({ p, ctx, errors, rest } = await open(browser, { slug: 'ski-depoi', admin: true, wait: 1500 }));
  S = await state(p);
  check('nađena stranica: uvod i link', /^Jedan od najboljih/.test(S.lead) && S.page === SITE + '/ski-depoi/' && S.why === '', [S.page, S.why]);
  check('pozivi: slug pa search=depo', rest.length === 2 && /slug=ski-depo/.test(rest[0]) && /search=depo/.test(rest[1]), rest);
  await ctx.close();

  console.log('WordPress ispiše PHP upozorenje prije JSON-a');
  ({ p, ctx, errors } = await open(browser, { wp: 'upozorenje', ga: 'none', admin: true, wait: 1500 }));
  S = await state(p);
  check('podaci se ipak pročitaju, admin bez poruke', /^Jedan od najboljih/.test(S.lead) && S.price === '15KM' && S.why === '', [S.lead, S.why]);
  await ctx.close();

  console.log('Stranica bez cijene → ugrađena cijena ostaje, admin vidi razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'bezcijene', ga: 'none', admin: true, wait: 1500 }));
  S = await state(p);
  check('ugrađenih 15 KM, novi uvod; admin: cijena', S.price === '15KM' && /^Ski depoi su uskoro/.test(S.lead) && /cijena/.test(S.why), [S.price, S.lead, S.why]);
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski naslov, nadnaslov i uvod iz WP-a', S.lines.join('|') === 'Leave your gear|on the mountain' && S.kicker === 'Ski lockers' && /^Ski lockers are the easiest way/.test(S.lead), [S.lines, S.kicker, S.lead]);
  check('engleska infografika i koraci', S.packH === 'One locker fits two full sets' && S.steps[0] === 'Ski ticket office / at the Poljice gondola base' && S.steps[1] === 'Locker card / 10 KM deposit' && /^vent\+:Ventilation/.test(S.cos[0]), [S.packH, S.steps, S.cos]);
  check('dugmad i link /en/', S.btxt.join('|') === 'More about ski lockers|Location' && S.page === SITE + '/en/ski-depo/', [S.btxt, S.page]);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && rest.some((x) => /^\/wp-json\/wp\/v2\/pages/.test(x)), rest);
  await p.click('#jsd-depo .jsd-it[data-k="helmet"][data-s="1"]'); await p.waitForTimeout(100);
  const ev2 = await p.evaluate(() => window.__ev.filter((e) => /^depo_/.test(e.event)));
  check('dataLayer: depo_oprema', JSON.stringify(ev2) === JSON.stringify([{ event: 'depo_oprema', predmet: 'helmet', set: 2, akcija: 'dodaj', jezik: 'en' }]), ev2);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.waitForTimeout(900);
  await shot(p, 'en-racunar-kadar');
  await ctx.close();

  console.log('Bez WebGL-a: fotografija pravog ormarića, privjesak pored nje, dugmad samo prikaz');
  ({ p, ctx, errors } = await open(browser, { nogl: true, ga: 'none', wait: 1800 }));
  S = await state(p);
  check('fotografija vidljiva, 3D nije, privjesak 15 KM vidljiv', S.flat && !S.ready && S.photoOp === '1' && S.tagOn && S.tagFree, [S.flat, S.ready, S.photoOp, S.tagOn]);
  await p.click('#jsd-depo .jsd-it[data-k="ski"][data-s="1"]'); await p.waitForTimeout(100);
  S = await state(p);
  check('klik ne mijenja ništa (aria-disabled)', S.btns === '11110000', S.btns);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await shot(p, 'bez-webgl');
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni sadržaj, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', wait: 1500 }));
  S = await state(p);
  check('ugrađeni tekst i cijena', /^Jedan od najboljih/.test(S.lead) && S.price === '15KM' && S.why === '', [S.lead, S.price]);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', admin: true, wait: 1500 }));
  S = await state(p);
  check('admin vidi razlog', /HTTP 403/.test(S.why), S.why);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'nema', ga: 'none', admin: true, wait: 1500 }));
  S = await state(p);
  check('nema stranice: admin vidi da nije pronađena', /nije pronađena/.test(S.why), S.why);
  await ctx.close();

  for (const [name, vw, vh, touch] of [['laptop', 1280, 800], ['laptop-mali', 1024, 700], ['laptop-nizak', 1366, 680], ['siroki', 1920, 1080], ['tablet', 900, 1100, true], ['telefon', 390, 844, true], ['uski-telefon', 340, 740, true]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska, tekst u kadru', S.hidden === 0 && S.bodyIn, [S.hidden, S.bodyIn]);
    check('3D spreman, infografika u kadru, ne preko teksta, natpisi se ne preklapaju', S.ready && S.coIn && S.coFree && S.coApart, [S.ready, S.coIn, S.coFree, S.coApart]);
    check('privjesak vidljiv, u kadru, ne preko teksta', S.tagOn && S.tagIn && S.tagFree, S.tagBox);
    check('natpisi dugmadi, kolona i koraka staju', S.fit && S.chFit, [S.fit, S.chFit]);
    check('spakuj i dugmad iste širine', S.packW === S.actsW && S.packL === S.actsL, [S.packW, S.actsW]);
    if (vw <= 760 && vw > 360) check('telefon: oba dugmeta u jednom redu, 42px', S.acts[0][0] === S.acts[1][0] && S.acts[0][2] === 42, S.acts);
    await shot(p, name);
    if (touch) {
      await p.tap('#jsd-depo .jsd-it[data-k="boot"][data-s="1"]'); await p.waitForTimeout(1100);
      S = await state(p);
      check('dodir: pancerice seta 2', S.has === '10 11 10 10', S.has);
      await shot(p, name + '-dodir');
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Puni kvalitet (sjenke, zaglađene ivice): računar i telefon');
  for (const [name, vw, vh, touch] of [['kvalitet-racunar', 1440, 900], ['kvalitet-telefon', 390, 844, true]]) {
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch, low: false, ga: 'none' }));
    S = await state(p);
    check(name + ': 3D spreman, set 1 unutra, infografika', S.ready && S.has === '10 10 10 10' && S.cos.every((c) => /\+/.test(c)), [S.ready, S.has]);
    await shot(p, name);
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska, ormarić odmah otvoren i spakovan)');
  ({ p, ctx, errors } = await open(browser, { reduced: true, wait: 1500 }));
  S = await state(p);
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jsd-depo').className, door: document.getElementById('jsd-depo').__jsd3d.anchors().door }));
  check('odmah vidljivo, bez klasa za ulazak, vrata otvorena, set 1 unutra, infografika', !/jsd-anim/.test(rm.cls) && rm.door === 1 && S.has === '10 10 10 10' && S.hidden === 0 && S.cos.every((c) => /\+/.test(c)), [rm, S.has]);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
