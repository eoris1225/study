/* 화학 · 미적분1 1시간 자습 프린트(HTML) 생성 — 기하·물리 프린트와 같은 틀
   단원마다: 개념 표(쉬운 말 정리 + 내 필기 칸) → 이런 문제는 이렇게 → 헷갈리는 것 → 예제 따라 풀기 → 직접 풀기 1문제 / 맨 뒤 정답
   node tools/print_1h.js  →  chem_1h.html, calc_1h.html (저장소 루트, 이미지 상대 경로) */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; global.document = {};
const J = f => require(path.join(ROOT, 'js', f));
['chem/data.js', 'chem/data2.js', 'chem/data3.js', 'chem/solve.js', 'chem/data4.js', 'chem/naesin.js'].forEach(J);
const FIG = require('./print_figs.js');
const circ = ['①', '②', '③', '④', '⑤', '⑥'];

const css = `@page{size:A4;margin:12mm 12mm 13mm}
body{font-family:'Noto Sans KR','Noto Sans CJK KR',sans-serif;font-size:10pt;line-height:1.5;color:#111;margin:0}
.wrap{max-width:186mm;margin:0 auto;padding:6mm 0}
h1{font-size:21pt;margin:0 0 2mm;font-weight:900}
h2{font-size:13.5pt;margin:0 0 2.5mm;padding:1.6mm 3mm;background:#111;color:#fff;border-radius:2mm;break-after:avoid}h2 small{font-weight:400;font-size:9pt;opacity:.85}
h3{font-size:11.5pt;margin:3.5mm 0 1.5mm;border-bottom:2px solid #111;break-after:avoid}
.part{break-before:page}
table{border-collapse:collapse;width:100%;margin:1mm 0 2mm}
td,th{border:1px solid #555;padding:1mm 1.8mm;vertical-align:top;font-size:9.2pt}th{background:#eee;text-align:left}
.tt th{width:24mm}
.box{border:1.5px solid #111;border-radius:2mm;padding:1.6mm 3mm;margin:2mm 0;break-inside:avoid}
.warn{border:1.5px dashed #b91c1c;border-radius:2mm;padding:1.6mm 3mm;margin:2mm 0;break-inside:avoid;font-size:9.3pt}.warn b.t{color:#b91c1c}
.chap{margin-bottom:4mm}.nt{break-inside:avoid}.nt td,.nt th{font-size:8.9pt;padding:.8mm 1.6mm;line-height:1.42}
.memo{background:repeating-linear-gradient(#fff 0 6.6mm,#d4d4d4 6.6mm 6.9mm)}
.rc{margin:.6mm 0 0 2mm;font-size:9.3pt}
.ex{border:1.5px solid #1f4fb8;border-radius:2mm;padding:2mm 3mm;margin:2mm 0;break-inside:avoid}.exh{font-weight:900;color:#1f4fb8;margin-bottom:1mm}
.st{margin:1.2mm 0 0 1mm;padding-left:2mm;border-left:3px solid #1f4fb855;font-size:9.3pt;break-inside:avoid}.dim{color:#555}
.ea{margin-top:1.5mm;font-size:10pt}
.pr{border-top:1.5px dashed #111;padding-top:2mm;margin-top:3mm;break-inside:avoid}.n{font-weight:900}.src{color:#666;font-size:8pt}
.work{height:32mm;border:1px solid #bbb;border-radius:1.5mm;margin-top:1.5mm;background-image:linear-gradient(#e6e6e6 1px,transparent 1px),linear-gradient(90deg,#e6e6e6 1px,transparent 1px);background-size:5mm 5mm}
.qimg{display:block;max-width:100%;max-height:62mm;margin:1mm 0;border:1px solid #ccc}
.ans p{margin:0 0 1.3mm;font-size:8.6pt;line-height:1.45;break-inside:avoid}.ans{columns:2;column-gap:5mm}.ans h2{column-span:all}
.ox{columns:2;column-gap:5mm;margin:0;padding-left:6mm}.ox li{break-inside:avoid;font-size:9pt;margin:0 0 1.2mm}.ox .b{font-weight:700;white-space:pre}
.duo{display:flex;gap:3mm;align-items:flex-start;break-inside:avoid}.dl{flex:1;min-width:0}.fg{flex:0 0 68mm;border:1px solid #ccc;border-radius:2mm;padding:1mm;margin-top:2mm;background:#fcfcfc}.fg svg{display:block}
.f{border:1.4px solid #111;border-radius:1mm;padding:0 1.5mm;font-weight:700;white-space:nowrap}
@media screen{body{background:#e9e4d8}.wrap{background:#fff;padding:10mm 12mm;margin:6mm auto;box-shadow:0 2px 10px #0003}.btn{position:fixed;right:12px;top:12px;font:700 14px sans-serif;padding:6px 12px;border:1.5px solid #111;border-radius:4px;background:#5affd0;cursor:pointer}}
@media print{.btn{display:none}.wrap{padding:0}}`;
const page = (title, body, extra = '') => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${extra}<style>${css}</style></head><body><button class="btn" onclick="print()">인쇄하기</button><div class="wrap">${body}</div></body></html>`;
const chap = (C, num) => `<div class="chap">
<h2>${C.t} <small>${C.p || ''}</small></h2>
<table class="nt"><tr><th style="width:17%">개념</th><th>쉬운 말 정리</th><th style="width:23%">내 필기</th></tr>${C.k.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td><td class="memo"></td></tr>`).join('')}</table>
<div class="duo"><div class="dl">${C.r && C.r.length ? `<div class="box"><b>이런 문제는 이렇게</b>${C.r.map(([t, v]) => `<div class="rc"><b>${t}</b>: ${v}</div>`).join('')}</div>` : ''}
${(C.w || []).map(([t, v]) => `<div class="warn"><b class="t">헷갈리는 것 — ${t}</b><br>${v}</div>`).join('')}</div>${C.fig ? `<div class="fg">${C.fig}</div>` : ''}</div>
${C.ex ? `<div class="ex"><div class="exh">예제 따라 풀기 <span class="src">${C.ex.s || ''}</span></div>${C.ex.q}${C.ex.st.map(([q, a, why], i) => `<div class="st"><b>${circ[i] || i + 1}</b> ${q} → <b>${a}</b>${why ? `<br><span class="dim">${why}</span>` : ''}</div>`).join('')}<div class="ea">답: <b>${C.ex.a}</b></div></div>` : ''}
${C.pr ? `<div class="pr"><span class="n">직접 풀기 ${num}.</span> <span class="src">${C.pr.s || ''}</span><br>${C.pr.q}<div class="work"></div></div>` : ''}</div>`;

/* ───────────── 미적분1 ───────────── */
const CAL = [
{ t: '0. 미분 기계 — 모든 문제의 시작', p: '(5분 · 이게 되면 나머지가 다 풀림)',
  k: [['도함수 $f\'(x)$', '$f(x)$ 그래프의 <b>기울기를 알려 주는 함수</b>. $f\'(2)$ = $x=2$ 인 점에서의 기울기.'],
    ['$x^n$ 미분', '<b>지수를 앞으로 내리고, 지수는 1 빼기</b>: $x^3\\to3x^2$, $x^2\\to2x$, $x\\to1$, 숫자 $\\to0$'],
    ['계수 · 합', '앞 숫자는 그대로 곱하고 항마다 따로: $(2x^3-5x+7)\'=6x^2-5$'],
    ['괄호 곱', '<b>전개부터</b>: $(x-1)(x+2)=x^2+x-2 \\to 2x+1$']],
  r: [['미분 4단계', '① 항 나누기 → ② 지수 내리기 → ③ 지수 −1 → ④ 숫자 항 지우기']],
  ex: { q: '$f(x)=2x^3-3x^2-12x+1$ 의 $f\'(x)$ 와 $f\'(2)$', st: [['$2x^3$', '$6x^2$', '지수 3 내리고 2×3=6, 지수 3−1=2'], ['$-3x^2$', '$-6x$', ''], ['$-12x$, $+1$', '$-12$, $0$', '$x$ 는 1, 숫자는 0'], ['$f\'(2)$', '$24-12-12=0$', '$x$ 자리에 2 넣기']], a: '$f\'(x)=6x^2-6x-12$, $f\'(2)=0$' },
  pr: { q: '$f(x)=x^3-6x^2+9x+1$ 일 때 $f\'(x)$ 와 $f\'(2)$ 를 구하시오.', a: '$f\'(x)=3x^2-12x+9$, $f\'(2)=-3$', h: '$12-24+9=-3$' } },
{ t: '1. 함수의 증가와 감소', p: '교과서 Ⅱ-2-03',
  k: [['증가 / 감소', '$x$ 가 커질 때 $f(x)$ 도 커지면 <b>증가</b>(그래프 ↗), 작아지면 <b>감소</b>(↘)'],
    ['판정법', '$f\'(x)>0$ 인 곳 → 증가, $f\'(x)<0$ 인 곳 → 감소. <b>기울기 부호 = 오르막/내리막</b>'],
    ['증감표', '$x$ 줄에 $f\'=0$ 인 값, $f\'$ 줄에 $+/0/-$, $f$ 줄에 ↗ ↘. 삼차함수($x^3$ 계수 +)는 <b>바깥 +, 사이 −</b>'],
    ['실수 전체에서 증가', '모든 $x$ 에서 $f\'(x)\\ge0$ → $f\'$ 가 이차식이면 <b>판별식 $D\\le0$</b> (감소면 $f\'\\le0$: 최고차 음수 + $D\\le0$)']],
  r: [['증가/감소 구간', '① $f\'(x)$ 인수분해 → ② $f\'=0$ 인 $x$ → ③ 사이에 숫자 넣어 부호 → ④ $+$ 구간 / $-$ 구간'],
    ['“항상 증가(감소)”, “$x_1<x_2$ 이면 $f(x_1)<f(x_2)$”', '① $f\'(x)\\ge0$ (또는 $\\le0$) 세우기 → ② 이차식 최고차 부호 → ③ $\\frac{D}{4}\\le0$']],
  w: [['등호', '증가 조건은 $f\'(x)>0$ 이 아니라 <b>$f\'(x)\\ge0$</b> → 그래서 <b>$D\\le0$</b> ($D<0$ 아님!). $x^3$ 은 $f\'(0)=0$ 이어도 증가함수.'],
    ['“$x_1<x_2$ 일 때 $f(x_1)>f(x_2)$”', '말로 풀면 “항상 감소” → $f\'(x)\\le0$']],
  ex: { q: '$f(x)=x^3+ax^2+3x$ 가 실수 전체에서 증가할 때 $a$ 의 범위', st: [['미분', '$f\'(x)=3x^2+2ax+3$', ''], ['조건', '$f\'(x)\\ge0$ 이 항상 성립', '아래로 볼록한 포물선이 $x$축 아래로 안 내려가야 함'], ['판별식', '$\\frac{D}{4}=a^2-9\\le0$', '$b\'^2-ac=a^2-3\\cdot3$']], a: '$-3\\le a\\le3$' },
  pr: { s: '[중단원 평가 Ⅱ-2 · 09번]', q: '함수 $f(x)=ax^3+6x^2+(a-4)x+5$ 가 $x_1<x_2$ 인 임의의 두 실수 $x_1, x_2$ 에 대하여 $f(x_1)>f(x_2)$ 일 때, 실수 $a$ 의 최댓값을 구하시오.', a: '$-2$', h: '항상 감소 → $f\'(x)=3ax^2+12x+a-4\\le0$ → $a<0$, $\\frac{D}{4}=36-3a(a-4)\\le0$ → $(a+2)(a-6)\\ge0$ → $a\\le-2$' } },
{ t: '2. 함수의 극대와 극소', p: '교과서 Ⅱ-2-03',
  k: [['극대 / 극소', '<b>극대</b> = 올라가다 내려가는 꼭대기 ($+\\to-$), <b>극소</b> = 내려가다 올라가는 골짜기 ($-\\to+$)'],
    ['찾는 법', '$f\'(x)=0$ 인 $x$ 를 찾고, 그 앞뒤로 <b>부호가 바뀌는지</b> 증감표로 확인'],
    ['극댓값', '<b>$f$ 값</b> ($f(\\text{그 }x)$). $x$ 값이 아님!'],
    ['조건 해석', '“$x=1$ 에서 극솟값 $-2$” → <b>$f\'(1)=0$, $f(1)=-2$</b> 두 식'],
    ['극값을 가질 조건', '삼차함수: $f\'(x)=0$ 이 서로 다른 두 실근 ⇔ <b>$D>0$</b> / 극값이 <b>없다</b> ⇔ $D\\le0$']],
  r: [['극댓값·극솟값', '① $f\'$ 인수분해 → ② 증감표 → ③ $+\\to-$ 자리 $x$ 를 <b>$f$ 에 넣기</b>'], ['극값 갖지 않을 조건', '$f\'(x)$ 의 $\\frac{D}{4}\\le0$']],
  w: [['$f\'=0$ 인데 극값 아님', '$f(x)=x^3$: $f\'(0)=0$ 이지만 부호가 $+\\to+$ 라 극값 X. <b>부호 변화</b>가 핵심.']],
  ex: { q: '$f(x)=2x^3-9x^2+12x$ 의 극댓값과 극솟값', st: [['미분 · 인수분해', '$f\'(x)=6(x-1)(x-2)$', ''], ['증감표', '$x<1$: $+$, $1<x<2$: $-$, $x>2$: $+$', '바깥 +, 사이 −'], ['$x=1$ ($+\\to-$)', '극댓값 $f(1)=2-9+12=5$', ''], ['$x=2$ ($-\\to+$)', '극솟값 $f(2)=16-36+24=4$', '']], a: '극댓값 5, 극솟값 4' },
  pr: { s: '[중단원 평가 Ⅱ-2 · 12번]', q: '함수 $f(x)=3x^3+3kx^2+(3k+4)x-2$ 가 극값을 갖지 않도록 하는 자연수 $k$ 의 개수를 구하시오.', a: '4', h: '$f\'(x)=9x^2+6kx+3k+4$, $\\frac{D}{4}=9k^2-9(3k+4)\\le0$ → $(k+1)(k-4)\\le0$ → $k=1,2,3,4$' } },
{ t: '3. 그래프 · 닫힌구간의 최대와 최소', p: '교과서 Ⅱ-2-04',
  k: [['그래프 그리기', '증감표 → 극대·극소 점 찍기 → $y$절편 $f(0)$ → 끝 모양(삼차 $x^3$ 계수 + 면 ↗로 끝)'],
    ['닫힌구간 최대·최소', '후보 = <b>구간 안의 극값 + 양 끝값</b> $f(a), f(b)$. 전부 계산해서 비교'],
    ['활용 (넓이·부피 최대)', '구하는 양을 <b>한 문자 식</b>으로 → 미분 = 0 → 범위 안 극대가 최대']],
  r: [['최댓값·최솟값', '① $f\'=0$ 인 $x$ 중 <b>구간 안</b>만 → ② 그 값 + 양 끝값 계산 → ③ 가장 큰/작은 것']],
  w: [['끝점', '극댓값이 최댓값이라는 보장 없음. $x^3-3x$ 를 $[-2,3]$ 에서 보면 극댓값 2인데 최댓값은 끝점 $f(3)=18$!']],
  ex: { q: '$f(x)=x^3-3x$, $-2\\le x\\le3$ 에서 최댓값과 최솟값', st: [['후보 찾기', '$f\'(x)=3(x+1)(x-1)=0 \\Rightarrow x=\\pm1$', '둘 다 구간 안'], ['값 계산', '$f(-2)=-2,\\ f(-1)=2,\\ f(1)=-2,\\ f(3)=18$', '끝점 2개 + 극값 2개'], ['비교', '최대 18, 최소 −2', '']], a: '최댓값 18, 최솟값 −2' },
  pr: { s: '[중단원 평가 Ⅱ-2 · 18번]', q: '닫힌구간 $[-4,2]$ 에서 함수 $f(x)=x^3+3x^2-9x+k$ 의 최댓값과 최솟값의 합이 12일 때, 상수 $k$ 의 값을 구하시오.', a: '$-5$', h: '$f\'=3(x+3)(x-1)$. $f(-4)=k+20,\\ f(-3)=k+27,\\ f(1)=k-5,\\ f(2)=k+2$ → 최대 $k+27$, 최소 $k-5$ → $2k+22=12$' } },
{ t: '4. 방정식과 부등식에의 활용', p: '교과서 Ⅱ-2-05',
  k: [['실근의 개수', '$f(x)=k$ 의 실근 개수 = <b>$y=f(x)$ 그래프와 가로선 $y=k$ 의 교점 개수</b>'],
    ['문자 분리', '$x^3-3x-k=0$ → <b>$x^3-3x=k$</b> 로 $k$ 를 한쪽에 모으기'],
    ['삼차 세 실근', '극솟값 $<k<$ 극댓값. $f(x)=0$ 이 세 실근 ⇔ <b>(극댓값)×(극솟값) $<0$</b>'],
    ['부등식 항상 성립', '$f(x)\\ge0$ ⇔ <b>$f$ 의 최솟값 $\\ge0$</b>. $f(x)>g(x)$ 는 $h=f-g$ 로 만들어서 $h$ 의 최솟값 $>0$']],
  r: [['실근 개수 문제', '① $k$ 분리 → ② 왼쪽 함수 증감표 → ③ 그래프에 가로선 움직여 보기'], ['부등식 문제', '① 한쪽으로 몰아 $h(x)$ → ② 주어진 범위에서 최솟값 → ③ 최솟값 조건']],
  w: [['범위 주의', '“$x\\ge0$ 인 모든 $x$” 이면 $x\\ge0$ 안의 극값과 끝값 $h(0)$ 만 비교']],
  ex: { q: '$x^3-3x-k=0$ 이 서로 다른 세 실근을 가질 $k$ 의 범위', st: [['분리', '$x^3-3x=k$', ''], ['극값', '극댓값 $f(-1)=2$, 극솟값 $f(1)=-2$', '$f\'=3(x+1)(x-1)$'], ['가로선', '$-2<k<2$ 에서 세 번 만남', '']], a: '$-2<k<2$' },
  pr: { s: '[중단원 평가 Ⅱ-2 · 21번]', q: '$x\\ge0$ 인 모든 실수 $x$ 에 대하여 부등식 $2x^3-11x^2-3x+a>4x^2-27x$ 가 성립하도록 하는 정수 $a$ 의 최솟값을 구하시오.', a: '17', h: '$h(x)=2x^3-15x^2+24x+a$, $h\'=6(x-1)(x-4)$. $x\\ge0$ 에서 최솟값은 $h(0)=a$ 와 $h(4)=a-16$ 중 작은 $a-16>0$' } },
{ t: '5. 속도와 가속도 (미분)', p: '교과서 Ⅱ-2-06',
  k: [['속도 · 가속도', '위치 $x(t)$ → 미분 한 번 = <b>속도 $v$</b>, 두 번 = <b>가속도 $a$</b>'],
    ['운동 방향 전환', '<b>$v=0$ 이고 부호가 바뀌는</b> 순간'],
    ['정지 · 속력', '정지 = $v=0$ / 속력 = <b>$|v|$</b> (방향 없는 빠르기)'],
    ['위로 던진 물체', '최고점에서 $v=0$']],
  r: [['방향 바뀌는 시각', '$v=x\'(t)$ 인수분해 → $v=0$ 인 $t$ (부호 바뀌는지)'], ['속력 최댓값', '$v$ 를 완전제곱식으로 → 범위에서 $v$ 의 최대·최소 → 절댓값 큰 쪽']],
  ex: { q: '$x(t)=t^3-6t^2+9t$ 에서 운동 방향이 바뀌는 시각과 $t=3$ 에서의 가속도', st: [['속도', '$v=3t^2-12t+9=3(t-1)(t-3)$', ''], ['방향 전환', '$t=1,\\ 3$', '$v=0$ 이고 부호 바뀜'], ['가속도', '$a=6t-12$, $a(3)=6$', '']], a: '$t=1, 3$ / 가속도 6' },
  pr: { s: '[중단원 평가 Ⅱ-2 · 22번]', q: '수직선 위를 움직이는 점 P의 시각 $t$ 에서의 위치 $x$ 가 $x=\\frac13t^3-3t^2+8t$ 일 때, $2\\le t\\le6$ 에서 점 P의 속력의 최댓값을 구하시오.', a: '8', h: '$v=t^2-6t+8=(t-3)^2-1$ → $-1\\le v\\le8$ → $|v|$ 최대 8 ($t=6$)' } },
{ t: '6. 부정적분 — 미분을 거꾸로', p: '교과서 Ⅲ-1-01',
  k: [['부정적분', '<b>“미분해서 $f(x)$ 가 나오는 함수”</b>. $F\'(x)=f(x)$ 이면 $\\int f(x)dx=F(x)+C$'],
    ['공식', '$\\int x^n dx=\\frac{x^{n+1}}{n+1}+C$ — <b>지수 1 더하고 그 수로 나누기</b>. $\\int k\\,dx=kx+C$'],
    ['$+C$', '미분하면 상수가 사라지니까 원래 상수 모름 → <b>꼭 $+C$</b>. 조건 $f(0)=3$ 등으로 $C$ 결정'],
    ['접선의 기울기', '“곡선 위 점 $(x,y)$ 에서 접선의 기울기가 $g(x)$” = <b>$f\'(x)=g(x)$</b> → 적분']],
  r: [['$f\'$ 주고 $f$ 값 묻기', '① 적분 ($+C$) → ② 주어진 값 넣어 $C$ → ③ 원하는 $x$ 대입']],
  w: [['순서에 따라 $C$', '$\\frac{d}{dx}\\int f(x)dx=f(x)$ (C 없음) / $\\int\\frac{d}{dx}f(x)\\,dx=f(x)+C$ (C 있음)']],
  ex: { q: '$f\'(x)=6x^2-2x$, $f(0)=3$ 일 때 $f(1)$', st: [['적분', '$f(x)=2x^3-x^2+C$', '$6\\cdot\\frac{x^3}{3}=2x^3$'], ['$C$ 구하기', '$f(0)=C=3$', ''], ['대입', '$f(1)=2-1+3=4$', '']], a: '4' },
  pr: { s: '[중단원 평가 Ⅲ-1 · 05번]', q: '함수 $f(x)$ 에 대하여 $f\'(x)=3x^2-4x$ 이고 $f(0)=2$ 일 때, $f(1)$ 의 값은?', a: '1 (①)', h: '$f(x)=x^3-2x^2+C$, $C=2$ → $f(1)=1-2+2=1$' } },
{ t: '7. 정적분', p: '교과서 Ⅲ-1-02',
  k: [['계산법', '$\\int_a^b f(x)dx=F(b)-F(a)$ — 부정적분에 <b>위끝 넣은 값 − 아래끝 넣은 값</b> (답은 숫자)'],
    ['성질', '$\\int_a^a=0$, $\\int_b^a=-\\int_a^b$, $\\int_a^c+\\int_c^b=\\int_a^b$ (구간 이어 붙이기)'],
    ['$\\int_{-a}^{a}$', '<b>홀수 차수</b>($x, x^3$) 항은 0, 짝수 차수·상수항은 $2\\int_0^a$'],
    ['절댓값', '안이 0 되는 점에서 쪼개고, 음수 구간은 $-$ 붙이기'],
    ['$\\int_a^x f(t)dt$', '<b>$x$ 로 미분하면 $f(x)$</b>, <b>$x=a$ 넣으면 0</b>'],
    ['$f(x)=\\cdots+\\int_0^1 f(t)dt$', '$\\int_0^1 f(t)dt$ 는 숫자 → <b>$k$ 로 두고</b> $k$ 를 구함']],
  r: [['$\\int_a^x f(t)dt=g(x)$ 꼴', '① 양변 미분 → $f(x)=g\'(x)$ ② $x=a$ 대입 → $g(a)=0$ (숨은 조건)'], ['정적분이 들어간 함수', '① $\\int f=k$ 로 두기 ② $f$ 를 $k$ 로 표현 ③ 다시 적분해서 $k$ 방정식']],
  ex: { q: '$\\int_1^x f(t)dt=x^2-3x+2$ 일 때 $f(4)$', st: [['양변 미분', '$f(x)=2x-3$', '$\\frac{d}{dx}\\int_1^x f(t)dt=f(x)$'], ['대입', '$f(4)=5$', ''], ['검산', '$x=1$: 좌변 0 = 우변 $1-3+2=0$ ✓', '']], a: '5' },
  pr: { s: '[중단원 평가 Ⅲ-1 · 13번]', q: '다항함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $\\int_0^x f(t)dt=x^3-2x$ 를 만족시킬 때, $f(4)$ 의 값을 구하시오.', a: '46', h: '양변 미분: $f(x)=3x^2-2$ → $f(4)=48-2$' } },
{ t: '8. 넓이', p: '교과서 Ⅲ-2-01',
  k: [['곡선과 $x$축', '넓이 $=\\int_a^b|f(x)|dx$ — <b>$x$축 아래 부분은 $-$ 붙여서</b> 양수로'],
    ['두 곡선 사이', '$\\int_\\alpha^\\beta(\\text{위}-\\text{아래})dx$. $\\alpha, \\beta$ = <b>교점</b> (두 식 같다고 놓고 풀기)'],
    ['꿀공식', '이차함수 & 직선(또는 이차끼리)이 $x=\\alpha,\\beta$ 에서 만나면 <b>$\\frac{|a|}{6}(\\beta-\\alpha)^3$</b> ($a$ = 위−아래의 $x^2$ 계수)']],
  r: [['넓이 3단계', '① 교점 구하기 ② 사이에 숫자 하나 넣어 누가 위인지 ③ (위−아래) 적분']],
  w: [['부호', '$\\int_0^3(x^2-3x-4)dx$ 를 그대로 계산하면 음수 → 넓이는 <b>반드시 양수</b>. 그래프 대충이라도 그리기!']],
  ex: { q: '$y=x^2$ 과 $y=2x+3$ 으로 둘러싸인 넓이', st: [['교점', '$x^2=2x+3 \\Rightarrow x=-1,\\ 3$', '$(x-3)(x+1)=0$'], ['위/아래', '$x=0$: 직선 3 > 곡선 0 → 직선이 위', ''], ['적분', '$\\int_{-1}^{3}(2x+3-x^2)dx=\\frac{32}{3}$', '꿀공식: $\\frac16\\cdot4^3=\\frac{32}{3}$ ✓']], a: '$\\frac{32}{3}$' },
  pr: { s: '[중단원 평가 Ⅲ-2 · 01번]', q: '곡선 $y=x^2-3x-4$ 와 $x$축 및 두 직선 $x=0,\\ x=3$ 으로 둘러싸인 도형의 넓이는?', a: '$\\frac{33}{2}$ (②)', h: '$x^2-3x-4=(x-4)(x+1)<0$ ($0\\le x\\le3$) → $-\\int_0^3(x^2-3x-4)dx=-(9-\\frac{27}{2}-12)$' } },
{ t: '9. 속도와 거리 (적분)', p: '교과서 Ⅲ-2-02',
  k: [['위치', '<b>위치 = 처음 위치 + $\\int_0^t v\\,dt$</b> (원점 출발이면 처음 위치 0)'],
    ['위치의 변화량', '$\\int_a^b v\\,dt$ — 앞뒤로 움직이면 <b>상쇄됨</b>'],
    ['움직인 거리', '$\\int_a^b|v|\\,dt$ — $v=0$ 에서 쪼개서 <b>전부 양수로</b> 더함'],
    ['$v$-$t$ 그래프', '넓이 = 거리 (축 위 +, 아래 − 는 위치 변화에서만)'],
    ['원점 다시 통과', '위치 $\\int_0^t v\\,dt=0$']],
  r: [['거리 문제', '① $v=0$ 인 $t$ 찾기 ② 그 점에서 쪼개기 ③ 각 구간 절댓값 더하기']],
  w: [['위치 vs 거리', '갔다가 돌아오면 위치 변화는 0이어도 <b>움직인 거리는 0이 아님</b>']],
  ex: { q: '$v(t)=3t^2-6t$, 원점 출발. $t=3$ 에서의 위치와 $0\\sim3$ 동안 움직인 거리', st: [['위치', '$\\int_0^3(3t^2-6t)dt=\\big[t^3-3t^2\\big]_0^3=0$', '원점에 돌아옴'], ['방향', '$v=3t(t-2)$: $0<t<2$ 뒤로, $t>2$ 앞으로', ''], ['거리', '$\\int_0^2(6t-3t^2)dt+\\int_2^3(3t^2-6t)dt=4+4$', '']], a: '위치 0, 거리 8' },
  pr: { s: '[중단원 평가 Ⅲ-2 · 17번]', q: '수직선 위를 움직이는 점 P의 시각 $t\\ (t\\ge0)$ 에서의 속도 $v(t)$ 가 $v(t)=-2t+6$ 일 때, $t=0$ 에서 $t=4$ 까지 점 P가 움직인 거리는?', a: '10 (⑤)', h: '$t=3$ 에서 $v=0$ → $\\int_0^3(6-2t)dt+\\int_3^4(2t-6)dt=9+1$' } },
];
CAL.forEach((c, i) => { c.fig = FIG.CALC[i] && FIG.CALC[i](); });
const calcBody = `<h1>미적분1 1시간 자습 프린트</h1>
<p>범위: 교과서 87쪽~끝 — Ⅱ-2 도함수의 활용(03~06) · Ⅲ 적분 (부정적분·정적분 / 넓이 / 속도와 거리)</p>
<table class="tt"><tr><th>0~5분</th><td><b>0. 미분 기계</b> — 이것만 되면 나머지가 다 풀려. 예제 가리고 따라 쓰기</td></tr>
<tr><th>단원마다 5분</th><td>① <b>개념</b> 표 읽기 (쉬운 말) → ② <b>이런 문제는 이렇게</b> 순서 외우기 → ③ <b>예제 따라 풀기</b>: 답 가리고 한 줄씩 → ④ <b>직접 풀기</b> 1문제 (학교 평가 문제)</td></tr>
<tr><th>마지막 10분</th><td>채점 (맨 뒤). 틀린 단원은 “이런 문제는 이렇게”와 “헷갈리는 것”만 다시 읽기</td></tr></table>
<div class="box">자주 쓰는 공식: $(x^n)\'=nx^{n-1}$ · $\\int x^n dx=\\frac{x^{n+1}}{n+1}+C$ · $\\int_a^b f=F(b)-F(a)$ · 증가 ⇔ $f\'\\ge0$ · 극값 = $f\'$ 부호 바뀜 · 최대·최소 = 극값 + 끝값 · $v=x\'$, $a=v\'$ · 넓이 $=\\int(\\text{위}-\\text{아래})$ · 거리 $=\\int|v|$</div>
${CAL.map((c, i) => chap(c, i)).join('')}
<div class="ans part"><h2>직접 풀기 정답 · 풀이</h2>${CAL.map((c, i) => `<p><b>${i}. ${c.pr.a}</b> <span class="dim">— ${c.pr.h}</span></p>`).join('')}</div>
<div class="box" style="margin-top:4mm">더 풀고 싶으면: <b>calc_print.html</b> (단원별 연습 77문제 + 학교 평가 문제 전부 + 해설)</div>`;
const kx = `<link rel="stylesheet" href="js/vendor/katex/katex.min.css"><script src="js/vendor/katex/katex.min.js"></script><script src="js/vendor/katex/auto-render.min.js"></script>
<script>addEventListener('DOMContentLoaded',()=>renderMathInElement(document.body,{delimiters:[{left:'$',right:'$',display:false}],throwOnError:false}))</script>`;
const fixLt = h => h.replace(/\$([^$]+)\$/g, (m, x) => '$' + x.replace(/</g, '\\lt ').replace(/>/g, '\\gt ') + '$');
fs.writeFileSync(path.join(ROOT, 'calc_1h.html'), page('미적분1 1시간 자습 프린트', fixLt(calcBody), kx));

/* ───────────── 화학 ───────────── */
const Q = window.CHEMQ, PA = window.CHEMSOLVE.PA;
const img = id => `<img class="qimg" src="img/chem/${Q[id].img}.jpg" alt="${Q[id].src}">`;
const exOf = (id, extra = '') => { const P = Q[id]; return { s: `[${P.src}]`, q: img(id) + extra, st: P.steps.map(([q, o, a, why]) => [q, o[a], why]), a: P.ans }; };
const prOf = id => ({ s: `[${Q[id].src}]`, q: (PA[id] ? `<span class="dim">무슨 반응? → 직접 한 줄 써 보기</span>` : '') + img(id) });
const CH = [
{ t: '1. 엔탈피 · 열화학 반응식', p: '교과서 74~77쪽', k: [
  ['발열 / 흡열', '<b>발열</b>: 열을 내놓음 → 주위 온도 ↑, <span class="f">ΔH &lt; 0</span>. <b>흡열</b>: 열을 빼앗음 → 주위 온도 ↓, <span class="f">ΔH &gt; 0</span>'],
  ['ΔH', '<span class="f">ΔH = H(생성물) − H(반응물)</span>. 에너지가 낮은 쪽이 <b>안정</b> (발열이면 생성물이 안정)'],
  ['열화학 반응식', '① <b>상태</b> (s)(l)(g)(aq) 꼭 쓰기 ② 계수 n배 → ΔH n배 ③ 거꾸로 쓰면 <b>부호만</b> 반대'],
  ['생활 예', '발열: 연소·철의 부식·손난로·CaO + 물(구제역 소독) / 흡열: 광합성·NaHCO₃ 열분해·냉각 팩(NH₄NO₃ 용해)'],
  ['열량계', '<span class="f">Q = c × m × Δt</span> (c 비열, m 용액 질량). 간이 열량계는 열 손실 큼']],
  r: [['보기 문제', '① ΔH 부호 먼저 → ② 발열/흡열 → ③ 주위 온도·안정성·몰수 보기를 한 번에'], ['몰수 환산', '질량 ÷ 화학식량 = mol → ΔH 는 mol 에 비례']],
  w: [['외우기', 'N₂ + 2O₂ → 2NO₂ 는 <b>흡열 (+67.7)</b> / CaCl₂ 용해는 <b>발열 (−81.7)</b> / 냉각 팩 NH₄NO₃ 용해는 <b>흡열 (+26.2)</b>']],
  ex: exOf('W-caco3'), pr: prOf('U3-01') },
{ t: '2. 연소 · 결합 에너지', p: '교과서 78~81쪽', k: [
  ['연소', '산소와 반응해 빛·열을 내는 격렬한 산화 → <b>항상 발열</b>. 완전 연소 = CO₂, H₂O 생성'],
  ['연료 비교', 'mol당: 뷰테인 2877 > 에탄올 1367 > 메테인 890.5 > 수소 285.8 / <b>1 g당: 수소 > 메테인 > 뷰테인 > 에탄올</b>'],
  ['LNG / LPG', '<b>LNG = 메테인(CH₄)</b>, <b>LPG = 뷰테인(C₄H₁₀)</b>'],
  ['결합 에너지', '<b>기체</b> 상태 결합 1 mol 끊는 에너지 (H–H 436, 항상 +). 클수록 강하고 안정'],
  ['ΔH 계산', '<span class="f">ΔH ≈ Σ반응물 결합 − Σ생성물 결합</span> (평균값이라 근삿값)']],
  r: [['1 g당 연소열', 'mol당 ÷ 화학식량'], ['결합 에너지 계산', '① 구조식 그려 결합 개수 세기 (계수 × 분자 속 개수) ② 반응물 합 − 생성물 합']],
  w: [['순서 반대!', '결합 에너지는 <b>반응물 − 생성물</b>, 생성 엔탈피는 <b>생성물 − 반응물</b>'], ['계수', '뷰테인 2C₄H₁₀ 연소 −5754 kJ 은 <b>2 mol</b> 기준 → 1 mol 은 −2877']],
  ex: exOf('III1-4'), pr: prOf('V3-04') },
{ t: '3. 헤스 법칙 · 생성 엔탈피', p: '교과서 82~87쪽', k: [
  ['헤스 법칙', '반응물·생성물이 같으면 <b>경로와 관계없이 ΔH 합은 같다</b> (총열량 불변). 직접 못 재는 ΔH 계산에 씀'],
  ['식 조립', '뒤집으면 ΔH 부호 반대 / n배 하면 ΔH n배 / 더하면 ΔH 도 더함'],
  ['표준 생성 엔탈피', '25 °C, 1 atm 에서 <b>가장 안정한 원소</b>로부터 1 mol 만들 때 ΔH. 가장 안정한 원소(O₂, H₂, C 흑연)는 <b>0</b>'],
  ['ΔH 계산', '<span class="f">ΔH° = ΣΔH°f(생성물) − ΣΔH°f(반응물)</span> (계수 곱하기!)'],
  ['동소체', '흑연 0, 다이아몬드 +1.88 → 흑연이 더 안정 / O₂ 0, O₃ +142.7']],
  r: [['식 조립 4단계', '① 목표식 쓰기 ② 목표식 물질이 한 번만 나오는 식 찾기 ③ 같은 쪽에 오게 뒤집기 ④ 계수 맞추게 배수 → 더하기']],
  w: [['부호', '뒤집은 식의 ΔH 부호를 안 바꾸는 실수, 배수를 ΔH 에 안 곱하는 실수가 제일 많음']],
  ex: exOf('U3-03'), pr: prOf('V3-07') },
{ t: '4. 엔트로피 · 계와 주위', p: '교과서 90~93쪽', k: [
  ['엔트로피 S', '<b>무질서도</b>. 고체 < 액체 ≪ 기체. 온도 ↑ → S ↑'],
  ['ΔS 판단', '<b>기체 몰수</b>가 늘면 ΔS &gt; 0 (N₂ + 3H₂ → 2NH₃ 는 4 → 2 감소). 혼합·확산·승화(고→기) 증가 / <b>기체가 물에 녹으면 감소</b>'],
  ['계의 종류', '고립계: 물질 X 에너지 X (단열 밀폐 용기) / 닫힌계: 물질 X 에너지 O (뚜껑 닫은 컵) / 열린계: 둘 다 O'],
  ['내부 에너지', '<span class="f">ΔE = E최종 − E초기</span>. 발열이면 ΔE &lt; 0. 전체 에너지는 보존']],
  r: [['ΔS 부호', '① 상태 표시만 보기 ② (g) 계수 합 비교 (액체·고체는 빼고)']],
  w: [['닫힌계', '“물질은 교환, 에너지는 못 함” 은 <b>틀린 말</b> — 반대!']],
  ex: exOf('III2-2'), pr: prOf('V3-14') },
{ t: '5. 반응의 자발성', p: '교과서 94~95쪽', k: [
  ['자발적', '<span class="f">ΔS전체 = ΔS계 + ΔS주위 &gt; 0</span> 이면 저절로 일어남'],
  ['ΔS주위', '계가 열을 내면(발열) 주위 엔트로피 ↑ / 흡열이면 ↓'],
  ['4가지 경우', 'ΔH&lt;0·ΔS계&gt;0 <b>항상 자발</b> / ΔH&gt;0·ΔS계&lt;0 <b>항상 비자발</b> / 나머지 둘은 |ΔS계|와 |ΔS주위| 크기로 결정'],
  ['예', '물의 기화·냉각 팩: 흡열인데 자발 (ΔS계가 더 큼) / 수증기 승화(서리): 발열, ΔS계 &lt; 0 인데 자발']],
  r: [['자발성 보기', '① ΔH 부호 (값·도표·주위 온도) ② ΔS계 부호 (기체 몰수) ③ 4칸 표에 넣기 → “항상” 이라는 말 체크']],
  w: [['속도와 무관', '“자발적 반응은 빠르다” = 틀림. 자발성은 방향, 속도는 따로']],
  ex: exOf('U3-05'), pr: prOf('V3-19') },
{ t: '6. 반응 속도 · 반응 속도식', p: '교과서 104~109쪽', k: [
  ['반응 속도', '<span class="f">v = 농도 변화 ÷ 시간</span> (M/s). 반응물은 (−) 붙여 양수로. 기체 반응은 압력·부피·질량으로도 측정 (Mg + HCl)'],
  ['계수비', '계수비 = 속도비. N₂O₄ → 2NO₂ 이면 NO₂ 생성 속도가 2배'],
  ['평균 / 순간', '평균 = 할선 기울기, 순간 = 접선 기울기, t = 0 접선 = <b>초기 반응 속도</b> (가장 빠름)'],
  ['속도식', '<span class="f">v = k[A]ᵐ[B]ⁿ</span>. 차수 m, n 은 <b>실험으로</b> (계수 X). 전체 차수 = m + n'],
  ['k', '농도와 무관, <b>온도·촉매</b>로만 변함. 단위: 1차 s⁻¹, 2차 M⁻¹s⁻¹, 3차 M⁻²s⁻¹']],
  r: [['차수 구하기', '① 다른 농도는 같고 하나만 바뀐 두 실험 찾기 ② 농도 2배일 때 속도 2배 → 1차, 4배 → 2차, 그대로 → 0차 ③ 한 실험 값 넣어 k']],
  w: [['계수 ≠ 차수', '2NO + 2H₂ 반응: H₂ 계수는 2인데 차수는 1 (실험값)']],
  ex: exOf('IV1-k2'), pr: prOf('V4-05') },
{ t: '7. 1차 반응 · 반감기', p: '교과서 110~111쪽', k: [
  ['반감기', '반응물 농도가 <b>절반</b>이 되는 시간'],
  ['1차 반응', 'v = k[A]. <b>반감기가 초기 농도와 관계없이 일정</b> (N₂O₅ 분해, H₂O₂ 분해)'],
  ['계산', 'n번 반감기 후 농도 = 처음 × <span class="f">(½)ⁿ</span>. 생성물은 줄어든 만큼 (계수비)'],
  ['탄소 연대', '¹⁴C 반감기 <b>5730년</b> (¹⁴N 으로 붕괴). 1/8 남음 = 3번 → 17190년']],
  r: [['그래프 문제', '① 절반 되는 시간을 두 번 재서 같으면 1차 ② 지난 시간 ÷ 반감기 = n ③ (½)ⁿ']],
  w: [['속도는 일정 X', '1차 반응은 <b>반감기</b>가 일정한 거지 속도가 일정한 게 아님 (농도 ↓ → 속도 ↓)']],
  ex: exOf('IV1-k3'), pr: prOf('V4-03') },
{ t: '8. 활성화 에너지 · 농도 · 온도', p: '교과서 112~119쪽', k: [
  ['유효 충돌', '방향이 맞고 + 에너지가 <b>활성화 에너지(Eₐ) 이상</b>인 충돌'],
  ['에너지 도표', 'Eₐ(정) = 꼭대기 − 반응물, Eₐ(역) = 꼭대기 − 생성물, <span class="f">ΔH = Eₐ정 − Eₐ역</span>. 활성화물은 불안정'],
  ['농도·압력·표면적', '충돌수 ↑ → 속도 ↑ (<b>Eₐ, k 그대로</b>). 최종 생성량은 반응물 양으로 결정'],
  ['온도', '분포 곡선이 낮고 넓게 → Eₐ 이상 분자 ↑ → k ↑, 반감기 ↓ (<b>Eₐ 그대로</b>). 10 °C ↑ → 속도 약 2배, 충돌수는 2%만'],
  ['생활 예', '농도: 고압 산소 치료·아세틸렌 용접·밀폐 용기 / 표면적: 가루약·밀가루 공장 폭발 / 온도: 압력밥솥·냉장고·저온 숙성 빵']],
  r: [['어느 쪽이 고온?', '빨리 줄어드는(반감기 짧은) 쪽 / 분포 곡선이 낮고 넓은 쪽']],
  w: [['압력밥솥', '촉매가 아니라 <b>온도</b> (끓는점 ↑) 효과']],
  ex: exOf('IV1-k4'), pr: prOf('V4-22') },
{ t: '9. 촉매', p: '교과서 120~123쪽', k: [
  ['촉매', '자신은 소모되지 않고 반응 속도만 바꿈. 반응식 <b>화살표 위</b>에 표시'],
  ['정촉매 / 부촉매', '정촉매: Eₐ ↓ (<b>정·역 둘 다</b>) → k ↑ (KI, MnO₂) / 부촉매: Eₐ ↑ (약국 과산화 수소수의 인산)'],
  ['안 바뀌는 것', '<b>ΔH</b>, 반응물·생성물 에너지, 최종 생성량'],
  ['환경', '촉매 변환기 (Pt·Rh·Pd, 2NO + 2CO → N₂ + 2CO₂) · TiO₂ 광촉매 · 효소(생체 촉매, 식혜)'],
  ['KI 원리', 'I⁻ 가 1단계에서 쓰이고 2단계에서 다시 생김 → 전체 식에 안 나옴']],
  r: [['촉매 보기', '“ΔH 가 감소/증가” 는 무조건 틀림 / 도표에서 꼭대기만 낮아졌으면 정촉매']],
  w: [['오존 분해 촉매', 'Cl + O₃ → ClO + O₂, ClO + O → Cl + O₂ 에서 촉매는 <b>Cl</b> (ClO 는 중간 생성물)']],
  ex: { s: `[${Q['IV2-c1'].src}]`, q: img('IV2-c1'), st: [['정촉매가 바꾸는 것', '활성화 에너지 ↓ (새로운 경로)', '정반응·역반응 모두'], ['그러면', 'Eₐ 이상 에너지를 가진 분자 비율 ↑ → 반응 속도 ↑', ''], ['안 바뀌는 것', 'ΔH, 분자 운동 에너지 분포 (온도가 같으므로)', '']], a: Q['IV2-c1'].o[Q['IV2-c1'].a] },
  pr: prOf('V4-24') },
];
CH.forEach((c, i) => { c.fig = FIG.CHEM[i + 1] && FIG.CHEM[i + 1](); });
const ansOf = id => { const P = Q[id]; if (P.type === 'bogi') return `<b>${P.ans}</b> ${P.items.map(([l, , v, w]) => `${l}. ${v ? '⭕' : '❌'} ${w}`).join(' ')}`; if (P.type === 'mc') return `<b>${P.o[P.a]}</b> ${P.ex || ''}`; return `<b>${P.ans}</b>`; };
const OXPICK = [ 'LNG의 주성분은', 'N₂(g) + 2O₂(g) → 2NO₂(g)는', '냉각 팩은', '1 g당 연소열이 가장 작은', '결합 에너지로 구한 ΔH = (생성물', 'O₂(g)와 O₃(g)의', '에타인(C₂H₂)과', '닫힌계는', '기체가 물에 녹는', '자발적 반응은 반응 속도가', '반응 차수는 화학', '반응 속도 상수 k는', '1차 반응인 N₂O₅', 'A 2개, B 3개', '온도를 10 °C 높이면', '온도가 높아지면 활성화 에너지가', '압력밥솥에서', '정촉매를 사용하면 정반응의', '오존 분해 Cl', '그린 수소는' ];
const NS = window.CHEMNAESIN, OX = OXPICK.map(s => NS.find(x => x[1].startsWith(s))).filter(Boolean);
const chemBody = `<h1>화학 1시간 자습 프린트</h1>
<p>범위: 교과서 72쪽~끝 + 학습지 — Ⅲ 화학 변화의 자발성 · Ⅳ 반응 속도</p>
<table class="tt"><tr><th>단원마다 5분 (×9)</th><td>① <b>개념</b> 표 읽기 (쉬운 말) → ② <b>이런 문제는 이렇게</b> → ③ <b>예제 따라 풀기</b>: 답 가리고 한 줄씩 → ④ <b>직접 풀기</b> 1문제 (사진 문제, 풀기 전에 “무슨 반응?” 한 줄)</td></tr>
<tr><th>45~52분</th><td>⑤ <b>내신 디테일 O/X 20</b> (교과서 구석 숫자·물질 이름·함정 문장)</td></tr>
<tr><th>마지막 8분</th><td>채점 (맨 뒤). 틀린 단원은 “헷갈리는 것”만 다시 읽기</td></tr></table>
<div class="box">자주 쓰는 공식: ΔH = H생 − H반 · Q = cmΔt · 결합 에너지 ΔH = 반응물 − 생성물 · ΔH° = ΣΔH°f(생) − ΣΔH°f(반) · ΔS전체 = ΔS계 + ΔS주위 · v = k[A]ᵐ[B]ⁿ · (½)ⁿ · ΔH = Eₐ정 − Eₐ역</div>
${CH.map((c, i) => chap(c, i + 1)).join('')}
<div class="part"><h2>⑤ 내신 디테일 O/X 20 <small>괄호에 O/X, 틀린 문장은 밑줄 긋고 고치기</small></h2><ol class="ox">${OX.map(([pg, st]) => `<li><span class="b">(   )</span> ${st} <span class="src">${pg}쪽</span></li>`).join('')}</ol></div>
<div class="ans" style="margin-top:4mm"><h2>정답 · 풀이</h2>${CH.map((c, i) => `<p><b>직접 풀기 ${i + 1}.</b> ${ansOf(Object.keys(Q).find(k => c.pr.s === `[${Q[k].src}]` && c.pr.q.includes(Q[k].img)))}</p>`).join('')}
<p><b>O/X</b> ${OX.map(([, , tr, why], i) => `${i + 1}. <b>${tr ? 'O' : 'X'}</b>${tr ? '' : ` (${why})`}`).join(' / ')}</p></div>
<div class="box" style="margin-top:4mm">더 풀고 싶으면: <b>chem_print.html</b> (실전 사진 문제 45개 · 빈칸 48 · 내신 O/X 107) / 게임 메뉴 🎯 내신 디테일 O/X</div>`;
fs.writeFileSync(path.join(ROOT, 'chem_1h.html'), page('화학 1시간 자습 프린트', chemBody).replace('</style>', '.qimg{max-height:46mm;max-width:118mm}.ex{break-inside:auto}.pr .work{height:24mm}.chap{margin-bottom:2mm}</style>'));
console.log('calc', CAL.length, 'chem', CH.length, 'ox', OX.length);
