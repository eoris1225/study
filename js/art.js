'use strict';
/* 캔버스 벡터 그래픽: SD 캐릭터, 몬스터, 배경 */
const Art = {};
Art.HAIRS = ['단발', '긴 머리', '양갈래', '삐죽', '포니테일'];
Art.ACCS = ['없음', '리본', '마법사 모자', '꽃', '왕관', '고글'];
const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`; };

/* L: {skin,hair,hairStyle,eye,outfit,wings,wingColor,acc}  o: {t,walk,dir,air} — (X,Y)는 발 위치 */
Art.chibi = (x, X, Y, s, L, o = {}) => {
  const t = o.t || 0, fly = !!L.wings, hov = fly ? Math.sin(t * 4) * 3 - 8 : 0, sw = o.walk && !fly ? Math.sin(t * 15) : 0, air = o.air && !fly;
  x.save(); x.translate(X, Y); x.scale(s * (o.dir < 0 ? -1 : 1), s); x.translate(0, hov + (o.walk && !fly ? Math.abs(sw) * -1.5 : 0));
  const hair = L.hair, hairD = shade(L.hair, .75), out = L.outfit, outD = shade(L.outfit, .7), skin = L.skin || '#f6d9c0';
  x.lineJoin = 'round'; x.lineCap = 'round';
  // 날개
  if (fly) { const f = Math.sin(t * 20) * .3; for (const d of [-1, 1]) { x.save(); x.translate(d * 6, -30); x.rotate(d * (.45 + f)); x.fillStyle = L.wingColor || 'rgba(190,235,255,.7)'; x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1; x.beginPath(); x.ellipse(d * 13, -8, 15, 8, d * -.3, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.ellipse(d * 10, 6, 10, 5, d * .5, 0, 7); x.fill(); x.stroke(); x.restore(); } }
  // 뒷머리
  x.fillStyle = hairD;
  if (L.hairStyle === 1) { rr(x, -16, -48, 32, 40, 12); x.fill(); }
  if (L.hairStyle === 2) { for (const d of [-1, 1]) { x.beginPath(); x.ellipse(d * 19, -30 + Math.sin(t * 5 + d) * 1.5, 6, 15, d * .25, 0, 7); x.fill(); } }
  if (L.hairStyle === 4) { x.beginPath(); x.ellipse(-17, -34 + Math.sin(t * 5) * 1.5, 6, 16, .5, 0, 7); x.fill(); }
  // 다리
  x.fillStyle = '#4a3a34';
  if (fly) { rr(x, -7, -10, 5, 9, 2); x.fill(); rr(x, 2, -10, 5, 9, 2); x.fill(); }
  else if (air) { rr(x, -9, -11, 6, 9, 2); x.fill(); rr(x, 4, -12, 6, 9, 2); x.fill(); }
  else { rr(x, -8 + sw * 4, -10, 6, 10, 2); x.fill(); rr(x, 2 - sw * 4, -10, 6, 10, 2); x.fill(); }
  // 몸 (원피스/튜닉)
  x.fillStyle = out; x.beginPath(); x.moveTo(-8, -30); x.lineTo(8, -30); x.lineTo(12, -9); x.quadraticCurveTo(0, -5, -12, -9); x.closePath(); x.fill();
  x.fillStyle = outD; x.beginPath(); x.moveTo(-12, -9); x.quadraticCurveTo(0, -5, 12, -9); x.lineTo(11.5, -12); x.quadraticCurveTo(0, -8, -11.5, -12); x.closePath(); x.fill();
  x.fillStyle = '#ffe9a8'; x.beginPath(); x.arc(0, -25, 2, 0, 7); x.fill();
  // 팔
  x.fillStyle = skin; const aw = air ? -6 : sw * 3;
  x.beginPath(); x.arc(-11, -21 - aw, 3.4, 0, 7); x.fill(); x.beginPath(); x.arc(11, -21 + aw, 3.4, 0, 7); x.fill();
  // 머리
  x.fillStyle = skin; x.beginPath(); x.arc(0, -43, 15, 0, 7); x.fill();
  if (fly) { for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * 13, -46); x.lineTo(d * 22, -50); x.lineTo(d * 14, -40); x.closePath(); x.fill(); } }
  // 얼굴
  const ex = 1.5;
  for (const d of [-1, 1]) {
    x.fillStyle = '#2b2233'; x.beginPath(); x.ellipse(d * 6 + ex, -41, 3.2, 4.4, 0, 0, 7); x.fill();
    x.fillStyle = L.eye || '#6b4a2f'; x.beginPath(); x.ellipse(d * 6 + ex, -40, 2.3, 3, 0, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(d * 6 + ex + 1, -42.5, 1.2, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,120,140,.45)'; x.beginPath(); x.ellipse(d * 10 + ex, -35.5, 3, 1.8, 0, 0, 7); x.fill();
  }
  x.strokeStyle = '#8a4b4b'; x.lineWidth = 1.2; x.beginPath(); x.arc(ex, -36, 2.2, .15 * Math.PI, .85 * Math.PI); x.stroke();
  // 앞머리
  x.fillStyle = hair; x.beginPath(); x.arc(0, -43, 16, Math.PI * 1.02, Math.PI * 1.98);
  x.quadraticCurveTo(13, -40, 9, -47); x.quadraticCurveTo(6, -41, 2, -48); x.quadraticCurveTo(-2, -41, -6, -48); x.quadraticCurveTo(-10, -41, -16, -43); x.closePath(); x.fill();
  if (L.hairStyle === 3) { for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * 6 - 5, -55); x.lineTo(i * 7, -66 - (i === 0 ? 4 : 0)); x.lineTo(i * 6 + 5, -55); x.closePath(); x.fill(); } }
  if (L.hairStyle === 2) { x.fillStyle = '#ff8fb1'; for (const d of [-1, 1]) { x.beginPath(); x.arc(d * 15, -47, 3, 0, 7); x.fill(); } }
  x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.ellipse(-5, -54, 6, 2, -.3, 0, 7); x.fill();
  // 장식
  const a = L.acc | 0;
  if (a === 1) { x.fillStyle = '#ff6f91'; x.beginPath(); x.moveTo(8, -56); x.lineTo(18, -62); x.lineTo(17, -51); x.closePath(); x.fill(); x.beginPath(); x.moveTo(8, -56); x.lineTo(-1, -62); x.lineTo(0, -52); x.closePath(); x.fill(); x.fillStyle = '#ffd1dc'; x.beginPath(); x.arc(8, -56, 2.5, 0, 7); x.fill(); }
  if (a === 2) { x.fillStyle = '#3b2a5c'; x.beginPath(); x.ellipse(0, -55, 21, 5, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(-12, -56); x.quadraticCurveTo(-2, -74, 9, -82); x.quadraticCurveTo(7, -66, 12, -56); x.closePath(); x.fill(); x.fillStyle = '#ffd166'; x.fillRect(-11, -60, 22, 3); }
  if (a === 3) { x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(11 + Math.cos(i * 1.257) * 3.5, -54 + Math.sin(i * 1.257) * 3.5, 2.6, 0, 7); x.fill(); } x.fillStyle = '#ffd166'; x.beginPath(); x.arc(11, -54, 2, 0, 7); x.fill(); }
  if (a === 4) { x.fillStyle = '#ffd166'; x.beginPath(); x.moveTo(-9, -57); x.lineTo(-10, -67); x.lineTo(-5, -61); x.lineTo(0, -69); x.lineTo(5, -61); x.lineTo(10, -67); x.lineTo(9, -57); x.closePath(); x.fill(); x.fillStyle = '#e2552b'; x.beginPath(); x.arc(0, -61, 1.6, 0, 7); x.fill(); }
  if (a === 5) { x.fillStyle = '#6d5a3a'; x.fillRect(-15, -56, 30, 3); for (const d of [-1, 1]) { x.fillStyle = '#b08a3a'; x.beginPath(); x.arc(d * 6, -55, 5, 0, 7); x.fill(); x.fillStyle = '#9fe3ff'; x.beginPath(); x.arc(d * 6, -55, 3.2, 0, 7); x.fill(); } }
  x.restore();
};
const pcache = {};
Art.portrait = (L, size = 72) => {
  const k = JSON.stringify([L.skin, L.hair, L.hairStyle, L.eye, L.outfit, L.wings, L.wingColor, L.acc]);
  if (!pcache[k]) { const c = document.createElement('canvas'); c.width = c.height = 144; const x = c.getContext('2d'); const g = x.createRadialGradient(72, 60, 10, 72, 72, 100); g.addColorStop(0, '#3a2f52'); g.addColorStop(1, '#15121c'); x.fillStyle = g; rr(x, 0, 0, 144, 144, 22); x.fill(); x.save(); rr(x, 0, 0, 144, 144, 22); x.clip(); Art.chibi(x, 72, L.wings ? 214 : 196, 2.9, L, { t: 0 }); x.restore(); pcache[k] = c.toDataURL(); }
  return `<img src="${pcache[k]}" width="${size}" height="${size}" style="border-radius:${size / 6}px;display:block" alt="">`;
};

/* 몬스터: kind 0 슬라임, 1 뿔, 2 유령, 3 톱니 */
Art.monster = (x, X, Y, s, kind, col, t, boss) => {
  const b = Math.sin(t * 5) * .06; x.save(); x.translate(X, Y); x.scale(s, s);
  if (boss) { const g = x.createRadialGradient(0, -30, 5, 0, -30, 70); g.addColorStop(0, 'rgba(255,90,90,.35)'); g.addColorStop(1, 'rgba(255,90,90,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, -30, 70, 0, 7); x.fill(); }
  x.scale(1 + b, 1 - b); const d = shade(col, .65);
  if (kind === 3) { x.fillStyle = d; for (let i = 0; i < 8; i++) { x.save(); x.translate(0, -24); x.rotate(i * Math.PI / 4 + t); x.fillRect(-5, -32, 10, 12); x.restore(); } }
  if (kind === 1) { x.fillStyle = '#f4e6c8'; for (const q of [-1, 1]) { x.beginPath(); x.moveTo(q * 10, -42); x.lineTo(q * 20, -60); x.lineTo(q * 18, -38); x.closePath(); x.fill(); } }
  x.fillStyle = col; x.beginPath();
  if (kind === 2) { x.moveTo(-24, 0); x.lineTo(-24, -28); x.arc(0, -28, 24, Math.PI, 0); x.lineTo(24, 0); for (let i = 3; i >= -3; i--) x.lineTo(i * 8, i % 2 ? -7 : 0); }
  else { x.moveTo(-26, 0); x.bezierCurveTo(-32, -30, -18, -50, 0, -50); x.bezierCurveTo(18, -50, 32, -30, 26, 0); }
  x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.ellipse(-9, -38, 8, 4, -.5, 0, 7); x.fill();
  for (const q of [-1, 1]) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(q * 9, -26, 6, 7, 0, 0, 7); x.fill(); x.fillStyle = '#2b2233'; x.beginPath(); x.arc(q * 9 - 2, -25, 3, 0, 7); x.fill(); x.strokeStyle = '#2b2233'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(q * 3, -33); x.lineTo(q * 15, -37); x.stroke(); }
  x.fillStyle = '#2b2233'; x.beginPath(); x.arc(0, -13, 5, 0, Math.PI); x.fill(); x.fillStyle = '#fff'; x.fillRect(-4, -13, 3, 3); x.fillRect(1, -13, 3, 3);
  if (boss) { x.fillStyle = '#ffd166'; x.beginPath(); x.moveTo(-14, -50); x.lineTo(-16, -66); x.lineTo(-7, -57); x.lineTo(0, -70); x.lineTo(7, -57); x.lineTo(16, -66); x.lineTo(14, -50); x.closePath(); x.fill(); }
  x.restore();
};
Art.slime = (x, X, Y, col, t, squash) => { const b = Math.sin(t * 6) * .1; x.save(); x.translate(X, Y); x.scale(1 + b, squash ? .3 : 1 - b); x.fillStyle = col; x.beginPath(); x.moveTo(-16, 0); x.bezierCurveTo(-20, -18, -10, -26, 0, -26); x.bezierCurveTo(10, -26, 20, -18, 16, 0); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(-5, -13, 4, 0, 7); x.arc(6, -13, 4, 0, 7); x.fill(); x.fillStyle = '#2b2233'; x.beginPath(); x.arc(-5, -12, 2, 0, 7); x.arc(6, -12, 2, 0, 7); x.fill(); x.restore(); };
Art.orb = (x, X, Y, t) => { const p = Math.sin(t * 5 + X) * 3; const g = x.createRadialGradient(X, Y + p, 1, X, Y + p, 12); g.addColorStop(0, '#fff8d0'); g.addColorStop(.5, '#ffd166'); g.addColorStop(1, 'rgba(255,209,102,0)'); x.fillStyle = g; x.beginPath(); x.arc(X, Y + p, 12, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(X, Y + p - 6); x.lineTo(X + 4, Y + p); x.lineTo(X, Y + p + 6); x.lineTo(X - 4, Y + p); x.closePath(); x.fill(); };
Art.campfire = (x, X, Y, t) => { x.fillStyle = '#5c4630'; x.beginPath(); x.moveTo(X + 60, Y); x.lineTo(X + 110, Y - 70); x.lineTo(X + 160, Y); x.closePath(); x.fill(); x.fillStyle = '#2a2018'; x.beginPath(); x.moveTo(X + 98, Y); x.lineTo(X + 110, Y - 36); x.lineTo(X + 122, Y); x.closePath(); x.fill(); x.strokeStyle = '#6b4a2f'; x.lineWidth = 6; x.beginPath(); x.moveTo(X - 16, Y - 2); x.lineTo(X + 16, Y - 8); x.moveTo(X - 16, Y - 8); x.lineTo(X + 16, Y - 2); x.stroke(); for (let i = 0; i < 3; i++) { const h = 26 + Math.sin(t * 9 + i * 2) * 8 - i * 6; x.fillStyle = ['#e2552b', '#ffa13d', '#ffe27a'][i]; x.beginPath(); x.moveTo(X - 12 + i * 3, Y - 6); x.quadraticCurveTo(X - 6 + Math.sin(t * 7 + i) * 4, Y - 10 - h, X, Y - 12 - h); x.quadraticCurveTo(X + 8, Y - 10 - h * .6, X + 12 - i * 3, Y - 6); x.closePath(); x.fill(); } };
Art.portal = (x, X, Y, t) => { for (let i = 0; i < 3; i++) { x.strokeStyle = `rgba(${180 + i * 30},${160 + i * 30},255,${.8 - i * .2})`; x.lineWidth = 5 - i; x.beginPath(); x.ellipse(X, Y - 60, 30 + i * 8 + Math.sin(t * 3 + i) * 3, 56 + i * 8, 0, 0, 7); x.stroke(); } const g = x.createRadialGradient(X, Y - 60, 2, X, Y - 60, 50); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(140,120,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(X, Y - 60, 28, 54, 0, 0, 7); x.fill(); };

/* 배경 */
Art.THEMES = [
  { sky: ['#1a1026', '#5a2418'], far: '#2a1620', mid: '#3d1f1c', g1: '#5a4038', g2: '#3a2a26', top: '#c9a37a', deco: 'gear', part: 'ember', slime: '#ff8a5c' },
  { sky: ['#1c1a2a', '#6b4a1c'], far: '#2a2430', mid: '#3d3226', g1: '#5c5046', g2: '#3a332e', top: '#d9b25f', deco: 'chimney', part: 'smoke', slime: '#c9a15c' },
  { sky: ['#07122b', '#2a5c8a'], far: '#12305a', mid: '#1d4a7a', g1: '#9fc4e6', g2: '#5b86b3', top: '#f2fbff', deco: 'crystal', part: 'snow', slime: '#8fd3ff' },
  { sky: ['#0b2a2a', '#2f7a5c'], far: '#11403a', mid: '#1c5a48', g1: '#4d7a4a', g2: '#33523a', top: '#9fe07a', deco: 'string', part: 'leaf', slime: '#9be36f' },
  { sky: ['#0b2440', '#3a9ac4'], far: '#12507a', mid: '#1c6a94', g1: '#e0c890', g2: '#b89a62', top: '#fff0c0', deco: 'wave', part: 'bubble', slime: '#6fd0e3' },
  { sky: ['#140c2e', '#4a2a7a'], far: '#22164a', mid: '#33206a', g1: '#6a5a8a', g2: '#463a62', top: '#c9b6ff', deco: 'arch', part: 'note', slime: '#c58cff' },
  { sky: ['#1a1030', '#c4743a'], far: '#3a2040', mid: '#5a3038', g1: '#7a6048', g2: '#4f3d30', top: '#ffd166', deco: 'harp', part: 'note', slime: '#ffd166' }
];
Art.bg = (x, W, H, cam, th, t, GY) => {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const sx = (i * 197 - cam * .05) % (W + 40), sy = (i * 89) % (GY - 120); x.fillStyle = `rgba(255,255,255,${.25 + .25 * Math.sin(t * 2 + i)})`; x.fillRect((sx + W + 40) % (W + 40) - 20, sy, 2, 2); }
  x.fillStyle = 'rgba(255,240,200,.85)'; x.beginPath(); x.arc(W * .8 - cam * .02, 90, 34, 0, 7); x.fill(); x.fillStyle = th.sky[0]; x.beginPath(); x.arc(W * .8 - cam * .02 + 14, 82, 30, 0, 7); x.fill();
  // far deco
  const off = cam * .25, sp = 380; x.fillStyle = th.far;
  for (let i = Math.floor(off / sp) - 1; i < (off + W) / sp + 1; i++) {
    const X = i * sp - off, h = 150 + ((i * 7919) % 5 + 5) % 5 * 28, B = GY + 20;
    switch (th.deco) {
      case 'gear': x.fillRect(X + 60, B - h, 120, h); x.fillRect(X + 40, B - h - 20, 160, 24); x.save(); x.translate(X + 280, B - 110); x.rotate(t * .3 + i); for (let k = 0; k < 8; k++) { x.rotate(Math.PI / 4); x.fillRect(-9, -62, 18, 20); } x.beginPath(); x.arc(0, 0, 46, 0, 7); x.fill(); x.restore(); break;
      case 'chimney': x.fillRect(X + 40, B - h * .7, 200, h); x.fillRect(X + 70, B - h - 60, 30, h); x.fillRect(X + 170, B - h - 20, 26, h); x.fillStyle = 'rgba(200,200,210,.15)'; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(X + 85 + Math.sin(t + k) * 10 + k * 8, B - h - 80 - k * 26 - (t * 12) % 26, 14 + k * 5, 0, 7); x.fill(); } x.fillStyle = th.far; break;
      case 'crystal': for (let k = 0; k < 3; k++) { const cx = X + 80 + k * 90, ch = h - k * 40; x.beginPath(); x.moveTo(cx - 28, B); x.lineTo(cx - 10, B - ch); x.lineTo(cx + 6, B - ch - 26); x.lineTo(cx + 28, B); x.closePath(); x.fill(); } break;
      case 'string': x.beginPath(); x.moveTo(X, B); x.quadraticCurveTo(X + 190, B - h - 120, X + 380, B); x.fill(); x.strokeStyle = 'rgba(255,230,160,.25)'; x.lineWidth = 2; x.beginPath(); x.moveTo(X + 100, 0); x.quadraticCurveTo(X + 110 + Math.sin(t * 6 + i) * 8, B / 2, X + 100, B); x.stroke(); break;
      case 'wave': x.beginPath(); x.moveTo(X, B); for (let k = 0; k <= 38; k++) x.lineTo(X + k * 10, B - 90 - Math.sin(k * .5 + t * 1.5 + i) * 26 - (i % 2) * 30); x.lineTo(X + 380, B); x.fill(); break;
      case 'arch': x.fillRect(X + 40, B - h - 60, 36, h + 60); x.fillRect(X + 260, B - h - 60, 36, h + 60); x.beginPath(); x.moveTo(X + 40, B - h - 60); x.quadraticCurveTo(X + 168, B - h - 220, X + 296, B - h - 60); x.lineTo(X + 296, B - h - 30); x.quadraticCurveTo(X + 168, B - h - 170, X + 40, B - h - 30); x.fill(); x.fillStyle = 'rgba(255,220,140,.25)'; x.beginPath(); x.arc(X + 168, B - h + 10, 26, 0, 7); x.fill(); x.fillStyle = th.far; break;
      case 'harp': x.fillRect(X + 60, B - h - 120, 20, h + 120); x.beginPath(); x.moveTo(X + 60, B - h - 120); x.quadraticCurveTo(X + 220, B - h - 200, X + 300, B - 40); x.lineTo(X + 280, B - 40); x.quadraticCurveTo(X + 210, B - h - 160, X + 80, B - h - 100); x.fill(); x.strokeStyle = 'rgba(255,220,140,.35)'; x.lineWidth = 1.5; for (let k = 1; k < 7; k++) { x.beginPath(); x.moveTo(X + 80 + k * 28, B - h - 110 + k * k * 3); x.lineTo(X + 80 + k * 28 + Math.sin(t * 9 + k) * 2, B); x.stroke(); } break;
    }
  }
  // mid hills
  x.fillStyle = th.mid; x.beginPath(); x.moveTo(0, H); for (let X = 0; X <= W + 20; X += 20) { const wx = X + cam * .5; x.lineTo(X, GY - 40 - Math.sin(wx * .004) * 46 - Math.sin(wx * .011) * 22); } x.lineTo(W, H); x.fill();
  // particles
  for (let i = 0; i < 26; i++) {
    const px = ((i * 131 + (th.part === 'snow' || th.part === 'leaf' ? t * 20 : 0) - cam * .7) % (W + 60) + W + 60) % (W + 60) - 30, r = (i * 53) % 100 / 100;
    let py;
    if (th.part === 'snow' || th.part === 'leaf') py = (r * H + t * (30 + r * 40)) % (GY + 20); else py = GY - ((r * GY + t * (20 + r * 30)) % GY);
    if (th.part === 'ember') { x.fillStyle = `rgba(255,${140 + r * 80},60,${.7 - py / GY * .2})`; x.fillRect(px + Math.sin(t * 2 + i) * 8, py, 3, 3); }
    else if (th.part === 'snow') { x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(px + Math.sin(t + i) * 12, py, 2 + r * 2, 0, 7); x.fill(); }
    else if (th.part === 'leaf') { x.fillStyle = 'rgba(170,230,120,.7)'; x.beginPath(); x.ellipse(px + Math.sin(t + i) * 16, py, 5, 2.5, t + i, 0, 7); x.fill(); }
    else if (th.part === 'bubble') { x.strokeStyle = 'rgba(200,240,255,.5)'; x.lineWidth = 1.5; x.beginPath(); x.arc(px + Math.sin(t + i) * 6, py, 3 + r * 5, 0, 7); x.stroke(); }
    else if (th.part === 'note') { x.fillStyle = `rgba(255,230,170,${.35 + r * .3})`; x.font = `${14 + r * 10}px serif`; x.fillText(i % 2 ? '♪' : '♫', px + Math.sin(t + i) * 10, py); }
    else if (th.part === 'smoke') { x.fillStyle = 'rgba(210,200,190,.12)'; x.beginPath(); x.arc(px, py, 10 + r * 14, 0, 7); x.fill(); }
  }
};
Art.ground = (x, X, Y, w, h, th, float) => {
  x.fillStyle = th.g2; rr(x, X, Y, w, h, float ? 7 : 4); x.fill(); x.fillStyle = th.g1; rr(x, X, Y, w, Math.min(h, float ? 12 : 26), float ? 7 : 4); x.fill(); x.fillStyle = th.top; rr(x, X, Y - 2, w, 7, 3); x.fill();
  if (!float) { x.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 14; i < w - 10; i += 46) { x.fillRect(X + i, Y + 36 + (i * 7 % 3) * 18, 20, 6); } }
};
