'use strict';
/* 광합성 단원 실험실 */
(() => {
  const { def } = window.LAB;
  const G = (w, m, s) => Math.exp(-(((w - m) / s) ** 2));
  const ABS = { a: w => Math.min(1, .95 * G(w, 430, 20) + .8 * G(w, 662, 15) + .06), b: w => Math.min(1, .95 * G(w, 455, 20) + .62 * G(w, 642, 15) + .05), car: w => Math.min(1, .8 * G(w, 450, 22) + .75 * G(w, 482, 18) + .02) };
  const ACT = w => Math.min(1, .55 * ABS.a(w) + .3 * ABS.b(w) + .25 * ABS.car(w) + .05);
  function wlCol(w) { let r = 0, g = 0, b = 0; if (w < 440) { r = (440 - w) / 60; b = 1; } else if (w < 490) { g = (w - 440) / 50; b = 1; } else if (w < 510) { g = 1; b = (510 - w) / 20; } else if (w < 580) { r = (w - 510) / 70; g = 1; } else if (w < 645) { r = 1; g = (645 - w) / 65; } else r = 1;
    const f = w < 420 ? .3 + .7 * (w - 380) / 40 : w > 680 ? .3 + .7 * (750 - w) / 70 : 1; const h = v => Math.round(255 * Math.pow(Math.max(0, v * f), .8)).toString(16).padStart(2, '0'); return '#' + h(r) + h(g) + h(b); }

  /* ═════ 빛과 색소: 흡수 스펙트럼 · 엥겔만 ═════ */
  def('spec', { ch: '명반응', t: '어떤 빛을 먹을까?', sub: '흡수 스펙트럼 · 작용 스펙트럼 · 엥겔만 실험' }, c => {
    const X0 = 80, X1 = 560, wx = w => X0 + (w - 400) / 300 * (X1 - X0), xw = x => c.clamp(400 + (x - X0) / (X1 - X0) * 300, 400, 700);
    let wl = 550, pig = 'a', steady = 0, dragging = false, eng = 0, engOn = false;
    const pts = { a: [], b: [], car: [] }, COL = { a: '#3ad07a', b: '#a8d84a', car: '#ffa83a' }, NM = { a: '엽록소 a', b: '엽록소 b', car: '카로티노이드' };
    const bac = Array.from({ length: 70 }, () => ({ x: c.rnd(X0, X1), y: c.rnd(430, 520), tx: 0 }));
    c.goals([
      { id: 'abs', t: '<b>엽록소 a</b>에 여러 색의 빛을 비춰 흡수율 재기 — 보라·파랑, 초록, 빨강 모두', hint: '위 무지개 띠를 끌어 빛의 색을 바꾸고 잠깐 멈춰요' },
      { id: 'pig', t: '<b>엽록소 b · 카로티노이드</b>도 3곳 이상씩 재 보기', hint: '패널에서 색소를 바꿔요' },
      { id: 'eng', t: '<b>엥겔만 실험</b>: 사상 조류에 프리즘 빛을 비추고 산소 세균 지켜보기', hint: '패널의 엥겔만 실험 버튼' }]);
    const ps = c.seg('색소', [['a', '엽록소 a'], ['b', '엽록소 b'], ['car', '카로티노이드']], 'a', v => { pig = v; steady = 0; });
    const eb = c.button('엥겔만 실험 시작', () => { engOn = true; eng = 0; bac.forEach(b => b.x = c.rnd(X0, X1)); });
    c.readout(() => `빛 <b>${Math.round(wl)} nm</b> · ${NM[pig]} 흡수율 <b>${Math.round(ABS[pig](wl) * 100)}</b>%`);
    c.onDown = (x, y) => { if (y > 60 && y < 140 && x > X0 - 20 && x < X1 + 20) { dragging = true; wl = xw(x); steady = 0; return true; } };
    c.onMove = (x, y) => { if (dragging) { wl = xw(x); steady = 0; } };
    c.onUp = () => { dragging = false; };
    c.loop((dt, t) => {
      for (let x = X0; x < X1; x += 3) c.rr(x, 80, 4, 40, 0, wlCol(xw(x))); c.txt('400 nm', X0, 136, 11, '#cfe'); c.txt('700 nm', X1, 136, 11, '#cfe'); c.txt('프리즘으로 나눈 빛 — 끌어서 고르기', (X0 + X1) / 2, 64, 12, '#9fe');
      const kx = wx(wl); c.poly([[kx, 124], [kx - 10, 144], [kx + 10, 144]], '#fff'); c.rr(kx - 3, 76, 6, 48, 3, null, '#fff', 2);
      /* 빛줄기 → 색소 용액 → 측정기 */
      const a = ABS[pig](wl), col = wlCol(wl);
      c.g.globalAlpha = .8; c.rr(80, 238, 180, 24, 4, col); c.g.globalAlpha = .8 * (1 - a) + .05; c.rr(330, 238, 150, 24, 4, col); c.g.globalAlpha = 1;
      c.rr(260, 190, 70, 120, 14, COL[pig] + '88', '#cfe', 2); c.txt(NM[pig], 295, 330, 13, COL[pig]); c.txt('용액', 295, 348, 11, '#cfe');
      c.rr(480, 210, 70, 80, 10, '#0b2533', '#cfe', 2); c.txt('통과', 515, 232, 11, '#cfe'); c.txt(`${Math.round((1 - a) * 100)}%`, 515, 260, 18, '#fff');
      c.txt(`흡수 ${Math.round(a * 100)}%`, 295, 172, 16, '#ffd23f');
      steady += dt; if (steady > .6 && !dragging) { steady = -99; const L = pts[pig]; const i = L.findIndex(p => Math.abs(p[0] - wl) < 8); if (i >= 0) L.splice(i, 1); L.push([wl, a]); L.sort((p, q) => p[0] - q[0]);
        const A = pts.a; if (A.length >= 5 && A.some(p => p[0] < 470) && A.some(p => p[0] > 510 && p[0] < 590) && A.some(p => p[0] > 630)) c.hit('abs', '엽록소는 <b>청자색광(파랑·보라)</b>과 <b>적색광</b>을 잘 흡수하고 <b>녹색광</b>은 거의 흡수하지 않고 반사·투과해요 → 그래서 잎이 <b>초록</b>으로 보여요. 파장별 흡수율 그래프 = <b>흡수 스펙트럼</b>.');
        if (pts.b.length >= 3 && pts.car.length >= 3) c.hit('pig', '<b>엽록소 a</b> = 반응 중심 색소. <b>엽록소 b, 카로티노이드</b>(카로틴·잔토필) = <b>보조 색소</b>: 엽록소 a가 못 쓰는 파장의 빛을 흡수해 넘겨 줘요. 카로티노이드는 강한 빛으로부터 보호도 해요.'); }
      c.graph([640, 90, 320, 230], { x0: 400, x1: 700, y0: 0, y1: 1.05, xl: '파장(nm)', yl: '흡수율', xt: [400, 500, 600, 700] }, [...Object.entries(pts).map(([k, L]) => ({ pts: L, col: COL[k], dots: true })), ...(engOn && eng > 6 ? [{ pts: Array.from({ length: 31 }, (_, i) => [400 + i * 10, ACT(400 + i * 10)]), col: '#fff', dash: [6, 5], w: 2 }] : [])]);
      c.txt('초록 엽록소 a · 연두 엽록소 b · 주황 카로티노이드' + (engOn && eng > 6 ? ' · 흰 점선 작용 스펙트럼' : ''), 800, 358, 11, '#cfe');
      /* 해캄과 세균 */
      c.rr(X0 - 20, 400, X1 - X0 + 40, 140, 14, '#071820', '#ffffff18', 1); c.txt('사상 조류 (실 모양 조류)', X0 + 70, 414, 12, '#9fe');
      if (engOn) for (let x = X0; x < X1; x += 3) { c.g.globalAlpha = .35; c.rr(x, 450, 4, 40, 0, wlCol(xw(x))); c.g.globalAlpha = 1; }
      c.rr(X0, 462, X1 - X0, 16, 8, '#2a8a3a', '#5aff7a', 1);
      if (engOn) { eng += dt; bac.forEach(b => { const here = ACT(xw(b.x)); const l = ACT(xw(b.x - 8)), r = ACT(xw(b.x + 8)); b.x += ((r - l) * 260 + c.rnd(-1, 1) * 30 * (1 - here)) * dt; b.x = c.clamp(b.x, X0, X1); b.y += c.rnd(-1, 1) * 20 * dt; b.y = c.clamp(b.y, 430, 520); });
        if (eng > 6) c.hit('eng', '산소 세균(호기성 세균)이 <b>청자색광과 적색광</b> 쪽에 몰렸어요 → 그 빛에서 광합성으로 <b>O₂</b>가 많이 나온다는 뜻. 파장별 광합성 속도 = <b>작용 스펙트럼</b>, 엽록소의 <b>흡수 스펙트럼과 거의 일치</b> → 엽록소가 흡수한 빛으로 광합성!'); }
      bac.forEach(b => c.circle(b.x, b.y, 3, '#e0e0ff'));
      if (engOn) c.txt('흰 점 = 호기성 세균 (산소 많은 곳으로 모임)', X0 + 250, 530, 11, '#e0e0ff');
      c.tip(c.active() === 'abs' ? '무지개 띠를 끌어 빛을 고르고 잠깐 멈춰요 (보라~빨강 골고루)' : c.active() === 'pig' ? '색소를 바꿔 다시 재요' : c.active() === 'eng' ? '엥겔만 실험을 시작하고 세균을 지켜봐요' : '');
    });
    c.test = async () => { const set = async w => { wl = w; steady = 0; await c.wait(.8); }; for (const w of [420, 450, 550, 600, 660, 690]) await set(w); for (const k of ['b', 'car']) { ps.set(k); for (const w of [430, 550, 650]) await set(w); } eb.click(); await c.wait(6.5); };
  });

  /* ═════ 종이 크로마토그래피 ═════ */
  def('chrom', { ch: '명반응', t: '잎의 색소 분리하기', sub: 'TLC 크로마토그래피 · 전개율(Rf)' }, c => {
    const SOL = 500; /* 용매 표면 */
    const PIG = [['카로틴', .94, '#ffb000'], ['엽록소 a', .68, '#2aa87a'], ['엽록소 b', .54, '#9acd32'], ['잔토필', .46, '#ffe14a']];
    let bottom = 540, origin = () => bottom - 30, front = null, ruined = false, done = false, dragS = null, measured = {}, starts = 0;
    const H = c.hold('전개 (꾹 누르기)');
    c.button('새 종이로', () => { ruined = false; front = null; done = false; measured = {}; });
    c.goals([
      { id: 'dev', t: '색소를 <b>용매로 전개</b>해 분리하기 (용매 전선이 끝까지)', hint: '종이를 위아래로 끌어 높이를 맞춘 뒤 「전개」를 꾹' },
      { id: 'rf', t: '분리된 색소 띠 4개를 눌러 <b>전개율</b> 재기', hint: '색 띠를 하나씩 탭' }]);
    c.readout(() => Object.keys(measured).length ? Object.entries(measured).map(([n, v]) => `${n}: <b>${v}</b>`).join('<br>') : `원점 높이: ${origin() < SOL ? '<b>용매 위</b>' : '<b style="color:#ff8a8a">용매에 잠김</b>'}`);
    c.onDown = (x, y) => { if (front == null && Math.abs(x - 380) < 60) { dragS = { y, b: bottom }; return true; } };
    c.onMove = (x, y) => { if (dragS) bottom = c.clamp(dragS.b + (y - dragS.y), 470, 560); };
    c.onUp = () => { dragS = null; };
    c.onTap = (x, y) => { if (!done) return; const T = 90; PIG.forEach(([n, rf]) => { const py = origin() - rf * (origin() - T); if (Math.abs(x - 380) < 50 && Math.abs(y - py) < 14) { const dO = Math.round((origin() - py) / 10), dF = Math.round((origin() - T) / 10); measured[n] = `${dO} ÷ ${dF} = ${(dO / dF).toFixed(2)}`; c.beep('ok');
        if (Object.keys(measured).length === 4) c.hit('rf', '<b>전개율 = 원점~색소 중심 거리 ÷ 원점~용매 전선 거리</b>. <b>분자량이 작을수록, 전개액에 잘 녹을수록, 전개지(TLC 판)에 덜 달라붙을수록</b> 전개율이 커요: <b>카로틴 > 엽록소 a > 엽록소 b > 잔토필</b>. 전개율은 색소마다 정해져 있어 색소를 구별할 수 있어요.'); } }); };
    c.loop((dt, t) => {
      const T = 90, top = bottom - 470;
      if (H.held && !done) { if (front == null) { front = SOL; starts++; if (origin() >= SOL) { ruined = true; c.float('원점이 용매에 잠겨 색소가 녹아 나가요!', 600, 300, '#ff8a6a'); c.setHint('dev', '원점(연필 선)이 용매 표면보다 <b>위</b>에 오게 종이를 올려요 → 새 종이로'); } }
        if (!ruined) front = Math.max(T, front - dt * 70); if (front <= T + .5) { done = true; c.hit('dev', '용매가 종이를 타고 올라가며 색소를 끌고 가요. 색소마다 <b>용매에 녹는 정도와 종이에 붙는 정도</b>가 달라 이동 거리가 달라져서 분리돼요. 원점은 꼭 <b>용매 표면보다 위</b>!'); } }
      /* 비커 */
      c.rr(250, 380, 260, 200, 14, null, '#9fe', 3); c.txt('TLC 판', 380, 40, 13, '#cfe'); c.rr(253, SOL, 254, 577 - SOL, 10, ruined ? '#3a7a4a88' : '#5ac8ff44'); c.txt('전개 용매', 450, 560, 12, '#9fe');
      /* 종이 */
      c.rr(350, top, 60, bottom - top, 2, '#f4f0e6', '#ccc', 1); c.rr(340, top - 14, 80, 18, 4, '#888'); c.txt('↕ 끌어서 높이 조절', 470, top - 6, 11, '#cfe', 'left');
      const o = origin(); c.line([[350, o], [410, o]], '#555', 1.5, [3, 3]); c.txt('원점', 330, o, 11, '#cfe', 'right');
      if (front != null && !ruined) { c.g.globalAlpha = .25; c.rr(350, front, 60, o - front + 20, 0, '#5ac8ff'); c.g.globalAlpha = 1; c.line([[350, front], [410, front]], '#4a8aff', 2); if (done) c.txt('용매 전선', 420, front, 11, '#8fc8ff', 'left'); }
      if (ruined) { c.g.globalAlpha = .5; c.rr(352, SOL - 4, 56, 30, 4, '#3a9a4a'); c.g.globalAlpha = 1; }
      else PIG.forEach(([n, rf, col]) => { const d = front == null ? 0 : (o - front); const py = o - rf * d; c.rr(358, py - 6, 44, 12, 6, col); if (done) c.txt(n, 420, py, 12, col, 'left'); });
      c.tip(!c.isDone('dev') ? (front == null ? '종이 높이를 맞추고 「전개」를 꾹 눌러요' : ruined ? '실패! 「새 종이로」 → 원점을 용매 위로' : '계속 꾹 — 용매가 끝까지') : !c.isDone('rf') ? '색 띠를 하나씩 탭해서 거리를 재요' : '');
    });
    c.test = async () => { bottom = 520; H.held = true; await c.wait(7); H.held = false; const o = origin(); PIG.forEach(([n, rf]) => c.simTap(380, o - rf * (o - 90))); };
  });

  /* ═════ 명반응: Z 도식 ═════ */
  def('zs', { ch: '명반응', t: '명반응 전자 롤러코스터', sub: '광계 Ⅱ·Ⅰ · 물의 광분해 · 광인산화 · 순환/비순환 · 루벤·힐 실험' }, c => {
    const N = { w: [80, 400, 'H₂O'], p680: [170, 380, 'P680'], p680s: [190, 130, 'P680*'], pq: [280, 200, 'PQ'], b6f: [360, 250, '사이토크롬'], pc: [440, 300, 'PC'], p700: [520, 340, 'P700'], p700s: [550, 90, 'P700*'], fd: [620, 140, 'Fd'], fnr: [690, 190, 'NADP⁺ 환원 효소'] };
    const S = { e680: 1, e700: 1, lumen: 4, atp: 0, nadph: 0, half: 0, o2: 0, o2w: 0, o2c: 0, cyc: false, hill: false, lab: 'none', fe: 0, cool2: 0, cool1: 0, wait: 0, atpAcc: 0, cycATP0: null, nadphAtCyc: 0 };
    const E = [], bubs = [];
    const move = (path, onEnd) => E.push({ path, i: 0, k: 0, onEnd });
    const L2 = c.hold('광계 Ⅱ에 빛 ☀'), L1 = c.hold('광계 Ⅰ에 빛 ☀');
    const cy = c.toggle('순환적 전자 흐름', false, v => { S.cyc = v; if (v) { S.cycATP0 = S.atp; S.nadphAtCyc = S.nadph; } });
    const hl = c.toggle('힐 실험: NADP⁺ 대신 옥살산 철(Ⅲ), CO₂ 없음', false, v => { S.hill = v; });
    const lb = c.seg('¹⁸O 표지 (루벤)', [['none', '없음'], ['w', '물(H₂¹⁸O)'], ['co2', 'CO₂(C¹⁸O₂)']], 'none', v => { S.lab = v; });
    const water = c.draggable({ x: 80, y: 470, r: 30, draw: (x, y) => { c.circle(x, y, 22, S.lab === 'w' ? '#ff6a9a' : '#5ac8ff', '#04101a'); c.txt('H₂O', x, y, 12, '#04101a', 'center', 900); },
      onDrop: (x, y) => { if (c.dist(x, y, N.p680[0], N.p680[1]) > 70) return false; if (S.e680 >= 1) { c.float('P680에 아직 전자가 있어요', x, y - 30, '#9fe'); return false; }
        S.e680 += 2; S.lumen += 2; S.half++; c.fx(N.p680[0], N.p680[1], '#5ac8ff', 16); c.float('H₂O → ½O₂ + 2H⁺ + 2e⁻', N.p680[0] + 60, N.p680[1] - 40, '#8fe0ff');
        if (S.half % 2 === 0) { const lab = S.lab === 'w'; S.o2++; if (S.lab === 'w') S.o2w++; if (S.lab === 'co2') S.o2c++; bubs.push({ x: N.p680[0], y: N.p680[1], lab, t: 0 }); }
        c.hit('water', '빛을 받은 <b>P680</b>이 전자를 내보내면 빈자리는 <b>물이 쪼개져서</b> 채워요 = <b>물의 광분해</b>: 2H₂O → <b>O₂</b> + 4H⁺ + 4e⁻. 광합성에서 나오는 O₂는 여기서!');
        if (S.hill && S.o2 && S.fe > 0) c.hit('hill', '<b>힐 실험</b>: CO₂가 없어도 전자 수용체(옥살산 철(Ⅲ))만 있으면 빛을 받아 <b>O₂가 발생</b> → O₂ 발생은 명반응(물의 광분해)에서 일어나요.');
        rub(); return false; } }); water.bad = false;
    function rub() { if (S.o2w && S.o2c) c.hit('ruben', '<b>루벤 실험</b>: 물의 산소를 ¹⁸O로 표지하면 <b>¹⁸O₂</b>가 나오고, CO₂를 표지하면 일반 O₂만 나와요 → 광합성에서 발생하는 O₂는 <b>물</b>에서 와요.'); }
    c.goals([
      { id: 'ps', t: '<b>광계 Ⅱ에 빛</b>을 비추고 색소들이 에너지를 넘기는 모습 보기', hint: '「광계 Ⅱ에 빛」 꾹' },
      { id: 'water', t: '광계 Ⅱ에 빛을 비추고, 전자가 떠난 빈자리를 <b>물</b>로 채우기', hint: '「광계 Ⅱ에 빛」을 꾹 → 다시 꾹 해도 안 되면? 물방울을 P680에' },
      { id: 'nadph', t: '광계 Ⅰ까지 빛을 비춰 <b>NADPH 2개</b> 만들기', hint: '두 광계에 번갈아 빛, 물도 계속 공급' },
      { id: 'atp', t: '타이라코이드 내부에 H⁺를 모아 <b>ATP 4개</b> 만들기', hint: '아래 막 그림을 봐요' },
      { id: 'cyc', t: '<b>순환적 전자 흐름</b>으로 바꿔 ATP 3개 더 만들기', hint: '패널 토글 → 광계 Ⅰ에만 빛' },
      { id: 'ruben', t: '<b>루벤 실험</b>: 물을 표지했을 때와 CO₂를 표지했을 때 각각 O₂ 만들기', hint: '¹⁸O 표지를 바꾸고 물을 넣어요 (물 2개 = O₂ 1개)' },
      { id: 'hill', t: '<b>힐 실험</b>: 옥살산 철(Ⅲ)로 바꾸고 O₂ 만들기', hint: '힐 실험 토글 → 두 광계에 빛 → 물' }]);
    c.readout(() => `ATP <b>${S.atp}</b> · ${S.hill ? `Fe²⁺ <b>${S.fe}</b>` : `NADPH <b>${S.nadph}</b>`} · O₂ <b>${S.o2}</b><br>타이라코이드 내부 H⁺ <b>${Math.round(S.lumen)}</b>`);
    c.loop((dt, t) => {
      S.cool2 -= dt; S.cool1 -= dt;
      if (L2.held) c.hit('ps', '<b>광계</b> = <b>집광 복합체</b>(엽록소 a·b, 카로티노이드가 빛을 흡수해 에너지를 전달) + <b>반응 중심</b>(반응 중심 색소인 엽록소 a 한 쌍 + 1차 전자 수용체). 반응 중심 색소: 광계 Ⅱ는 680 nm 빛을 잘 흡수하는 <b>P680</b>, 광계 Ⅰ은 700 nm의 <b>P700</b>. 에너지를 받으면 고에너지 전자를 내놓아요.');
      if (L2.held && S.cool2 <= 0) { if (S.e680 >= 1 && !S.cyc) { S.e680--; S.cool2 = .6; c.fx(N.p680[0], N.p680[1], '#ffe066', 10);
          move(['p680', 'p680s', 'pq', 'b6f', 'pc'], () => { S.wait++; }); } else if (S.cool2 < -1) { S.cool2 = .6; c.float(S.cyc ? '순환 흐름에선 광계 Ⅱ를 안 써요' : 'P680에 전자가 없어요 — 물!', N.p680[0], N.p680[1] - 40, '#ff8a6a'); } }
      if (L1.held && S.cool1 <= 0 && S.e700 >= 1) { S.e700--; S.cool1 = .6; c.fx(N.p700[0], N.p700[1], '#ffe066', 10);
        move(S.cyc ? ['p700', 'p700s', 'fd', 'b6f', 'pc'] : ['p700', 'p700s', 'fd', 'fnr'], S.cyc ? () => { S.wait++; } : () => { if (S.hill) { S.fe++; c.float('Fe³⁺ → Fe²⁺', N.fnr[0], N.fnr[1] - 30, '#ffb37a'); } else { S.nhalf = (S.nhalf || 0) + 1; if (S.nhalf % 2 === 0) { S.nadph++; c.float('NADP⁺ + 2e⁻ + H⁺ → NADPH', N.fnr[0], N.fnr[1] - 30, '#7a8aff');
          if (S.nadph >= 2) c.hit('nadph', '<b>비순환적 전자 흐름</b>: 물 → 광계 Ⅱ(P680) → 전자 전달계 → 광계 Ⅰ(P700) → <b>NADP⁺</b>(최종 전자 수용체). 결과 <b>ATP + NADPH + O₂</b>. 전자는 빛을 두 번 받아 다시 높은 에너지로 올라가요.'); } } }); }
      if (S.wait > 0 && S.e700 < 1) { S.wait--; S.e700++; }
      /* ATP 합성 */
      if (S.lumen >= 3) { S.lumen -= dt * 4; S.atpAcc += dt * 4; if (S.atpAcc >= 3) { S.atpAcc -= 3; S.atp++; c.float('+ATP', 860, 470, '#ffd23f');
          if (S.atp >= 4) c.hit('atp', '전자가 사이토크롬 복합체를 지날 때 H⁺가 <b>스트로마 → 타이라코이드 내부</b>로 능동 수송돼 쌓여요(물의 광분해 H⁺도). 이 H⁺가 <b>ATP 합성 효소</b>로 스트로마에 나가며 ATP 합성 = <b>광인산화</b>. 마이토콘드리아와 같은 화학 삼투!');
          if (S.cyc && S.cycATP0 != null && S.atp - S.cycATP0 >= 3 && S.nadph === S.nadphAtCyc) c.hit('cyc', '<b>순환적 전자 흐름</b>: 광계 Ⅰ의 전자가 다시 사이토크롬 → P700으로 돌아와요. 광계 Ⅰ만 관여, <b>ATP만</b> 생기고 NADPH·O₂는 안 생겨요. 캘빈 회로에 부족한 ATP를 보충! 명반응 전체: 12H₂O + 12NADP⁺ → 6O₂ + <b>18ATP</b> + <b>12NADPH</b> + 12H⁺ → 포도당 1분자에 비순환 12회 + 순환 6회.'); } }
      /* 전자 이동 */
      for (let i = E.length - 1; i >= 0; i--) { const e = E[i]; e.k += dt / (e.i === 0 ? .35 : .3); if (e.k >= 1) { e.k = 0; e.i++; const at = e.path[e.i]; if (at === 'b6f') { S.lumen += 2; } if (e.i >= e.path.length - 1) { E.splice(i, 1); e.onEnd && e.onEnd(); continue; } }
        const a = N[e.path[e.i]], b = N[e.path[e.i + 1]]; const x = c.lerp(a[0], b[0], e.k), y = c.lerp(a[1], b[1], e.k); c.circle(x, y, 9, '#7ff8ff', '#fff', 2); }
      /* Z 도식 */
      c.txt('에너지 ↑', 30, 70, 12, '#cfe', 'left');
      const seq = ['p680s', 'pq', 'b6f', 'pc', 'p700']; for (let i = 0; i < seq.length - 1; i++) c.line([[N[seq[i]][0], N[seq[i]][1]], [N[seq[i + 1]][0], N[seq[i + 1]][1]]], '#ffffff44', 3);
      c.line([[N.p700s[0], N.p700s[1]], [N.fd[0], N.fd[1]], [N.fnr[0], N.fnr[1]]], S.cyc ? '#ffffff22' : '#ffffff44', 3); if (S.cyc) c.line([[N.fd[0], N.fd[1]], [N.b6f[0], N.b6f[1]]], '#ffd23f88', 3, [6, 5]);
      c.line([[N.p680[0], N.p680[1]], [N.p680s[0], N.p680s[1]]], L2.held ? '#ffe066' : '#ffe06644', 4, [5, 5]); c.line([[N.p700[0], N.p700[1]], [N.p700s[0], N.p700s[1]]], L1.held ? '#ffe066' : '#ffe06644', 4, [5, 5]);
      Object.entries(N).forEach(([k, [x, y, n]]) => { if (k === 'w') return; const big = k === 'p680' || k === 'p700'; c.rr(x - (big ? 34 : 30), y - 16, big ? 68 : 60, 32, 10, big ? '#2a7a3a' : '#0e2b3a', big ? '#5aff7a' : '#5af0ff88', 2); c.txt(k === 'fnr' ? '환원 효소' : n, x, y, 12, '#fff'); });
      [N.p680, N.p700].forEach((p, j) => { const on = j ? L1.held : L2.held; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + t * .3; const x = p[0] + Math.cos(a) * 54, y = p[1] + Math.sin(a) * 30; c.circle(x, y, 6, on ? '#9aff7a' : '#2a6a3a', '#5aff7a', 1); if (on) { const k = (t * 2 + i / 8) % 1; c.circle(c.lerp(x, p[0], k), c.lerp(y, p[1], k), 3, '#ffe066'); } } });
      c.txt('광계 Ⅱ', N.p680[0], N.p680[1] + 30, 13, '#8aff9a'); c.txt('광계 Ⅰ', N.p700[0], N.p700[1] + 30, 13, '#8aff9a');
      for (let i = 0; i < Math.max(0, S.e680); i++) c.circle(N.p680[0] - 20 + i * 14, N.p680[1] - 24, 5, '#7ff8ff'); if (S.e680 < 1) c.txt('빈자리!', N.p680[0] + 50, N.p680[1], 12, '#ff8a8a', 'left');
      if (S.e700 >= 1) c.circle(N.p700[0], N.p700[1] - 24, 5, '#7ff8ff');
      c.txt(S.hill ? '옥살산 철(Ⅲ) Fe³⁺' : 'NADP⁺', N.fnr[0] + 10, N.fnr[1] + 34, 12, S.hill ? '#ffb37a' : '#9aaaff');
      if (L2.held) c.txt('☀', N.p680[0] - 40, N.p680[1] - 60, 30, '#ffe066'); if (L1.held) c.txt('☀', N.p700[0] + 40, N.p700[1] - 60, 30, '#ffe066');
      /* 타이라코이드 막 */
      c.rr(20, 445, 960, 40, 0, '#1e4a2a'); c.txt('스트로마', 60, 432, 12, '#cfe'); c.rr(20, 485, 960, 20, 0, '#3a8a4a'); c.rr(20, 505, 960, 85, 0, '#0e2a1a'); c.txt('타이라코이드 내부', 90, 575, 12, '#9fe');
      for (let i = 0; i < Math.min(40, S.lumen); i++) c.circle(160 + (i * 53) % 640, 520 + (i * 29) % 50, 5, '#ff5a8a');
      c.rr(848, 475, 30, 40, 6, '#c8a0ff'); c.circle(863, 462, 18, '#a080ff'); c.txt('ATP 합성 효소', 863, 530, 11, '#d8c0ff'); c.arrow(863, 515, 863, 480, '#ff5a8a', 2, 7);
      /* O₂ 방울 */
      for (let i = bubs.length - 1; i >= 0; i--) { const b = bubs[i]; b.t += dt; if (b.t > 2.5) { bubs.splice(i, 1); continue; } c.circle(b.x - b.t * 20, b.y - b.t * 60, 16, b.lab ? '#ff6a9a' : '#ff9a9a', b.lab ? '#fff' : null, 3); c.txt(b.lab ? '¹⁸O₂' : 'O₂', b.x - b.t * 20, b.y - b.t * 60, 10, '#04101a', 'center', 900); }
      if (!water.held && !water.back) { water.x = water.hx; water.y = water.hy; }
      c.txt('↑ 물 끌기', 80, 506, 11, '#8fe0ff');
      const a = c.active(); c.tip(a === 'water' ? '「광계 Ⅱ에 빛」 꾹 → 빈자리가 생기면 물방울을 P680에' : a === 'nadph' ? '광계 Ⅱ·Ⅰ에 빛, 물도 계속 넣어요' : a === 'atp' ? '전자가 흐를수록 아래 H⁺가 쌓여요 — 계속!' : a === 'cyc' ? '순환적 전자 흐름을 켜고 광계 Ⅰ에 빛' : a === 'ruben' ? '표지를 「물」→ 물 2번, 「CO₂」→ 물 2번 (순환은 끄고)' : a === 'hill' ? '힐 실험 토글 → 두 광계에 빛, 물' : '');
    });
    c.test = async () => { const W = () => c.simDrop(water, N.p680[0], N.p680[1]); const pulse = async (h, s = .7) => { h.held = true; await c.wait(s); h.held = false; };
      await pulse(L2); W(); for (let r = 0; r < 6; r++) { await pulse(L2); await pulse(L1); W(); await c.wait(1.5); }
      cy.set(true); for (let r = 0; r < 8; r++) { await pulse(L1); await c.wait(1.6); } cy.set(false);
      lb.set('w'); for (let r = 0; r < 2; r++) { await pulse(L2); await c.wait(.2); W(); } lb.set('co2'); for (let r = 0; r < 2; r++) { await pulse(L2); await c.wait(.2); W(); }
      hl.set(true); for (let r = 0; r < 3; r++) { await pulse(L2); await pulse(L1); W(); await c.wait(1.5); } };
  });

  /* ═════ 캘빈 회로 ═════ */
  def('calvin', { ch: '캘빈 회로', t: '캘빈 회로 공장', sub: '탄소 고정 → 3PG 환원 → RuBP 재생 · 빛과 CO₂를 끊으면?' }, c => {
    const S = { RuBP: 6, PG: 0, PGAL: 0, buf: 0, sug: 0, glu: 0, ATP: 18, NADPH: 12, light: true, co2: true, cCO2: 0, cATP: 0, cNADPH: 0, n: 0, acc: 0, darkFix: 0, prep: 0 };
    const hist = []; let mark = null, gluAt = null;
    const lt = c.toggle('빛 (명반응 → ATP · NADPH 공급)', true, v => { S.light = v; mark = { t: c.t, PG: S.PG, RuBP: S.RuBP, light: v, co2: S.co2 }; S.darkFix = 0; });
    const ct = c.toggle('CO₂ 공급', true, v => { S.co2 = v; mark = { t: c.t, PG: S.PG, RuBP: S.RuBP, light: S.light, co2: v }; S.darkFix = 0; });
    c.goals([
      { id: 'glu', t: '빛과 CO₂를 주고 <b>포도당 1개</b> 만들기', hint: '공장이 도는 걸 지켜봐요' },
      { id: 'dark', t: '<b>빛을 끄고</b>(CO₂는 그대로) 3PG와 RuBP 변화 보기', hint: '아래 그래프의 두 선을 봐요' },
      { id: 'noco2', t: '빛은 켜고 <b>CO₂를 끊고</b> 변화 보기' },
      { id: 'benson', t: '<b>벤슨 실험</b>: 빛만 주다가(CO₂ X) → 어둡게 하고 CO₂ 주기', hint: '빛 ON·CO₂ OFF로 5초 → 빛 OFF·CO₂ ON' }]);
    c.readout(() => `사용: CO₂ <b>${S.cCO2}</b> · ATP <b>${S.cATP}</b> · NADPH <b>${S.cNADPH}</b><br>포도당 <b>${S.glu}</b>${S.glu ? ` → 1개당 CO₂ ${(S.cCO2 / S.glu).toFixed(1)} · ATP ${(S.cATP / S.glu).toFixed(1)} · NADPH ${(S.cNADPH / S.glu).toFixed(1)}` : ''}`);
    let fixFx = 0, redFx = 0, regFx = 0;
    function tick() {
      if (S.light) { S.ATP = Math.min(30, S.ATP + 3); S.NADPH = Math.min(30, S.NADPH + 2); }
      if (S.light && !S.co2) S.prep += .3; else if (S.light) S.prep = 0;
      if (S.co2 && S.RuBP >= 1) { S.RuBP--; S.PG += 2; S.cCO2++; fixFx = 1; if (!S.light) S.darkFix++; }
      for (let i = 0; i < 3 && S.PG >= 1 && S.ATP >= 1 && S.NADPH >= 1; i++) { S.PG--; S.ATP--; S.NADPH--; S.cATP++; S.cNADPH++; S.n++; redFx = 1; if (S.n % 6 === 0) S.sug++; else S.buf++; }
      while (S.buf >= 5 && S.ATP >= 3) { S.buf -= 5; S.ATP -= 3; S.cATP += 3; S.RuBP += 3; regFx = 1; }
      if (S.sug >= 2) { S.sug -= 2; S.glu++; c.float('포도당 +1', 470, 300, '#ffd23f'); c.beep('ok');
        if (S.light && S.co2 && S.glu >= 1) c.hit('glu', '<b>① 탄소 고정</b>: CO₂ + RuBP(C₅) → 3PG(C₃) (효소 <b>루비스코</b>) · <b>② 3PG 환원</b>: ATP·NADPH 써서 → PGAL · <b>③ RuBP 재생</b>: PGAL 일부 + ATP → RuBP. 포도당 1개 = <b>CO₂ 6 · ATP 18 · NADPH 12</b>. 장소: <b>스트로마</b>.'); }
      if (mark && c.t - mark.t > 4) {
        if (!mark.light && mark.co2 && !S.light && S.co2 && S.PG > mark.PG && S.RuBP < mark.RuBP + 0.5 && c.isDone('glu')) c.hit('dark', '빛을 끄면 ATP·NADPH가 바닥나 <b>3PG 환원이 멈춰요</b>. 탄소 고정은 남은 RuBP로 계속 → <b>3PG ↑, RuBP ↓</b>. 명반응과 캘빈 회로는 서로의 산물이 필요해 <b>함께</b> 일어나야 계속돼요.');
        if (mark.light && !mark.co2 && S.light && !S.co2 && S.RuBP > mark.RuBP && S.PG <= mark.PG) c.hit('noco2', 'CO₂를 끊으면 RuBP가 고정에 쓰이지 않고, 3PG는 계속 PGAL → RuBP로 재생 → <b>RuBP ↑, 3PG ↓</b>.'); }
      if (!S.light && S.co2 && S.darkFix >= 3 && S.prepDone) c.hit('benson', '<b>벤슨 실험</b>: 빛을 받은 직후엔 어두워도 CO₂를 주면 <b>잠시 탄소가 고정</b>돼요 — 빛이 있을 때 만들어 둔 <b>ATP·NADPH</b>가 남아 있기 때문. 다 쓰면 멈춰요.');
      if (S.prep >= 4.5) S.prepDone = true; if (S.light && S.co2) S.prepDone = false;
    }
    c.loop((dt, t) => {
      S.acc += dt; while (S.acc >= .3) { S.acc -= .3; tick(); hist.push([t, S.RuBP, S.PG]); if (hist.length > 140) hist.shift(); }
      fixFx = Math.max(0, fixFx - dt * 3); redFx = Math.max(0, redFx - dt * 3); regFx = Math.max(0, regFx - dt * 3);
      const CX = 470, CY = 210, R = 130; c.circle(CX, CY, R + 30, '#1e3a1e'); c.circle(CX, CY, R, null, '#8aff6a55', 18); c.txt('캘빈 회로', CX, CY - 8, 22, '#b8ff7a'); c.txt('스트로마', CX, CY + 18, 12, '#cfe');
      const nodes = [[-90, 'RuBP (C₅)', S.RuBP, '#8aff6a'], [30, '3PG (C₃)', S.PG, '#ffd23f'], [150, 'PGAL (C₃)', S.buf + S.sug, '#ff8aae']];
      nodes.forEach(([a, n, v, col]) => { const x = CX + Math.cos(a * Math.PI / 180) * R, y = CY + Math.sin(a * Math.PI / 180) * R; c.circle(x, y, 34, '#0e2b1a', col, 3); c.txt(String(Math.round(v)), x, y, 18, col); c.txt(n, x + (a === 150 ? -80 : a === 30 ? 80 : 0), y + (a === -90 ? -50 : 0), 13, col); });
      const arc = (a0, a1, on, lab, lx, ly) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = (a0 + (a1 - a0) * i / 16) * Math.PI / 180; pts.push([CX + Math.cos(a) * (R + 2), CY + Math.sin(a) * (R + 2)]); } c.line(pts, on ? '#fff' : '#ffffff44', on ? 6 : 3); c.txt(lab, lx, ly, 13, on ? '#fff' : '#9bc'); };
      arc(-60, 0, fixFx > 0, '① 탄소 고정 (루비스코)', CX + 190, CY - 110); arc(60, 120, redFx > 0, '② 3PG 환원', CX + 120, CY + 170); arc(180, 240, regFx > 0, '③ RuBP 재생', CX - 200, CY - 90);
      /* 입출력 */
      c.ball(CX + 230, CY - 60, 24, S.co2 ? '#c0c8d0' : '#333'); c.txt(S.co2 ? 'CO₂' : 'CO₂ X', CX + 230, CY - 60, 12, '#04101a', 'center', 900);
      c.bar(60, 60, 34, 150, S.ATP / 30, '#ffd23f', `ATP ${S.ATP}`); c.bar(120, 60, 34, 150, S.NADPH / 30, '#7a8aff', `NADPH ${S.NADPH}`); c.txt(S.light ? '☀ 명반응 공급 중' : '☾ 빛 없음', 107, 240, 13, S.light ? '#ffe066' : '#889');
      for (let i = 0; i < Math.min(S.glu, 10); i++) { const x = 800 + (i % 5) * 36, y = 90 + Math.floor(i / 5) * 40; c.poly(Array.from({ length: 6 }, (_, k) => [x + Math.cos(k * 1.047) * 15, y + Math.sin(k * 1.047) * 15]), '#ffb3d0', '#04101a'); }
      c.txt('포도당', 870, 60, 13, '#ffb3d0');
      /* 그래프 */
      c.graph([90, 400, 820, 150], { x0: t - 40, x1: t, y0: 0, y1: 24, yl: '최근 40초 — 분자 수' }, [{ pts: hist.map(h => [h[0], h[1]]), col: '#8aff6a', w: 3 }, { pts: hist.map(h => [h[0], h[2]]), col: '#ffd23f', w: 3 }]);
      c.txt('초록 RuBP · 노랑 3PG', 860, 395, 12, '#cfe');
      const a = c.active(); c.tip(a === 'glu' ? '포도당이 만들어질 때까지 지켜봐요' : a === 'dark' ? (S.light ? '패널에서 빛을 꺼요 (CO₂는 그대로)' : '4초 동안 두 선을 지켜봐요') : a === 'noco2' ? (!S.light ? '빛을 다시 켜요' : S.co2 ? 'CO₂를 끊어요' : '두 선을 지켜봐요') : a === 'benson' ? (S.prepDone ? (S.light ? '이제 빛을 끄고 CO₂를 켜요' : 'CO₂를 켜요') : '빛 ON · CO₂ OFF로 5초 준비') : '');
    });
    c.test = async () => { for (let i = 0; i < 80 && !c.isDone('glu'); i++) await c.wait(.25); lt.set(false); await c.wait(5); lt.set(true); await c.wait(2); ct.set(false); await c.wait(5.5); lt.set(false); ct.set(true); await c.wait(3); };
  });

  /* ═════ 세포호흡 vs 광합성 ═════ */
  def('cmp', { ch: '비교', t: '세포호흡 vs 광합성', sub: '공통점과 차이점 — 표를 직접 채우기' }, c => {
    const CARDS = [['세포질 · 마이토콘드리아', 'R', '장소'], ['엽록체', 'P', '장소'], ['이화 작용', 'R', '물질대사'], ['동화 작용', 'P', '물질대사'],
      ['유기물의 화학 에너지 → ATP', 'R', '에너지 전환'], ['빛에너지 → 화학 에너지', 'P', '에너지 전환'], ['기질 수준 인산화 있음 (해당·TCA)', 'R', '기질 수준 인산화'], ['기질 수준 인산화 없음', 'P', '기질 수준 인산화'],
      ['ATP → 다양한 생명 활동', 'R', 'ATP 이용'], ['ATP → 주로 탄소 고정 반응', 'P', 'ATP 이용'], ['조효소 NAD⁺ · FAD', 'R', '조효소'], ['조효소 NADP⁺', 'P', '조효소'],
      ['전자 공여체 NADH·FADH₂ / 최종 수용체 O₂', 'R', '전자'], ['전자 공여체 H₂O / 최종 수용체 NADP⁺', 'P', '전자'], ['H⁺: 기질 → 막사이공간', 'R', 'H⁺ 이동'], ['H⁺: 스트로마 → 타이라코이드 내부', 'P', 'H⁺ 이동'],
      ['전자전달계 + ATP 합성 효소 (화학 삼투)', 'C', ''], ['탄소 수가 변하는 회로 (TCA · 캘빈), 효소가 조절', 'C', '']];
    const order = CARDS.map((_, i) => i).sort(() => Math.random() - .5); let idx = 0, card = null; const placed = { R: [], P: [], C: [] };
    const Z = { R: [20, 70, 310, 430, '세포호흡', '#ff9a5a'], C: [345, 70, 310, 430, '공통점', '#ffd23f'], P: [670, 70, 310, 430, '광합성', '#8aff6a'] };
    function next() { if (idx >= order.length) { card = null; c.hit('all', '<b>공통점</b>: 전자전달계와 ATP 합성 효소로 ATP 합성(화학 삼투), 탄소 수가 변하는 회로와 효소 조절. <b>차이점</b>: 장소, 이화/동화, 에너지 전환, 기질 수준 인산화, ATP 이용, 조효소(NAD⁺·FAD / NADP⁺), 전자 공여체·최종 수용체, H⁺ 이동 방향.'); return; }
      const [t, k] = CARDS[order[idx++]]; card = c.draggable({ x: 500, y: 550, r: 60, t, k, draw: (x, y, o) => { c.rr(x - 170, y - 20, 340, 40, 12, '#0e2b3a', '#fff', 2); c.txt(o.t, x, y, 14, '#fff'); },
        onDrop: (x, y) => { const z = Object.keys(Z).find(q => { const [zx, zy, w, h] = Z[q]; return x > zx && x < zx + w && y > zy && y < zy + h; }); if (!z) return false; if (z !== card.k) { c.float('다시 생각해 봐요', x, y - 30, '#ff8a6a'); return false; }
          placed[z].push(card.t); c.remove(card); c.beep('ok'); next(); return true; } }); card.bad = true; }
    c.goals([{ id: 'all', t: '카드를 <b>세포호흡 · 공통점 · 광합성</b> 칸에 모두 놓아 표 완성하기', hint: '아래 카드를 위 칸으로 끌어요' }]);
    c.readout(() => `남은 카드 <b>${order.length - idx + (card ? 1 : 0)}</b>장`);
    next();
    c.loop(() => { Object.entries(Z).forEach(([k, [x, y, w, h, n, col]]) => { c.rr(x, y, w, h, 14, col + '14', col + '88', 2); c.txt(n, x + w / 2, y + 20, 17, col); placed[k].forEach((t, i) => c.txt('· ' + t, x + 12, y + 50 + i * 21, 12, '#eafffb', 'left', 400)); });
      c.tip(card ? '이 카드는 어디에?' : ''); });
    c.test = async () => { while (card) { const [x, y, w, h] = Z[card.k]; c.simDrop(card, x + w / 2, y + h / 2); } };
  });
})();
