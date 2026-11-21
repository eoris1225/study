'use strict';
/* 2회차: 학교 문제(하·중) / 3회차: 학교 문제(상)로 전투 교체 + 난이도별 자세한 개념 설명 */
const LEVEL = n => (n >= 210 && n <= 221) || n >= 285 ? 3 : (n >= 177 && n <= 207) || (n >= 247 && n <= 284) ? 2 : 1;
const LVNAME = { 1: '하', 2: '중', 3: '상' };
function LoopProblems(ch, ci, loop) {
  if (loop < 2 || !window.PROBS) return;
  const secs = PSEC.filter(s => s.ch === ci), order = secs.map(s => s.id);
  const pool = PROBS.filter(p => order.includes(p.s) && (loop === 2 ? LEVEL(p.n) < 3 : LEVEL(p.n) === 3)).sort((a, b) => order.indexOf(a.s) - order.indexOf(b.s) || a.n - b.n);
  const games = ch.steps.map((s, i) => s.t === 'game' ? i : -1).filter(i => i >= 0); if (!games.length || !pool.length) return;
  let slots = games; if (loop === 3 && pool.length < games.length) { const boss = games.filter(i => ch.steps[i].boss), rest = games.filter(i => !ch.steps[i].boss); slots = boss.concat(rest).slice(0, pool.length).sort((a, b) => a - b); }
  const per = slots.map((_, k) => Math.floor((k + 1) * pool.length / slots.length) - Math.floor(k * pool.length / slots.length)); let at = 0;
  const repl = {}; slots.forEach((i, k) => { const ns = pool.slice(at, at + per[k]).map(p => p.n); at += per[k]; const old = ch.steps[i], sec = PSEC.find(s => s.id === PROBS.find(p => p.n === ns[0]).s);
    repl[i] = { t: 'game', g: 'prob', boss: old.boss, title: `${old.boss ? '보스 · ' : ''}실전 ${LVNAME[loop === 2 ? Math.max(...ns.map(LEVEL)) : 3]} — ${sec.title}`, brief: `학교 문제 ${ns.join(', ')}번. 문제를 풀어야 덩어리가 사라져요. 막히면 💡힌트 → 📖풀이를 한 줄씩 보세요. 펜으로 문제 위에 써도 돼요.`, lesId: sec.id + '_' + loop, cfg: { ns }, lesson: (DEEP[sec.id] || {}).sum || '' }; });
  ch.steps = ch.steps.map((s, i) => repl[i] || s).filter((s, i) => !(s.t === 'game' && games.includes(i) && !repl[i]));
}
(() => {
  const _fl = findLesson; findLesson = (ci, st) => { if (st.lesId) { const [sec, lv] = st.lesId.split('_'), D = DEEP[sec]; if (D) return { id: 'deep' + st.lesId, title: `${PSEC.find(s => s.id === sec).title} — ${lv === '3' ? '상' : '중'} 난이도 풀이법`, cards: (lv === '3' ? D.mid.concat(D.high) : D.mid) }; } return _fl(ci, st); };
  const _ft = findTip; findTip = st => st.lesId ? ((DEEP[st.lesId.split('_')[0]] || {}).sum || null) : _ft(st);
  if (window.HOW) HOW.prob = '문제 그림을 보고 답을 고르거나 적은 뒤 [채점]. 틀리면 힌트가 나오고, [📖 풀이]를 누르면 풀이가 한 단계씩 열려요.';
})();

/* 문제 한 개 풀기 화면 */
function probView(el, p, onSolved) {
  el.appendChild(mk('div', 'pbhead', `<b>${p.n}번</b> <span class="lv lv${LEVEL(p.n)}">${LVNAME[LEVEL(p.n)]}</span> <small>${(PSEC.find(s => s.id === p.s) || {}).title || ''}</small>`));
  const paper = mk('div', 'paper'); if (PGROUP[p.n]) paper.appendChild(mk('img')).src = `problems/${PGROUP[p.n]}.png`; paper.appendChild(mk('img')).src = `problems/p${p.n}.png`; el.appendChild(paper); try { Notes.attach(paper, 'p' + p.n); } catch (e) { }
  const ans = mk('div', 'wbans'), fb = mk('div', 'msg'), sol = mk('div', 'wbsol'); let get, tries = 0, shown = 0, usedSol = false, solved = false;
  const num = s => { s = String(s).replace(/,/g, '').replace('−', '-').trim(); const m = s.match(/^(-?[\d.]+)\s*\/\s*([\d.]+)$/); return m ? m[1] / m[2] : parseFloat(s); };
  if (p.t === 'ox') { const st = p.a.split('').map(() => null); p.a.split('').forEach((_, i) => { const r = mk('div', 'oxrow', `<span>(${i + 1})</span>`); ['○', '×'].forEach((s, k) => { const b = mk('button', '', s); b.onclick = () => { st[i] = k ? 'X' : 'O'; [...r.querySelectorAll('button')].forEach(z => z.classList.remove('on')); b.classList.add('on'); }; r.appendChild(b); }); ans.appendChild(r); }); get = () => st.includes(null) ? null : st.join('') === p.a; }
  else if (p.t === 'c') { let sel = null; const r = mk('div', 'crow'); ['①', '②', '③', '④', '⑤'].forEach((s, i) => { const b = mk('button', '', s); b.onclick = () => { sel = i + 1; [...r.children].forEach(z => z.classList.remove('on')); b.classList.add('on'); }; r.appendChild(b); }); ans.appendChild(r); get = () => sel == null ? null : sel === p.a; }
  else if (p.t === 'm') { const sel = new Set(), r = mk('div', 'crow'); p.o.split('').forEach(s => { const b = mk('button', '', s); b.onclick = () => { sel.has(s) ? sel.delete(s) : sel.add(s); b.classList.toggle('on'); }; r.appendChild(b); }); ans.appendChild(r); ans.appendChild(mk('small', 'dim', '해당하는 것을 모두 고르세요')); get = () => sel.size ? [...sel].sort().join('') === p.a.split('').sort().join('') : null; }
  else if (p.t === 'n') { const fs = p.f || [{ l: '답', a: p.a, u: p.unit || '', alt: p.alt, tol: p.tol }], ins = fs.map(f => { const r = mk('div', 'nrow', `<span>${f.l} =</span>`), pm = mk('button', '', '±'), i = mk('input'); i.type = 'text'; i.inputMode = 'decimal'; i.placeholder = '숫자 (분수는 1/4처럼)'; pm.onclick = () => i.value = i.value.startsWith('-') ? i.value.slice(1) : '-' + i.value; r.append(pm, i, mk('span', '', f.u || '')); ans.appendChild(r); return i; });
    get = () => { const vs = ins.map(i => num(i.value)); if (vs.some(v => !isFinite(v))) return null; return fs.every((f, k) => [f.a, f.alt].some(a => a != null && Math.abs(vs[k] - a) <= (f.tol != null ? f.tol : Math.abs(a) * .011 + 1e-9))); }; }
  else { const ta = mk('textarea'); ta.placeholder = '내 답을 먼저 적어 보세요'; ans.appendChild(ta); get = () => 'self'; }
  const row = mk('div', 'btnrow'), chk = mk('button', 'pri', p.t === 'w' ? '모범 답안과 비교' : '채점'), hb = mk('button', '', '💡 힌트'), sb = mk('button', '', '📖 풀이'), more = mk('button', 'pri', ''), go = mk('button', 'pri', '다음 ▶'); more.hidden = true; go.hidden = true;
  const step = () => { if (shown < p.sol.length) { sol.appendChild(mk('div', 'solstep', `<span>${shown + 1}</span><div>${p.sol[shown]}</div>`)); shown++; } more.hidden = shown >= p.sol.length; more.textContent = `다음 단계 ▶ (${shown}/${p.sol.length})`; if (shown >= p.sol.length && !solved) { go.hidden = false; go.textContent = '이해했어요, 다음 ▶'; } };
  const reveal = () => { if (sol.innerHTML) return; sol.innerHTML = `<div class="solans">✅ 정답: <b>${p.ans}</b></div>`; shown = 0; step(); };
  const finish = first => { solved = true; S.wb = S.wb || {}; if (!S.wb[p.n] || first) S.wb[p.n] = first ? 1 : 2; save(); go.hidden = false; go.textContent = '다음 ▶'; };
  hb.onclick = () => { fb.className = 'msg'; fb.innerHTML = '💡 ' + p.hint; };
  sb.onclick = () => { usedSol = true; reveal(); };
  more.onclick = step; go.onclick = () => { if (!solved) finish(false); onSolved(); };
  chk.onclick = () => {
    const r = get(); if (r === null) { fb.className = 'msg bad'; fb.textContent = '답을 먼저 골라(적어) 주세요.'; return; }
    if (r === 'self') { reveal(); fb.className = 'msg'; fb.innerHTML = '내 답과 비교해 보세요. '; const o1 = mk('button', '', '⭕ 맞았어요'), o2 = mk('button', '', '❌ 틀렸어요'); o1.onclick = () => { Sfx.play('win'); finish(true); fb.innerHTML = '👍 좋아요!'; }; o2.onclick = () => { finish(false); fb.innerHTML = '괜찮아요. 풀이를 끝까지 따라가 보세요.'; }; fb.append(o1, o2); return; }
    if (r) { Sfx.play('win'); fb.className = 'msg good'; fb.innerHTML = '🎉 정답!' + (usedSol ? '' : ' <small>풀이도 한 번 확인해 보세요.</small>'); reveal(); finish(!usedSol && tries === 0); }
    else { tries++; Sfx.play('wrong'); fb.className = 'msg bad'; fb.innerHTML = tries === 1 ? '아쉬워요. 💡 ' + p.hint : '다시 틀렸어요. [📖 풀이]로 한 단계씩 따라가 보세요.'; }
  };
  row.append(chk, hb, sb); el.append(ans, row, fb, sol, more, go);
}
MG.prob = (cfg, el, done) => {
  const list = cfg.ns.map(n => PROBS.find(q => q.n === n)).filter(Boolean); let i = 0; const box = mk('div', 'pbbox'); el.appendChild(box);
  const next = () => { if (i >= list.length) return done(true); box.innerHTML = ''; box.appendChild(mk('div', 'pbprog', list.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('') + ` <small>${i + 1} / ${list.length}</small>`)); probView(box, list[i], () => { i++; next(); el.closest('#stage') && (el.closest('#stage').scrollTop = 0); }); };
  next();
};
