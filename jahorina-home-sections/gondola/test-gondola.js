// Simulacija sajta za sekciju VIP gondola (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica VIP gondole), gondola.js,
// bar.js (iznad, za razmak i cik-cak), fotografije i fontovi se služe lokalno.
// Pokretanje: node test-gondola.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2023/01/';
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
function page({ attrs = '', bar = false, admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Suvenirnica (iznad)</div>
  ${bar ? `<div class="boxed"><div class="elementor-widget-html"><div id="jb-bar"></div>
    <script src="${CDN}jahorina-home-sections/bar/bar.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jg-gondola" ${attrs}><a href="/vip-gondola/">VIP gondola</a></div>
    <script src="${CDN}jahorina-home-sections/gondola/gondola.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice (screenshot korisnika, 9. 10. 2026) kako ga WordPress vraća: pasusi, paketi, link "OVDJE", karusel fotografija
const P1 = 'Jedna od 68 kabina impozantne gondole Poljice na istoimenoj stazi, dizajniranih u “Diamond” stilu, je VIP kabina, koja će svim posjetiocima Jahorine koji budu željeli da obilježe bitan životni momenat sa svojom porodicom, prijateljima, ili pak voljenom osobom, u noćnoj panoramskoj vožnji istom, pružiti nevjerovatan osjećaj. Tehnologija LED efekata koja je ugrađena u unutrašnjost kabine, kao i sa spoljašnje strane, korisnicima usluge panoramska vožnja VIP kabinom gondole Poljice osiguraće poseban i čak praznični osjećaj, kao i pogled na planinu iz potpuno drugog ugla. Priuštite sebi nezaboravnu vožnju, udobno se smjestite u kožna sjedišta, otvorite bocu šampanjca i probajte izvrsnu mezu sačinjenu od velikog broja preukusnih domaćih proizvoda, pripremljenu za vas sa velikom pažnjom i ljubavlju.';
const P2 = 'Ukoliko se, tokom sljedeće posjete Jahorini, odlučite na aktivnost panoramska vožnja VIP kabinom gondola Poljice, potrebno je da, prije nego rezervišete svoje mjesto u istoj, se odlučite između dva segmenta ponude:';
const V1 = '– VIP gondola 1, čija cijena od 150 KM uključuje vožnju gondolom Poljice u trajanju do 1h i konzumaciju šampanjca, te';
const V2 = '– VIP gondola 2, čija cijena od 250 KM uključuje vožnju gondolom Poljice u trajanju do 1h , konzumaciju šampanjca i hrane u vidi meze.';
const REZ = (href) => `Rezervaciju odabrane opcije možete izvršiti putem e-pošte <a href="${href}">OVDJE</a> – istu je potrebno izvršiti barem najmanje dan ranije od previđenog datuma korištenja usluge.`;
const GALW = `<div class="swiper"><img src="${UP}vip-1-1024x683.jpg" srcset="${UP}vip-1-1024x683.jpg 1024w, ${UP}vip-1.jpg 1600w" alt="VIP kabina"><img src="${UP}vip-2-1024x683.jpg" alt=""><img src="${UP}logo.png" width="120" alt=""></div>`;
const CONTENT = {
  stranica: `<p>${P1}</p>\n<p>${P2}</p>\n<p>${V1}</p>\n<p>${V2}</p>\n<p>${REZ('mailto:vip@oc-jahorina.com?subject=VIP')}</p>${GALW}`,
  // cijene promijenjene, 2 dana unaprijed, link OVDJE vodi na kontakt stranicu, bez fotografija u tekstu (→ media?parent)
  izmjene: `<p>${P1}</p><p>${V1.replace('150', '180')}</p><p>${V2.replace('250', '290').replace(', konzumaciju šampanjca i hrane u vidi meze', ' i konzumaciju šampanjca')}</p><p>Rezervaciju možete izvršiti <a href="/kontakt/">OVDJE</a>, najmanje 2 dana ranije.</p>`,
  bezpaketa: `<p>VIP kabina gondole Poljice je nova ponuda za posebne trenutke na planini, uskoro više informacija.</p>`,
  qtranslate: `<p>[:SH]${P1}[:en]One of the 68 Diamond-style cabins of the Poljice gondola is the VIP cabin. Treat yourself to an unforgettable night ride with champagne.[:]</p><p>[:SH]${V1}[:en]– VIP gondola 1, priced at 150 KM, includes a ride of up to 1h and champagne, and[:]</p><p>[:SH]${V2}[:en]– VIP gondola 2, priced at 250 KM, includes a ride of up to 1h, champagne and a meze platter.[:]</p><p>[:SH]${REZ('mailto:vip@oc-jahorina.com')}[:en]You can book by email <a href="mailto:vip@oc-jahorina.com">HERE</a> at least one day in advance.[:]</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'stranica', slug = 'vip-gondola', bar = false, admin = false, touch = false, wait = 3400 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const p = await ctx.newPage();
  const errors = [], rest = [];
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
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nema' });
      const ct = f.endsWith('.js') ? 'application/javascript' : f.endsWith('.webp') ? 'image/webp' : 'application/octet-stream';
      return route.fulfill({ contentType: ct, body: fs.readFileSync(f) });
    }
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/uploads/'))
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike/gondola-zdravica.webp')) });
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      const q = decodeURIComponent(u.pathname + u.search);
      rest.push(q);
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/media/.test(q)) return route.fulfill({ contentType: 'application/json', body: JSON.stringify(/parent=55/.test(q) ? [{ id: 9, source_url: UP + 'vip-media.jpg', alt_text: 'VIP', media_details: { sizes: { large: { source_url: UP + 'vip-media-1024x683.jpg' } } } }] : []) });
      if (/wp\/v2\/pages/.test(q)) {
        if (/slug=olimpijski-bar/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // bar iznad: ugrađeni tekst
        const pg = { id: 55, link: SITE + '/' + slug + '/', slug, title: { rendered: wp === 'qtranslate' ? '[:SH]VIP gondola[:en]VIP gondola[:]' : 'VIP gondola' },
          content: { rendered: CONTENT[wp === 'upozorenje' ? 'stranica' : wp] || '' } };
        const other = { id: 12, link: SITE + '/vip-ski-pass/', slug: 'vip-ski-pass', title: { rendered: 'VIP ski pass' }, content: { rendered: '<p>VIP ski pass za cijelu sezonu.</p>' } };
        if (wp === 'nema') return route.fulfill({ contentType: 'application/json', body: '[]' });
        if (/search=VIP/.test(q)) return route.fulfill({ contentType: 'application/json', body: JSON.stringify([other, pg]) });
        if (!new RegExp('slug=' + slug + '(&|$)').test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });
        const pre = wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '';
        return route.fulfill({ contentType: 'application/json', body: pre + JSON.stringify([pg]) });
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, bar, admin }) });
    return route.abort();   // YouTube i ostalo
  });
  await p.addInitScript((mode) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, ga);
  await p.goto(SITE + pth);
  await p.waitForSelector('#jg-gondola .jg-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);   // WordPress odgovor
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jg-gondola').scrollIntoViewIfNeeded();
  await p.waitForTimeout(wait);   // ulazak + LED ~2,8 s
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jg-gondola'), b = r.getBoundingClientRect();
    const h2 = r.querySelector('h2 span');
    const hit = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    const f = r.querySelector('.jg-frame').getBoundingClientRect(), body = r.querySelector('.jg-body').getBoundingClientRect();
    const pass = r.querySelector('.jg-pass').getBoundingClientRect(), acts = r.querySelector('.jg-acts').getBoundingClientRect();
    const ph = r.querySelector('.jg-ph').getBoundingClientRect();
    // bliske kabine na fotografiji (70,8 % / 52 % i 88,7 % / 62,5 %) ne smiju biti ispod teksta (računar)
    const cab = { left: ph.left + ph.width * .62, right: ph.left + ph.width * .96, top: ph.top + ph.height * .36, bottom: ph.top + ph.height * .75 };
    const rez = r.querySelector('a[data-jg="rezervacija"]');
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      lines: [...r.querySelectorAll('h2 span')].map((s) => s.textContent), outline: r.querySelector('h2 .jg-o').textContent,
      kicker: r.querySelector('.jg-kicker').textContent, lead: r.querySelector('.jg-lead').textContent,
      tog: [...r.querySelectorAll('.jg-tb')].map((t) => t.textContent + (t.getAttribute('aria-checked') === 'true' ? '*' : '')).join('|'),
      inc: [...r.querySelectorAll('.jg-inc li')].map((li) => li.textContent + (li.classList.contains('is-off') ? '(-)' : '')).join('|'),
      price: r.querySelector('.jg-price').textContent,
      rez: [decodeURIComponent(rez.getAttribute('href') || ''), rez.innerText.trim(), rez.getAttribute('target') || ''],
      note: r.querySelector('.jg-note').innerText.replace(/\s+/g, ' ').trim(),
      page: r.querySelector('a[data-jg="stranica"]').getAttribute('href'),
      why: (r.querySelector('.jg-why') || {}).textContent || '',
      led: getComputedStyle(r).getPropertyValue('--led').trim(),
      litMask: getComputedStyle(r.querySelector('.jg-lit')).maskImage || getComputedStyle(r.querySelector('.jg-lit')).webkitMaskImage,
      hidden: [...r.querySelectorAll('.jg-up,.jg-ph')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      imgOk: [...r.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0),
      bodyIn: body.left >= f.left - 1 && body.right <= f.right + 1 && body.bottom <= f.bottom + 1,
      cabFree: innerWidth <= 980 || ![...r.querySelectorAll('.jg-kicker, h2 span, .jg-lead, .jg-pass, .jg-acts, .jg-note')].some((e) => hit(e.getBoundingClientRect(), cab)),
      cabIn: cab.right <= f.right + 2 && cab.left >= f.left,
      passW: Math.round(pass.width), actsW: Math.round(acts.width), passL: Math.round(pass.left), actsL: Math.round(acts.left),
      acts: [...r.querySelectorAll('.jg-btn')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      actsFit: [...r.querySelectorAll('.jg-btn, .jg-tb')].every((a) => a.scrollWidth <= a.clientWidth + 1),
      incFit: [...r.querySelectorAll('.jg-inc li')].every((li) => { const q = li.getBoundingClientRect(), o = r.querySelector('.jg-opt').getBoundingClientRect(); return q.right <= o.right + 1; }),
      ld: (() => { try { const j = JSON.parse(document.getElementById('jg-ld').text); return j.offers.map((o) => o.name + ':' + o.price + ' ' + o.priceCurrency).join('|'); } catch (e) { return 'nema'; } })(),
    };
  });
}
async function lb(p) {
  return p.evaluate(() => {
    const m = document.getElementById('jg-lb');
    if (!m) return { shown: 'none' };
    return { shown: getComputedStyle(m).display, src: m.querySelector('img').getAttribute('src').replace(/^.*\//, ''), cap: m.querySelector('figcaption').textContent,
      inside: !!(document.activeElement && document.activeElement.closest('#jg-lb')), overflow: document.documentElement.style.overflow, focus: document.activeElement.className };
  });
}

(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, bar iznad, uži kontejner teme, GA4 (gtag), WordPress stranica VIP gondole');
  let { p, ctx, errors, rest } = await open(browser, { bar: true });
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('naslov "Noćna vožnja / VIP kabinom", kraj iscrtan', S.lines.join('|') === 'Noćna vožnja|VIP kabinom' && S.outline === 'VIP kabinom', S.lines);
  check('nadnaslov = naslov stranice', S.kicker === 'VIP gondola', S.kicker);
  check('uvod = rečenica "Priuštite sebi …" sa stranice', /^Priuštite sebi nezaboravnu vožnju.*ljubavlju\.$/.test(S.lead), S.lead);
  check('paketi iz teksta: VIP 1 izabran, VIP 2', S.tog === 'VIP 1*|VIP 2', S.tog);
  check('VIP 1: vožnja do 1 h, šampanjac, meze prigušeno; 150 KM', S.inc === 'Vožnja do 1 h|Šampanjac|Meze(-)' && S.price === '150KM', [S.inc, S.price]);
  check('Rezerviši VIP 1 → mail sa stranice, naslov i tekst sa paketom', /^mailto:vip@oc-jahorina\.com\?subject=Rezervacija: VIP gondola 1&body=Poštovani,\n\nželim da rezervišem paket VIP gondola 1 \(150 KM\)\./.test(S.rez[0]) && S.rez[1] === 'Rezerviši VIP 1', S.rez);
  check('napomena: najmanje dan ranije + link stranice', S.note === 'Rezervacija e-poštom, najmanje dan ranije Više o VIP gondoli' && S.page === SITE + '/vip-gondola/', [S.note, S.page]);
  check('ulaznica i dugmad iste širine, poravnati', S.passW === S.actsW && S.passL === S.actsL, [S.passW, S.actsW, S.passL, S.actsL]);
  check('dugmad: isti red, ista širina i visina (44px), natpisi staju', S.acts[0][0] === S.acts[1][0] && S.acts[0][1] === S.acts[1][1] && S.acts[0][2] === 44 && S.actsFit, S.acts);
  check('tekst lijevo ne prekriva bliske kabine (desno)', S.cabFree && S.cabIn && S.bodyIn, [S.cabFree, S.cabIn, S.bodyIn]);
  check('LED upaljen poslije ulaska (sloj otkriven do kraja)', S.led === '' && /135%\)?\s*\)?$|#000 100%|rgb\(0, 0, 0\) 100%/.test(S.litMask), [S.led, S.litMask]);
  check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
  check('fotografija učitana', S.imgOk);
  check('admin poruka se ne vidi', S.why === '', S.why);
  check('schema.org: dvije ponude (150 i 250 BAM)', S.ld === 'VIP gondola 1:150 BAM|VIP gondola 2:250 BAM', S.ld);
  rest = rest.filter((x) => !/olimpijski-bar|meni-bar/.test(x));
  check('jedan poziv WP-u: stranica (slug=vip-gondola)', rest.length === 1 && /pages\?slug=vip-gondola/.test(rest[0]), rest);
  const j = await p.evaluate(() => {
    const r = document.getElementById('jg-gondola'), a = document.querySelector('#jb-bar .jb-frame').getBoundingClientRect(), b = r.querySelector('.jg-frame').getBoundingClientRect();
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jg-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jg--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap + gg) };
  });
  check('bar iznad: jg--join, razmak kadar → kadar = --gap + --g', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'bar-gondola.png'), fullPage: true });
  await p.locator('#jg-gondola .jg-frame').screenshot({ path: path.join(OUT, 'sr-racunar-kadar.png') });
  // izbor VIP 2: cijena se prebroji do 250, meze uključeno, mail za VIP 2
  await p.click('#jg-gondola .jg-tb[data-k="1"]');
  await p.waitForTimeout(160);
  const mid = await p.evaluate(() => document.querySelector('#jg-gondola .jg-price b').textContent);
  await p.waitForTimeout(600);
  S = await state(p);
  check('VIP 2: cijena se prebroji (150 → 250), meze uključeno', +mid > 150 && +mid < 250 && S.price === '250KM' && S.inc === 'Vožnja do 1 h|Šampanjac|Meze' && S.tog === 'VIP 1|VIP 2*', [mid, S.price, S.inc, S.tog]);
  check('Rezerviši VIP 2 → mail za VIP 2 (250 KM)', /subject=Rezervacija: VIP gondola 2&body=.*paket VIP gondola 2 \(250 KM\)/s.test(S.rez[0]) && S.rez[1] === 'Rezerviši VIP 2', S.rez);
  await p.locator('#jg-gondola .jg-frame').screenshot({ path: path.join(OUT, 'sr-racunar-vip2.png') });
  // tastatura: strelica lijevo vraća VIP 1
  await p.focus('#jg-gondola .jg-tb[data-k="1"]'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(600);
  S = await state(p);
  check('strelica ← bira VIP 1 (fokus prati izbor)', S.tog === 'VIP 1*|VIP 2' && S.price === '150KM' && await p.evaluate(() => document.activeElement.getAttribute('data-k') === '0'), S.tog);
  await p.click('#jg-gondola .jg-btn--solid');
  // fotografije: "Pogledaj unutra" počinje od unutrašnjosti kabine; 3 naše + 2 sa stranice (logo preskočen)
  await p.click('#jg-gondola .jg-btn--ghost'); await p.waitForTimeout(450);
  let L = await lb(p);
  check('Pogledaj unutra: kabina iznutra, 1 / 5, fokus unutra, stranica ne skroluje', L.shown === 'grid' && L.src === 'gondola-kabina.webp' && L.cap === '1 / 5' && L.inside && L.overflow === 'hidden', L);
  await p.evaluate(() => document.querySelector('#jg-lb img').decode().catch(() => {}));
  await p.screenshot({ path: path.join(OUT, 'galerija-kabina.png') });
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  L = await lb(p);
  check('strelice: 4 / 5 = najveća fotografija sa stranice (1600w iz srcset-a)', L.cap === '4 / 5' && L.src === 'vip-1.jpg', L);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  L = await lb(p);
  check('Esc zatvara, fokus nazad na dugme, skrol vraćen', L.shown === 'none' && /jg-btn--ghost/.test(L.focus) && L.overflow === '', L);
  // klik na fotografiju (desno) → noćna gondola
  const fr = await p.locator('#jg-gondola .jg-frame').boundingBox();
  await p.mouse.click(fr.x + fr.width * .82, fr.y + fr.height * .3); await p.waitForTimeout(400);
  L = await lb(p);
  check('klik na fotografiju: noćna gondola (3 / 5)', L.shown === 'grid' && L.src === 'gondola-noc.webp' && L.cap === '3 / 5', L);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('#jg-gondola .jg-more');
  let ev = await p.evaluate(() => window.__ev.map((e) => e[1] + ':' + JSON.stringify(e[2])));
  check('GA4: gondola_paket, gondola_paket, gondola_rezervacija, gondola_galerija ×2, gondola_klik', JSON.stringify(ev) === JSON.stringify([
    'gondola_paket:{"paket":"VIP 2","jezik":"sr"}', 'gondola_paket:{"paket":"VIP 1","jezik":"sr"}', 'gondola_rezervacija:{"nacin":"mail","paket":"VIP 1","jezik":"sr"}',
    'gondola_galerija:{"jezik":"sr"}', 'gondola_galerija:{"jezik":"sr"}', 'gondola_klik:{"cilj":"stranica","jezik":"sr"}']), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('LED se pali: ugašeno → upaljeno duž užeta');
  ({ p, ctx, errors } = await open(browser, { wait: 0, ga: 'none', bar: true }));   // bar iznad → gondola je ispod ekrana dok se ne skroluje
  const leds = [];
  for (const t of [250, 1350, 1700]) {   // poslije dolaska u ekran: 0,25 s / 1,6 s / 3,3 s
    await p.waitForTimeout(t);
    leds.push(await p.evaluate(() => getComputedStyle(document.getElementById('jg-gondola')).getPropertyValue('--led').trim()));
    if (leds.length === 2) await p.locator('#jg-gondola .jg-frame').screenshot({ path: path.join(OUT, 'sr-racunar-led-se-pali.png') });
  }
  check('--led: 0 na početku, raste, pa ostaje upaljen', leds[0] === '0.000' && +leds[1] > 0 && +leds[1] < 1 && leds[2] === '', leds);
  await ctx.close();

  console.log('Izmijenjena stranica: cijene, VIP 2 bez meze, 2 dana, OVDJE → kontakt stranica, fotografije iz Medija');
  ({ p, ctx, errors, rest } = await open(browser, { wp: 'izmjene', admin: true }));
  S = await state(p);
  check('nove cijene 180 / 290, bez meze (stavka nestaje)', S.price === '180KM' && S.inc === 'Vožnja do 1 h|Šampanjac', [S.price, S.inc]);
  await p.click('#jg-gondola .jg-tb[data-k="1"]'); await p.waitForTimeout(600);
  S = await state(p);
  check('VIP 2: 290 KM', S.price === '290KM', S.price);
  check('rezervacija vodi na kontakt stranicu (nova kartica), napomena 2 dana', S.rez[0] === SITE + '/kontakt/' && S.rez[2] === '_blank' && /najmanje 2 dana ranije/.test(S.note), [S.rez, S.note]);
  check('fotografije iz Medija (media?parent=55)', rest.some((x) => /media\?parent=55/.test(x)), rest);
  check('admin bez poruke (sve nađeno)', S.why === '', S.why);
  await p.click('#jg-gondola .jg-btn--ghost'); await p.waitForTimeout(300);
  check('galerija: 3 naše + 1 iz Medija', (await lb(p)).cap === '1 / 4');
  await ctx.close();

  console.log('Pogrešan slug → stranica se nađe pretragom "VIP" (preskače VIP ski pass)');
  ({ p, ctx, errors, rest } = await open(browser, { slug: 'panoramska-voznja-vip-kabinom', admin: true }));
  S = await state(p);
  check('nađena stranica gondole: paketi i link', S.tog === 'VIP 1*|VIP 2' && S.page === SITE + '/panoramska-voznja-vip-kabinom/' && S.why === '', [S.tog, S.page, S.why]);
  check('pozivi: slug pa search=VIP', rest.length === 2 && /slug=vip-gondola/.test(rest[0]) && /search=VIP/.test(rest[1]), rest);
  await ctx.close();

  console.log('WordPress ispiše PHP upozorenje prije JSON-a');
  ({ p, ctx, errors } = await open(browser, { wp: 'upozorenje', ga: 'none', admin: true }));
  S = await state(p);
  check('podaci se ipak pročitaju, admin bez poruke', S.tog === 'VIP 1*|VIP 2' && /^Priuštite/.test(S.lead) && S.why === '', [S.tog, S.why]);
  await ctx.close();

  console.log('Stranica bez paketa → ugrađeni paketi ostaju, admin vidi razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'bezpaketa', ga: 'none', admin: true }));
  S = await state(p);
  check('ugrađeni paketi (150 KM), novi uvod; admin: paketi i mail', S.price === '150KM' && S.tog === 'VIP 1*|VIP 2' && /nova ponuda/.test(S.lead) && /paketi/.test(S.why) && /mail/.test(S.why), [S.price, S.lead, S.why]);
  check('bez "dan ranije" na stranici → samo "Rezervacija e-poštom"', /^Rezervacija e-poštom Više/.test(S.note), S.note);
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski naslov i uvod iz WP-a', S.lines.join('|') === 'Night ride|VIP cabin' && /^Treat yourself to an unforgettable night ride/.test(S.lead), [S.lines, S.lead]);
  check('engleski paketi: Ride up to 1 h, Champagne, Meze platter(-), 150 KM', S.inc === 'Ride up to 1 h|Champagne|Meze platter(-)' && S.price === '150KM', [S.inc, S.price]);
  check('Book VIP 1 → mail, engleski predmet; link /en/', /^mailto:vip@oc-jahorina\.com\?subject=Booking: VIP gondola 1/.test(S.rez[0]) && S.rez[1] === 'Book VIP 1' && S.page === SITE + '/en/vip-gondola/', [S.rez, S.page]);
  check('napomena: at least a day in advance', /Book by email at least a day in advance/.test(S.note), S.note);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && rest.some((x) => /^\/wp-json\/wp\/v2\/pages/.test(x)), rest);
  await p.click('#jg-gondola .jg-tb[data-k="1"]'); await p.waitForTimeout(100);
  ev = await p.evaluate(() => window.__ev);
  check('dataLayer: gondola_paket', JSON.stringify(ev) === JSON.stringify([{ event: 'gondola_paket', paket: 'VIP 2', jezik: 'en' }]), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.waitForTimeout(600);
  await p.locator('#jg-gondola .jg-frame').screenshot({ path: path.join(OUT, 'en-racunar-kadar.png') });
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni sadržaj, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none' }));
  S = await state(p);
  check('ugrađeni tekst, paketi i mail', /^Priuštite/.test(S.lead) && S.tog === 'VIP 1*|VIP 2' && /^mailto:skipass@oc-jahorina\.com/.test(S.rez[0]) && S.why === '', [S.lead, S.rez]);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', admin: true }));
  S = await state(p);
  check('admin vidi razlog', /HTTP 403/.test(S.why), S.why);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'nema', ga: 'none', admin: true }));
  S = await state(p);
  check('nema stranice: admin vidi da nije pronađena', /nije pronađena/.test(S.why), S.why);
  await ctx.close();

  for (const [name, vw, vh, touch] of [['laptop', 1280, 800], ['laptop-mali', 1024, 700], ['laptop-nizak', 1366, 680], ['siroki', 1920, 1080], ['tablet', 900, 1100, true], ['telefon', 390, 844, true], ['uski-telefon', 340, 740, true]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
    check('tekst ne prekriva kabine, sve u kadru', S.cabFree && S.bodyIn, [S.cabFree, S.bodyIn]);
    check('natpisi dugmadi i izbora staju; stavke u ulaznici', S.actsFit && S.incFit, [S.actsFit, S.incFit]);
    check('ulaznica i dugmad iste širine', S.passW === S.actsW && S.passL === S.actsL, [S.passW, S.actsW]);
    if (vw <= 760 && vw > 360) check('telefon: oba dugmeta u jednom redu, 42px', S.acts[0][0] === S.acts[1][0] && S.acts[0][2] === 42, S.acts);
    await p.locator('#jg-gondola .jg-frame').screenshot({ path: path.join(OUT, name + '.png') });
    if (touch) {
      await p.tap('#jg-gondola .jg-tb[data-k="1"]'); await p.waitForTimeout(600);
      check('dodir: VIP 2 (250 KM)', (await state(p)).price === '250KM');
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska, LED odmah upaljen)');
  ({ p, ctx, errors } = await open(browser, { reduced: true, wait: 200 }));
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jg-gondola').className, led: getComputedStyle(document.getElementById('jg-gondola')).getPropertyValue('--led').trim(),
    hidden: [...document.querySelectorAll('#jg-gondola .jg-up,#jg-gondola .jg-ph')].filter((e) => getComputedStyle(e).opacity !== '1').length }));
  check('odmah vidljivo, bez klasa za ulazak, LED upaljen', !/jg-anim/.test(rm.cls) && rm.led === '' && rm.hidden === 0, rm);
  await p.click('#jg-gondola .jg-tb[data-k="1"]'); await p.waitForTimeout(30);
  check('cijena odmah 250 (bez brojanja)', (await state(p)).price === '250KM');
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
