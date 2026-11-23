#!/usr/bin/env python3
"""Sklapa sadržaj WP stranice (qTranslate [:SH]…[:en]…[:]) i lokalni pregled.

Upotreba:
  python3 napravi-stranicu.py --css-url URL --css-sri SHA --sr ID --en ID   -> stranica.txt
  python3 napravi-stranicu.py --pregled                                      -> pregled.html (lokalno)
Sadržaj je u jednom redu po bloku (wpautop ne ubacuje <p>/<br>).
"""
import argparse, html, re, pathlib

D = pathlib.Path(__file__).parent
TBD = '<span class="jpa-tbd">{}</span>'

NASTUPI = [  # ime (redovi), datum ISO, plakat datum, SR dan, EN dan, oznaka, slika, inicijal
    (('Željko', 'Joksimović'), '2026-11-27', '27 NOV 2026', 'Petak', 'Friday', '', 'joksimovic.jpg', 'Ž'),
    (('Aco', 'Pejović'), '2026-11-27', '27 NOV 2026', 'Petak', 'Friday', '', 'pejovic.jpg', 'A'),
    (('Nikola', 'Rokvić'), '2026-11-28', '28 NOV 2026', 'Subota', 'Saturday', '', 'rokvic.jpg', 'R'),
    (('Naomi', 'Campbell'), '2026-11-28', '28 NOV 2026', 'Subota', 'Saturday', 'DJ set', 'campbell.jpg', 'N'),
]

T = {
 'SR': dict(
  kicker='Ski opening · Jahorina 2026/27',
  h2=('Press', 'akreditacija'), sub='Otvaranje zimske sezone 2026/27',
  lead='Akreditacije za predstavnike medija (novinare, snimatelje i fotografe) realizuju se putem ovog formulara.',
  cta='Prijavi se',
  facts=[('Prijave do', '26. 11. do 12h'), ('Preuzimanje akreditacija', '27. 11. do 14h, kancelarije Olimpijskog centra Jahorina')],
  nastupi_h='Nastupi',
  pravila_h='Pravila',
  pravila=[
   'Broj mjesta je ograničen. Prijava ne garantuje akreditaciju.',
  ],
  forma_h='Prijava',
  kontakt='Pitanja: <a href="mailto:marketing@oc-jahorina.com">marketing@oc-jahorina.com</a>',
 ),
 'EN': dict(
  kicker='Ski opening · Jahorina 2026/27',
  h2=('Press', 'accreditation'), sub='2026/27 winter season opening',
  lead='Accreditation for media representatives (journalists, camera operators and photographers) is handled through this form.',
  cta='Apply',
  facts=[('Apply by', '26 Nov, 12:00'), ('Badge pick-up', '27 Nov by 14:00, Olympic Centre Jahorina offices')],
  nastupi_h='Performances',
  pravila_h='Rules',
  pravila=[
   'Places are limited. Applying does not guarantee accreditation.',
  ],
  forma_h='Application',
  kontakt='Questions: <a href="mailto:marketing@oc-jahorina.com">marketing@oc-jahorina.com</a>',
 ),
}

SLIKE_DIM = {'pejovic.jpg': (228, 620), 'joksimovic.jpg': (390, 1220), 'rokvic.jpg': (610, 1350), 'campbell.jpg': (455, 1350)}


def blok(j, forma, css_tag, slike):
    t = T[j]
    kartice = ''
    for ime, iso, dat, sr, en, tag, img, ini in NASTUPI:
        w, h = SLIKE_DIM[img]
        tg = f'<span class="jpa-tag">{tag}</span>' if tag else ''
        kartice += (f'<li class="jpa-card"><img src="{slike}{img}" alt="{" ".join(ime)}" width="{w}" height="{h}" loading="lazy" decoding="async">'
                    f'<span class="jpa-wm" aria-hidden="true">{ini}</span><div class="jpa-card-txt">{tg}'
                    f'<h4 class="jpa-name"><span>{ime[0]}</span> <span>{ime[1]}</span></h4><time datetime="{iso}">{dat}</time></div>'
                    '</li>')
    facts = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in t['facts'])
    pr = ''.join(f'<li>{p}</li>' for p in t['pravila'])
    return (css_tag
            + '<div class="jpa">'
            + f'<header class="jpa-intro"><div class="jpa-kicker">{t["kicker"]}</div>'
            + f'<h2 class="jpa-h2">{t["h2"][0]} <span>{t["h2"][1]}</span></h2><span class="jpa-sub">{t["sub"]}</span>'
            + f'<p class="jpa-lead">{t["lead"]}</p>'
            + f'<dl class="jpa-facts">{facts}</dl></header>'
            + f'<section class="jpa-sec"><h3 class="jpa-label">{t["nastupi_h"]}</h3><ul class="jpa-lineup">{kartice}</ul></section>'
            + f'<section class="jpa-sec jpa-rules" id="pravila"><h3 class="jpa-label">{t["pravila_h"]}</h3><ul>{pr}</ul></section>'
            + f'<section class="jpa-sec jpa-formwrap" id="prijava"><h3 class="jpa-label">{t["forma_h"]}</h3>{forma}</section>'
            + f'<p class="jpa-contact">{t["kontakt"]}</p>'
            + '</div>')


# ---------- lokalni pregled: CF7 oznake -> HTML kakav CF7 ispisuje ----------
def cf7_u_html(src):
    def opcije(s):
        return re.findall(r'"([^"]*)"', s)

    def kontrola(m):
        tip, ime, ostatak = m.group(1), m.group(2), m.group(3) or ''
        req = tip.endswith('*'); tip = tip.rstrip('*')
        idm = re.search(r'id:(\S+)', ostatak); idv = f' id="{idm.group(1)}"' if idm else ''
        ph = re.search(r'placeholder "([^"]*)"', ostatak)
        phv = f' placeholder="{html.escape(ph.group(1))}"' if ph else ''
        if tip == 'hidden':
            return f'<input type="hidden" name="{ime}">'
        if tip == 'submit':
            return f'<input class="wpcf7-form-control wpcf7-submit" type="submit" value="{opcije(ostatak)[0]}"><span class="wpcf7-spinner"></span>'
        if tip in ('text', 'email', 'tel', 'url'):
            return f'<span class="wpcf7-form-control-wrap"><input type="{tip}" name="{ime}"{idv}{phv} class="wpcf7-form-control"></span>'
        if tip == 'textarea':
            return f'<span class="wpcf7-form-control-wrap"><textarea name="{ime}"{idv}{phv} rows="4" class="wpcf7-form-control"></textarea></span>'
        if tip == 'select':
            o = opcije(re.sub(r'placeholder "[^"]*"', '', ostatak))
            return f'<span class="wpcf7-form-control-wrap"><select name="{ime}"{idv} class="wpcf7-form-control">' + ''.join(f'<option>{html.escape(x.split("|")[0])}</option>' for x in o) + '</select></span>'
        if tip == 'checkbox':
            o = opcije(ostatak)
            return (f'<span class="wpcf7-form-control-wrap"><span class="wpcf7-form-control wpcf7-checkbox">'
                    + ''.join(f'<span class="wpcf7-list-item"><label><input type="checkbox" name="{ime}[]" value="{html.escape(x.split("|")[0])}"><span class="wpcf7-list-item-label">{html.escape(x.split("|")[0])}</span></label></span>' for x in o)
                    + '</span></span>')
        return m.group(0)

    s = re.sub(r'\[acceptance (\S+)\](.*?)\[/acceptance\]',
               lambda m: f'<span class="wpcf7-form-control-wrap"><span class="wpcf7-form-control wpcf7-acceptance"><span class="wpcf7-list-item"><label><input type="checkbox" name="{m.group(1)}"><span class="wpcf7-list-item-label">{m.group(2)}</span></label></span></span></span>',
               src, flags=re.S)
    s = re.sub(r'\[(text\*?|email\*?|tel\*?|url\*?|textarea\*?|select\*?|checkbox\*?|hidden|submit)\s*([\w-]*)((?:\s+(?:"[^"]*"|[^\]\s"]+))*)\]', kontrola, s)
    return '<div class="wpcf7"><form class="wpcf7-form init" novalidate>' + s + '<div class="wpcf7-response-output" aria-hidden="true"></div></form></div>'


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--css-url'); a.add_argument('--css-sri')
    a.add_argument('--sr'); a.add_argument('--en')
    a.add_argument('--pregled', action='store_true'); a.add_argument('--slike', default='')
    a = a.parse_args()
    if a.pregled:
        css = '<link rel="stylesheet" href="press.css">'
        for j in ('SR', 'EN'):
            forma = cf7_u_html((D / f'forma-{j.lower()}.txt').read_text(encoding='utf-8'))
            stranica = ('<!doctype html><html lang="' + ('sr-Latn' if j == 'SR' else 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                        '<title>Press akreditacija – pregled</title><style>body{margin:0;background:#0A1120}</style></head><body><div id="Content">'
                        + blok(j, forma, css, 'slike/') + '</div></body></html>')
            (D / f'pregled-{j.lower()}.html').write_text(stranica, encoding='utf-8')
        print('pregled-sr.html, pregled-en.html')
        return
    css = f'<link rel="stylesheet" href="{a.css_url}" integrity="{a.css_sri}" crossorigin="anonymous">'
    sr = blok('SR', f'[contact-form-7 id="{a.sr}"]', css, a.slike)
    en = blok('EN', f'[contact-form-7 id="{a.en}"]', css, a.slike)
    (D / 'stranica-sr.txt').write_text(sr, encoding='utf-8')
    (D / 'stranica-en.txt').write_text(en, encoding='utf-8')
    (D / 'stranica.txt').write_text('[:SH]' + sr + '[:en]' + en + '[:]', encoding='utf-8')
    print('stranica.txt, stranica-sr.txt, stranica-en.txt')


if __name__ == '__main__':
    main()
