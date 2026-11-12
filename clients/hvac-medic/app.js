/* HVAC Medic — site behaviour. Plain JS, no build step. */
(function () {
  'use strict';

  /* ================= CONFIG =================
     FORM_ENDPOINT: paste a form backend URL to get requests by email,
     e.g. 'https://formspree.io/f/abcdwxyz'. Leave empty and the form opens a
     pre-filled text message to HVAC Medic instead, so no request is lost. */
  var FORM_ENDPOINT = '';
  var PHONE = '+12188206351';

  /* REVIEWS: only add real reviews, copied word for word, from customers who
     agreed to be featured. Never write, edit or pay for reviews (FTC rule,
     16 CFR Part 465). Example:
     { text: 'Fixed our furnace the same day.', name: 'Jane D.', town: 'Baxter', source: 'Facebook', stars: 5 } */
  var REVIEWS = [];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  // ---------- reveal on scroll ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('on'); }); }

  // ================= JOB SLIDESHOW =================
  // 6 photos x 2.5s = one 15-second loop. Glass sweep transition, swipe/drag,
  // arrow keys, thumbnails, pause button. Autoplay pauses on hover/focus,
  // off-screen, in a background tab, and is off for reduced-motion users.
  var deck = $('#show');
  if (deck) {
    var DUR = 2500;
    var slides = $$('.sl', deck), thumbs = $$('.th'), thumbsEl = $('.thumbs');
    var playBtn = $('#sl-play'), live = $('#sl-live'), num = $('#sl-n');
    var cur = 0, timer = null, running = false, remaining = DUR, startedAt = 0;
    var userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hoverPaused = false, offscreen = false;
    deck.style.setProperty('--dur', DUR + 'ms');
    if (thumbsEl) thumbsEl.style.setProperty('--dur', DUR + 'ms');

    function isPaused() { return userPaused || hoverPaused || offscreen || document.hidden; }
    function schedule() {
      if (running) return;
      running = true; startedAt = Date.now();
      timer = setTimeout(function () { running = false; go(cur + 1, 1, false); }, remaining);
    }
    function halt() {
      if (!running) return;
      clearTimeout(timer); running = false;
      remaining = Math.max(200, remaining - (Date.now() - startedAt));
    }
    function sync() {
      var p = isPaused();
      deck.classList.toggle('paused', p);
      if (thumbsEl) thumbsEl.classList.toggle('paused', p);
      playBtn.setAttribute('aria-pressed', String(userPaused));
      playBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
      if (p) halt(); else schedule();
    }
    function go(i, dir, byUser) {
      var n = slides.length, next = (i + n) % n;
      if (next === cur) return;
      var old = slides[cur];
      deck.classList.toggle('go', false); deck.classList.toggle('fwd', false); deck.classList.toggle('back', false);
      void deck.offsetWidth;
      deck.classList.add(dir < 0 ? 'back' : 'fwd', 'go');
      old.classList.toggle('is-on', false); old.classList.add('is-out'); old.setAttribute('aria-hidden', 'true');
      setTimeout(function () { old.classList.toggle('is-out', false); }, 1000);
      var s = slides[next];
      s.classList.add('is-on'); s.removeAttribute('aria-hidden');
      var im = $('img', s); if (im) im.loading = 'eager';
      thumbs.forEach(function (t, k) {
        t.classList.toggle('is-on', false); t.removeAttribute('aria-current');
        t.classList.toggle('done', k < next);
      });
      void thumbs[next].offsetWidth;
      thumbs[next].classList.add('is-on'); thumbs[next].setAttribute('aria-current', 'true');
      num.textContent = ('0' + (next + 1)).slice(-2);
      if (byUser) live.textContent = s.getAttribute('aria-label');
      cur = next;
      clearTimeout(timer); running = false; remaining = DUR;
      sync();
    }

    $('#sl-next').addEventListener('click', function () { go(cur + 1, 1, true); });
    $('#sl-prev').addEventListener('click', function () { go(cur - 1, -1, true); });
    playBtn.addEventListener('click', function () { userPaused = !userPaused; sync(); });
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { var k = +t.dataset.go; go(k, k < cur ? -1 : 1, true); });
    });
    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, -1, true); }
    });

    // swipe / drag
    var x0 = null, y0 = 0, pid = null;
    deck.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      x0 = e.clientX; y0 = e.clientY; pid = e.pointerId; deck.classList.add('dragging');
    });
    function endDrag(e) {
      if (x0 === null || e.pointerId !== pid) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null; deck.classList.toggle('dragging', false);
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1, true);
    }
    deck.addEventListener('pointerup', endDrag);
    deck.addEventListener('pointercancel', function () { x0 = null; deck.classList.toggle('dragging', false); });

    // pause while someone is looking closely
    if (window.matchMedia('(hover: hover)').matches) {
      deck.addEventListener('mouseenter', function () { hoverPaused = true; sync(); });
      deck.addEventListener('mouseleave', function () { hoverPaused = false; sync(); });
    }
    deck.addEventListener('focusin', function () { hoverPaused = true; sync(); });
    deck.addEventListener('focusout', function (e) { if (!deck.contains(e.relatedTarget)) { hoverPaused = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { offscreen = !es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(deck);
    }
    sync();
  }

  // ---------- reviews ----------
  var grid = $('#reviews-grid'), empty = $('#reviews-empty');
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  if (grid) {
    if (REVIEWS.length) {
      grid.innerHTML = REVIEWS.map(function (r) {
        var stars = r.stars ? '<div class="stars" aria-label="' + r.stars + ' out of 5 stars">' + '★★★★★'.slice(0, r.stars) + '</div>' : '';
        return '<figure class="rev">' + stars + '<blockquote>“' + esc(r.text) + '”</blockquote><figcaption>' + esc(r.name) +
          '<span>' + esc([r.town, r.source ? r.source + ' review' : ''].filter(Boolean).join(' · ')) + '</span></figcaption></figure>';
      }).join('');
      grid.style.marginBottom = '24px';
    } else { grid.hidden = true; }
  }

  // ---------- symptom checker ----------
  var dx = {
    noheat: { t: 'No heat', s: ['urgent', 'Call today'], steps: ['Check the thermostat is set to Heat and a few degrees above room temperature.', 'Make sure the furnace switch (looks like a light switch) is on.', 'Look at the filter. A clogged filter can shut a furnace down.', 'Check the breaker panel for a tripped breaker.'], n: 'Still nothing? In a Minnesota winter, pipes can freeze in hours. Give us a call.' },
    cold: { t: 'Cold rooms', s: ['soon', 'Book a visit'], steps: ['Open every supply and return vent in the house.', 'Move furniture or rugs off of vents.', 'Replace the furnace filter.'], n: 'Ongoing cold spots usually mean duct problems or an undersized system. We can check airflow room by room.' },
    noise: { t: 'Strange noises', s: ['soon', 'Book a visit'], steps: ['Banging or booming at startup can be delayed ignition. Turn the system off and have it checked.', 'Squealing often means a worn blower belt or motor bearing.', 'Rattling can be a loose panel or duct.'], n: 'Loud or new noises are worth a professional look before they become a breakdown.' },
    ac: { t: 'Warm AC air', s: ['soon', 'Book a visit'], steps: ['Set the thermostat to Cool and the fan to Auto.', 'Check that the outdoor unit is running and clear of grass and debris.', 'Replace the filter.'], n: 'Warm air with the outdoor unit running can mean a dirty coil, low refrigerant or a failed part. We can track it down.' },
    bill: { t: 'High energy bill', s: ['diy', 'Start here'], steps: ['Change the filter. Do it every 1–3 months in heating season.', 'Check that the thermostat schedule matches when you\'re home.', 'Feel for drafts around doors and windows.'], n: 'An older furnace can use noticeably more fuel than a new high-efficiency model. Ask us for a free comparison.' }
  };
  var T = $('#dx-title'), S = $('#dx-sev'), L = $('#dx-steps'), N = $('#dx-note');
  function show(k) {
    var d = dx[k]; T.textContent = d.t; S.className = 'sev ' + d.s[0]; S.textContent = d.s[1];
    L.innerHTML = d.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); N.textContent = d.n;
    $$('.sym').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
  }
  $$('.sym').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.k); }); });
  if (T) show('noheat');

  // ---------- legal dialogs ----------
  function openDoc(id) {
    var d = document.getElementById(id);
    if (!d || !d.showModal) return false;
    if (!d.open) d.showModal();
    return true;
  }
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function (e) { if (openDoc(b.dataset.open)) e.preventDefault(); });
  });
  $$('dialog.legal-doc').forEach(function (d) {
    $('[data-close]', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  });
  var h = location.hash.slice(1);
  if (['privacy', 'terms', 'access'].indexOf(h) > -1) openDoc(h);

  // ---------- request form ----------
  var form = $('#req'), sent = $('#sent');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements._gotcha.value) return;
      var ok = true;
      ['name', 'phone'].forEach(function (n) {
        var el = form.elements[n], bad = !el.value.trim() || (n === 'phone' && el.value.replace(/\D/g, '').length < 10);
        el.closest('.field').classList.toggle('err', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      var c = $('#r-consent'), row = $('#consent-row');
      row.classList.toggle('err', !c.checked);
      if (!c.checked) { if (ok) c.focus(); ok = false; }
      if (!ok) return;

      var data = {
        name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(),
        need: form.elements.need.value, details: form.elements.details.value.trim(), consent: 'yes'
      };
      var body = 'Hi, this is ' + data.name + ' (' + data.phone + '). I need: ' + data.need + '.' + (data.details ? ' ' + data.details : '');
      var sms = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);

      function done(viaEmail) {
        sent.hidden = false;
        sent.innerHTML = viaEmail
          ? 'Request received. HVAC Medic will get back to you soon. For anything urgent, call (218) 820-6351.'
          : 'Almost done: <a href="' + sms + '">tap here to text your request</a> to HVAC Medic, or call (218) 820-6351.';
        if (!viaEmail) location.href = sms;
      }
      if (!FORM_ENDPOINT) { done(false); return; }
      var fd = new FormData(); Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      fd.append('_subject', 'Website request: ' + data.need + ' from ' + data.name);
      fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { done(r.ok); }).catch(function () { done(false); });
    });
  }
})();
