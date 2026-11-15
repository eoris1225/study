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
/* 머리: 정원 대신 스쿼클. 위는 넓고 턱 쪽이 살짝 좁아진다 */
const _hp = new Map();
const headPts = R => { let p = _hp.get(R); if (p) return p; p = []; const n = 44, e = 2.9; for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a); let px = Math.sign(c) * Math.pow(Math.abs(c), 2 / e) * R, py = Math.sign(s) * Math.pow(Math.abs(s), 2 / e) * R; if (py > 0) px *= 1 - .14 * Math.pow(py / R, 1.4); p.push(px * 1.1, py * .97); } _hp.set(R, p); return p; };
const headPath = (x, R, dx = 0, dy = 0) => { const p = headPts(R); x.beginPath(); x.moveTo(p[0] + dx, p[1] + dy); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i] + dx, p[i + 1] + dy); x.closePath(); };
/* 가장자리 림 라이트: a0~a1 은 둘레 비율 (0 오른쪽, .25 아래, .5 왼쪽, .75 위) */
const rimLine = (x, R, a0, a1, col, w, k = .84) => { const p = headPts(R), n = p.length / 2, i0 = Math.round(a0 * n), i1 = Math.round(a1 * n); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); for (let i = i0; i <= i1; i++) { const j = (i % n) * 2; i === i0 ? x.moveTo(p[j] * k, p[j + 1] * k) : x.lineTo(p[j] * k, p[j + 1] * k); } x.stroke(); };
const INK = '#2a1746';
/* 얼굴: 얼굴 아래쪽에 작은 반쯤 감긴 눈 + 눈꺼풀 선, 짧은 눈썹, 알약 볼터치, 코·입은 짧은 선 */
/* 얼굴: 큼직한 둥근 눈(흰자·반짝이 없음), 두꺼운 둥근 눈썹, 동그란 코, 작은 알약 입, 번지는 볼 */
const softDot = (x, cx, cy, r, rgb, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); };
const face = (x, kind, R, t, blink, look, skin, hairD, eyeC, mouthOpen) => {
  const fx = R * .1 + look, ey = R * .3, er = R * (kind === 'ignis' ? .16 : .2), ec = mix(eyeC || '#4a2a8a', '#2a1746', .66);
  for (const d of [-1, 1]) softDot(x, fx + d * R * .56, ey + R * .3, R * .3, '255,70,120', .4);
  x.lineCap = 'round';
  for (const d of [-1, 1]) {
    const cx = fx + d * R * .47;
    if (blink) { x.strokeStyle = ec; x.lineWidth = R * .09; x.beginPath(); x.arc(cx, ey - er * .3, er * .9, .5, Math.PI - .5); x.stroke(); }
    else { x.fillStyle = ec; x.beginPath(); x.ellipse(cx, ey, er, er * 1.08, 0, 0, TAU); x.fill(); }
    x.strokeStyle = hairD; x.lineWidth = R * .14; x.beginPath();
    const tilt = kind === 'ignis' ? d * R * .07 : kind === 'clausia' ? -d * R * .03 : 0;
    x.moveTo(cx - R * .15, ey - R * .4 + tilt); x.lineTo(cx + R * .15, ey - R * .44 - tilt); x.stroke();
  }
  x.fillStyle = mix(skin, '#ff4f6d', .32); circ(x, fx + R * .06, ey + R * .2, R * .12);
  x.fillStyle = 'rgba(255,255,255,.35)'; circ(x, fx + R * .09, ey + R * .16, R * .045);
  if (kind === 'ignis') return;
  x.fillStyle = '#c23a5e';
  if (mouthOpen) { x.beginPath(); x.ellipse(fx + R * .05, ey + R * .46, R * .11, R * .05 + mouthOpen * R * .08, 0, 0, TAU); x.fill(); }
  else { rr(x, fx + R * .05 - R * .12, ey + R * .42, R * .24, R * .085, R * .042); x.fill(); }
};
const ears = (x, R, skin, skinD) => { for (const d of [-1, 1]) { x.fillStyle = d < 0 ? skinD : mix(skin, skinD, .4); circ(x, d * R * 1.08, R * .3, R * .24); x.fillStyle = mix(skinD, '#c2557a', .25); circ(x, d * R * 1.11, R * .32, R * .1); } };
const capsule = (x, cx, cy, len, w, rot) => { x.save(); x.translate(cx, cy); x.rotate(rot); rr(x, -len / 2, -w / 2, len, w, w / 2); x.fill(); x.restore(); };
const hairFront = (x, L, R, sway, hair, hairD, hairL, shadowCol) => {
  const st = L.hairStyle | 0;
  hairShape(x, st, R, sway);
  if (shadowCol) { x.fillStyle = shadowCol; x.fill(); return; }
  const g = x.createLinearGradient(R * .6, -R * 1.4, -R * .9, R * .3); g.addColorStop(0, lt(hair, .14)); g.addColorStop(.5, hair); g.addColorStop(1, hairD);
  x.fillStyle = g; x.fill();
  x.fillStyle = mix(hair, '#ffffff', .28);
  if (st === 3) { capsule(x, -R * .35, -R * 1.25, R * .5, R * .13, -1.2); capsule(x, R * .25, -R * 1.05, R * .36, R * .12, -1.0); }
  else { capsule(x, R * .05, -R * 1.22, R * .7, R * .17, -.1); capsule(x, -R * .8, -R * .85, R * .4, R * .15, -1.0); capsule(x, R * 1.05, -R * .65, R * .3, R * .13, 1.1); }
  if (st === 4) { x.fillStyle = '#ffd166'; rr(x, -R * 1.22, -R * .9, R * .34, R * .28, R * .13); x.fill(); }
};
const beard = (x, R, look, hair, hairD, hairL) => {
  const fx = R * .1 + look, ey = R * .3;
  x.fillStyle = hair; x.beginPath(); x.moveTo(-R * .82, R * .02); x.quadraticCurveTo(-R * .95, R * .85, -R * .2, R * 1.3); x.quadraticCurveTo(R * .45, R * 1.6, R * .8, R * 1.05); x.quadraticCurveTo(R * 1.05, R * .55, R * .97, R * .05); x.quadraticCurveTo(R * .75, R * .55, R * .3, R * .62); x.quadraticCurveTo(-R * .25, R * .62, -R * .55, R * .12); x.closePath(); x.fill();
  x.fillStyle = hairD; x.beginPath(); x.moveTo(-R * .82, R * .02); x.quadraticCurveTo(-R * .95, R * .85, -R * .2, R * 1.3); x.quadraticCurveTo(-R * .55, R * .8, -R * .5, R * .2); x.closePath(); x.fill();
  x.fillStyle = INK; x.beginPath(); x.ellipse(fx + R * .05, ey + R * .5, R * .13, R * .06, 0, 0, TAU); x.fill();
  x.fillStyle = mix(hair, '#2a0f5e', .12); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(fx + R * .04, ey + R * .33); x.quadraticCurveTo(fx + d * R * .3, ey + R * .22, fx + d * R * .48, ey + R * .5); x.quadraticCurveTo(fx + d * R * .3, ey + R * .44, fx + R * .04, ey + R * .45); x.fill(); }
  x.strokeStyle = hairL; x.lineWidth = R * .08; x.lineCap = 'round';
  x.beginPath(); x.moveTo(R * .1, R * .85); x.quadraticCurveTo(R * .3, R * 1.1, R * .2, R * 1.3); x.stroke();
  x.beginPath(); x.moveTo(R * .62, R * .7); x.quadraticCurveTo(R * .72, R * .9, R * .6, R * 1.05); x.stroke();
};
/* 머리카락 뒤쪽: 얼굴보다 훨씬 큰 볼륨. 얼굴을 액자처럼 감싼다 */
const hairBack = (x, L, R, hy, sway, hair, hairD, t) => {
  const st = L.hairStyle | 0; x.save(); x.translate(0, hy); x.fillStyle = hairD;
  const dome = (bottom, wav) => { x.beginPath(); x.moveTo(R * 1.18, bottom * .5); x.quadraticCurveTo(R * 1.5, -R * 1.25, -R * .1, -R * 1.5); x.quadraticCurveTo(-R * 1.6, -R * 1.3, -R * 1.42, -R * .1); x.quadraticCurveTo(-R * 1.5 - sway * 2, bottom * .7, -R * 1.1 - sway * 4 + wav, bottom); x.quadraticCurveTo(-R * .7 - sway * 3, bottom + R * .12, -R * .35 - sway * 3 + wav, bottom - R * .05); x.quadraticCurveTo(R * .1, bottom * .6, R * .4, bottom * .45); x.closePath(); x.fill(); };
  if (st === 0) dome(R * 1.0, 0);
  if (st === 1) dome(R * 2.4, Math.sin(t * 2.1) * R * .08);
  if (st === 2) { dome(R * .75, 0); for (const d of [-1, 1]) { x.save(); x.translate(d * R * 1.25, -R * .1); x.rotate(d * .28 - sway * .4); x.fillStyle = d < 0 ? hairD : mix(hair, hairD, .45); x.beginPath(); x.moveTo(0, -R * .1); x.bezierCurveTo(d * R * .75, R * .1, d * R * .7, R * 1.25, d * R * .15, R * 1.55); x.bezierCurveTo(-d * R * .25, R * 1.05, -d * R * .3, R * .3, 0, -R * .1); x.fill(); x.fillStyle = '#ff5f8f'; rr(x, -R * .24, -R * .22, R * .48, R * .26, R * .13); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; rr(x, -R * .14, -R * .18, R * .2, R * .07, R * .035); x.fill(); x.restore(); } }
  if (st === 4) { dome(R * .8, 0); x.save(); x.translate(-R * 1.15, -R * .7); x.rotate(.4 - sway * .6 + Math.sin(t * 2.4) * .05); x.beginPath(); x.moveTo(R * .15, -R * .3); x.bezierCurveTo(-R * 1.1, -R * .35, -R * 1.25, R * 1.0, -R * .6, R * 1.75); x.bezierCurveTo(-R * .35, R * 1.0, R * .1, R * .4, R * .3, R * .2); x.closePath(); x.fill(); x.restore(); }
  x.restore();
};
/* 앞머리 실루엣: 큰 돔 + 높은 가르마에서 한쪽으로 쓸어 넘긴 앞머리 + 볼 옆으로 내려오는 옆머리 */
const hairShape = (x, st, R, sway) => {
  x.beginPath();
  if (st === 3) {
    x.moveTo(-R * 1.14, R * .2); x.quadraticCurveTo(-R * 1.32, -R * .7, -R * .95, -R * 1.08);
    const tips = [[-R * 1.25, -R * 1.75, -R * .55, -R * 1.25], [-R * .45, -R * 2.15, R * .05, -R * 1.32], [R * .45, -R * 2.0, R * .65, -R * 1.15], [R * 1.25, -R * 1.35, R * 1.08, -R * .65]];
    for (const [tx, ty, bx, by] of tips) { const s = sway * R * .25; x.quadraticCurveTo(tx + R * .05 + s, ty + R * .6, tx + s, ty); x.quadraticCurveTo(tx + R * .32 + s, ty + R * .5, bx, by); }
    x.quadraticCurveTo(R * 1.25, -R * .3, R * 1.12, R * .05);
    x.quadraticCurveTo(R * .7, -R * .25, R * .3, -R * .3); x.quadraticCurveTo(-R * .2, -R * .5, -R * .6, -R * .2); x.quadraticCurveTo(-R * .85, -R * .1, -R * .9, R * .2); x.closePath();
  } else {
    x.moveTo(-R * 1.22, R * .45);
    x.quadraticCurveTo(-R * 1.45, -R * .95, -R * .35, -R * 1.42);
    x.quadraticCurveTo(R * 1.0, -R * 1.6, R * 1.32, -R * .35);
    x.quadraticCurveTo(R * 1.38, R * .2, R * 1.2, R * .5);
    x.quadraticCurveTo(R * 1.0, R * .15, R * 1.0, -R * .2);
    x.quadraticCurveTo(R * .6, -R * .22, R * .15, -R * .5);
    x.quadraticCurveTo(-R * .5, -R * .22, -R * .98, -R * .05);
    x.quadraticCurveTo(-R * 1.02, R * .2, -R * 1.0, R * .48);
    x.closePath();
  }
};
const accDraw = (x, a, R, hy, sway) => {
  if (a === 1) { /* 둥근 고리 두 개 + 매듭 + 꼬리, 그라데이션과 하이라이트 */
    x.save(); x.translate(R * .78, hy - R * 1.12); x.rotate(.35);
    const c = '#ff5f8f', g = x.createLinearGradient(0, -R * .5, 0, R * .5); g.addColorStop(0, lt(c, .25)); g.addColorStop(1, dk(c, .12));
    x.fillStyle = dk(c, .2); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * R * .05, R * .1); x.quadraticCurveTo(d * R * .25, R * .45, d * R * .2, R * .75); x.lineTo(d * R * .42, R * .62); x.quadraticCurveTo(d * R * .3, R * .4, d * R * .12, R * .05); x.fill(); }
    x.fillStyle = g; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(d * R * .25, -R * .55, d * R * .8, -R * .45, d * R * .72, -R * .02); x.bezierCurveTo(d * R * .68, R * .38, d * R * .25, R * .3, 0, 0); x.fill(); }
    x.fillStyle = dk(c, .22); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * R * .1, -R * .02); x.quadraticCurveTo(d * R * .35, -R * .15, d * R * .45, 0); x.quadraticCurveTo(d * R * .3, R * .08, d * R * .1, R * .04); x.fill(); }
    x.fillStyle = c; rr(x, -R * .15, -R * .16, R * .3, R * .3, R * .12); x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)'; capsule(x, -R * .42, -R * .25, R * .22, R * .07, -.5); capsule(x, R * .38, -R * .27, R * .16, R * .06, .5);
    x.restore();
  }
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
  }
  if (kind === 'resona') { /* 나뭇잎 날개: 빠르게 파닥 */
    const f = Math.sin(t * 26) * .42;
    for (const d of [-1, 1]) { x.save(); x.translate(-3, shY + 3); x.rotate(-.75 + d * .32 + f * d); x.fillStyle = d > 0 ? '#b4f06a' : '#6fd66a'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-12, -15, -25, -9); x.quadraticCurveTo(-13, 3, 0, 0); x.fill(); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(-2, -1); x.lineTo(-21, -8); x.stroke(); x.restore(); }
  }
  hairBack(x, L, R.headR, headY, sway, hair, hairD, t);

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
  const bodyG = x.createLinearGradient(bw * .5, top, -bw * .5, 6); bodyG.addColorStop(0, lt(out, .2)); bodyG.addColorStop(.55, out); bodyG.addColorStop(1, dk(out, .14));
  if (kind === 'hero') {
    x.fillStyle = bodyG; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(0, top - 2, bw * .36, top + 2); x.quadraticCurveTo(bw * .62, top * .4, bw * .56, 4); x.quadraticCurveTo(0, 8, -bw * .56, 4); x.quadraticCurveTo(-bw * .62, top * .4, -bw * .36, top + 2); x.fill();
    x.fillStyle = outD; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(-bw * .62, top * .4, -bw * .56, 4); x.quadraticCurveTo(-bw * .25, 6.4, -bw * .1, 6.6); x.quadraticCurveTo(-bw * .34, top * .4, -bw * .2, top + .6); x.fill();
    x.fillStyle = outL; x.beginPath(); x.moveTo(-bw * .5, 1.2); x.quadraticCurveTo(0, 5, bw * .5, 1.2); x.lineTo(bw * .56, 4); x.quadraticCurveTo(0, 8, -bw * .56, 4); x.fill();
    x.fillStyle = '#ffcf4a'; rr(x, -bw * .42, top * .34, bw * .84, 2.6, 1.3); x.fill(); x.fillStyle = '#fff3b0'; circ(x, 1.5, top * .34 + 1.3, 2.3);
    x.fillStyle = lt(out, .5); x.beginPath(); x.moveTo(-bw * .3, top + 2.4); x.quadraticCurveTo(1, top + 7, bw * .34, top + 2.4); x.quadraticCurveTo(1, top + 3.4, -bw * .3, top + 2.4); x.fill();
  } else if (kind === 'ignis') {
    x.fillStyle = bodyG; x.beginPath(); x.moveTo(-bw * .5, top + 5); x.quadraticCurveTo(-bw * .52, top - 1, -bw * .3, top - 2); x.lineTo(bw * .34, top - 2); x.quadraticCurveTo(bw * .56, top - 1, bw * .52, top + 6); x.lineTo(bw * .36, 2); x.quadraticCurveTo(0, 6, -bw * .34, 2); x.closePath(); x.fill();
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
    x.fillStyle = bodyG; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(0, top - 2, bw * .36, top + 2); x.quadraticCurveTo(bw * .9, top * .45, bw * 1.0 - sway * 2, hem + wv(0));
    for (let i = 1; i <= 4; i++) x.quadraticCurveTo(bw * (1 - i * .5) + bw * .25 - sway * 3, hem + 5 + wv(i), bw * (1 - i * .5) - sway * 3, hem + wv(i + 2));
    x.quadraticCurveTo(-bw * .9, top * .45, -bw * .36, top + 2); x.fill();
    x.fillStyle = outD; x.beginPath(); x.moveTo(-bw * .36, top + 2); x.quadraticCurveTo(-bw * .9, top * .45, -bw - sway * 3, hem + wv(6)); x.quadraticCurveTo(-bw * .6 - sway * 3, hem + 4, -bw * .3 - sway * 3, hem + wv(3)); x.quadraticCurveTo(-bw * .5, top * .5, -bw * .16, top + 1); x.fill();
    x.fillStyle = '#bfe9ff'; x.beginPath(); x.moveTo(-bw * .34, top + 2.2); x.quadraticCurveTo(1, top + 9, bw * .36, top + 2.2); x.quadraticCurveTo(1, top + 4, -bw * .34, top + 2.2); x.fill();
    for (let i = 0; i < 3; i++) spark(x, -4 + i * 5 - sway * 2, top * .5 + i * 6, 1.6 + (i & 1), 'rgba(215,245,255,.9)');
    x.fillStyle = '#7fd8ff'; rr(x, -bw * .56, top * .36, bw * 1.12, 2.4, 1.2); x.fill();
  } else {
    x.fillStyle = bodyG; x.beginPath(); x.ellipse(0, top * .5 + 1, bw * .56, -top * .62 + 2, 0, 0, TAU); x.fill();
    x.fillStyle = outD; x.beginPath(); x.ellipse(-bw * .22, top * .5 + 1.6, bw * .32, -top * .5 + 1, 0, 0, TAU); x.fill();
    x.fillStyle = '#fff3b0'; for (let i = 0; i < 4; i++) poly(x, [-bw * .5 + i * bw * .27, top + 3.6, -bw * .5 + (i + .5) * bw * .27, top + 8, -bw * .5 + (i + 1) * bw * .27, top + 3.6]);
    x.fillStyle = '#ff9f43'; circ(x, 1, top * .45, 1.8);
  }
  x.restore();

  /* --- 머리 --- */
  x.save(); x.translate(walk ? 1.2 : 0, headY); x.rotate((walk ? .05 : 0) + Math.sin(t * .9 + kind.length) * .035);
  const HR = R.headR, elf = fly && kind !== 'ignis', look = Math.sin(t * .47 + kind.length * 2) > .82 ? -HR * .14 : 0;
  if (elf) { x.fillStyle = skinD; x.beginPath(); x.moveTo(-HR * .85, -HR * .1); x.quadraticCurveTo(-HR * 1.35, -HR * .5, -HR * 1.6, -HR * .75); x.quadraticCurveTo(-HR * 1.3, -HR * .05, -HR * .88, HR * .35); x.fill(); }
  if (!elf) ears(x, HR, skin, skinD);
  { const g = x.createLinearGradient(HR * .7, -HR, -HR * .8, HR); g.addColorStop(0, lt(skin, .12)); g.addColorStop(.55, skin); g.addColorStop(1, mix(skin, '#e0457a', .22)); x.fillStyle = g; headPath(x, HR); x.fill(); }
  x.save(); headPath(x, HR); x.clip(); x.translate(-HR * .04, HR * .16); hairFront(x, L, HR, sway, hair, hairD, hairL, mix(skin, '#c2306a', .3)); x.restore();
  if (elf) { x.fillStyle = skin; x.beginPath(); x.moveTo(HR * .9, -HR * .12); x.quadraticCurveTo(HR * 1.35, -HR * .5, HR * 1.6, -HR * .78); x.quadraticCurveTo(HR * 1.35, -HR * .05, HR * .92, HR * .32); x.fill(); x.fillStyle = skinD; x.beginPath(); x.moveTo(HR * 1.0, -HR * .08); x.quadraticCurveTo(HR * 1.3, -HR * .4, HR * 1.42, -HR * .58); x.quadraticCurveTo(HR * 1.22, -HR * .12, HR * 1.0, HR * .12); x.fill(); }
  face(x, kind, HR, t, blink, look, skin, hairD, L.eye, kind === 'resona' ? Math.abs(Math.sin(t * 6.5)) : 0);
  if (kind === 'ignis') beard(x, HR, look, hair, hairD, hairL);
  hairFront(x, L, HR, sway, hair, hairD, hairL);
  if (kind === 'clausia') {
    const c = out, tip = sway * 7 + Math.sin(t * 1.7 - 1) * 3;
    x.fillStyle = dk(c, .35); ell(x, 0, -HR * .74, HR * 1.75, HR * .34, -.04);
    x.fillStyle = c; x.beginPath(); x.moveTo(-HR * .92, -HR * .8); x.quadraticCurveTo(-HR * .5, -HR * 2.2, -HR * .2 - tip * .4, -HR * 2.9); x.quadraticCurveTo(-HR * .9 - tip, -HR * 3.3, -HR * 1.5 - tip, -HR * 2.7); x.quadraticCurveTo(-HR * .5 - tip * .5, -HR * 3.0, HR * .2, -HR * 2.0); x.quadraticCurveTo(HR * .7, -HR * 1.4, HR * .92, -HR * .8); x.closePath(); x.fill();
    x.fillStyle = lt(c, .3); x.beginPath(); x.moveTo(HR * .2, -HR * 2.0); x.quadraticCurveTo(HR * .7, -HR * 1.4, HR * .92, -HR * .8); x.lineTo(HR * .5, -HR * .8); x.quadraticCurveTo(HR * .45, -HR * 1.5, HR * .2, -HR * 2.0); x.fill();
    x.fillStyle = '#7fd8ff'; x.beginPath(); x.moveTo(-HR * .9, -HR * .9); x.quadraticCurveTo(0, -HR * .64, HR * .9, -HR * .9); x.lineTo(HR * .82, -HR * 1.16); x.quadraticCurveTo(0, -HR * .92, -HR * .82, -HR * 1.16); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(255,228,120,.9)'; x.lineWidth = HR * .08; x.lineCap = 'round'; x.beginPath(); x.moveTo(-HR * .62, -HR * 1.3); x.quadraticCurveTo(-HR * .4, -HR * 2.0, -HR * .3 - tip * .4, -HR * 2.6); x.stroke();
    spark(x, -HR * 1.5 - tip, -HR * 2.7, 3.4 + Math.sin(t * 5) * .8, '#ffffff');
  } else if (kind === 'ignis') accDraw(x, 5, HR, 0, sway);
  else if (kind === 'resona') { accDraw(x, 3, HR, 0, sway); x.fillStyle = '#b4f06a'; x.save(); x.translate(-2, -HR - 1); x.rotate(Math.sin(t * 6.5) * .25 - .3); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-7, -7, -2, -13); x.quadraticCurveTo(5, -8, 0, 0); x.fill(); x.restore(); }
  else accDraw(x, L.acc | 0, HR, 0, sway);
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
  if (boss) { x.save(); x.translate(0, -34); x.rotate(t * .25); x.restore(); aglow(x, 0, -34, 62, 'rgb(255,95,150)', .5); }
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
   원칙: 고명도·고채도 / 먼 것일수록 하늘색에 녹는다 / 큰 면 몇 개 + 여백 / 질감은 짧은 대시 선으로만 */
Art.THEMES = [
  { name: 'forge', sky: ['#ff6a5c', '#ff9a4a', '#ffd77a'], sun: '#fff4c2', sunR: 70, l1: '#f0607a', l2: '#c8386e', l3: '#8e2470', lit: '#ffe27a', cloud: '#ffd0a0', g1: '#9a3496', g2: '#6a1f7e', top: '#ffb84a', leaf: '#16b39e', deco: 'gear', part: 'ember', slime: '#7a3cff', stars: 0 },
  { name: 'engine', sky: ['#5a48d8', '#9a6cf0', '#ffb3c6'], sun: '#fff1b8', sunR: 58, l1: '#8e72ec', l2: '#6448cc', l3: '#43309e', lit: '#ffd95a', cloud: '#ffd6ec', g1: '#5038b0', g2: '#30217e', top: '#ffcf5a', leaf: '#22c4a0', deco: 'chimney', part: 'smoke', slime: '#ff9f43', stars: .3 },
  { name: 'ice', sky: ['#2f5fe0', '#4fa8ff', '#c4f3ff'], sun: '#ffffff', sunR: 60, l1: '#86c8ff', l2: '#4a8ef0', l3: '#2c62c8', lit: '#ffffff', cloud: '#ffffff', g1: '#9fd0ff', g2: '#3a62c4', top: '#ffffff', leaf: '#2c62c8', deco: 'crystal', part: 'snow', slime: '#ff6fa8', stars: .25 },
  { name: 'forest', sky: ['#1aa0c8', '#56d4c4', '#f4f4a0'], sun: '#fffbd0', sunR: 64, l1: '#62cfa2', l2: '#22a07c', l3: '#127060', lit: '#ffe27a', cloud: '#ffffff', g1: '#2f8f6a', g2: '#1a5a5a', top: '#b8f060', leaf: '#ff8a3c', deco: 'string', part: 'leaf', slime: '#ff7a4a', stars: 0 },
  { name: 'shore', sky: ['#1f6fe0', '#4cc2ff', '#cbf9ff'], sun: '#fff6c8', sunR: 68, l1: '#78c0ff', l2: '#2f8ce2', l3: '#1c5fc0', lit: '#fff3b0', cloud: '#ffffff', g1: '#ffc96a', g2: '#e0924a', top: '#fff2c4', leaf: '#14b59a', deco: 'wave', part: 'bubble', slime: '#ff5f8f', stars: 0 },
  { name: 'hall', sky: ['#6a30d4', '#c25ee4', '#ffb4d4'], sun: '#ffe9f6', sunR: 56, l1: '#b676ea', l2: '#8c4ad2', l3: '#6430b0', lit: '#ffd166', cloud: '#ffd6f0', g1: '#7044c4', g2: '#40208c', top: '#ffd2f0', leaf: '#ff6fa8', deco: 'arch', part: 'note', slime: '#ffcf4a', stars: .35 },
  { name: 'harp', sky: ['#ff6a6a', '#ffa94a', '#ffeaa0'], sun: '#fff8d8', sunR: 74, l1: '#ff9470', l2: '#e05a5a', l3: '#a8346a', lit: '#fff3b0', cloud: '#ffe0b8', g1: '#8a36a0', g2: '#5a2280', top: '#ffd166', leaf: '#16b39e', deco: 'harp', part: 'note', slime: '#6a5cff', stars: 0 }
];
/* 짧은 대시 선 질감 */
const dashes = (x, X, Y, w, h, col, seed, n, vert, len = 18) => {
  x.strokeStyle = col; x.lineCap = 'round'; x.lineWidth = vert ? 3 : 4;
  x.beginPath();
  for (let i = 0; i < n; i++) { const a = hash(seed * 97 + i), b = hash(seed * 31 + i * 7), c = hash(seed + i * 13), px = X + a * w, py = Y + b * h, l = len * (.5 + c); if (vert) { x.moveTo(px, py); x.lineTo(px, py + l); } else { x.moveTo(px, py); x.lineTo(px + l, py); } }
  x.stroke();
};
const cloud = (x, cx, cy, s, col, colL) => {
  x.fillStyle = col; x.beginPath(); x.arc(cx - 34 * s, cy, 18 * s, Math.PI * .5, Math.PI * 1.5); x.arc(cx - 10 * s, cy - 16 * s, 22 * s, Math.PI, Math.PI * 1.9); x.arc(cx + 22 * s, cy - 6 * s, 20 * s, Math.PI * 1.3, Math.PI * .5); x.closePath(); x.fill();
  x.fillStyle = colL; x.beginPath(); x.arc(cx - 10 * s, cy - 16 * s, 22 * s, Math.PI * 1.15, Math.PI * 1.6); x.arc(cx - 10 * s, cy - 10 * s, 20 * s, Math.PI * 1.55, Math.PI * 1.2, true); x.fill();
};
const tree = (x, cx, B, h, col, colL, trunk) => {
  x.fillStyle = trunk; x.beginPath(); x.moveTo(cx - h * .045, B); x.quadraticCurveTo(cx - h * .02, B - h * .45, cx - h * .1, B - h * .66); x.lineTo(cx + h * .07, B - h * .64); x.quadraticCurveTo(cx + h * .02, B - h * .4, cx + h * .05, B); x.fill();
  x.fillStyle = col; rr(x, cx - h * .34, B - h * 1.02, h * .68, h * .5, h * .25); x.fill(); rr(x, cx - h * .22, B - h * 1.16, h * .44, h * .3, h * .15); x.fill();
  x.fillStyle = colL; rr(x, cx - h * .2, B - h * 1.12, h * .26, h * .06, h * .03); x.fill(); rr(x, cx - h * .3, B - h * .94, h * .2, h * .05, h * .025); x.fill();
};
const tower = (x, X, B, w, h, col, win, seed) => {
  x.fillStyle = col; rr(x, X, B - h, w, h + 4, 4); x.fill(); x.fillStyle = lt(col, .12); rr(x, X - 3, B - h - 5, w + 6, 8, 3); x.fill();
  const cols = Math.max(2, Math.floor(w / 18)), rows = Math.floor(h / 26), cw = (w - 14) / cols;
  x.fillStyle = win;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (hash(seed * 31 + r * 7 + c) < .35) continue; rr(x, X + 7 + c * cw + 2, B - h + 12 + r * 26, cw - 6, 13, 2); x.fill(); }
};
const gear = (x, cx, cy, r, rot, col, hole) => { x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = col; const n = Math.max(8, Math.round(r / 5)); for (let i = 0; i < n; i++) { x.rotate(TAU / n); rr(x, -r * .15, -r * 1.2, r * .3, r * .32, r * .06); x.fill(); } circ(x, 0, 0, r); x.fillStyle = hole; circ(x, 0, 0, r * .55); x.fillStyle = col; circ(x, 0, 0, r * .22); x.restore(); };
const crystal = (x, cx, B, w, h, col, lean) => { const tx = cx + lean * h; x.fillStyle = col; poly(x, [cx - w, B, tx - w * .4, B - h * .84, tx, B - h, tx + w * .45, B - h * .8, cx + w, B]); x.fillStyle = lt(col, .3); poly(x, [tx, B - h, tx + w * .45, B - h * .8, cx + w, B, cx + w * .15, B]); };
const hillPath = (x, W, H, base, cam, par, f1, a1, f2, a2, step = 24) => { x.beginPath(); x.moveTo(0, H); for (let X = 0; X <= W + step; X += step) { const wx = X + cam * par; x.lineTo(X, base - Math.sin(wx * f1) * a1 - Math.sin(wx * f2 + 1.3) * a2); } x.lineTo(W + step, H); x.closePath(); x.fill(); };
const hillY = (wx, base, f1, a1, f2, a2) => base - Math.sin(wx * f1) * a1 - Math.sin(wx * f2 + 1.3) * a2;
const bush = (x, cx, y, r, col, colL) => { x.fillStyle = col; x.beginPath(); x.arc(cx - r * .7, y - r * .45, r * .6, Math.PI * .9, Math.PI * 1.9); x.arc(cx, y - r * .8, r * .72, Math.PI * 1.1, Math.PI * 1.95); x.arc(cx + r * .75, y - r * .4, r * .55, Math.PI * 1.2, Math.PI * .1); x.lineTo(cx + r * 1.3, y + 2); x.lineTo(cx - r * 1.3, y + 2); x.closePath(); x.fill(); x.fillStyle = colL; rr(x, cx - r * .4, y - r * 1.36, r * .55, r * .14, r * .07); x.fill(); };

Art.bg = (x, W, H, cam, th, t, GY) => {
  const S0 = th.sky[0], S1 = th.sky[1], S2 = th.sky[2], fade = (c, k) => mix(c, S2, k);
  const g = x.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, S0); g.addColorStop(.6, S1); g.addColorStop(1, S2); x.fillStyle = g; x.fillRect(0, 0, W, H);
  /* 별: 밤 테마에서만, 적게 */
  if (th.stars) for (let i = 0; i < 18; i++) { const sx = ((hash(i) * (W + 80) - cam * .02) % (W + 80) + W + 80) % (W + 80) - 40, sy = hash(i + 99) * GY * .4, a = th.stars * (.5 + .5 * Math.sin(t * (1 + hash(i + 7)) + i)); x.fillStyle = `rgba(255,255,255,${a})`; circ(x, sx, sy, 1.2 + hash(i + 3) * 1.4); }
  /* 해: 원판 + 부드러운 동심원 두 겹 */
  const sx = W * .72 - cam * .012, sy = GY * .34, sr = th.sunR;
  x.fillStyle = mix(th.sun, S1, .72); circ(x, sx, sy, sr * 2.1); x.fillStyle = mix(th.sun, S1, .45); circ(x, sx, sy, sr * 1.45); x.fillStyle = th.sun; circ(x, sx, sy, sr);
  /* 구름: 적게, 크게, 천천히 */
  const offc = cam * .05 + t * 5, spc = 640;
  for (let i = Math.floor(offc / spc) - 1; i < (offc + W) / spc + 1; i++) { const h = hash(i * 17 + 3); cloud(x, i * spc - offc + h * 260, GY * (.16 + h * .2), 1.3 + h * .9, mix(th.cloud, S1, .35), mix(th.cloud, '#ffffff', .5)); }

  /* 원경 l1: 하늘에 거의 녹은 실루엣 */
  const B = GY + 10, off1 = cam * .16, sp1 = 420, c1 = fade(th.l1, .5), c1w = fade(th.l1, .32);
  x.fillStyle = fade(th.l1, .62); hillPath(x, W, H, GY - 110, cam, .08, .0028, 50, .0071, 18, 32);
  for (let i = Math.floor(off1 / sp1) - 1; i < (off1 + W) / sp1 + 1; i++) {
    const X = i * sp1 - off1, hh = hash(i * 7 + 3), h = 190 + hh * 140;
    switch (th.deco) {
      case 'gear': tower(x, X + 30, B, 90, h * .85, c1, c1w, i); gear(x, X + 250, B - 150 - hh * 40, 60 + hh * 14, t * .15 * (i & 1 ? 1 : -1) + i, c1, fade(th.l1, .62)); break;
      case 'chimney': tower(x, X + 20, B, 130, h * .62, c1, c1w, i); x.fillStyle = c1; rr(x, X + 44, B - h - 60, 28, h + 60, 4); x.fill(); for (let k = 0; k < 4; k++) { const q = (t * .08 + k / 4 + hh) % 1; x.fillStyle = `rgba(255,255,255,${.4 * (1 - q)})`; circ(x, X + 58 + q * 50, B - h - 76 - q * 140, 14 + q * 28); } tower(x, X + 220, B, 100, h * .9, fade(th.l1, .44), c1w, i + 9); break;
      case 'crystal': for (let k = 0; k < 3; k++) crystal(x, X + 70 + k * 110, B, 34 + hash(i * 5 + k) * 22, h * (.8 + hash(i * 3 + k) * .7), c1, (hash(i + k) - .5) * .35); break;
      case 'string': tree(x, X + 110, B, h * 1.2, c1, c1w, fade(th.l1, .4)); tree(x, X + 300, B, h * .9, fade(th.l1, .56), c1w, fade(th.l1, .45)); break;
      case 'wave': { x.fillStyle = c1; x.beginPath(); x.moveTo(X + 30, B); x.quadraticCurveTo(X + 120, B - h * 1.05, X + 210, B - h * .45); x.quadraticCurveTo(X + 280, B - h * .18, X + 360, B); x.fill(); if (i & 1) { const lx = X + 180, ly = B - h * .55; x.fillStyle = fade('#ffffff', .1); rr(x, lx - 11, ly - 66, 22, 66, 4); x.fill(); x.fillStyle = fade('#ff5f6d', .35); rr(x, lx - 11, ly - 50, 22, 11, 0); x.fill(); rr(x, lx - 11, ly - 26, 22, 11, 0); x.fill(); x.fillStyle = fade(th.lit, .1); rr(x, lx - 14, ly - 80, 28, 15, 5); x.fill(); } break; }
      case 'arch': { const aw = 260, ah = h + 100, ax = X + 40; x.fillStyle = c1; x.beginPath(); x.moveTo(ax, B); x.lineTo(ax, B - ah * .58); x.quadraticCurveTo(ax + aw / 2, B - ah * 1.2, ax + aw, B - ah * .58); x.lineTo(ax + aw, B); x.lineTo(ax + aw - 34, B); x.lineTo(ax + aw - 34, B - ah * .55); x.quadraticCurveTo(ax + aw / 2, B - ah * 1.02, ax + 34, B - ah * .55); x.lineTo(ax + 34, B); x.closePath(); x.fill(); break; }
      case 'harp': { x.fillStyle = c1; rr(x, X + 50, B - h - 140, 22, h + 140, 9); x.fill(); x.beginPath(); x.moveTo(X + 50, B - h - 140); x.bezierCurveTo(X + 150, B - h - 230, X + 270, B - h - 110, X + 310, B - 20); x.lineTo(X + 288, B - 20); x.bezierCurveTo(X + 250, B - h - 80, X + 150, B - h - 180, X + 72, B - h - 114); x.fill(); x.strokeStyle = c1w; x.lineWidth = 2; for (let k = 1; k < 8; k++) { const sxk = X + 72 + k * 27, top = B - h - 140 + Math.pow(k / 8, 1.6) * (h + 60), A = 3 * Math.sin(t * (5 + k) + i); x.beginPath(); x.moveTo(sxk, top); x.quadraticCurveTo(sxk + A, (top + B) / 2, sxk, B); x.stroke(); } break; }
    }
  }

  /* 중경 l2: 언덕 + 큼직한 소품 몇 개 */
  const p2 = .4, f1 = .0036, a1 = 40, f2 = .0094, a2 = 14, base2 = GY - 40, c2 = fade(th.l2, .2), c2L = fade(th.l2, .02);
  x.fillStyle = c2; hillPath(x, W, H, base2, cam, p2, f1, a1, f2, a2);
  dashes(x, 0, base2 + 10, W, 90, fade(th.l2, .3), Math.floor(cam * p2 / 400), 10, false, 26);
  const off2 = cam * p2, sp2 = 300;
  for (let i = Math.floor(off2 / sp2) - 1; i < (off2 + W) / sp2 + 1; i++) {
    const hh = hash(i * 13 + 5), wx = i * sp2 + hh * 120, X = wx - off2, y = hillY(wx, base2, f1, a1, f2, a2) + 8;
    if (hh < .3) continue;
    switch (th.deco) {
      case 'gear': if (hh > .65) gear(x, X, y - 30, 34 + hh * 12, t * .4 * (i & 1 ? 1 : -1), c2, fade(th.l2, .45)); else { x.fillStyle = c2; rr(x, X - 10, y - 120 - hh * 40, 20, 130 + hh * 40, 5); x.fill(); x.fillStyle = c2L; rr(x, X - 14, y - 126 - hh * 40, 28, 9, 4); x.fill(); } break;
      case 'chimney': x.fillStyle = c2; rr(x, X - 40, y - 60 - hh * 30, 80, 70 + hh * 30, 6); x.fill(); x.fillStyle = fade(th.lit, .25); for (let k = 0; k < 3; k++) { rr(x, X - 28 + k * 22, y - 46 - hh * 30, 12, 16, 3); x.fill(); } break;
      case 'crystal': crystal(x, X, y + 4, 18 + hh * 12, 70 + hh * 70, c2, (hh - .5) * .5); break;
      case 'string': tree(x, X, y + 6, 100 + hh * 60, c2, c2L, fade(th.l2, .1)); break;
      case 'wave': if (hh > .55) { const sw = Math.sin(t * 1.1 + i) * 3; x.fillStyle = c2; x.beginPath(); x.moveTo(X - 6, y + 4); x.quadraticCurveTo(X - 2, y - 50, X - 12 + sw, y - 96); x.lineTo(X - 4 + sw, y - 96); x.quadraticCurveTo(X + 6, y - 44, X + 6, y + 4); x.fill(); for (let k = 0; k < 5; k++) { x.save(); x.translate(X - 8 + sw, y - 96); x.rotate(-1.4 + k * .7 + Math.sin(t * 1.3 + k + i) * .06); x.fillStyle = k & 1 ? c2L : c2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(30, -16, 58, 4); x.quadraticCurveTo(28, -2, 0, 0); x.fill(); x.restore(); } } else bush(x, X, y + 4, 34, c2, c2L); break;
      case 'arch': x.fillStyle = c2; rr(x, X - 12, y - 120 - hh * 40, 24, 130 + hh * 40, 6); x.fill(); x.fillStyle = c2L; rr(x, X - 18, y - 128 - hh * 40, 36, 12, 5); x.fill(); x.fillStyle = th.lit; circ(x, X, y - 146 - hh * 40, 8); break;
      case 'harp': bush(x, X, y + 4, 36, c2, c2L); break;
    }
  }
  /* 근경 l3: 둥근 덤불 띠 */
  const p3 = .72, base3 = GY - 6, c3 = th.l3, c3L = mix(th.l3, S2, .22);
  x.fillStyle = c3; hillPath(x, W, H, base3, cam, p3, .006, 12, .017, 6, 20);
  const off3 = cam * p3, sp3 = 150;
  for (let i = Math.floor(off3 / sp3) - 1; i < (off3 + W) / sp3 + 1; i++) {
    const hh = hash(i * 29 + 11), wx = i * sp3 + hh * 60, X = wx - off3, y = hillY(wx, base3, .006, 12, .017, 6) + 6;
    if (hh < .35) continue;
    bush(x, X, y, 22 + hh * 22, c3, c3L);
  }
  /* 입자: 적게, 부드럽게 */
  for (let i = 0; i < 14; i++) {
    const r = hash(i + 500), fall = th.part === 'snow' || th.part === 'leaf';
    const px = ((hash(i) * (W + 60) + (fall ? t * 18 : 0) - cam * .8) % (W + 60) + W + 60) % (W + 60) - 30;
    const py = fall ? (r * H + t * (24 + r * 30)) % (GY + 20) : GY - ((r * GY + t * (14 + r * 24)) % GY);
    if (th.part === 'ember') { x.fillStyle = `rgba(255,240,180,${.25 + (py / GY) * .5})`; circ(x, px + Math.sin(t * 2 + i) * 9, py, 2 + r * 2); }
    else if (th.part === 'snow') { x.fillStyle = 'rgba(255,255,255,.9)'; circ(x, px + Math.sin(t + i) * 12, py, 2 + r * 2.4); }
    else if (th.part === 'leaf') { x.save(); x.translate(px + Math.sin(t + i) * 18, py); x.rotate(t * (1 + r) + i); x.fillStyle = th.leaf; x.beginPath(); x.moveTo(-7, 0); x.quadraticCurveTo(0, -6, 7, 0); x.quadraticCurveTo(0, 6, -7, 0); x.fill(); x.restore(); }
    else if (th.part === 'bubble') { x.fillStyle = 'rgba(255,255,255,.3)'; circ(x, px + Math.sin(t + i) * 6, py, 4 + r * 6); }
    else if (th.part === 'note') { const nx = px + Math.sin(t + i) * 10; x.globalAlpha = .5 + r * .3; x.fillStyle = '#fff'; ell(x, nx, py, 4.5, 3.4, -.4); x.fillRect(nx + 3.4, py - 15, 1.8, 15); x.globalAlpha = 1; }
    else if (th.part === 'smoke') { x.fillStyle = 'rgba(255,255,255,.1)'; circ(x, px, py, 14 + r * 16); }
  }
};
/* 캐릭터 앞 레이어: 화면 가장자리에만 가끔 들어오는 큰 잎 */
const bigLeaf = (x, X, B, ln, rot, col, vein) => {
  x.save(); x.translate(X, B); x.rotate(rot);
  x.fillStyle = col; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-ln * .3, -ln * .3, -ln * .22, -ln * .8, 0, -ln); x.bezierCurveTo(ln * .22, -ln * .8, ln * .3, -ln * .3, 0, 0); x.fill();
  x.strokeStyle = vein; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -ln * .1); x.lineTo(0, -ln * .85);
  for (let k = 1; k < 5; k++) { const yy = -ln * (.15 + k * .15); x.moveTo(0, yy); x.lineTo(-ln * .12, yy - ln * .07); x.moveTo(0, yy - ln * .03); x.lineTo(ln * .12, yy - ln * .1); }
  x.stroke(); x.restore();
};
Art.fg = (x, W, H, cam, th, t, GY) => {
  const par = 1.5, off = cam * par, sp = 900, col = th.leaf, vein = lt(th.leaf, .35);
  for (let i = Math.floor(off / sp) - 1; i < (off + W) / sp + 1; i++) {
    const hh = hash(i * 41 + 7); if (hh < .4) continue;
    const X = i * sp - off + hh * 300, B = H + 30, sw = Math.sin(t * .9 + i) * .04;
    bigLeaf(x, X, B, 120 + hh * 40, -.6 + sw, dk(col, .1), vein);
    bigLeaf(x, X + 30, B, 150 + hh * 30, -.12 - sw, col, vein);
    bigLeaf(x, X + 60, B, 115, .5 + sw, dk(col, .18), vein);
  }
};
Art.ground = (x, X, Y, w, h, th, float) => {
  const seed = Math.round(X / 7);
  if (float) {
    x.fillStyle = th.g2; x.beginPath(); x.moveTo(X + 6, Y + 8); x.quadraticCurveTo(X + w * .5, Y + h + 26, X + w - 6, Y + 8); x.fill();
    x.fillStyle = th.g1; rr(x, X, Y, w, 14, 7); x.fill(); x.fillStyle = th.top; rr(x, X - 2, Y - 4, w + 4, 9, 4.5); x.fill();
    return;
  }
  x.fillStyle = th.g2; x.fillRect(X, Y + 18, w, h);
  dashes(x, X + 10, Y + 40, w - 40, Math.max(0, h - 60), mix(th.g2, th.g1, .35), seed, Math.floor(w / 40), false, 22);
  x.fillStyle = th.g1; rr(x, X, Y, w, 26, 6); x.fill();
  x.fillStyle = th.top; rr(x, X - 2, Y - 4, w + 4, 12, 6); x.fill();
  dashes(x, X + 14, Y + 13, w - 50, 6, mix(th.g1, th.top, .3), seed + 5, Math.floor(w / 70), false, 14);
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
