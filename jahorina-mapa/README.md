# Interaktivna mapa staza Jahorine

Sekcija za oc-jahorina.com: mapa skijališta iz PSD-a pretvorena u interaktivnu mapu (zum, pomjeranje, kartice staza i žičara,
filteri, noćni prikaz, SR/EN). Prefiks klasa `jm-`, mjesto ugradnje `<div id="jm-mapa"></div>`.

## Fajlovi
- `mapa.js` — cijela komponenta (ubacuje CSS i HTML, čita `podaci/mapa.json` i `slike/` pored sebe ili iz `data-base`).
- `podaci/mapa.json` — vektorski podaci (25 staza, vezne staze, 14 žičara, usluge, granica, pješačke i osvijetljene staze).
- `slike/mapa-{dan,noc}-{2000,3543}.webp` — naslikana podloga iz PSD-a: dan = prigušena verzija (bez sunca, mirno svijetlo nebo, teren manje zasićen; `PODLOGA` u `napravi-podatke.py`, 'original' vraća izgled iz PSD-a), noć = noćna obrada (tamno nebo, tihe zvijezde).
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

## Usklađeno sa zvaničnom slikom mape (16. 10.)
Korisnik je poslao sliku mape (novija verzija od PSD-a, sa cijelom legendom). Staze, brojevi, vezne staze, žičare i osvijetljene
staze su isti. Prenesene razlike: žičare 7, 11, 13, 14 = ski lift sidro (iz legende); bez 24h prodaje kod gondole 8; pomjereni
parking kod WC-a i hotel ispod njega; nova ski kasa kod smještaja; uprava (2) i natpis „Upravna zgrada“; snowboard park, ski bike,
pasarele, pješačke staze, staza za ski sanke (bijela linija); topovi za osnježavanje (67, filter „Osnježavanje“); oznake FIS;
okviri sa uslugama (Gondola Poljice, Olimp bar, Ski poligon) su u kartici te ikonice. Nazivi iz legende: ambulanta, ski renta.
Na slici nema oznaka „NEW!“ — ni na mapi.

## Otvoreno
- Dužine i nazivi staza nisu ni u PSD-u ni na slici (samo brojevi i težina) — mogu se dodati u `ulaz.py` kad stignu.
- Gdje ide na sajtu (posebna stranica ili početna), pa red za Elementor HTML widget sa loaderom, kao ostale sekcije.
