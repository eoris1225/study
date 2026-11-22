'use strict';
/* 영어 지문 게임: 지도 → (대화) → 애니메이션 → 독해 → 도전 → 결과 */
const Snd = { play(k) { try { Sfx.play(k); } catch (e) { } }, music(m) { try { Sfx.music(m); } catch (e) { } } };
const $ = s => document.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEY = 'en_same_v1';
let SV; try { SV = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { SV = {}; }
SV.stars = SV.stars || {}; SV.xp = SV.xp || 0; SV.split = SV.split ?? true; SV.sceneVoice = SV.sceneVoice ?? true;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) { } };
/* 지문 서랍: 지문 하나 = 한 판. 새 지문은 window.PASSAGES에 같은 모양으로 넣으면 된다 (quest·장면은 없어도 됨) */
const LIB = [Object.assign(window.EN, { id: 'same', quest: window.QUEST, scenes: true, mark: ['The Same', 'The Same'] })].concat(window.PASSAGES || []);
let CUR = LIB[0], P = CUR.paras, PI = {};
function use(ps) { CUR = ps; window.EN = ps; window.QUEST = ps.quest || {}; P = ps.paras; PI = Object.fromEntries(P.map((p, i) => [p.id, i])); SV.cur = ps.id; save(); }
use(LIB.find(x => x.id === SV.cur) || LIB[0]);

/* ── 인물 ─────────────────────────────────────────── */
const WHO = { s: { n: '서진', c: '#ff8a3d' }, h: { n: '하람 선배', c: '#5b6cff' }, n: { n: '', c: '#999' } };
function face(who, size = 64) {
  const c = h('canvas', 'face'); c.width = c.height = size * 2; c.style.width = c.style.height = size + 'px'; const x = c.getContext('2d'); x.scale(size / 32, size / 32);
  x.fillStyle = who === 's' ? '#ffe0c7' : '#e8e3ff'; x.beginPath(); x.arc(32, 32, 32, 0, 7); x.fill();
  if (who === 's') { x.fillStyle = '#ff8a3d'; x.beginPath(); x.ellipse(32, 64, 28, 18, 0, Math.PI, 0); x.fill(); x.fillStyle = '#ffd9b8'; x.beginPath(); x.arc(32, 30, 16, 0, 7); x.fill(); x.fillStyle = '#3a2618'; x.beginPath(); x.arc(32, 26, 17, Math.PI * 1.02, Math.PI * 1.98); x.fill(); x.fillRect(15, 22, 6, 8); }
  else { x.fillStyle = '#2b2f6b'; x.beginPath(); x.ellipse(32, 64, 28, 18, 0, Math.PI, 0); x.fill(); x.fillStyle = '#1d1535'; x.beginPath(); x.ellipse(32, 34, 20, 24, 0, 0, 7); x.fill(); x.fillStyle = '#ffd9b8'; x.beginPath(); x.arc(32, 31, 15, 0, 7); x.fill(); x.fillStyle = '#1d1535'; x.beginPath(); x.arc(32, 26, 16, Math.PI * 1.05, Math.PI * 1.95); x.fill(); x.strokeStyle = '#1d1535'; x.lineWidth = 1.6; x.strokeRect(22, 28, 8, 6); x.strokeRect(34, 28, 8, 6); x.beginPath(); x.moveTo(30, 31); x.lineTo(34, 31); x.stroke(); }
  x.fillStyle = '#1d1535'; x.beginPath(); x.arc(26, 31, 1.8, 0, 7); x.arc(38, 31, 1.8, 0, 7); x.fill(); x.strokeStyle = '#1d1535'; x.lineWidth = 1.4; x.beginPath(); x.arc(32, 36, 4, .4, Math.PI - .4); x.stroke(); return c;
}

/* 장면 사이 대화 — 방과 후 도서관, 수행평가 사흘 전. 플레이어(너)의 대사는 쓰지 않는다. */
const TALK = {
  same: { in: [['n', '방과 후 도서관. 히터가 탁탁 소리를 내며 돈다. 책상 위엔 7쪽짜리 유인물과 서진의 해석 노트.'], ['s', '수행평가 사흘 남았거든? 근데 나 이거 다 해석해 놨어. 너는 검토만 해 주면 돼.'], ['n', '딸깍. 서진이 펜 뚜껑을 눌렀다.'], ['h', '다 했다는 사람 노트치고 포스트잇이 너무 많은데.'], ['s', '그건… 장식이에요, 선배님.']],
    out: [['h', '끝. 수고했어.'], ['s', '선배, 저 이제 이거 다 해석할 수 있어요.'], ['h', '노트 줘 봐.'], ['n', '서진은 노트를 품에 안고 일어났다. 포스트잇 두 장이 바닥에 떨어졌다.']] }
};

/* ── 화면 틀 ─────────────────────────────────────── */
const app = () => $('#app');
function screen(cls) { if (typeof Reader !== 'undefined') Reader.stop(); const a = app(); a.innerHTML = ''; a.className = cls || ''; window.scrollTo(0, 0); return a; }
function topbar(title, back) { const b = h('div', 'top'); const l = h('button', 'ghost', back ? '◀ ' + back[0] : '🏠'); l.onclick = back ? back[1] : home; b.append(l, h('div', 'ttl', title), h('div', 'xp', `✦ ${SV.xp}`)); return b; }

/* 대화 재생 */
function talk(lines, done) {
  if (!lines || !lines.length) return done();
  const ov = h('div', 'talk'); document.body.appendChild(ov); let i = 0;
  const show = () => { if (i >= lines.length) { ov.remove(); return done(); } const [w, t] = lines[i]; ov.innerHTML = ''; const box = h('div', 'tbox ' + (w === 'n' ? 'narr' : '')); if (w !== 'n') { box.appendChild(face(w, 56)); box.appendChild(h('b', '', WHO[w].n)).style.color = WHO[w].c; } box.appendChild(h('p', '', t)); box.appendChild(h('small', '', '탭해서 계속 ▸')); ov.appendChild(box); const sk = h('button', 'tskip', '건너뛰기'); sk.onclick = e => { e.stopPropagation(); ov.remove(); done(); }; ov.appendChild(sk); Snd.play(w === 'n' ? 'paper' : 'talk'); };
  ov.onclick = () => { i++; show(); }; show();
}

/* ── 단어 팝업 ───────────────────────────────────── */
function lookup(w) {
  const k = w.toLowerCase().replace(/[’]/g, "'"); const D = window.DICT;
  return D[k] || D[k.replace(/'s$/, '')] || D[k.replace(/s$/, '')] || D[k.replace(/es$/, '')] || D[k.replace(/ed$/, '')] || D[k.replace(/d$/, '')] || D[k.replace(/ing$/, '')] || null;
}
function wrapWords(html) { return html.split(/(<[^>]+>)/).map(p => p.startsWith('<') ? p : p.replace(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’\-]*/g, m => `<span class="w">${m}</span>`)).join(''); }
let tip;
function showTip(el) {
  if (tip) tip.remove(); const m = lookup(el.textContent); tip = h('div', 'tip', `<b>${el.textContent}</b> ${m || '<span class="dim">기본 단어</span>'}`); document.body.appendChild(tip);
  const r = el.getBoundingClientRect(); const tw = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px'; tip.style.top = (r.top > 70 ? r.top - tip.offsetHeight - 8 : r.bottom + 8) + 'px'; Snd.play('tick');
  SV.looked = (SV.looked || 0) + 1; clearTimeout(showTip.t); showTip.t = setTimeout(() => tip && tip.remove(), 3200);
}
document.addEventListener('click', e => { const w = e.target.closest && e.target.closest('.w'); if (w) { e.stopPropagation(); showTip(w); } else if (tip) { tip.remove(); tip = null; } }, true);

/* ── 홈(지문 서랍) / 지문 허브 ─────────────────── */
function home() {
  Snd.music('title'); const a = screen('home');
  a.innerHTML = `<div class="hero"><div class="mirror"><span>Read</span><span class="flip">Read</span></div><h1>영어 지문 RPG</h1><p class="dim">지문 하나가 한 판이에요. 이야기로 보고 → 읽고 → 실전 도전.</p></div>`;
  const list = h('div', 'lib'); LIB.forEach(ps => { const st = SV.stars[ps.id] || 0; const c = h('button', 'pcard', `<b>${ps.title}</b><small>${ps.source.split('—')[0].split(',')[0]}</small><span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span><span class="dim">${ps.paras.length}문단 · ${ps.paras.reduce((n, p) => n + p.s.length, 0)}문장</span>`); c.onclick = () => { use(ps); Snd.play('click'); hub(); }; list.appendChild(c); }); a.appendChild(list);
  const bs = h('div', 'btns'); const ph = h('button', 'ghost', '⚛ 물리로 가기'); ph.onclick = () => location.href = 'index.html?physics'; bs.append(ph); a.appendChild(bs);
}
function hub() {
  Snd.music('camp'); const a = screen('hubs'); a.appendChild(topbar(CUR.title, ['지문 목록', home]));
  const st = SV.stars[CUR.id] || 0, seen = (SV.seen || {})[CUR.id] || {};
  a.appendChild(h('div', 'hhead', `<div class="mirror small"><span>${CUR.mark ? CUR.mark[0] : ''}</span><span class="flip">${CUR.mark ? CUR.mark[1] : ''}</span></div><p class="gist">${CUR.gist}</p><span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>`));
  const steps = [
    ['🎬', '이야기로 보기', CUR.scenes ? '지문 전체를 애니메이션으로 (약 4분)' : '이 지문은 애니메이션 준비 중 (읽기부터 시작하세요)', () => { if (!CUR.scenes) { Snd.play('wrong'); return; } mark('scene'); playAll(); }, seen.scene],
    ['📖', '읽기', '전체 지문 · 끊어 읽기 · 단어 터치 · 낭독', () => { mark('read'); read(); }, seen.read],
    ['⚔', CUR.exam ? '실전 풀이' : '실전 도전', CUR.exam ? `시험지 그대로 ${P.filter(p => p.q).length}문항 · 끝나면 채점` : '지문 전체에서 섞어 15문제 · 별 3개 도전', () => challenge(), st],
    ['📄', '분석 노트', '출처 · 구조 · 전문 해석 · 문법 · 단어장', () => notes(), 0]
  ];
  const g = h('div', 'steps'); steps.forEach(([ic, t, d, f, done], k) => { const b = h('button', 'step' + (done ? ' done' : ''), `<span class="ic">${ic}</span><b>${k + 1}. ${t}</b><small>${d}</small>`); b.onclick = () => { Snd.play('click'); f(); }; g.appendChild(b); }); a.appendChild(g);
  if (!seen.intro && TALK[CUR.id]) { mark('intro'); talk(TALK[CUR.id].in, () => { }); }
}
function mark(k) { SV.seen = SV.seen || {}; (SV.seen[CUR.id] = SV.seen[CUR.id] || {})[k] = 1; save(); }
function playAll(from = 0, back = hub) { const ids = P.map(p => p.id).filter(id => EScene.has(id)); if (!ids.length) return back(); const go = k => { if (k >= ids.length) return back(); EScene.play(ids[k], skipped => skipped ? back() : go(k + 1)); }; go(from); }
/* 표기: {{틀린것|고친것}} / [[빈칸 정답]] */
function fmt(t, mode) { return t.replace(/\{\{([^|}]*)\|([^}]*)\}\}/g, (m, a, b) => mode === 'exam' ? `<u>${a}</u>` : mode === 'plain' ? b : `<del>${a}</del> <ins>${b}</ins>`).replace(/\[\[([^\]]*)\]\]/g, (m, a) => mode === 'exam' ? '<span class="blank">　　　　　　</span>' : mode === 'plain' ? a : `<mark>${a}</mark>`); }
function examText(p) { if (p.q.text) return p.q.text; return '<p>' + p.s.filter(s => !/^→/.test(s[0])).map(s => fmt(s[0].split(' / ').join(' '), 'exam')).join(' ') + '</p>'; }
function sentenceView(s, idx, opts = {}) {
  const [en, ko, tr, g] = s; const ens = en.split(' / '), kos = ko.split(' | ');
  const el = h('div', 'sent'); el.innerHTML = `<div class="sn">${idx + 1}</div><div class="eng">${ens.map((c, i) => `<span class="ck" data-i="${i}">${wrapWords(fmt(c, 'read'))}</span>`).join('<span class="sl"> / </span>')}</div><div class="kos">${ens.map((c, i) => `<span class="kc"><i>${i + 1}</i>${kos[i]}</span>`).join('')}</div><div class="tr">${tr}</div><div class="gr">${(g || []).map(x => `<div>▸ ${x}</div>`).join('')}</div><div class="sbtn"><button data-t="say" class="say1">🔊 듣기</button><button data-t="kos">끊어 해석</button><button data-t="tr">전체 해석</button>${g && g.length ? '<button data-t="gr">문법 메모</button>' : ''}</div>`;
  el._it = { el, s, pid: opts.pid, si: idx };
  el.querySelector('.sbtn').onclick = e => { const t = e.target.dataset.t; if (!t) return; if (t === 'say') { Reader.one(el._it); return; } el.classList.toggle('show-' + t); e.target.classList.toggle('on'); Snd.play('click'); if (t === 'gr' || t === 'tr') { el.dataset.seen = 1; } };
  if (opts.open) el.classList.add('show-kos', 'show-tr', 'show-gr');
  return el;
}
function read() {
  Snd.music('camp'); const a = screen('read'); a.appendChild(topbar(CUR.title + ' — 읽기', ['허브', hub]));
  const tools = h('div', 'tools'); const sp = h('button', SV.split ? 'on' : '', '/ 끊어 읽기 표시'); sp.onclick = () => { SV.split = !SV.split; save(); a.classList.toggle('nosplit', !SV.split); sp.classList.toggle('on', SV.split); };
  const all = h('button', '', '모두 펼치기'); all.onclick = () => a.querySelectorAll('.sent').forEach(s => s.classList.add('show-kos', 'show-tr', 'show-gr'));
  const fold = h('button', '', '모두 접기'); fold.onclick = () => a.querySelectorAll('.sent').forEach(s => s.classList.remove('show-kos', 'show-tr', 'show-gr'));
  tools.append(sp, all, fold); a.appendChild(tools); a.classList.toggle('nosplit', !SV.split);
  a.appendChild(h('p', 'hint', '단어를 누르면 뜻이 나와요. 문장마다 [끊어 해석] → [전체 해석] → [문법 메모]. 문단 제목 옆 버튼으로 그 문단 장면을 보거나 그 문단만 연습할 수 있어요.'));
  Reader.attach(a, () => [...a.querySelectorAll('.sent')].map(e => e._it));
  let sec = -1;
  P.forEach((p, i) => {
    if (p.sec !== sec) { sec = p.sec; a.appendChild(h('div', 'sech', CUR.secs[sec])); }
    const hd = h('div', 'phead', `<b>${i + 1}. ${p.name}</b>`); if (EScene.has(p.id)) { const sc = h('button', '', '🎬'); sc.title = '이 문단 장면'; sc.onclick = () => EScene.play(p.id, () => { }); hd.appendChild(sc); }
    if (p.q) { const qb = h('button', 'qbtn', '📝 문제 풀기'); qb.onclick = () => practice(p, true); hd.appendChild(qb); } const pr = h('button', '', p.q ? '⚔ 연습' : '⚔ 이 문단만'); pr.onclick = () => practice(p); hd.appendChild(pr); a.appendChild(hd);
    p.s.forEach((s, j) => a.appendChild(sentenceView(s, j, { pid: p.id })));
  });
  const go = h('button', 'pri big', '⚔ 실전 도전'); go.onclick = () => challenge(); a.appendChild(go);
}

/* ── 도전 ───────────────────────────────────────── */
function autoVoc(p) { const seen = new Set(); const out = []; p.s.forEach(s => s[0].replace(/<[^>]+>/g, '').split(/[^A-Za-zÀ-ÿ'\-]+/).forEach(w => { const k = w.toLowerCase(); if (k.length > 6 && !seen.has(k) && DICT[k]) { seen.add(k); out.push([w, DICT[k].split(/[(/,]/)[0].trim()]); } })); return out; }
function qOf(id) { const q = QUEST[id] || {}; return { voc: q.voc && q.voc.length ? q.voc : autoVoc(P[PI[id]]), gram: q.gram || [], wrong: q.wrong || [] }; }
function allVoc() { return P.flatMap(p => qOf(p.id).voc); }
function pool(ids) {
  const R = { voc: [], wrong: [], order: [], gram: [], exam: [] };
  ids.forEach(id => { const q = qOf(id), p = P[PI[id]];
    q.voc.forEach(v => R.voc.push({ k: 'voc', v, id })); q.wrong.forEach(w => R.wrong.push({ k: 'wrong', w, id }));
    p.s.forEach((s, i) => { if (s[0].split(' / ').length >= 3) R.order.push({ k: 'order', s, i, id }); }); q.gram.forEach(g => R.gram.push({ k: 'gram', g, id })); if (p.q) R.exam.push({ k: 'exam', p, id }); });
  return R;
}
function makeRounds(ids, n) { const R = pool(ids), take = (a, k) => shuffle(a).slice(0, k); const out = [...take(R.voc, n.voc), ...take(R.wrong, n.wrong), ...take(R.order, n.order), ...take(R.gram, n.gram), ...(n.exam ? R.exam : [])]; const o = { voc: 0, wrong: 1, order: 2, gram: 3, exam: 4 }; return out.sort((a, b) => o[a.k] - o[b.k]); }
function challenge() { if (CUR.exam) { Snd.music('tense'); return runRounds({ id: CUR.id, type: 'all' }, pool(P.map(p => p.id)).exam, { noHearts: 1, title: CUR.title + ' — 실전 풀이' }); } Snd.music('tense'); runRounds({ id: CUR.id, type: 'all' }, makeRounds(P.map(p => p.id), { voc: 5, wrong: 3, order: 3, gram: 4 }), { hearts: 4, title: CUR.title + ' — 실전 도전' }); }
function practice(p, only) { if (only && p.q) { Snd.music('tense'); return runRounds({ id: CUR.id + ':' + p.id + ':q', type: 'para', p }, [{ k: 'exam', p, id: p.id }], { noHearts: 1, title: p.name }); } Snd.music('tense'); runRounds({ id: CUR.id + ':' + p.id, type: 'para', p }, makeRounds([p.id], { voc: 4, wrong: 2, order: 2, gram: 3, exam: 1 }), { hearts: 3, title: p.name + ' — 문단 연습' }); }
function runRounds(st, rounds, cfg) {
  const a = screen('chal' + (cfg.boss ? ' bossmode' : '')); let i = 0, hearts = cfg.hearts, miss = 0, combo = 0, gained = 0;
  const top = topbar(cfg.title, ['나가기', () => confirm('도전을 그만두고 나갈까요?') && hub()]); a.appendChild(top);
  const hud = h('div', 'hud'); a.appendChild(hud); const body = h('div', 'rbody'); a.appendChild(body);
  let timer = null;
  const drawHud = () => { hud.innerHTML = (cfg.noHearts ? `<span class="score">✔ ${i - miss < 0 ? 0 : i - miss} / ✘ ${miss}</span>` : `<span class="hearts">${'♥'.repeat(Math.max(0, hearts))}<s>${'♥'.repeat(Math.max(0, cfg.hearts - hearts))}</s></span>`) + `<span class="bar"><i style="width:${i / rounds.length * 100}%"></i></span><span class="cnt">${i + 1 > rounds.length ? rounds.length : i + 1}/${rounds.length}</span><span class="combo ${combo >= 2 ? 'on' : ''}">${combo >= 2 ? combo + ' 콤보!' : ''}</span>` + (cfg.timer ? '<span class="tbar"><i></i></span>' : ''); };
  const ok = (bonus = 0) => { combo++; const g = 10 + Math.min(combo, 5) * 2 + bonus; gained += g; Snd.play(combo >= 3 ? 'orb' : 'win'); fx('+' + g + ' ✦', '#3ddc97'); };
  const bad = () => { combo = 0; miss++; if (!cfg.noHearts) hearts--; Snd.play('wrong'); a.classList.add('hit'); setTimeout(() => a.classList.remove('hit'), 350); drawHud(); };
  const fx = (s, c) => { const f = h('div', 'fx', s); f.style.color = c; a.appendChild(f); setTimeout(() => f.remove(), 900); };
  const next = () => { clearInterval(timer); i++; if (hearts <= 0) return fail(); if (i >= rounds.length) return finish(); show(); };
  const startTimer = onOut => { if (!cfg.timer) return; let left = cfg.timer; const bar = hud.querySelector('.tbar i'); timer = setInterval(() => { left -= .1; if (bar) bar.style.width = (left / cfg.timer * 100) + '%'; if (left <= 0) { clearInterval(timer); onOut(); } }, 100); };
  const cont = (msg, good) => { const c = h('div', 'after ' + (good ? 'good' : 'bad'), msg); const b = h('button', 'pri', hearts <= 0 ? '결과 보기' : '다음 ▶'); b.onclick = next; c.appendChild(b); body.appendChild(c); b.focus(); };
  function show() {
    drawHud(); body.innerHTML = ''; const r = rounds[i];
    if (r.k === 'voc') {
      body.appendChild(h('div', 'qk', '단어 러시 — 뜻을 고르세요'));
      body.appendChild(h('div', 'vword', r.v[0]));
      const pool = shuffle(allVoc().filter(v => v[1] !== r.v[1])).slice(0, 3).map(v => v[1]); const opts = shuffle([r.v[1], ...pool]);
      const g = h('div', 'opts'); opts.forEach(o => { const b = h('button', '', o); b.onclick = () => { clearInterval(timer); g.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.textContent === r.v[1]) x.classList.add('right'); }); if (o === r.v[1]) { ok(); setTimeout(next, 650); } else { b.classList.add('wrong'); bad(); cont(`<b>${r.v[0]}</b> = ${r.v[1]}`, false); } }; g.appendChild(b); }); body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.textContent === r.v[1]) x.classList.add('right'); }); bad(); cont('시간 초과! ' + `<b>${r.v[0]}</b> = ${r.v[1]}`, false); });
    }
    if (r.k === 'wrong') {
      const [si, ci, wko, line, why] = r.w; const s = P[PI[r.id]].s[si], ens = s[0].split(' / '), kos = s[1].split(' | ').slice(); kos[ci] = wko;
      body.appendChild(h('div', 'qk', '서진의 해석 노트 — 틀린 조각을 누르세요'));
      const bub = h('div', 'say'); bub.appendChild(face('s', 44)); bub.appendChild(h('p', '', line)); body.appendChild(bub);
      const g = h('div', 'chunks'); ens.forEach((c, k) => { const b = h('button', 'chk', `<span class="e">${c}</span><span class="k">${kos[k]}</span>`); b.onclick = () => { clearInterval(timer); g.querySelectorAll('button').forEach(x => x.disabled = true); g.children[ci].classList.add('right'); if (k === ci) { ok(5); cont(`✔ 정확해요! <b>${s[1].split(' | ')[ci]}</b><br><small>${why}</small>`, true); } else { b.classList.add('wrong'); bad(); cont(`틀린 곳은 ${ci + 1}번 조각. 바른 해석: <b>${s[1].split(' | ')[ci]}</b><br><small>${why}</small>`, false); } }; g.appendChild(b); }); body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => x.disabled = true); g.children[ci].classList.add('right'); bad(); cont(`시간 초과! 바른 해석: <b>${s[1].split(' | ')[ci]}</b><br><small>${why}</small>`, false); });
    }
    if (r.k === 'order') {
      const ens = r.s[0].split(' / '), kos = r.s[1].split(' | '); let at = 0, err = 0;
      body.appendChild(h('div', 'qk', '끊어 읽기 퍼즐 — 영어 조각을 원래 순서대로 누르세요'));
      body.appendChild(h('div', 'meaning', r.s[2]));
      const built = h('div', 'built'); body.appendChild(built); const g = h('div', 'pieces');
      shuffle(ens.map((c, k) => [c, k])).forEach(([c, k]) => { const b = h('button', 'pc', c.replace(/<[^>]+>/g, '')); b.onclick = () => { if (k === at) { Snd.play('click'); b.disabled = true; b.classList.add('used'); built.appendChild(h('span', 'bk', `${c}<small>${kos[k]}</small>`)); at++; if (at === ens.length) { clearInterval(timer); if (!err) ok(5); else { combo = 0; } cont(err ? '완성! (실수 ' + err + '번)' : '✔ 완벽한 순서!', !err); } } else { err++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 300); Snd.play('wrong'); if (err === 2) bad(); } }; g.appendChild(b); });
      body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => x.disabled = true); bad(); cont('시간 초과! 순서: ' + ens.join(' / '), false); });
    }
    if (r.k === 'exam') {
      const q = r.p.q; body.appendChild(h('div', 'qk', '실전 문제 — 시험지 그대로'));
      const paper = h('div', 'paper', `<div class="ask">${q.ask}</div><div class="ptext">${examText(r.p)}</div>${q.summary ? `<div class="summ">${q.summary}</div>` : ''}${q.note ? `<div class="pnote">${q.note}</div>` : ''}`); body.appendChild(paper);
      paper.querySelectorAll('.ptext p, .summ').forEach(e => e.innerHTML = wrapWords(e.innerHTML));
      const g = h('div', 'opts col'); const nums = ['①', '②', '③', '④', '⑤'];
      q.opts.forEach((o, k) => { const b = h('button', '', (o.length > 2 ? nums[k] + ' ' : '') + o); b.onclick = () => { g.querySelectorAll('button').forEach(x => x.disabled = true); g.children[q.ans].classList.add('right'); if (k === q.ans) { ok(5); cont('✔ 정답! ' + q.why, true); } else { b.classList.add('wrong'); bad(); cont(`정답은 ${nums[q.ans]}. ${q.why}`, false); } const rv = h('button', '', '📖 이 문항 끊어 읽기·해석 보기'); rv.onclick = () => { const ov = h('div', 'talk solo'); const bx = h('div', 'tbox wide'); bx.appendChild(h('b', '', r.p.name)); r.p.s.forEach((s, j) => { const sv = sentenceView(s, j, { pid: r.p.id }); sv.classList.add('show-kos', 'show-tr', 'show-gr'); bx.appendChild(sv); }); const cl = h('button', 'pri', '닫기'); cl.onclick = () => ov.remove(); bx.appendChild(cl); ov.appendChild(bx); document.body.appendChild(ov); }; body.querySelector('.after').prepend(rv); }; g.appendChild(b); }); body.appendChild(g);
    }
    if (r.k === 'gram') {
      const [q, opts, ans, why] = r.g; body.appendChild(h('div', 'qk', '문법 체크'));
      body.appendChild(h('div', 'gq', q)); const g = h('div', 'opts col'); const sh = shuffle(opts.map((o, k) => [o, k]));
      sh.forEach(([o, k]) => { const b = h('button', '', o); b.onclick = () => { clearInterval(timer); g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); if (k === ans) { ok(); cont('✔ ' + why, true); } else { b.classList.add('wrong'); bad(); cont(why, false); } }; g.appendChild(b); }); body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); bad(); cont('시간 초과! ' + why, false); });
    }
  }
  function finish() {
    const stars = cfg.noHearts ? (miss === 0 ? 3 : miss / rounds.length <= .25 ? 2 : 1) : miss === 0 ? 3 : miss <= 2 ? 2 : 1; const prev = SV.stars[st.id] || 0; SV.stars[st.id] = Math.max(prev, stars); SV.xp += gained + stars * 10; save(); Snd.music('happy'); Snd.play('win');
    body.innerHTML = ''; hud.innerHTML = ''; const r = h('div', 'result', `<div class="big">${'★'.repeat(stars)}<s>${'★'.repeat(3 - stars)}</s></div><h2>클리어!</h2><p>실수 ${miss}번 · 얻은 공명 ✦ ${gained + stars * 10}</p>`);
    const nx = h('button', 'pri', st.type === 'all' ? '계속 ▶' : '읽기로 돌아가기'); nx.onclick = () => st.type === 'all' ? talk(TALK[CUR.id] && !prev ? TALK[CUR.id].out : null, hub) : read();
    const rt = h('button', '', '↺ 다시 도전'); rt.onclick = () => st.type === 'all' ? challenge() : practice(st.p);
    r.append(nx, rt); body.appendChild(r);
  }
  function fail() {
    Snd.music('sad'); body.innerHTML = ''; const r = h('div', 'result fail', `<h2>하트가 다 떨어졌어요</h2><p>괜찮아요. 틀린 문장을 다시 읽고 오면 돼요.</p>`);
    const rd = h('button', 'pri', '📖 다시 읽기'); rd.onclick = () => read();
    const rt = h('button', '', '↺ 바로 다시 도전'); rt.onclick = () => st.type === 'all' ? challenge() : practice(st.p); r.append(rd, rt); body.appendChild(r);
  }
  show();
}
/* ── 지문 분석 노트 ─────────────────────────────── */
function notes() {
  Snd.music('camp'); const a = screen('notes'); a.appendChild(topbar(CUR.title + ' — 분석 노트', ['허브', hub]));
  const tabs = h('div', 'tabs'); const body = h('div', 'nbody'); a.append(tabs, body);
  const T = {
    '출처·배경': () => `<h3>출처</h3><p>${EN.source}</p><p>${EN.author}</p><h3>배경: 탈리도마이드 사건</h3><ul>${EN.background.map(x => `<li>${x}</li>`).join('')}</ul>`,
    '구조·요지': () => `<h3>한 줄 요지</h3><p class="gist">${EN.gist}</p><h3>글의 흐름</h3>${EN.structure.map(([t, d]) => `<div class="stc"><b>${t}</b><p>${d}</p></div>`).join('')}<h3>문단별 지도</h3>${P.map((p, i) => `<div class="stc"><b>${i + 1}. ${p.name}</b> <span class="dim">(${EN.secs[p.sec]})</span><p>${p.s.map(s => s[2]).join(' ')}</p></div>`).join('')}`,
    '원문·해석': null,
    '문법 모음': () => P.map((p, i) => `<h3>${i + 1}. ${p.name}</h3>` + p.s.filter(s => s[3] && s[3].length).map(s => `<div class="gitem"><div class="ge">${s[0].replace(/ \/ /g, ' ')}</div>${s[3].map(g => `<div>▸ ${g}</div>`).join('')}</div>`).join('')).join(''),
    '단어장': () => P.map((p, i) => `<h3>${i + 1}. ${p.name}</h3><div class="vgrid">${qOf(p.id).voc.map(v => `<div><b>${v[0]}</b><span>${v[1]}</span></div>`).join('')}</div>`).join('')
  };
  const open = k => { Reader.stop(); [...tabs.children].forEach(b => b.classList.toggle('on', b.textContent === k)); body.innerHTML = ''; if (k === '원문·해석') { body.appendChild(h('p', 'hint', '단어를 누르면 뜻이 나와요. 문장 아래 버튼으로 끊어 해석·전체 해석·문법을 펼칠 수 있어요.')); Reader.attach(body, () => [...body.querySelectorAll('.sent')].map(e => e._it)); const all = h('button', '', '모든 해석 펼치기'); all.onclick = () => body.querySelectorAll('.sent').forEach(s => s.classList.add('show-kos', 'show-tr', 'show-gr')); body.appendChild(all); P.forEach((p, i) => { body.appendChild(h('h3', '', `${i + 1}. ${p.name} <span class="dim">${EN.secs[p.sec]}</span>`)); p.s.forEach((s, j) => body.appendChild(sentenceView(s, j, { pid: p.id }))); }); } else body.innerHTML = T[k](); };
  Object.keys(T).forEach(k => { const b = h('button', '', k); b.onclick = () => { Snd.play('click'); open(k); }; tabs.appendChild(b); });
  open('출처·배경');
}

home();
