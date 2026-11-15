'use strict';
/* 캔버스 벡터 그래픽 — 외곽선 없는 플랫 벡터: 2~3단 명암, 관절 리그, 겹겹이 쌓인 배경 */
const Art = {};
Art.HAIRS = ['단발', '긴 머리', '양갈래', '삐죽', '포니테일'];
Art.ACCS = ['없음', '리본', '마법사 모자', '꽃', '왕관', '고글'];
const TAU = Math.PI * 2;
const rr = (x, a, b, w, h, r) => { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
const _rgb = c => { if (c[0] === '#') { const n = parseInt(c.length === 4 ? c.slice(1).replace(/./g, '$&$&') : c.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; } const m = c.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]]; };
const _mc = new Map();
const mix = (a, b, k) => { const key = a + b + k; let v = _mc.get(key); if (!v) { const p = _rgb(a), q = _rgb(b); v = `rgb(${Math.round(p[0] + (q[0] - p[0]) * k)},${Math.round(p[1] + (q[1] - p[1]) * k)},${Math.round(p[2] + (q[2] - p[2]) * k)})`; _mc.set(key, v); } return v; };
/* 그림자는 검정이 아니라 보라 쪽으로, 빛은 따뜻한 쪽으로 */
const dk = (c, k = .32) => mix(c, '#2a0f5e', k);
const lt = (c, k = .3) => mix(c, '#fff3cf', k);
const shade = (hex, k) => k < 1 ? dk(hex, (1 - k) * 1.1) : lt(hex, k - 1);
const hash = i => { let v = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b); v ^= v >>> 13; v = Math.imul(v, 0xc2b2ae35); return ((v ^ v >>> 16) >>> 0) / 4294967296; };
const circ = (x, cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); };
const ell = (x, cx, cy, a, b, rot = 0) => { x.beginPath(); x.ellipse(cx, cy, a, b, rot, 0, TAU); x.fill(); };
const poly = (x, p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.closePath(); x.fill(); };
const easeIO = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const backOut = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
Art.ease = { io: easeIO, back: backOut };
Art.mix = mix; Art.dk = dk; Art.lt = lt;

/* 두 마디 팔다리: 각도 0 = 아래, + = 앞쪽 */
const limb = (x, x0, y0, a1, l1, a2, l2, w, col, w2) => {
  const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1, x2 = x1 + Math.sin(a1 + a2) * l2, y2 = y1 + Math.cos(a1 + a2) * l2;
  x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
  x.lineWidth = w2 || w * .86; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
  return [x2, y2, a1 + a2];
};
const aglow = (x, cx, cy, r, col, a = .5) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, mix(col, '#ffffff', .3).replace('rgb', 'rgba').replace(')', `,${a})`)); g.addColorStop(1, col.replace('rgb', 'rgba').replace(')', ',0)')); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); };
const rgbOf = c => mix(c, c, 0);
const spark = (x, cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); };

/* ---------- 캐릭터 리그 ----------
   hero: 조율사 (둥근 큰 머리, 망토) / ignis: 어깨 넓은 거구 기관사 / clausia: 다리 없는 로브의 얼음 마법사 / resona: 통통 튀는 꼬마 음유시인 */
const RIGS = {
  hero: { headR: 14.5, bw: 16, bh: 16, leg: 10, arm: 11, hip: 4.5, bob: 1.8, stride: .75, pace: 11, lw: 5.4, aw: 4.4, sc: 1 },
  ignis: { headR: 11.5, bw: 30, bh: 25, leg: 12, arm: 17, hip: 8, bob: 2.6, stride: .5, pace: 7, lw: 8.5, aw: 8, sc: 1.2 },
  clausia: { headR: 12, bw: 13, bh: 27, leg: 0, arm: 10, hip: 0, bob: 0, stride: 0, pace: 0, lw: 0, aw: 3.6, sc: 1.02, float: 1 },
  resona: { headR: 14, bw: 17, bh: 12, leg: 6, arm: 8.5, hip: 4, bob: 0, stride: .5, pace: 9, lw: 4.6, aw: 4, sc: .84, float: 1 }
};
const eyeDot = (x, ex, ey, r, blink, col) => {
  x.fillStyle = '#2a1746';
  if (blink) { x.beginPath(); x.ellipse(ex, ey, r * 1.1, r * .22, 0, 0, TAU); x.fill(); return; }
  x.beginPath(); x.ellipse(ex, ey, r, r * 1.25, 0, 0, TAU); x.fill();
  if (col) { x.fillStyle = col; x.beginPath(); x.ellipse(ex, ey + r * .3, r * .62, r * .7, 0, 0, TAU); x.fill(); }
  x.fillStyle = '#fff'; circ(x, ex + r * .32, ey - r * .5, r * .38);
};
const hairBack = (x, L, R, hy, sway, hair, hairD) => {
  const st = L.hairStyle | 0; x.fillStyle = hairD;
  if (st === 1) { x.beginPath(); x.moveTo(-R - 1, hy - 2); x.quadraticCurveTo(-R - 6 - sway * 3, hy + R * 1.5, -R + 2 - sway * 6, hy + R * 2.3); x.quadraticCurveTo(-2 - sway * 4, hy + R * 2.1, R - 4 - sway * 3, hy + R * 2.2); x.quadraticCurveTo(R + 3, hy + R, R, hy - 2); x.closePath(); x.fill(); }
  if (st === 2) for (const d of [-1, 1]) { x.save(); x.translate(d * (R + 1), hy - 2); x.rotate(d * .25 - sway * .5); x.beginPath(); x.moveTo(-4, 0); x.quadraticCurveTo(-8, R, -3, R * 1.6); x.quadraticCurveTo(1, R * 1.9, 4, R * 1.5); x.quadraticCurveTo(8, R * .8, 4, 0); x.closePath(); x.fill(); x.restore(); }
  if (st === 4) { x.save(); x.translate(-R + 1, hy - 5); x.rotate(.55 - sway * .7); x.beginPath(); x.moveTo(-3, -2); x.quadraticCurveTo(-13, R * .8, -6, R * 1.9); x.quadraticCurveTo(1, R * 1.4, 4, 0); x.closePath(); x.fill(); x.restore(); }
};
const hairFront = (x, L, R, hy, sway, hair, hairD, hairL) => {
  const st = L.hairStyle | 0;
  x.fillStyle = hair; x.beginPath(); x.arc(0, hy, R + 1.2, Math.PI * .98, Math.PI * 2.02);
  x.quadraticCurveTo(R - 1, hy + 3, R - 5, hy - 4); x.quadraticCurveTo(R - 8, hy + 4, R - 12, hy - 3); x.quadraticCurveTo(R - 15, hy + 3, R - 19, hy - 4); x.quadraticCurveTo(-R + 4, hy + 5, -R - 1.2, hy + 2); x.closePath(); x.fill();
  if (st === 3) { for (let i = -2; i <= 2; i++) { const bx = i * R * .42, tip = R * (.75 + (i === 0 ? .25 : 0) + (i & 1 ? .1 : 0)); x.beginPath(); x.moveTo(bx - R * .3, hy - R * .72); x.quadraticCurveTo(bx - 1, hy - R - tip * .6, bx + i * 2 - sway * 3, hy - R - tip); x.quadraticCurveTo(bx + 3, hy - R - tip * .4, bx + R * .3, hy - R * .72); x.closePath(); x.fill(); } }
  if (st === 2) { x.fillStyle = '#ff7aa8'; for (const d of [-1, 1]) circ(x, d * (R + .5), hy - 3, 3.2); }
  if (st === 4) { x.fillStyle = '#ffd166'; circ(x, -R + 1, hy - 5, 2.8); }
  x.fillStyle = hairL; x.beginPath(); x.ellipse(-R * .25, hy - R * .72, R * .5, R * .16, -.25, 0, TAU); x.fill();
};
const accDraw = (x, a, R, hy, sway) => {
  if (a === 1) { x.fillStyle = '#ff5f8f'; poly(x, [R * .5, hy - R * .9, R * 1.25, hy - R * 1.35, R * 1.15, hy - R * .55]); poly(x, [R * .5, hy - R * .9, -R * .15, hy - R * 1.35, -R * .05, hy - R * .6]); x.fillStyle = '#ffd1dc'; circ(x, R * .5, hy - R * .9, 2.6); }
  if (a === 2) { const c = '#40238f'; x.fillStyle = dk(c, .3); ell(x, 0, hy - R * .78, R * 1.5, R * .32); x.fillStyle = c; x.beginPath(); x.moveTo(-R * .85, hy - R * .82); x.quadraticCurveTo(-R * .2, hy - R * 2.1, R * .5 - sway * 6, hy - R * 2.7); x.quadraticCurveTo(R * .55, hy - R * 1.6, R * .85, hy - R * .82); x.closePath(); x.fill(); x.fillStyle = '#ffcf4a'; x.beginPath(); x.moveTo(-R * .82, hy - R * .9); x.quadraticCurveTo(0, hy - R * .68, R * .82, hy - R * .9); x.lineTo(R * .76, hy - R * 1.12); x.quadraticCurveTo(0, hy - R * .9, -R * .76, hy - R * 1.12); x.closePath(); x.fill(); spark(x, R * .5 - sway * 6, hy - R * 2.7, 3, '#fff3b0'); }
  if (a === 3) { x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) circ(x, R * .75 + Math.cos(i * 1.257) * 3.6, hy - R * .75 + Math.sin(i * 1.257) * 3.6, 2.7); x.fillStyle = '#ffcf4a'; circ(x, R * .75, hy - R * .75, 2.1); }
  if (a === 4) { x.fillStyle = '#ffcf4a'; poly(x, [-R * .6, hy - R * .88, -R * .68, hy - R * 1.55, -R * .32, hy - R * 1.18, 0, hy - R * 1.7, R * .32, hy - R * 1.18, R * .68, hy - R * 1.55, R * .6, hy - R * .88]); x.fillStyle = '#ff4f6d'; circ(x, 0, hy - R * 1.15, 1.8); x.fillStyle = '#fff3b0'; x.fillRect(-R * .6, hy - R * .98, R * 1.2, 2); }
  if (a === 5) { x.fillStyle = '#5a3a2a'; rr(x, -R - .5, hy - R * .82, R * 2 + 1, 3.6, 1.8); x.fill(); for (const d of [-.42, .48]) { x.fillStyle = '#c48a2c'; circ(x, d * R + 2, hy - R * .7, 5.2); x.fillStyle = '#7fe6ff'; circ(x, d * R + 2, hy - R * .7, 3.5); x.fillStyle = '#fff'; circ(x, d * R + 3.2, hy - R * .7 - 1.3, 1.1); } }
};

Art.chibi = (x, X, Y, s, L, o = {}) => {
  const kind = RIGS[L.rig] ? L.rig : 'hero', R = RIGS[kind], t = o.t || 0, walk = !!o.walk, fly = !!L.wings || R.float, air = !!o.air && !fly;
  const out = L.outfit || '#6a3fa0', outD = dk(out, .36), outL = lt(out, .28), hair = L.hair || '#5a4a8a', hairD = dk(hair, .34), hairL = lt(hair, .4), skin = L.skin || '#f6d9c0', skinD = mix(skin, '#c2557a', .28);
  const ph = t * (R.pace || 9), sw = walk && !fly ? Math.sin(ph) : 0, cw = walk && !fly ? Math.cos(ph) : 0;
  const breath = Math.sin(t * 2.3 + (kind.length)) * .5 + .5;
  const sway = walk ? Math.sin(ph - .9) * .9 : Math.sin(t * 1.7) * .25;
  const blink = ((t * .31 + kind.length * .17) % 1) > .955 || (((t * .31 + kind.length * .17) % 1) > .5 && ((t * .31 + kind.length * .17) % 1) < .512);
  let hov = 0, tiltB = walk ? .09 : 0;
  if (kind === 'clausia') hov = Math.sin(t * 1.7) * 4 - 9;
  else if (kind === 'resona') hov = walk ? -Math.abs(Math.sin(t * 6.5)) * 9 - 5 : -Math.abs(Math.sin(t * 3.1)) * 4 - 6;
  else if (fly) hov = Math.sin(t * 3.4) * 3 - 9;
  const bob = fly ? 0 : walk ? -Math.abs(sw) * R.bob : -breath * .5;
  x.save(); x.translate(X, Y); x.scale(s * R.sc * (o.dir < 0 ? -1 : 1), s * R.sc);
  x.translate(0, hov);
  if (air) { x.scale(.95, 1.06); }
  x.lineCap = 'round'; x.lineJoin = 'round';
  const hipY = -R.leg - 1, shY = hipY - R.bh + 3 + bob, headY = shY - R.headR * .82 + (walk ? Math.sin(ph * 2 - .6) * .5 : -breath * .5);

  /* --- 뒤쪽 소품 --- */
  if (kind === 'hero') {
    if (fly) { const f = Math.sin(t * 22) * .35; for (const d of [-1, 1]) { x.save(); x.translate(-3, shY + 4); x.rotate(-.5 + d * .28 + f * d); x.fillStyle = L.wingColor || 'rgba(190,235,255,.75)'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-22, -24, -30, -6); x.quadraticCurveTo(-22, 4, 0, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-18, -12, -26, -6); x.quadraticCurveTo(-16, -2, 0, 0); x.fill(); x.restore(); } }
    else { /* 망토: 걸을 때 뒤로 휘날림 */ const cp = walk ? 1 : 0, w1 = Math.sin(t * (walk ? 9 : 2) + 1) * (walk ? 2.6 : .8); x.fillStyle = dk(out, .52); x.beginPath(); x.moveTo(-5, shY + 1); x.quadraticCurveTo(-13 - cp * 5, shY + 9, -12 - cp * 9 + w1, hipY + 7 - cp * 3); x.quadraticCurveTo(-8 - cp * 5, hipY + 8, -3, hipY + 3); x.closePath(); x.fill(); }
  }
  if (kind === 'ignis') { /* 등짐 보일러와 큰 렌치 */
    x.fillStyle = '#5b2a72'; rr(x, -22, shY + 2, 12, 20, 4); x.fill(); x.fillStyle = '#ffb02e'; rr(x, -21, shY + 9, 10, 3, 1.5); x.fill(); x.fillStyle = '#7a3c94'; rr(x, -19, shY - 7, 5, 11, 2); x.fill();
    for (let i = 0; i < 3; i++) { const k = (t * .55 + i / 3) % 1; x.fillStyle = `rgba(255,236,224,${.55 * (1 - k)})`; circ(x, -16.5 - k * 9, shY - 9 - k * 20, 2.5 + k * 5); }
    x.save(); x.translate(-10, shY + 4); x.rotate(-.5 + Math.sin(ph - 1) * .06 * (walk ? 1 : 0)); x.fillStyle = '#c9c3e6'; rr(x, -2, -26, 4, 30, 2); x.fill(); x.beginPath(); x.arc(0, -28, 6, .6, TAU - .6 + Math.PI); x.fill(); x.fillStyle = '#5b2a72'; circ(x, 0, -29.5, 2.6); x.restore();
  }
  if (kind === 'clausia') { /* 얼음 결정 날개 + 흘러내리는 긴 머리 */
    const f = Math.sin(t * 2.6) * .16;
    for (const d of [-1, 1]) for (let k = 0; k < 2; k++) { x.save(); x.translate(-2, shY + 6); x.rotate(-1.05 + d * .42 + k * .5 * d + f * d); x.fillStyle = k ? 'rgba(150,215,255,.75)' : 'rgba(215,245,255,.9)'; const ln = 23 - k * 7; poly(x, [0, 0, -4, -ln * .55, 0, -ln, 4, -ln * .55]); x.fillStyle = 'rgba(255,255,255,.75)'; poly(x, [0, 0, 0, -ln, 4, -ln * .55]); x.restore(); }
    x.fillStyle = hairD; x.beginPath(); x.moveTo(-R.headR, headY - 2); x.quadraticCurveTo(-R.headR - 9 - sway * 4, headY + 16, -R.headR - 3 - sway * 9 + Math.sin(t * 2.1) * 2, headY + 36); x.quadraticCurveTo(-4 - sway * 4, headY + 30, R.headR - 6, headY + 10); x.closePath(); x.fill();
  }
  if (kind === 'resona') { /* 나뭇잎 날개: 빠르게 파닥 */
    const f = Math.sin(t * 26) * .42;
    for (const d of [-1, 1]) { x.save(); x.translate(-3, shY + 3); x.rotate(-.75 + d * .32 + f * d); x.fillStyle = d > 0 ? '#b4f06a' : '#6fd66a'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-12, -15, -25, -9); x.quadraticCurveTo(-13, 3, 0, 0); x.fill(); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(-2, -1); x.lineTo(-21, -8); x.stroke(); x.restore(); }
  }
  if (kind !== 'clausia') hairBack(x, L, R.headR, headY, sway, hair, hairD);

  /* --- 다리 --- */
  const boot = kind === 'ignis' ? '#3d1c5c' : '#3b2466';
  const legA = d => { if (air) return d > 0 ? [.75, -1.2] : [-.35, -.7]; if (fly) return [.18 * d + Math.sin(t * 3 + d) * .08, -.35]; if (!walk) return [.06 * d, 0]; const q = d > 0 ? sw : -sw, c = d > 0 ? cw : -cw; return [q * R.stride, -Math.max(0, -c) * 1.0 - .08]; };
  if (R.leg) for (const d of [-1, 1]) {
    const [a1, a2] = legA(d), col = d < 0 ? dk(boot, .25) : boot, e = limb(x, d * R.hip * .55 - 1, hipY, a1, R.leg * .55, a2, R.leg * .55, R.lw, col);
    x.fillStyle = col; x.save(); x.translate(e[0], e[1]); x.rotate(-e[2] * .6); rr(x, -R.lw * .5, -R.lw * .45, R.lw * (kind === 'ignis' ? 1.5 : 1.35), R.lw * .9, R.lw * .4); x.fill(); x.restore();
  }
  /* --- 뒤쪽 팔 --- */
  const armA = d => { if (air) return [d > 0 ? -2.5 : 2.3, .4 * d]; if (fly && kind === 'hero') return [d * .5, .5]; if (!walk) return [d * .12 + Math.sin(t * 2.3 + d) * .05, .22]; return [-(d > 0 ? sw : -sw) * (kind === 'ignis' ? .55 : .85), .5]; };
  const shX = kind === 'ignis' ? 10 : R.bw * .36;
  const drawArm = d => { let [a1, a2] = armA(d), col = d < 0 ? outD : out; if (kind === 'clausia') { a1 = d > 0 ? 1.15 + Math.sin(t * 1.7) * .08 : -.3; a2 = d > 0 ? .5 : .2; } if (kind === 'resona') { a1 = d > 0 ? .9 + Math.sin(t * 13) * .25 : .55; a2 = 1.0; } const e = limb(x, d * shX - (d < 0 ? 0 : 1), shY + 4, a1, R.arm * .52, a2, R.arm * .5, R.aw, col); x.fillStyle = d < 0 ? skinD : skin; circ(x, e[0], e[1], R.aw * .62); return e; };
  drawArm(-1);

  /* --- 몸통 --- */
  x.save(); x.translate(0, hipY); x.rotate(tiltB);
  const bw = R.bw, bh = R.bh + (kind === 'hero' ? 0 : 0), top = shY - hipY;
  if (kind === 'hero') {
    x.fillStyle = out; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(0, top - 2, bw * .36, top + 2); x.quadraticCurveTo(bw * .62, top * .4, bw * .56, 4); x.quadraticCurveTo(0, 8, -bw * .56, 4); x.quadraticCurveTo(-bw * .62, top * .4, -bw * .36, top + 2); x.fill();
    x.fillStyle = outD; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(-bw * .62, top * .4, -bw * .56, 4); x.quadraticCurveTo(-bw * .25, 6.4, -bw * .1, 6.6); x.quadraticCurveTo(-bw * .34, top * .4, -bw * .2, top + .6); x.fill();
    x.fillStyle = outL; x.beginPath(); x.moveTo(-bw * .5, 1.2); x.quadraticCurveTo(0, 5, bw * .5, 1.2); x.lineTo(bw * .56, 4); x.quadraticCurveTo(0, 8, -bw * .56, 4); x.fill();
    x.fillStyle = '#ffcf4a'; rr(x, -bw * .42, top * .34, bw * .84, 2.6, 1.3); x.fill(); x.fillStyle = '#fff3b0'; circ(x, 1.5, top * .34 + 1.3, 2.3);
    x.fillStyle = lt(out, .5); x.beginPath(); x.moveTo(-bw * .3, top + 2.4); x.quadraticCurveTo(1, top + 7, bw * .34, top + 2.4); x.quadraticCurveTo(1, top + 3.4, -bw * .3, top + 2.4); x.fill();
  } else if (kind === 'ignis') {
    x.fillStyle = out; x.beginPath(); x.moveTo(-bw * .5, top + 5); x.quadraticCurveTo(-bw * .52, top - 1, -bw * .3, top - 2); x.lineTo(bw * .34, top - 2); x.quadraticCurveTo(bw * .56, top - 1, bw * .52, top + 6); x.lineTo(bw * .36, 2); x.quadraticCurveTo(0, 6, -bw * .34, 2); x.closePath(); x.fill();
    x.fillStyle = outD; x.beginPath(); x.moveTo(-bw * .5, top + 5); x.quadraticCurveTo(-bw * .52, top - 1, -bw * .3, top - 2); x.lineTo(-bw * .12, top - 2); x.quadraticCurveTo(-bw * .3, top * .5, -bw * .14, 4); x.quadraticCurveTo(-bw * .26, 3.4, -bw * .34, 2); x.closePath(); x.fill();
    /* 가죽 앞치마 + 벨트 + 압력계 */
    x.fillStyle = '#6b3320'; x.beginPath(); x.moveTo(-bw * .16, top + 3); x.lineTo(bw * .3, top + 3); x.lineTo(bw * .34, 2.4); x.quadraticCurveTo(bw * .1, 5, -bw * .2, 3.6); x.closePath(); x.fill();
    x.fillStyle = '#8a4a2c'; x.beginPath(); x.moveTo(bw * .06, top + 3); x.lineTo(bw * .3, top + 3); x.lineTo(bw * .34, 2.4); x.quadraticCurveTo(bw * .2, 4.2, bw * .1, 4.4); x.closePath(); x.fill();
    x.fillStyle = '#3d1c5c'; rr(x, -bw * .38, -4.5, bw * .76, 4, 2); x.fill(); x.fillStyle = '#ffcf4a'; rr(x, bw * .02, -5.3, 6, 5.6, 1.6); x.fill();
    x.fillStyle = '#fff3cf'; circ(x, bw * .12, top + 11, 4.2); x.fillStyle = '#ff4f6d'; x.save(); x.translate(bw * .12, top + 11); x.rotate(Math.sin(t * 3) * .9); x.fillRect(-.6, -3.4, 1.2, 3.6); x.restore();
    x.fillStyle = lt(out, .35); for (const d of [-1, 1]) { x.beginPath(); x.ellipse(d * bw * .42 + (d < 0 ? 1 : 0), top + 2, 6.5, 4.6, d * .3, 0, TAU); x.fill(); }
  } else if (kind === 'clausia') {
    /* 로브: 밑단이 물결친다 */
    const hem = 8, wv = i => Math.sin(t * 3 + i * 1.3) * 1.6;
    x.fillStyle = out; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(0, top - 2, bw * .36, top + 2); x.quadraticCurveTo(bw * .9, top * .45, bw * 1.0 - sway * 2, hem + wv(0));
    for (let i = 1; i <= 4; i++) x.quadraticCurveTo(bw * (1 - i * .5) + bw * .25 - sway * 3, hem + 5 + wv(i), bw * (1 - i * .5) - sway * 3, hem + wv(i + 2));
    x.quadraticCurveTo(-bw * .9, top * .45, -bw * .36, top + 2); x.fill();
    x.fillStyle = outD; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(-bw * .9, top * .45, -bw - sway * 3, hem + wv(6)); x.quadraticCurveTo(-bw * .6 - sway * 3, hem + 4, -bw * .3 - sway * 3, hem + wv(3)); x.quadraticCurveTo(-bw * .5, top * .5, -bw * .16, top + 1); x.fill();
    x.fillStyle = '#bfe9ff'; x.beginPath(); x.moveTo(-bw * .34, top + 2.2); x.quadraticCurveTo(1, top + 9, bw * .36, top + 2.2); x.quadraticCurveTo(1, top + 4, -bw * .34, top + 2.2); x.fill();
    for (let i = 0; i < 3; i++) spark(x, -4 + i * 5 - sway * 2, top * .5 + i * 6, 1.6 + (i & 1), 'rgba(215,245,255,.9)');
    x.fillStyle = '#7fd8ff'; rr(x, -bw * .56, top * .36, bw * 1.12, 2.4, 1.2); x.fill();
  } else {
    x.fillStyle = out; x.beginPath(); x.ellipse(0, top * .5 + 1, bw * .56, -top * .62 + 2, 0, 0, TAU); x.fill();
    x.fillStyle = outD; x.beginPath(); x.ellipse(-bw * .22, top * .5 + 1.6, bw * .32, -top * .5 + 1, 0, 0, TAU); x.fill();
    x.fillStyle = '#fff3b0'; for (let i = 0; i < 4; i++) poly(x, [-bw * .5 + i * bw * .27, top + 3.6, -bw * .5 + (i + .5) * bw * .27, top + 8, -bw * .5 + (i + 1) * bw * .27, top + 3.6]);
    x.fillStyle = '#ff9f43'; circ(x, 1, top * .45, 1.8);
  }
  x.restore();

  /* --- 머리 --- */
  x.save(); x.translate(walk ? 1.2 : 0, headY); x.rotate((walk ? .05 : 0) + Math.sin(t * .9 + kind.length) * .035);
  const HR = R.headR;
  x.fillStyle = skin; circ(x, 0, 0, HR);
  x.fillStyle = skinD; x.beginPath(); x.arc(0, 0, HR, Math.PI * .62, Math.PI * 1.3); x.quadraticCurveTo(-HR * .5, 0, -HR * .32, HR * .92); x.fill();
  if (fly && (kind === 'hero' || kind === 'clausia' || kind === 'resona')) { x.fillStyle = skin; poly(x, [HR * .78, -3, HR * 1.5, -8, HR * .9, 3.5]); x.fillStyle = skinD; poly(x, [-HR * .82, -3, -HR * 1.45, -8, -HR * .92, 3.5]); }
  const look = Math.sin(t * .47 + kind.length * 2) > .82 ? -2.2 : 0, ex = HR * .2 + look, ey = HR * .1, er = HR * (kind === 'ignis' ? .15 : .19);
  eyeDot(x, ex - HR * .36, ey, er, blink, L.eye); eyeDot(x, ex + HR * .42, ey, er, blink, L.eye);
  x.fillStyle = 'rgba(255,95,130,.42)'; ell(x, ex - HR * .62, ey + HR * .36, HR * .19, HR * .11); ell(x, ex + HR * .7, ey + HR * .36, HR * .17, HR * .11);
  x.fillStyle = '#8f2f55';
  if (kind === 'resona') { x.beginPath(); x.ellipse(ex + HR * .05, ey + HR * .48, HR * .12, HR * (.1 + .07 * Math.abs(Math.sin(t * 6.5))), 0, 0, TAU); x.fill(); }
  else if (kind === 'ignis') { x.beginPath(); x.arc(ex + HR * .05, ey + HR * .4, HR * .2, 0, Math.PI); x.fill(); x.fillStyle = '#fff'; x.fillRect(ex - HR * .1, ey + HR * .4, HR * .3, 1.4); }
  else { x.beginPath(); x.arc(ex + HR * .04, ey + HR * .42, HR * .13, .1, Math.PI - .1); x.fill(); }
  if (kind === 'ignis') { x.fillStyle = hair; x.beginPath(); x.arc(ex + HR * .05, ey + HR * .55, HR * .62, .15, Math.PI - .15); x.quadraticCurveTo(ex, ey + HR * 1.25, ex + HR * .62, ey + HR * .62); x.fill(); x.fillStyle = hairD; x.fillRect(ex - HR * .5, ey - HR * .34, HR * .42, 2); x.fillRect(ex + HR * .2, ey - HR * .34, HR * .46, 2); }
  if (kind === 'clausia') {
    x.fillStyle = hair; x.beginPath(); x.arc(0, 0, HR + 1, Math.PI * .95, Math.PI * 2.05); x.quadraticCurveTo(HR * .5, -HR * .1, 0, -HR * .5); x.quadraticCurveTo(-HR * .6, -HR * .2, -HR - 1, HR * .3); x.fill();
    const c = out, tip = sway * 7 + Math.sin(t * 1.7 - 1) * 3;
    x.fillStyle = dk(c, .35); ell(x, 0, -HR * .74, HR * 1.75, HR * .34, -.04);
    x.fillStyle = c; x.beginPath(); x.moveTo(-HR * .92, -HR * .8); x.quadraticCurveTo(-HR * .5, -HR * 2.2, -HR * .2 - tip * .4, -HR * 2.9); x.quadraticCurveTo(-HR * .9 - tip, -HR * 3.3, -HR * 1.5 - tip, -HR * 2.7); x.quadraticCurveTo(-HR * .5 - tip * .5, -HR * 3.0, HR * .2, -HR * 2.0); x.quadraticCurveTo(HR * .7, -HR * 1.4, HR * .92, -HR * .8); x.closePath(); x.fill();
    x.fillStyle = lt(c, .3); x.beginPath(); x.moveTo(HR * .2, -HR * 2.0); x.quadraticCurveTo(HR * .7, -HR * 1.4, HR * .92, -HR * .8); x.lineTo(HR * .5, -HR * .8); x.quadraticCurveTo(HR * .45, -HR * 1.5, HR * .2, -HR * 2.0); x.fill();
    x.fillStyle = '#7fd8ff'; x.beginPath(); x.moveTo(-HR * .9, -HR * .9); x.quadraticCurveTo(0, -HR * .64, HR * .9, -HR * .9); x.lineTo(HR * .82, -HR * 1.16); x.quadraticCurveTo(0, -HR * .92, -HR * .82, -HR * 1.16); x.closePath(); x.fill();
    spark(x, -HR * 1.5 - tip, -HR * 2.7, 3.4 + Math.sin(t * 5) * .8, '#ffffff');
  } else {
    hairFront(x, L, HR, 0, sway, hair, hairD, hairL);
    if (kind === 'ignis') accDraw(x, 5, HR, 0, sway); else if (kind === 'resona') { accDraw(x, 3, HR, 0, sway); x.fillStyle = '#b4f06a'; x.save(); x.translate(-2, -HR - 1); x.rotate(Math.sin(t * 6.5) * .25 - .3); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-7, -7, -2, -13); x.quadraticCurveTo(5, -8, 0, 0); x.fill(); x.restore(); } else accDraw(x, L.acc | 0, HR, 0, sway);
  }
  x.restore();

  /* --- 앞쪽 팔과 손에 든 것 --- */
  const hnd = drawArm(1);
  if (kind === 'clausia') { /* 수정 지팡이 */ x.strokeStyle = '#e9dcff'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(hnd[0] - 2, hnd[1] + 16); x.lineTo(hnd[0] + 3, hnd[1] - 24); x.stroke(); const gx = hnd[0] + 3.4, gy = hnd[1] - 28; aglow(x, gx, gy, 13 + Math.sin(t * 4) * 2, 'rgb(127,216,255)', .6); x.fillStyle = '#d9f4ff'; poly(x, [gx, gy - 7, gx + 4.5, gy, gx, gy + 6, gx - 4.5, gy]); x.fillStyle = '#7fd8ff'; poly(x, [gx, gy - 7, gx, gy + 6, gx - 4.5, gy]); for (let i = 0; i < 3; i++) { const a = t * 1.8 + i * 2.1; spark(x, gx + Math.cos(a) * 10, gy + Math.sin(a) * 6, 1.6, 'rgba(255,255,255,.9)'); } }
  if (kind === 'resona') { /* 작은 리라 + 튀어나오는 음표 */ x.save(); x.translate(hnd[0] + 1, hnd[1] - 2); x.rotate(-.25 + Math.sin(t * 6.5) * .08); x.strokeStyle = '#ffcf4a'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-5, 4); x.quadraticCurveTo(-9, -8, -4, -13); x.moveTo(5, 4); x.quadraticCurveTo(9, -8, 4, -13); x.moveTo(-5, 4); x.lineTo(5, 4); x.moveTo(-4, -11); x.lineTo(4, -11); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = .8; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(i * 2.4, -11); x.quadraticCurveTo(i * 2.4 + Math.sin(t * 30 + i) * 1, -3, i * 2.4, 4); x.stroke(); } x.restore(); for (let i = 0; i < 2; i++) { const k = (t * .7 + i * .5) % 1, nx = hnd[0] + 8 + k * 14 + Math.sin(k * 8 + i) * 3, ny = hnd[1] - 12 - k * 26; x.globalAlpha = 1 - k; x.fillStyle = i ? '#ffcf4a' : '#fff'; ell(x, nx, ny, 2.6, 2, -.4); x.fillRect(nx + 1.6, ny - 8, 1.2, 8); x.globalAlpha = 1; } }
  x.restore();
};
const pcache = {};
Art.portrait = (L, size = 72) => {
  const k = JSON.stringify([L.rig, L.skin, L.hair, L.hairStyle, L.eye, L.outfit, L.wings, L.wingColor, L.acc]);
  if (!pcache[k]) {
    const c = document.createElement('canvas'); c.width = c.height = 144; const x = c.getContext('2d'), base = L.outfit || '#6a3fa0';
    const g = x.createLinearGradient(0, 0, 0, 144); g.addColorStop(0, mix(base, '#2a0f5e', .25)); g.addColorStop(1, mix(base, '#ff9fd0', .45)); x.fillStyle = g; rr(x, 0, 0, 144, 144, 26); x.fill(); x.save(); rr(x, 0, 0, 144, 144, 26); x.clip();
    x.fillStyle = 'rgba(255,255,255,.12)'; circ(x, 104, 34, 54); x.fillStyle = 'rgba(255,255,255,.1)'; circ(x, 104, 34, 34);
    const R = RIGS[L.rig] || RIGS.hero, sc = L.rig === 'ignis' ? 2.7 : L.rig === 'clausia' ? 2.5 : 3;
    Art.chibi(x, L.rig === 'clausia' ? 84 : 68, 96 + (R.leg + R.bh + R.headR * .82) * sc * R.sc + (R.float || L.wings ? 9 * sc * R.sc : 0), sc, L, { t: 0.3 }); x.restore(); pcache[k] = c.toDataURL();
  }
  return `<img src="${pcache[k]}" width="${size}" height="${size}" style="border-radius:${size / 5}px;display:block" alt="">`;
};

/* ---------- 몬스터: 0 물컹이, 1 뿔 쿵쾅이, 2 떠도는 불씨 유령, 3 톱니 로봇 ---------- */
Art.monster = (x, X, Y, s, kind, col, t, boss) => {
  const D = dk(col, .38), Lc = lt(col, .35), b = Math.sin(t * 4.2);
  x.save(); x.translate(X, Y); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
  if (boss) { x.save(); x.translate(0, -34); x.rotate(t * .25); for (let i = 0; i < 10; i++) { x.rotate(TAU / 10); x.fillStyle = `rgba(255,120,170,${i & 1 ? .16 : .09})`; poly(x, [0, 0, -9, -78, 9, -78]); } x.restore(); aglow(x, 0, -34, 62, 'rgb(255,95,150)', .5); }
  const eyes = (ex, ey, r, gap, angry = 1) => { for (const q of [-1, 1]) { x.fillStyle = '#fff'; ell(x, ex + q * gap, ey, r, r * 1.12); x.fillStyle = '#2a1746'; circ(x, ex + q * gap + 1.2 + Math.sin(t * .8) * 1.2, ey + .8, r * .52); x.fillStyle = '#fff'; circ(x, ex + q * gap + 2.2 + Math.sin(t * .8) * 1.2, ey - .6, r * .2); if (angry) { x.fillStyle = D; poly(x, [ex + q * (gap - r - 1), ey - r * .5, ex + q * (gap + r + 1), ey - r * 1.5, ex + q * (gap + r + 1), ey - r * 2.1, ex + q * (gap - r - 1), ey - r * 1.2]); } } };
  if (kind === 0) {
    x.save(); x.scale(1 + b * .06, 1 - b * .06);
    x.fillStyle = col; x.beginPath(); x.moveTo(-27, 0); x.bezierCurveTo(-34, -26, -20, -50, -2, -50); x.bezierCurveTo(18, -50, 34, -28, 27, 0); x.quadraticCurveTo(20, 3, 14, 0); x.quadraticCurveTo(8, 4, 0, 0); x.quadraticCurveTo(-8, 4, -14, 0); x.quadraticCurveTo(-20, 3, -27, 0); x.fill();
    x.fillStyle = D; x.beginPath(); x.moveTo(-27, 0); x.bezierCurveTo(-34, -26, -20, -50, -2, -50); x.bezierCurveTo(-16, -40, -20, -18, -12, -1); x.quadraticCurveTo(-20, 3, -27, 0); x.fill();
    x.fillStyle = Lc; ell(x, 9, -37, 9, 4.5, .5); circ(x, 19, -27, 2.4);
    x.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 4; i++) { const k = (t * .35 + i * .25) % 1; circ(x, -12 + i * 8 + Math.sin(k * 6 + i) * 2, -6 - k * 30, 1.6 + (i & 1) * 1.4); }
    /* 더듬이 방울 */ x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.moveTo(-2, -49); x.quadraticCurveTo(-4 + b * 4, -60, 2 + b * 7, -64); x.stroke(); x.fillStyle = Lc; circ(x, 2 + b * 7, -65, 4.2);
    eyes(1, -26, 6.2, 9.5); x.fillStyle = '#2a1746'; x.beginPath(); x.arc(2, -13, 6, 0, Math.PI); x.fill(); x.fillStyle = '#fff'; poly(x, [-3, -13, -.5, -9, 2, -13]); poly(x, [2, -13, 4.5, -9, 7, -13]);
    x.restore();
  } else if (kind === 1) {
    const st = Math.sin(t * 6);
    for (const q of [-1, 1]) { x.fillStyle = q < 0 ? dk(D, .2) : D; rr(x, q * 13 - 6, -10 + Math.max(0, q * st) * -4, 12, 12, 4); x.fill(); }
    x.save(); x.translate(0, -Math.abs(st) * 1.5);
    x.fillStyle = D; x.beginPath(); x.moveTo(-26, -20); x.quadraticCurveTo(-40 + b * 3, -26, -42 + b * 4, -38); x.quadraticCurveTo(-34, -30, -24, -30); x.fill();
    for (const q of [-1, 1]) { x.fillStyle = q < 0 ? '#e9d2b0' : '#fff3cf'; x.beginPath(); x.moveTo(q * 12, -47); x.quadraticCurveTo(q * 30, -52, q * 27, -72); x.quadraticCurveTo(q * 19, -58, q * 6, -52); x.fill(); }
    x.fillStyle = col; rr(x, -28, -54, 56, 48, 19); x.fill();
    x.fillStyle = D; x.beginPath(); x.moveTo(-9, -54); x.arcTo(-28, -54, -28, -6, 19); x.arcTo(-28, -6, 0, -6, 19); x.lineTo(-10, -6); x.quadraticCurveTo(-20, -30, -9, -54); x.fill();
    x.fillStyle = Lc; rr(x, -8, -22, 30, 14, 7); x.fill(); x.fillStyle = D; ell(x, 3, -15, 2, 2.6); ell(x, 12, -15, 2, 2.6);
    x.fillStyle = Lc; for (let i = 0; i < 3; i++) circ(x, -17 + i * 2, -44 + i * 9, 2.6 - i * .5);
    eyes(6, -35, 5.4, 9); for (let i = 0; i < 2; i++) { const k = (t * .9 + i * .5) % 1; x.fillStyle = `rgba(255,255,255,${.5 * (1 - k)})`; circ(x, 24 + k * 14, -15 - k * 8, 2 + k * 4); }
    x.restore();
  } else if (kind === 2) {
    const fl = Math.sin(t * 2.2) * 5; x.translate(0, -12 + fl);
    aglow(x, 0, -30, 44, rgbOf(col), .45);
    x.fillStyle = col; x.beginPath(); x.moveTo(-24, -4); x.bezierCurveTo(-30, -30, -18, -56, 0, -62 - b * 3); x.bezierCurveTo(4, -52, 28, -40, 24, -4);
    for (let i = 3; i >= -3; i--) x.quadraticCurveTo(i * 8 + 4, 6 + Math.sin(t * 5 + i) * 4, i * 8, -4 + Math.sin(t * 5 + i * 1.7) * 2.5); x.fill();
    x.fillStyle = D; x.beginPath(); x.moveTo(-24, -4); x.bezierCurveTo(-30, -30, -18, -56, 0, -62 - b * 3); x.bezierCurveTo(-12, -44, -16, -20, -12, -3 + Math.sin(t * 5 - 2.5) * 2.5); x.quadraticCurveTo(-18, 4, -24, -4); x.fill();
    x.fillStyle = Lc; x.beginPath(); x.moveTo(4, -50); x.quadraticCurveTo(14, -44, 16, -32); x.quadraticCurveTo(9, -40, 4, -50); x.fill();
    for (const q of [-1, 1]) { x.fillStyle = '#2a1746'; ell(x, 2 + q * 8.5, -27, 5.4, 7.6, q * .15); x.fillStyle = '#fff3b0'; circ(x, 3 + q * 8.5, -25.5, 2.3 + Math.sin(t * 6) * .4); }
    x.fillStyle = '#2a1746'; ell(x, 3, -12, 4, 5 + b * 1.2);
    for (let i = 0; i < 4; i++) { const a = t * 1.3 + i * TAU / 4; spark(x, Math.cos(a) * 34, -30 + Math.sin(a) * 13, 2.2 + (i & 1), Lc); }
  } else {
    x.save(); x.translate(0, -30); x.rotate(t * .9); x.fillStyle = D; for (let i = 0; i < 9; i++) { x.rotate(TAU / 9); rr(x, -5.5, -36, 11, 13, 3); x.fill(); } circ(x, 0, 0, 27); x.restore();
    const st = Math.sin(t * 7);
    for (const q of [-1, 1]) { x.strokeStyle = '#c9c3e6'; x.lineWidth = 3.4; x.beginPath(); x.moveTo(q * 22, -26); x.lineTo(q * (33 + st * q * 3), -14 - st * q * 3); x.stroke(); x.fillStyle = Lc; circ(x, q * (33 + st * q * 3), -14 - st * q * 3, 4.6); x.fillStyle = '#3b2466'; rr(x, q * 10 - 5, -7, 10, 7, 3); x.fill(); }
    x.fillStyle = col; circ(x, 0, -30, 23); x.fillStyle = D; x.beginPath(); x.arc(0, -30, 23, Math.PI * .55, Math.PI * 1.45); x.quadraticCurveTo(-8, -30, -6, -8); x.fill();
    x.fillStyle = Lc; x.beginPath(); x.arc(0, -30, 23, -1.2, -.3); x.arc(0, -30, 19, -.3, -1.2, true); x.fill();
    x.fillStyle = '#2a1746'; circ(x, 4, -32, 11.5); x.fillStyle = '#ff5f6d'; circ(x, 4 + Math.sin(t * 1.1) * 2.6, -32, 6.4); x.fillStyle = '#fff3b0'; circ(x, 4 + Math.sin(t * 1.1) * 2.6, -32, 2.6 + Math.sin(t * 8) * .5); x.fillStyle = '#fff'; circ(x, 8 + Math.sin(t * 1.1) * 2.6, -36, 1.6);
    x.fillStyle = Lc; for (let i = 0; i < 4; i++) circ(x, Math.cos(i * 1.2 + 2.2) * 18.5, -30 + Math.sin(i * 1.2 + 2.2) * 18.5, 1.6);
    x.fillStyle = '#2a1746'; rr(x, -5, -16, 16, 5, 2.5); x.fill(); x.fillStyle = '#fff3b0'; for (let i = 0; i < 3; i++) x.fillRect(-3 + i * 4.6, -15, 2.6, 3 * (.5 + .5 * Math.abs(Math.sin(t * 9 + i))));
    x.strokeStyle = D; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-6, -52); x.quadraticCurveTo(-10, -62, -4 + b * 3, -66); x.stroke(); x.fillStyle = '#ffcf4a'; circ(x, -4 + b * 3, -67, 3.4);
  }
  if (boss) { const cy = kind === 2 ? -78 + Math.sin(t * 2.2) * 5 : kind === 1 ? -62 : kind === 3 ? -60 : -58; x.fillStyle = '#ffcf4a'; poly(x, [-15, cy, -18, cy - 17, -8, cy - 8, 0, cy - 21, 8, cy - 8, 18, cy - 17, 15, cy]); x.fillStyle = '#ffe9a0'; poly(x, [0, cy - 21, 8, cy - 8, 18, cy - 17, 15, cy, 2, cy]); x.fillStyle = '#ff4f6d'; circ(x, 0, cy - 6, 2.6); }
  x.restore();
};
Art.slime = (x, X, Y, col, t, squash) => {
  const b = Math.sin(t * 6), D = dk(col, .36), Lc = lt(col, .4);
  x.save(); x.translate(X, Y); x.scale(squash ? 1.5 : 1 + b * .1, squash ? .25 : 1 - b * .1);
  x.fillStyle = col; x.beginPath(); x.moveTo(-16, 0); x.bezierCurveTo(-21, -17, -11, -27, 0, -27); x.bezierCurveTo(11, -27, 21, -17, 16, 0); x.closePath(); x.fill();
  x.fillStyle = D; x.beginPath(); x.moveTo(-16, 0); x.bezierCurveTo(-21, -17, -11, -27, 0, -27); x.bezierCurveTo(-9, -20, -11, -9, -7, 0); x.closePath(); x.fill();
  x.fillStyle = Lc; ell(x, 6, -20, 5, 2.4, .5);
  for (const q of [-1, 1]) { x.fillStyle = '#2a1746'; ell(x, 2 + q * 5.5, -12, 2.6, 3.4); x.fillStyle = '#fff'; circ(x, 2.9 + q * 5.5, -13.2, 1); }
  x.fillStyle = '#2a1746'; x.beginPath(); x.arc(2, -6.5, 2.6, 0, Math.PI); x.fill();
  x.restore();
};
Art.orb = (x, X, Y, t) => {
  const p = Math.sin(t * 3.2 + X * .01) * 4, y = Y + p, r = 7 + Math.sin(t * 5 + X) * .6;
  aglow(x, X, y, 20, 'rgb(255,214,102)', .55);
  x.fillStyle = '#ffcf4a'; poly(x, [X, y - r - 2, X + r, y, X, y + r + 2, X - r, y]); x.fillStyle = '#fff3b0'; poly(x, [X, y - r - 2, X + r, y, X, y]); x.fillStyle = '#ff9f43'; poly(x, [X - r, y, X, y + r + 2, X, y]);
  spark(x, X + 10 * Math.cos(t * 2 + X), y - 12 + 4 * Math.sin(t * 3), 2.4, '#fff');
};
Art.campfire = (x, X, Y, t) => {
  /* 천막 */
  const tx = X + 112; x.fillStyle = '#5a2a9a'; poly(x, [tx - 62, Y, tx - 4, Y - 84, tx + 56, Y]); x.fillStyle = '#7b3fd0'; poly(x, [tx - 4, Y - 84, tx + 56, Y, tx + 10, Y]); x.fillStyle = '#2a0f5e'; poly(x, [tx - 18, Y, tx - 2, Y - 46, tx + 12, Y]);
  x.fillStyle = '#ffcf4a'; poly(x, [tx - 4, Y - 84, tx - 4, Y - 104, tx + 14 + Math.sin(t * 4) * 2, Y - 97]); x.fillStyle = '#ff9f43'; for (let i = 0; i < 5; i++) poly(x, [tx - 50 + i * 10, Y - 16 - i * 14, tx - 44 + i * 10, Y - 8 - i * 14, tx - 40 + i * 10, Y - 30 - i * 14]);
  aglow(x, X, Y - 20, 78 + Math.sin(t * 7) * 6, 'rgb(255,160,60)', .5);
  x.strokeStyle = '#6b3320'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(X - 17, Y - 3); x.lineTo(X + 17, Y - 9); x.moveTo(X - 17, Y - 9); x.lineTo(X + 17, Y - 3); x.stroke();
  x.fillStyle = '#8a8fbf'; for (let i = -2; i <= 2; i++) ell(x, X + i * 10, Y - 1, 5, 3.4);
  const cols = ['#ff4f4f', '#ff9f43', '#ffe27a'];
  for (let i = 0; i < 3; i++) { const h = 34 + Math.sin(t * 9 + i * 2) * 8 - i * 9, w = 14 - i * 4; x.fillStyle = cols[i]; x.beginPath(); x.moveTo(X - w, Y - 6); x.bezierCurveTo(X - w - 3, Y - 10 - h * .5, X - 4 + Math.sin(t * 7 + i) * 5, Y - 8 - h * .7, X + Math.sin(t * 5 + i) * 3, Y - 12 - h); x.bezierCurveTo(X + 6, Y - 8 - h * .6, X + w + 3, Y - 10 - h * .4, X + w, Y - 6); x.closePath(); x.fill(); }
  for (let i = 0; i < 5; i++) { const k = (t * .5 + i * .2) % 1; x.fillStyle = `rgba(255,220,120,${1 - k})`; circ(x, X + Math.sin(k * 9 + i * 2) * 12, Y - 34 - k * 70, 1.8); }
};
Art.portal = (x, X, Y, t) => {
  const cy = Y - 64; aglow(x, X, cy, 96, 'rgb(150,120,255)', .5);
  x.save(); x.translate(X, cy); for (let i = 0; i < 12; i++) { x.save(); x.rotate(i * TAU / 12 + t * .4); x.fillStyle = i & 1 ? 'rgba(255,255,255,.14)' : 'rgba(190,150,255,.14)'; poly(x, [0, 0, -7, -92, 7, -92]); x.restore(); }
  const ring = ['#5a2ad0', '#8f5cff', '#c9a8ff', '#fff3cf'];
  for (let i = 0; i < 4; i++) { x.fillStyle = ring[i]; x.beginPath(); x.ellipse(0, 0, 36 - i * 7 + Math.sin(t * 3 + i) * 1.5, 62 - i * 11, 0, 0, TAU); x.fill(); }
  x.fillStyle = '#2a0f5e'; x.beginPath(); x.ellipse(0, 0, 10, 26, 0, 0, TAU); x.fill();
  for (let i = 0; i < 8; i++) { const a = t * 1.6 + i * TAU / 8, r = 44 + Math.sin(t * 2 + i) * 6; spark(x, Math.cos(a) * r * .8, Math.sin(a) * r * 1.5, 2.6 + (i & 1) * 1.6, i & 1 ? '#fff' : '#ffcf4a'); }
  x.restore();
  x.fillStyle = '#40238f'; rr(x, X - 46, Y - 8, 92, 10, 5); x.fill(); x.fillStyle = '#8f5cff'; rr(x, X - 40, Y - 13, 80, 7, 3.5); x.fill();
};

/* ---------- 배경 ----------
   sky 3단 그라데이션 → 별 → 큰 천체(후광·광선) → 구름 → 원경(l1) → 안개 → 중경(l2) → 근경(l3) → 입자 */
Art.THEMES = [
  { name: 'forge', sky: ['#3b0f6b', '#c2256e', '#ff8a3c'], sun: '#ffd45e', sunR: 62, l1: '#7a1f7a', l2: '#56186c', l3: '#3a1158', lit: '#ffcf4a', cloud: '#e04a7c', g1: '#a13b6b', g2: '#5e1f66', top: '#ffb14a', deco: 'gear', part: 'ember', slime: '#ff7a4a', stars: .35 },
  { name: 'engine', sky: ['#2a1a7a', '#7a3fc0', '#ffb347'], sun: '#fff0a8', sunR: 54, l1: '#5a37a8', l2: '#42278c', l3: '#2c1a6b', lit: '#ffe27a', cloud: '#b06fe0', g1: '#8a5fc0', g2: '#4f2f8f', top: '#ffd166', deco: 'chimney', part: 'smoke', slime: '#f0a13c', stars: .3 },
  { name: 'ice', sky: ['#0d1466', '#2456c8', '#6fe3ff'], sun: '#eaffff', sunR: 58, l1: '#2f6fd0', l2: '#2450a8', l3: '#172f7a', lit: '#b6f6ff', cloud: '#7fb8ff', g1: '#bfe6ff', g2: '#5f8fe0', top: '#ffffff', deco: 'crystal', part: 'snow', slime: '#7fd0ff', stars: .9 },
  { name: 'forest', sky: ['#0b3a66', '#12908a', '#b8f26a'], sun: '#fff7b0', sunR: 60, l1: '#17907a', l2: '#126a66', l3: '#0b4552', lit: '#ffe27a', cloud: '#5fd6b0', g1: '#3fb06a', g2: '#1f6f5a', top: '#c6f55a', deco: 'string', part: 'leaf', slime: '#9be35a', stars: .2 },
  { name: 'shore', sky: ['#172a9a', '#2f8fe6', '#8ff0e6'], sun: '#fff3b0', sunR: 66, l1: '#2f7fe0', l2: '#2260c0', l3: '#17429a', lit: '#fff3b0', cloud: '#ffffff', g1: '#ffd98a', g2: '#e0a25a', top: '#fff3cf', deco: 'wave', part: 'bubble', slime: '#5fd6e6', stars: 0 },
  { name: 'hall', sky: ['#260f6b', '#7a2fc0', '#ff7ab8'], sun: '#ffd6f0', sunR: 56, l1: '#6a2fb0', l2: '#4c2090', l3: '#33146e', lit: '#ffd166', cloud: '#c060e0', g1: '#9a6fe0', g2: '#5a3aa8', top: '#e6c8ff', deco: 'arch', part: 'note', slime: '#c58cff', stars: .6 },
  { name: 'harp', sky: ['#1a1466', '#5a2fb0', '#ffb04a'], sun: '#ffe9a0', sunR: 70, l1: '#6a3aa8', l2: '#4c2788', l3: '#321a66', lit: '#ffe27a', cloud: '#e07ab0', g1: '#c08a5a', g2: '#7a4a6b', top: '#ffd166', deco: 'harp', part: 'note', slime: '#ffcf4a', stars: .7 }
];
const cloud = (x, cx, cy, s, col, colD) => {
  x.fillStyle = col; x.beginPath(); x.moveTo(cx - 62 * s, cy); x.arc(cx - 40 * s, cy, 20 * s, Math.PI, Math.PI * 1.5); x.arc(cx - 16 * s, cy - 18 * s, 22 * s, Math.PI * 1.1, Math.PI * 1.75); x.arc(cx + 16 * s, cy - 12 * s, 26 * s, Math.PI * 1.25, Math.PI * 1.9); x.arc(cx + 44 * s, cy, 18 * s, Math.PI * 1.4, 0); x.closePath(); x.fill();
  x.fillStyle = colD; rr(x, cx - 72 * s, cy - 5 * s, 150 * s, 10 * s, 5 * s); x.fill();
};
const tree = (x, cx, B, h, col, colL, trunk) => {
  x.fillStyle = trunk; x.beginPath(); x.moveTo(cx - h * .05, B); x.quadraticCurveTo(cx - h * .02, B - h * .5, cx - h * .12, B - h * .72); x.lineTo(cx + h * .1, B - h * .7); x.quadraticCurveTo(cx + h * .03, B - h * .4, cx + h * .06, B); x.fill();
  const lobes = [[-.26, .62, .2], [.24, .66, .22], [0, .8, .27], [-.14, .96, .18], [.16, .98, .16]];
  for (const [dx, dy, r] of lobes) { x.fillStyle = col; rr(x, cx + (dx - r) * h, B - (dy + r * .55) * h, r * 2 * h, r * 1.1 * h, r * .55 * h); x.fill(); x.fillStyle = colL; rr(x, cx + (dx - r * .7) * h, B - (dy + r * .55) * h, r * 1.3 * h, r * .34 * h, r * .17 * h); x.fill(); }
};
const tower = (x, X, B, w, h, col, lit, seed, t) => {
  x.fillStyle = col; rr(x, X, B - h, w, h + 4, 6); x.fill(); x.fillStyle = dk(col, .18); rr(x, X, B - h, w * .3, h + 4, 6); x.fill();
  x.fillStyle = lt(col, .16); rr(x, X - 4, B - h - 6, w + 8, 9, 4); x.fill();
  const cols = Math.max(2, Math.floor(w / 15)), rows = Math.floor(h / 22);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const on = hash(seed * 31 + r * 7 + c) > .45, fl = on && hash(seed + r * 13 + c * 5) > .8 ? .6 + .4 * Math.sin(t * 2 + r + c) : 1; x.fillStyle = on ? lit : dk(col, .28); x.globalAlpha = on ? .85 * fl : 1; rr(x, X + 6 + c * ((w - 12) / cols) + 1, B - h + 10 + r * 22, (w - 12) / cols - 4, 11, 2.5); x.fill(); } x.globalAlpha = 1;
};
const gear = (x, cx, cy, r, rot, col, hole) => { x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = col; const n = Math.max(7, Math.round(r / 5)); for (let i = 0; i < n; i++) { x.rotate(TAU / n); rr(x, -r * .16, -r * 1.24, r * .32, r * .36, r * .07); x.fill(); } circ(x, 0, 0, r); x.fillStyle = hole; circ(x, 0, 0, r * .62); x.fillStyle = col; circ(x, 0, 0, r * .3); for (let i = 0; i < 4; i++) { x.rotate(TAU / 4); x.fillRect(-r * .07, -r * .64, r * .14, r * .4); } x.restore(); };
const crystal = (x, cx, B, w, h, col, lean) => { const tx = cx + lean * h; x.fillStyle = col; poly(x, [cx - w, B, tx - w * .45, B - h * .82, tx, B - h, tx + w * .5, B - h * .78, cx + w, B]); x.fillStyle = lt(col, .42); poly(x, [tx, B - h, tx + w * .5, B - h * .78, cx + w, B, cx + w * .2, B]); x.fillStyle = dk(col, .25); poly(x, [cx - w, B, tx - w * .45, B - h * .82, tx - w * .1, B - h * .7, cx - w * .3, B]); };
const hillPath = (x, W, H, base, cam, par, f1, a1, f2, a2, step = 24) => { x.beginPath(); x.moveTo(0, H); for (let X = 0; X <= W + step; X += step) { const wx = X + cam * par; x.lineTo(X, base - Math.sin(wx * f1) * a1 - Math.sin(wx * f2 + 1.3) * a2); } x.lineTo(W + step, H); x.closePath(); x.fill(); };
const hillY = (wx, base, f1, a1, f2, a2) => base - Math.sin(wx * f1) * a1 - Math.sin(wx * f2 + 1.3) * a2;

Art.bg = (x, W, H, cam, th, t, GY) => {
  const g = x.createLinearGradient(0, 0, 0, GY + 30); g.addColorStop(0, th.sky[0]); g.addColorStop(.55, th.sky[1]); g.addColorStop(1, th.sky[2]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  /* 별 */
  if (th.stars) for (let i = 0; i < 46; i++) { const sx = ((hash(i) * (W + 80) - cam * .02) % (W + 80) + W + 80) % (W + 80) - 40, sy = hash(i + 99) * GY * .62, a = th.stars * (.35 + .65 * Math.abs(Math.sin(t * (1 + hash(i + 7)) + i))); if (i % 9 === 0) spark(x, sx, sy, 4 + hash(i) * 3, `rgba(255,255,255,${a})`); else { x.fillStyle = `rgba(255,255,255,${a * .8})`; circ(x, sx, sy, .9 + hash(i + 3) * 1.1); } }
  /* 천체 */
  const sx = W * .74 - cam * .012, sy = GY * .36, sr = th.sunR;
  aglow(x, sx, sy, sr * 4.2, rgbOf(th.sun), .42);
  x.save(); x.translate(sx, sy); x.rotate(t * .05); for (let i = 0; i < 14; i++) { x.rotate(TAU / 14); x.fillStyle = `rgba(255,255,255,${i & 1 ? .07 : .035})`; poly(x, [0, 0, -sr * .34, -sr * 5.4, sr * .34, -sr * 5.4]); } x.restore();
  x.fillStyle = mix(th.sun, th.sky[1], .55); circ(x, sx, sy, sr * 1.5); x.fillStyle = mix(th.sun, th.sky[1], .25); circ(x, sx, sy, sr * 1.22); x.fillStyle = th.sun; circ(x, sx, sy, sr);
  x.save(); x.beginPath(); x.arc(sx, sy, sr, 0, TAU); x.clip(); x.fillStyle = mix(th.sun, th.sky[2], .38); circ(x, sx - sr * .5, sy + sr * .55, sr * .95); x.fillStyle = mix(th.sun, '#ffffff', .6); circ(x, sx + sr * .35, sy - sr * .4, sr * .34); x.restore();
  if (th.deco === 'crystal' || th.deco === 'harp') { x.strokeStyle = mix(th.sun, th.sky[1], .2); x.lineWidth = 5; x.beginPath(); x.ellipse(sx, sy, sr * 1.75, sr * .34, -.35, .1, Math.PI - .1); x.stroke(); }
  /* 구름 2겹 */
  for (let L = 0; L < 2; L++) { const par = .05 + L * .07, sp = 520 - L * 130, off = cam * par + t * (4 + L * 5); for (let i = Math.floor(off / sp) - 1; i < (off + W) / sp + 1; i++) { const h = hash(i * 17 + L * 91); cloud(x, i * sp - off + h * 180, GY * (.2 + L * .24) + h * 60, (.9 + h * .7) * (L ? 1.1 : .8), mix(th.cloud, th.sky[1], L ? .15 : .45), mix(th.cloud, th.sky[0], L ? .35 : .55)); } }

  /* 원경 l1 */
  const B = GY + 24, off1 = cam * .18, sp1 = 360, c1 = mix(th.l1, th.sky[1], .28), lit1 = mix(th.lit, th.sky[1], .25);
  x.fillStyle = mix(th.l1, th.sky[1], .5); hillPath(x, W, H, GY - 96, cam, .1, .0031, 54, .0083, 22);
  for (let i = Math.floor(off1 / sp1) - 1; i < (off1 + W) / sp1 + 1; i++) {
    const X = i * sp1 - off1, hh = hash(i * 7 + 3), h = 170 + hh * 150;
    switch (th.deco) {
      case 'gear': tower(x, X + 20, B, 96, h * .8, c1, lit1, i, t); tower(x, X + 130, B, 60, h * 1.1, mix(c1, th.sky[1], .12), lit1, i + 50, t); gear(x, X + 262, B - 130 - hh * 50, 52 + hh * 16, t * .25 * (i & 1 ? 1 : -1) + i, c1, mix(th.sky[1], th.l1, .35)); gear(x, X + 322, B - 66, 30, -t * .45 + i, dk(c1, .12), mix(th.sky[1], th.l1, .35)); break;
      case 'chimney': tower(x, X + 10, B, 150, h * .6, c1, lit1, i, t); x.fillStyle = c1; rr(x, X + 34, B - h - 70, 30, h + 70, 5); x.fill(); rr(x, X + 108, B - h - 20, 24, h + 20, 5); x.fill(); x.fillStyle = lit1; rr(x, X + 30, B - h - 74, 38, 8, 4); x.fill(); rr(x, X + 104, B - h - 24, 32, 7, 3.5); x.fill(); for (let k = 0; k < 5; k++) { const q = (t * .12 + k / 5 + hh) % 1; x.fillStyle = `rgba(255,255,255,${.34 * (1 - q)})`; circ(x, X + 49 + q * 46 + Math.sin(q * 7 + k) * 8, B - h - 84 - q * 150, 12 + q * 30); } tower(x, X + 200, B, 110, h * .9, mix(c1, th.sky[1], .14), lit1, i + 9, t); x.fillStyle = c1; rr(x, X + 150, B - h * .45, 70, 12, 6); x.fill(); break;
      case 'crystal': for (let k = 0; k < 4; k++) crystal(x, X + 50 + k * 86, B, 26 + hash(i * 5 + k) * 22, h * (.7 + hash(i * 3 + k) * .8), mix(c1, k & 1 ? '#bfefff' : th.sky[1], .22), (hash(i + k) - .5) * .4); break;
      case 'string': tree(x, X + 80, B, h * 1.25, c1, mix(c1, th.sky[2], .25), dk(c1, .2)); tree(x, X + 250, B, h * .95, mix(c1, th.sky[1], .15), mix(c1, th.sky[2], .3), dk(c1, .2)); x.strokeStyle = `rgba(255,243,176,.5)`; x.lineWidth = 2; for (let k = 0; k < 3; k++) { const yy = B - h * (.7 + k * .12), n = k + 1, A = 8 * Math.sin(t * (5 + k * 2) + i); x.beginPath(); for (let q = 0; q <= 34; q++) { const px = X + 80 + q * 5; q ? x.lineTo(px, yy + Math.sin(q / 34 * Math.PI * n) * A) : x.moveTo(px, yy); } x.stroke(); } break;
      case 'wave': { x.fillStyle = c1; x.beginPath(); x.moveTo(X + 40, B); x.quadraticCurveTo(X + 110, B - h * 1.1, X + 190, B - h * .5); x.quadraticCurveTo(X + 260, B - h * .2, X + 330, B); x.fill(); x.fillStyle = lt(c1, .2); x.beginPath(); x.moveTo(X + 100, B - h * .72); x.quadraticCurveTo(X + 140, B - h * .8, X + 190, B - h * .5); x.quadraticCurveTo(X + 150, B - h * .56, X + 100, B - h * .72); x.fill(); x.fillStyle = '#fff'; rr(x, X + 150, B - h * .9 - 60, 22, 62, 6); x.fill(); x.fillStyle = '#ff5f6d'; rr(x, X + 150, B - h * .9 - 44, 22, 12, 0); x.fill(); rr(x, X + 150, B - h * .9 - 20, 22, 12, 0); x.fill(); x.fillStyle = '#ffe27a'; rr(x, X + 146, B - h * .9 - 72, 30, 14, 5); x.fill(); x.save(); x.translate(X + 161, B - h * .9 - 65); x.rotate(Math.sin(t * .6 + i) * .7); x.fillStyle = 'rgba(255,243,176,.2)'; poly(x, [0, 0, 240, -46, 240, 46]); x.restore(); break; }
      case 'arch': { const aw = 250, ah = h + 110; x.fillStyle = c1; x.beginPath(); x.moveTo(X + 30, B); x.lineTo(X + 30, B - ah * .6); x.quadraticCurveTo(X + 30 + aw / 2, B - ah * 1.25, X + 30 + aw, B - ah * .6); x.lineTo(X + 30 + aw, B); x.closePath(); x.fill(); x.fillStyle = mix(th.sky[1], th.sky[2], .5); x.beginPath(); x.moveTo(X + 62, B); x.lineTo(X + 62, B - ah * .56); x.quadraticCurveTo(X + 30 + aw / 2, B - ah * 1.08, X + aw - 2, B - ah * .56); x.lineTo(X + aw - 2, B); x.closePath(); x.fill(); for (let k = 0; k < 7; k++) { const ph2 = 60 + Math.abs(3 - k) * -14 + 70 + hh * 30; x.fillStyle = k & 1 ? c1 : dk(c1, .14); rr(x, X + 74 + k * 24, B - ph2, 18, ph2 + 6, 8); x.fill(); x.fillStyle = lit1; rr(x, X + 79 + k * 24, B - ph2 + 12, 8, 3.5, 1.7); x.fill(); } x.fillStyle = lit1; circ(x, X + 30 + aw / 2, B - ah * .86, 15); x.fillStyle = c1; for (let k = 0; k < 6; k++) { x.save(); x.translate(X + 30 + aw / 2, B - ah * .86); x.rotate(k * TAU / 6 + t * .1); x.fillRect(-1.5, -15, 3, 30); x.restore(); } break; }
      case 'harp': { x.fillStyle = c1; rr(x, X + 50, B - h - 150, 24, h + 150, 10); x.fill(); x.beginPath(); x.moveTo(X + 50, B - h - 150); x.bezierCurveTo(X + 150, B - h - 250, X + 270, B - h - 120, X + 310, B - 30); x.lineTo(X + 286, B - 30); x.bezierCurveTo(X + 250, B - h - 80, X + 150, B - h - 190, X + 74, B - h - 122); x.fill(); x.fillStyle = lit1; circ(x, X + 62, B - h - 150, 9); for (let k = 1; k < 9; k++) { const sxk = X + 74 + k * 25, top = B - h - 150 + Math.pow(k / 9, 1.6) * (h + 60) + (k < 4 ? -12 : 0), n = (k % 3) + 1, A = 3.5 * Math.sin(t * (6 + k) + i); x.strokeStyle = `rgba(255,243,176,${.42 + .2 * (k & 1)})`; x.lineWidth = 1.6; x.beginPath(); for (let q = 0; q <= 14; q++) { const yy = top + (B - top) * q / 14, px = sxk + Math.sin(q / 14 * Math.PI * n) * A; q ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.stroke(); } break; }
    }
  }
  /* 지평선 안개 */
  const hz = x.createLinearGradient(0, GY - 150, 0, GY + 30); hz.addColorStop(0, mix(th.sky[2], th.sky[2], 0).replace('rgb', 'rgba').replace(')', ',0)')); hz.addColorStop(1, mix(th.sky[2], '#ffffff', .15).replace('rgb', 'rgba').replace(')', ',.55)')); x.fillStyle = hz; x.fillRect(0, GY - 150, W, 190);

  /* 중경 l2: 언덕 + 소품 */
  const p2 = .42, f1 = .0042, a1 = 42, f2 = .011, a2 = 18, base2 = GY - 34, c2 = th.l2, c2L = mix(th.l2, th.sky[2], .3);
  x.fillStyle = c2; hillPath(x, W, H, base2, cam, p2, f1, a1, f2, a2);
  x.fillStyle = c2L; x.beginPath(); for (let X = 0; X <= W + 24; X += 24) { const y = hillY(X + cam * p2, base2, f1, a1, f2, a2); X ? x.lineTo(X, y) : x.moveTo(X, y); } for (let X = W + 24; X >= 0; X -= 24) x.lineTo(X, hillY(X + cam * p2, base2, f1, a1, f2, a2) + 5 + 3 * Math.sin((X + cam * p2) * .02)); x.fill();
  const off2 = cam * p2, sp2 = 170;
  for (let i = Math.floor(off2 / sp2) - 1; i < (off2 + W) / sp2 + 1; i++) {
    const hh = hash(i * 13 + 5), wx = i * sp2 + hh * 90, X = wx - off2, y = hillY(wx, base2, f1, a1, f2, a2) + 6;
    if (hh < .12) continue;
    switch (th.deco) {
      case 'gear': if (hh > .6) { gear(x, X, y - 22, 26 + hh * 14, t * .6 * (i & 1 ? 1 : -1), c2, c2L); } else { x.fillStyle = c2; rr(x, X - 9, y - 70 - hh * 60, 18, 80 + hh * 60, 6); x.fill(); x.fillStyle = th.lit; rr(x, X - 12, y - 74 - hh * 60, 24, 7, 3.5); x.fill(); x.fillStyle = `rgba(255,190,90,${.5 + .3 * Math.sin(t * 6 + i)})`; ell(x, X, y - 84 - hh * 60, 6, 10 + Math.sin(t * 9 + i) * 3); } break;
      case 'chimney': x.fillStyle = c2; rr(x, X - 30, y - 40 - hh * 40, 60, 60 + hh * 40, 8); x.fill(); x.fillStyle = th.lit; for (let k = 0; k < 3; k++) { x.globalAlpha = .55 + .45 * Math.sin(t * 1.5 + i + k); rr(x, X - 22 + k * 16, y - 30 - hh * 40, 10, 12, 3); x.fill(); } x.globalAlpha = 1; x.strokeStyle = c2; x.lineWidth = 7; x.beginPath(); x.moveTo(X + 30, y - 20); x.lineTo(X + 60, y - 20); x.lineTo(X + 60, y + 10); x.stroke(); break;
      case 'crystal': crystal(x, X, y + 4, 12 + hh * 12, 50 + hh * 80, mix(c2, '#9fe6ff', .3), (hh - .5) * .5); if (hh > .5) crystal(x, X + 24, y + 4, 8, 30 + hh * 30, mix(c2, '#ffffff', .35), .2); break;
      case 'string': tree(x, X, y + 4, 70 + hh * 70, c2, c2L, dk(c2, .25)); break;
      case 'wave': if (hh > .55) { x.fillStyle = c2; x.beginPath(); x.moveTo(X - 6, y + 4); x.quadraticCurveTo(X - 2, y - 40, X - 14 + Math.sin(t * 1.2 + i) * 3, y - 76); x.lineTo(X - 6 + Math.sin(t * 1.2 + i) * 3, y - 76); x.quadraticCurveTo(X + 6, y - 36, X + 6, y + 4); x.fill(); for (let k = 0; k < 5; k++) { x.save(); x.translate(X - 10 + Math.sin(t * 1.2 + i) * 3, y - 76); x.rotate(-1.4 + k * .7 + Math.sin(t * 1.5 + k + i) * .08); x.fillStyle = k & 1 ? c2L : c2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(26, -14, 50, 4); x.quadraticCurveTo(24, -2, 0, 0); x.fill(); x.restore(); } } else { x.fillStyle = c2L; x.beginPath(); x.arc(X, y + 6, 20 + hh * 16, Math.PI, 0); x.fill(); } break;
      case 'arch': x.fillStyle = c2; rr(x, X - 10, y - 86 - hh * 50, 20, 96 + hh * 50, 5); x.fill(); x.fillStyle = c2L; rr(x, X - 15, y - 92 - hh * 50, 30, 10, 4); x.fill(); rr(x, X - 15, y - 8, 30, 12, 4); x.fill(); aglow(x, X, y - 104 - hh * 50, 22, rgbOf(th.lit), .6); x.fillStyle = th.lit; circ(x, X, y - 104 - hh * 50, 6 + Math.sin(t * 3 + i)); break;
      case 'harp': { const ht = 70 + hh * 60; x.fillStyle = c2; rr(x, X - 4, y - ht, 8, ht + 6, 4); x.fill(); x.beginPath(); x.moveTo(X - 4, y - ht); x.quadraticCurveTo(X + 30, y - ht - 26, X + 46, y - ht + 16); x.lineTo(X + 40, y - ht + 20); x.quadraticCurveTo(X + 26, y - ht - 12, X + 4, y - ht + 8); x.fill(); x.strokeStyle = 'rgba(255,243,176,.6)'; x.lineWidth = 1.2; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(X + k * 11, y - ht + 4 + k * 3); x.quadraticCurveTo(X + k * 11 + Math.sin(t * 14 + k + i) * 2.4, y - ht / 2, X + k * 11, y + 2); x.stroke(); } break; }
    }
  }
  /* 근경 l3: 땅 바로 뒤 풀숲 실루엣 */
  const p3 = .74, base3 = GY - 4; x.fillStyle = th.l3; hillPath(x, W, H, base3, cam, p3, .0073, 16, .019, 8, 20);
  const off3 = cam * p3, sp3 = 64;
  for (let i = Math.floor(off3 / sp3) - 1; i < (off3 + W) / sp3 + 1; i++) {
    const hh = hash(i * 29 + 11), wx = i * sp3 + hh * 40, X = wx - off3, y = hillY(wx, base3, .0073, 16, .019, 8) + 4, swy = Math.sin(t * 1.6 + i) * 3;
    if (hh < .45) { x.fillStyle = th.l3; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(X + k * 5 - 3, y); x.quadraticCurveTo(X + k * 7 + swy * .5, y - 20 - hh * 30, X + k * 11 + swy, y - 30 - hh * 44 + Math.abs(k) * 8); x.quadraticCurveTo(X + k * 6 + 3, y - 14, X + k * 5 + 3, y); x.fill(); } }
    else if (hh < .75) { x.fillStyle = th.l3; circ(x, X, y - 6, 16 + hh * 10); circ(x, X + 18, y - 2, 12 + hh * 8); x.fillStyle = mix(th.l3, th.sky[2], .22); ell(x, X - 3, y - 14 - hh * 6, 9, 4, -.3); }
    else { x.strokeStyle = th.l3; x.lineWidth = 3; x.beginPath(); x.moveTo(X, y); x.quadraticCurveTo(X + swy * .4, y - 22, X + swy, y - 40); x.stroke(); aglow(x, X + swy, y - 44, 13, rgbOf(th.lit), .55); x.fillStyle = th.lit; circ(x, X + swy, y - 44, 4.2); }
  }
  /* 입자 */
  for (let i = 0; i < 30; i++) {
    const r = hash(i + 500), fall = th.part === 'snow' || th.part === 'leaf';
    const px = ((hash(i) * (W + 60) + (fall ? t * 22 : 0) - cam * .8) % (W + 60) + W + 60) % (W + 60) - 30;
    const py = fall ? (r * H + t * (30 + r * 44)) % (GY + 20) : GY - ((r * GY + t * (18 + r * 34)) % GY), k = fall ? 1 : py / GY;
    if (th.part === 'ember') { x.fillStyle = `rgba(255,${170 + r * 70 | 0},90,${.25 + k * .7})`; spark(x, px + Math.sin(t * 2 + i) * 9, py, 2 + r * 3.4, x.fillStyle); }
    else if (th.part === 'snow') { x.fillStyle = 'rgba(255,255,255,.88)'; if (i % 4) circ(x, px + Math.sin(t + i) * 12, py, 1.6 + r * 2.4); else spark(x, px + Math.sin(t + i) * 12, py, 4 + r * 3, 'rgba(255,255,255,.9)'); }
    else if (th.part === 'leaf') { x.save(); x.translate(px + Math.sin(t + i) * 18, py); x.rotate(t * (1 + r) + i); x.fillStyle = i & 1 ? 'rgba(198,245,90,.85)' : 'rgba(255,226,122,.85)'; x.beginPath(); x.moveTo(-6, 0); x.quadraticCurveTo(0, -5, 6, 0); x.quadraticCurveTo(0, 5, -6, 0); x.fill(); x.restore(); }
    else if (th.part === 'bubble') { x.fillStyle = 'rgba(255,255,255,.2)'; circ(x, px + Math.sin(t + i) * 6, py, 3 + r * 6); x.fillStyle = 'rgba(255,255,255,.75)'; circ(x, px + Math.sin(t + i) * 6 + 1.5 + r * 2, py - 1.5 - r * 2, 1 + r); }
    else if (th.part === 'note') { const nx = px + Math.sin(t + i) * 10; x.globalAlpha = .35 + r * .45; x.fillStyle = i & 1 ? th.lit : '#fff'; ell(x, nx, py, 4 + r * 2, 3 + r * 1.4, -.4); x.fillRect(nx + 3 + r * 1.6, py - 14 - r * 4, 1.6, 14 + r * 4); if (i % 3 === 0) { x.beginPath(); x.moveTo(nx + 3 + r * 1.6, py - 14 - r * 4); x.quadraticCurveTo(nx + 12, py - 12, nx + 10, py - 5); x.quadraticCurveTo(nx + 9, py - 9, nx + 4.6 + r * 1.6, py - 9); x.fill(); } x.globalAlpha = 1; }
    else if (th.part === 'smoke') { x.fillStyle = `rgba(255,255,255,${.06 + r * .08})`; circ(x, px, py, 12 + r * 18); }
  }
};
/* 캐릭터 앞에 깔리는 레이어: 큰 풀잎 실루엣 + 빛줄기 + 가장자리 어둡게 */
Art.fg = (x, W, H, cam, th, t, GY) => {
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const bx = W * (.2 + i * .22) - (cam * .06) % 80 + Math.sin(t * .3 + i) * 20; x.fillStyle = `rgba(255,255,255,${.035 + .02 * Math.sin(t * .7 + i * 2)})`; poly(x, [bx + 190, -10, bx + 250 + i * 12, -10, bx + 40 + i * 12, GY + 20, bx - 60, GY + 20]); }
  x.restore();
  const par = 1.45, off = cam * par, sp = 430, col = mix(th.l3, '#12063a', .5), colL = mix(th.l3, '#12063a', .25);
  for (let i = Math.floor(off / sp) - 1; i < (off + W) / sp + 1; i++) {
    const hh = hash(i * 41 + 7), X = i * sp - off + hh * 200, B = H + 10, sw = Math.sin(t * 1.1 + i) * .05; if (hh < .3) continue;
    for (let k = 0; k < 5; k++) { x.save(); x.translate(X + k * 8, B); x.rotate(-.7 + k * .34 + sw * (k - 2)); x.fillStyle = k & 1 ? colL : col; const ln = 110 + hash(i + k) * 70; x.beginPath(); x.moveTo(-9, 0); x.quadraticCurveTo(-16, -ln * .55, 0, -ln); x.quadraticCurveTo(16, -ln * .5, 9, 0); x.fill(); x.restore(); }
  }
  const v = x.createRadialGradient(W / 2, H * .45, H * .45, W / 2, H * .45, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(20,6,60,0)'); v.addColorStop(1, 'rgba(20,6,60,.4)'); x.fillStyle = v; x.fillRect(0, -200, W, H + 400);
};
Art.ground = (x, X, Y, w, h, th, float) => {
  const seed = Math.round(X / 7);
  if (float) {
    x.fillStyle = dk(th.g2, .2); x.beginPath(); x.moveTo(X + 4, Y + 6); x.quadraticCurveTo(X + w * .3, Y + h + 20, X + w * .5, Y + h + 8); x.quadraticCurveTo(X + w * .75, Y + h + 22, X + w - 4, Y + 6); x.fill();
    x.fillStyle = th.g2; rr(x, X, Y + 2, w, Math.min(h, 16), 8); x.fill(); x.fillStyle = th.g1; rr(x, X, Y, w, 10, 5); x.fill(); x.fillStyle = th.top; rr(x, X - 2, Y - 4, w + 4, 8, 4); x.fill();
    x.fillStyle = lt(th.top, .5); rr(x, X + 6, Y - 3, w * .4, 2.4, 1.2); x.fill();
    for (let i = 0; i < 3; i++) { const cx = X + w * (.25 + i * .25); x.fillStyle = th.lit; x.globalAlpha = .8; poly(x, [cx - 3, Y + h + 6 + i * 3, cx, Y + h + 18 + i * 4, cx + 3, Y + h + 6 + i * 3]); x.globalAlpha = 1; }
    return;
  }
  x.fillStyle = th.g2; rr(x, X, Y, w, h, 6); x.fill();
  x.fillStyle = dk(th.g2, .22); for (let i = 10; i < w - 30; i += 58) { const hh = hash(seed + i); rr(x, X + i + hh * 18, Y + 44 + hh * 60, 26 + hh * 20, 9, 4.5); x.fill(); rr(x, X + i + 22 - hh * 14, Y + 78 + hh * 80, 14 + hh * 12, 7, 3.5); x.fill(); }
  x.fillStyle = mix(th.g2, th.g1, .5); for (let i = 26; i < w - 20; i += 74) { const hh = hash(seed + i * 3); circ(x, X + i + hh * 24, Y + 58 + hh * 70, 3.5 + hh * 4); }
  x.fillStyle = th.g1; x.beginPath(); x.moveTo(X, Y + 6); x.lineTo(X + w, Y + 6); x.lineTo(X + w, Y + 24); for (let i = w; i >= 0; i -= 22) x.quadraticCurveTo(X + i - 11, Y + 24 + 9 + hash(seed + i) * 7, X + Math.max(0, i - 22), Y + 24); x.closePath(); x.fill();
  x.fillStyle = th.top; rr(x, X - 2, Y - 4, w + 4, 12, 6); x.fill(); x.fillStyle = lt(th.top, .5); for (let i = 8; i < w - 40; i += 96) { rr(x, X + i + hash(seed + i) * 30, Y - 2, 34, 2.6, 1.3); x.fill(); }
  /* 풀/돌기 */
  for (let i = 14; i < w - 10; i += 38) { const hh = hash(seed + i * 7); if (hh < .4) continue; const cx = X + i + hh * 12; x.fillStyle = hh > .8 ? th.lit : lt(th.top, .25); if (hh > .8) { circ(x, cx, Y - 8, 3); x.fillStyle = th.top; x.fillRect(cx - .8, Y - 6, 1.6, 4); } else { poly(x, [cx - 4, Y - 3, cx - 2, Y - 11 - hh * 5, cx, Y - 3]); poly(x, [cx, Y - 3, cx + 3, Y - 9 - hh * 4, cx + 5, Y - 3]); } }
};
/* HUD/표식용 벡터 아이콘 */
Art.heart = (x, cx, cy, r, on) => { x.fillStyle = on ? '#ff4f7d' : 'rgba(255,255,255,.25)'; x.beginPath(); x.moveTo(cx, cy + r); x.bezierCurveTo(cx - r * 1.6, cy - r * .2, cx - r * .8, cy - r * 1.3, cx, cy - r * .45); x.bezierCurveTo(cx + r * .8, cy - r * 1.3, cx + r * 1.6, cy - r * .2, cx, cy + r); x.fill(); if (on) { x.fillStyle = '#ffb3c7'; ell(x, cx - r * .45, cy - r * .45, r * .26, r * .16, -.6); } };
Art.marker = (x, cx, cy, t, kind) => {
  const b = backOut(Math.min(1, (t * 1.4) % 1.6)) * 1; x.save(); x.translate(cx, cy + Math.sin(t * 4) * 4); x.scale(.8 + .2 * b, .8 + .2 * b);
  aglow(x, 0, 0, 30, 'rgb(255,214,102)', .5); x.fillStyle = '#ffcf4a'; x.beginPath(); x.arc(0, -4, 15, Math.PI * .85, Math.PI * .15); x.lineTo(0, 20); x.closePath(); x.fill(); x.fillStyle = '#fff3b0'; x.beginPath(); x.arc(0, -4, 15, Math.PI * 1.5, Math.PI * .15); x.lineTo(0, 20); x.lineTo(0, -19); x.fill();
  x.fillStyle = '#40238f';
  if (kind === 'camp') poly(x, [-8, 3, 0, -13, 8, 3]); else if (kind === 'portal') spark(x, 0, -4, 9, '#40238f'); else { rr(x, -2.2, -13, 4.4, 11, 2.2); x.fill(); circ(x, 0, 3, 2.6); }
  x.restore();
};
