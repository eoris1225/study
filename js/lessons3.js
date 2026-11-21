'use strict';
/* 수업 카드에 붙는 애니메이션 장면·공식 탐구 + 문제집용 추가 수업 */
window.CARD_FX = {
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

LESSONS[3].push({ id: '4e', title: '단진동의 에너지', match: ['__none__'], cards: [
  { h: '에너지가 모양을 바꿔 가며 왔다 갔다', b: `추를 끝까지 당기면 용수철에 에너지가 저장돼요(<span class="k">탄성 퍼텐셜 에너지</span>). 놓으면 그 에너지가 추의 <span class="k">운동 에너지</span>로 바뀌고, 반대쪽 끝에서 다시 용수철에 저장돼요.<div class="box">탄성 퍼텐셜 에너지 = ½ k x² &nbsp;&nbsp; 운동 에너지 = ½ m v²</div><table><tr><th></th><th>양 끝 (x = ±A)</th><th>평형점 (x = 0)</th></tr><tr><td>퍼텐셜 에너지</td><td><b>최대</b> ½kA²</td><td>0</td></tr><tr><td>운동 에너지</td><td>0</td><td><b>최대</b></td></tr></table>` },
  { h: '역학적 에너지 보존으로 속력 구하기', b: `마찰이 없으면 두 에너지의 합은 항상 같아요. 그래서:<div class="box">끝에서의 퍼텐셜 에너지 = 평형점에서의 운동 에너지<br>½ k A² = ½ m v²</div><div class="eg">k = 800 N/m, m = 2 kg, 진폭 A = 0.1 m<br>½ × 800 × 0.1² = ½ × 2 × v²<br>4 = v² → v = <b>2 m/s</b></div>(검산: v = Aω, ω = √(k/m) = 20 → 0.1 × 20 = 2 ✔)<br>전체 에너지는 ½kA² 이므로 <b>진폭의 제곱에 비례</b>해요. 진폭이 2배면 에너지는 4배.` },
  { q: '같은 용수철 진자를 진폭 A로 흔들 때와 3A로 흔들 때, 역학적 에너지의 비는?', a: ['1 : 3', '1 : 6', '1 : 9'], c: 2, why: '에너지 = ½kA² → 진폭의 제곱에 비례. 3² = 9.', hint: '에너지는 진폭의 “제곱”에 비례해요.' }] });
