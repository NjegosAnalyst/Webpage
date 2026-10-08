# Tema sekcija početne (ispod hero-a)

Pravila izgleda i gradnje za svaku novu sekciju početne. Uzor je hero (`jahorina-hero-v2/`), a
gotov primjer u kodu je blok vijesti (`vijesti/vijesti.js`). Odatle se kopiraju tokeni i obrasci,
da sve sekcije izgledaju kao jedna cjelina.

## Šta korisnik voli, a šta ne
- Noćna atmosfera Jahorine, tamne površine i **jedan akcenat: cyan `#00B9F2`**. Narandžasta `#FFB547` služi samo za upozorenja/obavještenja.
- **Premium, moderno, minimalistički.** Bez dupliranja informacija, po jedan istaknuti element po sekciji.
- **Neumorfizam blag i suptilan** (korisnik je tražio da dugmad budu tiša). Ne pojačavati sjenke i sjaj.
- Suptilni, realni detalji (npr. zvijezde u hero-u). Animacije kratke, jednom, bez pretjerivanja.
- Odbijeno: neumorfni redizajn v3, mraz, pahulje, skijaš, pomjeranje/savijanje cijele fotografije (Ken Burns, 3D dubina),
  isječak vozila bez pozadine u nacrtanoj/animiranoj sceni (ratrak v1), običan raspored „fotografije lijevo + tekst desno
  na ravnoj pozadini“ (ratrak v2, „jednostavno“). **Premium = jezik hero-a:** uokvireni kadar sa fotografijom, scrim
  prelazi, veliki naslov sa iscrtanom zadnjom riječi, stakleni panel sa pločicama, dugmad kao u hero-u (uzor: `ratrak/ratrak.js`).
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
- **Kadar preko cijele širine (od vijesti i ratraka):** rub `--g:clamp(14px,1.6vw,22px)` kao kadar hero-a, sadržaj uvučen `--in` na mrežu 1240px (računa se iz `100cqw`, rezerva `100vw`).
- **Ritam između blokova:** `--gap:clamp(56px,7vw,100px)`. Blok ispod ima gore `--gap/2 + --g`, blok iznad dole `--gap/2`, pa je razmak kadar→kadar isti kao hero→vijesti (`--g + --gap`).
- Zaobljenja: kartice 28–30px, dugmad pilule 40px, pločice 11–13px.

## Obrasci (gotovi u `vijesti.js`)
- **Nadnaslov (eyebrow):** cyan crtica sa sjajem + `VIJESTI` (Archivo 600, 12px, razmak slova 3px).
- **Naslov sekcije h2:** Archivo 800, `clamp(34px,4.4vw,58px)`. Drugi dio naslova **iscrtan samo linijom**, kao „Jahorine“ u hero-u: `Obavještenja <span>i vijesti</span>`.
- **Sporedni link** („Sve vijesti →“): tamna neumorfna pilula (`.jv-more`).
- **Glavno dugme** („Pročitaj više“): blago ispupčeno cyan dugme sa strelicom u plitkom udubljenom krugu (`.jv-cta`, `.jv-cta__ico`).
- **Kontrole:** tihi providni panel (`.jv-bar`), pločice u plitkom žlijebu sa aktivnom utisnutom (cyan broj + tanka cyan linija) (`.jv-step`), okrugla dugmad (`.jv-btn`).
- **Fotografije:** uvijek ista blaga noćna obrada: `filter: saturate(.7) brightness(.84) contrast(1.06)` + plavi sloj `mix-blend-mode: soft-light` (`.jv-tint`), plus tamni prelaz ispod teksta.
- **Oznaka (chip):** mala pilula, velika slova. Koristiti samo kad nosi informaciju (npr. samo „Obavještenje“).
- **Telefon:** fotografija gore, tekst ispod na tamnoj površini, sporedni link ispod sadržaja.
- **Prelaz između blokova (bez linija, talasa i dijagonala):** čist tamni razmak (`--gap`), a događaj nosi blok koji ulazi:
  - *Dolazak kadra* (`rise()` u `ratrak.js`): dok kadar ulazi u ekran, iz `scale(.94)` (telefon .97, `transform-origin` gore) „sjedne“ na svoje mjesto.
  - *Meko svjetlo iz fotografije* samo tamo gdje je izvor svjetla (ratrak: zalazak iznad sunca, `.jr-bloom` radijalni prelaz) + tanak topli odsjaj na gornjoj ivici kadra; pali se tek kad se kadar pojavi i jača sa dolaskom.
  - **Odbijeno (korisnik: „nije premium“):** svjetlo preko cijele širine iza kadrova (izgleda kao obojene trake: plava ispod vijesti, žuta iznad ratraka, smeđa ispod), tamnjenje kadra koji odlazi (izgleda prljavo). Ne koristiti ni „lijepljenje“ kartica (sticky), jak parallax, CSS `animation-timeline` (omotači sa overflow:hidden ga mogu zaglaviti).
- **Pločice sa podacima:** sve iste (bez pune cyan pločice koja liči na dugme; istaknuta vrijednost samo cyan brojem i tankim cyan rubom); ikona 18px, vrijednost Archivo 700 17px, natpis 9px; natpis ima mjesto za dva reda da sve vrijednosti stoje na istoj liniji.
- **Dugmad u paru:** ista širina i visina (44px, telefon 42px), isti font (Barlow 600 13.5px, telefon 13px), ikona uvijek ispred teksta; red dugmadi širok tačno kao panel sa pločicama iznad (ivice poravnate); bijelo glavno + stakleno sporedno sa tankim rubom. Na telefonu kratki natpisi („Rezerviši mailom“, „Pozovi“) da oba stanu u jedan red; na uskim telefonima jedno ispod drugog.
- **Tema ista, detalji različiti** (korisnik kod suvenirnice): svaki blok dijeli kadar, tokene, nadnaslov, naslov sa iscrtanim krajem i neumorfne površine, ali ima svoj glavni detalj i raspored — ne kopirati raspored drugog bloka ni „u ogledalu“. Vijesti: slajder. Ratrak: fotografija kao pozadina kadra + pločice + bijelo/stakleno dugme. Suvenirnica: izlog (proizvodi se smjenjuju u pozadini kadra) + tihi izbor (tanke linije sa brojem i nazivom, direktno na fotografiji) + oznaka lokacije sa šemom gondole + dugmad iz vijesti.
- **Premium = fotografija u pozadini kadra** (korisnik je odbio tamnu pozadinu sa karticama: „prejednostavno“). Detalji koji podižu utisak: meki prelaz iz zamućenog u oštro, veliki naslov, brojevi 01–03, linija napretka. Kontrole preko fotografije neka budu tihe i uklopljene (bez kutija), a da se jasno mogu kliknuti — korisnik je odbio istaknutu staklenu ploču sa sličicama.
- **Topli ton samo iz izvora svjetla:** zalazak u ratraku, svjetlo izloga gore desno u suvenirnici. Ostalo je noćna obrada.
- **Sadržaj sa WordPress stranice** (suvenirnica): ugrađeni tekst = trenutni tekst stranice, pa se blok odmah crta (bez kostura) i zamijeni samo ako se tekst u WP-u promijeni; tehnički razlog vidi samo prijavljeni admin.
- **Stil se uvijek osvježi** (`st.textContent = CSS` i kad `<style>` već postoji): Elementor editor ne učitava stranicu ponovo kad se widget izmijeni, pa bi inače ostao stil stare verzije.

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
