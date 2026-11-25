'use strict';
/* 화학 1시간 자습 프린트 — chem_print.html
   ① 공식·판단표 한 장  ② 문제풀이 개념(무슨 반응? 순서·함정) 요약  ③ 빈칸 30  ④ 실전 문제 12(사진)  ⑤ 정답·풀이 */
(() => {
const SV = window.CHEMSOLVE, Q = window.CHEMQ;
const SECS = []; for (const u of window.CHEM) for (const c of u.ch) for (const s of c.secs) SECS.push({ u: u.id, s });
const strip = h => String(h).replace(/<(?!\/?(b|sub|sup|i)\b)[^>]*>/g, '');
let seed = Date.now() % 99991;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const shuf = a => a.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

/* ① 공식·판단표 */
const FORM = `<section class="pg"><h2><em>①</em> 공식 · 판단표 한 장 <small>먼저 소리 내서 한 번 읽고, 시험 직전에 이 쪽만 다시 보기</small></h2>
<div class="two">
<div class="bx"><h4>Ⅲ 엔탈피</h4><ul>
<li>ΔH = H<sub>생성물</sub> − H<sub>반응물</sub> → <b>발열 ΔH &lt; 0</b> (주위 온도 ↑, 생성물 안정) / <b>흡열 ΔH &gt; 0</b></li>
<li>열화학 반응식: <b>상태 표시 필수</b>, 계수 n배 → ΔH n배, 뒤집으면 <b>부호만 반대</b></li>
<li>몰 = 질량 ÷ 화학식량 → 1 g당 연소열 = (mol당) ÷ 화학식량 (H₂가 최고)</li>
<li>Q = c × m × Δt (간이 열량계, 열 손실 큼)</li>
<li><b>결합 에너지</b>: ΔH ≈ Σ(반응물 결합) − Σ(생성물 결합) ← <b>반응물 먼저!</b></li>
<li><b>생성 엔탈피</b>: ΔH° = ΣΔH°f(생성물) − ΣΔH°f(반응물) ← <b>생성물 먼저!</b>, 가장 안정한 원소 = 0</li>
<li>분해열 = 생성열과 크기 같고 부호 반대 (1 mol 기준 확인)</li>
<li><b>헤스 법칙</b>: 경로와 무관 → 식 뒤집기·배수·더하기, ΔH도 똑같이</li>
</ul></div>
<div class="bx"><h4>Ⅲ 엔트로피 · 자발성</h4><ul>
<li>S<sub>고체</sub> &lt; S<sub>액체</sub> ≪ S<sub>기체</sub>, 기체 몰수 ↑ → ΔS &gt; 0, 기체 용해 ΔS &lt; 0</li>
<li>고립계(물질 X 에너지 X) · 닫힌계(물질 X 에너지 O) · 열린계(둘 다 O)</li>
<li>ΔS<sub>전체</sub> = ΔS<sub>계</sub> + ΔS<sub>주위</sub> &gt; 0 이면 자발적</li>
<li>발열 → ΔS<sub>주위</sub> &gt; 0, 흡열 → ΔS<sub>주위</sub> &lt; 0</li>
</ul>
<table class="mini"><tr><th>ΔH</th><th>ΔS<sub>계</sub></th><th>자발성</th></tr>
<tr><td>&lt; 0</td><td>&gt; 0</td><td><b>항상 자발</b></td></tr><tr><td>&gt; 0</td><td>&lt; 0</td><td><b>항상 비자발</b></td></tr>
<tr><td>&lt; 0</td><td>&lt; 0</td><td>|ΔS<sub>계</sub>| &lt; |ΔS<sub>주위</sub>| 면 자발</td></tr><tr><td>&gt; 0</td><td>&gt; 0</td><td>|ΔS<sub>계</sub>| &gt; |ΔS<sub>주위</sub>| 면 자발</td></tr></table></div>
<div class="bx"><h4>Ⅳ 반응 속도</h4><ul>
<li>v = 농도 변화 ÷ 시간 (반응물은 −Δ, 생성물 +Δ), 단위 M/s</li>
<li>계수비 = 속도비: N₂O₄ → 2NO₂ 이면 v = −Δ[N₂O₄]/Δt = ½ Δ[NO₂]/Δt</li>
<li>평균 = 할선 기울기, 순간 = 접선, t = 0 접선 = 초기 반응 속도 (가장 빠름)</li>
<li><b>v = k[A]ᵐ[B]ⁿ</b>: 차수는 <b>실험으로</b> (계수 X). 2배 → 2배 1차, 4배 2차, 그대로 0차</li>
<li>k 단위: 1차 s⁻¹, 2차 M⁻¹s⁻¹, 3차 M⁻²s⁻¹ / k는 온도·촉매만 바꿈</li>
<li><b>1차 반응</b>: 반감기 일정, n번 후 = 처음 × (½)ⁿ, ¹⁴C 5730년</li>
</ul></div>
<div class="bx"><h4>Ⅳ 활성화 에너지 · 요인</h4><ul>
<li>Eₐ(정) = 꼭대기 − 반응물, Eₐ(역) = 꼭대기 − 생성물, <b>ΔH = Eₐ정 − Eₐ역</b></li>
<li>유효 충돌 = 방향 적합 + 충분한 에너지(Eₐ 이상)</li>
<li>농도·압력·표면적 ↑ → 충돌수 ↑ (Eₐ, k 그대로), 최종 생성량은 그대로</li>
<li>온도 ↑ → 분포 곡선 낮고 넓게, Eₐ 이상 분자 ↑, k ↑, 반감기 ↓ (Eₐ 그대로)</li>
<li>정촉매: 정·역 Eₐ 모두 ↓, k ↑ / 부촉매 반대 / <b>ΔH·생성량은 그대로</b></li>
</ul></div></div></section>`;

/* ② 문제풀이 개념 요약 */
function cards() { const C = SV.CARDS;
  return `<section class="pg"><h2><em>②</em> 문제 보면 먼저 "무슨 반응이지?" <small>유형별 풀이 순서와 함정 — 문제 풀다 막히면 여기로</small></h2><div class="cards">${Object.values(C).map(c => `<div class="cd"><h5>${c.t}</h5><p class="w">${strip(c.what)}</p><p><b>순서</b> ${c.how.map((x, i) => `${'①②③④⑤'[i]} ${strip(x)}`).join(' ')}</p>${c.trap && c.trap.length ? `<p class="tr"><b>함정</b> ${c.trap.map(strip).join(' / ')}</p>` : ''}</div>`).join('')}</div></section>`; }

/* ③ 빈칸 */
let BL = [];
function blanks() { const all = []; SECS.forEach(x => (x.s.blanks || []).forEach(b => all.push([x.s.t, ...b])));
  const by = {}; all.forEach(b => (by[b[0]] = by[b[0]] || []).push(b));
  BL = []; for (const k of Object.keys(by)) BL.push(...shuf(by[k]).slice(0, 3)); BL = BL.slice(0, 48);
  return `<section class="pg"><h2><em>③</em> 빈칸 ${BL.length}개 <small>보기 없이 먼저 써 보기 · 12분</small></h2><ol class="bl">${BL.map(b => `<li>${strip(b[1]).replace('___', '<span class="ln"></span>')}</li>`).join('')}</ol></section>`; }

/* ④ 실전 문제 */
const BIG = { '반응 엔탈피와 반응의 자발성': 4, '온도와 반응 속도': 3, '1차 반응의 반감기': 3, '촉매와 반응 속도': 3, '헤스 법칙과 생성 엔탈피': 3, '헤스 법칙': 3, '반응 속도식 · 반응 차수': 3, '열화학 반응식': 3 };
let PR = [];
function probs() { PR = [];
  for (const x of SECS) { const ids = (x.s.probs || []).filter(id => Q[id] && Q[id].img); if (!ids.length) continue;
    const pref = shuf(ids.filter(id => /^(V|U)/.test(id))), rest = shuf(ids.filter(id => !/^(V|U)/.test(id)));
    [...pref, ...rest].slice(0, BIG[x.s.t] || 2).forEach(id => PR.push([x.s.t, id])); }
  return `<section class="pg"><h2><em>④</em> 실전 문제 ${PR.length}개 <small>사진 문제 · 단원 순서 · 풀기 전에 "무슨 반응?" 한 줄 · 시간 남으면 끝까지</small></h2><div class="pqs">${PR.map(([t, id], i) => { const P = Q[id];
    return `<div class="pq"><div class="ph"><b>${i + 1}</b><span>${P.src}</span><i>무슨 반응? <span class="ln w"></span></i></div><img src="img/chem/${P.img}.jpg" alt="${P.src}">${P.type === 'steps' ? `<p class="sm">답을 쓰고 풀이 과정을 적어 보기</p>` : ''}<div class="ans-ln">답 <span class="ln"></span></div></div>`; }).join('')}</div></section>`; }

/* ⑤ 정답 */
function key() { const ans = P => P.type === 'bogi' ? `${P.ans || ''}` : P.type === 'mc' ? P.o[P.a] : (P.ans || '');
  const why = P => P.type === 'bogi' ? P.items.map(([l, , v, w]) => `${l}. ${v ? '⭕' : '❌'} ${strip(w)}`).join(' &nbsp; ') : P.type === 'mc' ? strip(P.ex || '') : P.steps.map(([q, o, a]) => `${strip(q)} → <b>${strip(o[a])}</b>`).join('<br>');
  return `<section class="pg key"><h2>정답 · 풀이</h2><h3>③ 빈칸</h3><ol class="kb">${BL.map(b => `<li>${strip(b[2])}</li>`).join('')}</ol>
  <h3>④ 실전 문제</h3>${PR.map(([t, id], i) => { const P = Q[id], A = SV.PA[id]; return `<div class="ka"><p><b>${i + 1}. ${strip(ans(P))}</b> <small>(${P.src})</small></p>${A ? `<p class="an">무슨 반응? ${strip(A[0])}${A[1] ? ` · 먼저 볼 것: ${strip(A[1])}` : ''}${A[2] ? ` · <b>함정</b> ${strip(A[2])}` : ''}</p>` : ''}<p class="wy">${why(P)}</p></div>`; }).join('')}
  <p class="score">빈칸 <span></span> / ${BL.length} · 문제 <span></span> / ${PR.length} &nbsp; 틀린 문제는 ② 해당 카드의 "함정"을 다시 읽고, 게임 메뉴 🔁 틀린 문제로 복습</p></section>`; }

function plan() { const d = new Date();
  return `<header class="top"><div><h1>화학 Ⅲ·Ⅳ · 1시간 자습 프린트</h1><p>교과서 72쪽~끝 + 학습지 &nbsp;·&nbsp; 이름 <span class="ln"></span> &nbsp; 날짜 ${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.</p></div>
  <ul class="plan"><li><span class="bx2"></span><b>0~10분</b> ① 공식·판단표 소리 내 읽기</li><li><span class="bx2"></span><b>10~22분</b> ③ 빈칸 (보기 없이)</li><li><span class="bx2"></span><b>22~50분</b> ④ 실전 문제 (못 다 풀면 다음 시간에 이어서) — 풀기 전 "무슨 반응?" 먼저</li><li><span class="bx2"></span><b>50~60분</b> ⑤ 채점 → 틀린 유형은 ② 카드 함정 다시</li></ul>
  <div class="btns"><button class="np" onclick="print()">인쇄하기</button><button class="np" id="re">문제·빈칸 다시 섞기</button></div></header>`; }

function render() { document.getElementById('app').innerHTML = plan() + FORM + blanks() + probs() + cards() + key();
  document.getElementById('re').onclick = () => { seed = (seed * 31 + 17) % 99991; render(); scrollTo(0, 0); }; }
render();
})();
