/* 국어 독서 — 기말 범위 지문 해부: 목록 · 원문(필기) · 분석 · 애니메이션 · OX · 빈칸 · 문제 · 진행 저장 */
(() => {
  const $ = s => document.querySelector(s), view = $('#view'), top = $('#top');
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const SS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  let prog = {}; try { prog = JSON.parse(LS('ko_prog') || '{}'); } catch (e) { }
  const P = id => (prog[id] = prog[id] || {});
  const save = () => SS('ko_prog', JSON.stringify(prog));
  let opt = { marks: false, memo: false }; try { Object.assign(opt, JSON.parse(LS('ko_opt') || '{}')); } catch (e) { }
  const saveOpt = () => SS('ko_opt', JSON.stringify(opt));
  const TABS = [['read', '📖', '원문'], ['note', '🔍', '분석'], ['anim', '🎬', '애니'], ['ox', '⭕', 'O/X'], ['blank', '🧩', '빈칸'], ['quiz', '📝', '문제']];
  const NUM = ['①', '②', '③', '④', '⑤'];
  const order = () => KO.P.slice().sort((a, b) => a.no - b.no);

  /* ── 종이 폭: 폰은 좁은 종이, 태블릿·PC는 넓은 종이 (필기 좌표가 안 흔들리게 폭 고정 + 배율) ── */
  let W = 0, S = 1;
  function measure() { const vw = view.clientWidth || innerWidth; W = vw < 640 ? 380 : 680; S = Math.min(1.25, (vw - 16) / W); document.documentElement.style.setProperty('--W', W + 'px'); document.body.classList.toggle('narrow', W === 380); }
  let anim = null, renderAt = 0, route = null;
  const pw = () => view.querySelector('.pwrap');
  function sizeWrap() { const w = pw(); if (!w) return; const p = w.firstElementChild; p.style.transform = `scale(${S})`; w.style.width = W * S + 'px'; w.style.height = p.offsetHeight * S + 'px'; }
  const wro = new ResizeObserver(() => sizeWrap());
  function paper(html, inkKey) { view.innerHTML = `<div class="pwrap"><div class="paper">${html}</div></div>`; const p = view.querySelector('.paper'); wro.disconnect(); wro.observe(p); sizeWrap();
    if (inkKey) KOInk.attach({ scroller: view, paper: p, key: inkKey + ':' + W, s: S }); else KOInk.detach(); return p; }

  /* ── 라우팅: #/ · #/p/<id>/<tab> · #/rush ── (안드로이드 뒤로 가기 = 이전 화면) */
  function go(h, replace) { if (replace) history.replaceState(null, '', h); else if (location.hash !== h) { location.hash = h; return; } render(); }
  addEventListener('hashchange', render);
  function parse() { const h = location.hash.replace(/^#\/?/, ''); const [path, q] = h.split('?'); const a = path.split('/'); const qs = {}; (q || '').split('&').forEach(x => { const [k, v] = x.split('='); if (k) qs[k] = decodeURIComponent(v || ''); }); return { a, qs }; }
  function keepScroll() { if (route) { const m = JSON.parse(LS('ko_scroll') || '{}'); m[route] = view.scrollTop; SS('ko_scroll', JSON.stringify(m)); } }
  view.addEventListener('scroll', () => { clearTimeout(view._t); view._t = setTimeout(keepScroll, 250); }, { passive: true });
  function render() {
    keepScroll(); if (anim) { anim.destroy(); anim = null; } measure();
    const { a, qs } = parse(); route = location.hash || '#/'; renderAt = Date.now();
    if (a[0] === 'p' && KO.get(a[1])) { SS('ko_last', route.split('?')[0]); passage(KO.get(a[1]), TABS.some(t => t[0] === a[2]) ? a[2] : 'read', qs); }
    else if (a[0] === 'rush') rush();
    else home();
    const m = JSON.parse(LS('ko_scroll') || '{}'); const y = qs.hl ? null : m[route.split('?')[0]];
    requestAnimationFrame(() => { view.scrollTop = y || 0; });
  }
  /* 유령 클릭 막기: 화면이 바뀐 직후 0.45초 안의 클릭(이전 화면에서 누른 손가락)은 무시 */
  view.addEventListener('click', e => { if (Date.now() - renderAt < 450) { e.preventDefault(); e.stopPropagation(); } }, true);

  function header(t, p, tab) {
    top.innerHTML = `<div class="hrow"><button class="hb" data-go="#/">☰ 목록</button><div class="ht">${t}</div>${p ? `<button class="hb nx" data-next>다음 ▶</button>` : ''}</div>` + (p ? `<nav class="tabs">${TABS.map(([k, e, n]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${e}<span>${n}</span>${done(p, k) ? '<i>✓</i>' : ''}</button>`).join('')}</nav>` : '');
    document.body.classList.toggle('hastabs', !!p);
    top.onclick = e => { const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go) go(b.dataset.go);
      if (b.dataset.tab) go(`#/p/${p.id}/${b.dataset.tab}`, true);
      if (b.dataset.next !== undefined) { const i = TABS.findIndex(x => x[0] === tab); if (i < TABS.length - 1) go(`#/p/${p.id}/${TABS[i + 1][0]}`, true); else { const os = order().filter(x => !x.extra); const j = os.indexOf(p); go(j >= 0 && j < os.length - 1 ? `#/p/${os[j + 1].id}/read` : '#/'); } } };
  }
  function done(p, k) { const g = prog[p.id] || {};
    if (k === 'ox') return g.ox && Object.keys(g.ox).length >= p.ox.length; if (k === 'quiz') return g.quiz && Object.keys(g.quiz).length >= p.quiz.length;
    if (k === 'blank') return g.blank && Object.keys(g.blank).length >= p.blanks.length; return !!g[k]; }
  function score(p) { const g = prog[p.id] || {}; let ox = 0, q = 0; if (g.ox) Object.entries(g.ox).forEach(([i, v]) => { if (p.ox[i] && (v === 1) === !!p.ox[i][1]) ox++; }); if (g.quiz) Object.entries(g.quiz).forEach(([i, v]) => { if (p.quiz[i] && v === p.quiz[i].a) q++; });
    return { ox, oxn: g.ox ? Object.keys(g.ox).length : 0, q, qn: g.quiz ? Object.keys(g.quiz).length : 0 }; }

  /* ── 목록 ── */
  function home() { header('국어 독서 · 기말 범위', null); KOInk.detach();
    const last = LS('ko_last'); const lp = last && KO.get(last.split('/')[2]);
    const card = p => { const sc = score(p), d = TABS.filter(t => done(p, t[0])).length;
      return `<button class="card${p.extra ? ' extra' : ''}" data-go="#/p/${p.id}/read"><span class="em">${p.emoji}</span><b>${p.title}</b><small>${p.src}</small><span class="bar"><i style="width:${d / TABS.length * 100}%"></i></span><span class="sc">${d}/6 단계${sc.oxn ? ` · O/X ${sc.ox}/${sc.oxn}` : ''}${sc.qn ? ` · 문제 ${sc.q}/${sc.qn}` : ''}</span></button>`; };
    const grp = (t, f) => `<h2>${t}</h2><div class="cards">${order().filter(f).map(card).join('')}</div>`;
    view.innerHTML = `<div class="home">
      <div class="hero"><h1>📚 국어 독서 · 기말 시험 범위</h1><p>지문마다 <b>원문 읽기(필기)</b> → <b>문단별 분석</b> → <b>움직이는 그림</b> → <b>O/X · 빈칸 · 문제</b> 순서로. 위의 <b>다음 ▶</b>만 누르면 순서대로 진행돼요.</p>
      ${lp ? `<button class="big" data-go="${last}">▶ 이어하기: ${lp.title} · ${(TABS.find(t => t[0] === last.split('/')[3]) || TABS[0])[2]}</button>` : `<button class="big" data-go="#/p/${order()[0].id}/read">▶ 처음부터 시작</button>`}
      <button class="big alt" data-go="#/rush">🔥 전 범위 O/X 섞어 풀기 (20문항)</button></div>
      ${grp('김선홍T 범위', p => p.teacher === '김선홍T')}
      ${grp('오홍주T 범위', p => p.teacher === '오홍주T')}
      ${grp('참고 (범위 밖 · 함께 받은 프린트)', p => p.extra)}
      <div class="scope"><h2>🗂 시험 범위 체크</h2>
      <table><tr><th>선생님</th><th>범위</th><th>앱</th></tr>
      <tr><td rowspan="3">김선홍T</td><td>프린트: 대기, 영장 및 강제 처분, 적부심사, 도파민, 호네트</td><td>✅ 5지문</td></tr>
      <tr><td>9월 전국연합학력평가: 심장 (17~20)</td><td>✅ 기출 4문항</td></tr>
      <tr><td>교과서 p.148~149</td><td>⚠️ 사진 필요</td></tr>
      <tr><td rowspan="3">오홍주T</td><td>프린트 1~3: 공모, 자기유변유체, 섀플리 값</td><td>✅ 3지문</td></tr>
      <tr><td>10월 전국연합학력평가: 건축법 (17~20)</td><td>✅ 기출 4문항</td></tr>
      <tr><td>교과서 204~210: 인류의 미래에 관한 두 가지 관점(인류세)</td><td>⚠️ 사진 필요</td></tr></table>
      <p class="tip">교과서 쪽은 사진이 없어서 아직 못 넣었어요. 교과서 해당 쪽 사진을 보내 주면 같은 방식(원문·분석·애니·문제)으로 추가할게요. 프린트 4쪽 <b>혈압</b>은 범위표(1~3쪽) 밖이지만 함께 받은 지문이라 '참고'로 넣어 두었어요.</p></div>
      <div class="help"><h2>✍️ 필기도구 쓰는 법</h2><ul>
      <li><b>S펜</b>은 그냥 대고 쓰면 돼요 (켤 필요 없음). 펜으로 버튼을 톡 누르면 버튼이 눌려요.</li>
      <li>손가락은 기본이 <b>스크롤</b>. 아래 막대의 <b>✋/☝️</b>를 누르면 손가락으로도 쓰고, 그때는 <b>두 손가락</b>으로 스크롤.</li>
      <li>✏️ 펜 · 🖍️ 형광펜 · 🧽 지우개(선 하나씩) · 색 · ↶ 되돌리기 · 🗑️ 이 페이지 지우기 · 👁️ 필기 숨기기</li>
      <li>필기는 지문·탭마다 따로 저장돼요. 화면을 돌려도 글자 위 제자리에 남아요.</li></ul></div></div>`;
    view.onclick = e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); };
  }

  /* ── 지문 화면 ── */
  function passage(p, tab, qs) { header(`${p.emoji} ${p.title}`, p, tab); view.onclick = null;
    ({ read, note, anim: animTab, ox, blank, quiz })[tab](p, qs);
    if (tab === 'read' || tab === 'note' || tab === 'anim') { P(p.id)[tab] = 1; save(); }
  }
  const srcLine = p => `<div class="src">${p.src}${p.exam ? ' · <b>기출</b>' : ''}</div>`;

  function read(p, qs) {
    const body = p.paras.map((t, i) => `<p class="pp" data-i="${i}"><span class="pn">${i + 1}</span>${KO.mark(t)}</p>${p.notes[i] ? `<div class="memo" data-i="${i}">✎ ${p.notes[i].sum}</div>` : ''}`).join('');
    const pa = paper(`<div class="rbar"><button data-o="marks" class="${opt.marks ? 'on' : ''}">🖍 해부 표시</button><button data-o="memo" class="${opt.memo ? 'on' : ''}">📝 문단 메모</button><button data-t>⏱ <span>읽기 시간</span></button></div>
      ${srcLine(p)}<h1 class="ptitle">${p.title}</h1><div class="txt">${body}</div>
      <div class="legend">해부 표시: <b class="kw">핵심어</b> · <span class="ks">핵심 문장</span> · <span class="cj">논리 표지(따라서·반면…)</span> · <span class="bx">원문 네모</span> · <u class="ul">원문 밑줄</u></div>
      <div class="endnav"><button data-tab2="note">다 읽었으면 🔍 분석으로 ▶</button></div>`, `${p.id}:read`);
    pa.classList.toggle('marks', opt.marks); pa.classList.toggle('memo', opt.memo);
    let t0 = 0, iv = 0;
    pa.onclick = e => { const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.o) { opt[b.dataset.o] = !opt[b.dataset.o]; saveOpt(); b.classList.toggle('on', opt[b.dataset.o]); pa.classList.toggle(b.dataset.o, opt[b.dataset.o]); }
      if (b.dataset.t !== undefined) { const sp = b.querySelector('span');
        if (!t0) { t0 = Date.now(); b.classList.add('on'); iv = setInterval(() => { if (!sp.isConnected) return clearInterval(iv); const s = (Date.now() - t0) / 1000 | 0; sp.textContent = `${s / 60 | 0}:${String(s % 60).padStart(2, '0')} (누르면 멈춤)`; }, 500); }
        else { clearInterval(iv); const s = (Date.now() - t0) / 1000 | 0; t0 = 0; b.classList.remove('on'); sp.textContent = `${s / 60 | 0}분 ${s % 60}초 걸림`; const g = P(p.id); g.time = s; save(); } }
      if (b.dataset.tab2) go(`#/p/${p.id}/${b.dataset.tab2}`, true); };
    if (qs.hl != null) { const el = pa.querySelector(`.pp[data-i="${qs.hl}"]`); if (el) { el.classList.add('flash'); requestAnimationFrame(() => setTimeout(() => { const r = el.getBoundingClientRect(), v = view.getBoundingClientRect(); view.scrollTop += r.top - v.top - 20; }, 60)); } }
  }

  function note(p) {
    const tb = p.table ? `<table class="cmp"><tr>${p.table.head.map(h => `<th>${h}</th>`).join('')}</tr>${p.table.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th>${c}</th>`).join('')}</tr>`).join('')}</table>` : '';
    const ns = p.notes.map((n, i) => `<div class="pn-card"><div class="pnh"><span>${i + 1}문단</span><a class="tapme" data-hl="${i}">원문 보기 ›</a></div>
      <p class="sum">${n.sum}</p><div class="chips">${n.key.map(k => `<i>${k}</i>`).join('')}</div>
      <p class="fl">🧭 <b>흐름</b> ${n.flow}</p><p class="pt">🎯 <b>출제 포인트</b> ${n.point}</p>${n.trap ? `<p class="tr">⚠️ <b>함정</b> ${n.trap}</p>` : ''}
      <details><summary>이 문단 원문 펼치기</summary><p class="pp marks">${KO.mark(p.paras[i])}</p></details></div>`).join('');
    const pa = paper(`${srcLine(p)}<h1 class="ptitle">🔍 ${p.title} — 분석</h1>
      <div class="theme"><b>한 줄 주제</b>${p.theme}</div>
      <h2 class="sec">구조도</h2><div class="struct">${p.structure}</div>
      ${tb ? `<h2 class="sec">한눈 비교표</h2>${tb}` : ''}
      <h2 class="sec">문단별 해부</h2>${ns}
      <div class="endnav"><button data-tab2="anim">🎬 움직이는 그림으로 확인 ▶</button></div>`, `${p.id}:note`);
    pa.classList.add('marks');
    pa.onclick = e => { const a = e.target.closest('[data-hl]'); if (a) go(`#/p/${p.id}/read?hl=${a.dataset.hl}`); const b = e.target.closest('[data-tab2]'); if (b) go(`#/p/${p.id}/${b.dataset.tab2}`, true); };
  }

  function animTab(p) { KOInk.detach(); view.innerHTML = `<div class="animwrap">${srcLine(p)}<div id="animbox"></div><div class="endnav"><button data-tab2="ox">⭕ O/X로 확인 ▶</button></div></div>`;
    view.onclick = e => { const b = e.target.closest('[data-tab2]'); if (b) go(`#/p/${p.id}/${b.dataset.tab2}`, true); };
    anim = KOA.mount($('#animbox'), p.anim, p); }

  function oxList(items, getAns, setAns, onDone) { /* items: [{t, a, why, p, hl, src}] */
    return items.map((x, i) => { const v = getAns(i), ans = v === undefined ? '' : (v === 1) === !!x.a ? 'right' : 'wrong';
      return `<div class="oxi ${ans}" data-i="${i}"><div class="oxt"><span class="oxn">${i + 1}</span>${x.src ? `<em>${x.src}</em> ` : ''}${x.t}</div>
      <div class="oxb"><button class="opt o${v === 1 ? ' pick' : ''}" data-v="1">O</button><button class="opt x${v === 0 ? ' pick' : ''}" data-v="0">X</button></div>
      <div class="oxw"><b class="rs">${ans === 'right' ? '⭕ 맞았어요' : '❌ 틀렸어요'}</b> — 정답 <b>${x.a ? 'O' : 'X'}</b> · ${x.why} ${x.p != null ? `<a class="tapme" data-pid="${x.pid}" data-hl="${x.p}">${x.p + 1}문단 보기 ›</a>` : ''}</div></div>`; }).join('');
  }
  function bindOx(pa, items, getAns, setAns, rerender) {
    pa.addEventListener('click', e => { const b = e.target.closest('.oxb .opt'); const a = e.target.closest('[data-hl]');
      if (a) { go(`#/p/${a.dataset.pid}/read?hl=${a.dataset.hl}`); return; }
      if (!b) return; const it = b.closest('.oxi'), i = +it.dataset.i; if (getAns(i) !== undefined) return; const v = +b.dataset.v; setAns(i, v);
      const ok = (v === 1) === !!items[i].a; it.classList.add(ok ? 'right' : 'wrong'); b.classList.add('pick'); it.querySelector('.oxw .rs').textContent = ok ? '⭕ 맞았어요' : '❌ 틀렸어요'; rerender && rerender(); });
  }
  function ox(p) { const g = P(p.id); g.ox = g.ox || {}; let only = false;
    const items = p.ox.map(([t, a, why, pi]) => ({ t, a, why, p: pi, pid: p.id }));
    const draw = () => { const sc = score(p); const pa = paper(`${srcLine(p)}<h1 class="ptitle">⭕ O/X — ${p.title}</h1>
      <div class="qtop"><span class="big">${sc.ox} / ${p.ox.length}</span><button data-only class="${only ? 'on' : ''}">틀린 것만</button><button data-reset>다시 풀기</button></div>
      <div class="oxl">${oxList(items, i => g.ox[i], null)}</div><div class="endnav"><button data-tab2="blank">🧩 빈칸으로 ▶</button></div>`, `${p.id}:ox`);
      if (only) pa.querySelectorAll('.oxi').forEach(el => { const v = g.ox[el.dataset.i]; if (v === undefined || (v === 1) === !!items[el.dataset.i].a) el.hidden = true; });
      bindOx(pa, items, i => g.ox[i], (i, v) => { g.ox[i] = v; save(); }, () => { const sc2 = score(p); pa.querySelector('.qtop .big').textContent = `${sc2.ox} / ${p.ox.length}`; });
      pa.addEventListener('click', e => { if (e.target.closest('[data-only]')) { only = !only; draw(); } if (e.target.closest('[data-reset]')) { g.ox = {}; save(); only = false; draw(); } const b = e.target.closest('[data-tab2]'); if (b) go(`#/p/${p.id}/${b.dataset.tab2}`, true); }); };
    draw(); }

  function blank(p) { const g = P(p.id); g.blank = g.blank || {};
    const pa = paper(`${srcLine(p)}<h1 class="ptitle">🧩 빈칸 — ${p.title}</h1><div class="qtop"><span>빈칸을 먼저 머릿속으로(또는 펜으로) 채운 뒤 눌러서 확인!</span><button data-hideall>모두 다시 가리기</button></div>
      <ol class="bl">${p.blanks.map(([s, a], i) => `<li>${s.replace('___', `<button class="opt blk${g.blank[i] ? ' open' : ''}" data-i="${i}"><span>${a}</span></button>`)}</li>`).join('')}</ol>
      <div class="endnav"><button data-tab2="quiz">📝 문제 풀기 ▶</button></div>`, `${p.id}:blank`);
    pa.onclick = e => { const b = e.target.closest('.blk'); if (b) { b.classList.toggle('open'); g.blank[b.dataset.i] = 1; save(); }
      if (e.target.closest('[data-hideall]')) pa.querySelectorAll('.blk').forEach(x => x.classList.remove('open'));
      const t = e.target.closest('[data-tab2]'); if (t) go(`#/p/${p.id}/${t.dataset.tab2}`, true); };
  }

  function quiz(p) { const g = P(p.id); g.quiz = g.quiz || {};
    const qh = (q, i) => { const v = g.quiz[i];
      return `<div class="qc${v !== undefined ? ' done' : ''}" data-i="${i}"><div class="qhd"><span class="tag${/기출/.test(q.tag) ? ' ex' : ''}">${q.tag}</span><b>${i + 1}.</b> ${KO.mark(q.q)}</div>
      ${q.img ? `<img class="qimg" src="${q.img}" alt="보기 그림">` : ''}${q.bogi ? `<div class="bogi"><span>&lt;보기&gt;</span>${q.bogi}</div>` : ''}
      <div class="opts">${q.opts.map((o, k) => `<button class="opt qo${v !== undefined && k === q.a ? ' ok' : ''}${v === k && k !== q.a ? ' no' : ''}" data-k="${k}"><span>${NUM[k]}</span>${o}</button>`).join('')}</div>
      <div class="why">${v !== undefined ? whyHtml(q, v) : ''}</div></div>`; };
    const whyHtml = (q, v) => `<div class="res ${v === q.a ? 'r' : 'w'}">${v === q.a ? '⭕ 정답!' : `❌ 고른 답 ${NUM[v]} · 정답 ${NUM[q.a]}`} <button class="tapme rq">다시 풀기</button></div><ul>${q.why.map((w, k) => `<li class="${k === q.a ? 'a' : ''}"><b>${NUM[k]}</b> ${w}</li>`).join('')}</ul>`;
    const sc = score(p);
    const pa = paper(`${srcLine(p)}<h1 class="ptitle">📝 문제 — ${p.title}</h1><div class="qtop"><span class="big">${sc.q} / ${p.quiz.length}</span><span>${p.exam ? '기출 4문항 + 변형' : '변형 문제 (시험 대비 자체 제작)'} · 펜으로 지문 근거를 표시하며 풀어 봐요</span></div>
      ${p.quiz.map(qh).join('')}<div class="endnav"><button data-nextp>다음 지문 ▶</button></div>`, `${p.id}:quiz`);
    pa.onclick = e => { const o = e.target.closest('.qo'), r = e.target.closest('.rq');
      if (o) { const c = o.closest('.qc'), i = +c.dataset.i, q = p.quiz[i]; if (g.quiz[i] !== undefined) return; const k = +o.dataset.k; g.quiz[i] = k; save();
        c.classList.add('done'); c.querySelectorAll('.qo').forEach(b => { if (+b.dataset.k === q.a) b.classList.add('ok'); }); if (k !== q.a) o.classList.add('no'); c.querySelector('.why').innerHTML = whyHtml(q, k);
        const s2 = score(p); pa.querySelector('.qtop .big').textContent = `${s2.q} / ${p.quiz.length}`; }
      if (r) { const c = r.closest('.qc'), i = +c.dataset.i; delete g.quiz[i]; save(); c.classList.remove('done'); c.querySelectorAll('.qo').forEach(b => b.classList.remove('ok', 'no')); c.querySelector('.why').innerHTML = ''; }
      if (e.target.closest('[data-nextp]')) { const os = order().filter(x => !x.extra); const j = os.indexOf(p); go(j >= 0 && j < os.length - 1 ? `#/p/${os[j + 1].id}/read` : '#/'); } };
  }

  /* ── 전 범위 O/X 섞어 풀기 ── */
  function rush() { header('🔥 전 범위 O/X 20', null); let set; try { set = JSON.parse(LS('ko_rush') || 'null'); } catch (e) { }
    const all = []; order().filter(p => !p.extra).forEach(p => p.ox.forEach((x, i) => all.push(p.id + ':' + i)));
    const fresh = () => { const a = all.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } set = { ids: a.slice(0, 20), ans: {} }; SS('ko_rush', JSON.stringify(set)); };
    if (!set || !set.ids || set.ids.some(id => !KO.get(id.split(':')[0]))) fresh();
    const draw = () => { const items = set.ids.map(id => { const [pid, i] = id.split(':'), p = KO.get(pid), x = p.ox[+i]; return { t: x[0], a: x[1], why: x[2], p: x[3], pid, src: p.emoji + ' ' + p.title.split(' ')[0] }; });
      const right = Object.entries(set.ans).filter(([i, v]) => (v === 1) === !!items[i].a).length;
      const pa = paper(`<h1 class="ptitle">🔥 전 범위 O/X 섞어 풀기</h1><div class="qtop"><span class="big">${right} / ${items.length}</span><button data-new>새 20문항</button></div><div class="oxl">${oxList(items, i => set.ans[i])}</div>`, 'rush');
      bindOx(pa, items, i => set.ans[i], (i, v) => { set.ans[i] = v; SS('ko_rush', JSON.stringify(set)); }, () => { const r2 = Object.entries(set.ans).filter(([i, v]) => (v === 1) === !!items[i].a).length; pa.querySelector('.qtop .big').textContent = `${r2} / ${items.length}`; });
      pa.addEventListener('click', e => { if (e.target.closest('[data-new]')) { fresh(); draw(); view.scrollTop = 0; } }); };
    draw(); }

  addEventListener('resize', () => { clearTimeout(window._rz); window._rz = setTimeout(() => { const w0 = W; measure(); if (W !== w0) render(); else { sizeWrap(); KOInk.setScale(S); if (anim && anim.resize) anim.resize(); } }, 200); });
  document.addEventListener('DOMContentLoaded', () => { if (!location.hash) history.replaceState(null, '', '#/'); render(); });
})();
