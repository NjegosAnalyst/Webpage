# Knjiga standarda OC Jahorina (vizuelni identitet i web)

Izvor: korisnikov PDF „Brand identitet OC Jahorina.pdf“ (Desktop, 2 strane; dobijen 2. 11. 2026).
PDF nije u repou (repo je javan). Ovo je sažetak; kad se nešto ne slaže sa `jahorina-home-sections/TEMA.md`,
**važi knjiga standarda**.

## Paleta

| Naziv | Hex | Uloga |
|---|---|---|
| Ponoćna plava | `#0B132B` | primarna tamna; zaglavlje, footer, naslovi i tekst na svijetlom |
| Tamna plava | `#1C2541` | sekcije, footer |
| Čelična plava | `#3A506B` | sekundarni tekst, linkovi na svijetlom |
| Ledena plava | `#5BC0DE` | akcenat i linkovi — **kao tekst samo na tamnom** |
| Krem | `#F4D6B0` | topla pozadina sekcije; tekst ispod naslova u naslovnom dijelu |
| Narandžasta | `#D97706` | CTA dugmad i promocije |
| Bijela | `#FFFFFF` | pozadina stranice (dodatna neutralna) |

CSS varijable (WordPress: Customizer → Additional CSS):

```css
:root {
  --ocj-ponoc: #0B132B;
  --ocj-tamna: #1C2541;
  --ocj-celik: #3A506B;
  --ocj-led: #5BC0DE;
  --ocj-krem: #F4D6B0;
  --ocj-narandzasta: #D97706;
  --ocj-bijela: #FFFFFF;
  --ocj-radijus: 12px;
  --ocj-font: 'Inter', Arial, sans-serif;
}
```

## Tipografija

- **Inter** za sve: naslovi Bold / SemiBold, podnaslovi i tekst Regular / Medium.
- Skala (računar): H1 56/64 Bold · H2 40/48 Bold · H3 28/36 SemiBold · H4 20/28 SemiBold ·
  osnovni tekst 16/26 Regular · sitan tekst i napomene 14/22 Regular.
- Telefon: H1 36/44, H2 30/38, ostalo isto.

## Dugmad

> **Korisnikova izmjena (2. 11. 2026) — važi prije knjige:** glavna dugmad („Kupi ski kartu“, „Pročitaj više“, „Više o …“)
> su **ledena plava `#5BC0DE` sa tamnim tekstom `#0B132B`** (kontrast 8,8:1), ne narandžasta. Bijeli tekst na ledenoj nije
> dozvoljen (2,1:1). Narandžasta ostaje samo za promocije, ako zatreba.


- Visina 48 px, radijus 12 px, Inter SemiBold 16 px.
- **Primarno: narandžasto, jedno po ekranu**; tekst na narandžastoj je **uvijek taman** (bijeli nije dozvoljen).
- Sekundarno: obrub (na svijetlom tamni, na tamnom ledeni), neaktivno sivo („Rasprodato“), tekstualni link podvučen („Saznaj više“).
- Naslovni dio (primjer iz knjige): naslov bijel, tekst krem, jedno dugme uvijek narandžasto.

## Razmaci, oblici, ekrani

- Razmaci u koracima od 8 px; radijus dugmadi i polja 12 px; radijus kartica 20 px; sadržaj najviše 1200 px.
- Tačke prelaza: 1280, 768 i 390 px; dugmad na telefonu preko pune širine; logo najmanje 120 px; dodir najmanje 44 px.

## Pristupačnost i slike

- Kontrast teksta najmanje 4,5:1; ledena plava kao tekst samo na tamnom; svaka slika ima alt.
- Prave fotografije staza i planine; bijeli tekst preko slike samo na tamnom sloju; WebP ili JPG;
  znak ili logo se ne stavlja preko šarenih detalja.

## Logo i ikone

- Primarni logo: znak (planina u krugu) + „Jahorina / Olimpijski centar“; bijela verzija za tamne pozadine,
  tamna na bijeloj i krem. Znak sam: na ponoćnoj, bijeloj, narandžastoj i ledenoj.
- Ikone: tanka linija (pahulja, planina, žičara, ski karta, sunce, skije, oblak sa snijegom, kesa).

## Razlike u odnosu na ono što je sada na sajtu (2. 11. 2026)

| | Knjiga standarda | Sajt sada (hero, sekcije, header, galerije) |
|---|---|---|
| Font | Inter | Archivo (naslovi) + Barlow (tekst) |
| Akcenat | ledena `#5BC0DE` | cyan `#00B9F2` |
| Primarno dugme | narandžasto `#D97706`, taman tekst | cyan prelaz, bijeli tekst |
| Tamna pozadina | `#0B132B` / `#1C2541` | `#0A1120` / `#111A2C` (vrlo blizu) |
| Krem | tekst u naslovnom dijelu, topla pozadina | ne koristi se |
| Radijus | dugmad 12, kartice 20 | dugmad 16, kadrovi 24–30 |
| Tačke prelaza | 1280 / 768 / 390 | 760 / 860 / 980 / 1060 |
| Širina sadržaja | 1200 | 1240 |
