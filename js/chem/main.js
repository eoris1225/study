/* 화학 개념 강의: 교과서 순서 · 3D 무대 · 확인 질문 · 교과서 문제(사진) · 펜 필기 · 진행 저장 */
import { show, has, view } from './stage.js?v=1';
const $ = s => document.querySelector(s);
const C = window.CHEM, Q = window.CHEMQ;
const KEY = 'chem_v1';
let SAVE = { pos: null, res: {} }; try { Object.assign(SAVE, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) { } };
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/* 절 목록 평탄화 */
const SECS = []; C.forEach((u, ui) => u.ch.forEach((c, ci) => c.secs.forEach((s, si) => SECS.push({ ui, ci, si, u, c, s, label: `${u.t.split('.')[0]}-${ci + 1} · ${s.t}` }))));
const card = $('#card'), head = $('#card .hd'), body = $('#card .bd'), foot = $('#card .ft');

/* 레이아웃: 카드 옆 빈 공간에 3D */
function layout() { const port = innerWidth < 820 || innerHeight > innerWidth; document.body.classList.toggle('port', port); if (card.hidden) return view(0, 0); const r = card.getBoundingClientRect(); if (port) view(0, (innerHeight - r.top) / 2); else view((innerWidth - r.left) / 2, 0); }
addEventListener('resize', layout);
function fig(name) { return name ? `<div class="fig"><img src="img/chem/${name}.jpg" alt="교과서 그림"><button class="zb" data-z>🔍 크게</button></div>` : ''; }
body.addEventListener('click', e => { const z = e.target.closest('[data-z]'); if (z) { e.stopPropagation(); window.__zoomfig && window.__zoomfig(z.parentNode.querySelector('img')); } });
function wait() { return new Promise(res => { foot.onclick = e => { const b = e.target.closest('[data-b]'); if (b) res(b.dataset.b); }; }); }
function setFoot(html) { foot.innerHTML = html; }
function topbar(t) { $('#top span').textContent = t; }

/* ── 개념 진행 ── */
async function run(start) {
  card.hidden = false; $('#menu').hidden = true; $('#top').hidden = false; layout();
  let idx = start ? start.i : 0, st = start ? start.st || 0 : 0;
  while (idx < SECS.length) {
    const X = SECS[idx], S = X.s; topbar(`${X.c.t} › ${S.t}  (${idx + 1}/${SECS.length})`);
    const state = i => { let f = null, sc = null; for (let k = 0; k <= i; k++) { const x = S.steps[k]; if (x[1]) f = x[1]; if (x[2]) sc = x[2]; } return { f, sc }; };
    let i = Math.min(st, S.steps.length - 1); let back = false;
    if (st < 900) {
      for (;;) { const { f, sc } = state(i); head.innerHTML = `<b>${S.t}</b><span>설명 ${i + 1} / ${S.steps.length}</span>`;
        body.innerHTML = fig(f) + S.steps.slice(0, i + 1).map((x, k) => `<p class="st${k === i ? ' now' : ''}">${x[0]}</p>`).join('') + (sc ? '<p class="hint">👈 왼쪽 3D는 끌어서 돌리고, 아래 버튼으로 직접 조작해 봐.</p>' : '');
        const now = body.querySelector('.now'); if (now) now.scrollIntoView({ block: 'nearest' }); if (sc) show(sc); layout();
        SAVE.pos = { i: idx, st: i }; save(); setFoot(`<button data-b="prev" ${idx === 0 && i === 0 ? 'disabled' : ''}>◀ 이전</button><button class="pri" data-b="next">${i < S.steps.length - 1 ? '다음 ▶' : '확인 질문 ▶'}</button>`);
        const a = await wait(); if (a === 'prev') { if (i > 0) { i--; continue; } back = true; break; } if (i < S.steps.length - 1) { i++; continue; } break; }
      if (back) { idx = Math.max(0, idx - 1); st = 0; continue; }
      for (const q of S.ask || []) await ask(q, S.t);
    }
    for (const id of S.probs || []) { const r = await prob(id); if (r === 'menu') return menu(); }
    idx++; st = 0; SAVE.pos = { i: idx, st: 0 }; save();
  }
  SAVE.pos = null; save(); menu();
}
function ask([q, o, a, why], t) { return new Promise(res => { const ord = shuffle(o.map((_, k) => k)); head.innerHTML = `<b>✋ 확인</b><span>${t}</span>`;
  body.innerHTML = `<p class="q">${q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join('')}</div><div class="fb"></div>`; setFoot(''); let tries = 0;
  body.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = body.querySelector('.fb');
    if (k === a || ++tries >= 2) { body.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); }); if (k !== a) b.classList.add('no'); fb.className = 'fb ' + (k === a ? 'ok' : 'no'); fb.innerHTML = `${k === a ? '⭕ 맞아!' : `정답은 <b>${o[a]}</b>`} <span>${why}</span>`; setFoot('<button class="pri" data-b="next">다음 ▶</button>'); wait().then(res); }
    else { b.classList.add('no'); b.disabled = true; fb.className = 'fb no'; fb.innerHTML = '다시 한 번! 위 설명을 떠올려 봐.'; } }; }); }

/* ── 교과서 문제 ── */
function prob(id) { return new Promise(async res => { const P = Q[id]; if (!P) return res(); head.innerHTML = `<b>📝 교과서 문제</b><span>${P.src}</span>`; card.hidden = false; layout();
  const top = `${fig(P.img)}<div class="tools"><button data-ink>✍️ 필기</button><button data-clr>지우기</button><button data-skip>정답만 보기</button></div>`;
  let right = true, fin = false; const done = (ok) => { if (fin) return; fin = true; SAVE.res[id] = ok ? 1 : 0; save(); setFoot(`<button data-b="menu">☰ 메뉴</button><button class="pri" data-b="next">다음 ▶</button>`); wait().then(a => res(a === 'menu' ? 'menu' : null)); };
  const answer = () => `<div class="ans">✅ <b>정답</b> ${P.ans || (P.o ? P.o[P.a] : '')}</div>`;
  setFoot('');
  if (P.type === 'bogi') { body.innerHTML = top + `<p class="q">보기를 하나씩 판단해 봐.</p>` + P.items.map(([l, t], k) => `<div class="bg" data-i="${k}"><p><b>${l}.</b> ${t}</p><div class="ox"><button data-v="1">⭕ 맞다</button><button data-v="0">❌ 틀리다</button></div><div class="why"></div></div>`).join('') + '<div class="end"></div>';
    let left = P.items.length; body.querySelectorAll('.bg').forEach(el => el.querySelector('.ox').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const [, , truth, why] = P.items[+el.dataset.i]; const ok = (b.dataset.v === '1') === truth; if (!ok) right = false;
      el.querySelectorAll('button').forEach(x => { x.disabled = true; if ((x.dataset.v === '1') === truth) x.classList.add('ok'); }); if (!ok) b.classList.add('no'); el.querySelector('.why').innerHTML = `${ok ? '⭕' : '❌'} ${truth ? '맞는 말' : '틀린 말'} — ${why}`; if (--left === 0) { body.querySelector('.end').innerHTML = answer(); done(right); } }); }
  else if (P.type === 'mc') { const ord = shuffle(P.o.map((_, k) => k)); body.innerHTML = top + `<p class="q">${P.q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${P.o[k]}</button>`).join('')}</div><div class="fb"></div>`; let tries = 0;
    body.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = body.querySelector('.fb'); if (k !== P.a) { right = false; tries++; b.classList.add('no'); b.disabled = true; if (tries < 2) { fb.className = 'fb no'; fb.innerHTML = '다시 한 번!'; return; } }
      body.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === P.a) x.classList.add('ok'); }); fb.className = 'fb ' + (k === P.a ? 'ok' : 'no'); fb.innerHTML = `${k === P.a ? '⭕ 정답!' : `정답은 <b>${P.o[P.a]}</b>`} <span>${P.ex}</span>`; done(right); }; }
  else { body.innerHTML = top + '<p class="q">사진의 문제를 먼저 직접 풀어 봐 (✍️ 필기). 막히면 한 단계씩 같이 풀자.</p><div class="steps"></div><div class="end"></div>';
    const box = body.querySelector('.steps'); for (let s = 0; s < P.steps.length; s++) { const [q, o, a, why] = P.steps[s]; const ord = shuffle(o.map((_, k) => k)); const el = document.createElement('div'); el.className = 'gs'; el.innerHTML = `<p><b>${s + 1}.</b> ${q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join('')}</div><div class="fb"></div>`; box.appendChild(el); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await new Promise(r2 => { let tries = 0; el.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = el.querySelector('.fb'); if (k !== a) { right = false; tries++; b.classList.add('no'); b.disabled = true; if (tries < 2) { fb.className = 'fb no'; fb.innerHTML = '음, 다시 생각해 봐.'; return; } }
        el.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); }); fb.className = 'fb ' + (k === a ? 'ok' : 'no'); fb.innerHTML = `${k === a ? '⭕' : `→ <b>${o[a]}</b>`} <span>${why}</span>`; r2(); }; }); }
    body.querySelector('.end').innerHTML = answer(); body.querySelector('.end').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); done(right); }
  body.querySelector('[data-skip]').onclick = () => { if (!body.querySelector('.ans')) { body.insertAdjacentHTML('beforeend', answer() + (P.type === 'bogi' ? P.items.map(([l, t, v, w]) => `<p class="why">${l}. ${v ? '⭕' : '❌'} ${w}</p>`).join('') : P.type === 'steps' ? P.steps.map(([q, o, a, w], i) => `<p class="why">${i + 1}. ${q} → <b>${o[a]}</b> ${w}</p>`).join('') : '')); done(false); } };
  inkSetup(); }); }

/* ── 펜 필기: 펜은 항상 쓰기, 손가락은 스크롤 (카드 안 내용과 같이 움직임) ── */
let ink = null;
function inkSetup() { const b = body.querySelector('[data-ink]'), clr = body.querySelector('[data-clr]'); if (!b) return; ink = null; b.onclick = () => { if (ink) { ink.cv.remove(); ink = null; b.classList.remove('on'); body.classList.remove('inking'); return; } const cv = document.createElement('canvas'); cv.className = 'ink'; body.appendChild(cv); const r = Math.min(2, devicePixelRatio || 1); cv.width = body.scrollWidth * r; cv.height = Math.max(body.scrollHeight, body.clientHeight) * r; cv.style.width = body.scrollWidth + 'px'; cv.style.height = Math.max(body.scrollHeight, body.clientHeight) + 'px'; ink = { cv, g: cv.getContext('2d'), r }; b.classList.add('on'); body.classList.add('inking'); };
  clr.onclick = () => { if (ink) ink.g.clearRect(0, 0, ink.cv.width, ink.cv.height); }; }
let pen = null, fing = null, penDown = false, penUp = 0;
body.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') penDown = true; if (!ink) return; if (e.pointerType === 'touch' && (penDown || Date.now() - penUp < 300)) { e.preventDefault(); return; }
  if (e.pointerType === 'pen' || e.pointerType === 'mouse' && e.shiftKey) { const ctl = e.target.closest('button'); const r = ink.cv.getBoundingClientRect(); pen = { id: e.pointerId, x: (e.clientX - r.left) * ink.r, y: (e.clientY - r.top) * ink.r, moved: false, ctl }; e.preventDefault(); body.setPointerCapture(e.pointerId); return; }
  if (e.pointerType === 'touch') fing = { id: e.pointerId, y: e.clientY }; });
body.addEventListener('pointermove', e => { if (pen && e.pointerId === pen.id && ink) { const r = ink.cv.getBoundingClientRect(), x = (e.clientX - r.left) * ink.r, y = (e.clientY - r.top) * ink.r; if (!pen.moved && Math.hypot(x - pen.x, y - pen.y) < 6 * ink.r) return; pen.moved = true; const g = ink.g; g.strokeStyle = '#ffe27a'; g.lineWidth = (1.4 + (e.pressure || .5) * 2.2) * ink.r; g.lineCap = 'round'; g.beginPath(); g.moveTo(pen.x, pen.y); g.lineTo(x, y); g.stroke(); pen.x = x; pen.y = y; e.preventDefault(); }
  else if (fing && e.pointerId === fing.id && ink) { body.scrollTop -= e.clientY - fing.y; fing.y = e.clientY; } });
const up = e => { if (e.pointerType === 'pen') { penDown = false; penUp = Date.now(); } if (pen && e.pointerId === pen.id) { if (!pen.moved && pen.ctl) pen.ctl.click(); pen = null; } if (fing && e.pointerId === fing.id) fing = null; };
body.addEventListener('pointerup', up); body.addEventListener('pointercancel', up);

/* ── 메뉴 ── */
async function solveList(ids, title) { $('#menu').hidden = true; $('#top').hidden = false; topbar(title); for (const id of ids) { const r = await prob(id); if (r === 'menu') break; } menu(); }
function menu() { card.hidden = true; $('#top').hidden = true; layout(); show('maxwell'); const m = $('#menu'); m.hidden = false;
  const cur = SAVE.pos ? SECS[Math.min(SAVE.pos.i, SECS.length - 1)] : null; const allQ = Object.keys(Q); const wrong = allQ.filter(id => SAVE.res[id] === 0); const doneN = allQ.filter(id => id in SAVE.res).length;
  const unitQ = u => SECS.filter(x => x.u.id === u).flatMap(x => x.s.probs || []);
  m.innerHTML = `<div class="mc"><h1>화학 <small>Ⅲ 화학 변화의 자발성 · Ⅳ 반응 속도</small></h1>
   <button class="big pri" data-go>${cur ? '▶ 이어서 — ' + cur.label : '▶ 처음부터 시작'}</button>
   <div class="row"><select data-sec>${SECS.map((x, i) => `<option value="${i}" ${cur && x === cur ? 'selected' : ''}>${x.label}</option>`).join('')}</select><button data-from>여기부터</button></div>
   <h3>📝 교과서 문제 <small>${doneN}/${allQ.length} 풀이</small></h3>
   <div class="grid"><button data-u="III">Ⅲ 문제 전부 (${unitQ('III').length})</button><button data-u="IV">Ⅳ 문제 전부 (${unitQ('IV').length})</button>${wrong.length ? `<button data-w>🔁 틀린 문제 (${wrong.length})</button>` : ''}</div>
   <div class="row"><button data-home>🏠 홈</button></div>
   <p class="tip">왼쪽 3D는 끌어서 돌리고 버튼·슬라이더로 직접 조작할 수 있어. 교과서 그림은 🔍로만 커져 (실수로 안 커짐). 문제에서 ✍️ 필기를 켜면 펜으로 쓰고 손가락으로 스크롤.</p></div>`;
  m.onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.go !== undefined) return run(SAVE.pos || { i: 0, st: 0 });
    if (b.dataset.from !== undefined) return run({ i: +m.querySelector('[data-sec]').value, st: 0 });
    if (b.dataset.u) return solveList(unitQ(b.dataset.u), b.textContent);
    if (b.dataset.w !== undefined) return solveList(wrong, '틀린 문제 다시');
    if (b.dataset.home !== undefined) location.href = 'index.html'; };
}
$('#top button').onclick = () => menu();
menu();
