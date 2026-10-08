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
- **Puna širina (7. 10. 2026, korisnik: „uskladi“ sa ratrakom):** kadar `.jv-stage` je preko cijele širine kao hero (rub `--g` clamp(14px,1.6vw,22px), radius 26px, sjenka kao hero), a naslov, tekst slajda i traka se na širokim ekranima poravnaju sa sadržajem 1240px (`--in`, računa iz `100cqw`, rezerva `100vw`). Isto pravilo koristi i ratrak. Novi red za widget (@95826c1) treba zamijeniti na HERO TEST. **Prelaz vijesti → ratrak, v2 (v1 sa svjetlom preko cijele širine i tamnjenjem korisnik odbio: „nije premium“):** čist tamni razmak, ratrak pri dolasku „sjedne“ iz scale .94, meko svjetlo zalaska samo iznad sunca + topli odsjaj na ivici kadra. Pločice ratraka poravnate i manje, dugmad iste visine i fonta (korisnik: „ne izgledaju premium, nisu usklađena, font prevelik“), zatim iste širine, manja i poravnata sa panelom (korisnik: „malo ih smanji i poravnaj“). Editor je prikazivao stari stil jer se `<style>` nije osvježavao — sad se uvijek osvježi. Detalji u TEMA.md. Blok sam prekrije padding svog Elementor kontejnera (do 40px, samo kad je jedini widget u njemu), pa nema bijele trake između sekcija ni kad padding ostane 10px. fit() mjeri lijevu ivicu tek poslije širenja (radi i kad je widget centriran/Inline). Ratrak iznad kadra ima samo rub (--g), da razmak između vijesti i ratraka ne bude dupli; Elementor kontejner ratraka: padding/margin/gap 0 (inače bijela traka iznad).
- **Ostaje:** postaviti na Početna zima (HTML widget iznad starog slajdera vijesti, pa stari sakriti/obrisati) i provjeriti telefon.
- Posljednji red za widget je uvijek u `vijesti/elementor-html-widget.html`.
- **Svaka izmjena:** izmijeni `vijesti.js` → `bash ../alati/preuzmi-fontove.sh <fontovi>` (jednom) → `node test-vijesti.js <screenshotovi> <fontovi>` → commit + push → `python3 napravi-widget.py` → commit + push → korisniku novi red za HTML widget. Pregled: `python3 pregled/napravi-pregled.py` → objaviti `pregled/index.html` (+ `img/*.jpg`) na isti artifact URL.

### 2. Panoramska vožnja ratrakom — na HERO TEST ispod vijesti (zadnji red za widget @95826c1, u `ratrak/elementor-html-widget.html`)
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
- **Sljedeće:** korisnik zamijeni oba reda (vijesti i ratrak @95826c1) na HERO TEST i pošalje screenshot računara i telefona; pa na Početna zima. Ako web shop ima ratrak: upisati link u `data-webshop`. U GA4 označiti `ratrak_rezervacija` kao ključni događaj.

### 3. Suvenirnica — v3.1 „izlog“ ODOBRENA (8. 10. 2026: „sve je u redu“); korisnik je dobio red za widget (@4352164) za HERO TEST
- Kod: `jahorina-home-sections/suvenirnica/suvenirnica.js` (prefiks `jsu-`, `#jsu-suvenirnica`; galerija `#jsu-lb`; `js-` se ne koristi jer liči na JavaScript), test `test-suvenirnica.js` (Playwright, lažni WP REST odgovori), red za widget `elementor-html-widget.html` iz `napravi-widget.py` (posljednji: @4352164), pregled `pregled/napravi-pregled.py` (ratrak iznad, da se vidi prelaz) → artifact https://claude.ai/artifact/JJKX1ekLbNmhuNnEDnspVA.
- **Odbijeno:** v1 = ratrak u ogledalu (korisnik: „ne bi potpuno isto kao ratraci, tema da ali detalji različiti“); v2 „vitrina“ = tamna pozadina bez fotografije, kartice na staklenoj polici, šema gondole u panelu (korisnik: „prejednostavno, ne izgleda premium, fotografiju koristi i u pozadini, potrudi se da izgleda kao premium web stranica“).
- **v3 „izlog“ (sada):**
  - Fotografija proizvoda je **pozadina cijelog kadra**, a proizvodi se **smjenjuju** (marama → magneti → vitrina, 6,5 s): meki prelaz iz zamućenog i tamnog u oštro, bez zumiranja. Staje na mišu, fokusu, van ekrana i kad je kartica skrivena; uz smanjeno kretanje nema smjene. Telefon: i prevlačenje prstom. Kreće tek 1,6 s poslije ulaska.
  - Marama stoji desno od teksta (fotografija od 16 %, lijeva ivica se utapa u tamu); svaka fotografija ima svoju jačinu (`--lum`: marama .78, magneti .8, vitrina .62 jer je bijela). Tamni prelaz slijeva prati položaj teksta (`--side` + px), pa i na 1920 px tekst stoji na tamnom.
  - Dolje desno **tihi izbor proizvoda direktno na fotografiji** (v3.1; staklena ploča sa sličicama odbijena: „previše istaknuto, da se uklopi u pozadinu a da se opet može kliknuti“): tri tanke linije sa brojem i nazivom (01 Marame i tekstil / 02 Magneti / 03 Zimski dodaci), aktivna bijela i linija joj se puni cyan bojom (napredak smjene), ostale prigušene; iza tanke uspravne crte tihi link „Sve fotografije N“ (galerija počinje od proizvoda u izlogu). Do 1180 px link ide iznad linija. Telefon: kratki nazivi (Tekstil / Magneti / Zimski dodaci), linije preko cijele širine, galerija kao mala okrugla pilula gore desno na fotografiji.
  - Oznaka lokacije gore desno (šema gondole Poljice sa kabinom + „Polazna i izlazna stanica“) **uklonjena** na korisnikov zahtjev; gornji desni ugao je čist (na telefonu tu stoji samo mala pilula galerije).
  - Lijevo: nadnaslov, veliki naslov (do 78 px) „Ponesite dio / Jahorine / *sa sobom*“, uvod, vrste poklona u dvije kolone, dugmad kao u vijestima (cyan „Više o suvenirnici“ sa strelicom u udubljenom krugu + staklena pilula „Kako do nas“).
  - Ulazak: kadar `rise()`, fotografija izađe iz mraka, tekst se podiže odozdo, izbor uplovi odozdo, linije izbora se iscrtaju jedna za drugom, toplo svjetlo izloga gore desno.
  - Tablet: fotografija gore, izbor na njenoj donjoj ivici, tekst ispod. Telefon: isto.
  - Fotografije u `slike/`: `suvenirnica-glavna` (marama), `-1` (magneti, uspravna 1334×2000), `-2` (vitrina), svaka puna + `-1000` (srcset).
- **Vezano za WordPress (isto od v1):** `wp/v2/pages?slug=suvenirnica` → nadnaslov = naslov stranice, h2 = prvi h1–h4 (kraj „sa sobom“ iscrtan), uvod = prva rečenica prvog pasusa, link stranice, galerija = 3 fotografije izloga + sve `<img>` iz teksta stranice (najveća do 2048 iz srcset-a, i data-src; bez ikona i duplikata), a ako ih nema → `media?parent=<id>`. qTranslate i `/en/wp-json` kao u vijestima. Ugrađeni tekst = tekst stranice od 8. 10. 2026 (EN moj prevod); bez odgovora ostaje on, admin vidi razlog narandžasto.
- GA: `suvenirnica_klik` (`cilj`: stranica | mapa), `suvenirnica_galerija`.
- **Otvoreno pitati korisnika:** tačan URL stranice (slug); radno vrijeme (nije na stranici); tačan Google Maps link; da li nove 3 fotografije dodati i u karusel na WP stranici (onda ih iz galerije koda izbaciti da se ne dupliraju); screenshot `…/wp-json/wp/v2/pages?slug=suvenirnica`.
- **Sljedeće:** korisnik postavlja red na HERO TEST ispod ratraka (Elementor kontejner padding/margin/gap 0) → screenshot računar + telefon.

### 4. Olimpijski bar — v1 „meni na stolu“, PREGLED čeka korisnikov komentar (8. 10. 2026)
- Kod: `jahorina-home-sections/bar/bar.js` (prefiks `jb-`, `#jb-bar`; meni preko ekrana `#jb-meni`; video `#jb-vid`), test `test-bar.js` (Playwright, lažni WP REST odgovori za stranicu i Medije), red za widget iz `napravi-widget.py` (još NIJE napravljen: tek kad korisnik odobri izgled), pregled `pregled/napravi-pregled.py` (suvenirnica iznad) → artifact https://claude.ai/artifact/Px9Q9Mcqgp8Cdom8hctLYD.
- **Od korisnika:** WP stranica https://www.oc-jahorina.com/olimpijski-bar/ (screenshot: Betheme naslov, 3 pasusa, YouTube video, karusel fotografija), video https://www.youtube.com/watch?v=7qo0-fAx5CI, 3 fotografije (rižoto + vino na podmetaču „Hospitality is part of skiing“, losos, enterijer uspravno), meni PDF `Cjenovnik_Olimp_Bar_A4.pdf` (12 strana, SR+EN na istoj strani, KM). Tražio: „da se u ovoj sekciji mogu listati meniji kao da se lista fizički meni“.
- **Izgled (jezik hero-a, svoj detalj):** fotografija rižota je pozadina kadra (blaža noćna obrada, topla svjetlost ostaje; na širokim ekranima pomjerena udesno: `left:max(8%, --side − 140px)`), lijevo nadnaslov „Hrana i après-ski“, naslov „Olimpijski / *bar*“, uvod, tri broja tipografski (1.879 m · 700 m² · 40+, jedinica cyan, tanke crte, bez pločica), dugmad kao u ratraku (bijelo „Prelistaj meni“ + stakleno „Pogledaj video“), tihi link „Više o Olimpijskom baru →“. Desno **pravi meni u 3D** (korica, debljina strana desno, sjenka); na mišu/fokusu se korica odškrine i pokaže prvu stranu; poslije ulaska se korica jednom sama odškrine. Natpis ispod: „Meni · 12 strana“. Tablet/telefon: fotografija gore sa menijem desno na njoj, tekst ispod.
- **Meni preko cijelog ekrana:** iza je zamućen enterijer bara. Računar: otvorena knjiga (dvije strane), meni „doleti“ sa mjesta u kadru i korica se sama otvori (02–03). Telefon (< 820 px): jedna strana. **List se savija u dva dijela** dok se okreće (spoljni dio prednjači), svjetlo/sjenka na listu, sjenka na stranama ispod, pregib uz povez, rubovi preostalih strana. Prevlačenje mišem/prstom (preko trećine ili brzo = okrene, inače se vrati), klik na stranu, strelice, tastatura (←/→, PageUp/Down, Home/End, Esc), ugao strane se podigne na mišu. „Uvećaj“ (pilula sa natpisom; telefon samo ikona) prikazuje vidljive strane u punoj veličini (telefon 230 %, skrol i štipanje). Uputa „Kliknite ili prevucite stranu“ gore u sredini (samo računar), nestaje poslije prvog okreta. Brojač „02–03 / 12“ sa cyan linijom napretka.
- **Video:** YouTube (`youtube-nocookie`) preko ekrana tek na klik; iframe se uklanja pri zatvaranju. U artifact pregledu dugme otvara YouTube u novoj kartici (artifact ne smije ugraditi YouTube).
- **Vezano za WordPress:** `wp/v2/pages?slug=olimpijski-bar` → naslov = naslov stranice, uvod = prva rečenica prvog pasusa (tačka u „1.879“ ne prekida rečenicu), brojevi iz teksta (regex: metara/m², „više od N događaja“; ako ih nema, red se sakrije), video = prvi YouTube link/ugradnja na stranici (i Elementor `data-settings` sa `\/`), link stranice. **Meni iz Medija:** `wp/v2/media?search=meni-bar` → slike `meni-bar-01`, `meni-bar-02` … (broj = strana; za isti broj najnovija; WP veličina 1100–1800 px ako je original veći; korica u kadru iz `medium_large`). Bez njih: ugrađeni meni iz `bar/slike/meni/` (12 WebP strana 1240×1742 iz PDF-a + `mala-01/02` 560 px za kadar). Ugrađeni tekst = tekst stranice 8. 10. 2026 (EN moj prevod). Admin vidi razlog narandžasto (npr. „meni u Medijima (meni-bar-01, -02 …)“).
- Podešavanja na `<div id="jb-bar">`: `data-stranica`, `data-video`, `data-meni="url1, url2"`.
- GA: `bar_meni` (`strana`: broj strana), `bar_video`, `bar_klik` (`cilj`: stranica).
- Fotografije u `bar/slike/`: `bar-glavna` (rižoto, 2000 + `-1000`), `bar-enterijer` (900 px, samo zamućena pozadina menija). Losos nije iskorišten (može u galeriju ako korisnik želi).
- **Za korisnika kad odobri:** u WordPress Medije postaviti 12 strana menija sa imenima `meni-bar-01.webp` … `meni-bar-12.webp` (iste kao u `bar/slike/meni/`); kad se cijene promijene, dodaju se nove slike istih imena. Radno vrijeme i rezervacija nisu poslani (zato nema statusa „Otvoreno sada“ ni dugmeta za rezervaciju).
- **Sljedeće:** korisnikov komentar na pregled → doterivanje → `python3 napravi-widget.py` → red za HTML widget na HERO TEST ispod suvenirnice (Elementor kontejner padding/margin/gap 0).

### Sljedeće sekcije
- Događaji → Uživaj i van staze → Planina u brojkama → Pratite Jahorinu, plus Danas na Jahorini iznad vijesti. Korisnik bira kojom se nastavlja.
- Događaji: na sajtu je **The Events Calendar** (Elementor widget "Events Loop", sada „Trenutno nema događaja...“), pa podatke čitati iz njega (REST `/wp-json/tribe/events/v1/events`), ne ručno.

### Kako započeti novu sekciju (nova sesija)
1. Pročitati `STANJE-PROJEKTA.md` i `jahorina-home-sections/TEMA.md`.
2. Pogledati izgled te sekcije u `jahorina-home-sections/index.src.html`.
3. Od korisnika tražiti screenshotove kako je sekcija sada napravljena (Elementor/BeBuilder/widget, kategorija/izvor podataka).
4. Prvo pregled (artifact samo sa sekcijom), pa doterivanje po korisnikovim komentarima, pa tek onda red za Elementor i postavljanje na HERO TEST.

## Grane
- Najnoviji rad (vijesti, ratrak, suvenirnica, bar, ovaj fajl): grana **`claude/nifty-dirac-x85zte`** (nastala iz `claude/compassionate-albattani-u02lab` + Olimpijski bar). Nova sesija čita odavde i nastavlja na svojoj grani napravljenoj od ove.
- Redovi za Elementor pokazuju na tačan commit na jsDelivr-u, pa rade bez obzira na granu.

## Linkovi
- Repo: https://github.com/NjegosAnalyst/Webpage (grana `main`, javan)
- Pregled vijesti (artifact): https://claude.ai/artifact/YVHQy2joUTm9avVS1mP3Wv
- Društvene mreže: FB https://www.facebook.com/JahorinaOC/?locale=sr_RS · YT https://www.youtube.com/@jahorinaoc · IG https://www.instagram.com/jahorina/ · TikTok https://www.tiktok.com/@jahorinaoc
