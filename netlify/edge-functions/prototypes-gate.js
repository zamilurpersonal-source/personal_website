// Netlify Edge Function: keeps the Prototypes page (prototypes.html) and the games (play/*) behind a code.
//
// Visitors without the code get a short page asking for it; the games' files answer 401 and game pages send
// people to that page. The right code sets a cookie for 30 days, so the page, the player and the games work
// as before. play/list.js still answers without the code, but only with the number of games, so the main
// page's "Play my prototypes" button can keep its count.
//
// The code: set PROTOTYPES_PASSWORD in Netlify (Site configuration, Environment variables) to use your own;
// without it, CODE_SHA256 below is checked (the SHA-256 of "zr-prototypes|" + the code). Changing the code
// signs everyone out, since the cookie holds the code they typed.

const CODE_SHA256 = '5be891a01b8ee50942d551c68f7c27dc0994ce6e2b3442e971cee00160215010';
const COOKIE = 'zr_proto';
const MAX_AGE = 30 * 24 * 3600;

const enc = new TextEncoder();

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function envCode() {
  try {
    return (globalThis.Netlify && Netlify.env.get('PROTOTYPES_PASSWORD')) || '';
  } catch (e) {
    return '';
  }
}

// Compares hashes, so the time taken doesn't depend on how much of the code matched
async function codeOk(code) {
  if (typeof code !== 'string' || !code || code.length > 64) return false;
  const custom = envCode();
  if (custom) return (await sha256('zr-prototypes|' + code)) === (await sha256('zr-prototypes|' + custom));
  return (await sha256('zr-prototypes|' + code)) === CODE_SHA256;
}

function cookieValue(request) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch (e) {
        return '';
      }
    }
  }
  return '';
}

// Only send people back to the Prototypes page or a game on this site
function safeNext(value) {
  return typeof value === 'string' && /^\/(prototypes(\.html)?|play\/[A-Za-z0-9._\/-]*)(\?[^\s]*)?$/.test(value) && !value.includes('..')
    ? value
    : '/prototypes.html';
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function lockPage(next, wrong) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Prototypes · Zamilur Rashid</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,400..900&family=Martian+Mono:wdth,wght@75..112.5,400..700&family=Schibsted+Grotesk:ital,wght@0,400..700;1,400..700&display=swap">
<link rel="stylesheet" href="/site.css">
<link rel="stylesheet" href="/prototypes.css">
<style>
  body { margin: 0; background: #F1F5EC; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) body { background: #0B1D16; } }
  :root[data-theme="dark"] body { background: #0B1D16; }
  .lock { max-width: 460px; margin: 8px 0 0; padding: 22px 22px 24px; border: 2px solid var(--edge); border-radius: 18px; background: var(--surface); box-shadow: 0 4px 0 var(--drop); }
  .lock label { display: block; font: 700 11px/1.3 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; }
  .lock-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
  .lock input { flex: 1 1 160px; min-width: 0; padding: 12px 14px; border: 1.5px solid var(--line-strong); border-radius: 12px; background: var(--bg); color: var(--ink); font: 700 22px/1.2 var(--font-mono); letter-spacing: 0.3em; }
  .lock input:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  .lock .btn { flex: 0 0 auto; }
  .lock-error { margin: 12px 0 0; font-weight: 700; color: #B3261E; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .lock-error { color: #FFB4AB; } }
  .lock-help { margin: 14px 0 0; color: var(--muted); font-size: 15px; }
</style>
</head>
<body>
<svg class="sprite" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0">
  <symbol id="back-ico" viewBox="0 0 16 16"><path d="M9.8 3.2 5 8l4.8 4.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>
<div class="wrap">
  <header class="topbar">
    <a class="proto-home" href="/">
      <span class="badge" aria-hidden="true">ZR</span>
      <span class="proto-home-text"><svg class="ico" aria-hidden="true" focusable="false"><use href="#back-ico"/></svg>Zamilur Rashid</span>
    </a>
  </header>
  <main>
    <section class="proto-hero" aria-labelledby="proto-title">
      <p class="eyebrow">Prototypes</p>
      <h1 class="proto-title" id="proto-title">Game ideas you can play</h1>
      <p class="proto-lede">These early builds are shared with publishers and partners. Enter the code you were given.</p>
      <form class="lock" method="post" action="/prototypes.html">
        <label for="code">Code</label>
        <div class="lock-row">
          <input id="code" name="code" type="password" inputmode="numeric" autocomplete="off" required maxlength="64" autofocus${wrong ? ' aria-describedby="lock-error" aria-invalid="true"' : ''}>
          <input type="hidden" name="next" value="${esc(next)}">
          <button class="btn btn-primary" type="submit">Open</button>
        </div>
        ${wrong ? '<p class="lock-error" id="lock-error" role="alert">That code didn\'t work. Try again.</p>' : ''}
        <p class="lock-help">No code? <a href="https://www.linkedin.com/in/zr1/" target="_blank" rel="noopener noreferrer">Message me on LinkedIn</a>.</p>
      </form>
    </section>
  </main>
  <footer class="footer">
    <span>Zamilur Rashid · Rochester, Upstate New York</span>
    <span><a href="/">Main page</a></span>
  </footer>
</div>
</body>
</html>
`;
}

const NO_STORE = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const isPage = path === '/prototypes.html' || path === '/prototypes';

  // The code typed on the lock page
  if (isPage && request.method === 'POST') {
    let code = '';
    let next = '/prototypes.html';
    try {
      const form = await request.formData();
      code = String(form.get('code') || '').trim();
      next = safeNext(String(form.get('next') || ''));
    } catch (e) { /* not a form: treat as a wrong code */ }
    if (await codeOk(code)) {
      return new Response(null, {
        status: 303,
        headers: {
          ...NO_STORE,
          location: next,
          'set-cookie': `${COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    await new Promise((r) => setTimeout(r, 700)); // slows down guessing
    return new Response(lockPage(next, true), { status: 401, headers: { ...NO_STORE, 'content-type': 'text/html; charset=utf-8' } });
  }

  if (await codeOk(cookieValue(request))) return context.next();

  // No code yet
  if (path === '/play/list.js') {
    let count = 0;
    try {
      const text = await (await context.next()).text();
      const start = text.search(/window\.ZR_PROTOTYPES\s*=/);
      const list = JSON.parse(text.slice(text.indexOf('=', start) + 1, text.lastIndexOf(';')));
      count = Array.isArray(list) ? list.length : 0;
    } catch (e) { /* count stays 0 */ }
    return new Response(`window.ZR_PROTOTYPES_COUNT = ${count};\n`, {
      headers: { ...NO_STORE, 'content-type': 'text/javascript; charset=utf-8' },
    });
  }
  if (isPage) {
    const next = safeNext(url.searchParams.get('next') || '/prototypes.html');
    return new Response(lockPage(next, false), { status: 401, headers: { ...NO_STORE, 'content-type': 'text/html; charset=utf-8' } });
  }
  // A game's page opened on its own: go to the lock page, then back to the game
  const accept = request.headers.get('accept') || '';
  if (request.method === 'GET' && accept.includes('text/html')) {
    return new Response(null, {
      status: 302,
      headers: { ...NO_STORE, location: '/prototypes.html?next=' + encodeURIComponent(path + url.search) },
    });
  }
  return new Response('This needs the prototypes code.\n', { status: 401, headers: { ...NO_STORE, 'content-type': 'text/plain; charset=utf-8' } });
};

export const config = {
  path: ['/prototypes.html', '/prototypes', '/play/*'],
};
