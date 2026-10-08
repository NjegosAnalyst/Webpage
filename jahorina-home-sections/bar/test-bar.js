// Simulacija sajta za sekciju Olimpijski bar (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica Olimpijski bar i
// meni u Medijima), bar.js, suvenirnica.js, fotografije i fontovi se služe lokalno. YouTube se ne učitava.
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
// meni u Medijima: meni-bar-01 … 12, za stranu 3 postoje stara i nova slika; plus slike koje nisu meni
function mediaList() {
  const ms = [];
  for (let k = 1; k <= 12; k++) {
    const nn = String(k).padStart(2, '0');
    ms.push({ id: 100 + k, date: '2026-10-08T10:00:00', date_gmt: '2026-10-08T08:00:00', mime_type: 'image/jpeg', source_url: `${UP}meni-bar-${nn}.jpg`,
      media_details: { width: 1240, height: 1742, sizes: { medium_large: { width: 768, height: 1079, source_url: `${UP}meni-bar-${nn}-768x1079.jpg` } } } });
  }
  ms.push({ id: 99, date: '2025-11-01T10:00:00', date_gmt: '2025-11-01T09:00:00', mime_type: 'image/jpeg', source_url: `${UP}meni-bar-03-1.jpg`, media_details: { width: 1240, height: 1742, sizes: {} } });
  ms.push({ id: 98, date: '2026-10-09T10:00:00', date_gmt: '2026-10-09T08:00:00', mime_type: 'image/jpeg', source_url: `${UP}meni-bar-logo.png`, media_details: { width: 300, height: 300, sizes: {} } });
  return ms;
}
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'elementor', media = 'da', suv = false, admin = false, touch = false } = {}) {
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
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/uploads/')) {   // meni iz Medija → iste strane iz repoa
      const m = u.pathname.match(/meni-bar-(\d\d)/);
      const f = m ? path.join(__dirname, 'slike/meni/meni-bar-' + m[1] + '.webp') : path.join(__dirname, 'slike/bar-glavna-1000.webp');
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(f) });
    }
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      rest.push(decodeURIComponent(u.pathname + u.search));
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/media/.test(u.pathname + u.search)) {
        if (media === 'nema') return route.fulfill({ contentType: 'application/json', body: '[]' });
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(mediaList()) });
      }
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
    const book = r.querySelector('.jb-fb').getBoundingClientRect(), cap = r.querySelector('.jb-cap').getBoundingClientRect(), f = r.querySelector('.jb-frame').getBoundingClientRect();
    const txt = [...r.querySelectorAll('.jb-kicker, h2 span, .jb-lead, .jb-facts li, .jb-btn, .jb-more')].map((e) => e.getBoundingClientRect());
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      h2color: getComputedStyle(h2).color, h2font: getComputedStyle(h2).fontFamily.split(',')[0],
      lines: [...r.querySelectorAll('h2 span')].map((s) => s.textContent),
      outline: [...r.querySelectorAll('h2 span.jb-o')].map((s) => s.textContent).join(''),
      kicker: r.querySelector('.jb-kicker').textContent, lead: r.querySelector('.jb-lead').textContent,
      facts: [...r.querySelectorAll('.jb-facts li')].map((e) => e.querySelector('b').textContent + ' ' + e.querySelector('small').textContent).join('|'),
      factsShown: getComputedStyle(r.querySelector('.jb-facts')).display !== 'none',
      // vrijednosti na istoj liniji (na telefonu brojevi gore, "Bar · restoran · terasa" ispod)
      factsRow: new Set([...r.querySelectorAll(innerWidth > 760 ? '.jb-facts b' : '.jb-f-alt b, .jb-f-ev b')].map((e) => Math.round(e.getBoundingClientRect().top))).size === 1,
      cap: r.querySelector('.jb-cap b').textContent,
      bookCover: getComputedStyle(r.querySelector('.jb-fb .jb-leaf[data-j="0"] .jb-face[data-p="0"]')).backgroundImage,
      bg: +r.querySelector('.jb-bg.is-on').getAttribute('data-k'), bgs: r.querySelectorAll('.jb-bg').length,
      rez: [r.querySelector('a[data-jb="rezervacija"]').getAttribute('href'), r.querySelector('a[data-jb="rezervacija"]').innerText.trim()],
      overlap: txt.some((a) => hit(a, book) || hit(a, cap)),
      bookIn: book.left >= f.left && book.right <= f.right && book.top >= f.top && cap.bottom <= f.bottom + 1,
      bodyIn: (() => { const q = r.querySelector('.jb-body').getBoundingClientRect(); return q.left >= f.left - 1 && q.right <= f.right + 1 && q.bottom <= f.bottom + 1; })(),
      page: r.querySelector('a[data-jb="stranica"]').getAttribute('href'),
      why: (r.querySelector('.jb-why') || {}).textContent || '',
      hidden: [...r.querySelectorAll('.jb-up,.jb-bk-in,.jb-bg.is-on')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      imgOk: [...r.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0),
      acts: [...r.querySelectorAll('.jb-btn')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      actsFit: [...r.querySelectorAll('.jb-btn')].every((a) => a.scrollWidth <= a.clientWidth + 1),
    };
  });
}
async function reader(p) {
  return p.evaluate(() => {
    const m = document.getElementById('jb-meni');
    if (!m) return { shown: 'none' };
    const st = m.querySelector('.jb-r-stage'), bk = m.querySelector('.jb-r-book').getBoundingClientRect();
    return {
      shown: getComputedStyle(m).display, op: getComputedStyle(m).opacity,
      ind: m.querySelector('.jb-r-ind span').textContent, mode: m.querySelector('.jb-r-book').classList.contains('is-single') ? 'single' : 'spread',
      w: Math.round(bk.width), h: Math.round(bk.height), vw: innerWidth, vh: innerHeight, left: Math.round(bk.left), right: Math.round(bk.right), top: Math.round(bk.top), bottom: Math.round(bk.bottom),
      leaves: m.querySelectorAll('.jb-leaf').length,
      firstBg: getComputedStyle(m.querySelector('.jb-leaf .jb-face[data-p]')).backgroundImage,
      prevDis: m.querySelector('.jb-r-prev').disabled, nextDis: m.querySelector('.jb-r-next').disabled,
      focus: document.activeElement && (document.activeElement.className || document.activeElement.tagName),
      inside: !!(document.activeElement && document.activeElement.closest('#jb-meni')),
      zoom: m.classList.contains('is-zoom'), zimgs: [...m.querySelectorAll('.jb-r-zoom img')].map((i) => i.getAttribute('src').replace(/^.*\//, '')),
      overflow: document.documentElement.style.overflow,
    };
  });
}
// klik na lijevi rub menija u kadru (lijevo = korica; miš preko menija lista strane prema položaju)
async function clickCover(p) { const b = await p.locator('#jb-bar .jb-book').boundingBox(); await p.mouse.move(b.x + 3, b.y + b.height / 2); await p.waitForTimeout(500); await p.mouse.click(b.x + 3, b.y + b.height / 2); }
async function cap(p) { return p.evaluate(() => document.querySelector('#jb-bar .jb-cap b').textContent); }
async function waitIdle(p) { await p.waitForFunction(() => !document.querySelector('#jb-meni .jb-r-stage.is-anim')); await p.waitForTimeout(80); }

(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, suvenirnica iznad, uži kontejner teme, GA4 (gtag), WordPress stranica u Elementoru + meni u Medijima');
  let { p, ctx, errors, rest } = await open(browser, { suv: true });
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('naslov iz WP-a: "Olimpijski / bar", bar obris', S.lines.join('|') === 'Olimpijski|bar' && S.outline === 'bar', S.lines);
  check('uvod = prva rečenica sa stranice (1.879 ne prekida rečenicu)', S.lead === P1.split('zabave.')[0] + 'zabave.', S.lead);
  check('podaci: 1.879 m (iz teksta), Bar · restoran · terasa / après-ski i koncerti, 40+ (iz teksta), na istoj liniji', S.facts === '1.879m nadmorske visine|Bar·restoran·terasa après-ski i koncerti|40+ događaja godišnje' && S.factsRow, S.facts);
  check('meni u kadru: 12 strana, korica iz Medija (768)', S.cap === 'Meni · 12 strana' && /meni-bar-01-768x1079\.jpg/.test(S.bookCover), [S.cap, S.bookCover]);
  check('tri fotografije u pozadini, prva upaljena', S.bgs === 3 && S.bg === 0, [S.bgs, S.bg]);
  check('Rezervacije → kontakt telefon (057 270 003)', S.rez[0] === 'tel:+38757270003' && /Rezervacije · 057 270 003/.test(S.rez[1]), S.rez);
  check('meni se ne preklapa sa tekstom, sve u kadru', !S.overlap && S.bookIn && S.bodyIn, [S.overlap, S.bookIn, S.bodyIn]);
  check('link = stranica iz WP-a', S.page === SITE + '/olimpijski-bar/', S.page);
  rest = rest.filter((x) => !/suvenirnica/.test(x));
  check('dva poziva WP-u: stranica i meni (media?search=meni-bar)', rest.length === 2 && rest.some((x) => /pages\?slug=olimpijski-bar/.test(x)) && rest.some((x) => /media\?search=meni-bar/.test(x)), rest);
  check('dugmad: isti red, ista širina i visina (44px)', S.acts[0][0] === S.acts[1][0] && S.acts[0][1] === S.acts[1][1] && S.acts[0][2] === 44 && S.actsFit, S.acts);
  check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
  check('fotografija učitana', S.imgOk);
  check('admin poruka se ne vidi', S.why === '', S.why);
  const j = await p.evaluate(() => {
    const r = document.getElementById('jb-bar'), a = document.querySelector('#jsu-suvenirnica .jsu-frame').getBoundingClientRect(), b = r.querySelector('.jb-frame').getBoundingClientRect();
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jb-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jb--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap + gg) };
  });
  check('suvenirnica iznad: jb--join, razmak kadar → kadar = --gap + --g', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'suvenirnica-bar.png'), fullPage: true });
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'sr-racunar-kadar.png') });
  // meni leži na stolu i podiže se dok sekcija ulazi u ekran (prati skrol, i nazad)
  const kAt = async (off) => {
    await p.evaluate((o) => { const f = document.querySelector('#jb-bar .jb-frame'); window.scrollTo(0, f.getBoundingClientRect().top + scrollY - innerHeight * o); }, off);
    await p.waitForTimeout(250);
    return p.evaluate(() => +getComputedStyle(document.querySelector('#jb-bar .jb-book')).getPropertyValue('--k'));
  };
  const k0 = await kAt(.86), k1 = await kAt(.5), k2 = await kAt(.08);
  check('meni leži (vrh kadra na dnu ekrana), diže se, stoji (kadar u ekranu)', k0 < .05 && k1 > .2 && k1 < .95 && k2 === 1, [k0, k1, k2]);
  await kAt(.5); await p.screenshot({ path: path.join(OUT, 'sr-racunar-meni-se-dize.png') });
  check('skrol nazad: meni se opet spusti', (await kAt(.86)) < .05);
  await p.locator('#jb-bar').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  const k3 = await p.evaluate(() => +getComputedStyle(document.querySelector('#jb-bar .jb-book')).getPropertyValue('--k'));
  check('pa opet stoji', k3 === 1, k3);
  // miš preko menija ne lista strane (korisnik: "ne treba da se meni lista na pokret miša")
  const fb = await p.evaluate(() => { const r = document.querySelector('#jb-bar .jb-fb').getBoundingClientRect(); return { l: r.left, w: r.width, y: r.top + r.height / 2 }; });
  await p.waitForTimeout(2200);   // odškrinjanje korice poslije podizanja je prošlo
  for (let k = 0; k <= 12; k++) { await p.mouse.move(fb.l + 2 + k * (fb.w - 4) / 12, fb.y); await p.waitForTimeout(16); }
  await p.waitForTimeout(600);
  check('miš preko menija: korica ostaje (bez listanja)', (await cap(p)) === 'Meni · 12 strana' && await p.evaluate(() => !document.querySelector('#jb-bar .jb-leaf[style*="z-index: 200"]') && !/rotateY/.test(document.querySelector('#jb-bar .jb-leaf[data-j="0"]').style.transform)), await cap(p));
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'sr-racunar-mis-na-meniju.png') });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(300);

  // meni preko cijelog ekrana od korice: doleti, korica se otvori → strane 2–3
  await clickCover(p);
  await p.waitForTimeout(400);
  let M = await reader(p);
  check('meni se otvara (dijalog, stranica ne skroluje, fokus unutra)', M.shown === 'block' && M.overflow === 'hidden' && M.inside, M);
  check('računar: otvorena knjiga (dvije strane), 6 listova', M.mode === 'spread' && M.leaves === 6, [M.mode, M.leaves]);
  await p.waitForTimeout(1500); await waitIdle(p);
  M = await reader(p);
  check('korica se sama otvori: 02–03 / 12', M.ind === '02–03 / 12' && !M.prevDis && !M.nextDis, M.ind);
  check('knjiga staje u ekran', M.left >= 0 && M.right <= M.vw && M.top >= 40 && M.bottom <= M.vh - 60, M);
  check('strane iz Medija (za stranu 3 najnovija slika)', /meni-bar-01\.jpg/.test(M.firstBg) && await p.evaluate(() => /meni-bar-03\.jpg/.test(getComputedStyle(document.querySelector('#jb-meni .jb-leaf[data-j="1"] .jb-face[data-p="2"]')).backgroundImage)), M.firstBg);
  await p.evaluate(() => Promise.all([...document.querySelectorAll('#jb-meni .jb-face[data-p]')].map((f) => { const m = getComputedStyle(f).backgroundImage.match(/url\("(.*)"\)/); if (!m) return 0; const i = new Image(); i.src = m[1]; return i.decode().catch(() => {}); })));
  await p.screenshot({ path: path.join(OUT, 'meni-racunar-2-3.png') });
  // ugao se podigne na mišu
  const bb = await p.evaluate(() => { const r = document.querySelector('#jb-meni .jb-r-book').getBoundingClientRect(); return { x: r.right - 60, y: r.bottom - 60, l: r.left + 60, cy: r.top + r.height / 2, cx: r.left + r.width / 2, w: r.width }; });
  await p.mouse.move(bb.x, bb.y); await p.waitForTimeout(450);
  await p.screenshot({ path: path.join(OUT, 'meni-racunar-ugao.png') });
  // prevlačenje: na pola puta screenshot, pa pusti → okrene se
  await p.mouse.move(bb.x, bb.cy); await p.mouse.down();
  for (let k = 1; k <= 10; k++) await p.mouse.move(bb.x - k * bb.w * .05, bb.cy - k * 3);
  await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(OUT, 'meni-racunar-okret.png') });
  await p.mouse.up(); await p.waitForTimeout(100); await waitIdle(p);
  M = await reader(p);
  check('prevlačenje ulijevo okrene list: 04–05', M.ind === '04–05 / 12', M.ind);
  // kratko i sporo prevlačenje se vrati
  await p.mouse.move(bb.x, bb.cy); await p.mouse.down(); await p.mouse.move(bb.x - 40, bb.cy); await p.waitForTimeout(120); await p.mouse.move(bb.x - 60, bb.cy); await p.waitForTimeout(200); await p.mouse.up();
  await p.waitForTimeout(100); await waitIdle(p);
  check('kratko prevlačenje: list se vrati (04–05)', (await reader(p)).ind === '04–05 / 12');
  // klik na lijevu stranu → nazad; dugme i tastatura
  await p.mouse.click(bb.l, bb.cy); await p.waitForTimeout(60); await waitIdle(p);
  check('klik na lijevu stranu: nazad na 02–03', (await reader(p)).ind === '02–03 / 12');
  await p.click('#jb-meni .jb-r-next'); await waitIdle(p);
  await p.keyboard.press('ArrowRight'); await waitIdle(p);
  check('dugme + strelica: 06–07', (await reader(p)).ind === '06–07 / 12');
  await p.keyboard.press('End'); await waitIdle(p);
  M = await reader(p);
  check('End: zadnja korica 12 / 12, Sljedeća isključeno', M.ind === '12 / 12' && M.nextDis, M);
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, 'meni-racunar-kraj.png') });
  await p.keyboard.press('Home'); await waitIdle(p);
  check('Home: korica 01 / 12, Prethodna isključeno', (await reader(p)).ind === '01 / 12' && (await reader(p)).prevDis);
  await p.keyboard.press('ArrowRight'); await waitIdle(p); await p.keyboard.press('ArrowRight'); await waitIdle(p);
  await p.click('#jb-meni .jb-r-zbtn'); await p.waitForTimeout(300);
  M = await reader(p);
  check('Uvećaj: strane 4 i 5 kao prave slike', M.zoom && M.zimgs.join(',') === 'meni-bar-04.jpg,meni-bar-05.jpg', M.zimgs);
  await p.evaluate(() => Promise.all([...document.querySelectorAll('#jb-meni .jb-r-zoom img')].map((i) => i.decode().catch(() => {}))));
  await p.screenshot({ path: path.join(OUT, 'meni-racunar-uvecano.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  M = await reader(p);
  check('Esc prvo izlazi iz uvećanja', !M.zoom && M.shown === 'block', M);
  for (let k = 0; k < 6; k++) await p.keyboard.press('Tab');
  check('Tab ostaje u meniju', (await reader(p)).inside);
  await p.keyboard.press('Escape'); await p.waitForTimeout(450);
  M = await reader(p);
  check('Esc zatvara, fokus se vraća na meni u kadru, skrol vraćen', M.shown === 'none' && /jb-book/.test(M.focus) && M.overflow === '', M);
  await p.click('#jb-bar .jb-btn--solid');
  // video
  await p.click('#jb-bar .jb-btn--ghost'); await p.waitForTimeout(500);
  let V = await p.evaluate(() => { const v = document.getElementById('jb-vid'); return { shown: getComputedStyle(v).display, src: (v.querySelector('iframe') || {}).src || '', focus: document.activeElement.tagName }; });
  check('video: YouTube (nocookie) sa ID-jem iz WP stranice, tek na klik', V.shown === 'grid' && /youtube-nocookie\.com\/embed\/AbCdEfGhIj0\?autoplay=1/.test(V.src), V);
  await p.keyboard.press('Escape'); await p.waitForTimeout(450);
  V = await p.evaluate(() => { const v = document.getElementById('jb-vid'); return { shown: getComputedStyle(v).display, iframes: v.querySelectorAll('iframe').length, focus: document.activeElement.className }; });
  check('Esc zatvara video (iframe uklonjen, fokus na dugme)', V.shown === 'none' && V.iframes === 0 && /jb-btn--ghost/.test(V.focus), V);
  await p.click('#jb-bar .jb-more');
  let ev = await p.evaluate(() => window.__ev.map((e) => e[1] + ':' + JSON.stringify(e[2])));
  check('GA4: bar_meni, bar_rezervacija, bar_video, bar_klik', JSON.stringify(ev) === JSON.stringify(['bar_meni:{"strana":12,"jezik":"sr"}', 'bar_rezervacija:{"nacin":"telefon","jezik":"sr"}', 'bar_video:{"jezik":"sr"}', 'bar_klik:{"cilj":"stranica","jezik":"sr"}']), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Ugradnja sa YouTube iframe-om; meni nije u Medijima → ugrađeni meni (12 strana iz repoa)');
  ({ p, ctx, errors } = await open(browser, { wp: 'iframe', media: 'nema', admin: true }));
  S = await state(p);
  check('ugrađena korica i 12 strana', /slike\/meni\/mala-01\.webp/.test(S.bookCover) && S.cap === 'Meni · 12 strana', S.bookCover);
  check('admin vidi da meni nije u Medijima', /meni u Medijima/.test(S.why), S.why);
  await p.click('#jb-bar .jb-btn--ghost'); await p.waitForTimeout(300);
  check('video ID iz iframe-a', /embed\/ZyXwVuTsRq1/.test(await p.evaluate(() => document.querySelector('#jb-vid iframe').src)));
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('WordPress ispiše PHP upozorenje prije JSON-a (Safari: "The string did not match the expected pattern")');
  ({ p, ctx, errors } = await open(browser, { wp: 'upozorenje', ga: 'none', admin: true }));
  S = await state(p);
  check('podaci se ipak pročitaju (uvod, brojevi, link), admin bez poruke o stranici', S.lead === P1.split('zabave.')[0] + 'zabave.' && S.facts.split('|').length === 3 && !/stranica/.test(S.why), [S.lead, S.why]);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'html', ga: 'none', admin: true }));
  S = await state(p);
  check('HTML umjesto JSON-a: ugrađeni tekst, admin vidi početak odgovora', /^Na vrhu Jahorine/.test(S.lead) && /odgovor nije JSON · pages: „[^“]*Stranica u održavanju“/.test(S.why), S.why);
  await ctx.close();

  console.log('Tekst stranice bez brojeva → red sa brojevima se sakrije; video ostaje podrazumijevani');
  ({ p, ctx, errors } = await open(browser, { wp: 'bezbrojeva', ga: 'none' }));
  S = await state(p);
  check('brojevi sakriveni (ostaje Bar · restoran · terasa), uvod novi', S.facts === 'Bar·restoran·terasa après-ski i koncerti' && /novo mjesto/.test(S.lead), [S.facts, S.lead]);
  await p.click('#jb-bar .jb-btn--ghost'); await p.waitForTimeout(300);
  check('video: podrazumijevani ID (7qo0-fAx5CI)', /embed\/7qo0-fAx5CI/.test(await p.evaluate(() => document.querySelector('#jb-vid iframe').src)));
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski naslov iz WP-a: Olympic / Bar', S.lines.join('|') === 'Olympic|Bar' && S.kicker === 'Food & après-ski', [S.lines, S.kicker]);
  check('engleski uvod i podaci (1,879 m, Bar · restaurant · terrace, 40+)', /^At the top of Jahorina/.test(S.lead) && S.facts === '1,879m above sea level|Bar·restaurant·terrace après-ski & concerts|40+ events a year', [S.lead, S.facts]);
  check('meni: 12 pages; link vodi na /en/; Book: +387 57 270 003', S.cap === 'Menu · 12 pages' && S.page === SITE + '/en/olimpijski-bar/' && /Book: \+387 57 270 003/.test(S.rez[1]), [S.cap, S.page, S.rez]);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && rest.some((x) => /^\/wp-json\/wp\/v2\/pages/.test(x)), rest);
  await clickCover(p); await p.waitForTimeout(1600); await waitIdle(p);
  M = await reader(p);
  check('EN meni: 02–03 / 12', M.ind === '02–03 / 12', M.ind);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ev = await p.evaluate(() => window.__ev);
  check('dataLayer: bar_meni', JSON.stringify(ev) === JSON.stringify([{ event: 'bar_meni', strana: 12, jezik: 'en' }]), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'en-racunar-kadar.png') });
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni tekst i meni, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none' }));
  S = await state(p);
  check('ugrađeni tekst, podaci i meni', S.lines.join('|') === 'Olimpijski|bar' && /^Na vrhu Jahorine/.test(S.lead) && S.facts.split('|').length === 3 && S.cap === 'Meni · 12 strana' && S.why === '', S);
  await clickCover(p); await p.waitForTimeout(1600); await waitIdle(p);
  check('ugrađeni meni se lista', (await reader(p)).ind === '02–03 / 12');
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

  console.log('Smjena fotografija u pozadini: sama, redom');
  ({ p, ctx, errors } = await open(browser, { ga: 'none' }));
  await p.mouse.move(5, 5);
  await p.waitForTimeout(7000 + 2600);
  S = await state(p);
  check('poslije ~7 s u pozadini je enterijer (druga fotografija)', S.bg === 1, S.bg);
  await p.waitForTimeout(2200);
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'sr-racunar-enterijer.png') });
  await p.waitForTimeout(7000 - 2200 + 600);
  S = await state(p);
  check('pa losos (treća)', S.bg === 2, S.bg);
  await p.waitForTimeout(2200);
  await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, 'sr-racunar-losos.png') });
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { ga: 'none', reduced: true }));
  await p.waitForTimeout(8000);
  check('smanjeno kretanje: bez smjene', (await state(p)).bg === 0);
  await ctx.close();

  for (const [name, vw, vh, touch] of [['laptop', 1280, 800], ['laptop-nizak', 1366, 680], ['siroki', 1920, 1080], ['tablet', 900, 1100, true], ['telefon', 390, 844, true], ['uski-telefon', 340, 740, true]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska', S.hidden === 0, S.hidden);
    check('meni se ne preklapa sa tekstom, sve u kadru', !S.overlap && S.bookIn && S.bodyIn, [S.overlap, S.bookIn, S.bodyIn]);
    check('brojevi u jednom redu; natpisi dugmadi staju', S.factsRow && S.actsFit, [S.factsRow, S.actsFit]);
    if (vw <= 760) check('telefon: oba dugmeta u jednom redu, 42px', S.acts[0][0] === S.acts[1][0] && S.acts[0][2] === 42, S.acts);
    await p.locator('#jb-bar .jb-frame').screenshot({ path: path.join(OUT, name + '.png') });
    const single = vw < 820;
    check('meni u kadru stoji', await p.evaluate(() => +getComputedStyle(document.querySelector('#jb-bar .jb-book')).getPropertyValue('--k')) === 1);
    if (touch) {   // dodir otvara meni preko ekrana od korice
      await p.tap('#jb-bar .jb-book'); await p.waitForTimeout(1600); await waitIdle(p);
      M = await reader(p);
      check(single ? 'dodir: jedna strana (01 / 12)' : 'dodir: dvije strane (02–03 / 12)', M.mode === (single ? 'single' : 'spread') && M.ind === (single ? '01 / 12' : '02–03 / 12'), [M.mode, M.ind]);
    } else {
      await clickCover(p); await p.waitForTimeout(1600); await waitIdle(p);
      M = await reader(p);
      check('dvije strane (02–03 / 12)', M.mode === 'spread' && M.ind === '02–03 / 12', [M.mode, M.ind]);
    }
    check('knjiga staje u ekran', M.left >= 0 && M.right <= M.vw && M.top >= 40 && M.bottom <= M.vh - 60, M);
    if (touch) {   // prevlačenje prstom ulijevo → sljedeća strana
      const r = await p.evaluate(() => { const b = document.querySelector('#jb-meni .jb-r-book').getBoundingClientRect(); return { x: b.left + b.width * .8, y: b.top + b.height / 2, w: b.width }; });
      await p.evaluate(({ x, y, w }) => {
        const st = document.querySelector('#jb-meni .jb-r-stage'), o = (cx) => ({ pointerType: 'touch', pointerId: 7, bubbles: true, clientX: cx, clientY: y, isPrimary: true });
        st.dispatchEvent(new PointerEvent('pointerdown', o(x)));
        for (let k = 1; k <= 8; k++) st.dispatchEvent(new PointerEvent('pointermove', o(x - k * w * .07)));
        st.dispatchEvent(new PointerEvent('pointerup', o(x - w * .56)));
      }, r);
      await p.waitForTimeout(60); await waitIdle(p);
      M = await reader(p);
      check('prevlačenje prstom → ' + (single ? '02 / 12' : '04–05 / 12'), M.ind === (single ? '02 / 12' : '04–05 / 12'), M.ind);
      await p.evaluate(() => Promise.all([...document.querySelectorAll('#jb-meni .jb-face[data-p]')].map((f) => { const m = getComputedStyle(f).backgroundImage.match(/url\("(.*)"\)/); if (!m) return 0; const i = new Image(); i.src = m[1]; return i.decode().catch(() => {}); })));
    }
    await p.screenshot({ path: path.join(OUT, 'meni-' + name + '.png') });
    if (name === 'telefon') {
      await p.click('#jb-meni .jb-r-zbtn'); await p.waitForTimeout(300);
      M = await reader(p);
      check('telefon: Uvećaj pokazuje stranu 2, šire od ekrana (skrol)', M.zoom && M.zimgs.join(',') === 'meni-bar-02.jpg' && await p.evaluate(() => { const z = document.querySelector('#jb-meni .jb-r-zoom'); return z.scrollWidth > z.clientWidth; }), M.zimgs);
      await p.evaluate(() => Promise.all([...document.querySelectorAll('#jb-meni .jb-r-zoom img')].map((i) => i.decode().catch(() => {}))));
      await p.screenshot({ path: path.join(OUT, 'meni-telefon-uvecano.png') });
    }
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Smanjeno kretanje (bez ulaska i bez animacije listanja)');
  ({ p, ctx, errors } = await open(browser, { reduced: true }));
  const rm = await p.evaluate(() => ({ cls: document.getElementById('jb-bar').className, hidden: [...document.querySelectorAll('#jb-bar .jb-up,#jb-bar .jb-bk-in')].filter((e) => getComputedStyle(e).opacity !== '1').length }));
  check('odmah vidljivo, bez klasa za ulazak', !/jb-anim/.test(rm.cls) && rm.hidden === 0, rm);
  await clickCover(p); await p.waitForTimeout(150);
  check('meni odmah na 02–03', (await reader(p)).ind === '02–03 / 12');
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(30);
  check('strelica: odmah 04–05', (await reader(p)).ind === '04–05 / 12');
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
