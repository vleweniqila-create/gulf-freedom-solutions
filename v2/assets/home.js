/* Gulf Freedom Solutions — homepage interactions: hero live card, Bay County panels, growth simulator */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var num = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var money = function (n) { return '$' + num(n); };

  /* ---------- hero live card ---------- */
  var hdN = $('#hd-n'), toast = $('#hd-toast');
  if (hdN && !reduce) {
    var v = 1240;
    setInterval(function () { v += 1 + ((Math.random() * 4) | 0); hdN.textContent = num(v); }, 1400);
  }
  if (toast) {
    var msgs = [
      ['☎', 'New call from Google', 'Lynn Haven · just now'],
      ['★', 'New 5-star review', 'Panama City · 2 min ago'],
      ['✉', '"Do you have openings Saturday?"', 'Instagram ad · 4 min ago'],
      ['➜', 'Directions requested', 'Panama City Beach · 6 min ago'],
      ['✓', 'Booking confirmed', 'Callaway · 9 min ago']
    ], mi = 0;
    setInterval(function () {
      toast.classList.add('swap');
      setTimeout(function () {
        mi = (mi + 1) % msgs.length;
        toast.querySelector('em').textContent = msgs[mi][0];
        $('#hd-msg').textContent = msgs[mi][1];
        $('#hd-sub').textContent = msgs[mi][2];
        toast.classList.remove('swap');
      }, 420);
    }, 3600);
  }

  /* ---------- Bay County panels ---------- */
  var panels = $$('#panels .panel');
  var activate = function (p) { panels.forEach(function (x) { x.classList.toggle('on', x === p); }); };
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { activate(p); });
    p.addEventListener('focus', function () { activate(p); });
    p.addEventListener('click', function () { activate(p); });
  });
  if (panels.length && !reduce) {
    var pi = 0, auto = setInterval(function () {
      pi = (pi + 1) % panels.length; activate(panels[pi]);
    }, 4200);
    $('#panels').addEventListener('mouseenter', function () { clearInterval(auto); });
  }

  /* ---------- growth simulator ---------- */
  var chart = $('#sim-chart');
  if (!chart) return;
  // base: monthly visits today, visit-to-lead rate, average sale, close rate
  var TYPES = {
    food: { v: 900, c: 0.06, t: 28, ch: [46, 34, 20] },
    salon: { v: 450, c: 0.09, t: 65, ch: [38, 42, 20] },
    home: { v: 320, c: 0.07, t: 350, ch: [58, 26, 16] },
    shop: { v: 650, c: 0.045, t: 48, ch: [44, 36, 20] },
    tour: { v: 1300, c: 0.05, t: 140, ch: [40, 44, 16] }
  };
  var state = { t: 'food', web: true, care: true, ads: true, bud: 300 };
  var W = 640, H = 260, L = 46, R = 14, T = 14, B = 34;
  var months = ['Now', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

  function model() {
    var ty = TYPES[state.t], own = [], us = [];
    var g = 0.004 + (state.web ? 0.011 : 0) + (state.care ? 0.004 : 0) + (state.ads ? 0.006 + (state.bud / 1500) * 0.02 : 0);
    var conv = ty.c * (state.web ? 1.3 : 1);
    var o = ty.v, u = ty.v;
    for (var m = 0; m <= 12; m++) {
      if (m > 0) {
        o *= 1.004;
        u *= 1 + g * (m < 3 ? m / 3 : 1);
      }
      own.push(o); us.push(u);
    }
    var addRev = 0;
    for (var k = 1; k <= 12; k++) addRev += (us[k] * conv - own[k] * ty.c) * ty.t * 0.35;
    var ch = ty.ch.slice();
    if (state.ads) { var shift = Math.round(4 + state.bud / 150); ch[1] += shift; ch[0] -= Math.round(shift * 0.6); ch[2] -= shift - Math.round(shift * 0.6); }
    if (!state.ads) { ch[0] += ch[1] - 12; ch[1] = 12; }
    return {
      own: own, us: us, growth: us[12] / us[0] - 1,
      v: us[12], dv: us[12] - us[0],
      l: us[12] * conv, dl: us[12] * conv - us[0] * ty.c,
      rev: Math.max(0, addRev), ch: ch
    };
  }

  var cur = null, anim = null, svgEl = $('svg', chart);
  var X = function (i) { return L + (i / 12) * (W - L - R); };
  var Y, maxV;
  function scaleFor(d) {
    W = Math.max(320, Math.round(svgEl.clientWidth || 640)); H = W < 520 ? 230 : 260;
    svgEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H); $('#sim-vl').setAttribute('y2', H - B);
    maxV = Math.max.apply(null, d.us) * 1.08;
    var minV = Math.min.apply(null, d.own) * 0.85;
    Y = function (v) { return T + (1 - (v - minV) / (maxV - minV)) * (H - T - B); };
    var g = '', ax = '';
    for (var i = 0; i <= 4; i++) {
      var val = minV + (maxV - minV) * (i / 4), y = Y(val);
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/>';
      ax += '<text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val)) + '</text>';
    }
    months.forEach(function (m, i) { if (i % 2 === 0) ax += '<text x="' + X(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + m + '</text>'; });
    $('#sim-grid').innerHTML = g; $('#sim-ax').innerHTML = ax;
  }
  function path(arr) {
    // Catmull-Rom spline through every point, for a smooth line without wobbles
    var pts = arr.map(function (v, i) { return [X(i), Y(v)]; }), d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + p2[1];
    }
    return d;
  }
  function draw(d) {
    $('#sim-us').setAttribute('d', path(d.us));
    $('#sim-own').setAttribute('d', path(d.own));
    $('#sim-area').setAttribute('d', path(d.us) + ' L' + X(12) + ' ' + (H - B) + ' L' + X(0) + ' ' + (H - B) + 'Z');
  }
  function setKpis(d) {
    $('#k-g').textContent = '+' + Math.round(d.growth * 100) + '%';
    $('#k-v').textContent = num(d.v); $('#k-v2').textContent = '+' + num(d.dv);
    $('#k-l').textContent = num(d.l); $('#k-l2').textContent = '+' + num(d.dl);
    $('#k-r').textContent = d.rev >= 10000 ? '$' + (d.rev / 1000).toFixed(0) + 'k' : money(d.rev);
    [1, 2, 3].forEach(function (n) {
      $('#c-' + n).textContent = Math.round(d.ch[n - 1]) + '%';
      $('#c-' + n + 'b').style.width = d.ch[n - 1] + '%';
    });
  }
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function mix(a, b, t) {
    var o = {};
    for (var k in b) o[k] = Array.isArray(b[k]) ? b[k].map(function (v, i) { return lerp(a[k][i], v, t); }) : lerp(a[k], b[k], t);
    return o;
  }
  function update() {
    var next = model();
    var from = cur || mix(next, next, 0);
    if (!cur) { from = JSON.parse(JSON.stringify(next)); from.us = next.own.slice(); from.growth = 0; from.v = next.own[0]; from.dv = 0; from.l = 0; from.dl = 0; from.rev = 0; from.ch = [0, 0, 0]; }
    scaleFor(next);
    if (anim) cancelAnimationFrame(anim);
    if (reduce) { cur = next; draw(next); setKpis(next); return; }
    var t0 = performance.now(), dur = 700;
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      var f = mix(from, next, e);
      draw(f); setKpis(f); cur = f;
      if (t < 1) anim = requestAnimationFrame(step); else cur = next;
    })(t0);
  }

  $$('#sim-type button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#sim-type button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      state.t = b.dataset.t; update();
    });
  });
  $$('#sim-svc button').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      state[b.dataset.s] = on;
      $('#sim-bud').disabled = !state.ads;
      $('#sim-bud').closest('.rng').style.opacity = state.ads ? 1 : 0.45;
      update();
    });
  });
  var bud = $('#sim-bud'), budO = $('#sim-bud-o');
  var setBud = function () {
    state.bud = +bud.value; budO.textContent = money(state.bud);
    bud.style.setProperty('--p', ((bud.value - bud.min) / (bud.max - bud.min)) * 100 + '%');
  };
  bud.addEventListener('input', function () { setBud(); update(); });
  setBud();

  /* hover tooltip */
  var tip = $('#sim-tip'), vl = $('#sim-vl'), dot = $('#sim-dot');
  function hover(clientX) {
    if (!cur) return;
    var r = svgEl.getBoundingClientRect(), sx = (clientX - r.left) / r.width * W;
    var i = Math.max(0, Math.min(12, Math.round((sx - L) / (W - L - R) * 12)));
    var x = X(i), y = Y(cur.us[i]);
    vl.setAttribute('x1', x); vl.setAttribute('x2', x);
    dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    tip.style.left = Math.max(80, Math.min(r.width - 80, x / W * r.width)) + 'px'; tip.style.top = (y / H * r.height) + 'px';
    tip.innerHTML = '<b>' + (i ? 'Month ' + i : 'Today') + '</b><br>' + num(cur.us[i]) + ' visits with us<br>' + num(cur.own[i]) + ' on your own';
    chart.classList.add('hovering');
  }
  svgEl.addEventListener('mousemove', function (e) { hover(e.clientX); });
  svgEl.addEventListener('touchmove', function (e) { hover(e.touches[0].clientX); }, { passive: true });
  svgEl.addEventListener('mouseleave', function () { chart.classList.remove('hovering'); });
  chart.setAttribute('data-cursor', 'Look');

  /* start when visible */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); setTimeout(update, 300); }
    }, { threshold: 0.3 });
    io.observe(chart);
  } else update();
})();
