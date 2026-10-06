"""Ratrak bez pozadine: prozirni PNG + WebP od jedne fotografije.

Upotreba (iz foldera ratrak/):
    pip install rembg
    python3 napravi-isjecak.py slike/ratrak-zalazak.jpg            # model birefnet-general
    python3 napravi-isjecak.py slike/<foto>.jpg isnet-general-use  # drugi model za poređenje

Rezultat: slike/ratrak-cutout.png i slike/ratrak-cutout.webp. Original se ne mijenja.
Poređenje modela na fotografiji ratraka u zalasku: birefnet-general daje punu masku
(retrovizor, rotaciono svjetlo, zadnji plug), u2net gubi plug, a isnet ostavlja poluprovidnu prašinu.
"""
import os
import sys

import numpy as np
from PIL import Image
from pymatting import estimate_foreground_ml
from rembg import new_session, remove

src = sys.argv[1]
model = sys.argv[2] if len(sys.argv) > 2 else "birefnet-general"
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slike")

photo = Image.open(src).convert("RGB")
mask = remove(photo, session=new_session(model)).getchannel("A")

img = np.asarray(photo).astype(np.float64) / 255
alpha = np.asarray(mask).astype(np.float64) / 255
alpha[alpha < 0.02] = 0  # sitni ostaci maske van mašine
# Boja ivica bez pozadine (inače ostaje ružičasti/bijeli oreol od snijega i neba)
fg = estimate_foreground_ml(img, alpha)
cut = Image.fromarray((np.dstack([np.clip(fg, 0, 1), alpha]) * 255 + .5).astype(np.uint8), "RGBA")

# Trim praznog prostora, 3 px rezerve da ivice ostanu cijele
ys, xs = np.nonzero(alpha > 0.02)
pad = 3
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0),
       min(xs.max() + 1 + pad, cut.width), min(ys.max() + 1 + pad, cut.height))
cut = cut.crop(box)

cut.save(os.path.join(out_dir, "ratrak-cutout.png"), optimize=True)
cut.save(os.path.join(out_dir, "ratrak-cutout.webp"), "WEBP", quality=90, alpha_quality=100, method=6)
print(model, "isječak", cut.size, "iz", photo.size, "okvir", tuple(int(v) for v in box))

# Verzija za sekciju: kad je mašina odsječena lijevom/desnom ivicom fotografije, taj ravni rez
# se blago istopi (u sceni ga pokriva snijeg koji plug gura), da se ne vidi oštra okomita linija.
web = np.asarray(cut).astype(np.float64)
fade = 26
ramp = np.clip(np.arange(cut.width) / fade, 0, 1) ** 1.6
if box[0] == 0:
    print("Pažnja: mašina dodiruje lijevu ivicu fotografije, dio je odsječen u originalu (ivica istopljena u ratrak-sekcija.webp).")
    web[:, :, 3] *= ramp[None, :]
if box[2] == photo.width:
    print("Pažnja: mašina dodiruje desnu ivicu fotografije (ivica istopljena u ratrak-sekcija.webp).")
    web[:, :, 3] *= ramp[::-1][None, :]
Image.fromarray((web + .5).astype(np.uint8), "RGBA").save(
    os.path.join(out_dir, "ratrak-sekcija.webp"), "WEBP", quality=90, alpha_quality=100, method=6)
