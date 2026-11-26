/* 학습 애니메이션 2: 자기 유변 유체 · 수치예보 · 건축법 · 공모/공시 · 섀플리 값 · 호네트/버틀러 */
(() => {
  const { C, clamp, lerp, ease, seg } = KOA;
  const seglab = (el, S, key, cb) => { el.addEventListener('click', e => { const b = e.target.closest(`[data-${key}]`); if (!b) return; S[key] = b.dataset[key]; el.querySelectorAll(`[data-${key}]`).forEach(x => x.classList.toggle('on', x === b)); cb && cb(); }); };
  const meter = (k, x, y, w, v, lab, col) => { k.txt(lab, x, y - 14, { size: 13, bold: true, align: 'left' }); k.rr(x, y - 4, w, 12, 5, '#eee'); k.rr(x, y - 4, w * clamp(v, 0, 1), 12, 5, col || C.red); };

  /* ───────── 자기 유변 유체 ───────── */
  KOA.def('mrf', {
    init(S) { S.amp = .6; S.ref = .35; S.ctl = true; S.x = 0; S.v = 0; S.hist = []; },
    steps: [
      { cap: '자기 유변 유체 = 액체 + <b>마이크로미터 자성 입자</b>. 자기장이 생기면 입자가 자기장 방향으로 <b>줄지어 배열</b> → 운동에 저항하는 <b>점성↑</b>', dur: 6 },
      { cap: '시스템: <b>가속도 감지기 · 제어기 · 감쇠기</b>가 <b>응답 인식 과정 ↔ 감쇠 제어 과정</b>을 계속 순환', dur: 5 },
      { cap: '응답 인식: 건물이 → 로 가면 질량체는 <b>관성</b>으로 ← <b>반대 방향</b>으로 압전소자를 누름 → <b>전압</b>(작아서 왜곡 쉬움) → 자체 전원 가진 <b>제어기가 감지기로 전류</b>를 보내 증폭 → 가속도 산출', dur: 9 },
      { cap: '감쇠 제어: 피스톤이 <b>건물 운동 방향</b>으로 → 그쪽 유체가 <b>피스톤 구멍</b>을 지나 반대쪽으로 → <b>마찰</b> → 운동 에너지 → <b>열에너지</b> = 감쇠', dur: 7 },
      { cap: '가속도 &gt; <b>기준값</b> → 제어기가 <b>감쇠기로 전류</b> → 자기장 → 점성↑ → 감쇠력↑ (전류 ∝ 자기장 ∝ 점성). 기준값보다 작아지면 전류 ✖ → <b>기존 점성만으로</b> 감쇠(감쇠는 계속!)', dur: 9 },
      { cap: '직접 해 보기: 지진 세기와 기준값을 바꾸고, 제어를 꺼 보세요.', lab: true }
    ],
    lab: { html: `<h4>🧪 제진 시스템 실험</h4><div class="row"><label>진동(지진) 세기 <input type="range" min="0" max="100" value="60" data-a></label><label>기준값 <input type="range" min="10" max="90" value="35" data-r></label></div><div class="row seg"><button data-c="1" class="on">제어 켜기</button><button data-c="0">제어 끄기 (기존 점성만)</button></div><div class="out">빨간 선(기준값)을 넘으면 전류가 흐르고 점성·감쇠력이 커져요.</div>`,
      bind(el, S) { el.querySelector('[data-a]').oninput = e => S.amp = e.target.value / 100; el.querySelector('[data-r]').oninput = e => S.ref = e.target.value / 100; el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; S.ctl = b.dataset.c === '1'; el.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('on', x === b)); }); } },
    draw(k, S, u, s) { const t = S.t, g = k.g;
      const building = (x, y, off, h = 230) => { g.save(); g.translate(x, y); g.transform(1, 0, off / h, 1, 0, 0); k.rr(-50, -h, 100, h, 4, '#dfe6f1', C.ink, 2.5); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) k.rr(-38 + j * 28, -h + 14 + i * 36, 18, 22, 2, '#9fb6d6'); g.restore(); k.rr(x - 80, y, 160, 10, 3, '#8b7355'); };
      if (S.k === 0) { const on = u > .35; k.rr(150, 80, 360, 260, 18, '#eef0f4', C.ink, 3); k.txt(on ? '자기장 ON' : '자기장 OFF', 330, 60, { size: 18, bold: true, color: on ? C.red : C.gray });
        if (on) { for (let x = 175; x < 500; x += 40) k.arrow(x, 345, x, 75, { color: '#ff9a8a', w: 2, alpha: .6 }); }
        const a = ease(seg(u, .35, .75)); for (let i = 0; i < 48; i++) { const cx = 180 + (i % 8) * 42, cy = 110 + Math.floor(i / 8) * 38, rx = 180 + ((i * 97) % 300) + Math.sin(t + i) * 8, ry = 105 + ((i * 53) % 220) + Math.cos(t * 1.3 + i) * 8; k.circ(lerp(rx, cx, a), lerp(ry, cy, a), 7, '#555'); }
        meter(k, 540, 200, 100, .2 + .7 * a, '점성', C.red); k.txt('입자 = 마이크로미터 단위', 330, 380, { size: 15, bold: true, color: C.gray }); }
      if (S.k === 1) { building(110, 380, Math.sin(t * 3) * 14); const P = [[330, 90, '가속도\n감지기'], [540, 250, '제어기'], [330, 340, '감쇠기']]; P.forEach(([x, y, l]) => k.box(x - 70, y - 35, 140, 70, l, { fill: C.cream, size: 17 }));
        k.arrow(410, 110, 520, 205, { color: C.blue, label: '응답 인식', lx: 38 }); k.arrow(520, 295, 410, 335, { color: C.red, label: '감쇠 제어', ly: 24, lx: 20 }); k.arrow(290, 300, 290, 130, { color: C.gray, dash: [6, 6], label: '↻ 순환', lx: -36 });
        const f = (t * .4) % 1; const pts = [[410, 110], [520, 205], [520, 295], [410, 335], [290, 300], [290, 130]]; const i = Math.floor(f * 6) % 6, j = (i + 1) % 6, ff = (f * 6) % 1; k.circ(lerp(pts[i][0], pts[j][0], ff), lerp(pts[i][1], pts[j][1], ff), 8, C.yel, C.ink, 2); }
      if (S.k === 2) { const sh = Math.sin(t * 2.2) * 30, acc = -Math.sin(t * 2.2); building(90, 400, sh * .5, 200); k.txt('건물', 90, 420, { size: 13, bold: true });
        const fx = 230 + sh; k.rr(fx, 90, 210, 120, 10, '#f4f4f8', C.ink, 3); k.txt('가속도 감지기', fx + 105, 75, { size: 15, bold: true }); k.rr(fx + 12, 110, 18, 80, 4, '#ffd24d', C.ink, 2); k.txt('압전', fx + 21, 205, { size: 11, bold: true });
        const mx = fx + 60 + 20 - sh * .55 + 20; k.rr(clamp(mx, fx + 32, fx + 150), 120, 54, 60, 8, '#888', C.ink, 2); k.txt('질량체', clamp(mx, fx + 32, fx + 150) + 27, 150, { size: 12, bold: true, color: '#fff' });
        const press = sh > 5; if (press) { k.spark(fx + 21, 150, 18, t, C.org); } k.arrow(fx + 105, 230, fx + 105 + (sh > 0 ? 45 : -45), 230, { color: C.blue, w: 3, label: '건물 운동', ly: 18 }); k.arrow(clamp(mx, fx + 32, fx + 150) + 27, 105, clamp(mx, fx + 32, fx + 150) + 27 + (sh > 0 ? -40 : 40), 105, { color: C.red, w: 3, label: '관성(반대)', ly: -14 });
        /* 전압 → 제어기 */ k.box(480, 280, 150, 80, '제어기\n(자체 전원 🔋)', { fill: C.cream, size: 15 }); const p1 = seg(u, .3, .55); k.arrow(fx + 21, 240, 470, 300, { p: p1, color: C.org, label: '작은 전압', ly: -10 }); const p2 = seg(u, .55, .75); k.arrow(480, 345, fx + 60, 260, { p: p2, color: C.green, label: '전류 → 증폭', ly: 22 });
        g.save(); g.beginPath(); for (let x = 0; x < 120; x++) { const amp = p2 > .9 ? 26 : 4; g.lineTo(170 + x, 370 + Math.sin(x * .2 - t * 6) * amp * (.6 + .4 * Math.abs(acc))); } g.strokeStyle = p2 > .9 ? C.green : C.org; g.lineWidth = 2.5; g.stroke(); g.restore(); k.txt(p2 > .9 ? '증폭된 전압 → 가속도 산출!' : '전압이 너무 작음…', 230, 410, { size: 14, bold: true, color: p2 > .9 ? C.green : C.org }); }
      if (S.k === 3) { const px = Math.sin(t * 2) * 90, vel = Math.cos(t * 2); building(70, 330, px * .25, 160); k.rr(150, 180, 460, 110, 30, '#e9eef7', C.ink, 3); k.txt('실린더 (자기 유변 유체로 가득)', 380, 160, { size: 15, bold: true });
        const cx = 380 + px; k.rr(cx - 22, 184, 44, 102, 6, '#7a8699', C.ink, 2); k.rr(cx - 22, 228, 44, 14, 3, '#e9eef7'); k.line([cx, 140, cx, 184], C.ink, 6); k.txt('피스톤', cx, 315, { size: 14, bold: true });
        for (let i = 0; i < 26; i++) { const f = (t * 1.2 + i / 26) % 1; const dir = vel > 0 ? 1 : -1; const x = cx + dir * (40 - f * 80) * (Math.abs(f - .5) < .3 ? 1 : 1.6), y = 235 + (Math.abs(f - .5) < .28 ? 0 : Math.sin(i) * 34); k.circ(clamp(x, 158, 602), y, 4, '#444'); }
        const heat = Math.abs(vel); g.save(); g.globalAlpha = .45 * heat; k.circ(cx, 235, 34, '#ff8a3d'); g.restore(); k.txt('🔥 마찰 → 열', cx, 360, { size: 16, bold: true, color: C.org, alpha: heat });
        k.arrow(cx, 120, cx + (vel > 0 ? 60 : -60), 120, { color: C.blue, label: '건물 운동 방향', ly: -14 }); k.txt('운동 에너지 → 열에너지 = 감쇠', 380, 410, { size: 17, bold: true, color: C.red }); }
      if (S.k === 4) { const x0 = 40, y0 = 70, w = 380, h = 260; k.rr(x0, y0, w, h, 8, '#fff', '#ccc', 1.5); k.txt('가속도의 크기', x0 + 60, y0 - 12, { size: 14, bold: true }); const ref = .45;
        const A = tt => Math.abs(Math.sin(tt * 3)) * (Math.exp(-Math.pow((tt - 3.5) / 1.6, 2)) * .9 + .12); const ty = y0 + h - ref * h; k.line([x0, ty, x0 + w, ty], C.red, 2.5, [8, 6]); k.txt('기준값', x0 + w - 30, ty - 12, { size: 13, bold: true, color: C.red });
        const now = u * 7; g.beginPath(); for (let i = 0; i <= w; i++) { const tt = i / w * 7; if (tt > now) break; const v = A(tt); g.lineTo(x0 + i, y0 + h - v * h); } g.strokeStyle = C.blue; g.lineWidth = 2.5; g.stroke(); const cur = A(now), over = cur > ref;
        k.box(450, 70, 180, 50, over ? '⚡ 전류 ON' : '전류 OFF', { fill: over ? C.yel : '#eee', stroke: over ? C.red : '#aaa', size: 18 }); const I = over ? clamp((cur - ref) / (1 - ref) * 1.6, .2, 1) : 0;
        meter(k, 450, 165, 180, I, '전류', C.yel); meter(k, 450, 215, 180, I, '자기장', C.pur); meter(k, 450, 265, 180, .2 + .8 * I, '점성', C.red); meter(k, 450, 315, 180, .2 + .8 * I, '감쇠력', C.green);
        k.txt(over ? '기준값 초과 → 점성·감쇠력 ↑' : '기준값 이하 → 기존 점성만으로 감쇠', 330, 400, { size: 16, bold: true, color: over ? C.red : C.navy }); }
      if (S.k === 5) { const dt = 1 / 60, w0 = 4; const F = S.amp * 9 * Math.sin(w0 * .95 * t); const a = -w0 * w0 * S.x - (S.c || .3) * S.v + F; const am = clamp(Math.abs(a) / 14, 0, 1);
        const I = S.ctl && am > S.ref ? clamp((am - S.ref) / (1 - S.ref) * 1.5, .15, 1) : 0; S.c = .35 + 3.2 * I; S.v += a * dt; S.x += S.v * dt; S.hist.push(am); if (S.hist.length > 300) S.hist.shift();
        building(110, 400, clamp(S.x * 60, -70, 70), 250); k.rr(220, 70, 300, 170, 8, '#fff', '#ccc', 1.5); k.txt('가속도 크기', 270, 58, { size: 13, bold: true }); const ty = 240 - S.ref * 170; k.line([220, ty, 520, ty], C.red, 2, [6, 5]);
        g.beginPath(); S.hist.forEach((v, i) => g.lineTo(220 + i, 240 - v * 170)); g.strokeStyle = C.blue; g.lineWidth = 2; g.stroke();
        meter(k, 250, 290, 140, I, '전류', C.yel); meter(k, 250, 335, 140, I, '자기장', C.pur); meter(k, 430, 290, 140, .2 + .8 * I, '점성', C.red); meter(k, 430, 335, 140, .2 + .8 * I, '감쇠력', C.green);
        k.txt(S.ctl ? (I > 0 ? '기준값 초과 → 전류 → 감쇠력↑' : '기준값 이하 → 기존 점성만') : '제어 꺼짐: 기존 점성만으로 감쇠', 400, 390, { size: 15, bold: true, color: I > 0 ? C.red : C.navy }); }
    }
  });

  /* ───────── 수치예보 ───────── */
  function iso(k, x, y, s, col, a) { const g = k.g; g.save(); g.globalAlpha = a == null ? 1 : a; g.translate(x, y); const top = [[0, -s * .5], [s, 0], [0, s * .5], [-s, 0]];
    g.beginPath(); top.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fillStyle = col || '#dfe9ff'; g.fill(); g.strokeStyle = '#5a6a8a'; g.lineWidth = 1.2; g.stroke();
    g.beginPath(); g.moveTo(-s, 0); g.lineTo(-s, s * .8); g.lineTo(0, s * 1.3); g.lineTo(0, s * .5); g.closePath(); g.fillStyle = '#c4d3f0'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(s, 0); g.lineTo(s, s * .8); g.lineTo(0, s * 1.3); g.lineTo(0, s * .5); g.closePath(); g.fillStyle = '#aebfe2'; g.fill(); g.stroke(); g.restore(); }
  KOA.def('nwp', {
    init(S) { S.mode = 'cfl'; S.dx = 20; S.dtv = 150; S.damp = true; S.top = 60; },
    steps: [
      { cap: '수치예보: 대기의 운동·변화를 설명하는 방정식을 슈퍼컴퓨터로 계산 → 미래 대기 상태를 <b>모의</b>(= <b>근사해</b>를 구함). 먼저 영역을 정하고 <b>격자</b>로 잘게!', dur: 6 },
      { cap: '수평 해상도 ↑ = 격자점 간 거리 <b>좁게</b>, 연직 해상도 ↑ = 층수 <b>많게</b>. 분해능은 <b>값이 작을수록 높다</b>(거리·시간 간격이 작을수록 세밀)', dur: 7 },
      { cap: '시간 간격의 <b>상한선</b> = 수평 격자 간격 ÷ 대기 <b>최대 속도</b>. 한 번에 격자 간격보다 멀리 가 버리면 → <b>값을 구할 수 없는 격자점</b>이 생김!', dur: 8 },
      { cap: '수평 분해능을 2배로 → 안정성 위해 연직·시간도 2배 → x·y·z·시간 <b>네 방향 모두 2배</b> → 계산량 <b>2⁴ = 16배</b>', dur: 8 },
      { cap: '<b>초기 조건</b>(시간): 모의를 시작하는 순간의 대기 상태를 <b>격자점마다 하나하나</b> 넣어 줌', dur: 5 },
      { cap: '<b>하단 경계</b>: 대기는 땅을 뚫지 못함 → 연직 운동 0으로 <b>가정</b>. 그러나 지표면이 흡수한 태양 에너지가 <b>열·수증기</b>로 올라감 → 이 에너지 흐름은 <b>반영</b>!', dur: 7 },
      { cap: '<b>상단 경계</b>: 최상층 연직 속도를 0으로 두면, 빠져나가야 할 에너지가 <b>반사</b>되어 내부로 → 에너지가 비현실적으로 쌓여 <b>왜곡</b>', dur: 7 },
      { cap: '완화: <b>감쇠층</b>에서 흡수(전자) + 위로 <b>자연스럽게 흩어지게</b>(후자)를 <b>함께</b>. 최상층 약 <b>80 km 이상</b>이면 후자가, 낮으면 전자가 주요', dur: 8 },
      { cap: '<b>측면 경계</b>: <b>지역 모델</b>에서 설정. 모든 층에서 공기가 드나듦 → 상위 모델인 <b>전지구 모델</b> 자료를 받아 경계 조건으로 → 두 모델 값의 불일치 최소화', dur: 7 },
      { cap: '직접 해 보기: 시간 간격 상한선, 상단 경계를 실험해 봐요.', lab: true }
    ],
    lab: { html: `<h4>🧪 수치예보 실험실</h4><div class="row seg"><button data-mode="cfl" class="on">⏱ 시간 간격 상한선</button><button data-mode="top">⬆ 상단 경계</button></div>
      <div class="row" data-g="cfl"><label>격자 간격 Δx <input type="range" min="5" max="40" value="20" data-dx></label><b data-dxv></b><label>시간 간격 Δt <input type="range" min="10" max="600" step="10" value="150" data-dt></label><b data-dtv></b></div>
      <div class="row" data-g="top" hidden><button class="tapme" data-damp>감쇠층: 켜짐</button><label>최상층 고도 <input type="range" min="30" max="100" value="60" data-top></label><b data-topv></b></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'); const upd = () => { el.querySelector('[data-g=cfl]').hidden = S.mode !== 'cfl'; el.querySelector('[data-g=top]').hidden = S.mode !== 'top';
          el.querySelector('[data-dxv]').textContent = S.dx + ' km'; el.querySelector('[data-dtv]').textContent = S.dtv + ' 초'; el.querySelector('[data-topv]').textContent = S.top + ' km'; el.querySelector('[data-damp]').textContent = '감쇠층: ' + (S.damp ? '켜짐' : '꺼짐');
          const lim = S.dx * 1000 / 100; out.innerHTML = S.mode === 'cfl' ? `대기 최대 속도 100 m/s 가정 → 상한선 = ${S.dx * 1000} m ÷ 100 m/s = <b>${lim}초</b>. 지금 Δt = ${S.dtv}초 → ${S.dtv <= lim ? '✅ 상한선 안: 모든 격자점 계산 가능' : '❌ 상한선 초과: 대기가 한 번에 격자 간격보다 멀리 가서 <b>값을 못 구하는 격자점</b> 발생'}`
            : `최상층 ${S.top} km → ${S.top >= 80 ? '<b>자연스럽게 흩어지게 계산(후자)</b>이 주요' : '<b>감쇠층 흡수(전자)</b>가 주요'}. 두 방법은 <b>함께</b> 적용. ${S.damp ? '' : '<br>⚠️ 감쇠층을 끄면 반사된 에너지가 쌓여 왜곡 ↑'}`; };
        seglab(el, S, 'mode', upd); el.querySelector('[data-dx]').oninput = e => { S.dx = +e.target.value; upd(); }; el.querySelector('[data-dt]').oninput = e => { S.dtv = +e.target.value; upd(); }; el.querySelector('[data-top]').oninput = e => { S.top = +e.target.value; upd(); };
        el.querySelector('[data-damp]').onclick = () => { S.damp = !S.damp; upd(); }; upd(); } },
    draw(k, S, u, s) { const t = S.t, g = k.g;
      const cfl = (dx, dtv, y0) => { const n = Math.round(560 / (dx * 8)), sp = 560 / n; for (let i = 0; i <= n; i++) { k.circ(50 + i * sp, y0, 6, '#fff', C.navy, 2); } const lim = dx * 10, ratio = dtv / lim; const stepPx = sp * ratio, nstep = Math.floor(((t * .8) % 6) / .6);
        for (let j = 0; j <= nstep; j++) { const x = 50 + j * stepPx; if (x > 620) break; k.circ(x, y0 - 34, 12, ratio > 1 ? C.red : C.green, C.ink, 2); if (j > 0) k.arrow(50 + (j - 1) * stepPx + 12, y0 - 34, x - 12, y0 - 34, { color: ratio > 1 ? C.red : C.green, w: 2.5 }); }
        if (ratio > 1) for (let i = 1; i <= n; i++) { const x = 50 + i * sp; let hit = false; for (let j = 0; j <= nstep; j++) if (Math.abs(50 + j * stepPx - x) < sp * .5 && Math.abs(50 + j * stepPx - x) < stepPx * .5) hit = true; if (!hit && x < 50 + nstep * stepPx) k.txt('✖', x, y0 + 22, { size: 16, bold: true, color: C.red }); }
        k.txt(`격자 간격 ${dx} km · 한 번에 이동 ${Math.round(dx * ratio)} km`, 330, y0 + 50, { size: 15, bold: true, color: ratio > 1 ? C.red : C.green }); };
      const waves = (damp, top, y0, y1, reflect) => { for (let i = 0; i < 5; i++) { const f = (t * .35 + i / 5) % 1; const up = f < .5, ff = up ? f * 2 : (f - .5) * 2; const y = up ? lerp(y0, y1, ff) : lerp(y1, y0, ff); let a = 1; if (!up) { a = reflect ? (damp ? .25 : .9) : 0; } if (up && damp && y < y1 + 60) a *= .7;
          g.save(); g.globalAlpha = a; g.beginPath(); for (let x = 90; x < 570; x += 4) g.lineTo(x, y + Math.sin(x * .05 + t * 4) * 6); g.strokeStyle = up ? C.org : C.red; g.lineWidth = 3; g.stroke(); g.restore(); } };
      if (S.k === 0) { const n = Math.floor(ease(u) * 36); let c = 0; for (let z = 0; z < 3; z++) for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) { if (c++ >= n) continue; iso(k, 330 + (x - y) * 46, 140 + (x + y) * 23 - z * 46 + 60, 46, z === 2 ? '#e9f0ff' : '#dfe9ff'); }
        k.txt('대기를 육면체 공기 덩이로!', 330, 50, { size: 20, bold: true }); k.tag('연직: 층', 90, 230, C.navy); k.tag('수평: 위도·경도 격자', 520, 390, C.navy); }
      if (S.k === 1) { const sp = lerp(80, 40, ease(seg(u, .2, .7))); for (let x = 60; x <= 600; x += sp) k.line([x, 80, x, 340], '#9fb0d0', 1.5); for (let y = 80; y <= 340; y += sp) k.line([60, y, 600, y], '#9fb0d0', 1.5); for (let x = 60; x <= 600; x += sp) for (let y = 80; y <= 340; y += sp) k.circ(x, y, 3, C.navy);
        k.arrow(60, 360, 60 + sp, 360, { color: C.red, w: 3 }); k.txt(`격자점 간 거리 ${Math.round(sp / 4)} km → ${sp < 50 ? '분해능 ↑ (값 작을수록 ↑)' : ''}`, 330, 395, { size: 16, bold: true, color: C.red }); }
      if (S.k === 2) { k.txt('대기 최대 속도 100 m/s, 격자 간격 20 km → 상한선 200초', 330, 45, { size: 16, bold: true }); k.txt('Δt = 150초 ✅', 120, 110, { size: 16, bold: true, color: C.green }); S._t = t; cfl(20, 150, 180); k.txt('Δt = 300초 ❌', 120, 260, { size: 16, bold: true, color: C.red }); cfl(20, 300, 330); }
      if (S.k === 3) { const ph = Math.floor(u * 5); const L = ['1', '× 2 (x)', '× 2 (y)', '× 2 (z)', '× 2 (시간)']; let cnt = [1, 2, 4, 8, 16][Math.min(4, ph)];
        const sx = ph >= 1 ? 2 : 1, sy = ph >= 2 ? 2 : 1, sz = ph >= 3 ? 2 : 1, s0 = 90; for (let z = 0; z < sz; z++) for (let y = 0; y < sy; y++) for (let x = 0; x < sx; x++) iso(k, 200 + (x * (s0 / sx) - y * (s0 / sy)) * 1, 170 + (x * (s0 / sx) + y * (s0 / sy)) * .5 - z * (s0 / sz) * 1 + (sz === 2 ? 40 : 0), Math.min(s0 / sx, s0 / sy, s0 / sz), '#dfe9ff');
        if (ph >= 4) { k.circ(470, 180, 44, '#fff', C.ink, 3); k.line([470, 180, 470, 148], C.ink, 3); k.line([470, 180, 494, 190], C.red, 3); k.txt('시간 간격 ½', 470, 245, { size: 14, bold: true }); }
        k.txt(L.slice(0, ph + 1).join(' '), 330, 330, { size: 20, bold: true, color: C.navy }); k.txt(`계산량 = ${cnt}배${cnt === 16 ? ' = 2⁴' : ''}`, 330, 380, { size: 26, bold: true, color: C.red }); }
      if (S.k === 4) { for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { const on = seg(u, (i * 5 + j) / 45 * .8, (i * 5 + j) / 45 * .8 + .1); const T = 10 + ((i * 7 + j * 13) % 20); const col = `hsl(${220 - T * 7},80%,${60}%)`; k.circ(80 + i * 62, 90 + j * 60, 18 * on, col, C.ink, 1); if (on > .9) k.txt(T + '°', 80 + i * 62, 90 + j * 60, { size: 11, bold: true }); }
        k.txt('t = 0 (모의 시작) · 격자점마다 개별 값', 330, 410, { size: 16, bold: true, color: C.navy }); }
      if (S.k === 5) { k.rr(0, 330, 660, 110, 0, '#c9b38f'); k.txt('지표면', 80, 390, { size: 16, bold: true }); k.circ(560, 70, 34, C.yel, C.org, 3); k.arrow(530, 100, 420, 320, { color: C.org, w: 3, label: '태양 에너지 흡수' });
        k.arrow(200, 250, 200, 325, { color: '#999', w: 3 }); k.txt('✖ 연직 운동 0 (가정)', 200, 225, { size: 15, bold: true, color: C.gray });
        for (let i = 0; i < 3; i++) { const yy = 320 - ((t * 60 + i * 50) % 150); g.save(); g.globalAlpha = 1 - (320 - yy) / 150; g.beginPath(); for (let y = 0; y < 40; y++) g.lineTo(380 + i * 40 + Math.sin(y * .3 + t * 4) * 6, yy - y); g.strokeStyle = i % 2 ? C.blue : C.red; g.lineWidth = 3; g.stroke(); g.restore(); }
        k.txt('열 · 수증기 → 대기 변수에 직접 영향 → 반영!', 420, 170, { size: 15, bold: true, color: C.red }); }
      if (S.k === 6 || S.k === 7) { const damp = S.k === 7; k.rr(80, 70, 500, 310, 6, '#f3f7ff', C.navy, 2); k.line([80, 70, 580, 70], C.ink, 5); k.txt('최상층 (연직 속도 0)', 330, 52, { size: 15, bold: true });
        if (damp) { g.save(); g.globalAlpha = .35; k.rr(82, 72, 496, 70, 0, '#b9c8ee'); g.restore(); k.txt('감쇠층(흡수)', 520, 110, { size: 14, bold: true, color: C.navy }); }
        waves(damp, 0, 360, 85, true); k.txt(damp ? '반사가 약해짐 → 왜곡 완화' : '↩ 반사 → 에너지 비현실적 증가 → 왜곡', 330, 410, { size: 16, bold: true, color: damp ? C.green : C.red });
        if (damp) { k.txt('80 km 이상: 흩어지게(후자) 주요\n낮으면: 감쇠층(전자) 주요', 330, 250, { size: 15, bold: true, color: C.navy, alpha: seg(u, .4, .6) }); } }
      if (S.k === 8) { k.circ(200, 230, 150, '#d9ecff', C.blue, 3); g.save(); g.beginPath(); g.arc(200, 230, 150, 0, 7); g.clip(); for (let i = 0; i < 6; i++) k.line([50, 120 + i * 40, 350, 140 + i * 40], '#a7c8f0', 2); g.restore(); k.txt('전지구 모델', 200, 405, { size: 16, bold: true, color: C.blue });
        k.rr(180, 160, 90, 80, 4, '#fff7c8', C.red, 3); k.txt('지역', 225, 200, { size: 14, bold: true }); k.rr(420, 110, 200, 180, 6, '#fff7c8', C.red, 3); k.txt('지역 모델', 520, 200, { size: 18, bold: true, color: C.red }); k.line([270, 160, 420, 110], '#c99', 1.5, [5, 5]); k.line([270, 240, 420, 290], '#c99', 1.5, [5, 5]);
        [[400, 150, 0], [400, 250, 0], [520, 90, 1], [520, 310, 1], [640, 200, 2]].forEach(([x, y, d], i) => { const f = (t * .6 + i / 5) % 1; if (d === 0) k.arrow(x - 40, y, x + 10, y, { color: C.blue, alpha: 1 - f * .5 }); else if (d === 1) k.arrow(x, y + (y < 200 ? -30 : 30), x, y + (y < 200 ? 10 : -10), { color: C.blue }); else k.arrow(x - 10, y, x - 30, y, { color: C.blue }); });
        k.txt('측면 경계 조건 = 전지구 모델 자료', 500, 340, { size: 14, bold: true, color: C.blue }); }
      if (S.k === 9) { if (S.mode === 'cfl') { k.txt(`대기 최대 속도 100 m/s · 상한선 = ${S.dx * 10}초`, 330, 60, { size: 17, bold: true }); cfl(S.dx, S.dtv, 240); }
        else { const top = S.top, yTop = lerp(380, 70, top / 100); k.rr(80, yTop, 500, 380 - yTop, 6, '#f3f7ff', C.navy, 2); k.line([80, yTop, 580, yTop], C.ink, 5); k.txt(`최상층 ${top} km`, 330, yTop - 16, { size: 15, bold: true });
          if (S.damp) { g.save(); g.globalAlpha = .35; k.rr(82, yTop + 2, 496, 50, 0, '#b9c8ee'); g.restore(); } waves(S.damp, 0, 370, yTop + 10, top < 80 || !S.damp ? true : false); } }
    }
  });

  /* ───────── 건축법 ───────── */
  KOA.def('arch', {
    init(S) { S.mode = 'line'; S.rw = 3; S.w1 = 6; S.w2 = 6; S.ang = 90; S.area = 400; S.bcr = 50; S.far = 150; S.fl = 100; },
    steps: [
      { cap: '<b>대지</b> = 건축할 수 있는 땅. <b>도로에 2m 이상</b> 맞닿아야(접도 요건). 건축법상 도로 = <b>보행 + 자동차</b> 모두 가능 + 너비(소요 너비) <b>4m</b>', dur: 7 },
      { cap: '대지면적은 실제 표면적 ✖ → <b>수평투영면적</b>(위에서 내려다본 넓이). 경사진 땅도 마찬가지!', dur: 6 },
      { cap: '도로가 <b>4m 미만</b>이면 → 도로 <b>중심선에서 2m</b> 물러난 선 = 건축선 → 그 안쪽 땅은 대지면적에서 빠짐 (예: 3m 도로 → 양쪽 대지 각각 0.5m 후퇴)', dur: 8 },
      { cap: '<b>가각정리</b>: 두 도로 <b>모두 8m 미만</b> + 교차각 <b>120° 미만</b>인 모퉁이 대지 → 모퉁이를 잘라 도로에 편입. 하나라도 8m 이상이거나 120° 이상이면 ✖', dur: 8 },
      { cap: '<b>건폐율</b> = 건축면적 ÷ 대지면적 (평면, 공지 확보 → 일조·통풍·화재 확산 방지) / <b>용적률</b> = 연면적 ÷ 대지면적 (입체)', dur: 8 },
      { cap: '층수 = 최대 연면적 ÷ 최대 건축면적 = <b>최대 용적률 ÷ 최대 건폐율</b> → 대지면적이 달라도 층수는 같다! (10월 20번 ④)', dur: 8 },
      { cap: '㉠ 용적률 산정용 연면적에서는 <b>지상 부속 주차장·피난 안전 구역</b>을 뺀다 → 공공의 편의·안전 공간을 보장 (10월 18번 ①)', dur: 7 },
      { cap: '직접 해 보기: 건축선 · 가각정리 · 건폐율/용적률을 숫자로 바꿔 봐요.', lab: true }
    ],
    lab: { html: `<h4>🧪 건축법 계산기</h4><div class="row seg"><button data-mode="line" class="on">건축선</button><button data-mode="corner">가각정리</button><button data-mode="size">건폐율·용적률</button></div>
      <div class="row" data-g="line"><label>도로 너비 <input type="range" min="2" max="6" step=".5" value="3" data-k="rw"></label><b data-o="rw"></b></div>
      <div class="row" data-g="corner" hidden><label>도로①<input type="range" min="2" max="12" value="6" data-k="w1"></label><b data-o="w1"></b><label>도로②<input type="range" min="2" max="12" value="6" data-k="w2"></label><b data-o="w2"></b><label>교차각<input type="range" min="60" max="150" step="5" value="90" data-k="ang"></label><b data-o="ang"></b></div>
      <div class="row" data-g="size" hidden><label>대지면적<input type="range" min="100" max="600" step="20" value="400" data-k="area"></label><b data-o="area"></b><label>건폐율<input type="range" min="10" max="80" step="5" value="50" data-k="bcr"></label><b data-o="bcr"></b><label>용적률<input type="range" min="50" max="400" step="10" value="150" data-k="far"></label><b data-o="far"></b><label>층 바닥면적(최대 대비)<input type="range" min="30" max="100" step="5" value="100" data-k="fl"></label><b data-o="fl"></b></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'), U = { rw: 'm', w1: 'm', w2: 'm', ang: '°', area: '㎡', bcr: '%', far: '%', fl: '%' };
        const upd = () => { ['line', 'corner', 'size'].forEach(m => el.querySelector(`[data-g=${m}]`).hidden = S.mode !== m); el.querySelectorAll('[data-o]').forEach(b => b.textContent = S[b.dataset.o] + U[b.dataset.o]);
          if (S.mode === 'line') { const sb = Math.max(0, (4 - S.rw) / 2); out.innerHTML = S.rw >= 4 ? '도로가 소요 너비(4m) 이상 → 건축선 = 대지와 도로의 경계선 (후퇴 없음)' : `도로 ${S.rw}m &lt; 4m → 중심선에서 2m 물러난 선이 건축선 → 양쪽 대지가 각각 <b>${sb}m</b> 후퇴 → 그만큼 대지면적 감소`; }
          if (S.mode === 'corner') { const ok = S.w1 < 8 && S.w2 < 8 && S.ang < 120; out.innerHTML = ok ? '✅ 두 도로 모두 8m 미만 + 교차각 120° 미만 → <b>가각정리 적용</b> (모퉁이를 잘라 도로로)' : `❌ 가각정리 적용 안 됨: ${S.w1 >= 8 || S.w2 >= 8 ? '한 도로가 8m 이상' : ''}${(S.w1 >= 8 || S.w2 >= 8) && S.ang >= 120 ? ' · ' : ''}${S.ang >= 120 ? '교차각 120° 이상' : ''}`; }
          if (S.mode === 'size') { const fa = S.area * S.bcr / 100, gfa = S.area * S.far / 100, fl = fa * S.fl / 100, n = gfa / fl; out.innerHTML = `최대 건축면적 = ${S.area}×${S.bcr}% = <b>${fa}㎡</b> · 최대 연면적 = ${S.area}×${S.far}% = <b>${gfa}㎡</b><br>층 바닥면적 ${fl.toFixed(0)}㎡ → 층수 = ${gfa}÷${fl.toFixed(0)} = <b>${n.toFixed(1)}층</b>${S.fl === 100 ? ` = 용적률÷건폐율 = ${S.far}÷${S.bcr}` : ' (바닥을 좁히면 층수↑)'}`; } };
        seglab(el, S, 'mode', upd); el.querySelectorAll('input[data-k]').forEach(r => r.oninput = () => { S[r.dataset.k] = +r.value; upd(); }); upd(); } },
    draw(k, S, u, s) { const t = S.t, g = k.g; const hatch = (x, y, w, h, col) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); for (let i = -h; i < w; i += 9) k.line([x + i, y + h, x + i + h, y], col || C.red, 1.5); g.restore(); k.rr(x, y, w, h, 0, null, col || C.red, 1.5); };
      const road = (x, y, w, h, lab) => { k.rr(x, y, w, h, 0, '#cfcfd4'); if (lab) k.txt(lab, x + w / 2, y + h / 2, { size: 14, bold: true, color: '#555' }); };
      const lotLine = (rw, y0) => { /* 두 대지 사이 세로 도로 */ const px = 22, cx = 330, half = rw / 2 * px; road(cx - half, y0, half * 2, 260); k.line([cx, y0, cx, y0 + 260], '#fff', 2, [8, 6]); k.rr(60, y0, cx - half - 60, 260, 0, '#e6f2d8', C.ink, 2); k.rr(cx + half, y0, 600 - cx - half, 260, 0, '#e6f2d8', C.ink, 2); k.txt('대지', 150, y0 + 130, { size: 18, bold: true }); k.txt('대지', 510, y0 + 130, { size: 18, bold: true });
        if (rw < 4) { const bl = 2 * px; hatch(cx - bl, y0, bl - half, 260); hatch(cx + half, y0, bl - half, 260); k.line([cx - bl, y0 - 10, cx - bl, y0 + 270], C.red, 3); k.line([cx + bl, y0 - 10, cx + bl, y0 + 270], C.red, 3); k.txt('건축선', cx - bl - 30, y0 - 14, { size: 13, bold: true, color: C.red }); k.txt('건축선', cx + bl + 30, y0 - 14, { size: 13, bold: true, color: C.red });
          k.arrow(cx, y0 + 290, cx + bl, y0 + 290, { color: C.red, w: 2, head: 8 }); k.txt('중심선에서 2m', cx + bl / 2, y0 + 308, { size: 13, bold: true, color: C.red }); } k.txt(`도로 ${rw}m`, cx, y0 + 130, { size: 14, bold: true }); };
      const corner = (w1, w2, ang, cut) => { const ox = 260, oy = 300, a = ang * Math.PI / 180, px = 9; const L = 360; /* 도로①: 수평(오른쪽으로), 도로②: 각도 a */
        g.save(); g.translate(ox, oy); g.fillStyle = '#cfcfd4'; g.save(); g.rotate(0); g.fillRect(-w1 * px / 2 - 40, -w1 * px / 2, L + 120, w1 * px); g.restore(); g.save(); g.rotate(-a); g.fillRect(-w2 * px / 2, -w2 * px / 2, L, w2 * px); g.restore();
        /* 모퉁이 대지: 두 도로 사이 */ g.beginPath(); const r1 = w1 * px / 2, r2 = w2 * px / 2; const s1 = [r2 / Math.sin(a) + r1 / Math.tan(a), -r1]; g.moveTo(s1[0], s1[1]); g.lineTo(300, -r1); g.lineTo(300, -240); const far2 = [Math.cos(-a) * 260 + Math.sin(a) * r2, Math.sin(-a) * 260 + Math.cos(a) * r2 * 1]; g.lineTo(far2[0], far2[1]); g.closePath(); g.fillStyle = '#e6f2d8'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
        if (cut) { const c = 50 * cut; const pA = [s1[0] + c, s1[1]], pB = [s1[0] + Math.cos(-a) * c, s1[1] + Math.sin(-a) * c]; g.beginPath(); g.moveTo(s1[0], s1[1]); g.lineTo(pA[0], pA[1]); g.lineTo(pB[0], pB[1]); g.closePath(); g.fillStyle = '#cfcfd4'; g.fill(); g.strokeStyle = C.red; g.lineWidth = 3; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(pA[0], pA[1]); g.lineTo(pB[0], pB[1]); g.stroke(); g.setLineDash([]); }
        g.restore(); k.txt('모퉁이 대지', ox + 170, oy - 140, { size: 17, bold: true }); k.txt(`도로① ${w1}m`, ox + 250, oy + 2, { size: 13, bold: true, color: '#555' }); k.txt(`도로② ${w2}m`, ox + Math.cos(-a) * 180 - 50, oy + Math.sin(-a) * 180, { size: 13, bold: true, color: '#555' }); k.txt(`${ang}°`, ox + 40, oy - 30, { size: 15, bold: true, color: C.blue });
        if (cut) k.txt('✂ 가각정리', ox + 60, oy - 70, { size: 15, bold: true, color: C.red }); };
      const bldg = (x, y, lot, bcr, far, fl, o = {}) => { /* 등각 투영 건물 */ const side = Math.sqrt(lot) * 4.2, fp = side * Math.sqrt(bcr / 100 * (fl / 100)), floors = (lot * far / 100) / (lot * bcr / 100 * fl / 100); const fh = o.fh || 22;
        const P = (a, b, h) => [x + (a - b) * .87, y + (a + b) * .5 - h]; const quad = (pts, col) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.stroke(); };
        quad([P(0, 0, 0), P(side, 0, 0), P(side, side, 0), P(0, side, 0)], '#e6f2d8'); const o0 = (side - fp) / 2, full = Math.floor(floors), part = floors - full;
        for (let i = 0; i < Math.ceil(floors - 1e-6); i++) { const hh = i < full ? fh : fh * part; const z = i * fh; const col = o.ex && o.ex[i] ? o.ex[i] : '#dfe6f1';
          quad([P(o0, o0 + fp, z), P(o0 + fp, o0 + fp, z), P(o0 + fp, o0 + fp, z + hh), P(o0, o0 + fp, z + hh)], col); quad([P(o0 + fp, o0, z), P(o0 + fp, o0 + fp, z), P(o0 + fp, o0 + fp, z + hh), P(o0 + fp, o0, z + hh)], col === '#dfe6f1' ? '#c3cfe2' : col); }
        const top = Math.ceil(floors - 1e-6) * fh - (part ? fh * (1 - part) : 0); quad([P(o0, o0, top), P(o0 + fp, o0, top), P(o0 + fp, o0 + fp, top), P(o0, o0 + fp, top)], '#eef2f8'); return floors; };
      if (S.k === 0) { k.rr(140, 70, 380, 230, 0, '#e6f2d8', C.ink, 2); k.txt('대지', 330, 170, { size: 22, bold: true }); road(60, 300, 540, 70, ''); k.txt('도로 (너비 4m 이상)', 330, 350, { size: 15, bold: true, color: '#555' });
        const p = ease(seg(u, .1, .5)); k.line([140, 300, 140 + 380 * p, 300], C.red, 6); k.txt('맞닿은 길이 ≥ 2m', 330, 280, { size: 16, bold: true, color: C.red, alpha: p });
        const cx = 60 + ((t * 80) % 540); k.txt('🚗', cx, 322, { size: 24 }); k.txt('🚶', 600 - ((t * 40) % 540), 352, { size: 22 }); k.tag('보행 + 자동차 둘 다!', 330, 405, C.navy, { alpha: seg(u, .5, .7), size: 15 }); }
      if (S.k === 1) { g.beginPath(); g.moveTo(80, 330); g.lineTo(520, 150); g.lineTo(520, 330); g.closePath(); g.fillStyle = '#e6f2d8'; g.fill(); k.line([80, 330, 520, 150], C.ink, 3); k.txt('실제 표면(경사면)', 260, 210, { size: 15, bold: true, color: C.gray });
        const p = ease(seg(u, .2, .6)); for (let x = 100; x <= 520; x += 40) { const y = 330 - (x - 80) * 180 / 440; k.line([x, y, x, y + (330 - y) * p], C.blue, 1.5, [4, 4]); } k.line([80, 345, 520, 345], C.red, 5); k.txt('수평투영면적 = 대지면적', 300, 375, { size: 18, bold: true, color: C.red, alpha: p }); }
      if (S.k === 2) lotLine(3, 80);
      if (S.k === 3) { const ph = u < .5; corner(ph ? 6 : 10, 4, 90, ph ? ease(seg(u, .15, .4)) : 0); k.box(420, 330, 220, 60, ph ? '6m·4m·90° → 가각정리 ✔' : '10m(8m 이상) → ✖', { fill: ph ? C.mint : C.pink, stroke: ph ? C.green : C.red, size: 15 }); }
      if (S.k === 4) { const p = ease(seg(u, .1, .8)); bldg(330, 150, 400, 50, 150 * p + 50 * (1 - p), 100); k.txt('대지 400㎡ · 건폐율 50% → 건축면적 200㎡', 330, 360, { size: 15, bold: true, color: C.green }); k.txt(`용적률 ${Math.round(50 + 100 * p)}% → 연면적 ${Math.round((50 + 100 * p) * 4)}㎡`, 330, 390, { size: 15, bold: true, color: C.blue }); }
      if (S.k === 5) { const a2 = lerp(400, 200, ease(seg(u, .2, .7))); bldg(170, 140, 400, 50, 150, 100); bldg(480, 160, a2, 50, 150, 100); k.txt('대지 400㎡ → 3층', 170, 380, { size: 16, bold: true }); k.txt(`대지 ${Math.round(a2)}㎡ → 3층`, 480, 380, { size: 16, bold: true }); k.txt('층수 = 150% ÷ 50% = 3 (대지면적과 무관)', 330, 415, { size: 17, bold: true, color: C.red }); }
      if (S.k === 6) { bldg(250, 110, 400, 50, 200, 100, { ex: { 0: '#c9c9c9', 2: '#ffb36b' } }); k.tag('지상 부속 주차장 → 제외', 500, 290, '#777', { size: 14 }); k.tag('피난 안전 구역 → 제외', 500, 230, C.org, { size: 14 }); k.txt('뺀 만큼 용적률 부담 ↓ → 공공의 편의·안전 공간 보장', 330, 400, { size: 16, bold: true, color: C.navy, alpha: seg(u, .3, .5) }); }
      if (S.k === 7) { if (S.mode === 'line') lotLine(S.rw, 80); if (S.mode === 'corner') corner(S.w1, S.w2, S.ang, S.w1 < 8 && S.w2 < 8 && S.ang < 120 ? 1 : 0);
        if (S.mode === 'size') { const n = bldg(300, 90, S.area, S.bcr, S.far, S.fl, { fh: Math.min(22, 260 / Math.max(1, S.far / S.bcr / (S.fl / 100))) }); k.txt(`${n.toFixed(1)}층`, 560, 120, { size: 28, bold: true, color: C.red }); } }
    }
  });

  /* ───────── 공모·공시 ───────── */
  KOA.def('disclose', {
    init(S) { S.mode = 'gm'; S.n = 40; S.resale = false; S.who = 2; S.noeff = false; },
    steps: [
      { cap: '기업은 증권(주식·채권)을 발행해 자금을 모아요. 투자자에게 증권을 사겠다는 의사 표시인 <b>청약</b>을 하라고 <b>권유</b>!', dur: 5 },
      { cap: '권유받는 대상 <b>50인 이상 = 공모</b>, 50인 미만 = <b>사모</b>(1년간 전매 제한). 단, 50인 미만이어도 <b>1년 내 전매가 가능</b>하면 <b>공모로 간주</b>!', dur: 8 },
      { cap: '상장 법인은 <b>중요사항</b>(투자 판단·법인 가치에 중대한 영향)을 공시할 의무 → <b>금융위원회</b>에 제출. 안 하면 <b>정보 불균형</b> → 신뢰·효율성 ↓', dur: 7 },
      { cap: '<b>발행 시장</b>: 공모할 때마다 <b>증권 신고서</b>(공모 관련 + 발행인 관련 사항) → 금융위 <b>심사 통과</b> → 발행 → 청약 권유 → 청약. <b>사모는 면제</b>', dur: 8 },
      { cap: '<b>유통 시장</b>: <b>정기 공시</b>(일정 기간마다, 변동 사항) · <b>수시 공시</b>(중대한 경영 정보 발생 시 신속히) · <b>공정 공시</b>(특정인에게 선별 제공하기 <b>전에</b> 먼저 공시)', dur: 9 },
      { cap: '미공개중요정보 이용 금지: <b>내부자 + 1차 정보수령자</b> (거래에 영향 없으면 ✖). 1차에게서 받은 <b>2차 이후</b>가 이용하면 → <b>시장질서 교란행위</b>', dur: 8 },
      { cap: '직접 해 보기: 공모/사모 판정, 정보 사슬에서 누가 어떤 규제를 받는지!', lab: true }
    ],
    lab: { html: `<h4>🧪 공모·공시 판정기</h4><div class="row seg"><button data-mode="gm" class="on">공모/사모 판정</button><button data-mode="chain">정보 사슬</button></div>
      <div class="row" data-g="gm"><label>권유 대상 <input type="range" min="1" max="100" value="40" data-n></label><b data-nv></b><button class="tapme" data-rs>1년 내 전매: 불가</button></div>
      <div class="row seg" data-g="chain" hidden><button data-who="0">내부자</button><button data-who="1">1차 수령자</button><button data-who="2" class="on">2차 수령자</button><button data-who="3">3차 수령자</button><button class="tapme" data-ne>거래에 영향: 있음</button></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'); const upd = () => { el.querySelector('[data-g=gm]').hidden = S.mode !== 'gm'; el.querySelector('[data-g=chain]').hidden = S.mode !== 'chain'; el.querySelector('[data-nv]').textContent = S.n + '명'; el.querySelector('[data-rs]').textContent = '1년 내 전매: ' + (S.resale ? '가능' : '불가'); el.querySelector('[data-ne]').textContent = '거래에 영향: ' + (S.noeff ? '없음' : '있음');
          if (S.mode === 'gm') { const gm = S.n >= 50 || S.resale; out.innerHTML = `${S.n}명 · 전매 ${S.resale ? '가능' : '불가'} → <b>${gm ? '공모' : '사모'}</b>${gm && S.n < 50 ? ' (50인 미만이지만 1년 내 전매 가능 → 공모로 간주)' : ''} → 증권 신고서 ${gm ? '<b>제출해야 함</b>' : '면제'}`; }
          else { const w = +S.who; out.innerHTML = w <= 1 ? (S.noeff ? '정보를 알았어도 <b>거래에 영향이 없었으므로</b> 미공개중요정보 이용행위 ✖' : `${['내부자', '1차 정보수령자'][w]} → <b>미공개중요정보 이용행위 금지</b> 대상`) : `${w}차 정보수령자 → 미공개중요정보 규제 대상은 아님 → 대신 <b>시장질서 교란행위 금지</b> 위반으로 처벌`; } };
        seglab(el, S, 'mode', upd); seglab(el, S, 'who', upd); el.querySelector('[data-n]').oninput = e => { S.n = +e.target.value; upd(); }; el.querySelector('[data-rs]').onclick = () => { S.resale = !S.resale; upd(); }; el.querySelector('[data-ne]').onclick = () => { S.noeff = !S.noeff; upd(); }; upd(); } },
    draw(k, S, u, s) { const t = S.t, g = k.g;
      const co = (x, y, l) => { k.rr(x - 50, y - 60, 100, 90, 6, '#dfe6f1', C.ink, 2.5); g.beginPath(); g.moveTo(x - 58, y - 60); g.lineTo(x, y - 95); g.lineTo(x + 58, y - 60); g.closePath(); g.fillStyle = '#c3cfe2'; g.fill(); g.stroke(); k.txt(l || '기업', x, y - 15, { size: 16, bold: true }); };
      const crowd = (n, x0, y0, cols, col) => { for (let i = 0; i < n; i++) { const x = x0 + (i % cols) * 26, y = y0 + Math.floor(i / cols) * 30; k.circ(x, y, 8, col || '#ffcf9e', C.ink, 1.3); k.rr(x - 7, y + 8, 14, 12, 4, col ? col : C.blue); } };
      if (S.k === 0) { co(110, 250); crowd(12, 380, 140, 6); for (let i = 0; i < 4; i++) { const f = seg(u, i * .15, i * .15 + .35); k.arrow(170, 210, 370 + i * 40, 150 + (i % 2) * 40, { p: f, color: C.red, w: 2.5 }); } k.tag('청약 하세요~ (권유)', 280, 120, C.red, { size: 15, alpha: seg(u, .3, .5) }); k.txt('📄 증권', 110, 290, { size: 16, bold: true }); }
      if (S.k === 1 || (S.k === 6 && S.mode === 'gm')) { const n = S.k === 1 ? Math.round(lerp(10, 70, ease(seg(u, 0, .55)))) : S.n; const rs = S.k === 1 ? u > .75 && n < 50 : S.resale; crowd(n, 60, 70, 20, n >= 50 ? '#ff9c8a' : '#9cc7ff');
        k.txt(`권유 대상 ${n}명`, 330, 340, { size: 20, bold: true }); const gm = n >= 50 || rs; k.box(200, 360, 260, 54, gm ? '공모' : '사모', { fill: gm ? C.pink : C.sky, stroke: gm ? C.red : C.blue, size: 22 }); if (S.k === 1 && u > .6) { k.txt(u > .75 ? '1년 내 전매 가능 → 공모 간주!' : '', 330, 300, { size: 16, bold: true, color: C.red }); }
        if (rs && n < 50) k.txt('↺ 1년 내 전매 가능', 560, 385, { size: 14, bold: true, color: C.red }); }
      if (S.k === 2) { co(100, 240, '상장 법인'); k.box(470, 60, 170, 60, '금융위원회', { fill: C.cream, size: 17 }); k.arrow(160, 170, 465, 95, { p: seg(u, 0, .3), color: C.navy, label: '공시 자료 제출' });
        const tilt = Math.sin(t * 2) * .15 * seg(u, .5, .7); g.save(); g.translate(430, 300); g.rotate(tilt); k.line([-120, 0, 120, 0], C.ink, 4); k.circ(-110, 22, 20, '#9cc7ff'); k.txt('알아요', -110, 22, { size: 11, bold: true }); k.circ(110, 22, 20, '#ffd0c8'); k.txt('몰라요', 110, 22, { size: 11, bold: true }); g.restore(); k.line([430, 300, 430, 380], C.ink, 4);
        k.txt('미공시 → 정보 불균형 → 신뢰·효율성 ↓', 430, 410, { size: 15, bold: true, color: C.red, alpha: seg(u, .5, .7) }); }
      if (S.k === 3) { const L = ['증권 신고서\n제출', '금융위\n심사 통과', '증권 발행', '청약 권유', '투자자\n청약']; L.forEach((l, i) => { const on = seg(u, i * .17, i * .17 + .12), x = 20 + i * 128; k.box(x, 130, 110, 70, l, { fill: on > .9 ? C.cream : '#fff', stroke: on > .9 ? C.red : '#ccc', size: 15, alpha: .3 + .7 * on }); if (i < 4) k.arrow(x + 112, 165, x + 126, 165, { p: on * 2, color: C.red, w: 2.5, head: 8 }); });
        k.txt('공모할 때마다!', 75, 110, { size: 14, bold: true, color: C.red }); k.box(140, 270, 380, 60, '사모 → 공시 의무 면제 (신고서 ✖)', { fill: C.sky, stroke: C.blue, size: 17, alpha: seg(u, .8, .95) }); }
      if (S.k === 4) { const P = [[120, '📅', '정기 공시', '일정 기간마다\n(변동된 발행인 관련 사항)'], [330, '⚡', '수시 공시', '중대한 경영 정보\n→ 신속하게'], [540, '📢', '공정 공시', '특정인에게 주기 "전에"\n먼저 똑같이 공시']];
        P.forEach(([x, e, n, d], i) => { const on = seg(u, i * .28, i * .28 + .2); k.g.save(); k.g.globalAlpha = .2 + .8 * on; k.txt(e, x, 120 + (i === 1 ? Math.sin(t * 8) * 4 : 0), { size: 46 }); k.txt(n, x, 190, { size: 19, bold: true, color: C.navy }); k.txt(d, x, 245, { size: 14, bold: true }); k.g.restore(); }); k.txt('정보의 비대칭 방지', 540, 300, { size: 14, bold: true, color: C.red, alpha: seg(u, .75, .9) }); }
      if (S.k === 5 || (S.k === 6 && S.mode === 'chain')) { const N = ['내부자\n(임직원)', '1차\n정보수령자', '2차\n정보수령자', '3차 …']; const sel = S.k === 6 ? +S.who : -1;
        N.forEach((n, i) => { const x = 90 + i * 160, on = S.k === 5 ? seg(u, i * .2, i * .2 + .15) : 1; k.g.save(); k.g.globalAlpha = .25 + .75 * on; k.person(x, 150, 1.1, { t: t + i, shirt: i <= 1 ? C.red : C.org, face: sel === i ? 'o' : '' }); k.txt(n, x, 230, { size: 15, bold: true }); k.g.restore(); if (i < 3) k.arrow(x + 30, 150, x + 130, 150, { p: on * 2, color: C.gray, label: '정보 🤫', ly: -24 }); if (sel === i) k.circ(x, 160, 62, null, C.blue, 3); });
        k.rr(30, 280, 290, 70, 12, '#fdeeee', C.red, 2.5); k.txt('미공개중요정보 이용행위 금지\n(내부자 · 1차 수령자)', 175, 315, { size: 15, bold: true, color: C.red }); k.rr(350, 280, 280, 70, 12, '#fff3e3', C.org, 2.5); k.txt('시장질서 교란행위 금지\n(1차에게 받은 2차 이후)', 490, 315, { size: 15, bold: true, color: C.org });
        k.txt('※ 정보를 알았어도 거래에 영향이 없었다면 미공개중요정보 이용행위 ✖', 330, 385, { size: 13.5, bold: true, color: C.gray }); }
    }
  });

  /* ───────── 섀플리 값 ───────── */
  function perms(a) { if (a.length <= 1) return [a]; const r = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => r.push([x, ...p]))); return r; }
  function shapley(d) { /* 같은 경로: 연합 비용 = 가장 먼 목적지 비용 */ const ids = d.map((_, i) => i), P = perms(ids), sv = d.map(() => 0), rows = [];
    P.forEach(p => { let cur = 0; const mc = d.map(() => 0); p.forEach(i => { const nc = Math.max(cur, d[i]); mc[i] = nc - cur; cur = nc; }); mc.forEach((m, i) => sv[i] += m / P.length); rows.push({ p, mc }); }); return { sv, rows, w: 1 / P.length }; }
  KOA.def('shapley', {
    init(S) { S.n = '2'; S.d = [2000, 4400, 3000]; },
    steps: [
      { cap: '같은 길 위: 숙소 → <b>갑</b>의 유적지(혼자 가면 2,000원) → <b>을</b>의 유적지(혼자 가면 4,400원). 같이 타면(연합) 총 <b>4,400원</b>', dur: 6 },
      { cap: '순서 ① <b>갑 → 을</b>: 갑이 먼저 타서 2,000원. 을이 추가로 타면 총 4,400원 → 을의 한계기여도 = 4,400 − 2,000 = <b>2,400원</b>', dur: 8 },
      { cap: '순서 ② <b>을 → 갑</b>: 을이 먼저 4,400원. 갑이 추가로 타도 길 중간이라 총비용 그대로 → 갑의 한계기여도 = <b>0원</b>', dur: 8 },
      { cap: '두 순서는 똑같이 중요 → 가중치 <b>1/2</b>씩. 갑 = (2,000 + 0) × ½ = <b>1,000원</b>, 을 = (2,400 + 4,400) × ½ = <b>3,400원</b>. 합 = 4,400 = 총비용 ✔', dur: 8 },
      { cap: '혼자 비용의 비율(2,000 : 4,400)로 나누는 것과 다르다! 섀플리 = <b>모든 순서 고려(기회 균등성)</b> + <b>늘어난 비용만큼(기여 공정성)</b>', dur: 7 },
      { cap: '직접 해 보기: 목적지 비용을 바꾸고, 3명(병 추가)으로도 계산해 봐요. 모든 순서의 표가 나와요.', lab: true }
    ],
    lab: { html: `<h4>🧪 섀플리 계산기 (같은 경로 동승)</h4><div class="row seg"><button data-n="2" class="on">2명</button><button data-n="3">3명</button></div><div class="row"><label>갑 <input type="range" min="500" max="6000" step="100" value="2000" data-i="0"></label><b data-o="0"></b><label>을 <input type="range" min="500" max="6000" step="100" value="4400" data-i="1"></label><b data-o="1"></b><label data-p3>병 <input type="range" min="500" max="6000" step="100" value="3000" data-i="2"></label><b data-o="2" data-p3></b></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'), N = ['갑', '을', '병']; const upd = () => { const n = +S.n, d = S.d.slice(0, n), r = shapley(d); el.querySelectorAll('[data-p3]').forEach(x => x.hidden = n < 3); el.querySelectorAll('[data-o]').forEach(b => b.textContent = S.d[b.dataset.o].toLocaleString() + '원');
          out.innerHTML = `<table class="cmp"><tr><th>순서 (가중치 1/${r.rows.length})</th>${d.map((_, i) => `<th>${N[i]}</th>`).join('')}</tr>${r.rows.map(x => `<tr><td>${x.p.map(i => N[i]).join('→')}</td>${x.mc.map(m => `<td>${m.toLocaleString()}</td>`).join('')}</tr>`).join('')}<tr><th>섀플리 값</th>${r.sv.map(v => `<th>${Math.round(v).toLocaleString()}</th>`).join('')}</tr></table>합 = ${Math.round(r.sv.reduce((a, b) => a + b, 0)).toLocaleString()}원 = 함께 탈 때 총비용(가장 먼 목적지) ${Math.max(...d).toLocaleString()}원 ✔`; };
        seglab(el, S, 'n', upd); el.querySelectorAll('input[data-i]').forEach(r => r.oninput = () => { S.d[r.dataset.i] = +r.value; upd(); }); upd(); } },
    draw(k, S, u, s) { const t = S.t, g = k.g; const X0 = 60, X1 = 600, max = 6000; const pos = v => X0 + (X1 - X0) * v / max; const road = y => { k.rr(X0 - 10, y - 16, X1 - X0 + 30, 32, 16, '#d6d6dc'); k.line([X0, y, X1 + 10, y], '#fff', 2, [10, 8]); k.txt('🏨 숙소', X0, y - 34, { size: 15, bold: true }); };
      const site = (v, y, l, col) => { const x = pos(v); k.line([x, y - 18, x, y - 60], col, 3); g.fillStyle = col; g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x + 26, y - 52); g.lineTo(x, y - 44); g.fill(); k.txt(`${l} ${v.toLocaleString()}원`, x, y - 74, { size: 14, bold: true, color: col }); };
      const taxi = (x, y, who) => { k.rr(x - 30, y - 14, 60, 28, 8, C.yel, C.ink, 2); k.txt('🚕', x - 40, y, { size: 18 }); k.txt(who, x + 4, y, { size: 13, bold: true }); };
      const meter = (v, x, y) => { k.rr(x - 70, y - 22, 140, 44, 8, '#222'); k.txt(`${Math.round(v).toLocaleString()}원`, x, y, { size: 20, bold: true, color: '#7dff9a' }); };
      if (S.k <= 2) { const y = 190; road(y); site(2000, y, '갑', C.blue); site(4400, y, '을', C.red);
        if (S.k === 0) { k.txt('같이 타면 총 4,400원 (가장 먼 곳까지의 요금)', 330, 300, { size: 17, bold: true }); }
        if (S.k === 1) { const p = ease(seg(u, .05, .9)), x = lerp(X0, pos(4400), p), fare = (x - X0) / (X1 - X0) * max; taxi(x, y, x < pos(2000) ? '갑+을' : '을'); meter(fare, 520, 300);
          k.txt('갑 몫', 150, 280, { size: 15, bold: true, color: C.blue }); k.txt(`${Math.round(Math.min(fare, 2000)).toLocaleString()}원`, 150, 305, { size: 18, bold: true, color: C.blue }); k.txt('을이 늘린 비용', 300, 280, { size: 15, bold: true, color: C.red }); k.txt(`${Math.round(Math.max(0, fare - 2000)).toLocaleString()}원`, 300, 305, { size: 18, bold: true, color: C.red });
          k.txt('먼저 탄 갑: 2,000 / 나중에 탄 을: +2,400', 330, 380, { size: 17, bold: true, alpha: seg(u, .85, 1) }); }
        if (S.k === 2) { const p = ease(seg(u, .05, .9)), x = lerp(X0, pos(4400), p), fare = (x - X0) / (X1 - X0) * max; taxi(x, y, x < pos(2000) ? '을+갑' : '을'); meter(fare, 520, 300);
          k.txt('을 몫', 150, 280, { size: 15, bold: true, color: C.red }); k.txt(`${Math.round(fare).toLocaleString()}원`, 150, 305, { size: 18, bold: true, color: C.red }); k.txt('갑이 늘린 비용', 300, 280, { size: 15, bold: true, color: C.blue }); k.txt('0원', 300, 305, { size: 18, bold: true, color: C.blue });
          k.txt('먼저 탄 을: 4,400 / 나중에 탄 갑: +0', 330, 380, { size: 17, bold: true, alpha: seg(u, .85, 1) }); } }
      if (S.k === 3) { const R = [['순서', '갑', '을'], ['갑→을 (½)', '2,000', '2,400'], ['을→갑 (½)', '0', '4,400'], ['섀플리 값', '1,000', '3,400']]; R.forEach((r, i) => r.forEach((c, j) => { const on = seg(u, i * .2, i * .2 + .15); k.box(110 + j * 150, 60 + i * 70, 140, 58, c, { fill: i === 0 ? C.navy : i === 3 ? C.cream : '#fff', color: i === 0 ? '#fff' : j === 1 ? C.blue : j === 2 ? C.red : C.ink, size: 18, alpha: .2 + .8 * on, stroke: i === 3 ? C.red : C.ink }); }));
        k.txt('1,000 + 3,400 = 4,400 = 연합의 총비용 ✔', 330, 380, { size: 18, bold: true, color: C.green, alpha: seg(u, .8, .95) }); }
      if (S.k === 4) { const bar = (y, a, b, lab) => { const W0 = 440, wa = W0 * a / 4400; k.txt(lab, 120, y + 20, { size: 15, bold: true }); k.rr(200, y, wa, 40, 6, C.blue); k.rr(200 + wa, y, W0 - wa, 40, 6, C.red); k.txt(`갑 ${Math.round(a).toLocaleString()}`, 200 + wa / 2, y + 20, { size: 14, bold: true, color: '#fff' }); k.txt(`을 ${Math.round(b).toLocaleString()}`, 200 + wa + (W0 - wa) / 2, y + 20, { size: 14, bold: true, color: '#fff' }); };
        bar(110, 4400 * 2000 / 6400, 4400 * 4400 / 6400, '단독 비율'); bar(220, 1000, 3400, '섀플리'); k.txt('✖ 단독 비율로 나누기 (지문 방법 아님)', 330, 90, { size: 14, bold: true, color: C.gray }); k.txt('✔ 모든 순서 × 늘어난 비용', 330, 205, { size: 14, bold: true, color: C.green }); k.txt('기회 균등성 + 기여 공정성', 330, 330, { size: 20, bold: true, color: C.navy, alpha: seg(u, .4, .6) }); }
      if (S.k === 5) { const n = +S.n, d = S.d.slice(0, n), r = shapley(d), y = 160, N = ['갑', '을', '병'], col = [C.blue, C.red, C.green]; road(y); d.forEach((v, i) => site(v, y + (i === 2 ? 0 : 0), N[i], col[i]));
        r.sv.forEach((v, i) => { const x = 110 + i * 190; k.txt(N[i], x, 270, { size: 18, bold: true, color: col[i] }); k.rr(x - 50, 290, 100, 24, 6, '#eee'); k.rr(x - 50, 290, 100 * v / Math.max(...d), 24, 6, col[i]); k.txt(`${Math.round(v).toLocaleString()}원`, x, 335, { size: 18, bold: true }); });
        k.txt(`${r.rows.length}가지 순서 · 가중치 1/${r.rows.length}`, 330, 385, { size: 15, bold: true, color: C.gray }); }
    }
  });

  /* ───────── 호네트 · 버틀러 ───────── */
  function blob(k, x, y, r, col, o = {}) { const g = k.g, t = o.t || 0; g.save(); g.translate(x, y); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, rr = r * (1 + (o.star ? .28 * Math.cos(a * 5 + t) : .05 * Math.sin(a * 3 + t * 2))); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = C.ink; g.beginPath(); g.arc(-r * .3, -r * .15, 3, 0, 7); g.arc(r * .3, -r * .15, 3, 0, 7); g.fill(); g.beginPath(); if (o.sad) g.arc(0, r * .35, r * .22, Math.PI * 1.15, Math.PI * 1.85); else g.arc(0, r * .1, r * .25, .2, Math.PI - .2); g.lineWidth = 2; g.stroke(); g.restore(); if (o.label) k.txt(o.label, x, y + r + 18, { size: 14, bold: true }); }
  KOA.def('honneth', {
    steps: [
      { cap: '<b>호네트</b>: 정체성 = <b>목적격 나</b>(규범이 요구하는 정체성이 추상화된 자아)에 대한 <b>주격 나</b>(태어날 때부터의 고유한 자아)의 <b>반응</b>', dur: 6 },
      { cap: '주격 나가 목적격 나를 <b>받아들이면</b> → <b>내면화</b> → 규범의 요구 수용 → <b>인정</b>(정체성에 대한 존중)', dur: 6 },
      { cap: '<b>반발하면</b> → <b>대안적 정체성</b> → 규범에 안 맞아 인정 ✖ → <b>부정적 자기의식</b> → 규범에 저항 = <b>인정 투쟁</b>', dur: 7 },
      { cap: '인정 투쟁 <b>성공</b> → <b>규범의 변화</b> + 대안적 정체성 인정 → <b>사회 발전</b>. (호네트에게 규범은 <b>고정된 실체</b>, 정체성 형성의 기준)', dur: 7 },
      { cap: '<b>버틀러</b>: 규범은 미리 있는 실체가 아니라 <b>수행의 반복</b>이 만든 것(<b>수행성</b>). 반복되면 생기고 유지 · 멈추면 약해지고 사라짐 → <b>유동적</b>. 정체성도 수행의 효과!', dur: 8 },
      { cap: '수행은 매번 <b>다른 시공간</b> → 동일성 보장 ✖ → 차이를 의식하고 <b>배제</b>됐다고 느끼는 순간 → <b>생존 투쟁으로서의 인정 투쟁</b>: ① 동일성에 <b>복종</b> ② 권력·<b>진리 체제</b>에 의문 → 차이를 내세워 <b>저항</b>', dur: 9 },
      { cap: '인정 투쟁이 성공해도 → <b>또 다른 배제</b>가 남음. 진리 체제는 규범에서 벗어나는 존재를 상정해야 동일성을 확인하니까!', dur: 7 },
      { cap: '그래서 ㉠ 규범에 저항 + <b>자신의 진리 체제에도 의문</b> → 인정·배제의 경계를 끊임없이 시험 → 배제 <b>최소화</b>, <b>상호 인정의 윤리</b>', dur: 7 }
    ],
    draw(k, S, u) { const t = S.t, g = k.g;
      if (S.k === 0 || S.k === 1) { const m = S.k === 1 ? ease(seg(u, .1, .6)) : 0; blob(k, lerp(170, 300, m), 220, 55, '#ffc78a', { t, label: m < .5 ? '주격 나 (고유)' : '' });
        g.save(); g.globalAlpha = 1 - m * .6; k.rr(lerp(420, 330, m) - 55, 165, 110, 110, 14, '#d5d9e3', C.ink, 2.5); k.txt('규범', lerp(420, 330, m), 205, { size: 18, bold: true }); k.txt('목적격 나', lerp(420, 330, m), 240, { size: 14, bold: true }); g.restore();
        if (S.k === 1 && m > .9) { g.save(); g.shadowColor = C.yel; g.shadowBlur = 30; k.circ(310, 220, 80, null, C.yel, 5); g.restore(); k.tag('인정 ♥', 310, 345, C.red, { size: 18 }); for (let i = 0; i < 5; i++) k.txt('👏', 120 + i * 110, 395 + Math.sin(t * 6 + i) * 4, { size: 22 }); } }
      if (S.k === 2) { const p = ease(seg(u, .05, .4)); blob(k, 200 - p * 40, 220, 55, '#ffb36b', { t, star: p > .5, sad: u > .45, label: p > .5 ? '대안적 정체성' : '주격 나' }); k.rr(420 + p * 60 - 55, 165, 110, 110, 14, '#d5d9e3', C.ink, 2.5); k.txt('규범', 420 + p * 60, 220, { size: 18, bold: true }); k.arrow(260, 220, 390, 220, { p: seg(u, 0, .3), color: C.red, label: '반발!' });
        if (u > .45) { g.save(); g.globalAlpha = seg(u, .45, .6); k.circ(150, 120, 34, '#888'); k.circ(185, 110, 30, '#888'); k.circ(215, 125, 26, '#888'); g.restore(); k.txt('부정적 자기의식', 180, 70, { size: 14, bold: true, color: '#555', alpha: seg(u, .45, .6) }); }
        if (u > .7) { k.line([300, 330, 300, 250], C.ink, 4); k.rr(255, 215, 90, 40, 4, '#fff', C.red, 3); k.txt('인정하라!', 300, 235, { size: 14, bold: true, color: C.red }); k.tag('인정 투쟁', 300, 380, C.red, { size: 17 }); } }
      if (S.k === 3) { const p = ease(seg(u, .1, .6)); g.save(); g.translate(330, 210); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))), r = lerp(sq * 60, 72 * (1 + .2 * Math.cos(a * 5)), p); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = '#e2e7f0'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke(); g.restore(); k.txt('규범 변화', 330, 210, { size: 18, bold: true });
        blob(k, 150, 300, 40, '#ffb36b', { t, star: true, label: '인정받음!' }); k.arrow(470, 360, 600, 160, { p: seg(u, .55, .9), color: C.green, w: 5, label: '사회 발전', lx: 40 }); }
      if (S.k === 4) { const cycle = (t * .5) % 6, stop = cycle > 3.6; for (let i = 0; i < 14; i++) { const x = 70 + i * 40, y = 260 + Math.sin(i * .9) * 14, born = i / 14 * 3.4, age = stop ? cycle - 3.6 : 0; const a = cycle < born ? 0 : clamp(1 - age / 2, 0, 1);
          g.save(); g.globalAlpha = a; k.txt(i % 2 ? '👣' : '👣', x, y + (i % 2 ? 12 : -12), { size: 22 }); g.restore(); }
        const pathA = stop ? clamp(1 - (cycle - 3.6) / 2, 0, 1) : clamp(cycle / 3.4, 0, 1); g.save(); g.globalAlpha = pathA * .6; k.rr(50, 230, 580, 60, 30, '#cdb98f'); g.restore(); k.txt(stop ? '수행이 멈추면 → 규범이 약해지고 사라짐' : '수행의 반복 → 규범(길)이 생기고 유지', 330, 150, { size: 18, bold: true, color: stop ? C.red : C.green });
        k.txt('규범 = 수행이 만든 유동적인 것 (수행성)', 330, 360, { size: 17, bold: true, color: C.navy }); }
      if (S.k === 5) { k.circ(300, 220, 140, '#eef3fb', C.navy, 3); k.txt('사회 구성원 (규범의 동일성)', 300, 60, { size: 15, bold: true, color: C.navy }); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; blob(k, 300 + Math.cos(a) * 75, 220 + Math.sin(a) * 75, 22, '#9cc7ff', { t: t + i }); }
        const out = ease(seg(u, .1, .4)); blob(k, lerp(300, 520, out), lerp(220, 260, out), 24, '#ffb36b', { t, sad: out > .5, star: true, label: out > .5 ? '차이 → 배제됨' : '' });
        if (u > .5) { k.box(440, 90, 190, 46, '① 복종: 동일성에 맞추기', { fill: C.sky, stroke: C.blue, size: 14, alpha: seg(u, .5, .65) }); k.box(440, 330, 190, 46, '② 저항: 진리 체제에 ?', { fill: C.pink, stroke: C.red, size: 14, alpha: seg(u, .7, .85) }); } }
      if (S.k === 6) { const R = lerp(140, 175, ease(seg(u, .05, .4))); k.circ(300, 220, R, '#eef3fb', C.navy, 3); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; blob(k, 300 + Math.cos(a) * 85, 220 + Math.sin(a) * 85, 22, i === 6 ? '#ffb36b' : '#9cc7ff', { t: t + i, star: i === 6 }); }
        const nw = seg(u, .45, .7); g.save(); g.globalAlpha = nw; blob(k, 560, 330, 24, '#c7a3ff', { t, sad: true, label: '또 다른 배제' }); g.restore(); k.txt('진리 체제: "벗어나는 존재"를 상정해 동일성 확인', 330, 30, { size: 15, bold: true, color: C.red, alpha: seg(u, .6, .8) }); }
      if (S.k === 7) { const p = ease(seg(u, .1, .6)); g.save(); g.setLineDash([12, 10 * p + .1]); k.circ(300, 220, 150, '#eef3fb', C.navy, 3); g.restore(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * .2, r = lerp(90, i % 2 ? 150 : 100, p); blob(k, 300 + Math.cos(a) * r, 220 + Math.sin(a) * r, 22, ['#9cc7ff', '#ffb36b', '#c7a3ff', '#9de0b0'][i % 4], { t: t + i }); }
        k.txt('🪞 내 진리 체제도 의심', 540, 90, { size: 16, bold: true, color: C.red }); k.tag('상호 인정의 윤리', 330, 405, C.green, { size: 18, alpha: seg(u, .5, .7) }); }
    }
  });
})();
