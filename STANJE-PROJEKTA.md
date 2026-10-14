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
   - SR moduli: **Jahorina Hero 2027** i **Jahorina Hero 2027 EN**. Slika na sajtu: `/wp-content/uploads/2026/09/jahorina-noc.webp` (i za telefon). Lakše verzije `jahorina-hero-desktop.webp` (150 KB) / `jahorina-hero-mobil.webp` (98 KB) su u `assets/`, ali **nisu otpremljene** — kad se otpreme, u `build-slider-revolution.py` isprazni `SITE_FILES` i postavi `MEDIA` na mjesec otpremanja.
   - Brzina: fontovi samo Archivo 600/700/800; platno svjetala 1× na telefonu (~18 fps, miruje dok prst skroluje); bez blur ulaska na telefonu. WPCode JS snippet „Jahorina brzi start“ (Site Wide Header) = `wordpress-ubrzanje.js` (preload slike samo na početnoj).
   - **Glatko otvaranje na telefonu (14. 10., korisnik: „koči pri otvaranju“)** — samo ≤760 px, izgled skoro isti: traka dugmadi bez `backdrop-filter` (puna tamna pozadina .9); slova slogana se kristališu bez `blur` filtera; sjena slogana (`drop-shadow`) tek kad se slova smire (nije više preko slova u pokretu); „Jahorine“ bez stalnog pulsa (`jhNeon`/`jhSweep`) — umjesto toga miran cyan sjaj; tačka bez pulsa; SVG trag/olovka/odsjaji bez teških sjena (olovka jedna lagana); trag skoka tačke bez filtera; platno svjetala bez `mix-blend-mode:screen` (izgleda isto). Za sve ekrane: snop oko Web shop dugmeta se vrti samo na hover (ranije stalno, nevidljivo); mjerenje slova „Jahorine“ se kešira (ranije 2×, usred animacije); `resize` od trake adrese pri skrolovanju više ne prepravlja platno/tačku. SR `3-js.js`: animacije kreću kadar **poslije** JS pripreme (`jh-go` preko dvostrukog `requestAnimationFrame`, rezerva 150 ms), a „slika ispod headera“ se namješta **odmah** (blok `// >>> rano` iz `index.html` build kopira ispred `waitForHero`, provjera u svakom kadru dok se ne pojave hero i `.jf-header`, najduže 8 s) — ranije je slika skakala ~70 px tek kad se slajd prikaže. Mjereno (Chromium, telefon 390 px, CPU 6× sporiji): kompozitor/GPU posao 3817 → ~1400 ms za 6 s, kadrovi ~52 → ~58 fps, dugi zastoji poslije starta animacije uglavnom nestali (ostaju samo prije starta, dok sve miruje).
   - **SEO (14. 10.): H1 = mali tekst iznad slogana (`h1.jh-kicker`)**, slogan „Otkrij čaroliju Jahorine“ je `div.jh-title` (aria-label sa ispravnim tekstom; dio sa turskim „ı“ je aria-hidden). Razlog: ključne riječi „ski centar Jahorina“ u H1. Tekst: SR „Ski centar Jahorina · Olimpijska planina“, EN „Jahorina Ski Resort · Olympic Mountain“ (od 14. 10. svuda u hero-u „Olimpijska planina“ umjesto „Olimpijski centar“; logo i pravni naziv firme „AD Olimpijski centar Jahorina“ u footeru se ne mijenjaju). Skriveni `.jh-sr` je uklonjen. Na početnoj smije biti samo ovaj H1.
     - H1 ima CSS reset sa `!important` (Betheme/SR stilovi za h1 ne mijenjaju izgled); na telefonu su veličine i dalje 9.5px / 1.7px (≤360px: 9px / 1.1px).
     - Telefon: duži H1 ne staje u jedan red pored vertikalne trake (mjereno), pa se lomi **tačno kod „·“** u dva reda (tačka i razmaci se ne vide; JS im daje klase `jh-sep` / `jh-sep--dot`). Slogan i traka su na istom mjestu kao prije. Računar: jedan red.
   - Telefon (od 14. 10., po želji korisnika): slika od ivice do ivice (bez kartice), **naslov centriran** (vodoravno; vertikalno oko 42% visine, `translateY(-50%)`), H1 u dva centrirana reda sa cyan linijom iznad, **dugmad u vodoravnom redu ispod** (`bottom:12%`, 6 pločica od 60 px, natpisi 7.5 px; nizak ekran: 52 px, `bottom:8%`), naslov **+20%** (`clamp(48px,15vw,76px)`), meko radijalno zatamnjenje iza naslova. Sve je apsolutno pozicionirano (na sajtu flex sa `margin-top:auto` nije radio). Na sajtu se centriranje u prvom pokušaju nije primijenilo (redovi lijevo, „Jahorine“ pomjeren desno, red dugmadi preko ivice) — zato SR_LAYOUT ima odbrambena pravila sa `!important` (text-align na svakom redu, `.jh-ice` kao `display:table` + margin auto, red dugmadi sa `left/right:max(14px, 50% − 220px)`). Dugmad +5% (63 px, natpisi 7.9 px; ≤360 px 7.1 px). **Tačka na „i“:** na sajtu je nestajala (vjerovatno pravilo teme koje sakriva prazne span-ove) → `.jh-hero .jh-dot{display:block!important}` + JS rezerva `fixDot()`: ako je tačka ipak sakrivena, „ı“ se zamijeni običnim „i“. **Istaknuto dugme je Web shop** (cyan, `jh-quick__item--accent`), 360° je obično (i na računaru). **Natpisi „DNEVNO / NOĆNO SKIJANJE“** (EN „DAY / NIGHT SKIING“) u dva reda: drugi red je `span.jh-quick__l2` (display:block — ne `<br>`, jer SR_RESET sakriva `br`); svi natpisi imaju `min-height` od dva reda (21 / 17.5 / 15.7 px), pa su ikonice svih 6 pločica u istoj liniji. Staje 320–1440 px. **Dugmad, stil B (14. 10., korisnik izabrao od A/B/C):** Web shop je glavno dugme — računar: široka cyan pločica lijevo u traci („WEB SHOP“ + manji red „SKI KARTE“ + strelica, `jh-quick__label--cta`); telefon: cijeli red iznad ostalih 5 pločica („WEB SHOP · SKI KARTE →“ u jednom redu, `·` je `::before` sa `\00a0`; SR treba `.jh-hero .jh-quick__item--accent .jh-quick__l2{display:inline!important}`). EN: „SKI PASSES“. Pločice: stakleni prelaz + tanka svijetla ivica (bez starih neumorph sjena), ikonice ledeno-plave `#C4EEFF` (SR_RESET boji `.jh-quick__item` tom bojom, Web shop bijelo), nove ikonice planina+sunce (dnevno) i planina+mjesec (noćno), „360°“ istog stila kao ostali natpisi, crvena tačka „uživo“ tiho pulsira (transform/opacity), pritisak = `scale(.96)`. Telefon: pločice 58 px, Web shop 46 px (nizak ekran 52/40). Provjereno 320–1440, SR/EN: natpisi staju, traka ne dodiruje naslov, opterećenje isto kao prije. Mali tekst (H1) na telefonu 10.5 px (≤360 px: 10 px). **Telefon bez šava ispod headera:** JS `underHeader()` u hero-u pomjeri Slider Revolution omotač (`rs-fullwidth-wrap`/`rs-module-wrap`) gore negativnom marginom tačno za razmak do headera (samo ≤760 px, samo ako je razmak ≤ visina headera + 90 px), pa slika ide ispod providnog headera do vrha ekrana; na računaru se ništa ne mijenja. **Dijagnostika:** stranica sa `?jhdebug` u adresi poslije 6 s prikaže mjere hero-a (za screenshot sa telefona). Izmjereno 320–430 px, SR i EN: naslov centriran, ne dodiruje red dugmadi, natpisi staju.
   - Efekti: ulazak naslova, ledeno iscrtavanje "Jahorine", tačka na "i" skače, živi reflektori, **zvijezde na nebu** (posljednje dodato; korisnik treba da zamijeni `3-js.js` u oba modula ako već nije).
   - Zamjena starog slajdera na početnoj ovim modulima: korisnik to radi (Betheme Page Options → Slider ili blok u stranici).
2. **Footer** — `jahorina-header-footer/wordpress/1-footer-snippet.html` (WPCode HTML snippet, Site Wide Footer). Radi.
3. **Header** — meni se čita iz WordPressa (Izgled → Izbornici), naš kod samo mijenja izgled.
   - Kod: `jahorina-header-footer/wordpress/3-header-snippet.js` (generiše `build-wordpress.py`).
   - Na sajtu je **jedan red** u WPCode JavaScript snippetu "Jahorina Header" (Site Wide Header): `3-header-loader.js` — učitava fajl sa jsDelivr, zaključan na commit (`@<hash>`) i sa **SRI integrity** hešom.
   - **Svaka izmjena headera:** izmijeni `build-wordpress.py` → `python3 build-wordpress.py` → commit + push → u loaderu zamijeni hash commita **i** `integrity` (sha384 novog fajla: `openssl dgst -sha384 -binary 3-header-snippet.js | openssl base64 -A`) → korisniku daj novi red za WPCode.
   - Desktop: podmeniji na prelazak miša, dublji nivoi se otvaraju sa strane. Telefon: harmonika, dodir na stavku otvara podstavke, vlastita stranica stavke je prvi link.

## SEO pravila za cijelu početnu (usklađeno sa hero-om, važi za svaku sekciju)
- **Samo jedan H1** na početnoj: hero (`h1.jh-kicker`, SR „Ski centar Jahorina · Olimpijska planina“, EN „Jahorina Ski Resort · Olympic Mountain“). Sekcije ispod: naslov sekcije = **H2**, stavke (vijest, događaj, kartica) = **H3**. Nijedna sekcija ne smije dodati H1.
- Naziv u tekstovima: **„Olimpijska planina Jahorina“ / „Olympic Mountain Jahorina“**, ne „Olimpijski centar“ (izuzetak: logo i pravni naziv firme „AD Olimpijski centar Jahorina“).
- Ključne riječi prirodno u H2/tekstu: ski centar Jahorina, skijanje, ski karte, noćno skijanje, vijesti/obavještenja.
- Slike: smislen `alt` (šta je na slici + Jahorina), `loading="lazy"` ispod hero-a, `width`/`height` da nema pomjeranja.
- Linkovi: pravi `<a href>` sa jasnim tekstom („Pročitaj više: <naslov>“ kroz `aria-label`), EN verzija vodi na `/en/` adrese.
- Brzina (hero je optimizovan za telefon): bez teških filtera/`backdrop-filter`/beskonačnih animacija preko velikih površina na telefonu.

## Sekcije početne ispod hero-a
- Prijedlog izgleda svih sekcija: `jahorina-home-sections/index.src.html` (artifact "Jahorina početna — ispod hero-a"). Redoslijed: Danas na Jahorini → Obavještenja i vijesti → Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu. Prijedlog je polazna tačka; konačan izgled je po `TEMA.md` (premium, minimalistički, blag neumorfizam).

### 1. Obavještenja i vijesti — urađeno, potvrđeno na HERO TEST (računar + telefon)
- Kod: `jahorina-home-sections/vijesti/` (`vijesti.js`, test `test-vijesti.js`, red za widget `elementor-html-widget.html` iz `napravi-widget.py`, pregled `pregled/napravi-pregled.py`).
- Čita **samo kategoriju Vijesti** (`/category/vijesti/`) preko WP REST API-ja. Objave se dodaju u WordPressu kao i do sada.
- Izgled (korisnik tražio): **slajder sa 5 najnovijih vijesti**, jedna u kadru preko cijele kartice: fotografija sa tamnim prelazom, datum, naslov, izvod i blago neumorfno cyan dugme „Pročitaj više“ sa strelicom u plitkom udubljenom krugu. Dole desno je tihi neumorfni panel: brojevi 01–05 u plitkom žlijebu (aktivni utisnut, cyan broj + tanka cyan linija napretka), pauza i okrugle strelice. Smjena na 7 s, staje na mišu/fokusu/van ekrana; prevlačenje prstom. Naslov sekcije: „Obavještenja *i vijesti*“ (drugi dio iscrtan linijom).
- Korisnik je tražio da dugmad budu **suptilna**: ne pojačavati sjenke/sjaj.
- **Usklađeno sa hero-om (14. 10.):**
  - nadnaslov je stil malog teksta iz hero-a („NAJNOVIJE“ / „LATEST“);
  - H2 je „Obavještenja i vijesti / *sa Jahorine*“ (EN „Notices and news / *from Jahorina*“), drugi red iscrtan kao „Jahorine“ u hero-u;
  - „Pročitaj više“ je isto dugme kao Web shop (cyan pločica, velika slova, →);
  - „Sve vijesti“ i donja traka (brojevi, pauza, strelice) su staklene pločice iz hero-a (stil B), ikonice `#C4EEFF`;
  - SEO: alt slika (iz Medija ili „<naslov> — Olimpijska planina Jahorina“), sve slike `loading="lazy"` + `width`/`height`, link stavke `aria-label="Pročitaj više: <naslov>"`, „Sve vijesti“ sa `aria-label`;
  - telefon: bez `backdrop-filter`, bez filtera i `mix-blend-mode` na slikama, skeleton bez animacije.
  - Test `test-vijesti.js` sada provjerava i SEO: 0 × H1, H2 tekst, alt, lazy, dimenzije, aria-label linka, bez zamućenja na telefonu.
- **Prelaz iz hero-a (14. 10., korisnik: bijela traka između hero-a i vijesti na HERO TEST):**
  - blok sam mjeri razmak do susjeda iznad i ispod (preskače fiksni header i skripte) i primakne se negativnom marginom, najviše 160 px (`closeGaps()` u `fit()`);
  - **telefon na HERO TEST (14. 10.): traka je ostala**, jer je bijelo bilo *unutar* bloka iznad (omotač Slider Revolutiona / Elementor sekcija viša od hero-a). Zato blok sada mjeri do stvarnog dna `.jh-hero` (najviše 260 px) i tada dobija `z-index:2`. Simulacija to ponavlja (omotač hero-a sa 28 px bijelog): stara verzija 28 px, nova 0;
  - **telefon, druga runda (14. 10.): ostala tanka bijela linija** — omotač slajdera na telefonu *odsiječe* hero (`overflow:hidden`, niži od `.jh-hero`), a razmak je bio dio piksela (zaokruživanje ga je preskakalo). Sada: vidljivo dno hero-a (`visBottom()` uzima u obzir roditelje sa `overflow:hidden`), razmak bez zaokruživanja (zatvara se već od 0,3 px) i 1 px preklopa uz hero (ista boja `#0C1424`). Test `2b-telefon-odsjecen-hero` (412 px, odsječen hero + 1,4 px): stara verzija 1,4 px, nova −1 (preklop);
  - pozadina počinje bojom trake oko hero-a `#0C1424` i do 280 px prelazi u `#0A1120`; na vrhu je tihi cyan „horizont“ (linija 1 px, .26) sa mekim sjajem — bez šava i ivice;
  - dijagnostika: stranica sa `?jvdebug` u adresi prikaže dole lijevo izmjerene razmake, susjede i padding/margine roditelja (za screenshot ako tema ipak ostavi razmak).
- Sve fotografije imaju istu blagu **noćnu obradu**, da dnevne slike ne iskaču iz tona hero-a. Bez slike → noćna fotografija iz hero-a.
- Iznad naslova je samo datum. Oznaka postoji **samo za Obavještenje** (narandžasta): kad naslov ili tekst počinje sa Obavještenje/Notice. Ako je naslov samo „Obavještenje“, kao naslov se prikazuje početak teksta.
- Telefon: fotografija gore (54% kartice), tekst ispod; brojevi postaju tačkice; „Sve vijesti“ ide ispod slajdera.
- qTranslate oznake razdvaja sam kod; na `/en/` prvo pita `/en/wp-json/`, pa `/wp-json/`, pa `/?rest_route=`.
- Ako ne učita: posjetioci vide poruku i dugme „Sve vijesti“; prijavljeni admin vidi i tehnički razlog (npr. `HTTP 403 · categories`).
- **HERO TEST (6. 10. 2026):** radi, čita prave vijesti i slike. Popravljeno: bijele trake sa strane (blok se sam širi, `fit()`) i tamni naslov (Betheme `!important`). Korisnik uklanja razmak između Elementor sekcija (padding/margin/gap 0).
- **14. 10.: korisnik potvrdio — sve u redu na HERO TEST, računar i telefon** (izgled kao hero, bez bijele trake/linije). Verzija na sajtu: `@393b050` (red u `vijesti/elementor-html-widget.html`).
- **Ostaje:** postaviti isti red na Početna zima (HTML widget iznad starog slajdera vijesti, pa stari sakriti/obrisati) i obrisati keš.
- Posljednji red za widget je uvijek u `vijesti/elementor-html-widget.html`.
- **Svaka izmjena:** izmijeni `vijesti.js` → `bash ../alati/preuzmi-fontove.sh <fontovi>` (jednom) → `node test-vijesti.js <screenshotovi> <fontovi>` → commit + push → `python3 napravi-widget.py` → commit + push → korisniku novi red za HTML widget. Pregled: `python3 pregled/napravi-pregled.py` → objaviti `pregled/index.html` (+ `img/*.jpg`) na isti artifact URL.

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
