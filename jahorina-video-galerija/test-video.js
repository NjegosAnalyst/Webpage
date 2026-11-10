// Test video galerije na PRAVOJ stranici www.oc-jahorina.com/video-galerija/ (Betheme, Elementor, header, traka naslova).
// Stranica se u pregledniku preuredi kao poslije jednokratnog snippeta: HTML widget (red) + Video widgeti sa spiska.
// video.js se servira lokalno. YouTube (sličice, plejer) i noembed su iz kontejnera blokirani — provjerava se
// da stranica sama NE traži ništa od YouTube-a, a da plejer na klik dobije pravu youtube-nocookie adresu.
// Pokretanje (iz ovog foldera): NODE_PATH=$(npm root -g) node test-video.js [folder-za-screenshotove]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const SITE = 'https://www.oc-jahorina.com';
const VIDEI = JSON.parse(fs.readFileSync(path.join(__dirname, 'videi.json'), 'utf8')).videi;
const JS = fs.readFileSync(path.join(__dirname, 'video.js'));
const LINE = execFileSync('python3', [path.join(__dirname, 'napravi-widget.py'), '--proba'], { encoding: 'utf8' });
fs.mkdirSync(OUT, { recursive: true });

function preuredi(html, editor) {
  if (html.indexOf('<style id="jvg-skrij">') > -1) {   // već preuređeno snippetom: samo probni red
    const i0 = html.indexOf('<style id="jvg-skrij">'), i1 = html.indexOf('</script>', html.indexOf('</script>', i0) + 9) + 9;
    html = html.slice(0, i0) + LINE + html.slice(i1);
  } else {
    const a = html.indexOf('<section class="elementor-section elementor-top-section');
    const b = html.lastIndexOf('</section>', html.indexOf('<!-- mfn_hook_content_after')) + 10;
    const vid = id => '<div class="elementor-element elementor-widget elementor-widget-video" data-element_type="widget" data-settings="{&quot;youtube_url&quot;:&quot;https:\\/\\/www.youtube.com\\/watch?v=' + id +
      '&quot;,&quot;video_type&quot;:&quot;youtube&quot;,&quot;controls&quot;:&quot;yes&quot;}" data-widget_type="video.default"><div class="elementor-widget-container"><div class="elementor-wrapper elementor-open-inline"><div class="elementor-video"></div></div></div></div>';
    const sec = '<section class="elementor-section elementor-top-section elementor-element elementor-section-boxed" data-element_type="section"><div class="elementor-container elementor-column-gap-default">' +
      '<div class="elementor-column elementor-col-100 elementor-top-column elementor-element" data-element_type="column"><div class="elementor-widget-wrap elementor-element-populated">' +
      '<div class="elementor-element elementor-widget elementor-widget-html" data-element_type="widget" data-widget_type="html.default"><div class="elementor-widget-container">' + LINE + '</div></div>' +
      VIDEI.map(vid).join('') + '</div></div></div></section>';
    html = html.slice(0, a) + sec + html.slice(b);
  }
  return editor ? html.replace(/<body([^>]*)class="/, '<body$1class="elementor-editor-active ') : html;
}
const fails = [];
function ok(c, m) { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); }

(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  // 0) bez reda: Elementor zaista pokreće YouTube (da test „uspavljivanja“ ima smisla)
  {
    const p = await b.newPage(); const yt = [];
    p.on('request', r => { if (/youtube\.com|ytimg\.com/.test(r.url())) yt.push(r.url()); });
    await p.goto(SITE + '/video-galerija/', { timeout: 90000 }); await p.waitForTimeout(4000);
    console.log('originalna stranica: YouTube zahtjeva ' + yt.length + ', iframe ' + await p.$$eval('iframe', f => f.length));
    await p.close();
  }
  for (const [name, vp, mobile, url] of [['racunar', { width: 1440, height: 900 }, false, '/video-galerija/'], ['telefon', { width: 390, height: 844 }, true, '/video-galerija/'], ['en-telefon', { width: 390, height: 844 }, true, '/en/video-galerija/']]) {
    console.log(name);
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage(); const errs = [], yt = [];
    p.on('pageerror', e => { if (!/^(jQuery|grecaptcha) is not defined$/.test(e.message)) errs.push(e.message); });
    p.on('request', r => { if (/youtube(-nocookie)?\.com\/(embed|iframe_api|s\/player)|www-widgetapi/.test(r.url())) yt.push(r.url()); });
    await p.route(SITE + url, async route => { const r = await route.fetch(); route.fulfill({ response: r, body: preuredi(await r.text()), headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } }); });
    await p.route('https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@proba/**', r => r.fulfill({ body: JS, headers: { 'content-type': 'application/javascript; charset=utf-8', 'access-control-allow-origin': '*' } }));
    await p.goto(SITE + url, { timeout: 90000, waitUntil: 'domcontentloaded' });
    await p.waitForSelector('#jvg-galerija .jvg-grid', { timeout: 30000 });
    await p.waitForTimeout(4000);
    const s = await p.evaluate(() => {
      const g = document.getElementById('jvg-galerija').getBoundingClientRect(), f = document.querySelector('.jf-wp');
      return { h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()), h2: [...document.querySelectorAll('#jvg-galerija h2')].map(h => h.textContent.trim()),
        h3: document.querySelectorAll('#jvg-galerija h3').length, thumbs: [...document.querySelectorAll('.jvg-thumb img')].map(i => i.getAttribute('src').split('/vi/')[1]),
        lazy: document.querySelectorAll('.jvg-thumb img[loading="lazy"]').length, dim: document.querySelectorAll('.jvg-thumb img[width][height]').length,
        src: document.querySelectorAll('.elementor-widget-video').length, iframes: document.querySelectorAll('iframe').length, skrij: !!document.getElementById('jvg-skrij'),
        ov: document.documentElement.scrollWidth - innerWidth, left: Math.round(g.left), width: Math.round(g.width), vw: document.documentElement.clientWidth,
        gap: f ? Math.round(f.getBoundingClientRect().top - g.bottom) : null, bg: [...document.querySelectorAll('html, body, #Wrapper')].map(e => getComputedStyle(e).backgroundColor),
        intro: document.querySelector('.jvg-intro').textContent, eb: document.querySelector('.jvg-eyebrow').textContent };
    });
    ok(s.h1.length === 1, 'tačno jedan H1: ' + JSON.stringify(s.h1));
    ok(s.h2.length === 2 && /^(Video|Videos)$/.test(s.h2[1]), 'H2: istaknuti video + „' + s.h2[1] + '“');
    ok(s.h3 === VIDEI.length - 1, 'H3 za ostale videe: ' + s.h3);
    ok(JSON.stringify(s.thumbs.map(t => t.split('/')[0])) === JSON.stringify(VIDEI), 'videi sa spiska, ovim redoslijedom: ' + s.thumbs.join(' '));
    ok(s.lazy === VIDEI.length - 1 && s.dim === VIDEI.length, 'sličice lazy (osim istaknute) + width/height');
    ok(!s.src && !s.iframes && !yt.length && !s.skrij, 'nijedan YouTube plejer pri učitavanju (iframe 0, zahtjeva ' + yt.length + '), originalni widgeti uklonjeni');
    ok(s.ov <= 0 && Math.abs(s.left) <= 1 && Math.abs(s.width - s.vw) <= 1, 'puna širina, bez bočnog skrolovanja');
    ok(s.bg.every(c => c === 'rgb(10, 17, 32)'), 'tamna pozadina do footera (html, body, #Wrapper)');
    ok(/Olimpijske planine Jahorina\.|Olympic Mountain Jahorina\./.test(s.intro), 'uvod: „' + s.eb + '“ · ' + s.intro.slice(-60));
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    await p.screenshot({ path: path.join(OUT, name + '-cijela.png'), fullPage: true });
    await p.click('.jvg-item .jvg-thumb'); await p.waitForTimeout(800);
    const lb = await p.evaluate(() => ({ open: !document.getElementById('jvg-lb').hidden, cnt: document.querySelector('.jvg-lb__count').textContent, src: (document.querySelector('#jvg-lb iframe') || {}).src || '' }));
    ok(lb.open && lb.cnt === '2 / ' + VIDEI.length && lb.src.indexOf('https://www.youtube-nocookie.com/embed/' + VIDEI[1] + '?autoplay=1') === 0, 'plejer na klik: ' + lb.cnt + ' · ' + lb.src.slice(0, 70));
    await p.screenshot({ path: path.join(OUT, name + '-plejer.png') });
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
    ok((await p.$eval('#jvg-lb iframe', f => f.src)).indexOf(VIDEI[2]) > -1, 'strelica desno → sljedeći video');
    await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    ok(await p.$eval('#jvg-lb', e => e.hidden) && !(await p.$$('#jvg-lb iframe')).length, 'Esc zatvara i zaustavi video');
    ok(!errs.length, 'bez JS grešaka ' + JSON.stringify(errs));
    await ctx.close();
  }
  {
    console.log('editor');
    const p = await b.newPage();
    await p.route(SITE + '/video-galerija/?elementor-preview=957', async route => { const r = await route.fetch(); route.fulfill({ response: r, body: preuredi(await r.text(), true), headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } }); });
    await p.route('https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@proba/**', r => r.fulfill({ body: JS, headers: { 'content-type': 'application/javascript; charset=utf-8', 'access-control-allow-origin': '*' } }));
    await p.goto(SITE + '/video-galerija/?elementor-preview=957', { timeout: 90000 }); await p.waitForTimeout(3000);
    const e = await p.evaluate(() => ({ note: (document.querySelector('#jvg-galerija p') || {}).textContent || '', grid: !!document.querySelector('.jvg-grid'),
      w: [...document.querySelectorAll('.elementor-widget-video')].filter(x => x.getAttribute('data-widget_type') === 'video.default' && getComputedStyle(x).visibility === 'visible').length }));
    ok(!e.grid && e.w === VIDEI.length && /Video widgete/.test(e.note), 'editor: Video widgeti netaknuti i vidljivi + napomena');
    await p.close();
  }
  await b.close();
  console.log(fails.length ? '\nNEUSPJELO: ' + fails.length : '\nSVE OK');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
