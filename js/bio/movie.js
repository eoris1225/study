/* 🎬 전체 과정 영화: 3D 개념 장면을 처음부터 끝까지 자동 상영 (자막 + 음성), 누를 것 없음 */
const F = { mito: '#5af0ff', enz: '#3fd88a', atp: '#ffd23f', nad: '#5a9aff', oxy: '#ff6a5a', chl: '#3fdc5a' };
/* [장 제목, [[장면 키, 친구 색, [자막 줄...]], ...]] */
const FILM = [
  ['프롤로그 — 왜 에너지?', [
    ['meta', F.mito, ['우리 몸은 살아 있는 동안 계속 에너지가 필요해.', '음식(포도당)을 쪼개서 에너지를 꺼내는 게 <b>이화 작용</b>, 그 에너지로 큰 분자를 만드는 게 <b>동화 작용</b>이야.']]]],
  ['1장 — 효소', [
    ['ea', F.enz, ['그런데 반응은 그냥 일어나지 않아.', '반응물이 생성물이 되려면 <b>에너지 언덕(활성화 에너지)</b>을 넘어야 해.', '체온 37°C로는 이 언덕을 넘는 분자가 너무 적어서 반응이 느려.']],
    ['eaE', F.enz, ['그래서 <b>효소</b>가 등장!', '효소는 언덕의 <b>꼭대기만 낮춰서</b> 반응을 빠르게 해.']],
    ['calc', F.enz, ['주의! 효소는 출발·도착 높이, 즉 <b>반응열은 못 바꿔</b>.', '바뀌는 건 활성화 에너지뿐이야.']],
    ['es', F.enz, ['효소의 <b>활성 부위</b>는 열쇠 구멍처럼 모양이 정해져 있어.', '모양이 맞는 기질만 붙어 → <b>기질 특이성</b>.', '효소·기질 복합체가 생성물을 내놓으면, 효소는 그대로 남아 <b>다시 쓰여</b>.']],
    ['cof', F.enz, ['어떤 효소는 단백질(<b>주효소</b>)만으로는 활성 부위가 완성되지 않아.', '<b>보조 인자</b>(조효소·금속 이온)가 붙어야 일해. 주효소 + 보조 인자 = <b>전효소</b>.']],
    ['kinds', F.enz, ['효소마다 하는 일이 정해져 있어.', '산화 환원 · 전이 · 가수 분해 · 제거 · 이성질화 · 연결 효소.']],
    ['tph', F.enz, ['효소는 <b>단백질</b>이라 너무 뜨겁거나 pH가 안 맞으면 모양이 망가져(<b>변성</b>).', '그래서 반응이 가장 빠른 <b>최적 온도 · 최적 pH</b>가 있어.']],
    ['sat', F.enz, ['기질을 늘리면 반응이 빨라지다가…', '효소가 전부 기질로 꽉 차면 더는 안 빨라져. 이게 <b>포화</b>.']],
    ['inh', F.enz, ['<b>경쟁적 저해제</b>는 활성 부위를 뺏어. 기질을 늘리면 다시 회복돼.', '<b>비경쟁적 저해제</b>는 다른 곳에 붙어 모양을 바꿔. 기질을 늘려도 회복이 안 돼.']]]],
  ['2장 — 세포호흡을 왜 할까', [
    ['atp', F.atp, ['이제 에너지 얘기야. 포도당의 에너지는 한 덩어리가 너무 커서 세포가 바로 못 써.', '그래서 바로 쓰기 좋은 작은 단위, <b>ATP</b>로 나눠 담아.', 'ATP의 끝 인산이 떨어져 ADP + Pᵢ가 될 때 에너지가 나와.']],
    ['redox', F.oxy, ['포도당의 에너지는 <b>전자 속</b>에 들어 있어.', '전자를 에너지가 낮은 <b>O₂</b> 쪽으로 내려보내야 그 차이만큼 에너지가 나와.', '그래서 포도당에서 전자를 떼어 내는 거야. 이게 <b>산화</b>.']],
    ['nad', F.nad, ['그런데 전자를 O₂에 한 번에 주면 장작불처럼 <b>열로 다 날아가</b>.', '그래서 <b>NAD⁺, FAD</b>가 전자를 받아 <b>NADH, FADH₂</b>로 실어 날라.', '나중에 전자전달계에서 조금씩 내려보내려고.']],
    ['resp', F.mito, ['세포호흡은 네 단계야.', '<b>해당 과정 → 피루브산 산화 → TCA 회로 → 산화적 인산화</b>.', '앞의 세 단계는 전자를 모으고, 마지막 단계가 그 전자로 ATP를 대량 생산해.']],
    ['mito', F.mito, ['주 무대는 <b>마이토콘드리아</b>.', '바깥 <b>외막</b>, 주름진 <b>내막</b>(크리스타), 그리고 안쪽 액체 <b>기질</b>.']],
    ['endo', F.mito, ['마이토콘드리아는 원래 독립된 세균이었어. <b>세포내 공생설</b>.', '증거: 자기 DNA와 리보솜이 있고, 막이 두 겹이야.']]]],
  ['3장 — 해당 과정 (세포질)', [
    ['glyC', F.atp, ['1단계 <b>해당 과정</b>은 <b>세포질</b>에서 일어나. 산소가 필요 없어.', '포도당(C₆) 1개가 <b>피루브산(C₃) 2개</b>로 쪼개져.']],
    ['glyPath', F.atp, ['먼저 ATP 2개를 투자해서 포도당을 쪼개기 쉽게 만들어.', '과당 2인산 → PGAL 2개 → 피루브산 2개. 이때 ATP 4개, NADH 2개가 생겨.', '그래서 순수익은 <b>ATP 2 · NADH 2</b>.']]]],
  ['4장 — 피루브산 산화 (기질)', [
    ['pyrC', F.nad, ['피루브산이 마이토콘드리아 <b>기질</b>로 들어가.', 'CO₂ 1개를 떼고, 전자를 떼어 NADH 1개를 만들고, <b>아세틸 CoA(C₂)</b>가 돼.', 'TCA 회로에 들어갈 수 있는 모양으로 바꾸는 거야.']]]],
  ['5장 — TCA 회로 (기질)', [
    ['tcaC', F.nad, ['아세틸 CoA가 옥살아세트산(C₄)과 만나 시트르산(C₆)이 돼.', '한 바퀴 돌면서 <b>CO₂ 2 · NADH 3 · FADH₂ 1 · ATP 1</b>.', '왜 돌까? 탄소를 CO₂로 다 떼어 내면서 <b>전자를 최대한 모으려고</b>.']],
    ['count', F.nad, ['포도당 1개면 피루브산이 2개니까 회로도 <b>2바퀴</b>.', '지금까지 모은 전자 운반체: NADH 10개, FADH₂ 2개.']]]],
  ['6장 — 전자전달계와 ATP 합성 (내막)', [
    ['elev', F.oxy, ['이제 모은 전자를 쓸 차례. 무대는 <b>내막</b>.', 'NADH, FADH₂가 전자를 넘기면, 전자가 계단을 내려가듯 에너지를 조금씩 내려놓아.', '그 에너지로 H⁺를 <b>기질 → 막사이공간</b>으로 퍼 올려.', '맨 끝에서 <b>O₂</b>가 전자와 H⁺를 받아 <b>물</b>이 돼. 그래서 산소가 꼭 필요해.']],
    ['mem', F.atp, ['막사이공간에 H⁺가 잔뜩 쌓이면, H⁺는 <b>ATP 합성 효소</b>를 통해 기질로 흘러 들어와.', '그 흐름의 힘으로 ATP를 대량으로 만들어. 이게 <b>산화적 인산화(화학 삼투)</b>.', '사이안화물은 전자전달을 막아서 O₂ 소비 ↓, ATP ↓.', 'DNP는 H⁺를 새게 해서 ATP ↓, 그런데 O₂ 소비는 ↑, 열 ↑.']]]],
  ['7장 — 산소가 없으면: 발효', [
    ['ferm', F.oxy, ['산소가 없으면 전자를 버릴 곳이 없어. 그럼 NAD⁺가 다 NADH로 바뀌어 바닥나.', 'NAD⁺가 없으면 해당 과정도 멈추니까, <b>피루브산에 전자를 버려서 NAD⁺를 재생</b>해. 이게 발효.', '<b>젖산 발효</b>(근육·젖산균)는 CO₂가 안 나와. <b>알코올 발효</b>(효모)는 에탄올 + CO₂.', '둘 다 해당 과정의 ATP 2개만 얻어.']],
    ['subs', F.mito, ['탄수화물 말고도 연료가 있어.', '지방산은 아세틸 CoA로, 아미노산은 아미노기를 떼고 TCA 회로로 들어가.']]]],
  ['8장 — 광합성 (반대 방향!)', [
    ['photoAll', F.chl, ['이제 반대 방향! 광합성은 <b>빛에너지를 포도당에 저장</b>해.', '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O.']],
    ['chlS', F.chl, ['무대는 <b>엽록체</b>.', '<b>타이라코이드 막</b>에서 명반응, 그 바깥 액체 <b>스트로마</b>에서 캘빈 회로가 일어나.']],
    ['spec', F.chl, ['엽록소는 <b>빨간빛과 파란빛</b>을 잘 흡수하고 초록빛은 반사해. 그래서 잎이 초록색이야.', '흡수한 빛만 광합성에 쓰여. 흡수 스펙트럼과 작용 스펙트럼이 비슷한 이유야.']],
    ['rf', F.chl, ['종이 크로마토그래피로 색소를 나눠 봐.', '색소마다 용매에 녹는 정도가 달라서 이동 거리(<b>Rf</b>)가 달라.']],
    ['ps', F.chl, ['<b>광계</b>: 여러 색소가 빛을 모아 <b>반응 중심 엽록소</b>로 몰아줘.', '광계 Ⅱ는 P680, 광계 Ⅰ은 P700.']],
    ['z', F.chl, ['명반응: <b>물이 분해</b>되며 전자를 공급해. 이때 <b>O₂</b>가 나와.', '전자는 광계 Ⅱ → 광계 Ⅰ에서 빛을 두 번 받아 끌어 올려지고, 마지막에 NADP⁺가 받아 <b>NADPH</b>가 돼.']],
    ['chl', F.atp, ['그동안 H⁺가 <b>타이라코이드 내부</b>에 쌓여.', 'H⁺가 ATP 합성 효소를 통해 스트로마로 나오며 ATP를 만들어. 이게 <b>광인산화</b>.']],
    ['exp', F.chl, ['실험으로 확인: 광합성에서 나오는 O₂는 <b>물</b>에서 온 거야. 이산화 탄소가 아니야.']],
    ['calvin', F.chl, ['<b>캘빈 회로</b>(스트로마): CO₂를 고정하고, 명반응의 ATP와 NADPH로 환원해서 당을 만들어.', '포도당 1개 = CO₂ 6 · ATP 18 · NADPH 12.']],
    ['cmp', F.mito, ['정리! 세포호흡과 광합성은 <b>서로의 재료를 만들어 주는 짝</b>.', '둘 다 <b>전자전달계 + H⁺ 농도 차 + ATP 합성 효소</b>로 ATP를 만들어.', '끝! 이제 단계별로 다시 밀어 보자.']]]]];

const SHOTS = []; FILM.forEach(([ch, list], ci) => list.forEach(([k, c, lines], si) => SHOTS.push({ ch, ci, first: si === 0, k, c, lines })));
const plain = s => s.replace(/<[^>]+>/g, '').replace(/[·→↓↑]/g, m => ({ '·': ',', '→': ',', '↓': ' 감소', '↑': ' 증가' })[m]);

export function movie() {
  return new Promise(done => {
    const ov = document.createElement('div'); ov.id = 'movie';
    ov.innerHTML = `<div class="mv-title"></div><div class="mv-sub"><span></span></div>
      <div class="mv-bar"><button data-m="prev">⏮</button><button data-m="play">⏸</button><button data-m="next">⏭</button>
      <select data-m="ch">${FILM.map(([t], i) => `<option value="${i}">${t}</option>`).join('')}</select>
      <button data-m="spd">1×</button><button data-m="voice">🔊</button><button data-m="x">✕ 닫기</button></div><div class="mv-prog"><i></i></div>`;
    document.body.appendChild(ov);
    const sub = ov.querySelector('.mv-sub span'), title = ov.querySelector('.mv-title'), prog = ov.querySelector('.mv-prog i'), sel = ov.querySelector('select'), bPlay = ov.querySelector('[data-m=play]');
    let si = 0, li = 0, paused = false, spd = 1, voice = 'speechSynthesis' in window, timer = 0, gen = 0, alive = true;
    const vb = ov.querySelector('[data-m=voice]'); vb.textContent = voice ? '🔊' : '🔇';
    let ko = null; const pickVoice = () => { try { ko = speechSynthesis.getVoices().find(v => /^ko/i.test(v.lang)) || null; } catch (e) { } }; if (voice) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
    const stopTalk = () => { clearTimeout(timer); try { speechSynthesis.cancel(); } catch (e) { } };
    const total = SHOTS.reduce((a, s) => a + s.lines.length, 0); const before = SHOTS.map((_, i) => SHOTS.slice(0, i).reduce((a, s) => a + s.lines.length, 0));
    function line() {
      if (!alive) return; const my = ++gen; stopTalk();
      if (si >= SHOTS.length) { sub.innerHTML = '🎬 끝! 이제 단계별로 다시 밀어 보자.'; return; }
      const S = SHOTS[si]; sel.value = S.ci; const txt = S.lines[li];
      if (li === 0) { window.__stage && window.__stage(S.k, S.c, txt.length / 3); if (S.first) { title.textContent = S.ch; title.classList.remove('on'); void title.offsetWidth; title.classList.add('on'); } }
      else window.__stage && window.__stage(S.k, S.c, txt.length / 3);
      sub.innerHTML = txt; sub.parentNode.classList.remove('in'); void sub.offsetWidth; sub.parentNode.classList.add('in');
      prog.style.width = ((before[si] + li + 1) / total * 100) + '%';
      if (paused) return;
      const minT = Math.max(2600, plain(txt).length * 115) / spd + (li === 0 ? 1600 : 0); /* 첫 줄은 확대 연출 시간 */
      const t0 = performance.now(); let spoke = !voice;
      const next = () => { if (my !== gen || paused) return; const wait = minT - (performance.now() - t0); if (wait > 0) { timer = setTimeout(next, wait); return; } advance(); };
      if (voice) { try { const u = new SpeechSynthesisUtterance(plain(txt)); u.lang = 'ko-KR'; if (ko) u.voice = ko; u.rate = 1.05 * spd; u.onend = u.onerror = () => { spoke = true; if (my === gen) next(); }; setTimeout(() => speechSynthesis.speak(u), li === 0 ? 900 : 150);
        timer = setTimeout(() => { if (!spoke && my === gen) next(); }, minT + 9000); } catch (e) { timer = setTimeout(next, minT); } }
      else timer = setTimeout(next, minT);
    }
    function advance() { const S = SHOTS[si]; if (!S) return; li++; if (li >= S.lines.length) { li = 0; si++; } line(); }
    const go = i => { si = Math.max(0, Math.min(SHOTS.length - 1, i)); li = 0; line(); };
    const close = () => { alive = false; gen++; stopTalk(); ov.remove(); window.__stage && window.__stage(null); done(); };
    ov.onclick = e => { const b = e.target.closest('[data-m]'); if (!b || b.tagName === 'SELECT') return; const m = b.dataset.m;
      if (m === 'x') return close();
      if (m === 'play') { paused = !paused; bPlay.textContent = paused ? '▶' : '⏸'; if (paused) { gen++; stopTalk(); } else line(); }
      if (m === 'next') { go(si + 1); }
      if (m === 'prev') go(li > 0 ? si : si - 1);
      if (m === 'spd') { spd = spd === 1 ? 1.3 : spd === 1.3 ? 1.6 : 1; b.textContent = spd + '×'; line(); }
      if (m === 'voice') { voice = !voice && 'speechSynthesis' in window; b.textContent = voice ? '🔊' : '🔇'; line(); } };
    sel.onchange = () => go(SHOTS.findIndex(s => s.ci === +sel.value));
    addEventListener('keydown', function k(e) { if (!alive) return removeEventListener('keydown', k); if (e.key === 'Escape') close(); if (e.key === ' ') { e.preventDefault(); bPlay.click(); } });
    line();
  });
}
