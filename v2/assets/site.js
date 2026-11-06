/* Gulf Freedom Solutions — shared interactions */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- pixel page transition ---------- */
  var px = $('#px');
  function buildPixels(el, size) {
    var w = window.innerWidth, h = window.innerHeight;
    var cols = Math.ceil(w / size), rows = Math.ceil(h / size);
    el.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    el.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < cols * rows; i++) frag.appendChild(document.createElement('i'));
    el.innerHTML = '';
    el.appendChild(frag);
    return $$('i', el);
  }
  function scatter(cells, span) {
    cells.forEach(function (c) { c.style.transitionDelay = (Math.random() * span).toFixed(3) + 's'; });
  }
  if (px) {
    if (reduce) { px.remove(); px = null; }
    else {
      var cells = buildPixels(px, window.innerWidth < 700 ? 44 : 64);
      px.style.background = 'transparent';
      scatter(cells, 0.55);
      requestAnimationFrame(function () { requestAnimationFrame(function () { px.classList.add('out'); }); });
      window.addEventListener('pageshow', function (e) { if (e.persisted) { px.classList.remove('busy'); px.classList.add('out'); } });
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
        var url = new URL(a.href, location.href);
        if (url.origin !== location.origin || a.hasAttribute('download')) return;
        if (url.pathname === location.pathname && url.hash) return;
        e.preventDefault();
        scatter(cells, 0.45);
        px.classList.add('busy');
        px.classList.remove('out');
        setTimeout(function () { location.href = url.href; }, 650);
      });
    }
  }

  /* ---------- menu ---------- */
  var root = document.documentElement;
  var burger = $('.burger');
  var menu = $('.menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menu) $$('a,button', menu).forEach(function (el) { el.tabIndex = open ? 0 : -1; });
  }
  if (burger && menu) {
    setMenu(false);
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { if (new URL(a.href, location.href).pathname === location.pathname) setMenu(false); }); });
    var peek = $('.menu-peek');
    if (peek) {
      $$('nav a', menu).forEach(function (a, i) {
        var d = document.createElement('div');
        d.style.backgroundImage = 'url("' + a.dataset.img + '")';
        peek.appendChild(d);
        a.addEventListener('mouseenter', function () { $$('div', peek).forEach(function (x) { x.classList.remove('show'); }); d.classList.add('show'); });
        if (i === 0) d.classList.add('show');
      });
    }
  }

  /* ---------- top bar: hide on scroll down, progress, dark mode over dark sections ---------- */
  var bar = $('.bar');
  var prog = $('.bar-prog span');
  var darks = $$('[data-dark]');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (bar && !root.classList.contains('menu-open')) {
      bar.classList.toggle('hide', y > lastY && y > 400);
      var mid = 40;
      var overDark = darks.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      bar.classList.toggle('on-dark', overDark);
    }
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- split headings into words ---------- */
  $$('.split').forEach(function (el) {
    var html = el.innerHTML;
    var i = 0;
    el.innerHTML = html.replace(/(<[^>]+>)|([^\s<]+)/g, function (m, tag, word) {
      if (tag) return tag;
      return '<span class="w"><span style="transition-delay:' + (0.04 * i++).toFixed(2) + 's">' + word + '</span></span>';
    });
  });

  /* ---------- pixel image reveals ---------- */
  $$('.pximg').forEach(function (el) {
    var c = document.createElement('div');
    c.className = 'cells';
    var cols = +el.dataset.cols || 12, rows = +el.dataset.rows || 9;
    c.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    c.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    for (var i = 0; i < cols * rows; i++) {
      var s = document.createElement('i');
      s.style.transitionDelay = (Math.random() * 0.9).toFixed(2) + 's';
      c.appendChild(s);
    }
    el.appendChild(c);
  });

  /* ---------- reveal on scroll ---------- */
  var targets = $$('.rv,.split,.pximg,[data-count]');
  function reveal(el) {
    el.classList.add('in');
    if (el.dataset.count) countUp(el);
  }
  if (!('IntersectionObserver' in window) || reduce) targets.forEach(reveal);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }
  function countUp(el) {
    var end = parseFloat(el.dataset.count), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduce) { el.textContent = pre + end + suf; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- text scramble ---------- */
  var glyphs = '█▓▒░#%&@$*+=<>/';
  function scramble(el, text) {
    if (reduce) { el.textContent = text; return; }
    var from = el.textContent, len = Math.max(from.length, text.length), frame = 0, q = [];
    for (var i = 0; i < len; i++) { var s = Math.floor(Math.random() * 20), e = s + Math.floor(Math.random() * 20); q.push({ to: text[i] || '', s: s, e: e }); }
    (function tick() {
      var out = '', done = 0;
      q.forEach(function (c) {
        if (frame >= c.e) { done++; out += c.to; }
        else if (frame >= c.s) out += glyphs[Math.floor(Math.random() * glyphs.length)];
        else out += '';
      });
      el.textContent = out;
      if (done < q.length) { frame++; requestAnimationFrame(tick); }
    })();
  }
  $$('[data-words]').forEach(function (el) {
    var words = el.dataset.words.split('|'), i = 0;
    setInterval(function () { i = (i + 1) % words.length; scramble(el, words[i]); }, 2600);
  });

  /* ---------- tilt cards ---------- */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-6px)';
        el.style.setProperty('--mx', (x + 0.5) * 100 + '%');
        el.style.setProperty('--my', (y + 0.5) * 100 + '%');
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    /* magnetic buttons */
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    /* cursor dot */
    var cur = document.createElement('div');
    cur.className = 'cur';
    document.body.appendChild(cur);
    window.addEventListener('mousemove', function (e) { cur.style.opacity = 1; cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, { passive: true });
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,[data-tilt],label'))); });
  }

  /* ---------- quick quote ---------- */
  var qb = $('#quote-box');
  if (qb) {
    var opts = $$('.opt', qb);
    var fmt = function (n) { return '$' + n.toLocaleString('en-US'); };
    var update = function () {
      var once = 0, monthly = 0, ads = false;
      opts.forEach(function (b) {
        if (b.getAttribute('aria-pressed') !== 'true') return;
        once += +(b.dataset.once || 0); monthly += +(b.dataset.monthly || 0); if (b.dataset.ads) ads = true;
      });
      var t = 'Pick a service';
      if (once && monthly) t = fmt(once) + ' + ' + fmt(monthly) + '/mo';
      else if (once) t = fmt(once) + ' one-time';
      else if (monthly) t = fmt(monthly) + '/mo';
      scramble($('#q-est'), t);
      $('#q-note').textContent = 'Starting estimate only. Final price depends on your needs and may change.' + (ads ? ' Ad spend is paid separately.' : '');
    };
    opts.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); update(); }); });
  }

  /* ---------- horizontal drag scroller ---------- */
  $$('[data-drag]').forEach(function (el) {
    var down = false, sx = 0, sl = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = el.scrollLeft; el.classList.add('dragging'); });
    window.addEventListener('pointerup', function () { down = false; el.classList.remove('dragging'); });
    el.addEventListener('pointermove', function (e) { if (down) el.scrollLeft = sl - (e.clientX - sx); });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
