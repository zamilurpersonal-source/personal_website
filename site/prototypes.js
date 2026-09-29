// Prototypes page: one card per game in play/list.js, and a full-screen player
// that loads play/<slug>/v<version>/index.html. Games are added by the ship-prototype skill.
(function () {
  'use strict';

  var SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var list = Array.isArray(window.ZR_PROTOTYPES) ? window.ZR_PROTOTYPES : [];

  function str(v) { return typeof v === 'string' ? v.trim() : ''; }

  var games = list.filter(function (p) {
    return p && SLUG.test(str(p.slug)) && str(p.title);
  });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function icon(id) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ico');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function niceDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str(s));
    return m ? MONTHS[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : '';
  }

  function initials(title) {
    return title.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) {
      return w.charAt(0).toUpperCase();
    }).join('');
  }

  function orientationOf(p) { return p.orientation === 'landscape' ? 'landscape' : 'portrait'; }

  // Each build lives in its own folder, play/<slug>/v<version>/, so an update
  // never shows a cached copy of the old one
  function fileUrl(p, name) {
    if (p._flat) return 'play/' + str(p.slug) + '/' + name;
    var v = parseInt(p.version, 10);
    if (!(v >= 1 && v < 100000)) v = 1;
    return 'play/' + str(p.slug) + '/v' + v + '/' + name;
  }

  // ---------- Cards ----------

  var grid = document.getElementById('protos');
  var empty = document.getElementById('protos-empty');
  var countLine = document.getElementById('proto-count-line');
  var cardButtons = {}; // slug -> the card's Play button, so closing the player returns to the game last played

  function card(p, index) {
    var title = str(p.title);
    var art = el('article', 'proto');
    art.id = 'proto-' + str(p.slug);

    var cover = el('button', 'proto-cover');
    cover.type = 'button';
    cover.setAttribute('aria-label', 'Play ' + title);
    cover.setAttribute('data-initials', initials(title));
    var img = document.createElement('img');
    img.alt = '';
    img.width = 800;
    img.height = 1000;
    img.decoding = 'async';
    if (index > 2) img.loading = 'lazy';
    // A game shipped straight into play/<slug>/ (no version folder) still works:
    // if its cover is found there, the player loads the game from there too
    img.addEventListener('error', function () {
      if (!p._flat && !p._flatTried) {
        p._flatTried = true;
        img.src = 'play/' + str(p.slug) + '/cover.webp';
        return;
      }
      cover.classList.add('no-cover');
      if (img.parentNode) img.parentNode.removeChild(img);
    });
    img.addEventListener('load', function () {
      if (p._flatTried) p._flat = true;
    });
    img.src = fileUrl(p, 'cover.webp');
    cover.appendChild(img);
    var badge = el('span', 'proto-cover-play');
    badge.setAttribute('aria-hidden', 'true');
    badge.appendChild(icon('play-ico'));
    cover.appendChild(badge);

    var body = el('div', 'proto-body');
    var head = el('div', 'proto-head');
    head.appendChild(el('h3', 'proto-name', title));
    head.appendChild(el('span', 'proto-status', str(p.status) || 'Prototype'));
    body.appendChild(head);
    if (str(p.genre)) body.appendChild(el('p', 'proto-genre', str(p.genre)));
    if (str(p.pitch)) body.appendChild(el('p', 'proto-pitch', str(p.pitch)));
    if (str(p.note)) body.appendChild(el('p', 'proto-note', str(p.note)));

    var foot = el('div', 'proto-foot');
    var play = el('button', 'btn btn-primary proto-play');
    play.type = 'button';
    play.setAttribute('aria-label', 'Play ' + title);
    play.appendChild(icon('play-ico'));
    play.appendChild(document.createTextNode('Play'));
    foot.appendChild(play);
    cardButtons[str(p.slug)] = play;

    var how = [orientationOf(p) === 'landscape' ? 'Landscape' : 'Portrait'];
    if (str(p.controls)) how.push(str(p.controls));
    var added = niceDate(p.added);
    var updated = niceDate(p.updated);
    var when = updated && updated !== added ? 'Updated ' + updated : added ? 'Added ' + added : '';
    var meta = el('p', 'proto-meta');
    meta.appendChild(el('span', '', how.join(' · ')));
    if (when) meta.appendChild(el('span', '', when));
    foot.appendChild(meta);
    body.appendChild(foot);

    art.appendChild(cover);
    art.appendChild(body);

    function start(e) { openPlayer(p, e.currentTarget); }
    cover.addEventListener('click', start);
    play.addEventListener('click', start);
    return art;
  }

  if (games.length) {
    var frag = document.createDocumentFragment();
    games.forEach(function (p, i) { frag.appendChild(card(p, i)); });
    grid.appendChild(frag);
    countLine.textContent = games.length === 1 ? '1 prototype' : games.length + ' prototypes, newest first';
    countLine.hidden = false;
  } else {
    empty.hidden = false;
  }

  // ---------- Player ----------

  var page = document.getElementById('page');
  var player = document.getElementById('player');
  var frame = document.getElementById('player-frame');
  var pTitle = document.getElementById('player-title');
  var pMeta = document.getElementById('player-meta');
  var btnRestart = document.getElementById('player-restart');
  var btnFs = document.getElementById('player-fs');
  var btnClose = document.getElementById('player-close');
  var direct = document.getElementById('player-direct');
  var btnPrev = document.getElementById('player-prev');
  var btnNext = document.getElementById('player-next');
  var btnPick = document.getElementById('player-pick');
  var menu = document.getElementById('player-menu');
  var menuList = document.getElementById('player-menu-list');
  var multi = games.length > 1;
  var current = null;
  var currentIndex = -1;
  var returnFocus = null;
  var slowTimer = 0;

  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  var fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

  function settle(r) { if (r && typeof r.catch === 'function') r.catch(function () {}); }

  function enterFs() {
    var fn = player.requestFullscreen || player.webkitRequestFullscreen;
    if (!fn) return;
    try { settle(fn.call(player)); } catch (e) { /* not allowed here: the player still fills the window */ }
  }

  function exitFs() {
    if (!fsElement()) return;
    var fn = document.exitFullscreen || document.webkitExitFullscreen;
    try { settle(fn.call(document)); } catch (e) {}
  }

  // On phones that allow it, hold the game's orientation while it's full screen
  function lockOrientation() {
    var o = window.screen && screen.orientation;
    if (!current || !o || typeof o.lock !== 'function') return;
    try { settle(o.lock(orientationOf(current))); } catch (e) {}
  }

  function unlockOrientation() {
    var o = window.screen && screen.orientation;
    if (o && typeof o.unlock === 'function') { try { o.unlock(); } catch (e) {} }
  }

  function syncFsButton() {
    var on = !!fsElement();
    btnFs.querySelector('use').setAttribute('href', on ? '#shrink-ico' : '#expand-ico');
    btnFs.querySelector('span').textContent = on ? 'Exit full screen' : 'Full screen';
    btnFs.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
  }

  if (fsEnabled) btnFs.hidden = false;

  function openPlayer(p, from) {
    returnFocus = from || null;
    player.hidden = false;
    document.documentElement.classList.add('player-open');
    if (page) page.inert = true;
    if (fsEnabled) enterFs(); // still inside the click, which browsers require
    load(Math.max(0, games.indexOf(p)));
    btnClose.focus();
  }

  // Put game number i in the frame; switching games keeps the player open (and full screen)
  function load(i) {
    currentIndex = i;
    current = games[i];
    var p = current;
    player.setAttribute('data-orientation', orientationOf(p));
    pTitle.textContent = str(p.title);
    // "2 of 3" always; the genre and controls after it are dropped on phones
    var more = [str(p.genre), str(p.controls)].filter(Boolean).join(' · ');
    pMeta.textContent = '';
    if (multi) pMeta.appendChild(el('span', 'player-count', (i + 1) + ' of ' + games.length));
    if (more) pMeta.appendChild(el('span', multi ? 'player-more' : '', (multi ? ' · ' : '') + more));
    frame.title = str(p.title);
    direct.href = fileUrl(p, 'index.html');
    player.classList.remove('is-loaded', 'is-slow');
    frame.src = fileUrl(p, 'index.html');
    watchSlow();
    syncNav();
    if (fsElement()) lockOrientation();
  }

  function neighbour(step) { return games[(currentIndex + step + games.length) % games.length]; }

  function step(d) {
    if (!multi || !current) return;
    closeMenu();
    load((currentIndex + d + games.length) % games.length);
  }

  function setImg(img, p) {
    var u = fileUrl(p, 'cover.webp');
    img.style.visibility = '';
    if (img.getAttribute('src') !== u) img.src = u;
  }

  function syncNav() {
    btnPrev.hidden = btnNext.hidden = !multi;
    btnPick.disabled = !multi;
    if (!multi) return;
    var prev = neighbour(-1), next = neighbour(1);
    btnPrev.setAttribute('aria-label', 'Previous game: ' + str(prev.title));
    btnNext.setAttribute('aria-label', 'Next game: ' + str(next.title));
    [].forEach.call(menuList.children, function (b, j) {
      b.setAttribute('aria-current', j === currentIndex ? 'true' : 'false');
    });
  }

  // ---------- Game list ----------

  games.forEach(function (p, j) {
    var b = el('button', 'player-opt');
    b.type = 'button';
    var img = document.createElement('img');
    img.className = 'player-opt-img';
    img.alt = '';
    img.width = 44;
    img.height = 55;
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
    var text = el('span', 'player-opt-text');
    text.appendChild(el('span', 'player-opt-title', str(p.title)));
    if (str(p.genre)) text.appendChild(el('span', 'player-opt-genre', str(p.genre)));
    b.appendChild(img);
    b.appendChild(text);
    b.appendChild(el('span', 'player-opt-tag', 'Playing'));
    b.addEventListener('click', function () {
      closeMenu();
      if (j !== currentIndex) load(j);
      else { try { frame.contentWindow.focus(); } catch (e) {} }
    });
    menuList.appendChild(b);
  });

  function openMenu() {
    if (!multi || !current) return;
    [].forEach.call(menuList.children, function (b, j) { setImg(b.querySelector('img'), games[j]); });
    menu.hidden = false;
    btnPick.setAttribute('aria-expanded', 'true');
    var cur = menuList.children[currentIndex];
    if (cur) cur.focus();
  }

  function closeMenu(focusBack) {
    if (menu.hidden) return;
    menu.hidden = true;
    btnPick.setAttribute('aria-expanded', 'false');
    if (focusBack) btnPick.focus();
  }

  // If a game takes more than 8 seconds, show it anyway and offer its own page
  function watchSlow() {
    clearTimeout(slowTimer);
    slowTimer = setTimeout(function () {
      if (current) player.classList.add('is-loaded', 'is-slow');
    }, 8000);
  }

  function closePlayer() {
    if (player.hidden) return;
    closeMenu();
    exitFs();
    unlockOrientation();
    clearTimeout(slowTimer);
    // back to the card of the game last played, which may not be the one first opened
    var back = (current && cardButtons[str(current.slug)]) || returnFocus;
    current = null;
    currentIndex = -1;
    frame.src = 'about:blank';
    player.hidden = true;
    player.classList.remove('is-loaded', 'is-slow');
    document.documentElement.classList.remove('player-open');
    if (page) page.inert = false;
    if (back && typeof back.focus === 'function') back.focus();
    returnFocus = null;
  }

  // The game on its own page, for when the frame can't show it
  function openDirect() {
    if (!current) return;
    var url = fileUrl(current, 'index.html');
    exitFs();
    window.location.href = url;
  }

  frame.addEventListener('load', function () {
    if (!current || player.hidden) return;
    var href = 'game';
    try { href = frame.contentWindow.location.href; } catch (e) {}
    if (href === 'about:blank') return;
    clearTimeout(slowTimer);
    player.classList.remove('is-slow');
    player.classList.add('is-loaded');
    try { frame.contentWindow.focus(); } catch (e) { frame.focus(); }
  });

  // A host that doesn't allow frames: open the game itself instead
  document.addEventListener('securitypolicyviolation', function (e) {
    var d = e.effectiveDirective || e.violatedDirective || '';
    if (current && /^(frame-src|child-src|default-src)/.test(d)) openDirect();
  });

  btnRestart.addEventListener('click', function () {
    if (!current) return;
    player.classList.remove('is-loaded', 'is-slow');
    watchSlow();
    try { frame.contentWindow.location.reload(); } catch (e) { frame.src = fileUrl(current, 'index.html'); }
  });

  btnFs.addEventListener('click', function () {
    if (fsElement()) exitFs(); else enterFs();
  });

  btnClose.addEventListener('click', closePlayer);

  btnPrev.addEventListener('click', function () { step(-1); });
  btnNext.addEventListener('click', function () { step(1); });

  btnPick.addEventListener('click', function () {
    if (menu.hidden) openMenu(); else closeMenu(true);
  });

  // Close the game list on a click elsewhere, or when the game takes focus
  document.addEventListener('pointerdown', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !btnPick.contains(e.target)) closeMenu();
  }, true);
  window.addEventListener('blur', function () { closeMenu(); });

  document.addEventListener('keydown', function (e) {
    if (player.hidden) return;
    if (!menu.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var items = [].slice.call(menuList.children);
        var k = items.indexOf(document.activeElement);
        k = e.key === 'ArrowDown' ? (k + 1) % items.length : (k - 1 + items.length) % items.length;
        items[k].focus();
      }
      return;
    }
    if (e.key === 'Escape' && !fsElement()) closePlayer();
  });

  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (type) {
    document.addEventListener(type, function () {
      syncFsButton();
      if (fsElement()) lockOrientation(); else unlockOrientation();
    });
  });

  syncFsButton();

  window.ZR_PROTO = { open: openPlayer, close: closePlayer, step: step };
})();
