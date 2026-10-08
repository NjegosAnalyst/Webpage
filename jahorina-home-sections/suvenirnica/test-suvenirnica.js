// Simulacija sajta za sekciju suvenirnice (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica Suvenirnica),
// suvenirnica.js, ratrak.js, fotografije i fontovi se služe lokalno.
// Pokretanje: node test-suvenirnica.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2024/12/';
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
function page({ attrs = '', ratrak = false, admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Vijesti (iznad)</div>
  ${ratrak ? `<div class="boxed"><div class="elementor-widget-html"><div id="jr-ratrak"></div>
    <script src="${CDN}jahorina-home-sections/ratrak/ratrak.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jsu-suvenirnica" ${attrs}><a href="/suvenirnica/">Suvenirnica</a></div>
    <script src="${CDN}jahorina-home-sections/suvenirnica/suvenirnica.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice kako ga Elementor čuva u post_content (naslov, pasusi, slike iz karusela; klase i divovi skinuti)
const P1 = 'Svratite u naše suvenirnice na polaznoj i izlaznoj stanici gondole Poljice i pronađite poklone koji griju srce. Bilo da tražite unikatne proizvode lokalnih majstora, prirodnu kozmetiku, tople tekstilne komade ili sitnice za vaše ljubimce, kod nas ćete sigurno naći nešto posebno.';
const P1EN = 'Visit our souvenir shops at the lower and upper stations of the Poljice gondola and find gifts that warm the heart. Whether you are looking for something unique, you will find it here.';
function img(name, lazy) {
  const set = `${UP}${name}-300x200.jpg 300w, ${UP}${name}-1024x683.jpg 1024w, ${UP}${name}-1536x1024.jpg 1536w`;
  return lazy ? `<img data-src="${UP}${name}-1024x683.jpg" data-srcset="${set}" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="1024" height="683" alt="${name}">`
    : `<img src="${UP}${name}-1024x683.jpg" srcset="${set}" width="1024" height="683" alt="${name}">`;
}
const CONTENT = {
  elementor: `<h2>Ponesite dio Jahorine sa sobom!</h2>\n<p>${P1}</p>\n<p>Naše nasmijano osoblje je tu da vam pomogne u odabiru savršenog poklona za vas ili vaše najdraže.</p>\n<p>Dobrodošli u svijet uspomena i posebnih trenutaka!</p>\n` +
    img('suv-a') + img('suv-b') + img('suv-c', true) + `<img src="${UP}logo.png" width="120" height="40" alt="logo">` + `<img src="${UP}suv-a-300x200.jpg" alt="ponovo">`,
  izmijenjeno: `<h3>Zimski pokloni sa planine</h3><p>Nova kolekcija kapa i šalova stigla je u obje suvenirnice. Navratite i pogledajte.</p>` + img('suv-a'),
  qtranslate: `<h2>[:SH]Ponesite dio Jahorine sa sobom![:en]Take a piece of Jahorina with you![:]</h2><p>[:SH]${P1}[:en]${P1EN}[:]</p>` + img('suv-a') + img('suv-b'),
  bebuilder: `<p>${P1}</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'elementor', ratrak = false, admin = false, scrollTo = '#jsu-suvenirnica' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
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
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/uploads/')) {   // fotografije sa WordPress stranice
      const n = /suv-b/.test(u.pathname) ? 'suvenirnica-1' : /suv-c/.test(u.pathname) ? 'suvenirnica-2' : 'suvenirnica-glavna';
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike', n + (/-300x200/.test(u.pathname) ? '-mini' : '') + '.webp')) });
    }
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      rest.push(u.pathname + u.search);
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/media/.test(u.pathname + u.search)) {
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(['suv-b', 'suv-c'].map((n, i) => ({
          id: 40 + i, alt_text: n, source_url: UP + n + '.jpg',
          media_details: { sizes: { thumbnail: { source_url: UP + n + '-300x200.jpg' }, large: { source_url: UP + n + '-1024x683.jpg' } } },
        }))) });
      }
      if (/wp\/v2\/pages/.test(u.pathname + u.search)) {
        if (wp === 'nema') return route.fulfill({ contentType: 'application/json', body: '[]' });
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify([{
          id: 12, link: SITE + '/suvenirnica/',
          title: { rendered: wp === 'qtranslate' ? '[:SH]Suvenirnica[:en]Souvenir shop[:]' : 'Suvenirnica' },
          content: { rendered: CONTENT[wp] },
        }]) });
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, ratrak, admin }) });
    return route.abort();
  });
  await p.addInitScript((mode) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    // test ne otvara linkove
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, ga);
  await p.goto(SITE + pth);
  await p.waitForSelector('#jsu-suvenirnica .jsu-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);   // WordPress odgovor
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator(scrollTo).scrollIntoViewIfNeeded();
  await p.waitForTimeout(2600);   // ulazak traje ~2 s
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jsu-suvenirnica'), b = r.getBoundingClientRect();
    const h2 = r.querySelector('h2 span');
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      lines: [...r.querySelectorAll('h2 span')].map((s) => s.textContent),
      outline: [...r.querySelectorAll('h2 span.jsu-o')].map((s) => s.textContent).join(''),
      kicker: r.querySelector('.jsu-kicker').textContent, lead: r.querySelector('.jsu-lead').textContent,
      tiles: [...r.querySelectorAll('.jsu-tile b')].map((e) => e.textContent).join('|'),
      bullets: getComputedStyle(r.querySelector('.jsu-tile')).listStyleType,
      page: r.querySelector('a[data-jsu="stranica"]').getAttribute('href'),
      gal: r.querySelector('.jsu-gal i').textContent, thumbs: r.querySelectorAll('.jsu-thumbs img').length,
      why: (r.querySelector('.jsu-why') || {}).textContent || '',
      hidden: [...r.querySelectorAll('.jsu-sl,.jsu-tile,.jsu-shot')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      imgOk: [...r.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0),
      acts: [...r.querySelectorAll('.jsu-btn')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      dock: Math.round(r.querySelector('.jsu-dock').getBoundingClientRect().width),
      labelLines: Math.max(...[...r.querySelectorAll('.jsu-tile small')].map((e) => { const g = document.createRange(); g.selectNodeContents(e); return new Set([...g.getClientRects()].map((q) => Math.round(q.top))).size; })),
    };
  });
}

(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, uži kontejner teme, GA4 (gtag), WordPress stranica napravljena u Elementoru');
  let { p, ctx, errors, rest } = await open(browser);
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('naslov iz WP-a u tri reda, "sa sobom" obris', S.lines.join('|') === 'Ponesite dio|Jahorine|sa sobom' && S.outline === 'sa sobom', S.lines);
  check('nadnaslov = naslov stranice', S.kicker === 'Suvenirnica', S.kicker);
  check('uvod = prva rečenica sa stranice', S.lead === P1.split('. ')[0] + '.', S.lead);
  check('pločice', S.tiles === 'Poljice|Domaće|Pokloni', S.tiles);
  check('bez tačkica liste iz teme', S.bullets === 'none', S.bullets);
  check('link = stranica iz WP-a', S.page === SITE + '/suvenirnica/', S.page);
  check('galerija: 3 fotografije bloka + 3 sa stranice (bez ikone i duplikata)', S.gal === '6' && S.thumbs === 3, [S.gal, S.thumbs]);
  check('jedan poziv WP-u (stranica), bez media jer tekst ima slike', rest.length === 1 && /pages\?slug=suvenirnica/.test(rest[0]), rest);
  check('dugmad: isti red, ista širina i visina, red širok kao panel', S.acts[0][0] === S.acts[1][0] && S.acts[0][1] === S.acts[1][1] && S.acts[0][2] === 44 && Math.abs(S.acts[0][1] * 2 + 10 - S.dock) <= 1, [S.acts, S.dock]);
  check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
  check('fotografije učitane', S.imgOk);
  check('admin poruka se ne vidi', S.why === '', S.why);
  await p.screenshot({ path: path.join(OUT, 'sr-racunar.png'), fullPage: true });
  await p.locator('#jsu-suvenirnica .jsu-frame').screenshot({ path: path.join(OUT, 'sr-racunar-kadar.png') });
  await p.click('#jsu-suvenirnica .jsu-btn--solid');
  await p.click('#jsu-suvenirnica .jsu-btn--ghost');
  let ev = await p.evaluate(() => window.__ev);
  check('GA4: klik stranica i mapa', JSON.stringify(ev) === JSON.stringify([['event', 'suvenirnica_klik', { cilj: 'stranica', jezik: 'sr' }], ['event', 'suvenirnica_klik', { cilj: 'mapa', jezik: 'sr' }]]), ev);
  const mapa = await p.getAttribute('#jsu-suvenirnica .jsu-btn--ghost', 'href');
  check('Kako do nas → Google Maps, nova kartica', /google\.com\/maps\/search\/\?api=1&query=Gondola%20Poljice/.test(mapa) && (await p.getAttribute('#jsu-suvenirnica .jsu-btn--ghost', 'target')) === '_blank', mapa);
  await p.click('#jsu-suvenirnica .jsu-gal');
  await p.waitForTimeout(700);
  let g = await p.evaluate(() => { const lb = document.getElementById('jsu-lb'); return { shown: getComputedStyle(lb).display, op: getComputedStyle(lb).opacity, cap: lb.querySelector('figcaption').textContent, focus: document.activeElement.className, overflow: document.documentElement.style.overflow }; });
  check('galerija se otvara (fokus na Zatvori, stranica ne skroluje)', g.shown === 'grid' && g.op === '1' && g.cap === '1 / 6' && g.focus === 'jsu-lb-close' && g.overflow === 'hidden', g);
  await p.evaluate(() => document.querySelector('#jsu-lb img').decode().catch(() => {}));
  await p.screenshot({ path: path.join(OUT, 'galerija-racunar.png') });
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  const src4 = await p.getAttribute('#jsu-lb img', 'src');
  check('4. fotografija je prva sa WP stranice, najveća iz srcset-a', (await p.textContent('#jsu-lb figcaption')) === '4 / 6' && src4 === UP + 'suv-a-1536x1024.jpg', src4);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  check('odložena slika (data-src) se čita', (await p.getAttribute('#jsu-lb img', 'src')) === UP + 'suv-c-1536x1024.jpg');
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  check('Tab ostaje u galeriji', await p.evaluate(() => !!document.activeElement.closest('#jsu-lb')));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(450);
  g = await p.evaluate(() => ({ shown: getComputedStyle(document.getElementById('jsu-lb')).display, focus: document.activeElement.className, overflow: document.documentElement.style.overflow }));
  check('Esc zatvara, fokus se vraća na pilulu Galerija', g.shown === 'none' && g.focus === 'jsu-gal' && g.overflow === '', g);
  ev = await p.evaluate(() => window.__ev.map((e) => e[1]));
  check('GA4: otvaranje galerije', ev.includes('suvenirnica_galerija'), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Tekst na WordPress stranici izmijenjen → blok ga prati');
  ({ p, ctx, errors } = await open(browser, { wp: 'izmijenjeno' }));
  S = await state(p);
  check('novi naslov i uvod', S.lines.join('|') === 'Zimski pokloni|sa planine' && S.outline === 'sa planine' && S.lead === 'Nova kolekcija kapa i šalova stigla je u obje suvenirnice. Navratite i pogledajte.', [S.lines, S.lead]);
  check('sve vidljivo', S.hidden === 0, S.hidden);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski naslov iz WP-a', S.lines.join('|') === 'Take a piece|of Jahorina|with you' && S.kicker === 'Souvenir shop', [S.lines, S.kicker]);
  check('engleski uvod i pločice', /^Visit our souvenir shops/.test(S.lead) && S.tiles === 'Poljice|Local|Gifts', [S.lead, S.tiles]);
  check('link vodi na /en/', S.page === SITE + '/en/suvenirnica/', S.page);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && /^\/wp-json/.test(rest[1]), rest);
  await p.click('#jsu-suvenirnica .jsu-btn--solid');
  ev = await p.evaluate(() => window.__ev);
  check('dataLayer: suvenirnica_klik', JSON.stringify(ev) === JSON.stringify([{ event: 'suvenirnica_klik', cilj: 'stranica', jezik: 'en' }]), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.screenshot({ path: path.join(OUT, 'en-racunar.png'), fullPage: true });
  await ctx.close();

  console.log('Stranica bez slika u tekstu (npr. BeBuilder) → slike priložene uz stranicu');
  ({ p, ctx, errors, rest } = await open(browser, { wp: 'bebuilder', ga: 'none' }));
  S = await state(p);
  check('galerija 3 + 2 priložene', S.gal === '5', S.gal);
  check('naslov ostaje ugrađeni, admin poruke nema (posjetilac)', S.lines.join('|') === 'Ponesite dio|Jahorine|sa sobom' && S.why === '', [S.lines, S.why]);
  check('drugi poziv: media?parent=12', rest.length === 2 && /media\?parent=12/.test(rest[1]), rest);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni tekst, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none' }));
  S = await state(p);
  check('ugrađeni tekst i 3 fotografije', S.lines.join('|') === 'Ponesite dio|Jahorine|sa sobom' && S.gal === '3' && S.page === SITE + '/suvenirnica/' && S.why === '', S);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', admin: true }));
  S = await state(p);
  check('admin vidi razlog', /HTTP 403 · pages/.test(S.why), S.why);
  await p.locator('#jsu-suvenirnica .jsu-frame').screenshot({ path: path.join(OUT, 'greska-admin.png') });
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'nema', ga: 'none', admin: true }));
  S = await state(p);
  check('pogrešan slug: admin vidi da stranica nije pronađena', /nije pronađena/.test(S.why), S.why);
  await ctx.close();

  console.log('Ratrak odmah iznad: razmak kadar → kadar isti kao vijesti → ratrak');
  ({ p, ctx, errors } = await open(browser, { ratrak: true }));
  const j = await p.evaluate(() => {
    const r = document.getElementById('jsu-suvenirnica'), a = document.querySelector('#jr-ratrak .jr-frame').getBoundingClientRect(), b = r.querySelector('.jsu-frame').getBoundingClientRect();
    const cs = getComputedStyle(r.querySelector('.jsu-wrap')), px = (v) => parseFloat(v);
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jsu-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jsu--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap + gg), pt: cs.paddingTop };
  });
  check('jsu--join, razmak = --gap + --g', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'ratrak-suvenirnica.png'), fullPage: true });
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  for (const [name, vw, vh] of [['laptop', 1280, 800], ['siroki', 1920, 1080], ['tablet', 900, 1100], ['telefon', 390, 844], ['uski-telefon', 340, 740]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
    check('natpisi pločica najviše u dva reda', S.labelLines <= 2, S.labelLines);
    if (name === 'telefon') check('telefon: oba dugmeta u jednom redu, 42px', S.acts[0][0] === S.acts[1][0] && S.acts[0][2] === 42, S.acts);
    await p.locator('#jsu-suvenirnica .jsu-frame').screenshot({ path: path.join(OUT, name + '.png') });
    if (name === 'telefon') {
      await p.click('#jsu-suvenirnica .jsu-gal');
      await p.waitForTimeout(400);
      await p.evaluate(() => document.querySelector('#jsu-lb img').decode().catch(() => {}));
      const box = await p.evaluate(() => { const r = document.querySelector('#jsu-lb img').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth }; });
      check('galerija na telefonu staje u ekran', box.w <= box.vw && box.h > 100, box);
      await p.screenshot({ path: path.join(OUT, 'galerija-telefon.png') });
      await p.click('#jsu-lb .jsu-lb-close');
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska)');
  ({ p, ctx, errors } = await open(browser, { reduced: true }));
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jsu-suvenirnica').className, hidden: [...document.querySelectorAll('#jsu-suvenirnica .jsu-sl,#jsu-suvenirnica .jsu-tile')].filter((e) => getComputedStyle(e).opacity !== '1').length }));
  check('odmah vidljivo, bez klasa za ulazak', !/jsu-anim/.test(rm.cls) && rm.hidden === 0, rm);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
