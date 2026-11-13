/* Gulf Freedom Solutions: cookie consent.
   HubSpot tracking only loads after the visitor clicks "Accept".
   - Choice is saved in localStorage ("gfs-consent") for 12 months, then we ask again.
   - A Global Privacy Control signal (navigator.globalPrivacyControl) counts as "Decline".
   - Any element with [data-cookie-settings] reopens the banner.
   - Declining after accepting removes HubSpot cookies and reloads the page. */
(function () {
  var KEY = 'gfs-consent';
  var MAX_AGE = 365 * 24 * 3600 * 1000;
  var HUBSPOT = 'https://js-na2.hs-scripts.com/247973835.js';
  var HS_COOKIES = ['__hstc', 'hubspotutk', '__hssc', '__hssrc', 'messagesUtk', '__hs_opt_out', '__hs_do_not_track', '__hs_initial_opt_in'];

  var me = document.currentScript;
  var base = me && me.src ? me.src.replace(/assets\/consent\.js.*$/, '') : '/';
  var gpc = navigator.globalPrivacyControl === true;

  function read() {
    try {
      var raw = localStorage.getItem(KEY); if (!raw) return null;
      var p = raw.split('|'), t = +p[1] || 0;
      if (Date.now() - t > MAX_AGE) return null;
      return p[0] === 'yes' || p[0] === 'no' ? p[0] : null;
    } catch (e) { return null; }
  }
  function save(v) { try { localStorage.setItem(KEY, v + '|' + Date.now()); } catch (e) {} }

  function loadHubSpot() {
    if (document.getElementById('hs-script-loader')) return;
    var s = document.createElement('script');
    s.id = 'hs-script-loader'; s.async = true; s.defer = true; s.src = HUBSPOT;
    document.body.appendChild(s);
  }
  function clearHubSpot() {
    var host = location.hostname, parts = host.split('.'), domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    HS_COOKIES.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '') + '; SameSite=Lax';
      });
    });
  }

  var box;
  function build() {
    box = document.createElement('div');
    box.className = 'cc';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Cookie choices');
    box.innerHTML =
      '<p class="cc-t">Cookies</p>' +
      '<p>We use HubSpot cookies to see which pages help and to follow up on your request. They only turn on if you say yes. ' +
      '<a href="' + base + 'privacy.html#cookies">Privacy Policy</a></p>' +
      (gpc ? '<p class="cc-gpc">Your browser sent a Global Privacy Control signal, so tracking stays off unless you accept.</p>' : '') +
      '<div class="cc-b"><button type="button" class="cc-no">Decline</button><button type="button" class="cc-yes">Accept</button></div>';
    document.body.appendChild(box);
    box.querySelector('.cc-yes').addEventListener('click', function () { choose('yes'); });
    box.querySelector('.cc-no').addEventListener('click', function () { choose('no'); });
  }
  function show(focus) { if (!box) build(); box.hidden = false; if (focus) box.querySelector('.cc-t').setAttribute('tabindex', '-1'), box.querySelector('.cc-t').focus({ preventScroll: true }); }
  function hide() { if (box) box.hidden = true; }

  function choose(v) {
    var before = read();
    save(v); hide();
    if (v === 'yes') loadHubSpot();
    else if (before === 'yes' || document.getElementById('hs-script-loader')) { clearHubSpot(); location.reload(); }
  }

  function init() {
    var c = read();
    if (c === 'yes') loadHubSpot();
    else if (c === null && !gpc) show();
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); show(true); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
