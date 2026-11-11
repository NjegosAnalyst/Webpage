"""Statičan tekst sekcija početne za red Elementor HTML widgeta (11. 11. 2026, analiza nove početne: „u izvornom kodu
su samo H1 i spisak naziva sekcija“ — Bing, Copilot i ChatGPT pretraga uglavnom ne izvršavaju skriptu).

Svaka sekcija u svom <div id="…"> nosi naslov (H2), tekst i linkove — ISTI sadržaj koji skripta prikaže (srpski).
Skripta sekcije cijeli sadržaj diva zamijeni svojim izgledom (root.innerHTML), pa nema duplog H2. Dok se skripta učitava
(ili ako ne stigne), tekst stoji na tamnoj podlozi sekcija, bez bijelog bljeska i čitljiv. Stil je u <style> unutar
omotača .jx-s (nestane zajedno sa njim). Koristi ga napravi-widget.py svake sekcije: staticni.html('ratrak').
Kad se tekst sekcije promijeni u .js fajlu, promijeniti ga i ovdje.
"""

CSS = ('<style>.jx-s{background:#0A1120;color:rgba(255,255,255,.8);padding:clamp(40px,6vw,80px) clamp(16px,4vw,48px);'
       'font:400 16px/1.6 Barlow,system-ui,-apple-system,sans-serif}'
       '.jx-s>*{max-width:1240px;margin-left:auto!important;margin-right:auto!important}'
       '.jx-s h2,.jx-s h3{color:#fff!important;font-family:Archivo,system-ui,sans-serif!important;text-transform:none!important;letter-spacing:-.01em;margin-top:0!important}'
       '.jx-s h2{font-size:clamp(28px,3.6vw,44px)!important;line-height:1.12!important;font-weight:800!important;margin-bottom:14px!important}'
       '.jx-s h3{font-size:20px!important;line-height:1.3!important;font-weight:700!important;margin-bottom:8px!important;margin-top:22px!important}'
       '.jx-s p,.jx-s li{color:rgba(255,255,255,.8)!important;margin-bottom:10px!important}'
       '.jx-s .jx-k{color:#9BE6FF!important;font:600 15px/1.3 Archivo,system-ui,sans-serif;margin-bottom:10px!important}'
       '.jx-s ul{padding-left:20px!important;margin-bottom:12px!important}'
       '.jx-s a{color:#9BE6FF!important;text-decoration:underline!important}</style>')

TEL = '<a href="tel:+38757270003">+387 57 270 003</a>'
CIJENE = '/cjenovnik-ski-karata-sezona-2026-27/'

TEXT = {
    'stanje': (
        '<h2>Stanje skijališta Jahorina</h2>'
        '<p>Jahorina ima 54 km uređenih staza i 14 žičara. Stanje staza i žičara, visinu snijega i radno vrijeme '
        'pratite uživo na stranici <a href="/ski-info/">Ski info</a>.</p>'
        '<p><a href="/ski-info/">Sve staze i žičare</a></p>'),   # v2 (11. 11.): samo traka stanja, bez brzih kartica
    'vijesti': (
        '<h2>Obavještenja i vijesti sa Jahorine</h2>'
        '<p>Najnovija obavještenja, vijesti i akcije Olimpijske planine Jahorina.</p>'
        '<p><a href="https://www.oc-jahorina.com/category/vijesti/">Sve vijesti i obavještenja sa Jahorine</a></p>'),
    'ratrak': (
        '<h2>Panoramska vožnja ratrakom</h2>'
        '<p>Za one koji žele duže uživati u pogledu na staze i vrhove Jahorine, panoramska vožnja u trajanju od 20 minuta pravi je izbor.</p>'
        '<ul><li>Trajanje: {trajanje}</li><li>Polazak: {polazak}, polaz gondole Poljice</li>'
        '<li>Cijena: {cijena} po osobi; za djecu do 6 godina vožnja je besplatna</li><li>Plaćanje na ski kasi Poljice</li></ul>'
        '<p>Rezervacija najmanje dan unaprijed na mail <a href="mailto:skipass@oc-jahorina.com">skipass@oc-jahorina.com</a> '
        f'ili putem telefona na broj {TEL}.</p>'),
    'suvenirnica': (
        '<p class="jx-k">Suvenirnica</p><h2>Ponesite dio Jahorine sa sobom!</h2>'
        '<p>Svratite u naše suvenirnice na polaznoj i izlaznoj stanici gondole Poljice i pronađite poklone koji griju srce.</p>'
        '<ul><li>Suveniri i magneti</li><li>Odjeća i kape</li><li>Ručni rad</li><li>Domaći proizvodi</li></ul>'
        '<p><a href="/suvenirnica/">Više o suvenirnici</a></p>'),
    'bar': (
        '<p class="jx-k">Après-ski i restoran · 1.879 m</p><h2>Olimpijski bar</h2>'
        '<p>Domaća kuhinja i vrhunska pića na vrhu Jahorine, gdje vam je cijela planina na dlanu.</p>'
        '<p>Otvoreno 9–21h · Terasa sa pogledom</p>'
        '<p>Rezervacije: <a href="tel:+38757270003">057 270 003</a> · <a href="/olimpijski-bar/">Više o Olimpijskom baru</a></p>'),
    'gondola': (
        '<p class="jx-k">VIP gondola</p><h2>Vožnja VIP gondolom</h2>'
        '<p>Panoramska vožnja u VIP kabini uz šampanjac, a u paketu VIP 2 i domaći specijaliteti.</p>'
        '<ul><li>VIP 1: vožnja do 1 h i šampanjac — 150 KM</li><li>VIP 2: vožnja do 1 h, šampanjac i domaći specijaliteti — 250 KM</li></ul>'
        '<p>Rezervacija e-poštom. <a href="/vip-gondola/">Više o VIP gondoli</a></p>'),
    'depo': (
        '<p class="jx-k">Ski depo</p><h2>Ostavite opremu na planini</h2>'
        '<p>Jedan od najboljih i najpraktičnijih načina da očuvate vašu opremu jeste korištenje ski depoa.</p>'
        '<ul><li>15 KM po danu (cijena po depou za jedan dan)</li>'
        '<li>2 kompletna seta opreme: skije, pancerice, kacige i rukavice za dvije osobe</li><li>Sušenje, grijanje i ventilacija</li></ul>'
        '<h3>Kako do depoa</h3>'
        '<p>Ski kasa na polazu gondole Poljice → kartica depoa (depozit 10 KM) → skenirajte karticu u polaznoj stanici.</p>'
        '<p><a href="/ski-depoi/">Više o ski depou</a></p>'),
    'park': (
        '<h2>Snowboard park i Ski bike</h2>'
        '<h3>Snowboard park</h3>'
        '<p>Ova, po mnogo čemu autentična, planina podariće ljubiteljima snowboarding-a prostor o kojem su do sada mogli samo da sanjaju, i to – rezervisan samo za njih.</p>'
        '<ul><li>Površina parka: 3.000 m²</li><li>Staza: Trnovo</li><li>Kod vikend naselja Šator</li></ul>'
        '<p><a href="/snowboard-park/">Više o snowboard parku</a></p>'
        '<h3>Ski bike</h3>'
        '<p>Ski Bike je jedinstvena kombinacija bicikla i skija koja vam omogućava da se spuštate niz staze na potpuno nov način.</p>'
        '<ul><li>Poligon za vožnju: Trnovo</li><li>Bez iskustva: lako se savladava</li><li>Za sve, bez obzira na godine</li></ul>'
        '<p><a href="/ski-bike/">Više o ski bike-u</a></p>'),
    'sankaliste': (
        '<p class="jx-k">Sankalište</p><h2>Sankanje kao nekad</h2>'
        '<p>Ukoliko sada imate mališane, ili ste se i sami uželjeli tog bezbrižnog osjećaja od prije 20, 30 ili više godina, '
        'vrijeme je da počnete da se radujete, jer je na Jahorini izgrađeno prvo Sankalište!</p>'
        '<ul><li>Dužina: 600 m</li><li>Lokacija: staza 7, Poljice</li><li>Lift: sidro Poljice</li>'
        '<li>Radno vrijeme: svaki dan od 16 do 18 h, između dnevnog i noćnog skijanja</li>'
        '<li>Sanke: najam na ski kasi Poljice (svoje ostavite kod kuće: za sidro trebaju sanke sa adapterom)</li></ul>'
        f'<p><a href="{CIJENE}">Cijene karata</a> · <a href="/sankaliste/">Više o sankalištu</a></p>'),
}


def html(sec, **kw):
    """Statičan sadržaj sekcije (ide unutar <div id="…"> u redu za widget)."""
    t = TEXT[sec]
    if kw:
        t = t.format(**kw)
    return '<div class="jx-s">' + CSS + t + '</div>'
