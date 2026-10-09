// Simulacija sajta za sekciju Snowboard park i Ski bike (sajt se iz cloud okruženja ne može otvoriti).
// Playwright presreće oc-jahorina.com i jsDelivr: stranica, WordPress REST odgovori (stranice parka i ski bike-a), park.js,
// depo.js (iznad, za razmak i cik-cak; bez WebGL-a, da test bude brz), fotografije i fontovi se služe lokalno.
// Pokretanje: node test-park.js [folder-za-screenshotove] [folder-sa-fontovima]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
const FONTS = process.argv[3] || '';
const REPO = path.resolve(__dirname, '../..');
const SITE = 'https://www.oc-jahorina.com';
const CDN = 'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@test/';
const UP = SITE + '/wp-content/uploads/2022/12/';
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
function page({ attrs = '', depo = false, admin = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${theme}</style></head><body class="home${admin ? ' logged-in admin-bar' : ''}">
  <div class="before">VIP gondola (iznad)</div>
  ${depo ? `<div class="boxed"><div class="elementor-widget-html"><div id="jsd-depo"></div>
    <script src="${CDN}jahorina-home-sections/depo/depo.js" defer></script></div></div>` : ''}
  <div class="boxed"><div class="elementor-widget-html">
    <div id="jsb-park" ${attrs}><a href="/snowboard-park/">Snowboard park</a></div>
    <script src="${CDN}jahorina-home-sections/park/park.js" defer></script>
  </div></div>
  <div class="after">Sljedeća sekcija</div></body></html>`;
}

// tekst stranice snowboard parka (screenshot korisnika, 9. 10. 2026) kako ga WordPress vraća
const PARK_P = [
  'Podjela ljubitelja zimskih sportova na “bordere” i skijaše nastala je još sa pojavom novog sporta, snowboarding-a. Ovakva podjela se može slobodno porediti sa onom među navijačima fudbalskih klubova, jer se zna tačno ko od njih šta voli, i zbog čega i često skijašima “borderi” smetaju na stazama, i obrnuto. Svako od njih, iz svog ugla, ima opravdane razloge za svoje mišljenje.',
  'Popularnost snowboardinga iz sezone u sezonu sve je veća, pogotovo od 1998. godine, kada je postao zimski olimpijski sport. Samim tim i “bordera” je sve više na ski stazama. Međutim, u zimskoj sezoni 22/23 veliki broj njih “preseliće” se negdje drugdje, i to baš na olimpijskoj lepotici Jahorini.',
  'Ova, po mnogo čemu autentična, planina podariće ljubiteljima snowboarding-a prostor o kojem su do sada mogli samo da sanjaju, i to – rezervisan samo za njih. Neće više biti guranja sa skijašima i ljutnje oko toga ko je kome “presjekao” put, jer će se na, ni manje ni više nego čak 3.000 kvadratnih metara, na stazi Trnovo, u blizini vikend naselja „Šator“, prostirati „Snowboard park“. Impozantno opremljen preprekama i skakaonicama na kojima će borderi moći da pokažu sve svoje znanje, uvježbavaju nove vratolomije ili možda naprave svoje prve korake, odnosno skokove, „Snowboard Park“ postaće novo mjesto okupljanja bordera, upoznavanja, druženja, pa i odmjeravanja snaga, odnosno vještina.',
  'Sasvim sigurno ovaj poligon spretnosti, hrabrosti, adrenalina i zabave postaće novo mjesto okupljanja ljubitelja ovog sporta, upoznavanja, druženja pa i odmeravanja snaga, odnosno vještina. Sve i da ste skijaš ili šetač, poligon spretnosti i adrenalina na više 3.000 metara kvadratnih prostora, „Snowboard park“, daće vam priliku da iz “prvog reda” posmatrate borderske vratolomije. Ko zna, možda se baš vi zaljubite u ovaj predivni sport.'
];
const PARK_LEAD = 'Ova, po mnogo čemu autentična, planina podariće ljubiteljima snowboarding-a prostor o kojem su do sada mogli samo da sanjaju, i to – rezervisan samo za njih.';
const BIKE_P = [
  'Ove zime Jahorina postaje bogatija za još jednu atrakciju koja obećava nezaboravno iskustvo – <strong>Ski Bike</strong>! Ako volite snijeg, planine i avanture, ovo je prava aktivnost za vas.',
  'Ski Bike je jedinstvena kombinacija bicikla i skija koja vam omogućava da se spuštate niz staze na potpuno nov način. Za vožnju nisu potrebne posebne vještine ili prethodno iskustvo – sve što vam treba je želja za zabavom!',
];
const BIKE_LEAD = 'Ski Bike je jedinstvena kombinacija bicikla i skija koja vam omogućava da se spuštate niz staze na potpuno nov način.';
const BIKE_FACTS = 'Trnovo / Poligon za vožnju|Bez iskustva / Lako se savladava|Za sve / Bez obzira na godine';
// tekst stranice ski bike-a (screenshot korisnika, 9. 10. 2026); emotikon kao slika (wp-emoji) ne ide u galeriju
const BIKE_PAGE = `<h2>Ski Bike – Novo uzbuđenje na Jahorini!</h2><p>${BIKE_P[0]}</p><h4>Šta je Ski Bike?</h4><p>${BIKE_P[1]}</p>
<h4>Za koga je Ski Bike?</h4><p>Ski Bike je idealan za sve:</p><ul><li><strong>Porodice</strong> koje traže zabavan način da zajedno uživaju na snijegu.</li>
<li><strong>Prijatelje</strong> koji žele probati nešto novo i drugačije.</li><li><strong>Pojedince</strong> željne adrenalina i avanture.<br>Bez obzira na godine i nivo iskustva, ova aktivnost je prilagođena svima!</li></ul>
<h4>Gdje možete voziti Ski Bike?</h4><p>Posebno za vas, omogućili smo vožnju <strong>Ski Bike-a na poligonu Trnovo</strong>, koji je savršeno prilagođen početnicima i iskusnim avanturistima. Na ovom poligonu možete sigurno savladati osnove i uživati u vožnji na potpuno nov način!</p>
<h4>Zašto odabrati Ski Bike?</h4><p><img class="emoji" alt="👉" src="https://s.w.org/images/core/emoji/15.0.3/72x72/1f449.png"> <strong>Jednostavno i sigurno</strong> – lako se savladava, čak i ako nikada niste stali na skije.</p>
<p>👉 <strong>Zabavno i uzbudljivo</strong> – osjećaj vožnje je potpuno drugačiji od klasičnog skijanja.</p><p>👉 <strong>Prilagođeno svima</strong> – od početnika do iskusnih avanturista, svi mogu uživati!</p>
<img src="${UP}ski-bike-1024x683.jpg" srcset="${UP}ski-bike-1024x683.jpg 1024w, ${UP}ski-bike.jpg 2000w" alt="Ski bike">`;
const BOX = (f) => `<div class="photo_box"><div class="image_frame"><img src="${UP}${f}-1024x683.jpg" srcset="${UP}${f}-1024x683.jpg 1024w, ${UP}${f}.jpg 1600w" width="1024" alt="Snowboard park"></div><h4>SNOWBOARD PARK</h4></div>`;
const CONTENT = {
  park: `<h3>Snowboard park Jahorina</h3><p>${PARK_P[0]}</p><p>${PARK_P[1]}</p>${BOX('park-1')}${BOX('park-2')}<p>${PARK_P[2]}</p><p>${PARK_P[3]}</p><img src="${UP}ikona.png" width="64" alt="">`,
  // nova verzija stranice: druga površina i staza, bez naselja
  parkNovo: `<p>Snowboard park Jahorina je poligon sa preprekama i skakaonicama za sve nivoe, na čak 4.500 m² staze Poljice.</p>`,
  bike: BIKE_PAGE,
  // ski bike stranica sa cijenom najma
  bikeCijena: BIKE_PAGE + '<p>Cijena najma Ski Bike-a je 25 KM po satu.</p>',
  qpark: `<p>[:SH]${PARK_P[2]}[:en]This truly authentic mountain offers snowboarders a terrain they could only dream of. Spread over 3,000 square meters on the Trnovo slope, near the Šator chalet village, the Snowboard park is full of jumps and obstacles.[:]</p>`,
  qbike: `<p>[:SH]Ski bike je bicikl sa skijama umjesto točkova.[:en]The ski bike is a bike with skis instead of wheels, a new way to ride the slopes of Jahorina.[:]</p><p>[:SH]Najam: 20 KM po satu.[:en]Rental: 20 KM per hour.[:]</p>`,
};
let fails = 0;
function check(name, ok, info) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : ''));
  if (!ok) fails++;
}

// wp: 'stranice' (park + ski bike), 'park' (samo park; ski bike stranice nema), 'novo', 'qtranslate', 'upozorenje', 'greska', 'nema'
async function open(browser, { path: pth = '/pocetna-zima/', vw = 1440, vh = 900, attrs = '', ga = 'gtag', reduced = false, wp = 'stranice', parkSlug = 'snowboard-park', depo = false, admin = false, touch = false, wait = true } = {}) {
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
      return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(__dirname, 'slike/bike-glavna-1000.webp')) });
    if (u.origin === SITE && (/\/wp-json\//.test(u.pathname) || u.searchParams.get('rest_route'))) {
      const q = decodeURIComponent(u.pathname + u.search);
      rest.push(q);
      if (/ski-depo|search=depo/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });   // depo iznad: ugrađeni tekst
      if (wp === 'greska') return route.fulfill({ status: 403, contentType: 'text/html', body: 'Forbidden' });
      if (u.pathname.startsWith('/en/wp-json/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"rest_no_route"}' });
      if (/wp\/v2\/media/.test(q)) return route.fulfill({ contentType: 'application/json', body: '[]' });
      if (/wp\/v2\/pages/.test(q)) {
        const park = { id: 51, link: SITE + '/' + parkSlug + '/', slug: parkSlug, title: { rendered: wp === 'qtranslate' ? '[:SH]Snowboard Park[:en]Snowboard Park[:]' : 'Snowboard Park' },
          content: { rendered: CONTENT[wp === 'qtranslate' ? 'qpark' : wp === 'novo' ? 'parkNovo' : 'park'] } };
        const bike = { id: 52, link: SITE + '/ski-bike-jahorina/', slug: 'ski-bike-jahorina', title: { rendered: wp === 'qtranslate' ? '[:SH]Ski bike[:en]Ski bike[:]' : 'Ski bike' },
          content: { rendered: CONTENT[wp === 'qtranslate' ? 'qbike' : wp === 'novo' ? 'bikeCijena' : 'bike'] } };
        const other = { id: 12, link: SITE + '/bike-park-ljeto/', slug: 'x', title: { rendered: 'Ljetna ponuda' }, content: { rendered: '<p>Bike park ljeti.</p>' } };
        const json = (a) => route.fulfill({ contentType: 'application/json', body: (wp === 'upozorenje' ? '<br />\n<b>Warning</b>:  Undefined array key "x" in <b>/home/oc/public_html/wp-content/themes/betheme/functions.php</b> on line <b>12</b><br />\n' : '') + JSON.stringify(a) });
        if (wp === 'nema') return json([]);
        if (new RegExp('slug=' + parkSlug + '(&|$)').test(q)) return json([park]);
        if (/slug=/.test(q)) return json([]);   // ski bike nema tačan slug → pretraga
        if (/search=snowboard/.test(q)) return json([park]);
        if (/search=bike/.test(q)) return json(wp === 'park' ? [other] : [other, bike]);
        return json([]);
      }
      return route.fulfill({ status: 404, body: '' });
    }
    if (u.origin === SITE) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page({ attrs, depo, admin }) });
    return route.abort();
  });
  await p.addInitScript(({ mode, depo }) => {
    window.__ev = [];
    if (mode === 'gtag') window.gtag = function () { window.__ev.push([].slice.call(arguments)); };
    if (mode === 'gtm') window.dataLayer = { push: function (o) { window.__ev.push(o); } };
    if (depo) { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/.test(t) ? null : g.apply(this, arguments); }; }
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  }, { mode: ga, depo });
  await p.goto(SITE + pth);
  await p.waitForSelector('#jsb-park .jsb-frame');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  await p.locator('#jsb-park').scrollIntoViewIfNeeded();
  // ulazak: kadar, tekst, linija se otvori (~2 s), pa jednom blagi pomak (~1,6 s)
  if (wait) {
    await p.waitForFunction(() => getComputedStyle(document.querySelector('#jsb-park .jsb-frame')).getPropertyValue('--open').trim() === '1.000' || !document.getElementById('jsb-park').classList.contains('jsb-anim'), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  return { p, ctx, errors, rest };
}
async function state(p) {
  return p.evaluate(() => {
    const r = document.getElementById('jsb-park'), b = r.getBoundingClientRect(), fr = r.querySelector('.jsb-frame'), f = fr.getBoundingClientRect();
    const st = r.querySelector('.jsb-stage').getBoundingClientRect(), body = r.querySelector('.jsb-body').getBoundingClientRect();
    const k = r.querySelector('.jsb-knob').getBoundingClientRect(), seam = r.querySelector('.jsb-seam').getBoundingClientRect();
    const on = r.querySelector('.jsb-pan.is-on'), pan = (sel) => r.querySelector(sel);
    const op = (sel) => +(+getComputedStyle(pan(sel)).opacity).toFixed(2);
    const hit = (a, c) => a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1;
    const texts = [...on.querySelectorAll('h2 span, .jsb-lead, .jsb-facts, .jsb-acts'), r.querySelector('.jsb-tabs')].map((e) => e.getBoundingClientRect());
    const labs = [...r.querySelectorAll('.jsb-lab')].filter((e) => getComputedStyle(e).opacity !== '0').map((e) => e.getBoundingClientRect());
    return {
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      left: Math.round(b.left), width: Math.round(b.width), cw: document.documentElement.clientWidth,
      p: +(+getComputedStyle(fr).getPropertyValue('--p')).toFixed(3), open: getComputedStyle(fr).getPropertyValue('--open').trim(),
      act: on.id, opPark: op('.jsb-pan--park'), opBike: op('.jsb-pan--bike'),
      inert: [...r.querySelectorAll('.jsb-pan')].map((x) => (x.hasAttribute('inert') ? 1 : 0)).join(''),
      tabs: [...r.querySelectorAll('.jsb-tab')].map((t) => t.textContent + (t.getAttribute('aria-selected') === 'true' ? '*' : '')).join('|'),
      labelled: r.querySelector('.jsb-wrap').getAttribute('aria-labelledby'), knobLabel: r.querySelector('.jsb-knob').getAttribute('aria-label'),
      h2color: getComputedStyle(on.querySelector('h2 span')).color, h2font: getComputedStyle(on.querySelector('h2 span')).fontFamily.split(',')[0],
      lines: [...on.querySelectorAll('h2 span')].map((s) => s.textContent), outline: on.querySelector('h2 .jsb-o').textContent,
      lead: on.querySelector('.jsb-lead').textContent, leadPark: pan('.jsb-pan--park .jsb-lead').textContent, leadBike: pan('.jsb-pan--bike .jsb-lead').textContent,
      facts: [...on.querySelectorAll('.jsb-facts li')].map((li) => li.querySelector('b').textContent + ' / ' + li.querySelector('small').textContent),
      factsPark: [...r.querySelectorAll('.jsb-pan--park .jsb-facts li')].map((li) => li.querySelector('b').textContent + ' / ' + li.querySelector('small').textContent),
      factsBike: [...r.querySelectorAll('.jsb-pan--bike .jsb-facts li')].map((li) => li.querySelector('b').textContent + ' / ' + li.querySelector('small').textContent),
      btxt: [...on.querySelectorAll('.jsb-btn')].map((a) => a.innerText.trim()),
      pages: [...r.querySelectorAll('a[data-jsb="stranica"]')].map((a) => a.getAttribute('href')),
      seamX: Math.round(seam.left + seam.width / 2 - st.left), knobX: Math.round(k.left + k.width / 2 - st.left), stageW: Math.round(st.width),
      knobFree: !texts.some((t) => hit(k, t)), labFree: labs.every((l) => !texts.some((t) => hit(l, t))),
      labIn: labs.every((l) => l.left >= st.left - 1 && l.right <= st.right + 1),
      labSide: (() => { const x = seam.left + seam.width / 2; return [...r.querySelectorAll('.jsb-lab')].filter((e) => getComputedStyle(e).opacity !== '0').every((e) => { const q = e.getBoundingClientRect(); return e.classList.contains('jsb-lab--park') ? q.right <= x - 8 : q.left >= x + 8; }); })(),
      stageAbove: st.bottom <= body.top + 60, bodyIn: body.left >= f.left - 1 && body.right <= f.right + 1 && body.bottom <= f.bottom + 1,
      textLeft: (() => { const tb = on.querySelector('.jsb-lead').getBoundingClientRect(); return tb.right < k.left; })(),
      acts: [...on.querySelectorAll('.jsb-btn')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }),
      factsW: Math.round(on.querySelector('.jsb-facts').getBoundingClientRect().width), actsW: Math.round(on.querySelector('.jsb-acts').getBoundingClientRect().width),
      fit: [...on.querySelectorAll('.jsb-btn, .jsb-facts b')].every((a) => a.scrollWidth <= a.clientWidth + 1),
      hint: r.querySelector('.jsb-hint').classList.contains('is-gone'),
      why: (r.querySelector('.jsb-why') || {}).textContent || '',
      hidden: [...on.querySelectorAll('.jsb-up'), r.querySelector('.jsb-tabs')].filter((e) => getComputedStyle(e).opacity !== '1').length,
      ld: (() => { try { const j = JSON.parse(document.getElementById('jsb-ld').text); return j['@graph'].map((x) => x['@type'] + ':' + x.name).join('|'); } catch (e) { return 'nema'; } })(),
    };
  });
}
async function lb(p) {
  return p.evaluate(() => {
    const m = document.getElementById('jsb-lb');
    if (!m) return { shown: 'none' };
    return { shown: getComputedStyle(m).display, src: m.querySelector('img').getAttribute('src').replace(/^.*\//, ''), cap: m.querySelector('figcaption').textContent,
      inside: !!(document.activeElement && document.activeElement.closest('#jsb-lb')), overflow: document.documentElement.style.overflow, focus: document.activeElement.className };
  });
}
// prevlačenje mišem (ili prstom kao miš) preko fotografije: od x do x + dx, u koracima; vraća screenshot sredine ako se traži
async function drag(p, dx, { from = null, steps = 14, shotAt = null, fast = false, hold = 0 } = {}) {
  const s = await p.locator('#jsb-park .jsb-stage').boundingBox();
  const k = await p.locator('#jsb-park .jsb-knob').boundingBox();
  const x0 = from != null ? s.x + from : k.x + k.width / 2, y = k.y + k.height / 2 + (from != null ? 60 : 0);
  await p.mouse.move(x0, y); await p.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await p.mouse.move(x0 + dx * i / steps, y);
    if (!fast) await p.waitForTimeout(16);
    if (shotAt && i === Math.round(steps * shotAt.at)) await p.locator('#jsb-park .jsb-frame').screenshot({ path: path.join(OUT, shotAt.name + '.png') });
  }
  if (hold) await p.waitForTimeout(hold);
  await p.mouse.up();
}
const settle = (p) => p.waitForTimeout(800).then(() => p.waitForFunction(() => { const v = +getComputedStyle(document.querySelector('#jsb-park .jsb-frame')).getPropertyValue('--p'); return v === 0 || v === 1; }, null, { timeout: 5000 })).catch(() => {}).then(() => p.waitForTimeout(150));
const shot = (p, name) => p.locator('#jsb-park .jsb-frame').screenshot({ path: path.join(OUT, name + '.png') });
const evs = (p) => p.evaluate(() => window.__ev.filter((e) => /^park_/.test(e[1] || e.event)).map((e) => (e[1] ? e[1] + ':' + JSON.stringify(e[2]) : JSON.stringify(e))));

(async () => {
  const browser = await chromium.launch();

  console.log('SR, računar, Ski depo iznad, uži kontejner teme, GA4 (gtag), WordPress stranice parka i ski bike-a');
  let { p, ctx, errors, rest } = await open(browser, { depo: true });
  let S = await state(p);
  check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
  check('naslov bijeli i Archivo uprkos temi', S.h2color === 'rgb(255, 255, 255)' && /Archivo/.test(S.h2font), [S.h2color, S.h2font]);
  check('počinje od parka: "Snowboard / park", kraj iscrtan', S.act === 'jsb-p0' && S.lines.join('|') === 'Snowboard|park' && S.outline === 'park' && S.p === 0, [S.act, S.lines, S.p]);
  check('linija otvorena, blizu desne ivice (ski bike viri)', S.open === '1.000' && S.seamX > S.stageW * .8 && S.seamX < S.stageW * .9 && Math.abs(S.knobX - S.seamX) <= 1, [S.open, S.seamX, S.stageW]);
  check('nadnaslov: Snowboard park* | Ski bike; dugme linije ima natpis', S.tabs === 'Snowboard park*|Ski bike' && S.knobLabel === 'Prikaži ski bike (prevucite ulijevo)', [S.tabs, S.knobLabel]);
  check('tekst parka vidljiv, ski bike sakriven i neaktivan', S.opPark === 1 && S.opBike === 0 && S.inert === '01' && S.labelled === 'jsb-h0', [S.opPark, S.opBike, S.inert]);
  check('uvod parka = rečenica o prostoru sa stranice', S.lead === PARK_LEAD, S.lead);
  check('podaci parka sa stranice: 3.000 m², Trnovo, Šator', S.facts.join('|') === '3.000 m² / Površina parka|Trnovo / Staza|Šator / Kod vikend naselja', S.facts);
  check('ski bike (pretraga "bike"): uvod = šta je ski bike; poligon Trnovo, bez iskustva, za sve', S.leadBike === BIKE_LEAD && S.factsBike.join('|') === BIKE_FACTS, [S.leadBike, S.factsBike]);
  check('linkovi stranica', S.pages.join('|') === SITE + '/snowboard-park/|' + SITE + '/ski-bike-jahorina/', S.pages);
  check('dugmad: Više o snowboard parku + Galerija, isti red, 44px, natpisi staju', S.btxt.join('|') === 'Više o snowboard parku|Galerija' && S.acts[0][0] === S.acts[1][0] && S.acts[0][1] === S.acts[1][1] && S.acts[0][2] === 44 && S.fit, [S.btxt, S.acts, S.fit]);
  check('podaci i dugmad iste širine', S.factsW === S.actsW, [S.factsW, S.actsW]);
  check('tekst lijevo od linije; dugme i natpisi linije ne prelaze preko teksta', S.textLeft && S.knobFree && S.labFree, [S.textLeft, S.knobFree, S.labFree]);
  check('sve vidljivo poslije ulaska, tekst u kadru', S.hidden === 0 && S.bodyIn, [S.hidden, S.bodyIn]);
  check('admin poruka se ne vidi; schema.org park + ski bike', S.why === '' && S.ld === 'SportsActivityLocation:Snowboard park Jahorina|TouristAttraction:Ski bike Jahorina', [S.why, S.ld]);
  const rs = rest.filter((x) => !/ski-depo|search=depo/.test(x));
  check('pozivi WP-u: park (slug), ski bike (slug pa search=bike)', rs.length === 3 && rs.some((x) => /pages\?slug=snowboard-park/.test(x)) && rs.some((x) => /pages\?slug=ski-bike&/.test(x)) && rs.some((x) => /search=bike/.test(x)), rs);
  const j = await p.evaluate(() => {
    const r = document.getElementById('jsb-park'), a = document.querySelector('#jsd-depo .jsd-frame').getBoundingClientRect(), b = r.querySelector('.jsb-frame').getBoundingClientRect();
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;width:var(--gap);height:var(--g)'; r.querySelector('.jsb-wrap').appendChild(tmp);
    const gap = tmp.getBoundingClientRect().width, gg = tmp.getBoundingClientRect().height; tmp.remove();
    return { join: r.classList.contains('jsb--join'), space: Math.round(b.top - a.bottom), want: Math.round(gap + gg) };
  });
  check('Ski depo iznad: jsb--join, razmak kadar → kadar = --gap + --g', j.join && Math.abs(j.space - j.want) <= 2, j);
  await p.screenshot({ path: path.join(OUT, 'depo-park.png'), fullPage: true });
  await shot(p, '1-racunar-park');
  // prevlačenje ulijevo preko pola (sredina snimljena), pa pušteno → ski bike
  await drag(p, -420, { steps: 20, shotAt: { at: .55, name: '2-racunar-prevlacenje' } });
  await settle(p);
  S = await state(p);
  check('prevučeno ulijevo: ski bike, linija odmah desno od teksta', S.act === 'jsb-p1' && S.p === 1 && S.opBike === 1 && S.opPark === 0 && S.inert === '10' && S.textLeft && S.knobFree && S.labFree, [S.act, S.p, S.seamX, S.knobFree, S.labFree]);
  check('ski bike: "Ski / bike", nadnaslov i natpisi prebačeni, uputa nestala', S.lines.join('|') === 'Ski|bike' && S.tabs === 'Snowboard park|Ski bike*' && S.labelled === 'jsb-h1' && S.knobLabel === 'Prikaži snowboard park (prevucite udesno)' && S.hint, [S.lines, S.tabs, S.hint]);
  check('ski bike: dugmad Više o ski bike-u + Galerija', S.btxt.join('|') === 'Više o ski bike-u|Galerija' && S.fit, S.btxt);
  await shot(p, '3-racunar-bike');
  // kratko prevlačenje udesno (ispod pola) → vraća se na ski bike
  await drag(p, 90, { steps: 6, hold: 200 }); await settle(p);
  S = await state(p);
  check('kratko prevlačenje udesno: ostaje ski bike', S.act === 'jsb-p1' && S.p === 1, [S.act, S.p]);
  // brz kratak potez udesno → park
  await drag(p, 120, { steps: 3, fast: true }); await settle(p);
  S = await state(p);
  check('brz potez udesno: park', S.act === 'jsb-p0' && S.p === 0, [S.act, S.p]);
  // klik na fotografiju ski bike-a iza linije
  const sb = await p.locator('#jsb-park .jsb-stage').boundingBox();
  await p.mouse.click(sb.x + sb.width - 40, sb.y + sb.height * .6); await settle(p);
  S = await state(p);
  check('klik na ski bike iza linije: ski bike', S.act === 'jsb-p1', S.act);
  // nadnaslov (tab) i tastatura
  await p.click('#jsb-park #jsb-t0'); await settle(p);
  S = await state(p);
  check('klik na "Snowboard park" u nadnaslovu: park', S.act === 'jsb-p0' && S.p === 0, S.act);
  await p.focus('#jsb-park .jsb-knob'); await p.keyboard.press('ArrowLeft'); await settle(p);
  S = await state(p);
  check('tastatura: ← na dugmetu linije → ski bike', S.act === 'jsb-p1', S.act);
  await p.keyboard.press('ArrowRight'); await settle(p);
  await p.focus('#jsb-park #jsb-t0'); await p.keyboard.press('ArrowRight'); await settle(p);
  S = await state(p);
  const foc = await p.evaluate(() => document.activeElement.id);
  check('tastatura: → u nadnaslovu prebaci na ski bike i fokus pređe', S.act === 'jsb-p1' && foc === 'jsb-t1', [S.act, foc]);
  // galerija ski bike-a: 2 naše + 1 sa stranice
  await p.click('#jsb-park .jsb-pan--bike [data-jsb="galerija"]'); await p.waitForTimeout(450);
  let L = await lb(p);
  check('galerija ski bike-a: 1 / 3, naša fotografija, fokus unutra', L.shown === 'grid' && L.src === 'bike-glavna.webp' && L.cap === 'Ski bike · 1 / 3' && L.inside && L.overflow === 'hidden', L);
  await p.keyboard.press('ArrowLeft');
  L = await lb(p);
  check('strelica: najveća fotografija sa stranice (2000w)', L.cap === 'Ski bike · 3 / 3' && L.src === 'ski-bike.jpg', L);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  L = await lb(p);
  check('Esc zatvara, fokus nazad, skrol vraćen', L.shown === 'none' && /jsb-btn--ghost/.test(L.focus) && L.overflow === '', L);
  await p.click('#jsb-park .jsb-pan--bike a[data-jsb="stranica"]');
  const ev = await evs(p);
  check('GA4: park_prebaci (prevlačenje, klik, tastatura), park_galerija, park_klik', JSON.stringify(ev) === JSON.stringify([
    'park_prebaci:{"ponuda":"ski_bike","nacin":"prevlacenje","jezik":"sr"}', 'park_prebaci:{"ponuda":"snowboard_park","nacin":"prevlacenje","jezik":"sr"}',
    'park_prebaci:{"ponuda":"ski_bike","nacin":"klik","jezik":"sr"}', 'park_prebaci:{"ponuda":"snowboard_park","nacin":"klik","jezik":"sr"}',
    'park_prebaci:{"ponuda":"ski_bike","nacin":"tastatura","jezik":"sr"}', 'park_prebaci:{"ponuda":"snowboard_park","nacin":"tastatura","jezik":"sr"}',
    'park_prebaci:{"ponuda":"ski_bike","nacin":"tastatura","jezik":"sr"}', 'park_galerija:{"ponuda":"ski_bike","jezik":"sr"}', 'park_klik:{"cilj":"stranica","ponuda":"ski_bike","jezik":"sr"}']), ev);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Ulazak: kadar, tekst, linija se otvori, jednom blagi pomak');
  ({ p, ctx, errors } = await open(browser, { wait: false, ga: 'none', depo: true }));
  const seq = [];
  for (let i = 0; i < 60; i++) {
    const v = await p.evaluate(() => { const f = getComputedStyle(document.querySelector('#jsb-park .jsb-frame')); return [+(+f.getPropertyValue('--open')).toFixed(2), +(+f.getPropertyValue('--p')).toFixed(3)]; });
    seq.push(v);
    if (v[0] > .3 && v[0] < .8 && !seq.shot) { seq.shot = 1; await p.screenshot({ path: path.join(OUT, 'ulazak.png') }); }
    await p.waitForTimeout(100);
  }
  const maxP = Math.max(...seq.map((v) => v[1]));
  check('linija: zatvorena → otvara se → otvorena; pomak do ~0,08 pa nazad na 0', seq[0][0] === 0 && seq.some((v) => v[0] > 0 && v[0] < 1) && seq[seq.length - 1][0] === 1 && maxP > .05 && maxP < .1 && seq[seq.length - 1][1] === 0, { maxP, kraj: seq[seq.length - 1] });
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Ski bike stranica ne postoji → ugrađeni tekst ski bike-a; admin vidi razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'park', admin: true, ga: 'none' }));
  S = await state(p);
  check('park sa stranice, ski bike ugrađen (isti kao stranica); admin: ski bike nije pronađen', S.lead === PARK_LEAD && S.leadBike === BIKE_LEAD && S.factsBike.join('|') === BIKE_FACTS && /Ski bike: stranica "ski-bike" nije pronađena/.test(S.why), [S.leadBike, S.why]);
  await shot(p, 'admin-poruka');
  await ctx.close();

  console.log('Izmijenjena stranica parka: 4.500 m², Poljice, bez naselja; počinje od ski bike-a (data-pocetak)');
  ({ p, ctx, errors } = await open(browser, { wp: 'novo', admin: true, attrs: 'data-pocetak="bike"', ga: 'none' }));
  S = await state(p);
  check('počinje od ski bike-a, linija lijevo', S.act === 'jsb-p1' && S.p === 1 && S.seamX < S.stageW * .6, [S.act, S.p, S.seamX]);
  check('novi uvod i podaci parka (bez naselja)', /^Snowboard park Jahorina je poligon/.test(S.leadPark) && S.factsPark.join('|') === '4.500 m² / Površina parka|Poljice / Staza', [S.leadPark, S.factsPark]);
  check('ski bike sa cijenom: najam 25 KM po satu prvi, pa poligon i bez iskustva', S.factsBike.join('|') === '25 KM / Najam po satu|Trnovo / Poligon za vožnju|Bez iskustva / Lako se savladava', S.factsBike);
  await ctx.close();

  console.log('Pogrešan slug parka → stranica se nađe pretragom "snowboard"');
  ({ p, ctx, errors, rest } = await open(browser, { parkSlug: 'snowboard-park-jahorina', admin: true, ga: 'none' }));
  S = await state(p);
  check('nađena stranica parka: uvod i link', S.leadPark === PARK_LEAD && S.pages[0] === SITE + '/snowboard-park-jahorina/' && S.why === '', [S.pages, S.why]);
  check('pozivi: slug pa search=snowboard', rest.some((x) => /search=snowboard/.test(x)), rest);
  await ctx.close();

  console.log('WordPress ispiše PHP upozorenje prije JSON-a');
  ({ p, ctx, errors } = await open(browser, { wp: 'upozorenje', ga: 'none', admin: true }));
  S = await state(p);
  check('podaci se ipak pročitaju, admin bez poruke', S.leadPark === PARK_LEAD && S.factsBike.join('|') === BIKE_FACTS && S.why === '', [S.why]);
  await ctx.close();

  console.log('EN, računar, Google Tag Manager, qTranslate oznake (/en/wp-json ne radi → /wp-json)');
  ({ p, ctx, errors, rest } = await open(browser, { path: '/en/pocetna-zima/', ga: 'gtm', wp: 'qtranslate' }));
  S = await state(p);
  check('engleski nadnaslov, naslov i uvod parka iz WP-a', S.tabs === 'Snowboard park*|Ski bike' && S.lines.join('|') === 'Snowboard|park' && /^This truly authentic mountain offers snowboarders a terrain/.test(S.lead), [S.tabs, S.lead]);
  check('engleski podaci parka: 3,000 m², Trnovo, Šator', S.facts.join('|') === '3,000 m² / Park area|Trnovo / Slope|Šator / Near the chalet village', S.facts);
  check('engleski ski bike: uvod, najam 20 KM per hour', /^The ski bike is a bike with skis/.test(S.leadBike) && S.factsBike[0] === '20 KM / Rental per hour', [S.leadBike, S.factsBike]);
  check('dugmad i link /en/', S.btxt.join('|') === 'More about the park|Gallery' && S.pages[0] === SITE + '/en/snowboard-park/', [S.btxt, S.pages]);
  check('prvo /en/wp-json, pa /wp-json', /^\/en\/wp-json/.test(rest[0]) && rest.some((x) => /^\/wp-json\/wp\/v2\/pages/.test(x)), rest);
  await drag(p, -420); await settle(p);
  const ev2 = await p.evaluate(() => window.__ev.filter((e) => /^park_/.test(e.event)));
  check('dataLayer: park_prebaci', JSON.stringify(ev2) === JSON.stringify([{ event: 'park_prebaci', ponuda: 'ski_bike', nacin: 'prevlacenje', jezik: 'en' }]), ev2);
  S = await state(p);
  check('EN ski bike: dugmad', S.btxt.join('|') === 'More about the ski bike|Gallery', S.btxt);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await shot(p, 'en-racunar-bike');
  await ctx.close();

  console.log('WordPress ne odgovara (403): posjetilac vidi ugrađeni sadržaj, admin i razlog');
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none' }));
  S = await state(p);
  check('ugrađeni tekst i podaci parka', S.lead === PARK_LEAD && S.facts.length === 3 && S.why === '', [S.lead, S.why]);
  await ctx.close();
  ({ p, ctx, errors } = await open(browser, { wp: 'greska', ga: 'none', admin: true }));
  S = await state(p);
  check('admin vidi razlog za obje stranice', /Snowboard park: HTTP 403/.test(S.why) && /Ski bike: HTTP 403/.test(S.why), S.why);
  await ctx.close();

  for (const [name, vw, vh, touch] of [['laptop', 1280, 800], ['laptop-mali', 1024, 700], ['siroki', 1920, 1080], ['tablet', 900, 1100, true], ['telefon', 390, 844, true], ['uski-telefon', 340, 740, true]]) {
    console.log(name);
    ({ p, ctx, errors } = await open(browser, { vw, vh, touch }));
    S = await state(p);
    check('bez vodoravnog skrola, preko cijele širine', S.scroll === 0 && S.left === 0 && S.width === S.cw, S);
    check('sve vidljivo poslije ulaska, tekst u kadru', S.hidden === 0 && S.bodyIn, [S.hidden, S.bodyIn]);
    check('natpisi dugmadi i podataka staju; podaci i dugmad iste širine', S.fit && S.factsW === S.actsW, [S.fit, S.factsW, S.actsW]);
    if (vw > 980) check('tekst lijevo od linije, dugme i natpisi ne prelaze preko teksta', S.textLeft && S.knobFree && S.labFree, [S.textLeft, S.knobFree, S.labFree]);
    else check('fotografije iznad teksta, natpisi u kadru', S.stageAbove && S.labIn, [S.stageAbove, S.labIn]);
    check('natpisi uz liniju, svaki na svojoj strani', S.labSide && S.labIn, [S.labSide, S.labIn]);
    if (vw <= 760 && vw > 360) check('telefon: oba dugmeta u jednom redu, 42px', S.acts[0][0] === S.acts[1][0] && S.acts[0][2] === 42, S.acts);
    await shot(p, name + '-park');
    await drag(p, -(S.stageW * .5)); await settle(p);
    S = await state(p);
    check('prevlačenje ulijevo: ski bike', S.act === 'jsb-p1' && S.p === 1, [S.act, S.p]);
    if (vw > 980) check('ski bike: tekst lijevo od linije, ništa preko teksta', S.textLeft && S.knobFree && S.labFree, [S.textLeft, S.knobFree, S.labFree]);
    check('ski bike: natpisi staju; natpisi linije na svojoj strani', S.fit && S.labSide && S.labIn, [S.fit, S.labSide, S.labIn]);
    await shot(p, name + '-bike');
    check('bez grešaka u konzoli', errors.length === 0, errors);
    await ctx.close();
  }

  console.log('Telefon: okomit pokret prsta preko fotografije skroluje stranicu (ne prebacuje)');
  ({ p, ctx, errors } = await open(browser, { vw: 390, vh: 844, touch: true, ga: 'none' }));
  const y0 = await p.evaluate(() => window.scrollY);
  const sb2 = await p.locator('#jsb-park .jsb-stage').boundingBox();
  const cdp = await ctx.newCDPSession(p);
  const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await tp('touchStart', sb2.x + 200, sb2.y + 300);
  for (let i = 1; i <= 10; i++) await tp('touchMove', sb2.x + 200, sb2.y + 300 - i * 20);
  await tp('touchEnd'); await p.waitForTimeout(600);
  S = await state(p);
  const y1 = await p.evaluate(() => window.scrollY);
  check('stranica skrolovana, ostaje park', y1 > y0 + 50 && S.act === 'jsb-p0' && S.p === 0, [y0, y1, S.act]);
  await tp('touchStart', sb2.x + 300, sb2.y + 200 - (y1 - y0));
  for (let i = 1; i <= 10; i++) await tp('touchMove', sb2.x + 300 - i * 22, sb2.y + 200 - (y1 - y0));
  await tp('touchEnd'); await settle(p);
  S = await state(p);
  check('vodoravni pokret prsta: ski bike', S.act === 'jsb-p1' && S.p === 1, [S.act, S.p]);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  console.log('Smanjeno kretanje (bez ulaska i pomaka; prebacivanje odmah)');
  ({ p, ctx, errors } = await open(browser, { reduced: true }));
  S = await state(p);
  const rm = await p.evaluate(() => document.getElementById('jsb-park').className);
  check('odmah vidljivo, bez klasa za ulazak, linija otvorena', !/jsb-anim/.test(rm) && S.hidden === 0 && (S.open === '' || S.open === '1') && S.p === 0, [rm, S.open]);
  await p.click('#jsb-park #jsb-t1'); await p.waitForTimeout(50);
  S = await state(p);
  check('klik u nadnaslovu: ski bike odmah', S.act === 'jsb-p1' && S.p === 1, [S.act, S.p]);
  check('bez grešaka u konzoli', errors.length === 0, errors);
  await ctx.close();

  await browser.close();
  console.log(fails ? `\n${fails} provjera nije prošlo` : '\nSve provjere prošle');
  process.exit(fails ? 1 : 0);
})();
