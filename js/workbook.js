'use strict';
/* 실전 문제집 화면 */
const SECLES = { A: ['1z'], B: ['1a', '1b', '1c'], C: ['1d', '1e', '1g'], D: ['2a', '2c', '2d'], E: ['3a', '3b', '3d', '3e'], F: ['4a', '4b', '4c', '4d', '4e'], G: ['5a', '5b', '5c', '5e', '5f'], H: ['6a', '6b', '6c', '6d'], I: ['7a', '7b', '7c', '7d'] };
const lesById = id => { for (const k in LESSONS) { const l = LESSONS[k].find(l => l.id === id); if (l) return l; } };
function wbStat() { S.wb = S.wb || {}; const done = PROBS.filter(p => S.wb[p.n]).length; return { done, total: PROBS.length }; }
function openWorkbook(secId) {
  openModal(b => {
    $('#modalBox').classList.add('wide'); S.wb = S.wb || {};
    const home = () => {
      b.innerHTML = ''; const st = wbStat();
      b.appendChild(mk('h2', '', `📝 실전 문제집 <small>수준별 평가 · ${st.done} / ${st.total} 문항 해결</small>`));
      b.appendChild(mk('div', 'wbprog', `<i style="width:${st.done / st.total * 100}%"></i>`));
      b.appendChild(mk('p', 'dim', '학교 문제집(PDF)의 문제를 그대로 실었어요. 막히면 💡힌트 → 📖단계별 풀이 순서로 보세요. 단원마다 먼저 📘개념 수업을 듣고 풀면 좋아요.'));
      PSEC.forEach(sec => {
        const ps = PROBS.filter(p => p.s === sec.id), d = ps.filter(p => S.wb[p.n]).length, card = mk('div', 'wbsec');
        card.appendChild(mk('div', 'wbh', `<b>${sec.title}</b> <small>${d}/${ps.length}</small>`));
        const lr = mk('div', 'wbles'); (SECLES[sec.id] || []).forEach(id => { const l = lesById(id); if (!l) return; const bt = mk('button', '', '📘 ' + l.title); bt.onclick = () => lessonView(b, l, home, '문제집으로 ▶'); lr.appendChild(bt); }); card.appendChild(lr);
        const g = mk('div', 'wbgrid'); ps.forEach(p => { const c = mk('button', 'chip' + (S.wb[p.n] === 1 ? ' ok' : S.wb[p.n] === 2 ? ' half' : ''), p.n + (p.t === 'w' ? '<small>서술</small>' : '')); c.onclick = () => show(p); g.appendChild(c); }); card.appendChild(g); b.appendChild(card);
      });
      b.appendChild(mk('p', 'dim', '원본 PDF: <a href="docs/workbook-2-heat.pdf" target="_blank">Ⅱ. 열과 에너지</a> · <a href="docs/workbook-3-wave.pdf" target="_blank">Ⅲ. 탄성파와 소리</a>'));
    };
    const show = p => {
      b.innerHTML = ''; const sec = PSEC.find(s => s.id === p.s), list = PROBS.filter(q => q.s === p.s), idx = list.indexOf(p);
      const top = mk('div', 'wbtop'); const bk = mk('button', '', '◀ 목록'); bk.onclick = home; top.appendChild(bk); top.appendChild(mk('span', '', `<b>${p.n}번</b> <small>${sec.title} · ${idx + 1}/${list.length}</small>`)); b.appendChild(top);
      const paper = mk('div', 'paper'); if (PGROUP[p.n]) paper.appendChild(mk('img', '', null)).src = `problems/${PGROUP[p.n]}.png`; paper.appendChild(mk('img', '', null)).src = `problems/p${p.n}.png`; b.appendChild(paper);
      const ans = mk('div', 'wbans'), fb = mk('div', 'msg'), solv = mk('div', 'wbsol'); let tries = 0, get, shown = 0, usedSol = false;
      if (p.t === 'ox') { const st = p.a.split('').map(() => null); p.a.split('').forEach((_, i) => { const r = mk('div', 'oxrow', `<span>(${i + 1})</span>`);['○', '×'].forEach((s, k) => { const bt = mk('button', '', s); bt.onclick = () => { st[i] = k ? 'X' : 'O';[...r.querySelectorAll('button')].forEach(z => z.classList.remove('on')); bt.classList.add('on'); }; r.appendChild(bt); }); ans.appendChild(r); }); get = () => st.includes(null) ? null : st.join('') === p.a; }
      else if (p.t === 'c') { let sel = null; const r = mk('div', 'crow');['①', '②', '③', '④', '⑤'].forEach((s, i) => { const bt = mk('button', '', s); bt.onclick = () => { sel = i + 1;[...r.children].forEach(z => z.classList.remove('on')); bt.classList.add('on'); }; r.appendChild(bt); }); ans.appendChild(r); get = () => sel == null ? null : sel === p.a; }
      else if (p.t === 'm') { const sel = new Set(), r = mk('div', 'crow'); p.o.split('').forEach(s => { const bt = mk('button', '', s); bt.onclick = () => { sel.has(s) ? sel.delete(s) : sel.add(s); bt.classList.toggle('on'); }; r.appendChild(bt); }); ans.appendChild(r); ans.appendChild(mk('small', 'dim', '해당하는 것을 모두 고르세요')); get = () => sel.size ? [...sel].sort().join('') === p.a.split('').sort().join('') : null; }
      else if (p.t === 'n') { const fs = p.f || [{ l: '답', a: p.a, u: p.unit || '', alt: p.alt, tol: p.tol }], ins = fs.map(f => { const r = mk('div', 'nrow', `<span>${f.l} =</span>`), pm = mk('button', '', '±'), i = mk('input'); i.type = 'text'; i.inputMode = 'decimal'; i.placeholder = '숫자 (분수는 1/4처럼)'; pm.onclick = () => i.value = i.value.startsWith('-') ? i.value.slice(1) : '-' + i.value; r.appendChild(pm); r.appendChild(i); r.appendChild(mk('span', '', f.u || '')); ans.appendChild(r); return i; });
        const num = s => { s = s.replace(/,/g, '').replace('−', '-').trim(); const m = s.match(/^(-?[\d.]+)\s*\/\s*([\d.]+)$/); return m ? m[1] / m[2] : parseFloat(s); };
        get = () => { const vs = ins.map(i => num(i.value)); if (vs.some(v => !isFinite(v))) return null; return fs.every((f, k) => [f.a, f.alt].some(a => a != null && Math.abs(vs[k] - a) <= (f.tol != null ? f.tol : Math.abs(a) * .011 + 1e-9))); }; }
      else { const ta = mk('textarea'); ta.placeholder = '내 답을 적어 보세요 (적지 않아도 돼요)'; ans.appendChild(ta); get = () => 'self'; }
      const mark = (v) => { if (!S.wb[p.n]) { S.wb[p.n] = v; if (v === 1) S.orbs = (S.orbs || 0) + 3; save(); } else if (v === 1 && S.wb[p.n] === 2 && !usedSol) { S.wb[p.n] = 1; save(); } };
      const revealAll = () => { usedSol = true; solv.innerHTML = `<div class="solans">✅ 정답: <b>${p.ans}</b></div>`; shown = 0; step(); };
      const step = () => { if (shown < p.sol.length) { const d = mk('div', 'solstep', `<span>${shown + 1}</span><div>${p.sol[shown]}</div>`); solv.appendChild(d); shown++; d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } more.hidden = shown >= p.sol.length; more.textContent = `다음 단계 ▶ (${shown}/${p.sol.length})`; };
      const row = mk('div', 'btnrow'), chk = mk('button', 'pri', p.t === 'w' ? '정답·풀이 확인' : '채점하기'), hb = mk('button', '', '💡 힌트'), sb = mk('button', '', '📖 풀이 보기'), more = mk('button', 'pri', ''); more.hidden = true; more.onclick = step;
      hb.onclick = () => { fb.className = 'msg'; fb.innerHTML = '💡 ' + p.hint; };
      sb.onclick = () => { mark(2); revealAll(); };
      chk.onclick = () => {
        const r = get();
        if (r === null) { fb.className = 'msg bad'; fb.textContent = '답을 먼저 골라(적어) 주세요.'; return; }
        if (r === 'self') { revealAll(); fb.className = 'msg'; fb.innerHTML = '내 답과 비교해 보세요. '; const o1 = mk('button', '', '⭕ 맞았어요'), o2 = mk('button', '', '❌ 틀렸어요'); o1.onclick = () => { S.wb[p.n] = 1; save(); fb.innerHTML = '👍 좋아요!'; }; o2.onclick = () => { S.wb[p.n] = 2; save(); fb.innerHTML = '괜찮아요. 풀이를 한 단계씩 따라가 보세요.'; }; fb.appendChild(o1); fb.appendChild(o2); return; }
        if (r) { fb.className = 'msg good'; fb.innerHTML = '🎉 정답! <small>풀이도 확인해 보세요.</small>'; mark(usedSol ? 2 : 1); if (!usedSol) { solv.innerHTML = `<div class="solans">✅ 정답: <b>${p.ans}</b></div>`; shown = 0; step(); } }
        else { tries++; fb.className = 'msg bad'; fb.innerHTML = tries === 1 ? '❌ 아쉬워요. 💡 힌트: ' + p.hint : '❌ 다시 틀렸어요. [📖 풀이 보기]로 한 단계씩 따라가 보세요.'; }
      };
      row.appendChild(chk); row.appendChild(hb); row.appendChild(sb); b.appendChild(ans); b.appendChild(row); b.appendChild(fb); b.appendChild(solv); b.appendChild(more);
      const nav = mk('div', 'btnrow'), pv = mk('button', '', '◀ 이전 문제'), nx = mk('button', '', '다음 문제 ▶'); pv.disabled = idx === 0; nx.disabled = idx === list.length - 1; pv.onclick = () => show(list[idx - 1]); nx.onclick = () => show(list[idx + 1]);
      const lb = mk('button', '', '📘 관련 개념'); lb.onclick = () => { const l = lesById((SECLES[p.s] || [])[0]); if (l) lessonView(b, l, () => show(p), '문제로 돌아가기 ▶'); }; nav.appendChild(pv); nav.appendChild(lb); nav.appendChild(nx); b.appendChild(nav);
      $('#modal').scrollTop = 0;
    };
    if (secId) { const f = PROBS.find(p => p.s === secId && !(S.wb || {})[p.n]) || PROBS.find(p => p.s === secId); f ? show(f) : home(); } else home();
  });
}
