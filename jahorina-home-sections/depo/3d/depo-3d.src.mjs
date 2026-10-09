/* =====================================================================
   JAHORINA — SKI DEPO · 3D ormarić (three.js)
   Izvor za ../depo-3d.js (napravi: npm install && node napravi-3d.mjs). Učitava ga depo.js tek kad se sekcija približi.
   Scena: noćni red ormarića za opremu (bijeli, crna ploča na vratima, broj), ormarić 61 se otvori i osvijetljen je
   iznutra. Unutra su nosači za sušenje sa perforiranim rozetama (kao na fotografiji depoa), ventilacija na plafonu.
   Oprema se dodaje klikom (dva puna seta): skije sa štapovima, pancerice, kaciga, rukavice. Kad su pancerice ili
   rukavice na nosačima, rupice rozeta tiho zažare (grijanje i sušenje).
   API: window.JSD3D.create(host, opt) → { set, has, open, setLayout, resize, pause, resume, anchors, snapshot, dispose }
   ===================================================================== */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial,
  BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry, CapsuleGeometry, CircleGeometry, PlaneGeometry,
  ExtrudeGeometry, TubeGeometry, Shape, BufferGeometry, Float32BufferAttribute, QuadraticBezierCurve3, CanvasTexture, PMREMGenerator, Color, Vector3,
  HemisphereLight, DirectionalLight, SpotLight, PointLight, Fog, SRGBColorSpace, NeutralToneMapping, PCFSoftShadowMap,
  AdditiveBlending, DoubleSide, MathUtils
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BG = 0x0A1120;
// mjere ormarića (m): širina, visina tijela, dubina, debljina lima, postolje
const W = 0.40, H = 1.80, D = 0.50, T = 0.012, PL = 0.088;
const IX = W / 2 - T, IY0 = PL + T, IY1 = PL + H - T, ZB = -D / 2 + T, ZF = D / 2;
const NUM = 61, FIRST = 55, LAST = 68;   // ormarić 61 je otvoren; red od 55 do 68 nestaje u mraku

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, srgb = true) { const t = new CanvasTexture(c); if (srgb) t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; }
function rbox(w, h, d, r, seg = 3) { return new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)); }
function mesh(g, m, shadow = true) { const o = new Mesh(g, m); o.castShadow = shadow; o.receiveShadow = true; return o; }
const ease = { out: (t) => 1 - Math.pow(1 - t, 3), inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), back: (t) => { const c = 1.25; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };

/* ---------- teksture ---------- */
// broj na vratima (tanak, kao na fotografiji)
function numberTex(n, font) {
  const c = canvas(256, 160), g = c.getContext('2d');
  g.fillStyle = '#1a1d22'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '400 92px ' + font; g.fillText(String(n), 128, 84);
  return tex(c);
}
// perforirana rozeta oko nosača (rupice za topao vazduh); drugi sloj = samo rupice, za tiho žarenje
function rosette() {
  const mk = (glow) => {
    const c = canvas(128, 128), g = c.getContext('2d');
    if (!glow) {
      g.fillStyle = '#f4f6f9'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.stroke();
    } else { g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128); }
    g.fillStyle = glow ? '#fff' : '#2b3038';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.arc(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44, 5.2, 0, 7); g.fill(); }
    if (!glow) { g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.arc(64, 64, 20, 0, 7); g.fill(); }
    return tex(c, !glow);
  };
  return { map: mk(false), glow: mk(true) };
}
// plafon sa prorezima ventilacije (kroz njih dolazi svjetlo)
function ventTex(glow) {
  const c = canvas(256, 320), g = c.getContext('2d');
  g.fillStyle = glow ? '#000' : '#eef1f5'; g.fillRect(0, 0, 256, 320);
  g.fillStyle = glow ? '#fff' : '#9aa3b0';
  for (let r = 0; r < 6; r++) for (let k = 0; k < 2; k++) {
    const x = 40 + k * 96, y = 46 + r * 40;
    g.beginPath(); g.roundRect ? g.roundRect(x, y, 80, 12, 6) : g.rect(x, y, 80, 12); g.fill();
  }
  return tex(c, !glow);
}
// piktogrami na zadnjem zidu (kaciga, rukavice, pancerica), kao na pravom ormariću
function pictoTex(kind) {
  const c = canvas(128, 64), g = c.getContext('2d');
  g.strokeStyle = '#16191e'; g.fillStyle = '#16191e'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'helmet') {
    g.beginPath(); g.moveTo(40, 46); g.bezierCurveTo(40, 14, 88, 12, 92, 40); g.lineTo(92, 46); g.closePath(); g.fill();
    g.fillStyle = '#eef1f5'; g.fillRect(56, 36, 30, 6);
  } else if (kind === 'glove') {
    for (const s of [-1, 1]) {
      g.save(); g.translate(64 + s * 26, 34); g.scale(s, 1);
      g.beginPath(); g.moveTo(-10, 20); g.lineTo(-10, -4); g.lineTo(-8, -18); g.lineTo(-3, -4); g.lineTo(0, -20); g.lineTo(3, -4); g.lineTo(7, -17); g.lineTo(9, -2); g.lineTo(16, -8); g.lineTo(12, 8); g.lineTo(10, 20); g.closePath(); g.fill();
      g.restore();
    }
    g.lineWidth = 4; g.beginPath(); g.moveTo(48, 54); g.quadraticCurveTo(64, 62, 80, 54); g.stroke();
  } else {
    g.beginPath(); g.moveTo(46, 10); g.lineTo(70, 10); g.lineTo(72, 32); g.lineTo(94, 40); g.lineTo(96, 52); g.lineTo(44, 52); g.closePath(); g.fill();
  }
  return tex(c);
}
// gornja ploha skije (topsheet): tamna sa limeta ivicama (kao skije na fotografiji) ili bijela
function skiTex(dark) {
  const c = canvas(64, 1024), g = c.getContext('2d');
  g.fillStyle = dark ? '#121417' : '#e8ebef'; g.fillRect(0, 0, 64, 1024);
  const acc = dark ? '#b9e12d' : '#1d2a44';
  g.fillStyle = acc; g.fillRect(2, 0, 4, 1024); g.fillRect(58, 0, 4, 1024);
  g.globalAlpha = .9; g.beginPath(); g.moveTo(6, 80); g.lineTo(58, 210); g.lineTo(58, 236); g.lineTo(6, 106); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(6, 840); g.lineTo(58, 760); g.lineTo(58, 778); g.lineTo(6, 858); g.closePath(); g.fill();
  g.globalAlpha = .55; g.fillStyle = dark ? '#5b616b' : '#7a8597';
  g.save(); g.translate(32, 600); g.rotate(-Math.PI / 2); g.font = '700 26px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('JAHORINA', 0, 0); g.restore();
  const t = tex(c); return t;
}
// mrežasti džep na vratima
function netTex() {
  const c = canvas(128, 160), g = c.getContext('2d');
  g.clearRect(0, 0, 128, 160); g.strokeStyle = '#0c0d10'; g.lineWidth = 3;
  for (let i = -160; i < 300; i += 14) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 160, 160); g.stroke(); g.beginPath(); g.moveTo(i + 160, 0); g.lineTo(i, 160); g.stroke(); }
  g.lineWidth = 10; g.strokeRect(0, 0, 128, 160);
  return tex(c);
}
// meka sjenka / svjetlo na podu
function radialTex(inner, outer) {
  const c = canvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return tex(c, false);
}

/* ---------- scena ---------- */
function create(host, opt = {}) {
  const font = opt.font || "'Barlow', Arial, sans-serif";
  const reduced = !!opt.reduced;
  // slabiji uređaji: bez zaglađivanja ivica i bez sjenki, gustina piksela 1
  const low = !!opt.low;
  const renderer = new WebGLRenderer({ antialias: !low, alpha: true, preserveDrawingBuffer: !!opt.snapshot, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), .04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = .05;
  // daleki ormarići nestaju u mraku (boja kadra)
  scene.fog = new Fog(BG, 4.4, 7.2);
  pmrem.dispose();

  const camera = new PerspectiveCamera(27, 1, .1, 30);
  const target = new Vector3(0, .98, 0);

  /* materijali */
  const M = {
    white: new MeshStandardMaterial({ color: 0xe6eaf0, roughness: .46, metalness: .12, envMapIntensity: .35 }),
    inner: new MeshStandardMaterial({ color: 0xf2f4f7, roughness: .5, metalness: .08, envMapIntensity: .6 }),
    panel: new MeshStandardMaterial({ color: 0x0d0f13, roughness: .5, metalness: .15 }),
    plinth: new MeshStandardMaterial({ color: 0x141a25, roughness: .7, metalness: .2 }),
    chrome: new MeshStandardMaterial({ color: 0xd6dde6, roughness: .16, metalness: 1 }),
    mirror: new MeshStandardMaterial({ color: 0xdfe6ef, roughness: .04, metalness: 1, envMapIntensity: 3 }),
    peg: new MeshStandardMaterial({ color: 0xf6f7f9, roughness: .34, metalness: .05 }),
    black: new MeshStandardMaterial({ color: 0x15171b, roughness: .55, metalness: .1 }),
    floor: new MeshStandardMaterial({ color: 0x0b111c, roughness: .82, metalness: .1 }),
    wall: new MeshStandardMaterial({ color: 0x0c1220, roughness: .95, metalness: 0 })
  };
  const ros = rosette();
  const glowMats = [];   // rozete koje tiho zažare (grijanje/sušenje), po nosaču

  /* pod i zid iza reda */
  const floor = mesh(new PlaneGeometry(14, 8), M.floor, false); floor.rotation.x = -Math.PI / 2; floor.position.z = 2; scene.add(floor);
  const wall = mesh(new PlaneGeometry(14, 5), M.wall, false); wall.position.set(0, 2.5, -D / 2 - .02); scene.add(wall);
  const shadowTex = radialTex('rgba(0,0,0,.75)', 'rgba(0,0,0,0)');
  const contact = new Mesh(new PlaneGeometry(6.2, .9), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .9 }));
  contact.rotation.x = -Math.PI / 2; contact.position.set(0, .002, .2); scene.add(contact);
  // svjetlo iz otvorenog ormarića na podu (meko, hladno bijelo)
  const poolTex = radialTex('rgba(210,226,255,.55)', 'rgba(210,226,255,0)');
  const pool = new Mesh(new PlaneGeometry(1.5, 1.2), new MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, .003, .62); scene.add(pool);

  /* red ormarića */
  const row = new Group(); scene.add(row);
  const plinth = mesh(new BoxGeometry((LAST - FIRST + 1) * W, PL, D - .06), M.plinth, false);
  plinth.position.set(((FIRST + LAST) / 2 - NUM) * W, PL / 2, -.03); row.add(plinth);
  const numTex = {};
  function door(n) {
    const g = new Group();
    const leaf = mesh(rbox(W - .006, H - .008, .018, .006), M.white); leaf.position.set(W / 2, H / 2, .009); g.add(leaf);
    const pan = mesh(rbox(.255, 1.1, .004, .022, 2), M.panel, false); pan.position.set(W / 2, .66, .0185); g.add(pan);
    const nt = numTex[n] || (numTex[n] = numberTex(n, font));
    const lab = new Mesh(new PlaneGeometry(.13, .081), new MeshStandardMaterial({ map: nt, transparent: true, roughness: .5, metalness: 0 }));
    lab.position.set(W / 2, 1.43, .0186); g.add(lab);
    return g;
  }
  for (let n = FIRST; n <= LAST; n++) {
    if (n === NUM) continue;
    const x = (n - NUM) * W;
    const body = mesh(new BoxGeometry(W - .002, H, D - .02), M.white, false); body.position.set(x, PL + H / 2, -.01); row.add(body);
    const dg = door(n); dg.position.set(x - W / 2 + .003, PL + .004, ZF); row.add(dg);
  }

  /* ormarić 61: zidovi, plafon sa ventilacijom, nosači */
  const box = new Group(); row.add(box);
  const side = rbox(T, H, D, .004, 2);
  const L = mesh(side, M.white); L.position.set(-W / 2 + T / 2, PL + H / 2, 0); box.add(L);
  const R = mesh(side, M.white); R.position.set(W / 2 - T / 2, PL + H / 2, 0); box.add(R);
  const back = mesh(new BoxGeometry(W, H, T), M.inner); back.position.set(0, PL + H / 2, -D / 2 + T / 2); box.add(back);
  const bot = mesh(new BoxGeometry(W - 2 * T, T, D), M.inner); bot.position.set(0, PL + T / 2, 0); box.add(bot);
  const topM = new MeshStandardMaterial({ color: 0xffffff, map: ventTex(false), emissiveMap: ventTex(true), emissive: new Color(0xe9f1ff), emissiveIntensity: 0, roughness: .5 });
  const top = mesh(new BoxGeometry(W - 2 * T, T, D), [M.white, M.white, M.white, topM, M.white, M.white]); top.position.set(0, PL + H - T / 2, 0); box.add(top);
  // unutrašnje stranice u svjetlijoj nijansi (svjetlo iz ormarića)
  const inL = mesh(new PlaneGeometry(D - T, H - 2 * T), M.inner, false); inL.rotation.y = Math.PI / 2; inL.position.set(-IX + .0005, PL + H / 2, .006); box.add(inL);
  const inR = mesh(new PlaneGeometry(D - T, H - 2 * T), M.inner, false); inR.rotation.y = -Math.PI / 2; inR.position.set(IX - .0005, PL + H / 2, .006); box.add(inR);

  // nosač: rozeta na zidu + bijela cijev; vraća tačku na vrhu
  function rosetteAt(x, y) {
    const gm = new MeshStandardMaterial({ map: ros.map, emissiveMap: ros.glow, emissive: new Color(0xff8a3d), emissiveIntensity: 0, roughness: .4, transparent: true });
    const c = new Mesh(new CircleGeometry(.033, 40), gm); c.position.set(x, y, ZB + .0012); c.receiveShadow = true; box.add(c);
    glowMats.push({ m: gm, x, y, v: 0, to: 0 });
    return gm;
  }
  function tube(pts, r = .0105) {
    const curve = new QuadraticBezierCurve3(...pts.map((p) => new Vector3(...p)));
    const m = mesh(new TubeGeometry(curve, 16, r, 12, false), M.peg); box.add(m);
    const cap = mesh(new SphereGeometry(r, 12, 8), M.peg); cap.position.copy(curve.getPoint(1)); box.add(cap);
    return curve.getPoint(1);
  }
  const PX = -.058, GX = [-.112, -.004];
  const SLOT = {};
  // kacige: dvije "lopatice" sa prorezima (gore)
  [1.65, 1.4].forEach((y, k) => {
    rosetteAt(PX, y - .01);
    tube([[PX, y - .01, ZB], [PX, y - .005, ZB + .06], [PX, y + .015, ZB + .085]], .011);
    const pad = mesh(rbox(.1, .024, .08, .011), M.peg); pad.position.set(PX, y + .028, ZB + .11); box.add(pad);
    for (let i = 0; i < 3; i++) { const s = mesh(new BoxGeometry(.07, .004, .008), M.black, false); s.position.set(PX, y + .041, ZB + .084 + i * .02); box.add(s); }
    SLOT['helmet' + k] = new Vector3(PX, y + .04, ZB + .118);
  });
  // rukavice: parovi kratkih nosača
  [1.328, 1.088].forEach((y, k) => {
    const g = rosetteAt((GX[0] + GX[1]) / 2, y - .015);
    GX.forEach((x) => { const tip = tube([[x * .45 + PX * .55, y - .015, ZB], [x, y - .012, ZB + .045], [x, y + .012, ZB + .07]]); });
    SLOT['glove' + k] = new Vector3(PX, y + .012, ZB + .07);
    glowMats[glowMats.length - 1].kind = 'glove' + k;
  });
  // pancerice: dugi zakrivljeni nosači (čizma visi naopako, sara preko nosača)
  [[.47, .55], [.15, .19]].forEach(([y, yt], k) => {
    rosetteAt((GX[0] + GX[1]) / 2, y);
    GX.forEach((x) => tube([[x * .45 + PX * .55, y, ZB], [x, y, ZB + .1], [x, yt, ZB + .12]], .012));
    SLOT['boot' + k] = new Vector3(PX, yt, ZB + .12);
    glowMats[glowMats.length - 1].kind = 'boot' + k;
  });
  // piktogrami pored nosača
  [['helmet', 1.56], ['glove', 1.2], ['boot', .36]].forEach(([k, y]) => {
    const p = new Mesh(new PlaneGeometry(.075, .0375), new MeshStandardMaterial({ map: pictoTex(k), transparent: true, roughness: .6 }));
    p.position.set(PX + .002, y, ZB + .0014); box.add(p);
  });
  // kuke na lijevom zidu za štapove/kacigu
  function hook(parent, x, y, z, ry) {
    const h = new Group();
    const b = mesh(new BoxGeometry(.014, .03, .004), M.chrome); h.add(b);
    const t = mesh(new TorusGeometry(.012, .0025, 8, 16, Math.PI * 1.2), M.chrome); t.rotation.set(0, Math.PI / 2, Math.PI * .9); t.position.set(0, -.006, .013); h.add(t);
    h.position.set(x, y, z); h.rotation.y = ry; parent.add(h); return h;
  }

  /* vrata 61 (šarke lijevo), sa unutrašnje strane ogledalo, kuke, mrežasti džep i reza */
  const d61 = new Group(); d61.position.set(-W / 2 + .003, PL + .004, ZF); row.add(d61);
  const dl = door(NUM); d61.add(dl);
  const mir = mesh(new PlaneGeometry(.075, .23), M.mirror, false); mir.rotation.y = Math.PI; mir.position.set(.215, 1.08, -.0012); d61.add(mir);
  const mirFrame = mesh(rbox(.083, .238, .003, .004, 2), M.chrome, false); mirFrame.position.set(.215, 1.08, -.0002); d61.add(mirFrame);
  const net = new Mesh(new PlaneGeometry(.13, .16), new MeshStandardMaterial({ map: netTex(), transparent: true, roughness: .8, side: DoubleSide }));
  net.rotation.y = Math.PI; net.position.set(.2, .4, -.004); d61.add(net);
  hook(d61, .22, 1.46, -.004, Math.PI); hook(d61, .22, .82, -.004, Math.PI);
  const latch = mesh(rbox(.024, .05, .01, .003), M.chrome); latch.position.set(.36, .7, -.006); d61.add(latch);

  /* svjetla: tiha noć (mjesečina, hladno), u ormariću LED na plafonu (sjenke), grijanje toplo */
  scene.add(new HemisphereLight(0x3a4d75, 0x05080f, .07));
  const moon = new DirectionalLight(0x9db4dc, .1); moon.position.set(2.4, 4, 3.2); scene.add(moon);
  const led = new SpotLight(0xf3f6ff, 0, 2.4, 1.15, .95, 1.6);
  // LED uz gornju ivicu otvora: sjenke opreme padaju nadolje na zadnji zid (ne kao srp iza kacige)
  led.position.set(0, PL + H - .03, .2); led.target.position.set(0, .3, -.2);
  led.castShadow = true; led.shadow.mapSize.set(1024, 1024); led.shadow.bias = -.0006; led.shadow.normalBias = .01; led.shadow.radius = 3;
  led.shadow.camera.near = .05; led.shadow.camera.far = 2.4;
  scene.add(led); scene.add(led.target);
  const fill = new PointLight(0xe6eeff, 0, 1.6, 1.8); fill.position.set(0, .95, .22); scene.add(fill);
  // meko svjetlo spreda u visini pancerica (odsjaj unutrašnjosti), da se vide oblici opreme u sjeni
  const front = new PointLight(0xdfe8ff, 0, 1.3, 1.6); front.position.set(-.05, .55, .55); scene.add(front);
  const spill = new SpotLight(0xdfe8ff, 0, 3.2, .7, .9, 1.5); spill.position.set(0, 1.2, .1); spill.target.position.set(0, 0, 1.2); scene.add(spill); scene.add(spill.target);
  const heat = [new PointLight(0xff8a3d, 0, .5, 2), new PointLight(0xff8a3d, 0, .5, 2)];
  heat[0].position.set(PX, .62, ZB + .08); heat[1].position.set(PX, .24, ZB + .08); heat.forEach((h) => scene.add(h));

  /* ---------- oprema ---------- */
  const SETS = [
    { shell: 0x3a4048, acc: 0xb9e12d, helm: 0x17191d, glove: 0x141518, ski: true, pole: 0x2a2e35 },
    { shell: 0xe3e7ec, acc: 0x1d2a44, helm: 0x1d2a44, glove: 0x3b4350, ski: false, pole: 0xb9c1cc }
  ];
  function plastic(c, r = .32) { return new MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: .6, clearcoatRoughness: .3 }); }
  function fabric(c) { return new MeshStandardMaterial({ color: c, roughness: .9, metalness: 0 }); }

  // skija: obris odozgo (struk), debljina, prednji vrh se podiže; dužina po y, širina po x, debljina po z (gornja ploha +z)
  function skiGeo(len) {
    const wt = .112, ww = .074, wl = .102, s = new Shape();
    const prof = (v) => { const u = v / len; return u < .5 ? MathUtils.lerp(wl, ww, Math.sin(u / .5 * Math.PI / 2)) : MathUtils.lerp(ww, wt, Math.pow((u - .5) / .42, 1.6)); };
    const N = 24, pts = [];
    for (let i = 0; i <= N; i++) { const v = i / N * len * .93; pts.push([prof(v) / 2, v]); }
    s.moveTo(-pts[0][0] + .01, 0); s.quadraticCurveTo(-pts[0][0], 0, -pts[0][0], .02);
    pts.forEach((p) => s.lineTo(-p[0], p[1]));
    s.quadraticCurveTo(-wt / 2, len, 0, len); s.quadraticCurveTo(wt / 2, len, pts[N][0], pts[N][1]);
    for (let i = N; i >= 0; i--) s.lineTo(pts[i][0], pts[i][1]);
    s.quadraticCurveTo(pts[0][0], 0, pts[0][0] - .01, 0); s.closePath();
    const g = new ExtrudeGeometry(s, { depth: .013, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 1, curveSegments: 10, steps: 1 });
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), u = y / len;
      let z = p.getZ(i);
      if (u > .86) z += .055 * Math.pow((u - .86) / .14, 2);
      if (u < .06) z += .016 * Math.pow((.06 - u) / .06, 2);
      p.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }
  function skiPair(set) {
    const S = SETS[set], len = 1.6, g = new Group();
    const top = new MeshPhysicalMaterial({ map: skiTex(S.ski), roughness: .3, clearcoat: .8, clearcoatRoughness: .2 });
    top.map.repeat.set(1 / .12, 1 / len); top.map.offset.set(.5, 0);
    const sideM = new MeshStandardMaterial({ color: S.ski ? 0x0e1012 : 0xd5dae1, roughness: .5 });
    const geo = skiGeo(len);
    const binder = plastic(S.ski ? 0x111316 : 0x2a3140, .4), accent = plastic(S.acc, .35);
    for (const s of [1, -1]) {
      const ski = new Group();
      const m = mesh(geo, [top, sideM]); ski.add(m);
      // vezovi: ploča, prednji i zadnji dio
      const plate = mesh(rbox(.056, .34, .012, .004), binder); plate.position.set(0, len * .45, .021); ski.add(plate);
      const toe = mesh(rbox(.066, .085, .046, .016), binder); toe.position.set(0, len * .55, .045); ski.add(toe);
      const toeA = mesh(rbox(.05, .03, .012, .005), accent); toeA.position.set(0, len * .565, .07); ski.add(toeA);
      const heel = mesh(rbox(.07, .115, .062, .02), binder); heel.position.set(0, len * .335, .05); ski.add(heel);
      const heelA = mesh(rbox(.04, .07, .012, .005), accent); heelA.position.set(0, len * .325, .083); ski.add(heelA);
      // par stoji đon uz đon: prednja skija gornjom plohom prema vratima, zadnja prema zidu
      ski.rotation.y = s > 0 ? 0 : Math.PI;
      ski.position.z = s * .0015;
      g.add(ski);
    }
    // trake koje drže par
    [.2, 1.25].forEach((y) => { const b = mesh(rbox(.118, .03, .034, .006), new MeshStandardMaterial({ color: 0x0f1013, roughness: .8 })); b.position.set(0, y, 0); g.add(b); });
    // štapovi lijevo od skija (set 1 iza, set 2 ispred)
    const poleM = new MeshStandardMaterial({ color: S.pole, roughness: .3, metalness: .85 }), rub = fabric(0x0f1013);
    for (const k of [0, 1]) {
      const p = new Group();
      const sh = mesh(new CylinderGeometry(.0085, .006, 1.17, 10), poleM); sh.position.y = .6; p.add(sh);
      const gr = mesh(new CylinderGeometry(.0165, .0145, .16, 14), rub); gr.position.y = 1.15; p.add(gr);
      const cap = mesh(new SphereGeometry(.0175, 12, 8), rub); cap.position.y = 1.23; cap.scale.y = .6; p.add(cap);
      const strap = mesh(new TorusGeometry(.04, .004, 6, 20), rub); strap.position.set(.03, 1.19, 0); strap.scale.y = 1.6; p.add(strap);
      const bas = mesh(new CylinderGeometry(.032, .032, .006, 18), rub); bas.position.y = .09; p.add(bas);
      const tip = mesh(new CylinderGeometry(.006, .001, .05, 8), M.chrome); tip.position.y = .025; p.add(tip);
      p.position.set(-.07 + k * .006, 0, (set ? .09 : -.07) + (k ? 1 : -1) * .02);
      p.rotation.z = .02 + k * .012; p.rotation.x = (set ? 1 : -1) * .02;
      g.add(p);
    }
    return g;
  }
  // pancerica: bočni profil (prepoznatljiv obris: kapica prstiju, nagnuta sara, peta), izvučen u širinu sa zaobljenim ivicama;
  // uspravna: đon na y=0, prsti prema +z; pa se okrene naopako na nosač
  function profile(pts, depth, bev) {
    const sh = new Shape(); sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (p.length === 4) sh.quadraticCurveTo(p[0], p[1], p[2], p[3]); else sh.lineTo(p[0], p[1]);
    }
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10, steps: 1 });
    g.rotateY(-Math.PI / 2); g.translate(depth / 2, 0, 0);
    return g;
  }
  const BOOT = {
    sole: [[-.158, 0], [.152, 0], [.162, .006, .162, .02], [.162, .032], [-.164, .032], [-.166, .008, -.158, 0]],
    shell: [[-.15, .04], [.146, .04], [.16, .05, .156, .07], [.142, .092, .1, .102], [.05, .112, .015, .15], [-.025, .2], [-.09, .2], [-.152, .175, -.162, .11], [-.164, .06, -.15, .04]],
    cuff: [[-.045, .15], [.004, .205], [.014, .35], [-.06, .358, -.138, .372], [-.17, .3, -.168, .23], [-.168, .16, -.13, .135], [-.085, .128]]
  };
  // školjka pancerice: horizontalni presjeci (zaobljeni pravougaonici) duž bočnog profila → oblo, kao livena plastika;
  // prsti uži od stopala, sara šira; donji dio (stopalo) i gornji (sara) su posebni, sara malo preklapa stopalo
  const BZF = [[.03, .15], [.05, .157], [.07, .15], [.085, .124], [.097, .09], [.108, .058], [.125, .036], [.15, .014], [.2, -.002], [.26, .006], [.32, .012], [.36, .012], [.375, 0]];
  const BZB = [[.03, -.152], [.06, -.162], [.1, -.166], [.15, -.158], [.2, -.16], [.25, -.168], [.3, -.166], [.34, -.155], [.375, -.135]];
  const BHW = [[.03, .046], [.08, .05], [.15, .05], [.22, .054], [.3, .056], [.375, .054]];
  function tab(t, y) {
    if (y <= t[0][0]) return t[0][1];
    for (let i = 1; i < t.length; i++) if (y <= t[i][0]) return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * (y - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
    return t[t.length - 1][1];
  }
  function smooth(e0, e1, x) { const t = MathUtils.clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  const SE = 2.6;   // eksponent presjeka (2 = elipsa, više = četvrtastije)
  function bootX(y, z, grow) {   // poluširina školjke na visini y i dubini z
    const zf = tab(BZF, y) + grow, zb = tab(BZB, y) - grow, c = (zf + zb) / 2, a = (zf - zb) / 2, u = MathUtils.clamp(Math.abs(z - c) / a, 0, 1);
    return (tab(BHW, y) + grow) * (1 - .28 * smooth(.04, .16, z) - .1 * smooth(-.12, -.17, z)) * Math.pow(1 - Math.pow(u, SE), 1 / SE);
  }
  function bootLoft(y0, y1, grow) {
    const NY = 28, NT = 40, pos = [], idx = [];
    for (let i = 0; i <= NY; i++) {
      const y = y0 + (y1 - y0) * i / NY, zf = tab(BZF, y) + grow, zb = tab(BZB, y) - grow, c = (zf + zb) / 2, a = (zf - zb) / 2, b0 = tab(BHW, y) + grow;
      for (let j = 0; j < NT; j++) {
        const t = j / NT * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
        const z = c + a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / SE);
        const x = b0 * (1 - .28 * smooth(.04, .16, z) - .1 * smooth(-.12, -.17, z)) * Math.sign(st) * Math.pow(Math.abs(st), 2 / SE);
        pos.push(x, y, z);
      }
    }
    for (let i = 0; i < NY; i++) for (let j = 0; j < NT; j++) {
      const p0 = i * NT + j, p1 = i * NT + (j + 1) % NT;
      idx.push(p0, p1, p1 + NT, p0, p1 + NT, p0 + NT);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const GEO = {};
  function bootGeo() {
    return GEO.boot || (GEO.boot = { sole: profile(BOOT.sole, .074, .012), shell: bootLoft(.03, .215, 0), cuff: bootLoft(.15, .375, .006) });
  }
  function boot(set, mirror) {
    const S = SETS[set], g = new Group(), G = bootGeo();
    const shellM = plastic(S.shell, .26), cuffM = plastic(set ? 0x1d2a44 : 0x24282e, .26), soleM = fabric(0x4a4f57), acc = plastic(S.acc, .3);
    const metal = new MeshStandardMaterial({ color: 0xc9d0d8, roughness: .22, metalness: .95 });
    g.add(mesh(G.sole, soleM)); g.add(mesh(G.shell, shellM)); g.add(mesh(G.cuff, cuffM));
    // postava na otvoru i pojas na vrhu sare sa oznakom
    const ln = mesh(new CylinderGeometry(.056, .056, .012, 24), fabric(0x0e0f12)); ln.scale.z = 1.32; ln.position.set(0, .372, -.068); g.add(ln);
    const st = mesh(rbox(.134, .032, .196, .014), fabric(0x0f1013)); st.position.set(0, .33, -.076); g.add(st);
    const sx = mirror ? -1 : 1;
    const sa = mesh(rbox(.004, .012, .05, .002), acc); sa.position.set(sx * .068, .332, -.04); g.add(sa);
    // kopče na vanjskoj strani: dvije na stopalu, dvije na sari (prate obris školjke)
    [[.118, 0], [.165, 0], [.235, .006], [.29, .006]].forEach(([y, gr]) => {
      const zf = tab(BZF, y) + gr, zb = tab(BZB, y) - gr, z = (zf + zb) / 2 + (zf - zb) / 2 * .45, x = bootX(y, z, gr) + .003;
      const bk = mesh(rbox(.008, .015, .046, .004), metal); bk.position.set(sx * x, y, z - .012); g.add(bk);
      const l = mesh(rbox(.006, .01, .026, .003), acc); l.position.set(sx * (x + .004), y, z - .006); g.add(l);
    });
    const rv = mesh(new CylinderGeometry(.012, .012, .006, 16), metal); rv.rotation.z = Math.PI / 2; rv.position.set(sx * (bootX(.19, -.1, .006) + .002), .19, -.1); g.add(rv);
    // naopako (đon gore, prsti prema vratima): otvor sare na vrh nosača, nosač ulazi 4 cm u saru
    const h = new Group(); g.rotation.z = Math.PI; g.position.set(0, .372 - .045, .068); h.add(g);
    return h;
  }
  function bootPair(set) {
    const g = new Group();
    // prsti malo prema bočnim zidovima, da se sa prednje strane vidi obris pancerice
    [-.06, .06].forEach((x, k) => { const b = boot(set, k === 0); b.position.x = x; b.rotation.y = (k ? 1 : -1) * .22; b.scale.setScalar(.95); g.add(b); });
    return g;
  }
  function helmet(set) {
    const S = SETS[set], g = new Group(), sh = plastic(S.helm, set ? .5 : .22);
    const dome = mesh(new SphereGeometry(.1, 40, 24, 0, Math.PI * 2, 0, Math.PI * .56), sh); dome.scale.set(1, .92, 1.2); g.add(dome);
    const rim = mesh(new TorusGeometry(.1, .008, 8, 48), fabric(0x0f1013)); rim.rotation.x = Math.PI / 2; rim.scale.set(.985, 1.19, 1); rim.position.y = -.017; g.add(rim);
    for (let i = -1; i <= 1; i++) { const v = mesh(new CapsuleGeometry(.008, .06, 4, 8), fabric(0x0b0c0e)); v.rotation.x = Math.PI / 2; v.position.set(i * .03, .09, .0); v.scale.z = .8; g.add(v); }
    const vb = mesh(new CapsuleGeometry(.007, .05, 4, 8), fabric(0x0b0c0e)); vb.rotation.x = Math.PI / 2 - .5; vb.position.set(0, .07, -.075); g.add(vb);
    for (const s of [-1, 1]) { const e = mesh(new SphereGeometry(.035, 16, 12), fabric(0x111214)); e.scale.set(.35, 1, 1.1); e.position.set(s * .093, -.02, -.01); g.add(e); }
    const clip = mesh(rbox(.05, .02, .012, .004), plastic(S.acc, .35)); clip.position.set(0, .015, -.118); clip.rotation.x = .3; g.add(clip);
    g.rotation.y = -.35;
    return g;
  }
  function glove(set, sgn) {
    const S = SETS[set], m = fabric(S.glove), g = new Group(), cuffM = fabric(set ? 0x2f3642 : 0x0f1013);
    const cuff = mesh(new CylinderGeometry(.05, .046, .085, 18, 1, true), cuffM); cuff.material = cuffM.clone(); cuff.material.side = DoubleSide; cuff.scale.z = .45; cuff.position.y = -.035; g.add(cuff);
    const band = mesh(rbox(.104, .022, .05, .01), fabric(0x0b0c0e)); band.position.y = -.075; g.add(band);
    const logo = mesh(rbox(.03, .012, .004, .002), plastic(S.acc, .4)); logo.position.set(0, -.075, .026); g.add(logo);
    const palm = mesh(rbox(.092, .105, .036, .016), m); palm.position.y = -.135; g.add(palm);
    [-.033, -.011, .011, .033].forEach((x, i) => {
      const f = mesh(new CapsuleGeometry(.0108, [.05, .062, .058, .045][i], 4, 10), m);
      f.position.set(x, -.215 - [0, .006, .003, -.006][i], 0); f.rotation.z = x * -.6; f.rotation.x = .08; g.add(f);
    });
    const th = mesh(new CapsuleGeometry(.012, .045, 4, 10), m); th.position.set(sgn * .055, -.135, .006); th.rotation.z = sgn * .62; g.add(th);
    g.rotation.z = sgn * .05;
    return g;
  }
  function glovePair(set) { const g = new Group(); GX.forEach((x, k) => { const gl = glove(set, k ? 1 : -1); gl.position.x = x - PX; g.add(gl); }); return g; }

  // mjesta opreme u ormariću (set 0 = prvi, set 1 = drugi)
  const ITEMS = {};
  function place(kind, set) {
    let o, p;
    if (kind === 'ski') { o = skiPair(set); p = new Vector3(.13, IY0, set ? .11 : -.13); o.rotation.z = -.012; }
    else if (kind === 'boot') { o = bootPair(set); p = SLOT['boot' + set].clone(); }
    else if (kind === 'helmet') { o = helmet(set); p = SLOT['helmet' + set].clone().add(new Vector3(0, .055, .0)); }
    else { o = glovePair(set); p = SLOT['glove' + set].clone(); }
    o.position.copy(p); o.visible = false; box.add(o);
    const mats = [];
    o.traverse((c) => { if (c.isMesh) { c.material = Array.isArray(c.material) ? c.material.map((x) => x.clone()) : c.material.clone(); [].concat(c.material).forEach((x) => mats.push(x)); } });
    ITEMS[kind + set] = { o, p, mats, on: false, k: 0, rot: o.rotation.clone() };
  }
  ['ski', 'boot', 'helmet', 'glove'].forEach((k) => [0, 1].forEach((s) => place(k, s)));

  /* ---------- animacija ---------- */
  const tweens = [];
  let need = true, raf = 0, paused = false;
  function tween(dur, fn, ez = ease.out, delay = 0) {
    return new Promise((res) => { tweens.push({ t0: performance.now() + delay, dur: reduced ? 1 : dur, fn, ez, res }); kick(); });
  }
  function kick() { need = true; if (!raf && !paused) raf = requestAnimationFrame(frame); }

  function fade(it, v) {
    it.mats.forEach((m) => { m.transparent = v < .999; m.opacity = v; });
  }
  // dodaj/ukloni: oprema doleti spreda i sjedne na svoje mjesto (pancerice se spuste na nosač)
  function set(kind, s, on, anim = true) {
    const it = ITEMS[kind + s];
    if (!it || it.on === on) return Promise.resolve();
    it.on = on;
    const off = kind === 'boot' ? new Vector3(0, .12, .5) : kind === 'ski' ? new Vector3(-.02, .06, .55) : new Vector3(0, .05, .45);
    const tok = ++it.k;
    heatTarget();
    if (!anim || reduced) {
      it.o.visible = on; it.o.position.copy(it.p); fade(it, 1); kick(); return Promise.resolve();
    }
    it.o.visible = true;
    return tween(on ? 720 : 480, (t) => {
      if (tok !== it.k) return;
      const k = on ? t : 1 - t;
      it.o.position.copy(it.p).addScaledVector(off, 1 - k);
      it.o.rotation.set(it.rot.x, it.rot.y + (1 - k) * (kind === 'helmet' ? .5 : .12), it.rot.z);
      fade(it, Math.min(1, k * 1.6));
      if (!on && t >= 1) it.o.visible = false;
    }, on ? ease.out : ease.inOut);
  }
  function has(kind, s) { return !!(ITEMS[kind + s] && ITEMS[kind + s].on); }
  // grijanje/sušenje: rupice rozeta i tople tačke svjetla prate opremu na nosačima
  function heatTarget() {
    glowMats.forEach((g) => { g.to = g.kind && ITEMS[g.kind] && ITEMS[g.kind].on ? 1 : 0; });
    tween(1400, () => {}, ease.out);
  }
  let doorA = 0, lightA = 0;
  function applyDoor() {
    d61.rotation.y = -doorA * 1.78;
    led.intensity = lightA * 3.4; fill.intensity = lightA * .45; spill.intensity = lightA * 2.2; front.intensity = lightA * .5;
    topM.emissiveIntensity = lightA * .95; pool.material.opacity = lightA * .75;
  }
  function open() {
    return tween(1300, (t) => { doorA = t; lightA = Math.min(1, t * 1.6); applyDoor(); }, ease.inOut);
  }
  function setOpen(v) { doorA = v; lightA = v; applyDoor(); kick(); }

  /* ---------- kamera: okretanje prevlačenjem, sa inercijom ---------- */
  let yaw = -.1, pitch = .05, vy = 0, vp = 0, dist = 4.25, fx = .5, layoutY = 0;
  const Y0 = -.1, P0 = .05;
  function placeCam() {
    yaw = MathUtils.clamp(yaw, Y0 - .62, Y0 + .62); pitch = MathUtils.clamp(pitch, -.04, .2);
    camera.position.set(target.x + Math.sin(yaw) * Math.cos(pitch) * dist, target.y + Math.sin(pitch) * dist, target.z + Math.cos(yaw) * Math.cos(pitch) * dist);
    camera.lookAt(target);
  }
  let drag = null;
  function onDown(e) {
    if (opt.canDrag && !opt.canDrag(e)) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, t: performance.now() };
    vy = vp = 0;
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // okomito = skrol stranice
      drag.moved = true; try { host.setPointerCapture(e.pointerId); } catch (x) {}
      if (opt.onDrag) opt.onDrag();
    }
    const k = 2.2 / Math.max(320, host.clientWidth);
    vy = -dx * k; vp = dy * k * .5;
    yaw += vy; pitch += vp; drag.x = e.clientX; drag.y = e.clientY;
    placeCam(); kick();
  }
  function onUp(e) { if (!drag || e.pointerId !== drag.id) return; drag = null; kick(); }
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);

  /* ---------- tačke za infografiku (ventilacija, sušenje, grijanje) → koordinate na ekranu ---------- */
  // tag = privjesak sa cijenom, na slobodnoj ivici otvorenih vrata; box = obris ormarića (za raspored natpisa)
  const ANCH = {
    vent: [box, new Vector3(0, IY1 - .002, -.02)],
    dry: [box, new Vector3((GX[0] + GX[1]) / 2, 1.315, ZB + .002)],
    heat: [box, new Vector3((GX[0] + GX[1]) / 2, .47, ZB + .002)],
    tag: [d61, new Vector3(W - .03, 1.02, .02)],
    r: [box, new Vector3(W / 2, PL + H, ZF)],
    l: [box, new Vector3(-W / 2, PL + H, ZF)],
    b: [box, new Vector3(0, PL, ZF)]
  };
  const tmp = new Vector3();
  function anchors() {
    const w = host.clientWidth, h = host.clientHeight, out = {};
    scene.updateMatrixWorld();
    for (const k in ANCH) {
      tmp.copy(ANCH[k][1]); ANCH[k][0].localToWorld(tmp); tmp.project(camera);
      out[k] = { x: (tmp.x + 1) / 2 * w, y: (1 - tmp.y) / 2 * h, z: tmp.z };
    }
    out.door = doorA;
    return out;
  }

  /* ---------- veličina i raspored ---------- */
  let cw = 0, ch = 0;
  function resize() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    if (w === cw && h === ch) return;
    cw = w; ch = h;
    // gustina piksela do 2, ali najviše ~3,2 miliona piksela (velik kadar na retina ekranu)
    renderer.setPixelRatio(low ? 1 : Math.max(1, Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3.2e6 / (w * h)))));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // ormarić 61 stoji na udjelu fx širine; visina kadra određuje udaljenost kamere (ormarić uvijek stane po visini)
    if (fx !== .5) camera.setViewOffset(w * 2, h, w * (1 - fx), layoutY * h, w, h); else camera.clearViewOffset();
    const fitH = 2.32 / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    const fitW = (opt.minWidth || 1.2) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * (w / h) * Math.min(fx, 1 - fx) * 2);
    dist = Math.max(fitH, fitW);
    placeCam(); kick();
  }
  function setLayout(o) { if (o.fx != null) fx = o.fx; if (o.minWidth != null) opt.minWidth = o.minWidth; if (o.y != null) layoutY = o.y; cw = 0; resize(); }

  /* ---------- crtanje (samo kad se nešto mijenja) ---------- */
  function frame() {
    raf = 0;
    if (paused) return;
    const now = performance.now();
    let busy = false;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      if (now < tw.t0) { busy = true; continue; }
      const t = Math.min(1, (now - tw.t0) / tw.dur);
      tw.fn(tw.ez(t));
      if (t >= 1) { tweens.splice(i, 1); tw.res(); } else busy = true;
    }
    // inercija poslije prevlačenja
    if (!drag && (Math.abs(vy) > 1e-4 || Math.abs(vp) > 1e-4)) { yaw += vy; pitch += vp; vy *= .9; vp *= .9; placeCam(); busy = true; }
    // rozete i toplo svjetlo prate opremu (meko)
    let hot = [0, 0];
    glowMats.forEach((g) => {
      if (Math.abs(g.v - g.to) > .002) { g.v += (g.to - g.v) * .06; busy = true; } else g.v = g.to;
      g.m.emissiveIntensity = g.v * 1.15 * (.55 + .45 * lightA);
      if (g.kind && g.kind.indexOf('boot') === 0) hot[+g.kind.slice(-1)] = g.v;
    });
    heat[0].intensity = hot[0] * .06 * lightA; heat[1].intensity = hot[1] * .06 * lightA;
    renderer.render(scene, camera);
    if (opt.onFrame) opt.onFrame(anchors());
    need = false;
    if (busy || drag) raf = requestAnimationFrame(frame);
  }

  function pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function resume() { paused = false; kick(); }
  function snapshot(type = 'image/webp', q = .9) { renderer.render(scene, camera); return cv.toDataURL(type, q); }
  function dispose() {
    pause();
    host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onUp);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach((m) => { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); }); });
    envRT.dispose(); renderer.dispose(); if (cv.parentNode) cv.parentNode.removeChild(cv);
  }

  applyDoor(); resize(); placeCam();
  // fontovi za brojeve na vratima: kad stignu, brojevi se nacrtaju ponovo
  if (document.fonts && document.fonts.load) document.fonts.load('400 92px ' + font).then(() => {
    for (const n in numTex) { const fresh = numberTex(n, font); numTex[n].image = fresh.image; numTex[n].needsUpdate = true; }
    kick();
  }, () => {});
  function view(o) { if (o.yaw != null) yaw = Y0 + o.yaw; if (o.pitch != null) pitch = o.pitch; if (o.dist) dist = o.dist; if (o.ty != null) target.y = o.ty; if (o.tx != null) target.x = o.tx; placeCam(); kick(); }
  return { view, set, has, open, setOpen, setLayout, resize, pause, resume, anchors, snapshot, dispose, canvas: cv, get yaw() { return yaw - Y0; } };
}

window.JSD3D = { create, v: 1 };
