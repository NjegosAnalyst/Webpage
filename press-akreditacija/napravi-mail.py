#!/usr/bin/env python3
"""Pravi HTML mailove za CF7: mail-marketing.html (Mail 1) i mail-potvrda-sr/en.html (Mail 2).
Svaki red tabele je u svojoj liniji: u CF7 uključiti "Exclude lines with blank mail-tags",
pa redovi bez podataka (novinar 2 i 3, snimatelj) ne ulaze u mail."""
import pathlib
D = pathlib.Path(__file__).parent


def red(k, v):
    return (f'<tr><td style="padding:8px 12px 8px 0;color:#5b6b82;font-size:13px;vertical-align:top;width:170px">{k}</td>'
            f'<td style="padding:8px 0;color:#0A1120;font-size:15px;vertical-align:top">{v}</td></tr>\n')


def blok(n, rows):
    return (f'<tr><td colspan="2" style="padding:22px 0 6px;font:700 13px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#0089B8;border-bottom:1px solid #e3e9f0">{n}</td></tr>\n'
            + ''.join(red(*r) for r in rows))


VRH = ('<div style="background:#eef2f6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">\n'
       '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">\n'
       '<tr><td style="background:#0A1120;padding:22px 26px;color:#fff"><div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7fdcff">')
DNO = '</td></tr>\n</table>\n</div>\n'


def dodatni(n):
    return (f'Novinar {n}', f'<b>[nov{n}-ime]</b> [nov{n}-funkcija] · [nov{n}-mobilni] · <a href="mailto:[nov{n}-email]">[nov{n}-email]</a>')


m1 = (VRH + 'Press akreditacija · otvaranje 2026/27</div>'
      '<div style="font-size:22px;font-weight:bold;margin-top:6px">[medij-naziv]</div>'
      '<div style="font-size:14px;color:#b9c6d8;margin-top:4px">[medij-vrsta] · [medij-grad], [medij-drzava] · prijava #[_serial_number] · [_date] [_time] · [jezik]</div></td></tr>\n'
      '<tr><td style="padding:6px 26px 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif">\n'
      + blok('Odabrani nastupi', [('Nastupi', '<b>[nastupi]</b>')])
      + blok('Medij', [('Naziv', '[medij-naziv]'), ('Vrsta', '[medij-vrsta]'), ('Država / grad', '[medij-drzava], [medij-grad]'),
                       ('Email redakcije', '<a href="mailto:[medij-email]">[medij-email]</a>'), ('Telefon redakcije', '[medij-telefon]'),
                       ('Link', '<a href="[medij-link]">[medij-link]</a>')])
      + blok('Novinari', [('Ime i prezime', '<b>[nov-ime]</b>'), ('Funkcija', '[nov-funkcija]'), ('Mobilni', '[nov-mobilni]'),
                          ('Email', '<a href="mailto:[nov-email]">[nov-email]</a>'), dodatni(2), dodatni(3)])
      + blok('Snimatelj / fotograf', [('Ime i prezime', '[sni-ime]'), ('Funkcija', '[sni-funkcija]'), ('Mobilni', '[sni-mobilni]'), ('Email', '[sni-email]')])
      + blok('Posebne potrebe', [('Izbor', '[potrebe-izbor]'), ('Detalji', '[potrebe]')])
      + '</table>\n<p style="margin:22px 0 0;font-size:13px;color:#5b6b82">Prijava je upisana u tabelu „Press akreditacije – otvaranje 2026/27” i u WordPress (Flamingo). Odgovor na ovaj mail ide na email redakcije.</p>' + DNO)
(D / 'mail-marketing.html').write_text(m1, encoding='utf-8')

T = {
    'sr': dict(k='Press akreditacija · otvaranje sezone 2026/27', h='Primili smo vašu prijavu', p1='Poštovani/a [nov-ime],',
               p2='hvala na prijavi za press akreditaciju za otvaranje zimske sezone 2026/27 na Olimpijskoj planini Jahorina. Ovo je automatska potvrda da je prijava stigla. <b>Prijava još ne znači da je akreditacija odobrena</b> – broj mjesta je ograničen, a o odobrenju obavještavamo redakciju putem emaila.',
               s='Sažetak prijave',
               rows=[('Medij', '[medij-naziv] ([medij-vrsta])'), ('Novinar', '[nov-ime]'), ('Novinar 2', '[nov2-ime]'), ('Novinar 3', '[nov3-ime]'),
                     ('Snimatelj / fotograf', '[sni-ime]'), ('Nastupi', '[_raw_nastupi]'), ('Broj prijave', '#[_serial_number]')],
               p3='Ako želite nešto da izmijenite, odgovorite na ovaj mail.',
               pot='Srdačan pozdrav,<br>Marketing · Olimpijski centar Jahorina<br><a href="https://www.oc-jahorina.com" style="color:#0089B8">www.oc-jahorina.com</a>'),
    'en': dict(k='Press accreditation · 2026/27 season opening', h='We have received your application', p1='Dear [nov-ime],',
               p2='thank you for applying for press accreditation for the opening of the 2026/27 winter season at Olympic Mountain Jahorina. This is an automatic confirmation that your application has arrived. <b>It does not yet mean that the accreditation is approved</b> – places are limited and we will inform the newsroom about approval by email.',
               s='Application summary',
               rows=[('Media outlet', '[medij-naziv] ([_raw_medij-vrsta])'), ('Journalist', '[nov-ime]'), ('Journalist 2', '[nov2-ime]'), ('Journalist 3', '[nov3-ime]'),
                     ('Camera / photo', '[sni-ime]'), ('Performances', '[_raw_nastupi]'), ('Application no.', '#[_serial_number]')],
               p3='If you need to change anything, simply reply to this email.',
               pot='Kind regards,<br>Marketing · Olympic Centre Jahorina<br><a href="https://www.oc-jahorina.com/en/" style="color:#0089B8">www.oc-jahorina.com</a>'),
}
for j, t in T.items():
    m = (VRH + t['k'] + '</div><div style="font-size:22px;font-weight:bold;margin-top:6px">' + t['h'] + '</div></td></tr>\n'
         '<tr><td style="padding:24px 26px 28px;color:#0A1120;font-size:15px;line-height:1.6">\n'
         f'<p style="margin:0 0 12px">{t["p1"]}</p>\n<p style="margin:0 0 18px">{t["p2"]}</p>\n'
         '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;border-radius:10px;padding:6px 14px">\n'
         f'<tr><td colspan="2" style="padding:10px 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#0089B8;font-weight:bold">{t["s"]}</td></tr>\n'
         + ''.join(red(*r) for r in t['rows']) + '</table>\n'
         f'<p style="margin:18px 0 0">{t["p3"]}</p>\n<p style="margin:18px 0 0;color:#5b6b82;font-size:14px">{t["pot"]}</p>\n' + DNO)
    (D / f'mail-potvrda-{j}.html').write_text(m, encoding='utf-8')
print('mail-marketing.html, mail-potvrda-sr.html, mail-potvrda-en.html')
