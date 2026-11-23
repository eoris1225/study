/* 📘 개념 강의: 교과서 순서(효소 → 세포 호흡 → 발효 → 광합성)로, 단계마다 교과서 그림 + 말풍선 설명 + 3D,
   절마다 확인 질문 → 그 절에서 배운 것으로 풀 수 있는 교과서 문제. 위치는 bio_course_v1에 저장 */
import { quiz, face, CAST } from './ui.js?v=202611231432';

const KEY = 'bio_course_v1';
const C = () => window.COURSE || [];
export const loadPos = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
const savePos = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { } };

/* 교과서 문제 → 그 문제를 풀려면 배워야 하는 가장 늦은 절 */
const GROUP = { te: ['E'], t01: ['R', 'F', 'P'], t02: ['R'], t03: ['F'], t04: ['P'], t05: ['P'], tu: ['E', 'R', 'F', 'P'], tq: ['E', 'R', 'F', 'P'] };
let SECQ = null;
function mapQs() {
  if (SECQ) return SECQ; SECQ = C().map(ch => ch.secs.map(() => []));
  const flat = []; C().forEach((ch, ci) => ch.secs.forEach((s, si) => flat.push({ ci, si, id: ch.id, kw: s.kw || [] })));
  const sq = t => t.replace(/\s/g, '');
  (window.BQ || []).forEach(q => { const g = GROUP[q.ch]; if (!g) return; const txt = JSON.stringify(q), t2 = sq(txt);
    let best = null; flat.forEach(f => { if (!g.includes(f.id)) return; if (f.kw.some(k => txt.includes(k) || t2.includes(sq(k)))) best = f; });
    if (!best) { const last = [...flat].reverse().find(f => f.id === g[g.length - 1]); best = last; }
    SECQ[best.ci][best.si].push(q); });
  return SECQ;
}
export const sectionList = () => C().flatMap((ch, ci) => ch.secs.map((s, si) => ({ ci, si, label: `${ch.t} ${si + 1}. ${s.t}` })));

let box = null;
function ui() {
  if (box) return box; box = document.createElement('div'); box.id = 'course'; box.hidden = true;
  box.innerHTML = `<div class="ch"><span class="ct"></span><span class="cn"></span></div><div class="cfig fig"></div><div class="clog"></div><div class="cbar"><button data-b="prev">◀ 이전</button><button class="pri" data-b="next">다음 ▶</button></div>`;
  document.body.appendChild(box); return box;
}
const esc = s => s;
function waitBtn() { return new Promise(res => { const b = ui(); const on = e => { const t = e.target.closest('[data-b]'); if (!t) { if (e.target.closest('.clog') && !e.target.closest('button')) { b.removeEventListener('click', on); res('next'); } return; } b.removeEventListener('click', on); res(t.dataset.b); }; b.addEventListener('click', on); }); }

export async function runCourse(start, hooks = {}) {
  const b = ui(); b.hidden = false; mapQs();
  const fig = b.querySelector('.cfig'), log = b.querySelector('.clog'), ct = b.querySelector('.ct'), cn = b.querySelector('.cn'), bPrev = b.querySelector('[data-b=prev]'), bNext = b.querySelector('[data-b=next]');
  let { ci = 0, si = 0, st = 0 } = start || loadPos() || {};
  const total = sectionList().length;
  while (ci < C().length) {
    const ch = C()[ci], sec = ch.secs[si], who = ch.who, col = (CAST[who] || CAST.mito).c;
    const idx = sectionList().findIndex(x => x.ci === ci && x.si === si) + 1;
    ct.textContent = `${ch.t} › ${si + 1}. ${sec.t}`; hooks.prog && hooks.prog(`📘 ${ch.t} ${si + 1}/${ch.secs.length} · ${sec.t}  (전체 ${idx}/${total})`);
    /* 이 절의 그림·3D는 앞 단계에서 이어지므로, 시작 단계까지 상태를 계산 */
    const state = i => { let f = null, s = null; for (let k = 0; k <= i; k++) { const x = sec.steps[k]; if (x[1]) f = x[1]; if (x[2] !== undefined && x[2] !== null) s = x[2]; } return { f, s }; };
    let i = Math.min(st, sec.steps.length - 1), shownFig = null;
    const draw = () => {
      const { f, s } = state(i); cn.textContent = `설명 ${i + 1} / ${sec.steps.length}`;
      if (f !== shownFig) { shownFig = f; fig.innerHTML = f ? `<img src="img/bio/c/${f}.jpg" alt="교과서 그림"><small>교과서 그림 · 누르면 크게</small>` : ''; fig.hidden = !f; }
      log.innerHTML = sec.steps.slice(0, i + 1).map((x, k) => `<div class="cb${k === i ? ' now' : ''}">${k === i ? face(who, 40) : ''}<div>${x[0]}</div></div>`).join('');
      log.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
      if (s && window.__stage) window.__stage(s, col, x0(sec.steps[i][0]).length / 3);
      bPrev.disabled = i === 0 && ci === 0 && si === 0; bNext.textContent = i < sec.steps.length - 1 ? '다음 ▶' : '확인 문제 ▶';
      savePos({ ci, si, st: i });
    };
    draw();
    let back = false;
    while (true) { const a = await waitBtn(); if (a === 'prev') { if (i > 0) { i--; draw(); continue; } back = true; break; } if (i < sec.steps.length - 1) { i++; draw(); continue; } break; }
    if (back) { if (si > 0) si--; else if (ci > 0) { ci--; si = C()[ci].secs.length - 1; } st = 999; continue; }
    /* 확인 질문 */
    for (const [q, opts, ans, why] of (sec.ask || [])) {
      cn.textContent = '확인'; const ord = opts.map((_, k) => k).sort(() => Math.random() - .5);
      log.innerHTML = `<div class="cq"><b>✋ 확인</b> ${q}<div class="co">${ord.map(k => `<button data-o="${k}">${opts[k]}</button>`).join('')}</div><div class="cx"></div></div>`;
      bNext.hidden = true; bPrev.hidden = true;
      await new Promise(res => { let tries = 0; log.onclick = e => { const o = e.target.closest('[data-o]'); if (!o || o.disabled) return; const k = +o.dataset.o, x = log.querySelector('.cx');
        if (k === ans) { o.classList.add('right'); log.querySelectorAll('[data-o]').forEach(z => z.disabled = true); x.className = 'cx ok'; x.innerHTML = `⭕ 맞아! <span>${why}</span>`; bNext.hidden = false; bNext.textContent = '다음 ▶'; log.onclick = null; res(); }
        else { tries++; o.classList.add('wrong'); o.disabled = true; x.className = 'cx no'; x.innerHTML = tries >= 2 ? `정답은 <b>${opts[ans]}</b>. <span>${why}</span>` : '다시 한 번! 위 설명을 떠올려 봐.'; if (tries >= 2) { log.querySelectorAll('[data-o]').forEach(z => z.disabled = true); log.querySelector(`[data-o="${ans}"]`).classList.add('right'); bNext.hidden = false; bNext.textContent = '다음 ▶'; log.onclick = null; res(); } } }; });
      await waitBtn(); bPrev.hidden = false;
    }
    /* 교과서 문제 */
    const qs = SECQ[ci][si];
    if (qs.length) { savePos({ ci, si, st: 999 }); b.hidden = true; window.__stage && window.__stage(null); await quiz(qs, `${ch.t} ${si + 1}. ${sec.t} — 교과서 문제`); b.hidden = false; }
    shownFig = null; st = 0; si++; if (si >= ch.secs.length) { si = 0; ci++; }
    savePos({ ci, si, st: 0 });
  }
  b.hidden = true; window.__stage && window.__stage(null); savePos({ ci: 0, si: 0, st: 0 });
  hooks.done && hooks.done();
}
const x0 = s => String(s).replace(/<[^>]+>/g, '');
