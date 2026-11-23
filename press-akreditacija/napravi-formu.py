#!/usr/bin/env python3
"""Pravi CF7 šablone forma-sr.txt i forma-en.txt iz jednog izvora.
Vrijednosti poslije | (pipe) su iste u oba jezika -> mail i tabela imaju iste nazive."""
import pathlib
D = pathlib.Path(__file__).parent

# izvođač, SR natpis, EN natpis, vrijednost za mail/tabelu
NASTUPI = [
    ('Željko Joksimović · 27. 11.', 'Željko Joksimović · 27 Nov', 'Željko Joksimović (27. 11.)'),
    ('Aco Pejović · 27. 11.', 'Aco Pejović · 27 Nov', 'Aco Pejović (27. 11.)'),
    ('Nikola Rokvić · 28. 11.', 'Nikola Rokvić · 28 Nov', 'Nikola Rokvić (28. 11.)'),
    ('Naomi Campbell · 28. 11.', 'Naomi Campbell · 28 Nov', 'Naomi Campbell DJ set (28. 11.)'),
]
VRSTE = [('TV', 'TV'), ('Radio', 'Radio'), ('Štampa', 'Print'), ('Internet portal', 'Online portal'),
         ('Novinska agencija', 'News agency'), ('Fotograf / freelance', 'Photographer / freelance')]
POTREBE = [('Parking za vozilo medija', 'Parking for the media vehicle', 'Parking'),
           ('Pozicija za kameru ili stativ', 'Camera or tripod position', 'Pozicija za kameru'),
           ('Zahtjev za intervju', 'Interview request', 'Intervju')]

T = {
 'sr': dict(
  s1=('Medij', ''),
  naziv='Naziv medija', naziv_ph='', vrsta='Vrsta medija', izaberi='Izaberite',
  link='Link na medij', drzava='Država', drzava_ph='', grad='Grad', grad_ph='',
  memail='Službeni email redakcije', memail_ph='', memail_hint='Na nju šaljemo odgovor.',
  mtel='Telefon redakcije', urednik='Urednik koji odobrava prijavu', urednik_ph='',
  s2=('Novinar', ''),
  ime='Ime i prezime', funk='Funkcija', funk_ph='', mob='Mobilni telefon', email='Email',
  karta='Broj lične ili press kartice',
  s3=('Snimatelj / fotograf', 'opciono'), dodaj='Dodaj snimatelja ili fotografa', dodaj_nov='Dodaj još jednog novinara',
  sfunk_ph='',
  s4=('Nastupi', ''),
  s5=('Posebne potrebe', 'opciono'), detalji='Detalji',
  detalji_ph='',
  s6=('Saglasnost', ''),
  sagl='Saglasan/na sam sa obradom ličnih podataka u skladu sa <a href="https://www.oc-jahorina.com/politika-privatnosti/" target="_blank" rel="noopener">politikom privatnosti</a>.',
  prav='Prihvatam pravila akreditacije.',
  posalji='Pošalji prijavu',
  legal='Zaštićeno reCAPTCHA sistemom, važe Googleova <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">pravila privatnosti</a> i <a href="https://policies.google.com/terms" target="_blank" rel="noopener">uslovi korišćenja</a>.',
 ),
 'en': dict(
  s1=('Media outlet', ''),
  naziv='Media outlet name', naziv_ph='', vrsta='Media type', izaberi='Select',
  link='Website of the outlet', drzava='Country', drzava_ph='', grad='City', grad_ph='',
  memail='Official newsroom email', memail_ph='', memail_hint='We reply to this address.',
  mtel='Newsroom phone', urednik='Approving editor', urednik_ph='',
  s2=('Journalist', ''),
  ime='Full name', funk='Position', funk_ph='', mob='Mobile phone', email='Email',
  karta='ID or press card number',
  s3=('Camera / photographer', 'optional'), dodaj='Add a camera operator or photographer', dodaj_nov='Add another journalist',
  sfunk_ph='',
  s4=('Performances', ''),
  s5=('Special requests', 'optional'), detalji='Details',
  detalji_ph='',
  s6=('Consent', ''),
  sagl='I agree to the processing of my personal data in line with the <a href="https://www.oc-jahorina.com/en/politika-privatnosti/" target="_blank" rel="noopener">privacy policy</a>.',
  prav='I accept the accreditation rules.',
  posalji='Send application',
  legal='Protected by reCAPTCHA; the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a> apply.',
 ),
}


def napravi(j):
    t = T[j]
    en = j == 'en'
    R = ' <b>*</b>'

    def polje(naziv, oznaka, wide=False, hint=''):
        oznaka = oznaka.replace(' placeholder ""', '')
        tip, ime, *ostalo = oznaka.split(' ', 2)
        idv = 'jpa-' + ime
        # CF7: sve opcije (id:, autocomplete:, placeholder) moraju biti ispred vrijednosti u navodnicima
        oznaka = ' '.join([tip, ime, f'id:{idv}'] + ostalo)
        h = f'<span class="jpa-hint">{hint}</span>' if hint else ''
        return f'<div class="jpa-f{" jpa-f--wide" if wide else ""}"><label for="{idv}">{naziv}</label>[{oznaka}]{h}</div>'

    def korak(n, naslov, opis, tijelo, klasa='', req=False):
        o = f' <span class="jpa-opt">{opis}</span>' if opis else ''
        return (f'<div class="jpa-step{klasa}" role="group" aria-labelledby="jpa-k{n}"><div class="jpa-side">'
                f'<h4 id="jpa-k{n}">{naslov}{o}</h4></div>\n<div class="jpa-body">\n{tijelo}\n</div></div>\n')

    vr = ' '.join(f'"{(e if en else s)}|{s}"' if en else f'"{s}"' for s, e in VRSTE)
    g1 = '\n'.join([
        polje(t['naziv'] + R, f'text* medij-naziv autocomplete:organization placeholder "{t["naziv_ph"]}"', True),
        polje(t['vrsta'] + R, f'select* medij-vrsta first_as_label "{t["izaberi"]}" {vr}'),
        polje(t['link'] + R, 'url* medij-link placeholder "https://"'),
        polje(t['drzava'] + R, f'text* medij-drzava autocomplete:country-name placeholder "{t["drzava_ph"]}"'),
        polje(t['grad'] + R, f'text* medij-grad autocomplete:address-level2 placeholder "{t["grad_ph"]}"'),
        polje(t['memail'] + R, f'email* medij-email placeholder "{t["memail_ph"]}"', hint=t['memail_hint']),
        polje(t['mtel'] + R, 'tel* medij-telefon placeholder "+387 …"'),
    ])
    g2 = '\n'.join([
        polje(t['ime'] + R, 'text* nov-ime autocomplete:name'),
        polje(t['funk'] + R, f'text* nov-funkcija placeholder "{t["funk_ph"]}"'),
        polje(t['mob'] + R, 'tel* nov-mobilni autocomplete:tel placeholder "+387 6…"'),
        polje(t['email'] + R, 'email* nov-email autocomplete:email'),
    ])
    g3 = '\n'.join([
        polje(t['ime'], 'text sni-ime'),
        polje(t['funk'], f'text sni-funkcija placeholder "{t["sfunk_ph"]}"'),
        polje(t['mob'], 'tel sni-mobilni placeholder "+387 6…"'),
        polje(t['email'], 'email sni-email'),
    ])
    # dodatni novinari (2 i 3): otvaraju se jedan u drugom, bez skripte
    def dodatni(n, unutra=''):
        g = '\n'.join([
            polje(t['ime'], f'text nov{n}-ime'),
            polje(t['funk'], f'text nov{n}-funkcija'),
            polje(t['mob'], f'tel nov{n}-mobilni placeholder "+387 6…"'),
            polje(t['email'], f'email nov{n}-email'),
        ])
        naslov = ('Journalist ' if en else 'Novinar ') + str(n)
        return (f'<details class="jpa-more jpa-add"><summary><span class="jpa-zat">{t["dodaj_nov"]}</span>'
                f'<span class="jpa-otv">{naslov}</span></summary>\n<div class="jpa-grid">\n{g}\n</div>\n{unutra}</details>\n')

    nas = ' '.join(f'"{(e if en else s)}|{v}"' for s, e, v in NASTUPI)
    pot = ' '.join(f'"{(e if en else s)}|{v}"' for s, e, v in POTREBE)
    out = (
        korak(1, *t['s1'], f'<div class="jpa-grid">\n{g1}\n</div>')
        + korak(2, *t['s2'], f'<div class="jpa-grid">\n{g2}\n</div>\n' + dodatni(2, dodatni(3)).rstrip('\n'))
        + korak(3, *t['s3'], f'<details class="jpa-more"><summary>{t["dodaj"]}</summary>\n<div class="jpa-grid">\n{g3}\n</div>\n</details>')
        + korak(4, *t['s4'], f'[checkbox* nastupi use_label_element {nas}]', ' jpa-pick', req=True)
        + korak(5, *t['s5'], f'[checkbox potrebe-izbor use_label_element {pot}]\n'
                + polje(t['detalji'], f'textarea potrebe x4 placeholder "{t["detalji_ph"]}"', True), ' jpa-pick')
        + korak(6, *t['s6'], f'[acceptance saglasnost]{t["sagl"]}[/acceptance]\n[acceptance pravila]{t["prav"]}[/acceptance]', req=True)
        + f'[hidden obrazac "press-otvaranje-2627"][hidden jezik "{j.upper()}"]\n'
        + f'<div class="jpa-send">[submit "{t["posalji"]}"]<p class="jpa-legal">{t["legal"]}</p></div>\n'
    )
    (D / f'forma-{j}.txt').write_text(out, encoding='utf-8')


for j in T:
    napravi(j)
print('forma-sr.txt, forma-en.txt')
