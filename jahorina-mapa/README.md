# Interaktivna mapa staza Jahorine

Sekcija za oc-jahorina.com: mapa skijališta iz PSD-a pretvorena u interaktivnu mapu (zum, pomjeranje, kartice staza i žičara,
filteri, noćni prikaz, SR/EN). Prefiks klasa `jm-`, mjesto ugradnje `<div id="jm-mapa"></div>`.

## Fajlovi
- `mapa.js` — cijela komponenta (ubacuje CSS i HTML, čita `podaci/mapa.json` i `slike/` pored sebe ili iz `data-base`).
- `podaci/mapa.json` — vektorski podaci (25 staza, vezne staze, 14 žičara, usluge, topovi, granica, pješačke staze,
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

## Gorska služba spasavanja (10. 11. 2026)
Ispod mape: „Hitno na stazi? Gorska služba spasavanja Jahorina“ + dugme `tel:+38766636636` (broj sa zvanične mape).
Drugi broj: `data-gss="+387 …"` na `#jm-mapa`.

## Na sajtu (Elementor HTML widget, 10. 11. 2026)
- Red: `elementor-html-widget.html` (pravi ga `napravi-widget.py`: jsDelivr zaključan na puni commit + SRI, rezerva githack;
  podaci/slike iz istog commita, rezerva raw.githubusercontent.com).
- **Svaka izmjena:** izmijeni → `node test-mapa.js` → commit + push → `python3 napravi-widget.py` → `node test-widget.js`
  → commit + push → korisniku novi red.
- `mapa.js` na sajtu: raširi se preko cijele širine (kao `fit()` u vijestima), zatvara šav sa tamnim blokom iznad i do
  footera ispod (isti postupak kao `alati/seo-brzina.py`), podatke i slike učita tek ~2 ekrana prije nego što dođe na ekran.
- `test-widget.js`: simulacija Betheme + Elementor (uži kontejner, stilovi teme, footer), SR, EN (`/en/`), telefon,
  Elementor editor (jQuery ubacivanje), jsDelivr pao (githack), podaci/slike sa GitHuba.

## Sigurnost (10. 11. 2026)
- `mapa.js`: jsDelivr zaključan na puni commit + SRI (preglednik ne pokrene izmijenjen fajl).
- `mapa.json`: heš u redu (`data-podaci="sha384-…"`), `fetch(…, {integrity})`; izmijenjen fajl se odbije i uzme se rezerva
  sa GitHuba (isti heš). Uz to `clean()` propusti u HTML samo provjerene vrijednosti (putanje `M/C` + brojevi, oznake staza,
  brojevi, poznate vrste) — i u pregledu bez heša. Test: `test-widget.js` (napad na podatke na jsDelivr-u / svuda / bez heša).
- Slike: samo `<img>` (ne mogu pokrenuti kod).
- Preostalo: rezerva za sam `mapa.js` sa githack-a je bez SRI (isti loader kao ostale sekcije; githack nije bilo moguće
  provjeriti iz ovog okruženja — ako šalje CORS, SRI se može dodati i rezervi u svim redovima).
- Commit mora ostati na GitHubu: grana se ne smije brisati prije spajanja u `main`.

## Ispravke posle provjere na sajtu (10. 11. 2026)
- **25 staza / 14 žičara kao ski info:** vraćene staza 9a (putanja iz PSD-a, `'rucno'` u `ulaz.py`, jer je nema na sloju
  oznaka AI mape) i žičara 12 Oštra glava (tanjir, 115 m); Prača 13, Trnovo I 14, AI-jeva 9a je opet 9b.
  Napomena: Bojanin AI od 5. 11. ih nema — provjeriti sa njom/službom koja verzija važi.
- **Tekst za pretraživače i AI:** red za Elementor nosi statični tekst (H2, uvod sa brojkama, 14 žičara sa dužinom i
  vožnjom, staze po boji, osvijetljene i FIS staze, link za preuzimanje, Gorska služba) na srpskom i engleskom
  (CSS bira po `<html lang>`). Loader ga sakrije dok se mapa učita; ako mapa ne krene za 8 s ili podaci ne stignu, tekst
  ostaje. ~4,6 KB.
- **Preuzimanje:** dugme „Preuzmi mapu staza“ ispod uvoda; podrazumijevano `preuzimanje/mapa-staza-jahorina.jpg`
  (zvanična slika 2000 × 1200, 25/14, sa jsDelivr-a); `PREUZMI` u `napravi-widget.py` = adresa iz WordPress Medija.
- **Bijele trake:** `paint()` oboji omotače u kojima je samo mapa (Elementor kontejner/kolona, `#Content` teme) bojom
  sekcije, pa padding ispod naslova stranice i iznad footera postane tamni dio sekcije. Test provjerava piksele.
- **Telefon:** filteri u dva reda (bez povlačenja), okvir `min(65svh, 62,9vw + 170px)` (najviše 65 % ekrana: cijelo
  skijalište uz vrh + tamni pojas sa uputstvom, u kojem se otvara kartica) sa cijelim skijalištem pri otvaranju, oznake žičara tek na zumu, kontrole vodoravno (+, −, cijeli ekran; „cijela mapa“ u cijelom ekranu).
- **Kartica staze:** „Žičara do starta“ za staze koje ne kreću od žičare (npr. 3b: žičara 2 preko staze 2); naziv i
  dužina se prikazuju čim se upišu u `STAZE_INFO` (`ulaz.py`). Status otvoreno/zatvoreno čeka izvor podataka.

- Kontrole na mapi: samo + i − (korisnik 10. 11.: bez „cijela mapa“ i „cijeli ekran“).

## Otvoreno
- Dužine i nazivi staza nisu na mapi (samo brojevi i težina) — mogu se dodati u `ulaz.py` kad stignu.
- Podloga u većoj rezoluciji (od dizajnerke), ako postoji.
- Gdje ide na sajtu (posebna stranica ili početna), pa red za Elementor HTML widget sa loaderom, kao ostale sekcije.
