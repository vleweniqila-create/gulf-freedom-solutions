/* Gulf Freedom Solutions — 10-second launch intro
   Storyboard:
   0.0  Alone      lone pixels drift in the dark, each its own color         "If you want to go fast, go alone."
   1.2  Service    they snap into a jet (a nod to the F-35s over Tyndall) that  "Built by two service members."
                   streaks across the sky with a pixel contrail
   2.9  Home       they rebuild Bay County: sunset, the pier, the bridge,     "Rooted in Bay County."
                   palms and rolling Gulf waves
   4.3  Values     the pixels flash our five values, quickly
   6.8  Far        they gather into the sun-over-waves mark                 "If you want to go far, go together."
   9.3  Open       the screen dissolves pixel by pixel into the site
   The jet is a generic silhouette, no official insignia.
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
  var q = function (s) { return root.querySelector(s); };
  var cap1 = q('.ic-1'), capJet = q('.ic-jet'), capBay = q('.ic-bay'), eyebrow = q('.ic-eyebrow'), cap2 = q('.ic-2'), word = q('.ic-word'), skip = q('.intro-skip');
  var W, H, DPR, N, PS;
  var COLORS = ['#3DD6B0', '#5B8CFF', '#A58BFF', '#FFD23F', '#2457D6', '#6A4BC4'];
  var VALUES = ['HUMILITY', 'RELIABILITY', 'TRUST', 'PERSEVERANCE', 'GENEROSITY'];
  var T = { jet: 1.2, bay: 2.9, values: 4.3, word: 0.5, logo: 6.8, end: 9.3 };
  var parts = [], done = false, t0 = 0, raf;

  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    PS = W < 700 ? 3 : 4;
  }
  size();
  N = W < 700 ? 700 : 1400;

  /* sample points (and their colors) from something drawn on an offscreen canvas */
  function sample(draw, step) {
    var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
    var o = oc.getContext('2d'); draw(o);
    var d = o.getImageData(0, 0, W, H).data, pts = [];
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
      var i = (y * W + x) * 4;
      if (d[i + 3] > 140) pts.push({ x: x, y: y, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')' });
    }
    return shuffle(pts);
  }
  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = (Math.random() * (k + 1)) | 0, tmp = a[k]; a[k] = a[j]; a[j] = tmp; } return a; }
  /* take a fixed share of particles for each shape so thin lines still read */
  function quota(groups, total) {
    var out = [];
    groups.forEach(function (g) {
      var n = Math.round(total * g[1]), pts = g[0];
      for (var i = 0; i < n && pts.length; i++) out.push(pts[i % pts.length]);
    });
    return out;
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

  /* jet: a generic delta-wing fighter seen from below, nose to the right.
     Returned as offsets from its center so it can fly. */
  var JL = Math.max(170, Math.min(W * 0.3, 400));
  function jetPts() {
    var cx = W / 2, cy = H / 2, L = JL;
    var half = [[0.5, 0], [0.34, 0.045], [0.14, 0.07], [-0.1, 0.40], [-0.22, 0.40], [-0.2, 0.085],
      [-0.3, 0.08], [-0.42, 0.23], [-0.5, 0.23], [-0.47, 0.06], [-0.5, 0.045]];
    var pts = sample(function (o) {
      var g = o.createLinearGradient(cx - L / 2, 0, cx + L / 2, 0);
      g.addColorStop(0, '#6A4BC4'); g.addColorStop(.45, '#5B8CFF'); g.addColorStop(1, '#C9D6FF');
      o.fillStyle = g; o.beginPath();
      half.forEach(function (p, i) { o[i ? 'lineTo' : 'moveTo'](cx + p[0] * L, cy - p[1] * L); });
      for (var i = half.length - 1; i >= 0; i--) o.lineTo(cx + half[i][0] * L, cy + half[i][1] * L);
      o.closePath(); o.fill();
      o.fillStyle = '#3DD6B0'; o.beginPath(); o.ellipse(cx + L * 0.25, cy, L * 0.08, L * 0.025, 0, 0, Math.PI * 2); o.fill();
      o.fillStyle = '#FFD23F'; o.fillRect(cx - L * 0.54, cy - L * 0.035, L * 0.06, L * 0.07);   // afterburner
    }, W < 700 ? 3 : 4);
    return pts.map(function (p) { return { x: p.x - cx, y: p.y - cy, c: p.c }; });
  }

  /* Bay County at sunset: striped sun, the beach pier, the bridge, palms */
  var HY;
  function bayPts(total) {
    var m = Math.min(W, H), hy = HY = H * 0.6, step = PS;
    var sun = sample(function (o) {
      var r = m * 0.2, g = o.createLinearGradient(0, hy - r, 0, hy);
      g.addColorStop(0, '#FFD23F'); g.addColorStop(1, '#FF8A5B');
      o.fillStyle = g; o.beginPath(); o.arc(W * 0.5, hy, r, Math.PI, 0); o.fill();
      o.globalCompositeOperation = 'destination-out';
      for (var k = 0; k < 5; k++) { var y = hy - r * (0.08 + k * 0.17); o.fillRect(0, y, W, r * (0.025 + k * 0.012)); }
    }, step);
    var bridge = sample(function (o) {
      var x0 = W * 0.56, x1 = W * 1.02, top = hy - m * 0.07;
      o.strokeStyle = '#8FA0C2'; o.lineWidth = Math.max(3, m * 0.008); o.beginPath();
      o.moveTo(x0, hy - m * 0.012); o.quadraticCurveTo((x0 + x1) / 2, top - m * 0.03, x1, hy - m * 0.012); o.stroke();
      o.lineWidth = Math.max(2, m * 0.005);
      for (var x = x0 + W * 0.03; x < x1; x += W * 0.04) {
        var u = (x - x0) / (x1 - x0), y = hy - m * 0.012 - 4 * u * (1 - u) * (m * 0.05 + m * 0.012);
        o.beginPath(); o.moveTo(x, y); o.lineTo(x, hy); o.stroke();
      }
    }, step);
    var pier = sample(function (o) {
      var y = hy + m * 0.05, x1 = W * 0.36;
      o.strokeStyle = '#A58BFF'; o.fillStyle = '#A58BFF'; o.lineWidth = Math.max(3, m * 0.01);
      o.beginPath(); o.moveTo(-10, y - m * 0.02); o.lineTo(x1, y); o.stroke();
      o.lineWidth = Math.max(2, m * 0.006);
      for (var x = 0; x < x1; x += Math.max(14, W * 0.025)) { var yy = y - m * 0.02 * (1 - x / x1); o.beginPath(); o.moveTo(x, yy); o.lineTo(x, yy + m * 0.05); o.stroke(); }
      var pw = m * 0.09; o.fillRect(x1 - pw * 0.15, y - m * 0.035, pw, m * 0.035);   // pavilion
      o.beginPath(); o.moveTo(x1 - pw * 0.3, y - m * 0.035); o.lineTo(x1 + pw * 0.35, y - m * 0.075); o.lineTo(x1 + pw * 1.0, y - m * 0.035); o.fill();
    }, step);
    var palms = sample(function (o) {
      o.strokeStyle = '#3DD6B0'; o.lineCap = 'round';
      [[W * 0.86, 1], [W * 0.93, 0.78], [W * 0.04, 0.62]].forEach(function (pl) {
        var bx = pl[0], s = m * 0.3 * pl[1], tx = bx - s * 0.18, ty = hy + m * 0.12 - s;
        o.lineWidth = Math.max(3, s * 0.05); o.beginPath(); o.moveTo(bx, hy + m * 0.12);
        o.quadraticCurveTo(bx + s * 0.08, hy + m * 0.12 - s * 0.5, tx, ty); o.stroke();
        o.lineWidth = Math.max(3, s * 0.04);
        [[-1, .1], [-0.9, .45], [1, .1], [0.9, .45], [0.1, -.35]].forEach(function (f) {
          o.beginPath(); o.moveTo(tx, ty);
          o.quadraticCurveTo(tx + f[0] * s * 0.25, ty - s * 0.2 + f[1] * s * 0.1, tx + f[0] * s * 0.42, ty + f[1] * s * 0.35); o.stroke();
        });
      });
    }, step);
    return quota([[sun, 0.38], [bridge, 0.14], [pier, 0.22], [palms, 0.26]], total);
  }

  /* particles */
  for (var i = 0; i < N; i++) {
    var c = COLORS[i % COLORS.length];
    parts.push({
      x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0,
      hx: Math.random() * W, hy: Math.random() * H,               // home spot while "alone"
      c: c, base: c, tc: c, a: 0, ta: 0, k: 0.07 + Math.random() * 0.07,
      ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.8, wave: i % 2, u: Math.random(),
      j: null, dyn: false
    });
  }
  /* the jet and the waves move every frame; everything else eases to fixed targets */
  var JET_SHARE = 0.72, BAY_SHARE = 0.66;

  var scenes = { words: [], logo: null, jet: [], bay: [] }, scene = 'alone', wordIdx = -1;
  function assign(pts) {
    parts.forEach(function (p, i) {
      if (!pts.length) return;
      var q = pts[i % pts.length], extra = i >= pts.length;
      p.tx = q.x + (extra ? (Math.random() - 0.5) * 2 : 0); p.ty = q.y + (extra ? (Math.random() - 0.5) * 2 : 0);
      p.tc = q.c; p.ta = extra ? 0.35 : 1; p.dyn = false;
    });
  }
  function on(el) { [cap1, capJet, capBay, eyebrow, cap2].forEach(function (e) { e.classList.toggle('on', e === el); }); }

  function setScene(name, arg) {
    scene = name;
    if (name === 'alone') on(cap1);
    if (name === 'jet') {
      on(capJet); word.textContent = 'Built by two service members.';
      var nj = Math.round(N * JET_SHARE);
      parts.forEach(function (p, i) { p.j = i < nj ? scenes.jet[i % scenes.jet.length] : null; p.dyn = true; });
    }
    if (name === 'bay') {
      on(capBay); word.textContent = 'Rooted in Bay County.';
      var nb = Math.round(N * BAY_SHARE), pts = scenes.bay;
      parts.forEach(function (p, i) {
        p.j = null;
        if (i < nb && pts.length) { var q = pts[i % pts.length]; p.tx = q.x; p.ty = q.y; p.tc = q.c; p.ta = 1; p.dyn = false; }
        else p.dyn = true;
      });
    }
    if (name === 'values') {
      on(eyebrow);
      wordIdx = arg; assign(scenes.words[arg]);
      word.textContent = VALUES[arg]; // for screen readers via live region text
    }
    if (name === 'logo') { on(cap2); word.textContent = 'If you want to go far, go together.'; assign(scenes.logo); }
  }

  function ease(s) { return s < 0 ? 0 : s > 1 ? 1 : s; }

  function frame(now) {
    if (done) return;
    var t = (now - t0) / 1000, dt = 1 / 60;
    // timeline
    if (scene === 'alone' && t > T.jet) setScene('jet');
    if (scene === 'jet' && t > T.bay) setScene('bay');
    if (scene === 'bay' && t > T.values) setScene('values', 0);
    if (scene === 'values') { var wi = Math.min(4, Math.floor((t - T.values) / T.word)); if (wi !== wordIdx) setScene('values', wi); if (t > T.logo) setScene('logo'); }
    if (t > T.end && !root.classList.contains('out')) finish();

    // where the jet is: forms up on the left, then punches out to the right while climbing
    var s = ease((t - T.jet) / (T.bay - T.jet)), late = Math.max(0, s - 0.42);
    var jx = W * (0.3 + 0.1 * s) + late * late * W * 3.4, jy = H * (0.46 - 0.12 * s), ang = -0.07 - 0.1 * late;
    var ca = Math.cos(ang), sa = Math.sin(ang);

    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < N; i++) {
      var p = parts[i], kk = p.k;
      if (scene === 'alone') {
        p.tx = p.hx + Math.sin(t * p.sp + p.ph) * 18; p.ty = p.hy + Math.cos(t * p.sp * 0.8 + p.ph) * 18;
        p.ta = 0.25 + 0.75 * Math.abs(Math.sin(t * 1.4 + p.ph)) * Math.min(1, t * 1.5); p.tc = p.base;
      } else if (scene === 'jet') {
        if (p.j) {
          p.tx = jx + p.j.x * ca - p.j.y * sa; p.ty = jy + p.j.x * sa + p.j.y * ca; p.tc = p.j.c; p.ta = 1; kk = 0.24;
        } else {   // contrail streaming from the tail
          var back = JL * 0.52 + p.u * W * (0.25 + 0.6 * s);
          p.tx = jx - back * ca; p.ty = jy - back * sa + Math.sin(p.u * 40 + t * 6) * (2 + p.u * 14);
          p.tc = p.u < 0.15 ? '#FFD23F' : (p.wave ? '#C9D6FF' : '#8FA0C2'); p.ta = Math.max(0.08, 0.9 - p.u); kk = 0.16;
        }
      } else if (scene === 'bay' && p.dyn) {   // Gulf waves under the skyline
        var u = p.u, row = (i % 3), y0 = HY + H * (0.14 + row * 0.07), amp = Math.min(H * 0.018, 12) * (1 + row * 0.4);
        p.tx = u * W; p.ty = y0 + Math.sin(u * Math.PI * (5 - row) + t * (2.6 - row * 0.5) + row) * amp;
        p.tc = row === 0 ? '#5B8CFF' : row === 1 ? '#A58BFF' : '#2457D6'; p.ta = 1 - row * 0.2;
      }
      if (scene === 'values') kk = p.k * 2.2;
      var k = 1 - Math.pow(1 - kk, dt * 60);
      p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; p.a += (p.ta - p.a) * 0.12;
      if (p.c !== p.tc && Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 40) p.c = p.tc;
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
    scenes.jet = jetPts(); scenes.bay = bayPts(Math.round(N * BAY_SHARE));
    root.classList.add('go');
    t0 = performance.now(); setScene('alone');
    raf = requestAnimationFrame(frame);
  }
  var fontReady = document.fonts && document.fonts.load ? document.fonts.load(FONT.replace('{s}', '100')) : Promise.resolve();
  Promise.race([fontReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(start, start);
})();
