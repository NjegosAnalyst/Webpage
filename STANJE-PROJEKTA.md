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
- **Za sekcije početne: `jahorina-home-sections/TEMA.md`**: tokeni, obrasci (naslov sa iscrtanim dijelom, neumorfna dugmad, noćna obrada fotografija) i način gradnje. Svaka nova sekcija ide po tim pravilima.

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

## Sekcije početne ispod hero-a
- Prijedlog izgleda svih sekcija: `jahorina-home-sections/index.src.html` (artifact "Jahorina početna — ispod hero-a"). Redoslijed: Danas na Jahorini → Obavještenja i vijesti → Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu. Prijedlog je polazna tačka; konačan izgled je po `TEMA.md` (premium, minimalistički, blag neumorfizam).

### 1. Obavještenja i vijesti — urađeno, radi na HERO TEST
- Kod: `jahorina-home-sections/vijesti/` (`vijesti.js`, test `test-vijesti.js`, red za widget `elementor-html-widget.html` iz `napravi-widget.py`, pregled `pregled/napravi-pregled.py`).
- Čita **samo kategoriju Vijesti** (`/category/vijesti/`) preko WP REST API-ja. Objave se dodaju u WordPressu kao i do sada.
- Izgled (korisnik tražio): **slajder sa 5 najnovijih vijesti**, jedna u kadru preko cijele kartice: fotografija sa tamnim prelazom, datum, naslov, izvod i blago neumorfno cyan dugme „Pročitaj više“ sa strelicom u plitkom udubljenom krugu. Dole desno je tihi neumorfni panel: brojevi 01–05 u plitkom žlijebu (aktivni utisnut, cyan broj + tanka cyan linija napretka), pauza i okrugle strelice. Smjena na 7 s, staje na mišu/fokusu/van ekrana; prevlačenje prstom. Naslov sekcije: „Obavještenja *i vijesti*“ (drugi dio iscrtan linijom).
- Korisnik je tražio da dugmad budu **suptilna**: ne pojačavati sjenke/sjaj.
- Sve fotografije imaju istu blagu **noćnu obradu**, da dnevne slike ne iskaču iz tona hero-a. Bez slike → noćna fotografija iz hero-a.
- Iznad naslova je samo datum. Oznaka postoji **samo za Obavještenje** (narandžasta): kad naslov ili tekst počinje sa Obavještenje/Notice. Ako je naslov samo „Obavještenje“, kao naslov se prikazuje početak teksta.
- Telefon: fotografija gore (54% kartice), tekst ispod; brojevi postaju tačkice; „Sve vijesti“ ide ispod slajdera.
- qTranslate oznake razdvaja sam kod; na `/en/` prvo pita `/en/wp-json/`, pa `/wp-json/`, pa `/?rest_route=`.
- Ako ne učita: posjetioci vide poruku i dugme „Sve vijesti“; prijavljeni admin vidi i tehnički razlog (npr. `HTTP 403 · categories`).
- **HERO TEST (6. 10. 2026):** radi, čita prave vijesti i slike. Popravljeno: bijele trake sa strane (blok se sam širi, `fit()`) i tamni naslov (Betheme `!important`). Korisnik uklanja razmak između Elementor sekcija (padding/margin/gap 0).
- **Puna širina (7. 10. 2026, korisnik: „uskladi“ sa ratrakom):** kadar `.jv-stage` je preko cijele širine kao hero (rub `--g` clamp(14px,1.6vw,22px), radius 26px, sjenka kao hero), a naslov, tekst slajda i traka se na širokim ekranima poravnaju sa sadržajem 1240px (`--in`, računa iz `100cqw`, rezerva `100vw`). Isto pravilo koristi i ratrak. Novi red za widget (@709a516) treba zamijeniti na HERO TEST. Blok sam prekrije padding svog Elementor kontejnera (do 40px, samo kad je jedini widget u njemu), pa nema bijele trake između sekcija ni kad padding ostane 10px. fit() mjeri lijevu ivicu tek poslije širenja (radi i kad je widget centriran/Inline). Ratrak iznad kadra ima samo rub (--g), da razmak između vijesti i ratraka ne bude dupli; Elementor kontejner ratraka: padding/margin/gap 0 (inače bijela traka iznad).
- **Ostaje:** postaviti na Početna zima (HTML widget iznad starog slajdera vijesti, pa stari sakriti/obrisati) i provjeriti telefon.
- Posljednji red za widget je uvijek u `vijesti/elementor-html-widget.html`.
- **Svaka izmjena:** izmijeni `vijesti.js` → `bash ../alati/preuzmi-fontove.sh <fontovi>` (jednom) → `node test-vijesti.js <screenshotovi> <fontovi>` → commit + push → `python3 napravi-widget.py` → commit + push → korisniku novi red za HTML widget. Pregled: `python3 pregled/napravi-pregled.py` → objaviti `pregled/index.html` (+ `img/*.jpg`) na isti artifact URL.

### 2. Panoramska vožnja ratrakom — gotovo, red za widget spreman, sljedeće: HERO TEST (ispod vijesti)
- Kod: `jahorina-home-sections/ratrak/ratrak.js` (prefiks `jr-`, `#jr-ratrak`; galerija `#jr-lb`), test `test-ratrak.js`, red za widget `elementor-html-widget.html` iz `napravi-widget.py`, pregled `pregled/napravi-pregled.py` → artifact https://claude.ai/artifact/L7sAdcd13XrkaA4mRZ9Z5N.
- **Odbijeno:** v1 isječak ratraka + animirana scena („izuzetno loše“); v2 dvije fotografije lijevo + tekst desno na ravnoj pozadini („loše i jednostavno, mora biti premium, pogledaj hero“).
- **v3 (sada), jezikom hero-a:** jedan veliki uokvireni kadar **preko cijele širine ekrana** (korisnik: „nije puna širina“; rub sa strane clamp(14px,1.6vw,22px) kao kadar hero-a, radius 26px, sjenka kao hero; tekst se na širokim ekranima poravna sa sadržajem 1240px). Fotografija `ratrak-glavna.webp` (pejzažna 1600×1066 od korisnika, ratrak u zalasku na uređenoj stazi; 960 px kroz srcset za telefone) je **pozadina cijelog kadra** (korisnik: „uklopi u pozadinu, da nije odvojeno“) — malo uvećana i pomjerena ulijevo (img left:-24%, width:124%) da ratrak i sunce budu lijevo od teksta; tekst desno stoji na tamnom prelazu zdesna (kao naslov u hero-u), prelaz ne dopire do sunca da ostane bijelo. Obrada blaža od vijesti (saturate .9, brightness .97, plavi sloj .32), da zlatni zalazak ostane. Desno nadnaslov kao u hero-u („Doživljaj na Jahorini“), naslov u tri reda „Panoramska / vožnja / *ratrakom*“ (zadnja riječ obris), uvod, stakleni panel sa pločicama kao u hero-u (Trajanje / Polaz gondole Poljice / Po osobi, cijena na cyan pločici), dvije napomene, dugmad kao u hero-u (bijelo „Rezerviši putem maila“ + stakleno sa brojem) i rečenica o rezervaciji. Tablet (do 980 px) i telefon: fotografija preko cijele širine gore, meko prelazi u tamno, tekst ispod.
- **Ulazak (korisnik tražio „slajd in“), jednom:** kadar se podigne, fotografija uđe slijeva i izoštri se iz mraka, tekst ulazi zdesna red po red, linija nadnaslova se upali, pločice se upale jedna za drugom. ~2 s. Bez IntersectionObservera ili uz smanjeno kretanje sve je odmah vidljivo.
- **Dopune (korisnik: „uradi ovo“):**
  - GA: klik na mail/telefon/web shop → događaj `ratrak_rezervacija` (parametri `nacin`: mail | telefon | webshop, `jezik`); otvaranje galerije → `ratrak_galerija`. Ide preko `gtag` (GA4) ili `dataLayer` (GTM); bez njih se ništa ne šalje. U GA4 `ratrak_rezervacija` treba označiti kao ključni događaj (Admin → Events).
  - Web shop: `data-webshop="https://…"` u redu za widget → glavno dugme „Rezerviši online“, mail i telefon postaju sporedni. Prazno = kao sada.
  - Podešavanja u redu za widget: `data-trajanje`, `data-polazak`, `data-polazak-en`, `data-cijena` (mijenjaju pločice i cijenu za Google). Uvodna rečenica i dalje kaže „20 minuta“.
  - Galerija: dugme „Galerija“ na fotografiji (i klik na fotografiju) otvara fotografije preko cijelog ekrana (strelice, prevlačenje, Esc, fokus ostaje u galeriji). Fotografije: `data-galerija="url1, url2"`, podrazumijevano `slike/ratrak-glavna.webp`, `ratrak-1.webp`, `ratrak-2.webp`.
  - schema.org: `TouristTrip` sa ponudom (cijena iz `data-cijena`, valuta BAM) se ubacuje u `<head>`.
- Tekst je korisnikov i ostaje u kodu (korisnik: „to je taj tekst“); EN je moj prevod.
- Red za widget: `elementor-html-widget.html` (jsDelivr @commit + SRI; fotografije iz istog commita). jsDelivr se iz cloud okruženja ne može otvoriti, pa ga nisam provjerio uživo.
- **Sljedeće:** postaviti red iz `elementor-html-widget.html` na HERO TEST ispod vijesti (Elementor HTML widget), provjeriti računar i telefon, pa na Početna zima. Ako web shop ima ratrak: upisati link u `data-webshop`. U GA4 označiti `ratrak_rezervacija` kao ključni događaj.

### Sljedeće sekcije
- Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu, plus Danas na Jahorini iznad vijesti. Korisnik bira kojom se nastavlja.
- Događaji: na sajtu je **The Events Calendar** (Elementor widget "Events Loop", sada „Trenutno nema događaja...“), pa podatke čitati iz njega (REST `/wp-json/tribe/events/v1/events`), ne ručno.

### Kako započeti novu sekciju (nova sesija)
1. Pročitati `STANJE-PROJEKTA.md` i `jahorina-home-sections/TEMA.md`.
2. Pogledati izgled te sekcije u `jahorina-home-sections/index.src.html`.
3. Od korisnika tražiti screenshotove kako je sekcija sada napravljena (Elementor/BeBuilder/widget, kategorija/izvor podataka).
4. Prvo pregled (artifact samo sa sekcijom), pa doterivanje po korisnikovim komentarima, pa tek onda red za Elementor i postavljanje na HERO TEST.

## Linkovi
- Repo: https://github.com/NjegosAnalyst/Webpage (grana `main`, javan)
- Pregled vijesti (artifact): https://claude.ai/artifact/YVHQy2joUTm9avVS1mP3Wv
- Društvene mreže: FB https://www.facebook.com/JahorinaOC/?locale=sr_RS · YT https://www.youtube.com/@jahorinaoc · IG https://www.instagram.com/jahorina/ · TikTok https://www.tiktok.com/@jahorinaoc
