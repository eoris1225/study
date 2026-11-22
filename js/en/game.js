'use strict';
/* 영어 지문 게임: 지도 → (대화) → 애니메이션 → 독해 → 도전 → 결과 */
const Snd = { play(k) { try { Sfx.play(k); } catch (e) { } }, music(m) { try { Sfx.music(m); } catch (e) { } } };
const BGM = { off: '🔇 음악 끔', pop: '🎵 팝', ballad: '🎹 발라드', lofi: '☕ 로파이' };
const $ = s => document.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEY = 'en_same_v1';
let SV; try { SV = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { SV = {}; }
SV.bgm = SV.bgm || 'off'; try { Sfx.style(SV.bgm); } catch (e) { }
SV.stars = SV.stars || {}; SV.xp = SV.xp || 0; SV.split = SV.split ?? true; SV.sceneVoice = SV.sceneVoice ?? true;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) { } };
/* ── 기억 관리: 간격 반복(라이트너 상자) + 매일 기록 ─────────
   상자 0~5. 맞히면 한 칸 올라가고 다음 복습일이 멀어진다(0·1·3·7·14·30일). 틀리면 상자 0, 오늘 다시. */
const IV = [0, 1, 3, 7, 14, 30];
const CIV = [0, 10, 30, 120, 360, 720].map(m => m * 6e4); /* 벼락치기: 0분·10분·30분·2시간·6시간·12시간 */
const today = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
SV.srs = SV.srs || {}; SV.days = SV.days || {};
const SRS = {
  key(r, ps) { const id = ps || CUR.id; if (r.k === 'voc') return `v|${id}|${r.v[0]}`; if (r.k === 'exam') return `q|${id}|${r.id}`; if (r.k === 'gram') return `g|${id}|${r.id}|${r.gi}`; const si = r.si ?? r.i ?? (r.w ? r.w[0] : null); return si == null ? null : `s|${id}|${r.id}|${si}`; },
  mark(r, good, soft) { const k = SRS.key(r); if (!k) return; const it = SV.srs[k] || { b: 0, d: today(), n: 0 }; it.n++; if (good) it.b = Math.min(5, it.b + 1); else if (!soft) it.b = 0; it.d = today() + (good ? IV[it.b] : 0); it.t = Date.now() + (good ? (SV.cram ? CIV[it.b] : IV[it.b] * 864e5) : (SV.cram ? 3e4 : 0)); it.x = { k: r.k === 'voc' ? 'voc' : r.k === 'exam' ? 'exam' : r.k === 'gram' ? 'gram' : 'sent', v: r.v, gi: r.gi, si: r.si ?? r.i ?? (r.w ? r.w[0] : null) }; SV.srs[k] = it; const t = today(); SV.days[t] = (SV.days[t] || 0) + 1; save(); },
  due(id) { const t = today(), n = Date.now(); return Object.entries(SV.srs).filter(([k, v]) => k.split('|')[1] === id && (v.t ? v.t <= n : v.d <= t)); },
  power(id) { const its = Object.entries(SV.srs).filter(([k]) => k.split('|')[1] === id); if (!its.length) return 0; return its.reduce((a, [, v]) => a + v.b, 0) / (its.length * 5); },
  streak() { let n = 0, t = today(); if (!SV.days[t]) t--; while (SV.days[t]) { n++; t--; } return n; }
};
const GOAL = 30;
const RANKS = [[0, '단어 줍는 견습생'], [300, '끊어 읽기 탐험가'], [900, '문장 해부학자'], [2000, '지문 사냥꾼'], [4000, '변형 문제 파괴자'], [7000, '내신 마스터']];
const rankOf = xp => RANKS.filter(r => xp >= r[0]).pop()[1];
/* 지문 서랍: 지문 하나 = 한 판. 새 지문은 window.PASSAGES에 같은 모양으로 넣으면 된다 (quest·장면은 없어도 됨) */
const LIB = (window.PASSAGES || []).concat([Object.assign(window.EN, { id: 'same', quest: window.QUEST, scenes: true, mark: ['The Same', 'The Same'] })]);
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
function topbar(title, back) { const b = h('div', 'top'); const l = h('button', 'ghost', back ? '◀ ' + back[0] : '🏠'); l.onclick = back ? back[1] : home; const td = SV.days[today()] || 0; const mb = h('button', 'ghost bgm', BGM[SV.bgm]); mb.title = '배경 음악 바꾸기'; mb.onclick = () => { const L = Object.keys(BGM); SV.bgm = L[(L.indexOf(SV.bgm) + 1) % L.length]; save(); Sfx.style(SV.bgm); mb.textContent = BGM[SV.bgm]; }; b.append(l, h('div', 'ttl', title), mb, h('div', 'xp', `<span title="연속 공부일">🔥${SRS.streak()}</span> <span class="goal" title="오늘 목표"><i style="width:${Math.min(100, td / GOAL * 100)}%"></i></span> ✦ ${SV.xp}`)); return b; }

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
  if (tip) tip.remove(); let m = lookup(el.textContent); if (!m) { const ck = el.closest('.ck'), se = el.closest('.sent'); if (ck && se && se._it) { const k = se._it.s[1].split(' | ')[+ck.dataset.i]; m = `<span class="dim">이 조각 뜻:</span> ${k}`; } } tip = h('div', 'tip', `<b>${el.textContent}</b> ${m || '<span class="dim">기본 단어</span>'}`); document.body.appendChild(tip);
  const r = el.getBoundingClientRect(); const tw = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px'; tip.style.top = (r.top > 70 ? r.top - tip.offsetHeight - 8 : r.bottom + 8) + 'px'; Snd.play('tick');
  SV.looked = (SV.looked || 0) + 1; clearTimeout(showTip.t); showTip.t = setTimeout(() => tip && tip.remove(), 3200);
}
document.addEventListener('click', e => { const w = e.target.closest && e.target.closest('.w'); if (w) { e.stopPropagation(); showTip(w); } else if (tip) { tip.remove(); tip = null; } }, true);

/* ── 홈(지문 서랍) / 지문 허브 ─────────────────── */
function home() {
  Snd.music('title'); const a = screen('home');
  a.innerHTML = `<div class="hero"><div class="mirror"><span>Read</span><span class="flip">Read</span></div><h1>영어 지문 RPG</h1><p class="dim">지문 하나가 한 판이에요. 이야기로 보고 → 읽고 → 실전 도전.</p></div>`;
  const tdn = SV.days[today()] || 0; a.appendChild(h('div', 'me', `<div><b>${rankOf(SV.xp)}</b><small>✦ ${SV.xp}</small></div><div>🔥 <b>${SRS.streak()}</b>일 연속</div><div>오늘 <b>${tdn}</b>/${GOAL}<span class="goal wide"><i style="width:${Math.min(100, tdn / GOAL * 100)}%"></i></span></div>`));
  if (SV.resume) { const R = SV.resume, ps = LIB.find(x => x.id === R.ps); if (ps) { const rb = h('button', 'pri resume', `▶ 이어서 풀기 — ${R.title} (${R.at.i + 1}/${R.rounds.length})`); rb.onclick = resume; a.appendChild(rb); } }
  const list = h('div', 'lib'); LIB.forEach(ps => { const st = SV.stars[ps.id] || 0, du = SRS.due(ps.id).length, pw = SRS.power(ps.id); const c = h('button', 'pcard', `${du ? `<span class="due">🔁 ${du}</span>` : ''}<b>${ps.title}</b><span class="mbar"><i style="width:${pw * 100}%"></i></span><small>${ps.source.split('—')[0].split(',')[0]}</small><span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span><span class="dim">${ps.paras.length}문단 · ${ps.paras.reduce((n, p) => n + p.s.length, 0)}문장</span>`); c.onclick = () => { use(ps); Snd.play('click'); hub(); }; list.appendChild(c); }); a.appendChild(list);
  const bs = h('div', 'btns'); const cr = h('button', 'pri cram', SV.cram ? '⏰ D-1 벼락치기 계획 (모드 켜짐)' : '⏰ D-1 벼락치기 계획'); cr.onclick = cramPage; bs.appendChild(cr); const why = h('button', 'ghost', '💡 이렇게 공부하는 이유'); why.onclick = whyPage; bs.appendChild(why); const ph = h('button', 'ghost', '⚛ 물리로 가기'); ph.onclick = () => location.href = 'index.html?physics'; bs.append(ph); a.appendChild(bs);
}
/* D-1 벼락치기: 하루 계획 + 복습 간격을 분 단위로 */
function cramPage() {
  SV.plan = SV.plan || {}; const ov = h('div', 'talk solo'); const bx = h('div', 'tbox wide why'); ov.appendChild(bx); document.body.appendChild(ov);
  const P_ = id => LIB.find(x => x.id === id); const go = id => { ov.remove(); use(P_(id)); hub(); };
  const steps = [
    ['① 교과서 4과 (1시간 30분)', 'ne4', '읽기(끊어 해석 + 문법 메모까지) → 🧠 기억 카드 → 🔀 변형 문제'],
    ['② 교과서 5과 (1시간 30분)', 'ne5', '읽기 → 기억 카드 → 변형 문제'],
    ['☕ 쉬는 시간 + 🔁 복습 (20분)', null, '4·5과 오늘의 복습 배지가 0이 될 때까지'],
    ['③ 2025 모의고사 29~40 (1시간 20분)', 'm25', '⚔ 실전 풀이 먼저 → 틀린 문항만 📖 끊어 읽기·해석 → 🔀 변형 문제'],
    ['④ 2026 모의고사 21, 29~42 (1시간 30분)', 'm26', '실전 풀이 → 틀린 문항 끊어 읽기 → 변형 문제'],
    ['☕ 쉬는 시간 + 🔁 복습 (20분)', null, '모의고사 오늘의 복습'],
    ['⑤ 프린트 The History of Money (40분)', 'money', '읽기 → 기억 카드 → 변형 문제 (2026 21번과 같은 글)'],
    ['⑥ 프린트 The Same and Not the Same (1시간)', 'same', '읽기 → 기억 카드 → 변형 문제'],
    ['⑦ word master Day 36~50 (2시간)', null, '앱에 아직 없음 — 단어장으로. 뜻 가리고 떠올리기 → 틀린 것만 표시해서 다시'],
    ['🌙 자기 전 (30분)', null, '모든 지문 🔁 오늘의 복습 + 지문별 📄 분석 노트 → 문법 모음 훑기'],
    ['🌅 시험 날 아침 (30분)', null, '🔁 오늘의 복습만. 새로운 건 보지 않기']
  ];
  const draw = () => { bx.innerHTML = `<h2>⏰ D-1 벼락치기 계획</h2><p>하루라도 원리는 같아요. <b>읽기만 반복하지 말고 꺼내 보기</b>, 그리고 <b>몇 시간 간격으로 다시</b>. 벼락치기 모드를 켜면 복습 간격이 <b>10분 → 30분 → 2시간 → 6시간 → 12시간</b>으로 바뀌어요.</p>`;
    const tg = h('button', SV.cram ? 'pri' : '', SV.cram ? '✔ 벼락치기 모드 켜짐 (끄기)' : '벼락치기 모드 켜기'); tg.onclick = () => { SV.cram = !SV.cram; if (SV.cram) Object.values(SV.srs).forEach(v => { v.t = Math.min(v.t || Infinity, Date.now() + 6e5 * v.b); }); save(); draw(); }; bx.appendChild(tg);
    const list = h('div', 'plan'); steps.forEach(([t, id, d], k) => { const ps = id && P_(id); const du = ps ? SRS.due(id).length : 0, pw = ps ? Math.round(SRS.power(id) * 100) : 0; const row = h('div', 'prow' + (SV.plan[k] ? ' done' : ''), `<label><input type="checkbox" ${SV.plan[k] ? 'checked' : ''}><b>${t}</b></label><small>${d}</small>${ps ? `<span class="pinfo">기억 ${pw}% · 복습 ${du}개</span>` : ''}`); row.querySelector('input').onchange = e => { SV.plan[k] = e.target.checked; save(); row.classList.toggle('done', e.target.checked); }; if (ps) { const b = h('button', '', '가기 ▶'); b.onclick = () => go(id); row.appendChild(b); } list.appendChild(row); }); bx.appendChild(list);
    bx.appendChild(h('p', 'dim', '💤 잠은 꼭 자세요. 자는 동안 그날 공부한 게 기억으로 굳어져요. 밤새우는 것보다 자기 전 복습 + 아침 복습이 더 남아요.'));
    const rs = h('button', 'ghost', '체크 모두 지우기'); rs.onclick = () => { SV.plan = {}; save(); draw(); }; const cl = h('button', 'pri', '닫기'); cl.onclick = () => { ov.remove(); home(); }; bx.append(rs, cl); };
  draw();
}
function whyPage() {
  const ov = h('div', 'talk solo'); const bx = h('div', 'tbox wide why'); bx.innerHTML = `<h2>이 게임이 공부시키는 방식</h2>
  <p>학습법 연구들을 정리한 대표적인 리뷰(Dunlosky 외, 2013)는 10가지 공부법을 비교했어요. <b>효과가 가장 큰 두 가지</b>는 <b>스스로 시험 보기</b>와 <b>나눠서 반복하기</b>였고, 많이들 하는 <b>다시 읽기·형광펜 긋기</b>는 효과가 낮았어요.</p>
  <ul><li><b>🧠 기억 카드 = 인출 연습</b>: 해석을 보기 전에 먼저 떠올리면, 다시 읽는 것보다 훨씬 오래 기억에 남아요. 틀려도 괜찮아요. 떠올리려고 애쓴 것 자체가 기억을 강하게 만들어요.</li>
  <li><b>🔁 오늘의 복습 = 간격 반복</b>: 맞힌 건 1일 → 3일 → 7일 → 14일 → 30일 뒤에 다시 나오고, 틀린 건 바로 다시 나와요. 잊어버릴 때쯤 꺼내는 게 가장 효율적이에요.</li>
  <li><b>🔀 변형 문제 = 섞어서 풀기</b>: 같은 유형만 반복하지 않고 빈칸·순서·삽입·어법을 섞으면, “이게 무슨 유형이지?”를 판단하는 힘이 길러져요. 내신 변형 문제가 딱 그래요.</li>
  <li><b>✍ 빈칸 쓰기 = 만들어 내기</b>: 잘 아는 단어는 고르기 대신 직접 써야 해요. 조금 어렵게 만드는 게 오히려 오래 남아요.</li>
  <li><b>📝 문법 메모의 “왜”</b>: 답만 보지 말고 “왜 giving이지?”를 스스로 설명하면 이해가 깊어져요.</li></ul>
  <p><b>재미 장치</b>: 게임 요소를 넣은 학습은 학습 효과와 동기 모두 작지만 분명한 향상이 있었어요(Sailer & Homner, 2020). 그래서 🔥 연속 공부일, 오늘 목표 ${GOAL}문제, 콤보, 칭호, 기억 게이지를 넣었어요.</p>`;
  const cl = h('button', 'pri', '닫기'); cl.onclick = () => ov.remove(); bx.appendChild(cl); ov.appendChild(bx); document.body.appendChild(ov);
}
function hub() {
  Snd.music('camp'); const a = screen('hubs'); a.appendChild(topbar(CUR.title, ['지문 목록', home]));
  const st = SV.stars[CUR.id] || 0, seen = (SV.seen || {})[CUR.id] || {};
  const pw = SRS.power(CUR.id); a.appendChild(h('div', 'mem', `<span>기억 게이지</span><span class="mbar"><i style="width:${pw * 100}%"></i></span><b>${Math.round(pw * 100)}%</b>`)); a.appendChild(h('div', 'hhead', `<div class="mirror small"><span>${CUR.mark ? CUR.mark[0] : ''}</span><span class="flip">${CUR.mark ? CUR.mark[1] : ''}</span></div><p class="gist">${CUR.gist}</p><span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>`));
  const steps = [
    ['🎬', '이야기로 보기', CUR.scenes ? `지문 전체를 애니메이션으로 (장면 ${P.filter(p => EScene.has(p.id)).length}개)` : '이 지문은 애니메이션 준비 중 (읽기부터 시작하세요)', () => { if (!CUR.scenes) { Snd.play('wrong'); return; } mark('scene'); playAll(); }, seen.scene],
    ['📖', '읽기', '전체 지문 · 끊어 읽기 · 단어 터치 · 낭독', () => { mark('read'); read(); }, seen.read],
    ['⚔', CUR.exam ? '실전 풀이' : '실전 도전', CUR.exam ? `시험지 그대로 ${P.filter(p => p.q).length}문항 · 끝나면 채점` : '지문 전체에서 섞어 15문제 · 별 3개 도전', () => challenge(), st],
    ['📘', '문법 수업', '지문에 나온 문법을 처음부터: 개념 카드 → 확인 퀴즈', () => gramLib(), 0],
    ['🧠', '기억 카드', '영어만 보고 해석 떠올리기 → 확인 → 스스로 채점 (약한 문장부터)', () => cards(), 0],
    ['🔀', '변형 문제', '내신형: 빈칸 · 문장 순서 · 문장 삽입 · 조각 순서를 섞어서', () => variant(), SV.stars[CUR.id + ':var']],
    ['🔁', `오늘의 복습 (${SRS.due(CUR.id).length})`, '잊어버릴 때쯤 다시. 맞히면 다음 복습이 점점 멀어져요', () => review(), 0],
    ['📄', '분석 노트', '출처 · 구조 · 전문 해석 · 문법 · 단어장', () => notes(), 0]
  ];
  const RI = resumeInfo(CUR.id); if (RI) { const rb = h('button', 'pri resume', `▶ 이어서 풀기 — ${RI.title.split(' — ').pop()} (${RI.at.i + 1}/${RI.rounds.length})`); rb.onclick = resume; a.appendChild(rb); }
  const g = h('div', 'steps'); steps.forEach(([ic, t, d, f, done], k) => { const b = h('button', 'step' + (done ? ' done' : ''), `<span class="ic">${ic}</span><b>${k + 1}. ${t}</b><small>${d}</small>`); b.onclick = () => { Snd.play('click'); f(); }; g.appendChild(b); }); a.appendChild(g);
  if (!seen.intro && TALK[CUR.id]) { mark('intro'); talk(TALK[CUR.id].in, () => { }); }
}
function mark(k) { SV.seen = SV.seen || {}; (SV.seen[CUR.id] = SV.seen[CUR.id] || {})[k] = 1; save(); }
function playAll(from = 0, back = hub) { const ids = P.map(p => p.id).filter(id => EScene.has(id)); if (!ids.length) return back(); const go = k => { if (k >= ids.length) return back(); EScene.play(ids[k], skipped => skipped ? back() : go(k + 1)); }; go(from); }
/* 표기: {{틀린것|고친것}} / [[빈칸 정답]] */
function fmt(t, mode) { return t.replace(/\{\{([^|}]*)\|([^}]*)\}\}/g, (m, a, b) => mode === 'exam' ? `<u>${a}</u>` : mode === 'plain' ? b : `<del>${a}</del> <ins>${b}</ins>`).replace(/\[\[([^\]]*)\]\]/g, (m, a) => mode === 'exam' ? '<span class="blank">　　　　　　</span>' : mode === 'plain' ? a : `<mark>${a}</mark>`); }
function examText(p) { if (p.q.ref) p = P[PI[p.q.ref]]; if (p.q.text) return p.q.text; return '<p>' + p.s.filter(s => !/^→/.test(s[0])).map(s => fmt(s[0].split(' / ').join(' '), 'exam')).join(' ') + '</p>'; }
function sentenceView(s, idx, opts = {}) {
  const [en, ko, tr, g] = s; const ens = en.split(' / '), kos = ko.split(' | ');
  const el = h('div', 'sent'); el.innerHTML = `<div class="sn">${idx + 1}</div><div class="eng">${ens.map((c, i) => `<span class="ck" data-i="${i}">${wrapWords(fmt(c, 'read'))}</span>`).join('<span class="sl"> / </span>')}</div><div class="kos">${ens.map((c, i) => `<span class="kc"><i>${i + 1}</i>${kos[i]}</span>`).join('')}</div><div class="sxbox"></div><div class="tr">${tr}</div><div class="gr">${(g || []).map(x => `<div>▸ ${x} ${gLink(x, '개념')}</div>`).join('')}</div><div class="sbtn"><button data-t="say" class="say1">🔊 듣기</button><button data-t="sx">🧩 구조 보기</button><button data-t="kos">끊어 해석</button><button data-t="tr">전체 해석</button>${g && g.length ? '<button data-t="gr">문법 메모</button>' : ''}</div>`;
  el._it = { el, s, pid: opts.pid, si: idx };
  el.querySelector('.sbtn').onclick = e => { const t = e.target.dataset.t; if (!t) return; if (t === 'say') { Reader.one(el._it); return; } if (t === 'sx') { const bx = el.querySelector('.sxbox'); if (!bx.innerHTML) bx.innerHTML = Syntax.render(s); } el.classList.toggle('show-' + t); e.target.classList.toggle('on'); Snd.play('click'); if (t === 'gr' || t === 'tr') { el.dataset.seen = 1; } };
  if (opts.open) { el.classList.add('show-sx', 'show-tr', 'show-gr'); el.querySelector('.sxbox').innerHTML = Syntax.render(s); }
  return el;
}
function read() {
  Snd.music('camp'); const a = screen('read'); a.appendChild(topbar(CUR.title + ' — 읽기', ['허브', hub]));
  const tools = h('div', 'tools'); const sp = h('button', SV.split ? 'on' : '', '/ 끊어 읽기 표시'); sp.onclick = () => { SV.split = !SV.split; save(); a.classList.toggle('nosplit', !SV.split); sp.classList.toggle('on', SV.split); };
  const all = h('button', '', '모두 펼치기'); all.onclick = () => a.querySelectorAll('.sent').forEach(s => { s.classList.add('show-sx', 'show-tr', 'show-gr'); const b = s.querySelector('.sxbox'); if (!b.innerHTML) b.innerHTML = Syntax.render(s._it.s); });
  const fold = h('button', '', '모두 접기'); fold.onclick = () => a.querySelectorAll('.sent').forEach(s => s.classList.remove('show-sx', 'show-kos', 'show-tr', 'show-gr'));
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
  const R = { voc: [], wrong: [], order: [], gram: [], exam: [], cloze: [], sorder: [], insert: [], recall: [] };
  ids.forEach(id => { const q = qOf(id), p = P[PI[id]];
    q.voc.forEach(v => R.voc.push({ k: 'voc', v, id })); q.wrong.forEach(w => R.wrong.push({ k: 'wrong', w, id }));
    p.s.forEach((s, i) => { if (s[0].split(' / ').length >= 3) R.order.push({ k: 'order', s, i, id }); }); q.gram.forEach((g, gi) => R.gram.push({ k: 'gram', g, gi, id })); if (p.q) R.exam.push({ k: 'exam', p, id });
    const real = p.s.map((s, i) => [s, i]).filter(([s]) => !/^→/.test(s[0]));
    real.forEach(([s, i]) => { R.recall.push({ k: 'recall', s, si: i, id }); const plain = fmt(s[0], 'plain').replace(/<[^>]+>/g, '').replace(/ \/ /g, ' '); q.voc.forEach(v => { const w = v[0]; if (/[A-Z]\b|~|\bA\b|\bB\b|\bO\b/.test(w)) return; const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'); if (re.test(plain)) R.cloze.push({ k: 'cloze', s, si: i, id, w, m: v[1], re }); }); });
    if (real.length >= 3 && !p.q?.text) { const st = Math.floor(Math.random() * Math.max(1, real.length - 3)); R.sorder.push({ k: 'sorder', id, part: real.slice(st, st + 4), si: real[st][1] }); }
    if (real.length >= 4 && !p.q?.text) { const k2 = 1 + Math.floor(Math.random() * (real.length - 1)); R.insert.push({ k: 'insert', id, all: real, at: k2, si: real[k2][1] }); } });
  return R;
}
function makeRounds(ids, n) { const R = pool(ids), take = (a, k) => shuffle(a).slice(0, k); const out = [...take(R.voc, n.voc), ...take(R.cloze, n.cloze || 0), ...take(R.wrong, n.wrong), ...take(R.order, n.order), ...take(R.sorder, n.sorder || 0), ...take(R.insert, n.insert || 0), ...take(R.gram, n.gram), ...(n.exam ? R.exam : [])]; if (n.mix) return shuffle(out); const o = { voc: 0, cloze: 1, wrong: 2, order: 3, sorder: 4, insert: 5, gram: 6, exam: 7 }; return out.sort((a, b) => o[a.k] - o[b.k]); }
function challenge() { if (CUR.exam) { Snd.music('tense'); return runRounds({ id: CUR.id, type: 'all' }, pool(P.map(p => p.id)).exam, { noHearts: 1, title: CUR.title + ' — 실전 풀이' }); } Snd.music('tense'); runRounds({ id: CUR.id, type: 'all' }, makeRounds(P.map(p => p.id), { voc: 4, cloze: 3, wrong: 2, order: 2, sorder: 1, insert: 1, gram: 3, mix: 1 }), { hearts: 5, title: CUR.title + ' — 실전 도전' }); }
function practice(p, only) { if (only && p.q) { Snd.music('tense'); return runRounds({ id: CUR.id + ':' + p.id + ':q', type: 'para', p }, [{ k: 'exam', p, id: p.id }], { noHearts: 1, title: p.name }); } Snd.music('tense'); runRounds({ id: CUR.id + ':' + p.id, type: 'para', p }, makeRounds([p.id], { voc: 3, cloze: 2, wrong: 2, order: 2, sorder: 1, insert: 1, gram: 3, exam: 1 }), { hearts: 3, title: p.name + ' — 문단 연습' }); }
/* 변형 문제(내신 대비): 빈칸·문장 순서·문장 삽입·조각 순서를 섞어서 */
function variant() { Snd.music('tense'); runRounds({ id: CUR.id + ':var', type: 'all' }, makeRounds(P.map(p => p.id), { voc: 2, cloze: 5, wrong: 1, order: 2, sorder: 3, insert: 3, gram: 2, mix: 1 }), { hearts: 5, title: CUR.title + ' — 변형 문제' }); }
/* 기억 카드: 영어만 보고 해석을 떠올린 뒤 확인하고 스스로 채점 (약한 문장부터) */
function cards() { const R = pool(P.map(p => p.id)).recall; const w = r => { const it = SV.srs[SRS.key(r)]; return it ? it.b + (it.d > today() ? 3 : 0) : -1 + Math.random() * .5; }; Snd.music('camp'); runRounds({ id: CUR.id + ':cards', type: 'all' }, R.sort((a, b) => w(a) - w(b)).slice(0, 12), { noHearts: 1, title: CUR.title + ' — 기억 카드' }); }
/* 오늘의 복습: 복습일이 된 것만. 상자가 높을수록 더 어려운 형태로 */
function review() {
  const all = pool(P.map(p => p.id)); const due = SRS.due(CUR.id); const out = [];
  due.forEach(([k, it]) => { const x = it.x || {}, parts = k.split('|'), id = parts[2];
    if (x.k === 'voc') { const c = all.cloze.find(c => c.w === x.v[0]); out.push(it.b >= 2 && c ? Object.assign({}, c, { type: 1 }) : { k: 'voc', v: x.v, id }); }
    else if (x.k === 'exam') { const e = all.exam.find(e => e.id === id); if (e) out.push(e); }
    else if (x.k === 'gram') { const g = all.gram.find(g => g.id === id && g.gi === x.gi); if (g) out.push(g); }
    else { const si = x.si; const c = all.cloze.filter(c => c.id === id && c.si === si); const o = all.order.find(o => o.id === id && o.i === si); const rc = all.recall.find(r => r.id === id && r.si === si); out.push(it.b <= 1 && rc ? rc : c.length ? Object.assign({}, shuffle(c)[0], { type: it.b >= 3 }) : o || rc); } });
  const list = shuffle(out.filter(Boolean)).slice(0, 20); if (!list.length) { alert('오늘 복습할 것이 없어요! 새 문제를 풀면 복습 거리가 쌓여요.'); return; }
  Snd.music('tense'); runRounds({ id: CUR.id + ':rev', type: 'all' }, list, { noHearts: 1, title: CUR.title + ' — 오늘의 복습' });
}
/* ── 이어서 풀기: 진행 중인 도전을 저장했다가 복원 ── */
function enc(r) { const q = qOf(r.id); const d = { k: r.k, id: r.id };
  if (r.k === 'voc') d.v = r.v; else if (r.k === 'wrong') d.wi = q.wrong.indexOf(r.w); else if (r.k === 'order') d.i = r.i; else if (r.k === 'gram') d.gi = r.gi;
  else if (r.k === 'cloze') { d.si = r.si; d.w = r.w; d.m = r.m; d.type = r.type; } else if (r.k === 'recall') d.si = r.si; else if (r.k === 'sorder') d.sis = r.part.map(x => x[1]); else if (r.k === 'insert') d.at = r.at; return d; }
function dec(d) { const p = P[PI[d.id]]; if (!p) return null; const q = qOf(d.id); const real = p.s.map((s, i) => [s, i]).filter(([s]) => !/^→/.test(s[0]));
  switch (d.k) { case 'voc': return { k: 'voc', v: d.v, id: d.id }; case 'wrong': return q.wrong[d.wi] ? { k: 'wrong', w: q.wrong[d.wi], id: d.id } : null; case 'order': return { k: 'order', s: p.s[d.i], i: d.i, id: d.id }; case 'gram': return q.gram[d.gi] ? { k: 'gram', g: q.gram[d.gi], gi: d.gi, id: d.id } : null; case 'exam': return p.q ? { k: 'exam', p, id: d.id } : null;
    case 'cloze': return { k: 'cloze', s: p.s[d.si], si: d.si, id: d.id, w: d.w, m: d.m, type: d.type, re: new RegExp('\\b' + d.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i') };
    case 'recall': return { k: 'recall', s: p.s[d.si], si: d.si, id: d.id }; case 'sorder': return { k: 'sorder', id: d.id, part: d.sis.map(i => [p.s[i], i]), si: d.sis[0] }; case 'insert': return { k: 'insert', id: d.id, all: real, at: d.at, si: real[d.at] && real[d.at][1] }; }
  return null; }
function resumeInfo(psid) { const R = SV.resume; return R && R.ps === psid ? R : null; }
function resume() { const R = SV.resume; if (!R) return; const ps = LIB.find(x => x.id === R.ps); if (!ps) { SV.resume = null; save(); return; } use(ps); const rounds = R.rounds.map(dec).filter(Boolean); if (!rounds.length) { SV.resume = null; save(); return hub(); } const st = { id: R.st.id, type: R.st.type, p: R.st.pid ? P[PI[R.st.pid]] : undefined }; Snd.music('tense'); runRounds(st, rounds, R.cfg, R.at); }
function runRounds(st, rounds, cfg, at) {
  const a = screen('chal' + (cfg.boss ? ' bossmode' : '')); let i = 0, hearts = cfg.hearts, miss = 0, combo = 0, gained = 0; if (at) ({ i, hearts, miss, combo, gained } = at); hearts = hearts ?? cfg.hearts;
  const enc0 = rounds.map(enc); const keep = () => { SV.resume = { ps: CUR.id, st: { id: st.id, type: st.type, pid: st.p && st.p.id }, cfg, rounds: enc0, at: { i, hearts, miss, combo, gained }, title: cfg.title, when: Date.now() }; save(); };
  const top = topbar(cfg.title, ['나가기', () => { keep(); hub(); }]); a.appendChild(top);
  const hud = h('div', 'hud'); a.appendChild(hud); const body = h('div', 'rbody'); a.appendChild(body);
  let timer = null;
  const drawHud = () => { hud.innerHTML = (cfg.noHearts ? `<span class="score">✔ ${i - miss < 0 ? 0 : i - miss} / ✘ ${miss}</span>` : `<span class="hearts">${'♥'.repeat(Math.max(0, hearts))}<s>${'♥'.repeat(Math.max(0, cfg.hearts - hearts))}</s></span>`) + `<span class="bar"><i style="width:${i / rounds.length * 100}%"></i></span><span class="cnt">${i + 1 > rounds.length ? rounds.length : i + 1}/${rounds.length}</span><span class="combo ${combo >= 2 ? 'on' : ''}">${combo >= 2 ? combo + ' 콤보!' : ''}</span>` + (cfg.timer ? '<span class="tbar"><i></i></span>' : ''); };
  const ok = (bonus = 0) => { SRS.mark(rounds[i], true); combo++; const g = 10 + Math.min(combo, 5) * 2 + bonus; gained += g; Snd.play(combo >= 3 ? 'orb' : 'win'); fx('+' + g + ' ✦', '#3ddc97'); };
  const bad = () => { SRS.mark(rounds[i], false); combo = 0; miss++; if (!cfg.noHearts) hearts--; Snd.play('wrong'); a.classList.add('hit'); setTimeout(() => a.classList.remove('hit'), 350); drawHud(); };
  const fx = (s, c) => { const f = h('div', 'fx', s); f.style.color = c; a.appendChild(f); setTimeout(() => f.remove(), 900); };
  const next = () => { clearInterval(timer); i++; if (hearts <= 0) return fail(); if (i >= rounds.length) return finish(); show(); };
  const startTimer = onOut => { if (!cfg.timer) return; let left = cfg.timer; const bar = hud.querySelector('.tbar i'); timer = setInterval(() => { left -= .1; if (bar) bar.style.width = (left / cfg.timer * 100) + '%'; if (left <= 0) { clearInterval(timer); onOut(); } }, 100); };
  const cont = (msg, good) => { const c = h('div', 'after ' + (good ? 'good' : 'bad'), msg); const b = h('button', 'pri', hearts <= 0 ? '결과 보기' : '다음 ▶'); b.onclick = next; c.appendChild(b); body.appendChild(c); b.focus(); };
  function show() {
    keep(); drawHud(); body.innerHTML = ''; const r = rounds[i];
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
      q.opts.forEach((o, k) => { const b = h('button', '', (o.length > 2 ? nums[k] + ' ' : '') + o); b.onclick = () => { g.querySelectorAll('button').forEach(x => x.disabled = true); g.children[q.ans].classList.add('right'); if (k === q.ans) { ok(5); cont('✔ 정답! ' + q.why + ' ' + gLink(q.why), true); } else { b.classList.add('wrong'); bad(); cont(`정답은 ${nums[q.ans]}. ${q.why} ${gLink(q.why)}`, false); } const rv = h('button', '', '📖 이 문항 끊어 읽기·해석 보기'); rv.onclick = () => { const ov = h('div', 'talk solo'); const bx = h('div', 'tbox wide'); bx.appendChild(h('b', '', r.p.name)); r.p.s.forEach((s, j) => { const sv = sentenceView(s, j, { pid: r.p.id }); sv.classList.add('show-kos', 'show-tr', 'show-gr'); bx.appendChild(sv); }); const cl = h('button', 'pri', '닫기'); cl.onclick = () => ov.remove(); bx.appendChild(cl); ov.appendChild(bx); document.body.appendChild(ov); }; body.querySelector('.after').prepend(rv); }; g.appendChild(b); }); body.appendChild(g);
    }
    if (r.k === 'cloze') {
      const plain = fmt(r.s[0], 'plain').replace(/<[^>]+>/g, '').replace(/ \/ /g, ' '); const shown = plain.replace(r.re, '<span class="blank">　　　　</span>');
      body.appendChild(h('div', 'qk', r.type ? '빈칸 쓰기 — 첫 글자를 보고 직접 써 보세요' : '빈칸 채우기 — 원문에 있던 단어는?'));
      body.appendChild(h('div', 'paper', `<div class="ptext">${shown}</div><div class="pnote">뜻: ${r.m}</div>`));
      const fin = good => { if (good) { ok(4); cont(`✔ <b>${r.w}</b> — ${r.m}<br><small>${r.s[2]}</small>`, true); } else { bad(); cont(`정답: <b>${r.w}</b> — ${r.m}<br><small>${r.s[2]}</small>`, false); } };
      if (r.type) { const f = h('div', 'typer'); const inp = h('input'); inp.placeholder = r.w[0] + '…'; inp.autocapitalize = 'off'; inp.autocomplete = 'off'; const go = h('button', 'pri', '확인'); const chk = () => { go.disabled = inp.disabled = true; fin(inp.value.trim().toLowerCase() === r.w.toLowerCase()); }; go.onclick = chk; inp.onkeydown = e => { if (e.key === 'Enter') chk(); }; const gv = h('button', '', '모르겠어요'); gv.onclick = () => { go.disabled = inp.disabled = gv.disabled = true; fin(false); }; f.append(inp, go, gv); body.appendChild(f); setTimeout(() => inp.focus(), 50); }
      else { const others = shuffle(qOf(r.id).voc.concat(allVoc()).map(v => v[0]).filter(w => w.toLowerCase() !== r.w.toLowerCase() && !/[~A-Z]/.test(w[0] === w[0].toUpperCase() ? '' : '') && !/~|\bA\b/.test(w))); const opts = shuffle([r.w, ...[...new Set(others)].slice(0, 3)]); const g = h('div', 'opts'); opts.forEach(o => { const b = h('button', '', o); b.onclick = () => { g.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.textContent === r.w) x.classList.add('right'); }); if (o !== r.w) b.classList.add('wrong'); fin(o === r.w); }; g.appendChild(b); }); body.appendChild(g); }
    }
    if (r.k === 'recall') {
      body.appendChild(h('div', 'qk', '기억 카드 — 해석을 머릿속으로 먼저 떠올려 보세요'));
      const card = h('div', 'paper rcard', `<div class="ptext">${wrapWords(fmt(r.s[0], 'read').replace(/ \/ /g, ' <span class="sl">/</span> '))}</div>`); body.appendChild(card);
      const rv = h('button', 'pri big', '💭 떠올렸어요 — 해석 보기'); body.appendChild(rv);
      rv.onclick = () => { rv.remove(); card.appendChild(h('div', 'rans', `<div class="sxbox on">${Syntax.render(r.s)}</div><div class="tr2">${r.s[2]}</div>${(r.s[3] || []).length ? `<div class="gr2">${r.s[3].map(x => '▸ ' + x).join('<br>')}</div>` : ''}`)); Snd.play('paper');
        const g = h('div', 'selfrate'); [['😎 완벽히 떠올림', 2], ['🤔 절반쯤', 1], ['😵 몰랐음', 0]].forEach(([l, v]) => { const b = h('button', '', l); b.onclick = () => { g.querySelectorAll('button').forEach(x => x.disabled = true); if (v === 2) { ok(2); } else if (v === 1) { SRS.mark(r, false, true); combo = 0; } else { SRS.mark(r, false); combo = 0; miss++; } setTimeout(next, 250); }; g.appendChild(b); }); body.appendChild(g); };
    }
    if (r.k === 'sorder' || r.k === 'insert') {
      const P2 = P[PI[r.id]]; const plain = s => fmt(s[0], 'plain').replace(/<[^>]+>/g, '').replace(/ \/ /g, ' ').replace(/^\([A-C]\)\s*|^[①-⑤]\s*/, '');
      if (r.k === 'sorder') {
        body.appendChild(h('div', 'qk', '문장 순서 — 원래 순서대로 누르세요 (' + P2.name + ')')); let at = 0, err = 0; const built = h('div', 'built col'); body.appendChild(built); const g = h('div', 'opts col');
        shuffle(r.part.map((x, k) => [x[0], k])).forEach(([s, k]) => { const b = h('button', 'stxt', plain(s)); b.onclick = () => { if (k === at) { b.disabled = true; b.classList.add('used'); built.appendChild(h('div', 'bk2', (at + 1) + '. ' + plain(s))); at++; Snd.play('click'); if (at === r.part.length) { if (!err) ok(6); else combo = 0; cont(err ? `완성! (실수 ${err}번)<br><small>단서: 지시어(this, these, such), 연결어(but, so, however), 대명사가 앞 문장을 가리켜요.</small>` : '✔ 완벽한 흐름!', !err); } } else { err++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 300); Snd.play('wrong'); if (err === 2) bad(); } }; g.appendChild(b); }); body.appendChild(g);
      } else {
        const giv = r.all[r.at], rest = r.all.filter((_, k) => k !== r.at); body.appendChild(h('div', 'qk', '문장 삽입 — 주어진 문장이 들어갈 곳은? (' + P2.name + ')'));
        const nums = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪']; const slots = Math.min(rest.length, 5); const off = Math.max(0, Math.min(r.at - 1 - Math.floor(Math.random() * slots), rest.length - slots));
        let html = `<p class="given">${plain(giv[0])}</p><p>`; rest.forEach(([s], k) => { if (k > off && k - off <= slots) html += ` <b class="slot">( ${nums[k - off - 1]} )</b> `; html += plain(s) + ' '; }); if (rest.length - off <= slots && r.at === r.all.length - 1) html += ` <b class="slot">( ${nums[rest.length - off - 1]} )</b>`; html += '</p>'; body.appendChild(h('div', 'paper', `<div class="ptext">${html}</div>`));
        const ans = r.at - off - 1; const cnt = body.querySelectorAll('.slot').length; const g = h('div', 'opts'); for (let k = 0; k < cnt; k++) { const b = h('button', '', nums[k]); b.onclick = () => { g.querySelectorAll('button').forEach(x => x.disabled = true); g.children[ans] && g.children[ans].classList.add('right'); if (k === ans) { ok(6); cont('✔ 정답! <small>' + giv[2] + '</small>', true); } else { b.classList.add('wrong'); bad(); cont(`정답은 ${nums[ans]}. <small>앞뒤 문장의 지시어·연결어를 확인해 보세요. ${giv[2]}</small>`, false); } }; g.appendChild(b); } body.appendChild(g);
      }
    }
    if (r.k === 'gram') {
      const [q, opts, ans, why] = r.g; const gt = topicOf(q + ' ' + why + ' ' + opts.join(' ')); body.appendChild(h('div', 'qk', '문법 체크' + (gt ? ` <button class="glink" data-g="${gt.id}">📘 막히면: ${gt.title.split(' — ')[0]} 배우기</button>` : '')));
      body.appendChild(h('div', 'gq', q)); const g = h('div', 'opts col'); const sh = shuffle(opts.map((o, k) => [o, k]));
      sh.forEach(([o, k]) => { const b = h('button', '', o); b.onclick = () => { clearInterval(timer); g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); if (k === ans) { ok(); cont('✔ ' + why + (gt ? ' ' + gLink(gt.id) : ''), true); } else { b.classList.add('wrong'); bad(); cont(why + (gt ? `<br>${gLink(gt.id, gt.title.split(' — ')[0] + ' 개념부터 배우기')}` : ''), false); } }; g.appendChild(b); }); body.appendChild(g);
      startTimer(() => { g.querySelectorAll('button').forEach(x => x.disabled = true); [...g.children][sh.findIndex(z => z[1] === ans)].classList.add('right'); bad(); cont('시간 초과! ' + why, false); });
    }
  }
  function finish() {
    SV.resume = null;
    const stars = cfg.noHearts ? (miss === 0 ? 3 : miss / rounds.length <= .25 ? 2 : 1) : miss === 0 ? 3 : miss <= 2 ? 2 : 1; const prev = SV.stars[st.id] || 0, r0 = rankOf(SV.xp); SV.stars[st.id] = Math.max(prev, stars); SV.xp += gained + stars * 10; save(); const r1 = rankOf(SV.xp); if (r1 !== r0) setTimeout(() => { const t = h('div', 'rankup', `🎉 칭호 획득!<b>${r1}</b>`); document.body.appendChild(t); Snd.play('win'); setTimeout(() => t.remove(), 2600); }, 400); Snd.music('happy'); Snd.play('win');
    body.innerHTML = ''; hud.innerHTML = ''; const nd = SRS.due(CUR.id).length; const r = h('div', 'result', `<div class="big">${'★'.repeat(stars)}<s>${'★'.repeat(3 - stars)}</s></div><h2>클리어!</h2><p>실수 ${miss}번 · 얻은 공명 ✦ ${gained + stars * 10}</p><p class="dim">${miss ? `틀린 ${miss}개는 🔁 오늘의 복습에 들어갔어요.` : '맞힌 것들은 며칠 뒤 복습으로 다시 나와요.'} 오늘 ${SV.days[today()] || 0}/${GOAL}</p>`);
    const nx = h('button', 'pri', st.type === 'all' ? '계속 ▶' : '읽기로 돌아가기'); nx.onclick = () => st.type === 'all' ? talk(TALK[CUR.id] && !prev ? TALK[CUR.id].out : null, hub) : read();
    const rt = h('button', '', '↺ 다시 도전'); rt.onclick = () => st.type === 'all' ? (st.id.endsWith(':var') ? variant() : st.id.endsWith(':cards') ? cards() : st.id.endsWith(':rev') ? review() : challenge()) : practice(st.p);
    if (st.type === 'all') nx.onclick = () => st.id === CUR.id ? talk(TALK[CUR.id] && !prev ? TALK[CUR.id].out : null, hub) : hub();
    r.append(nx, rt); body.appendChild(r);
  }
  function fail() {
    SV.resume = null; save();
    Snd.music('sad'); body.innerHTML = ''; const r = h('div', 'result fail', `<h2>하트가 다 떨어졌어요</h2><p>괜찮아요. 틀린 문장을 다시 읽고 오면 돼요.</p>`);
    const rd = h('button', 'pri', '📖 다시 읽기'); rd.onclick = () => read();
    const rt = h('button', '', '↺ 바로 다시 도전'); rt.onclick = () => st.type === 'all' ? challenge() : practice(st.p); r.append(rd, rt); body.appendChild(r);
  }
  show();
}
/* ── 문법 수업 ───────────────────────────────── */
const topicOf = t => { const x = String(t || '').replace(/<[^>]+>/g, ' '); return (window.GRAM || []).find(g => g.re.test(x)); };
function gLink(t, label) { const g = (window.GRAM || []).find(x => x.id === t) || topicOf(t); return g ? `<button class="glink" data-g="${g.id}">📘 ${label || g.title.split(' — ')[0]}</button>` : ''; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.glink'); if (b) { e.stopPropagation(); e.preventDefault(); gramLesson(b.dataset.g); } }, true);
function gramLesson(id) {
  const g = GRAM.find(x => x.id === id); if (!g) return; const ov = h('div', 'talk solo glesson'); const bx = h('div', 'tbox wide'); ov.appendChild(bx); document.body.appendChild(ov); let k = 0; Snd.play('paper');
  const close = () => ov.remove();
  const draw = () => { bx.innerHTML = ''; const top = h('div', 'gtop', `<b>${g.icon} ${g.title}</b><span>${k < g.cards.length ? (k + 1) + ' / ' + g.cards.length : '확인 퀴즈'}</span>`); const x = h('button', 'ghost', '✕'); x.onclick = close; top.appendChild(x); bx.appendChild(top);
    const dots = h('div', 'gdots', g.cards.map((_, i) => `<i class="${i < k ? 'd' : i === k ? 'o' : ''}"></i>`).join('') + `<i class="${k >= g.cards.length ? 'o' : ''}">?</i>`); bx.appendChild(dots);
    if (k < g.cards.length) { const c = g.cards[k]; bx.appendChild(h('div', 'gcard', `<h3>${c.h}</h3><div class="gb">${c.b}</div>`)); const nav = h('div', 'gnav'); const pv = h('button', '', '◀ 이전'); pv.disabled = !k; pv.onclick = () => { k--; draw(); }; const nx = h('button', 'pri', k === g.cards.length - 1 ? '확인 퀴즈 ▶' : '다음 ▶'); nx.onclick = () => { k++; Snd.play('click'); draw(); }; nav.append(pv, nx); bx.appendChild(nav); bx.querySelectorAll('.gb .eg').forEach(e => e.innerHTML = wrapWords(e.innerHTML)); }
    else { let n = 0, right = 0; const qs = g.quiz; const qa = () => { bx.querySelectorAll('.gq2').forEach(e => e.remove()); if (n >= qs.length) { const d = h('div', 'gq2 gdone', `<h3>${right === qs.length ? '🎉 완벽해요!' : `${qs.length}문제 중 ${right}개 맞힘`}</h3><p>${right === qs.length ? '이제 이 문법 문제는 풀 수 있어요.' : '틀린 건 카드를 한 번 더 보고 다시 풀어 보세요.'}</p>`); const again = h('button', '', '↺ 카드 다시 보기'); again.onclick = () => { k = 0; draw(); }; const done = h('button', 'pri', '돌아가기'); done.onclick = close; d.append(again, done); bx.appendChild(d); if (right === qs.length) { SV.gram = SV.gram || {}; SV.gram[g.id] = 1; SV.xp += 15; save(); Snd.play('win'); } return; }
        const [q, opts, ans, why] = qs[n]; const box = h('div', 'gq2', `<div class="gq">${n + 1}. ${q}</div>`); const og = h('div', 'opts col'); const sh = shuffle(opts.map((o, i) => [o, i])); sh.forEach(([o, i]) => { const b = h('button', '', o); b.onclick = () => { og.querySelectorAll('button').forEach(z => z.disabled = true); og.children[sh.findIndex(z => z[1] === ans)].classList.add('right'); if (i === ans) { right++; Snd.play('win'); } else { b.classList.add('wrong'); Snd.play('wrong'); } const af = h('div', 'after ' + (i === ans ? 'good' : 'bad'), (i === ans ? '✔ ' : '') + why); const nb = h('button', 'pri', '다음 ▶'); nb.onclick = () => { n++; qa(); }; af.appendChild(nb); box.appendChild(af); }; og.appendChild(b); }); box.appendChild(og); bx.appendChild(box); };
      qa(); }
    ov.scrollTop = 0; };
  draw();
}
function gramLib() {
  Snd.music('camp'); const a = screen('notes'); a.appendChild(topbar('📘 문법 수업', ['허브', hub]));
  const cnt = {}; LIB.forEach(ps => ps.paras.forEach(p => p.s.forEach(s => (s[3] || []).forEach(m => { const g = topicOf(m); if (g) cnt[g.id] = (cnt[g.id] || 0) + (ps.id === CUR.id ? 3 : 1); }))));
  a.appendChild(h('p', 'hint', '시험 범위 지문에 나온 문법을 처음부터 설명해요. 카드로 개념을 보고 마지막 확인 퀴즈까지 풀면 ✔가 붙어요. 이 지문에 많이 나온 순서예요.'));
  const g = h('div', 'steps'); GRAM.slice().sort((x, y) => (cnt[y.id] || 0) - (cnt[x.id] || 0)).forEach(t => { const b = h('button', 'step' + ((SV.gram || {})[t.id] ? ' done' : ''), `<span class="ic">${t.icon}</span><b>${t.title.split(' — ')[0]}</b><small>${t.title.split(' — ')[1] || ''}${cnt[t.id] ? ` · 시험 범위에 ${cnt[t.id]}번+` : ''}</small>`); b.onclick = () => gramLesson(t.id); g.appendChild(b); }); a.appendChild(g);
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
