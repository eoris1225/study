'use strict';
/* 4장 — 단진동 */
(() => {
  function shmDraw(x, v, t, W, H) {
    x.clearRect(0, 0, W, H); const w = v.w * Math.PI, A = v.A * 16, th = w * t * .25, cx = 110, cy = H / 2;
    x.strokeStyle = '#3b3150'; x.beginPath(); x.arc(cx, cy, A, 0, 7); x.stroke();
    const px = cx + A * Math.cos(th), py = cy - A * Math.sin(th); x.strokeStyle = '#e2552b'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke();
    x.fillStyle = '#ffd166'; x.beginPath(); x.arc(px, py, 6, 0, 7); x.fill();
    x.strokeStyle = '#6d6480'; x.beginPath(); x.moveTo(240, 10); x.lineTo(240, H - 10); x.stroke(); x.fillStyle = '#ffd166'; x.beginPath(); x.arc(240, py, 7, 0, 7); x.fill();
    x.strokeStyle = '#e2552b'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < 340; i++) { const y = cy - A * Math.sin(th - i * .03 * v.w); i ? x.lineTo(280 + i, y) : x.moveTo(280, y); } x.stroke(); x.lineWidth = 1;
    txt(x, '원운동의 그림자 = 단진동 (화면은 1/4배속)', 280, 16, '#8a8198', '12px serif'); txt(x, 'θ = ωt', cx - 18, cy + 16, '#8a8198', '12px serif');
  }
  function springDraw(x, v, t, W, H) {
    x.clearRect(0, 0, W, H); const T = 2 * Math.PI * Math.sqrt(v.m / v.k), y0 = 110, amp = v.A * 2.2, y = y0 + amp * Math.sin(2 * Math.PI * t / T);
    x.fillStyle = '#8a8198'; x.fillRect(260, 6, 120, 8); x.strokeStyle = '#b9b0c6'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(320, 14); for (let i = 1; i <= 18; i++) x.lineTo(320 + (i % 2 ? -12 : 12), 14 + (y - 14 - 14) * i / 18); x.stroke();
    x.fillStyle = '#d9b25f'; const r = 10 + v.m * 4; x.beginPath(); x.arc(320, y, r, 0, 7); x.fill();
    x.setLineDash([3, 4]); x.strokeStyle = '#6d6480'; x.beginPath(); x.moveTo(250, y0); x.lineTo(390, y0); x.stroke(); x.setLineDash([]); txt(x, '평형점 O', 396, y0 + 4, '#8a8198', '12px serif');
    txt(x, `주기 T = 2π√(m/k) = ${fmt(T, 3)} s`, 20, 30, '#ffd166', '15px serif'); txt(x, `당긴 거리(진폭) ${v.A} cm — 주기와 무관!`, 20, 54, '#8a8198', '13px serif');
  }
  G.chapters.push({
    title: '4장 · 끊어진 현의 골짜기 — 단진동', trait: 'wave', glow: '#123a36',
    notes: `
<h3>1. 용수철 진자</h3>
<ul><li><b>용수철의 탄성력</b>: 용수철 상수가 k인 용수철이 x만큼 길이가 변했을 때의 탄성력은 <b>F = −kx</b> (평형점 O 기준, 늘어나면 −F, 압축되면 +F — 항상 평형점을 향함)</li>
<li><b>용수철에 매달린 물체</b>: 공기 저항과 마찰을 무시할 때, 물체를 당겼다가 놓으면 용수철이 늘어났다 압축되는 상태가 반복되며 물체는 주기적으로 왕복 운동을 한다 ➡ 이러한 운동을 <b>단진동</b>이라 한다.</li>
<li><b>[물리사전] 진자</b>: 고정된 축이나 지점의 주위를 일정한 주기로 진동하는 물체</li><li><b>[물리사전] 복원력</b>: 평형점에서 벗어났을 때, 평형 상태로 되돌아가려는 힘</li></ul>
<h4>연직 용수철 진자</h4>
(1) 중력과 탄성력이 평형(<b>kx₀ = mg</b>)을 이루는 위치가 평형점이다.<br>(2) 평형점으로부터 x만큼 추가로 늘어났을 때 물체에 작용하는 합력 <div class="fm">F = −k(x₀ + x) + mg = −kx</div> 가 복원력이 된다.
<h3>2. 단진동</h3>
<h4>단진동과 등속 원운동</h4> 원운동하는 물체를 옆에서 보면 일직선상에서 같은 운동을 반복하는 것처럼 보인다. 따라서 단진동은 등속 원운동과 같은 방법으로 위치, 속력, 가속도를 구할 수 있다. (θ = ωt : 위상, A : 진폭, T : 주기. x–t 그래프는 0 → A(T/4) → 0(T/2) → −A(3T/4) → 0(T))
<h4>단진동하는 물체에 작용하는 힘</h4>
<ul><li>(1) <b>변위</b>: 각속도 ω로 등속 원운동하는 물체의 원운동 반지름이 A이면 변위는 A의 x방향 성분 <div class="fm">x = A sin θ = A sin ωt</div></li>
<li>(2) <b>속력</b>: 반지름 A로 원운동하는 물체의 속력은 Aω이므로 속도는 Aω의 x방향 성분 <div class="fm">v = Aω cos ωt</div></li>
<li>(3) <b>가속도</b>: 등속 원운동하는 물체의 가속도 크기는 Aω²이므로 가속도는 Aω²의 x방향 성분 <div class="fm">a = −Aω² sin ωt</div></li>
<li>(4) <b>변위와 가속도의 관계</b>: 가속도는 변위의 크기에 비례하며, 가속도의 방향은 진동의 중심을 향한다. <div class="fm">a = −ω²x</div></li>
<li>(5) <b>작용하는 힘</b>: 힘의 크기는 변위에 비례하며, 힘의 방향은 진동의 중심을 향한다. <div class="fm">F = ma = −mω²x</div></li></ul>
<p class="tip">정리: 평형점(x=0)에서 속력 최대(Aω)·가속도 0·복원력 0. 양 끝(x=±A)에서 속력 0·가속도 최대(Aω²)·복원력 최대.</p>
<h3>3. 용수철 진자의 주기</h3>
(1) F = −kx = −mω²x 로부터 mω² = k 에서 ω = √(k/m) 이므로 <div class="fm">T = 2π/ω = 2π√(m/k)</div>
(2) 용수철 진자의 주기는 물체의 질량이 클수록, 용수철 상수가 작을수록 길어진다.
<div class="ex"><b>예제 01</b> 마찰이 없는 수평면에서 원래 길이 80 cm인 용수철에 1 kg의 물체를 연결해 10 N의 힘으로 서서히 당겼더니 길이가 120 cm일 때 정지.<br>(1) k × 40 cm = 10 N → <b>k = 25 N/m</b> (0.4 m로 환산!) (2) T = 2π√(1 kg / 25 N/m) = <b>(2/5)π 초</b></div>
<div class="ex"><b>예제 02</b> 질량 2 kg인 물체가 변위 x = 3 sin 4πt (m)인 단진동.<br>(1) 진폭 3 m, 주기 2π/4π = 1/2 s, 진동수 2 Hz (2) 최대 속력 = 진폭×각속도 = 12π m/s (3) 최대 가속도 = 진폭×각속도² = 48π² m/s² (4) 복원력의 최댓값 = 질량×최대 가속도 = 96π² N</div>
<h4>교과서 탐구 NOTE — 용수철 진자의 운동 관찰하기</h4>
과정: ① 추를 용수철에 매달아 용수철 진자를 만든다. ② 추를 잡아당겼다가 놓은 후 운동을 관찰한다. ③ 잡아당기는 거리를 변화시키며 추가 10회 왕복하는 데 걸린 시간을 측정한다.
<table><tr><th>잡아당기는 거리(cm)</th><th>10회 왕복 시간(초)</th><th>주기(초)</th></tr><tr><td>5</td><td>8.2</td><td>0.82</td></tr><tr><td>10</td><td>8.1</td><td>0.81</td></tr><tr><td>15</td><td>8.0</td><td>0.80</td></tr><tr><td>20</td><td>8.1</td><td>0.81</td></tr></table>
➡ 용수철 진자의 주기는 추를 당긴 거리와는 관계가 없다.`,
    steps: [
      N('<b>끊어진 현의 골짜기</b>. 세계를 지탱하던 ‘대지의 현’이 끊겨, 모든 것이 제멋대로 떨린다.', '🏞️'),
      N('절벽 끝에서 누군가 용수철 달린 활로 허공의 떨림을 재고 있다.'),
      say({ n: '음유시인', i: '🎻' }, '쉿— 지금 박자를 세는 중이에요. 하나, 둘… 아, 놓쳤다. 이 용수철, 상수가 얼마였더라?'),
      say('me', '용수철의 탄성력은 변형된 길이에 비례하고, 항상 평형점을 향한다. F = −kx.'),
      game('tuner', '용수철 활 조율 — F = −kx, kx₀ = mg', {
        brief: '용수철 상수 k, 변형 길이 x, 매단 질량 m을 조절하라. 1라운드는 수평 용수철(예제 01), 2라운드는 연직 용수철의 평형점이다.', formula: 'F = −kx &nbsp;·&nbsp; 연직: kx₀ = mg, 합력 F = −k(x₀+x) + mg = −kx', lesson: '탄성력 F = −kx. 연직 용수철: 중력과 탄성력이 평형인 위치(kx₀ = mg)가 평형점, 거기서 x만큼 더 늘어나면 합력 = −kx (복원력).',
        cfg: { formula: 'F = −kx · kx₀ = mg (g = 10 m/s²)',
          vars: [{ id: 'k', label: '용수철 상수 k', min: 5, max: 100, step: 5, init: 100, unit: 'N/m' }, { id: 'x', label: '늘어난 길이 x', min: 0, max: 1, step: .05, init: 0, unit: 'm' }, { id: 'm', label: '질량 m', min: .5, max: 5, step: .5, init: .5, unit: 'kg' }],
          outs: [{ label: '탄성력 크기 kx', f: v => v.k * v.x, unit: 'N' }, { label: '중력 mg', f: v => v.m * 10, unit: 'N' }, { label: '평형 늘어남 x₀ = mg/k', f: v => v.m * 10 / v.k, unit: 'm', d: 3 }],
          rounds: [{ text: '원래 80 cm → 120 cm로 늘어났을 때 탄성력 크기가 10 N (k = ?)', goals: [{ label: 'x', f: v => v.x, target: .4, tol: .001, unit: 'm' }, { label: 'kx', f: v => v.k * v.x, target: 10, tol: .01, unit: 'N' }] },
          { text: '연직으로 세웠다. k = 25 N/m 그대로, 평형점이 x₀ = 0.8 m가 되는 질량은?', goals: [{ label: 'k', f: v => v.k, target: 25, tol: 0, d: 0 }, { label: 'x₀', f: v => v.m * 10 / v.k, target: .8, tol: .001, unit: 'm' }] }] },
        win: 'k = 25 N/m. 음유시인의 활이 제 음을 되찾았다.'
      }),
      say({ n: '레조나', i: '🎻' }, '와, 고마워요! 전 <b>레조나</b>. 끊어진 대지의 현을 다시 잇고 싶은 음유시인이에요. 떨림엔 비밀이 있어요 — <b>단진동은 원운동의 그림자</b>랍니다.'),
      { t: 'recruit', id: 'resona' },
      say('resona', '반지름 A, 각속도 ω로 도는 점을 옆에서 보면: 위치는 A sin ωt, 속도는 Aω cos ωt, 가속도는 −Aω² sin ωt. 원운동의 A, Aω, Aω²을 각각 x방향으로 비춘 거예요.'),
      game('tuner', '원운동의 그림자 — x, v, a의 최댓값', {
        brief: '진폭 A와 각속도 ω(π의 배수)를 조절해 예제 02의 진동 x = 3 sin 4πt 를 재현하고, 최대 속력과 최대 가속도를 읽어라. (질량 2 kg)', formula: 'x = A sin ωt · v = Aω cos ωt · a = −Aω² sin ωt · T = 2π/ω · f = 1/T', lesson: 'x = 3 sin 4πt: A = 3 m, ω = 4π, T = 2π/ω = 0.5 s, f = 2 Hz, v_max = Aω = 12π, a_max = Aω² = 48π², F_max = m·a_max = 96π²',
        cfg: { formula: 'v<sub>max</sub> = Aω · a<sub>max</sub> = Aω² · F<sub>max</sub> = mAω²', h: 220, draw: shmDraw,
          vars: [{ id: 'A', label: '진폭 A', min: 1, max: 5, step: .5, init: 1, unit: 'm' }, { id: 'w', label: '각속도 ω', min: 1, max: 8, step: 1, init: 1, unit: 'π rad/s' }],
          outs: [{ label: 'T', f: v => 2 / v.w, unit: 's' }, { label: 'f', f: v => v.w / 2, unit: 'Hz' }, { label: 'v_max', f: v => v.A * v.w, unit: 'π m/s' }, { label: 'a_max', f: v => v.A * v.w * v.w, unit: 'π² m/s²' }, { label: 'F_max(2kg)', f: v => 2 * v.A * v.w * v.w, unit: 'π² N' }],
          rounds: [{ text: '주기 0.5 s, 진폭 3 m (x = 3 sin 4πt)', goals: [{ label: 'T', f: v => 2 / v.w, target: .5, tol: .001, unit: 's' }, { label: 'A', f: v => v.A, target: 3, tol: 0, unit: 'm' }] },
          { text: '진폭은 그대로, 최대 가속도를 12π² m/s²로 낮춰라 (ω = ?)', goals: [{ label: 'A', f: v => v.A, target: 3, tol: 0 }, { label: 'a_max', f: v => v.A * v.w * v.w, target: 12, tol: .01, unit: 'π²' }] }] },
        win: 'a_max = Aω². ω를 절반으로 줄이면 최대 가속도는 1/4.'
      }),
      game('forge', '예제 02 — x = 3 sin 4πt', {
        brief: '질량 2 kg인 물체가 변위 x = 3 sin 4πt (m)인 단진동을 하고 있다. (답은 π, π²의 계수로 입력)', formula: 'x = A sin ωt · v_max = Aω · a_max = Aω² · F_max = m·a_max', lesson: '예제 02: A = 3 m, T = 1/2 s, f = 2 Hz, v_max = 12π m/s, a_max = 48π² m/s², F_max = 96π² N',
        cfg: { steps: [
          { problem: '(1) 주기는 몇 초인가?', expr: ['T = ', { b: '2π' }, ' / ', { b: '4π' }], tiles: ['2π', '4π', '3', 'π'], answer: .5, ansLabel: 'T', unit: 's (진폭 3 m, 진동수 2 Hz)' },
          { problem: '(2) 최대 속력은? (진폭과 각속도의 곱)', expr: ['v_max = ', { b: '3' }, ' × ', { b: '4π' }], tiles: ['3', '4π', '2', '16π²'], answer: 12, ansLabel: 'v_max', unit: 'π m/s' },
          { problem: '(3) 최대 가속도의 크기는? (진폭과 각속도 제곱의 곱)', expr: ['a_max = ', { b: '3' }, ' × ', { b: '16π²' }], tiles: ['3', '4π', '2', '16π²'], answer: 48, ansLabel: 'a_max', unit: 'π² m/s²' },
          { problem: '(4) 복원력의 최댓값은? (최대 가속도에 질량을 곱한다)', expr: ['F_max = ', { b: '2' }, ' × ', { b: '48π²' }], tiles: ['2', '3', '48π²', '12π'], answer: 96, ansLabel: 'F_max', unit: 'π² N' }] }
      }),
      say('resona', '식은 외웠죠? 이제 몸으로 익혀요. 추가 <b>평형점</b>을 지날 땐 가장 빠르고 힘은 0, <b>양 끝</b>에선 멈추지만 가속도와 복원력이 최대예요. a = −ω²x 니까요.'),
      game('strike', '박자 맞추기 — 단진동의 순간 포착', {
        brief: '진동하는 추를 보고, 지시된 조건이 성립하는 바로 그 순간에 타격하라. 게이지로 x, v, a, F의 관계를 눈에 새겨라.', formula: 'a = −ω²x · F = −mω²x = −kx (크기는 변위에 비례, 방향은 진동의 중심)', lesson: '평형점(x=0): 속력 최대(Aω), 가속도·복원력 0. 양 끝(x=±A): 속력 0, 가속도 최대(Aω²), 복원력 최대. 가속도 방향은 항상 진동 중심을 향함(변위와 반대).',
        cfg: { rounds: [
          { ask: '속력이 최대인', at: 'center', why: '평형점 O를 지날 때 속력이 최대(Aω)다.' }, { ask: '가속도의 크기가 최대인', at: 'edge', why: '양 끝(x = ±A)에서 가속도 크기가 최대(Aω²)다.' },
          { ask: '복원력이 0인', at: 'center', why: 'F = −kx, x = 0인 평형점에서 복원력이 0이다.' }, { ask: '속력이 0인', at: 'edge', why: '양 끝에서 순간적으로 멈춘다.' },
          { ask: '가속도가 (−)방향으로 최대인', at: 'right', why: 'a = −ω²x. x = +A일 때 가속도는 −방향 최대다.' }, { ask: '복원력이 (+)방향으로 최대인', at: 'left', why: 'F = −kx. x = −A일 때 복원력은 +방향 최대다.' }] }
      }),
      { t: 'camp' },
      say('resona', '마지막 비밀. F = −kx 와 F = −mω²x 를 나란히 놓으면 mω² = k, 즉 ω = √(k/m). 그래서 주기는 T = 2π√(m/k)!'),
      say('ignis', '그럼 세게 당기면 더 빨리 흔들리겠네? 내가 힘껏 당겨 줄게!'),
      say('resona', '후후, 과연 그럴까요? 직접 해 봐요.'),
      game('tuner', '주기의 비밀 — T = 2π√(m/k)', {
        brief: '질량 m, 용수철 상수 k, 그리고 잡아당기는 거리를 조절해 주기를 맞춰라. 어떤 슬라이더가 주기를 바꾸고 어떤 것이 못 바꾸는지 확인하라.', formula: 'mω² = k → ω = √(k/m) → T = 2π/ω = 2π√(m/k)', lesson: '용수철 진자의 주기 T = 2π√(m/k): 질량이 클수록, 용수철 상수가 작을수록 길다. 당긴 거리(진폭)와는 무관.',
        cfg: { formula: 'T = 2π√(m/k)', h: 200, draw: springDraw,
          vars: [{ id: 'm', label: '질량 m', min: 1, max: 9, step: 1, init: 9, unit: 'kg' }, { id: 'k', label: '용수철 상수 k', min: 25, max: 225, step: 25, init: 225, unit: 'N/m' }, { id: 'A', label: '당긴 거리', min: 5, max: 20, step: 5, init: 5, unit: 'cm' }],
          outs: [{ label: 'ω = √(k/m)', f: v => Math.sqrt(v.k / v.m), unit: 'rad/s' }, { label: 'T', f: v => 2 * Math.PI * Math.sqrt(v.m / v.k), unit: 's', d: 3 }, { label: 'T/π', f: v => 2 * Math.sqrt(v.m / v.k), d: 3 }],
          rounds: [{ text: '예제 01: m = 1 kg, k = 25 N/m → T = (2/5)π 초', goals: [{ label: 'T/π', f: v => 2 * Math.sqrt(v.m / v.k), target: .4, tol: .001, d: 3 }, { label: 'm', f: v => v.m, target: 1, tol: 0 }] },
          { text: '당긴 거리를 20 cm로 늘려라. 주기는 변하는가?', goals: [{ label: '당긴 거리', f: v => v.A, target: 20, tol: 0, unit: 'cm' }, { label: 'T/π', f: v => 2 * Math.sqrt(v.m / v.k), target: .4, tol: .001, d: 3 }] },
          { text: 'k는 25 N/m 그대로, 주기를 2배 (T = (4/5)π) 로', goals: [{ label: 'k', f: v => v.k, target: 25, tol: 0 }, { label: 'T/π', f: v => 2 * Math.sqrt(v.m / v.k), target: .8, tol: .001, d: 3 }] }] },
        win: '주기를 2배로 하려면 질량은 4배. 당긴 거리는 주기와 무관하다 (탐구: 5~20 cm 모두 약 0.81초).'
      }),
      game('forge', '예제 01 — 용수철 상수와 주기', {
        brief: '마찰이 없는 수평면 위에서 원래의 길이가 80 cm인 용수철에 1 kg의 물체를 연결하여 10 N의 힘으로 서서히 당겼더니 용수철의 길이가 120 cm일 때 물체가 정지했다.', formula: 'F = kx · T = 2π√(m/k)', lesson: '예제 01: 늘어난 길이 40 cm = 0.4 m, k = 10/0.4 = 25 N/m. T = 2π√(1/25) = (2/5)π 초',
        cfg: { steps: [
          { problem: '(1) 용수철 상수는 몇 N/m인가?', expr: ['k × ', { b: '0.4 m' }, ' = ', { b: '10 N' }], tiles: ['0.4 m', '1.2 m', '0.8 m', '10 N', '1 kg'], answer: 25, ansLabel: 'k', unit: 'N/m', hint: '늘어난 길이 = 120 − 80 = 40 cm. m 단위로!' },
          { problem: '(2) 물체를 가만히 놓았을 때 진자의 주기는 몇 초인가? (π의 계수)', expr: ['T = 2π √( ', { b: '1 kg' }, ' / ', { b: '25 N/m' }, ' )'], tiles: ['1 kg', '25 N/m', '10 N', '0.4 m'], answer: .4, ansLabel: 'T', unit: 'π 초', hint: '√(1/25) = 1/5' },
          { problem: '탐구: 잡아당기는 거리 5, 10, 15, 20 cm에서 10회 왕복 시간이 8.2, 8.1, 8.0, 8.1초였다. 결론은?', expr: ['용수철 진자의 주기는 추를 당긴 거리와 ', { b: '관계가 없다' }], tiles: ['관계가 없다', '비례한다', '반비례한다'] }] }
      }),
      N('골짜기 바닥에서 거대한 추가 솟아오른다. 끊어진 현에 매달려 미친 듯이 진동하는 <b>진자 파수꾼</b>이다.', '⚖️'),
      game('strike', '보스 1페이즈 — 진자 파수꾼: 게이지 봉인', {
        boss: true, brief: '파수꾼이 게이지를 봉인했다. 이제 추의 위치만 보고 판단해야 한다. 더 빨라진 진동의 순간을 포착하라.', formula: '평형점: v 최대, a = 0, F = 0 · 양 끝: v = 0, |a| 최대, |F| 최대', lesson: 'a = −ω²x, F = −kx: 가속도와 복원력은 변위와 방향이 반대, 크기는 변위에 비례.',
        cfg: { hideBars: true, omega: 2.7, rounds: [
          { ask: '운동 방향이 바뀌는', at: 'edge', why: '양 끝에서 속력이 0이 되며 방향이 바뀐다.' }, { ask: '가속도가 0인', at: 'center', why: 'a = −ω²x, 평형점에서 0.' },
          { ask: '복원력이 (−)방향으로 최대인', at: 'right', why: 'F = −kx, x = +A에서 −방향 최대.' }, { ask: '속력이 Aω인', at: 'center', why: '최대 속력 Aω는 평형점에서.' },
          { ask: '가속도가 (+)방향 Aω²인', at: 'left', why: 'a = −ω²x, x = −A에서 +Aω².' }] }
      }),
      game('forge', '보스 최종 — 실전 파훼: 파수꾼의 현', {
        boss: true, brief: '파수꾼의 추는 질량 2 kg, 진동은 x = 3 sin 4πt (m). 이 진동을 만드는 현(용수철)의 상수 k를 알아내 끊어라.', formula: 'mω² = k · T = 2π√(m/k)', lesson: 'k = mω² = 2 × (4π)² = 32π² N/m. 검산: T = 2π√(2/32π²) = 0.5 s',
        cfg: { steps: [
          { problem: 'F = −kx = −mω²x 로부터', expr: ['k = ', { b: 'm' }, ' × ', { b: 'ω²' }, ' = 2 × (4π)²'], tiles: ['m', 'ω²', 'ω', 'A', 'T'], answer: 32, ansLabel: 'k', unit: 'π² N/m' },
          { problem: '같은 현에 질량 8 kg의 추를 달면 주기는 몇 배가 되는가?', expr: ['T ∝ √', { b: 'm' }, ' → 질량 4배 → 주기 ', { b: '2' }, ' 배'], tiles: ['m', 'k', '2', '4', '1/2'], answer: 1, ansLabel: '새 주기', unit: 's', hint: '원래 주기 0.5 s의 2배' }] },
        win: '현이 끊기며 파수꾼이 고요히 멈췄다.'
      }),
      say('resona', '해냈어요! …들려요? 떨림이 옆으로, 또 옆으로 퍼져 나가요. 진동이 전해지는 것 — 그게 <b>파동</b>이에요.'),
      say('me', '파동의 법칙이 뒤틀린 곳으로 가자. 파도의 해안이다.')
    ],
    camp: [
      { id: 'c4a', who: 'resona', title: '단위의 함정', after: 6, steps: [
        say('resona', '아까 제 활 말인데요, 누가 “40 cm 늘어났고 10 N이니까 k = 10/40 = 0.25”라고 했었어요. 음이 완전히 틀어졌죠.'),
        { t: 'choice', who: 'resona', q: '뭐가 잘못됐을까요?', opts: [
          { text: '길이를 m로 바꿔야 한다. 10 N / 0.4 m = 25 N/m.', appr: { resona: 2 }, reply: '맞아요! N/m를 구하려면 cm를 m로. 조율은 단위에서 시작하죠. {name} 님, 귀가 좋으시네요!' },
          { text: '전체 길이 120 cm로 나눠야 한다.', appr: { resona: -1 }, reply: '음… 아니에요. 탄성력은 “늘어난 길이”에 비례해요. 120 − 80 = 40 cm = 0.4 m. 그래서 25 N/m!' }] }] },
      { id: 'c4b', who: 'ignis', title: '세게 당기면?', after: 14, steps: [
        say('ignis', '아직도 분해. 세게 당기면 추가 더 멀리 가야 하니까 주기가 길어져야 하는 거 아냐?'),
        { t: 'choice', who: 'ignis', q: '설명해 줘.', opts: [
          { text: '멀리 가는 만큼 복원력도 커져 더 빨리 움직인다. 그래서 T = 2π√(m/k)엔 진폭이 없다.', appr: { ignis: 2, resona: 1 }, reply: '오… 갈 길이 2배면 힘도 2배, 속력도 2배! 그래서 걸리는 시간이 같구나. 완전 이해했어!' },
          { text: '사실 조금은 길어진다. 실험 오차 때문에 안 보였을 뿐.', appr: { ignis: -1 }, reply: '{resona}가 고개를 젓는데? 0.82, 0.81, 0.80, 0.81초 — 그게 오차고, 주기는 당긴 거리와 무관하대.' }] }] }
    ]
  });
})();
