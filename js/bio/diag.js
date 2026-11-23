'use strict';
/* 개념 카드·문제용 그림: 에너지 그래프(활성화 에너지, 반응열) */
(() => {
  /* o: { r: 반응물, p: 생성물, a: 효소 없을 때 꼭대기, b: 효소 있을 때 꼭대기(없으면 생략), num: 눈금 숫자 표시, marks: ['ea','eb','dh'] } */
  function energy(o) {
    const W = 360, H = 220, L = 46, B = 190, T = 18, max = o.max || 110, y = v => B - (v / max) * (B - T);
    const xs = [L + 10, L + 70, L + 150, L + 230, W - 20];
    const curve = top => `M${L + 6},${y(o.r)} L${xs[1]},${y(o.r)} C${xs[1] + 40},${y(o.r)} ${xs[2] - 30},${y(top)} ${xs[2]},${y(top)} C${xs[2] + 30},${y(top)} ${xs[3] - 40},${y(o.p)} ${xs[3]},${y(o.p)} L${W - 14},${y(o.p)}`;
    const arrow = (x, v1, v2, col, txt, left) => `<line x1="${x}" y1="${y(v1)}" x2="${x}" y2="${y(v2)}" stroke="${col}" stroke-width="2.2" marker-start="url(#ah)" marker-end="url(#ah)"/><text x="${left ? x - 20 : x + 6}" y="${(y(v1) + y(v2)) / 2 + 4}" fill="${col}" font-size="13" font-weight="800">${txt}</text>`;
    const dash = v => `<line x1="${L}" y1="${y(v)}" x2="${W - 10}" y2="${y(v)}" stroke="#ffffff33" stroke-dasharray="4 4"/>`;
    const tick = v => o.num ? `<text x="${L - 6}" y="${y(v) + 4}" fill="#cfe" font-size="11" text-anchor="end">${v}</text>` : '';
    const m = o.marks || ['ea', 'eb', 'dh'];
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:420px;display:block;margin:6px auto" font-family="Noto Sans KR,sans-serif">
<defs><marker id="ah" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="context-stroke"/></marker></defs>
<line x1="${L}" y1="${T - 6}" x2="${L}" y2="${B}" stroke="#9fe" stroke-width="1.5"/><line x1="${L}" y1="${B}" x2="${W - 8}" y2="${B}" stroke="#9fe" stroke-width="1.5"/>
<text x="10" y="${T + 4}" fill="#9fe" font-size="11">에너지</text><text x="${W - 70}" y="${B + 16}" fill="#9fe" font-size="11">반응의 진행</text>
${dash(o.r)}${dash(o.p)}${dash(o.a)}${o.b != null ? dash(o.b) : ''}${tick(o.r)}${tick(o.p)}${tick(o.a)}${o.b != null ? tick(o.b) : ''}
<path d="${curve(o.a)}" fill="none" stroke="#ff6a7a" stroke-width="3"/>${o.b != null ? `<path d="${curve(o.b)}" fill="none" stroke="#5ab8ff" stroke-width="3" stroke-dasharray="7 4"/>` : ''}
<text x="${L + 8}" y="${y(o.r) - 6}" fill="#fff" font-size="12" font-weight="700">반응물</text><text x="${xs[3] + 4}" y="${y(o.p) - 6}" fill="#fff" font-size="12" font-weight="700">생성물</text>`;
    if (m.includes('ea')) s += arrow(xs[2] + 9, o.r, o.a, '#ff6a7a', '㉠');
    if (o.b != null && m.includes('eb')) s += arrow(xs[2] - 9, o.r, o.b, '#5ab8ff', '㉡', true);
    if (m.includes('dh')) s += arrow(W - 30, o.r, o.p, '#ffd23f', '㉢');
    s += `<text x="${L + 6}" y="${H - 2}" fill="#ff6a7a" font-size="11">— 효소 없음</text>${o.b != null ? `<text x="${L + 92}" y="${H - 2}" fill="#5ab8ff" font-size="11">- - 효소 있음</text>` : ''}</svg>`;
    return s;
  }
  window.energySVG = energy;
  window.BDIAG = {
    ea: energy({ r: 40, p: 10, a: 100, marks: ['ea'] }) + '<p class="cap">㉠ = 꼭대기 − 반응물 = <b>활성화 에너지</b>. 반응물이 이만큼 에너지를 받아야 반응이 시작된다.</p>',
    eaE: energy({ r: 40, p: 10, a: 100, b: 70, marks: ['ea', 'eb'] }) + '<p class="cap">효소가 있으면 꼭대기가 낮아진다: ㉡(효소 있음) &lt; ㉠(효소 없음). 반응물·생성물 높이는 그대로.</p>',
    dh: energy({ r: 40, p: 10, a: 100, marks: ['dh'] }) + '<p class="cap">㉢ = 반응물 − 생성물 = <b>반응열</b>. 꼭대기와는 상관없다.</p>',
    exo: energy({ r: 70, p: 20, a: 100, b: 85, marks: ['dh'] }) + '<p class="cap"><b>발열 반응</b>: 생성물이 더 낮다 → 차이만큼 에너지 <b>방출</b>. 큰 분자 → 작은 분자(<b>이화 작용</b>, 예: 세포호흡).</p>',
    endo: energy({ r: 20, p: 60, a: 95, b: 75, marks: ['dh'] }) + '<p class="cap"><b>흡열 반응</b>: 생성물이 더 높다 → 차이만큼 에너지 <b>흡수</b>. 작은 분자 → 큰 분자(<b>동화 작용</b>, 예: 광합성).</p>',
    calc: energy({ r: 40, p: 10, a: 100, b: 70, num: true }) + '<p class="cap">숫자로 구하기 (단위 kJ): ㉠ = 100 − 40 = <b>60</b>, ㉡ = 70 − 40 = <b>30</b>, ㉢ = 40 − 10 = <b>30 방출</b>. 효소가 낮춘 양 = 100 − 70 = 30.</p>'
  };
})();
/* ── 기초 개념 그림 (HTML 도식) ── */
(() => {
  const D = window.BDIAG;
  const ball = (n, cls = 'c') => `<span class="bl">${'<i class="' + cls + '"></i>'.repeat(n)}</span>`;
  const box = (t, s, c = '') => `<span class="bx ${c}"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span>`;
  const ar = (t = '') => `<span class="ar">${t ? `<small>${t}</small>` : ''}→</span>`;
  const row = (...x) => `<div class="dr">${x.join('')}</div>`;
  const cap = t => `<p class="cap">${t}</p>`;
  Object.assign(D, {
    meta: row(box('작은 분자', '아미노산, 포도당'), ar('동화 작용<br>에너지 흡수'), box('큰 분자', '단백질, 녹말')) + row(box('큰 분자', '포도당'), ar('이화 작용<br>에너지 방출'), box('작은 분자', 'CO₂, H₂O')) + cap('<b>물질대사</b> = 생명체 안에서 일어나는 모든 화학 반응. 합성하면 <b>동화</b>(흡열), 분해하면 <b>이화</b>(발열). 모든 물질대사에 <b>효소</b>가 필요하다.'),
    atp: row(box('아데노신', '아데닌 + 리보스', 'g'), '<span class="pp"><i>P</i>~<i>P</i>~<i>P</i></span>') + row(box('ATP', '인산 3개', 'y'), ar('에너지 방출'), box('ADP + Pᵢ', '인산 2개 + 인산 1개')) + cap('ATP = 아데노신 + 인산 3개. 인산끼리의 결합(~)에 에너지가 많다. 끝의 인산이 떨어지면 <b>ADP + Pᵢ + 에너지</b> → 근육 수축, 물질 합성 등에 사용. 세포호흡은 이 ADP + Pᵢ를 다시 <b>ATP로 충전</b>하는 과정.'),
    redox: `<table class="dt"><tr><th></th><th>산화</th><th>환원</th></tr><tr><th>산소</th><td>얻음</td><td>잃음</td></tr><tr><th>수소</th><td>잃음</td><td>얻음</td></tr><tr><th>전자</th><td>잃음</td><td>얻음</td></tr></table>` + cap('수소 원자 H = <b>전자(e⁻) + 수소 이온(H⁺)</b>. 그래서 수소를 잃는 것 = 전자를 잃는 것 = 산화. 세포호흡에서 <b>포도당은 산화</b>되어 CO₂가 되고, <b>O₂는 환원</b>되어 H₂O가 된다.'),
    nad: row(box('NAD⁺', '빈 택배 차', 'b'), ar('2H (e⁻ 2개 + H⁺ 2개)'), box('NADH + H⁺', '전자 실은 택배 차', 'b')) + row(box('FAD', '빈 차', 'gr'), ar('2H'), box('FADH₂', '전자 실은 차', 'gr')) + cap('탈수소 효소가 유기물에서 수소(전자)를 떼면 <b>NAD⁺, FAD가 받아서</b> 전자전달계로 배달한다. 배달 후 다시 NAD⁺, FAD로 돌아와 재사용. 광합성에서는 <b>NADP⁺ → NADPH</b>.'),
    resp: row(box('해당 과정', '세포질', 'y'), ar(), box('피루브산 산화', '기질'), ar(), box('TCA 회로', '기질'), ar(), box('산화적 인산화', '내막', 'r')) + cap('C₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 최대 32ATP. 앞의 세 단계는 포도당을 쪼개 <b>CO₂</b>를 내놓고 전자를 <b>NADH·FADH₂</b>에 싣는다. 마지막 단계가 그 전자로 ATP를 대량 생산한다.'),
    glyC: row(box('포도당', ball(6)), ar('2ATP 투자'), box('과당 2인산', ball(6)), ar('쪼개기'), box('PGAL × 2', ball(3) + ball(3))) + row(box('PGAL × 2', ''), ar('2NADH, 4ATP'), box('피루브산 × 2', ball(3) + ball(3), 'y')) + cap('공 1개 = 탄소 1개. 탄소 6개가 3개짜리 2개로 나뉜다. ATP: <b>+4 − 2 = 순 2</b>. 산소는 한 번도 쓰이지 않는다.'),
    pyrC: row(box('피루브산', ball(3)), ar('CoA 결합<br>NAD⁺ → NADH'), box('아세틸 CoA', ball(2) + ' + CoA'), ar(), box('CO₂', ball(1, 'o'), 'gr')) + cap('탄소 3개 중 1개가 CO₂로 빠진다(<b>탈탄산</b>). 수소는 NAD⁺가 받아 NADH. <b>ATP는 0개</b>. 포도당 1개면 이걸 2번 → CO₂ 2, NADH 2.'),
    tcaC: row(box('아세틸 CoA', ball(2)), '<span class="pl">+</span>', box('옥살아세트산', ball(4)), ar(), box('시트르산', ball(6), 'y')) + row(box('시트르산', ball(6)), ar('CO₂, NADH'), box('5탄소', ball(5)), ar('CO₂, NADH, ATP'), box('4탄소', ball(4))) + row(box('4탄소', ball(4)), ar('FADH₂'), box('4탄소', ball(4)), ar('NADH'), box('옥살아세트산', ball(4), 'y')) + cap('탄소 수가 <b>줄어드는 곳 = CO₂가 빠지는 곳</b>(6→5, 5→4). 1바퀴: CO₂ 2, NADH 3, FADH₂ 1, ATP 1. 포도당 1개 = 2바퀴.'),
    mem: `<div class="mm"><div class="z top"><b>막사이공간</b><span>H⁺ H⁺ H⁺ H⁺ H⁺ H⁺</span><small>H⁺ 많음, pH 낮음</small></div><div class="z mid"><span class="pump">Ⅰ ↑H⁺</span><span class="pump">Ⅲ ↑H⁺</span><span class="pump">Ⅳ ↑H⁺</span><span class="syn">ATP 합성효소 ↓H⁺</span><small>내막</small></div><div class="z bot"><b>기질</b><span>NADH → NAD⁺ + e⁻ · ½O₂ + 2H⁺ + 2e⁻ → H₂O · ADP + Pᵢ → ATP</span><small>H⁺ 적음</small></div></div>` + cap('① NADH가 전자를 준다 → ② 전자가 복합체를 지나며 에너지로 <b>H⁺를 위로(막사이공간) 퍼 올림</b> → ③ 전자는 마지막에 O₂가 받아 물 → ④ 쌓인 H⁺가 <b>ATP 합성효소로만 내려오며</b> ATP 생성 = 화학삼투.'),
    count: `<table class="dt"><tr><th>단계</th><th>NADH</th><th>FADH₂</th><th>ATP(직접)</th><th>CO₂</th></tr><tr><th>해당 과정</th><td>2</td><td>0</td><td>2</td><td>0</td></tr><tr><th>피루브산 산화</th><td>2</td><td>0</td><td>0</td><td>2</td></tr><tr><th>TCA 회로</th><td>6</td><td>2</td><td>2</td><td>4</td></tr><tr><th>합계</th><td><b>10</b></td><td><b>2</b></td><td><b>4</b></td><td><b>6</b></td></tr></table>` + cap('산화적 인산화: NADH 10 × 2.5 = 25, FADH₂ 2 × 1.5 = 3 → <b>28</b>. 전체 = 직접 4 + 28 = <b>최대 32ATP</b>.'),
    ferm: row(box('포도당', ball(6)), ar('해당 과정<br>2ATP'), box('피루브산 × 2', ball(3) + ball(3)), ar('NADH → NAD⁺'), box('젖산 × 2', ball(3) + ball(3), 'r')) + row(box('피루브산', ball(3)), ar('CO₂ 빠짐'), box('아세트알데하이드', ball(2)), ar('NADH → NAD⁺'), box('에탄올', ball(2), 'y')) + cap('산소가 없으면 NADH가 전자를 버릴 곳이 없다 → 피루브산(또는 아세트알데하이드)에게 넘겨 <b>NAD⁺를 되찾는다</b>. 그래야 해당 과정이 계속 돌아 2ATP라도 얻는다.'),
    spec: `<div class="sp"><span style="--c:#7a5cff;--h:90%">청자</span><span style="--c:#3fa0ff;--h:55%">청</span><span style="--c:#3fdc5a;--h:8%">녹</span><span style="--c:#ffd23f;--h:12%">황</span><span style="--c:#ff9a3c;--h:30%">주황</span><span style="--c:#ff4a4a;--h:80%">적</span></div>` + cap('막대 높이 = 엽록소의 빛 흡수량. <b>청자색·적색</b>을 많이 흡수하고 <b>녹색</b>은 거의 흡수하지 않고 반사 → 잎이 녹색. 이 모양(흡수 스펙트럼)과 파장별 광합성 속도(작용 스펙트럼)가 거의 같다.'),
    z: row(box('H₂O', '전자 공여체', 'b'), ar('광분해<br>O₂ 발생'), box('광계 Ⅱ', 'P680 · 빛', 'g'), ar('전자'), box('전자전달계', 'H⁺ → 내부'), ar(), box('광계 Ⅰ', 'P700 · 빛', 'g'), ar(), box('NADP⁺ → NADPH', '최종 수용체', 'b')) + cap('<b>비순환적 전자흐름</b>: 물 → 광계 Ⅱ → 전자전달계 → 광계 Ⅰ → NADP⁺. 생성: O₂, NADPH, ATP(H⁺가 ATP 합성효소로 나올 때). <b>순환적</b>: 광계 Ⅰ의 전자가 전자전달계를 돌아 다시 광계 Ⅰ로 → ATP만.'),
    chl: `<div class="mm"><div class="z top"><b>스트로마</b><span>캘빈 회로 · ADP + Pᵢ → ATP · NADP⁺ → NADPH</span><small>H⁺ 적음</small></div><div class="z mid"><span class="pump">광계 Ⅱ</span><span class="pump">전자전달계 ↓H⁺</span><span class="pump">광계 Ⅰ</span><span class="syn">ATP 합성효소 ↑H⁺</span><small>타이라코이드 막</small></div><div class="z bot"><b>타이라코이드 내부</b><span>H₂O → ½O₂ + 2H⁺ + 2e⁻ · H⁺ H⁺ H⁺ H⁺</span><small>H⁺ 많음, pH 낮음</small></div></div>` + cap('마이토콘드리아와 같은 원리, 방향만 다르다: H⁺가 <b>스트로마 → 타이라코이드 내부</b>로 쌓이고, ATP 합성효소를 통해 스트로마로 나오며 ATP 생성(<b>광인산화</b>).'),
    calvin: row(box('3CO₂', ball(1, 'o') + ball(1, 'o') + ball(1, 'o')), '<span class="pl">+</span>', box('3 RuBP', 'C₅ × 3'), ar('① 탄소 고정<br>루비스코'), box('6 3PG', 'C₃ × 6', 'y')) + row(box('6 3PG', ''), ar('② 환원<br>6ATP, 6NADPH'), box('6 PGAL', 'C₃ × 6'), ar('1개 →'), box('포도당 쪽', 'PGAL 2개 = 포도당 1', 'r')) + row(box('5 PGAL', 'C₃ × 5 = 탄소 15'), ar('③ 재생<br>3ATP'), box('3 RuBP', 'C₅ × 3 = 탄소 15', 'g')) + cap('한 바퀴(CO₂ 3개): ATP 9, NADPH 6 사용, PGAL 1개 얻음. 포도당 1개 = 2바퀴 = CO₂ 6, <b>ATP 18, NADPH 12</b>. 탄소 개수도 맞아떨어진다: 5 × 3 = 15 = 3 × 5.')
  });
})();
