/* 1시간 자습 프린트용 손그림 느낌 SVG (미적분·화학 단원별 1개씩) */
const R = '#b91c1c', B = '#1f4fb8', G = '#777';
const F = 'font-family="Noto Sans KR,Noto Sans CJK KR,sans-serif"';
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" ${F} font-size="12"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#111"/></marker><marker id="arR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${R}"/></marker><marker id="arB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${B}"/></marker></defs>${body}</svg>`;
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" fill="${o.c || '#111'}" font-size="${o.s || 12}" ${o.b ? 'font-weight="700"' : ''}>${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
const L = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || '#111'}" stroke-width="${o.w || 1.6}" ${o.d ? `stroke-dasharray="${o.d}"` : ''} ${o.m ? `marker-end="url(#${o.m})"` : ''}/>`;
const D = (x, y, c = '#111', r = 3.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
/* 좌표계: 수학 좌표 → 화면 */
function plane(x0, x1, y0, y1, W = 260, H = 170, pad = 22) {
  const sx = x => pad + (x - x0) / (x1 - x0) * (W - 2 * pad), sy = y => H - pad - (y - y0) / (y1 - y0) * (H - 2 * pad);
  const path = (f, a, b, n = 120) => { let d = ''; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(f(x)).toFixed(1); } return d; };
  const curve = (f, a, b, o = {}) => `<path d="${path(f, a, b)}" fill="none" stroke="${o.c || '#111'}" stroke-width="${o.w || 2.2}" ${o.d ? `stroke-dasharray="${o.d}"` : ''}/>`;
  const fill = (f, g, a, b, c = '#1f4fb833') => { let d = path(f, a, b); for (let i = 120; i >= 0; i--) { const x = a + (b - a) * i / 120; d += 'L' + sx(x).toFixed(1) + ' ' + sy(g(x)).toFixed(1); } return `<path d="${d}Z" fill="${c}" stroke="none"/>`; };
  const axes = (xl = 'x', yl = 'y') => L(sx(x0), sy(0), sx(x1) + 6, sy(0), { m: 'ar', w: 1.3 }) + L(sx(0), sy(y0), sx(0), sy(y1) - 6, { m: 'ar', w: 1.3 }) + T(sx(x1) + 4, sy(0) + 15, xl) + T(sx(0) - 9, sy(y1) - 2, yl) + T(sx(0) - 8, sy(0) + 13, 'O', { s: 10, c: G });
  return { sx, sy, curve, fill, axes, W, H };
}

/* ───────── 미적분 ───────── */
const cub = x => x * x * x - 3 * x;
const CALC = {
  0: () => { const P = plane(-0.5, 3, -0.5, 4.5); const f = x => 0.5 * x * x + 0.3, a = 1.6, m = a, t = x => f(a) + m * (x - a);
    return svg(260, 170, P.axes() + P.curve(f, -0.3, 2.8) + P.curve(t, 0.6, 2.6, { c: R, w: 1.8, d: '5 3' }) + D(P.sx(a), P.sy(f(a)), R) + L(P.sx(a), P.sy(f(a)), P.sx(a) + 34, P.sy(f(a)), { c: G, d: '3 2', w: 1.2 }) + L(P.sx(a) + 34, P.sy(f(a)), P.sx(a) + 34, P.sy(f(a)) - 34 * m * (P.sy(0) - P.sy(1)) / (P.sx(1) - P.sx(0)), { c: G, d: '3 2', w: 1.2 })
      + T(P.sx(2.2) + 12, P.sy(t(2.2)) + 16, '접선', { c: R, b: 1 }) + T(P.sx(a) - 18, P.sy(f(a)) + 4, 'P', { b: 1 }) + T(150, 22, "f′(a) = 접선의 기울기", { c: R, b: 1 }) + T(P.sx(a), P.sy(0) + 14, 'a', { c: G })); },
  1: () => { const P = plane(-2.3, 2.3, -3, 3.2); return svg(260, 170, P.axes() + P.curve(cub, -2.1, -1, { c: B }) + P.curve(cub, -1, 1, { c: R }) + P.curve(cub, 1, 2.15, { c: B })
      + T(P.sx(-1.75), P.sy(2.6), '증가 ↗', { c: B, b: 1 }) + T(P.sx(0.3), P.sy(1.9), '감소 ↘', { c: R, b: 1 }) + T(P.sx(1.7), P.sy(-2.4), '증가 ↗', { c: B, b: 1 })
      + T(P.sx(-1.75), P.sy(1.7), "f′ > 0", { c: B, s: 11 }) + T(P.sx(0.3), P.sy(1.1), "f′ < 0", { c: R, s: 11 }) + T(P.sx(1.75), P.sy(-1.6), "f′ > 0", { c: B, s: 11 })); },
  2: () => { const P = plane(-2.3, 2.3, -3, 3.4); return svg(260, 170, P.axes() + P.curve(cub, -2.1, 2.15) + D(P.sx(-1), P.sy(2), R) + D(P.sx(1), P.sy(-2), B)
      + T(P.sx(-1), P.sy(2) - 9, '극대 (+ → −)', { c: R, b: 1 }) + T(P.sx(1), P.sy(-2) + 17, '극소 (− → +)', { c: B, b: 1 })
      + L(P.sx(-1.45), P.sy(2), P.sx(-0.55), P.sy(2), { c: R, w: 1.2 }) + L(P.sx(0.55), P.sy(-2), P.sx(1.45), P.sy(-2), { c: B, w: 1.2 }) + T(P.sx(1.85), P.sy(-0.9), "f′=0", { s: 10, c: G })); },
  3: () => { const P = plane(-2.4, 3.2, -3, 19); const f = cub; return svg(260, 170, P.axes() + P.curve(f, -2, 3) + L(P.sx(-2), P.sy(0), P.sx(-2), P.sy(-2), { c: G, d: '3 2', w: 1 }) + L(P.sx(3), P.sy(0), P.sx(3), P.sy(18), { c: G, d: '3 2', w: 1 })
      + D(P.sx(-2), P.sy(-2)) + D(P.sx(3), P.sy(18), R) + D(P.sx(-1), P.sy(2)) + D(P.sx(1), P.sy(-2))
      + T(P.sx(3) - 6, P.sy(18) + 2, '최대 18 (끝점!)', { a: 'end', c: R, b: 1 }) + T(P.sx(-1), P.sy(2) - 8, '극대 2', { s: 10 }) + T(P.sx(1) + 2, P.sy(-2) + 14, '최소 −2', { s: 10, c: B, b: 1 }) + T(P.sx(-2), P.sy(0) - 5, '−2', { s: 10, c: G }) + T(P.sx(3), P.sy(0) + 13, '3', { s: 10, c: G })); },
  4: () => { const P = plane(-2.3, 2.6, -3, 3.4, 200, 170); const hl = (k, c, lab) => L(P.sx(-2.2), P.sy(k), P.sx(2.4), P.sy(k), { c, w: 1.4, d: '5 3' }) + T(P.sx(2.45) + 2, P.sy(k) + 4, lab, { a: 'start', c, s: 10 });
    return svg(280, 170, P.axes() + P.curve(cub, -2.15, 2.2) + hl(2.6, G, 'k>2: 1개') + hl(2, B, 'k=2: 2개') + hl(0.8, R, '−2<k<2: 3개') + [-1.6, 0.27, 1.33].map(x => D(P.sx(x), P.sy(0.8), R, 3)).join('') + T(140, 165, 'y = k 를 위아래로 움직여 교점 세기', { s: 10, c: G })); },
  5: () => { const x0 = 30, W = 230, y = 40, s = 32; const p = t => t * t * t - 6 * t * t + 9 * t;
    return svg(260, 160, L(x0, y, x0 + W, y, { m: 'ar', w: 1.3 }) + [0, 1, 2, 3, 4].map(v => L(x0 + v * s * 1.2, y - 4, x0 + v * s * 1.2, y + 4, { w: 1 }) + T(x0 + v * s * 1.2, y + 16, v, { s: 10, c: G })).join('') + T(x0 + W - 4, y - 8, 'x', { s: 11 })
      + `<path d="M${x0} ${y - 12} Q ${x0 + 60} ${y - 34} ${x0 + 4 * 1.2 * s - 0} ${y - 14}" fill="none" stroke="${B}" stroke-width="1.8" marker-end="url(#arB)"/>` + T(x0 + 70, y - 30, '0≤t≤1 앞으로 (v>0)', { s: 10, c: B })
      + `<path d="M${x0 + 4 * 1.2 * s} ${y + 22} Q ${x0 + 3 * 1.2 * s} ${y + 40} ${x0 + 3} ${y + 24}" fill="none" stroke="${R}" stroke-width="1.8" marker-end="url(#arR)"/>` + T(x0 + 95, y + 52, '1≤t≤3 뒤로 (v<0)', { s: 10, c: R })
      + T(130, 125, '방향 바뀌는 순간: v = 0 이고 부호 변화', { b: 1, s: 11.5 }) + T(130, 145, 'x(t)=t³−6t²+9t, v = 3(t−1)(t−3)', { s: 10.5, c: G })); },
  6: () => { const P = plane(-2, 2.2, -1.2, 5.2, 260, 150); const f = c => x => 0.6 * x * x + c;
    return svg(260, 170, P.axes() + [-0.6, 0.8, 2.2, 3.6].map((c, i) => P.curve(f(c), -1.9, 1.9, { c: i === 1 ? R : G, w: i === 1 ? 2.4 : 1.5 })).join('') + T(P.sx(-1.25), P.sy(0.35), 'F(x)', { c: R, b: 1 }) + T(P.sx(1.95), P.sy(4.6), '+C', { c: G, b: 1, a: 'start' })
      + T(130, 165, '미분하면 다 같은 f(x) → 적분하면 +C', { b: 1, s: 11 })); },
  7: () => { const P = plane(-0.4, 3.4, -0.6, 4.2); const f = x => 0.35 * x * x + 0.8; const a = 0.7, b = 2.7;
    return svg(260, 170, P.axes() + P.fill(f, () => 0, a, b) + P.curve(f, -0.2, 3.2) + L(P.sx(a), P.sy(0), P.sx(a), P.sy(f(a)), { w: 1.2 }) + L(P.sx(b), P.sy(0), P.sx(b), P.sy(f(b)), { w: 1.2 })
      + T(P.sx(a), P.sy(0) + 14, 'a', { c: G }) + T(P.sx(b), P.sy(0) + 14, 'b', { c: G }) + T(P.sx((a + b) / 2), P.sy(0.9), '∫ₐᵇ f(x)dx', { c: B, b: 1 }) + T(P.sx((a + b) / 2), P.sy(0.35), '= F(b) − F(a)', { c: B, s: 10.5 })); },
  8: () => { const P = plane(-1.8, 3.6, -0.8, 9.8); const f = x => x * x, g = x => 2 * x + 3;
    return svg(260, 170, P.axes() + P.fill(g, f, -1, 3, '#b91c1c26') + P.curve(f, -1.6, 3.1) + P.curve(g, -1.6, 3.3, { c: B }) + D(P.sx(-1), P.sy(1)) + D(P.sx(3), P.sy(9))
      + T(P.sx(-1), P.sy(0) + 14, 'α=−1', { s: 10, c: G }) + T(P.sx(3), P.sy(0) + 14, 'β=3', { s: 10, c: G }) + L(P.sx(3), P.sy(0), P.sx(3), P.sy(9), { c: G, d: '3 2', w: 1 })
      + T(P.sx(1.05), P.sy(3.6), '위 − 아래', { c: R, b: 1 }) + T(P.sx(3.3), P.sy(9.3), 'y=2x+3', { a: 'end', c: B, s: 10 }) + T(P.sx(-1.5), P.sy(3.4), 'y=x²', { s: 10 })); },
  9: () => { const P = plane(-0.3, 3.5, -3.4, 9.5, 260, 150); const v = t => 3 * t * t - 6 * t;
    return svg(260, 172, P.axes('t', 'v') + P.fill(v, () => 0, 0, 2, '#b91c1c30') + P.fill(v, () => 0, 2, 3, '#1f4fb833') + P.curve(v, 0, 3.2)
      + T(P.sx(1), P.sy(-1.1), '넓이 4 (뒤로)', { c: R, s: 10, b: 1 }) + T(P.sx(2.68), P.sy(2.2), '넓이 4', { c: B, s: 10, b: 1 }) + T(P.sx(2), P.sy(0) - 6, '2', { s: 10, c: G }) + T(P.sx(3), P.sy(0) + 14, '3', { s: 10, c: G })
      + T(130, 167, '위치 = −4 + 4 = 0 / 거리 = 4 + 4 = 8', { b: 1, s: 11 })); },
};

/* ───────── 화학 ───────── */
const lvl = (x, y, w, lab, o = {}) => L(x, y, x + w, y, { w: 2.6, c: o.c || '#111' }) + T(x + w / 2, y - 6, lab, { s: o.s || 11, b: 1, c: o.c || '#111' });
const varr = (x, y1, y2, lab, c = R, side = 'start') => L(x, y1, x, y2, { c, m: c === R ? 'arR' : 'arB', w: 1.8 }) + T(x + (side === 'start' ? 6 : -6), (y1 + y2) / 2 + 4, lab, { a: side, c, s: 11, b: 1 });
const hump = (x0, y0, x1, y1, top, c = '#111', d = '') => `<path d="M${x0} ${y0} C ${x0 + 40} ${y0}, ${(x0 + x1) / 2 - 25} ${top}, ${(x0 + x1) / 2} ${top} S ${x1 - 40} ${y1}, ${x1} ${y1}" fill="none" stroke="${c}" stroke-width="2.2" ${d ? `stroke-dasharray="${d}"` : ''}/>`;
const CHEM = {
  1: () => svg(300, 165, T(75, 16, '발열 (ΔH < 0)', { b: 1, c: R }) + lvl(15, 45, 55, '반응물') + lvl(85, 120, 55, '생성물') + L(70, 45, 85, 120, { c: G, d: '3 2', w: 1 }) + varr(150, 45, 118, 'ΔH<0', R) + T(75, 150, '열 방출 → 주위 온도 ↑', { s: 10, c: G })
    + T(225, 16, '흡열 (ΔH > 0)', { b: 1, c: B }) + lvl(165, 120, 55, '반응물') + lvl(235, 45, 55, '생성물') + L(220, 120, 235, 45, { c: G, d: '3 2', w: 1 }) + varr(292, 120, 47, 'ΔH>0', B, 'end') + T(225, 150, '열 흡수 → 주위 온도 ↓', { s: 10, c: G })),
  2: () => svg(300, 172, lvl(15, 25, 270, '원자 상태: 4H + 2O (결합 다 끊김)', { s: 10.5 }) + lvl(20, 105, 80, '2H₂ + O₂') + lvl(200, 140, 85, '2H₂O(g)')
    + varr(60, 103, 28, '끊기: 흡수 (+)', B) + varr(225, 28, 137, '만들기: 방출 (−)', R, 'end') + varr(150, 105, 138, 'ΔH', '#111') + L(100, 105, 150, 105, { c: G, d: '3 2', w: 1 }) + T(150, 166, 'ΔH = 끊은 결합 합 − 생긴 결합 합 (반응물 − 생성물)', { s: 10, c: G })),
  3: () => svg(300, 172, lvl(20, 30, 70, 'C + O₂') + lvl(115, 85, 70, 'CO + ½O₂') + lvl(210, 140, 70, 'CO₂')
    + L(35, 32, 35, 138, { c: R, m: 'arR', w: 1.8 }) + T(41, 125, 'ΔH₁ = −393.5', { a: 'start', c: R, b: 1, s: 11 }) + L(90, 32, 115, 85, { c: B, w: 1.6, m: 'arB' }) + T(120, 55, 'ΔH₂ = ?', { c: B, b: 1, s: 11, a: 'start' }) + L(185, 87, 210, 140, { c: B, w: 1.6, m: 'arB' }) + T(210, 108, 'ΔH₃ = −283.0', { c: B, b: 1, s: 11, a: 'start' })
    + L(35, 140, 210, 140, { c: G, d: '3 2', w: 1 }) + T(150, 166, '경로가 달라도 합은 같다: ΔH₁ = ΔH₂ + ΔH₃', { s: 10.5, b: 1 })),
  4: () => { const box = (x, lab, pts, c) => `<rect x="${x}" y="22" width="80" height="90" rx="4" fill="none" stroke="#111" stroke-width="1.6"/>` + pts.map(([a, b]) => D(x + a, 22 + b, c, 4.2)).join('') + T(x + 40, 127, lab, { b: 1 });
    const grid = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) grid.push([14 + i * 17, 30 + j * 16]);
    const liq = [[12, 60], [26, 68], [40, 62], [55, 70], [68, 60], [18, 76], [33, 78], [48, 76], [62, 78], [20, 48], [44, 48], [64, 46]];
    const gas = [[12, 14], [60, 22], [35, 46], [68, 64], [16, 74], [48, 82]];
    return svg(300, 168, box(10, '고체', grid, '#555') + box(110, '액체', liq, B) + box(210, '기체', gas, R) + L(30, 140, 270, 140, { c: R, m: 'arR', w: 1.8 }) + T(150, 160, '엔트로피(무질서도) 증가 · 기체 몰수 ↑ → ΔS > 0', { s: 10.5, c: R, b: 1 })); },
  5: () => { const cell = (x, y, a, b, t, c) => `<rect x="${x}" y="${y}" width="120" height="58" fill="${c}" stroke="#111" stroke-width="1.4"/>` + T(x + 60, y + 22, a + ', ' + b, { s: 11 }) + T(x + 60, y + 42, t, { b: 1, s: t.length > 8 ? 9.5 : 12 });
    return svg(300, 165, T(150, 14, 'ΔS전체 = ΔS계 + ΔS주위 > 0 이면 자발', { b: 1, s: 11.5 }) + cell(30, 25, 'ΔH<0', 'ΔS계>0', '항상 자발', '#dcfce7') + cell(150, 25, 'ΔH>0', 'ΔS계<0', '항상 비자발', '#fee2e2')
      + cell(30, 83, 'ΔH<0', 'ΔS계<0', '|ΔS계|<|ΔS주위| 자발', '#f3f4f6') + cell(150, 83, 'ΔH>0', 'ΔS계>0', '|ΔS계|>|ΔS주위| 자발', '#f3f4f6') + T(150, 158, '발열(ΔH<0) → ΔS주위>0 / 흡열 → ΔS주위<0', { s: 10, c: G })); },
  6: () => { const P = plane(-0.3, 5, -0.1, 1.1); const c = t => Math.exp(-0.55 * t); const t1 = 1, t2 = 3;
    return svg(260, 170, P.axes('t', '[A]') + P.curve(c, 0, 4.8) + `<line x1="${P.sx(0)}" y1="${P.sy(1)}" x2="${P.sx(1.5)}" y2="${P.sy(1 - 0.55 * 1.5)}" stroke="${R}" stroke-width="1.8"/>` + T(P.sx(0.2), P.sy(0.08), '초기 속도 = 접선', { s: 10, c: R, b: 1, a: 'start' })
      + L(P.sx(t1), P.sy(c(t1)), P.sx(t2), P.sy(c(t2)), { c: B, w: 1.8 }) + D(P.sx(t1), P.sy(c(t1)), B) + D(P.sx(t2), P.sy(c(t2)), B) + T(P.sx(2.4), P.sy(0.58), '평균 속도(할선)', { s: 10, c: B, b: 1, a: 'start' })
      + T(160, 16, 'v = −Δ[A]/Δt · 처음이 가장 빠름', { b: 1, s: 11 })); },
  7: () => { const P = plane(-0.3, 4.4, -0.08, 1.12); const c = t => Math.pow(0.5, t);
    return svg(260, 170, P.axes('t', '[A]') + P.curve(c, 0, 4.2) + [1, 2, 3].map(n => L(P.sx(n), P.sy(0), P.sx(n), P.sy(c(n)), { c: G, d: '3 2', w: 1 }) + L(P.sx(0), P.sy(c(n)), P.sx(n), P.sy(c(n)), { c: G, d: '3 2', w: 1 }) + D(P.sx(n), P.sy(c(n)), R) + T(P.sx(n), P.sy(0) + 13, (n === 1 ? '' : n) + 't½', { s: 9.5, c: G }) + T(P.sx(0) - 4, P.sy(c(n)) + 4, ['', '½', '¼', '⅛'][n], { a: 'end', s: 11, c: R, b: 1 })).join('')
      + T(165, 18, 't½ 마다 절반 · 1차 반응은 간격 일정', { b: 1, s: 10.5 })); },
  8: () => svg(300, 172, hump(20, 120, 280, 140, 30) + L(20, 120, 60, 120, { c: G, d: '3 2', w: 1 }) + L(60, 30, 245, 30, { c: G, d: '3 2', w: 1 }) + L(245, 140, 290, 140, { c: G, d: '3 2', w: 1 }) + L(250, 120, 290, 120, { c: G, d: '3 2', w: 1 })
    + L(60, 120, 60, 33, { c: B, m: 'arB', w: 1.6 }) + T(54, 82, 'Eₐ(정)', { a: 'end', c: B, b: 1, s: 10.5 }) + L(245, 140, 245, 33, { c: R, m: 'arR', w: 1.6 }) + T(240, 92, 'Eₐ(역)', { a: 'end', c: R, b: 1, s: 10.5 })
    + L(288, 120, 288, 138, { m: 'ar', w: 1.4 }) + T(284, 112, 'ΔH', { a: 'end', b: 1, s: 10.5 }) + T(150, 22, '활성화물 (불안정)', { s: 10 }) + T(40, 135, '반응물', { s: 10 }) + T(265, 156, '생성물', { s: 10 }) + T(150, 168, 'ΔH = Eₐ정 − Eₐ역', { s: 11, b: 1 })),
  9: () => svg(300, 170, hump(20, 125, 280, 145, 25) + hump(20, 125, 280, 145, 75, B, '6 3') + L(75, 125, 75, 28, { c: '#111', m: 'ar', w: 1.4 }) + T(70, 80, 'Eₐ', { a: 'end', b: 1 }) + L(95, 125, 95, 78, { c: B, m: 'arB', w: 1.4 }) + T(101, 104, "Eₐ'", { a: 'start', c: B, b: 1 })
    + T(150, 18, '촉매 없음', { s: 10 }) + T(150, 98, '정촉매: 새 경로 (Eₐ ↓)', { s: 10, c: B, b: 1 }) + varr(270, 126, 143, '', '#111') + T(262, 162, 'ΔH 는 그대로!', { s: 11, c: R, b: 1, a: 'end' })),
};
module.exports = { CALC, CHEM };
