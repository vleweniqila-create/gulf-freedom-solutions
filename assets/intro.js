/* Gulf Freedom Solutions — 10-second launch intro
   Storyboard:
   0.0  Alone      lone pixels drift in the dark, each its own color         "If you want to go fast, go alone."
   1.6  Together   they find each other and line up into two rolling waves
   3.4  Values     the pixels spell our five values, one at a time
   6.4  Far        they gather into the sun-over-waves mark                 "If you want to go far, go together."
   9.0  Open       the screen dissolves pixel by pixel into the site
   Skippable (button, Escape, click). Plays once per visit. Never plays with reduced motion. */
(function () {
  'use strict';
  var root = document.getElementById('intro');
  if (!root) return;
  var force = /[?&]intro\b/.test(location.search);
  var seen = false;
  try { seen = sessionStorage.getItem('gfs-intro') === '1'; } catch (e) {}
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ((seen || reduce) && !force) { root.remove(); document.documentElement.classList.remove('intro-on'); return; }
  try { sessionStorage.setItem('gfs-intro', '1'); } catch (e) {}

  var cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
  var cap1 = root.querySelector('.ic-1'), cap2 = root.querySelector('.ic-2'), eyebrow = root.querySelector('.ic-eyebrow'), word = root.querySelector('.ic-word'), skip = root.querySelector('.intro-skip');
  var W, H, DPR, N, PS;
  var COLORS = ['#3DD6B0', '#5B8CFF', '#A58BFF', '#FFD23F', '#2457D6', '#6A4BC4'];
  var VALUES = ['HUMILITY', 'RELIABILITY', 'TRUST', 'PERSEVERANCE', 'GENEROSITY'];
  var parts = [], done = false, t0 = 0, raf;

  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    PS = W < 700 ? 3 : 4;
  }
  size();
  N = W < 700 ? 650 : 1300;

  /* sample points (and their colors) from something drawn on an offscreen canvas */
  function sample(draw, step) {
    var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
    var o = oc.getContext('2d'); draw(o);
    var d = o.getImageData(0, 0, W, H).data, pts = [];
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
      var i = (y * W + x) * 4;
      if (d[i + 3] > 140) pts.push({ x: x, y: y, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')' });
    }
    for (var k = pts.length - 1; k > 0; k--) { var j = (Math.random() * (k + 1)) | 0, tmp = pts[k]; pts[k] = pts[j]; pts[j] = tmp; }
    return pts;
  }
  function grad(o, x0, x1) {
    var g = o.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#3DD6B0'); g.addColorStop(.35, '#5B8CFF'); g.addColorStop(.7, '#A58BFF'); g.addColorStop(1, '#FFD23F');
    return g;
  }
  var FONT = '800 {s}px "Plus Jakarta Sans", system-ui, sans-serif';
  function wordPts(w) {
    var s = Math.min(W * (w.length > 10 ? 0.105 : 0.13), 170);
    return sample(function (o) {
      o.font = FONT.replace('{s}', s); o.textAlign = 'center'; o.textBaseline = 'middle';
      var tw = o.measureText(w).width; o.fillStyle = grad(o, W / 2 - tw / 2, W / 2 + tw / 2);
      o.fillText(w, W / 2, H * 0.47);
    }, PS + 1);
  }
  function logoPts() {
    var r = Math.min(W, H) * 0.2, cx = W / 2, cy = H * 0.42;
    return sample(function (o) {
      o.lineCap = 'round';
      o.fillStyle = '#3DD6B0'; o.beginPath(); o.arc(cx, cy - r * 0.38, r * 0.3, 0, Math.PI * 2); o.fill();
      [['#5B8CFF', 0.32], ['#A58BFF', 0.72]].forEach(function (wv) {
        o.strokeStyle = wv[0]; o.lineWidth = r * 0.17; o.beginPath();
        var y0 = cy + r * wv[1];
        o.moveTo(cx - r * 0.95, y0);
        o.quadraticCurveTo(cx - r * 0.47, y0 - r * 0.4, cx, y0);
        o.quadraticCurveTo(cx + r * 0.47, y0 + r * 0.4, cx + r * 0.95, y0);
        o.stroke();
      });
    }, PS);
  }

  /* particles */
  for (var i = 0; i < N; i++) {
    var c = COLORS[i % COLORS.length];
    parts.push({
      x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0,
      hx: Math.random() * W, hy: Math.random() * H,               // home spot while "alone"
      c: c, base: c, tc: c, a: 0, ta: 0, k: 0.07 + Math.random() * 0.07,
      ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.8, wave: i % 2, u: Math.random()
    });
  }

  var scenes = { words: [], logo: null }, scene = 'alone', wordIdx = -1;
  function assign(pts) {
    parts.forEach(function (p, i) {
      if (!pts.length) return;
      var q = pts[i % pts.length], extra = i >= pts.length;
      p.tx = q.x + (extra ? (Math.random() - 0.5) * 2 : 0); p.ty = q.y + (extra ? (Math.random() - 0.5) * 2 : 0);
      p.tc = q.c; p.ta = extra ? 0.35 : 1;
    });
  }

  function setScene(name, arg) {
    scene = name;
    if (name === 'alone') { cap1.classList.add('on'); }
    if (name === 'waves') { /* targets computed per frame */ }
    if (name === 'values') {
      cap1.classList.remove('on'); eyebrow.classList.add('on');
      wordIdx = arg; assign(scenes.words[arg]);
      word.textContent = VALUES[arg]; // for screen readers via live region text
    }
    if (name === 'logo') {
      eyebrow.classList.remove('on'); cap2.classList.add('on');
      assign(scenes.logo);
    }
  }

  function frame(now) {
    if (done) return;
    var t = (now - t0) / 1000, dt = 1 / 60;
    // timeline
    if (scene === 'alone' && t > 1.6) setScene('waves');
    if (scene === 'waves' && t > 3.4) setScene('values', 0);
    if (scene === 'values') { var wi = Math.min(4, Math.floor((t - 3.4) / 0.6)); if (wi !== wordIdx) setScene('values', wi); if (t > 6.4) setScene('logo'); }
    if (t > 9.0 && !root.classList.contains('out')) finish();

    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < N; i++) {
      var p = parts[i];
      if (scene === 'alone') {
        p.tx = p.hx + Math.sin(t * p.sp + p.ph) * 18; p.ty = p.hy + Math.cos(t * p.sp * 0.8 + p.ph) * 18;
        p.ta = 0.25 + 0.75 * Math.abs(Math.sin(t * 1.4 + p.ph)) * Math.min(1, t * 1.5); p.tc = p.base;
      } else if (scene === 'waves') {
        var u = p.u, amp = Math.min(H * 0.06, 46), y0 = H * 0.5 + (p.wave ? amp * 1.5 : -amp * 0.2);
        p.tx = u * W; p.ty = y0 + Math.sin(u * Math.PI * 3.2 + t * 2.4 + p.wave * 1.3) * amp;
        p.tc = p.wave ? '#A58BFF' : '#5B8CFF'; p.ta = 1;
      }
      var k = 1 - Math.pow(1 - p.k * (scene === 'values' ? 1.9 : 1), dt * 60);
      p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; p.a += (p.ta - p.a) * 0.12;
      if (p.c !== p.tc && Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 30) p.c = p.tc;
      ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
      ctx.fillRect(p.x - PS / 2, p.y - PS / 2, PS, PS);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  /* exit: dissolve the overlay pixel by pixel, then replay the hero reveal */
  function finish() {
    if (root.classList.contains('out')) return;
    var grid = root.querySelector('.intro-grid'), sz = W < 700 ? 44 : 64;
    var cols = Math.ceil(W / sz), rows = Math.ceil(H / sz), f = document.createDocumentFragment();
    grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; grid.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    for (var i = 0; i < cols * rows; i++) { var c = document.createElement('i'); c.style.transitionDelay = (Math.random() * 0.6).toFixed(3) + 's'; f.appendChild(c); }
    grid.appendChild(f);
    root.style.background = 'transparent';
    requestAnimationFrame(function () {
      root.classList.add('out');
      document.documentElement.classList.remove('intro-on');
      replayHero();
      setTimeout(function () { done = true; cancelAnimationFrame(raf); root.remove(); }, 1100);
    });
  }
  function replayHero() {
    var els = document.querySelectorAll('.hero .split, .hero .rv');
    Array.prototype.forEach.call(els, function (e) { e.classList.remove('in'); });
    void document.body.offsetWidth;
    setTimeout(function () { Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); }); }, 150);
  }
  function skipNow() { if (!root.classList.contains('out')) finish(); }
  skip.addEventListener('click', function (e) { e.stopPropagation(); skipNow(); });
  root.addEventListener('click', skipNow);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skipNow(); });

  /* start once the display font is ready (max 1.2s wait), so the words sample cleanly */
  function start() {
    if (t0) return;
    scenes.words = VALUES.map(wordPts); scenes.logo = logoPts();
    root.classList.add('go');
    t0 = performance.now(); setScene('alone');
    raf = requestAnimationFrame(frame);
  }
  var fontReady = document.fonts && document.fonts.load ? document.fonts.load(FONT.replace('{s}', '100')) : Promise.resolve();
  Promise.race([fontReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(start, start);
})();
