'use strict';
/* 문장 카드 위 필기 (물리 문제집 필기 기능을 영어용으로 옮김) */
const EnInk = (() => {
  const mk = (t, c, html) => { const e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; };
  const KEYN = 'en_notes_v1'; let db; try { db = JSON.parse(localStorage.getItem(KEYN)) || {}; } catch (e) { db = {}; }
  const persist = () => { try { localStorage.setItem(KEYN, JSON.stringify(db)); } catch (e) { } };
  let tool = 'pen', color = '#ff2d87', size = 3, on = true, penOnly = false; try { penOnly = localStorage.getItem('twilight_penonly') === '1'; } catch (e) { }
  function attach(paper, id, opt = {}) {
    paper.classList.add('noting'); if (opt.scratch !== false) { const pad = mk('div', 'scratch', '<span>✏️ 연습장 — 여기에도 풀이를 써 보세요</span>'); paper.appendChild(pad); }
    const cv = mk('canvas', 'inkcv'); paper.appendChild(cv); const x = cv.getContext('2d'); let strokes = db[id] || [], cur = null, penSeen = false, redo = [], hist = []; const snap = () => { hist.push(strokes.slice()); if (hist.length > 60) hist.shift(); redo = []; };
    const bar = mk('div', 'inkbar'); paper.parentNode.insertBefore(bar, paper); paper._inkbar = bar;
    const B = (label, title, fn) => { const b = mk('button', '', label); b.title = title; b.onclick = fn; bar.appendChild(b); return b; };
    const bOn = B('✏️ 필기 켜짐', '필기 켜기/끄기 (끄면 화면을 손가락으로 넘길 수 있어요)', () => { on = !on; sync(); });
    const bPO = B('✋ 손도 씀', '펜 전용: 켜면 손가락·손바닥은 무시하고 펜으로만 써져요 (손가락으로는 화면이 스크롤돼요)', () => { penOnly = !penOnly; try { localStorage.setItem('twilight_penonly', penOnly ? '1' : '0'); } catch (e) { } sync(); });
    const bPen = B('🖊 펜', '펜', () => { tool = 'pen'; sync(); }), bHi = B('🖍 형광펜', '형광펜', () => { tool = 'hi'; sync(); }), bEr = B('🧽 지우개', '획 지우개', () => { tool = 'er'; sync(); });
    const cols = mk('span', 'inkcols');['#ff2d87', '#2a7bff', '#0ea968', '#231046', '#ff8a00'].forEach(c => { const d = mk('i'); d.style.background = c; d.onclick = () => { color = c; if (tool === 'er') tool = 'pen'; sync(); }; d.dataset.c = c; cols.appendChild(d); }); bar.appendChild(cols);
    const sz = mk('input'); sz.type = 'range'; sz.min = 1; sz.max = 10; sz.value = size; sz.oninput = () => size = +sz.value; bar.appendChild(sz);
    B('↩', '되돌리기', () => { if (hist.length) { redo.push(strokes); strokes = hist.pop(); commit(); } }); B('↪', '다시 하기', () => { if (redo.length) { hist.push(strokes); strokes = redo.pop(); commit(); } }); B('🗑 모두 지우기', '모두 지우기', () => { if (strokes.length && confirm('이 문제의 필기를 모두 지울까요?')) { snap(); strokes = []; commit(); } });
    const sync = () => { bPO.textContent = penOnly ? '🖊 펜만 인식' : '✋ 손도 씀'; bPO.classList.toggle('on', penOnly); bOn.textContent = on ? '✏️ 필기 켜짐' : '✋ 필기 꺼짐'; bOn.classList.toggle('on', on);[[bPen, 'pen'], [bHi, 'hi'], [bEr, 'er']].forEach(([b, t]) => b.classList.toggle('on', tool === t));[...cols.children].forEach(d => d.classList.toggle('on', d.dataset.c === color)); cv.style.pointerEvents = on ? 'auto' : 'none'; cv.style.touchAction = on ? 'none' : 'auto'; };
    const commit = () => { db[id] = strokes; if (!strokes.length) delete db[id]; persist(); draw(); };
    const fit = () => { const d = Math.min(2, window.devicePixelRatio || 1), w = paper.clientWidth, h = paper.scrollHeight; if (!w) return; cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = w * d; cv.height = h * d; draw(); };
    const line = (s, W) => { if (!s.p.length) return; x.globalAlpha = s.t === 'hi' ? .35 : 1; x.strokeStyle = s.c; x.lineCap = 'round'; x.lineJoin = 'round'; const bw = s.w * (s.t === 'hi' ? 5 : 1) * W / 700; if (s.p.length === 1) { x.fillStyle = s.c; x.beginPath(); x.arc(s.p[0][0] * W, s.p[0][1] * W, bw * .6, 0, 7); x.fill(); } for (let i = 1; i < s.p.length; i++) { const a = s.p[i - 1], b = s.p[i]; x.lineWidth = Math.max(.6, bw * (s.t === 'hi' ? 1 : (.4 + (b[2] || .5) * 1.2))); x.beginPath(); x.moveTo(a[0] * W, a[1] * W); x.lineTo(b[0] * W, b[1] * W); x.stroke(); } x.globalAlpha = 1; };
    const draw = () => { x.clearRect(0, 0, cv.width, cv.height); const W = cv.width; strokes.forEach(s => line(s, W)); if (cur) line(cur, W); };
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.width, e.pointerType === 'pen' ? (e.pressure || .5) : .5]; };
    const erase = q => { const R = .018, keep = strokes.filter(s => !s.p.some(a => Math.hypot(a[0] - q[0], a[1] - q[1]) < R)); if (keep.length !== strokes.length) { snap(); strokes = keep; commit(); } };
    let fing = null; const scroller = () => { let n = paper; while (n && n !== document.body) { const st = getComputedStyle(n); if (/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight) return n; n = n.parentElement; } return document.scrollingElement; };
    cv.onpointerdown = e => { if (!on) return; if (e.pointerType === 'pen') penSeen = true; if (e.pointerType === 'touch' && (penOnly || penSeen)) { if (penOnly && !fing) { fing = { id: e.pointerId, y: e.clientY, x: e.clientX, el: scroller() }; try { cv.setPointerCapture(e.pointerId); } catch (_) { } } return; } e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { } const er = tool === 'er' || e.button === 5 || (e.buttons & 32) || (e.pointerType === 'pen' && e.button === 2); cur = { t: er ? 'er' : tool, c: color, w: size, p: [pt(e)] }; if (er) erase(cur.p[0]); draw(); };
    cv.onpointermove = e => { if (fing && e.pointerId === fing.id) { fing.el.scrollTop -= e.clientY - fing.y; fing.el.scrollLeft -= e.clientX - fing.x; fing.y = e.clientY; fing.x = e.clientX; return; } if (!cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (evs.length ? evs : [e]).forEach(ev => { const q = pt(ev); if (cur.t === 'er') erase(q); else cur.p.push(q); }); draw(); };
    cv.onpointerup = cv.onpointercancel = e => { if (fing && e.pointerId === fing.id) { fing = null; return; } if (!cur) return; if (cur.t !== 'er') { snap(); strokes = strokes.concat([cur]); cur = null; commit(); } else { cur = null; draw(); } };
    cv.oncontextmenu = e => e.preventDefault();
    paper.querySelectorAll('img').forEach(im => im.addEventListener('load', fit)); const ro = new ResizeObserver(fit); ro.observe(paper); sync(); setTimeout(fit, 50);
  }
  return { attach, has: id => !!(db[id] && db[id].length) };
})();

