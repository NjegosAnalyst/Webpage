# Tema sekcija početne (ispod hero-a)

Pravila izgleda i gradnje za svaku novu sekciju početne. Uzor je hero (`jahorina-hero-v2/`), a
gotov primjer u kodu je blok vijesti (`vijesti/vijesti.js`). Odatle se kopiraju tokeni i obrasci,
da sve sekcije izgledaju kao jedna cjelina.

## Šta korisnik voli, a šta ne
- Noćna atmosfera Jahorine, tamne površine i **jedan akcenat: cyan `#00B9F2`**. Narandžasta `#FFB547` služi samo za upozorenja/obavještenja.
- **Premium, moderno, minimalistički.** Bez dupliranja informacija, po jedan istaknuti element po sekciji.
- **Dugmad kao u hero-u (stil B, 14. 10.):** staklene pločice (tamni prelaz + tanka svijetla ivica, bez starih neumorph sjena), ledeno-plave ikonice `#C4EEFF`, jedno istaknuto cyan dugme. Suptilno, ne pojačavati sjenke i sjaj.
- Suptilni, realni detalji (npr. zvijezde u hero-u). Animacije kratke, jednom, bez pretjerivanja.
- Odbijeno: neumorfni redizajn v3, mraz, pahulje, skijaš, pomjeranje/savijanje cijele fotografije (Ken Burns, 3D dubina).
- Jezik: srpski, latinica, ijekavica. EN tekstovi idu za `/en/` stranice.

## Tokeni (iz `vijesti.js`)
```
--bg:#0A1120  --surface:#111A2C  --surface-2:#16213A  --line:rgba(255,255,255,.08)
--text:#fff  --text-2:rgba(255,255,255,.76)  --text-3:rgba(255,255,255,.52)
--accent:#00B9F2  --accent-2:#2CCBF8  --warn:#FFB547
--raised: 6px 6px 16px rgba(0,0,0,.55), -5px -5px 14px rgba(60,84,128,.14)
--inset: inset 4px 4px 10px rgba(0,0,0,.5), inset -4px -4px 9px rgba(70,96,142,.13)
--fd: 'Archivo' (naslovi, 600–800)   --fb: 'Barlow' (tekst, 300–600)
```
- Širina sadržaja max 1240px, bočni razmak `clamp(16px,4vw,48px)`, razmak sekcije gore/dole `clamp(56px,7vw,100px)`.
- Zaobljenja: kartice 28–30px, dugmad pilule 40px, pločice 11–13px.

## Obrasci (gotovi u `vijesti.js`, usklađeni sa hero-om 14. 10.)
- **Nadnaslov (eyebrow)** = mali tekst iz hero-a (`.jh-kicker`): Archivo 600, 11px, razmak slova 5px, velika slova, bijelo .75; ispred cyan linija 34×1.5px (prelaz cyan→bijelo→cyan sa sjajem). To je `div`, **ne naslov**.
- **Naslov sekcije H2** u dva reda kao slogan hero-a: prvi red pun, drugi red **iscrtan linijom** (1.6px, bijelo .92) i sadrži „Jahorine“ (SEO + veza sa „Otkrij čaroliju *Jahorine*“). Primjer: „Obavještenja i vijesti / *sa Jahorine*“ (EN „Notices and news / *from Jahorina*“). Archivo 800, `clamp(32px,4.2vw,56px)`, razmak slova −1px.
- **Glavno dugme** = Web shop u hero-u: cyan pločica `linear-gradient(160deg,#45D6FF,#00AEE6 50%,#008BC7)`, zaobljenje 16px, velika slova (13px, razmak 2px), strelica „→“ (`::after`), hover `brightness(1.07)`, pritisak `scale(.96)` (`.jv-cta`).
- **Sporedni link** („SVE VIJESTI →“): staklena pločica (`.jv-more`): prelaz `rgba(255,255,255,.075)→.02` + `inset 0 0 0 1px rgba(255,255,255,.08)`; hover: podigne se 2px + cyan ivica i blag sjaj.
- **Kontrole**: staklena traka kao brzi linkovi hero-a (`.jv-bar`: `linear-gradient(180deg,rgba(18,27,45,.78),rgba(9,14,26,.88))`, tanka ivica, meka sjena); pločice 46×42 / zaobljenje 14px (`.jv-step`, `.jv-btn`); aktivna pločica ima cyan ivicu, broj `#9BE6FF` i tanku cyan liniju napretka.
- **Fotografije:** blaga noćna obrada: `filter: saturate(.7) brightness(.84) contrast(1.06)` + plavi sloj `mix-blend-mode: soft-light` (`.jv-tint`), plus tamni prelaz ispod teksta. Na telefonu bez filtera i miješanja (samo providan plavi sloj).
- **Prelaz između sekcija (bez šava):** sekcija počinje bojom onoga iznad (ispod hero-a `#0C1424`) i mekim prelazom ide u svoju boju; na vrhu najviše tihi cyan „horizont“ (linija 1 px ~.25 + slab radijalni sjaj). Bez bijelih traka, ivica i kontrastnih pruga: razmak između Elementor sekcija zatvara `closeGaps()` (kopirati iz `vijesti.js`).
- **Oznaka (chip):** mala pilula, velika slova. Samo kad nosi informaciju (npr. „Obavještenje“).
- **Telefon (brzina kao u hero-u):** bez `backdrop-filter` (puna tamna pozadina .9), bez filtera/`mix-blend-mode` na velikim slikama, bez beskonačnih animacija preko velikih površina. Fotografija gore, tekst ispod, sporedni link ispod sadržaja.

## SEO (pravila u `STANJE-PROJEKTA.md`, primijenjeno u vijestima)
- Nijedan H1 u sekciji. Naslov sekcije H2, stavke H3.
- Slike: `alt` iz Medija, a ako ga nema, „<naslov> — Olimpijska planina Jahorina“; `loading="lazy"`; `width`/`height`.
- Linkovi: pravi `<a href>`; link stavke ima `aria-label="Pročitaj više: <naslov>"`; „Sve vijesti“ ima `aria-label` sa ključnim riječima; EN vodi na `/en/`.
- Naziv: „Olimpijska planina Jahorina“, ne „Olimpijski centar“ (osim pravnog naziva firme).

## Kako se sekcija gradi i ugrađuje
1. Folder `jahorina-home-sections/<sekcija>/` sa jednim JS fajlom (kao `vijesti/vijesti.js`): sam ubacuje CSS, crta HTML i čita podatke.
2. **Svoj prefiks klasa i id** (vijesti: `jv-` i `#jv-vijesti`; npr. događaji `jd-` i `#jd-dogadjaji`). Sav CSS ide pod taj id.
3. **Betheme nameće boje i fontove naslova sa `!important`**, pa naše boje i fontove naslova takođe zaključati sa `!important`. Za dugmad krenuti od `all:unset` + `!important` (kao `.jv-btn`).
4. **Puna širina:** kontejner teme je uži od ekrana, pa koristiti `fit()` iz `vijesti.js` (širina = `clientWidth`, negativna lijeva margina) da nema bijelih traka sa strane.
5. **Sadržaj iz WordPressa** kad god postoji (REST API `/wp-json/wp/v2/...`), ne kucati ručno. qTranslate oznake `[:SH]…[:en]…[:]` razdvaja `pickLang()`.
6. **Na sajtu:** Elementor HTML widget sa jednim redom: `<div id="...">` + skripta sa jsDelivr-a zaključana na commit + SRI. Red pravi `napravi-widget.py` (kopirati i prilagoditi).
7. **Test:** Playwright simulacija sajta (obrazac `vijesti/test-vijesti.js`). Fontove preuzima `alati/preuzmi-fontove.sh <folder>`. Testirati SR, EN, telefon, tablet, uži kontejner i grešku.
8. **Pregled za korisnika:** artifact samo sa sekcijom i probnim podacima (obrazac `vijesti/pregled/napravi-pregled.py`).
9. Nakon svake izmjene: test → commit + push → novi red za widget → ažurirati `STANJE-PROJEKTA.md`.
