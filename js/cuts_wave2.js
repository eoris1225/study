'use strict';
/* 4장(단진동), 5장 후반, 6장(소리의 간섭), 7장(정상파) 개념 컷신 */
window.CUTS = window.CUTS || {};
(() => {
  const C = CX, { seg, cl, E, plain, pill, text, arrow, dbl, dimH, dimV, rope, ball, ring, graph, G, path, fillPts, dot, along, curve, card, bar, chr, spring, wall, fronts, speaker, tube, stand } = C;
  const TAU = Math.PI * 2, lerp = (a, b, k) => a + (b - a) * k;
  const green = (x, t) => plain(x, '#0b5a5a', '#22b08a', t), teal = (x, t) => plain(x, '#0b5f8a', '#22b0c8', t), hall = (x, t) => plain(x, '#40208c', '#a052d8', t), gold = (x, t) => plain(x, '#7a2f8a', '#ff9a5a', t);
  const formula = (x, s, k, y = 600, size = 38) => pill(x, 640, y, s, k, '#ffd23f', '#2a0f5e', size);
  const floor = (x, y) => { x.fillStyle = 'rgba(20,6,60,.35)'; rr(x, 80, y, 1120, 18, 9); x.fill(); };

  /* ---------- 4a 용수철과 복원력 ---------- */
  CUTS['4a'] = [
    { dur: 9, base: '#0b5a5a', lines: [[0, 'narr', '용수철에 공을 매달아 바닥에 둔다. 가만히 있는 자리가 <b>평형점 O</b>.'], [2.6, 'narr', 'x만큼 당기면 용수철이 끌어당긴다. 밀면 밀어낸다. 언제나 <b>평형점 쪽으로</b>.'], [5.6, 'narr', '이 힘이 <b>복원력 F = −kx</b>. 늘어난 만큼, 반대 방향으로.']],
      draw(x, t) { green(x, t); const Y = 380, O = 700, xx = t < 2.6 ? 0 : t < 5.4 ? 180 * E.io(seg(t, 2.6, 3.4)) - 360 * E.io(seg(t, 4, 4.8)) : 180 * Math.cos((t - 5.4) * 2.4); wall(x, 120, 260, 40, 160); floor(x, Y + 34); spring(x, 160, Y, O + xx - 40, Y, 18, 22); ball(x, O + xx, Y, 40, '#ffd23f');
        x.strokeStyle = 'rgba(255,255,255,.6)'; x.setLineDash([8, 10]); x.lineWidth = 3; x.beginPath(); x.moveTo(O, 200); x.lineTo(O, 470); x.stroke(); x.setLineDash([]); text(x, 'O', O, 180, 30);
        if (Math.abs(xx) > 10) { arrow(x, O + xx, Y - 70, O + xx - xx * .7, Y - 70, '#ff5f6d', 12, 1); text(x, 'F', O + xx - xx * .35, Y - 110, 30, '#ff5f6d'); dimH(x, Math.min(O, O + xx), Math.max(O, O + xx), Y + 80, 'x', 1); }
        formula(x, 'F = −k x', seg(t, 5.6, 6.1), 560); } },
    { dur: 8.5, base: '#0b5a5a', lines: [[0, 'narr', '세로로 매달면? 추가 x₀만큼 늘어난 곳에서 <b>kx₀ = mg</b>로 평형.'], [3.4, 'narr', '거기서 x만큼 더 당기면 합력은 −k(x₀+x) + mg = <b>−kx</b>.'], [6, 'narr', '중력이 있어도 평형점을 기준으로 보면 똑같은 복원력이다.']],
      draw(x, t) { green(x, t); x.fillStyle = '#40238f'; rr(x, 300, 90, 680, 30, 12); x.fill(); const cols = [[400, 0, 0], [640, 1, 0], [880, 1, 1]];
        cols.forEach(([X, a, b], i) => { if (t < i * 1.2) return; const y0 = 300, eq = 400, y = !a ? y0 : !b ? eq : eq + 90 + Math.sin(t * 3) * 10 * 0; spring(x, X, 120, X, y - 34, 14, 18); ball(x, X, y, 34, '#ffd23f');
          if (a) { arrow(x, X + 50, y, X + 50, y + 90, '#ff5f6d', 9, 1); text(x, 'mg', X + 90, y + 70, 24, '#ff9fc4'); arrow(x, X - 50, y, X - 50, y - (b ? 130 : 90), '#7fd8ff', 9, 1); text(x, b ? 'k(x₀+x)' : 'kx₀', X - 120, y - 60, 24, '#bfe9ff'); } });
        x.strokeStyle = 'rgba(255,255,255,.5)'; x.setLineDash([8, 10]); x.lineWidth = 3; x.beginPath(); x.moveTo(300, 400); x.lineTo(1000, 400); x.stroke(); x.setLineDash([]); text(x, 'O', 280, 400, 26); formula(x, 'F = −k x', seg(t, 3.6, 4.1), 600); } }
  ];

  /* ---------- 4b 원운동의 그림자 ---------- */
  CUTS['4b'] = [
    { dur: 11, base: '#0b5a5a', lines: [[0, 'narr', '원을 일정한 속력으로 도는 점 P. 옆에서 빛을 비추면'], [2.4, 'narr', '벽에 비친 그림자 Q는 위아래로 <b>단진동</b>한다.'], [5, 'narr', '그 그림자를 시간에 따라 펼치면 사인 곡선. <b>x = A sin ωt</b>.'], [8, 'narr', 'θ = ωt 가 <b>위상</b>, 한 바퀴 시간이 주기 T.']],
      draw(x, t) { green(x, t); const cx = 260, cy = 340, A = 150, w = 1.3, th = t * w, px = cx + A * Math.cos(th), py = cy - A * Math.sin(th), QX = 520;
        x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy, A, 0, TAU); x.stroke(); x.strokeStyle = '#ff5f6d'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke(); x.fillStyle = 'rgba(255,210,63,.35)'; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 40, 0, -(th % TAU), true); x.fill();
        if (t > 2.4) { x.strokeStyle = 'rgba(255,255,255,.5)'; x.setLineDash([6, 8]); x.lineWidth = 3; x.beginPath(); x.moveTo(px, py); x.lineTo(QX, py); x.stroke(); x.setLineDash([]); x.strokeStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.moveTo(QX, cy - A - 20); x.lineTo(QX, cy + A + 20); x.stroke(); ball(x, QX, py, 20, '#7fd8ff'); text(x, 'Q', QX + 36, py, 26); }
        ball(x, px, py, 20, '#ffd23f'); text(x, 'P', px + 30, py - 24, 26);
        if (t > 5) { const pts = []; for (let s = 0; s <= 300; s += 4) { const tt = th - s / 90; if (tt < 5 * w) break; pts.push([QX + 30 + s * 2, cy - A * Math.sin(tt)]); } path(x, pts, '#7fd8ff', 6, 1); x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 3; x.beginPath(); x.moveTo(QX + 30, cy); x.lineTo(1200, cy); x.stroke(); }
        formula(x, 'x = A sin ωt', seg(t, 5.4, 5.9), 590); pill(x, cx, cy + A + 60, 'θ = ωt', seg(t, 8, 8.4), '#ffd23f'); } }
  ];

  /* ---------- 4c 속력·가속도·힘 ---------- */
  CUTS['4c'] = [
    { dur: 10, base: '#0b5a5a', lines: [[0, 'narr', '단진동하는 공의 <b>속도</b>는 가운데(O)에서 가장 빠르고, 양 끝에서 0.'], [3.4, 'narr', '<b>가속도</b>는 반대. 양 끝에서 가장 크고 가운데서 0. 방향은 언제나 O 쪽.'], [6.6, 'narr', 'a = −ω²x, 그러니 힘 F = ma = <b>−mω²x</b>. 최대 속력 Aω, 최대 가속도 Aω².']],
      draw(x, t) { green(x, t); const Y = 300, O = 640, A = 300, w = 1.6, xx = A * Math.sin(t * w), v = Math.cos(t * w), a = -Math.sin(t * w); wall(x, 120, 200, 40, 160); floor(x, Y + 40); spring(x, 160, Y, O + xx - 40, Y, 20, 20); ball(x, O + xx, Y, 40, '#ffd23f');
        text(x, 'O', O, Y + 80, 26); text(x, '−A', O - A, Y + 80, 26); text(x, '+A', O + A, Y + 80, 26);
        arrow(x, O + xx, Y - 80, O + xx + v * 140, Y - 80, '#7fd8ff', 11, seg(t, .4, .8)); pill(x, O + xx + v * 70, Y - 130, 'v', seg(t, .4, .8), '#7fd8ff');
        if (t > 3.4) { arrow(x, O + xx, Y + 130, O + xx + a * 140, Y + 130, '#ff5f6d', 11, 1); pill(x, O + xx + a * 70, Y + 180, 'a', 1, '#ff9fc4'); }
        bar(x, 300, 520, 300, Math.abs(v), 1, '#7fd8ff', '|v|'); bar(x, 820, 520, 300, Math.abs(a), 1, '#ff5f6d', '|a|', seg(t, 3.4, 4)); formula(x, 'a = −ω² x', seg(t, 6.6, 7.1), 110); } }
  ];

  /* ---------- 4d 주기 ---------- */
  CUTS['4d'] = [
    { dur: 10, base: '#0b5a5a', lines: [[0, 'narr', '같은 용수철에 <b>무거운</b> 추를 달면 더 천천히 흔들린다.'], [3, 'narr', '<b>단단한</b> 용수철(k 큼)이면 더 빨리 흔들린다.'], [6, 'narr', 'kx = mω²x 에서 ω = √(k/m). 그래서 <b>T = 2π√(m/k)</b>.']],
      draw(x, t) { green(x, t); x.fillStyle = '#40238f'; rr(x, 140, 80, 1000, 28, 12); x.fill(); const S = [[300, 1, 1, '기준'], [640, 4, 1, 'm × 4 → T × 2'], [980, 1, 4, 'k × 4 → T ÷ 2']];
        S.forEach(([X, m, k, lab], i) => { if (i === 2 && t < 3) return; if (i === 1 && t < .6) return; const w = 2.6 * Math.sqrt(k / m), y = 340 + 90 * Math.cos(t * w); spring(x, X, 108, X, y - 30 - m * 4, k > 1 ? 22 : 14, k > 1 ? 12 : 18, k > 1 ? '#ffd23f' : '#e6fbff', k > 1 ? 7 : 5); ball(x, X, y, 30 + m * 4, i === 1 ? '#ff8a3c' : '#ffd23f'); pill(x, X, 560, lab, 1, '#fff', '#0b5a5a', 26); });
        formula(x, 'T = 2π √(m / k)', seg(t, 6, 6.5), 640 - 0, 40); } },
    { dur: 8, base: '#0b5a5a', lines: [[0, 'narr', '그럼 <b>많이 당길수록</b> 주기가 길어질까?'], [2.4, 'narr', '5 cm든 20 cm든 10번 왕복 시간은 약 8.1초. 주기 약 0.81 s로 <b>똑같다</b>.'], [5.4, 'narr', '주기는 진폭과 무관하다. m과 k만이 정한다.']],
      draw(x, t) { green(x, t); x.fillStyle = '#40238f'; rr(x, 240, 80, 800, 28, 12); x.fill(); [[440, 40], [840, 110]].forEach(([X, A]) => { const y = 330 + A * Math.cos(t * 3); spring(x, X, 108, X, y - 34, 16, 18); ball(x, X, y, 34, '#ffd23f'); pill(x, X, 560, A < 100 ? '조금 당김' : '많이 당김', 1, '#fff', '#0b5a5a', 26); }); pill(x, 640, 200, 'T 같음', seg(t, 2.6, 3), '#ffd23f', '#2a0f5e', 34); } }
  ];

  /* ---------- 4e 단진동의 에너지 ---------- */
  CUTS['4e'] = [
    { dur: 9, base: '#0b5a5a', lines: [[0, 'narr', '용수철에 저장되는 탄성 퍼텐셜 에너지 <b>½kx²</b>, 공의 운동 에너지 <b>½mv²</b>.'], [3, 'narr', '끝에서는 전부 퍼텐셜, 가운데서는 전부 운동 에너지. 서로 바뀌기만 한다.'], [6, 'narr', '합은 언제나 <b>½kA²</b>로 일정. 역학적 에너지 보존.']],
      draw(x, t) { green(x, t); const Y = 260, O = 640, A = 300, w = 1.5, xx = A * Math.sin(t * w), Ep = Math.sin(t * w) ** 2, Ek = 1 - Ep; wall(x, 120, 160, 40, 160); floor(x, Y + 40); spring(x, 160, Y, O + xx - 40, Y, 20, 20); ball(x, O + xx, Y, 40, '#ffd23f');
        const bx = 520, by = 560; x.fillStyle = 'rgba(255,255,255,.15)'; rr(x, bx - 10, by - 220, 260, 230, 16); x.fill(); x.fillStyle = '#7fd8ff'; rr(x, bx + 10, by - 200 * Ek, 70, 200 * Ek, 10); x.fill(); x.fillStyle = '#ff6fa8'; rr(x, bx + 90, by - 200 * Ep, 70, 200 * Ep, 10); x.fill(); x.fillStyle = '#ffd23f'; rr(x, bx + 170, by - 200, 70, 200, 10); x.fill();
        text(x, 'Eₖ', bx + 45, by + 24, 22); text(x, 'Eₚ', bx + 125, by + 24, 22); text(x, '합', bx + 205, by + 24, 22); formula(x, '½kx² + ½mv² = ½kA²', seg(t, 6, 6.5), 110, 32); } }
  ];

  /* ---------- 5e 매질에 따른 속력 ---------- */
  CUTS['5e'] = [
    { dur: 9, base: '#0b5f8a', lines: [[0, 'narr', '같은 소리를 공기, 물, 강철 속으로 동시에 보낸다.'], [2, 'narr', '공기 약 340 m/s, 물 약 1500 m/s, 강철 약 5900 m/s. <b>고체 > 액체 > 기체</b>.'], [5.4, 'narr', '매질이 단단할수록(탄성이 클수록) 옆 입자에 떨림을 빨리 전한다. 공기는 따뜻할수록 빠르다: v = 331 + 0.6t.']],
      draw(x, t) { teal(x, t); const L = [['공기', 343, '#bfe9ff'], ['물', 1482, '#4cc2ff'], ['강철', 5941, '#c9b6ff']], tt = Math.max(0, t - 1);
        L.forEach(([n, v, c], i) => { const Y = 180 + i * 130; x.fillStyle = c; x.globalAlpha = .35; rr(x, 220, Y - 40, 960, 80, 40); x.fill(); x.globalAlpha = 1; pill(x, 140, Y, n, 1, '#fff', '#0b5f8a', 26); const X = 240 + Math.min(920, tt * v * .1); x.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(X - k * 14, Y, 6, 30 - k * 6, 0, 0, TAU); x.fill(); } if (t > 2) pill(x, 1080, Y - 46, v + ' m/s', seg(t, 2 + i * .4, 2.4 + i * .4), '#fff', '#0b5f8a', 22); });
        formula(x, 'v = 331 + 0.6 t', seg(t, 6, 6.5), 580, 32); } },
    { dur: 9, base: '#0b5f8a', lines: [[0, 'narr', '물결파는 <b>깊은 곳에서 빠르고</b>, 얕은 곳에서 느리다.'], [3, 'narr', '얕은 곳으로 들어가면 속력과 파장이 줄어든다.'], [5.4, 'narr', '하지만 <b>진동수는 변하지 않는다</b>. 파원이 정하기 때문.']],
      draw(x, t) { teal(x, t); x.fillStyle = '#0a3f6a'; x.beginPath(); x.moveTo(80, 520); x.lineTo(640, 520); x.lineTo(760, 400); x.lineTo(1200, 400); x.lineTo(1200, 560); x.lineTo(80, 560); x.fill(); const Y = 300, ph = t * TAU * .6;
        const f = X => { if (X < 680) return -40 * Math.sin(TAU * (X - 100) / 300 - ph); const p0 = TAU * (680 - 100) / 300; return -40 * Math.sin(p0 + TAU * (X - 680) / 150 - ph); };
        x.fillStyle = 'rgba(76,194,255,.6)'; x.beginPath(); x.moveTo(80, 560); for (let X = 80; X <= 1200; X += 6) x.lineTo(X, Y + f(X)); x.lineTo(1200, 560); x.fill(); pill(x, 360, 460, '깊음 · 빠름', seg(t, .4, .8), '#fff', '#0b5f8a', 26); pill(x, 960, 360, '얕음 · 느림', seg(t, 3, 3.4), '#fff', '#0b5f8a', 26);
        if (t > 3) { dimH(x, 160, 460, 180, 'λ', seg(t, 3, 3.6)); dimH(x, 760, 910, 180, 'λ 짧아짐', seg(t, 3.4, 4)); } formula(x, 'f 는 그대로', seg(t, 5.4, 5.9), 590, 32); } }
  ];

  /* ---------- 5f 반사 ---------- */
  const pulseRope = (x, t, inv, thinToThick) => { const Y = 330, B = 640, v = 180, t0 = .6, w = 50, A = 90, s = (t - t0) * v;
    const inc = X => A * Math.exp(-(((X - (120 + s)) / w) ** 2)) * (X < B ? 1 : 0), ref = X => (inv ? -1 : 1) * .6 * A * Math.exp(-(((X - (2 * B - 120 - s)) / w) ** 2)) * (X < B ? 1 : 0), tr = X => (inv ? .6 : 1.3) * A * Math.exp(-(((X - B - (s - (B - 120)) * (thinToThick ? .55 : 1.6)) / (w * (thinToThick ? .7 : 1.4))) ** 2)) * (X >= B && s > B - 120 - 80 ? 1 : 0);
    for (const [x0, x1, wd, col] of [[80, B, thinToThick ? 6 : 16, '#f0c890'], [B, 1200, thinToThick ? 16 : 6, '#f0c890']]) { x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); for (let X = x0; X <= x1; X += 4) { const y = Y - inc(X) - ref(X) - tr(X); X === x0 ? x.moveTo(X, y) : x.lineTo(X, y); } x.stroke(); }
    x.strokeStyle = '#ff5f6d'; x.setLineDash([6, 8]); x.lineWidth = 3; x.beginPath(); x.moveTo(B, 160); x.lineTo(B, 500); x.stroke(); x.setLineDash([]); };
  CUTS['5f'] = [
    { dur: 8, base: '#0b5f8a', lines: [[0, 'narr', '파동이 다른 매질을 만나면 일부는 넘어가고(<b>투과</b>) 일부는 돌아온다(<b>반사</b>).'], [3, 'narr', '가는 줄 → 굵은 줄(소한 → 밀한)이면 반사파가 <b>뒤집혀서</b> 돌아온다. 고정단 반사.']],
      draw(x, t) { teal(x, t); pulseRope(x, t, true, true); pill(x, 340, 130, '가는 줄 (소한)', 1, '#fff', '#0b5f8a', 24); pill(x, 940, 130, '굵은 줄 (밀한)', 1, '#fff', '#0b5f8a', 24); pill(x, 640, 570, '고정단 반사 · 위상 180° 반전', seg(t, 3.6, 4), '#ffd23f', '#2a0f5e', 30); } },
    { dur: 8, base: '#0b5f8a', lines: [[0, 'narr', '반대로 굵은 줄 → 가는 줄(밀한 → 소한)이면'], [2.6, 'narr', '반사파가 <b>그대로</b> 돌아온다. 자유단 반사, 위상 변화 없음.']],
      draw(x, t) { teal(x, t); pulseRope(x, t, false, false); pill(x, 340, 130, '굵은 줄 (밀한)', 1, '#fff', '#0b5f8a', 24); pill(x, 940, 130, '가는 줄 (소한)', 1, '#fff', '#0b5f8a', 24); pill(x, 640, 570, '자유단 반사 · 위상 그대로', seg(t, 3.4, 3.8), '#ffd23f', '#2a0f5e', 30); } }
  ];

  /* ---------- 5g 활용 ---------- */
  CUTS['5g'] = [
    { dur: 8, base: '#0b5f8a', lines: [[0, 'narr', '대부분의 활용은 “쏘고, 돌아오는 걸 분석한다”.'], [2.2, 'narr', '배에서 음파를 쏘면 물고기 떼와 바닥에서 반사되어 돌아온다. <b>음파 탐지기</b>.'], [5.4, 'narr', '물속에선 빛보다 음파가 훨씬 멀리 가기 때문이다.']],
      draw(x, t) { teal(x, t); x.fillStyle = '#0a3f6a'; x.fillRect(-400, 240, 2080, 900); x.fillStyle = '#ffd6a0'; x.beginPath(); x.moveTo(-400, 560); for (let X = -400; X <= 1680; X += 40) x.lineTo(X, 560 - 30 * Math.sin(X * .01)); x.lineTo(1680, 800); x.lineTo(-400, 800); x.fill();
        x.fillStyle = '#fff'; rr(x, 520, 190, 240, 50, 18); x.fill(); x.fillStyle = '#ff5f6d'; rr(x, 600, 150, 80, 44, 10); x.fill();
        const u = ((t - 1) % 3.2) / 3.2; if (t > 1) { const r = u * 2 < 1 ? u * 2 * 340 : (2 - u * 2) * 340; x.strokeStyle = u < .5 ? '#ffd23f' : '#7fd8ff'; x.lineWidth = 6; x.beginPath(); x.arc(640, 240, Math.max(4, r), .6, Math.PI - .6); x.stroke(); }
        for (let i = 0; i < 9; i++) { const fx = 820 + (i % 3) * 40 + Math.sin(t + i) * 10, fy = 400 + (i / 3 | 0) * 30; x.fillStyle = '#ffd23f'; x.beginPath(); x.ellipse(fx, fy, 16, 9, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(fx - 14, fy); x.lineTo(fx - 26, fy - 8); x.lineTo(fx - 26, fy + 8); x.fill(); } } },
    { dur: 9, base: '#0b5f8a', lines: [[0, 'narr', '같은 원리로 몸속을 보는 <b>초음파 검사</b>, 건물 속 결함을 찾는 <b>비파괴 검사</b>, 자동차 <b>후방 감지기</b>, 지하 자원 <b>지질 탐사</b>.'], [4.6, 'narr', '에너지를 쓰기도 한다. 기포를 터뜨려 닦는 <b>초음파 세척기</b>, 결석을 깨는 <b>충격파 쇄석술</b>.']],
      draw(x, t) { teal(x, t); [['초음파 검사', .4], ['비파괴 검사', 1.2], ['후방 감지기', 2], ['지질 탐사', 2.8], ['초음파 세척기', 4.6], ['충격파 쇄석술', 5.4]].forEach(([s, a], i) => card(x, 240 + (i % 3) * 400, 200 + (i / 3 | 0) * 240, 340, 200, s, seg(t, a, a + .5), i < 4 ? '#bfe9ff' : '#ffd6a0', x => { x.strokeStyle = '#0b5f8a'; x.lineWidth = 5; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(-60, -30, 20 + k * 20 + ((t * 30) % 20), -.6, .6); x.stroke(); } x.fillStyle = '#0b5f8a'; rr(x, 30, -60, 50, 60, 10); x.fill(); })); } }
  ];

  /* ---------- 6a 소리의 정체 ---------- */
  CUTS['6a'] = [
    { dur: 9, base: '#40208c', lines: [[0, 'narr', '스피커 막이 앞뒤로 떨리며 공기를 밀었다 당겼다 한다.'], [2.6, 'narr', '공기가 빽빽한 곳(<b>밀</b>)과 성긴 곳(<b>소</b>)이 번갈아 귀까지 전해진다. 진동과 진행이 나란한 <b>종파</b>.'], [5.8, 'narr', '밀에서 다음 밀까지가 <b>파장 λ</b>. 밀과 바로 옆 소는 반 파장.']],
      draw(x, t) { hall(x, t); speaker(x, 120, 300, 1.4, 0, t); const lam = 240, k = TAU / lam, w = TAU * .7;
        for (let i = 0; i < 26; i++) for (let j = 0; j < 7; j++) { const X0 = 220 + i * 36 + (j % 2) * 18, X = X0 + 14 * Math.sin(k * (X0 - 220) - w * t); x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(X, 200 + j * 34, 6, 0, TAU); x.fill(); }
        x.fillStyle = '#ffb594'; x.beginPath(); x.ellipse(1190, 300, 40, 70, 0, 0, TAU); x.fill(); x.fillStyle = '#c2557a'; x.beginPath(); x.ellipse(1180, 300, 16, 34, 0, 0, TAU); x.fill();
        for (let m = -1; m < 6; m++) { const Xc = 220 + (Math.PI + w * t) / k - lam * m; if (Xc > 230 && Xc < 1130) pill(x, Xc, 150, '밀', seg(t, 2.6, 3), '#ff5f8f', '#fff', 22); if (Xc - lam / 2 > 230 && Xc - lam / 2 < 1130) pill(x, Xc - lam / 2, 150, '소', seg(t, 2.8, 3.2), '#fff', '#40208c', 22); }
        dimH(x, 400, 640, 500, '파장 λ', seg(t, 5.8, 6.6)); } }
  ];

  /* ---------- 6b 간섭 ---------- */
  const sumScene = (x, t, opp) => { const ys = [180, 330, 500], A = 50, lam = 300, ph = t * 2;
    const fA = X => -A * Math.sin(TAU * X / lam - ph), fB = X => (opp ? -1 : 1) * fA(X) * (opp ? 1 : 1);
    const draw = (Y, f, col, k) => { if (k <= 0) return; x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 2; x.beginPath(); x.moveTo(200, Y); x.lineTo(1150, Y); x.stroke(); x.strokeStyle = col; x.lineWidth = 7; x.beginPath(); const n = 200 + 950 * cl(k); for (let X = 200; X <= n; X += 5) x[X === 200 ? 'moveTo' : 'lineTo'](X, Y + f(X)); x.stroke(); };
    draw(ys[0], fA, '#ff6fa8', seg(t, .2, 1.2)); draw(ys[1], X => opp ? -fA(X) : fA(X), '#7fd8ff', seg(t, .8, 1.8)); draw(ys[2], X => fA(X) + (opp ? -fA(X) : fA(X)), '#ffd23f', seg(t, 2.6, 3.8));
    pill(x, 120, ys[0], 'A', 1, '#ff6fa8', '#fff'); pill(x, 120, ys[1], 'B', 1, '#7fd8ff'); pill(x, 120, ys[2], 'A+B', seg(t, 2.6, 3), '#ffd23f'); };
  CUTS['6b'] = [
    { dur: 8, base: '#40208c', lines: [[0, 'narr', '두 파동이 한곳에서 만나면 높이가 그대로 <b>더해진다</b>(중첩).'], [2.6, 'narr', '같은 위상(마루 + 마루)이면 진폭이 커진다. <b>보강 간섭</b>. 같은 진폭이면 2배.']],
      draw(x, t) { hall(x, t); sumScene(x, t, false); pill(x, 640, 610, '보강 간섭 · 소리 크게', seg(t, 4, 4.4), '#ffd23f', '#2a0f5e', 30); } },
    { dur: 8, base: '#40208c', lines: [[0, 'narr', '반대 위상(마루 + 골)이면 서로 깎아 먹는다. <b>상쇄 간섭</b>.'], [3, 'narr', '진폭이 같으면 합성파의 진폭은 <b>0</b>. 소리가 안 들린다.']],
      draw(x, t) { hall(x, t); sumScene(x, t, true); pill(x, 640, 610, '상쇄 간섭 · 소리 0', seg(t, 4, 4.4), '#ffd23f', '#2a0f5e', 30); } }
  ];

  /* ---------- 6c 경로차 ---------- */
  CUTS['6c'] = [
    { dur: 10, base: '#40208c', lines: [[0, 'narr', '같은 위상으로 같은 소리를 내는 스피커 S₁, S₂. 실선은 마루, 점선은 골.'], [3, 'narr', '마루와 마루가 겹치는 곳(●)은 <b>보강</b>. 마루와 골이 겹치는 곳은 <b>상쇄</b>.'], [6, 'narr', '두 스피커까지 거리의 차, <b>경로차</b>가 그 자리를 정한다.']],
      draw(x, t) { hall(x, t); const s1 = [500, 560], s2 = [780, 560], lam = 110; x.save(); x.beginPath(); x.rect(-400, -300, 2080, 860); x.clip(); fronts(x, s1[0], s1[1], lam, t, 60, 560, '#ff9fc4', true, Math.PI, TAU); fronts(x, s2[0], s2[1], lam, t, 60, 560, '#9fe0ff', true, Math.PI, TAU); x.restore();
        speaker(x, s1[0], s1[1] + 10, .8, -Math.PI / 2, t); speaker(x, s2[0], s2[1] + 10, .8, -Math.PI / 2, t);
        if (t > 3) { const off = (t * 60) % lam, d = s2[0] - s1[0]; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const r1 = off + i * lam, r2 = off + j * lam, A = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h2 = r1 * r1 - A * A; if (h2 <= 0) continue; const px = s1[0] + A, py = s1[1] - Math.sqrt(h2); if (py < 40) continue; x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(px, py, 10 * E.back(seg(t, 3, 3.5)), 0, TAU); x.fill(); } }
        pill(x, 200, 160, '● 보강', seg(t, 3, 3.4), '#ffd23f'); } },
    { dur: 9, base: '#40208c', lines: [[0, 'narr', '규칙: 경로차를 <b>반 파장(λ/2)</b> 단위로 센다.'], [2, 'narr', '짝수 개(0, λ, 2λ…)면 <b>보강</b>, 홀수 개(λ/2, 3λ/2…)면 <b>상쇄</b>.'], [5, 'narr', '예: S₁에서 3λ/2, S₂에서 λ/2. 차이 = λ = 반 파장 <b>2개</b> → 보강.']],
      draw(x, t) { hall(x, t); const P = [800, 160], S1 = [480, 500], S2 = [800, 500]; path(x, [S1, P], '#ff9fc4', 8, seg(t, 5, 5.6)); path(x, [S2, P], '#9fe0ff', 8, seg(t, 5.2, 5.8)); C.dot(x, P[0], P[1], '#ffd23f', 14, 'P'); C.dot(x, S1[0], S1[1], '#ff9fc4', 12, 'S₁'); C.dot(x, S2[0], S2[1], '#9fe0ff', 12, 'S₂');
        pill(x, 560, 300, '3λ/2', seg(t, 5.4, 5.8), '#ff9fc4'); pill(x, 880, 330, 'λ/2', seg(t, 5.6, 6), '#9fe0ff'); pill(x, 280, 200, '짝수 × λ/2 → 보강', seg(t, 2, 2.4), '#ffd23f', '#2a0f5e', 26); pill(x, 280, 280, '홀수 × λ/2 → 상쇄', seg(t, 2.4, 2.8), '#fff', '#40208c', 26); } }
  ];

  /* ---------- 6d 간섭의 활용 ---------- */
  CUTS['6d'] = [
    { dur: 9, base: '#40208c', lines: [[0, 'narr', '<b>소음 제거 헤드폰</b>: 마이크로 바깥 소음을 듣고'], [2.4, 'narr', '그와 <b>반대 위상</b>의 소리를 만들어 섞는다.'], [4.6, 'narr', '상쇄 간섭으로 소음이 사라진다. 자동차·비행기 실내도 같은 원리.']],
      draw(x, t) { hall(x, t); const noise = X => -40 * Math.sin(X * .05 - t * 6) - 20 * Math.sin(X * .13 - t * 9);
        const line = (Y, f, col, k) => { if (k <= 0) return; x.strokeStyle = col; x.lineWidth = 6; x.beginPath(); for (let X = 140; X <= 140 + 900 * cl(k); X += 4) x[X === 140 ? 'moveTo' : 'lineTo'](X, Y + f(X)); x.stroke(); };
        line(170, noise, '#ff5f6d', seg(t, 0, 1)); line(330, X => -noise(X), '#7fd8ff', seg(t, 2.4, 3.4)); line(490, X => 0, '#ffd23f', seg(t, 4.6, 5.4));
        pill(x, 1130, 170, '소음', 1, '#ff5f6d', '#fff'); pill(x, 1130, 330, '반대 위상', seg(t, 2.4, 2.8), '#7fd8ff'); pill(x, 1130, 490, '합 = 0', seg(t, 4.6, 5), '#ffd23f'); } },
    { dur: 9, base: '#40208c', lines: [[0, 'narr', '자동차 소음기는 두 통로 길이를 <b>반 파장의 홀수 배</b> 차이 나게 만들어 배기음을 줄인다.'], [3.6, 'narr', '반대로 보강을 쓰면 소리를 모은다. 수많은 작은 스피커가 한 방향에서만 보강되는 <b>초지향성 스피커</b>.'], [6.6, 'narr', '공연장은 상쇄되는 좌석이 없도록 스피커 위치를 설계한다.']],
      draw(x, t) { hall(x, t); [['소음 제거 헤드폰', .2, '#bfe9ff'], ['자동차 소음기', .8, '#bfe9ff'], ['비행기 실내', 1.4, '#bfe9ff'], ['초지향성 스피커', 3.6, '#ffd6a0'], ['체외 충격파 쇄석기', 4.4, '#ffd6a0'], ['공연장 설계', 6.6, '#ffc2c0']].forEach(([s, a, bg], i) => card(x, 240 + (i % 3) * 400, 200 + (i / 3 | 0) * 240, 340, 200, s, seg(t, a, a + .5), bg, x => { if (i < 3) { x.strokeStyle = '#40208c'; x.lineWidth = 5; x.beginPath(); for (let X = -80; X <= 80; X += 4) x[X === -80 ? 'moveTo' : 'lineTo'](X, -40 + Math.sin(X * .1 + t * 5) * 18 * (1 - (X + 80) / 160)); x.stroke(); } else { x.strokeStyle = '#ff5f8f'; x.lineWidth = 5; for (let k = 0; k < 4; k++) { const r = 20 + k * 18 + (t * 30) % 18; x.beginPath(); x.arc(-70, -40, r, -.25, .25); x.stroke(); } } })); } }
  ];

  /* ---------- 7a 정상파 ---------- */
  CUTS['7a'] = [
    { dur: 11, base: '#7a2f8a', lines: [[0, 'narr', '진폭과 진동수가 같은 두 파동이 <b>반대 방향</b>으로 달린다.'], [2.6, 'narr', '둘을 더하면? 파동이 앞으로 가지 않고 <b>제자리에서</b> 위아래로만 춤춘다. <b>정상파</b>.'], [5.6, 'narr', '항상 0인 점이 <b>마디</b>(상쇄), 가장 크게 흔들리는 점이 <b>배</b>(보강).'], [8.2, 'narr', '마디와 마디 사이 간격은 <b>반 파장 λ/2</b>.']],
      draw(x, t) { gold(x, t); const lam = 360, A = 46, w = 2, X0 = 100, X1 = 1180, k = TAU / lam;
        const line = (Y, f, col, wd = 6) => { x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); for (let X = X0; X <= X1; X += 5) x[X === X0 ? 'moveTo' : 'lineTo'](X, Y + f(X)); x.stroke(); };
        if (t < 5.6) { line(150, X => -A * Math.sin(k * X - w * t), '#ff9fc4'); line(260, X => -A * Math.sin(k * X + w * t), '#9fe0ff'); arrow(x, 1080, 90, 1180, 90, '#ff9fc4', 7, 1); arrow(x, 200, 320, 100, 320, '#9fe0ff', 7, 1); }
        const Y = t < 5.6 ? 450 : 330, fS = X => -2 * A * Math.sin(k * X) * Math.cos(w * t); if (t > 2.6) { for (let j = 0; j < 5; j++) line(Y, X => -2 * A * Math.sin(k * X) * Math.cos(j * Math.PI / 4), 'rgba(255,255,255,.15)', 3); line(Y, fS, '#ffd23f', 8); }
        if (t > 5.6) for (let n = 1; n * lam / 2 < X1; n++) { const Xn = n * lam / 2; if (Xn < X0) continue; x.fillStyle = '#fff'; x.beginPath(); x.arc(Xn, Y, 10, 0, TAU); x.fill(); pill(x, Xn, Y + 150, '마디', seg(t, 5.8, 6.2), '#fff', '#7a2f8a', 22); if (Xn + lam / 4 < X1) pill(x, Xn + lam / 4, Y - 150, '배', seg(t, 6.4, 6.8), '#ffd23f', '#2a0f5e', 22); }
        if (t > 8.2) dimH(x, lam / 2, lam, 560, 'λ / 2', seg(t, 8.2, 8.9)); } }
  ];

  /* ---------- 7b 줄의 정상파 ---------- */
  const modes = (x, t, rows, shapeFn, label, tubeOpts) => { rows.forEach(([n, a], i) => { const Y = 160 + i * 150, X = 220, L = 640; if (t < a) return; const k = seg(t, a, a + .5);
    if (tubeOpts) tube(x, X, Y, L, 90, tubeOpts.r, tubeOpts.l); else { x.fillStyle = '#40238f'; rr(x, X - 14, Y - 50, 14, 100, 6); x.fill(); rr(x, X + L, Y - 50, 14, 100, 6); x.fill(); }
    x.save(); x.globalAlpha = cl(k * 2); stand(x, X, Y, L, tubeOpts ? 34 : 50, s => shapeFn(s, n), t * (2 + n), 1, '#ffd23f'); x.restore(); pill(x, 1060, Y, label(n), k, '#fff', '#7a2f8a', 26); }); };
  CUTS['7b'] = [
    { dur: 10, base: '#7a2f8a', lines: [[0, 'narr', '양끝이 고정된 줄. 양끝은 반드시 <b>마디</b>여야 한다.'], [2.4, 'narr', '그래서 줄 길이 l 안에 반 파장이 1개, 2개, 3개… 딱 맞게 들어간 파동만 남는다.'], [6, 'narr', '<b>λₙ = 2l/n,  fₙ = nv/2l</b>. 기본 진동의 정수배라서 <b>배진동</b>이라 부른다.']],
      draw(x, t) { gold(x, t); modes(x, t, [[1, .6], [2, 2.6], [3, 3.6]], (s, n) => Math.sin(Math.PI * n * s), n => n === 1 ? '기본  λ = 2l' : n === 2 ? '2배  λ = l' : '3배  λ = 2l/3'); formula(x, 'fₙ = n v / 2l', seg(t, 6, 6.5), 610, 34); } }
  ];

  /* ---------- 7c 관의 정상파 ---------- */
  CUTS['7c'] = [
    { dur: 9, base: '#7a2f8a', lines: [[0, 'narr', '관악기 속 공기도 정상파를 만든다. <b>열린 끝은 배</b>, <b>막힌 끝은 마디</b>.'], [2.4, 'narr', '양쪽이 열린 관은 줄과 똑같다. λₙ = 2l/n, fₙ = nv/2l (n = 1, 2, 3…).']],
      draw(x, t) { gold(x, t); modes(x, t, [[1, .6], [2, 1.8], [3, 2.8]], (s, n) => Math.cos(Math.PI * n * s), n => n + '배  λ = ' + (n === 1 ? '2l' : n === 2 ? 'l' : '2l/3'), { r: false, l: false }); } },
    { dur: 10, base: '#7a2f8a', lines: [[0, 'narr', '한쪽이 막힌 관은 한쪽이 배, 한쪽이 마디.'], [2.4, 'narr', '그래서 관 안엔 λ/4, 3λ/4, 5λ/4… <b>홀수 배</b>만 들어간다.'], [5.6, 'narr', '<b>λₙ = 4l/n,  fₙ = nv/4l (n = 1, 3, 5…)</b>. 짝수 배진동이 없다.']],
      draw(x, t) { gold(x, t); modes(x, t, [[1, .6], [3, 2.4], [5, 3.4]], (s, n) => Math.cos(Math.PI * n * s / 2), n => n + '배  λ = 4l/' + n, { r: true, l: false }); formula(x, 'fₙ = n v / 4l  (n 홀수)', seg(t, 5.6, 6.1), 610, 32); } }
  ];

  /* ---------- 7d 공명과 음속 측정 ---------- */
  CUTS['7d'] = [
    { dur: 11, base: '#7a2f8a', lines: [[0, 'narr', '유리관 위에서 640 Hz 소리를 내고, 물통을 내려 수면을 천천히 낮춘다.'], [2.6, 'narr', '관 속 공기 기둥이 정상파와 딱 맞는 위치 y₁, y₂, y₃에서 소리가 <b>크게</b> 울린다. 공명.'], [6, 'narr', '이웃한 공명 위치 사이는 <b>반 파장</b>. λ = 2(y₂ − y₁) ≈ 0.53 m.'], [8.4, 'narr', 'v = fλ = 640 × 0.53 ≈ <b>339 m/s</b>. 소리의 속력을 잰 것이다.']],
      draw(x, t) { gold(x, t); const X = 520, top = 110, L = 470, y1 = .13, y2 = .40, y3 = .67, depth = lerp(.05, .72, cl((t - 1) / 6.5)), wy = top + depth / .75 * L;
        x.fillStyle = 'rgba(255,255,255,.18)'; rr(x, X - 40, top, 80, L, 14); x.fill(); x.fillStyle = '#4cc2ff'; x.fillRect(X - 36, wy, 72, top + L - wy); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(X - 40, top); x.lineTo(X - 40, top + L); x.moveTo(X + 40, top); x.lineTo(X + 40, top + L); x.stroke();
        speaker(x, X, top - 40, .5, Math.PI / 2, t); const near = [y1, y2, y3].some(y => Math.abs(depth - y) < .03);
        if (near) { for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(255,210,63,' + (.8 - k * .18) + ')'; x.lineWidth = 6; x.beginPath(); x.arc(X, top - 40, 60 + k * 30 + (t * 60) % 30, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } }
        { const Lq = .135 / .75 * L, c = Math.cos(t * 8); for (const sg of [1, -1]) { x.strokeStyle = sg > 0 ? '#ffd23f' : 'rgba(255,210,63,.4)'; x.lineWidth = 4; x.beginPath(); for (let y = top; y <= wy; y += 4) { const xx = X + sg * 24 * Math.cos(Math.PI / 2 * (y - top) / Lq) * (sg > 0 ? c : 1); y === top ? x.moveTo(xx, y) : x.lineTo(xx, y); } x.stroke(); } }
        [y1, y2, y3].forEach((y, i) => { if (depth >= y - .01) { const Y = top + y / .75 * L; x.strokeStyle = '#ff5f6d'; x.lineWidth = 4; x.beginPath(); x.moveTo(X + 50, Y); x.lineTo(X + 110, Y); x.stroke(); pill(x, X + 170, Y, 'y' + '₁₂₃'[i] + ' ' + y.toFixed(2) + ' m', 1, '#fff', '#7a2f8a', 22); } });
        pill(x, 980, 300, 'λ = 2(y₂ − y₁)', seg(t, 6, 6.4), '#ffd23f', '#2a0f5e', 30); pill(x, 980, 400, 'v ≈ 339 m/s', seg(t, 8.4, 8.8), '#fff', '#7a2f8a', 32); } }
  ];
})();
