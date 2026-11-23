'use strict';
/* 세포호흡 단원 실험실 */
(() => {
  const { def } = window.LAB;
  const tok = (c, x, y, label, col, r = 26, tcol = '#04101a') => { c.ball(x, y, r, col); c.txt(label, x, y + 1, label.length > 4 ? 11 : 13, tcol, 'center', 900); };

  /* ═════ ATP 배터리 ═════ */
  def('atp', { ch: '세포호흡 기초', t: 'ATP 배터리', sub: 'ATP → ADP + Pᵢ · 에너지 화폐' }, c => {
    const SLOT = { x: 540, y: 300 };
    let attached = true, charge = 0, uses = 0, tried = false, flex = 0, atpCount = 0;
    const pi = c.draggable({ x: SLOT.x, y: SLOT.y, r: 26, draw: (x, y) => { c.ball(x, y, 24, '#ff9a3c'); c.txt(attached ? 'P' : 'Pᵢ', x, y + 1, 16, '#04101a', 'center', 900); },
      onMove: (x, y) => { if (attached && c.dist(x, y, SLOT.x, SLOT.y) > 170) snap(x, y); },
      onDrop: (x, y) => { const d = c.dist(x, y, SLOT.x, SLOT.y);
        if (attached) { if (d > 110) { snap(x, y); return true; } if (d > 25) { c.boom('띠용~', SLOT.x, SLOT.y - 70, '#9fe', 34, .8, .1); c.beep('bad'); } return false; }
        if (d > 60) { pi.hx = x; pi.hy = y; return true; }
        if (charge <= 0) { tried = true; c.float('붙지 않아요 — 에너지가 필요해!', SLOT.x, SLOT.y - 60, '#ff8a6a'); c.tip('오른쪽 아래 포도당을 「세포호흡」 화로에 넣어 에너지를 만들어요'); pi.hx = SLOT.x + 90; pi.hy = SLOT.y + 90; return false; }
        charge--; attached = true; pi.hx = SLOT.x; pi.hy = SLOT.y; pi.x = SLOT.x; pi.y = SLOT.y; atpCount++; c.fx(SLOT.x, SLOT.y, '#ff9a3c', 20); c.float('ATP 재충전', SLOT.x, SLOT.y - 50, '#ff9a3c');
        c.hit('recharge', 'ADP + Pᵢ → ATP는 에너지가 <b>있어야</b> 일어나요. 그 에너지를 주는 게 <b>세포호흡</b>: 포도당 같은 유기물을 분해해 생명 활동에 쓸 <b>ATP를 합성</b>.'); return true; } });
    let bolt = 0, cheer = 0;
    function snap(x, y) { attached = false; pi.hx = x; pi.hy = y; uses++; flex = 1; bolt = 1; cheer = 1.6;
      c.shake(26); c.flash('#fff6c0', .9); c.beep('good'); c.fx(512, 300, '#ffd23f', 70, 420); c.fx(512, 300, '#ffffff', 30, 260);
      c.boom('뚝!!!', 512, 230, '#ff5a3a', 96, 1.1, -.15); setTimeout(() => c.boom('에너지 방출!!', 700, 140, '#ffd23f', 44, 1.3, .06), 250);
      c.hit('release', 'ATP = <b>아데노신 + 인산 3개</b>. 끝의 인산이 떨어져 <b>ADP + Pᵢ</b>가 될 때 에너지가 나와 근육 수축 같은 생명 활동에 쓰여요.');
      if (uses >= 3) c.hit('cycle', 'ATP는 세포의 <b>에너지 화폐</b>. 세포 속에 조금만 있고 쓰자마자 다시 만들어요 — <b>ATP ⇄ ADP + Pᵢ</b> 순환.'); }
    const glu = []; const mkG = i => glu.push(c.draggable({ x: 640 + i * 70, y: 540, r: 26, draw: (x, y) => { c.poly(Array.from({ length: 6 }, (_, k) => [x + Math.cos(k * 1.047) * 22, y + Math.sin(k * 1.047) * 22]), '#ffb3d0', '#04101a'); c.txt('포도당', x, y, 10, '#04101a', 'center', 900); },
      onDrop: (x, y) => { if (c.dist(x, y, 880, 430) > 80) return false; const o = glu[i]; o.off = true; c.remove(o); charge++; c.fx(880, 430, '#ff6a3a', 30); c.float('에너지 생김', 880, 370, '#ff9a3c'); return true; } }));
    for (let i = 0; i < 3; i++) mkG(i);
    c.goals([
      { id: 'release', t: 'ATP의 <b>끝 인산</b>을 끌어서 떼어 내기', hint: '주황 P(맨 오른쪽)를 멀리 끌어요' },
      { id: 'recharge', t: '떨어진 Pᵢ를 ADP에 다시 붙이기', hint: '그냥 붙을까? 안 되면 포도당을 화로에' },
      { id: 'cycle', t: '근육을 <b>3번</b> 움직이기 (떼고 → 충전 → 떼고 …)' }]);
    c.readout(() => `모은 에너지 <b>${charge}</b> · 근육 수축 <b>${uses}</b>번`);
    c.loop((dt, t) => {
      flex = Math.max(0, flex - dt * .8); bolt = Math.max(0, bolt - dt * 1.5);
      /* 분자 */
      c.rr(150, 260, 90, 80, 12, '#7a8aff', '#04101a'); c.txt('아데닌', 195, 300, 14, '#04101a');
      c.poly(Array.from({ length: 5 }, (_, k) => [300 + Math.cos(k * 1.257 - 1.57) * 40, 300 + Math.sin(k * 1.257 - 1.57) * 40]), '#5af0aa', '#04101a'); c.txt('리보스', 300, 304, 13, '#04101a');
      c.line([[240, 300], [262, 300]], '#cfe', 4); c.line([[340, 300], [396, 300]], '#cfe', 4);
      c.ball(420, 300, 24, '#ff9a3c'); c.txt('P', 420, 301, 16, '#04101a', 'center', 900); c.line([[444, 300], [456, 300]], '#cfe', 4);
      c.ball(480, 300, 24, '#ff9a3c'); c.txt('P', 480, 301, 16, '#04101a', 'center', 900);
      if (attached) { const g = c.g, held = pi.held, ex = held ? pi.x : 540, ey = held ? pi.y : 300, st = held ? c.clamp(c.dist(ex, ey, SLOT.x, SLOT.y) / 170, 0, 1) : 0;
        /* 번쩍번쩍 고에너지 결합: 후광 + 지글지글 번개 + 반짝이 */
        const gl = .5 + .5 * Math.sin(t * 9); const hal = g.createRadialGradient(510, 300, 2, 510, 300, 70 + gl * 18); hal.addColorStop(0, `rgba(255,240,140,${.75 + st * .25})`); hal.addColorStop(1, 'rgba(255,200,40,0)'); g.fillStyle = hal; g.beginPath(); g.arc(510, 300, 90, 0, 6.3); g.fill();
        const zig = (col, w, amp) => { const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([c.lerp(504, ex - 22, u) + (i % 8 ? c.rnd(-2, 2) : 0), c.lerp(300, ey, u) + (i % 8 ? c.rnd(-amp, amp) : 0)]); } c.line(pts, col, w); };
        zig(st > .6 ? '#ff5a3a' : '#ffd23f', 9 - st * 6, 5 + st * 10); zig('#ffffff', 3 - st * 2, 4 + st * 8);
        for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.047, r = 34 + Math.sin(t * 7 + i) * 6; const sx = 510 + Math.cos(a) * r, sy = 300 + Math.sin(a) * r * .7; c.txt('✦', sx, sy, 12 + 6 * Math.abs(Math.sin(t * 6 + i)), i % 2 ? '#fff' : '#ffe27a', 'center', 900); }
        if (!held) { c.label('⚡ 고에너지 인산 결합 ⚡', 510, 230 + Math.sin(t * 4) * 3, '#ffd23f', 15); c.arrow(510, 246, 510, 280, '#ffd23f', 2, 8); }
        else { /* 끌면 늘어나며 비명 */ c.shake(2 + st * 9); const n = 2 + Math.floor(st * 12); c.boom('으' + '어'.repeat(n) + '억' + (st > .7 ? '!!' : ''), 470, 200 - st * 20, st > .7 ? '#ff5a3a' : '#ffe9a0', 26 + st * 22, .09, -.05 + c.rnd(-.03, .03));
          if (st > .5) for (let i = 0; i < 2; i++) c.txt('💦', 480 + c.rnd(-40, 40), 260 + c.rnd(-20, 10), 18); } }
      c.line([[150, 360], [150, 372], [340, 372], [340, 360]], '#9bc', 2); c.txt('아데노신', 245, 388, 13, '#9bc');
      c.label(attached ? 'ATP (인산 3개)' : 'ADP (인산 2개)  +  Pᵢ', 350, 190, attached ? '#ffd23f' : '#ff9a3c', 20);
      /* 근육 */
      const k = Math.sin(flex * Math.PI); const L = 220 - k * 70; cheer = Math.max(0, cheer - dt); if (cheer > .4 && cheer < 1.5 && Math.random() < dt * 4) c.boom(['으랏차!!', '불끈!', '파워!!'][Math.floor(Math.random() * 3)], 820 + c.rnd(-60, 60), 110, '#ff8aa8', 34, .7, c.rnd(-.2, .2));
      c.rr(820 - L / 2, 160, L, 50, 25, '#d0506a', '#ff8aa8', 2); c.txt('근육 섬유', 820, 135, 14, '#ffb3c8'); if (k > .1) c.txt('수축!', 820, 185, 18, '#fff');
      if (bolt > 0) { c.g.globalAlpha = bolt; c.line([[SLOT.x + 20, SLOT.y - 20], [640, 230], [700, 250], [760, 200]], '#ffd23f', 5); c.g.globalAlpha = 1; }
      /* 화로 */
      c.rr(820, 390, 120, 90, 16, charge ? '#6a2a10' : '#2a1a14', '#ff8a3c', 2); c.txt('세포호흡', 880, 420, 15, '#ffb37a'); c.txt('화로', 880, 444, 13, '#ffb37a');
      for (let i = 0; i < charge; i++) c.circle(850 + i * 20, 466, 7, '#ffd23f');
      if (!c.isDone('release')) c.tip('맨 끝 주황 인산(P)을 잡아 떼어 내 봐요');
      else if (!attached && !c.isDone('recharge')) c.tip(tried ? '포도당을 끌어 오른쪽 아래 화로에 → 다시 Pᵢ를 붙여요' : '떨어진 Pᵢ를 다시 ADP 끝(빈자리)에 붙여 봐요');
      else c.tip(c.isDone('cycle') ? '' : '근육을 3번 움직일 때까지 반복!');
      if (!attached) c.circle(SLOT.x, SLOT.y, 26, null, '#ffffff55', 2);
    });
    c.test = async () => { c.simDrop(pi, 640, 420); c.simDrop(pi, SLOT.x, SLOT.y); c.simDrop(glu[0], 880, 430); c.simDrop(pi, SLOT.x, SLOT.y); c.simDrop(pi, 640, 420); c.simDrop(glu[1], 880, 430); c.simDrop(pi, SLOT.x, SLOT.y); c.simDrop(pi, 640, 420); };
  });

  /* ═════ 산화·환원과 NAD⁺ ═════ */
  def('redox', { ch: '세포호흡 기초', t: '수소 택배', sub: '산화 · 환원 · 탈수소 효소 · NAD⁺' }, c => {
    const GX = 280, GY = 290; let left = 6, waters = 0, co2 = 0, gone = false;
    const Hs = [], cars = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 - 1.57; const h = c.draggable({ x: GX + Math.cos(a) * 118, y: GY + Math.sin(a) * 118, r: 22, draw: (x, y) => { c.ball(x, y, 19, '#f0f0f0'); c.txt('2H', x, y, 13, '#04101a', 'center', 900); },
      onDrop: (x, y) => { const k = cars.find(q => q.st === 'nad' && c.dist(x, y, q.x, q.y) < 55); if (!k) return false; k.st = 'nadh'; h.off = true; c.remove(h); left--; c.fx(k.x, k.y, '#4aa8ff', 18); c.float('NAD⁺ + 2H → NADH + H⁺', k.x, k.y - 50, '#8fc8ff');
        c.hit('ox', '수소(전자)를 <b>잃는 것 = 산화</b>, <b>얻는 것 = 환원</b>. 포도당은 산화되고 NAD⁺는 환원돼 <b>NADH</b>가 돼요. 수소를 떼어 내는 효소 = <b>탈수소 효소</b>.');
        if (left === 0) { gone = true; co2 = 6; c.fx(GX, GY, '#c0c8d0', 40); setTimeout(() => c.hit('all', '세포호흡 전체: 포도당은 <b>산화</b>되어 <b>CO₂</b>가 되고, O₂는 <b>환원</b>되어 <b>H₂O</b>가 돼요. 이 과정에서 나온 에너지로 ATP를 만들어요.'), 600); }
        return true; } }); Hs.push(h); }
    for (let i = 0; i < 3; i++) { const k = c.draggable({ x: 160 + i * 120, y: 520, r: 34, st: 'nad', draw: (x, y, o) => { c.rr(x - 38, y - 22, 76, 44, 14, o.st === 'nad' ? '#8fb8ff' : '#2a6aff', '#04101a', 2); c.txt(o.st === 'nad' ? 'NAD⁺' : 'NADH', x, y, 16, o.st === 'nad' ? '#04101a' : '#fff', 'center', 900); },
      can: () => k.st === 'nadh', onDrop: (x, y) => { if (k.st !== 'nadh' || c.dist(x, y, 820, 300) > 90) return false; k.st = 'nad'; waters++; c.fx(820, 300, '#5ac8ff', 24); c.float('½O₂ + 2H → H₂O', 820, 220, '#8fe0ff');
        c.hit('o2', 'NADH가 가져온 수소(전자)를 마지막에 받는 것 = <b>산소</b> (최종 전자 수용체). 산소는 <b>환원</b>되어 <b>물</b>이 되고, NAD⁺는 비워져서 <b>다시 쓰여요</b>.'); return false; } }); k.bad = false; cars.push(k); }
    c.goals([
      { id: 'ox', t: '포도당의 <b>2H</b>를 떼어 NAD⁺에 싣기', hint: '흰 2H 구슬을 아래 NAD⁺ 택배차에' },
      { id: 'o2', t: '수소를 실은 <b>NADH</b>를 산소(O₂)에게 배달하기', hint: '파란 NADH를 오른쪽 O₂로' },
      { id: 'all', t: '택배차 3대로 포도당의 수소를 <b>전부</b> 옮기기', hint: '빈 차(NAD⁺)만 짐을 실을 수 있어요' }]);
    c.readout(() => `포도당에 남은 2H <b>${left}</b> / 6<br>만든 물 <b>${waters}</b> · 나온 CO₂ <b>${co2}</b>`);
    c.loop((dt, t) => {
      if (!gone) { c.poly(Array.from({ length: 6 }, (_, k) => [GX + Math.cos(k * 1.047) * 72, GY + Math.sin(k * 1.047) * 72]), '#ffb3d0', '#04101a', 2); c.txt('포도당', GX, GY - 10, 18, '#04101a'); c.txt('C₆H₁₂O₆', GX, GY + 16, 14, '#04101a');
        if (left < 6) c.label(`산화되는 중 (수소를 잃음)`, GX, GY - 150, '#ffb3d0', 14); }
      else for (let i = 0; i < 6; i++) { const a = i + t * .5; c.ball(GX + Math.cos(a) * 60, GY + Math.sin(a) * 60 - 20, 18, '#c0c8d0'); c.txt('CO₂', GX + Math.cos(a) * 60, GY + Math.sin(a) * 60 - 20, 11, '#04101a', 'center', 900); }
      c.ball(820, 300, 46, '#ff5a5a'); c.txt('O₂', 820, 300, 24, '#fff', 'center', 900); c.txt('산소', 820, 362, 14, '#ffaaaa');
      for (let i = 0; i < waters; i++) { c.circle(720 + (i % 6) * 40, 450 + Math.floor(i / 6) * 34, 13, '#5ac8ff'); c.txt('H₂O', 720 + (i % 6) * 40, 450 + Math.floor(i / 6) * 34, 9, '#04101a'); }
      cars.forEach(k => { if (k.st === 'nadh' && !k.held) c.txt('환원됨', k.x, k.y - 34, 12, '#8fc8ff'); });
      c.tip(c.active() === 'ox' ? '흰 2H를 NAD⁺ 택배차에 실어요' : c.active() === 'o2' ? 'NADH를 산소에게 배달!' : c.active() === 'all' ? '빈 차가 없으면? NADH를 산소에게 보내 비워요' : '');
    });
    c.test = async () => { let hi = 0; for (let r = 0; r < 2; r++) { for (let j = 0; j < 3; j++) { const h = Hs[hi++]; c.simDrop(h, cars[j].x, cars[j].y); } for (let j = 0; j < 3; j++) c.simDrop(cars[j], 820, 300); } await c.wait(.8); };
  });

  /* ═════ 마이토콘드리아: 세포내 공생 · 크리스타 · 장소 ═════ */
  def('mito', { ch: '세포호흡 기초', t: '마이토콘드리아와 엽록체', sub: '세포내 공생설 · 이중막 · 크리스타 · 반응 장소 · 그라나 · 스트로마' }, c => {
    let phase = 1, eng = 0, divided = 0, folds = 0;
    const bac = c.draggable({ x: 860, y: 300, r: 50, draw: (x, y) => { if (eng) return; c.rr(x - 50, y - 26, 100, 52, 26, '#ff9a5a', '#ffd0a0', 3); c.circle(x, y, 12, null, '#ff5aa8', 2.5); c.txt('호기성 세균', x, y + 44, 13, '#ffd0a0'); },
      onDrop: (x, y) => { if (c.dist(x, y, 380, 320) > 200) return false; bac.off = true; c.remove(bac); bx = x; by = y; c.tween(1.4, k => eng = k, () => c.hit('engulf', '숙주 세포가 세균을 막으로 감싸 삼켰어요 → <b>이중막</b>. 안쪽 막(내막) = 원래 세균의 막, 바깥 막(외막) = 숙주가 감싼 막.')); return true; } });
    let bx = 380, by = 320;
    const D = c.button('세균(마이토콘드리아) 분열시키기', () => { if (!c.isDone('engulf')) { c.float('먼저 세균을 세포 안으로!', 600, 200, '#ff8a6a'); return; } if (divided) return; c.tween(1.5, k => divided = k, () => { c.hit('divide', '마이토콘드리아는 자기만의 <b>원형 DNA</b>와 <b>라이보솜</b>이 있어 <b>스스로 복제·분열</b>해요. 크기도 원핵생물(세균)과 비슷하고, 내막에는 세균 세포막과 비슷한 효소·전자전달계가 있어요 → 원래 독립된 세균이었다는 <b>세포내 공생설</b>의 증거.'); setTimeout(cyStart, 900); }); });
    let cyE = 0, cy = null;
    function cyStart() { cy = c.draggable({ x: 860, y: 420, r: 50, draw: (x, y) => { if (cyE) return; c.rr(x - 50, y - 28, 100, 56, 28, '#2a9a4a', '#8aff9a', 3); for (let i = 0; i < 3; i++) c.line([[x - 30, y - 12 + i * 12], [x + 30, y - 12 + i * 12]], '#cfffd0', 2); c.txt('남세균 (광합성 세균)', x, y + 46, 13, '#8aff9a'); },
      onDrop: (x, y) => { if (c.dist(x, y, 380, 320) > 200) return false; cy.off = true; c.remove(cy); c.tween(1.2, k => cyE = k, () => { c.hit('cyano', '그 뒤 일부 세포가 <b>광합성을 하는 원핵생물(남세균)</b>을 또 받아들여 <b>엽록체</b>가 됐어요 → 식물 세포. 엽록체도 <b>이중막 · 원형 DNA · 라이보솜</b>이 있고 스스로 분열해요.'); setTimeout(phase2, 1200); }); return true; } }); }
    let fs;
    const zones = []; const tokens = [];
    function phase2() { phase = 2; D.remove(); fs = c.slider('내막 주름(크리스타) 수', 0, 10, 0, 1, v => v, v => { folds = v; if (v >= 7) c.hit('cristae', '내막이 안쪽으로 접힌 <b>크리스타</b> → 막 면적이 넓어져 전자전달계와 ATP 합성 효소가 더 많이 들어가요. 에너지를 많이 쓰는 <b>근육·간·신경 세포</b>에 마이토콘드리아가 많아요.'); });
      [['해당 과정', 'cyto', '#ffb3d0'], ['피루브산 산화', 'mat', '#ffd23f'], ['TCA 회로', 'mat', '#5aff9a'], ['전자전달계', 'inner', '#5af0ff']].forEach(([n, z, col], i) => tokens.push(c.draggable({ x: 130 + i * 160, y: 560, r: 40, n, z, col, placed: false,
        draw: (x, y, o) => { c.rr(x - 66, y - 18, 132, 36, 12, o.placed ? o.col : '#0e2b3a', o.col, 2); c.txt(o.n, x, y, 14, o.placed ? '#04101a' : o.col, 'center', 900); },
        can: () => c.isDone('cristae'),
        onDrop: (x, y) => { const o = tokens[i]; const z = zoneAt(x, y); if (z !== o.z) { c.float(`여긴 ${ZN[z]} — 다시!`, x, y - 30, '#ff8a6a'); return false; } o.placed = true; o.hx = x; o.hy = y; c.fx(x, y, o.col, 16); c.beep('ok');
          if (tokens.every(q => q.placed) && !c.isDone('place')) setTimeout(phase3, 1400); if (tokens.every(q => q.placed)) c.hit('place', '<b>해당 과정</b>: 세포질 · <b>피루브산 산화, TCA 회로</b>: 마이토콘드리아 <b>기질</b> · <b>전자전달계(산화적 인산화)</b>: 마이토콘드리아 <b>내막</b>. 두 막 사이는 막사이공간.'); return true; } }))); }
    const ZN = { cyto: '세포질', ims: '막사이공간', inner: '내막', mat: '기질', thy: '타이라코이드 막', str: '스트로마', out: '엽록체 밖' };
    const STK = [[260, 250], [380, 330], [500, 240], [620, 320], [700, 230]]; const ctok = [];
    function czone(x, y) { if (((x - 480) / 340) ** 2 + ((y - 290) / 180) ** 2 > 1) return 'out'; for (const [sx, sy] of STK) if (Math.abs(x - sx) < 48 && y > sy - 40 && y < sy + 48) return 'thy'; return 'str'; }
    function phase3() { phase = 3; fs && fs.el.remove(); tokens.forEach(o => { o.off = true; c.remove(o); });
      [['명반응 (광계·전자전달계)', 'thy', '#8aff9a'], ['ATP 합성 효소', 'thy', '#c8a0ff'], ['탄소 고정 반응 (캘빈 회로)', 'str', '#ffd23f'], ['엽록체 DNA · 라이보솜', 'str', '#ff9ad0']].forEach(([n, z, col], i) => { const o = c.draggable({ x: 130 + i * 245, y: 560, r: 40, n, z, col, placed: false,
        draw: (x, y, o) => { c.rr(x - 112, y - 17, 224, 34, 12, o.placed ? o.col : '#0e2b3a', o.col, 2); c.txt(o.n, x, y, 13, o.placed ? '#04101a' : o.col, 'center', 900); },
        onDrop: (x, y) => { const z = czone(x, y); if (z !== o.z) { c.float(`여긴 ${ZN[z]} — 다시!`, x, y - 30, '#ff8a6a'); return false; } o.placed = true; o.hx = x; o.hy = y; c.fx(x, y, o.col, 16); c.beep('ok');
          if (ctok.every(q => q.placed)) c.hit('chl', '엽록체(3~6 μm, <b>이중막</b>): 납작한 주머니 <b>타이라코이드</b>가 쌓인 것이 <b>그라나</b>. <b>타이라코이드 막</b>에 광계·전자전달계·ATP 합성 효소 → 빛에너지를 화학 에너지로(<b>명반응</b>). 액체 부분 <b>스트로마</b>에 탄소 고정 효소·엽록체 DNA·라이보솜 → 포도당 합성.'); return true; } }); ctok.push(o); }); }
    const CX = 470, CY = 290, A1 = 330, B1 = 170, A2 = 300, B2 = 142;
    function zoneAt(x, y) { const q1 = ((x - CX) / A1) ** 2 + ((y - CY) / B1) ** 2, q2 = ((x - CX) / A2) ** 2 + ((y - CY) / B2) ** 2;
      if (q1 > 1) return 'cyto'; if (q2 > 1.12) return 'ims'; if (q2 > .82) return 'inner';
      /* 크리스타 손가락 근처도 내막 */ for (let i = 0; i < folds; i++) { const fx = CX - A2 + 60 + i * ((2 * A2 - 120) / Math.max(1, folds - 1)); const top = i % 2 === 0; if (Math.abs(x - fx) < 16 && (top ? y < CY + 20 : y > CY - 20)) return 'inner'; } return 'mat'; }
    c.goals([
      { id: 'engulf', t: '호기성 세균을 끌어 큰 세포 안에 넣기', hint: '오른쪽 주황 세균을 왼쪽 세포 안으로' },
      { id: 'divide', t: '안에 들어간 세균을 <b>분열</b>시키기', hint: '패널의 분열 버튼' },
      { id: 'cyano', t: '이번엔 <b>남세균</b>을 세포 안에 넣기', hint: '오른쪽 아래 초록 세균' },
      { id: 'cristae', t: '내막을 접어 <b>ATP 생산량</b>을 최대로 올리기', hint: '슬라이더로 크리스타 수를 늘려요' },
      { id: 'place', t: '네 과정을 일어나는 <b>장소</b>에 놓기', hint: '세포질 · 막사이공간 · 내막 · 기질 중 어디?' },
      { id: 'chl', t: '엽록체: 각 부품을 <b>타이라코이드 막</b>과 <b>스트로마</b>에 놓기', hint: '쌓인 원반(그라나) 위 = 타이라코이드' }]);
    c.readout(() => phase === 2 ? `내막 길이 <b>${(1 + folds * .35).toFixed(1)}</b>배 · ATP 합성 효소 <b>${8 + folds * 6}</b>개<br>ATP 생산 <b>${Math.round((8 + folds * 6) / 68 * 100)}</b>%` : '세포내 공생설 체험');
    c.loop((dt, t) => {
      if (phase === 1) {
        c.circle(380, 320, 230, '#16323e', '#7fd0e0', 4); c.circle(300, 250, 60, '#2a3a6a', '#8a9aff', 3); c.txt('핵', 300, 250, 16, '#cfd8ff'); c.txt('숙주 세포 (진핵세포 조상)', 380, 70, 15, '#9fe');
        if (eng) { const k = eng; const ox = c.lerp(bx, 470, k), oy = c.lerp(by, 390, k);
          const n = divided ? 2 : 1; for (let j = 0; j < n; j++) { const dx = divided ? (j ? 1 : -1) * divided * 70 : 0; const x = ox + dx;
            if (k > .5) c.rr(x - 62, oy - 38, 124, 76, 38, null, '#7fd0e0', 3 * (k - .5) * 2); c.rr(x - 50, oy - 26, 100, 52, 26, '#ff9a5a', '#ffd0a0', 3); c.circle(x, oy, 12, null, '#ff5aa8', 2.5); }
          if (k >= 1) { c.label('외막 (숙주가 감싼 막)', 470, oy - 62, '#7fd0e0', 12); c.label('내막 (원래 세균 막)', 470, oy + 54, '#ffd0a0', 12); c.txt('DNA', ox + 26 + (divided ? 70 * divided : 0), oy, 11, '#ff9ad0', 'left'); } }
        if (cyE) { const k = cyE, x = c.lerp(560, 300, k), y = c.lerp(420, 430, k); if (k > .5) c.rr(x - 62, y - 40, 124, 80, 40, null, '#7fd0e0', 3 * (k - .5) * 2); c.rr(x - 50, y - 28, 100, 56, 28, '#2a9a4a', '#8aff9a', 3); for (let i = 0; i < 3; i++) c.line([[x - 30, y - 12 + i * 12], [x + 30, y - 12 + i * 12]], '#cfffd0', 2); if (k >= 1) c.label('엽록체 (원래 남세균)', x, y + 54, '#8aff9a', 12); }
        c.tip(!c.isDone('engulf') ? '오른쪽 세균을 큰 세포 안으로 끌어 넣어요' : !c.isDone('divide') ? '안에서 스스로 분열할 수 있을까? 패널 버튼' : !c.isDone('cyano') ? '남세균도 세포 안으로!' : '');
      } else if (phase === 3) {
        c.poly(Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 6.283; return [480 + Math.cos(a) * 340, 290 + Math.sin(a) * 180]; }), '#1e4a22', '#8aff6a', 4);
        c.poly(Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 6.283; return [480 + Math.cos(a) * 326, 290 + Math.sin(a) * 166]; }), null, '#b8ff9a', 2);
        STK.forEach(([sx, sy]) => { for (let j = 0; j < 5; j++) c.rr(sx - 40, sy - 30 + j * 16, 80, 13, 6, '#3aa84a', '#8aff6a', 1.5); });
        c.txt('그라나 (타이라코이드가 쌓인 것)', 260, 196, 12, '#b8ff9a'); c.txt('스트로마', 480, 420, 16, '#e0ffd0'); c.txt('외막·내막 (이중막)', 480, 96, 12, '#b8ff9a');
        c.tip(!c.isDone('chl') ? '엽록체 부품을 맞는 곳에 놓아요' : '');
      } else {
        c.rr(10, 50, 980, 470, 20, '#1a2a20', null); c.txt('세포질', 60, 80, 16, '#ffb3d0');
        c.poly(Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 6.283; return [CX + Math.cos(a) * A1, CY + Math.sin(a) * B1]; }), '#3a2a18', '#ffb070', 4); c.txt('외막', CX, CY - B1 - 14, 13, '#ffb070');
        c.poly(Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 6.283; return [CX + Math.cos(a) * A2, CY + Math.sin(a) * B2]; }), '#4a3010', '#ffd23f', 4);
        for (let i = 0; i < folds; i++) { const fx = CX - A2 + 60 + i * ((2 * A2 - 120) / Math.max(1, folds - 1)); const top = i % 2 === 0; const ye = Math.sqrt(Math.max(0, 1 - ((fx - CX) / A2) ** 2)) * B2; const y0 = top ? CY - ye : CY + ye, y1 = top ? CY + 25 : CY - 25;
          c.rr(fx - 9, Math.min(y0, y1), 18, Math.abs(y1 - y0), 9, '#4a3010', '#ffd23f', 3); for (let j = 0; j < 3; j++) c.circle(fx + 12, c.lerp(y0, y1, (j + 1) / 4), 4, '#5af0ff'); }
        for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + .3; c.circle(CX + Math.cos(a) * (A2 + 8), CY + Math.sin(a) * (B2 + 8), 5, '#5af0ff'); }
        c.txt('막사이공간', CX + A2 - 20, CY - B2 + 2, 11, '#ffcf90'); c.txt('내막', CX - A2 - 22, CY, 13, '#ffd23f'); c.txt('기질', CX, CY, 15, '#ffe9a0');
        c.txt('파란 점 = ATP 합성 효소', 850, 500, 12, '#5af0ff');
        c.tip(!c.isDone('cristae') ? '슬라이더로 내막을 접어 ATP 합성 효소 자리를 늘려요' : !c.isDone('place') ? '아래 과정 카드를 일어나는 장소에 놓아요' : '');
      } });
    c.test = async () => { c.simDrop(bac, 380, 320); await c.wait(1.6); D.click(); await c.wait(2.6); c.simDrop(cy, 380, 320); await c.wait(2.8); fs.set(8); const P = { cyto: [80, 120], mat: [CX + 140, CY + 10], inner: [CX + A2 - 2, CY] }; tokens.forEach(o => c.simDrop(o, ...P[o.z])); await c.wait(1.8); const Q = { thy: [380, 340], str: [480, 420] }; ctok.forEach(o => c.simDrop(o, ...Q[o.z])); };
  });

  /* ═════ 해당 과정 공장 ═════ */
  def('gly', { ch: '해당 과정', t: '해당 과정 조립 라인', sub: '포도당(C₆) → 피루브산(C₃) 2 · 세포질 · 산소 불필요' }, c => {
    let step = 0, used = 0, made = 0, nadh = 0, cut = 0, swipe = null;
    const M = [{ C: 6, P: [], nad: false, y: 300, x: 500 }];
    const tools = {};
    const mkTool = (k, x, label, col, onUse) => { const o = c.draggable({ x, y: 545, r: 30, draw: (x, y) => tok(c, x, y, label, col, 28), onDrop: (x, y) => { const r = onUse(x, y); if (r) { o.x = o.hx; o.y = o.hy; } return r ? true : false; } }); tools[k] = o; return o; };
    const near = (x, y) => M.find(m => Math.abs(x - m.x) < m.C * 30 + 40 && Math.abs(y - m.y) < 60);
    mkTool('ATP', 200, 'ATP', '#ffd23f', (x, y) => { if (step !== 0) { c.float(step < 3 ? '지금은 필요 없어요' : '여기선 ATP를 만들어야죠', x, y - 30, '#9fe'); return false; } const m = near(x, y); if (!m) return false;
      m.P.push(m.P.length ? 'R' : 'L'); used++; c.float('ATP → ADP', x, y - 40, '#ffd23f'); c.fx(x, y, '#ff9a3c', 14);
      if (used === 2) { step = 1; c.hit('invest', '처음에 <b>ATP 2개를 투자</b>해 포도당에 인산 2개를 붙여요 → <b>과당 2인산</b>. 분해를 시작하려면 먼저 에너지를 넣어야 해요.'); } return true; });
    mkTool('NAD', 420, 'NAD⁺', '#8fb8ff', (x, y) => { if (step !== 2) { c.float(step < 2 ? '아직이에요' : '이미 했어요', x, y - 30, '#9fe'); return false; } const m = near(x, y); if (!m || m.nad) return false;
      m.nad = true; m.P = ['L', 'R']; nadh++; c.float('2H → NAD⁺ = NADH + H⁺', m.x, m.y - 60, '#8fc8ff'); c.fx(m.x, m.y, '#4aa8ff', 18);
      if (M.every(q => q.nad)) { step = 3; c.hit('nad', 'PGAL이 <b>산화</b>되며(탈수소 효소) 수소가 <b>NAD⁺ → NADH</b>로 옮겨 가요. 이때 무기 인산(Pᵢ)이 하나씩 더 붙어요.'); } return true; });
    mkTool('ADP', 640, 'ADP', '#ffe9a0', (x, y) => { if (step !== 3) { c.float('아직이에요', x, y - 30, '#9fe'); return false; }
      let best = null, bd = 60; M.forEach(m => m.P.forEach((p, i) => { const px = p === 'L' ? m.x - m.C * 30 - 34 : m.x + m.C * 30 + 34; const d = c.dist(x, y, px, m.y); if (d < bd) { bd = d; best = [m, i]; } }));
      if (!best) return false; const [m, i] = best; m.P.splice(i, 1); made++; c.float('+ATP', x, y - 40, '#ffd23f'); c.fx(x, y, '#ffd23f', 16);
      if (made === 4) { step = 4; c.hit('atp', '기질(반응물)의 인산을 효소가 ADP에 <b>직접</b> 옮겨 ATP를 만들어요 = <b>기질 수준 인산화</b>. ATP 4개 생성 → <b>순 2ATP</b>. 결과: 포도당 1 → <b>피루브산 2 + 2NADH + 2ATP</b>, 산소 필요 없음, <b>세포질</b>.'); } return true; });
    c.goals([
      { id: 'invest', t: '포도당에 <b>ATP</b>를 넣어 인산 붙이기 (2번)', hint: 'ATP 구슬을 포도당 사슬에 끌어다 놓아요' },
      { id: 'split', t: '과당 2인산을 <b>가운데서 잘라</b> 3탄소 두 개로', hint: '사슬 가운데를 위에서 아래로 쓱 그어요' },
      { id: 'nad', t: '두 PGAL에 <b>NAD⁺</b>를 대어 수소 떼기', hint: 'NAD⁺를 각 PGAL에' },
      { id: 'atp', t: '<b>ADP</b>를 인산(P)에 대어 ATP 만들기 (4번)', hint: 'ADP를 주황 P 하나하나에' }]);
    c.readout(() => `ATP 사용 <b>${used}</b> · 생성 <b>${made}</b> · 순 <b>${made - used}</b><br>NADH <b>${nadh}</b> · 산소 사용 <b>0</b><br>탄소: ${M.map(m => 'C' + m.C).join(' + ')}`);
    c.onDown = (x, y) => { if (step === 1) { swipe = { x, y }; return true; } };
    c.onUp = (x, y) => { if (step === 1 && swipe) { const m = M[0]; if (Math.abs((swipe.x + x) / 2 - m.x) < 60 && Math.min(swipe.y, y) < m.y - 30 && Math.max(swipe.y, y) > m.y + 30) doCut(); else c.float('사슬 가운데를 세로로 그어요', x, y, '#9fe'); } swipe = null; };
    function doCut() { c.boom('싹둑!!', 500, 220, '#ff8aa8', 70, 1); c.shake(14); c.flash('#fff', .5); step = 2; const m = M[0]; M.length = 0; M.push({ C: 3, P: ['L'], nad: false, y: 300, x: 500 }, { C: 3, P: ['R'], nad: false, y: 300, x: 500 }); c.beep('ok'); c.tween(.7, k => { M[0].y = 300 - k * 110; M[1].y = 300 + k * 90; }, () => c.hit('split', '과당 2인산(C₆)이 쪼개져 <b>PGAL(C₃) 2분자</b>가 돼요. 이제부터는 모든 단계가 <b>2번씩</b> 일어나요.')); }
    c.loop((dt, t) => {
      c.rr(10, 60, 980, 440, 20, '#1a2a20', null); c.txt('세포질', 60, 84, 15, '#ffb3d0');
      M.forEach(m => { const w = m.C * 60; for (let i = 0; i < m.C; i++) { const x = m.x - w / 2 + 30 + i * 60; if (i) c.line([[x - 60, m.y], [x, m.y]], '#cfe', 4); c.ball(x, m.y, 22, '#404850', 'C', '#fff'); }
        m.P.forEach(p => { const x = p === 'L' ? m.x - w / 2 - 34 : m.x + w / 2 + 34; c.line([[p === 'L' ? x + 20 : x - 20, m.y], [p === 'L' ? m.x - w / 2 + 8 : m.x + w / 2 - 8, m.y]], '#cfe', 4); c.ball(x, m.y, 18, '#ff9a3c', 'P'); });
        const name = m.C === 6 ? (m.P.length === 2 ? '과당 2인산' : m.P.length ? '포도당 + 인산' : '포도당') : step >= 4 ? '피루브산' : 'PGAL'; c.label(name + ` (C${m.C === 6 ? '₆' : '₃'})`, m.x, m.y - 46, step >= 4 ? '#ffd23f' : '#cfe', 15);
        if (m.nad && step < 4) c.txt('산화됨', m.x, m.y + 40, 12, '#8fc8ff'); });
      if (step === 1) { const m = M[0]; c.line([[m.x, m.y - 70], [m.x, m.y + 70]], '#ffffff66', 2, [6, 6]); c.txt('✂', m.x + 18, m.y - 64, 22, '#fff'); if (swipe && c.ptr.down) c.line([[swipe.x, swipe.y], [c.ptr.x, c.ptr.y]], '#ff5a5a', 4); }
      c.txt('도구 — 끌어서 사용', 80, 545 - 44, 12, '#9bc', 'left');
      c.tip(['포도당에 ATP 2개를 투자해요', '가운데를 위→아래로 그어 잘라요', '각 PGAL에 NAD⁺를 대요', 'ADP를 인산에 대어 ATP 4개!', '해당 과정 완료!'][step]);
    });
    c.test = async () => { c.simDrop(tools.ATP, 500, 300); c.simDrop(tools.ATP, 500, 300); c.onDown(500, 220); c.onUp(500, 380); await c.wait(1); c.simDrop(tools.NAD, 500, M[0].y); c.simDrop(tools.NAD, 500, M[1].y); for (const m of M) for (const p of m.P.slice()) c.simDrop(tools.ADP, p === 'L' ? m.x - 90 - 34 : m.x + 90 + 34, m.y); };
  });

  /* ═════ 피루브산 산화 ═════ */
  def('pyr', { ch: '피루브산 산화', t: '마이토콘드리아 입장', sub: '피루브산(C₃) → 아세틸 CoA(C₂) · 탈탄산 · ATP 0' }, c => {
    let step = 0, co2 = 0, nadh = 0, inMat = false, coa = false, nad = false, cTake = null, round = 1;
    const MX = 600; /* 막 위치 */
    const pyr = c.draggable({ x: 220, y: 300, r: 60, draw: (x, y) => { if (inMat) return; drawMol(x, y, 3); c.label('피루브산 (C₃)', x, y - 50, '#ffd23f', 14); },
      onDrop: (x, y) => { if (c.dist(x, y, MX + 15, 300) < 70) { inMat = true; pyr.off = true; c.remove(pyr); c.tween(.8, k => mx = c.lerp(MX + 15, 790, k)); c.hit('enter', '산소가 있으면 피루브산은 <b>수송 단백질</b>을 통해 마이토콘드리아 <b>기질</b>로 들어가요.'); return true; }
        if (x > MX) c.float('막은 그냥 못 지나가요 — 수송 단백질로!', x, y - 30, '#ff8a6a'); return false; } });
    let mx = 790, C3 = 3;
    function drawMol(x, y, n) { for (let i = 0; i < n; i++) { const cx = x - (n - 1) * 30 + i * 60; if (i) c.line([[cx - 60, y], [cx, y]], '#cfe', 4); c.ball(cx, y, 22, '#404850', 'C', '#fff'); } }
    c.onDown = (x, y) => { if (step === 0 && inMat && C3 === 3 && c.dist(x, y, mx + 60, 300) < 34) { cTake = { x, y }; return true; } };
    c.onMove = (x, y) => { if (cTake) { cTake.x = x; cTake.y = y; } };
    c.onUp = () => { if (cTake) { if (c.dist(cTake.x, cTake.y, mx + 60, 300) > 80) { C3 = 2; co2++; step = 1; c.boom('뽁!', cTake.x, cTake.y - 40, '#e0e8f0', 54, .9); c.shake(10); bub.push({ x: cTake.x, y: cTake.y, t: 0 }); c.beep('ok'); c.hit('co2', '피루브산에서 <b>CO₂</b>가 떨어져 나가요 = <b>탈탄산 반응</b> (탈탄산 효소). 탄소 3개 → 2개.'); } cTake = null; } };
    const bub = [];
    const tNAD = c.draggable({ x: 820, y: 530, r: 30, draw: (x, y) => tok(c, x, y, 'NAD⁺', '#8fb8ff', 28), onDrop: (x, y) => { if (step !== 1 || c.dist(x, y, mx, 300) > 90) return false; nad = true; nadh++; step = 2; tNAD.off = true; c.remove(tNAD); c.float('NAD⁺ → NADH', mx, 230, '#8fc8ff'); c.hit('nad', '동시에 수소가 떨어져 <b>NAD⁺ → NADH</b> (산화). 하지만 이 단계에선 <b>ATP가 생기지 않아요</b>.'); return true; } });
    const tCoA = c.draggable({ x: 920, y: 530, r: 30, draw: (x, y) => tok(c, x, y, 'CoA', '#c08aff', 28), onDrop: (x, y) => { if (step !== 2 || c.dist(x, y, mx, 300) > 90) return false; coa = true; step = 3; tCoA.off = true; c.remove(tCoA);
        c.hit('coa', '남은 2탄소 조각이 <b>조효소 A(CoA)</b>와 결합 → <b>아세틸 CoA (C₂)</b>. 포도당 1개 = 피루브산 2개니까 이 과정도 <b>2번</b>: CO₂ 2, NADH 2, ATP 0.'); setTimeout(() => { round = 2; }, 400); return true; } });
    c.goals([
      { id: 'enter', t: '피루브산을 <b>수송 단백질</b>로 마이토콘드리아 기질에 넣기', hint: '막에 박힌 초록 통로로 끌어요' },
      { id: 'co2', t: '피루브산 끝의 <b>탄소 하나</b>를 잡아 떼어 내기', hint: '오른쪽 끝 C를 바깥으로 끌어요' },
      { id: 'nad', t: '<b>NAD⁺</b>를 대어 수소 떼기' },
      { id: 'coa', t: '<b>CoA</b>를 붙여 아세틸 CoA 만들기' }]);
    c.readout(() => `CO₂ <b>${co2 * round}</b> · NADH <b>${nadh * round}</b> · ATP <b style="color:#ff8a8a">0</b>${round === 2 ? '<br><small>(피루브산 2개 기준)</small>' : ''}`);
    c.loop((dt, t) => {
      c.rr(0, 50, MX, 470, 0, '#1a2a20'); c.rr(MX + 30, 50, 400, 470, 0, '#3a2a14'); c.txt('세포질', 80, 80, 15, '#ffb3d0'); c.txt('마이토콘드리아 기질', 810, 80, 15, '#ffe9a0');
      c.rr(MX - 4, 50, 12, 470, 4, '#ffb070'); c.rr(MX + 22, 50, 12, 470, 4, '#ffd23f'); c.txt('외막', MX + 2, 540, 11, '#ffb070'); c.txt('내막', MX + 28, 556, 11, '#ffd23f');
      c.rr(MX - 10, 262, 50, 76, 10, '#2a9a6a', '#5aff9a', 2); c.txt('수송', MX + 15, 290, 11, '#04101a'); c.txt('단백질', MX + 15, 306, 11, '#04101a');
      if (inMat) { drawMol(mx - (C3 === 2 ? 0 : 0), 300, C3); if (C3 === 3 && !cTake) { c.circle(mx + 60, 300, 30, null, '#ffd23f', 2); } if (cTake) c.ball(cTake.x, cTake.y, 22, '#404850', 'C', '#fff');
        if (coa) { c.line([[mx + 30, 300], [mx + 74, 300]], '#cfe', 4); c.rr(mx + 74, 280, 60, 40, 10, '#c08aff', '#04101a'); c.txt('CoA', mx + 104, 300, 14, '#04101a'); }
        c.label(coa ? '아세틸 CoA (C₂)' : C3 === 2 ? '2탄소 조각 (아세틸기)' : '피루브산 (C₃)', mx, 240, coa ? '#5aff9a' : '#ffd23f', 14); }
      for (const b of bub) { b.t += dt; b.y -= dt * 60; c.ball(b.x, b.y, 18, '#c0c8d0'); c.txt('CO₂', b.x, b.y, 11, '#04101a', 'center', 900); }
      c.tip(['피루브산을 수송 단백질로 끌어요', '오른쪽 끝 탄소를 잡아 떼어 내요 (탈탄산)', 'NAD⁺를 아세틸기에 대요', 'CoA를 붙여요', '완료! 이제 TCA 회로로'][step + (step === 0 && !inMat ? 0 : step === 0 ? 1 : 1)] || '');
    });
    c.test = async () => { c.simDrop(pyr, MX + 15, 300); await c.wait(.9); c.onDown(mx + 60, 300); c.onMove(mx + 60, 150); c.onUp(); c.simDrop(tNAD, mx, 300); c.simDrop(tCoA, mx, 300); };
  });

  /* ═════ TCA 회로 바퀴 ═════ */
  def('tca', { ch: 'TCA 회로', t: 'TCA 회로 돌리기', sub: '아세틸 CoA(C₂) + 옥살아세트산(C₄) → 시트르산(C₆) → … → 옥살아세트산' }, c => {
    const CX = 400, CY = 320, R = 200;
    const ST = [ /* 각도(도), 이름, 탄소 수(도착 후), 필요한 것, 나오는 것 */
      { a: -90, n: '옥살아세트산', C: 4 }, { a: -20, n: '시트르산', C: 6, need: [] },
      { a: 50, n: '5탄소 화합물', C: 5, need: ['NAD'], out: ['CO₂', 'NADH'] }, { a: 120, n: '4탄소 화합물', C: 4, need: ['NAD', 'ADP'], out: ['CO₂', 'NADH', 'ATP'] },
      { a: 190, n: '4탄소 화합물', C: 4, need: ['FAD'], out: ['FADH₂'] }, { a: 270, n: '옥살아세트산', C: 4, need: ['NAD'], out: ['NADH'] }];
    let ang = -90, si = 0, joined = false, given = {}, nadPool = 0, jammed = 0, rot = null, turns = 0, auto = false;
    const tally = { CO2: 0, NADH: 0, FADH2: 0, ATP: 0 };
    const acoa = c.draggable({ x: 120, y: 90, r: 40, draw: (x, y) => { c.rr(x - 52, y - 20, 104, 40, 12, '#5aff9a', '#04101a'); c.txt('아세틸 CoA', x, y - 2, 13, '#04101a', 'center', 900); c.txt('C₂', x, y + 30, 12, '#5aff9a'); },
      onDrop: (x, y) => { if (joined || c.dist(x, y, CX, CY - R) > 80) return false; joined = true; acoa.off = true; c.remove(acoa); si = 1; c.tween(.6, k => ang = c.lerp(-90, -20, c.ease(k))); c.fx(CX, CY - R, '#5aff9a', 20);
        c.hit('join', '<b>아세틸 CoA(C₂) + 옥살아세트산(C₄) → 시트르산(C₆)</b>. CoA는 떨어져 나가 다시 쓰여요.'); return true; } });
    const shelf = {};
    [['NAD', 'NAD⁺', '#8fb8ff', 720], ['FAD', 'FAD', '#9affc0', 820], ['ADP', 'ADP', '#ffe9a0', 920]].forEach(([k, l, col, x]) => {
      const o = shelf[k] = c.draggable({ x, y: 520, r: 30, k, draw: (x, y) => { tok(c, x, y, l, col, 28); if (k === 'NAD') c.txt(`남은 ${nadPool}`, o.hx, o.hy + 42, 12, nadPool ? '#cfe' : '#ff8a8a'); },
        can: () => k !== 'NAD' || nadPool > 0,
        onDrop: (x, y) => { const nx = ST[si + 1]; if (!nx || !joined) return false; const p = pos(nx.a); if (c.dist(x, y, p[0], p[1]) > 70) return false;
          if (!nx.need.includes(k) || given[k]) { c.float('이 단계엔 필요 없어요', x, y - 30, '#9fe'); return false; }
          given[k] = 1; if (k === 'NAD') nadPool--; c.fx(p[0], p[1], col, 14); c.beep('ok'); return false; } }); o.bad = false; });
    const pos = a => [CX + Math.cos(a * Math.PI / 180) * R, CY + Math.sin(a * Math.PI / 180) * R];
    const refill = c.button('전자전달계에서 NAD⁺ 받아오기 (+3)', () => { nadPool += 3; c.float('+3 NAD⁺', 720, 470, '#8fc8ff'); });
    c.goals([
      { id: 'join', t: '<b>아세틸 CoA</b>를 바퀴 꼭대기의 옥살아세트산에 붙이기', hint: '왼쪽 위 초록 조각을 바퀴 맨 위로' },
      { id: 'jam', t: '바퀴를 시계 방향으로 돌려 보기 — 멈추면 이유 찾기', hint: '바퀴 테두리를 잡고 돌려요. 멈춘 칸에 무엇이 필요?' },
      { id: 'turn', t: '필요한 조효소를 대며 <b>한 바퀴</b> 완주하기', hint: '빛나는 다음 칸에 필요한 것을 끌어다 놓아요' },
      { id: 'glu', t: '포도당 1개분(2바퀴) 결산 보기', hint: '패널의 결산 버튼' }]);
    c.readout(() => `이번 바퀴: CO₂ <b>${tally.CO2}</b> · NADH <b>${tally.NADH}</b> · FADH₂ <b>${tally.FADH2}</b> · ATP <b>${tally.ATP}</b>`);
    let sumB = null;
    c.onDown = (x, y) => { const d = c.dist(x, y, CX, CY); if (joined && d > R - 70 && d < R + 70) { rot = Math.atan2(y - CY, x - CX) * 180 / Math.PI; return true; } };
    c.onMove = (x, y) => { if (rot == null) return; let a = Math.atan2(y - CY, x - CX) * 180 / Math.PI, d = a - rot; if (d > 180) d -= 360; if (d < -180) d += 360; rot = a; if (d > 0) advance(d); };
    c.onUp = () => { rot = null; };
    function advance(d) { const nx = ST[si + 1]; if (!nx) return; const lim = nx.a; const miss = nx.need.filter(k => !given[k]);
      if (ang + d >= lim - 14 && miss.length) { ang = Math.max(ang, lim - 14); if (jammed < c.t - 1) { c.float(`멈춤! ${miss.map(k => ({ NAD: 'NAD⁺', FAD: 'FAD', ADP: 'ADP' })[k]).join(', ')} 필요`, ...pos(lim), '#ff8a6a'); c.beep('bad'); } if (jammed < c.t - 1.5) { c.boom('끼이익!!', CX, CY - 40, '#ff6a5a', 50, 1); c.shake(14); } jammed = c.t; c.hit('jam', 'TCA 회로는 <b>NAD⁺·FAD</b>가 있어야 돌아가요. NAD⁺는 전자전달계가 NADH의 전자를 O₂에 넘겨야 다시 생겨요 → <b>산소가 없으면 TCA 회로도 멈춰요</b>.'); if (miss.includes('NAD') && nadPool === 0) c.tip('NAD⁺가 하나도 없어요! 패널에서 받아와요'); return; }
      ang += d; if (ang >= lim) { ang = lim; si++; given = {}; (nx.out || []).forEach((o, i) => { const k = o.replace('₂', '2'); tally[k === 'CO2' ? 'CO2' : k]++; const p = pos(lim); c.float(o, p[0] + 40, p[1] - 20 - i * 24, o === 'CO₂' ? '#c0c8d0' : o === 'ATP' ? '#ffd23f' : '#8fc8ff'); }); c.beep('pop');
        if (si === ST.length - 1) { turns = 1; c.hit('turn', '한 바퀴: <b>CO₂ 2 · NADH 3 · FADH₂ 1 · ATP 1</b> (기질 수준 인산화). 탄소 C₆ → C₅ → C₄로 줄며 CO₂가 나가고, <b>옥살아세트산이 다시 만들어져</b> 회로가 계속 돌아요.');
          sumB = c.button('포도당 1개분 결산 (2바퀴)', () => c.hit('glu', '피루브산 1개 완전 분해: 3CO₂ · 4NADH · 1FADH₂ · 1ATP. 포도당 1개(피루브산 2개)면 <b>CO₂ 6</b> (피루브산 산화 2 + TCA 4) · NADH 8 · FADH₂ 2 · ATP 2.')); } } }
    c.loop((dt, t) => {
      c.circle(CX, CY, R + 34, '#3a2a14', null); c.circle(CX, CY, R, null, '#ffd23f55', 26); c.circle(CX, CY, R - 50, '#2a1e10', null); c.txt('TCA 회로', CX, CY - 10, 26, '#ffd23f'); c.txt('마이토콘드리아 기질', CX, CY + 22, 13, '#ffe9a0');
      for (let i = 0; i < 12; i++) { const a = ang * Math.PI / 180 + i * .5236; c.line([[CX + Math.cos(a) * (R - 13), CY + Math.sin(a) * (R - 13)], [CX + Math.cos(a) * (R + 13), CY + Math.sin(a) * (R + 13)]], '#ffd23f88', 3); }
      ST.forEach((s, i) => { if (i === 0 && si > 0) return; const [x, y] = pos(s.a); const next = i === si + 1; c.circle(x, y, 30, next ? '#0f4a5a' : '#1a1a10', next ? '#5af0ff' : '#ffffff44', next ? 3 : 1.5);
        c.txt(s.n, x + (x > CX ? 92 : -92), y, 13, '#ffe9a0'); c.txt(`C${'₀₁₂₃₄₅₆'[s.C]}`, x + (x > CX ? 92 : -92), y + 18, 12, '#cfe');
        if (s.need && next) s.need.forEach((k, j) => c.txt((given[k] ? '✓' : '') + ({ NAD: 'NAD⁺', FAD: 'FAD', ADP: 'ADP' })[k], x, y - 8 + j * 16, 11, given[k] ? '#5aff9a' : '#fff')); });
      /* 분자 */
      const [mx, my] = pos(ang), Cn = joined ? ST[si].C : 4; for (let i = 0; i < Cn; i++) { const a = i / Cn * 6.283; c.ball(mx + Math.cos(a) * 16, my + Math.sin(a) * 16, 10, '#404850'); }
      if (!joined) c.label('옥살아세트산 (C₄)', CX, CY - R - 46, '#ffe9a0', 13);
      c.rr(670, 470, 320, 110, 14, '#ffffff08', '#ffffff22', 1); c.txt('조효소 · ADP — 다음 칸에 끌어다 놓기', 830, 485, 11, '#9bc');
      if (c.isDone('join') && !c.isDone('turn')) c.tip(si + 1 < ST.length ? '바퀴 테두리를 잡고 시계 방향으로 돌려요' : '');
      else if (!joined) c.tip('아세틸 CoA를 바퀴 꼭대기로!');
    });
    c.test = async () => { c.simDrop(acoa, CX, CY - R); await c.wait(.7); advance(80); refill.click(); for (let i = 1; i < ST.length - 1; i++) { const nx = ST[si + 1]; nx.need.forEach(k => c.simDrop(shelf[k], ...pos(nx.a))); advance(80); } sumB && sumB.click(); };
  });

  /* ═════ 전자전달계 엔진 (전자전달계 실험 + 독극물 실험이 같이 씀) ═════ */
  function etcEngine(c, opt) {
    const YT = 70, YM1 = 225, YM2 = 330, YB = 590;
    const X = { I: 130, II: 250, Q: 320, III: 420, cyt: 490, IV: 580, O2: 600, SYN: 830 };
    const PUMP = { I: 4, III: 4, IV: 2 };
    const S = { H: 6, HMAX: 40, o2: true, cn: false, oligo: false, dnp: false, atp: 0, atpAcc: 0, heat: 0, o2used: 0, nadReg: 0, pairs: [], occ: {}, rot: 0, flow: [], lastPair: null, rate: { o2: 0, atp: 0, heat: 0 } };
    const HD = Array.from({ length: 60 }, () => ({ x: c.rnd(20, 980), y: c.rnd(YT + 10, YM1 - 12), vx: c.rnd(-20, 20), vy: c.rnd(-20, 20) }));
    const route = start => start === 'I' ? ['I', 'Q', 'III', 'cyt', 'IV', 'O2'] : ['II', 'Q', 'III', 'cyt', 'IV', 'O2'];
    function deliver(kind) { const st = kind === 'NADH' ? 'I' : 'II'; if (S.occ[st]) return false; const p = { r: route(st), i: 0, t: 0, pumped: 0, kind, x: X[st], y: (YM1 + YM2) / 2 }; S.occ[st] = p; S.pairs.push(p); return true; }
    const x2 = () => S.H / S.HMAX;
    function step(dt) {
      for (const p of S.pairs.slice()) { const here = p.r[p.i]; p.t += dt; const pump = PUMP[here] || 0; const dur = (pump ? .35 * (1 + 3 * x2() ** 2) : .18);
        if (p.t < dur) continue; if (pump && S.H + pump > S.HMAX) continue; /* H⁺ 기울기가 꽉 차면 못 퍼 올림 */
        const nx = p.r[p.i + 1];
        if (here === 'IV' && (!S.o2 || S.cn)) continue; /* 산소 없음 / 사이안화물 */
        if (nx && nx !== 'O2' && S.occ[nx]) continue;
        if (pump) { S.H += pump; p.pumped += pump; for (let k = 0; k < pump; k++) S.flow.push({ x: X[here] + c.rnd(-14, 14), y: YM2, ty: c.rnd(YT + 20, YM1 - 20), t: 0, up: true }); }
        delete S.occ[here]; p.i++; p.t = 0;
        if (nx === 'O2') { S.o2used += .5; S.pairs.splice(S.pairs.indexOf(p), 1); S.lastPair = p; opt.onPair && opt.onPair(p); continue; }
        S.occ[nx] = p; }
      /* ATP 합성 효소 */
      const syn = S.oligo ? 0 : 16 * x2(); const use = Math.min(S.H, syn * dt); S.H -= use; S.atpAcc += use; S.rot += use * .9;
      while (S.atpAcc >= 4) { S.atpAcc -= 4; S.atp++; S.flow.push({ x: X.SYN, y: YM2 + 40, ty: YM2 + 120, t: 0, atp: true }); opt.onATP && opt.onATP(); }
      /* 짝풀림제 / 자연 누출 */
      const leak = (S.dnp ? 40 : .3) * x2() * dt; S.H = Math.max(0, S.H - leak); S.heat += leak;
      const k = Math.min(1, dt * .8); S.rate.o2 += ((S._o2l = S.o2used - (S._o2p || 0)) / dt - S.rate.o2) * k; S._o2p = S.o2used; S.rate.atp += (use / 4 / dt - S.rate.atp) * k; S.rate.heat += (leak / dt - S.rate.heat) * k; }
    function draw(dt, t) {
      const g = c.g;
      c.rr(0, YT, 1000, YM1 - YT, 0, '#3a2a14'); c.rr(0, YM1, 1000, YM2 - YM1, 0, '#5a4418'); c.rr(0, YM2, 1000, YB - YM2, 0, '#2a1e10');
      c.txt('막사이공간', 70, YT + 16, 14, '#ffcf90'); c.txt('내막', 30, (YM1 + YM2) / 2, 12, '#ffd23f'); c.txt('기질', 40, YB - 16, 14, '#ffe9a0');
      /* H⁺ 점 */
      const n = Math.round(S.H); HD.forEach((d, i) => { if (i >= n) return; d.x += d.vx * dt; d.y += d.vy * dt; if (d.x < 15 || d.x > 985) d.vx *= -1; if (d.y < YT + 8 || d.y > YM1 - 10) d.vy *= -1; c.circle(d.x, d.y, 5, '#ff5a8a'); });
      c.bar(940, YT + 10, 26, YM1 - YT - 40, x2(), '#ff5a8a'); c.txt('H⁺', 953, YM1 - 14, 12, '#ff8aa8');
      /* 복합체 */
      const cx = (k, w, h, col, lab) => { const busy = S.occ[k]; c.rr(X[k] - w / 2, YM1 - h / 2 + 50, w, h, 14, busy ? c.shade(col, .25) : col, '#04101a', 2); c.txt(lab, X[k], YM1 + 50, 15, '#04101a', 'center', 900); };
      cx('I', 80, 150, '#5aa8ff', 'Ⅰ'); cx('II', 56, 70, '#9affc0', 'Ⅱ'); cx('III', 76, 140, '#5aa8ff', 'Ⅲ'); cx('IV', 72, 130, '#5aa8ff', 'Ⅳ');
      c.circle(X.Q, YM1 + 52, 14, '#ffd23f', '#04101a'); c.txt('Q', X.Q, YM1 + 52, 11, '#04101a'); c.circle(X.cyt, YM1 - 6, 13, '#ff9a5a', '#04101a'); c.txt('c', X.cyt, YM1 - 6, 11, '#04101a');
      if (S.cn) { c.txt('☠', X.IV, YM2 + 40, 30, '#ff5a5a'); }
      /* ATP 합성 효소 */
      c.rr(X.SYN - 22, YM1 - 30, 44, YM2 - YM1 + 30, 8, S.oligo ? '#555' : '#c8a0ff', '#04101a', 2); c.circle(X.SYN, YM2 + 40, 40, S.oligo ? '#555' : '#a080ff', '#04101a', 2);
      for (let i = 0; i < 6; i++) { const a = S.rot + i * 1.047; c.line([[X.SYN, YM2 + 40], [X.SYN + Math.cos(a) * 34, YM2 + 40 + Math.sin(a) * 34]], '#04101a', 3); }
      c.txt('ATP 합성 효소', X.SYN, YM2 + 100, 13, '#d8c0ff'); if (S.oligo) c.txt('⛔', X.SYN, YM1 - 46, 26, '#ff5a5a');
      if (S.dnp) for (let i = 0; i < 3; i++) { const x = 680 + i * 50; c.rr(x - 6, YM1, 12, YM2 - YM1, 6, '#ff7a3a', null); }
      /* 흐르는 것들 */
      for (let i = S.flow.length - 1; i >= 0; i--) { const f = S.flow[i]; f.t += dt * 2; if (f.t >= 1) { S.flow.splice(i, 1); continue; } if (f.atp) { c.ball(f.x + f.t * 60, c.lerp(f.y, f.ty, f.t), 13, '#ffd23f'); c.txt('ATP', f.x + f.t * 60, c.lerp(f.y, f.ty, f.t), 8, '#04101a'); } else c.circle(f.x, c.lerp(f.y, f.ty, f.t), 5, '#ff5a8a'); }
      if (!S.oligo && S.H > 2) for (let i = 0; i < 3; i++) { const k = (t * 1.6 + i / 3) % 1; c.circle(X.SYN + 6, c.lerp(YM1 - 20, YM2 + 20, k), 4, '#ff5a8a'); }
      if (S.dnp && S.H > 1) for (let i = 0; i < 3; i++) { const k = (t * 2 + i / 3) % 1; c.circle(680 + i * 50, c.lerp(YM1 - 10, YM2 + 10, k), 4, '#ff9a5a'); }
      /* 전자 */
      S.pairs.forEach(p => { const h = p.r[p.i], nx = p.r[p.i + 1]; const k = Math.min(1, p.t / .35); const x0 = X[h], x1 = nx === 'O2' ? X.IV + 30 : X[nx]; const yy = (k2 => YM1 + 50 + Math.sin(k2 * Math.PI) * -20)(k); p.x = c.lerp(x0, x1, k * .3); c.circle(p.x, yy, 9, '#7ff8ff', '#fff', 2); c.txt('e⁻', p.x, yy - 18, 12, '#7ff8ff'); });
      /* O₂ */
      c.ball(X.O2 + 40, YM2 + 70, 22, S.o2 ? '#ff5a5a' : '#553333'); c.txt(S.o2 ? 'O₂' : '산소 X', X.O2 + 40, YM2 + 70, 12, '#fff', 'center', 900);
      /* 에너지 계단 */
      const ex = 120, ey0 = YM2 + 140; const lv = [['NADH', 0], ['Ⅰ', .1], ['Q', .32], ['Ⅲ', .45], ['c', .6], ['Ⅳ', .72], ['O₂', 1]];
      c.txt('전자의 에너지 ↓', ex - 60, ey0 - 34, 12, '#9fe', 'left');
      lv.forEach(([l, v], i) => { const x = ex - 40 + i * 48, y = ey0 + v * 90; c.line([[x - 18, y], [x + 18, y]], '#7ff8ff88', 3); c.txt(l, x, y - 10, 10, '#cfe'); });
    }
    return { S, deliver, step, draw, X, YM1, YM2 };
  }

  /* ═════ 전자전달계와 화학 삼투 ═════ */
  def('etc', { ch: '전자전달계', t: '전자전달계 · H⁺ 댐', sub: '산화적 인산화 · 화학 삼투 · 최종 전자 수용체 O₂' }, c => {
    let fadTry = false;
    const E = etcEngine(c, { onPair: p => { c.float(`H⁺ ${p.pumped}개 퍼 올림`, 400, 140, '#ff8aa8');
        if (p.kind === 'NADH') c.hit('nadh', 'NADH의 고에너지 전자가 복합체 Ⅰ→Ⅲ→Ⅳ로 내려가며(에너지 높은 곳 → 낮은 곳) 나온 에너지로 <b>H⁺ 10개</b>를 <b>기질 → 막사이공간</b>으로 <b>능동 수송</b>해요 → 막사이공간 H⁺ 농도 높음(pH 낮음), 기질 H⁺ 낮음(pH 높음). NADH는 NAD⁺로 산화돼요.');
        if (p.kind === 'FADH2') c.hit('fad', 'FADH₂는 복합체 Ⅰ을 건너뛰고 Ⅱ로 들어와서 <b>H⁺를 6개만</b> 퍼 올려요 → NADH 1개 ≈ <b>2.5 ATP</b>, FADH₂ 1개 ≈ <b>1.5 ATP</b>.'); },
      onATP: () => { if (E.S.atp >= 3) c.hit('atp', '막사이공간에 쌓인 H⁺가 <b>ATP 합성 효소</b>를 통해 기질로 <b>확산</b>하면서 회전 → ADP + Pᵢ → ATP. 농도 기울기로 ATP를 만드는 것 = <b>화학 삼투</b> (H⁺ 약 4개 → ATP 1개).'); } });
    const S = E.S;
    const mk = (kind, x) => { const o = c.draggable({ x, y: 420, r: 30, kind, draw: (x, y) => tok(c, x, y, kind === 'NADH' ? 'NADH' : 'FADH₂', kind === 'NADH' ? '#2a6aff' : '#3ac08a', 28, '#fff'),
      can: () => kind === 'NADH' || c.isDone('atp'),
      onDrop: (x, y) => { const tx = kind === 'NADH' ? E.X.I : E.X.II; if (c.dist(x, y, tx, E.YM1 + 50) > 80) return false; if (!E.deliver(kind)) { c.float('복합체가 막혀서 못 받아요!', tx, E.YM1 - 20, '#ff8a6a');
          if (!S.o2 && c.isDone('fad')) c.hit('o2', '산소가 없으면 복합체 Ⅳ의 전자가 갈 곳이 없어 <b>전자전달계 전체가 멈춰요</b>. NADH가 전자를 못 넘기니 <b>NAD⁺·FAD가 재생되지 않아</b> TCA 회로·피루브산 산화도 멈춰요. 산소 = <b>최종 전자 수용체</b> → 물(H₂O)이 됨.'); return false; }
        c.float(kind === 'NADH' ? 'NADH → NAD⁺ + 2e⁻' : 'FADH₂ → FAD + 2e⁻', tx, E.YM1 - 20, '#8fc8ff'); return false; } }); o.bad = false; return o; };
    const tN = mk('NADH', 160), tF = mk('FADH2', 260);
    const o2 = c.toggle('산소 공급', true, v => { S.o2 = v; c.tip(v ? '' : '산소를 끊었어요 — NADH를 계속 넣어 봐요'); });
    let sum = null;
    c.goals([
      { id: 'nadh', t: '<b>NADH</b>를 복합체 Ⅰ에 넣고 전자를 따라가 보기', hint: '아래 파란 NADH를 막의 Ⅰ로' },
      { id: 'atp', t: 'H⁺ 댐으로 <b>ATP 3개</b> 만들기', hint: 'NADH를 몇 번 더 넣어 H⁺를 쌓아요' },
      { id: 'fad', t: '<b>FADH₂</b>도 넣어 보고 퍼 올린 H⁺ 수 비교하기', hint: '초록 FADH₂를 복합체 Ⅱ로' },
      { id: 'o2', t: '<b>산소</b>를 끊고 NADH를 계속 넣어 보기', hint: '패널의 「산소 공급」을 끄고 NADH 여러 번' },
      { id: 'sum', t: '포도당 1개 → ATP 최대 몇 개? 결산', hint: '패널의 결산 버튼' }]);
    c.readout(() => `막사이공간 H⁺ <b>${Math.round(S.H)}</b> · 만든 ATP <b>${S.atp}</b><br>쓴 O₂ <b>${S.o2used}</b> · 만든 물 <b>${S.o2used * 2}</b>`);
    c.loop((dt, t) => { E.step(dt); E.draw(dt, t);
      if (c.isDone('o2') && !sum) sum = c.button('32 ATP 결산', () => { c.hit('sum', '포도당 1개: 해당 과정 <b>2</b> + TCA 회로 <b>2</b> (기질 수준) + 산화적 인산화 <b>28</b> (NADH 10 × 2.5 + FADH₂ 2 × 1.5) = 최대 <b>32 ATP</b>.'); });
      c.tip(c.active() === 'nadh' ? 'NADH를 끌어 복합체 Ⅰ에 넣어요' : c.active() === 'atp' ? 'NADH를 더 넣어 H⁺를 쌓아요 — 합성 효소를 봐요' : c.active() === 'fad' ? 'FADH₂를 복합체 Ⅱ에! 몇 개 퍼 올릴까?' : c.active() === 'o2' ? (S.o2 ? '패널에서 산소를 끊어요' : 'NADH를 계속 넣어 봐요') : ''); });
    c.test = async () => { c.simDrop(tN, E.X.I, E.YM1 + 50); for (let i = 0; i < 8 && !c.isDone('nadh'); i++) await c.wait(.5); for (let i = 0; i < 30 && !c.isDone('atp'); i++) { c.simDrop(tN, E.X.I, E.YM1 + 50); await c.wait(.4); } c.simDrop(tF, E.X.II, E.YM1 + 50); for (let i = 0; i < 20 && !c.isDone('fad'); i++) await c.wait(.3); o2.set(false); for (let i = 0; i < 12; i++) { c.simDrop(tN, E.X.I, E.YM1 + 50); await c.wait(.4); } await c.wait(.2); sum && sum.click(); };
  });

  /* ═════ 독극물 사건 ═════ */
  def('poison', { ch: '전자전달계', t: '독극물 수사', sub: '사이안화물 · 올리고마이신 · DNP(짝풀림제)' }, c => {
    const E = etcEngine(c, {}); const S = E.S; let feed = 0, cur = null, since = 0, base = null;
    const hist = []; const IN = { cn: ['사이안화물', 'cn'], oligo: ['올리고마이신', 'oligo'], dnp: ['DNP', 'dnp'] };
    const B = {};
    Object.entries(IN).forEach(([k, [n]]) => { B[k] = c.button(n, () => apply(k), 'warn'); });
    c.button('해독 (정상으로)', () => apply(null));
    function apply(k) { if (k) { c.boom({ cn: '☠ 으악!!', oligo: '⛔ 꽉 막힘!', dnp: '💦 줄줄 샌다!' }[k], 500, 200, k === 'cn' ? '#ff5a5a' : '#ffd23f', 54, 1.2); c.shake(16); c.flash(k === 'cn' ? '#ff3030' : '#fff', .4); } cur = k; since = 0; S.cn = k === 'cn'; S.oligo = k === 'oligo'; S.dnp = k === 'dnp'; Object.entries(B).forEach(([q, b]) => b.classList.toggle('on', q === k)); if (!k) { S.pairs.length = 0; S.occ = {}; } }
    c.goals([
      { id: 'base', t: '정상 상태의 계기판(O₂ 소비 · ATP · 열) 지켜보기', hint: '5초 기다려요' },
      { id: 'cn', t: '<b>사이안화물</b>을 넣고 계기판 변화 보기' },
      { id: 'oligo', t: '<b>올리고마이신</b>을 넣고 계기판 변화 보기' },
      { id: 'dnp', t: '<b>DNP</b>를 넣고 계기판 변화 보기' }]);
    const arrow = (a, b) => b > a * 1.25 ? '<b style="color:#5aff9a">↑ 증가</b>' : b < a * .75 ? '<b style="color:#ff7a7a">↓ 감소</b>' : '비슷';
    c.readout(() => `O₂ 소비 <b>${S.rate.o2.toFixed(2)}</b>/초 · ATP <b>${S.rate.atp.toFixed(1)}</b>/초 · 열 <b>${S.rate.heat.toFixed(1)}</b><br>H⁺ 기울기 <b>${Math.round(S.H / S.HMAX * 100)}</b>%`);
    c.loop((dt, t) => { feed -= dt; if (feed <= 0) { feed = .15; E.deliver('NADH'); } E.step(dt); since += dt;
      if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) { hist.push([t, S.rate.o2, S.rate.atp, S.rate.heat]); if (hist.length > 120) hist.shift(); }
      E.draw(dt, t);
      /* 계기판 그래프 */
      const t0 = t - 30; c.graph([660, 360, 290, 170], { x0: t0, x1: t, y0: 0, y1: 4, yl: '최근 30초' }, [{ pts: hist.map(h => [h[0], h[1] * 1.5]), col: '#ff5a5a' }, { pts: hist.map(h => [h[0], h[2]]), col: '#ffd23f' }, { pts: hist.map(h => [h[0], h[3] / 4]), col: '#ff9a3c', dash: [5, 4] }]);
      c.txt('빨강 O₂ 소비 · 노랑 ATP · 주황 점선 열', 805, 555, 11, '#cfe');
      if (!cur && since > 5) { base = { ...S.rate }; c.hit('base', '정상일 때: NADH의 전자가 O₂까지 흐르며 H⁺를 퍼 올리고, ATP 합성 효소가 그 기울기로 ATP를 만들어요. 이제 독을 하나씩 넣어 봐요.'); }
      if (cur && base && since > 6) { const a = `O₂ 소비 ${arrow(base.o2, S.rate.o2)} · ATP ${arrow(base.atp, S.rate.atp)}`;
        if (cur === 'cn') c.hit('cn', `<b>사이안화물</b>: 복합체 Ⅳ에서 전자가 <b>O₂로 못 가게</b> 막아요 → 전자 전달 정지. ${a}. 빨리 죽는 이유!`);
        if (cur === 'oligo') c.hit('oligo', `<b>올리고마이신</b>: <b>ATP 합성 효소</b>의 H⁺ 통로를 막아요 → H⁺가 꽉 차서 더 못 퍼 올리니 전자 전달도 느려져요. ${a}.`);
        if (cur === 'dnp') c.hit('dnp', `<b>DNP(짝풀림제)</b>: 내막에 H⁺가 새는 구멍을 내서 <b>농도 기울기를 없애요</b> → ATP ↓, 전자 전달은 오히려 빨라져 <b>O₂ 소비 ↑</b>, 에너지는 <b>열</b>로 방출. ${a}.`); }
      c.tip(!c.isDone('base') ? '정상 상태 계기판을 잠깐 지켜봐요' : cur ? `${IN[cur][0]} 투입 — 계기판을 봐요 (${Math.max(0, 6 - since).toFixed(0)}초)` : '패널에서 독을 하나 골라 넣어요');
    });
    c.test = async () => { await c.wait(5.5); for (const k of ['cn', 'oligo', 'dnp']) { apply(null); await c.wait(3); apply(k); await c.wait(6.5); } };
  });

  /* ═════ 발효 ═════ */
  def('ferm', { ch: '발효', t: '산소가 끊긴 세포', sub: 'NAD⁺ 재생 · 젖산 발효 · 알코올 발효' }, c => {
    let o2 = true, nad = 6, nadh = 0, pyr = 0, atp = 0, gT = 0, mode = 'mus', manual = { mus: 0, yst: 0 }, auto = { mus: false, yst: false }, co2 = 0, koh = false, stopT = 0, atpLog = [], prodL = 0, prodE = 0, phase = 1;
    const orbit = [];
    c.goals([
      { id: 'stop', t: '<b>산소</b>를 끊고 해당 과정이 어떻게 되는지 보기', hint: '패널의 「산소 공급」 끄기' },
      { id: 'lac', t: '근육 세포: 피루브산을 <b>젖산 발효</b> 장치에 넣어 해당 과정 살리기 (3번)', hint: '노란 피루브산 덩어리를 아래 장치로' },
      { id: 'alc', t: '효모로 바꿔 <b>알코올 발효</b> 3번 — 풍선을 봐요', hint: '패널에서 「효모」 선택' },
      { id: 'koh', t: '효모 <b>발효관</b> 맹관부에 모인 기체에 <b>KOH</b>를 넣어 정체 밝히기', hint: '패널 버튼' },
      { id: 'food', t: '음식을 발효 종류별로 나누기', hint: '음식 카드를 두 항아리에' }]);
    const o2t = c.toggle('산소 공급', true, v => { o2 = v; });
    const ms = c.seg('세포', [['mus', '근육 세포'], ['yst', '효모']], 'mus', v => { mode = v; });
    let kohK = 0; const kb = c.button('발효관에 KOH 수용액 넣기', () => { if (koh) return; if (co2 < 3) { c.float('먼저 효모 발효관에 기체를 모아요', 860, 300, '#9fe'); return; } koh = true; c.tween(1.6, k => kohK = k, () => c.hit('koh', '<b>KOH</b>는 CO₂를 흡수해요. KOH를 넣자 맹관부에 모인 기체가 줄었으니 → 효모의 알코올 발효로 생긴 기체는 <b>CO₂</b>. (발효관 냄새 = 에탄올)')); });
    c.readout(() => `NAD⁺ <b>${nad}</b> · NADH <b>${nadh}</b> · 피루브산 <b>${pyr}</b><br>최근 ATP <b>${atpLog.filter(x => x > c.t - 4).length}</b>개/4초${o2 ? ' + 산소 호흡' : ''}`);
    const pyT = c.draggable({ x: 270, y: 330, r: 40, draw: (x, y) => { if (pyr <= 0 && !pyT.held) return; c.ball(x, y, 26, '#ffd23f'); c.txt('피루브산', x, y, 11, '#04101a', 'center', 900); },
      can: () => pyr > 0 && !o2,
      onDrop: (x, y) => { if (c.dist(x, y, 470, 480) > 90) return false; if (nadh <= 0) { c.float('NADH가 없어요', 470, 420, '#9fe'); return false; } ferment(true); return false; } }); pyT.bad = false;
    function ferment(byHand) { pyr--; nadh--; nad++; if (mode === 'yst') { co2++; prodE++; c.float('CO₂ ↑ → 아세트알데하이드 → 에탄올', 470, 410, '#c0c8d0'); } else { prodL++; c.float('피루브산 + NADH → 젖산 + NAD⁺', 470, 410, '#ffe9a0'); } c.fx(470, 480, mode === 'yst' ? '#c0c8d0' : '#ffe9a0', 14);
      if (byHand) { manual[mode]++; c.beep('ok'); if (manual[mode] >= 3) { auto[mode] = true;
          if (mode === 'mus') c.hit('lac', '<b>젖산 발효</b>: 피루브산이 NADH의 수소를 받아 <b>젖산</b>이 되며 <b>NAD⁺가 재생</b>돼요 → 해당 과정이 다시 돌아 ATP를 얻어요. 발효의 의의 = <b>NAD⁺ 재생</b>! 하지만 포도당 1개당 <b>2 ATP</b>뿐 (산소 호흡은 32).');
          else c.hit('alc', '<b>알코올 발효</b>(효모): 피루브산 → <b>CO₂ 방출</b> → 아세트알데하이드 → NADH를 받아 <b>에탄올</b>. 젖산 발효는 CO₂가 안 나와요. 효모는 산소가 있으면 산소 호흡, 없으면 알코올 발효.'); } } }
    const foods = [['김치', 'L'], ['요구르트', 'L'], ['치즈', 'L'], ['빵', 'A'], ['막걸리', 'A'], ['맥주', 'A']], F = [];
    function phase2() { phase = 2; foods.forEach(([n, k], i) => F.push(c.draggable({ x: 120 + i * 150, y: 120, r: 36, n, k, ok: false, draw: (x, y, o) => { c.rr(x - 46, y - 20, 92, 40, 12, o.ok ? '#2a6a4a' : '#0e2b3a', '#ffe9a0', 2); c.txt(o.n, x, y, 15, '#fff'); },
      can: () => !F[i].ok, onDrop: (x, y) => { const o = F[i]; const j = x < 500 ? 'L' : 'A'; if (y < 300) return false; if (j !== o.k) { c.float(o.k === 'L' ? '이건 젖산균!' : '이건 효모!', x, y - 30, '#ff8a6a'); return false; } o.ok = true; o.hx = x; o.hy = y; c.beep('ok');
        if (F.every(q => q.ok)) c.hit('food', '<b>젖산 발효</b>: 김치·요구르트·치즈 · <b>알코올 발효</b>: 빵(CO₂로 부풂)·막걸리·맥주. 근육에서 산소가 부족하면 젖산 발효가 일어나요.'); return true; } }))); }
    c.loop((dt, t) => {
      /* 해당 과정 */
      gT -= dt; if (gT <= 0 && nad >= 2) { gT = 1; nad -= 2; nadh += 2; pyr += 2; atp += 2; atpLog.push(c.t, c.t); c.float('+2 ATP', 150, 160, '#ffd23f'); }
      if (o2 && nadh > 0) { orbit.push({ t: 0 }); nadh--; setTimeout(() => { nad++; }, 900); } if (o2 && pyr > 0) pyr = Math.max(0, pyr - 1);
      if (!o2 && auto[mode] && pyr > 0 && nadh > 0 && Math.random() < dt * 3) ferment(false);
      if (!o2 && nad < 2 && pyr > 0 && nadh > 0 && !auto[mode]) { stopT += dt; if (stopT > 1.5) c.hit('stop', '산소가 없으면 전자전달계가 멈춰 <b>NADH가 쌓이고 NAD⁺가 바닥</b>나요 → 해당 과정의 PGAL 산화 단계가 멈춰서 <b>해당 과정까지 정지</b>, ATP를 못 만들어요.'); } else stopT = 0;
      c.rr(20, 60, 640, 360, 18, '#1a2a20', '#ffffff18', 1); c.txt(mode === 'mus' ? '근육 세포 — 세포질' : '효모 — 세포질', 120, 84, 14, '#ffb3d0');
      const run = gT > .7 && nad >= 0; c.rr(90, 160, 220, 80, 16, '#3a2a40', run ? '#ffb3d0' : '#555', 3); c.txt('해당 과정', 200, 190, 18, '#fff'); c.txt('포도당 → 피루브산 2', 200, 216, 12, '#ffd0e0');
      c.txt('NAD⁺ 창고', 200, 270, 13, '#8fc8ff'); for (let i = 0; i < Math.min(nad, 12); i++) c.rr(90 + (i % 6) * 38, 282 + Math.floor(i / 6) * 26, 32, 20, 6, '#8fb8ff');
      if (nad < 2) c.txt('NAD⁺ 부족!', 200, 350, 16, '#ff8a8a');
      c.txt('NADH', 420, 150, 13, '#4a8aff'); for (let i = 0; i < Math.min(nadh, 16); i++) c.rr(370 + (i % 4) * 26, 162 + Math.floor(i / 4) * 22, 22, 18, 5, '#2a6aff');
      c.txt('피루브산', 560, 150, 13, '#ffd23f'); for (let i = 0; i < Math.min(pyr, 16); i++) c.circle(530 + (i % 4) * 22, 170 + Math.floor(i / 4) * 22, 9, '#ffd23f');
      if (!pyT.held) { pyT.x = pyT.hx = 560; pyT.y = pyT.hy = 330; }
      /* 마이토콘드리아 */
      c.rr(680, 70, 290, 150, 70, o2 ? '#4a3010' : '#2a2018', o2 ? '#ffb070' : '#665', 3); c.txt(o2 ? '마이토콘드리아 (산소 호흡)' : '산소 없음 — 멈춤', 825, 145, 14, o2 ? '#ffe9a0' : '#998');
      for (let i = orbit.length - 1; i >= 0; i--) { const q = orbit[i]; q.t += dt; if (q.t > .9) { orbit.splice(i, 1); continue; } c.rr(c.lerp(450, 760, q.t / .9) - 12, 160 - Math.sin(q.t / .9 * 3.14) * 60, 24, 16, 5, '#2a6aff'); }
      /* 발효 장치 */
      c.rr(330, 440, 280, 90, 16, '#2a2a10', '#ffe9a0', 2); c.txt(mode === 'mus' ? '젖산 발효 장치' : '알코올 발효 장치', 470, 470, 16, '#ffe9a0'); c.txt(mode === 'mus' ? '피루브산 + NADH → 젖산 + NAD⁺' : '피루브산 → CO₂ + 아세트알데하이드 → 에탄올', 470, 500, 11, '#cfe');
      if (auto[mode] && !o2) c.txt('자동 작동 중', 470, 548, 12, '#5aff9a');
      c.txt(`젖산 ${prodL} · 에탄올 ${prodE}`, 470, 575, 13, '#cfe');
      /* 발효관: 맹관부(막힌 쪽)에 기체가 모임 */
      const tx = 880, gas = Math.min(150, co2 * 12) * (1 - kohK);
      c.rr(tx - 16, 300, 32, 200, 16, '#ffe9a033', '#9fe', 2); c.rr(tx + 16, 470, 70, 30, 12, '#ffe9a033', '#9fe', 2); c.rr(tx + 56, 400, 30, 80, 10, '#ffe9a033', '#9fe', 2);
      if (gas > 0) c.rr(tx - 13, 303, 26, gas, 12, '#ffffffcc');
      c.txt('맹관부', tx - 50, 320, 12, '#cfe', 'right'); c.txt(koh ? '+ KOH' : '효모 + 포도당', tx + 30, 520, 12, '#cfe'); if (gas > 0) c.txt('기체', tx, 303 + gas / 2, 11, '#04101a');
      if (phase === 2) { c.rr(40, 310, 440, 130, 16, '#2a2a10ee', '#ffe9a0', 2); c.txt('젖산 발효 항아리', 260, 330, 15, '#ffe9a0'); c.rr(520, 310, 440, 130, 16, '#2a1a2aee', '#ffaacc', 2); c.txt('알코올 발효 항아리', 740, 330, 15, '#ffaacc'); }
      if (c.isDone('koh') && phase === 1) phase2();
      c.tip(c.active() === 'stop' ? '패널에서 산소를 끊고 NAD⁺ 창고를 봐요' : c.active() === 'lac' ? (o2 ? '산소를 끊은 상태에서 해요' : '피루브산을 끌어 아래 장치로 (NADH도 같이 쓰여요)') : c.active() === 'alc' ? (mode === 'mus' ? '패널에서 「효모」로 바꿔요' : '피루브산을 알코올 발효 장치로!') : c.active() === 'food' ? '음식 카드를 맞는 항아리에' : '');
    });
    c.test = async () => { o2t.set(false); for (let i = 0; i < 40 && !c.isDone('stop'); i++) await c.wait(.25); for (let i = 0; i < 3; i++) { c.simDrop(pyT, 470, 480); await c.wait(.3); } ms.set('yst'); for (let i = 0; i < 3; i++) { while (pyr <= 0 || nadh <= 0) await c.wait(.2); c.simDrop(pyT, 470, 480); await c.wait(.2); } await c.wait(1.5); kb.click(); await c.wait(2); F.forEach(o => c.simDrop(o, o.k === 'L' ? 260 : 740, 380)); };
  });

  /* ═════ 영양소의 호흡 경로 ═════ */
  def('subs', { ch: '종합', t: '영양소는 어디로?', sub: '탄수화물 · 지방 · 단백질의 세포호흡 경로' }, c => {
    const NODE = { glu: [760, 100, '포도당'], pgal: [760, 190, '해당 과정 (PGAL)'], pyr: [760, 280, '피루브산'], acoa: [760, 370, '아세틸 CoA'], tca: [760, 470, 'TCA 회로'] };
    const OK = { 포도당: ['glu'], 글리세롤: ['pgal'], 지방산: ['acoa'], 유기산: ['pyr', 'acoa', 'tca'] };
    const placed = { 포도당: 0, 글리세롤: 0, 지방산: 0, 유기산: 0 }; let nh3 = 0, urea = 0;
    const units = [];
    const unit = (n, x, y, col) => { const o = c.draggable({ x, y, r: 30, n, col, draw: (x, y, o) => { c.rr(x - 44, y - 17, 88, 34, 12, o.col, '#04101a', 2); c.txt(o.n, x, y, 13, '#04101a', 'center', 900); },
      onDrop: (x, y) => { if (o.n === '아미노산') { if (c.dist(x, y, 200, 470) < 80) { o.off = true; c.remove(o); nh3++; c.float('NH₃ 떨어짐 → 간에서 요소로', 200, 400, '#9fe'); setTimeout(() => urea++, 900); units.push(unit('유기산', 330, 470, '#ffb3d0')); return true; } if (x > 600) c.float('먼저 아미노기를 떼야 해요 (탈아미노)', x, y - 30, '#ff8a6a'); return false; }
        const k = Object.entries(NODE).find(([k, p]) => c.dist(x, y, p[0], p[1]) < 60); if (!k) return false; if (!OK[o.n].includes(k[0])) { c.float('여기로는 못 들어가요', x, y - 30, '#ff8a6a'); return false; }
        o.off = true; c.remove(o); placed[o.n]++; c.fx(k[1][0], k[1][1], o.col, 18); c.beep('ok'); check(); return true; } }); return o; };
    const foods = [['녹말', '#ffb3d0', [['포도당', '#ffb3d0']]], ['지방', '#ffe9a0', [['글리세롤', '#ffd28a'], ['지방산', '#ffe9a0']]], ['단백질', '#c08aff', [['아미노산', '#d8b0ff']]]];
    const F = foods.map(([n, col, out], i) => { const o = c.draggable({ x: 90, y: 110 + i * 100, r: 36, draw: (x, y) => { c.rr(x - 50, y - 22, 100, 44, 14, col, '#04101a', 2); c.txt(n, x, y, 16, '#04101a', 'center', 900); },
      onDrop: (x, y) => { if (c.dist(x, y, 290, 200) > 90) return false; o.off = true; c.remove(o); c.fx(290, 200, col, 20); out.forEach(([u, uc], j) => units.push(unit(u, 330 + j * 100, 310 + i * 0, uc))); c.float('소화!', 290, 140); return true; } }); return o; });
    function check() { if (placed.포도당) c.hit('carb', '<b>탄수화물</b>: 녹말 → <b>포도당</b> → 해당 과정 → 피루브산 → 아세틸 CoA → TCA 회로.');
      if (placed.글리세롤 && placed.지방산) c.hit('fat', '<b>지방</b> → <b>글리세롤</b>(해당 과정으로) + <b>지방산</b>(β 산화로 <b>아세틸 CoA</b>가 되어 TCA 회로로). 지방은 같은 질량에서 에너지가 가장 많아요.');
      if (placed.유기산) c.hit('pro', '<b>단백질</b> → <b>아미노산</b> → 아미노기가 떨어져(<b>탈아미노</b>) <b>암모니아</b>(간에서 요소로) → 나머지는 피루브산·아세틸 CoA·TCA 회로로. 호흡률(CO₂/O₂): 탄수화물 1, 단백질 약 0.8, 지방 약 0.7.'); }
    c.goals([
      { id: 'carb', t: '<b>녹말</b>을 소화해 맞는 입구로 보내기', hint: '음식을 가운데 소화 기관에 → 나온 조각을 오른쪽 경로에' },
      { id: 'fat', t: '<b>지방</b>을 소화해 두 조각을 각자 입구로', hint: '글리세롤과 지방산은 들어가는 곳이 달라요' },
      { id: 'pro', t: '<b>단백질</b>을 소화해 세포호흡에 넣기', hint: '아미노산은 그대로 못 들어가요 — 왼쪽 아래 장치?' }]);
    c.readout(() => `암모니아 <b>${nh3}</b> → 요소 <b>${urea}</b>`);
    c.loop((dt, t) => {
      c.rr(220, 150, 140, 100, 20, '#2a3a2a', '#9fe', 2); c.txt('소화', 290, 190, 18, '#dff'); c.txt('(큰 분자 → 작은 단위)', 290, 216, 11, '#cfe');
      c.rr(130, 430, 140, 80, 16, '#2a2a3a', '#c08aff', 2); c.txt('탈아미노', 200, 462, 15, '#d8b0ff'); c.txt('아미노기 떼기', 200, 486, 11, '#cfe');
      c.rr(130, 540, 140, 44, 12, '#1a2a3a', '#9fe', 1); c.txt(`간: 요소 ${urea}`, 200, 562, 13, '#cfe');
      const L = Object.values(NODE); for (let i = 0; i < L.length - 1; i++) c.arrow(L[i][0], L[i][1] + 22, L[i + 1][0], L[i + 1][1] - 24, '#ffffff55', 3, 10);
      L.forEach(([x, y, n]) => { c.rr(x - 90, y - 22, 180, 44, 14, '#0e2b3a', '#5af0ff88', 2); c.txt(n, x, y, 14, '#dff'); });
      c.arrow(760, 494, 760, 560, '#ffffff55', 3); c.txt('전자전달계 → ATP', 760, 576, 14, '#5af0ff');
      c.tip(units.some(u => !u.off) ? '나온 조각을 오른쪽 경로의 맞는 칸에 놓아요' : '왼쪽 음식을 가운데 「소화」로 끌어요');
    });
    c.test = async () => { F.forEach(o => c.simDrop(o, 290, 200)); const go = (n, k) => { const u = units.find(q => q.n === n && !q.off); u && c.simDrop(u, NODE[k][0], NODE[k][1]); }; go('포도당', 'glu'); go('글리세롤', 'pgal'); go('지방산', 'acoa'); const a = units.find(q => q.n === '아미노산'); c.simDrop(a, 200, 470); go('유기산', 'tca'); };
  });
})();
