// Simulacija sajta za sekciju Sankalište (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranica sankališta), sankaliste.js,
// park.js (iznad, za razmak i cik-cak; ugrađeni tekst), fotografije i fontovi se služe lokalno.
// Pokretanje: node test-sankaliste.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2021/12/';
const YT = 'Sank4Lis7e1';
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
function page({ attrs = '', park = false, admin = false, boxed = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}${boxed ? '#jsk-sankaliste{width:900px!important}' : ''}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">Ski depo (iznad)</div>
  ${park ? `<div class="boxed"><div class="elementor-widget-html"><div id="jsb-park"></div>
    <script src="${CDN}jahorina-home-sections/park/park.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jsk-sankaliste" ${attrs}><a href="/sankaliste/">Sankalište</a></div>
    <script src="${CDN}jahorina-home-sections/sankaliste/sankaliste.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice sankališta (screenshot korisnika, 10. 10. 2026) kako ga WordPress vraća
const P = [
  'Svi se, sa osmijehom i najvećom toplinom u srcu, sjećamo kako smo se sankali kao djeca, radosni i bezbrižni, provodeći sate i sate napolju, sve dok se toliko ne smrznemo da napokon poslušamo roditelje, već promukle od dozivanja, i uđemo unutra. Radosni, rumenih obraza, svake godine nestrpljivo smo iščekivali prve pahulje, zime smo pamtili po sankanju, po druženju, veselom jurenju nizbrdo i, manje nam omiljenom, ali neizbježnom, vučenju sanki na vrh uzbrdice. Ukoliko sada imate mališane, ili ste se i sami uželjeli tog bezbrižnog osjećaja od prije 20, 30 ili više godina, vrijeme je da počnete da se radujete, jer je na Jahorini izgrađeno prvo Sankalište!',
  'Dužine čak 600 metara, te širine od čak 5 metara, sve popularnija sankaška staza nalazi se na Poljicama, tačnije na stazi 7, i otvorena je za najluđu sankašku zabavu svakog dana od 16h do 18h!',
  'U periodu između dnevnog i noćnog skijanja, od 16h do 18h, sidro Poljice koriste isključivo nasmijani sankaši, jer sve njih, zajedno sa sankama, na vrh pomenute staze prevozi upravo sidro Poljice. Potrebno je samo da sjednete, pustite da ih vas ono doveze na vrh Sankališta i prepustite sankaškoj zabavi koja vas očekuje duž svih 600 metara.',
  'Prije nego krenete u najluđi zimski provod napominjemo vas da svoje sanke ostavite kući, jer se za ovu aktivnosti koriste sanke koje su opremljene posebnim adapterima za sidro Poljice, a koje je potrebno da unajmite na ski kasi Poljice. Ista se nalazi u neposrednoj blizini istoimenog sidra.',
];
const LEAD = 'Ukoliko sada imate mališane, ili ste se i sami uželjeli tog bezbrižnog osjećaja od prije 20, 30 ili više godina, vrijeme je da počnete da se radujete, jer je na Jahorini izgrađeno prvo Sankalište!';
const SPEC = 'Dužina=600 m|Lokacija=Staza 7 · Poljice|Lift=Sidro Poljice|Sanke=Najam na ski kasi PoljiceSvoje ostavite kod kuće: za sidro trebaju sanke sa adapterom';
const PRICES = SITE + '/cjenovnik-zima/#sankaliste';
const SANK = `<h3>Sankalište</h3><p>${P[0]}</p><p>${P[1]}</p><p>${P[2]}</p><p>${P[3]}</p>
<p>Cijene karata za Sankalište pronađite <a href="${PRICES}">OVDJE</a>!</p>
<div class="elementor-widget-video" data-settings="{&quot;youtube_url&quot;:&quot;https:\\/\\/www.youtube.com\\/watch?v=${YT}&quot;}"></div>
<img src="${UP}sankaliste-1024x683.jpg" srcset="${UP}sankaliste-1024x683.jpg 1024w, ${UP}sankaliste.jpg 1800w" alt="Sankalište">
<img class="emoji" alt="👉" src="https://s.w.org/images/core/emoji/15.0.3/72x72/1f449.png">`;
const CONTENT = {
  sank: SANK,
  // novo radno vrijeme i druga staza
  novo: `<p>Sankalište na Jahorini: staza dužine 450 metara i širine 4 metra nalazi se na Rajskoj dolini, tačnije na stazi 3, i radi svakog dana od 15h do 17h. Sanke iznajmite na ski kasi Rajska.</p>`,
  // danas ne radi (vjetar)
  vjetar: `<p><strong>Sankalište danas ne radi zbog jakog vjetra.</strong></p>` + SANK,
  qtranslate: `<p>[:SH]${P[0]}[:en]We all remember, with a smile and great warmth in our hearts, how we went sledding as children. If you have little ones, or you simply miss that carefree feeling, it is time to get excited, because Jahorina has built its first sledding track![:]</p>
<p>[:SH]${P[1]}[:en]The track is 600 m long and 5 m wide, located on slope 7 at Poljice, and open every day from 4 pm to 6 pm![:]</p>
<p>[:SH]${P[3]}[:en]Leave your own sleds at home: the Poljice T-bar takes only sleds with special adapters, which you can rent at the Poljice ski desk.[:]</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

// wp: 'sank', 'novo', 'vjetar', 'qtranslate', 'upozorenje', 'greska', 'nema', 'pretraga' (slug ne postoji, nađe se pretragom)
async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'sank', park = false, admin = false, touch = false, boxed = false, wait = true } = {}) {
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
    if (u.origin === SITE && u.pathname.startsWith('/wp-content/uploads/'))
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike/sank-noc.webp')) });
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      const q = decodeURIComponent(u.pathname + u.search);
      rest.push(q);
      if (/snowboard|bike/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // park iznad: ugrađeni tekst
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/media/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });
      if (/wp\/v2\/pages/.test(q)) {
        const pg = { id: 77, link: SITE + '/sankaliste/', slug: 'sankaliste', title: { rendered: wp === 'qtranslate' ? '[:SH]Sankalište[:en]Sledding track[:]' : 'Sankalište' },
          content: { rendered: CONTENT[['novo', 'vjetar', 'qtranslate'].indexOf(wp) > -1 ? wp : 'sank'] } };
        const other = { id: 12, link: SITE + '/sankanje-ljeto/', slug: 'x', title: { rendered: 'Ljetna ponuda' }, content: { rendered: '<p>Ljeti.</p>' } };
        const json = (a) => route.fulfill({ contentType: 'application/json', body: (wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '') + JSON.stringify(a) });
        if (wp === 'nema') return json([]);
        if (/slug=sankaliste(&|$)/.test(q)) return json(wp === 'pretraga' ? [] : [pg]);
        if (/search=sank/.test(q)) return json([other, pg]);
        return json([]);
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, park, admin, boxed }) });
    return route.abort();
  });
  await p.addInitScript(({ mode }) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, { mode: ga });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jsk-sankaliste .jsk-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jsk-sankaliste').scrollIntoViewIfNeeded();
  // ulazak: kadar i tekst (~1,8 s), sat se iscrta, kazaljka prođe dan (~3,5 s), status se upali (~3,5 s)
  if (wait) {
    await p.waitForFunction(() => { const r = document.getElementById('jsk-sankaliste'); return !r.classList.contains('jsk-anim') || r.classList.contains('jsk-on'); }, null, { timeout: 8000 });
    await p.waitForTimeout(reduced ? 300 : 4400);
  }
  return { ctx, p, errors, rest };
}
// status se ne ispisuje (samo boja kuglice na kazaljci); tekst je za čitač ekrana: "Sankalište: Radi sada · do 18:00"
const st = (p) => p.evaluate(() => {
  const r = document.getElementById('jsk-sankaliste'), t = r.querySelector('.jsk-sr').textContent.replace(/^[^:]+:\s*/, '').split(' · ');
  return { open: r.classList.contains('jsk--open'), b: t[0], s: t[1] || '', bead: getComputedStyle(r.querySelector('.jsk-bead')).fill };
});
const info = (p) => p.evaluate(() => {
  const r = document.getElementById('jsk-sankaliste'), q = (s) => r.querySelector(s);
  return {
    eye: q('.jsk-eye').textContent, h2: q('h2').textContent, lead: q('.jsk-lead').textContent,
    spec: [...r.querySelectorAll('.jsk-spec li')].map((li) => li.querySelector('small').textContent + '=' + li.querySelector('b').textContent).join('|'),
    prices: q('a[data-jsk="cijene"]').getAttribute('href'), more: q('a[data-jsk="stranica"]').getAttribute('href'),
    video: !!q('[data-jsk="video"]'), dial: q('.jsk-dial-c b').textContent, aria: q('.jsk-dial').getAttribute('aria-label'),
    hand: getComputedStyle(q('.jsk-hand')).getPropertyValue('--a').trim(),
    why: (q('.jsk-why') || {}).textContent || '', join: r.classList.contains('jsk--join'), boxed: r.classList.contains('jsk--boxed'),
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ld: (document.getElementById('jsk-ld') || {}).text || ''
  };
});
// sredina elementa → je li tačka u kadru (bez preklapanja sa tekstom)
const rect = (p, s) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, s);

(async () => {
  const browser = await chromium.launch();
  let o, i;

  console.log('SR, računar 1440, park iznad, 16:30 → radi');
  o = await open(browser, { park: true, attrs: 'data-sat="2026-12-20 16:30"' });
  i = await info(o.p);
  check('nadnaslov = naslov stranice', i.eye === 'Sankalište', i.eye);
  check('naslov', i.h2 === 'Sankanjekao nekad', i.h2);
  check('uvod sa stranice', i.lead === LEAD, i.lead);
  check('spisak iz teksta', i.spec === SPEC, i.spec);
  check('cijene = link OVDJE', i.prices === PRICES, i.prices);
  check('više = link stranice', i.more === SITE + '/sankaliste/', i.more);
  check('video sa stranice (Elementor data-settings)', i.video);
  check('sat 16–18', i.dial === '16–18h', i.dial);
  check('opis sata', /od 16:00 do 18:00/.test(i.aria), i.aria);
  check('kazaljka na 16:30 (67,5°)', parseFloat(i.hand) === 67.5, i.hand);
  check('spojen sa parkom iznad', i.join);
  check('bez vodoravnog skrola', i.over <= 0, i.over);
  check('schema.org radno vrijeme', /"opens":"16:00","closes":"18:00"/.test(i.ld));
  let s = await st(o.p);
  check('status: Radi sada · do 18:00 (čitač ekrana)', s.open && s.b === 'Radi sada' && s.s === 'do 18:00', s);
  check('kuglica kazaljke zelena', s.bead === 'rgb(74, 222, 128)', s.bead);
  check('nema natpisa statusa iznad sata', await o.p.evaluate(() => { const e = document.querySelector('#jsk-sankaliste .jsk-sr'); return !document.querySelector('#jsk-sankaliste .jsk-st') && e.offsetWidth <= 1 && e.offsetHeight <= 1; }));
  const dd = await o.p.evaluate(() => { const d = document.querySelector('#jsk-sankaliste .jsk-dial'); return { num: [...d.querySelectorAll('.jsk-num')].map((n) => n.textContent).join(','), q: d.querySelectorAll('.jsk-tk--q').length, sun: !!d.querySelector('.jsk-sun'), moon: !!d.querySelector('.jsk-moon'), stars: d.querySelectorAll('.jsk-star').length, ends: d.querySelectorAll('.jsk-end').length, fa: d.style.getPropertyValue('--fa'), ta: d.style.getPropertyValue('--ta') }; });
  check('detalji sata: brojevi, četvrtine, sunce, mjesec, zvijezde, krajevi luka', dd.num === '24,6,12,18' && dd.q === 72 && dd.sun && dd.moon && dd.stars >= 5 && dd.ends === 2 && dd.fa === '60.0deg' && dd.ta === '90.0deg', dd);
  const fr = await rect(o.p, '#jsk-sankaliste .jsk-frame'), bd = await rect(o.p, '#jsk-sankaliste .jsk-body'), dl = await rect(o.p, '#jsk-sankaliste .jsk-dial');
  check('tekst desno, sat lijevo', bd.x > fr.x + fr.w * .45 && dl.r < bd.x, { bd: bd.x, dl: dl.r });
  check('desna ivica teksta na mreži 1240', Math.abs((fr.r - (await rect(o.p, '#jsk-sankaliste h2')).r) - 0) < 400);
  check('bez grešaka', o.errors.length === 0, o.errors);
  await o.p.screenshot({ path: path.join(OUT, '01-sr-1440-radi.png') });
  await o.p.locator('#jsk-sankaliste .jsk-frame').screenshot({ path: path.join(OUT, '01b-kadar-1440.png') });
  // prelaz park → sankalište
  await o.p.evaluate(() => window.scrollTo(0, document.getElementById('jsk-sankaliste').getBoundingClientRect().top + window.scrollY - 520));
  await o.p.waitForTimeout(500);
  await o.p.screenshot({ path: path.join(OUT, '02-prelaz-park.png') });

  // vrijeme se mijenja: 17:59 → 18:00 (zatvara se), ručno ne radi
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-sat', '2026-12-20 18:00'); r.__jskTick(); });
  s = await st(o.p);
  check('18:00 → Ne radi · otvara se sutra u 16:00', !s.open && s.b === 'Ne radi' && s.s === 'otvara se sutra u 16:00', s);
  i = await info(o.p);
  check('kazaljka ide naprijed (90°)', parseFloat(i.hand) === 90, i.hand);
  check('kuglica kazaljke crvena', s.bead === 'rgb(255, 92, 92)', s.bead);
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-sat', '2026-12-21 09:15'); r.__jskTick(); });
  s = await st(o.p);
  check('ujutru → otvara se u 16:00', s.s === 'otvara se u 16:00', s);
  i = await info(o.p);
  check('kazaljka ide naprijed i preko ponoći (318,75°)', parseFloat(i.hand) === 318.75, i.hand);
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-status', 'ne-radi'); r.setAttribute('data-sat', '2026-12-21 16:40'); r.__jskTick(); });
  s = await st(o.p);
  check('ručno: Danas ne radi', !s.open && s.b === 'Danas ne radi', s);
  // galerija: 3 naše + 1 sa stranice (emotikon ne)
  await o.p.evaluate(() => { document.getElementById('jsk-sankaliste').removeAttribute('data-status'); });
  await o.p.click('#jsk-sankaliste button[data-jsk="galerija"]');
  await o.p.waitForTimeout(450);
  const cap = await o.p.textContent('#jsk-lb figcaption');
  check('galerija: 4 fotografije', /1 \/ 4/.test(cap), cap);
  await o.p.keyboard.press('ArrowRight'); await o.p.keyboard.press('ArrowRight'); await o.p.keyboard.press('ArrowRight');
  const src = await o.p.getAttribute('#jsk-lb img', 'src');
  check('četvrta = sa stranice (najveća iz srcset-a)', /sankaliste\.jpg$/.test(src), src);
  await o.p.screenshot({ path: path.join(OUT, '03-galerija.png') });
  await o.p.keyboard.press('Escape'); await o.p.waitForTimeout(400);
  check('Esc zatvara galeriju', await o.p.evaluate(() => !document.getElementById('jsk-lb').classList.contains('is-shown')));
  // klik na fotografiju otvara galeriju
  const fr2 = await rect(o.p, '#jsk-sankaliste .jsk-frame');
  await o.p.mouse.click(fr2.x + 260, fr2.y + fr2.h - 80);
  await o.p.waitForTimeout(400);
  check('klik na fotografiju → galerija', await o.p.evaluate(() => document.getElementById('jsk-lb').classList.contains('is-open')));
  await o.p.keyboard.press('Escape'); await o.p.waitForTimeout(400);
  // video
  await o.p.click('#jsk-sankaliste button[data-jsk="video"]');
  await o.p.waitForTimeout(450);
  const ifr = await o.p.getAttribute('#jsk-vid iframe', 'src');
  check('video: youtube-nocookie sa ID-jem sa stranice', ifr && ifr.indexOf('youtube-nocookie.com/embed/' + YT) > -1, ifr);
  await o.p.keyboard.press('Escape'); await o.p.waitForTimeout(400);
  check('Esc zatvara video i gasi iframe', await o.p.evaluate(() => !document.querySelector('#jsk-vid iframe')));
  await o.p.click('#jsk-sankaliste a[data-jsk="cijene"]');
  await o.p.click('#jsk-sankaliste a[data-jsk="stranica"]');
  const ev = await o.p.evaluate(() => window.__ev.map((e) => e[1] + ':' + JSON.stringify(e[2])));
  check('GA događaji', ['sankaliste_galerija', 'sankaliste_video', 'sankaliste_klik:{"cilj":"cijene"', 'sankaliste_klik:{"cilj":"stranica"'].every((x) => ev.some((e) => e.indexOf(x) === 0)), ev);
  await o.ctx.close();

  console.log('sezona i stanja');
  o = await open(browser, { attrs: 'data-sezona="15.12-31.3" data-sat="2026-11-20 16:30"', wait: false });
  await o.p.waitForTimeout(600);
  s = await st(o.p);
  check('prije sezone (25 dana) → otvara se 15. 12.', !s.open && s.s === 'otvara se 15. 12.', s);
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-sat', '2026-07-01 16:30'); r.__jskTick(); });
  s = await st(o.p);
  check('ljeto → van sezone', !s.open && s.s === 'van sezone', s);
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-sat', '2027-01-15 17:10'); r.__jskTick(); });
  s = await st(o.p);
  check('u sezoni (januar) 17:10 → radi', s.open, s);
  await o.p.evaluate(() => { const r = document.getElementById('jsk-sankaliste'); r.setAttribute('data-sat', '2027-03-31 19:00'); r.__jskTick(); });
  s = await st(o.p);
  check('zadnji dan sezone uveče → van sezone', !s.open && s.s === 'van sezone', s);
  check('nadnaslov bez admina nema razlog', !(await info(o.p)).why);
  await o.ctx.close();

  console.log('WordPress: vjetar (danas ne radi), novo radno vrijeme, pretraga, prljav JSON, greška');
  o = await open(browser, { wp: 'vjetar', attrs: 'data-sat="2026-12-20 16:30"', wait: false });
  await o.p.waitForTimeout(700);
  s = await st(o.p);
  check('tekst stranice: danas ne radi zbog jakog vjetra', !s.open && s.b === 'Danas ne radi' && s.s === 'zbog jakog vjetra', s);
  check('uvod nije rečenica o vjetru', (await info(o.p)).lead === LEAD);
  await o.ctx.close();
  o = await open(browser, { wp: 'novo', attrs: 'data-sat="2026-12-20 17:30"', admin: true });
  i = await info(o.p); s = await st(o.p);
  check('novo vrijeme 15–17 na satu', i.dial === '15–17h', i.dial);
  check('17:30 poslije novog vremena → ne radi', !s.open && s.s === 'otvara se sutra u 15:00', s);
  check('novi podaci (bez sidra na stranici → bez reda Lift)', i.spec === 'Dužina=450 m|Lokacija=Staza 3 · Rajska|Sanke=Najam na ski kasi Rajska', i.spec);
  check('admin vidi: nema linka za cijene', /link za cijene/.test(i.why), i.why);
  check('bez videa nema linka za video', !i.video);
  await o.p.locator('#jsk-sankaliste .jsk-frame').screenshot({ path: path.join(OUT, '04-novo-admin.png') });
  await o.ctx.close();
  o = await open(browser, { wp: 'pretraga', wait: false });
  await o.p.waitForTimeout(700);
  i = await info(o.p);
  check('slug ne postoji → pretraga "sank"', i.lead === LEAD && o.rest.some((r) => /search=sank/.test(r)), o.rest);
  await o.ctx.close();
  o = await open(browser, { wp: 'upozorenje', wait: false });
  await o.p.waitForTimeout(700);
  check('prljav JSON (PHP upozorenje) se pročita', (await info(o.p)).prices === PRICES);
  await o.ctx.close();
  o = await open(browser, { wp: 'greska', admin: true, attrs: 'data-sat="2026-12-20 16:10"', wait: false });
  await o.p.waitForTimeout(800);
  i = await info(o.p); s = await st(o.p);
  check('greška → ugrađeni tekst', i.lead === LEAD && i.spec === SPEC, i.lead);
  check('greška → admin vidi razlog', /HTTP 403/.test(i.why), i.why);
  check('greška → status i dalje radi (ugrađeno 16–18)', s.open, s);
  await o.ctx.close();

  console.log('EN (qTranslate)');
  o = await open(browser, { path: '/en/pocetna-zima/', wp: 'qtranslate', attrs: 'data-sat="2026-12-20 20:41"' });
  i = await info(o.p); s = await st(o.p);
  check('EN nadnaslov', i.eye === 'Sledding track', i.eye);
  check('EN naslov', i.h2 === 'Sledding' + 'like old times', i.h2);
  check('EN uvod', /^If you have little ones/.test(i.lead), i.lead);
  check('EN podaci', /Length=600 m\|/.test(i.spec) && /Slope 7 · Poljice/.test(i.spec) && /Lift=Poljice T-bar/.test(i.spec) && /Rent at the Poljice ski desk/.test(i.spec), i.spec);
  check('EN vrijeme (4 pm to 6 pm)', i.dial === '16–18h', i.dial);
  check('EN status', !s.open && s.b === 'Closed' && s.s === 'opens tomorrow at 16:00', s);
  check('EN stranica /en/', i.more === SITE + '/en/sankaliste/', i.more);
  await o.p.locator('#jsk-sankaliste .jsk-frame').screenshot({ path: path.join(OUT, '05-en.png') });
  await o.ctx.close();

  console.log('veličine ekrana');
  for (const [vw, vh, name, touch] of [[1920, 1080, '06-1920', false], [1280, 800, '07-1280', false], [1024, 768, '08-1024', false], [820, 1180, '09-tablet', true], [390, 844, '10-telefon', true], [360, 740, '11-telefon-uski', true]]) {
    o = await open(browser, { vw, vh, touch, attrs: 'data-sat="2026-12-20 16:30"' });
    i = await info(o.p);
    const f = await rect(o.p, '#jsk-sankaliste .jsk-frame'), c = await rect(o.p, '#jsk-sankaliste .jsk-clock'), b = await rect(o.p, '#jsk-sankaliste .jsk-body');
    const btns = await o.p.evaluate(() => [...document.querySelectorAll('#jsk-sankaliste .jsk-btn')].map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.top)]; }));
    check(name + ': bez vodoravnog skrola', i.over <= 0, i.over);
    check(name + ': sat i status u kadru', c.x >= f.x && c.r <= f.r + .5 && c.y >= f.y, { c, f: [f.x, f.r] });
    check(name + ': sat ne prekriva tekst', vw <= 980 ? c.b <= b.y + 30 : c.r < b.x + 10, { c: [c.r, c.b], b: [b.x, b.y] });
    if (vw <= 980) check(name + ': sat gore lijevo na fotografiji', c.y - f.y < 34 && c.x - f.x < 44, [c.x - f.x, c.y - f.y]);
    check(name + ': dugmad iste veličine', btns.length === 2 && btns[0][0] === btns[1][0] && btns[0][1] === btns[1][1], btns);
    await o.p.locator('#jsk-sankaliste .jsk-frame').screenshot({ path: path.join(OUT, name + '.png') });
    check(name + ': bez grešaka', o.errors.length === 0, o.errors);
    await o.ctx.close();
  }

  console.log('uži kontejner, smanjeno kretanje, dataLayer');
  o = await open(browser, { wait: false });
  await o.p.waitForTimeout(500);
  i = await info(o.p);
  check('uži kontejner teme → blok i dalje preko cijele širine', !i.boxed && i.over <= 0 && await o.p.evaluate(() => Math.abs(document.getElementById('jsk-sankaliste').getBoundingClientRect().width - document.documentElement.clientWidth) < 1));
  await o.ctx.close();
  o = await open(browser, { reduced: true, ga: 'gtm', attrs: 'data-sat="2026-12-20 16:45"' });
  const vis = await o.p.evaluate(() => {
    const r = document.getElementById('jsk-sankaliste');
    return { anim: r.classList.contains('jsk-anim'), dial: getComputedStyle(r.querySelector('.jsk-dial')).opacity, st: getComputedStyle(r.querySelector('.jsk-sun')).opacity, hand: getComputedStyle(r.querySelector('.jsk-hand')).getPropertyValue('--a').trim() };
  });
  check('smanjeno kretanje: sve odmah vidljivo', !vis.anim && vis.dial === '1' && vis.st === '1' && parseFloat(vis.hand) === 71.25, vis);
  await o.p.click('#jsk-sankaliste a[data-jsk="cijene"]');
  check('dataLayer (GTM)', await o.p.evaluate(() => window.__ev.some((e) => e.event === 'sankaliste_klik' && e.cilj === 'cijene')));
  await o.ctx.close();

  await browser.close();
  console.log(fails ? '\n' + fails + ' PROVJERA NIJE PROŠLO' : '\nSve provjere su prošle.');
  process.exit(fails ? 1 : 0);
})();
