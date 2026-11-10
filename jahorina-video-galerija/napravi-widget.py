#!/usr/bin/env python3
"""Pravi red za Elementor HTML widget na vrhu stranice Video galerija: video.js sa jsDelivr-a,
zaključan na commit + SRI (rezerva: isti fajl iz istog commita sa githack CDN-a).

Red „uspava“ Elementor Video widgete prije Elementorove inicijalizacije (MutationObserver preimenuje
data-widget_type i sakrije data-settings), pa se YouTube plejeri ne učitavaju; sakrije ih dok video.js
ne prikaže novu galeriju (ako ne stigne za 8 s, vrate se), a pozadinu sadržaja oboji tamno.
U Elementor editoru se ništa ne sakriva (body.elementor-editor-active).

Redoslijed: izmijeni video.js → commit + push → python3 napravi-widget.py → commit + push
→ python3 napravi-snippet.py (jednokratni WPCode snippet koji red ubaci na stranicu).
"""
import base64, hashlib, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
REL = 'jahorina-video-galerija/video.js'

def git(*a):
    return subprocess.run(['git', *a], cwd=HERE, check=True, capture_output=True).stdout

PROBA = '--proba' in sys.argv   # za test: radni fajl, adresa @proba, ništa se ne upisuje
if PROBA:
    commit, body = 'proba', (HERE / 'video.js').read_bytes()
else:
    commit = git('log', '-1', '--format=%H', '--', 'video.js').decode().strip()
    if git('status', '--porcelain', '--', 'video.js').strip():
        raise SystemExit('video.js ima nesačuvane izmjene — prvo commit + push, pa ponovo.')
    body = git('show', f'{commit}:{REL}')
sri = 'sha384-' + base64.b64encode(hashlib.sha384(body).digest()).decode()
url = f'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@{commit}/{REL}'

# isti loader kao u sekcijama početne (radi i na stranici i u Elementor editoru) + rezerva za skrivene originale
def loader(url, sri):
    return ("<script>(function(d,u,i){function g(a,b){var s=d.createElement('script');s.src=a;"
            "if(b){s.integrity=b;s.crossOrigin='anonymous';s.onerror=function(){g(a.replace("
            "'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@','rawcdn.githack.com/NjegosAnalyst/Webpage/'))}}"
            "(d.head||d.documentElement).appendChild(s)}g(u,i);"
            "setTimeout(function(){if(!d.querySelector('#jvg-galerija .jvg-wrap')){var s=d.getElementById('jvg-skrij');"
            "if(s)s.parentNode.removeChild(s)}},8000)})(document,'" + url + "','" + sri + "')</script>")

# uspavljivanje Video widgeta (ne u Elementor editoru: adresa sa elementor-preview)
SLEEP = ("<script>(function(d){if(/[?&]elementor-preview=/.test(location.search))return;"
         "function s(e){if(e.getAttribute('data-widget_type')==='video.default'){e.setAttribute('data-jvg-settings',e.getAttribute('data-settings')||'');"
         "e.removeAttribute('data-settings');e.setAttribute('data-widget_type','jvg-video')}}"
         "var o=new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType!==1)return;"
         "if(n.matches('.elementor-widget-video'))s(n);[].forEach.call(n.querySelectorAll('.elementor-widget-video'),s)})})});"
         "o.observe(d.documentElement,{childList:true,subtree:true});"
         "d.addEventListener('DOMContentLoaded',function(){[].forEach.call(d.querySelectorAll('.elementor-widget-video'),s);o.disconnect()})})(document)</script>")
NE = 'body:not(.elementor-editor-active)'
line = (f'<style id="jvg-skrij">{NE} .elementor-widget-video,{NE} .elementor-widget-heading{{visibility:hidden}}</style>'
        f'<style>{NE} #Content{{background:#0A1120}}</style>'
        '<div id="jvg-galerija"></div>'
        f'{SLEEP}{loader(url, sri)}\n')
if not PROBA:
    (HERE / 'elementor-html-widget.html').write_text(line, encoding='utf-8')
print(line, end='')
