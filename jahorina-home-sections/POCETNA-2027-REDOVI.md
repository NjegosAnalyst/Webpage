# Početna 2027 — redovi za Elementor (stanje 11. 11. 2026)

Redoslijed na stranici: hero → **stanje** → vijesti → ratrak → suvenirnica → Olimpijski bar → VIP gondola → Ski depo → Snowboard park i Ski bike → Sankalište (+ Ski pass) → footer.
Poslije zamjene: **Ažuriraj** u Elementoru, obriši keš (WP Fastest Cache), provjeri računar i telefon. Fajl pravi `alati/napravi-redove.py` — ne mijenjati ručno.

## 1. Stanje skijališta i brzi linkovi

Novi HTML widget odmah ispod hero-a (iznad vijesti).

```html
<div id="jst-stanje"><h2>Stanje skijališta Jahorina</h2><p>Jahorina ima 54 km uređenih staza i 14 žičara. Stanje staza i žičara, visinu snijega i radno vrijeme pratite uživo na stranici <a href="/ski-info/">Ski info</a>.</p><ul><li><a href="https://webshop.oc-jahorina.com/">Kupi ski kartu online</a></li><li><a href="/cjenovnik-ski-karata-sezona-2026-27/">Cijene ski karata, sezona 2026/27</a></li><li><a href="/ski-mapa/">Ski mapa Jahorine</a></li><li><a href="/jahorina-tv-web-kamere/">Kamere uživo (Jahorina TV)</a></li><li><a href="/nocno-skijanje/">Noćno skijanje</a></li></ul></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@6bc679cc34e6781ed0af487d07c6206c71432bab/jahorina-home-sections/stanje/stanje.js','sha384-m5s1BYRKQqZNy/jIozxt6uXLcPSh4qKdoXsIw7EDw89WsGgbT7ziyhMCBrwY+jWF')</script>
```

## 2. Obavještenja i vijesti

Ako na sajtu postoji i WPCode snippet „Jahorina vijesti“, zamijeni i njega (sadržaj `vijesti/wpcode-vijesti.js`) — inače se može učitati stara verzija.

```html
<div id="jv-vijesti"><a href="https://www.oc-jahorina.com/category/vijesti/">Sve vijesti</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/vijesti/vijesti.js','sha384-fFwI2J6VneodWO92VWBphvhJzKuejCfGZ30qV1rRXxvQc1cqj6wP57EikguQECNo')</script>
```

## 3. Panoramska vožnja ratrakom

```html
<div id="jr-ratrak" data-trajanje="20 min" data-polazak="16–18h" data-polazak-en="4–6 pm" data-cijena="50 KM" data-webshop=""><a href="mailto:skipass@oc-jahorina.com">Panoramska vožnja ratrakom: rezervacija</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/ratrak/ratrak.js','sha384-8fpEuVTlSXNguwALCBBI84m+QgqnPQjLyw5cg2wXdgoXBCIGCqACKtGpBBslfEaO')</script>
```

## 4. Suvenirnica

```html
<div id="jsu-suvenirnica" data-stranica="suvenirnica" data-mapa=""><a href="/suvenirnica/">Suvenirnica</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/suvenirnica/suvenirnica.js','sha384-celifMi6/RMX6QAj4VrZ3Ya3RbHXp4CKg8o3J31DcA5OC6yBp18EQ03v4V2ksWPK')</script>
```

## 5. Olimpijski bar

```html
<div id="jb-bar" data-stranica="olimpijski-bar"><a href="/olimpijski-bar/">Olimpijski bar</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/bar/bar.js','sha384-yivx3Z/Ne362677533sWD9TI4RdGPjNyleiiws3jH8iL5W7VfOnYJB2i5xOlWP1U')</script>
```

## 6. VIP gondola

```html
<div id="jg-gondola" data-stranica="vip-gondola"><a href="/vip-gondola/">VIP gondola</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/gondola/gondola.js','sha384-ZU+KvvdnPgeZRN4VLToGvea35nLtCSD8Ypd6XVDusHOEG7NCw6wNQ9eFsv9CN9eU')</script>
```

## 7. Ski depo

```html
<div id="jsd-depo" data-stranica="ski-depo"><a href="/ski-depo/">Ski depo</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/depo/depo.js','sha384-YYXg7V8xUGiM4DxYnvQvdSd/uacn/0Qwx7vYzlUoqf+yLDYZeurVPfqtve7rRWGq')</script>
```

## 8. Snowboard park i Ski bike

```html
<div id="jsb-park" data-park="snowboard-park" data-bike="ski-bike"><a href="/snowboard-park/">Snowboard park</a> · <a href="/ski-bike/">Ski bike</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@ca215c2c5529a722f8c763f6a7050f92a32fead6/jahorina-home-sections/park/park.js','sha384-6Cu1nipjlt0lB4Kqaf4AtwYej8j5g2U4wSVC3WpWo6TTbOKT89lWk2D5H/Al/DFT')</script>
```

## 9. Sankalište (zadnja sekcija prije footera)

U ISTI widget, ispod njegovog reda, ide i red dugmeta „Ski pass“ (ispod).

```html
<div id="jsk-sankaliste" data-stranica="sankaliste"><a href="/sankaliste/">Sankalište</a></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@a90f1b00c6ae43be6155e03fbd69f8b1b0470de9/jahorina-home-sections/sankaliste/sankaliste.js','sha384-9g9ww30mCJfsWaH4/2QJ41Wg1x/Z94dFtxS1V8qC90V/4cMbuEpcc17Iav/tNeMA')</script>
```

## Ski pass (dugme na telefonu)

U isti HTML widget kao Sankalište, ispod njegovog reda.

```html
<div id="jks-skipass" data-link="https://webshop.oc-jahorina.com/"></div><script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace('cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}(d.head||d.documentElement).appendChild(s)}g(u,i)})(document,'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@65d53212beeb96ab054008fc83b925d2b596a63e/jahorina-home-sections/skipass/skipass.js','sha384-KhVfZ6FBGuJ6KY3oJuZqScTtZlYTXJ76bFQceoWnV+j1mIcCAKbRZLbe2XlRWw+I')</script>
```

## Hero (Slider Revolution) i WPCode

- Moduli **Jahorina Hero 2027** i **Jahorina Hero 2027 EN**: HTML sloja i Custom CSS iz `jahorina-hero-v2/slider-revolution-spremno/1-html.html` + `2-css.css` (EN: `slider-revolution-EN-spremno/`).
- WPCode snippet **„Jahorina brzi start“** (Site Wide Header): sadržaj `jahorina-hero-v2/wordpress-ubrzanje.js`.
