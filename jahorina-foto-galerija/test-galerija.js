// Test foto galerije na PRAVOJ stranici www.oc-jahorina.com/foto-galerija/ (Betheme, header, traka naslova,
// prave slike i REST API sa sajta). Stranica se u pregledniku preuredi kao poslije jednokratnog snippeta:
// red widgeta na vrhu + po album Naslov i Basic Gallery (fotografije iz albumi.json). galerija.js se servira
// lokalno (radni fajl). Alt: kao poslije snippeta (iz albumi.json), a scenario „prazan alt“ kao danas.
// Pokretanje (iz ovog foldera): NODE_PATH=$(npm root -g) node test-galerija.js [folder-za-screenshotove]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const SITE = 'https://www.oc-jahorina.com';
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'albumi.json'), 'utf8'));
const JS = fs.readFileSync(path.join(__dirname, 'galerija.js'));
const LINE = execFileSync('python3', [path.join(__dirname, 'napravi-widget.py'), '--proba'], { encoding: 'utf8' });
fs.mkdirSync(OUT, { recursive: true });

// stranica kao poslije snippeta: jedan Basic Gallery → HTML widget + 5 × (Naslov + Basic Gallery)
function preuredi(html) {
  // stranica je već preuređena snippetom (21. 10.): samo se red widgeta zamijeni probnim
  const i0 = html.indexOf('<style id="jfg-skrij">');
  if (i0 > -1) {
    const i1 = html.indexOf('</script>', i0) + 9;
    return { html: html.slice(0, i0) + LINE + html.slice(i1), count: (html.match(/<dl class='gallery-item'/g) || []).length };
  }
  const mark = 'elementor-widget elementor-widget-image-gallery';
  const at = html.indexOf(mark);
  if (at < 0) throw new Error('na stranici nema Basic Gallery widgeta');
  const start = html.lastIndexOf('<div', at);
  let depth = 0, i = start, end = -1;
  const re = /<div\b|<\/div>/g; re.lastIndex = start;
  for (let m; (m = re.exec(html));) { depth += m[0] === '</div>' ? -1 : 1; if (!depth) { end = re.lastIndex; break; } }
  const block = html.slice(start, end);
  const first = block.indexOf('<dl'), last = block.lastIndexOf('</dl>') + 5;
  const items = {};
  for (const dl of block.slice(first, last).match(/<dl class='gallery-item'[\s\S]*?<\/dl>/g)) {
    const h = decodeURIComponent(/data-e-action-hash="([^"]+)"/.exec(dl)[1]).split('settings=')[1];
    items[JSON.parse(Buffer.from(h, 'base64').toString()).id] = dl;
  }
  const gal = (ids, n) => block.slice(0, first).replace(/sc_gallery-1/g, 'sc_gallery-' + n) + ids.map(id => items[id]).join('') + block.slice(last);
  const head = t => '<div class="elementor-element elementor-widget elementor-widget-heading" data-widget_type="heading.default"><div class="elementor-widget-container">' +
    '<h2 class="elementor-heading-title elementor-size-default">' + t + '</h2></div></div>';
  const out = '<div class="elementor-element elementor-widget elementor-widget-html" data-widget_type="html.default"><div class="elementor-widget-container">' + LINE + '</div></div>' +
    DATA.albumi.map((al, k) => head('[:SH]' + al.sr + '[:en]' + al.en + '[:]') + gal(al.ids, k + 1)).join('');
  return { html: html.slice(0, start) + out + html.slice(end), count: Object.keys(items).length };
}

const fails = [];
function ok(cond, msg) { if (!cond) fails.push(msg); console.log((cond ? '  ✓ ' : '  ✗ ') + msg); }

(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  const cases = [
    ['racunar', { width: 1440, height: 900 }, false, '/foto-galerija/', true],
    ['telefon', { width: 390, height: 844 }, true, '/foto-galerija/', true],
    ['en-telefon', { width: 390, height: 844 }, true, '/en/foto-galerija/', true],
    ['prazan-alt', { width: 1280, height: 800 }, false, '/foto-galerija/', false],
  ];
  for (const [name, vp, mobile, url, withAlt] of cases) {
    console.log(name);
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = [];
    // greške koje sajt ima i bez galerije (provjereno na originalnoj stranici) se ne računaju
    p.on('pageerror', e => { if (!/^(jQuery|grecaptcha) is not defined$/.test(e.message)) errs.push(e.message); });
    await p.route(SITE + url, async route => {
      const r = await route.fetch();
      const x = preuredi(await r.text());
      ok(x.count === 62, 'na sajtu 62 fotografije u galeriji (' + x.count + ')');
      route.fulfill({ response: r, body: x.html, headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } });
    });
    await p.route('https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@proba/**', route =>
      route.fulfill({ body: JS, headers: { 'content-type': 'application/javascript; charset=utf-8', 'access-control-allow-origin': '*' } }));
    if (withAlt) await p.route(/\/wp-json\/wp\/v2\/media\?/, async route => {
      const r = await route.fetch(), j = await r.json();
      j.forEach(m => { const a = DATA.alt[m.id]; if (a) m.alt_text = '[:SH]' + a[0] + '[:en]' + a[1] + '[:]'; });
      route.fulfill({ response: r, body: JSON.stringify(j) });
    });
    await p.goto(SITE + url, { timeout: 90000, waitUntil: 'domcontentloaded' });
    await p.waitForSelector('#jfg-galerija .jfg-grid', { timeout: 30000 });
    await p.waitForTimeout(2500);
    const s = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('#jfg-galerija .jfg-link img')];
      const g = document.getElementById('jfg-galerija').getBoundingClientRect();
      return {
        h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
        h2: [...document.querySelectorAll('#jfg-galerija h2')].map(h => h.textContent),
        h2out: [...document.querySelectorAll('h2')].filter(h => !h.closest('#jfg-galerija') && h.offsetParent).map(h => h.textContent.trim()),
        n: imgs.length, alt: imgs.filter(i => i.alt.trim().length > 8).length, rawTags: imgs.filter(i => /\[:/.test(i.alt)).length,
        lazy: imgs.filter(i => i.loading === 'lazy').length, dim: imgs.filter(i => +i.getAttribute('width') > 0 && +i.getAttribute('height') > 0).length,
        srcset: imgs.filter(i => /480w/.test(i.srcset)).length, alt0: imgs[0] && imgs[0].alt,
        srcLeft: document.querySelectorAll('.elementor-widget-image-gallery, .elementor-widget-heading').length, skrij: !!document.getElementById('jfg-skrij'),
        visibleSrc: [...document.querySelectorAll('.elementor-widget-image-gallery, .elementor-widget-heading')].filter(e => e.offsetParent).length,
        overflow: document.documentElement.scrollWidth - innerWidth, left: Math.round(g.left), width: Math.round(g.width), vw: document.documentElement.clientWidth,
        bg: getComputedStyle(document.getElementById('Content') || document.body).backgroundColor,
        first: imgs.slice(0, 3).map(i => (i.currentSrc || '').split('/').pop()),
        rowsFull: [...document.querySelectorAll('.jfg-grid')].every(gr => { const R = {}; [...gr.children].forEach(li => { const r = li.getBoundingClientRect(); R[Math.round(r.top)] = Math.max(R[Math.round(r.top)] || 0, r.right); }); const w = gr.getBoundingClientRect().right; return Object.values(R).every(x => Math.abs(x - w) < 2); }),
        mobileHeavy: [...document.querySelectorAll('#jfg-galerija *, #jfg-galerija')].filter(e => { const c = getComputedStyle(e); return c.backdropFilter !== 'none' || (c.filter !== 'none' && c.filter) || c.animationIterationCount === 'infinite'; }).length
      };
    });
    ok(s.h1.length === 1 && /Foto galerija|Photo gallery/i.test(s.h1[0]), 'tačno jedan H1: ' + JSON.stringify(s.h1));
    ok(s.h2.length === 5, 'albumi su H2: ' + s.h2.join(' | '));
    ok(!s.h2out.length, 'nema drugih vidljivih H2 van galerije ' + JSON.stringify(s.h2out));
    ok(s.n === 62 && s.alt === 62 && !s.rawTags, 'svih 62 slika sa alt-om (bez [: oznaka): ' + s.alt + ' · „' + s.alt0 + '“');
    ok(s.lazy === 58 && s.dim === 62 && s.srcset === 62, 'lazy ' + s.lazy + '/58 (prve 4 odmah), width/height ' + s.dim + ', srcset ' + s.srcset + ' · ' + s.first.join(', '));
    ok(!s.srcLeft && !s.skrij, 'originalni widgeti uklonjeni iz stranice, #jfg-skrij uklonjen');
    ok(s.overflow <= 0 && Math.abs(s.left) <= 1 && Math.abs(s.width - s.vw) <= 1, 'puna širina, bez bočnog skrolovanja (' + s.left + ', ' + s.width + '/' + s.vw + ')');
    ok(s.rowsFull, 'svi redovi puni do desne ivice');
    ok(s.bg === 'rgb(10, 17, 32)', 'pozadina sadržaja tamna: ' + s.bg);
    if (mobile) ok(!s.mobileHeavy, 'telefon: bez backdrop-filter / filter / beskonačnih animacija u galeriji');
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    await p.screenshot({ path: path.join(OUT, name + '-cijela.png'), fullPage: true });
    // lightbox
    await p.click('.jfg-link[data-k="9"]');
    await p.waitForSelector('.jfg-lb__img.is-ld', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(400);
    const lb = await p.evaluate(() => ({ open: !document.getElementById('jfg-lb').hidden, cnt: document.querySelector('.jfg-lb__count').textContent,
      hi: document.querySelector('.jfg-lb__img').currentSrc.split('/').pop(), ld: document.querySelector('.jfg-lb__img').classList.contains('is-ld'),
      elementorLb: !!document.querySelector('.elementor-lightbox:not([style*="display: none"]) .swiper, .dialog-lightbox-widget:not([style*="display: none"])') }));
    ok(lb.open && lb.cnt === '10 / 62' && lb.ld && !lb.elementorLb, 'lightbox: ' + lb.cnt + ', ' + lb.hi + (lb.elementorLb ? ' + ELEMENTOROV LIGHTBOX' : ''));
    await p.screenshot({ path: path.join(OUT, name + '-lightbox.png') });
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
    ok(await p.$eval('.jfg-lb__count', e => e.textContent) === '11 / 62', 'strelica desno');
    await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    ok(await p.$eval('#jfg-lb', e => e.hidden), 'Esc zatvara');
    ok(errs.length === 0, 'bez JS grešaka ' + JSON.stringify(errs));
    await ctx.close();
  }
  // Elementor editor: galerija se ne preuređuje, originali vidljivi
  {
    console.log('editor');
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.route(SITE + '/foto-galerija/', async route => {
      const r = await route.fetch();
      route.fulfill({ response: r, body: preuredi(await r.text()).html.replace(/<body([^>]*)class="/, '<body$1class="elementor-editor-active '), headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } });
    });
    await p.route('https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@proba/**', route =>
      route.fulfill({ body: JS, headers: { 'content-type': 'application/javascript; charset=utf-8', 'access-control-allow-origin': '*' } }));
    await p.goto(SITE + '/foto-galerija/', { timeout: 90000, waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3000);
    const e = await p.evaluate(() => ({ note: (document.querySelector('#jfg-galerija p') || {}).textContent || '', grid: !!document.querySelector('.jfg-grid'),
      vis: [...document.querySelectorAll('.elementor-widget-image-gallery')].filter(x => getComputedStyle(x).visibility === 'visible' && x.offsetParent).length }));
    ok(!e.grid && e.vis === 5 && /uređuješ/.test(e.note), 'editor: 5 originalnih galerija vidljivo + napomena');
    await ctx.close();
  }
  await b.close();
  console.log(fails.length ? '\nNEUSPJELO: ' + fails.length : '\nSVE OK');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
