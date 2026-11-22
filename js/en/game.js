'use strict';
/* 영어 지문 게임: 지도 → (대화) → 애니메이션 → 독해 → 도전 → 결과 */
const Snd = { play(k) { try { Sfx.play(k); } catch (e) { } }, music(m) { try { Sfx.music(m); } catch (e) { } } };
const $ = s => document.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEY = 'en_same_v1';
let SV; try { SV = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { SV = {}; }
SV.stars = SV.stars || {}; SV.xp = SV.xp || 0; SV.split = SV.split ?? true;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) { } };
const P = EN.paras, PI = Object.fromEntries(P.map((p, i) => [p.id, i]));

/* 스테이지 목록: 문단 11개 + 부 끝마다 쪽지 시험 */
const STAGES = [];
P.forEach((p, i) => { STAGES.push({ id: p.id, type: 'para', p, n: i + 1 }); if (p.id === 'p5') STAGES.push({ id: 'b1', type: 'boss', sec: 1, name: '쪽지 시험 ① 화학의 책임' }); if (p.id === 'p7') STAGES.push({ id: 'b2', type: 'boss', sec: 2, name: '쪽지 시험 ② 과학과 윤리' }); if (p.id === 'p11') STAGES.push({ id: 'b3', type: 'boss', sec: 3, name: '최종 쪽지 시험 ③ 규제와 맺음' }); });
const unlocked = k => k === 0 || SV.free || (SV.stars[STAGES[k - 1].id] || 0) > 0;

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
  p1: { in: [['n', '방과 후 도서관. 히터가 탁탁 소리를 내며 돈다. 책상 위엔 7쪽짜리 유인물과 서진의 해석 노트.'], ['s', '수행평가 사흘 남았거든? 근데 나 이거 다 해석해 놨어. 너는 검토만 해 주면 돼.'], ['n', '딸깍. 서진이 펜 뚜껑을 눌렀다.'], ['h', '다 했다는 사람 노트치고 포스트잇이 너무 많은데.'], ['s', '그건… 장식이에요, 선배님.']],
    out: [['h', 'physician을 물리학자라고 쓴 거. 지워.'], ['s', '…지웠어요.'], ['n', '노트 귀퉁이에 “의사!!”가 세 번 적혔다.']] },
  p2: { in: [['s', '람바다는 춤 이름 아니에요?'], ['h', 'lambaste. 철자부터 다르잖아.'], ['n', '딸깍, 딸깍. 서진이 모를 때 누르는 횟수다.']],
    out: [['h', '천연이라고 다 안전한 거 아냐. 우리 할머니가 산에서 버섯을 따 오셨는데…'], ['s', '…따 오셨는데요?'], ['h', '배탈. 지금 잘 계셔.']] },
  p3: { in: [['s', '재앙 목록 나온다. 이거 다 외워요?'], ['h', '외우는 게 아니라, “고를 수 있을 만큼 많다”가 포인트.'], ['s', 'to choose from. from 뒤에 아무것도 없는 거 이상하지 않아요?'], ['h', '없는 게 아니라 앞으로 간 거야.']],
    out: [['s', 'exculpation 시험에 나오면 저 끝나요.'], ['h', '그럼 오늘 외워.'], ['n', '대답 대신 서진이 손바닥에 ex + culpa라고 썼다.']] },
  p4: { in: [['s', 'credit은 알아요. 신용카드.'], ['h', '그럼 take credit for는?'], ['s', '카드를… 가져가다?'], ['n', '마침 히터가 탁 꺼졌다.']],
    out: [['h', '아무도 호루라기를 안 불었다는 거. 난 그게 이 글에서 제일 무서운 문장 같아.'], ['n', '서진이 그 줄에 밑줄을 그었다. 이번엔 딸깍 소리가 없었다.']] },
  p5: { in: [['n', '하람 선배가 휴대폰을 책상 밑으로 내린다. 화면에 “거울상 이성질체 뜻”.'], ['s', '선배도 검색해요?'], ['h', '…확인하는 거야.']],
    out: [['s', '무해한 게 몸속에서 해로운 걸로 바뀐다. 반전 영화네요.'], ['h', '세상은 결코 단순하지 않다.'], ['s', '그거 지문이잖아요.'], ['h', '그러니까.']] },
  p6: { in: [['s', 'Were the science done well. 이거 문법 틀린 거 아니에요?'], ['h', '도치. if를 빼면 자리가 바뀌어.'], ['s', '선배, 그거 한 번만 더요.'], ['n', '선배가 펜 뚜껑을 열었다. 설명이 길어진다는 뜻이다.']],
    out: [['s', 'cannot afford. 저 매달 용돈으로 체험 중이에요.'], ['h', '그럼 이 문장은 잘 알겠네.']] },
  p7: { in: [['s', 'banality… 바나나…'], ['h', '아니야.'], ['s', '아직 말 안 끝났는데요.'], ['h', '바나나 아니야.']],
    out: [['s', '근데 이 사람들, 그냥 회사 다닌 거잖아요.'], ['h', '그래서 무서운 거야.'], ['n', '한동안 아무도 말하지 않았다. 히터만 탁탁거렸다.']] },
  p8: { in: [['s', 'overboard. 배(board) 위로(over). 이건 확실해요.'], ['h', '배 밖으로 떨어지는 거야.'], ['s', '…그것도 위로 넘어가긴 했잖아요.']],
    out: [['h', '이건 글쓴이 생각이 아니라 반대쪽 주장이야. so this argument goes.'], ['s', '아, “카더라”요?'], ['h', '…대충 맞아.']] },
  p9: { in: [['s', 'lost랑 saved. 쌤이 동그라미 세 번 친 데예요.'], ['h', '그럼 세 번 볼 가치가 있겠네.']],
    out: [['s', '이 문단은 저 안 틀렸죠?'], ['h', '하나 틀렸어.'], ['s', '하나면 선방이죠.']] },
  p10: { in: [['s', 'If there be. be가 왜 원형이에요?'], ['h', '옛날 말투야. If there is로 읽으면 돼.'], ['s', '그럼 처음부터 그렇게 쓰지.']],
    out: [['n', '서진이 “팔천 명” 옆에 숫자를 크게 적었다. 지웠다가, 다시 적었다.']] },
  p11: { in: [['h', '마지막 문단. 제목이 여기서 나와.'], ['s', '같고도 다른… 우리 반 쌍둥이 얘기 같은데.'], ['h', '아니야.'], ['s', '아직 말 안 끝났는데요.']],
    out: [['h', '끝. 수고했어.'], ['s', '선배, 저 이제 이거 다 해석할 수 있어요.'], ['h', '노트 줘 봐.'], ['n', '서진은 노트를 품에 안고 일어났다. 포스트잇 두 장이 바닥에 떨어졌다.']] },
  b1: { in: [['h', '1부 끝. 쪽지 시험 볼게. 서진이 너도.'], ['s', '저는 검토받는 쪽인데요?'], ['h', '그러니까 너도.']], out: [['h', '통과.'], ['s', '선배, 방금 웃었죠?']] },
  b2: { in: [['h', '2부 쪽지 시험. 이번엔 문장이 길어.'], ['s', '딸깍딸깍딸깍.']], out: [['s', '악의 평범성… 이제 바나나 생각 안 나요.'], ['h', '다행이네.']] },
  b3: { in: [['h', '마지막. 전부 섞어서 낸다.'], ['s', '선배, 이거 수행평가보다 어려운 거 아니에요?'], ['h', '그래야 수행평가가 쉽지.']], out: [['n', '창밖은 벌써 어둡다. 사서 선생님이 불을 하나씩 끄기 시작했다.'], ['h', '수행평가 날, 잘 봐.'], ['s', '선배도 수능 잘 보세요.'], ['h', '…응.']] }
};

/* ── 화면 틀 ─────────────────────────────────────── */
const app = () => $('#app');
function screen(cls) { const a = app(); a.innerHTML = ''; a.className = cls || ''; window.scrollTo(0, 0); return a; }
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

/* ── 홈 / 지도 ───────────────────────────────────── */
function home() {
  Snd.music('title'); const a = screen('home');
  a.innerHTML = `<div class="hero"><div class="mirror"><span>The Same</span><span class="flip">The Same</span></div><h1>같고도 다른</h1><p class="sub">영어 지문 RPG · <i>The Same and Not the Same</i> (Roald Hoffmann)</p><p class="dim">방과 후 도서관, 수행평가 사흘 전. 서진의 해석 노트를 같이 고쳐 주세요.</p></div>`;
  const bs = h('div', 'btns'); const done = STAGES.filter(s => SV.stars[s.id]).length;
  const go = h('button', 'pri', done ? `▶ 이어하기 (${done}/${STAGES.length})` : '▶ 시작하기'); go.onclick = map;
  const nt = h('button', '', '📄 지문 분석 노트 (원문·해석·문법)'); nt.onclick = notes;
  const ph = h('button', 'ghost', '⚛ 물리로 가기'); ph.onclick = () => location.href = 'index.html?physics';
  bs.append(go, nt, ph); a.appendChild(bs);
}
function map() {
  Snd.music('camp'); const a = screen('map'); a.appendChild(topbar('도서관 지도'));
  const wrap = h('div', 'mapwrap'); let sec = -1;
  STAGES.forEach((st, k) => {
    const s = st.type === 'para' ? st.p.sec : st.sec; if (st.type === 'para' && s !== sec) { sec = s; wrap.appendChild(h('div', 'sech', EN.secs[s])); }
    const lock = !unlocked(k), stars = SV.stars[st.id] || 0; const n = h('button', `node ${st.type} ${lock ? 'lock' : ''} ${stars ? 'clear' : ''}`);
    n.innerHTML = st.type === 'para' ? `<span class="num">${st.n}</span><span class="nm">${st.p.name}</span><span class="st">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>` : `<span class="num">📝</span><span class="nm">${st.name}</span><span class="st">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>`;
    n.onclick = () => { if (lock) { Snd.play('wrong'); n.classList.add('shake'); setTimeout(() => n.classList.remove('shake'), 400); return; } Snd.play('click'); st.type === 'para' ? stage(st) : boss(st); };
    wrap.appendChild(n);
  });
  a.appendChild(wrap);
  const fr = h('label', 'free', `<input type="checkbox" ${SV.free ? 'checked' : ''}> 자유 모드 (모든 문단 열기)`); fr.querySelector('input').onchange = e => { SV.free = e.target.checked; save(); map(); }; a.appendChild(fr);
}

/* ── 문단 스테이지 ───────────────────────────────── */
function stage(st) {
  talk(TALK[st.id] && TALK[st.id].in, () => EScene.play(st.id, () => read(st)));
}
function sentenceView(s, idx, opts = {}) {
  const [en, ko, tr, g] = s; const ens = en.split(' / '), kos = ko.split(' | ');
  const el = h('div', 'sent'); el.innerHTML = `<div class="sn">${idx + 1}</div><div class="eng">${ens.map((c, i) => `<span class="ck" data-i="${i}">${wrapWords(c)}</span>`).join('<span class="sl"> / </span>')}</div><div class="kos">${ens.map((c, i) => `<span class="kc"><i>${i + 1}</i>${kos[i]}</span>`).join('')}</div><div class="tr">${tr}</div><div class="gr">${(g || []).map(x => `<div>▸ ${x}</div>`).join('')}</div><div class="sbtn"><button data-t="kos">끊어 해석</button><button data-t="tr">전체 해석</button>${g && g.length ? '<button data-t="gr">문법 메모</button>' : ''}</div>`;
  el.querySelector('.sbtn').onclick = e => { const t = e.target.dataset.t; if (!t) return; el.classList.toggle('show-' + t); e.target.classList.toggle('on'); Snd.play('click'); if (t === 'gr' || t === 'tr') { el.dataset.seen = 1; } };
  if (opts.open) el.classList.add('show-kos', 'show-tr', 'show-gr');
  return el;
}
function read(st) {
  Snd.music('camp'); const p = st.p, a = screen('read'); a.appendChild(topbar(`${st.n}. ${p.name}`, ['지도', map]));
  const tools = h('div', 'tools'); const sp = h('button', SV.split ? 'on' : '', '/ 끊어 읽기 표시'); sp.onclick = () => { SV.split = !SV.split; save(); a.classList.toggle('nosplit', !SV.split); sp.classList.toggle('on', SV.split); };
  const re = h('button', '', '🎬 장면 다시 보기'); re.onclick = () => EScene.play(p.id, () => { });
  const all = h('button', '', '모두 펼치기'); all.onclick = () => a.querySelectorAll('.sent').forEach(s => s.classList.add('show-kos', 'show-tr', 'show-gr'));
  tools.append(sp, re, all); a.appendChild(tools); a.classList.toggle('nosplit', !SV.split);
  a.appendChild(h('p', 'hint', '단어를 누르면 뜻이 나와요. 문장마다 [끊어 해석] → [전체 해석] → [문법 메모] 순서로 열어 보세요.'));
  p.s.forEach((s, i) => a.appendChild(sentenceView(s, i)));
  const go = h('button', 'pri big', '⚔ 도전 시작'); go.onclick = () => challenge(st); a.appendChild(go);
}

/* ── 도전 ───────────────────────────────────────── */
function allVoc() { return Object.values(QUEST).flatMap(q => q.voc); }
function makeRounds(ids, nVoc = 5, opt = {}) {
  const R = [];
  ids.forEach(id => { const q = QUEST[id], p = P[PI[id]];
    shuffle(q.voc).slice(0, opt.boss ? 2 : nVoc).forEach(v => R.push({ k: 'voc', v, id }));
    q.wrong.slice(0, opt.boss ? 1 : 2).forEach(w => R.push({ k: 'wrong', w, id }));
    const long = p.s.map((s, i) => [s, i]).filter(([s]) => s[0].split(' / ').length >= 3); shuffle(long).slice(0, opt.boss ? 1 : 2).forEach(([s, i]) => R.push({ k: 'order', s, i, id }));
    shuffle(q.gram).slice(0, opt.boss ? 1 : 3).forEach(g => R.push({ k: 'gram', g, id }));
  });
  if (opt.boss) return shuffle(R).slice(0, opt.boss);
  const order = { voc: 0, wrong: 1, order: 2, gram: 3 }; return R.sort((a, b) => order[a.k] - order[b.k]);
}
function challenge(st) {
  Snd.music('tense'); runRounds(st, makeRounds([st.id]), { hearts: 3, title: `${st.n}. ${st.p.name} — 도전` });
}
function boss(st) {
  const ids = P.filter(p => p.sec === st.sec).map(p => p.id);
  talk(TALK[st.id].in, () => { Snd.music('boss'); runRounds(st, makeRounds(ids, 0, { boss: st.sec === 3 ? 14 : 12 }), { hearts: 3, title: st.name, timer: 20, boss: true }); });
}
function runRounds(st, rounds, cfg) {
  const a = screen('chal' + (cfg.boss ? ' bossmode' : '')); let i = 0, hearts = cfg.hearts, miss = 0, combo = 0, gained = 0;
  const top = topbar(cfg.title, ['나가기', () => confirm('도전을 그만두고 지도로 갈까요?') && map()]); a.appendChild(top);
  const hud = h('div', 'hud'); a.appendChild(hud); const body = h('div', 'rbody'); a.appendChild(body);
  let timer = null;
  const drawHud = () => { hud.innerHTML = `<span class="hearts">${'♥'.repeat(Math.max(0, hearts))}<s>${'♥'.repeat(Math.max(0, cfg.hearts - hearts))}</s></span><span class="bar"><i style="width:${i / rounds.length * 100}%"></i></span><span class="cnt">${i + 1 > rounds.length ? rounds.length : i + 1}/${rounds.length}</span><span class="combo ${combo >= 2 ? 'on' : ''}">${combo >= 2 ? combo + ' 콤보!' : ''}</span>` + (cfg.timer ? '<span class="tbar"><i></i></span>' : ''); };
  const ok = (bonus = 0) => { combo++; const g = 10 + Math.min(combo, 5) * 2 + bonus; gained += g; Snd.play(combo >= 3 ? 'orb' : 'win'); fx('+' + g + ' ✦', '#3ddc97'); };
  const bad = () => { combo = 0; miss++; hearts--; Snd.play('wrong'); a.classList.add('hit'); setTimeout(() => a.classList.remove('hit'), 350); drawHud(); };
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
    if (r.k === 'gram') {
      const [q, opts, ans, why] = r.g; body.appendChild(h('div', 'qk', '문법 체크'));
      body.appendChild(h('div', 'gq', q)); const g = h('div', 'opts col'); const sh = shuffle(opts.map((o, k) => [o, k]));
      sh.forEach(([o, k]) => { const b = h('button', '', o); b.onclick = () => { clearInterval(timer); g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); if (k === ans) { ok(); cont('✔ ' + why, true); } else { b.classList.add('wrong'); bad(); cont(why, false); } }; g.appendChild(b); }); body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); bad(); cont('시간 초과! ' + why, false); });
    }
  }
  function finish() {
    const stars = miss === 0 ? 3 : miss <= 2 ? 2 : 1; const prev = SV.stars[st.id] || 0; SV.stars[st.id] = Math.max(prev, stars); SV.xp += gained + stars * 10; save(); Snd.music('happy'); Snd.play('win');
    body.innerHTML = ''; hud.innerHTML = ''; const r = h('div', 'result', `<div class="big">${'★'.repeat(stars)}<s>${'★'.repeat(3 - stars)}</s></div><h2>클리어!</h2><p>실수 ${miss}번 · 얻은 공명 ✦ ${gained + stars * 10}</p>`);
    const nx = h('button', 'pri', '계속 ▶'); nx.onclick = () => talk(TALK[st.id] && TALK[st.id].out, () => { const k = STAGES.findIndex(s => s.id === st.id); const n = STAGES[k + 1]; if (n) { const b = h('div'); map(); } else ending(); });
    const rt = h('button', '', '↺ 다시 도전'); rt.onclick = () => st.type === 'para' ? challenge(st) : boss(st);
    r.append(nx, rt); body.appendChild(r);
  }
  function fail() {
    Snd.music('sad'); body.innerHTML = ''; const r = h('div', 'result fail', `<h2>하트가 다 떨어졌어요</h2><p>괜찮아요. 틀린 문장을 다시 읽고 오면 돼요.</p>`);
    const rd = h('button', 'pri', st.type === 'para' ? '📖 문단 다시 읽기' : '📖 지문 분석 노트'); rd.onclick = () => st.type === 'para' ? read(st) : notes();
    const rt = h('button', '', '↺ 바로 다시 도전'); rt.onclick = () => st.type === 'para' ? challenge(st) : boss(st); r.append(rd, rt); body.appendChild(r);
  }
  show();
}
function ending() {
  Snd.music('happy'); const a = screen('home'); a.innerHTML = `<div class="hero"><div class="mirror"><span>The Same</span><span class="flip">The Same</span></div><h1>완독!</h1><p class="sub">${EN.gist}</p><p>모은 공명 ✦ ${SV.xp}</p></div>`;
  const bs = h('div', 'btns'); const m = h('button', 'pri', '지도로'); m.onclick = map; const n = h('button', '', '📄 분석 노트'); n.onclick = notes; bs.append(m, n); a.appendChild(bs);
}

/* ── 지문 분석 노트 ─────────────────────────────── */
function notes() {
  Snd.music('camp'); const a = screen('notes'); a.appendChild(topbar('지문 분석 노트', ['홈', home]));
  const tabs = h('div', 'tabs'); const body = h('div', 'nbody'); a.append(tabs, body);
  const T = {
    '출처·배경': () => `<h3>출처</h3><p>${EN.source}</p><p>${EN.author}</p><h3>배경: 탈리도마이드 사건</h3><ul>${EN.background.map(x => `<li>${x}</li>`).join('')}</ul>`,
    '구조·요지': () => `<h3>한 줄 요지</h3><p class="gist">${EN.gist}</p><h3>글의 흐름</h3>${EN.structure.map(([t, d]) => `<div class="stc"><b>${t}</b><p>${d}</p></div>`).join('')}<h3>문단별 지도</h3>${P.map((p, i) => `<div class="stc"><b>${i + 1}. ${p.name}</b> <span class="dim">(${EN.secs[p.sec]})</span><p>${p.s.map(s => s[2]).join(' ')}</p></div>`).join('')}`,
    '원문·해석': null,
    '문법 모음': () => P.map((p, i) => `<h3>${i + 1}. ${p.name}</h3>` + p.s.filter(s => s[3] && s[3].length).map(s => `<div class="gitem"><div class="ge">${s[0].replace(/ \/ /g, ' ')}</div>${s[3].map(g => `<div>▸ ${g}</div>`).join('')}</div>`).join('')).join(''),
    '단어장': () => P.map((p, i) => `<h3>${i + 1}. ${p.name}</h3><div class="vgrid">${QUEST[p.id].voc.map(v => `<div><b>${v[0]}</b><span>${v[1]}</span></div>`).join('')}</div>`).join('')
  };
  const open = k => { [...tabs.children].forEach(b => b.classList.toggle('on', b.textContent === k)); body.innerHTML = ''; if (k === '원문·해석') { body.appendChild(h('p', 'hint', '단어를 누르면 뜻이 나와요. 문장 아래 버튼으로 끊어 해석·전체 해석·문법을 펼칠 수 있어요.')); const all = h('button', '', '모든 해석 펼치기'); all.onclick = () => body.querySelectorAll('.sent').forEach(s => s.classList.add('show-kos', 'show-tr', 'show-gr')); body.appendChild(all); P.forEach((p, i) => { body.appendChild(h('h3', '', `${i + 1}. ${p.name} <span class="dim">${EN.secs[p.sec]}</span>`)); p.s.forEach((s, j) => body.appendChild(sentenceView(s, j))); }); } else body.innerHTML = T[k](); };
  Object.keys(T).forEach(k => { const b = h('button', '', k); b.onclick = () => { Snd.play('click'); open(k); }; tabs.appendChild(b); });
  open('출처·배경');
}

home();
