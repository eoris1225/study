/* 미토: 화면 UI — HUD, 대사창, 퀴즈 관문(문제은행), 알림, 목표 표시 */
import { IN, sfx } from './engine.js?v=202611231459';
const $ = s =>document.querySelector(s);
const esc = s =>String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function chem(s) { return String(s).replace(/NAD\+/g, 'NAD<sup>+</sup>').replace(/H\+/g, 'H<sup>+</sup>').replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>'); }
function chemHTML(html) { return String(html).split(/(<[^>]+>)/).map(p =>p.startsWith('<') ? p : chem(p)).join(''); }

export const SAVE = (() => { let s = {}; try { s = JSON.parse(localStorage.getItem('bio_game_v1')) || {}; } catch (e) { } return Object.assign({ reached: 0, wrong: [], right: {}, best: 0 }, s); })();
export function save() { try { localStorage.setItem('bio_game_v1', JSON.stringify(SAVE)); } catch (e) { } }

/* ── HUD ── */
/* 개념 패널: 전체 과정 지도 + 지금 위치 + 게임 행동이 실제로 무엇인지 */
const MAPS = {
  resp: { t: '세포호흡 지도 — 포도당 1개 → ATP 32개', n: [['', '포도당', '세포 밖→안'], ['', '해당 과정', '세포질'], ['', '피루브산 산화', '기질'], ['', 'TCA 회로', '기질'], ['', '전자 전달계', '내막'], ['', 'ATP 합성 효소', '내막']] },
  ferm: { t: '발효 지도 — 산소가 없을 때', n: [['', '포도당', '세포질'], ['', '해당 과정 (2ATP)', '세포질'], ['', '피루브산', '세포질'], ['', '젖산·에탄올 + NAD⁺ 재생', '세포질']] },
  enz: { t: '효소 지도 — 반응을 쉽게 만드는 단백질', n: [['', '활성화 에너지', '언덕'], ['', '기질 특이성', '모양 맞추기'], ['', '효소·기질 복합체', '결합'], ['', '생성물 + 효소 재사용', '반응 끝'], ['', '보조 인자', '전효소']] },
  photo: { t: '광합성 지도 — 빛 + CO₂ + H₂O → 포도당', n: [['', '빛 흡수 (색소)', '타이라코이드 막'], ['', '물 분해 → O₂', '광계 Ⅱ'], ['', 'H⁺ 쌓기', '타이라코이드 내부'], ['', 'NADPH', '광계 Ⅰ'], ['', 'ATP', 'ATP 합성 효소'], ['', '캘빈 회로', '스트로마'], ['', '포도당', '스트로마']] }
};
let GOPEN = true;
export function guide(map, at, now, real) {
  const g = $('#guide'); if (!map) { g.hidden = true; return; } const M = MAPS[map]; g.hidden = false;
  g.innerHTML = `<button class="gx">${GOPEN ? '접기 ▴' : '개념 ▾'}</button><div class="gb" ${GOPEN ? '' : 'hidden'}><i>${M.t}</i><div class="gm">${M.n.map(([e, n, w], k) => `<span class="${k < at ? 'done' : k === at ? 'cur' : ''}"><em>${e}</em><b>${chem(n)}</b><small>${w}</small></span>`).join('<u>→</u>')}</div>
  ${now ? `<p class="gn"><b>지금 하는 일</b>${chemHTML(now)}</p>` : ''}${real ? `<p class="gr"><b>실제 세포에선</b>${chemHTML(real)}</p>` : ''}</div>`;
  g.querySelector('.gx').onclick = e => { e.stopPropagation(); GOPEN = !GOPEN; guide(map, at, now, real); };
}
export const HUD = {
  inv: {}, set(k, v) { this.inv[k] = v; const el = $(`#inv [data-k="${k}"] b`); if (el) { el.textContent = Number.isInteger(v) ? v : v.toFixed(1); const p = el.parentElement; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); } },
  add(k, d) { this.set(k, (this.inv[k] || 0) + d); },
  show(k, on) { const el = $(`#inv [data-k="${k}"]`); if (el) el.hidden = !on; },
  mission(t, sub) { $('#mt').innerHTML = `<b>${esc(t)}</b><span>${chemHTML(sub || '')}</span>`; },
  obj(html) { $('#obj').innerHTML = chemHTML(html || ''); $('#obj').hidden = !html; },
  board(rows) { const b = $('#board'); if (!rows) { b.hidden = true; return; } b.hidden = false; b.innerHTML = '<i>포도당 1분자 결산</i>' + rows.map(([k, v, c]) => `<div style="--c:${c}"><span>${chem(k)}</span><b>${v}</b></div>`).join(''); }
};
export function toast(html, col = '#7fffe0') { const t = document.createElement('div'); t.className = 'toast'; t.style.setProperty('--c', col); t.innerHTML = chemHTML(html); $('#toasts').appendChild(t); setTimeout(() =>t.classList.add('out'), 2200); setTimeout(() =>t.remove(), 2700); }
export function banner(big, small, col = '#ffd23f') { const b = $('#banner'); b.style.setProperty('--c', col); b.innerHTML = `<b>${chemHTML(big)}</b><small>${chemHTML(small || '')}</small>`; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
export function flash(col = '#fff') { const f = $('#flash'); f.style.background = col; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }

/* ── 대사 ── */
const WHO = { m: ['미토', '#5af0ff'], s: ['정리', '#ffd23f'], x: ['경보', '#ff5a8a'] };
export function say(lines) {
  return new Promise(res => {
    const box = $('#talk'); IN.locked = true; let i = 0, typing = null;
    const show = () => {
      if (i >= lines.length) { box.hidden = true; IN.locked = false; box.onclick = null; removeEventListener('keydown', kd); res(); return; }
      let [w, t] = typeof lines[i] === 'string' ? [SPEAK === 'mito' ? 'm' : SPEAK, lines[i]] : lines[i]; const [n, c] = WHO[w] || [CAST[w] ? CAST[w].n : '미토', CAST[w] ? CAST[w].c : '#5af0ff'];
      box.hidden = false; box.querySelector('.who').textContent = n; box.querySelector('.who').style.color = c; const fc = box.querySelector('.face'); if (CAST[w]) { fc.className = 'face cast'; fc.innerHTML = face(w, 58); box.querySelector('.who').textContent = CAST[w].n; box.querySelector('.who').style.color = CAST[w].c; } else { fc.className = 'face ' + w; fc.innerHTML = '<span></span><span></span>'; }
      const el = box.querySelector('.txt'); const full = chemHTML(t); el.innerHTML = ''; let k = 0; const plain = full.replace(/<[^>]+>/g, '');
      clearInterval(typing); typing = setInterval(() => { k += 2; if (k >= plain.length) { clearInterval(typing); typing = null; el.innerHTML = full; } else el.textContent = plain.slice(0, k); }, 16); sfx('tick');
    };
    const next = () => { if (typing) { clearInterval(typing); typing = null; let [, t] = typeof lines[i] === 'string' ? ['m', lines[i]] : lines[i]; box.querySelector('.txt').innerHTML = chemHTML(t); return; } i++; show(); };
    const kd = e => { if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); next(); } };
    box.onclick = next; addEventListener('keydown', kd); show();
  });
}
/* 선택지 (QTE 등) */
export function choose(title, opts, ans) {
  return new Promise(res => {
    IN.locked = true; const p = $('#pick3'); p.hidden = false; p.innerHTML = `<p>${chemHTML(title)}</p><div></div>`; const box = p.querySelector('div');
    opts.forEach((o, k) => { const b = document.createElement('button'); b.innerHTML = chemHTML(o); b.onclick = () => { [...box.children].forEach((x, j) => { x.disabled = true; if (j === ans) x.classList.add('right'); }); const ok = k === ans; if (!ok) b.classList.add('wrong'); sfx(ok ? 'ok' : 'bad'); setTimeout(() => { p.hidden = true; IN.locked = false; res(ok); }, ok ? 650 : 1300); }; box.appendChild(b); });
  });
}

/* ── 퀴즈 관문 ── */
const norm = s =>String(s).toLowerCase().replace(/\s+/g, '').replace(/[₀-₉]/g, d => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(d)]).replace(/[⁺+]/g, '+').replace(/[()·.,]/g, '');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function pickQs(chs, n) {
  const pool = (window.BQ || []).filter(q =>chs.includes(q.ch));
  const w = q =>(SAVE.wrong.includes(q.id) ? -2 : 0) + (SAVE.right[q.id] || 0) + Math.random() * 1.5; /* 틀렸던 것·안 푼 것 먼저 */
  return pool.sort((a, b) =>w(a) - w(b)).slice(0, n);
}
export function quiz(qs, title = '지식 관문') {
  return new Promise(res => {
    if (!qs.length) return res({ right: 0, total: 0 });
    IN.locked = true; const ov = $('#quiz'); ov.hidden = false; let i = 0, right = 0;
    /* 푼 위치 저장: 새로고침·업데이트 후에도 그 문제부터 이어서 */
    const QK = 'bio_quizpos', qkey = title; let QP = {}; try { QP = JSON.parse(localStorage.getItem(QK)) || {}; } catch (e) { }
    /* 같은 제목의 퀴즈를 풀던 중이면, 그때 문제 목록 그대로 이어서 (무작위로 뽑힌 문제도 같은 순서로) */
    if (QP[qkey] && QP[qkey].ids) { const old = QP[qkey].ids.map(id => (window.BQ || []).find(q => q.id === id)); if (old.every(Boolean) && QP[qkey].i < old.length) { qs = old; i = QP[qkey].i; right = QP[qkey].r || 0; } }
    const qsave = () => { try { if (i >= qs.length) delete QP[qkey]; else QP[qkey] = { i, r: right, ids: qs.map(q => q.id) }; const ks = Object.keys(QP); if (ks.length > 30) delete QP[ks[0]]; localStorage.setItem(QK, JSON.stringify(QP)); } catch (e) { } };
    const one = () => { qsave();
      if (i >= qs.length) { ov.hidden = true; IN.locked = false; save(); res({ right, total: qs.length }); return; }
      const q = qs[i]; ov.innerHTML = `<div class="qc"><div class="qh"><span>${esc(title)}</span><span>${i + 1} / ${qs.length}</span></div><div class="src">${esc(q.src || '')}</div>${q.img ? `<div class="qimg"><img src="${q.img}" alt="교과서 문제"><small>교과서 원본 <button class="zbtn" type="button">🔍 크게 보기</button></small></div>` : q.figf ? `<div class="fig">${q.figf()}</div>` : q.fig ? `<div class="fig">${chemHTML(q.fig)}</div>` : ''}${q.img && q.type === 'fill' ? '<div class="qtag">답 쓰기</div>' : ''}<div class="qq${q.img && q.type !== 'fill' ? ' qhide' : ''}"></div><div class="qa"></div><div class="qx" hidden></div><div class="qb"></div></div>`;
      const qq = ov.querySelector('.qq'), qa = ov.querySelector('.qa'), qx = ov.querySelector('.qx'), qb = ov.querySelector('.qb');
      const qi = ov.querySelector('.qimg'); if (qi) qi.querySelector('.zbtn').onclick = e => { e.stopPropagation(); window.__zoomfig && window.__zoomfig(qi.querySelector('img')); };
      const finish = (ok, detail) => { if (ok) { right++; SAVE.right[q.id] = (SAVE.right[q.id] || 0) + 1; SAVE.wrong = SAVE.wrong.filter(x =>x !== q.id); } else if (!SAVE.wrong.includes(q.id)) SAVE.wrong.push(q.id); sfx(ok ? 'ok' : 'bad');
        qx.hidden = false; qx.className = 'qx ' + (ok ? 'ok' : 'no'); qx.innerHTML = `<b>${ok ? '정답' : '오답'}</b>${detail ? '<div>' + chemHTML(detail) + '</div>' : ''}<div>${chemHTML(q.exp || '')}</div>`;
        qb.innerHTML = ''; const n = document.createElement('button'); n.className = 'pri'; n.textContent = i + 1 < qs.length ? '다음 ▶' : '관문 통과 ▶'; n.onclick = () => { i++; one(); }; qb.appendChild(n); n.focus(); };
      if (q.type === 'choice' || q.type === 'multi') {
        qq.innerHTML = chemHTML(q.q); const multi = q.type === 'multi'; const sel = new Set();
        const ord = multi || q.img ? q.o.map((_, k) => k) : shuffle(q.o.map((_, k) => k)); const btn = []; ord.forEach((k, pos) => { const o = q.o[k]; const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<i>${'①②③④⑤⑥⑦⑧'[pos]}</i> ${chemHTML(o)}`; b.onclick = () => { if (multi) { sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle('sel'); return; } [...qa.children].forEach((x, j) => { x.disabled = true; if (ord[j] === q.a) x.classList.add('right'); }); if (k !== q.a) b.classList.add('wrong'); finish(k === q.a); }; qa.appendChild(b); });
        if (multi) { const s = document.createElement('button'); s.className = 'pri'; s.textContent = '제출'; s.onclick = () => { const A = new Set(q.a); const ok = A.size === sel.size && [...A].every(x =>sel.has(x)); [...qa.children].forEach((x, j) => { x.disabled = true; if (A.has(j)) x.classList.add('right'); else if (sel.has(j)) x.classList.add('wrong'); }); finish(ok, '정답: ' + q.a.map(k =>q.o[k]).join(', ')); }; qb.appendChild(s); }
      } else if (q.type === 'order') {
        qq.innerHTML = chemHTML(q.q); const got = []; const out = document.createElement('div'); out.className = 'ord'; qa.before(out);
        shuffle(q.o.map((o, k) => [o, k])).forEach(([o, k]) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = chemHTML(o); b.onclick = () => { b.disabled = true; got.push(k); out.innerHTML += `<span>${chemHTML(o)}</span>`; if (got.length === q.o.length) finish(got.every((x, j) =>x === j), '정답 순서: ' + q.o.join(' → ')); }; qa.appendChild(b); });
      } else if (q.type === 'ox') {
        qq.innerHTML = chemHTML(q.q); const pick = [];
        q.s.forEach(([t, v], k) => { const row = document.createElement('div'); row.className = 'oxr'; row.innerHTML = `<span>(${k + 1})${q.oxNum ? ' 번 문장' : ' ' + chemHTML(t)}</span><button>○</button><button>×</button>`; const [bo, bx] = row.querySelectorAll('button'); bo.onclick = () => { pick[k] = true; bo.classList.add('sel'); bx.classList.remove('sel'); }; bx.onclick = () => { pick[k] = false; bx.classList.add('sel'); bo.classList.remove('sel'); }; qa.appendChild(row); });
        const s = document.createElement('button'); s.className = 'pri'; s.textContent = '확인'; qb.appendChild(s);
        s.onclick = () => { const good = q.s.map(([, v], k) =>pick[k] === v); [...qa.children].forEach((row, k) => { row.classList.add(good[k] ? 'g' : 'b'); row.querySelectorAll('button').forEach(b =>b.disabled = true); }); finish(good.every(Boolean), '정답: ' + q.s.map(([, v], k) => `(${k + 1}) ${v ? '○' : '×'}`).join('  ')); };
      } else if (q.type === 'w') {
        qq.innerHTML = chemHTML(q.q);
        /* 손글씨 답안지: 손가락·펜으로 직접 쓰고, 모범 답안과 비교해 스스로 채점 */
        const WK = 'bio_wink_v1'; let WS = {}; try { WS = JSON.parse(localStorage.getItem(WK)) || {}; } catch (e) { }
        const sheet = document.createElement('div'); sheet.className = 'wsheet';
        sheet.innerHTML = `<div class="wtool"><b>답안지</b><span>손가락이나 펜으로 쓰세요</span><button data-w="undo">되돌리기</button><button data-w="clear">전부 지우기</button><button data-w="kb">키보드로 쓰기</button></div><div class="wpad"><canvas></canvas></div><textarea hidden placeholder="여기에 입력"></textarea>`;
        qa.appendChild(sheet);
        const cv = sheet.querySelector('canvas'), g = cv.getContext('2d'), pad = sheet.querySelector('.wpad'), ta = sheet.querySelector('textarea'); let strokes = [], cur = null, locked = false;
        const fit = () => { const r = Math.min(2, devicePixelRatio || 1), w = pad.clientWidth, h = pad.clientHeight; cv.width = w * r; cv.height = h * r; cv.style.width = w + 'px'; cv.style.height = h + 'px'; g.setTransform(r, 0, 0, r, 0, 0); redraw(); };
        const redraw = () => { g.clearRect(0, 0, cv.width, cv.height); g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#1a2a3a';
          strokes.forEach(st => { g.lineWidth = st.w; g.beginPath(); st.p.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); if (st.p.length === 1) g.lineTo(st.p[0][0] + .1, st.p[0][1]); g.stroke(); }); };
        if (WS[q.id] && WS[q.id].s) { strokes = WS[q.id].s; ta.value = WS[q.id].t || ''; }
        const keep = () => { WS[q.id] = { s: strokes.slice(-400), t: ta.value }; const ks = Object.keys(WS); if (ks.length > 40) delete WS[ks[0]]; try { localStorage.setItem(WK, JSON.stringify(WS)); } catch (e) { } };
        const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        cv.addEventListener('pointerdown', e => { if (locked) return; e.preventDefault(); e.stopPropagation(); try { cv.setPointerCapture(e.pointerId); } catch (_) { } cur = { id: e.pointerId, w: e.pointerType === 'pen' ? 1.6 + (e.pressure || .5) * 2.4 : 2.8, p: [P(e)] }; strokes.push(cur); redraw(); });
        cv.addEventListener('pointermove', e => { if (!cur || e.pointerId !== cur.id) return; e.preventDefault(); e.stopPropagation(); cur.p.push(P(e)); const n = cur.p.length; g.lineWidth = cur.w; g.beginPath(); g.moveTo(...cur.p[n - 2]); g.lineTo(...cur.p[n - 1]); g.stroke(); });
        const up = e => { if (!cur || e.pointerId !== cur.id) return; e.stopPropagation(); cur = null; keep(); };
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('click', e => e.stopPropagation());
        sheet.querySelector('.wtool').onclick = e => { const b = e.target.closest('button'); if (!b || locked) return; const a = b.dataset.w;
          if (a === 'undo') { strokes.pop(); redraw(); keep(); } if (a === 'clear') { strokes = []; redraw(); keep(); }
          if (a === 'kb') { ta.hidden = !ta.hidden; b.textContent = ta.hidden ? '키보드로 쓰기' : '키보드 닫기'; if (!ta.hidden) ta.focus(); } };
        ta.oninput = keep; if (ta.value) { ta.hidden = false; sheet.querySelector('[data-w=kb]').textContent = '키보드 닫기'; }
        requestAnimationFrame(fit); addEventListener('resize', fit);
        const s = document.createElement('button'); s.className = 'pri'; s.textContent = '다 썼어요 → 모범 답안 보기'; qb.appendChild(s);
        s.onclick = () => { locked = true; ta.disabled = true; sheet.classList.add('done'); keep();
          let pts = String(q.ans).split(/(?<=[.다])\s+|\s*(?=\(\d\)|[①-⑤])/).map(x => x.trim()).filter(x => x.length > 1); for (let k = pts.length - 1; k > 0; k--) if (/^[—\-–(·]/.test(pts[k]) && !/^\(\d\)/.test(pts[k])) { pts[k - 1] += ' ' + pts[k]; pts.splice(k, 1); }
          qx.hidden = false; qx.className = 'qx wans'; qx.innerHTML = `<b>모범 답안</b><div class="wpts">${pts.map((t, k) => `<label><input type="checkbox"> <span>${chemHTML(t)}</span></label>`).join('')}</div>${q.exp ? `<div class="dim">${chemHTML(q.exp)}</div>` : ''}<div class="self">내 답안지와 비교해서, 내가 쓴 내용에 들어 있는 줄을 체크하세요.</div>`;
          qb.innerHTML = ''; const cnt = document.createElement('span'); cnt.className = 'wcnt'; qb.appendChild(cnt);
          const boxes = [...qx.querySelectorAll('.wpts input')]; const upd = () => { const n = boxes.filter(b => b.checked).length; cnt.textContent = `${n} / ${boxes.length} 포함`; }; boxes.forEach(b => b.onchange = upd); upd();
          const mk = (t, cls, ok) => { const b = document.createElement('button'); b.textContent = t; b.className = cls; b.onclick = () => { if (ok) { right++; SAVE.right[q.id] = (SAVE.right[q.id] || 0) + 1; SAVE.wrong = SAVE.wrong.filter(x => x !== q.id); } else if (!SAVE.wrong.includes(q.id)) SAVE.wrong.push(q.id); sfx(ok ? 'ok' : 'bad'); removeEventListener('resize', fit); i++; one(); }; qb.appendChild(b); };
          mk('✕ 틀림 (다시 풀기에 넣기)', 'sec', false); mk('△ 부분 정답 (다시 풀기에 넣기)', 'sec', false); mk('○ 맞음', 'pri', true); qx.scrollIntoView({ block: 'nearest' }); };
      } else { /* fill */
        const inputs = []; qq.innerHTML = chemHTML(q.q).replace(/\{(\d+)\}/g, (m, n) => `<span class="blank" data-i="${n}"></span>`);
        qq.querySelectorAll('.blank').forEach(sp => { const k = +sp.dataset.i, b = q.b[k]; if (b && !Array.isArray(b) && b.o) { const s = document.createElement('span'); s.className = 'seg'; b.o.forEach(o => { const x = document.createElement('button'); x.innerHTML = chem(o); x.onclick = () => { s.querySelectorAll('button').forEach(y =>y.classList.remove('sel')); x.classList.add('sel'); s.dataset.v = o; }; s.appendChild(x); }); sp.appendChild(s); inputs[k] = { get: () =>s.dataset.v || '', el: s, ok: v =>v === b.a, ans: b.a }; }
          else { const inp = document.createElement('input'); inp.autocomplete = 'off'; inp.size = Math.max(4, Math.min(12, (b[0] || '').length + 2)); sp.appendChild(inp); inputs[k] = { get: () =>inp.value, el: inp, ok: v =>b.some(a =>norm(a) === norm(v)), ans: b[0], acc: b }; } });
        const s = document.createElement('button'); s.className = 'pri'; s.textContent = '확인'; qb.appendChild(s);
        s.onclick = () => { const vals = inputs.map(x =>x ? x.get() : ''); const good = inputs.map((x, k) =>x ? x.ok(vals[k]) : true);
          (q.any || []).forEach(gr => { const pool = gr.map(k =>inputs[k]); const used = new Set(); gr.forEach(k => { const v = vals[k]; const j = pool.findIndex((p, pi) => !used.has(pi) && p.acc && p.acc.some(a =>norm(a) === norm(v))); good[k] = j >= 0; if (j >= 0) used.add(j); }); });
          inputs.forEach((x, k) => { if (!x) return; x.el.classList.add(good[k] ? 'g' : 'b'); if (x.el.tagName === 'INPUT') x.el.disabled = true; });
          finish(good.every(Boolean), '정답: ' + inputs.map(x =>x ? x.ans : '').filter(Boolean).join(' / ')); };
        const first = qq.querySelector('input'); if (first) setTimeout(() =>first.focus(), 50);
      }
    };
    one();
  });
}

/* ── 친구들 ── */
const eyes = (x1, x2, y) => `<g class="eye" style="transform-origin:32px ${y}px"><circle cx="${x1}" cy="${y}" r="5" fill="#fff"/><circle cx="${x2}" cy="${y}" r="5" fill="#fff"/><circle cx="${x1 + 1}" cy="${y + 1}" r="2.6" fill="#061018"/><circle cx="${x2 + 1}" cy="${y + 1}" r="2.6" fill="#061018"/></g>`;
export const CAST = {
  mito: { n: '미토', who: '마이토콘드리아 · 나', c: '#5af0ff', svg: `<ellipse cx="32" cy="34" rx="22" ry="20" fill="#5af0ff"/><ellipse cx="32" cy="34" rx="28" ry="7" fill="none" stroke="#ffe27a" stroke-width="3"/>${eyes(25, 39, 30)}<path d="M26 41 Q32 45 38 41" stroke="#06303a" stroke-width="2" fill="none"/>` },
  enzy: { n: '엔지', who: '효소 · 반응 도우미', c: '#5aff9a', svg: `<path d="M8 20 Q8 54 32 56 Q56 54 56 20 L42 20 L38 30 L26 30 L22 20 Z" fill="#3fd88a"/>${eyes(22, 42, 40)}<path d="M27 48 Q32 51 37 48" stroke="#08301a" stroke-width="2" fill="none"/><text x="32" y="17" text-anchor="middle" font-size="8" fill="#bfffd8">활성 부위</text>` },
  atty: { n: '아티', who: 'ATP · 에너지 배터리', c: '#ffd23f', svg: `<rect x="12" y="12" width="40" height="44" rx="8" fill="#ffd23f"/><rect x="26" y="6" width="12" height="7" rx="2" fill="#c09000"/>${eyes(25, 39, 28)}<path d="M26 37 Q32 41 38 37" stroke="#4a3500" stroke-width="2" fill="none"/><circle cx="22" cy="49" r="4" fill="#8a4aff"/><circle cx="32" cy="49" r="4" fill="#8a4aff"/><circle cx="42" cy="49" r="4" fill="#8a4aff"/>` },
  nadi: { n: '나디', who: 'NAD⁺ · 전자 택배 기사', c: '#5ab8ff', svg: `<rect x="6" y="22" width="52" height="28" rx="14" fill="#4aa8ff"/><rect x="18" y="10" width="28" height="14" rx="6" fill="#1f6bff"/>${eyes(24, 40, 34)}<path d="M27 42 Q32 45 37 42" stroke="#082040" stroke-width="2" fill="none"/><circle cx="52" cy="30" r="4" fill="#fff27a"/>` },
  oxy: { n: '옥시', who: '산소 · 마지막 전자 받는 친구', c: '#ff6a7a', svg: `<circle cx="22" cy="34" r="16" fill="#ff5a5a"/><circle cx="42" cy="34" r="16" fill="#ff7a7a"/>${eyes(26, 38, 31)}<path d="M27 40 Q32 44 37 40" stroke="#4a0a10" stroke-width="2" fill="none"/>` },
  chloe: { n: '클로이', who: '엽록체 · 햇빛 요리사', c: '#8aff6a', svg: `<ellipse cx="32" cy="34" rx="26" ry="20" fill="#3fdc5a"/><rect x="14" y="40" width="10" height="3" fill="#1a8a30"/><rect x="14" y="44" width="10" height="3" fill="#1a8a30"/><rect x="40" y="40" width="10" height="3" fill="#1a8a30"/><rect x="40" y="44" width="10" height="3" fill="#1a8a30"/>${eyes(25, 39, 30)}<path d="M27 38 Q32 42 37 38" stroke="#0a3010" stroke-width="2" fill="none"/>` }
};
export const face = (k, sz = 56) => { const C = CAST[k] || CAST.mito; return `<svg class="pf say" width="${sz}" height="${sz}" viewBox="-8 -6 80 76" style="--c:${C.c}"><g class="pfb"><path class="arm l" d="M8 40 Q-2 34 -4 24" stroke="${C.c}" stroke-width="5" stroke-linecap="round" fill="none"/><path class="arm r" d="M56 40 Q66 34 68 24" stroke="${C.c}" stroke-width="5" stroke-linecap="round" fill="none"/>${C.svg}</g></svg>`; };
let SPEAK = 'mito'; export function speaker(k) { SPEAK = k || 'mito'; }

/* ── 흐름형 학습: 개념 카드 → 바로 빈칸 확인 ── */
const full = f => chemHTML(f.replace(/\[([^\]]+)\]/g, '<b>$1</b>'));
const blankOf = f => chemHTML(f.replace(/\[([^\]]+)\]/g, '<span class="lb">( ? )</span>'));
const ansOf = f => (f.match(/\[([^\]]+)\]/) || [])[1];
const sideMode = () => innerWidth >= 760 && innerWidth / innerHeight > 1.15;
function layoutLesson() { const b = $('#lesson'); const side = sideMode() && !b.hidden; b.classList.toggle('side', side); document.body.classList.toggle('lesson-on', !b.hidden);
  if (window.__viewShift) window.__viewShift(side && !b.classList.contains('mini') ? Math.round(b.offsetWidth / 2 + 8) : 0); }
addEventListener('resize', layoutLesson);
let LMINI = false;
function lessonBox() { IN.locked = true; const b = $('#lesson'); b.hidden = false; b.classList.toggle('mini', LMINI); setTimeout(layoutLesson, 0); return b; }
function closeLesson() { if (window.__stage) window.__stage(null); $('#lesson').hidden = true; IN.locked = false; layoutLesson(); }
/* 접기/펼치기: 내용이 바뀌어도 유지 */
new MutationObserver(() => { const b = $('#lesson'); if (!b || b.hidden || b.querySelector('.lmin')) return; const t = document.createElement('button'); t.className = 'lmin'; t.textContent = LMINI ? '펼치기 ▴' : '접기 ▾'; t.onclick = e => { e.stopPropagation(); LMINI = !LMINI; b.classList.toggle('mini', LMINI); t.textContent = LMINI ? '펼치기 ▴' : '접기 ▾'; layoutLesson(); }; b.prepend(t); }).observe(document.getElementById('lesson') || document.body, { childList: true });
/* 카드 보여주기: cards = [[fact, why], ...] */
export function teach(cards, head, from, total) {
  return new Promise(res => { const b = lessonBox(); let i = 0;
    /* 몇 번째 카드까지 봤는지 저장 → 새로고침해도 그 카드부터 */
    const TK = 'bio_teachpos', tkey = head + '|' + from + '|' + cards.length; let TP = {}; try { TP = JSON.parse(localStorage.getItem(TK)) || {}; } catch (e) { }
    if (TP[tkey] && TP[tkey] < cards.length) i = TP[tkey];
    const tsave = () => { try { if (i >= cards.length) delete TP[tkey]; else TP[tkey] = i; localStorage.setItem(TK, JSON.stringify(TP)); } catch (e) { } };
    const one = () => { tsave(); if (i >= cards.length) { closeLesson(); res(); return; } const [f, why, dg, sp] = cards[i]; const C = CAST[sp || SPEAK] || CAST.mito;
      b.innerHTML = `<div class="lh"><span>${head}</span><span>개념 ${from + i + 1} / ${total}</span></div><div class="sp1">${face(sp || SPEAK)}<div class="bub" style="--c:${C.c}"><i>${C.n}</i><p class="lf">${full(f)}</p>${why ? `<p class="lw">${chemHTML(why)}</p>` : ''}</div></div>${dg && window.BDIAG && !(window.__stageHas && window.__stageHas(dg)) ? `<div class="ld">${window.BDIAG[dg]}</div>` : ''}<div class="lbt"><button class="pri">${i + 1 < cards.length ? '다음 개념' : '확인하기'}</button></div>`;
      if (window.__stage) window.__stage(dg, C.c, String(f + (why || '')).length / 3);
      b.querySelector('.pri').onclick = () => { sfx('pick'); i++; one(); }; };
    one(); });
}
/* 빈칸 확인: 틀린 문장은 해설을 보여 주고 뒤로 보내 다시 묻는다 (최대 2번) */
export function recall(facts, head, pool, stat) {
  return new Promise(res => { const b = lessonBox(); const Q = facts.map(f => ({ f, tries: 0 })); let right = 0, total = facts.length;
    const answers = [...new Set(pool.map(p => ansOf(p[0])).filter(Boolean))];
    const one = () => { if (!Q.length) { closeLesson(); res({ right, total }); return; } const it = Q.shift(); const [f, why, dg, sp] = it.f, a = ansOf(f);
      const opts = shuffle([a, ...shuffle(answers.filter(x => x !== a)).slice(0, 3)]);
      b.innerHTML = `<div class="lh"><span>${head}</span><span>남은 문장 ${Q.length + 1}</span></div><div class="sp2">${face(sp || SPEAK, 34)}<span>${(CAST[sp || SPEAK] || CAST.mito).n}: 빈칸에 들어갈 말은?</span></div>${dg && window.BDIAG ? `<div class="ld">${window.BDIAG[dg].replace(/<p class="cap">[\s\S]*<\/p>/, '')}</div>` : ''}<p class="lf">${blankOf(f)}</p><div class="lo"></div><div class="lx" hidden></div><div class="lbt"></div>`;
      const box = b.querySelector('.lo'); opts.forEach(o => { const x = document.createElement('button'); x.innerHTML = chem(o); x.onclick = () => {
        [...box.children].forEach((y, j) => { y.disabled = true; if (opts[j] === a) y.classList.add('right'); }); const ok = o === a; sfx(ok ? 'ok' : 'bad');
        if (stat) stat(f, ok);
        if (ok) { if (it.tries === 0) right++; } else { x.classList.add('wrong'); it.tries++; if (it.tries < 3) Q.splice(Math.min(2, Q.length), 0, it); }
        const lx = b.querySelector('.lx'); lx.hidden = false; lx.className = 'lx ' + (ok ? 'ok' : 'no'); lx.innerHTML = `${ok ? '정답' : '다시 볼게요 — 조금 뒤에 한 번 더 물어봐요'}<br>${full(f)}${why && !ok ? `<br><span>${chemHTML(why)}</span>` : ''}`;
        const n = document.createElement('button'); n.className = 'pri'; n.textContent = '다음'; n.onclick = () => one(); b.querySelector('.lbt').appendChild(n); }; box.appendChild(x); }); };
    one(); });
}
/* 정리: 이 챕터 핵심 문장 전체 */
export function summary(facts, title) {
  return new Promise(res => { const b = lessonBox(); b.innerHTML = `<div class="lh"><span>정리 — ${title}</span><span>소리 내어 한 번 읽기</span></div><ol class="ls">${facts.map(([f]) => `<li>${full(f)}</li>`).join('')}</ol><div class="lbt"><button class="pri">다음 챕터로</button></div>`;
    b.querySelector('.pri').onclick = () => { closeLesson(); res(); }; });
}
export function meet(list) { return new Promise(res => { const b = lessonBox(); let i = 0; const one = () => { if (i >= list.length) { closeLesson(); res(); return; } const [k, t] = list[i], C = CAST[k];
  b.innerHTML = `<div class="lh"><span>친구 소개</span><span>${i + 1} / ${list.length}</span></div><div class="sp1">${face(k, 72)}<div class="bub" style="--c:${C.c}"><i>${C.n} <small>${C.who}</small></i><p class="lw2">${chemHTML(t)}</p></div></div><div class="lbt"><button class="pri">${i + 1 < list.length ? '다음 친구' : '출발'}</button></div>`;
  b.querySelector('.pri').onclick = () => { sfx('pick'); i++; one(); }; }; one(); }); }
export function notice(title, html, btn = '시작') { return new Promise(res => { const b = lessonBox(); b.innerHTML = `<div class="lh"><span>${title}</span></div><div class="ln">${chemHTML(html)}</div><div class="lbt"><button class="pri">${btn}</button></div>`; b.querySelector('.pri').onclick = () => { closeLesson(); res(); }; }); }

/* ── 목표 위치 표시 (화면 가장자리 화살표) ── */
export function marker(cam, target, THREE) {
  const m = $('#marker'); if (!target) { m.hidden = true; return; }
  const v = target.clone().project(cam); const behind = v.z > 1; let x = (v.x * .5 + .5) * innerWidth, y = (-v.y * .5 + .5) * innerHeight;
  if (behind) { x = innerWidth - x; y = innerHeight - y; }
  const pad = 46, on = !behind && x >pad && x < innerWidth - pad && y >pad && y < innerHeight - pad;
  if (!on) { const cx = innerWidth / 2, cy = innerHeight / 2; let dx = x - cx, dy = y - cy; if (behind && Math.abs(dx) < 1 && Math.abs(dy) < 1) dy = 1; const s = Math.min((cx - pad) / Math.abs(dx || 1e-3), (cy - pad) / Math.abs(dy || 1e-3)); x = cx + dx * s; y = cy + dy * s; m.querySelector('i').style.transform = `rotate(${Math.atan2(dy, dx)}rad)`; }
  m.hidden = false; m.classList.toggle('edge', !on); m.style.transform = `translate(${x}px,${y}px)`;
  const d = cam.position.distanceTo(target); m.querySelector('b').textContent = Math.round(d) + 'm';
}
