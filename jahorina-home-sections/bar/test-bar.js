// Simulacija sajta za sekciju Olimpijski bar (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovor (stranica Olimpijski bar),
// bar.js, suvenirnica.js, fotografije i fontovi se služe lokalno. YouTube se ne učitava.
// Od 10. 11. bar je bez menija (korisnik: „bez cjenovnika“) i u stilu premium restorana: jedna fotografija, „Après-ski i restoran · 1.879 m“,
// pun naslov, kratak uvod, tihi red (radno vrijeme · terasa), „Rezerviši sto“ + „Pogledaj atmosferu“.
// Pokretanje: node test-bar.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2026/10/';
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
function page({ attrs = '', suv = false, admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Ratrak (iznad)</div>
  ${suv ? `<div class="boxed"><div class="elementor-widget-html"><div id="jsu-suvenirnica"></div>
    <script src="${CDN}jahorina-home-sections/suvenirnica/suvenirnica.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jb-bar" ${attrs}><a href="/olimpijski-bar/">Olimpijski bar</a></div>
    <script src="${CDN}jahorina-home-sections/bar/bar.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice (screenshot korisnika, 8. 10. 2026) kako ga Elementor vraća: pasusi, video widget, karusel fotografija
const P1 = 'Na vrhu Jahorine, na 1.879 metara nadmorske visine, nalazi se Olimpijski bar, omiljeno mjesto skijaša i ljubitelja dobre hrane i zabave. U toplom planinskom ambijentu od 700 m², posjetioci mogu uživati u predivnom pogledu na akumulaciono jezero i okolne vrhove, uz raznovrsnu gastronomsku ponudu zasnovanu na domaćim proizvodima.';
const P2 = 'Specijaliteti poput pure s kajmakom, domaćih uštipaka, sarmi, ćevapa, roštilja i tradicionalnih pita pripremaju se s ljubavlju i vraćaju goste u djetinjstvo. Nezaobilazni su i slatki zalogaji poput baklava, tufahija i palačinki, uz vrhunsku ponudu pića.';
const P3 = 'Pored gastronomije, Olimpijski bar je centar zabave. Tokom godine organizuje više od 40 događaja, uključujući noćne i dnevne “apres-ski” žurke. Spoj odlične hrane, muzike i skijanja čini ovo mjesto nezaobilaznim za sve posjetioce planine.';
const P1EN = 'At the top of Jahorina, at 1,879 metres above sea level, lies the Olympic Bar, a favourite spot for skiers. Its warm 700 m² mountain venue offers views of the lake.';
const P3EN = 'The bar hosts more than 40 events a year, including après-ski parties.';
const VIDEO = '<div class="elementor-widget-video" data-settings="{&quot;youtube_url&quot;:&quot;https:\\/\\/www.youtube.com\\/watch?v=AbCdEfGhIj0&amp;t=4s&quot;,&quot;video_type&quot;:&quot;youtube&quot;}"><div class="elementor-video"></div></div>';
const CONTENT = {
  elementor: `<p>${P1}</p>\n<p>${P2}</p>\n<p>${P3}</p>\n${VIDEO}<div class="swiper"><img src="${UP}hrana-1024x683.jpg" alt=""></div>`,
  iframe: `<p>${P1}</p><p>${P3}</p><iframe src="https://www.youtube.com/embed/ZyXwVuTsRq1?feature=oembed"></iframe>`,
  bezbrojeva: `<p>Olimpijski bar je novo mjesto za druženje uz toplu čokoladu, palačinke i domaću kuhinju.</p>`,
  qtranslate: `<p>[:SH]${P1}[:en]${P1EN}[:]</p><p>[:SH]${P3}[:en]${P3EN}[:]</p>${VIDEO}`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'elementor', suv = false, admin = false, touch = false } = {}) {
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
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike/bar-glavna-1000.webp')) });
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      rest.push(decodeURIComponent(u.pathname + u.search));
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/pages/.test(u.pathname + u.search)) {
        if (wp === 'nema' || !/slug=olimpijski-bar/.test(u.search)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // suvenirnica iznad: ugrađeni tekst
        // PHP upozorenje ispisano prije podataka (WordPress sa prikazom grešaka) ili HTML umjesto JSON-a
        const pre = wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '';
        if (wp === 'html') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><title>Olimpijski centar Jahorina</title></head><body><p>Stranica u održavanju</p></body></html>' });
        return route.fulfill({ contentType: 'application/json', body: pre + JSON.stringify([{
          id: 77, link: SITE + '/olimpijski-bar/',
          title: { rendered: wp === 'qtranslate' ? '[:SH]Olimpijski bar[:en]Olympic Bar[:]' : 'Olimpijski bar' },
          content: { rendered: CONTENT[wp === 'upozorenje' ? 'elementor' : wp] },
        }]) });
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, suv, admin }) });
    return route.abort();   // YouTube i ostalo
  });
  await p.addInitScript((mode) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, ga);
  await p.goto(SITE + pth);
  await p.waitForSelector('#jb-bar .jb-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);   // WordPress odgovor
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jb-bar').scrollIntoViewIfNeeded();
  await p.waitForTimeout(2600);   // ulazak traje ~2 s
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jb-bar'), b = r.getBoundingClientRect();
    const h2 = r.querySelector('h2 span');
    const hit = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    const f = r.querySelector('.jb-frame').getBoundingClientRect();
    const txt = [...r.querySelectorAll('.jb-kicker, h2 span, .jb-lead, .jb-place, .jb-btn, .jb-play, .jb-meta')].map((e) => e.getBoundingClientRect());
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      lines: [...r.querySelectorAll('h2 span')].map((s) => s.textContent),
      outline: [...r.querySelectorAll('h2 span')].filter((s) => getComputedStyle(s).webkitTextStrokeWidth !== '0px' || /jb-o/.test(s.className)).length,
      kicker: r.querySelector('.jb-kicker').textContent, lead: r.querySelector('.jb-lead').textContent,
      place: r.querySelector('.jb-place').textContent, facts: r.querySelectorAll('.jb-facts').length,
      noMenu: !document.querySelector('#jb-bar .jb-book, #jb-bar .jb-fb, #jb-meni') && !/\b(meni|menu|cjenovnik)\b/i.test(r.querySelector('.jb-frame').textContent),
      bgs: r.querySelectorAll('.jb-bg').length, tint: r.querySelectorAll('.jb-tint').length,
      photoW: Math.round(r.querySelector('.jb-bg').getBoundingClientRect().width / f.width * 100),
      rez: [r.querySelector('.jb-btn').getAttribute('href'), r.querySelector('.jb-btn').innerText.trim(), r.querySelector('.jb-tel').getAttribute('href'), r.querySelector('.jb-tel').textContent],
      txtIn: txt.every((a) => a.left >= f.left - 1 && a.right <= f.right + 1 && a.top >= f.top - 1 && a.bottom <= f.bottom + 1),
      bodyIn: (() => { const q = r.querySelector('.jb-body').getBoundingClientRect(); return q.left >= f.left - 1 && q.right <= f.right + 1 && q.bottom <= f.bottom + 1; })(),
      page: r.querySelector('a[data-jb="stranica"]').getAttribute('href'),
      why: (r.querySelector('.jb-why') || {}).textContent || '',
      hidden: [...r.querySelectorAll('.jb-up,.jb-bg.is-on')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      imgOk: [...r.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0),
      acts: [...r.querySelectorAll('.jb-btn, .jb-play')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      actsFit: [...r.querySelectorAll('.jb-btn, .jb-play, .jb-meta a')].every((a) => a.scrollWidth <= a.clientWidth + 1),
    };
  });
}
(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, suvenirnica iznad, uži kontejner teme, GA4 (gtag), WordPress stranica u Elementoru');
  let { p, ctx, errors, rest } = await open(browser, { suv: true });
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('naslov iz WP-a: "Olimpijski / bar", pun (bez obrisa)', S.lines.join('|') === 'Olimpijski|bar' && S.outline === 0, [S.lines, S.outline]);
  check('mali tekst: Après-ski i restoran · 1.879 m (visina iz teksta stranice)', S.kicker === 'Après-ski i restoran · 1.879 m', S.kicker);
  check('uvod: kratak sažetak (domaća kuhinja, pića, pogled)', /^Domaća kuhinja i vrhunska pića na vrhu Jahorine/.test(S.lead), S.lead);
  check('tihi red: Otvoreno 9–21h · Terasa sa pogledom (bez tri podatka i 40+ događaja)', S.place === 'Otvoreno 9–21h·Terasa sa pogledom' && S.facts === 0, [S.place, S.facts]);
  check('bez menija (cjenovnika) u kadru i preko ekrana', S.noMenu, S.noMenu);
  check('jedna fotografija, bez plave noćne obrade, lijevih 60% kadra', S.bgs === 1 && S.tint === 0 && S.photoW === 60, [S.bgs, S.tint, S.photoW]);
  check('Rezerviši sto → kontakt telefon; ispod: Rezervacije 057 270 003', S.rez.join('|') === 'tel:+38757270003|Rezerviši sto|tel:+38757270003|057 270 003', S.rez);
  check('tekst u kadru', S.txtIn && S.bodyIn, [S.txtIn, S.bodyIn]);
  check('link = stranica iz WP-a', S.page === SITE + '/olimpijski-bar/', S.page);
  rest = rest.filter((x) => !/suvenirnica/.test(x));
  check('jedan poziv WP-u: samo stranica (Mediji se više ne pitaju za meni)', rest.length === 1 && /pages\?slug=olimpijski-bar/.test(rest[0]), rest);
  check('Rezerviši sto (50 px) i Pogledaj atmosferu u istom redu', Math.abs(S.acts[0][0] - S.acts[1][0]) <= 2 && S.acts[0][2] === 50 && S.actsFit, S.acts);
  check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
  check('fotografija učitana', S.imgOk);
  check('admin poruka se ne vidi', S.why === '', S.why);
  const j = await p.evaluate(() => {
    const r = document.getElementById('jb-bar'), a = document.querySelector('#jsu-suvenirnica .jsu-frame').getBoundingClientRect(), b = r.querySelector('.jb-frame').getBoundingClientRect();
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jb-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jb--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap) };
  });
  // od 10. 11.: između dvije naše sekcije jedan razmak (--gap), bar iznad kadra ne dodaje rub
  check('suvenirnica iznad: jb--join, razmak kadar → kadar = --gap', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'suvenirnica-bar.png'), fullPage: true });
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'sr-racunar-kadar.png') });
  await p.click('#jb-bar .jb-btn');
  // video
  await p.click('#jb-bar .jb-play'); await p.waitForTimeout(500);
  let V = await p.evaluate(() => { const v = document.getElementById('jb-vid'); return { shown: getComputedStyle(v).display, src: (v.querySelector('iframe') || {}).src || '', focus: document.activeElement.tagName }; });
  check('video: YouTube (nocookie) sa ID-jem iz WP stranice, tek na klik', V.shown === 'grid' && /youtube-nocookie\.com\/embed\/AbCdEfGhIj0\?autoplay=1/.test(V.src), V);
  await p.keyboard.press('Escape'); await p.waitForTimeout(450);
  V = await p.evaluate(() => { const v = document.getElementById('jb-vid'); return { shown: getComputedStyle(v).display, iframes: v.querySelectorAll('iframe').length, focus: document.activeElement.className }; });
  check('Esc zatvara video (iframe uklonjen, fokus na link)', V.shown === 'none' && V.iframes === 0 && /jb-play/.test(V.focus), V);
  await p.click('#jb-bar .jb-more');
  let ev = await p.evaluate(() => window.__ev.map((e) => e[1] + ':' + JSON.stringify(e[2])));
  check('GA4: bar_rezervacija, bar_video, bar_klik', JSON.stringify(ev) === JSON.stringify(['bar_rezervacija:{"nacin":"telefon","jezik":"sr"}', 'bar_video:{"jezik":"sr"}', 'bar_klik:{"cilj":"stranica","jezik":"sr"}']), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Ugradnja sa YouTube iframe-om');
  ({ p, ctx, errors } = await open(browser, { wp: 'iframe', admin: true }));
  S = await state(p);
  check('admin bez poruke', S.why === '', S.why);
  await p.click('#jb-bar .jb-play'); await p.waitForTimeout(300);
  check('video ID iz iframe-a', /embed\/ZyXwVuTsRq1/.test(await p.evaluate(() => document.querySelector('#jb-vid iframe').src)));
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('WordPress ispiše PHP upozorenje prije JSON-a (Safari: "The string did not match the expected pattern")');
  ({ p, ctx, errors } = await open(browser, { wp: 'upozorenje', ga: 'none', admin: true }));
  S = await state(p);
  check('podaci se ipak pročitaju (visina, link), admin bez poruke o stranici', S.kicker === 'Après-ski i restoran · 1.879 m' && S.page === SITE + '/olimpijski-bar/' && !/stranica/.test(S.why), [S.kicker, S.why]);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'html', ga: 'none', admin: true }));
  S = await state(p);
  check('HTML umjesto JSON-a: ugrađeni tekst, admin vidi početak odgovora', /^Domaća kuhinja/.test(S.lead) && /odgovor nije JSON · pages: „[^“]*Stranica u održavanju“/.test(S.why), S.why);
  await ctx.close();

  console.log('Tekst stranice bez visine → mali tekst bez visine; video ostaje podrazumijevani; radno vrijeme iz reda za widget (zamjena)');
  ({ p, ctx, errors } = await open(browser, { wp: 'bezbrojeva', ga: 'none', attrs: 'data-radno="Svaki dan 9–17h"' }));
  S = await state(p);
  check('bez visine: „Après-ski i restoran“; red: Svaki dan 9–17h · Terasa sa pogledom', S.kicker === 'Après-ski i restoran' && S.place === 'Svaki dan 9–17h·Terasa sa pogledom', [S.kicker, S.place]);
  await p.click('#jb-bar .jb-play'); await p.waitForTimeout(300);
  check('video: podrazumijevani ID (7qo0-fAx5CI)', /embed\/7qo0-fAx5CI/.test(await p.evaluate(() => document.querySelector('#jb-vid iframe').src)));
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski naslov iz WP-a: Olympic / Bar; Après-ski & restaurant · 1,879 m', S.lines.join('|') === 'Olympic|Bar' && S.kicker === 'Après-ski & restaurant · 1,879 m', [S.lines, S.kicker]);
  check('engleski uvod i red', /^Home-style cooking and fine drinks/.test(S.lead) && S.place === 'Open 9 am – 9 pm·Terrace with a view', [S.lead, S.place]);
  check('link vodi na /en/; Book a table: +387 57 270 003; bez menija', S.noMenu && S.page === SITE + '/en/olimpijski-bar/' && S.rez[1] === 'Book a table' && S.rez[3] === '+387 57 270 003', [S.page, S.rez]);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && rest.some((x) => /^\/wp-json\/wp\/v2\/pages/.test(x)), rest);
  await p.click('#jb-bar .jb-more');
  ev = await p.evaluate(() => window.__ev);
  check('dataLayer: bar_klik', JSON.stringify(ev) === JSON.stringify([{ event: 'bar_klik', cilj: 'stranica', jezik: 'en' }]), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'en-racunar-kadar.png') });
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni tekst, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none' }));
  S = await state(p);
  check('ugrađeni tekst', S.lines.join('|') === 'Olimpijski|bar' && /^Domaća kuhinja/.test(S.lead) && S.kicker === 'Après-ski i restoran · 1.879 m' && S.why === '', S);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', admin: true }));
  S = await state(p);
  check('admin vidi razlog', /HTTP 403/.test(S.why), S.why);
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'greska-admin.png') });
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'nema', ga: 'none', admin: true }));
  S = await state(p);
  check('pogrešan slug: admin vidi da stranica nije pronađena', /nije pronađena/.test(S.why), S.why);
  await ctx.close();

  console.log('Jedna mirna fotografija: bez smjene');
  ({ p, ctx, errors } = await open(browser, { ga: 'none' }));
  await p.waitForTimeout(8000);
  check('poslije 8 s i dalje ista (jedina) fotografija', await p.evaluate(() => document.querySelectorAll('#jb-bar .jb-bg').length === 1 && /bar-glavna/.test(document.querySelector('#jb-bar .jb-bg').currentSrc)));
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  for (const [name, vw, vh, touch] of [['laptop', 1280, 800], ['laptop-nizak', 1366, 680], ['siroki', 1920, 1080], ['tablet', 900, 1100, true], ['telefon', 390, 844, true], ['uski-telefon', 340, 740, true]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
    check('bez menija, tekst u kadru', S.noMenu && S.txtIn && S.bodyIn, [S.noMenu, S.txtIn, S.bodyIn]);
    check('natpisi dugmeta i linkova staju', S.actsFit, S.actsFit);
    if (vw > 980) check('računar: fotografija u lijevih 60% kadra', S.photoW === 60, S.photoW);
    if (vw <= 760) check('telefon: Rezerviši sto preko cijele širine (48 px), Pogledaj atmosferu ispod', S.acts[0][2] === 48 && S.acts[1][0] > S.acts[0][0] + 40, S.acts);
    await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, name + '.png') });
    if (vw <= 760) {   // telefon: fotografija gore niža (bez menija), tekst odmah ispod
      const ph = await p.evaluate(() => Math.round(document.querySelector('#jb-bar .jb-bgs').getBoundingClientRect().height));
      check('telefon: fotografija ≤ 460 px', ph <= 460, ph);
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska)');
  ({ p, ctx, errors } = await open(browser, { reduced: true }));
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jb-bar').className, hidden: [...document.querySelectorAll('#jb-bar .jb-up')].filter((e) => getComputedStyle(e).opacity !== '1').length }));
  check('odmah vidljivo, bez klasa za ulazak', !/jb-anim/.test(rm.cls) && rm.hidden === 0, rm);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
