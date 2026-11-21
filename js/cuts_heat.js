'use strict';
/* 1~3장(열역학) 개념 컷신 */
window.CUTS = window.CUTS || {};
(() => {
  const C = CX, { seg, cl, E, plain, pill, text, arrow, dbl, dimH, dimV, cyl, flame, thermo, graph, G, path, fillPts, dot, along, curve, mols, card, bar, chr } = C;
  const TAU = Math.PI * 2;
  const warm = (x, t) => plain(x, '#b8325e', '#ff8a4c', t), violet = (x, t) => plain(x, '#2a1a7a', '#5a3fc0', t), ice = (x, t) => plain(x, '#1f3fb0', '#4fa8ff', t);
  const lerp = (a, b, k) => a + (b - a) * k;
  const formula = (x, s, k, y = 600, size = 38) => pill(x, 640, y, s, k, '#ffd23f', '#2a0f5e', size);

  /* ---------- 1a 압력과 일 ---------- */
  CUTS['1a'] = [
    { dur: 8.5, base: '#b8325e', lines: [[0, 'narr', '압력은 넓이마다 누르는 힘. <b>P = F / A</b>.'], [2.6, 'narr', '기체가 넓이 A인 피스톤을 압력 P로 밀면 힘은 <b>F = PA</b>.'], [5, 'narr', '피스톤이 Δs만큼 밀려나면 일 W = FΔs = PAΔs = <b>PΔV</b>.']],
      draw(x, t) { warm(x, t); const k = E.io(seg(t, 4.6, 6.6)), top = lerp(340, 230, k); cyl(x, 460, 560, 300, 420, top, t, { n: 16, speed: 1.6 });
        for (let i = 0; i < 4; i++) arrow(x, 360 + i * 66, top + 70, 360 + i * 66, top + 14, '#ffd23f', 8, seg(t, 2.6, 3.2));
        pill(x, 820, 250, 'F = P A', seg(t, 2.8, 3.3), '#fff'); if (t > 4.6) { x.fillStyle = 'rgba(255,210,63,.35)'; x.fillRect(322, top, 276, 340 - top); dimV(x, 640, top, 340, 'Δs', seg(t, 5, 5.8)); }
        formula(x, 'W = P ΔV', seg(t, 6.6, 7.1), 420); } },
    { dur: 8, base: '#2a1a7a', lines: [[0, 'narr', '압력-부피 그래프로 그리면'], [1.6, 'narr', '그래프 아래 <b>넓이</b>가 바로 기체가 한 일이다.'], [4.6, 'narr', '압력이 변해도 마찬가지. 곡선 아래 넓이 = 일.']],
      draw(x, t) { violet(x, t); const g1 = G(120, 520, 440, 380, 10, 10), g2 = G(700, 520, 440, 380, 10, 10);
        graph(x, 120, 520, 460, 400, '부피', '압력', seg(t, 0, .8)); graph(x, 700, 520, 460, 400, '부피', '압력', seg(t, 0, .8));
        const k1 = seg(t, 1.6, 3.4); if (k1 > 0) { fillPts(x, [[g1.X(2), g1.Y(0)], [g1.X(2), g1.Y(6)], [g1.X(lerp(2, 8, k1)), g1.Y(6)], [g1.X(lerp(2, 8, k1)), g1.Y(0)]], 'rgba(255,111,168,.5)'); } path(x, [[g1.X(1), g1.Y(6)], [g1.X(9), g1.Y(6)]], '#ff6fa8', 7, seg(t, .8, 1.4)); if (k1 > .9) text(x, 'W = PΔV', g1.X(5), g1.Y(3), 30);
        const f = v => [g2.X(v), g2.Y(18 / v)], k2 = seg(t, 4.6, 6.4); if (k2 > 0) fillPts(x, [[g2.X(2), g2.Y(0)], ...curve(f, 2, lerp(2, 8, k2)), [g2.X(lerp(2, 8, k2)), g2.Y(0)]], 'rgba(255,111,168,.5)'); path(x, curve(f, 1.9, 9.5), '#ff6fa8', 7, seg(t, 4, 4.6)); if (k2 > .9) text(x, 'W = 밑넓이', g2.X(4.6), g2.Y(1.8), 28); } }
  ];

  /* ---------- 1b 내부 에너지 ---------- */
  CUTS['1b'] = [
    { dur: 8, base: '#2a1a7a', lines: [[0, 'narr', '기체 분자는 쉬지 않고 날아다닌다. 이 운동 에너지를 다 더한 것이 <b>내부 에너지 U</b>.'], [3.4, 'narr', '이상 기체는 분자끼리 당기지 않아서 <b>운동 에너지만</b> 센다.'], [5.6, 'narr', '그래서 U는 <b>온도만</b>으로 정해진다. U = (3/2) nRT.']],
      draw(x, t) { violet(x, t); const k = seg(t, 5.6, 7.4); x.fillStyle = 'rgba(255,255,255,.12)'; rr(x, 120, 120, 560, 420, 30); x.fill(); mols(x, 130, 130, 540, 400, 22, t, 1 + k * 2, '#ffd23f', 11, 3);
        thermo(x, 820, 470, 300, .3 + k * .55, '#ff4f6d', 'T'); bar(x, 960, 300, 220, .3 + k * .55, 1, '#ffd23f', 'U'); formula(x, 'U = ³⁄₂ nRT', seg(t, 6, 6.5), 120, 34); } },
    { dur: 6.5, base: '#2a1a7a', lines: [[0, 'narr', '산소·질소 같은 <b>2원자 분자</b>는 날아가면서 빙글빙글 돌기도 한다.'], [3.4, 'narr', '회전 에너지가 더해져 U = (5/2) nRT. 같은 온도라도 더 크다.']],
      draw(x, t) { violet(x, t); for (let i = 0; i < 6; i++) { const cx = 200 + i * 170 + Math.sin(t + i) * 30, cy = 300 + Math.cos(t * 1.3 + i) * 80, a = t * 3 + i; x.save(); x.translate(cx, cy); x.rotate(a); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(-22, 0); x.lineTo(22, 0); x.stroke(); C.ball(x, -24, 0, 18, '#7fd8ff'); C.ball(x, 24, 0, 18, '#7fd8ff'); x.restore(); }
        pill(x, 640, 520, '단원자 ³⁄₂ nRT  ·  2원자 ⁵⁄₂ nRT', seg(t, 3.4, 3.9), '#ffd23f', '#2a0f5e', 30); } }
  ];

  /* ---------- 1c 제1법칙 ---------- */
  CUTS['1c'] = [
    { dur: 9, base: '#b8325e', lines: [[0, 'ignis', '실린더에 불을 붙인다. 들어간 열 Q는 어디로 갈까?'], [2.8, 'narr', '일부는 분자를 빠르게 해서 <b>내부 에너지(ΔU)</b>를 올리고'], [4.8, 'narr', '나머지는 피스톤을 밀어 올리는 <b>일(W)</b>이 된다.'], [6.8, 'narr', '그래서 <b>Q = ΔU + W</b>. 에너지는 사라지지 않는다.']],
      draw(x, t) { warm(x, t); const k = E.io(seg(t, 4.8, 6.6)); cyl(x, 380, 500, 260, 380, lerp(330, 220, k), t, { n: 14, speed: 1 + seg(t, 2.8, 4.6) * 1.8, weights: 1 }); flame(x, 380, 540, 1, t);
        bar(x, 780, 250, 380, 1, 1, '#ff8a3c', 'Q', seg(t, 1, 2)); bar(x, 780, 340, 380 * .6, .6, .6, '#ff4f6d', 'ΔU', seg(t, 2.8, 3.6)); x.save(); x.translate(380 * .6 + 0, 0); bar(x, 780, 430, 380 * .4, .4, .4, '#7fd8ff', 'W', seg(t, 4.8, 5.6)); x.restore();
        formula(x, 'Q = ΔU + W', seg(t, 6.8, 7.3), 560); chr(x, 'ignis', 140, 590, 2.2, t); } },
    { dur: 8, base: '#2a1a7a', lines: [[0, 'narr', '부호만 정확히 기억하면 된다.'], [1.4, 'narr', '열을 <b>받으면 Q > 0</b>, 잃으면 Q < 0.'], [3.6, 'narr', '기체가 <b>팽창하며 일하면 W > 0</b>, 눌려서 일을 받으면 W < 0.']],
      draw(x, t) { violet(x, t); const cs = [['열 받음  Q > 0', '#ff8a3c', 1.4], ['열 잃음  Q < 0', '#7fd8ff', 2.2], ['팽창  W > 0', '#ffd23f', 3.6], ['압축  W < 0', '#c9b6ff', 4.4]];
        cs.forEach(([s, c, a], i) => card(x, 340 + (i % 2) * 600, 220 + (i >> 1) * 230, 520, 190, s, seg(t, a, a + .5), c, x => { if (i < 2) arrow(x, i ? 30 : -60, -30, i ? -60 : 30, -30, '#2a0f5e', 12, 1); else { x.fillStyle = '#2a0f5e'; rr(x, -60, -60, 120, 70, 14); x.fill(); arrow(x, 0, i === 2 ? -40 : -110, 0, i === 2 ? -110 : -40, '#fff', 10, 1); } })); } },
    { dur: 8.5, base: '#b8325e', lines: [[0, 'narr', '예제: 단원자 기체 1 mol에 1 kcal(4200 J)의 열을 주었더니 1710 J의 일을 했다.'], [3.4, 'narr', 'ΔU = Q − W = 4200 − 1710 = <b>2490 J</b>.'], [5.6, 'narr', 'ΔU = (3/2)nRΔT 에서 2490 = 1.5 × 8.3 × ΔT → <b>ΔT = 200 K</b>.']],
      draw(x, t) { warm(x, t); bar(x, 320, 220, 800, 1, 1, '#ff8a3c', 'Q 4200', seg(t, .4, 1.4)); bar(x, 320, 320, 800 * .407, .407, .407, '#7fd8ff', 'W 1710', seg(t, 1.6, 2.4)); bar(x, 320, 420, 800 * .593, .593, .593, '#ff4f6d', 'ΔU 2490', seg(t, 3.4, 4.2)); formula(x, 'ΔT = 2490 ÷ (1.5 × 8.3) = 200 K', seg(t, 5.6, 6.1), 540, 32); } }
  ];

  /* ---------- 1d 등적·등압 ---------- */
  const pv = (x, t, k0, pts, lab, col = '#ff6fa8') => { const g = G(780, 520, 400, 380, 10, 10); graph(x, 780, 520, 420, 400, '부피', '압력', seg(t, 0, .6)); const P = pts.map(([v, p]) => [g.X(v), g.Y(p)]); path(x, P, col, 8, k0); const d = along(P, k0); dot(x, d[0], d[1]); if (lab) for (const [v, p, s] of lab) text(x, s, g.X(v), g.Y(p), 24); return g; };
  CUTS['1d'] = [
    { dur: 8, base: '#b8325e', lines: [[0, 'narr', '<b>등적 과정</b>: 피스톤을 핀으로 고정하고 데운다. 부피가 그대로라 일은 <b>0</b>.'], [3.6, 'narr', '받은 열은 전부 내부 에너지로. 온도와 압력이 오른다.'], [5.6, 'narr', '<b>Q = ΔU, W = 0</b>. 그래프에선 세로선.']],
      draw(x, t) { warm(x, t); const k = seg(t, 1.2, 5); cyl(x, 340, 540, 260, 400, 260, t, { n: 14, speed: 1 + k * 1.8, pin: true }); flame(x, 340, 580, 1, t); pv(x, t, k, [[5, 2], [5, 7]], [[5.8, 2, 'P₁'], [5.8, 7, 'P₂']]); formula(x, 'Q = ΔU,  W = 0', seg(t, 5.6, 6.1), 110, 32); } },
    { dur: 8, base: '#b8325e', lines: [[0, 'narr', '<b>등압 과정</b>: 추를 올려 압력을 고정하고 데운다.'], [2.6, 'narr', '온도가 오르고 피스톤도 올라간다. 열이 <b>내부 에너지와 일 둘 다</b>로 간다.'], [5.6, 'narr', '<b>Q = ΔU + PΔV</b>. 그래프에선 가로선.']],
      draw(x, t) { warm(x, t); const k = seg(t, 1.2, 5); cyl(x, 340, 540, 260, 420, lerp(330, 210, E.io(k)), t, { n: 14, speed: 1 + k * 1.6, weights: 2, rod: false }); flame(x, 340, 580, 1, t); pv(x, t, k, [[2.5, 5], [7.5, 5]]); formula(x, 'Q = ΔU + PΔV', seg(t, 5.6, 6.1), 110, 32); } }
  ];

  /* ---------- 1e 등온·단열 ---------- */
  CUTS['1e'] = [
    { dur: 8, base: '#2a1a7a', lines: [[0, 'narr', '<b>등온 과정</b>: 온도를 일정하게 유지하며 천천히 팽창.'], [2.6, 'narr', '온도가 그대로니 ΔU = 0. 받은 열은 <b>전부 일</b>이 된다. Q = W.'], [5.4, 'narr', '그래프는 PV = 일정인 곡선, 그 아래 넓이가 일.']],
      draw(x, t) { violet(x, t); const k = seg(t, 1, 5.4); cyl(x, 340, 540, 260, 420, lerp(340, 200, E.io(k)), t, { n: 14, speed: 1.4 }); flame(x, 340, 580, .8, t); thermo(x, 560, 470, 240, .55, '#ff4f6d', 'T 일정');
        const g = G(780, 520, 400, 380, 10, 10), f = v => [g.X(v), g.Y(16 / v)]; graph(x, 780, 520, 420, 400, '부피', '압력', 1); const kk = lerp(2, 8, k); fillPts(x, [[g.X(2), g.Y(0)], ...curve(f, 2, kk), [g.X(kk), g.Y(0)]], 'rgba(255,111,168,.45)'); path(x, curve(f, 2, kk), '#ff6fa8', 8); formula(x, 'Q = W,  ΔU = 0', seg(t, 2.8, 3.3), 110, 32); } },
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '<b>단열 과정</b>: 열이 드나들지 못하게 감싼다. Q = 0.'], [2.4, 'narr', '팽창하면 일을 한 만큼 내부 에너지가 줄어 <b>온도가 내려간다</b>.'], [5.4, 'narr', '거꾸로 압축하면 받은 일만큼 <b>온도가 오른다</b>. ΔU = −W.']],
      draw(x, t) { ice(x, t); const k1 = E.io(seg(t, 2.4, 4.6)), k2 = E.io(seg(t, 5.4, 7.6)), top = lerp(lerp(340, 200, k1), 360, k2), T = .55 - k1 * .3 + k2 * .5;
        cyl(x, 380, 540, 260, 420, top, t, { n: 14, speed: .5 + T * 1.8, insul: true }); thermo(x, 680, 470, 260, T, T > .55 ? '#ff4f6d' : '#4cc2ff', t > 5.4 ? '압축 → 온도 ↑' : '팽창 → 온도 ↓'); formula(x, 'ΔU = −W,  Q = 0', seg(t, 6.6, 7.1), 110, 32); } }
  ];

  /* ---------- 1f 생활 속 열역학 ---------- */
  const ICON = {
    cooker: x => { x.fillStyle = '#7a5cff'; rr(x, -60, -60, 120, 70, 18); x.fill(); x.fillStyle = '#40238f'; rr(x, -70, -72, 140, 18, 9); x.fill(); x.fillStyle = 'rgba(42,15,94,.3)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(-20 + i * 20, -90 - i * 6, 8, 0, 7); x.fill(); } },
    cloud: x => { x.fillStyle = '#7fd8ff'; x.beginPath(); x.arc(-30, -40, 30, 0, 7); x.arc(10, -55, 36, 0, 7); x.arc(45, -38, 26, 0, 7); x.fill(); arrow(x, 0, 30, 0, -10, '#ff8a3c', 8, 1); },
    soda: x => { x.fillStyle = '#22c4a0'; rr(x, -26, -70, 52, 100, 16); x.fill(); x.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(-30 + i * 20, -95 - (i % 2) * 10, 10, 0, 7); x.fill(); } },
    spray: x => { x.fillStyle = '#ff6fa8'; rr(x, -26, -70, 52, 100, 14); x.fill(); x.fillStyle = '#40238f'; rr(x, -12, -88, 24, 18, 4); x.fill(); x.fillStyle = 'rgba(127,216,255,.8)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(28 + i * 10, -80 - i * 4, 5, 0, 7); x.fill(); } },
    pump: x => { x.fillStyle = '#7a5cff'; rr(x, -16, -80, 32, 110, 12); x.fill(); x.fillStyle = '#40238f'; rr(x, -46, -96, 92, 18, 9); x.fill(); x.fillStyle = '#ff4f6d'; x.beginPath(); x.arc(40, 0, 14, 0, 7); x.fill(); },
    ball: x => { x.fillStyle = '#ff8a3c'; x.beginPath(); x.ellipse(0, -30, 56, 46, 0, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.arc(0, -30, 46, 1.9, 4.4); x.stroke(); }
  };
  CUTS['1f'] = [
    { dur: 10, base: '#2a1a7a', lines: [[0, 'narr', '열역학 과정은 생활 곳곳에 있다.'], [1.4, 'narr', '압력밥솥은 <b>등적</b>, 찌그러진 공을 데워 펴는 건 <b>등압 팽창</b>.'], [4.4, 'narr', '구름·탄산 음료 김·스프레이가 차가워지는 건 <b>단열 팽창</b>.'], [7.4, 'narr', '자전거 펌프를 빨리 누르면 뜨거워지는 건 <b>단열 압축</b>.']],
      draw(x, t) { violet(x, t); const L = [['압력밥솥 · 등적', 'cooker', 1.4, '#ffd6a0'], ['공 펴기 · 등압', 'ball', 2.2, '#ffd6a0'], ['구름 · 단열 팽창', 'cloud', 4.4, '#bfe9ff'], ['탄산 김 · 단열 팽창', 'soda', 5, '#bfe9ff'], ['스프레이 · 단열 팽창', 'spray', 5.6, '#bfe9ff'], ['펌프 · 단열 압축', 'pump', 7.4, '#ffc2c0']];
        L.forEach(([s, ic, a, bg], i) => card(x, 240 + (i % 3) * 400, 200 + (i / 3 | 0) * 250, 340, 220, s, seg(t, a, a + .5), bg, x => ICON[ic](x))); } }
  ];

  /* ---------- 1g 순환 과정 그래프 ---------- */
  CUTS['1g'] = [
    { dur: 10, base: '#2a1a7a', lines: [[0, 'narr', '기체가 A → B → C → D → A로 한 바퀴 돈다.'], [2, 'narr', '절대 온도는 PV에 비례. A가 T면 B는 2T, C와 D는 <b>4T</b>. 그래서 C→D는 등온.'], [5.2, 'narr', '부피가 늘 때(B→C, C→D) 일을 하고, 줄 때(D→A) 일을 받는다.'], [7.6, 'narr', '한 바퀴 동안 한 <b>알짜 일 = 둘러싸인 넓이</b>. 그리고 처음으로 돌아왔으니 ΔU = 0.']],
      draw(x, t) { violet(x, t); const g = G(160, 540, 560, 420, 9, 5), A = [2, 2], B = [2, 4], Cc = [4, 4], D = [8, 2];
        graph(x, 160, 540, 600, 450, 'V (m³)', 'P', seg(t, 0, .6)); const iso = curve(v => [g.X(v), g.Y(16 / v)], 4, 8), P = [[g.X(2), g.Y(2)], [g.X(2), g.Y(4)], [g.X(4), g.Y(4)], ...iso, [g.X(2), g.Y(2)]];
        if (t > 7.6) fillPts(x, P, 'rgba(255,111,168,' + .45 * seg(t, 7.6, 8.4) + ')'); path(x, P, '#ff6fa8', 7, 1); const d = along(P, (t % 4.5) / 4.5); dot(x, d[0], d[1]);
        [['A', A], ['B', B], ['C', Cc], ['D', D]].forEach(([n, p]) => text(x, n, g.X(p[0]) - 26, g.Y(p[1]) - 24, 28, '#ffd23f'));
        const temps = [['A : T', 2], ['B : 2T', 2.6], ['C : 4T', 3.2], ['D : 4T', 3.8]]; temps.forEach(([s, a], i) => pill(x, 960, 160 + i * 80, s, seg(t, a, a + .4), i > 1 ? '#ff8a3c' : '#fff', i > 1 ? '#fff' : '#2a0f5e', 28));
        pill(x, 960, 500, 'W = 둘러싼 넓이', seg(t, 7.8, 8.3), '#ffd23f', '#2a0f5e', 30); } }
  ];

  /* ---------- 2a 열기관과 열효율 ---------- */
  const engine = (x, t, Q1, W, Q2, k = 1) => { x.fillStyle = '#ff5f6d'; rr(x, 340, 90, 600, 80, 24); x.fill(); text(x, '고열원 T₁', 640, 130, 30); x.fillStyle = '#4c8cff'; rr(x, 340, 450, 600, 80, 24); x.fill(); text(x, '저열원 T₂', 640, 490, 30);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(640, 310, 90, 0, 7); x.fill(); x.save(); x.translate(640, 310); x.rotate(t * 2); x.fillStyle = '#7a5cff'; for (let i = 0; i < 6; i++) { x.rotate(TAU / 6); rr(x, -10, -70, 20, 46, 8); x.fill(); } x.restore(); text(x, '열기관', 640, 310, 24, '#2a0f5e');
    const fl = (x0, y0, x1, y1, w, col, n) => { arrow(x, x0, y0, x1, y1, col, w, k); for (let i = 0; i < n; i++) { const u = (t * .7 + i / n) % 1; C.ball(x, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, w * .5, '#fff'); } };
    fl(640, 172, 640, 212, Q1, '#ff8a3c', 3); fl(732, 310, 1010, 310, W, '#ffd23f', 4); fl(640, 402, 640, 446, Q2, '#7fd8ff', 2); };
  CUTS['2a'] = [
    { dur: 9, base: '#2a1a7a', lines: [[0, 'ignis', '열기관은 뜨거운 곳에서 열을 받아 <b>일</b>로 바꾸는 장치야.'], [3, 'narr', '고열원에서 Q₁을 받아 W만큼 일하고, 남은 Q₂는 저열원으로 버린다.'], [6, 'narr', '열효율 e = W / Q₁ = 1 − Q₂/Q₁. 버리는 열이 꼭 있으니 <b>e는 1보다 작다</b>.']],
      draw(x, t) { violet(x, t); engine(x, t, 26, 16, 14, seg(t, 3, 4)); pill(x, 1080, 260, 'W', seg(t, 3.4, 3.8), '#ffd23f'); pill(x, 720, 192, 'Q₁', seg(t, 3, 3.4), '#ff8a3c', '#fff'); pill(x, 720, 424, 'Q₂', seg(t, 3.8, 4.2), '#7fd8ff'); formula(x, 'e = W / Q₁ = 1 − Q₂/Q₁', seg(t, 6, 6.5), 600, 32); chr(x, 'ignis', 160, 590, 2.2, t); } },
    { dur: 7, base: '#2a1a7a', lines: [[0, 'narr', '예제: 한 번 돌 때 1000 J을 받고 600 J을 버린다.'], [2.4, 'narr', '한 일 W = 1000 − 600 = <b>400 J</b>.'], [4.4, 'narr', '열효율 e = 400 / 1000 = <b>0.4</b>.']],
      draw(x, t) { violet(x, t); bar(x, 340, 240, 760, 1, 1, '#ff8a3c', 'Q₁ 1000', seg(t, .4, 1.2)); bar(x, 340, 330, 760 * .6, .6, .6, '#7fd8ff', 'Q₂ 600', seg(t, 1.2, 2)); bar(x, 340, 420, 760 * .4, .4, .4, '#ffd23f', 'W 400', seg(t, 2.4, 3.2)); formula(x, 'e = 400 / 1000 = 0.4', seg(t, 4.4, 4.9), 540, 36); } }
  ];

  /* ---------- 2b 외연·내연·4행정 ---------- */
  CUTS['2b'] = [
    { dur: 7.5, base: '#b8325e', lines: [[0, 'narr', '<b>외연 기관</b>: 바깥에서 물을 끓여 만든 수증기로 터빈이나 피스톤을 돌린다.'], [3.6, 'narr', '증기 터빈, 증기 기관, 스털링 엔진이 여기에 속한다.']],
      draw(x, t) { warm(x, t); x.fillStyle = '#40238f'; rr(x, 140, 200, 280, 320, 30); x.fill(); x.fillStyle = '#4cc2ff'; rr(x, 160, 380, 240, 120, 20); x.fill(); C.mols(x, 160, 220, 240, 150, 10, t, 2.2, '#fff', 10, 4, false); flame(x, 280, 560, 1.1, t);
        x.strokeStyle = '#c9b6ff'; x.lineWidth = 26; x.beginPath(); x.moveTo(420, 260); x.lineTo(640, 260); x.lineTo(640, 330); x.stroke(); for (let i = 0; i < 5; i++) { const u = (t * .8 + i / 5) % 1; x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(420 + u * 220, 260, 8, 0, 7); x.fill(); }
        x.save(); x.translate(820, 330); x.rotate(t * 4); x.fillStyle = '#ffd23f'; for (let i = 0; i < 8; i++) { x.rotate(TAU / 8); rr(x, -12, -120, 24, 90, 10); x.fill(); } x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, 30, 0, 7); x.fill(); x.restore(); pill(x, 820, 500, '터빈', 1, '#fff'); } },
    { dur: 10, base: '#2a1a7a', lines: [[0, 'narr', '<b>내연 기관</b>: 실린더 안에서 연료를 폭발시켜 피스톤을 직접 민다. 가솔린·디젤·제트 엔진.'], [3.6, 'narr', '4행정 엔진은 피스톤이 네 번 움직일 때 한 번 폭발한다.'], [5.6, 'narr', '<b>흡기 → 압축 → 폭발 → 배기</b>. 이걸 계속 반복한다.']],
      draw(x, t) { violet(x, t); const T = 4, u = ((t * 1.2) % T) / T, phase = Math.floor(u * 4), ang = u * 4 * Math.PI, cy = 420, R = 70, py = cy - 150 - Math.cos(ang) * R;
        const cols = ['#ff9fc4', '#ffd6a0', '#ffe27a', '#b6f27a'], names = ['흡기', '압축', '폭발', '배기'];
        x.fillStyle = '#40238f'; rr(x, 480, 90, 320, 260, 30); x.fill(); x.fillStyle = cols[phase]; rr(x, 510, 110, 260, py - 120, 16); x.fill(); if (phase === 2) flame(x, 640, 150, .5, t);
        x.fillStyle = '#c9b6ff'; rr(x, 510, py - 10, 260, 50, 14); x.fill(); const crx = 640 + Math.sin(ang) * R, cry = cy - Math.cos(ang) * R; x.strokeStyle = '#fff'; x.lineWidth = 16; x.beginPath(); x.moveTo(640, py + 20); x.lineTo(crx, cry); x.stroke();
        x.fillStyle = '#5a3fc0'; x.beginPath(); x.arc(640, cy, 100, 0, 7); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(crx, cry, 18, 0, 7); x.fill();
        names.forEach((n, i) => pill(x, 200 + i * 0 + (i < 2 ? 0 : 880), 180 + (i % 2) * 120, n, seg(t, 3.6, 4), i === phase ? cols[i] : 'rgba(255,255,255,.3)', '#2a0f5e', 30)); } }
  ];

  /* ---------- 2c 카르노 ---------- */
  CUTS['2c'] = [
    { dur: 10, base: '#2a1a7a', lines: [[0, 'narr', '열효율이 가장 높은 이상적인 열기관, <b>카르노 기관</b>.'], [2.4, 'narr', '등온 팽창(Q₁ 흡수) → 단열 팽창 → 등온 압축(Q₂ 방출) → 단열 압축.'], [6.2, 'narr', '효율은 온도만으로 정해진다. <b>e = 1 − T₂/T₁</b>.']],
      draw(x, t) { violet(x, t); const g = G(140, 540, 560, 440, 10, 10), T1 = 30, T2 = 15, ad1 = v => 30 * Math.pow(2 / v, 5 / 3) * 1, a = 2, b = 4.2;
        graph(x, 140, 540, 600, 470, '부피', '압력', 1);
        const iso1 = curve(v => [g.X(v), g.Y(T1 / v)], a, b), vB = b, vC = vB * Math.pow(T1 / T2, 1.5), adB = curve(v => [g.X(v), g.Y(T1 / vB * Math.pow(vB / v, 5 / 3))], vB, vC), vA = a, vD = vA * Math.pow(T1 / T2, 1.5), iso2 = curve(v => [g.X(v), g.Y(T2 / v)], vC, vD), adA = curve(v => [g.X(v), g.Y(T1 / vA * Math.pow(vA / v, 5 / 3))], vD, vA);
        path(x, curve(v => [g.X(v), g.Y(T1 / v)], 1.5, 9.5), 'rgba(255,255,255,.3)', 3, 1, [6, 8]); path(x, curve(v => [g.X(v), g.Y(T2 / v)], 1.5, 9.5), 'rgba(255,255,255,.3)', 3, 1, [6, 8]);
        const k = seg(t, 2.4, 6); path(x, iso1, '#ff5f6d', 8, cl(k * 4)); path(x, adB, '#fff', 6, cl(k * 4 - 1)); path(x, iso2, '#4cc2ff', 8, cl(k * 4 - 2)); path(x, adA, '#fff', 6, cl(k * 4 - 3));
        text(x, 'T₁', g.X(9.3), g.Y(T1 / 9.3) - 20, 24); text(x, 'T₂', g.X(9.3), g.Y(T2 / 9.3) - 20, 24);
        formula(x, 'e = 1 − T₂ / T₁', seg(t, 6.2, 6.7), 300, 40); pill(x, 1000, 200, 'Q₁ 흡수 (등온)', seg(t, 2.6, 3), '#ff5f6d', '#fff', 26); pill(x, 1000, 400, 'Q₂ 방출 (등온)', seg(t, 4.2, 4.6), '#4cc2ff', '#fff', 26); } },
    { dur: 8, base: '#2a1a7a', lines: [[0, 'narr', '예제: T₁ = 400 K, T₂ = 300 K. e = 1 − 300/400 = <b>0.25</b>.'], [3, 'narr', '한 번에 1200 J 일을 하려면 Q₁ = 1200 ÷ 0.25 = <b>4800 J</b>.'], [5.4, 'narr', 'e = 1이 되려면 T₂ = 0 K이어야 한다. 그런 저열원은 없다. <b>효율 100% 기관은 없다</b>.']],
      draw(x, t) { violet(x, t); thermo(x, 300, 420, 260, .8, '#ff5f6d', '400 K'); thermo(x, 480, 420, 260, .6, '#4cc2ff', '300 K'); pill(x, 860, 200, 'e = 0.25', seg(t, .8, 1.2), '#ffd23f', '#2a0f5e', 40); pill(x, 860, 320, 'Q₁ = 4800 J', seg(t, 3, 3.4), '#fff', '#2a0f5e', 34); pill(x, 860, 440, 'e = 1 ✕', seg(t, 5.4, 5.8), '#ff5f6d', '#fff', 34); } }
  ];

  /* ---------- 2d 스털링·가솔린·디젤 ---------- */
  CUTS['2d'] = [
    { dur: 10, base: '#2a1a7a', lines: [[0, 'narr', '실제 엔진들의 순환 과정을 PV 그래프로 비교해 보자.'], [1.6, 'narr', '<b>스털링</b>(외연): 등적 가열 → 등온 팽창 → 등적 냉각 → 등온 압축. 온도 차가 작아도 돈다.'], [4.6, 'narr', '<b>가솔린</b>: 단열 압축 → 점화(등적) → 단열 팽창 → 등적 방출. 효율 약 0.35.'], [7.4, 'narr', '<b>디젤</b>: 공기만 세게 압축해 자연 발화, 등압으로 팽창. 효율 약 0.4.']],
      draw(x, t) { violet(x, t); const panes = [[220, '스털링', 1.6], [640, '가솔린', 4.6], [1060, '디젤', 7.4]];
        panes.forEach(([cx, nm, a], i) => { const k = seg(t, a, a + 2), g = G(cx - 170, 480, 320, 300, 10, 10); graph(x, cx - 170, 480, 340, 320, 'V', 'P', seg(t, a - .4, a)); let P;
          if (i === 0) P = [...curve(v => [g.X(v), g.Y(12 / v)], 8, 2), [g.X(2), g.Y(9)], ...curve(v => [g.X(v), g.Y(18 / v)], 2, 8), [g.X(8), g.Y(12 / 8)]];
          else if (i === 1) P = [...curve(v => [g.X(v), g.Y(1.2 * Math.pow(8 / v, 1.4))], 8, 2), ...curve(v => [g.X(v), g.Y(9 * Math.pow(2 / v, 1.4))], 2, 8), [g.X(8), g.Y(1.2)]];
          else P = [...curve(v => [g.X(v), g.Y(1 * Math.pow(8 / v, 1.4))], 8, 1.4), [g.X(3), g.Y(1 * Math.pow(8 / 1.4, 1.4))], ...curve(v => [g.X(v), g.Y(11.5 * Math.pow(3 / v, 1.4))], 3, 8), [g.X(8), g.Y(1)]];
          if (k > .95) fillPts(x, P, 'rgba(255,111,168,.35)'); path(x, P, '#ff6fa8', 6, k); pill(x, cx, 560, nm, seg(t, a, a + .4), '#ffd23f'); }); } }
  ];

  /* ---------- 2e 역사와 환경 ---------- */
  CUTS['2e'] = [
    { dur: 9, base: '#b8325e', lines: [[0, 'narr', '1712년 뉴커먼의 증기 기관. 와트가 응축기를 따로 떼어 효율을 크게 올렸다.'], [3.4, 'narr', '19세기 후반 가솔린·디젤 내연 기관, 그리고 제트·로켓 엔진으로.'], [6, 'narr', '산업 혁명, 공장, 기차와 배와 비행기. 인류의 활동 범위가 바뀌었다.']],
      draw(x, t) { warm(x, t); arrow(x, 100, 360, 1180, 360, '#fff', 10, seg(t, 0, 1.4)); const ev = [['1712 뉴커먼', .4], ['와트', 1.6], ['내연 기관', 3.4], ['제트·로켓', 4.4]];
        ev.forEach(([s, a], i) => { const X = 220 + i * 280; C.ball(x, X, 360, 22 * E.back(seg(t, a, a + .4)), '#ffd23f'); pill(x, X, 280 - (i % 2) * 0, s, seg(t, a, a + .4), '#fff', '#2a0f5e', 26); });
        ['산업 혁명', '공장 대량 생산', '기차 · 배', '비행기 · 로켓'].forEach((s, i) => pill(x, 260 + i * 255, 480, s, seg(t, 6 + i * .3, 6.5 + i * .3), '#ffd23f', '#2a0f5e', 26)); } },
    { dur: 9, base: '#2a1a7a', lines: [[0, 'narr', '대신 화석 연료를 엄청나게 태웠다. 온실가스가 늘고 지구 기온이 100년 동안 약 <b>1 °C</b> 올랐다.'], [4, 'narr', '그래서 효율을 높이는 게 중요하다. 폐열 회수, 터보·직분사 엔진, 하이브리드, 단열재.'], [6.6, 'narr', '그리고 파리 협정, 탄소 중립 같은 전 지구적 약속.']],
      draw(x, t) { violet(x, t); const g = G(120, 460, 520, 300, 100, 1.4); graph(x, 120, 460, 540, 320, '연도', '기온 편차', 1); const pts = []; for (let i = 0; i <= 100; i += 2) pts.push([g.X(i), g.Y(.2 + i / 100 * .9 + Math.sin(i * 1.7) * .08)]); path(x, pts, '#ff5f6d', 5, seg(t, .4, 3.4));
        ['폐열 회수', '터보 엔진', '하이브리드', '단열재', '탄소 중립'].forEach((s, i) => pill(x, 960, 140 + i * 90, s, seg(t, 4 + i * .4, 4.4 + i * .4), i === 4 ? '#22c4a0' : '#fff', i === 4 ? '#fff' : '#2a0f5e', 28)); } }
  ];

  /* ---------- 3a 가역·비가역 ---------- */
  const pend = (x, cx, cy, L, ang, n = 1) => { const bx = cx + Math.sin(ang) * L, by = cy + Math.cos(ang) * L; x.strokeStyle = '#fff'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, cy); x.lineTo(bx, by); x.stroke(); x.fillStyle = '#40238f'; rr(x, cx - 40, cy - 14, 80, 14, 7); x.fill(); C.ball(x, bx, by, 26, '#ff8a3c'); };
  CUTS['3a'] = [
    { dur: 9, base: '#1f3fb0', lines: [[0, 'clausia', '공기 저항이 없으면 진자는 영원히 같은 높이로 흔들려. 되감아도 똑같아 보이지.'], [3.4, 'narr', '그런 과정을 <b>가역 과정</b>이라 한다.'], [5.2, 'narr', '공기 저항이 있으면 점점 작아지다 멈춘다. 저절로 다시 커지지는 않는다. <b>비가역</b>.']],
      draw(x, t) { ice(x, t); pend(x, 360, 120, 300, Math.sin(t * 2.2) * .7); pend(x, 920, 120, 300, Math.sin(t * 2.2) * .7 * Math.exp(-Math.max(0, t - 4.6) * .5)); pill(x, 360, 560, '공기 저항 없음 · 가역', seg(t, 3.4, 3.8), '#fff'); pill(x, 920, 560, '공기 저항 있음 · 비가역', seg(t, 5.2, 5.6), '#ffd23f'); } },
    { dur: 8, base: '#1f3fb0', lines: [[0, 'narr', '튀는 공은 점점 낮아진다. 역학적 에너지가 마찰과 공기 저항으로 열이 되어 흩어지기 때문.'], [4, 'narr', '흩어진 열이 다시 모여 공을 원래 높이로 올리는 일은 일어나지 않는다. <b>자연의 대부분은 비가역</b>이다.']],
      draw(x, t) { ice(x, t); x.fillStyle = '#2a1a7a'; rr(x, 80, 520, 1120, 30, 15); x.fill(); const u = t % 6, hs = [360, 250, 170, 110, 70], d = 1.2; let i = Math.min(4, Math.floor(u / d)); const k = (u - i * d) / d, h = hs[i] * 4 * k * (1 - k);
        for (let j = 0; j <= i; j++) { x.strokeStyle = 'rgba(255,255,255,.3)'; x.setLineDash([6, 10]); x.lineWidth = 3; x.beginPath(); for (let s = 0; s <= 20; s++) { const kk = s / 20; x[s ? 'lineTo' : 'moveTo'](160 + j * 200 + kk * 200, 500 - hs[j] * 4 * kk * (1 - kk)); } x.stroke(); x.setLineDash([]); }
        C.ball(x, 160 + i * 200 + k * 200, 500 - h, 24, '#ff8a3c'); for (let j = 0; j < i * 3; j++) { x.fillStyle = 'rgba(255,140,90,.5)'; x.beginPath(); x.arc(160 + (j / 3 | 0) * 200 + 200 + Math.sin(t * 3 + j) * 20, 510 - (t * 20 + j * 15) % 60, 5, 0, 7); x.fill(); } } }
  ];

  /* ---------- 3b 확률 ---------- */
  CUTS['3b'] = [
    { dur: 8, base: '#1f3fb0', lines: [[0, 'narr', 'A 방에는 기체, B 방은 진공. 사이의 구멍을 연다.'], [2.4, 'narr', '분자들이 B로 퍼져 결국 양쪽에 고르게 나뉜다.'], [5, 'narr', '다시 저절로 A에 모두 모이는 일은 일어나지 않는다. 왜일까?']],
      draw(x, t) { ice(x, t); const k = E.io(seg(t, 2, 6)); x.fillStyle = 'rgba(255,255,255,.14)'; rr(x, 160, 140, 440, 360, 24); x.fill(); rr(x, 680, 140, 440, 360, 24); x.fill(); x.fillStyle = '#40238f'; rr(x, 600, 140, 80, 360, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.14)'; rr(x, 600, 290, 80, 60 * cl(seg(t, 1, 1.6)), 0); x.fill();
        for (let i = 0; i < 40; i++) { const side = hash(i + 7) < .5 * k * 2 && i % 2 ? 1 : 0, X0 = side ? 680 : 160; const px = X0 + 14 + C.tri(hash(i) * 2 + t * (.2 + hash(i + 3) * .3)) * 412, py = 154 + C.tri(hash(i + 9) * 2 + t * (.2 + hash(i + 5) * .3)) * 332; C.ball(x, px, py, 10, '#ffd23f'); }
        text(x, 'A', 380, 110, 34); text(x, 'B', 900, 110, 34); } },
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '분자 하나가 A에 있을 확률은 1/2. 두 개가 모두 A에 있을 확률은 1/4.'], [3.2, 'narr', 'N개가 모두 A에 있을 확률은 (1/2)ᴺ. 100개면 약 <b>10⁻³⁰</b>. 사실상 0이다.'], [6, 'narr', '자연은 <b>확률이 큰 쪽</b>, 경우의 수가 많은 쪽으로 간다.']],
      draw(x, t) { ice(x, t); const rows = [['N = 1', '1/2', .6], ['N = 2', '1/4', 1.4], ['N = 10', '1/1024', 2.4], ['N = 100', '≈ 10⁻³⁰ ≈ 0', 3.4]];
        rows.forEach(([a, b, s], i) => { pill(x, 380, 150 + i * 100, a, seg(t, s, s + .4), '#fff', '#1f3fb0', 30); pill(x, 820, 150 + i * 100, b, seg(t, s + .2, s + .6), i === 3 ? '#ffd23f' : '#bfe9ff', '#2a0f5e', 30); }); pill(x, 640, 570, '확률이 큰 쪽으로 진행 → 비가역', seg(t, 6, 6.5), '#ffd23f', '#2a0f5e', 30); } }
  ];

  /* ---------- 3c ΔS = Q/T ---------- */
  CUTS['3c'] = [
    { dur: 8, base: '#1f3fb0', lines: [[0, 'clausia', '무질서한 정도를 숫자로 나타낸 게 <b>엔트로피 S</b>야.'], [2.6, 'narr', '온도 T인 계가 열 Q를 받으면 엔트로피는 <b>ΔS = Q / T</b>만큼 늘어난다.'], [5, 'narr', '예: 27 °C(300 K)에서 땀 0.3 kg 증발. ΔS = 0.3 × 2.42×10⁶ ÷ 300 = <b>2.42×10³ J/K</b>.']],
      draw(x, t) { ice(x, t); chr(x, 'clausia', 200, 560, 2.6, t); const k = seg(t, 2.6, 4.6); x.fillStyle = 'rgba(255,255,255,.14)'; rr(x, 520, 150, 460, 300, 24); x.fill(); C.mols(x, 530, 160, 440, 280, 14 + Math.round(k * 10), t, 1 + k, '#ffd23f', 10, 2);
        arrow(x, 430, 300, 515, 300, '#ff8a3c', 14, k); pill(x, 440, 240, 'Q', seg(t, 2.8, 3.2), '#ff8a3c', '#fff'); formula(x, 'ΔS = Q / T', seg(t, 3.2, 3.7), 520, 40); } },
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '400 K인 A에서 300 K인 B로 1200 J의 열이 이동한다.'], [2.4, 'narr', 'A는 열을 잃어 ΔS_A = −1200/400 = <b>−3 J/K</b>. B는 얻어 ΔS_B = +1200/300 = <b>+4 J/K</b>.'], [5.6, 'narr', '전체 ΔS = −3 + 4 = <b>+1 J/K</b>. 낮은 온도에서 받는 쪽이 더 크게 늘어서, 합은 언제나 증가.']],
      draw(x, t) { ice(x, t); x.fillStyle = '#ff5f6d'; rr(x, 200, 160, 360, 260, 24); x.fill(); x.fillStyle = '#4c8cff'; rr(x, 720, 160, 360, 260, 24); x.fill(); text(x, 'A 400 K', 380, 200, 30); text(x, 'B 300 K', 900, 200, 30); arrow(x, 520, 300, 760, 300, '#ffd23f', 18, seg(t, .6, 1.6)); pill(x, 640, 250, '1200 J', seg(t, 1, 1.4), '#ffd23f');
        pill(x, 380, 350, '−3 J/K', seg(t, 2.6, 3), '#fff'); pill(x, 900, 350, '+4 J/K', seg(t, 3.4, 3.8), '#fff'); formula(x, 'ΔS 전체 = +1 J/K > 0', seg(t, 5.6, 6.1), 520, 36); } }
  ];

  /* ---------- 3d 열의 이동과 제2법칙 ---------- */
  CUTS['3d'] = [
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '뜨거운 물체와 차가운 물체를 붙인다. 열은 <b>고온 → 저온</b>으로만 흐른다.'], [3.2, 'narr', '에너지가 고르게 퍼질수록 분자들이 배열될 수 있는 경우의 수가 커진다.'], [5.6, 'narr', '결국 온도가 같아지는 <b>열평형</b>. 엔트로피가 최대인 상태.']],
      draw(x, t) { ice(x, t); const k = E.io(seg(t, 1, 6)); x.fillStyle = Art.mix('#ff5f6d', '#3fc08a', k); rr(x, 220, 160, 420, 300, 24); x.fill(); x.fillStyle = Art.mix('#4c8cff', '#3fc08a', k); rr(x, 640, 160, 420, 300, 24); x.fill();
        C.mols(x, 230, 170, 400, 280, 12, t, 2.4 - k * 1.2, '#fff', 9, 5, false); C.mols(x, 650, 170, 400, 280, 12, t, .6 + k * .6, '#fff', 9, 8, false);
        if (k < .95) for (let i = 0; i < 3; i++) arrow(x, 560, 230 + i * 70, 720, 230 + i * 70, 'rgba(255,210,63,' + (1 - k) + ')', 12, 1); if (t > 5.6) pill(x, 640, 520, '열평형 · ΔS > 0', seg(t, 5.8, 6.2), '#ffd23f'); } },
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '열역학 제2법칙은 여러 말로 표현된다.'], [1.4, 'narr', '<b>클라우지우스</b>: 열은 도움 없이 저온에서 고온으로 흐르지 않는다.'], [4, 'narr', '<b>켈빈·플랑크</b>: 흡수한 열을 100% 일로 바꿀 수 없다. 열효율 < 1.'], [6.4, 'narr', '<b>고립계</b>의 엔트로피는 항상 증가한다. ΔS > 0.']],
      draw(x, t) { ice(x, t); [['클라우지우스', '저온 → 고온 ✕', 1.4], ['켈빈 · 플랑크', '효율 100% ✕', 4], ['고립계', 'ΔS > 0', 6.4]].forEach(([a, b, s], i) => card(x, 240 + i * 400, 330, 340, 300, a, seg(t, s, s + .5), '#fff', x => text(x, b, 0, -40, 32, '#1f3fb0'))); } }
  ];

  /* ---------- 3e 자유 팽창 ---------- */
  CUTS['3e'] = [
    { dur: 9, base: '#1f3fb0', lines: [[0, 'narr', '단열된 두 용기. 한쪽엔 기체, 한쪽은 진공. 마개를 연다.'], [2.6, 'narr', '막는 압력이 없으니 기체가 한 일 <b>W = 0</b>, 단열이라 <b>Q = 0</b>.'], [5, 'narr', '그래서 ΔU = 0, 이상 기체의 <b>온도는 그대로</b>. 그래도 다시 한쪽으로 모이진 않는다.']],
      draw(x, t) { ice(x, t); const k = E.io(seg(t, 1.2, 5)); x.fillStyle = '#ffd6a0'; rr(x, 140, 140, 1000, 360, 40); x.fill(); x.fillStyle = 'rgba(31,63,176,.85)'; rr(x, 180, 180, 400, 280, 24); x.fill(); rr(x, 700, 180, 400, 280, 24); x.fill(); x.fillStyle = '#c9b6ff'; rr(x, 580, 290, 120, 60, 10); x.fill(); x.fillStyle = '#ff5f6d'; rr(x, 625, 270 - k * 60, 30, 40, 8); x.fill();
        for (let i = 0; i < 30; i++) { const side = i % 2 && hash(i) < k + .1 ? 1 : 0, X0 = side ? 700 : 180; C.ball(x, X0 + 14 + C.tri(hash(i) * 2 + t * (.2 + hash(i + 3) * .3)) * 372, 194 + C.tri(hash(i + 9) * 2 + t * (.2 + hash(i + 5) * .3)) * 252, 9, '#ffd23f'); }
        ['W = 0', 'Q = 0', 'ΔU = 0', 'ΔT = 0'].forEach((s, i) => pill(x, 340 + i * 200, 570, s, seg(t, 2.6 + i * .5, 3 + i * .5), '#fff', '#1f3fb0', 28)); } }
  ];
})();
