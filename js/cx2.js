'use strict';
/* 컷신 그리기 도구 2: 실린더·분자·PV 그래프·불꽃·온도계·용수철·파면·관 */
Object.assign(CX, (() => {
  const { cl, E, pill, text, arrow } = CX, TAU = Math.PI * 2;
  const tri = u => { u = ((u % 2) + 2) % 2; return u < 1 ? u : 2 - u; };
  /* 상자 안에서 튀어 다니는 분자들. speed 가 온도 */
  const mols = (x, X, Y, w, h, n, t, speed, col = '#ffd23f', r = 9, seed = 1, trail = true) => {
    for (let i = 0; i < n; i++) {
      const a = hash(i * 7 + seed), b = hash(i * 13 + seed), va = .25 + hash(i + 50) * .5, vb = .25 + hash(i + 90) * .5;
      const px = X + r + tri(a * 2 + t * speed * va / w * 60) * (w - 2 * r), py = Y + r + tri(b * 2 + t * speed * vb / h * 60) * (h - 2 * r);
      if (trail && speed > .5) { const px2 = X + r + tri(a * 2 + (t - .08) * speed * va / w * 60) * (w - 2 * r), py2 = Y + r + tri(b * 2 + (t - .08) * speed * vb / h * 60) * (h - 2 * r); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = r * .9; x.lineCap = 'round'; x.beginPath(); x.moveTo(px2, py2); x.lineTo(px, py); x.stroke(); }
      CX.ball(x, px, py, r, col);
    }
  };
  /* 실린더 + 피스톤. top = 피스톤 아래면의 y */
  const cyl = (x, cx, by, w, h, top, t, o = {}) => {
    const X = cx - w / 2, wall = 12;
    if (o.insul) { x.fillStyle = '#ffd6a0'; rr(x, X - 34, top - 70, w + 68, by - top + 104, 30); x.fill(); x.strokeStyle = 'rgba(255,170,90,.6)'; x.lineWidth = 4; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(X - 26, top - 50 + i * (by - top + 60) / 6); x.lineTo(X - 10, top - 40 + i * (by - top + 60) / 6); x.stroke(); } }
    x.fillStyle = 'rgba(255,255,255,.14)'; rr(x, X, by - h, w, h, 18); x.fill();
    x.fillStyle = o.gas || 'rgba(127,216,255,.28)'; x.fillRect(X + wall, top, w - wall * 2, by - top - wall);
    mols(x, X + wall, top, w - wall * 2, by - top - wall, o.n || 14, t, o.speed ?? 1, o.mol || '#ffd23f', o.r || 9, o.seed || 1);
    x.fillStyle = '#c9b6ff'; rr(x, X, by - h, wall, h, 6); x.fill(); rr(x, X + w - wall, by - h, wall, h, 6); x.fill(); rr(x, X, by - wall, w, wall, 6); x.fill();
    x.fillStyle = '#7a5cff'; rr(x, X + wall - 2, top - 26, w - wall * 2 + 4, 26, 8); x.fill(); x.fillStyle = '#9d7bff'; rr(x, X + wall + 4, top - 24, w - wall * 2 - 8, 8, 4); x.fill();
    if (o.rod !== false) { x.fillStyle = '#5a3fc0'; rr(x, cx - 9, top - 26 - (o.rodLen || 90), 18, (o.rodLen || 90), 9); x.fill(); }
    if (o.weights) for (let i = 0; i < o.weights; i++) { x.fillStyle = i & 1 ? '#40238f' : '#2a1a7a'; rr(x, cx - w * .32, top - 26 - 22 * (i + 1), w * .64, 20, 8); x.fill(); }
    if (o.pin) { x.fillStyle = '#ff5f6d'; for (const d of [-1, 1]) { rr(x, cx + d * (w / 2 - 6) - 14, top - 40, 28, 12, 6); x.fill(); } }
  };
  const flame = (x, cx, cy, s, t, k = 1) => {
    if (k <= 0) return; s *= E.back(cl(k)); x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = '#40238f'; rr(x, -34, 0, 68, 26, 10); x.fill();
    const cols = ['#ff4f4f', '#ff9f43', '#ffe27a'];
    for (let i = 0; i < 3; i++) { const h = 60 - i * 16 + Math.sin(t * 11 + i * 2) * 8, w = 26 - i * 7; x.fillStyle = cols[i]; x.beginPath(); x.moveTo(-w, 0); x.bezierCurveTo(-w - 4, -h * .5, -4 + Math.sin(t * 7 + i) * 6, -h * .75, Math.sin(t * 5 + i) * 4, -h); x.bezierCurveTo(6, -h * .6, w + 4, -h * .4, w, 0); x.closePath(); x.fill(); }
    x.restore();
  };
  const thermo = (x, cx, cy, h, level, col = '#ff4f6d', label) => {
    x.fillStyle = '#fff'; rr(x, cx - 14, cy - h, 28, h, 14); x.fill(); x.beginPath(); x.arc(cx, cy + 6, 24, 0, TAU); x.fill();
    x.fillStyle = col; const L = (h - 20) * cl(level); rr(x, cx - 7, cy - L, 14, L + 4, 7); x.fill(); x.beginPath(); x.arc(cx, cy + 6, 16, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(42,15,94,.3)'; x.lineWidth = 3; for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(cx + 6, cy - (h - 20) * i / 5); x.lineTo(cx + 14, cy - (h - 20) * i / 5); x.stroke(); }
    if (label) text(x, label, cx, cy + 56, 24);
  };
  /* PV 그래프 */
  const graph = (x, ox, oy, w, h, xl = '부피 V', yl = '압력 P', k = 1, col = '#fff') => { if (k <= 0) return; x.save(); x.globalAlpha = cl(k * 2); arrow(x, ox, oy, ox + w, oy, col, 6, k); arrow(x, ox, oy, ox, oy - h, col, 6, k); text(x, xl, ox + w - 30, oy + 34, 22, col); text(x, yl, ox + 10, oy - h - 30, 22, col, 1, 'left'); x.restore(); };
  const G = (ox, oy, w, h, vmax, pmax) => ({ X: v => ox + v / vmax * w, Y: p => oy - p / pmax * h, ox, oy });
  const path = (x, pts, col, w = 7, k = 1, dash) => { if (k <= 0 || pts.length < 2) return; const n = Math.max(2, Math.ceil(pts.length * cl(k))); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; if (dash) x.setLineDash(dash); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); x.setLineDash([]); };
  const fillPts = (x, pts, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts) x.lineTo(p[0], p[1]); x.closePath(); x.fill(); };
  const dot = (x, X, Y, col = '#ffd23f', r = 12, lab) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, r + 4, 0, TAU); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); if (lab) text(x, lab, X + 28, Y - 24, 24); };
  /* 경로를 따라가는 점: pts 배열의 비율 u */
  const along = (pts, u) => { u = cl(u); let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; } let a = u * L; for (let i = 0; i < seg.length; i++) { if (a <= seg[i]) { const k = a / (seg[i] || 1); return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } a -= seg[i]; } return pts[pts.length - 1]; };
  const curve = (f, a, b, n = 40) => { const p = []; for (let i = 0; i <= n; i++) { const v = a + (b - a) * i / n; p.push(f(v)); } return p; };
  /* 용수철 */
  const spring = (x, x0, y0, x1, y1, coils = 12, amp = 16, col = '#e6fbff', w = 5) => { const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.beginPath(); x.moveTo(x0, y0); const lead = 16; x.lineTo(x0 + ux * lead, y0 + uy * lead); for (let i = 0; i <= coils * 2; i++) { const s = lead + (L - lead * 2) * i / (coils * 2), o = (i % 2 ? 1 : -1) * amp; x.lineTo(x0 + ux * s - uy * o, y0 + uy * s + ux * o); } x.lineTo(x1, y1); x.stroke(); };
  const wall = (x, X, Y, w, h, col = '#40238f') => { x.fillStyle = col; rr(x, X, Y, w, h, 8); x.fill(); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; for (let i = 0; i < h / 22; i++) { x.beginPath(); x.moveTo(X + 4, Y + 10 + i * 22); x.lineTo(X + w - 4, Y + i * 22); x.stroke(); } };
  /* 원형 파면 */
  const fronts = (x, cx, cy, lam, t, v, rmax, col = '#fff', dashTrough = true, a0 = 0, a1 = TAU) => { const off = (t * v) % lam; for (let r = off; r < rmax; r += lam) { x.strokeStyle = col; x.globalAlpha = .9 * (1 - r / rmax); x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, r, a0, a1); x.stroke(); if (dashTrough && r + lam / 2 < rmax) { x.setLineDash([8, 10]); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r + lam / 2, a0, a1); x.stroke(); x.setLineDash([]); } } x.globalAlpha = 1; };
  const speaker = (x, X, Y, s = 1, ang = 0, t = 0) => { x.save(); x.translate(X, Y); x.rotate(ang); x.scale(s, s); const p = Math.sin(t * 30) * 2; x.fillStyle = '#40238f'; rr(x, -50, -40, 46, 80, 14); x.fill(); x.fillStyle = '#7a5cff'; x.beginPath(); x.moveTo(-6, -30); x.lineTo(30 + p, -56); x.lineTo(30 + p, 56); x.lineTo(-6, 30); x.closePath(); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.ellipse(30 + p, 0, 8, 56, 0, 0, TAU); x.fill(); x.restore(); };
  /* 관: 양끝 열림/닫힘. 안에 정상파 */
  const tube = (x, X, Y, L, H, closedR, closedL) => { x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(X, Y - H / 2, L, H); x.fillStyle = '#c9b6ff'; rr(x, X - 6, Y - H / 2 - 12, L + 12, 12, 6); x.fill(); rr(x, X - 6, Y + H / 2, L + 12, 12, 6); x.fill(); if (closedR) { rr(x, X + L, Y - H / 2 - 12, 14, H + 24, 6); x.fill(); } if (closedL) { rr(x, X - 14, Y - H / 2 - 12, 14, H + 24, 6); x.fill(); } };
  /* 정상파 포락선: f(s) 는 0~L 에서의 진폭 모양 */
  const stand = (x, X, Y, L, A, shape, t, w = 1, col = '#ff6fa8') => { const c = Math.cos(t * w); x.lineWidth = 5; x.lineCap = 'round'; for (const sgn of [1, -1]) { x.strokeStyle = sgn > 0 ? col : 'rgba(255,255,255,.45)'; if (sgn < 0) x.setLineDash([8, 10]); x.beginPath(); for (let i = 0; i <= 80; i++) { const s = L * i / 80, y = Y - sgn * A * shape(s / L) * (sgn > 0 ? c : 1); i ? x.lineTo(X + s, y) : x.moveTo(X + s, y); } if (sgn < 0) { x.globalAlpha = .5; } x.stroke(); x.globalAlpha = 1; x.setLineDash([]); } };
  const card = (x, cx, cy, w, h, title, k, bg = '#fff', draw) => { if (k <= 0) return; const s = E.back(cl(k)); x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = 'rgba(42,15,94,.25)'; rr(x, -w / 2, -h / 2 + 6, w, h, 22); x.fill(); x.fillStyle = bg; rr(x, -w / 2, -h / 2, w, h, 22); x.fill(); if (draw) draw(x); x.font = CX.F(22); x.fillStyle = '#2a0f5e'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(title, 0, h / 2 - 26); x.restore(); };
  const bar = (x, X, Y, w, v, max, col, label, k = 1) => { x.fillStyle = 'rgba(255,255,255,.18)'; rr(x, X, Y - 18, w, 36, 18); x.fill(); const L = Math.max(0, w * cl(v / max) * E.io(cl(k))); if (L > 4) { x.fillStyle = col; rr(x, X, Y - 18, L, 36, 18); x.fill(); } if (label) text(x, label, X - 16, Y, 24, '#fff', 1, 'right'); };
  const chr = (x, id, X, Y, s, t, o = {}) => Art.chibi(x, X, Y, s, Object.assign({}, id === 'me' ? { skin: '#ffb594', hair: '#5a4a8a', hairStyle: 4, outfit: '#6a3fa0', acc: 1 } : CH[id].look), Object.assign({ t, dir: 1 }, o));
  return { tri, mols, cyl, flame, thermo, graph, G, path, fillPts, dot, along, curve, spring, wall, fronts, speaker, tube, stand, card, bar, chr };
})());
