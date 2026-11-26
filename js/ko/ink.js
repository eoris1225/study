/* 국어 필기도구: 펜 · 형광펜 · 지우개 · 색 · 되돌리기 · 지우기 · 필기 숨기기
   - S펜(스타일러스)은 언제나 바로 쓴다. 손가락은 기본 스크롤, [☝️ 손가락 필기]를 켜면 손가락도 쓰고 두 손가락으로 스크롤.
   - 필기 화면에서는 브라우저 스크롤을 끄고(touch-action:none) 손가락 스크롤을 직접 처리 → 펜이 스크롤로 바뀌어 선이 끊기는 일 없음.
   - 펜이 닿아 있는 동안(+뗀 뒤 0.3초)만 손바닥 터치를 무시. 펜이 멀리 있으면 손가락 탭은 그대로.
   - 버튼·선택지 위에서 시작한 입력은 필기하지 않고 그대로 누름(펜 탭 포함). 필기 직후의 클릭은 무시.
   - 필기는 종이(고정 폭) 좌표의 선 데이터로 지문·탭별 저장 → 화면 크기가 바뀌어도 글자 위 제자리. */
(() => {
  const PEN = ['#1d1d22', '#d92d2d', '#2457d6', '#14935a'], HL = ['#ffe14d', '#7df0a0', '#ff9fd8', '#8fd6ff'];
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const SS = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  let st = { tool: 'pen', pen: 0, hl: 0, finger: LS('ko_finger') === '1', hide: false };
  try { Object.assign(st, JSON.parse(LS('ko_inkst') || '{}'), { hide: false }); } catch (e) { }
  const saveSt = () => SS('ko_inkst', JSON.stringify({ tool: st.tool, pen: st.pen, hl: st.hl }));

  let cur = null; /* {scroller, paper, key, strokes, base, live, k, W, H, undo} */
  const bar = document.createElement('div'); bar.id = 'inkbar'; bar.hidden = true;
  bar.innerHTML = `<button data-a="finger" title="손가락으로도 쓰기"></button><button data-a="pen" title="펜">✏️</button><button data-a="hl" title="형광펜">🖍️</button><button data-a="er" title="지우개(선 단위)">🧽</button><button data-a="col" title="색 바꾸기"><i></i></button><button data-a="undo" title="되돌리기">↶</button><button data-a="clr" title="이 페이지 필기 모두 지우기">🗑️</button><button data-a="hide" title="필기 숨기기/보이기">👁️</button>`;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(bar));
  function ui() {
    const f = bar.querySelector('[data-a=finger]'); f.innerHTML = st.finger ? '☝️<small>필기</small>' : '✋<small>스크롤</small>'; f.classList.toggle('on', st.finger);
    ['pen', 'hl', 'er'].forEach(t => bar.querySelector(`[data-a=${t}]`).classList.toggle('on', st.tool === t));
    const c = bar.querySelector('[data-a=col] i'); c.style.background = st.tool === 'hl' ? HL[st.hl] : PEN[st.pen]; bar.querySelector('[data-a=col]').disabled = st.tool === 'er';
    bar.querySelector('[data-a=hide]').classList.toggle('on', st.hide); bar.querySelector('[data-a=hide]').textContent = st.hide ? '🙈' : '👁️';
    if (cur) { cur.scroller.classList.toggle('fingerink', st.finger); cur.paper.classList.toggle('inkhide', st.hide); }
  }
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
    if (a === 'finger') { st.finger = !st.finger; SS('ko_finger', st.finger ? '1' : '0'); toast(st.finger ? '☝️ 손가락으로 쓰기 · 두 손가락으로 스크롤' : '✋ 손가락은 스크롤 · S펜만 필기'); }
    else if (a === 'pen' || a === 'hl' || a === 'er') st.tool = a;
    else if (a === 'col') { if (st.tool === 'hl') st.hl = (st.hl + 1) % HL.length; else st.pen = (st.pen + 1) % PEN.length; }
    else if (a === 'undo') undo();
    else if (a === 'clr') { if (cur && cur.strokes.length && confirm('이 페이지의 필기를 모두 지울까요?')) { cur.undo.push({ del: cur.strokes.slice() }); cur.strokes = []; redraw(); store(); } }
    else if (a === 'hide') st.hide = !st.hide;
    saveSt(); ui();
  });
  function toast(t) { let el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); } el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 1600); }

  /* ── 붙이기/떼기 ── */
  const ro = new ResizeObserver(() => { if (cur && !drawing) fit(); });
  function attach(o) { detach(); const base = document.createElement('canvas'), live = document.createElement('canvas'); base.className = 'inkcv'; live.className = 'inkcv live';
    o.paper.appendChild(base); o.paper.appendChild(live);
    let strokes = []; try { strokes = JSON.parse(LS('ko_ink_v1:' + o.key) || '[]'); } catch (e) { }
    cur = { ...o, base, live, strokes, undo: [], W: 0, H: 0, k: 0 }; o.scroller.classList.add('inkon'); bar.hidden = false; fit(true); ro.observe(o.paper); ui(); }
  function detach() { if (!cur) return; ro.disconnect(); cur.base.remove(); cur.live.remove(); cur.scroller.classList.remove('inkon', 'fingerink'); cur = null; bar.hidden = true; }
  function setScale(s) { if (cur) { cur.s = s; fit(true); } }
  function fit(force) { const p = cur.paper, W = p.offsetWidth, H = p.scrollHeight; const k = Math.min((devicePixelRatio || 1) * (cur.s || 1), 2.5, 15000 / Math.max(1, H));
    if (!force && W === cur.W && H === cur.H) return; cur.W = W; cur.H = H; cur.k = k;
    for (const c of [cur.base, cur.live]) { c.width = Math.round(W * k); c.height = Math.round(H * k); c.style.width = W + 'px'; c.style.height = H + 'px'; }
    redraw(); }
  function path(g, s) { const p = s.p; g.beginPath(); g.moveTo(p[0], p[1]); if (p.length === 2) g.lineTo(p[0] + .1, p[1] + .1);
    for (let i = 2; i < p.length - 2; i += 2) { const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2; g.quadraticCurveTo(p[i], p[i + 1], mx, my); }
    if (p.length > 2) g.lineTo(p[p.length - 2], p[p.length - 1]); }
  function paint(g, s) { g.save(); g.lineCap = g.lineJoin = 'round';
    if (s.t === 'hl') { g.globalAlpha = .38; g.strokeStyle = s.c; g.lineWidth = 15; g.lineCap = 'butt'; path(g, s); g.stroke(); }
    else { g.strokeStyle = s.c; g.lineWidth = s.w || 2; path(g, s); g.stroke(); }
    g.restore(); }
  function redraw() { if (!cur) return; const g = cur.base.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cur.base.width, cur.base.height); g.setTransform(cur.k, 0, 0, cur.k, 0, 0);
    cur.strokes.filter(s => s.t === 'hl').forEach(s => paint(g, s)); cur.strokes.filter(s => s.t !== 'hl').forEach(s => paint(g, s)); }
  function store() { if (!cur) return; const k = 'ko_ink_v1:' + cur.key, v = JSON.stringify(cur.strokes);
    const idx = (() => { try { return JSON.parse(LS('ko_ink_idx') || '{}'); } catch (e) { return {}; } })(); idx[cur.key] = Date.now();
    if (!cur.strokes.length) { try { localStorage.removeItem(k); } catch (e) { } delete idx[cur.key]; SS('ko_ink_idx', JSON.stringify(idx)); return; }
    let tries = 0; while (!SS(k, v) && tries++ < 8) { const old = Object.keys(idx).filter(x => x !== cur.key).sort((a, b) => idx[a] - idx[b])[0]; if (!old) break; try { localStorage.removeItem('ko_ink_v1:' + old); } catch (e) { } delete idx[old]; }
    SS('ko_ink_idx', JSON.stringify(idx)); }
  function undo() { if (!cur) return; const op = cur.undo.pop(); if (!op) { toast('되돌릴 필기가 없어요'); return; }
    if (op.add) cur.strokes.splice(cur.strokes.indexOf(op.add), 1); if (op.del) cur.strokes.push(...op.del); redraw(); store(); }

  /* ── 입력 ── */
  const TAPPY = 'button, a, input, select, textarea, label, summary, .opt, .tapme, #inkbar';
  let drawing = null, penDown = false, penUpT = 0, justDrew = 0, fs = null, two = null, vel = 0, raf = 0; const palm = new Set(), touches = new Map();
  const isPalm = e => e.pointerType === 'touch' && (penDown || Date.now() - penUpT < 300 || (e.width >= 120 && e.height >= 120));
  const pt = e => { const r = cur.paper.getBoundingClientRect(), s = r.width / cur.paper.offsetWidth; return [Math.round((e.clientX - r.left) / s * 10) / 10, Math.round((e.clientY - r.top) / s * 10) / 10]; };
  window.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') penDown = true; }, true);
  const penUp = e => { if (e.pointerType === 'pen') { penDown = false; penUpT = Date.now(); } };
  window.addEventListener('pointerup', penUp, true); window.addEventListener('pointercancel', penUp, true);

  function start(e) { if (!cur) return; const sc = cur.scroller; if (!sc.contains(e.target)) return;
    if (isPalm(e)) { palm.add(e.pointerId); e.preventDefault(); e.stopPropagation(); return; }
    if (e.pointerType === 'touch') { touches.set(e.pointerId, e.clientY);
      if (touches.size >= 2) { /* 두 손가락 = 스크롤 (쓰던 손가락 선은 취소) */ if (drawing && drawing.touch) { drawing = null; clearLive(); } fs = null; two = { y: avg() }; cancelAnimationFrame(raf); e.preventDefault(); return; } }
    if (e.target.closest(TAPPY)) return; /* 버튼·선택지는 그대로 누르기 */
    const ink = e.pointerType === 'pen' || ((e.pointerType === 'touch' || e.pointerType === 'mouse') && st.finger);
    if (ink && !st.hide) { e.preventDefault(); try { sc.setPointerCapture(e.pointerId); } catch (er) { }
      cancelAnimationFrame(raf); const p = pt(e); drawing = { id: e.pointerId, touch: e.pointerType === 'touch', x0: e.clientX, y0: e.clientY, moved: false, s: { t: st.tool === 'hl' ? 'hl' : 'pen', c: st.tool === 'hl' ? HL[st.hl] : PEN[st.pen], w: 2.2, p: [p[0], p[1]] }, erased: [] };
      if (st.tool === 'er') eraseAt(p); return; }
    if (e.pointerType === 'touch') { cancelAnimationFrame(raf); fs = { id: e.pointerId, y: e.clientY, y0: e.clientY, t: performance.now(), moved: false }; vel = 0; }
  }
  const avg = () => { let s = 0; touches.forEach(v => s += v); return s / touches.size; };
  function move(e) { if (!cur) return;
    if (palm.has(e.pointerId)) { e.preventDefault(); e.stopPropagation(); return; }
    if (touches.has(e.pointerId)) touches.set(e.pointerId, e.clientY);
    if (two && touches.size >= 2) { const a = avg(); cur.scroller.scrollTop -= a - two.y; two.y = a; e.preventDefault(); return; }
    if (drawing && e.pointerId === drawing.id) { e.preventDefault();
      if (!drawing.moved && Math.hypot(e.clientX - drawing.x0, e.clientY - drawing.y0) < 3) return; drawing.moved = true;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length ? evs : [e])) { const p = pt(ev);
        if (st.tool === 'er') { eraseAt(p); continue; }
        const s = drawing.s, n = s.p.length; if (Math.hypot(p[0] - s.p[n - 2], p[1] - s.p[n - 1]) < .8) continue; s.p.push(p[0], p[1]);
        if (ev.pointerType === 'pen' && ev.pressure > 0 && s.t === 'pen') s.w = Math.max(1.3, Math.min(3.6, s.w * .8 + (1.1 + ev.pressure * 2.6) * .2)); }
      if (st.tool !== 'er') { const g = cur.live.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cur.live.width, cur.live.height); g.setTransform(cur.k, 0, 0, cur.k, 0, 0); paint(g, drawing.s); }
      return; }
    if (fs && e.pointerId === fs.id) { if (!fs.moved && Math.abs(e.clientY - fs.y0) < 6) return; fs.moved = true; const dy = e.clientY - fs.y, now = performance.now();
      cur.scroller.scrollTop -= dy; vel = dy / Math.max(1, now - fs.t) * .8 + vel * .2; fs.y = e.clientY; fs.t = now; e.preventDefault(); }
  }
  function clearLive() { const g = cur.live.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cur.live.width, cur.live.height); }
  function eraseAt(p) { const r = 11, keep = [];
    for (const s of cur.strokes) { let hit = false; for (let i = 0; i < s.p.length; i += 2) if (Math.abs(s.p[i] - p[0]) < r + (s.t === 'hl' ? 6 : 0) && Math.abs(s.p[i + 1] - p[1]) < r + (s.t === 'hl' ? 6 : 0)) { hit = true; break; }
      if (hit) drawing.erased.push(s); else keep.push(s); }
    if (keep.length !== cur.strokes.length) { cur.strokes = keep; redraw(); } }
  function end(e) { if (!cur) return; touches.delete(e.pointerId); if (touches.size < 2) two = null;
    if (palm.has(e.pointerId)) { palm.delete(e.pointerId); e.preventDefault(); e.stopPropagation(); justDrew = Date.now(); return; }
    if (drawing && e.pointerId === drawing.id) { const d = drawing; drawing = null; clearLive();
      if (st.tool === 'er') { if (d.erased.length) { cur.undo.push({ del: d.erased }); store(); } }
      else if (d.moved || e.pointerType === 'pen') { cur.strokes.push(d.s); cur.undo.push({ add: d.s }); redraw(); store(); }
      if (d.moved) justDrew = Date.now(); if (cur.H !== cur.paper.scrollHeight) fit(); return; }
    if (fs && e.pointerId === fs.id) { const m = fs.moved; fs = null; if (!m) return; justDrew = Date.now();
      let v = vel * 16, last = performance.now(); const glide = t => { const dt = Math.min(40, t - last) / 16; last = t; if (!cur) return; cur.scroller.scrollTop -= v * dt; v *= Math.pow(.94, dt); if (Math.abs(v) > .4) raf = requestAnimationFrame(glide); }; raf = requestAnimationFrame(glide); }
  }
  window.addEventListener('pointerdown', start, true); window.addEventListener('pointermove', move, { capture: true, passive: false });
  window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
  window.addEventListener('wheel', () => cancelAnimationFrame(raf), { passive: true });
  /* 필기·스크롤 직후 손을 떼며 생긴 클릭은 무시 (버튼이 저절로 눌리지 않게) */
  window.addEventListener('click', e => { if (Date.now() - justDrew < 350 && !e.target.closest('#inkbar')) { e.preventDefault(); e.stopPropagation(); } }, true);

  window.KOInk = { attach, detach, setScale, redraw: () => cur && fit(true), toast, has: k => !!LS('ko_ink_v1:' + k) };
  document.addEventListener('DOMContentLoaded', ui);
})();
