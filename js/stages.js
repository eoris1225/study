'use strict';
/* 장면 구성: 어떤 대사에 무엇이 화면에서 일어나는지 */
const STAGES = (() => {
  const sl = (a, i, j) => a.slice(i, j).map(l => [l[0], l[1]]), P = { r: 170, me: 300, c: 430, i: 560 };
  const party = (o = {}) => ['resona', 'me', 'clausia', 'ignis'].filter(id => !(o.no || []).includes(id)).map(id => Object.assign({ id, x: { resona: P.r, me: P.me, clausia: P.c, ignis: P.i }[id], dir: 1 }, (o.over || {})[id]));
  const wakeEnd = (lines, n) => [{ bg: 'shrine', lines: lines.slice(0, -1), act: [{ id: 'me', x: 600, pose: 'rise', at: [.35, .7] }], fx: [{ k: 'dark', out: 1, at: [0, .25] }] }, { bg: 'void', min: 2.6, lines: [], fx: [{ k: 'title', text: `— ${n}회차 —`, at: [.1, .6] }] }];
  return {
    wake1: () => { const L = LOOPS[1][0].start; return [
      { bg: 'shrine', lines: sl(L, 0, 2), act: [{ id: 'me', x: 600, pose: 'lie' }], fx: [{ k: 'dark', out: 1, at: [0, .3] }] },
      { bg: 'shrine', lines: sl(L, 2, 5), act: [{ id: 'me', x: 600, pose: 'rise', at: [.05, .3] }] }]; },
    wake2: () => { const L = LOOPS[2][0].start; return [
      { bg: 'shrine', lines: sl(L, 0, 2), act: [{ id: 'me', x: 600, pose: 'rise', at: [.3, .5] }], fx: [{ k: 'flash', at: [0, .2] }] },
      { bg: 'tomb', lines: sl(L, 2, 3), act: [{ id: 'ignis', x: 640, pose: 'ash', at: [.2, .9] }], fx: [{ k: 'red', at: [0, 1] }, { k: 'dark', at: [.8, 1] }] },
      { bg: 'shrine', lines: sl(L, 3, 6), act: [{ id: 'me', x: 600, pose: 'walk', x1: 820, at: [.55, .95] }] }]; },
    wake3: () => { const L = LOOPS[3][0].start; return [
      { bg: 'shrine', lines: sl(L, 0, 4), act: [{ id: 'me', x: 600, pose: 'lie' }], fx: [{ k: 'flash', at: [0, .12] }] },
      { bg: 'shrine', lines: sl(L, 4, 5), min: 4, act: [{ id: 'me', x: 600, pose: 'rise', at: [.1, .7] }] }]; },
    gauge0: () => { const lp = Math.min(3, S.loop || 1), L = { 1: [['n', '식어 버린 보일러 옆에 누가 쓰러져 있다. 가슴에 박힌 엔진의 눈금이 바닥을 가리킨다.'], ['t', '…사람 가슴에 왜 눈금이 달려 있지.'], ['i', '으… 눈금이… 안 올라가…']], 2: [['t', '저 눈금. 지난번엔 한참을 헤맸다.'], ['i', '으…'], ['m', '가만있어. 금방 올려 줄게.']], 3: [['t', '눈금 바닥. 삼십 초면 된다.'], ['m', '숨 쉬어. 올린다.']] }[lp];
      return [{ bg: 'boiler', lines: L, act: [{ id: 'ignis', x: 620, pose: 'lie', s: 3.4 }, { id: 'me', x: 120, pose: 'walk', x1: 300, at: [.05, .35] }], fx: [{ k: 'gauge', a: .04, b: .04, flick: 1, tx: 660, at: [0, 1] }] }]; },
    gauge1: () => { const lp = Math.min(3, S.loop || 1), L = { 1: [['n', '눈금이 떨리더니, 천천히 올라갔다.'], ['i', '…어? 따뜻해.'], ['t', '방금 내가 사람을 살린 건가. 편의점 알바가.']], 2: [['n', '눈금이 올라갔다.'], ['t', '따뜻하다. 살아 있다. …됐다. 하나.']], 3: [['n', '눈금이 올라갔다.'], ['i', '너… 손이 익숙한데? 처음 하는 솜씨가 아니야.'], ['m', '기분 탓이야.']] }[lp];
      return [{ bg: 'boiler', min: 7, lines: L, act: [{ id: 'ignis', x: 620, pose: 'rise', at: [.5, .75], s: 3.4 }, { id: 'me', x: 300 }], fx: [{ k: 'gauge', a: .04, b: .82, tx: 660, at: [.08, .45] }, { k: 'flash', at: [.4, .55] }] }]; },
    beat: (st) => { // 장 중간 대목: 그 장의 배경 위에서 일행이 움직인다
      const lp = Math.min(3, S.loop || 1), k = st.beat, ci = st.ci, X0 = { resona: 150, clausia: 290, ignis: 430, me: 570 }, who = ['resona', 'clausia', 'ignis'].filter(id => S.party.includes(id)).concat('me'), newc = k.startsWith('pre_') || k.startsWith('post_') ? k.split('_')[1] : null;
      const lines = st.lines.map(l => [l[0], l[1]]), sc = { bg: 'ch', ci, lines, act: [], fx: [] };
      if (k === 'camp') { sc.night = 1; const seats = lp === 3 && ci < 6 ? { resona: 330, clausia: 450, ignis: 830, me: 1120 } : lp === 3 ? { resona: 760, clausia: 450, ignis: 880, me: 560 } : { resona: 330, clausia: 450, ignis: 830, me: 950 }; who.forEach(id => sc.act.push({ id, x: seats[id], pose: 'sit', dir: seats[id] > 640 ? -1 : 1 })); sc.fx.push({ k: 'fire', x: 640, at: [0, 1] }); }
      else if (k === 'boss') { who.forEach(id => sc.act.push({ id, x: X0[id] - 60 })); sc.boss = { pose: 'rise', at: [.02, .3], s: ci === 6 ? 6.5 : 4.2, x: 1010 }; sc.fx.push({ k: 'red', at: [0, .4] }, { k: 'shake', at: [.2, .3] }); }
      else if (k === 'start') who.forEach((id, i) => sc.act.push({ id, x: X0[id] - 520, pose: 'walk', x1: X0[id], at: [0, .32] }));
      else if (newc && k.startsWith('pre_')) { who.filter(id => id !== newc).forEach(id => sc.act.push({ id, x: X0[id] - 420, pose: 'walk', x1: X0[id] - 80, at: [0, .25] })); sc.act.push(newc === 'ignis' ? { id: newc, x: 900, pose: 'lie' } : { id: newc, x: 900, dir: -1, sing: newc === 'resona' }); }
      else if (newc) { who.filter(id => id !== newc).forEach(id => sc.act.push({ id, x: X0[id] - 80 + (id === 'me' ? 120 : 0) })); sc.act.push(newc === 'ignis' ? { id: newc, x: 900, pose: 'rise', at: [0, .12] } : { id: newc, x: 900, pose: 'walk', x1: 760, at: [.05, .25] }); sc.act[sc.act.length - 1].dir = -1; }
      else { who.forEach(id => sc.act.push({ id, x: X0[id], pose: id === 'me' ? 'stand' : (lp === 1 ? 'jumpjoy' : 'stand') })); }
      return [sc]; },
    die1: () => { const L = LOOPS.fate.die1; return [
      { bg: 'tomb', lines: sl(L, 0, 3), act: party(), boss: { pose: 'cast' }, fx: [{ k: 'red', at: [.1, .7] }, { k: 'shake', at: [.6, .8] }] },
      { bg: 'tomb', lines: sl(L, 3, 7), act: party({ over: { ignis: { pose: 'ash', x: 720, at: [.45, .95] } } }), boss: { pose: 'cast' }, fx: [{ k: 'flash', at: [.35, .6] }] },
      { bg: 'tomb', lines: sl(L, 7, 11), act: party({ no: ['ignis'], over: { clausia: { pose: 'shatter', x: 620, at: [.7, .98] } } }), boss: {}, fx: [{ k: 'frost', at: [.2, .75] }, { k: 'shake', at: [.72, .8] }] },
      { bg: 'void', lines: sl(L, 11, 13), fx: [{ k: 'card', text: '조율사 —|처음으로 생긴, 갚고 싶은 사람.', at: [.3, 1] }] },
      { bg: 'tomb', lines: sl(L, 13, 16), act: party({ no: ['ignis', 'clausia'], over: { resona: { x: 560, sing: 1, pose: 'fade', at: [.75, .98] } } }), boss: {} },
      { bg: 'tomb', lines: sl(L, 16, 18), act: [{ id: 'me', x: P.me, pose: 'sit' }], boss: {} },
      { bg: 'tomb', lines: sl(L, 18, 22), act: [{ id: 'me', x: P.me, pose: 'fall', at: [.15, .3] }], boss: { pose: 'cast' }, fx: [{ k: 'red', at: [0, .5] }, { k: 'dark', at: [.6, 1] }] },
      { bg: 'void', min: 3, lines: [] },
      ...wakeEnd(sl(L, 24, 28), 2)]; },
    die2: () => { const L = LOOPS.fate.die2; return [
      { bg: 'tomb', lines: sl(L, 0, 4), act: party(), boss: {} },
      { bg: 'tomb', lines: sl(L, 4, 10), act: party({ over: { me: { pose: 'walk', x1: 520, at: [.25, .5] } } }), boss: {}, fx: [{ k: 'pillar', under: 1, w: 60, at: [.2, .6] }] },
      { bg: 'tomb', lines: sl(L, 10, 17), act: party({ over: { me: { x: 640 }, ignis: { pose: 'walk', x1: 500, at: [0, .15] }, clausia: { pose: 'walk', x1: 380, at: [.5, .65] } } }), boss: {}, fx: [{ k: 'pillar', under: 1, w: 80, at: [0, .01] }, { k: 'shake', at: [.02, .08] }, { k: 'shake', at: [.9, .96] }] },
      { bg: 'tomb', lines: sl(L, 17, 20), act: [{ id: 'me', x: 640 }], fx: [{ k: 'pillar', under: 1, w: 110, at: [0, .01] }] },
      { bg: 'tomb', lines: sl(L, 20, 24), act: [{ id: 'resona', x: 170, sing: 1 }, { id: 'clausia', x: 380 }, { id: 'ignis', x: 500 }, { id: 'me', x: 640, pose: 'light', at: [.55, 1] }], fx: [{ k: 'pillar', under: 1, w: 200, at: [0, .4] }] },
      { bg: 'tomb', lines: sl(L, 24, 26), act: [{ id: 'resona', x: 170 }, { id: 'clausia', x: 380 }, { id: 'ignis', x: 500, pose: 'walk', x1: 640, at: [.3, .6] }], fx: [{ k: 'flash', at: [0, .3] }, { k: 'shake', at: [.6, .75] }, { k: 'dark', at: [.8, 1] }] },
      { bg: 'void', min: 3, lines: [] },
      ...wakeEnd(sl(L, 28, 32), 3)]; },
    stop3: () => { const L = LOOPS.fate.stop3; return [
      { bg: 'tomb', lines: sl(L, 0, 4), act: [{ id: 'resona', x: 120 }, { id: 'clausia', x: 230 }, { id: 'ignis', x: 340 }, { id: 'me', x: 420, pose: 'walk', x1: 640, at: [.2, .95] }], boss: {}, fx: [{ k: 'pillar', under: 1, w: 70, at: [0, .3] }] },
      { bg: 'tomb', lines: sl(L, 4, 9), act: [{ id: 'resona', x: 120 }, { id: 'clausia', x: 230 }, { id: 'ignis', x: 340, pose: 'walk', x1: 570, at: [0, .06] }, { id: 'me', x: 640 }], boss: {}, fx: [{ k: 'pillar', under: 1, w: 70, at: [0, .01] }, { k: 'shake', at: [.04, .1] }, { k: 'grab', x: 610, at: [.04, .2] }] },
      { bg: 'tomb', lines: sl(L, 9, 14), act: [{ id: 'resona', x: 120 }, { id: 'clausia', x: 230 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640, dir: -1 }], boss: {}, fx: [{ k: 'red', at: [0, .5] }, { k: 'shake', at: [.2, .3] }] },
      { bg: 'tomb', lines: sl(L, 14, 22), act: [{ id: 'resona', x: 120 }, { id: 'clausia', x: 230, pose: 'walk', x1: 720, at: [0, .12] }, { id: 'ignis', x: 570 }, { id: 'me', x: 640 }], boss: {}, fx: [{ k: 'ice', x: 640, at: [.02, .12] }, { k: 'shake', at: [.02, .07] }, { k: 'frost', at: [0, .4] }, { k: 'red', at: [.55, .8] }] },
      { bg: 'tomb', lines: sl(L, 22, 27), act: [{ id: 'resona', x: 120, pose: 'walk', x1: 500, at: [0, .2] }, { id: 'clausia', x: 720, dir: -1 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640, dir: -1 }], boss: {}, fx: [{ k: 'ice', x: 640, at: [0, .01] }, { k: 'shake', at: [.88, .95] }] },
      { bg: 'tomb', lines: sl(L, 27, 37), act: [{ id: 'resona', x: 500 }, { id: 'clausia', x: 720, dir: -1 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640 }], boss: {}, fx: [{ k: 'ice', x: 640, at: [0, .01] }, { k: 'pillar', under: 1, w: 260, at: [.45, .9] }] },
      { bg: 'tomb', lines: sl(L, 37, 42), act: [{ id: 'resona', x: 500, sing: 1 }, { id: 'clausia', x: 720, dir: -1 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640 }], fx: [{ k: 'ice', x: 640, at: [0, .01] }, { k: 'pillar', under: 1, w: 300, at: [0, .01] }, { k: 'flash', at: [.85, 1] }] },
      { bg: 'tomb', lines: sl(L, 42, 45), act: [{ id: 'resona', x: 500 }, { id: 'clausia', x: 720 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640 }], boss: { pose: 'cast' }, fx: [{ k: 'pillar', under: 1, w: 300, at: [0, .01] }] }]; },
    happy: () => { const L = LOOPS.fate.happy, four = [{ id: 'resona', x: 500 }, { id: 'ignis', x: 570 }, { id: 'me', x: 640 }, { id: 'clausia', x: 720, dir: -1 }]; return [
      { bg: 'tomb', lines: sl(L, 0, 3), act: four, boss: { pose: 'break', at: [.05, .45] }, fx: [{ k: 'flash', at: [0, .2] }, { k: 'shake', at: [.05, .3] }, { k: 'pillar', under: 1, w: 420, at: [.3, .8] }] },
      { bg: 'shrine', lines: sl(L, 3, 6), act: [{ id: 'me', x: 640 }], fx: [{ k: 'dark', at: [0, .5] }, { k: 'dark', out: 1, at: [.75, 1] }] },
      { bg: 'tomb', lines: sl(L, 6, 10), act: [{ id: 'resona', x: 440, pose: 'jumpjoy' }, { id: 'clausia', x: 780, dir: -1 }, { id: 'ignis', x: 600 }, { id: 'me', x: 640, pose: 'lift', at: [.12, .3] }], fx: [{ k: 'shake', at: [0, .06] }, { k: 'pillar', under: 1, w: 420, at: [0, .01] }] },
      { bg: 'tomb', lines: sl(L, 10, 19), act: [{ id: 'me', x: 560 }, { id: 'clausia', x: 700, dir: -1 }, { id: 'ignis', x: 300 }], fx: [{ k: 'card', text: '오늘, 갚기 시작함.|완납 예정일: 없음.', at: [.12, .5] }] },
      { bg: 'tomb', lines: sl(L, 19, 23), act: [{ id: 'resona', x: 560, sing: 1 }, { id: 'me', x: 700, dir: -1 }] },
      { bg: 'beach', lines: sl(L, 23, 29), act: [{ id: 'resona', x: 380, pose: 'sit' }, { id: 'ignis', x: 500, pose: 'sit' }, { id: 'me', x: 800, pose: 'sit', dir: -1 }, { id: 'clausia', x: 920, pose: 'sit', dir: -1 }], fx: [{ k: 'fire', x: 650, at: [0, 1] }] },
      { bg: 'beach', min: 6, lines: sl(L, 29, 31), act: [{ id: 'resona', x: 380, pose: 'sit', sing: 1 }, { id: 'ignis', x: 500, pose: 'sit' }, { id: 'me', x: 800, pose: 'sit', dir: -1 }, { id: 'clausia', x: 920, pose: 'sit', dir: -1 }], fx: [{ k: 'fire', x: 650, at: [0, 1] }, { k: 'title', text: '끝', col: '#fff', at: [.1, .5] }] }]; }
  };
})();
