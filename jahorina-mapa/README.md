# Interaktivna mapa staza Jahorine

Sekcija za oc-jahorina.com: mapa skijališta iz PSD-a pretvorena u interaktivnu mapu (zum, pomjeranje, kartice staza i žičara,
filteri, noćni prikaz, SR/EN). Prefiks klasa `jm-`, mjesto ugradnje `<div id="jm-mapa"></div>`.

## Fajlovi
- `mapa.js` — cijela komponenta (ubacuje CSS i HTML, čita `podaci/mapa.json` i `slike/` pored sebe ili iz `data-base`).
- `podaci/mapa.json` — vektorski podaci (24 staze, vezne staze, 13 žičara, usluge, topovi, granica, pješačke staze,
  staza za ski sanke, osvijetljene staze).
- `slike/mapa-{dan,noc}-{2000,3543}.webp` — naslikana podloga: dan = prigušena (bez sunca, mirno nebo, žute trake
  osvijetljenih staza neutralisane u snijeg), noć = noćna obrada (tamno nebo, tihe zvijezde).
- `alati/ulaz.py` — ručni ulaz: kontrolne tačke staza, oznake, žičare iz legende, usluge.
- `alati/napravi-podatke.py` — AI → slike + `mapa.json`.
- `pregled/index.html` — pregled (artifact), `test-mapa.js` — Playwright test (računar + telefon).

## Izvor (od 9. 11. 2026)
Illustrator „Mapa ZIMA 2026 NOVO v2“ (Bojana, 5. 11. 2026), 207 MB, na GitHub Release-u `mapa-ai`:
https://github.com/NjegosAnalyst/Webpage/releases/download/mapa-ai/Mapa.ZIMA.2026.NOVO.v2.ai
- Fajl je PDF-kompatibilan; čita se sa PyMuPDF. Slojevi nisu označeni u PDF dijelu, pa skripta uklanja najveću sliku
  (podlogu) i iscrta ostatak kao sloj oznaka.
- **Podloga je povezana slika** (`nova pozadina.png` / `ChatGPT Image Nov 3, 2026…png` na dizajnerkinom disku); u fajlu je
  samo njena kopija **1593 × 987 px**, uvećana na 3543 × 2198. Zato je maksimalni zum 1,1 (telefon 1,25). Ako dizajnerka
  pošalje podlogu u većoj rezoluciji, zamijeniti je u skripti (bez ostalih izmjena).
- Žute osvijetljene staze su urezane u podlogu: skripta ih čita kao osvijetljene staze (noćni prikaz) i iz dnevne slike
  ih neutrališe u snijeg.
- Starija PSD verzija (Release `mapa-psd`) i njena skripta su u istoriji repoa (prije 9. 11. 2026).

## Kako se pravi
```
pip install pymupdf scikit-image scipy pillow
python3 alati/napravi-podatke.py <mapa.ai>
bash ../jahorina-home-sections/alati/preuzmi-fontove.sh <fontovi>
NODE_PATH=$(npm root -g) node test-mapa.js <screenshotovi> <fontovi>
```
Staze se ne crtaju ručno: za svaku stazu u `ulaz.py` stoji nekoliko tačaka redom od vrha ka dnu, a skripta između njih
pronalazi put po liniji te boje na sloju oznaka (crvena/plava/crna) i izgladi ga. Koordinate: 3543 × 2198 px
(PDF tačke 0..3805,92 × 134..2494, skala 3543/3805,92). Vezne staze, granica, pješačke staze i topovi se čitaju sami.

## Izmjene u AI mapi u odnosu na PSD (9. 11. 2026)
Tačke iz PSD verzije su prenesene afinom transformacijom (pomak ≈ 7, 6 px) i provjerene na novom sloju oznaka.
- Žičare: uklonjena 12 Oštra glava (tanjir); Prača je sada **12**, Trnovo I **13** (ukupno 13).
- Staze: uklonjena stara 9a (pored žičare Trnovo I); bivša 9b je sada **9a** (ukupno 24).
- Vezne staze: nove crvene 1c i 1a od vrha žičare 13 do staza 1c i 1a; na vrhu dvije vezne staze označene sa 2
  (crveno) umjesto 8 i 8a; donji dio staza 6a i 6c malo pomjeren.
- Usluge: nema ikonica hotela ni snowboard parka; pomjereni parking, sankalište, ski renta i uprava; tri pasarele.
- Staza za ski sanke ide i grebenom od Ogorjelice do Olimp bara. Nova podloga ima opservatoriju na Ogorjelici.

## Prikaz (9. 11. 2026, korisnik)
Bez usluga, bez topova za osnježavanje i bez popisa žičara i staza ispod mape. Podaci ostaju u `mapa.json`; atributi
`data-usluge="1"`, `data-topovi="1"`, `data-popis="1"` na `#jm-mapa` ih vraćaju (sa filterima). Ostaju: staze, vezne staze,
žičare, FIS oznake, granica, pješačke staze, noćni prikaz.

## Živi detalji (10. 11. 2026)
- Izabrana staza: svjetlosna linija dvaput tiho pređe stazu od vrha do dna (`flowRun`, ~1,4–2,6 s po prolazu).
- Izabrana žičara: kabina dvaput pređe od donje do gornje stanice pa nestane (`rideLift`).
- Učitavanje: odmah mutna mala slika (`slike/mapa-dan-96.webp`, 1,5 KB, uvećana bez CSS filtera), oštra se mekano pojavi.
- Sve to staje uz `prefers-reduced-motion`; animacije rade samo nekoliko sekundi poslije izbora (requestAnimationFrame).
- Ispravljeno: svijet mape je bio visine 1996 px (PSD), a AI mapa ima 2198 → linije, oznake i slika su bile malo
  razmaknute. Sada se veličina svijeta postavlja iz `mapa.json` (`w`, `h`); test provjerava da je oznaka staze na liniji.

## Otvoreno
- Dužine i nazivi staza nisu na mapi (samo brojevi i težina) — mogu se dodati u `ulaz.py` kad stignu.
- Podloga u većoj rezoluciji (od dizajnerke), ako postoji.
- Gdje ide na sajtu (posebna stranica ili početna), pa red za Elementor HTML widget sa loaderom, kao ostale sekcije.
