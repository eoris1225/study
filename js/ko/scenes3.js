/* 학습 애니메이션 3: 논증하는 글 쓰기 · 인류세 (교과서) + 분류 게임 실험실 */
(() => {
  const { C, clamp, lerp, ease, seg } = KOA;
  /* 분류 게임: 카드 한 장씩 → 맞는 칸 고르기 */
  function sortLab(title, cats, items) {
    return { html: `<h4>🎮 ${title}</h4><div class="row seg" data-cats>${cats.map((c, i) => `<button data-c="${i}">${c}</button>`).join('')}</div><div class="out"></div><div class="row"><button class="tapme" data-next>다음 카드 ▶</button><span data-sc></span></div>`,
      enter(el, S) { },
      bind(el, S) { const out = el.querySelector('.out'), sc = el.querySelector('[data-sc]'); let order = [], n = 0, right = 0, tried = 0;
        const shuffle = () => { order = items.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [order[i], order[j]] = [order[j], order[i]]; } n = 0; };
        const show = () => { const it = items[order[n]]; S.card = it[0]; S.res = null; out.innerHTML = `<b>카드 ${n + 1}/${items.length}</b> · ${it[0]}`; sc.textContent = tried ? `맞힌 개수 ${right}/${tried}` : ''; el.querySelectorAll('[data-c]').forEach(b => b.classList.remove('on')); };
        el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b && S.res == null) { const it = items[order[n]], ok = +b.dataset.c === it[1]; tried++; if (ok) right++; S.res = ok ? 1 : 0; S.ans = cats[it[1]]; b.classList.add('on');
            out.innerHTML = `${ok ? '⭕ 맞아!' : `❌ 정답은 <b>${cats[it[1]]}</b>`} — ${it[2]}`; sc.textContent = `맞힌 개수 ${right}/${tried}`; }
          if (e.target.closest('[data-next]')) { n++; if (n >= order.length) shuffle(); show(); } });
        shuffle(); show(); } };
  }
  function cardDraw(k, S, cats) { const t = S.t; k.box(60, 90, 540, 150, '', { fill: '#fff', stroke: C.navy, lw: 3 }); const lines = wrap(k, S.card || '', 500, 19);
    lines.forEach((l, i) => k.txt(l, 330, 165 + (i - (lines.length - 1) / 2) * 28, { size: 19, bold: true }));
    if (S.res != null) { k.tag(S.res ? '⭕ 맞아!' : `❌ ${S.ans}`, 330, 290, S.res ? C.green : C.red, { size: 22 }); }
    else k.txt('아래 버튼에서 골라 보세요 👇', 330, 290, { size: 17, color: C.gray, bold: true }); k.txt(cats.join('  ·  '), 330, 360, { size: 16, bold: true, color: C.navy }); }
  function wrap(k, s, w, size) { const g = k.g; g.save(); g.font = `700 ${size}px 'Noto Sans KR'`; const out = []; let cur = ''; for (const ch of s) { if (g.measureText(cur + ch).width > w && cur) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); g.restore(); return out; }

  /* ───────── 논증하는 글 쓰기 ───────── */
  KOA.def('argue', {
    steps: [
      { cap: '<b>논증</b> = <b>설득</b>을 목적으로 + <b>정당한 근거나 일반적인 원리</b>를 들어 + <b>주장</b>을 펼치는 것', dur: 5 },
      { cap: '설득 전략 3가지: 🧠 <b>이성적</b>(이성·논리) · ❤️ <b>감성적</b>(독자의 감성·공감) · 🤝 <b>인성적</b>(필자의 성품·행동에 대한 신뢰성). 논증하는 글의 기본은 <b>이성적</b>!', dur: 7 },
      { cap: '[생각 틔우기] 생방송 분석: 의학 박사 출연 → <b>인성적</b> / "△△ 함유" → <b>이성적</b> / "매진 임박·한정판" → <b>감성적</b> (목적: 영양제 판매)', dur: 8 },
      { cap: '설득 전략은 이렇게 구체화: ① <b>타당한 논거 수집·선별</b> + ② <b>논증 요소의 관계를 고려한 내용 조직</b> + ③ <b>다양한 표현 전략</b>', dur: 6 },
      { cap: '논거 = 주장을 뒷받침하는 <b>객관적 근거</b>. <b>사실 논거</b>(역사적 사실·실험 결과·통계) / <b>의견 논거</b>(전문가 의견·여론·상식). 선별 기준: <b>신뢰성·타당성·공정성</b>', dur: 8 },
      { cap: '내용 조직: <b>근거</b> → 이유를 뒷받침 → <b>이유</b> → 주장을 정당화 → <b>주장</b>, 그리고 <b>예상 반론</b> 고려. 조직 방법: 원인과 결과 · 논리적 순서(연역·유추·귀납) · 문제와 해결 방안', dur: 8 },
      { cap: '표현 전략: 예상 독자 수준의 어휘, 어법에 맞는 문장 + 보조 자료(그림·매체), <b>비유 · 설의 · 이중 부정</b>으로 설득 효과 ↑', dur: 7 },
      { cap: '분류 게임: 카드를 읽고 어떤 설득 전략인지 골라 봐요.', lab: true }
    ],
    lab: sortLab('설득 전략 분류 게임', ['이성적', '감성적', '인성적'], [
      ['"실험 결과, 아침을 먹은 학생의 집중력 점수가 12% 높았습니다."', 0, '실험 결과(사실 논거)로 논리적 설득'],
      ['"저는 10년 동안 이 동네 아이들을 무료로 가르쳐 왔습니다. 믿어 주세요."', 2, '필자의 행동에 대한 신뢰'],
      ['"버려진 강아지가 빗속에서 떨고 있는 모습을 떠올려 보세요."', 1, '감성·공감 자극'],
      ['"통계에 따르면 청소년 10명 중 4명이 수면 부족을 겪습니다."', 0, '통계 수치 → 이성적'],
      ['"지금 신청하지 않으면 다시는 이 기회가 없습니다!"', 1, '조급함·불안 자극 → 감성적'],
      ['"30년간 연구해 온 의학 박사로서 말씀드립니다."', 2, '말하는 이의 전문성·신뢰'],
      ['"A가 B의 원인이고 B가 C를 일으키므로, A를 줄이면 C도 줄어듭니다."', 0, '인과 논리 → 이성적'],
      ['"여러분의 자녀가 웃을 수 있는 내일을 함께 만들어 주세요."', 1, '감성 호소'],
      ['"제가 약속한 공약은 지난 임기 동안 모두 지켰습니다."', 2, '필자의 행동 → 인성적']
    ]),
    draw(k, S, u, s) { const t = S.t, g = k.g;
      if (S.k === 0) { const P = [['설득을 목적으로', C.blue], ['정당한 근거·\n일반적 원리를 들어', C.green], ['주장을 펼침', C.red]]; P.forEach(([l, c], i) => { const a = ease(seg(u, i * .25, i * .25 + .25)); k.box(lerp(330, 40 + i * 200, a) - 0, lerp(-80, 150, a), 180, 80, l, { fill: '#fff', stroke: c, size: 17, alpha: a }); if (i < 2) k.txt('+', 230 + i * 200, 190, { size: 30, bold: true, alpha: a }); });
        k.tag('= 논증', 330, 320, C.navy, { size: 26, alpha: seg(u, .8, .95) }); }
      if (S.k === 1) { const P = [['🧠', '이성적', '이성과 논리', C.blue], ['❤️', '감성적', '독자의 감성·공감', C.red], ['🤝', '인성적', '필자의 성품·행동\n신뢰성', C.green]]; P.forEach(([e, n, d, c], i) => { const x = 110 + i * 220, a = seg(u, i * .2, i * .2 + .2), h = 160 * ease(a);
          k.rr(x - 70, 330 - h, 140, h, 10, c + '22', c, 3); k.txt(e, x, 330 - h - 30, { size: 36, alpha: a }); k.txt(n, x, 300, { size: 20, bold: true, color: c, alpha: a }); k.txt(d, x, 250, { size: 14, bold: true, alpha: a }); });
        k.tag('논증하는 글의 기본 = 이성적', 330, 380, C.blue, { size: 16, alpha: seg(u, .7, .85) }); }
      if (S.k === 2) { k.rr(40, 60, 300, 200, 16, '#cfe3f5', C.ink, 3); k.tag('생방송', 190, 80, C.red, { size: 14 }); k.person(120, 170, .9, { t, shirt: '#e8d9a8', label: '' }); k.person(260, 170, .9, { t: t + 1, shirt: '#fff', label: '' }); k.txt('매진 임박', 280, 235, { size: 18, bold: true, color: C.red }); k.txt('의학 박사', 260, 115, { size: 12, bold: true });
        const T = [['의학 박사 출연', '인성적', C.green, 90], ['"△△ 많이 함유"', '이성적', C.blue, 190], ['"매진 임박·한정판"', '감성적', C.red, 290]]; T.forEach(([a, b, c, y], i) => { const p = ease(seg(u, .15 + i * .25, .35 + i * .25)); k.box(380, y - 30, 250, 60, '', { fill: '#fff', stroke: c, alpha: .2 + .8 * p }); k.txt(a, 450, y, { size: 14, bold: true, alpha: p }); k.arrow(520, y, 560, y, { p, color: c, w: 2.5, head: 8 }); k.txt(b, 595, y, { size: 16, bold: true, color: c, alpha: p }); });
        k.txt('목적: 성장기 영양제를 사게 하기', 190, 300, { size: 15, bold: true, color: C.navy, alpha: seg(u, .85, 1) }); }
      if (S.k === 3) { k.box(30, 170, 120, 80, '논증의\n설득 전략', { fill: C.cream, size: 15 }); g.save(); g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(170, 140); g.quadraticCurveTo(155, 210, 170, 280); g.stroke(); g.beginPath(); g.moveTo(630, 140); g.quadraticCurveTo(645, 210, 630, 280); g.stroke(); g.restore();
        [['타당한 논거\n수집과 선별', C.blue], ['논증 요소의 관계를\n고려한 내용 조직', C.green], ['다양한 표현\n전략 활용', C.red]].forEach(([l, c], i) => { const a = seg(u, i * .25, i * .25 + .2); k.box(180 + i * 150, 170, 130, 80, l, { fill: '#efe9ff', stroke: c, size: 13, alpha: .2 + .8 * a }); if (i < 2) k.txt('+', 318 + i * 150, 210, { size: 24, bold: true, alpha: a }); }); }
      if (S.k === 4) { const B = [['사실 논거', 150, C.blue], ['의견 논거', 510, C.org]]; B.forEach(([n, x, c]) => { g.beginPath(); g.moveTo(x - 110, 250); g.lineTo(x - 85, 380); g.lineTo(x + 85, 380); g.lineTo(x + 110, 250); g.closePath(); g.fillStyle = c + '22'; g.fill(); g.strokeStyle = c; g.lineWidth = 3; g.stroke(); k.txt(n, x, 405, { size: 18, bold: true, color: c }); });
        const I = [['역사적 사실', 0], ['전문가 의견', 1], ['실험 결과', 0], ['일반적 여론', 1], ['통계 수치', 0], ['상식', 1]]; I.forEach(([n, b], i) => { const f = ease(seg(u, i * .11, i * .11 + .2)), x0 = 330, x1 = b ? 510 : 150, y1 = 280 + (i >> 1) * 30; k.tag(n, lerp(x0, x1, f), lerp(60 + i * 8, y1, f), b ? C.org : C.blue, { size: 13 }); });
        k.txt('선별 기준: 신뢰성 · 타당성 · 공정성', 330, 200, { size: 18, bold: true, color: C.navy, alpha: seg(u, .75, .9) }); }
      if (S.k === 5) { const N = [['주장', 110], ['이유', 290], ['근거', 450]]; N.forEach(([n, x]) => { k.circ(x, 190, 42, '#eef1c9', C.ink, 3); k.txt(n, x, 190, { size: 19, bold: true }); });
        k.arrow(408, 190, 335, 190, { p: seg(u, .1, .3), color: C.ink, w: 4 }); k.txt('이유를 뒷받침하고\n주장을 지지함', 370, 255, { size: 13, bold: true, alpha: seg(u, .2, .35) }); k.arrow(248, 190, 155, 190, { p: seg(u, .3, .5), color: C.ink, w: 4 }); k.txt('근거를 바탕으로 하여\n주장을 정당화함', 200, 255, { size: 13, bold: true, alpha: seg(u, .4, .55) });
        k.circ(545, 190, 36, '#cfe0f5', C.blue, 3); k.txt('예상\n반론', 545, 190, { size: 15, bold: true, color: C.blue }); if (u > .55) { g.save(); g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(120, 140); g.quadraticCurveTo(330, 40, 520, 150); g.stroke(); g.restore(); k.txt('예상되는 반론을 고려하여 논증을 구성함', 330, 75, { size: 14, bold: true }); }
        ['원인과 결과에 따라', '논리적 순서(연역·유추·귀납)', '문제와 해결 방안에 따라'].forEach((l, i) => k.tag(l, 120 + i * 210, 345, C.navy, { size: 13, alpha: seg(u, .7 + i * .08, .8 + i * .08) })); }
      if (S.k === 6) { const E = [['비유', '"독서는 마음의 근육 운동이다."'], ['설의', '"환경을 지키지 않는다면 미래가 있겠는가?"'], ['이중 부정', '"우리는 이 문제를 외면하지 않을 수 없다… 아니, 외면할 수 없다."'], ['보조 자료', '📊 그래프 · 🖼 그림 · 🎞 매체 자료']];
        E.forEach(([a, b], i) => { const p = seg(u, i * .22, i * .22 + .18); k.tag(a, 90, 90 + i * 75, [C.blue, C.red, C.pur, C.green][i], { size: 15, alpha: p }); k.txt(b, 380, 90 + i * 75, { size: 15, bold: true, alpha: p }); });
        k.txt('기본: 예상 독자 수준의 어휘 + 정확하고 어법에 맞는 문장', 330, 400, { size: 15, bold: true, color: C.navy }); }
      if (S.k === 7) cardDraw(k, S, ['이성적', '감성적', '인성적']);
    }
  });

  /* ───────── 인류세 ───────── */
  KOA.def('anthro', {
    steps: [
      { cap: '지질 시대 연표 끝자락: <b>홀로세</b>(기원전 9677년~ 현재) → 크뤼천: 1800년 이래 <b>인류세</b>! (시작점 후보: 1800년대 산업 혁명, 1950년경)', dur: 6 },
      { cap: '구분 기준: 인류가 <b>자기 행동을 이해하지 못한 채</b> 지구의 근본적 과정을 바꾸기 시작함 — 대기의 화학 · 동식물종의 범위·다양성·분포 · 물 순환 · 침식과 퇴적', dur: 7 },
      { cap: '광합성으로 들어오는 에너지의 <b>25~40%</b>에 인류가 영향 = 생물권 에너지 예산의 <b>1/4~1/2</b>이 "한 종의 변덕"에 따라!', dur: 6 },
      { cap: '<b>존 맥닐</b>: 인류는 의도 없이 "통제하지 않은 대규모 실험"을 저질러 왔고, 이것이 20세기 역사에서 <b>가장 중요한 측면</b>이 될 것', dur: 7 },
      { cap: '<b>비관론</b>(러브록): 변화는 이미 통제 불가능. 생물권 = 반응하는 <b>초유기체</b> → 인류에 맞섬. "세계적 교통사고" → 성장 억제? 탈산업화?', dur: 8 },
      { cap: '<b>낙관론</b>: <b>집단 학습</b> → 새 기술(유전 공학 세균, 쓰레기 에너지, CO₂ 흡수, 핵융합, 나노 기계) + <b>국제 협력</b> + <b>소비 변천</b>', dur: 8 },
      { cap: '교과서 정리: 받침점 <b>인류세</b> 위의 저울 — 부정적 "회복 불가능한 변화" ⚖️ 긍정적 "집단 학습으로 해결할 기술·전략"', dur: 6 },
      { cap: '분류 게임: 카드가 어느 관점의 말인지 골라 봐요.', lab: true }
    ],
    lab: sortLab('관점 분류 게임', ['비관적 관점', '낙관적 관점', '인류세 설명'], [
      ['인류가 일으킨 변화는 이미 통제하기 불가능해졌다.', 0, '러브록 등 비관론'],
      ['유전 공학으로 석탄을 천연가스로 바꾸는 세균을 만들 수 있다.', 1, '집단 학습 → 기술'],
      ['인류는 생물권을 스스로 변형하는 능력을 지닌 최초의 종이다.', 2, '인류세의 의미(2문단)'],
      ['생물권은 필요하다면 인류에 맞서 자신을 지킬 것이다.', 0, '생물권 = 초유기체'],
      ['인구 변천에 걸맞게 소비도 줄어드는 소비 변천이 일어날 수 있다.', 1, '낙관론(7문단)'],
      ['우리는 세계적 교통사고 현장의 한가운데에 있는 셈이다.', 0, '비관론의 귀결'],
      ['각국 정부도 국제 협력이 필요하다는 것을 잘 안다.', 1, '낙관론(8문단)'],
      ['인류는 대기의 화학, 물 순환, 침식과 퇴적 같은 근본적 과정을 바꾸기 시작했다.', 2, '인류세 구분 기준'],
      ['성장 자체가 지속 불가능하다는 의미로 들린다.', 0, '비관론']
    ]),
    draw(k, S, u, s) { const t = S.t, g = k.g;
      if (S.k === 0) { k.rr(30, 190, 600, 40, 8, '#e9e2d2', C.ink, 2); const segs = [['… 플라이스토세', 30, 380, '#d7d0bf'], ['홀로세', 380, 560, '#c9e3c0'], ['인류세?', 560, 630, '#f6c3b5']]; segs.forEach(([n, a, b, c], i) => { const p = i < 2 ? 1 : ease(seg(u, .3, .6)); k.rr(a, 190, (b - a) * p, 40, 8, c); k.txt(n, (a + b) / 2, 210, { size: 15, bold: true, alpha: p }); });
        k.txt('기원전 9677년', 380, 260, { size: 13, bold: true }); k.arrow(380, 250, 380, 232, { w: 2, head: 7 }); k.tag('1800년대 산업 혁명', 520, 120, C.org, { size: 13, alpha: seg(u, .55, .7) }); k.tag('1950년경', 600, 160, C.red, { size: 13, alpha: seg(u, .65, .8) }); k.txt('파울 크뤼천: "1800년 이래 우리는 인류세에 들어섰다"', 330, 330, { size: 16, bold: true, color: C.navy, alpha: seg(u, .7, .9) }); }
      if (S.k === 1) { k.circ(330, 220, 120, '#cfe8ff', C.blue, 3); g.save(); g.beginPath(); g.arc(330, 220, 120, 0, 7); g.clip(); k.circ(290, 260, 70, '#a9d48f'); k.circ(400, 170, 50, '#a9d48f'); g.restore();
        const I = [['🌫 대기의 화학', 120, 80], ['🦋 동식물종', 540, 80], ['💧 물 순환', 120, 360], ['⛰ 침식·퇴적', 540, 360]]; I.forEach(([n, x, y], i) => { const p = seg(u, .1 + i * .18, .25 + i * .18); k.box(x - 80, y - 25, 160, 50, n, { fill: p > .9 ? '#ffe3dc' : '#fff', stroke: p > .9 ? C.red : '#ccc', size: 15, alpha: .3 + .7 * p }); k.arrow(330 + (x - 330) * .45, 220 + (y - 220) * .45, x + (330 - x) * .25, y + (220 - y) * .3, { p, color: C.red, w: 2.5 }); });
        k.person(330, 205, 1, { t, face: 'o', label: '' }); k.txt('뭘 하는지도 모른 채…', 330, 290, { size: 14, bold: true, color: C.gray }); }
      if (S.k === 2) { const p = ease(seg(u, .1, .6)), cx = 220, cy = 220, R = 130; k.circ(cx, cy, R, '#e7f3df', C.ink, 2); const a1 = .25 * p, a2 = .40 * p; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + a2 * Math.PI * 2); g.closePath(); g.fillStyle = '#f6c3b5'; g.fill(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + a1 * Math.PI * 2); g.closePath(); g.fillStyle = C.red; g.fill();
        k.txt('광합성 에너지', cx, cy + R + 22, { size: 15, bold: true }); k.txt(`${Math.round(25 * p)}~${Math.round(40 * p)}%`, 480, 150, { size: 34, bold: true, color: C.red }); k.txt('= 1/4 ~ 1/2', 480, 200, { size: 26, bold: true, color: C.red, alpha: seg(u, .6, .75) }); k.txt('"한 종의 변덕"에 따라 분배', 480, 260, { size: 18, bold: true, color: C.navy, alpha: seg(u, .75, .9) }); }
      if (S.k === 3) { const L = ['제2차 세계 대전', '공산주의의 수립', '대중 문해력 성장', '민주주의의 확산', '여성 해방 확대']; const top = ease(seg(u, .3, .8));
        L.forEach((l, i) => k.box(170, 70 + (i + top) * 55, 320, 44, l, { fill: '#fff', size: 15 })); k.box(170, lerp(70 + 5 * 55, 70, top) - (top > .99 ? 0 : 0), 320, 44, '통제하지 않은 대규모 실험 (환경)', { fill: '#ffe3dc', stroke: C.red, size: 15, lw: 3 }); k.tag('20세기 가장 중요한 측면', 330, 410, C.red, { size: 15, alpha: seg(u, .8, .95) }); k.txt('— 존 맥닐', 560, 90, { size: 15, bold: true, color: C.gray }); }
      if (S.k === 4) { const sh = Math.sin(t * 6) * 4 * seg(u, .2, .4); k.circ(200 + sh, 210, 100, '#cfe8ff', C.blue, 3); k.txt('😠', 200 + sh, 200, { size: 60 }); k.txt('생물권 = 초유기체', 200, 335, { size: 16, bold: true, color: C.blue }); k.arrow(300, 210, 390, 210, { p: seg(u, .3, .5), color: C.red, w: 5, label: '맞섬!' }); k.person(430, 220, 1, { t, face: 'sad', label: '인류' });
        k.txt('💥 세계적 교통사고', 520, 90, { size: 18, bold: true, color: C.red, alpha: seg(u, .5, .65) }); k.box(330, 330, 300, 80, '성장 억제? (중국·인도)\n탈산업화? (선진 산업국)', { fill: C.cream, stroke: C.org, size: 14, alpha: seg(u, .7, .85) }); }
      if (S.k === 5) { const N = 7; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, x = 200 + Math.cos(a) * 110, y = 220 + Math.sin(a) * 110; for (let j = i + 1; j < N; j++) { const b = j / N * Math.PI * 2; if ((i + j) % 2) k.line([x, y, 200 + Math.cos(b) * 110, 220 + Math.sin(b) * 110], `rgba(36,87,214,${.15 + .5 * seg(u, .1, .4)})`, 2); } k.person(x, y - 10, .6, { t: t + i, label: '' }); }
        k.txt('💡', 200, 215, { size: 44, alpha: seg(u, .3, .45) }); k.txt('집단 학습', 200, 365, { size: 17, bold: true, color: C.blue });
        ['🧬 유전 공학 세균', '♻ 쓰레기 → 에너지', '🌬 CO₂ 흡수', '☀ 핵융합로', '🔬 나노 기계', '🤝 국제 협력', '📉 소비 변천'].forEach((l, i) => k.txt(l, 480, 70 + i * 46, { size: 16, bold: true, alpha: seg(u, .35 + i * .08, .45 + i * .08) })); }
      if (S.k === 6) { const tilt = Math.sin(t * 1.4) * .08; g.save(); g.translate(330, 260); g.rotate(tilt); k.line([-230, 0, 230, 0], C.ink, 6); k.box(-300, -80, 170, 70, '부정적\n회복 불가능한 변화', { fill: '#dff0d0', stroke: C.green, size: 14 }); k.box(130, -80, 170, 70, '긍정적\n집단 학습으로 해결', { fill: '#f6d9cc', stroke: C.red, size: 14 }); g.restore();
        g.beginPath(); g.moveTo(330, 262); g.lineTo(280, 350); g.lineTo(380, 350); g.closePath(); g.fillStyle = '#cfe0f5'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke(); k.txt('인류세', 330, 330, { size: 17, bold: true }); }
      if (S.k === 7) cardDraw(k, S, ['비관적 관점', '낙관적 관점', '인류세 설명']);
    }
  });
})();
