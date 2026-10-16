#!/usr/bin/env python3
"""PSD mape skijališta → slike (dan/noć) + vektorski podaci za interaktivnu mapu.

    python3 napravi-podatke.py <mapa.psd>

PSD je na GitHub Release-u `mapa-psd` (prevelik za repo):
https://github.com/NjegosAnalyst/Webpage/releases/download/mapa-psd/mapa.Jahorina.pejzaz.psd
Potrebno: pip install psd-tools scikit-image scipy pillow

Izlaz: ../slike/mapa-{dan,noc}-{3543,2000}.webp, ../podaci/mapa.json
Slojevi PSD-a: vidljivi slojevi = naslikana podloga; „Layer 30“ = staze, žičare, ikonice (raster);
„osvetljena staza“ (skriven) = osvijetljene staze za noćno skijanje.
"""
import sys, json, pathlib, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from psd_tools import PSDImage
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
from skimage.graph import route_through_array
from skimage.morphology import dilation, opening, disk, skeletonize

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from ulaz import STAZE, OZNAKE, NEIMENOVANE, VEZE_RUCNO, ROMBOIDI, ZICARE, USLUGE, FIS, VRHOVI

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 3543, 1996
psd = PSDImage.open(sys.argv[1])
assert (psd.width, psd.height) == (W, H), 'očekivana veličina PSD-a 3543 x 1996'
sloj = {l.name: l for l in psd}

def puni(l):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(l.topil().convert('RGBA'), (l.bbox[0], l.bbox[1])); return c

# ---------- slike ----------
SUNCE = {'Layer 13', 'Layer 14'}
dan = psd.composite().convert('RGB')
bez_sunca = psd.composite(layer_filter=lambda l: l.is_visible() and l.name not in SUNCE).convert('RGB')

def nocna(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    lum = a @ np.array([.299, .587, .114], np.float32)
    g = lum[..., None]
    a = a * .45 + g * .55                                   # manje zasićeno
    a = np.clip(a, 0, 1) ** 1.35 * .62                       # tamnije, kontrast u svijetlim (snijeg)
    tint = np.array([.20, .38, .72], np.float32)             # plavi mjesečev ton
    a = a * (.62 + .38 * tint * 1.6)
    return a

ys = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
nebo = (np.array([5, 10, 24], np.float32) * (1 - ys) + np.array([22, 38, 72], np.float32) * ys) / 255  # tamnoplavi prelaz
nebo = np.broadcast_to(nebo, (H, W, 3)).copy()
rng = np.random.default_rng(7)                               # rijetke, tihe zvijezde (kao u hero-u)
for _ in range(260):
    x, y = rng.integers(0, W), rng.integers(0, 760); b = rng.uniform(.35, .9) * (1 - y / 900)
    nebo[y, x] = np.maximum(nebo[y, x], b)
    if b > .7 and 0 < x < W - 1: nebo[y, x - 1] = nebo[y, x + 1] = np.maximum(nebo[y, x + 1], b * .45)
# nebo = plavo-cyan pikseli (u PSD-u i izmaglica iznad planina); meka maska
bs = np.asarray(bez_sunca).astype(np.int32)
plavo = (bs[..., 2] > 170) & (bs[..., 2] - bs[..., 0] > 60) & (bs[..., 1] > 120)
plavo[min(H, 1150):] = False
sky = np.asarray(Image.fromarray((plavo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255
noc = nocna(bez_sunca) * (1 - sky) + nebo * sky
noc = Image.fromarray((np.clip(noc, 0, 1) * 255).astype(np.uint8))

(ROOT / 'slike').mkdir(exist_ok=True)
for ime, im in (('dan', dan), ('noc', noc)):
    for w in (3543, 2000):
        out = im if w == W else im.resize((w, round(H * w / W)), Image.LANCZOS)
        out.save(ROOT / 'slike' / f'mapa-{ime}-{w}.webp', quality=82 if w == W else 80, method=6)

# ---------- maske boja iz „Layer 30“ ----------
A = np.asarray(puni(sloj['Layer 30'])).astype(int); r, g, b, a = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
op = a > 140
M = {
 'red':   op & (r > 170) & (g < 90) & (b < 90),
 'blue':  op & (b > 190) & (g > 170) & (r < 120) & (b - r > 90),
 'teal':  op & (r < 70) & (g > 70) & (g < 150) & (b > 90) & (b < 170),
 'black': op & (r < 55) & (g < 55) & (b < 55),
 'yellow':op & (r > 200) & (g > 160) & (b < 100),
 'green': op & (g > r + 30) & (g > b + 10) & (r < 170),
}
CL = {'red': M['red'], 'blue': M['blue'] | M['teal'], 'black': M['black']}
cijena = {}
for k, m in CL.items():
    md = dilation(m, disk(1)); dt = ndi.distance_transform_edt(md)
    c = np.where(md, 1.0 + 1.5 / (1.0 + dt), 30.0)
    if k != 'black':                       # žičare su nacrtane preko staza
        c = np.where(~md & dilation(M['black'], disk(1)), 4.0, c)
    cijena[k] = c

def prilijepi(m, p, rr=30):
    x, y = p; y0, x0 = max(0, y - rr), max(0, x - rr)
    yy, xx = np.nonzero(m[y0:y + rr, x0:x + rr])
    if not len(yy): raise SystemExit(f'tačka {p} nije na liniji')
    i = np.argmin((yy + y0 - y) ** 2 + (xx + x0 - x) ** 2); return (yy[i] + y0, xx[i] + x0)

def izgladi(a, w=9):
    a = np.asarray(a, float)
    if len(a) < w: return a
    k = np.ones(w) / w
    f = lambda v: np.convolve(np.pad(v, (w // 2, w // 2), mode='edge'), k, mode='valid')
    out = np.stack([f(a[:, 0]), f(a[:, 1])], 1); out[0], out[-1] = a[0], a[-1]; return out

def rdp(a, eps):
    if len(a) < 3: return a
    s, e = a[0], a[-1]; v = e - s; n = np.hypot(*v) or 1; w_ = a - s
    d = np.abs(v[0] * w_[:, 1] - v[1] * w_[:, 0]) / n; i = int(np.argmax(d))
    if d[i] > eps: return np.vstack([rdp(a[:i + 1], eps)[:-1], rdp(a[i:], eps)])
    return np.vstack([s, e])

def put(pts):
    """Catmull-Rom → kubni Bézier, SVG d."""
    p = np.asarray(pts, float)
    if len(p) < 2: return ''
    def n(v):
        s = f'{v:.1f}'; return s[:-2] if s.endswith('.0') else s
    f = lambda q: f'{n(q[0])},{n(q[1])}'
    d = [f'M{f(p[0])}']
    for i in range(len(p) - 1):
        p0 = p[i - 1] if i else p[i]; p1, p2 = p[i], p[i + 1]; p3 = p[i + 2] if i + 2 < len(p) else p2
        c1 = p1 + (p2 - p0) / 6; c2 = p2 - (p3 - p1) / 6
        d.append(f'C{f(c1)} {f(c2)} {f(p2)}')
    return ''.join(d)

def ruta(boja, tacke):
    sn = [prilijepi(CL[boja], t) for t in tacke]; path = []
    for s, e in zip(sn, sn[1:]):
        idx, _ = route_through_array(cijena[boja], s, e, fully_connected=True, geometric=True)
        path += idx if not path else idx[1:]
    xy = np.array([(x, y) for y, x in path], float)
    return rdp(izgladi(izgladi(xy)), .8)

TEZ = {'blue': 'laka', 'red': 'srednja', 'black': 'teska'}
RANG = {'laka': 0, 'srednja': 1, 'teska': 2}

# osvijetljene staze (skriven sloj)
la = np.asarray(puni(sloj['osvetljena staza']))[..., 3] > 60
la_d = dilation(la, disk(6))

staze = []; sve_rute = {}
for sid, segs in STAZE.items():
    seg = []; svi = []
    for boja, t in segs:
        p = ruta(boja, t); svi.append(p)
        seg.append({'t': TEZ[boja], 'd': put(p), 'p': np.round(p, 1).tolist()})
    sve = np.vstack(svi); sve_rute[sid] = sve
    lit = float(np.mean([la_d[int(round(y)), int(round(x))] for x, y in sve]))
    duz = float(np.sum(np.hypot(*np.diff(sve, axis=0).T)))
    om = []
    for ox, oy in OZNAKE.get(sid, []):                        # oznaka tačno na liniji
        i = int(np.argmin(np.hypot(sve[:, 0] - ox, sve[:, 1] - oy))); om.append([round(sve[i, 0], 1), round(sve[i, 1], 1)])
    tez = max((s['t'] for s in seg), key=RANG.get)
    staze.append({'id': sid, 'tez': tez, 'seg': [{'t': s['t'], 'd': s['d']} for s in seg], 'o': om,
                  'noc': lit >= .6, 'fis': False, 'bb': [round(v) for v in (*sve.min(0), *sve.max(0))], 'px': round(duz)})

for fx, fy in FIS:
    best = min(sve_rute, key=lambda s: np.min(np.hypot(sve_rute[s][:, 0] - fx, sve_rute[s][:, 1] - fy)))
    next(s for s in staze if s['id'] == best)['fis'] = True

# veze: žičara do starta (vrh žičare blizu početka staze), žičare na dnu, odvajanje od / spajanje sa drugom stazom
dist = lambda p, q: float(np.hypot(p[0] - q[0], p[1] - q[1]))
def najbliza(p, sid):
    r = sve_rute[sid]; i = int(np.argmin(np.hypot(r[:, 0] - p[0], r[:, 1] - p[1]))); return float(np.hypot(*(r[i] - p))), i, len(r)
for s in staze:
    r = sve_rute[s['id']]; st, en = r[0], r[-1]
    s['gore'] = [z[0] for z in ZICARE if dist(st, z[6]) <= 90]
    s['dole'] = [z[0] for z in ZICARE if dist(en, z[5]) <= 110]
    s['od'] = []; s['u'] = []
    for o in sve_rute:
        if o == s['id']: continue
        d, i, n = najbliza(st, o)
        if d <= 24 and i > 3 and not s['gore']: s['od'].append(o)
        d, i, n = najbliza(en, o)
        if d <= 24 and i < n - 3 and not s['dole']: s['u'].append(o)

neimenovane = [{'t': TEZ[b], 'd': put(ruta(b, t))} for b, t in NEIMENOVANE]

# ---------- isprekidane linije (vezne staze, granica, pješačke) ----------
def tackice(m, amin, amax, ext):
    lab, n = ndi.label(m, np.ones((3, 3)))
    if not n: return np.zeros((0, 2))
    ar = ndi.sum(m, lab, range(1, n + 1)); sl = ndi.find_objects(lab); cs = ndi.center_of_mass(m, lab, range(1, n + 1))
    return np.array([(c[1], c[0]) for a_, s, c in zip(ar, sl, cs)
                     if amin <= a_ <= amax and max(s[0].stop - s[0].start, s[1].stop - s[1].start) <= ext])

def lanci(P, dmax):
    T = cKDTree(P); n = len(P); adj = [set() for _ in range(n)]
    for i in range(n):
        ds, js = T.query(P[i], k=6, distance_upper_bound=dmax)
        c = [(d, j) for d, j in zip(ds[1:], js[1:]) if np.isfinite(d)][:2]
        if len(c) == 2:
            v1, v2 = P[c[0][1]] - P[i], P[c[1][1]] - P[i]
            if np.dot(v1, v2) / np.linalg.norm(v1) / np.linalg.norm(v2) > -.2: c = c[:1]
        adj[i] |= {j for _, j in c}
    adj = [{j for j in adj[i] if i in adj[j]} for i in range(n)]
    seen = set(); out = []
    for pass_ in (0, 1):
        for s in range(n):
            if s in seen or (pass_ == 0 and len(adj[s]) == 2): continue
            ch = [s]; seen.add(s); prev = None; cur = s
            while True:
                nx = [j for j in adj[cur] if j != prev and j not in seen]
                if not nx: break
                prev, cur = cur, nx[0]; ch.append(cur); seen.add(cur)
            if len(ch) >= 3: out.append(P[ch])
    return out

def spoji(chs, dmax):
    """Spaja krajeve lanaca koji se nastavljaju (prekidi kod romboida i žičara)."""
    chs = [c for c in chs]
    def kraj(c, end):  # tačka i smjer prema van
        if end: p, q = c[-1], c[max(0, len(c) - 4)]
        else: p, q = c[0], c[min(len(c) - 1, 3)]
        v = p - q; return p, v / (np.linalg.norm(v) or 1)
    while True:
        best = None
        for i in range(len(chs)):
            for j in range(len(chs)):
                if i == j: continue
                for ei in (0, 1):
                    for ej in (0, 1):
                        p, u = kraj(chs[i], ei); q, w = kraj(chs[j], ej)
                        d = np.linalg.norm(q - p)
                        if d > dmax or d < 1e-6: continue
                        g = (q - p) / d
                        if np.dot(u, g) > .55 and np.dot(w, -g) > .55 and (best is None or d < best[0]): best = (d, i, ei, j, ej)
        if not best: return chs
        _, i, ei, j, ej = best
        a_ = chs[i] if ei else chs[i][::-1]; b_ = chs[j][::-1] if ej else chs[j]
        nov = np.vstack([a_, b_]); chs = [c for k, c in enumerate(chs) if k not in (i, j)] + [nov]

def isprekidane(m, amin, amax, ext, dm, spoj, minlen):
    P = tackice(m, amin, amax, ext)
    chs = spoji(lanci(P, dm), spoj)
    return [put(rdp(izgladi(c, 5), .7)) for c in chs if len(c) >= minlen]

veze = []
for boja in ('red', 'blue'):
    for d in isprekidane(M[boja], 4 if boja == 'red' else 3, 60, 12, 19, 46, 4): veze.append({'t': TEZ[boja], 'd': d})
for b, t in VEZE_RUCNO: veze.append({'t': TEZ[b], 'd': put(np.array(t, float))})
granica = isprekidane(M['yellow'], 6, 70, 12, 24, 60, 8)
pjesacke = isprekidane(M['green'], 2, 30, 8, 14, 30, 10)

# ---------- osvijetljene staze kao linije ----------
def trag(mask, minlen):
    sk = skeletonize(mask); k = np.ones((3, 3)); k[1, 1] = 0
    nb = ndi.convolve(sk.astype(int), k, mode='constant') * sk
    P = set(zip(*np.nonzero(sk))); N = set(zip(*np.nonzero(sk & (nb != 2)))); vis = set(); out = []
    def susj(p):
        y, x = p
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                q = (y + dy, x + dx)
                if q != p and q in P: yield q
    for n0 in N:
        for q in susj(n0):
            if (n0, q) in vis: continue
            path = [n0, q]; vis |= {(n0, q), (q, n0)}; prev, cur = n0, q
            while cur not in N:
                nx = sorted([r_ for r_ in susj(cur) if r_ != prev and (cur, r_) not in vis], key=lambda r_: abs(r_[0] - cur[0]) + abs(r_[1] - cur[1]))
                if not nx: break
                vis |= {(cur, nx[0]), (nx[0], cur)}; prev, cur = cur, nx[0]; path.append(cur)
            if len(path) >= minlen: out.append(np.array([(x, y) for y, x in path], float))
    return out
nocne = [put(rdp(izgladi(izgladi(p, 15), 15), 1.2)) for p in trag(la, 40)]

# ---------- žičare, usluge ----------
def projekcija(a, b, o):
    a, b, o = map(np.array, (a, b, o)); t = np.clip(np.dot(o - a, b - a) / np.dot(b - a, b - a), .08, .92); return np.round(a + t * (b - a), 1).tolist()
zicare = [{'id': i, 'ime': ime, 'tip': tip, 'm': m, 'min': mn, 'a': list(a), 'b': list(b_), 'o': projekcija(a, b_, o)}
          for i, ime, tip, m, mn, a, b_, o in ZICARE]

podaci = {
 'w': W, 'h': H,
 'staze': staze, 'neimenovane': neimenovane, 'veze': veze,
 'romboidi': [{'x': x, 'y': y, 'l': l, 't': TEZ[b]} for l, b, (x, y) in ROMBOIDI],
 'zicare': zicare,
 'usluge': [{'k': k, 'x': x, 'y': y} for k, v in USLUGE.items() for x, y in v],
 'granica': granica, 'pjesacke': pjesacke, 'nocne': nocne,
 'vrhovi': [{'ime': n, 'v': v, 'x': x, 'y': y} for n, v, (x, y) in VRHOVI],
}
(ROOT / 'podaci').mkdir(exist_ok=True)
(ROOT / 'podaci' / 'mapa.json').write_text(json.dumps(podaci, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('staza', len(staze), '| veza', len(veze), '| noćne linije', len(nocne), '| osvijetljene staze:',
      ' '.join(s['id'] for s in staze if s['noc']), '| FIS:', ' '.join(s['id'] for s in staze if s['fis']))
print('podaci', round((ROOT / 'podaci' / 'mapa.json').stat().st_size / 1024), 'KB')
