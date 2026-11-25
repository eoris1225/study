'use strict';
/* 미적분1 시험 범위 0부터 자습 프린트 — calc_print.html
   표지·계획 → 개념(설명·공식·예제) + 연습 문제 → 학교 평가 문제(공유 드라이브) → 정답 */
(() => {
const D = window.CALCDRILL, LS = window.CALCLESSON, SC = window.CALCSCHOOL;
const SETS = [
  ['mid22', '중단원 평가 Ⅱ-2 도함수의 활용', 4, '01~07번은 시험 범위 아님 (접선의 방정식·롤의 정리·평균값 정리) → <b>08~24번</b>만 풀기'],
  ['big2', '대단원 평가 Ⅱ 미분', 4, '범위: <b>11, 13~18, 21, 23, 24번</b> (01~10, 19, 20은 미분계수·접선·평균값 정리라 제외 / 12, 22는 접선이 섞여 있어 선택)'],
  ['mid31', '중단원 평가 Ⅲ-1 부정적분과 정적분', 4, '전부 범위'],
  ['mid32', '중단원 평가 Ⅲ-2 정적분의 활용', 4, '전부 범위'],
  ['big3', '대단원 평가 Ⅲ 적분', 4, '전부 범위'],
];
const ANS = { mid22: [5, 8], big2: [5, 7], mid31: [5, 8], mid32: [5, 8], big3: [5, 9] };
const NUM = '①②③④⑤⑥⑦⑧⑨⑩';

function cover() {
  return `<header class="top"><div><h1>미적분1 시험 범위 · 0부터 자습 프린트</h1>
  <p class="sub">교과서 87쪽~끝 · Ⅱ-2 도함수의 활용(03 증가·감소, 극대·극소 / 04 그래프 / 05 방정식·부등식 / 06 속도·가속도) · Ⅲ 적분(부정적분·정적분 / 넓이 / 속도와 거리) · 공유 드라이브 평가 문제</p>
  <p>이름 <span class="ln"></span> 날짜 <span class="ln"></span></p></div>
  <div class="btns"><button class="np" onclick="print()">인쇄하기</button></div></header>
  <section class="pg"><h2>이렇게 써</h2><div class="two">
  <div class="bx"><h4>회차 계획 (한 회 60분)</h4><ul class="plan">
   <li><span class="b2"></span><b>1회</b> 0 미분 기계 → 1 증가·감소 → 2 극대·극소</li>
   <li><span class="b2"></span><b>2회</b> 3 최대·최소 → 4 방정식·부등식 → 5 속도·가속도</li>
   <li><span class="b2"></span><b>3회</b> 학교 평가 Ⅱ-2 (08~24) + 대단원 Ⅱ 범위 문제</li>
   <li><span class="b2"></span><b>4회</b> 6 부정적분 → 7 정적분</li>
   <li><span class="b2"></span><b>5회</b> 8 넓이 → 9 속도와 거리</li>
   <li><span class="b2"></span><b>6~7회</b> 학교 평가 Ⅲ-1, Ⅲ-2, 대단원 Ⅲ</li></ul></div>
  <div class="bx"><h4>한 단원 공부 순서</h4><ol>
   <li><b>왜?</b> 한 줄 읽기 → <b>핵심</b> 상자 소리 내 읽기</li>
   <li><b>예제</b>는 풀이를 가리고 한 줄씩 따라 쓰기</li>
   <li><b>연습</b> 문제 풀기 → 뒤 정답으로 바로 채점</li>
   <li>틀리면 핵심 상자 다시 → 같은 문제 한 번 더</li>
   <li>마지막에 <b>학교 문제</b> 번호 풀기 (이 단원 개념 쓰는 문제)</li></ol>
   <p class="tip">기호: $f'(x)$ = 에프 프라임 엑스(도함수), $\\int$ = 인테그럴(적분), $\\frac{D}{4}$ = 판별식/4 ($b'^2-ac$)</p></div></div></section>`;
}
function lesson(s, i) { const L = LS[s.key] || {}, sc = SC[s.key];
  return `<section class="pg"><h2><em>${s.title.split('.')[0]}</em>${s.title.replace(/^\d+\.\s*/, '')}</h2>
  ${L.why ? `<p class="why">💡 ${L.why}</p>` : ''}
  ${L.box ? `<div class="core"><h4>핵심</h4><ul>${L.box.map(b => `<li>${b}</li>`).join('')}</ul></div>` : ''}
  ${(L.ex || []).map(([q, st], j) => `<div class="ex"><h5>예제 ${j + 1}. ${q}</h5><ol>${st.map(x => `<li>${x}</li>`).join('')}</ol></div>`).join('')}
  <h4 class="pr">연습 ${s.items.length}문제 <small>정답은 맨 뒤</small></h4>
  <ol class="dr">${s.items.map(it => `<li>$${it.q}$<div class="wl"></div></li>`).join('')}</ol>
  ${sc ? `<p class="sch">📌 이 개념을 쓰는 학교 문제: ${sc}</p>` : ''}</section>`; }
function school() {
  return SETS.map(([id, t, n, note]) => `<section class="pg sheet"><h2><em>학교</em>${t}</h2><p class="note">${note}</p>${Array.from({ length: n }, (_, p) => `<img src="img/calc/${id}-${p + 1}.jpg" alt="${t} ${p + 1}쪽">`).join('')}</section>`).join(''); }
function key() {
  return `<section class="pg key"><h2>정답 · 풀이 (연습 문제)</h2>${D.map(s => `<h3>${s.title}</h3><ol class="ka">${s.items.map(it => `<li><b>$${it.a}$</b>${it.s ? `<div class="sl">$${it.s}$</div>` : ''}</li>`).join('')}</ol>`).join('')}</section>
  ${SETS.map(([id, t]) => { const [a, b] = ANS[id]; return `<section class="pg sheet"><h2><em>정답</em>${t} 정답 및 해설</h2>${Array.from({ length: b - a + 1 }, (_, p) => `<img src="img/calc/${id}-${a + p}.jpg" alt="${t} 해설">`).join('')}</section>`; }).join('')}`; }
/* 수식 안의 < > 는 HTML 태그로 읽히지 않게 \lt \gt 로 */
const fixLt = h => h.replace(/\$([^$]+)\$/g, (m, x) => '$' + x.replace(/</g, '\\lt ').replace(/>/g, '\\gt ') + '$');
document.getElementById('app').innerHTML = fixLt(cover() + D.map(lesson).join('') + school() + key());
const go = () => window.renderMathInElement(document.body, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
if (window.renderMathInElement) go(); else addEventListener('load', go);
})();
