'use strict';
/* ⚡ 각인 모드: 문장 하나 = 한 장면. 역할 도장이 쾅 → 이모지 → 한 줄 핵심이 박히고 → 영어가 끊어 읽기 단위로 떨어지며
   핵심어가 빛난다. 연결어(but/so/for example…)는 색 딱지. 위쪽 이모지 줄은 글의 흐름 지도.
   끝나면 흐름 지도 + 순서 맞추기 + 문장↔핵심 짝 맞추기로 바로 인출 연습. */
const Flash = (() => {
  const ROLE = { 배경: ['#64748b', '📍'], 주제: ['#f59e0b', '👑'], 주장: ['#f59e0b', '📣'], 근거: ['#22c55e', '🧱'], 예시: ['#3b82f6', '🔍'], 반전: ['#ef4444', '⚡'], 대조: ['#a855f7', '↔'], 결과: ['#14b8a6', '➡'], 결론: ['#f97316', '🏁'], 비유: ['#06b6d4', '🎭'], 정의: ['#6366f1', '📖'], 질문: ['#ec4899', '❓'], 정답: ['#eab308', '🎯'], 요약: ['#eab308', '📝'], 함정: ['#dc2626', '🚫'], 전환: ['#c084fc', '🔀'] };
  const BIG = { 반전: 1, 정답: 1, 함정: 1, 주제: 1, 결론: 1, 요약: 1 };
  const CONN = [
    [/\b(but|yet|however|instead|conversely|on the other hand|in contrast|whereas|although|even though|rather than|unlike|nevertheless)\b/gi, 'c-turn', '역접'],
    [/\b(therefore|thus|thereby|as a result|because|so that|hence|consequently|due to)\b/gi, 'c-cause', '인과'],
    [/\b(for example|for instance|such as|consider|imagine)\b/gi, 'c-ex', '예시'],
    [/\b(not|never|no longer|nobody|nowhere|rarely)\b/gi, 'c-neg', '부정']
  ];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const plain = t => t.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, '').replace(/^→\s*/, '');
  function deco(chunk, key) {
    let x = esc(chunk);
    (key || '').split(/\s*~\s*/).filter(k => k.length > 1).forEach(k => { const re = new RegExp('(' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/["“”]/g, '["“”]?') + ')', 'i'); x = x.replace(re, '\u0001$1\u0002'); });
    CONN.forEach(([re, c]) => { x = x.replace(re, m => `\u0003${c}\u0004${m}\u0005`); });
    return x.replace(/\u0001/g, '<mark class="fk">').replace(/\u0002/g, '</mark>').replace(/\u0003([\w-]+)\u0004/g, '<i class="$1">').replace(/\u0005/g, '</i>');
  }
  let ov = null, items = [], k = 0, auto = false, tmr = 0, tok = 0, title = '', onEnd = null;
  const cfg = () => { SV.flash = Object.assign({ voice: true, ko: true }, SV.flash || {}); return SV.flash; };
  function sfx(n) { try { Sfx.play(n); } catch (e) { } }
  function close() { tok++; clearTimeout(tmr); if (typeof Reader !== 'undefined') Reader.stop(); if (ov) ov.remove(); ov = null; document.removeEventListener('keydown', key); if (onEnd) onEnd(); }
  function key(e) { if (!ov) return; if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(k + 1); } if (e.key === 'ArrowLeft') go(k - 1); if (e.key === 'Escape') close(); }
  /* items: [{s, f:[emo,punch,role,key], pname}] */
  function play(list, ttl, start = 0, done) {
    items = list.filter(it => it.f); if (!items.length) { alert('이 문단은 아직 각인 모드 데이터가 없어요.'); return; }
    title = ttl; onEnd = done || null; if (ov) ov.remove(); auto = false;
    ov = document.createElement('div'); ov.className = 'fl';
    ov.innerHTML = `<div class="fl-top"><button class="fl-x">✕</button><b class="fl-t"></b><span class="fl-n"></span></div><div class="fl-trail"></div><div class="fl-stage"><div class="fl-burst"></div><div class="fl-card"></div></div>
      <div class="fl-ctl"><button data-a="prev">◀</button><button data-a="auto">▶▶ 자동</button><button data-a="voice"></button><button data-a="ko"></button><button data-a="next" class="pri">다음 ▶</button></div>`;
    document.body.appendChild(ov); ov.querySelector('.fl-t').textContent = ttl;
    ov.querySelector('.fl-x').onclick = close; document.addEventListener('keydown', key);
    ov.querySelector('.fl-ctl').onclick = e => { const a = e.target.dataset.a; if (!a) return; e.stopPropagation(); const c = cfg();
      if (a === 'prev') go(k - 1); if (a === 'next') go(k + 1); if (a === 'auto') { auto = !auto; syncCtl(); if (auto) go(k); else clearTimeout(tmr); }
      if (a === 'voice') { c.voice = !c.voice; save(); syncCtl(); if (!c.voice && typeof Reader !== 'undefined') Reader.stop(); } if (a === 'ko') { c.ko = !c.ko; save(); syncCtl(); ov.classList.toggle('noko', !c.ko); } };
    ov.querySelector('.fl-stage').onclick = e => { if (ov.classList.contains('done')) return; if (e.target.closest('.fl-ko')) { e.target.closest('.fl-ko').classList.add('on'); return; } go(k + 1); };
    let sx = null; ov.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true }); ov.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 60) { e.preventDefault(); go(k + (dx < 0 ? 1 : -1)); } });
    const tr = ov.querySelector('.fl-trail'); items.forEach((it, i) => { const b = document.createElement('button'); b.style.setProperty('--rc', ROLE[it.f[2]] ? ROLE[it.f[2]][0] : '#888'); b.textContent = [...it.f[0]].slice(0, 2).join(''); b.title = it.f[1]; b.onclick = e => { e.stopPropagation(); go(i); }; tr.appendChild(b); });
    ov.classList.toggle('noko', !cfg().ko); syncCtl(); go(start);
  }
  function syncCtl() { if (!ov) return; const c = cfg(); ov.querySelector('[data-a=auto]').textContent = auto ? '⏸ 멈춤' : '▶▶ 자동'; ov.querySelector('[data-a=auto]').classList.toggle('on', auto); ov.querySelector('[data-a=voice]').textContent = c.voice ? '🔊 읽기' : '🔇 읽기'; ov.querySelector('[data-a=ko]').textContent = c.ko ? '🇰🇷 해석 켬' : '🇰🇷 해석 끔'; }
  function go(i) {
    if (!ov) return; clearTimeout(tmr); if (i < 0) i = 0; if (i >= items.length) return summary(); k = i; const my = ++tok;
    const it = items[k], [emo, punch, role, kw] = it.f, R = ROLE[role] || ['#888', '•'];
    ov.querySelector('.fl-n').textContent = `${k + 1} / ${items.length}`;
    [...ov.querySelectorAll('.fl-trail button')].forEach((b, j) => { b.classList.toggle('cur', j === k); b.classList.toggle('seen', j < k); }); const cb = ov.querySelectorAll('.fl-trail button')[k]; if (cb) cb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    ov.style.setProperty('--rc', R[0]); ov.className = 'fl r-' + role + (cfg().ko ? '' : ' noko');
    const card = ov.querySelector('.fl-card'); const en = plain(it.s[0]).split(' / ');
    card.innerHTML = `${it.pname ? `<div class="fl-p">${it.pname}</div>` : ''}<div class="fl-stamp"><span>${R[1]}</span>${role}</div><div class="fl-emo">${emo}</div>
      <div class="fl-punch">${punch.split(' ').map((w, j) => `<span style="animation-delay:${.35 + j * .07}s">${esc(w)}</span>`).join(' ')}</div>
      <div class="fl-en">${en.map((c, j) => `<span class="ch" style="animation-delay:${.7 + punch.split(' ').length * .07 + j * .28}s">${deco(c, kw)}</span>`).join(' ')}</div>
      <div class="fl-ko" style="animation-delay:${1 + punch.split(' ').length * .07 + en.length * .28}s">${(it.s[2] || '').replace(/<[^>]+>/g, '')}</div>`;
    void card.offsetWidth; card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    const st = ov.querySelector('.fl-stage'); st.classList.remove('shake', 'flip', 'tilt'); void st.offsetWidth;
    if (role === '반전') { st.classList.add('flip'); setTimeout(() => sfx('stomp'), 120); } else if (role === '함정') { st.classList.add('tilt'); setTimeout(() => sfx('hurt'), 150); } else if (BIG[role]) { st.classList.add('shake'); setTimeout(() => sfx('stomp'), 120); } else setTimeout(() => sfx('bonk'), 100);
    if (role === '정답' || role === '요약' || role === '결론' || role === '주제') burst(R[0], role === '정답' || role === '요약' ? ['⭐', '✨', '💥', '🎯'] : ['✨', '⭐']);
    const txt = en.join(' '); const wait = Math.max(3800, 1400 + txt.length * 55);
    const after = () => { if (my !== tok || !auto) return; tmr = setTimeout(() => { if (my === tok && auto) go(k + 1); }, 900); };
    if (cfg().voice && typeof Reader !== 'undefined' && Reader.ok) { setTimeout(() => { if (my === tok) Reader.say(txt).then(after); }, 650); } else if (auto) tmr = setTimeout(() => { if (my === tok && auto) go(k + 1); }, wait);
  }
  function burst(col, em) { const b = ov.querySelector('.fl-burst'); b.innerHTML = ''; for (let i = 0; i < 16; i++) { const p = document.createElement('span'); const a = i / 16 * Math.PI * 2, d = 120 + Math.random() * 140; p.textContent = em[i % em.length]; p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px'); p.style.animationDelay = (.15 + Math.random() * .15) + 's'; b.appendChild(p); } }
  /* ── 끝: 흐름 지도 → 순서 맞추기 / 짝 맞추기 ── */
  function summary() {
    tok++; clearTimeout(tmr); auto = false; syncCtl(); if (typeof Reader !== 'undefined') Reader.stop(); sfx('win');
    ov.className = 'fl done' + (cfg().ko ? '' : ' noko'); ov.querySelector('.fl-n').textContent = '흐름 지도';
    const card = ov.querySelector('.fl-card'); ov.querySelector('.fl-stage').classList.remove('shake', 'flip', 'tilt');
    let last = null; card.className = 'fl-card map';
    card.innerHTML = `<h2>🗺 흐름 지도</h2><p class="dim">한 줄씩 소리 내서 읽어 보세요. 이게 그대로 글의 뼈대예요. 줄을 누르면 그 장면으로.</p><div class="fl-map">${items.map((it, i) => { const R = ROLE[it.f[2]] || ['#888', '•']; const hd = it.pname && it.pname !== last ? `<div class="fl-mh">${it.pname}</div>` : ''; last = it.pname; return hd + `<button data-i="${i}" style="--rc:${R[0]}"><i>${R[1]} ${it.f[2]}</i><span>${it.f[0]}</span><b>${esc(it.f[1])}</b></button>`; }).join('')}</div>
      <div class="fl-end"><button class="pri" data-t="order">🧩 흐름 순서 맞추기</button><button data-t="match">🎯 문장 ↔ 핵심 짝 맞추기</button><button data-t="again">↺ 처음부터 다시</button><button data-t="close">닫기</button></div>`;
    card.onclick = e => { e.stopPropagation(); const b = e.target.closest('button'); if (!b) return; if (b.dataset.i) { card.className = 'fl-card'; card.onclick = null; go(+b.dataset.i); } const t = b.dataset.t; if (t === 'order') order(); if (t === 'match') match(); if (t === 'again') { card.className = 'fl-card'; card.onclick = null; go(0); } if (t === 'close') close(); };
  }
  function groups() { const G = []; items.forEach(it => { const g = G.find(x => x.p === it.pname); if (g) g.l.push(it); else G.push({ p: it.pname, l: [it] }); }); return G; }
  function order() {
    const G = groups().filter(g => g.l.length >= 3); const g = G[Math.floor(Math.random() * G.length)] || { p: '', l: items.slice(0, 8) }; const L = g.l.slice(0, 9);
    const card = ov.querySelector('.fl-card'); card.className = 'fl-card map'; let at = 0, err = 0;
    card.innerHTML = `<h2>🧩 흐름 순서 맞추기</h2><p class="dim">${g.p || ''} — 글의 순서대로 핵심을 눌러요. (순서·삽입 문제 감각)</p><div class="fl-built"></div><div class="fl-pool"></div><div class="fl-end"><button data-t="back">🗺 흐름 지도로</button></div>`;
    const pool = card.querySelector('.fl-pool'), built = card.querySelector('.fl-built');
    L.map((it, i) => [it, i]).sort(() => Math.random() - .5).forEach(([it, i]) => { const R = ROLE[it.f[2]] || ['#888']; const b = document.createElement('button'); b.style.setProperty('--rc', R[0]); b.innerHTML = `<span>${it.f[0]}</span><b>${esc(it.f[1])}</b>`; b.onclick = e => { e.stopPropagation(); if (i === at) { at++; b.disabled = true; b.classList.add('used'); built.insertAdjacentHTML('beforeend', `<div style="--rc:${R[0]}">${at}. ${it.f[0]} ${esc(it.f[1])}</div>`); sfx('bonk'); if (at === L.length) { sfx('win'); burst('#eab308', ['⭐', '✨']); built.insertAdjacentHTML('beforeend', `<p class="fl-ok">${err ? `완성! 실수 ${err}번 — 틀린 곳의 연결어를 다시 보세요.` : '✔ 완벽! 흐름이 머리에 박혔어요.'}</p>`); } } else { err++; b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 350); sfx('hurt'); } }; pool.appendChild(b); });
    card.onclick = e => { const b = e.target.closest('[data-t=back]'); if (b) { e.stopPropagation(); summary(); } };
  }
  function match() {
    const card = ov.querySelector('.fl-card'); card.className = 'fl-card map'; const Q = items.slice().sort(() => Math.random() - .5).slice(0, Math.min(6, items.length)); let qi = 0, right = 0;
    const one = () => {
      if (qi >= Q.length) { card.innerHTML = `<h2>🎯 ${right} / ${Q.length}</h2><p>${right === Q.length ? '전부 각인 완료!' : '틀린 건 흐름 지도에서 다시 한 번 보세요.'}</p><div class="fl-end"><button class="pri" data-t="back">🗺 흐름 지도로</button><button data-t="m">↺ 한 번 더</button></div>`; card.onclick = e => { const t = e.target.closest('button'); if (!t) return; e.stopPropagation(); if (t.dataset.t === 'back') summary(); else match(); }; return; }
      const it = Q[qi]; const others = items.filter(x => x !== it).sort(() => Math.random() - .5).slice(0, 3); const opts = [it, ...others].sort(() => Math.random() - .5);
      card.innerHTML = `<h2>🎯 이 문장의 핵심은? <small>${qi + 1}/${Q.length}</small></h2><div class="fl-q">${esc(plain(it.s[0]).replace(/ \/ /g, ' '))}</div><div class="fl-opts"></div>`;
      const box = card.querySelector('.fl-opts'); opts.forEach(o => { const b = document.createElement('button'); b.innerHTML = `<span>${o.f[0]}</span> ${esc(o.f[1])}`; b.onclick = e => { e.stopPropagation(); [...box.children].forEach((x, j) => { x.disabled = true; if (opts[j] === it) x.classList.add('right'); }); if (o === it) { right++; sfx('win'); } else { b.classList.add('no'); sfx('hurt'); } setTimeout(() => { qi++; one(); }, o === it ? 700 : 1600); }; box.appendChild(b); });
      card.onclick = null;
    };
    one();
  }
  /* 지문(또는 문단 하나)용 항목 만들기 */
  function itemsOf(paras) { return paras.flatMap(p => { const F = (window.FLASH || {})[p.id] || []; return p.s.map((s, i) => ({ s, f: F[i], pname: p.name, pid: p.id, si: i })); }).filter(x => x.f); }
  function has(pid) { return !!(window.FLASH || {})[pid]; }
  return { play, itemsOf, has, close };
})();
