'use strict';
/* 7장 — 정상파 */
(() => {
  const strV = v => Math.sqrt(v.T / v.mu), strF = v => v.n * strV(v) / (2 * v.l);
  function strDraw(x, v, t, W, H) {
    x.clearRect(0, 0, W, H); const L = v.l * 260, x0 = 40, mid = H / 2, A = 34, ph = Math.cos(t * 5);
    x.fillStyle = '#8a8198'; x.fillRect(x0 - 6, mid - 40, 6, 80); x.fillRect(x0 + L, mid - 40, 6, 80);
    [[ph, '#e2552b', 2.5], [-ph, 'rgba(226,85,43,.3)', 1]].forEach(([p, col, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); for (let i = 0; i <= 100; i++) { const X = x0 + L * i / 100, y = mid - A * p * Math.sin(v.n * Math.PI * i / 100); i ? x.lineTo(X, y) : x.moveTo(X, y); } x.stroke(); });
    for (let i = 0; i <= v.n; i++) { txt(x, '마디', x0 + L * i / v.n, mid + 58, '#7fb2ff', '11px serif', 'center'); if (i < v.n) txt(x, '배', x0 + L * (i + .5) / v.n, mid - 46, '#ffd166', '11px serif', 'center'); }
    txt(x, `${v.n === 1 ? '기본' : v.n + '배'} 진동 · λ = 2l/n = ${fmt(2 * v.l / v.n, 3)} m · 줄의 길이 l = ${v.l} m`, 40, 18, '#cfc6dd', '13px serif');
  }
  const pipeOK = v => v.ty === 0 || v.n % 2 === 1, pipeF = v => pipeOK(v) ? (v.ty === 0 ? v.n * 340 / (2 * v.l) : v.n * 340 / (4 * v.l)) : -1;
  function pipeDraw(x, v, t, W, H) {
    x.clearRect(0, 0, W, H); const L = v.l * 520, x0 = 50, mid = H / 2, A = 30, ph = Math.cos(t * 5);
    x.strokeStyle = '#8a8198'; x.lineWidth = 4; x.beginPath(); x.moveTo(x0, mid - 36); x.lineTo(x0 + L, mid - 36); x.moveTo(x0, mid + 36); x.lineTo(x0 + L, mid + 36); if (v.ty === 1) { x.moveTo(x0 + L, mid - 36); x.lineTo(x0 + L, mid + 36); } x.stroke();
    if (!pipeOK(v)) { txt(x, '✖ 한쪽이 막힌 관에는 짝수 배 진동이 없다 (n = 1, 3, 5, …)', 50, 20, '#ff6b6b', '14px serif'); return; }
    const env = s => v.ty === 0 ? Math.cos(v.n * Math.PI * s) : Math.cos(v.n * Math.PI * s / 2);
    [ph, -ph].forEach((p, j) => { x.strokeStyle = j ? 'rgba(226,85,43,.35)' : '#e2552b'; x.lineWidth = j ? 1 : 2.5; x.beginPath(); for (let i = 0; i <= 100; i++) { const X = x0 + L * i / 100, y = mid - A * p * env(i / 100); i ? x.lineTo(X, y) : x.moveTo(X, y); } x.stroke(); });
    txt(x, `${v.ty === 0 ? '양쪽이 열린 관: λ = 2l/n' : '한쪽이 막힌 관: λ = 4l/n'} = ${fmt((v.ty === 0 ? 2 : 4) * v.l / v.n, 3)} m · 열린 끝 = 배, 막힌 끝 = 마디`, 50, 20, '#cfc6dd', '13px serif');
  }
  const loud = (y, lam) => { let best = 0; for (let k = 0; k < 6; k++) { const d = (y - (2 * k + 1) * lam / 4) / 1.5; best = Math.max(best, 1 / (1 + d * d)); } return best; };
  function tubeDraw(fq, vel) {
    return (x, v, t, W, H) => {
      x.clearRect(0, 0, W, H); const lam = vel / fq * 100, top = 30, sc = 2.6, yw = top + v.y * sc, ld = loud(v.y, lam);
      x.strokeStyle = '#8a8198'; x.lineWidth = 3; x.beginPath(); x.moveTo(280, top); x.lineTo(280, H - 6); x.moveTo(340, top); x.lineTo(340, H - 6); x.stroke();
      x.fillStyle = '#1d4a6b'; x.fillRect(282, yw, 56, H - 6 - yw); txt(x, `수면까지의 깊이 ${fmt(v.y)} cm`, 350, yw + 4, '#bfe3ff', '13px serif');
      txt(x, `🔔 ${fq} Hz`, 310, 20, '#ffd166', '14px serif', 'center');
      if (ld > .5) { const n = Math.round((v.y / (lam / 4) - 1) / 2) * 2 + 1, ph = Math.cos(t * 6); x.strokeStyle = `rgba(226,85,43,${ld})`; x.lineWidth = 2;[ph, -ph].forEach(p => { x.beginPath(); for (let i = 0; i <= 60; i++) { const yy = top + (yw - top) * i / 60, dx = 24 * p * Math.cos(n * Math.PI / 2 * i / 60); i ? x.lineTo(310 + dx, yy) : x.moveTo(310 + dx, yy); } x.stroke(); }); }
      txt(x, '소리의 세기', 40, 60, '#cfc6dd', '13px serif'); x.fillStyle = '#241e30'; x.fillRect(40, 70, 30, 150); x.fillStyle = ld > .94 ? '#6fe3a1' : '#d9b25f'; x.fillRect(40, 220 - 150 * ld, 30, 150 * ld); if (ld > .94) txt(x, '공명!', 80, 90, '#6fe3a1', 'bold 16px serif');
    };
  }
  const tubeVars = [{ id: 'y', label: '수면 내리기', min: 2, max: 80, step: .25, init: 2, unit: 'cm' }];
  G.chapters.push({
    title: '7장 · 대지의 현 — 정상파', trait: 'wave', glow: '#3a2a12',
    notes: `
<h3>1. 정상파</h3>
<b>정상파</b>: 같은 매질에서 진동수와 진폭이 같은 두 파동이 서로 반대 방향으로 진행하여 중첩된 결과 파동이 더 이상 진행하지 않고, 매질이 제자리에서 진동하는 것처럼 보이는 파동. <b>[보충] 진행파</b>: 파원에서부터 발생하여 매질 속을 진행하는 파동
<ul><li>(1) <b>마디</b>: 상쇄 간섭이 일어나 진폭이 0이 되는 점</li><li>(2) <b>배</b>: 보강 간섭이 일어나 진폭이 최대인 점</li><li>(3) 인접한 배 또는 마디의 간격 = <b>λ/2</b> (λ: 파장) — 배와 이웃한 마디 사이는 λ/4</li></ul>
<h3>2. 악기가 만드는 정상파</h3>
<h4>(1) 현악기 (양 끝 고정 = 양 끝이 마디)</h4>
기본 진동(λ₁ = 2l): f₁ = v/λ₁ = v/2l · 2배 진동(λ₂ = l): f₂ = v/l = 2f₁ · 3배 진동(λ₃ = (2/3)l): f₃ = 3v/2l = 3f₁
<div class="fm">λ<sub>n</sub> = 2l/n , f<sub>n</sub> = v/λ<sub>n</sub> = (v/2l)·n &nbsp; (n = 1, 2, 3, …)</div>
<b>[보충] 배진동</b>: 물체가 진동할 때 진동수가 기본 진동수의 정수배가 되는 진동.<br><b>[보충] 줄에서 파동의 속력</b>: 줄의 장력을 T, 줄의 (선)밀도를 μ라 하면 <b>v = √(T/μ)</b>
<h4>(2) 양쪽이 열린 관악기 (양 끝이 배)</h4>
기본 진동(λ₁ = 2l): f₁ = v/2l · 2배 진동(λ₂ = l): f₂ = 2f₁ · 3배 진동(λ₃ = (2/3)l): f₃ = 3f₁
<div class="fm">λ<sub>n</sub> = 2l/n , f<sub>n</sub> = (v/2l)·n &nbsp; (n = 1, 2, 3, …)</div>
<h4>(3) 한쪽이 막힌 관악기 (열린 끝이 배, 막힌 끝이 마디)</h4>
기본 진동(λ₁ = 4l): f₁ = v/4l · 3배 진동(λ₃ = (4/3)l): f₃ = 3v/4l = 3f₁ · 5배 진동(λ₅ = (4/5)l): f₅ = 5v/4l = 5f₁
<div class="fm">λ<sub>n</sub> = 4l/n , f<sub>n</sub> = (v/4l)·n &nbsp; (n = 1, 3, 5, …) — 홀수 배 진동만!</div>
<div class="ex"><b>예제 01</b> 한쪽이 막힌 관의 길이가 0.5 m일 때 3배 진동 정상파의 고유 진동수는? (음속 340 m/s)<br>파장 = 4×0.5/3 = 2/3 m, f₃ = 340 / (2/3) = <b>510 Hz</b></div>
<h3>3. 악기의 공명</h3>
<ul><li>(1) <b>공명</b>: 외부에서 주기적인 힘을 가하여 그 결과로 생긴 파동이 물질의 고유 진동수와 일치하면 큰 진폭의 파동을 얻을 수 있다. 이러한 현상을 공명이라 하고, 이때의 진동수를 <b>공명 진동수</b>라 한다.</li>
<li>관악기에서의 공명: 악기의 고유 진동수와 동일한 진동을 악기에 가하면 보강 간섭으로 인해 파동의 진폭이 커진다.</li>
<li><b>[보충] 고유 진동수</b>: 외부의 진동과 공진하는 물체의 진동수. 눈에 보이는 큰 물체일수록 작은 고유 진동수를 가지고, 물질을 이루는 작은 분자는 큰 고유 진동수를 가진다. 예) 물 분자의 고유 진동수: 300 MHz</li></ul>
<h4>(2) 한쪽 끝이 막힌 관에서 음파의 속력 계산</h4>
측정 원리: 관의 길이가 특정 조건을 만족할 때 발생하는 두 파동의 간섭(공명 현상)을 이용. 관 속에서 공명이 일어나는 이웃한 두 위치를 y<sub>n</sub>, y<sub>n+1</sub>이라 할 때, 두 위치의 거리 차는 반 파장에 해당한다. (첫 공명 깊이 = λ/4, 이후 λ/2 간격)
<div class="fm">λ = 2(y<sub>n+1</sub> − y<sub>n</sub>) , v = λf = 2f(y<sub>n+1</sub> − y<sub>n</sub>)</div>
<div class="ex"><b>예제 02</b> 유리관의 수면을 점점 내리면서 진동수 680 Hz의 소리굽쇠로 공기 기둥의 공명을 관찰. 처음으로 소리가 가장 잘 들리는 순간 수면까지의 깊이는? (음속 340 m/s)<br>깊이 = 파장의 1/4 = (340/680) × (1/4) = 1/8 m = <b>12.5 cm</b></div>
<h4>교과서 탐구 NOTE — 정상파를 이용한 음파의 진행 속력 측정하기</h4>
준비물: 공기 기둥 공명 장치, 소리 발생기, 스마트 기기, 소리 측정 앱. 과정: ① 공명 장치에 물을 채우고 물통을 위아래로 움직여 수면을 조절 ② 640 Hz의 소리 발생 ③ 소리 측정 앱으로 세기 측정 ④ 물통을 내리면서 소리가 가장 크게 들리는 수면의 위치 y₁(첫 번째 공명 지점), y₂, y₃ 표시 ⑤ 3회 반복하여 파장의 평균값과 음파의 진행 속력 계산
<table><tr><th>실험 횟수</th><th>y₁(m)</th><th>y₂(m)</th><th>y₃(m)</th><th>파장의 평균값(m)</th></tr><tr><td>1</td><td>0.13</td><td>0.40</td><td>0.67</td><td>0.54</td></tr><tr><td>2</td><td>0.12</td><td>0.39</td><td>0.65</td><td>0.53</td></tr><tr><td>3</td><td>0.13</td><td>0.38</td><td>0.66</td><td>0.53</td></tr></table>
<b>[보충] 파장의 평균값</b>: λ<sub>평균</sub> = [2(y₃ − y₂) + 2(y₂ − y₁)] / 2 = y₃ − y₁<br>
➡ 파장의 평균값은 0.53 m, 음파의 진행 속력은 640 Hz × 0.53 m = <b>339.2 m/s</b>. 한쪽이 막힌 관에서는 특정 위치에서 두 파동의 간섭으로 공명이 일어나며, λ = 2(y<sub>n+1</sub> − y<sub>n</sub>), v = 2f(y<sub>n+1</sub> − y<sub>n</sub>).`,
    steps: [
      N('세계의 중심, <b>현의 무덤</b>. 끊어진 ‘대지의 현’이 하늘과 땅 사이에 축 늘어져 있다.', '🪕'),
      say('resona', '현을 다시 울리려면 <b>정상파</b>를 알아야 해요. 진동수와 진폭이 같은 두 파동이 서로 반대로 달려 겹치면, 파동은 더 이상 나아가지 않고 제자리에서 진동하는 것처럼 보여요.'),
      game('forge', '정상파의 문법', {
        brief: '현의 무덤 비석을 복원하라.', formula: '마디–마디 = 배–배 = λ/2', lesson: '정상파: 진동수·진폭이 같은 두 파동이 반대 방향으로 진행해 중첩. 마디 = 상쇄 간섭, 진폭 0. 배 = 보강 간섭, 진폭 최대. 인접한 마디(배) 간격 = λ/2.',
        cfg: { steps: [
          { problem: '정상파의 조건', expr: ['같은 매질에서 ', { b: '진동수' }, '와 ', { b: '진폭' }, '이 같은 두 파동이 서로 ', { b: '반대' }, ' 방향으로 진행하여 중첩'], tiles: ['진동수', '진폭', '반대', '같은', '위상'], anyOrder: false, hint: '순서: 진동수, 진폭, 반대' },
          { problem: '마디와 배', expr: ['마디: ', { b: '상쇄' }, ' 간섭, 진폭 ', { b: '0' }, ' · 배: ', { b: '보강' }, ' 간섭, 진폭 ', { b: '최대' }], tiles: ['상쇄', '보강', '0', '최대'] },
          { problem: '인접한 마디와 마디 사이의 거리가 20 cm인 정상파를 만든 원래 파동의 파장은?', expr: ['마디 간격 = ', { b: 'λ/2' }, ' = 20 cm'], tiles: ['λ/2', 'λ', 'λ/4'], answer: 40, ansLabel: 'λ', unit: 'cm' }] }
      }),
      say('resona', '양 끝이 묶인 줄은 양 끝이 반드시 <b>마디</b>예요. 그래서 줄 길이 l 안에 반 파장이 정수 개 들어가야 하죠. λₙ = 2l/n, fₙ = n·v/2l. 그리고 줄을 달리는 파동의 속력은 v = √(T/μ) — 장력이 셀수록, 줄이 가벼울수록 빨라요.'),
      game('tuner', '현악기 조율 — fₙ = n·v/2l, v = √(T/μ)', {
        brief: '장력 T, 선밀도 μ, 줄의 길이 l, 배진동 차수 n을 조절해 목표 음을 내라. 마디와 배의 개수를 눈으로 확인하라.', formula: 'λ<sub>n</sub> = 2l/n · f<sub>n</sub> = v/λ<sub>n</sub> = (v/2l)n · v = √(T/μ)', lesson: '현(양 끝 마디): λₙ = 2l/n, fₙ = (v/2l)n (n = 1, 2, 3…). 기본 λ₁ = 2l, 2배 λ₂ = l, 3배 λ₃ = 2l/3. 줄의 파동 속력 v = √(T/μ).',
        cfg: { formula: 'f<sub>n</sub> = (n/2l)·√(T/μ)', h: 190, draw: strDraw,
          vars: [{ id: 'T', label: '장력 T', min: 25, max: 400, step: 25, init: 25, unit: 'N' }, { id: 'mu', label: '선밀도 μ', min: .01, max: .04, step: .01, init: .04, unit: 'kg/m' }, { id: 'l', label: '줄의 길이 l', min: .5, max: 2, step: .25, init: 2, unit: 'm' }, { id: 'n', label: '배진동 n', min: 1, max: 5, step: 1, init: 1, unit: '배' }],
          outs: [{ label: 'v = √(T/μ)', f: strV, unit: 'm/s' }, { label: 'λₙ', f: v => 2 * v.l / v.n, unit: 'm', d: 3 }, { label: 'fₙ', f: strF, unit: 'Hz' }],
          rounds: [{ text: '길이 1 m의 줄에서 파동의 속력 100 m/s, 기본 진동수 f₁ = 50 Hz', goals: [{ label: 'l', f: v => v.l, target: 1, tol: 0 }, { label: 'n', f: v => v.n, target: 1, tol: 0 }, { label: 'f', f: strF, target: 50, tol: .01, unit: 'Hz' }] },
          { text: '같은 줄로 3배 진동 (f₃ = 3f₁ = 150 Hz, λ₃ = 2l/3)', goals: [{ label: 'l', f: v => v.l, target: 1, tol: 0 }, { label: 'n', f: v => v.n, target: 3, tol: 0 }, { label: 'f', f: strF, target: 150, tol: .01, unit: 'Hz' }] },
          { text: '기본 진동으로 돌아가, 장력만 바꿔 100 Hz를 내라 (v가 2배 → T는 몇 배?)', goals: [{ label: 'n', f: v => v.n, target: 1, tol: 0 }, { label: 'l', f: v => v.l, target: 1, tol: 0 }, { label: 'μ', f: v => v.mu, target: .01, tol: .0001, d: 2 }, { label: 'f', f: strF, target: 100, tol: .01, unit: 'Hz' }] }] },
        win: '속력을 2배로 하려면 장력은 4배. 대지의 현 한 가닥이 팽팽해졌다.'
      }),
      say('ignis', '줄은 알겠어. 그럼 내 증기 파이프는? 피리 같은 관도 노래하잖아.'),
      say('resona', '관에서는 <b>열린 끝이 배, 막힌 끝이 마디</b>예요. 양쪽이 열리면 줄과 같은 식(λₙ = 2l/n), 한쪽이 막히면 λₙ = 4l/n 인데 n은 <b>홀수만</b> 가능해요!'),
      game('tuner', '관악기 조율 — 열린 관과 막힌 관', {
        brief: '관의 종류, 길이, 배진동 차수를 조절하라. (음속 340 m/s) 한쪽이 막힌 관에서 짝수 n을 넣으면 어떻게 되는지도 확인해 보라.', formula: '양쪽 열린 관: λ<sub>n</sub> = 2l/n, f<sub>n</sub> = (v/2l)n (n=1,2,3…) · 한쪽 막힌 관: λ<sub>n</sub> = 4l/n, f<sub>n</sub> = (v/4l)n (n=1,3,5…)', lesson: '양쪽 열린 관: 양 끝이 배, fₙ = (v/2l)n. 한쪽 막힌 관: 열린 끝 배·막힌 끝 마디, λ₁ = 4l, fₙ = (v/4l)n, n은 홀수만. 예제 01: 0.5 m 막힌 관 3배 진동 = 510 Hz.',
        cfg: { formula: '열린 관 f = n·340/2l · 막힌 관 f = n·340/4l (n 홀수)', h: 170, draw: pipeDraw,
          vars: [{ id: 'ty', label: '관의 종류', min: 0, max: 1, step: 1, init: 0, show: v => v ? '한쪽 막힘' : '양쪽 열림' }, { id: 'l', label: '관의 길이 l', min: .25, max: 1, step: .25, init: 1, unit: 'm' }, { id: 'n', label: '배진동 n', min: 1, max: 5, step: 1, init: 2, unit: '배' }],
          outs: [{ label: 'fₙ', f: pipeF, unit: 'Hz', show: f => f < 0 ? '불가' : fmt(f) }],
          rounds: [{ text: '양쪽이 열린 0.5 m 관의 기본 진동수', goals: [{ label: '종류(0=열림)', f: v => v.ty, target: 0, tol: 0 }, { label: 'l', f: v => v.l, target: .5, tol: 0 }, { label: 'f', f: pipeF, target: 340, tol: .1, unit: 'Hz' }] },
          { text: '같은 0.5 m 관의 한쪽을 막았다. 기본 진동수는? (λ₁ = 4l)', goals: [{ label: '종류(1=막힘)', f: v => v.ty, target: 1, tol: 0 }, { label: 'l', f: v => v.l, target: .5, tol: 0 }, { label: 'f', f: pipeF, target: 170, tol: .1, unit: 'Hz' }] },
          { text: '예제 01: 한쪽이 막힌 0.5 m 관의 3배 진동', goals: [{ label: '종류', f: v => v.ty, target: 1, tol: 0 }, { label: 'l', f: v => v.l, target: .5, tol: 0 }, { label: 'n', f: v => v.n, target: 3, tol: 0 }, { label: 'f', f: pipeF, target: 510, tol: .1, unit: 'Hz' }] }] },
        win: '한쪽을 막으면 기본음이 절반(한 옥타브 아래)으로 내려간다.'
      }),
      game('forge', '예제 01 — 막힌 관의 3배 진동', {
        brief: '한쪽이 막힌 관의 길이가 0.5 m일 때, 이 관에서 발생하는 3배 진동 정상파의 고유 진동수를 구하시오. (음속 340 m/s)', formula: 'λ<sub>n</sub> = 4l/n · f<sub>n</sub> = v/λ<sub>n</sub>', lesson: '예제 01: λ₃ = 4×0.5/3 = 2/3 m, f₃ = 340 ÷ (2/3) = 510 Hz',
        cfg: { steps: [
          { problem: '3배 진동할 때의 파장', expr: ['λ₃ = ', { b: '4' }, ' × ', { b: '0.5 m' }, ' / ', { b: '3' }, ' = 2/3 m'], tiles: ['2', '4', '0.5 m', '3', '5'], hint: '한쪽이 막힌 관: λₙ = 4l/n' },
          { problem: '고유 진동수', expr: ['f₃ = ', { b: '340 m/s' }, ' ÷ ', { b: '2/3 m' }], tiles: ['340 m/s', '2/3 m', '0.5 m', '4/3 m'], answer: 510, ansLabel: 'f₃', unit: 'Hz' },
          { problem: '이 관에서 510 Hz 다음으로 높은 고유 진동수는? (기본 진동수 170 Hz)', expr: ['한쪽이 막힌 관: n = 1, 3, ', { b: '5' }, ' … → f = ', { b: '5' }, ' × 170'], tiles: ['4', '5', '6'], answer: 850, ansLabel: 'f', unit: 'Hz', hint: '짝수 배 진동은 없다.' }] }
      }),
      { t: 'camp' },
      say('resona', '마지막 열쇠는 <b>공명</b>. 밖에서 가하는 진동이 물체의 <b>고유 진동수</b>와 일치하면 보강 간섭으로 진폭이 엄청나게 커져요. 대지의 현도 그렇게 깨울 거예요.'),
      say('clausia', '그 전에 이 땅의 음속부터 정확히 재야 해. 유리관에 물을 채우고 수면을 내리면서, 소리굽쇠 소리가 가장 커지는 깊이를 찾아. 첫 공명은 λ/4, 그다음부터는 λ/2 간격이야.'),
      game('tuner', '예제 02 — 공기 기둥 공명 (680 Hz)', {
        brief: '진동수 680 Hz의 소리굽쇠를 유리관 위에 대고 수면을 천천히 내려라. 소리가 가장 커지는(공명) 깊이를 찾아 고정하라. (음속 340 m/s)', formula: '첫 공명 깊이 = λ/4 · 이웃한 공명 위치의 거리 차 = λ/2 · λ = v/f', lesson: '예제 02: λ = 340/680 = 0.5 m. 처음 공명하는 수면 깊이 = λ/4 = 12.5 cm. 다음은 37.5 cm(3λ/4).',
        cfg: { formula: 'λ = v/f = 340/680 = 0.5 m → λ/4 = ?', h: 250, draw: tubeDraw(680, 340), vars: tubeVars, hold: 1.5,
          outs: [{ label: '소리 세기', f: v => loud(v.y, 50) }],
          rounds: [{ text: '처음으로 소리가 가장 잘 들리는 깊이 (λ/4)', goals: [{ label: '세기', f: v => loud(v.y, 50), target: 1, tol: .03 }, { label: '깊이', f: v => v.y, target: 12.5, tol: .01, unit: 'cm', hide: true }] },
          { text: '두 번째 공명 지점 (첫 지점 + λ/2)', goals: [{ label: '세기', f: v => loud(v.y, 50), target: 1, tol: .03 }, { label: '깊이', f: v => v.y, target: 37.5, tol: .01, unit: 'cm', hide: true }] }] },
        win: '12.5 cm, 그리고 37.5 cm. 두 위치의 차 25 cm가 반 파장이다.'
      }),
      game('tuner', '교과서 탐구 — 미지의 음속 측정 (640 Hz)', {
        brief: '이번엔 음속을 모른다. 640 Hz의 소리로 첫 번째, 두 번째, 세 번째 공명 지점 y₁, y₂, y₃을 귀(세기 게이지)로만 찾아라. 찾은 깊이를 기억해 두라.', formula: 'λ = 2(y<sub>n+1</sub> − y<sub>n</sub>) · v = λf = 2f(y<sub>n+1</sub> − y<sub>n</sub>)', lesson: '탐구: y₁≈0.13, y₂≈0.40, y₃≈0.67 m → λ평균 = y₃ − y₁ ≈ 0.53 m → v = 640 × 0.53 = 339.2 m/s',
        cfg: { h: 250, draw: tubeDraw(640, 339.2), vars: tubeVars, hold: 1.5, time: 120,
          outs: [{ label: '소리 세기', f: v => loud(v.y, 53) }, { label: '깊이', f: v => v.y / 100, unit: 'm', d: 4 }],
          rounds: [{ text: '첫 번째 공명 지점 y₁ (30 cm보다 얕다)', goals: [{ label: '세기', f: v => loud(v.y, 53), target: 1, tol: .03 }, { label: '구간', f: v => v.y < 30 ? 1 : 0, target: 1, tol: 0, d: 0 }] },
          { text: '두 번째 공명 지점 y₂ (30~55 cm)', goals: [{ label: '세기', f: v => loud(v.y, 53), target: 1, tol: .03 }, { label: '구간', f: v => v.y > 30 && v.y < 55 ? 1 : 0, target: 1, tol: 0, d: 0 }] },
          { text: '세 번째 공명 지점 y₃ (55 cm보다 깊다)', goals: [{ label: '세기', f: v => loud(v.y, 53), target: 1, tol: .03 }, { label: '구간', f: v => v.y > 55 ? 1 : 0, target: 1, tol: 0, d: 0 }] }] },
        win: 'y₁ ≈ 0.13 m, y₂ ≈ 0.40 m, y₃ ≈ 0.66 m. 간격이 일정하다 — 반 파장!'
      }),
      game('forge', '음속 계산 — v = 2f(yₙ₊₁ − yₙ)', {
        brief: '실험 결과: 640 Hz에서 공명 위치 y₁ = 0.13, y₂ = 0.40, y₃ = 0.67 m (1회), 파장의 평균값은 3회 평균 0.53 m.', formula: 'λ<sub>평균</sub> = [2(y₃−y₂) + 2(y₂−y₁)]/2 = y₃ − y₁ · v = fλ', lesson: 'λ = 2(yₙ₊₁ − yₙ). λ평균 = y₃ − y₁. v = 640 × 0.53 = 339.2 m/s',
        cfg: { steps: [
          { problem: '1회 실험의 파장 평균값', expr: ['λ = ', { b: 'y₃' }, ' − ', { b: 'y₁' }, ' = 0.67 − 0.13'], tiles: ['y₃', 'y₂', 'y₁'], answer: .54, ansLabel: 'λ', unit: 'm', hint: '[2(y₃−y₂)+2(y₂−y₁)]/2 = y₃ − y₁' },
          { problem: '3회 평균 파장 0.53 m로 음파의 진행 속력을 구하라', expr: ['v = ', { b: '640 Hz' }, ' × ', { b: '0.53 m' }], tiles: ['640 Hz', '0.53 m', '0.265 m', '680 Hz'], answer: 339.2, ansLabel: 'v', unit: 'm/s' },
          { problem: '예제 02 복습: 680 Hz, 음속 340 m/s일 때 첫 공명 깊이', expr: ['깊이 = ( ', { b: '340' }, ' / ', { b: '680' }, ' ) × ', { b: '1/4' }], tiles: ['340', '680', '1/4', '1/2'], answer: 12.5, ansLabel: '깊이', unit: 'cm' }] }
      }),
      N('음속이 밝혀지자 하늘이 갈라진다. 끊어진 현을 움켜쥔 최후의 왜곡 — <b>불협화음의 지휘자</b>가 강림한다.', '🎼'),
      say({ n: '불협화음의 지휘자', i: '🎼' }, '열은 식고, 질서는 흩어지고, 노래는 지워진다. 조율사여, 네가 맞춘 법칙들도 결국 침묵 속에 평형을 이루리라.'),
      say('ignis', '헛소리! 받은 열은 사라지지 않아. Q = ΔU + W!'), say('clausia', '낭비는 계산으로 줄일 수 있어. 엔트로피가 늘더라도, 우린 그 흐름을 읽지.'), say('resona', '그리고 진동수만 맞으면… 아주 작은 떨림도 세상을 울려요. 공명!'),
      game('tuner', '최종 보스 1페이즈 — 대지의 현을 다시 매다', {
        boss: true, brief: '길이 2 m의 대지의 현. 지휘자가 요구하는 음을 차례로 울려 결계를 깨라.', formula: 'f<sub>n</sub> = (n/2l)·√(T/μ)', lesson: 'fₙ = (n/2l)√(T/μ). 마디 수 = n + 1, 배 수 = n.',
        cfg: { formula: 'f<sub>n</sub> = (n/2l)·√(T/μ) · λ<sub>n</sub> = 2l/n', h: 190, draw: strDraw, time: 75,
          vars: [{ id: 'T', label: '장력 T', min: 25, max: 400, step: 25, init: 25, unit: 'N' }, { id: 'mu', label: '선밀도 μ', min: .01, max: .04, step: .01, init: .04, unit: 'kg/m' }, { id: 'l', label: '줄의 길이 l', min: .5, max: 2, step: .25, init: .5, unit: 'm' }, { id: 'n', label: '배진동 n', min: 1, max: 5, step: 1, init: 1, unit: '배' }],
          outs: [{ label: 'v', f: strV, unit: 'm/s' }, { label: 'λₙ', f: v => 2 * v.l / v.n, unit: 'm', d: 3 }, { label: 'fₙ', f: strF, unit: 'Hz' }],
          rounds: [{ text: 'l = 2 m, 파장 1 m의 정상파 (배가 몇 개?) , 속력 200 m/s', goals: [{ label: 'l', f: v => v.l, target: 2, tol: 0 }, { label: 'λ', f: v => 2 * v.l / v.n, target: 1, tol: .001, unit: 'm' }, { label: 'v', f: strV, target: 200, tol: .01, unit: 'm/s' }] },
          { text: 'l = 2 m, 배가 5개인 정상파로 125 Hz', goals: [{ label: 'l', f: v => v.l, target: 2, tol: 0 }, { label: 'n', f: v => v.n, target: 5, tol: 0 }, { label: 'f', f: strF, target: 125, tol: .01, unit: 'Hz' }] }] }
      }),
      game('forge', '최종 보스 2페이즈 — 실전 파훼: 모든 법칙의 합주', {
        boss: true, brief: '지휘자의 핵은 한쪽이 막힌 길이 0.5 m의 관. 세 동료의 법칙을 차례로 꽂아 넣어라. (음속 340 m/s)', formula: 'Q = ΔU + W · e = 1 − T₂/T₁ · f<sub>n</sub> = (v/4l)n', lesson: '종합: 제1법칙, 카르노 효율, 막힌 관의 고유 진동수',
        cfg: { steps: [
          { problem: '{ignis}: 핵 속 기체에 4200 J의 열을 가하자 1710 J의 일을 했다. 내부 에너지 증가량은?', expr: ['ΔU = ', { b: 'Q' }, ' − ', { b: 'W' }], tiles: ['Q', 'W', 'T', 'P'], answer: 2490, ansLabel: 'ΔU', unit: 'J' },
          { problem: '{clausia}: 핵은 400 K과 300 K 사이에서 도는 카르노 기관. 1200 J의 일을 하려면 흡수해야 하는 열은?', expr: ['Q₁ = W ÷ ( 1 − ', { b: '300' }, '/', { b: '400' }, ' )'], tiles: ['300', '400', '1200'], answer: 4800, ansLabel: 'Q₁', unit: 'J' },
          { problem: '{resona}: 핵의 관을 3배 진동으로 공명시켜 부숴라. 필요한 진동수는?', expr: ['f₃ = ', { b: '3' }, ' × 340 / ( ', { b: '4' }, ' × 0.5 )'], tiles: ['2', '3', '4', '5'], answer: 510, ansLabel: 'f₃', unit: 'Hz' }] },
        win: '510 Hz. 세 사람의 합주가 지휘자의 핵을 공명시켜 산산이 부쉈다.'
      }),
      N('대지의 현이 다시 울린다. 낮고 깊은 기본음, 그 위로 2배음, 3배음… 얼어붙은 세계 위로 화음이 번져 간다.', '🌅'),
      say('resona', '들려요? 세상이 다시 노래해요.'), say('ignis', '내 심장도 박자를 되찾았어!'), say('clausia', '…흥. 엔트로피는 여전히 늘고 있지만, 나쁘지 않은 소리군.'),
      say('me', '아직 끝이 아니다. 조율해야 할 법칙은 더 남아 있다. — 다음 악장에서 계속.')
    ],
    camp: [
      { id: 'c7a', who: 'resona', title: '막힌 관의 배음', after: 8, steps: [
        say('resona', '한쪽이 막힌 피리로 기본음의 2배 진동수를 내 달라는 손님이 있었어요.'),
        { t: 'choice', who: 'resona', q: '가능할까요?', opts: [
          { text: '불가능. 막힌 끝은 마디, 열린 끝은 배여야 해서 홀수 배(1, 3, 5…)만 생긴다.', appr: { resona: 2 }, reply: '맞아요! 관 길이에 λ/4가 홀수 개 들어가야 하거든요. 그래서 fₙ = (v/4l)n, n은 홀수만. 완벽해요!' },
          { text: '가능. 세게 불면 된다.', appr: { resona: -1 }, reply: '아무리 세게 불어도 안 돼요~ 막힌 관은 n = 1, 3, 5…만 가능해요. 양쪽이 열린 관이라면 2배 진동이 되지만요.' }] }] },
      { id: 'c7b', who: 'clausia', title: '첫 공명의 깊이', after: 12, steps: [
        say('clausia', '공명 실험에서 첫 공명 깊이가 λ/2라고 우기는 자가 있었지. 이웃한 공명 위치의 간격이 λ/2니까, 라면서.'),
        { t: 'choice', who: 'clausia', q: '어디가 틀렸지?', opts: [
          { text: '첫 공명은 λ/4. 열린 끝(배)에서 수면(마디)까지가 λ/4이고, 그 뒤로 λ/2씩 늘어난다.', appr: { clausia: 2 }, reply: '정확해. λ/4, 3λ/4, 5λ/4… 간격만 λ/2야. 그래서 λ = 2(yₙ₊₁ − yₙ). 당신과 일하는 건 효율적이군.' },
          { text: '틀린 곳 없다. 첫 공명도 λ/2다.', appr: { clausia: -1 }, reply: '수면은 막힌 끝, 마디야. 입구는 배. 배에서 마디까지는 λ/4. 680 Hz면 12.5 cm지, 25 cm가 아니야.' }] }] }
    ]
  });
})();
