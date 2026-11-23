/* 📘 개념 강의: 교과서 순서(효소 → 세포 호흡 → 발효 → 광합성)로, 단계마다 교과서 그림 + 말풍선 설명 + 3D,
   절마다 확인 질문 → 그 절에서 배운 것으로 풀 수 있는 교과서 문제. 위치는 bio_course_v1에 저장 */
import { quiz, face, CAST } from './ui.js?v=202611231459';

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
  box.innerHTML = `<div class="ch"><span class="ct"></span><span class="cg"></span><span class="cn"></span></div><div class="cfig fig"></div><div class="clog"></div><div class="cbar"><button data-b="prev">◀ 이전</button><button class="pri" data-b="next">다음 ▶</button></div>`;
  document.body.appendChild(box);
  addEventListener('resize', fitStage);
  /* 3D 빈 공간을 직접 눌러 보기 */
  addEventListener('pointerdown', e => { if (box.hidden || e.target.tagName !== 'CANVAS') return; window.__stagePoke && window.__stagePoke(e.clientX, e.clientY); });
  return box;
}
/* 패널이 가리지 않는 빈 공간 한가운데에 3D가 오도록 */
function fitStage() { if (!box) return; if (box.hidden) { window.__viewShift && window.__viewShift(0); return; }
  const r = box.getBoundingClientRect(), bottom = r.width > innerWidth * .8;
  const w = bottom ? innerWidth : Math.max(200, r.left - 8), h = bottom ? Math.max(160, r.top - 60) : innerHeight - 60;
  window.__viewShift && window.__viewShift(bottom ? 0 : Math.round((innerWidth - r.left) / 2), bottom ? Math.round((innerHeight - r.top) / 2 - 30) : -30);
  window.__stageFit && window.__stageFit(w, h); }
/* 게임 점수: 핵심어 잡기 · 순간 퀴즈로 ATP 모으기 (bio_course_game에 저장) */
const GKEY = 'bio_course_game';
const G = (() => { try { return Object.assign({ atp: 0, got: {} }, JSON.parse(localStorage.getItem(GKEY)) || {}); } catch (e) { return { atp: 0, got: {} }; } })();
const saveG = () => { try { localStorage.setItem(GKEY, JSON.stringify(G)); } catch (e) { } };
let combo = 0;
function hud(bump) { const el = box && box.querySelector('.cg'); if (!el) return; el.innerHTML = `<span class="atp">ATP <b>${G.atp}</b></span>${combo > 1 ? `<span class="cmb">콤보 x${combo}</span>` : ''}`; if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
const BOLD = /<b>([\s\S]*?)<\/b>/g;
const words = html => [...String(html).matchAll(BOLD)].map(m => m[1]);
const esc = s => s;
function waitBtn() { return new Promise(res => { const b = ui(); const on = e => { if (e.target.closest('.kw,.co,.cg')) return; const t = e.target.closest('[data-b]'); if (!t) { if (e.target.closest('.clog') && !e.target.closest('button')) { b.removeEventListener('click', on); res('next'); } return; } b.removeEventListener('click', on); res(t.dataset.b); }; b.addEventListener('click', on); }); }

export async function runCourse(start, hooks = {}) {
  const b = ui(); b.hidden = false; mapQs(); hud(); requestAnimationFrame(fitStage);
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
      log.innerHTML = sec.steps.slice(0, i + 1).map((x, k) => `<div class="cb${k === i ? ' now' : ''}">${k === i ? face(who, 40) : ''}<div>${k === i ? kwHTML(x[0], `${ci}.${si}.${i}`) : x[0]}</div></div>`).join('');
      if (log.querySelector('.kw:not(.got)')) log.lastElementChild.insertAdjacentHTML('beforeend', '<div class="kwh">노란 핵심어를 눌러서 ATP 챙기기</div>');
      log.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
      if (s && window.__stage) window.__stage(s, col, x0(sec.steps[i][0]).length / 3);
      bPrev.disabled = i === 0 && ci === 0 && si === 0; bNext.textContent = i < sec.steps.length - 1 ? '다음 ▶' : '확인 문제 ▶';
      savePos({ ci, si, st: i });
    };
    log.onclick = e => { const k = e.target.closest('.kw'); if (!k || k.classList.contains('got')) return; grab(k); if (!log.querySelector('.kw:not(.got)')) { const h = log.querySelector('.kwh'); if (h) h.remove(); } };
    draw();
    let back = false, warned = -1, since = 0;
    while (true) { const a = await waitBtn(); if (a === 'prev') { if (i > 0) { i--; draw(); continue; } back = true; break; }
      const left = log.querySelectorAll('.kw:not(.got)'); if (left.length && warned !== i) { warned = i; left.forEach(k => { k.classList.remove('nudge'); void k.offsetWidth; k.classList.add('nudge'); }); window.__stageCheer && window.__stageCheer('잠깐! 핵심어 챙겨!', '#ff8a6a'); continue; }
      since++; const w0 = words(sec.steps[i][0]);
      if (since >= 2 && w0.length) { since = 0; log.onclick = null; bPrev.hidden = true; bNext.hidden = true; await speedQuiz(log, sec.steps[i][0], w0, ch, bNext); bPrev.hidden = false; bNext.hidden = false;
        log.onclick = e => { const k = e.target.closest('.kw'); if (!k || k.classList.contains('got')) return; grab(k); if (!log.querySelector('.kw:not(.got)')) { const h = log.querySelector('.kwh'); if (h) h.remove(); } }; }
      if (i < sec.steps.length - 1) { i++; draw(); continue; } break; }
    log.onclick = null;
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
    if (qs.length) { savePos({ ci, si, st: 999 }); b.hidden = true; fitStage(); window.__stage && window.__stage(null); await quiz(qs, `${ch.t} ${si + 1}. ${sec.t} — 교과서 문제`); b.hidden = false; fitStage(); }
    shownFig = null; st = 0; si++; if (si >= ch.secs.length) { si = 0; ci++; }
    savePos({ ci, si, st: 0 });
  }
  b.hidden = true; fitStage(); window.__stage && window.__stage(null); savePos({ ci: 0, si: 0, st: 0 });
  hooks.done && hooks.done();
}
const x0 = s => String(s).replace(/<[^>]+>/g, '');

/* 현재 설명의 굵은 글씨 → 눌러서 잡는 핵심어 */
function kwHTML(html, id) { let n = 0; return String(html).replace(BOLD, (m, w) => { const key = id + '.' + (n++); return `<b class="kw${G.got[key] ? ' got' : ''}" data-k="${key}">${w}</b>`; }); }
function grab(k) { G.got[k.dataset.k] = 1; combo++; const gain = 1 + Math.min(4, Math.floor(combo / 3)); G.atp += gain; saveG(); hud(true); k.classList.add('got');
  window.__stageCheer && window.__stageCheer(x0(k.innerHTML).slice(0, 14) + `  +${gain} ATP`, ['#ffd23f', '#5affd0', '#ff9ad0', '#9ad0ff'][combo % 4]); }
/* 순간 퀴즈: 방금 읽은 문장에서 핵심어 하나를 가리고 10초 안에 고르기 */
async function speedQuiz(log, html, ws, ch, bNext) {
  const ok = ws.filter(w => { const a = x0(w).trim(); return a.length >= 2 && !x0(String(html).replace(`<b>${w}</b>`, '')).includes(a); }); if (!ok.length) return;
  const ans = ok[Math.floor(Math.random() * ok.length)], A = x0(ans).trim();
  const pool = [...new Set(ch.secs.flatMap(s => s.steps.flatMap(x => words(x[0]).map(w => x0(w).trim()))))].filter(w => w && w !== A && !w.includes(A) && !A.includes(w) && w.length <= 18);
  if (pool.length < 2) return; const dec = pool.sort(() => Math.random() - .5).slice(0, 2), opts = [A, ...dec].sort(() => Math.random() - .5);
  let done = false; const blank = String(html).replace(`<b>${ans}</b>`, '<u class="blank">?</u>');
  log.innerHTML = `<div class="cq sq"><b>순간 퀴즈</b> 방금 읽은 문장! 빈칸은?<div class="sqs">${blank}</div><div class="tm"><i></i></div><div class="co">${opts.map(o => `<button data-s="${o.replace(/"/g, '&quot;')}">${o}</button>`).join('')}</div><div class="cx"></div></div>`;
  await new Promise(res => { const end = (ok, btn) => { if (done) return; done = true; clearTimeout(tm); const x = log.querySelector('.cx'); log.querySelector('.tm').classList.add('stop');
      log.querySelectorAll('[data-s]').forEach(z => { z.disabled = true; if (z.dataset.s === A) z.classList.add('right'); }); if (btn && !ok) btn.classList.add('wrong');
      if (ok) { combo += 2; const gain = 2 + Math.min(6, combo); G.atp += gain; saveG(); hud(true); x.className = 'cx ok'; x.innerHTML = `정답! <b>+${gain} ATP</b>`; window.__stageCheer && window.__stageCheer(`정답! 콤보 x${combo}`, '#5affd0'); }
      else { combo = 0; hud(); x.className = 'cx no'; x.innerHTML = `${btn ? '아깝다' : '시간 끝'}! 정답은 <b>${A}</b>`; window.__stageCheer && window.__stageCheer(btn ? '으악 땡!' : '시간 초과!', '#ff6a5a'); }
      bNext.hidden = false; bNext.textContent = '계속 ▶'; res(); };
    const tm = setTimeout(() => end(false, null), 10000);
    log.querySelector('.co').onclick = e => { const o = e.target.closest('[data-s]'); if (o) end(o.dataset.s === A, o); }; });
  await waitBtn(); }
