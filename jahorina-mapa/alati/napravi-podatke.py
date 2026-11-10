#!/usr/bin/env python3
"""Illustrator mapa skijališta (AI, PDF-kompatibilna) → slike (dan/noć) + vektorski podaci za interaktivnu mapu.

    python3 napravi-podatke.py <mapa.ai>

AI je na GitHub Release-u `mapa-ai` (prevelik za repo):
https://github.com/NjegosAnalyst/Webpage/releases/download/mapa-ai/Mapa.ZIMA.2026.NOVO.v2.ai
(starija PSD verzija: Release `mapa-psd`; skripta za nju je u istoriji repoa, commit prije 9. 11. 2026)
Potrebno: pip install pymupdf scikit-image scipy pillow

Izlaz: ../slike/mapa-{dan,noc}-{3543,2000}.webp, ../podaci/mapa.json
AI fajl: najveća slika na stranici = naslikana podloga (povezana slika, u fajlu 1593 × 987 px, žute osvijetljene staze
su urezane u nju); sve ostalo (staze, žičare, ikonice, legenda) je vektor. Svijet mape = područje podloge
(PDF tačke 0..3805.92 × 134..2494) u 3543 × 2198 px.
"""
import sys, io, json, pathlib, numpy as np
import pymupdf
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
from skimage.graph import route_through_array
from skimage.morphology import dilation, opening, disk, skeletonize, remove_small_objects

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from ulaz import STAZE, OZNAKE, NEIMENOVANE, VEZE_RUCNO, ROMBOIDI, ZICARE, USLUGE, USLUGE_INFO, FIS, VRHOVI, SANKE, NATPISI

ROOT = pathlib.Path(__file__).resolve().parent.parent
BB = pymupdf.Rect(0, 134, 3805.92, 2494)          # područje podloge u PDF tačkama
W = 3543; S = W / BB.width                         # H (2198) daje iscrtani sloj oznaka

doc = pymupdf.open(sys.argv[1]); pg = doc[0]
slike = sorted(pg.get_image_info(xrefs=True), key=lambda i: -(i['bbox'][2] - i['bbox'][0]) * (i['bbox'][3] - i['bbox'][1]))
POD = slike[0]                                      # naslikana podloga
pix = pymupdf.Pixmap(doc, POD['xref'])
if pix.n - pix.alpha != 3: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
src = Image.frombytes('RGB' if not pix.alpha else 'RGBA', (pix.width, pix.height), pix.samples).convert('RGB')
bx0, by0, bx1, by1 = POD['bbox']                    # dio slike koji pada u BB
kx = (BB.x0 - bx0) / (bx1 - bx0) * src.width; kx1 = (BB.x1 - bx0) / (bx1 - bx0) * src.width
ky = (BB.y0 - by0) / (by1 - by0) * src.height; ky1 = (BB.y1 - by0) / (by1 - by0) * src.height
SW, SH = src.size
kx, ky, kx1, ky1 = max(0, kx), max(0, ky), min(SW, kx1), min(SH, ky1)   # podloga pokriva BB (zaokruživanje ivica)

# sloj oznaka: stranica bez podloge, providna pozadina
pg.delete_image(POD['xref'])
op_pix = pg.get_pixmap(matrix=pymupdf.Matrix(S, S), clip=BB, alpha=True)
oznake = Image.open(io.BytesIO(op_pix.tobytes('png'))).convert('RGBA')   # preko PNG-a: boje bez premultiplikovane providnosti
assert oznake.width == W, oznake.size
H = oznake.height

# ---------- podloga: osvijetljene staze (žuto), nebo, prigušena dnevna i noćna verzija ----------
a0 = np.asarray(src).astype(np.float32) / 255
mx, mn = a0.max(2), a0.min(2)
sat = (mx - mn) / np.maximum(mx, 1e-3)
hue_y = (a0[..., 0] > .62) & (a0[..., 1] > .55) & (a0[..., 2] < a0[..., 1] - .12) & (a0[..., 0] - a0[..., 2] > .18)
zuto = hue_y & (sat > .22)
zuto = remove_small_objects(zuto, 25)
# za uklanjanje boje šire nego za linije: i svjetlije žute ivice traka
zuto_siri = ndi.binary_dilation(zuto | (hue_y & (sat > .1) & ndi.binary_dilation(zuto, iterations=3)), iterations=1)
zuto_meko = np.asarray(Image.fromarray((zuto_siri * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)[..., None] / 255
lum0 = (a0 @ np.array([.299, .587, .114], np.float32))[..., None]
# žute trake → snijeg (staze ispod su bijele): bez boje, malo svjetlije
a1 = a0 * (1 - zuto_meko) + np.clip(lum0 * 1.04 + .03, 0, 1) * zuto_meko

# nebo: povezano sa gornjom ivicom, plavo ili (iznad 165. reda, van opservatorije) sve
ys0 = np.arange(SH)[:, None]; xs0 = np.arange(SW)[None, :]
plav = (a0[..., 2] > .72) & (a0[..., 2] - a0[..., 0] > .17)
gore = (ys0 < 165 * SH / 987) & ~((xs0 > 775 * SW / 1593) & (xs0 < 865 * SW / 1593))
nebo_k = (plav | gore) & (ys0 < 420 * SH / 987)
lab_, _ = ndi.label(nebo_k)
vrh = set(np.unique(lab_[0])) - {0}
nebo_m = np.isin(lab_, list(vrh))
nebo_m = ndi.binary_closing(nebo_m, iterations=2)
sky0 = np.asarray(Image.fromarray((nebo_m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.4))).astype(np.float32)[..., None] / 255

def u_svijet(arr):        # niz (SH, SW, 3|1) → slika svijeta W × H
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8).squeeze())
    return im.resize((W, H), Image.LANCZOS, box=(kx, ky, kx1, ky1))

yy = np.linspace(0, 1, SH, dtype=np.float32)[:, None, None]
# dnevna (prigušena): bez sunca, mirno svijetlo nebo, teren manje zasićen i hladniji
lum1 = (a1 @ np.array([.299, .587, .114], np.float32))[..., None]
d_ = lum1 + (a1 - lum1) * .72
d_ = 1 - (1 - np.clip(d_ * np.array([.985, 1.0, 1.02], np.float32), 0, 1)) * .93
t_ = np.clip(yy / .38, 0, 1) ** 1.2
nebo_d = np.array([150, 190, 214], np.float32) / 255 * (1 - t_) + np.array([228, 238, 244], np.float32) / 255 * t_
dan = u_svijet(d_ * (1 - sky0) + nebo_d * sky0).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))

def nocna(a):
    lum = (a @ np.array([.299, .587, .114], np.float32))[..., None]
    a = a * .45 + lum * .55
    a = np.clip(a, 0, 1) ** 1.35 * .62
    return a * (.62 + .38 * np.array([.20, .38, .72], np.float32) * 1.6)
nebo_n = (np.array([5, 10, 24], np.float32) * (1 - yy) + np.array([22, 38, 72], np.float32) * yy) / 255
nebo_n = np.broadcast_to(nebo_n, (SH, SW, 3)).copy()
noc = u_svijet(nocna(a1) * (1 - sky0) + nebo_n * sky0)
# zvijezde u punoj rezoluciji (oštre), samo na nebu
nm = np.asarray(Image.fromarray((nebo_m * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR, box=(kx, ky, kx1, ky1))) > 200
na = np.asarray(noc).astype(np.float32) / 255
rng = np.random.default_rng(7)
for _ in range(320):
    x, y = int(rng.integers(1, W - 1)), int(rng.integers(0, int(H * .3)))
    if not nm[y, x]: continue
    b_ = rng.uniform(.35, .9) * (1 - y / (H * .34))
    na[y, x] = np.maximum(na[y, x], b_)
    if b_ > .65: na[y, x - 1] = na[y, x + 1] = np.maximum(na[y, x + 1], b_ * .45)
noc = Image.fromarray((np.clip(na, 0, 1) * 255).astype(np.uint8))

(ROOT / 'slike').mkdir(exist_ok=True)
for ime, im in (('dan', dan), ('noc', noc)):
    for w in (3543, 2000):
        out = im if w == W else im.resize((w, round(H * w / W)), Image.LANCZOS)
        out.save(ROOT / 'slike' / f'mapa-{ime}-{w}.webp', quality=80, method=6)
dan.resize((96, round(H * 96 / W)), Image.LANCZOS).save(ROOT / 'slike' / 'mapa-dan-96.webp', quality=60)   # mutna slika dok se učitava oštra

# osvijetljene staze (žute trake podloge) u koordinatama svijeta
la = np.asarray(Image.fromarray((zuto * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR, box=(kx, ky, kx1, ky1))) > 110

# ---------- maske boja sa sloja oznaka ----------
A = np.asarray(oznake).astype(int); r, g, b, a = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
op = a > 140
M = {
 'red':   op & (r > 170) & (g < 90) & (b < 90),
 'blue':  op & (b > 190) & (g > 170) & (r < 120) & (b - r > 90),
 'teal':  op & (r < 70) & (g > 70) & (g < 150) & (b > 90) & (b < 170),
 'black': op & (r < 55) & (g < 55) & (b < 55),
 'yellow':op & (r > 200) & (g > 160) & (b < 100),
 'green': op & (g > r + 30) & (g > b + 10) & (r < 170),
 'white': op & (r > 235) & (g > 235) & (b > 235),
 'zlato': op & (r > 170) & (g > 105) & (g < 175) & (b < 75),
}
CL = {'red': M['red'], 'blue': M['blue'] | M['teal'], 'black': M['black'], 'white': M['white']}
cijena = {}
for k, m in CL.items():
    md = dilation(m, disk(1)); dt = ndi.distance_transform_edt(md)
    c = np.where(md, 1.0 + 1.5 / (1.0 + dt), 30.0)
    if k in ('red', 'blue'):               # žičare su nacrtane preko staza
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

la_d = dilation(la, disk(8))

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
# topovi za osnježavanje: žute ikonice (glava i tijelo topa se spoje), bez ikonica koje su takođe žute (24h, policija, poligon, snow factory)
lab, n = ndi.label(ndi.binary_closing(M['zlato'], iterations=2), np.ones((3, 3)))
ar = ndi.sum(M['zlato'], lab, range(1, n + 1)); sl = ndi.find_objects(lab); topovi = []
zute = [p for k in ('karte24', 'policija', 'poligon', 'snowfactory', 'skibike') for p in USLUGE.get(k, [])]
for a_, s_ in zip(ar, sl):
    h_, w_ = s_[0].stop - s_[0].start, s_[1].stop - s_[1].start
    if 45 <= a_ <= 700 and 6 <= w_ <= 45 and 6 <= h_ <= 45:
        c = ((s_[1].start + s_[1].stop) / 2, (s_[0].start + s_[0].stop) / 2)
        if min((np.hypot(c[0] - x, c[1] - y) for x, y in zute), default=99) < 28: continue
        if any(np.hypot(c[0] - x, c[1] - y) < 22 for x, y in topovi): continue
        topovi.append(c)
sanke = [put(ruta('white', t)) for t in SANKE]
info = {k: min(((x, y) for x, y in USLUGE[k]), key=lambda q: np.hypot(q[0] - p[0], q[1] - p[1])) for k, p in USLUGE_INFO.items()}

zicare = [{'id': i, 'ime': ime, 'tip': tip, 'm': m, 'min': mn, 'a': list(a), 'b': list(b_), 'o': projekcija(a, b_, o)}
          for i, ime, tip, m, mn, a, b_, o in ZICARE]

podaci = {
 'w': W, 'h': H,
 'staze': staze, 'neimenovane': neimenovane, 'veze': veze,
 'romboidi': [{'x': x, 'y': y, 'l': l, 't': TEZ[b]} for l, b, (x, y) in ROMBOIDI],
 'zicare': zicare,
 'usluge': [dict({'k': k, 'x': x, 'y': y}, **({'i': k} if info.get(k) == (x, y) else {})) for k, v in USLUGE.items() for x, y in v],
 'topovi': [[round(x), round(y)] for x, y in topovi], 'sanke': sanke, 'fis': [list(p) for p in FIS],
 'natpisi': [{'t': t, 'x': x, 'y': y} for t, (x, y) in NATPISI],
 'granica': granica, 'pjesacke': pjesacke, 'nocne': nocne,
 'vrhovi': [{'ime': n, 'v': v, 'x': x, 'y': y} for n, v, (x, y) in VRHOVI],
}
(ROOT / 'podaci').mkdir(exist_ok=True)
(ROOT / 'podaci' / 'mapa.json').write_text(json.dumps(podaci, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('topova', len(topovi), '| staza', len(staze), '| veza', len(veze), '| noćne linije', len(nocne), '| osvijetljene staze:',
      ' '.join(s['id'] for s in staze if s['noc']), '| FIS:', ' '.join(s['id'] for s in staze if s['fis']))
print('podaci', round((ROOT / 'podaci' / 'mapa.json').stat().st_size / 1024), 'KB')
