# Interaktivna mapa staza Jahorine

Sekcija za oc-jahorina.com: mapa skijališta iz PSD-a pretvorena u interaktivnu mapu (zum, pomjeranje, kartice staza i žičara,
filteri, noćni prikaz, SR/EN). Prefiks klasa `jm-`, mjesto ugradnje `<div id="jm-mapa"></div>`.

## Fajlovi
- `mapa.js` — cijela komponenta (ubacuje CSS i HTML, čita `podaci/mapa.json` i `slike/` pored sebe ili iz `data-base`).
- `podaci/mapa.json` — vektorski podaci (25 staza, vezne staze, 14 žičara, usluge, granica, pješačke i osvijetljene staze).
- `slike/mapa-{dan,noc}-{2000,3543}.webp` — naslikana podloga iz PSD-a (dan) i noćna obrada (bez sunca, tamno nebo, tihe zvijezde).
- `alati/ulaz.py` — ručni ulaz: kontrolne tačke staza, oznake, žičare iz legende PSD-a, usluge.
- `alati/napravi-podatke.py` — PSD → slike + `mapa.json`.
- `pregled/index.html` — pregled (artifact), `test-mapa.js` — Playwright test (računar + telefon).

## Izvor
PSD je prevelik za repo (85 MB) i stoji na GitHub Release-u `mapa-psd`:
https://github.com/NjegosAnalyst/Webpage/releases/download/mapa-psd/mapa.Jahorina.pejzaz.psd

Slojevi koji se koriste: vidljivi slojevi = podloga; `Layer 30` = staze, žičare i ikonice (raster, iz njega se vektorizuje);
`osvetljena staza` (skriven) = osvijetljene staze; `Layer 13`/`Layer 14` = sunce (izbačeno iz noćne slike).
Oznake „NEW!“ iz PSD-a namjerno nisu prenesene (sezonske).

## Kako se pravi
```
pip install psd-tools scikit-image scipy pillow
python3 alati/napravi-podatke.py <mapa.psd>
bash ../jahorina-home-sections/alati/preuzmi-fontove.sh <fontovi>
NODE_PATH=$(npm root -g) node test-mapa.js <screenshotovi> <fontovi>
```
Staze se ne crtaju ručno: za svaku stazu u `ulaz.py` stoji nekoliko tačaka redom od vrha ka dnu, a skripta između njih
pronalazi put po liniji te boje u PSD-u (crvena/plava/crna) i izgladi ga. Nova ili izmijenjena staza = dopuni tačke
(koordinate PSD-a 3543 × 1996) i ponovo pokreni skriptu.

## Otvoreno (provjeriti sa korisnikom)
- Tip žičara 7, 11, 13, 14 (ikonica „dvije osobe“ nije u vidljivom dijelu legende) — u kartici se tip ne prikazuje dok se ne potvrdi.
- Noćno skijanje je iz skrivenog sloja „osvetljena staza“: osvijetljene ispadaju 1, 1a, 1b, 1c, 6, 7, 8, 9.
- Dužine i nazivi staza nisu u PSD-u (samo brojevi i težina) — mogu se dodati u `ulaz.py` kad stignu.
- Ugradnja na sajt (red za Elementor HTML widget sa loaderom, kao ostale sekcije) — poslije odobrenja pregleda.
