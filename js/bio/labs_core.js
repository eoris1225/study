'use strict';
/* 개념 실험실 엔진 — 개념마다 직접 조작하며 발견하는 2D 실험.
   가상 좌표 1000 × 600 캔버스 + 오른쪽(세로 화면은 아래) 패널(목표 · 조작 · 발견).
   LAB.def(id, {ch, t, sub}, fn(c))  ·  LAB.open(id) → Promise (목표를 다 이루거나 건너뛰면 끝) */
window.LAB = (() => {
  const REG = {}, ORDER = [];
  const VW = 1000, VH = 600;
  const KEY = 'bio_labs_v1';
  let DONE = {}; try { DONE = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { }
  const saveDone = () => { try { localStorage.setItem(KEY, JSON.stringify(DONE)); } catch (e) { } };
  const def = (id, meta, fn) => { REG[id] = Object.assign({ id, fn }, meta); ORDER.push(id); };
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (a, b, x, y) => Math.hypot(a - x, b - y);
  let beepCtx = null;
  function beep(kind) { try { beepCtx = beepCtx || new (window.AudioContext || window.webkitAudioContext)(); const a = beepCtx, o = a.createOscillator(), g = a.createGain(); const f = { ok: 660, good: 880, bad: 180, pick: 520, pop: 740 }[kind] || 500; o.frequency.value = f; o.type = kind === 'bad' ? 'square' : 'sine'; g.gain.value = .06; o.connect(g); g.connect(a.destination); const t = a.currentTime; g.gain.exponentialRampToValueAtTime(.0001, t + (kind === 'good' ? .35 : .15)); if (kind === 'good') o.frequency.linearRampToValueAtTime(f * 1.5, t + .3); o.start(t); o.stop(t + .4); } catch (e) { } }

  let cur = null; /* 열려 있는 실험 */
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function open(id, opt = {}) {
    const L = REG[id]; if (!L) return Promise.resolve();
    if (cur) cur.close(true);
    return new Promise(res => {
      window.LAB_OPEN = true;
      const root = document.getElementById('lab') || document.body.appendChild(el('div')); root.id = 'lab'; root.hidden = false; root.innerHTML = '';
      const stage = el('div', 'lstage'), cv = el('canvas'), side = el('div', 'lside');
      stage.appendChild(cv); root.append(stage, side);
      side.innerHTML = `<div class="lhd"><small>${L.ch || ''} · 개념 실험실</small><b>${L.t}</b>${L.sub ? `<span>${L.sub}</span>` : ''}</div><ol class="lgo"></ol><div class="lct"></div><div class="lin"></div><div class="lbt2"><button class="lskip">건너뛰기</button><button class="lnext pri" disabled>다음 ▶</button></div>`;
      const g = cv.getContext('2d');
      const c = { VW, VH, g, cv, t: 0, ptr: { x: -99, y: -99, down: false }, lerp, clamp, ease, rnd, dist, beep };
      let scale = 1, offX = 0, offY = 0, raf = 0, alive = true, last = performance.now();
      const loops = [], tweens = [], fxs = [], floats = [];
      function fit() { const r = stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; scale = Math.min(r.width / VW, r.height / VH); offX = (r.width - VW * scale) / 2; offY = (r.height - VH * scale) / 2; c._dpr = dpr; }
      fit(); const ro = new ResizeObserver(fit); ro.observe(stage);

      /* ── 목표 ── */
      let goals = [], insights = [];
      const gl = side.querySelector('.lgo'), lin = side.querySelector('.lin'), nextB = side.querySelector('.lnext');
      function drawGoals() { const a = goals.findIndex(x => !x.done); gl.innerHTML = goals.map((x, i) => `<li class="${x.done ? 'ok' : i === a ? 'now' : ''}">${x.t}${i === a && x.hint ? `<small>${x.hint}</small>` : ''}</li>`).join(''); }
      c.goals = list => { goals = list.slice(0, opt.quick || 99).map(x => Object.assign({ done: false }, x)); drawGoals(); };
      c.isDone = id => { const x = goals.find(q => q.id === id); return !x || x.done; };
      c.active = () => (goals.find(x => !x.done) || {}).id;
      c.setHint = (id, h) => { const x = goals.find(q => q.id === id); if (x) { x.hint = h; drawGoals(); } };
      c.hit = (id, insight) => { const x = goals.find(q => q.id === id); if (!x || x.done) { if (!x && opt.quick) c.flashMsg('좋아!', '#5aff9a'); return false; } x.done = true; drawGoals(); beep('good');
        if (insight) { insights.push(insight); const F = window.LAB_FRIEND; const card = el('div', 'lfind', `${F ? `<div class="lfr" style="--c:${F.col}">${F.html}<b>${F.name}</b></div>` : ''}<i>발견 ${insights.length}</i>${insight}`); lin.prepend(card); requestAnimationFrame(() => card.classList.add('on')); lin.scrollTop = 0; }
        c.flashMsg('발견!', '#ffd23f');
        if (goals.every(q => q.done)) { nextB.disabled = false; nextB.classList.add('glow'); DONE[L.id] = 1; saveDone(); if (opt.quick) setTimeout(() => close(), 2600); }
        return true; };
      /* ── 조작 패널 ── */
      const ct = side.querySelector('.lct');
      c.clearCtrl = () => { ct.innerHTML = ''; };
      c.slider = (label, min, max, val, step, fmt, on) => { const w = el('label', 'lsl'); const s = el('input'); s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = val; const v = el('b'); const o = { v: +val, el: w, set(x) { s.value = x; o.v = +s.value; v.innerHTML = fmt ? fmt(o.v) : o.v; on && on(o.v); } };
        w.append(el('span', '', label), v, s); s.oninput = () => { o.v = +s.value; v.innerHTML = fmt ? fmt(o.v) : o.v; on && on(o.v); }; v.innerHTML = fmt ? fmt(o.v) : o.v; ct.appendChild(w); return o; };
      c.button = (label, on, cls = '') => { const b = el('button', 'lb ' + cls, label); b.onclick = () => { beep('pick'); on && on(b); }; ct.appendChild(b); return b; };
      c.toggle = (label, val, on) => { const b = el('button', 'lb tg', label); const o = { v: !!val, el: b, set(x) { o.v = !!x; b.classList.toggle('on', o.v); on && on(o.v); } }; b.classList.toggle('on', o.v); b.onclick = () => { beep('pick'); o.set(!o.v); }; ct.appendChild(b); return o; };
      c.seg = (label, opts, val, on) => { const w = el('div', 'lseg'); if (label) w.appendChild(el('span', '', label)); const o = { v: val, el: w, set(x) { o.v = x; [...w.querySelectorAll('button')].forEach((b, i) => b.classList.toggle('on', opts[i][0] === x)); on && on(x); } };
        opts.forEach(([k, t]) => { const b = el('button', '', t); b.onclick = () => { beep('pick'); o.set(k); }; w.appendChild(b); }); ct.appendChild(w); [...w.querySelectorAll('button')].forEach((b, i) => b.classList.toggle('on', opts[i][0] === val)); return o; };
      c.hold = (label) => { const b = el('button', 'lb hold', label); const o = { held: false, el: b }; const dn = e => { e.preventDefault(); o.held = true; b.classList.add('on'); }, up = () => { o.held = false; b.classList.remove('on'); };
        b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up); ct.appendChild(b); return o; };
      c.readout = fn => { const d = el('div', 'lro'); ct.appendChild(d); const o = { el: d, fn, last: '' }; readouts.push(o); return o; };
      const readouts = [];
      /* ── 시간 ── */
      c.loop = fn => loops.push(fn);
      c.tween = (dur, fn, done) => { tweens.push({ t: 0, dur, fn, done }); };
      c.wait = s => new Promise(r => c.tween(s, () => { }, r));
      c.fx = (x, y, col = '#ffd23f', n = 14, sp = 160) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = rnd(.3, 1) * sp; fxs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.4, .8), t: 0, col }); } };
      c.float = (txt, x, y, col = '#ffd23f') => floats.push({ txt, x, y, col, t: 0 });
      let msg = null; c.flashMsg = (t, col = '#7fffe0') => { msg = { t, col, k: 0 }; };
      let tip = ''; c.tip = s => { tip = s || ''; };
      /* ── 입력: 끌기 ── */
      const drags = []; let held = null, downAt = null;
      c.draggable = o => { o.hx = o.hx ?? o.x; o.hy = o.hy ?? o.y; o.r = o.r || 26; drags.push(o); return o; };
      c.remove = o => { const i = drags.indexOf(o); if (i >= 0) drags.splice(i, 1); };
      c.home = (o, d = .25) => { const x0 = o.x, y0 = o.y; o.back = true; c.tween(d, k => { o.x = lerp(x0, o.hx, ease(k)); o.y = lerp(y0, o.hy, ease(k)); }, () => o.back = false); };
      c.onTap = null; c.onDown = null; c.onMove = null; c.onUp = null;
      const toV = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - offX) / scale, y: (e.clientY - r.top - offY) / scale }; };
      function pdown(e) { const p = toV(e); c.ptr.x = p.x; c.ptr.y = p.y; c.ptr.down = true; downAt = { x: p.x, y: p.y, t: c.t }; cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
        if (c.onDown && c.onDown(p.x, p.y) === true) return;
        let best = null, bd = 1e9; drags.forEach(o => { if (o.back || o.off || (o.can && !o.can())) return; const d = dist(o.x, o.y, p.x, p.y); if (d < o.r + 14 && d < bd) { bd = d; best = o; } });
        if (best) { held = best; held.dx = best.x - p.x; held.dy = best.y - p.y; held.held = true; beep('pick'); best.onPick && best.onPick(); } }
      function pmove(e) { const p = toV(e); c.ptr.x = p.x; c.ptr.y = p.y; if (held) { held.x = clamp(p.x + held.dx, 0, VW); held.y = clamp(p.y + held.dy, 0, VH); held.onMove && held.onMove(held.x, held.y); } else if (c.onMove) c.onMove(p.x, p.y, c.ptr.down); }
      function pup(e) { const p = toV(e); c.ptr.down = false; if (held) { const o = held; held = null; o.held = false; drop(o); } else { if (c.onUp) c.onUp(p.x, p.y); if (downAt && dist(downAt.x, downAt.y, p.x, p.y) < 12 && c.onTap) c.onTap(p.x, p.y); } downAt = null; }
      function drop(o) { const ok = o.onDrop ? o.onDrop(o.x, o.y) : false; if (ok === false || ok === undefined) { if (o.bad !== false && o.onDrop) beep('bad'); c.home(o); } }
      /* 테스트용: 실제 손 조작과 같은 경로로 떨어뜨리기 */
      c.simDrop = (o, x, y) => { o.x = x; o.y = y; drop(o); };
      c.simTap = (x, y) => { c.onTap && c.onTap(x, y); };
      cv.addEventListener('pointerdown', pdown); cv.addEventListener('pointermove', pmove); cv.addEventListener('pointerup', pup); cv.addEventListener('pointercancel', pup);
      /* ── 그리기 도우미 ── */
      c.txt = (s, x, y, size = 18, col = '#eafffb', align = 'center', w = 700) => { g.font = `${w} ${size}px 'Noto Sans KR',system-ui,sans-serif`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; String(s).split('\n').forEach((ln, i) => g.fillText(ln, x, y + i * size * 1.25)); };
      c.rr = (x, y, w, h, r, fill, stroke, lw = 2) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      c.circle = (x, y, r, fill, stroke, lw = 2) => { g.beginPath(); g.arc(x, y, Math.max(.1, r), 0, 6.2832); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      c.ball = (x, y, r, col, label, tcol = '#04101a', size) => { const gr = g.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, '#fff'); gr.addColorStop(.25, col); gr.addColorStop(1, shade(col, -.35)); c.circle(x, y, r, gr, shade(col, .3), 1.5); if (label) c.txt(label, x, y + 1, size || Math.max(10, Math.min(r * .8, 20)), tcol, 'center', 900); };
      c.line = (pts, col, w = 2, dash) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]); };
      c.arrow = (x1, y1, x2, y2, col = '#9fe', w = 3, head = 12) => { c.line([[x1, y1], [x2, y2]], col, w); const a = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - head * Math.cos(a - .45), y2 - head * Math.sin(a - .45)); g.lineTo(x2 - head * Math.cos(a + .45), y2 - head * Math.sin(a + .45)); g.closePath(); g.fillStyle = col; g.fill(); };
      c.poly = (pts, fill, stroke, lw = 2) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      c.bar = (x, y, w, h, k, col, label) => { c.rr(x, y, w, h, 6, '#0b2533', '#ffffff22', 1); const kk = clamp(k, 0, 1); if (kk > 0) c.rr(x + 2, y + 2 + (h - 4) * (1 - kk), w - 4, (h - 4) * kk, 4, col); if (label) c.txt(label, x + w / 2, y + h + 14, 13, '#cfe'); };
      /* 그래프: rect = [x,y,w,h], ax = {x0,x1,y0,y1,xl,yl,xt,yt}, series = [{pts:[[x,y]], col, dots, line, w}] */
      c.graph = (rect, ax, series) => { const [X, Y, Wd, Ht] = rect; c.rr(X - 8, Y - 8, Wd + 16, Ht + 16, 10, '#06182299', '#ffffff18', 1);
        const px = v => X + (v - ax.x0) / (ax.x1 - ax.x0) * Wd, py = v => Y + Ht - (v - ax.y0) / (ax.y1 - ax.y0) * Ht;
        g.strokeStyle = '#ffffff12'; g.lineWidth = 1; (ax.xt || []).forEach(v => { g.beginPath(); g.moveTo(px(v), Y); g.lineTo(px(v), Y + Ht); g.stroke(); c.txt(v, px(v), Y + Ht + 12, 11, '#9bc'); });
        (ax.yt || []).forEach(v => { g.beginPath(); g.moveTo(X, py(v)); g.lineTo(X + Wd, py(v)); g.stroke(); c.txt(v, X - 6, py(v), 11, '#9bc', 'right'); });
        c.line([[X, Y], [X, Y + Ht], [X + Wd, Y + Ht]], '#cfe', 2);
        if (ax.xl) c.txt(ax.xl, X + Wd, Y + Ht + 28, 12, '#cfe', 'right'); if (ax.yl) c.txt(ax.yl, X + 4, Y - 14, 12, '#cfe', 'left');
        series.forEach(s => { const P = s.pts.map(([a, b]) => [px(a), py(clamp(b, ax.y0, ax.y1))]); if (s.line !== false && P.length > 1) c.line(P, s.col, s.w || 2.5, s.dash); if (s.dots) P.forEach(([a, b]) => c.circle(a, b, s.r || 5, s.col, '#04101a', 1.5)); });
        return { px, py }; };
      c.label = (s, x, y, col = '#cfe', size = 14, bg = 'rgba(4,16,26,.75)') => { g.font = `700 ${size}px 'Noto Sans KR',sans-serif`; const w = g.measureText(s).width + 14; c.rr(x - w / 2, y - size * .8, w, size * 1.6, 8, bg, col + '88', 1); c.txt(s, x, y, size, col); };
      function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = n >> 8 & 255, b = n & 255; const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
      c.shade = shade;

      /* ── 프레임 ── */
      function frame(now) { if (!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; c.t += dt;
        g.setTransform(c._dpr, 0, 0, c._dpr, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.translate(offX, offY); g.scale(scale, scale);
        g.save(); g.beginPath(); g.rect(0, 0, VW, VH); g.clip(); const bgr = g.createLinearGradient(0, 0, 0, VH); bgr.addColorStop(0, 'rgba(38,28,18,.78)'); bgr.addColorStop(1, 'rgba(22,16,10,.86)'); g.fillStyle = bgr; g.fillRect(0, 0, VW, VH);
        for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur); w.fn(k); if (k >= 1) { tweens.splice(i, 1); w.done && w.done(); } }
        try { loops.forEach(f => f(dt, c.t)); } catch (e) { console.error('[lab ' + id + ']', e); c.err = e; }
        drags.forEach(o => { if (!o.off && o.draw) o.draw(o.x, o.y, o); });
        for (let i = fxs.length - 1; i >= 0; i--) { const p = fxs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .94; p.vy *= .94; if (p.t > p.life) { fxs.splice(i, 1); continue; } g.globalAlpha = 1 - p.t / p.life; c.circle(p.x, p.y, 3.5, p.col); g.globalAlpha = 1; }
        for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; if (f.t > 1.4) { floats.splice(i, 1); continue; } g.globalAlpha = 1 - f.t / 1.4; c.txt(f.txt, f.x, f.y - f.t * 40, 20, f.col, 'center', 900); g.globalAlpha = 1; }
        if (tip) { g.font = `700 17px 'Noto Sans KR',sans-serif`; const w = Math.min(960, g.measureText(tip).width + 30); c.rr(VW / 2 - w / 2, 10, w, 34, 12, 'rgba(30,22,14,.88)', '#e8a33d88', 1.5); c.txt(tip, VW / 2, 27, 17, '#eafffb'); }
        if (msg) { msg.k += dt; const a = msg.k < .2 ? msg.k / .2 : Math.max(0, 1 - (msg.k - .7) / .5); g.globalAlpha = a; c.txt(msg.t, VW / 2, VH / 2 - 20 - msg.k * 20, 54, msg.col, 'center', 900); g.globalAlpha = 1; if (msg.k > 1.3) msg = null; }
        g.restore();
        readouts.forEach(o => { const h = o.fn(); if (h !== o.last) { o.el.innerHTML = h; o.last = h; } });
        raf = requestAnimationFrame(frame); }
      raf = requestAnimationFrame(frame);

      function close(silent) { if (!alive) return; alive = false; cancelAnimationFrame(raf); ro.disconnect(); root.hidden = true; root.innerHTML = ''; window.LAB_OPEN = false; cur = null; if (!silent) res(); else res(); }
      c.close = close; cur = c; c.id = id;
      side.querySelector('.lskip').onclick = () => { if (goals.every(q => q.done) || confirm('이 실험을 건너뛸까요? (메뉴의 개념 실험실에서 언제든 다시 할 수 있어요)')) close(); };
      nextB.onclick = () => close();
      try { L.fn(c); } catch (e) { console.error('[lab ' + id + '] setup', e); c.err = e; }
      window.LAB.cur = c;
    });
  }
  /* 두 갈래 묻기 (테스트 할지 등) */
  function ask(title, html, btns) { return new Promise(res => { const root = document.getElementById('lab') || document.body.appendChild(el('div')); root.id = 'lab'; root.hidden = false; root.innerHTML = `<div class="lask"><b>${title}</b><p>${html}</p><div>${btns.map((b, i) => `<button class="${i ? '' : 'pri'}" data-i="${i}">${b}</button>`).join('')}</div></div>`; window.LAB_OPEN = true;
    root.querySelectorAll('button').forEach(b => b.onclick = () => { root.hidden = true; root.innerHTML = ''; window.LAB_OPEN = false; res(+b.dataset.i); }); }); }
  /* 단독 실행: bio.html#lab=ea */
  window.addEventListener('load', () => { const m = /^#lab=(\w+)/.exec(location.hash); if (m) setTimeout(() => open(m[1]), 300); });
  return { def, open, ask, REG, ORDER, DONE, done: id => !!DONE[id] };
})();
