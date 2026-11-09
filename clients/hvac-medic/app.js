/* HVAC Medic — site behaviour. Plain JS, no build step. */
(function () {
  'use strict';

  /* ================= CONFIG =================
     FORM_ENDPOINT: paste a form backend URL to get leads by email.
     Formspree example: 'https://formspree.io/f/abcdwxyz'
     Leave empty and the form still works: the visitor gets a one-tap
     "Text this to Brent" button with their whole request filled in. */
  var FORM_ENDPOINT = '';
  var PHONE = '+12188206351';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- load + nav ----------
  requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  var nav = $('#nav'), dock = $('.dock'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    if (dock && hero) dock.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- reveal on scroll ----------
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }) : null;

  $$('.reveal, .reveal-stagger, .method-track, .vitals').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('is-in');
  });

  // ---------- counters ----------
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0);
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- snow in hero scene ----------
  var snow = $('#snow');
  if (snow && !reduce) {
    var ns = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 46; i++) {
      var c = document.createElementNS(ns, 'circle');
      var r = Math.random() * 2.2 + 0.8;
      c.setAttribute('cx', (Math.random() * 640 - 20).toFixed(1));
      c.setAttribute('cy', '0');
      c.setAttribute('r', r.toFixed(1));
      c.setAttribute('opacity', (0.45 + Math.random() * 0.5).toFixed(2));
      c.style.setProperty('--dx', (Math.random() * 60 - 20).toFixed(0) + 'px');
      c.style.animationDuration = (6 + Math.random() * 8).toFixed(1) + 's';
      c.style.animationDelay = (-Math.random() * 14).toFixed(1) + 's';
      snow.appendChild(c);
    }
  }

  // ---------- tilt + magnet (mouse only) ----------
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        el.style.setProperty('--bx', ((e.clientX - b.left - b.width / 2) * 0.18).toFixed(1) + 'px');
        el.style.setProperty('--by', ((e.clientY - b.top - b.height / 2) * 0.28).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--bx', '0px'); el.style.setProperty('--by', '0px'); });
    });
  }

  // ================= TRIAGE FORM =================
  var form = $('#triage-form');
  if (form) {
    var steps = $$('.tri-step', form), cur = 1, total = steps.length;
    var meter = $('.tri-meter span', form), countEl = $('#tri-step-n'), back = $('.tri-back', form);
    var prog = $$('.tri-progress li');
    var done = $('.tri-done', form), nav2 = $('.tri-nav', form), counter = $('.tri-count', form);

    var URG = [
      { label: 'Planning ahead', note: "No rush. We'll find a time that works for you.", fill: 25, prio: 'Routine', cls: '' },
      { label: 'This week', note: "We'll get you on the schedule within a few days.", fill: 48, prio: 'Soon', cls: '' },
      { label: 'Today, please', note: "We'll do our best to get to you today.", fill: 72, prio: 'High', cls: 'p-high' },
      { label: 'Emergency', note: 'No heat right now? After you send this, call or text so Brent sees it right away.', fill: 96, prio: 'Urgent', cls: 'p-urgent' }
    ];

    function chart(key, val) {
      var dd = $('[data-chart="' + key + '"]');
      if (!dd || dd.textContent === val) return;
      dd.textContent = val; dd.classList.remove('flash'); void dd.offsetWidth; dd.classList.add('flash');
    }

    function show(n, dir) {
      cur = n;
      steps.forEach(function (s) {
        var on = +s.dataset.step === n;
        s.classList.toggle('is-active', on);
        s.classList.toggle('is-back', on && dir < 0);
      });
      meter.style.width = (n / total * 100) + '%';
      countEl.textContent = n;
      back.hidden = n === 1;
      prog.forEach(function (li, i) {
        li.classList.toggle('is-on', i + 1 === n);
        li.classList.toggle('is-done', i + 1 < n);
      });
      var first = $('.tri-step.is-active input:not([type=hidden]):not([type=radio]), .tri-step.is-active input[type=range]', form);
      if (first && finePointer && n > 2) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
    }

    function validate(n) {
      var ok = true;
      $$('.tri-step[data-step="' + n + '"] [required]', form).forEach(function (inp) {
        var f = inp.closest('.field');
        var bad = !inp.value.trim() || (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 10);
        if (f) { f.classList.remove('is-error'); if (bad) { void f.offsetWidth; f.classList.add('is-error'); } }
        if (bad && ok) { inp.focus(); ok = false; }
      });
      var zip = form.elements.zip;
      if (n === 4 && zip.value && !/^\d{5}$/.test(zip.value)) {
        zip.closest('.field').classList.add('is-error'); zip.focus(); ok = false;
      }
      return ok;
    }

    // auto-advance on tile pick
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'symptom') { chart('symptom', t.value); setTimeout(function () { if (cur === 1) show(2, 1); }, 320); }
      if (t.name === 'system') { chart('system', t.value); setTimeout(function () { if (cur === 2) show(3, 1); }, 320); }
    });
    form.addEventListener('input', function (e) {
      if (e.target.name === 'town') chart('town', e.target.value.trim() || '—');
      var f = e.target.closest('.field'); if (f) f.classList.remove('is-error');
    });

    // urgency slider
    var urg = $('#urgency'), urgBox = $('.urgency', form);
    function setUrg() {
      var u = URG[+urg.value];
      $('#urgency-label').textContent = u.label;
      $('#urgency-note').textContent = u.note;
      urgBox.dataset.level = urg.value;
      $('.thermo-fill', form).style.setProperty('--fill', u.fill + '%');
      form.elements.urgency.value = u.label;
      chart('urgency', u.label);
    }
    urg.addEventListener('input', setUrg);
    setUrg();
    $('[data-chart="urgency"]').textContent = '—';

    $$('.tri-next', form).forEach(function (b) {
      b.addEventListener('click', function () { if (validate(cur)) show(cur + 1, 1); });
    });
    back.addEventListener('click', function () { if (cur > 1) show(cur - 1, -1); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && cur < total) {
        e.preventDefault(); if (validate(cur)) show(cur + 1, 1);
      }
    });

    // presets from hero chips / service links
    $$('[data-preset]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var key = el.dataset.preset;
        var radio = $('input[name="symptom"][data-key="' + key + '"]', form);
        if (!radio) return;
        e.preventDefault();
        if (!done.hidden) return document.getElementById('triage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        radio.checked = true; chart('symptom', radio.value);
        show(2, 1);
        document.getElementById('triage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    function val(name) { var el = form.elements[name]; if (!el) return ''; return (el.value || '').trim(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(5)) return;
      if (val('_gotcha')) return; // bot

      var u = URG[+urg.value];
      var d = new Date();
      var caseNo = 'HM-' + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + Math.floor(1000 + Math.random() * 9000);
      var data = {
        name: val('name'), phone: val('phone'), contact_pref: val('contact_pref'),
        symptom: val('symptom') || 'Not given', system: val('system') || 'Not given',
        urgency: u.label, priority: u.prio, town: val('town'), zip: val('zip'),
        property: val('property'), notes: val('notes'), case: caseNo
      };

      var summary = 'Hi Brent, this is ' + data.name + '. Case ' + caseNo + '.\n' +
        'Need: ' + data.symptom + '\nSystem: ' + data.system + '\nUrgency: ' + data.urgency +
        '\nWhere: ' + data.town + (data.zip ? ' ' + data.zip : '') + ' (' + data.property + ')' +
        (data.notes ? '\nNotes: ' + data.notes : '') + '\nBest way to reach me: ' + data.contact_pref + ' ' + data.phone;
      $('#sms-link').href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(summary);

      function finish(sent) {
        $('[data-out="name"]', done).textContent = data.name.split(' ')[0] || 'neighbor';
        $('[data-out="case"]', done).textContent = caseNo;
        var p = $('[data-out="priority"]', done); p.textContent = data.priority; p.className = 'prio ' + u.cls;
        $('[data-out="symptom"]', done).textContent = data.symptom;
        $('[data-out="system"]', done).textContent = data.system;
        $('[data-out="town"]', done).textContent = data.town;
        var next;
        if (!sent) next = 'Last step: tap "Text this to Brent" below. Your whole request is already typed out for you.';
        else if (u.prio === 'Urgent') next = 'This is marked urgent. Call or text Brent now so he sees it right away.';
        else next = 'Brent will ' + (data.contact_pref === 'Text' ? 'text' : 'call') + ' you at ' + data.phone + ' to set up your free quote.';
        $('[data-out="next"]', done).textContent = next;
        if (!sent) { var s = $('#sms-link'); s.className = 'btn btn-ember'; s.previousElementSibling.className = 'btn btn-ghost-dark'; }
        steps.forEach(function (s) { s.classList.remove('is-active'); });
        nav2.hidden = true; counter.hidden = true; meter.style.width = '100%';
        prog.forEach(function (li) { li.classList.remove('is-on'); li.classList.add('is-done'); });
        done.hidden = false; done.focus();
        if (window.gtag) window.gtag('event', 'generate_lead', { priority: data.priority });
      }

      if (!FORM_ENDPOINT) { finish(false); return; }
      var btn = $('.tri-submit', form); btn.classList.add('is-loading'); btn.firstChild.textContent = 'Sending… ';
      var fd = new FormData();
      Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      fd.append('_subject', 'New ' + data.priority + ' lead: ' + data.symptom + ' in ' + data.town);
      fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { finish(r.ok); })
        .catch(function () { finish(false); });
    });
  }

  // ---------- job photos: show a styled placeholder until real photos are added ----------
  $$('.ph img').forEach(function (img) {
    function fail() { img.closest('.ph').classList.add('is-empty'); img.style.display = 'none'; }
    if (img.complete && !img.naturalWidth) fail(); else img.addEventListener('error', fail);
  });

  // ================= SAVINGS ESTIMATOR =================
  var bill = $('#bill');
  if (bill) {
    // Rough share of yearly heating cost a high-efficiency replacement can save.
    var RATES = { electric: [0.35, 0.50], oldlp: [0.12, 0.20], oil: [0.20, 0.35], boiler: [0.10, 0.20] };
    var MONTHS = 7; // typical Minnesota heating season
    var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var shown = {};
    function tween(id, to) {
      var el = document.getElementById(id), from = shown[id] || to;
      shown[id] = to;
      if (reduce || from === to) { el.textContent = fmt(to); return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 500, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    function calc() {
      var fuel = ($('input[name="fuel"]:checked') || {}).value || 'electric';
      var b = +bill.value, year = b * MONTHS, r = RATES[fuel], mid = (r[0] + r[1]) / 2;
      $('#bill-out').textContent = fmt(b);
      tween('now-out', year); tween('hp-out', year * (1 - mid));
      tween('save-lo', year * r[0]); tween('save-hi', year * r[1]);
      $('.bar-hp').style.width = ((1 - mid) * 100).toFixed(0) + '%';
    }
    bill.addEventListener('input', calc);
    $$('input[name="fuel"]').forEach(function (r) { r.addEventListener('change', calc); });
    calc();
  }
})();
