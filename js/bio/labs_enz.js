'use strict';
/* 효소 단원 실험실 */
(() => {
  const { def } = window.LAB;

  /* ═════ 1. 에너지 언덕: 활성화 에너지 · 반응열 · 효소 ═════ */
  def('ea', { ch: '효소', t: '에너지 언덕', sub: '활성화 에너지 · 반응열 · 효소의 역할' }, c => {
    const X0 = 70, X1 = 640, ey = e => 530 - e * 4, sx = s => X0 + s * (X1 - X0);
    const st = { R: 40, P: 10, K: 100, enz: false, kT: 11 };
    const sstep = k => { k = c.clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const peakNow = () => st.enz ? Math.max(st.R, st.P) + (st.K - Math.max(st.R, st.P)) * .4 : st.K;
    const curve = (s, pk) => { const b = st.R + (st.P - st.R) * sstep((s - .38) / .24); return b + (pk - (st.R + st.P) / 2) * Math.exp(-(((s - .5) / .11) ** 2)); };
    const N = 16, M = []; for (let i = 0; i < N; i++) M.push({ s: c.rnd(.04, .28), side: 'r', hop: 0, hopE: 0, next: c.rnd(0, .4), col: '#ff9a3c' });
    let grab = null, spontaneous = 0, enzCross = 0, toggles = 0, handle = null, manual = 0;
    const log = [];
    c.goals([
      { id: 'push', t: '반응물 분자 하나를 손으로 끌어 언덕을 넘겨 보기', hint: '왼쪽 골짜기의 주황 분자를 잡고 오른쪽으로 끌어 올려요' },
      { id: 'enz', t: '효소를 켜고 저절로 넘어가는 분자 지켜보기', hint: '오른쪽 패널의 「효소 넣기」' },
      { id: 'same', t: '효소를 켜고 끄면서 <b>변하지 않는</b> 괄호를 눌러 보기', hint: '그래프 위 두 괄호 중 하나를 탭' },
      { id: 'endo', t: '생성물 높이를 끌어 올려 <b>흡열 반응</b> 만들기', hint: '오른쪽 ◆ 손잡이를 위로' },
      { id: 'num', t: '효소 없이 <b>활성화 에너지 50 · 반응열 30 방출</b> 반응 만들기', hint: '◆ 손잡이 3개(반응물·꼭대기·생성물)를 끌어 맞춰요 (5 단위로 붙음)' }]);
    const tg = c.toggle('효소 넣기', false, v => { st.enz = v; toggles++; c.tip(v ? '효소: 꼭대기만 낮아졌어요 — 양 끝 높이는?' : '효소 없음'); });
    c.readout(() => { const ea = peakNow() - st.R, dh = st.R - st.P; const rate = log.filter(t => t > c.t - 5).length / 5;
      return `활성화 에너지 <b>${Math.round(ea)}</b> ${st.enz ? `<small>(효소 없을 때 ${st.K - st.R})</small>` : ''}<br>반응열 <b>${Math.abs(dh)}</b> ${dh > 0 ? '방출 (발열)' : dh < 0 ? '흡수 (흡열)' : ''}<br>저절로 넘는 속도 <b>${rate.toFixed(1)}</b> 개/초`; });
    const HAND = () => [['R', .12, st.R], ['K', .5, st.K], ['P', .88, st.P]];
    c.onDown = (x, y) => {
      if (!c.isDone('push')) { const m = M.filter(m => m.side === 'r' && !m.cross).sort((a, b) => c.dist(sx(a.s), ey(curve(a.s, peakNow())) - 12, x, y) - c.dist(sx(b.s), ey(curve(b.s, peakNow())) - 12, x, y))[0];
        if (m && c.dist(sx(m.s), ey(curve(m.s, peakNow())) - 12, x, y) < 50) { grab = m; m.held = true; c.beep('pick'); return true; } }
      for (const [k, s, v] of HAND()) if (c.dist(sx(s), ey(v), x, y) < 34) { handle = k; c.beep('pick'); return true; }
      const m = M.filter(m => m.side === 'r' && !m.cross).find(m => c.dist(sx(m.s), ey(curve(m.s, peakNow())) - 12, x, y) < 30); if (m) { grab = m; m.held = true; return true; }
    };
    c.onMove = (x, y) => {
      if (grab) { grab.s = c.clamp((x - X0) / (X1 - X0), .02, .98); return; }
      if (handle) { const v = Math.round(c.clamp((530 - y) / 4, 0, 100) / 5) * 5;
        if (handle === 'R') st.R = c.clamp(v, 5, st.K - 10); if (handle === 'P') st.P = c.clamp(v, 5, st.K - 10); if (handle === 'K') st.K = c.clamp(v, Math.max(st.R, st.P) + 10, 100); check(); }
    };
    c.onUp = () => { if (grab) { const m = grab; grab = null; m.held = false; if (m.s > .62) { m.side = 'p'; m.col = '#5af0ff'; manual++; c.fx(sx(m.s), ey(curve(m.s, peakNow())), '#5af0ff', 18); c.beep('ok');
          if (c.hit('push', `반응이 일어나려면 꼭대기를 넘어야 해요. 넘는 데 필요한 <b>최소한의 에너지 = 활성화 에너지</b> = 꼭대기 − <b>반응물</b>의 에너지 (바닥 0부터 재지 않아요).`)) c.tip('이제 「효소 넣기」를 눌러 봐요'); }
        else { const s0 = m.s; m.cross = true; c.tween(.5, k => m.s = c.lerp(s0, .16, c.ease(k)), () => m.cross = false); c.tip('꼭대기를 넘지 못하면 다시 굴러 내려와요'); } }
      handle = null; };
    c.onTap = (x, y) => { if (!c.isDone('enz') || c.isDone('same')) return;
      const yR = ey(st.R), yP = ey(st.P), yK = ey(peakNow());
      if (x > 650 && x < 760 && y > Math.min(yR, yP) - 20 && y < Math.max(yR, yP) + 20) { if (toggles < 2) { c.tip('효소를 한 번 더 켜고/꺼 보고 눌러요'); return; } c.hit('same', '효소는 <b>꼭대기(활성화 에너지)만</b> 낮춰요. 반응물·생성물 높이는 그대로 → <b>반응열은 변하지 않아요</b>.'); }
      else if (x > sx(.18) - 40 && x < sx(.18) + 50 && y > yK - 10 && y < yR + 10) { c.beep('bad'); c.float('이 괄호는 효소에 따라 변해요!', x, y, '#ff8a6a'); } };
    function check() {
      if (st.P > st.R) c.hit('endo', `생성물이 반응물보다 높으면 에너지를 <b>흡수</b> = <b>흡열</b> 반응 → 작은 분자로 큰 분자를 만드는 <b>동화 작용</b>(광합성). 반대로 낮아지면 <b>발열</b> = <b>이화 작용</b>(세포호흡, 소화). 생명체의 모든 화학 반응 = <b>물질대사</b>.`);
      if (c.isDone('endo') && !st.enz && st.K - st.R === 50 && st.R - st.P === 30) c.hit('num', '활성화 에너지 = 꼭대기 − 반응물 = 50, 반응열 = 반응물 − 생성물 = 30 (방출). 꼭대기 높이는 반응열과 <b>상관없어요</b>.');
    }
    c.loop((dt, t) => {
      const g = c.g, pk = peakNow();
      /* 축 */
      c.line([[X0 - 20, 110], [X0 - 20, 530], [X1 + 20, 530]], '#cfe', 2); c.txt('에너지', X0 - 20, 96, 13, '#cfe'); c.txt('반응의 진행 →', X1 - 40, 552, 13, '#cfe');
      /* 효소 없을 때 곡선 (효소 있으면 점선) */
      const pts = k => Array.from({ length: 81 }, (_, i) => [sx(i / 80), ey(curve(i / 80, k))]);
      c.line(pts(st.K), st.enz ? '#ff7a5a66' : '#ff9a5a', st.enz ? 2 : 4, st.enz ? [8, 8] : null);
      if (st.enz) c.line(pts(pk), '#5af0ff', 4);
      /* 반응물·생성물 표시 */
      c.txt('반응물', sx(.12), ey(st.R) + 22, 14, '#ffb37a'); c.txt('생성물', sx(.88), ey(st.P) + 22, 14, '#8fe9ff');
      /* 괄호: 활성화 에너지 */
      const bx = sx(.2); c.line([[bx, ey(st.R)], [bx, ey(pk)]], '#ffd23f', 3); c.line([[bx - 8, ey(st.R)], [bx + 8, ey(st.R)]], '#ffd23f', 3); c.line([[bx - 8, ey(pk)], [bx + 8, ey(pk)]], '#ffd23f', 3);
      c.line([[bx, ey(pk)], [sx(.5), ey(pk)]], '#ffd23f55', 1.5, [4, 5]); c.label(`활성화 에너지 ${Math.round(pk - st.R)}`, bx, (ey(st.R) + ey(pk)) / 2, '#ffd23f', 13);
      /* 괄호: 반응열 */
      const hx = 705; c.line([[sx(.12), ey(st.R)], [hx + 10, ey(st.R)]], '#ffffff44', 1.5, [4, 5]); c.line([[sx(.88), ey(st.P)], [hx + 10, ey(st.P)]], '#ffffff44', 1.5, [4, 5]);
      if (st.R !== st.P) { c.arrow(hx, ey(st.R), hx, ey(st.P), st.P < st.R ? '#ff6a8a' : '#6ab0ff', 3, 10); c.label(`반응열 ${Math.abs(st.R - st.P)} ${st.P < st.R ? '방출' : '흡수'}`, hx + 75, (ey(st.R) + ey(st.P)) / 2, st.P < st.R ? '#ff8aa8' : '#8ac8ff', 13); }
      /* 손잡이 */
      HAND().forEach(([k, s, v]) => { const x = sx(s), y = ey(v); c.poly([[x, y - 11], [x + 11, y], [x, y + 11], [x - 11, y]], handle === k ? '#fff' : '#ffd23f', '#04101a', 2); });
      /* 분자 */
      M.forEach(m => {
        if (m.side === 'r' && !m.held && !m.cross) { m.next -= dt; m.s += Math.sin(t * 3 + m.hopE) * .0006;
          if (m.next <= 0 && c.isDone('push')) { m.next = c.rnd(.25, .45); const e = -st.kT * Math.log(Math.random() + 1e-9);
            if (st.R + e >= pk) { m.cross = true; const s0 = m.s; c.tween(.9, k => m.s = c.lerp(s0, c.rnd(.8, .95), c.ease(k)), () => { m.cross = false; m.side = 'p'; m.col = '#5af0ff'; log.push(c.t); spontaneous++; if (st.enz) enzCross++;
              if (st.enz && enzCross >= 4) c.hit('enz', '효소를 넣자 언덕이 낮아져 <b>체온에서도</b> 많은 분자가 넘어가요. 효소 = 활성화 에너지를 낮춰 반응을 빠르게 하는 <b>생체 촉매</b> (주성분 단백질).'); }); }
            else { m.hop = 1; m.hopE = Math.min(e, pk - st.R - 2); } } }
        if (m.side === 'p' && !m.cross) { m.s = c.clamp(m.s + Math.sin(t * 2 + m.hopE) * .0005, .74, .97); }
        m.hop = Math.max(0, m.hop - dt * 2.6);
        let y = ey(curve(m.s, pk)) - 11; if (m.hop > 0 && m.side === 'r') { const k = Math.sin(m.hop * Math.PI); const s = m.s + k * .12 * (m.hopE / 60); y = ey(Math.min(curve(s, pk), st.R + m.hopE * k)) - 11; c.ball(sx(s), y, 10, m.col); return; }
        c.ball(sx(m.s), y, m.held ? 13 : 10, m.col); });
      /* 반응물이 다 넘어가면 다시 채우기 */
      const reac = M.filter(m => m.side === 'r').length; if (reac < 4) M.filter(m => m.side === 'p' && !m.cross).slice(0, 6).forEach(m => { m.side = 'r'; m.col = '#ff9a3c'; m.s = c.rnd(.04, .26); });
      if (grab) { const need = Math.max(0, curve(grab.s, pk) - st.R); c.label(`올린 에너지 ${Math.round(need)}`, sx(grab.s), ey(curve(grab.s, pk)) - 46, '#fff', 14); }
      if (st.enz) { c.circle(sx(.5), ey(pk) - 40, 18, '#2a8a7a', '#5affd0', 2); c.txt('효소', sx(.5), ey(pk) - 40, 12, '#fff'); }
      if (!c.isDone('push') && !grab) c.tip('왼쪽 주황 분자 하나를 끌어 언덕 너머로!');
    });
    c.test = async () => { const m = M[0]; c.onDown(sx(m.s), ey(curve(m.s, peakNow())) - 12); c.onMove(sx(.8), 300); c.onUp(); tg.set(true); toggles = 2; for (let i = 0; i < 80 && !c.isDone('enz'); i++) await c.wait(.1); tg.set(false); tg.set(true); c.onTap(705, (ey(st.R) + ey(st.P)) / 2); tg.set(false); st.P = 60; check(); st.K = 90; st.R = 40; st.P = 10; check(); };
  });

  /* ═════ 2. 자물쇠와 열쇠: 기질 특이성 · 효소·기질 복합체 · 재사용 ═════ */
  def('lock', { ch: '효소', t: '효소의 입 모양', sub: '기질 특이성 · 효소·기질 복합체 · 재사용' }, c => {
    const EX = 500, EY = 360, SX = 500, SY = 262; /* 효소 중심, 활성 부위 */
    const SH = ['tri', 'sq', 'circ'], COL = { tri: '#ff8a5a', sq: '#ffd23f', circ: '#c08aff' };
    let busy = 0, done = 0, wrong = 0, bound = null, spin = 0;
    const shape = (k, x, y, r, fill, stroke) => { if (k === 'circ') c.circle(x, y, r, fill, stroke); else if (k === 'sq') c.rr(x - r, y - r, r * 2, r * 2, 4, fill, stroke); else c.poly([[x, y - r * 1.1], [x + r * 1.1, y + r * .8], [x - r * 1.1, y + r * .8]], fill, stroke); };
    const subs = [];
    function spawn(k, i) { const a = c.rnd(0, 6.28), o = c.draggable({ x: 0, y: 0, r: 30, k, vx: c.rnd(-30, 30), vy: c.rnd(-30, 30),
        draw: (x, y, o) => { shape(o.k, x, y, 22, COL[o.k], '#04101a'); c.txt(o.k === 'sq' ? '설탕 (기질)' : '다른 기질', x, y + 36, 11, '#cfe'); },
        onDrop: (x, y) => { if (c.dist(x, y, SX, SY) > 70) return false; if (busy > 0) { c.float('효소가 일하는 중', x, y - 30, '#9fe'); return false; }
          if (o.k !== 'sq') { wrong++; c.float('모양이 안 맞아 결합 X', x, y - 34, '#ff7a6a'); c.fx(SX, SY, '#ff5a5a', 10); c.hit('wrong', '효소는 <b>활성 부위</b>와 입체 구조가 맞는 기질과만 결합해요 = <b>기질 특이성</b> (열쇠와 자물쇠). 그래서 효소마다 하는 일이 정해져 있어요.'); return false; }
          bind(o); return true; } });
      const side = i % 4; o.x = o.hx = side === 0 ? 60 : side === 1 ? 940 : c.rnd(80, 920); o.y = o.hy = side === 2 ? 70 : side === 3 ? 560 : c.rnd(80, 540); subs.push(o); return o; }
    SH.forEach(k => { spawn(k, 0); spawn(k, 1); spawn(k, 2); });
    function bind(o) { o.off = true; c.remove(o); subs.splice(subs.indexOf(o), 1); bound = { k: o.k, t: 0 }; busy = 1.3; c.beep('ok');
      c.tween(1.3, k => { bound.t = k; }, () => { c.fx(SX, SY - 10, '#ffd23f', 24); bound = null; done++; c.float('생성물 2개!', SX, SY - 60);
        prods.push({ x: SX - 10, y: SY - 20, vx: -120, vy: -80, t: 0, n: '포도당' }, { x: SX + 10, y: SY - 20, vx: 120, vy: -80, t: 0, n: '과당' });
        if (done === 1) c.hit('fit', '맞는 기질이 들어가면 <b>효소·기질 복합체</b>가 되고, 기질에 변화가 일어나 <b>생성물</b>로 바뀐 뒤 효소에서 분리돼요. 예: <b>설탕 + 물 → 포도당 + 과당</b>.');
        if (done >= 5) c.hit('reuse', '반응이 끝나도 효소는 <b>변하지 않고 다시</b> 쓰여요. 그래서 적은 양의 효소로도 많은 기질을 처리해요.');
        setTimeout(() => spawn('sq', Math.floor(Math.random() * 4)), 400); }); }
    const prods = [];
    c.goals([
      { id: 'wrong', t: '모양이 <b>다른</b> 기질(▲ 또는 ●)을 활성 부위에 넣어 보기', hint: '떠다니는 조각을 끌어 효소 위쪽 홈에' },
      { id: 'fit', t: '활성 부위에 꼭 맞는 기질 넣기', hint: '홈 모양을 잘 봐요' },
      { id: 'reuse', t: '<b>같은 효소 하나</b>로 기질 5개 처리하기', hint: '처리한 수는 오른쪽 패널에' }]);
    c.readout(() => `이 효소가 처리한 기질 <b>${done}</b>개<br>효소 모양 변화: <b>없음</b> · 결합 실패 ${wrong}번`);
    c.loop((dt, t) => {
      busy = Math.max(0, busy - dt);
      subs.forEach(o => { if (o.held || o.back) return; o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < 40 || o.x > 960) o.vx *= -1; if (o.y < 60 || o.y > 560) o.vy *= -1; if (c.dist(o.x, o.y, EX, EY) < 170) { const a = Math.atan2(o.y - EY, o.x - EX); o.vx = Math.cos(a) * 40; o.vy = Math.sin(a) * 40; } o.hx = o.x; o.hy = o.y; });
      /* 효소 몸체 */
      const wob = Math.sin(t * 2) * 3; c.circle(EX, EY + wob, 130, '#1d6a72', '#5affd0', 3);
      c.g.globalAlpha = .25; c.circle(EX - 40, EY + 30 + wob, 60, '#5affd0'); c.g.globalAlpha = 1;
      /* 활성 부위 (■ 홈) */
      c.rr(SX - 26, SY - 26 + wob, 52, 60, 4, '#0a2433', '#5affd0', 2);
      c.txt('효소 (단백질)', EX, EY + 70 + wob, 18, '#dffff6'); c.txt('활성 부위', SX + 85, SY + wob, 14, '#5affd0'); c.arrow(SX + 50, SY + wob, SX + 30, SY + wob, '#5affd0', 2, 8);
      if (bound) { shape(bound.k, SX, SY + wob, 22, COL[bound.k], '#04101a'); c.label(bound.t < .6 ? '효소·기질 복합체' : '생성물로 바뀌는 중…', SX, SY - 52, '#ffd23f', 15);
        if (bound.t > .6) { c.line([[SX, SY - 22], [SX, SY + 22]], '#04101a', 4); } }
      for (let i = prods.length - 1; i >= 0; i--) { const p = prods[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; if (p.t > 2) { prods.splice(i, 1); continue; } c.g.globalAlpha = 1 - p.t / 2; c.rr(p.x - 11, p.y - 22, 22, 44, 4, '#ffd23f', '#04101a'); c.g.globalAlpha = 1; c.txt(p.n, p.x, p.y + 34, 11, '#ffe9a0'); }
      if (!c.isDone('wrong')) c.tip('떠다니는 기질을 끌어 효소의 활성 부위(위쪽 홈)에 넣어 봐요');
      else if (!c.isDone('reuse')) c.tip('■ 기질을 계속 넣어 봐요 — 효소는 어떻게 될까?'); else c.tip('');
    });
    c.test = async () => { const w = subs.find(o => o.k === 'tri'); c.simDrop(w, SX, SY); for (let i = 0; i < 5; i++) { const s = subs.find(o => o.k === 'sq'); c.simDrop(s, SX, SY); await c.wait(1.6); } };
  });

  /* ═════ 3. 보조 인자와 효소의 종류 ═════ */
  def('cof', { ch: '효소', t: '보조 인자 · 효소의 종류', sub: '주효소 + 보조 인자 = 전효소 · 가수 분해 효소 · 연결 효소' }, c => {
    const A = { x: 300, y: 300, need: 'org', holo: false, done: 0, name: '탈수소 효소' }, B = { x: 700, y: 300, need: 'metal', holo: false, done: 0, name: '중합 효소' };
    let phase = 1, busy = 0;
    const items = [];
    const tray = [['NAD⁺', 'org', '#4aa8ff'], ['비타민 B₂', 'org', '#ffb347'], ['Mg²⁺', 'metal', '#c0c8d0'], ['Zn²⁺', 'metal', '#9ad0c0']];
    tray.forEach(([n, k, col], i) => items.push(c.draggable({ x: 140 + i * 240, y: 530, r: 30, n, k, col, kind: 'cof',
      draw: (x, y, o) => { if (o.k === 'org') c.ball(x, y, 26, o.col, '', '#04101a'); else c.poly([[x, y - 24], [x + 22, y], [x, y + 24], [x - 22, y]], o.col, '#04101a'); c.txt(o.n, x, y, 13, '#04101a', 'center', 900); c.txt(o.k === 'org' ? '조효소' : '금속 이온', x, y + 38, 11, '#cfe'); },
      onDrop: (x, y, o) => cofDrop(items[i], x, y) })));
    function cofDrop(o, x, y) { for (const E of [A, B]) if (c.dist(x, y, E.x, E.y + 70) < 60) { if (E.holo) { c.float('이미 붙어 있어요', x, y - 30, '#9fe'); return false; }
        if (o.k !== E.need) { c.float(E.need === 'org' ? '여긴 유기물 조효소 자리' : '여긴 금속 이온 자리', x, y - 34, '#ff8a6a'); return false; }
        E.holo = o.n; o.off = true; c.remove(o); c.fx(E.x, E.y + 70, o.col, 20); c.float('전효소 완성!', E.x, E.y - 110, '#ffd23f');
        if (A.holo && B.holo) c.hit('holo', '<b>전효소 = 주효소(단백질) + 보조 인자</b>. 보조 인자에는 <b>조효소</b>(유기물: NAD⁺, FAD, NADP⁺, 비타민 등)와 <b>금속 이온</b>(철, 구리, 아연, 마그네슘 등)이 있어요.');
        return true; } return false; }
    const sub = c.draggable({ x: 500, y: 110, r: 30, kind: 'sub', draw: (x, y) => { c.rr(x - 22, y - 18, 44, 36, 8, '#ffd23f', '#04101a'); c.txt('기질', x, y, 13, '#04101a', 'center', 900); },
      onDrop: (x, y) => { for (const E of [A, B]) if (c.dist(x, y, E.x, E.y - 40) < 80) { if (busy > 0) return false;
          if (!E.holo) { c.float('주효소만으론 반응 X', E.x, E.y - 130, '#ff8a6a'); c.fx(E.x, E.y - 40, '#ff5a5a', 8); c.hit('apo', '단백질 부분인 <b>주효소</b>만으로는 효소가 작용하지 못해요. 비단백질 부분 <b>보조 인자</b>가 필요한 효소가 있어요.'); return false; }
          busy = 1; E.done++; E.flash = 1; c.fx(E.x, E.y - 40, '#ffd23f', 22); c.float('반응 완료!', E.x, E.y - 130); if (A.done && B.done) { c.hit('work', '보조 인자가 붙어 완성된 <b>전효소</b>만 반응을 촉매해요.'); setTimeout(() => startPhase2(), 900); } return false; } return false; } });
    sub.bad = false;
    c.goals([
      { id: 'apo', t: '노란 기질을 <b>주효소</b>(회색 효소)에 넣어 보기', hint: '위의 기질을 끌어 효소 위쪽으로' },
      { id: 'holo', t: '두 주효소의 빈 자리에 맞는 <b>보조 인자</b> 끼우기', hint: '아래 칸의 조각을 효소 아래쪽 빈 자리로 — 모양을 봐요' },
      { id: 'work', t: '완성된 두 효소로 기질 반응시키기' },
      { id: 'hydro', t: '이당류의 결합 부위에 <b>물</b>을 넣어 쪼개기', hint: 'H₂O 방울을 가운데 결합에' },
      { id: 'lig', t: '두 분자 사이에 <b>ATP</b>를 넣어 연결하기', hint: 'ATP를 두 분자 사이에' },
      { id: 'six', t: '나머지 효소 4종류도 직접 작동시키기', hint: '네 칸의 구슬을 화살표 방향으로 끌어요' }]);
    /* 2단계: 가수 분해 · 연결 */
    let mol = null, water = null, atp = null;
    function startPhase2() { phase = 2; sub.off = true; c.remove(sub); items.forEach(o => { o.off = true; c.remove(o); }); mol = { joined: true, gap: 0 };
      water = c.draggable({ x: 220, y: 500, r: 30, draw: (x, y) => { c.poly([[x, y - 28], [x + 18, y], [x, y + 18], [x - 18, y]], '#5ac8ff', '#04101a'); c.circle(x, y + 4, 18, '#5ac8ff'); c.txt('H₂O', x, y + 4, 13, '#04101a', 'center', 900); },
        onDrop: (x, y) => { if (!mol.joined || c.dist(x, y, 500, 300) > 70) return false; mol.joined = false; c.tween(.6, k => mol.gap = k); water.off = true; c.remove(water); c.fx(500, 300, '#5ac8ff', 24);
          c.hit('hydro', '물 분자를 넣어 기질을 쪼개는 효소 = <b>가수 분해 효소</b> (예: 아밀레이스, 펩신). 소화 효소 대부분이 여기 속해요.'); setTimeout(() => { atp.off = false; }, 500); return true; } });
      atp = c.draggable({ x: 780, y: 500, r: 32, off: true, draw: (x, y) => { c.ball(x, y, 28, '#ffd23f'); c.txt('ATP', x, y, 15, '#04101a', 'center', 900); },
        onDrop: (x, y) => { if (mol.joined || c.dist(x, y, 500, 300) > 90) return false; c.tween(.6, k => mol.gap = 1 - k, () => mol.joined = true); atp.off = true; c.remove(atp); c.fx(500, 300, '#ffd23f', 30); c.float('ATP → ADP + Pᵢ', 500, 220);
          c.hit('lig', '<b>ATP의 에너지</b>를 써서 두 분자를 연결하는 효소 = <b>연결 효소</b>.'); setTimeout(startPhase3, 900); return true; } });
      c.tip('효소는 하는 일로 나뉘어요 — 직접 쪼개고 붙여 봐요'); }
    let P3 = [];
    function startPhase3() { phase = 3; c.tip('효소는 하는 일로 6가지 — 나머지 4가지를 작동시켜 봐요');
      P3 = [{ n: '산화 환원 효소', d: '전자를 옮겨 산화·환원', cx: 260, cy: 190, from: [200, 170], to: [330, 180], lab: 'e⁻e⁻', col: '#7ff8ff' },
        { n: '전이 효소', d: '작용기를 다른 분자로 옮김', cx: 740, cy: 190, from: [705, 190], to: [840, 190], lab: '', col: '#ff9a3c' },
        { n: '제거 효소', d: '작용기를 떼어 이중 결합 형성', cx: 260, cy: 450, from: [170, 450], to: null, lab: '', col: '#ff9a3c' },
        { n: '이성질화 효소', d: '원자 배열을 바꿔 이성질체로', cx: 740, cy: 450, from: [680, 450], to: [825, 450], lab: '', col: '#c08aff' }];
      P3.forEach(q => { q.done = false; q.o = c.draggable({ x: q.from[0], y: q.from[1], r: 24, draw: (x, y) => { if (q.done) return; c.ball(x, y, 15, q.col); if (q.lab) c.txt(q.lab, x, y, 10, '#04101a', 'center', 900); },
        onDrop: (x, y) => { const ok = q.to ? c.dist(x, y, q.to[0], q.to[1]) < 45 : c.dist(x, y, q.from[0], q.from[1]) > 90; if (!ok) return false; q.done = true; q.o.off = true; c.remove(q.o); c.fx(q.cx, q.cy, q.col, 18); c.float(q.n, q.cx, q.cy - 70, '#ffd23f');
          if (P3.every(z => z.done)) c.hit('six', '효소는 하는 일에 따라 6가지: <b>산화 환원</b>(전자 이동) · <b>전이</b>(작용기를 다른 분자로) · <b>가수 분해</b>(물을 넣어 분해) · <b>제거</b>(작용기를 떼어 이중 결합/고리) · <b>이성질화</b>(원자 배열 변경 → 이성질체) · <b>연결</b>(ATP 에너지로 두 분자 연결).'); return true; } }); }); }
    c.loop((dt, t) => { busy = Math.max(0, busy - dt);
      if (phase === 3) { P3.forEach(q => { const { cx, cy } = q; c.rr(cx - 220, cy - 105, 440, 210, 16, '#ffffff06', q.done ? '#5aff9a88' : '#ffffff22', 1.5); c.txt(q.done ? q.n : '?', cx, cy - 82, 16, q.done ? '#ffd23f' : '#9bc'); if (q.done) c.txt(q.d, cx, cy + 82, 13, '#cfe');
          if (q.n === '산화 환원 효소') { c.rr(150, 150, 50, 70, 8, '#5a8aff', '#04101a'); c.txt('A', 175, 205, 14, '#fff'); c.rr(310, 150, 50, 70, 8, '#5affa0', '#04101a'); c.txt('B', 335, 205, 14, '#04101a'); if (q.done) { c.ball(335, 165, 12, q.col); c.txt('e⁻e⁻', 335, 165, 9, '#04101a'); c.txt('산화', 175, 235, 12, '#8fc8ff'); c.txt('환원', 335, 235, 12, '#8fffc0'); } else c.arrow(220, 190, 295, 190, '#ffffff55', 2, 8); }
          if (q.n === '전이 효소') { c.rr(640, 165, 50, 50, 6, '#ffb3d0', '#04101a'); c.rr(860, 165, 50, 50, 6, '#ffe9a0', '#04101a'); if (q.done) { c.line([[860, 190], [845, 190]], '#fff', 3); c.ball(840, 190, 13, q.col); } else { c.line([[690, 190], [705, 190]], '#fff', 3); c.arrow(730, 215, 830, 215, '#ffffff55', 2, 8); } }
          if (q.n === '제거 효소') { c.poly([[215, 470], [245, 425], [275, 470]], '#ffd23f', '#04101a'); c.rr(310, 425, 45, 45, 6, '#5af0ff', '#04101a'); c.line([[275, 446], [310, 446]], '#fff', 3); if (q.done) c.line([[275, 454], [310, 454]], '#fff', 3); else { c.line([[185, 450], [220, 450]], '#fff', 3); c.arrow(165, 480, 100, 520, '#ffffff55', 2, 8); } }
          if (q.n === '이성질화 효소') { c.rr(700, 430, 100, 40, 8, '#5aa8ff', '#04101a'); c.txt('A', 750, 450, 14, '#fff'); if (q.done) { c.ball(815, 450, 15, q.col); c.txt('이성질체 A', 760, 500, 12, '#d8b0ff'); } else c.arrow(700, 485, 815, 485, '#ffffff55', 2, 8); } });
        return; }
      if (phase === 1) {
        [A, B].forEach(E => { E.flash = Math.max(0, (E.flash || 0) - dt); const col = E.holo ? '#2a8a7a' : '#5a6670';
          c.circle(E.x, E.y, 95, col, E.holo ? '#5affd0' : '#9aa', 3); if (E.flash) { c.g.globalAlpha = E.flash; c.circle(E.x, E.y, 110, null, '#ffd23f', 6); c.g.globalAlpha = 1; }
          c.rr(E.x - 30, E.y - 98, 60, 40, 6, '#0a2433', '#cfe', 2); c.txt('활성 부위', E.x, E.y - 78, 11, '#cfe');
          if (!E.holo) { if (E.need === 'org') c.circle(E.x, E.y + 70, 26, '#0a2433', '#ffffff88', 2); else c.poly([[E.x, E.y + 46], [E.x + 22, E.y + 70], [E.x, E.y + 94], [E.x - 22, E.y + 70]], '#0a2433', '#ffffff88', 2); c.txt('빈 자리', E.x, E.y + 70, 11, '#cfe'); }
          else { const T = tray.find(q => q[0] === E.holo); if (E.need === 'org') c.ball(E.x, E.y + 70, 26, T[2]); else c.poly([[E.x, E.y + 46], [E.x + 22, E.y + 70], [E.x, E.y + 94], [E.x - 22, E.y + 70]], T[2], '#04101a'); c.txt(E.holo, E.x, E.y + 70, 12, '#04101a', 'center', 900); }
          c.txt(E.holo ? '전효소' : '주효소 (단백질만)', E.x, E.y + 10, 17, '#fff'); c.txt(E.holo ? `= 주효소 + ${E.holo}` : '', E.x, E.y + 34, 13, '#dffff6'); });
        c.rr(30, 480, 940, 105, 14, '#ffffff08', '#ffffff22', 1); c.txt('보조 인자', 70, 494, 12, '#9bc');
        if (!sub.held && !sub.back) { sub.x = sub.hx; sub.y = sub.hy; }
        if (!c.isDone('apo')) c.tip('노란 기질을 회색 효소에 넣어 봐요');
        else if (!c.isDone('holo')) c.tip('효소 아래쪽 빈 자리 모양에 맞는 보조 인자를 끼워요');
        else if (!c.isDone('work')) c.tip('이제 기질을 두 효소에 각각 넣어 봐요');
      } else {
        const g = mol.gap * 60; c.circle(500 - 55 - g, 300, 48, '#ffb3d0', '#04101a'); c.circle(500 + 55 + g, 300, 48, '#ffb3d0', '#04101a'); c.txt('포도당', 500 - 55 - g, 300, 15, '#04101a'); c.txt('포도당', 500 + 55 + g, 300, 15, '#04101a');
        if (mol.joined) { c.line([[500 - 10, 300], [500 + 10, 300]], '#fff', 6); c.label('엿당 (이당류)', 500, 210, '#ffb3d0'); } else c.label('단당류 2개', 500, 210, '#ffb3d0');
        c.txt(!c.isDone('hydro') ? '물로 쪼개기' : !c.isDone('lig') ? 'ATP로 붙이기' : '', 500, 420, 18, '#9fe');
      } });
    c.test = async () => { c.simDrop(sub, A.x, A.y - 40); c.simDrop(items[2], A.x, A.y + 70); c.simDrop(items[0], A.x, A.y + 70); c.simDrop(items[2], B.x, B.y + 70); c.simDrop(sub, A.x, A.y - 40); await c.wait(1.1); c.simDrop(sub, B.x, B.y - 40); await c.wait(1.2); c.simDrop(water, 500, 300); await c.wait(.8); c.simDrop(atp, 500, 300); await c.wait(1.2); P3.forEach(q => c.simDrop(q.o, ...(q.to || [q.from[0] - 100, q.from[1] + 60]))); };
  });

  /* ═════ 4. 온도와 pH ═════ */
  def('env', { ch: '효소', t: '온도와 pH', sub: '최적 온도 · 변성 · 최적 pH' }, c => {
    let mode = 'T', T = 20, pH = 7, dmg = 0, enzK = 'pep', steady = 0, lastV = null, holdOpt = 0;
    const OPT = { pep: [2, '펩신', '위', '#ff8a5a'], amy: [7, '아밀레이스', '입(침)', '#5af0ff'], try: [8, '트립신', '소장', '#c08aff'] };
    const ptsT = [], ptsTd = [], ptsP = { pep: [], amy: [], try: [] }, found = {};
    const rateT = () => Math.pow(2, (T - 37) / 10) * (1 - dmg) / 1.75;
    const rateP = () => Math.exp(-(((pH - OPT[enzK][0]) / 1.3) ** 2));
    const rate = () => mode === 'T' ? rateT() : rateP();
    const parts = Array.from({ length: 22 }, () => ({ x: c.rnd(60, 540), y: c.rnd(90, 560), a: c.rnd(0, 6.28) }));
    const prods = [];
    c.goals([
      { id: 'curve', t: '온도를 바꿔 가며 반응 속도 재기 — <b>30 °C 이하 · 35~45 °C · 55 °C 이상</b> 각각', hint: '슬라이더를 움직이고 잠시 멈추면 그래프에 점이 찍혀요' },
      { id: 'irrev', t: '뜨거워졌던 효소를 다시 <b>37 °C 이하</b>로 식혀 보기', hint: '변성된 효소는 식히면 돌아올까?' },
      { id: 'ph', t: 'pH 모드: 세 효소의 <b>최적 pH</b> 찾기', hint: '속도가 가장 클 때 1초 멈춰요' }]);
    const seg = c.seg('', [['T', '온도'], ['P', 'pH']], 'T', v => { mode = v; ui(); });
    let sl, eseg, nb;
    function ui() { [sl, eseg, nb].forEach(x => x && x.el && x.el.remove()); if (nb && nb.remove) nb.remove(); eseg = null;
      if (mode === 'T') { sl = c.slider('온도', 0, 80, T, 1, v => `${v} °C`, v => { T = v; steady = 0; }); nb = c.button('새 효소로 바꾸기', () => { dmg = 0; c.float('새 효소!', 300, 200, '#5affd0'); }); }
      else { eseg = c.seg('효소', Object.entries(OPT).map(([k, o]) => [k, o[1]]), enzK, v => { enzK = v; }); sl = c.slider('pH', 1, 12, pH, .5, v => `pH ${v}`, v => { pH = v; steady = 0; }); } }
    ui();
    c.readout(() => mode === 'T' ? `반응 속도 <b>${(rate() * 100).toFixed(0)}</b><br>효소 상태: <b>${dmg < .05 ? '정상' : dmg < .6 ? '조금 변성' : '변성 (구조 망가짐)'}</b>` : `${OPT[enzK][1]} (${OPT[enzK][2]}) 반응 속도 <b>${(rate() * 100).toFixed(0)}</b><br>찾은 최적 pH: ${Object.keys(found).map(k => OPT[k][1] + ' ' + OPT[k][0]).join(', ') || '-'}`);
    c.loop((dt, t) => {
      const g = c.g;
      if (mode === 'T') { const dm = Math.pow(c.clamp((T - 37) / 18, 0, 1), 1.2); if (dm > dmg) dmg = Math.min(dm, dmg + dt * .8); }
      steady += dt; const r = rate();
      if (steady > .7) { steady = -99; if (mode === 'T') { const L = dmg > .08 && T < 40 ? ptsTd : ptsT; const i = L.findIndex(p => Math.abs(p[0] - T) < 2); if (i >= 0) L.splice(i, 1); L.push([T, r]); L.sort((a, b) => a[0] - b[0]);
          const intact = ptsT; if (intact.some(p => p[0] <= 30) && intact.some(p => p[0] >= 35 && p[0] <= 45) && intact.some(p => p[0] >= 55)) c.hit('curve', '온도가 오르면 분자 운동이 활발해져 속도가 빨라지다가 <b>최적 온도</b>(사람 효소 약 35~40 °C)를 넘으면 단백질 입체 구조가 망가지는 <b>변성</b>이 일어나 급격히 느려져요.');
          if (c.isDone('curve') && dmg > .85 && T <= 37) c.hit('irrev', '한 번 <b>변성</b>된 효소는 식혀도 활성을 되찾지 못해요. 단백질의 입체 구조(활성 부위 모양)가 망가졌기 때문이에요.'); }
        else { const L = ptsP[enzK]; const i = L.findIndex(p => Math.abs(p[0] - pH) < .3); if (i >= 0) L.splice(i, 1); L.push([pH, r]); L.sort((a, b) => a[0] - b[0]); } }
      if (mode === 'P' && r > .97) { holdOpt += dt; if (holdOpt > 1 && !found[enzK]) { found[enzK] = 1; c.float(`${OPT[enzK][1]} 최적 pH ${OPT[enzK][0]}!`, 300, 150, OPT[enzK][3]); c.beep('ok');
          if (Object.keys(found).length === 3) c.hit('ph', '효소마다 <b>최적 pH</b>가 달라요: <b>펩신 약 2</b>(산성인 위), <b>아밀레이스 약 7</b>(침), <b>트립신 약 8</b>(소장). 최적 pH에서 벗어나면 활성 부위 모양이 바뀌어 느려져요.'); } } else holdOpt = 0;
      /* 왼쪽: 효소와 기질 */
      c.rr(30, 70, 540, 500, 16, '#08202c', '#ffffff18', 1);
      const sp = mode === 'T' ? 20 + T * 3 : 60, wob = mode === 'T' ? dmg : Math.min(1, Math.abs(pH - OPT[enzK][0]) / 5);
      parts.forEach(p => { p.a += c.rnd(-1, 1) * dt * 3; p.x += Math.cos(p.a) * sp * dt; p.y += Math.sin(p.a) * sp * dt; if (p.x < 45 || p.x > 555) p.a = Math.PI - p.a; if (p.y < 85 || p.y > 555) p.a = -p.a; p.x = c.clamp(p.x, 45, 555); p.y = c.clamp(p.y, 85, 555); c.rr(p.x - 7, p.y - 7, 14, 14, 3, '#ffd23f'); });
      if (Math.random() < r * dt * 5) prods.push({ x: 300, y: 250, a: c.rnd(0, 6.28), t: 0 });
      for (let i = prods.length - 1; i >= 0; i--) { const p = prods[i]; p.t += dt; if (p.t > 1.2) { prods.splice(i, 1); continue; } g.globalAlpha = 1 - p.t / 1.2; c.circle(p.x + Math.cos(p.a) * p.t * 160, p.y + Math.sin(p.a) * p.t * 160, 6, '#5aff9a'); g.globalAlpha = 1; }
      const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283, n = 1 + wob * .28 * Math.sin(a * 5 + 1.3) * Math.sin(a * 3 + t * 2 * wob); pts.push([300 + Math.cos(a) * 95 * n, 330 + Math.sin(a) * 85 * n]); }
      c.poly(pts, wob > .6 ? '#6a5050' : '#1d6a72', wob > .6 ? '#ff8a6a' : '#5affd0', 3);
      const sw = 22 + wob * 16 * Math.sin(t * 3); c.poly([[300 - sw, 248], [300 - 18 + wob * 14, 285], [300 + 18 - wob * 10, 285], [300 + sw + wob * 10, 248]], '#08202c', '#5affd0', 2);
      c.txt(wob > .6 ? '구조가 망가짐' : '효소', 300, 350, 18, '#fff'); c.txt(mode === 'T' ? `${T} °C` : `pH ${pH}`, 300, 380, 16, '#ffd23f');
      /* 오른쪽 그래프 */
      if (mode === 'T') c.graph([630, 110, 330, 380], { x0: 0, x1: 80, y0: 0, y1: 1.3, xl: '온도(°C)', yl: '반응 속도', xt: [0, 20, 40, 60, 80] }, [{ pts: ptsT, col: '#5affd0', dots: true }, { pts: ptsTd, col: '#888', dots: true, line: false }, { pts: [[T, r]], col: '#ffd23f', dots: true, r: 8, line: false }]);
      else c.graph([630, 110, 330, 380], { x0: 0, x1: 12, y0: 0, y1: 1.15, xl: 'pH', yl: '반응 속도', xt: [0, 2, 4, 6, 8, 10, 12] }, [...Object.entries(ptsP).map(([k, L]) => ({ pts: L, col: OPT[k][3], dots: true })), { pts: [[pH, r]], col: '#fff', dots: true, r: 8, line: false }]);
      if (ptsTd.length && mode === 'T') c.txt('회색 점 = 변성된 효소로 잰 값', 795, 535, 12, '#aaa');
      c.tip(mode === 'T' ? (c.isDone('curve') && !c.isDone('irrev') ? '이제 다시 식혀 봐요 — 속도가 돌아올까?' : '온도 슬라이더를 움직이고 잠깐 멈춰 속도를 재요') : `${OPT[enzK][1]}: pH를 움직여 속도가 가장 큰 곳을 찾아요`);
    });
    c.test = async () => { for (const v of [20, 40, 60]) { sl.set(v); await c.wait(1.6); } sl.set(30); await c.wait(1); seg.set('P'); for (const k of ['pep', 'amy', 'try']) { eseg.set(k); sl.set(OPT[k][0]); await c.wait(1.3); } };
  });

  /* ═════ 5. 기질 농도와 억제제 ═════ */
  def('sat', { ch: '효소', t: '기질 농도와 억제제', sub: '포화 · 경쟁적 억제제 · 비경쟁적 억제제' }, c => {
    let S = 10, inh = 'none', steady = 0, vShown = 0;
    const KM = 8, VMAX = 1;
    const v = () => inh === 'comp' ? VMAX * S / (KM * 4 + S) : inh === 'non' ? VMAX / 2.5 * S / (KM + S) : VMAX * S / (KM + S);
    const pts = { none: [], comp: [], non: [] }, COL = { none: '#5affd0', comp: '#ff8a5a', non: '#c08aff' };
    const ENZ = Array.from({ length: 6 }, (_, i) => ({ x: 130 + (i % 3) * 170, y: 220 + Math.floor(i / 3) * 190, st: 'free', t: 0, nc: i < 4 }));
    const P = Array.from({ length: 70 }, () => ({ x: c.rnd(50, 560), y: c.rnd(90, 560), a: c.rnd(0, 6.28) }));
    const prods = [];
    c.goals([
      { id: 'sat', t: '억제제 없이 기질 농도를 <b>0 → 150 이상</b>으로 올리며 속도 재기 (점 5개 이상)', hint: '슬라이더를 움직이고 잠시 멈추면 점이 찍혀요' },
      { id: 'comp', t: '<b>경쟁적 억제제</b>를 넣고 기질을 아주 많이(150 이상) 넣어 보기', hint: '억제 효과가 어떻게 될까?' },
      { id: 'non', t: '<b>비경쟁적 억제제</b>를 넣고 기질을 아주 많이(150 이상) 넣어 보기' }]);
    const sl = c.slider('기질 농도', 0, 200, S, 5, x => x, x => { S = x; steady = 0; });
    const iseg = c.seg('억제제', [['none', '없음'], ['comp', '경쟁적'], ['non', '비경쟁적']], 'none', x => { inh = x; steady = 0; ENZ.forEach(e => { e.st = 'free'; e.t = 0; }); });
    c.readout(() => `반응 속도 <b>${(vShown * 100).toFixed(0)}</b> (최대 100)<br>${inh === 'comp' ? '억제제가 <b>활성 부위</b>를 두고 기질과 경쟁' : inh === 'non' ? '억제제가 <b>다른 부위</b>에 붙어 활성 부위 모양을 바꿈' : '효소 6개'}`);
    c.loop((dt, t) => {
      const g = c.g; vShown += (v() - vShown) * Math.min(1, dt * 4); steady += dt;
      if (steady > .8) { steady = -99; const L = pts[inh]; const i = L.findIndex(p => Math.abs(p[0] - S) < 4); if (i >= 0) L.splice(i, 1); L.push([S, v()]); L.sort((a, b) => a[0] - b[0]);
        if (pts.none.length >= 5 && pts.none.some(p => p[0] <= 10) && pts.none.some(p => p[0] >= 150)) c.hit('sat', '효소 양이 일정할 때 기질이 늘면 속도가 빨라지다가, 모든 효소의 활성 부위가 기질로 꽉 차면(<b>포화</b>) 속도가 <b>일정</b>해져요.');
        if (inh === 'comp' && S >= 150) c.hit('comp', '<b>경쟁적 억제제</b>는 기질과 모양이 비슷해 <b>활성 부위</b>를 두고 경쟁해요. 기질 농도를 높이면 기질이 이겨서 <b>억제 효과가 줄고</b>, 최대 속도에 가까워져요.');
        if (inh === 'non' && S >= 150) c.hit('non', '<b>비경쟁적 억제제</b>는 활성 부위가 <b>아닌 곳</b>에 붙어 활성 부위 모양을 바꿔요. 기질을 아무리 늘려도 그 효소는 못 쓰니까 <b>억제 효과가 유지</b>돼요.'); }
      /* 상자 */
      c.rr(30, 70, 560, 500, 16, '#08202c', '#ffffff18', 1);
      const shown = Math.round(S / 200 * 70); for (let i = 0; i < shown; i++) { const p = P[i]; p.a += c.rnd(-1, 1) * dt * 2; p.x += Math.cos(p.a) * 50 * dt; p.y += Math.sin(p.a) * 50 * dt; if (p.x < 45 || p.x > 575) p.a = Math.PI - p.a; if (p.y < 85 || p.y > 555) p.a = -p.a; c.rr(p.x - 6, p.y - 6, 12, 12, 3, '#ffd23f'); }
      if (inh === 'comp') for (let i = 0; i < 8; i++) { const x = 60 + ((i * 97 + t * 30) % 500), y = 100 + ((i * 131 + t * 20) % 440); c.rr(x - 6, y - 6, 12, 12, 3, '#ff5a5a'); }
      ENZ.forEach((e, i) => { e.t -= dt; const blocked = inh === 'non' && e.nc;
        if (e.t <= 0) { if (blocked) e.st = 'free'; else { const ws = S / KM, wi = inh === 'comp' ? 3 : 0, w0 = 1; const r = Math.random() * (ws + wi + w0); if (e.st === 'sub') prods.push({ x: e.x, y: e.y - 40, t: 0 }); e.st = r < ws ? 'sub' : r < ws + wi ? 'inh' : 'free'; e.t = e.st === 'free' ? .25 : e.st === 'sub' ? .7 : 1.2; } }
        const wob = blocked ? 10 : 0; c.circle(e.x, e.y, 52, blocked ? '#5a4a6a' : '#1d6a72', blocked ? '#c08aff' : '#5affd0', 3);
        c.poly([[e.x - 18 - wob, e.y - 52], [e.x - 12, e.y - 26 + wob * .5], [e.x + 12, e.y - 26 - wob * .5], [e.x + 18 + wob, e.y - 52]], '#08202c', blocked ? '#c08aff' : '#5affd0', 2);
        if (e.st === 'sub' && !blocked) c.rr(e.x - 11, e.y - 50, 22, 22, 3, '#ffd23f'); if (e.st === 'inh' && !blocked) c.rr(e.x - 11, e.y - 50, 22, 22, 3, '#ff5a5a');
        if (blocked) { c.circle(e.x + 42, e.y + 30, 13, '#c08aff', '#04101a'); } });
      for (let i = prods.length - 1; i >= 0; i--) { const p = prods[i]; p.t += dt; if (p.t > 1) { prods.splice(i, 1); continue; } g.globalAlpha = 1 - p.t; c.circle(p.x - p.t * 40, p.y - p.t * 50, 5, '#5aff9a'); c.circle(p.x + p.t * 40, p.y - p.t * 50, 5, '#5aff9a'); g.globalAlpha = 1; }
      c.txt('■ 기질', 80, 585, 12, '#ffd23f'); if (inh === 'comp') c.txt('■ 경쟁적 억제제', 190, 585, 12, '#ff7a7a'); if (inh === 'non') c.txt('● 비경쟁적 억제제', 200, 585, 12, '#c08aff');
      c.graph([650, 110, 310, 380], { x0: 0, x1: 200, y0: 0, y1: 1.1, xl: '기질 농도', yl: '반응 속도', xt: [0, 50, 100, 150, 200] }, [...Object.entries(pts).map(([k, L]) => ({ pts: L, col: COL[k], dots: true })), { pts: [[S, v()]], col: '#fff', dots: true, r: 8, line: false }]);
      c.txt('초록 = 억제제 없음 · 주황 = 경쟁적 · 보라 = 비경쟁적', 805, 540, 11, '#9bc');
      c.tip(c.active() === 'sat' ? '기질 농도 슬라이더를 0부터 끝까지 조금씩 — 멈출 때마다 점' : c.active() === 'comp' ? '억제제 「경쟁적」을 고르고 기질을 아주 많이!' : c.active() === 'non' ? '「비경쟁적」으로 바꾸고 기질을 아주 많이!' : '');
    });
    c.test = async () => { for (const x of [0, 10, 40, 100, 160]) { sl.set(x); await c.wait(1); } iseg.set('comp'); await c.wait(1); iseg.set('non'); await c.wait(1); };
  });

  /* ═════ 6. 감자즙 카탈레이스 실험 (교과서 탐구) ═════ */
  def('cat', { ch: '효소', t: '감자즙 거름종이 실험', sub: '카탈레이스 · 기질 농도 · pH · 변성' }, c => {
    /* 비커 A~E: 5% 과산화 수소 / 증류수 / 묽은 염산 / 묽은 NaOH (교과서 표) */
    const B = [['A', '과산화 수소 25 mL + 물 5', 2], ['B', '과산화 수소 20 + 물 10', 3.3], ['C', '과산화 수소 15 + 물 15', 4.5], ['D', '과산화 수소 25 + 묽은 염산 5', 5], ['E', '과산화 수소 25 + 묽은 NaOH 5', 4]]
      .map(([n, d, T], i) => ({ n, d, T, x: 110 + i * 180, disc: null, res: {} }));
    const Y0 = 300, Y1 = 540; /* 수면, 바닥 */
    const mk = (boiled, x) => { const o = c.draggable({ x, y: 120, r: 28, boiled, draw: (x, y) => { c.circle(x, y, 22, boiled ? '#b8a070' : '#f4e8c0', '#04101a'); c.txt(boiled ? '끓인 즙' : '감자즙', x, y, 10, '#04101a', 'center', 900); },
      onDrop: (x, y) => { const b = B.find(q => Math.abs(x - q.x) < 70 && y > 250); if (!b || b.disc) return false; b.disc = { y: Y0, t: 0, boiled, done: false }; c.beep('pop'); return false; } }); o.bad = false; return o; };
    const dN = mk(false, 380), dB = mk(true, 620);
    c.goals([
      { id: 'conc', t: '감자즙 종이를 <b>A · B · C</b>에 넣고 떠오르는 시간 재기', hint: '종이를 끌어 비커에 — 가라앉았다가 기포(O₂)로 떠올라요' },
      { id: 'ph', t: '<b>D(산성) · E(염기성)</b>에도 넣어 A와 비교', hint: '과산화 수소 양은 A와 같아요' },
      { id: 'boil', t: '<b>끓인 감자즙</b> 종이를 A에 넣어 보기', hint: '오른쪽 위 갈색 종이' }]);
    c.readout(() => `감자즙의 효소 <b>카탈레이스</b><br>2H₂O₂ → 2H₂O + <b>O₂</b> (기포)<br>${B.filter(b => b.res.n != null).map(b => `${b.n}: <b>${b.res.n}</b>초`).join(' · ') || '측정 전'}`);
    c.loop((dt, t) => {
      c.txt('5% 과산화 수소 수용액(기질)에 감자즙 묻힌 거름종이를 넣으면?', 500, 70, 15, '#cfe');
      B.forEach(b => { c.rr(b.x - 65, 250, 130, 300, 10, null, '#9fe', 3); c.rr(b.x - 62, Y0, 124, Y1 - Y0 + 8, 8, b.n === 'D' ? '#ff9a9a33' : b.n === 'E' ? '#9a9aff33' : '#5ac8ff33');
        c.txt(b.n, b.x, 235, 22, '#fff'); c.txt(b.d, b.x, 570, 10.5, '#cfe');
        const d = b.disc; if (!d) return; d.t += dt;
        const sink = .5; let y; if (d.t < sink) y = c.lerp(Y0, Y1 - 10, d.t / sink);
        else if (d.boiled || d.done) y = d.boiled ? Y1 - 10 : Y0 + 6; else { const k = c.clamp((d.t - sink) / b.T, 0, 1); y = c.lerp(Y1 - 10, Y0 + 6, k * k);
          if (Math.random() < dt * 14) c.fx(b.x + c.rnd(-14, 14), y - 6, '#ffffff', 1, 40);
          if (k >= 1) { d.done = true; b.res[d.boiled ? 'b' : 'n'] = b.T; c.float(`${b.T}초`, b.x, Y0 - 20, '#ffd23f'); c.beep('ok'); check(); } }
        if (d.boiled && d.t > 4 && !d.done) { d.done = true; b.res.b = '안 뜸'; c.float('안 떠올라요!', b.x, Y0 - 20, '#ff8a6a'); check(); }
        c.rr(b.x - 22, y - 3, 44, 6, 3, d.boiled ? '#b8a070' : '#f4e8c0');
        if (d.done) { d.clr = (d.clr || 0) + dt; if (d.clr > 1.5) b.disc = null; } });
      const a = c.active(); c.tip(a === 'conc' ? '감자즙 종이를 A, B, C에 하나씩 넣어요' : a === 'ph' ? 'D와 E에도 넣어요' : a === 'boil' ? '끓인 감자즙 종이를 A에' : '');
    });
    function check() { const r = n => B.find(b => b.n === n).res;
      if (r('A').n && r('B').n && r('C').n) c.hit('conc', '종이가 떠오르는 건 카탈레이스가 과산화 수소(기질)를 분해해 만든 <b>O₂ 기포</b> 때문. 기질 농도가 높을수록(A > B > C) 빨리 떠올라요 → <b>기질 농도가 높을수록 반응 속도가 빠름</b> (효소가 다 찰 때까지).');
      if (r('A').n && r('D').n && r('E').n) c.hit('ph', '기질 양이 같아도 산(D)·염기(E)를 넣으면 늦게 떠올라요 → 효소는 <b>최적 pH</b>에서 가장 잘 작용하고, pH가 바뀌면 활성이 떨어져요.');
      if (r('A').b) c.hit('boil', '끓인 감자즙은 종이가 떠오르지 않아요 → 높은 온도에서 효소 단백질이 <b>변성</b>되어 기질과 결합하지 못해요.'); }
    c.test = async () => { for (const i of [0, 1, 2, 3, 4]) { c.simDrop(dN, B[i].x, 400); } await c.wait(6.5); c.simDrop(dB, B[0].x, 400); await c.wait(5); };
  });
})();
