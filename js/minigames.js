'use strict';
const MG = {};
const fmt = (x, d = 2) => { if (!isFinite(x)) return '∞'; const a = Math.abs(x); if (a !== 0 && (a >= 1e5 || a < 1e-3)) return x.toExponential(2); return (+x.toFixed(d)).toString(); };
const sgn = (x, d = 1) => (x >= 0 ? '+' : '') + fmt(x, d);
function cv(el, w = 640, h = 360) { const c = mk('canvas', 'cv'); c.width = w; c.height = h; el.appendChild(c); return c; }
function hud(el) { const d = mk('div', 'hud'); el.appendChild(d); return d; }
function loop(el, fn) { let last = performance.now(), stop = false; function f(now) { if (stop || !el.isConnected) return; const dt = Math.min(.05, (now - last) / 1000); last = now; fn(dt, now / 1000); requestAnimationFrame(f); } requestAnimationFrame(f); return () => { stop = true; }; }
function onKey(el, fn) { const h = e => { if (!el.isConnected) return window.removeEventListener('keydown', h); fn(e); }; window.addEventListener('keydown', h); }
function lifeUI(el, n) { const d = mk('div', 'lives'); el.appendChild(d); const o = { n, hit() { o.n--; o.draw(); return o.n <= 0; }, draw() { d.innerHTML = '생명 ' + '❤'.repeat(Math.max(0, o.n)) + '<span class="dim">' + '♡'.repeat(Math.max(0, n - o.n)) + '</span>'; } }; o.draw(); return o; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function pos(c, e) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; }
const KIND = { isochoric: '등적', isobaric: '등압', isothermal: '등온', adiabatic: '단열' };
function txt(x, s, px, py, col = '#cfc6dd', font = '13px serif', al = 'left') { x.fillStyle = col; x.font = font; x.textAlign = al; x.fillText(s, px, py); }

/* ============ P-V 그래프 조율 ============ */
MG.pv = (cfg, el, done) => {
  const h = hud(el), c = cv(el, 640, 400), x = c.getContext('2d'), log = mk('div', 'mglog'); el.appendChild(log);
  const W = 640, H = 400, ml = 54, mr = 16, mt = 16, mb = 44, Vm = cfg.Vmax, Pm = cfg.Pmax, g = 5 / 3, tol = cfg.tol || 0.07;
  const X = V => ml + V / Vm * (W - ml - mr), Y = P => H - mb - P / Pm * (H - mt - mb);
  const iX = px => (px - ml) / (W - ml - mr) * Vm, iY = py => (H - mb - py) / (H - mt - mb) * Pm;
  let li = 0, cur = { ...cfg.start }, s = { ...cur }, path = [{ ...cur }], hp = 100, drag = false, Wleg = 0, over = false, flash = 0, sumW = 0, sumQ = 0;
  const U0 = cur.P * cur.V, legs = cfg.legs;
  const curveP = (leg, s, V) => leg.kind === 'isobaric' ? s.P : leg.kind === 'isothermal' ? s.P * s.V / V : s.P * Math.pow(s.V / V, g);
  const tgt = (leg, s) => leg.kind === 'isochoric' ? { V: s.V, P: leg.to } : { V: leg.to, P: curveP(leg, s, leg.to) };
  const dev = (leg, s, p) => leg.kind === 'isochoric' ? Math.abs(p.V - s.V) / Vm : Math.abs(p.P - curveP(leg, s, p.V)) / Pm;
  function finishLeg() {
    const leg = legs[li], t = tgt(leg, s), k = leg.kind;
    const Wx = k === 'isochoric' ? 0 : k === 'isobaric' ? s.P * (t.V - s.V) : k === 'isothermal' ? s.P * s.V * Math.log(t.V / s.V) : -1.5 * (t.P * t.V - s.P * s.V);
    const dU = k === 'isothermal' ? 0 : 1.5 * (t.P * t.V - s.P * s.V), Q = k === 'adiabatic' ? 0 : dU + Wx;
    sumW += Wx; sumQ += Q;
    log.textContent += `✔ ${leg.name || ''} ${KIND[k]} 과정:  Q(${sgn(Q)}) = ΔU(${sgn(dU)}) + W(${sgn(Wx)})  →  ${Q > 1e-9 ? '열 흡수' : Q < -1e-9 ? '열 방출' : '열 출입 없음'}, 온도 ${dU > 1e-9 ? '상승' : dU < -1e-9 ? '하강' : '일정'}\n`;
    cur = { ...t }; s = { ...t }; path.push({ ...t }); Wleg = 0; li++;
    if (li >= legs.length) { over = true; if (cfg.cycle) log.textContent += `◎ 한 순환: ΔU = 0, 알짜 일 W = ${fmt(sumW, 1)} J (그래프로 둘러싸인 넓이)\n`; setTimeout(() => done(true), 1400); }
  }
  c.onpointerdown = e => { const p = pos(c, e); if (Math.hypot(p.x - X(cur.V), p.y - Y(cur.P)) < 50) { drag = true; c.setPointerCapture(e.pointerId); } };
  c.onpointerup = () => drag = false;
  c.onpointermove = e => {
    if (!drag || over) return; const q = pos(c, e);
    const p = { V: Math.min(Vm * .99, Math.max(Vm * .04, iX(q.x))), P: Math.min(Pm * .99, Math.max(Pm * .03, iY(q.y))) };
    const leg = legs[li]; Wleg += (cur.P + p.P) / 2 * (p.V - cur.V); cur = p; path.push({ ...p });
    if (dev(leg, s, p) > tol) { hp -= 2.2; flash = 6; if (hp <= 0) { over = true; done(false); } }
    const t = tgt(leg, s); if (Math.hypot((p.V - t.V) / Vm, (p.P - t.P) / Pm) < 0.045) finishLeg();
  };
  loop(el, () => {
    x.clearRect(0, 0, W, H); x.fillStyle = flash > 0 ? '#2a0d0d' : '#0a0810'; x.fillRect(0, 0, W, H); if (flash > 0) flash--;
    x.strokeStyle = '#6d6480'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(ml, mt); x.lineTo(ml, H - mb); x.lineTo(W - mr, H - mb); x.stroke();
    txt(x, '압력 P', 6, 18); txt(x, '부피 V', W - 54, H - 10);
    for (let i = 1; i <= 4; i++) { const V = Vm * i / 4.5, P = Pm * i / 4.5; txt(x, fmt(V, 1), X(V), H - mb + 16, '#8a8198', '12px serif', 'center'); txt(x, fmt(P, 1), ml - 6, Y(P) + 4, '#8a8198', '12px serif', 'right'); }
    // isotherms
    [1, 2, 4].forEach(m => { x.strokeStyle = 'rgba(127,178,255,.22)'; x.setLineDash([3, 5]); x.beginPath(); let st = false; for (let V = Vm * .04; V < Vm; V += Vm / 120) { const P = U0 * m / V; if (P > Pm) continue; if (!st) { x.moveTo(X(V), Y(P)); st = true; } else x.lineTo(X(V), Y(P)); } x.stroke(); x.setLineDash([]); if (U0 * m / (Vm * .97) < Pm) txt(x, (m === 1 ? '' : m) + 'T₀', X(Vm * .95), Y(U0 * m / (Vm * .95)) - 5, 'rgba(127,178,255,.7)', '12px serif'); });
    if (!over || li < legs.length) {
      const leg = legs[Math.min(li, legs.length - 1)], t = tgt(leg, s);
      if (!cfg.noGuide && li < legs.length) { x.strokeStyle = 'rgba(217,178,95,.55)'; x.setLineDash([6, 6]); x.lineWidth = 2; x.beginPath(); x.moveTo(X(s.V), Y(s.P)); if (leg.kind === 'isochoric') x.lineTo(X(t.V), Y(t.P)); else for (let i = 1; i <= 40; i++) { const V = s.V + (t.V - s.V) * i / 40; x.lineTo(X(V), Y(curveP(leg, s, V))); } x.stroke(); x.setLineDash([]); }
      if (li < legs.length) { x.strokeStyle = '#6fe3a1'; x.lineWidth = 2; x.beginPath(); x.arc(X(t.V), Y(t.P), 11, 0, 7); x.stroke(); txt(x, '목표', X(t.V) + 14, Y(t.P) - 8, '#6fe3a1'); }
    }
    // area under path
    x.fillStyle = 'rgba(226,85,43,.16)'; x.beginPath(); x.moveTo(X(path[0].V), Y(0)); path.forEach(p => x.lineTo(X(p.V), Y(p.P))); x.lineTo(X(path[path.length - 1].V), Y(0)); x.fill();
    x.strokeStyle = '#e2552b'; x.lineWidth = 2.5; x.beginPath(); path.forEach((p, i) => i ? x.lineTo(X(p.V), Y(p.P)) : x.moveTo(X(p.V), Y(p.P))); x.stroke();
    x.fillStyle = '#ffd166'; x.beginPath(); x.arc(X(cur.V), Y(cur.P), 9, 0, 7); x.fill();
    const leg = legs[Math.min(li, legs.length - 1)], dU = 1.5 * (cur.P * cur.V - s.P * s.V), Q = dU + Wleg;
    h.innerHTML = `<b>${li < legs.length ? `[${li + 1}/${legs.length}] ${leg.ask}` : '완료!'}</b><br>노란 점을 끌어 점선을 따라가라 · 궤도 안정도 <span class="gauge"><i style="width:${Math.max(0, hp)}%;background:${hp > 40 ? '#6fe3a1' : '#e2552b'}"></i></span><br>` +
      `P = ${fmt(cur.P)} , V = ${fmt(cur.V)} , <b>T = ${fmt(cur.P * cur.V / U0)} T₀</b> (T ∝ PV)<br><b>Q(${sgn(Q)}) = ΔU(${sgn(dU)}) + W(${sgn(Wleg)})</b> <small>— W는 그래프 아래 넓이</small>`;
  });
};

/* ============ 슬라이더 조율 ============ */
MG.tuner = (cfg, el, done) => {
  const h = hud(el); let c, x; if (cfg.draw) { c = cv(el, 640, cfg.h || 240); x = c.getContext('2d'); }
  const v = {}, panel = mk('div', 'sliders'); el.appendChild(panel);
  cfg.vars.forEach(a => {
    v[a.id] = a.init; const r = mk('div', 'sl'); r.appendChild(mk('span', '', a.label));
    const i = mk('input'); i.type = 'range'; i.min = a.min; i.max = a.max; i.step = a.step; i.value = a.init;
    const o = mk('span', 'val'); const show = () => o.textContent = (a.show ? a.show(v[a.id]) : fmt(v[a.id], 3)) + (a.unit ? ' ' + a.unit : '');
    i.oninput = () => { v[a.id] = +i.value; show(); }; show(); r.appendChild(i); r.appendChild(o); panel.appendChild(r);
  });
  const rounds = cfg.rounds, T0 = cfg.time || 90, need = cfg.hold || 1.2; let ri = 0, hold = 0, tleft = T0, t = 0, fin = false;
  loop(el, dt => {
    if (fin) return; t += dt; tleft -= dt; const r = rounds[ri];
    const res = r.goals.map(g => { const val = g.f(v); return { g, val, ok: Math.abs(val - g.target) <= (g.tol != null ? g.tol : Math.abs(g.target) * 0.015 + 1e-9) }; });
    hold = res.every(o => o.ok) ? hold + dt : 0;
    let s = `<b>[${ri + 1}/${rounds.length}] ${r.text}</b> <small>· 남은 시간 ${Math.ceil(tleft)}초</small><br>`;
    if (cfg.formula) s += `<span class="fm" style="display:block;margin:4px 0">${cfg.formula}</span>`;
    (cfg.outs || []).forEach(o => { s += `${o.label} = <b>${o.show ? o.show(o.f(v)) : fmt(o.f(v), o.d == null ? 2 : o.d)}</b> ${o.unit || ''} &nbsp; `; });
    s += '<br>'; res.forEach(o => { s += `<span class="${o.ok ? 'ok' : 'no'}">${o.ok ? '✔' : '◇'} ${o.g.label}: ${o.g.show ? o.g.show(o.val) : fmt(o.val, o.g.d == null ? 2 : o.g.d)} → 목표 ${o.g.hide ? '???' : (o.g.show ? o.g.show(o.g.target) : fmt(o.g.target, o.g.d == null ? 2 : o.g.d))} ${o.g.unit || ''}</span> &nbsp; `; });
    if (r.warn) { const w = r.warn(v); if (w) s += `<br><span class="warn">${w}</span>`; }
    s += `<br>고정 <span class="gauge"><i style="width:${Math.min(100, hold / need * 100)}%"></i></span>`;
    h.innerHTML = s;
    if (cfg.draw) cfg.draw(x, v, t, 640, c.height, ri);
    if (hold >= need) { ri++; hold = 0; tleft = T0; if (ri >= rounds.length) { fin = true; done(true); } }
    else if (tleft <= 0) { fin = true; done(false); }
  });
};

/* ============ 수식 조립 ============ */
MG.forge = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), box = mk('div', 'forge'); el.appendChild(box); let si = 0;
  (function step() {
    const st = cfg.steps[si]; box.innerHTML = '';
    box.appendChild(mk('div', 'prob', `<b>[${si + 1}/${cfg.steps.length}]</b> ${T(st.problem)}`));
    const ex = mk('div', 'expr'); box.appendChild(ex); const blanks = st.expr.filter(e => typeof e === 'object'), fill = blanks.map(() => null);
    const draw = () => { ex.innerHTML = ''; let bi = 0; st.expr.forEach(e => { if (typeof e === 'string') ex.appendChild(mk('span', '', e)); else { const i = bi++; const b = mk('span', 'blank', fill[i] == null ? '?' : fill[i]); b.onclick = () => { fill[i] = null; draw(); }; ex.appendChild(b); } }); };
    draw();
    const tl = mk('div', 'tiles'); shuffle(st.tiles).forEach(tn => { const b = mk('button', '', tn); b.onclick = () => { const i = fill.indexOf(null); if (i >= 0) { fill[i] = tn; draw(); } }; tl.appendChild(b); }); box.appendChild(tl);
    let inp; if (st.answer != null) { const a = mk('div', 'ans', `<span>${st.ansLabel || '답'} =</span>`); inp = mk('input'); inp.type = 'number'; inp.step = 'any'; inp.inputMode = 'decimal'; a.appendChild(inp); a.appendChild(mk('span', '', st.unit || '')); box.appendChild(a); }
    const sub = mk('button', 'pri', '수식 발동'), msg = mk('div', 'msg'); box.appendChild(sub); box.appendChild(msg);
    sub.onclick = () => {
      let ok = st.anyOrder ? fill.slice().sort().join('|') === blanks.map(b => b.b).sort().join('|') : blanks.every((b, i) => fill[i] === b.b || (b.alt && b.alt.includes(fill[i])));
      if (ok && inp) { const val = parseFloat(inp.value); ok = isFinite(val) && Math.abs(val - st.answer) <= (st.tol != null ? st.tol : Math.abs(st.answer) * 0.011 + 1e-9); }
      if (ok) { msg.className = 'msg good'; msg.innerHTML = '✔ ' + (st.explain || '정확하다!'); sub.disabled = true; setTimeout(() => { si++; if (si >= cfg.steps.length) done(true); else step(); }, st.explain ? 2600 : 900); }
      else { msg.className = 'msg bad'; msg.innerHTML = '✖ 수식이 어긋났다. ' + (st.hint ? '<br>힌트: ' + st.hint : ''); if (L.hit()) done(false); }
    };
  })();
};

/* ============ 순환 리듬 ============ */
MG.rhythm = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 640, 300), x = c.getContext('2d');
  const n = cfg.stages.length, laps = cfg.laps || 3; let ang = 0, lap = 0, sec = 0, answered = false, hits = 0, fin = false, fb = '', beat = cfg.beat || 2.6;
  const row = mk('div', 'btnrow'); el.appendChild(row);
  shuffle(cfg.stages.map((s, i) => i)).forEach((i, bi) => { const b = mk('button', '', `<small>${bi + 1}</small> ${cfg.stages[i]}`); b.onclick = () => press(i); b.dataset.i = i; row.appendChild(b); });
  onKey(el, e => { const b = row.children[+e.key - 1]; if (b) press(+b.dataset.i); });
  function miss(m) { fb = '✖ ' + m; if (L.hit()) { fin = true; done(false); } }
  function press(i) { if (fin || answered) return; if (i === sec) { answered = true; hits++; fb = '✔ ' + cfg.stages[i]; } else { answered = true; miss(`지금은 「${cfg.stages[sec]}」`); } }
  function drawCycle(ox, oy, w, hh) {
    const cy = cfg.cycle, pts = cy.pts, vs = pts.map(p => p.V), ps = pts.map(p => p.P), v0 = Math.min(...vs), v1 = Math.max(...vs), p0 = Math.min(...ps), p1 = Math.max(...ps);
    const X = V => ox + 30 + (V - v0) / (v1 - v0) * (w - 60), Y = P => oy + hh - 30 - (P - p0) / (p1 - p0) * (hh - 60);
    x.strokeStyle = '#6d6480'; x.lineWidth = 1; x.beginPath(); x.moveTo(ox + 12, oy + 6); x.lineTo(ox + 12, oy + hh - 12); x.lineTo(ox + w - 6, oy + hh - 12); x.stroke(); txt(x, '압력', ox + 16, oy + 16, '#8a8198', '11px serif'); txt(x, '부피', ox + w - 34, oy + hh - 16, '#8a8198', '11px serif');
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % n], k = cy.kinds[i]; x.strokeStyle = i === sec ? '#ffd166' : '#5a4f6e'; x.lineWidth = i === sec ? 5 : 2; x.beginPath(); x.moveTo(X(a.V), Y(a.P));
      if (k === 'line' || a.V === b.V || a.P === b.P) x.lineTo(X(b.V), Y(b.P)); else { const e = Math.log(b.P / a.P) / Math.log(a.V / b.V); for (let j = 1; j <= 24; j++) { const V = a.V + (b.V - a.V) * j / 24; x.lineTo(X(V), Y(a.P * Math.pow(a.V / V, e))); } }
      x.stroke();
      if (i === sec) { const mx = (X(a.V) + X(b.V)) / 2, my = (Y(a.P) + Y(b.P)) / 2; txt(x, `${a.n}→${b.n}`, mx + 8, my - 8, '#ffd166', 'bold 14px serif'); }
    });
    pts.forEach(p => { x.fillStyle = '#e8e2d4'; x.beginPath(); x.arc(X(p.V), Y(p.P), 4, 0, 7); x.fill(); txt(x, p.n, X(p.V) - 14, Y(p.P) - 6, '#e8e2d4', '13px serif'); });
  }
  function drawPiston(ox, oy, w, hh) {
    const f = (ang % (Math.PI * 2 / n)) / (Math.PI * 2 / n), down = sec % 2 === 0, py = oy + 70 + (down ? f : 1 - f) * 90;
    x.strokeStyle = '#8a8198'; x.lineWidth = 3; x.strokeRect(ox + w / 2 - 50, oy + 40, 100, 190);
    x.fillStyle = ['rgba(255,150,200,.35)', 'rgba(255,180,120,.4)', 'rgba(255,220,90,.55)', 'rgba(140,220,140,.35)'][sec % 4]; x.fillRect(ox + w / 2 - 48, oy + 42, 96, py - oy - 42);
    x.fillStyle = '#b9b0c6'; x.fillRect(ox + w / 2 - 48, py, 96, 22); x.fillRect(ox + w / 2 - 6, py + 22, 12, 60);
    txt(x, sec === 0 ? '흡기 밸브 열림 ⇣' : '흡기 밸브 닫힘', ox + w / 2 - 120, oy + 30, sec === 0 ? '#ff9ac8' : '#5a4f6e', '12px serif');
    txt(x, sec === 3 ? '배기 밸브 열림 ⇡' : '배기 밸브 닫힘', ox + w / 2 + 20, oy + 30, sec === 3 ? '#8fe08f' : '#5a4f6e', '12px serif');
    if (sec === 2 && f < .4) txt(x, '⚡점화!', ox + w / 2 - 22, oy + 62, '#ffe066', 'bold 14px serif');
    txt(x, down ? '피스톤 ↓' : '피스톤 ↑', ox + w / 2 + 60, py + 16, '#e8e2d4');
  }
  loop(el, dt => {
    if (fin) return; ang += dt * (Math.PI * 2 / n) / beat;
    const ns = Math.floor(ang / (Math.PI * 2 / n));
    if (ns % n !== sec || ns >= n * (lap + 1)) {
      if (!answered) miss(`놓쳤다 — 「${cfg.stages[sec]}」`); if (fin) return;
      sec = ns % n; answered = false; if (ns >= n * (lap + 1)) { lap++; beat *= .85; if (lap >= laps) { fin = true; return done(true); } }
    }
    x.clearRect(0, 0, 640, 300); const cx = 150, cy = 150, R = 110;
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + i * Math.PI * 2 / n, a1 = a0 + Math.PI * 2 / n; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, a0, a1); x.closePath();
      x.fillStyle = i === sec ? (answered ? '#2f5d43' : '#5d4a1c') : '#1d1828'; x.fill(); x.strokeStyle = '#3b3150'; x.stroke();
      const am = (a0 + a1) / 2, show = lap === 0 || (i === sec && answered); const lb = show ? cfg.stages[i] : `과정 ${i + 1}`;
      lb.split(' (').forEach((s, j) => txt(x, j ? '(' + s : s, cx + Math.cos(am) * R * .6, cy + Math.sin(am) * R * .6 + j * 14, show ? '#e8e2d4' : '#6d6480', '12px serif', 'center'));
    }
    const pa = -Math.PI / 2 + ang; x.strokeStyle = '#ffd166'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(pa) * R, cy + Math.sin(pa) * R); x.stroke();
    if (cfg.cycle) drawCycle(300, 10, 330, 280); else drawPiston(300, 10, 330, 280);
    h.innerHTML = `<b>${cfg.ask || '바늘이 들어선 칸의 과정을 눌러라'}</b> · 바퀴 ${lap + 1}/${laps} ${lap === 0 ? '<small>(1바퀴째는 이름이 보인다. 외워라!)</small>' : '<small>(이름이 가려졌다 — 그래프를 읽어라)</small>'}<br>${fb}`;
  });
};

/* ============ 낙하 분류 ============ */
MG.sort = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), area = mk('div', 'fall'); el.appendChild(area);
  const card = mk('div', 'card'); area.appendChild(card); area.appendChild(mk('div', 'floor'));
  const row = mk('div', 'btnrow'); el.appendChild(row);
  cfg.bins.forEach((b, i) => { const bt = mk('button', '', `<small>${i + 1}</small> ${b}`); bt.onclick = () => pick(i); row.appendChild(bt); });
  onKey(el, e => { const i = +e.key - 1; if (i >= 0 && i < cfg.bins.length) pick(i); });
  let q = shuffle(cfg.items), y = 0, fin = false, fb = '분류를 시작한다.', wait = 0; const dur = cfg.dur || 6, total = q.length;
  function wrong(m) { const it = q.shift(); q.push(it); fb = `<span class="no">✖ ${m} → 「${it.text}」 = <b>${cfg.bins[it.bin]}</b>${it.why ? ' (' + it.why + ')' : ''}</span>`; y = 0; wait = 1.6; if (L.hit()) { fin = true; done(false); } }
  function pick(i) { if (fin || wait > 0) return; const it = q[0]; if (i === it.bin) { q.shift(); fb = `<span class="ok">✔ 「${it.text}」 = ${cfg.bins[i]}${it.why ? ' — ' + it.why : ''}</span>`; y = 0; if (!q.length) { fin = true; done(true); } } else wrong('오분류'); }
  loop(el, dt => {
    if (fin) return; if (wait > 0) { wait -= dt; card.style.opacity = .2; } else { card.style.opacity = 1; y += dt / dur; if (y >= 1) wrong('시간 초과'); }
    if (fin || !q.length) return; card.textContent = q[0].text; card.style.top = (y * 190) + 'px';
    h.innerHTML = `<b>${cfg.ask}</b> · 남은 것 ${q.length}/${total}<br>${fb}`;
  });
};

/* ============ 확산과 엔트로피 (맥스웰의 마개) ============ */
MG.demon = (cfg, el, done) => {
  const h = hud(el), c = cv(el, 640, 300), x = c.getContext('2d'); const row = mk('div', 'btnrow'); el.appendChild(row);
  const bt = mk('button', 'pri', '마개 열기 (누르고 있는 동안 열림 / Space)'); row.appendChild(bt);
  let open = false, phase = 0, ps = [], t = 0, hist = [], fin = false, holdA = 0; const mid = 320, gy = 110, gap = 70, BW = 640, BH = 220;
  bt.onpointerdown = () => open = true; bt.onpointerup = bt.onpointerleave = () => open = false;
  const kd = e => { if (!el.isConnected) { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); return; } if (e.code === 'Space') { open = true; e.preventDefault(); } }, ku = e => { if (e.code === 'Space') open = false; };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const PH = [{ n: cfg.n1 || 3, time: 60 }, { n: cfg.n2 || 30, time: 25 }];
  function init() { const n = PH[phase].n; ps = []; for (let i = 0; i < n; i++) { const a = Math.random() * 7, sp = 110 + Math.random() * 60; ps.push({ x: 20 + Math.random() * (phase === 0 ? 600 : 280), y: 15 + Math.random() * (BH - 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); } t = 0; hist = []; holdA = 0; }
  init();
  loop(el, dt => {
    if (fin) return; t += dt; const P = PH[phase]; const op = phase === 1 && t < 6 ? true : open;
    ps.forEach(p => {
      const nx = p.x + p.vx * dt; let ny = p.y + p.vy * dt;
      if (ny < 6 || ny > BH - 6) { p.vy *= -1; ny = p.y; }
      if ((p.x - mid) * (nx - mid) <= 0 && !(op && Math.abs(p.y - gy) < gap / 2)) { p.vx *= -1; } else if (nx < 6 || nx > BW - 6) p.vx *= -1; else p.x = nx;
      p.y = ny;
    });
    const nA = ps.filter(p => p.x < mid).length, nB = ps.length - nA; if (hist.length < 600 && Math.floor(t * 10) > hist.length) hist.push(nA);
    x.clearRect(0, 0, 640, 300); x.fillStyle = '#0a0810'; x.fillRect(0, 0, 640, 300);
    x.strokeStyle = '#8a8198'; x.lineWidth = 2; x.strokeRect(1, 1, BW - 2, BH - 2);
    x.strokeStyle = '#d9b25f'; x.lineWidth = 4; x.beginPath(); x.moveTo(mid, 0); x.lineTo(mid, gy - gap / 2); x.moveTo(mid, gy + gap / 2); x.lineTo(mid, BH); x.stroke();
    if (!op) { x.strokeStyle = '#e2552b'; x.beginPath(); x.moveTo(mid, gy - gap / 2); x.lineTo(mid, gy + gap / 2); x.stroke(); }
    txt(x, 'A', 20, 24, '#e8e2d4', 'bold 18px serif'); txt(x, 'B', 610, 24, '#e8e2d4', 'bold 18px serif');
    ps.forEach(p => { x.fillStyle = '#9d8cff'; x.beginPath(); x.arc(p.x, p.y, 5, 0, 7); x.fill(); });
    // graph
    x.strokeStyle = '#3b3150'; x.lineWidth = 1; x.strokeRect(40, 232, 560, 60); txt(x, '분자 수', 2, 246, '#8a8198', '10px serif'); txt(x, '시간', 606, 290, '#8a8198', '10px serif');
    const gyv = v => 290 - v / ps.length * 56;
    x.strokeStyle = '#e2552b'; x.beginPath(); hist.forEach((v, i) => i ? x.lineTo(40 + i * 560 / (P.time * 10), gyv(v)) : x.moveTo(40, gyv(v))); x.stroke();
    x.strokeStyle = '#7fb2ff'; x.beginPath(); hist.forEach((v, i) => i ? x.lineTo(40 + i * 560 / (P.time * 10), gyv(ps.length - v)) : x.moveTo(40, gyv(ps.length - v))); x.stroke();
    txt(x, 'A', 44, 244, '#e2552b', '11px serif'); txt(x, 'B', 58, 244, '#7fb2ff', '11px serif');
    const N = ps.length;
    h.innerHTML = phase === 0
      ? `<b>[1/2] 분자 ${N}개를 전부 A에 가둬라</b> (마개를 닫은 채 1초 유지) · ${Math.ceil(P.time - t)}초<br>A: ${nA}개, B: ${nB}개 · 가능한 상태 수 2<sup>${N}</sup> = ${2 ** N} · 전부 A에 있을 확률 (1/2)<sup>${N}</sup> = ${fmt(1 / 2 ** N, 3)}`
      : `<b>[2/2] 분자 ${N}개. ${t < 6 ? '마개가 열렸다 — 확산을 지켜보라' : '이제 마개를 조작해 다시 전부 A에 가둬 보아라…'}</b> · ${Math.ceil(P.time - t)}초<br>A: ${nA}개, B: ${nB}개 · 상태 수 2<sup>${N}</sup> ≈ ${fmt(2 ** N)} · 전부 A일 확률 (1/2)<sup>${N}</sup> ≈ ${fmt(1 / 2 ** N)}<br><small>분자 100개라면 (1/2)<sup>100</sup> ≒ 10<sup>−30</sup> ≒ 0 — 확산은 비가역이다.</small>`;
    if (nA === N && !op && (phase === 0 || t > 6)) { holdA += dt; if (holdA > 1) { if (phase === 0) { phase = 1; init(); } else { fin = true; done(true); } } } else holdA = 0;
    if (t > P.time) { if (phase === 0) { fin = true; done(false); } else { fin = true; h.innerHTML += '<br><span class="ok">깨달음: 고르게 퍼진 상태의 수가 압도적으로 많다. 자연은 확률이 높은(엔트로피가 큰) 쪽으로만 흐른다.</span>'; done(true); } }
  });
};

/* ============ 단진동 타격 ============ */
MG.strike = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 640, 300), x = c.getContext('2d'); const row = mk('div', 'btnrow'); el.appendChild(row);
  const bt = mk('button', 'pri', '⚔ 타격! (Space)'); row.appendChild(bt);
  const w = cfg.omega || 2.2, A = 110; let t = 0, ri = 0, fin = false, fb = '', cool = 0;
  const cond = { center: (s) => Math.abs(s) < .26, edge: s => Math.abs(s) > .9, right: s => s > .9, left: s => s < -.9 };
  function hit() {
    if (fin || cool > 0) return; const s = Math.sin(w * t), r = cfg.rounds[ri]; cool = .5;
    if (cond[r.at](s)) { fb = `<span class="ok">✔ ${r.why}</span>`; ri++; if (ri >= cfg.rounds.length) { fin = true; done(true); } }
    else { fb = `<span class="no">✖ 빗나갔다 (x = ${fmt(s)}A). ${r.why}</span>`; if (L.hit()) { fin = true; done(false); } }
  }
  bt.onclick = hit; onKey(el, e => { if (e.code === 'Space') { e.preventDefault(); hit(); } });
  loop(el, dt => {
    if (fin) return; t += dt; cool -= dt; const th = w * t, s = Math.sin(th), co = Math.cos(th);
    x.clearRect(0, 0, 640, 300); const cx = 110, cy = 110, R = 80;
    x.strokeStyle = '#3b3150'; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    const px = cx + R * co, py = cy - R * s; x.strokeStyle = '#e2552b'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke();
    x.fillStyle = '#ffd166'; x.beginPath(); x.arc(px, py, 7, 0, 7); x.fill(); txt(x, '등속 원운동 (θ = ωt)', 40, 214, '#8a8198', '12px serif');
    x.setLineDash([3, 4]); x.strokeStyle = '#6d6480'; x.beginPath(); x.moveTo(px, py); x.lineTo(250, py); x.stroke(); x.setLineDash([]);
    // vertical projection Q
    x.strokeStyle = '#6d6480'; x.beginPath(); x.moveTo(250, cy - R - 10); x.lineTo(250, cy + R + 10); x.stroke();
    x.fillStyle = '#ffd166'; x.beginPath(); x.arc(250, py, 8, 0, 7); x.fill(); txt(x, 'x = A sin ωt', 262, cy - R - 2, '#8a8198', '12px serif'); txt(x, 'O', 232, cy + 4, '#8a8198', '12px serif');
    // spring horizontally
    const ox = 470, mx = ox + s * A * .9, sy = 250; x.strokeStyle = '#8a8198'; x.lineWidth = 3; x.beginPath(); x.moveTo(330, sy - 26); x.lineTo(330, sy + 26); x.stroke();
    x.lineWidth = 1.5; x.strokeStyle = '#b9b0c6'; x.beginPath(); x.moveTo(330, sy); const nC = 16; for (let i = 1; i <= nC; i++) x.lineTo(330 + (mx - 18 - 330) * i / nC, sy + (i % 2 ? -9 : 9)); x.stroke();
    x.fillStyle = '#d9b25f'; x.beginPath(); x.arc(mx, sy, 16, 0, 7); x.fill();
    x.strokeStyle = '#3b3150'; x.setLineDash([3, 4]);[-1, 0, 1].forEach(k => { x.beginPath(); x.moveTo(ox + k * A * .9, sy - 34); x.lineTo(ox + k * A * .9, sy + 30); x.stroke(); }); x.setLineDash([]);
    txt(x, '−A', ox - A * .9, sy - 38, '#8a8198', '12px serif', 'center'); txt(x, 'O(평형점)', ox, sy - 38, '#8a8198', '12px serif', 'center'); txt(x, '+A', ox + A * .9, sy - 38, '#8a8198', '12px serif', 'center');
    if (!cfg.hideBars) {
      const bar = (lab, v, yy, col) => { txt(x, lab, 330, yy + 4, '#cfc6dd', '13px serif'); x.fillStyle = '#241e30'; x.fillRect(420, yy - 6, 200, 10); x.fillStyle = col; x.fillRect(520, yy - 6, v * 100, 10); x.fillStyle = '#8a8198'; x.fillRect(519, yy - 9, 2, 16); };
      bar('변위 x', s, 40, '#ffd166'); bar('속도 v', co, 80, '#6fe3a1'); bar('가속도 a', -s, 120, '#7fb2ff'); bar('복원력 F', -s, 160, '#e2552b');
    } else txt(x, '게이지 봉인 — 몸으로 기억하라', 340, 90, '#6d6480', '14px serif');
    const r = cfg.rounds[Math.min(ri, cfg.rounds.length - 1)];
    h.innerHTML = `<b>[${Math.min(ri + 1, cfg.rounds.length)}/${cfg.rounds.length}] 「${r.ask}」 순간에 타격하라!</b><br><span class="fm" style="display:block;margin:4px 0">x = A sin ωt · v = Aω cos ωt · a = −Aω² sin ωt = −ω²x · F = −mω²x = −kx</span>${fb}`;
  });
};

/* ============ 매질의 운동 방향 ============ */
MG.wavedir = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 640, 260), x = c.getContext('2d'); const row = mk('div', 'btnrow'); el.appendChild(row);
  const up = mk('button', '', '▲ 위로 (↑)'), dn = mk('button', '', '▼ 아래로 (↓)'); row.appendChild(up); row.appendChild(dn);
  const lam = 220, k = Math.PI * 2 / lam, A = 60, mid = 130; let dir, px, ph = 0, anim = 0, ri = 0, fin = false, fb = '', ans;
  function setup() { dir = Math.random() < .5 ? 1 : -1; ph = Math.random() * 7; do { px = 80 + Math.random() * 480; } while (Math.abs(Math.cos(k * px - ph)) < .4); ans = (dir > 0 ? -Math.cos(k * px - ph) : Math.cos(k * px - ph)) > 0 ? 1 : -1; anim = 0; }
  setup();
  function pick(d) {
    if (fin || anim > 0) return; anim = 1.3;
    if (d === ans) { fb = `<span class="ok">✔ 정답. 파형을 진행 방향으로 살짝 밀어 그려 보면 그 점은 ${ans > 0 ? '위로' : '아래로'} 움직인다. 매질은 제자리에서 진동만 한다!</span>`; ri++; }
    else { fb = `<span class="no">✖ 파형을 진행 방향으로 조금 옮겨 그려 보라. 그 점은 ${ans > 0 ? '위' : '아래'}로 움직인다.</span>`; if (L.hit()) { fin = true; return done(false); } }
  }
  up.onclick = () => pick(1); dn.onclick = () => pick(-1); onKey(el, e => { if (e.key === 'ArrowUp') { e.preventDefault(); pick(1); } if (e.key === 'ArrowDown') { e.preventDefault(); pick(-1); } });
  loop(el, dt => {
    if (fin) return;
    if (anim > 0) { anim -= dt; ph += dir * dt * 1.6; if (anim <= 0) { if (ri >= (cfg.rounds || 6)) { fin = true; return done(true); } setup(); } }
    x.clearRect(0, 0, 640, 260); x.strokeStyle = '#3b3150'; x.beginPath(); x.moveTo(0, mid); x.lineTo(640, mid); x.stroke();
    x.strokeStyle = '#7fb2ff'; x.lineWidth = 3; x.beginPath(); for (let X = 0; X <= 640; X += 4) { const y = mid - A * Math.sin(k * X - ph); X ? x.lineTo(X, y) : x.moveTo(X, y); } x.stroke();
    const y = mid - A * Math.sin(k * px - ph); x.font = '26px serif'; x.textAlign = 'center'; x.fillText('🍃', px, y - 6); x.fillStyle = '#ffd166'; x.beginPath(); x.arc(px, y, 6, 0, 7); x.fill();
    x.setLineDash([3, 4]); x.strokeStyle = '#6d6480'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, 20); x.lineTo(px, 240); x.stroke(); x.setLineDash([]);
    txt(x, dir > 0 ? '파동의 진행 방향 ➡' : '⬅ 파동의 진행 방향', 320, 24, '#ffd166', 'bold 16px serif', 'center');
    h.innerHTML = `<b>[${Math.min(ri + 1, cfg.rounds || 6)}/${cfg.rounds || 6}] 이 순간, 나뭇잎이 놓인 매질 점은 어느 쪽으로 움직이는가?</b><br><small>이동하는 것: 파형·에너지 / 이동하지 않는 것: 매질(제자리 진동)</small><br>${fb}`;
  });
};

/* ============ 위상 찾기 ============ */
MG.phase = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 640, 260), x = c.getContext('2d'); const row = mk('div', 'btnrow'); el.appendChild(row);
  const ok = mk('button', 'pri', '확정'); row.appendChild(ok);
  const lam = 170, k = Math.PI * 2 / lam, A = 60, mid = 120; let ri = 0, x0, cands, fb = '', fin = false;
  function setup() { x0 = 30 + Math.random() * 60; cands = []; for (let n = 1; x0 + n * lam / 4 < 625; n++) { cands.push({ n, x: x0 + n * lam / 4, on: false }); } }
  setup();
  const good = cd => cfg.modes[ri] === 'same' ? cd.n % 4 === 0 : cd.n % 4 === 2;
  c.onpointerdown = e => { const p = pos(c, e); cands.forEach(cd => { if (Math.hypot(p.x - cd.x, p.y - (mid - A * Math.sin(k * cd.x))) < 20) cd.on = !cd.on; }); };
  ok.onclick = () => {
    if (fin) return;
    if (cands.every(cd => cd.on === good(cd))) { fb = '<span class="ok">✔ 정확하다.</span>'; ri++; if (ri >= cfg.modes.length) { fin = true; return done(true); } setup(); }
    else { fb = `<span class="no">✖ ${cfg.modes[ri] === 'same' ? '위상이 같은 점: 거리 = (λ/2)×짝수 = λ, 2λ, …' : '위상이 반대인 점: 거리 = (λ/2)×홀수 = λ/2, 3λ/2, …'}</span>`; cands.forEach(cd => cd.on = false); if (L.hit()) { fin = true; done(false); } }
  };
  loop(el, () => {
    if (fin) return; x.clearRect(0, 0, 640, 260); x.strokeStyle = '#3b3150'; x.beginPath(); x.moveTo(0, mid); x.lineTo(640, mid); x.stroke();
    x.strokeStyle = '#e2552b'; x.lineWidth = 2.5; x.beginPath(); for (let X = 0; X <= 640; X += 4) { const y = mid - A * Math.sin(k * X); X ? x.lineTo(X, y) : x.moveTo(X, y); } x.stroke();
    x.fillStyle = '#ffd166'; x.beginPath(); x.arc(x0, mid - A * Math.sin(k * x0), 9, 0, 7); x.fill(); txt(x, '기준 X', x0, mid - A * Math.sin(k * x0) - 14, '#ffd166', 'bold 13px serif', 'center');
    cands.forEach(cd => { const y = mid - A * Math.sin(k * cd.x); x.beginPath(); x.arc(cd.x, y, 9, 0, 7); x.fillStyle = cd.on ? '#6fe3a1' : '#241e30'; x.fill(); x.strokeStyle = '#e8e2d4'; x.lineWidth = 1.5; x.stroke(); txt(x, (cd.n / 4) + 'λ', cd.x, 222 + (cd.n % 2) * 16, '#8a8198', '11px serif', 'center'); });
    txt(x, 'X로부터의 거리 →', 8, 252, '#6d6480', '11px serif');
    h.innerHTML = `<b>[${ri + 1}/${cfg.modes.length}] 기준점 X와 위상이 ${cfg.modes[ri] === 'same' ? '<u>같은</u>' : '<u>반대인</u>'} 점을 모두 골라 확정하라</b><br><small>위상차 180°×짝수 ⇒ 동위상, 180°×홀수 ⇒ 반대 위상 · 거리 (λ/2)×짝수 ⇒ 同, (λ/2)×홀수 ⇒ 反</small><br>${fb}`;
  });
};

/* ============ 고정단·자유단 반사 ============ */
MG.reflect = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 640, 220), x = c.getContext('2d'); const row = mk('div', 'btnrow'); el.appendChild(row);
  const b1 = mk('button', '', '반사파: 뒤집힌다 (위상 180° 반전)'), b2 = mk('button', '', '반사파: 그대로 (위상 변화 없음)'); row.appendChild(b1); row.appendChild(b2);
  let ri = 0, fixed, px, st, ch = null, fin = false, fb = ''; const B = 380, mid = 110;
  function setup() { fixed = Math.random() < .5; px = 40; st = 0; ch = null; }
  setup();
  function pick(inv) { if (fin || st !== 0) return; ch = inv; }
  b1.onclick = () => pick(true); b2.onclick = () => pick(false);
  const pulse = (X, c0, amp, w) => amp * Math.exp(-(((X - c0) / w) ** 2));
  loop(el, dt => {
    if (fin) return;
    if (st === 0) { px += dt * 110; if (px >= B) { st = 1; if (ch === null) { fb = '<span class="no">✖ 경계면에 닿기 전에 선택해야 한다!</span>'; if (L.hit()) { fin = true; return done(false); } } else if (ch === fixed) { fb = `<span class="ok">✔ ${fixed ? '소한→밀한: 고정단 반사, 위상 180° 반전' : '밀한→소한: 자유단 반사, 위상 변화 없음'}. 투과파는 항상 위상 변화 없음.</span>`; ri++; } else { fb = `<span class="no">✖ ${fixed ? '소한 매질 → 밀한 매질 = 고정단 반사 = 위상 180° 반전' : '밀한 매질 → 소한 매질 = 자유단 반사 = 위상 변화 없음'}</span>`; if (L.hit()) { fin = true; return done(false); } } px = 0; } }
    else { px += dt * 110; if (px > 230) { if (ri >= (cfg.rounds || 5)) { fin = true; return done(true); } setup(); } }
    x.clearRect(0, 0, 640, 220);
    x.strokeStyle = '#b08a5a'; const thinL = fixed;
    const yAt = X => { if (st === 0) return X < B ? pulse(X, px, 42, 22) : 0; if (X < B) return (fixed ? -1 : 1) * pulse(X, B - px, 26, 22); return pulse(X, B + px * (fixed ? .6 : 1.5), fixed ? 24 : 34, fixed ? 14 : 30); };
    x.lineWidth = thinL ? 3 : 8; x.beginPath(); for (let X = 10; X <= B; X += 3) { const y = mid - yAt(X); X === 10 ? x.moveTo(X, y) : x.lineTo(X, y); } x.stroke();
    x.lineWidth = thinL ? 8 : 3; x.beginPath(); for (let X = B; X <= 630; X += 3) { const y = mid - yAt(X); X === B ? x.moveTo(X, y) : x.lineTo(X, y); } x.stroke();
    x.setLineDash([4, 4]); x.strokeStyle = '#e2552b'; x.lineWidth = 1; x.beginPath(); x.moveTo(B, 20); x.lineTo(B, 200); x.stroke(); x.setLineDash([]); txt(x, '경계면', B, 214, '#e2552b', '12px serif', 'center');
    txt(x, thinL ? '소한 매질 (속도 빠름)' : '밀한 매질 (속도 느림)', 20, 24); txt(x, thinL ? '밀한 매질 (속도 느림)' : '소한 매질 (속도 빠름)', 420, 24);
    if (st === 0) txt(x, '입사파 →', px, mid - 54, '#ffd166', '13px serif', 'center'); else { txt(x, '← 반사파', B - px, mid - 48, '#ffd166', '13px serif', 'center'); txt(x, '투과파 →', B + px * (fixed ? .6 : 1.5), mid - 48, '#6fe3a1', '13px serif', 'center'); }
    h.innerHTML = `<b>[${Math.min(ri + 1, cfg.rounds || 5)}/${cfg.rounds || 5}] 펄스가 경계면에 닿기 전에 반사파의 모양을 예언하라</b> ${st === 0 ? (ch === null ? '' : `<small>선택: ${ch ? '뒤집힌다' : '그대로'}</small>`) : ''}<br>${fb}`;
  });
};

/* ============ 두 스피커 간섭장 ============ */
MG.field = (cfg, el, done) => {
  const h = hud(el), c = cv(el, 640, 340), x = c.getContext('2d'); const lam = cfg.lam || 60, S1 = { x: 260, y: 310 }, S2 = { x: 380, y: 310 };
  let P = { x: 150, y: 90 }, drag = false, ri = 0, hold = 0, fin = false, t = 0;
  c.onpointerdown = e => { drag = true; c.setPointerCapture(e.pointerId); mv(e); }; c.onpointerup = () => drag = false; c.onpointermove = e => drag && mv(e);
  function mv(e) { const p = pos(c, e); P = { x: Math.max(10, Math.min(630, p.x)), y: Math.max(10, Math.min(280, p.y)) }; }
  loop(el, dt => {
    if (fin) return; t += dt; const d1 = Math.hypot(P.x - S1.x, P.y - S1.y), d2 = Math.hypot(P.x - S2.x, P.y - S2.y), pd = Math.abs(d1 - d2) / (lam / 2);
    const r = cfg.rounds[ri], okk = Math.abs(pd - r.m) < .12 && (r.side == null || Math.abs(P.x - 320) > 8); hold = okk ? hold + dt : 0;
    x.clearRect(0, 0, 640, 340);
    [S1, S2].forEach(s => { for (let i = 0; i < 12; i++) { const rad = ((t * 40) % lam) / 2 + i * lam / 2; x.strokeStyle = i % 2 === (Math.floor(t * 40 / lam * 2) % 2) ? 'rgba(127,178,255,.5)' : 'rgba(127,178,255,.18)'; x.setLineDash(i % 2 ? [4, 5] : []); x.lineWidth = 1.2; x.beginPath(); x.arc(s.x, s.y, rad, Math.PI, Math.PI * 2); x.stroke(); } }); x.setLineDash([]);
    x.strokeStyle = '#3b3150'; x.beginPath(); x.moveTo(320, 0); x.lineTo(320, 340); x.stroke(); txt(x, '중앙', 324, 14, '#6d6480', '11px serif');
    x.strokeStyle = '#ffd166'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(S1.x, S1.y); x.lineTo(P.x, P.y); x.lineTo(S2.x, S2.y); x.stroke();
    txt(x, '🔊', S1.x, S1.y + 16, '#fff', '24px serif', 'center'); txt(x, '🔊', S2.x, S2.y + 16, '#fff', '24px serif', 'center'); txt(x, 'S₁', S1.x - 30, S1.y + 10); txt(x, 'S₂', S2.x + 18, S2.y + 10);
    const amp = Math.abs(Math.cos(pd * Math.PI / 2)); x.fillStyle = `rgba(${255 - amp * 140},${120 + amp * 110},${120})`; x.beginPath(); x.arc(P.x, P.y, 8 + amp * 10, 0, 7); x.fill(); txt(x, 'P (끌어서 이동)', P.x + 20, P.y + 4, '#e8e2d4', '12px serif');
    h.innerHTML = `<b>[${ri + 1}/${cfg.rounds.length}] ${r.text}</b><br><span class="fm" style="display:block;margin:4px 0">경로차 |S₁P − S₂P| = (λ/2)×짝수(2m) ⇒ 보강 · (λ/2)×홀수(2m+1) ⇒ 상쇄 <small>(두 음원이 같은 위상일 때)</small></span>` +
      `S₁P = ${fmt(d1 / lam)}λ , S₂P = ${fmt(d2 / lam)}λ , <b>경로차 = ${fmt(pd)} × (λ/2)</b> · 소리 세기 <span class="gauge"><i style="width:${amp * 100}%"></i></span> ${amp > .92 ? '보강!' : amp < .15 ? '상쇄!' : ''}<br>고정 <span class="gauge"><i style="width:${Math.min(100, hold / 1 * 100)}%"></i></span>`;
    if (hold > 1) { ri++; hold = 0; if (ri >= cfg.rounds.length) { fin = true; done(true); } }
  });
};
