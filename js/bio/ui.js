/* 미토: 화면 UI — HUD, 대사창, 퀴즈 관문(문제은행), 알림, 목표 표시 */
import { IN, sfx } from './engine.js';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function chem(s) { return String(s).replace(/NAD\+/g, 'NAD<sup>+</sup>').replace(/H\+/g, 'H<sup>+</sup>').replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>'); }
function chemHTML(html) { return String(html).split(/(<[^>]+>)/).map(p => p.startsWith('<') ? p : chem(p)).join(''); }

export const SAVE = (() => { let s = {}; try { s = JSON.parse(localStorage.getItem('bio_game_v1')) || {}; } catch (e) { } return Object.assign({ reached: 0, wrong: [], right: {}, best: 0 }, s); })();
export function save() { try { localStorage.setItem('bio_game_v1', JSON.stringify(SAVE)); } catch (e) { } }

/* ── HUD ── */
export const HUD = {
  inv: {}, set(k, v) { this.inv[k] = v; const el = $(`#inv [data-k="${k}"] b`); if (el) { el.textContent = Number.isInteger(v) ? v : v.toFixed(1); const p = el.parentElement; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); } },
  add(k, d) { this.set(k, (this.inv[k] || 0) + d); },
  mission(t, sub) { $('#mt').innerHTML = `<b>${esc(t)}</b><span>${chemHTML(sub || '')}</span>`; },
  obj(html) { $('#obj').innerHTML = chemHTML(html || ''); $('#obj').hidden = !html; },
  board(rows) { const b = $('#board'); if (!rows) { b.hidden = true; return; } b.hidden = false; b.innerHTML = '<i>포도당 1분자 결산</i>' + rows.map(([k, v, c]) => `<div style="--c:${c}"><span>${chem(k)}</span><b>${v}</b></div>`).join(''); }
};
export function toast(html, col = '#7fffe0') { const t = document.createElement('div'); t.className = 'toast'; t.style.setProperty('--c', col); t.innerHTML = chemHTML(html); $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 2200); setTimeout(() => t.remove(), 2700); }
export function banner(big, small, col = '#ffd23f') { const b = $('#banner'); b.style.setProperty('--c', col); b.innerHTML = `<b>${chemHTML(big)}</b><small>${chemHTML(small || '')}</small>`; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
export function flash(col = '#fff') { const f = $('#flash'); f.style.background = col; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }

/* ── 대사 ── */
const WHO = { m: ['미토', '#5af0ff'], s: ['시스템', '#ffd23f'], x: ['???', '#ff5a8a'] };
export function say(lines) {
  return new Promise(res => {
    const box = $('#talk'); IN.locked = true; let i = 0, typing = null;
    const show = () => {
      if (i >= lines.length) { box.hidden = true; IN.locked = false; box.onclick = null; removeEventListener('keydown', kd); res(); return; }
      let [w, t] = typeof lines[i] === 'string' ? ['m', lines[i]] : lines[i]; const [n, c] = WHO[w] || WHO.m;
      box.hidden = false; box.querySelector('.who').textContent = n; box.querySelector('.who').style.color = c; box.querySelector('.face').className = 'face ' + w;
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
const norm = s => String(s).toLowerCase().replace(/\s+/g, '').replace(/[₀-₉]/g, d => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(d)]).replace(/[⁺+]/g, '+').replace(/[()·.,]/g, '');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function pickQs(chs, n) {
  const pool = (window.BQ || []).filter(q => chs.includes(q.ch));
  const w = q => (SAVE.wrong.includes(q.id) ? -2 : 0) + (SAVE.right[q.id] || 0) + Math.random() * 1.5; /* 틀렸던 것·안 푼 것 먼저 */
  return pool.sort((a, b) => w(a) - w(b)).slice(0, n);
}
export function quiz(qs, title = '지식 관문') {
  return new Promise(res => {
    if (!qs.length) return res({ right: 0, total: 0 });
    IN.locked = true; const ov = $('#quiz'); ov.hidden = false; let i = 0, right = 0;
    const one = () => {
      if (i >= qs.length) { ov.hidden = true; IN.locked = false; save(); res({ right, total: qs.length }); return; }
      const q = qs[i]; ov.innerHTML = `<div class="qc"><div class="qh"><span>🔒 ${esc(title)}</span><span>${i + 1} / ${qs.length}</span></div><div class="src">${esc(q.src || '')}</div>${q.fig ? `<div class="fig">${chemHTML(q.fig)}</div>` : ''}<div class="qq"></div><div class="qa"></div><div class="qx" hidden></div><div class="qb"></div></div>`;
      const qq = ov.querySelector('.qq'), qa = ov.querySelector('.qa'), qx = ov.querySelector('.qx'), qb = ov.querySelector('.qb');
      const finish = (ok, detail) => { if (ok) { right++; SAVE.right[q.id] = (SAVE.right[q.id] || 0) + 1; SAVE.wrong = SAVE.wrong.filter(x => x !== q.id); } else if (!SAVE.wrong.includes(q.id)) SAVE.wrong.push(q.id); sfx(ok ? 'ok' : 'bad');
        qx.hidden = false; qx.className = 'qx ' + (ok ? 'ok' : 'no'); qx.innerHTML = `<b>${ok ? '✔ 정답!' : '✘ 아쉬워요'}</b>${detail ? '<div>' + chemHTML(detail) + '</div>' : ''}<div>${chemHTML(q.exp || '')}</div>`;
        qb.innerHTML = ''; const n = document.createElement('button'); n.className = 'pri'; n.textContent = i + 1 < qs.length ? '다음 ▶' : '관문 통과 ▶'; n.onclick = () => { i++; one(); }; qb.appendChild(n); n.focus(); };
      if (q.type === 'choice' || q.type === 'multi') {
        qq.innerHTML = chemHTML(q.q); const multi = q.type === 'multi'; const sel = new Set();
        q.o.forEach((o, k) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<i>${'①②③④⑤⑥⑦⑧'[k]}</i> ${chemHTML(o)}`; b.onclick = () => { if (multi) { sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle('sel'); return; } [...qa.children].forEach((x, j) => { x.disabled = true; if (j === q.a) x.classList.add('right'); }); if (k !== q.a) b.classList.add('wrong'); finish(k === q.a); }; qa.appendChild(b); });
        if (multi) { const s = document.createElement('button'); s.className = 'pri'; s.textContent = '제출'; s.onclick = () => { const A = new Set(q.a); const ok = A.size === sel.size && [...A].every(x => sel.has(x)); [...qa.children].forEach((x, j) => { x.disabled = true; if (A.has(j)) x.classList.add('right'); else if (sel.has(j)) x.classList.add('wrong'); }); finish(ok, '정답: ' + q.a.map(k => q.o[k]).join(', ')); }; qb.appendChild(s); }
      } else if (q.type === 'order') {
        qq.innerHTML = chemHTML(q.q); const got = []; const out = document.createElement('div'); out.className = 'ord'; qa.before(out);
        shuffle(q.o.map((o, k) => [o, k])).forEach(([o, k]) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = chemHTML(o); b.onclick = () => { b.disabled = true; got.push(k); out.innerHTML += `<span>${chemHTML(o)}</span>`; if (got.length === q.o.length) finish(got.every((x, j) => x === j), '정답 순서: ' + q.o.join(' → ')); }; qa.appendChild(b); });
      } else { /* fill */
        const inputs = []; qq.innerHTML = chemHTML(q.q).replace(/\{(\d+)\}/g, (m, n) => `<span class="blank" data-i="${n}"></span>`);
        qq.querySelectorAll('.blank').forEach(sp => { const k = +sp.dataset.i, b = q.b[k]; if (b && !Array.isArray(b) && b.o) { const s = document.createElement('span'); s.className = 'seg'; b.o.forEach(o => { const x = document.createElement('button'); x.innerHTML = chem(o); x.onclick = () => { s.querySelectorAll('button').forEach(y => y.classList.remove('sel')); x.classList.add('sel'); s.dataset.v = o; }; s.appendChild(x); }); sp.appendChild(s); inputs[k] = { get: () => s.dataset.v || '', el: s, ok: v => v === b.a, ans: b.a }; }
          else { const inp = document.createElement('input'); inp.autocomplete = 'off'; inp.size = Math.max(4, Math.min(12, (b[0] || '').length + 2)); sp.appendChild(inp); inputs[k] = { get: () => inp.value, el: inp, ok: v => b.some(a => norm(a) === norm(v)), ans: b[0], acc: b }; } });
        const s = document.createElement('button'); s.className = 'pri'; s.textContent = '확인'; qb.appendChild(s);
        s.onclick = () => { const vals = inputs.map(x => x ? x.get() : ''); const good = inputs.map((x, k) => x ? x.ok(vals[k]) : true);
          (q.any || []).forEach(gr => { const pool = gr.map(k => inputs[k]); const used = new Set(); gr.forEach(k => { const v = vals[k]; const j = pool.findIndex((p, pi) => !used.has(pi) && p.acc && p.acc.some(a => norm(a) === norm(v))); good[k] = j >= 0; if (j >= 0) used.add(j); }); });
          inputs.forEach((x, k) => { if (!x) return; x.el.classList.add(good[k] ? 'g' : 'b'); if (x.el.tagName === 'INPUT') x.el.disabled = true; });
          finish(good.every(Boolean), '정답: ' + inputs.map(x => x ? x.ans : '').filter(Boolean).join(' / ')); };
        const first = qq.querySelector('input'); if (first) setTimeout(() => first.focus(), 50);
      }
    };
    one();
  });
}

/* ── 목표 위치 표시 (화면 가장자리 화살표) ── */
export function marker(cam, target, THREE) {
  const m = $('#marker'); if (!target) { m.hidden = true; return; }
  const v = target.clone().project(cam); const behind = v.z > 1; let x = (v.x * .5 + .5) * innerWidth, y = (-v.y * .5 + .5) * innerHeight;
  if (behind) { x = innerWidth - x; y = innerHeight - y; }
  const pad = 46, on = !behind && x > pad && x < innerWidth - pad && y > pad && y < innerHeight - pad;
  if (!on) { const cx = innerWidth / 2, cy = innerHeight / 2; let dx = x - cx, dy = y - cy; if (behind && Math.abs(dx) < 1 && Math.abs(dy) < 1) dy = 1; const s = Math.min((cx - pad) / Math.abs(dx || 1e-3), (cy - pad) / Math.abs(dy || 1e-3)); x = cx + dx * s; y = cy + dy * s; m.querySelector('i').style.transform = `rotate(${Math.atan2(dy, dx)}rad)`; }
  m.hidden = false; m.classList.toggle('edge', !on); m.style.transform = `translate(${x}px,${y}px)`;
  const d = cam.position.distanceTo(target); m.querySelector('b').textContent = Math.round(d) + 'm';
}
