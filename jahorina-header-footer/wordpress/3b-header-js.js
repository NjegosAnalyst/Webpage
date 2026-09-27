/* =====================================================================
   JAHORINA HEADER — DIO 2: JavaScript  (WPCode: JavaScript Snippet → Auto Insert → Site Wide Footer)
   Ide uz HTML snippet 'Jahorina Header'. Stavke menija čita iz WordPressa.
   ===================================================================== */

function jhInit() {
  var root = document.querySelector('.jh-wp');
  if (!root) return;
  // header uvijek ide na sam početak stranice, bez obzira gdje ga WPCode ubaci
  function toTop() { if (document.body && document.body.firstChild !== root) document.body.insertBefore(root, document.body.firstChild); }
  toTop(); document.addEventListener('DOMContentLoaded', toTop);

  var header = root.querySelector('.jf-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40 || root.classList.contains('is-search-open')); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = root.querySelector('.jf-burger'), shade = root.querySelector('.jf-shade');
  function setMenu(open) { root.classList.toggle('is-menu-open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('is-menu-open')); });
  shade.addEventListener('click', function () { setMenu(false); });

  var sBtn = root.querySelector('.jf-search-btn'), sInput = root.querySelector('.jf-search input');
  function setSearch(open) {
    root.classList.toggle('is-search-open', open); sBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    onScroll(); if (open) setTimeout(function () { sInput.focus(); }, 60);
  }
  sBtn.addEventListener('click', function (e) { e.stopPropagation(); setSearch(!root.classList.contains('is-search-open')); });
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.jf-header')) setSearch(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSearch(false); setMenu(false); } });
  var sForm = root.querySelector('.jf-search .jf-sform');
  function doSearch() {
    var v = sInput.value.trim(); if (!v) return;
    window.location.assign((sForm.getAttribute('data-action') || '/') + '?s=' + encodeURIComponent(v));
  }
  sForm.querySelector('button').addEventListener('click', doSearch);
  sInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });

  // ===== MENI IZ WORDPRESSA: stavke se čitaju iz postojećeg Betheme menija =====
  // (Izgled → Izbornici ostaje jedino mjesto gdje se meni uređuje)
  var srcUl = document.querySelector('#Top_bar #menu > ul, #Top_bar .menu_wrapper ul.menu, .mfn-header-tmpl nav ul, #menu-main-menu');
  var fromWP = false;
  if (srcUl) {
    var items = [].filter.call(srcUl.children, function (li) { return li.tagName === 'LI' && li.querySelector('a'); });
    if (items.length) {
      fromWP = true;
      var nav = root.querySelector('.jf-nav'), mnav = root.querySelector('.jf-mnav');
      nav.innerHTML = ''; mnav.innerHTML = '';
      items.forEach(function (li) {
        var a0 = li.querySelector('a'), label = (a0.textContent || '').replace(/\s+/g, ' ').trim();
        if (!label) return;
        var sub = li.querySelector(':scope > ul');
        var link = document.createElement('a'); link.href = a0.href; link.textContent = label;
        if (a0.target) link.target = a0.target;
        if (/current-menu-(item|ancestor|parent)/.test(li.className)) link.setAttribute('aria-current', 'page');
        var mlink = link.cloneNode(true); mnav.appendChild(mlink);
        if (sub) {
          var wrap = document.createElement('div'); wrap.className = 'jf-dd';
          var box = document.createElement('div'); box.className = 'jf-dd__menu';
          [].forEach.call(sub.querySelectorAll(':scope > li > a'), function (sa) {
            var x = document.createElement('a'); x.href = sa.href; x.textContent = sa.textContent.replace(/\s+/g, ' ').trim();
            if (sa.target) x.target = sa.target;
            box.appendChild(x);
            var mx = x.cloneNode(true); mx.className = 'jf-mnav__sub'; mnav.appendChild(mx);
          });
          link.classList.add('jf-dd__top');
          wrap.appendChild(link); wrap.appendChild(box); nav.appendChild(wrap);
        } else nav.appendChild(link);
      });
    }
  }
  root.classList.add('is-ready');   // tek sada pokaži meni (bez treptaja pogrešnih stavki)
  // jezik iz WordPressa (WPML / Polylang), ako postoji
  var wpLang = document.querySelector('#Top_bar .wpml-languages a:not(.active), #Top_bar a[hreflang], .lang-item:not(.current-lang) a');

  // jezik: na srpskoj strani dugme "EN" vodi na istu stranicu na engleskom, i obrnuto
  var path = location.pathname, isEN = /^\/en(\/|$)/.test(path);
  var lang = root.querySelector('.jf-lang');
  lang.href = wpLang ? wpLang.href : location.origin + (isEN ? (path.replace(/^\/en/, '') || '/') : '/en' + path);
  lang.textContent = isEN ? 'SR' : 'EN';
  lang.setAttribute('aria-label', isEN ? 'Srpski' : 'English');
  if (!isEN) return;
  if (fromWP) {   // meni je već na pravom jeziku iz WordPressa — prevedi samo pretragu
    var f0 = root.querySelector('.jf-search .jf-sform');
    f0.setAttribute('data-action', 'https://www.oc-jahorina.com/en/'); sInput.placeholder = 'Search the site…';
    f0.querySelector('button').textContent = 'Search'; sBtn.setAttribute('aria-label', 'Search');
    return;
  }
  var T = { 'O nama': 'About us', 'Cjenovnik': 'Pricelist', 'Vijesti': 'News', 'Foto galerija': 'Photo gallery', 'Video galerija': 'Video gallery' };
  root.querySelectorAll('.jf-nav a, .jf-mnav a').forEach(function (a) {
    var t = a.textContent.trim(); if (T[t]) a.textContent = T[t];
  });
  root.querySelectorAll('a[href^="https://www.oc-jahorina.com/"]').forEach(function (a) {
    if (a !== lang && !/oc-jahorina\.com\/en\//.test(a.href)) a.href = a.href.replace('oc-jahorina.com/', 'oc-jahorina.com/en/');
  });
  var f = root.querySelector('.jf-search .jf-sform');
  f.setAttribute('data-action', 'https://www.oc-jahorina.com/en/');
  sInput.placeholder = 'Search the site…';
  f.querySelector('button').textContent = 'Search';
  sBtn.setAttribute('aria-label', 'Search');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jhInit); else jhInit();
