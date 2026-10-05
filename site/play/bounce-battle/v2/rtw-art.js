/* Roll to War art library (procedural painters), copied from the Roll to War project for the Bounce Battle prototype. */
/* Roll to War — game bundle (generated) */
(function(){
'use strict';

/* ===== src/art/00-core.js ===== */
/* Roll to War: art core (palette, math, color, path helpers, painter) */
const RTW = (window.RTW = window.RTW || {});
const TAU = Math.PI * 2;
const INK = '#23170f';

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => { t = clamp(t); return 1 - (1 - t) * (1 - t); };
const easeIn = (t) => { t = clamp(t); return t * t; };
const easeOutBack = (t) => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const seg = (u, a, b) => clamp((u - a) / (b - a));

/* ---------- color ---------- */
const _rgbC = new Map();
function hexToRgb(h) {
  let v = _rgbC.get(h);
  if (v) return v;
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  _rgbC.set(h, v);
  return v;
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}
const _mixC = new Map();
function mix(a, b, t) {
  const k = a + b + t;
  let v = _mixC.get(k);
  if (v) return v;
  const A = hexToRgb(a), B = hexToRgb(b);
  v = rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  _mixC.set(k, v);
  return v;
}
const shade = (c, amt) => (amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt));
function rgba(c, a) { const [r, g, b] = hexToRgb(c); return `rgba(${r},${g},${b},${a})`; }

/* ---------- random ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ---------- palette ---------- */
const PAL = (RTW.PAL = {
  ink: INK,
  skin: '#f2c49c', skinSh: '#d99a6f', blush: '#ec8f7d',
  hose: '#5b4636', boot: '#3b2819', leather: '#80522c', leatherD: '#523219',
  wood: '#a06d3d', woodD: '#6d4625', woodL: '#c99257',
  steel: '#bcc5cf', steelL: '#eef3f7', steelD: '#808a96', steelDD: '#5a6470',
  mail: '#a3acb6', mailD: '#737c87',
  gold: '#f2be4b', goldL: '#ffe391', goldD: '#b27e1f', goldDD: '#7a520f',
  cloth: '#f0e5cd', clothD: '#cfc0a0',
  coat: '#8c5634', coatD: '#603a20', coatL: '#b87a4c', mane: '#3b2517', hoof: '#2e2118',
  // world
  grass: '#4f9a3b', grassL: '#7cc24c', grassD: '#367a30', grassDD: '#245a23',
  leaf: '#3d9443', leafL: '#78c452', leafD: '#276b33', leafDD: '#1a4a25',
  trunk: '#7b4e2b', trunkD: '#4e3018',
  pave: '#e3d5b5', paveL: '#f3e8cf', paveD: '#cbb993', paveDD: '#a9966f', grout: '#9b8964',
  stone: '#aeb2b8', stoneL: '#cfd3d7', stoneD: '#7a7e86', stoneDD: '#5c6068', mortar: '#4f535b',
  pink: '#ff5aa6', pinkL: '#ffa6cf', pinkD: '#c8337c',
  gate2: '#3fd9ee', gate2D: '#1c8aa6', gate3: '#b36cff', gate3D: '#6a33b8',
  armor: '#3b8cff', armorD: '#1f55b8', speed: '#f6c343', speedD: '#b8861a', attack: '#ee4a3b', attackD: '#a8261b',
  prod: '#e8842a', prodD: '#a4520f', move: '#2ea862', moveD: '#1b6e3e',
  // ui
  wood1: '#7d4c2a', wood2: '#94603a', wood3: '#5f3a1f', woodDark: '#3f2513', woodHi: '#b27d4a',
  parch: '#f4e4bd', parchD: '#e1c890', parchDD: '#b8965a',
  night: '#1c1410',
});

const TEAMS = (RTW.TEAMS = {
  blue: { key: 'blue', main: '#2c6ff0', light: '#7fb2ff', dark: '#1b3f98', deep: '#11275c', trim: '#f2c75a', flag: '#3b7df5' },
  red: { key: 'red', main: '#e03a2f', light: '#ff8a78', dark: '#8e2019', deep: '#58110c', trim: '#f2c75a', flag: '#ea4538' },
  ally: { key: 'ally', main: '#e0a526', light: '#ffd97a', dark: '#8d5f0c', deep: '#5c3d06', trim: '#fff1c2', flag: '#f0b52e' },
});

const F = (RTW.F = {
  title: '"Cinzel Decorative", "Cinzel", Georgia, serif',
  head: '"Cinzel", Georgia, serif',
  body: '"Signika", "Trebuchet MS", system-ui, sans-serif',
});

/* ---------- path helpers (append to current path) ---------- */
function cap(c, x1, y1, x2, y2, w) {
  const a = Math.atan2(y2 - y1, x2 - x1), r = w / 2;
  c.moveTo(x1 + Math.cos(a + Math.PI / 2) * r, y1 + Math.sin(a + Math.PI / 2) * r);
  c.arc(x1, y1, r, a + Math.PI / 2, a + Math.PI * 1.5);
  c.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2);
  c.closePath();
}
function taper(c, x1, y1, x2, y2, w1, w2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  c.moveTo(x1 + Math.cos(a + Math.PI / 2) * w1 / 2, y1 + Math.sin(a + Math.PI / 2) * w1 / 2);
  c.arc(x1, y1, w1 / 2, a + Math.PI / 2, a + Math.PI * 1.5);
  c.arc(x2, y2, w2 / 2, a - Math.PI / 2, a + Math.PI / 2);
  c.closePath();
}
function circ(c, x, y, r) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
function ell(c, x, y, rx, ry, rot = 0) { c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); c.ellipse(x, y, rx, ry, rot, 0, TAU); }
function poly(c, pts) { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }
function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ---------- IK (2-bone) ---------- */
function ik(sx, sy, hx, hy, L1, L2, bend) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
  const maxd = L1 + L2 - 0.05;
  if (d > maxd) { hx = sx + (dx / d) * maxd; hy = sy + (dy / d) * maxd; dx = hx - sx; dy = hy - sy; d = maxd; }
  if (d < 0.01) d = 0.01;
  const a = Math.atan2(dy, dx);
  const A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const ea = a + bend * A;
  return { ex: sx + Math.cos(ea) * L1, ey: sy + Math.sin(ea) * L1, hx, hy };
}

/* ---------- Painter: two-pass sticker outline ----------
   mode 'outline': every shape filled + stroked with ink (thick) -> unified silhouette
   mode 'fill'   : shapes filled with their color; optional thin inner line */
class Painter {
  constructor(ctx, lw, detail) { this.c = ctx; this.lw = lw; this.detail = detail; this.mode = 'fill'; }
  get out() { return this.mode === 'outline'; }
  fill(color, line) {
    const c = this.c;
    if (this.mode === 'outline') {
      c.fillStyle = INK; c.fill();
      c.lineWidth = this.lw * 2; c.strokeStyle = INK; c.stroke();
      return;
    }
    if (line) { c.lineWidth = this.lw * (line === true ? 1.7 : line * 2); c.strokeStyle = INK; c.stroke(); }
    c.fillStyle = color; c.fill();
  }
  // fill-mode only stroke of current path
  stroke(color, w) {
    if (this.mode === 'outline') return;
    const c = this.c; c.strokeStyle = color; c.lineWidth = w; c.stroke();
  }
  // detail line (fill mode only)
  line(pts, color, w, closed) {
    if (this.mode === 'outline') return;
    const c = this.c; c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    if (closed) c.closePath();
    c.strokeStyle = color || INK; c.lineWidth = w || this.lw * 0.8; c.lineCap = 'round'; c.stroke();
  }
  dot(x, y, r, color) {
    if (this.mode === 'outline') return;
    const c = this.c; c.beginPath(); circ(c, x, y, r); c.fillStyle = color || INK; c.fill();
  }
  // shade inside current path (fill mode): fn draws with clip active
  inside(fn) {
    if (this.mode === 'outline') return;
    const c = this.c; c.save(); c.clip(); fn(c); c.restore();
  }
}

/* ---------- text ---------- */
function text(c, s, x, y, o = {}) {
  c.save();
  let size = o.size || 16;
  if ('letterSpacing' in c) c.letterSpacing = (o.letter || 0) + 'px';
  c.font = `${o.weight || 700} ${size}px ${o.font || F.body}`;
  if (o.maxW) {
    const w = c.measureText(s).width;
    if (w > o.maxW) { size = Math.max(6, size * o.maxW / w); c.font = `${o.weight || 700} ${size}px ${o.font || F.body}`; }
  }
  o = Object.assign({}, o, { size });
  c.textAlign = o.align || 'center';
  c.textBaseline = o.baseline || 'middle';
  if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.shadowBlur || 0; c.shadowOffsetY = o.shadowY == null ? 2 : o.shadowY; }
  if (o.stroke) {
    c.lineJoin = 'round'; c.lineWidth = o.strokeW || 3; c.strokeStyle = o.stroke; c.strokeText(s, x, y);
    c.shadowColor = 'transparent';
  }
  if (o.grad) {
    const m = c.measureText(s); const h = (o.size || 16);
    const g = c.createLinearGradient(0, y - h * 0.55, 0, y + h * 0.45);
    o.grad.forEach((col, i) => g.addColorStop(i / (o.grad.length - 1), col));
    c.fillStyle = g;
  } else c.fillStyle = o.fill || '#fff';
  c.fillText(s, x, y);
  c.restore();
}
function textWidth(c, s, size, font, weight, letter) {
  c.save(); c.font = `${weight || 700} ${size}px ${font || F.body}`;
  if ('letterSpacing' in c) c.letterSpacing = (letter || 0) + 'px';
  const w = c.measureText(s).width; c.restore(); return w;
}

Object.assign(RTW, { TAU, INK, clamp, lerp, smooth, easeOut, easeIn, easeOutBack, seg, mix, shade, rgba, rng, hash2, cap, taper, circ, ell, poly, rr, ik, Painter, text, textWidth });

/* ===== src/art/10-troops.js ===== */
/* Roll to War: troops (vector, procedural animation)
   Unit space: infantry ~100 units tall, feet at (0,0), facing +x in side view. */
const L = { HIP: -35, SHO: -63, HEAD: -81, HR: 15, TH: 17.5, SH: 17.5, UA: 13.5, FA: 13 };
const TROOPS = (RTW.TROOPS = {});

function legAng(ph, amp) {
  const th = amp * Math.sin(ph);
  const bend = 0.85 * Math.max(0, Math.cos(ph)) * (amp / 0.45);
  return [th, th - bend];
}

function motion(anim, t, period) {
  const p = { anim, t, bob: 0, ph: 0, legF: [0.14, 0.1], legB: [-0.13, -0.09], lean: 0, walking: false, fb: 0, liftL: 0, liftR: 0, swing: 0 };
  if (anim === 'walk') {
    const ph = (t / period) * TAU;
    p.ph = ph; p.walking = true;
    p.legF = legAng(ph, 0.45); p.legB = legAng(ph + Math.PI, 0.45);
    const s = Math.sin(ph);
    p.bob = 3.3 * s * s;
    p.lean = 0.05;
    p.fb = -Math.abs(s) * 1.8; p.liftL = Math.max(0, s) * 6; p.liftR = Math.max(0, -s) * 6; p.swing = s;
  } else if (anim === 'idle' || anim === 'attack') {
    p.bob = Math.sin(t * 2.4) * 0.6; p.fb = p.bob;
  }
  return p;
}

/* ---------------- shared side-view parts ---------------- */
function sLeg(g, hx, hy, ang, col, bootCol) {
  const c = g.c, th = ang[0], sh = ang[1];
  const kx = hx + Math.sin(th) * L.TH, ky = hy + Math.cos(th) * L.TH;
  const fx = kx + Math.sin(sh) * L.SH, fy = ky + Math.cos(sh) * L.SH;
  c.beginPath(); cap(c, hx, hy, kx, ky, 10.5); cap(c, kx, ky, fx, fy - 4, 9); g.fill(col);
  c.save(); c.translate(fx, fy); c.rotate(sh * 0.45);
  c.beginPath();
  c.moveTo(-5.5, -10); c.lineTo(4, -10); c.quadraticCurveTo(5, -5.5, 10, -4.5);
  c.quadraticCurveTo(12.5, -3.5, 12, 0); c.lineTo(-5.5, 0); c.closePath();
  g.fill(bootCol);
  c.restore();
}
function sArm(g, sx, sy, hx, hy, sleeve, hand, bend, line, handR) {
  const c = g.c, e = ik(sx, sy, hx, hy, L.UA, L.FA, bend);
  c.beginPath(); cap(c, sx, sy, e.ex, e.ey, 9.5); cap(c, e.ex, e.ey, e.hx, e.hy, 8.2); g.fill(sleeve, line);
  c.beginPath(); circ(c, e.hx, e.hy, handR || 5); g.fill(hand, line);
  return e;
}
function sTorso(g, shoY, hipY, hemY, col, o = {}) {
  const c = g.c, w = o.w || 0;
  c.beginPath();
  c.moveTo(-11 - w, shoY - 1);
  c.quadraticCurveTo(3, shoY - 5.5, 11 + w, shoY);
  c.quadraticCurveTo(16 + w, shoY + 12, 13 + w, hipY - 2);
  c.lineTo(15.5 + w, hemY);
  c.quadraticCurveTo(0, hemY + 3, -14.5 - w, hemY);
  c.lineTo(-13 - w, hipY - 2);
  c.quadraticCurveTo(-15.5 - w, shoY + 12, -11 - w, shoY - 1);
  c.closePath();
  g.fill(col);
  g.inside((c) => {
    c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(-22, shoY - 12, 12.5, 80);
    c.fillStyle = 'rgba(255,255,255,0.13)'; c.fillRect(7.5 + w, shoY - 12, 3.5, 70);
    if (o.trim) { c.fillStyle = o.trim; c.fillRect(-24, hemY - 4.2, 48, 8); }
    if (o.quilt && g.detail >= 1) {
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.1;
      for (let x = -12; x <= 14; x += 5.2) { c.beginPath(); c.moveTo(x, shoY - 4); c.lineTo(x + 1, hemY); c.stroke(); }
    }
    if (o.belt !== false) {
      c.fillStyle = PAL.leatherD; c.fillRect(-22, hipY - 5.5, 44, 5);
      c.fillStyle = PAL.gold; c.fillRect(7.5, hipY - 6.3, 5.5, 6.6);
    }
  });
}
function sHead(g, x, y, col) { const c = g.c; c.beginPath(); circ(c, x, y, L.HR); g.fill(col || PAL.skin); }
function sEye(g, x, y) {
  if (g.out) return;
  g.dot(x, y, 1.9, INK);
  if (g.detail >= 1) {
    const c = g.c; c.beginPath(); ell(c, x - 1.2, y + 6.5, 3.2, 2, 0); c.fillStyle = rgba(PAL.blush, 0.45); c.fill();
  }
}
function rotPt(x, y, ox, oy, a) {
  const dx = x - ox, dy = y - oy, ca = Math.cos(a), sa = Math.sin(a);
  return [ox + dx * ca - dy * sa, oy + dx * sa + dy * ca];
}

/* ---------------- weapons & gear ---------------- */
function gPike(g, x0, y0, a, len) {
  const c = g.c, ca = Math.cos(a), sa = Math.sin(a);
  const x1 = x0 + ca * len, y1 = y0 + sa * len;
  c.beginPath(); cap(c, x0, y0, x1, y1, 3.6); g.fill(PAL.wood);
  c.save(); c.translate(x1, y1); c.rotate(a);
  c.beginPath(); c.moveTo(-1, -3); c.quadraticCurveTo(7, -5.2, 18, 0); c.quadraticCurveTo(7, 5.2, -1, 3); c.closePath(); g.fill(PAL.steelL);
  if (!g.out && g.detail >= 1) g.line([1, 0, 15, 0], PAL.steelD, 0.9);
  c.beginPath(); rr(c, -6, -2.7, 7, 5.4, 1.4); g.fill(PAL.steelD);
  c.restore();
}
function gSword(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); c.moveTo(4, -3); c.lineTo(4 + len, -2); c.lineTo(4 + len + 6, 0); c.lineTo(4 + len, 2); c.lineTo(4, 3); c.closePath(); g.fill(PAL.steelL);
  if (!g.out) { g.line([7, 0, 4 + len, 0], PAL.steelD, 0.9); }
  c.beginPath(); rr(c, 1.5, -8, 4.5, 16, 2); g.fill(PAL.gold);
  c.beginPath(); rr(c, -8, -2.3, 10.5, 4.6, 1.8); g.fill(PAL.leather);
  c.beginPath(); circ(c, -9, 0, 3.3); g.fill(PAL.gold);
  c.restore();
}
function gHeater(g, cx, cy, w, h, tm, emblem) {
  const c = g.c;
  const path = () => {
    c.beginPath();
    c.moveTo(cx - w / 2, cy - h / 2);
    c.quadraticCurveTo(cx, cy - h / 2 - h * 0.07, cx + w / 2, cy - h / 2);
    c.bezierCurveTo(cx + w / 2, cy + h * 0.12, cx + w * 0.32, cy + h * 0.36, cx, cy + h / 2);
    c.bezierCurveTo(cx - w * 0.32, cy + h * 0.36, cx - w / 2, cy + h * 0.12, cx - w / 2, cy - h / 2);
    c.closePath();
  };
  path(); g.fill(tm.main, true);
  if (g.out) return;
  path();
  g.inside((c) => {
    c.lineWidth = Math.max(2.4, w * 0.12); c.strokeStyle = PAL.gold; path(); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(cx - w, cy, w * 2, h);
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(cx - w / 2, cy - h / 2, w * 0.28, h);
    if (emblem !== false) {
      // gold chevron
      c.beginPath();
      c.moveTo(cx - w * 0.36, cy + h * 0.1); c.lineTo(cx, cy - h * 0.14); c.lineTo(cx + w * 0.36, cy + h * 0.1);
      c.lineTo(cx + w * 0.36, cy + h * 0.26); c.lineTo(cx, cy + h * 0.02); c.lineTo(cx - w * 0.36, cy + h * 0.26); c.closePath();
      c.fillStyle = PAL.gold; c.fill();
      c.lineWidth = 0.9; c.strokeStyle = PAL.goldDD; c.stroke();
    }
  });
}
function gCrossbow(g, x, y, a, loaded) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a); c.scale(1.18, 1.18);
  // stock
  c.beginPath();
  c.moveTo(-2, -2.6); c.lineTo(33, -2.6); c.lineTo(35, 0); c.lineTo(33, 2.6);
  c.lineTo(10, 3); c.quadraticCurveTo(4, 8.5, -1.5, 7); c.lineTo(-3, 1.5); c.closePath();
  g.fill(PAL.wood);
  if (!g.out) g.line([2, -1.2, 31, -1.2], PAL.woodL, 1);
  // string
  if (!g.out) {
    const nut = loaded ? 17 : 26;
    g.line([28, -15, nut, -1, 28, 15], '#efe6d2', 1.1);
    if (loaded) { g.line([nut, -2.2, 37, -2.2], PAL.steelDD, 1.6); }
  }
  // prod
  c.beginPath(); c.moveTo(27, -16); c.quadraticCurveTo(35, 0, 27, 16); c.lineTo(29.6, 16); c.quadraticCurveTo(38, 0, 29.6, -16); c.closePath();
  g.fill(PAL.steel);
  // trigger lever
  c.beginPath(); cap(c, 9, 3, 5, 10, 2.2); g.fill(PAL.steelD);
  c.restore();
}
function gPennant(g, x, y, a, tm, t) {
  // swallow-tail pennant attached at pole point (x,y); pole angle a
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
  const w1 = Math.sin(t * 7) * 2.5, w2 = Math.sin(t * 7 + 1.4) * 3.5;
  c.beginPath();
  c.moveTo(0, 0); c.quadraticCurveTo(14, -3 + w1, 30, 1 + w2); c.lineTo(22, 7 + w1 * 0.5); c.lineTo(30, 13 + w2); c.quadraticCurveTo(14, 12 + w1, 0, 13); c.closePath();
  g.fill(tm.flag);
  if (!g.out) {
    g.inside((c) => { c.fillStyle = PAL.gold; c.fillRect(-2, 5, 40, 3); });
  }
  c.restore();
}

/* ================= PIKER ================= */
const PIKE_LEN = 150;
TROOPS.piker = {
  name: 'Piker', shadowW: 17, h: 100,
  pose(anim, t) {
    const p = motion(anim, t, 0.62);
    if (anim === 'attack') {
      const u = (t % 0.95) / 0.95;
      const th = u < 0.22 ? lerp(0, -5, smooth(u / 0.22)) : u < 0.4 ? lerp(-5, 17, easeOut((u - 0.22) / 0.18)) : lerp(17, 0, smooth((u - 0.4) / 0.6));
      Object.assign(p, { pA: -0.1, pBx: -46 + th, pBy: -49, gF: 38, gN: 60, lean: 0.07 + th * 0.004, legF: [0.32, 0.22], legB: [-0.3, -0.24], bob: 2, thr: th });
    } else if (anim === 'walk') {
      Object.assign(p, { pA: -1.34 + Math.sin(p.ph) * 0.025, pBx: -1, pBy: -17 + p.bob, gF: 23, gN: 47 });
    } else {
      Object.assign(p, { pA: -1.52 + Math.sin(t * 2.4) * 0.012, pBx: 13, pBy: -0.5, gF: 35, gN: 58 });
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    sLeg(g, -2, hipY, p.legB, shade(PAL.hose, -0.3), shade(PAL.boot, -0.3));
    sLeg(g, 2, hipY, p.legF, PAL.hose, PAL.boot);
    const ca = Math.cos(p.pA), sa = Math.sin(p.pA);
    const gf = [p.pBx + ca * p.gF, p.pBy + sa * p.gF], gn = [p.pBx + ca * p.gN, p.pBy + sa * p.gN];
    const R = (x, y) => rotPt(x, y, 0, hipY, p.lean);
    const sf = R(-3, shoY + 3), sn = R(3, shoY + 2), hd = R(3, L.HEAD + p.bob);
    sArm(g, sf[0], sf[1], gf[0], gf[1], shade(PAL.mail, -0.3), shade(PAL.skin, -0.2), 1);
    c.save(); c.translate(0, hipY); c.rotate(p.lean); c.translate(0, -hipY);
    sTorso(g, shoY, hipY, -22 + p.bob, tm.main, { trim: PAL.gold });
    c.restore();
    // head + kettle hat
    const hx = hd[0], hy = hd[1];
    sHead(g, hx, hy);
    sEye(g, hx + 8.3, hy + 1.5);
    c.beginPath(); c.moveTo(hx - 13.5, hy - 4); c.bezierCurveTo(hx - 13.5, hy - 23, hx + 14.5, hy - 23, hx + 14.5, hy - 4); c.closePath(); g.fill(PAL.steel);
    if (!g.out) { c.beginPath(); c.moveTo(hx - 13.5, hy - 4); c.bezierCurveTo(hx - 13.5, hy - 23, hx + 14.5, hy - 23, hx + 14.5, hy - 4); c.closePath();
      g.inside((c) => { c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 4, hy - 15, 5, 3, -0.3); c.fill(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(hx - 16, hy - 24, 9, 22); }); }
    c.beginPath(); ell(c, hx + 0.5, hy - 4.5, 21, 4.4, 0); g.fill(PAL.steelD);
    if (!g.out) { g.line([hx - 18, hy - 5.5, hx + 18, hy - 5.5], PAL.steelL, 1.1); }
    gPike(g, p.pBx, p.pBy, p.pA, PIKE_LEN);
    sArm(g, sn[0], sn[1], gn[0], gn[1], PAL.mail, PAL.skin, 1, true);
  },
};

/* ================= CROSSBOWMAN ================= */
TROOPS.crossbow = {
  name: 'Crossbowman', shadowW: 16, h: 100,
  pose(anim, t) {
    const p = motion(anim, t, 0.6);
    if (anim === 'attack') {
      const D = 1.6, u = (t % D) / D;
      let a, rx, ry, loaded = true, hand = 10;
      if (u < 0.2) { const k = smooth(u / 0.2); a = lerp(0.7, -0.03, k); rx = lerp(-2, -7, k); ry = lerp(-50, -71, k); }
      else if (u < 0.34) { const k = seg(u, 0.2, 0.34); a = -0.03 - 0.12 * Math.sin(Math.PI * k); rx = -7 - 4 * Math.sin(Math.PI * k); ry = -71; loaded = u < 0.205; }
      else if (u < 0.5) { const k = smooth(seg(u, 0.34, 0.5)); a = lerp(-0.03, 0.95, k); rx = lerp(-7, -2, k); ry = lerp(-71, -48, k); loaded = false; }
      else if (u < 0.86) { const k = seg(u, 0.5, 0.86); a = 0.95; rx = -2; ry = -48; loaded = k > 0.75; hand = 10 + 12 * Math.sin(Math.PI * clamp(k / 0.75)); }
      else { const k = smooth(seg(u, 0.86, 1)); a = lerp(0.95, 0.7, k); rx = -2; ry = lerp(-48, -50, k); }
      Object.assign(p, { cA: a, cX: rx, cY: ry, loaded, hand, aiming: u > 0.12 && u < 0.34, u, stage: u < 0.34 ? 'aim' : u < 0.86 ? 'reload' : 'raise' });
    } else if (anim === 'walk') {
      Object.assign(p, { cA: -0.55 + Math.sin(p.ph) * 0.03, cX: -2, cY: -45 + p.bob, loaded: true, hand: 10 });
    } else {
      Object.assign(p, { cA: 0.6, cX: -1, cY: -49 + p.bob, loaded: true, hand: 10 });
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    sLeg(g, -2, hipY, p.legB, shade(PAL.hose, -0.3), shade(PAL.boot, -0.3));
    sLeg(g, 2, hipY, p.legF, PAL.hose, PAL.boot);
    // quiver (bolt case) on back hip
    c.save(); c.translate(-13, hipY - 3); c.rotate(-0.35);
    c.beginPath(); rr(c, -4.5, -5, 9, 16, 2); g.fill(PAL.leather);
    if (!g.out) { g.line([-2, -5, -3, -10], '#e9e1cf', 1.4); g.line([1, -5, 1.5, -11], '#e9e1cf', 1.4); }
    c.restore();
    const ca = Math.cos(p.cA), sa = Math.sin(p.cA);
    const gN = [p.cX + ca * p.hand, p.cY + sa * p.hand + 2.5];
    const gF = [p.cX + ca * 24, p.cY + sa * 24 + 2.5];
    const sleeve = shade(tm.main, -0.12);
    sArm(g, -3, shoY + 3, gF[0], gF[1], shade(sleeve, -0.3), shade(PAL.skin, -0.2), 1);
    sTorso(g, shoY, hipY, -24 + p.bob, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
    const hx = 3, hy = L.HEAD + p.bob;
    sHead(g, hx, hy);
    sEye(g, hx + 8.3, hy + 2);
    if (g.kit && g.kit.helm === 'kettle') kettleSide(g, hx, hy);
    else {
    // sallet with tail
    c.beginPath();
    c.moveTo(hx + 14, hy - 2);
    c.bezierCurveTo(hx + 15, hy - 19, hx + 1, hy - 23, hx - 9, hy - 18);
    c.quadraticCurveTo(hx - 17, hy - 12, hx - 24, hy + 1);
    c.quadraticCurveTo(hx - 15, hy + 1, hx - 10, hy - 3);
    c.lineTo(hx + 14, hy - 2);
    c.closePath();
    g.fill(PAL.steel);
    if (!g.out) {
      g.line([hx - 9, hy - 3.2, hx + 14, hy - 2.4], PAL.steelDD, 1.3);
      c.beginPath(); ell(c, hx + 3, hy - 15, 5, 2.6, -0.2); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
    }
    }
    gCrossbow(g, p.cX, p.cY, p.cA, p.loaded);
    sArm(g, 3, shoY + 2, gN[0], gN[1], sleeve, PAL.skin, 1, true);
  },
};

/* ================= SWORDSMAN ================= */
TROOPS.sword = {
  name: 'Swordsman', shadowW: 18, h: 100,
  pose(anim, t) {
    const p = motion(anim, t, 0.64);
    if (anim === 'attack') {
      const D = 0.9, u = (t % D) / D;
      let a, gx, gy, lean = 0;
      if (u < 0.35) { const k = smooth(u / 0.35); a = lerp(-1.95, -2.7, k); gx = lerp(-4, -9, k); gy = lerp(-60, -76, k); lean = lerp(0, -0.07, k); }
      else if (u < 0.52) { const k = easeOut(seg(u, 0.35, 0.52)); a = lerp(-2.7, 0.5, k); gx = lerp(-9, 16, k); gy = lerp(-76, -58, k); lean = lerp(-0.07, 0.14, k); }
      else { const k = smooth(seg(u, 0.52, 1)); a = lerp(0.5, -1.95, k); gx = lerp(16, -4, k); gy = lerp(-58, -60, k); lean = lerp(0.14, 0, k); }
      Object.assign(p, { sA: a, sX: gx, sY: gy, lean, front: u >= 0.4 && u < 0.8, legF: [0.3, 0.2], legB: [-0.28, -0.22], bob: 1.8, u });
    } else if (anim === 'walk') {
      Object.assign(p, { sA: -1.95 + Math.sin(p.ph) * 0.05, sX: -4, sY: -60 + p.bob });
    } else {
      Object.assign(p, { sA: -1.82 + Math.sin(t * 2.4) * 0.02, sX: -3, sY: -58 + p.bob });
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    const legC = PAL.mailD, bootC = PAL.steelDD;
    sLeg(g, -2, hipY, p.legB, shade(legC, -0.3), shade(bootC, -0.3));
    sLeg(g, 2, hipY, p.legF, legC, bootC);
    const R = (x, y) => rotPt(x, y, 0, hipY, p.lean);
    const sf = R(-3, shoY + 3), sn = R(4, shoY + 2), hd = R(3, L.HEAD + p.bob);
    if (!p.front) gSword(g, p.sX, p.sY, p.sA, 44);
    sArm(g, sf[0], sf[1], p.sX, p.sY, shade(PAL.mail, -0.3), shade(PAL.steel, -0.25), 1);
    c.save(); c.translate(0, hipY); c.rotate(p.lean); c.translate(0, -hipY);
    sTorso(g, shoY, hipY, -19 + p.bob, tm.main, { w: 1.5, trim: PAL.gold });
    c.restore();
    // great helm
    const hx = hd[0], hy = hd[1];
    c.beginPath(); rr(c, hx - 12.5, hy - 17, 27, 33, 5.5); g.fill(PAL.steel);
    if (!g.out) {
      c.beginPath(); rr(c, hx - 12.5, hy - 17, 27, 33, 5.5);
      g.inside((c) => {
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(hx - 14, hy - 18, 9, 36);
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(hx + 4, hy - 15, 3, 28);
        c.fillStyle = PAL.gold; c.fillRect(hx + 9.5, hy - 17, 4, 33);
        c.fillStyle = PAL.steelDD; c.fillRect(hx - 12, hy + 12, 30, 4);
      });
      c.beginPath(); rr(c, hx + 1, hy - 5, 14, 3.4, 1.5); c.fillStyle = INK; c.fill();
      if (g.detail >= 1) { g.dot(hx + 6, hy + 4, 0.9, INK); g.dot(hx + 9, hy + 4, 0.9, INK); g.dot(hx + 6, hy + 7, 0.9, INK); }
    }
    // crest
    c.beginPath(); c.moveTo(hx - 8, hy - 16); c.quadraticCurveTo(hx - 12, hy - 30, hx + 2, hy - 29); c.quadraticCurveTo(hx + 8, hy - 26, hx + 6, hy - 16); c.closePath(); g.fill(tm.main);
    // near arm + shield
    const shx = 17 + (p.lean > 0.05 ? 3 : 0), shy = -50 + p.bob;
    sArm(g, sn[0], sn[1], shx - 3, shy + 2, PAL.mail, PAL.steel, 1, true);
    gHeater(g, shx, shy, 24, 32, tm);
    if (p.front) gSword(g, p.sX, p.sY, p.sA, 44);
  },
};

/* ================= KNIGHT (mounted) ================= */
function hLeg(g, hx, hy, ph, col, front) {
  const c = g.c;
  const a1 = 0.4 * Math.sin(ph);
  const b = Math.max(0, Math.cos(ph));
  const a2 = front ? a1 - 1.0 * b : a1 - 0.2 * b + 0.12;
  const L1 = 19, L2 = 21;
  const kx = hx + Math.sin(a1) * L1, ky = hy + Math.cos(a1) * L1;
  const fx = kx + Math.sin(a2) * L2, fy = ky + Math.cos(a2) * L2;
  c.beginPath(); taper(c, hx, hy, kx, ky, 12, 7.5); cap(c, kx, ky, fx, fy - 3, 6.2); g.fill(col);
  c.save(); c.translate(fx, fy); c.rotate(a2 * 0.5);
  c.beginPath(); c.moveTo(-4.2, -5.5); c.lineTo(4.2, -5.5); c.lineTo(5.5, 0); c.lineTo(-4.6, 0); c.closePath(); g.fill(PAL.hoof);
  c.restore();
}
TROOPS.knight = {
  name: 'Knight', shadowW: 34, h: 140,
  pose(anim, t) {
    const p = { anim, t, hb: 0, hph: 0, nod: 0, tail: Math.sin(t * 3) * 3, lx: 0, tilt: 0 };
    if (anim === 'walk') {
      const ph = (t / 0.62) * TAU; p.hph = ph;
      p.hb = -Math.abs(Math.sin(ph)) * 2.6 + 1.3; p.nod = Math.sin(ph * 2) * 0.05;
      p.lA = -1.42 + Math.sin(ph * 2) * 0.03; p.lBx = 10; p.lBy = -70 + p.hb; p.grip = 17;
    } else if (anim === 'attack') {
      const u = (t % 1.1) / 1.1;
      const thr = 14 * Math.sin(Math.PI * seg(u, 0.18, 0.55));
      p.lx = thr * 0.55; p.tilt = -0.05 * Math.sin(Math.PI * seg(u, 0, 0.25));
      p.hph = Math.PI * 0.5 + 0.8 * Math.sin(Math.PI * seg(u, 0.18, 0.55));
      p.lA = -0.07; p.lBx = -30 + thr * 0.5; p.lBy = -96; p.grip = 34; p.thr = thr;
      p.hb = Math.sin(t * 2.4) * 0.5;
    } else {
      p.hb = Math.sin(t * 2.4) * 0.6; p.nod = Math.sin(t * 1.3) * 0.04;
      p.hph = Math.PI * 0.5; p.lA = -1.45; p.lBx = 11; p.lBy = -68 + p.hb; p.grip = 17;
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    c.save(); c.translate(p.lx, 0);
    if (p.tilt) { c.translate(-30, 0); c.rotate(p.tilt); c.translate(30, 0); }
    const by = -60 + p.hb;
    const coat = PAL.coat, coatF = shade(coat, -0.3);
    const ph = p.hph;
    hLeg(g, 25, by + 7, ph + Math.PI, coatF, true);
    hLeg(g, -25, by + 6, ph, coatF, false);
    // tail
    c.beginPath(); c.moveTo(-34, by - 8); c.quadraticCurveTo(-50 - p.tail, by - 2, -48 - p.tail * 1.4, by + 26); c.quadraticCurveTo(-42 - p.tail * 0.6, by + 12, -32, by); c.closePath(); g.fill(PAL.mane);
    // body barrel
    c.beginPath(); ell(c, -2, by, 37, 18); g.fill(coat);
    // neck
    c.beginPath();
    c.moveTo(14, by - 11);
    c.quadraticCurveTo(24, by - 38, 39, by - 46);
    c.lineTo(50, by - 38);
    c.quadraticCurveTo(41, by - 19, 36, by + 5);
    c.closePath(); g.fill(coat);
    // mane
    c.beginPath(); c.moveTo(13, by - 12); c.quadraticCurveTo(22, by - 38, 38, by - 48); c.lineTo(41, by - 44); c.quadraticCurveTo(28, by - 34, 20, by - 10); c.closePath(); g.fill(PAL.mane);
    // head
    c.save(); c.translate(44, by - 43); c.rotate(0.66 + p.nod);
    c.beginPath(); c.moveTo(-5, -7.5); c.quadraticCurveTo(8, -10, 22, -6); c.quadraticCurveTo(29.5, -3.5, 29, 1.5); c.quadraticCurveTo(27, 6.5, 20, 6.5); c.quadraticCurveTo(6, 9, -4, 8); c.closePath(); g.fill(coat);
    c.beginPath(); c.moveTo(-3, -6); c.lineTo(-9, -15); c.lineTo(3, -8.5); c.closePath(); g.fill(coat);
    if (!g.out) {
      g.dot(6.5, -2.5, 1.9, INK);
      g.dot(26, 1, 1.2, shade(coat, -0.5));
      g.line([-4, 5.5, 8, 5.5, 17, -8], PAL.leatherD, 1.6);
      g.line([17, -8, 21, 6], PAL.leatherD, 1.4);
    }
    c.restore();
    hLeg(g, 21, by + 8, ph, coat, true);
    hLeg(g, -29, by + 6, ph + Math.PI, coat, false);
    // caparison
    const cp = () => {
      c.beginPath();
      c.moveTo(30, by - 13);
      c.quadraticCurveTo(38, by + 4, 32, by + 22);
      const n = 6, x0 = 32, x1 = -38;
      for (let i = 0; i < n; i++) {
        const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n);
        c.quadraticCurveTo((xa + xb) / 2, by + 28, xb, by + 21);
      }
      c.quadraticCurveTo(-45, by + 2, -36, by - 13);
      c.quadraticCurveTo(-4, by - 21, 30, by - 13);
      c.closePath();
    };
    cp(); g.fill(tm.main);
    if (!g.out) {
      cp();
      g.inside((c) => {
        c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(-60, by + 8, 120, 30);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-60, by - 14, 120, 5);
        c.lineWidth = 5; c.strokeStyle = PAL.gold;
        c.beginPath(); const n = 6, x0 = 32, x1 = -38; c.moveTo(x0, by + 22);
        for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 28, xb, by + 21); }
        c.stroke();
        if (g.detail >= 1) {
          c.fillStyle = PAL.gold;
          for (const dx of [-22, 14]) { c.beginPath(); c.moveTo(dx, by - 3); c.lineTo(dx + 5, by + 3); c.lineTo(dx, by + 9); c.lineTo(dx - 5, by + 3); c.closePath(); c.fill(); }
          c.beginPath(); circ(c, -4, by + 4, 8.5); c.fill();
          c.beginPath(); circ(c, -4, by + 4, 5.8); c.fillStyle = tm.dark; c.fill();
        }
      });
    }
    // saddle
    c.beginPath(); c.moveTo(-18, by - 19); c.quadraticCurveTo(-18, by - 30, -12, by - 29); c.quadraticCurveTo(-4, by - 21, 6, by - 23); c.quadraticCurveTo(12, by - 31, 14, by - 23); c.quadraticCurveTo(0, by - 13, -18, by - 19); c.closePath(); g.fill(PAL.leather);
    // rider
    const rb = by + p.hb * 0.3;
    const hipX = -3, hipY = rb - 24;
    // near leg
    c.beginPath(); cap(c, hipX, hipY, 11, rb - 12, 10); cap(c, 11, rb - 12, 7, rb + 6, 8.5); g.fill(PAL.mailD);
    c.beginPath(); c.moveTo(3, rb + 2); c.lineTo(12, rb + 2); c.quadraticCurveTo(16, rb + 4, 15, rb + 8); c.lineTo(3, rb + 8); c.closePath(); g.fill(PAL.steelDD);
    if (!g.out) g.line([7, rb - 1, 7, rb + 10], PAL.leatherD, 1.2);
    // lance geometry
    const ca = Math.cos(p.lA), sa = Math.sin(p.lA);
    const grip = [p.lBx + ca * p.grip, p.lBy + sa * p.grip];
    // far arm (reins)
    sArm(g, -3, rb - 45, 16, rb - 30, shade(PAL.mail, -0.3), shade(PAL.steel, -0.25), 1);
    // torso
    const rtp = () => { c.beginPath(); c.moveTo(-13, rb - 51); c.quadraticCurveTo(2, rb - 56, 12, rb - 50); c.quadraticCurveTo(17, rb - 36, 13, rb - 20); c.quadraticCurveTo(0, rb - 15, -14, rb - 20); c.quadraticCurveTo(-18, rb - 36, -13, rb - 51); c.closePath(); };
    rtp(); g.fill(tm.main);
    if (!g.out) {
      rtp();
      g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(-20, rb - 60, 11, 50); c.fillStyle = PAL.leatherD; c.fillRect(-20, rb - 27, 40, 4.5); c.fillStyle = PAL.gold; c.fillRect(-2, rb - 50, 4, 26); });
    }
    // helm (sugarloaf) + plume
    const hx = 0, hy = rb - 62;
    c.beginPath(); c.moveTo(hx + 7, hy - 8); c.quadraticCurveTo(hx + 4, hy - 24, hx - 14, hy - 30); c.quadraticCurveTo(hx - 10, hy - 22, hx - 6, hy - 12); c.closePath(); g.fill(tm.main);
    c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 12.5, hy - 5); c.quadraticCurveTo(hx - 10, hy - 17, hx + 1, hy - 19); c.quadraticCurveTo(hx + 12.5, hy - 17, hx + 13, hy - 4); c.lineTo(hx + 12.5, hy + 12); c.closePath();
    g.fill(PAL.steel);
    if (!g.out) {
      c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 12.5, hy - 5); c.quadraticCurveTo(hx - 10, hy - 17, hx + 1, hy - 19); c.quadraticCurveTo(hx + 12.5, hy - 17, hx + 13, hy - 4); c.lineTo(hx + 12.5, hy + 12); c.closePath();
      g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(hx - 15, hy - 20, 8, 34); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(hx + 3, hy - 14, 3, 24); c.fillStyle = PAL.gold; c.fillRect(hx - 14, hy - 8, 28, 3.6); });
      c.beginPath(); rr(c, hx + 1, hy - 1, 12.5, 3.2, 1.4); c.fillStyle = INK; c.fill();
    }
    // lance
    const L0 = [p.lBx, p.lBy], LL = 142;
    const tipX = p.lBx + ca * LL, tipY = p.lBy + sa * LL;
    c.beginPath(); taper(c, L0[0], L0[1], tipX, tipY, 5, 2.4); g.fill(PAL.woodL);
    if (!g.out) { c.beginPath(); taper(c, L0[0], L0[1], tipX, tipY, 5, 2.4); g.inside((c) => { c.strokeStyle = shade(PAL.woodL, -0.25); c.lineWidth = 1; for (let s = 10; s < LL; s += 9) { const x = L0[0] + ca * s, y = L0[1] + sa * s; c.beginPath(); c.moveTo(x - sa * 4 - ca * 3, y + ca * 4 - sa * 3); c.lineTo(x + sa * 4 + ca * 3, y - ca * 4 + sa * 3); c.stroke(); } }); }
    // vamplate
    c.save(); c.translate(p.lBx + ca * (p.grip + 7), p.lBy + sa * (p.grip + 7)); c.rotate(p.lA);
    c.beginPath(); c.moveTo(-4, -8); c.lineTo(4, -2.2); c.lineTo(4, 2.2); c.lineTo(-4, 8); c.closePath(); g.fill(PAL.steelD);
    c.restore();
    // tip
    c.save(); c.translate(tipX, tipY); c.rotate(p.lA);
    c.beginPath(); c.moveTo(-1, -2.5); c.lineTo(9, 0); c.lineTo(-1, 2.5); c.closePath(); g.fill(PAL.steelL);
    c.restore();
    gPennant(g, p.lBx + ca * (LL - 18), p.lBy + sa * (LL - 18), p.lA, tm, p.t);
    // near arm
    sArm(g, 3, rb - 46, grip[0], grip[1], PAL.mail, PAL.steel, 1, true);
    c.restore();
  },
};


/* ---------------- main entry ---------------- */
const _layer = { cv: null, cx: null };
function getLayer(w, h) {
  if (!_layer.cv) { _layer.cv = document.createElement('canvas'); _layer.cx = _layer.cv.getContext('2d'); }
  if (_layer.cv.width < w || _layer.cv.height < h) { _layer.cv.width = Math.max(_layer.cv.width, w); _layer.cv.height = Math.max(_layer.cv.height, h); }
  return _layer;
}

function troopState(o) {
  const anim = o.anim || 'idle', t = o.t || 0;
  let flash = o.flash || 0, alpha = o.alpha == null ? 1 : o.alpha, kx = 0, tilt = 0, fall = 0;
  let base = anim;
  if (anim === 'hit') { const u = clamp(t / 0.32); kx = -6 * Math.sin(Math.PI * u); tilt = -0.14 * Math.sin(Math.PI * u); flash = Math.max(flash, 1 - u); base = 'idle'; }
  if (anim === 'death') {
    const u = clamp(t / 0.55); fall = easeIn(u); if (t > 0.55 && t < 0.8) fall = 1 - 0.06 * Math.sin(Math.PI * (t - 0.55) / 0.25);
    flash = Math.max(flash, 1 - clamp(t / 0.25)); base = 'idle';
    if (t > 1.3) alpha *= clamp(1 - (t - 1.3) / 0.7);
  }
  return { anim, base, t, flash, alpha, kx, tilt, fall };
}

function drawTroopRaw(c, o, st) {
  const def = TROOPS[o.type];
  const size = o.size || 40, s = size / 100;
  const view = o.view || 'side', facing = o.facing || 1;
  const detail = o.detail != null ? o.detail : size >= 70 ? 2 : size >= 32 ? 1 : 0;
  const lw = (o.lw || 0.75 + size * 0.0085) / s;
  const p = def.pose(st.base, st.t, o);
  c.save();
  c.scale(s * (view === 'side' ? facing : 1), s);
  if (st.fall) {
    if (o.type === 'knight' || def.mounted) { c.translate(0, 0); c.scale(1, 1 - 0.3 * st.fall); c.rotate(-0.16 * st.fall); c.translate(0, 8 * st.fall); }
    else { const dir = view === 'side' ? -1 : (o.fallDir || -1); c.rotate(dir * (Math.PI / 2) * st.fall); }
  }
  if (st.kx || st.tilt) { c.translate(st.kx, 0); c.rotate(st.tilt); }
  c.lineJoin = 'round'; c.lineCap = 'round';
  const g = new Painter(c, lw, detail); g.team = TEAMS[o.team || 'blue'] || TEAMS.blue; g.view = view; g.kit = o.kit || def.kit || null;
  const fn = def[view] || def.side;
  g.mode = 'outline'; fn(g, p);
  g.mode = 'fill'; fn(g, p);
  c.restore();
}

RTW.drawTroop = function (c, o) {
  const def = TROOPS[o.type]; if (!def) return;
  const size = o.size || 40, s = size / 100;
  const st = troopState(o);
  const view = o.view || 'side';
  if (st.alpha <= 0) return;
  // ground shadow
  if (o.shadow !== false) {
    const sa = st.fall ? 1 - st.fall * 0.6 : 1;
    c.save(); c.translate(o.x, o.y); c.scale(s, s);
    c.beginPath(); ell(c, 0, 0, def.shadowW * (view === 'side' ? 1 : 0.62), def.shadowW * 0.3);
    c.fillStyle = `rgba(25,16,8,${0.26 * sa * st.alpha})`; c.fill(); c.restore();
  }
  if (st.flash > 0.01 || st.alpha < 0.999) {
    const pad = Math.ceil(size * 2.3), W = pad * 2, H = pad * 2;
    const dpr = o.dpr || 1;
    const Ly = getLayer(Math.ceil(W * dpr), Math.ceil(H * dpr));
    const lc = Ly.cx;
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.clearRect(0, 0, Math.ceil(W * dpr), Math.ceil(H * dpr));
    lc.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * 1.35 * dpr);
    drawTroopRaw(lc, o, st);
    if (st.flash > 0.01) {
      lc.setTransform(1, 0, 0, 1, 0, 0);
      lc.globalCompositeOperation = 'source-atop';
      lc.fillStyle = `rgba(255,255,255,${0.85 * st.flash})`; lc.fillRect(0, 0, Math.ceil(W * dpr), Math.ceil(H * dpr));
      lc.globalCompositeOperation = 'source-over';
    }
    c.save(); c.globalAlpha *= st.alpha;
    c.drawImage(Ly.cv, 0, 0, Math.ceil(W * dpr), Math.ceil(H * dpr), o.x - pad, o.y - pad * 1.35, W, H);
    c.restore();
    return;
  }
  c.save(); c.translate(o.x, o.y);
  drawTroopRaw(c, o, st);
  c.restore();
};
RTW.troopHeight = (type) => (TROOPS[type] ? TROOPS[type].h : 100);

/* ===== src/art/11-troops-fb.js ===== */
/* Roll to War: troop front (toward camera / down-screen) and back (away / up-screen) views.
   Front view: soldier's right hand is on screen-left. Back view: right hand on screen-right. */

function fLegs(g, p, col, bootCol) {
  const c = g.c, hipY = L.HIP + p.fb;
  for (const [x, lift] of [[-6.8, p.liftL], [6.8, p.liftR]]) {
    const fy = -lift;
    c.beginPath(); cap(c, x, hipY, x * 1.06, fy - 7, 10.6); g.fill(col);
    c.beginPath(); rr(c, x - 5.8, fy - 9.5, 11.6, 9.8, 3.8); g.fill(bootCol);
  }
}
function fTorsoPath(c, shoY, hipY, hemY, w) {
  c.beginPath();
  c.moveTo(-13 - w, shoY - 1);
  c.quadraticCurveTo(0, shoY - 4.5, 13 + w, shoY - 1);
  c.quadraticCurveTo(17.5 + w, shoY + 1, 16.5 + w, shoY + 9);
  c.lineTo(15 + w, hipY - 1);
  c.lineTo(18.5 + w, hemY);
  c.quadraticCurveTo(0, hemY + 3.5, -18.5 - w, hemY);
  c.lineTo(-15 - w, hipY - 1);
  c.lineTo(-16.5 - w, shoY + 9);
  c.quadraticCurveTo(-17.5 - w, shoY + 1, -13 - w, shoY - 1);
  c.closePath();
}
function fTorso(g, shoY, hipY, hemY, col, o = {}) {
  const c = g.c, w = o.w || 0;
  fTorsoPath(c, shoY, hipY, hemY, w); g.fill(col);
  if (g.out) return;
  fTorsoPath(c, shoY, hipY, hemY, w);
  g.inside((c) => {
    c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(7 + w, shoY - 8, 16, 70);
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-15 - w, shoY - 8, 5, 70);
    if (o.quilt && g.detail >= 1) {
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.1;
      for (let x = -15; x <= 16; x += 5.2) { c.beginPath(); c.moveTo(x, shoY - 4); c.lineTo(x * 1.1, hemY); c.stroke(); }
    }
    if (o.stripe) { c.fillStyle = o.stripe; c.fillRect(-2.6, shoY - 6, 5.2, hemY - shoY + 8); }
    if (o.trim) { c.fillStyle = o.trim; c.fillRect(-24, hemY - 4.2, 48, 8); }
    if (o.belt !== false) {
      c.fillStyle = PAL.leatherD; c.fillRect(-24, hipY - 5.5, 48, 5);
      if (!o.back) { c.fillStyle = PAL.gold; c.fillRect(-3.2, hipY - 6.4, 6.4, 6.8); }
    }
  });
}
function fArm(g, sx, sy, hx, hy, sleeve, hand, bend, line) {
  const c = g.c, e = ik(sx, sy, hx, hy, L.UA, L.FA, bend);
  c.beginPath(); cap(c, sx, sy, e.ex, e.ey, 9.5); cap(c, e.ex, e.ey, e.hx, e.hy, 8.2); g.fill(sleeve, line);
  c.beginPath(); circ(c, e.hx, e.hy, 5); g.fill(hand, line);
  return e;
}
function fHead(g, y, col) { const c = g.c; c.beginPath(); circ(c, 0, y, L.HR); g.fill(col || PAL.skin); }
function fFace(g, y) {
  if (g.out) return;
  const c = g.c;
  g.dot(-5.3, y + 1.8, 1.9, INK); g.dot(5.3, y + 1.8, 1.9, INK);
  if (g.detail >= 1) {
    c.beginPath(); ell(c, -8.5, y + 6.5, 2.8, 1.8); ell(c, 8.5, y + 6.5, 2.8, 1.8); c.fillStyle = rgba(PAL.blush, 0.45); c.fill();
    g.line([-2.2, y + 8, 0, y + 8.8, 2.2, y + 8], INK, 1.1);
  }
}
function fHair(g, y) { const c = g.c; c.beginPath(); circ(c, 0, y, L.HR); g.fill('#6b4526'); }
function swingArm(p, side) { return p.walking ? p.swing * 4 * side : 0; }

/* ---------- kettle hat (front/back) ---------- */
function kettleFB(g, hy, back) {
  const c = g.c;
  c.beginPath(); c.moveTo(-14, hy - 4); c.bezierCurveTo(-14, hy - 24, 14, hy - 24, 14, hy - 4); c.closePath(); g.fill(PAL.steel);
  if (!g.out) {
    c.beginPath(); c.moveTo(-14, hy - 4); c.bezierCurveTo(-14, hy - 24, 14, hy - 24, 14, hy - 4); c.closePath();
    g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(6, hy - 26, 12, 24); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, -5, hy - 15, 4, 3, 0.3); c.fill(); });
    g.line([0, hy - 20, 0, hy - 5], PAL.steelD, 1);
  }
  c.beginPath(); ell(c, 0, hy - 4.5, 21.5, 5.2); g.fill(PAL.steelD);
  if (!g.out) { c.beginPath(); ell(c, 0, hy - 5.5, 19, 3); c.fillStyle = PAL.steel; c.fill(); }
}

/* ================= PIKER front/back ================= */
TROOPS.piker.front = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const atk = p.anim === 'attack', th = p.thr || 0;
  let b, tip;
  if (atk) { b = [-4, -124 + th]; tip = [-8, 30 + th]; }
  else if (p.walking) { b = [-17, -14 + p.fb]; tip = [-22, -164 + p.fb]; }
  else { b = [-17, -1]; tip = [-18, -151]; }
  const at = (y) => { const k = (y - b[1]) / (tip[1] - b[1]); return [lerp(b[0], tip[0], k), y]; };
  fLegs(g, p, PAL.hose, PAL.boot);
  if (!atk) fArm(g, 15, shoY + 4, 18, -38 + p.fb + swingArm(p, 1), shade(PAL.mail, -0.1), PAL.skin, -1);
  fTorso(g, shoY, hipY, -22 + p.fb, tm.main, { trim: PAL.gold });
  if (atk) {
    // pike toward camera: drawn over chest, head occludes top part
    const draw = () => { const c2 = g.c; c2.beginPath(); cap(c2, b[0], b[1], tip[0], tip[1] - 16, 3.8); g.fill(PAL.wood); };
    draw();
  }
  fHead(g, hy); fFace(g, hy);
  kettleFB(g, hy);
  if (atk) {
    c.save(); c.translate(tip[0], tip[1]); c.rotate(Math.atan2(tip[1] - b[1], tip[0] - b[0]));
    c.beginPath(); c.moveTo(-17, -3.2); c.quadraticCurveTo(-9, -5.4, 2, 0); c.quadraticCurveTo(-9, 5.4, -17, 3.2); c.closePath(); g.fill(PAL.steelL);
    c.restore();
    const h1 = at(-60 + p.fb), h2 = at(-44 + p.fb);
    fArm(g, -15, shoY + 4, h1[0], h1[1], PAL.mail, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, h2[0] + 2, h2[1], PAL.mail, PAL.skin, -1, true);
  } else {
    gPike(g, b[0], b[1], Math.atan2(tip[1] - b[1], tip[0] - b[0]), Math.hypot(tip[0] - b[0], tip[1] - b[1]));
    const h = at(-50 + p.fb);
    fArm(g, -15, shoY + 4, h[0] + 1.5, h[1], PAL.mail, PAL.skin, 1, true);
  }
};
TROOPS.piker.back = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const atk = p.anim === 'attack', th = p.thr || 0;
  if (atk) {
    const b = [6, -40], tip = [3, -196 - th];
    gPike(g, b[0], b[1], Math.atan2(tip[1] - b[1], tip[0] - b[0]), Math.hypot(tip[0] - b[0], tip[1] - b[1]));
  } else {
    const b = p.walking ? [17, -14 + p.fb] : [17, -1], tip = p.walking ? [22, -164 + p.fb] : [18, -151];
    gPike(g, b[0], b[1], Math.atan2(tip[1] - b[1], tip[0] - b[0]), Math.hypot(tip[0] - b[0], tip[1] - b[1]));
  }
  fLegs(g, p, PAL.hose, PAL.boot);
  if (atk) {
    fArm(g, -15, shoY + 4, -5, shoY + 6, shade(PAL.mail, -0.1), PAL.skin, -1);
    fArm(g, 15, shoY + 4, 6, shoY + 6, shade(PAL.mail, -0.1), PAL.skin, 1);
  }
  fTorso(g, shoY, hipY, -22 + p.fb, tm.main, { trim: PAL.gold, back: true });
  if (atk) {
    c.beginPath(); cap(c, -15.5, shoY + 3, -9, shoY + 1, 9.5); g.fill(PAL.mail, true);
    c.beginPath(); cap(c, 15.5, shoY + 3, 9, shoY + 1, 9.5); g.fill(PAL.mail, true);
  } else {
    fArm(g, -15, shoY + 4, -18, -38 + p.fb - swingArm(p, 1), PAL.mail, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, 18.5, -50 + p.fb, PAL.mail, PAL.skin, -1, true);
  }
  fHair(g, hy);
  kettleFB(g, hy, true);
};

/* ================= CROSSBOWMAN front/back ================= */
function xbowFront(g, cx, cy, loaded) {
  // pointing at the camera: prod as horizontal arc, stock foreshortened
  const c = g.c;
  c.beginPath(); rr(c, cx - 4, cy - 3, 8, 15, 2.5); g.fill(PAL.wood);
  c.beginPath(); c.moveTo(cx - 20, cy - 2); c.quadraticCurveTo(cx, cy + 8, cx + 20, cy - 2); c.lineTo(cx + 20, cy + 1.2); c.quadraticCurveTo(cx, cy + 11.5, cx - 20, cy + 1.2); c.closePath(); g.fill(PAL.steel);
  if (!g.out) { g.line([cx - 19, cy - 1, cx, cy - 4, cx + 19, cy - 1], '#efe6d2', 1); if (loaded) g.dot(cx, cy - 2, 2.2, PAL.steelDD); }
}
TROOPS.crossbow.front = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const sleeve = shade(tm.main, -0.12);
  const st = p.anim === 'attack' ? p.stage : 'carry';
  fLegs(g, p, PAL.hose, PAL.boot);
  if (st === 'carry') fArm(g, 15, shoY + 4, 17, -40 + p.fb - swingArm(p, 1), sleeve, PAL.skin, -1);
  fTorso(g, shoY, hipY, -24 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
  fHead(g, hy); fFace(g, hy);
  // sallet front
  if (g.kit && g.kit.helm === 'kettle') kettleFB(g, hy);
  else {
    c.beginPath(); c.moveTo(-15.5, hy + 1); c.bezierCurveTo(-16, hy - 25, 16, hy - 25, 15.5, hy + 1); c.lineTo(11, hy - 2); c.quadraticCurveTo(0, hy - 6, -11, hy - 2); c.closePath(); g.fill(PAL.steel);
    if (!g.out) { c.beginPath(); ell(c, -5, hy - 15, 4.5, 2.6, 0.3); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill(); }
  }
  if (st === 'aim') {
    xbowFront(g, 0, -64 + p.fb, p.loaded);
    fArm(g, -15, shoY + 4, -8, -58 + p.fb, sleeve, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, 8, -58 + p.fb, sleeve, PAL.skin, -1, true);
  } else if (st === 'reload' || st === 'raise') {
    xbowFront(g, 0, -36 + p.fb, p.loaded);
    const k = p.stage === 'reload' ? Math.sin(Math.PI * clamp((p.u - 0.5) / 0.27)) * 8 : 0;
    fArm(g, -15, shoY + 4, -6, -44 - k + p.fb, sleeve, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, 6, -44 - k + p.fb, sleeve, PAL.skin, -1, true);
  } else {
    gCrossbow(g, -16, -40 + p.fb, -0.72, true);
    fArm(g, -15, shoY + 4, -9, -46 + p.fb, sleeve, PAL.skin, 1, true);
  }
};
TROOPS.crossbow.back = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const sleeve = shade(tm.main, -0.12);
  const st = p.anim === 'attack' ? p.stage : 'carry';
  if (st === 'carry') { c.save(); c.scale(-1, 1); gCrossbow(g, -16, -40 + p.fb, -0.72, true); c.restore(); }
  if (st === 'reload' || st === 'raise') { xbowFront(g, 0, -40 + p.fb, p.loaded); }
  fLegs(g, p, PAL.hose, PAL.boot);
  fTorso(g, shoY, hipY, -24 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35), back: true });
  // quiver on back hip
  c.save(); c.translate(-9, hipY - 2); c.rotate(0.25);
  c.beginPath(); rr(c, -4.5, -6, 9, 16, 2); g.fill(PAL.leather);
  if (!g.out) { g.line([-2, -6, -3, -11], '#e9e1cf', 1.4); g.line([1.5, -6, 2, -12], '#e9e1cf', 1.4); }
  c.restore();
  if (st === 'aim') {
    fArm(g, -15, shoY + 4, -7, shoY - 2, sleeve, PAL.skin, -1, true);
    fArm(g, 15, shoY + 4, 7, shoY - 2, sleeve, PAL.skin, 1, true);
    c.beginPath(); c.moveTo(-22, -72 + p.fb); c.quadraticCurveTo(0, -80 + p.fb, 22, -72 + p.fb); c.lineTo(22, -69 + p.fb); c.quadraticCurveTo(0, -77 + p.fb, -22, -69 + p.fb); c.closePath(); g.fill(PAL.steel);
  } else {
    fArm(g, -15, shoY + 4, -17, -40 + p.fb + swingArm(p, 1), sleeve, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, 10, -48 + p.fb, sleeve, PAL.skin, -1, true);
  }
  fHair(g, hy);
  // sallet back with tail flare
  if (g.kit && g.kit.helm === 'kettle') { kettleFB(g, hy, true); return; }
  c.beginPath(); c.moveTo(-15, hy + 4); c.bezierCurveTo(-17, hy - 25, 17, hy - 25, 15, hy + 4); c.quadraticCurveTo(19, hy + 9, 21, hy + 10); c.quadraticCurveTo(0, hy + 6, -21, hy + 10); c.quadraticCurveTo(-19, hy + 9, -15, hy + 4); c.closePath(); g.fill(PAL.steel);
  if (!g.out) { g.line([0, hy - 19, 0, hy + 6], PAL.steelD, 1.1); c.beginPath(); ell(c, -5, hy - 14, 4.5, 2.6, 0.3); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill(); }
};

/* ================= SWORDSMAN front/back ================= */
function greatHelmFront(g, hy, tm) {
  const c = g.c;
  const path = () => { c.beginPath(); c.moveTo(-13.5, hy + 15); c.lineTo(-13.5, hy - 12); c.quadraticCurveTo(-13.5, hy - 18, -7, hy - 18); c.lineTo(7, hy - 18); c.quadraticCurveTo(13.5, hy - 18, 13.5, hy - 12); c.lineTo(13.5, hy + 15); c.closePath(); };
  path(); g.fill(PAL.steel);
  if (!g.out) {
    path();
    g.inside((c) => {
      c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, hy - 20, 10, 38);
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-11, hy - 16, 3, 28);
      c.fillStyle = PAL.gold; c.fillRect(-2.2, hy - 18, 4.4, 34);
      c.fillStyle = PAL.steelDD; c.fillRect(-15, hy + 11, 30, 4);
    });
    c.beginPath(); rr(c, -12, hy - 4.5, 24, 3.6, 1.5); c.fillStyle = INK; c.fill();
    c.fillStyle = PAL.gold; c.fillRect(-2.2, hy - 4.5, 4.4, 3.6);
    if (g.detail >= 1) for (const [x, y] of [[5, 3], [8, 3], [5, 6.5], [8, 6.5], [-5, 3], [-8, 3], [-5, 6.5], [-8, 6.5]]) g.dot(x, hy + y, 0.9, INK);
  }
  c.beginPath(); c.moveTo(-7, hy - 17); c.quadraticCurveTo(-8, hy - 31, 0, hy - 31); c.quadraticCurveTo(8, hy - 31, 7, hy - 17); c.closePath(); g.fill(tm.main);
}
function greatHelmBack(g, hy, tm) {
  const c = g.c;
  c.beginPath(); c.moveTo(-13.5, hy + 15); c.lineTo(-13.5, hy - 12); c.quadraticCurveTo(-13.5, hy - 18, -7, hy - 18); c.lineTo(7, hy - 18); c.quadraticCurveTo(13.5, hy - 18, 13.5, hy - 12); c.lineTo(13.5, hy + 15); c.closePath();
  g.fill(PAL.steel);
  if (!g.out) {
    c.beginPath(); c.moveTo(-13.5, hy + 15); c.lineTo(-13.5, hy - 12); c.quadraticCurveTo(-13.5, hy - 18, -7, hy - 18); c.lineTo(7, hy - 18); c.quadraticCurveTo(13.5, hy - 18, 13.5, hy - 12); c.lineTo(13.5, hy + 15); c.closePath();
    g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, hy - 20, 10, 38); c.fillStyle = PAL.steelDD; c.fillRect(-15, hy + 11, 30, 4); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-11, hy - 16, 3, 26); });
  }
  c.beginPath(); c.moveTo(-7, hy - 17); c.quadraticCurveTo(-8, hy - 31, 0, hy - 31); c.quadraticCurveTo(8, hy - 31, 7, hy - 17); c.closePath(); g.fill(tm.main);
}
function shieldBack(g, cx, cy, w, h) {
  const c = g.c;
  const path = () => { c.beginPath(); c.moveTo(cx - w / 2, cy - h / 2); c.quadraticCurveTo(cx, cy - h / 2 - h * 0.07, cx + w / 2, cy - h / 2); c.bezierCurveTo(cx + w / 2, cy + h * 0.12, cx + w * 0.32, cy + h * 0.36, cx, cy + h / 2); c.bezierCurveTo(cx - w * 0.32, cy + h * 0.36, cx - w / 2, cy + h * 0.12, cx - w / 2, cy - h / 2); c.closePath(); };
  path(); g.fill(PAL.wood, true);
  if (!g.out) { path(); g.inside((c) => { c.fillStyle = PAL.leatherD; c.fillRect(cx - w, cy - 6, w * 2, 3.5); c.fillRect(cx - w, cy + 4, w * 2, 3.5); c.lineWidth = 3; c.strokeStyle = PAL.steelD; path(); c.stroke(); }); }
}
function swordPoseFB(p, front) {
  // returns grip x,y and blade angle for front/back views; weapon hand x sign
  const sx = front ? -1 : 1;
  if (p.anim === 'attack') {
    const u = p.u;
    if (u < 0.35) { const k = smooth(u / 0.35); return { x: sx * lerp(18, 10, k), y: lerp(-56, -88, k), a: front ? lerp(-1.75, -1.2, k) : lerp(-1.4, -1.9, k), over: false }; }
    if (u < 0.52) { const k = easeOut(seg(u, 0.35, 0.52)); return front ? { x: lerp(-10, 2, k), y: lerp(-88, -58, k), a: lerp(-1.2, 1.35, k), over: true } : { x: lerp(10, 6, k), y: lerp(-88, -76, k), a: lerp(-1.9, -1.35, k), over: false }; }
    const k = smooth(seg(u, 0.52, 1));
    return front ? { x: lerp(2, -18, k), y: lerp(-58, -56, k), a: lerp(1.35, -1.75, k), over: k < 0.5 } : { x: lerp(6, 18, k), y: lerp(-76, -56, k), a: lerp(-1.35, -1.4, k), over: false };
  }
  return { x: sx * 18, y: -56 + p.fb + (p.walking ? p.swing * 1.5 : 0), a: front ? -1.75 : -1.4, over: false };
}
TROOPS.sword.front = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const sp = swordPoseFB(p, true);
  fLegs(g, p, PAL.mailD, PAL.steelDD);
  fTorso(g, shoY, hipY, -19 + p.fb, tm.main, { w: 1.5, trim: PAL.gold, stripe: PAL.gold });
  greatHelmFront(g, hy, tm);
  if (!sp.over) gSword(g, sp.x, sp.y, sp.a, 44);
  fArm(g, -16, shoY + 4, sp.x, sp.y, PAL.mail, PAL.steel, 1, true);
  fArm(g, 16, shoY + 4, 10, -52 + p.fb, PAL.mail, PAL.steel, -1, true);
  gHeater(g, 7, -49 + p.fb, 28, 36, tm);
  if (sp.over) gSword(g, sp.x, sp.y, sp.a, 44);
};
TROOPS.sword.back = function (g, p) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const sp = swordPoseFB(p, false);
  shieldBack(g, -15, -50 + p.fb, 22, 34);
  fLegs(g, p, PAL.mailD, PAL.steelDD);
  fTorso(g, shoY, hipY, -19 + p.fb, tm.main, { w: 1.5, trim: PAL.gold, back: true });
  gSword(g, sp.x, sp.y, sp.a, 44);
  fArm(g, 16, shoY + 4, sp.x, sp.y, PAL.mail, PAL.steel, -1, true);
  fArm(g, -16, shoY + 4, -15, -46 + p.fb, PAL.mail, PAL.steel, 1, true);
  greatHelmBack(g, hy, tm);
};

/* ================= KNIGHT front/back ================= */
function riderFB(g, p, rb, front, tm) {
  const c = g.c;
  // torso
  const path = () => { c.beginPath(); c.moveTo(-14, rb - 51); c.quadraticCurveTo(0, rb - 56, 14, rb - 51); c.quadraticCurveTo(18, rb - 36, 15, rb - 20); c.quadraticCurveTo(0, rb - 15, -15, rb - 20); c.quadraticCurveTo(-18, rb - 36, -14, rb - 51); c.closePath(); };
  path(); g.fill(tm.main);
  if (!g.out) { path(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, rb - 60, 12, 50); c.fillStyle = PAL.leatherD; c.fillRect(-20, rb - 27, 40, 4.5); if (front) { c.fillStyle = PAL.gold; c.fillRect(-2, rb - 50, 4, 26); } }); }
  const hx = 0, hy = rb - 62;
  // plume
  c.beginPath(); c.moveTo(-5, hy - 16); c.quadraticCurveTo(-6, hy - 34, 4, hy - 36); c.quadraticCurveTo(12, hy - 30, 6, hy - 16); c.closePath(); g.fill(tm.main);
  // helm
  const hp = () => { c.beginPath(); c.moveTo(-12.5, hy + 12); c.lineTo(-12.5, hy - 5); c.quadraticCurveTo(-11, hy - 18, 0, hy - 19); c.quadraticCurveTo(11, hy - 18, 12.5, hy - 5); c.lineTo(12.5, hy + 12); c.closePath(); };
  hp(); g.fill(PAL.steel);
  if (!g.out) {
    hp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(6, hy - 20, 9, 34); c.fillStyle = PAL.gold; c.fillRect(-14, hy - 8, 28, 3.6); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-10, hy - 14, 3, 22); });
    if (front) { c.beginPath(); rr(c, -10, hy - 1, 20, 3.2, 1.4); c.fillStyle = INK; c.fill(); c.fillStyle = PAL.gold; c.fillRect(-1.8, hy - 1, 3.6, 12); }
  }
}
function horseLegFB(g, x, lift, top, col, len) {
  const c = g.c;
  c.beginPath(); taper(c, x, top, x, -6 - lift, 11, 7); g.fill(col);
  c.beginPath(); rr(c, x - 5, -7 - lift, 10, 7, 2); g.fill(PAL.hoof);
}
TROOPS.knight.front = function (g, p) {
  const c = g.c, tm = g.team;
  const ph = p.hph, walking = p.anim === 'walk';
  const lL = walking ? Math.max(0, Math.sin(ph)) * 6 : 0, lR = walking ? Math.max(0, -Math.sin(ph)) * 6 : 0;
  const by = -60 + p.hb;
  const coat = PAL.coat;
  // hind legs (far) visible between/behind front legs
  horseLegFB(g, -13, lR * 0.6 + 7, by + 8, shade(coat, -0.35));
  horseLegFB(g, 13, lL * 0.6 + 7, by + 8, shade(coat, -0.35));
  // barrel (covered by caparison)
  const cp = () => {
    c.beginPath(); c.moveTo(-25, by - 14); c.quadraticCurveTo(0, by - 22, 25, by - 14); c.quadraticCurveTo(31, by + 4, 27, by + 20);
    const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(27, -27, i / n), xb = lerp(27, -27, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 27, xb, by + 20); }
    c.quadraticCurveTo(-31, by + 4, -25, by - 14); c.closePath();
  };
  cp(); g.fill(tm.main);
  if (!g.out) { cp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(8, by - 30, 30, 60); c.lineWidth = 5; c.strokeStyle = PAL.gold; c.beginPath(); c.moveTo(27, by + 20); const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(27, -27, i / n), xb = lerp(27, -27, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 27, xb, by + 20); } c.stroke(); }); }
  // rider (behind head)
  const rb = by - 8 + p.hb * 0.3;
  riderFB(g, p, rb, true, tm);
  // lance (rider's right = screen-left)
  const atk = p.anim === 'attack', thr = p.thr || 0;
  let b, tip;
  if (atk) { b = [-12, -138]; tip = [-17, 34 + thr]; } else { b = [-17, -64 + p.hb]; tip = [-21, -206 + p.hb]; }
  if (!atk) {
    c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 5, 2.6); g.fill(PAL.woodL);
    gPennant(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), tm, p.t);
  }
  fArm(g, 13, rb - 45, 9, rb - 26, PAL.mail, PAL.steel, -1);
  // neck + head toward camera
  const hy = by - 19;
  c.beginPath(); ell(c, 0, by - 8, 14, 15); g.fill(coat);
  const head = () => { c.beginPath(); c.moveTo(-12, hy - 16); c.quadraticCurveTo(0, hy - 22, 12, hy - 16); c.quadraticCurveTo(13, hy + 8, 9, hy + 26); c.quadraticCurveTo(0, hy + 32, -9, hy + 26); c.quadraticCurveTo(-13, hy + 8, -12, hy - 16); c.closePath(); };
  c.beginPath(); poly(c, [-10, hy - 14, -15, hy - 28, -4, hy - 18]); g.fill(coat);
  c.beginPath(); poly(c, [10, hy - 14, 15, hy - 28, 4, hy - 18]); g.fill(coat);
  head(); g.fill(coat);
  if (!g.out) {
    head(); g.inside((c) => { c.fillStyle = '#efe6d8'; c.beginPath(); c.moveTo(-3, hy - 16); c.lineTo(3, hy - 16); c.lineTo(4.5, hy + 20); c.lineTo(-4.5, hy + 20); c.closePath(); c.fill(); c.fillStyle = shade(coat, -0.22); c.fillRect(-14, hy + 19, 28, 14); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(6, hy - 20, 10, 50); });
    g.dot(-9.5, hy - 3, 2.1, INK); g.dot(9.5, hy - 3, 2.1, INK);
    g.dot(-4, hy + 25, 1.4, INK); g.dot(4, hy + 25, 1.4, INK);
    g.line([-11.5, hy + 5, 11.5, hy + 5], PAL.leatherD, 1.7);
    g.line([-11, hy - 8, -11.5, hy + 5], PAL.leatherD, 1.4); g.line([11, hy - 8, 11.5, hy + 5], PAL.leatherD, 1.4);
    c.beginPath(); c.moveTo(-7, hy - 17); c.quadraticCurveTo(0, hy - 25, 7, hy - 17); c.quadraticCurveTo(0, hy - 13, -7, hy - 17); c.fillStyle = PAL.mane; c.fill();
  }
  // front legs
  horseLegFB(g, -9, lL, by + 14, coat);
  horseLegFB(g, 9, lR, by + 14, coat);
  if (atk) {
    c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 5, 2.8); g.fill(PAL.woodL);
    c.save(); c.translate(tip[0], tip[1]); c.rotate(Math.atan2(tip[1] - b[1], tip[0] - b[0])); c.beginPath(); c.moveTo(-1, -2.8); c.lineTo(10, 0); c.lineTo(-1, 2.8); c.closePath(); g.fill(PAL.steelL); c.restore();
    fArm(g, -12, rb - 44, lerp(b[0], tip[0], 0.14), lerp(b[1], tip[1], 0.14), PAL.mail, PAL.steel, 1, true);
  } else {
    fArm(g, -12, rb - 44, lerp(b[0], tip[0], 0.2) + 1, lerp(b[1], tip[1], 0.2), PAL.mail, PAL.steel, 1, true);
  }
};
TROOPS.knight.back = function (g, p) {
  const c = g.c, tm = g.team;
  const ph = p.hph, walking = p.anim === 'walk';
  const lL = walking ? Math.max(0, Math.sin(ph)) * 6 : 0, lR = walking ? Math.max(0, -Math.sin(ph)) * 6 : 0;
  const by = -60 + p.hb, coat = PAL.coat;
  // far front legs + head peeking
  horseLegFB(g, -10, lR * 0.6 + 7, by + 8, shade(coat, -0.35));
  horseLegFB(g, 10, lL * 0.6 + 7, by + 8, shade(coat, -0.35));
  c.beginPath(); ell(c, 0, by - 34, 7, 10); g.fill(coat);
  c.beginPath(); poly(c, [-5, by - 40, -8, by - 50, -1, by - 43]); poly(c, [5, by - 40, 8, by - 50, 1, by - 43]); g.fill(coat);
  // rump + caparison
  const rump = () => { c.beginPath(); c.moveTo(-24, by - 14); c.quadraticCurveTo(0, by - 24, 24, by - 14); c.quadraticCurveTo(29, by + 4, 25, by + 18); const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(25, -25, i / n), xb = lerp(25, -25, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 25, xb, by + 18); } c.quadraticCurveTo(-29, by + 4, -24, by - 14); c.closePath(); };
  // hind legs
  horseLegFB(g, -11, lL, by + 12, coat);
  horseLegFB(g, 11, lR, by + 12, coat);
  rump(); g.fill(tm.main);
  if (!g.out) {
    rump(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(8, by - 30, 30, 60); c.lineWidth = 5; c.strokeStyle = PAL.gold; c.beginPath(); c.moveTo(25, by + 18); const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(25, -25, i / n), xb = lerp(25, -25, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 25, xb, by + 18); } c.stroke();
      if (g.detail >= 1) { c.fillStyle = PAL.gold; c.beginPath(); circ(c, -12, by, 5); circ(c, 12, by, 5); c.fill(); } });
  }
  // tail
  const sw = Math.sin(p.t * 3.2) * 3;
  c.beginPath(); c.moveTo(-5, by - 10); c.quadraticCurveTo(-9 + sw, by + 10, -6 + sw * 1.6, by + 31); c.quadraticCurveTo(0 + sw * 1.5, by + 35, 6 + sw * 1.6, by + 31); c.quadraticCurveTo(9 + sw, by + 10, 5, by - 10); c.closePath(); g.fill(PAL.mane);
  if (!g.out) { g.line([-1, by - 4, -2 + sw, by + 12, -1 + sw * 1.4, by + 28], shade(PAL.mane, 0.25), 1.3); g.line([2.5, by - 4, 3 + sw, by + 14, 3 + sw * 1.4, by + 27], shade(PAL.mane, 0.25), 1.1); }
  // rider
  const rb = by + p.hb * 0.3;
  const atk = p.anim === 'attack', thr = p.thr || 0;
  const b = atk ? [12, -86] : [17, -64 + p.hb], tip = atk ? [8, -226 - thr] : [21, -206 + p.hb];
  c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 5, 2.6); g.fill(PAL.woodL);
  gPennant(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), tm, p.t);
  riderFB(g, p, rb, false, tm);
  fArm(g, -13, rb - 45, -10, rb - 28, PAL.mail, PAL.steel, 1, true);
  fArm(g, 13, rb - 45, lerp(b[0], tip[0], 0.14) - 1, lerp(b[1], tip[1], 0.14), PAL.mail, PAL.steel, -1, true);
};

/* ===== src/art/12-heraldry.js ===== */
/* Roll to War: heraldry — charges, coats of arms, shields, banners and flags for nations and heroes.
   Charges are drawn centred at (x, y) with size s (height of the charge) and fill the current path themselves. */
const HER = (RTW.heraldry = {});
const TINCT = (HER.TINCT = {
  or: '#f2be4b', argent: '#f6f2e6', gules: '#d63c31', azure: '#2f5fc4', sable: '#2a2320', vert: '#2f8a4c',
  yellow: '#f5c526', purpure: '#7b3d91', sand: '#e9d3a0', ochre: '#c9832e', jade: '#2c9c8a',
});
const tint = (k) => TINCT[k] || k;

/* ---------- charges ---------- */
function lisPath(c, x, y, s) {
  // fleur-de-lis: tall central petal, two curled side petals, band, three-lobed foot (path only)
  const k = s / 100, P = (px, py) => [x + px * k, y + py * k];
  const M = (px, py) => c.moveTo(...P(px, py)), Lt = (px, py) => c.lineTo(...P(px, py));
  const B = (a, b, d, e, f, h) => c.bezierCurveTo(...P(a, b), ...P(d, e), ...P(f, h));
  c.beginPath();
  M(0, -50); B(14, -34, 13, -10, 5, 6); Lt(-5, 6); B(-13, -10, -14, -34, 0, -50); c.closePath();
  for (const sx of [-1, 1]) {
    M(sx * 6, 2); B(sx * 14, -22, sx * 36, -30, sx * 42, -12);
    B(sx * 46, -2, sx * 38, 6, sx * 30, 2); B(sx * 36, -6, sx * 32, -16, sx * 24, -12);
    B(sx * 16, -8, sx * 12, 4, sx * 12, 12); Lt(sx * 6, 12); c.closePath();
  }
  M(-22, 8); Lt(22, 8); Lt(22, 17); Lt(-22, 17); c.closePath();
  M(-4, 17); Lt(4, 17); B(6, 30, 2, 40, 0, 48); B(-2, 40, -6, 30, -4, 17); c.closePath();
  for (const sx of [-1, 1]) { M(sx * 6, 17); B(sx * 14, 22, sx * 22, 30, sx * 18, 40); B(sx * 14, 32, sx * 10, 26, sx * 3, 22); c.closePath(); }
}
HER.lisPath = lisPath;
HER.lis = function (c, x, y, s, col) { lisPath(c, x, y, s); c.fillStyle = col; c.fill(); };
HER.lion = function (c, x, y, s, col, o = {}) {
  // lion passant guardant (walking, face toward the viewer), facing +x; s = body length
  const k = s / 100, line = o.line;
  c.save(); c.translate(x, y); c.scale(k * (o.flip ? -1 : 1), k);
  c.beginPath();
  // body
  c.moveTo(-34, -6); c.bezierCurveTo(-30, -18, 18, -20, 28, -12); c.bezierCurveTo(34, -2, 30, 8, 22, 10);
  c.lineTo(-26, 10); c.bezierCurveTo(-36, 8, -38, 2, -34, -6); c.closePath();
  // legs (raised fore paw)
  const leg = (x0, x1, y1) => { c.moveTo(x0 - 5, 4); c.lineTo(x0 + 5, 4); c.lineTo(x1 + 4, y1); c.lineTo(x1 + 9, y1 + 1); c.lineTo(x1 + 9, y1 + 5); c.lineTo(x1 - 5, y1 + 5); c.closePath(); };
  leg(-26, -30, 26); leg(-14, -12, 26); leg(16, 12, 26);
  c.moveTo(20, -6); c.lineTo(28, -8); c.lineTo(44, 4); c.lineTo(48, 2); c.lineTo(49, 7); c.lineTo(40, 9); c.lineTo(22, 4); c.closePath();
  // tail curling over the back
  c.moveTo(-32, -4); c.bezierCurveTo(-48, -8, -44, -34, -30, -36); c.bezierCurveTo(-26, -44, -16, -40, -20, -32); c.bezierCurveTo(-26, -30, -30, -26, -30, -20); c.bezierCurveTo(-30, -14, -28, -10, -26, -8); c.closePath();
  // head with mane, facing the viewer
  c.moveTo(46, -22); c.arc(32, -22, 15, 0, TAU);
  for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * 0.36; c.moveTo(32 + Math.cos(a - 0.14) * 13, -22 + Math.sin(a - 0.14) * 13); c.lineTo(32 + Math.cos(a) * 21, -22 + Math.sin(a) * 21); c.lineTo(32 + Math.cos(a + 0.14) * 13, -22 + Math.sin(a + 0.14) * 13); c.closePath(); }
  c.fillStyle = col; c.fill();
  if (line) {
    c.fillStyle = line; c.beginPath(); circ(c, 27, -25, 2.4); circ(c, 37, -25, 2.4); c.fill();
    c.strokeStyle = line; c.lineWidth = 2.2; c.beginPath(); c.moveTo(28, -15); c.quadraticCurveTo(32, -12, 36, -15); c.stroke();
  }
  c.restore();
};
HER.feather = function (c, x, y, s, col, o = {}) {
  // ostrich feather (the Black Prince's badge): drooping plume with a quill
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k); c.rotate(o.rot || 0);
  c.beginPath();
  c.moveTo(-2, 46); c.bezierCurveTo(-8, 10, -18, -20, -4, -46);
  c.bezierCurveTo(14, -52, 26, -36, 20, -18);
  for (let i = 0; i < 5; i++) { const yy = -18 + i * 11; c.quadraticCurveTo(28 - i * 2, yy + 5, 16 - i * 2, yy + 11); }
  c.bezierCurveTo(10, 38, 4, 42, 3, 46); c.closePath();
  c.fillStyle = col; c.fill();
  c.strokeStyle = o.quill || 'rgba(0,0,0,0.35)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 46); c.bezierCurveTo(-4, 10, -6, -18, 6, -40); c.stroke();
  c.restore();
};
HER.cross = function (c, x, y, s, col, kind = 'plain', w) {
  c.save(); c.translate(x, y); c.beginPath();
  const a = s / 2, t = w || s * 0.2;
  if (kind === 'patee') {
    for (let i = 0; i < 4; i++) {
      c.save(); c.rotate(i * Math.PI / 2);
      c.moveTo(-t * 0.3, 0); c.lineTo(-t * 0.35, -a * 0.3); c.quadraticCurveTo(-t * 0.5, -a * 0.8, -a * 0.42, -a); c.lineTo(a * 0.42, -a); c.quadraticCurveTo(t * 0.5, -a * 0.8, t * 0.35, -a * 0.3); c.lineTo(t * 0.3, 0); c.closePath();
      c.restore();
    }
    c.fillStyle = col; c.fill(); c.restore(); return;
  }
  c.rect(-t / 2, -a, t, s); c.rect(-a, -t / 2, s, t);
  c.fillStyle = col; c.fill();
  c.restore();
};
HER.mullet = function (c, x, y, r, col, n = 5, inner = 0.45, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr2 = i % 2 ? r * inner : r; i ? c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : c.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  c.closePath(); c.fillStyle = col; c.fill();
};
HER.heart = function (c, x, y, s, col) {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); c.moveTo(0, 42); c.bezierCurveTo(-40, 12, -52, -18, -30, -38); c.bezierCurveTo(-16, -48, -2, -40, 0, -26); c.bezierCurveTo(2, -40, 16, -48, 30, -38); c.bezierCurveTo(52, -18, 40, 12, 0, 42); c.closePath();
  c.fillStyle = col; c.fill(); c.restore();
};
HER.wolf = function (c, x, y, s, col, o = {}) {
  // wolf head in profile facing +x (Gökböri: "blue wolf")
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k * (o.flip ? -1 : 1), k);
  c.beginPath();
  c.moveTo(-30, 40); c.bezierCurveTo(-40, 10, -34, -18, -18, -30);
  c.lineTo(-22, -52); c.lineTo(-6, -36); c.lineTo(2, -54); c.lineTo(8, -32);
  c.bezierCurveTo(18, -26, 26, -16, 46, -8); c.lineTo(48, 0); c.bezierCurveTo(34, 6, 24, 6, 16, 8);
  c.bezierCurveTo(10, 18, 4, 28, 10, 42); c.bezierCurveTo(-4, 34, -16, 38, -30, 40); c.closePath();
  c.fillStyle = col; c.fill();
  if (o.eye) { c.fillStyle = o.eye; c.beginPath(); ell(c, 8, -18, 4.5, 2.6, 0.2); c.fill(); }
  c.restore();
};
HER.star8 = function (c, x, y, r, col) {
  // eight-pointed star (two overlapping squares): geometric motif for the Ayyubid banner
  c.save(); c.translate(x, y); c.beginPath();
  for (const rot of [0, Math.PI / 4]) { c.save(); c.rotate(rot); c.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); c.restore(); }
  c.fillStyle = col; c.fill('nonzero'); c.restore();
};
HER.roundels = function (c, pts, r, col) { c.beginPath(); for (const [x, y] of pts) circ(c, x, y, r); c.fillStyle = col; c.fill(); };

/* Japanese mon (clan crests) on a disc of radius r */
HER.mon = function (c, x, y, r, kind, col, bg) {
  c.save(); c.translate(x, y);
  if (bg) { c.beginPath(); circ(c, 0, 0, r); c.fillStyle = bg; c.fill(); }
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'butt';
  if (kind === 'shimazu') { // cross in a ring
    c.lineWidth = r * 0.16; c.beginPath(); circ(c, 0, 0, r * 0.82); c.stroke();
    c.lineWidth = r * 0.2; c.beginPath(); c.moveTo(-r * 0.82, 0); c.lineTo(r * 0.82, 0); c.moveTo(0, -r * 0.82); c.lineTo(0, r * 0.82); c.stroke();
  } else if (kind === 'wakisaka') { // interlocking rings
    c.lineWidth = r * 0.15; c.beginPath(); circ(c, -r * 0.3, 0, r * 0.5); c.stroke(); c.beginPath(); circ(c, r * 0.3, 0, r * 0.5); c.stroke();
  } else if (kind === 'todo') { // stylised ivy leaf
    c.beginPath(); c.moveTo(0, r * 0.75);
    for (const [a, rr2] of [[-2.3, 0.55], [-1.9, 0.7], [-1.5708, 0.85], [-1.2, 0.7], [-0.8, 0.55]]) c.lineTo(Math.cos(a) * r * rr2, Math.sin(a) * r * rr2 + r * 0.05);
    c.closePath(); c.fill();
    c.lineWidth = r * 0.08; c.strokeStyle = bg || '#fff'; c.beginPath(); c.moveTo(0, r * 0.7); c.lineTo(0, -r * 0.6); c.stroke();
  } else if (kind === 'kurushima') { // three bars in a square tray
    c.lineWidth = r * 0.12; c.beginPath(); c.rect(-r * 0.62, -r * 0.62, r * 1.24, r * 1.24); c.stroke();
    for (let i = -1; i <= 1; i++) c.fillRect(-r * 0.42, i * r * 0.34 - r * 0.07, r * 0.84, r * 0.14);
  } else { // plain hollow ring
    c.lineWidth = r * 0.22; c.beginPath(); circ(c, 0, 0, r * 0.62); c.stroke();
  }
  c.restore();
};

/* CJK glyph on a flag (commander flags); falls back to system CJK fonts */
const CJK = '"Noto Serif CJK KR","Noto Serif CJK JP","Noto Serif CJK SC","Nanum Myeongjo","Batang","Hiragino Mincho ProN","Songti SC","MS Mincho",serif';
HER.glyph = function (c, ch, x, y, size, col) {
  c.save(); c.font = `900 ${size}px ${CJK}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
  const M = c.getTransform ? c.getTransform() : null;
  if (M && M.a * M.d - M.b * M.c < 0) { c.translate(x, y); c.scale(-1, 1); c.fillText(ch, 0, 0); } else c.fillText(ch, x, y);   // never write a character mirrored (flags flown to the left)
  c.restore();
};

/* ---------- coats of arms ----------
   Painted into a box (x, y, w, h) with the clip already set by the caller. */
const ARMS = (HER.ARMS = {
  england: { field: 'gules', lions: 3 },
  franceAncient: { field: 'azure', semeLis: true },
  franceModern: { field: 'azure', lis: 3 },
  royal: { quarterly: ['franceModern', 'england', 'england', 'franceModern'] },          // Henry V
  edwardIII: { quarterly: ['franceAncient', 'england', 'england', 'franceAncient'] },     // Edward III and his sons
  blackPrince: { quarterly: ['franceAncient', 'england', 'england', 'franceAncient'], label: 'argent' },
  princePeace: { field: 'sable', feathers: 3 },                                            // "shield for peace"
  lancaster: { field: 'gules', lions: 3, label: 'azure', labelLis: true },               // Henry of Grosmont
  bedford: { quarterly: ['franceModern', 'england', 'england', 'franceModern'], label: 'azure', labelLis: true },
  templar: { field: 'argent', cross: 'gules' },
  hospitaller: { field: 'gules', cross: 'argent' },
  beauseant: { perFess: ['sable', 'argent'] },
  jerusalem: { field: 'argent', jcross: 'or' },
  lusignan: { barry: ['argent', 'azure'], lion: 'gules' },
  ibelin: { field: 'or', crossPatee: 'gules' },
  chatillon: { field: 'gules', pales: 'vair', chief: 'or' },
  douglas: { field: 'argent', heart: 'gules', chief: 'azure', chiefStars: 'argent' },
  albret: { quarterly: ['franceModern', 'plainGules', 'plainGules', 'franceModern'] },
  plainGules: { field: 'gules' },
  valentinois: { field: 'azure', roundels: 'argent', chief: 'or' },                     // Louis of Poitiers
  genoa: { field: 'argent', cross: 'gules' },
  ayyubid: { field: 'yellow', star8: '#b8312a', border: '#b8312a' },                     // Saladin's yellow banner
  gokbori: { field: '#3a6fb0', wolf: 'argent' },
  adil: { field: 'vert', star8: 'or' },
  joseon: { field: '#f3e7c4', glyph: '帥', glyphCol: '#1d1a17', border: '#c8372d' },     // commander flag
  ming: { field: '#e2b33a', glyph: '明', glyphCol: '#b0261c', border: '#b0261c' },
  chenlin: { field: '#b8312a', glyph: '陳', glyphCol: '#f7e4a8', border: '#f2be4b' },
  shimazu: { field: 'argent', mon: 'shimazu', monCol: '#1d1a17' },
  wakisaka: { field: 'argent', mon: 'wakisaka', monCol: '#1d1a17' },
  todo: { field: 'argent', mon: 'todo', monCol: '#1d1a17' },
  kurushima: { field: 'argent', mon: 'kurushima', monCol: '#1d1a17' },
  japan: { field: 'argent', mon: 'ring', monCol: '#1d1a17' },
});

HER.paint = function (c, key, x, y, w, h, o = {}) {
  const A = typeof key === 'string' ? ARMS[key] : key;
  if (!A) return;
  const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h);
  if (A.quarterly) {
    const q = A.quarterly;
    const boxes = [[x, y], [x + w / 2, y], [x, y + h / 2], [x + w / 2, y + h / 2]];
    boxes.forEach(([bx, by], i) => { c.save(); c.beginPath(); c.rect(bx, by, w / 2, h / 2); c.clip(); HER.paint(c, q[i], bx, by, w / 2, h / 2, o); c.restore(); });
  } else if (A.perFess) {
    c.fillStyle = tint(A.perFess[0]); c.fillRect(x, y, w, h / 2); c.fillStyle = tint(A.perFess[1]); c.fillRect(x, y + h / 2, w, h / 2);
  } else if (A.barry) {
    const n = 8; for (let i = 0; i < n; i++) { c.fillStyle = tint(A.barry[i % 2]); c.fillRect(x, y + (h * i) / n, w, h / n + 0.5); }
  } else {
    c.fillStyle = tint(A.field || 'argent'); c.fillRect(x, y, w, h);
  }
  const top = A.chief ? y + h * 0.3 : y, hh = A.chief ? h * 0.7 : h, ccy = top + hh / 2;
  if (A.lions) { const s = Math.min(w * 0.62, hh * 0.5); for (let i = 0; i < A.lions; i++) HER.lion(c, cx - s * 0.04, top + hh * (0.2 + i * 0.3), s, tint('or'), { line: o.detail ? INK : null }); }
  if (A.semeLis) { const step = Math.max(6, m * 0.3); let row = 0; for (let yy = y + step * 0.35; yy < y + h + step; yy += step * 0.8, row++) for (let xx = x + (row % 2 ? step * 0.5 : 0) + step * 0.1; xx < x + w + step; xx += step) HER.lis(c, xx, yy, step * 0.62, tint('or')); }
  if (A.lis) { const s = m * 0.36; [[cx - w * 0.24, cy - h * 0.18], [cx + w * 0.24, cy - h * 0.18], [cx, cy + h * 0.2]].forEach(([lx, ly]) => HER.lis(c, lx, ly, s, tint('or'))); }
  if (A.feathers) { const s = h * 0.5; [-1, 0, 1].forEach((i) => HER.feather(c, cx + i * w * 0.27, cy + (i ? 0 : -h * 0.06), s, tint('argent'), { rot: i * 0.15 })); }
  if (A.cross) HER.cross(c, cx, ccy, Math.max(w, hh) * 1.2, tint(A.cross), 'plain', m * 0.22);
  if (A.crossPatee) HER.cross(c, cx, ccy, m * 0.8, tint(A.crossPatee), 'patee', m * 0.2);
  if (A.jcross) { HER.cross(c, cx, cy, m * 0.62, tint(A.jcross), 'plain', m * 0.12); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) HER.cross(c, cx + dx * m * 0.26, cy + dy * m * 0.26, m * 0.16, tint(A.jcross), 'plain', m * 0.05); }
  if (A.lion) HER.lion(c, cx, cy + h * 0.02, w * 0.62, tint(A.lion));
  if (A.heart) HER.heart(c, cx, ccy + hh * 0.04, m * 0.45, tint(A.heart));
  if (A.pales) { c.fillStyle = '#6d8fc9'; for (let i = 0; i < 3; i++) c.fillRect(x + w * (0.18 + i * 0.25), top, w * 0.14, hh); }
  if (A.roundels) { const r = m * 0.09; HER.roundels(c, [[cx - w * 0.25, top + hh * 0.22], [cx, top + hh * 0.22], [cx + w * 0.25, top + hh * 0.22], [cx - w * 0.13, top + hh * 0.48], [cx + w * 0.13, top + hh * 0.48], [cx, top + hh * 0.74]], r, tint(A.roundels)); }
  if (A.star8) HER.star8(c, cx, cy, m * 0.3, tint(A.star8));
  if (A.wolf) HER.wolf(c, cx, cy, m * 0.62, tint(A.wolf), { eye: '#3a6fb0' });
  if (A.glyph) HER.glyph(c, A.glyph, cx, cy + m * 0.03, m * 0.62, A.glyphCol);
  if (A.mon) HER.mon(c, cx, cy, m * 0.34, A.mon, A.monCol);
  if (A.chief) { c.fillStyle = tint(A.chief); c.fillRect(x, y, w, h * 0.3); if (A.chiefStars) [-1, 0, 1].forEach((i) => HER.mullet(c, cx + i * w * 0.28, y + h * 0.15, h * 0.09, tint(A.chiefStars))); }
  if (A.label) {
    const ly = y + h * 0.13, lw = w * 0.84; c.fillStyle = tint(A.label);
    c.fillRect(cx - lw / 2, ly - h * 0.035, lw, h * 0.07);
    for (let i = 0; i < 3; i++) { const px = cx + (i - 1) * lw * 0.33; c.fillRect(px - w * 0.05, ly, w * 0.1, h * 0.13); if (A.labelLis) HER.lis(c, px, ly + h * 0.07, h * 0.08, tint('or')); }
  }
  if (A.border) { c.strokeStyle = A.border; c.lineWidth = m * 0.12; c.strokeRect(x, y, w, h); }
};

/* ---------- shields and flags ---------- */
function heaterPath(c, cx, cy, w, h) {
  c.beginPath();
  c.moveTo(cx - w / 2, cy - h / 2);
  c.quadraticCurveTo(cx, cy - h / 2 - h * 0.06, cx + w / 2, cy - h / 2);
  c.bezierCurveTo(cx + w / 2, cy + h * 0.12, cx + w * 0.32, cy + h * 0.36, cx, cy + h / 2);
  c.bezierCurveTo(cx - w * 0.32, cy + h * 0.36, cx - w / 2, cy + h * 0.12, cx - w / 2, cy - h / 2);
  c.closePath();
}
HER.heaterPath = heaterPath;
HER.shield = function (c, cx, cy, w, h, key, o = {}) {
  c.save();
  heaterPath(c, cx, cy, w, h); c.lineWidth = o.lw || Math.max(2, w * 0.09); c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke();
  c.save(); heaterPath(c, cx, cy, w, h); c.clip();
  HER.paint(c, key, cx - w / 2, cy - h / 2 - h * 0.06, w, h * 1.06, { detail: w > 60, shape: (g, ins) => heaterPath(g, cx, cy, w - 2 * ins, h - 2 * ins) });
  const g = c.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.2)');
  c.fillStyle = g; c.fillRect(cx - w / 2, cy - h / 2 - h * 0.1, w, h * 1.2);
  c.restore();
  if (o.rim !== false) { heaterPath(c, cx, cy, w * 0.94, h * 0.95); c.lineWidth = Math.max(1, w * 0.035); c.strokeStyle = o.rim || PAL.gold; c.stroke(); }
  c.restore();
};
/* waving banner on a pole: pole top at (x, y), cloth w x h hanging to the right (or left with o.flip) */
HER.banner = function (c, x, y, w, h, key, t = 0, o = {}) {
  const dir = o.flip ? -1 : 1, amp = o.amp == null ? h * 0.06 : o.amp;
  const wave = (u) => Math.sin(u * 5.2 - t * 5) * amp * u;
  const path = () => {
    c.beginPath(); c.moveTo(x, y);
    for (let i = 1; i <= 10; i++) { const u = i / 10; c.lineTo(x + dir * w * u, y + wave(u)); }
    if (o.tails) { c.lineTo(x + dir * w * 0.8, y + h * 0.5 + wave(0.8)); }
    for (let i = 10; i >= 0; i--) { const u = i / 10; c.lineTo(x + dir * w * u, y + h + wave(u)); }
    c.closePath();
  };
  c.save(); c.lineJoin = 'round';
  if (o.pole !== false) { c.beginPath(); cap(c, x, y - (o.finial ? 8 : 4), x, y + (o.poleLen || h * 2.2), Math.max(3, h * 0.07)); c.lineWidth = Math.max(2, h * 0.05); c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.woodD; c.fill(); }
  path(); c.lineWidth = o.lw || Math.max(2.5, h * 0.06); c.strokeStyle = INK; c.stroke();
  c.save(); path(); c.clip();
  c.translate(x, y); if (dir < 0) c.scale(-1, 1);
  HER.paint(c, key, 0, -amp, w, h + amp * 2, { detail: w > 50 });
  // folds
  const fg = c.createLinearGradient(0, 0, w, 0);
  for (let i = 0; i <= 6; i++) fg.addColorStop(i / 6, Math.sin(i / 6 * 5.2 - t * 5) > 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)');
  c.fillStyle = fg; c.fillRect(0, -amp * 2, w, h + amp * 4);
  c.restore();
  if (o.finial !== false) { c.beginPath(); circ(c, x, y - 5, Math.max(3, h * 0.08)); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.gold; c.fill(); }
  c.restore();
};
/* round shield face (Ayyubid style): concentric rings, boss */
HER.roundShield = function (c, cx, cy, r, col, o = {}) {
  c.save();
  c.beginPath(); circ(c, cx, cy, r); c.lineWidth = o.lw || Math.max(2, r * 0.14); c.strokeStyle = INK; c.stroke();
  c.fillStyle = col; c.fill();
  c.beginPath(); circ(c, cx, cy, r * 0.8); c.lineWidth = r * 0.12; c.strokeStyle = o.ring || PAL.gold; c.stroke();
  if (o.key) { c.save(); c.beginPath(); circ(c, cx, cy, r * 0.72); c.clip(); HER.paint(c, o.key, cx - r, cy - r, r * 2, r * 2); c.restore(); }
  else if (o.pattern !== false) { c.fillStyle = shade(col, -0.25); for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8; c.beginPath(); c.moveTo(cx + Math.cos(a - 0.12) * r * 0.3, cy + Math.sin(a - 0.12) * r * 0.3); c.lineTo(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68); c.lineTo(cx + Math.cos(a + 0.12) * r * 0.3, cy + Math.sin(a + 0.12) * r * 0.3); c.closePath(); c.fill(); } }
  c.beginPath(); circ(c, cx, cy, r * 0.24); c.lineWidth = Math.max(1.5, r * 0.07); c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.steelL; c.fill();
  c.restore();
};

/* ---------- nations ---------- */
HER.NATIONS = {
  england: { name: 'England', arms: 'royal', color: '#c8372d', sea: false },
  france: { name: 'France', arms: 'franceAncient', color: '#2f5fc4', sea: false },
  ayyubids: { name: 'Ayyubids', arms: 'ayyubid', color: '#e2a91a', sea: false },
  crusaders: { name: 'Crusaders', arms: 'jerusalem', color: '#d8d0bc', sea: false },
  joseon: { name: 'Joseon Korea', arms: 'joseon', color: '#c8372d', sea: true },
  japan: { name: 'Japan', arms: 'japan', color: '#1d1a17', sea: true },
  ming: { name: 'Ming China', arms: 'ming', color: '#e2b33a', sea: true },
};

/* ===== src/art/12b-heraldry2.js ===== */
/* Roll to War: heraldry for campaigns 4-6. New charges (sun in splendour, rose, boar, bear and ragged staff,
   dragon, star with rays, portcullis, stag's head, grapes, escallop, cross-crosslet, sword and crown, leopard's face,
   helmet, Toulouse cross), new ordinaries (per pale, fess, bend, bend sinister, chevron, saltire, ragged saltire,
   compony border) and the coats of arms of the Leper King, Joan of Arc and the Wars of the Roses. */
Object.assign(TINCT, { murrey: '#7a2442', ermine: '#f6f2e6' });

HER.sun = function (c, x, y, r, col) {
  // sun in splendour: a disc and sixteen rays, straight and wavy by turns
  c.save(); c.translate(x, y); c.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU, a0 = a - 0.1, a1 = a + 0.1, L = i % 2 ? r : r * 0.86;
    c.moveTo(Math.cos(a0) * r * 0.5, Math.sin(a0) * r * 0.5);
    if (i % 2) { c.lineTo(Math.cos(a) * L, Math.sin(a) * L); c.lineTo(Math.cos(a1) * r * 0.5, Math.sin(a1) * r * 0.5); }
    else { const m = r * 0.68; c.quadraticCurveTo(Math.cos(a - 0.2) * m, Math.sin(a - 0.2) * m, Math.cos(a) * L, Math.sin(a) * L); c.quadraticCurveTo(Math.cos(a + 0.2) * m, Math.sin(a + 0.2) * m, Math.cos(a1) * r * 0.5, Math.sin(a1) * r * 0.5); }
    c.closePath();
  }
  circ(c, 0, 0, r * 0.52); c.fillStyle = col; c.fill();
  c.fillStyle = 'rgba(160,90,10,0.35)'; c.beginPath(); circ(c, 0, 0, r * 0.3); c.fill();
  c.restore();
};
HER.rose = function (c, x, y, r, col, o = {}) {
  // heraldic rose: five petals, green barbs between them, a gold seeded centre
  c.save(); c.translate(x, y);
  c.fillStyle = o.barb || '#2f8a4c';
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i + 0.5) * (TAU / 5); c.beginPath(); c.moveTo(Math.cos(a - 0.22) * r * 0.55, Math.sin(a - 0.22) * r * 0.55); c.lineTo(Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08); c.lineTo(Math.cos(a + 0.22) * r * 0.55, Math.sin(a + 0.22) * r * 0.55); c.closePath(); c.fill(); }
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * (TAU / 5); circ(c, Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.46); }
  c.fill();
  if (o.inner) { c.fillStyle = o.inner; c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i + 0.5) * (TAU / 5); circ(c, Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.27); } c.fill(); }
  c.fillStyle = o.center || TINCT.or; c.beginPath(); circ(c, 0, 0, r * 0.24); c.fill();
  c.fillStyle = 'rgba(120,70,0,0.55)'; for (let i = 0; i < 5; i++) { const a = i * 1.26; c.beginPath(); circ(c, Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12, r * 0.045); c.fill(); }
  c.restore();
};
HER.boar = function (c, x, y, s, col, o = {}) {
  // boar passant facing +x; s = body length
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k * (o.flip ? -1 : 1), k);
  c.beginPath();
  c.moveTo(-40, 4); c.bezierCurveTo(-44, -14, -30, -26, -8, -27);
  for (let i = 0; i < 6; i++) { c.lineTo(-4 + i * 6, -31 - (i % 2) * 3); c.lineTo(-1 + i * 6, -27); }   // bristles
  c.bezierCurveTo(30, -26, 36, -18, 40, -12); c.lineTo(52, -4); c.lineTo(51, 4); c.lineTo(40, 5);
  c.bezierCurveTo(34, 10, 28, 12, 20, 12);
  const leg = (x0) => { c.lineTo(x0 + 4, 12); c.lineTo(x0 + 3, 28); c.lineTo(x0 - 4, 28); c.lineTo(x0 - 4, 12); };
  leg(16); leg(4); c.lineTo(-18, 12); leg(-22); leg(-32); c.lineTo(-38, 10);
  c.closePath();
  c.moveTo(-40, -2); c.bezierCurveTo(-50, -6, -52, 2, -46, 6); c.lineTo(-40, 2); c.closePath();   // tail curl
  c.moveTo(30, -24); c.lineTo(34, -34); c.lineTo(38, -22); c.closePath();                          // ear
  c.fillStyle = col; c.fill();
  // tusk and eye
  c.fillStyle = o.tusk || TINCT.or; c.beginPath(); c.moveTo(44, 2); c.quadraticCurveTo(50, -4, 46, -12); c.lineTo(43, -4); c.closePath(); c.fill();
  if (o.eye) { c.fillStyle = o.eye; c.beginPath(); circ(c, 38, -14, 2.4); c.fill(); }
  c.restore();
};
HER.bear = function (c, x, y, s, col, o = {}) {
  // bear rampant, muzzled and collared, clasping a ragged staff (Warwick); s = height
  const k = s / 100, edge = 'rgba(40,10,10,0.5)'; c.save(); c.translate(x, y); c.scale(k, k); c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(-24, 50); c.bezierCurveTo(-31, 30, -31, 6, -22, -8);          // back
  c.bezierCurveTo(-18, -22, -12, -30, -6, -34);                           // shoulders
  c.lineTo(-12, -42); c.bezierCurveTo(-10, -50, -2, -50, 0, -43);         // ear
  c.bezierCurveTo(8, -47, 18, -45, 23, -39); c.lineTo(31, -35); c.lineTo(29, -28); c.lineTo(18, -28);   // head and snout
  c.bezierCurveTo(13, -24, 9, -20, 8, -14);                               // throat
  c.bezierCurveTo(11, 0, 11, 16, 7, 30);                                  // belly
  c.lineTo(15, 45); c.lineTo(17, 50); c.lineTo(2, 50); c.lineTo(-2, 41); c.lineTo(-9, 50); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = edge; c.lineWidth = 2.2; c.stroke();
  // the ragged staff, held upright in front of the bear
  c.save(); c.translate(19, 0); c.rotate(0.1);
  c.beginPath(); c.rect(-5, -58, 10, 114);
  for (let i = 0; i < 5; i++) { const yy = -48 + i * 22; if (i % 2) c.rect(5, yy, 8, 7); else c.rect(-13, yy, 8, 7); }
  c.fillStyle = o.staff || col; c.fill(); c.strokeStyle = edge; c.lineWidth = 2.2; c.stroke(); c.restore();
  // forepaws round the staff, muzzle and collar
  c.beginPath(); ell(c, 17, -15, 8, 6); ell(c, 20, 7, 8, 6); c.fillStyle = col; c.fill(); c.strokeStyle = edge; c.lineWidth = 2; c.stroke();
  c.strokeStyle = o.muzzle || TINCT.or; c.lineWidth = 3.2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(21, -39); c.lineTo(23, -29); c.moveTo(-4, -31); c.quadraticCurveTo(4, -21, 10, -17); c.stroke();
  if (o.eye) { c.fillStyle = o.eye; c.beginPath(); circ(c, 12, -38, 2.2); c.fill(); }
  c.restore();
};
HER.dragon = function (c, x, y, s, col, o = {}) {
  // Welsh dragon passant facing +x; s = body length
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k * (o.flip ? -1 : 1), k);
  c.beginPath();
  // tail curling back over the body
  c.moveTo(-26, 0); c.bezierCurveTo(-50, 0, -56, -24, -40, -30); c.bezierCurveTo(-34, -32, -30, -26, -34, -22); c.lineTo(-44, -34); c.lineTo(-30, -30); c.bezierCurveTo(-40, -18, -34, -8, -22, -8); c.closePath();
  // body and legs
  c.moveTo(-28, -2); c.bezierCurveTo(-24, -16, 14, -18, 22, -10); c.lineTo(30, -24); c.bezierCurveTo(32, -30, 40, -32, 44, -28);
  c.lineTo(52, -26); c.lineTo(48, -22); c.lineTo(54, -18); c.lineTo(44, -18);                // head, open jaws
  c.bezierCurveTo(38, -16, 34, -10, 30, -2); c.bezierCurveTo(28, 6, 22, 8, 18, 8);
  c.lineTo(22, 22); c.lineTo(14, 22); c.lineTo(10, 8); c.lineTo(-10, 8); c.lineTo(-8, 22); c.lineTo(-16, 22); c.lineTo(-18, 8);
  c.bezierCurveTo(-26, 8, -30, 4, -28, -2); c.closePath();
  // wing raised behind
  c.moveTo(-4, -14); c.lineTo(-18, -44); c.lineTo(-8, -38); c.lineTo(0, -48); c.lineTo(6, -38); c.lineTo(16, -46); c.lineTo(12, -14); c.closePath();
  c.fillStyle = col; c.fill();
  c.restore();
};
HER.starRays = function (c, x, y, r, col) { HER.mullet(c, x, y, r, col, 5, 0.42); c.save(); c.strokeStyle = col; c.lineWidth = r * 0.14; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i + 0.5) * (TAU / 5); c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); c.lineTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15); c.stroke(); } c.restore(); };
HER.portcullis = function (c, x, y, s, col) {
  const w = s * 0.8, h = s * 0.9; c.save(); c.translate(x, y); c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < 4; i++) c.rect(-w / 2 + i * w / 3 - w * 0.05, -h / 2, w * 0.1, h);
  for (let j = 0; j < 4; j++) c.rect(-w / 2 - w * 0.05, -h / 2 + j * h / 3.2, w * 1.1, h * 0.08);
  for (let i = 0; i < 4; i++) { const px = -w / 2 + i * w / 3; c.moveTo(px - w * 0.06, h / 2); c.lineTo(px, h / 2 + h * 0.14); c.lineTo(px + w * 0.06, h / 2); }
  c.fill();
  c.strokeStyle = col; c.lineWidth = s * 0.05; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.quadraticCurveTo(-w * 0.8, -h * 0.9, -w * 0.9, -h * 0.4); c.moveTo(w / 2, -h / 2); c.quadraticCurveTo(w * 0.8, -h * 0.9, w * 0.9, -h * 0.4); c.stroke();
  c.restore();
};
HER.stagHead = function (c, x, y, s, col) {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k); c.beginPath();
  c.moveTo(-14, -10); c.bezierCurveTo(-16, 10, -10, 30, 0, 38); c.bezierCurveTo(10, 30, 16, 10, 14, -10); c.closePath();
  c.moveTo(-14, -8); c.lineTo(-26, -14); c.lineTo(-14, -16); c.closePath(); c.moveTo(14, -8); c.lineTo(26, -14); c.lineTo(14, -16); c.closePath();
  c.fillStyle = col; c.fill();
  c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 8, -14); c.quadraticCurveTo(sx * 26, -40, sx * 18, -60); c.moveTo(sx * 17, -32); c.lineTo(sx * 34, -40); c.moveTo(sx * 21, -46); c.lineTo(sx * 36, -58); c.stroke(); }
  c.restore();
};
HER.grapes = function (c, x, y, s, col, o = {}) {
  const r = s * 0.11; c.save(); c.fillStyle = col; c.beginPath();
  const rows = [[0, 3], [1, 3], [2, 2], [3, 1]];
  for (const [ri, n] of rows) for (let i = 0; i < n; i++) circ(c, x + (i - (n - 1) / 2) * r * 2.05, y - s * 0.1 + ri * r * 1.75, r);
  c.fill();
  c.fillStyle = o.leaf || col; c.beginPath(); c.moveTo(x, y - s * 0.3); c.quadraticCurveTo(x + s * 0.3, y - s * 0.55, x + s * 0.42, y - s * 0.3); c.quadraticCurveTo(x + s * 0.2, y - s * 0.2, x, y - s * 0.3); c.fill();
  c.strokeStyle = col; c.lineWidth = s * 0.05; c.beginPath(); c.moveTo(x, y - s * 0.22); c.lineTo(x - s * 0.04, y - s * 0.42); c.stroke();
  c.restore();
};
HER.escallop = function (c, x, y, s, col) {
  const r = s * 0.5; c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(0, r * 0.8); for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, rr2 = r * (i % 2 ? 0.92 : 1); c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.95 + r * 0.05); } c.closePath();
  c.rect(-r * 0.28, r * 0.72, r * 0.56, r * 0.2);
  c.fillStyle = col; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = s * 0.03; for (let i = 1; i < 8; i++) { const a = Math.PI + (i / 8) * Math.PI; c.beginPath(); c.moveTo(0, r * 0.75); c.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.8); c.stroke(); }
  c.restore();
};
HER.crossCrosslet = function (c, x, y, s, col) {
  const a = s / 2, t = s * 0.14; c.save(); c.translate(x, y); c.beginPath();
  c.rect(-t / 2, -a, t, s); c.rect(-a * 0.7, -t / 2 - a * 0.1, a * 1.4, t);
  c.rect(-t * 1.6, -a * 0.72, t * 3.2, t * 0.8); c.rect(-t * 1.6, a * 0.55, t * 3.2, t * 0.8);
  c.rect(-a * 0.66, -t * 1.7 - a * 0.1, t * 0.8, t * 3.2); c.rect(a * 0.66 - t * 0.8, -t * 1.7 - a * 0.1, t * 0.8, t * 3.2);
  c.fillStyle = col; c.fill(); c.restore();
};
HER.swordCharge = function (c, x, y, s, col, hilt) {
  c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(-s * 0.05, s * 0.3); c.lineTo(-s * 0.05, -s * 0.38); c.lineTo(0, -s * 0.46); c.lineTo(s * 0.05, -s * 0.38); c.lineTo(s * 0.05, s * 0.3); c.closePath();
  c.fillStyle = col; c.fill();
  c.fillStyle = hilt || TINCT.or; c.beginPath(); c.rect(-s * 0.18, s * 0.28, s * 0.36, s * 0.06); c.rect(-s * 0.035, s * 0.32, s * 0.07, s * 0.12); circ(c, 0, s * 0.47, s * 0.05); c.fill();
  c.restore();
};
HER.crownCharge = function (c, x, y, s, col) {
  c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(-s / 2, s * 0.25); c.lineTo(-s / 2, -s * 0.05); c.lineTo(-s * 0.25, s * 0.08); c.lineTo(0, -s * 0.25); c.lineTo(s * 0.25, s * 0.08); c.lineTo(s / 2, -s * 0.05); c.lineTo(s / 2, s * 0.25); c.closePath();
  c.fillStyle = col; c.fill(); c.restore();
};
HER.leopardFace = function (c, x, y, s, col, line) {
  const r = s * 0.42; c.save(); c.translate(x, y); c.beginPath();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.moveTo(Math.cos(a - 0.2) * r * 0.9, Math.sin(a - 0.2) * r * 0.9); c.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25); c.lineTo(Math.cos(a + 0.2) * r * 0.9, Math.sin(a + 0.2) * r * 0.9); }
  circ(c, 0, 0, r); c.fillStyle = col; c.fill();
  if (line) { c.fillStyle = line; c.beginPath(); circ(c, -r * 0.35, -r * 0.15, r * 0.14); circ(c, r * 0.35, -r * 0.15, r * 0.14); c.fill(); c.strokeStyle = line; c.lineWidth = r * 0.12; c.beginPath(); c.moveTo(-r * 0.25, r * 0.35); c.quadraticCurveTo(0, r * 0.55, r * 0.25, r * 0.35); c.stroke(); }
  c.restore();
};
HER.helmCharge = function (c, x, y, s, col) {
  c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(-s * 0.4, s * 0.4); c.lineTo(-s * 0.42, -s * 0.1); c.quadraticCurveTo(-s * 0.35, -s * 0.45, 0, -s * 0.46); c.quadraticCurveTo(s * 0.35, -s * 0.45, s * 0.42, -s * 0.1); c.lineTo(s * 0.4, s * 0.4); c.closePath();
  c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(-s * 0.3, -s * 0.05, s * 0.6, s * 0.08);
  c.restore();
};
HER.toulouse = function (c, x, y, s, col) {
  // cross clechée and pommettée (Tripoli): lobed arms ending in three balls
  const a = s / 2, t = s * 0.2; c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 4; i++) {
    c.save(); c.rotate(i * Math.PI / 2);
    c.moveTo(-t / 2, 0); c.lineTo(-t / 2, -a * 0.55); c.quadraticCurveTo(-t * 1.4, -a * 0.72, -t * 0.4, -a * 0.86); c.lineTo(0, -a * 0.95); c.lineTo(t * 0.4, -a * 0.86); c.quadraticCurveTo(t * 1.4, -a * 0.72, t / 2, -a * 0.55); c.lineTo(t / 2, 0); c.closePath();
    circ(c, 0, -a * 0.98, t * 0.3); circ(c, -t * 0.95, -a * 0.8, t * 0.3); circ(c, t * 0.95, -a * 0.8, t * 0.3);
    c.restore();
  }
  c.fill(); c.restore();
};

/* ---------- the painter, extended: ordinaries first, then charges ---------- */
const _herPaint0 = HER.paint;
// a bordure follows the outline of what it is painted on: o.shape(c, inset) builds that outline (a rectangle by default)
function herBorders(c, A, x, y, w, h, o) {
  if (!A.border && !A.borderCompony && !A.borderBezants) return;
  const m = Math.min(w, h), bw = m * 0.12;
  const path = (ins) => { if (o.shape) o.shape(c, ins); else { c.beginPath(); c.rect(x + ins, y + ins, w - 2 * ins, h - 2 * ins); } };
  c.save(); path(0); c.clip(); c.lineJoin = 'round';
  if (A.border) { path(0); c.lineWidth = bw * 2; c.strokeStyle = tint(A.border); c.stroke(); }
  if (A.borderCompony) { path(0); c.lineWidth = bw * 2; c.strokeStyle = tint(A.borderCompony[0]); c.stroke(); path(0); c.setLineDash([m * 0.15, m * 0.15]); c.strokeStyle = tint(A.borderCompony[1]); c.stroke(); c.setLineDash([]); }
  if (A.borderBezants) { path(0); c.lineWidth = bw * 2; c.strokeStyle = tint(A.borderBezantsField || 'gules'); c.stroke(); path(bw / 2); c.lineWidth = bw * 0.6; c.lineCap = 'round'; c.setLineDash([0.001, m * 0.19]); c.strokeStyle = tint(A.borderBezants); c.stroke(); c.setLineDash([]); }
  c.restore();
}
HER.paint = function (c, key, x, y, w, h, o = {}) {
  const A = typeof key === 'string' ? ARMS[key] : key;
  if (!A) return;
  const base = A.border ? Object.assign({}, A, { border: null }) : A;
  if (A.perPale) { c.fillStyle = tint(A.perPale[0]); c.fillRect(x, y, w / 2 + 0.5, h); c.fillStyle = tint(A.perPale[1]); c.fillRect(x + w / 2, y, w / 2, h); }
  else _herPaint0(c, base, x, y, w, h, o);
  const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h), gold = tint('or');
  const band = (x0, y0, x1, y1, th, col) => { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = tint(col); c.fillRect(-4, -th / 2, L + 8, th); c.restore(); };
  if (A.fess) { c.fillStyle = tint(A.fess); c.fillRect(x, cy - h * 0.12, w, h * 0.24); }
  if (A.bend) band(x - w * 0.05, y - h * 0.05, x + w * 1.05, y + h * 1.05, m * 0.26, A.bend);
  if (A.bendSinister) band(x + w * 1.05, y - h * 0.05, x - w * 0.05, y + h * 1.05, m * 0.14, A.bendSinister);
  if (A.chevron) { c.save(); c.fillStyle = tint(A.chevron); c.beginPath(); const t2 = m * 0.2; c.moveTo(x - w * 0.02, y + h * 0.82); c.lineTo(cx, y + h * 0.32); c.lineTo(x + w * 1.02, y + h * 0.82); c.lineTo(x + w * 1.02, y + h * 0.82 + t2); c.lineTo(cx, y + h * 0.32 + t2); c.lineTo(x - w * 0.02, y + h * 0.82 + t2); c.closePath(); c.fill(); c.restore(); }
  if (A.saltire) { const th = m * (A.ragged ? 0.13 : 0.2); band(x - 2, y - 2, x + w + 2, y + h + 2, th, A.saltire); band(x + w + 2, y - 2, x - 2, y + h + 2, th, A.saltire);
    if (A.ragged) { c.fillStyle = tint(A.saltire); for (let i = 1; i < 6; i++) { const u = i / 6; for (const [px, py, sgn] of [[x + w * u, y + h * u, 1], [x + w * (1 - u), y + h * u, -1]]) { c.beginPath(); c.save(); c.translate(px, py); c.rotate(sgn * Math.PI / 4); c.rect(-th * 0.3, -th * 0.95, th * 0.6, th * 0.5); c.restore(); c.fill(); } } } }
  // charges
  if (A.sun) HER.sun(c, cx, cy, m * 0.36, tint(A.sun));
  if (A.rose) HER.rose(c, cx, cy, m * (A.sun ? 0.17 : 0.3), tint(A.rose), { inner: A.roseInner ? tint(A.roseInner) : null });
  if (A.boar) HER.boar(c, cx - w * 0.03, cy - h * 0.04, w * 0.62, tint(A.boar), { eye: o.detail ? INK : null });
  if (A.bear) HER.bear(c, cx - w * 0.04, cy + h * 0.02, h * 0.72, tint(A.bear), { staff: tint(A.bear) });
  if (A.dragon) HER.dragon(c, cx, cy + h * 0.04, w * 0.72, tint(A.dragon));
  if (A.star) HER.starRays(c, A.starCorner ? x + w * 0.26 : cx, A.starCorner ? y + h * 0.26 : cy, m * (A.starCorner ? 0.14 : 0.3), tint(A.star));
  if (A.portcullis) HER.portcullis(c, cx, cy + h * 0.02, m * 0.5, tint(A.portcullis));
  if (A.stagHeads) { const bw2 = m * 0.2; for (let i = 0; i < 3; i++) { const u = 0.25 + i * 0.25; HER.stagHead(c, x + w * u, y + h * u + bw2 * 0.1, m * 0.2, tint(A.stagHeads)); } }
  if (A.grapes) [[cx - w * 0.22, cy - h * 0.18], [cx + w * 0.22, cy - h * 0.18], [cx, cy + h * 0.22]].forEach(([gx, gy]) => HER.grapes(c, gx, gy, m * 0.36, tint(A.grapes)));
  if (A.escallops) { const pts = [[0.2, 0.2], [0.5, 0.2], [0.8, 0.2], [0.32, 0.5], [0.68, 0.5], [0.5, 0.78]]; for (const [u, v] of pts) HER.escallop(c, x + w * u, y + h * v, m * 0.2, tint(A.escallops)); }
  if (A.crosslets) { const pts = A.crosslets === 'bend' ? [[0.22, 0.52], [0.18, 0.78], [0.42, 0.82], [0.58, 0.18], [0.82, 0.22], [0.78, 0.48]] : A.crosslets === 'onBend' ? [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]] : [[0.5, 0.5]]; for (const [u, v] of pts) HER.crossCrosslet(c, x + w * u, y + h * v, m * 0.16, tint(A.crossletCol || 'argent')); }
  if (A.leopards) [[cx - w * 0.26, y + h * 0.2], [cx + w * 0.26, y + h * 0.2], [cx, y + h * 0.8]].forEach(([lx, ly]) => HER.leopardFace(c, lx, ly, m * 0.26, tint(A.leopards), o.detail ? INK : null));
  if (A.helmets) [[cx - w * 0.26, y + h * 0.22], [cx + w * 0.26, y + h * 0.22], [cx, y + h * 0.8]].forEach(([lx, ly]) => HER.helmCharge(c, lx, ly, m * 0.26, tint(A.helmets)));
  if (A.toulouse) HER.toulouse(c, cx, cy, m * 0.78, tint(A.toulouse));
  if (A.duLys) { HER.swordCharge(c, cx, cy + h * 0.06, m * 0.8, tint('argent'), gold); HER.crownCharge(c, cx, cy - h * 0.34, m * 0.24, gold); HER.lis(c, cx - w * 0.27, cy + h * 0.04, m * 0.3, gold); HER.lis(c, cx + w * 0.27, cy + h * 0.04, m * 0.3, gold); }
  if (A.sword) HER.swordCharge(c, cx, cy, m * 0.8, tint(A.sword), gold);
  if (A.trueCross) { HER.cross(c, cx, cy + h * 0.06, m * 0.7, tint(A.trueCross), 'plain', m * 0.12); c.fillStyle = tint(A.trueCross); c.fillRect(cx - m * 0.16, cy - h * 0.2, m * 0.32, m * 0.08); }
  herBorders(c, A, x, y, w, h, o);
};

/* ---------- arms ---------- */
Object.assign(ARMS, {
  // plain fields for quartering
  plainOr: { field: 'or' }, plainAzure: { field: 'azure' }, plainArgent: { field: 'argent' }, plainSable: { field: 'sable' },
  // the Latin East
  hospitallerBlack: { field: 'sable', cross: 'argent' },          // the Hospitallers' black mantle, white cross (12th century)
  tripoli: { field: 'gules', toulouse: 'or' },                    // the Toulouse cross (Raymond III)
  trueCross: { field: '#8a1c1c', trueCross: 'or' },               // the relic of the True Cross carried before the army
  taqi: { field: 'yellow', star8: '#2f5fc4', border: '#2f5fc4' },
  farrukh: { field: '#e2b33a', star8: '#2f8a4c', border: '#2f8a4c' },
  // Joan of Arc
  joanStandard: { field: 'argent', semeLis: true },               // white, sown with golden lilies (her standard)
  duLys: { field: 'azure', duLys: true },                         // the arms granted to her family: sword, crown and two lilies
  dunois: { field: 'azure', lis: 3, label: 'argent', bendSinister: 'argent' },   // Orléans, with the bastard's baton
  lahire: { field: 'sable', grapes: 'argent' },
  xaQ1: { field: 'gules', lion: 'argent' }, xaQ2: { field: 'argent', cross: 'gules' },
  xaintrailles: { quarterly: ['xaQ1', 'xaQ2', 'xaQ2', 'xaQ1'] },
  alencon: { field: 'azure', lis: 3, borderBezants: 'argent', borderBezantsField: 'gules' },
  talbot: { field: 'gules', lion: 'or', border: '#f2be4b' },
  fastolf: { quarterly: ['plainOr', 'plainAzure', 'plainAzure', 'plainOr'], bend: 'gules', crosslets: 'onBend', crossletCol: 'argent' },
  suffolk: { field: 'azure', fess: 'or', leopards: 'or' },
  scales: { field: 'gules', escallops: 'argent' },
  stGeorge: { field: 'argent', cross: 'gules' },
  luxembourg: { field: 'argent', lion: 'gules' },
  burgundyCross: { field: 'argent', saltire: 'gules', ragged: true },   // the red ragged cross of Saint Andrew, Burgundy's field sign
  lisleadam: { field: 'or', chief: 'azure' },
  // the Wars of the Roses
  sunne: { perPale: ['murrey', 'azure'], sun: 'or' },            // Edward IV's livery and his sun in splendour
  roseSun: { perPale: ['murrey', 'azure'], sun: 'or', rose: 'argent' },   // the white rose en soleil
  whiteRose: { perPale: ['murrey', 'azure'], rose: 'argent' },
  boarBadge: { perPale: ['murrey', 'azure'], boar: 'argent' },   // Richard III's white boar
  lancasterRose: { field: 'argent', rose: 'gules' },
  warwick: { field: 'gules', bear: 'argent' },                    // the bear and ragged staff
  neville: { field: 'gules', saltire: 'argent' },                 // Montagu and Fauconberg
  oxfordStar: { field: 'gules', star: 'argent', starCorner: true },
  oxford: { quarterly: ['oxfordStar', 'plainOr', 'plainOr', 'plainGules'] },
  somerset: { quarterly: ['franceModern', 'england', 'england', 'franceModern'], borderCompony: ['argent', 'azure'] },
  portcullis: { perPale: ['azure', 'argent'], portcullis: 'or' },
  tudorDragon: { perPale: ['argent', 'vert'], dragon: 'gules' },  // Henry Tudor's red dragon on white and green
  owenTudor: { field: 'gules', chevron: 'argent', helmets: 'argent' },
  jasper: { quarterly: ['franceModern', 'england', 'england', 'franceModern'], border: '#2f5fc4' },
  stanley: { field: 'argent', bend: 'azure', stagHeads: 'or' },
  percy: { field: 'or', lion: 'azure' },                          // Northumberland
  howard: { field: 'gules', bend: 'argent', crosslets: 'bend', crossletCol: 'argent' },   // Norfolk
  princeWales: { quarterly: ['franceModern', 'england', 'england', 'franceModern'], label: 'argent' },
  tudorRose: { perPale: ['argent', 'vert'], rose: 'gules', roseInner: 'argent' },   // the Tudor rose on the Tudor white and green
});
Object.assign(HER.NATIONS, {
  york: { name: 'York', arms: 'sunne', color: '#7a2442', sea: false },
  lancaster: { name: 'Lancaster', arms: 'royal', color: '#c8372d', sea: false },
  tudor: { name: 'Tudor', arms: 'tudorDragon', color: '#2f8a4c', sea: false },
  burgundy: { name: 'Burgundy', arms: 'burgundyCross', color: '#c8372d', sea: false },
});

/* ===== src/art/12c-heraldry3.js ===== */
/* Roll to War: emblems of the Indian campaigns. Few of these were ever "arms": the Chola tiger and the Chalukya
   boar were real royal emblems, the Chauhan bull comes from their coins, the Gahadavala Garuda from their seals,
   Ghurid black was the colour of Ghazni, and the sun of Mewar is traditional. The rest are plain illustrative
   fields. New charges: tiger, humped bull, royal parasol and Garuda. */

HER.tiger = function (c, x, y, s, col, o = {}) {
  // a tiger seated on its haunches, facing +x; s = height
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k * (o.flip ? -1 : 1), k);
  c.beginPath();
  c.moveTo(-34, 44); c.bezierCurveTo(-46, 40, -46, 10, -30, 0); c.bezierCurveTo(-20, -8, -8, -18, 4, -24);   // haunch and back
  c.bezierCurveTo(10, -36, 22, -46, 34, -42); c.bezierCurveTo(46, -40, 50, -30, 48, -22); c.lineTo(40, -18);   // head
  c.bezierCurveTo(34, -10, 26, -4, 22, 6); c.lineTo(24, 42); c.lineTo(32, 42); c.lineTo(32, 48); c.lineTo(12, 48); c.lineTo(12, 12);   // front leg
  c.bezierCurveTo(6, 20, 2, 32, 6, 42); c.lineTo(10, 48); c.lineTo(-34, 48); c.closePath();
  c.moveTo(26, -44); c.lineTo(28, -54); c.lineTo(34, -46); c.closePath();                                    // ear
  c.moveTo(-40, 36); c.bezierCurveTo(-58, 30, -64, 4, -52, -12); c.bezierCurveTo(-50, -18, -44, -18, -46, -10); c.bezierCurveTo(-54, 6, -50, 24, -36, 28); c.closePath();   // tail
  c.fillStyle = col; c.fill();
  if (o.stripes) { c.strokeStyle = o.stripes; c.lineWidth = 3.4; c.lineCap = 'round'; for (const [x0, y0, x1, y1] of [[-30, 6, -22, 16], [-20, -4, -12, 8], [-8, -12, -2, 0], [8, -22, 12, -12], [-36, 24, -26, 30], [16, 16, 22, 22]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); } c.fillStyle = o.stripes; c.beginPath(); circ(c, 38, -34, 2.4); c.fill(); }
  c.restore();
};
HER.bull = function (c, x, y, s, col, o = {}) {
  // a humped bull (the Chauhan coins), standing, facing +x; s = body length
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath();
  c.moveTo(-40, -6); c.bezierCurveTo(-42, -20, -24, -24, -4, -22); c.bezierCurveTo(4, -34, 18, -34, 22, -22);   // back and hump
  c.bezierCurveTo(30, -22, 36, -18, 40, -12); c.lineTo(52, -8); c.bezierCurveTo(56, -4, 54, 4, 48, 4);          // neck and head
  c.lineTo(40, 2); c.bezierCurveTo(36, 10, 30, 14, 26, 14); c.lineTo(24, 34); c.lineTo(18, 34); c.lineTo(16, 16);
  c.lineTo(-24, 16); c.lineTo(-26, 34); c.lineTo(-32, 34); c.lineTo(-34, 12); c.bezierCurveTo(-40, 8, -42, 2, -40, -6); c.closePath();
  c.moveTo(42, -12); c.bezierCurveTo(40, -24, 46, -28, 50, -26); c.bezierCurveTo(46, -22, 46, -18, 46, -13); c.closePath();   // horn
  c.moveTo(-38, -4); c.bezierCurveTo(-50, 0, -50, 18, -46, 26); c.lineTo(-43, 25); c.bezierCurveTo(-46, 16, -45, 4, -37, 1); c.closePath();   // tail
  c.moveTo(8, 12); c.lineTo(12, 34); c.lineTo(6, 34); c.lineTo(2, 14); c.closePath(); c.moveTo(-12, 14); c.lineTo(-14, 34); c.lineTo(-20, 34); c.lineTo(-18, 14); c.closePath();
  c.fillStyle = col; c.fill();
  c.restore();
};
HER.parasol = function (c, x, y, s, col) {
  // the royal parasol (chhatra): a domed canopy with a fringe on a staff; s = height
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); c.moveTo(-46, -8); c.bezierCurveTo(-44, -44, 44, -44, 46, -8); c.lineTo(-46, -8); c.closePath();
  for (let i = 0; i < 9; i++) { const fx = -44 + i * 11; c.moveTo(fx - 4, -8); c.lineTo(fx, 4); c.lineTo(fx + 4, -8); c.closePath(); }
  c.rect(-3, -8, 6, 58); c.moveTo(0, -40); c.arc(0, -46, 6, 0, TAU);
  c.fillStyle = col; c.fill();
  c.restore();
};
HER.garuda = function (c, x, y, s, col) {
  // Garuda, the bird-man mount of Vishnu, wings raised, seen from the front; s = height
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath();
  for (const sx of [-1, 1]) { c.moveTo(sx * 10, -18); c.bezierCurveTo(sx * 30, -40, sx * 44, -48, sx * 50, -30); c.lineTo(sx * 42, -28); c.lineTo(sx * 48, -16); c.lineTo(sx * 38, -16); c.lineTo(sx * 42, -4); c.bezierCurveTo(sx * 28, -6, sx * 18, -2, sx * 12, 4); c.closePath(); }
  c.moveTo(-12, -20); c.quadraticCurveTo(0, -26, 12, -20); c.lineTo(14, 18); c.quadraticCurveTo(0, 24, -14, 18); c.closePath();   // body
  c.moveTo(10, -30); c.arc(0, -30, 10, 0, TAU); c.moveTo(6, -30); c.lineTo(0, -16); c.lineTo(-6, -30); c.closePath();            // head and beak
  c.moveTo(-6, -40); c.lineTo(0, -52); c.lineTo(6, -40); c.closePath();                                                          // crown
  for (const sx of [-1, 1]) { c.moveTo(sx * 4, 18); c.lineTo(sx * 18, 40); c.lineTo(sx * 26, 40); c.lineTo(sx * 26, 46); c.lineTo(sx * 10, 46); c.lineTo(sx * 2, 22); c.closePath(); }   // kneeling legs
  c.fillStyle = col; c.fill();
  c.restore();
};

const _herPaint1 = HER.paint;
HER.paint = function (c, key, x, y, w, h, o = {}) {
  const A = typeof key === 'string' ? ARMS[key] : key;
  if (!A) return;
  _herPaint1(c, A, x, y, w, h, o);
  const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h);
  if (A.tiger) HER.tiger(c, cx - w * 0.04, cy + h * 0.02, m * 0.78, tint(A.tiger), { stripes: o.detail || m > 30 ? tint(A.field || 'gules') : null });
  if (A.bull) HER.bull(c, cx - w * 0.02, cy - h * 0.02, w * 0.66, tint(A.bull));
  if (A.parasol) HER.parasol(c, cx, cy + h * 0.02, m * 0.72, tint(A.parasol));
  if (A.garuda) HER.garuda(c, cx, cy + h * 0.02, m * 0.78, tint(A.garuda));
};

Object.assign(ARMS, {
  chauhan: { field: 'gules', bull: 'or' },                         // the humped bull of the Chauhan coins
  chaulukya: { field: 'azure', parasol: 'argent' },                // Gujarat (illustrative: no emblem is recorded)
  gahadavala: { field: 'or', garuda: 'gules' },                    // the Garuda of the Gahadavala seals
  ghurid: { field: 'sable', border: '#f2be4b' },                   // the black of Ghazni
  mughal: { field: '#2f6f4a', sun: 'or' },                         // the sun (shamsa) of later Mughal art
  lodi: { field: '#8a2a20', border: '#f2be4b' },
  mewar: { field: '#f0a02c', sun: 'gules' },                       // the sun of Mewar (traditional)
  suri: { field: '#2f6a3a', border: '#f6f2e6' },
  hemu: { field: 'argent', border: '#d63c31' },
  chola: { field: 'gules', tiger: 'or' },                          // the Chola tiger
  chalukya: { field: 'or', boar: '#8a2a20' },                      // the Chalukya boar (varaha)
});
Object.assign(HER.NATIONS, {
  india: { name: 'India', arms: 'chauhan', color: '#b8312a', sea: false },
});

/* ===== src/art/13-kit.js ===== */
/* Roll to War: shared kit for the nation units — weapons, helmets, shields (side / front / back) */

/* stroke-drawn parts (bows, strings) that still join the sticker outline */
function gStroke(g, pathFn, w, col) {
  const c = g.c; pathFn();
  if (g.out) { c.lineWidth = w + g.lw * 2; c.strokeStyle = INK; c.stroke(); }
  else { c.lineWidth = w; c.strokeStyle = col; c.stroke(); }
}

/* ---------- polearms ---------- */
function gBill(g, x0, y0, a, len) {
  const c = g.c, ca = Math.cos(a), sa = Math.sin(a);
  const x1 = x0 + ca * len, y1 = y0 + sa * len;
  c.beginPath(); cap(c, x0, y0, x1, y1, 3.8); g.fill(PAL.wood);
  c.save(); c.translate(x1, y1); c.rotate(a);
  // cleaver blade on the lower side, forward hook, top spike, back spike
  c.beginPath();
  c.moveTo(-17, 0); c.lineTo(-1, -1.5); c.lineTo(16, 0); c.lineTo(-1, 1.5);
  c.quadraticCurveTo(6, 4, 4, 11); c.quadraticCurveTo(1, 7.5, -4, 9.5);
  c.quadraticCurveTo(-10, 11, -17, 6); c.closePath();
  g.fill(PAL.steelL);
  c.beginPath(); c.moveTo(-11, -1); c.lineTo(-8, -9); c.lineTo(-5, -1); c.closePath(); g.fill(PAL.steel);
  if (!g.out && g.detail >= 1) g.line([-14, 4, -2, 4], PAL.steelD, 0.9);
  c.beginPath(); rr(c, -22, -2.6, 7, 5.2, 1.4); g.fill(PAL.steelD);
  c.restore();
}
function gSpear(g, x0, y0, a, len, o = {}) {
  const c = g.c, ca = Math.cos(a), sa = Math.sin(a);
  const x1 = x0 + ca * len, y1 = y0 + sa * len;
  c.beginPath(); cap(c, x0, y0, x1, y1, 3.4); g.fill(o.shaft || PAL.woodL);
  c.save(); c.translate(x1, y1); c.rotate(a);
  c.beginPath(); c.moveTo(-3, -2.6); c.quadraticCurveTo(6, -6.5, 20, 0); c.quadraticCurveTo(6, 6.5, -3, 2.6); c.closePath(); g.fill(PAL.steelL);
  if (!g.out && g.detail >= 1) g.line([0, 0, 16, 0], PAL.steelD, 0.9);
  if (o.tassel) { c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-10, 8, -6, 14); c.quadraticCurveTo(-3, 8, -1, 2); c.closePath(); g.fill(o.tassel); }
  c.beginPath(); rr(c, -7, -2.3, 6, 4.6, 1.3); g.fill(PAL.steelD);
  c.restore();
}

/* ---------- curved sword ---------- */
function gScimitar(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  const L2 = len;
  c.beginPath();
  c.moveTo(4, -2.4);
  c.quadraticCurveTo(L2 * 0.6, -3.4, L2 * 0.96, -9.5);   // back edge curving up
  c.quadraticCurveTo(L2 + 3, -12.5, L2 + 6, -13);
  c.quadraticCurveTo(L2 * 0.92, -3.5, L2 * 0.72, 1.5);   // widened tip (yelman)
  c.quadraticCurveTo(L2 * 0.45, 3.6, 4, 2.6);
  c.closePath();
  g.fill(PAL.steelL);
  if (!g.out) g.line([7, 0.2, L2 * 0.55, -0.9, L2 * 0.9, -6], PAL.steelD, 0.9);
  c.beginPath(); c.moveTo(1.5, -7); c.quadraticCurveTo(5.5, -3, 3.5, 0); c.quadraticCurveTo(5.5, 3, 1.5, 7); c.lineTo(0, 7); c.lineTo(0, -7); c.closePath(); g.fill(PAL.gold);
  c.beginPath(); rr(c, -9, -2.2, 10, 4.4, 1.8); g.fill(PAL.leatherD);
  c.beginPath(); c.moveTo(-9, -2.6); c.quadraticCurveTo(-14, -4, -13, 0); c.quadraticCurveTo(-14, 4, -9, 2.6); c.closePath(); g.fill(PAL.gold);
  c.restore();
}

/* ---------- bows ----------
   (x, y) = grip; a = shooting direction; draw 0..1; returns the nock point for the string hand */
function bowGeom(x, y, a, draw, half, brace, pull) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const bend = brace + (pull * 0.35) * draw;
  const W2 = (lx, ly) => [x + lx * ca - ly * sa, y + lx * sa + ly * ca];
  return { ca, sa, bend, W2, nockX: -(brace + pull * draw), half };
}
function gLongbow(g, x, y, a, draw, o = {}) {
  // o.part: 'stave' | 'string' | undefined (both); o.arrow: nocked arrow
  const c = g.c, half = o.half || 56, B = bowGeom(x, y, a, draw, half, 8, 36);
  const pts = [], N = 14;
  for (let i = 0; i <= N; i++) { const s = -1 + (2 * i) / N; pts.push([-B.bend * s * s, s * half]); }
  const nk = B.W2(B.nockX, 0);
  if (o.part !== 'stave') {
    const t1 = B.W2(pts[0][0], pts[0][1]), t2 = B.W2(pts[N][0], pts[N][1]);
    gStroke(g, () => { c.beginPath(); c.moveTo(t1[0], t1[1]); c.lineTo(nk[0], nk[1]); c.lineTo(t2[0], t2[1]); }, 1.1, '#efe6d2');
    if (o.arrow) gArrow(g, nk[0], nk[1], a, 56);
  }
  if (o.part !== 'string') {
    const edge = (side) => pts.map(([lx, ly], i) => { const s = -1 + (2 * i) / N, w = lerp(4.8, 2.1, Math.abs(s)) / 2; return B.W2(lx + side * w, ly); });
    const A1 = edge(1), A2 = edge(-1).reverse();
    c.beginPath(); c.moveTo(A1[0][0], A1[0][1]); for (const p of A1) c.lineTo(p[0], p[1]); for (const p of A2) c.lineTo(p[0], p[1]); c.closePath();
    g.fill(o.wood || '#b8823f');
    const gw = B.W2(0.6, -5), gw2 = B.W2(0.6, 5);
    c.beginPath(); cap(c, gw[0], gw[1], gw2[0], gw2[1], 5.6); g.fill(PAL.leatherD);
  }
  return nk;
}
function gArrow(g, x, y, a, len, o = {}) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); cap(c, 0, 0, len - 5, 0, 1.8); g.fill(o.shaft || '#e8d5a8');
  c.beginPath(); c.moveTo(len - 6, -2.6); c.lineTo(len + 2, 0); c.lineTo(len - 6, 2.6); c.closePath(); g.fill(PAL.steelD);
  c.beginPath(); c.moveTo(1, 0); c.lineTo(9, -3.4); c.lineTo(12, 0); c.lineTo(9, 3.4); c.closePath(); g.fill(o.fletch || '#f4f1e8');
  c.restore();
}
function gRecurve(g, x, y, a, draw, o = {}) {
  // short composite bow with recurved ears (horse archers); o.part: 'stave' | 'string'
  const c = g.c, half = o.half || 30, B = bowGeom(x, y, a, draw, half, 6, 26);
  const pts = [], N = 12;
  for (let i = 0; i <= N; i++) {
    const s = -1 + (2 * i) / N, as = Math.abs(s);
    const ear = as > 0.72 ? (as - 0.72) * 34 : 0; // tips flick forward
    pts.push([-B.bend * Math.min(1, s * s * 1.25) + ear, s * half * (1 + (as > 0.72 ? 0.06 : 0))]);
  }
  const nk = B.W2(B.nockX, 0);
  if (o.part !== 'stave' && o.string !== false) {
    const t1 = B.W2(pts[1][0], pts[1][1]), t2 = B.W2(pts[N - 1][0], pts[N - 1][1]);
    gStroke(g, () => { c.beginPath(); c.moveTo(t1[0], t1[1]); c.lineTo(nk[0], nk[1]); c.lineTo(t2[0], t2[1]); }, 1.1, '#efe6d2');
    if (o.arrow) gArrow(g, nk[0], nk[1], a, 44, { fletch: '#d8b56a' });
  }
  if (o.part !== 'string') {
    const edge = (side) => pts.map(([lx, ly], i) => { const s = -1 + (2 * i) / N, w = lerp(4.6, 2.2, Math.abs(s)) / 2; return B.W2(lx + side * w, ly); });
    const A1 = edge(1), A2 = edge(-1).reverse();
    c.beginPath(); c.moveTo(A1[0][0], A1[0][1]); for (const p of A1) c.lineTo(p[0], p[1]); for (const p of A2) c.lineTo(p[0], p[1]); c.closePath();
    g.fill('#6d3f22');
    if (!g.out) { const p1 = B.W2(pts[3][0] + 1, pts[3][1]), p2 = B.W2(pts[N - 3][0] + 1, pts[N - 3][1]); g.line([p1[0], p1[1], p2[0], p2[1]], PAL.gold, 1.2); }
  }
  return nk;
}
function gQuiverBag(g, x, y, rot, col) {
  // arrow bag/quiver hanging at the hip, fletchings showing
  const c = g.c; c.save(); c.translate(x, y); c.rotate(rot);
  if (!g.out) { for (const [dx, h] of [[-2.5, 12], [0.5, 14], [3, 11]]) { c.beginPath(); c.moveTo(dx, -6); c.lineTo(dx, -6 - h); c.strokeStyle = '#e8d5a8'; c.lineWidth = 1.3; c.stroke(); c.beginPath(); c.moveTo(dx - 2, -6 - h); c.lineTo(dx, -9 - h); c.lineTo(dx + 2, -6 - h); c.lineTo(dx, -2 - h); c.closePath(); c.fillStyle = '#f4f1e8'; c.fill(); } }
  else { c.beginPath(); rr(c, -5, -22, 10, 16, 3); g.fill(INK); }
  c.beginPath(); c.moveTo(-5, -7); c.lineTo(5, -7); c.lineTo(4.5, 10); c.quadraticCurveTo(0, 13, -4.5, 10); c.closePath(); g.fill(col || PAL.leather);
  if (!g.out) g.line([-5, -4, 5, -4], shade(col || PAL.leather, -0.3), 1.4);
  c.restore();
}

/* ---------- shields ---------- */
function gRound(g, cx, cy, rx, ry, col, o = {}) {
  const c = g.c;
  c.beginPath(); ell(c, cx, cy, rx, ry); g.fill(col, true);
  if (g.out) return;
  c.beginPath(); ell(c, cx, cy, rx, ry);
  g.inside((c) => {
    c.lineWidth = Math.max(2, rx * 0.2); c.strokeStyle = o.rim || PAL.gold; c.beginPath(); ell(c, cx, cy, rx * 0.93, ry * 0.93); c.stroke();
    c.fillStyle = shade(col, -0.22);
    for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8 + 0.2; c.beginPath(); c.moveTo(cx + Math.cos(a - 0.14) * rx * 0.3, cy + Math.sin(a - 0.14) * ry * 0.3); c.lineTo(cx + Math.cos(a) * rx * 0.72, cy + Math.sin(a) * ry * 0.72); c.lineTo(cx + Math.cos(a + 0.14) * rx * 0.3, cy + Math.sin(a + 0.14) * ry * 0.3); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(cx - rx, cy - ry, rx * 0.6, ry * 2);
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(cx + rx * 0.35, cy - ry, rx, ry * 2);
  });
  c.beginPath(); ell(c, cx, cy, rx * 0.26, ry * 0.26); c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.steelL; c.fill();
}
function kitePath(c, cx, cy, w, h) {
  c.beginPath(); c.moveTo(cx, cy - h / 2);
  c.bezierCurveTo(cx + w * 0.62, cy - h / 2, cx + w / 2, cy - h * 0.1, cx + w * 0.42, cy + h * 0.06);
  c.quadraticCurveTo(cx + w * 0.2, cy + h * 0.32, cx, cy + h / 2);
  c.quadraticCurveTo(cx - w * 0.2, cy + h * 0.32, cx - w * 0.42, cy + h * 0.06);
  c.bezierCurveTo(cx - w / 2, cy - h * 0.1, cx - w * 0.62, cy - h / 2, cx, cy - h / 2); c.closePath();
}
function gKite(g, cx, cy, w, h, tm, emblem = 'cross') {
  const c = g.c;
  kitePath(c, cx, cy, w, h); g.fill(tm.main, true);
  if (g.out) return;
  kitePath(c, cx, cy, w, h);
  g.inside((c) => {
    if (emblem === 'cross') { c.fillStyle = '#f6f2e6'; c.fillRect(cx - w * 0.09, cy - h / 2, w * 0.18, h); c.fillRect(cx - w / 2, cy - h * 0.2, w, w * 0.18); }
    c.lineWidth = Math.max(2.2, w * 0.12); c.strokeStyle = PAL.gold; kitePath(c, cx, cy, w, h); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(cx + w * 0.1, cy - h, w, h * 2);
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(cx - w / 2, cy - h / 2, w * 0.2, h);
  });
}
function gPavise(g, cx, cy, w, h, o = {}) {
  // tall crossbowman's shield, painted with the red cross of Genoa
  const c = g.c;
  const path = () => { c.beginPath(); c.moveTo(cx - w / 2, cy - h / 2 + 3); c.quadraticCurveTo(cx, cy - h / 2 - 3, cx + w / 2, cy - h / 2 + 3); c.lineTo(cx + w / 2 * 0.92, cy + h / 2); c.lineTo(cx - w / 2 * 0.92, cy + h / 2); c.closePath(); };
  path(); g.fill(o.col || '#f1ead8', true);
  if (g.out) return;
  path();
  g.inside((c) => {
    if (o.cross !== false) { c.fillStyle = o.crossCol || '#c8372d'; c.fillRect(cx - w * 0.1, cy - h / 2, w * 0.2, h); c.fillRect(cx - w / 2, cy - h * 0.18, w, w * 0.2); }
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(cx - w * 0.05, cy - h / 2, w * 0.1, h);
    c.lineWidth = Math.max(2, w * 0.1); c.strokeStyle = o.rim || PAL.woodD; path(); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(cx + w * 0.2, cy - h / 2, w, h);
  });
}

/* ---------- helmets & headwear ---------- */
function kettleSide(g, hx, hy) {
  const c = g.c;
  const dome = () => { c.beginPath(); c.moveTo(hx - 13.5, hy - 4); c.bezierCurveTo(hx - 13.5, hy - 23, hx + 14.5, hy - 23, hx + 14.5, hy - 4); c.closePath(); };
  dome(); g.fill(PAL.steel);
  if (!g.out) { dome(); g.inside((c) => { c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 4, hy - 15, 5, 3, -0.3); c.fill(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(hx - 16, hy - 24, 9, 22); }); }
  c.beginPath(); ell(c, hx + 0.5, hy - 4.5, 21, 4.4, 0); g.fill(PAL.steelD);
  if (!g.out) g.line([hx - 18, hy - 5.5, hx + 18, hy - 5.5], PAL.steelL, 1.1);
}
function mailDots(c, x0, y0, x1, y1, step, col) {
  c.fillStyle = col || 'rgba(40,45,55,0.35)';
  for (let y = y0; y < y1; y += step) for (let x = x0 + ((y / step) % 2 ? step / 2 : 0); x < x1; x += step) c.fillRect(x, y, step * 0.42, step * 0.42);
}
function bascinetSide(g, hx, hy) {
  const c = g.c;
  const av = () => { c.beginPath(); c.moveTo(hx - 13.5, hy - 5); c.lineTo(hx + 2, hy - 5); c.quadraticCurveTo(hx + 1, hy + 6, hx + 12, hy + 9); c.quadraticCurveTo(hx + 13, hy + 16, hx + 6, hy + 19); c.lineTo(hx - 12, hy + 20); c.quadraticCurveTo(hx - 18, hy + 8, hx - 13.5, hy - 5); c.closePath(); };
  av(); g.fill(PAL.mail);
  if (!g.out && g.detail >= 1) { av(); g.inside((c) => mailDots(c, hx - 18, hy - 5, hx + 14, hy + 21, 3.2)); }
  const dome = () => { c.beginPath(); c.moveTo(hx - 14, hy - 2); c.bezierCurveTo(hx - 15.5, hy - 18, hx - 9, hy - 27, hx - 5, hy - 33); c.bezierCurveTo(hx + 4, hy - 25, hx + 14.5, hy - 17, hx + 13.5, hy - 4); c.closePath(); };
  dome(); g.fill(PAL.steel);
  if (!g.out) {
    dome(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx - 18, hy - 36, 9, 36); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 3, hy - 15, 3.5, 6, -0.5); c.fill(); });
    g.line([hx - 14, hy - 3, hx + 13.5, hy - 4], PAL.steelDD, 1.4);
  }
}
function bascinetFB(g, hy, back) {
  const c = g.c;
  const av = () => {
    c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16.5, hy + 13); c.quadraticCurveTo(10, hy + 21, 0, hy + 21); c.quadraticCurveTo(-10, hy + 21, -16.5, hy + 13); c.closePath();
    if (!back) { c.moveTo(-10, hy - 5); c.lineTo(-11, hy + 7); c.quadraticCurveTo(0, hy + 15, 11, hy + 7); c.lineTo(10, hy - 5); c.closePath(); }
  };
  av(); if (g.out) g.fill(INK); else { c.fillStyle = PAL.mail; c.fill('evenodd'); if (g.detail >= 1) { c.save(); av(); c.clip('evenodd'); mailDots(c, -18, hy - 5, 18, hy + 22, 3.2); c.restore(); } }
  const dome = () => { c.beginPath(); c.moveTo(-15, hy - 2); c.bezierCurveTo(-16, hy - 20, -6, hy - 30, 0, hy - 34); c.bezierCurveTo(6, hy - 30, 16, hy - 20, 15, hy - 2); c.closePath(); };
  dome(); g.fill(PAL.steel);
  if (!g.out) {
    dome(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, hy - 36, 12, 36); c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, -5, hy - 16, 3, 6, 0.4); c.fill(); });
    g.line([-15, hy - 3, 15, hy - 3], PAL.steelDD, 1.4);
    if (!back) g.line([0, hy - 30, 0, hy - 5], PAL.steelD, 1);
  }
}
/* conical spiked helmet wrapped in a turban, with a mail neck guard */
function turbanSide(g, hx, hy, cloth) {
  const c = g.c, cl = cloth || '#f3ecd9';
  const av = () => { c.beginPath(); c.moveTo(hx - 13, hy - 4); c.lineTo(hx + 1, hy - 4); c.quadraticCurveTo(hx - 2, hy + 8, hx - 1, hy + 16); c.lineTo(hx - 13, hy + 18); c.quadraticCurveTo(hx - 18, hy + 6, hx - 13, hy - 4); c.closePath(); };
  av(); g.fill(PAL.mail);
  if (!g.out && g.detail >= 1) { av(); g.inside((c) => mailDots(c, hx - 18, hy - 4, hx + 2, hy + 19, 3.2)); }
  // cone + spike
  c.beginPath(); c.moveTo(hx - 12.5, hy - 9); c.quadraticCurveTo(hx - 9, hy - 27, hx + 1, hy - 31); c.lineTo(hx + 2, hy - 38); c.lineTo(hx + 3.5, hy - 31); c.quadraticCurveTo(hx + 12, hy - 26, hx + 13.5, hy - 9); c.closePath(); g.fill(PAL.steel);
  if (!g.out) { c.beginPath(); c.moveTo(hx - 12.5, hy - 9); c.quadraticCurveTo(hx - 9, hy - 27, hx + 1, hy - 31); c.lineTo(hx + 3.5, hy - 31); c.quadraticCurveTo(hx + 12, hy - 26, hx + 13.5, hy - 9); c.closePath(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx - 16, hy - 40, 9, 34); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 5, hy - 21, 2.5, 5, 0.4); c.fill(); }); }
  // turban wrap
  const tb = () => { c.beginPath(); c.moveTo(hx - 15, hy - 3); c.quadraticCurveTo(hx - 17, hy - 12, hx - 12, hy - 15); c.quadraticCurveTo(hx, hy - 20, hx + 14, hy - 14); c.quadraticCurveTo(hx + 17, hy - 9, hx + 15, hy - 4); c.quadraticCurveTo(hx, hy - 7, hx - 15, hy - 3); c.closePath(); };
  tb(); g.fill(cl);
  if (!g.out) { tb(); g.inside((c) => { c.strokeStyle = shade(cl, -0.22); c.lineWidth = 1.3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx - 16, hy - 6 - i * 3.6); c.quadraticCurveTo(hx, hy - 12 - i * 3.2, hx + 16, hy - 8 - i * 3.6); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx - 18, hy - 20, 7, 18); }); }
}
function turbanFB(g, hy, cloth, back) {
  const c = g.c, cl = cloth || '#f3ecd9';
  if (back) {
    c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16, hy + 14); c.quadraticCurveTo(0, hy + 20, -16, hy + 14); c.closePath(); g.fill(PAL.mail);
    if (!g.out && g.detail >= 1) { c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16, hy + 14); c.quadraticCurveTo(0, hy + 20, -16, hy + 14); c.closePath(); g.inside((c) => mailDots(c, -17, hy - 5, 17, hy + 21, 3.2)); }
  } else {
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 11, hy - 5); c.lineTo(sx * 16, hy - 5); c.lineTo(sx * 17, hy + 12); c.lineTo(sx * 11, hy + 16); c.closePath(); g.fill(PAL.mail); }
  }
  c.beginPath(); c.moveTo(-13, hy - 9); c.quadraticCurveTo(-10, hy - 28, -1.5, hy - 32); c.lineTo(0, hy - 40); c.lineTo(1.5, hy - 32); c.quadraticCurveTo(10, hy - 28, 13, hy - 9); c.closePath(); g.fill(PAL.steel);
  if (!g.out) { c.beginPath(); c.moveTo(-13, hy - 9); c.quadraticCurveTo(-10, hy - 28, -1.5, hy - 32); c.lineTo(1.5, hy - 32); c.quadraticCurveTo(10, hy - 28, 13, hy - 9); c.closePath(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(4, hy - 40, 12, 34); c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, -4, hy - 20, 2.4, 5, 0.3); c.fill(); }); }
  const tb = () => { c.beginPath(); c.moveTo(-17, hy - 4); c.quadraticCurveTo(-19, hy - 13, -12, hy - 16); c.quadraticCurveTo(0, hy - 20, 12, hy - 16); c.quadraticCurveTo(19, hy - 13, 17, hy - 4); c.quadraticCurveTo(0, hy - 8, -17, hy - 4); c.closePath(); };
  tb(); g.fill(cl);
  if (!g.out) {
    tb(); g.inside((c) => { c.strokeStyle = shade(cl, -0.22); c.lineWidth = 1.3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-18, hy - 7 - i * 3.4 + (i === 1 ? 2 : 0)); c.quadraticCurveTo(0, hy - 12 - i * 3.2, 18, hy - 7 - i * 3.4 - (i === 1 ? 2 : 0)); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(8, hy - 20, 12, 18); });
    if (!back) { c.beginPath(); ell(c, 0, hy - 11, 2.8, 3.4); c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke(); }
  }
}
/* archer's hood (chaperon) with its long tail (liripipe) */
const HOOD = '#6f7b3a';
function hoodSide(g, hx, hy, col) {
  const c = g.c, cl = col || HOOD;
  const tail = () => { c.beginPath(); c.moveTo(hx - 8, hy - 13); c.quadraticCurveTo(hx - 26, hy - 10, hx - 24, hy + 10); c.quadraticCurveTo(hx - 23, hy + 16, hx - 20, hy + 20); c.lineTo(hx - 17, hy + 19); c.quadraticCurveTo(hx - 18, hy + 6, hx - 10, hy - 6); c.closePath(); };
  tail(); g.fill(shade(cl, -0.18));
  const hood = () => {
    c.beginPath(); c.moveTo(hx + 12, hy - 7);
    c.bezierCurveTo(hx + 10, hy - 22, hx - 12, hy - 24, hx - 15, hy - 8);
    c.quadraticCurveTo(hx - 17, hy + 6, hx - 13, hy + 13); c.lineTo(hx - 15, hy + 20); c.quadraticCurveTo(hx, hy + 24, hx + 12, hy + 19);
    c.lineTo(hx + 11, hy + 12); c.quadraticCurveTo(hx + 4, hy + 11, hx + 2, hy + 4); c.quadraticCurveTo(hx + 1, hy - 6, hx + 12, hy - 7); c.closePath();
  };
  hood(); g.fill(cl);
  if (!g.out) { hood(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx - 20, hy - 26, 10, 50); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(hx + 4, hy - 26, 4, 30); }); g.line([hx + 12, hy - 7, hx + 2, hy + 4, hx + 11, hy + 12], shade(cl, -0.35), 1.2); }
}
function hoodFB(g, hy, col, back) {
  const c = g.c, cl = col || HOOD;
  const hood = () => {
    c.beginPath(); c.moveTo(-16, hy + 2); c.bezierCurveTo(-18, hy - 24, 18, hy - 24, 16, hy + 2);
    c.quadraticCurveTo(17, hy + 12, 20, hy + 20); c.quadraticCurveTo(0, hy + 26, -20, hy + 20); c.quadraticCurveTo(-17, hy + 12, -16, hy + 2); c.closePath();
    if (!back) { c.moveTo(-10, hy - 4); c.bezierCurveTo(-11, hy - 14, 11, hy - 14, 10, hy - 4); c.quadraticCurveTo(11, hy + 8, 0, hy + 13); c.quadraticCurveTo(-11, hy + 8, -10, hy - 4); c.closePath(); }
  };
  hood(); if (g.out) g.fill(INK); else { c.fillStyle = cl; c.fill('evenodd'); c.save(); hood(); c.clip('evenodd'); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(8, hy - 26, 14, 52); c.restore(); }
  if (back) { const k = () => { c.beginPath(); c.moveTo(-3, hy - 16); c.quadraticCurveTo(-5, hy + 6, 1, hy + 24); c.lineTo(5, hy + 23); c.quadraticCurveTo(1, hy + 4, 3, hy - 16); c.closePath(); }; k(); g.fill(shade(cl, -0.18)); }
}

/* ---------- Ayyubid robe torso: long hem, sash ---------- */
function robeSide(g, shoY, hipY, hemY, col, sash) {
  sTorso(g, shoY, hipY, hemY, col, { w: 1, belt: false, trim: shade(col, -0.3) });
  if (g.out) return;
  const c = g.c;
  c.fillStyle = sash || '#f3ecd9'; c.beginPath(); rr(c, -14.5, hipY - 7, 29, 6.5, 2); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.stroke();
  g.line([2, shoY - 1, 7, shoY + 8, 3, hipY - 8], shade(col, -0.3), 1.3);
}
function robeFB(g, shoY, hipY, hemY, col, sash, back) {
  fTorso(g, shoY, hipY, hemY, col, { w: 1, belt: false, trim: shade(col, -0.3), back });
  if (g.out) return;
  const c = g.c;
  c.fillStyle = sash || '#f3ecd9'; c.beginPath(); rr(c, -17, hipY - 7, 34, 6.5, 2); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.stroke();
  if (!back) g.line([-8, shoY - 2, 0, shoY + 10, 8, shoY - 2], shade(col, -0.3), 1.3);
}

Object.assign(RTW, { kit: { gStroke, gBill, gSpear, gScimitar, gLongbow, gRecurve, gArrow, gQuiverBag, gRound, gKite, gPavise, kettleSide, bascinetSide, bascinetFB, turbanSide, turbanFB, hoodSide, hoodFB } });

/* ===== src/art/14-foot.js ===== */
/* Roll to War: nation foot units — Billman, Longbowman (England), Genoese crossbowman (France),
   Sergeant (Crusaders), Spearman and Swordsman (Ayyubids). Same unit space as 10-troops.js. */

/* ================= BILLMAN (England, spear crew) ================= */
const BILL_LEN = 104;
TROOPS.billman = {
  name: 'Billman', shadowW: 17, h: 100,
  pose(anim, t) {
    const p = motion(anim, t, 0.62);
    if (anim === 'attack') {
      const D = 0.95, u = (t % D) / D;
      let a, hx, hy, lean;
      if (u < 0.32) { const k = smooth(u / 0.32); a = lerp(-1.0, -2.25, k); hx = lerp(8, -2, k); hy = lerp(-56, -76, k); lean = lerp(0.03, -0.07, k); }
      else if (u < 0.46) { const k = easeOut(seg(u, 0.32, 0.46)); a = lerp(-2.25, -0.22, k); hx = lerp(-2, 15, k); hy = lerp(-76, -56, k); lean = lerp(-0.07, 0.13, k); }
      else { const k = smooth(seg(u, 0.46, 1)); a = lerp(-0.22, -1.0, k); hx = lerp(15, 8, k); hy = lerp(-56, -56, k); lean = lerp(0.13, 0.03, k); }
      const ca = Math.cos(a), sa = Math.sin(a);
      Object.assign(p, { pA: a, pBx: hx - ca * 52, pBy: hy - sa * 52, gF: 30, gN: 52, lean, legF: [0.3, 0.2], legB: [-0.28, -0.22], bob: 1.6, u, chop: u >= 0.32 && u < 0.62 });
    } else if (anim === 'walk') {
      Object.assign(p, { pA: -1.32 + Math.sin(p.ph) * 0.03, pBx: -1, pBy: -18 + p.bob, gF: 22, gN: 44 });
    } else {
      Object.assign(p, { pA: -1.52 + Math.sin(t * 2.4) * 0.012, pBx: 13, pBy: -0.5, gF: 34, gN: 55 });
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    sLeg(g, -2, hipY, p.legB, shade(PAL.hose, -0.3), shade(PAL.boot, -0.3));
    sLeg(g, 2, hipY, p.legF, PAL.hose, PAL.boot);
    const ca = Math.cos(p.pA), sa = Math.sin(p.pA);
    const gf = [p.pBx + ca * p.gF, p.pBy + sa * p.gF], gn = [p.pBx + ca * p.gN, p.pBy + sa * p.gN];
    const R = (x, y) => rotPt(x, y, 0, hipY, p.lean || 0);
    const sf = R(-3, shoY + 3), sn = R(3, shoY + 2), hd = R(3, L.HEAD + p.bob);
    const sleeve = shade(tm.main, -0.12);
    sArm(g, sf[0], sf[1], gf[0], gf[1], shade(sleeve, -0.3), shade(PAL.skin, -0.2), 1);
    c.save(); c.translate(0, hipY); c.rotate(p.lean || 0); c.translate(0, -hipY);
    sTorso(g, shoY, hipY, -21 + p.bob, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
    c.restore();
    sHead(g, hd[0], hd[1]); sEye(g, hd[0] + 8.3, hd[1] + 1.5);
    bascinetSide(g, hd[0], hd[1]);
    gBill(g, p.pBx, p.pBy, p.pA, BILL_LEN);
    sArm(g, sn[0], sn[1], gn[0], gn[1], sleeve, PAL.skin, 1, true);
  },
  front(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sleeve = shade(tm.main, -0.12);
    const atk = p.anim === 'attack';
    let b, a;
    if (atk) {
      const u = p.u;
      if (u < 0.32) { const k = smooth(u / 0.32); a = lerp(-1.75, -2.3, k); b = [lerp(-14, 6, k), lerp(-24, -52, k)]; }
      else if (u < 0.46) { const k = easeOut(seg(u, 0.32, 0.46)); a = lerp(-2.3, -1.1, k); b = [lerp(6, -22, k), lerp(-52, -30, k)]; }
      else { const k = smooth(seg(u, 0.46, 1)); a = lerp(-1.1, -1.75, k); b = [lerp(-22, -14, k), lerp(-30, -24, k)]; }
    } else if (p.walking) { a = -1.66; b = [-17, -16 + p.fb]; }
    else { a = -1.6; b = [-17, -1]; }
    const len = BILL_LEN, ca = Math.cos(a), sa = Math.sin(a);
    fLegs(g, p, PAL.hose, PAL.boot);
    if (!atk) fArm(g, 15, shoY + 4, 18, -38 + p.fb + swingArm(p, 1), shade(sleeve, -0.1), PAL.skin, -1);
    fTorso(g, shoY, hipY, -21 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
    fHead(g, hy); fFace(g, hy);
    bascinetFB(g, hy);
    gBill(g, b[0], b[1], a, len);
    const h1 = [b[0] + ca * 30, b[1] + sa * 30], h2 = [b[0] + ca * 52, b[1] + sa * 52];
    fArm(g, -15, shoY + 4, h2[0], h2[1], sleeve, PAL.skin, 1, true);
    if (atk) fArm(g, 15, shoY + 4, h1[0], h1[1], sleeve, PAL.skin, -1, true);
  },
  back(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sleeve = shade(tm.main, -0.12);
    const atk = p.anim === 'attack';
    let b, a, len = BILL_LEN;
    if (atk) {
      const u = p.u;
      if (u < 0.32) { const k = smooth(u / 0.32); a = lerp(-1.4, -1.0, k); b = [lerp(14, 2, k), lerp(-26, -40, k)]; }
      else if (u < 0.46) { const k = easeOut(seg(u, 0.32, 0.46)); a = lerp(-1.0, -1.62, k); b = [lerp(2, 6, k), lerp(-40, -56, k)]; len = lerp(BILL_LEN, BILL_LEN * 0.62, k); }
      else { const k = smooth(seg(u, 0.46, 1)); a = lerp(-1.62, -1.4, k); b = [lerp(6, 14, k), lerp(-56, -26, k)]; len = lerp(BILL_LEN * 0.62, BILL_LEN, k); }
    } else if (p.walking) { a = -1.48; b = [17, -16 + p.fb]; }
    else { a = -1.54; b = [17, -1]; }
    const ca = Math.cos(a), sa = Math.sin(a);
    if (atk) gBill(g, b[0], b[1], a, len);
    fLegs(g, p, PAL.hose, PAL.boot);
    fTorso(g, shoY, hipY, -21 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35), back: true });
    if (!atk) gBill(g, b[0], b[1], a, len);
    const h1 = [b[0] + ca * 30 * (len / BILL_LEN), b[1] + sa * 30 * (len / BILL_LEN)], h2 = [b[0] + ca * 52 * (len / BILL_LEN), b[1] + sa * 52 * (len / BILL_LEN)];
    fArm(g, 15, shoY + 4, h2[0], h2[1], sleeve, PAL.skin, -1, true);
    fArm(g, -15, shoY + 4, atk ? h1[0] : -18, atk ? h1[1] : -38 + p.fb - swingArm(p, 1), sleeve, PAL.skin, 1, true);
    fHair(g, hy);
    bascinetFB(g, hy, true);
  },
};

/* ================= LONGBOWMAN (England, special ranged crew) ================= */
const LB = { D: 1.2, release: 0.56 };
TROOPS.longbow = {
  name: 'Longbowman', shadowW: 16, h: 100, special: true,
  pose(anim, t) {
    const p = motion(anim, t, 0.6);
    if (anim === 'attack') {
      const u = (t % LB.D) / LB.D;
      let a, gx, gy, draw = 0, arrow = true, hand = null, stage, hk = 0;
      if (u < 0.14) { hk = smooth(u / 0.14); a = 0.35; gx = 18; gy = -46; arrow = u > 0.06; stage = 'nock'; }
      else if (u < 0.45) { const k = smooth(seg(u, 0.14, 0.45)); a = lerp(0.35, -0.45, k); gx = lerp(18, 25, k); gy = lerp(-46, -71, k); draw = easeIn(k); stage = 'draw'; }
      else if (u < LB.release) { a = -0.45 + Math.sin(u * 90) * 0.004; gx = 25; gy = -71; draw = 1; stage = 'draw'; }
      else if (u < 0.72) { const k = easeOut(clamp(seg(u, LB.release, 0.72) * 2.5)); a = -0.45; gx = 25; gy = -71; arrow = false; hand = [lerp(-4, -13, k), lerp(-73, -79, k)]; stage = 'loose'; }
      else { const k = smooth(seg(u, 0.72, 1)); a = lerp(-0.45, 0.35, k); gx = lerp(25, 18, k); gy = lerp(-71, -46, k); arrow = false; hand = [lerp(-13, -7, k), lerp(-79, -38, k)]; stage = 'lower'; }
      Object.assign(p, { bA: a, bX: gx, bY: gy + p.bob, draw, arrow, hand, hk, stage, u, legF: [0.26, 0.16], legB: [-0.26, -0.2], bob: 1.2 });
    } else if (anim === 'walk') {
      Object.assign(p, { bA: 0.1 + Math.sin(p.ph) * 0.03, bX: 13, bY: -50 + p.bob, draw: 0, arrow: false, hand: [5 + p.swing * 4, -39 + p.bob], stage: 'carry' });
    } else {
      Object.assign(p, { bA: 0.03, bX: 16, bY: -55 + p.bob, draw: 0, arrow: false, hand: [6, -39 + p.bob], stage: 'carry' });
    }
    return p;
  },
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    const sleeve = shade(tm.main, -0.12);
    sLeg(g, -2, hipY, p.legB, shade(PAL.hose, -0.3), shade(PAL.boot, -0.3));
    sLeg(g, 2, hipY, p.legF, PAL.hose, PAL.boot);
    const carry = p.stage === 'carry';
    sArm(g, -3, shoY + 3, p.bX, p.bY, shade(sleeve, -0.3), shade(PAL.skin, -0.2), carry ? 1 : -1);
    const nock = gLongbow(g, p.bX, p.bY, p.bA, p.draw, { part: carry ? undefined : 'stave' });
    sTorso(g, shoY, hipY, -23 + p.bob, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
    const hx = 3, hy = L.HEAD + p.bob;
    sHead(g, hx, hy); sEye(g, hx + 8.3, hy + 1.8);
    hoodSide(g, hx, hy);
    gQuiverBag(g, 9, hipY + 3, 0.3, '#e9dfc4');
    if (!carry) gLongbow(g, p.bX, p.bY, p.bA, p.draw, { part: 'string', arrow: p.arrow });
    let hand = p.hand;
    if (p.stage === 'draw') hand = nock;
    else if (p.stage === 'nock') hand = [lerp(-6, nock[0], p.hk), lerp(-38, nock[1], p.hk)];
    sArm(g, 3, shoY + 2, hand[0], hand[1], sleeve, PAL.skin, p.stage === 'draw' || p.stage === 'loose' ? -1 : 1, true);
  },
  front(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sleeve = shade(tm.main, -0.12);
    const st = p.stage, aim = st === 'draw' || st === 'loose';
    fLegs(g, p, PAL.hose, PAL.boot);
    if (st === 'carry') fArm(g, -15, shoY + 4, -17, -40 + p.fb - swingArm(p, 1), sleeve, PAL.skin, 1);
    fTorso(g, shoY, hipY, -23 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35) });
    gQuiverBag(g, -12, hipY + 3, -0.25, '#e9dfc4');
    fHead(g, hy); fFace(g, hy);
    hoodFB(g, hy);
    if (aim) {
      const gx = 7, gy = -68 + p.fb, d = st === 'draw' ? p.draw : 0;
      const nk = [lerp(4, -6, d), lerp(gy, hy + 6, d)];
      if (st === 'loose') { nk[0] = 5; nk[1] = gy; }
      // drawing arm (behind the bow), string, stave, bow arm toward the camera
      fArm(g, -15, shoY + 4, st === 'loose' ? -19 : nk[0] - 1, st === 'loose' ? hy + 2 : nk[1], sleeve, PAL.skin, 1, true);
      gStroke(g, () => { c.beginPath(); c.moveTo(gx + 3, gy - 55); c.lineTo(nk[0], nk[1]); c.lineTo(gx + 3, gy + 55); }, 1.1, '#efe6d2');
      c.beginPath(); c.moveTo(gx + 2.4, gy - 56); c.quadraticCurveTo(gx - 3, gy, gx + 2.4, gy + 56); c.lineTo(gx + 5.6, gy + 56); c.quadraticCurveTo(gx + 1.5, gy, gx + 5.6, gy - 56); c.closePath(); g.fill('#b8823f');
      if (p.arrow && st === 'draw') { c.beginPath(); circ(c, gx, gy, 2.6); g.fill(PAL.steelD); }
      fArm(g, 15, shoY + 4, gx + 1, gy, sleeve, PAL.skin, -1, true);
    } else {
      const lowered = st !== 'carry';
      const bx = lowered ? 6 : 18, by = lowered ? -46 + p.fb : -52 + p.fb;
      gLongbow(g, bx, by, lowered ? 1.2 : 0.02, 0, { arrow: st === 'nock' && p.arrow });
      fArm(g, 15, shoY + 4, bx, by, sleeve, PAL.skin, -1, true);
      if (lowered) fArm(g, -15, shoY + 4, lerp(-10, 2, p.hk || 0.5), lerp(-38, -48, p.hk || 0.5) + p.fb, sleeve, PAL.skin, 1, true);
    }
  },
  back(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sleeve = shade(tm.main, -0.12);
    const st = p.stage, aim = st === 'draw' || st === 'loose';
    const gx = -7, gy = -70 + p.fb;
    if (aim) {
      c.beginPath(); c.moveTo(gx - 2.4, gy - 58); c.quadraticCurveTo(gx + 3, gy, gx - 2.4, gy + 58); c.lineTo(gx - 5.6, gy + 58); c.quadraticCurveTo(gx - 1.5, gy, gx - 5.6, gy - 58); c.closePath(); g.fill('#b8823f');
    } else if (st === 'carry') {
      gLongbow(g, -17, -52 + p.fb, Math.PI - 0.02, 0);
    }
    fLegs(g, p, PAL.hose, PAL.boot);
    fTorso(g, shoY, hipY, -23 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35), back: true });
    gQuiverBag(g, 11, hipY + 3, 0.25, '#e9dfc4');
    fHair(g, hy);
    hoodFB(g, hy, null, true);
    if (aim) {
      const d = st === 'draw' ? p.draw : 0, nk = st === 'loose' ? [gx - 3, gy] : [lerp(gx - 3, 7, d), lerp(gy, hy + 5, d)];
      gStroke(g, () => { c.beginPath(); c.moveTo(gx - 3, gy - 57); c.lineTo(nk[0], nk[1]); c.lineTo(gx - 3, gy + 57); }, 1.1, '#efe6d2');
      fArm(g, -15, shoY + 4, gx - 2, gy + 4, sleeve, PAL.skin, 1, true);
      fArm(g, 15, shoY + 4, st === 'loose' ? 20 : nk[0] + 2, st === 'loose' ? hy + 4 : nk[1] + 2, sleeve, PAL.skin, -1, true);
    } else if (st === 'carry') {
      fArm(g, -15, shoY + 4, -17, -50 + p.fb, sleeve, PAL.skin, 1, true);
      fArm(g, 15, shoY + 4, 17, -40 + p.fb + swingArm(p, 1), sleeve, PAL.skin, -1, true);
    } else {
      gLongbow(g, -4, -48 + p.fb, Math.PI - 1.2, 0);
      fArm(g, -15, shoY + 4, -4, -48 + p.fb, sleeve, PAL.skin, 1, true);
      fArm(g, 15, shoY + 4, 8, -46 + p.fb, sleeve, PAL.skin, -1, true);
    }
  },
};

/* ================= GENOESE CROSSBOWMAN (France): crossbowman + pavise + kettle hat ================= */
TROOPS.genoese = {
  name: 'Genoese Crossbowman', shadowW: 17, h: 100, kit: { helm: 'kettle' },
  pose: (anim, t) => TROOPS.crossbow.pose(anim, t),
  side(g, p) {
    const hipY = L.HIP + p.bob;
    g.c.save(); g.c.translate(-15, hipY - 20); g.c.rotate(-0.12); gPavise(g, 0, 0, 13, 58, { cross: false, col: '#e9e1cc' }); g.c.restore();
    TROOPS.crossbow.side(g, p);
  },
  front(g, p) {
    gPavise(g, 0, -60 + p.fb, 44, 62, {});
    TROOPS.crossbow.front(g, p);
  },
  back(g, p) {
    const c = g.c, tm = g.team, st = p.anim === 'attack' ? p.stage : 'carry';
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sleeve = shade(tm.main, -0.12);
    if (st === 'carry') { c.save(); c.scale(-1, 1); gCrossbow(g, -16, -40 + p.fb, -0.72, true); c.restore(); }
    fLegs(g, p, PAL.hose, PAL.boot);
    fTorso(g, shoY, hipY, -24 + p.fb, tm.main, { quilt: true, trim: shade(tm.main, -0.35), back: true });
    if (st === 'aim') { fArm(g, -15, shoY + 4, -7, shoY - 2, sleeve, PAL.skin, -1, true); fArm(g, 15, shoY + 4, 7, shoY - 2, sleeve, PAL.skin, 1, true); }
    else { fArm(g, -15, shoY + 4, -17, -40 + p.fb, sleeve, PAL.skin, 1, true); fArm(g, 15, shoY + 4, 10, -48 + p.fb, sleeve, PAL.skin, -1, true); }
    fHair(g, hy); kettleFB(g, hy, true);
    gPavise(g, 0, -52 + p.fb, 40, 58, {});
    if (st === 'aim') { c.beginPath(); c.moveTo(-22, -84 + p.fb); c.quadraticCurveTo(0, -92 + p.fb, 22, -84 + p.fb); c.lineTo(22, -81 + p.fb); c.quadraticCurveTo(0, -89 + p.fb, -22, -81 + p.fb); c.closePath(); g.fill(PAL.steel); }
  },
};

/* ================= SPEAR + SHIELD infantry (Sergeant, Ayyubid Spearman) ================= */
function spearPose(anim, t) {
  const p = motion(anim, t, 0.62);
  if (anim === 'attack') {
    const D = 0.9, u = (t % D) / D;
    let hx;
    if (u < 0.3) hx = lerp(4, -7, smooth(u / 0.3));
    else if (u < 0.42) hx = lerp(-7, 24, easeOut(seg(u, 0.3, 0.42)));
    else hx = lerp(24, 4, smooth(seg(u, 0.42, 1)));
    Object.assign(p, { sA: -0.1, sHx: hx, sHy: -64 + (u < 0.42 && u > 0.3 ? 2 : 0), lean: (hx - 4) * 0.004, legF: [0.32, 0.22], legB: [-0.3, -0.24], bob: 1.8, u, thr: hx - 4 });
  } else if (anim === 'walk') {
    Object.assign(p, { sA: -1.4 + Math.sin(p.ph) * 0.03, sHx: -6, sHy: -46 + p.bob });
  } else {
    Object.assign(p, { sA: -1.54 + Math.sin(t * 2.4) * 0.01, sHx: -8, sHy: -46 + p.bob });
  }
  return p;
}
function spearSide(g, p, o) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
  sLeg(g, -2, hipY, p.legB, shade(o.legs, -0.3), shade(o.boots, -0.3));
  sLeg(g, 2, hipY, p.legF, o.legs, o.boots);
  const R = (x, y) => rotPt(x, y, 0, hipY, p.lean || 0);
  const sf = R(-3, shoY + 3), sn = R(4, shoY + 2), hd = R(3, L.HEAD + p.bob);
  const ca = Math.cos(p.sA), sa = Math.sin(p.sA), back = p.anim === 'attack' ? 40 : 36;
  sArm(g, sf[0], sf[1], p.sHx, p.sHy, shade(o.sleeve, -0.3), shade(PAL.skin, -0.2), p.anim === 'attack' ? -1 : 1);
  gSpear(g, p.sHx - ca * back, p.sHy - sa * back, p.sA, o.len, { tassel: o.tassel });
  c.save(); c.translate(0, hipY); c.rotate(p.lean || 0); c.translate(0, -hipY);
  if (o.robe) robeSide(g, shoY, hipY, o.hem + p.bob, tm.main, o.sash);
  else sTorso(g, shoY, hipY, o.hem + p.bob, tm.main, { w: 1, trim: PAL.gold });
  c.restore();
  sHead(g, hd[0], hd[1]); sEye(g, hd[0] + 8.3, hd[1] + 1.5);
  if (o.helm === 'turban') turbanSide(g, hd[0], hd[1], o.cloth); else kettleSide(g, hd[0], hd[1]);
  const shx = 16 + (p.thr > 0 ? p.thr * 0.12 : 0), shy = -52 + p.bob;
  sArm(g, sn[0], sn[1], shx - 3, shy + 2, o.sleeve, PAL.skin, 1, true);
  if (o.shield === 'round') gRound(g, shx, shy, 13, 14.5, tm.main);
  else gKite(g, shx, shy + 4, 22, 40, tm);
}
function spearFB(g, p, o, front) {
  const c = g.c, tm = g.team;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const atk = p.anim === 'attack', th = atk ? p.thr : 0, sx = front ? -1 : 1;
  const hemY = o.hem + p.fb;
  const torso = () => o.robe ? robeFB(g, shoY, hipY, hemY, tm.main, o.sash, !front) : fTorso(g, shoY, hipY, hemY, tm.main, { w: 1, trim: PAL.gold, back: !front });
  const helm = () => { if (o.helm === 'turban') turbanFB(g, hy, o.cloth, !front); else kettleFB(g, hy, !front); };
  if (front) {
    fLegs(g, p, o.legs, o.boots);
    torso();
    fHead(g, hy); fFace(g, hy); helm();
    let b, tip;
    if (atk) { b = [-6, -118 + th * 0.8]; tip = [-9, 22 + th * 1.4]; } else { b = [-18, -2]; tip = [-20, -130]; if (p.walking) { b[1] -= 12; tip[1] -= 12; } }
    const a = Math.atan2(tip[1] - b[1], tip[0] - b[0]), len = Math.hypot(tip[0] - b[0], tip[1] - b[1]);
    gSpear(g, b[0], b[1], a, len, { tassel: o.tassel });
    const h = atk ? [lerp(b[0], tip[0], 0.3), lerp(b[1], tip[1], 0.3)] : [lerp(b[0], tip[0], 0.36) + 1.5, lerp(b[1], tip[1], 0.36)];
    fArm(g, -15, shoY + 4, h[0], h[1], o.sleeve, PAL.skin, 1, true);
    fArm(g, 15, shoY + 4, 10, -52 + p.fb, o.sleeve, PAL.skin, -1, true);
    if (o.shield === 'round') gRound(g, 8, -50 + p.fb, 16, 16, tm.main); else gKite(g, 8, -46 + p.fb, 26, 44, tm);
  } else {
    if (o.shield === 'round') { c.beginPath(); ell(c, -15, -50 + p.fb, 15, 16); g.fill(PAL.wood, true); if (!g.out) { c.beginPath(); ell(c, -15, -50 + p.fb, 15, 16); g.inside((c) => { c.lineWidth = 3; c.strokeStyle = PAL.steelD; c.beginPath(); ell(c, -15, -50 + p.fb, 14, 15); c.stroke(); c.fillStyle = PAL.leatherD; c.fillRect(-32, -53 + p.fb, 34, 3.5); }); } }
    else shieldBack(g, -15, -48 + p.fb, 24, 40);
    let b, tip;
    if (atk) { b = [12, -40]; tip = [9, -176 - th * 1.6]; } else { b = [18, -2]; tip = [20, -130]; if (p.walking) { b[1] -= 12; tip[1] -= 12; } }
    const a = Math.atan2(tip[1] - b[1], tip[0] - b[0]), len = Math.hypot(tip[0] - b[0], tip[1] - b[1]);
    gSpear(g, b[0], b[1], a, len, { tassel: o.tassel });
    fLegs(g, p, o.legs, o.boots);
    torso();
    const h = [lerp(b[0], tip[0], atk ? 0.18 : 0.36) - 1, lerp(b[1], tip[1], atk ? 0.18 : 0.36)];
    fArm(g, 15, shoY + 4, h[0], h[1], o.sleeve, PAL.skin, -1, true);
    fArm(g, -15, shoY + 4, -15, -46 + p.fb, o.sleeve, PAL.skin, 1, true);
    fHair(g, hy); helm();
  }
}
const SERGEANT = { legs: PAL.mailD, boots: PAL.boot, sleeve: PAL.mail, len: 118, hem: -20, helm: 'kettle', shield: 'kite' };
TROOPS.sergeant = {
  name: 'Sergeant', shadowW: 17, h: 100,
  pose: spearPose,
  side(g, p) { spearSide(g, p, SERGEANT); },
  front(g, p) { spearFB(g, p, SERGEANT, true); },
  back(g, p) { spearFB(g, p, SERGEANT, false); },
};
const AYY_SPEAR = { legs: '#e7dcc2', boots: '#7a4a26', sleeve: PAL.mail, len: 124, hem: -13, helm: 'turban', shield: 'round', robe: true, sash: '#f3ecd9', tassel: '#e8c34a' };
TROOPS.spearman = {
  name: 'Spearman', shadowW: 17, h: 100,
  pose: spearPose,
  side(g, p) { spearSide(g, p, AYY_SPEAR); },
  front(g, p) { spearFB(g, p, AYY_SPEAR, true); },
  back(g, p) { spearFB(g, p, AYY_SPEAR, false); },
};

/* ================= AYYUBID SWORDSMAN: turban helm, robe, round shield, curved sword ================= */
TROOPS.saracen = {
  name: 'Swordsman', shadowW: 18, h: 100,
  pose: (anim, t) => TROOPS.sword.pose(anim, t),
  side(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
    sLeg(g, -2, hipY, p.legB, shade('#e7dcc2', -0.3), shade('#7a4a26', -0.3));
    sLeg(g, 2, hipY, p.legF, '#e7dcc2', '#7a4a26');
    const R = (x, y) => rotPt(x, y, 0, hipY, p.lean || 0);
    const sf = R(-3, shoY + 3), sn = R(4, shoY + 2), hd = R(3, L.HEAD + p.bob);
    if (!p.front) gScimitar(g, p.sX, p.sY, p.sA, 40);
    sArm(g, sf[0], sf[1], p.sX, p.sY, shade(PAL.mail, -0.3), shade(PAL.skin, -0.2), 1);
    c.save(); c.translate(0, hipY); c.rotate(p.lean || 0); c.translate(0, -hipY);
    robeSide(g, shoY, hipY, -13 + p.bob, tm.main, '#f3ecd9');
    c.restore();
    sHead(g, hd[0], hd[1]); sEye(g, hd[0] + 8.3, hd[1] + 1.5);
    turbanSide(g, hd[0], hd[1]);
    const shx = 17 + ((p.lean || 0) > 0.05 ? 3 : 0), shy = -52 + p.bob;
    sArm(g, sn[0], sn[1], shx - 3, shy + 2, PAL.mail, PAL.skin, 1, true);
    gRound(g, shx, shy, 13, 14.5, tm.main);
    if (p.front) gScimitar(g, p.sX, p.sY, p.sA, 40);
  },
  front(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sp = swordPoseFB(p, true);
    fLegs(g, p, '#e7dcc2', '#7a4a26');
    robeFB(g, shoY, hipY, -13 + p.fb, tm.main, '#f3ecd9');
    fHead(g, hy); fFace(g, hy); turbanFB(g, hy);
    if (!sp.over) gScimitar(g, sp.x, sp.y, sp.a, 40);
    fArm(g, -16, shoY + 4, sp.x, sp.y, PAL.mail, PAL.skin, 1, true);
    fArm(g, 16, shoY + 4, 10, -52 + p.fb, PAL.mail, PAL.skin, -1, true);
    gRound(g, 8, -50 + p.fb, 16, 16, tm.main);
    if (sp.over) gScimitar(g, sp.x, sp.y, sp.a, 40);
  },
  back(g, p) {
    const c = g.c, tm = g.team;
    const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
    const sp = swordPoseFB(p, false);
    c.beginPath(); ell(c, -15, -50 + p.fb, 15, 16); g.fill(PAL.wood, true);
    if (!g.out) { c.beginPath(); ell(c, -15, -50 + p.fb, 15, 16); g.inside((c) => { c.lineWidth = 3; c.strokeStyle = PAL.steelD; c.beginPath(); ell(c, -15, -50 + p.fb, 14, 15); c.stroke(); c.fillStyle = PAL.leatherD; c.fillRect(-32, -53 + p.fb, 34, 3.5); }); }
    fLegs(g, p, '#e7dcc2', '#7a4a26');
    robeFB(g, shoY, hipY, -13 + p.fb, tm.main, '#f3ecd9', true);
    gScimitar(g, sp.x, sp.y, sp.a, 40);
    fArm(g, 16, shoY + 4, sp.x, sp.y, PAL.mail, PAL.skin, -1, true);
    fArm(g, -16, shoY + 4, -15, -46 + p.fb, PAL.mail, PAL.skin, 1, true);
    fHair(g, hy); turbanFB(g, hy, null, true);
  },
};

/* ===== src/art/15-mounted.js ===== */
/* Roll to War: mounted nation units and heroes.
   A kit describes horse, caparison, rider, helmet, crest and weapon; the same renderer draws
   Royal Knights, Templars, Horse Archers, heroes and enemy commanders. The camel is its own mount. */

const MOUNT_DEF = {
  coat: PAL.coat, mane: PAL.mane,
  capa: 'team',          // 'team' | null | { arms: key|object, trim }
  cloth: null,           // saddle cloth for light horse: { col, trim }
  chanfron: false,
  legs: PAL.mailD, boots: PAL.steelDD, arm: PAL.mail, hand: PAL.steel,
  torso: 'team',         // 'team' | { arms } | colour
  helm: 'sugarloaf',     // sugarloaf | great | turban | crowned (sugarloaf + crown) | greatCrown
  plume: 'team',         // colour | 'team' | null
  crest: null,           // lion | lis | feathers | wolf
  weapon: 'lance',       // lance | bow | scimitar | sword
  pennant: null,         // arms key for the lance pennant (default: team)
  shield: null,          // { kind: 'round' | 'heater', arms, col }
};
function mkit(o) { return Object.assign({}, MOUNT_DEF, o); }
const colOf = (v, tm) => (v === 'team' ? tm.main : v);

/* paint arms (or a colour) inside the current path, fill mode only */
function paintInside(g, spec, tm, x, y, w, h) {
  if (g.out) return;
  g.inside((c) => {
    if (!spec || spec === 'team') { c.fillStyle = tm.main; c.fillRect(x, y, w, h); }
    else if (typeof spec === 'string' && spec[0] === '#') { c.fillStyle = spec; c.fillRect(x, y, w, h); }
    else {
      let A = typeof spec === 'object' && spec.arms ? spec.arms : spec;
      if (typeof A === 'object') { const B = {}; for (const k in A) B[k] = A[k] === 'team' ? tm.main : A[k]; A = B; }
      HER.paint(c, A, x, y, w, h, { detail: g.detail >= 2 });
    }
  });
}

/* ---------- mounted pose (lance uses the knight's pose) ---------- */
function mountedPose(kit) {
  return function (anim, t) {
    if (kit.weapon === 'lance') return TROOPS.knight.pose(anim, t);
    const p = { anim, t, hb: 0, hph: 0, nod: 0, tail: Math.sin(t * 3) * 3, lx: 0, tilt: 0 };
    if (anim === 'walk') {
      const ph = (t / 0.62) * TAU; p.hph = ph;
      p.hb = -Math.abs(Math.sin(ph)) * 2.6 + 1.3; p.nod = Math.sin(ph * 2) * 0.05;
    } else {
      p.hb = Math.sin(t * 2.4) * 0.6; p.nod = Math.sin(t * 1.3) * 0.04; p.hph = Math.PI * 0.5;
    }
    if (kit.weapon === 'banner') {
      // a standard: held high, dipped forward to rally the charge
      let k = 0;
      if (anim === 'attack') { const u = (t % 1.1) / 1.1; k = u < 0.35 ? smooth(u / 0.35) : u < 0.55 ? 1 : 1 - smooth((u - 0.55) / 0.45); }
      return Object.assign(p, { bnA: lerp(-1.4, -0.55, k) + (anim === 'attack' ? 0 : Math.sin(t * 1.3) * 0.04), bnK: k, wave: anim === 'attack' ? 1.6 : 1, lean: 0 });
    }
    if (kit.weapon === 'bow') {
      if (anim === 'attack') {
        const D = 1.1, u = (t % D) / D;
        let draw = 0, a = -0.1, arrow = true, stage = 'draw';
        if (u < 0.12) { arrow = u > 0.05; a = 0.4; stage = 'nock'; }
        else if (u < 0.45) { const k = smooth(seg(u, 0.12, 0.45)); draw = k; a = lerp(0.4, -0.12, k); }
        else if (u < 0.52) { draw = 1; a = -0.12; }
        else if (u < 0.7) { draw = 0; arrow = false; a = -0.12; stage = 'loose'; }
        else { const k = smooth(seg(u, 0.7, 1)); a = lerp(-0.12, 0.4, k); arrow = false; stage = 'lower'; }
        Object.assign(p, { draw, bA: a, arrow, stage, u });
      } else Object.assign(p, { draw: 0, bA: 1.2, arrow: false, stage: 'carry' });
    } else {
      if (anim === 'attack') {
        const D = 0.95, u = (t % D) / D;
        let a, lean = 0;
        if (u < 0.38) { const k = smooth(u / 0.38); a = lerp(-1.2, -2.6, k); lean = -0.06 * k; }
        else if (u < 0.54) { const k = easeOut(seg(u, 0.38, 0.54)); a = lerp(-2.6, 0.7, k); lean = lerp(-0.06, 0.1, k); }
        else { const k = smooth(seg(u, 0.54, 1)); a = lerp(0.7, -1.2, k); lean = lerp(0.1, 0, k); }
        Object.assign(p, { swA: a, lean, u, front: u >= 0.42 && u < 0.8 });
      } else Object.assign(p, { swA: -1.25 + Math.sin(t * 2.4) * 0.03, lean: 0 });
    }
    return p;
  };
}

/* ---------- helmets, crests (rider head at hx, hy) ---------- */
function aigrette(g, x, y) {
  // jewelled turban ornament with a feather plume
  const c = g.c;
  c.beginPath(); c.moveTo(x - 1, y); c.bezierCurveTo(x - 7, y - 8, x - 4, y - 20, x + 3, y - 24); c.bezierCurveTo(x + 5, y - 16, x + 3, y - 7, x + 2, y); c.closePath(); g.fill('#f6f2e6');
  c.beginPath(); ell(c, x, y + 1, 3.6, 4.2); g.fill(PAL.gold);
  if (!g.out) g.dot(x, y + 1, 1.7, '#c8372d');
}
function crownRing(g, hx, hy, w) {
  const c = g.c;
  c.beginPath(); c.moveTo(hx - w, hy); c.lineTo(hx - w, hy - 5);
  for (let i = 0; i <= 4; i++) { const x = hx - w + (i * w) / 2; c.lineTo(x, hy - 10); c.lineTo(x + w / 4, hy - 5.5); }
  c.lineTo(hx + w, hy - 5); c.lineTo(hx + w, hy); c.closePath();
  g.fill(PAL.gold);
  if (!g.out) { g.dot(hx - w / 2, hy - 3, 1.3, '#d63c31'); g.dot(hx, hy - 3, 1.3, '#2f8a4c'); g.dot(hx + w / 2, hy - 3, 1.3, '#2f5fc4'); }
}
function crestDraw(g, kind, hx, hy, tm) {
  const c = g.c;
  if (kind === 'lion') {
    c.beginPath(); c.moveTo(hx - 12, hy); c.bezierCurveTo(hx - 12, hy - 9, hx + 4, hy - 11, hx + 9, hy - 7); c.lineTo(hx + 13, hy - 14); c.bezierCurveTo(hx + 20, hy - 14, hx + 20, hy - 4, hx + 14, hy - 2); c.lineTo(hx + 10, hy); c.closePath();
    c.moveTo(hx - 11, hy - 3); c.quadraticCurveTo(hx - 20, hy - 8, hx - 15, hy - 16); c.lineTo(hx - 13, hy - 13); c.quadraticCurveTo(hx - 16, hy - 8, hx - 9, hy - 5); c.closePath();
    g.fill(PAL.gold);
    if (!g.out) g.dot(hx + 15, hy - 9, 1.1, INK);
  } else if (kind === 'lis') {
    lisPath(c, hx, hy - 10, 21); g.fill(PAL.gold);
  } else if (kind === 'feathers' || kind === 'blackFeathers') {
    const col = kind === 'feathers' ? '#f6f2e6' : '#2a2320';
    for (const [dx, a] of [[-6, -0.5], [0, -0.1], [6, 0.35]]) {
      c.save(); c.translate(hx + dx, hy); c.rotate(a);
      c.beginPath(); c.moveTo(-2, 0); c.bezierCurveTo(-7, -10, -4, -22, 2, -26); c.bezierCurveTo(7, -18, 6, -8, 2, 0); c.closePath(); g.fill(col);
      c.restore();
    }
  } else if (kind === 'wolf') {
    if (g.out) { c.beginPath(); ell(c, hx + 2, hy - 8, 10, 9); g.fill(INK); }
    else HER.wolf(c, hx + 2, hy - 8, 20, '#8fa6c8', { eye: INK });
  } else if (CRESTS[kind]) CRESTS[kind](g, hx, hy, true);
}
function riderHeadSide(g, K, tm, hx, hy) {
  const c = g.c;
  if (K.head) { inHeadSide(g, hx, hy, Object.assign({ skin: K.hand }, K.head)); return; }
  if (K.helm === 'bare') { sHead(g, hx, hy); bareHairSide(g, hx, hy, K.hair || '#2e2016'); sEye(g, hx + 8.3, hy + 1.5); return; }
  if (K.helm === 'turban') { sHead(g, hx, hy); sEye(g, hx + 8.3, hy + 1.5); turbanSide(g, hx, hy, K.cloth2); if (K.crown) aigrette(g, hx + 9, hy - 12); return; }
  const plume = K.plume === 'team' ? tm.main : K.plume;
  if (K.helm === 'great' || K.helm === 'greatCrown') {
    if (plume) { c.beginPath(); c.moveTo(hx - 6, hy - 16); c.quadraticCurveTo(hx - 10, hy - 30, hx - 22, hy - 26); c.quadraticCurveTo(hx - 12, hy - 20, hx - 10, hy - 14); c.closePath(); g.fill(plume); }
    const hp = () => { c.beginPath(); rr(c, hx - 12.5, hy - 17, 26, 32, 4); };
    hp(); g.fill(PAL.steel);
    if (!g.out) {
      hp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(hx - 14, hy - 18, 9, 36); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(hx + 3, hy - 15, 3, 28); c.fillStyle = PAL.steelDD; c.fillRect(hx - 12, hy + 11, 30, 4); });
      c.beginPath(); rr(c, hx + 1, hy - 5, 13, 3.2, 1.4); c.fillStyle = INK; c.fill();
      if (g.detail >= 1) { g.dot(hx + 6, hy + 4, 0.9, INK); g.dot(hx + 9, hy + 4, 0.9, INK); g.dot(hx + 6, hy + 7, 0.9, INK); }
    }
    if (K.helm === 'greatCrown') crownRing(g, hx + 0.5, hy - 16, 13);
    if (K.crest) crestDraw(g, K.crest, hx, hy - (K.helm === 'greatCrown' ? 25 : 17), tm);
    return;
  }
  // sugarloaf (default) + optional crown
  if (plume && !K.crest) { c.beginPath(); c.moveTo(hx + 7, hy - 8); c.quadraticCurveTo(hx + 4, hy - 24, hx - 14, hy - 30); c.quadraticCurveTo(hx - 10, hy - 22, hx - 6, hy - 12); c.closePath(); g.fill(plume); }
  const hp = () => { c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 12.5, hy - 5); c.quadraticCurveTo(hx - 10, hy - 17, hx + 1, hy - 19); c.quadraticCurveTo(hx + 12.5, hy - 17, hx + 13, hy - 4); c.lineTo(hx + 12.5, hy + 12); c.closePath(); };
  hp(); g.fill(K.helmCol || PAL.steel);
  if (!g.out) {
    hp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(hx - 15, hy - 20, 8, 34); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(hx + 3, hy - 14, 3, 24); c.fillStyle = PAL.gold; c.fillRect(hx - 14, hy - 8, 28, 3.6); });
    c.beginPath(); rr(c, hx + 1, hy - 1, 12.5, 3.2, 1.4); c.fillStyle = INK; c.fill();
  }
  if (K.helm === 'crowned') crownRing(g, hx + 0.5, hy - 12, 12.5);
  if (K.crest) crestDraw(g, K.crest, hx, hy - (K.helm === 'crowned' ? 21 : 18), tm);
}

/* ---------- side view ---------- */
function mountedSide(g, p, K) {
  const c = g.c, tm = g.team;
  c.save(); c.translate(p.lx || 0, 0);
  if (p.tilt) { c.translate(-30, 0); c.rotate(p.tilt); c.translate(30, 0); }
  const by = -60 + p.hb, coat = K.coat, coatF = shade(coat, -0.3), ph = p.hph;
  hLeg(g, 25, by + 7, ph + Math.PI, coatF, true);
  hLeg(g, -25, by + 6, ph, coatF, false);
  c.beginPath(); c.moveTo(-34, by - 8); c.quadraticCurveTo(-50 - p.tail, by - 2, -48 - p.tail * 1.4, by + 26); c.quadraticCurveTo(-42 - p.tail * 0.6, by + 12, -32, by); c.closePath(); g.fill(K.mane);
  c.beginPath(); ell(c, -2, by, 37, 18); g.fill(coat);
  if (!g.out && !K.capa) { c.beginPath(); ell(c, -2, by, 37, 18); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-45, by + 6, 90, 20); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-45, by - 18, 90, 6); }); }
  c.beginPath(); c.moveTo(14, by - 11); c.quadraticCurveTo(24, by - 38, 39, by - 46); c.lineTo(50, by - 38); c.quadraticCurveTo(41, by - 19, 36, by + 5); c.closePath(); g.fill(coat);
  c.beginPath(); c.moveTo(13, by - 12); c.quadraticCurveTo(22, by - 38, 38, by - 48); c.lineTo(41, by - 44); c.quadraticCurveTo(28, by - 34, 20, by - 10); c.closePath(); g.fill(K.mane);
  c.save(); c.translate(44, by - 43); c.rotate(0.66 + p.nod);
  c.beginPath(); c.moveTo(-5, -7.5); c.quadraticCurveTo(8, -10, 22, -6); c.quadraticCurveTo(29.5, -3.5, 29, 1.5); c.quadraticCurveTo(27, 6.5, 20, 6.5); c.quadraticCurveTo(6, 9, -4, 8); c.closePath(); g.fill(coat);
  c.beginPath(); c.moveTo(-3, -6); c.lineTo(-9, -15); c.lineTo(3, -8.5); c.closePath(); g.fill(coat);
  if (K.chanfron) { c.beginPath(); c.moveTo(-2, -8.5); c.quadraticCurveTo(10, -11.5, 23, -7); c.lineTo(24, -1); c.quadraticCurveTo(10, -2, -1, 0); c.closePath(); g.fill(PAL.steel); if (!g.out) g.line([2, -6, 20, -5], PAL.gold, 1.2); }
  if (!g.out) {
    g.dot(6.5, -2.5, 1.9, INK); g.dot(26, 1, 1.2, shade(coat, -0.5));
    g.line([-4, 5.5, 8, 5.5, 17, -8], PAL.leatherD, 1.6); g.line([17, -8, 21, 6], PAL.leatherD, 1.4);
  }
  c.restore();
  hLeg(g, 21, by + 8, ph, coat, true);
  hLeg(g, -29, by + 6, ph + Math.PI, coat, false);
  if (K.capa) {
    const cp = () => {
      c.beginPath(); c.moveTo(30, by - 13); c.quadraticCurveTo(38, by + 4, 32, by + 22);
      const n = 6, x0 = 32, x1 = -38;
      for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 28, xb, by + 21); }
      c.quadraticCurveTo(-45, by + 2, -36, by - 13); c.quadraticCurveTo(-4, by - 21, 30, by - 13); c.closePath();
    };
    cp(); g.fill(tm.main);
    if (!g.out) {
      cp(); paintInside(g, K.capa === 'team' ? null : K.capa, tm, -46, by - 22, 84, 52);
      cp();
      g.inside((c) => {
        c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(-60, by + 8, 120, 30);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-60, by - 14, 120, 5);
        c.lineWidth = 5; c.strokeStyle = (K.capa.trim) || PAL.gold;
        c.beginPath(); const n = 6, x0 = 32, x1 = -38; c.moveTo(x0, by + 22);
        for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, by + 28, xb, by + 21); }
        c.stroke();
        if (K.capa === 'team' && g.detail >= 1) {
          c.fillStyle = PAL.gold;
          for (const dx of [-22, 14]) { c.beginPath(); c.moveTo(dx, by - 3); c.lineTo(dx + 5, by + 3); c.lineTo(dx, by + 9); c.lineTo(dx - 5, by + 3); c.closePath(); c.fill(); }
          c.beginPath(); circ(c, -4, by + 4, 8.5); c.fill(); c.beginPath(); circ(c, -4, by + 4, 5.8); c.fillStyle = tm.dark; c.fill();
        }
      });
    }
  } else if (K.cloth) {
    const cl = () => { c.beginPath(); c.moveTo(-24, by - 16); c.quadraticCurveTo(-4, by - 22, 16, by - 16); c.lineTo(14, by + 4); c.quadraticCurveTo(-4, by + 8, -22, by + 4); c.closePath(); };
    cl(); g.fill(colOf(K.cloth.col, tm));
    if (!g.out) {
      cl(); g.inside((c) => { c.fillStyle = K.cloth.trim || PAL.gold; c.fillRect(-30, by + 0.5, 50, 4); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-30, by - 4, 50, 14); });
      c.fillStyle = K.cloth.trim || PAL.gold; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-19 + i * 8, by + 5); c.lineTo(-17 + i * 8, by + 11); c.lineTo(-15 + i * 8, by + 5); c.closePath(); c.fill(); }
    }
  }
  c.beginPath(); c.moveTo(-18, by - 19); c.quadraticCurveTo(-18, by - 30, -12, by - 29); c.quadraticCurveTo(-4, by - 21, 6, by - 23); c.quadraticCurveTo(12, by - 31, 14, by - 23); c.quadraticCurveTo(0, by - 13, -18, by - 19); c.closePath(); g.fill(PAL.leather);
  riderSide(g, p, K, tm, by + p.hb * 0.3, 0);
  c.restore();
}
/* rider on a mount; rb = saddle reference (knight: by), dx = horizontal offset of the seat */
function riderSide(g, p, K, tm, rb, dx) {
  const c = g.c;
  c.save(); c.translate(dx, 0);
  const hipX = -3, hipY = rb - 24;
  c.beginPath(); cap(c, hipX, hipY, 11, rb - 12, 10); cap(c, 11, rb - 12, 7, rb + 6, 8.5); g.fill(K.legs);
  c.beginPath(); c.moveTo(3, rb + 2); c.lineTo(12, rb + 2); c.quadraticCurveTo(16, rb + 4, 15, rb + 8); c.lineTo(3, rb + 8); c.closePath(); g.fill(K.boots);
  if (!g.out) g.line([7, rb - 1, 7, rb + 10], PAL.leatherD, 1.2);
  const lean = p.lean || 0;
  c.save(); c.translate(0, rb - 24); c.rotate(lean); c.translate(0, -(rb - 24));
  const w = K.weapon;
  let grip, ca, sa;
  if (w === 'lance') { ca = Math.cos(p.lA); sa = Math.sin(p.lA); grip = [p.lBx + ca * p.grip, p.lBy + sa * p.grip]; }
  // far arm
  if (w === 'bow') {
    const gx = p.stage === 'carry' ? 14 : 22, gy = p.stage === 'carry' ? rb - 30 : rb - 44;
    sArm(g, -3, rb - 45, gx, gy, shade(K.arm, -0.3), shade(K.hand, -0.25), p.stage === 'carry' ? 1 : -1);
    p._bow = [gx, gy];
    if (p.stage === 'carry') gRecurve(g, gx, gy, p.bA, 0);
    else gRecurve(g, gx, gy, p.bA, p.draw, { part: 'stave' });
  } else if (w === 'scimitar' || w === 'sword') {
    sArm(g, -3, rb - 45, 16, rb - 30, shade(K.arm, -0.3), shade(K.hand, -0.25), 1);
  } else sArm(g, -3, rb - 45, 16, rb - 30, shade(K.arm, -0.3), shade(K.hand, -0.25), 1);
  // torso
  const rtp = () => { c.beginPath(); c.moveTo(-13, rb - 51); c.quadraticCurveTo(2, rb - 56, 12, rb - 50); c.quadraticCurveTo(17, rb - 36, 13, rb - 20); c.quadraticCurveTo(0, rb - 15, -14, rb - 20); c.quadraticCurveTo(-18, rb - 36, -13, rb - 51); c.closePath(); };
  rtp(); g.fill(K.torso === 'team' ? tm.main : typeof K.torso === 'string' ? K.torso : tm.main);
  if (!g.out) {
    if (K.torso && K.torso !== 'team' && typeof K.torso === 'object') { rtp(); paintInside(g, K.torso, tm, -18, rb - 58, 36, 42); }
    rtp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(-20, rb - 60, 11, 50); c.fillStyle = K.belt || PAL.leatherD; c.fillRect(-20, rb - 27, 40, 4.5); if (K.torso === 'team') { c.fillStyle = PAL.gold; c.fillRect(-2, rb - 50, 4, 26); } });
  }
  riderHeadSide(g, K, tm, 0, rb - 62);
  // weapon + near arm
  if (w === 'lance') {
    const L0 = [p.lBx, p.lBy], LL = 142, tipX = p.lBx + ca * LL, tipY = p.lBy + sa * LL;
    c.beginPath(); taper(c, L0[0], L0[1], tipX, tipY, 5, 2.4); g.fill(PAL.woodL);
    c.save(); c.translate(p.lBx + ca * (p.grip + 7), p.lBy + sa * (p.grip + 7)); c.rotate(p.lA);
    c.beginPath(); c.moveTo(-4, -8); c.lineTo(4, -2.2); c.lineTo(4, 2.2); c.lineTo(-4, 8); c.closePath(); g.fill(PAL.steelD); c.restore();
    c.save(); c.translate(tipX, tipY); c.rotate(p.lA); c.beginPath(); c.moveTo(-1, -2.5); c.lineTo(9, 0); c.lineTo(-1, 2.5); c.closePath(); g.fill(PAL.steelL); c.restore();
    if (K.pennant) pennantArms(g, p.lBx + ca * (LL - 18), p.lBy + sa * (LL - 18), p.lA, K.pennant, p.t);
    else gPennant(g, p.lBx + ca * (LL - 18), p.lBy + sa * (LL - 18), p.lA, tm, p.t);
    sArm(g, 3, rb - 46, grip[0], grip[1], K.arm, K.hand, 1, true);
  } else if (w === 'bow') {
    const [gx, gy] = p._bow;
    let hand = [8, rb - 36];
    if (p.stage !== 'carry') {
      const nk = gRecurve(g, gx, gy, p.bA, p.draw, { part: 'string', arrow: p.arrow });
      hand = p.stage === 'loose' ? [-8, rb - 58] : p.stage === 'lower' ? [2, rb - 40] : nk;
    }
    sArm(g, 3, rb - 46, hand[0], hand[1], K.arm, K.hand, p.stage === 'carry' ? 1 : -1, true);
  } else if (w === 'banner') {
    const a = p.bnA, gx = 12, gy = rb - 38, ca = Math.cos(a), sa = Math.sin(a);
    const bx = gx - ca * 26, by = gy - sa * 26, tx = gx + ca * 118, ty = gy + sa * 118;
    bannerFlag(g, tx - ca * 5, ty - sa * 5, a, K.banner || 'joanStandard', p.t, p.wave, 1);
    c.beginPath(); taper(c, bx, by, tx, ty, 4.2, 2.6); g.fill(PAL.woodL);
    c.save(); c.translate(tx, ty); c.rotate(a); c.beginPath(); c.moveTo(-1, -2.4); c.lineTo(8, 0); c.lineTo(-1, 2.4); c.closePath(); g.fill(PAL.steelL); c.restore();
    sArm(g, 3, rb - 46, gx, gy, K.arm, K.hand, 1, true);
  } else {
    const sx = 8, sy = rb - 52, a = p.swA, gx = sx + Math.cos(a + 0.9) * 16, gy = sy + Math.sin(a + 0.9) * 16 - 4;
    const hx2 = sx + Math.cos(a) * 20, hy2 = sy + Math.sin(a) * 20;
    if (!p.front) riderBlade(g, w, hx2, hy2, a);
    sArm(g, 3, rb - 46, hx2, hy2, K.arm, K.hand, -1, true);
    if (K.shield) {
      if (K.shield.kind === 'round') { c.save(); c.translate(-2, 0); gRound(g, 2, rb - 36, 12, 13, K.shield.col || tm.main); c.restore(); }
      else if (K.shield.kind === 'dhal') gDhal(g, 0, rb - 36, 12, K.shield.col || tm.main);
    }
    if (p.front) riderBlade(g, w, hx2, hy2, a);
  }
  c.restore();
  c.restore();
}
function riderBlade(g, w, x, y, a) {
  if (w === 'scimitar') gScimitar(g, x, y, a, 42);
  else if (w === 'talwar') gTalwar(g, x, y, a, 42);
  else if (w === 'khanda') gKhanda(g, x, y, a, 38);
  else if (w === 'mace') gMace(g, x, y, a, 34);
  else gSword(g, x, y, a, 44);
}
/* lance pennant painted with arms */
function pennantArms(g, x, y, a, key, t) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
  const w1 = Math.sin(t * 7) * 2.5, w2 = Math.sin(t * 7 + 1.4) * 3.5;
  const path = () => { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -3 + w1, 30, 1 + w2); c.lineTo(22, 7 + w1 * 0.5); c.lineTo(30, 13 + w2); c.quadraticCurveTo(14, 12 + w1, 0, 13); c.closePath(); };
  path(); g.fill('#fff');
  if (!g.out) { path(); g.inside((c) => HER.paint(c, key, 0, -4, 32, 20)); }
  c.restore();
}

/* ---------- front / back views ---------- */
function mountedFB(g, p, K, front) {
  const c = g.c, tm = g.team;
  const ph = p.hph, walking = p.anim === 'walk';
  const lL = walking ? Math.max(0, Math.sin(ph)) * 6 : 0, lR = walking ? Math.max(0, -Math.sin(ph)) * 6 : 0;
  const by = -60 + p.hb, coat = K.coat;
  const capaPath = (x0, top, bot) => {
    c.beginPath(); c.moveTo(-x0, by - 14); c.quadraticCurveTo(0, by - 22, x0, by - 14); c.quadraticCurveTo(x0 + 6, by + 4, x0 + 2, bot);
    const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(x0 + 2, -x0 - 2, i / n), xb = lerp(x0 + 2, -x0 - 2, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, bot + 7, xb, bot); }
    c.quadraticCurveTo(-x0 - 6, by + 4, -x0, by - 14); c.closePath();
  };
  const body = (x0, bot) => {
    if (K.capa) {
      capaPath(x0, by - 14, bot); g.fill(tm.main);
      if (!g.out) { capaPath(x0, by - 14, bot); paintInside(g, K.capa === 'team' ? null : K.capa, tm, -x0 - 8, by - 24, x0 * 2 + 16, bot - by + 34); capaPath(x0, by - 14, bot); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(8, by - 30, 30, 60); c.lineWidth = 5; c.strokeStyle = K.capa.trim || PAL.gold; c.beginPath(); c.moveTo(x0 + 2, bot); const n = 4; for (let i = 0; i < n; i++) { const xa = lerp(x0 + 2, -x0 - 2, i / n), xb = lerp(x0 + 2, -x0 - 2, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, bot + 7, xb, bot); } c.stroke(); }); }
    } else {
      c.beginPath(); ell(c, 0, by + 2, x0 - 2, 17); g.fill(coat);
      if (K.cloth) { c.beginPath(); rr(c, -x0 + 2, by - 16, (x0 - 2) * 2, 18, 6); g.fill(colOf(K.cloth.col, tm)); if (!g.out) { g.line([-x0 + 4, by - 1, x0 - 4, by - 1], K.cloth.trim || PAL.gold, 3); } }
    }
  };
  if (front) {
    horseLegFB(g, -13, lR * 0.6 + 7, by + 8, shade(coat, -0.35));
    horseLegFB(g, 13, lL * 0.6 + 7, by + 8, shade(coat, -0.35));
    body(25, by + 20);
    const rb = by - 8 + p.hb * 0.3;
    riderFBK(g, p, K, tm, rb, true);
    fArm(g, 13, rb - 45, 9, rb - 26, K.arm, K.hand, -1);
    const hy = by - 19;
    c.beginPath(); ell(c, 0, by - 8, 14, 15); g.fill(coat);
    const head = () => { c.beginPath(); c.moveTo(-12, hy - 16); c.quadraticCurveTo(0, hy - 22, 12, hy - 16); c.quadraticCurveTo(13, hy + 8, 9, hy + 26); c.quadraticCurveTo(0, hy + 32, -9, hy + 26); c.quadraticCurveTo(-13, hy + 8, -12, hy - 16); c.closePath(); };
    c.beginPath(); poly(c, [-10, hy - 14, -15, hy - 28, -4, hy - 18]); g.fill(coat);
    c.beginPath(); poly(c, [10, hy - 14, 15, hy - 28, 4, hy - 18]); g.fill(coat);
    head(); g.fill(coat);
    if (!g.out) {
      head(); g.inside((c) => { c.fillStyle = '#efe6d8'; c.beginPath(); c.moveTo(-3, hy - 16); c.lineTo(3, hy - 16); c.lineTo(4.5, hy + 20); c.lineTo(-4.5, hy + 20); c.closePath(); c.fill(); c.fillStyle = shade(coat, -0.22); c.fillRect(-14, hy + 19, 28, 14); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(6, hy - 20, 10, 50); if (K.chanfron) { c.fillStyle = PAL.steel; c.fillRect(-8, hy - 18, 16, 30); c.fillStyle = PAL.gold; c.fillRect(-1.5, hy - 18, 3, 30); } });
      g.dot(-9.5, hy - 3, 2.1, INK); g.dot(9.5, hy - 3, 2.1, INK); g.dot(-4, hy + 25, 1.4, INK); g.dot(4, hy + 25, 1.4, INK);
      g.line([-11.5, hy + 5, 11.5, hy + 5], PAL.leatherD, 1.7);
      c.beginPath(); c.moveTo(-7, hy - 17); c.quadraticCurveTo(0, hy - 25, 7, hy - 17); c.quadraticCurveTo(0, hy - 13, -7, hy - 17); c.fillStyle = K.mane; c.fill();
    }
    horseLegFB(g, -9, lL, by + 14, coat);
    horseLegFB(g, 9, lR, by + 14, coat);
    weaponFB(g, p, K, tm, rb, true);
  } else {
    horseLegFB(g, -10, lR * 0.6 + 7, by + 8, shade(coat, -0.35));
    horseLegFB(g, 10, lL * 0.6 + 7, by + 8, shade(coat, -0.35));
    c.beginPath(); ell(c, 0, by - 34, 7, 10); g.fill(coat);
    c.beginPath(); poly(c, [-5, by - 40, -8, by - 50, -1, by - 43]); poly(c, [5, by - 40, 8, by - 50, 1, by - 43]); g.fill(coat);
    horseLegFB(g, -11, lL, by + 12, coat);
    horseLegFB(g, 11, lR, by + 12, coat);
    body(24, by + 18);
    const sw = Math.sin(p.t * 3.2) * 3;
    c.beginPath(); c.moveTo(-5, by - 10); c.quadraticCurveTo(-9 + sw, by + 10, -6 + sw * 1.6, by + 31); c.quadraticCurveTo(0 + sw * 1.5, by + 35, 6 + sw * 1.6, by + 31); c.quadraticCurveTo(9 + sw, by + 10, 5, by - 10); c.closePath(); g.fill(K.mane);
    const rb = by + p.hb * 0.3;
    weaponFB(g, p, K, tm, rb, false, 'behind');
    riderFBK(g, p, K, tm, rb, false);
    weaponFB(g, p, K, tm, rb, false);
  }
}
function riderFBK(g, p, K, tm, rb, front) {
  const c = g.c;
  const path = () => { c.beginPath(); c.moveTo(-14, rb - 51); c.quadraticCurveTo(0, rb - 56, 14, rb - 51); c.quadraticCurveTo(18, rb - 36, 15, rb - 20); c.quadraticCurveTo(0, rb - 15, -15, rb - 20); c.quadraticCurveTo(-18, rb - 36, -14, rb - 51); c.closePath(); };
  path(); g.fill(K.torso === 'team' ? tm.main : typeof K.torso === 'string' ? K.torso : tm.main);
  if (!g.out) {
    if (K.torso && K.torso !== 'team' && typeof K.torso === 'object') { path(); paintInside(g, K.torso, tm, -18, rb - 58, 36, 42); }
    path(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, rb - 60, 12, 50); c.fillStyle = K.belt || PAL.leatherD; c.fillRect(-20, rb - 27, 40, 4.5); if (front && K.torso === 'team') { c.fillStyle = PAL.gold; c.fillRect(-2, rb - 50, 4, 26); } });
  }
  const hy = rb - 62;
  if (K.head) { inHeadFB(g, hy, Object.assign({ skin: K.hand }, K.head), front); return; }
  if (K.helm === 'bare') { if (front) { fHead(g, hy); fFace(g, hy); bareHairFront(g, hy, K.hair || '#2e2016'); } else fHead(g, hy, K.hair || '#2e2016'); return; }
  if (K.helm === 'turban') { if (front) { fHead(g, hy); fFace(g, hy); } else fHair(g, hy); turbanFB(g, hy, K.cloth2, !front); if (K.crown && front) aigrette(g, 0, hy - 12); return; }
  const plume = K.plume === 'team' ? tm.main : K.plume;
  if (K.helm === 'great' || K.helm === 'greatCrown') {
    if (front) greatHelmFront(g, hy, { main: plume || PAL.steel }); else greatHelmBack(g, hy, { main: plume || PAL.steel });
    if (K.helm === 'greatCrown') crownRingFB(g, hy - 17, 13);
  } else {
    if (plume && !K.crest) { c.beginPath(); c.moveTo(-5, hy - 16); c.quadraticCurveTo(-6, hy - 34, 4, hy - 36); c.quadraticCurveTo(12, hy - 30, 6, hy - 16); c.closePath(); g.fill(plume); }
    const hp = () => { c.beginPath(); c.moveTo(-12.5, hy + 12); c.lineTo(-12.5, hy - 5); c.quadraticCurveTo(-11, hy - 18, 0, hy - 19); c.quadraticCurveTo(11, hy - 18, 12.5, hy - 5); c.lineTo(12.5, hy + 12); c.closePath(); };
    hp(); g.fill(K.helmCol || PAL.steel);
    if (!g.out) {
      hp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(6, hy - 20, 9, 34); c.fillStyle = PAL.gold; c.fillRect(-14, hy - 8, 28, 3.6); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-10, hy - 14, 3, 22); });
      if (front) { c.beginPath(); rr(c, -10, hy - 1, 20, 3.2, 1.4); c.fillStyle = INK; c.fill(); c.fillStyle = PAL.gold; c.fillRect(-1.8, hy - 1, 3.6, 12); }
    }
    if (K.helm === 'crowned') crownRingFB(g, hy - 13, 12.5);
  }
  if (K.crest) crestFB(g, K.crest, hy - (K.helm === 'crowned' || K.helm === 'greatCrown' ? 24 : 18));
}
function crownRingFB(g, y, w) {
  const c = g.c;
  c.beginPath(); c.moveTo(-w, y + 5); c.lineTo(-w, y);
  for (let i = 0; i <= 4; i++) { const x = -w + (i * w) / 2; c.lineTo(x, y - 6); c.lineTo(x + w / 4, y - 1.5); }
  c.lineTo(w, y); c.lineTo(w, y + 5); c.closePath(); g.fill(PAL.gold);
  if (!g.out) { g.dot(-w / 2, y + 2, 1.3, '#d63c31'); g.dot(0, y + 2, 1.4, '#2f8a4c'); g.dot(w / 2, y + 2, 1.3, '#2f5fc4'); }
}
function crestFB(g, kind, y) {
  const c = g.c;
  if (kind === 'lion' || kind === 'wolf') { c.beginPath(); ell(c, 0, y - 6, 8, 8); c.moveTo(-6, y - 10); c.lineTo(-9, y - 18); c.lineTo(-2, y - 13); c.moveTo(6, y - 10); c.lineTo(9, y - 18); c.lineTo(2, y - 13); g.fill(kind === 'lion' ? PAL.gold : '#8fa6c8'); if (!g.out) { g.dot(-3, y - 7, 1.1, INK); g.dot(3, y - 7, 1.1, INK); } }
  else if (kind === 'lis') { lisPath(c, 0, y - 9, 20); g.fill(PAL.gold); }
  else if (kind === 'feathers' || kind === 'blackFeathers') {
    const col = kind === 'feathers' ? '#f6f2e6' : '#2a2320';
    for (const [dx, a] of [[-6, -0.45], [0, 0], [6, 0.45]]) { c.save(); c.translate(dx, y + 4); c.rotate(a); c.beginPath(); c.moveTo(-2, 0); c.bezierCurveTo(-7, -10, -4, -22, 2, -26); c.bezierCurveTo(7, -18, 6, -8, 2, 0); c.closePath(); g.fill(col); c.restore(); }
  }
  else if (CRESTS[kind]) CRESTS[kind](g, 0, y, false);
}
function weaponFB(g, p, K, tm, rb, front, layer) {
  const c = g.c, w = K.weapon, atk = p.anim === 'attack';
  if (w === 'lance') {
    const thr = p.thr || 0;
    if (front) {
      let b, tip;
      if (atk) { b = [-12, -138]; tip = [-17, 34 + thr]; } else { b = [-17, -64 + p.hb]; tip = [-21, -206 + p.hb]; }
      c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 5, 2.6); g.fill(PAL.woodL);
      if (!atk) { if (K.pennant) pennantArms(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), K.pennant, p.t); else gPennant(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), tm, p.t); }
      else { c.save(); c.translate(tip[0], tip[1]); c.rotate(Math.atan2(tip[1] - b[1], tip[0] - b[0])); c.beginPath(); c.moveTo(-1, -2.8); c.lineTo(10, 0); c.lineTo(-1, 2.8); c.closePath(); g.fill(PAL.steelL); c.restore(); }
      fArm(g, -12, rb - 44, lerp(b[0], tip[0], atk ? 0.14 : 0.2) + 1, lerp(b[1], tip[1], atk ? 0.14 : 0.2), K.arm, K.hand, 1, true);
    } else {
      if (layer === 'behind') return;
      const b = atk ? [12, -86] : [17, -64 + p.hb], tip = atk ? [8, -226 - thr] : [21, -206 + p.hb];
      c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 5, 2.6); g.fill(PAL.woodL);
      if (K.pennant) pennantArms(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), K.pennant, p.t);
      else gPennant(g, lerp(b[0], tip[0], 0.88), lerp(b[1], tip[1], 0.88), Math.atan2(tip[1] - b[1], tip[0] - b[0]), tm, p.t);
      fArm(g, -13, rb - 45, -10, rb - 28, K.arm, K.hand, 1, true);
      fArm(g, 13, rb - 45, lerp(b[0], tip[0], 0.14) - 1, lerp(b[1], tip[1], 0.14), K.arm, K.hand, -1, true);
    }
  } else if (w === 'bow') {
    const aim = p.stage === 'draw' || p.stage === 'loose';
    if (front) {
      if (aim) {
        const gx = 6, gy = rb - 62, d = p.stage === 'draw' ? p.draw : 0, nk = [lerp(4, -6, d), lerp(gy, rb - 58, d)];
        fArm(g, -12, rb - 44, nk[0], nk[1], K.arm, K.hand, 1, true);
        gStroke(g, () => { c.beginPath(); c.moveTo(gx + 2, gy - 30); c.lineTo(nk[0], nk[1]); c.lineTo(gx + 2, gy + 30); }, 1.1, '#efe6d2');
        c.beginPath(); c.moveTo(gx + 6, gy - 32); c.quadraticCurveTo(gx - 3, gy - 14, gx, gy); c.quadraticCurveTo(gx - 3, gy + 14, gx + 6, gy + 32); c.lineTo(gx + 3, gy + 32); c.quadraticCurveTo(gx - 6, gy + 14, gx - 3, gy); c.quadraticCurveTo(gx - 6, gy - 14, gx + 3, gy - 32); c.closePath(); g.fill('#6d3f22');
        fArm(g, 12, rb - 44, gx + 1, gy, K.arm, K.hand, -1, true);
      } else {
        gRecurve(g, 16, rb - 32, 1.3, 0);
        fArm(g, -12, rb - 44, -9, rb - 28, K.arm, K.hand, 1, true);
      }
    } else {
      if (layer === 'behind') { if (aim) { c.beginPath(); c.moveTo(-8, rb - 94); c.quadraticCurveTo(-2, rb - 76, -5, rb - 62); c.quadraticCurveTo(-2, rb - 48, -8, rb - 30); c.lineTo(-11, rb - 30); c.quadraticCurveTo(-5, rb - 48, -8, rb - 62); c.quadraticCurveTo(-5, rb - 76, -11, rb - 94); c.closePath(); g.fill('#6d3f22'); } return; }
      fArm(g, -13, rb - 45, aim ? -7 : -10, aim ? rb - 62 : rb - 28, K.arm, K.hand, 1, true);
      fArm(g, 13, rb - 45, aim ? 8 : 10, aim ? rb - 56 : rb - 30, K.arm, K.hand, -1, true);
    }
  } else if (w === 'banner') {
    if (layer === 'behind') return;
    const sx = front ? -1 : 1, k = atk ? p.bnK || 0 : 0;
    const b = [sx * 16, rb - 30], tip = [sx * (18 - k * 5), rb - 150 + k * 48];
    const ang = Math.atan2(tip[1] - b[1], tip[0] - b[0]);
    bannerFlag(g, tip[0] - Math.cos(ang) * 5, tip[1] - Math.sin(ang) * 5, ang, K.banner || 'joanStandard', p.t, p.wave, front ? 1 : -1);
    c.beginPath(); taper(c, b[0], b[1], tip[0], tip[1], 4.2, 2.6); g.fill(PAL.woodL);
    fArm(g, sx * 13, rb - 45, lerp(b[0], tip[0], 0.16), lerp(b[1], tip[1], 0.16), K.arm, K.hand, front ? 1 : -1, true);
    if (!front) fArm(g, -sx * 13, rb - 45, -sx * 10, rb - 28, K.arm, K.hand, -1, true);
  } else {
    // swing weapon: screen-plane arc
    const sx = front ? -1 : 1;
    const a = p.swA, gx = sx * 14 + Math.cos(a) * 6, gy = rb - 52 + Math.sin(a) * 10;
    const draw = () => riderBlade(g, w, gx, gy, front ? -a - Math.PI : a);
    if (layer === 'behind') return;
    draw();
    fArm(g, sx * 13, rb - 45, gx, gy, K.arm, K.hand, front ? 1 : -1, true);
    if (K.shield && (K.shield.kind === 'round' || K.shield.kind === 'dhal')) { if (front) { if (K.shield.kind === 'dhal') gDhal(g, 9, rb - 34, 13, K.shield.col || tm.main); else gRound(g, 9, rb - 34, 13, 13, K.shield.col || tm.main); } }
    else fArm(g, -sx * 13, rb - 45, -sx * 10, rb - 28, K.arm, K.hand, front ? -1 : 1, true);
  }
}

/* ---------- camel (Mameluke) ---------- */
const CAMEL = { coat: '#d9a45e', coatD: '#b9803f', hair: '#9c6a36', pad: '#6d4a2c' };
function cLeg(g, hx, hy, ph, col, front) {
  // long thin leg with knobby knee and wide foot pad; ph = gait phase
  const c = g.c, a1 = 0.36 * Math.sin(ph), b = Math.max(0, Math.cos(ph));
  const a2 = front ? a1 - 0.9 * b : a1 + 0.5 * b;
  const L1 = 35, L2 = 37;
  const kx = hx + Math.sin(a1) * L1, ky = hy + Math.cos(a1) * L1;
  const fx = kx + Math.sin(a2) * L2, fy = ky + Math.cos(a2) * L2;
  c.beginPath(); taper(c, hx, hy, kx, ky, 12, 7); circ(c, kx, ky, 4.6); cap(c, kx, ky, fx, fy - 3, 5.4); g.fill(col);
  c.save(); c.translate(fx, fy); c.rotate(a2 * 0.4);
  c.beginPath(); c.moveTo(-6, -4); c.quadraticCurveTo(0, -6, 7, -3.5); c.quadraticCurveTo(9, 0, 7, 0.5); c.lineTo(-6.5, 0.5); c.closePath(); g.fill(CAMEL.pad);
  c.restore();
}
function camelSide(g, p, K) {
  const c = g.c, tm = g.team;
  const by = -86 + p.hb, ph = p.hph;
  // pacing gait: same-side legs move together
  cLeg(g, 24, by + 10, ph + Math.PI, shade(CAMEL.coat, -0.3), true);
  cLeg(g, -22, by + 8, ph + Math.PI, shade(CAMEL.coat, -0.3), false);
  // tail
  c.beginPath(); c.moveTo(-36, by - 8); c.quadraticCurveTo(-44 - p.tail * 0.5, by + 4, -41 - p.tail * 0.6, by + 18); c.lineTo(-37, by + 16); c.quadraticCurveTo(-38, by + 4, -32, by - 2); c.closePath(); g.fill(CAMEL.hair);
  // body with hump
  const bodyP = () => { c.beginPath(); c.moveTo(-38, by - 2); c.bezierCurveTo(-40, by - 16, -26, by - 20, -18, by - 22); c.bezierCurveTo(-12, by - 44, 14, by - 44, 18, by - 22); c.bezierCurveTo(28, by - 20, 38, by - 12, 36, by + 4); c.bezierCurveTo(32, by + 18, -30, by + 18, -38, by - 2); c.closePath(); };
  bodyP(); g.fill(CAMEL.coat);
  if (!g.out) { bodyP(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(-45, by + 4, 90, 20); c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); ell(c, 0, by - 34, 12, 4, 0); c.fill(); }); }
  // neck: low curve forward then up; head
  const nod = p.nod * 1.2;
  c.beginPath(); c.moveTo(26, by - 16); c.bezierCurveTo(44, by - 16, 50, by - 4, 56, by - 16); c.bezierCurveTo(60, by - 26, 58, by - 42, 64, by - 52); c.lineTo(74, by - 48); c.bezierCurveTo(68, by - 38, 70, by - 20, 66, by - 6); c.bezierCurveTo(60, by + 8, 42, by + 8, 30, by + 2); c.closePath(); g.fill(CAMEL.coat);
  c.save(); c.translate(68, by - 52); c.rotate(0.28 + nod);
  c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(4, -10, 17, -6); c.quadraticCurveTo(24, -4, 23, 2); c.quadraticCurveTo(22, 7, 16, 7); c.quadraticCurveTo(12, 10, 8, 8); c.quadraticCurveTo(0, 8, -8, 6); c.closePath(); g.fill(CAMEL.coat);
  c.beginPath(); c.moveTo(-6, -5); c.lineTo(-9, -12); c.lineTo(-2, -7); c.closePath(); g.fill(CAMEL.coat);
  if (!g.out) {
    g.dot(4, -2.5, 1.9, INK); g.line([1.5, -5, 6.5, -5], shade(CAMEL.coat, -0.4), 1.4);
    g.dot(20, -1, 1.1, shade(CAMEL.coat, -0.5)); g.line([14, 5, 22, 4], shade(CAMEL.coat, -0.45), 1.1);
    g.line([-6, 4, 6, 6, 14, -6], '#c8372d', 1.4);
  }
  c.restore();
  cLeg(g, 20, by + 10, ph, CAMEL.coat, true);
  cLeg(g, -26, by + 8, ph, CAMEL.coat, false);
  // saddle blanket with tassels on the hump
  const bl = () => { c.beginPath(); c.moveTo(-22, by - 26); c.quadraticCurveTo(0, by - 44, 22, by - 26); c.lineTo(20, by - 4); c.quadraticCurveTo(0, by + 1, -20, by - 4); c.closePath(); };
  bl(); g.fill(colOf(K.cloth ? K.cloth.col : 'team', tm));
  if (!g.out) {
    bl(); g.inside((c) => { c.fillStyle = PAL.gold; c.fillRect(-30, by - 9, 60, 4); c.fillStyle = shade(tm.main, -0.3); for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-16 + i * 8, by - 26); c.lineTo(-12 + i * 8, by - 20); c.lineTo(-16 + i * 8, by - 14); c.lineTo(-20 + i * 8, by - 20); c.closePath(); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(-30, by - 14, 60, 16); });
    c.fillStyle = PAL.gold; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-19 + i * 7.5, by - 3); c.lineTo(-17.5 + i * 7.5, by + 5); c.lineTo(-16 + i * 7.5, by - 3); c.closePath(); c.fill(); }
  }
  c.beginPath(); c.moveTo(-14, by - 40); c.quadraticCurveTo(-14, by - 50, -8, by - 49); c.quadraticCurveTo(0, by - 41, 8, by - 43); c.quadraticCurveTo(14, by - 51, 16, by - 43); c.quadraticCurveTo(2, by - 32, -14, by - 40); c.closePath(); g.fill(PAL.leather);
  riderSide(g, p, K, tm, by - 21 + p.hb * 0.3, 1);
}
function camelFB(g, p, K, front) {
  const c = g.c, tm = g.team;
  const ph = p.hph, walking = p.anim === 'walk';
  const lL = walking ? Math.max(0, Math.sin(ph)) * 7 : 0, lR = walking ? Math.max(0, -Math.sin(ph)) * 7 : 0;
  const by = -86 + p.hb;
  const leg = (x, lift, top, col) => { const bx = x * 1.2; c.beginPath(); taper(c, x, top, bx, -8 - lift, 14, 7.5); circ(c, lerp(x, bx, 0.5), top + (-8 - lift - top) * 0.52, 5.2); g.fill(col); c.beginPath(); ell(c, bx, -3 - lift, 8, 4); g.fill(CAMEL.pad); };
  const body = () => {
    c.beginPath(); c.moveTo(-28, by + 12); c.bezierCurveTo(-34, by - 8, -26, by - 22, -14, by - 25); c.bezierCurveTo(-11, by - 45, 11, by - 45, 14, by - 25); c.bezierCurveTo(26, by - 22, 34, by - 8, 28, by + 12); c.quadraticCurveTo(0, by + 22, -28, by + 12); c.closePath(); g.fill(CAMEL.coat);
    if (!g.out) { c.beginPath(); c.moveTo(-28, by + 12); c.bezierCurveTo(-34, by - 8, -26, by - 22, -14, by - 25); c.bezierCurveTo(-11, by - 45, 11, by - 45, 14, by - 25); c.bezierCurveTo(26, by - 22, 34, by - 8, 28, by + 12); c.quadraticCurveTo(0, by + 22, -28, by + 12); c.closePath(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(10, by - 50, 30, 80); }); }
    const bl = () => { c.beginPath(); c.moveTo(-24, by - 20); c.quadraticCurveTo(0, by - 40, 24, by - 20); c.lineTo(27, by); c.quadraticCurveTo(0, by + 7, -27, by); c.closePath(); };
    bl(); g.fill(colOf(K.cloth ? K.cloth.col : 'team', tm));
    if (!g.out) { bl(); g.inside((c) => { c.fillStyle = PAL.gold; c.fillRect(-30, by - 6, 60, 4); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(8, by - 40, 20, 50); }); c.fillStyle = PAL.gold; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-24 + i * 8, by + 1); c.lineTo(-22.5 + i * 8, by + 8); c.lineTo(-21 + i * 8, by + 1); c.closePath(); c.fill(); } }
  };
  if (front) {
    leg(-13, lR * 0.6 + 6, by + 10, shade(CAMEL.coat, -0.3)); leg(13, lL * 0.6 + 6, by + 10, shade(CAMEL.coat, -0.3));
    body();
    const rb = by - 22 + p.hb * 0.3;
    riderFBK(g, p, K, tm, rb, true);
    fArm(g, 13, rb - 45, 9, rb - 26, K.arm, K.hand, -1);
    // neck rising in front, head facing the viewer
    c.beginPath(); c.moveTo(-8, by + 4); c.quadraticCurveTo(-10, by - 20, -6, by - 34); c.lineTo(6, by - 34); c.quadraticCurveTo(10, by - 20, 8, by + 4); c.closePath(); g.fill(CAMEL.coat);
    const hy = by - 44;
    const head = () => { c.beginPath(); c.moveTo(-12, hy - 9); c.quadraticCurveTo(0, hy - 16, 12, hy - 9); c.quadraticCurveTo(14, hy + 7, 8.5, hy + 19); c.quadraticCurveTo(0, hy + 24, -8.5, hy + 19); c.quadraticCurveTo(-14, hy + 7, -12, hy - 9); c.closePath(); };
    c.beginPath(); poly(c, [-9, hy - 6, -15, hy - 12, -7, hy - 10]); poly(c, [9, hy - 6, 15, hy - 12, 7, hy - 10]); g.fill(CAMEL.coat);
    head(); g.fill(CAMEL.coat);
    if (!g.out) { g.dot(-6.5, hy - 1, 1.9, INK); g.dot(6.5, hy - 1, 1.9, INK); g.line([-8.5, hy - 3.5, -4.5, hy - 3.5], shade(CAMEL.coat, -0.4), 1.3); g.line([4.5, hy - 3.5, 8.5, hy - 3.5], shade(CAMEL.coat, -0.4), 1.3); g.dot(-3, hy + 13, 1.3, INK); g.dot(3, hy + 13, 1.3, INK); g.line([-9, hy + 7, 9, hy + 7], '#c8372d', 1.4); }
    leg(-11, lL, by + 14, CAMEL.coat); leg(11, lR, by + 14, CAMEL.coat);
    weaponFB(g, p, K, tm, rb, true);
  } else {
    leg(-12, lR * 0.6 + 6, by + 10, shade(CAMEL.coat, -0.3)); leg(12, lL * 0.6 + 6, by + 10, shade(CAMEL.coat, -0.3));
    c.beginPath(); ell(c, 0, by - 54, 7, 9); g.fill(CAMEL.coat);
    c.beginPath(); poly(c, [-5, by - 60, -9, by - 66, -2, by - 62]); poly(c, [5, by - 60, 9, by - 66, 2, by - 62]); g.fill(CAMEL.coat);
    leg(-13, lL, by + 14, CAMEL.coat); leg(13, lR, by + 14, CAMEL.coat);
    body();
    const sw = Math.sin(p.t * 3.2) * 2;
    c.beginPath(); c.moveTo(-3, by + 4); c.quadraticCurveTo(-5 + sw, by + 14, -3 + sw * 1.5, by + 24); c.lineTo(3 + sw * 1.5, by + 24); c.quadraticCurveTo(5 + sw, by + 14, 3, by + 4); c.closePath(); g.fill(CAMEL.hair);
    const rb = by - 22 + p.hb * 0.3;
    weaponFB(g, p, K, tm, rb, false, 'behind');
    riderFBK(g, p, K, tm, rb, false);
    weaponFB(g, p, K, tm, rb, false);
  }
}

/* ---------- unit definitions ---------- */
function defMounted(key, name, kit, extra) {
  const K = mkit(kit);
  const camel = kit.mount === 'camel';
  TROOPS[key] = Object.assign({
    name, shadowW: camel ? 30 : 34, h: camel ? 160 : 140, mounted: true, kitDef: K,
    pose: mountedPose(K),
    side(g, p) { if (camel) camelSide(g, p, K); else mountedSide(g, p, K); },
    front(g, p) { if (camel) camelFB(g, p, K, true); else mountedFB(g, p, K, true); },
    back(g, p) { if (camel) camelFB(g, p, K, false); else mountedFB(g, p, K, false); },
  }, extra || {});
}
// France: Royal Knight — lilies on the team colour, steel chanfron, lily crest
defMounted('royalKnight', 'Royal Knight', { capa: { arms: { field: '#00000000', semeLis: true } }, torso: { arms: { field: '#00000000', semeLis: true } }, chanfron: true, helm: 'crowned', crest: 'lis', plume: null, coat: '#6b4a3a' }, { special: true });
// Crusaders: Templar — white mantle, team-coloured cross, flat-topped great helm
defMounted('templar', 'Templar Knight', { capa: { arms: { field: 'argent', cross: 'team' }, trim: '#c9c1ac' }, torso: { arms: { field: 'argent', cross: 'team' } }, helm: 'great', plume: null, coat: '#e6dccb', mane: '#7c6a58', pennant: 'beauseant' }, { special: true });
// Ayyubids: Horse Archer — light horse, saddle cloth, turban helm, composite bow
defMounted('horseArcher', 'Horse Archer', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#9a6a44', mane: '#3b2517', legs: '#e7dcc2', boots: '#7a4a26', arm: '#e7dcc2', hand: PAL.skin, helm: 'turban', weapon: 'bow', plume: null });
// Ayyubids: Mameluke — camel rider with a curved sword
defMounted('mameluke', 'Mameluke', { mount: 'camel', cloth: { col: 'team' }, legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', weapon: 'scimitar', plume: null }, { special: true });

/* ---------- heroes and commanders (drawn larger, with personal heraldry) ---------- */
const HEROES = (RTW.HEROES = {
  blackPrince: { name: 'Edward, the Black Prince', side: 'england', kit: { capa: { arms: 'princePeace', trim: '#d9d2c4' }, torso: { arms: 'princePeace' }, helm: 'crowned', crest: 'blackFeathers', plume: null, coat: '#3a2a22', mane: '#1e1611', legs: '#4a4f58', boots: '#2e3238', arm: '#5a6068', hand: '#4a4f58', helmCol: '#6f7782', pennant: 'blackPrince' }, ability: 'Wins his spurs', abilityText: 'Charges the nearest enemy knights; nearby troops strike faster' },
  henryV: { name: 'Henry V', side: 'england', kit: { capa: { arms: 'royal' }, torso: { arms: 'royal' }, helm: 'crowned', crest: 'lion', plume: null, coat: '#f0ece2', mane: '#b9ab94', chanfron: true, pennant: 'royal' }, ability: "St Crispin's Day", abilityText: 'The whole army fights harder for 6 seconds' },
  derby: { name: 'Henry of Grosmont', side: 'england', kit: { capa: { arms: 'lancaster' }, torso: { arms: 'lancaster' }, helm: 'sugarloaf', plume: '#2f5fc4', coat: '#7a5236', pennant: 'lancaster' }, ability: 'Night march', abilityText: 'Your troops start the battle already charging' },
  bedford: { name: 'John, Duke of Bedford', side: 'england', kit: { capa: { arms: 'bedford' }, torso: { arms: 'bedford' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#5b3d2b', pennant: 'bedford' }, ability: 'Regent of France', abilityText: 'Archers regroup and shoot faster' },
  saladin: { name: 'Saladin', side: 'ayyubids', kit: { capa: null, cloth: { col: '#f2c22e', trim: '#b8312a' }, coat: '#d9d4c8', mane: '#8a8173', torso: '#f2c22e', belt: '#b8312a', legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', crown: true, weapon: 'scimitar', shield: { kind: 'round', col: '#f2c22e' } }, ability: 'Sultan of Egypt and Syria', abilityText: 'Heals nearby troops and steadies the line' },
  gokbori: { name: 'Gökböri', side: 'ayyubids', kit: { capa: null, cloth: { col: '#3a6fb0', trim: '#e2e8f0' }, coat: '#4b3b30', torso: '#3a6fb0', legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', cloth2: '#c9d6e8', weapon: 'bow' }, ability: 'Blue Wolf', abilityText: 'Horse archers loose a volley that slows knights' },
  adil: { name: 'al-Adil', side: 'ayyubids', kit: { capa: null, cloth: { col: '#2f8a4c', trim: PAL.gold }, coat: '#8a5a38', torso: '#2f8a4c', legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', weapon: 'scimitar', shield: { kind: 'round', col: '#2f8a4c' } }, ability: 'Two horses', abilityText: 'Sends fresh horses: your riders recover' },
  richard: { name: 'Richard the Lionheart', side: 'crusaders', kit: { capa: { arms: 'england' }, torso: { arms: 'england' }, helm: 'greatCrown', crest: 'lion', plume: null, coat: '#6b4a3a', chanfron: true, pennant: 'england' }, ability: 'Lionheart', abilityText: 'Toughest commander in the game; his crossbows reload faster' },
  johnII: { name: 'King John II', side: 'france', kit: { capa: { arms: 'franceAncient' }, torso: { arms: 'franceAncient' }, helm: 'greatCrown', crest: 'lis', plume: null, coat: '#efe9dc', mane: '#a8997e', chanfron: true, pennant: 'franceAncient' }, ability: 'The king fights on', abilityText: 'While he stands, French knights are fearless' },
  philipVI: { name: 'Philip VI', side: 'france', kit: { capa: { arms: 'franceAncient' }, torso: { arms: 'franceAncient' }, helm: 'crowned', crest: 'lis', plume: null, coat: '#5b3d2b', chanfron: true, pennant: 'franceAncient' }, ability: 'Oriflamme', abilityText: 'No quarter: French charges hit harder' },
  louisPoitiers: { name: 'Louis of Poitiers', side: 'france', kit: { capa: { arms: 'valentinois' }, torso: { arms: 'valentinois' }, helm: 'sugarloaf', plume: '#f2e8d0', coat: '#8a5a38', chanfron: true, pennant: 'valentinois' }, ability: 'Count of Valentinois', abilityText: 'Leads the siege of Auberoche' },
  douglas: { name: 'Earl of Douglas', side: 'france', kit: { capa: { arms: 'douglas' }, torso: { arms: 'douglas' }, helm: 'great', plume: null, crest: 'lion', coat: '#4b3b30', mane: '#2a1d16', pennant: 'douglas' }, ability: 'No quarter', abilityText: 'The Scots fight to the last' },
  albret: { name: "Constable d'Albret", side: 'france', kit: { capa: { arms: 'albret' }, torso: { arms: 'albret' }, helm: 'sugarloaf', plume: PAL.gold, coat: '#6b4a3a', chanfron: true, pennant: 'albret' }, ability: 'Constable of France', abilityText: 'Leads the dismounted men-at-arms' },
  guy: { name: 'Guy of Lusignan', side: 'crusaders', kit: { capa: { arms: 'lusignan' }, torso: { arms: 'lusignan' }, helm: 'greatCrown', plume: null, coat: '#8a5a38', pennant: 'jerusalem' }, ability: 'King of Jerusalem', abilityText: 'Rallies knights around the True Cross' },
  gerard: { name: 'Gerard de Ridefort', side: 'crusaders', kit: { capa: { arms: 'templar', trim: '#c9c1ac' }, torso: { arms: 'templar' }, helm: 'great', plume: null, coat: '#2b2320', mane: '#140f0c', pennant: 'beauseant' }, ability: 'Grand Master', abilityText: 'Templars charge without waiting' },
  raynald: { name: 'Raynald of Châtillon', side: 'crusaders', kit: { capa: { arms: 'chatillon' }, torso: { arms: 'chatillon' }, helm: 'great', plume: null, crest: null, coat: '#4b3b30', mane: '#2a1d16', pennant: 'chatillon' }, ability: 'Lord of Kerak', abilityText: 'His men-at-arms hit harder' },
  balian: { name: 'Balian of Ibelin', side: 'crusaders', kit: { capa: { arms: 'ibelin' }, torso: { arms: 'ibelin' }, helm: 'great', plume: null, coat: '#6b4a3a', pennant: 'ibelin' }, ability: 'Defender of Jerusalem', abilityText: 'Defenders get extra armour on the walls' },
});
for (const k in HEROES) defMounted('hero_' + k, HEROES[k].name, HEROES[k].kit, { hero: true });

/* ===== src/art/15b-mounted2.js ===== */
/* Roll to War: heroes and commanders of the Leper King, Joan of Arc and the Wars of the Roses.
   New helmet crests (the sun in splendour, the white boar, the bear and ragged staff, the red dragon,
   the de Vere star), a bare-headed rider, and Joan's standard. */

function starPath(c, x, y, r, n = 5, inner = 0.45, rot = -Math.PI / 2) {
  c.moveTo(x + Math.cos(rot) * r, y + Math.sin(rot) * r);
  for (let i = 1; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr2 = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  c.closePath();
}
// crests stand on the helm: (x, y) = the top of the helm; side = true for the side view (facing +x)
const CRESTS = {
  sun(g, x, y) {
    const c = g.c, cy = y - 10;
    c.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.moveTo(x + Math.cos(a - 0.14) * 6.5, cy + Math.sin(a - 0.14) * 6.5); c.lineTo(x + Math.cos(a) * 13, cy + Math.sin(a) * 13); c.lineTo(x + Math.cos(a + 0.14) * 6.5, cy + Math.sin(a + 0.14) * 6.5); } circ(c, x, cy, 7.5);
    g.fill(PAL.gold);
    if (!g.out) { g.dot(x, cy, 4, PAL.goldL); g.dot(x - 1.2, cy - 1.2, 1.5, '#fff6d0'); }
  },
  star(g, x, y) {
    const c = g.c; c.beginPath(); starPath(c, x, y - 11, 12, 5, 0.44); g.fill('#f4f1e8');
    if (!g.out) { c.save(); c.globalAlpha = 0.5; c.beginPath(); starPath(c, x, y - 11, 5, 5, 0.44); c.fillStyle = '#ffffff'; c.fill(); c.restore(); }
  },
  boar(g, x, y, side) {
    const c = g.c, col = '#f4f1e8';
    if (side) {
      c.beginPath();
      ell(c, x - 1, y - 9, 11, 6.5);
      c.moveTo(x + 7, y - 14); c.lineTo(x + 17, y - 8); c.lineTo(x + 16, y - 4); c.lineTo(x + 6, y - 5); c.closePath();
      c.rect(x - 9, y - 5, 3.4, 6); c.rect(x + 3, y - 5, 3.4, 6);
      c.moveTo(x - 9, y - 13); c.lineTo(x - 7, y - 19); c.lineTo(x - 4, y - 15); c.lineTo(x - 1, y - 20); c.lineTo(x + 2, y - 15); c.lineTo(x + 5, y - 18); c.lineTo(x + 6, y - 12); c.closePath();
      g.fill(col);
      if (!g.out) { g.dot(x + 9, y - 11, 1.1, INK); g.line([x + 13, y - 6, x + 11, y - 10], PAL.gold, 1.4); }
    } else {
      c.beginPath(); ell(c, x, y - 9, 9, 8); c.moveTo(x - 7, y - 14); c.lineTo(x - 10, y - 20); c.lineTo(x - 3, y - 16); c.moveTo(x + 7, y - 14); c.lineTo(x + 10, y - 20); c.lineTo(x + 3, y - 16);
      g.fill(col);
      if (!g.out) { c.beginPath(); ell(c, x, y - 5, 4, 3); c.fillStyle = '#e6c9b8'; c.fill(); g.dot(x - 4, y - 11, 1.1, INK); g.dot(x + 4, y - 11, 1.1, INK); g.line([x - 5, y - 3, x - 7, y - 7], PAL.gold, 1.3); g.line([x + 5, y - 3, x + 7, y - 7], PAL.gold, 1.3); }
    }
  },
  bear(g, x, y, side) {
    const c = g.c, col = '#f4f1e8';
    // the ragged staff, upright beside the bear, and the bear sitting up to clasp it
    c.beginPath(); c.rect(x + 6, y - 30, 3.6, 30); c.rect(x + 9.6, y - 24, 3.4, 3); c.rect(x + 2.6, y - 14, 3.4, 3); g.fill(col);
    c.beginPath(); ell(c, x - 2, y - 9, 7, 9); circ(c, x, y - 20, 5.5); circ(c, x - 4, y - 25, 2.2); circ(c, x + 3, y - 25, 2.2);
    if (side) { c.moveTo(x + 3, y - 22); c.lineTo(x + 9, y - 19.5); c.lineTo(x + 4, y - 16.5); c.closePath(); }
    g.fill(col);
    if (!g.out) { g.dot(side ? x + 2 : x - 2, y - 21, 1, INK); if (!side) g.dot(x + 2, y - 21, 1, INK); g.line([x - 5, y - 15, x + 4, y - 13], PAL.gold, 1.2); }
  },
  dragon(g, x, y, side) {
    const c = g.c, col = '#d63c31';
    c.beginPath();
    if (side) {
      c.moveTo(x - 12, y - 2); c.bezierCurveTo(x - 10, y - 10, x + 4, y - 12, x + 7, y - 8); c.lineTo(x + 11, y - 17); c.lineTo(x + 17, y - 16); c.lineTo(x + 15, y - 13); c.lineTo(x + 18, y - 11); c.lineTo(x + 12, y - 10);
      c.bezierCurveTo(x + 10, y - 6, x + 10, y - 2, x + 6, y); c.closePath();
      c.moveTo(x - 4, y - 9); c.lineTo(x - 12, y - 24); c.lineTo(x - 6, y - 20); c.lineTo(x - 2, y - 27); c.lineTo(x + 1, y - 19); c.lineTo(x + 4, y - 10); c.closePath();
      c.moveTo(x - 11, y - 3); c.quadraticCurveTo(x - 20, y - 4, x - 18, y - 12); c.lineTo(x - 15, y - 10); c.quadraticCurveTo(x - 16, y - 6, x - 10, y - 6); c.closePath();
    } else {
      c.moveTo(x - 4, y); c.quadraticCurveTo(x - 6, y - 12, x, y - 15); c.quadraticCurveTo(x + 6, y - 12, x + 4, y); c.closePath();
      c.moveTo(x - 3, y - 8); c.lineTo(x - 16, y - 22); c.lineTo(x - 10, y - 18); c.lineTo(x - 9, y - 25); c.lineTo(x - 1, y - 13); c.closePath();
      c.moveTo(x + 3, y - 8); c.lineTo(x + 16, y - 22); c.lineTo(x + 10, y - 18); c.lineTo(x + 9, y - 25); c.lineTo(x + 1, y - 13); c.closePath();
      c.moveTo(x - 4, y - 14); c.lineTo(x - 3, y - 20); c.lineTo(x + 3, y - 20); c.lineTo(x + 4, y - 14); c.closePath();
    }
    g.fill(col);
    if (!g.out && side) g.dot(x + 13, y - 14, 1, INK);
  },
};
// Joan rode bareheaded in the pictures of her; her hair was cut short and round
function bareHairSide(g, hx, hy, col) {
  const c = g.c; c.beginPath();
  c.moveTo(hx + 13, hy - 5); c.quadraticCurveTo(hx + 12, hy - 17.5, hx, hy - 17.5); c.quadraticCurveTo(hx - 17, hy - 17, hx - 17, hy + 1);
  c.lineTo(hx - 15, hy + 11); c.quadraticCurveTo(hx - 9, hy + 12, hx - 6, hy + 6); c.quadraticCurveTo(hx - 4, hy - 4, hx + 13, hy - 5); c.closePath();
  g.fill(col);
}
function bareHairFront(g, hy, col) {
  const c = g.c; c.beginPath();
  c.moveTo(-16, hy + 6); c.quadraticCurveTo(-17, hy - 17.5, 0, hy - 17.5); c.quadraticCurveTo(17, hy - 17.5, 16, hy + 6);
  c.lineTo(13, hy - 3); c.quadraticCurveTo(0, hy - 7, -13, hy - 3); c.closePath();
  g.fill(col);
}
// a standard hanging from its lance: attached at (x, y) on a pole of angle a, streaming behind (side 1) or the other way
function bannerFlag(g, x, y, a, key, t, wave = 1, side = 1) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.scale(side, 1);
  const wv = (u) => Math.sin(u * 4.5 - t * 6 * wave) * 3.2 * u;
  const path = () => { c.beginPath(); c.moveTo(0, 0); for (let i = 1; i <= 8; i++) { const u = i / 8; c.lineTo(-46 * u, wv(u) + u * 3); } c.lineTo(-40, 17 + wv(1)); c.lineTo(-46, 34 + wv(1)); for (let i = 8; i >= 0; i--) { const u = i / 8; c.lineTo(-46 * u, 34 + wv(u) - u * 2); } c.closePath(); };
  path(); g.fill('#f7f3ea');
  if (!g.out) {
    path(); g.inside((c) => { HER.paint(c, key, -48, -4, 50, 42, { detail: g.detail >= 2 }); const fg = c.createLinearGradient(-46, 0, 0, 0); for (let i = 0; i <= 4; i++) fg.addColorStop(i / 4, Math.sin(i * 1.2 - t * 6 * wave) > 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)'); c.fillStyle = fg; c.fillRect(-48, -6, 50, 46); });
  }
  c.restore();
}

/* ---------- the new heroes and commanders ---------- */
const WHITE_ARMOUR = { torso: '#e3e8ee', arm: '#e3e8ee', hand: '#c9d0d8', legs: '#cdd4dc', boots: '#96a0ac' };
const NEW_HEROES = {
  // the Leper King: the Kingdom of Jerusalem and Saladin's family
  baldwin: { name: 'Baldwin IV', side: 'crusaders', kit: { capa: { arms: 'jerusalem', trim: PAL.gold }, torso: { arms: 'jerusalem' }, helm: 'crowned', plume: null, coat: '#efe9dc', mane: '#b9ab94', pennant: 'jerusalem' } },
  odo: { name: 'Odo of St Amand', side: 'crusaders', kit: { capa: { arms: 'templar', trim: '#c9c1ac' }, torso: { arms: 'templar' }, helm: 'great', plume: null, coat: '#8a8278', mane: '#4a443e', pennant: 'beauseant' } },
  raymond: { name: 'Raymond of Tripoli', side: 'crusaders', kit: { capa: { arms: 'tripoli' }, torso: { arms: 'tripoli' }, helm: 'great', plume: null, coat: '#6b4a3a', mane: '#2a1d16', pennant: 'tripoli' } },
  castellan: { name: 'The Templar castellan', side: 'crusaders', kit: { capa: { arms: 'templar', trim: '#c9c1ac' }, torso: { arms: 'templar' }, helm: 'great', plume: null, coat: '#d9d2c0', mane: '#8a8173', pennant: 'beauseant' } },
  taqi: { name: 'Taqi ad-Din', side: 'ayyubids', kit: { capa: null, cloth: { col: '#2f5fc4', trim: PAL.gold }, coat: '#c9b9a0', mane: '#6a5a48', torso: '#2f5fc4', legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', weapon: 'scimitar', shield: { kind: 'round', col: '#2f5fc4' } } },
  farrukh: { name: 'Farrukh-Shah', side: 'ayyubids', kit: { capa: null, cloth: { col: '#b8312a', trim: PAL.gold }, coat: '#5a3a28', mane: '#241810', torso: '#b8312a', legs: '#e7dcc2', boots: '#7a4a26', arm: PAL.mail, hand: PAL.skin, helm: 'turban', cloth2: '#efe6d2', weapon: 'bow' } },
  // Joan of Arc: the Dauphin's captains, the English and the Burgundians
  joan: { name: 'Joan of Arc', side: 'france', kit: Object.assign({ capa: { arms: 'joanStandard', trim: PAL.gold }, helm: 'bare', hair: '#2e2016', coat: '#2b2320', mane: '#120d0a', weapon: 'banner', banner: 'joanStandard' }, WHITE_ARMOUR) },
  dunois: { name: 'The Bastard of Orléans', side: 'france', kit: { capa: { arms: 'dunois' }, torso: { arms: 'dunois' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#6b4a3a', pennant: 'dunois' } },
  alencon: { name: "The Duke of Alençon", side: 'france', kit: { capa: { arms: 'alencon' }, torso: { arms: 'alencon' }, helm: 'sugarloaf', plume: '#c8372d', coat: '#efe9dc', mane: '#b9ab94', chanfron: true, pennant: 'alencon' } },
  lahire: { name: 'La Hire', side: 'france', kit: { capa: { arms: 'lahire' }, torso: { arms: 'lahire' }, helm: 'sugarloaf', plume: '#f2be4b', coat: '#8a5a38', mane: '#3b2517', pennant: 'lahire' } },
  xaintrailles: { name: 'Poton de Xaintrailles', side: 'france', kit: { capa: { arms: 'xaintrailles' }, torso: { arms: 'xaintrailles' }, helm: 'sugarloaf', plume: '#c8372d', coat: '#4b3b30', mane: '#1e1611', pennant: 'xaintrailles' } },
  glasdale: { name: 'William Glasdale', side: 'england', kit: { capa: { arms: 'stGeorge' }, torso: { arms: 'stGeorge' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#7a5236', pennant: 'stGeorge' } },
  suffolk: { name: 'The Earl of Suffolk', side: 'england', kit: { capa: { arms: 'suffolk' }, torso: { arms: 'suffolk' }, helm: 'sugarloaf', plume: '#f2be4b', coat: '#5b3d2b', chanfron: true, pennant: 'suffolk' } },
  talbot: { name: 'Lord Talbot', side: 'england', kit: { capa: { arms: 'talbot' }, torso: { arms: 'talbot' }, helm: 'sugarloaf', plume: '#f2be4b', coat: '#efe9dc', mane: '#b9ab94', chanfron: true, pennant: 'talbot' } },
  fastolf: { name: 'Sir John Fastolf', side: 'england', kit: { capa: { arms: 'fastolf' }, torso: { arms: 'fastolf' }, helm: 'sugarloaf', plume: '#2f5fc4', coat: '#8a5a38', pennant: 'fastolf' } },
  lisleadam: { name: "Jean de l'Isle-Adam", side: 'burgundy', kit: { capa: { arms: 'lisleadam' }, torso: { arms: 'lisleadam' }, helm: 'sugarloaf', plume: '#2f5fc4', coat: '#6b4a3a', pennant: 'burgundyCross' } },
  luxembourg: { name: 'John of Luxembourg', side: 'burgundy', kit: { capa: { arms: 'luxembourg' }, torso: { arms: 'luxembourg' }, helm: 'sugarloaf', plume: '#c8372d', coat: '#4b3b30', mane: '#1e1611', pennant: 'burgundyCross' } },
  // the Wars of the Roses
  edwardMarch: { name: 'Edward, Earl of March', side: 'york', kit: { capa: { arms: 'whiteRose' }, torso: { arms: 'whiteRose' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#efe9dc', mane: '#b9ab94', chanfron: true, pennant: 'whiteRose' } },
  edward: { name: 'Edward IV', side: 'york', kit: { capa: { arms: 'sunne' }, torso: { arms: 'royal' }, helm: 'crowned', crest: 'sun', plume: null, coat: '#efe9dc', mane: '#b9ab94', chanfron: true, pennant: 'sunne' } },
  fauconberg: { name: 'Lord Fauconberg', side: 'york', kit: { capa: { arms: 'neville' }, torso: { arms: 'neville' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#6b4a3a', pennant: 'neville' } },
  gloucester: { name: 'Richard of Gloucester', side: 'york', kit: { capa: { arms: 'boarBadge' }, torso: { arms: 'boarBadge' }, helm: 'sugarloaf', crest: 'boar', plume: null, coat: '#4b3b30', mane: '#1e1611', pennant: 'boarBadge' } },
  richard3: { name: 'Richard III', side: 'york', kit: { capa: { arms: 'royal' }, torso: { arms: 'royal' }, helm: 'crowned', crest: 'boar', plume: null, coat: '#efe9dc', mane: '#b9ab94', chanfron: true, pennant: 'boarBadge' } },
  jasper: { name: 'Jasper Tudor', side: 'lancaster', kit: { capa: { arms: 'jasper' }, torso: { arms: 'jasper' }, helm: 'sugarloaf', plume: '#2f8a4c', coat: '#6b4a3a', pennant: 'jasper' } },
  owen: { name: 'Owen Tudor', side: 'lancaster', kit: { capa: { arms: 'owenTudor' }, torso: { arms: 'owenTudor' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#8a8278', mane: '#4a443e', pennant: 'owenTudor' } },
  somerset: { name: 'The Duke of Somerset', side: 'lancaster', kit: { capa: { arms: 'somerset' }, torso: { arms: 'somerset' }, helm: 'sugarloaf', plume: '#2f5fc4', coat: '#5b3d2b', pennant: 'portcullis' } },
  northumberland: { name: 'The Earl of Northumberland', side: 'lancaster', kit: { capa: { arms: 'percy' }, torso: { arms: 'percy' }, helm: 'sugarloaf', plume: '#f2be4b', coat: '#7a5236', pennant: 'percy' } },
  warwick: { name: 'The Earl of Warwick', side: 'lancaster', kit: { capa: { arms: 'warwick' }, torso: { arms: 'warwick' }, helm: 'sugarloaf', crest: 'bear', plume: null, coat: '#2b2320', mane: '#120d0a', chanfron: true, pennant: 'warwick' } },
  montagu: { name: 'Marquess Montagu', side: 'lancaster', kit: { capa: { arms: 'neville' }, torso: { arms: 'neville' }, helm: 'sugarloaf', plume: '#f6f2e6', coat: '#6b4a3a', pennant: 'neville' } },
  somersetE: { name: 'The Duke of Somerset', side: 'lancaster', kit: { capa: { arms: 'somerset' }, torso: { arms: 'somerset' }, helm: 'sugarloaf', plume: '#f2be4b', coat: '#8a5a38', pennant: 'portcullis' } },
  princeEdward: { name: 'Edward of Westminster', side: 'lancaster', kit: { capa: { arms: 'princeWales' }, torso: { arms: 'princeWales' }, helm: 'crowned', plume: null, crest: 'feathers', coat: '#efe9dc', mane: '#b9ab94', pennant: 'princeWales' } },
  henryTudor: { name: 'Henry Tudor', side: 'tudor', kit: { capa: { arms: 'tudorDragon' }, torso: { arms: 'tudorDragon' }, helm: 'sugarloaf', crest: 'dragon', plume: null, coat: '#6b4a3a', pennant: 'tudorDragon' } },
  oxfordT: { name: 'The Earl of Oxford', side: 'tudor', kit: { capa: { arms: 'oxford' }, torso: { arms: 'oxford' }, helm: 'sugarloaf', crest: 'star', plume: null, coat: '#4b3b30', mane: '#1e1611', pennant: 'oxfordStar' } },
};
Object.assign(HEROES, NEW_HEROES);
for (const k in NEW_HEROES) defMounted('hero_' + k, NEW_HEROES[k].name, NEW_HEROES[k].kit, { hero: true });
// a leader who is a hero in one campaign and a commander in another rides the same horse
for (const [a, b] of [['saladinE', 'saladin'], ['adilE', 'adil'], ['balianH', 'balian'], ['raynaldH', 'raynald']]) { HEROES[a] = HEROES[b]; TROOPS['hero_' + a] = TROOPS['hero_' + b]; }

/* ===== src/art/16-ships.js ===== */
/* Roll to War: ships — oblique 3D vector ships drawn in the sticker style.
   Local frame: u along the keel (+u = bow), v across (+v = starboard), z up (0 = waterline).
   heading: 0 = sailing right (east), PI/2 = down the screen. 100 units = `size` pixels. */
const SHIPCAM = (RTW.SHIPCAM = { game: { gy: 0.56, gz: 0.83 }, profile: { gy: 0.3, gz: 0.95 }, high: { gy: 0.72, gz: 0.69 } });
const SHIPS = (RTW.SHIPS = {});
const WD = {
  hull: '#8a5a33', hullD: '#6a4225', hullL: '#a97245', deck: '#c8955a', deckD: '#a87a45', dark: '#3b2a1f', black: '#2e2622',
  roof: '#4b4038', roofL: '#6a5b4f', sail: '#f1e7cf', sailD: '#d6c6a2', mat: '#c9964f', matD: '#9c7036', rope: '#6b5238',
  lacquer: '#2f2825', lacquerL: '#4a403a', plaster: '#efe6d2', jade: '#2f8a73', cinnabar: '#c8452d',
};

/* ---------- projection + display list ---------- */
function shipCtx(c, o) {
  const s = (o.size || 100) / 100, cam = o.cam || SHIPCAM.game;
  const h = o.heading || 0, ch = Math.cos(h), sh = Math.sin(h);
  const roll = o.roll || 0, cr = Math.cos(roll), sr = Math.sin(roll);
  const pitch = o.pitch || 0, cp = Math.cos(pitch), sp = Math.sin(pitch);
  const sink = o.sink || 0, bob = o.bob || 0;
  const P = (u, v, z) => {
    const u1 = u * cp - z * sp, z1 = u * sp + z * cp;
    const v1 = v * cr - z1 * sr;
    let z2 = v * sr + z1 * cr - sink + bob;
    if (sink > 0 && z2 < 0) z2 = 0;
    const wx = u1 * ch - v1 * sh, wy = u1 * sh + v1 * ch;
    return [o.x + wx * s, o.y + wy * s * cam.gy - z2 * s * cam.gz, wy * cam.gz + z2 * cam.gy];
  };
  // screen vector of a local direction (for emblems / billboards)
  const V = (du, dv, dz) => { const a = P(du, dv, dz), b = P(0, 0, 0); return [a[0] - b[0], a[1] - b[1]]; };
  return { c, s, cam, h, ch, sh, P, V, list: [], o, t: o.t || 0, team: TEAMS[o.team || 'blue'] || TEAMS.blue, near: ch >= 0 ? 1 : -1 };
}
function sAdd(S, it) { S.list.push(it); return it; }
const gdep = (S, u, v) => S.P(u, v || 0, 0)[2];
function sPoly(S, pts3, col, layer, o = {}) {
  const pts = pts3.map((p) => S.P(p[0], p[1], p[2]));
  const depth = pts.reduce((a, p) => a + p[2], 0) / pts.length;
  return sAdd(S, { k: 'poly', pts, col, layer, group: o.group == null ? depth + (o.bias || 0) : o.group, depth: depth + (o.bias || 0), line: o.line, det: o.det });
}
function sStroke(S, pts3, w, col, layer, o = {}) {
  const pts = pts3.map((p) => S.P(p[0], p[1], p[2]));
  const depth = pts.reduce((a, p) => a + p[2], 0) / pts.length;
  return sAdd(S, { k: 'stroke', pts, w: w * S.s, col, layer, group: o.group == null ? depth : o.group, depth: depth + (o.bias || 0), curve: o.curve });
}
function sCustom(S, layer, group, depth, fn) { return sAdd(S, { k: 'custom', layer, group, depth, fn }); }
function polyPath(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
function renderShipList(c, S, detail) {
  const L = S.list.slice().sort((a, b) => a.layer - b.layer || a.group - b.group || a.depth - b.depth);
  const lw = Math.max(0.9, 0.55 + S.s * 1.1);
  const g = new Painter(c, lw, detail); g.team = S.team; g.S = S;
  c.lineJoin = 'round'; c.lineCap = 'round';
  for (const mode of ['outline', 'fill']) {
    g.mode = mode;
    for (const it of L) {
      if (it.k === 'poly') {
        polyPath(c, it.pts); g.fill(it.col, it.line);
        if (mode === 'fill' && it.det) { polyPath(c, it.pts); g.inside((cc) => it.det(cc, it)); }
      } else if (it.k === 'stroke') {
        c.beginPath(); c.moveTo(it.pts[0][0], it.pts[0][1]);
        if (it.curve && it.pts.length === 3) c.quadraticCurveTo(it.pts[1][0], it.pts[1][1], it.pts[2][0], it.pts[2][1]);
        else for (let i = 1; i < it.pts.length; i++) c.lineTo(it.pts[i][0], it.pts[i][1]);
        if (mode === 'outline') { c.lineWidth = it.w + lw * 2; c.strokeStyle = INK; c.stroke(); }
        else { c.lineWidth = it.w; c.strokeStyle = it.col; c.stroke(); }
      } else if (it.k === 'custom') it.fn(g, c);
    }
  }
}

/* ---------- builders ---------- */
function stationW(st, u) {
  // interpolate half-width at deck and deck height along the stations
  for (let i = 0; i < st.length - 1; i++) {
    const a = st[i], b = st[i + 1];
    if (u >= a[0] && u <= b[0]) { const k = (u - a[0]) / (b[0] - a[0]); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
  }
  const e = u < st[0][0] ? st[0] : st[st.length - 1];
  return [e[1], e[2], e[3]];
}
function hull(S, st, o = {}) {
  const n = st.length, col = o.col || WD.hull, band = o.band || null, P = S.P;
  const plankDet = (cc, it) => {
    cc.strokeStyle = 'rgba(40,20,8,0.28)'; cc.lineWidth = Math.max(0.6, S.s * 0.9);
    const [a, b, d, e] = it.pts; // water0, water1, deck1, deck0
    for (let k = 1; k < 4; k++) { const f = k / 4; cc.beginPath(); cc.moveTo(lerp(a[0], e[0], f), lerp(a[1], e[1], f)); cc.lineTo(lerp(b[0], d[0], f), lerp(b[1], d[1], f)); cc.stroke(); }
    if (band) { cc.fillStyle = band; cc.beginPath(); cc.moveTo(e[0], e[1]); cc.lineTo(d[0], d[1]); cc.lineTo(lerp(b[0], d[0], 0.78), lerp(b[1], d[1], 0.78)); cc.lineTo(lerp(a[0], e[0], 0.78), lerp(a[1], e[1], 0.78)); cc.closePath(); cc.fill(); }
    cc.fillStyle = 'rgba(0,0,0,0.12)'; cc.beginPath(); cc.moveTo(a[0], a[1]); cc.lineTo(b[0], b[1]); cc.lineTo(lerp(b[0], d[0], 0.3), lerp(b[1], d[1], 0.3)); cc.lineTo(lerp(a[0], e[0], 0.3), lerp(a[1], e[1], 0.3)); cc.closePath(); cc.fill();
  };
  for (let i = 0; i < n - 1; i++) {
    const [u0, wd0, ww0, z0] = st[i], [u1, wd1, ww1, z1] = st[i + 1];
    for (const sd of [1, -1]) sPoly(S, [[u0, sd * ww0, 0], [u1, sd * ww1, 0], [u1, sd * wd1, z1], [u0, sd * wd0, z0]], sd === S.near ? col : shade(col, -0.18), 1, { det: plankDet });
  }
  const [us, wds, wws, zs] = st[0], [ub, wdb, wwb, zb] = st[n - 1];
  if (wds > 0.5) sPoly(S, [[us, -wws, 0], [us, wws, 0], [us, wds, zs], [us, -wds, zs]], o.sternCol || WD.hullD, 1, { det: plankDet });
  if (wdb > 0.5) sPoly(S, [[ub, -wwb, 0], [ub, wwb, 0], [ub, wdb, zb], [ub, -wdb, zb]], o.bowCol || WD.hullD, 1, { det: plankDet });
  const deck = [];
  for (let i = 0; i < n; i++) deck.push([st[i][0], st[i][1], st[i][3]]);
  for (let i = n - 1; i >= 0; i--) deck.push([st[i][0], -st[i][1], st[i][3]]);
  if (o.deck !== false) sPoly(S, deck, o.deckCol || WD.deck, 1, { bias: 1e5, det: (cc, it) => { cc.strokeStyle = 'rgba(80,45,15,0.22)'; cc.lineWidth = Math.max(0.6, S.s * 0.8); const um = st[0][0], uM = st[n - 1][0]; for (let v = -30; v <= 30; v += 5) { const a = P(um, v, st[0][3]), b = P(uM, v, st[n - 1][3]); cc.beginPath(); cc.moveTo(a[0], a[1]); cc.lineTo(b[0], b[1]); cc.stroke(); } } });
  // gun ports on both sides (only near side shows; far is under the deck)
  if (o.ports) for (const [u, zp] of o.ports) {
    const [wd, ww] = stationW(st, u), w = lerp(ww, wd, zp / (stationW(st, u)[2] || 10)) + 0.4;
    for (const sd of [1, -1]) sPoly(S, [[u - 1.8, sd * w, zp - 1.8], [u + 1.8, sd * w, zp - 1.8], [u + 1.8, sd * w, zp + 1.8], [u - 1.8, sd * w, zp + 1.8]], WD.black, 1, { bias: 1e4 });
  }
  return deck;
}
/* rectangular block (deck house, castle): u0..u1, v half-width vw (or [vw0, vw1] for tapering), z0..z1 */
function block(S, u0, u1, vw, z0, z1, col, o = {}) {
  const topCol = o.top || shade(col, 0.12), grp = o.group != null ? o.group : gdep(S, (u0 + u1) / 2, 0);
  const inset = o.inset || 0;
  const q = [[u0, -vw, u0 + inset, -vw + inset], [u1, -vw, u1 - inset, -vw + inset], [u1, vw, u1 - inset, vw - inset], [u0, vw, u0 + inset, vw - inset]];
  const det = o.det;
  for (let i = 0; i < 4; i++) {
    const A = q[i], B = q[(i + 1) % 4];
    const face = [[A[0], A[1], z0], [B[0], B[1], z0], [B[2], B[3], z1], [A[2], A[3], z1]];
    const side = i === 0 ? -1 : i === 2 ? 1 : 0;
    sPoly(S, face, side === 0 ? shade(col, -0.22) : side === S.near ? col : shade(col, -0.12), o.layer || 3, { group: grp, det: det ? (cc, it) => det(cc, it, i) : null });
  }
  if (o.roofless) return;
  sPoly(S, [[u0 + inset, -vw + inset, z1], [u1 - inset, -vw + inset, z1], [u1 - inset, vw - inset, z1], [u0 + inset, vw - inset, z1]], topCol, o.layer || 3, { group: grp, bias: 1e4, det: o.topDet });
}
/* hip roof over u0..u1, half-width vw, eaves at z0, ridge at z1 (ridge shorter by r) */
function hipRoof(S, u0, u1, vw, z0, z1, col, o = {}) {
  const grp = o.group != null ? o.group : gdep(S, (u0 + u1) / 2, 0), r = o.ridgeIn == null ? (u1 - u0) * 0.3 : o.ridgeIn, ov = o.over || 2;
  const E = [[u0 - ov, -vw - ov], [u1 + ov, -vw - ov], [u1 + ov, vw + ov], [u0 - ov, vw + ov]];
  const R0 = [u0 + r, 0, z1], R1 = [u1 - r, 0, z1];
  const faces = [
    [[E[0][0], E[0][1], z0], [E[1][0], E[1][1], z0], R1, R0],
    [[E[1][0], E[1][1], z0], [E[2][0], E[2][1], z0], R1],
    [[E[2][0], E[2][1], z0], [E[3][0], E[3][1], z0], R0, R1],
    [[E[3][0], E[3][1], z0], [E[0][0], E[0][1], z0], R0],
  ];
  faces.forEach((f, i) => sPoly(S, f, i % 2 ? shade(col, -0.15) : i === 2 ? col : shade(col, -0.06), o.layer || 3, { group: grp, bias: 2e4, det: o.tiles ? (cc, it) => { cc.strokeStyle = 'rgba(255,255,255,0.18)'; cc.lineWidth = Math.max(0.6, S.s); const [a, b, d, e] = it.pts; if (!e) return; for (let k = 1; k < 5; k++) { const f2 = k / 5; cc.beginPath(); cc.moveTo(lerp(a[0], b[0], f2), lerp(a[1], b[1], f2)); cc.lineTo(lerp(e[0], d[0], f2), lerp(e[1], d[1], f2)); cc.stroke(); } } : null }));
  if (o.finials) { for (const R of [R0, R1]) sCustom(S, o.layer || 3, grp, 1e6, (g) => { const p = S.P(R[0], R[1], R[2]); const c = g.c; c.beginPath(); c.moveTo(p[0] - 3 * S.s, p[1]); c.quadraticCurveTo(p[0], p[1] - 9 * S.s, p[0] + 3 * S.s, p[1] - 5 * S.s); c.closePath(); g.fill(PAL.gold); }); }
}
/* low wall along the deck edge (parapet / shield wall): pts = list of [u, v]; crenel = notch size */
function wall(S, pts, z0, h, col, o = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ua, va] = pts[i], [ub, vb] = pts[i + 1];
    const mid = S.P((ua + ub) / 2, (va + vb) / 2, z0);
    const nearWall = mid[2] > S.P(0, 0, z0)[2] + 0.01; // closer to the camera than the deck centre
    const layer = nearWall ? 6 : 2.5;
    sPoly(S, [[ua, va, z0], [ub, vb, z0], [ub, vb, z0 + h], [ua, va, z0 + h]], nearWall ? col : shade(col, -0.2), layer, {
      group: mid[2], det: (cc, it) => {
        const [a, b, d, e] = it.pts;
        if (o.loops) { cc.fillStyle = 'rgba(20,12,6,0.75)'; const n = Math.max(1, Math.round(Math.hypot(ub - ua, vb - va) / (o.loops))); for (let k = 0; k < n; k++) { const f = (k + 0.5) / n, x = lerp(lerp(a[0], b[0], f), lerp(e[0], d[0], f), 0.45), y = lerp(lerp(a[1], b[1], f), lerp(e[1], d[1], f), 0.45); cc.fillRect(x - 0.9 * S.s * 1.4, y - 1.6 * S.s * 1.4, 1.8 * S.s * 1.4, 3.2 * S.s * 1.4); } }
        if (o.trim) { cc.fillStyle = o.trim; cc.beginPath(); cc.moveTo(e[0], e[1]); cc.lineTo(d[0], d[1]); cc.lineTo(lerp(b[0], d[0], 0.78), lerp(b[1], d[1], 0.78)); cc.lineTo(lerp(a[0], e[0], 0.78), lerp(a[1], e[1], 0.78)); cc.closePath(); cc.fill(); }
        if (o.boards) { cc.strokeStyle = 'rgba(40,20,8,0.3)'; cc.lineWidth = Math.max(0.6, S.s * 0.8); const n = Math.max(1, Math.round(Math.hypot(ub - ua, vb - va) / o.boards)); for (let k = 1; k < n; k++) { const f = k / n; cc.beginPath(); cc.moveTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); cc.lineTo(lerp(e[0], d[0], f), lerp(e[1], d[1], f)); cc.stroke(); } }
      },
    });
    if (o.crenel) {
      const n = Math.max(1, Math.round(Math.hypot(ub - ua, vb - va) / o.crenel));
      for (let k = 0; k < n; k += 2) {
        const f0 = k / n, f1 = Math.min(1, (k + 1) / n);
        const A = [lerp(ua, ub, f0), lerp(va, vb, f0)], B = [lerp(ua, ub, f1), lerp(va, vb, f1)];
        sPoly(S, [[A[0], A[1], z0 + h], [B[0], B[1], z0 + h], [B[0], B[1], z0 + h + o.crenelH], [A[0], A[1], z0 + h + o.crenelH]], nearWall ? col : shade(col, -0.2), layer, { group: mid[2], bias: 0.001 });
      }
    }
  }
}
function ringPts(u0, u1, vw, vb, bowU, sternU) {
  // closed outline around a deck: stern corners, sides, bow point(s)
  return [[u0, -vw], [u1, -vw], [bowU == null ? u1 : bowU, vb == null ? -vw : -vb], [bowU == null ? u1 : bowU, vb == null ? vw : vb], [u1, vw], [u0, vw], [sternU == null ? u0 : sternU, vw * 0.7], [sternU == null ? u0 : sternU, -vw * 0.7], [u0, -vw]];
}
function mast(S, u, v, z0, z1, w = 3) { const it = sStroke(S, [[u, v, z0], [u, v, z1]], w, WD.hullD, 3, { group: gdep(S, u, v) }); it.depth = 0; return it; }
/* square sail hanging from a yard at mast u; brace angle; emblem drawn with an affine map */
function squareSail(S, u, z1, z2, hw, o = {}) {
  const P = S.P, br = o.brace == null ? 0.68 : o.brace, belly = (o.belly == null ? 7 : o.belly);
  const au = Math.sin(br), av = Math.cos(br), nu = Math.cos(br), nv = -Math.sin(br);
  const uc = u + 2.5 * nu, vc = 2.5 * nv;
  const TL = [uc - au * hw, vc - av * hw, z2], TR = [uc + au * hw, vc + av * hw, z2];
  const BL = [uc - au * hw * 0.94 + nu * belly * 0.4, vc - av * hw * 0.94 + nv * belly * 0.4, z1], BR = [uc + au * hw * 0.94 + nu * belly * 0.4, vc + av * hw * 0.94 + nv * belly * 0.4, z1];
  const MID = [uc + nu * belly, vc + nv * belly, (z1 + z2) / 2], FOOT = [uc + nu * belly * 1.2, vc + nv * belly * 1.2, z1 - 3];
  const front = P(uc + nu * 10, vc + nv * 10, z1)[2] > P(uc, vc, z1)[2];
  const col = o.col || WD.sail, grp = gdep(S, u, 0);
  const pts = [TL, TR, BR, BL].map((p) => P(...p)), m = P(...MID), f = P(...FOOT);
  const it = sCustom(S, 3, grp, front ? 2 : -2, (g, c) => {
    const [a, b, d, e] = pts;
    const path = () => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.quadraticCurveTo(lerp(b[0], d[0], 0.5) + (m[0] - lerp(a[0], d[0], 0.5)) * 0.5, lerp(b[1], d[1], 0.5) + (m[1] - lerp(a[1], d[1], 0.5)) * 0.5, d[0], d[1]); c.quadraticCurveTo(f[0], f[1], e[0], e[1]); c.quadraticCurveTo(lerp(a[0], e[0], 0.5) + (m[0] - lerp(b[0], e[0], 0.5)) * 0.5, lerp(a[1], e[1], 0.5) + (m[1] - lerp(b[1], e[1], 0.5)) * 0.5, a[0], a[1]); c.closePath(); };
    path(); g.fill(front ? col : shade(col, -0.12));
    if (g.out) return;
    path();
    g.inside((c) => {
      const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, 'rgba(0,0,0,0.14)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.1)');
      c.fillStyle = gr; c.fillRect(Math.min(a[0], b[0], d[0], e[0]) - 20, Math.min(a[1], b[1]) - 20, 400, 400);
      if (o.battens) { c.strokeStyle = 'rgba(70,45,20,0.45)'; c.lineWidth = Math.max(0.8, S.s * 1.3); for (let k = 1; k < o.battens; k++) { const t2 = k / o.battens; const L0 = [lerp(a[0], e[0], t2), lerp(a[1], e[1], t2)], R0 = [lerp(b[0], d[0], t2), lerp(b[1], d[1], t2)]; const bul = Math.sin(Math.PI * t2); c.beginPath(); c.moveTo(L0[0], L0[1]); c.quadraticCurveTo((L0[0] + R0[0]) / 2 + (m[0] - (a[0] + b[0] + d[0] + e[0]) / 4) * bul, (L0[1] + R0[1]) / 2 + (m[1] - (a[1] + b[1] + d[1] + e[1]) / 4) * bul, R0[0], R0[1]); c.stroke(); } }
      if (o.emblem) {
        const cz = (z1 + z2) / 2, ctr = P(uc + nu * belly * 0.8, vc + nv * belly * 0.8, cz);
        const ax = S.V(au, av, 0), zx = S.V(0, 0, -1), r = hw * 0.48;
        c.save(); c.transform(ax[0] * r, ax[1] * r, zx[0] * r, zx[1] * r, ctr[0], ctr[1]);
        o.emblem(c, front);
        c.restore();
      }
    });
    // yard
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
    if (g.out) { c.lineWidth = 2.2 * S.s + g.lw * 2; c.strokeStyle = INK; } else { c.lineWidth = 2.2 * S.s; c.strokeStyle = WD.hullD; }
    c.stroke();
  });
  return it;
}
/* junk (battened lug) sail: fore-and-aft plane, fan-shaped */
function junkSail(S, u, z1, z2, len, o = {}) {
  const P = S.P, br = o.brace == null ? 0.3 : o.brace;
  const fu = Math.cos(br), fv = Math.sin(br);
  const luff = 0.28 * len, leech = -0.72 * len;
  const pt = (along, z) => P(u + fu * along, fv * along, z);
  const A = pt(luff, z1), B = pt(luff, z2), C = pt(leech * 1.08, z2 + 8), D = pt(leech, z1);
  const col = o.col || WD.mat, n = o.battens || 6;
  sCustom(S, 3, gdep(S, u, 0), 1, (g, c) => {
    const path = () => { c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); for (let k = 1; k <= n; k++) { const t2 = k / n; const p0 = pt(lerp(leech * 1.08, leech, t2), lerp(z2 + 8, z1, t2)); const pm = pt(lerp(leech * 1.08, leech, t2 - 0.5 / n) - 3, lerp(z2 + 8, z1, t2 - 0.5 / n)); c.quadraticCurveTo(pm[0], pm[1], p0[0], p0[1]); } c.closePath(); };
    path(); g.fill(col);
    if (g.out) return;
    path();
    g.inside((c) => {
      c.strokeStyle = WD.hullD; c.lineWidth = Math.max(1, S.s * 1.8);
      for (let k = 0; k <= n; k++) { const t2 = k / n; const l = pt(luff, lerp(z2, z1, t2)), r = pt(lerp(leech * 1.08, leech, t2), lerp(z2 + 8, z1, t2)); c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(r[0], r[1]); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(lerp(B[0], C[0], 0.3), lerp(B[1], C[1], 0.3)); c.lineTo(lerp(A[0], D[0], 0.3), lerp(A[1], D[1], 0.3)); c.closePath(); c.fill();
    });
  });
}
/* oars: rows along the hull at deck-side ports; animated sweep */
function oars(S, st, us, zPort, len, o = {}) {
  const t = S.t, P = S.P, row = o.row !== false, ph0 = o.phase || 0;
  const sweep = row ? Math.sin(t * 5.5 + ph0) * 5 : 0, dip = row ? Math.max(0, Math.cos(t * 5.5 + ph0)) : 1;
  for (const u of us) {
    const [wd, ww] = stationW(st, u);
    for (const sd of [1, -1]) {
      const w = lerp(ww, wd, 0.7);
      const a = [u, sd * (w + 0.5), zPort], b = [u - 4 - sweep, sd * (w + len), -1 + (1 - dip) * 4];
      const near = sd === S.near;
      sStroke(S, [a, b], 1.15, '#d9b27a', near ? 1.5 : 0.5, { group: 0 });
      if (near && dip > 0.6 && o.splash !== false) sCustom(S, 1.5, 0, 1, (g, c) => { if (g.out) return; const p = P(b[0], b[1], 0); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); ell(c, p[0], p[1], 3.2 * S.s * 1.6, 1.3 * S.s * 1.6); c.fill(); });
    }
  }
}
/* flag on a pole at (u, v, z) — billboard, flies toward the stern */
function shipFlag(S, u, v, z, w, h, o = {}) {
  const P = S.P, base = P(u, v, z), top = P(u, v, z + (o.pole || h * 1.6));
  const dir = o.dir || (S.ch >= 0 ? -1 : 1), t = S.t;
  const tm = S.team, col = o.col || tm.flag;
  sCustom(S, o.layer || 5, base[2], 0, (g, c) => {
    const s = S.s;
    c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(top[0], top[1]);
    if (g.out) { c.lineWidth = 1.6 * s + g.lw * 2; c.strokeStyle = INK; } else { c.lineWidth = 1.6 * s; c.strokeStyle = WD.hullD; }
    c.stroke();
    const W = w * s, H = h * s, x0 = top[0], y0 = top[1];
    const wave = (u2) => Math.sin(u2 * 5 - t * 6 + u) * H * 0.12 * u2;
    const path = () => { c.beginPath(); c.moveTo(x0, y0); for (let i = 1; i <= 8; i++) { const u2 = i / 8; c.lineTo(x0 + dir * W * u2, y0 + wave(u2)); } if (o.tails) c.lineTo(x0 + dir * W * 0.78, y0 + H * 0.5 + wave(0.78)); for (let i = 8; i >= 0; i--) { const u2 = i / 8; c.lineTo(x0 + dir * W * u2, y0 + H + wave(u2)); } c.closePath(); };
    path(); g.fill(col);
    if (!g.out) {
      path(); g.inside((c) => {
        if (o.arms) { c.save(); c.translate(x0, y0); if (dir < 0) c.scale(-1, 1); HER.paint(c, o.arms, 0, -H * 0.1, W, H * 1.2); c.restore(); }
        else { c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(Math.min(x0, x0 + dir * W), y0 + H * 0.35, W, H * 0.12); }
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(Math.min(x0, x0 + dir * W), y0 + H * 0.6, W, H);
      });
    }
  });
}
/* crew heads peeking over the walls: kind 'korea' (red-tasselled helmets), 'samurai' (crested kabuto + sashimono), 'ming' */
function crew(S, spots, kind) {
  const P = S.P, tm = S.team;
  for (const [u, v, z] of spots) {
    const p = P(u, v, z);
    sCustom(S, 4, p[2], 0, (g, c) => {
      const s = S.s * 1.25, x = p[0], y = p[1];
      if (kind === 'samurai') {
        const pole = [x + 3 * s, y - 2 * s];
        c.beginPath(); c.moveTo(pole[0], pole[1]); c.lineTo(pole[0], pole[1] - 16 * s);
        if (g.out) { c.lineWidth = 1 * s + g.lw * 2; c.strokeStyle = INK; } else { c.lineWidth = 1 * s; c.strokeStyle = WD.hullD; }
        c.stroke();
        c.beginPath(); c.rect(pole[0], pole[1] - 16 * s, 5 * s, 9 * s); g.fill(tm.main);
      }
      c.beginPath(); circ(c, x, y, 3.6 * s); g.fill(PAL.skin);
      c.beginPath(); c.moveTo(x - 4.6 * s, y - 0.5 * s); c.quadraticCurveTo(x, y - 7.5 * s, x + 4.6 * s, y - 0.5 * s); c.closePath();
      g.fill(kind === 'samurai' ? WD.lacquer : kind === 'ming' ? PAL.steel : PAL.steelD);
      if (kind === 'samurai') { c.beginPath(); c.moveTo(x - 4 * s, y - 5 * s); c.lineTo(x - 5.5 * s, y - 9 * s); c.lineTo(x, y - 6 * s); c.lineTo(x + 5.5 * s, y - 9 * s); c.lineTo(x + 4 * s, y - 5 * s); c.closePath(); g.fill(PAL.gold); }
      else { c.beginPath(); c.moveTo(x, y - 5.5 * s); c.lineTo(x, y - 9 * s); if (g.out) { c.lineWidth = 1.2 * s + g.lw * 2; c.strokeStyle = INK; } else { c.lineWidth = 1.2 * s; c.strokeStyle = '#c8372d'; } c.stroke(); }
    });
  }
}
function flagOn(S, u, v, z, key, w, h, pole) { shipFlag(S, u, v, z, w, h, { arms: key, pole, col: '#f4f1e8' }); }

/* ---------- ship types ---------- */
function korHull(L, B, zD, bluntBow) {
  const h = L / 2;
  return [[-h, B * 0.32, B * 0.28, zD + 3], [-h * 0.7, B * 0.48, B * 0.42, zD + 1], [0, B * 0.5, B * 0.44, zD], [h * 0.7, B * 0.46, B * 0.4, zD + 1], [h, bluntBow ? B * 0.3 : 1.5, bluntBow ? B * 0.24 : 1, zD + 4]];
}
function japHull(L, B, zD) {
  const h = L / 2;
  return [[-h, B * 0.36, B * 0.3, zD + 2], [-h * 0.6, B * 0.5, B * 0.44, zD], [h * 0.3, B * 0.48, B * 0.42, zD], [h * 0.78, B * 0.3, B * 0.24, zD + 2], [h, 0.8, 0.6, zD + 6]];
}
const KOREA_SAIL = (c, front) => { c.beginPath(); circ(c, 0, 0, 0.62); c.lineWidth = 0.16; c.strokeStyle = '#c8372d'; c.stroke(); HER.glyph(c, '帥', 0, 0.05, 0.8, '#2a2320'); };
function teamSail(S) { return (c) => { c.beginPath(); circ(c, 0, 0, 0.66); c.fillStyle = S.team.main; c.fill(); c.lineWidth = 0.1; c.strokeStyle = INK; c.stroke(); c.beginPath(); circ(c, 0, 0, 0.36); c.fillStyle = '#f4f1e8'; c.fill(); }; }

SHIPS.panokseon = {
  name: 'Panokseon', len: 100, role: 'Line ship: cannons at range',
  build(S, o) {
    const st = korHull(100, 30, 9, true);
    oars(S, st, [-30, -20, -10, 0, 10, 20, 30], 7, 16, { row: o.row });
    hull(S, st, { band: S.team.main, ports: [[-26, 6], [-12, 6], [2, 6], [16, 6], [30, 6]] });
    // upper deck house (wider than the hull) with the parapet on top
    block(S, -44, 42, 16.5, 11, 19, WD.hullL, { layer: 2, top: WD.deck, det: (cc, it, i) => { if (i % 2 === 0) { cc.fillStyle = 'rgba(20,10,4,0.75)'; const [a, b, d, e] = it.pts; for (let k = 0; k < 6; k++) { const f = (k + 0.5) / 6; const x = lerp(lerp(a[0], b[0], f), lerp(e[0], d[0], f), 0.5), y = lerp(lerp(a[1], b[1], f), lerp(e[1], d[1], f), 0.5); cc.fillRect(x - 1.8 * S.s, y - 1.8 * S.s, 3.6 * S.s, 3.6 * S.s); } } } });
    const ring = [[-44, -16.5], [42, -16.5], [42, 16.5], [-44, 16.5], [-44, -16.5]];
    crew(S, [[-8, -12, 19], [8, -12, 19], [22, 11, 19], [-20, 12, 19], [30, -11, 19]], 'korea');
    wall(S, ring, 19, 5, WD.hullD, { crenel: 4, crenelH: 3, trim: S.team.main });
    // commander's pavilion
    block(S, -34, -18, 8, 19, 29, '#c9a06a', { group: S.P(-26, 0, 19)[2] });
    hipRoof(S, -34, -18, 8, 29, 37, WD.jade, { group: S.P(-26, 0, 19)[2], tiles: true });
    mast(S, 10, 0, 19, 84); mast(S, -6, 0, 19, 74);
    squareSail(S, 10, 36, 80, 17, { battens: 6, emblem: o.emblem || teamSail(S) });
    squareSail(S, -6, 34, 70, 14, { battens: 5 });
    shipFlag(S, 40, -15, 24, 9, 6); shipFlag(S, 40, 15, 24, 9, 6); shipFlag(S, -42, 15, 24, 9, 6);
    if (o.hero) {
      flagOn(S, -26, 0, 37, 'joseon', 18, 14, 22);
      sCustom(S, 4, S.P(-8, 0, 19)[2], 0, (g, c) => drum(g, c, S, S.P(-8, 0, 19)));
    }
    return st;
  },
};
function drum(g, c, S, p) {
  // big war drum on a stand (Yi's flagship)
  const s = S.s * 1.4, x = p[0], y = p[1];
  c.beginPath(); c.moveTo(x - 7 * s, y); c.lineTo(x - 4 * s, y - 10 * s); c.moveTo(x + 7 * s, y); c.lineTo(x + 4 * s, y - 10 * s);
  if (g.out) { c.lineWidth = 1.6 * s + g.lw * 2; c.strokeStyle = INK; } else { c.lineWidth = 1.6 * s; c.strokeStyle = WD.hullD; }
  c.stroke();
  c.beginPath(); ell(c, x, y - 12 * s, 7.5 * s, 6 * s); g.fill('#c8452d');
  if (!g.out) { c.beginPath(); ell(c, x - 1.2 * s, y - 12.5 * s, 5.5 * s, 5 * s); c.fillStyle = '#efe0bf'; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.8; c.stroke(); c.fillStyle = '#2f8a73'; c.beginPath(); circ(c, x - 1.2 * s, y - 12.5 * s, 2 * s); c.fill(); }
}
SHIPS.flagship = {
  name: "Yi Sun-sin's flagship", len: 104, hero: true,
  build(S, o) { return SHIPS.panokseon.build(S, Object.assign({}, o, { hero: true, emblem: KOREA_SAIL })); },
};
SHIPS.turtle = {
  name: 'Turtle Ship', len: 92, role: 'Special: armoured roof, rams, dragon-head cannon', special: true,
  build(S, o) {
    const st = korHull(92, 26, 8, true), P = S.P;
    oars(S, st, [-28, -18, -8, 2, 12, 22], 6, 15, { row: o.row });
    hull(S, st, { band: S.team.main, ports: [[-30, 5.5], [-18, 5.5], [-6, 5.5], [6, 5.5], [18, 5.5], [30, 5.5]], deck: false });
    // shell roof: stations with eave (deck edge) and ridge; 4 strips across
    const R = [[-44, 10.5, 9, 12], [-30, 13.5, 8.5, 17], [-10, 14, 8, 19], [12, 13.8, 8, 18.5], [30, 12.5, 8.5, 16], [42, 9, 9.5, 12]];
    const across = (r, side, k) => { const [u, w, z0, zr] = r; const f = [1, 0.62, 0][k]; const zz = [z0, z0 + (zr - z0) * 0.8, zr][k]; return [u, side * w * f, zz]; };
    const plates = (cc, it) => { cc.strokeStyle = 'rgba(255,230,190,0.22)'; cc.lineWidth = Math.max(0.6, S.s); const [a, b, d, e] = it.pts; if (!e) return; for (let k = 1; k < 3; k++) { const f = k / 3; cc.beginPath(); cc.moveTo(lerp(a[0], e[0], f), lerp(a[1], e[1], f)); cc.lineTo(lerp(b[0], d[0], f), lerp(b[1], d[1], f)); cc.stroke(); } cc.beginPath(); cc.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); cc.lineTo((e[0] + d[0]) / 2, (e[1] + d[1]) / 2); cc.stroke(); };
    for (let i = 0; i < R.length - 1; i++) for (const side of [1, -1]) for (let k = 0; k < 2; k++) {
      const q = [across(R[i], side, k), across(R[i + 1], side, k), across(R[i + 1], side, k + 1), across(R[i], side, k + 1)];
      sPoly(S, q, k === 0 ? (side === S.near ? WD.roof : shade(WD.roof, -0.2)) : shade(WD.roof, 0.1), 2, { det: plates });
    }
    // end caps
    for (const r of [R[0], R[R.length - 1]]) sPoly(S, [across(r, -1, 0), across(r, -1, 1), across(r, -1, 2), across(r, 1, 1), across(r, 1, 0)], shade(WD.roof, -0.1), 2);
    // spikes
    const spikes = [];
    for (let i = 0; i < R.length - 1; i++) for (const side of [1, -1]) for (const f of [0.35, 0.8]) { const a = across(R[i], side, 0), b = across(R[i + 1], side, 1); spikes.push([lerp(a[0], b[0], 0.5), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]); }
    for (const sp of spikes) { const p = P(...sp); sCustom(S, 2.2, p[2], 0, (g, c) => { const s = S.s * 1.2; c.beginPath(); c.moveTo(p[0] - 1.6 * s, p[1]); c.lineTo(p[0], p[1] - 4.5 * s); c.lineTo(p[0] + 1.6 * s, p[1]); c.closePath(); g.fill(PAL.steelL); }); }
    // dragon head at the bow
    const hp = P(47, 0, 12), fw = S.ch >= 0 ? 1 : -1, facing = Math.abs(S.sh) > 0.8 ? (S.sh > 0 ? 'front' : 'back') : 'side';
    sCustom(S, 2.4, hp[2], 5, (g, c) => dragonHead(g, c, hp[0], hp[1], S.s, fw, facing, S.t, o.smoke));
    shipFlag(S, -40, 0, 12, 10, 7, { pole: 18 });
    return st;
  },
};
function dragonHead(g, c, x, y, s, fw, facing, t, smoke) {
  c.save(); c.translate(x, y); c.scale(s * fw, s);
  if (facing === 'back') { c.restore(); return; }
  if (facing === 'front') {
    c.beginPath(); ell(c, 0, -6, 8, 8); g.fill('#3a8a6a');
    c.beginPath(); c.moveTo(-6, -12); c.lineTo(-10, -20); c.lineTo(-3, -13); c.moveTo(6, -12); c.lineTo(10, -20); c.lineTo(3, -13); g.fill(PAL.gold);
    if (!g.out) { g.dot(-3.5, -8, 1.6, INK); g.dot(3.5, -8, 1.6, INK); c.beginPath(); ell(c, 0, -2, 4.5, 2.4); c.fillStyle = '#c8372d'; c.fill(); }
    c.restore(); return;
  }
  c.beginPath(); c.moveTo(-8, 2); c.quadraticCurveTo(-8, -10, 2, -12); c.quadraticCurveTo(10, -13, 16, -8); c.lineTo(20, -6); c.lineTo(15, -3); c.lineTo(19, 1); c.quadraticCurveTo(10, 4, -8, 2); c.closePath(); g.fill('#3a8a6a');
  c.beginPath(); c.moveTo(-2, -11); c.quadraticCurveTo(-6, -20, -12, -22); c.quadraticCurveTo(-4, -18, 2, -12); c.closePath(); g.fill(PAL.gold);
  c.beginPath(); c.moveTo(-8, -4); c.lineTo(-14, -6); c.lineTo(-9, 0); c.closePath(); g.fill('#c8372d');
  if (!g.out) {
    g.dot(6, -8, 1.8, INK); g.dot(6.6, -8.6, 0.6, '#fff');
    c.beginPath(); c.moveTo(15, -3.5); c.lineTo(19.5, -5.5); c.lineTo(18.5, 0.5); c.closePath(); c.fillStyle = '#7a1d14'; c.fill();
    c.strokeStyle = PAL.gold; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, -2); c.quadraticCurveTo(4, -1, 10, -4); c.stroke();
  }
  c.restore();
  if (smoke && !g.out) {
    for (let i = 0; i < 4; i++) {
      const k = (((t * 0.9 + i * 0.25) % 1) + 1) % 1;
      c.fillStyle = `rgba(220,220,210,${0.55 * (1 - k)})`;
      c.beginPath(); circ(c, x + fw * (20 + k * 30) * s, y - (2 + k * 14) * s, Math.abs((3 + k * 7) * s)); c.fill();
    }
  }
}
SHIPS.hyeopseon = {
  name: 'Hyeopseon', len: 56, role: 'Fast ship: scouts and harasses',
  build(S, o) {
    const st = korHull(56, 15, 6, true);
    oars(S, st, [-12, -2, 8, 18], 5, 11, { row: o.row });
    hull(S, st, { band: S.team.main });
    wall(S, [[-24, -7.5], [22, -7.5], [22, 7.5], [-24, 7.5], [-24, -7.5]], 7, 3.5, WD.hullD, { trim: S.team.main });
    crew(S, [[-6, -3, 8], [6, 3, 8]], 'korea');
    mast(S, 4, 0, 7, 50);
    squareSail(S, 4, 22, 47, 9, { battens: 4, emblem: teamSail(S) });
    shipFlag(S, -24, 0, 9, 7, 5);
    return st;
  },
};
SHIPS.firearrow = {
  name: 'Fire-arrow boat', len: 52, role: 'Fire support: rocket arrows from a hwacha',
  build(S, o) {
    const st = korHull(52, 16, 6, true), P = S.P;
    oars(S, st, [-12, -2, 8, 18], 5, 11, { row: o.row });
    hull(S, st, { band: S.team.main });
    wall(S, [[-22, -8], [20, -8], [20, 8], [-22, 8], [-22, -8]], 7, 3, WD.hullD, { trim: S.team.main });
    // hwacha: wheeled rack with a honeycomb of arrow tubes, angled toward the bow
    const g0 = S.P(2, 0, 7)[2];
    block(S, -4, 10, 5.5, 7, 12, WD.hullL, { group: g0 });
    const tilt = 0.9, ca = Math.cos(tilt), sa = Math.sin(tilt);
    const face = [[10 + 4 * ca, -6, 12 + 4 * sa], [10 + 4 * ca, 6, 12 + 4 * sa], [10 - 10 * ca, 6, 12 + 10 * sa + 8], [10 - 10 * ca, -6, 12 + 10 * sa + 8]];
    sPoly(S, face, '#c79a5a', 3, { group: g0, bias: 1, det: (cc, it) => { const [a, b, d, e] = it.pts; for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { const fx = (i + 0.5) / 5, fy = (j + 0.5) / 4; const x = lerp(lerp(a[0], b[0], fx), lerp(e[0], d[0], fx), fy), y = lerp(lerp(a[1], b[1], fx), lerp(e[1], d[1], fx), fy); cc.fillStyle = '#3a2412'; cc.beginPath(); circ(cc, x, y, 1.3 * S.s * 1.3); cc.fill(); cc.fillStyle = '#e8541f'; cc.beginPath(); circ(cc, x, y - 0.6 * S.s, 0.6 * S.s * 1.3); cc.fill(); } } });
    // rack legs and wheels
    for (const v of [-6.5, 6.5]) sCustom(S, 3, g0, 0.5, (g, c) => { const p = S.P(0, v, 9); c.beginPath(); circ(c, p[0], p[1], 3.2 * S.s); g.fill('#6d4625'); if (!g.out) g.dot(p[0], p[1], 1 * S.s, PAL.gold); });
    crew(S, [[-12, -4, 8], [-12, 4, 8]], 'korea');
    shipFlag(S, -20, 0, 9, 7, 5);
    if (o.firing) sCustom(S, 6, 1e6, 0, (g, c) => { if (g.out) return; const p = P(12, 0, 22); for (let i = 0; i < 6; i++) { const k = (S.t * 1.8 + i / 6) % 1; const dx = S.near * 0 + (S.ch >= 0 ? 1 : -1) * (10 + k * 70) * S.s, dy = (-8 - k * 40 + k * k * 30) * S.s + (i - 2.5) * 3 * S.s; c.strokeStyle = `rgba(255,200,80,${1 - k})`; c.lineWidth = 2 * S.s; c.beginPath(); c.moveTo(p[0] + dx, p[1] + dy); c.lineTo(p[0] + dx - (S.ch >= 0 ? 1 : -1) * 8 * S.s, p[1] + dy + 3 * S.s); c.stroke(); } });
    return st;
  },
};
SHIPS.atakebune = {
  name: 'Atakebune', len: 112, role: 'Line ship: floating fortress, arquebus loopholes',
  build(S, o) {
    const st = japHull(112, 32, 9);
    oars(S, st, [-34, -24, -14, -4, 6, 16, 26], 6.5, 15, { row: o.row });
    hull(S, st, { col: '#6f4a2d', band: S.team.main });
    // fortress walls with loopholes, black lacquer with plaster band
    const u0 = -50, u1 = 40;
    block(S, u0, u1, 16, 9, 26, WD.lacquer, { layer: 2, top: WD.deckD, det: (cc, it, i) => { const [a, b, d, e] = it.pts; cc.fillStyle = WD.plaster; cc.beginPath(); cc.moveTo(e[0], e[1]); cc.lineTo(d[0], d[1]); cc.lineTo(lerp(d[0], b[0], 0.22), lerp(d[1], b[1], 0.22)); cc.lineTo(lerp(e[0], a[0], 0.22), lerp(e[1], a[1], 0.22)); cc.closePath(); cc.fill(); cc.fillStyle = 'rgba(0,0,0,0.85)'; const n = i % 2 ? 4 : 9; for (let k = 0; k < n; k++) { const f = (k + 0.5) / n; for (const fy of [0.45, 0.72]) { const x = lerp(lerp(a[0], b[0], f), lerp(e[0], d[0], f), 1 - fy), y = lerp(lerp(a[1], b[1], f), lerp(e[1], d[1], f), 1 - fy); cc.fillRect(x - 1.3 * S.s, y - 1.3 * S.s, 2.6 * S.s, 2.6 * S.s); } } } });
    // castle tower (yagura)
    const gT = S.P(-18, 0, 26)[2];
    block(S, -30, -6, 10, 26, 40, WD.plaster, { group: gT, det: (cc, it, i) => { const [a, b, d, e] = it.pts; cc.fillStyle = WD.lacquer; cc.beginPath(); cc.moveTo(a[0], a[1]); cc.lineTo(b[0], b[1]); cc.lineTo(lerp(b[0], d[0], 0.3), lerp(b[1], d[1], 0.3)); cc.lineTo(lerp(a[0], e[0], 0.3), lerp(a[1], e[1], 0.3)); cc.closePath(); cc.fill(); } });
    hipRoof(S, -30, -6, 10, 40, 50, WD.lacquerL, { group: gT, finials: true, tiles: true });
    mast(S, 16, 0, 26, 92);
    squareSail(S, 16, 44, 88, 20, { battens: 0, emblem: (c) => { c.beginPath(); circ(c, 0, 0, 0.8); c.fillStyle = S.team.main; c.fill(); HER.mon(c, 0, 0, 0.6, o.mon || 'shimazu', '#f4f1e8'); }, belly: 8 });
    shipFlag(S, -48, -14, 26, 5, 16, { pole: 30 }); shipFlag(S, -48, 14, 26, 5, 16, { pole: 30 });
    crew(S, [[0, -12, 26], [12, 12, 26], [28, -10, 26]], 'samurai');
    return st;
  },
};
SHIPS.sekibune = {
  name: 'Sekibune', len: 78, role: 'Fast ship: raids and boards',
  build(S, o) {
    const st = japHull(78, 20, 7);
    oars(S, st, [-22, -14, -6, 2, 10, 18], 5, 12, { row: o.row });
    hull(S, st, { col: '#7a5232', band: S.team.main });
    wall(S, [[-32, -10], [24, -10], [30, -5], [30, 5], [24, 10], [-32, 10], [-32, -10]], 7, 6, '#6b4a2e', { loops: 7, boards: 3.5 });
    crew(S, o.samurai ? [[-20, -5, 8], [-10, 5, 8], [0, -5, 8], [10, 5, 8], [18, -4, 8], [-26, 4, 8]] : [[-14, -4, 8], [4, 4, 8], [16, -3, 8]], 'samurai');
    mast(S, 4, 0, 7, 62);
    squareSail(S, 4, 26, 58, 13, { battens: 0, emblem: (c) => { c.beginPath(); circ(c, 0, 0, 0.8); c.fillStyle = S.team.main; c.fill(); HER.mon(c, 0, 0, 0.6, o.mon || 'ring', '#f4f1e8'); }, belly: 6 });
    shipFlag(S, -34, 0, 9, 4, 12, { pole: 22 });
    if (o.samurai) { shipFlag(S, 26, -6, 12, 4, 11, { pole: 18 }); shipFlag(S, 26, 6, 12, 4, 11, { pole: 18 }); }
    return st;
  },
};
SHIPS.samurai = {
  name: 'Samurai boarders', len: 80, role: 'Special: grapple, board, win close fights', special: true,
  build(S, o) { return SHIPS.sekibune.build(S, Object.assign({}, o, { samurai: true, mon: o.mon || 'shimazu' })); },
};
SHIPS.kobaya = {
  name: 'Kobaya', len: 48, role: 'Fire support: arquebus boat',
  build(S, o) {
    const st = japHull(48, 13, 5);
    oars(S, st, [-12, -4, 4, 12], 4, 9, { row: o.row });
    hull(S, st, { col: '#7a5232', band: S.team.main });
    wall(S, [[0, -6.5], [16, -6.5], [22, 0], [16, 6.5], [0, 6.5]], 5, 5, '#6b4a2e', { loops: 5, boards: 3 });
    crew(S, [[4, -3, 6], [4, 3, 6], [-10, 0, 6]], 'samurai');
    // arquebus barrels poking over the shields
    for (const v of [-3, 3]) sStroke(S, [[6, v, 10], [22, v * 1.3, 11]], 1.2, '#2e2622', 5);
    shipFlag(S, -20, 0, 6, 4, 9, { pole: 16 });
    return st;
  },
};
SHIPS.junk = {
  name: 'Ming war junk', len: 98, role: 'Ally: heavy guns under Admiral Chen Lin',
  build(S, o) {
    const h = 49, st = [[-h, 12, 10, 16], [-h * 0.6, 14, 12, 12], [0, 14.5, 12.5, 10], [h * 0.6, 12.5, 10.5, 11], [h, 5, 3, 15]];
    oars(S, st, [-20, -10, 0, 10, 20], 6, 13, { row: o.row });
    hull(S, st, { col: '#8a4a2a', band: '#c8452d', ports: [[-24, 6], [-8, 6], [8, 6], [24, 6]] });
    // stern castle with gallery
    const gC = S.P(-40, 0, 16)[2];
    block(S, -49, -30, 13, 16, 26, '#b8452a', { group: gC, det: (cc, it, i) => { const [a, b, d, e] = it.pts; cc.fillStyle = PAL.gold; cc.fillRect(Math.min(a[0], b[0], d[0], e[0]), Math.min(e[1], d[1]) + 1, Math.abs(b[0] - a[0]) + 20, 2.2 * S.s); } });
    hipRoof(S, -48, -32, 11, 26, 33, '#2f6d5a', { group: gC, finials: true });
    wall(S, [[-30, -14], [44, -12], [49, -5], [49, 5], [44, 12], [-30, 14]], 11, 3.5, '#b8452a');
    crew(S, [[-10, -9, 11], [8, 8, 11], [26, -7, 11]], 'ming');
    mast(S, 18, 0, 11, 74); mast(S, -10, 0, 11, 84);
    junkSail(S, 18, 26, 70, 38, { col: '#b8683a' });
    junkSail(S, -10, 24, 80, 44, { col: '#b8683a' });
    flagOn(S, -44, 0, 33, 'chenlin', 12, 10, 16);
    // painted eye on the bow
    const eyeP = S.P(44, S.near * 9.6, 10);
    sCustom(S, 1, eyeP[2], 1e6 + 1, (g, c) => { if (g.out || Math.abs(S.ch) < 0.25) return; const s = S.s; c.fillStyle = '#f4f1e8'; c.beginPath(); ell(c, eyeP[0], eyeP[1], 3.4 * s * 1.2, 2.4 * s * 1.2); c.fill(); c.fillStyle = INK; c.beginPath(); circ(c, eyeP[0] + S.ch * 0.8 * s, eyeP[1], 1.4 * s * 1.2); c.fill(); });
    return st;
  },
};

/* ---------- entry point ---------- */
RTW.drawShip = function (c, o) {
  const def = SHIPS[o.type]; if (!def) return null;
  const S = shipCtx(c, Object.assign({}, o, { bob: o.bob != null ? o.bob : Math.sin((o.t || 0) * 1.6 + (o.x || 0) * 0.05) * 0.8 }));
  const st = def.build(S, o);
  // water: shadow, foam ring, wake
  const P = S.P, s = S.s;
  if (o.water !== false) {
    const ring = [];
    const n = st.length;
    for (let i = 0; i < n; i++) ring.push(P(st[i][0], st[i][2] + 2, 0));
    ring.push(P(st[n - 1][0] + 4, 0, 0));
    for (let i = n - 1; i >= 0; i--) ring.push(P(st[i][0], -st[i][2] - 2, 0));
    ring.push(P(st[0][0] - 3, 0, 0));
    c.save();
    polyPath(c, ring); c.fillStyle = 'rgba(10,40,60,0.22)'; c.fill();
    polyPath(c, ring); c.lineWidth = Math.max(1.5, 3 * s); c.strokeStyle = `rgba(255,255,255,${o.sink ? 0.35 : 0.55})`; c.stroke();
    if (o.moving) {
      // V-shaped wake of foam puffs trailing the stern, fading out
      for (let i = 0; i < 6; i++) {
        const k = ((S.t * 0.7 + i / 6) % 1), d = 3 + k * 26;
        for (const sd of [1, -1]) { const p = P(st[0][0] - d, sd * (st[0][2] * 0.8 + d * 0.3), 0); c.fillStyle = `rgba(255,255,255,${0.4 * (1 - k) * (1 - k)})`; c.beginPath(); ell(c, p[0], p[1], (3 + k * 3) * s, (1.4 + k) * s); c.fill(); }
      }
      const bow = P(st[n - 1][0] + 3, 0, 0);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); ell(c, bow[0], bow[1], 5 * s, 2.2 * s); c.fill();
    }
    c.restore();
  }
  c.save();
  if (o.alpha != null && o.alpha < 1) c.globalAlpha *= o.alpha;
  renderShipList(c, S, o.detail != null ? o.detail : s > 0.6 ? 2 : 1);
  c.restore();
  // fire, smoke, sinking bubbles
  if (o.burn) shipFire(c, S, st, o.burn);
  if (o.sink) { c.save(); c.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 7; i++) { const k = (S.t * 0.8 + i / 7) % 1; const p = P(lerp(st[0][0], st[st.length - 1][0], (i + 0.5) / 7), ((i * 37) % 11) - 5, 0); c.beginPath(); circ(c, p[0], p[1] - k * 6 * s, (1 + k * 2) * s * 1.5); c.globalAlpha = 1 - k; c.fill(); } c.restore(); }
  const bowP = P(st[st.length - 1][0], 0, st[st.length - 1][3]), sternP = P(st[0][0], 0, st[0][3]);
  return { bow: bowP, stern: sternP, mid: P(0, 0, 10), top: P(0, 0, 60), near: S.near };
};
function shipFire(c, S, st, amt) {
  const P = S.P, s = S.s, t = S.t;
  c.save();
  const n = Math.round(3 + amt * 4);
  for (let i = 0; i < n; i++) {
    const u = lerp(st[0][0] * 0.7, st[st.length - 1][0] * 0.7, (i + 0.5) / n), p = P(u, ((i * 7) % 9) - 4, 14);
    const fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2.1), hgt = (10 + 8 * amt) * s * fl;
    // smoke
    for (let k = 0; k < 3; k++) { const q = (t * 0.5 + k / 3 + i * 0.13) % 1; c.fillStyle = `rgba(60,55,50,${0.35 * (1 - q)})`; c.beginPath(); circ(c, p[0] + q * 18 * s, p[1] - hgt - q * 40 * s, (4 + q * 10) * s); c.fill(); }
    c.fillStyle = '#e8541f'; c.beginPath(); c.moveTo(p[0] - 5 * s, p[1]); c.quadraticCurveTo(p[0] - 6 * s, p[1] - hgt * 0.6, p[0], p[1] - hgt); c.quadraticCurveTo(p[0] + 6 * s, p[1] - hgt * 0.6, p[0] + 5 * s, p[1]); c.closePath(); c.fill();
    c.fillStyle = '#ffc93a'; c.beginPath(); c.moveTo(p[0] - 2.6 * s, p[1]); c.quadraticCurveTo(p[0] - 3 * s, p[1] - hgt * 0.4, p[0], p[1] - hgt * 0.65); c.quadraticCurveTo(p[0] + 3 * s, p[1] - hgt * 0.4, p[0] + 2.6 * s, p[1]); c.closePath(); c.fill();
  }
  c.restore();
}

/* ===== src/art/17-portraits.js ===== */
/* Roll to War: story portraits — narrators, heroes and commanders (bust, sticker style).
   Local space 100 x 120: head centre (50, 47), shoulders from y = 82. */
const PORTRAITS = (RTW.PORTRAITS = {
  monk: { name: 'The Chronicler', role: 'A monk of Canterbury', skin: '#f0c49b', hair: 'tonsure', hairCol: '#9a7652', brow: '#7a5a3c', eyes: 'kind', cloth: 'habit', clothCol: '#2e2926', bg: ['#8a6a44', '#3d2a18'], prop: 'quill', age: 1 },
  yiwan: { name: 'Yi Wan', role: "The admiral's nephew", skin: '#efc39a', hair: 'topknot', hairCol: '#1f1a17', brow: '#1f1a17', eyes: 'narrow', mustache: 'thin', cloth: 'jeonbok', clothCol: '#27466e', sleeve: '#c8372d', hat: 'jeonrip', bg: ['#4f7c8a', '#1d3540'] },
  baha: { name: 'Baha ad-Din', role: "Saladin's adviser and biographer", skin: '#d8a57b', hair: 'none', brow: '#cfc8bd', eyes: 'kind', beard: 'full', beardCol: '#d8d2c8', mustache: 'full', cloth: 'robe', clothCol: '#3f5f45', hat: 'turbanBig', hatCol: '#f4efe2', bg: ['#c29a5a', '#5a3b1c'], prop: 'book', age: 2 },
  blackPrince: { name: 'Edward, the Black Prince', role: 'Prince of Wales', skin: '#f2c49c', hair: 'bob', hairCol: '#8a5a32', brow: '#6b4222', eyes: 'round', mustache: 'thin', mustacheCol: '#8a5a32', cloth: 'armorBlack', arms: 'princePeace', hat: 'circlet', bg: ['#6f6f7c', '#23232c'] },
  henryV: { name: 'Henry V', role: 'King of England', skin: '#f3c7a0', hair: 'bowl', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'stern', cloth: 'surcoat', arms: 'royal', hat: 'crown', bg: ['#b8423a', '#4a120e'] },
  derby: { name: 'Henry of Grosmont', role: 'Earl of Derby', skin: '#f2c49c', hair: 'bob', hairCol: '#b88a52', brow: '#8a6238', eyes: 'round', beard: 'short', beardCol: '#b88a52', mustache: 'full', mustacheCol: '#b88a52', cloth: 'surcoat', arms: 'lancaster', bg: ['#b8423a', '#4a120e'] },
  johnII: { name: 'King John II', role: 'King of France', skin: '#f2c49c', hair: 'bob', hairCol: '#6b4a2a', brow: '#5a3a1e', eyes: 'stern', beard: 'short', beardCol: '#6b4a2a', mustache: 'full', mustacheCol: '#6b4a2a', cloth: 'surcoat', arms: 'franceAncient', hat: 'crown', bg: ['#3b64c4', '#10214f'] },
  philipVI: { name: 'Philip VI', role: 'King of France', skin: '#f0c19a', hair: 'bob', hairCol: '#8a6a4a', brow: '#6a4a2e', eyes: 'stern', beard: 'full', beardCol: '#8a6a4a', mustache: 'full', mustacheCol: '#8a6a4a', cloth: 'surcoat', arms: 'franceAncient', hat: 'crown', bg: ['#3b64c4', '#10214f'], age: 1 },
  yisunsin: { name: 'Yi Sun-sin', role: 'Admiral of Joseon', skin: '#ecbf95', hair: 'none', brow: '#1f1a17', eyes: 'stern', beard: 'goatee', beardCol: '#1f1a17', mustache: 'long', mustacheCol: '#1f1a17', cloth: 'dujeonggap', clothCol: '#9e2b25', hat: 'joseonHelm', bg: ['#3f6f86', '#122c3a'], age: 1 },
  chenlin: { name: 'Chen Lin', role: 'Ming admiral', skin: '#efc39a', hair: 'none', brow: '#1f1a17', eyes: 'stern', beard: 'long', beardCol: '#1f1a17', mustache: 'droop', mustacheCol: '#1f1a17', cloth: 'mingArmor', clothCol: '#b8312a', hat: 'mingHelm', bg: ['#d7a93a', '#6a4808'], age: 1 },
  shimazu: { name: 'Shimazu Yoshihiro', role: 'Daimyo of Satsuma', skin: '#efc39a', hair: 'none', brow: '#1f1a17', eyes: 'stern', mustache: 'curl', mustacheCol: '#1f1a17', cloth: 'samurai', clothCol: '#2e2926', mon: 'shimazu', hat: 'kabuto', bg: ['#a63a30', '#3a0f0a'], age: 1 },
  saladin: { name: 'Saladin', role: 'Sultan of Egypt and Syria', skin: '#d9a47a', hair: 'none', brow: '#2a1d16', eyes: 'kind', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'robe', clothCol: '#e0b22a', mail: true, hat: 'turbanHelm', hatCol: '#f4efe2', bg: ['#e2b43a', '#6d4a0c'] },
  gokbori: { name: 'Gökböri', role: 'Emir of Harran, "the Blue Wolf"', skin: '#e2b287', hair: 'none', brow: '#2a1d16', eyes: 'narrow', beard: 'short', beardCol: '#3a2a1e', mustache: 'droop', mustacheCol: '#3a2a1e', cloth: 'robe', clothCol: '#3a6fb0', mail: true, hat: 'turbanHelm', hatCol: '#c9d6e8', bg: ['#5a86c0', '#1a2f52'] },
  richard: { name: 'Richard the Lionheart', role: 'King of England', skin: '#f3c39c', hair: 'bob', hairCol: '#c7773a', brow: '#a85a26', eyes: 'round', beard: 'short', beardCol: '#c7773a', mustache: 'full', mustacheCol: '#c7773a', cloth: 'surcoat', arms: 'england', mail: true, hat: 'crown', bg: ['#c24a3a', '#4a120e'] },
  guy: { name: 'Guy of Lusignan', role: 'King of Jerusalem', skin: '#f2c49c', hair: 'bob', hairCol: '#d9b26a', brow: '#a8844a', eyes: 'round', mustache: 'thin', mustacheCol: '#d9b26a', cloth: 'surcoat', arms: 'lusignan', mail: true, hat: 'crown', bg: ['#6a8ac8', '#1f2f5c'] },
  edwardIII: { name: 'Edward III', role: 'King of England', skin: '#f2c49c', hair: 'bob', hairCol: '#b88a52', brow: '#8a6238', eyes: 'stern', beard: 'full', beardCol: '#b88a52', mustache: 'full', mustacheCol: '#b88a52', cloth: 'surcoat', arms: 'edwardIII', hat: 'crown', bg: ['#b8423a', '#4a120e'], age: 1 },
  bedford: { name: 'John, Duke of Bedford', role: 'Regent of France', skin: '#eab98f', hair: 'short', hairCol: '#3a2616', brow: '#2a1a0e', eyes: 'stern', cloth: 'surcoat', arms: 'bedford', mail: true, bg: ['#3b64c4', '#10214f'], age: 2 },
  louisPoitiers: { name: 'Louis of Poitiers', role: 'Count of Valentinois', skin: '#f0c19a', hair: 'bob', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'stern', beard: 'short', beardCol: '#5a3a22', mustache: 'full', mustacheCol: '#5a3a22', cloth: 'surcoat', arms: 'valentinois', mail: true, bg: ['#d7a93a', '#6a4808'] },
  albret: { name: "Charles d'Albret", role: 'Constable of France', skin: '#f2c49c', hair: 'bowl', hairCol: '#2a1d16', brow: '#2a1d16', eyes: 'stern', cloth: 'surcoat', arms: 'albret', mail: true, bg: ['#c24a3a', '#4a120e'] },
  douglas: { name: 'Archibald Douglas', role: 'Earl of Douglas', skin: '#f3c7a0', hair: 'short', hairCol: '#8a4a26', brow: '#6a3a1e', eyes: 'stern', beard: 'full', beardCol: '#8a4a26', mustache: 'full', mustacheCol: '#8a4a26', cloth: 'surcoat', arms: 'douglas', mail: true, bg: ['#5a86c0', '#1a2f52'], age: 1 },
  joan: { name: 'Joan of Arc', role: 'The Maid of Orléans', skin: '#f5cba6', hair: 'bowl', hairCol: '#5a3a22', brow: '#5a3a22', eyes: 'round', cloth: 'armorSteel', bg: ['#e2d6b8', '#6d5a3a'] },
  adil: { name: 'al-Adil', role: "Saladin's brother", skin: '#dba67c', hair: 'none', brow: '#2a1d16', eyes: 'round', beard: 'full', beardCol: '#3a2a1e', mustache: 'full', mustacheCol: '#3a2a1e', cloth: 'robe', clothCol: '#2f8a4c', mail: true, hat: 'turbanHelm', hatCol: '#f4efe2', bg: ['#4a9a5c', '#16381f'], age: 1 },
  balian: { name: 'Balian of Ibelin', role: 'Defender of Jerusalem', skin: '#eab98f', hair: 'short', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'stern', beard: 'short', beardCol: '#4a2e1a', mustache: 'full', mustacheCol: '#4a2e1a', cloth: 'surcoat', arms: 'ibelin', mail: true, bg: ['#d7a93a', '#6a4808'] },
  raynald: { name: 'Raynald of Châtillon', role: 'Lord of Kerak', skin: '#f0c19a', hair: 'bob', hairCol: '#9a8f82', brow: '#6a645c', eyes: 'stern', beard: 'full', beardCol: '#a39a8c', mustache: 'full', mustacheCol: '#a39a8c', cloth: 'surcoat', arms: 'chatillon', mail: true, bg: ['#a63a30', '#3a0f0a'], age: 2 },
  gerard: { name: 'Gerard de Ridefort', role: 'Grand Master of the Templars', skin: '#f0c19a', hair: 'short', hairCol: '#8a8278', brow: '#6a645c', eyes: 'stern', beard: 'full', beardCol: '#8a8278', mustache: 'full', mustacheCol: '#8a8278', cloth: 'surcoat', arms: 'templar', mail: true, bg: ['#d9d2c0', '#5a5347'], age: 2 },
  // campaign 3: the Japanese admirals, and Won Gyun
  todo: { name: 'Tōdō Takatora', role: 'Daimyo and admiral', skin: '#efc39a', hair: 'none', brow: '#1f1a17', eyes: 'stern', mustache: 'thin', mustacheCol: '#1f1a17', cloth: 'samurai', clothCol: '#27466e', mon: 'todo', hat: 'kabuto', bg: ['#5a86c0', '#1a2f52'] },
  michiyuki: { name: 'Kurushima Michiyuki', role: 'Lord of the Kurushima pirates', skin: '#ecbf95', hair: 'none', brow: '#1f1a17', eyes: 'narrow', beard: 'goatee', beardCol: '#1f1a17', mustache: 'curl', mustacheCol: '#1f1a17', cloth: 'samurai', clothCol: '#3a3a42', mon: 'kurushima', hat: 'kabuto', bg: ['#8a6a44', '#3d2a18'] },
  michifusa: { name: 'Kurushima Michifusa', role: "Michiyuki's younger brother", skin: '#efc39a', hair: 'none', brow: '#1f1a17', eyes: 'stern', mustache: 'droop', mustacheCol: '#1f1a17', cloth: 'samurai', clothCol: '#5a2a26', mon: 'kurushima', hat: 'kabuto', bg: ['#a63a30', '#3a0f0a'] },
  wakisaka: { name: 'Wakisaka Yasuharu', role: 'Daimyo of Awaji', skin: '#efc39a', hair: 'none', brow: '#1f1a17', eyes: 'round', mustache: 'full', mustacheCol: '#1f1a17', cloth: 'samurai', clothCol: '#2f4a2e', mon: 'wakisaka', hat: 'kabuto', bg: ['#4a9a5c', '#16381f'] },
  wongyun: { name: 'Won Gyun', role: 'Naval commander of Gyeongsang', skin: '#e8b890', hair: 'none', brow: '#1f1a17', eyes: 'round', beard: 'short', beardCol: '#1f1a17', mustache: 'full', mustacheCol: '#1f1a17', cloth: 'dujeonggap', clothCol: '#27466e', hat: 'joseonHelm', bg: ['#6f6f7c', '#23232c'], age: 1 },
});

// extension points for new clothes, hair, hats and props (filled in 17b-portraits2.js)
const PX = { cloth: {}, hairBack: {}, hairFront: {}, hat: {}, prop: {}, back: {}, hatTop: {} };
function portraitBody(c, P, tm) {
  const cl = P.clothCol || '#6b4a2a';
  const shoulders = () => { c.beginPath(); c.moveTo(-2, 124); c.bezierCurveTo(0, 96, 14, 84, 36, 80); c.lineTo(64, 80); c.bezierCurveTo(86, 84, 100, 96, 102, 124); c.closePath(); };
  // neck
  c.beginPath(); rr(c, 40, 62, 20, 24, 6); c.fillStyle = shade(P.skin, -0.12); c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
  const fillSh = (col) => { shoulders(); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill(); };
  switch (P.cloth) {
    case 'habit': {
      fillSh(cl);
      c.beginPath(); c.moveTo(26, 84); c.quadraticCurveTo(50, 100, 74, 84); c.quadraticCurveTo(70, 76, 50, 76); c.quadraticCurveTo(30, 76, 26, 84); c.closePath(); c.fillStyle = shade(cl, 0.12); c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      break;
    }
    case 'armorBlack': case 'surcoat': {
      const base = P.cloth === 'armorBlack' ? '#4a4f58' : (P.mail ? PAL.mail : PAL.steel);
      fillSh(base);
      if (P.mail || P.cloth === 'surcoat') { c.save(); shoulders(); c.clip(); mailDots(c, 0, 80, 100, 124, 3.4, 'rgba(40,45,55,0.3)'); c.restore(); }
      // surcoat panel with arms
      const sp = () => { c.beginPath(); c.moveTo(24, 124); c.lineTo(27, 90); c.quadraticCurveTo(50, 84, 73, 90); c.lineTo(76, 124); c.closePath(); };
      sp(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
      c.save(); sp(); c.clip(); HER.paint(c, P.arms || 'royal', 24, 84, 52, 40, { detail: true }); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(62, 84, 20, 40); c.restore();
      if (P.cloth === 'armorBlack') { c.fillStyle = PAL.gold; c.beginPath(); c.moveTo(20, 86); c.lineTo(34, 82); c.lineTo(34, 86); c.lineTo(22, 90); c.closePath(); c.fill(); c.beginPath(); c.moveTo(80, 86); c.lineTo(66, 82); c.lineTo(66, 86); c.lineTo(78, 90); c.closePath(); c.fill(); }
      break;
    }
    case 'robe': {
      fillSh(cl);
      if (P.mail) { c.beginPath(); c.moveTo(34, 80); c.quadraticCurveTo(50, 92, 66, 80); c.lineTo(66, 86); c.quadraticCurveTo(50, 98, 34, 86); c.closePath(); c.fillStyle = PAL.mail; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
      c.strokeStyle = shade(cl, -0.3); c.lineWidth = 2.2; c.beginPath(); c.moveTo(38, 84); c.quadraticCurveTo(46, 104, 44, 124); c.stroke();
      c.fillStyle = PAL.gold; c.fillRect(20, 110, 60, 4);
      break;
    }
    case 'jeonbok': {
      fillSh(P.sleeve || '#c8372d');
      const v = () => { c.beginPath(); c.moveTo(22, 124); c.lineTo(28, 86); c.lineTo(42, 80); c.lineTo(50, 104); c.lineTo(58, 80); c.lineTo(72, 86); c.lineTo(78, 124); c.closePath(); };
      v(); c.fillStyle = cl; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
      c.strokeStyle = '#f4f1e8'; c.lineWidth = 3; c.beginPath(); c.moveTo(42, 81); c.lineTo(50, 102); c.lineTo(58, 81); c.stroke();
      c.fillStyle = '#c8a14a'; c.fillRect(24, 112, 52, 5);
      break;
    }
    case 'dujeonggap': {
      fillSh(cl);
      c.save(); shoulders(); c.clip(); c.fillStyle = PAL.gold; for (let y = 88; y < 124; y += 7) for (let x = 8 + ((y / 7) % 2) * 4; x < 96; x += 8) { c.beginPath(); circ(c, x, y, 1.5); c.fill(); } c.restore();
      c.beginPath(); c.moveTo(34, 80); c.quadraticCurveTo(50, 90, 66, 80); c.lineTo(66, 84); c.quadraticCurveTo(50, 95, 34, 84); c.closePath(); c.fillStyle = '#1d3f6b'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      break;
    }
    case 'mingArmor': {
      fillSh(cl);
      c.save(); shoulders(); c.clip(); c.strokeStyle = 'rgba(255,220,150,0.45)'; c.lineWidth = 1.2; for (let y = 88; y < 124; y += 5) { c.beginPath(); for (let x = 0; x < 100; x += 6) { c.moveTo(x, y); c.quadraticCurveTo(x + 3, y + 4, x + 6, y); } c.stroke(); } c.restore();
      c.beginPath(); circ(c, 50, 102, 9); c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      break;
    }
    case 'samurai': {
      fillSh(cl);
      c.save(); shoulders(); c.clip(); c.strokeStyle = '#c8372d'; c.lineWidth = 1.6; for (let y = 90; y < 124; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(100, y); c.stroke(); } c.restore();
      if (P.mon) HER.mon(c, 50, 104, 10, P.mon, '#f4f1e8', '#1d1a17');
      break;
    }
    case 'armorSteel': {
      fillSh(PAL.steel);
      c.save(); shoulders(); c.clip();
      const pg = c.createLinearGradient(0, 80, 0, 124); pg.addColorStop(0, 'rgba(255,255,255,0.35)'); pg.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = pg; c.fillRect(0, 80, 100, 44);
      c.strokeStyle = 'rgba(60,66,76,0.55)'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(50, 84); c.lineTo(50, 124); c.moveTo(14, 98); c.quadraticCurveTo(26, 90, 36, 92); c.moveTo(86, 98); c.quadraticCurveTo(74, 90, 64, 92); c.stroke();
      c.restore();
      c.beginPath(); c.moveTo(34, 80); c.quadraticCurveTo(50, 90, 66, 80); c.lineTo(66, 86); c.quadraticCurveTo(50, 96, 34, 86); c.closePath(); c.fillStyle = PAL.steelL; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      c.fillStyle = PAL.gold; c.fillRect(46, 104, 8, 8);
      break;
    }
    default: if (PX.cloth[P.cloth]) PX.cloth[P.cloth](c, P, fillSh, shoulders); else fillSh(cl);
  }
}
function portraitHead(c, P, t) {
  const sk = P.skin, hx = 50, hy = 47;
  const hairBack = () => {
    const hc = P.hairCol || '#4a3020';
    if (P.hair === 'bob' || P.hair === 'bowl') { c.beginPath(); c.moveTo(24, 46); c.quadraticCurveTo(22, 20, 50, 18); c.quadraticCurveTo(78, 20, 76, 46); c.lineTo(78, 66); c.quadraticCurveTo(70, 70, 66, 64); c.lineTo(34, 64); c.quadraticCurveTo(30, 70, 22, 66); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
    if (P.hair === 'topknot') { c.beginPath(); ell(c, 50, 18, 7, 6); c.fillStyle = P.hairCol; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
    if (PX.hairBack[P.hair]) PX.hairBack[P.hair](c, P, hc);
  };
  hairBack();
  // ears
  for (const sx of [-1, 1]) { c.beginPath(); ell(c, hx + sx * 23, hy + 3, 4.5, 6.5); c.fillStyle = sk; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
  // head
  c.beginPath(); c.moveTo(hx - 23, hy - 6); c.bezierCurveTo(hx - 24, hy - 32, hx + 24, hy - 32, hx + 23, hy - 6); c.bezierCurveTo(hx + 22, hy + 16, hx + 12, hy + 26, hx, hy + 26); c.bezierCurveTo(hx - 12, hy + 26, hx - 22, hy + 16, hx - 23, hy - 6); c.closePath();
  c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = sk; c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(hx + 10, hy - 40, 20, 80); c.restore();
  // hair front
  const hc = P.hairCol || '#4a3020';
  if (P.hair === 'tonsure') { c.beginPath(); c.moveTo(hx - 23, hy - 4); c.quadraticCurveTo(hx - 24, hy - 16, hx - 18, hy - 20); c.quadraticCurveTo(hx, hy - 12, hx + 18, hy - 20); c.quadraticCurveTo(hx + 24, hy - 16, hx + 23, hy - 4); c.quadraticCurveTo(hx + 18, hy - 12, hx, hy - 8); c.quadraticCurveTo(hx - 18, hy - 12, hx - 23, hy - 4); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
  if (P.hair === 'bob') { c.beginPath(); c.moveTo(hx - 23, hy - 2); c.quadraticCurveTo(hx - 22, hy - 28, hx + 2, hy - 28); c.quadraticCurveTo(hx + 24, hy - 27, hx + 23, hy - 2); c.quadraticCurveTo(hx + 14, hy - 18, hx - 2, hy - 16); c.quadraticCurveTo(hx - 16, hy - 16, hx - 23, hy - 2); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
  if (P.hair === 'bowl') { c.beginPath(); c.moveTo(hx - 24, hy - 4); c.quadraticCurveTo(hx - 24, hy - 30, hx, hy - 30); c.quadraticCurveTo(hx + 24, hy - 30, hx + 24, hy - 4); c.lineTo(hx + 24, hy - 9); c.lineTo(hx - 24, hy - 9); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
  if (P.hair === 'short') { c.beginPath(); c.moveTo(hx - 23, hy - 6); c.quadraticCurveTo(hx - 22, hy - 30, hx, hy - 29); c.quadraticCurveTo(hx + 22, hy - 30, hx + 23, hy - 6); c.quadraticCurveTo(hx + 10, hy - 20, hx, hy - 19); c.quadraticCurveTo(hx - 10, hy - 20, hx - 23, hy - 6); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
  if (PX.hairFront[P.hair]) PX.hairFront[P.hair](c, P, hc);
  if (P.hair === 'topknot') { c.beginPath(); c.moveTo(hx - 23, hy - 6); c.quadraticCurveTo(hx - 22, hy - 30, hx, hy - 30); c.quadraticCurveTo(hx + 22, hy - 30, hx + 23, hy - 6); c.quadraticCurveTo(hx + 12, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx - 12, hy - 22, hx - 23, hy - 6); c.closePath(); c.fillStyle = hc; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); }
  // brows
  const bc = P.brow || '#3a2a1e', st = P.eyes === 'stern', kind = P.eyes === 'kind';
  c.strokeStyle = bc; c.lineWidth = 3.2; c.lineCap = 'round';
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(hx + sx * 15, hy - 6 + (st ? -2 : kind ? 1 : 0)); c.quadraticCurveTo(hx + sx * 10, hy - 10, hx + sx * 4, hy - 7 + (st ? 2 : 0)); c.stroke(); }
  // eyes
  const blink = P.eyes === 'closed' || (t % 4.2) > 4.05;
  for (const sx of [-1, 1]) {
    const ex = hx + sx * 9.5, ey = hy + 1;
    if (blink) { c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(ex - 4, ey); c.quadraticCurveTo(ex, ey + 2, ex + 4, ey); c.stroke(); continue; }
    const ry = P.eyes === 'narrow' ? 2.6 : 3.8;
    c.beginPath(); ell(c, ex, ey, 4.4, ry); c.fillStyle = '#fffaf0'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
    c.beginPath(); circ(c, ex + 0.4, ey + 0.3, Math.min(ry, 2.9)); c.fillStyle = '#2a1d16'; c.fill();
    c.beginPath(); circ(c, ex + 1.3, ey - 0.8, 0.9); c.fillStyle = '#fff'; c.fill();
    if (P.age) { c.strokeStyle = 'rgba(80,40,20,0.45)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(ex + sx * 5, ey + 3); c.lineTo(ex + sx * 7.5, ey + 5); c.stroke(); }
  }
  if (P.patch) { const ex = hx + P.patch * 9.5, ey = hy + 1; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(hx - P.patch * 22, hy - 12); c.lineTo(hx + P.patch * 22, hy + 6); c.stroke(); c.beginPath(); ell(c, ex, ey, 5.8, 5); c.fillStyle = '#1d1a17'; c.fill(); c.lineWidth = 1.6; c.stroke(); }
  // nose, cheeks
  c.strokeStyle = shade(sk, -0.35); c.lineWidth = 1.8; c.beginPath(); c.moveTo(hx + 1, hy + 4); c.quadraticCurveTo(hx + 4, hy + 11, hx, hy + 12); c.stroke();
  c.fillStyle = rgba(PAL.blush, 0.35); c.beginPath(); ell(c, hx - 15, hy + 11, 4.5, 2.6); ell(c, hx + 15, hy + 11, 4.5, 2.6); c.fill();
  // beard / mouth / moustache
  const bcol = P.beardCol || P.hairCol || '#3a2a1e';
  if (P.beard === 'full' || P.beard === 'short') {
    const len = P.beard === 'full' ? 16 : 9;
    c.beginPath(); c.moveTo(hx - 22, hy + 2); c.quadraticCurveTo(hx - 20, hy + 20, hx - 10, hy + 24 + len * 0.4); c.quadraticCurveTo(hx, hy + 28 + len, hx + 10, hy + 24 + len * 0.4); c.quadraticCurveTo(hx + 20, hy + 20, hx + 22, hy + 2); c.quadraticCurveTo(hx + 18, hy + 16, hx + 8, hy + 16); c.quadraticCurveTo(hx, hy + 13, hx - 8, hy + 16); c.quadraticCurveTo(hx - 18, hy + 16, hx - 22, hy + 2); c.closePath();
    c.fillStyle = bcol; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
  } else if (P.beard === 'goatee' || P.beard === 'long') {
    const len = P.beard === 'long' ? 26 : 16;
    c.beginPath(); c.moveTo(hx - 5, hy + 20); c.quadraticCurveTo(hx - 4, hy + 20 + len * 0.7, hx, hy + 20 + len); c.quadraticCurveTo(hx + 4, hy + 20 + len * 0.7, hx + 5, hy + 20); c.closePath();
    c.fillStyle = bcol; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  }
  if (!(P.beard === 'full')) { c.strokeStyle = shade(sk, -0.45); c.lineWidth = 1.8; c.beginPath(); c.moveTo(hx - 4, hy + 17); c.quadraticCurveTo(hx, hy + 19, hx + 4, hy + 17); c.stroke(); }
  const mc = P.mustacheCol || bcol;
  if (P.mustache) {
    c.fillStyle = mc; c.strokeStyle = INK; c.lineWidth = 1.8;
    for (const sx of [-1, 1]) {
      c.beginPath();
      if (P.mustache === 'thin') { c.moveTo(hx, hy + 13.5); c.quadraticCurveTo(hx + sx * 6, hy + 12.5, hx + sx * 10, hy + 16); c.quadraticCurveTo(hx + sx * 5, hy + 15, hx, hy + 15.5); }
      else if (P.mustache === 'long') { c.moveTo(hx, hy + 13); c.quadraticCurveTo(hx + sx * 8, hy + 12, hx + sx * 12, hy + 22); c.quadraticCurveTo(hx + sx * 7, hy + 16, hx, hy + 15.5); }
      else if (P.mustache === 'droop') { c.moveTo(hx, hy + 13); c.quadraticCurveTo(hx + sx * 9, hy + 12, hx + sx * 11, hy + 24); c.quadraticCurveTo(hx + sx * 6, hy + 17, hx, hy + 16); }
      else if (P.mustache === 'curl') { c.moveTo(hx, hy + 13); c.quadraticCurveTo(hx + sx * 10, hy + 11, hx + sx * 14, hy + 8); c.quadraticCurveTo(hx + sx * 10, hy + 15, hx, hy + 16); }
      else { c.moveTo(hx, hy + 12.5); c.quadraticCurveTo(hx + sx * 9, hy + 11, hx + sx * 12, hy + 17); c.quadraticCurveTo(hx + sx * 6, hy + 17, hx, hy + 16); }
      c.closePath(); c.fill(); c.stroke();
    }
  }
}
function portraitHat(c, P) {
  const hx = 50, hy = 47;
  const stroke = (lw = 3) => { c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); };
  switch (P.hat) {
    case 'crown': case 'circlet': {
      const top = P.hat === 'crown' ? 13 : 7, y = hy - 22;
      c.beginPath(); c.moveTo(hx - 24, y + 6); c.lineTo(hx - 24, y - 2);
      for (let i = 0; i <= 4; i++) { const x = hx - 24 + i * 12; c.lineTo(x, y - top); c.lineTo(x + 6, y - 3); }
      c.lineTo(hx + 24, y - 2); c.lineTo(hx + 24, y + 6); c.closePath(); c.fillStyle = PAL.gold; c.fill(); stroke(2.8);
      if (P.hat === 'crown') for (let i = 0; i <= 4; i++) { const x = hx - 24 + i * 12; c.beginPath(); circ(c, x, y - top, 2); c.fillStyle = PAL.goldL; c.fill(); c.lineWidth = 1.2; c.stroke(); if (i % 2 === 0 && i > 0 && i < 4) HER.lis(c, x, y - top - 4, 9, PAL.gold); }
      for (const [x, col] of [[hx - 12, '#c8372d'], [hx, '#2f5fc4'], [hx + 12, '#2f8a4c']]) { c.beginPath(); circ(c, x, y + 2, 2.2); c.fillStyle = col; c.fill(); }
      break;
    }
    case 'turbanBig': case 'turbanHelm': {
      const col = P.hatCol || '#f4efe2';
      if (P.hat === 'turbanHelm') { c.beginPath(); c.moveTo(hx - 18, hy - 22); c.quadraticCurveTo(hx - 12, hy - 46, hx - 2, hy - 50); c.lineTo(hx, hy - 60); c.lineTo(hx + 2, hy - 50); c.quadraticCurveTo(hx + 12, hy - 46, hx + 18, hy - 22); c.closePath(); c.fillStyle = PAL.steel; c.fill(); stroke(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); ell(c, hx - 6, hy - 38, 2.5, 6, 0.3); c.fill(); }
      const big = P.hat === 'turbanBig';
      const tb = () => { c.beginPath(); c.moveTo(hx - 27, hy - 12); c.quadraticCurveTo(hx - 32, hy - (big ? 36 : 28), hx - 12, hy - (big ? 42 : 32)); c.quadraticCurveTo(hx, hy - (big ? 46 : 34), hx + 12, hy - (big ? 42 : 32)); c.quadraticCurveTo(hx + 32, hy - (big ? 36 : 28), hx + 27, hy - 12); c.quadraticCurveTo(hx, hy - 20, hx - 27, hy - 12); c.closePath(); };
      tb(); c.fillStyle = col; c.fill(); stroke();
      c.save(); tb(); c.clip(); c.strokeStyle = shade(col, -0.2); c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(hx - 30, hy - 16 - i * 6); c.quadraticCurveTo(hx, hy - 26 - i * 6 + (i % 2 ? 6 : -2), hx + 30, hy - 16 - i * 6 - (i % 2 ? 3 : 0)); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(hx + 12, hy - 50, 20, 40); c.restore();
      if (!big) { c.beginPath(); ell(c, hx, hy - 20, 4, 5); c.fillStyle = PAL.gold; c.fill(); stroke(1.8); c.beginPath(); circ(c, hx, hy - 20, 1.8); c.fillStyle = '#c8372d'; c.fill(); }
      break;
    }
    case 'jeonrip': {
      // Joseon military felt hat: wide brim, rounded crown, red tassel and peacock feather
      c.beginPath(); ell(c, hx, hy - 20, 38, 8); c.fillStyle = '#1d1a17'; c.fill(); stroke();
      c.beginPath(); c.moveTo(hx - 16, hy - 21); c.quadraticCurveTo(hx - 17, hy - 44, hx, hy - 45); c.quadraticCurveTo(hx + 17, hy - 44, hx + 16, hy - 21); c.closePath(); c.fillStyle = '#2a2622'; c.fill(); stroke();
      c.fillStyle = '#c8a14a'; c.fillRect(hx - 16, hy - 28, 32, 4);
      c.beginPath(); c.moveTo(hx + 4, hy - 44); c.quadraticCurveTo(hx + 18, hy - 60, hx + 30, hy - 56); c.quadraticCurveTo(hx + 18, hy - 52, hx + 8, hy - 42); c.closePath(); c.fillStyle = '#2f8a73'; c.fill(); stroke(1.8);
      c.beginPath(); circ(c, hx + 27, hy - 55, 3); c.fillStyle = '#2f5fc4'; c.fill(); c.lineWidth = 1.2; c.stroke();
      c.beginPath(); c.moveTo(hx - 2, hy - 45); c.quadraticCurveTo(hx - 8, hy - 30, hx - 4, hy - 20); c.quadraticCurveTo(hx + 2, hy - 30, hx + 3, hy - 45); c.closePath(); c.fillStyle = '#c8372d'; c.fill(); stroke(1.6);
      break;
    }
    case 'joseonHelm': case 'mingHelm': {
      const ming = P.hat === 'mingHelm';
      // neck and ear flaps (studded cloth)
      c.beginPath(); c.moveTo(hx - 28, hy - 14); c.lineTo(hx - 30, hy + 20); c.quadraticCurveTo(hx - 24, hy + 26, hx - 20, hy + 20); c.lineTo(hx - 22, hy - 6); c.closePath(); c.moveTo(hx + 28, hy - 14); c.lineTo(hx + 30, hy + 20); c.quadraticCurveTo(hx + 24, hy + 26, hx + 20, hy + 20); c.lineTo(hx + 22, hy - 6); c.closePath();
      c.fillStyle = ming ? '#b8312a' : '#1d3f6b'; c.fill(); stroke(2.5);
      c.fillStyle = PAL.gold; for (const sx of [-1, 1]) for (let y = hy - 6; y < hy + 18; y += 6) { c.beginPath(); circ(c, hx + sx * 25, y, 1.3); c.fill(); }
      // bowl
      c.beginPath(); c.moveTo(hx - 26, hy - 12); c.quadraticCurveTo(hx - 26, hy - 44, hx, hy - 46); c.quadraticCurveTo(hx + 26, hy - 44, hx + 26, hy - 12); c.closePath(); c.fillStyle = ming ? '#c9a24a' : '#3a3632'; c.fill(); stroke();
      c.save(); c.clip(); c.strokeStyle = ming ? '#8a6a1c' : PAL.gold; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(hx + i * 9, hy - 12); c.quadraticCurveTo(hx + i * 7, hy - 36, hx, hy - 46); c.stroke(); } c.restore();
      // brim/visor
      c.beginPath(); c.moveTo(hx - 30, hy - 12); c.quadraticCurveTo(hx, hy - 20, hx + 30, hy - 12); c.lineTo(hx + 24, hy - 8); c.quadraticCurveTo(hx, hy - 14, hx - 24, hy - 8); c.closePath(); c.fillStyle = ming ? '#8a6a1c' : '#23201d'; c.fill(); stroke(2.5);
      // spike + tassel / plume
      c.beginPath(); rr(c, hx - 2.5, hy - 62, 5, 18, 2); c.fillStyle = PAL.gold; c.fill(); stroke(2);
      c.beginPath(); c.moveTo(hx, hy - 60); c.quadraticCurveTo(hx - 12, hy - 58, hx - 10, hy - 46); c.quadraticCurveTo(hx - 4, hy - 52, hx, hy - 50); c.quadraticCurveTo(hx + 4, hy - 52, hx + 10, hy - 46); c.quadraticCurveTo(hx + 12, hy - 58, hx, hy - 60); c.closePath(); c.fillStyle = '#c8372d'; c.fill(); stroke(1.8);
      if (ming) { c.beginPath(); c.moveTo(hx, hy - 62); c.quadraticCurveTo(hx + 18, hy - 78, hx + 26, hy - 70); c.quadraticCurveTo(hx + 16, hy - 70, hx + 2, hy - 60); c.closePath(); c.fillStyle = '#e8dcc0'; c.fill(); stroke(1.6); }
      break;
    }
    case 'kabuto': {
      c.beginPath(); c.moveTo(hx - 34, hy - 4); c.quadraticCurveTo(hx - 30, hy - 16, hx - 24, hy - 16); c.lineTo(hx + 24, hy - 16); c.quadraticCurveTo(hx + 30, hy - 16, hx + 34, hy - 4); c.lineTo(hx + 26, hy - 8); c.lineTo(hx - 26, hy - 8); c.closePath(); c.fillStyle = '#2e2926'; c.fill(); stroke(2.5);
      c.strokeStyle = '#c8372d'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 30, hy - 8); c.lineTo(hx + 30, hy - 8); c.stroke();
      c.beginPath(); c.moveTo(hx - 24, hy - 15); c.quadraticCurveTo(hx - 24, hy - 44, hx, hy - 45); c.quadraticCurveTo(hx + 24, hy - 44, hx + 24, hy - 15); c.closePath(); c.fillStyle = '#3a3430'; c.fill(); stroke();
      c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1.4; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(hx + i * 7, hy - 15); c.lineTo(hx + i * 2, hy - 45); c.stroke(); } c.restore();
      // maedate crest: gold crescent horns
      c.beginPath(); c.moveTo(hx - 3, hy - 22); c.quadraticCurveTo(hx - 26, hy - 34, hx - 30, hy - 60); c.quadraticCurveTo(hx - 18, hy - 40, hx, hy - 30); c.quadraticCurveTo(hx + 18, hy - 40, hx + 30, hy - 60); c.quadraticCurveTo(hx + 26, hy - 34, hx + 3, hy - 22); c.closePath(); c.fillStyle = PAL.gold; c.fill(); stroke(2.2);
      HER.mon(c, hx, hy - 26, 5.5, P.mon || 'shimazu', '#1d1a17', '#f4f1e8');
      break;
    }
    default: if (PX.hat[P.hat]) PX.hat[P.hat](c, P, stroke);
  }
}
function portraitProp(c, P) {
  if (P.prop === 'quill') {
    c.save(); c.translate(80, 112); c.rotate(-0.5);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-4, -18, 2, -36, 12, -46); c.bezierCurveTo(12, -30, 8, -14, 2, 0); c.closePath(); c.fillStyle = '#f6f2e6'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = '#b8ab94'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, -2); c.quadraticCurveTo(4, -24, 11, -44); c.stroke();
    c.restore();
    c.beginPath(); circ(c, 80, 116, 5); c.fillStyle = shade(P.skin, -0.05); c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
  } else if (PX.prop[P.prop]) PX.prop[P.prop](c, P);
  else if (P.prop === 'book') {
    c.save(); c.translate(64, 104); c.rotate(-0.12);
    c.beginPath(); rr(c, 0, 0, 30, 22, 3); c.fillStyle = '#7a2e22'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = PAL.gold; c.fillRect(4, 4, 22, 2.5); c.fillRect(4, 15.5, 22, 2.5); HER.star8(c, 15, 11, 3.2, PAL.gold);
    c.restore();
  }
}
/* bust inside a frame; o.shape: 'rect' | 'round'; o.team adds a coloured rim */
RTW.portrait = function (c, x, y, w, h, key, t = 0, o = {}) {
  const P = PORTRAITS[key]; if (!P) return;
  c.save();
  const r = o.shape === 'round' ? Math.min(w, h) / 2 : (o.r == null ? w * 0.12 : o.r);
  const clip = () => { c.beginPath(); if (o.shape === 'round') circ(c, x + w / 2, y + h / 2, r); else rr(c, x, y, w, h, r); };
  clip(); c.save(); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.globalAlpha = 0.16; c.fillStyle = '#fff';
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.3 + Math.sin(t * 0.3) * 0.03; c.beginPath(); c.moveTo(x + w / 2, y + h * 0.95); c.lineTo(x + w / 2 + Math.cos(a - 0.07) * h * 2, y + h * 0.95 + Math.sin(a - 0.07) * h * 2); c.lineTo(x + w / 2 + Math.cos(a + 0.07) * h * 2, y + h * 0.95 + Math.sin(a + 0.07) * h * 2); c.closePath(); c.fill(); }
  c.globalAlpha = 1;
  const HAT_TOP = { joseonHelm: -16, mingHelm: -33, kabuto: -15, turbanHelm: -15, turbanBig: 0, jeonrip: -14, crown: 2, circlet: 10 };
  const top = P.top != null ? P.top : Math.min(4, P.hat in HAT_TOP ? HAT_TOP[P.hat] : P.hat in PX.hatTop ? PX.hatTop[P.hat] : 14);
  const k = (o.zoom || 1) * Math.min(w / 100, h / (126 - top));
  const bob = Math.sin(t * 1.6) * 0.8;
  c.translate(x + w / 2 - 50 * k, y + h - 122 * k + bob);
  c.scale(k, k);
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (P.back && PX.back[P.back]) PX.back[P.back](c, P, t);
  portraitBody(c, P);
  portraitHead(c, P, t + (o.phase || 0));
  portraitHat(c, P);
  portraitProp(c, P);
  if (PX.after) PX.after(c, P, t);
  c.restore();
  clip(); c.lineWidth = o.lw || 3.5; c.strokeStyle = INK; c.stroke();
  if (o.rim !== false) { c.beginPath(); if (o.shape === 'round') circ(c, x + w / 2, y + h / 2, r - 3); else rr(c, x + 3, y + 3, w - 6, h - 6, Math.max(0, r - 2)); c.lineWidth = 2.2; c.strokeStyle = o.rim || PAL.gold; c.stroke(); }
  c.restore();
};

/* ===== src/art/17b-portraits2.js ===== */
/* Roll to War: portraits for the Leper King, Joan of Arc and the Wars of the Roses.
   New clothes (vestment, gown, doublet, 15th-century plate with a tabard), hats (mitre, mail coif, chaperon,
   cap, sallet, a queen's veil), shoulder-length hair, closed eyes, an eye patch, and Joan's standard. */

/* ---------- clothes ---------- */
PX.cloth.vestment = function (c, P, fillSh) {
  // an archbishop's chasuble with a gold orphrey, and the white pallium with black crosses
  const cl = P.clothCol || '#7a2442';
  fillSh(cl);
  c.beginPath(); c.moveTo(36, 80); c.quadraticCurveTo(50, 88, 64, 80); c.lineTo(66, 84); c.quadraticCurveTo(50, 94, 34, 84); c.closePath(); c.fillStyle = '#f4efe2'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  c.fillStyle = PAL.gold; c.fillRect(45, 92, 10, 32);
  c.strokeStyle = '#f7f3ea'; c.lineWidth = 6; c.lineCap = 'butt';
  c.beginPath(); c.moveTo(24, 86); c.quadraticCurveTo(38, 96, 50, 100); c.quadraticCurveTo(62, 96, 76, 86); c.moveTo(50, 100); c.lineTo(50, 124); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(24, 86); c.quadraticCurveTo(38, 96, 50, 100); c.quadraticCurveTo(62, 96, 76, 86); c.stroke();
  for (const [x, y] of [[34, 93], [66, 93], [50, 112]]) { c.fillStyle = '#1d1a17'; c.fillRect(x - 0.9, y - 3, 1.8, 6); c.fillRect(x - 3, y - 0.9, 6, 1.8); }
  c.lineCap = 'round';
};
PX.cloth.gown = function (c, P, fillSh) {
  // a long 15th-century gown with a wide fur collar
  const cl = P.clothCol || '#2b4a8a', fur = P.fur || '#e8dcc6';
  fillSh(cl);
  c.strokeStyle = shade(cl, -0.35); c.lineWidth = 2; for (const x of [30, 42, 58, 70]) { c.beginPath(); c.moveTo(x, 98); c.quadraticCurveTo(x + (x < 50 ? -2 : 2), 112, x + (x < 50 ? -4 : 4), 124); c.stroke(); }
  c.beginPath(); c.moveTo(18, 92); c.quadraticCurveTo(26, 80, 38, 78); c.quadraticCurveTo(50, 86, 62, 78); c.quadraticCurveTo(74, 80, 82, 92); c.quadraticCurveTo(66, 104, 50, 104); c.quadraticCurveTo(34, 104, 18, 92); c.closePath();
  c.fillStyle = fur; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
  if (P.ermine) { c.fillStyle = '#1d1a17'; for (const [x, y] of [[28, 90], [38, 96], [50, 98], [62, 96], [72, 90], [44, 88], [56, 88]]) { c.beginPath(); c.moveTo(x, y - 2.5); c.lineTo(x + 1.3, y + 1.5); c.lineTo(x - 1.3, y + 1.5); c.closePath(); c.fill(); } }
  else { c.strokeStyle = shade(fur, -0.25); c.lineWidth = 1.2; for (let i = 0; i < 9; i++) { const x = 24 + i * 6.5, y = 90 + Math.sin(i * 0.8) * 3 + (i > 1 && i < 7 ? 5 : 0); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y + 3); c.stroke(); } }
  if (P.chain) chainOfOffice(c, P.chain);
};
PX.cloth.doublet = function (c, P, fillSh) {
  // an open gown over a buttoned doublet with a standing collar
  const over = P.over || '#2a2320', cl = P.clothCol || '#7a2442', fur = P.fur || '#6b4a2a';
  fillSh(over);
  const v = () => { c.beginPath(); c.moveTo(34, 124); c.lineTo(38, 88); c.lineTo(62, 88); c.lineTo(66, 124); c.closePath(); };
  v(); c.fillStyle = cl; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
  c.fillStyle = PAL.gold; for (let y = 94; y < 122; y += 6) { c.beginPath(); circ(c, 50, y, 1.4); c.fill(); }
  c.beginPath(); rr(c, 39, 76, 22, 12, 3); c.fillStyle = cl; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(50 + sx * 12, 86); c.quadraticCurveTo(50 + sx * 20, 84, 50 + sx * 26, 82); c.lineTo(50 + sx * 20, 124); c.lineTo(50 + sx * 15, 124); c.closePath(); c.fillStyle = fur; c.fill(); c.lineWidth = 1.8; c.stroke(); }
  if (P.chain) chainOfOffice(c, P.chain);
};
PX.cloth.tabard = function (c, P, fillSh, shoulders) {
  // 15th-century plate armour: pauldrons, a gorget, and a tabard of arms over the breast
  fillSh(PAL.steel);
  c.save(); shoulders(); c.clip();
  const pg = c.createLinearGradient(0, 80, 0, 124); pg.addColorStop(0, 'rgba(255,255,255,0.35)'); pg.addColorStop(1, 'rgba(0,0,0,0.15)'); c.fillStyle = pg; c.fillRect(0, 80, 100, 44);
  c.restore();
  for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(50 + sx * 20, 82); c.quadraticCurveTo(50 + sx * 40, 80, 50 + sx * 46, 100); c.quadraticCurveTo(50 + sx * 36, 104, 50 + sx * 24, 98); c.closePath();
    c.fillStyle = PAL.steelL; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = 'rgba(60,66,76,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(50 + sx * 26, 90); c.quadraticCurveTo(50 + sx * 38, 88, 50 + sx * 42, 98); c.stroke();
  }
  const sp = () => { c.beginPath(); c.moveTo(27, 124); c.lineTo(29, 92); c.quadraticCurveTo(50, 86, 71, 92); c.lineTo(73, 124); c.closePath(); };
  sp(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
  c.save(); sp(); c.clip(); HER.paint(c, P.arms || 'royal', 27, 86, 46, 38, { detail: true }); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(62, 86, 20, 40); c.restore();
  c.beginPath(); c.moveTo(35, 78); c.quadraticCurveTo(50, 86, 65, 78); c.lineTo(66, 85); c.quadraticCurveTo(50, 94, 34, 85); c.closePath(); c.fillStyle = PAL.steelL; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  if (P.chain) chainOfOffice(c, P.chain);
};
// a livery collar: 'york' (suns and roses), 'lancaster' (the SS collar) or 'gold'
function chainOfOffice(c, kind) {
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, a = Math.PI * (0.12 + u * 0.76); pts.push([50 - Math.cos(a) * 24, 84 + Math.sin(a) * 16]); }
  c.strokeStyle = PAL.goldD; c.lineWidth = 2.4; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  pts.forEach(([x, y], i) => {
    if (kind === 'york') { if (i % 2) HER.rose(c, x, y, 2.6, '#f7f3ea'); else HER.sun(c, x, y, 3, PAL.gold); }
    else if (kind === 'lancaster') { c.strokeStyle = PAL.gold; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 1.5, y - 2.5); c.quadraticCurveTo(x + 2, y - 1, x, y); c.quadraticCurveTo(x - 2, y + 1, x + 1.5, y + 2.5); c.stroke(); }
    else { c.fillStyle = PAL.gold; c.beginPath(); circ(c, x, y, 1.8); c.fill(); }
  });
  const [px, py] = pts[6]; c.beginPath(); circ(c, px, py + 4, 3.6); c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke();
}

/* ---------- hair ---------- */
// shoulder-length hair, the fashion of the Yorkist court
PX.hairBack.long = function (c, P, hc) {
  c.beginPath(); c.moveTo(24, 46); c.quadraticCurveTo(22, 20, 50, 18); c.quadraticCurveTo(78, 20, 76, 46);
  c.lineTo(79, 72); c.quadraticCurveTo(80, 82, 70, 80); c.lineTo(66, 70); c.lineTo(34, 70); c.lineTo(30, 80); c.quadraticCurveTo(20, 82, 21, 72); c.closePath();
  c.fillStyle = hc; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  c.strokeStyle = shade(hc, -0.3); c.lineWidth = 1.4; for (const x of [26, 30, 70, 74]) { c.beginPath(); c.moveTo(x, 52); c.quadraticCurveTo(x + (x < 50 ? -1 : 1), 64, x + (x < 50 ? 1 : -1), 76); c.stroke(); }
};
PX.hairFront.long = function (c, P, hc) {
  const hx = 50, hy = 47;
  c.beginPath(); c.moveTo(hx - 23, hy - 1); c.quadraticCurveTo(hx - 23, hy - 28, hx, hy - 29); c.quadraticCurveTo(hx + 23, hy - 28, hx + 23, hy - 1); c.quadraticCurveTo(hx + 16, hy - 16, hx + 4, hy - 18); c.quadraticCurveTo(hx - 6, hy - 14, hx - 23, hy - 1); c.closePath();
  c.fillStyle = hc; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
};

/* ---------- hats ---------- */
PX.hatTop.mitre = -16; PX.hatTop.chaperon = -6; PX.hatTop.cap = 2; PX.hatTop.sallet = 6; PX.hatTop.queen = -2; PX.hatTop.coif = 8;
PX.hat.mitre = function (c, P, stroke) {
  const hx = 50, hy = 47, m = () => { c.beginPath(); c.moveTo(hx - 21, hy - 15); c.quadraticCurveTo(hx - 24, hy - 42, hx, hy - 63); c.quadraticCurveTo(hx + 24, hy - 42, hx + 21, hy - 15); c.closePath(); };
  m(); c.fillStyle = '#f6f2e6'; c.fill(); stroke(3);
  c.save(); m(); c.clip();
  c.fillStyle = PAL.gold; c.fillRect(hx - 4, hy - 66, 8, 52); c.fillRect(hx - 26, hy - 23, 52, 8);
  c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(hx + 8, hy - 66, 20, 54);
  c.restore();
  c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 12, hy - 36); c.quadraticCurveTo(hx, hy - 30, hx + 12, hy - 36); c.stroke();
  for (const [x, y, col] of [[hx, hy - 19, '#c8372d'], [hx - 13, hy - 19, '#2f5fc4'], [hx + 13, hy - 19, '#2f5fc4'], [hx, hy - 44, '#c8372d']]) { c.beginPath(); circ(c, x, y, 1.9); c.fillStyle = col; c.fill(); }
};
PX.hat.coif = function (c, P, stroke) {
  // a mail hood: the face shows through a rounded opening
  const hx = 50, hy = 47;
  const outer = () => { c.moveTo(hx - 29, hy + 36); c.bezierCurveTo(hx - 34, hy - 6, hx - 30, hy - 36, hx, hy - 37); c.bezierCurveTo(hx + 30, hy - 36, hx + 34, hy - 6, hx + 29, hy + 36); c.quadraticCurveTo(hx, hy + 42, hx - 29, hy + 36); c.closePath(); };
  const hole = () => { c.moveTo(hx - 17, hy - 12); c.bezierCurveTo(hx - 19, hy + 14, hx - 12, hy + 30, hx, hy + 31); c.bezierCurveTo(hx + 12, hy + 30, hx + 19, hy + 14, hx + 17, hy - 12); c.quadraticCurveTo(hx, hy - 21, hx - 17, hy - 12); c.closePath(); };
  c.beginPath(); outer(); hole(); c.fillStyle = PAL.mail; c.fill('evenodd');
  c.save(); c.beginPath(); outer(); hole(); c.clip('evenodd'); mailDots(c, hx - 36, hy - 40, hx + 36, hy + 44, 3.4, 'rgba(40,45,55,0.35)'); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx + 12, hy - 40, 24, 90); c.restore();
  c.beginPath(); outer(); stroke(3); c.beginPath(); hole(); stroke(2.5);
  if (P.circlet) { c.fillStyle = PAL.gold; c.beginPath(); c.moveTo(hx - 24, hy - 20); c.quadraticCurveTo(hx, hy - 28, hx + 24, hy - 20); c.lineTo(hx + 24, hy - 15); c.quadraticCurveTo(hx, hy - 23, hx - 24, hy - 15); c.closePath(); c.fill(); stroke(1.6); }
};
PX.hat.chaperon = function (c, P, stroke) {
  // the rolled hood of the 15th century: a padded roll, a puffed crown and a hanging tail
  const hx = 50, hy = 47, col = P.hatCol || '#7a2442';
  c.beginPath(); c.moveTo(hx + 22, hy - 20); c.bezierCurveTo(hx + 38, hy - 8, hx + 30, hy + 20, hx + 40, hy + 42); c.lineTo(hx + 32, hy + 44); c.bezierCurveTo(hx + 22, hy + 20, hx + 28, hy - 4, hx + 14, hy - 16); c.closePath(); c.fillStyle = shade(col, -0.15); c.fill(); stroke(2.2);
  c.beginPath(); c.moveTo(hx - 25, hy - 25); c.bezierCurveTo(hx - 30, hy - 48, hx - 6, hy - 58, hx + 10, hy - 52); c.bezierCurveTo(hx + 28, hy - 48, hx + 34, hy - 36, hx + 25, hy - 25); c.closePath(); c.fillStyle = shade(col, 0.08); c.fill(); stroke(2.5);
  c.strokeStyle = shade(col, -0.3); c.lineWidth = 1.4; for (const k of [-10, 2, 14]) { c.beginPath(); c.moveTo(hx + k - 6, hy - 50); c.quadraticCurveTo(hx + k, hy - 38, hx + k - 2, hy - 28); c.stroke(); }
  const roll = () => { c.beginPath(); ell(c, hx, hy - 23, 29, 9); };
  roll(); c.fillStyle = col; c.fill(); stroke(2.8);
  c.save(); roll(); c.clip(); c.strokeStyle = shade(col, -0.3); c.lineWidth = 2; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(hx + i * 6, hy - 32); c.lineTo(hx + i * 6 + 6, hy - 14); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(hx - 30, hy - 32, 60, 5); c.restore();
};
PX.hat.cap = function (c, P, stroke) {
  // a soft round cap with a turned-up brim and a jewel
  const hx = 50, hy = 47, col = P.hatCol || '#1d1a17';
  c.beginPath(); c.moveTo(hx - 24, hy - 24); c.bezierCurveTo(hx - 26, hy - 44, hx + 26, hy - 46, hx + 24, hy - 24); c.closePath(); c.fillStyle = col; c.fill(); stroke(2.8);
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); ell(c, hx - 8, hy - 36, 8, 3, -0.2); c.fill();
  c.beginPath(); rr(c, hx - 28, hy - 28, 56, 10, 5); c.fillStyle = shade(col, 0.12); c.fill(); stroke(2.5);
  const jx = hx - 12, jy = hy - 23; c.beginPath(); circ(c, jx, jy, 4.2); c.fillStyle = PAL.gold; c.fill(); stroke(1.6);
  c.beginPath(); circ(c, jx, jy, 2); c.fillStyle = P.jewel || '#c8372d'; c.fill();
  for (const a of [0.6, 1.6, 2.6, 3.6, 4.6, 5.6]) { c.beginPath(); circ(c, jx + Math.cos(a) * 5.4, jy + Math.sin(a) * 5.4, 1); c.fillStyle = '#f7f3ea'; c.fill(); }
};
PX.hat.sallet = function (c, P, stroke) {
  // an open sallet: a rounded bowl sweeping back into a tail
  const hx = 50, hy = 47;
  const b = () => { c.beginPath(); c.moveTo(hx - 31, hy + 10); c.quadraticCurveTo(hx - 29, hy - 2, hx - 26, hy - 8); c.bezierCurveTo(hx - 26, hy - 36, hx + 26, hy - 36, hx + 26, hy - 8); c.quadraticCurveTo(hx + 29, hy - 2, hx + 31, hy + 10); c.lineTo(hx + 23, hy + 4); c.lineTo(hx + 22, hy - 6); c.quadraticCurveTo(hx, hy - 12, hx - 22, hy - 6); c.lineTo(hx - 23, hy + 4); c.closePath(); };
  b(); c.fillStyle = PAL.steel; c.fill(); stroke(3);
  c.save(); b(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(hx - 12, hy - 36, 5, 30); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx + 10, hy - 36, 22, 50); c.restore();
  c.strokeStyle = PAL.steelD; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy - 34); c.lineTo(hx, hy - 10); c.stroke();
  for (const sx of [-1, 1]) { c.beginPath(); circ(c, hx + sx * 22, hy - 4, 1.6); c.fillStyle = PAL.gold; c.fill(); }
};
PX.hat.queen = function (c, P, stroke) {
  // a veil and wimple framing the face, and a crown
  const hx = 50, hy = 47, col = P.hatCol || '#f4efe2';
  const outer = () => { c.moveTo(hx - 33, hy + 40); c.bezierCurveTo(hx - 36, hy - 4, hx - 32, hy - 32, hx, hy - 33); c.bezierCurveTo(hx + 32, hy - 32, hx + 36, hy - 4, hx + 33, hy + 40); c.quadraticCurveTo(hx, hy + 46, hx - 33, hy + 40); c.closePath(); };
  const hole = () => { c.moveTo(hx - 18, hy - 14); c.bezierCurveTo(hx - 20, hy + 12, hx - 12, hy + 28, hx, hy + 29); c.bezierCurveTo(hx + 12, hy + 28, hx + 20, hy + 12, hx + 18, hy - 14); c.quadraticCurveTo(hx, hy - 22, hx - 18, hy - 14); c.closePath(); };
  c.beginPath(); outer(); hole(); c.fillStyle = col; c.fill('evenodd');
  c.save(); c.beginPath(); outer(); hole(); c.clip('evenodd'); c.strokeStyle = shade(col, -0.15); c.lineWidth = 1.4; for (const x of [-26, -20, 20, 26]) { c.beginPath(); c.moveTo(hx + x, hy - 10); c.quadraticCurveTo(hx + x * 1.1, hy + 16, hx + x * 1.05, hy + 40); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(hx + 14, hy - 40, 24, 90); c.restore();
  c.beginPath(); outer(); stroke(2.8); c.beginPath(); hole(); stroke(2.2);
  PX.hatCrown(c, stroke);
};
// the royal crown as the old hat code draws it, for use under a veil
PX.hatCrown = function (c, stroke) {
  const hx = 50, hy = 47, top = 13, y = hy - 24;
  c.beginPath(); c.moveTo(hx - 22, y + 6); c.lineTo(hx - 22, y - 2);
  for (let i = 0; i <= 4; i++) { const x = hx - 22 + i * 11; c.lineTo(x, y - top); c.lineTo(x + 5.5, y - 3); }
  c.lineTo(hx + 22, y - 2); c.lineTo(hx + 22, y + 6); c.closePath(); c.fillStyle = PAL.gold; c.fill(); stroke(2.6);
  for (let i = 0; i <= 4; i++) { const x = hx - 22 + i * 11; c.beginPath(); circ(c, x, y - top, 1.9); c.fillStyle = PAL.goldL; c.fill(); c.lineWidth = 1.2; c.stroke(); }
  for (const [x, col] of [[hx - 11, '#c8372d'], [hx, '#2f5fc4'], [hx + 11, '#2f8a4c']]) { c.beginPath(); circ(c, x, y + 2, 2); c.fillStyle = col; c.fill(); }
};

/* ---------- props ---------- */
// Joan's standard on its lance, behind her shoulder: white, sown with lilies
PX.back.banner = function (c, P, t) {
  c.save(); c.lineJoin = 'round';
  c.save(); c.translate(0, -16);
  c.beginPath(); cap(c, 86, 146, 72, -4, 2.6); c.fillStyle = PAL.woodD; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  const wv = (u) => Math.sin(u * 5 - t * 3) * 2.2 * u;
  const path = () => { c.beginPath(); c.moveTo(72, -3); for (let i = 1; i <= 8; i++) { const u = i / 8; c.lineTo(72 - 46 * u, -3 + wv(u)); } c.lineTo(18, 14 + wv(1)); for (let i = 8; i >= 0; i--) { const u = i / 8; c.lineTo(72 - 46 * u, 26 + wv(u) - (u > 0.9 ? 4 : 0)); } c.closePath(); };
  path(); c.fillStyle = '#f7f3ea'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
  c.save(); path(); c.clip(); HER.paint(c, P.banner || 'joanStandard', 18, -6, 56, 34, { detail: true }); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(18, 16, 56, 12); c.restore();
  c.beginPath(); circ(c, 72, -6, 2.8); c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke();
  c.restore(); c.restore();
};
PX.prop.scroll = function (c, P) {
  c.save(); c.translate(66, 104); c.rotate(-0.18);
  c.beginPath(); rr(c, 0, 0, 30, 18, 2); c.fillStyle = '#f2e8cf'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
  for (const x of [0, 30]) { c.beginPath(); ell(c, x, 9, 3, 9.5); c.fillStyle = '#e2d4b0'; c.fill(); c.lineWidth = 1.8; c.stroke(); }
  c.strokeStyle = 'rgba(80,60,40,0.55)'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(6, 5 + i * 4); c.lineTo(24, 5 + i * 4); c.stroke(); }
  c.beginPath(); circ(c, 15, 18, 3.2); c.fillStyle = '#b8312a'; c.fill(); c.lineWidth = 1.2; c.stroke();
  c.restore();
};

/* ---------- the sitters ---------- */
Object.assign(PORTRAITS, {
  /* campaign: the Leper King */
  williamTyre: { name: 'William of Tyre', role: 'Archbishop of Tyre and chronicler', skin: '#efc39c', hair: 'short', hairCol: '#a39a8c', brow: '#7a7066', eyes: 'kind', cloth: 'vestment', clothCol: '#7a2442', hat: 'mitre', bg: ['#8a6a44', '#3d2a18'], prop: 'book', age: 2 },
  baldwin: { name: 'Baldwin IV', role: 'King of Jerusalem', skin: '#f2d2b8', hair: 'bob', hairCol: '#b08a5a', brow: '#8a6a44', eyes: 'round', cloth: 'surcoat', arms: 'jerusalem', mail: true, hat: 'crown', bg: ['#dcd4c0', '#5a5347'] },
  baldwinBlind: { name: 'Baldwin IV', role: 'King of Jerusalem, 1183', skin: '#efd6c2', hair: 'bob', hairCol: '#a88252', brow: '#8a6a44', eyes: 'closed', cloth: 'gown', clothCol: '#8a1c1c', fur: '#e8dcc6', ermine: true, hat: 'crown', bg: ['#dcd4c0', '#5a5347'] },
  odo: { name: 'Odo of St Amand', role: 'Grand Master of the Templars', skin: '#e8b890', hair: 'none', brow: '#6a645c', eyes: 'stern', beard: 'full', beardCol: '#7a7066', mustache: 'full', mustacheCol: '#7a7066', cloth: 'surcoat', arms: 'templar', mail: true, hat: 'coif', bg: ['#d9d2c0', '#5a5347'], age: 2 },
  raymond: { name: 'Raymond of Tripoli', role: 'Count of Tripoli, lord of Tiberias', skin: '#d6a67c', hair: 'short', hairCol: '#241a14', brow: '#241a14', eyes: 'narrow', beard: 'short', beardCol: '#241a14', mustache: 'full', mustacheCol: '#241a14', cloth: 'surcoat', arms: 'tripoli', mail: true, bg: ['#c24a3a', '#4a120e'], age: 1 },
  castellan: { name: 'The Templar castellan', role: "Commander at Jacob's Ford", skin: '#e2b287', hair: 'none', brow: '#4a2e1a', eyes: 'stern', beard: 'full', beardCol: '#5a3a22', mustache: 'full', mustacheCol: '#5a3a22', cloth: 'surcoat', arms: 'templar', mail: true, hat: 'coif', bg: ['#d9d2c0', '#5a5347'], age: 1 },
  taqi: { name: 'Taqi ad-Din', role: "Saladin's nephew", skin: '#d9a47a', hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'robe', clothCol: '#2f5fc4', mail: true, hat: 'turbanHelm', hatCol: '#f4efe2', bg: ['#5a86c0', '#1a2f52'] },
  farrukh: { name: 'Farrukh-Shah', role: "Saladin's nephew, lord of Damascus", skin: '#dcaa80', hair: 'none', brow: '#2a1d16', eyes: 'narrow', beard: 'full', beardCol: '#3a2a1e', mustache: 'droop', mustacheCol: '#3a2a1e', cloth: 'robe', clothCol: '#b8312a', mail: true, hat: 'turbanHelm', hatCol: '#e9e2cf', bg: ['#c24a3a', '#4a120e'] },
  /* campaign: Joan of Arc */
  daulon: { name: "Jean d'Aulon", role: "Joan's squire and steward", skin: '#f0c19a', hair: 'bowl', hairCol: '#7a6a5a', brow: '#5a4a3a', eyes: 'kind', cloth: 'doublet', clothCol: '#2f5fc4', over: '#3a2a22', fur: '#8a6a4a', hat: 'chaperon', hatCol: '#7a2442', bg: ['#6a8ac8', '#1f2f5c'], prop: 'scroll', age: 1 },
  dunois: { name: 'Jean, the Bastard of Orléans', role: 'Defender of Orléans', skin: '#efc39a', hair: 'bowl', hairCol: '#2e2016', brow: '#2e2016', eyes: 'stern', cloth: 'tabard', arms: 'dunois', bg: ['#3b64c4', '#10214f'] },
  alencon: { name: "The Duke of Alençon", role: "Joan's \"fair duke\"", skin: '#f2c49c', hair: 'bowl', hairCol: '#8a5a32', brow: '#6b4222', eyes: 'round', cloth: 'tabard', arms: 'alencon', bg: ['#3b64c4', '#10214f'] },
  lahire: { name: 'La Hire', role: 'Étienne de Vignolles, Gascon captain', skin: '#dfa87e', hair: 'short', hairCol: '#2a1d16', brow: '#2a1d16', eyes: 'stern', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'tabard', arms: 'lahire', bg: ['#8a6a44', '#3d2a18'], age: 1 },
  xaintrailles: { name: 'Poton de Xaintrailles', role: 'Gascon captain', skin: '#e8b890', hair: 'bowl', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'round', mustache: 'thin', mustacheCol: '#4a2e1a', cloth: 'tabard', arms: 'xaintrailles', bg: ['#c24a3a', '#4a120e'] },
  glasdale: { name: 'William Glasdale', role: 'Captain of the Tourelles', skin: '#f0c19a', hair: 'bowl', hairCol: '#b88a52', brow: '#8a6238', eyes: 'stern', cloth: 'tabard', arms: 'stGeorge', hat: 'sallet', bg: ['#b8423a', '#4a120e'] },
  suffolk: { name: 'The Earl of Suffolk', role: 'William de la Pole', skin: '#f2c49c', hair: 'bowl', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'round', cloth: 'tabard', arms: 'suffolk', bg: ['#3b64c4', '#10214f'] },
  talbot: { name: 'Lord Talbot', role: 'John Talbot, the terror of the French', skin: '#efc39a', hair: 'bowl', hairCol: '#6b4a2a', brow: '#4a2e1a', eyes: 'stern', cloth: 'tabard', arms: 'talbot', bg: ['#c24a3a', '#4a120e'], age: 1 },
  fastolf: { name: 'Sir John Fastolf', role: 'Veteran captain', skin: '#f0c19a', hair: 'bowl', hairCol: '#9a9088', brow: '#7a7066', eyes: 'round', cloth: 'tabard', arms: 'fastolf', bg: ['#d7a93a', '#6a4808'], age: 2 },
  lisleadam: { name: "Jean de l'Isle-Adam", role: 'Burgundian captain of Paris', skin: '#efc39a', hair: 'bowl', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'stern', cloth: 'tabard', arms: 'lisleadam', bg: ['#d7a93a', '#6a4808'] },
  luxembourg: { name: 'John of Luxembourg', role: 'Count of Ligny, Burgundian captain', skin: '#f0c19a', hair: 'bowl', hairCol: '#3a2616', brow: '#2a1a0e', eyes: 'stern', patch: -1, cloth: 'tabard', arms: 'luxembourg', bg: ['#c24a3a', '#4a120e'], age: 1 },
  charlesVII: { name: 'Charles VII', role: 'The Dauphin, King of France', skin: '#efc39a', hair: 'bowl', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'narrow', cloth: 'gown', clothCol: '#2b4a8a', fur: '#8a6a4a', hat: 'chaperon', hatCol: '#3a2a4a', bg: ['#3b64c4', '#10214f'] },
  /* campaign: the Wars of the Roses */
  thomasHoward: { name: 'Thomas Howard', role: "Squire of King Edward's household", skin: '#f2c49c', hair: 'long', hairCol: '#6b4a2a', brow: '#4a2e1a', eyes: 'round', cloth: 'doublet', clothCol: '#7a2442', over: '#23324f', fur: '#6b4a2a', chain: 'york', hat: 'cap', bg: ['#7a2442', '#2a0f18'], prop: 'quill' },
  edwardMarch: { name: 'Edward, Earl of March', role: 'Heir of the Duke of York, aged 18', skin: '#f3c7a0', hair: 'long', hairCol: '#9a6a3a', brow: '#6b4222', eyes: 'round', cloth: 'tabard', arms: 'whiteRose', hat: 'circlet', bg: ['#7a2442', '#2a0f18'] },
  edward: { name: 'Edward IV', role: 'King of England', skin: '#f3c7a0', hair: 'long', hairCol: '#9a6a3a', brow: '#6b4222', eyes: 'round', cloth: 'tabard', arms: 'sunne', chain: 'york', hat: 'crown', bg: ['#7a2442', '#2a0f18'] },
  fauconberg: { name: 'Lord Fauconberg', role: 'William Neville, veteran of France', skin: '#efc39a', hair: 'bowl', hairCol: '#9a9088', brow: '#7a7066', eyes: 'stern', cloth: 'tabard', arms: 'neville', bg: ['#c24a3a', '#4a120e'], age: 2 },
  gloucester: { name: 'Richard of Gloucester', role: "The king's youngest brother, aged 18", skin: '#f2c49c', hair: 'long', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'round', cloth: 'tabard', arms: 'boarBadge', bg: ['#3b64c4', '#10214f'] },
  richard3: { name: 'Richard III', role: 'King of England', skin: '#f0c19a', hair: 'long', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'stern', cloth: 'tabard', arms: 'royal', chain: 'york', hat: 'crown', bg: ['#7a2442', '#2a0f18'], age: 1 },
  henryVI: { name: 'Henry VI', role: 'King of England', skin: '#efc8a4', hair: 'bowl', hairCol: '#6b4a2a', brow: '#5a3a22', eyes: 'kind', cloth: 'gown', clothCol: '#1d1a17', fur: '#8a6a4a', chain: 'lancaster', hat: 'crown', bg: ['#c24a3a', '#4a120e'] },
  margaret: { name: 'Margaret of Anjou', role: 'Queen of England', skin: '#f5cfb0', hair: 'none', brow: '#5a3a22', eyes: 'stern', cloth: 'gown', clothCol: '#b8312a', fur: '#f4efe2', ermine: true, hat: 'queen', bg: ['#c24a3a', '#4a120e'] },
  jasper: { name: 'Jasper Tudor', role: 'Earl of Pembroke', skin: '#efc39a', hair: 'bowl', hairCol: '#3a2616', brow: '#2a1a0e', eyes: 'stern', cloth: 'tabard', arms: 'jasper', bg: ['#2f8a4c', '#16381f'] },
  owen: { name: 'Owen Tudor', role: "Jasper's father", skin: '#eab98f', hair: 'bob', hairCol: '#b5aca0', brow: '#8a8278', eyes: 'kind', beard: 'full', beardCol: '#c2bab0', mustache: 'full', mustacheCol: '#c2bab0', cloth: 'tabard', arms: 'owenTudor', bg: ['#2f8a4c', '#16381f'], age: 2 },
  somerset: { name: 'The Duke of Somerset', role: 'Henry Beaufort', skin: '#f2c49c', hair: 'bowl', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'stern', cloth: 'tabard', arms: 'somerset', bg: ['#3b64c4', '#10214f'] },
  northumberland: { name: 'The Earl of Northumberland', role: 'Henry Percy', skin: '#efc39a', hair: 'bowl', hairCol: '#8a6a4a', brow: '#6a4a2e', eyes: 'stern', cloth: 'tabard', arms: 'percy', bg: ['#d7a93a', '#6a4808'], age: 1 },
  warwick: { name: 'The Earl of Warwick', role: '"The Kingmaker"', skin: '#efc39a', hair: 'bowl', hairCol: '#3a2616', brow: '#2a1a0e', eyes: 'stern', cloth: 'tabard', arms: 'warwick', bg: ['#c24a3a', '#4a120e'], age: 1 },
  montagu: { name: 'Marquess Montagu', role: "John Neville, Warwick's brother", skin: '#f0c19a', hair: 'bowl', hairCol: '#4a2e1a', brow: '#3a2414', eyes: 'round', cloth: 'tabard', arms: 'neville', bg: ['#c24a3a', '#4a120e'], age: 1 },
  somersetE: { name: 'The Duke of Somerset', role: 'Edmund Beaufort', skin: '#f2c49c', hair: 'bowl', hairCol: '#8a5a32', brow: '#6b4222', eyes: 'stern', cloth: 'tabard', arms: 'somerset', bg: ['#3b64c4', '#10214f'] },
  princeEdward: { name: 'Edward of Westminster', role: 'Prince of Wales, aged 17', skin: '#f5cba6', hair: 'long', hairCol: '#8a6238', brow: '#6b4a2a', eyes: 'round', cloth: 'tabard', arms: 'princeWales', hat: 'circlet', bg: ['#c24a3a', '#4a120e'] },
  henryTudor: { name: 'Henry Tudor', role: 'Earl of Richmond', skin: '#efc39a', hair: 'long', hairCol: '#6b4a2a', brow: '#4a2e1a', eyes: 'narrow', cloth: 'tabard', arms: 'tudorDragon', hat: 'cap', bg: ['#2f8a4c', '#16381f'] },
  oxfordT: { name: 'The Earl of Oxford', role: "John de Vere, Henry's captain", skin: '#efc39a', hair: 'bowl', hairCol: '#5a3a22', brow: '#4a2e1a', eyes: 'stern', cloth: 'tabard', arms: 'oxford', bg: ['#c24a3a', '#4a120e'], age: 1 },
  norfolk: { name: 'John Howard', role: 'Duke of Norfolk', skin: '#efc39a', hair: 'bowl', hairCol: '#9a9088', brow: '#7a7066', eyes: 'stern', cloth: 'tabard', arms: 'howard', bg: ['#c24a3a', '#4a120e'], age: 2 },
  stanleyW: { name: 'Sir William Stanley', role: "Lord Stanley's brother", skin: '#efc39a', hair: 'bowl', hairCol: '#6b4a2a', brow: '#4a2e1a', eyes: 'narrow', cloth: 'tabard', arms: 'stanley', bg: ['#d9d2c0', '#5a5347'], age: 1 },
});
// Joan carries her standard
Object.assign(PORTRAITS.joan, { hairCol: '#2e2016', brow: '#2e2016', back: 'banner', top: -24 });
// the same sitter under a second leader key (a hero in one campaign, a commander in another)
for (const [a, b] of [['saladinE', 'saladin'], ['adilE', 'adil'], ['balianH', 'balian'], ['raynaldH', 'raynald']]) PORTRAITS[a] = PORTRAITS[b];

/* ===== src/art/17c-portraits3.js ===== */
/* Roll to War: portraits for the three Indian campaigns. No portraits survive of anyone before the Mughals, so
   the kings are drawn from the temple sculpture and Jain painting of their time: crowns and turbans, big earrings,
   necklaces and bare chests in the south; the Mughals and Afghans from the painted manuscripts of Akbar's reign.
   New clothes (jama, quilted coat, lamellar, bare chest with jewels, a veiled lady's dress), turbans, crowns,
   helmets, a veil, parted hair, a palm-leaf book, and face jewellery (tilak, earrings, nose ring). */

const hx0 = 50, hy0 = 47;
const pStroke = (c, lw = 3) => { c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); };

/* ---------- clothes ---------- */
PX.cloth.jama = function (c, P, fillSh, shoulders) {
  // the wrapped coat of the Rajputs and Mughals, tied under the arm, with a gold edge
  const cl = P.clothCol || '#f4efe2';
  fillSh(cl);
  c.save(); shoulders(); c.clip();
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(68, 80, 40, 44);
  c.strokeStyle = shade(cl, -0.2); c.lineWidth = 1.5; for (const x of [20, 30, 78, 88]) { c.beginPath(); c.moveTo(x, 96); c.quadraticCurveTo(x + 2, 110, x, 124); c.stroke(); }
  c.beginPath(); c.moveTo(38, 80); c.quadraticCurveTo(48, 102, 70, 124); c.lineTo(77, 124); c.quadraticCurveTo(54, 100, 45, 80); c.closePath(); c.fillStyle = P.trim || PAL.gold; c.fill();
  c.restore();
  if (P.pearls) for (const [r, n] of [[13, 9], [18, 11]]) for (let i = 0; i <= n; i++) { const a = Math.PI * (0.12 + (0.76 * i) / n); c.beginPath(); circ(c, 50 + Math.cos(a) * r * 1.2, 76 + Math.sin(a) * r, 1.9); c.fillStyle = '#f7f3ea'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(40,30,20,0.6)'; c.stroke(); }
};
PX.cloth.quilted = function (c, P, fillSh, shoulders) {
  // a quilted war coat with a standing collar and gold buttons
  const cl = P.clothCol || '#b8312a';
  fillSh(cl);
  c.save(); shoulders(); c.clip();
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1.3; for (let x = 4; x < 100; x += 6) { c.beginPath(); c.moveTo(x, 80); c.lineTo(x + (x - 50) * 0.1, 124); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(68, 80, 40, 44);
  c.restore();
  c.beginPath(); c.moveTo(36, 80); c.quadraticCurveTo(50, 88, 64, 80); c.lineTo(64, 85); c.quadraticCurveTo(50, 93, 36, 85); c.closePath(); c.fillStyle = shade(cl, -0.25); c.fill(); pStroke(c, 2);
  for (let i = 0; i < 4; i++) { c.beginPath(); circ(c, 50, 96 + i * 7, 2); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1); }
};
PX.cloth.lamellar = function (c, P, fillSh, shoulders) {
  // Turkish lamellar: rows of small steel plates laced together, a coloured collar
  fillSh(PAL.steel);
  c.save(); shoulders(); c.clip();
  for (let r = 0; r < 7; r++) for (let q = 0; q < 16; q++) { const x = -2 + q * 7 + (r % 2) * 3.5, y = 84 + r * 6.5; c.beginPath(); rr(c, x, y, 6, 7, 2); c.fillStyle = (q + r) % 3 ? '#c9d0d8' : '#a9b2bc'; c.fill(); c.strokeStyle = 'rgba(40,46,56,0.5)'; c.lineWidth = 0.9; c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(68, 80, 40, 44);
  c.restore();
  c.beginPath(); c.moveTo(34, 80); c.quadraticCurveTo(50, 90, 66, 80); c.lineTo(66, 86); c.quadraticCurveTo(50, 96, 34, 86); c.closePath(); c.fillStyle = P.clothCol || '#2a2320'; c.fill(); pStroke(c, 2);
};
PX.cloth.bare = function (c, P, fillSh, shoulders) {
  // a southern king: bare chest, the sacred thread, a scarf over one shoulder, a broad gold collar
  fillSh(P.skin);
  c.save(); shoulders(); c.clip();
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(70, 80, 40, 44);
  c.strokeStyle = '#f7f3ea'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(28, 84); c.quadraticCurveTo(46, 104, 66, 124); c.stroke();
  if (P.clothCol) { c.beginPath(); c.moveTo(64, 80); c.quadraticCurveTo(84, 84, 102, 100); c.lineTo(102, 124); c.lineTo(86, 124); c.quadraticCurveTo(80, 100, 60, 88); c.closePath(); c.fillStyle = P.clothCol; c.fill(); pStroke(c, 2); c.strokeStyle = PAL.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(62, 87); c.quadraticCurveTo(80, 99, 86, 124); c.stroke(); }
  c.restore();
  c.beginPath(); c.moveTo(31, 82); c.quadraticCurveTo(50, 104, 69, 82); c.lineTo(63, 80); c.quadraticCurveTo(50, 94, 37, 80); c.closePath(); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 2);
  for (const [x, y, col] of [[40, 88, '#c8372d'], [50, 93, '#2f8a4c'], [60, 88, '#c8372d']]) { c.beginPath(); circ(c, x, y, 2.3); c.fillStyle = col; c.fill(); pStroke(c, 1); }
  for (const x of [6, 94]) { c.beginPath(); rr(c, x - 6, 106, 12, 5, 2); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1.6); }
};
PX.cloth.lady = function (c, P, fillSh, shoulders) {
  // a bodice with a scarf (odhni or pallu) drawn across from the left shoulder
  const cl = P.clothCol || '#b8312a', sc = P.scarf || shade(cl, 0.25);
  fillSh(cl);
  c.save(); shoulders(); c.clip();
  c.beginPath(); c.moveTo(22, 84); c.quadraticCurveTo(46, 104, 64, 124); c.lineTo(84, 124); c.quadraticCurveTo(58, 100, 36, 80); c.closePath(); c.fillStyle = sc; c.fill(); pStroke(c, 2);
  c.strokeStyle = PAL.gold; c.lineWidth = 2.4; c.beginPath(); c.moveTo(36, 81); c.quadraticCurveTo(58, 101, 82, 124); c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(70, 80, 40, 44);
  c.restore();
  c.beginPath(); c.moveTo(38, 80); c.quadraticCurveTo(50, 94, 62, 80); c.strokeStyle = PAL.gold; c.lineWidth = 2.6; c.stroke();
  c.beginPath(); circ(c, 50, 93, 3); c.fillStyle = '#c8372d'; c.fill(); pStroke(c, 1.2);
};

/* ---------- hair ---------- */
PX.hairFront.parted = function (c, P, hc) {
  const hx = hx0, hy = hy0;
  c.beginPath(); c.moveTo(hx - 23, hy); c.quadraticCurveTo(hx - 24, hy - 30, hx, hy - 30); c.quadraticCurveTo(hx + 24, hy - 30, hx + 23, hy); c.quadraticCurveTo(hx + 18, hy - 16, hx + 2, hy - 20); c.lineTo(hx, hy - 17); c.lineTo(hx - 2, hy - 20); c.quadraticCurveTo(hx - 18, hy - 16, hx - 23, hy); c.closePath(); c.fillStyle = hc; c.fill(); pStroke(c, 2.5);
};
PX.hairBack.parted = function (c, P, hc) {
  c.beginPath(); c.moveTo(24, 40); c.quadraticCurveTo(20, 70, 30, 76); c.lineTo(70, 76); c.quadraticCurveTo(80, 70, 76, 40); c.closePath(); c.fillStyle = hc; c.fill(); pStroke(c, 3);
};

/* ---------- headgear ---------- */
PX.hatTop.pagri = -2; PX.hatTop.mughalTurban = -8; PX.hatTop.afghanTurban = -4; PX.hatTop.kirit = -16; PX.hatTop.odhni = -2; PX.hatTop.cone = -14; PX.hatTop.khud = -14;
function sarpech(c, x, y, plume) {
  if (plume) { c.beginPath(); c.moveTo(x - 1, y - 2); c.bezierCurveTo(x - 12, y - 14, x - 6, y - 32, x + 6, y - 38); c.bezierCurveTo(x + 4, y - 24, x + 6, y - 12, x + 3, y - 2); c.closePath(); c.fillStyle = plume; c.fill(); pStroke(c, 1.8); }
  c.beginPath(); ell(c, x, y, 4.2, 5.2); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1.6);
  c.beginPath(); circ(c, x, y, 2); c.fillStyle = '#c8372d'; c.fill();
}
PX.hat.pagri = function (c, P) {
  const hx = hx0, hy = hy0, col = P.hatCol || '#f4efe2';
  const tb = () => { c.beginPath(); c.moveTo(hx - 26, hy - 9); c.quadraticCurveTo(hx - 33, hy - 30, hx - 16, hy - 41); c.quadraticCurveTo(hx + 2, hy - 50, hx + 18, hy - 42); c.quadraticCurveTo(hx + 33, hy - 31, hx + 26, hy - 9); c.quadraticCurveTo(hx, hy - 19, hx - 26, hy - 9); c.closePath(); };
  tb(); c.fillStyle = col; c.fill(); pStroke(c);
  c.save(); tb(); c.clip(); c.strokeStyle = shade(col, -0.22); c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(hx - 34, hy - 12 - i * 6); c.quadraticCurveTo(hx, hy - 30 - i * 3, hx + 34, hy - 20 - i * 6); c.stroke(); } if (P.hatBand) { c.strokeStyle = P.hatBand; c.lineWidth = 3.5; c.beginPath(); c.moveTo(hx - 30, hy - 14); c.quadraticCurveTo(hx, hy - 24, hx + 30, hy - 16); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(hx + 12, hy - 52, 22, 44); c.restore();
  if (P.jewel !== false) sarpech(c, hx + 8, hy - 26, P.plume);
};
PX.hat.mughalTurban = function (c, P) {
  const hx = hx0, hy = hy0, col = P.hatCol || '#f7f3ea';
  if (P.taj) { c.beginPath(); c.moveTo(hx - 10, hy - 30); c.lineTo(hx - 4, hy - 70); c.quadraticCurveTo(hx, hy - 76, hx + 4, hy - 70); c.lineTo(hx + 10, hy - 30); c.closePath(); c.fillStyle = P.taj; c.fill(); pStroke(c); c.strokeStyle = PAL.gold; c.lineWidth = 2.2; c.beginPath(); c.moveTo(hx - 7, hy - 48); c.lineTo(hx + 7, hy - 48); c.moveTo(hx - 5, hy - 60); c.lineTo(hx + 5, hy - 60); c.stroke(); }
  else { c.beginPath(); c.moveTo(hx - 9, hy - 34); c.quadraticCurveTo(hx - 7, hy - 54, hx, hy - 55); c.quadraticCurveTo(hx + 7, hy - 54, hx + 9, hy - 34); c.closePath(); c.fillStyle = P.cap || '#b8312a'; c.fill(); pStroke(c, 2.5); }
  const tb = () => { c.beginPath(); c.moveTo(hx - 27, hy - 8); c.quadraticCurveTo(hx - 35, hy - 32, hx - 14, hy - 42); c.quadraticCurveTo(hx, hy - 47, hx + 14, hy - 42); c.quadraticCurveTo(hx + 35, hy - 32, hx + 27, hy - 8); c.quadraticCurveTo(hx, hy - 18, hx - 27, hy - 8); c.closePath(); };
  tb(); c.fillStyle = col; c.fill(); pStroke(c);
  c.save(); tb(); c.clip(); c.strokeStyle = shade(col, -0.2); c.lineWidth = 1.8; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(hx - 36, hy - 10 - i * 5); c.quadraticCurveTo(hx, hy - 24 - i * 5 + (i % 2 ? 5 : -3), hx + 36, hy - 12 - i * 5); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(hx + 12, hy - 50, 24, 44); c.restore();
  if (P.jewel !== false) sarpech(c, hx + 2, hy - 28, P.plume || '#f7f3ea');
};
PX.hat.afghanTurban = function (c, P) {
  const hx = hx0, hy = hy0, col = P.hatCol || '#f4efe2';
  c.beginPath(); c.moveTo(hx + 20, hy - 18); c.quadraticCurveTo(hx + 34, hy, hx + 30, hy + 30); c.lineTo(hx + 22, hy + 30); c.quadraticCurveTo(hx + 26, hy + 4, hx + 14, hy - 12); c.closePath(); c.fillStyle = shade(col, -0.1); c.fill(); pStroke(c, 2.5);
  const tb = () => { c.beginPath(); c.moveTo(hx - 29, hy - 8); c.quadraticCurveTo(hx - 38, hy - 34, hx - 16, hy - 44); c.quadraticCurveTo(hx + 2, hy - 50, hx + 18, hy - 44); c.quadraticCurveTo(hx + 38, hy - 34, hx + 29, hy - 8); c.quadraticCurveTo(hx, hy - 18, hx - 29, hy - 8); c.closePath(); };
  tb(); c.fillStyle = col; c.fill(); pStroke(c);
  c.save(); tb(); c.clip(); c.strokeStyle = shade(col, -0.2); c.lineWidth = 2.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(hx - 38, hy - 12 - i * 7); c.quadraticCurveTo(hx, hy - 34 - i * 4, hx + 38, hy - 12 - i * 7); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(hx + 14, hy - 52, 24, 44); c.restore();
  if (P.jewel) sarpech(c, hx, hy - 26, P.plume);
};
PX.hat.kirit = function (c, P) {
  // a tall crown of gold in tiers, with a jewelled band and a finial
  const hx = hx0, hy = hy0, H = P.crownH || 34, y0 = hy - 16;
  const cr = () => { c.beginPath(); c.moveTo(hx - 24, y0 + 2); c.lineTo(hx - 21, y0 - 8); c.quadraticCurveTo(hx - 12, y0 - 8 - H * 0.75, hx, y0 - 8 - H); c.quadraticCurveTo(hx + 12, y0 - 8 - H * 0.75, hx + 21, y0 - 8); c.lineTo(hx + 24, y0 + 2); c.closePath(); };
  cr(); c.fillStyle = PAL.gold; c.fill(); pStroke(c);
  c.save(); cr(); c.clip();
  c.strokeStyle = PAL.goldD; c.lineWidth = 2; for (let i = 1; i < 5; i++) { const y = y0 - 8 - (H * i) / 5; c.beginPath(); c.moveTo(hx - 24, y + 3); c.quadraticCurveTo(hx, y - 2, hx + 24, y + 3); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(hx - 12, y0 - 8 - H, 5, H); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx + 8, y0 - 10 - H, 20, H + 10);
  c.restore();
  for (let i = 1; i < 5; i++) { const y = y0 - 8 - (H * i) / 5 + 1.5, w = 20 * (1 - i / 6); for (const sx of [-1, 1]) { c.beginPath(); circ(c, hx + sx * w * 0.55, y, 1.6); c.fillStyle = i % 2 ? '#c8372d' : '#2f8a4c'; c.fill(); } }
  c.beginPath(); rr(c, hx - 25, y0 - 6, 50, 9, 3); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 2.4);
  for (const [x, col] of [[hx - 14, '#2f8a4c'], [hx, '#c8372d'], [hx + 14, '#2f8a4c']]) { c.beginPath(); circ(c, x, y0 - 1.5, 2.6); c.fillStyle = col; c.fill(); pStroke(c, 1); }
  c.beginPath(); ell(c, hx, y0 - 12 - H, 4, 5); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1.8);
};
PX.hat.odhni = function (c, P) {
  // a veil over the hair, falling to the shoulders, with a gold border; a small jewel on the parting
  const hx = hx0, hy = hy0, col = P.hatCol || '#f4efe2';
  const vl = () => { c.beginPath(); c.moveTo(hx - 33, hy + 34); c.quadraticCurveTo(hx - 38, hy - 10, hx - 28, hy - 28); c.quadraticCurveTo(hx, hy - 50, hx + 28, hy - 28); c.quadraticCurveTo(hx + 38, hy - 10, hx + 33, hy + 34);
    c.lineTo(hx + 22, hy + 34); c.quadraticCurveTo(hx + 25, hy - 8, hx + 18, hy - 18); c.quadraticCurveTo(hx, hy - 30, hx - 18, hy - 18); c.quadraticCurveTo(hx - 25, hy - 8, hx - 22, hy + 34); c.closePath(); };
  vl(); c.fillStyle = col; c.fill(); pStroke(c);
  c.save(); vl(); c.clip(); c.strokeStyle = shade(col, -0.18); c.lineWidth = 1.6; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx + sx * (26 + i * 3), hy - 18 + i * 6); c.quadraticCurveTo(hx + sx * (32 + i * 2), hy + 10, hx + sx * (27 + i * 2), hy + 34); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(hx + 16, hy - 40, 24, 80); c.restore();
  c.beginPath(); c.moveTo(hx - 22, hy + 34); c.quadraticCurveTo(hx - 25, hy - 8, hx - 18, hy - 18); c.quadraticCurveTo(hx, hy - 30, hx + 18, hy - 18); c.quadraticCurveTo(hx + 25, hy - 8, hx + 22, hy + 34); c.strokeStyle = PAL.gold; c.lineWidth = 3; c.stroke();
  if (P.tiara) { c.beginPath(); c.moveTo(hx, hy - 23); c.lineTo(hx, hy - 15); c.strokeStyle = PAL.gold; c.lineWidth = 1.4; c.stroke(); c.beginPath(); ell(c, hx, hy - 13, 3.2, 3.8); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1.3); c.beginPath(); circ(c, hx, hy - 13, 1.5); c.fillStyle = '#c8372d'; c.fill(); }
};
PX.hat.cone = function (c, P) {
  // a conical steel helmet with a mail curtain, and an optional turban wound round it
  const hx = hx0, hy = hy0;
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(hx + sx * 22, hy - 12); c.lineTo(hx + sx * 30, hy - 10); c.lineTo(hx + sx * 30, hy + 24); c.quadraticCurveTo(hx + sx * 25, hy + 28, hx + sx * 21, hy + 22); c.closePath(); c.fillStyle = PAL.mail; c.fill(); pStroke(c, 2.2); c.save(); c.clip(); mailDots(c, hx + (sx < 0 ? -32 : 18), hy - 12, hx + (sx < 0 ? -18 : 32), hy + 28, 3.4, 'rgba(40,45,55,0.35)'); c.restore(); }
  c.beginPath(); c.moveTo(hx - 25, hy - 12); c.quadraticCurveTo(hx - 20, hy - 46, hx - 2, hy - 56); c.lineTo(hx, hy - 66); c.lineTo(hx + 2, hy - 56); c.quadraticCurveTo(hx + 20, hy - 46, hx + 25, hy - 12); c.closePath(); c.fillStyle = PAL.steel; c.fill(); pStroke(c);
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx - 8, hy - 36, 3, 8, 0.3); c.fill();
  c.beginPath(); rr(c, hx - 27, hy - 18, 54, 7, 2.5); c.fillStyle = P.hatCol || PAL.gold; c.fill(); pStroke(c, 2.2);
  c.beginPath(); rr(c, hx - 2.5, hy - 18, 5, 22, 1.8); c.fillStyle = PAL.steelD; c.fill(); pStroke(c, 1.6);
};
PX.hat.khud = function (c, P) {
  // the Mughal khula-khud: steel bowl, spike, twin plumes, sliding nasal, mail at the sides
  const hx = hx0, hy = hy0;
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(hx + sx * 22, hy - 10); c.lineTo(hx + sx * 30, hy - 8); c.lineTo(hx + sx * 30, hy + 26); c.quadraticCurveTo(hx + sx * 25, hy + 30, hx + sx * 21, hy + 24); c.closePath(); c.fillStyle = PAL.mail; c.fill(); pStroke(c, 2.2); }
  if (P.plume !== false) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(hx + sx * 6, hy - 44); c.quadraticCurveTo(hx + sx * 22, hy - 64, hx + sx * 14, hy - 80); c.quadraticCurveTo(hx + sx * 8, hy - 62, hx + sx * 2, hy - 44); c.closePath(); c.fillStyle = P.plume || '#f7f3ea'; c.fill(); pStroke(c, 1.8); }
  c.beginPath(); c.moveTo(hx - 26, hy - 10); c.bezierCurveTo(hx - 26, hy - 50, hx + 26, hy - 50, hx + 26, hy - 10); c.closePath(); c.fillStyle = PAL.steel; c.fill(); pStroke(c);
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx - 10, hy - 32, 4, 7, 0.4); c.fill();
  c.beginPath(); rr(c, hx - 27, hy - 16, 54, 6, 2.2); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 2);
  c.beginPath(); c.moveTo(hx - 2, hy - 42); c.lineTo(hx, hy - 58); c.lineTo(hx + 2, hy - 42); c.closePath(); c.fillStyle = PAL.steelL; c.fill(); pStroke(c, 1.6);
  c.beginPath(); rr(c, hx - 2.5, hy - 20, 5, 30, 1.8); c.fillStyle = PAL.steelD; c.fill(); pStroke(c, 1.6);
};

/* ---------- props ---------- */
PX.prop.palmleaf = function (c, P) {
  // a palm-leaf book: long narrow leaves strung on a cord between wooden boards
  c.save(); c.translate(56, 104); c.rotate(-0.1);
  c.beginPath(); rr(c, 0, 0, 40, 11, 2); c.fillStyle = '#a0703c'; c.fill(); pStroke(c, 2.2);
  c.beginPath(); rr(c, 1, -6, 38, 7, 1.5); c.fillStyle = '#e9d6a0'; c.fill(); pStroke(c, 1.8);
  c.strokeStyle = 'rgba(80,50,20,0.55)'; c.lineWidth = 0.9; for (const y of [-4, -2]) { c.beginPath(); c.moveTo(4, y); c.lineTo(36, y); c.stroke(); }
  c.beginPath(); circ(c, 12, 5.5, 1.6); circ(c, 28, 5.5, 1.6); c.fillStyle = '#2a1d16'; c.fill();
  c.restore();
  c.beginPath(); circ(c, 58, 116, 5); c.fillStyle = shade(P.skin, -0.05); c.fill(); pStroke(c, 2.2);
};

/* ---------- jewellery on the face, drawn last (see RTW.portrait) ---------- */
PX.after = function (c, P) {
  const hx = hx0, hy = hy0;
  if (P.tilak === 'shaiva') { c.strokeStyle = '#f7f3ea'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx - 9, hy - 14 + i * 3); c.lineTo(hx + 9, hy - 14 + i * 3); c.stroke(); } c.beginPath(); circ(c, hx, hy - 11, 1.8); c.fillStyle = '#c8372d'; c.fill(); }
  else if (P.tilak) { c.beginPath(); rr(c, hx - 1.8, hy - 17, 3.6, 9, 1.8); c.fillStyle = P.tilak; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(40,20,10,0.5)'; c.stroke(); }
  if (P.bindi) { c.beginPath(); circ(c, hx, hy - 9, 2.2); c.fillStyle = P.bindi; c.fill(); }
  if (P.earrings) for (const sx of [-1, 1]) { const ex = hx + sx * 23.5, ey = hy + 10; if (P.earrings === 'hoop') { c.beginPath(); c.arc(ex, ey + 5, 5, 0, TAU); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = PAL.gold; c.stroke(); } else { c.beginPath(); ell(c, ex, ey + 4, 3.6, 5); c.fillStyle = PAL.gold; c.fill(); pStroke(c, 1.4); c.beginPath(); circ(c, ex, ey + 4, 1.5); c.fillStyle = '#c8372d'; c.fill(); } }
  if (P.nose) { c.beginPath(); c.arc(hx - 6, hy + 11, 3.2, -0.5, 4.2); c.lineWidth = 1.4; c.strokeStyle = PAL.goldD; c.stroke(); }
};

/* ---------- the sitters ---------- */
const SK_IN = '#c98c5c', SK_S = '#a96b40', SK_N = '#e2b287', SK_M = '#e6b68c', SK_A = '#d8a172', HAIR = '#1e1612';
Object.assign(PORTRAITS, {
  // Prithviraj Chauhan
  jayanaka: { name: 'Jayanaka', role: 'Poet at the court of Ajmer', skin: '#dcaa80', hair: 'none', brow: '#3a2a1e', eyes: 'kind', beard: 'short', beardCol: '#6a5a4a', mustache: 'full', mustacheCol: '#5a4a3a', cloth: 'jama', clothCol: '#f4efe2', trim: '#c8372d', hat: 'pagri', hatCol: '#f4efe2', jewel: false, tilak: '#c8372d', prop: 'palmleaf', bg: ['#c29a5a', '#5a3b1c'], age: 1 },
  prithviraj: { name: 'Prithviraj Chauhan', role: 'King of Ajmer and Delhi', skin: SK_IN, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', mustache: 'curl', mustacheCol: HAIR, cloth: 'jama', clothCol: '#f2c22e', trim: '#b8312a', pearls: true, hat: 'kirit', crownH: 30, earrings: 'drop', tilak: '#c8372d', bg: ['#c24a3a', '#4a120e'], top: -18 },
  naikidevi: { name: 'Queen Naikidevi', role: 'Queen regent of Gujarat', skin: SK_IN, hair: 'parted', hairCol: HAIR, brow: HAIR, eyes: 'round', cloth: 'lady', clothCol: '#b8312a', scarf: '#f2c22e', hat: 'odhni', hatCol: '#e8a0b8', tiara: true, earrings: 'hoop', nose: true, bindi: '#c8372d', bg: ['#3b64c4', '#10214f'] },
  govindaraja: { name: 'Govindaraja', role: 'Lord of Delhi', skin: SK_IN, hair: 'none', brow: HAIR, eyes: 'stern', beard: 'short', beardCol: HAIR, mustache: 'curl', mustacheCol: HAIR, cloth: 'quilted', clothCol: '#b8312a', hat: 'pagri', hatCol: '#f0a02c', hatBand: '#b8312a', plume: '#f7f3ea', earrings: 'hoop', bg: ['#d7a93a', '#6a4808'] },
  jayachandra: { name: 'Jayachandra', role: 'King of Kannauj and Varanasi', skin: SK_IN, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', beard: 'short', beardCol: '#4a3a2e', mustache: 'full', mustacheCol: '#4a3a2e', cloth: 'jama', clothCol: '#2f5fc4', pearls: true, hat: 'kirit', crownH: 28, earrings: 'drop', tilak: '#c8372d', bg: ['#d7a93a', '#6a4808'], age: 1, top: -18 },
  ghori: { name: "Mu'izz al-Din Muhammad", role: 'Sultan of Ghor, at Ghazni', skin: '#dba67c', hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'full', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'lamellar', clothCol: '#2a2320', hat: 'turbanHelm', hatCol: '#2a2320', bg: ['#5a5a64', '#16161c'] },
  ziyaDin: { name: 'Qazi Ziya al-Din', role: 'Judge of Tulak', skin: '#dba67c', hair: 'none', brow: '#cfc8bd', eyes: 'kind', beard: 'full', beardCol: '#d8d2c8', mustache: 'full', mustacheCol: '#d8d2c8', cloth: 'robe', clothCol: '#e8dcc0', mail: true, hat: 'turbanBig', hatCol: '#f7f3ea', bg: ['#8a6a44', '#3d2a18'], age: 2 },
  aibak: { name: 'Qutb al-Din Aibak', role: 'Commander of the vanguard', skin: SK_N, hair: 'none', brow: '#2a1d16', eyes: 'narrow', beard: 'goatee', beardCol: '#2a1d16', mustache: 'droop', mustacheCol: '#2a1d16', cloth: 'lamellar', clothCol: '#6a4a8a', hat: 'cone', hatCol: PAL.gold, bg: ['#6a4a8a', '#24163a'] },
  // the Mughals
  gulbadan: { name: 'Gulbadan Begum', role: "Babur's daughter", skin: SK_M, hair: 'parted', hairCol: '#4a4038', brow: '#6a5a4a', eyes: 'kind', cloth: 'lady', clothCol: '#2f6f4a', scarf: '#f4efe2', hat: 'odhni', hatCol: '#f7f3ea', tiara: true, earrings: 'drop', prop: 'book', bg: ['#4a9a5c', '#16381f'], age: 2 },
  babur: { name: 'Babur', role: 'The first Mughal emperor', skin: SK_M, hair: 'none', brow: '#2a1d16', eyes: 'narrow', beard: 'short', beardCol: '#2a1d16', mustache: 'droop', mustacheCol: '#2a1d16', cloth: 'jama', clothCol: '#2f6f4a', hat: 'mughalTurban', hatCol: '#f7f3ea', cap: '#b8312a', bg: ['#4a9a5c', '#16381f'] },
  humayun: { name: 'Humayun', role: 'The second Mughal emperor', skin: SK_M, hair: 'none', brow: '#2a1d16', eyes: 'kind', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'jama', clothCol: '#f2c22e', trim: '#b8312a', hat: 'mughalTurban', hatCol: '#f7f3ea', taj: '#b8312a', bg: ['#d7a93a', '#6a4808'], top: -30 },
  hamida: { name: 'Hamida Banu Begum', role: "Humayun's wife, Akbar's mother", skin: SK_M, hair: 'parted', hairCol: HAIR, brow: HAIR, eyes: 'round', cloth: 'lady', clothCol: '#7b3d91', scarf: '#f4efe2', hat: 'odhni', hatCol: '#f7f3ea', tiara: true, earrings: 'drop', bg: ['#8a4aa0', '#2a1030'] },
  akbar: { name: 'Akbar', role: 'Mughal emperor', skin: '#dba67c', hair: 'none', brow: '#2a1d16', eyes: 'stern', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'jama', clothCol: '#f7f3ea', pearls: true, hat: 'mughalTurban', hatCol: '#f2c22e', cap: '#2f6f4a', bg: ['#d7a93a', '#6a4808'], age: 1 },
  bairam: { name: 'Bairam Khan', role: 'Khan-i-Khanan, regent for Akbar', skin: SK_N, hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'full', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'quilted', clothCol: '#2f5fc4', hat: 'mughalTurban', hatCol: '#f7f3ea', cap: '#2f5fc4', bg: ['#5a86c0', '#1a2f52'], age: 1 },
  khanZaman: { name: 'Ali Quli Khan', role: 'Commander of the centre', skin: SK_N, hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'lamellar', clothCol: '#8a2a20', hat: 'khud', plume: '#8a2a20', bg: ['#c24a3a', '#4a120e'] },
  ibrahim: { name: 'Ibrahim Lodi', role: 'Sultan of Delhi', skin: SK_A, hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'full', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'robe', clothCol: '#8a2a20', hat: 'afghanTurban', hatCol: '#f7f3ea', jewel: true, bg: ['#c24a3a', '#4a120e'] },
  sanga: { name: 'Rana Sanga', role: 'Rana of Mewar', skin: SK_IN, hair: 'none', brow: HAIR, eyes: 'stern', beard: 'full', beardCol: HAIR, mustache: 'curl', mustacheCol: HAIR, patch: 1, cloth: 'quilted', clothCol: '#f0a02c', hat: 'pagri', hatCol: '#d9483b', hatBand: PAL.gold, plume: '#f7f3ea', earrings: 'hoop', bg: ['#f0a02c', '#6a3a08'], age: 1 },
  sherkhan: { name: 'Sher Khan', role: 'Afghan lord of Bihar', skin: SK_A, hair: 'none', brow: '#2a1d16', eyes: 'stern', beard: 'full', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'robe', clothCol: '#2f6a3a', mail: true, hat: 'afghanTurban', hatCol: '#f7f3ea', bg: ['#4a9a5c', '#16381f'], age: 1 },
  sikandar: { name: 'Sikandar Shah Sur', role: 'Afghan claimant to Delhi', skin: SK_A, hair: 'none', brow: '#2a1d16', eyes: 'round', beard: 'short', beardCol: '#2a1d16', mustache: 'full', mustacheCol: '#2a1d16', cloth: 'robe', clothCol: '#5a2a6a', hat: 'afghanTurban', hatCol: '#f7f3ea', jewel: true, bg: ['#8a4aa0', '#2a1030'] },
  hemu: { name: 'Hemu', role: 'Raja Vikramaditya', skin: SK_IN, hair: 'none', brow: HAIR, eyes: 'stern', mustache: 'full', mustacheCol: HAIR, cloth: 'jama', clothCol: '#f7f3ea', trim: '#c8372d', pearls: true, hat: 'pagri', hatCol: '#f7f3ea', hatBand: PAL.gold, tilak: '#c8372d', earrings: 'drop', bg: ['#c24a3a', '#4a120e'], age: 1 },
  // the Cholas and the Chalukyas
  ammangadevi: { name: 'Ammangadevi', role: 'Queen of Vengi', skin: SK_S, hair: 'parted', hairCol: HAIR, brow: HAIR, eyes: 'round', cloth: 'lady', clothCol: '#2f8a4c', scarf: '#f2c22e', hat: 'kirit', crownH: 18, earrings: 'hoop', nose: true, bindi: '#c8372d', bg: ['#c24a3a', '#4a120e'], top: -6 },
  rajendra1: { name: 'Rajendra Chola', role: 'The Chola who took the Ganges', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', mustache: 'curl', mustacheCol: HAIR, cloth: 'bare', clothCol: '#f2c22e', hat: 'kirit', crownH: 38, earrings: 'hoop', tilak: 'shaiva', bg: ['#c24a3a', '#4a120e'], age: 1, top: -24 },
  rajadhiraja: { name: 'Rajadhiraja', role: 'Chola king', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', beard: 'short', beardCol: HAIR, mustache: 'full', mustacheCol: HAIR, cloth: 'bare', clothCol: '#b8312a', hat: 'kirit', crownH: 36, earrings: 'hoop', tilak: 'shaiva', bg: ['#c24a3a', '#4a120e'], top: -22 },
  rajendra2: { name: 'Rajendra II', role: 'Chola king, crowned on the battlefield', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'round', mustache: 'curl', mustacheCol: HAIR, cloth: 'bare', clothCol: '#2f5fc4', hat: 'kirit', crownH: 34, earrings: 'hoop', tilak: 'shaiva', bg: ['#d7a93a', '#6a4808'], top: -20 },
  rajamahendra: { name: 'Rajamahendra', role: 'Chola prince', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'round', cloth: 'bare', clothCol: '#2f8a4c', hat: 'kirit', crownH: 22, earrings: 'hoop', tilak: 'shaiva', bg: ['#4a9a5c', '#16381f'], top: -10 },
  virarajendra: { name: 'Virarajendra', role: 'Chola king', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', mustache: 'curl', mustacheCol: HAIR, cloth: 'bare', clothCol: '#f7f3ea', hat: 'kirit', crownH: 36, earrings: 'hoop', tilak: 'shaiva', bg: ['#d7a93a', '#6a4808'], top: -22 },
  kulottunga: { name: 'Kulottunga I', role: "Ammangadevi's son, Chola king", skin: '#b37446', hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'round', mustache: 'full', mustacheCol: HAIR, cloth: 'bare', clothCol: '#2f5fc4', hat: 'kirit', crownH: 34, earrings: 'hoop', tilak: 'shaiva', bg: ['#c24a3a', '#4a120e'], top: -20 },
  jayasimha2: { name: 'Jayasimha II', role: 'Chalukya king, Jagadekamalla', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', beard: 'short', beardCol: HAIR, mustache: 'curl', mustacheCol: HAIR, cloth: 'bare', clothCol: '#f2c22e', hat: 'kirit', crownH: 30, earrings: 'drop', tilak: '#c8372d', bg: ['#e2b43a', '#6d4a0c'], top: -18 },
  someshvara: { name: 'Someshvara I', role: 'Chalukya king, Ahavamalla', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'stern', beard: 'full', beardCol: '#3a2a22', mustache: 'full', mustacheCol: '#3a2a22', cloth: 'bare', clothCol: '#b8312a', hat: 'kirit', crownH: 32, earrings: 'drop', tilak: '#c8372d', bg: ['#e2b43a', '#6d4a0c'], age: 1, top: -20 },
  valadeva: { name: 'Valadeva', role: 'Chalukya general', skin: SK_S, hair: 'none', brow: HAIR, eyes: 'stern', beard: 'short', beardCol: HAIR, mustache: 'curl', mustacheCol: HAIR, cloth: 'quilted', clothCol: '#b8312a', hat: 'pagri', hatCol: '#f4efe2', hatBand: '#b8312a', earrings: 'hoop', bg: ['#a63a30', '#3a0f0a'] },
  vikramaditya: { name: 'Vikramaditya', role: 'Chalukya prince', skin: SK_S, hair: 'long', hairCol: HAIR, brow: HAIR, eyes: 'round', mustache: 'thin', mustacheCol: HAIR, cloth: 'bare', clothCol: '#2f8a4c', hat: 'kirit', crownH: 22, earrings: 'drop', bg: ['#4a9a5c', '#16381f'], top: -10 },
  jananatha: { name: 'Jananatha', role: 'Chalukya commander in Vengi', skin: SK_S, hair: 'none', brow: HAIR, eyes: 'stern', mustache: 'full', mustacheCol: HAIR, cloth: 'quilted', clothCol: '#2f5fc4', hat: 'pagri', hatCol: '#f0a02c', hatBand: '#2f5fc4', earrings: 'hoop', bg: ['#5a86c0', '#1a2f52'] },
  bilhana: { name: 'Bilhana', role: 'Poet of the Chalukya court', skin: '#dcaa80', hair: 'none', brow: '#3a2a1e', eyes: 'kind', beard: 'short', beardCol: '#3a2a1e', mustache: 'full', mustacheCol: '#3a2a1e', cloth: 'jama', clothCol: '#f4efe2', trim: '#2f5fc4', hat: 'pagri', hatCol: '#f0a02c', jewel: false, tilak: '#c8372d', prop: 'palmleaf', bg: ['#e2b43a', '#6d4a0c'], age: 1 },
});

/* ===== src/art/18-maps.js ===== */
/* Roll to War: hand-drawn campaign maps. Geography is in [lon, lat]; coastlines are simplified by hand.
   RTW.campaignMap(c, x, y, w, h, key, t, o) draws the map and the battle route; returns node screen points. */
const MAPS = (RTW.MAPS = {
  hyw: {
    title: "The Hundred Years' War", sub: '1345 – 1424', view: [-4.6, 5.0, 42.9, 52.7], land: '#ecdfaa', land2: '#c8c47e',
    polys: [
      // Great Britain (south), closed off-map
      [[0.1, 54.2], [0.35, 53.3], [0.2, 52.88], [0.5, 52.95], [1.0, 52.96], [1.35, 52.9], [1.75, 52.62], [1.75, 52.45], [1.62, 52.18], [1.35, 51.96], [1.05, 51.78], [0.95, 51.62], [0.65, 51.53], [0.45, 51.5], [0.55, 51.44], [0.75, 51.44], [1.05, 51.36], [1.42, 51.38], [1.4, 51.2], [1.33, 51.12], [1.1, 51.07], [0.97, 50.91], [0.6, 50.85], [0.25, 50.74], [-0.14, 50.81], [-0.8, 50.72], [-1.1, 50.8], [-1.4, 50.85], [-1.55, 50.74], [-1.95, 50.7], [-2.45, 50.6], [-2.46, 50.51], [-2.95, 50.71], [-3.4, 50.62], [-3.55, 50.35], [-3.64, 50.22], [-4.15, 50.33], [-4.6, 50.33], [-5.05, 50.15], [-5.2, 49.96], [-5.55, 50.1], [-5.72, 50.07], [-5.5, 50.22], [-5.05, 50.43], [-4.75, 50.6], [-4.53, 50.99], [-4.2, 51.05], [-4.2, 51.2], [-3.5, 51.21], [-3.0, 51.3], [-2.7, 51.55], [-2.6, 51.62], [-3.0, 51.55], [-3.18, 51.45], [-3.6, 51.4], [-3.95, 51.6], [-4.3, 51.65], [-4.4, 51.73], [-4.7, 51.64], [-5.05, 51.6], [-5.25, 51.73], [-5.3, 51.88], [-5.0, 52.0], [-4.5, 52.15], [-4.1, 52.4], [-4.1, 52.8], [-4.5, 52.8], [-4.8, 52.8], [-4.4, 53.1], [-4.3, 53.4], [-4.3, 54.2]],
      // Ireland (east edge)
      [[-6.6, 54.2], [-6.1, 53.6], [-6.05, 53.2], [-6.2, 52.6], [-6.35, 52.2], [-6.6, 52.1], [-7.0, 52.0], [-7.0, 54.2]],
      // Europe
      [[4.8, 53.5], [4.6, 52.4], [4.1, 52.0], [3.6, 51.5], [3.2, 51.35], [2.9, 51.23], [2.37, 51.04], [1.86, 50.95], [1.58, 50.87], [1.6, 50.72], [1.62, 50.52], [1.56, 50.36], [1.62, 50.22], [1.75, 50.17], [1.6, 50.15], [1.45, 50.1], [1.37, 50.06], [1.08, 49.93], [0.72, 49.87], [0.37, 49.77], [0.2, 49.7], [0.1, 49.5], [0.35, 49.44], [0.22, 49.42], [-0.1, 49.3], [-0.6, 49.34], [-1.1, 49.39], [-1.25, 49.5], [-1.26, 49.69], [-1.62, 49.65], [-1.94, 49.72], [-1.85, 49.45], [-1.8, 49.25], [-1.6, 49.0], [-1.6, 48.84], [-1.5, 48.64], [-1.85, 48.7], [-2.0, 48.65], [-2.3, 48.68], [-2.75, 48.5], [-3.05, 48.8], [-3.45, 48.82], [-3.98, 48.72], [-4.4, 48.65], [-4.77, 48.4], [-4.55, 48.3], [-4.62, 48.2], [-4.3, 48.1], [-4.73, 48.03], [-4.37, 47.8], [-3.9, 47.85], [-3.37, 47.72], [-3.12, 47.48], [-2.85, 47.55], [-2.5, 47.3], [-2.2, 47.27], [-2.1, 47.1], [-2.0, 46.92], [-1.95, 46.7], [-1.8, 46.5], [-1.4, 46.35], [-1.15, 46.16], [-1.05, 45.95], [-1.2, 45.8], [-1.05, 45.62], [-1.06, 45.57], [-1.15, 45.2], [-1.25, 44.66], [-1.3, 44.2], [-1.45, 43.65], [-1.52, 43.48], [-1.78, 43.37], [-2.0, 43.32], [-2.9, 43.35], [-3.8, 43.47], [-4.8, 43.4], [-5.8, 43.6], [-6.5, 43.55], [-6.8, 43.55], [-6.8, 41.0], [2.0, 41.0], [2.17, 41.38], [3.2, 41.9], [3.17, 42.45], [3.05, 42.6], [3.1, 43.1], [3.5, 43.28], [4.0, 43.55], [4.43, 43.45], [5.0, 43.4], [5.37, 43.3], [6.0, 43.1], [6.5, 43.1], [6.5, 53.5]],
      // islands
      [[-1.58, 50.7], [-1.3, 50.77], [-1.07, 50.68], [-1.3, 50.58]], [[-2.25, 49.25], [-2.02, 49.23], [-2.05, 49.17], [-2.24, 49.17]], [[-2.67, 49.47], [-2.52, 49.5], [-2.53, 49.42]], [[-3.25, 47.37], [-3.08, 47.33], [-3.2, 47.28]], [[-1.56, 46.24], [-1.3, 46.2], [-1.42, 46.15]], [[-1.42, 46.05], [-1.2, 45.95], [-1.35, 45.8]],
    ],
    rivers: [
      [[0.65, 51.5], [0.1, 51.48], [-0.13, 51.5], [-0.5, 51.45], [-1.0, 51.5], [-1.25, 51.75]],
      [[0.25, 49.44], [0.75, 49.4], [1.1, 49.44], [1.5, 49.2], [1.8, 49.05], [2.1, 48.95], [2.35, 48.86], [2.7, 48.55], [3.3, 48.4], [4.07, 48.3]],
      [[-2.2, 47.27], [-1.55, 47.22], [-0.55, 47.47], [0.1, 47.26], [0.69, 47.39], [1.33, 47.59], [1.91, 47.9], [2.63, 47.69], [2.95, 47.3], [3.16, 46.99], [3.5, 46.5], [4.0, 45.9]],
      [[-1.05, 45.6], [-0.75, 45.35], [-0.55, 45.03], [-0.58, 44.84], [-0.2, 44.5], [0.62, 44.2], [1.1, 44.05], [1.44, 43.6]],
      [[-0.55, 45.03], [-0.24, 44.92], [0.48, 44.85], [1.0, 44.85], [1.5, 44.9]],
      [[-0.24, 44.92], [0.2, 45.05], [0.72, 45.18], [1.0, 45.3]],
      [[1.6, 50.18], [1.83, 50.1], [2.3, 49.89], [3.0, 49.85]],
      [[0.4, 46.58], [0.34, 46.58], [0.55, 46.2], [0.3, 45.8]],
    ],
    regions: [{ name: 'Gascony', col: 'blue', pts: [[-1.2, 45.6], [0.2, 45.6], [0.8, 45.1], [0.9, 44.3], [0.2, 43.6], [-1.45, 43.6]] }],
    forests: [[1.0, 49.2], [2.6, 49.3], [2.8, 48.4], [0.6, 48.3], [-0.6, 48.2], [1.8, 46.9], [0.8, 46.2], [1.8, 45.7], [-0.8, 44.3], [-0.3, 51.1], [0.4, 51.0], [2.4, 50.35], [3.2, 49.0], [3.6, 47.2]],
    hills: [[2.7, 45.6], [3.1, 45.2], [3.6, 45.1], [-0.4, 43.0], [0.8, 42.9], [2.0, 42.8], [-3.8, 50.6], [-3.6, 52.2]],
    cities: [['London', -0.13, 51.51], ['Canterbury', 1.08, 51.28, 'small'], ['Calais', 1.86, 50.95, 'small'], ['Paris', 2.35, 48.86], ['Rouen', 1.1, 49.44, 'small'], ['Orléans', 1.91, 47.9, 'small'], ['Bordeaux', -0.58, 44.84]],
    labels: [['ENGLAND', -1.9, 52.1, 'land'], ['FRANCE', 2.6, 46.6, 'land'], ['BRITTANY', -3.0, 48.2, 'small'], ['NORMANDY', -0.3, 48.95, 'small'], ['GASCONY', -0.3, 44.35, 'small'], ['English Channel', -2.3, 50.05, 'sea'], ['Bay of Biscay', -3.4, 45.2, 'sea']],
    battles: [['Auberoche', 0.87, 45.19, '1345'], ['Crécy', 1.88, 50.25, '1346'], ['Poitiers', 0.42, 46.51, '1356'], ['Agincourt', 2.13, 50.46, '1415'], ['Verneuil', 0.93, 48.74, '1424']],
    labelSide: [1, -1, 1, 1, -1],
    deco: { rose: [-3.9, 43.8], ship: [-3.3, 46.7] },
  },
  yi: {
    title: 'Admiral Yi', sub: 'Keep Beating the Drum · 1592 – 1598', view: [125.9, 129.25, 33.15, 37.35], land: '#eadfae', land2: '#c2c47e',
    polys: [
      [[126.1, 38.5], [126.1, 38.2], [126.5, 37.75], [126.6, 37.45], [126.75, 37.25], [126.85, 36.95], [126.6, 36.95], [126.4, 36.9], [126.15, 36.75], [126.35, 36.6], [126.45, 36.4], [126.55, 36.1], [126.7, 36.0], [126.55, 35.8], [126.47, 35.6], [126.6, 35.52], [126.45, 35.35], [126.35, 35.1], [126.38, 34.8], [126.45, 34.6], [126.53, 34.3], [126.75, 34.35], [126.8, 34.5], [127.0, 34.45], [127.25, 34.6], [127.3, 34.5], [127.4, 34.43], [127.5, 34.62], [127.55, 34.85], [127.62, 34.75], [127.7, 34.6], [127.78, 34.78], [127.75, 34.95], [127.87, 34.97], [128.0, 35.0], [128.07, 35.05], [128.15, 34.95], [128.3, 34.92], [128.4, 34.85], [128.43, 34.8], [128.5, 34.88], [128.55, 35.02], [128.6, 35.15], [128.75, 35.08], [128.9, 35.05], [129.0, 35.05], [129.1, 35.1], [129.2, 35.18], [129.35, 35.45], [129.45, 35.8], [129.57, 36.07], [129.4, 36.05], [129.42, 36.4], [129.45, 36.8], [129.4, 37.1], [129.2, 37.45], [128.95, 37.75], [128.6, 38.2], [128.6, 38.5]],
      [[127.82, 34.93], [127.95, 34.93], [128.05, 34.85], [128.03, 34.73], [127.93, 34.72], [127.87, 34.78], [127.82, 34.85]],
      [[128.48, 34.98], [128.6, 35.02], [128.72, 34.93], [128.73, 34.82], [128.65, 34.72], [128.55, 34.75], [128.5, 34.85]],
      [[126.15, 34.55], [126.3, 34.56], [126.35, 34.45], [126.25, 34.35], [126.12, 34.4]],
      [[126.65, 34.37], [126.8, 34.35], [126.74, 34.28]],
      [[128.44, 34.79], [128.5, 34.78], [128.48, 34.75]],
      [[126.17, 33.45], [126.5, 33.56], [126.9, 33.52], [126.95, 33.4], [126.6, 33.22], [126.25, 33.25]],
      [[129.2, 34.68], [129.35, 34.7], [129.4, 34.5], [129.35, 34.25], [129.3, 34.1], [129.22, 34.2], [129.18, 34.45]],
      [[129.65, 33.82], [129.8, 33.8], [129.72, 33.72]],
      [[129.5, 33.4], [129.85, 33.55], [130.2, 33.6], [130.4, 33.62], [130.6, 33.85], [130.9, 33.95], [131.2, 33.95], [131.5, 33.9], [131.5, 32.5], [129.5, 32.5], [129.6, 33.0]],
      [[130.9, 34.02], [131.0, 34.35], [131.5, 34.6], [131.5, 34.02]],
    ],
    rivers: [[[128.95, 35.1], [128.8, 35.4], [128.6, 35.8], [128.4, 36.3], [128.2, 36.7]], [[126.6, 37.7], [126.98, 37.57], [127.4, 37.5], [127.8, 37.6]], [[126.7, 36.0], [127.1, 36.2], [127.4, 36.35], [127.6, 36.2]], [[126.4, 34.8], [126.72, 35.0], [126.85, 35.15]], [[127.75, 34.95], [127.6, 35.2], [127.3, 35.4]]],
    forests: [[127.2, 35.6], [127.6, 35.9], [128.2, 35.5], [128.9, 36.4], [128.5, 36.9], [127.8, 36.8], [127.3, 37.0]],
    hills: [[128.3, 37.4], [128.7, 37.0], [128.9, 36.7], [127.7, 35.35], [127.9, 35.6], [128.8, 35.7], [127.3, 36.6]],
    cities: [['Hanseong', 126.98, 37.57], ['Busan', 129.05, 35.12], ['Yeosu', 127.68, 34.76, 'small']],
    labels: [['JOSEON', 127.8, 36.25, 'land'], ['Tsushima', 129.05, 34.35, 'small'], ['Korea Strait', 128.3, 34.05, 'sea'], ['Yellow Sea', 126.3, 36.9, 'sea'], ['Jeju', 126.55, 33.62, 'small']],
    battles: [['Okpo', 128.69, 34.89, '1592'], ['Sacheon', 128.07, 35.03, '1592'], ['Hansan Island', 128.47, 34.76, '1592'], ['Myeongnyang', 126.31, 34.57, '1597'], ['Noryang', 127.87, 34.95, '1598']],
    labelSide: [1, -1, 1, -1, -1], sea: true,
    deco: { rose: [128.95, 37.3], ship: [127.4, 33.95] },
  },
  saladin: {
    title: 'Saladin', sub: 'The Kingdom of Jerusalem · 1187 – 1192', view: [34.05, 36.75, 30.75, 33.95], land: '#f0dca6', land2: '#dcb46c',
    polys: [
      [[35.7, 34.4], [35.5, 33.9], [35.37, 33.56], [35.2, 33.27], [35.1, 33.09], [35.07, 32.93], [35.08, 32.84], [35.0, 32.82], [34.95, 32.83], [34.94, 32.7], [34.89, 32.5], [34.85, 32.33], [34.81, 32.2], [34.75, 32.05], [34.64, 31.8], [34.55, 31.67], [34.45, 31.52], [34.25, 31.3], [33.8, 31.1], [33.5, 31.1], [33.5, 30.0], [37.5, 30.0], [37.5, 34.4]],
    ],
    lakes: [
      [[35.52, 32.88], [35.6, 32.9], [35.65, 32.83], [35.64, 32.72], [35.58, 32.7], [35.52, 32.78]],
      [[35.48, 31.78], [35.58, 31.76], [35.6, 31.5], [35.55, 31.2], [35.45, 31.05], [35.38, 31.15], [35.4, 31.45]],
      [[35.58, 33.1], [35.63, 33.1], [35.62, 33.04], [35.58, 33.04]],
    ],
    rivers: [[[35.64, 33.25], [35.6, 33.07], [35.62, 32.9]], [[35.57, 32.71], [35.58, 32.5], [35.55, 32.2], [35.53, 31.95], [35.55, 31.77]]],
    forests: [[35.35, 33.05], [35.9, 33.6]],
    hills: [[35.86, 33.42], [35.95, 33.3], [35.3, 32.95], [35.05, 32.7], [35.25, 32.25], [35.15, 31.6], [35.05, 31.45], [35.75, 32.95], [35.85, 31.8], [35.85, 32.4], [35.9, 31.3], [36.2, 32.0]],
    dunes: [[34.8, 31.0], [34.5, 30.95], [35.1, 30.9], [36.3, 31.0], [36.4, 31.5]],
    cities: [['Jerusalem', 35.23, 31.78], ['Damascus', 36.29, 33.51], ['Tyre', 35.2, 33.27, 'small'], ['Tiberias', 35.53, 32.79, 'small'], ['Kerak', 35.7, 31.18, 'small'], ['Ascalon', 34.55, 31.67, 'small']],
    labels: [['Mediterranean', 34.55, 32.75, 'sea'], ['Sea', 34.55, 32.65, 'sea'], ['Sea of Galilee', 35.95, 32.72, 'small'], ['Dead Sea', 35.82, 31.45, 'small'], ['KINGDOM OF', 35.02, 31.3, 'land2'], ['JERUSALEM', 35.02, 31.18, 'land2'], ['SYRIA', 36.3, 32.9, 'land']],
    battles: [['Cresson', 35.3, 32.66, '1187'], ['Hattin', 35.45, 32.8, '1187'], ['Jerusalem', 35.23, 31.78, '1187'], ['Acre', 35.07, 32.93, '1189'], ['Jaffa', 34.75, 32.05, '1192']],
    labelSide: [-1, 1, 1, -1, -1],
    deco: { rose: [34.35, 31.25] },
  },
});

function mapProj(M, x, y, w, h) {
  const [lo0, lo1, la0, la1] = M.view, lat0 = ((la0 + la1) / 2) * Math.PI / 180, k = Math.cos(lat0);
  const sx = w / ((lo1 - lo0) * k), sy = h / (la1 - la0), s = Math.max(sx, sy);
  const cx = x + w / 2, cy = y + h / 2, mlo = (lo0 + lo1) / 2, mla = (la0 + la1) / 2;
  return (lon, lat) => [cx + (lon - mlo) * k * s, cy - (lat - mla) * s];
}
function smoothPath(c, pts, closed) {
  // Catmull-Rom through the points for a hand-drawn line
  const n = pts.length; if (n < 2) return;
  c.moveTo(pts[0][0], pts[0][1]);
  const get = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) c.closePath();
}
function mapMountain(c, x, y, s, col) {
  c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s * 0.2, y - s * 1.1); c.lineTo(x + s * 0.15, y - s * 0.55); c.lineTo(x + s * 0.45, y - s * 0.85); c.lineTo(x + s, y); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 1.3; c.strokeStyle = 'rgba(60,40,20,0.8)'; c.stroke();
  c.beginPath(); c.moveTo(x - s * 0.2, y - s * 1.1); c.lineTo(x + s * 0.05, y); c.lineTo(x + s, y); c.lineTo(x + s * 0.45, y - s * 0.85); c.lineTo(x + s * 0.15, y - s * 0.55); c.closePath(); c.fillStyle = 'rgba(80,50,20,0.28)'; c.fill();
  c.beginPath(); c.moveTo(x - s * 0.2, y - s * 1.1); c.lineTo(x - s * 0.42, y - s * 0.62); c.lineTo(x - s * 0.24, y - s * 0.7); c.lineTo(x - s * 0.1, y - s * 0.6); c.lineTo(x - s * 0.02, y - s * 0.8); c.closePath(); c.fillStyle = 'rgba(255,252,240,0.85)'; c.fill();
}
function mapTree(c, x, y, s) {
  c.fillStyle = '#5a9a44'; c.strokeStyle = 'rgba(30,50,20,0.85)'; c.lineWidth = 1.1;
  for (const [dx, dy, r] of [[-s * 0.6, 0, s * 0.6], [s * 0.6, 0.2 * s, s * 0.55], [0, -s * 0.5, s * 0.65]]) { c.beginPath(); circ(c, x + dx, y + dy, r); c.fill(); c.stroke(); }
  c.fillStyle = 'rgba(190,235,120,0.7)'; for (const [dx, dy, r] of [[-s * 0.8, -s * 0.2, s * 0.24], [-s * 0.2, -s * 0.72, s * 0.26]]) { c.beginPath(); circ(c, x + dx, y + dy, r); c.fill(); }
}
function mapCastle(c, x, y, s, small) {
  const w = small ? s * 0.8 : s, h = small ? s * 0.8 : s * 1.1;
  c.beginPath(); c.moveTo(x - w, y); c.lineTo(x - w, y - h); for (let i = 0; i < 4; i++) { const x0 = x - w + (i * 2 * w) / 3.5; c.lineTo(x0, y - h - s * 0.3); c.lineTo(x0 + w * 0.28, y - h - s * 0.3); c.lineTo(x0 + w * 0.28, y - h); c.lineTo(x0 + w * 0.57, y - h); } c.lineTo(x + w, y - h); c.lineTo(x + w, y); c.closePath();
  c.fillStyle = '#f2e7c9'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(50,30,15,0.9)'; c.stroke();
  c.fillStyle = 'rgba(50,30,15,0.7)'; c.fillRect(x - w * 0.18, y - h * 0.5, w * 0.36, h * 0.5);
  if (!small) { c.fillStyle = '#c8372d'; c.beginPath(); c.moveTo(x, y - h - s * 0.3); c.lineTo(x, y - h - s * 1.2); c.lineTo(x + s * 0.7, y - h - s * 0.95); c.lineTo(x, y - h - s * 0.7); c.fill(); }
}
function mapRose(c, x, y, r) {
  c.save(); c.translate(x, y);
  c.beginPath(); circ(c, 0, 0, r * 0.62); c.lineWidth = 1.4; c.strokeStyle = 'rgba(60,40,20,0.7)'; c.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2, L2 = i % 2 ? r * 0.55 : r;
    c.beginPath(); c.moveTo(Math.cos(a) * L2, Math.sin(a) * L2); c.lineTo(Math.cos(a + 0.35) * r * 0.16, Math.sin(a + 0.35) * r * 0.16); c.lineTo(0, 0); c.closePath();
    c.fillStyle = i === 0 ? '#c8372d' : '#5a3d22'; c.fill();
    c.beginPath(); c.moveTo(Math.cos(a) * L2, Math.sin(a) * L2); c.lineTo(Math.cos(a - 0.35) * r * 0.16, Math.sin(a - 0.35) * r * 0.16); c.lineTo(0, 0); c.closePath();
    c.fillStyle = '#f2e7c9'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(60,40,20,0.8)'; c.stroke();
  }
  text(c, 'N', 0, -r - 7, { size: r * 0.42, font: F.head, weight: 900, fill: '#5a3d22' });
  c.restore();
}
const _mapCache = new Map();
function mapBase(M, key, w, h, dpr) {
  const ck = key + '|' + w + '|' + h + '|' + dpr;
  if (_mapCache.has(ck)) return _mapCache.get(ck);
  const cv = mkCanvas(w * dpr, h * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
  const pj = mapProj(M, 0, 0, w, h);
  const R = rng(key.length * 97 + 5);
  // sea
  const sg = g.createLinearGradient(0, 0, w * 0.3, h); sg.addColorStop(0, '#8fd0dc'); sg.addColorStop(1, '#5aa6c2');
  g.fillStyle = sg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { const x = R() * w, y = R() * h, r = 40 + R() * 60, rg = g.createRadialGradient(x, y, 1, x, y, r); rg.addColorStop(0, i % 2 ? 'rgba(170,235,240,0.3)' : 'rgba(40,110,150,0.18)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.2;
  for (let i = 0; i < 70; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y - 3, x + 8, y); g.quadraticCurveTo(x + 12, y + 3, x + 16, y); g.stroke(); }
  // graticule
  g.strokeStyle = 'rgba(60,70,60,0.12)'; g.lineWidth = 1; g.setLineDash([3, 5]);
  const [lo0, lo1, la0, la1] = M.view;
  for (let lo = Math.ceil(lo0); lo <= lo1; lo++) { const a = pj(lo, la0 - 1), b = pj(lo, la1 + 1); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  for (let la = Math.ceil(la0); la <= la1; la++) { const a = pj(lo0 - 1, la), b = pj(lo1 + 1, la); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.setLineDash([]);
  // land: coast shadow ring, fill, texture
  const land = M.polys.map((poly) => poly.map(([lo, la]) => pj(lo, la)));
  g.save();
  for (const P of land) { g.beginPath(); smoothPath(g, P, true); g.lineWidth = 22; g.strokeStyle = 'rgba(170,240,235,0.3)'; g.stroke(); g.lineWidth = 12; g.strokeStyle = 'rgba(255,255,255,0.35)'; g.stroke(); g.lineWidth = 6; g.strokeStyle = 'rgba(50,120,140,0.35)'; g.stroke(); }
  g.beginPath(); for (const P of land) smoothPath(g, P, true);
  const lg = g.createLinearGradient(0, 0, w, h); lg.addColorStop(0, M.land); lg.addColorStop(1, M.land2); g.fillStyle = lg; g.fill();
  g.clip();
  g.fillStyle = 'rgba(120,90,40,0.07)'; for (let i = 0; i < 500; i++) { g.beginPath(); circ(g, R() * w, R() * h, 0.6 + R() * 2.2); g.fill(); }
  // green lowlands and sunlit patches on the parchment
  for (let i = 0; i < 14; i++) { const x = R() * w, y = R() * h, r = 30 + R() * 50, rg = g.createRadialGradient(x, y, 1, x, y, r); rg.addColorStop(0, i % 3 ? 'rgba(130,175,80,0.16)' : 'rgba(255,245,200,0.3)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  // regions
  for (const rg of M.regions || []) { const P = rg.pts.map(([lo, la]) => pj(lo, la)); g.beginPath(); smoothPath(g, P, true); g.fillStyle = rgba(TEAMS[rg.col].main, 0.16); g.fill(); g.setLineDash([4, 4]); g.lineWidth = 1.6; g.strokeStyle = rgba(TEAMS[rg.col].dark, 0.6); g.stroke(); g.setLineDash([]); }
  g.restore();
  for (const P of land) { g.beginPath(); smoothPath(g, P, true); g.lineWidth = 2; g.strokeStyle = 'rgba(55,40,22,0.85)'; g.stroke(); }
  // lakes
  for (const lk of M.lakes || []) { const P = lk.map(([lo, la]) => pj(lo, la)); g.beginPath(); smoothPath(g, P, true); g.fillStyle = '#6fbcd2'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(55,40,22,0.8)'; g.stroke(); }
  // rivers
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const rv of M.rivers || []) { const P = rv.map(([lo, la]) => pj(lo, la)); g.beginPath(); smoothPath(g, P, false); g.lineWidth = 2.8; g.strokeStyle = 'rgba(40,110,150,0.9)'; g.stroke(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(170,230,245,0.9)'; g.stroke(); }
  // glyphs
  for (const [lo, la] of M.hills || []) { const [x, y] = pj(lo, la); mapMountain(g, x, y, 9, '#c29a5c'); mapMountain(g, x + 11, y + 4, 7, '#d0aa6c'); }
  for (const [lo, la] of M.forests || []) { const [x, y] = pj(lo, la); mapTree(g, x, y, 5); mapTree(g, x + 9, y + 4, 4.4); }
  for (const [lo, la] of M.dunes || []) { const [x, y] = pj(lo, la); g.strokeStyle = 'rgba(120,80,30,0.5)'; g.lineWidth = 1.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 10 + i * 5, y + i * 4); g.quadraticCurveTo(x - 3 + i * 5, y - 5 + i * 4, x + 6 + i * 5, y + i * 4); g.stroke(); } }
  // labels
  for (const [name, lo, la, kind] of M.labels || []) {
    const [x, y] = pj(lo, la);
    if (kind === 'sea') text(g, name, x, y, { size: 12, font: F.head, weight: 700, fill: 'rgba(40,80,90,0.75)', letter: 1.5 });
    else if (kind === 'small') text(g, name, x, y, { size: 10, font: F.head, weight: 800, fill: 'rgba(80,55,30,0.75)', letter: 1 });
    else text(g, name, x, y, { size: kind === 'land2' ? 11 : 17, font: F.head, weight: 900, fill: 'rgba(90,60,30,0.55)', letter: 3 });
  }
  // cities: keep names clear of the battle pins (a pin on the city itself hides the castle; the name goes under its stars)
  const pins = (M.battles || []).map(([, lo, la]) => pj(lo, la));
  const onPin = (x0, y0, x1, y1) => pins.some(([px, py]) => x1 > px - 12 && x0 < px + 12 && y1 > py - 16 && y0 < py + 21);
  for (const [name, lo, la, small] of M.cities || []) {
    const [x, y] = pj(lo, la), sz = small ? 9.5 : 11, tw = textWidth(g, name, sz, F.body, 700) + 6, th = sz + 5;
    const under = pins.some(([px, py]) => Math.hypot(px - x, py - y) < 6);
    if (!under) mapCastle(g, x, y, 6, small);
    const spots = under ? [[x, y + 30]] : [[x, y + 9], [x + 9 + tw / 2, y - 4], [x - 9 - tw / 2, y - 4], [x, y - 21]];
    const at = spots.find(([sx, sy]) => !onPin(sx - tw / 2, sy - th / 2, sx + tw / 2, sy + th / 2));
    if (at) text(g, name, at[0], at[1], { size: sz, weight: 700, fill: '#4a331c', stroke: 'rgba(250,240,215,0.85)', strokeW: 3 });
  }
  // decorations
  if (M.deco) {
    if (M.deco.rose) { const [x, y] = pj(...M.deco.rose); mapRose(g, x, y, 22); }
  }
  // aged edges
  const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.38, w / 2, h / 2, Math.hypot(w, h) * 0.6); vg.addColorStop(0, 'rgba(90,60,20,0)'); vg.addColorStop(1, 'rgba(90,60,20,0.3)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  _mapCache.set(ck, cv);
  return cv;
}
/* nodes: array of { state: 'done'|'current'|'locked', stars } in battle order */
RTW.campaignMap = function (c, x, y, w, h, key, t = 0, o = {}) {
  const M = MAPS[key]; if (!M) return [];
  const dpr = o.dpr || 2;
  c.save();
  c.beginPath(); rr(c, x, y, w, h, o.r == null ? 12 : o.r); c.save(); c.clip();
  c.drawImage(mapBase(M, key, w, h, dpr), x, y, w, h);
  const pj = mapProj(M, x, y, w, h);
  // decorative ship
  if (M.deco && M.deco.ship) {
    const [sx, sy] = pj(...M.deco.ship);
    // a Korean panokseon off Joseon; a medieval cog with painted sails in European waters
    if (key === 'yi' && RTW.drawShip) RTW.drawShip(c, { type: 'panokseon', team: 'blue', x: sx, y: sy, size: 34, heading: -0.35, t, moving: true, row: false, detail: 0 });
    else if (PROP.cog) PROP.cog(c, sx, sy + 6, 0.32, t, { arms: M.shipArms || 'royal' });
  }
  const pts = M.battles.map(([n, lo, la]) => pj(lo, la));
  // spread pins that sit too close together (display only), keep a leader line to the true spot
  const true0 = pts.map((p) => p.slice());
  for (let it = 0; it < 30; it++) for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1], d = Math.hypot(dx, dy) || 0.01, min = 26;
    if (d < min) { const push = (min - d) / 2, ux = dx / d, uy = dy / d; pts[i][0] -= ux * push; pts[i][1] -= uy * push; pts[j][0] += ux * push; pts[j][1] += uy * push; }
  }
  const nodes = o.nodes || M.battles.map((b, i) => ({ state: i === 0 ? 'current' : 'locked', stars: 0 }));
  // route
  c.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2 + (y1 - y0) * 0.18, my = (y0 + y1) / 2 - (x1 - x0) * 0.18;
    const done = nodes[i + 1] && nodes[i + 1].state !== 'locked';
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x1, y1);
    c.setLineDash([2, 8]); c.lineDashOffset = done ? -t * 12 : 0; c.lineWidth = 5; c.strokeStyle = 'rgba(250,240,215,0.75)'; c.stroke();
    c.lineWidth = 3.4; c.strokeStyle = done ? '#b0281c' : 'rgba(90,60,30,0.55)'; c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
    if (done) { const k = 0.55, ax = (1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * mx + k * k * x1, ay = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * my + k * k * y1, dx = 2 * (1 - k) * (mx - x0) + 2 * k * (x1 - mx), dy = 2 * (1 - k) * (my - y0) + 2 * k * (y1 - my), a = Math.atan2(dy, dx); c.save(); c.translate(ax, ay); c.rotate(a); c.beginPath(); c.moveTo(6, 0); c.lineTo(-4, -5); c.lineTo(-4, 5); c.closePath(); c.fillStyle = '#8a2a20'; c.fill(); c.restore(); }
  }
  c.restore();
  for (let i = 0; i < pts.length; i++) if (Math.hypot(pts[i][0] - true0[i][0], pts[i][1] - true0[i][1]) > 3) { c.beginPath(); c.moveTo(true0[i][0], true0[i][1]); c.lineTo(pts[i][0], pts[i][1]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(60,35,15,0.7)'; c.stroke(); c.beginPath(); circ(c, true0[i][0], true0[i][1], 2.6); c.fillStyle = '#8a2a20'; c.fill(); }
  // nodes: numbered shield pins; the selected one gets a name flag
  const sel = o.select == null ? nodes.findIndex((n) => n.state === 'current') : o.select;
  pts.forEach(([nx, ny], i) => {
    const nd = nodes[i] || { state: 'locked' }, cur = nd.state === 'current', lock = nd.state === 'locked', isSel = sel === i;
    const r = (isSel ? 14 : 11) * (cur ? 1 + Math.sin(t * 4) * 0.06 : 1);
    if (isSel) { const gg = c.createRadialGradient(nx, ny, 4, nx, ny, 36); gg.addColorStop(0, 'rgba(255,225,120,0.8)'); gg.addColorStop(1, 'rgba(255,225,120,0)'); c.fillStyle = gg; c.beginPath(); circ(c, nx, ny, 36); c.fill(); }
    if (cur) { const k = (t * 0.8) % 1; c.save(); c.globalAlpha = 0.8 * (1 - k); c.strokeStyle = '#fff3c0'; c.lineWidth = 2.5 * (1 - k) + 0.5; c.beginPath(); ell(c, nx, ny + r * 0.9, r * (0.8 + k * 1.6), r * (0.35 + k * 0.7)); c.stroke(); c.restore(); }
    c.save(); c.translate(nx, ny - r * 0.2);
    c.beginPath(); heaterPath(c, 0, 0, r * 1.7, r * 2); c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke();
    const tm = lock ? { light: '#d6ccb4', dark: '#8d816c' } : nd.state === 'done' ? { light: '#f7d56a', dark: '#b8801c' } : TEAMS.blue;
    const gg = c.createLinearGradient(0, -r, 0, r); gg.addColorStop(0, tm.light); gg.addColorStop(1, tm.dark); c.fillStyle = gg; c.fill();
    c.beginPath(); heaterPath(c, 0, 0, r * 1.34, r * 1.6); c.lineWidth = 1.8; c.strokeStyle = lock ? 'rgba(255,255,255,0.4)' : nd.state === 'done' ? '#fff3c4' : PAL.gold; c.stroke();
    if (lock) ICON.lock(c, 0, 1, r * 1.05);
    else text(c, String(i + 1), 0, -1, { size: r * 1.1, font: F.head, weight: 900, fill: '#fff', stroke: INK, strokeW: 3.2 });
    c.restore();
    if (nd.state === 'done') for (let k = 0; k < 3; k++) ICON.star(c, nx - 9 + k * 9, ny + r + 3 - (k === 1 ? 2 : 0), 4.6, k < (nd.stars || 0));
    if (isSel) {
      const side = (M.labelSide && M.labelSide[i]) || 1, name = M.battles[i][0], yr = M.battles[i][3];
      const tw = Math.max(textWidth(c, name, 13, F.head, 900), textWidth(c, yr, 10, F.body, 700)) + 18;
      let lx = side > 0 ? nx + r + 8 : nx - r - 8 - tw; lx = clamp(lx, x + 6, x + w - tw - 6);
      const ly = ny - 16;
      c.beginPath(); rr(c, lx, ly, tw, 32, 8); c.fillStyle = 'rgba(255,248,228,0.96)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
      text(c, name, lx + tw / 2, ly + 11, { size: 13, font: F.head, weight: 900, fill: '#3a2412', maxW: tw - 8 });
      text(c, yr, lx + tw / 2, ly + 24, { size: 10, weight: 700, fill: '#8a2a20' });
    }
  });
  c.restore();
  c.beginPath(); rr(c, x, y, w, h, o.r == null ? 12 : o.r); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  return pts;
};

/* ===== src/art/18b-maps2.js ===== */
/* Roll to War: campaign maps for campaigns 4-6 (the Leper King, Joan of Arc, the Wars of the Roses).
   Coastlines are cut from Natural Earth (public domain) with tools/mapcut.py; rivers and places are placed by hand. */
Object.assign(MAPS, {
  leper: {
    title: 'The Leper King', sub: 'The Kingdom of Jerusalem · 1177 – 1183', view: [34.05, 36.75, 30.95, 34.15], land: MAPS.saladin.land, land2: MAPS.saladin.land2,
    polys: MAPS.saladin.polys, lakes: MAPS.saladin.lakes, rivers: MAPS.saladin.rivers,
    forests: [[35.35, 33.05], [35.9, 33.6], [35.42, 33.2]],
    hills: MAPS.saladin.hills, dunes: MAPS.saladin.dunes,
    cities: [['Jerusalem', 35.23, 31.78], ['Damascus', 36.29, 33.51], ['Tyre', 35.2, 33.27, 'small'], ['Acre', 35.07, 32.93, 'small'], ['Tiberias', 35.53, 32.79, 'small'], ['Ascalon', 34.55, 31.67, 'small'], ['Gaza', 34.46, 31.5, 'small'], ['Banias', 35.69, 33.25, 'small']],
    labels: [['Mediterranean', 34.5, 32.75, 'sea'], ['Sea', 34.5, 32.65, 'sea'], ['Sea of Galilee', 35.97, 32.72, 'small'], ['Dead Sea', 35.82, 31.45, 'small'], ['KINGDOM OF', 35.08, 31.36, 'land2'], ['JERUSALEM', 35.08, 31.24, 'land2'], ['SYRIA', 36.3, 32.9, 'land'], ['EGYPT', 34.25, 30.9, 'small']],
    battles: [['Montgisard', 34.92, 31.86, '1177'], ['Marj Ayyun', 35.59, 33.36, '1179'], ["Jacob's Ford", 35.63, 33.0, '1179'], ['Belvoir', 35.52, 32.6, '1182'], ['Kerak', 35.7, 31.18, '1183']],
    labelSide: [1, -1, 1, 1, -1],
    deco: { rose: [34.35, 31.25] },
  },
  joan: {
    title: 'Joan of Arc', sub: '1429 – 1430', view: [-0.55, 6.25, 45.45, 51.55], land: '#ecdfaa', land2: '#c8c47e',
    polys: [[[7.77,52.97],[7.77,43.93],[-1.37,43.93],[-1.26,44.56],[-1.19,44.67],[-1.04,44.67],[-1.17,44.78],[-1.26,44.63],[-1.14,45.49],[-1.09,45.57],[-0.77,45.33],[-0.72,45.13],[-0.57,45.0],[-0.53,44.89],[-0.54,44.98],[-0.6,45.02],[-0.49,45.0],[-0.66,45.1],[-0.72,45.36],[-0.8,45.48],[-1.08,45.66],[-1.25,45.71],[-1.23,45.79],[-1.16,45.81],[-0.99,45.72],[-1.15,45.87],[-1.07,45.9],[-1.11,46.02],[-1.05,46.04],[-1.21,46.17],[-1.11,46.3],[-1.18,46.33],[-1.24,46.28],[-1.37,46.35],[-1.45,46.34],[-1.48,46.41],[-1.63,46.43],[-1.79,46.53],[-1.8,46.49],[-1.91,46.69],[-2.12,46.82],[-2.13,46.89],[-1.99,47.04],[-2.03,47.09],[-2.24,47.14],[-2.17,47.17],[-2.16,47.27],[-2.01,47.3],[-1.73,47.21],[-2.01,47.32],[-2.15,47.31],[-2.27,47.25],[-2.27,48.64],[-2.17,48.58],[-2.12,48.61],[-2.14,48.64],[-2.05,48.65],[-1.98,48.51],[-1.94,48.53],[-1.98,48.59],[-1.95,48.58],[-2.03,48.64],[-1.95,48.7],[-1.84,48.71],[-1.86,48.64],[-1.8,48.62],[-1.36,48.64],[-1.55,48.75],[-1.6,48.85],[-1.54,48.94],[-1.55,49.03],[-1.51,49.03],[-1.59,49.03],[-1.57,49.14],[-1.61,49.22],[-1.55,49.23],[-1.62,49.22],[-1.7,49.36],[-1.82,49.38],[-1.88,49.53],[-1.84,49.62],[-1.95,49.68],[-1.94,49.72],[-1.61,49.65],[-1.41,49.71],[-1.26,49.7],[-1.23,49.62],[-1.31,49.56],[-1.18,49.42],[-1.18,49.36],[-1.12,49.35],[-1.07,49.4],[-0.94,49.39],[-0.41,49.34],[-0.22,49.28],[0.46,49.47],[0.49,49.49],[0.26,49.46],[0.08,49.53],[0.24,49.73],[0.6,49.86],[1.22,49.98],[1.46,50.12],[1.52,50.21],[1.67,50.19],[1.54,50.28],[1.55,50.35],[1.61,50.37],[1.56,50.4],[1.61,50.55],[1.56,50.7],[1.61,50.79],[1.58,50.87],[1.73,50.94],[2.47,51.07],[3.12,51.33],[3.53,51.42],[3.83,51.34],[3.98,51.41],[4.2,51.38],[4.32,51.28],[4.23,51.42],[3.96,51.46],[3.83,51.39],[3.69,51.45],[3.54,51.46],[3.45,51.55],[3.56,51.59],[3.85,51.61],[3.91,51.57],[3.87,51.55],[4.02,51.53],[4.1,51.45],[4.28,51.45],[4.27,51.51],[3.99,51.59],[4.21,51.59],[4.11,51.64],[4.18,51.69],[4.07,51.72],[3.98,51.81],[3.86,51.82],[4.08,51.84],[4.02,51.99],[4.14,52.01],[4.51,52.34],[4.75,52.97],[4.82,52.97],[4.81,52.93],[4.87,52.9],[5.12,52.97]],[[0.12,52.97],[0.01,52.89],[0.11,52.89],[0.38,52.77],[0.52,52.96],[1.01,52.96],[0.97,52.97],[1.4,52.89],[1.7,52.73],[1.77,52.49],[1.63,52.27],[1.58,52.08],[1.47,52.06],[1.33,51.94],[1.16,52.03],[1.27,51.96],[1.07,51.95],[1.28,51.95],[1.2,51.88],[1.29,51.88],[1.28,51.84],[1.07,51.78],[0.98,51.84],[0.87,51.75],[0.7,51.72],[0.76,51.69],[0.93,51.74],[0.92,51.59],[0.77,51.53],[0.46,51.51],[0.38,51.45],[0.69,51.48],[0.72,51.45],[0.55,51.41],[0.71,51.38],[0.73,51.42],[0.76,51.36],[0.98,51.35],[1.42,51.39],[1.44,51.34],[1.38,51.33],[1.41,51.22],[1.38,51.15],[1.07,51.06],[0.97,50.98],[0.98,50.92],[0.76,50.93],[0.62,50.86],[0.37,50.82],[0.27,50.75],[-0.27,50.83],[-0.76,50.78],[-0.79,50.73],[-0.9,50.77],[-0.86,50.81],[-0.94,50.84],[-1.02,50.84],[-1.08,50.78],[-1.07,50.84],[-1.16,50.84],[-1.12,50.82],[-1.15,50.78],[-1.47,50.92],[-1.32,50.8],[-1.56,50.72],[-1.69,50.74],[-1.94,50.69],[-2.04,50.74],[-2.08,50.7],[-1.93,50.64],[-1.98,50.6],[-2.27,50.63],[-2.27,52.97]],[[-1.08,50.71],[-1.06,50.69],[-1.16,50.65],[-1.17,50.6],[-1.28,50.58],[-1.49,50.67],[-1.57,50.66],[-1.32,50.77]],[[4.04,51.69],[4.1,51.65],[3.96,51.62],[3.81,51.7],[3.69,51.69],[3.81,51.75],[3.96,51.74]],[[-2.08,49.26],[-2.02,49.24],[-2.02,49.17],[-2.23,49.18],[-2.24,49.26]],[[-1.22,45.94],[-1.18,45.9],[-1.21,45.81],[-1.4,46.05],[-1.25,46.0]],[[0.91,51.41],[0.94,51.37],[0.73,51.41],[0.77,51.45]],[[-2.2,46.99],[-2.14,46.91],[-2.25,46.96],[-2.27,47.03],[-2.2,47.02]],[[-1.28,46.16],[-1.56,46.25],[-1.31,46.21]]],
    rivers: [
      [[-0.08, 47.26], [0.69, 47.39], [1.33, 47.59], [1.63, 47.78], [1.7, 47.83], [1.91, 47.9], [2.12, 47.87], [2.37, 47.77], [2.63, 47.69], [3.02, 47.18], [3.3, 46.8], [3.6, 46.4], [4.0, 45.9]],
      [[0.15, 49.45], [0.75, 49.4], [1.1, 49.44], [1.72, 48.99], [2.1, 48.95], [2.35, 48.86], [2.66, 48.54], [2.95, 48.39], [3.5, 48.4], [4.07, 48.3], [4.6, 47.9]],
      [[2.1, 49.0], [2.47, 49.26], [2.83, 49.42], [3.0, 49.58], [3.63, 49.9]],
      [[2.41, 48.82], [2.88, 48.96], [3.4, 49.05], [3.96, 49.04], [4.36, 48.96], [4.9, 48.6]],
      [[0.24, 47.17], [0.45, 46.95], [0.55, 46.6]],
    ],
    regions: [
      { name: 'English and Burgundian France', col: 'red', pts: [[-1.2, 49.75], [0.6, 50.2], [1.6, 50.4], [3.4, 50.25], [4.6, 49.8], [5.0, 48.9], [4.3, 48.2], [3.2, 48.1], [2.5, 48.05], [1.4, 48.05], [0.2, 48.35], [-1.2, 48.7]] },
      { name: "The Dauphin's France", col: 'blue', pts: [[-0.9, 47.45], [0.8, 47.6], [1.6, 47.72], [2.4, 47.6], [3.3, 47.45], [4.0, 47.0], [4.4, 46.2], [4.3, 45.2], [-0.9, 45.2]] },
    ],
    forests: [[2.05, 48.0], [2.9, 49.34], [1.6, 48.45], [4.7, 49.85], [3.4, 48.7], [0.9, 47.1], [5.1, 48.2]],
    hills: [[4.1, 47.15], [4.35, 47.35], [5.5, 46.5], [5.8, 47.6]],
    cities: [['Paris', 2.35, 48.86], ['Reims', 4.03, 49.26], ['Rouen', 1.1, 49.44, 'small'], ['Chinon', 0.24, 47.17, 'small'], ['Blois', 1.33, 47.59, 'small'], ['Troyes', 4.07, 48.3, 'small'], ['Domrémy', 5.68, 48.44, 'small']],
    labels: [['NORMANDY', 0.25, 49.05, 'small'], ['CHAMPAGNE', 4.35, 48.75, 'small'], ['BURGUNDY', 4.95, 47.05, 'small'], ['BERRY', 2.3, 46.85, 'small'], ['English Channel', 0.7, 50.4, 'sea'], ['ENGLAND', 0.7, 51.05, 'small']],
    battles: [['Orléans', 1.91, 47.9, '1429'], ['Jargeau', 2.12, 47.87, '1429'], ['Patay', 1.7, 48.05, '1429'], ['Paris', 2.35, 48.86, '1429'], ['Compiègne', 2.83, 49.42, '1430']],
    labelSide: [-1, 1, -1, 1, 1],
    deco: { rose: [5.65, 46.0], ship: [0.0, 49.95] }, shipArms: 'royal',
  },
  roses: {
    title: 'The Wars of the Roses', sub: '1461 – 1485', view: [-4.9, 1.0, 50.3, 54.9], land: '#e8e2ae', land2: '#bcc88a',
    polys: [[[-3.32,56.37],[-2.82,56.38],[-2.58,56.28],[-2.78,56.19],[-2.96,56.21],[-3.16,56.06],[-3.34,56.03],[-3.84,56.11],[-3.66,56.01],[-3.08,55.95],[-2.94,55.97],[-2.82,56.06],[-2.64,56.06],[-2.58,56.0],[-2.14,55.91],[-1.82,55.63],[-1.63,55.59],[-1.52,55.16],[-1.36,54.96],[-1.28,54.75],[-1.17,54.7],[-1.2,54.63],[-1.14,54.65],[-0.56,54.48],[-0.37,54.25],[-0.08,54.11],[-0.22,54.02],[0.13,53.64],[0.13,53.57],[0.12,53.62],[-0.09,53.63],[-0.26,53.74],[-0.73,53.7],[-0.28,53.71],[0.22,53.42],[0.36,53.15],[0.01,52.89],[0.38,52.77],[0.52,52.96],[1.01,52.96],[0.97,52.97],[1.4,52.89],[1.7,52.73],[1.77,52.49],[1.63,52.27],[1.58,52.08],[1.33,51.94],[1.16,52.03],[1.27,51.96],[1.07,51.95],[1.28,51.95],[1.2,51.88],[1.29,51.88],[1.28,51.84],[1.07,51.78],[0.98,51.84],[0.87,51.75],[0.7,51.72],[0.93,51.74],[0.92,51.59],[0.38,51.45],[0.69,51.48],[0.72,51.45],[0.55,51.41],[0.98,51.35],[1.42,51.39],[1.38,51.15],[1.07,51.06],[0.97,50.98],[0.98,50.92],[0.76,50.93],[0.27,50.75],[-0.27,50.83],[-0.76,50.78],[-0.79,50.73],[-0.9,50.77],[-0.86,50.81],[-0.94,50.84],[-1.08,50.78],[-1.07,50.84],[-1.16,50.84],[-1.15,50.78],[-1.47,50.92],[-1.32,50.8],[-1.56,50.72],[-1.94,50.69],[-2.04,50.74],[-2.08,50.7],[-1.95,50.68],[-1.97,50.6],[-2.4,50.65],[-2.46,50.61],[-2.45,50.53],[-2.48,50.59],[-2.86,50.73],[-3.37,50.62],[-3.46,50.68],[-3.43,50.61],[-3.51,50.52],[-3.49,50.46],[-3.56,50.43],[-3.49,50.4],[-3.63,50.31],[-3.66,50.22],[-3.79,50.21],[-3.96,50.32],[-4.05,50.3],[-4.2,50.46],[-4.23,50.4],[-4.29,50.4],[-4.19,50.38],[-4.19,50.32],[-4.34,50.37],[-4.69,50.34],[-4.76,50.32],[-4.8,50.23],[-5.0,50.14],[-5.05,50.2],[-5.04,50.14],[-5.13,50.1],[-5.06,50.06],[-5.19,49.96],[-5.3,50.08],[-5.47,50.13],[-5.56,50.06],[-5.71,50.05],[-5.68,50.16],[-5.31,50.25],[-5.05,50.43],[-5.02,50.54],[-4.84,50.51],[-4.92,50.59],[-4.79,50.6],[-4.58,50.77],[-4.53,51.01],[-4.34,51.0],[-4.21,51.08],[-4.23,51.19],[-3.77,51.25],[-3.02,51.19],[-2.97,51.38],[-2.72,51.5],[-2.38,51.76],[-2.71,51.59],[-2.97,51.56],[-3.17,51.45],[-3.18,51.4],[-3.29,51.38],[-3.56,51.41],[-3.74,51.49],[-3.85,51.62],[-4.03,51.55],[-4.29,51.56],[-4.29,51.62],[-4.07,51.68],[-4.32,51.68],[-4.38,51.73],[-4.31,51.73],[-4.37,51.79],[-4.95,51.6],[-5.12,51.68],[-4.84,51.71],[-4.88,51.76],[-4.82,51.8],[-4.93,51.78],[-4.91,51.72],[-5.18,51.69],[-5.25,51.73],[-5.11,51.78],[-5.13,51.86],[-5.31,51.86],[-5.07,52.03],[-4.84,52.01],[-4.72,52.11],[-4.32,52.22],[-4.11,52.37],[-4.06,52.53],[-3.95,52.55],[-4.05,52.54],[-4.13,52.6],[-3.99,52.73],[-4.05,52.72],[-4.15,52.81],[-4.08,52.93],[-4.41,52.89],[-4.52,52.79],[-4.76,52.79],[-4.36,53.03],[-4.34,53.11],[-4.18,53.22],[-3.83,53.29],[-3.88,53.34],[-3.6,53.29],[-3.33,53.35],[-3.09,53.23],[-3.19,53.39],[-3.06,53.43],[-2.88,53.29],[-2.7,53.35],[-2.92,53.35],[-3.1,53.56],[-2.9,53.74],[-3.05,53.77],[-3.06,53.91],[-2.86,53.97],[-2.83,54.02],[-2.92,54.03],[-2.8,54.13],[-2.85,54.19],[-2.8,54.25],[-2.94,54.16],[-3.05,54.22],[-3.15,54.06],[-3.24,54.11],[-3.21,54.26],[-3.31,54.19],[-3.63,54.51],[-3.39,54.88],[-3.02,54.98],[-3.57,55.0],[-3.58,54.88],[-3.82,54.89],[-3.86,54.84],[-3.82,54.82],[-4.01,54.77],[-4.06,54.83],[-4.12,54.77],[-4.2,54.87],[-4.27,54.84],[-4.4,54.91],[-4.42,54.85],[-4.34,54.79],[-4.38,54.68],[-4.86,54.87],[-4.95,54.8],[-4.86,54.63],[-4.94,54.65],[-4.95,54.73],[-5.16,54.88],[-5.17,55.01],[-5.12,55.03],[-5.06,54.93],[-5.0,54.92],[-5.05,55.03],[-5.01,55.14],[-4.62,55.5],[-4.69,55.61],[-4.92,55.71],[-4.86,55.76],[-4.89,55.92],[-4.8,55.96],[-4.48,55.93],[-4.67,55.96],[-4.82,56.08],[-4.78,55.99],[-4.85,55.99],[-4.87,56.07],[-4.76,56.21],[-4.85,56.11],[-4.92,56.17],[-4.89,55.99],[-4.95,56.0],[-4.91,55.96],[-4.97,55.88],[-5.04,55.88],[-5.12,56.01],[-5.09,55.9],[-5.18,55.97],[-5.24,55.89],[-5.2,55.83],[-5.3,55.85],[-5.34,56.0],[-4.92,56.28],[-5.05,56.24],[-5.37,56.01],[-5.44,56.03],[-5.45,55.96],[-5.32,55.78],[-5.49,55.64],[-5.45,55.59],[-5.58,55.43],[-5.53,55.36],[-5.77,55.3],[-5.8,55.38],[-5.72,55.45],[-5.68,55.67],[-5.45,55.85],[-5.6,55.76],[-5.66,55.8],[-5.67,55.85],[-5.57,55.93],[-5.7,55.92],[-5.57,56.04],[-5.71,55.94],[-5.58,56.1],[-5.53,56.09],[-5.56,56.13],[-5.51,56.19],[-5.61,56.14],[-5.49,56.26],[-5.59,56.25],[-5.57,56.33],[-5.45,56.36],[-5.53,56.38],[-3.23,56.38]],[[2.48,48.82],[-3.53,48.82],[-3.23,48.87],[-3.2,48.82],[-3.1,48.88],[-3.08,48.82],[-1.57,48.82],[-1.6,48.85],[-1.51,49.03],[-1.59,49.03],[-1.61,49.22],[-1.55,49.23],[-1.62,49.22],[-1.7,49.36],[-1.82,49.38],[-1.88,49.53],[-1.84,49.62],[-1.95,49.68],[-1.94,49.72],[-1.61,49.65],[-1.41,49.71],[-1.26,49.7],[-1.23,49.62],[-1.31,49.56],[-1.18,49.42],[-1.18,49.36],[-1.12,49.35],[-1.07,49.4],[-0.94,49.39],[-0.22,49.28],[0.46,49.47],[0.49,49.49],[0.26,49.46],[0.08,49.53],[0.24,49.73],[0.6,49.86],[1.22,49.98],[1.52,50.21],[1.67,50.19],[1.54,50.28],[1.61,50.37],[1.56,50.4],[1.61,50.55],[1.58,50.87],[1.92,51.0],[2.48,51.07]],[[-6.11,53.5],[-6.19,53.46],[-6.06,53.37],[-6.22,53.35],[-6.1,53.29],[-6.03,53.11],[-6.05,53.01],[-5.99,52.96],[-6.22,52.67],[-6.21,52.55],[-6.37,52.39],[-6.38,52.28],[-6.32,52.24],[-6.38,52.18],[-6.38,55.25],[-6.08,55.2],[-6.04,55.17],[-6.06,55.07],[-5.97,55.04],[-5.99,54.98],[-5.8,54.82],[-5.72,54.78],[-5.8,54.84],[-5.7,54.82],[-5.71,54.74],[-5.87,54.69],[-5.91,54.61],[-5.75,54.68],[-5.57,54.68],[-5.43,54.49],[-5.52,54.34],[-5.58,54.4],[-5.56,54.51],[-5.7,54.58],[-5.72,54.54],[-5.63,54.52],[-5.67,54.51],[-5.63,54.44],[-5.71,54.35],[-5.58,54.38],[-5.54,54.33],[-5.58,54.28],[-5.86,54.23],[-5.89,54.1],[-6.04,54.04],[-6.26,54.1],[-6.11,54.01],[-6.14,53.98],[-6.36,54.02],[-6.37,53.9],[-6.24,53.87],[-6.24,53.67],[-6.08,53.57]],[[-4.61,54.06],[-4.79,54.07],[-4.71,54.22],[-4.53,54.37],[-4.35,54.41],[-4.38,54.35],[-4.31,54.29]],[[-4.1,53.31],[-4.04,53.3],[-4.41,53.13],[-4.39,53.18],[-4.5,53.18],[-4.57,53.28],[-4.57,53.39],[-4.32,53.42],[-4.2,53.3]],[[-6.03,55.73],[-6.06,55.66],[-6.31,55.58],[-6.32,55.63],[-6.24,55.66],[-6.32,55.73],[-6.25,55.78],[-6.38,55.74],[-6.38,55.87],[-6.32,55.89],[-6.31,55.82],[-6.13,55.94]],[[-5.07,55.51],[-5.12,55.44],[-5.3,55.46],[-5.39,55.65],[-5.3,55.72],[-5.2,55.7]],[[-1.08,50.71],[-1.17,50.6],[-1.28,50.58],[-1.57,50.66],[-1.32,50.77]],[[-5.8,56.11],[-5.69,56.12],[-5.96,55.8],[-6.06,55.81],[-6.08,55.92],[-5.89,55.98],[-6.0,55.99]],[[-5.78,56.38],[-5.7,56.38],[-6.27,56.26],[-6.37,56.32],[-6.03,56.38],[-6.2,56.38]],[[-2.08,49.26],[-2.02,49.24],[-2.02,49.17],[-2.23,49.18],[-2.24,49.26]],[[0.91,51.41],[0.94,51.37],[0.73,51.41],[0.77,51.45]],[[-5.03,55.75],[-5.2,55.91],[-5.08,55.88]],[[-2.58,49.49],[-2.5,49.51],[-2.54,49.43],[-2.67,49.43]],[[-6.21,56.1],[-6.13,56.11],[-6.17,56.04],[-6.27,56.04]]],
    rivers: [
      [[-2.03, 51.69], [-1.26, 51.75], [-0.97, 51.46], [-0.61, 51.48], [-0.12, 51.5], [0.37, 51.45], [0.8, 51.5]],
      [[-3.73, 52.49], [-3.15, 52.66], [-2.75, 52.71], [-2.42, 52.53], [-2.22, 52.19], [-2.17, 51.99], [-2.25, 51.87], [-2.64, 51.61], [-3.1, 51.4]],
      [[-2.12, 53.11], [-2.18, 53.0], [-1.63, 52.8], [-1.14, 52.94], [-0.81, 53.08], [-0.78, 53.4], [-0.69, 53.7]],
      [[-1.33, 54.05], [-1.08, 53.96], [-1.13, 53.83], [-1.07, 53.78], [-0.87, 53.7], [-0.69, 53.7], [-0.3, 53.72]],
      [[-3.75, 52.47], [-3.51, 52.3], [-3.4, 52.15], [-3.13, 52.07], [-2.72, 52.05], [-2.59, 51.91], [-2.71, 51.81], [-2.65, 51.61]],
      [[-3.0, 52.27], [-2.84, 52.26], [-2.74, 52.23], [-2.63, 52.03]],
    ],
    forests: [[-1.07, 53.2], [-2.55, 51.8], [-1.7, 52.35], [-0.05, 51.72], [-1.5, 54.25], [-3.2, 51.9], [0.2, 52.6]],
    hills: [[-2.2, 54.15], [-1.95, 53.6], [-3.8, 52.95], [-3.55, 52.05], [-1.8, 53.3], [-3.9, 53.2], [-2.05, 54.5]],
    cities: [['London', -0.13, 51.51], ['York', -1.08, 53.96], ['Ludlow', -2.72, 52.37, 'small'], ['Leicester', -1.14, 52.63, 'small'], ['Gloucester', -2.24, 51.86, 'small'], ['Coventry', -1.51, 52.41, 'small']],
    labels: [['ENGLAND', -1.0, 52.95, 'land'], ['WALES', -3.75, 52.35, 'land2'], ['North Sea', 0.45, 54.0, 'sea'], ['Irish Sea', -4.35, 53.85, 'sea'], ['English Channel', -1.9, 50.42, 'sea']],
    battles: [["Mortimer's Cross", -2.84, 52.26, '1461'], ['Towton', -1.27, 53.84, '1461'], ['Barnet', -0.2, 51.66, '1471'], ['Tewkesbury', -2.16, 51.98, '1471'], ['Bosworth', -1.43, 52.58, '1485']],
    labelSide: [-1, 1, 1, -1, 1],
    deco: { rose: [0.35, 50.75], ship: [-3.4, 50.45] }, shipArms: 'sunne',
  },
});

/* ===== src/art/18c-maps3.js ===== */
/* Roll to War: campaign maps for the Indian campaigns (Prithviraj Chauhan, the Mughals, the Cholas).
   Coastlines and rivers are cut from Natural Earth (public domain) with tools/mapcut.py and tools/rivercut.py;
   regions, hills and places are placed by hand. */
Object.assign(MAPS, {
  prithviraj: {
    title: 'Prithviraj Chauhan', sub: '1178 – 1194', view: [70.2, 80.6, 22.0, 34.4], land: '#ecd9a2', land2: '#d4be80',
    polys: [[[67.6,37.0],[83.2,37.0],[83.2,19.4],[72.76,19.4],[72.75,19.48],[72.88,19.53],[72.74,19.58],[72.72,19.54],[72.69,19.72],[72.73,19.71],[72.73,19.78],[72.68,19.75],[72.65,19.85],[72.95,20.76],[72.9,20.87],[72.84,20.84],[72.89,20.98],[72.77,21.02],[72.85,21.05],[72.81,21.13],[72.7,21.07],[72.71,21.16],[72.62,21.11],[72.73,21.2],[72.62,21.25],[72.59,21.34],[72.65,21.36],[72.56,21.39],[72.75,21.45],[72.58,21.42],[72.82,21.64],[73.13,21.76],[72.93,21.68],[72.55,21.67],[72.57,21.85],[72.73,21.99],[72.54,21.91],[72.5,21.98],[72.58,22.19],[72.75,22.16],[72.81,22.23],[72.92,22.22],[72.91,22.28],[72.76,22.24],[72.57,22.29],[72.47,22.23],[72.39,22.25],[72.4,22.37],[72.33,22.26],[72.15,22.28],[72.31,22.23],[72.31,22.08],[72.17,21.98],[72.1,22.01],[72.1,21.95],[72.03,21.94],[72.16,21.93],[72.17,21.84],[72.06,21.9],[72.1,21.84],[72.0,21.86],[72.0,21.8],[72.17,21.79],[72.3,21.63],[72.1,21.32],[72.1,21.21],[71.46,20.89],[70.84,20.7],[70.26,20.98],[69.43,21.78],[69.39,21.88],[69.34,21.86],[69.1,22.08],[68.94,22.3],[69.01,22.44],[69.07,22.48],[69.07,22.4],[69.19,22.43],[69.21,22.27],[69.48,22.34],[69.52,22.45],[69.62,22.36],[69.73,22.48],[69.79,22.42],[69.97,22.54],[70.14,22.55],[70.53,23.05],[70.47,23.13],[70.4,23.07],[70.39,22.94],[70.13,22.99],[70.14,22.93],[69.83,22.86],[69.72,22.75],[69.24,22.84],[68.65,23.16],[68.62,23.27],[68.54,23.28],[68.61,23.33],[68.52,23.37],[68.54,23.42],[68.42,23.45],[68.49,23.51],[68.44,23.55],[68.41,23.49],[68.41,23.62],[68.49,23.62],[68.47,23.66],[68.82,23.88],[68.43,23.71],[68.32,23.59],[68.14,23.61],[68.28,23.69],[68.17,23.75],[68.16,23.91],[68.15,23.69],[68.06,23.72],[68.1,23.82],[68.01,23.94],[68.05,23.83],[68.01,23.77],[67.86,23.91],[67.83,23.81],[67.63,23.8],[67.65,23.93],[67.6,23.85]]],
    rivers: [[[76.83,32.33],[76.6,32.3],[76.46,32.45],[76.19,32.47],[76.06,32.62],[75.91,32.61],[75.31,32.15],[74.7,31.95],[74.2,31.5]],[[74.21,31.5],[73.87,31.23],[73.41,31.12],[73.15,30.86],[72.76,30.72],[72.69,30.6],[71.77,30.61]],[[81.2,30.85],[80.76,31.12],[80.39,31.07],[80.01,31.29],[79.89,31.47],[79.53,31.51],[79.24,31.67],[78.95,31.66],[78.72,31.85],[78.26,31.52],[77.83,31.56],[77.54,31.35],[77.37,31.36],[77.16,31.24],[76.88,31.41],[76.76,31.41],[76.65,31.27],[76.44,31.42],[76.38,31.34],[76.59,31.08],[76.51,30.98],[75.4,30.99],[75.03,31.18],[74.84,31.16],[74.32,30.89],[73.84,30.36],[73.05,30.09],[72.62,29.83],[72.36,29.84],[72.15,29.66],[72.17,29.58],[71.98,29.49],[71.67,29.47],[71.47,29.37],[71.27,29.43],[71.02,29.37]],[[81.38,30.76],[81.29,30.79],[81.2,30.85]],[[78.34,30.92],[78.1,30.78],[77.96,30.51],[77.58,30.43],[77.54,30.21],[77.22,29.96],[77.06,29.56],[77.12,29.48],[77.07,29.42],[77.15,29.41],[77.22,28.69],[77.22,28.69],[77.5,28.39],[77.54,28.18],[77.47,28.05],[77.58,27.8],[77.69,27.8],[77.66,27.61],[77.86,27.27],[77.95,27.3],[78.02,27.18],[78.2,27.19],[78.21,27.09],[78.35,27.13],[78.3,27.06],[78.41,27.06],[78.51,26.93],[78.51,26.98],[78.64,26.89],[78.73,26.92],[79.0,26.76],[79.08,26.6],[79.29,26.52],[79.22,26.43],[79.46,26.44],[79.56,26.36],[79.53,26.29],[79.77,26.11],[79.9,26.1],[79.95,26.16],[79.96,26.07],[80.08,26.07],[80.19,25.93],[80.54,25.87],[80.46,25.84],[80.57,25.73],[80.92,25.69],[81.02,25.63],[81.02,25.54],[81.18,25.49],[81.15,25.41],[81.26,25.33],[81.47,25.27],[81.9,25.41]],[[77.44,32.29],[76.88,32.64],[76.44,32.77],[76.43,33.05],[76.1,33.31],[75.75,33.38],[75.8,33.16],[75.6,33.14],[75.36,33.14],[75.14,33.27],[75.06,33.16],[74.8,33.18],[74.78,32.91],[74.34,32.61],[73.4,32.23],[73.11,31.83],[72.36,31.49],[72.23,31.22],[72.14,31.18],[71.84,30.66],[71.36,30.32],[71.17,29.88],[71.17,29.69],[71.01,29.53],[71.0,29.29],[70.64,29.04]],[[75.37,33.44],[75.19,33.58],[74.98,33.95],[74.63,34.25],[74.59,34.38],[74.53,34.3],[73.91,34.1],[73.45,34.34],[73.63,33.56],[73.6,33.32]],[[73.6,33.32],[73.64,33.14],[73.77,32.98],[73.53,32.71],[72.61,32.44],[72.37,32.29],[72.17,31.7],[72.14,31.18]],[[75.58,24.65],[75.51,24.74],[75.59,24.81],[75.57,24.92],[75.9,25.27],[75.99,25.24],[76.14,25.35],[76.18,25.5],[76.27,25.53],[76.28,25.71],[76.74,25.92],[77.34,26.36],[77.72,26.51],[77.9,26.66],[78.08,26.68],[78.1,26.8],[78.33,26.86],[78.56,26.76],[78.71,26.8],[79.24,26.5]],[[75.67,22.47],[75.51,22.61],[75.5,23.21],[75.39,23.39],[75.35,23.69],[75.27,23.76],[75.51,24.04],[75.39,24.22],[75.35,24.31],[75.6,24.54],[75.58,24.65]],[[72.91,22.28],[73.04,22.31],[73.25,22.78],[73.37,22.83],[73.58,23.18],[73.93,23.35],[74.14,23.77],[74.45,23.91],[74.55,23.8],[74.53,23.54],[74.61,23.41],[74.76,23.29],[74.79,23.15],[75.01,23.1],[74.97,22.73]],[[79.84,30.89],[79.87,30.69],[79.72,30.51],[79.55,30.57],[79.27,30.3],[78.7,30.24],[78.59,30.07],[78.32,30.14],[78.16,29.95],[78.19,29.71],[77.99,29.53],[78.12,29.25],[78.09,28.84],[78.29,28.31],[78.61,28.0],[79.16,27.82],[79.2,27.69],[79.55,27.54],[79.7,27.24],[79.93,27.14],[80.14,26.74],[80.67,26.11],[80.81,26.03],[81.03,26.06],[81.39,25.77],[81.4,25.67],[81.7,25.49],[81.91,25.51],[81.95,25.33],[82.16,25.31]],[[79.44,32.74],[78.96,33.2],[78.71,33.17],[78.2,33.43],[78.15,33.57],[77.56,34.11],[76.84,34.33],[76.6,34.55],[76.32,34.67],[76.19,34.83],[76.22,34.95],[75.92,35.17],[75.84,35.34],[75.64,35.31],[75.32,35.59],[74.75,35.72],[74.72,35.84],[74.63,35.82],[74.63,35.53],[74.4,35.42],[73.31,35.54],[73.27,35.26],[72.89,35.04],[72.86,34.91],[72.98,34.82],[72.82,34.76],[72.78,34.62],[72.85,34.29],[72.83,34.17],[72.71,34.09],[72.24,33.94],[72.23,33.77],[72.02,33.75],[71.88,33.42],[71.72,33.36],[71.72,33.03],[71.45,32.89],[71.33,32.64],[71.34,32.42],[70.9,31.71],[70.79,31.43],[70.84,30.95],[70.75,30.77],[70.85,30.54],[70.77,30.32],[70.84,29.9],[70.64,29.6],[70.72,29.4],[70.66,29.06],[70.37,28.91],[70.03,28.6],[69.76,28.51],[69.57,28.25],[68.92,27.98],[68.95,27.87],[68.86,27.81],[68.93,27.71],[68.79,27.67],[68.68,27.79],[68.64,27.71]],[[79.73,32.44],[79.43,32.74]],[[77.2,32.26],[77.12,31.94],[77.2,31.72],[76.94,31.71],[76.68,31.9],[76.32,31.78],[76.2,31.89],[75.93,31.96],[75.69,32.11],[75.59,32.08],[75.53,31.71],[75.0,31.18]],[[73.54,24.87],[74.05,25.06],[74.31,25.05],[74.66,25.25],[75.04,25.25],[75.06,25.46],[75.38,25.88],[75.54,25.89],[75.55,25.98],[75.66,26.02],[75.65,26.14],[75.78,26.22],[76.02,26.11],[76.58,26.22],[76.74,25.93]]],
    regions: [
      { name: 'The Chauhans of Ajmer', col: 'blue', pts: [[73.3, 25.3], [74.2, 24.9], [75.8, 25.4], [77.2, 26.6], [77.9, 28.2], [77.6, 29.9], [76.2, 30.2], [75.1, 29.3], [74.0, 27.9], [73.2, 26.6]] },
      { name: 'The Ghurids', col: 'red', pts: [[70.6, 29.3], [72.2, 29.8], [73.8, 30.4], [75.2, 31.0], [76.0, 31.8], [75.4, 33.0], [73.6, 33.8], [71.6, 33.5], [70.6, 32.2]] },
    ],
    hills: [[72.8, 24.4], [73.5, 25.2], [74.2, 26.0], [74.9, 26.8], [74.2, 33.6], [75.9, 32.9], [77.5, 31.9], [78.9, 31.0], [72.4, 32.7]],
    dunes: [[71.0, 26.1], [71.8, 27.3], [70.9, 28.2], [72.5, 28.5], [71.5, 25.0], [72.9, 27.6], [73.1, 29.1]],
    forests: [[78.9, 25.1], [79.7, 26.0], [76.9, 23.5], [78.3, 23.0]],
    cities: [['Ajmer', 74.64, 26.45], ['Delhi', 77.21, 28.61], ['Lahore', 74.35, 31.55], ['Multan', 71.47, 30.2, 'small'], ['Anahilapataka', 72.12, 23.85, 'small'], ['Kannauj', 79.92, 27.05, 'small'], ['Nadol', 73.44, 25.37, 'small'], ['Hansi', 75.96, 29.1, 'small']],
    labels: [['THAR', 71.7, 26.7, 'land'], ['THE CHAUHANS', 75.7, 27.5, 'land2'], ['THE GHURIDS', 72.9, 32.3, 'land2'], ['PUNJAB', 73.2, 31.2, 'small'], ['GUJARAT', 71.4, 23.2, 'small'], ['Yamuna', 78.9, 25.9, 'small']],
    battles: [['Kasahrada', 72.84, 24.57, '1178'], ['Tarain', 76.78, 29.95, '1191'], ['Tabarhindah', 74.94, 30.21, '1191'], ['Tarain', 77.12, 29.62, '1192'], ['Chandawar', 78.37, 27.11, '1194']],
    labelSide: [1, -1, -1, 1, 1],
    deco: { rose: [79.6, 23.1] },
  },
  mughals: {
    title: 'The Mughals', sub: '1526 – 1556', view: [73.3, 85.0, 21.5, 35.5], land: '#ecdcaa', land2: '#c9c47c',
    polys: [[[70.38,38.42],[87.92,38.42],[87.92,21.81],[87.7,21.66],[87.2,21.55],[86.92,21.33],[86.84,21.08],[86.97,20.81],[86.88,20.78],[86.99,20.75],[86.94,20.7],[87.04,20.7],[86.75,20.49],[86.72,20.37],[86.81,20.42],[86.69,20.29],[86.75,20.31],[86.5,20.18],[86.43,20.0],[86.21,20.07],[86.15,20.14],[86.17,20.07],[86.37,19.96],[85.48,19.67],[85.43,19.7],[85.58,19.75],[85.57,19.88],[85.44,19.9],[85.27,19.78],[85.1,19.53],[85.12,19.48],[85.23,19.55],[85.19,19.58],[85.25,19.66],[85.39,19.69],[85.38,19.61],[85.29,19.6],[85.33,19.58],[85.58,19.69],[85.18,19.48],[84.79,19.12],[84.74,19.15],[84.74,19.07],[84.78,19.1],[84.74,19.03],[84.35,18.57],[72.91,18.57],[72.86,18.79],[72.93,18.83],[73.0,18.73],[72.98,18.87],[72.9,18.89],[73.06,19.02],[72.99,19.0],[72.97,19.16],[72.81,18.9],[72.77,18.95],[72.83,19.25],[72.78,19.2],[72.78,19.3],[72.97,19.29],[73.05,19.22],[72.99,19.3],[72.76,19.38],[72.75,19.48],[72.88,19.53],[72.74,19.58],[72.72,19.54],[72.69,19.72],[72.73,19.71],[72.73,19.78],[72.68,19.75],[72.65,19.85],[72.95,20.76],[72.9,20.87],[72.84,20.84],[72.89,20.98],[72.77,21.02],[72.85,21.05],[72.81,21.13],[72.7,21.07],[72.71,21.16],[72.62,21.11],[72.73,21.2],[72.62,21.25],[72.59,21.34],[72.65,21.36],[72.56,21.39],[72.75,21.45],[72.58,21.42],[72.82,21.64],[73.13,21.76],[72.93,21.68],[72.55,21.67],[72.57,21.85],[72.73,21.99],[72.54,21.91],[72.5,21.98],[72.58,22.19],[72.75,22.16],[72.81,22.23],[72.92,22.22],[72.92,22.27],[72.57,22.29],[72.47,22.23],[72.39,22.25],[72.4,22.37],[72.33,22.26],[72.15,22.28],[72.31,22.23],[72.31,22.08],[72.17,21.98],[72.1,22.01],[72.1,21.95],[72.03,21.94],[72.16,21.93],[72.17,21.84],[72.06,21.9],[72.1,21.84],[72.0,21.86],[72.0,21.8],[72.17,21.79],[72.3,21.63],[72.06,21.17],[70.98,20.71],[70.74,20.72],[70.38,20.91],[70.38,22.9],[70.53,23.05],[70.47,23.13],[70.38,22.94]]],
    rivers: [[[82.05,22.71],[82.09,22.93],[81.96,23.07],[81.68,23.14],[81.48,23.29],[81.46,23.4],[81.3,23.46],[81.17,23.81],[81.25,23.84],[81.0,24.09],[81.21,24.12],[81.64,24.41],[82.22,24.56],[82.55,24.53],[82.89,24.62],[83.06,24.48],[83.25,24.47],[83.94,24.55],[84.31,25.03],[84.73,25.33],[84.88,25.71]],[[77.35,23.24],[77.48,23.12],[77.62,23.14],[78.09,24.32],[78.27,24.47],[78.17,24.88],[78.35,25.1],[78.54,25.19],[78.73,25.5],[78.91,25.57],[79.1,25.82],[79.33,25.78],[79.54,25.82],[79.51,25.88],[79.61,25.93],[79.79,25.87],[80.21,25.92]],[[76.83,32.33],[76.6,32.3],[76.46,32.45],[76.19,32.47],[76.06,32.62],[75.91,32.61],[75.31,32.15],[74.7,31.95],[74.2,31.5]],[[74.21,31.5],[73.87,31.23],[73.41,31.12],[73.15,30.86],[72.76,30.72],[72.69,30.6],[71.77,30.61]],[[83.96,29.2],[83.91,29.01],[83.59,28.65],[83.65,28.5],[83.57,28.35],[83.67,28.22],[83.55,28.06],[83.58,27.98],[83.44,27.95],[84.02,27.91],[84.4,27.78],[84.41,27.7],[84.1,27.54],[83.94,27.55],[83.94,27.46],[83.83,27.43],[83.84,27.3],[84.14,27.06],[84.43,26.61],[84.52,26.6],[84.88,26.25],[84.95,26.04],[85.17,25.83],[85.18,25.64]],[[81.2,30.85],[80.76,31.12],[80.39,31.07],[80.01,31.29],[79.89,31.47],[79.53,31.51],[79.24,31.67],[78.95,31.66],[78.72,31.85],[78.26,31.52],[77.83,31.56],[77.54,31.35],[77.37,31.36],[77.16,31.24],[76.88,31.41],[76.76,31.41],[76.65,31.27],[76.44,31.42],[76.38,31.34],[76.59,31.08],[76.51,30.98],[75.4,30.99],[75.03,31.18],[74.84,31.16],[74.32,30.89],[73.84,30.36],[73.05,30.09],[72.62,29.83],[72.36,29.84],[72.15,29.66],[72.17,29.58],[71.55,29.39]],[[81.38,30.76],[81.29,30.79],[81.2,30.85]],[[78.34,30.92],[78.1,30.78],[77.96,30.51],[77.58,30.43],[77.54,30.21],[77.22,29.96],[77.06,29.56],[77.12,29.48],[77.07,29.42],[77.15,29.41],[77.22,28.69],[77.22,28.69],[77.5,28.39],[77.54,28.18],[77.47,28.05],[77.58,27.8],[77.69,27.8],[77.66,27.61],[77.86,27.27],[77.95,27.3],[78.02,27.18],[78.2,27.19],[78.21,27.09],[78.35,27.13],[78.3,27.06],[78.41,27.06],[78.51,26.93],[78.51,26.98],[78.64,26.89],[78.73,26.92],[79.0,26.76],[79.08,26.6],[79.29,26.52],[79.22,26.43],[79.46,26.44],[79.56,26.36],[79.53,26.29],[79.77,26.11],[79.9,26.1],[79.95,26.16],[79.96,26.07],[80.08,26.07],[80.19,25.93],[80.54,25.87],[80.46,25.84],[80.57,25.73],[80.92,25.69],[81.02,25.63],[81.02,25.54],[81.18,25.49],[81.15,25.41],[81.26,25.33],[81.47,25.27],[81.9,25.41]],[[77.44,32.29],[76.88,32.64],[76.44,32.77],[76.43,33.05],[76.1,33.31],[75.75,33.38],[75.8,33.16],[75.6,33.14],[75.36,33.14],[75.14,33.27],[75.06,33.16],[74.8,33.18],[74.78,32.91],[74.34,32.61],[73.4,32.23],[73.11,31.83],[72.36,31.49],[72.23,31.22],[72.14,31.18],[71.84,30.66],[71.55,30.47]],[[75.58,24.65],[75.51,24.74],[75.59,24.81],[75.57,24.92],[75.9,25.27],[75.99,25.24],[76.14,25.35],[76.18,25.5],[76.27,25.53],[76.28,25.71],[76.74,25.92],[77.34,26.36],[77.72,26.51],[77.9,26.66],[78.08,26.68],[78.1,26.8],[78.33,26.86],[78.56,26.76],[78.71,26.8],[79.24,26.5]],[[75.67,22.47],[75.51,22.61],[75.5,23.21],[75.39,23.39],[75.35,23.69],[75.27,23.76],[75.51,24.04],[75.39,24.22],[75.35,24.31],[75.6,24.54],[75.58,24.65]],[[80.92,30.55],[81.09,30.48],[81.2,30.22],[81.75,30.04],[81.86,29.93],[81.86,29.81],[82.01,29.75],[81.78,29.61],[81.72,29.28],[81.41,29.02],[81.57,28.77],[81.51,28.75],[81.43,28.9],[80.99,28.94],[81.2,28.85],[81.28,28.7],[81.2,28.34],[81.1,28.34],[81.07,28.25],[81.16,28.03],[81.3,27.92],[81.25,27.71],[81.47,27.08],[81.61,27.05],[81.84,26.81],[82.23,26.82],[82.36,26.67],[82.81,26.58],[83.08,26.4],[83.47,26.26],[83.77,26.25],[83.9,26.13],[84.11,26.09],[84.26,25.93],[84.37,25.94],[84.71,25.74]],[[79.84,30.89],[79.87,30.69],[79.72,30.51],[79.55,30.57],[79.27,30.3],[78.7,30.24],[78.59,30.07],[78.32,30.14],[78.15,29.93],[78.19,29.71],[77.99,29.57],[78.12,29.25],[78.09,28.84],[78.29,28.31],[78.46,28.11],[78.98,27.83],[79.16,27.82],[79.2,27.69],[79.55,27.54],[79.7,27.24],[79.93,27.14],[80.14,26.74],[80.53,26.36],[80.6,26.17],[80.81,26.03],[81.03,26.06],[81.39,25.77],[81.4,25.67],[81.7,25.49],[81.91,25.51],[81.94,25.34],[82.2,25.31],[82.22,25.18],[82.29,25.28],[82.84,25.12],[83.01,25.21],[83.04,25.32],[83.17,25.35],[83.12,25.45],[83.19,25.53],[83.53,25.4],[83.49,25.52],[83.62,25.6],[83.9,25.52],[84.14,25.74],[84.25,25.68],[84.37,25.77],[84.6,25.69],[85.06,25.73],[85.37,25.51],[85.52,25.58],[85.65,25.46],[85.83,25.5],[86.03,25.33],[86.31,25.29],[86.56,25.49],[86.61,25.3],[86.75,25.26]],[[79.44,32.74],[78.96,33.2],[78.71,33.17],[78.2,33.43],[78.15,33.57],[77.56,34.11],[76.84,34.33],[76.6,34.55],[76.32,34.67],[76.19,34.83],[76.22,34.95],[75.92,35.17],[75.84,35.34],[75.64,35.31],[75.32,35.59],[74.75,35.72],[74.72,35.84],[74.63,35.82],[74.63,35.53],[74.4,35.42],[73.31,35.54],[73.27,35.26],[72.89,35.04],[72.86,34.91],[72.98,34.82],[72.82,34.76],[72.78,34.62],[72.85,34.29],[72.83,34.17],[72.71,34.09],[72.24,33.94],[72.23,33.77],[72.02,33.75],[71.88,33.42],[71.72,33.36],[71.72,33.03],[71.55,32.95]],[[79.73,32.44],[79.43,32.74]],[[77.2,32.26],[77.12,31.94],[77.2,31.72],[76.94,31.71],[76.68,31.9],[76.32,31.78],[76.2,31.89],[75.93,31.96],[75.69,32.11],[75.59,32.08],[75.53,31.71],[75.0,31.18]],[[73.54,24.87],[74.05,25.06],[74.31,25.05],[74.66,25.25],[75.04,25.25],[75.06,25.46],[75.38,25.88],[75.54,25.89],[75.55,25.98],[75.66,26.02],[75.65,26.14],[75.78,26.22],[76.02,26.11],[76.58,26.22],[76.74,25.93]]],
    regions: [
      { name: "Babur's Hindustan", col: 'blue', pts: [[73.6, 31.6], [75.2, 32.3], [77.0, 30.7], [78.5, 28.5], [79.7, 27.2], [78.7, 26.2], [77.2, 26.6], [75.8, 28.2], [74.2, 29.6]] },
      { name: 'The Afghans of Bihar', col: 'red', pts: [[82.4, 24.6], [84.8, 24.3], [85.2, 26.4], [83.8, 27.3], [82.6, 26.2]] },
    ],
    hills: [[74.8, 33.6], [76.4, 32.6], [78.0, 31.4], [79.6, 30.2], [81.2, 29.2], [82.8, 28.4], [84.3, 27.9], [74.2, 25.4], [75.2, 26.6], [77.6, 23.4], [79.4, 23.8], [81.0, 24.2], [82.6, 24.5]],
    dunes: [[73.8, 27.0], [74.4, 28.6], [73.7, 25.6]],
    forests: [[80.0, 22.6], [82.0, 23.0], [84.0, 22.4], [80.6, 25.5]],
    cities: [['Delhi', 77.21, 28.61], ['Agra', 78.01, 27.18], ['Lahore', 74.35, 31.55], ['Kannauj', 79.92, 27.05, 'small'], ['Chunar', 82.88, 25.13, 'small'], ['Chittor', 74.64, 24.89, 'small'], ['Gwalior', 78.18, 26.22, 'small'], ['Kalanaur', 75.15, 32.02, 'small']],
    labels: [['HINDUSTAN', 80.9, 28.7, 'land'], ['PUNJAB', 74.6, 30.5, 'small'], ['MEWAR', 74.2, 24.1, 'small'], ['BIHAR', 84.4, 25.0, 'small'], ['Ganges', 81.4, 26.0, 'small']],
    battles: [['Panipat', 76.82, 29.55, '1526'], ['Khanwa', 77.54, 27.04, '1527'], ['Chausa', 83.89, 25.51, '1539'], ['Sirhind', 76.39, 30.64, '1555'], ['Panipat', 77.14, 29.24, '1556']],
    labelSide: [-1, 1, -1, -1, 1],
    deco: { rose: [84.0, 22.6] },
  },
  cholas: {
    title: 'The Cholas', sub: '1020 – 1068', view: [74.0, 82.5, 8.5, 19.7], land: '#e6d9a4', land2: '#b9c27a',
    polys: [[[71.88,21.82],[84.62,21.82],[84.62,18.91],[84.42,18.64],[84.25,18.53],[84.27,18.5],[84.35,18.55],[84.11,18.3],[83.45,17.92],[83.34,17.72],[83.25,17.72],[83.3,17.66],[83.21,17.63],[83.24,17.59],[82.72,17.35],[82.37,17.11],[82.25,16.93],[82.31,16.85],[82.36,16.86],[82.35,16.96],[82.37,16.91],[82.34,16.68],[82.31,16.61],[82.28,16.62],[82.31,16.58],[81.76,16.32],[81.56,16.37],[81.42,16.34],[81.41,16.38],[81.26,16.33],[81.15,15.97],[81.0,15.85],[81.01,15.78],[80.91,15.85],[80.9,16.03],[80.89,15.9],[80.81,15.72],[80.78,15.88],[80.67,15.91],[80.39,15.8],[80.28,15.7],[80.09,15.3],[80.05,15.09],[80.11,14.71],[80.18,14.61],[80.14,14.57],[80.2,14.57],[80.17,14.34],[80.05,14.21],[80.14,14.23],[80.15,14.03],[80.25,13.8],[80.22,13.7],[80.31,13.44],[80.14,13.73],[80.14,13.62],[80.09,13.69],[80.05,13.62],[80.12,13.5],[80.33,13.43],[80.33,13.2],[80.18,12.53],[80.1,12.36],[79.94,12.22],[80.01,12.24],[79.86,12.02],[79.79,11.77],[79.75,11.58],[79.82,11.38],[79.68,11.3],[79.76,11.36],[79.83,11.34],[79.86,10.29],[79.61,10.31],[79.76,10.26],[79.56,10.3],[79.59,10.34],[79.4,10.32],[79.29,10.25],[79.24,10.17],[79.28,10.04],[78.98,9.67],[78.91,9.47],[79.07,9.3],[79.34,9.32],[79.35,9.24],[79.45,9.16],[79.29,9.25],[78.99,9.28],[78.41,9.1],[78.18,8.88],[78.16,8.75],[78.22,8.77],[78.11,8.66],[78.13,8.49],[78.06,8.36],[77.77,8.18],[77.6,8.14],[77.57,8.08],[77.31,8.13],[77.0,8.37],[76.54,8.91],[76.62,8.93],[76.57,8.94],[76.67,9.01],[76.53,8.95],[76.46,9.11],[76.48,9.17],[76.41,9.25],[76.44,9.15],[76.36,9.33],[76.25,9.96],[76.34,9.7],[76.33,9.87],[76.39,9.68],[76.36,9.52],[76.46,9.5],[76.5,9.53],[76.41,9.57],[76.39,9.84],[76.28,9.98],[76.25,10.1],[76.22,10.14],[76.24,9.99],[76.18,10.11],[76.18,10.17],[76.24,10.24],[76.19,10.27],[76.2,10.2],[76.15,10.22],[75.92,10.77],[75.74,11.37],[75.61,11.48],[75.51,11.73],[75.32,11.9],[75.31,11.93],[75.4,11.92],[75.39,11.97],[75.3,11.97],[75.3,12.04],[75.28,11.97],[75.19,12.02],[75.14,12.25],[75.11,12.22],[74.83,12.82],[74.94,12.88],[74.82,12.86],[74.69,13.38],[74.67,13.63],[74.74,13.65],[74.69,13.71],[74.66,13.66],[74.5,14.03],[74.43,14.24],[74.51,14.25],[74.42,14.3],[74.35,14.53],[74.39,14.46],[74.43,14.48],[74.36,14.57],[74.3,14.53],[74.34,14.61],[74.28,14.61],[74.25,14.72],[74.1,14.79],[74.24,14.88],[74.21,14.9],[74.11,14.85],[74.04,14.92],[74.03,15.0],[73.91,15.08],[73.96,15.15],[73.89,15.34],[73.78,15.41],[73.97,15.37],[73.8,15.45],[73.87,15.54],[73.77,15.5],[73.74,15.57],[73.84,15.66],[73.72,15.63],[73.6,15.88],[73.45,16.07],[73.49,16.19],[73.45,16.11],[73.36,16.37],[73.38,16.4],[73.3,16.53],[73.31,16.56],[73.38,16.52],[73.31,16.6],[73.37,16.61],[73.31,16.64],[73.28,17.08],[73.19,17.31],[73.25,17.28],[73.13,17.56],[73.2,17.59],[73.12,17.63],[73.12,17.74],[73.01,18.01],[73.04,18.07],[72.99,18.07],[72.93,18.22],[72.94,18.29],[73.06,18.19],[73.07,18.27],[72.98,18.3],[72.89,18.43],[72.92,18.54],[73.01,18.47],[72.91,18.56],[72.85,18.72],[72.87,18.8],[72.93,18.83],[73.0,18.73],[72.98,18.87],[72.9,18.89],[73.06,19.02],[72.99,19.0],[72.97,19.16],[72.93,19.03],[72.87,19.01],[72.82,18.9],[72.77,18.95],[72.82,19.05],[72.82,19.17],[72.78,19.16],[72.83,19.25],[72.78,19.2],[72.79,19.31],[72.97,19.29],[73.05,19.22],[72.99,19.3],[72.8,19.33],[72.76,19.38],[72.75,19.48],[72.88,19.53],[72.8,19.53],[72.74,19.58],[72.76,19.52],[72.72,19.54],[72.69,19.72],[72.73,19.71],[72.73,19.78],[72.68,19.75],[72.65,19.85],[72.75,20.28],[72.89,20.53],[72.9,20.73],[72.95,20.76],[72.92,20.82],[72.89,20.81],[72.9,20.87],[72.84,20.84],[72.84,20.93],[72.89,20.98],[72.77,21.02],[72.85,21.05],[72.81,21.13],[72.7,21.07],[72.71,21.16],[72.67,21.1],[72.62,21.11],[72.73,21.2],[72.65,21.27],[72.62,21.25],[72.59,21.34],[72.65,21.36],[72.56,21.39],[72.75,21.45],[72.74,21.48],[72.58,21.42],[72.82,21.64],[73.13,21.76],[72.93,21.68],[72.55,21.67],[72.56,21.82],[71.99,21.82],[72.02,21.77],[72.17,21.79],[72.3,21.63],[72.1,21.32],[72.1,21.21],[71.88,21.1]],[[81.88,7.09],[81.88,6.98],[81.78,6.61],[81.68,6.46],[81.56,6.38],[80.0,6.38],[79.85,6.89],[79.82,7.21],[79.85,7.12],[79.86,7.17],[79.7,8.22],[79.78,8.35],[79.73,8.01],[79.81,7.99],[79.81,8.24],[79.87,8.54],[79.94,8.64],[79.92,8.94],[80.05,9.03],[80.11,9.19],[80.12,9.3],[80.05,9.39],[80.2,9.47],[80.05,9.6],[80.23,9.53],[80.29,9.45],[80.43,9.5],[80.61,9.45],[80.19,9.65],[80.19,9.58],[79.96,9.69],[79.91,9.77],[79.97,9.82],[80.12,9.82],[80.44,9.58],[80.14,9.8],[80.25,9.83],[80.41,9.62],[80.74,9.36],[80.79,9.25],[80.82,9.27],[80.88,9.15],[80.83,9.14],[80.96,9.02],[80.88,9.04],[80.91,8.94],[80.98,8.98],[81.23,8.65],[81.2,8.61],[81.25,8.55],[81.21,8.57],[81.21,8.51],[81.16,8.53],[81.13,8.5],[81.37,8.48],[81.39,8.36],[81.35,8.4],[81.36,8.36],[81.4,8.34],[81.45,8.13],[81.43,8.1],[81.4,8.19],[81.4,8.14],[81.56,8.0],[81.59,7.86],[81.71,7.71],[81.63,7.76],[81.6,7.73],[81.66,7.72],[81.75,7.62],[81.77,7.46],[81.81,7.41],[81.83,7.47],[81.86,7.41]]],
    rivers: [[[73.65,20.01],[73.97,19.98],[74.06,20.05],[74.51,19.89],[74.85,19.66],[75.18,19.59],[75.44,19.42],[75.72,19.35],[75.91,19.39],[75.92,19.3],[76.01,19.34],[76.3,19.27],[76.36,19.23],[76.33,19.11],[76.44,19.06],[76.57,19.11],[76.74,18.98],[76.78,19.05],[77.08,19.12],[77.13,19.07],[77.38,19.16],[77.48,19.01],[77.89,18.83],[78.22,19.0],[78.3,18.93],[78.39,18.99],[78.54,18.94],[78.68,19.03],[79.01,19.08],[79.18,18.88],[79.29,18.81],[79.43,18.85],[79.69,18.68],[79.81,18.72],[79.84,18.88],[80.09,18.7],[80.29,18.71],[80.39,18.6],[80.39,18.48],[80.49,18.29],[80.89,17.94],[80.9,17.64],[81.51,17.46],[81.67,17.31],[81.65,17.2],[81.86,16.58],[81.83,16.48],[81.7,16.43],[81.71,16.31]],[[81.76,16.96],[81.93,16.72],[82.34,16.7]],[[73.8,17.99],[73.93,17.91],[74.14,17.61],[74.09,17.47],[74.21,17.28],[74.2,17.15],[74.44,17.04],[74.55,16.83],[74.69,16.74],[74.61,16.7],[74.68,16.57],[74.98,16.68],[75.11,16.51],[75.19,16.63],[75.36,16.6],[75.45,16.51],[75.44,16.43],[75.64,16.45],[76.0,16.31],[76.08,16.2],[76.28,16.15],[76.99,16.57],[77.17,16.44],[77.73,16.33],[78.18,15.95],[78.24,16.04],[78.4,16.08],[78.79,16.03],[78.85,16.15],[79.0,16.23],[79.21,16.24],[79.21,16.49],[79.31,16.58],[79.77,16.73],[79.96,16.63],[80.1,16.82],[80.19,16.61],[80.47,16.59],[80.68,16.44],[80.82,16.26],[80.88,16.01]],[[75.66,12.34],[75.74,12.28],[75.87,12.32],[76.05,12.62],[76.23,12.52],[76.43,12.52],[76.57,12.43],[76.78,12.4],[76.91,12.23],[77.02,12.24],[77.05,12.17],[77.2,12.32],[77.42,12.29],[77.49,12.21],[77.7,12.2],[77.73,12.08],[77.67,11.97]],[[77.67,11.97],[77.83,11.91],[77.82,11.82],[77.69,11.42],[77.85,11.24],[77.89,11.1],[78.12,11.06],[78.2,10.95],[78.68,10.87]],[[78.6,10.88],[78.89,10.82],[79.26,10.93],[79.84,10.91]],[[78.88,10.82],[78.89,10.82],[79.37,10.79],[79.49,10.56],[79.47,10.42],[79.53,10.34]],[[73.69,19.01],[74.06,18.64],[74.14,18.6],[74.26,18.67],[74.51,18.5],[74.65,18.46],[74.71,18.5],[74.72,18.41],[74.84,18.34],[74.8,18.29],[75.09,18.22],[75.08,18.13],[75.15,18.1],[75.02,17.98],[75.13,18.0],[75.19,17.94],[75.13,17.89],[75.19,17.88],[75.16,17.79],[75.36,17.68],[75.45,17.71],[75.65,17.54],[75.62,17.48],[75.68,17.43],[75.78,17.37],[75.87,17.42],[75.94,17.33],[76.05,17.34],[76.17,17.2],[76.39,17.15],[76.38,17.07],[76.56,17.18],[76.51,17.09],[76.68,17.07],[76.74,17.15],[76.81,17.04],[76.91,17.04],[76.94,16.9],[76.89,16.84],[77.13,16.73],[77.28,16.42]],[[77.57,13.41],[77.61,13.47],[77.49,13.66],[77.49,13.88],[77.28,14.44],[77.27,14.67],[77.33,14.87],[77.62,14.95],[77.78,14.9],[77.93,14.96],[78.24,14.8],[78.36,14.87],[78.93,14.47],[79.15,14.43],[79.45,14.57],[79.71,14.59],[79.97,14.47],[80.15,14.57]],[[75.63,13.71],[75.7,13.79],[75.66,14.01],[75.72,14.07],[75.62,14.36],[75.68,14.5],[75.81,14.57],[75.8,14.67],[75.67,14.81],[75.68,14.94],[75.89,15.09],[76.32,15.27],[76.78,15.49],[76.84,15.65],[77.14,15.96],[77.89,15.92],[78.1,15.83],[78.24,15.97]],[[75.63,13.71],[75.56,13.68],[75.53,13.5]],[[75.32,13.23],[75.48,13.29],[75.53,13.5]],[[77.9,13.24],[78.24,13.16],[78.42,12.97],[78.4,12.8],[78.5,12.68],[78.88,12.91],[79.23,12.97],[79.91,12.75],[80.0,12.53],[80.15,12.46]],[[78.68,10.87],[78.86,10.84],[79.19,10.94],[79.68,11.3]]],
    regions: [
      { name: 'The Cholas', col: 'blue', pts: [[77.9, 8.7], [79.4, 9.4], [80.3, 10.4], [80.3, 13.4], [79.4, 14.2], [78.2, 13.7], [77.3, 11.4], [77.1, 9.6]] },
      { name: 'The Chalukyas of Kalyani', col: 'red', pts: [[74.3, 14.9], [76.2, 14.8], [77.4, 15.6], [78.4, 16.8], [78.4, 18.8], [76.4, 19.4], [74.5, 18.2]] },
    ],
    hills: [[74.5, 16.9], [74.7, 15.5], [75.1, 14.1], [75.6, 12.7], [76.4, 11.5], [77.0, 10.3], [78.8, 13.9], [79.2, 15.3], [80.6, 17.6], [81.6, 18.6], [76.4, 15.1]],
    forests: [[81.4, 18.9], [80.1, 18.3], [78.3, 12.6], [76.9, 11.7], [82.0, 17.6]],
    cities: [['Kanchi', 79.7, 12.83], ['Gangaikonda Cholapuram', 79.45, 11.21, 'small'], ['Thanjavur', 79.14, 10.79, 'small'], ['Kalyani', 76.95, 17.87], ['Vengi', 81.1, 16.7, 'small'], ['Kampili', 76.61, 15.41, 'small'], ['Kuruvatti', 75.7, 14.78, 'small']],
    labels: [['CHOLAS', 78.7, 12.3, 'land2'], ['CHALUKYAS', 76.1, 18.6, 'land2'], ['VENGI', 81.5, 17.4, 'small'], ['Bay of', 81.45, 13.1, 'sea'], ['Bengal', 81.45, 12.8, 'sea'], ['Arabian', 74.75, 12.3, 'sea'], ['Sea', 74.75, 12.0, 'sea'], ['Tungabhadra', 76.9, 14.9, 'small']],
    battles: [['Maski', 76.65, 15.97, 'c. 1020'], ['Kalyani', 76.95, 17.87, 'c. 1045'], ['Koppam', 76.15, 15.35, 'c. 1054'], ['Mudakkaru', 78.3, 16.0, 'c. 1062'], ['Vijayawada', 80.62, 16.51, '1067']],
    labelSide: [1, 1, -1, 1, 1],
    deco: { rose: [81.8, 10.3] },
  },
});

/* ===== src/art/19-themes.js ===== */
/* Roll to War: maze themes for the campaigns — French countryside, desert, city walls and the sea.
   Each theme draws its own floor tile and wall block (same grid rules as the training mazes). */
const THEMES = (RTW.THEMES = {});
const tRand = (q, r, s) => rng(((q * 73856093) ^ (r * 19349663) ^ (s * 83492791)) >>> 0);

/* ---------- countryside: dirt lanes between hedgerows ---------- */
THEMES.countryside = {
  name: 'French countryside', grass: 'g',
  floor(c, x, y, T, q, r) {
    // one continuous dirt lane (the pattern is anchored to the board, so tiles join without seams)
    c.fillStyle = W.grassPattern(c, 1, 'lane'); c.fillRect(x, y, T, T);
  },
  block(c, x, y, T, h, nb, dpr, seed) {
    // hedgerow: rounded bushes along the block with a darker base
    const [n, e, s, w] = nb.split('').map((k) => k === '1');
    const R = rng(seed * 13 + 7);
    const x0 = w ? x - 1 : x + T * 0.06, x1 = e ? x + T + 1 : x + T * 0.94, y0 = n ? y - 1 : y + T * 0.08, y1 = s ? y + T + 1 : y + T * 0.92;
    c.save();
    c.fillStyle = 'rgba(20,30,10,0.3)'; c.fillRect(x0, y1 - T * 0.05, x1 - x0, T * 0.12);
    c.beginPath(); rr(c, x0, y0 - h * 0.6, x1 - x0, y1 - y0 + h * 0.2, T * 0.18); c.fillStyle = PAL.leafD; c.fill();
    const blobs = [];
    for (let i = 0; i < 5; i++) blobs.push([x0 + (x1 - x0) * (0.12 + R() * 0.76), y0 + (y1 - y0) * (0.15 + R() * 0.7) - h * 0.55, T * (0.2 + R() * 0.12)]);
    c.lineWidth = Math.max(1.2, T * 0.045); c.strokeStyle = INK;
    for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.stroke(); }
    for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.fillStyle = PAL.leaf; c.fill(); c.beginPath(); circ(c, bx - br * 0.3, by - br * 0.35, br * 0.45); c.fillStyle = PAL.leafL; c.fill(); }
    const cols = ['#f2e8c9', '#e8a0c8', '#f6d34a'];
    for (let i = 0; i < 4; i++) { c.fillStyle = cols[i % 3]; c.beginPath(); circ(c, x0 + (x1 - x0) * R(), y0 + (y1 - y0) * R() - h * 0.5, T * 0.035); c.fill(); }
    c.restore();
  },
  deco(c, x, y, T, kind, t) {
    if (kind === 'hay') { c.beginPath(); c.moveTo(x - T * 0.28, y); c.quadraticCurveTo(x - T * 0.3, y - T * 0.5, x, y - T * 0.55); c.quadraticCurveTo(x + T * 0.3, y - T * 0.5, x + T * 0.28, y); c.closePath(); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#e2b95a'; c.fill(); c.strokeStyle = 'rgba(120,80,20,0.5)'; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * T * 0.08, y - T * 0.05); c.lineTo(x + i * T * 0.05, y - T * 0.45); c.stroke(); } }
    if (kind === 'stakes') { for (let i = 0; i < 4; i++) { const sx = x - T * 0.36 + i * T * 0.24; c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + T * 0.16, y - T * 0.42); c.lineWidth = Math.max(3, T * 0.09); c.strokeStyle = INK; c.stroke(); c.lineWidth = Math.max(1.6, T * 0.05); c.strokeStyle = PAL.woodL; c.stroke(); } }
  },
};

/* ---------- desert: sand tracks between sandstone ridges ---------- */
THEMES.desert = {
  name: 'Desert and hills', grass: 'sand',
  floor(c, x, y, T, q, r) {
    c.fillStyle = W.grassPattern(c, 1, 'sand'); c.fillRect(x, y, T, T);
  },
  block(c, x, y, T, h, nb, dpr, seed) {
    // sandstone ridge / mud-brick wall
    const [n, e, s, w] = nb.split('').map((k) => k === '1');
    const x0 = w ? x - 1 : x + T * 0.05, x1 = e ? x + T + 1 : x + T * 0.95, y0 = (n ? y - 1 : y + T * 0.05) - h, y1 = y + T - h;
    const lw = Math.max(1.2, T * 0.045);
    if (!s) { c.fillStyle = '#b8864a'; c.fillRect(x0, y1, x1 - x0, h); c.fillStyle = 'rgba(80,50,20,0.35)'; c.fillRect(x0, y1 + h * 0.5, x1 - x0, h * 0.5); c.strokeStyle = 'rgba(80,50,20,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + (x1 - x0) * 0.4, y1); c.lineTo(x0 + (x1 - x0) * 0.4, y1 + h); c.stroke(); }
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#f0d49a'); g.addColorStop(1, '#d9b06a'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.strokeStyle = 'rgba(120,80,30,0.4)'; c.lineWidth = Math.max(0.8, T * 0.025);
    const R = rng(seed + 5); c.beginPath(); for (let i = 1; i < 3; i++) { const yy = y0 + (y1 - y0) * i / 3; c.moveTo(x0 + 2, yy); c.lineTo(x1 - 2, yy); const jx = x0 + (x1 - x0) * (0.2 + R() * 0.6); c.moveTo(jx, yy - (y1 - y0) / 3); c.lineTo(jx, yy); } c.stroke();
    c.strokeStyle = INK; c.lineWidth = lw; c.beginPath();
    if (!n) { c.moveTo(x0, y0); c.lineTo(x1, y0); } if (!w) { c.moveTo(x0, y0); c.lineTo(x0, s ? y1 : y1 + h); } if (!e) { c.moveTo(x1, y0); c.lineTo(x1, s ? y1 : y1 + h); } if (!s) { c.moveTo(x0, y1 + h); c.lineTo(x1, y1 + h); c.moveTo(x0, y1); c.lineTo(x1, y1); }
    c.stroke();
  },
  deco(c, x, y, T, kind, t) {
    if (kind === 'palm') {
      c.beginPath(); c.moveTo(x - T * 0.05, y); c.quadraticCurveTo(x - T * 0.1, y - T * 0.5, x + T * 0.06, y - T * 0.9); c.lineTo(x + T * 0.12, y - T * 0.88); c.quadraticCurveTo(x, y - T * 0.5, x + T * 0.06, y); c.closePath(); c.lineWidth = Math.max(1.2, T * 0.035); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#9a6a3c'; c.fill();
      const sw = Math.sin(t * 1.5) * 0.05;
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.62 + sw; c.save(); c.translate(x + T * 0.09, y - T * 0.9); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(T * 0.25, -T * 0.12, T * 0.5, T * 0.08); c.quadraticCurveTo(T * 0.25, T * 0.02, 0, T * 0.03); c.closePath(); c.stroke(); c.fillStyle = i % 2 ? '#3f8a3f' : '#5aa84a'; c.fill(); c.restore(); }
    }
    if (kind === 'well') { c.beginPath(); ell(c, x, y - T * 0.08, T * 0.3, T * 0.14); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#d9b06a'; c.fill(); c.beginPath(); ell(c, x, y - T * 0.12, T * 0.2, T * 0.08); c.fillStyle = '#4a7f9a'; c.fill(); }
    if (kind === 'tent') { c.beginPath(); c.moveTo(x - T * 0.4, y); c.lineTo(x, y - T * 0.5); c.lineTo(x + T * 0.4, y); c.closePath(); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#e8dcc0'; c.fill(); c.fillStyle = '#b8312a'; c.beginPath(); c.moveTo(x - T * 0.08, y); c.lineTo(x, y - T * 0.28); c.lineTo(x + T * 0.08, y); c.closePath(); c.fill(); }
  },
};

/* ---------- city walls: flagstone streets between tall crenellated walls ---------- */
THEMES.walls = {
  name: 'City walls', grass: 'stone',
  floor(c, x, y, T, q, r) {
    const R = tRand(q, r, 31);
    c.fillStyle = '#7d7466'; c.fillRect(x, y, T, T);
    const cells = [[0, 0, 0.55, 0.5], [0.55, 0, 0.45, 0.5], [0, 0.5, 0.35, 0.5], [0.35, 0.5, 0.65, 0.5]];
    for (const [a, b, w2, h2] of cells) { c.beginPath(); rr(c, x + T * a + 1.2, y + T * b + 1.2, T * w2 - 2.4, T * h2 - 2.4, T * 0.06); c.fillStyle = mix('#c9bfa9', '#b3a78e', R()); c.fill(); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x + T * a + 2, y + T * b + 2, T * w2 * 0.5, T * 0.05); }
  },
  block(c, x, y, T, h, nb, dpr, seed) {
    const H = h * 1.7, [n, e, s, w] = nb.split('').map((k) => k === '1');
    const x0 = w ? x - 1 : x + T * 0.04, x1 = e ? x + T + 1 : x + T * 0.96, y0 = (n ? y - 1 : y + T * 0.04) - H, y1 = y + T - H;
    const lw = Math.max(1.2, T * 0.045);
    if (!s) {
      const g = c.createLinearGradient(0, y1, 0, y1 + H); g.addColorStop(0, '#b9ae98'); g.addColorStop(1, '#8a806c'); c.fillStyle = g; c.fillRect(x0, y1, x1 - x0, H);
      c.strokeStyle = 'rgba(60,55,45,0.45)'; c.lineWidth = Math.max(0.8, T * 0.022);
      for (let i = 1; i < 4; i++) { const yy = y1 + (H * i) / 4; c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke(); const off = i % 2 ? 0.3 : 0.65; c.beginPath(); c.moveTo(x0 + (x1 - x0) * off, yy - H / 4); c.lineTo(x0 + (x1 - x0) * off, yy); c.stroke(); }
      c.fillStyle = '#2a241e'; c.fillRect((x0 + x1) / 2 - T * 0.03, y1 + H * 0.3, T * 0.06, H * 0.3);
    }
    c.fillStyle = '#d6ccb4'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    // walkway + crenels on the outer edges
    c.fillStyle = '#b3a78e'; c.fillRect(x0 + T * 0.12, y0 + T * 0.12, x1 - x0 - T * 0.24, y1 - y0 - T * 0.24);
    c.strokeStyle = INK; c.lineWidth = lw; c.beginPath();
    if (!n) { c.moveTo(x0, y0); c.lineTo(x1, y0); } if (!w) { c.moveTo(x0, y0); c.lineTo(x0, s ? y1 : y1 + H); } if (!e) { c.moveTo(x1, y0); c.lineTo(x1, s ? y1 : y1 + H); } if (!s) { c.moveTo(x0, y1 + H); c.lineTo(x1, y1 + H); c.moveTo(x0, y1); c.lineTo(x1, y1); }
    c.stroke();
    if (!s) for (let i = 0; i < 3; i++) { const mx = x0 + (x1 - x0) * (0.08 + i * 0.34); c.beginPath(); c.rect(mx, y1 - T * 0.12, (x1 - x0) * 0.2, T * 0.14); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#d6ccb4'; c.fill(); }
  },
  deco(c, x, y, T, kind, t) {
    if (kind === 'tower') {
      c.beginPath(); c.rect(x - T * 0.36, y - T * 1.2, T * 0.72, T * 1.2); c.lineWidth = Math.max(1.4, T * 0.045); c.strokeStyle = INK; c.stroke(); const g = c.createLinearGradient(x - T * 0.36, 0, x + T * 0.36, 0); g.addColorStop(0, '#d6ccb4'); g.addColorStop(1, '#9a8f78'); c.fillStyle = g; c.fill();
      for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(x - T * 0.36 + i * T * 0.27, y - T * 1.36, T * 0.18, T * 0.16); c.stroke(); c.fillStyle = '#d6ccb4'; c.fill(); }
      c.fillStyle = '#2a241e'; c.fillRect(x - T * 0.04, y - T * 0.9, T * 0.08, T * 0.26);
    }
  },
};

/* ---------- sea: open water lanes between islands and reefs ---------- */
THEMES.sea = {
  name: 'Coast and straits', grass: 'deep', sea: true,
  floor(c, x, y, T, q, r) {
    c.fillStyle = W.grassPattern(c, 1, 'sea'); c.fillRect(x, y, T, T);
  },
  block(c, x, y, T, h, nb, dpr, seed) {
    // island: beach ring, grass top, rocks; merges with neighbours
    const [n, e, s, w] = nb.split('').map((k) => k === '1');
    const R = rng(seed * 17 + 3);
    const ins = T * 0.1;
    const x0 = w ? x - 1 : x + ins, x1 = e ? x + T + 1 : x + T - ins, y0 = n ? y - 1 : y + ins, y1 = s ? y + T + 1 : y + T - ins;
    const rad = T * 0.3;
    const shape = (grow) => { c.beginPath(); rr(c, x0 - grow, y0 - grow, x1 - x0 + grow * 2, y1 - y0 + grow * 2, rad); };
    shape(T * 0.2); c.fillStyle = 'rgba(140,235,230,0.28)'; c.fill();
    shape(T * 0.08); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
    shape(0); c.fillStyle = '#f0dba6'; c.fill();
    shape(-T * 0.1); c.fillStyle = W.grassPattern(c, 1); c.fill();
    c.fillStyle = 'rgba(40,90,30,0.35)'; for (let i = 0; i < 4; i++) { c.beginPath(); circ(c, x0 + (x1 - x0) * R(), y0 + (y1 - y0) * R(), T * 0.06); c.fill(); }
    // edge outline only where exposed
    c.strokeStyle = 'rgba(35,23,15,0.8)'; c.lineWidth = Math.max(1, T * 0.035); c.beginPath();
    if (!n) { c.moveTo(x0 + (w ? 0 : rad), y0); c.lineTo(x1 - (e ? 0 : rad), y0); } if (!s) { c.moveTo(x0 + (w ? 0 : rad), y1); c.lineTo(x1 - (e ? 0 : rad), y1); }
    if (!w) { c.moveTo(x0, y0 + (n ? 0 : rad)); c.lineTo(x0, y1 - (s ? 0 : rad)); } if (!e) { c.moveTo(x1, y0 + (n ? 0 : rad)); c.lineTo(x1, y1 - (s ? 0 : rad)); }
    c.stroke();
    if (R() < 0.7) { const px = x0 + (x1 - x0) * (0.3 + R() * 0.4), py = y0 + (y1 - y0) * (0.4 + R() * 0.3); W.pine(c, px, py + T * 0.15, T * 0.2, seed); }
    if (R() < 0.5) W.rock(c, x0 + (x1 - x0) * (0.2 + R() * 0.6), y0 + (y1 - y0) * 0.85, T * 0.12, seed + 2);
  },
  deco(c, x, y, T, kind, t, dir) {
    if (kind === 'current') {
      // current tile: streaks + chevrons pushing along dir
      const a = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir || 'right'];
      c.save(); c.translate(x, y); c.rotate(a);
      c.beginPath(); c.rect(-T / 2, -T / 2, T, T); c.clip();
      for (let i = 0; i < 3; i++) { const k = ((t * 0.9 + i / 3) % 1) - 0.5; c.strokeStyle = `rgba(255,255,255,${0.55 - Math.abs(k) * 0.7})`; c.lineWidth = Math.max(1.5, T * 0.06); c.beginPath(); c.moveTo(k * T - T * 0.12, -T * 0.2); c.lineTo(k * T + T * 0.06, 0); c.lineTo(k * T - T * 0.12, T * 0.2); c.stroke(); }
      c.strokeStyle = 'rgba(210,240,250,0.35)'; c.lineWidth = 1.2; for (let j = -1; j <= 1; j += 2) { c.beginPath(); c.moveTo(-T / 2, j * T * 0.36); c.quadraticCurveTo(0, j * T * 0.3, T / 2, j * T * 0.36); c.stroke(); }
      c.restore();
    }
    if (kind === 'reef') { const R = rng(Math.round(x * 3 + y)); for (let i = 0; i < 4; i++) W.rock(c, x + (R() - 0.5) * T * 0.6, y + (R() - 0.2) * T * 0.4, T * (0.08 + R() * 0.06), i); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.2; c.beginPath(); ell(c, x, y + T * 0.1, T * 0.42, T * 0.2); c.stroke(); }
    if (kind === 'whirl') { c.save(); c.translate(x, y); c.rotate(t * 2); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = Math.max(1.4, T * 0.045); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, T * (0.12 + i * 0.1), i, i + 3.6); c.stroke(); } c.restore(); }
  },
};

/* sea gate: two buoys and a glowing band */
THEMES.sea.gate = function (c, cx, cy, T, mult, t) {
  const col = mult >= 3 ? PAL.gate3 : PAL.gate2, dk = mult >= 3 ? PAL.gate3D : PAL.gate2D;
  c.save();
  const band = c.createLinearGradient(0, cy - T * 0.2, 0, cy + T * 0.2); band.addColorStop(0, rgba(col, 0)); band.addColorStop(0.5, rgba(col, 0.55 + 0.2 * Math.sin(t * 5))); band.addColorStop(1, rgba(col, 0));
  c.fillStyle = band; c.fillRect(cx - T * 0.45, cy - T * 0.2, T * 0.9, T * 0.4);
  for (const sx of [-1, 1]) { const bx = cx + sx * T * 0.46, by = cy + Math.sin(t * 2 + sx) * T * 0.03; c.beginPath(); ell(c, bx, by, T * 0.12, T * 0.07); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill(); c.beginPath(); c.moveTo(bx - T * 0.09, by); c.lineTo(bx - T * 0.06, by - T * 0.28); c.lineTo(bx + T * 0.06, by - T * 0.28); c.lineTo(bx + T * 0.09, by); c.closePath(); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill(); c.fillStyle = '#fff'; c.fillRect(bx - T * 0.07, by - T * 0.17, T * 0.14, T * 0.05); }
  c.beginPath(); rr(c, cx - T * 0.26, cy - T * 0.52, T * 0.52, T * 0.3, T * 0.1); c.lineWidth = Math.max(1.4, T * 0.045); c.strokeStyle = INK; c.stroke(); c.fillStyle = dk; c.fill();
  text(c, '×' + mult, cx, cy - T * 0.365, { size: T * 0.22, weight: 700, fill: '#fff' });
  c.restore();
};
/* floating crate pickup */
THEMES.sea.pickup = function (c, cx, cy, T, kind, t) {
  const bob = Math.sin(t * 2.4 + cx) * T * 0.03;
  c.save();
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, cx, cy + T * 0.1, T * 0.26, T * 0.08); c.fill();
  c.beginPath(); rr(c, cx - T * 0.18, cy - T * 0.12 + bob, T * 0.36, T * 0.24, T * 0.04); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.woodL; c.fill();
  c.strokeStyle = PAL.woodD; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - T * 0.18, cy + bob); c.lineTo(cx + T * 0.18, cy + bob); c.stroke();
  const iy = cy - T * 0.4 + bob, S = T * 0.46;
  if (kind === 'armor') ICON.shield(c, cx, iy, S); else if (kind === 'speed') ICON.boot(c, cx + S * 0.08, iy + S * 0.12, S * 0.95); else ICON.fist(c, cx, iy, S * 0.92);
  c.restore();
};
/* harbour: the sea version of a crew house — a pier, a boathouse and the crew's banner */
THEMES.sea.harbour = function (c, cx, by, w, type, team = 'blue', t = 0, count = null) {
  const tm = TEAMS[team], h = w * 0.5, lw = Math.max(1.2, w * 0.022);
  c.save(); c.lineJoin = 'round';
  // quay (stone)
  c.beginPath(); c.rect(cx - w * 0.5, by - h * 0.35, w, h * 0.35); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.stone; c.fill();
  c.strokeStyle = 'rgba(50,50,60,0.45)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(cx - w * 0.5 + (w * i) / 5, by - h * 0.35); c.lineTo(cx - w * 0.5 + (w * i) / 5, by); c.stroke(); }
  // boathouse
  const bx0 = cx - w * 0.36, bw = w * 0.72, bt = by - h * 0.35 - h * 0.62;
  c.beginPath(); c.rect(bx0, bt, bw, h * 0.62); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#e8d8b8'; c.fill();
  c.beginPath(); c.moveTo(cx - w * 0.15, by - h * 0.35); c.lineTo(cx - w * 0.15, bt + h * 0.2); c.quadraticCurveTo(cx, bt + h * 0.06, cx + w * 0.15, bt + h * 0.2); c.lineTo(cx + w * 0.15, by - h * 0.35); c.closePath(); c.fillStyle = '#2a2a38'; c.fill();
  const roof = () => { c.beginPath(); c.moveTo(bx0 - w * 0.06, bt + 2); c.quadraticCurveTo(cx, bt - h * 0.5, bx0 + bw + w * 0.06, bt + 2); c.closePath(); };
  roof(); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); const rg = c.createLinearGradient(0, bt - h * 0.4, 0, bt); rg.addColorStop(0, tm.light); rg.addColorStop(1, tm.dark); c.fillStyle = rg; c.fill();
  // pier into the water
  c.fillStyle = PAL.woodL; c.fillRect(cx - w * 0.08, by, w * 0.16, h * 0.4); c.strokeStyle = INK; c.lineWidth = lw; c.strokeRect(cx - w * 0.08, by, w * 0.16, h * 0.4);
  // banner + ship icon
  const fx = cx + w * 0.42, ft = bt - h * 0.3;
  c.beginPath(); c.moveTo(fx, by - h * 0.35); c.lineTo(fx, ft); c.lineWidth = Math.max(2, w * 0.03); c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.moveTo(fx, ft); c.lineTo(fx - w * 0.3, ft + Math.sin(t * 3) * 2); c.lineTo(fx - w * 0.3, ft + h * 0.3); c.lineTo(fx, ft + h * 0.3); c.closePath(); c.lineWidth = lw * 1.6; c.stroke(); c.fillStyle = tm.main; c.fill();
  if (RTW.drawShip && type) RTW.drawShip(c, { type, team, x: cx, y: bt + h * 0.42, size: w * 0.34, heading: 0, cam: SHIPCAM.profile, water: false, t, row: false, detail: 0 });
  if (count != null) {
    const r = w * 0.15, bx2 = cx - w * 0.44, by2 = bt - h * 0.05;
    c.beginPath(); circ(c, bx2, by2, r); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); const cg = c.createLinearGradient(0, by2 - r, 0, by2 + r); cg.addColorStop(0, '#fff6d8'); cg.addColorStop(1, PAL.parchD); c.fillStyle = cg; c.fill();
    text(c, String(count), bx2, by2 + r * 0.06, { size: r * 1.15, weight: 700, fill: INK, maxW: r * 1.7 });
  }
  c.restore();
};

/* render a whole themed maze into a canvas context (floor + blocks sorted by row) */
RTW.renderThemedMaze = function (c, map, theme, t = 0, o = {}) {
  const TH = THEMES[theme], { cols, rows, grid, T } = map, ox = map.ox || 0, oy = map.oy || 0;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const ch = grid[r][q]; if (ch !== '#' || TH.sea) TH.floor(c, ox + q * T, oy + r * T, T, q, r); }
  if (!TH.sea) for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (grid[r][q] === '#') TH.floor(c, ox + q * T, oy + r * T, T, q, r);
  (map.currents || []).forEach((m) => TH.deco && TH.sea && TH.deco(c, ox + (m.c + 0.5) * T, oy + (m.r + 0.5) * T, T, 'current', t, m.dir));
  (map.markers || []).forEach((m) => W.turnMarker(c, ox + (m.c + 0.5) * T, oy + (m.r + 0.5) * T, T, m.dir));
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (grid[r][q] === '#') TH.block(c, ox + q * T, oy + r * T, T, T * 0.3, W.blockNb(map, r, q), o.dpr || 1, r * 13 + q);
};

/* ===== src/art/19b-themes2.js ===== */
/* Roll to War: maze themes for the Indian campaigns — the dusty plains of the north (mud walls and thorn scrub),
   the Deccan (granite boulders on black soil) and the monsoon (wet lanes between green groves). */

/* ---------- plains: dirt lanes between mud walls topped with thorn scrub ---------- */
THEMES.plains = {
  name: 'Plains of Hindustan', grass: 'dry',
  floor(c, x, y, T, q, r) { c.fillStyle = W.grassPattern(c, 1, 'lane'); c.fillRect(x, y, T, T); },
  block(c, x, y, T, h, nb, dpr, seed) {
    const [n, e, s, w] = nb.split('').map((k) => k === '1');
    const x0 = w ? x - 1 : x + T * 0.05, x1 = e ? x + T + 1 : x + T * 0.95, y0 = (n ? y - 1 : y + T * 0.05) - h, y1 = y + T - h;
    const lw = Math.max(1.2, T * 0.045), R = rng(seed + 11);
    if (!s) { c.fillStyle = '#a8784a'; c.fillRect(x0, y1, x1 - x0, h); c.fillStyle = 'rgba(70,40,15,0.3)'; c.fillRect(x0, y1 + h * 0.5, x1 - x0, h * 0.5); }
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#dcb884'); g.addColorStop(1, '#c49a62'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 5; i++) { c.beginPath(); ell(c, x0 + (x1 - x0) * R(), y0 + (y1 - y0) * R(), T * 0.08, T * 0.04); c.fill(); }
    c.strokeStyle = INK; c.lineWidth = lw; c.beginPath();
    if (!n) { c.moveTo(x0, y0); c.lineTo(x1, y0); } if (!w) { c.moveTo(x0, y0); c.lineTo(x0, s ? y1 : y1 + h); } if (!e) { c.moveTo(x1, y0); c.lineTo(x1, s ? y1 : y1 + h); } if (!s) { c.moveTo(x0, y1 + h); c.lineTo(x1, y1 + h); c.moveTo(x0, y1); c.lineTo(x1, y1); }
    c.stroke();
    // thorn scrub along the top of the wall
    if (R() < 0.55) { const bx = x0 + (x1 - x0) * (0.25 + R() * 0.5), by = y0 + (y1 - y0) * 0.45, br = T * 0.2; c.beginPath(); circ(c, bx, by, br); circ(c, bx + br * 0.8, by + br * 0.2, br * 0.7); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#6f8a3a'; c.fill(); c.fillStyle = '#9ab44e'; c.beginPath(); circ(c, bx - br * 0.3, by - br * 0.3, br * 0.4); c.fill(); }
  },
  deco(c, x, y, T, kind, t) {
    if (kind === 'well') { c.beginPath(); ell(c, x, y - T * 0.08, T * 0.3, T * 0.14); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#c49a62'; c.fill(); c.beginPath(); ell(c, x, y - T * 0.12, T * 0.2, T * 0.08); c.fillStyle = '#4a7f9a'; c.fill(); }
    if (kind === 'hay') THEMES.countryside.deco(c, x, y, T, 'hay', t);
  },
};

/* ---------- Deccan: black-soil tracks between ridges of granite boulders ---------- */
THEMES.deccan = {
  name: 'The Deccan', grass: 'black',
  floor(c, x, y, T, q, r) { c.fillStyle = W.grassPattern(c, 1, 'lane'); c.fillRect(x, y, T, T); c.fillStyle = 'rgba(70,50,30,0.16)'; c.fillRect(x, y, T, T); },
  block(c, x, y, T, h, nb, dpr, seed) {
    const [n, e, s, w] = nb.split('').map((k) => k === '1'), R = rng(seed * 7 + 3), lw = Math.max(1.2, T * 0.045);
    const rocks = [[0.28, 0.66, 0.3], [0.72, 0.64, 0.28], [0.5, 0.36, 0.3]];
    if (e) rocks.push([0.98, 0.5, 0.24]); if (s) rocks.push([0.5, 0.96, 0.25]); if (w) rocks.push([0.02, 0.52, 0.22]); if (n) rocks.push([0.52, 0.06, 0.22]);
    rocks.sort((a, b) => a[1] - b[1]);
    c.fillStyle = 'rgba(30,20,10,0.25)'; c.beginPath(); ell(c, x + T * 0.55, y + T * 0.86, T * 0.5, T * 0.16); c.fill();
    for (const [u, v, rad] of rocks) {
      const cx = x + T * u + (R() - 0.5) * T * 0.06, cy = y + T * v - h * 0.6, rx = T * rad * (0.9 + R() * 0.2), ry = rx * 0.82;
      c.beginPath(); ell(c, cx, cy, rx, ry, (R() - 0.5) * 0.3); c.lineWidth = lw; c.strokeStyle = INK; c.stroke();
      c.fillStyle = mix('#c7b08e', '#a8927a', R()); c.fill();
      c.save(); c.clip(); c.fillStyle = 'rgba(40,30,20,0.22)'; c.beginPath(); ell(c, cx + rx * 0.35, cy + ry * 0.45, rx, ry); c.fill(); c.fillStyle = 'rgba(255,248,230,0.35)'; c.beginPath(); ell(c, cx - rx * 0.3, cy - ry * 0.45, rx * 0.42, ry * 0.26); c.fill(); c.restore();
    }
  },
  deco(c, x, y, T, kind, t) {
    if (kind === 'rocks') { for (const [dx, dy, r] of [[-0.18, 0, 0.16], [0.14, 0.02, 0.12], [0, -0.12, 0.1]]) { c.beginPath(); ell(c, x + dx * T, y + dy * T - T * 0.08, r * T, r * T * 0.8); c.lineWidth = Math.max(1, T * 0.035); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#bca789'; c.fill(); } }
  },
};

/* ---------- monsoon: wet lanes and puddles between green groves ---------- */
THEMES.monsoon = {
  name: 'The monsoon', grass: 'g',
  floor(c, x, y, T, q, r) {
    c.fillStyle = W.grassPattern(c, 1, 'lane'); c.fillRect(x, y, T, T);
    c.fillStyle = 'rgba(60,40,22,0.2)'; c.fillRect(x, y, T, T);
    const R = tRand(q, r, 5);
    if (R() < 0.22) { const px = x + T * (0.25 + R() * 0.5), py = y + T * (0.3 + R() * 0.4), rx = T * (0.14 + R() * 0.12); c.fillStyle = 'rgba(70,110,130,0.55)'; c.beginPath(); ell(c, px, py, rx, rx * 0.45); c.fill(); c.fillStyle = 'rgba(220,240,250,0.55)'; c.beginPath(); ell(c, px - rx * 0.3, py - rx * 0.12, rx * 0.4, rx * 0.1); c.fill(); }
  },
  block(c, x, y, T, h, nb, dpr, seed) { THEMES.countryside.block(c, x, y, T, h, nb, dpr, seed); },
  deco(c, x, y, T, kind, t) {
    if (kind === 'puddle') { c.fillStyle = 'rgba(70,110,130,0.6)'; c.beginPath(); ell(c, x, y - T * 0.1, T * 0.34, T * 0.14); c.fill(); c.strokeStyle = 'rgba(230,245,255,0.7)'; c.lineWidth = 1; const k = (t * 0.8) % 1; c.beginPath(); ell(c, x + T * 0.08, y - T * 0.1, T * 0.1 * k + 1, T * 0.04 * k + 0.5); c.stroke(); }
  },
};

/* ===== src/art/20-icons.js ===== */
/* Roll to War: icons (sticker style, ink outline) */
const ICON = (RTW.icon = {});

// stroke-then-fill helper for current path
function stk(c, fill, lw) {
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
  c.fillStyle = fill; c.fill();
}

ICON.shield = function (c, x, y, s, col = PAL.armor) {
  // heater shield, s = height
  const w = s * 0.82, h = s;
  const path = () => {
    c.beginPath();
    c.moveTo(x - w / 2, y - h / 2);
    c.quadraticCurveTo(x, y - h / 2 - h * 0.08, x + w / 2, y - h / 2);
    c.bezierCurveTo(x + w / 2, y + h * 0.1, x + w * 0.3, y + h * 0.36, x, y + h / 2);
    c.bezierCurveTo(x - w * 0.3, y + h * 0.36, x - w / 2, y + h * 0.1, x - w / 2, y - h / 2);
    c.closePath();
  };
  path(); stk(c, '#dfe7ef', s * 0.05);
  c.save(); path(); c.clip();
  // inner field
  c.beginPath();
  const iw = w * 0.74, ih = h * 0.8, iy = y + h * 0.02;
  c.moveTo(x - iw / 2, iy - ih / 2); c.quadraticCurveTo(x, iy - ih / 2 - ih * 0.08, x + iw / 2, iy - ih / 2);
  c.bezierCurveTo(x + iw / 2, iy + ih * 0.1, x + iw * 0.3, iy + ih * 0.36, x, iy + ih / 2);
  c.bezierCurveTo(x - iw * 0.3, iy + ih * 0.36, x - iw / 2, iy + ih * 0.1, x - iw / 2, iy - ih / 2);
  c.closePath();
  const gr = c.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
  gr.addColorStop(0, shade(col, 0.25)); gr.addColorStop(1, shade(col, -0.25));
  c.fillStyle = gr; c.fill();
  // cross emblem
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.fillRect(x - w * 0.06, y - h * 0.3, w * 0.12, h * 0.56);
  c.fillRect(x - w * 0.24, y - h * 0.12, w * 0.48, h * 0.12);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - w / 2, y - h / 2, w * 0.18, h);
  c.restore();
};

ICON.boot = function (c, x, y, s, col = PAL.speed) {
  // winged boot, s = height, facing right
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k);
  // wing (behind)
  const wing = () => {
    c.beginPath();
    c.moveTo(-18, -20);
    c.quadraticCurveTo(-52, -52, -56, -30); c.quadraticCurveTo(-44, -28, -40, -22);
    c.quadraticCurveTo(-58, -20, -54, -4); c.quadraticCurveTo(-40, -10, -32, -8);
    c.quadraticCurveTo(-46, 4, -36, 12); c.quadraticCurveTo(-26, 0, -16, -2);
    c.closePath();
  };
  wing(); stk(c, '#fff8e6', 4.5);
  c.strokeStyle = 'rgba(160,120,40,0.55)'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(-22, -16); c.quadraticCurveTo(-38, -30, -48, -34); c.moveTo(-22, -10); c.quadraticCurveTo(-38, -14, -48, -12); c.moveTo(-22, -5); c.quadraticCurveTo(-32, 0, -38, 4); c.stroke();
  // boot
  const boot = () => {
    c.beginPath();
    c.moveTo(-16, -44); c.lineTo(10, -44);
    c.lineTo(12, -8); c.quadraticCurveTo(30, -6, 40, 4); c.quadraticCurveTo(46, 12, 40, 18);
    c.lineTo(-18, 18); c.quadraticCurveTo(-22, 10, -18, 0); c.closePath();
  };
  boot(); stk(c, col, 4.5);
  c.save(); boot(); c.clip();
  c.fillStyle = shade(col, -0.28); c.fillRect(-30, 8, 90, 14);
  c.fillStyle = shade(col, 0.35); c.fillRect(-14, -40, 7, 44);
  c.fillStyle = shade(col, -0.2); c.fillRect(-20, -46, 36, 9);
  c.restore();
  c.restore();
};

ICON.fist = function (c, x, y, s, col = PAL.attack) {
  // clenched fist (front), s = height
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k);
  const lw = 4.5;
  // wrist
  c.beginPath(); rr(c, -22, 18, 40, 30, 8); stk(c, shade(col, -0.18), lw);
  c.beginPath(); rr(c, -24, 16, 44, 10, 4); stk(c, PAL.gold, lw);
  // palm/back
  c.beginPath(); rr(c, -32, -22, 62, 46, 16); stk(c, col, lw);
  // fingers
  for (let i = 0; i < 4; i++) {
    c.beginPath(); rr(c, -32 + i * 15.5, -36, 16, 30, 8); stk(c, shade(col, 0.08), lw);
  }
  // thumb
  c.beginPath(); c.moveTo(-34, -2); c.quadraticCurveTo(-36, 16, -14, 14); c.quadraticCurveTo(4, 12, 8, 4); c.quadraticCurveTo(4, -6, -12, -2); c.closePath(); stk(c, shade(col, 0.14), lw);
  // highlights
  c.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 4; i++) { c.beginPath(); rr(c, -28 + i * 15.5, -32, 5, 12, 2.5); c.fill(); }
  c.restore();
};

ICON.helmet = function (c, x, y, s, col = PAL.prod) {
  // soldier bust with kettle hat, s = height
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k);
  const lw = 5;
  c.beginPath(); c.moveTo(-40, 50); c.quadraticCurveTo(-40, 14, 0, 12); c.quadraticCurveTo(40, 14, 40, 50); c.closePath(); stk(c, col, lw);
  c.beginPath(); circ(c, 0, -6, 24); stk(c, '#f6d6b5', lw);
  c.beginPath(); c.moveTo(-26, -12); c.bezierCurveTo(-26, -48, 26, -48, 26, -12); c.closePath(); stk(c, shade(col, -0.05), lw);
  c.beginPath(); ell(c, 0, -12, 40, 8); stk(c, shade(col, -0.25), lw);
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, -8, -30, 7, 4, -0.4); c.fill();
  c.fillStyle = INK; c.beginPath(); circ(c, -8, -2, 3.2); circ(c, 8, -2, 3.2); c.fill();
  c.restore();
};

ICON.chevrons = function (c, x, y, s, n = 1, col = PAL.move) {
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k);
  const gap = 30, off = -((n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    const ox = off + i * gap;
    c.beginPath(); c.moveTo(ox - 26, -38); c.lineTo(ox + 4, -38); c.lineTo(ox + 34, 0); c.lineTo(ox + 4, 38); c.lineTo(ox - 26, 38); c.lineTo(ox + 4, 0); c.closePath();
    stk(c, i % 2 ? shade(col, 0.12) : col, 5);
  }
  c.restore();
};

ICON.crew = function (c, x, y, s, type, col = '#fff8e6') {
  const k = s / 100;
  c.save(); c.translate(x, y); c.scale(k, k);
  const lw = 5;
  if (type === 'piker') {
    c.beginPath(); cap(c, -34, 38, 18, -14, 9); stk(c, PAL.wood, lw);
    c.save(); c.translate(18, -14); c.rotate(-Math.PI / 4);
    c.beginPath(); c.moveTo(-4, -9); c.quadraticCurveTo(22, -14, 46, 0); c.quadraticCurveTo(22, 14, -4, 9); c.closePath(); stk(c, col, lw);
    c.restore();
  } else if (type === 'crossbow') {
    c.beginPath(); rr(c, -10, -30, 20, 72, 6); stk(c, PAL.wood, lw);
    c.beginPath(); c.moveTo(-46, -8); c.quadraticCurveTo(0, -46, 46, -8); c.lineTo(46, 2); c.quadraticCurveTo(0, -34, -46, 2); c.closePath(); stk(c, col, lw);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, -2); c.lineTo(0, 16); c.lineTo(44, -2); c.stroke();
  } else if (type === 'knight') {
    c.beginPath();
    c.moveTo(-30, 44); c.lineTo(-26, 10); c.quadraticCurveTo(-30, -20, -8, -38); c.lineTo(-4, -50); c.lineTo(6, -38);
    c.quadraticCurveTo(28, -30, 40, 0); c.quadraticCurveTo(44, 12, 30, 14); c.quadraticCurveTo(14, 8, 6, 2);
    c.quadraticCurveTo(0, 24, 14, 44); c.closePath();
    stk(c, col, lw);
    c.fillStyle = INK; c.beginPath(); circ(c, 8, -18, 4.5); c.fill();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -36); c.quadraticCurveTo(-24, -14, -20, 20); c.stroke();
  } else if (type === 'bill') {
    // billhook: long haft, hooked blade with a top spike and a back spur
    c.beginPath(); cap(c, -32, 40, 14, -14, 9); stk(c, PAL.wood, lw);
    c.save(); c.translate(14, -14); c.rotate(-Math.PI / 4);
    c.beginPath(); c.moveTo(-6, -8); c.lineTo(22, -8); c.lineTo(46, -2); c.lineTo(24, 2); c.quadraticCurveTo(30, 10, 22, 20); c.quadraticCurveTo(14, 12, 6, 10); c.lineTo(-6, 8); c.closePath(); stk(c, col, lw);
    c.beginPath(); c.moveTo(0, -8); c.lineTo(4, -22); c.lineTo(10, -8); c.closePath(); stk(c, col, lw);
    c.restore();
  } else if (type === 'longbow') {
    // tall stave with string and a nocked arrow
    c.beginPath(); c.moveTo(-8, -52); c.quadraticCurveTo(34, 0, -8, 52); c.lineTo(-2, 50); c.quadraticCurveTo(26, 0, -2, -50); c.closePath(); stk(c, PAL.wood, lw);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, -50); c.lineTo(-18, 0); c.lineTo(-6, 50); c.stroke();
    c.beginPath(); cap(c, -20, 0, 36, 0, 6); stk(c, PAL.woodL, lw * 0.8);
    c.beginPath(); c.moveTo(36, -9); c.lineTo(52, 0); c.lineTo(36, 9); c.closePath(); stk(c, col, lw * 0.8);
    c.beginPath(); c.moveTo(-18, 0); c.lineTo(-30, -9); c.lineTo(-24, 0); c.lineTo(-30, 9); c.closePath(); stk(c, '#e8e0cc', lw * 0.7);
  } else if (type === 'bow') {
    // composite recurve bow with a nocked arrow (horse archers)
    c.beginPath(); c.moveTo(-6, -50); c.quadraticCurveTo(-20, -58, -14, -40); c.quadraticCurveTo(26, -22, 26, 0); c.quadraticCurveTo(26, 22, -14, 40); c.quadraticCurveTo(-20, 58, -6, 50); c.lineTo(-10, 44); c.quadraticCurveTo(18, 22, 18, 0); c.quadraticCurveTo(18, -22, -10, -44); c.closePath(); stk(c, '#8a5a30', lw);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -44); c.lineTo(-24, 0); c.lineTo(-12, 44); c.stroke();
    c.beginPath(); cap(c, -26, 0, 40, 0, 6); stk(c, PAL.woodL, lw * 0.8);
    c.beginPath(); c.moveTo(40, -9); c.lineTo(56, 0); c.lineTo(40, 9); c.closePath(); stk(c, col, lw * 0.8);
    c.beginPath(); c.moveTo(-24, 0); c.lineTo(-36, -9); c.lineTo(-30, 0); c.lineTo(-36, 9); c.closePath(); stk(c, '#e8e0cc', lw * 0.7);
  } else if (type === 'camel') {
    // camel head and neck in profile (Mamelukes)
    c.beginPath();
    c.moveTo(-34, 50); c.quadraticCurveTo(-38, 10, -18, -14); c.quadraticCurveTo(-8, -30, 4, -40); c.quadraticCurveTo(14, -50, 28, -46);
    c.quadraticCurveTo(46, -42, 50, -30); c.quadraticCurveTo(52, -20, 42, -18); c.quadraticCurveTo(28, -20, 18, -22); c.quadraticCurveTo(6, -6, 4, 14); c.quadraticCurveTo(4, 34, 12, 50); c.closePath();
    stk(c, col, lw);
    c.beginPath(); c.moveTo(10, -44); c.quadraticCurveTo(8, -56, 16, -56); c.quadraticCurveTo(20, -50, 16, -45); c.closePath(); stk(c, col, lw * 0.8);
    c.fillStyle = INK; c.beginPath(); circ(c, 26, -36, 4.5); c.fill();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(44, -24); c.quadraticCurveTo(38, -22, 34, -24); c.stroke();
    c.beginPath(); c.moveTo(-26, 30); c.quadraticCurveTo(-16, 20, -4, 26); c.moveTo(-28, 10); c.quadraticCurveTo(-16, 2, -6, 8); c.stroke();
    c.beginPath(); rr(c, 20, -24, 14, 8, 3); stk(c, '#b8312a', 2.5);
  } else if (type === 'scimitar') {
    // curved sword (Ayyubid swordsmen)
    c.save(); c.rotate(-Math.PI / 4);
    c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(-10, -44, 6, -72); c.quadraticCurveTo(10, -60, 12, -48); c.quadraticCurveTo(10, -30, 6, -16); c.closePath(); stk(c, col, lw);
    c.beginPath(); c.moveTo(-24, -20); c.quadraticCurveTo(0, -12, 24, -20); c.lineTo(24, -12); c.quadraticCurveTo(0, -4, -24, -12); c.closePath(); stk(c, PAL.gold, lw);
    c.beginPath(); rr(c, -5, -8, 10, 30, 4); stk(c, PAL.leather, lw);
    c.beginPath(); circ(c, 0, 27, 7); stk(c, PAL.gold, lw);
    c.restore();
  } else if (type === 'sword') {
    c.save(); c.rotate(-Math.PI / 4);
    c.beginPath(); c.moveTo(-7, -18); c.lineTo(-6, -58); c.lineTo(0, -70); c.lineTo(6, -58); c.lineTo(7, -18); c.closePath(); stk(c, col, lw);
    c.beginPath(); rr(c, -26, -20, 52, 11, 5); stk(c, PAL.gold, lw);
    c.beginPath(); rr(c, -6, -10, 12, 34, 4); stk(c, PAL.leather, lw);
    c.beginPath(); circ(c, 0, 30, 9); stk(c, PAL.gold, lw);
    c.restore();
  }
  c.restore();
};

ICON.star = function (c, x, y, r, filled = true, col = PAL.gold) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.46 : r;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath();
  c.lineJoin = 'round'; c.lineWidth = r * 0.22; c.strokeStyle = INK; c.stroke();
  if (filled) {
    const g = c.createLinearGradient(x, y - r, x, y + r); g.addColorStop(0, shade(col, 0.4)); g.addColorStop(1, shade(col, -0.15));
    c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, x - r * 0.18, y - r * 0.3, r * 0.2, r * 0.12, -0.5); c.fill();
  } else { c.fillStyle = 'rgba(40,28,18,0.55)'; c.fill(); }
};

ICON.lock = function (c, x, y, s) {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); c.moveTo(-22, -4); c.lineTo(-22, -22); c.arc(0, -22, 22, Math.PI, 0); c.lineTo(22, -4);
  c.lineWidth = 22; c.strokeStyle = INK; c.stroke(); c.lineWidth = 11; c.strokeStyle = PAL.steel; c.stroke();
  c.beginPath(); rr(c, -34, -6, 68, 50, 10); stk(c, PAL.gold, 5);
  c.fillStyle = INK; c.beginPath(); circ(c, 0, 12, 7); c.fill(); c.fillRect(-3, 12, 6, 16);
  c.restore();
};

ICON.pause = function (c, x, y, s, col = '#fff8e6') {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); rr(c, -30, -36, 22, 72, 6); rr(c, 8, -36, 22, 72, 6); stk(c, col, 5); c.restore();
};
ICON.sound = function (c, x, y, s, on = true, col = '#fff8e6') {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath(); c.moveTo(-40, -14); c.lineTo(-20, -14); c.lineTo(4, -36); c.lineTo(4, 36); c.lineTo(-20, 14); c.lineTo(-40, 14); c.closePath(); stk(c, col, 5);
  c.lineCap = 'round';
  if (on) {
    for (const r of [18, 34]) { c.beginPath(); c.arc(8, 0, r, -0.8, 0.8); c.lineWidth = 16; c.strokeStyle = INK; c.stroke(); c.lineWidth = 7; c.strokeStyle = col; c.stroke(); }
  } else {
    c.beginPath(); c.moveTo(18, -18); c.lineTo(44, 18); c.moveTo(44, -18); c.lineTo(18, 18); c.lineWidth = 16; c.strokeStyle = INK; c.stroke(); c.lineWidth = 7; c.strokeStyle = col; c.stroke();
  }
  c.restore();
};
ICON.gear = function (c, x, y, s, col = '#fff8e6') {
  const k = s / 100; c.save(); c.translate(x, y); c.scale(k, k);
  c.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU, r = i % 2 ? 30 : 42;
    const a2 = a + TAU / 32;
    i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    c.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
  }
  c.closePath(); stk(c, col, 5);
  c.beginPath(); circ(c, 0, 0, 13); c.fillStyle = INK; c.fill();
  c.restore();
};
ICON.stickDot = stk;

/* ===== src/art/21-story.js ===== */
/* Roll to War: story art.
   1) shared screen helpers used by the campaign screens and the battle HUD (header, chips, hero ring and badge, callouts, twist panel)
   2) story pictures: RTW.storyPic draws a map, a portrait with banners, a named custom scene, or a composed scene
      (sky, far hills, ground, props and troops, weather), in the sticker style of the game
   3) the campaign medal */

/* ================= shared screen helpers ================= */
function cxBackdrop(c, Wd, Ht, st, key) {
  // sunset valley backdrop shared by the menu screens (cached in st)
  if (!st[key]) {
    const dpr = st.dpr || 1, cv = mkCanvas(Wd * dpr, Ht * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
    const sky = g.createLinearGradient(0, 0, 0, Ht * 0.6); sky.addColorStop(0, '#1d3c8c'); sky.addColorStop(0.55, '#e4765a'); sky.addColorStop(1, '#ffd47a');
    g.fillStyle = sky; g.fillRect(0, 0, Wd, Ht);
    const sun = g.createRadialGradient(Wd * 0.5, Ht * 0.5, 5, Wd * 0.5, Ht * 0.5, 190); sun.addColorStop(0, 'rgba(255,245,200,0.95)'); sun.addColorStop(0.25, 'rgba(255,220,140,0.5)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = sun; g.fillRect(0, 0, Wd, Ht);
    const layer = (col, base, amp, seed, step) => { const R = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, base); for (let x = 0; x <= Wd + step; x += step) g.lineTo(x, base - R() * amp); g.lineTo(Wd, Ht); g.closePath(); g.fill(); };
    layer('#9676bd', Ht * 0.52, 60, 3, 36); layer('#6a7ebe', Ht * 0.56, 36, 5, 28);
    if (/Sea$/.test(key)) {   // the naval campaign: open sea under the sunset, a wooded island or two
      const sg = g.createLinearGradient(0, Ht * 0.58, 0, Ht); sg.addColorStop(0, '#e2a27a'); sg.addColorStop(0.08, '#4f8fb0'); sg.addColorStop(1, '#2f6f95'); g.fillStyle = sg; g.fillRect(0, Ht * 0.58, Wd, Ht);
      g.fillStyle = 'rgba(255,236,190,0.5)'; for (let i = 0; i < 14; i++) { const y = Ht * 0.6 + i * 9, w = 60 - i * 3.5; g.fillRect(Wd * 0.5 - w, y, w * 2, 2); }
      const R = rng(12); g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) { const x = R() * Wd, y = Ht * 0.62 + R() * Ht * 0.38, w = 8 + R() * 12; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 4, y - 3, x + w / 2, y); g.quadraticCurveTo(x + w * 0.75, y + 3, x + w, y); g.stroke(); }
      for (const [cx, cy, w, h] of [[Wd * 0.12, Ht * 0.6, 90, 26], [Wd * 0.9, Ht * 0.61, 110, 30]]) { g.fillStyle = '#4d7f4a'; g.beginPath(); g.moveTo(cx - w / 2, cy); g.quadraticCurveTo(cx, cy - h * 2, cx + w / 2, cy); g.closePath(); g.fill(); for (let i = 0; i < 3; i++) W.pine(g, cx - w * 0.25 + i * w * 0.25, cy - h * 0.55 + (i % 2) * 4, 10, i + cx); }
      st[key] = cv;
      return void c.drawImage(st[key], 0, 0, Wd, Ht);
    }
    const hill = (col, y, a) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, y); g.bezierCurveTo(Wd * 0.3, y - a, Wd * 0.6, y + a * 0.6, Wd, y - a * 0.4); g.lineTo(Wd, Ht); g.closePath(); g.fill(); };
    hill('#4f9e4a', Ht * 0.6, 26);
    for (let i = 0; i < 12; i++) W.pine(g, i * 36 + (i % 2) * 10, Ht * 0.622 + (i % 3) * 4, 13 + (i % 3) * 2, i);
    hill(PAL.grass, Ht * 0.68, 34);
    g.save(); g.globalAlpha = 0.6; g.fillStyle = W.grassPattern(g, 1); g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, Ht * 0.68); g.bezierCurveTo(Wd * 0.3, Ht * 0.68 - 34, Wd * 0.6, Ht * 0.68 + 20, Wd, Ht * 0.68 - 14); g.lineTo(Wd, Ht); g.closePath(); g.fill(); g.restore();
    st[key] = cv;
  }
  c.drawImage(st[key], 0, 0, Wd, Ht);
}
function cxHeader(c, Wd, title, sub, o = {}) {
  UI.woodFill(c, 0, 0, Wd, 84, 21, PAL.wood3);
  c.fillStyle = INK; c.fillRect(0, 81, Wd, 3.5); c.fillStyle = PAL.gold; c.fillRect(0, 81.8, Wd, 2);
  if (o.back !== false) {
    const dy = o.pressed ? 2 : 0;
    UI.roundBtn(c, 30, 40 + dy, 18, null);
    c.save(); c.translate(30, 40 + dy); c.beginPath(); c.moveTo(4, -8); c.lineTo(-5, 0); c.lineTo(4, 8); c.lineWidth = 4.5; c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#fff3d6'; c.stroke(); c.restore();
  }
  text(c, title, Wd / 2 - (o.stars != null ? 12 : 0), sub ? 32 : 42, { size: o.size || 21, font: F.head, weight: 900, grad: ['#fff6cf', '#ffd76a', '#d7901f'], stroke: INK, strokeW: 5, letter: 1.5, maxW: Wd - (o.stars != null ? 170 : 120) });
  if (sub) text(c, sub, Wd / 2, 58, { size: 12, weight: 600, fill: '#f0dfbd', maxW: Wd - 120 });
  if (o.stars != null) {
    c.beginPath(); rr(c, Wd - 78, 24, 66, 32, 16); c.fillStyle = 'rgba(15,8,3,0.55)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,220,150,0.3)'; c.stroke();
    ICON.star(c, Wd - 60, 40, 10, true); text(c, o.stars, Wd - 36, 41, { size: 13, weight: 700, fill: '#fff3d6', maxW: 36 });
  }
}
function cxChip(c, x, y, label, col, o = {}) {
  const w = textWidth(c, label, o.size || 11.5, F.body, 700) + 18;
  c.beginPath(); rr(c, x, y, w, o.h || 22, 11); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  text(c, label, x + w / 2, y + (o.h || 22) / 2 + 0.5, { size: o.size || 11.5, weight: 700, fill: o.fill || '#fff' });
  return w;
}
function wrapText(c, s, maxW, size, font, weight) {
  const out = [];
  for (const para of String(s).split('\n')) {
    const words = para.split(' '); let cur = '';
    for (const wd of words) { const tt = cur ? cur + ' ' + wd : wd; if (textWidth(c, tt, size, font, weight) > maxW && cur) { out.push(cur); cur = wd; } else cur = tt; }
    out.push(cur);
  }
  return out;
}
function heroRing(c, x, y, r, team, t) {
  const col = team === 'blue' ? PAL.gold : '#ff6a5a';
  c.save();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.45 + 0.15 * Math.sin(t * 3); c.drawImage(AMB.glow(team === 'blue' ? '#ffd35a' : '#ff5a4a'), x - r * 1.3, y - r * 0.62, r * 2.6, r * 1.24); c.restore();
  for (let i = 0; i < 2; i++) { const k = ((t * 0.7 + i * 0.5) % 1); c.globalAlpha = (1 - k) * 0.6; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); ell(c, x, y, r * (0.7 + k * 0.6), r * 0.34 * (0.7 + k * 0.6)); c.stroke(); }
  c.globalAlpha = 0.28; c.fillStyle = col; c.beginPath(); ell(c, x, y, r, r * 0.34); c.fill();
  c.restore();
}
function heroBadge(c, x, y, team, kind) {
  c.save();
  c.beginPath(); c.moveTo(x, y + 9); c.lineTo(x - 7, y); c.lineTo(x - 11, y - 12); c.lineTo(x + 11, y - 12); c.lineTo(x + 7, y); c.closePath();
  c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = team === 'blue' ? TEAMS.blue.main : TEAMS.red.main; c.fill();
  if (kind === 'crown') { c.beginPath(); c.moveTo(x - 6, y - 2); c.lineTo(x - 6, y - 8); c.lineTo(x - 3, y - 5); c.lineTo(x, y - 10); c.lineTo(x + 3, y - 5); c.lineTo(x + 6, y - 8); c.lineTo(x + 6, y - 2); c.closePath(); c.fillStyle = PAL.gold; c.fill(); }
  else { c.beginPath(); circ(c, x, y - 5, 4.5); c.fillStyle = '#fff3d6'; c.fill(); c.fillStyle = INK; c.fillRect(x - 2.5, y - 6, 1.6, 1.8); c.fillRect(x + 1, y - 6, 1.6, 1.8); }
  c.restore();
}
function callout(c, x, y, str, col) {
  c.save(); c.font = `900 12px ${F.head}`; const w = c.measureText(str).width + 20;
  c.beginPath(); rr(c, x - w / 2, y - 14, w, 26, 13); c.moveTo(x - 6, y + 12); c.lineTo(x, y + 20); c.lineTo(x + 6, y + 12);
  c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = col || '#fff3d0'; c.fill();
  text(c, str, x, y - 0.5, { size: 12, font: F.head, weight: 900, fill: '#3a2412' });
  c.restore();
}
function cxTwist(c, Wd, y, title, sub, col) {
  c.save();
  c.fillStyle = 'rgba(10,6,3,0.35)'; c.beginPath(); rr(c, 40, y + 3, Wd - 80, 40, 12); c.fill();
  c.beginPath(); rr(c, 40, y, Wd - 80, 40, 12); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, y, 0, y + 40); g.addColorStop(0, '#fff3d0'); g.addColorStop(1, '#e8cf94'); c.fillStyle = g; c.fill();
  c.beginPath(); rr(c, 46, y + 6, 58, 28, 8); c.fillStyle = col || '#8a2a20'; c.fill();
  text(c, 'TWIST', 75, y + 20.5, { size: 11, font: F.head, weight: 900, fill: '#fff', letter: 1 });
  text(c, title, 114, y + 14, { size: 13, font: F.head, weight: 900, fill: '#3a2412', align: 'left', maxW: Wd - 170 });
  text(c, sub, 114, y + 29, { size: 10.5, weight: 600, fill: '#6b4a2b', align: 'left', maxW: Wd - 170 });
  c.restore();
}
function stake(c, x, y, a, s = 1) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.beginPath(); c.moveTo(-2.2, 0); c.lineTo(-1.5, -15); c.lineTo(0, -20); c.lineTo(1.5, -15); c.lineTo(2.2, 0); c.closePath();
  c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#c99257'; c.fill(); c.fillStyle = '#f0d8a8'; c.fillRect(-0.8, -17, 1.2, 4);
  c.restore();
}
// rain-soaked ploughed field between two woods (Agincourt); cached in st
function muddyField(c, Wd, y0, y1, st) {
  if (!st.mud) {
    const dpr = st.dpr || 1, H = y1 - y0, cv = mkCanvas(Wd * dpr, H * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
    paintMud(g, Wd, H, 91);
    st.mud = cv;
  }
  c.drawImage(st.mud, 0, y0, Wd, y1 - y0);
}
function paintMud(g, Wd, H, seed) {
  g.fillStyle = W.grassPattern(g, 1); g.fillRect(0, 0, Wd, H);
  const fg = g.createLinearGradient(0, 0, Wd, 0); fg.addColorStop(0, 'rgba(120,90,55,0)'); fg.addColorStop(0.15, 'rgba(120,90,55,0.85)'); fg.addColorStop(0.85, 'rgba(120,90,55,0.85)'); fg.addColorStop(1, 'rgba(120,90,55,0)');
  g.fillStyle = fg; g.fillRect(0, 0, Wd, H);
  g.strokeStyle = 'rgba(70,50,28,0.45)'; g.lineWidth = 2; for (let yy = 8; yy < H; yy += 13) { g.beginPath(); g.moveTo(40, yy); for (let x = 40; x < Wd - 40; x += 20) g.lineTo(x + 20, yy + Math.sin(x * 0.05 + yy) * 1.6); g.stroke(); }
  const R = rng(seed);
  for (let i = 0; i < 26 * H / 572; i++) { const x = 60 + R() * (Wd - 120), y = 40 + R() * (H - 80), rx = 10 + R() * 20; g.fillStyle = 'rgba(70,48,26,0.7)'; g.beginPath(); ell(g, x, y, rx, rx * 0.4); g.fill(); g.fillStyle = 'rgba(160,190,200,0.35)'; g.beginPath(); ell(g, x - rx * 0.2, y - rx * 0.08, rx * 0.5, rx * 0.14); g.fill(); }
}

/* ================= story pictures ================= */
const STORY = (RTW.STORY = {});
const SKIES = {
  day: { stops: ['#3f8fe0', '#86c3f0', '#dff1f2'], sun: [0.78, 0.2, '255,250,220'], clouds: 'white', rays: 0.045 },
  dusk: { stops: ['#2e3a78', '#d06a58', '#ffc47e'], sun: [0.3, 0.52, '255,214,150'], clouds: 'pink', rays: 0.06 },
  dawn: { stops: ['#4466b0', '#ee9f86', '#ffe0a8'], sun: [0.7, 0.58, '255,236,190'], clouds: 'pink', rays: 0.05 },
  night: { stops: ['#081030', '#1a2a5e', '#3a4a80'], moon: [0.8, 0.2], stars: true },
  storm: { stops: ['#3f4a66', '#76808f', '#a9a99c'], clouds: 'dark' },
  grey: { stops: ['#76849a', '#b4bcc0', '#dcd8c8'], clouds: 'grey' },
};
// a fluffy sticker cloud: a lit top, a soft shaded belly
function storyCloud(c, cx, cy, cw, kind) {
  const col = { white: ['#ffffff', '#d8e6f2', 0.95], pink: ['#ffe2d2', '#e8a08e', 0.75], dark: ['#6a7288', '#40485c', 0.9], grey: ['#f2f2ee', '#c6ccd0', 0.75] }[kind];
  const blobs = [[-0.45, 0.05, 0.36], [-0.12, -0.18, 0.46], [0.28, -0.08, 0.4], [0.55, 0.08, 0.28], [0.05, 0.1, 0.42]];
  c.save(); c.globalAlpha = col[2];
  c.fillStyle = col[1]; c.beginPath(); for (const [bx, by, br] of blobs) circ(c, cx + bx * cw, cy + by * cw * 0.6 + cw * 0.05, br * cw * 0.55); c.fill();
  c.fillStyle = col[0]; c.beginPath(); for (const [bx, by, br] of blobs) circ(c, cx + bx * cw - cw * 0.02, cy + by * cw * 0.6 - cw * 0.03, br * cw * 0.5); c.fill();
  c.restore();
}
function skyPaint(c, x, y, w, h, kind, t) {
  const S = SKIES[kind] || SKIES.day;
  const g = c.createLinearGradient(0, y, 0, y + h * 0.7);
  S.stops.forEach((col, i) => g.addColorStop(i / (S.stops.length - 1), col));
  c.fillStyle = g; c.fillRect(x, y, w, h);
  if (S.sun) {
    const [fx, fy, rgb] = S.sun, sx = x + w * fx, sy = y + h * fy, gg = c.createRadialGradient(sx, sy, 4, sx, sy, h * 0.6);
    gg.addColorStop(0, `rgba(${rgb},0.95)`); gg.addColorStop(0.16, `rgba(${rgb},0.5)`); gg.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = gg; c.fillRect(x, y, w, h);
    // slow rays fanning from the sun
    if (S.rays) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(${rgb},${S.rays})`;
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + t * 0.04, s = 0.07 + (i % 3) * 0.03, L = h * 1.3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a - s) * L, sy + Math.sin(a - s) * L); c.lineTo(sx + Math.cos(a + s) * L, sy + Math.sin(a + s) * L); c.closePath(); c.fill(); }
      c.restore();
    }
    c.beginPath(); circ(c, sx, sy, h * 0.05); c.fillStyle = `rgba(${rgb},1)`; c.fill();
  }
  if (S.stars) { const R = rng(7); c.fillStyle = '#fff8e0'; for (let i = 0; i < 46; i++) { const sx = x + R() * w, sy = y + R() * h * 0.55, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); c.globalAlpha = 0.35 + 0.5 * tw * R(); c.beginPath(); circ(c, sx, sy, 0.6 + R() * 1.1); c.fill(); } c.globalAlpha = 1; }
  if (S.moon) {
    const mx = x + w * S.moon[0], my = y + h * S.moon[1], r = h * 0.06;
    const gg = c.createRadialGradient(mx, my, r, mx, my, r * 5); gg.addColorStop(0, 'rgba(220,230,255,0.35)'); gg.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = gg; c.fillRect(x, y, w, h);
    c.beginPath(); circ(c, mx, my, r); c.fillStyle = '#f4f0dc'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    c.fillStyle = 'rgba(160,160,140,0.35)'; c.beginPath(); circ(c, mx - r * 0.3, my - r * 0.2, r * 0.25); circ(c, mx + r * 0.35, my + r * 0.3, r * 0.18); c.fill();
  }
  if (S.clouds) {
    for (let i = 0; i < 6; i++) { const cx = x + ((i * 97 + t * (S.clouds === 'dark' ? 9 : 4)) % (w + 120)) - 60, cy = y + h * (0.08 + (i % 3) * 0.07), cw = 46 + (i % 3) * 18; storyCloud(c, cx, cy, cw, S.clouds); }
  }
}
// far jagged ridge, then a smooth near hill; returns the ground line function
function landPaint(c, x, y, w, h, S) {
  const hz = y + h * (S.horizon || 0.56), night = S.sky === 'night', dim = night ? 0.55 : S.sky === 'storm' || S.sky === 'grey' ? 0.18 : 0;
  const tint = (col) => (dim ? mix(col, night ? '#1a2240' : '#6f7684', dim) : col);
  if (S.far !== false) {
    const dry = S.ground === 'sand' || S.ground === 'stone';
    const R = rng(S.seed || 3); c.fillStyle = tint(dry ? '#c4a28a' : S.ground === 'dust' ? '#b9a98c' : S.ground === 'black' ? '#9a8f7e' : S.ground === 'snow' ? '#aebdd6' : '#8196cc'); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, hz - 6);
    const ridge = []; for (let px = 0; px <= w + 30; px += 30) { const ry = hz - 10 - R() * h * 0.1; ridge.push([x + px, ry]); c.lineTo(x + px, ry); } c.lineTo(x + w, y + h); c.closePath(); c.fill();
    // snowy or sunlit caps on the far peaks
    if (!night) { c.fillStyle = dry ? 'rgba(255,236,210,0.35)' : 'rgba(235,242,255,0.55)'; for (let i = 1; i < ridge.length; i++) { const [px, py] = ridge[i], [qx, qy] = ridge[i - 1]; if (py < qy - 4) { c.beginPath(); c.moveTo(px, py); c.lineTo(px - (px - qx) * 0.35, py + (qy - py) * 0.35); c.lineTo(px + 5, py + 5); c.closePath(); c.fill(); } } }
    const hg = c.createLinearGradient(0, hz - h * 0.12, 0, hz + h * 0.04); hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(1, night ? 'rgba(120,140,190,0.18)' : 'rgba(255,248,230,0.4)'); c.fillStyle = hg; c.fillRect(x, hz - h * 0.12, w, h * 0.16);
    c.fillStyle = tint(dry ? '#dcb582' : S.ground === 'dust' ? '#c9b680' : S.ground === 'black' ? '#8f8a6c' : S.ground === 'snow' ? '#dfe7f0' : '#6aaa62'); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, hz); c.bezierCurveTo(x + w * 0.3, hz - h * 0.05, x + w * 0.6, hz + h * 0.03, x + w, hz - h * 0.04); c.lineTo(x + w, y + h); c.closePath(); c.fill();
  }
  // near ground: optional slope rising to the right (or left when negative)
  const sl = S.slope || 0, base = hz + h * 0.05;
  const gy = (px) => base - sl * h * ((px - x) / w - 0.5);
  const path = () => { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, gy(x)); c.bezierCurveTo(x + w * 0.33, gy(x + w * 0.33) - h * 0.02, x + w * 0.66, gy(x + w * 0.66) + h * 0.02, x + w, gy(x + w)); c.lineTo(x + w, y + h); c.closePath(); };
  path(); c.fillStyle = tint(S.ground === 'mud' ? '#8a6a44' : S.ground === 'sand' ? '#e0c38a' : S.ground === 'stone' ? '#c9b48e' : S.ground === 'sea' ? '#4f8fb0' : S.ground === 'snow' ? '#eaf0f6' : S.ground === 'dust' ? '#cfb77c' : S.ground === 'black' ? '#62564a' : PAL.grass); c.fill();
  // the dusty plains of the north and the black soil of the Deccan: bare earth with tufts of dry grass and pebbles
  if (S.ground === 'dust' || S.ground === 'black') {
    const blk = S.ground === 'black', R4 = rng((S.seed || 3) + 17);
    c.save(); path(); c.clip();
    const gg = c.createLinearGradient(0, hz, 0, y + h); gg.addColorStop(0, blk ? 'rgba(150,140,110,0.35)' : 'rgba(170,190,110,0.28)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(x, hz, w, y + h - hz);
    for (let i = 0; i < 70; i++) { const px = x + R4() * w, py = gy(px) + 6 + R4() * (y + h - gy(px)), sz = 3 + R4() * 4; c.strokeStyle = blk ? (i % 3 ? '#b8a466' : '#8a8a4c') : (i % 3 ? '#8a9a4a' : '#b8a060'); c.lineWidth = 1.2; c.beginPath(); c.moveTo(px - sz * 0.6, py); c.lineTo(px - sz * 0.2, py - sz); c.moveTo(px, py); c.lineTo(px + 0.4, py - sz * 1.2); c.moveTo(px + sz * 0.6, py); c.lineTo(px + sz * 0.3, py - sz); c.stroke(); }
    for (let i = 0; i < 26; i++) { const px = x + R4() * w, py = gy(px) + 10 + R4() * (y + h - gy(px) - 10), r = 1.4 + R4() * 2.6; c.fillStyle = blk ? 'rgba(40,34,28,0.55)' : 'rgba(120,90,50,0.35)'; c.beginPath(); ell(c, px, py, r * 1.4, r * 0.8); c.fill(); }
    if (dim) { c.fillStyle = night ? 'rgba(14,20,48,0.5)' : 'rgba(80,86,100,0.2)'; c.fillRect(x, y, w, h); }
    c.restore();
    return gy;
  }
  if (S.ground === 'sand' || S.ground === 'stone') { c.save(); path(); c.clip(); const top = Math.min(gy(x), gy(x + w)) - h * 0.04; RTW.dryGround(c, x, top, w, y + h - top, S.ground, S.seed || 3); if (dim) { c.fillStyle = night ? 'rgba(14,20,48,0.5)' : 'rgba(80,86,100,0.2)'; c.fillRect(x, y, w, h); } c.restore(); }
  else if (S.ground !== 'sea') { c.save(); path(); c.clip(); c.globalAlpha = night ? 0.35 : 0.8; c.fillStyle = S.ground === 'mud' ? 'rgba(0,0,0,0)' : W.grassPattern(c, 1, S.ground === 'snow' ? 'snow' : 'g'); c.fillRect(x, y, w, h); c.globalAlpha = 1;
    if (S.ground === 'mud') { c.strokeStyle = 'rgba(60,40,22,0.5)'; c.lineWidth = 2; for (let yy = gy(x) + 8; yy < y + h; yy += 11) { c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + w / 2, yy - 4, x + w, yy + 2); c.stroke(); } const R2 = rng(5); for (let i = 0; i < 12; i++) { const px = x + R2() * w, py = gy(px) + 14 + R2() * (y + h - gy(px) - 20), rx = 8 + R2() * 16; c.fillStyle = 'rgba(60,42,24,0.7)'; c.beginPath(); ell(c, px, py, rx, rx * 0.35); c.fill(); c.fillStyle = 'rgba(170,196,210,0.4)'; c.beginPath(); ell(c, px - rx * 0.2, py - 1, rx * 0.45, rx * 0.12); c.fill(); } }
    if (dim) { c.fillStyle = night ? 'rgba(14,20,48,0.5)' : 'rgba(80,86,100,0.2)'; c.fillRect(x, y, w, h); }
    c.restore(); }
  else { c.save(); path(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1.4; const R3 = rng(9); for (let i = 0; i < 40; i++) { const px = x + R3() * w, py = gy(px) + 6 + R3() * h * 0.4, q = 6 + R3() * 8, ph = Math.sin(0 + i) * 2; c.beginPath(); c.moveTo(px + ph, py); c.quadraticCurveTo(px + q / 2 + ph, py - 3, px + q + ph, py); c.stroke(); } c.restore(); }
  return gy;
}

/* ---------- props (x, y = base point; s = scale) ---------- */
const PROP = (RTW.PROP = {});
const ink = (c, lw) => { c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); };
PROP.windmill = function (c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-12, 0); c.lineTo(-8, -38); c.lineTo(8, -38); c.lineTo(12, 0); c.closePath(); c.fillStyle = '#e8dcc0'; c.fill(); ink(c, 2.5);
  c.fillStyle = '#6b4a2b'; c.beginPath(); rr(c, -3, -12, 6, 12, 2); c.fill();
  c.beginPath(); c.moveTo(-11, -38); c.lineTo(0, -50); c.lineTo(11, -38); c.closePath(); c.fillStyle = '#8a5a3a'; c.fill(); ink(c, 2.5);
  c.save(); c.translate(0, -36); c.rotate(t * 0.8); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.rect(-3, -34, 6, 30); c.fillStyle = '#f2ead6'; c.fill(); ink(c, 1.8); c.strokeStyle = 'rgba(120,90,50,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -33); c.lineTo(0, -5); c.stroke(); } c.restore();
  c.beginPath(); circ(c, 0, -36, 3); c.fillStyle = PAL.woodD; c.fill(); ink(c, 1.5);
  c.restore();
};
PROP.castle = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // rocky mound
  c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-50, -34, -26, -40); c.lineTo(34, -40); c.quadraticCurveTo(56, -30, 72, 0); c.closePath(); c.fillStyle = '#9a8a6a'; c.fill(); ink(c, 2.5);
  c.fillStyle = 'rgba(60,45,25,0.3)'; c.beginPath(); c.moveTo(20, -40); c.quadraticCurveTo(52, -26, 72, 0); c.lineTo(40, 0); c.closePath(); c.fill();
  const stone = '#d6ccb4', stoneD = '#a89c82';
  // curtain wall
  c.beginPath(); c.rect(-40, -62, 72, 24); c.fillStyle = stone; c.fill(); ink(c, 2.4);
  for (let i = 0; i < 7; i++) { c.beginPath(); c.rect(-40 + i * 10.8, -68, 6, 7); c.fillStyle = stone; c.fill(); ink(c, 1.8); }
  // keep
  c.beginPath(); c.rect(-12, -96, 26, 58); c.fillStyle = stone; c.fill(); ink(c, 2.6);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(6, -96, 8, 58);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-12 + i * 9.5, -103, 6, 8); c.fillStyle = stone; c.fill(); ink(c, 1.8); }
  c.fillStyle = '#2a241e'; c.beginPath(); rr(c, -3, -84, 6, 10, 3); c.fill(); c.beginPath(); rr(c, -3, -64, 6, 10, 3); c.fill();
  // side towers
  for (const tx of [-44, 30]) { c.beginPath(); c.rect(tx, -74, 14, 36); c.fillStyle = stoneD; c.fill(); ink(c, 2.2); c.beginPath(); c.moveTo(tx - 2, -74); c.lineTo(tx + 7, -88); c.lineTo(tx + 16, -74); c.closePath(); c.fillStyle = '#6b4a3a'; c.fill(); ink(c, 2); }
  // gate
  c.beginPath(); c.moveTo(-8, -38); c.lineTo(-8, -48); c.arc(0, -48, 8, Math.PI, 0); c.lineTo(8, -38); c.closePath(); c.fillStyle = '#2a241e'; c.fill();
  if (o.arms) HER.banner(c, 1, -128, 26, 18, o.arms, t, { poleLen: 30, finial: true });
  if (o.smoke) smokePuffs(c, 20, -70, 1, t, 3);
  c.restore();
};
PROP.tent = function (c, x, y, s, t, o = {}) {
  const col = o.col || TEAMS.red.main;
  c.save(); c.translate(x, y); c.scale(s, s);
  const body = () => { c.beginPath(); c.moveTo(-22, 0); c.lineTo(-18, -22); c.lineTo(0, -40); c.lineTo(18, -22); c.lineTo(22, 0); c.closePath(); };
  body(); c.fillStyle = '#f2ead6'; c.fill();
  c.save(); body(); c.clip(); c.fillStyle = col; for (let i = -3; i <= 3; i += 2) { c.beginPath(); c.moveTo(0, -40); c.lineTo(i * 7 - 3.5, 2); c.lineTo(i * 7 + 3.5, 2); c.closePath(); c.fill(); } c.restore();
  body(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-18, -22); c.quadraticCurveTo(0, -18, 18, -22); ink(c, 1.6);
  c.beginPath(); c.moveTo(-5, 0); c.lineTo(0, -14); c.lineTo(5, 0); c.closePath(); c.fillStyle = '#3a2a1e'; c.fill();
  c.beginPath(); c.moveTo(0, -40); c.lineTo(0, -50); ink(c, 2);
  const wv = Math.sin(t * 4 + x) * 1.5; c.beginPath(); c.moveTo(0, -50); c.lineTo(12, -47 + wv); c.lineTo(0, -44); c.closePath(); c.fillStyle = col; c.fill(); ink(c, 1.4);
  c.restore();
};
function smokePuffs(c, x, y, s, t, n = 4, col = 'rgba(200,196,188,') {
  for (let i = 0; i < n; i++) { const k = ((t * 0.35 + i / n) % 1); c.fillStyle = col + (0.5 * (1 - k)).toFixed(3) + ')'; c.beginPath(); circ(c, x + Math.sin(k * 3 + i) * 5 * s + k * 10 * s, y - k * 40 * s, (4 + k * 10) * s); c.fill(); }
}
PROP.fire = function (c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const gg = c.createRadialGradient(0, -6, 2, 0, -6, 40); gg.addColorStop(0, 'rgba(255,190,90,0.55)'); gg.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = gg; c.beginPath(); circ(c, 0, -6, 40); c.fill();
  for (const a of [-0.35, 0.35]) { c.save(); c.rotate(a); c.beginPath(); rr(c, -12, -3, 24, 6, 3); c.fillStyle = PAL.woodD; c.fill(); ink(c, 1.6); c.restore(); }
  const f = (k, col, sc) => { c.beginPath(); c.moveTo(-8 * sc, 0); c.quadraticCurveTo(-10 * sc, -12 * sc, (-2 + Math.sin(t * 9 + k) * 2) * sc, -24 * sc - Math.sin(t * 7 + k) * 3 * sc); c.quadraticCurveTo(10 * sc, -10 * sc, 8 * sc, 0); c.closePath(); c.fillStyle = col; c.fill(); };
  f(0, '#e2572b', 1); f(1, '#ffb13a', 0.7); f(2, '#fff0a0', 0.38);
  smokePuffs(c, 0, -26, 1, t, 3);
  c.restore();
};
PROP.wagon = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  c.beginPath(); c.rect(-26, -20, 52, 12); c.fillStyle = PAL.wood; c.fill(); ink(c, 2.2);
  c.beginPath(); c.moveTo(-24, -20); c.quadraticCurveTo(-26, -44, 0, -46); c.quadraticCurveTo(26, -44, 24, -20); c.closePath(); c.fillStyle = '#efe4c6'; c.fill(); ink(c, 2.2);
  c.strokeStyle = 'rgba(120,90,50,0.5)'; c.lineWidth = 1.2; for (const k of [-12, 0, 12]) { c.beginPath(); c.moveTo(k, -45); c.quadraticCurveTo(k * 1.1, -32, k, -20); c.stroke(); }
  c.beginPath(); c.moveTo(26, -12); c.lineTo(46, -6); ink(c, 3); c.strokeStyle = PAL.wood; c.lineWidth = 1.6; c.stroke();
  for (const wx of [-16, 16]) { c.beginPath(); circ(c, wx, -6, 8); c.fillStyle = PAL.woodL; c.fill(); ink(c, 2); c.beginPath(); circ(c, wx, -6, 2); c.fillStyle = INK; c.fill(); c.strokeStyle = PAL.woodD; c.lineWidth = 1.2; for (let a = 0; a < 6; a++) { c.beginPath(); c.moveTo(wx, -6); c.lineTo(wx + Math.cos(a) * 7, -6 + Math.sin(a) * 7); c.stroke(); } }
  c.restore();
};
PROP.cathedral = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const st = '#e2d6b4', stD = '#b8aa86', dk = '#2f2a38';
  const win = (wx, wy, ww, wh) => { c.beginPath(); c.moveTo(wx - ww / 2, wy); c.lineTo(wx - ww / 2, wy - wh + ww / 2); c.quadraticCurveTo(wx, wy - wh - ww * 0.3, wx + ww / 2, wy - wh + ww / 2); c.lineTo(wx + ww / 2, wy); c.closePath(); c.fillStyle = o.lit ? '#ffd88a' : dk; c.fill(); };
  // nave and roof
  c.beginPath(); c.rect(-90, -46, 150, 46); c.fillStyle = st; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(-92, -46); c.lineTo(-84, -62); c.lineTo(56, -62); c.lineTo(62, -46); c.closePath(); c.fillStyle = '#7a6a5a'; c.fill(); ink(c, 2.2);
  for (let i = 0; i < 7; i++) win(-78 + i * 19, -12, 7, 22);
  for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(-88 + i * 20, -46); c.lineTo(-88 + i * 20, -8); c.lineWidth = 3; c.strokeStyle = stD; c.stroke(); }
  // west towers
  for (const tx of [60, 84]) { c.beginPath(); c.rect(tx - 10, -92, 20, 92); c.fillStyle = st; c.fill(); ink(c, 2.3); win(tx, -60, 6, 16); for (const px of [-8, 8]) { c.beginPath(); c.moveTo(tx + px - 2, -92); c.lineTo(tx + px, -104); c.lineTo(tx + px + 2, -92); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 1.6); } }
  c.beginPath(); c.rect(62, -56, 20, 56); c.fillStyle = stD; c.fill(); ink(c, 2);
  win(72, 0, 10, 20);
  // central tower (Bell Harry)
  c.beginPath(); c.rect(-30, -122, 34, 80); c.fillStyle = st; c.fill(); ink(c, 2.6);
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(-6, -122, 10, 80);
  win(-21, -80, 7, 26); win(-5, -80, 7, 26);
  for (const px of [-30, -2]) { c.beginPath(); c.moveTo(px - 2, -122); c.lineTo(px + 2, -142); c.lineTo(px + 6, -122); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 1.8); }
  for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(-28 + i * 6.4, -128, 4, 6); c.fillStyle = st; c.fill(); ink(c, 1.2); }
  // cross on the gable
  c.fillStyle = PAL.gold; c.fillRect(-89, -76, 3, 14); c.fillRect(-93, -72, 11, 3);
  c.restore();
};
PROP.walls = function (c, x, y, s, t, o = {}) {
  const w = o.w || 200;
  c.save(); c.translate(x, y); c.scale(s, s);
  const st = '#d6ccb4';
  c.beginPath(); c.rect(-w / 2, -38, w, 38); c.fillStyle = '#c9bfa9'; c.fill(); ink(c, 2.4);
  for (let i = 0; i < w / 14; i++) { c.beginPath(); c.rect(-w / 2 + i * 14, -44, 8, 7); c.fillStyle = '#c9bfa9'; c.fill(); ink(c, 1.6); }
  for (const tx of o.towers || [-w / 2 + 10, 0, w / 2 - 10]) { c.beginPath(); c.rect(tx - 12, -64, 24, 64); c.fillStyle = st; c.fill(); ink(c, 2.4); for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(tx - 12 + i * 9, -70, 6, 7); c.fillStyle = st; c.fill(); ink(c, 1.6); } c.fillStyle = '#2a241e'; c.fillRect(tx - 2, -50, 4, 10); }
  if (o.gate != null) { const gx = o.gate; c.beginPath(); c.moveTo(gx - 9, 0); c.lineTo(gx - 9, -16); c.arc(gx, -16, 9, Math.PI, 0); c.lineTo(gx + 9, 0); c.closePath(); c.fillStyle = '#2a241e'; c.fill(); }
  if (o.arms) HER.banner(c, (o.towers || [0])[1] || 0, -100, 30, 20, o.arms, t, { poleLen: 36 });
  c.restore();
};
PROP.cannon = function (c, x, y, s, t, o = {}) {
  const dir = o.dir || 1, period = o.period || 2.2, k = ((t + (o.phase || 0)) % period) / period;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const recoil = k < 0.08 ? -k * 40 : k < 0.3 ? -3.2 * (1 - (k - 0.08) / 0.22) : 0;
  c.beginPath(); c.moveTo(-24, 0); c.lineTo(22, 0); c.lineTo(20, -8); c.lineTo(-22, -8); c.closePath(); c.fillStyle = PAL.wood; c.fill(); ink(c, 2);
  c.save(); c.translate(recoil, 0);
  c.beginPath(); c.moveTo(-18, -8); c.lineTo(-18, -20); c.lineTo(24, -18); c.lineTo(24, -10); c.closePath(); c.fillStyle = '#5a6470'; c.fill(); ink(c, 2.2);
  c.strokeStyle = '#3a424c'; c.lineWidth = 2; for (const bx of [-10, 2, 14]) { c.beginPath(); c.moveTo(bx, -20); c.lineTo(bx, -8); c.stroke(); }
  c.beginPath(); ell(c, 24, -14, 2.5, 4.5); c.fillStyle = INK; c.fill();
  c.restore();
  for (const wx of [-12, 12]) { c.beginPath(); circ(c, wx, 0, 6); c.fillStyle = PAL.woodL; c.fill(); ink(c, 1.8); }
  if (o.fire !== false) {
    if (k < 0.1) { c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(26, -14); c.lineTo(46, -22); c.lineTo(40, -14); c.lineTo(48, -6); c.closePath(); c.fill(); }
    for (let i = 0; i < 4; i++) { const q = clamp((k - i * 0.04) / 0.8); if (q <= 0 || q >= 1) continue; c.fillStyle = `rgba(236,232,222,${0.75 * (1 - q)})`; c.beginPath(); circ(c, 30 + q * 30 + i * 4, -14 - q * 18 - i * 3, 5 + q * 14); c.fill(); }
  }
  c.restore();
};
PROP.cog = function (c, x, y, s, t, o = {}) {
  const bob = Math.sin(t * 1.6 + x * 0.1) * 1.5, dir = o.dir || 1;
  c.save(); c.translate(x, y + bob); c.scale(s * dir, s); c.rotate(Math.sin(t * 1.2 + x) * 0.02);
  // hull
  const hull = () => { c.beginPath(); c.moveTo(-46, -18); c.quadraticCurveTo(-40, 6, -10, 8); c.lineTo(18, 8); c.quadraticCurveTo(44, 6, 50, -20); c.lineTo(40, -18); c.lineTo(-38, -16); c.closePath(); };
  hull(); c.fillStyle = '#8a5a34'; c.fill(); ink(c, 2.6);
  c.save(); hull(); c.clip(); c.strokeStyle = 'rgba(40,24,10,0.45)'; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-50, -12 + i * 5); c.quadraticCurveTo(0, -6 + i * 5, 52, -14 + i * 5); c.stroke(); } c.restore();
  // castles fore and aft
  for (const [cx0, cw] of [[-44, 18], [30, 18]]) { c.beginPath(); c.rect(cx0, -32, cw, 15); c.fillStyle = '#c9a270'; c.fill(); ink(c, 2); for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(cx0 + i * 4.8, -36, 3, 4); c.fillStyle = '#c9a270'; c.fill(); ink(c, 1.2); } }
  // mast and sail
  c.beginPath(); c.moveTo(0, -16); c.lineTo(0, -92); ink(c, 3); c.strokeStyle = PAL.woodD; c.lineWidth = 1.8; c.stroke();
  const sail = () => { c.beginPath(); c.moveTo(-24, -84); c.quadraticCurveTo(0, -88, 24, -84); c.quadraticCurveTo(30, -58, 24, -36); c.quadraticCurveTo(0, -32, -24, -36); c.quadraticCurveTo(-18, -58, -24, -84); c.closePath(); };
  sail(); c.fillStyle = '#f2ead6'; c.fill(); ink(c, 2.4);
  if (o.arms) { c.save(); sail(); c.clip(); c.globalAlpha = 0.95; HER.paint(c, o.arms, -24, -86, 48, 52, { detail: true }); c.restore(); sail(); ink(c, 2.4); }
  c.beginPath(); c.moveTo(-26, -86); c.lineTo(26, -86); ink(c, 2.6);
  const wv = Math.sin(t * 4 + x) * 2; c.beginPath(); c.moveTo(0, -92); c.lineTo(18, -89 + wv); c.lineTo(0, -86); c.closePath(); c.fillStyle = TEAMS.red.main; c.fill(); ink(c, 1.4);
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 46 * s, y + 8 * s); c.quadraticCurveTo(x, y + 12 * s, x + 50 * s, y + 6 * s); c.stroke();
};
PROP.banner = function (c, x, y, s, t, o = {}) { HER.banner(c, x, y - 64 * s, 34 * s, 24 * s, o.arms || 'royal', t + x * 0.01, { poleLen: 64 * s, flip: o.flip }); };
PROP.butts = function (c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-14, 0); c.lineTo(-12, -30); c.quadraticCurveTo(0, -36, 12, -30); c.lineTo(14, 0); c.closePath(); c.fillStyle = '#d9b862'; c.fill(); ink(c, 2);
  for (const [r, col] of [[9, '#f4efe2'], [6, '#c8372d'], [3, '#f2c22e']]) { c.beginPath(); circ(c, 0, -17, r); c.fillStyle = col; c.fill(); ink(c, 1.4); }
  c.strokeStyle = INK; c.lineWidth = 1.4; for (const [ax, ay] of [[-3, -19], [4, -14]]) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax - 9, ay - 2); c.stroke(); }
  c.restore();
};
PROP.tree = function (c, x, y, s, t, o = {}) { W.tree(c, x, y, 16 * s, o.seed || Math.round(x), o.tint || 0); };
PROP.treeDark = function (c, x, y, s, t, o = {}) { W.tree(c, x, y, 16 * s, o.seed || Math.round(x), -0.5); };
PROP.pine = function (c, x, y, s, t, o = {}) { W.pine(c, x, y, 13 * s, o.seed || Math.round(x)); };
PROP.bush = function (c, x, y, s, t, o = {}) { W.bush(c, x, y, 10 * s, o.seed || Math.round(x)); };
PROP.rock = function (c, x, y, s, t, o = {}) { W.rock(c, x, y, 9 * s, o.seed || 3); };
PROP.reeds = function (c, x, y, s, t) {
  c.save(); c.fillStyle = 'rgba(90,130,150,0.55)'; c.beginPath(); ell(c, x, y, 26 * s, 7 * s); c.fill();
  c.strokeStyle = '#4f6b2e'; c.lineWidth = 1.6 * s; for (let i = -3; i <= 3; i++) { const sw = Math.sin(t * 1.5 + i) * 2 * s; c.beginPath(); c.moveTo(x + i * 5 * s, y); c.quadraticCurveTo(x + i * 5 * s + sw, y - 12 * s, x + i * 6 * s + sw * 1.5, y - 20 * s); c.stroke(); }
  c.fillStyle = '#6b4a2b'; for (let i = -2; i <= 2; i += 2) { c.beginPath(); ell(c, x + i * 6 * s + Math.sin(t * 1.5 + i) * 3 * s, y - 19 * s, 1.6 * s, 4 * s); c.fill(); }
  c.restore();
};
// hedgerow along a line (fractions resolved by the composer); gap = [a, b] in 0..1 along the line
PROP.hedge = function (c, x0, y0, x1, y1, s, t, o = {}) {
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / (12 * s))), R = rng(o.seed || 17);
  const blobs = [];
  for (let i = 0; i <= n; i++) { const u = i / n; if (o.gap && u > o.gap[0] && u < o.gap[1]) continue; blobs.push([lerp(x0, x1, u) + (R() - 0.5) * 4 * s, lerp(y0, y1, u) - 9 * s - R() * 4 * s, (9 + R() * 4) * s]); }
  c.save();
  c.fillStyle = 'rgba(20,30,10,0.3)'; for (const [bx, by, br] of blobs) { c.beginPath(); ell(c, bx, by + br * 1.1, br * 1.1, br * 0.35); c.fill(); }
  c.fillStyle = INK; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br + 1.6); c.fill(); }
  c.fillStyle = PAL.leafD; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.fill(); }
  c.fillStyle = PAL.leaf; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx - br * 0.2, by - br * 0.25, br * 0.7); c.fill(); }
  c.fillStyle = PAL.leafL; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx - br * 0.35, by - br * 0.45, br * 0.3); c.fill(); }
  c.restore();
};
PROP.stakes = function (c, x0, y0, x1, y1, s, t, o = {}) {
  const n = o.n || Math.max(3, Math.round(Math.abs(x1 - x0) / (10 * s)));
  for (let i = 0; i < n; i++) { const u = n === 1 ? 0.5 : i / (n - 1); stake(c, lerp(x0, x1, u), lerp(y0, y1, u) - (i % 2) * 3 * s, (o.lean || -0.4) * (o.dir || 1), s); }
};

/* ---------- the composer ---------- */
function storyScene(c, x, y, w, h, t, S, o) {
  const k = h / 330;
  skyPaint(c, x, y, w, h, S.sky || 'day', t);
  const gy = landPaint(c, x, y, w, h, S);
  const X = (f) => x + w * f, Y = (f) => y + h * f;
  if (S.back) S.back.forEach((p) => drawProp(c, p, X, Y, k, t));
  // woods on the edges
  if (S.woods) {
    const sides = S.woods === 'both' ? [-1, 1] : S.woods === 'left' ? [-1] : S.woods === 'right' ? [1] : [];
    const tint = S.sky === 'night' ? -0.55 : S.sky === 'dusk' || S.sky === 'grey' ? -0.15 : 0;
    for (const sd of sides) for (let i = 0; i < 6; i++) { const fx = sd < 0 ? 0.02 + (i % 2) * 0.06 : 0.98 - (i % 2) * 0.06, fy = 0.52 + i * 0.09; W.tree(c, X(fx), Y(fy), (18 + (i % 3) * 3) * k, i + (sd < 0 ? 20 : 40), tint); }
    if (S.woods === 'back') for (let i = 0; i < 12; i++) W.tree(c, X(-0.02 + i * 0.09), Y(0.5 + (i % 2) * 0.03), (15 + (i % 3) * 3) * k, i + 60, tint - 0.06);
  }
  // depth-sorted props and troops
  const items = [];
  // an island sits behind whatever stands on it (castles, huts), so it sorts a little higher; o.z overrides
  (S.props || []).forEach((p) => items.push({ y: p[0] === 'hedge' || p[0] === 'stakes' ? Math.max(p[2], p[4]) : p[4] && p[4].z != null ? p[4].z : p[0] === 'isle' ? p[2] - 0.2 : p[2], p }));
  (S.troops || []).forEach((u) => items.push({ y: u[3], u }));
  items.sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.p) { drawProp(c, it.p, X, Y, k, t); continue; }
    const [type, team, fx, fy, size, anim, facing, view, ph] = it.u, def = RTW.TROOPS[type]; if (!def) continue;
    const sz = size * k * 1.35 * (def.mounted ? (def.h > 150 ? 0.7 : 0.8) : 1);
    if (it.u[9] === 'hero') heroRing(c, X(fx), Y(fy), sz * (def.mounted ? 0.75 : 0.5), team, t);
    RTW.drawTroop(c, { type, team, x: X(fx), y: Y(fy), size: sz, view: view || 'side', facing: facing || 1, anim: anim || 'idle', t: t * (it.u[10] || 1) + (ph || 0), dpr: o.dpr });
  }
  // weather and effects
  for (const fx of S.fx || []) {
    if (fx === 'rain') { c.strokeStyle = 'rgba(220,230,240,0.5)'; c.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const rx = x + ((i * 53.7 + t * 160) % (w + 40)) - 20, ry = y + ((i * 97.3 + t * 420) % h); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 5, ry + 13); c.stroke(); } }
    else if (fx === 'mist') { const mg = c.createLinearGradient(0, Y(0.5), 0, Y(0.75)); mg.addColorStop(0, 'rgba(235,238,240,0)'); mg.addColorStop(0.5, 'rgba(235,238,240,0.4)'); mg.addColorStop(1, 'rgba(235,238,240,0)'); c.fillStyle = mg; c.fillRect(x, Y(0.5), w, h * 0.25); }
    else if (fx === 'night') { c.fillStyle = 'rgba(10,16,44,0.4)'; c.fillRect(x, y, w, h); }
    else if (fx === 'smoke') { for (let i = 0; i < 6; i++) smokePuffs(c, x + w * (0.1 + i * 0.16), Y(0.62), k * 1.6, t + i * 0.4, 3); }
    else if (fx === 'snow') RTW.snowfall(c, x, y, w, h, t, 70, 0.6);
    else if (fx === 'fog') { c.fillStyle = 'rgba(226,230,234,0.35)'; c.fillRect(x, y, w, h); for (let i = 0; i < 5; i++) { const fg = c.createLinearGradient(0, Y(0.45 + i * 0.1), 0, Y(0.55 + i * 0.1)); fg.addColorStop(0, 'rgba(238,241,244,0)'); fg.addColorStop(0.5, 'rgba(238,241,244,0.5)'); fg.addColorStop(1, 'rgba(238,241,244,0)'); c.fillStyle = fg; c.fillRect(x, Y(0.45 + i * 0.1), w, h * 0.1); } }
  }
  if (S.arrows) {
    const A = S.arrows;
    c.save(); c.lineWidth = 1.4 * k + 0.3;
    for (let i = 0; i < (A.n || 24); i++) {
      const q = (t * (A.speed || 0.7) + i / (A.n || 24)) % 1;
      const sx = X(A.from[0] + (i % 5) * (A.spread || 0.04)), sy = Y(A.from[1] - (i % 3) * 0.01), ex = X(A.to[0] + (i % 7) * (A.spread || 0.03)), ey = Y(A.to[1] + (i % 4) * 0.015);
      const arc = h * (A.arc || 0.35), px = lerp(sx, ex, q), py = lerp(sy, ey, q) - Math.sin(Math.PI * q) * arc;
      const ang = Math.atan2((ey - sy) - Math.cos(Math.PI * q) * arc * Math.PI, ex - sx);
      c.save(); c.translate(px, py); c.rotate(ang); c.strokeStyle = 'rgba(40,30,20,0.8)'; c.beginPath(); c.moveTo(-5 * k, 0); c.lineTo(5 * k, 0); c.stroke(); c.restore();
    }
    c.restore();
  }
  if (S.fg) S.fg.forEach((p) => drawProp(c, p, X, Y, k, t));
  // motes of pollen and dust drifting through the light (fireflies by night)
  const sk = S.sky || 'day';
  if (sk === 'night') AMB.fireflies(c, x, y + h * 0.45, w, h * 0.5, t, 10, 7);
  else if (sk !== 'storm' && !(S.fx || []).includes('rain')) {
    c.save(); c.fillStyle = sk === 'day' ? '#fffbe0' : '#ffe2b8';
    for (let i = 0; i < 16; i++) { const px = x + ((i * 61.3 + t * (6 + (i % 4) * 2)) % (w + 20)) - 10, py = y + h * (0.2 + ((i * 0.137) % 0.75)) + Math.sin(t * 0.8 + i) * 8; c.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.7 + i * 1.7)); c.beginPath(); circ(c, px, py, 0.9 + (i % 3) * 0.45); c.fill(); }
    c.restore();
  }
}
function drawProp(c, p, X, Y, k, t) {
  const kind = p[0], fn = PROP[kind]; if (!fn) return;
  if (kind === 'hedge' || kind === 'stakes') fn(c, X(p[1]), Y(p[2]), X(p[3]), Y(p[4]), (p[5] || 1) * k, t, p[6] || {});
  else fn(c, X(p[1]), Y(p[2]), (p[3] || 1) * k, t, p[4] || {});
}
// big portrait in a gold frame with the sitter's banners either side
function portraitPic(c, x, y, w, h, t, S, o) {
  const P = RTW.PORTRAITS ? RTW.PORTRAITS[S.key] : null, bg = S.bg || (P && P.bg) || ['#6f6f7c', '#23232c'];
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(bg[0], -0.25)); g.addColorStop(1, shade(bg[1], -0.3)); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.save(); c.globalAlpha = 0.14; c.fillStyle = '#fff';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.3; c.beginPath(); c.moveTo(x + w / 2, y + h * 1.05); c.lineTo(x + w / 2 + Math.cos(a - 0.07) * h * 1.6, y + h * 1.05 + Math.sin(a - 0.07) * h * 1.6); c.lineTo(x + w / 2 + Math.cos(a + 0.07) * h * 1.6, y + h * 1.05 + Math.sin(a + 0.07) * h * 1.6); c.closePath(); c.fill(); }
  c.restore();
  const k = h / 330, pw = 176 * k, ph = 212 * k, px = x + w / 2 - pw / 2, py = y + 26 * k;
  if (S.arms) { HER.banner(c, x + w * 0.1, y + 40 * k, 58 * k, 42 * k, S.arms, t, { poleLen: 250 * k }); HER.banner(c, x + w * 0.9, y + 40 * k, 58 * k, 42 * k, S.arms, t + 0.7, { poleLen: 250 * k, flip: true }); }
  c.beginPath(); rr(c, px - 8 * k, py - 8 * k, pw + 16 * k, ph + 16 * k, 14 * k); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const fg = c.createLinearGradient(0, py, 0, py + ph); fg.addColorStop(0, PAL.goldL); fg.addColorStop(1, PAL.goldD); c.fillStyle = fg; c.fill();
  RTW.portrait(c, px, py, pw, ph, S.key, t, { r: 10 * k, phase: (S.key || '').length * 0.37 });
  if (S.name !== false && P) UI.ribbon(c, x + w / 2, py + ph + 36 * k, Math.min(w - 60, 250 * k), 34 * k, S.name || P.name, PAL.gold, { size: 14 * k, fill: INK, strokeW: 0.01, letter: 0.5 });
}
/* spec: { kind: 'map'|'portrait'|'custom'|'scene', caption, ... } */
RTW.storyPic = function (c, x, y, w, h, t, S, o = {}) {
  c.save(); c.beginPath(); rr(c, x, y, w, h, 12); c.clip();
  if (S.kind === 'map') RTW.campaignMap(c, x, y, w, h, S.map, t, { nodes: S.nodes, select: S.select, dpr: o.dpr || 2, r: 12 });
  else if (S.kind === 'portrait') portraitPic(c, x, y, w, h, t, S, o);
  else if (S.kind === 'custom' && STORY[S.name]) STORY[S.name](c, x, y, w, h, t, S, o);
  else storyScene(c, x, y, w, h, t, S, o);
  if (S.kind !== 'map') { const vg = c.createRadialGradient(x + w / 2, y + h / 2, h * 0.3, x + w / 2, y + h / 2, w * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,12,6,0.45)'); c.fillStyle = vg; c.fillRect(x, y, w, h); }
  c.restore();
  c.beginPath(); rr(c, x + 3.5, y + 3.5, w - 7, h - 7, 9); c.lineWidth = 2; c.strokeStyle = 'rgba(255,214,120,0.75)'; c.stroke();
  c.beginPath(); rr(c, x, y, w, h, 12); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  if (S.caption) { const cw = textWidth(c, S.caption, 11, F.body, 600) + 22; c.beginPath(); rr(c, x + 12, y + h - 34, cw, 24, 12); c.fillStyle = 'rgba(15,8,3,0.65)'; c.fill(); text(c, S.caption, x + 12 + cw / 2, y + h - 21.5, { size: 11, weight: 600, fill: '#f0dfbd' }); }
};

/* ---------- named scenes kept from the approved concept ---------- */
STORY.crecy = function (c, x, y, w, h, t) {
  const sky = c.createLinearGradient(0, y, 0, y + h * 0.6); sky.addColorStop(0, '#4c5670'); sky.addColorStop(1, '#a7a79a'); c.fillStyle = sky; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(60,66,84,0.8)'; for (let i = 0; i < 7; i++) { c.beginPath(); ell(c, x + ((i * 83 + t * 6) % (w + 80)) - 40, y + 26 + (i % 3) * 16, 60, 18); c.fill(); }
  c.fillStyle = '#6f8a5a'; c.beginPath(); c.moveTo(x, y + h * 0.52); c.bezierCurveTo(x + w * 0.3, y + h * 0.5, x + w * 0.6, y + h * 0.4, x + w, y + h * 0.28); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill();
  c.fillStyle = W.grassPattern(c, 1); c.globalAlpha = 0.9; c.beginPath(); c.moveTo(x, y + h * 0.7); c.bezierCurveTo(x + w * 0.35, y + h * 0.68, x + w * 0.6, y + h * 0.56, x + w, y + h * 0.42); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); c.globalAlpha = 1;
  PROP.windmill(c, x + w * 0.84, y + h * 0.34, 1, t);
  const red = [['genoese', 0.12, 0.8, 34, 'walk'], ['genoese', 0.2, 0.84, 34, 'walk'], ['royalKnight', 0.06, 0.66, 30, 'walk'], ['royalKnight', 0.18, 0.62, 28, 'walk'], ['genoese', 0.3, 0.86, 34, 'attack']];
  const blue = [['longbow', 0.56, 0.7, 36, 'attack'], ['longbow', 0.64, 0.66, 36, 'attack'], ['longbow', 0.72, 0.62, 36, 'attack'], ['billman', 0.62, 0.78, 38, 'idle'], ['sword', 0.7, 0.74, 38, 'idle'], ['hero_blackPrince', 0.8, 0.7, 34, 'idle'], ['longbow', 0.88, 0.56, 34, 'attack']];
  const U = red.map((u) => [...u, 'red', 1]).concat(blue.map((u) => [...u, 'blue', -1])).sort((a, b) => a[2] - b[2]);
  U.forEach(([ty, fx, fy, sz, an, tm, f], i) => RTW.drawTroop(c, { type: ty, team: tm, x: x + w * fx, y: y + h * fy, size: RTW.TROOPS[ty].mounted ? sz * 0.8 : sz, view: 'side', facing: f, anim: an, t: t + i * 0.23 }));
  c.strokeStyle = 'rgba(40,30,20,0.75)'; c.lineWidth = 1.3;
  for (let i = 0; i < 26; i++) { const k = (t * 0.7 + i / 26) % 1, sx = x + w * (0.55 + (i % 5) * 0.05), ex = x + w * (0.1 + (i % 7) * 0.03), px = lerp(sx, ex, k), py = y + h * 0.6 - Math.sin(Math.PI * k) * h * 0.4 + (i % 3) * 6; const a = Math.atan2((y + h * 0.8 - (y + h * 0.6)) / 1 - Math.cos(Math.PI * k) * h * 0.4 * Math.PI, ex - sx); c.save(); c.translate(px, py); c.rotate(a); c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.stroke(); c.restore(); }
  c.strokeStyle = 'rgba(220,230,240,0.45)'; c.lineWidth = 1.2;
  for (let i = 0; i < 60; i++) { const rx = x + ((i * 53.7 + t * 160) % (w + 40)) - 20, ry = y + ((i * 97.3 + t * 420) % h); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 5, ry + 13); c.stroke(); }
};
STORY.calais = function (c, x, y, w, h, t) {
  skyPaint(c, x, y, w, h * 0.62, 'dawn', t);
  const sy = y + h * 0.6;
  c.fillStyle = W.grassPattern(c, 1, 'sea'); c.fillRect(x, sy, w, y + h - sy);
  const wg = c.createLinearGradient(0, sy, 0, y + h); wg.addColorStop(0, 'rgba(255,220,170,0.45)'); wg.addColorStop(0.35, 'rgba(255,220,170,0)'); c.fillStyle = wg; c.fillRect(x, sy, w, y + h - sy);
  c.fillStyle = '#e8d6a8'; c.beginPath(); c.moveTo(x, sy + 6); c.quadraticCurveTo(x + w * 0.5, sy - 4, x + w, sy + 10); c.lineTo(x + w, sy + 22); c.lineTo(x, sy + 22); c.closePath(); c.fill();
  THEMES.walls.deco(c, x + w * 0.2, sy + 4, 46, 'tower', t); THEMES.walls.deco(c, x + w * 0.62, sy + 2, 52, 'tower', t);
  c.beginPath(); c.rect(x + w * 0.2, sy - 34, w * 0.42, 38); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#c9bfa9'; c.fill();
  for (let i = 0; i < 8; i++) { c.beginPath(); c.rect(x + w * 0.2 + i * (w * 0.42 / 8), sy - 40, w * 0.03, 7); c.stroke(); c.fillStyle = '#c9bfa9'; c.fill(); }
  c.beginPath(); c.moveTo(x + w * 0.38, sy + 4); c.lineTo(x + w * 0.38, sy - 16); c.arc(x + w * 0.41, sy - 16, w * 0.03, Math.PI, 0); c.lineTo(x + w * 0.44, sy + 4); c.closePath(); c.fillStyle = '#2a241e'; c.fill();
  HER.banner(c, x + w * 0.62, sy - 92, 44, 30, 'edwardIII', t, { poleLen: 30 });
  PROP.cog(c, x + w * 0.8, y + h * 0.86, 0.9, t, { arms: 'edwardIII', dir: -1 });
};

/* ================= campaign medal ================= */
const MEDAL = { gold: ['#fff2b0', '#f2be4b', '#9a6a12'], silver: ['#ffffff', '#c9d2dc', '#6f7a88'], bronze: ['#ffd9b0', '#c98a4a', '#6a3a14'] };
RTW.medal = function (c, cx, cy, r, tier = 'gold', arms = 'royal', t = 0, o = {}) {
  const M = MEDAL[tier] || MEDAL.gold;
  c.save(); c.lineJoin = 'round';
  // ribbon behind
  const rib = o.ribbon || ['#c8372d', '#f4efe2', '#2f5fc4'];
  for (const sd of [-1, 1]) {
    c.save(); c.translate(cx, cy); c.rotate(sd * 0.32);
    c.beginPath(); c.moveTo(-r * 0.36, -r * 1.9); c.lineTo(r * 0.36, -r * 1.9); c.lineTo(r * 0.36, -r * 0.2); c.lineTo(-r * 0.36, -r * 0.2); c.closePath();
    c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.save(); c.clip(); rib.forEach((col, i) => { c.fillStyle = col; c.fillRect(-r * 0.36 + (i * r * 0.72) / rib.length, -r * 2, (r * 0.72) / rib.length + 0.5, r * 2); }); c.restore();
    c.restore();
  }
  // laurel
  for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) {
    const a = Math.PI / 2 + sd * (0.35 + i * 0.27), lx = cx + Math.cos(a) * r * 1.08, ly = cy + Math.sin(a) * r * 1.08;
    c.save(); c.translate(lx, ly); c.rotate(a + sd * 1.2); c.beginPath(); ell(c, 0, 0, r * 0.2, r * 0.085); c.fillStyle = i % 2 ? '#5f9a4a' : '#4b8a3f'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); c.restore();
  }
  // disc
  c.beginPath(); circ(c, cx, cy, r); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, M[0]); g.addColorStop(0.45, M[1]); g.addColorStop(1, M[2]); c.fillStyle = g; c.fill();
  c.beginPath(); circ(c, cx, cy, r * 0.8); c.lineWidth = 2.5; c.strokeStyle = shade(M[2], -0.2); c.stroke();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; c.beginPath(); circ(c, cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, r * 0.028); c.fillStyle = shade(M[2], -0.1); c.fill(); }
  // crossed arrows behind a shield of arms
  c.save(); c.translate(cx, cy);
  for (const sd of [-1, 1]) { c.save(); c.rotate(sd * 0.7); c.strokeStyle = INK; c.lineWidth = r * 0.07; c.beginPath(); c.moveTo(0, -r * 0.66); c.lineTo(0, r * 0.62); c.stroke(); c.strokeStyle = shade(M[1], 0.3); c.lineWidth = r * 0.035; c.stroke(); c.beginPath(); c.moveTo(-r * 0.07, -r * 0.54); c.lineTo(0, -r * 0.7); c.lineTo(r * 0.07, -r * 0.54); c.closePath(); c.fillStyle = INK; c.fill(); c.restore(); }
  c.restore();
  HER.shield(c, cx, cy + r * 0.04, r * 0.82, r * 0.96, arms);
  // shine
  c.save(); c.beginPath(); circ(c, cx, cy, r); c.clip();
  const sx = cx - r * 1.6 + ((t * 0.5) % 1.6) * r * 2.6; c.globalAlpha = 0.35; c.fillStyle = '#fff';
  c.beginPath(); c.moveTo(sx, cy - r); c.lineTo(sx + r * 0.3, cy - r); c.lineTo(sx - r * 0.3, cy + r); c.lineTo(sx - r * 0.6, cy + r); c.closePath(); c.fill();
  c.restore();
  c.restore();
};

/* ===== src/art/22-desert.js ===== */
/* Roll to War: desert and Holy Land art for the Saladin campaign.
   Dry ground (sand, stony hills), date palms, wells and springs, pavilions, Jerusalem (walls, the Dome of the Rock),
   siege engines, galleys, the Horns of Hattin, story skies and named story scenes. Same sticker style: ink outlines,
   flat fills with one highlight. */

/* ---------- ground ---------- */
// sand (dune ripples, pebbles, dry scrub) or stony ground (flagstones of rock, olive-green tufts); x, y, w, h in px
RTW.dryGround = function (g, x, y, w, h, kind = 'sand', seed = 1) {
  const R = rng(seed * 7 + 3), sand = kind === 'sand';
  const bg = g.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, sand ? '#e9c98a' : '#cdb58a'); bg.addColorStop(1, sand ? '#dcb372' : '#b9a175');
  g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  // warm and cool patches so the ground never reads as one flat colour
  for (let i = 0; i < w * h / 9000; i++) { const px = x + R() * w, py = y + R() * h, rad = 30 + R() * 60, warm = R() < 0.5, rg = g.createRadialGradient(px, py, 1, px, py, rad); rg.addColorStop(0, warm ? (sand ? 'rgba(236,170,90,0.28)' : 'rgba(210,170,110,0.25)') : (sand ? 'rgba(255,236,190,0.3)' : 'rgba(150,140,120,0.22)')); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.beginPath(); ell(g, px, py, rad, rad * 0.7); g.fill(); }
  if (sand) {
    g.strokeStyle = 'rgba(176,128,62,0.28)'; g.lineWidth = 1.4;
    for (let i = 0; i < h / 7; i++) { const yy = y + i * 7 + R() * 4, x0 = x + R() * w * 0.6 - 20, len = 40 + R() * 90; g.beginPath(); g.moveTo(x0, yy); g.quadraticCurveTo(x0 + len / 2, yy - 3 - R() * 3, x0 + len, yy); g.stroke(); }
    g.strokeStyle = 'rgba(255,244,214,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < h / 14; i++) { const yy = y + i * 14 + R() * 6, x0 = x + R() * w - 20, len = 30 + R() * 50; g.beginPath(); g.moveTo(x0, yy + 1.5); g.quadraticCurveTo(x0 + len / 2, yy - 1.5, x0 + len, yy + 1.5); g.stroke(); }
  } else {
    for (let i = 0; i < w * h / 700; i++) { const px = x + R() * w, py = y + R() * h, r = 1.5 + R() * 4; g.fillStyle = R() < 0.5 ? 'rgba(120,100,70,0.3)' : 'rgba(240,228,200,0.35)'; g.beginPath(); ell(g, px, py, r * 1.4, r, R() * 3); g.fill(); }
  }
  // pebbles and dry scrub
  for (let i = 0; i < w * h / 2600; i++) { const px = x + R() * w, py = y + R() * h; g.fillStyle = 'rgba(120,88,50,0.35)'; g.beginPath(); circ(g, px, py, 0.8 + R() * 1.6); g.fill(); }
  for (let i = 0; i < w * h / 9000; i++) {
    const px = x + R() * w, py = y + R() * h, s = 3 + R() * 3;
    g.strokeStyle = sand ? 'rgba(120,110,50,0.55)' : 'rgba(92,110,60,0.6)'; g.lineWidth = 1.2; g.beginPath();
    for (let k = -2; k <= 2; k++) { g.moveTo(px, py); g.lineTo(px + k * s * 0.5, py - s - R() * 2); }
    g.stroke();
  }
  g.restore();
};

/* ---------- date palm ---------- */
RTW.palm = function (c, x, y, s = 1, t = 0, seed = 1) {
  const R = rng(seed * 31 + 9), lean = (R() - 0.5) * 16 * s, H = (48 + R() * 12) * s, tx = x + lean, ty = y - H;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, x + 8 * s, y, 16 * s, 4 * s); c.fill();
  // trunk: a curved, ringed stem
  const trunk = () => { c.beginPath(); c.moveTo(x - 4 * s, y); c.quadraticCurveTo(x - 3 * s + lean * 0.2, y - H * 0.55, tx - 2.4 * s, ty); c.lineTo(tx + 2.4 * s, ty); c.quadraticCurveTo(x + 3 * s + lean * 0.2, y - H * 0.55, x + 4 * s, y); c.closePath(); };
  trunk(); c.lineWidth = Math.max(1.6, 2.4 * s); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#9a6a3c'; c.fill();
  c.save(); trunk(); c.clip(); c.strokeStyle = 'rgba(70,40,15,0.55)'; c.lineWidth = Math.max(0.8, 1.2 * s);
  for (let k = 1; k < 10; k++) { const u = k / 10, px = lerp(x, tx, u * u * 0.6 + u * 0.4), py = lerp(y, ty, u); c.beginPath(); c.moveTo(px - 5 * s, py + 1.5 * s); c.lineTo(px + 5 * s, py - 1.5 * s); c.stroke(); }
  c.restore();
  // dates
  c.fillStyle = '#c4622a'; for (const [dx, dy] of [[-4, 4], [3, 5], [0, 7]]) { c.beginPath(); circ(c, tx + dx * s, ty + dy * s, 2.4 * s); c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke(); }
  // fronds
  const sw = Math.sin(t * 1.4 + seed) * 0.05, n = 8;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42 + sw + (R() - 0.5) * 0.1, L = (24 + R() * 8) * s, droop = (i === 0 || i === n - 1 ? 14 : 8) * s;
    c.save(); c.translate(tx, ty); c.rotate(a);
    const fr = () => { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.5, -6 * s, L, droop * 0.6); c.quadraticCurveTo(L * 0.55, 3 * s, 0, 3 * s); c.closePath(); };
    fr(); c.lineWidth = Math.max(1.2, 1.8 * s); c.strokeStyle = INK; c.stroke(); c.fillStyle = i % 2 ? '#3f8a3f' : '#57a64a'; c.fill();
    c.strokeStyle = 'rgba(20,60,20,0.5)'; c.lineWidth = Math.max(0.6, 0.9 * s); c.beginPath(); c.moveTo(2 * s, 1 * s); c.quadraticCurveTo(L * 0.5, -3 * s, L - 2 * s, droop * 0.55); c.stroke();
    c.restore();
  }
  c.beginPath(); circ(c, tx, ty, 3.2 * s); c.fillStyle = '#7a5a2a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = INK; c.stroke();
  c.restore();
};

/* ---------- props (x, y = base point; s = scale) ---------- */
PROP.palm = function (c, x, y, s, t, o = {}) { RTW.palm(c, x, y, s, t, o.seed || Math.round(x * 7 + y)); };
PROP.well = function (c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, 2, 2, 22, 6); c.fill();
  // frame and pulley
  for (const px of [-15, 15]) { c.beginPath(); rr(c, px - 2, -34, 4, 30, 1.5); c.fillStyle = PAL.wood; c.fill(); ink(c, 1.8); }
  c.beginPath(); rr(c, -18, -37, 36, 4, 2); c.fillStyle = PAL.woodD; c.fill(); ink(c, 1.8);
  c.beginPath(); circ(c, 0, -30, 3.5); c.fillStyle = PAL.woodL; c.fill(); ink(c, 1.4);
  c.strokeStyle = '#6b5a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -27); c.lineTo(0, -19 + Math.sin(t * 1.5) * 2); c.stroke();
  c.beginPath(); rr(c, -3.5, -20 + Math.sin(t * 1.5) * 2, 7, 6, 1.5); c.fillStyle = PAL.wood; c.fill(); ink(c, 1.2);
  // stone ring
  c.beginPath(); c.moveTo(-18, -12); c.lineTo(-18, 0); c.quadraticCurveTo(0, 6, 18, 0); c.lineTo(18, -12); c.closePath(); c.fillStyle = '#d9c29a'; c.fill(); ink(c, 2.2);
  c.strokeStyle = 'rgba(110,85,50,0.5)'; c.lineWidth = 1; for (const k of [-9, 0, 9]) { c.beginPath(); c.moveTo(k, -12); c.lineTo(k, 2); c.stroke(); } c.beginPath(); c.moveTo(-18, -6); c.quadraticCurveTo(0, 0, 18, -6); c.stroke();
  c.beginPath(); ell(c, 0, -12, 18, 5); c.fillStyle = '#e8d6b0'; c.fill(); ink(c, 2);
  c.beginPath(); ell(c, 0, -12, 12, 3); c.fillStyle = '#2f5a6a'; c.fill();
  c.restore();
};
PROP.pool = function (c, x, y0, s, t, o = {}) {
  const w = (o.w || 60) * s, h = (o.h || 20) * s, y = y0 - h;
  c.save();
  const shape = (k) => { c.beginPath(); c.moveTo(x - w * k, y); c.bezierCurveTo(x - w * k, y - h * k, x - w * 0.3, y - h * 1.1 * k, x + w * 0.1, y - h * k); c.bezierCurveTo(x + w * 0.7 * k, y - h * 1.05 * k, x + w * k, y - h * 0.4 * k, x + w * k, y); c.bezierCurveTo(x + w * 0.8 * k, y + h * k, x - w * 0.6 * k, y + h * 0.9 * k, x - w * k, y); c.closePath(); };
  shape(1.12); c.fillStyle = '#e8d3a0'; c.fill();
  shape(1); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, '#5aa7c4'); g.addColorStop(1, '#2f6f8f'); c.fillStyle = g; c.fill();
  c.save(); shape(1); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { const px = x - w * 0.6 + i * w * 0.3 + Math.sin(t * 1.2 + i) * 4 * s, py = y - h * 0.3 + (i % 2) * h * 0.5; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 5 * s, py - 2 * s, px + 10 * s, py); c.stroke(); }
  c.restore();
  if (o.reeds !== false) { PROP.reeds(c, x - w * 0.8, y + h * 0.2, 0.7 * s, t); PROP.reeds(c, x + w * 0.75, y - h * 0.2, 0.6 * s, t + 1); }
  c.restore();
};
// round pavilion of the Sultan's camp: striped walls, conical roof, finial and pennant
PROP.pavilion = function (c, x, y, s, t, o = {}) {
  const col = o.col || '#e2b33a', col2 = o.col2 || '#f4efe2';
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, 3, 1, 30, 7); c.fill();
  const wall = () => { c.beginPath(); c.moveTo(-24, 0); c.lineTo(-24, -22); c.quadraticCurveTo(0, -18, 24, -22); c.lineTo(24, 0); c.quadraticCurveTo(0, 5, -24, 0); c.closePath(); };
  wall(); c.fillStyle = col2; c.fill();
  c.save(); wall(); c.clip(); c.fillStyle = col; for (let i = -24; i < 24; i += 12) c.fillRect(i, -26, 6, 34); c.restore();
  wall(); ink(c, 2.3);
  c.beginPath(); c.moveTo(-6, 2); c.lineTo(-6, -14); c.quadraticCurveTo(0, -20, 6, -14); c.lineTo(6, 2); c.closePath(); c.fillStyle = '#3a2a1e'; c.fill(); ink(c, 1.4);
  const roof = () => { c.beginPath(); c.moveTo(-28, -21); c.quadraticCurveTo(-14, -30, 0, -50); c.quadraticCurveTo(14, -30, 28, -21); c.quadraticCurveTo(0, -16, -28, -21); c.closePath(); };
  roof(); c.fillStyle = col; c.fill();
  c.save(); roof(); c.clip(); c.fillStyle = col2; for (let i = -3; i <= 3; i += 2) { c.beginPath(); c.moveTo(0, -50); c.lineTo(i * 8 - 3, -14); c.lineTo(i * 8 + 3, -14); c.closePath(); c.fill(); } c.restore();
  roof(); ink(c, 2.3);
  c.beginPath(); c.moveTo(0, -50); c.lineTo(0, -60); ink(c, 2);
  c.beginPath(); circ(c, 0, -61, 2.6); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.2);
  const wv = Math.sin(t * 4 + x) * 1.6; c.beginPath(); c.moveTo(0, -60); c.lineTo(15, -57 + wv); c.lineTo(0, -53); c.closePath(); c.fillStyle = o.flag || '#f2c22e'; c.fill(); ink(c, 1.3);
  c.restore();
};
// the Dome of the Rock: octagon with blue tiles, golden dome
PROP.dome = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-34, -30, 68, 30); c.fillStyle = '#3f7fb8'; c.fill(); ink(c, 2.4);
  c.fillStyle = '#e8e2d2'; c.fillRect(-34, -8, 68, 8); c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-34, -8); c.lineTo(34, -8); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = -28; i < 30; i += 11) { c.beginPath(); c.moveTo(i, -26); c.lineTo(i + 4, -26); c.lineTo(i + 4, -14); c.quadraticCurveTo(i + 2, -10, i, -14); c.closePath(); c.fill(); }
  c.beginPath(); c.rect(-20, -40, 40, 10); c.fillStyle = '#3f7fb8'; c.fill(); ink(c, 2);
  c.beginPath(); c.moveTo(-20, -40); c.quadraticCurveTo(-22, -66, 0, -70); c.quadraticCurveTo(22, -66, 20, -40); c.closePath();
  const g = c.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, '#fff0a0'); g.addColorStop(0.5, '#f2be4b'); g.addColorStop(1, '#b8801c'); c.fillStyle = g; c.fill(); ink(c, 2.4);
  c.beginPath(); c.moveTo(0, -70); c.lineTo(0, -80); ink(c, 2); c.beginPath(); c.arc(0, -82, 3, Math.PI * 0.2, Math.PI * 1.8); ink(c, 1.6);
  c.restore();
};
// Jerusalem from outside the north wall: domes, towers and flat roofs behind a crenellated wall
PROP.city = function (c, x, y, s, t, o = {}) {
  const w = o.w || 300;
  c.save(); c.translate(x, y); c.scale(s, s);
  const R = rng(o.seed || 12);
  // houses
  for (let i = 0; i < 16; i++) { const hx = -w / 2 + 6 + i * (w - 12) / 16 + R() * 6, hw = 14 + R() * 10, hh = 16 + R() * 18; c.beginPath(); c.rect(hx, -44 - hh, hw, hh + 10); c.fillStyle = R() < 0.5 ? '#e6dcc4' : '#d6c8a8'; c.fill(); ink(c, 1.6); c.fillStyle = '#3a2e22'; c.fillRect(hx + hw * 0.3, -40 - hh * 0.6, 3, 4); }
  PROP.dome(c, -w * 0.12, -44, 0.9, t);
  // Holy Sepulchre: grey domes and a bell tower
  c.beginPath(); c.rect(w * 0.16, -80, 36, 40); c.fillStyle = '#d9cdb2'; c.fill(); ink(c, 1.8);
  c.beginPath(); c.moveTo(w * 0.16 + 4, -80); c.quadraticCurveTo(w * 0.16 + 18, -104, w * 0.16 + 32, -80); c.closePath(); c.fillStyle = '#8f9aa6'; c.fill(); ink(c, 1.8);
  c.beginPath(); c.rect(w * 0.16 + 40, -100, 12, 60); c.fillStyle = '#d9cdb2'; c.fill(); ink(c, 1.8); c.beginPath(); c.moveTo(w * 0.16 + 38, -100); c.lineTo(w * 0.16 + 46, -112); c.lineTo(w * 0.16 + 54, -100); c.closePath(); c.fillStyle = '#8a5a3a'; c.fill(); ink(c, 1.6);
  // Tower of David
  c.beginPath(); c.rect(-w * 0.42, -92, 20, 60); c.fillStyle = '#cdbf9f'; c.fill(); ink(c, 2);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-w * 0.42 + i * 7, -98, 5, 7); c.fillStyle = '#cdbf9f'; c.fill(); ink(c, 1.3); }
  // the wall
  if (!o.noWall) PROP.walls(c, 0, 0, 1, t, { w, towers: o.towers || [-w * 0.36, -w * 0.12, w * 0.12, w * 0.36], gate: o.gate != null ? o.gate : 0, arms: o.arms });
  c.restore();
};
// traction trebuchet: a crew hauls ropes, the arm swings and hurls a stone
PROP.mangonel = function (c, x, y, s, t, o = {}) {
  const dir = o.dir || 1, per = 3, k = ((t + (o.phase || 0)) % per) / per;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, 0, 1, 26, 6); c.fill();
  c.beginPath(); c.moveTo(-18, 0); c.lineTo(0, -34); c.lineTo(18, 0); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineWidth = 5.5; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = 3; c.strokeStyle = PAL.wood; c.stroke();
  c.beginPath(); rr(c, -22, -3, 44, 5, 2); c.fillStyle = PAL.woodD; c.fill(); ink(c, 1.6);
  const a = k < 0.15 ? lerp(0.9, -1.4, easeOut(k / 0.15)) : k < 0.5 ? -1.4 : lerp(-1.4, 0.9, smooth((k - 0.5) / 0.5));
  c.save(); c.translate(0, -34); c.rotate(a);
  c.beginPath(); c.moveTo(-40, 0); c.lineTo(18, 0); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = PAL.woodL; c.stroke();
  c.strokeStyle = '#6b5a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-44, 10); c.stroke();
  if (k > 0.5) { c.beginPath(); circ(c, -44, 12, 3.5); c.fillStyle = '#9a9488'; c.fill(); ink(c, 1.2); }
  c.restore();
  if (k >= 0.15 && k < 0.5) { const q = (k - 0.15) / 0.35; c.beginPath(); circ(c, -10 - q * 120, -60 - Math.sin(q * Math.PI) * 50, 3.5); c.fillStyle = '#9a9488'; c.fill(); ink(c, 1.2); }
  c.restore();
};
// the Horns of Hattin: the twin peaks of an old volcano
PROP.horns = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const hill = () => { c.beginPath(); c.moveTo(-120, 0); c.quadraticCurveTo(-90, -10, -70, -46); c.quadraticCurveTo(-58, -64, -44, -50); c.quadraticCurveTo(-20, -34, 0, -36); c.quadraticCurveTo(22, -38, 40, -58); c.quadraticCurveTo(56, -72, 70, -48); c.quadraticCurveTo(90, -12, 124, 0); c.closePath(); };
  hill(); const g = c.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, o.dim ? '#8a7a64' : '#b89a6a'); g.addColorStop(1, o.dim ? '#6a5a44' : '#9a7a4a'); c.fillStyle = g; c.fill(); ink(c, 2.4);
  c.save(); hill(); c.clip(); c.fillStyle = 'rgba(60,40,20,0.25)'; c.beginPath(); c.moveTo(40, -58); c.quadraticCurveTo(70, -30, 124, 0); c.lineTo(60, 0); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-58, -60); c.quadraticCurveTo(-40, -30, 0, 0); c.lineTo(-40, 0); c.closePath(); c.fill();
  const R = rng(7); c.fillStyle = 'rgba(110,100,60,0.5)'; for (let i = 0; i < 40; i++) { c.beginPath(); circ(c, -110 + R() * 230, -R() * 50, 1 + R() * 1.6); c.fill(); }
  c.restore();
  c.restore();
};
// one rocky peak (the Horns of Hattin are two of these)
PROP.peak = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  const hill = () => { c.beginPath(); c.moveTo(-62, 0); c.quadraticCurveTo(-42, -10, -26, -46); c.quadraticCurveTo(-12, -72, 6, -58); c.quadraticCurveTo(22, -40, 34, -22); c.quadraticCurveTo(46, -6, 64, 0); c.closePath(); };
  c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, 4, 1, 60, 8); c.fill();
  hill(); const g = c.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, '#c2a472'); g.addColorStop(1, '#9a7a4a'); c.fillStyle = g; c.fill(); ink(c, 2.4);
  c.save(); hill(); c.clip(); c.fillStyle = 'rgba(60,40,20,0.25)'; c.beginPath(); c.moveTo(6, -58); c.quadraticCurveTo(30, -26, 64, 0); c.lineTo(10, 0); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,240,200,0.25)'; c.beginPath(); c.moveTo(-26, -46); c.quadraticCurveTo(-14, -66, 2, -58); c.quadraticCurveTo(-12, -40, -20, -20); c.closePath(); c.fill();
  const R = rng(o.seed || 7); c.fillStyle = 'rgba(110,100,60,0.5)'; for (let i = 0; i < 18; i++) { c.beginPath(); circ(c, -50 + R() * 100, -R() * 40, 1 + R() * 1.6); c.fill(); }
  c.restore();
  for (const [bx, by] of [[-30, -2], [26, -4]]) W.rock(c, bx, by, 6, bx + 50);
  c.restore();
};
// a Mediterranean galley: long low hull, a bank of oars and a square sail
PROP.galley = function (c, x, y, s, t, o = {}) {
  const bob = Math.sin(t * 1.6 + x * 0.1) * 1.5, dir = o.dir || 1;
  c.save(); c.translate(x, y + bob); c.scale(s * dir, s);
  for (let i = 0; i < 9; i++) { const ox = -36 + i * 9, sw = Math.sin(t * 3 + i * 0.4) * 5; c.beginPath(); c.moveTo(ox, -6); c.lineTo(ox - 4 + sw, 8); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.2; c.strokeStyle = PAL.woodL; c.stroke(); }
  const hull = () => { c.beginPath(); c.moveTo(-52, -10); c.quadraticCurveTo(-44, 2, -20, 2); c.lineTo(36, 2); c.quadraticCurveTo(52, 0, 62, -14); c.lineTo(50, -10); c.lineTo(-44, -10); c.closePath(); };
  hull(); c.fillStyle = '#6b4a2a'; c.fill(); ink(c, 2.4);
  c.fillStyle = o.col || '#c8372d'; c.fillRect(-44, -10, 94, 3);
  c.beginPath(); c.moveTo(4, -10); c.lineTo(4, -66); ink(c, 3); c.strokeStyle = PAL.woodD; c.lineWidth = 1.6; c.stroke();
  const sail = () => { c.beginPath(); c.moveTo(-16, -60); c.quadraticCurveTo(4, -63, 24, -60); c.quadraticCurveTo(28, -40, 24, -22); c.quadraticCurveTo(4, -19, -16, -22); c.quadraticCurveTo(-12, -40, -16, -60); c.closePath(); };
  sail(); c.fillStyle = '#f2ead6'; c.fill(); ink(c, 2.2);
  if (o.arms) { c.save(); sail(); c.clip(); HER.paint(c, o.arms, -16, -62, 40, 42, { detail: true }); c.restore(); sail(); ink(c, 2.2); }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 54 * s * dir, y + 4 * s); c.quadraticCurveTo(x, y + 8 * s, x + 62 * s * dir, y + 3 * s); c.stroke();
};
// the True Cross, carried into battle on a tall pole
PROP.trueCross = function (c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -80); ink(c, 4.5); c.strokeStyle = PAL.woodD; c.lineWidth = 2.4; c.stroke();
  const g = c.createLinearGradient(-10, -110, 10, -80); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#c8901c');
  c.beginPath(); c.rect(-3.5, -112, 7, 34); c.rect(-13, -102, 26, 7); c.fillStyle = g; c.fill(); ink(c, 2);
  c.fillStyle = '#b8312a'; for (const [px, py] of [[0, -98.5], [-9, -98.5], [9, -98.5], [0, -107]]) { c.beginPath(); circ(c, px, py, 1.6); c.fill(); }
  const gl = 0.25 + 0.15 * Math.sin(t * 2); const rg = c.createRadialGradient(0, -98, 2, 0, -98, 30); rg.addColorStop(0, `rgba(255,240,170,${gl})`); rg.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = rg; c.beginPath(); circ(c, 0, -98, 30); c.fill();
  c.restore();
};

/* ---------- story skies ---------- */
SKIES.desert = { stops: ['#5f9fd6', '#a9d0ea', '#f4e6c2'], sun: [0.72, 0.18, '255,248,220'], clouds: 'white' };
SKIES.haze = { stops: ['#6a4a42', '#c07a4a', '#f0c07a'], sun: [0.3, 0.3, '255,210,140'], clouds: 'dark' };
SKIES.sunset = { stops: ['#3a3a7a', '#e0784a', '#ffd08a'], sun: [0.5, 0.56, '255,220,150'], clouds: 'pink' };

/* ---------- named story scenes ---------- */
// Hattin: the Horns against a smoky sky, fires in the grass, the Franks huddled on the slope, the True Cross
STORY.hattin = function (c, x, y, w, h, t) {
  const k = h / 330;
  skyPaint(c, x, y, w, h, 'haze', t);
  c.fillStyle = 'rgba(80,110,140,0.55)'; c.beginPath(); ell(c, x + w * 0.9, y + h * 0.5, w * 0.22, h * 0.035); c.fill();
  PROP.horns(c, x + w * 0.46, y + h * 0.56, 1.25 * k, t);
  RTW.dryGround(c, x, y + h * 0.56, w, h * 0.44, 'sand', 5);
  c.fillStyle = 'rgba(120,70,30,0.18)'; c.fillRect(x, y + h * 0.56, w, h * 0.44);
  for (const [fx, fy, sc] of [[0.08, 0.66, 0.9], [0.9, 0.7, 1], [0.18, 0.93, 1.2], [0.76, 0.96, 1.1]]) PROP.fire(c, x + w * fx, y + h * fy, sc * k, t + fx * 5);
  const U = [['sergeant', 'red', 0.3, 0.64, 26, 'idle', 1, 'front', 0.2], ['templar', 'red', 0.4, 0.62, 24, 'idle', 1, 'front', 0.5], ['sword', 'red', 0.5, 0.645, 26, 'idle', -1, 'front', 0.1], ['crossbow', 'red', 0.6, 0.63, 26, 'idle', -1, 'front', 0.7],
    ['horseArcher', 'blue', 0.14, 0.86, 38, 'attack', 1, 'side', 0], ['horseArcher', 'blue', 0.84, 0.9, 38, 'attack', -1, 'side', 0.5], ['hero_saladin', 'blue', 0.52, 0.95, 44, 'idle', -1, 'back', 0]];
  PROP.trueCross(c, x + w * 0.455, y + h * 0.64, 0.55 * k, t);
  U.sort((a, b) => a[3] - b[3]).forEach(([ty, tm, fx, fy, sz, an, f, view, ph]) => { const def = RTW.TROOPS[ty]; RTW.drawTroop(c, { type: ty, team: tm, x: x + w * fx, y: y + h * fy, size: sz * k * 1.35 * (def.mounted ? 0.8 : 1), view, facing: f, anim: an, t: t + ph }); });
  for (let i = 0; i < 8; i++) smokePuffs(c, x + w * (0.05 + i * 0.13), y + h * 0.7, k * 2.2, t * 0.8 + i * 0.37, 3, 'rgba(120,110,100,');
  c.fillStyle = 'rgba(150,120,90,0.18)'; c.fillRect(x, y, w, h);
};
// Jerusalem from the Mount of Olives: the north wall, the Dome of the Rock, the siege engines at work
STORY.jerusalem = function (c, x, y, w, h, t, S) {
  const k = h / 330;
  skyPaint(c, x, y, w, h, S.sky || 'dawn', t);
  c.fillStyle = '#b9a47e'; c.beginPath(); c.moveTo(x, y + h * 0.66); c.quadraticCurveTo(x + w * 0.5, y + h * 0.58, x + w, y + h * 0.64); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill();
  PROP.city(c, x + w * 0.52, y + h * 0.66, 0.95 * k, t, { w: 330, gate: -40, arms: S.arms || 'jerusalem' });
  RTW.dryGround(c, x, y + h * 0.68, w, h * 0.32, 'stone', 9);
  if (S.breach) { c.fillStyle = '#9a8f78'; c.beginPath(); c.moveTo(x + w * 0.64, y + h * 0.68); c.lineTo(x + w * 0.6, y + h * 0.6); c.lineTo(x + w * 0.66, y + h * 0.56); c.lineTo(x + w * 0.72, y + h * 0.6); c.lineTo(x + w * 0.74, y + h * 0.68); c.closePath(); c.fill(); ink(c, 2); smokePuffs(c, x + w * 0.68, y + h * 0.56, k * 1.6, t, 4, 'rgba(210,200,180,'); }
  for (const [fx, fy] of [[0.06, 0.8], [0.95, 0.78], [0.34, 0.97]]) W.tree(c, x + w * fx, y + h * fy, 13 * k, Math.round(fx * 50), 'olive');
  if (S.peace) { for (const [fx, fy] of [[0.18, 0.9], [0.72, 0.93]]) W.tree(c, x + w * fx, y + h * fy, 15 * k, Math.round(fx * 70), 'olive'); return; }
  PROP.mangonel(c, x + w * 0.16, y + h * 0.9, 1.1 * k, t, { dir: 1 });
  PROP.mangonel(c, x + w * 0.86, y + h * 0.93, 1.15 * k, t, { dir: -1, phase: 1.4 });
  const U = [['spearman', 'blue', 0.3, 0.86, 38, 'idle', 1, 'back', 0.2], ['saracen', 'blue', 0.44, 0.9, 40, 'idle', 1, 'back', 0.6], ['hero_saladin', 'blue', 0.58, 0.94, 44, 'idle', 1, 'back', 0, 'hero'], ['horseArcher', 'blue', 0.7, 0.88, 40, 'idle', -1, 'side', 0.3]];
  U.sort((a, b) => a[3] - b[3]).forEach(([ty, tm, fx, fy, sz, an, f, view, ph, hero]) => { const def = RTW.TROOPS[ty], z = sz * k * 1.35 * (def.mounted ? 0.8 : 1); if (hero) heroRing(c, x + w * fx, y + h * fy, z * 0.75, tm, t); RTW.drawTroop(c, { type: ty, team: tm, x: x + w * fx, y: y + h * fy, size: z, view, facing: f, anim: an, t: t + ph }); });
};
// Jaffa: Richard's galleys run onto the beach below the town
STORY.jaffa = function (c, x, y, w, h, t) {
  const k = h / 330;
  skyPaint(c, x, y, w, h, 'sunset', t);
  c.fillStyle = '#4f8fb0'; c.fillRect(x, y + h * 0.5, w, h * 0.5);
  c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1.4; const R = rng(4); for (let i = 0; i < 30; i++) { const px = x + R() * w * 0.7, py = y + h * (0.54 + R() * 0.4), q = 6 + R() * 8, ph = Math.sin(t + i) * 2; c.beginPath(); c.moveTo(px + ph, py); c.quadraticCurveTo(px + q / 2 + ph, py - 3, px + q + ph, py); c.stroke(); }
  // the beach and the town on its hill
  c.fillStyle = '#e8d3a0'; c.beginPath(); c.moveTo(x + w * 0.52, y + h); c.quadraticCurveTo(x + w * 0.6, y + h * 0.7, x + w * 0.66, y + h * 0.56); c.lineTo(x + w, y + h * 0.5); c.lineTo(x + w, y + h); c.closePath(); c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  c.fillStyle = '#c9ae7a'; c.beginPath(); c.moveTo(x + w * 0.64, y + h * 0.56); c.quadraticCurveTo(x + w * 0.8, y + h * 0.36, x + w, y + h * 0.4); c.lineTo(x + w, y + h * 0.56); c.closePath(); c.fill(); ink(c, 2);
  PROP.walls(c, x + w * 0.86, y + h * 0.44, 0.5 * k, t, { w: 200, towers: [-80, 0, 80], gate: -40, arms: 'ayyubid' });
  PROP.palm(c, x + w * 0.72, y + h * 0.62, 0.9 * k, t, { seed: 3 }); PROP.palm(c, x + w * 0.95, y + h * 0.66, 1 * k, t, { seed: 8 });
  PROP.galley(c, x + w * 0.2, y + h * 0.66, 0.9 * k, t, { arms: 'england', dir: 1 });
  PROP.galley(c, x + w * 0.38, y + h * 0.8, 1.05 * k, t, { arms: 'england', dir: 1, col: '#f2c22e' });
  const U = [['hero_richard', 'red', 0.6, 0.9, 44, 'walk', 1, 'side', 0, 'hero'], ['crossbow', 'red', 0.52, 0.94, 38, 'walk', 1, 'side', 0.3], ['sergeant', 'red', 0.68, 0.96, 38, 'walk', 1, 'side', 0.6]];
  U.sort((a, b) => a[3] - b[3]).forEach(([ty, tm, fx, fy, sz, an, f, view, ph, hero]) => { const def = RTW.TROOPS[ty], z = sz * k * 1.35 * (def.mounted ? 0.8 : 1); if (hero) heroRing(c, x + w * fx, y + h * fy, z * 0.75, tm, t); RTW.drawTroop(c, { type: ty, team: tm, x: x + w * fx, y: y + h * fy, size: z, view, facing: f, anim: an, t: t + ph }); });
};

/* ===== src/art/23-sea.js ===== */
/* Roll to War: the sea (campaign 3, Admiral Yi) — ship busts for cards, ships as story props, Korean villages,
   sea battlefields with shores and islands, naval effects (cannonballs, fire arrows, splashes, muzzle smoke),
   the harbour shore above a sea maze, and the sea results backdrop. */

/* ---------- ship bust: a ship in profile on a team-coloured card ---------- */
RTW.shipBust = function (c, x, y, w, h, type, team = 'blue', t = 0, o = {}) {
  const tm = TEAMS[team] || TEAMS.blue;
  c.save(); c.beginPath(); rr(c, x, y, w, h, o.r == null ? Math.min(w, h) * 0.16 : o.r); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, tm.light); g.addColorStop(1, tm.dark); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.globalAlpha = 0.16; c.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x + w / 2, y + h * 1.1); const a = -Math.PI / 2 + (i - 2.5) * 0.32; c.lineTo(x + w / 2 + Math.cos(a - 0.08) * h * 2, y + h * 1.1 + Math.sin(a - 0.08) * h * 2); c.lineTo(x + w / 2 + Math.cos(a + 0.08) * h * 2, y + h * 1.1 + Math.sin(a + 0.08) * h * 2); c.closePath(); c.fill(); }
  c.globalAlpha = 1;
  // a band of sea
  c.fillStyle = 'rgba(40,110,150,0.55)'; c.fillRect(x, y + h * 0.74, w, h);
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = Math.max(1, h * 0.03); c.beginPath(); c.moveTo(x, y + h * 0.74); for (let k = 0; k <= 6; k++) c.quadraticCurveTo(x + (k + 0.5) * w / 6, y + h * (0.74 + (k % 2 ? 0.03 : -0.03)), x + (k + 1) * w / 6, y + h * 0.74); c.stroke();
  const def = RTW.SHIPS[type] || {}, big = (def.len || 80) / 100;
  RTW.drawShip(c, { type, team, x: x + w * 0.52, y: y + h * 0.8, size: w * (0.62 + 0.36 * big) * (o.zoom || 1), heading: 0, cam: SHIPCAM.profile, t, row: false, water: false, detail: w > 60 ? 2 : 1, mon: o.mon, bob: 0 });
  c.restore();
};

/* ---------- story props ---------- */
// a ship in a story picture: o = { type, team, heading, burn, sink, roll, moving, row, firing, smoke, mon, cam }
PROP.ship = function (c, x, y, s, t, o = {}) {
  RTW.drawShip(c, { type: o.type || 'panokseon', team: o.team || 'blue', x, y, size: 64 * s, heading: o.heading != null ? o.heading : 0, t: t + (o.ph || 0), moving: o.moving !== false && !o.sink, row: o.row !== false && !o.sink, burn: o.burn, sink: o.sink, roll: o.roll, firing: o.firing, smoke: o.smoke, mon: o.mon, cam: o.cam ? SHIPCAM[o.cam] : undefined, detail: 2 });
};
// a Korean house: whitewashed walls under a thatched (or tiled) roof; o.fire sets it burning
PROP.hut = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-18, -16, 36, 16); c.fillStyle = '#efe6d2'; c.fill(); ink(c, 2);
  c.fillStyle = '#6b4a2a'; c.fillRect(-18, -16, 3, 16); c.fillRect(15, -16, 3, 16); c.fillRect(-4, -12, 8, 12);
  c.beginPath(); c.moveTo(-24, -14); c.quadraticCurveTo(-20, -30, 0, -32); c.quadraticCurveTo(20, -30, 24, -14); c.quadraticCurveTo(0, -18, -24, -14); c.closePath();
  c.fillStyle = o.tiles ? '#4b5058' : '#c9a15a'; c.fill(); ink(c, 2);
  c.strokeStyle = o.tiles ? 'rgba(255,255,255,0.2)' : 'rgba(120,80,30,0.45)'; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 8, -30 + Math.abs(i) * 2); c.lineTo(i * 10, -16); c.stroke(); }
  c.restore();
  if (o.fire) { PROP.fire(c, x + 2 * s, y - 20 * s, s * 0.8, t + x * 0.01); }
};
// a rocky shore island in a story picture (x, y = the waterline centre)
PROP.isle = function (c, x, y, s, t, o = {}) {
  const w = (o.w || 90) * s, h = (o.h || 40) * s, R = rng(o.seed || Math.round(x));
  c.save();
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, x, y, w * 0.56, h * 0.16); c.fill();
  c.beginPath(); c.moveTo(x - w / 2, y); c.bezierCurveTo(x - w * 0.4, y - h * 0.7, x - w * 0.15, y - h, x, y - h); c.bezierCurveTo(x + w * 0.2, y - h, x + w * 0.42, y - h * 0.6, x + w / 2, y); c.closePath();
  c.fillStyle = o.dark ? '#3c4a3a' : '#6f8f55'; c.fill(); ink(c, 2);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(x, y - h); c.bezierCurveTo(x + w * 0.2, y - h, x + w * 0.42, y - h * 0.6, x + w / 2, y); c.lineTo(x + w * 0.1, y); c.closePath(); c.fill();
  for (let i = 0; i < (o.trees == null ? 4 : o.trees); i++) W.pine(c, x - w * 0.3 + R() * w * 0.6, y - h * (0.35 + R() * 0.45), 7 * s, i + 3);
  c.restore();
};

/* ---------- naval effects (battle scene) ---------- */
RTW.cannonball = function (c, x, y) { c.fillStyle = INK; c.beginPath(); circ(c, x, y, 2.6); c.fill(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); circ(c, x - 0.8, y - 0.8, 0.9); c.fill(); };
RTW.fireArrow = function (c, x, y, ang) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = 'rgba(255,190,70,0.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-3, 0); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, 0); c.lineTo(5, 0); c.stroke();
  c.fillStyle = '#ffcf5a'; c.beginPath(); circ(c, 5, 0, 2.2); c.fill(); c.fillStyle = '#e8541f'; c.beginPath(); circ(c, 6, 0, 1.2); c.fill();
  c.restore();
};
RTW.bullet = function (c, x, y) { c.fillStyle = '#3a3530'; c.beginPath(); circ(c, x, y, 1.4); c.fill(); };
// white splash where a shot falls into the sea (k: 0..1)
RTW.splash = function (c, x, y, k, big) {
  const s = big ? 1.3 : 1;
  c.save(); c.globalAlpha = 1 - k;
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.5; c.beginPath(); ell(c, x, y, (4 + k * 10) * s, (1.6 + k * 4) * s); c.stroke();
  c.fillStyle = '#f4fbff';
  for (let i = -1; i <= 1; i++) { const hh = (1 - Math.abs(i) * 0.4) * Math.sin(Math.PI * Math.min(1, k * 1.6)) * 12 * s; c.beginPath(); ell(c, x + i * 3 * s, y - hh / 2, 1.6 * s, hh / 2 + 0.5); c.fill(); }
  c.restore();
};
// splinters and a flash where a shot strikes a hull
RTW.splinters = function (c, x, y, k) {
  c.save(); c.globalAlpha = 1 - k;
  c.fillStyle = '#ffe9a8'; c.beginPath(); circ(c, x, y, 5 * (1 - k) + 1); c.fill();
  c.strokeStyle = '#6b4a2a'; c.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r0 = 3 + k * 6, r1 = r0 + 4; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 - k * 4); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 - k * 4); c.stroke(); }
  c.restore();
};
// a puff of gun smoke (k: 0..1)
RTW.gunSmoke = function (c, x, y, k, s = 1) {
  c.save(); c.globalAlpha = 0.75 * (1 - k);
  c.fillStyle = '#f2eee6';
  for (let i = 0; i < 3; i++) { c.beginPath(); circ(c, x + (i - 1) * 4 * s * (1 + k), y - k * 10 * s - i * 2, (3 + k * 6) * s); c.fill(); }
  if (k < 0.18) { c.globalAlpha = 1 - k / 0.18; c.fillStyle = '#ffd65a'; c.beginPath(); circ(c, x, y, 4 * s); c.fill(); }
  c.restore();
};
// flames and smoke on a damaged ship (amt 0..1)
RTW.shipFlames = function (c, x, y, size, amt, t, seed, lite) {
  const n = amt > 0.6 ? (lite ? 2 : 3) : amt > 0.3 ? 2 : 1, s = size / 30, puffs = lite ? 1 : 2;
  for (let i = 0; i < n; i++) {
    const px = x + ((((seed * 37 + i * 53) % 17) / 17) - 0.5) * size * 0.5, py = y - 6 * s - (i % 2) * 3 * s;
    const fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2.1 + seed), hgt = (7 + 7 * amt) * s * fl;
    for (let k = 0; k < puffs; k++) { const q = (t * 0.55 + k / puffs + i * 0.21 + seed * 0.07) % 1; c.fillStyle = `rgba(55,50,46,${0.32 * (1 - q)})`; c.beginPath(); circ(c, px + q * 10 * s, py - hgt - q * 26 * s, (3 + q * 7) * s); c.fill(); }
    c.fillStyle = '#e8541f'; c.beginPath(); c.moveTo(px - 3.4 * s, py); c.quadraticCurveTo(px - 4 * s, py - hgt * 0.6, px, py - hgt); c.quadraticCurveTo(px + 4 * s, py - hgt * 0.6, px + 3.4 * s, py); c.closePath(); c.fill();
    c.fillStyle = '#ffc93a'; c.beginPath(); c.moveTo(px - 1.7 * s, py); c.quadraticCurveTo(px - 2 * s, py - hgt * 0.4, px, py - hgt * 0.62); c.quadraticCurveTo(px + 2 * s, py - hgt * 0.4, px + 1.7 * s, py); c.closePath(); c.fill();
  }
};

/* ---------- sea battlefields ---------- */
function seaWater(g, Wd, H, seed, night) {
  g.fillStyle = W.grassPattern(g, 1, night ? 'seaN' : 'sea'); g.fillRect(0, 0, Wd, H);
  const bg = g.createLinearGradient(0, 0, 0, H);
  if (night) { bg.addColorStop(0, 'rgba(10,20,40,0.35)'); bg.addColorStop(1, 'rgba(20,40,70,0.1)'); } else { bg.addColorStop(0, 'rgba(20,70,110,0.18)'); bg.addColorStop(1, 'rgba(120,220,230,0.1)'); }
  g.fillStyle = bg; g.fillRect(0, 0, Wd, H);
  const R = rng(seed);
  g.strokeStyle = night ? 'rgba(170,200,230,0.16)' : 'rgba(255,255,255,0.28)'; g.lineWidth = 1.4;
  for (let i = 0; i < 60; i++) { const x = R() * Wd, y = R() * H, w = 8 + R() * 10; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 4, y - 3, x + w / 2, y); g.quadraticCurveTo(x + w * 0.75, y + 3, x + w, y); g.stroke(); }
}
// a stretch of coast along one edge: side 'top' | 'left' | 'right'; pts = the shoreline, land beyond it
function seaCoast(g, pts, side, Wd, H, o = {}) {
  const close = () => { if (side === 'top') { g.lineTo(Wd + 40, -40); g.lineTo(-40, -40); } else if (side === 'left') { g.lineTo(-40, H + 40); g.lineTo(-40, -40); } else { g.lineTo(Wd + 40, H + 40); g.lineTo(Wd + 40, -40); } g.closePath(); };
  const path = (grow) => { g.beginPath(); pts.forEach(([x, y], i) => { const xx = x + (side === 'left' ? -grow : side === 'right' ? grow : 0), yy = y - (side === 'top' ? grow : 0); if (i) g.lineTo(xx, yy); else g.moveTo(xx, yy); }); close(); };
  if (!o.night) { path(-18); g.fillStyle = 'rgba(140,235,230,0.22)'; g.fill(); path(-11); g.fillStyle = 'rgba(160,240,235,0.25)'; g.fill(); }
  path(-6); g.fillStyle = o.night ? 'rgba(160,190,220,0.18)' : 'rgba(255,255,255,0.5)'; g.fill();
  path(0); g.fillStyle = o.night ? '#6d6450' : '#f0dba6'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
  path(7); g.fillStyle = o.rock ? (o.night ? '#3e4234' : '#8a8a72') : o.night ? '#2e4430' : W.grassPattern(g, 1); g.fill();
  if (o.rock) { g.save(); path(7); g.clip(); g.strokeStyle = 'rgba(40,40,30,0.35)'; g.lineWidth = 1.5; const R = rng(o.seed || 4); for (let i = 0; i < 30; i++) { const x = R() * Wd, y = R() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + R() * 8, y - 4 - R() * 6); g.lineTo(x + 14 + R() * 8, y); g.stroke(); } g.restore(); }
}
// an island inside the field
function seaIsle(g, pts, o = {}) {
  if (!o.night) { g.beginPath(); smoothPath(g, pts, true); g.lineWidth = 30; g.strokeStyle = 'rgba(140,235,230,0.22)'; g.stroke(); g.lineWidth = 18; g.strokeStyle = 'rgba(160,240,235,0.25)'; g.stroke(); }
  g.beginPath(); smoothPath(g, pts, true); g.lineWidth = 9; g.strokeStyle = o.night ? 'rgba(160,190,220,0.18)' : 'rgba(255,255,255,0.5)'; g.stroke();
  g.fillStyle = o.night ? '#6d6450' : '#f0dba6'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  g.save(); g.beginPath(); smoothPath(g, pts, true); g.clip();
  g.fillStyle = o.night ? '#2e4430' : W.grassPattern(g, 1); g.beginPath(); smoothPath(g, pts.map(([x, y]) => [cx + (x - cx) * 0.78, cy + (y - cy) * 0.78]), true); g.fill();
  g.restore();
  if (o.trees !== false) { const R = rng(Math.round(cx + cy)); for (let i = 0; i < (o.trees || 3); i++) W.pine(g, cx + (R() - 0.5) * 30, cy + (R() - 0.3) * 20, 9, i + 7); }
}
RTW.seaCoast = seaCoast; RTW.seaIsle = seaIsle; RTW.seaWater = seaWater;
// per-battle sea dressing, used by the battle scene's BATTLE_DECOR (base = the whole field, anim = every frame).
// land: the shapes ships cannot sail over, in field coordinates (390 x 572, top = the battlefield top); the painter
// draws them and the naval simulation keeps every ship off them. top/left/right: a coastline with land beyond it;
// isles: closed shapes.
const SF_W = 390, SF_H = 572;
RTW.SEAFIELDS = {
  okpo: {
    land: {
      top: [[-20, 40], [60, 30], [130, 42], [210, 32], [290, 44], [360, 30], [SF_W + 20, 36]],
      isles: [[[-30, 402], [30, 382], [58, 442], [20, 482], [-30, 472]]],
    },
    base(g, Wd, H) {
      const L = this.land;
      seaWater(g, Wd, H, 21);
      seaCoast(g, L.top, 'top', Wd, H);
      seaIsle(g, L.isles[0], { trees: 2 });
      for (const [x, y, s] of [[40, 20, 0.5], [98, 16, 0.46], [170, 22, 0.5], [236, 16, 0.44], [320, 22, 0.5]]) PROP.hut(g, x, y, s, 0, {});
      for (const [x, y] of [[14, 14], [140, 12], [270, 12], [370, 14]]) W.pine(g, x, y, 8, x);
    },
    anim(c, t) { for (const [x, y, s] of [[98, 13, 0.5], [236, 13, 0.46], [320, 19, 0.44]]) PROP.fire(c, x, y, s, t + x * 0.01); },
  },
  sacheon: {
    land: {
      top: [[-20, 54], [40, 40], [110, 50], [170, 34], [240, 44], [300, 30], [SF_W + 20, 38]],
      isles: [[[SF_W + 30, 300], [SF_W - 34, 318], [SF_W - 50, 380], [SF_W - 20, 430], [SF_W + 30, 440]]],
    },
    base(g, Wd, H) {
      const L = this.land;
      seaWater(g, Wd, H, 23);
      seaCoast(g, L.top, 'top', Wd, H, { rock: true, seed: 8 });
      PROP.castle(g, 300, 24, 0.4, 0, {});
      seaIsle(g, L.isles[0], { trees: 2 });
      for (const [x, y] of [[20, 24], [80, 20], [150, 16], [210, 22]]) W.pine(g, x, y, 9, x + 3);
    },
  },
  hansan: {
    land: {
      isles: [
        [[-30, 30], [40, 20], [66, 64], [48, 116], [8, 140], [-30, 126]],
        [[SF_W - 90, 34], [SF_W - 60, 20], [SF_W - 40, 44], [SF_W - 70, 58]],
        [[SF_W + 30, 500], [SF_W - 50, 516], [SF_W - 84, 560], [SF_W - 70, SF_H + 30], [SF_W + 30, SF_H + 30]],
      ],
    },
    base(g, Wd, H) {
      const L = this.land;
      seaWater(g, Wd, H, 12);
      seaIsle(g, L.isles[0], { trees: 3 });
      seaIsle(g, L.isles[1], { trees: 1 });
      seaIsle(g, L.isles[2], { trees: 2 });
    },
  },
  myeongnyang: {
    // a narrow strait between Jindo (left) and the mainland (right); the channel pinches in the middle
    land: {
      left: [[44, -30], [40, 60], [28, 150], [56, 250], [74, 330], [52, 420], [30, 520], [44, SF_H + 30]],
      right: [[SF_W - 44, -30], [SF_W - 36, 80], [SF_W - 56, 170], [SF_W - 78, 280], [SF_W - 64, 380], [SF_W - 36, 470], [SF_W - 48, 560], [SF_W - 32, SF_H + 30]],
    },
    base(g, Wd, H) {
      const L = this.land;
      seaWater(g, Wd, H, 31);
      seaCoast(g, L.left, 'left', Wd, H, { rock: true, seed: 3 });
      seaCoast(g, L.right, 'right', Wd, H, { rock: true, seed: 6 });
      for (const [x, y] of [[14, 80], [12, 200], [16, 330], [12, 470], [Wd - 14, 120], [Wd - 16, 240], [Wd - 18, 400], [Wd - 12, 520]]) W.pine(g, x, y, 9, x + y);
    },
    // the current streams down the strait until the tide turns, then runs back up
    anim(c, t, sim) {
      const up = sim && sim.twState && sim.twState.turned, sp = up ? -70 : 90;
      c.save(); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        const x = 100 + ((i * 53) % 190), y = ((i * 97 + t * sp) % 620 + 620) % 620 + 20, len = 16 + (i % 3) * 6, dir = up ? -1 : 1;
        c.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(i + t));
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(y * 0.02) * 3, y + dir * len); c.stroke();
        c.beginPath(); c.moveTo(x - 3, y + dir * (len - 5)); c.lineTo(x, y + dir * len); c.lineTo(x + 3, y + dir * (len - 5)); c.stroke();
      }
      c.restore();
    },
  },
  noryang: {
    night: true,
    land: {
      top: [[-20, 60], [50, 44], [120, 56], [200, 40], [280, 52], [340, 38], [SF_W + 20, 46]],
      right: [[SF_W + 20, SF_H - 64], [SF_W - 30, SF_H - 44], [SF_W - 46, SF_H - 4], [SF_W - 44, SF_H + 30]],
    },
    base(g, Wd, H) {
      const L = this.land;
      seaWater(g, Wd, H, 44, true);
      seaCoast(g, L.top, 'top', Wd, H, { night: true });
      seaCoast(g, L.right, 'right', Wd, H, { night: true });
      // moonlight on the water
      const mg = g.createRadialGradient(290, 150, 4, 290, 150, 150); mg.addColorStop(0, 'rgba(220,230,255,0.28)'); mg.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = mg; g.fillRect(0, 0, Wd, H);
      g.strokeStyle = 'rgba(235,240,255,0.35)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = 150 + i * 12, w = 30 - i * 1.5; g.beginPath(); g.moveTo(290 - w, y); g.lineTo(290 + w, y); g.stroke(); }
      for (const [x, y] of [[30, 26], [120, 30], [210, 20], [300, 24]]) W.pine(g, x, y, 9, x);
    },
  },
};

/* ---------- the sea maze: the harbour shore above the maze, sandbanks, the fleet entrance ---------- */
RTW.seaShore = function (g, Wd, y0, y1, seed, night) {
  const R = rng(seed);
  g.fillStyle = night ? '#6d6450' : '#ecd7a2'; g.fillRect(0, y0, Wd, y1 - y0);
  g.fillStyle = night ? '#2e4430' : '#6aa84f'; g.beginPath(); g.moveTo(0, y0); g.lineTo(Wd, y0); g.lineTo(Wd, y0 + (y1 - y0) * 0.42);
  for (let x = Wd; x >= 0; x -= 20) g.lineTo(x, y0 + (y1 - y0) * (0.42 + 0.06 * Math.sin(x * 0.07 + seed)));
  g.closePath(); g.fill();
  for (let i = 0; i < 9; i++) { const x = -6 + i * 50 + (i % 2) * 12; if (i % 3 === 1) PROP.hut(g, x, y0 + 30, 0.55, 0, { tiles: i % 2 === 0 }); else W.pine(g, x, y0 + 30 - (i % 2) * 5, 13 + (i % 3) * 2, i + seed); }
  g.fillStyle = night ? 'rgba(160,190,220,0.2)' : 'rgba(255,255,255,0.45)'; g.fillRect(0, y1 - 3, Wd, 3);
  void R;
};
// a sandbank or rocky shallows on a non-sailable edge cell
RTW.sandbank = function (g, x, y, T, seed) {
  const R = rng(seed);
  g.fillStyle = 'rgba(140,235,230,0.3)'; g.beginPath(); ell(g, x + T / 2, y + T * 0.55, T * 0.62, T * 0.46); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); ell(g, x + T / 2, y + T * 0.55, T * 0.52, T * 0.36); g.fill();
  g.fillStyle = '#f0d9a2'; g.beginPath(); ell(g, x + T / 2, y + T * 0.55, T * 0.44, T * 0.28); g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(35,23,15,0.7)'; g.stroke();
  if (R() < 0.6) W.rock(g, x + T * (0.3 + R() * 0.4), y + T * 0.6, T * 0.1, seed);
};
// a multiplier gate at sea: a glowing band between two buoys (span = cells wide; v = across a vertical channel)
RTW.seaGate = function (c, cx, cy, T, mult, t, o = {}) {
  const col = mult >= 3 ? PAL.gate3 : PAL.gate2, dk = mult >= 3 ? PAL.gate3D : PAL.gate2D, span = o.span || 1, half = (T * span) / 2 - T * 0.04;
  c.save(); c.translate(cx, cy + (o.v ? 0 : T * 0.12)); if (o.v) c.rotate(Math.PI / 2);
  const band = c.createLinearGradient(0, -T * 0.2, 0, T * 0.2); band.addColorStop(0, rgba(col, 0)); band.addColorStop(0.5, rgba(col, 0.55 + 0.2 * Math.sin(t * 5) + (o.flash || 0) * 0.4)); band.addColorStop(1, rgba(col, 0));
  c.fillStyle = band; c.fillRect(-half, -T * 0.2, half * 2, T * 0.4);
  for (const sx of [-1, 1]) {
    const bx = sx * half, by = Math.sin(t * 2 + sx) * T * 0.03;
    c.save(); if (o.v) { c.translate(bx, by); c.rotate(-Math.PI / 2); c.translate(-bx, -by); }
    c.beginPath(); ell(c, bx, by, T * 0.12, T * 0.07); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
    c.beginPath(); c.moveTo(bx - T * 0.09, by); c.lineTo(bx - T * 0.06, by - T * 0.28); c.lineTo(bx + T * 0.06, by - T * 0.28); c.lineTo(bx + T * 0.09, by); c.closePath(); c.lineWidth = Math.max(1.2, T * 0.04); c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill();
    c.fillStyle = '#fff'; c.fillRect(bx - T * 0.07, by - T * 0.17, T * 0.14, T * 0.05);
    c.restore();
  }
  if (o.v) c.rotate(-Math.PI / 2);
  const lift = o.v ? 0 : T * 0.52;
  c.beginPath(); rr(c, -T * 0.26, -lift - (o.v ? T * 0.15 : 0), T * 0.52, T * 0.3, T * 0.1); c.lineWidth = Math.max(1.4, T * 0.045); c.strokeStyle = INK; c.stroke(); c.fillStyle = dk; c.fill();
  text(c, '×' + mult, 0, -lift + T * 0.15 - (o.v ? T * 0.15 : 0), { size: T * 0.22, weight: 700, fill: '#fff' });
  c.restore();
};
// the fleet enters the maze between two lighthouse posts
RTW.seaEntrance = function (c, cx, by, w, t) {
  c.save();
  for (const sx of [-1, 1]) {
    const px = cx + sx * w * 0.52;
    W.rock(c, px, by + 10, 13, 3 + sx);
    c.beginPath(); c.rect(px - 6, by - 30, 12, 36); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#e8e0cf'; c.fill();
    c.fillStyle = '#c8372d'; c.fillRect(px - 6, by - 24, 12, 6); c.fillRect(px - 6, by - 10, 12, 6);
    c.beginPath(); circ(c, px, by - 34, 6); c.lineWidth = 2.5; c.stroke(); c.fillStyle = `rgba(255,229,138,${0.75 + 0.25 * Math.sin(t * 3 + sx)})`; c.fill();
  }
  c.restore();
};

/* ---------- sea results backdrop ---------- */
RTW.seaResultsBackdrop = function (c, Wd, Ht, win, night) {
  const hz = Ht * 0.47, g = c.createLinearGradient(0, 0, 0, hz);
  if (night) { g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#3a4a78'); } else if (win) { g.addColorStop(0, '#f7c56b'); g.addColorStop(1, '#f3dca0'); } else { g.addColorStop(0, '#5b4a78'); g.addColorStop(1, '#c98a6c'); }
  c.fillStyle = g; c.fillRect(0, 0, Wd, hz + 2);
  c.fillStyle = night ? '#23375a' : win ? '#7d9aa2' : '#5a6478';
  c.beginPath(); c.moveTo(0, hz); c.quadraticCurveTo(Wd * 0.2, hz - 30, Wd * 0.42, hz - 8); c.quadraticCurveTo(Wd * 0.7, hz - 36, Wd, hz - 12); c.lineTo(Wd, hz + 2); c.lineTo(0, hz + 2); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.rect(0, hz, Wd, Ht - hz); c.clip(); c.translate(0, hz); seaWater(c, Wd, Ht - hz, 5, night); c.restore();
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(0, hz - 1, Wd, 2);
  if (!win) { c.fillStyle = 'rgba(40,20,50,0.28)'; c.fillRect(0, 0, Wd, Ht); }
};

/* ---------- named sea scenes for the story ---------- */
// Hansan Island from above: the Crane Wing closing around the Japanese fleet
STORY.crane = function (c, x, y, w, h, t) {
  c.fillStyle = W.grassPattern(c, 1, 'sea'); c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1.3; const R = rng(4);
  for (let i = 0; i < 60; i++) { const px = x + R() * w, py = y + R() * h; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 4, py - 3, px + 8, py); c.quadraticCurveTo(px + 12, py + 3, px + 16, py); c.stroke(); }
  seaIsle(c, [[x + w - 70, y + h - 40], [x + w - 20, y + h - 70], [x + w + 20, y + h - 30], [x + w - 10, y + h + 10], [x + w - 70, y + h + 10]], { trees: 3 });
  const S = [], k = h / 330;
  const cx = x + w / 2, cy = y + h * 0.42;
  for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI, rx = w * 0.4, ry = h * 0.36; S.push({ type: i === 5 ? 'flagship' : i % 3 === 1 ? 'turtle' : 'panokseon', team: 'blue', x: cx + Math.cos(a) * rx, y: cy - Math.sin(a) * ry + h * 0.12, h: a + Math.PI / 2 + Math.PI, size: 40 * k }); }
  for (let i = 0; i < 7; i++) S.push({ type: i % 3 === 0 ? 'atakebune' : i % 3 === 1 ? 'sekibune' : 'kobaya', team: 'red', x: cx + ((i % 3) - 1) * 44 * k + (i > 3 ? 20 : 0), y: y + h * (0.18 + Math.floor(i / 3) * 0.14), h: Math.PI / 2, size: (i % 3 === 0 ? 42 : 34) * k, burn: i === 4 ? 0.6 : 0 });
  S.sort((a, b) => a.y - b.y).forEach((s, i) => RTW.drawShip(c, { type: s.type, team: s.team, x: s.x, y: s.y, size: s.size, heading: s.h, t: t + i * 0.3, moving: true, row: true, burn: s.burn, cam: SHIPCAM.high, detail: 1, mon: 'wakisaka' }));
  // cannon smoke drifting over the wings
  for (let i = 0; i < 5; i++) { const q = (t * 0.4 + i / 5) % 1; c.fillStyle = `rgba(245,240,230,${0.5 * (1 - q)})`; c.beginPath(); circ(c, x + w * (0.15 + i * 0.17), y + h * (0.55 + (i % 2) * 0.1) - q * 30, 8 + q * 14); c.fill(); }
};
// the Myeongnyang strait: steep hills both sides, the tide roaring through the narrows
STORY.strait = function (c, x, y, w, h, t, S = {}) {
  skyPaint(c, x, y, w, h * 0.62, 'grey', t);
  const hz = y + h * 0.4;
  c.fillStyle = W.grassPattern(c, 1, 'sea'); c.fillRect(x, hz, w, h);
  const wg = c.createLinearGradient(0, hz, 0, y + h); wg.addColorStop(0, 'rgba(200,230,240,0.45)'); wg.addColorStop(0.3, 'rgba(200,230,240,0)'); c.fillStyle = wg; c.fillRect(x, hz, w, h * 0.6);
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.6;
  for (let i = 0; i < 40; i++) { const q = ((t * 0.5 + i / 40) % 1), px = x + w * (0.3 + ((i * 37) % 40) / 100), py = hz + 8 + ((i * 53) % Math.round(h * 0.55)); c.globalAlpha = 0.6 * (1 - Math.abs(q - 0.5) * 2); c.beginPath(); c.moveTo(px - 10 + q * 30, py); c.quadraticCurveTo(px + q * 30, py - 3, px + 10 + q * 30, py); c.stroke(); }
  c.globalAlpha = 1;
  // the two shores
  for (const sd of [-1, 1]) {
    c.beginPath(); const x0 = sd < 0 ? x : x + w;
    c.moveTo(x0, y + h * 0.12);
    c.bezierCurveTo(x0 - sd * w * 0.25, y + h * 0.1, x0 - sd * w * 0.3, hz, x0 - sd * w * (sd < 0 ? 0.33 : 0.3), y + h);
    c.lineTo(x0, y + h); c.closePath(); c.fillStyle = '#5e8a50'; c.fill(); ink(c, 2.5);
    c.save(); c.clip(); c.globalAlpha = 0.55; c.fillStyle = W.grassPattern(c, 1); c.fillRect(x, y, w, h); c.globalAlpha = 1;
    const sg = c.createLinearGradient(x0, 0, x0 - sd * w * 0.32, 0); sg.addColorStop(0, 'rgba(20,40,20,0.3)'); sg.addColorStop(1, 'rgba(20,40,20,0)'); c.fillStyle = sg; c.fillRect(x, y, w, h); c.restore();
    for (let i = 0; i < 5; i++) W.pine(c, x0 - sd * w * (0.05 + i * 0.045), y + h * (0.2 + i * 0.13), 10 * (h / 330), i + (sd < 0 ? 3 : 9));
  }
  const k = h / 330;
  if (S.after) {
    // the tide has turned: the Japanese ships are thrown together and burn; the captains sail up beside the flagship
    for (let i = 0; i < 7; i++) RTW.drawShip(c, { type: i % 3 === 1 ? 'sekibune' : 'atakebune', team: 'red', x: x + w * (0.36 + ((i * 37) % 30) / 100), y: hz + 8 + i * 10 * k, size: (22 + i * 3) * k, heading: Math.PI / 2 + ((i % 3) - 1) * 0.9, t: t + i, moving: false, row: false, detail: 1, mon: 'kurushima', burn: i % 2 ? 0.9 : 0.5, sink: i === 3 ? 6 : 0, roll: i === 3 ? 0.3 : 0 });
    RTW.drawShip(c, { type: 'panokseon', team: 'blue', x: x + w * 0.37, y: y + h * 0.78, size: 46 * k, heading: -Math.PI / 2 + 0.35, t: t + 0.5, moving: true, row: true, detail: 2 });
    RTW.drawShip(c, { type: 'panokseon', team: 'blue', x: x + w * 0.64, y: y + h * 0.8, size: 46 * k, heading: -Math.PI / 2 - 0.3, t: t + 1.1, moving: true, row: true, detail: 2 });
    RTW.drawShip(c, { type: 'flagship', team: 'blue', x: x + w * 0.5, y: y + h * 0.9, size: 64 * k, heading: -Math.PI / 2 + 0.1, t, moving: true, row: true, detail: 2 });
    for (let i = 0; i < 6; i++) { const q = (t * 0.35 + i / 6) % 1; c.fillStyle = `rgba(60,55,50,${0.4 * (1 - q)})`; c.beginPath(); circ(c, x + w * (0.4 + (i % 3) * 0.1), hz + 20 - q * 50 * k, (8 + q * 16) * k); c.fill(); }
    return;
  }
  RTW.drawShip(c, { type: 'flagship', team: 'blue', x: x + w * 0.5, y: y + h * 0.84, size: 64 * k, heading: -Math.PI / 2 + 0.25, t, moving: false, row: true, detail: 2 });
  for (let i = 0; i < 6; i++) RTW.drawShip(c, { type: i % 2 ? 'sekibune' : 'atakebune', team: 'red', x: x + w * (0.4 + (i % 3) * 0.1), y: hz + 10 + i * 12 * k, size: (22 + i * 3) * k, heading: Math.PI / 2 - 0.2 + (i % 3) * 0.2, t: t + i, moving: true, row: true, detail: 1, mon: 'kurushima' });
};


/* ===== src/art/24-medieval2.js ===== */
/* Roll to War: props for the Leper King, Joan of Arc and the Wars of the Roses — towns and houses, a
   treadwheel crane and a builder's yard, the Tourelles, a king's litter, ladders, a running stag, the
   three suns of Mortimer's Cross, a wayside cross and wheat fields. (x, y = base point; s = scale) */

// one house: 'timber' (French or English, half-timbered), 'stone', or 'flat' (a flat-roofed house of the Levant)
PROP.house = function (c, x, y, s, t, o = {}) {
  const w = o.w || 26, h = o.h || 24, style = o.style || 'timber';
  c.save(); c.translate(x, y); c.scale(s, s);
  const wall = style === 'flat' ? (o.col || '#e6dcc4') : style === 'stone' ? '#d6ccb4' : (o.col || '#efe4c8');
  c.beginPath(); c.rect(-w / 2, -h, w, h); c.fillStyle = wall; c.fill(); ink(c, 2);
  if (style === 'timber') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-w / 2, -h * 0.5); c.lineTo(w / 2, -h * 0.5); c.moveTo(-w / 2 + 4, -h); c.lineTo(-w / 2 + 4, 0); c.moveTo(w / 2 - 4, -h); c.lineTo(w / 2 - 4, 0); c.moveTo(-w / 2 + 4, -h * 0.5); c.lineTo(0, -h); c.moveTo(w / 2 - 4, -h * 0.5); c.lineTo(0, -h); c.stroke(); }
  c.fillStyle = '#3a2e22'; c.fillRect(-w * 0.18, -h * 0.36, w * 0.14, h * 0.2); c.fillRect(w * 0.08, -h * 0.36, w * 0.14, h * 0.2);
  if (o.door !== false) { c.fillStyle = '#5a3a22'; c.fillRect(-3, -h * 0.34 + h * 0.34 - 9, 6, 9); }
  if (style !== 'flat') {
    const rh = o.rh || h * 0.8; c.beginPath(); c.moveTo(-w / 2 - 3, -h); c.lineTo(0, -h - rh); c.lineTo(w / 2 + 3, -h); c.closePath(); c.fillStyle = o.roof || '#a0432c'; c.fill(); ink(c, 2);
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.beginPath(); c.moveTo(0, -h - rh); c.lineTo(w / 2 + 3, -h); c.lineTo(2, -h); c.closePath(); c.fill();
  } else { c.fillStyle = shade(wall, -0.12); c.fillRect(-w / 2 - 1, -h - 3, w + 2, 3); }
  c.restore();
};
// a row of houses with a church: style 'france' | 'england' | 'levant'; o.w wide, o.seed for variety
PROP.town = function (c, x, y, s, t, o = {}) {
  const w = o.w || 240, R = rng(o.seed || 5), style = o.style || 'france';
  c.save(); c.translate(x, y); c.scale(s, s);
  const roofs = style === 'england' ? ['#8a5a3a', '#6a6a70', '#a0432c'] : style === 'levant' ? [] : ['#a0432c', '#5a6470', '#b8583a'];
  const n = Math.max(4, Math.round(w / 24));
  if (o.church !== false) {
    const cx = (o.churchAt != null ? o.churchAt : 0.62) * w - w / 2;
    if (style === 'levant') PROP.dome(c, cx, -2, 0.6, t);
    else { c.beginPath(); c.rect(cx - 12, -64, 24, 64); c.fillStyle = '#d6ccb4'; c.fill(); ink(c, 2); c.beginPath(); c.moveTo(cx - 14, -64); c.lineTo(cx, -100); c.lineTo(cx + 14, -64); c.closePath(); c.fillStyle = style === 'england' ? '#6a6a70' : '#5a6470'; c.fill(); ink(c, 2); c.fillStyle = PAL.gold; c.fillRect(cx - 1, -110, 2, 10); c.fillRect(cx - 4, -106, 8, 2); c.fillStyle = '#2a241e'; c.beginPath(); rr(c, cx - 3, -52, 6, 10, 3); c.fill(); }
  }
  for (let i = 0; i < n; i++) {
    const hx = -w / 2 + (i + 0.5) * (w / n) + (R() - 0.5) * 4, hw = w / n + 4, hh = 18 + R() * 14;
    PROP.house(c, hx, -(i % 2) * 3, 1, t, { w: hw, h: hh, style: style === 'levant' ? 'flat' : R() < 0.25 ? 'stone' : 'timber', roof: roofs.length ? roofs[(R() * roofs.length) | 0] : null, col: style === 'levant' ? (R() < 0.5 ? '#e6dcc4' : '#d6c8a8') : R() < 0.5 ? '#efe4c8' : '#e8d8b4', door: R() < 0.6 });
  }
  c.restore();
};
// a treadwheel crane lifting a block (the Templars' builders at Jacob's Ford)
PROP.crane = function (c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
  const beam = (x0, y0, x1, y1, w = 5) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = w + 2.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = w; c.strokeStyle = PAL.woodL; c.stroke(); };
  beam(-10, 0, 0, -70); beam(10, 0, 0, -70); beam(0, -66, 40, -80, 4.5);
  c.save(); c.translate(-18, -20); c.rotate(t * 0.8);
  c.beginPath(); circ(c, 0, 0, 18); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke(); c.lineWidth = 2; c.strokeStyle = PAL.wood; c.stroke();
  for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 18); c.lineWidth = 1.6; c.strokeStyle = PAL.woodD; c.stroke(); }
  c.restore();
  const ly = -40 + Math.sin(t * 0.8) * 8;
  c.beginPath(); c.moveTo(40, -80); c.lineTo(40, ly); c.lineWidth = 1.2; c.strokeStyle = '#4a3a2a'; c.stroke();
  c.beginPath(); c.rect(33, ly, 14, 10); c.fillStyle = '#d9c9a6'; c.fill(); ink(c, 1.6);
  c.restore();
};
PROP.stones = function (c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [bx, by] of [[-16, 0], [0, 0], [16, 0], [-8, -10], [8, -10], [0, -20]]) { c.beginPath(); c.rect(bx - 8, by - 10, 16, 10); c.fillStyle = by === -20 ? '#e2d4b4' : '#d9c9a6'; c.fill(); ink(c, 1.6); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(bx + 2, by - 10, 6, 10); }
  c.restore();
};
PROP.timber = function (c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [by, dx] of [[0, 0], [-7, 3], [-14, -2]]) { c.beginPath(); rr(c, -26 + dx, by - 7, 52, 7, 3); c.fillStyle = by === -14 ? PAL.woodL : PAL.wood; c.fill(); ink(c, 1.6); c.beginPath(); ell(c, 26 + dx, by - 3.5, 3, 3.5); c.fillStyle = '#e2c49a'; c.fill(); ink(c, 1.2); }
  c.restore();
};
// the Tourelles: the twin-towered fort at the far end of the bridge of Orléans
PROP.tourelles = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const st = '#d6ccb4';
  c.beginPath(); c.rect(-34, -40, 68, 40); c.fillStyle = '#c9bfa9'; c.fill(); ink(c, 2.4);
  for (const tx of [-30, 30]) { c.beginPath(); c.rect(tx - 12, -74, 24, 74); c.fillStyle = st; c.fill(); ink(c, 2.4); c.beginPath(); c.moveTo(tx - 15, -74); c.lineTo(tx, -100); c.lineTo(tx + 15, -74); c.closePath(); c.fillStyle = '#5a6470'; c.fill(); ink(c, 2.2); c.fillStyle = '#2a241e'; c.fillRect(tx - 2, -56, 4, 10); }
  c.beginPath(); c.moveTo(-10, 0); c.lineTo(-10, -18); c.arc(0, -18, 10, Math.PI, 0); c.lineTo(10, 0); c.closePath(); c.fillStyle = '#2a241e'; c.fill();
  if (o.arms) HER.banner(c, 30, -118, 26, 18, o.arms, t, { poleLen: 20 });
  if (o.smoke) smokePuffs(c, 0, -44, 1, t, 4);
  c.restore();
};
// a stone bridge seen from the side (o.w wide, o.arches)
PROP.bridge = function (c, x, y, s, t, o = {}) {
  const w = o.w || 200, n = o.arches || 5;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-w / 2, -24); c.lineTo(w / 2, -24); c.lineTo(w / 2, 0);
  for (let i = n - 1; i >= 0; i--) { const a0 = -w / 2 + (i + 0.5) * (w / n); c.lineTo(a0 + w / n * 0.38, 0); c.quadraticCurveTo(a0, -30, a0 - w / n * 0.38, 0); }
  c.lineTo(-w / 2, 0); c.closePath(); c.fillStyle = '#c9bfa9'; c.fill(); ink(c, 2.2);
  c.fillStyle = '#b3a78e'; c.fillRect(-w / 2, -28, w, 5); c.strokeStyle = INK; c.lineWidth = 1.6; c.strokeRect(-w / 2, -28, w, 5);
  if (o.broken != null) { const bx = -w / 2 + o.broken * w; c.fillStyle = o.sky || '#4f8fb0'; c.fillRect(bx - 10, -32, 20, 34); }
  c.restore();
};
// the king's litter: a curtained bed slung between poles, with the arms of Jerusalem
PROP.litter = function (c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  c.beginPath(); c.moveTo(-54, -30); c.lineTo(54, -30); c.lineWidth = 5; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = 3; c.strokeStyle = PAL.woodL; c.stroke();
  c.beginPath(); c.rect(-30, -58, 60, 30); c.fillStyle = '#8a1c1c'; c.fill(); ink(c, 2.2);
  c.save(); c.beginPath(); c.rect(-30, -58, 60, 30); c.clip(); c.fillStyle = PAL.gold; for (let i = -24; i <= 24; i += 12) c.fillRect(i - 1, -58, 2, 30); c.restore();
  HER.shield(c, 0, -43, 16, 19, o.arms || 'jerusalem', { lw: 1.6 });
  c.beginPath(); c.moveTo(-34, -58); c.quadraticCurveTo(0, -74, 34, -58); c.closePath(); c.fillStyle = '#f2e8d0'; c.fill(); ink(c, 2);
  c.beginPath(); circ(c, 0, -72, 3); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.2);
  c.restore();
};
// a siege ladder leaning on a wall (o.h tall, o.lean radians)
PROP.ladder = function (c, x, y, s, t, o = {}) {
  const h = o.h || 90, lean = o.lean || -0.18;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(lean); c.lineCap = 'round';
  for (const lx of [-7, 7]) { c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, -h); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3; c.strokeStyle = PAL.woodL; c.stroke(); }
  for (let yy = -8; yy > -h; yy -= 11) { c.beginPath(); c.moveTo(-7, yy); c.lineTo(7, yy); c.lineWidth = 3.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = PAL.wood; c.stroke(); }
  c.restore();
};
// a red deer at full gallop, facing +x (Patay)
PROP.stag = function (c, x, y, s, t, o = {}) {
  const k = Math.sin(t * 18);
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineJoin = 'round';
  c.fillStyle = 'rgba(30,20,10,0.25)'; c.beginPath(); ell(c, 0, 2, 22, 5); c.fill();
  c.beginPath();
  c.moveTo(-16, -14); c.bezierCurveTo(-18, -24, 8, -26, 12, -20); c.lineTo(20, -32); c.lineTo(26, -30); c.lineTo(22, -18); c.lineTo(14, -12); c.bezierCurveTo(8, -6, -8, -6, -16, -10); c.closePath();
  for (const [lx, ph] of [[-12, 1], [-6, -1], [8, 1], [13, -1]]) { const a = ph * k * 0.6 + (lx < 0 ? 0.4 : -0.4); c.moveTo(lx - 2, -9); c.lineTo(lx + Math.sin(a) * 12 - 1.5, -9 + Math.cos(a) * 12); c.lineTo(lx + Math.sin(a) * 12 + 1.5, -9 + Math.cos(a) * 12); c.lineTo(lx + 2, -9); c.closePath(); }
  c.fillStyle = '#9a5a2e'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(21, -31); c.lineTo(16, -42); c.lineTo(10, -46); c.moveTo(16, -42); c.lineTo(20, -48); c.moveTo(23, -31); c.lineTo(28, -42); c.lineTo(34, -44); c.moveTo(28, -42); c.lineTo(27, -49); c.stroke();
  c.fillStyle = '#f2e8d8'; c.beginPath(); ell(c, -17, -13, 3, 3.5); c.fill();
  c.restore();
};
// three suns in the sky (the parhelion before Mortimer's Cross): the real sun and two sun dogs on a halo
PROP.suns = function (c, x, y, s, t) {
  c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(255,240,210,0.35)'; c.lineWidth = 4 * s; c.beginPath(); c.arc(x, y, 70 * s, Math.PI * 0.95, Math.PI * 2.05); c.stroke();
  for (const dx of [-70, 0, 70]) { const r = (dx ? 9 : 13) * s * (1 + 0.04 * Math.sin(t * 2 + dx)); const g = c.createRadialGradient(x + dx * s, y, 1, x + dx * s, y, r * 3.2); g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(0.3, 'rgba(255,244,200,0.8)'); g.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = g; c.beginPath(); circ(c, x + dx * s, y, r * 3.2); c.fill(); }
  c.restore();
};
// a stone wayside cross
PROP.cross = function (c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-12, -8, 24, 8); c.fillStyle = '#b8ae9a'; c.fill(); ink(c, 2);
  c.beginPath(); c.rect(-4, -52, 8, 44); c.rect(-14, -42, 28, 7); c.fillStyle = '#cfc6b2'; c.fill(); ink(c, 2);
  c.restore();
};
// a field of ripening wheat (o.w by o.h, rows running across)
PROP.wheat = function (c, x, y, s, t, o = {}) {
  const w = (o.w || 80) * s, h = (o.h || 40) * s;
  c.save(); c.fillStyle = '#d9b85a'; c.fillRect(x - w / 2, y - h, w, h);
  c.strokeStyle = 'rgba(150,110,30,0.5)'; c.lineWidth = 1.2; for (let yy = y - h + 4; yy < y; yy += 5) { c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke(); }
  c.fillStyle = 'rgba(255,240,170,0.5)'; for (let i = 0; i < w * h / 40; i++) { const px = x - w / 2 + ((i * 37.3) % w), py = y - h + ((i * 17.9) % h); c.fillRect(px, py, 1.4, 2.6); }
  c.strokeStyle = 'rgba(80,60,20,0.5)'; c.lineWidth = 1.5; c.strokeRect(x - w / 2, y - h, w, h);
  c.restore();
};
// snowy pine and bare tree as props for the story scenes
PROP.snowPine = function (c, x, y, s, t, o = {}) { snowPine(c, x, y, 13 * s, o.seed || Math.round(x)); };
PROP.bareTree = function (c, x, y, s, t, o = {}) { bareTree(c, x, y, 16 * s, o.seed || Math.round(x)); };
// a pile of banners and a crown in a thorn bush (Bosworth) — or simply a crown on the ground
PROP.crown = function (c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-14, 0); c.lineTo(-14, -8); for (let i = 0; i <= 4; i++) { const px = -14 + i * 7; c.lineTo(px, -16); c.lineTo(px + 3.5, -9); } c.lineTo(14, -8); c.lineTo(14, 0); c.closePath();
  const g = c.createLinearGradient(0, -16, 0, 0); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#c8901c'); c.fillStyle = g; c.fill(); ink(c, 1.8);
  for (const [px, col] of [[-7, '#c8372d'], [0, '#2f5fc4'], [7, '#2f8a4c']]) { c.beginPath(); circ(c, px, -4, 1.8); c.fillStyle = col; c.fill(); }
  c.restore();
};

/* ---------- named story scenes ---------- */
// Kerak: the castle on its crag above the captured town, the wedding tower hung with garlands, trebuchets below
STORY.kerak = function (c, x, y, w, h, t, S = {}) {
  const night = !!S.night, k = h / 330;
  skyPaint(c, x, y, w, h, night ? 'night' : 'desert', t);
  const X = (f) => x + w * f, Y = (f) => y + h * f;
  // the crag
  const crag = () => { c.beginPath(); c.moveTo(X(-0.05), Y(1)); c.lineTo(X(0.08), Y(0.66)); c.quadraticCurveTo(X(0.2), Y(0.5), X(0.34), Y(0.47)); c.lineTo(X(0.78), Y(0.45)); c.quadraticCurveTo(X(0.92), Y(0.5), X(1.05), Y(0.72)); c.lineTo(X(1.05), Y(1)); c.closePath(); };
  crag(); const cg = c.createLinearGradient(0, Y(0.45), 0, Y(1)); cg.addColorStop(0, night ? '#4a3a40' : '#b88a5a'); cg.addColorStop(1, night ? '#2a2028' : '#7a5634'); c.fillStyle = cg; c.fill(); ink(c, 2.4);
  c.save(); crag(); c.clip(); c.strokeStyle = night ? 'rgba(0,0,0,0.25)' : 'rgba(80,50,20,0.3)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(X(0.1 + i * 0.1), Y(0.5)); c.lineTo(X(0.06 + i * 0.1), Y(1)); c.stroke(); } c.restore();
  // the castle along the ridge
  const st = night ? '#8a8078' : '#d6ccb4', stD = night ? '#6a6058' : '#b8aa8a';
  c.beginPath(); c.rect(X(0.3), Y(0.36), w * 0.46, h * 0.11); c.fillStyle = stD; c.fill(); ink(c, 2.2);
  for (let i = 0; i < 16; i++) { c.beginPath(); c.rect(X(0.3) + i * w * 0.029, Y(0.34), w * 0.016, h * 0.022); c.fillStyle = stD; c.fill(); ink(c, 1.4); }
  for (const [fx, th, wed] of [[0.33, 0.2, false], [0.5, 0.26, false], [0.72, 0.24, true]]) {
    const tx = X(fx), tw = w * 0.07, top = Y(0.47) - h * th;
    c.beginPath(); c.rect(tx - tw / 2, top, tw, h * th); c.fillStyle = st; c.fill(); ink(c, 2.2);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(tx - tw / 2 + i * tw * 0.36, top - h * 0.022, tw * 0.25, h * 0.022); c.fillStyle = st; c.fill(); ink(c, 1.4); }
    const lit = wed || night;
    c.fillStyle = lit ? (night ? '#ffd27a' : '#e8c070') : '#2a241e'; c.beginPath(); rr(c, tx - 3 * k, top + h * th * 0.3, 6 * k, 10 * k, 3 * k); c.fill();
    if (wed) {
      if (night) { const gg = c.createRadialGradient(tx, top + h * th * 0.35, 2, tx, top + h * th * 0.35, 40 * k); gg.addColorStop(0, 'rgba(255,210,120,0.55)'); gg.addColorStop(1, 'rgba(255,210,120,0)'); c.fillStyle = gg; c.beginPath(); circ(c, tx, top + h * th * 0.35, 40 * k); c.fill(); }
      c.strokeStyle = '#2f8a4c'; c.lineWidth = 2.4 * k; c.beginPath(); c.moveTo(tx - tw / 2, top + 6 * k); c.quadraticCurveTo(tx, top + 16 * k, tx + tw / 2, top + 6 * k); c.stroke();
      for (const [dx, col] of [[-0.3, '#c8372d'], [0, '#f2c22e'], [0.3, '#f7f3ea']]) { c.fillStyle = col; c.beginPath(); circ(c, tx + dx * tw, top + 10 * k + Math.abs(dx) * -8 * k, 2.4 * k); c.fill(); }
      HER.banner(c, tx, top - 44 * k, 30 * k, 20 * k, 'jerusalem', t, { poleLen: 20 * k });
    }
  }
  // the town below and the trebuchets
  PROP.town(c, X(0.22), Y(0.86), 0.7 * k, t, { w: 260, style: 'levant', seed: 9, church: false });
  PROP.mangonel(c, X(0.62), Y(0.95), 0.9 * k, t, { dir: 1 });
  PROP.mangonel(c, X(0.88), Y(0.97), 0.9 * k, t, { dir: 1, phase: 1.5 });
  if (night) for (const [fx, fy] of [[0.12, 0.93], [0.46, 0.96]]) PROP.fire(c, X(fx), Y(fy), 0.6 * k, t);
};

/* ===== src/art/25-india.js ===== */
/* Roll to War: the armies of India — Rajputs, Ghurids, Mughals, Afghans, Cholas and Chalukyas.
   Heads (turbans, crowns, conical helmets), Indian weapons (khanda, talwar, dhal shield, the karwah hide screen,
   the matchlock), and the foot soldiers of the three Indian campaigns. Elephants and riders are in 25b-elephants.js.
   Same unit space and two-pass painter as 10-troops.js. */

const SKIN = { in: '#c98c5c', south: '#a96b40', turk: '#e2b186', afghan: '#d8a172', mughal: '#e6b68c' };
const DHOTI = '#f1e9d6';

/* ================= heads: side view at (hx, hy), front/back view at (0, hy) ================= */
// a wrapped turban (pagri) sitting on the crown of the head, with an optional jewel and plume
function pagriSide(g, hx, hy, col, o = {}) {
  const c = g.c;
  if (o.tail) { c.beginPath(); c.moveTo(hx - 12, hy - 8); c.quadraticCurveTo(hx - 22, hy - 2, hx - 21, hy + 14); c.lineTo(hx - 15, hy + 13); c.quadraticCurveTo(hx - 16, hy + 2, hx - 9, hy - 3); c.closePath(); g.fill(shade(col, -0.15)); }
  const tb = () => { c.beginPath(); c.moveTo(hx + 13.5, hy - 3); c.quadraticCurveTo(hx + 17, hy - 17, hx + 5, hy - 22); c.quadraticCurveTo(hx - 9, hy - 27, hx - 16, hy - 14); c.quadraticCurveTo(hx - 19, hy - 5, hx - 14, hy); c.quadraticCurveTo(hx, hy - 7, hx + 13.5, hy - 3); c.closePath(); };
  tb(); g.fill(col);
  if (!g.out) {
    tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.25); c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx - 18, hy - 4 - i * 5); c.quadraticCurveTo(hx - 2, hy - 13 - i * 4, hx + 17, hy - 5 - i * 5.5); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(hx - 20, hy - 30, 8, 30); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(hx + 4, hy - 26, 5, 22); });
    if (o.band) { c.beginPath(); c.moveTo(hx - 15, hy - 5); c.quadraticCurveTo(hx, hy - 10, hx + 15, hy - 6); c.strokeStyle = o.band; c.lineWidth = 2.4; c.stroke(); }
  }
  if (o.plume) { c.beginPath(); c.moveTo(hx + 6, hy - 19); c.bezierCurveTo(hx + 2, hy - 30, hx - 6, hy - 38, hx - 14, hy - 40); c.bezierCurveTo(hx - 6, hy - 32, hx + 2, hy - 24, hx + 9, hy - 18); c.closePath(); g.fill(o.plume); }
  if (o.jewel) { c.beginPath(); ell(c, hx + 11, hy - 12, 3.4, 4); g.fill(PAL.gold); if (!g.out) g.dot(hx + 11, hy - 12, 1.6, o.jewel); }
}
function pagriFB(g, hy, col, back, o = {}) {
  const c = g.c;
  const tb = () => { c.beginPath(); c.moveTo(-17, hy - 2); c.quadraticCurveTo(-20, hy - 17, -9, hy - 22); c.quadraticCurveTo(0, hy - 27, 9, hy - 22); c.quadraticCurveTo(20, hy - 17, 17, hy - 2); c.quadraticCurveTo(0, hy - 8, -17, hy - 2); c.closePath(); };
  if (back && o.tail) { c.beginPath(); c.moveTo(-6, hy - 6); c.quadraticCurveTo(-8, hy + 8, -4, hy + 18); c.lineTo(4, hy + 18); c.quadraticCurveTo(7, hy + 6, 6, hy - 6); c.closePath(); g.fill(shade(col, -0.15)); }
  if (o.plume) { c.beginPath(); c.moveTo(-3, hy - 20); c.bezierCurveTo(-8, hy - 32, -4, hy - 42, 4, hy - 46); c.bezierCurveTo(4, hy - 36, 6, hy - 28, 3, hy - 20); c.closePath(); g.fill(o.plume); }
  if (back) { c.beginPath(); c.moveTo(-16, hy - 6); c.quadraticCurveTo(-17, hy + 6, -10, hy + 8); c.quadraticCurveTo(0, hy + 11, 10, hy + 8); c.quadraticCurveTo(17, hy + 6, 16, hy - 6); c.closePath(); g.fill(shade(col, -0.08)); }
  tb(); g.fill(col);
  if (!g.out) {
    tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.25); c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-19, hy - 4 - i * 5 + (i % 2) * 3); c.quadraticCurveTo(0, hy - 12 - i * 4, 19, hy - 4 - i * 5 - (i % 2) * 3); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(8, hy - 30, 14, 30); });
    if (o.band) { c.beginPath(); c.moveTo(-16, hy - 5); c.quadraticCurveTo(0, hy - 10, 16, hy - 5); c.strokeStyle = o.band; c.lineWidth = 2.4; c.stroke(); }
    if (o.jewel && !back) { c.beginPath(); ell(c, 0, hy - 12, 3.4, 4); c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke(); g.dot(0, hy - 12, 1.6, o.jewel); }
  }
}
// black hair tied in a knot (south Indian soldiers), side and front/back
function bunSide(g, hx, hy, col) {
  const c = g.c, h = col || '#1e1612';
  c.beginPath(); circ(c, hx - 8, hy - 16, 7.5); g.fill(h);
  c.beginPath(); c.moveTo(hx + 13, hy - 4); c.quadraticCurveTo(hx + 12, hy - 17, hx, hy - 17.5); c.quadraticCurveTo(hx - 16, hy - 17, hx - 16, hy + 1); c.lineTo(hx - 14, hy + 9); c.quadraticCurveTo(hx - 8, hy + 8, hx - 6, hy + 3); c.quadraticCurveTo(hx - 3, hy - 5, hx + 13, hy - 4); c.closePath(); g.fill(h);
  if (!g.out) { c.beginPath(); c.moveTo(hx - 12, hy - 20); c.lineTo(hx - 3, hy - 16); c.strokeStyle = PAL.gold; c.lineWidth = 2; c.stroke(); }
}
function bunFB(g, hy, col, back) {
  const c = g.c, h = col || '#1e1612';
  c.beginPath(); circ(c, back ? 0 : 0, hy - 19, 7.5); g.fill(h);
  if (back) {
    c.beginPath(); circ(c, 0, hy, L.HR); g.fill(h);
    // a cloth band tied round the head, in the army's colour, so the men read from behind
    if (!g.out) { const tc = (g.team && g.team.main) || '#b8312a'; c.save(); c.beginPath(); circ(c, 0, hy, L.HR); c.clip(); c.fillStyle = tc; c.fillRect(-L.HR, hy - 5, L.HR * 2, 5.5); c.restore(); c.beginPath(); c.moveTo(-3, hy); c.lineTo(-7, hy + 10); c.lineTo(-2, hy + 9); c.lineTo(0, hy + 1); c.lineTo(2, hy + 9); c.lineTo(7, hy + 10); c.lineTo(3, hy); c.closePath(); c.fillStyle = tc; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke(); }
    return;
  }
  c.beginPath(); c.moveTo(-16, hy + 5); c.quadraticCurveTo(-17, hy - 17.5, 0, hy - 17.5); c.quadraticCurveTo(17, hy - 17.5, 16, hy + 5); c.lineTo(13, hy - 4); c.quadraticCurveTo(0, hy - 8, -13, hy - 4); c.closePath(); g.fill(h);
  if (!g.out) g.line([-6, hy - 14, 6, hy - 14], PAL.gold, 2);
}
// a tall conical crown (mukuta / kiritam) of gold, with a jewelled band
function kiritSide(g, hx, hy, o = {}) {
  const c = g.c, H = o.h || 26, gold = o.col || PAL.gold;
  const cr = () => { c.beginPath(); c.moveTo(hx - 13, hy - 4); c.lineTo(hx - 11, hy - 12); c.quadraticCurveTo(hx - 6, hy - 12 - H * 0.7, hx + 1, hy - 12 - H); c.quadraticCurveTo(hx + 7, hy - 12 - H * 0.7, hx + 13, hy - 12); c.lineTo(hx + 14, hy - 4); c.closePath(); };
  if (o.hair !== false) { c.beginPath(); c.moveTo(hx - 12, hy - 6); c.quadraticCurveTo(hx - 20, hy + 2, hx - 17, hy + 16); c.lineTo(hx - 11, hy + 14); c.quadraticCurveTo(hx - 12, hy + 4, hx - 6, hy - 2); c.closePath(); g.fill(o.hairCol || '#1e1612'); }
  cr(); g.fill(gold);
  if (!g.out) {
    cr(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx - 16, hy - 50, 8, 50); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(hx + 3, hy - 12 - H, 3, H); c.strokeStyle = PAL.goldD; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { const y = hy - 12 - (H * i) / 4; c.beginPath(); c.moveTo(hx - 12, y + 2); c.lineTo(hx + 14, y); c.stroke(); } });
    g.dot(hx + 1, hy - 12 - H * 0.55, 2, '#c8372d'); g.dot(hx + 6, hy - 9, 1.8, '#2f8a4c');
  }
  c.beginPath(); rr(c, hx - 14, hy - 10, 29, 6.5, 2); g.fill(gold);
  if (!g.out) { g.dot(hx + 9, hy - 7, 1.5, '#c8372d'); g.dot(hx + 2, hy - 7, 1.5, '#2f5fc4'); }
  c.beginPath(); circ(c, hx + 1, hy - 14 - H, 3); g.fill(gold);
}
function kiritFB(g, hy, back, o = {}) {
  const c = g.c, H = o.h || 26, gold = o.col || PAL.gold;
  if (back && o.hair !== false) { c.beginPath(); c.moveTo(-14, hy - 4); c.quadraticCurveTo(-17, hy + 10, -10, hy + 16); c.lineTo(10, hy + 16); c.quadraticCurveTo(17, hy + 10, 14, hy - 4); c.closePath(); g.fill(o.hairCol || '#1e1612'); }
  const cr = () => { c.beginPath(); c.moveTo(-14, hy - 4); c.lineTo(-12, hy - 12); c.quadraticCurveTo(-7, hy - 12 - H * 0.7, 0, hy - 12 - H); c.quadraticCurveTo(7, hy - 12 - H * 0.7, 12, hy - 12); c.lineTo(14, hy - 4); c.closePath(); };
  cr(); g.fill(gold);
  if (!g.out) {
    cr(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(5, hy - 50, 12, 50); c.strokeStyle = PAL.goldD; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { const y = hy - 12 - (H * i) / 4; c.beginPath(); c.moveTo(-12 + i * 1.5, y + 1); c.lineTo(12 - i * 1.5, y + 1); c.stroke(); } });
    if (!back) { g.dot(0, hy - 12 - H * 0.5, 2.2, '#c8372d'); g.dot(-6, hy - 16, 1.6, '#2f8a4c'); g.dot(6, hy - 16, 1.6, '#2f8a4c'); }
  }
  c.beginPath(); rr(c, -15, hy - 10, 30, 6.5, 2); g.fill(gold);
  if (!g.out && !back) { g.dot(0, hy - 7, 1.8, '#c8372d'); g.dot(-8, hy - 7, 1.4, '#2f5fc4'); g.dot(8, hy - 7, 1.4, '#2f5fc4'); }
  c.beginPath(); circ(c, 0, hy - 14 - H, 3); g.fill(gold);
}
// a queen: black hair in a knot, a jewelled diadem and a veil (odhni) falling behind
function queenSide(g, hx, hy, veil) {
  const c = g.c;
  c.beginPath(); c.moveTo(hx + 4, hy - 17); c.quadraticCurveTo(hx - 22, hy - 16, hx - 24, hy + 10); c.quadraticCurveTo(hx - 24, hy + 26, hx - 18, hy + 32); c.lineTo(hx - 8, hy + 30); c.quadraticCurveTo(hx - 12, hy + 12, hx - 4, hy - 4); c.closePath(); g.fill(veil);
  if (!g.out) g.line([hx - 20, hy + 6, hx - 15, hy + 28], PAL.gold, 1.6);
  bunSide(g, hx, hy);
  c.beginPath(); c.moveTo(hx - 12, hy - 11); c.quadraticCurveTo(hx, hy - 17, hx + 12, hy - 12); c.lineTo(hx + 13, hy - 8); c.quadraticCurveTo(hx, hy - 12, hx - 12, hy - 7); c.closePath(); g.fill(PAL.gold);
  if (!g.out) { g.dot(hx + 10, hy - 9.5, 1.6, '#c8372d'); c.beginPath(); c.moveTo(hx + 10, hy - 9); c.lineTo(hx + 10, hy - 3); c.strokeStyle = PAL.gold; c.lineWidth = 1; c.stroke(); g.dot(hx + 10, hy - 2, 1.3, '#f6f2e6'); }
}
function queenFB(g, hy, veil, back) {
  const c = g.c;
  c.beginPath(); c.moveTo(-17, hy - 8); c.quadraticCurveTo(0, hy - 26, 17, hy - 8); c.quadraticCurveTo(22, hy + 14, 20, hy + 30); c.lineTo(-20, hy + 30); c.quadraticCurveTo(-22, hy + 14, -17, hy - 8); c.closePath(); g.fill(veil);
  if (back) { c.beginPath(); circ(c, 0, hy - 3, 13); g.fill('#1e1612'); return; }
  bunFB(g, hy);
  c.beginPath(); c.moveTo(-13, hy - 10); c.quadraticCurveTo(0, hy - 16, 13, hy - 10); c.lineTo(13, hy - 6); c.quadraticCurveTo(0, hy - 12, -13, hy - 6); c.closePath(); g.fill(PAL.gold);
  if (!g.out) { g.dot(0, hy - 10, 2, '#c8372d'); g.dot(-7, hy - 8, 1.3, '#2f8a4c'); g.dot(7, hy - 8, 1.3, '#2f8a4c'); }
}
// a conical steel helmet with a mail aventail (Turkish ghulams and horse archers), optional turban wrap
function coneSide(g, hx, hy, o = {}) {
  const c = g.c;
  const av = () => { c.beginPath(); c.moveTo(hx - 13, hy - 5); c.lineTo(hx + 2, hy - 5); c.quadraticCurveTo(hx, hy + 6, hx + 1, hy + 14); c.lineTo(hx - 13, hy + 17); c.quadraticCurveTo(hx - 18, hy + 6, hx - 13, hy - 5); c.closePath(); };
  av(); g.fill(PAL.mail);
  if (!g.out && g.detail >= 1) { av(); g.inside((c) => mailDots(c, hx - 18, hy - 5, hx + 3, hy + 18, 3.2)); }
  const cn = () => { c.beginPath(); c.moveTo(hx - 13, hy - 5); c.quadraticCurveTo(hx - 11, hy - 26, hx + 1, hy - 34); c.quadraticCurveTo(hx + 12, hy - 26, hx + 14, hy - 5); c.closePath(); };
  cn(); g.fill(o.col || PAL.steel);
  if (!g.out) { cn(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(hx - 16, hy - 36, 9, 32); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 5, hy - 19, 2.4, 6, 0.35); c.fill(); }); }
  c.beginPath(); rr(c, hx - 14, hy - 8, 29, 4.5, 1.6); g.fill(o.band || PAL.gold);
  if (o.wrap) { const w = () => { c.beginPath(); c.moveTo(hx - 15, hy - 5); c.quadraticCurveTo(hx, hy - 15, hx + 15, hy - 6); c.lineTo(hx + 15, hy - 1); c.quadraticCurveTo(hx, hy - 9, hx - 15, hy); c.closePath(); }; w(); g.fill(o.wrap); }
  if (o.plume) { c.beginPath(); c.moveTo(hx, hy - 33); c.quadraticCurveTo(hx - 10, hy - 44, hx - 20, hy - 42); c.quadraticCurveTo(hx - 10, hy - 38, hx + 2, hy - 31); c.closePath(); g.fill(o.plume); }
}
function coneFB(g, hy, back, o = {}) {
  const c = g.c;
  if (back) { c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16, hy + 14); c.quadraticCurveTo(0, hy + 20, -16, hy + 14); c.closePath(); g.fill(PAL.mail); if (!g.out && g.detail >= 1) { c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16, hy + 14); c.quadraticCurveTo(0, hy + 20, -16, hy + 14); c.closePath(); g.inside((c) => mailDots(c, -17, hy - 5, 17, hy + 21, 3.2)); } }
  else for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 11, hy - 5); c.lineTo(sx * 16, hy - 5); c.lineTo(sx * 17, hy + 12); c.lineTo(sx * 11, hy + 16); c.closePath(); g.fill(PAL.mail); }
  if (o.plume) { c.beginPath(); c.moveTo(-2, hy - 34); c.quadraticCurveTo(-8, hy - 46, -2, hy - 52); c.quadraticCurveTo(4, hy - 44, 2, hy - 34); c.closePath(); g.fill(o.plume); }
  const cn = () => { c.beginPath(); c.moveTo(-14, hy - 5); c.quadraticCurveTo(-12, hy - 27, 0, hy - 36); c.quadraticCurveTo(12, hy - 27, 14, hy - 5); c.closePath(); };
  cn(); g.fill(o.col || PAL.steel);
  if (!g.out) { cn(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(5, hy - 38, 12, 34); c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, -5, hy - 20, 2.4, 6, 0.3); c.fill(); }); }
  c.beginPath(); rr(c, -15, hy - 8, 30, 4.5, 1.6); g.fill(o.band || PAL.gold);
  if (o.wrap) { c.beginPath(); c.moveTo(-16, hy - 4); c.quadraticCurveTo(0, hy - 13, 16, hy - 4); c.lineTo(16, hy + 1); c.quadraticCurveTo(0, hy - 8, -16, hy + 1); c.closePath(); g.fill(o.wrap); }
  if (!g.out && !back) g.line([0, hy - 8, 0, hy + 2], PAL.steelD, 2.2);
}
// a full Mughal turban: tall at the back, a cap (kulah) peeping out of the top, a jewelled plume (sarpech);
// o.taj: Humayun's tall "crown of glory"
function mughalSide(g, hx, hy, col, o = {}) {
  const c = g.c;
  if (o.taj) { c.beginPath(); c.moveTo(hx - 7, hy - 18); c.lineTo(hx - 3, hy - 44); c.quadraticCurveTo(hx + 1, hy - 48, hx + 4, hy - 44); c.lineTo(hx + 7, hy - 18); c.closePath(); g.fill(o.taj); if (!g.out) g.line([hx - 4, hy - 30, hx + 5, hy - 30], PAL.gold, 1.6); }
  else { c.beginPath(); c.moveTo(hx - 6, hy - 20); c.quadraticCurveTo(hx - 3, hy - 32, hx + 2, hy - 33); c.quadraticCurveTo(hx + 7, hy - 30, hx + 7, hy - 20); c.closePath(); g.fill(o.cap || '#b8312a'); }
  const tb = () => { c.beginPath(); c.moveTo(hx + 14, hy - 3); c.quadraticCurveTo(hx + 18, hy - 18, hx + 6, hy - 24); c.quadraticCurveTo(hx - 8, hy - 30, hx - 17, hy - 18); c.quadraticCurveTo(hx - 21, hy - 7, hx - 15, hy); c.quadraticCurveTo(hx, hy - 6, hx + 14, hy - 3); c.closePath(); };
  tb(); g.fill(col);
  if (!g.out) { tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.22); c.lineWidth = 1.3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(hx - 20, hy - 2 - i * 5); c.quadraticCurveTo(hx - 2, hy - 16 - i * 3, hx + 18, hy - 6 - i * 4.5); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(hx - 22, hy - 30, 8, 30); }); }
  if (o.sarpech !== false) aigrette(g, hx + 11, hy - 16);
}
function mughalFB(g, hy, col, back, o = {}) {
  const c = g.c;
  if (o.taj) { c.beginPath(); c.moveTo(-7, hy - 18); c.lineTo(-3, hy - 46); c.quadraticCurveTo(0, hy - 50, 3, hy - 46); c.lineTo(7, hy - 18); c.closePath(); g.fill(o.taj); if (!g.out) g.line([-5, hy - 31, 5, hy - 31], PAL.gold, 1.6); }
  else { c.beginPath(); c.moveTo(-6, hy - 20); c.quadraticCurveTo(-5, hy - 33, 0, hy - 34); c.quadraticCurveTo(5, hy - 33, 6, hy - 20); c.closePath(); g.fill(o.cap || '#b8312a'); }
  const tb = () => { c.beginPath(); c.moveTo(-18, hy - 1); c.quadraticCurveTo(-22, hy - 19, -9, hy - 25); c.quadraticCurveTo(0, hy - 29, 9, hy - 25); c.quadraticCurveTo(22, hy - 19, 18, hy - 1); c.quadraticCurveTo(0, hy - 8, -18, hy - 1); c.closePath(); };
  if (back) { c.beginPath(); c.moveTo(-17, hy - 5); c.quadraticCurveTo(-18, hy + 7, -10, hy + 9); c.quadraticCurveTo(0, hy + 12, 10, hy + 9); c.quadraticCurveTo(18, hy + 7, 17, hy - 5); c.closePath(); g.fill(shade(col, -0.08)); }
  tb(); g.fill(col);
  if (!g.out) { tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.22); c.lineWidth = 1.3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-21, hy - 3 - i * 4.5 + (i % 2) * 3); c.quadraticCurveTo(0, hy - 13 - i * 3.5, 21, hy - 3 - i * 4.5 - (i % 2) * 3); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(8, hy - 30, 16, 30); }); }
  if (!back && o.sarpech !== false) aigrette(g, 0, hy - 14);
}
// a big loose Afghan turban with its tail (shamla) hanging behind
function afghanSide(g, hx, hy, col) {
  const c = g.c;
  c.beginPath(); c.moveTo(hx - 13, hy - 10); c.quadraticCurveTo(hx - 26, hy - 4, hx - 24, hy + 20); c.lineTo(hx - 17, hy + 20); c.quadraticCurveTo(hx - 18, hy + 4, hx - 9, hy - 4); c.closePath(); g.fill(shade(col, -0.12));
  const tb = () => { c.beginPath(); c.moveTo(hx + 15, hy - 2); c.quadraticCurveTo(hx + 21, hy - 16, hx + 9, hy - 25); c.quadraticCurveTo(hx - 6, hy - 32, hx - 18, hy - 20); c.quadraticCurveTo(hx - 23, hy - 9, hx - 16, hy + 1); c.quadraticCurveTo(hx, hy - 6, hx + 15, hy - 2); c.closePath(); };
  tb(); g.fill(col);
  if (!g.out) { tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.2); c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx - 22, hy - 4 - i * 6); c.quadraticCurveTo(hx, hy - 20 - i * 2, hx + 20, hy - 4 - i * 6); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx - 24, hy - 34, 9, 36); }); }
}
function afghanFB(g, hy, col, back) {
  const c = g.c;
  if (back) { c.beginPath(); c.moveTo(-17, hy - 5); c.quadraticCurveTo(-18, hy + 7, -10, hy + 9); c.quadraticCurveTo(0, hy + 12, 10, hy + 9); c.quadraticCurveTo(18, hy + 7, 17, hy - 5); c.closePath(); g.fill(shade(col, -0.08)); c.beginPath(); c.moveTo(4, hy - 6); c.quadraticCurveTo(10, hy + 8, 6, hy + 22); c.lineTo(14, hy + 22); c.quadraticCurveTo(16, hy + 6, 11, hy - 6); c.closePath(); g.fill(shade(col, -0.12)); }
  const tb = () => { c.beginPath(); c.moveTo(-19, hy); c.quadraticCurveTo(-24, hy - 20, -9, hy - 27); c.quadraticCurveTo(0, hy - 31, 9, hy - 27); c.quadraticCurveTo(24, hy - 20, 19, hy); c.quadraticCurveTo(0, hy - 7, -19, hy); c.closePath(); };
  tb(); g.fill(col);
  if (!g.out) { tb(); g.inside((c) => { c.strokeStyle = shade(col, -0.2); c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-22, hy - 3 - i * 6 + (i % 2) * 4); c.quadraticCurveTo(0, hy - 14 - i * 4, 22, hy - 3 - i * 6 - (i % 2) * 4); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(9, hy - 32, 16, 34); }); }
}
// a Mughal steel helmet (khula-khud): spike, plume sockets, sliding nasal, mail curtain
function khudSide(g, hx, hy, o = {}) {
  const c = g.c;
  const av = () => { c.beginPath(); c.moveTo(hx - 14, hy - 5); c.lineTo(hx + 3, hy - 5); c.quadraticCurveTo(hx + 2, hy + 8, hx + 3, hy + 16); c.lineTo(hx - 14, hy + 18); c.quadraticCurveTo(hx - 19, hy + 6, hx - 14, hy - 5); c.closePath(); };
  av(); g.fill(PAL.mail);
  if (!g.out && g.detail >= 1) { av(); g.inside((c) => mailDots(c, hx - 19, hy - 5, hx + 4, hy + 19, 3.2)); }
  if (o.plume) { c.beginPath(); c.moveTo(hx - 6, hy - 22); c.quadraticCurveTo(hx - 16, hy - 36, hx - 26, hy - 34); c.quadraticCurveTo(hx - 16, hy - 28, hx - 8, hy - 19); c.closePath(); g.fill(o.plume); }
  const dm = () => { c.beginPath(); c.moveTo(hx - 14, hy - 5); c.bezierCurveTo(hx - 14, hy - 26, hx + 15, hy - 26, hx + 15, hy - 5); c.closePath(); };
  dm(); g.fill(PAL.steel);
  if (!g.out) { dm(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(hx - 17, hy - 28, 9, 26); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); ell(c, hx + 5, hy - 16, 4, 3, -0.3); c.fill(); c.fillStyle = PAL.gold; c.fillRect(hx - 16, hy - 9, 34, 3); }); }
  c.beginPath(); c.moveTo(hx, hy - 20); c.lineTo(hx + 1.5, hy - 33); c.lineTo(hx + 3, hy - 20); c.closePath(); g.fill(PAL.steelL);
  c.beginPath(); rr(c, hx + 9, hy - 14, 3.2, 22, 1.4); g.fill(PAL.steelD);
}
function khudFB(g, hy, back, o = {}) {
  const c = g.c;
  if (back) { c.beginPath(); c.moveTo(-15, hy - 5); c.lineTo(15, hy - 5); c.lineTo(16, hy + 15); c.quadraticCurveTo(0, hy + 21, -16, hy + 15); c.closePath(); g.fill(PAL.mail); }
  else for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 11, hy - 5); c.lineTo(sx * 16, hy - 5); c.lineTo(sx * 17, hy + 13); c.lineTo(sx * 11, hy + 17); c.closePath(); g.fill(PAL.mail); }
  if (o.plume) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 5, hy - 22); c.quadraticCurveTo(sx * 12, hy - 36, sx * 8, hy - 44); c.quadraticCurveTo(sx * 4, hy - 34, sx * 2, hy - 21); c.closePath(); g.fill(o.plume); }
  const dm = () => { c.beginPath(); c.moveTo(-15, hy - 5); c.bezierCurveTo(-15, hy - 27, 15, hy - 27, 15, hy - 5); c.closePath(); };
  dm(); g.fill(PAL.steel);
  if (!g.out) { dm(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, hy - 28, 12, 26); c.fillStyle = PAL.gold; c.fillRect(-16, hy - 9, 32, 3); }); }
  c.beginPath(); c.moveTo(-1.5, hy - 21); c.lineTo(0, hy - 35); c.lineTo(1.5, hy - 21); c.closePath(); g.fill(PAL.steelL);
  if (!back) { c.beginPath(); rr(c, -1.6, hy - 14, 3.2, 22, 1.4); g.fill(PAL.steelD); }
}
// a short black beard and moustache (side and front) for the older men
function beardSide(g, hx, hy, col) {
  const c = g.c; c.beginPath(); c.moveTo(hx - 1, hy + 4); c.quadraticCurveTo(hx + 2, hy + 18, hx + 9, hy + 17); c.quadraticCurveTo(hx + 15, hy + 14, hx + 14, hy + 6); c.quadraticCurveTo(hx + 8, hy + 9, hx - 1, hy + 4); c.closePath(); g.fill(col || '#2a1d16');
}
function beardFB(g, hy, col) {
  const c = g.c; c.beginPath(); c.moveTo(-11, hy + 4); c.quadraticCurveTo(-10, hy + 18, 0, hy + 20); c.quadraticCurveTo(10, hy + 18, 11, hy + 4); c.quadraticCurveTo(6, hy + 10, 0, hy + 9); c.quadraticCurveTo(-6, hy + 10, -11, hy + 4); c.closePath(); g.fill(col || '#2a1d16');
}
// dispatch by kind: the troop and rider definitions name their head as { kind, col, ... }
const HEADS = {
  pagri: { side: (g, hx, hy, H) => pagriSide(g, hx, hy, H.col || '#f1e9d6', H), fb: (g, hy, back, H) => pagriFB(g, hy, H.col || '#f1e9d6', back, H) },
  bun: { side: (g, hx, hy, H) => bunSide(g, hx, hy, H.col), fb: (g, hy, back, H) => bunFB(g, hy, H.col, back) },
  kirit: { side: (g, hx, hy, H) => kiritSide(g, hx, hy, H), fb: (g, hy, back, H) => kiritFB(g, hy, back, H) },
  queen: { side: (g, hx, hy, H) => queenSide(g, hx, hy, H.col), fb: (g, hy, back, H) => queenFB(g, hy, H.col, back) },
  cone: { side: (g, hx, hy, H) => coneSide(g, hx, hy, H), fb: (g, hy, back, H) => coneFB(g, hy, back, H) },
  mughal: { side: (g, hx, hy, H) => mughalSide(g, hx, hy, H.col || '#f4efe2', H), fb: (g, hy, back, H) => mughalFB(g, hy, H.col || '#f4efe2', back, H) },
  afghan: { side: (g, hx, hy, H) => afghanSide(g, hx, hy, H.col || '#f1e9d6'), fb: (g, hy, back, H) => afghanFB(g, hy, H.col || '#f1e9d6', back) },
  khud: { side: (g, hx, hy, H) => khudSide(g, hx, hy, H), fb: (g, hy, back, H) => khudFB(g, hy, back, H) },
};
const SLOW_HAIR = { pagri: 1, cone: 1, mughal: 1, afghan: 1, khud: 1, kirit: 1 };
// a whole head: face, beard and headgear. H = { kind, skin, beard, ... }
function inHeadSide(g, hx, hy, H) {
  sHead(g, hx, hy, H.skin || SKIN.in); sEye(g, hx + 8.3, hy + 1.5);
  if (H.beard) beardSide(g, hx, hy, H.beard);
  if (H.stache && !g.out) { g.c.beginPath(); g.c.moveTo(hx + 7, hy + 6); g.c.quadraticCurveTo(hx + 12, hy + 4, hx + 15, hy + 1); g.c.lineWidth = 2; g.c.strokeStyle = H.stache; g.c.stroke(); }
  if (HEADS[H.kind]) HEADS[H.kind].side(g, hx, hy, H);
}
function inHeadFB(g, hy, H, front) {
  if (front) { fHead(g, hy, H.skin || SKIN.in); fFace(g, hy); if (H.beard) beardFB(g, hy, H.beard); if (H.stache && !g.out) { const c = g.c; c.beginPath(); c.moveTo(-9, hy + 5); c.quadraticCurveTo(-4, hy + 8, 0, hy + 6); c.quadraticCurveTo(4, hy + 8, 9, hy + 5); c.lineWidth = 2; c.strokeStyle = H.stache; c.stroke(); } }
  else fHead(g, hy, H.kind === 'bun' || H.kind === 'queen' || H.kind === 'kirit' ? '#1e1612' : H.hairCol || '#3b2a1e');
  if (HEADS[H.kind]) HEADS[H.kind].fb(g, hy, !front, H);
}

/* ================= Indian weapons ================= */
// khanda: straight broad sword that widens to a blunt point; basket hilt with a disc pommel and spike
function gKhanda(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); c.moveTo(4, -2.6); c.lineTo(4 + len * 0.8, -3.6); c.quadraticCurveTo(4 + len + 4, -4, 4 + len + 4, 0); c.quadraticCurveTo(4 + len + 4, 4, 4 + len * 0.8, 3.6); c.lineTo(4, 2.6); c.closePath(); g.fill(PAL.steelL);
  if (!g.out) { g.line([6, 0, 4 + len * 0.7, 0], PAL.steelD, 0.9); c.fillStyle = PAL.gold; c.fillRect(4, -2.6, 9, 5.2); }
  c.beginPath(); rr(c, 1, -6.5, 4, 13, 1.6); g.fill(PAL.gold);
  c.beginPath(); rr(c, -8, -2.2, 9.5, 4.4, 1.8); g.fill(PAL.goldD);
  c.beginPath(); ell(c, -9.5, 0, 2.4, 5.5); g.fill(PAL.gold);
  c.beginPath(); c.moveTo(-11, -1); c.lineTo(-17, 0); c.lineTo(-11, 1); c.closePath(); g.fill(PAL.gold);
  c.restore();
}
// talwar: the curved Indian sabre (the Ayyubid scimitar's cousin) with a disc pommel
function gTalwar(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); c.moveTo(4, -2.3); c.quadraticCurveTo(len * 0.62, -3.6, len + 4, -9); c.quadraticCurveTo(len * 0.8, -1, len * 0.55, 2.2); c.quadraticCurveTo(len * 0.3, 3.2, 4, 2.4); c.closePath(); g.fill(PAL.steelL);
  if (!g.out) g.line([7, 0, len * 0.6, -1.4], PAL.steelD, 0.9);
  c.beginPath(); rr(c, 1, -6, 3.8, 12, 1.6); g.fill(PAL.gold);
  c.beginPath(); rr(c, -8, -2, 9.5, 4, 1.8); g.fill(PAL.leatherD);
  c.beginPath(); ell(c, -9.5, 0, 2.4, 5.2); g.fill(PAL.gold);
  c.restore();
}
// a mace (the Turkish ghulams' favourite)
function gMace(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); cap(c, -6, 0, len - 6, 0, 3.4); g.fill(PAL.woodD);
  c.beginPath(); for (let i = 0; i < 6; i++) { const b = (i / 6) * TAU; c.moveTo(len + Math.cos(b) * 3, Math.sin(b) * 3); c.lineTo(len + Math.cos(b + 0.25) * 8, Math.sin(b + 0.25) * 8); c.lineTo(len + Math.cos(b + 0.55) * 3, Math.sin(b + 0.55) * 3); } circ(c, len, 0, 5.5); g.fill(PAL.steel);
  c.restore();
}
function gJavelin(g, x0, y0, a, len) {
  const c = g.c, ca = Math.cos(a), sa = Math.sin(a), x1 = x0 + ca * len, y1 = y0 + sa * len;
  c.beginPath(); cap(c, x0, y0, x1, y1, 2.6); g.fill(PAL.woodL);
  c.save(); c.translate(x1, y1); c.rotate(a);
  c.beginPath(); c.moveTo(-2, -2); c.lineTo(3, -4.5); c.lineTo(12, 0); c.lineTo(3, 4.5); c.lineTo(-2, 2); c.closePath(); g.fill(PAL.steelL);
  c.restore();
}
// dhal: a round, domed shield of hide or steel with four bosses
function gDhal(g, cx, cy, r, col, o = {}) {
  const c = g.c;
  c.beginPath(); circ(c, cx, cy, r); g.fill(col, true);
  if (g.out) return;
  c.beginPath(); circ(c, cx, cy, r);
  g.inside((c) => {
    c.lineWidth = Math.max(2, r * 0.18); c.strokeStyle = o.rim || PAL.gold; c.beginPath(); circ(c, cx, cy, r * 0.92); c.stroke();
    const rg = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 1, cx, cy, r); rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(0.55, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.22)'); c.fillStyle = rg; c.fillRect(cx - r, cy - r, r * 2, r * 2);
  });
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); circ(c, cx + dx * r * 0.26, cy + dy * r * 0.26, Math.max(1.6, r * 0.13)); c.fillStyle = PAL.goldL; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke(); }
}
// the dhal seen from behind: its hide back and the hand grips
function gDhalBack(g, cx, cy, r) {
  const c = g.c;
  c.beginPath(); circ(c, cx, cy, r); g.fill(PAL.leather, true);
  if (!g.out) { c.beginPath(); circ(c, cx, cy, r); g.inside((c) => { c.lineWidth = 3; c.strokeStyle = PAL.leatherD; c.beginPath(); circ(c, cx, cy, r * 0.9); c.stroke(); c.fillStyle = PAL.leatherD; c.fillRect(cx - r, cy - 4, r * 2, 3.5); }); }
}
// the karwah: a tall screen of raw bullock hide stuffed with cotton ("they appear like unto a wall")
function gKarwah(g, cx, cy, w, h, col) {
  const c = g.c;
  const path = () => { c.beginPath(); c.moveTo(cx - w / 2, cy - h / 2 + 4); c.quadraticCurveTo(cx, cy - h / 2 - 3, cx + w / 2, cy - h / 2 + 4); c.lineTo(cx + w / 2, cy + h / 2 - 3); c.quadraticCurveTo(cx, cy + h / 2 + 3, cx - w / 2, cy + h / 2 - 3); c.closePath(); };
  path(); g.fill(col || '#c9a878', true);
  if (g.out) return;
  path(); g.inside((c) => {
    c.strokeStyle = 'rgba(90,60,30,0.45)'; c.lineWidth = 1.2; for (let y = cy - h / 2 + 8; y < cy + h / 2; y += 7) { c.beginPath(); c.moveTo(cx - w / 2, y); c.quadraticCurveTo(cx, y - 2, cx + w / 2, y); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(cx + w * 0.15, cy - h, w, h * 2); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(cx - w / 2, cy - h / 2, w * 0.2, h);
    c.fillStyle = 'rgba(120,80,40,0.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); ell(c, cx - w * 0.3 + (i % 3) * w * 0.3, cy - h * 0.3 + Math.floor(i / 3) * h * 0.45, 3, 2); c.fill(); }
  });
  g.line([cx - w / 2 + 1, cy, cx + w / 2 - 1, cy], g.team ? g.team.main : '#c8372d', 3);
}
// matchlock (toradar): (x, y) = the butt, a = toward the muzzle. o.flash 0..1 draws the shot
function gMusket(g, x, y, a, len, o = {}) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  // stock: a long slender wooden stock, deeper at the butt
  c.beginPath(); c.moveTo(0, -3.8); c.lineTo(len * 0.62, -2.4); c.lineTo(len * 0.62, 2.4); c.lineTo(len * 0.3, 3.4); c.quadraticCurveTo(len * 0.12, 5.5, 0, 5); c.closePath(); g.fill(o.wood || '#8a4f2a');
  // barrel
  c.beginPath(); rr(c, len * 0.18, -3.8, len * 0.82, 3.4, 1.2); g.fill(PAL.steelD);
  if (!g.out) { for (const f of [0.34, 0.5, 0.66, 0.82]) { c.fillStyle = PAL.gold; c.fillRect(len * f, -4.2, 2.2, 6.6); } c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(len * 0.2, -3.6, len * 0.78, 1); }
  c.beginPath(); rr(c, len - 2, -4.6, 4, 5, 1); g.fill(PAL.steelD);
  // serpentine and the smouldering match
  c.beginPath(); c.moveTo(len * 0.27, 3); c.quadraticCurveTo(len * 0.24, 8, len * 0.3, 9); c.lineTo(len * 0.31, 7); c.quadraticCurveTo(len * 0.28, 6, len * 0.3, 3); c.closePath(); g.fill(PAL.steelD);
  if (!g.out) { g.line([len * 0.3, 8.5, len * 0.36, 11, len * 0.44, 10], '#6d5a3a', 1.3); g.dot(len * 0.3, 8.5, 1.4, '#ff8a3a'); }
  if (o.flash > 0 && !g.out) {
    const f = o.flash;
    c.save(); c.globalAlpha = Math.min(1, f * 1.4);
    c.fillStyle = '#fff2a8'; c.beginPath(); c.moveTo(len + 2, -5); c.lineTo(len + 12 + f * 8, -9); c.lineTo(len + 9, -2); c.lineTo(len + 20 + f * 10, -2.5); c.lineTo(len + 9, 1); c.lineTo(len + 13 + f * 6, 5); c.lineTo(len + 2, 0.5); c.closePath(); c.fill();
    c.fillStyle = '#ff9a3a'; c.beginPath(); c.moveTo(len + 2, -3.6); c.lineTo(len + 10, -2.2); c.lineTo(len + 2, -0.6); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
}
// a puff of white powder smoke (drawn in the unit's own space)
function gunSmoke(g, x, y, k) {
  if (g.out || k <= 0 || k >= 1) return;
  const c = g.c; c.save(); c.globalAlpha = 0.8 * (1 - k);
  for (let i = 0; i < 4; i++) { const r = 5 + k * 9 + i * 1.5; c.beginPath(); circ(c, x + i * 5 + k * 10, y - i * 2 - k * 8, r); c.fillStyle = i % 2 ? '#e8e6e0' : '#f6f4ee'; c.fill(); }
  c.restore();
}
// elephant goad (ankus): a short staff with a hook and a spike
function gAnkus(g, x, y, a, len) {
  const c = g.c; c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); cap(c, -4, 0, len, 0, 2.6); g.fill(PAL.gold);
  c.beginPath(); c.moveTo(len - 1, -1.6); c.lineTo(len + 9, 0); c.lineTo(len - 1, 1.6); c.closePath(); g.fill(PAL.steelL);
  c.beginPath(); c.moveTo(len - 3, 0); c.quadraticCurveTo(len - 2, 9, len - 9, 9); c.quadraticCurveTo(len - 5, 6, len - 5, 0); c.closePath(); g.fill(PAL.steelL);
  c.restore();
}

/* ================= foot soldiers ================= */
// an options bag o describes the soldier: head H, skin, legs, feet, torso ('tunic' | 'robe' | 'bare'),
// sleeve colour, shield ('dhal' | 'karwah' | 'long'), weapon ('khanda' | 'talwar' | 'spear')
function inTorsoSide(g, shoY, hipY, hemY, tm, o) {
  if (o.torso === 'robe') { robeSide(g, shoY, hipY, hemY, tm.main, o.sash || DHOTI); return; }
  if (o.torso === 'bare') {
    sTorso(g, shoY, hipY, hipY + 2, o.skin, { belt: false });
    const c = g.c;
    c.beginPath(); c.moveTo(-14, hipY - 5); c.lineTo(14, hipY - 5); c.lineTo(15.5, hemY); c.quadraticCurveTo(0, hemY + 3, -14.5, hemY); c.closePath(); g.fill(tm.main);
    c.beginPath(); c.moveTo(-11, shoY - 2); c.lineTo(-2, shoY - 3); c.lineTo(14, hipY - 7); c.lineTo(4, hipY - 3); c.closePath(); g.fill(o.sash || tm.main);
    if (!g.out) { c.fillStyle = PAL.gold; c.fillRect(-14, hipY - 6.5, 28, 3.6); g.line([-9, shoY + 3, -3, shoY + 3], PAL.gold, 1.6); }
    return;
  }
  sTorso(g, shoY, hipY, hemY, tm.main, { w: o.w || 0, trim: o.trim || PAL.gold, quilt: o.quilt, belt: o.belt });
  if (o.sash && !g.out) { const c = g.c; c.fillStyle = o.sash; c.fillRect(-14.5, hipY - 7, 29, 6); }
}
function inTorsoFB(g, shoY, hipY, hemY, tm, o, front) {
  if (o.torso === 'robe') { robeFB(g, shoY, hipY, hemY, tm.main, o.sash || DHOTI, !front); return; }
  if (o.torso === 'bare') {
    fTorso(g, shoY, hipY, hipY + 2, o.skin, { belt: false, back: !front });
    const c = g.c;
    c.beginPath(); c.moveTo(-16, hipY - 5); c.lineTo(16, hipY - 5); c.lineTo(18.5, hemY); c.quadraticCurveTo(0, hemY + 3.5, -18.5, hemY); c.closePath(); g.fill(tm.main);
    c.beginPath(); if (front) { c.moveTo(-13, shoY - 2); c.lineTo(-3, shoY - 3); c.lineTo(16, hipY - 7); c.lineTo(6, hipY - 3); } else { c.moveTo(13, shoY - 2); c.lineTo(3, shoY - 3); c.lineTo(-16, hipY - 7); c.lineTo(-6, hipY - 3); } c.closePath(); g.fill(o.sash || tm.main);
    if (!g.out) { c.fillStyle = PAL.gold; c.fillRect(-16, hipY - 6.5, 32, 3.6); if (front) { c.beginPath(); c.moveTo(-9, shoY + 1); c.quadraticCurveTo(0, shoY + 8, 9, shoY + 1); c.strokeStyle = PAL.gold; c.lineWidth = 1.6; c.stroke(); } }
    return;
  }
  fTorso(g, shoY, hipY, hemY, tm.main, { w: o.w || 0, trim: o.trim || PAL.gold, quilt: o.quilt, belt: o.belt, back: !front, stripe: front ? o.stripe : null });
  if (o.sash && !g.out) { const c = g.c; c.fillStyle = o.sash; c.fillRect(-17, hipY - 7, 34, 6); }
}
function inShieldSide(g, o, x, y, tm) {
  if (o.shield === 'karwah') gKarwah(g, x + 3, y + 10, 16, 64, o.shieldCol);
  else if (o.shield === 'long') { const c = g.c, p = () => { c.beginPath(); ell(c, x, y + 6, 8, 26); }; p(); g.fill(o.shieldCol || tm.main, true); if (!g.out) { p(); g.inside((c) => { c.lineWidth = 3; c.strokeStyle = PAL.gold; c.beginPath(); ell(c, x, y + 6, 7, 25); c.stroke(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x + 2, y - 30, 10, 70); }); g.dot(x, y + 6, 2.4, PAL.goldL); } }
  else if (o.shield === 'dhal') gDhal(g, x, y, 12.5, o.shieldCol || tm.main);
}
function inShieldFB(g, o, x, y, tm, front) {
  if (!front) { if (o.shield === 'karwah') gKarwah(g, x, y + 8, 36, 64, o.shieldCol); else if (o.shield === 'long') { const c = g.c; c.beginPath(); ell(c, x, y + 6, 13, 26); g.fill(PAL.leather, true); } else gDhalBack(g, x, y, 14); return; }
  if (o.shield === 'karwah') gKarwah(g, x, y + 8, 40, 66, o.shieldCol);
  else if (o.shield === 'long') { const c = g.c, p = () => { c.beginPath(); ell(c, x, y + 6, 14, 28); }; p(); g.fill(o.shieldCol || tm.main, true); if (!g.out) { p(); g.inside((c) => { c.lineWidth = 3.5; c.strokeStyle = PAL.gold; c.beginPath(); ell(c, x, y + 6, 12.5, 26.5); c.stroke(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x + 4, y - 30, 16, 70); c.fillStyle = PAL.gold; c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 5, y + 6); c.lineTo(x, y + 24); c.lineTo(x - 5, y + 6); c.closePath(); c.fill(); }); } }
  else gDhal(g, x, y, 15, o.shieldCol || tm.main);
}
const bladeFn = (w) => (w === 'khanda' ? gKhanda : w === 'straight' ? gSword : gTalwar);

/* ---------- spearmen ---------- */
function inSpearSide(g, p, o) {
  const c = g.c, tm = g.team, sk = o.skin;
  const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob, sleeve = o.sleeve || tm.main;
  sLeg(g, -2, hipY, p.legB, shade(o.legs, -0.3), shade(o.feet, -0.3));
  sLeg(g, 2, hipY, p.legF, o.legs, o.feet);
  const R = (x, y) => rotPt(x, y, 0, hipY, p.lean || 0);
  const sf = R(-3, shoY + 3), sn = R(4, shoY + 2), hd = R(3, L.HEAD + p.bob);
  const ca = Math.cos(p.sA), sa = Math.sin(p.sA), back = p.anim === 'attack' ? 40 : 36;
  sArm(g, sf[0], sf[1], p.sHx, p.sHy, shade(sleeve, -0.3), shade(sk, -0.2), p.anim === 'attack' ? -1 : 1);
  gSpear(g, p.sHx - ca * back, p.sHy - sa * back, p.sA, o.len || 120, { tassel: o.tassel });
  c.save(); c.translate(0, hipY); c.rotate(p.lean || 0); c.translate(0, -hipY);
  inTorsoSide(g, shoY, hipY, (o.hem || -18) + p.bob, tm, o);
  c.restore();
  inHeadSide(g, hd[0], hd[1], Object.assign({ skin: sk }, o.head));
  const shx = 16 + (p.thr > 0 ? p.thr * 0.12 : 0), shy = -52 + p.bob;
  sArm(g, sn[0], sn[1], shx - 3, shy + 2, sleeve, sk, 1, true);
  inShieldSide(g, o, shx, shy, tm);
}
function inSpearFB(g, p, o, front) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || tm.main;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb;
  const atk = p.anim === 'attack', th = atk ? p.thr : 0, hemY = (o.hem || -18) + p.fb;
  const H = Object.assign({ skin: sk }, o.head);
  if (front) {
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, true);
    inHeadFB(g, hy, H, true);
    let b, tip;
    if (atk) { b = [-6, -118 + th * 0.8]; tip = [-9, 22 + th * 1.4]; } else { b = [-18, -2]; tip = [-20, -(o.len || 120) - 10]; if (p.walking) { b[1] -= 12; tip[1] -= 12; } }
    const a = Math.atan2(tip[1] - b[1], tip[0] - b[0]), len = Math.hypot(tip[0] - b[0], tip[1] - b[1]);
    gSpear(g, b[0], b[1], a, len, { tassel: o.tassel });
    const h = atk ? [lerp(b[0], tip[0], 0.3), lerp(b[1], tip[1], 0.3)] : [lerp(b[0], tip[0], 0.36) + 1.5, lerp(b[1], tip[1], 0.36)];
    fArm(g, -15, shoY + 4, h[0], h[1], sleeve, sk, 1, true);
    fArm(g, 15, shoY + 4, 10, -52 + p.fb, sleeve, sk, -1, true);
    inShieldFB(g, o, 8, -50 + p.fb, tm, true);
  } else {
    inShieldFB(g, o, -15, -50 + p.fb, tm, false);
    let b, tip;
    if (atk) { b = [12, -40]; tip = [9, -176 - th * 1.6]; } else { b = [18, -2]; tip = [20, -(o.len || 120) - 10]; if (p.walking) { b[1] -= 12; tip[1] -= 12; } }
    const a = Math.atan2(tip[1] - b[1], tip[0] - b[0]), len = Math.hypot(tip[0] - b[0], tip[1] - b[1]);
    gSpear(g, b[0], b[1], a, len, { tassel: o.tassel });
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, false);
    const h = [lerp(b[0], tip[0], atk ? 0.18 : 0.36) - 1, lerp(b[1], tip[1], atk ? 0.18 : 0.36)];
    fArm(g, 15, shoY + 4, h[0], h[1], sleeve, sk, -1, true);
    fArm(g, -15, shoY + 4, -15, -46 + p.fb, sleeve, sk, 1, true);
    inHeadFB(g, hy, H, false);
  }
}
/* ---------- swordsmen ---------- */
function inSwordSide(g, p, o) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || tm.main, blade = bladeFn(o.weapon), bl = o.bladeLen || 40;
  const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
  sLeg(g, -2, hipY, p.legB, shade(o.legs, -0.3), shade(o.feet, -0.3));
  sLeg(g, 2, hipY, p.legF, o.legs, o.feet);
  const R = (x, y) => rotPt(x, y, 0, hipY, p.lean || 0);
  const sf = R(-3, shoY + 3), sn = R(4, shoY + 2), hd = R(3, L.HEAD + p.bob);
  if (!p.front) blade(g, p.sX, p.sY, p.sA, bl);
  sArm(g, sf[0], sf[1], p.sX, p.sY, shade(sleeve, -0.3), shade(sk, -0.2), 1);
  c.save(); c.translate(0, hipY); c.rotate(p.lean || 0); c.translate(0, -hipY);
  inTorsoSide(g, shoY, hipY, (o.hem || -16) + p.bob, tm, o);
  c.restore();
  inHeadSide(g, hd[0], hd[1], Object.assign({ skin: sk }, o.head));
  const shx = 17 + ((p.lean || 0) > 0.05 ? 3 : 0), shy = -52 + p.bob;
  sArm(g, sn[0], sn[1], shx - 3, shy + 2, sleeve, sk, 1, true);
  inShieldSide(g, o, shx, shy, tm);
  if (p.front) blade(g, p.sX, p.sY, p.sA, bl);
}
function inSwordFB(g, p, o, front) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || tm.main, blade = bladeFn(o.weapon), bl = o.bladeLen || 40;
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb, hemY = (o.hem || -16) + p.fb;
  const sp = swordPoseFB(p, front), H = Object.assign({ skin: sk }, o.head);
  if (front) {
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, true);
    inHeadFB(g, hy, H, true);
    if (!sp.over) blade(g, sp.x, sp.y, sp.a, bl);
    fArm(g, -16, shoY + 4, sp.x, sp.y, sleeve, sk, 1, true);
    fArm(g, 16, shoY + 4, 10, -52 + p.fb, sleeve, sk, -1, true);
    inShieldFB(g, o, 8, -50 + p.fb, tm, true);
    if (sp.over) blade(g, sp.x, sp.y, sp.a, bl);
  } else {
    inShieldFB(g, o, -15, -50 + p.fb, tm, false);
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, false);
    blade(g, sp.x, sp.y, sp.a, bl);
    fArm(g, 16, shoY + 4, sp.x, sp.y, sleeve, sk, -1, true);
    fArm(g, -16, shoY + 4, -15, -46 + p.fb, sleeve, sk, 1, true);
    inHeadFB(g, hy, H, false);
  }
}
/* ---------- archers: the long bamboo bow of India, or the Turkish composite bow ---------- */
function inBow(g, x, y, a, draw, o, part, arrow) {
  if (o.bow === 'recurve') return gRecurve(g, x, y, a, draw, { part, arrow, half: 34 });
  return gLongbow(g, x, y, a, draw, { part, arrow, wood: o.bowCol || '#d2a45a', half: 52 });
}
function inBowSide(g, p, o) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || shade(tm.main, -0.12);
  const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob;
  sLeg(g, -2, hipY, p.legB, shade(o.legs, -0.3), shade(o.feet, -0.3));
  sLeg(g, 2, hipY, p.legF, o.legs, o.feet);
  const carry = p.stage === 'carry';
  sArm(g, -3, shoY + 3, p.bX, p.bY, shade(sleeve, -0.3), shade(sk, -0.2), carry ? 1 : -1);
  const nock = inBow(g, p.bX, p.bY, p.bA, p.draw, o, carry ? undefined : 'stave');
  inTorsoSide(g, shoY, hipY, (o.hem || -20) + p.bob, tm, o);
  inHeadSide(g, 3, L.HEAD + p.bob, Object.assign({ skin: sk }, o.head));
  gQuiverBag(g, 9, hipY + 3, 0.3, o.quiver || PAL.leather);
  if (!carry) inBow(g, p.bX, p.bY, p.bA, p.draw, o, 'string', p.arrow);
  let hand = p.hand;
  if (p.stage === 'draw') hand = nock;
  else if (p.stage === 'nock') hand = [lerp(-6, nock[0], p.hk), lerp(-38, nock[1], p.hk)];
  sArm(g, 3, shoY + 2, hand[0], hand[1], sleeve, sk, p.stage === 'draw' || p.stage === 'loose' ? -1 : 1, true);
}
function inBowFB(g, p, o, front) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || shade(tm.main, -0.12);
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb, hemY = (o.hem || -20) + p.fb;
  const st = p.stage, aim = st === 'draw' || st === 'loose', H = Object.assign({ skin: sk }, o.head), half = o.bow === 'recurve' ? 34 : 52;
  const wood = o.bow === 'recurve' ? '#6d3f22' : o.bowCol || '#d2a45a';
  if (front) {
    fLegs(g, p, o.legs, o.feet);
    if (st === 'carry') fArm(g, -15, shoY + 4, -17, -40 + p.fb - swingArm(p, 1), sleeve, sk, 1);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, true);
    gQuiverBag(g, -12, hipY + 3, -0.25, o.quiver || PAL.leather);
    inHeadFB(g, hy, H, true);
    if (aim) {
      const gx = 7, gy = -68 + p.fb, d = st === 'draw' ? p.draw : 0, nk = st === 'loose' ? [5, gy] : [lerp(4, -6, d), lerp(gy, hy + 6, d)];
      fArm(g, -15, shoY + 4, st === 'loose' ? -19 : nk[0] - 1, st === 'loose' ? hy + 2 : nk[1], sleeve, sk, 1, true);
      gStroke(g, () => { c.beginPath(); c.moveTo(gx + 3, gy - half); c.lineTo(nk[0], nk[1]); c.lineTo(gx + 3, gy + half); }, 1.1, '#efe6d2');
      c.beginPath(); c.moveTo(gx + 2.4, gy - half - 1); c.quadraticCurveTo(gx - 3, gy, gx + 2.4, gy + half + 1); c.lineTo(gx + 5.6, gy + half + 1); c.quadraticCurveTo(gx + 1.5, gy, gx + 5.6, gy - half - 1); c.closePath(); g.fill(wood);
      if (p.arrow && st === 'draw') { c.beginPath(); circ(c, gx, gy, 2.6); g.fill(PAL.steelD); }
      fArm(g, 15, shoY + 4, gx + 1, gy, sleeve, sk, -1, true);
    } else {
      const lowered = st !== 'carry', bx = lowered ? 6 : 18, by = lowered ? -46 + p.fb : -52 + p.fb;
      inBow(g, bx, by, lowered ? 1.2 : 0.02, 0, o, undefined, st === 'nock' && p.arrow);
      fArm(g, 15, shoY + 4, bx, by, sleeve, sk, -1, true);
      if (lowered) fArm(g, -15, shoY + 4, lerp(-10, 2, p.hk || 0.5), lerp(-38, -48, p.hk || 0.5) + p.fb, sleeve, sk, 1, true);
    }
  } else {
    const gx = -7, gy = -70 + p.fb;
    if (aim) { c.beginPath(); c.moveTo(gx - 2.4, gy - half - 2); c.quadraticCurveTo(gx + 3, gy, gx - 2.4, gy + half + 2); c.lineTo(gx - 5.6, gy + half + 2); c.quadraticCurveTo(gx - 1.5, gy, gx - 5.6, gy - half - 2); c.closePath(); g.fill(wood); }
    else if (st === 'carry') inBow(g, -17, -52 + p.fb, Math.PI - 0.02, 0, o);
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, false);
    gQuiverBag(g, 11, hipY + 3, 0.25, o.quiver || PAL.leather);
    inHeadFB(g, hy, H, false);
    if (aim) {
      const d = st === 'draw' ? p.draw : 0, nk = st === 'loose' ? [gx - 3, gy] : [lerp(gx - 3, 7, d), lerp(gy, hy + 5, d)];
      gStroke(g, () => { c.beginPath(); c.moveTo(gx - 3, gy - half - 1); c.lineTo(nk[0], nk[1]); c.lineTo(gx - 3, gy + half + 1); }, 1.1, '#efe6d2');
      fArm(g, -15, shoY + 4, gx - 2, gy + 4, sleeve, sk, 1, true);
      fArm(g, 15, shoY + 4, st === 'loose' ? 20 : nk[0] + 2, st === 'loose' ? hy + 4 : nk[1] + 2, sleeve, sk, -1, true);
    } else if (st === 'carry') {
      fArm(g, -15, shoY + 4, -17, -50 + p.fb, sleeve, sk, 1, true);
      fArm(g, 15, shoY + 4, 17, -40 + p.fb + swingArm(p, 1), sleeve, sk, -1, true);
    } else {
      inBow(g, -4, -48 + p.fb, Math.PI - 1.2, 0, o);
      fArm(g, -15, shoY + 4, -4, -48 + p.fb, sleeve, sk, 1, true);
      fArm(g, 15, shoY + 4, 8, -46 + p.fb, sleeve, sk, -1, true);
    }
  }
}
/* ---------- matchlockmen (the Mughal tufangchi): aim, fire, smoke, reload with the ramrod ---------- */
const GUN = { D: 2.2, len: 84 };
function gunPose(anim, t) {
  const p = motion(anim, t, 0.62);
  if (anim === 'attack') {
    const u = (t % GUN.D) / GUN.D;
    let stage, k = 0;
    if (u < 0.12) { stage = 'aim'; k = smooth(u / 0.12); }
    else if (u < 0.3) { stage = 'fire'; k = seg(u, 0.12, 0.3); }
    else if (u < 0.45) { stage = 'smoke'; k = seg(u, 0.3, 0.45); }
    else if (u < 0.55) { stage = 'lower'; k = smooth(seg(u, 0.45, 0.55)); }
    else if (u < 0.86) { stage = 'reload'; k = seg(u, 0.55, 0.86); }
    else { stage = 'raise'; k = smooth(seg(u, 0.86, 1)); }
    Object.assign(p, { stage, k, u, legF: [0.28, 0.18], legB: [-0.26, -0.2], bob: 1 });
  } else Object.assign(p, { stage: 'carry', k: 0 });
  return p;
}
function gunGeom(p) {
  // butt position and angle of the matchlock in the side view
  const st = p.stage, k = p.k;
  if (st === 'aim') return { x: lerp(8, -2, k), y: lerp(-52, -68, k), a: lerp(-1.1, -0.02, k), flash: 0 };
  if (st === 'fire') return { x: -2 - Math.sin(Math.PI * k) * 3, y: -68, a: -0.02 - Math.sin(Math.PI * Math.min(1, k * 2)) * 0.1, flash: k < 0.6 ? 1 - k / 0.6 : 0, smoke: k };
  if (st === 'smoke') return { x: -2, y: -68, a: -0.02, flash: 0, smoke: 0.4 + k * 0.6 };
  if (st === 'lower' || st === 'raise') { const kk = st === 'lower' ? k : 1 - k; return { x: lerp(-2, 14, kk), y: lerp(-68, -22, kk), a: lerp(-0.02, -1.5, kk), flash: 0 }; }
  if (st === 'reload') return { x: 14, y: -22, a: -1.5, flash: 0, rod: Math.abs(Math.sin(k * Math.PI * 2)) };
  return { x: 13, y: -48 + p.bob, a: -2.15 + Math.sin((p.ph || 0)) * 0.02, flash: 0 };
}
function inGunSide(g, p, o) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || shade(tm.main, -0.12);
  const hipY = L.HIP + p.bob, shoY = L.SHO + p.bob, G = gunGeom(p), ca = Math.cos(G.a), sa = Math.sin(G.a);
  sLeg(g, -2, hipY, p.legB, shade(o.legs, -0.3), shade(o.feet, -0.3));
  sLeg(g, 2, hipY, p.legF, o.legs, o.feet);
  const fh = [G.x + ca * 34, G.y + sa * 34 + 3], bh = [G.x + ca * 10, G.y + sa * 10 + 3];
  const aiming = p.stage === 'aim' || p.stage === 'fire' || p.stage === 'smoke';
  sArm(g, -3, shoY + 3, aiming ? fh[0] : bh[0] + 2, aiming ? fh[1] : bh[1], shade(sleeve, -0.3), shade(sk, -0.2), aiming ? 1 : -1);
  inTorsoSide(g, shoY, hipY, (o.hem || -14) + p.bob, tm, o);
  // powder flask and match cord at the belt
  c.beginPath(); c.moveTo(-12, hipY - 2); c.quadraticCurveTo(-18, hipY + 6, -12, hipY + 12); c.quadraticCurveTo(-6, hipY + 6, -12, hipY - 2); c.closePath(); g.fill(PAL.leather);
  inHeadSide(g, 3, L.HEAD + p.bob, Object.assign({ skin: sk }, o.head));
  gMusket(g, G.x, G.y, G.a, GUN.len, { flash: G.flash });
  if (G.rod != null) { const mx = G.x + ca * GUN.len, my = G.y + sa * GUN.len, r = 26 * (1 - G.rod * 0.8); c.beginPath(); cap(c, mx, my - r, mx + 1, my - r - 30, 1.4); g.fill(PAL.steelL); sArm(g, 3, shoY + 2, mx + 1, my - r - 22, sleeve, sk, 1, true); }
  else sArm(g, 3, shoY + 2, aiming ? bh[0] : fh[0], aiming ? bh[1] : fh[1], sleeve, sk, aiming ? -1 : 1, true);
  if (G.smoke) gunSmoke(g, G.x + ca * (GUN.len + 6), G.y + sa * (GUN.len + 6), G.smoke);
}
function inGunFB(g, p, o, front) {
  const c = g.c, tm = g.team, sk = o.skin, sleeve = o.sleeve || shade(tm.main, -0.12);
  const hipY = L.HIP + p.fb, shoY = L.SHO + p.fb, hy = L.HEAD + p.fb, hemY = (o.hem || -14) + p.fb, H = Object.assign({ skin: sk }, o.head);
  const st = p.stage, aiming = st === 'aim' || st === 'fire' || st === 'smoke', G = gunGeom(p);
  const upright = (x, rod) => {   // the matchlock stood on its butt beside the soldier
    c.beginPath(); rr(c, x - 2.2, -96 + p.fb, 4.4, 76, 1.6); g.fill(PAL.steelD);
    c.beginPath(); rr(c, x - 3.4, -40 + p.fb, 6.8, 26, 2.4); g.fill('#8a4f2a');
    if (rod != null) { c.beginPath(); cap(c, x + 1, -96 + p.fb - 26 * (1 - rod * 0.8), x + 1, -126 + p.fb - 26 * (1 - rod * 0.8), 1.3); g.fill(PAL.steelL); }
  };
  if (front) {
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, true);
    inHeadFB(g, hy, H, true);
    if (aiming) {
      // the barrel points at the camera: the stock along the cheek and a dark muzzle ring
      c.beginPath(); rr(c, -14, hy + 2, 12, 7, 3); g.fill('#8a4f2a');
      c.beginPath(); circ(c, -6, hy + 8, 5.5); g.fill(PAL.steelD);
      if (!g.out) g.dot(-6, hy + 8, 2.4, '#1a1410');
      fArm(g, -15, shoY + 4, -10, hy + 12, sleeve, sk, 1, true);
      fArm(g, 15, shoY + 4, -2, hy + 16, sleeve, sk, -1, true);
      if (G.flash > 0 && !g.out) { c.save(); c.globalAlpha = G.flash; c.fillStyle = '#fff2a8'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = i % 2 ? 6 : 14; c.lineTo(-6 + Math.cos(a) * r, hy + 8 + Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }
      if (G.smoke) gunSmoke(g, -12, hy + 4, G.smoke);
    } else {
      const x = -18;
      upright(x, G.rod);
      fArm(g, -15, shoY + 4, x, -60 + p.fb, sleeve, sk, 1, true);
      fArm(g, 15, shoY + 4, G.rod != null ? x + 1 : 12, G.rod != null ? -126 + p.fb - 26 * (1 - G.rod * 0.8) + 20 : -40 + p.fb + swingArm(p, 1), sleeve, sk, -1, true);
    }
  } else {
    if (!aiming) upright(18, G.rod);
    fLegs(g, p, o.legs, o.feet);
    inTorsoFB(g, shoY, hipY, hemY, tm, o, false);
    if (aiming) {
      c.beginPath(); cap(c, 8, shoY + 2, 5, hy - 22, 2.6); g.fill(PAL.steelD);
      fArm(g, 15, shoY + 4, 9, shoY + 2, sleeve, sk, -1, true);
      fArm(g, -15, shoY + 4, 5, hy - 6, sleeve, sk, 1, true);
      if (G.smoke) gunSmoke(g, 6, hy - 28, G.smoke);
    } else {
      fArm(g, 15, shoY + 4, 18, -60 + p.fb, sleeve, sk, -1, true);
      fArm(g, -15, shoY + 4, -17, -40 + p.fb - swingArm(p, 1), sleeve, sk, 1, true);
    }
    inHeadFB(g, hy, H, false);
  }
}

/* ---------- the unit definitions ---------- */
function defFoot(key, name, kind, o, extra) {
  const O = Object.assign({ skin: SKIN.in, legs: DHOTI, feet: SKIN.in, torso: 'tunic' }, o);
  if (O.feet === 'skin') O.feet = O.skin;
  if (O.legs === 'skin') O.legs = O.skin;
  if (O.torso === 'bare' && !O.sleeve) O.sleeve = O.skin;
  const V = { spear: [spearPose, inSpearSide, inSpearFB], sword: [(a, t) => TROOPS.sword.pose(a, t), inSwordSide, inSwordFB], bow: [(a, t) => TROOPS.longbow.pose(a, t), inBowSide, inBowFB], gun: [gunPose, inGunSide, inGunFB] }[kind];
  TROOPS[key] = Object.assign({ name, shadowW: 17, h: 100, opts: O, pose: V[0], side(g, p) { V[1](g, p, O); }, front(g, p) { V[2](g, p, O, true); }, back(g, p) { V[2](g, p, O, false); } }, extra || {});
}
const RED_PAGRI = { kind: 'pagri', col: '#d9483b', band: PAL.gold }, WHITE_PAGRI = { kind: 'pagri', col: '#f4efe2', band: '#d9483b' }, SAFFRON_PAGRI = { kind: 'pagri', col: '#f0a02c', band: '#b8312a' };
// Prithviraj's Rajputs and their neighbours, 12th century: dhoti, quilted coat, turban, long spear or khanda
defFoot('inSpear', 'Spearman', 'spear', { head: RED_PAGRI, feet: 'skin', len: 126, shield: 'dhal', shieldCol: '#7a4a26', tassel: '#f2c22e' });
defFoot('inSword', 'Swordsman', 'sword', { head: SAFFRON_PAGRI, feet: 'skin', weapon: 'khanda', shield: 'dhal', shieldCol: '#7a4a26', quilt: true });
defFoot('inArcher', 'Archer', 'bow', { head: WHITE_PAGRI, feet: 'skin', torso: 'bare', sash: '#f4efe2', hem: -14 }, { special: false });
// the Ghurids: Tajik and Ghuri foot behind the karwah, Khalaj swordsmen
defFoot('ghurFoot', 'Shield-bearer', 'spear', { skin: SKIN.afghan, head: { kind: 'cone', wrap: '#f1e9d6' }, legs: '#e7dcc2', feet: '#7a4a26', len: 112, shield: 'karwah', torso: 'robe', sash: '#2a2320', hem: -12 });
defFoot('khalajSword', 'Swordsman', 'sword', { skin: SKIN.turk, head: { kind: 'afghan', col: '#d9ccb0' }, legs: '#e7dcc2', feet: '#7a4a26', weapon: 'straight', shield: 'dhal', shieldCol: '#5a3a28', torso: 'robe', sash: '#2a2320', hem: -12, beard: '#2a1d16' });
// the Mughals: matchlockmen, and foot with talwar and dhal
defFoot('matchlock', 'Matchlockman', 'gun', { skin: SKIN.mughal, head: { kind: 'mughal', col: '#f4efe2', cap: '#b8312a', sarpech: false }, legs: '#e8dcc0', feet: '#7a4a26', torso: 'robe', sash: '#f2c22e', hem: -12 }, { special: true });
defFoot('mughalSpear', 'Spearman', 'spear', { skin: SKIN.mughal, head: { kind: 'khud' }, legs: '#e8dcc0', feet: '#7a4a26', len: 120, shield: 'dhal', shieldCol: '#5a3a28', torso: 'robe', sash: '#f2c22e', hem: -14, tassel: '#b8312a' });
defFoot('mughalSword', 'Swordsman', 'sword', { skin: SKIN.mughal, head: { kind: 'mughal', col: '#f4efe2', cap: '#2f6f4a', sarpech: false }, legs: '#e8dcc0', feet: '#7a4a26', weapon: 'talwar', shield: 'dhal', shieldCol: '#2a2320', torso: 'robe', sash: '#f2c22e', hem: -12 });
// the Afghans of the Lodi and Sur armies
defFoot('afghanSpear', 'Spearman', 'spear', { skin: SKIN.afghan, head: { kind: 'afghan', col: '#f1e9d6' }, legs: '#e7dcc2', feet: '#7a4a26', len: 120, shield: 'dhal', shieldCol: '#6a4a2c', torso: 'robe', sash: '#4a6a8a', hem: -12 });
defFoot('afghanArcher', 'Archer', 'bow', { skin: SKIN.afghan, head: { kind: 'afghan', col: '#e8dcc0' }, legs: '#e7dcc2', feet: '#7a4a26', bow: 'recurve', torso: 'robe', sash: '#4a6a8a', hem: -12, beard: '#2a1d16' });
defFoot('afghanSword', 'Swordsman', 'sword', { skin: SKIN.afghan, head: { kind: 'afghan', col: '#f1e9d6' }, legs: '#e7dcc2', feet: '#7a4a26', weapon: 'talwar', shield: 'dhal', shieldCol: '#3a2a22', torso: 'robe', sash: '#4a6a8a', hem: -12, beard: '#2a1d16' });
// the Cholas: the Kaikkolar with spear and long shield, archers, and the Velaikkarar, the king's sworn men
defFoot('cholaSpear', 'Kaikkolar', 'spear', { skin: SKIN.south, head: { kind: 'bun' }, feet: 'skin', legs: 'skin', torso: 'bare', len: 120, shield: 'long', hem: -11 });
defFoot('cholaArcher', 'Archer', 'bow', { skin: SKIN.south, head: { kind: 'bun' }, feet: 'skin', legs: 'skin', torso: 'bare', hem: -11, bowCol: '#c8964a' });
defFoot('velaikkarar', 'Velaikkarar', 'sword', { skin: SKIN.south, head: { kind: 'bun' }, feet: 'skin', legs: 'skin', torso: 'bare', weapon: 'khanda', shield: 'long', hem: -11 });
// the Chalukyas of Kalyani
defFoot('southSpear', 'Spearman', 'spear', { skin: SKIN.south, head: { kind: 'pagri', col: '#f4efe2', band: '#f2c22e' }, feet: 'skin', legs: 'skin', torso: 'bare', sash: '#f4efe2', len: 118, shield: 'dhal', shieldCol: '#6a4a2c', hem: -11 });
defFoot('southArcher', 'Archer', 'bow', { skin: SKIN.south, head: { kind: 'pagri', col: '#f4efe2', band: '#f2c22e' }, feet: 'skin', legs: 'skin', torso: 'bare', sash: '#f4efe2', hem: -11, bowCol: '#c8964a' });
defFoot('southSword', 'Swordsman', 'sword', { skin: SKIN.south, head: { kind: 'pagri', col: '#f0a02c', band: '#b8312a' }, feet: 'skin', legs: 'skin', torso: 'bare', sash: '#f4efe2', weapon: 'khanda', shield: 'dhal', shieldCol: '#3a2a22', hem: -11 });

/* ===== src/art/25b-elephants.js ===== */
/* Roll to War: war elephants — the common war elephant with a mahout and an archer in its howdah, the armoured
   elephants of the Afghans, the Chola elephants, and the kings and generals who fought from them under a royal
   parasol. Unit space as the other troops: feet at 0, facing +x in the side view; an elephant stands about 200 tall. */

const ELE = { skin: '#8f8a85', far: '#66615c', nail: '#ece4d2', ivory: '#f4ecd8', pink: '#dba69c', wood: '#a8733f' };
const ELE_D = 1.25;   // attack cycle (GAME.ART_ANIM elephant)

/* ---------- the rider's weapon cycle, timed to the elephant's attack ---------- */
function eleBowPose(anim, t) {
  if (anim !== 'attack') return { draw: 0, bA: 1.2, arrow: false, stage: 'carry' };
  const u = (t % ELE_D) / ELE_D;
  if (u < 0.12) return { draw: 0, bA: 0.4, arrow: u > 0.05, stage: 'nock' };
  if (u < 0.45) { const k = smooth(seg(u, 0.12, 0.45)); return { draw: k, bA: lerp(0.4, -0.12, k), arrow: true, stage: 'draw' }; }
  if (u < 0.52) return { draw: 1, bA: -0.12, arrow: true, stage: 'draw' };
  if (u < 0.7) return { draw: 0, bA: -0.12, arrow: false, stage: 'loose' };
  return { draw: 0, bA: lerp(-0.12, 0.4, smooth(seg(u, 0.7, 1))), arrow: false, stage: 'lower' };
}
function eleThrowPose(anim, t) {
  if (anim !== 'attack') return { jv: 'carry', jk: 0 };
  const u = (t % ELE_D) / ELE_D;
  if (u < 0.3) return { jv: 'wind', jk: smooth(u / 0.3) };
  if (u < 0.42) return { jv: 'throw', jk: easeOut(seg(u, 0.3, 0.42)) };
  if (u < 0.75) return { jv: 'empty', jk: seg(u, 0.42, 0.75) };
  return { jv: 'fetch', jk: smooth(seg(u, 0.75, 1)) };
}
function elePose(K) {
  return function (anim, t) {
    const p = { anim, t, hb: 0, ph: 0, tr: 0, sw: 0, nod: 0, stomp: 0, lunge: 0, walk: false, tail: Math.sin(t * 2.2) * 5, ear: Math.sin(t * 1.9) * 0.08 };
    if (anim === 'walk') { const ph = (t / 0.95) * TAU; p.ph = ph; p.walk = true; p.hb = -Math.abs(Math.sin(ph)) * 2.2 + 1.1; p.sw = Math.sin(ph) * 0.1; p.nod = Math.sin(ph * 2) * 0.02; }
    else if (anim === 'attack') {
      const u = (t % ELE_D) / ELE_D, up = u < 0.36 ? smooth(u / 0.36) : u < 0.5 ? 1 - easeIn(seg(u, 0.36, 0.5)) : 0;
      Object.assign(p, { u, tr: up, stomp: up, nod: -0.09 * up + 0.05 * Math.sin(Math.PI * seg(u, 0.48, 0.62)), lunge: 7 * Math.sin(Math.PI * seg(u, 0.4, 0.72)), hb: Math.sin(t * 2) * 0.5 });
    } else { p.hb = Math.sin(t * 1.6) * 0.8; p.sw = Math.sin(t * 1.1) * 0.12; }
    const w = K.rider && K.rider.weapon;
    if (w === 'bow') Object.assign(p, eleBowPose(anim, t)); else if (w === 'javelin' || w === 'none') Object.assign(p, eleThrowPose(anim, t));
    return p;
  };
}

/* ---------- body parts ---------- */
// a pillar leg from the hip joint (x, top) to the foot; o.raise lifts it for the stomp, o.walk swings it
function eleLeg(g, x, top, ph, col, o = {}) {
  const c = g.c, r = o.raise || 0, lift = o.walk ? Math.max(0, Math.cos(ph)) * 7 : 0;
  const fx = x + (o.walk ? 12 * Math.sin(ph) : 0) + r * 22, fy = -lift - r * 34;
  const e = ik(x, top, fx, fy - 8, 34, 33, o.hind ? 1 : -1);
  c.beginPath(); taper(c, x, top, e.ex, e.ey, 27, 23); taper(c, e.ex, e.ey, e.hx, e.hy, 23, 22); g.fill(col);
  c.save(); c.translate(e.hx, e.hy + 8); c.rotate(Math.atan2(e.hx - e.ex, e.ey - e.hy) * -0.4);
  c.beginPath(); c.moveTo(-12, -10); c.lineTo(12, -10); c.quadraticCurveTo(14, -2, 13, 0); c.lineTo(-13, 0); c.quadraticCurveTo(-14, -2, -12, -10); c.closePath(); g.fill(col);
  if (!g.out) { for (const nx of [-7, 0, 7]) { c.beginPath(); ell(c, nx + 2, -2.2, 3, 2.2); c.fillStyle = ELE.nail; c.fill(); } g.line([-11, -8, 11, -8], 'rgba(0,0,0,0.18)', 1.4); }
  c.restore();
  if (!g.out) { g.line([e.ex - 9, e.ey - 2, e.ex + 7, e.ey], 'rgba(0,0,0,0.2)', 1.3); g.line([e.ex - 8, e.ey + 3, e.ex + 6, e.ey + 4], 'rgba(0,0,0,0.14)', 1.1); }
}
// a front/back view leg: a straight pillar with a round foot
function eleLegFB(g, x, lift, top, col, w) {
  const c = g.c;
  c.beginPath(); taper(c, x, top, x, -9 - lift, w, w * 0.92); g.fill(col);
  c.beginPath(); ell(c, x, -5 - lift, w * 0.56, 5.5); g.fill(col);
  if (!g.out) { for (const nx of [-0.28, 0, 0.28]) { c.beginPath(); ell(c, x + nx * w, -3.5 - lift, 2.8, 2); c.fillStyle = ELE.nail; c.fill(); } g.line([x - w * 0.4, -30 - lift, x + w * 0.4, -30 - lift], 'rgba(0,0,0,0.16)', 1.2); }
}
// trunk centreline from the base (x, y): angle a0, curl per segment; returns points with widths
function trunkPts(x, y, a0, curl, tipCurl, n = 7, sl = 10.5) {
  const P = [[x, y, a0]]; let a = a0, px = x, py = y;
  for (let i = 1; i <= n; i++) { a += curl + (i >= n - 1 ? tipCurl : 0); px += Math.cos(a) * sl; py += Math.sin(a) * sl; P.push([px, py, a]); }
  return P;
}
function trunkPath(c, P, w0, w1) {
  const n = P.length - 1, L = [], R = [];
  P.forEach(([x, y, a], i) => { const w = lerp(w0, w1, i / n) / 2, nx = -Math.sin(a), ny = Math.cos(a); L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]); });
  c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (const q of L) c.lineTo(q[0], q[1]);
  const [tx, ty, ta] = P[n]; c.arc(tx, ty, w1 / 2, ta + Math.PI / 2, ta - Math.PI / 2, true);
  for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath();
}
function trunkDraw(g, P, col) {
  const c = g.c; trunkPath(c, P, 17, 7.5); g.fill(col);
  if (g.out) return;
  trunkPath(c, P, 17, 7.5); g.inside((c) => { c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.1; P.forEach(([x, y, a], i) => { if (!i || i === P.length - 1) return; const w = lerp(17, 7.5, i / (P.length - 1)) / 2 + 1, nx = -Math.sin(a), ny = Math.cos(a); for (const o of [-2.5, 2.5]) { const cx = x + Math.cos(a) * o, cy = y + Math.sin(a) * o; c.beginPath(); c.moveTo(cx + nx * w, cy + ny * w); c.lineTo(cx - nx * w, cy - ny * w); c.stroke(); } }); });
  const [tx, ty] = P[P.length - 1]; g.dot(tx, ty, 2, 'rgba(40,30,30,0.6)');
}
// the royal parasol (chhatra) on its pole: top of the pole at (x, y)
function gParasol(g, x, y, col, t) {
  const c = g.c, sw = Math.sin(t * 1.3) * 0.03;
  c.save(); c.translate(x, y); c.rotate(sw);
  c.beginPath(); cap(c, 0, 0, 0, 74, 2.4); g.fill(PAL.gold);
  const dome = () => { c.beginPath(); c.moveTo(-27, 2); c.bezierCurveTo(-26, -16, 26, -16, 27, 2); c.quadraticCurveTo(0, -3, -27, 2); c.closePath(); };
  dome(); g.fill(col);
  if (!g.out) { dome(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(6, -20, 30, 26); c.strokeStyle = PAL.gold; c.lineWidth = 1.4; for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(k * 18, -12); c.lineTo(k * 34, 3); c.stroke(); } }); }
  c.beginPath(); for (let i = 0; i < 9; i++) { const fx = -26 + i * 6.5; c.moveTo(fx - 2.6, 1); c.lineTo(fx, 8 + (i % 2) * 2); c.lineTo(fx + 2.6, 1); } g.fill(PAL.gold);
  c.beginPath(); circ(c, 0, -13, 3.2); g.fill(PAL.gold);
  c.restore();
}
// the cloth (jhul) over the back, or scale armour with a team border
function jhulSide(g, K, tm, by) {
  const c = g.c, n = 7, x0 = 32, x1 = -48, hem = by + 17;
  const path = () => { c.beginPath(); c.moveTo(29, by - 31); c.bezierCurveTo(12, by - 42, -30, by - 44, -47, by - 22); c.lineTo(x1, hem); for (let i = 0; i < n; i++) { const xa = lerp(x1, x0, i / n), xb = lerp(x1, x0, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, hem + 8, xb, hem); } c.lineTo(35, by - 12); c.closePath(); };
  path(); g.fill(K.armor ? PAL.steel : tm.main);
  if (g.out) return;
  if (!K.armor && K.jhul && K.jhul !== 'team') { path(); paintInside(g, K.jhul, tm, -50, by - 46, 88, 72); }
  path(); g.inside((c) => {
    if (K.armor) {
      for (let r = 0; r < 7; r++) for (let q = 0; q < 12; q++) { const x = -52 + q * 8 + (r % 2) * 4, y = by - 40 + r * 8; c.beginPath(); rr(c, x, y, 7, 8, 2.5); c.fillStyle = (q + r) % 3 ? '#c9d0d8' : '#aab3bd'; c.fill(); c.strokeStyle = 'rgba(40,46,56,0.5)'; c.lineWidth = 0.9; c.stroke(); }
      c.fillStyle = tm.main; c.fillRect(-60, hem - 9, 110, 8); c.fillRect(-26, by - 26, 26, 20);
    } else if (K.pattern !== false && g.detail >= 1) {
      c.fillStyle = PAL.gold; for (let q = 0; q < 5; q++) for (let r = 0; r < 2; r++) { const x = -40 + q * 16 + r * 8, y = by - 16 + r * 14; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 4, y); c.lineTo(x, y + 4); c.lineTo(x - 4, y); c.closePath(); c.fill(); }
    }
    c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(-60, by + 4, 110, 30); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-60, by - 44, 110, 8);
    c.lineWidth = 5; c.strokeStyle = K.trim || PAL.gold; c.beginPath(); c.moveTo(x1, hem); for (let i = 0; i < n; i++) { const xa = lerp(x1, x0, i / n), xb = lerp(x1, x0, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, hem + 8, xb, hem); } c.stroke();
  });
  if (K.bells !== false) for (let i = 0; i <= n; i++) { const bx = lerp(x1, x0, i / n); c.beginPath(); ell(c, bx, hem + 4, 2.6, 3); c.fillStyle = PAL.goldL; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke(); }
}
// the ropes that hold the howdah, running round the belly
function girthSide(g, by, x0, x1) {
  if (g.out) return;
  for (const [x, dx] of [[x0 + 5, -2], [x1 - 5, 2]]) g.line([x, by - 36, x + dx, by - 10, x + dx * 1.5, by + 22], '#6d4a2c', 2.2);
}
// the howdah: a railed seat on the back (royal ones gilded, with corner posts)
function howdahSide(g, K, tm, x0, x1, base) {
  const c = g.c, royal = K.howdah === 'royal', H = royal ? 15 : 12;
  const box = () => { c.beginPath(); c.moveTo(x0, base); c.lineTo(x0 - 2, base - H); c.lineTo(x1 + 2, base - H); c.lineTo(x1, base); c.closePath(); };
  box(); g.fill(royal ? PAL.gold : ELE.wood);
  if (!g.out) { box(); g.inside((c) => {
    c.fillStyle = royal ? tm.main : shade(ELE.wood, -0.18); c.fillRect(x0 + 3, base - H + 4, x1 - x0 - 6, H - 8);
    c.fillStyle = royal ? PAL.goldL : PAL.gold; for (let x = x0 + 7; x < x1 - 4; x += 8) { c.beginPath(); c.moveTo(x, base - H + 4); c.lineTo(x + 3, base - H / 2); c.lineTo(x, base - 4); c.lineTo(x - 3, base - H / 2); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x0 - 4, base - 5, x1 - x0 + 8, 5);
  }); }
  for (const x of [x0 - 1, x1 + 1]) { c.beginPath(); rr(c, x - 2.4, base - H - (royal ? 12 : 6), 4.8, H + (royal ? 12 : 6), 1.6); g.fill(royal ? PAL.goldD : shade(ELE.wood, -0.25)); c.beginPath(); circ(c, x, base - H - (royal ? 14 : 8), 3); g.fill(PAL.gold); }
}
function howdahFB(g, K, tm, w, base, front) {
  const c = g.c, royal = K.howdah === 'royal', H = royal ? 15 : 12;
  const box = () => { c.beginPath(); c.moveTo(-w, base); c.lineTo(-w - 2, base - H); c.lineTo(w + 2, base - H); c.lineTo(w, base); c.closePath(); };
  box(); g.fill(royal ? PAL.gold : ELE.wood);
  if (!g.out) { box(); g.inside((c) => { c.fillStyle = royal ? tm.main : shade(ELE.wood, -0.18); c.fillRect(-w + 3, base - H + 4, w * 2 - 6, H - 8); c.fillStyle = royal ? PAL.goldL : PAL.gold; for (let x = -w + 6; x < w - 3; x += 8) { c.beginPath(); c.moveTo(x, base - H + 4); c.lineTo(x + 3, base - H / 2); c.lineTo(x, base - 4); c.lineTo(x - 3, base - H / 2); c.closePath(); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(4, base - H, w, H); }); }
  for (const x of [-w - 1, w + 1]) { c.beginPath(); rr(c, x - 2.4, base - H - (royal ? 12 : 6), 4.8, H + (royal ? 12 : 6), 1.6); g.fill(royal ? PAL.goldD : shade(ELE.wood, -0.25)); c.beginPath(); circ(c, x, base - H - (royal ? 14 : 8), 3); g.fill(PAL.gold); }
}

/* ---------- people on the elephant ---------- */
// the mahout sits on the neck, feet behind the ears, with his goad. M = { skin, cloth, head }
function mahoutSide(g, M, tm, x, y, p, part) {
  // part 'leg' is drawn under the ear; the rest over it. (x, y) = the seat on the neck
  const c = g.c, sk = M.skin || SKIN.in;
  if (part === 'leg') { c.beginPath(); cap(c, x, y - 3, x + 9, y + 9, 9); cap(c, x + 9, y + 9, x + 5, y + 24, 8); g.fill(M.cloth || DHOTI); return; }
  const sh = y - 26;
  sArm(g, x - 2, sh + 4, x + 8, sh + 16, shade(M.cloth || DHOTI, -0.25), shade(sk, -0.2), 1);
  const tp = () => { c.beginPath(); c.moveTo(x - 10, sh); c.quadraticCurveTo(x + 2, sh - 4, x + 10, sh + 1); c.quadraticCurveTo(x + 13, sh + 14, x + 10, y + 2); c.quadraticCurveTo(x, y + 5, x - 11, y + 1); c.quadraticCurveTo(x - 13, sh + 14, x - 10, sh); c.closePath(); };
  tp(); g.fill(M.cloth || DHOTI);
  if (!g.out) { tp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x - 16, sh - 4, 9, 40); c.fillStyle = M.sash || tm.main; c.fillRect(x - 14, y - 6, 28, 5); }); }
  inHeadSide(g, x + 2, sh - 12, Object.assign({ skin: sk }, M.head || { kind: 'pagri', col: tm.main }));
  const a = -0.45 + (p.tr || 0) * -0.5, hx = x + 16, hy = sh + 8 - (p.tr || 0) * 6;
  gAnkus(g, hx - Math.cos(a) * 8, hy - Math.sin(a) * 8, a, 22);
  sArm(g, x + 3, sh + 3, hx, hy, M.cloth || DHOTI, sk, 1, true);
}
function mahoutFB(g, M, tm, x, y, front) {
  const c = g.c, sk = M.skin || SKIN.in, sh = y - 26;
  const tp = () => { c.beginPath(); c.moveTo(x - 12, sh); c.quadraticCurveTo(x, sh - 4, x + 12, sh); c.quadraticCurveTo(x + 15, sh + 14, x + 12, y + 2); c.quadraticCurveTo(x, y + 5, x - 12, y + 2); c.quadraticCurveTo(x - 15, sh + 14, x - 12, sh); c.closePath(); };
  tp(); g.fill(M.cloth || DHOTI);
  if (!g.out) { tp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x + 5, sh - 4, 12, 40); c.fillStyle = M.sash || tm.main; c.fillRect(x - 16, y - 6, 32, 5); }); }
  c.save(); c.translate(x, 0); inHeadFB(g, sh - 12, Object.assign({ skin: sk }, M.head || { kind: 'pagri', col: tm.main }), front); c.restore();
  if (front) { fArm(g, x - 12, sh + 4, x - 6, sh + 20, M.cloth || DHOTI, sk, 1, true); gAnkus(g, x + 6, sh + 22, -1.9, 22); fArm(g, x + 12, sh + 4, x + 7, sh + 20, M.cloth || DHOTI, sk, -1, true); }
}
// the fighter in the howdah (or the king himself). R is a rider kit (15-mounted.js), p carries the weapon pose
// a rider kit may say 'team' for its sleeves: resolve it for the team being drawn
function riderCols(R, tm) {
  const k = '_' + tm.key; if (R[k]) return R[k];
  const out = Object.assign({}, R); for (const f of ['arm', 'legs', 'boots']) if (out[f] === 'team') out[f] = tm.main;
  return (R[k] = out);
}
function howdahRiderSide(g, p, R, tm, x, rb) {
  R = riderCols(R, tm);
  const c = g.c, w = R.weapon, sk = R.hand;
  c.save(); c.translate(x, 0);
  if (w === 'bow') {
    const gx = p.stage === 'carry' ? 14 : 22, gy = p.stage === 'carry' ? rb - 34 : rb - 46;
    sArm(g, -3, rb - 45, gx, gy, shade(R.arm, -0.3), shade(sk, -0.25), p.stage === 'carry' ? 1 : -1);
    if (p.stage === 'carry') gRecurve(g, gx, gy, p.bA, 0); else gRecurve(g, gx, gy, p.bA, p.draw, { part: 'stave' });
    p._bow = [gx, gy];
  } else sArm(g, -3, rb - 45, 12, rb - 30, shade(R.arm, -0.3), shade(sk, -0.25), 1);
  if (w === 'javelin') for (const dx of [-12, -8, -4]) gJavelin(g, dx, rb - 16, -1.7, 44);
  const rtp = () => { c.beginPath(); c.moveTo(-13, rb - 51); c.quadraticCurveTo(2, rb - 56, 12, rb - 50); c.quadraticCurveTo(17, rb - 36, 13, rb - 20); c.quadraticCurveTo(0, rb - 15, -14, rb - 20); c.quadraticCurveTo(-18, rb - 36, -13, rb - 51); c.closePath(); };
  rtp(); g.fill(R.bare ? sk : R.torso === 'team' ? tm.main : typeof R.torso === 'string' ? R.torso : tm.main);
  if (!g.out) {
    if (R.torso && typeof R.torso === 'object' && !R.bare) { rtp(); paintInside(g, R.torso, tm, -18, rb - 58, 36, 42); }
    rtp(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.17)'; c.fillRect(-20, rb - 60, 11, 50); if (R.bare) { c.fillStyle = R.sash || tm.main; c.beginPath(); c.moveTo(-12, rb - 52); c.lineTo(-6, rb - 53); c.lineTo(13, rb - 24); c.lineTo(6, rb - 22); c.closePath(); c.fill(); } c.fillStyle = PAL.gold; c.fillRect(-20, rb - 27, 40, 4); });
    if (R.bare || R.jewels) { c.beginPath(); c.moveTo(-6, rb - 52); c.quadraticCurveTo(6, rb - 42, 11, rb - 50); c.strokeStyle = PAL.gold; c.lineWidth = 2; c.stroke(); }
  }
  riderHeadSide(g, R, tm, 0, rb - 62);
  if (w === 'bow') {
    const [gx, gy] = p._bow; let hand = [8, rb - 36];
    if (p.stage !== 'carry') { const nk = gRecurve(g, gx, gy, p.bA, p.draw, { part: 'string', arrow: p.arrow }); hand = p.stage === 'loose' ? [-8, rb - 58] : p.stage === 'lower' ? [2, rb - 40] : nk; }
    sArm(g, 3, rb - 46, hand[0], hand[1], R.arm, sk, p.stage === 'carry' ? 1 : -1, true);
  } else if (w === 'javelin') {
    const st = p.jv, k = p.jk;
    let hx = 10, hy = rb - 38, a = -1.45, show = true;
    if (st === 'wind') { hx = lerp(10, -12, k); hy = lerp(rb - 38, rb - 66, k); a = lerp(-1.45, -0.28, k); }
    else if (st === 'throw') { hx = lerp(-12, 22, k); hy = lerp(rb - 66, rb - 52, k); a = -0.28; show = k < 0.5; }
    else if (st === 'empty') { hx = lerp(22, 4, k); hy = lerp(rb - 52, rb - 30, k); show = false; }
    else if (st === 'fetch') { hx = lerp(-6, 10, k); hy = lerp(rb - 22, rb - 38, k); a = lerp(-1.7, -1.45, k); }
    if (show) gJavelin(g, hx - Math.cos(a) * 18, hy - Math.sin(a) * 18, a, 58);
    sArm(g, 3, rb - 46, hx, hy, R.arm, sk, st === 'wind' ? -1 : 1, true);
  } else {
    const up = p.jv === 'wind' || p.jv === 'throw' ? (p.jv === 'wind' ? p.jk : 1 - p.jk) : 0;
    sArm(g, 3, rb - 46, lerp(10, 16, up), lerp(rb - 30, rb - 74, up), R.arm, sk, 1, true);
  }
  c.restore();
}
function howdahRiderFB(g, p, R, tm, x, rb, front) {
  R = riderCols(R, tm);
  const c = g.c, sk = R.hand;
  c.save(); c.translate(x, 0);
  const path = () => { c.beginPath(); c.moveTo(-14, rb - 51); c.quadraticCurveTo(0, rb - 56, 14, rb - 51); c.quadraticCurveTo(18, rb - 36, 15, rb - 20); c.quadraticCurveTo(0, rb - 15, -15, rb - 20); c.quadraticCurveTo(-18, rb - 36, -14, rb - 51); c.closePath(); };
  if (R.weapon === 'bow') weaponFB(g, p, R, tm, rb, front, 'behind');
  path(); g.fill(R.bare ? sk : R.torso === 'team' ? tm.main : typeof R.torso === 'string' ? R.torso : tm.main);
  if (!g.out) {
    if (R.torso && typeof R.torso === 'object' && !R.bare) { path(); paintInside(g, R.torso, tm, -18, rb - 58, 36, 42); }
    path(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(6, rb - 60, 12, 50); if (R.bare) { c.fillStyle = R.sash || tm.main; c.beginPath(); c.moveTo(-13, rb - 52); c.lineTo(-7, rb - 53); c.lineTo(15, rb - 24); c.lineTo(8, rb - 22); c.closePath(); c.fill(); } c.fillStyle = PAL.gold; c.fillRect(-20, rb - 27, 40, 4); });
    if ((R.bare || R.jewels) && front) { c.beginPath(); c.moveTo(-9, rb - 51); c.quadraticCurveTo(0, rb - 40, 9, rb - 51); c.strokeStyle = PAL.gold; c.lineWidth = 2; c.stroke(); }
  }
  const hy = rb - 62;
  if (R.head) inHeadFB(g, hy, Object.assign({ skin: sk }, R.head), front);
  if (R.weapon === 'bow') { if (front) fArm(g, 13, rb - 45, 9, rb - 26, R.arm, sk, -1); weaponFB(g, p, R, tm, rb, front); }
  else if (R.weapon === 'javelin') {
    const sx = front ? -1 : 1, up = p.jv === 'wind' ? p.jk : p.jv === 'throw' ? 1 - p.jk : 0, show = p.jv === 'carry' || p.jv === 'wind' || p.jv === 'fetch' || (p.jv === 'throw' && p.jk < 0.5);
    const hx = sx * 16, hy2 = lerp(rb - 36, rb - 70, up);
    if (show) gJavelin(g, hx, hy2 + 24, -Math.PI / 2 - sx * 0.08, 60);
    fArm(g, sx * 13, rb - 45, hx, hy2, R.arm, sk, front ? 1 : -1, true);
    fArm(g, -sx * 13, rb - 45, -sx * 10, rb - 28, R.arm, sk, front ? -1 : 1, true);
  } else {
    const up = p.jv === 'wind' ? p.jk : p.jv === 'throw' ? 1 - p.jk : 0, sx = front ? -1 : 1;
    fArm(g, sx * 13, rb - 45, sx * lerp(10, 16, up), lerp(rb - 28, rb - 72, up), R.arm, sk, front ? 1 : -1, true);
    fArm(g, -sx * 13, rb - 45, -sx * 10, rb - 28, R.arm, sk, front ? -1 : 1, true);
  }
  c.restore();
}

/* ---------- the whole elephant ---------- */
const ELE_DEF = { skin: ELE.skin, jhul: 'team', trim: PAL.gold, pattern: true, bells: true, armor: false, headPlate: false, headCloth: 'team', tusks: true, tuskSword: false, howdah: 'seat', parasol: null, mahout: {}, rider: null };
function eleHeadSide(g, p, K, tm, hx, hy) {
  const c = g.c, sk = K.skin;
  c.save(); c.translate(hx - 12, hy + 12); c.rotate(p.nod); c.translate(-(hx - 12), -(hy + 12));
  const head = () => { c.beginPath(); c.moveTo(hx - 18, hy + 20); c.bezierCurveTo(hx - 26, hy - 6, hx - 16, hy - 28, hx, hy - 30); c.bezierCurveTo(hx + 12, hy - 32, hx + 23, hy - 22, hx + 23, hy - 7); c.quadraticCurveTo(hx + 25, hy + 6, hx + 17, hy + 13); c.lineTo(hx + 5, hy + 23); c.closePath(); };
  head(); g.fill(sk);
  if (!g.out) { head(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx - 30, hy + 6, 60, 30); c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); ell(c, hx + 4, hy - 22, 10, 4, -0.2); c.fill(); c.fillStyle = rgba(ELE.pink, 0.55); for (let i = 0; i < 5; i++) { c.beginPath(); circ(c, hx + 14 + (i % 3) * 3, hy + 2 + i * 2.2, 1.3); c.fill(); } }); }
  if (K.headPlate) { const hp = () => { c.beginPath(); c.moveTo(hx - 6, hy - 27); c.bezierCurveTo(hx + 8, hy - 32, hx + 22, hy - 22, hx + 23, hy - 6); c.lineTo(hx + 18, hy + 10); c.lineTo(hx + 4, hy - 4); c.closePath(); }; hp(); g.fill(PAL.steel); if (!g.out) { hp(); g.inside((c) => { c.strokeStyle = 'rgba(40,46,56,0.45)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx - 4 + i * 6, hy - 28 + i * 2); c.lineTo(hx + 6 + i * 4, hy - 2 + i * 3); c.stroke(); } c.fillStyle = tm.main; c.fillRect(hx - 8, hy - 30, 36, 4); }); } }
  else if (K.headCloth) { const hc = () => { c.beginPath(); c.moveTo(hx + 2, hy - 29); c.quadraticCurveTo(hx + 18, hy - 26, hx + 22, hy - 10); c.lineTo(hx + 17, hy + 4); c.quadraticCurveTo(hx + 8, hy - 8, hx + 2, hy - 29); c.closePath(); }; hc(); g.fill(K.headCloth === 'team' ? tm.main : K.headCloth); if (!g.out) { hc(); g.inside((c) => { c.fillStyle = PAL.gold; c.fillRect(hx - 10, hy - 32, 40, 3); for (let i = 0; i < 3; i++) { c.beginPath(); circ(c, hx + 12 + i * 2, hy - 20 + i * 7, 1.8); c.fill(); } }); } }
  if (!g.out) { g.dot(hx + 10, hy - 9, 2.2, INK); g.line([hx + 7, hy - 12, hx + 13, hy - 12.5], 'rgba(0,0,0,0.35)', 1.2); c.beginPath(); c.moveTo(hx + 5, hy + 20); c.quadraticCurveTo(hx + 9, hy + 23, hx + 13, hy + 18); c.strokeStyle = shade(ELE.pink, -0.3); c.lineWidth = 2; c.stroke(); }
  // trunk: hangs and sways; curls up to trumpet in the attack
  const tr = p.tr || 0, a0 = lerp(1.38 + (p.sw || 0), -0.35, tr), curl = lerp(-0.03, -0.3, tr), tip = lerp(-0.32, -0.5, tr);
  trunkDraw(g, trunkPts(hx + 16, hy + 8, a0, curl, tip), sk);
  if (K.tusks) {
    const tk = () => { c.beginPath(); c.moveTo(hx + 10, hy + 13); c.quadraticCurveTo(hx + 24, hy + 26, hx + 36, hy + 19); c.lineTo(hx + 35, hy + 16); c.quadraticCurveTo(hx + 24, hy + 20, hx + 14, hy + 9); c.closePath(); };
    tk(); g.fill(ELE.ivory);
    if (K.tuskSword) { c.beginPath(); c.moveTo(hx + 34, hy + 16); c.lineTo(hx + 50, hy + 12); c.lineTo(hx + 34, hy + 20); c.closePath(); g.fill(PAL.steelL); c.beginPath(); rr(c, hx + 28, hy + 14, 6, 6, 1.5); g.fill(PAL.gold); }
  }
  c.restore();
}
function earSide(g, p, K, hx, hy) {
  const c = g.c;
  c.save(); c.translate(hx - 8, hy - 20); c.rotate(p.ear || 0); c.translate(-(hx - 8), -(hy - 20));
  const ear = () => { c.beginPath(); c.moveTo(hx - 7, hy - 23); c.bezierCurveTo(hx - 22, hy - 28, hx - 31, hy - 10, hx - 29, hy + 4); c.bezierCurveTo(hx - 28, hy + 17, hx - 20, hy + 27, hx - 11, hy + 24); c.quadraticCurveTo(hx - 11, hy + 10, hx - 3, hy + 2); c.closePath(); };
  ear(); g.fill(shade(K.skin, 0.06));
  if (!g.out) { ear(); g.inside((c) => { c.fillStyle = rgba(ELE.pink, 0.6); for (let i = 0; i < 7; i++) { c.beginPath(); circ(c, hx - 25 + (i % 2) * 3, hy - 8 + i * 4.5, 1.4); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(hx - 10, hy - 30, 10, 60); }); g.line([hx - 10, hy - 16, hx - 20, hy - 4, hx - 18, hy + 12], 'rgba(0,0,0,0.2)', 1.2); }
  c.restore();
}
// the animal is drawn a little larger than unit scale (ES) and the people on it a little smaller (RS), so that the
// elephant towers over the foot soldiers; outlines keep the same thickness on screen
const ELE_ES = 1.08, ELE_RS = 0.8;
function eleScopes(g) {
  const c = g.c, lw0 = g.lw;
  const E = (fn) => { c.save(); c.scale(ELE_ES, ELE_ES); g.lw = lw0 / ELE_ES; fn(); g.lw = lw0; c.restore(); };
  const Rt = (x, y, fn) => { c.save(); c.translate(x * ELE_ES, y * ELE_ES); c.scale(ELE_RS, ELE_RS); c.translate(-x, -y); g.lw = lw0 / ELE_RS; fn(); g.lw = lw0; c.restore(); };
  return [E, Rt];
}
function eleSide(g, p, K) {
  const c = g.c, tm = g.team, sk = K.skin, far = shade(sk, -0.28), [E, Rt] = eleScopes(g);
  c.save(); c.translate(p.lunge || 0, 0);
  const by = -86 + p.hb, ph = p.ph, W = { walk: p.walk }, hx = 50, hy = by - 8, base = by - 36, x0 = -36, x1 = 12;
  E(() => {
    eleLeg(g, 24, by + 12, ph + Math.PI, far, W);
    eleLeg(g, -34, by + 10, ph, far, Object.assign({ hind: true }, W));
    const tl = p.tail || 0; c.beginPath(); c.moveTo(-48, by - 14); c.quadraticCurveTo(-58 - tl * 0.3, by + 4, -55 - tl * 0.6, by + 30); c.lineTo(-51 - tl * 0.6, by + 30); c.quadraticCurveTo(-53 - tl * 0.3, by + 4, -45, by - 10); c.closePath(); g.fill(sk);
    c.beginPath(); ell(c, -53 - tl * 0.6, by + 34, 3.5, 6); g.fill('#2a2320');
    const body = () => { c.beginPath(); c.moveTo(-50, by + 4); c.bezierCurveTo(-55, by - 26, -30, by - 37, -6, by - 36); c.bezierCurveTo(16, by - 35, 32, by - 30, 40, by - 18); c.lineTo(42, by + 14); c.bezierCurveTo(34, by + 32, -38, by + 34, -50, by + 4); c.closePath(); };
    body(); g.fill(sk);
    if (!g.out) { body(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(-60, by + 10, 110, 30); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(-60, by - 40, 110, 8); c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 1.2; for (const x of [-40, -30]) { c.beginPath(); c.moveTo(x, by - 6); c.quadraticCurveTo(x - 4, by + 6, x, by + 16); c.stroke(); } }); }
    eleLeg(g, 30, by + 12, ph, sk, Object.assign({ raise: p.stomp || 0 }, W));
    eleLeg(g, -28, by + 10, ph + Math.PI, sk, Object.assign({ hind: true }, W));
    if (K.jhul || K.armor) jhulSide(g, K, tm, by);
    eleHeadSide(g, p, K, tm, hx, hy);
  });
  if (K.mahout) Rt(36, by - 33, () => mahoutSide(g, K.mahout, tm, 36, by - 33, p, 'leg'));
  E(() => earSide(g, p, K, hx, hy));
  if (K.howdah) {
    E(() => {
      girthSide(g, by, x0, x1);
      if (K.parasol) gParasol(g, -12, base - 80, K.parasol, p.t);
      if (K.flag) { c.beginPath(); cap(c, x0 - 1, base - 16, x0 - 1, base - 66, 2.2); g.fill(PAL.woodL); bannerFlag(g, x0 - 1, base - 64, -Math.PI / 2, K.flag, p.t, 0.8, -1); }
    });
    if (K.rider) Rt(-12, base - 12, () => howdahRiderSide(g, p, K.rider, tm, -12, base + 11));
    E(() => howdahSide(g, K, tm, x0, x1, base));
  }
  if (K.mahout) Rt(36, by - 33, () => mahoutSide(g, K.mahout, tm, 36, by - 33, p));
  c.restore();
}
function eleFB(g, p, K, front) {
  const c = g.c, tm = g.team, sk = K.skin, far = shade(sk, -0.28), wk = p.walk, [E, Rt] = eleScopes(g);
  const by = -86 + p.hb, lL = wk ? Math.max(0, Math.sin(p.ph)) * 6 : 0, lR = wk ? Math.max(0, -Math.sin(p.ph)) * 6 : 0;
  const base = by - 38, n = 5;
  const cloth = (hem) => { c.beginPath(); c.moveTo(-44, by - 16); c.bezierCurveTo(-38, by - 44, 38, by - 44, 44, by - 16); c.lineTo(47, hem); for (let i = 0; i < n; i++) { const xa = lerp(47, -47, i / n), xb = lerp(47, -47, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, hem + 7, xb, hem); } c.closePath(); };
  const drawCloth = (hem) => {
    cloth(hem); g.fill(K.armor ? PAL.steel : tm.main);
    if (g.out) return;
    if (!K.armor && K.jhul && K.jhul !== 'team') { cloth(hem); paintInside(g, K.jhul, tm, -50, by - 46, 100, 72); }
    cloth(hem); g.inside((c) => { if (K.armor) { for (let r = 0; r < 6; r++) for (let q = 0; q < 13; q++) { c.beginPath(); rr(c, -52 + q * 8 + (r % 2) * 4, by - 42 + r * 8, 7, 8, 2.5); c.fillStyle = (q + r) % 3 ? '#c9d0d8' : '#aab3bd'; c.fill(); } c.fillStyle = tm.main; c.fillRect(-54, hem - 9, 108, 8); } c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(8, by - 50, 50, 80); c.lineWidth = 5; c.strokeStyle = K.trim || PAL.gold; c.beginPath(); c.moveTo(47, hem); for (let i = 0; i < n; i++) { const xa = lerp(47, -47, i / n), xb = lerp(47, -47, (i + 1) / n); c.quadraticCurveTo((xa + xb) / 2, hem + 7, xb, hem); } c.stroke(); });
    if (K.bells !== false) for (let i = 0; i <= n; i++) { c.beginPath(); ell(c, lerp(47, -47, i / n), hem + 4, 2.6, 3); c.fillStyle = PAL.goldL; c.fill(); c.lineWidth = 0.9; c.strokeStyle = INK; c.stroke(); }
  };
  if (front) {
    E(() => {
      eleLegFB(g, -19, lR * 0.6 + 4, by + 12, far, 22); eleLegFB(g, 19, lL * 0.6 + 4, by + 12, far, 22);
      c.beginPath(); ell(c, 0, by + 2, 46, 34); g.fill(sk);
      if (K.jhul || K.armor) drawCloth(by + 16);
      eleLegFB(g, -22, lL, by + 16, sk, 28); eleLegFB(g, 22, lR + (p.stomp || 0) * 22, by + 16, sk, 28);
      if (K.howdah && K.parasol) gParasol(g, 6, base - 84, K.parasol, p.t);
    });
    if (K.howdah) {
      if (K.rider) Rt(10, base - 10, () => howdahRiderFB(g, p, K.rider, tm, 10, base + 5, true));
      E(() => howdahFB(g, K, tm, 27, base - 4, true));
    }
    E(() => {
      // ears behind the head
      for (const sx of [-1, 1]) { const ea = (p.ear || 0) * sx; c.save(); c.translate(sx * 20, by - 32); c.rotate(ea); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(sx * 22, -10, sx * 36, 2, sx * 34, 20); c.bezierCurveTo(sx * 33, 36, sx * 20, 46, sx * 8, 40); c.quadraticCurveTo(sx * 5, 22, 0, 14); c.closePath(); g.fill(shade(sk, 0.06)); if (!g.out) { c.fillStyle = rgba(ELE.pink, 0.6); for (let i = 0; i < 6; i++) { c.beginPath(); circ(c, sx * (30 - i), 6 + i * 6, 1.4); c.fill(); } } c.restore(); }
    });
    if (K.mahout) Rt(-8, by - 44, () => mahoutFB(g, K.mahout, tm, -8, by - 44, true));
    E(() => {
      const head = () => { c.beginPath(); c.moveTo(-28, by - 4); c.bezierCurveTo(-33, by - 32, -23, by - 48, -11, by - 46); c.quadraticCurveTo(0, by - 41, 11, by - 46); c.bezierCurveTo(23, by - 48, 33, by - 32, 28, by - 4); c.quadraticCurveTo(23, by + 13, 11, by + 18); c.lineTo(-11, by + 18); c.quadraticCurveTo(-23, by + 13, -28, by - 4); c.closePath(); };
      head(); g.fill(sk);
      if (!g.out) { head(); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(9, by - 52, 32, 76); c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); ell(c, -11, by - 39, 8, 3); ell(c, 11, by - 39, 8, 3); c.fill(); c.fillStyle = rgba(ELE.pink, 0.5); for (let i = 0; i < 6; i++) { c.beginPath(); circ(c, -6 + (i % 3) * 6, by + 6 + Math.floor(i / 3) * 5, 1.3); c.fill(); } }); }
      if (K.headPlate) { c.beginPath(); c.moveTo(-16, by - 41); c.quadraticCurveTo(0, by - 45, 16, by - 41); c.lineTo(11, by + 4); c.lineTo(-11, by + 4); c.closePath(); g.fill(PAL.steel); if (!g.out) { g.line([-14, by - 26, 14, by - 26], tm.main, 3.5); g.line([0, by - 43, 0, by + 2], PAL.steelD, 1.3); } }
      else if (K.headCloth) { c.beginPath(); c.moveTo(-12, by - 41); c.quadraticCurveTo(0, by - 44, 12, by - 41); c.lineTo(7, by - 6); c.lineTo(0, by + 2); c.lineTo(-7, by - 6); c.closePath(); g.fill(K.headCloth === 'team' ? tm.main : K.headCloth); if (!g.out) { g.line([-11, by - 37, 11, by - 37], PAL.gold, 2.4); g.dot(0, by - 22, 2.8, PAL.goldL); g.dot(0, by - 22, 1.3, '#c8372d'); } }
      if (!g.out) { g.dot(-18, by - 13, 2.3, INK); g.dot(18, by - 13, 2.3, INK); }
      if (K.tusks) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 8, by + 11); c.quadraticCurveTo(sx * 20, by + 28, sx * 16, by + 43); c.lineTo(sx * 12, by + 42); c.quadraticCurveTo(sx * 14, by + 28, sx * 4, by + 15); c.closePath(); g.fill(ELE.ivory); if (K.tuskSword) { c.beginPath(); c.moveTo(sx * 16, by + 41); c.lineTo(sx * 17, by + 58); c.lineTo(sx * 12, by + 42); c.closePath(); g.fill(PAL.steelL); } }
      const tr = p.tr || 0, sw = p.sw || 0;
      trunkDraw(g, trunkPts(0, by + 7, lerp(Math.PI / 2 + sw * 0.6, -2.2, tr), lerp(0, 0.28, tr), lerp(0.05, 0.4, tr), 7, 10.5), sk);
    });
  } else {
    E(() => {
      eleLegFB(g, -19, lR * 0.6 + 4, by + 12, far, 22); eleLegFB(g, 19, lL * 0.6 + 4, by + 12, far, 22);
      c.beginPath(); ell(c, 0, by, 46, 36); g.fill(sk);
      if (!g.out) { c.beginPath(); ell(c, 0, by, 46, 36); g.inside((c) => { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(10, by - 40, 40, 80); c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, by - 10); c.lineTo(0, by + 30); c.stroke(); }); }
      eleLegFB(g, -23, lL, by + 18, sk, 28); eleLegFB(g, 23, lR, by + 18, sk, 28);
      if (K.jhul || K.armor) drawCloth(by + 14);
      const sw = Math.sin(p.t * 2.2) * 3;
      c.beginPath(); c.moveTo(-2.5, by + 12); c.quadraticCurveTo(-3 + sw, by + 30, -1.5 + sw * 1.4, by + 48); c.lineTo(2.5 + sw * 1.4, by + 48); c.quadraticCurveTo(3 + sw, by + 30, 2.5, by + 12); c.closePath(); g.fill(sk);
      c.beginPath(); ell(c, sw * 1.4, by + 52, 3.5, 6); g.fill('#2a2320');
      if (K.howdah) { if (K.parasol) gParasol(g, -4, base - 82, K.parasol, p.t); howdahFB(g, K, tm, 27, base, false); }
    });
    if (K.howdah && K.rider) Rt(-2, base - 12, () => howdahRiderFB(g, p, K.rider, tm, -2, base + 7, false));
  }
}
function defElephant(key, name, kit, extra) {
  const K = Object.assign({}, ELE_DEF, kit);
  if (K.rider) K.rider = mkit(K.rider);
  if (K.mahout) K.mahout = Object.assign({ skin: SKIN.in, cloth: DHOTI }, K.mahout);
  TROOPS[key] = Object.assign({
    name, shadowW: 50, h: K.parasol ? 236 : K.howdah ? 192 : 150, mounted: true, elephant: true, kitDef: K,
    bust: { y: 1.2, s: 0.62 },
    pose: elePose(K),
    side(g, p) { eleSide(g, p, K); },
    front(g, p) { eleFB(g, p, K, true); },
    back(g, p) { eleFB(g, p, K, false); },
  }, extra || {});
}
const HOWDAH_ARCHER = { torso: 'team', legs: DHOTI, boots: SKIN.in, arm: 'team', hand: SKIN.in, weapon: 'bow', head: { kind: 'pagri', col: '#f4efe2', band: '#d9483b' } };
// Gujarat, Kannauj and the other Rajput kingdoms
defElephant('elephant', 'War elephant', { rider: HOWDAH_ARCHER, mahout: { head: { kind: 'pagri', col: '#d9483b' } } }, { special: true });
// the Lodi and Sur Afghans, and Hemu: armour of steel plates, swords bound to the tusks
defElephant('elephantArmored', 'War elephant', { armor: true, headPlate: true, tuskSword: true, rider: Object.assign({}, HOWDAH_ARCHER, { hand: SKIN.afghan, head: { kind: 'afghan', col: '#f1e9d6' } }), mahout: { skin: SKIN.afghan, head: { kind: 'afghan', col: '#e8dcc0' } } }, { special: true });
// the Cholas: gold-patterned cloth, a javelin man in the howdah
defElephant('elephantChola', 'War elephant', { rider: { torso: 'team', bare: true, sash: '#f2c22e', hand: SKIN.south, arm: SKIN.south, weapon: 'javelin', head: { kind: 'bun' } }, mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } }, { special: true });
// story pictures: the captured elephants, the white one that would not kneel, and Pushpaka
defElephant('elephantBare', 'Elephant', { howdah: null, rider: null, mahout: null, jhul: '#8a3a2a', pattern: false, headCloth: '#8a3a2a' });
defElephant('whiteElephant', 'White elephant', { skin: '#e9e4db', howdah: null, rider: null, mahout: null, jhul: '#f7f3ea', headCloth: '#f7f3ea' });
defElephant('pushpaka', 'Pushpaka', { howdah: null, rider: null, tusks: false, jhul: { arms: { field: '#d9637a' } }, headCloth: '#f2c22e', mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } });

/* ===== src/art/25c-india-riders.js ===== */
/* Roll to War: horsemen of the Indian campaigns, and the kings, queens, sultans and generals who lead them —
   on horseback or from the howdah of a war elephant under a royal parasol. */

const HOSE_IN = '#efe6d2', SHOE = '#7a4a26', PARASOL = '#f7f3ea';
// Rajput lancers of the Chauhans and of Mewar: quilted coat, turban, lance
defMounted('rajputHorse', 'Rajput horseman', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#8a5a38', mane: '#2a1d16', torso: 'team', belt: PAL.gold, legs: HOSE_IN, boots: SHOE, arm: '#efe6d2', hand: SKIN.in, head: { kind: 'pagri', col: '#f0a02c', band: '#b8312a' }, weapon: 'lance', plume: null }, { special: true });
// the Ghurids: Turkish horse archers and the armoured ghulams with their maces
defMounted('turkArcher', 'Horse archer', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#b08050', mane: '#3b2517', torso: 'team', legs: '#e7dcc2', boots: SHOE, arm: '#d9ccb0', hand: SKIN.turk, head: { kind: 'cone', wrap: '#f1e9d6' }, weapon: 'bow', plume: null }, { special: true });
defMounted('ghulam', 'Ghulam', { capa: 'team', coat: '#5a3a28', mane: '#1e1611', torso: 'team', legs: PAL.mailD, boots: '#5a3a28', arm: PAL.mail, hand: SKIN.turk, head: { kind: 'cone', plume: '#2a2320' }, weapon: 'mace', shield: { kind: 'dhal', col: '#2a2320' }, plume: null });
// Mughal horse: spiked helmet, talwar and dhal
defMounted('mughalHorse', 'Horseman', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#c9b9a0', mane: '#6a5a48', torso: 'team', legs: '#e8dcc0', boots: SHOE, arm: PAL.mail, hand: SKIN.mughal, head: { kind: 'khud', plume: '#f4efe2' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#2a2320' }, plume: null });
// the Afghans of the Sur army: turbaned lancers
defMounted('afghanHorse', 'Afghan horseman', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#6b4a3a', mane: '#1e1611', torso: 'team', legs: '#e7dcc2', boots: SHOE, arm: '#e8dcc0', hand: SKIN.afghan, head: { kind: 'afghan', col: '#f1e9d6' }, weapon: 'lance', plume: null }, { special: true });
// the Chalukyas: horsemen of the Deccan on "horses of lofty gait"
defMounted('karnataHorse', 'Karnata horseman', { capa: null, cloth: { col: 'team', trim: PAL.gold }, coat: '#e6dccb', mane: '#8a8173', torso: 'team', legs: HOSE_IN, boots: SKIN.south, arm: SKIN.south, hand: SKIN.south, head: { kind: 'pagri', col: '#f4efe2', band: '#f2c22e' }, weapon: 'lance', plume: null }, { special: true });

/* ---------- leaders on horseback ---------- */
const IN_RIDERS = {
  // Prithviraj Chauhan
  kirtipala: { name: 'Kirtipala of Nadol', kit: { capa: { arms: 'chauhan' }, coat: '#6b4a3a', mane: '#1e1611', torso: '#b8312a', belt: PAL.gold, legs: HOSE_IN, boots: SHOE, arm: '#efe6d2', hand: SKIN.in, head: { kind: 'pagri', col: '#f0a02c', band: '#b8312a', jewel: '#c8372d', stache: '#1e1612' }, weapon: 'lance', pennant: 'chauhan', plume: null } },
  ghori: { name: 'Muhammad of Ghor', kit: { capa: { arms: 'ghurid' }, coat: '#2b2320', mane: '#120d0a', torso: '#2a2320', belt: PAL.gold, legs: '#e7dcc2', boots: SHOE, arm: PAL.mail, hand: SKIN.turk, head: { kind: 'cone', wrap: '#2a2320', plume: '#f4efe2', beard: '#2a1d16' }, weapon: 'sword', shield: { kind: 'dhal', col: '#2a2320' }, plume: null } },
  aibak: { name: 'Qutb al-Din Aibak', kit: { capa: { arms: 'ghurid' }, coat: '#8a5a38', mane: '#3b2517', torso: '#6a4a8a', belt: PAL.gold, legs: PAL.mailD, boots: '#5a3a28', arm: PAL.mail, hand: SKIN.turk, head: { kind: 'cone', plume: '#6a4a8a' }, weapon: 'mace', shield: { kind: 'dhal', col: '#6a4a8a' }, plume: null } },
  ziyaDin: { name: 'Qazi Ziya al-Din', kit: { capa: null, cloth: { col: '#f4efe2', trim: '#2a2320' }, coat: '#c9b9a0', mane: '#6a5a48', torso: '#e8dcc0', belt: '#2a2320', legs: '#e7dcc2', boots: SHOE, arm: '#e8dcc0', hand: SKIN.turk, head: { kind: 'afghan', col: '#f7f3ea', beard: '#8a8278' }, weapon: 'sword', shield: { kind: 'dhal', col: '#2a2320' }, plume: null } },
  // the Mughals
  babur: { name: 'Babur', kit: { capa: null, cloth: { col: '#2f6f4a', trim: PAL.gold }, coat: '#8a5a38', mane: '#2a1d16', torso: '#2f6f4a', belt: PAL.gold, legs: '#e8dcc0', boots: SHOE, arm: '#2f6f4a', hand: SKIN.mughal, head: { kind: 'mughal', col: '#f7f3ea', cap: '#b8312a', stache: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#2f6f4a' }, plume: null } },
  alikuli: { name: 'Ustad Ali Quli', kit: { capa: null, cloth: { col: '#6b4a3a', trim: PAL.gold }, coat: '#5a3a28', mane: '#1e1611', torso: '#6b4a3a', legs: '#e8dcc0', boots: SHOE, arm: PAL.mail, hand: SKIN.turk, head: { kind: 'khud', plume: '#2a2320', beard: '#2a1d16' }, weapon: 'mace', shield: { kind: 'dhal', col: '#2a2320' }, plume: null } },
  humayun: { name: 'Humayun', kit: { capa: null, cloth: { col: '#f2c22e', trim: '#b8312a' }, coat: '#efe9dc', mane: '#b9ab94', torso: '#f2c22e', belt: '#b8312a', legs: '#e8dcc0', boots: SHOE, arm: '#f2c22e', hand: SKIN.mughal, head: { kind: 'mughal', col: '#f7f3ea', taj: '#b8312a', stache: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#b8312a' }, plume: null } },
  bairam: { name: 'Bairam Khan', kit: { capa: null, cloth: { col: '#2f5fc4', trim: PAL.gold }, coat: '#4b3b30', mane: '#1e1611', torso: '#2f5fc4', legs: '#e8dcc0', boots: SHOE, arm: PAL.mail, hand: SKIN.turk, head: { kind: 'mughal', col: '#f7f3ea', cap: '#2f5fc4', beard: '#2a1d16' }, weapon: 'bow', plume: null } },
  akbar: { name: 'Akbar', kit: { capa: null, cloth: { col: '#f2c22e', trim: '#2f6f4a' }, coat: '#e6dccb', mane: '#8a8173', torso: '#f2c22e', belt: '#2f6f4a', legs: '#e8dcc0', boots: SHOE, arm: '#f2c22e', hand: SKIN.mughal, head: { kind: 'mughal', col: '#f7f3ea', cap: '#2f6f4a' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#2f6f4a' }, plume: null } },
  khanZaman: { name: 'Ali Quli Khan', kit: { capa: null, cloth: { col: '#8a2a20', trim: PAL.gold }, coat: '#6b4a3a', mane: '#2a1d16', torso: '#8a2a20', legs: '#e8dcc0', boots: SHOE, arm: PAL.mail, hand: SKIN.turk, head: { kind: 'khud', plume: '#8a2a20', beard: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#8a2a20' }, plume: null } },
  shahQuli: { name: 'Shah Quli Mahram', kit: { capa: null, cloth: { col: '#2a6a6a', trim: PAL.gold }, coat: '#8a5a38', mane: '#3b2517', torso: '#2a6a6a', legs: '#e8dcc0', boots: SHOE, arm: PAL.mail, hand: SKIN.turk, head: { kind: 'mughal', col: '#f4efe2', cap: '#2a6a6a' }, weapon: 'bow', plume: null } },
  // the Afghans and Rajputs against them
  hasanKhan: { name: 'Hasan Khan Mewati', kit: { capa: null, cloth: { col: '#4a6a8a', trim: PAL.gold }, coat: '#6b4a3a', mane: '#1e1611', torso: '#4a6a8a', legs: '#e7dcc2', boots: SHOE, arm: '#e8dcc0', hand: SKIN.in, head: { kind: 'afghan', col: '#f1e9d6', beard: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#4a6a8a' }, plume: null } },
  sherkhan: { name: 'Sher Khan', kit: { capa: null, cloth: { col: '#2f6a3a', trim: PAL.gold }, coat: '#2b2320', mane: '#120d0a', torso: '#2f6a3a', legs: '#e7dcc2', boots: SHOE, arm: PAL.mail, hand: SKIN.afghan, head: { kind: 'afghan', col: '#f7f3ea', beard: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#2f6a3a' }, plume: null } },
  khawas: { name: 'Khawas Khan', kit: { capa: null, cloth: { col: '#8a5a2a', trim: PAL.gold }, coat: '#8a5a38', mane: '#3b2517', torso: '#8a5a2a', legs: '#e7dcc2', boots: SHOE, arm: '#e8dcc0', hand: SKIN.afghan, head: { kind: 'afghan', col: '#e8dcc0', beard: '#2a1d16' }, weapon: 'lance', plume: null } },
  sikandar: { name: 'Sikandar Shah Sur', kit: { capa: null, cloth: { col: '#5a2a6a', trim: PAL.gold }, coat: '#efe9dc', mane: '#b9ab94', torso: '#5a2a6a', legs: '#e7dcc2', boots: SHOE, arm: PAL.mail, hand: SKIN.afghan, head: { kind: 'afghan', col: '#f7f3ea', beard: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#5a2a6a' }, plume: null } },
  shadiKhan: { name: 'Shadi Khan Kakar', kit: { capa: null, cloth: { col: '#6a4a2a', trim: PAL.gold }, coat: '#4b3b30', mane: '#1e1611', torso: '#6a4a2a', legs: '#e7dcc2', boots: SHOE, arm: '#e8dcc0', hand: SKIN.afghan, head: { kind: 'afghan', col: '#e8dcc0', beard: '#2a1d16' }, weapon: 'talwar', shield: { kind: 'dhal', col: '#6a4a2a' }, plume: null } },
  // the Chalukyas of Kalyani
  jayasimha2: { name: 'King Jayasimha II', kit: { capa: { arms: 'chalukya' }, coat: '#e6dccb', mane: '#8a8173', torso: '#f2c22e', belt: '#b8312a', legs: HOSE_IN, boots: SKIN.south, arm: SKIN.south, hand: SKIN.south, head: { kind: 'kirit', stache: '#1e1612' }, weapon: 'lance', pennant: 'chalukya', plume: null } },
  valadeva: { name: 'Valadeva', kit: { capa: null, cloth: { col: '#b8312a', trim: PAL.gold }, coat: '#8a5a38', mane: '#2a1d16', torso: '#b8312a', legs: HOSE_IN, boots: SKIN.south, arm: SKIN.south, hand: SKIN.south, head: { kind: 'pagri', col: '#f4efe2', band: '#b8312a', stache: '#1e1612' }, weapon: 'lance', pennant: 'chalukya', plume: null } },
  vikramaditya: { name: 'Prince Vikramaditya', kit: { capa: { arms: 'chalukya' }, coat: '#efe9dc', mane: '#b9ab94', torso: '#2f8a4c', belt: PAL.gold, legs: HOSE_IN, boots: SKIN.south, arm: SKIN.south, hand: SKIN.south, head: { kind: 'kirit', h: 18 }, weapon: 'khanda', shield: { kind: 'dhal', col: '#2f8a4c' }, plume: null } },
  jananatha: { name: 'Jananatha', kit: { capa: null, cloth: { col: '#2f5fc4', trim: PAL.gold }, coat: '#6b4a3a', mane: '#1e1611', torso: '#2f5fc4', legs: HOSE_IN, boots: SKIN.south, arm: SKIN.south, hand: SKIN.south, head: { kind: 'pagri', col: '#f0a02c', band: '#2f5fc4' }, weapon: 'bow', plume: null } },
};
for (const k in IN_RIDERS) { HEROES[k] = { name: IN_RIDERS[k].name, side: 'india', kit: IN_RIDERS[k].kit }; defMounted('hero_' + k, IN_RIDERS[k].name, IN_RIDERS[k].kit, { hero: true }); }

/* ---------- leaders on elephants ---------- */
const kingRider = (o) => Object.assign({ torso: '#f2c22e', legs: HOSE_IN, boots: SKIN.in, arm: '#f2c22e', hand: SKIN.in, weapon: 'bow', head: { kind: 'kirit' }, jewels: true }, o);
const IN_ELEPHANT_LEADERS = {
  // Gujarat, Ajmer, Delhi and Kannauj
  naikidevi: { name: 'Queen Naikidevi', kit: { jhul: { arms: 'chaulukya' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ torso: '#b8312a', arm: '#b8312a', weapon: 'none', head: { kind: 'queen', col: '#f2c22e' } }), mahout: { head: { kind: 'pagri', col: '#f4efe2' } } } },
  prithviraj: { name: 'King Prithviraj', kit: { jhul: { arms: 'chauhan' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ torso: '#f2c22e', arm: '#f2c22e', head: { kind: 'kirit', stache: '#1e1612' } }), mahout: { head: { kind: 'pagri', col: '#b8312a' } } } },
  govindaraja: { name: 'Govindaraja of Delhi', kit: { jhul: { arms: 'chauhan' }, howdah: 'seat', rider: kingRider({ torso: '#b8312a', arm: '#b8312a', weapon: 'javelin', head: { kind: 'pagri', col: '#f0a02c', band: '#b8312a', jewel: '#c8372d', stache: '#1e1612' } }), mahout: { head: { kind: 'pagri', col: '#f4efe2' } } } },
  jayachandra: { name: 'King Jayachandra', kit: { jhul: { arms: 'gahadavala' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ torso: '#2f5fc4', arm: '#2f5fc4', head: { kind: 'kirit', stache: '#1e1612' } }), mahout: { head: { kind: 'pagri', col: '#f2c22e' } } } },
  // the Lodis, Mewar and Hemu
  ibrahim: { name: 'Ibrahim Lodi', kit: { armor: true, headPlate: true, tuskSword: true, howdah: 'royal', parasol: '#2f6f4a', rider: kingRider({ torso: '#2f6f4a', arm: PAL.mail, hand: SKIN.afghan, head: { kind: 'afghan', col: '#f7f3ea', beard: '#2a1d16' } }), mahout: { skin: SKIN.afghan, head: { kind: 'afghan', col: '#e8dcc0' } } } },
  bikramajit: { name: 'Raja Bikramajit', kit: { jhul: { arms: 'mewar' }, howdah: 'seat', rider: kingRider({ torso: '#d9483b', arm: '#d9483b', weapon: 'javelin', head: { kind: 'pagri', col: '#f0a02c', band: '#b8312a', jewel: '#2f8a4c', stache: '#1e1612' } }), mahout: { head: { kind: 'pagri', col: '#f4efe2' } } } },
  sanga: { name: 'Rana Sanga', kit: { jhul: { arms: 'mewar' }, howdah: 'royal', parasol: '#f2c22e', rider: kingRider({ torso: '#f0a02c', arm: '#f0a02c', weapon: 'javelin', head: { kind: 'pagri', col: '#d9483b', band: PAL.gold, jewel: '#f7f3ea', plume: '#f7f3ea', beard: '#2a1d16' } }), mahout: { head: { kind: 'pagri', col: '#f0a02c' } } } },
  hemu: { name: 'Hemu', kit: { armor: true, headPlate: true, tuskSword: true, howdah: 'royal', parasol: PARASOL, rider: kingRider({ torso: '#f4efe2', arm: '#f4efe2', head: { kind: 'pagri', col: '#f7f3ea', band: PAL.gold, jewel: '#c8372d', stache: '#1e1612' } }), mahout: { head: { kind: 'pagri', col: '#d9483b' } } } },
  // the Chola kings: bare-chested, crowned, hung with gold
  rajendra1: { name: 'King Rajendra', kit: { jhul: { arms: 'chola' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ bare: true, sash: '#f2c22e', hand: SKIN.south, arm: SKIN.south, head: { kind: 'kirit', h: 30, stache: '#1e1612' } }), mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } } },
  rajadhiraja: { name: 'King Rajadhiraja', kit: { jhul: { arms: 'chola' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ bare: true, sash: '#b8312a', hand: SKIN.south, arm: SKIN.south, weapon: 'javelin', head: { kind: 'kirit', h: 30, stache: '#1e1612' } }), mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } } },
  rajendra2: { name: 'Rajendra II', kit: { jhul: { arms: 'chola' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ bare: true, sash: '#2f5fc4', hand: SKIN.south, arm: SKIN.south, head: { kind: 'kirit', h: 26, stache: '#1e1612' } }), mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } } },
  rajamahendra: { name: 'Prince Rajamahendra', kit: { jhul: { arms: 'chola' }, howdah: 'seat', rider: kingRider({ bare: true, sash: '#2f8a4c', hand: SKIN.south, arm: SKIN.south, weapon: 'javelin', head: { kind: 'kirit', h: 18 } }), mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } } },
  virarajendra: { name: 'King Virarajendra', kit: { jhul: { arms: 'chola' }, howdah: 'royal', parasol: '#f2c22e', rider: kingRider({ bare: true, sash: '#f7f3ea', hand: SKIN.south, arm: SKIN.south, head: { kind: 'kirit', h: 28, stache: '#1e1612' } }), mahout: { skin: SKIN.south, cloth: '#f2c22e', head: { kind: 'bun' } } } },
  // the Chalukya king and generals who fought from elephants
  someshvara: { name: 'King Someshvara', kit: { jhul: { arms: 'chalukya' }, howdah: 'royal', parasol: PARASOL, rider: kingRider({ torso: '#b8312a', arm: SKIN.south, hand: SKIN.south, head: { kind: 'kirit', h: 26, stache: '#1e1612' } }), mahout: { skin: SKIN.south, head: { kind: 'pagri', col: '#f4efe2' } } } },
  gandappayan: { name: 'Gandappayan', kit: { jhul: { arms: 'chalukya' }, howdah: 'seat', rider: kingRider({ torso: '#6a4a8a', arm: SKIN.south, hand: SKIN.south, weapon: 'javelin', head: { kind: 'pagri', col: '#f4efe2', band: '#f2c22e', stache: '#1e1612' } }), mahout: { skin: SKIN.south, head: { kind: 'pagri', col: '#f0a02c' } } } },
  jayasingan: { name: 'Jayasimha', kit: { jhul: { arms: 'chalukya' }, howdah: 'seat', rider: kingRider({ torso: '#f0a02c', arm: SKIN.south, hand: SKIN.south, head: { kind: 'kirit', h: 16 } }), mahout: { skin: SKIN.south, head: { kind: 'pagri', col: '#f4efe2' } } } },
  rajamayan: { name: 'Rajamayan', kit: { jhul: { arms: 'chalukya' }, howdah: 'seat', rider: kingRider({ torso: '#2a6a6a', arm: SKIN.south, hand: SKIN.south, weapon: 'javelin', head: { kind: 'pagri', col: '#f0a02c', band: '#2a6a6a', beard: '#1e1612' } }), mahout: { skin: SKIN.south, head: { kind: 'pagri', col: '#f4efe2' } } } },
};
for (const k in IN_ELEPHANT_LEADERS) { const E = IN_ELEPHANT_LEADERS[k]; HEROES[k] = { name: E.name, side: 'india', kit: E.kit, elephant: true }; defElephant('hero_' + k, E.name, E.kit, { hero: true }); }

/* ---------- crew icons: the war elephant and the matchlock ---------- */
const _crewIcon0 = ICON.crew;
ICON.crew = function (c, x, y, s, type, col = '#fff8e6') {
  if (type !== 'elephant' && type !== 'musket') return _crewIcon0(c, x, y, s, type, col);
  const k = s / 100, lw = 5;
  c.save(); c.translate(x, y); c.scale(k, k);
  if (type === 'elephant') {
    c.beginPath(); c.moveTo(-38, 46); c.quadraticCurveTo(-48, 0, -30, -26); c.quadraticCurveTo(-10, -52, 14, -45); c.quadraticCurveTo(35, -38, 37, -16); c.quadraticCurveTo(39, 0, 35, 10);
    c.quadraticCurveTo(30, 34, 40, 44); c.quadraticCurveTo(46, 50, 52, 42); c.lineTo(48, 37); c.quadraticCurveTo(43, 42, 40, 37); c.quadraticCurveTo(28, 28, 23, 17); c.quadraticCurveTo(8, 30, -6, 46); c.closePath(); stk(c, col, lw);
    c.beginPath(); c.moveTo(-12, -30); c.quadraticCurveTo(-36, -30, -33, -4); c.quadraticCurveTo(-30, 18, -15, 18); c.quadraticCurveTo(-11, 0, -4, -12); c.closePath(); stk(c, shade(col, -0.12), lw * 0.8);
    c.fillStyle = INK; c.beginPath(); circ(c, 17, -19, 4.5); c.fill();
    c.beginPath(); c.moveTo(22, 12); c.quadraticCurveTo(34, 26, 52, 18); c.lineTo(50, 11); c.quadraticCurveTo(36, 16, 27, 6); c.closePath(); stk(c, '#f4ecd8', lw * 0.7);
  } else {
    c.save(); c.rotate(-0.72);
    c.beginPath(); c.moveTo(-58, -4); c.lineTo(-12, -6); c.lineTo(-12, 6); c.lineTo(-40, 8); c.quadraticCurveTo(-54, 14, -58, 10); c.closePath(); stk(c, '#8a4f2a', lw);
    c.beginPath(); rr(c, -22, -7, 82, 9, 3); stk(c, PAL.steelD, lw);
    c.fillStyle = PAL.gold; for (const bx of [0, 20, 40]) c.fillRect(bx, -8, 4, 11);
    c.beginPath(); c.moveTo(-20, 4); c.quadraticCurveTo(-24, 16, -16, 18); c.lineTo(-14, 14); c.quadraticCurveTo(-18, 12, -15, 4); c.closePath(); stk(c, PAL.steelD, lw * 0.7);
    c.fillStyle = '#ff8a3a'; c.beginPath(); circ(c, -16, 17, 4); c.fill();
    c.restore();
  }
  c.restore();
};

/* ===== src/art/26-india-props.js ===== */
/* Roll to War: props for the Indian campaigns — forts, a Nagara temple and a Dravidian vimana, the Qutb Minar and
   the mosque screen, the royal parasol, Babur's roped carts, the broken wine cups, a victory pillar, the Chalukya
   door-guardian, a banyan, Deccan boulders, river steps (ghat), Humayun's library, a Kabul garden, an inscribed
   hero stone, and Humayun floating on the water-carrier's skin. (x, y) = base point, s = scale. */

const INSTONE = { sand: ['#e8c894', '#c99a5e', '#9a7040'], brick: ['#c97c56', '#a65a38', '#7a3e28'], grey: ['#bdb6aa', '#968f84', '#6a645a'], red: ['#cc7658', '#a65a42', '#7a3e2c'] };
const inShadow = (c, x, y, rx, ry) => { c.fillStyle = 'rgba(40,26,10,0.25)'; c.beginPath(); ell(c, x, y, rx, ry); c.fill(); };
// a round-topped merlon (kangura), the typical crenel of Indian forts
function kangura(c, x, y, w, col) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - w * 0.7); c.quadraticCurveTo(x + w / 2, y - w * 1.5, x + w, y - w * 0.7); c.lineTo(x + w, y); c.closePath(); c.fillStyle = col; c.fill(); ink(c, 1.6); }

PROP.fort = function (c, x, y, s, t, o = {}) {
  const w = o.w || 240, P = INSTONE[o.style || 'sand'], H = 46;
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, w / 2 + 30, 9);
  if (o.hill || o.mound) {
    const hh = o.hill ? 44 : 30, hill = () => { c.beginPath(); c.moveTo(-w / 2 - 40, 0); c.quadraticCurveTo(-w / 2 - 20, -hh * 0.9, -w / 2 + 4, -hh); c.lineTo(w / 2 - 4, -hh); c.quadraticCurveTo(w / 2 + 20, -hh * 0.9, w / 2 + 40, 0); c.closePath(); };
    hill(); c.fillStyle = o.hill ? '#b09068' : '#b27852'; c.fill();
    c.save(); hill(); c.clip();
    if (o.hill) { const R = rng(7); c.strokeStyle = 'rgba(70,50,30,0.35)'; c.lineWidth = 1.4; for (let i = 0; i < 26; i++) { const rx = -w / 2 - 30 + R() * (w + 60), ry = -R() * hh; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + 8 + R() * 10, ry - 3); c.stroke(); } }
    else { c.strokeStyle = 'rgba(90,40,20,0.35)'; c.lineWidth = 1.2; for (let yy = -4; yy > -hh; yy -= 5) { c.beginPath(); c.moveTo(-w, yy); c.lineTo(w, yy); c.stroke(); } }
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(w / 4, -hh, w, hh); c.restore();
    hill(); ink(c, 2.4);
    c.translate(0, -hh);
  }
  const wall = () => { c.beginPath(); c.rect(-w / 2, -H, w, H); };
  wall(); c.fillStyle = P[0]; c.fill();
  c.save(); wall(); c.clip(); c.strokeStyle = 'rgba(80,50,30,0.3)'; c.lineWidth = 1; for (let yy = -6; yy > -H; yy -= 7) { c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy); c.stroke(); } c.fillStyle = P[1]; c.fillRect(-w / 2, -12, w, 12); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(w * 0.2, -H, w, H); c.restore();
  wall(); ink(c, 2.4);
  for (let xx = -w / 2 + 3; xx < w / 2 - 9; xx += 12) kangura(c, xx, -H, 8, P[0]);
  // gate with a pointed arch
  if (o.gate !== null) {
    const gx = o.gate || 0, burnt = o.burn;
    c.beginPath(); c.moveTo(gx - 14, 0); c.lineTo(gx - 14, -22); c.quadraticCurveTo(gx - 13, -34, gx, -40); c.quadraticCurveTo(gx + 13, -34, gx + 14, -22); c.lineTo(gx + 14, 0); c.closePath();
    c.fillStyle = burnt ? '#2a1a12' : '#6d4a2c'; c.fill(); ink(c, 2.2);
    if (!burnt) { c.strokeStyle = '#4a301a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(gx, -40); c.lineTo(gx, 0); c.stroke(); c.fillStyle = PAL.gold; for (const dy of [-8, -18, -28]) { c.beginPath(); circ(c, gx - 7, dy, 1.4); circ(c, gx + 7, dy, 1.4); c.fill(); } }
  }
  // round bastions
  const towers = o.towers || [-w / 2, -w / 6, w / 6, w / 2];
  for (const bx of towers) {
    const tw = 34, th = H + 16, tp = () => { c.beginPath(); c.moveTo(bx - tw / 2, 0); c.lineTo(bx - tw / 2, -th); c.lineTo(bx + tw / 2, -th); c.lineTo(bx + tw / 2, 0); c.closePath(); };
    tp(); c.fillStyle = P[0]; c.fill();
    c.save(); tp(); c.clip(); const g = c.createLinearGradient(bx - tw / 2, 0, bx + tw / 2, 0); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)'); c.fillStyle = g; c.fillRect(bx - tw, -th, tw * 2, th); c.strokeStyle = 'rgba(80,50,30,0.3)'; c.lineWidth = 1; for (let yy = -6; yy > -th; yy -= 7) { c.beginPath(); c.moveTo(bx - tw / 2, yy); c.lineTo(bx + tw / 2, yy); c.stroke(); } c.fillStyle = P[1]; c.fillRect(bx - tw, -12, tw * 2, 12); c.restore();
    tp(); ink(c, 2.4);
    for (let k = 0; k < 3; k++) kangura(c, bx - tw / 2 + 2 + k * 11, -th, 8, P[0]);
    c.fillStyle = '#2a1d16'; c.fillRect(bx - 1.6, -th + 14, 3.2, 9); c.fillRect(bx - 1.6, -th + 32, 3.2, 9);
  }
  if (o.arms) HER.banner(c, towers[Math.floor(towers.length / 2)] || 0, -H - 64, 30, 20, o.arms, t, { poleLen: 48 });
  if (o.burn) { for (const [fx, fs] of [[-w * 0.3, 0.9], [w * 0.05, 1.2], [w * 0.36, 0.8]]) PROP.fire(c, fx, -H - 2, fs, t + fx * 0.01); for (let i = 0; i < 4; i++) smokePuffs(c, -w * 0.3 + i * w * 0.22, -H - 30, 1.4, t + i * 0.5, 3); }
  c.restore();
};

PROP.shikhara = function (c, x, y, s, t, o = {}) {
  // a Nagara temple: platform, porch, sanctum, the curved tower with its ribbed amalaka and pot finial
  const st = o.col || '#e8d0a0', sd = shade(st, -0.2);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 52, 8);
  c.beginPath(); c.rect(-48, -10, 96, 10); c.fillStyle = sd; c.fill(); ink(c, 2.2);
  // porch
  c.beginPath(); c.rect(-42, -36, 30, 26); c.fillStyle = st; c.fill(); ink(c, 2);
  c.fillStyle = '#3a2a1e'; c.beginPath(); c.moveTo(-33, -10); c.lineTo(-33, -26); c.lineTo(-21, -26); c.lineTo(-21, -10); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-46, -36); c.lineTo(-27, -56); c.lineTo(-8, -36); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 2);
  c.strokeStyle = sd; c.lineWidth = 1.4; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-46 + i * 4.5, -36 - i * 4.5); c.lineTo(-8 - i * 4.5, -36 - i * 4.5); c.stroke(); }
  // sanctum and tower
  c.beginPath(); c.rect(-12, -46, 48, 36); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.strokeStyle = sd; c.lineWidth = 1.4; for (const yy of [-16, -40]) { c.beginPath(); c.moveTo(-12, yy); c.lineTo(36, yy); c.stroke(); }
  const tower = () => { c.beginPath(); c.moveTo(-10, -46); c.bezierCurveTo(-12, -80, -2, -104, 12, -112); c.bezierCurveTo(26, -104, 36, -80, 34, -46); c.closePath(); };
  tower(); c.fillStyle = st; c.fill();
  c.save(); tower(); c.clip(); c.strokeStyle = sd; c.lineWidth = 1.5; for (let yy = -52; yy > -112; yy -= 8) { c.beginPath(); c.moveTo(-14, yy); c.lineTo(38, yy); c.stroke(); } c.fillStyle = shade(st, 0.12); c.fillRect(7, -112, 10, 66); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(22, -112, 20, 66); c.restore();
  tower(); ink(c, 2.4);
  c.beginPath(); ell(c, 12, -115, 11, 4.5); c.fillStyle = st; c.fill(); ink(c, 2);
  c.strokeStyle = sd; c.lineWidth = 1; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(12 + i * 3, -119); c.lineTo(12 + i * 3.4, -111); c.stroke(); }
  c.beginPath(); c.moveTo(7, -119); c.quadraticCurveTo(4, -126, 12, -130); c.quadraticCurveTo(20, -126, 17, -119); c.closePath(); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.6);
  c.beginPath(); c.moveTo(12, -130); c.lineTo(12, -146); ink(c, 1.8);
  const fw = Math.sin(t * 4) * 2; c.beginPath(); c.moveTo(12, -146); c.lineTo(28, -142 + fw); c.lineTo(12, -137); c.closePath(); c.fillStyle = o.flag || '#f0a02c'; c.fill(); ink(c, 1.4);
  c.restore();
};

PROP.vimana = function (c, x, y, s, t, o = {}) {
  // a Dravidian temple tower like the great vimana of Gangaikonda Cholapuram: stepped tiers of little shrines, a domed crown
  const st = o.col || '#dcc49c', sd = shade(st, -0.2), sl = shade(st, 0.15);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 70, 9);
  c.beginPath(); c.rect(-62, -14, 124, 14); c.fillStyle = sd; c.fill(); ink(c, 2.2);
  c.strokeStyle = shade(sd, -0.2); c.lineWidth = 1.3; c.beginPath(); c.moveTo(-62, -7); c.lineTo(62, -7); c.stroke();
  // sanctum walls with pilasters and a doorway
  c.beginPath(); c.rect(-46, -58, 92, 44); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.strokeStyle = sd; c.lineWidth = 1.5; for (let px = -40; px <= 40; px += 16) { c.beginPath(); c.moveTo(px, -58); c.lineTo(px, -14); c.stroke(); }
  c.beginPath(); c.moveTo(-8, -14); c.lineTo(-8, -38); c.lineTo(8, -38); c.lineTo(8, -14); c.closePath(); c.fillStyle = '#3a2a1e'; c.fill(); ink(c, 1.6);
  // the tiers
  let yy = -58, hw = 50;
  for (let i = 0; i < 8; i++) {
    const th = 12, nw = hw - 4.5;
    c.beginPath(); c.moveTo(-hw, yy); c.lineTo(-nw, yy - th); c.lineTo(nw, yy - th); c.lineTo(hw, yy); c.closePath(); c.fillStyle = i % 2 ? st : sl; c.fill(); ink(c, 1.8);
    // miniature shrines (kutas and salas) along each tier
    const n = Math.max(2, Math.round(nw / 11));
    for (let k = 0; k <= n; k++) { const kx = lerp(-nw + 4, nw - 4, k / n); c.beginPath(); c.moveTo(kx - 3.6, yy - th); c.quadraticCurveTo(kx - 3.6, yy - th - 6, kx, yy - th - 7); c.quadraticCurveTo(kx + 3.6, yy - th - 6, kx + 3.6, yy - th); c.closePath(); c.fillStyle = sl; c.fill(); c.lineWidth = 1.1; c.strokeStyle = INK; c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(nw * 0.4, yy - th, hw - nw * 0.4, th);
    yy -= th; hw = nw;
  }
  // the neck and the dome (stupi), with a gold pot on top
  c.beginPath(); c.rect(-12, yy - 8, 24, 8); c.fillStyle = sd; c.fill(); ink(c, 1.8);
  c.beginPath(); c.moveTo(-18, yy - 8); c.bezierCurveTo(-20, yy - 30, 20, yy - 30, 18, yy - 8); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.save(); c.beginPath(); c.moveTo(-18, yy - 8); c.bezierCurveTo(-20, yy - 30, 20, yy - 30, 18, yy - 8); c.closePath(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(4, yy - 32, 20, 26); c.restore();
  c.beginPath(); c.moveTo(-4, yy - 25); c.quadraticCurveTo(-7, yy - 33, 0, yy - 38); c.quadraticCurveTo(7, yy - 33, 4, yy - 25); c.closePath(); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.6);
  c.restore();
};

PROP.minar = function (c, x, y, s, t, o = {}) {
  // the Qutb Minar: five fluted storeys, red sandstone below and white marble above, with balconies
  const H = [58, 44, 36, 28, 24], red = '#c46a4c', white = '#efe6d6';
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 3, 2, 26, 6);
  let yy = 0, hw = 17;
  H.forEach((h, i) => {
    const tw = hw - h * 0.07, col = i < 3 ? red : white;
    const sh = () => { c.beginPath(); c.moveTo(-hw, yy); c.lineTo(-tw, yy - h); c.lineTo(tw, yy - h); c.lineTo(hw, yy); c.closePath(); };
    sh(); c.fillStyle = col; c.fill();
    c.save(); sh(); c.clip();
    c.strokeStyle = shade(col, -0.22); c.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * hw / 3.6, yy); c.lineTo(k * tw / 3.6, yy - h); c.stroke(); }
    c.fillStyle = i < 3 ? '#e8b08a' : red; for (const f of [0.3, 0.65]) c.fillRect(-hw, yy - h * f - 2, hw * 2, 3.5);
    c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(hw * 0.25, yy - h, hw, h); c.restore();
    sh(); ink(c, 2.1);
    yy -= h;
    if (i < H.length - 1) { c.beginPath(); c.rect(-tw - 4, yy - 4, tw * 2 + 8, 5); c.fillStyle = shade(col, -0.1); c.fill(); ink(c, 1.8); c.fillStyle = INK; for (let k = -2; k <= 2; k++) c.fillRect(k * (tw / 2.4) - 0.6, yy - 1, 1.2, 4); }
    hw = tw;
  });
  c.beginPath(); c.moveTo(-hw - 2, yy); c.quadraticCurveTo(-hw, yy - 14, 0, yy - 16); c.quadraticCurveTo(hw, yy - 14, hw + 2, yy); c.closePath(); c.fillStyle = white; c.fill(); ink(c, 1.8);
  c.restore();
};

PROP.screen = function (c, x, y, s, t, o = {}) {
  // the arched screen of the first mosque of Delhi: a tall pointed arch between smaller ones, bands of carving
  const st = '#c8a080', sd = shade(st, -0.2);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 80, 8);
  const wall = () => { c.beginPath(); c.moveTo(-74, 0); c.lineTo(-74, -40); c.lineTo(-24, -40); c.lineTo(-24, -72); c.lineTo(24, -72); c.lineTo(24, -40); c.lineTo(74, -40); c.lineTo(74, 0); c.closePath(); };
  wall(); c.fillStyle = st; c.fill();
  c.save(); wall(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(30, -80, 60, 80); c.strokeStyle = sd; c.lineWidth = 1.4; for (const yy of [-8, -36]) { c.beginPath(); c.moveTo(-80, yy); c.lineTo(80, yy); c.stroke(); } c.restore();
  wall(); ink(c, 2.3);
  const arch = (ax, aw, ah) => { c.beginPath(); c.moveTo(ax - aw, 0); c.lineTo(ax - aw, -ah * 0.55); c.quadraticCurveTo(ax - aw, -ah * 0.9, ax, -ah); c.quadraticCurveTo(ax + aw, -ah * 0.9, ax + aw, -ah * 0.55); c.lineTo(ax + aw, 0); c.closePath(); c.fillStyle = '#4a3a2e'; c.fill(); ink(c, 2); c.strokeStyle = PAL.goldD; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ax - aw - 3, -ah * 0.55); c.quadraticCurveTo(ax - aw - 3, -ah * 0.95, ax, -ah - 4); c.quadraticCurveTo(ax + aw + 3, -ah * 0.95, ax + aw + 3, -ah * 0.55); c.stroke(); };
  arch(0, 14, 60); arch(-48, 9, 30); arch(48, 9, 30);
  c.restore();
};

PROP.chatra = function (c, x, y, s, t, o = {}) {
  // the royal parasol on its staff; o.fallen lays it on the ground
  const col = o.col || '#f7f3ea';
  c.save(); c.translate(x, y); c.scale(s, s);
  if (o.fallen) { inShadow(c, 0, 1, 40, 5); c.translate(-30, -4); c.rotate(1.35); }
  else inShadow(c, 0, 1, 8, 3);
  c.beginPath(); cap(c, 0, 0, 0, -70, 2.6); c.fillStyle = PAL.goldD; c.fill(); ink(c, 1.6);
  const dome = () => { c.beginPath(); c.moveTo(-28, -68); c.bezierCurveTo(-27, -90, 27, -90, 28, -68); c.quadraticCurveTo(0, -74, -28, -68); c.closePath(); };
  dome(); c.fillStyle = col; c.fill();
  c.save(); dome(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(6, -92, 30, 26); c.strokeStyle = PAL.gold; c.lineWidth = 1.6; for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(k * 16, -86); c.lineTo(k * 34, -69); c.stroke(); } c.restore();
  dome(); ink(c, 2);
  c.beginPath(); for (let i = 0; i < 9; i++) { const fx = -26 + i * 6.5; c.moveTo(fx - 2.6, -68); c.lineTo(fx, -60 + (i % 2) * 2); c.lineTo(fx + 2.6, -68); } c.fillStyle = PAL.gold; c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke();
  c.beginPath(); circ(c, 0, -86, 3.4); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.4);
  c.restore();
};

PROP.araba = function (c, x, y, s, t, o = {}) {
  // Babur's carts, roped together with raw hide, with mantlets between them and a gap for the horsemen
  const w = o.w || 300, n = Math.max(3, Math.round(w / 64));
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 0, 2, w / 2 + 10, 7);
  const cart = (cx) => {
    c.beginPath(); rr(c, cx - 22, -28, 44, 14, 2); c.fillStyle = PAL.wood; c.fill(); ink(c, 2);
    c.strokeStyle = PAL.woodD; c.lineWidth = 1.2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(cx + k * 12, -28); c.lineTo(cx + k * 12, -14); c.stroke(); }
    for (const wx of [cx - 13, cx + 13]) { c.beginPath(); circ(c, wx, -10, 10); c.fillStyle = PAL.woodL; c.fill(); ink(c, 2); c.strokeStyle = PAL.woodD; c.lineWidth = 1.6; for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI; c.beginPath(); c.moveTo(wx + Math.cos(a) * 9, -10 + Math.sin(a) * 9); c.lineTo(wx - Math.cos(a) * 9, -10 - Math.sin(a) * 9); c.stroke(); } c.beginPath(); circ(c, wx, -10, 2.4); c.fillStyle = PAL.woodD; c.fill(); }
  };
  const mantlet = (mx) => { c.beginPath(); c.moveTo(mx - 7, 0); c.lineTo(mx - 6, -34); c.lineTo(mx + 6, -34); c.lineTo(mx + 7, 0); c.closePath(); c.fillStyle = '#b8864a'; c.fill(); ink(c, 1.8); c.fillStyle = '#2a1d16'; c.fillRect(mx - 3, -26, 6, 3); c.strokeStyle = PAL.woodD; c.lineWidth = 1; for (const yy of [-10, -20, -30]) { c.beginPath(); c.moveTo(mx - 6, yy); c.lineTo(mx + 6, yy); c.stroke(); } };
  for (let i = 0; i < n; i++) {
    const cx = -w / 2 + 26 + i * ((w - 52) / (n - 1));
    if (i === Math.floor(n / 2)) continue;   // the gap
    cart(cx);
    if (i < n - 1 && i + 1 !== Math.floor(n / 2)) { const mx = cx + (w - 52) / (n - 1) / 2; c.strokeStyle = '#6d4a2c'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + 22, -22); c.quadraticCurveTo(mx, -14, mx + (w - 52) / (n - 1) / 2 - 22, -22); c.stroke(); mantlet(mx); }
  }
  c.restore();
};

PROP.cups = function (c, x, y, s, t, o = {}) {
  // gold and silver cups broken on the ground, the wine poured out
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(120,20,40,0.75)'; c.beginPath(); ell(c, 2, 2, 30, 6); c.fill();
  const cup = (cx, cy, a, col) => { c.save(); c.translate(cx, cy); c.rotate(a); c.beginPath(); c.moveTo(-7, -14); c.quadraticCurveTo(-7, -4, -1.5, -2); c.lineTo(-1.5, 3); c.lineTo(-5, 5); c.lineTo(5, 5); c.lineTo(1.5, 3); c.lineTo(1.5, -2); c.quadraticCurveTo(7, -4, 7, -14); c.closePath(); c.fillStyle = col; c.fill(); ink(c, 1.6); c.restore(); };
  cup(-16, -1, 1.35, PAL.gold); cup(12, 0, -1.4, '#d9dde2'); cup(0, -1, 0, PAL.gold);
  c.fillStyle = '#d9dde2'; for (const [px, py, a] of [[22, -1, 0.4], [26, 0, -0.6], [-26, 0, 0.8]]) { c.save(); c.translate(px, py); c.rotate(a); c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -4); c.lineTo(3, 0); c.closePath(); c.fill(); ink(c, 1); c.restore(); }
  c.restore();
};

PROP.pillar = function (c, x, y, s, t, o = {}) {
  // a stone victory pillar with its carved record and the royal emblem on top
  const st = '#cfc3ae', sd = shade(st, -0.2);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 3, 2, 22, 5);
  c.beginPath(); c.rect(-18, -10, 36, 10); c.fillStyle = sd; c.fill(); ink(c, 2);
  c.beginPath(); c.rect(-10, -92, 20, 82); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.save(); c.beginPath(); c.rect(-10, -92, 20, 82); c.clip(); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(3, -92, 10, 82); c.strokeStyle = 'rgba(70,50,30,0.5)'; c.lineWidth = 1; for (let yy = -84; yy < -24; yy += 5) { c.beginPath(); c.moveTo(-7, yy); c.lineTo(7 - ((yy * 7) % 5), yy); c.stroke(); } c.restore();
  c.beginPath(); c.moveTo(-15, -92); c.lineTo(15, -92); c.lineTo(12, -100); c.lineTo(-12, -100); c.closePath(); c.fillStyle = sd; c.fill(); ink(c, 2);
  c.save(); c.translate(0, -100); c.fillStyle = PAL.gold; HER.tiger(c, 0, -14, 28, PAL.gold); c.restore();
  c.restore();
};

PROP.dvarapala = function (c, x, y, s, t, o = {}) {
  // the Chalukya door-guardian: a stone giant leaning on his club, crowned, with a fanged grin
  const st = o.col || '#6d6a66', sl = shade(st, 0.18), sd = shade(st, -0.25);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 3, 2, 30, 6);
  c.beginPath(); c.rect(-26, -12, 52, 12); c.fillStyle = sd; c.fill(); ink(c, 2);
  // club resting on the ground, the right hand on it
  c.beginPath(); c.moveTo(14, -12); c.lineTo(18, -60); c.quadraticCurveTo(26, -70, 30, -60); c.lineTo(22, -12); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 2);
  // legs and body
  c.beginPath(); c.moveTo(-14, -12); c.lineTo(-12, -46); c.lineTo(8, -46); c.lineTo(10, -12); c.closePath(); c.fillStyle = sd; c.fill(); ink(c, 2);
  c.beginPath(); c.moveTo(-20, -46); c.quadraticCurveTo(-24, -70, -16, -86); c.lineTo(14, -86); c.quadraticCurveTo(22, -70, 16, -46); c.closePath(); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.beginPath(); ell(c, -2, -58, 12, 10); c.fillStyle = sl; c.fill(); ink(c, 1.6);
  c.strokeStyle = sd; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-18, -80); c.quadraticCurveTo(-2, -66, 14, -80); c.stroke();
  // arms: the right on the club, the left raised in warning
  c.beginPath(); cap(c, 12, -82, 22, -64, 7); c.fillStyle = st; c.fill(); ink(c, 1.8);
  c.beginPath(); cap(c, -16, -82, -28, -96, 7); c.fillStyle = st; c.fill(); ink(c, 1.8);
  c.beginPath(); circ(c, -29, -99, 5); c.fillStyle = st; c.fill(); ink(c, 1.6);
  // head, crown and fangs
  c.beginPath(); circ(c, -2, -98, 13); c.fillStyle = st; c.fill(); ink(c, 2.2);
  c.beginPath(); c.moveTo(-13, -106); c.lineTo(-11, -124); c.lineTo(-5, -116); c.lineTo(-2, -128); c.lineTo(1, -116); c.lineTo(7, -124); c.lineTo(9, -106); c.closePath(); c.fillStyle = sl; c.fill(); ink(c, 1.8);
  c.fillStyle = '#1d1a17'; c.beginPath(); circ(c, -7, -100, 2.2); circ(c, 3, -100, 2.2); c.fill();
  c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(-6, -92); c.lineTo(-4, -86); c.lineTo(-2, -92); c.closePath(); c.moveTo(0, -92); c.lineTo(2, -86); c.lineTo(4, -92); c.closePath(); c.fill();
  c.strokeStyle = '#1d1a17'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-9, -92); c.quadraticCurveTo(-2, -88, 5, -92); c.stroke();
  c.restore();
};

PROP.banyan = function (c, x, y, s, t, o = {}) {
  // a banyan: a thick trunk, a wide canopy and aerial roots hanging to the ground
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 60, 9);
  c.strokeStyle = '#6d4a2c'; c.lineWidth = 2; for (const rx of [-44, -36, -22, 20, 34, 46]) { c.beginPath(); c.moveTo(rx, -52); c.quadraticCurveTo(rx + Math.sin(rx) * 3, -26, rx + 1, 0); c.stroke(); }
  c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-8, -30, -14, -56); c.lineTo(14, -56); c.quadraticCurveTo(8, -30, 12, 0); c.closePath(); c.fillStyle = PAL.trunk; c.fill(); ink(c, 2.2);
  const blobs = [[-40, -62, 20], [-18, -76, 24], [8, -80, 24], [32, -66, 22], [48, -54, 16], [-54, -50, 15], [-4, -60, 22], [22, -52, 18]];
  for (const [bx, by, r] of blobs) { c.beginPath(); circ(c, bx, by, r); c.lineWidth = 4.4; c.strokeStyle = INK; c.stroke(); }
  for (const [bx, by, r] of blobs) { c.beginPath(); circ(c, bx, by, r); c.fillStyle = PAL.leafD; c.fill(); }
  for (const [bx, by, r] of blobs) { c.beginPath(); circ(c, bx - r * 0.2, by - r * 0.25, r * 0.72); c.fillStyle = PAL.leaf; c.fill(); c.beginPath(); circ(c, bx - r * 0.35, by - r * 0.4, r * 0.35); c.fillStyle = PAL.leafL; c.fill(); }
  c.restore();
};

PROP.boulders = function (c, x, y, s, t, o = {}) {
  // a pile of rounded granite boulders, the landscape of the Deccan
  const R = rng(o.seed || 11), col = o.col || '#c2ab8c';
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 50, 7);
  const rocks = [[-30, -12, 20, 13], [-6, -14, 24, 15], [22, -11, 19, 12], [-18, -34, 17, 13], [8, -36, 19, 14], [-2, -54, 14, 11]];
  for (const [bx, by, rx, ry] of rocks) {
    const cx = bx + (R() - 0.5) * 4, cy = by + (R() - 0.5) * 3;
    c.beginPath(); ell(c, cx, cy, rx, ry, (R() - 0.5) * 0.4); c.fillStyle = shade(col, (R() - 0.5) * 0.12); c.fill(); ink(c, 2.2);
    c.save(); c.beginPath(); ell(c, cx, cy, rx, ry); c.clip(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); ell(c, cx + rx * 0.35, cy + ry * 0.4, rx, ry); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); ell(c, cx - rx * 0.35, cy - ry * 0.45, rx * 0.4, ry * 0.25); c.fill(); c.restore();
  }
  c.restore();
};

PROP.ghat = function (c, x, y, s, t, o = {}) {
  // stone steps down to a river, with a small shrine at the top
  const w = o.w || 220, st = '#d9c7a4', sd = shade(st, -0.2);
  c.save(); c.translate(x, y); c.scale(s, s);
  // the river at the foot of the steps
  const wg = c.createLinearGradient(0, 0, 0, 60); wg.addColorStop(0, '#5aa7c4'); wg.addColorStop(1, '#2f6f8f'); c.fillStyle = wg; c.beginPath(); c.moveTo(-w / 2 - 90, 16); c.quadraticCurveTo(0, 8, w / 2 + 90, 16); c.lineTo(w / 2 + 90, 70); c.lineTo(-w / 2 - 90, 70); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.4; for (let i = 0; i < 7; i++) { const wx = -w / 2 - 60 + i * (w + 120) / 7 + Math.sin(t + i) * 4, wy = 30 + (i % 3) * 10; c.beginPath(); c.moveTo(wx, wy); c.quadraticCurveTo(wx + 8, wy - 3, wx + 16, wy); c.stroke(); }
  for (let i = 0; i < 6; i++) { const yy = i * 7, hw = w / 2 - i * 4; c.beginPath(); c.rect(-hw, yy - 7, hw * 2, 7); c.fillStyle = i % 2 ? st : shade(st, 0.08); c.fill(); ink(c, 1.8); c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(-hw, yy - 2, hw * 2, 2); }
  c.beginPath(); c.rect(-w / 2, -30, w, 23); c.fillStyle = st; c.fill(); ink(c, 2);
  c.strokeStyle = sd; c.lineWidth = 1.2; for (let xx = -w / 2 + 14; xx < w / 2; xx += 14) { c.beginPath(); c.moveTo(xx, -30); c.lineTo(xx, -7); c.stroke(); }
  if (o.shrine) PROP.shikhara(c, w * 0.28, -30, 0.42, t, { col: '#e8d8b8' });
  c.restore();
};

PROP.mandal = function (c, x, y, s, t, o = {}) {
  // Humayun's library, the Sher Mandal: an octagonal red sandstone tower of two storeys and a domed kiosk
  const red = '#c46a4c', rd = shade(red, -0.22), white = '#efe6d6';
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 4, 2, 50, 8);
  const storey = (y0, hw, h) => {
    c.beginPath(); c.moveTo(-hw, y0); c.lineTo(-hw, y0 - h); c.lineTo(hw, y0 - h); c.lineTo(hw, y0); c.closePath(); c.fillStyle = red; c.fill(); ink(c, 2.2);
    c.fillStyle = rd; c.fillRect(-hw * 0.5 - 1, y0 - h, 2, h); c.fillRect(hw * 0.5 - 1, y0 - h, 2, h);
    for (const ax of [-hw * 0.75, 0, hw * 0.75]) { c.beginPath(); c.moveTo(ax - 6, y0 - 4); c.lineTo(ax - 6, y0 - h * 0.55); c.quadraticCurveTo(ax - 6, y0 - h * 0.8, ax, y0 - h * 0.86); c.quadraticCurveTo(ax + 6, y0 - h * 0.8, ax + 6, y0 - h * 0.55); c.lineTo(ax + 6, y0 - 4); c.closePath(); c.fillStyle = '#4a2a1e'; c.fill(); ink(c, 1.4); c.strokeStyle = white; c.lineWidth = 1.4; c.stroke(); }
    c.beginPath(); c.rect(-hw - 3, y0 - h - 4, hw * 2 + 6, 4); c.fillStyle = white; c.fill(); ink(c, 1.6);
  };
  storey(0, 42, 38); storey(-42, 34, 30);
  // the kiosk (chhatri): pillars and a dome
  const ky = -76;
  for (const px of [-18, -6, 6, 18]) { c.beginPath(); c.rect(px - 2, ky - 18, 4, 18); c.fillStyle = white; c.fill(); ink(c, 1.4); }
  c.beginPath(); c.rect(-24, ky - 22, 48, 4); c.fillStyle = red; c.fill(); ink(c, 1.6);
  c.beginPath(); c.moveTo(-18, ky - 22); c.bezierCurveTo(-20, ky - 44, 20, ky - 44, 18, ky - 22); c.closePath(); c.fillStyle = white; c.fill(); ink(c, 2);
  c.beginPath(); c.moveTo(0, ky - 38); c.lineTo(0, ky - 48); ink(c, 1.6); c.beginPath(); circ(c, 0, ky - 49, 2.4); c.fillStyle = PAL.gold; c.fill(); ink(c, 1.2);
  c.restore();
};

PROP.charbagh = function (c, x, y, s, t, o = {}) {
  // a Timurid garden at Kabul: a low wall, a water channel with a fountain, cypresses and flower beds
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-120, -40, 240, 14); c.fillStyle = '#d9c7a4'; c.fill(); ink(c, 2);
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(-120, -30, 240, 4);
  c.beginPath(); c.moveTo(-8, -26); c.lineTo(8, -26); c.lineTo(14, 4); c.lineTo(-14, 4); c.closePath(); c.fillStyle = '#6fbcd2'; c.fill(); ink(c, 2);
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const yy = -18 + i * 8 + (t * 6 % 8); c.beginPath(); c.moveTo(-5, yy); c.lineTo(5, yy); c.stroke(); }
  c.fillStyle = 'rgba(210,240,255,0.8)'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35, k = ((t * 1.3 + i * 0.17) % 1); c.beginPath(); circ(c, Math.cos(a) * 10 * k, -8 + Math.sin(a) * 14 * k + k * k * 10, 1.4); c.fill(); }
  for (const sx of [-1, 1]) {
    for (const [fx, fy] of [[40, -8], [80, -12]]) { c.beginPath(); ell(c, sx * fx, fy, 18, 6); c.fillStyle = '#4f9a3b'; c.fill(); ink(c, 1.6); for (let i = 0; i < 5; i++) { c.beginPath(); circ(c, sx * fx - 12 + i * 6, fy - 1 + (i % 2) * 2, 2); c.fillStyle = ['#e8a0c8', '#f6d34a', '#f4efe2', '#d63c31', '#e8a0c8'][i]; c.fill(); } }
    for (const cx of [22, 60, 100]) { c.beginPath(); c.moveTo(sx * cx, -22); c.quadraticCurveTo(sx * cx - 7, -44, sx * cx, -70); c.quadraticCurveTo(sx * cx + 7, -44, sx * cx, -22); c.closePath(); c.fillStyle = PAL.leafD; c.fill(); ink(c, 1.8); c.beginPath(); rr(c, sx * cx - 1.5, -24, 3, 6, 1); c.fillStyle = PAL.trunk; c.fill(); }
  }
  c.restore();
};

PROP.slab = function (c, x, y, s, t, o = {}) {
  // an inscribed stone with the royal emblem carved at the top (the Chola tiger, the Chalukya boar)
  const st = '#b9b0a0', sd = shade(st, -0.22);
  c.save(); c.translate(x, y); c.scale(s, s);
  inShadow(c, 3, 2, 22, 5);
  const sl = () => { c.beginPath(); c.moveTo(-17, 0); c.lineTo(-17, -46); c.quadraticCurveTo(-17, -62, 0, -64); c.quadraticCurveTo(17, -62, 17, -46); c.lineTo(17, 0); c.closePath(); };
  sl(); c.fillStyle = st; c.fill();
  c.save(); sl(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(6, -70, 20, 70); c.strokeStyle = 'rgba(60,50,40,0.55)'; c.lineWidth = 1.1; for (let yy = -32; yy < -4; yy += 4.5) { c.beginPath(); c.moveTo(-12, yy); c.lineTo(12 - ((yy * 3) % 6), yy); c.stroke(); } c.restore();
  sl(); ink(c, 2.2);
  c.save(); c.beginPath(); circ(c, 0, -48, 11); c.clip(); HER.paint(c, o.arms || 'chola', -11, -59, 22, 22); c.restore();
  c.beginPath(); circ(c, 0, -48, 11); ink(c, 1.6);
  c.restore();
};

PROP.mashk = function (c, x, y, s, t, o = {}) {
  // Humayun and the water-carrier Nizam, afloat on a blown-up goatskin in the Ganges
  const bob = Math.sin(t * 1.8) * 1.5;
  c.save(); c.translate(x, y + bob); c.scale(s, s);
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); ell(c, 0, 6, 54, 6); c.fill();
  // the water-carrier behind, then the skin, then Humayun in front
  const head = (hx, hy, turban, taj) => {
    c.beginPath(); circ(c, hx, hy, 10); c.fillStyle = '#d9a47a'; c.fill(); ink(c, 2);
    c.beginPath(); c.moveTo(hx - 11, hy - 3); c.quadraticCurveTo(hx - 12, hy - 16, hx, hy - 17); c.quadraticCurveTo(hx + 12, hy - 16, hx + 11, hy - 3); c.quadraticCurveTo(hx, hy - 8, hx - 11, hy - 3); c.closePath(); c.fillStyle = turban; c.fill(); ink(c, 1.8);
    if (taj) { c.beginPath(); c.moveTo(hx - 4, hy - 15); c.lineTo(hx - 1, hy - 30); c.lineTo(hx + 2, hy - 15); c.closePath(); c.fillStyle = taj; c.fill(); ink(c, 1.6); }
    c.fillStyle = INK; c.beginPath(); circ(c, hx - 3.5, hy - 1, 1.3); circ(c, hx + 3.5, hy - 1, 1.3); c.fill();
  };
  head(26, -14, '#e8dcc0');
  const skin = () => { c.beginPath(); c.moveTo(-30, 0); c.bezierCurveTo(-36, -22, -10, -30, 10, -26); c.bezierCurveTo(30, -24, 38, -8, 32, 2); c.quadraticCurveTo(0, 8, -30, 0); c.closePath(); };
  skin(); c.fillStyle = '#9a6a3c'; c.fill();
  c.save(); skin(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); ell(c, -4, -20, 16, 5); c.fill(); c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(-40, -6, 80, 12); c.restore();
  skin(); ink(c, 2.2);
  for (const lx of [-22, -12, 18, 26]) { c.beginPath(); cap(c, lx, -24, lx + (lx < 0 ? -3 : 3), -32, 3); c.fillStyle = '#9a6a3c'; c.fill(); ink(c, 1.4); }
  c.beginPath(); cap(c, -34, -4, -44, -10, 4); c.fillStyle = '#9a6a3c'; c.fill(); ink(c, 1.4);
  head(-14, -24, '#f7f3ea', '#b8312a');
  for (const [ax, ay, bx, by] of [[-22, -18, -2, -22], [-8, -18, 10, -20], [18, -8, 30, -16]]) { c.beginPath(); cap(c, ax, ay, bx, by, 5); c.fillStyle = ax < 0 ? '#f2c22e' : '#e8dcc0'; c.fill(); ink(c, 1.4); c.beginPath(); circ(c, bx, by, 3.2); c.fillStyle = '#d9a47a'; c.fill(); ink(c, 1.2); }
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { const wx = -40 + i * 26 + Math.sin(t * 2 + i) * 3; c.beginPath(); c.moveTo(wx, 4); c.quadraticCurveTo(wx + 6, 1, wx + 12, 4); c.stroke(); }
  c.restore();
};

/* ===== src/art/30-world.js ===== */
/* Roll to War: world kit (grass, forest, paving, stone blocks, turn markers, gates, pickups, houses, entrance) */
const W = (RTW.world = {});

function mkCanvas(w, h) { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; }
RTW.mkCanvas = mkCanvas;

/* ---------- grass pattern ---------- */
// The tile is painted at the screen's pixel ratio so the grass stays crisp on phones (the pattern is scaled back
// with setTransform); patches, clover, two-tone tufts and little flower clusters, seamless on a 256 px tile.
const _pat = {};
const patPR = () => { const pr = (RTW.game && RTW.game.app && RTW.game.app.PR) || 1; return Math.min(3, Math.max(1, Math.ceil(pr * 2) / 2)); };
function grassTile(g, S, key) {
  if (key === 'lane' || key === 'sand') return laneTile(g, S, key);
  if (key === 'sea' || key === 'seaN') return seaTile(g, S, key === 'seaN');
  if (key === 'snow' || key === 'slush') return snowTile(g, S, key === 'slush');
  // 'dry': the dry-season grass of the north Indian plains; 'black': the black cotton soil of the Deccan
  const dirt = key === 'dirt', dry = key === 'dry', blk = key === 'black', R = rng(dirt ? 99 : dry ? 55 : blk ? 77 : 7);
  // every element is drawn at its spot and, near an edge, again on the far side so the tile repeats without seams
  const wrap = (x, y, rad, fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const X = x + ox, Y = y + oy; if (X + rad < 0 || Y + rad < 0 || X - rad > S || Y - rad > S) continue; fn(X, Y); } };
  g.fillStyle = dirt ? '#9a8056' : dry ? '#a9a660' : blk ? '#6e604e' : PAL.grass; g.fillRect(0, 0, S, S);
  // big soft tonal patches: sunlit and shady grass
  const patches = dirt ? [['#b39868', 0.35], ['#7d6343', 0.3]] : dry ? [['#cdbd74', 0.36], ['#8f9a48', 0.3], ['#b6a45e', 0.3], ['#7c8a3c', 0.26]] : blk ? [['#8c7c62', 0.32], ['#54483a', 0.32], ['#7e7652', 0.26]] : [['#86c653', 0.34], ['#6fb445', 0.3], ['#2f6e2b', 0.26], ['#3d8a36', 0.3]];
  for (let i = 0; i < 16; i++) {
    const x = R() * S, y = R() * S, rad = 26 + R() * 44, [col, a] = patches[i % patches.length];
    wrap(x, y, rad, (X, Y) => { const rg = g.createRadialGradient(X, Y, 1, X, Y, rad); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.beginPath(); ell(g, X, Y, rad, rad * 0.8); g.fill(); });
  }
  // speckle
  const cols = dirt ? ['#a8906a', '#7d6947', '#bba47a', '#8a7250'] : dry ? ['#d9c682', '#7d8a3e', '#bcae66', '#94a04e', '#e2d08e'] : blk ? ['#8e7e64', '#4c4034', '#a0906c', '#62584a'] : [PAL.grassL, PAL.grassD, '#63ad44', '#468f3a', '#8fcf5a'];
  for (let i = 0; i < 620; i++) {
    const x = R() * S, y = R() * S, rad = 0.6 + R() * 1.9, col = cols[(R() * cols.length) | 0], a = 0.3 + R() * 0.45, rot = R() * 3;
    wrap(x, y, rad * 2, (X, Y) => { g.fillStyle = col; g.globalAlpha = a; g.beginPath(); ell(g, X, Y, rad * 1.6, rad, rot); g.fill(); });
  }
  g.globalAlpha = 1;
  if (dirt) return;
  // clover clumps
  for (let i = 0; i < (dry || blk ? 0 : 12); i++) {
    const x = R() * S, y = R() * S, n = 3 + ((R() * 4) | 0), sd = R() * 100;
    wrap(x, y, 10, (X, Y) => {
      const r2 = rng(sd);
      for (let k = 0; k < n; k++) {
        const px = X + (r2() - 0.5) * 14, py = Y + (r2() - 0.5) * 9, s = 1.3 + r2() * 0.6;
        g.fillStyle = '#2e7a2c'; for (let j = 0; j < 3; j++) { const a = j * 2.09 + r2(); g.beginPath(); circ(g, px + Math.cos(a) * s, py + Math.sin(a) * s * 0.8, s); g.fill(); }
        g.fillStyle = 'rgba(160,220,110,0.55)'; g.beginPath(); circ(g, px - s * 0.4, py - s * 0.5, s * 0.55); g.fill();
      }
    });
  }
  // grass tufts: dark blades behind light ones
  for (let i = 0; i < 26; i++) {
    const x = R() * S, y = R() * S, h = 3.5 + R() * 4.5, n = 3 + ((R() * 3) | 0), lean = (R() - 0.5) * 1.6, lc = dry || blk ? (R() < 0.5 ? '#e0cc84' : '#c8b46a') : R() < 0.5 ? '#8fd05c' : PAL.grassL;
    wrap(x, y, 12, (X, Y) => {
      g.lineCap = 'round';
      for (const [col, lw, dx] of [[dry ? '#6a6a2e' : blk ? '#3e3428' : PAL.grassDD, 1.5, 0], [lc, 1, -0.6]]) {
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
        for (let j = 0; j < n; j++) { const bx = X + (j - (n - 1) / 2) * 1.7 + dx; g.moveTo(bx, Y); g.quadraticCurveTo(bx + lean + (j - 1) * 0.8, Y - h * 0.6, bx + lean * 2 + (j - (n - 1) / 2) * 1.4, Y - h * (0.8 + (j % 2) * 0.25)); }
        g.stroke();
      }
    });
  }
  // flower clusters: daisies, buttercups, pink clover and a few violets
  const FL = [['#ffffff', '#f6c343'], ['#ffe066', '#e89a1a'], ['#ffb3d1', '#e0508f'], ['#c8b4ff', '#7f5fd0']];
  for (let i = 0; i < (blk ? 0 : dry ? 2 : 6); i++) {
    const x = R() * S, y = R() * S, [pet, mid] = FL[i % FL.length], n = 3 + ((R() * 4) | 0), sd = R() * 100;
    wrap(x, y, 12, (X, Y) => {
      const r2 = rng(sd);
      for (let k = 0; k < n; k++) {
        const px = X + (r2() - 0.5) * 16, py = Y + (r2() - 0.5) * 10, s = 1.25 + r2() * 0.45;
        g.fillStyle = 'rgba(30,70,20,0.35)'; g.beginPath(); ell(g, px + 0.6, py + 1.2, s * 1.6, s * 0.7); g.fill();
        g.fillStyle = pet; for (let j = 0; j < 5; j++) { const a = j * 1.2566; g.beginPath(); circ(g, px + Math.cos(a) * s, py + Math.sin(a) * s * 0.85, s * 0.72); g.fill(); }
        g.fillStyle = mid; g.beginPath(); circ(g, px, py, s * 0.55); g.fill();
      }
    });
  }
  // pebbles
  for (let i = 0; i < 6; i++) {
    const x = R() * S, y = R() * S, s = 1.2 + R() * 1.3;
    wrap(x, y, 4, (X, Y) => { g.fillStyle = 'rgba(40,50,30,0.3)'; g.beginPath(); ell(g, X + 0.5, Y + 0.8, s * 1.3, s * 0.8); g.fill(); g.fillStyle = '#c9c3b2'; g.beginPath(); ell(g, X, Y, s * 1.2, s * 0.85); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); circ(g, X - s * 0.35, Y - s * 0.3, s * 0.35); g.fill(); });
  }
}
// a dirt lane (warm tan) or desert track (pale sand): soft patches, grit, small stones; no tile seams
function laneTile(g, S, key) {
  const sand = key === 'sand', R = rng(sand ? 31 : 17);
  const wrap = (x, y, rad, fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const X = x + ox, Y = y + oy; if (X + rad < 0 || Y + rad < 0 || X - rad > S || Y - rad > S) continue; fn(X, Y); } };
  g.fillStyle = sand ? '#f3e0b0' : '#c29a66'; g.fillRect(0, 0, S, S);
  const patches = sand ? [['#fbeccb', 0.5], ['#e6c58c', 0.35], ['#f7e6bc', 0.4]] : [['#d6b27c', 0.45], ['#a47c4f', 0.38], ['#cfa670', 0.4], ['#9a7348', 0.3]];
  for (let i = 0; i < 18; i++) { const x = R() * S, y = R() * S, rad = 20 + R() * 40, [col, a] = patches[i % patches.length]; wrap(x, y, rad, (X, Y) => { const rg = g.createRadialGradient(X, Y, 1, X, Y, rad); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.beginPath(); ell(g, X, Y, rad, rad * 0.75); g.fill(); }); }
  if (sand) { // wind ripples
    for (let i = 0; i < 22; i++) { const x = R() * S, y = R() * S, L = 20 + R() * 40; wrap(x, y, L, (X, Y) => { g.strokeStyle = 'rgba(190,140,70,0.3)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + L / 2, Y - 3, X + L, Y); g.stroke(); g.strokeStyle = 'rgba(255,250,230,0.45)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(X, Y - 1.4); g.quadraticCurveTo(X + L / 2, Y - 4.4, X + L, Y - 1.4); g.stroke(); }); }
  }
  const cols = sand ? ['#d9b77a', '#f8e8c0', '#c9a56a'] : ['#a07a4c', '#dcbc88', '#8a6640', '#e6caa0'];
  for (let i = 0; i < 520; i++) { const x = R() * S, y = R() * S, rad = 0.5 + R() * 1.3, col = cols[(R() * cols.length) | 0], a = 0.35 + R() * 0.4; wrap(x, y, 3, (X, Y) => { g.fillStyle = col; g.globalAlpha = a; g.beginPath(); ell(g, X, Y, rad * 1.4, rad, 0.4); g.fill(); }); }
  g.globalAlpha = 1;
  for (let i = 0; i < 16; i++) {
    const x = R() * S, y = R() * S, s = 1 + R() * 1.6, col = sand ? '#e9dcc0' : R() < 0.5 ? '#d9cdb4' : '#bdb09a';
    wrap(x, y, 5, (X, Y) => { g.fillStyle = sand ? 'rgba(150,100,40,0.3)' : 'rgba(70,45,20,0.35)'; g.beginPath(); ell(g, X + 0.5, Y + 0.8, s * 1.3, s * 0.8); g.fill(); g.fillStyle = col; g.beginPath(); ell(g, X, Y, s * 1.2, s * 0.85); g.fill(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); circ(g, X - s * 0.35, Y - s * 0.3, s * 0.35); g.fill(); });
  }
}
// open water: deep and light patches, a net of pale caustic lines, small wave marks
function seaTile(g, S, night) {
  const R = rng(night ? 43 : 41);
  const wrap = (x, y, rad, fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const X = x + ox, Y = y + oy; if (X + rad < 0 || Y + rad < 0 || X - rad > S || Y - rad > S) continue; fn(X, Y); } };
  g.fillStyle = night ? '#1a3050' : '#45a0c4'; g.fillRect(0, 0, S, S);
  const patches = night ? [['#24406a', 0.5], ['#10223c', 0.5]] : [['#6cc4de', 0.42], ['#2f86b0', 0.4], ['#5ab6d6', 0.35], ['#3a93bb', 0.35]];
  for (let i = 0; i < 16; i++) { const x = R() * S, y = R() * S, rad = 30 + R() * 50, [col, a] = patches[i % patches.length]; wrap(x, y, rad, (X, Y) => { const rg = g.createRadialGradient(X, Y, 1, X, Y, rad); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.beginPath(); ell(g, X, Y, rad * 1.2, rad * 0.8); g.fill(); }); }
  // caustics: short wobbly pale lines
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = R() * S, y = R() * S, L = 8 + R() * 14, a = R() * TAU, bend = (R() - 0.5) * 8, lw = 0.8 + R() * 0.8, al = night ? 0.08 : 0.16 + R() * 0.12;
    wrap(x, y, L, (X, Y) => { g.strokeStyle = night ? `rgba(170,200,240,${al})` : `rgba(210,245,250,${al})`; g.lineWidth = lw; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + Math.cos(a) * L / 2 - Math.sin(a) * bend, Y + Math.sin(a) * L / 2 + Math.cos(a) * bend, X + Math.cos(a) * L, Y + Math.sin(a) * L); g.stroke(); });
  }
  // little wave marks
  for (let i = 0; i < 26; i++) {
    const x = R() * S, y = R() * S, w = 7 + R() * 9;
    wrap(x, y, w, (X, Y) => { g.strokeStyle = night ? 'rgba(170,200,230,0.2)' : 'rgba(255,255,255,0.5)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + w / 4, Y - 2.6, X + w / 2, Y); g.quadraticCurveTo(X + w * 0.75, Y + 2.6, X + w, Y); g.stroke(); });
  }
}
W.grassPattern = function (c, scale = 1, key = 'g') {
  const hi = typeof DOMMatrix !== 'undefined', pr = hi ? patPR() : 1, k = key + scale + '@' + pr;
  let cv = _pat[k];
  if (!cv) {
    const S = Math.round(256 * scale);
    cv = mkCanvas(S * pr, S * pr); const g = cv.getContext('2d'); g.scale(pr, pr);
    grassTile(g, S, key);
    _pat[k] = cv;
  }
  const p = c.createPattern(cv, 'repeat');
  if (pr !== 1 && p && p.setTransform) { try { p.setTransform(new DOMMatrix([1 / pr, 0, 0, 1 / pr, 0, 0])); } catch (e) {} }
  return p;
};

/* ---------- light: warm sun from the upper left, cool shade and a soft vignette ---------- */
// o: { sun (0..1), shade (0..1), vig (0..1), vigCol }
W.lightWash = function (g, x, y, w, h, o = {}) {
  g.save();
  const sun = o.sun == null ? 1 : o.sun, sh = o.shade == null ? 1 : o.shade, vig = o.vig == null ? 1 : o.vig;
  if (sun > 0) { const lg = g.createLinearGradient(x, y, x + w * 0.75, y + h * 0.6); lg.addColorStop(0, `rgba(255,236,170,${0.2 * sun})`); lg.addColorStop(0.55, 'rgba(255,236,170,0)'); g.fillStyle = lg; g.fillRect(x, y, w, h); }
  if (sh > 0) { const sg = g.createLinearGradient(x + w, y + h, x + w * 0.35, y + h * 0.4); sg.addColorStop(0, `rgba(20,40,70,${0.16 * sh})`); sg.addColorStop(1, 'rgba(20,40,70,0)'); g.fillStyle = sg; g.fillRect(x, y, w, h); }
  if (vig > 0) {
    const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) * 0.62, col = o.vigCol || '14,30,8';
    const vg = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.34, cx, cy, R); vg.addColorStop(0, `rgba(${col},0)`); vg.addColorStop(1, `rgba(${col},${0.3 * vig})`);
    g.fillStyle = vg; g.fillRect(x, y, w, h);
  }
  g.restore();
};

/* ---------- worn ground where armies meet: patchy trodden earth, pebbles, a few surviving tufts ---------- */
W.wornGround = function (g, cx, cy, rx, ry, seed = 1, o = {}) {
  const R = rng(seed * 17 + 5), col = o.col || '150,120,78', dk = o.dark || '110,84,52';
  g.save();
  for (let i = 0; i < 70; i++) {
    const a = R() * TAU, d = Math.sqrt(R()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
    const r = (0.1 + R() * 0.16) * rx * (1.15 - d * 0.5), al = (0.3 + R() * 0.22) * (1 - d * 0.5);
    const rg = g.createRadialGradient(x, y, 1, x, y, r); rg.addColorStop(0, `rgba(${col},${al})`); rg.addColorStop(0.7, `rgba(${col},${al * 0.6})`); rg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = rg; g.beginPath(); ell(g, x, y, r * 1.3, r * 0.8, R() * 0.6 - 0.3); g.fill();
  }
  // trodden streaks and hoof prints
  g.strokeStyle = `rgba(${dk},0.22)`; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const a = R() * TAU, d = Math.sqrt(R()) * 0.85, x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, L = 6 + R() * 14, ang = R() * 0.8 - 0.4; g.lineWidth = 1.2 + R() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L * 0.5); g.stroke(); }
  for (let i = 0; i < 40; i++) { const a = R() * TAU, d = Math.sqrt(R()) * 0.9, x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d; g.fillStyle = `rgba(${dk},0.28)`; g.beginPath(); ell(g, x, y, 1.4 + R(), 0.9 + R() * 0.5, R() * 3); g.fill(); }
  // pebbles
  for (let i = 0; i < 26; i++) { const a = R() * TAU, d = Math.sqrt(R()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, s = 0.9 + R() * 1.3; g.fillStyle = 'rgba(60,45,25,0.3)'; g.beginPath(); ell(g, x + 0.4, y + 0.7, s * 1.2, s * 0.7); g.fill(); g.fillStyle = R() < 0.5 ? '#d8cbb0' : '#bfb49c'; g.beginPath(); ell(g, x, y, s * 1.1, s * 0.8); g.fill(); }
  g.restore();
};

/* ---------- a clump of wild flowers ---------- */
W.flowerPatch = function (g, x, y, r, seed = 1, kind) {
  const R = rng(seed * 13 + 1), FL = { daisy: ['#ffffff', '#f6c343'], butter: ['#ffe066', '#e89a1a'], pink: ['#ffb3d1', '#e0508f'], violet: ['#c8b4ff', '#7f5fd0'], poppy: ['#ff6a4a', '#5a1a10'] };
  const keys = Object.keys(FL), [pet, mid] = FL[kind || keys[(R() * keys.length) | 0]];
  g.save();
  g.fillStyle = 'rgba(40,110,40,0.5)'; g.beginPath(); ell(g, x, y + r * 0.1, r, r * 0.45); g.fill();
  g.strokeStyle = PAL.grassDD; g.lineWidth = 1; g.lineCap = 'round';
  const n = Math.max(3, Math.round(r / 2.2));
  for (let k = 0; k < n; k++) {
    const px = x + (R() - 0.5) * r * 1.7, py = y + (R() - 0.5) * r * 0.7, s = 1.3 + R() * 0.7;
    g.beginPath(); g.moveTo(px, py + 3); g.lineTo(px + (R() - 0.5), py); g.stroke();
    g.fillStyle = pet; for (let j = 0; j < 5; j++) { const a = j * 1.2566 + k; g.beginPath(); circ(g, px + Math.cos(a) * s, py + Math.sin(a) * s * 0.85, s * 0.72); g.fill(); }
    g.fillStyle = mid; g.beginPath(); circ(g, px, py, s * 0.55); g.fill();
  }
  g.restore();
};

/* ---------- grass blades growing over the edge of a path (side: which way the grass lies) ---------- */
W.grassFringe = function (g, x0, y0, x1, y1, nx, ny, seed = 1, o = {}) {
  // (x0,y0)-(x1,y1) is the edge; (nx,ny) points from the grass into the path
  const R = rng(seed), L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / (o.step || 3.2)));
  g.save(); g.lineCap = 'round';
  g.strokeStyle = o.shadow || 'rgba(40,60,20,0.28)'; g.lineWidth = o.w || 2.2; g.beginPath(); g.moveTo(x0 + nx * 1.2, y0 + ny * 1.2); g.lineTo(x1 + nx * 1.2, y1 + ny * 1.2); g.stroke();
  for (const [col, lw] of [[o.dark || PAL.grassD, 1.5], [o.light || PAL.grassL, 1]]) {
    g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
    for (let i = 0; i < n; i++) {
      const u = (i + R() * 0.8) / n, bx = lerp(x0, x1, u) - nx * 1.5, by = lerp(y0, y1, u) - ny * 1.5, h = (o.h || 4.5) * (0.35 + R() * R() * 1.3), side = (R() - 0.5) * 2.6;
      g.moveTo(bx, by); g.quadraticCurveTo(bx + nx * h * 0.6 + ny * side * 0.5, by + ny * h * 0.6 - nx * side * 0.5, bx + nx * h + ny * side, by + ny * h - nx * side);
    }
    g.stroke();
  }
  g.restore();
};

/* ---------- trees & bushes ---------- */
W.tree = function (c, x, y, r, seed = 1, tint = 0) {
  // x,y = trunk base; r = canopy radius
  const R = rng(seed * 9973 + 11);
  c.save();
  // soft two-step shadow, thrown down and to the right by the sun
  c.fillStyle = 'rgba(15,40,12,0.2)'; c.beginPath(); ell(c, x + r * 0.26, y + r * 0.08, r * 1.08, r * 0.42); c.fill();
  c.fillStyle = 'rgba(15,30,12,0.24)'; c.beginPath(); ell(c, x + r * 0.12, y + r * 0.04, r * 0.7, r * 0.26); c.fill();
  // trunk with root flare and a lit left edge
  const tr = () => { c.beginPath(); c.moveTo(x - r * 0.22, y + r * 0.04); c.quadraticCurveTo(x - r * 0.1, y - r * 0.05, x - r * 0.1, y - r * 0.7); c.lineTo(x + r * 0.1, y - r * 0.7); c.quadraticCurveTo(x + r * 0.1, y - r * 0.05, x + r * 0.22, y + r * 0.04); c.closePath(); };
  tr(); c.lineWidth = Math.max(1.2, r * 0.08); c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.fillStyle = PAL.trunk; c.fill();
  c.save(); tr(); c.clip(); c.fillStyle = 'rgba(255,220,160,0.28)'; c.fillRect(x - r * 0.3, y - r * 0.8, r * 0.2, r); c.fillStyle = 'rgba(30,15,5,0.3)'; c.fillRect(x + r * 0.03, y - r * 0.8, r * 0.3, r); c.restore();
  // canopy blobs
  const cy = y - r * 1.25;
  const blobs = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + R() * 0.5;
    blobs.push([x + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.36, r * (0.5 + R() * 0.16)]);
  }
  blobs.push([x, cy - r * 0.18, r * 0.62]);
  const base = tint === 'olive' ? '#95ab66' : tint === 'dry' ? '#7f9a46' : tint ? shade(PAL.leaf, tint) : PAL.leaf;
  // outline pass
  c.fillStyle = INK;
  for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br + Math.max(1.2, r * 0.07)); c.fill(); }
  // fill pass (dark base, a little blue in the shade)
  c.fillStyle = mix(shade(base, -0.3), '#1d4a52', 0.12);
  for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.fill(); }
  // mid tone
  c.fillStyle = base;
  for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx - br * 0.12, by - br * 0.16, br * 0.8); c.fill(); }
  // sunlit tone, warm
  const lit = mix(shade(base, 0.2), '#e8f070', 0.14);
  c.fillStyle = lit;
  for (const [bx, by, br] of blobs) { if (by < cy + r * 0.1) { c.beginPath(); circ(c, bx - br * 0.26, by - br * 0.3, br * 0.46); c.fill(); } }
  // leaf dabs catching the light
  c.fillStyle = mix(shade(base, 0.42), '#fff6a0', 0.2);
  for (const [bx, by, br] of blobs) {
    if (by > cy + r * 0.05) continue;
    for (let k = 0; k < 2; k++) { const a = -2.3 + R() * 1.2, d = br * (0.35 + R() * 0.3); c.beginPath(); ell(c, bx + Math.cos(a) * d, by + Math.sin(a) * d, br * 0.13, br * 0.08, a); c.fill(); }
  }
  c.restore();
};
W.pine = function (c, x, y, r, seed = 1) {
  c.save();
  c.fillStyle = 'rgba(15,40,12,0.22)'; c.beginPath(); ell(c, x + r * 0.22, y + r * 0.06, r * 0.9, r * 0.32); c.fill();
  c.beginPath(); rr(c, x - r * 0.12, y - r * 0.5, r * 0.24, r * 0.52, 2); c.lineWidth = Math.max(1.2, r * 0.08); c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.trunk; c.fill();
  const tiers = 3, dark = mix(PAL.leafD, '#1d4a52', 0.15);
  for (let i = 0; i < tiers; i++) {
    const ty = y - r * 0.35 - i * r * 0.62, tw = r * (1 - i * 0.22);
    const path = () => { c.beginPath(); c.moveTo(x - tw, ty); c.quadraticCurveTo(x, ty + r * 0.18, x + tw, ty); c.lineTo(x, ty - r * 1.05); c.closePath(); };
    path(); c.lineWidth = Math.max(1.2, r * 0.14); c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = dark; c.fill();
    c.save(); path(); c.clip();
    c.fillStyle = PAL.leaf; c.beginPath(); c.moveTo(x - tw, ty); c.lineTo(x, ty - r * 1.05); c.lineTo(x + tw * 0.1, ty); c.closePath(); c.fill();
    c.fillStyle = mix(PAL.leafL, '#e8f070', 0.12); c.beginPath(); c.moveTo(x - tw * 0.92, ty - r * 0.02); c.lineTo(x - r * 0.04, ty - r * 0.98); c.lineTo(x - tw * 0.45, ty - r * 0.1); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
};
W.bush = function (c, x, y, r, seed = 3) {
  const R = rng(seed * 31 + 5);
  const blobs = [[x - r * 0.45, y - r * 0.35, r * 0.55], [x + r * 0.45, y - r * 0.35, r * 0.55], [x, y - r * 0.6, r * 0.62]];
  c.fillStyle = 'rgba(15,40,12,0.24)'; c.beginPath(); ell(c, x + r * 0.15, y, r * 1.15, r * 0.36); c.fill();
  c.fillStyle = INK; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br + Math.max(1, r * 0.1)); c.fill(); }
  c.fillStyle = mix(PAL.leafD, '#1d4a52', 0.12); for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.fill(); }
  c.fillStyle = PAL.leaf; for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx - br * 0.15, by - br * 0.18, br * 0.72); c.fill(); }
  c.fillStyle = mix(PAL.leafL, '#e8f070', 0.12); for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx - br * 0.3, by - br * 0.34, br * 0.34); c.fill(); }
  if (R() < 0.6) { c.fillStyle = ['#ff8fb3', '#fff1a8', '#ffffff'][(R() * 3) | 0]; for (let i = 0; i < 4; i++) { c.beginPath(); circ(c, x + (R() - 0.5) * r * 1.4, y - r * (0.3 + R() * 0.6), Math.max(0.8, r * 0.08)); c.fill(); } }
};
W.rock = function (c, x, y, r, seed = 5) {
  c.fillStyle = 'rgba(15,20,10,0.26)'; c.beginPath(); ell(c, x + r * 0.2, y + r * 0.05, r * 1.15, r * 0.36); c.fill();
  const path = () => { c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x - r * 1.1, y - r * 0.8, x - r * 0.2, y - r * 0.95); c.quadraticCurveTo(x + r * 0.9, y - r, x + r, y); c.closePath(); };
  path(); c.lineWidth = Math.max(1, r * 0.14); c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.fillStyle = PAL.stone; c.fill();
  c.save(); path(); c.clip();
  c.fillStyle = 'rgba(40,44,60,0.22)'; c.beginPath(); c.moveTo(x + r * 0.15, y - r); c.quadraticCurveTo(x + r * 0.4, y - r * 0.4, x + r * 0.1, y + 1); c.lineTo(x + r * 1.2, y + 1); c.lineTo(x + r * 1.2, y - r); c.closePath(); c.fill();
  c.fillStyle = 'rgba(110,150,60,0.45)'; c.beginPath(); ell(c, x - r * 0.55, y - r * 0.08, r * 0.45, r * 0.16); c.fill();
  c.restore();
  c.fillStyle = PAL.stoneL; c.beginPath(); ell(c, x - r * 0.3, y - r * 0.62, r * 0.35, r * 0.18, -0.3); c.fill();
};

/* ---------- paving ---------- */
W.paveTile = function (c, x, y, T, cx, cy, seed = 1) {
  const v = hash2(cx, cy, seed);
  c.fillStyle = PAL.grout; c.fillRect(x, y, T, T);
  const ins = Math.max(1, T * 0.035);
  const STONES = ['#efdfbd', '#e8d2aa', '#f3e7c9', '#e2cfaa', '#ecdab6', '#e9d9c0'];
  const base = mix(STONES[Math.floor(v * STONES.length) % STONES.length], PAL.paveD, hash2(cy, cx, seed + 3) * 0.3);
  c.beginPath(); rr(c, x + ins, y + ins, T - ins * 2, T - ins * 2, T * 0.09);
  const g = c.createLinearGradient(x, y, x + T, y + T);
  g.addColorStop(0, shade(base, 0.12)); g.addColorStop(1, shade(base, -0.06));
  c.fillStyle = g; c.fill();
  // bevel
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = Math.max(1, T * 0.035);
  c.beginPath(); c.moveTo(x + ins * 2, y + T - ins * 2.4); c.lineTo(x + ins * 2, y + ins * 2); c.lineTo(x + T - ins * 2.4, y + ins * 2); c.stroke();
  c.strokeStyle = 'rgba(90,70,40,0.28)';
  c.beginPath(); c.moveTo(x + T - ins * 2, y + ins * 2.4); c.lineTo(x + T - ins * 2, y + T - ins * 2); c.lineTo(x + ins * 2.4, y + T - ins * 2); c.stroke();
  // speckles / cracks
  const R = rng(((cx * 73856093) ^ (cy * 19349663) ^ seed) >>> 0);
  c.fillStyle = 'rgba(120,95,60,0.22)';
  for (let i = 0; i < 4; i++) { c.beginPath(); circ(c, x + T * (0.15 + R() * 0.7), y + T * (0.15 + R() * 0.7), Math.max(0.5, T * (0.012 + R() * 0.02))); c.fill(); }
  if (R() < 0.18) {
    c.strokeStyle = 'rgba(110,85,50,0.35)'; c.lineWidth = Math.max(0.7, T * 0.02);
    const sx = x + T * (0.2 + R() * 0.3), sy = y + T * (0.2 + R() * 0.3);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + T * 0.15, sy + T * 0.1); c.lineTo(sx + T * 0.22, sy + T * 0.25); c.stroke();
  }
  if (R() < 0.22) { c.fillStyle = 'rgba(96,160,60,0.6)'; c.beginPath(); ell(c, x + ins * 1.4, y + T * (0.3 + R() * 0.4), T * 0.045, T * 0.12); c.fill(); c.fillStyle = 'rgba(150,210,90,0.6)'; c.beginPath(); ell(c, x + ins * 1.2, y + T * (0.3 + R() * 0.3), T * 0.025, T * 0.05); c.fill(); }
};

/* ---------- stone block (short barrier) ---------- */
const _blk = new Map();
W.blockSprite = function (T, h, nb, dpr = 1, seed = 0) {
  // nb: string 'nesw' flags, e.g. '1010'
  const key = T + '|' + h + '|' + nb + '|' + dpr + '|' + (seed % 4);
  if (_blk.has(key)) return _blk.get(key);
  const pad = Math.ceil(T * 0.1);
  const cv = mkCanvas((T + pad * 2) * dpr, (T + h + pad * 2) * dpr), c = cv.getContext('2d');
  c.scale(dpr, dpr); c.translate(pad, pad + h);
  const [n, e, s, w] = nb.split('').map((x) => x === '1');
  const x0 = w ? -1 : T * 0.04, x1 = e ? T + 1 : T * 0.96, y0 = n ? -h - 1 : -h + T * 0.04, y1 = T - h;
  const lw = Math.max(1.2, T * 0.045);
  // front face
  if (!s) {
    c.beginPath(); c.rect(x0, y1, x1 - x0, h);
    const g = c.createLinearGradient(0, y1, 0, y1 + h); g.addColorStop(0, PAL.stoneD); g.addColorStop(1, PAL.stoneDD);
    c.fillStyle = g; c.fill();
    // block joints on front
    c.strokeStyle = 'rgba(40,42,48,0.55)'; c.lineWidth = Math.max(0.8, T * 0.025);
    const R = rng(seed + 3);
    const j = T * (0.35 + R() * 0.3);
    c.beginPath(); c.moveTo(x0 + j, y1 + 1); c.lineTo(x0 + j, y1 + h); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x0, y1, x1 - x0, Math.max(1, h * 0.12));
  }
  // top face
  c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0);
  const g2 = c.createLinearGradient(0, y0, 0, y1); g2.addColorStop(0, PAL.stoneL); g2.addColorStop(1, PAL.stone);
  c.fillStyle = g2; c.fill();
  // stones pattern on top (two slabs)
  const R2 = rng(seed * 7 + 1);
  c.strokeStyle = 'rgba(70,72,80,0.45)'; c.lineWidth = Math.max(0.8, T * 0.028);
  const midY = y0 + (y1 - y0) * (0.45 + R2() * 0.1);
  c.beginPath(); c.moveTo(x0 + 2, midY); c.lineTo(x1 - 2, midY);
  const jx1 = x0 + (x1 - x0) * (0.3 + R2() * 0.4), jx2 = x0 + (x1 - x0) * (0.25 + R2() * 0.5);
  c.moveTo(jx1, y0 + 2); c.lineTo(jx1, midY); c.moveTo(jx2, midY); c.lineTo(jx2, y1 - 1); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.34)';
  c.fillRect(x0 + 2, y0 + 2, (x1 - x0) * 0.35, Math.max(1, T * 0.05));
  // cool shade on the lower half of the top face, moss creeping over the edges
  c.fillStyle = 'rgba(60,80,120,0.1)'; c.fillRect(x0, y0 + (y1 - y0) * 0.55, x1 - x0, (y1 - y0) * 0.45);
  const RM = rng(seed * 5 + 2);
  for (let i = 0; i < 3; i++) if (RM() < 0.55) { const mx = x0 + (x1 - x0) * (0.1 + RM() * 0.8), my = RM() < 0.5 ? y0 + T * 0.04 : y1 - T * 0.02; c.fillStyle = 'rgba(80,140,50,0.75)'; c.beginPath(); ell(c, mx, my, T * (0.07 + RM() * 0.06), T * 0.035, 0); c.fill(); c.fillStyle = 'rgba(150,205,90,0.7)'; c.beginPath(); ell(c, mx - T * 0.02, my - T * 0.012, T * 0.035, T * 0.018, 0); c.fill(); }
  // outline (only on exposed edges)
  c.strokeStyle = INK; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath();
  if (!n) { c.moveTo(x0, y0); c.lineTo(x1, y0); }
  if (!w) { c.moveTo(x0, y0); c.lineTo(x0, s ? y1 : y1 + h); }
  if (!e) { c.moveTo(x1, y0); c.lineTo(x1, s ? y1 : y1 + h); }
  if (!s) { c.moveTo(x0, y1 + h); c.lineTo(x1, y1 + h); c.moveTo(x0, y1); c.lineTo(x1, y1); }
  c.stroke();
  const out = { cv, pad, h, dpr };
  _blk.set(key, out);
  return out;
};
W.drawBlock = function (c, x, y, T, h, nb, dpr = 1, seed = 0) {
  const s = W.blockSprite(T, h, nb, dpr, seed);
  c.drawImage(s.cv, x - s.pad, y - s.pad - h, s.cv.width / dpr, s.cv.height / dpr);
};

/* ---------- pink turn marker (floor decal) ---------- */
W.turnMarker = function (c, cx, cy, T, dir) {
  // dir: 'up','down','left','right' = direction to go after this tile
  const a = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir] || 0;
  const s = T * 0.2;
  c.save(); c.translate(cx, cy);
  // a soft pink glow painted into the ground
  const gg = c.createRadialGradient(0, 0, 1, 0, 0, T * 0.5); gg.addColorStop(0, rgba(PAL.pink, 0.28)); gg.addColorStop(1, rgba(PAL.pink, 0)); c.fillStyle = gg; c.fillRect(-T / 2, -T / 2, T, T);
  c.rotate(a);
  // pink corner inlays
  c.fillStyle = rgba(PAL.pink, 0.9);
  const k = T * 0.4, q = T * 0.13;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    c.beginPath(); c.moveTo(sx * k, sy * k); c.lineTo(sx * (k - q), sy * k); c.lineTo(sx * k, sy * (k - q)); c.closePath(); c.fill();
  }
  // glossy chevron: drop shadow, ink rim, gradient fill, a highlight along the upper edge
  const chev = () => { c.beginPath(); c.moveTo(-s * 0.7, -s * 1.1); c.lineTo(s * 0.9, 0); c.lineTo(-s * 0.7, s * 1.1); c.lineTo(-s * 0.05, 0); c.closePath(); };
  c.save(); c.translate(s * 0.08, s * 0.14); chev(); c.fillStyle = 'rgba(80,20,50,0.3)'; c.fill(); c.restore();
  chev(); c.lineJoin = 'round'; c.lineWidth = Math.max(1.2, T * 0.05); c.strokeStyle = PAL.pinkD; c.stroke();
  const fg = c.createLinearGradient(0, -s * 1.1, 0, s * 1.1); fg.addColorStop(0, PAL.pinkL); fg.addColorStop(0.55, PAL.pink); fg.addColorStop(1, shade(PAL.pink, -0.12)); c.fillStyle = fg; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = Math.max(0.8, T * 0.028); c.lineCap = 'round';
  c.beginPath(); c.moveTo(-s * 0.46, -s * 0.86); c.lineTo(s * 0.6, -s * 0.06); c.stroke();
  c.restore();
};

/* ---------- multiplier gate ---------- */
W.gate = function (c, cx, cy, T, mult, t, o = {}) {
  // spans a corridor tile horizontally (for vertical travel). cy = ground line
  const col = mult >= 3 ? PAL.gate3 : PAL.gate2, colD = mult >= 3 ? PAL.gate3D : PAL.gate2D;
  const span = o.span || 1, hw = T * 0.5 * span, H = T * 0.95, pw = T * 0.13;
  const lw = Math.max(1.2, T * 0.04);
  c.save();
  // floor glow, added light
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.75 + 0.25 * Math.sin(t * 3);
  c.drawImage(AMB.glow(col), cx - T * 0.85 * span, cy - T * 0.36, T * 1.7 * span, T * 0.72);
  c.restore();
  // curtain
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.beginPath(); c.rect(cx - hw + pw * 0.5, cy - H, hw * 2 - pw, H);
  const cg = c.createLinearGradient(0, cy - H, 0, cy);
  const fl = o.flash || 0;
  cg.addColorStop(0, rgba(col, 0.15 + fl * 0.3)); cg.addColorStop(0.6, rgba(col, 0.32 + pulse * 0.1 + fl * 0.35)); cg.addColorStop(1, rgba(col, 0.55 + fl * 0.3));
  c.fillStyle = cg; c.fill();
  // shimmer lines
  c.save(); c.beginPath(); c.rect(cx - hw + pw * 0.5, cy - H, hw * 2 - pw, H); c.clip();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = Math.max(1, T * 0.03);
  for (let i = 0; i < 4; i++) {
    const yy = cy - ((t * T * 0.6 + i * H / 4) % H);
    c.globalAlpha = 0.25 + 0.5 * (1 - (cy - yy) / H);
    c.beginPath(); c.moveTo(cx - hw, yy); c.lineTo(cx + hw, yy); c.stroke();
  }
  // motes of light rising through the curtain
  c.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) { const k = (t * 0.6 + i / 5) % 1, mx = cx - hw * 0.7 + ((i * 0.37 + 0.1) % 1) * hw * 1.4 + Math.sin(t * 3 + i) * T * 0.04, my = cy - k * H; c.globalAlpha = Math.sin(k * Math.PI) * 0.9; c.beginPath(); circ(c, mx, my, Math.max(0.8, T * 0.028)); c.fill(); }
  c.globalAlpha = 1;
  c.restore();
  // posts
  for (const sx of [-1, 1]) {
    const px = cx + sx * (hw - pw * 0.2);
    c.beginPath(); rr(c, px - pw / 2, cy - H - T * 0.06, pw, H + T * 0.08, pw * 0.3);
    c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.stoneL; c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(px + pw * 0.1, cy - H - T * 0.04, pw * 0.38, H + T * 0.06);
    c.beginPath(); circ(c, px, cy - H - T * 0.1, pw * 0.62); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.gold; c.fill();
  }
  // plaque
  const bw = T * 0.78, bh = T * 0.42, by = cy - H - T * 0.24;
  c.beginPath(); rr(c, cx - bw / 2, by - bh / 2, bw, bh, bh * 0.28);
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
  const pg = c.createLinearGradient(0, by - bh / 2, 0, by + bh / 2); pg.addColorStop(0, shade(col, 0.1)); pg.addColorStop(1, colD);
  c.fillStyle = pg; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = Math.max(1, T * 0.025); c.beginPath(); rr(c, cx - bw / 2 + 2, by - bh / 2 + 2, bw - 4, bh - 4, bh * 0.22); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); rr(c, cx - bw / 2 + 3, by - bh / 2 + 3, bw - 6, bh * 0.36, bh * 0.18); c.fill();
  AMB.shine(c, () => { c.beginPath(); rr(c, cx - bw / 2, by - bh / 2, bw, bh, bh * 0.28); }, cx - bw / 2, by - bh / 2, bw, bh, t + cx * 0.01, 2.6, 0.55);
  text(c, '×' + mult, cx, by + T * 0.01, { size: T * 0.36, font: F.body, weight: 700, fill: '#fff', stroke: INK, strokeW: Math.max(2, T * 0.08) });
  c.restore();
};

W.gateV = function (c, cx, cy, T, mult, t, o = {}) {
  // gate whose plane runs north-south (units walk east-west through it)
  const col = mult >= 3 ? PAL.gate3 : PAL.gate2, colD = mult >= 3 ? PAL.gate3D : PAL.gate2D;
  const H = T * 0.95, pw = T * 0.13, lw = Math.max(1.2, T * 0.04), n = cy - T * 0.42, s2 = cy + T * 0.42, bw = T * 0.16;
  const fl = o.flash || 0, pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.save();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.75 + 0.25 * Math.sin(t * 3);
  c.drawImage(AMB.glow(col), cx - T * 0.55, cy - T * 0.6, T * 1.1, T * 1.2);
  c.restore();
  // curtain band (seen from the side)
  c.beginPath(); c.moveTo(cx - bw, n - H); c.lineTo(cx + bw, n - H + T * 0.06); c.lineTo(cx + bw, s2 + T * 0.02); c.lineTo(cx - bw, s2 - T * 0.04); c.closePath();
  const cg = c.createLinearGradient(0, n - H, 0, s2);
  cg.addColorStop(0, rgba(col, 0.2 + fl * 0.3)); cg.addColorStop(1, rgba(col, 0.55 + pulse * 0.1 + fl * 0.3));
  c.fillStyle = cg; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = Math.max(1, T * 0.03);
  for (let i = 0; i < 4; i++) { const yy = s2 - ((t * T * 0.6 + i * (s2 - n + H) / 4) % (s2 - n + H)); c.beginPath(); c.moveTo(cx - bw, yy); c.lineTo(cx + bw, yy + T * 0.03); c.stroke(); }
  for (const py of [n, s2]) {
    c.beginPath(); rr(c, cx - pw / 2, py - H - T * 0.06, pw, H + T * 0.08, pw * 0.3);
    c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.stoneL; c.fill();
    c.beginPath(); circ(c, cx, py - H - T * 0.1, pw * 0.62); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.gold; c.fill();
  }
  const bwp = T * 0.72, bh = T * 0.4, by = n - H - T * 0.26;
  c.beginPath(); rr(c, cx - bwp / 2, by - bh / 2, bwp, bh, bh * 0.28);
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
  const pg = c.createLinearGradient(0, by - bh / 2, 0, by + bh / 2); pg.addColorStop(0, shade(col, 0.1)); pg.addColorStop(1, colD);
  c.fillStyle = pg; c.fill();
  text(c, '×' + mult, cx, by + T * 0.01, { size: T * 0.34, font: F.body, weight: 700, fill: '#fff', stroke: INK, strokeW: Math.max(2, T * 0.08) });
  c.restore();
};

/* ---------- pickups ---------- */
W.pickup = function (c, cx, cy, T, kind, t) {
  const col = kind === 'armor' ? PAL.armor : kind === 'speed' ? PAL.speed : PAL.attack;
  const bob = Math.sin(t * 3 + cx * 0.1) * T * 0.06;
  c.save();
  // floor ring
  const rg = c.createRadialGradient(cx, cy, 1, cx, cy, T * 0.46);
  rg.addColorStop(0, rgba(col, 0.55)); rg.addColorStop(0.7, rgba(col, 0.2)); rg.addColorStop(1, rgba(col, 0));
  c.fillStyle = rg; c.beginPath(); ell(c, cx, cy, T * 0.46, T * 0.2); c.fill();
  c.strokeStyle = rgba(shade(col, 0.3), 0.8); c.lineWidth = Math.max(1, T * 0.03);
  c.beginPath(); ell(c, cx, cy, T * 0.3, T * 0.12); c.stroke();
  // shadow
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); ell(c, cx, cy, T * 0.18, T * 0.07); c.fill();
  // sparkles
  for (let i = 0; i < 3; i++) {
    const a = t * 2 + i * 2.1, rr2 = T * 0.3;
    const sx = cx + Math.cos(a) * rr2, sy = cy - T * 0.4 + Math.sin(a) * T * 0.14;
    const s = T * 0.05 * (0.6 + 0.4 * Math.sin(t * 5 + i));
    c.fillStyle = '#fffbe8'; c.beginPath(); c.moveTo(sx, sy - s * 2); c.lineTo(sx + s * 0.6, sy); c.lineTo(sx, sy + s * 2); c.lineTo(sx - s * 0.6, sy); c.closePath(); c.fill();
  }
  const iy = cy - T * 0.42 + bob, S = T * 0.56;
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.55 + 0.3 * Math.sin(t * 4 + cx);
  c.drawImage(AMB.glow(shade(col, 0.25)), cx - S * 0.95, iy - S * 0.95, S * 1.9, S * 1.9);
  c.restore();
  if (kind === 'armor') ICON.shield(c, cx, iy, S);
  else if (kind === 'speed') ICON.boot(c, cx + S * 0.08, iy + S * 0.12, S * 0.95);
  else ICON.fist(c, cx, iy + S * 0.02, S * 0.92);
  c.restore();
};

/* ---------- assembly house ---------- */
W.house = function (c, cx, by, w, type, team = 'blue', t = 0, count = null, o = {}) {
  // cx: center, by: ground line (door threshold), w: width
  const tm = TEAMS[team];
  const h = w * 0.62, lw = Math.max(1.2, w * 0.022);
  const x0 = cx - w / 2;
  c.save();
  c.lineJoin = 'round';
  c.fillStyle = 'rgba(20,14,8,0.28)'; c.beginPath(); ell(c, cx + w * 0.04, by + w * 0.02, w * 0.56, w * 0.1); c.fill();
  // walls
  const wy = by - h;
  c.beginPath(); c.rect(x0 + w * 0.06, wy, w * 0.88, h);
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#efe0bf'; c.fill();
  // stone base
  c.fillStyle = PAL.stone; c.fillRect(x0 + w * 0.06, by - h * 0.2, w * 0.88, h * 0.2);
  c.strokeStyle = 'rgba(60,60,70,0.5)'; c.lineWidth = Math.max(0.8, w * 0.012);
  c.beginPath(); for (let i = 1; i < 5; i++) { const xx = x0 + w * 0.06 + (w * 0.88 * i) / 5; c.moveTo(xx, by - h * 0.2); c.lineTo(xx, by); } c.stroke();
  // timber beams
  c.strokeStyle = PAL.woodD; c.lineWidth = Math.max(1.4, w * 0.04);
  c.beginPath();
  c.moveTo(x0 + w * 0.06, wy + h * 0.45); c.lineTo(x0 + w * 0.94, wy + h * 0.45);
  c.moveTo(x0 + w * 0.3, wy); c.lineTo(x0 + w * 0.3, by - h * 0.2);
  c.moveTo(x0 + w * 0.7, wy); c.lineTo(x0 + w * 0.7, by - h * 0.2);
  c.moveTo(x0 + w * 0.06, wy); c.lineTo(x0 + w * 0.3, wy + h * 0.45);
  c.moveTo(x0 + w * 0.94, wy); c.lineTo(x0 + w * 0.7, wy + h * 0.45);
  c.stroke();
  // door (open, dark)
  const dw = w * 0.3, dh = h * 0.62;
  c.beginPath(); c.moveTo(cx - dw / 2, by); c.lineTo(cx - dw / 2, by - dh + dw / 2); c.arc(cx, by - dh + dw / 2, dw / 2, Math.PI, 0); c.lineTo(cx + dw / 2, by); c.closePath();
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
  const dg = c.createLinearGradient(0, by - dh, 0, by); dg.addColorStop(0, '#2a1a10'); dg.addColorStop(1, '#4a3020');
  c.fillStyle = dg; c.fill();
  c.fillStyle = 'rgba(255,200,120,0.22)'; c.beginPath(); ell(c, cx, by - dh * 0.2, dw * 0.35, dh * 0.2); c.fill();
  // roof
  const ry = wy + h * 0.04, rh = w * 0.46;
  const roof = () => { c.beginPath(); c.moveTo(x0 - w * 0.04, ry); c.lineTo(cx, ry - rh); c.lineTo(x0 + w * 1.04, ry); c.closePath(); };
  roof(); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
  const rg = c.createLinearGradient(0, ry - rh, 0, ry); rg.addColorStop(0, tm.light); rg.addColorStop(1, tm.dark);
  c.fillStyle = rg; c.fill();
  c.save(); roof(); c.clip();
  c.strokeStyle = rgba(tm.deep, 0.45); c.lineWidth = Math.max(0.8, w * 0.015);
  for (let i = 1; i < 6; i++) { const yy = ry - rh + (rh * i) / 6; c.beginPath(); c.moveTo(x0 - w * 0.1, yy); c.lineTo(x0 + w * 1.1, yy); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.moveTo(cx, ry - rh); c.lineTo(x0 - w * 0.04, ry); c.lineTo(x0 + w * 0.1, ry); c.closePath(); c.fill();
  c.restore();
  // chimney on the left slope
  const chx = cx - w * 0.3, chw = w * 0.1, cht = ry - rh * 0.52;
  c.beginPath(); c.rect(chx - chw / 2, cht, chw, ry - rh * 0.2 - cht); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#b86a4a'; c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(chx + chw * 0.12, cht, chw * 0.38, ry - rh * 0.2 - cht);
  c.beginPath(); c.rect(chx - chw * 0.7, cht - w * 0.035, chw * 1.4, w * 0.045); c.lineWidth = lw * 1.6; c.stroke(); c.fillStyle = '#8f4c34'; c.fill();
  // banner with crew icon
  const bw = w * 0.36, bh = w * 0.42, bx = cx, bTop = ry - rh * 0.58;
  c.beginPath(); c.moveTo(bx - bw / 2, bTop); c.lineTo(bx + bw / 2, bTop); c.lineTo(bx + bw / 2, bTop + bh); c.lineTo(bx, bTop + bh * 0.8); c.lineTo(bx - bw / 2, bTop + bh); c.closePath();
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = tm.main; c.fill();
  c.fillStyle = PAL.gold; c.fillRect(bx - bw / 2 + lw, bTop + lw, bw - lw * 2, Math.max(1.5, w * 0.03));
  c.beginPath(); c.moveTo(bx - bw / 2 - w * 0.03, bTop); c.lineTo(bx + bw / 2 + w * 0.03, bTop); c.lineWidth = Math.max(1.5, w * 0.035); c.strokeStyle = PAL.woodD; c.stroke();
  ICON.crew(c, bx, bTop + bh * 0.42, bw * 0.78, o.icon || type);
  // count badge
  if (count != null) {
    const r = w * 0.17, bx2 = x0 + w * 0.94, by2 = wy + h * 0.1;
    c.beginPath(); circ(c, bx2, by2, r); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
    const cg = c.createLinearGradient(0, by2 - r, 0, by2 + r); cg.addColorStop(0, '#fff6d8'); cg.addColorStop(1, PAL.parchD);
    c.fillStyle = cg; c.fill();
    text(c, String(count), bx2, by2 + r * 0.06, { size: r * 1.15, font: F.body, weight: 700, fill: INK, maxW: r * 1.7 });
  }
  if (o.glow) {
    c.globalCompositeOperation = 'lighter';
    const gg = c.createRadialGradient(cx, by - dh * 0.4, 1, cx, by - dh * 0.4, w * 0.5);
    gg.addColorStop(0, `rgba(255,220,120,${0.5 * o.glow})`); gg.addColorStop(1, 'rgba(255,220,120,0)');
    c.fillStyle = gg; c.fillRect(cx - w * 0.6, by - h, w * 1.2, h);
  }
  c.restore();
};

/* ---------- entrance archway ---------- */
W.entrance = function (c, cx, by, w, t = 0, team = 'blue') {
  const tm = TEAMS[team];
  const pw = w * 0.16, H = w * 0.62, lw = Math.max(1.2, w * 0.022);
  c.save(); c.lineJoin = 'round';
  // towers
  for (const sx of [-1, 1]) {
    const px = cx + sx * (w / 2 - pw / 2);
    c.beginPath(); c.rect(px - pw / 2, by - H, pw, H);
    c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke();
    const g = c.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0); g.addColorStop(0, PAL.stoneL); g.addColorStop(1, PAL.stoneD);
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(50,50,60,0.45)'; c.lineWidth = Math.max(0.8, w * 0.01);
    c.beginPath(); for (let i = 1; i < 5; i++) { const yy = by - (H * i) / 5; c.moveTo(px - pw / 2, yy); c.lineTo(px + pw / 2, yy); } c.stroke();
    // crenels
    for (let k = 0; k < 2; k++) { c.beginPath(); c.rect(px - pw / 2 + k * pw * 0.58, by - H - pw * 0.3, pw * 0.42, pw * 0.32); c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.stoneL; c.fill(); }
    // banner
    const bw = pw * 0.8, bh = H * 0.5, bt = by - H * 0.86;
    const wave = Math.sin(t * 3 + sx) * bw * 0.06;
    c.beginPath(); c.moveTo(px - bw / 2, bt); c.lineTo(px + bw / 2, bt); c.lineTo(px + bw / 2 + wave, bt + bh); c.lineTo(px + wave, bt + bh * 0.82); c.lineTo(px - bw / 2 + wave, bt + bh); c.closePath();
    c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = tm.main; c.fill();
    c.fillStyle = PAL.gold; c.beginPath(); circ(c, px + wave * 0.5, bt + bh * 0.4, bw * 0.2); c.fill();
  }
  // lintel arch
  const ax0 = cx - w / 2 + pw, ax1 = cx + w / 2 - pw, ay = by - H * 0.78;
  c.beginPath(); c.moveTo(ax0, ay - w * 0.1); c.quadraticCurveTo(cx, ay - w * 0.28, ax1, ay - w * 0.1); c.lineTo(ax1, ay + w * 0.02); c.quadraticCurveTo(cx, ay - w * 0.16, ax0, ay + w * 0.02); c.closePath();
  c.lineWidth = lw * 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.stone; c.fill();
  text(c, 'MUSTER', cx, ay - w * 0.1, { size: w * 0.07, font: F.head, weight: 800, fill: '#fff8e6', stroke: INK, strokeW: Math.max(1.5, w * 0.018), letter: 1 });
  c.restore();
};

/* ---------- board renderer ---------- */
// map: { cols, rows, grid:[strings], T, ox, oy }  grid chars: '#' block, '.' floor, 'T' tree, ',' grass, 'b' bush
W.renderFloor = function (c, map, o = {}) {
  const { cols, rows, grid, T } = map, ox = map.ox || 0, oy = map.oy || 0;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const ch = grid[r][q];
    if (ch !== ',' && ch !== 'T' && ch !== 'b') W.paveTile(c, ox + q * T, oy + r * T, T, q, r, map.seed || 1);
  }
  // where paving meets grass: a little shade on the stone, then grass growing over the edge
  W.pathEdges(c, map, (r, q) => ',Tb'.includes(map.grid[r][q]), { edgeGrass: !!o.edgeGrass, seed: map.seed || 1 });
  (map.markers || []).forEach((m) => W.turnMarker(c, ox + (m.c + 0.5) * T, oy + (m.r + 0.5) * T, T, m.dir));
};
// shade and grass fringe along every floor edge that borders grass. isGrass(r, q) for cells inside the grid
W.pathEdges = function (g, map, isGrass, o = {}) {
  const { rows, cols, grid, T } = map, ox = map.ox || 0, oy = map.oy || 0, edges = [];
  const G = (r, q) => (r < 0 || q < 0 || r >= rows || q >= cols ? !!o.edgeGrass : isGrass(r, q));
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    if (isGrass(r, q) || (o.skip && o.skip(r, q))) continue;
    const x = ox + q * T, y = oy + r * T;
    if (G(r - 1, q)) edges.push([x, y, x + T, y, 0, 1]);
    if (G(r + 1, q)) edges.push([x, y + T, x + T, y + T, 0, -1]);
    if (G(r, q - 1)) edges.push([x, y, x, y + T, 1, 0]);
    if (G(r, q + 1)) edges.push([x + T, y, x + T, y + T, -1, 0]);
  }
  g.save();
  for (const [x0, y0, x1, y1, nx, ny] of edges) {
    const d = T * 0.16, lg = g.createLinearGradient(x0, y0, x0 + nx * d, y0 + ny * d);
    lg.addColorStop(0, o.shade || 'rgba(70,45,20,0.26)'); lg.addColorStop(1, 'rgba(70,45,20,0)');
    g.fillStyle = lg; g.fillRect(Math.min(x0, x0 + nx * d), Math.min(y0, y0 + ny * d), Math.abs(x1 - x0) + Math.abs(nx * d), Math.abs(y1 - y0) + Math.abs(ny * d));
  }
  g.restore();
  if (o.fringe !== false) edges.forEach(([x0, y0, x1, y1, nx, ny], i) => W.grassFringe(g, x0, y0, x1, y1, nx, ny, (o.seed || 1) * 131 + i, { h: T * 0.15, step: T * 0.12, shadow: 'rgba(40,60,20,0.18)' }));
};
W.blockNb = function (map, r, q) {
  const { rows, cols, grid } = map;
  const isB = (rr2, qq) => rr2 >= 0 && qq >= 0 && rr2 < rows && qq < cols && grid[rr2][qq] === '#';
  return (isB(r - 1, q) ? '1' : '0') + (isB(r, q + 1) ? '1' : '0') + (isB(r + 1, q) ? '1' : '0') + (isB(r, q - 1) ? '1' : '0');
};

/* ===== src/art/31-ambient.js ===== */
/* Roll to War: ambient life and light effects, drawn live every frame but kept cheap (cached soft sprites, a handful of shapes).
   Cloud shadows drifting over the land, butterflies, passing birds, fireflies, glints on water, chimney smoke,
   victory confetti, sparkle bursts and the shine that sweeps across the big buttons. */
const AMB = (RTW.amb = {});
const _ambC = {};
function ambSprite(key, w, h, fn, pr = 1) {
  let cv = _ambC[key];
  if (!cv) { cv = mkCanvas(w * pr, h * pr); const g = cv.getContext('2d'); g.scale(pr, pr); fn(g); _ambC[key] = cv; }
  return cv;
}
// a soft, lumpy cloud shadow (low resolution on purpose: it is meant to be blurry)
function cloudShadowSprite() {
  return ambSprite('cloudsh', 160, 100, (g) => {
    const R = rng(5);
    for (let i = 0; i < 7; i++) {
      const x = 30 + R() * 100, y = 28 + R() * 44, r = 22 + R() * 22, rg = g.createRadialGradient(x, y, 1, x, y, r);
      rg.addColorStop(0, 'rgba(10,30,40,0.55)'); rg.addColorStop(0.6, 'rgba(10,30,40,0.3)'); rg.addColorStop(1, 'rgba(10,30,40,0)');
      g.fillStyle = rg; g.beginPath(); ell(g, x, y, r * 1.3, r, 0); g.fill();
    }
  });
}
// big cloud shadows sliding slowly across an area (x, y, w, h); a = strength
AMB.cloudShadows = function (c, x, y, w, h, t, a = 1, n = 3) {
  const cv = cloudShadowSprite();
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let i = 0; i < n; i++) {
    const sp = 7 + i * 2.3, cw = 260 + (i % 2) * 90, ch = cw * 0.62, span = w + cw * 1.4;
    const px = x - cw * 0.7 + ((t * sp + i * span / n + i * 97) % span), py = y + ((i * 0.37 + 0.12) % 1) * (h - ch * 0.3) - ch * 0.3 + Math.sin(t * 0.05 + i) * 20;
    c.globalAlpha = 0.16 * a; c.drawImage(cv, px, py, cw, ch);
  }
  c.restore();
};
// butterflies fluttering around anchor points [[x, y], ...]
const BFLY = [['#ffd84a', '#e08a12'], ['#ffffff', '#b8c4d0'], ['#ff9a3c', '#b8451a'], ['#8fc8ff', '#2f6fd0'], ['#ffb3d9', '#d0508f']];
AMB.butterflies = function (c, spots, t) {
  c.save();
  spots.forEach(([ax, ay], i) => {
    const ph = i * 2.7, x = ax + Math.sin(t * 0.61 + ph) * 22 + Math.sin(t * 1.7 + ph * 2) * 6, y = ay + Math.sin(t * 0.93 + ph) * 12 - 10 + Math.cos(t * 2.3 + ph) * 3;
    const flap = 0.25 + 0.75 * Math.abs(Math.sin(t * 13 + ph)), dir = Math.cos(t * 0.61 + ph) >= 0 ? 1 : -1, [col, edge] = BFLY[i % BFLY.length];
    c.fillStyle = 'rgba(20,40,10,0.18)'; c.beginPath(); ell(c, x + 4, y + 14, 2.4 * flap + 0.8, 1, 0); c.fill();
    c.save(); c.translate(x, y); c.scale(dir, 1);
    for (const s of [-1, 1]) {
      c.fillStyle = edge; c.beginPath(); ell(c, s * 2.6 * flap, -1.2, 2.9 * flap + 0.3, 2.3, s * 0.3); c.fill();
      c.fillStyle = col; c.beginPath(); ell(c, s * 2.3 * flap, -1.4, 2.2 * flap + 0.25, 1.7, s * 0.3); c.fill();
      c.fillStyle = edge; c.beginPath(); ell(c, s * 1.7 * flap, 1.4, 1.6 * flap + 0.3, 1.3, -s * 0.4); c.fill();
    }
    c.fillStyle = '#3a2a1a'; c.beginPath(); ell(c, 0, 0, 0.6, 2.2, 0); c.fill();
    c.restore();
  });
  c.restore();
};
// a small flock crossing the sky every so often (period seconds); y = height of the flight line
AMB.birds = function (c, x, y, w, t, seed = 1, o = {}) {
  const period = o.period || 16, k = ((t + seed * 3.7) % period) / period, dur = o.dur || 0.45;
  if (k > dur) return;
  const u = k / dur, dir = seed % 2 ? 1 : -1, n = o.n || 5, col = o.col || 'rgba(40,30,25,0.8)';
  c.save(); c.strokeStyle = col; c.lineWidth = o.lw || 1.6; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
    const bx = x + (dir > 0 ? -40 + u * (w + 80) : w + 40 - u * (w + 80)) - dir * row * 12, by = y + side * row * 7 + Math.sin(t * 2 + i) * 2;
    const f = Math.sin(t * 11 + i * 1.3), s = (o.s || 1) * (1 - row * 0.06), wy = -3.2 * f * s;
    c.beginPath(); c.moveTo(bx - 5 * s, by + wy); c.quadraticCurveTo(bx - 2 * s, by - 1.5 * s + wy * 0.3, bx, by); c.quadraticCurveTo(bx + 2 * s, by - 1.5 * s + wy * 0.3, bx + 5 * s, by + wy); c.stroke();
  }
  c.restore();
};
// fireflies for night scenes
AMB.fireflies = function (c, x, y, w, h, t, n = 14, seed = 3) {
  const glow = ambSprite('ffly', 24, 24, (g) => { const rg = g.createRadialGradient(12, 12, 0.5, 12, 12, 12); rg.addColorStop(0, 'rgba(255,255,200,1)'); rg.addColorStop(0.25, 'rgba(230,255,120,0.7)'); rg.addColorStop(1, 'rgba(200,255,80,0)'); g.fillStyle = rg; g.fillRect(0, 0, 24, 24); }, 2);
  const R = rng(seed);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const bx = x + R() * w, by = y + R() * h, ph = R() * 10, px = bx + Math.sin(t * 0.4 + ph) * 16, py = by + Math.sin(t * 0.55 + ph * 1.3) * 10;
    const a = Math.max(0, Math.sin(t * 1.6 + ph)) ** 2; if (a < 0.02) continue;
    c.globalAlpha = a; c.drawImage(glow, px - 8, py - 8, 16, 16);
  }
  c.restore();
};
// short-lived sparkles on water (each lives about a second at a pseudo-random spot)
AMB.glints = function (c, x, y, w, h, t, n = 10, seed = 1) {
  c.save(); c.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) {
    const life = 1.3, cyc = Math.floor((t + i * life / n) / life), k = ((t + i * life / n) % life) / life, r = rng(cyc * 131 + i * 17 + seed);
    const px = x + r() * w, py = y + r() * h, a = Math.sin(k * Math.PI), s = 1.2 + r() * 1.8;
    c.globalAlpha = a * 0.85; c.beginPath(); c.moveTo(px - s * 2.2, py); c.lineTo(px, py - s * 0.5); c.lineTo(px + s * 2.2, py); c.lineTo(px, py + s * 0.5); c.closePath(); c.fill();
    c.globalAlpha = a * 0.6; c.beginPath(); c.moveTo(px, py - s * 1.3); c.lineTo(px + s * 0.35, py); c.lineTo(px, py + s * 1.3); c.lineTo(px - s * 0.35, py); c.closePath(); c.fill();
  }
  c.restore();
};
// chimney smoke: soft puffs rising and drifting with the wind
AMB.smoke = function (c, x, y, t, s = 1, n = 5, seed = 0) {
  c.save();
  for (let i = 0; i < n; i++) {
    const k = ((t * 0.28 + i / n + seed * 0.13) % 1), px = x + (Math.sin(k * 4 + seed + i) * 3 + k * 16) * s, py = y - k * 34 * s, r = (2.6 + k * 7) * s, a = (1 - k) * (k < 0.12 ? k / 0.12 : 1);
    c.globalAlpha = 0.55 * a; c.fillStyle = '#ece6dc'; c.beginPath(); circ(c, px, py, r); c.fill();
    c.globalAlpha = 0.35 * a; c.fillStyle = '#b8b0a4'; c.beginPath(); circ(c, px + r * 0.25, py + r * 0.25, r * 0.7); c.fill();
  }
  c.restore();
};
// a burst of little four-point stars around (x, y); k = 0..1 through the burst
AMB.sparkBurst = function (c, x, y, r, k, n = 8, col = '#fff6c8', seed = 1) {
  if (k <= 0 || k >= 1) return;
  const R = rng(seed);
  c.save(); c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + R() * 0.5, d = r * (0.35 + easeOut(k) * (0.75 + R() * 0.4)), s = (2 + R() * 2.5) * (1 - k);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    c.globalAlpha = 1 - k * k; c.beginPath(); c.moveTo(px, py - s * 2); c.lineTo(px + s * 0.5, py); c.lineTo(px, py + s * 2); c.lineTo(px - s * 0.5, py); c.closePath(); c.moveTo(px - s * 2, py); c.lineTo(px, py - s * 0.5); c.lineTo(px + s * 2, py); c.lineTo(px, py + s * 0.5); c.closePath(); c.fill();
  }
  c.restore();
};
// victory confetti falling over the whole screen (t = seconds since the win)
const CONF = ['#f2be4b', '#3b7df2', '#e2473b', '#2ea862', '#ffffff', '#b36cff', '#ff8fb3'];
AMB.confetti = function (c, Wd, Ht, t, n = 60, seed = 9) {
  if (t < 0) return;
  const R = rng(seed);
  c.save();
  for (let i = 0; i < n; i++) {
    const x0 = R() * Wd, delay = R() * 1.6, sp = 90 + R() * 90, sw = R() * 6, sz = 3 + R() * 3.5, col = CONF[i % CONF.length], sp2 = 3 + R() * 5;
    const tt = t - delay; if (tt < 0) continue;
    const y = -20 + ((tt * sp) % (Ht + 40)), x = x0 + Math.sin(tt * 1.6 + sw) * 18, rot = tt * sp2 + sw, flip = Math.cos(tt * 7 + sw);
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, flip);
    c.fillStyle = col; c.globalAlpha = Math.min(1, tt * 3) * 0.95; c.fillRect(-sz / 2, -sz * 0.3, sz, sz * 0.6);
    c.restore();
  }
  c.restore();
};
// a glossy shine that sweeps across a shape now and then (pathFn builds the clip path); period in seconds
AMB.shine = function (c, pathFn, x, y, w, h, t, period = 3.2, a = 0.45) {
  const k = (t % period) / period * 2.2 - 0.6; if (k < -0.3 || k > 1.3) return;
  c.save(); pathFn(); c.clip();
  const sx = x + k * (w + h), g = c.createLinearGradient(sx - h, y, sx, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(sx - h * 0.9, y + h); c.lineTo(sx - h * 0.3, y); c.lineTo(sx + h * 0.3, y); c.lineTo(sx - h * 0.3, y + h); c.closePath(); c.fill();
  c.restore();
};
// soft round glow sprite (for gates, pickups, torches); draw with 'lighter'
AMB.glow = function (col) {
  return ambSprite('glow' + col, 64, 64, (g) => { const rg = g.createRadialGradient(32, 32, 1, 32, 32, 32); rg.addColorStop(0, rgba(col, 0.9)); rg.addColorStop(0.4, rgba(col, 0.35)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.fillRect(0, 0, 64, 64); }, 1);
};

/* ===== src/art/31b-winter.js ===== */
/* Roll to War: winter for the Wars of the Roses (Mortimer's Cross at Candlemas, Towton in a snowstorm):
   a snowfield tile, trampled lanes, snowy pines and bare trees, a winter maze theme and falling snow. */

// seamless snow (or trampled slush for the lanes), in the same manner as the grass tile
function snowTile(g, S, slush) {
  const R = rng(slush ? 61 : 57);
  const wrap = (x, y, rad, fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const X = x + ox, Y = y + oy; if (X + rad < 0 || Y + rad < 0 || X - rad > S || Y - rad > S) continue; fn(X, Y); } };
  g.fillStyle = slush ? '#cfc8bd' : '#eaf0f6'; g.fillRect(0, 0, S, S);
  const patches = slush ? [['#b9aa92', 0.5], ['#e8edf2', 0.55], ['#a8987e', 0.35], ['#dfe5ec', 0.45]] : [['#ffffff', 0.7], ['#d6e0ec', 0.45], ['#f7fbff', 0.6], ['#c9d6e6', 0.3]];
  for (let i = 0; i < 18; i++) { const x = R() * S, y = R() * S, rad = 22 + R() * 46, [col, a] = patches[i % patches.length]; wrap(x, y, rad, (X, Y) => { const rg = g.createRadialGradient(X, Y, 1, X, Y, rad); rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0)); g.fillStyle = rg; g.beginPath(); ell(g, X, Y, rad, rad * 0.75); g.fill(); }); }
  if (slush) {
    // cart ruts and footprints pressed into the snow
    for (let i = 0; i < 16; i++) { const x = R() * S, y = R() * S, L = 18 + R() * 30; wrap(x, y, L, (X, Y) => { g.strokeStyle = 'rgba(110,90,60,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + L / 2, Y + 3, X + L, Y); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y - 2); g.quadraticCurveTo(X + L / 2, Y + 1, X + L, Y - 2); g.stroke(); }); }
    for (let i = 0; i < 40; i++) { const x = R() * S, y = R() * S; wrap(x, y, 3, (X, Y) => { g.fillStyle = 'rgba(120,100,70,0.3)'; g.beginPath(); ell(g, X, Y, 1.6, 2.4, 0.3); g.fill(); }); }
  } else {
    // sparkles and a few dry grass tips poking through
    for (let i = 0; i < 160; i++) { const x = R() * S, y = R() * S, r = 0.5 + R() * 0.9; wrap(x, y, 2, (X, Y) => { g.fillStyle = R() < 0.5 ? '#ffffff' : '#c3d2e4'; g.globalAlpha = 0.5 + R() * 0.5; g.beginPath(); circ(g, X, Y, r); g.fill(); }); }
    g.globalAlpha = 1;
    for (let i = 0; i < 18; i++) { const x = R() * S, y = R() * S; wrap(x, y, 8, (X, Y) => { g.strokeStyle = 'rgba(110,120,70,0.55)'; g.lineWidth = 1; g.lineCap = 'round'; for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(X + j * 1.6, Y); g.lineTo(X + j * 1.6 + (j - 1) * 1.4, Y - 4 - j); g.stroke(); } }); }
  }
  g.globalAlpha = 1;
}
// an evergreen weighed down with snow
function snowPine(c, x, y, r, seed = 1) {
  c.save();
  c.fillStyle = 'rgba(60,80,120,0.2)'; c.beginPath(); ell(c, x + r * 0.22, y + r * 0.06, r * 0.9, r * 0.32); c.fill();
  c.beginPath(); rr(c, x - r * 0.12, y - r * 0.5, r * 0.24, r * 0.52, 2); c.lineWidth = Math.max(1.2, r * 0.08); c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.trunk; c.fill();
  for (let i = 0; i < 3; i++) {
    const ty = y - r * 0.35 - i * r * 0.62, tw = r * (1 - i * 0.22);
    const path = () => { c.beginPath(); c.moveTo(x - tw, ty); c.quadraticCurveTo(x, ty + r * 0.18, x + tw, ty); c.lineTo(x, ty - r * 1.05); c.closePath(); };
    path(); c.lineWidth = Math.max(1.2, r * 0.14); c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.fillStyle = '#2e5a4a'; c.fill();
    c.save(); path(); c.clip();
    c.fillStyle = '#3f7a5c'; c.beginPath(); c.moveTo(x - tw, ty); c.lineTo(x, ty - r * 1.05); c.lineTo(x + tw * 0.1, ty); c.closePath(); c.fill();
    // snow lying on the tier
    c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(x - tw * 0.95, ty - r * 0.02); c.quadraticCurveTo(x - tw * 0.4, ty - r * 0.3, x, ty - r * 1.05); c.quadraticCurveTo(x + tw * 0.3, ty - r * 0.4, x + tw * 0.9, ty - r * 0.06); c.quadraticCurveTo(x + tw * 0.4, ty - r * 0.22, x, ty - r * 0.5); c.quadraticCurveTo(x - tw * 0.4, ty - r * 0.12, x - tw * 0.95, ty - r * 0.02); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
}
// a leafless oak with a little snow in its forks
function bareTree(c, x, y, r, seed = 1) {
  const R = rng(seed * 311 + 7);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = 'rgba(60,80,120,0.18)'; c.beginPath(); ell(c, x + r * 0.25, y + r * 0.06, r * 0.9, r * 0.3); c.fill();
  const br = [];
  const grow = (x0, y0, a, len, w, d) => { const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; br.push([x0, y0, x1, y1, w]); if (d < 3) { grow(x1, y1, a - 0.45 - R() * 0.2, len * 0.72, w * 0.62, d + 1); grow(x1, y1, a + 0.4 + R() * 0.25, len * 0.68, w * 0.6, d + 1); } };
  grow(x, y, -Math.PI / 2 + (R() - 0.5) * 0.1, r * 0.9, r * 0.24, 0);
  for (const [x0, y0, x1, y1, w] of br) { c.strokeStyle = INK; c.lineWidth = w + Math.max(1.4, r * 0.08); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  for (const [x0, y0, x1, y1, w] of br) { c.strokeStyle = '#5a4030'; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  c.strokeStyle = 'rgba(245,250,255,0.9)'; for (const [x0, y0, x1, y1, w] of br) if (w > r * 0.05) { c.lineWidth = w * 0.35; c.beginPath(); c.moveTo(x0 - w * 0.2, y0 - w * 0.3); c.lineTo(lerp(x0, x1, 0.6) - w * 0.2, lerp(y0, y1, 0.6) - w * 0.3); c.stroke(); }
  c.restore();
}
RTW.snowPine = snowPine; RTW.bareTree = bareTree;
// snow falling across a rectangle; wind > 0 drifts it to the right
RTW.snowfall = function (c, x, y, w, h, t, n = 60, wind = 0.4, rise = false) {
  c.save(); c.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) {
    const sp = 34 + (i % 5) * 12, yy = rise ? y + h - (((i * 71.3) + t * sp) % h) : y + (((i * 71.3) + t * sp) % h);
    const xx = x + ((((i * 53.7) + t * sp * wind + Math.sin(t * 1.3 + i) * 8) % (w + 20)) + w + 20) % (w + 20) - 10;
    c.globalAlpha = 0.5 + (i % 4) * 0.12; c.beginPath(); circ(c, xx, yy, 0.9 + (i % 3) * 0.55); c.fill();
  }
  c.restore();
};

/* ---------- the winter maze theme ---------- */
THEMES.winter = {
  name: 'Winter fields', grass: 'snow',
  floor(c, x, y, T) { c.fillStyle = W.grassPattern(c, 1, 'slush'); c.fillRect(x, y, T, T); },
  block(c, x, y, T, h, nb, dpr, seed) {
    // a hedgerow of dark holly and bare thorn under a coat of snow
    const [n, e, s, w] = nb.split('').map((k) => k === '1');
    const R = rng(seed * 13 + 7);
    const x0 = w ? x - 1 : x + T * 0.06, x1 = e ? x + T + 1 : x + T * 0.94, y0 = n ? y - 1 : y + T * 0.08, y1 = s ? y + T + 1 : y + T * 0.92;
    c.save();
    c.fillStyle = 'rgba(60,80,120,0.25)'; c.fillRect(x0, y1 - T * 0.05, x1 - x0, T * 0.12);
    c.beginPath(); rr(c, x0, y0 - h * 0.6, x1 - x0, y1 - y0 + h * 0.2, T * 0.18); c.fillStyle = '#23443a'; c.fill();
    const blobs = [];
    for (let i = 0; i < 5; i++) blobs.push([x0 + (x1 - x0) * (0.12 + R() * 0.76), y0 + (y1 - y0) * (0.15 + R() * 0.7) - h * 0.55, T * (0.2 + R() * 0.12)]);
    c.lineWidth = Math.max(1.2, T * 0.045); c.strokeStyle = INK;
    for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.stroke(); }
    for (const [bx, by, br] of blobs) { c.beginPath(); circ(c, bx, by, br); c.fillStyle = '#2f5a48'; c.fill(); }
    for (const [bx, by, br] of blobs) { c.beginPath(); ell(c, bx - br * 0.1, by - br * 0.42, br * 0.82, br * 0.5); c.fillStyle = '#f3f7fb'; c.fill(); c.beginPath(); ell(c, bx - br * 0.3, by - br * 0.55, br * 0.3, br * 0.16); c.fillStyle = '#ffffff'; c.fill(); }
    c.fillStyle = '#c8372d'; for (let i = 0; i < 3; i++) { c.beginPath(); circ(c, x0 + (x1 - x0) * R(), y0 + (y1 - y0) * R() - h * 0.3, T * 0.03); c.fill(); }
    c.restore();
  },
};

/* ===== src/art/40-ui.js ===== */
/* Roll to War: UI kit (timber-and-gold) */
const UI = (RTW.ui = {});

/* ---------- materials ---------- */
UI.woodFill = function (c, x, y, w, h, seed = 1, base = PAL.wood1) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(base, 0.12)); g.addColorStop(0.5, base); g.addColorStop(1, shade(base, -0.22));
  c.fillStyle = g; c.fillRect(x, y, w, h);
  const R = rng(seed);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // planks, each a slightly different tone
  const ph = Math.max(10, Math.min(26, h / Math.max(1, Math.round(h / 22))));
  for (let yy = y; yy < y + h; yy += ph) { const v = R(); c.fillStyle = v < 0.5 ? `rgba(255,200,140,${(0.5 - v) * 0.14})` : `rgba(40,15,0,${(v - 0.5) * 0.16})`; c.fillRect(x, yy, w, ph); }
  for (let yy = y + ph; yy < y + h - 2; yy += ph) { c.fillStyle = 'rgba(30,15,5,0.45)'; c.fillRect(x, yy - 1, w, 1.6); c.fillStyle = 'rgba(255,220,170,0.1)'; c.fillRect(x, yy + 0.8, w, 1); }
  // grain
  c.strokeStyle = 'rgba(40,20,8,0.22)'; c.lineWidth = 1;
  for (let i = 0; i < w * h / 900; i++) {
    const gx = x + R() * w, gy = y + R() * h, L2 = 20 + R() * 60;
    c.beginPath(); c.moveTo(gx, gy); c.bezierCurveTo(gx + L2 * 0.3, gy + (R() - 0.5) * 3, gx + L2 * 0.6, gy + (R() - 0.5) * 3, gx + L2, gy + (R() - 0.5) * 2); c.stroke();
  }
  // knots
  for (let i = 0; i < w * h / 12000; i++) { const kx = x + R() * w, ky = y + R() * h; c.strokeStyle = 'rgba(40,20,8,0.3)'; c.beginPath(); ell(c, kx, ky, 4 + R() * 3, 1.8 + R()); c.stroke(); }
  c.restore();
};
UI.goldRim = function (c, pathFn, lw = 3) {
  pathFn(); c.lineWidth = lw + 3; c.strokeStyle = INK; c.stroke();
  pathFn(); c.lineWidth = lw; const g = c.createLinearGradient(0, 0, 0, 1);
  c.strokeStyle = PAL.gold; c.stroke();
  pathFn(); c.lineWidth = Math.max(1, lw * 0.35); c.strokeStyle = PAL.goldL; c.globalAlpha = 0.7; c.stroke(); c.globalAlpha = 1;
};
UI.panel = function (c, x, y, w, h, r = 12, o = {}) {
  const path = () => { c.beginPath(); rr(c, x, y, w, h, r); };
  c.save();
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,3,0.35)'; c.beginPath(); rr(c, x + 1, y + 4, w, h, r); c.fill(); }
  path(); c.save(); c.clip(); UI.woodFill(c, x, y, w, h, o.seed || 3, o.base || PAL.wood1);
  // inner shadow
  const ig = c.createLinearGradient(0, y, 0, y + h); ig.addColorStop(0, 'rgba(255,230,190,0.12)'); ig.addColorStop(0.15, 'rgba(0,0,0,0)'); ig.addColorStop(0.85, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,0.25)');
  c.fillStyle = ig; c.fillRect(x, y, w, h);
  c.restore();
  UI.goldRim(c, () => { c.beginPath(); rr(c, x + 1.5, y + 1.5, w - 3, h - 3, r - 1); }, o.rim || 3);
  if (o.rivets !== false && w > 60 && h > 40) {
    for (const [rx, ry] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]]) {
      c.beginPath(); circ(c, rx, ry, 3.2); c.fillStyle = INK; c.fill();
      c.beginPath(); circ(c, rx, ry, 2.2); c.fillStyle = PAL.goldL; c.fill();
    }
  }
  c.restore();
};
UI.parch = function (c, x, y, w, h, r = 10, o = {}) {
  c.save();
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,3,0.3)'; c.beginPath(); rr(c, x + 1, y + 4, w, h, r); c.fill(); }
  c.beginPath(); rr(c, x, y, w, h, r);
  c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  const g = c.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.2, x + w / 2, y + h / 2, Math.max(w, h) * 0.7);
  g.addColorStop(0, '#fbf0d2'); g.addColorStop(1, PAL.parchD);
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  const R = rng(o.seed || 11);
  c.fillStyle = 'rgba(150,110,50,0.08)';
  for (let i = 0; i < w * h / 300; i++) { c.beginPath(); circ(c, x + R() * w, y + R() * h, 0.5 + R() * 2.5); c.fill(); }
  c.restore();
  if (o.rim) UI.goldRim(c, () => { c.beginPath(); rr(c, x + 3, y + 3, w - 6, h - 6, r - 2); }, 2.2);
  c.restore();
};

/* ---------- buttons ---------- */
const BTN = {
  gold: { top: '#ffe89a', mid: '#f6bd3e', bot: '#cc8418', text: INK, rim: PAL.goldDD },
  blue: { top: '#95c4ff', mid: '#3f7cf0', bot: '#1d4bb4', text: '#fffaf0', rim: '#15347a' },
  red: { top: '#ffa090', mid: '#e44a3c', bot: '#a8241b', text: '#fffaf0', rim: '#6d130d' },
  green: { top: '#a4f2b2', mid: '#3fb562', bot: '#207a3e', text: '#fffaf0', rim: '#174d28' },
  wood: { top: '#c48a52', mid: PAL.wood2, bot: PAL.wood3, text: '#fff3d6', rim: PAL.woodDark },
};
UI.button = function (c, x, y, w, h, label, style = 'gold', o = {}) {
  const S = BTN[style] || BTN.gold, r = o.r != null ? o.r : h * 0.3, press = o.pressed ? 2 : 0, yy = y + press;
  c.save();
  c.fillStyle = 'rgba(10,6,3,0.4)'; c.beginPath(); rr(c, x, y + 5, w, h, r); c.fill();
  c.beginPath(); rr(c, x, yy, w, h, r); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, yy, 0, yy + h); g.addColorStop(0, S.top); g.addColorStop(0.55, S.mid); g.addColorStop(1, S.bot);
  c.fillStyle = g; c.fill();
  // deeper lip along the bottom, glossy cap on top
  c.save(); c.beginPath(); rr(c, x, yy, w, h, r); c.clip();
  c.fillStyle = 'rgba(60,25,0,0.16)'; c.beginPath(); rr(c, x - 2, yy + h * 0.78, w + 4, h * 0.4, r); c.fill();
  const gl = c.createLinearGradient(0, yy + 3, 0, yy + h * 0.48); gl.addColorStop(0, 'rgba(255,255,255,0.55)'); gl.addColorStop(1, 'rgba(255,255,255,0.08)');
  c.fillStyle = gl; c.beginPath(); c.moveTo(x + r * 0.7, yy + 3); c.lineTo(x + w - r * 0.7, yy + 3); c.quadraticCurveTo(x + w - 4, yy + 3, x + w - 4, yy + h * 0.3); c.quadraticCurveTo(x + w / 2, yy + h * 0.56, x + 4, yy + h * 0.3); c.quadraticCurveTo(x + 4, yy + 3, x + r * 0.7, yy + 3); c.closePath(); c.fill();
  c.restore();
  c.beginPath(); rr(c, x + 2, yy + 2, w - 4, h - 4, r - 1); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.stroke();
  // big gold buttons catch a travelling glint now and then
  if (o.shine !== false && style === 'gold' && h >= 36 && RTW.game && RTW.game.app) AMB.shine(c, () => { c.beginPath(); rr(c, x, yy, w, h, r); }, x, yy, w, h, RTW.game.app.time + y * 0.011 + x * 0.003, 3.6, 0.5);
  if (label) text(c, label, x + w / 2 + (o.iconW ? o.iconW / 2 : 0), yy + h / 2 + 1, { size: o.size || h * 0.42, font: o.font || F.head, weight: 900, fill: S.text, stroke: S.text === INK ? null : rgba(INK, 0.6), strokeW: 3, letter: o.letter == null ? 1 : o.letter, maxW: w - 16 - (o.iconW || 0), shadow: S.text === INK ? 'rgba(255,245,210,0.7)' : null, shadowY: 1 });
  c.restore();
};
UI.roundBtn = function (c, cx, cy, r, icon, o = {}) {
  c.save();
  c.fillStyle = 'rgba(10,6,3,0.4)'; c.beginPath(); circ(c, cx, cy + 3, r); c.fill();
  c.beginPath(); circ(c, cx, cy, r); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#c48a52'); g.addColorStop(0.55, PAL.wood2); g.addColorStop(1, PAL.wood3);
  c.fillStyle = g; c.fill();
  c.beginPath(); ell(c, cx, cy - r * 0.42, r * 0.62, r * 0.36); c.fillStyle = 'rgba(255,240,210,0.22)'; c.fill();
  c.beginPath(); circ(c, cx, cy, r - 2.5); c.lineWidth = 2.2; c.strokeStyle = PAL.gold; c.stroke();
  if (icon === 'pause') ICON.pause(c, cx, cy, r * 0.9);
  else if (icon === 'sound') ICON.sound(c, cx - r * 0.05, cy, r * 0.95, o.on !== false);
  else if (icon === 'gear') ICON.gear(c, cx, cy, r * 1.1);
  c.restore();
};

/* ---------- ribbon banner ---------- */
UI.ribbon = function (c, cx, cy, w, h, label, col = PAL.gold, o = {}) {
  const tail = h * 0.7;
  c.save(); c.lineJoin = 'round';
  const dark = shade(col, -0.35);
  for (const sx of [-1, 1]) {
    c.beginPath();
    const ex = cx + sx * (w / 2 + tail * 0.2);
    c.moveTo(cx + sx * (w / 2 - tail * 0.6), cy - h * 0.2);
    c.lineTo(ex + sx * tail, cy - h * 0.2);
    c.lineTo(ex + sx * tail * 0.6, cy + h * 0.3);
    c.lineTo(ex + sx * tail, cy + h * 0.75);
    c.lineTo(cx + sx * (w / 2 - tail * 0.6), cy + h * 0.75);
    c.closePath(); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = dark; c.fill();
  }
  c.beginPath(); c.moveTo(cx - w / 2, cy - h / 2); c.quadraticCurveTo(cx, cy - h / 2 - h * 0.18, cx + w / 2, cy - h / 2); c.lineTo(cx + w / 2, cy + h / 2); c.quadraticCurveTo(cx, cy + h / 2 - h * 0.18, cx - w / 2, cy + h / 2); c.closePath();
  c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, shade(col, 0.28)); g.addColorStop(1, shade(col, -0.15));
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(cx - w / 2 + 4, cy - h / 2 + 4); c.quadraticCurveTo(cx, cy - h / 2 - h * 0.18 + 4, cx + w / 2 - 4, cy - h / 2 + 4); c.stroke();
  text(c, label, cx, cy - h * 0.06, { size: o.size || h * 0.5, font: o.font || F.head, weight: 900, fill: o.fill || '#fffaf0', stroke: INK, strokeW: o.strokeW || 4, letter: o.letter == null ? 2 : o.letter, maxW: w - 20 });
  c.restore();
};

/* ---------- dice ---------- */
const FACES = (RTW.FACES = {
  r1: { name: 'Recruit', desc: '+1 soldier each wave', kind: 'prod' },
  r2: { name: 'Muster', desc: '+2 soldiers each wave', kind: 'prod', rare: true },
  s1: { name: 'Swift', desc: 'Crew marches faster', kind: 'move' },
  s2: { name: 'Forced March', desc: 'Crew marches much faster', kind: 'move', rare: true },
});
RTW.DIE_FACES = ['r1', 'r1', 'r2', 's1', 's1', 's2'];
UI.dieFace = function (c, cx, cy, s, face) {
  const f = FACES[face];
  if (!f) return;
  if (face === 'r1') { ICON.helmet(c, cx, cy + s * 0.04, s * 0.62, PAL.prod); plusBadge(c, cx + s * 0.25, cy - s * 0.2, s * 0.16, PAL.prod); }
  else if (face === 'r2') { ICON.helmet(c, cx - s * 0.13, cy + s * 0.06, s * 0.5, shade(PAL.prod, -0.12)); ICON.helmet(c, cx + s * 0.13, cy + s * 0.1, s * 0.5, PAL.prod); plusBadge(c, cx + s * 0.28, cy - s * 0.24, s * 0.15, PAL.prod); }
  else if (face === 's1') ICON.chevrons(c, cx - s * 0.02, cy, s * 0.46, 2, PAL.move);
  else if (face === 's2') ICON.chevrons(c, cx - s * 0.03, cy, s * 0.4, 3, PAL.move);
};
function plusBadge(c, x, y, r, col) {
  c.beginPath(); circ(c, x, y, r); c.lineWidth = r * 0.35; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#fffaf0'; c.fill();
  c.fillStyle = col; c.fillRect(x - r * 0.6, y - r * 0.17, r * 1.2, r * 0.34); c.fillRect(x - r * 0.17, y - r * 0.6, r * 0.34, r * 1.2);
}
UI.die = function (c, cx, cy, s, face, o = {}) {
  const f = FACES[face] || {};
  c.save();
  c.translate(cx, cy);
  if (o.rot) c.rotate(o.rot);
  const lift = o.selected ? -s * 0.12 : 0;
  // shadow
  c.fillStyle = 'rgba(10,6,3,0.35)'; c.beginPath(); rr(c, -s / 2 + 1, -s / 2 + s * 0.1, s, s, s * 0.22); c.fill();
  if (o.selected) {
    c.save(); c.shadowColor = PAL.goldL; c.shadowBlur = s * 0.4; c.beginPath(); rr(c, -s / 2, -s / 2 + lift, s, s, s * 0.22); c.fillStyle = PAL.goldL; c.fill(); c.restore();
  }
  // body side (depth)
  c.beginPath(); rr(c, -s / 2, -s / 2 + lift + s * 0.06, s, s, s * 0.22); c.lineWidth = Math.max(2, s * 0.06); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#d8c7a0'; c.fill();
  // face
  c.beginPath(); rr(c, -s / 2, -s / 2 + lift, s, s * 0.94, s * 0.22); c.lineWidth = Math.max(2, s * 0.06); c.strokeStyle = INK; c.stroke();
  const g = c.createLinearGradient(0, -s / 2 + lift, 0, s / 2 + lift); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ecdcb8');
  c.fillStyle = g; c.fill();
  if (f.rare) { c.beginPath(); rr(c, -s / 2 + s * 0.07, -s / 2 + lift + s * 0.07, s * 0.86, s * 0.8, s * 0.16); c.lineWidth = Math.max(1.5, s * 0.045); c.strokeStyle = PAL.gold; c.stroke(); }
  c.beginPath(); ell(c, -s * 0.2, -s * 0.3 + lift, s * 0.18, s * 0.06, -0.2); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
  if (o.blank) { c.fillStyle = 'rgba(80,60,30,0.25)'; for (const [dx, dy] of [[-0.2, -0.2], [0.2, 0.2], [0, 0], [0.2, -0.2], [-0.2, 0.2]]) { c.beginPath(); circ(c, dx * s, dy * s + lift, s * 0.06); c.fill(); } }
  else UI.dieFace(c, 0, lift - s * 0.02, s, face);
  c.restore();
};
UI.pipDie = function (c, cx, cy, s, n = 5, o = {}) {
  c.save(); c.translate(cx, cy); if (o.rot) c.rotate(o.rot);
  c.fillStyle = 'rgba(10,6,3,0.35)'; c.beginPath(); rr(c, -s / 2 + 1, -s / 2 + s * 0.1, s, s, s * 0.22); c.fill();
  c.beginPath(); rr(c, -s / 2, -s / 2 + s * 0.06, s, s, s * 0.22); c.lineWidth = Math.max(2, s * 0.07); c.strokeStyle = INK; c.stroke(); c.fillStyle = '#d8c7a0'; c.fill();
  c.beginPath(); rr(c, -s / 2, -s / 2, s, s * 0.94, s * 0.22); c.stroke();
  const g = c.createLinearGradient(0, -s / 2, 0, s / 2); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ecdcb8'); c.fillStyle = g; c.fill();
  const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n];
  for (const [px, py] of P) { c.beginPath(); circ(c, px * s * 0.25, py * s * 0.24 - s * 0.02, s * 0.085); c.fillStyle = n === 1 ? PAL.attackD : INK; c.fill(); }
  c.restore();
};
UI.dieSlot = function (c, cx, cy, s) {
  c.save(); c.beginPath(); rr(c, cx - s / 2, cy - s / 2, s, s, s * 0.22);
  c.fillStyle = 'rgba(20,10,4,0.35)'; c.fill(); c.lineWidth = 1.5; c.setLineDash([3, 3]); c.strokeStyle = 'rgba(255,230,170,0.5)'; c.stroke(); c.restore();
};

/* ---------- troop bust (portrait art) ---------- */
UI.bust = function (c, x, y, w, h, type, team = 'blue', t = 0, o = {}) {
  if (RTW.SHIPS && RTW.SHIPS[type]) { RTW.shipBust(c, x, y, w, h, type, team, t, o); return; }   // a crew of ships
  const tm = TEAMS[team];
  c.save();
  c.beginPath(); rr(c, x, y, w, h, o.r == null ? w * 0.16 : o.r); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, tm.light); g.addColorStop(1, tm.dark);
  c.fillStyle = g; c.fillRect(x, y, w, h);
  // light rays
  c.globalAlpha = 0.18; c.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x + w / 2, y + h * 1.1); const a = -Math.PI / 2 + (i - 2.5) * 0.32; c.lineTo(x + w / 2 + Math.cos(a - 0.08) * h * 2, y + h * 1.1 + Math.sin(a - 0.08) * h * 2); c.lineTo(x + w / 2 + Math.cos(a + 0.08) * h * 2, y + h * 1.1 + Math.sin(a + 0.08) * h * 2); c.closePath(); c.fill(); }
  c.globalAlpha = 1;
  const view = o.view || 'front';
  const z = o.zoom || 1;
  const def = RTW.TROOPS[type] || {};
  if (def.bust) RTW.drawTroop(c, { type, team, x: x + w * 0.5, y: y + h * def.bust.y, size: h * def.bust.s * z, view, anim: 'idle', t, shadow: false });
  else if (type === 'knight' || def.mounted) { const k = def.h > 150 ? 0.9 : 1; RTW.drawTroop(c, { type, team, x: x + w * 0.5, y: y + h * (0.12 + 1.52 * z * k), size: h * 1.12 * z * k, view, anim: 'idle', t, shadow: false }); }
  else RTW.drawTroop(c, { type, team, x: x + w * 0.5, y: y + h * (0.1 + 1.78 * z), size: h * 1.62 * z, view, anim: 'idle', t, shadow: false, facing: 1 });
  c.restore();
};

/* ---------- crew portrait card (rally HUD) ---------- */
UI.crewCard = function (c, x, y, w, h, type, o = {}) {
  const team = o.team || 'blue', dice = o.dice || [], cap = 4;
  c.save();
  const sel = o.eligible ? 0.5 + 0.5 * Math.sin((o.t || 0) * 6) : 0;
  if (o.eligible) { c.save(); c.shadowColor = PAL.goldL; c.shadowBlur = 10 + sel * 8; c.beginPath(); rr(c, x, y, w, h, 12); c.fillStyle = PAL.goldL; c.fill(); c.restore(); }
  // frame
  c.beginPath(); rr(c, x, y, w, h, 12); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const fg = c.createLinearGradient(0, y, 0, y + h); fg.addColorStop(0, PAL.goldL); fg.addColorStop(1, PAL.goldD); c.fillStyle = fg; c.fill();
  // portrait window
  const px = x + 4, py = y + 4, pw = w - 8, ph = h - 30;
  UI.bust(c, px, py, pw, ph, type, team, o.t || 0, { r: 9 });
  c.beginPath(); rr(c, px, py, pw, ph, 9); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  // name plate
  const ny = y + h - 26;
  c.beginPath(); rr(c, x + 3, ny, w - 6, 23, 8); c.fillStyle = PAL.woodDark; c.fill();
  text(c, RTW.TROOPS[type].name.toUpperCase(), x + w / 2, ny + 12, { size: 11.5, font: F.head, weight: 900, fill: '#fff3d6', letter: 0.5, maxW: w - 12 });
  // capacity badge
  const bx = x + w - 6, by = y + 8;
  c.beginPath(); rr(c, bx - 30, by - 9, 34, 18, 9); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = dice.length >= cap ? PAL.attackD : '#2b1a0e'; c.fill();
  text(c, `${dice.length}/${cap}`, bx - 13, by + 0.5, { size: 12, weight: 700, fill: '#fff3d6' });
  // counts (marching / arrived)
  if (o.counts) {
    const cy2 = y + ph - 8;
    c.beginPath(); rr(c, x + 7, cy2 - 9, 44, 17, 8); c.fillStyle = 'rgba(15,10,5,0.72)'; c.fill();
    ICON.chevrons(c, x + 15, cy2, 9, 1, '#9fe0b5');
    text(c, String(o.counts[0]), x + 34, cy2 + 0.5, { size: 11.5, weight: 700, fill: '#fff', maxW: 26 });
    c.beginPath(); rr(c, x + w - 51, cy2 - 9, 44, 17, 8); c.fillStyle = 'rgba(15,10,5,0.72)'; c.fill();
    miniHouse(c, x + w - 42, cy2, 10);
    text(c, String(o.counts[1]), x + w - 22, cy2 + 0.5, { size: 11.5, weight: 700, fill: '#fff', maxW: 26 });
  }
  // dice tags (above the card)
  const ts = 19, gap = 3, tw = cap * ts + (cap - 1) * gap, tx0 = x + (w - tw) / 2 + ts / 2, ty = y - ts * 0.62;
  for (let i = 0; i < cap; i++) {
    if (i < dice.length) UI.die(c, tx0 + i * (ts + gap), ty, ts, dice[i]);
    else UI.dieSlot(c, tx0 + i * (ts + gap), ty, ts * 0.86);
  }
  c.restore();
};
function miniHouse(c, x, y, s) {
  c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.05); c.lineTo(x, y - s * 0.55); c.lineTo(x + s * 0.5, y - s * 0.05); c.lineTo(x + s * 0.38, y - s * 0.05); c.lineTo(x + s * 0.38, y + s * 0.45); c.lineTo(x - s * 0.38, y + s * 0.45); c.lineTo(x - s * 0.38, y - s * 0.05); c.closePath();
  c.fillStyle = '#ffe9b0'; c.fill();
}
UI.miniHouse = miniHouse;

/* ---------- timer medallion ---------- */
UI.medallion = function (c, cx, cy, r, label, prog = 1, o = {}) {
  c.save();
  c.fillStyle = 'rgba(10,6,3,0.4)'; c.beginPath(); circ(c, cx, cy + 4, r + 4); c.fill();
  c.beginPath(); circ(c, cx, cy, r + 4); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const rg = c.createLinearGradient(0, cy - r, 0, cy + r); rg.addColorStop(0, PAL.goldL); rg.addColorStop(1, PAL.goldD); c.fillStyle = rg; c.fill();
  // progress ring
  c.beginPath(); c.arc(cx, cy, r + 0.5, -Math.PI / 2, -Math.PI / 2 + TAU * prog); c.lineWidth = 5; c.strokeStyle = o.ringCol || '#fff3c4'; c.stroke();
  c.beginPath(); circ(c, cx, cy, r - 3); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  const pg = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r); pg.addColorStop(0, '#fffaf0'); pg.addColorStop(1, PAL.parchD);
  c.fillStyle = pg; c.fill();
  text(c, label, cx, cy + r * 0.06, { size: o.size || r * 0.72, weight: 700, fill: o.fill || INK, maxW: r * 1.6 });
  if (o.sub) text(c, o.sub, cx, cy + r * 0.62, { size: r * 0.22, font: F.head, weight: 900, fill: PAL.woodDark, letter: 1 });
  c.restore();
};

/* ---------- Rally > Battle progress bar ---------- */
UI.stageBar = function (c, x, y, w, h, stage, prog, o = {}) {
  const split = w * 0.6, gap = 6;
  c.save();
  const seg = (sx, sw, active, done, label, p) => {
    c.beginPath(); rr(c, sx, y, sw, h, h / 2); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#2a190c'; c.fill();
    if (p > 0) {
      c.save(); c.beginPath(); rr(c, sx, y, sw, h, h / 2); c.clip();
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, active ? PAL.goldL : '#9fe0b5'); g.addColorStop(1, active ? PAL.goldD : PAL.moveD);
      c.fillStyle = g; c.fillRect(sx, y, sw * p, h);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(sx, y + 1, sw * p, h * 0.35);
      c.restore();
    }
    text(c, label, sx + sw / 2, y + h / 2 + 0.5, { size: h * 0.62, font: F.head, weight: 900, fill: '#fffaf0', stroke: INK, strokeW: 3.2, letter: 2, maxW: sw - 12 });
  };
  const rp = stage === 'rally' ? prog : 1, bp = stage === 'battle' ? prog : 0;
  seg(x, split - gap / 2, stage === 'rally', stage !== 'rally', stage === 'rally' ? 'RALLY' : 'RALLY ✓', rp);
  seg(x + split + gap / 2, w - split - gap / 2, stage === 'battle', false, 'BATTLE', bp);
  // dice pair ticks on rally segment
  if (o.ticks !== false) {
    for (let i = 1; i < 6; i++) { const tx = x + ((split - gap / 2) * i) / 6; c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(tx - 0.75, y + 3, 1.5, h - 6); }
  }
  // arrow
  const ax = x + split, ay = y + h / 2;
  c.beginPath(); c.moveTo(ax - 4, ay - 6); c.lineTo(ax + 4, ay); c.lineTo(ax - 4, ay + 6); c.closePath(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.gold; c.fill();
  c.restore();
};

/* ---------- battle bonus card ---------- */
UI.card = function (c, x, y, w, h, card, o = {}) {
  c.save();
  if (o.highlight) { c.save(); c.shadowColor = PAL.goldL; c.shadowBlur = 18; c.beginPath(); rr(c, x, y, w, h, 12); c.fillStyle = PAL.goldL; c.fill(); c.restore(); }
  c.fillStyle = 'rgba(10,6,3,0.45)'; c.beginPath(); rr(c, x + 2, y + 6, w, h, 12); c.fill();
  c.beginPath(); rr(c, x, y, w, h, 12); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
  const fg = c.createLinearGradient(0, y, 0, y + h); fg.addColorStop(0, PAL.goldL); fg.addColorStop(1, PAL.goldD); c.fillStyle = fg; c.fill();
  UI.parch(c, x + 5, y + 5, w - 10, h - 10, 8, { shadow: false, seed: (card.seed || 3) });
  // art window
  const aw = w - 20, ah = h * 0.42, ax = x + 10, ay = y + 10;
  c.save(); c.beginPath(); rr(c, ax, ay, aw, ah, 7); c.clip();
  const col = card.color || PAL.armor;
  const bg = c.createLinearGradient(0, ay, 0, ay + ah); bg.addColorStop(0, shade(col, 0.35)); bg.addColorStop(1, shade(col, -0.35));
  c.fillStyle = bg; c.fillRect(ax, ay, aw, ah);
  c.globalAlpha = 0.2; c.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.35; c.beginPath(); c.moveTo(ax + aw / 2, ay + ah * 0.6); c.lineTo(ax + aw / 2 + Math.cos(a - 0.07) * ah * 2, ay + ah * 0.6 + Math.sin(a - 0.07) * ah * 2); c.lineTo(ax + aw / 2 + Math.cos(a + 0.07) * ah * 2, ay + ah * 0.6 + Math.sin(a + 0.07) * ah * 2); c.closePath(); c.fill(); } c.globalAlpha = 1;
  if (card.troop) RTW.drawTroop(c, { type: card.troop, team: 'blue', x: ax + aw * 0.5, y: ay + ah * 0.98, size: card.troop === 'knight' ? ah * 0.66 : ah * 0.86, view: 'side', anim: card.anim || 'attack', t: card.animT || 0.35, shadow: false });
  if (card.icon === 'shield') ICON.shield(c, ax + aw * 0.5, ay + ah * 0.5, ah * 0.62, PAL.armor);
  if (card.icon === 'fist') ICON.fist(c, ax + aw * 0.5, ay + ah * 0.52, ah * 0.6);
  if (card.icon === 'boot') ICON.boot(c, ax + aw * 0.53, ay + ah * 0.6, ah * 0.6);
  if (card.badge) { const bx = ax + aw - 16, by = ay + 16; c.beginPath(); circ(c, bx, by, 13); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#fffaf0'; c.fill(); if (card.badge === 'shield') ICON.shield(c, bx, by, 16); else if (card.badge === 'fist') ICON.fist(c, bx, by, 15); else if (card.badge === 'range') { c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.arc(bx, by + 5, 8, -Math.PI * 0.85, -Math.PI * 0.15); c.stroke(); c.beginPath(); c.moveTo(bx - 7, by + 3); c.lineTo(bx + 8, by - 6); c.stroke(); } }
  c.restore();
  c.beginPath(); rr(c, ax, ay, aw, ah, 7); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  // title + effect
  text(c, card.title, x + w / 2, ay + ah + 17, { size: 14, font: F.head, weight: 900, fill: INK, maxW: w - 18 });
  text(c, card.value, x + w / 2, ay + ah + 42, { size: 24, weight: 700, fill: card.valueCol || PAL.attackD, maxW: w - 18 });
  const lines = String(card.desc || '').split('\n');
  lines.forEach((ln, i) => text(c, ln, x + w / 2, ay + ah + 64 + i * 14, { size: 11.5, weight: 600, fill: '#5a4127', maxW: w - 16 }));
  c.restore();
};

/* ---------- survivor strip ---------- */
UI.survivorStrip = function (c, x, y, w, h, blue, red, o = {}) {
  c.save();
  UI.panel(c, x, y, w, h, 14, { rivets: false, base: PAL.wood3 });
  const rowH = (h - 18) / 2, types = ['piker', 'crossbow', 'knight', 'sword'];
  const rows = [['blue', blue, y + 9], ['red', red, y + 9 + rowH]];
  for (const [team, arr, ry] of rows) {
    const tm = TEAMS[team];
    const total = arr.reduce((a, b) => a + b, 0);
    // total plate
    c.beginPath(); rr(c, x + 10, ry + 3, 68, rowH - 6, 9); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
    const tg = c.createLinearGradient(0, ry, 0, ry + rowH); tg.addColorStop(0, tm.light); tg.addColorStop(1, tm.dark); c.fillStyle = tg; c.fill();
    text(c, String(total), x + 44, ry + rowH / 2 + 1, { size: rowH * 0.56, weight: 700, fill: '#fff', stroke: INK, strokeW: 3, maxW: 60 });
    const cw = (w - 100) / 4;
    types.forEach((ty, i) => {
      const cx = x + 88 + i * cw;
      c.beginPath(); rr(c, cx, ry + 4, cw - 6, rowH - 8, 8); c.fillStyle = 'rgba(15,8,3,0.45)'; c.fill();
      const bs = rowH - 12;
      UI.bust(c, cx + 3, ry + 6, bs, bs, ty, team, 0, { r: 6 });
      c.beginPath(); rr(c, cx + 3, ry + 6, bs, bs, 6); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke();
      const n = arr[i];
      const nsz = Math.min(rowH * 0.46, (cw - bs - 14) / (textWidth(c, '00', 10, F.body, 700) / 10));
      text(c, String(n), cx + bs + 6 + (cw - bs - 12) / 2, ry + rowH / 2 + 1, { size: nsz, weight: 700, fill: n === 0 ? '#9c8468' : '#fff6e0', maxW: cw - bs - 12 });
      if (n === 0) { c.strokeStyle = 'rgba(210,60,50,0.9)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx + 5, ry + 8); c.lineTo(cx + bs + 1, ry + rowH - 10); c.stroke(); }
    });
  }
  c.restore();
};

/* ---------- logo ---------- */
UI.logo = function (c, cx, cy, s, t = 0) {
  // s = overall width; two-line lockup: ROLL / to WAR on a blue banner with crossed pike & sword
  c.save();
  const k = s / 360;
  c.translate(cx, cy); c.scale(k, k);
  // crossed weapons behind
  c.save(); c.rotate(-0.5); c.beginPath(); cap(c, -168, 0, 150, 0, 9); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.wood; c.fill();
  c.beginPath(); c.moveTo(150, -11); c.quadraticCurveTo(172, -13, 200, 0); c.quadraticCurveTo(172, 13, 150, 11); c.closePath(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.steelL; c.fill(); c.restore();
  c.save(); c.rotate(0.5); c.scale(-1, 1);
  c.beginPath(); c.moveTo(-50, -9); c.lineTo(160, -6); c.lineTo(190, 0); c.lineTo(160, 6); c.lineTo(-50, 9); c.closePath(); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.steelL; c.fill();
  c.beginPath(); rr(c, -64, -28, 14, 56, 5); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.fillStyle = PAL.gold; c.fill();
  c.beginPath(); rr(c, -104, -7, 42, 14, 5); c.stroke(); c.fillStyle = PAL.leather; c.fill();
  c.beginPath(); circ(c, -110, 0, 10); c.stroke(); c.fillStyle = PAL.gold; c.fill();
  c.restore();
  // banner plate
  const plate = () => { c.beginPath(); c.moveTo(-170, -78); c.quadraticCurveTo(0, -100, 170, -78); c.lineTo(160, 86); c.quadraticCurveTo(0, 70, -160, 86); c.closePath(); };
  plate(); c.lineWidth = 9; c.strokeStyle = INK; c.stroke();
  const bg = c.createLinearGradient(0, -90, 0, 90); bg.addColorStop(0, '#3a7cf0'); bg.addColorStop(1, '#173a88'); c.fillStyle = bg; c.fill();
  c.save(); plate(); c.clip(); c.globalAlpha = 0.12; c.fillStyle = '#fff'; for (let i = -6; i < 7; i++) { c.beginPath(); c.moveTo(i * 40, -120); c.lineTo(i * 40 + 20, -120); c.lineTo(i * 40 - 30, 120); c.lineTo(i * 40 - 50, 120); c.closePath(); c.fill(); } c.restore();
  c.lineWidth = 5; c.strokeStyle = PAL.gold; c.beginPath(); c.moveTo(-160, -70); c.quadraticCurveTo(0, -91, 160, -70); c.lineTo(151, 77); c.quadraticCurveTo(0, 62, -151, 77); c.closePath(); c.stroke();
  const big = (str, x, y, size) => text(c, str, x, y, { size, font: F.title, weight: 900, grad: ['#fff6cf', '#ffd76a', '#d7901f'], stroke: INK, strokeW: 11, letter: 2, maxW: 250 });
  big('ROLL', -14, -26, 66);
  const wW = Math.min(250, textWidth(c, 'WAR', 66, F.title, 900, 2));
  big('WAR', 30, 42, 66);
  text(c, 'TO', 30 - wW / 2 - 26, 38, { size: 28, font: F.title, weight: 900, fill: '#fffaf0', stroke: INK, strokeW: 7 });
  // die
  const bounce = Math.abs(Math.sin(t * 2.2)) * 6;
  UI.pipDie(c, 138, -70 - bounce, 58, 6, { rot: 0.26 + Math.sin(t * 2.2) * 0.05 });
  c.restore();
};

/* ===== src/art/50-scenes.js ===== */
/* Roll to War: concept scenes + auto-mount for <canvas data-rtw="scene"> */
const SC = (RTW.scenes = {});

/* ---------- concept maze (medium) ---------- */
const CM = {
  cols: 10, rows: 13, T: 38, ox: 5, oy: 166, seed: 3,
  grid: [
    '..........',
    '.#.####.#.',
    '.#......#.',
    '.###.##.#.',
    '......#...',
    '#.###.#.##',
    '..#...#...',
    '.##.###.#.',
    '......#.#.',
    '.####.#...',
    '.#....###.',
    ',..#......',
    ',,,,..,,,,',
  ],
  markers: [
    { r: 10, c: 4, dir: 'right' }, { r: 8, c: 5, dir: 'left' }, { r: 6, c: 3, dir: 'right' },
    { r: 4, c: 5, dir: 'left' }, { r: 2, c: 4, dir: 'right' }, { r: 11, c: 9, dir: 'up' }, { r: 4, c: 7, dir: 'right' },
  ],
  gates: [{ r: 9, c: 5, m: 2 }, { r: 10, c: 9, m: 2 }, { r: 7, c: 0, m: 3 }],
  pickups: [{ r: 6, c: 8, k: 'armor' }, { r: 8, c: 1, k: 'speed' }, { r: 2, c: 6, k: 'attack' }, { r: 6, c: 4, k: 'speed' }],
  houses: [
    { type: 'piker', x: 52 }, { type: 'crossbow', x: 146 }, { type: 'knight', x: 242 }, { type: 'sword', x: 337 },
  ],
};
RTW.CONCEPT_MAP = CM;
const ROUTES = {
  A: [[12, 4], [11, 4], [10, 4], [10, 5], [9, 5], [8, 5], [8, 4], [8, 3], [7, 3], [6, 3], [6, 4], [6, 5], [5, 5], [4, 5], [4, 4], [3, 4], [2, 4], [2, 5], [2, 6], [2, 7], [1, 7], [0, 7], [0, 6.35], [-0.6, 6.35]],
  B: [[12, 5], [11, 5], [11, 6], [11, 7], [11, 8], [11, 9], [10, 9], [9, 9], [9, 8], [9, 7], [8, 7], [7, 7], [6, 7], [6, 8], [6, 9], [5, 9], [4, 9], [3, 9], [2, 9], [1, 9], [0, 9], [0, 8.9], [-0.6, 8.9]],
  C: [[12, 4], [11, 4], [11, 3], [11, 2], [11, 1], [10, 0], [9, 0], [8, 0], [8, 1], [8, 2], [8, 3], [7, 3], [6, 3], [6, 4], [6, 5], [5, 5], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1.2], [-0.6, 1.2]],
};
function buildPath(cells, map) {
  const pts = cells.map(([r, q]) => [map.ox + (q + 0.5) * map.T, map.oy + (r + 0.5) * map.T]);
  const segs = []; let L = 0;
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; const l = Math.hypot(x2 - x1, y2 - y1); segs.push({ x1, y1, x2, y2, l, s: L }); L += l; }
  return { pts, segs, L };
}
function pathAt(path, d) {
  d = clamp(d, 0, path.L - 0.001);
  for (const s of path.segs) if (d <= s.s + s.l) { const k = (d - s.s) / s.l; return { x: lerp(s.x1, s.x2, k), y: lerp(s.y1, s.y2, k), dx: (s.x2 - s.x1) / s.l, dy: (s.y2 - s.y1) / s.l }; }
  const s = path.segs[path.segs.length - 1]; return { x: s.x2, y: s.y2, dx: 0, dy: -1 };
}
function viewFor(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return { view: 'side', facing: dx > 0 ? 1 : -1 };
  return { view: dy < 0 ? 'back' : 'front', facing: 1 };
}

/* procession: [type, route, phase offset (px), speed px/s, lane] */
const PROC = [
  ['knight', 'A', 40, 44, 0.12], ['piker', 'A', 70, 30, -0.2], ['sword', 'A', 108, 31, 0.18], ['crossbow', 'A', 142, 32, -0.1],
  ['piker', 'A', 176, 30, 0.15], ['piker', 'A', 205, 30, -0.18], ['knight', 'A', 250, 44, 0.05], ['crossbow', 'A', 280, 32, 0.2],
  ['sword', 'A', 318, 31, -0.15], ['piker', 'A', 360, 30, 0.1], ['crossbow', 'A', 400, 32, -0.2], ['sword', 'A', 440, 31, 0.16],
  ['piker', 'A', 480, 30, -0.05], ['knight', 'A', 520, 44, -0.14], ['crossbow', 'A', 560, 32, 0.12], ['sword', 'A', 600, 31, -0.2],
  ['piker', 'A', 640, 30, 0.2], ['piker', 'A', 690, 30, -0.1],
  ['knight', 'B', 60, 44, 0.1], ['sword', 'B', 120, 31, -0.14], ['crossbow', 'B', 190, 32, 0.16], ['piker', 'B', 260, 30, -0.12], ['sword', 'B', 330, 31, 0.1], ['piker', 'B', 420, 30, 0.0], ['crossbow', 'B', 520, 32, -0.16], ['knight', 'B', 620, 44, 0.14],
  ['piker', 'C', 100, 30, 0.12], ['sword', 'C', 250, 31, -0.12], ['crossbow', 'C', 420, 32, 0.1], ['piker', 'C', 600, 30, -0.1],
];

function bgWorld(c, x, y, w, h) {
  c.save(); c.fillStyle = W.grassPattern(c, 1); c.fillRect(x, y, w, h); c.restore();
}

/* ---------- rally scene ---------- */
SC.rally = function (c, Wd, Ht, t, st) {
  const map = CM, T = map.T;
  if (!st.floor) {
    const dpr = st.dpr || 1;
    const cv = mkCanvas(Wd * dpr, Ht * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
    bgWorld(g, 0, 0, Wd, Ht);
    // dirt around entrance
    W.renderFloor(g, map, { edgeGrass: false });
    st.floor = cv;
    st.paths = { A: buildPath(ROUTES.A, map), B: buildPath(ROUTES.B, map), C: buildPath(ROUTES.C, map) };
  }
  c.drawImage(st.floor, 0, 0, Wd, Ht);
  // back forest line behind houses
  for (let i = 0; i < 9; i++) W.tree(c, -10 + i * 50 + (i % 2) * 12, 132 - (i % 2) * 8, 20 + (i % 3) * 3, i + 1, i % 2 ? -0.08 : 0);
  // houses
  const counts = [9, 6, 4, 7];
  map.houses.forEach((h, i) => W.house(c, h.x, map.oy + 2, 76, h.type, 'blue', t, counts[i]));
  // collect objects by row
  const objs = [];
  for (let r = 0; r < map.rows; r++) for (let q = 0; q < map.cols; q++) {
    const ch = map.grid[r][q];
    if (ch === '#') objs.push({ y: map.oy + (r + 1) * T - 0.5, kind: 'block', r, q });
  }
  map.gates.forEach((gt) => objs.push({ y: map.oy + (gt.r + 0.5) * T, kind: 'gate', g: gt }));
  map.pickups.forEach((pk) => objs.push({ y: map.oy + (pk.r + 0.62) * T, kind: 'pickup', p: pk }));
  // corner trees / bushes
  objs.push({ y: map.oy + 12.9 * T, kind: 'tree', x: 26, r: 22, s: 4 }, { y: map.oy + 12.8 * T, kind: 'tree', x: 88, r: 18, s: 5 }, { y: map.oy + 12.95 * T, kind: 'tree', x: 300, r: 19, s: 6 }, { y: map.oy + 12.85 * T, kind: 'tree', x: 364, r: 23, s: 7 });
  objs.push({ y: map.oy + 11.9 * T, kind: 'bush', x: 16, r: 12, s: 2 }, { y: map.oy + 12.2 * T, kind: 'bush', x: 136, r: 11, s: 3 }, { y: map.oy + 12.3 * T, kind: 'bush', x: 250, r: 12, s: 4 });
  // units
  const P = st.paths;
  for (const [type, rt, off, spd, lane] of PROC) {
    const path = P[rt], loop = path.L + 60;
    const d = ((off + t * spd) % loop) - 30;
    if (d < 0 || d > path.L - 2) continue;
    const pt = pathAt(path, d);
    const v = viewFor(pt.dx, pt.dy);
    const px = pt.x - pt.dy * lane * T, py = pt.y + pt.dx * lane * T * 0.6;
    const boosted = rt === 'A' ? d > 300 : rt === 'B' ? d > 330 : d > 190;
    const armored = rt === 'B' && d > 390;
    objs.push({ y: py, kind: 'unit', type, x: px, v, t: t * (spd / 30) + off * 0.01, boosted: boosted && type !== 'knight' ? 'speed' : null, armored, dx: pt.dx, dy: pt.dy });
  }
  objs.sort((a, b) => a.y - b.y);
  for (const o of objs) {
    if (o.kind === 'block') { const nb = W.blockNb(map, o.r, o.q); W.drawBlock(c, map.ox + o.q * T, map.oy + o.r * T, T, T * 0.3, nb, st.dpr || 1, o.r * 13 + o.q); }
    else if (o.kind === 'gate') W.gate(c, map.ox + (o.g.c + 0.5) * T, map.oy + (o.g.r + 0.5) * T + T * 0.12, T, o.g.m, t);
    else if (o.kind === 'pickup') W.pickup(c, map.ox + (o.p.c + 0.5) * T, map.oy + (o.p.r + 0.62) * T, T, o.p.k, t);
    else if (o.kind === 'tree') W.tree(c, o.x, o.y, o.r, o.s);
    else if (o.kind === 'bush') W.bush(c, o.x, o.y, o.r, o.s);
    else if (o.kind === 'unit') {
      const size = 27;
      if (o.boosted === 'speed') {
        c.save(); c.strokeStyle = rgba(PAL.speed, 0.5); c.lineWidth = 2; c.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const oy2 = -size * (0.2 + i * 0.22); c.beginPath(); c.moveTo(o.x - o.dx * size * 0.4 + o.dy * 0, o.y + oy2 - o.dy * size * 0.4); c.lineTo(o.x - o.dx * size * 1.1, o.y + oy2 - o.dy * size * 1.1); c.stroke(); }
        c.restore();
      }
      RTW.drawTroop(c, { type: o.type, team: 'blue', x: o.x, y: o.y, size, view: o.v.view, facing: o.v.facing, anim: 'walk', t: o.t, dpr: st.dpr });
      if (o.armored) ICON.shield(c, o.x + 8, o.y - size * 1.05, 9);
      if (o.boosted === 'speed' && o.type === 'crossbow') ICON.boot(c, o.x + 9, o.y - size * 0.98, 10);
    }
  }
  W.entrance(c, map.ox + 5 * T, map.oy + 13 * T + 4, 118, t);
  // ---------- HUD ----------
  hudTop(c, Wd, t, { level: 2, name: 'Weigh the Detour', time: 45, prog: 0.5, stage: 'rally' });
  hudBottomRally(c, Wd, Ht, t);
};

function hudTop(c, Wd, t, o) {
  c.save();
  UI.woodFill(c, 0, 0, Wd, 96, 21, PAL.wood3);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 92, Wd, 6);
  c.fillStyle = INK; c.fillRect(0, 93, Wd, 3.5);
  c.fillStyle = PAL.gold; c.fillRect(0, 93.8, Wd, 2);
  // level plaque
  c.beginPath(); rr(c, 8, 10, 118, 44, 10); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = 'rgba(20,10,4,0.55)'; c.fill();
  c.beginPath(); circ(c, 29, 32, 15); c.lineWidth = 3; c.stroke();
  const lg = c.createLinearGradient(0, 17, 0, 47); lg.addColorStop(0, TEAMS.blue.light); lg.addColorStop(1, TEAMS.blue.dark); c.fillStyle = lg; c.fill();
  text(c, String(o.level), 29, 33, { size: 17, weight: 700, fill: '#fff', stroke: INK, strokeW: 3 });
  text(c, 'LEVEL ' + o.level, 50, 24, { size: 10, font: F.head, weight: 900, fill: PAL.goldL, align: 'left', letter: 1 });
  text(c, o.name, 50, 40, { size: 12.5, weight: 700, fill: '#fff3d6', align: 'left', maxW: 72 });
  // timer
  const mm = Math.floor(o.time / 60), ss = String(Math.floor(o.time % 60)).padStart(2, '0');
  UI.medallion(c, Wd / 2, 36, 27, `${mm}:${ss}`, o.stage === 'rally' ? 1 - o.prog : o.prog, { size: 20, sub: o.stage === 'rally' ? 'RALLY' : 'BATTLE' });
  // right side
  if (o.score) {
    const [b, r] = o.score;
    c.beginPath(); rr(c, 250, 12, 60, 40, 9); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = TEAMS.blue.main; c.fill();
    text(c, String(b), 280, 33, { size: 22, weight: 700, fill: '#fff', stroke: INK, strokeW: 3 });
  }
  UI.roundBtn(c, Wd - 72, 32, 18, 'sound');
  UI.roundBtn(c, Wd - 28, 32, 18, 'pause');
  UI.stageBar(c, 10, 66, Wd - 20, 20, o.stage, o.prog);
  c.restore();
}

function hudBottomRally(c, Wd, Ht, t) {
  const y0 = 668;
  c.save();
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, y0 - 6, Wd, 6);
  UI.woodFill(c, 0, y0, Wd, Ht - y0, 33, PAL.wood3);
  c.fillStyle = INK; c.fillRect(0, y0, Wd, 3.5); c.fillStyle = PAL.gold; c.fillRect(0, y0 + 0.8, Wd, 2);
  // dice tray
  c.beginPath(); rr(c, 8, y0 + 10, Wd - 16, 50, 12); c.fillStyle = 'rgba(15,8,3,0.5)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,220,150,0.25)'; c.stroke();
  text(c, 'NEW DICE', 20, y0 + 26, { size: 11, font: F.head, weight: 900, fill: PAL.goldL, align: 'left', letter: 1 });
  text(c, 'Tap a die, then a crew', 20, y0 + 44, { size: 11.5, weight: 600, fill: '#e9d6b0', align: 'left' });
  const roll = (t % 6) < 0.6;
  const rot1 = roll ? Math.sin(t * 30) * 0.6 : 0.06, rot2 = roll ? Math.cos(t * 26) * 0.6 : -0.08;
  UI.die(c, 208, y0 + 36, 40, roll ? RTW.DIE_FACES[Math.floor(t * 12) % 6] : 'r1', { selected: !roll, rot: rot1 });
  UI.die(c, 258, y0 + 36, 40, roll ? RTW.DIE_FACES[Math.floor(t * 12 + 3) % 6] : 's1', { rot: rot2 });
  text(c, 'NEXT PAIR', Wd - 52, y0 + 26, { size: 10, font: F.head, weight: 900, fill: PAL.goldL, letter: 1 });
  text(c, '0:12', Wd - 52, y0 + 45, { size: 18, weight: 700, fill: '#fff3d6' });
  // crew cards
  const types = ['piker', 'crossbow', 'knight', 'sword'];
  const dice = [['r1', 'r2'], ['s1'], ['s2', 's1', 'r1'], []];
  const counts = [[14, 9], [8, 6], [5, 4], [9, 7]];
  const cw = 88, gap = (Wd - 16 - cw * 4) / 3;
  types.forEach((ty, i) => UI.crewCard(c, 8 + i * (cw + gap), y0 + 84, cw, 88, ty, { dice: dice[i], eligible: true, t }));
  c.restore();
}


/* ===== src/art/51-scenes2.js ===== */
/* Roll to War: battle, card picker, victory, title, level select + sheet cells */

/* ---------- battlefield background ---------- */
function battleField(c, Wd, y0, y1, st) {
  if (!st.bf) {
    const dpr = st.dpr || 1, H = y1 - y0;
    const cv = mkCanvas(Wd * dpr, H * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
    g.fillStyle = W.grassPattern(g, 1); g.fillRect(0, 0, Wd, H);
    // worn earth in the middle
    g.save(); g.globalAlpha = 0.55;
    const dg = g.createRadialGradient(Wd / 2, H * 0.5, 10, Wd / 2, H * 0.5, Wd * 0.62);
    dg.addColorStop(0, 'rgba(150,125,80,0.95)'); dg.addColorStop(0.6, 'rgba(140,118,76,0.5)'); dg.addColorStop(1, 'rgba(140,118,76,0)');
    g.fillStyle = dg; g.beginPath(); ell(g, Wd / 2, H * 0.5, Wd * 0.62, H * 0.3); g.fill(); g.restore();
    const R = rng(77);
    g.fillStyle = 'rgba(95,75,45,0.25)';
    for (let i = 0; i < 90; i++) { g.beginPath(); ell(g, Wd * 0.15 + R() * Wd * 0.7, H * 0.28 + R() * H * 0.44, 1 + R() * 3, 0.6 + R() * 1.5, R() * 3); g.fill(); }
    // edge decoration
    for (let i = 0; i < 7; i++) W.rock(g, 20 + R() * (Wd - 40), 30 + R() * (H - 60), 4 + R() * 5, i);
    st.bf = cv;
  }
  c.drawImage(st.bf, 0, y0, Wd, y1 - y0);
}

function battleUnits(t) {
  const U = [];
  const add = (type, team, x, y, view, anim, ph, extra) => U.push(Object.assign({ type, team, x, y, view, anim, ph: ph || 0 }, extra || {}));
  // blue (bottom, facing up = back view)
  [150, 176, 202, 228, 254].forEach((x, i) => add('piker', 'blue', x, 446 + (i % 2) * 6, 'back', 'attack', i * 0.23));
  [100, 124, 280, 304].forEach((x, i) => add('sword', 'blue', x, 452 + (i % 2) * 5, 'back', 'attack', i * 0.31));
  [118, 148, 178, 208, 238, 268].forEach((x, i) => add('crossbow', 'blue', x, 548 + (i % 2) * 9, 'back', 'attack', i * 0.27));
  add('knight', 'blue', 54, 402, 'side', 'attack', 0.1, { facing: 1 });
  add('knight', 'blue', 336, 420, 'side', 'attack', 0.5, { facing: -1 });
  add('knight', 'blue', 40, 470, 'back', 'walk', 0.3);
  add('sword', 'blue', 160, 505, 'back', 'idle', 0.2); add('piker', 'blue', 226, 500, 'back', 'idle', 0.6);
  // red (top, facing down = front view)
  [150, 176, 202, 228, 254].forEach((x, i) => add('piker', 'red', x, 386 - (i % 2) * 6, 'front', 'attack', 0.4 + i * 0.21));
  [104, 128, 276, 300].forEach((x, i) => add('sword', 'red', x, 382 - (i % 2) * 5, 'front', 'attack', 0.2 + i * 0.29));
  [132, 162, 192, 222, 252].forEach((x, i) => add('crossbow', 'red', x, 282 - (i % 2) * 9, 'front', 'attack', 0.6 + i * 0.25));
  add('knight', 'red', 350, 312, 'side', 'attack', 0.7, { facing: -1 });
  add('knight', 'red', 348, 250, 'front', 'idle', 0.1);
  add('sword', 'red', 230, 330, 'front', 'idle', 0.3);
  // fallen
  add('piker', 'red', 88, 410, 'side', 'death', 0, { facing: -1, dead: true, fallT: 1.0 });
  add('crossbow', 'blue', 300, 500, 'side', 'death', 0, { facing: 1, dead: true, fallT: 1.0 });
  add('sword', 'red', 318, 350, 'side', 'death', 0, { facing: 1, dead: true, fallT: 1.0 });
  add('piker', 'blue', 70, 520, 'side', 'death', 0, { facing: -1, dead: true, fallT: 1.0 });
  return U;
}

function drawBattle(c, Wd, Ht, t, st, o = {}) {
  battleField(c, Wd, 96, 712, st);
  // tree line top + sides
  const trees = [];
  for (let i = 0; i < 9; i++) trees.push([-6 + i * 50 + (i % 2) * 14, 148 - (i % 2) * 10, 22 + (i % 3) * 3, i + 20]);
  trees.push([10, 300, 20, 31], [372, 420, 22, 32], [14, 610, 21, 33], [380, 640, 19, 34], [362, 180, 18, 35]);
  const U = battleUnits(t);
  const objs = [];
  for (const u of U) objs.push({ y: u.y, u });
  for (const tr of trees) objs.push({ y: tr[1], tree: tr });
  objs.sort((a, b) => a.y - b.y);
  // dead bodies first (ground layer)
  for (const ob of objs) if (ob.u && ob.u.dead) RTW.drawTroop(c, { type: ob.u.type, team: ob.u.team, x: ob.u.x, y: ob.u.y, size: 30, view: 'side', facing: ob.u.facing, anim: 'death', t: 1.0, alpha: 0.9, dpr: st.dpr });
  for (const ob of objs) {
    if (ob.tree) { W.tree(c, ob.tree[0], ob.tree[1], ob.tree[2], ob.tree[3]); continue; }
    const u = ob.u; if (u.dead) continue;
    let tt = t + u.ph * 2;
    if (u.type === 'crossbow' && u.anim === 'attack') tt = t * 0.9 + u.ph * 3;
    RTW.drawTroop(c, { type: u.type, team: u.team, x: u.x, y: u.y, size: 30, view: u.view, facing: u.facing || 1, anim: u.anim, t: tt, dpr: st.dpr });
  }
  // bolts in flight
  c.save();
  for (let i = 0; i < 7; i++) {
    const up = i % 2 === 0;
    const k = ((t * 1.3 + i * 0.37) % 1);
    const x0 = 120 + i * 24, y0 = up ? 520 : 290, x1 = 150 + ((i * 37) % 110), y1 = up ? 360 : 440;
    const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * 26;
    const a = Math.atan2((y1 - y0) - Math.cos(Math.PI * k) * 26 * Math.PI, x1 - x0);
    c.save(); c.translate(x, y); c.rotate(a);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, 0); c.lineTo(6, 0); c.stroke();
    c.strokeStyle = '#e9dcc0'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-8, 0); c.lineTo(6, 0); c.stroke();
    c.fillStyle = PAL.steelL; c.beginPath(); c.moveTo(6, -2); c.lineTo(10, 0); c.lineTo(6, 2); c.closePath(); c.fill();
    c.fillStyle = up ? TEAMS.blue.light : TEAMS.red.light; c.fillRect(-9, -2, 3, 4);
    c.restore();
  }
  // clash sparks
  for (let i = 0; i < 6; i++) {
    const k = (t * 1.6 + i * 0.43) % 1; if (k > 0.35) continue;
    const x = 110 + i * 38, y = 418 + (i % 2) * 8, r = 4 + k * 22;
    c.globalAlpha = 1 - k / 0.35;
    c.strokeStyle = '#fff6c8'; c.lineWidth = 2;
    for (let j = 0; j < 6; j++) { const a = j * 1.05 + i; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
  }
  c.restore();
  // HUD
  battleHudTop(c, Wd, t, o.time || 72, o.score || [50, 41]);
  UI.survivorStrip(c, 6, 718, Wd - 12, 120, o.blue || [14, 12, 8, 16], o.red || [11, 10, 5, 15]);
}

function battleHudTop(c, Wd, t, time, score) {
  UI.woodFill(c, 0, 0, Wd, 96, 21, PAL.wood3);
  c.fillStyle = INK; c.fillRect(0, 93, Wd, 3.5); c.fillStyle = PAL.gold; c.fillRect(0, 93.8, Wd, 2);
  UI.roundBtn(c, 28, 32, 18, 'pause');
  UI.roundBtn(c, Wd - 28, 32, 18, 'sound');
  const plaque = (x, w, team, n, label) => {
    const tm = TEAMS[team];
    c.beginPath(); rr(c, x, 12, w, 42, 10); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    const g = c.createLinearGradient(0, 12, 0, 54); g.addColorStop(0, tm.light); g.addColorStop(1, tm.dark); c.fillStyle = g; c.fill();
    c.beginPath(); rr(c, x + 3, 15, w - 6, 16, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill();
    text(c, label, x + w / 2, 23, { size: 9.5, font: F.head, weight: 900, fill: '#fff3d6', letter: 1.5 });
    text(c, String(n), x + w / 2, 42, { size: 20, weight: 700, fill: '#fff', stroke: INK, strokeW: 3.5 });
  };
  plaque(56, 84, 'blue', score[0], 'YOU');
  plaque(Wd - 140, 84, 'red', score[1], 'RIVAL');
  const mm = Math.floor(time / 60), ss = String(Math.floor(time % 60)).padStart(2, '0');
  UI.medallion(c, Wd / 2, 36, 27, `${mm}:${ss}`, time / 90, { size: 20, sub: 'BATTLE', ringCol: '#ffb4a8' });
  UI.stageBar(c, 10, 66, Wd - 20, 20, 'battle', 1 - time / 90);
}

SC.battle = function (c, Wd, Ht, t, st) { drawBattle(c, Wd, Ht, t, st); };

SC.cards = function (c, Wd, Ht, t, st) {
  drawBattle(c, Wd, Ht, 1.35, st, { time: 60, score: [46, 38], blue: [12, 11, 8, 15], red: [10, 9, 5, 14] });
  c.save();
  c.fillStyle = 'rgba(12,8,4,0.66)'; c.fillRect(0, 96, Wd, 616);
  UI.ribbon(c, Wd / 2, 206, 250, 46, 'CHOOSE A BONUS', PAL.gold, { fill: INK, strokeW: 0.01, size: 19 });
  text(c, 'Battle paused · 60 s left', Wd / 2, 250, { size: 14, weight: 600, fill: '#f6e6c4' });
  const cards = [
    { title: 'PIKER FURY', value: '+30%', desc: 'Piker attack\nfor the rest of battle', troop: 'piker', anim: 'attack', animT: 0.4, color: PAL.attack, badge: 'fist', valueCol: PAL.attackD, seed: 4 },
    { title: 'STEADY AIM', value: '+25%', desc: 'Crossbowman range\nfor the rest of battle', troop: 'crossbow', anim: 'attack', animT: 0.28, color: PAL.speed, badge: 'range', valueCol: '#9a6a10', seed: 5 },
    { title: 'SHIELD WALL', value: '+20%', desc: 'Defense for\nyour whole army', icon: 'shield', color: PAL.armor, valueCol: PAL.armorD, seed: 6 },
  ];
  const cw = 114, ch = 190, gap = (Wd - 16 - cw * 3) / 2;
  cards.forEach((cd, i) => {
    const hov = i === 0;
    const lift = hov ? -8 - Math.sin(t * 4) * 2 : 0;
    UI.card(c, 8 + i * (cw + gap), 282 + lift, cw, ch, cd, { highlight: hov });
  });
  // decision timer
  const left = 7 - ((t % 7));
  const cx = Wd / 2, cy = 548;
  c.beginPath(); circ(c, cx, cy, 30); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#2a190c'; c.fill();
  c.beginPath(); c.arc(cx, cy, 25, -Math.PI / 2, -Math.PI / 2 + TAU * (left / 7)); c.lineWidth = 7; c.strokeStyle = left < 3 ? PAL.attack : PAL.gold; c.stroke();
  text(c, String(Math.ceil(left)), cx, cy + 1, { size: 26, weight: 700, fill: '#fff6e0' });
  text(c, 'Commander picks when time runs out', cx, cy + 50, { size: 12.5, weight: 600, fill: '#e9d6b0' });
  c.restore();
};

SC.victory = function (c, Wd, Ht, t, st) {
  // sky + field
  const g = c.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#f7c56b'); g.addColorStop(0.45, '#f3dca0'); g.addColorStop(0.46, PAL.grass); g.addColorStop(1, PAL.grassD);
  c.fillStyle = g; c.fillRect(0, 0, Wd, Ht);
  c.fillStyle = W.grassPattern(c, 1); c.fillRect(0, Ht * 0.46, Wd, Ht * 0.54);
  // light rays
  c.save(); c.globalAlpha = 0.22; c.fillStyle = '#fff8dc';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + t * 0.1; c.beginPath(); c.moveTo(Wd / 2, 230); c.lineTo(Wd / 2 + Math.cos(a - 0.08) * 700, 230 + Math.sin(a - 0.08) * 700); c.lineTo(Wd / 2 + Math.cos(a + 0.08) * 700, 230 + Math.sin(a + 0.08) * 700); c.closePath(); c.fill(); }
  c.restore();
  // hills
  c.fillStyle = '#7fae6a'; c.beginPath(); c.moveTo(0, Ht * 0.47); c.quadraticCurveTo(Wd * 0.3, Ht * 0.39, Wd * 0.6, Ht * 0.45); c.quadraticCurveTo(Wd * 0.85, Ht * 0.5, Wd, Ht * 0.43); c.lineTo(Wd, Ht * 0.5); c.lineTo(0, Ht * 0.5); c.closePath(); c.fill();
  for (let i = 0; i < 8; i++) W.tree(c, 10 + i * 54, Ht * 0.49 + (i % 2) * 6, 18 + (i % 3) * 3, i + 40);
  // cheering troops
  const crew = [['knight', 70, 700], ['piker', 150, 740], ['sword', 215, 745], ['crossbow', 285, 738], ['piker', 345, 700], ['sword', 30, 770], ['crossbow', 110, 790], ['knight', 250, 800], ['piker', 360, 790]];
  crew.sort((a, b) => a[2] - b[2]).forEach(([ty, x, y], i) => RTW.drawTroop(c, { type: ty, team: 'blue', x, y, size: 44, view: 'front', anim: i % 2 ? 'idle' : 'attack', t: t + i * 0.3, dpr: st.dpr }));
  UI.ribbon(c, Wd / 2, 118, 270, 60, 'VICTORY', PAL.gold, { size: 32, fill: '#fffaf0' });
  // stars
  const pops = [0, 0.25, 0.5];
  pops.forEach((d, i) => {
    const k = easeOutBack(clamp((t % 5 - d) / 0.4));
    const r = (i === 1 ? 34 : 27) * (0.3 + 0.7 * k);
    ICON.star(c, Wd / 2 + (i - 1) * 76, 196 - (i === 1 ? 12 : 0), r, i < 2);
  });
  // stats panel
  UI.parch(c, 34, 262, Wd - 68, 238, 14, { rim: true, seed: 8 });
  text(c, 'LEVEL 2 · WEIGH THE DETOUR', Wd / 2, 294, { size: 13, font: F.head, weight: 900, fill: PAL.woodDark, letter: 1, maxW: Wd - 100 });
  const rows = [['Delivered to battle', '64', 'vs 58'], ['Survivors', '41', 'vs 0']];
  rows.forEach(([a, b, d], i) => {
    const y = 336 + i * 50;
    c.fillStyle = 'rgba(120,80,30,0.12)'; c.beginPath(); rr(c, 52, y - 20, Wd - 104, 40, 8); c.fill();
    text(c, a, 64, y, { size: 13.5, weight: 600, fill: '#5a4127', align: 'left' });
    text(c, b, Wd - 118, y, { size: 20, weight: 700, fill: TEAMS.blue.dark, align: 'right', maxW: 90 });
    text(c, d, Wd - 64, y, { size: 14, weight: 600, fill: TEAMS.red.dark, align: 'right', maxW: 60 });
  });
  c.fillStyle = 'rgba(120,80,30,0.12)'; c.beginPath(); rr(c, 52, 416, Wd - 104, 40, 8); c.fill();
  text(c, 'Cards chosen', 64, 436, { size: 13.5, weight: 600, fill: '#5a4127', align: 'left' });
  text(c, 'Piker Fury · Shield Wall', Wd - 64, 436, { size: 13, weight: 700, fill: TEAMS.blue.dark, align: 'right', maxW: 150 });
  text(c, '★ win  ·  ★★ keep half alive  ·  ★★★ wipe out the rival', Wd / 2, 482, { size: 11, weight: 600, fill: '#7a5a34', maxW: Wd - 90 });
  UI.button(c, 60, 532, Wd - 120, 58, 'NEXT LEVEL', 'gold', { size: 22 });
  UI.button(c, 110, 604, Wd - 220, 40, 'REPLAY', 'wood', { size: 16 });
};

/* ---------- title ---------- */
SC.title = function (c, Wd, Ht, t, st) {
  if (!st.titleBg) {
    const dpr = st.dpr || 1;
    const cv = mkCanvas(Wd * dpr, Ht * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
    const sky = g.createLinearGradient(0, 0, 0, Ht * 0.55); sky.addColorStop(0, '#2d4f93'); sky.addColorStop(0.5, '#e78e5b'); sky.addColorStop(1, '#ffd88a');
    g.fillStyle = sky; g.fillRect(0, 0, Wd, Ht);
    const sun = g.createRadialGradient(Wd * 0.7, Ht * 0.42, 5, Wd * 0.7, Ht * 0.42, 160); sun.addColorStop(0, 'rgba(255,245,200,0.95)'); sun.addColorStop(0.2, 'rgba(255,220,140,0.6)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = sun; g.fillRect(0, 0, Wd, Ht);
    // far mountains
    const layer = (col, base, amp, seed, step) => { const R = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, base); for (let x = 0; x <= Wd + step; x += step) g.lineTo(x, base - R() * amp); g.lineTo(Wd, Ht); g.closePath(); g.fill(); };
    layer('#8f7aa8', Ht * 0.46, 70, 3, 40);
    layer('#6f7fa6', Ht * 0.5, 40, 5, 30);
    // castle on hill
    g.fillStyle = '#4c5b82';
    const cx0 = Wd * 0.24, cy0 = Ht * 0.47;
    g.beginPath(); g.moveTo(cx0 - 70, Ht * 0.56); g.quadraticCurveTo(cx0, cy0 - 20, cx0 + 80, Ht * 0.56); g.fill();
    for (const [x, w, h] of [[-30, 18, 64], [-8, 34, 44], [24, 16, 74], [44, 14, 50]]) { g.fillRect(cx0 + x, cy0 - h, w, h + 20); for (let k = 0; k < w; k += 6) g.fillRect(cx0 + x + k, cy0 - h - 5, 3.5, 5); }
    g.fillStyle = '#3b7df2'; g.beginPath(); g.moveTo(cx0 + 32, cy0 - 74); g.lineTo(cx0 + 32, cy0 - 96); g.lineTo(cx0 + 48, cy0 - 90); g.lineTo(cx0 + 32, cy0 - 84); g.fill();
    // hills
    const hill = (col, y, a, s) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, y); g.bezierCurveTo(Wd * 0.3, y - a, Wd * 0.6, y + a * 0.6, Wd, y - a * 0.4); g.lineTo(Wd, Ht); g.closePath(); g.fill(); };
    hill('#5f9a55', Ht * 0.56, 30, 1);
    for (let i = 0; i < 12; i++) W.pine(g, i * 36 + (i % 2) * 10, Ht * 0.585 + (i % 3) * 4, 14 + (i % 3) * 2, i);
    hill(PAL.grass, Ht * 0.64, 40, 2);
    g.save(); g.globalAlpha = 0.6; g.fillStyle = W.grassPattern(g, 1); g.beginPath(); g.moveTo(0, Ht); g.lineTo(0, Ht * 0.64); g.bezierCurveTo(Wd * 0.3, Ht * 0.64 - 40, Wd * 0.6, Ht * 0.64 + 24, Wd, Ht * 0.64 - 16); g.lineTo(Wd, Ht); g.closePath(); g.fill(); g.restore();
    st.titleBg = cv;
  }
  c.drawImage(st.titleBg, 0, 0, Wd, Ht);
  // armies facing off
  const blue = [['knight', 64, 612], ['piker', 110, 640], ['sword', 70, 668], ['crossbow', 128, 686], ['piker', 36, 700]];
  const red = [['knight', 330, 600], ['piker', 286, 626], ['sword', 322, 650], ['crossbow', 270, 672], ['piker', 356, 684]];
  const all = blue.map((b) => [...b, 'blue', 1]).concat(red.map((r2) => [...r2, 'red', -1])).sort((a, b) => a[2] - b[2]);
  all.forEach(([ty, x, y, tm, f], i) => RTW.drawTroop(c, { type: ty, team: tm, x, y, size: 40, view: 'side', facing: f, anim: 'idle', t: t + i * 0.37, dpr: st.dpr }));
  // vs die in the middle
  const b = Math.abs(Math.sin(t * 2.4)) * 10;
  UI.die(c, Wd / 2, 640 - b, 44, RTW.DIE_FACES[Math.floor(t / 0.9) % 6], { rot: Math.sin(t * 2.4) * 0.3 });
  UI.logo(c, Wd / 2, 196, 330, t);
  text(c, 'Rally your brigade. Win the clash.', Wd / 2, 298, { size: 15, weight: 600, fill: '#fff6e0', stroke: 'rgba(40,20,10,0.6)', strokeW: 4 });
  UI.button(c, 70, 730, Wd - 140, 62, 'PLAY', 'gold', { size: 28, letter: 4 });
  UI.roundBtn(c, 36, 800, 20, 'gear');
  UI.roundBtn(c, Wd - 36, 800, 20, 'sound');
};

/* ---------- level select ---------- */
SC.levels = function (c, Wd, Ht, t, st) {
  UI.woodFill(c, 0, 0, Wd, Ht, 5, PAL.wood3);
  UI.parch(c, 12, 88, Wd - 24, 560, 16, { rim: true, seed: 9 });
  // map drawings
  c.save(); c.beginPath(); rr(c, 16, 92, Wd - 32, 552, 14); c.clip();
  c.globalAlpha = 0.9;
  const R = rng(4);
  for (let i = 0; i < 16; i++) { const x = 30 + R() * (Wd - 60), y = 110 + R() * 520; if (Math.abs(x - Wd / 2) < 70) continue; W.tree(c, x, y, 9 + R() * 5, i + 60, -0.05); }
  W.rock(c, 90, 330, 7, 1); W.rock(c, 300, 470, 6, 2);
  // river
  c.globalAlpha = 0.6; c.strokeStyle = '#7fb6d9'; c.lineWidth = 12; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-10, 250); c.bezierCurveTo(100, 280, 150, 200, 260, 230); c.bezierCurveTo(330, 250, 360, 220, 420, 240); c.stroke();
  c.globalAlpha = 1;
  // dotted path
  const pts = [[Wd / 2 - 60, 566], [Wd / 2 + 30, 500], [Wd / 2 - 70, 430], [Wd / 2 - 50, 372], [Wd / 2 + 40, 290], [Wd / 2 - 20, 220], [Wd / 2 - 60, 170]];
  c.strokeStyle = '#8a5a2b'; c.lineWidth = 4; c.setLineDash([2, 9]); c.lineCap = 'round';
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; c.quadraticCurveTo(x0 + (x1 - x0) * 0.1 + 30 * (i % 2 ? 1 : -1), (y0 + y1) / 2, x1, y1); } c.stroke();
  c.setLineDash([]);
  c.restore();
  const nodes = [
    { n: 1, name: 'Learn the Flow', x: Wd / 2 - 60, y: 566, stars: 3, state: 'done' },
    { n: 2, name: 'Weigh the Detour', x: Wd / 2 - 50, y: 372, stars: 1, state: 'current' },
    { n: 3, name: 'Beat the Cutoff', x: Wd / 2 - 60, y: 170, stars: 0, state: 'locked' },
  ];
  for (const nd of nodes) {
    const cur = nd.state === 'current', pulse = cur ? 1 + Math.sin(t * 4) * 0.05 : 1;
    if (cur) { c.save(); const gg = c.createRadialGradient(nd.x, nd.y, 10, nd.x, nd.y, 70); gg.addColorStop(0, 'rgba(255,220,120,0.7)'); gg.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gg; c.beginPath(); circ(c, nd.x, nd.y, 70); c.fill(); c.restore(); }
    const r = 34 * pulse;
    c.beginPath(); circ(c, nd.x, nd.y + 4, r); c.fillStyle = 'rgba(40,20,5,0.35)'; c.fill();
    c.beginPath(); circ(c, nd.x, nd.y, r); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    const tm = nd.state === 'locked' ? { light: '#b7ab96', dark: '#6f6454' } : TEAMS.blue;
    const gg = c.createLinearGradient(0, nd.y - r, 0, nd.y + r); gg.addColorStop(0, tm.light); gg.addColorStop(1, tm.dark); c.fillStyle = gg; c.fill();
    c.beginPath(); circ(c, nd.x, nd.y, r - 5); c.lineWidth = 3; c.strokeStyle = PAL.gold; c.stroke();
    if (nd.state === 'locked') ICON.lock(c, nd.x, nd.y + 2, 34);
    else text(c, String(nd.n), nd.x, nd.y + 2, { size: 30, font: F.head, weight: 900, fill: '#fff', stroke: INK, strokeW: 4 });
    for (let k = 0; k < 3; k++) ICON.star(c, nd.x - 26 + k * 26, nd.y + r + 12 - (k === 1 ? 4 : 0), 11, k < nd.stars);
    UI.ribbon(c, nd.x + 112, nd.y - 6, 120, 28, nd.name, nd.state === 'locked' ? '#b9a88a' : PAL.gold, { size: 12, fill: INK, strokeW: 0.01, letter: 0.5, font: F.body });
  }
  // header
  UI.panel(c, 10, 12, Wd - 20, 62, 14, { seed: 7 });
  text(c, 'CAMPAIGN', Wd / 2, 44, { size: 26, font: F.head, weight: 900, grad: ['#fff6cf', '#ffd76a', '#d7901f'], stroke: INK, strokeW: 5, letter: 3 });
  UI.roundBtn(c, 42, 43, 17, 'gear');
  // bottom panel
  UI.panel(c, 10, 660, Wd - 20, 172, 16, { seed: 12 });
  text(c, 'LEVEL 2 · WEIGH THE DETOUR', Wd / 2, 688, { size: 14, font: F.head, weight: 900, fill: PAL.goldL, letter: 1, maxW: Wd - 60 });
  const chips = [['×2 ×2', PAL.gate2D], ['×3', PAL.gate3D], ['Armor · Speed · Attack', '#6b4a2b']];
  let cx = 26;
  chips.forEach(([s, col]) => { const w = textWidth(c, s, 12, F.body, 700) + 18; c.beginPath(); rr(c, cx, 702, w, 22, 11); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); text(c, s, cx + w / 2, 713.5, { size: 12, weight: 700, fill: '#fff' }); cx += w + 8; });
  text(c, 'Rival: Steady Commander · Best: ★', 26, 742, { size: 12.5, weight: 600, fill: '#f0dfbd', align: 'left' });
  UI.button(c, 26, 758, Wd - 52, 58, 'BEGIN RALLY', 'gold', { size: 22 });
};

/* ---------- sheet cells ---------- */
SC.troop = function (c, Wd, Ht, t, st) {
  const p = st.params || {};
  const type = p.type || 'piker', team = p.team || 'blue', view = p.view || 'side';
  let anim = p.anim || 'walk', tt = t;
  if (anim === 'cycle') {
    const seq = [['idle', 1.4], ['walk', 2.2], ['attack', type === 'crossbow' ? 3.2 : 2.2], ['hit', 0.6], ['death', 2.2]];
    const tot = seq.reduce((a, b) => a + b[1], 0); let k = t % tot;
    for (const [a, d] of seq) { if (k < d) { anim = a; tt = k; break; } k -= d; }
    st.label = anim;
  }
  if (anim === 'death') tt = tt % 2.4;
  if (anim === 'hit') tt = tt % 0.9;
  const size = +(p.size || Ht * 0.52);
  const bgc = p.bg || 'pave';
  if (bgc === 'pave') {
    if (!st.cellBg) {
      const dpr = st.dpr || 1, cv = mkCanvas(Wd * dpr, Ht * dpr), g = cv.getContext('2d'); g.scale(dpr, dpr);
      const T2 = 58, cols = Math.ceil(Wd / T2) + 1, rows = Math.ceil(Ht / T2) + 1, ox = (Wd - cols * T2) / 2, oy = Ht - rows * T2 + T2 * 0.35;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) W.paveTile(g, ox + q * T2, oy + r * T2, T2, q + 7, r + 3, 5);
      const vg = g.createRadialGradient(Wd / 2, Ht * 0.6, Math.min(Wd, Ht) * 0.3, Wd / 2, Ht * 0.6, Math.max(Wd, Ht) * 0.8);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,40,20,0.28)'); g.fillStyle = vg; g.fillRect(0, 0, Wd, Ht);
      st.cellBg = cv;
    }
    c.drawImage(st.cellBg, 0, 0, Wd, Ht);
  }
  else if (bgc === 'grass') { c.fillStyle = W.grassPattern(c, 1); c.fillRect(0, 0, Wd, Ht); }
  const fy = +(p.feet || 0.86) * Ht;
  const fx = p.x ? +p.x * Wd : Wd / 2 + (type === 'knight' && view === 'side' ? -size * 0.08 : 0);
  RTW.drawTroop(c, { type, team, x: fx, y: fy, size: type === 'knight' ? size * 0.78 : size, view, facing: +(p.facing || 1), anim, t: tt, dpr: st.dpr });
  if (p.showlabel) text(c, anim.toUpperCase(), Wd / 2, 14, { size: 11, font: F.head, weight: 900, fill: PAL.woodDark, letter: 1 });
};

SC.kit = function (c, Wd, Ht, t, st) {
  const p = st.params || {}, item = p.item;
  const T = +(p.tile || 64);
  const floor = (cols, rows) => { const ox = (Wd - cols * T) / 2, oy = (Ht - rows * T) / 2 + T * 0.15; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) W.paveTile(c, ox + q * T, oy + r * T, T, q + 3, r + 5, 2); return [ox, oy]; };
  c.fillStyle = W.grassPattern(c, 1); c.fillRect(0, 0, Wd, Ht);
  if (item === 'pave') { floor(2, 2); }
  else if (item === 'block') {
    const [ox, oy] = floor(3, 2);
    const map = { rows: 2, cols: 3, grid: ['##.', '.#.'] };
    for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) if (map.grid[r][q] === '#') W.drawBlock(c, ox + q * T, oy + r * T, T, T * 0.3, W.blockNb(map, r, q), st.dpr || 1, r * 3 + q);
  }
  else if (item === 'marker') { const [ox, oy] = floor(2, 1); W.turnMarker(c, ox + T * 0.5, oy + T * 0.5, T, 'right'); W.turnMarker(c, ox + T * 1.5, oy + T * 0.5, T, 'up'); }
  else if (item === 'gate2' || item === 'gate3') { const [ox, oy] = floor(1, 2); W.gate(c, ox + T * 0.5, oy + T * 1.1, T, item === 'gate3' ? 3 : 2, t); }
  else if (['armor', 'speed', 'attack'].includes(item)) { const [ox, oy] = floor(1, 1); W.pickup(c, ox + T * 0.5, oy + T * 0.66, T, item, t); }
  else if (item === 'house' || item === 'house-red') {
    const types = ['piker', 'crossbow', 'knight', 'sword'], sp = Wd / 4, hw = Math.min(sp * 0.84, 120);
    const oy = Ht - 26; for (let q = 0; q < Math.ceil(Wd / T) + 1; q++) W.paveTile(c, q * T - 10, oy, T, q, 1, 3);
    types.forEach((ty, i) => W.house(c, sp * (i + 0.5), oy + 2, hw, ty, item === 'house' ? 'blue' : 'red', t, [9, 6, 4, 7][i]));
  }
  else if (item === 'entrance') { floor(3, 1); W.entrance(c, Wd / 2, Ht - 16, 150, t); }
  else if (item === 'forest') { W.tree(c, Wd * 0.22, Ht * 0.86, 30, 3); W.pine(c, Wd * 0.5, Ht * 0.88, 26, 2); W.tree(c, Wd * 0.78, Ht * 0.86, 26, 8, -0.1); W.bush(c, Wd * 0.36, Ht * 0.95, 14, 4); W.rock(c, Wd * 0.64, Ht * 0.94, 10, 2); }
  else if (item === 'status') {
    // pickup feedback on a soldier: halo, badges, speed trail
    const [ox, oy] = floor(3, 1);
    const cy = oy + T * 0.8;
    const k = (t % 1.2) / 1.2;
    c.save(); c.globalAlpha = 1 - k; c.strokeStyle = PAL.armor; c.lineWidth = 3; c.beginPath(); ell(c, ox + T * 0.5, cy, 14 + k * 20, 5 + k * 7); c.stroke(); c.restore();
    RTW.drawTroop(c, { type: 'sword', team: 'blue', x: ox + T * 0.5, y: cy, size: 44, view: 'side', anim: 'walk', t, dpr: st.dpr });
    ICON.shield(c, ox + T * 0.5 + 12, cy - 50, 14);
    c.save(); c.strokeStyle = rgba(PAL.speed, 0.7); c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(ox + T * 1.5 - 14, cy - 10 - i * 11); c.lineTo(ox + T * 1.5 - 40, cy - 10 - i * 11); c.stroke(); } c.restore();
    RTW.drawTroop(c, { type: 'crossbow', team: 'blue', x: ox + T * 1.5, y: cy, size: 44, view: 'side', anim: 'walk', t: t * 1.5, dpr: st.dpr });
    ICON.boot(c, ox + T * 1.5 + 14, cy - 48, 16);
    const gl = 0.5 + 0.5 * Math.sin(t * 6);
    c.save(); const rg = c.createRadialGradient(ox + T * 2.5, cy - 22, 2, ox + T * 2.5, cy - 22, 30); rg.addColorStop(0, rgba(PAL.attack, 0.35 + 0.25 * gl)); rg.addColorStop(1, rgba(PAL.attack, 0)); c.fillStyle = rg; c.beginPath(); ell(c, ox + T * 2.5, cy - 22, 26, 34); c.fill(); c.restore();
    RTW.drawTroop(c, { type: 'piker', team: 'blue', x: ox + T * 2.5, y: cy, size: 44, view: 'side', anim: 'walk', t: t + 0.3, dpr: st.dpr });
    ICON.fist(c, ox + T * 2.5 + 14, cy - 50, 14);
  }
};

SC.ui = function (c, Wd, Ht, t, st) {
  const p = st.params || {}, item = p.item;
  if (p.bg !== 'none') { UI.woodFill(c, 0, 0, Wd, Ht, 9, PAL.wood3); }
  if (item === 'dice') {
    const faces = ['r1', 'r2', 's1', 's2'];
    faces.forEach((f, i) => UI.die(c, Wd * (0.125 + i * 0.25), Ht * 0.5, Math.min(Ht * 0.62, Wd * 0.17), f));
  } else if (item === 'dieroll') {
    const k = t % 2.4, roll = k < 0.9;
    const f = roll ? RTW.DIE_FACES[Math.floor(t * 14) % 6] : RTW.DIE_FACES[Math.floor(t / 2.4) % 6];
    const y = Ht * 0.5 - (roll ? Math.abs(Math.sin(k * 7)) * Ht * 0.18 * (1 - k / 0.9) : 0);
    UI.die(c, Wd * 0.5, y, Ht * 0.56, f, { rot: roll ? Math.sin(t * 25) * 0.7 : 0, selected: !roll && k > 1.4 });
  } else if (item === 'crews') {
    const types = ['piker', 'crossbow', 'knight', 'sword'];
    const dice = [['r1', 'r2'], ['s1'], ['s2', 's1', 'r1', 'r1'], []];
    const cw = 96, gap = (Wd - 24 - cw * 4) / 3;
    types.forEach((ty, i) => UI.crewCard(c, 12 + i * (cw + gap), Ht - 110, cw, 96, ty, { dice: dice[i], eligible: i === 1, t }));
  } else if (item === 'buttons') {
    UI.button(c, 16, 18, Wd * 0.46, 54, 'PLAY', 'gold', { size: 24, letter: 3 });
    UI.button(c, Wd * 0.52, 18, Wd * 0.44, 54, 'BEGIN RALLY', 'blue', { size: 17 });
    UI.button(c, 16, 88, Wd * 0.3, 42, 'REPLAY', 'wood', { size: 15 });
    UI.button(c, Wd * 0.36, 88, Wd * 0.3, 42, 'RETREAT', 'red', { size: 15 });
    UI.roundBtn(c, Wd * 0.76, 109, 20, 'pause'); UI.roundBtn(c, Wd * 0.88, 109, 20, 'sound');
  } else if (item === 'hud') {
    UI.medallion(c, 54, Ht / 2, 32, '0:45', 0.5, { size: 22, sub: 'RALLY' });
    UI.stageBar(c, 110, Ht / 2 - 26, Wd - 126, 20, 'rally', 0.5);
    UI.stageBar(c, 110, Ht / 2 + 8, Wd - 126, 20, 'battle', 0.35);
  } else if (item === 'cards') {
    const cards = [
      { title: 'PIKER FURY', value: '+30%', desc: 'Piker attack\nfor the rest of battle', troop: 'piker', anim: 'attack', animT: 0.4, color: PAL.attack, badge: 'fist', valueCol: PAL.attackD, seed: 4 },
      { title: 'STEADY AIM', value: '+25%', desc: 'Crossbowman range\nfor the rest of battle', troop: 'crossbow', anim: 'attack', animT: 0.28, color: PAL.speed, badge: 'range', valueCol: '#9a6a10', seed: 5 },
      { title: 'SHIELD WALL', value: '+20%', desc: 'Defense for\nyour whole army', icon: 'shield', color: PAL.armor, valueCol: PAL.armorD, seed: 6 },
      { title: 'LANCE CHARGE', value: '×2', desc: 'Knight first hit\nafter each charge', troop: 'knight', anim: 'attack', animT: 0.4, color: TEAMS.blue.main, badge: 'fist', valueCol: TEAMS.blue.dark, seed: 7 },
    ];
    const cw = (Wd - 16 * 5) / 4;
    cards.forEach((cd, i) => UI.card(c, 16 + i * (cw + 16), 16, cw, Ht - 32, cd, { highlight: i === 0 }));
  } else if (item === 'strip') {
    UI.survivorStrip(c, 8, 8, Wd - 16, Ht - 16, [14, 12, 8, 16], [11, 10, 0, 15]);
  } else if (item === 'logo') {
    const g = c.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, '#2d4f93'); g.addColorStop(1, '#e78e5b'); c.fillStyle = g; c.fillRect(0, 0, Wd, Ht);
    UI.logo(c, Wd / 2, Ht / 2 + 10, Math.min(Wd * 0.86, 360), t);
  } else if (item === 'icons') {
    const n = 7, sx = Wd / (n + 1);
    ICON.shield(c, sx * 1, Ht / 2, 44); ICON.boot(c, sx * 2 + 4, Ht / 2 + 8, 46); ICON.fist(c, sx * 3, Ht / 2, 44);
    ICON.crew(c, sx * 4, Ht / 2, 46, 'piker'); ICON.crew(c, sx * 5, Ht / 2, 46, 'crossbow'); ICON.crew(c, sx * 6, Ht / 2, 46, 'knight'); ICON.crew(c, sx * 7, Ht / 2, 46, 'sword');
  } else if (item === 'ribbons') {
    UI.ribbon(c, Wd * 0.28, Ht * 0.5, Wd * 0.4, 46, 'VICTORY', PAL.gold, { size: 22 });
    UI.ribbon(c, Wd * 0.74, Ht * 0.5, Wd * 0.34, 46, 'DEFEAT', '#8f8f99', { size: 22 });
  }
};

/* ===== src/art/99-mount.js ===== */
/* ---------- auto mount ---------- */
const mounted = new WeakSet();
const running = new Set();
function fontsReady() { try { return document.fonts ? document.fonts.ready : Promise.resolve(); } catch (e) { return Promise.resolve(); } }
RTW.mount = function (cv) {
  if (mounted.has(cv)) return;
  const name = cv.getAttribute('data-rtw');
  const fn = SC[name]; if (!fn) return;
  mounted.add(cv);
  const w = +(cv.getAttribute('data-w') || cv.clientWidth || cv.width), h = +(cv.getAttribute('data-h') || cv.clientHeight || cv.height);
  const dpr = Math.min(2, Math.max(1, cv.width / w));
  const st = { dpr, params: Object.assign({}, cv.dataset) };
  const c = cv.getContext('2d');
  const tFix = cv.getAttribute('data-t');
  const job = { cv, c, fn, w, h, st, t0: performance.now(), visible: true, last: 0, fixed: tFix != null ? +tFix : null };
  const draw = (now) => {
    const t = job.fixed != null ? job.fixed : (now - job.t0) / 1000;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    try { fn(c, w, h, t, st); } catch (e) { console.error('scene ' + name, e); }
  };
  job.draw = draw;
  draw(performance.now());
  if (job.fixed == null) running.add(job);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => (job.visible = e.isIntersecting))); io.observe(cv); }
  const reset = () => { for (const k of ['floor', 'bf', 'titleBg']) st[k] = null; draw(performance.now()); };
  fontsReady().then(reset);
  try {
    if (document.fonts && document.fonts.load) Promise.all(['900 40px "Cinzel Decorative"', '900 20px "Cinzel"', '700 20px "Signika"', '600 14px "Signika"'].map((f) => document.fonts.load(f))).then(reset, () => {});
  } catch (e) {}
};
let rafOn = false;
function loop(now) {
  for (const job of running) {
    if (!job.cv.isConnected) { running.delete(job); continue; }
    if (!job.visible || document.hidden) continue;
    if (now - job.last < 32) continue;
    job.last = now; job.draw(now);
  }
  requestAnimationFrame(loop);
}
RTW.scan = function (root) {
  (root || document).querySelectorAll('canvas[data-rtw]').forEach(RTW.mount);
  if (!rafOn) { rafOn = true; requestAnimationFrame(loop); }
};
if (typeof document !== 'undefined' && !window.RTW_NO_AUTOMOUNT) {
  const go = () => {
    RTW.scan();
    try { new MutationObserver(() => RTW.scan()).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setInterval(() => RTW.scan(), 1500);
}


/* ===== exports for Bounce Battle ===== */
RTW.text = text; RTW.rr = rr; RTW.circ = circ; RTW.ell = ell; RTW.ink = ink; RTW.shade = shade;
RTW.battleField = battleField; RTW.stake = stake;
RTW.HER = HER; RTW.smokePuffs = smokePuffs;

})();
