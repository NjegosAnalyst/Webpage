# Stanje projekta — oc-jahorina.com redizajn

Pročitaj ovo prije rada. Komunikacija sa korisnikom: srpski, latinica, ijekavica; kratko i jasno.

## Sajt i alati
- WordPress + tema **Betheme** (BeBuilder), Elementor, **Slider Revolution 6**, **WPCode Lite**, WP Fastest Cache, UpdraftPlus. Dodaci za Elementor: HappyAddons, UAE, Prime Slider; The Events Calendar (Događaji).
- Jezici: **qTranslate-XT** (ne WPML) — ista stranica/objava nosi oba jezika u oznakama `[:SH]…[:en]…[:]`, EN je na `/en/...`.
- Elementor je **besplatna verzija** (Posts, Loop Grid i ostali Pro widgeti su zaključani).
- Početna stranica: **Početna zima** (`/pocetna-zima/`, EN `/en/pocetna-zima/`).
- **Firewall hostinga (ModSecurity)** vraća "Forbidden" kad se u WPCode snima veći kod (HTML sa formom/SVG, veći JS). Zato se veći kod drži na GitHubu i učitava preko jsDelivr (vidi Header).
- Iz cloud okruženja **ne možemo otvoriti oc-jahorina.com** (mreža blokirana) — sve se testira na simulacijama (Playwright), a korisnik šalje screenshotove.

## Vizuelni stil (tema hero-a)
- Noćna fotografija Jahorine, tamne neumorfne površine, jedan akcenat **#00B9F2** (cyan).
- Fontovi: **Archivo** (naslovi), **Barlow** (tekst). Pozadina ~#0A1120 / #0c1424.
- Klase sa prefiksom (`jh-` hero, `jf-` header/footer) da se ne sudaraju sa temom.
- Korisnik je odbacio: neumorfni redizajn v3, mraz, pahulje, skijaša, pomjeranje/savijanje cijele fotografije (Ken Burns + 3D dubina). Voli suptilne, realne detalje.

## Završeno i na sajtu
1. **Hero** — `jahorina-hero-v2/`
   - Prototip: `index.html`; build: `python3 build-slider-revolution.py` → `slider-revolution-spremno/` (SR) i `slider-revolution-EN-spremno/` (EN), svaki: `1-html.html` (HTML sloj), `2-css.css` (Custom CSS), `3-js.js` (Custom JS SR6).
   - SR moduli: **Jahorina Hero 2027** i **Jahorina Hero 2027 EN**. Slike u Mediji: `/wp-content/uploads/2026/09/`.
   - Efekti: ulazak naslova, ledeno iscrtavanje "Jahorine", tačka na "i" skače, živi reflektori, **zvijezde na nebu** (posljednje dodato; korisnik treba da zamijeni `3-js.js` u oba modula ako već nije).
   - Zamjena starog slajdera na početnoj ovim modulima: korisnik to radi (Betheme Page Options → Slider ili blok u stranici).
2. **Footer** — `jahorina-header-footer/wordpress/1-footer-snippet.html` (WPCode HTML snippet, Site Wide Footer). Radi.
3. **Header** — meni se čita iz WordPressa (Izgled → Izbornici), naš kod samo mijenja izgled.
   - Kod: `jahorina-header-footer/wordpress/3-header-snippet.js` (generiše `build-wordpress.py`).
   - Na sajtu je **jedan red** u WPCode JavaScript snippetu "Jahorina Header" (Site Wide Header): `3-header-loader.js` — učitava fajl sa jsDelivr, zaključan na commit (`@<hash>`) i sa **SRI integrity** hešom.
   - **Svaka izmjena headera:** izmijeni `build-wordpress.py` → `python3 build-wordpress.py` → commit + push → u loaderu zamijeni hash commita **i** `integrity` (sha384 novog fajla: `openssl dgst -sha384 -binary 3-header-snippet.js | openssl base64 -A`) → korisniku daj novi red za WPCode.
   - Desktop: podmeniji na prelazak miša, dublji nivoi se otvaraju sa strane. Telefon: harmonika, dodir na stavku otvara podstavke, vlastita stranica stavke je prvi link.

## Sljedeće: sekcije početne ispod hero-a
- Prijedlog izgleda: `jahorina-home-sections/index.src.html` (artifact "Jahorina početna — ispod hero-a"). Redoslijed: Danas na Jahorini → Obavještenja i vijesti → Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu.
- **Vijesti — urađeno, čeka postavljanje na sajt.** `jahorina-home-sections/vijesti/`
  - Čita **samo kategoriju Vijesti** (`/category/vijesti/`) preko WP REST API-ja. Objave se dodaju u WordPressu kao i do sada.
  - Izgled (korisnik tražio): **slajder sa 5 najnovijih vijesti**, jedna u kadru preko cijele kartice (fotografija + tamni prelaz, datum, naslov, izvod, blago neumorfno cyan dugme „Pročitaj više“ sa strelicom u plitkom udubljenom krugu). Dole desno tihi neumorfni panel: brojevi 01–05 u plitkom žlijebu (aktivni utisnut, cyan broj + tanka cyan linija napretka), pauza i okrugle strelice. Smjena na 7 s, staje na mišu/fokusu/van ekrana; prevlačenje prstom. Naslov sekcije: „Obavještenja *i vijesti*“ (drugi dio iscrtan linijom kao „Jahorine“ u hero-u). Korisnik je tražio da dugmad budu **suptilna** — ne pojačavati sjenke/sjaj.
  - Sve fotografije imaju istu blagu **noćnu obradu** (manje boje, hladan plavi ton), da dnevne slike ne iskaču iz tona hero-a.
  - Iznad naslova samo datum (bez ikonice); oznaka postoji **samo za Obavještenje** (narandžasta). Nema velikog broja „01 / 05“ (brojevi su samo dole).
  - Telefon: fotografija gore (54% kartice), tekst ispod na tamnoj površini; brojevi postaju tačkice; „Sve vijesti“ ide ispod slajdera.
  - Pregled za korisnika: artifact „Jahorina vijesti“ (samo sekcija, probne objave).
  - Oznaka „Obavještenje“ kad naslov ili tekst počinje sa Obavještenje/Notice. Ako je naslov samo „Obavještenje“, kao naslov se prikazuje početak teksta.
  - qTranslate oznake (`[:SH]…[:en]…[:]`) razdvaja sam kod; na `/en/` prvo pita `/en/wp-json/`, pa `/wp-json/`, pa `/?rest_route=`. Bez slike → noćna fotografija iz hero-a.
  - Na sajtu: Elementor HTML widget sa redom iz `elementor-html-widget.html` (div + skripta sa jsDelivr-a, zaključana na commit + SRI). Ide iznad starog slajdera; stari se sakrije/obriše tek kad novi radi.
  - Sekcija u Elementoru: puna širina, padding 0 (u užem kontejneru blok sam dobija zaobljene ivice).
  - Ako ne učita: posjetioci vide poruku i dugme „Sve vijesti“; prijavljeni admin vidi i tehnički razlog (npr. `HTTP 403 · categories`).
  - **Svaka izmjena:** izmijeni `vijesti.js` → `node test-vijesti.js <folder> <fontovi>` (Playwright simulacija) → commit + push → `python3 napravi-widget.py` → commit + push → korisniku novi red za HTML widget.
- Sljedeće sekcije po prijedlogu: Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu (i Danas na Jahorini iznad vijesti).

## Linkovi
- Repo: https://github.com/NjegosAnalyst/Webpage (grana `main`, javan)
- Društvene mreže: FB https://www.facebook.com/JahorinaOC/?locale=sr_RS · YT https://www.youtube.com/@jahorinaoc · IG https://www.instagram.com/jahorina/ · TikTok https://www.tiktok.com/@jahorinaoc
