/* 학습 애니메이션 1: 영장주의 · 적부 심사 · 도파민 · 심전도 · 혈압 */
(() => {
  const { C, clamp, lerp, ease, seg } = KOA;
  /* 공통: 상자 사슬 (순서대로 불 켜짐) */
  function chain(k, items, u, o = {}) { const n = items.length, x0 = o.x || 20, y = o.y || 200, w = o.w || 120, h = o.h || 60, gap = o.gap || ((640 - x0) - n * w) / Math.max(1, n - 1);
    items.forEach((t, i) => { const on = u * n > i, x = x0 + i * (w + gap); const a = clamp(u * n - i, 0, 1);
      k.box(x, y, w, h, t, { fill: on ? (o.fill || C.cream) : '#fff', stroke: on ? (o.col || C.red) : '#cfc6b2', size: o.size || 15, alpha: .35 + .65 * a });
      if (i < n - 1) k.arrow(x + w + 3, y + h / 2, x + w + gap - 3, y + h / 2, { p: clamp(u * n - i - .6, 0, 1) * 2, color: o.col || C.red, w: 2.5, head: 9 }); }); }
  function judge(k, x, y, t, o = {}) { k.person(x, y, 1, { shirt: '#222', t, hat: null, label: o.label || '법관', face: o.face }); k.g.save(); k.g.translate(x + 26, y + 10); k.g.rotate(o.bang ? -.6 + Math.abs(Math.sin(t * 9)) * .9 : -.3); k.rr(-3, -2, 6, 26, 2, '#7a4a20'); k.rr(-10, -8, 20, 10, 3, '#9a5f2a', C.ink, 1.5); k.g.restore(); }
  function police(k, x, y, t, o = {}) { k.person(x, y, 1, { shirt: C.navy, hat: C.navy, t, label: o.label || '수사 기관', face: o.face }); }
  function doc(k, x, y, s, label, stamp) { const g = k.g; g.save(); g.translate(x, y); g.scale(s, s); k.rr(-22, -28, 44, 56, 4, '#fff', C.ink, 2); for (let i = 0; i < 4; i++) k.line([-14, -16 + i * 9, 14, -16 + i * 9], '#bbb', 2);
    if (label) k.txt(label, 0, 40, { size: 13, bold: true }); if (stamp) { g.rotate(-.3); k.circ(6, 12, 13, null, C.red, 3); k.txt(stamp, 6, 12, { size: 11, bold: true, color: C.red }); } g.restore(); }
  function bars(k, x, y, w, h, p) { const g = k.g; g.save(); g.beginPath(); g.rect(x, y, w, h * p); g.clip(); for (let i = 0; i <= 5; i++) k.line([x + i * w / 5, y, x + i * w / 5, y + h], '#555', 4); k.line([x, y + 4, x + w, y + 4], '#555', 5); g.restore(); }

  /* ───────── 영장주의 ───────── */
  KOA.def('warrant', {
    init(S) { S.cs = 'normal'; },
    steps: [
      { cap: '체포·구속 같은 <b>강제 처분</b>은 <b>신체의 자유</b>를 제한해요.', dur: 4 },
      { cap: '수사 기관이 <b>혼자</b> 판단하고 결정하면? → 권한 남용 → <b>인권 침해</b> 위험!', dur: 4 },
      { cap: '그래서 <b>영장주의</b>: 수사 기관이 법원에 <b>청구</b> → 법관이 <b>사전에</b> 심사 → 영장 <b>발부</b> → 그다음에 강제 처분', dur: 7 },
      { cap: '영장 = ① 합법이라는 <b>허가 문서</b> + ② 기본권 제한이 정당한지 <b>사전에 심사했다는 표지</b> → 개인을 지키는 <b>예방적 통제 장치</b>', dur: 6 },
      { cap: '예외: <b>긴급 체포·현행범 체포</b>는 영장 없이 먼저 체포 → 법원 판단은 <b>사후 검증</b>. (판단이 없는 게 아니라 "나중"!)', dur: 6 },
      { cap: '<b>구속</b>은 예외 없음! <b>영장 실질 심사</b> = 수사 기록 검토 <b>+</b> 법관의 <b>피의자 심문</b> → 구속 영장 문턱 ↑', dur: 7 },
      { cap: '직접 골라 보기: 처분 종류에 따라 법원의 판단이 <b>언제</b> 이루어지는지 아래 버튼으로 바꿔 봐요.', lab: true }
    ],
    lab: { html: `<h4>🧪 처분을 골라 봐요</h4><div class="row seg"><button data-c="normal" class="on">일반 체포</button><button data-c="urgent">긴급·현행범 체포</button><button data-c="detain">구속</button></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'); const T = { normal: '원칙: 영장주의 적용 → 법관이 <b>먼저</b> 심사하고 영장 발부 → 체포 (사전 승인)', urgent: '예외: 영장 발부를 기다리기 어려움 → <b>먼저</b> 체포 → 법원은 <b>사후 검증</b>', detain: '예외 없음: 구속 영장 청구 → <b>영장 실질 심사</b>(기록 검토 + 피의자 심문, 정해진 기일 내 반드시) → 발부되면 구속' };
        const set = c => { S.cs = c; S.st = 0; el.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === c)); out.innerHTML = T[c]; }; el.onclick = e => { const b = e.target.closest('[data-c]'); if (b) set(b.dataset.c); }; set('normal'); } },
    draw(k, S, u, s) { const t = S.t;
      if (S.k === 0) { k.txt('강제 처분 = 체포 · 구속', 330, 50, { size: 26, bold: true }); k.person(330, 240, 1.6, { t, face: u > .5 ? 'sad' : '', label: '' }); bars(k, 250, 140, 160, 200, ease(seg(u, .2, .7))); k.tag('신체의 자유 제한', 330, 375, C.red, { alpha: seg(u, .6, .8), size: 17 }); }
      if (S.k === 1) { police(k, 170, 230, t, { face: '' }); k.person(480, 230, 1.2, { t, face: 'sad', label: '개인' }); const sw = Math.abs(Math.sin(t * 5)); k.g.save(); k.g.translate(260, 200 - sw * 30); k.box(-40, -22, 80, 44, '내 맘대로!', { fill: C.pink, stroke: C.red, size: 15 }); k.g.restore();
        const b = (t * 2 % 1) < .6; if (b && u > .3) { k.g.save(); k.g.translate(330, 90); k.g.beginPath(); k.g.moveTo(0, -36); k.g.lineTo(38, 30); k.g.lineTo(-38, 30); k.g.closePath(); k.g.fillStyle = C.yel; k.g.fill(); k.g.lineWidth = 3; k.g.strokeStyle = C.red; k.g.stroke(); k.txt('!', 0, 8, { size: 34, bold: true, color: C.red }); k.g.restore(); }
        k.tag('권한 남용 → 인권 침해', 330, 370, C.red, { size: 18, alpha: seg(u, .4, .6) }); }
      if (S.k === 2) { police(k, 100, 250, t); judge(k, 330, 150, t, { bang: u > .58 && u < .72 }); k.person(560, 250, 1, { t, label: '개인' }); k.rr(270, 190, 120, 14, 4, '#9a5f2a');
        let dx, dy, st = null; if (u < .35) { const a = ease(u / .35); dx = lerp(130, 300, a); dy = lerp(230, 175, a); } else if (u < .72) { dx = 300; dy = 175; if (u > .6) st = '발부'; } else { const a = ease(seg(u, .72, .88)); dx = lerp(300, 130, a); dy = lerp(175, 230, a); st = '발부'; }
        doc(k, dx, dy, .9, u < .35 ? '청구' : u < .6 ? '심사 중' : '영장', st); if (u > .38 && u < .6) { k.circ(345, 165, 16, null, C.blue, 3); k.line([356, 176, 370, 190], C.blue, 4); }
        k.arrow(150, 330, 520, 330, { p: seg(u, .88, 1), color: C.red, w: 4, label: '그다음에 강제 처분', ly: 20 }); k.tag('사전 심사', 330, 60, C.blue, { alpha: seg(u, .35, .45), size: 16 }); }
      if (S.k === 3) { doc(k, 200, 200, 2.3, '', '발부'); k.tag('① 허가 문서 (합법 판단을 명시)', 200, 330, C.navy, { alpha: seg(u, .1, .25), size: 15 }); k.tag('② 사전 심사의 표지', 200, 370, C.navy, { alpha: seg(u, .3, .45), size: 15 });
        k.person(500, 230, 1.3, { t, label: '개인' }); const a = ease(seg(u, .5, .8)); k.g.save(); k.g.globalAlpha = a; k.g.translate(430, 220); k.g.beginPath(); k.g.moveTo(0, -60); k.g.quadraticCurveTo(36, -50, 34, -10); k.g.quadraticCurveTo(30, 40, 0, 62); k.g.quadraticCurveTo(-30, 40, -34, -10); k.g.quadraticCurveTo(-36, -50, 0, -60); k.g.fillStyle = '#cfe0ff'; k.g.fill(); k.g.strokeStyle = C.blue; k.g.lineWidth = 3; k.g.stroke(); k.txt('예방', 0, 0, { size: 17, bold: true, color: C.blue }); k.g.restore();
        k.tag('예방적 통제 장치', 480, 380, C.blue, { alpha: seg(u, .75, .9), size: 17 }); }
      if (S.k === 4 || (S.k === 6 && S.cs !== 'detain')) { const urgent = S.k === 4 ? true : S.cs === 'urgent'; const rows = S.k === 4 ? [['원칙 (일반 체포)', false, 120], ['예외 (긴급·현행범 체포)', true, 270]] : [[urgent ? '긴급·현행범 체포' : '일반 체포', urgent, 190]];
        rows.forEach(([lab, ex, y], ri) => { const uu = S.k === 4 ? seg(u, ri * .4, ri * .4 + .55) : seg(u, 0, .6); k.txt(lab, 140, y - 50, { size: 18, bold: true, color: ex ? C.red : C.navy }); k.line([60, y, 600, y], '#bbb', 4); k.arrow(60, y, 600, y, { p: uu, color: ex ? C.red : C.navy, w: 4 });
          const A = ex ? ['체포!', '법원: 사후 검증'] : ['법원: 영장 발부(사전 승인)', '체포']; A.forEach((a, i) => { const x = 180 + i * 260, on = uu > (i + .3) / 2; k.circ(x, y, 11, on ? (ex ? C.red : C.navy) : '#fff', ex ? C.red : C.navy, 3); k.box(x - 105, y + 18, 210, 40, a, { fill: on ? C.cream : '#fff', stroke: on ? C.ink : '#ccc', size: 15, alpha: on ? 1 : .4 }); }); }); }
      if (S.k === 5 || (S.k === 6 && S.cs === 'detain')) { const uu = S.k === 6 ? clamp(S.st / 5, 0, 1) : u;
        k.box(30, 50, 280, 210, '', { fill: '#f6f2e8', stroke: '#bbb' }); k.txt('과거', 170, 72, { size: 17, bold: true, color: C.gray }); judge(k, 120, 160, S.t, {}); doc(k, 220, 170, 1, '수사 기록만');
        k.box(350, 50, 280, 210, '', { fill: C.mint, stroke: C.green }); k.txt('지금: 영장 실질 심사', 490, 72, { size: 17, bold: true, color: C.green }); judge(k, 420, 160, S.t, {}); doc(k, 495, 175, .7, '기록'); k.person(575, 175, .9, { t: S.t, face: 'o', label: '피의자' });
        if (uu > .3) { k.g.save(); k.g.globalAlpha = seg(uu, .3, .45); k.rr(445, 92, 110, 34, 12, '#fff', C.green, 2); k.txt('심문 중…', 500, 109, { size: 14, bold: true, color: C.green }); k.g.restore(); }
        const lv = lerp(330, 290, ease(seg(uu, .45, .8))); k.txt('구속 영장 문턱', 110, 300, { size: 16, bold: true }); k.rr(40, lv, 560, 10, 4, C.red); k.line([40, 330, 600, 330], '#ccc', 2, [6, 6]); k.txt(uu > .8 ? '↑ 실질적으로 높아짐' : '', 470, lv - 16, { size: 16, bold: true, color: C.red });
        k.txt('구속 요건: 범죄 혐의의 상당성 · 도주 위험 · 증거 인멸 위험', 330, 380, { size: 16, alpha: seg(uu, .6, .8), bold: true, color: C.navy }); }
    }
  });

  /* ───────── 적부 심사 ───────── */
  KOA.def('review', {
    init(S) { S.f = { ill: false, run: false, ev: false, sus: true }; },
    steps: [
      { cap: '적부 심사는 <b>이미</b> 체포·구속된 <b>뒤에</b>, 그 처분이 법적으로 정당한지 법원에 묻는 제도예요 (사후).', dur: 5 },
      { cap: '청구권자: 피의자 본인 + <b>변호인·법정 대리인·친족·동거인·고용주</b>. 갇힌 피의자는 방어권을 행사하기 어렵기 때문!', dur: 6 },
      { cap: '청구서 접수 → 법원은 <b>48시간 내</b> 피의자 심문. 수사 기관·변호인 참여, <b>청구권자도 참여 가능</b>.', dur: 5 },
      { cap: '법관의 체크: ① <b>적법한 절차</b>? ② <b>법률상 요건</b>(혐의 상당성, 도주·증거 인멸 위험)? ③ 증거 적법성·진술 → <b>유지할 필요</b>?', dur: 6 },
      { cap: '영장이 <b>적법</b>했더라도, 그 뒤에 도주·증거 인멸 위험이 <b>사라지면</b> → <b>석방</b> → 불구속 상태로 수사는 계속!', dur: 6 },
      { cap: '영장(일회적 판단)만으로는 정당성을 <b>계속</b> 보장 못 함 → 사법적 통제는 <b>여러 시점</b>에서 이루어진다.', dur: 6 },
      { cap: '직접 바꿔 보기: 상황을 켜고 끄며 법원이 <b>유지</b>할지 <b>석방</b>할지 봐요.', lab: true }
    ],
    lab: { html: `<h4>🧪 구속 적부 심사 시뮬레이터</h4><div class="row seg"><button data-f="ill">절차가 위법했다</button><button data-f="sus" class="on">범죄 혐의 상당</button><button data-f="run">도주 위험</button><button data-f="ev">증거 인멸 위험</button></div><div class="out"></div>`,
      bind(el, S) { const out = el.querySelector('.out'); const upd = () => { const f = S.f; el.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', !!f[b.dataset.f]));
          out.innerHTML = f.ill ? '❌ 적법한 절차 X → 강제 처분을 유지할 수 없음 → <b>석방</b>' : !f.sus ? '❌ 법률상 요건(혐의 상당성) 불충족 → <b>석방</b>' : (f.run || f.ev) ? '⛓ 요건 충족 + 위험이 남아 있음 → 강제 처분 <b>유지</b>' : '🔓 영장은 적법했지만 <b>위험이 사라짐</b> → <b>석방</b>, 불구속 상태로 수사 계속'; };
        el.onclick = e => { const b = e.target.closest('[data-f]'); if (b) { S.f[b.dataset.f] = !S.f[b.dataset.f]; S.st = 0; upd(); } }; upd(); } },
    draw(k, S, u) { const t = S.t;
      const TL = (hl) => { const xs = [110, 330, 550], L = [['사전', '영장 발부'], ['처분', '체포 · 구속'], ['사후', '적부 심사']]; k.line([60, 90, 600, 90], '#ccc', 5); xs.forEach((x, i) => { const on = hl.includes(i); k.circ(x, 90, 13, on ? C.red : '#fff', C.ink, 3); k.txt(L[i][0], x, 58, { size: 15, bold: true, color: on ? C.red : C.gray }); k.txt(L[i][1], x, 122, { size: 16, bold: true, color: on ? C.ink : C.gray }); }); };
      if (S.k === 0) { TL(u > .5 ? [2] : [1]); const x = lerp(110, 550, ease(u)); k.circ(x, 90, 7, C.yel, C.ink, 2); k.person(330, 280, 1.3, { t, face: 'sad', label: '체포·구속된 개인' }); bars(k, 270, 205, 120, 130, 1);
        k.box(430, 200, 200, 60, '이 처분, 정당한가요?', { fill: C.cream, stroke: C.red, size: 16, alpha: seg(u, .5, .7) }); }
      if (S.k === 1) { k.person(330, 230, 1.2, { t, face: 'sad', label: '' }); bars(k, 285, 175, 90, 110, 1); k.txt('피의자', 330, 310, { size: 15, bold: true });
        const W = ['변호인', '법정 대리인', '친족', '동거인', '고용주']; W.forEach((w, i) => { const a = -Math.PI * .95 + i * Math.PI * .95 / 2.0, r = 190, x = 330 + Math.cos(a) * r * 1.3, y = 250 + Math.sin(a) * r * .8 + (i === 0 || i === 4 ? 60 : 0); const on = seg(u, i * .12, i * .12 + .15);
          if (on > 0) { k.g.save(); k.g.globalAlpha = on; k.person(x, y, .85, { t: t + i, shirt: [C.navy, C.pur, C.org, C.green, '#777'][i], label: w }); k.g.restore(); k.arrow(x + (330 - x) * .2, y + (250 - y) * .2 + 10, x + (330 - x) * .6, y + (250 - y) * .6 + 10, { p: on, color: C.red, w: 2.5 }); } });
        k.tag('청구권자 폭넓게 인정', 330, 400, C.red, { alpha: seg(u, .7, .85), size: 16 }); }
      if (S.k === 2) { const h = u * 48; k.circ(140, 200, 80, '#fff', C.ink, 4); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; k.line([140 + Math.cos(a) * 68, 200 + Math.sin(a) * 68, 140 + Math.cos(a) * 76, 200 + Math.sin(a) * 76], C.ink, 3); }
        const a = -Math.PI / 2 + h / 24 * Math.PI * 2; k.line([140, 200, 140 + Math.cos(a) * 58, 200 + Math.sin(a) * 58], C.red, 5); k.txt(`${h | 0}시간`, 140, 310, { size: 22, bold: true, color: h >= 47 ? C.red : C.ink }); k.txt('48시간 내 심문!', 140, 345, { size: 16, bold: true, color: C.red });
        judge(k, 440, 130, t, {}); k.rr(380, 168, 120, 12, 4, '#9a5f2a'); [['피의자', 330, C.blue], ['수사 기관', 420, C.navy], ['변호인', 510, C.pur], ['청구권자', 600, C.org]].forEach(([n, x, c], i) => { const on = seg(u, .2 + i * .15, .35 + i * .15); k.g.save(); k.g.globalAlpha = .2 + .8 * on; k.person(x, 290, .85, { t: t + i, shirt: c, label: n }); k.g.restore(); }); }
      if (S.k === 3) { judge(k, 110, 200, t, {}); const L = ['① 적법한 절차에 따라 진행?', '② 법률상 요건 충족? (혐의 상당성 · 도주 · 증거 인멸 위험)', '③ 증거의 적법성 · 피의자의 진술', '→ 강제 처분을 유지할 필요가 있나?'];
        L.forEach((l, i) => { const on = seg(u, i * .22, i * .22 + .12), y = 90 + i * 75; k.box(200, y, 420, 54, '', { fill: on > .9 ? (i === 3 ? C.cream : C.mint) : '#fff', stroke: on > .9 ? (i === 3 ? C.red : C.green) : '#ccc', alpha: .3 + .7 * on }); k.txt(l, 220, y + 27, { size: i === 1 ? 14.5 : 16, bold: true, align: 'left', alpha: .3 + .7 * on });
          if (on > .9 && i < 3) k.txt('✔', 600, y + 27, { size: 22, bold: true, color: C.green }); }); }
      if (S.k === 4) { k.txt('도주 위험', 120, 70, { size: 16, bold: true }); k.txt('증거 인멸 위험', 120, 130, { size: 16, bold: true }); const v = 1 - ease(seg(u, .1, .45)); [70, 130].forEach(y => { k.rr(200, y - 12, 260, 24, 8, '#eee'); k.rr(200, y - 12, 260 * v, 24, 8, C.red); });
        k.txt('공범 검거 · 증거 확보 →', 560, 100, { size: 15, bold: true, color: C.green, alpha: seg(u, .05, .2) }); const op = ease(seg(u, .5, .75)); k.rr(230, 190, 150, 190, 6, '#e9e2d2', C.ink, 3); k.g.save(); k.g.translate(230, 190); k.g.scale(1 - op * .85, 1); k.rr(0, 0, 150, 190, 6, '#b48a5a', C.ink, 3); k.g.restore();
        const px = lerp(300, 520, ease(seg(u, .7, .95))); k.person(px, 300, 1.1, { t, face: u > .7 ? '' : 'sad', label: u > .9 ? '석방!' : '' }); if (u > .8) { k.circ(px + 60, 250, 16, null, C.blue, 3); k.line([px + 71, 261, px + 84, 274], C.blue, 4); k.txt('불구속 수사 계속', px + 40, 400, { size: 15, bold: true, color: C.blue }); }
        k.tag('영장 발부는 적법했음', 120, 400, C.navy, { size: 14, alpha: seg(u, .5, .7) }); }
      if (S.k === 5) { const P = [['사전', '영장 발부 · 영장 실질 심사', C.blue], ['사후', '긴급·현행범 체포 → 사후 검증', C.org], ['사후·계속', '적부 심사 → 효력 유지 여부', C.red]]; k.line([40, 220, 620, 220], '#bbb', 5); k.txt('시간 →', 600, 250, { size: 14, color: C.gray });
        P.forEach(([a, b, c], i) => { const x = 120 + i * 210, on = seg(u, i * .25, i * .25 + .2); k.g.save(); k.g.globalAlpha = .15 + .85 * on; k.circ(x, 220, 15, c, C.ink, 3); k.box(x - 95, 100 + (i % 2) * 150, 190, 70, `${a}\n${b}`, { fill: '#fff', stroke: c, size: 14.5 }); k.g.restore(); });
        k.tag('사법적 통제는 다양한 시점에서', 330, 400, C.navy, { alpha: seg(u, .8, .95), size: 17 }); }
      if (S.k === 6) { const f = S.f, keep = !f.ill && f.sus && (f.run || f.ev); judge(k, 120, 170, t, { bang: S.st < 1 }); k.person(420, 200, 1.4, { t, face: keep ? 'sad' : '' }); if (keep) bars(k, 360, 120, 120, 150, 1);
        k.box(250, 330, 300, 60, keep ? '⛓ 유지' : '🔓 석방 (불구속 수사)', { fill: keep ? C.pink : C.mint, stroke: keep ? C.red : C.green, size: 20 }); }
    }
  });

  /* ───────── 도파민 ───────── */
  const NODES = { ctx: [330, 60, '대뇌 피질\n(운동 영역)'], str: [120, 170, '선조체'], gpi: [330, 250, '내측\n창백핵'], th: [540, 170, '시상'], sn: [110, 340, '흑질'], oth: [330, 370, '기저핵\n다른 부위'] };
  function circuit(k, S, act, t) { /* act: {str_d, str_i, gpi, th, sn, oth, direct, indirect, da} */
    const E = (a, b, col, sym, on, o = {}) => { const [x1, y1] = NODES[a], [x2, y2] = NODES[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ox = dx / L * 48, oy = dy / L * 34;
      k.arrow(x1 + ox + (o.sx || 0), y1 + oy + (o.sy || 0), x2 - ox + (o.sx || 0), y2 - oy + (o.sy || 0), { color: on > .05 ? col : '#ccc', w: 2 + 3 * on, alpha: .35 + .65 * on, head: 10 });
      if (on > .05) for (let i = 0; i < 3; i++) { const f = ((t * .8 + i / 3) % 1); k.circ(x1 + ox + (o.sx || 0) + (dx - 2 * ox) * f, y1 + oy + (o.sy || 0) + (dy - 2 * oy) * f, 5 + on * 2, col); }
      if (sym) k.txt(sym, (x1 + x2) / 2 + (o.lx || 0), (y1 + y2) / 2 + (o.ly || -14), { size: 14, bold: true, color: col, alpha: .4 + .6 * on }); };
    const GA = C.red, GL = C.green;
    E('str', 'gpi', GA, '가바 ⊖ (직접)', act.direct, { sy: -8, lx: -40, ly: -22 });
    E('str', 'oth', '#a98', '', act.indirect, { sx: -10 }); E('oth', 'gpi', GL, '글루타메이트 ⊕ (간접)', act.indirect, { lx: 95, ly: 0 });
    E('gpi', 'th', GA, '가바 ⊖', act.gpi, { lx: 20, ly: 18 }); E('th', 'ctx', GL, '글루타메이트 ⊕', act.th, { lx: 40, ly: -6 });
    if (act.da != null) E('sn', 'str', C.pur, '도파민', act.da, { lx: -34, ly: 0 });
    const N = (id, a, col) => { const [x, y, l] = NODES[id]; k.g.save(); if (a > .5) { k.g.shadowColor = col; k.g.shadowBlur = 20 * a; } k.box(x - 52, y - 30, 104, 60, l, { fill: a > .5 ? '#fff4c2' : '#fff', stroke: col, size: 15, lw: 2 + 2 * a }); k.g.restore(); };
    N('ctx', act.th, C.green); N('str', Math.max(act.direct, act.indirect), C.red); N('gpi', act.gpi, C.red); N('th', act.th, C.green); N('oth', act.indirect, '#a98'); if (act.da != null) N('sn', act.da, C.pur);
    /* 움직이는 사람 */ const mv = act.th, x = 560, y = 330; k.g.save(); k.g.translate(x, y); const sw = Math.sin(t * 8 * mv) * .7 * mv; k.circ(0, -40, 10, '#fff', C.ink, 2.5); k.line([0, -30, 0, 0], C.ink, 3); k.line([0, -22, 16 * Math.cos(sw), -22 + 16 * Math.sin(sw)], C.ink, 3); k.line([0, -22, -16 * Math.cos(sw), -22 - 16 * Math.sin(sw) * .5], C.ink, 3); k.line([0, 0, 10 * Math.sin(sw), 22], C.ink, 3); k.line([0, 0, -10 * Math.sin(sw), 22], C.ink, 3); k.g.restore();
    k.txt(mv > .55 ? '운동 시작 ✔' : mv < .4 ? '운동 차단 ✖' : '…', x, y + 44, { size: 15, bold: true, color: mv > .55 ? C.green : C.red }); }
  function synapse(k, S, u, mode) { const t = S.t, g = k.g;
    /* 시냅스 전 (위) */ k.rr(120, -20, 420, 170, 60, '#f3ecff', C.pur, 3); k.txt('시냅스 전 뉴런 (도파민성 뉴런)', 330, 22, { size: 15, bold: true, color: C.pur });
    /* 시냅스 후 (아래) */ k.rr(100, 260, 460, 160, 40, '#eaf6ff', C.blue, 3); k.txt('시냅스 후 뉴런', 330, 400, { size: 15, bold: true, color: C.blue }); k.txt('시냅스 틈', 600, 205, { size: 14, color: C.gray });
    const ves = [[230, 95], [300, 70], [380, 100], [450, 80]]; const stop = mode === 'auto' && u > .55;
    ves.forEach(([x, y], i) => { k.circ(x, y, 24, '#fff', C.pur, 2); for (let j = 0; j < 5; j++) k.circ(x + Math.cos(j * 1.3 + t) * 10, y + Math.sin(j * 1.3 + t) * 10, 4, C.red); if (stop) { k.line([x - 18, y - 18, x + 18, y + 18], C.red, 4); } });
    /* 수용체 */ const R = [[200, 'D1'], [280, 'D2'], [380, 'D1'], [460, 'D2']]; R.forEach(([x, l]) => { const col = l === 'D1' ? C.green : C.blue; g.fillStyle = col; g.beginPath(); g.moveTo(x - 16, 262); g.lineTo(x - 16, 240); g.lineTo(x - 7, 240); g.lineTo(x - 7, 252); g.lineTo(x + 7, 252); g.lineTo(x + 7, 240); g.lineTo(x + 16, 240); g.lineTo(x + 16, 262); g.fill(); k.txt(l, x, 282, { size: 13, bold: true, color: col }); });
    return { ves, R }; }
  KOA.def('dopamine', {
    init(S) { S.da = 1; S.dat = true; },
    steps: [
      { cap: '음식·약으로 먹은 도파민은 <b>혈액-뇌 장벽</b>에서 막혀요 → 뇌에서는 <b>도파민성 뉴런이 직접 합성한 도파민만</b> 작용!', dur: 5 },
      { cap: '합성: <b>티로신</b> →(효소)→ <b>레보도파</b> →(또 다른 효소)→ <b>도파민</b> → <b>시냅스 소포</b>에 저장', dur: 6 },
      { cap: '뉴런이 활성화되면 소포의 도파민이 <b>시냅스 틈</b>으로 분비 → <b>시냅스 후 뉴런</b>의 수용체에 결합 = 신호 전달', dur: 6 },
      { cap: '<b>D1</b> = 흥분성 (활성 유도 ⊕) · <b>D2</b> = 억제성 (활성 억제 ⊖)', dur: 5 },
      { cap: '도파민성 뉴런 자신에게 있는 D2 = <b>자가 수용체</b>. 도파민이 붙으면 → <b>분비 중단</b> (스스로 분비를 조절)', dur: 6 },
      { cap: '일부 도파민은 <b>DAT</b>로 <b>재흡수</b> → 소포에 저장해 <b>재사용</b> 또는 뉴런 <b>안</b>에서 분해. DAT가 없으면 뉴런 <b>밖</b>에서 분해!', dur: 7 },
      { cap: '<b>직접 경로</b>: 선조체⊕ → 가바 → 창백핵 <b>억제</b> → 시상으로 가바가 안 감 → 시상 <b>활성</b> → 글루타메이트 → 피질 → <b>운동 시작</b> (억제의 억제 = 활성!)', dur: 8 },
      { cap: '<b>간접 경로</b>: 선조체⊕ → (다른 부위) → 글루타메이트 → 창백핵 <b>활성</b> → 가바 → 시상 <b>억제</b> → <b>운동 차단</b>', dur: 8 },
      { cap: '<b>흑질 도파민</b>: 직접 경로 선조체엔 D1 → 활성화, 간접 경로 선조체엔 D2 → 억제 ⇒ 둘 다 <b>운동 촉진</b>!', dur: 7 },
      { cap: '직접 해 보기: 흑질 도파민 양을 줄이면? (파킨슨병 &lt;보기&gt;에 자주 나와요)', lab: true }
    ],
    lab: { html: `<h4>🧪 흑질 도파민 조절기</h4><div class="row"><label>흑질 도파민 <input type="range" min="0" max="100" value="100" data-r></label><b data-v>100%</b></div><div class="out"></div>`,
      bind(el, S) { const r = el.querySelector('[data-r]'), v = el.querySelector('[data-v]'), out = el.querySelector('.out'); const upd = () => { S.da = r.value / 100; v.textContent = r.value + '%';
          out.innerHTML = S.da > .6 ? '도파민 충분 → D1이 직접 경로 ⊕, D2가 간접 경로 ⊖ → 시상 활성 → <b>운동이 수월하게 시작</b>' : S.da > .3 ? '도파민 감소 → 직접 경로 약해지고 간접 경로는 덜 억제됨 → 운동 시작이 둔해짐' : '도파민 매우 부족(파킨슨병) → 직접 경로 ↓ + 간접 경로 ↑ → 창백핵이 시상을 억제 → <b>움직임 시작이 어려움</b>'; };
        r.oninput = upd; upd(); } },
    draw(k, S, u) { const t = S.t, g = k.g;
      if (S.k === 0) { k.rr(0, 0, 300, 440, 0, '#ffecec'); k.txt('혈액 (몸)', 150, 40, { size: 18, bold: true, color: C.red }); k.txt('뇌', 480, 40, { size: 18, bold: true, color: C.pur });
        for (let y = 60; y < 420; y += 30) for (let x = 0; x < 2; x++) k.rr(300 + x * 22 - (y / 30 % 2) * 11, y, 22, 28, 3, '#c98a5a', '#7a4a20', 1.5); k.txt('혈액-뇌 장벽', 322, 430, { size: 14, bold: true });
        for (let i = 0; i < 6; i++) { const ph = (t * .5 + i / 6) % 1, x = 30 + ph * 260, bx = x > 270 ? 270 - (x - 270) * 3 : x; k.circ(bx, 90 + i * 55, 12, C.red, C.ink, 1.5); k.txt('DA', bx, 90 + i * 55, { size: 10, bold: true, color: '#fff' }); if (x > 265) k.txt('✖', 285, 90 + i * 55, { size: 18, bold: true, color: C.red }); }
        k.rr(400, 140, 200, 160, 50, '#f3ecff', C.pur, 3); k.txt('도파민성 뉴런', 500, 170, { size: 15, bold: true, color: C.pur }); for (let i = 0; i < 5; i++) k.circ(450 + i * 25, 240 + Math.sin(t * 2 + i) * 10, 10, C.red, C.ink, 1.5); k.txt('직접 합성 ✔', 500, 330, { size: 16, bold: true, color: C.green, alpha: seg(u, .4, .6) }); }
      if (S.k === 1) { const P = [['티로신', 90, '#888'], ['레보도파', 330, C.pur], ['도파민', 550, C.red]]; P.forEach(([n, x, c], i) => { const on = seg(u, i * .3, i * .3 + .15); k.g.save(); k.g.globalAlpha = .2 + .8 * on; g.beginPath(); for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3 + t * .5; g.lineTo(x + Math.cos(a) * 40, 170 + Math.sin(a) * 40); } g.closePath(); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); k.txt(n, x, 240, { size: 18, bold: true, color: c }); k.g.restore(); });
        [[150, 270], [390, 510]].forEach(([a, b], i) => { const p = seg(u, i * .3 + .12, i * .3 + .3); k.arrow(a, 170, b, 170, { p, color: C.ink, w: 3, label: i ? '또 다른 효소' : '효소', ly: -20 }); });
        const vp = seg(u, .75, .95); k.circ(550, 340, 50, '#fff', C.pur, 3); k.txt('시냅스 소포', 550, 410, { size: 15, bold: true, color: C.pur }); for (let j = 0; j < 6; j++) k.circ(550 + Math.cos(j + t) * 25 * vp, 340 + Math.sin(j + t) * 25 * vp, 7, C.red); k.arrow(550, 215, 550, 285, { p: vp, color: C.red }); }
      if (S.k >= 2 && S.k <= 5) { const mode = ['rel', 'rec', 'auto', 'dat'][S.k - 2]; const { ves, R } = synapse(k, S, u, mode);
        if (mode === 'rel' || mode === 'rec') { if (u > .1 || mode === 'rec') k.spark(330, 40, 22, t, C.org); for (let i = 0; i < 12; i++) { const f = mode === 'rec' ? 1 : seg(u, .2 + i * .03, .6 + i * .03), r = R[i % 4], v = ves[i % 4]; const x = lerp(v[0], r[0] + (i % 3 - 1) * 5, ease(f)), y = lerp(v[1] + 30, 236, ease(f)) + (f < 1 ? Math.sin(t * 5 + i) * 6 : 0); k.circ(x, y, 6, C.red, C.ink, 1); } }
        if (mode === 'rec') { k.txt('⊕ 흥분', 240, 330, { size: 22, bold: true, color: C.green }); k.txt('⊖ 억제', 420, 330, { size: 22, bold: true, color: C.blue }); g.save(); g.globalAlpha = .25 + .2 * Math.sin(t * 4); k.rr(110, 290, 220, 60, 20, C.green); k.rr(340, 290, 210, 60, 20, C.blue); g.restore(); }
        if (mode === 'auto') { const x = 540, y = 150; g.fillStyle = C.blue; g.save(); g.translate(x, y); g.rotate(-Math.PI / 2); g.beginPath(); g.moveTo(-16, 22); g.lineTo(-16, 0); g.lineTo(-7, 0); g.lineTo(-7, 12); g.lineTo(7, 12); g.lineTo(7, 0); g.lineTo(16, 0); g.lineTo(16, 22); g.fill(); g.restore(); k.txt('D2 자가 수용체', 560, 110, { size: 14, bold: true, color: C.blue });
          for (let i = 0; i < 4; i++) { const f = seg(u, .1 + i * .08, .45 + i * .08); k.circ(lerp(380, 516, ease(f)), lerp(200, 150, ease(f)), 6, C.red, C.ink, 1); } if (u > .55) { k.tag('분비 중단!', 330, 205, C.red, { size: 18 }); } }
        if (mode === 'dat') { const dat = u < .6; k.rr(480, 130, 40, 34, 8, dat ? C.org : '#ddd', C.ink, 2); k.txt('DAT', 500, 147, { size: 12, bold: true, color: dat ? '#fff' : C.gray }); if (!dat) k.txt('DAT 없음', 500, 115, { size: 13, bold: true, color: C.red });
          for (let i = 0; i < 6; i++) { const f = ((t * .4 + i / 6) % 1); if (dat) { const x = lerp(400, 500, f), y = f < .6 ? lerp(220, 165, f / .6) : lerp(165, 110, (f - .6) / .4); k.circ(x, y, 6, C.red, C.ink, 1); if (f > .9) k.txt(i % 2 ? '♻ 재사용' : '✂ 분해(안)', 470, 60, { size: 15, bold: true, color: i % 2 ? C.green : C.red }); }
            else { const x = lerp(400, 620, f), y = 210 + Math.sin(f * 9 + i) * 10; k.circ(x, y, 6 * (1 - f * .7), C.red, C.ink, 1); if (f > .7) k.txt('✂', x, y - 16, { size: 16, color: C.red }); } }
          k.txt(dat ? 'DAT로 재흡수 → 재사용 or 뉴런 안에서 분해' : 'DAT 없는 뉴런 → 도파민은 뉴런 밖에서 분해', 330, 215, { size: 15, bold: true, color: dat ? C.org : C.red }); } }
      if (S.k === 6) { const a = ease(seg(u, .05, .9)); circuit(k, S, { direct: seg(u, 0, .2), indirect: 0, gpi: 1 - seg(u, .2, .4), th: seg(u, .4, .6), da: null }, t); }
      if (S.k === 7) { circuit(k, S, { direct: 0, indirect: seg(u, 0, .25), gpi: .5 + .5 * seg(u, .25, .45), th: 1 - seg(u, .45, .65), da: null }, t); }
      if (S.k === 8) { const d = seg(u, 0, .3); circuit(k, S, { direct: .2 + .8 * d, indirect: 1 - .85 * d, gpi: 1 - .9 * seg(u, .3, .55), th: seg(u, .5, .7), da: d }, t); k.tag('D1 → 직접 ⊕', 120, 245, C.green, { alpha: seg(u, .2, .35), size: 13 }); k.tag('D2 → 간접 ⊖', 120, 270, C.blue, { alpha: seg(u, .3, .45), size: 13 }); }
      if (S.k === 9) { const d = S.da, dir = .15 + .85 * d, ind = 1 - .85 * d, gpi = clamp(.5 + .7 * ind - .7 * dir, 0, 1), th = 1 - gpi; circuit(k, S, { direct: dir, indirect: ind, gpi, th, da: d }, t); }
    }
  });

  /* ───────── 심전도 ───────── */
  const G = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  function ecgV(tc, c) { /* tc: 주기 안의 시간(초) */ const pr = c.pr || 0, w = c.wide ? 2 : 1, q0 = .17 + pr;
    let v = c.aP * G(tc, .05, .025) + c.aR * (-.12 * G(tc, q0, .009 * w) + 1 * G(tc, q0 + .025 * w, .012 * w) - .25 * G(tc, q0 + .05 * w, .01 * w)) + c.aT * G(tc, .45 + pr + (w - 1) * .05, .065);
    return v * (c.flip ? -1 : 1) * (c.lead === 1 ? .5 : 1); }
  const CASES = { n: { aP: .16, aR: 1, aT: .3, hr: 62 }, b: { aP: -.13, aR: 1, aT: .3, hr: 45 }, c: { aP: .16, aR: -.95, aT: .3, hr: 55, pr: .07, wide: 1, invT: false } };
  function body(k, S, phase, c) { const g = k.g; k.g.save(); k.rr(40, 70, 230, 330, 60, '#fbe7d5', '#c9a487', 2); k.circ(155, 50, 34, '#fbe7d5', '#c9a487', 2);
    const RA = [62, 112], LA = [248, 112], LL = [232, 388]; const flip = c.flip, lead = c.lead;
    const el = (p, sign, name) => { k.circ(p[0], p[1], 12, sign === '+' ? C.red : sign === '−' ? C.blue : '#ccc', C.ink, 2); k.txt(sign || '', p[0], p[1], { size: 15, bold: true, color: '#fff' }); k.txt(name, p[0], p[1] + 24, { size: 12, bold: true }); };
    const sRA = flip ? '+' : '−', sOther = flip ? '−' : '+'; el(RA, sRA, '오른팔'); el(lead === 1 ? LA : LL, sOther, lead === 1 ? '왼팔' : '왼다리'); el(lead === 1 ? LL : LA, '', lead === 1 ? '왼다리' : '왼팔');
    k.txt('※ 마주 보는 그림: 몸의 오른쪽 = 화면 왼쪽', 140, 433, { size: 11, color: C.gray });
    /* 심장 */ const hx = 160, hy = 225, aG = phase.atria, vG = phase.vent, vR = phase.repol;
    const fillA = aG > 0 ? `rgba(255,120,60,${.25 + .6 * aG})` : '#f7c6c6', fillV = vG > 0 ? `rgba(255,90,40,${.25 + .65 * vG})` : vR > 0 ? `rgba(80,140,255,${.2 + .5 * vR})` : '#f2b3b3';
    k.rr(hx - 52, hy - 50, 50, 42, 16, fillA, C.ink, 2); k.rr(hx + 2, hy - 50, 50, 42, 16, fillA, C.ink, 2); k.txt('우심방', hx - 27, hy - 29, { size: 11, bold: true }); k.txt('좌심방', hx + 27, hy - 29, { size: 11, bold: true });
    g.beginPath(); g.moveTo(hx - 54, hy - 4); g.lineTo(hx + 54, hy - 4); g.quadraticCurveTo(hx + 50, hy + 60, hx + 10, hy + 80); g.quadraticCurveTo(hx - 50, hy + 50, hx - 54, hy - 4); g.fillStyle = fillV; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke(); k.txt('심실', hx, hy + 30, { size: 13, bold: true });
    k.circ(hx - 46, hy - 46, 6, phase.sa ? C.yel : '#fff', C.ink, 2); if (phase.sa) k.spark(hx - 46, hy - 46, 16, S.t, C.org); k.txt('동방결절', hx - 60, hy - 66, { size: 11, bold: true, color: C.org });
    if (phase.arrow) k.arrow(hx - 50, hy - 40, hx + 30, hy + 60, { color: C.org, w: 4, alpha: phase.arrow, head: 12 });
    k.g.restore(); }
  function strip(k, S, c, hist, o = {}) { const x0 = 300, y0 = 70, w = 330, h = 250, mid = y0 + h * .55, sc = 110; k.rr(x0, y0, w, h, 6, '#fff7f7', '#e6b9b9', 1.5);
    for (let x = x0; x <= x0 + w; x += 11) k.line([x, y0, x, y0 + h], x % 55 === x0 % 55 ? '#f0c9c9' : '#f8e2e2', 1); for (let y = y0; y <= y0 + h; y += 11) k.line([x0, y, x0 + w, y], '#f8e2e2', 1);
    k.line([x0, mid, x0 + w, mid], '#c9a0a0', 1.5, [4, 4]); k.txt('기저선', x0 + 26, mid + 12, { size: 11, color: '#b07a7a' }); k.txt('시간 →', x0 + w - 30, y0 + h - 10, { size: 12, color: C.gray }); k.txt('전압↑', x0 + 22, y0 + 14, { size: 12, color: C.gray });
    const g = k.g; g.beginPath(); hist.forEach((v, i) => { const x = x0 + i, y = mid - v * sc; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.lineJoin = 'round'; g.stroke(); return { x0, y0, w, h, mid, sc }; }
  KOA.def('ecg', {
    init(S) { S.cs = 'n'; S.lead = 2; S.flip = false; S.hr = 62; S.hist = []; S.tt = 0; S.slow = 1; },
    steps: [
      { cap: '전기 자극은 <b>동방결절</b>(심방의 가장 오른쪽 위)에서 시작 → 심방 → 심실 → 소멸. 심전도 = 이 전기 활동을 <b>시간(가로)–전압(세로)</b> 파형으로!', dur: 7 },
      { cap: '<b>P파 ㉠ = 심방의 탈분극</b>. P파의 <b>가로 폭</b> = 전기가 우심방에서 좌심방까지 가는 시간', dur: 7, slow: .45 },
      { cap: '<b>QRS파 ㉡ = 심실의 탈분극</b>. 심근세포가 거의 <b>동시에</b> 활성 → <b>가로 폭 좁음</b> / 근육이 많아 전압 높음 → <b>세로 폭 김</b>', dur: 7, slow: .45 },
      { cap: '<b>T파 ㉢ = 심실의 재분극</b>(분극 상태로 돌아감) → 탈분극보다 오래 걸려 <b>QRS보다 넓다</b>. 정상 T파 편향 = QRS 편향', dur: 7, slow: .45 },
      { cap: '간격 읽기: <b>P 시작 ~ QRS 시작</b> = 심방→심실 전달 시간 · <b>R ~ 다음 R</b> = 심장이 뛰는 빠르기 (넓으면 느림)', dur: 8 },
      { cap: '편향 규칙: 탈분극이 <b>양극(+)</b> 쪽으로 가면 위(양성), <b>음극(−)</b> 쪽이면 아래(음성). <b>제2유도</b> = 오른팔(−)·왼다리(+) → 정상 방향(오른쪽 위→왼쪽 아래)과 같아 <b>모두 양성</b>', dur: 8 },
      { cap: '전극을 거꾸로 붙이면? (오른팔 +, 왼다리 −) → 파형이 <b>사라지지 않고 뒤집혀</b> 기록돼요 — "실제와 다르게 기록" (기출 19번 ⑤)', dur: 7, flip: true },
      { cap: '직접 해 보기: 기출 20번 &lt;보기&gt;의 ㄱ·ㄴ·ㄷ, 유도, 극성, 심박수를 바꿔 봐요.', lab: true }
    ],
    lab: { html: `<h4>🧪 심전도 실험실</h4><div class="row seg" data-g="cs"><button data-v="n" class="on">ㄱ 정상</button><button data-v="b">ㄴ</button><button data-v="c">ㄷ</button></div><div class="row seg" data-g="ld"><button data-v="2" class="on">제2유도</button><button data-v="f">극성 반대로</button><button data-v="1">오른팔−·왼팔+</button></div><div class="row"><label>심박수 <input type="range" min="40" max="120" value="62" data-r></label><b data-v2>62회/분</b></div><div class="out"></div>`,
      enter(el, S) { S.hist = []; },
      bind(el, S) { const out = el.querySelector('.out'), r = el.querySelector('[data-r]'), v2 = el.querySelector('[data-v2]');
        const D = { n: 'ㄱ 정상: 제2유도에서 P·QRS·T 모두 <b>양성</b>, QRS 폭 좁음.', b: 'ㄴ: <b>P파가 음성</b> → 심방 탈분극이 비정상 방향 (20번 ① 적절). R–R 간격 ↑ → 느리게 뜀.', c: 'ㄷ: <b>QRS 음성</b> → 심실 <b>탈분극</b> 방향 이상 (재분극 아님! 20번 ② 부적절). QRS 폭 ↑ (③), P 시작~QRS 시작 ↑ (④).' };
        const upd = () => { el.querySelectorAll('[data-g=cs] button').forEach(b => b.classList.toggle('on', b.dataset.v === S.cs)); el.querySelectorAll('[data-g=ld] button').forEach(b => b.classList.toggle('on', b.dataset.v === (S.flip ? 'f' : String(S.lead))));
          out.innerHTML = D[S.cs] + (S.flip ? '<br>⚠️ 극성 반대: 모든 파형이 뒤집혀 기록 (기록은 됨!)' : S.lead === 1 ? '<br>오른팔−·왼팔+: 좌우로 나뉠 때 양극은 왼쪽 → 규칙대로. 정상이면 양성(크기는 작게)' : ''); v2.textContent = S.hr + '회/분'; };
        el.onclick = e => { const b = e.target.closest('button'); if (!b) return; const gname = b.parentNode.dataset.g; if (gname === 'cs') { S.cs = b.dataset.v; S.hr = CASES[S.cs].hr; r.value = S.hr; } if (gname === 'ld') { S.flip = b.dataset.v === 'f'; S.lead = b.dataset.v === '1' ? 1 : 2; } S.hist = []; upd(); };
        r.oninput = () => { S.hr = +r.value; upd(); }; upd(); } },
    draw(k, S, u, s) { const dt = 1 / 60; const lab = !!s.lab; const base = lab ? CASES[S.cs] : CASES.n; const c = { ...base, flip: lab ? S.flip : !!s.flip, lead: lab ? S.lead : 2 }; const hr = lab ? S.hr : base.hr, T = 60 / hr;
      const sp = (s.slow || 1); if (S._k !== S.k) { S._k = S.k; S.hist = []; S.tt = 0; }
      for (let i = 0; i < 2; i++) { S.tt += dt * sp * 0.5; S.hist.push(ecgV(S.tt % T, c)); } if (S.hist.length > 330) S.hist.splice(0, S.hist.length - 330);
      const tc = S.tt % T, pr = c.pr || 0, w = c.wide ? 2 : 1; const phase = { sa: tc < .03, atria: tc < .11 ? Math.sin(tc / .11 * Math.PI) : 0, vent: tc > .16 + pr && tc < .16 + pr + .08 * w ? 1 : 0, repol: tc > .36 + pr && tc < .6 + pr ? Math.sin((tc - .36 - pr) / .24 * Math.PI) : 0, arrow: (S.k >= 5) ? (tc < .3 + pr ? 1 : .2) : 0 };
      body(k, S, phase, c); const st = strip(k, S, c, S.hist);
      const lbl = (txt, col) => k.tag(txt, 465, 345, col, { size: 15 });
      if (S.k === 1) lbl(phase.atria > 0 ? '지금: 심방 탈분극 → P파' : 'P파를 기다리는 중…', C.org);
      if (S.k === 2) lbl(phase.vent ? '지금: 심실 탈분극 → QRS파' : 'QRS파: 좁고 높게', C.red);
      if (S.k === 3) lbl(phase.repol > 0 ? '지금: 심실 재분극 → T파' : 'T파: 넓고 둥글게', C.blue);
      if (S.k === 4) { const x1 = st.x0 + 330 - ((S.tt % T) / (dt * .5 * 2)) - 0; k.txt('P~QRS 간격 = 심방→심실', 465, 345, { size: 15, bold: true, color: C.org }); k.txt('R–R 간격 = 박동 빠르기', 465, 372, { size: 15, bold: true, color: C.red }); }
      if (S.k === 5) { k.txt('탈분극 방향 → 양극(+) 쪽 = 위로!', 465, 345, { size: 15, bold: true, color: C.org }); }
      if (S.k === 6) { k.tag('극성 반대 → 뒤집힌 파형', 465, 345, C.red, { size: 15 }); }
      if (lab) k.txt(`${{ n: 'ㄱ 정상', b: 'ㄴ', c: 'ㄷ' }[S.cs]} · ${S.flip ? '극성 반대' : S.lead === 1 ? '오른팔−·왼팔+' : '제2유도'} · ${S.hr}회/분`, 465, 345, { size: 15, bold: true, color: C.navy });
      k.txt('심전도 기록지', 465, 55, { size: 15, bold: true, color: '#b07a7a' }); }
  });

  /* ───────── 혈압 (참고) ───────── */
  KOA.def('bp', {
    steps: [
      { cap: '혈압 ∝ <b>심장박출량</b> × <b>말초 혈관 저항</b>. 심장박출량 = 일회당 박출량 × 분당 심박수', dur: 6 },
      { cap: '콩팥 사구체: 큰 분자(혈구·단백질)는 통과 ✖, 작은 분자(물·나트륨)는 통과 → 세뇨관. 혈압↓ → 여과액↓ → 소변↓ → 체액량↑ → 혈압↑', dur: 7 },
      { cap: '<b>RAAS</b>: 혈압↓ → 레닌↑ → 안지오텐신Ⅰ → (변환 효소) → 안지오텐신Ⅱ → 알도스테론↑ → 나트륨·수분 재흡수↑ → 혈압↑', dur: 8 },
      { cap: '<b>신경반사</b>: 혈압↓ → 동맥벽 압력 수용기 → 혈관 운동 중추 흥분 → 교감 → <b>카테콜아민</b>(혈관 수축, 심박·수축력↑). 혈압↑ → 부교감 → <b>아세틸콜린</b> → 혈압↓', dur: 8 },
      { cap: '상호 작용: 카테콜아민 → 레닌 분비 촉진 / 안지오텐신Ⅱ → 카테콜아민 분비 촉진', dur: 5 }
    ],
    draw(k, S, u) { const t = S.t;
      if (S.k === 0) { const beat = (Math.sin(t * 6) + 1) / 2; k.circ(150, 220, 55 + beat * 10, C.pink, C.red, 4); k.txt('심장', 150, 220, { size: 18, bold: true, color: C.red }); const nar = seg(u, .4, .8); k.rr(230, 200 + nar * 14, 380, 40 - nar * 28, 12, '#ffd0d0', C.red, 3);
        for (let i = 0; i < 6; i++) k.circ(240 + ((t * 120 + i * 60) % 360), 220, 7, C.red); k.txt('혈관이 좁아지면 저항↑ → 혈압↑', 420, 290, { size: 15, bold: true, alpha: nar }); k.txt('혈압 ∝ 심장박출량 × 말초 혈관 저항', 330, 70, { size: 21, bold: true }); k.txt('심장박출량 = 일회당 박출량 × 심박수', 330, 110, { size: 17, color: C.navy, bold: true }); }
      if (S.k === 1) { k.rr(260, 60, 40, 320, 6, '#e3d6c4', C.ink, 2); k.txt('사구체 막', 280, 400, { size: 14, bold: true }); for (let i = 0; i < 8; i++) { const big = i % 2 === 0, f = (t * .35 + i / 8) % 1, x = 40 + f * 520, y = 90 + i * 36; const bx = big && x > 245 ? 245 - (x - 245) : x; if (big) { k.circ(bx, y, 14, C.red, C.ink, 1.5); } else { k.circ(x, y, 6, C.blue); } }
        k.txt('혈구·단백질 ✖', 130, 410, { size: 14, bold: true, color: C.red }); k.txt('물·나트륨 → 세뇨관', 470, 410, { size: 14, bold: true, color: C.blue }); }
      if (S.k === 2) chain(k, ['혈압↓\n(콩팥 감지)', '레닌↑', '안지오\n텐신Ⅰ', '안지오\n텐신Ⅱ', '알도스\n테론↑', 'Na·물\n재흡수↑'], u, { y: 170, w: 88, h: 70, x: 14, size: 14 });
      if (S.k === 3) { chain(k, ['혈압↓', '압력 수용기\n(동맥벽)', '혈관 운동\n중추 흥분', '교감 신경', '카테콜아민'], seg(u, 0, .55), { y: 90, w: 104, h: 60, x: 14, size: 13.5 }); chain(k, ['혈압↑', '중추 억제', '부교감 신경', '아세틸콜린\n→ 심장', '혈압↓'], seg(u, .5, 1), { y: 270, w: 104, h: 60, x: 14, size: 13.5, col: C.blue, fill: C.sky }); }
      if (S.k === 4) { k.box(80, 170, 170, 70, '교감 신경계\n(카테콜아민)', { fill: C.cream, stroke: C.red, size: 15 }); k.box(410, 170, 170, 70, '콩팥\n(레닌 → 안지오텐신Ⅱ)', { fill: C.sky, stroke: C.blue, size: 15 });
        k.arrow(255, 185, 405, 185, { p: seg(u, .1, .4), color: C.red, label: '레닌 분비 촉진' }); k.arrow(405, 228, 255, 228, { p: seg(u, .5, .8), color: C.blue, label: '카테콜아민 분비 촉진', ly: 20 }); }
    }
  });
})();
