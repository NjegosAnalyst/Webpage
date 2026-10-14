// Simulacija sajta za sekciju Planina u brojkama (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (Početna zima sa brojkama), brojke.js,
// vijesti.js (iznad, za razmak; prazan WP odgovor), fotografije i fontovi se služe lokalno.
// Pokretanje: node test-brojke.js [folder-za-screenshotove] [folder-sa-fontovima]
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
  ul,ol{list-style:disc;margin:0 0 15px 30px} li{margin-bottom:8px}
  i{font-style:italic;color:red}
  p{margin:0 0 15px} img{max-width:100%;height:auto}
  .before,.after{padding:60px 20px;color:#444} .boxed{max-width:1140px;margin:0 auto;padding:0 10px}`;
function page({ attrs = '', sank = false, admin = false, boxed = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}${boxed ? '#jpb-brojke{width:900px!important}' : ''}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Snowboard park (iznad)</div>
  ${sank ? `<div class="boxed"><div class="elementor-widget-html"><div id="jv-vijesti"></div>
    <script src="${CDN}jahorina-home-sections/vijesti/vijesti.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jpb-brojke" ${attrs}></div>
    <script src="${CDN}jahorina-home-sections/brojke/brojke.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// Početna zima kako je danas (screenshot korisnika 10. 10. 2026): tekst + widgeti brojač/ikona sa natpisom
const W = (n, t) => `<div class="elementor-widget-counter"><div class="elementor-counter"><span class="elementor-counter-number" data-to-value="${n}">${n}</span></div><div class="elementor-counter-title">${t}</div></div>`;
const CONTENT = {
  sr: `<h1>JAHORINA</h1><p>54 kilometra idealno pripremljenih alpskih skijaških staza, uređenih po FIS standardima. Ukupno: 18 instalacija vertikalnog transporta.</p>
<p>10 homologovanih staza za noćno skijanje, uređenih po FIS standardima.</p>${W('600 m', 'sankalište')}${W('10', 'homologovanih staza za noćno skijanje')}
<h3>Olimp bar</h3><p>apres-ski žurke</p><h3>Ski &amp; Snowboard škola</h3><script>var x = "99 km staza";</script>`,
  en: `<h1>JAHORINA</h1><p>54 kilometers of ideally prepared alpine skiing slopes,groomed to FIS standards. In total: 18 vertical transport installations.</p>
<p>10 homologated ski slopes for night skiing, groomed to FIS standards.</p>${W('600 m', 'sledding track')}${W('10', 'homologated night ski trails')}
<h3>Olimp bar</h3><p>apres-ski parties</p><h3>Ski &amp; Snowboard school</h3>`,
  // nove brojke u tekstu (WordPress se promijenio)
  novo: `<p>Na Jahorini vas čeka 65 km uređenih staza i ukupno 21 žičara. Noću skijate na 12 staza za noćno skijanje, a sankalište je dugo 1.200 metara.</p>`,
  // tekst bez sankališta
  djelimicno: `<p>54 kilometra idealno pripremljenih alpskih skijaških staza. Ukupno: 18 instalacija vertikalnog transporta.</p>`,
  qtranslate: `<p>[:SH]54 kilometra idealno pripremljenih alpskih skijaških staza, uređenih po FIS standardima. Ukupno: 18 instalacija vertikalnog transporta.[:en]70 kilometers of ideally prepared alpine skiing slopes. In total: 18 vertical transport installations.[:]</p>
<p>[:SH]10 homologovanih staza za noćno skijanje.[:en]11 homologated ski slopes for night skiing.[:]</p><p>[:SH]600 m sankalište[:en]600 m sledding track[:]</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

// wp: 'sr', 'en', 'novo', 'djelimicno', 'qtranslate', 'upozorenje', 'greska', 'nema'
async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'sr', sank = false, admin = false, touch = false, boxed = false, wait = true } = {}) {
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
      return route.fulfill({ contentType: ct, body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } });
    }
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      const q = decodeURIComponent(u.pathname + u.search);
      if (/categories|posts|media/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // vijesti iznad: prazan odgovor
      rest.push(q);
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      const enRoute = u.pathname.startsWith('/en/wp-json/');
      if (enRoute && wp !== 'en') return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/pages/.test(q)) {
        const json = (a) => route.fulfill({ contentType: 'application/json', body: (wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '') + JSON.stringify(a) });
        if (wp === 'nema') return json([]);
        const m = q.match(/slug=([^&]+)/), slug = m && m[1];
        const body = CONTENT[wp === 'upozorenje' ? 'sr' : wp] || CONTENT.sr;
        if (slug === 'pocetna-zima' || slug === 'o-nama') return json([{ id: 5, link: SITE + '/' + slug + '/', title: { rendered: 'Početna zima' }, content: { rendered: body } }]);
        return json([]);
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, sank, admin, boxed }) });
    return route.abort();
  });
  await p.addInitScript(({ mode }) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, { mode: ga });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jpb-brojke .jpb-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.evaluate(() => { const im = document.querySelector('#jpb-brojke .jpb-ph img'); window.__lazy = im && im.getAttribute('loading'); });
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  if (wait) await p.locator('#jpb-brojke .jpb-frame').scrollIntoViewIfNeeded();
  // ulazak: kadar i naslov, uže (~2,2 s), kabina prođe (~1,5 + 3 s), koluti (~2 s)
  if (wait) {
    await p.waitForFunction(() => { const r = document.getElementById('jpb-brojke'); return !r.classList.contains('jpb-anim') || r.classList.contains('jpb-on'); }, null, { timeout: 8000 });
    await p.waitForTimeout(reduced ? 300 : 7000);
  }
  return { ctx, p, errors, rest };
}
// brojke kako ih čitač ekrana čuje + kako stoje koluti (vidljiva cifra = položaj koluta)
const info = (p) => p.evaluate(() => {
  const r = document.getElementById('jpb-brojke'), q = (s) => r.querySelector(s), cs = (e) => getComputedStyle(e);
  const nums = [...r.querySelectorAll('.jpb-num')].map((li) => {
    const shown = [...li.querySelectorAll('.jpb-ds > *')].map((el) => {
      if (!el.classList.contains('jpb-d')) return el.textContent;
      const reel = el.querySelector('.jpb-reel'), m = new DOMMatrix(cs(reel).transform), h = el.getBoundingClientRect().height;
      return String(Math.round(-m.m42 / h) % 10);
    }).join('');
    return { sr: li.querySelector('.jpb-sr').textContent.trim(), shown, l: li.querySelector('h3.jpb-l').textContent.trim() };
  });
  const fr = q('.jpb-frame').getBoundingClientRect(), body = q('.jpb-body').getBoundingClientRect(), ph = q('.jpb-ph').getBoundingClientRect();
  return {
    h1: document.querySelectorAll('h1').length, h3: r.querySelectorAll('h3').length, vHidden: [...r.querySelectorAll('.jpb-v')].every((v) => v.getAttribute('aria-hidden') === 'true'),
    alt: q('.jpb-ph img').alt, lazy: window.__lazy, dims: q('.jpb-ph img').getAttribute('width') + 'x' + q('.jpb-ph img').getAttribute('height'),
    eyeLs: cs(q('.jpb-eye')).letterSpacing, eyeCol: cs(q('.jpb-eye')).color,
    backBlur: cs(q('.jpb-back')).backdropFilter || cs(q('.jpb-back')).webkitBackdropFilter || 'none', imgFilter: cs(q('.jpb-ph img')).filter, tintBlend: cs(q('.jpb-tint')).mixBlendMode,
    nums, eyebrow: q('.jpb-eye').textContent, h2: q('h2').textContent, lead: q('.jpb-lead').textContent,
    why: q('.jpb-why') ? q('.jpb-why').textContent : '', link: q('.jpb-link') ? q('.jpb-link').textContent.trim() : '',
    rootW: r.getBoundingClientRect().width, rootL: r.getBoundingClientRect().left, docW: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth,
    frameL: fr.left, frameW: fr.width, frameH: fr.height, frameTop: fr.top - r.getBoundingClientRect().top, bodyL: q('.jpb-eye').getBoundingClientRect().left, bodyR: body.right, bodyB: body.bottom, frameB: fr.bottom, phL: ph.left, phTop: ph.top, phH: ph.height,
    h2Color: cs(q('h2 span')).color, h2Font: cs(q('h2')).fontFamily, oStroke: cs(q('h2 .jpb-o')).webkitTextStrokeWidth,
    vFont: cs(q('.jpb-v')).fontFamily, vSize: parseFloat(cs(q('.jpb-v')).fontSize), liStyle: cs(q('.jpb-num')).listStyleType,
    lamp: [q('.jpb-ph').style.getPropertyValue('--lx'), q('.jpb-ph').style.getPropertyValue('--ly')], lampOp: +cs(q('.jpb-lamp')).opacity,
    join: r.classList.contains('jpb--join'), boxed: r.classList.contains('jpb--boxed'), anim: r.classList.contains('jpb-anim'),
    chairs: r.querySelectorAll('.jpb-chair').length, on: r.querySelectorAll('.jpb-num.is-on').length, wires: r.querySelectorAll('.jpb-cable .jpb-wire').length,
    wire: !!q('.jpb-cable .jpb-wire') && q('.jpb-cable .jpb-wire').getTotalLength() > 100,
    // uže prolazi kroz hvataljke: razmak sredine hvataljke i užeta (px), najveći
    gripGap: Math.max(...[...r.querySelectorAll('.jpb-grip')].map((g) => { const b = g.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      return Math.min(...[...r.querySelectorAll('.jpb-wire')].map((wr) => { const m = wr.getScreenCTM(), L = wr.getTotalLength(); let best = 1e9;
        for (let k = 0; k <= 400; k++) { const pt = wr.getPointAtLength(L * k / 400), sx = m.a * pt.x + m.c * pt.y + m.e, sy = m.b * pt.x + m.d * pt.y + m.f; if (Math.abs(sx - x) < 3) best = Math.min(best, Math.abs(sy - y)); }
        return best; })); })),
    mix: r.querySelectorAll('.jpb-mix, .jpb-key').length, sub1: r.querySelector('.jpb-num .jpb-s').textContent,
    sway: cs(q('.jpb-sw')).animationName, vis: r.classList.contains('jpb-vis'),
    numFits: [...r.querySelectorAll('.jpb-back')].every((bk) => { const v = bk.querySelector('.jpb-v').getBoundingClientRect(), b = bk.getBoundingClientRect(); return v.width <= b.width - 8 && v.height <= b.height; }),
    numsTop: r.querySelector('.jpb-nums').getBoundingClientRect().top, leadB: q('.jpb-lead').getBoundingClientRect().bottom, imgOk: q('.jpb-ph img').naturalWidth > 0, alt: q('.jpb-ph img').alt,
  };
});
const NUMS = (i) => i.nums.map((n) => n.sr).join(' | ');
const SHOWN = (i) => i.nums.map((n) => n.shown).join(' | ');

(async () => {
  const browser = await chromium.launch();
  let r, i;

  console.log('\n1) Računar 1440, vijesti iznad, brojke iz WordPressa (Početna zima)');
  r = await open(browser, { sank: true });
  i = await info(r.p);
  check('nema JS grešaka', r.errors.length === 0, r.errors);
  check('pita WordPress: pages?slug=pocetna-zima', r.rest.some((x) => /wp\/v2\/pages\?slug=pocetna-zima/.test(x)), r.rest);
  check('brojke: 54 km · 18 · 10 · 600 m', NUMS(i) === '54 km | 18 | 10 | 600 m', NUMS(i));
  check('koluti stoje na brojkama poslije ulaska', SHOWN(i) === '54 | 18 | 10 | 600', SHOWN(i));
  check('H3 po brojci (broj + natpis)', i.nums.map((n) => n.l).join(' | ') === '54 km alpskih skijaških staza | 18 žičara i ski liftova | 10 staza za noćno skijanje | 600 m staza sankališta', i.nums.map((n) => n.l));
  check('SEO: 0 × H1, H2 „Olimpijska planina“, 4 × H3, cifre u sjedištu aria-hidden', i.h1 === 0 && i.h2 === 'Olimpijskaplanina' && i.h3 === 4 && i.vHidden, [i.h1, i.h2, i.h3, i.vHidden]);
  check('SEO: slika alt (Olimpijska planina Jahorina), lazy, width/height', /Olimpijskoj planini Jahorina/.test(i.alt) && i.lazy === 'lazy' && i.dims === '2000x1334', [i.alt, i.lazy, i.dims]);
  check('SEO: uvod sa „ski centra Jahorina“', /ski centra Jahorina/.test(i.lead), i.lead);
  check('nadnaslov = mali tekst hero-a (5 px, .75)', i.eyeLs === '5px' && /0\.75\)$/.test(i.eyeCol), [i.eyeLs, i.eyeCol]);
  check('nadnaslov i naslov', i.eyebrow === 'Planina u brojkama' && i.h2 === 'Olimpijskaplanina', [i.eyebrow, i.h2]);
  check('uvod bez brojki (ne ponavlja podatke)', !/\d/.test(i.lead), i.lead);
  check('puna širina ekrana bez horizontalnog skrola', Math.abs(i.rootW - i.docW) < 1 && i.rootL === 0 && i.scrollW <= i.docW, [i.rootW, i.docW, i.scrollW]);
  check('kadar: rub kao hero (22 px)', Math.abs(i.frameL - 22) < 1.5, i.frameL);
  check('naslov lijevo na mreži 1240', Math.abs(i.bodyL - (1440 - 1240) / 2 - 48) < 3, i.bodyL);
  check('brojke stanu u kadar', i.bodyB <= i.frameB + 1, [i.bodyB, i.frameB]);
  check('fotografija preko cijelog kadra', Math.abs(i.phL - i.frameL) < 1 && i.imgOk, i.phL);
  check('ispod vijesti: samo rub (join)', i.join, i.frameTop);
  check('Betheme ne mijenja naslov (bijel, Archivo, obris)', i.h2Color === 'rgb(255, 255, 255)' && /Archivo/.test(i.h2Font) && i.oStroke === '1.6px', [i.h2Color, i.h2Font, i.oStroke]);
  check('brojke Archivo, velike', /Archivo/.test(i.vFont) && i.vSize >= 60, [i.vFont, i.vSize]);
  check('bez tačkica liste iz teme', i.liStyle === 'none', i.liStyle);
  check('uže žičare i 4 sjedišta šestosjeda, sva stigla', i.wire && i.chairs === 4 && i.on === 4 && i.wires === 1, [i.wire, i.chairs, i.on, i.wires]);
  check('uže prolazi kroz hvataljke sjedišta', i.gripGap < 4, i.gripGap);
  check('brojke stanu u naslone sjedišta', i.numFits, i.numFits);
  check('sjedišta ispod naslova', i.numsTop > i.leadB, [i.numsTop, i.leadB]);
  check('bez trake staza po težini (korisnik); ispod km stoji FIS', i.mix === 0 && i.sub1 === 'Uređene po FIS standardima', [i.mix, i.sub1]);
  check('sjedišta se njišu dok je blok na ekranu', i.sway === 'jpbSway' && i.vis, [i.sway, i.vis]);
  await r.p.mouse.move(5, 5);
  const ch = await r.p.locator('#jpb-brojke .jpb-num').nth(1).locator('.jpb-back').boundingBox();
  await r.p.mouse.move(ch.x + ch.width / 2, ch.y + ch.height / 2);
  await r.p.waitForTimeout(250);
  const hit = await r.p.evaluate(() => { const li = document.querySelectorAll('#jpb-brojke .jpb-num')[1]; return { hit: li.classList.contains('is-hit'), anim: getComputedStyle(li.querySelector('.jpb-hit')).animationName }; });
  check('prelaz mišem: sjedište se zaljulja', hit.hit && hit.anim === 'jpbHit', hit);
  await r.p.waitForTimeout(2200);
  i = await info(r.p);
  check('poslije ljuljanja brojke opet stoje na mjestu', SHOWN(i) === '54 | 18 | 10 | 600', SHOWN(i));
  check('reflektor upaljen, svjetlo na lampi fotografije', i.lampOp > .9 && parseFloat(i.lamp[0]) > 400, [i.lampOp, i.lamp]);
  check('bez linka kad nije zadan', i.link === '', i.link);
  await r.p.screenshot({ path: path.join(OUT, '1-racunar-1440.png'), clip: { x: 0, y: (await r.p.locator('#jpb-brojke').boundingBox()).y - 140, width: 1440, height: 1040 } });
  await r.p.locator('#jpb-brojke').screenshot({ path: path.join(OUT, '1b-racunar-blok.png') });
  await r.ctx.close();

  console.log('\n2) Ulazak: koluti kreću od nule, pa se zavrte');
  r = await open(browser, { wait: false, sank: true });
  await r.p.evaluate(() => window.scrollTo(0, 0));
  const pre = await r.p.evaluate(() => { const r = document.getElementById('jpb-brojke'); return { anim: r.classList.contains('jpb-anim'), on: r.classList.contains('jpb-on') }; });
  check('prije ulaska: animacija spremna, nije pokrenuta', pre.anim && !pre.on, pre);
  await r.p.locator('#jpb-brojke .jpb-frame').scrollIntoViewIfNeeded();
  await r.p.waitForTimeout(1750);
  const mid = await r.p.evaluate(() => document.querySelectorAll('#jpb-brojke .jpb-num.is-on').length);
  check('sjedišta stižu jedno za drugim', mid >= 1 && mid < 4, mid);
  await r.p.screenshot({ path: path.join(OUT, '2-ulazak-sjedista.png') });
  await r.p.waitForTimeout(5200);
  i = await info(r.p);
  check('poslije ulaska koluti stoje na brojkama', SHOWN(i) === '54 | 18 | 10 | 600', SHOWN(i));
  await r.ctx.close();

  console.log('\n3) Nove brojke u WordPressu (65 km, 21, 12, 1.200 m)');
  r = await open(browser, { wp: 'novo' });
  i = await info(r.p);
  check('brojke iz teksta', NUMS(i) === '65 km | 21 | 12 | 1.200 m', NUMS(i));
  check('koluti pokazuju nove brojke (tačka hiljada stoji)', SHOWN(i) === '65 | 21 | 12 | 1.200', SHOWN(i));
  await r.p.locator('#jpb-brojke').screenshot({ path: path.join(OUT, '3-nove-brojke.png') });
  await r.ctx.close();

  console.log('\n4) Admin: stranica nema sve brojke → ugrađene + razlog');
  r = await open(browser, { wp: 'djelimicno', admin: true });
  i = await info(r.p);
  check('nađene iz teksta, ostale ugrađene', NUMS(i) === '54 km | 18 | 10 | 600 m', NUMS(i));
  check('admin vidi šta nedostaje', /nema: staza za noćno skijanje, staza sankališta/.test(i.why), i.why);
  await r.ctx.close();
  r = await open(browser, { wp: 'djelimicno' });
  i = await info(r.p);
  check('posjetilac ne vidi tehnički razlog', i.why === '', i.why);
  await r.ctx.close();

  console.log('\n5) Greška WordPressa (403) i stranica ne postoji');
  r = await open(browser, { wp: 'greska', admin: true });
  i = await info(r.p);
  check('ugrađene brojke', NUMS(i) === '54 km | 18 | 10 | 600 m', NUMS(i));
  check('admin vidi HTTP 403', /HTTP 403 · pages/.test(i.why), i.why);
  check('nema JS grešaka', r.errors.length === 0, r.errors);
  await r.ctx.close();
  r = await open(browser, { wp: 'nema', admin: true });
  i = await info(r.p);
  check('admin: stranica nije pronađena', /stranica "pocetna-zima" nije pronađena/.test(i.why), i.why);
  await r.ctx.close();

  console.log('\n6) "Prljav" JSON (PHP upozorenje ispred podataka)');
  r = await open(browser, { wp: 'upozorenje', admin: true });
  i = await info(r.p);
  check('brojke pročitane', NUMS(i) === '54 km | 18 | 10 | 600 m' && i.why === '', [NUMS(i), i.why]);
  await r.ctx.close();

  console.log('\n7) Ručne brojke i link (data-*)');
  r = await open(browser, { attrs: 'data-km="60" data-sankanje="650" data-stranica="o-nama" data-link="/ski-staze/" data-link-tekst="Mapa staza"', wp: 'sr' });
  i = await info(r.p);
  check('data-km i data-sankanje imaju prednost, ostalo iz WP', NUMS(i) === '60 km | 18 | 10 | 650 m', NUMS(i));
  check('data-stranica', r.rest.some((x) => /slug=o-nama/.test(x)), r.rest);
  check('tih link', i.link === 'Mapa staza', i.link);
  await r.p.click('#jpb-brojke .jpb-link');
  const ev = await r.p.evaluate(() => window.__ev);
  check('GA: brojke_klik (cilj: link)', ev.some((e) => e[1] === 'brojke_klik' && e[2].cilj === 'link' && e[2].jezik === 'sr'), ev);
  await r.ctx.close();
  r = await open(browser, { attrs: 'data-km="54" data-zicare="18" data-nocne="10" data-sankanje="600"' });
  check('sve ručno → WordPress se ne pita', r.rest.length === 0, r.rest);
  await r.ctx.close();

  console.log('\n8) EN (/en/), qTranslate');
  r = await open(browser, { path: '/en/pocetna-zima/', wp: 'en' });
  i = await info(r.p);
  check('EN tekst', i.eyebrow === 'The mountain in numbers' && i.h2 === 'An Olympicmountain', [i.eyebrow, i.h2]);
  check('EN brojke iz /en/wp-json', NUMS(i) === '54 km | 18 | 10 | 600 m' && r.rest[0].startsWith('/en/wp-json/'), [NUMS(i), r.rest[0]]);
  await r.ctx.close();
  r = await open(browser, { path: '/en/pocetna-zima/', wp: 'qtranslate' });
  i = await info(r.p);
  check('qTranslate EN dio (70 km, 11 noćnih)', NUMS(i) === '70 km | 18 | 11 | 600 m', NUMS(i));
  await r.ctx.close();
  r = await open(browser, { wp: 'qtranslate' });
  i = await info(r.p);
  check('qTranslate SR dio', NUMS(i) === '54 km | 18 | 10 | 600 m', NUMS(i));
  await r.ctx.close();

  console.log('\n9) Smanjeno kretanje: sve odmah na mjestu');
  r = await open(browser, { reduced: true });
  i = await info(r.p);
  check('bez animacije, koluti na brojkama, sve upaljeno', !i.anim && SHOWN(i) === '54 | 18 | 10 | 600' && i.lampOp > .9 && i.on === 4, [i.anim, SHOWN(i), i.lampOp, i.on]);
  await r.ctx.close();

  console.log('\n10) Ekrani: 1920, 1180, tablet 820, telefon 390 i 360, uži kontejner');
  for (const [vw, vh, name, touch] of [[1920, 1080, '4-racunar-1920', false], [1180, 820, '5-laptop-1180', false], [820, 1180, '6-tablet-820', true], [390, 844, '7-telefon-390', true], [360, 740, '8-telefon-360', true]]) {
    r = await open(browser, { vw, vh, touch, sank: vw === 390 });
    i = await info(r.p);
    check(name + ': bez horizontalnog skrola i grešaka', i.scrollW <= i.docW && r.errors.length === 0, [i.scrollW, i.docW, r.errors]);
    check(name + ': brojke stanu u kadar', i.bodyB <= i.frameB + 1 && i.bodyR <= i.docW, [i.bodyB, i.frameB, i.bodyR]);
    if (vw <= 980) check(name + ': fotografija gore, tekst ispod', i.phTop < i.frameB && i.phL <= i.frameL + 1, [i.phTop, i.phL]);
    if (vw <= 760) check(name + ': brzina — bez backdrop-filter, filtera slike i mix-blend-mode', i.backBlur === 'none' && i.imgFilter === 'none' && i.tintBlend === 'normal', [i.backBlur, i.imgFilter, i.tintBlend]);
    check(name + ': uže kroz hvataljke, 4 sjedišta, brojke stanu u naslone', i.wire && i.chairs === 4 && i.on === 4 && i.gripGap < 4 && i.numFits && i.wires === (vw <= 760 ? 2 : 1), [i.wires, i.chairs, i.on, i.gripGap, i.numFits]);
    if (vw === 1920) check(name + ': tekst na mreži 1240', Math.abs(i.bodyL - (1920 - 1240) / 2 - 48) < 3, i.bodyL);
    await r.p.locator('#jpb-brojke').screenshot({ path: path.join(OUT, name + '.png') });
    await r.ctx.close();
  }
  r = await open(browser, { boxed: true });
  i = await info(r.p);
  check('uži kontejner teme → blok se raširi na cijeli ekran', Math.abs(i.rootW - i.docW) < 1 && !i.boxed, [i.rootW, i.docW]);
  await r.ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera NIJE prošlo` : '\nSve provjere su prošle');
  process.exit(fails ? 1 : 0);
})();
