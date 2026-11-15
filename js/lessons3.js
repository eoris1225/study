'use strict';
/* 수업 카드에 붙는 애니메이션 장면·공식 탐구 + 문제집용 추가 수업 */
window.CARD_FX = {
  '1z:0': [{ s: 'gas', mode: 'isothermal', title: '보일 법칙: 온도 그대로, 피스톤을 눌러 보세요' }], '1z:1': [{ s: 'gas', mode: 'isobaric', title: '샤를 법칙: 압력 그대로, 가열해 보세요' }], '1z:2': [{ rel: 'GAS' }, { rel: 'GASP' }],
  '1a:0': [{ rel: 'PFA' }], '1a:2': [{ rel: 'WPV' }], '1a:3': [{ s: 'gas', mode: 'isobaric', title: '가열하면 기체가 피스톤을 밀어요 → 일 W' }],
  '1b:0': [{ s: 'gas', mode: 'isochoric', title: '가열하면 분자가 빨라져요 = 내부 에너지 증가' }], '1b:2': [{ rel: 'U' }],
  '1c:0': [{ s: 'gas', mode: 'isobaric', title: '받은 열 Q가 ΔU와 W로 나뉘는 걸 보세요' }],
  '1d:1': [{ s: 'gas', mode: 'isochoric', title: '등적: 피스톤 고정 → W = 0' }], '1d:2': [{ s: 'gas', mode: 'isobaric', title: '등압: 열이 ΔU와 W로 나뉨' }],
  '1e:0': [{ s: 'gas', mode: 'isothermal', title: '등온: 온도 그대로 → ΔU = 0, Q = W' }], '1e:1': [{ s: 'gas', mode: 'adiabatic', title: '단열: 열 차단 → 밀면 뜨거워지고 당기면 식어요' }],
  '1g:0': [{ s: 'cycle', cy: 'ex02' }],
  '2a:0': [{ s: 'engine' }], '2a:1': [{ rel: 'EFF' }], '2c:1': [{ s: 'engine', mode: 'carnot' }], '2c:3': [{ s: 'cycle', cy: 'carnot' }],
  '2d:1': [{ s: 'cycle', cy: 'stirling' }], '2d:2': [{ s: 'cycle', cy: 'gasoline' }], '2d:3': [{ s: 'cycle', cy: 'diesel' }],
  '3b:0': [{ s: 'diffusion' }], '3c:0': [{ rel: 'S' }], '3d:0': [{ s: 'heatflow' }], '3e:0': [{ s: 'diffusion' }],
  '4a:0': [{ s: 'shm' }], '4a:1': [{ rel: 'FKX' }], '4b:0': [{ s: 'shm', circle: 1 }], '4c:0': [{ s: 'shm' }], '4d:1': [{ rel: 'TMK' }], '4d:2': [{ s: 'shm', sliders: 1 }], '4e:0': [{ s: 'shm' }],
  '5a:1': [{ s: 'wave' }], '5b:0': [{ s: 'wave', labels: 1 }], '5c:0': [{ s: 'wave', fs: 1 }], '5c:1': [{ rel: 'VFL' }], '5d:0': [{ s: 'wave', modes: 1 }], '5f:1': [{ s: 'reflect' }],
  '6a:0': [{ s: 'wave', lon: 1 }], '6b:0': [{ s: 'interf' }], '6c:1': [{ s: 'interf', mode: 'path' }],
  '7a:1': [{ s: 'standing', ty: 0 }], '7b:1': [{ s: 'standing', ty: 0 }, { rel: 'FN' }], '7b:2': [{ rel: 'VTM' }], '7c:2': [{ s: 'standing', start: 2 }], '7c:1': [{ s: 'standing', start: 1 }], '7d:1': [{ s: 'standing', tube: 1 }]
};

LESSONS[0].unshift({ id: '1z', title: '기체의 법칙 (보일·샤를)', match: ['__none__'], cards: [
  { h: '보일 법칙 — 누르면 줄어들어요', b: `주사기 입구를 막고 피스톤을 누르면 안의 공기가 줄어들면서 손을 더 세게 밀어내죠. <b>온도가 일정할 때, 압력과 부피는 반비례</b>해요.<div class="box">보일 법칙: P × V = 일정 &nbsp; (온도 일정)</div><div class="eg">압력을 2배로 누르면 → 부피는 1/2배<br>압력을 3배로 → 부피는 1/3배</div>위 그림에서 피스톤을 눌러 부피를 절반으로 만들어 보세요. 압력이 2배가 되고 온도는 그대로예요.` },
  { h: '샤를 법칙 — 데우면 부풀어요', b: `찌그러진 탁구공을 뜨거운 물에 넣으면 펴지죠. <b>압력이 일정할 때, 부피는 절대 온도에 비례</b>해요.<div class="box">샤를 법칙: V ÷ T = 일정 &nbsp; (압력 일정, T는 절대 온도)</div><div class="warn2">⚠ 반드시 <b>절대 온도(K) = 섭씨 + 273</b> 으로 계산!<br>20 ℃ → 40 ℃는 2배가 아니에요. 293 K → 313 K, 겨우 1.07배.<br>27 ℃(300 K) → 327 ℃(600 K)가 진짜 2배.</div>` },
  { h: '둘을 합치면: 보일·샤를 법칙', b: `<div class="box">P × V ÷ T = 일정 &nbsp; (기체의 양이 일정할 때)</div>상태가 바뀌어도 이 값은 그대로예요. 그래서 문제는 항상 <b>“처음 = 나중”</b>으로 식을 세워 풀어요.<div class="eg">처음: 1기압, V₀, 300 K → 나중: 3기압, V, 450 K<br>1 × V₀ ÷ 300 = 3 × V ÷ 450<br>V = V₀ × 450 ÷ (300 × 3) = <b>V₀ / 2</b></div>아래 탐구에서 하나씩 바꿔 보며 관계를 확인하세요. 압력은 부피를 줄이고(반비례), 온도는 부피를 늘려요(비례).` },
  { h: '그래프 읽는 요령', b: `기체 문제는 축이 무엇인지부터 봐요.<table><tr><th>그래프</th><th>모양</th><th>뜻</th></tr><tr><td>압력–부피</td><td>반비례 곡선</td><td>온도 일정 (보일)</td></tr><tr><td>부피–온도</td><td>원점을 지나는 직선</td><td>압력 일정 (샤를)</td></tr><tr><td>압력–온도</td><td>원점을 지나는 직선</td><td>부피 일정</td></tr></table>축이 무엇이든 만능 도구는 <b>P × V ÷ T = 일정</b>. 예를 들어 부피를 비교하고 싶으면 <b>V ∝ T ÷ P</b> 로 각 점의 값을 계산하면 돼요.<div class="eg">A(T₀, P₀), B(3T₀, 2P₀), C(3T₀, P₀)<br>V ∝ T/P → 1 : 3/2 : 3 = 2 : 3 : 6</div>` },
  { q: '온도가 일정할 때, 기체의 압력을 4배로 하면 부피는?', a: ['4배', '1/4배', '변화 없음'], c: 1, why: '보일 법칙: P × V = 일정. 압력 4배 → 부피 1/4배.', hint: '온도 일정이면 압력과 부피는 반비례해요.' },
  { q: '압력이 일정할 때, 27 ℃인 기체를 가열해 부피를 2배로 만들려면 온도를 몇 ℃로 해야 할까?', a: ['54 ℃', '327 ℃', '600 ℃'], c: 1, why: '27 ℃ = 300 K. 부피 2배 → 절대 온도 2배 = 600 K = 327 ℃.', hint: '절대 온도로 바꿔서 2배 한 다음, 다시 섭씨로!' }] });

LESSONS[3].push({ id: '4e', title: '단진동의 에너지', match: ['__none__'], cards: [
  { h: '에너지가 모양을 바꿔 가며 왔다 갔다', b: `추를 끝까지 당기면 용수철에 에너지가 저장돼요(<span class="k">탄성 퍼텐셜 에너지</span>). 놓으면 그 에너지가 추의 <span class="k">운동 에너지</span>로 바뀌고, 반대쪽 끝에서 다시 용수철에 저장돼요.<div class="box">탄성 퍼텐셜 에너지 = ½ k x² &nbsp;&nbsp; 운동 에너지 = ½ m v²</div><table><tr><th></th><th>양 끝 (x = ±A)</th><th>평형점 (x = 0)</th></tr><tr><td>퍼텐셜 에너지</td><td><b>최대</b> ½kA²</td><td>0</td></tr><tr><td>운동 에너지</td><td>0</td><td><b>최대</b></td></tr></table>` },
  { h: '역학적 에너지 보존으로 속력 구하기', b: `마찰이 없으면 두 에너지의 합은 항상 같아요. 그래서:<div class="box">끝에서의 퍼텐셜 에너지 = 평형점에서의 운동 에너지<br>½ k A² = ½ m v²</div><div class="eg">k = 800 N/m, m = 2 kg, 진폭 A = 0.1 m<br>½ × 800 × 0.1² = ½ × 2 × v²<br>4 = v² → v = <b>2 m/s</b></div>(검산: v = Aω, ω = √(k/m) = 20 → 0.1 × 20 = 2 ✔)<br>전체 에너지는 ½kA² 이므로 <b>진폭의 제곱에 비례</b>해요. 진폭이 2배면 에너지는 4배.` },
  { q: '같은 용수철 진자를 진폭 A로 흔들 때와 3A로 흔들 때, 역학적 에너지의 비는?', a: ['1 : 3', '1 : 6', '1 : 9'], c: 2, why: '에너지 = ½kA² → 진폭의 제곱에 비례. 3² = 9.', hint: '에너지는 진폭의 “제곱”에 비례해요.' }] });
