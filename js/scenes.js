'use strict';
/* 만져 보는 애니메이션 장면 + 공식 관계 탐구 */
const SC = {};
const K = { bg1: '#1a1446', bg2: '#2b1d6e', teal: '#2de2c6', pink: '#ff4f9a', yel: '#ffd23f', org: '#ff8a3d', sky: '#4cc3ff', pur: '#9d7bff', wht: '#f4f1ff', dim: '#8f86c9', red: '#ff5470', grn: '#5dfc9b', dark: '#120e33' };
function scv(box, w = 640, h = 300) { const c = mk('canvas', 'cv scn'); c.width = w; c.height = h; box.appendChild(c); return { c, x: c.getContext('2d') }; }
function sbg(x, w, h) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, K.bg1); g.addColorStop(1, K.bg2); x.fillStyle = g; x.fillRect(0, 0, w, h); }
function stx(x, s, px, py, col = K.wht, size = 14, al = 'left', bold = true) { const cw = x.canvas.clientWidth || x.canvas.width, fs = Math.min(1.5, Math.max(1, x.canvas.width / cw / 1.2)); x.fillStyle = col; x.font = `${bold ? 'bold ' : ''}${Math.round(size * fs)}px "Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif`; x.textAlign = al; x.fillText(s, px, py); }
function rrect(x, a, b, w, h, r, col) { x.fillStyle = col; x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); x.fill(); }
function glow(x, X, Y, r, col) { const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(X, Y, r, 0, 7); x.fill(); }
function arrow(x, x0, y0, x1, y1, col, wd = 5) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); if (L < 4) return; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1 - Math.cos(a) * 8, y1 - Math.sin(a) * 8); x.stroke(); x.beginPath(); x.moveTo(x1, y1); x.lineTo(x1 - Math.cos(a - .45) * 14, y1 - Math.sin(a - .45) * 14); x.lineTo(x1 - Math.cos(a + .45) * 14, y1 - Math.sin(a + .45) * 14); x.closePath(); x.fill(); }
function sctl(box) { const d = mk('div', 'sctl'); box.appendChild(d); return d; }
function hold(btn, on, off) { btn.style.touchAction = 'none'; btn.oncontextmenu = e => e.preventDefault(); btn.onpointerdown = e => { on(); try { btn.setPointerCapture(e.pointerId); } catch (_) { } }; btn.onpointerup = btn.onpointercancel = btn.onpointerleave = off; }
function sslider(ctl, label, min, max, step, val, fmtv, cb) { const w = mk('label', 'ssl'), sp = mk('span', '', ''), i = mk('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; const up = () => { sp.innerHTML = `${label} <b>${fmtv ? fmtv(+i.value) : i.value}</b>`; cb(+i.value); }; i.oninput = up; w.appendChild(sp); w.appendChild(i); ctl.appendChild(w); up(); return i; }
function spick(ctl, opts, cur, cb) { const d = mk('div', 'spick'); opts.forEach((o, i) => { const b = mk('button', i === cur ? 'on' : '', o); b.onclick = () => { [...d.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); cb(i); }; d.appendChild(b); }); ctl.appendChild(d); return d; }
function bar(x, X, Y, w, v, max, col, label, val) { rrect(x, X, Y, w, 16, 8, 'rgba(255,255,255,.1)'); const L = Math.max(-1, Math.min(1, v / max)) * w; if (Math.abs(L) > 2) rrect(x, L > 0 ? X : X + L * 0 , Y, Math.abs(L), 16, 8, L > 0 ? col : K.red); stx(x, label, X, Y - 5, col, 13); stx(x, val, X + w, Y - 5, K.wht, 13, 'right'); }

/* ───────── 기체 실린더 ───────── */
SC.gas = (box, o) => {
  const { c, x } = scv(box, 640, 310), ctl = sctl(box), mode = o.mode, CX = 30, CY = 70, CH = 150, VS = 130;
  let V = o.V0 || 1.1, T = 1, heat = 0, drag = false, W = 0, Q = 0, t = 0, path = []; const V00 = V, P0 = T / V;
  const ps = Array.from({ length: 30 }, () => ({ u: Math.random(), v: Math.random(), a: Math.random() * 7 }));
  const reset = () => { V = V00; T = 1; W = 0; Q = 0; path = []; };
  if (mode === 'isochoric' || mode === 'isobaric') { const h = mk('button', 'pri', '🔥 가열 (누르고 있기)'), cl = mk('button', '', '❄️ 냉각'); hold(h, () => heat = 1, () => heat = 0); hold(cl, () => heat = -1, () => heat = 0); ctl.appendChild(h); ctl.appendChild(cl); }
  else ctl.appendChild(mk('span', 'shint', '👉 피스톤(노란 막대)을 좌우로 끌어 보세요'));
  const rb = mk('button', '', '처음으로'); rb.onclick = reset; ctl.appendChild(rb);
  c.style.touchAction = 'none';
  const setV = e => { if (mode === 'isochoric' || mode === 'isobaric') return; const p = pos(c, e), nv = Math.max(.5, Math.min(2.2, (p.x - CX) / VS)); if (mode === 'isothermal') { W += T * Math.log(nv / V); Q = W; } else { const Tn = T * Math.pow(V / nv, 2 / 3); W += -1.5 * (Tn - T); T = Tn; } V = nv; };
  c.onpointerdown = e => { drag = true; try { c.setPointerCapture(e.pointerId); } catch (_) { } setV(e); }; c.onpointermove = e => drag && setV(e); c.onpointerup = () => drag = false;
  loop(box, dt => {
    t += dt;
    if (heat) { const dQ = heat * dt * .7; if (mode === 'isochoric') { if (T + dQ / 1.5 > .35 && T + dQ / 1.5 < 2.6) { T += dQ / 1.5; Q += dQ; } } else { const dT = dQ / 2.5, nv = (T + dT) / P0; if (nv > .5 && nv < 2.2) { T += dT; W += P0 * (nv - V); V = nv; Q += dQ; } } }
    const P = T / V, dU = 1.5 * (T - 1); if (!path.length || Math.hypot(path[path.length - 1][0] - V, path[path.length - 1][1] - P) > .02) path.push([V, P]); if (path.length > 400) path.shift();
    sbg(x, 640, 310); const pw = V * VS, hot = Math.max(0, Math.min(1, (T - .4) / 1.8)), gc = `rgb(${Math.round(60 + hot * 195)},${Math.round(140 - hot * 20)},${Math.round(255 - hot * 190)})`;
    stx(x, '', 0, 0, K.yel, 15); x.fillText(o.title || '', 20, 28, 350);
    rrect(x, CX - 8, CY - 8, 2.2 * VS + 40, CH + 16, 14, 'rgba(255,255,255,.08)'); rrect(x, CX, CY, pw, CH, 8, gc.replace('rgb', 'rgba').replace(')', ',.28)'));
    ps.forEach(p => { const sp = .35 * Math.sqrt(T); p.u += Math.cos(p.a) * sp * dt / Math.max(.5, V); p.v += Math.sin(p.a) * sp * dt; if (p.u < 0 || p.u > 1) { p.a = Math.PI - p.a; p.u = Math.max(0, Math.min(1, p.u)); } if (p.v < 0 || p.v > 1) { p.a = -p.a; p.v = Math.max(0, Math.min(1, p.v)); } const X = CX + 8 + p.u * (pw - 16), Y = CY + 8 + p.v * (CH - 16); glow(x, X, Y, 12, gc.replace('rgb', 'rgba').replace(')', ',.5)')); x.fillStyle = gc; x.beginPath(); x.arc(X, Y, 5, 0, 7); x.fill(); });
    rrect(x, CX + pw, CY - 4, 16, CH + 8, 6, K.yel); rrect(x, CX + pw + 16, CY + CH / 2 - 7, 46, 14, 5, '#c9a227');
    if (mode === 'isochoric') stx(x, '🔒 고정', CX + pw + 22, CY + CH / 2 - 14, K.wht, 13);
    if (heat > 0) for (let i = 0; i < 5; i++) { const fx = CX + 30 + i * 40, fh = 18 + Math.sin(t * 12 + i) * 7; x.fillStyle = i % 2 ? K.org : K.yel; x.beginPath(); x.moveTo(fx - 10, CY + CH + 34); x.quadraticCurveTo(fx, CY + CH + 30 - fh * 1.6, fx + 10, CY + CH + 34); x.fill(); }
    if (heat < 0) stx(x, '❄️ ❄️ ❄️', CX + 60, CY + CH + 32, K.sky, 18);
    stx(x, `압력 P ${fmt(P / P0)}배 · 부피 V ${fmt(V / V00)}배 · 온도 T ${fmt(T)}배`, 20, CY + CH + 62, K.wht, 14);
    // 에너지 막대
    const BX = 390; stx(x, 'Q  =  ΔU  +  W', BX, 28, K.wht, 17);
    bar(x, BX, 58, 220, Q, 2.2, K.org, '받은 열 Q', sgn(Q * 100, 0) + ' J'); bar(x, BX, 100, 220, dU, 2.2, K.pink, '내부 에너지 변화 ΔU (온도)', sgn(dU * 100, 0) + ' J'); bar(x, BX, 142, 220, W, 2.2, K.teal, '한 일 W (부피 변화)', sgn(W * 100, 0) + ' J');
    // 미니 P-V
    const gx = BX, gy = 290, gw = 220, gh = 110; x.strokeStyle = K.dim; x.lineWidth = 2; x.beginPath(); x.moveTo(gx, gy - gh); x.lineTo(gx, gy); x.lineTo(gx + gw, gy); x.stroke(); stx(x, 'P', gx - 14, gy - gh + 10, K.dim, 12); stx(x, 'V', gx + gw - 8, gy + 14, K.dim, 12);
    const GX = v => gx + v / 2.4 * gw, GY = p => gy - Math.min(1, p / (P0 * 2.6)) * gh;
    if (path.length > 1) { x.fillStyle = 'rgba(45,226,198,.22)'; x.beginPath(); x.moveTo(GX(path[0][0]), gy); path.forEach(q => x.lineTo(GX(q[0]), GY(q[1]))); x.lineTo(GX(V), gy); x.fill(); x.strokeStyle = K.teal; x.lineWidth = 3; x.beginPath(); path.forEach((q, i) => i ? x.lineTo(GX(q[0]), GY(q[1])) : x.moveTo(GX(q[0]), GY(q[1]))); x.stroke(); }
    glow(x, GX(V), GY(P), 14, 'rgba(255,210,63,.6)'); x.fillStyle = K.yel; x.beginPath(); x.arc(GX(V), GY(P), 6, 0, 7); x.fill(); stx(x, '넓이 = 한 일', gx + 70, gy - 8, K.teal, 12);
  });
};

/* ───────── 열기관 에너지 흐름 ───────── */
SC.engine = (box, o) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let e = .4, T1 = 400, T2 = 300, t = 0, blobs = [], acc = 0, cnt = [0, 0];
  if (o.mode === 'carnot') { sslider(ctl, '고열원 T₁', 300, 1200, 50, 400, v => v + ' K', v => { T1 = v; e = Math.max(0, 1 - T2 / T1); }); sslider(ctl, '저열원 T₂', 100, 600, 50, 300, v => v + ' K', v => { T2 = v; e = Math.max(0, 1 - T2 / T1); }); }
  else sslider(ctl, '버리는 열 Q₂', 0, 1000, 50, 600, v => v + ' J', v => { e = 1 - v / 1000; });
  loop(box, dt => {
    t += dt; acc += dt * 9; while (acc > 1) { acc--; blobs.push({ p: 0, w: Math.random() < e }); }
    sbg(x, 640, 300); rrect(x, 200, 14, 240, 46, 14, K.red); stx(x, '고열원 (뜨거운 곳)' + (o.mode === 'carnot' ? ` ${T1} K` : ''), 320, 43, K.wht, 15, 'center'); rrect(x, 200, 240, 240, 46, 14, K.sky); stx(x, '저열원 (차가운 곳)' + (o.mode === 'carnot' ? ` ${T2} K` : ''), 320, 269, K.dark, 15, 'center');
    glow(x, 320, 150, 70, 'rgba(255,210,63,.35)'); x.fillStyle = K.yel; x.beginPath(); x.arc(320, 150, 40, 0, 7); x.fill(); x.save(); x.translate(320, 150); x.rotate(t * 2); x.fillStyle = K.dark; for (let i = 0; i < 6; i++) { x.rotate(Math.PI / 3); x.fillRect(-4, -34, 8, 14); } x.restore(); stx(x, '열기관', 320, 155, K.dark, 13, 'center');
    blobs.forEach(b => { b.p += dt * .8; let X, Y, col; if (b.p < 1) { X = 320; Y = 60 + b.p * 60; col = K.org; } else if (b.w) { X = 360 + (b.p - 1) * 200; Y = 150; col = K.grn; } else { X = 320; Y = 190 + (b.p - 1) * 60; col = K.sky; } glow(x, X, Y, 14, col + '88'); x.fillStyle = col; x.beginPath(); x.arc(X, Y, 6, 0, 7); x.fill(); });
    blobs = blobs.filter(b => b.p < 2);
    arrow(x, 480, 150, 600, 150, K.grn, 6); stx(x, '일 W', 540, 136, K.grn, 15, 'center');
    stx(x, 'Q₁ 받은 열', 190, 100, K.org, 14, 'right'); stx(x, 'Q₂ 버린 열', 190, 220, K.sky, 14, 'right');
    const q2 = Math.round((1 - e) * 1000);
    if (o.mode === 'carnot') { stx(x, `e = 1 − T₂/T₁ = 1 − ${T2}/${T1}`, 20, 150, K.wht, 14); stx(x, `= ${fmt(e, 3)}`, 20, 176, K.yel, 22); if (T2 >= T1) stx(x, '온도 차가 없으면 일을 못 해요!', 20, 204, K.red, 13); }
    else { stx(x, `1000 J 중 ${1000 - q2} J이 일`, 20, 140, K.wht, 14); stx(x, `e = W/Q₁ = ${fmt(e)}`, 20, 170, K.yel, 22); if (q2 === 0) stx(x, 'Q₂ = 0 ? 불가능! (제2법칙)', 20, 198, K.red, 13); }
  });
};

/* ───────── 순환 과정 따라가기 ───────── */
const CYC = {
  ex02: { pts: [[2, 2], [2, 4], [4, 4], [8, 2]], e: [0, 0, 1, 0], lab: ['A→B 등적: 부피 그대로, 열을 받아 온도↑', 'B→C 등압 팽창: 열을 받아 일도 하고 온도도↑', 'C→D 등온 팽창: 받은 열 전부 일로', 'D→A 등압 압축: 일을 받고 열을 내보냄'], n: 'ABCD' },
  carnot: { pts: [[1, 8], [2, 4], [3.2, 1.83], [1.6, 3.66]], e: [1, 1.667, 1, 1.667], lab: ['① 등온 팽창: 뜨거운 온도 유지, 열 Q₁ 흡수', '② 단열 팽창: 열 차단, 식으면서 팽창', '③ 등온 압축: 차가운 온도 유지, 열 Q₂ 방출', '④ 단열 압축: 열 차단, 다시 뜨거워짐'], n: 'ABCD' },
  stirling: { pts: [[1, 3], [1, 8], [3, 2.67], [3, 1]], e: [0, 1, 0, 1], lab: ['등적 가열: 열 흡수 (수직선 ↑)', '등온 팽창: 열 흡수 (곡선 →)', '등적 냉각: 열 방출 (수직선 ↓)', '등온 압축: 열 방출 (곡선 ←)'], n: 'ABCD' },
  gasoline: { pts: [[1, 4], [1, 9], [3, 1.44], [3, .64]], e: [0, 1.667, 0, 1.667], lab: ['등적: 점화! 폭발하며 열 흡수', '단열 팽창: 피스톤을 밀며 일을 함', '등적: 배기, 열 방출', '단열 압축: 다시 눌러 담음'], n: 'ABCD' },
  diesel: { pts: [[1, 8], [1.6, 8], [4, 1.74], [4, .8]], e: [0, 1.667, 0, 1.667], lab: ['등압 팽창: 연료 분사, 타면서 열 흡수 (수평선)', '단열 팽창: 일을 함', '등적: 배기, 열 방출', '단열 압축: 공기를 뜨겁게 압축'], n: 'ABCD' }
};
SC.cycle = (box, o) => {
  const { c, x } = scv(box, 640, 300), cy = CYC[o.cy], n = cy.pts.length, ctl = sctl(box); let seg = 0, f = 0, run = true;
  const vs = cy.pts.map(p => p[0]), psx = cy.pts.map(p => p[1]), v0 = Math.min(...vs), v1 = Math.max(...vs), p1 = Math.max(...psx);
  const X = v => 70 + (v - v0) / (v1 - v0) * 300, Y = p => 260 - p / p1 * 210;
  const at = (i, u) => { const a = cy.pts[i], b = cy.pts[(i + 1) % n], v = a[0] + (b[0] - a[0]) * u; let p; if (a[0] === b[0]) p = a[1] + (b[1] - a[1]) * u; else if (cy.e[i]) { const ex = Math.log(b[1] / a[1]) / Math.log(a[0] / b[0]); p = a[1] * Math.pow(a[0] / v, ex); } else p = a[1] + (b[1] - a[1]) * u; return [v, p]; };
  const pb = mk('button', 'pri', '⏸ 멈춤'); pb.onclick = () => { run = !run; pb.textContent = run ? '⏸ 멈춤' : '▶ 재생'; }; const nb = mk('button', '', '다음 구간 ▶'); nb.onclick = () => { seg = (seg + 1) % n; f = 0; }; ctl.appendChild(pb); ctl.appendChild(nb);
  loop(box, dt => {
    if (run) { f += dt * .45; if (f >= 1) { f = 0; seg = (seg + 1) % n; } }
    sbg(x, 640, 300); x.strokeStyle = K.dim; x.lineWidth = 2; x.beginPath(); x.moveTo(50, 30); x.lineTo(50, 270); x.lineTo(400, 270); x.stroke(); stx(x, '압력', 14, 36, K.dim, 12); stx(x, '부피', 372, 288, K.dim, 12);
    x.fillStyle = 'rgba(45,226,198,.14)'; x.beginPath(); for (let i = 0; i < n; i++) for (let u = 0; u <= 1; u += .05) { const q = at(i, u); x.lineTo(X(q[0]), Y(q[1])); } x.fill();
    for (let i = 0; i < n; i++) { x.strokeStyle = i === seg ? K.yel : 'rgba(255,255,255,.3)'; x.lineWidth = i === seg ? 6 : 3; x.beginPath(); for (let u = 0; u <= 1.001; u += .05) { const q = at(i, u); u ? x.lineTo(X(q[0]), Y(q[1])) : x.moveTo(X(q[0]), Y(q[1])); } x.stroke(); const a = cy.pts[i]; x.fillStyle = K.wht; x.beginPath(); x.arc(X(a[0]), Y(a[1]), 5, 0, 7); x.fill(); stx(x, cy.n[i], X(a[0]) - 18, Y(a[1]) - 8, K.wht, 14); }
    const q = at(seg, f); glow(x, X(q[0]), Y(q[1]), 22, 'rgba(255,79,154,.7)'); x.fillStyle = K.pink; x.beginPath(); x.arc(X(q[0]), Y(q[1]), 9, 0, 7); x.fill();
    stx(x, '둘러싸인 넓이 = 한 일', 120, 250, K.teal, 12);
    // 오른쪽: 피스톤 미니 + 설명
    const pw = 40 + (q[0] - v0) / (v1 - v0) * 130, T = q[0] * q[1], Tm = Math.max(...cy.pts.map(p => p[0] * p[1])), hot = T / Tm;
    rrect(x, 430, 40, 190, 70, 10, 'rgba(255,255,255,.08)'); rrect(x, 434, 44, pw, 62, 8, `rgba(${Math.round(60 + hot * 195)},120,${Math.round(255 - hot * 190)},.6)`); rrect(x, 434 + pw, 42, 10, 66, 4, K.yel);
    stx(x, `온도 ${'🔥'.repeat(Math.max(1, Math.round(hot * 3)))}`, 430, 136, K.org, 14);
    const words = cy.lab[seg].split(': '); stx(x, words[0], 430, 176, K.yel, 17); (words[1] || '').split(', ').forEach((s, i) => stx(x, s, 430, 202 + i * 22, K.wht, 13, 'left', false));
  });
};

/* ───────── 확산 ───────── */
SC.diffusion = (box) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let N = 4, open = false, ps = [], hist = [], t = 0; const mid = 320, top = 40, H = 170;
  const init = () => { ps = Array.from({ length: N }, () => ({ x: 30 + Math.random() * 260, y: top + 10 + Math.random() * (H - 20), a: Math.random() * 7 })); hist = []; t = 0; open = false; gb.textContent = '🚪 칸막이 열기'; };
  spick(ctl, ['분자 4개', '분자 40개'], 0, i => { N = i ? 40 : 4; init(); }); const gb = mk('button', 'pri', ''); gb.onclick = () => { open = !open; gb.textContent = open ? '🚪 칸막이 닫기' : '🚪 칸막이 열기'; }; ctl.appendChild(gb); init();
  loop(box, dt => {
    t += dt; ps.forEach(p => { const nx = p.x + Math.cos(p.a) * 130 * dt, ny = p.y + Math.sin(p.a) * 130 * dt; if (ny < top + 6 || ny > top + H - 6) p.a = -p.a; else p.y = ny; if ((p.x - mid) * (nx - mid) <= 0 && !open) p.a = Math.PI - p.a; else if (nx < 26 || nx > 614) p.a = Math.PI - p.a; else p.x = nx; });
    const nA = ps.filter(p => p.x < mid).length; if (Math.floor(t * 8) > hist.length && hist.length < 300) hist.push(nA);
    sbg(x, 640, 300); rrect(x, 20, top, 600, H, 12, 'rgba(255,255,255,.08)'); if (!open) rrect(x, mid - 4, top, 8, H, 4, K.yel); else { rrect(x, mid - 4, top, 8, 30, 4, K.yel); rrect(x, mid - 4, top + H - 30, 8, 30, 4, K.yel); }
    stx(x, 'A', 34, top + 24, K.wht, 18); stx(x, 'B', 594, top + 24, K.wht, 18);
    ps.forEach(p => { glow(x, p.x, p.y, 14, 'rgba(157,123,255,.6)'); x.fillStyle = K.pur; x.beginPath(); x.arc(p.x, p.y, 6, 0, 7); x.fill(); });
    stx(x, `A에 ${nA}개 · B에 ${N - nA}개`, 20, 240, K.wht, 15); stx(x, `전부 A에 있을 확률 = (1/2)^${N} = ${N === 4 ? '1/16' : '약 1조분의 1'}`, 20, 264, K.yel, 15);
    stx(x, nA === N && open ? '✨ 전부 A에! (4개면 가끔 일어나요)' : N === 40 && open ? '40개가 전부 돌아오는 건… 기다려도 안 와요' : '', 20, 288, K.teal, 13);
    x.strokeStyle = K.pink; x.lineWidth = 2; x.beginPath(); hist.forEach((v, i) => { const X = 420 + i * .66, Y = 288 - v / N * 50; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); stx(x, 'A의 분자 수 →시간', 420, 232, K.dim, 11, 'left', false);
  });
};

/* ───────── 열의 이동과 엔트로피 ───────── */
SC.heatflow = (box) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let TH = 400, TL = 300, t = 0; const Q = 1200;
  sslider(ctl, '왼쪽 온도', 200, 600, 50, 400, v => v + ' K', v => TH = v); sslider(ctl, '오른쪽 온도', 200, 600, 50, 300, v => v + ' K', v => TL = v);
  const col = T => `rgb(${Math.round(60 + (T - 200) / 400 * 195)},${Math.round(110 - (T - 200) / 400 * 30)},${Math.round(255 - (T - 200) / 400 * 190)})`;
  loop(box, dt => {
    t += dt; sbg(x, 640, 300); rrect(x, 40, 30, 200, 120, 16, col(TH)); rrect(x, 400, 30, 200, 120, 16, col(TL)); stx(x, TH + ' K', 140, 98, K.wht, 26, 'center'); stx(x, TL + ' K', 500, 98, K.wht, 26, 'center');
    const d = Math.sign(TH - TL); if (d) for (let i = 0; i < 5; i++) { const p = ((t * .6 + i / 5) % 1), X = d > 0 ? 250 + p * 140 : 390 - p * 140; glow(x, X, 90 + Math.sin(i * 2 + t * 3) * 14, 14, 'rgba(255,138,61,.7)'); x.fillStyle = K.org; x.beginPath(); x.arc(X, 90 + Math.sin(i * 2 + t * 3) * 14, 6, 0, 7); x.fill(); }
    stx(x, d > 0 ? '열 Q →' : d < 0 ? '← 열 Q' : '열평형 (이동 없음)', 320, 46, K.yel, 15, 'center');
    const hot = Math.max(TH, TL), cold = Math.min(TH, TL), s1 = d ? -Q / hot : 0, s2 = d ? Q / cold : 0;
    bar(x, 60, 196, 240, s1, 6, K.sky, `뜨거운 쪽: −Q/T = −1200/${hot}`, fmt(s1) + ' J/K'); bar(x, 60, 240, 240, s2, 6, K.org, `차가운 쪽: +Q/T = +1200/${cold}`, '+' + fmt(s2) + ' J/K');
    stx(x, '전체 엔트로피 변화', 360, 200, K.wht, 14); stx(x, (s1 + s2 > 0 ? '+' : '') + fmt(s1 + s2) + ' J/K', 360, 240, s1 + s2 > 0 ? K.grn : K.dim, 30); stx(x, d ? '항상 플러스! (차가운 쪽이 더 많이 늘어요)' : '온도가 같으면 변화 없음', 360, 268, K.teal, 12, 'left', false);
  });
};

/* ───────── 용수철 단진동 ───────── */
SC.shm = (box, o) => {
  const { c, x } = scv(box, 640, 300), ctl = sctl(box); let m = 1, k = 25, A = 90, ph = 0, drag = false, xx = 90, t = 0; const OX = 400, SY = 230;
  if (o.sliders) { sslider(ctl, '질량 m', 1, 9, 1, 1, v => v + ' kg', v => m = v); sslider(ctl, '용수철 상수 k', 25, 225, 25, 25, v => v + ' N/m', v => k = v); }
  ctl.appendChild(mk('span', 'shint', '👉 추를 잡아끌었다 놓아 보세요'));
  c.style.touchAction = 'none'; const mv = e => { const p = pos(c, e); xx = Math.max(-130, Math.min(130, p.x - OX)); };
  c.onpointerdown = e => { drag = true; try { c.setPointerCapture(e.pointerId); } catch (_) { } mv(e); }; c.onpointermove = e => drag && mv(e); c.onpointerup = () => { if (drag) { drag = false; A = Math.abs(xx) || 1; ph = xx >= 0 ? Math.PI / 2 : -Math.PI / 2; } };
  loop(box, dt => {
    const w = Math.sqrt(k / m) * .5; t += dt; if (!drag) { ph += w * dt; xx = A * Math.sin(ph); }
    const s = xx / 130, vv = drag ? 0 : Math.cos(ph) * A / 130, Tper = 2 * Math.PI * Math.sqrt(m / k);
    sbg(x, 640, 300);
    if (o.circle) { const cx = 120, cy = 110, R = A * .6; x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); const px = cx + R * Math.sin(ph), py = cy - R * Math.cos(ph); x.strokeStyle = K.pink; x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke(); glow(x, px, py, 14, 'rgba(255,79,154,.7)'); x.fillStyle = K.pink; x.beginPath(); x.arc(px, py, 7, 0, 7); x.fill(); x.setLineDash([4, 5]); x.strokeStyle = K.dim; x.beginPath(); x.moveTo(px, py); x.lineTo(px, SY - 30); x.stroke(); x.setLineDash([]); stx(x, '원운동을 옆에서 보면…', 30, 30, K.wht, 13); stx(x, '↓ 그림자가 단진동', 40, 205, K.pink, 12); const bx = cx + R * Math.sin(ph); x.fillStyle = 'rgba(255,79,154,.5)'; x.beginPath(); x.arc(bx, SY - 22, 6, 0, 7); x.fill(); }
    else { const bar2 = (lab, v, yy, col) => { stx(x, lab, 24, yy + 5, col, 13); rrect(x, 110, yy - 7, 160, 14, 7, 'rgba(255,255,255,.1)'); rrect(x, v > 0 ? 190 : 190 + v * 80, yy - 7, Math.abs(v) * 80 + 1, 14, 7, col); x.fillStyle = K.wht; x.fillRect(189, yy - 10, 2, 20); }; bar2('위치 x', s, 40, K.yel); bar2('속도 v', vv, 72, K.grn); bar2('힘 F·가속도', -s, 104, K.red); stx(x, Math.abs(s) < .12 ? '가운데: 가장 빠르고 힘은 0' : Math.abs(s) > .88 * A / 130 && !drag ? '끝: 멈추고 힘이 최대' : '', 24, 140, K.teal, 13); }
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(250, SY + 22, 380, 6); rrect(x, 250, SY - 40, 12, 68, 4, K.dim);
    x.strokeStyle = K.sky; x.lineWidth = 3; x.beginPath(); x.moveTo(262, SY); const n = 18, ex = OX + xx - 24; for (let i = 1; i <= n; i++) x.lineTo(262 + (ex - 262) * i / n, SY + (i % 2 ? -12 : 12) * (i < n ? 1 : 0)); x.stroke();
    glow(x, OX + xx, SY, 34, 'rgba(255,210,63,.35)'); rrect(x, OX + xx - 24, SY - 24, 48, 46, 10, K.yel); stx(x, m + 'kg', OX + xx, SY + 5, K.dark, 12, 'center');
    x.setLineDash([4, 5]); x.strokeStyle = K.dim; x.lineWidth = 1.5; x.beginPath(); x.moveTo(OX, SY - 60); x.lineTo(OX, SY + 22); x.stroke(); x.setLineDash([]); stx(x, '평형점 O', OX, SY - 66, K.dim, 12, 'center');
    arrow(x, OX + xx, SY - 40, OX + xx - s * 90, SY - 40, K.red, 5); if (Math.abs(s) > .08) stx(x, '복원력', OX + xx - s * 45, SY - 50, K.red, 12, 'center');
    if (!drag) arrow(x, OX + xx, SY + 44, OX + xx + vv * 70, SY + 44, K.grn, 4);
    if (o.sliders) { stx(x, `T = 2π√(m/k) = 2π√(${m}/${k})`, 300, 40, K.wht, 15); stx(x, `= ${fmt(Tper, 2)} 초`, 300, 72, K.yel, 26); stx(x, '당긴 거리를 바꿔도 주기는 그대로!', 300, 100, K.teal, 13); }
  });
};

/* ───────── 파동 (횡파/종파) ───────── */
SC.wave = (box, o) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let f = 1, lon = o.lon ? 1 : 0, t = 0; const v = 120, N = 42;
  if (o.modes) spick(ctl, ['횡파 (위아래로 흔들기)', '종파 (앞뒤로 흔들기)'], lon, i => lon = i);
  if (o.fs) sslider(ctl, '흔드는 빠르기(진동수 f)', 1, 3, .5, 1, vv => vv + ' Hz', vv => f = vv);
  loop(box, dt => {
    t += dt * .6; sbg(x, 640, 300); const lam = v / f, kk = 2 * Math.PI / lam, om = 2 * Math.PI * f, mid = 140;
    stx(x, '진행 방향 →', 320, 28, K.yel, 15, 'center');
    for (let i = 0; i < N; i++) { const X0 = 30 + i * 14, d = 30 * Math.sin(kk * X0 - om * t), hi = i === 12; let X = X0, Y = mid; if (lon) X = X0 + d * .55; else Y = mid - d; if (hi) { x.strokeStyle = 'rgba(255,210,63,.5)'; x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); if (lon) { x.moveTo(X0 - 22, mid); x.lineTo(X0 + 22, mid); } else { x.moveTo(X0, mid - 40); x.lineTo(X0, mid + 40); } x.stroke(); x.setLineDash([]); glow(x, X, Y, 18, 'rgba(255,210,63,.6)'); } x.fillStyle = hi ? K.yel : lon ? K.pink : K.sky; x.beginPath(); x.arc(X, Y, hi ? 8 : 5, 0, 7); x.fill(); if (lon) { x.fillStyle = 'rgba(255,79,154,.18)'; x.fillRect(X - 1, mid - 46, 2, 92); } }
    stx(x, lon ? '노란 점(매질)은 제자리에서 앞뒤로만!' : '노란 점(매질)은 제자리에서 위아래로만!', 30, 216, K.yel, 14);
    if (lon) stx(x, '빽빽한 곳 = 밀, 성긴 곳 = 소. 밀~밀 = 파장 λ', 30, 240, K.wht, 13, 'left', false);
    if (o.labels && !lon) { const ph = (om * t / kk) % lam, cx = 30 + ((lam / 4 + ph) % lam) + lam; arrow(x, cx, 206, cx + lam, 206, K.teal, 3); stx(x, '파장 λ', cx + lam / 2, 200, K.teal, 13, 'center'); stx(x, '마루 ↑ / 골 ↓ / 높이 = 진폭 A', 320, 240, K.wht, 13, 'left', false); }
    if (o.fs) { stx(x, `v = f × λ = ${f} × ${fmt(lam / 2, 0)} = ${fmt(v / 2, 0)} cm/s`, 30, 268, K.wht, 15); stx(x, '빨리 흔들면 파장만 짧아지고 속력은 그대로!', 30, 290, K.teal, 12, 'left', false); }
  });
};

/* ───────── 반사 ───────── */
SC.reflect = (box) => {
  const { x } = scv(box, 640, 240), ctl = sctl(box); let fixed = 1, p = 0; spick(ctl, ['가는 줄 → 굵은 줄 (고정단)', '굵은 줄 → 가는 줄 (자유단)'], 0, i => { fixed = i ? 0 : 1; p = 0; });
  const B = 380, mid = 120, pul = (X, c0, a, w) => a * Math.exp(-(((X - c0) / w) ** 2));
  loop(box, dt => {
    p += dt * 130; if (p > B + 330) p = 0; sbg(x, 640, 240); const back = p > B, q = p - B;
    const y = X => { if (!back) return X < B ? pul(X, p, 44, 24) : 0; if (X < B) return (fixed ? -1 : 1) * pul(X, B - q, 30, 24); return pul(X, B + q * (fixed ? .6 : 1.5), fixed ? 22 : 34, fixed ? 15 : 32); };
    x.strokeStyle = K.org; x.lineCap = 'round'; x.lineWidth = fixed ? 4 : 10; x.beginPath(); for (let X = 10; X <= B; X += 3) X === 10 ? x.moveTo(X, mid - y(X)) : x.lineTo(X, mid - y(X)); x.stroke(); x.lineWidth = fixed ? 10 : 4; x.beginPath(); for (let X = B; X <= 630; X += 3) X === B ? x.moveTo(X, mid - y(X)) : x.lineTo(X, mid - y(X)); x.stroke();
    x.fillStyle = K.pink; x.fillRect(B - 1.5, 30, 3, 180); stx(x, '경계', B, 226, K.pink, 12, 'center');
    stx(x, back ? (fixed ? '반사파가 뒤집혔어요! (위상 180° 반전)' : '반사파가 그대로 돌아와요 (위상 변화 없음)') : '입사파가 다가갑니다 →', 20, 28, K.yel, 15); if (back) stx(x, '투과파는 항상 안 뒤집혀요', 420, 28, K.teal, 12);
  });
};

/* ───────── 간섭 ───────── */
SC.interf = (box, o) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let ph = 0, t = 0;
  if (o.mode === 'path') sslider(ctl, '경로차', 0, 4, .5, 0, v => `(λ/2) × ${v}`, v => ph = v * Math.PI); else sslider(ctl, '두 파동의 위상 차이', 0, 360, 30, 0, v => v + '°', v => ph = v * Math.PI / 180);
  loop(box, dt => {
    t += dt; sbg(x, 640, 300); const rows = [60, 140, 235], k = 2 * Math.PI / 150, fa = X => 26 * Math.sin(k * X - t * 2.4), fb = X => 26 * Math.sin(k * X - t * 2.4 + ph);
    [[fa, K.pink, '파동 A'], [fb, K.sky, '파동 B'], [X => fa(X) + fb(X), K.yel, 'A + B']].forEach(([f, col, lab], i) => { x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1; x.beginPath(); x.moveTo(90, rows[i]); x.lineTo(630, rows[i]); x.stroke(); x.strokeStyle = col; x.lineWidth = i === 2 ? 5 : 3; x.beginPath(); for (let X = 90; X <= 630; X += 4) X === 90 ? x.moveTo(X, rows[i] - f(X)) : x.lineTo(X, rows[i] - f(X)); x.stroke(); stx(x, lab, 14, rows[i] + 5, col, 14); });
    const amp = Math.abs(2 * Math.cos(ph / 2)); stx(x, amp > 1.9 ? '보강 간섭! 진폭 2배 🔊' : amp < .1 ? '상쇄 간섭! 진폭 0 🔇' : `합성파 진폭 ${fmt(amp, 1)}배`, 320, 26, amp > 1.9 ? K.grn : amp < .1 ? K.red : K.wht, 17, 'center');
    if (o.mode === 'path') stx(x, '짝수 배(0, 2, 4) → 보강 · 홀수 배(1, 3) → 상쇄', 320, 292, K.teal, 13, 'center');
  });
};

/* ───────── 정상파 ───────── */
SC.standing = (box, o) => {
  const { x } = scv(box, 640, 300), ctl = sctl(box); let ty = o.ty != null ? o.ty : (o.start || 0), n = 1, t = 0, y = 5; const tube = o.tube;
  if (tube) sslider(ctl, '수면 내리기', 2, 80, .5, 5, v => v + ' cm', v => y = v);
  else { if (o.ty == null) spick(ctl, ['줄 (양 끝 고정)', '양쪽 열린 관', '한쪽 막힌 관'], ty, i => { ty = i; n = 1; mkn(); }); var nrow = mk('div', 'spick'); ctl.appendChild(nrow); var mkn = () => { nrow.innerHTML = ''; (ty === 2 ? [1, 3, 5] : [1, 2, 3, 4]).forEach(k => { const b = mk('button', k === n ? 'on' : '', k === 1 ? '기본 진동' : k + '배 진동'); b.onclick = () => { n = k; mkn(); }; nrow.appendChild(b); }); }; mkn(); }
  loop(box, dt => {
    t += dt; sbg(x, 640, 300); const ph = Math.cos(t * 5);
    if (tube) { const lam = 50, top = 30, sc = 2.9, yw = top + y * sc; let best = 0, bn = 1; for (let kq = 0; kq < 4; kq++) { const d = (y - (2 * kq + 1) * lam / 4) / 1.6, l = 1 / (1 + d * d); if (l > best) { best = l; bn = 2 * kq + 1; } }
      rrect(x, 270, top, 8, 262, 3, K.dim); rrect(x, 342, top, 8, 262, 3, K.dim); rrect(x, 278, yw, 64, 292 - yw, 4, K.sky); stx(x, '🔔 680 Hz 소리굽쇠', 310, 20, K.yel, 14, 'center'); stx(x, `깊이 ${fmt(y, 1)} cm`, 360, yw + 5, K.sky, 14);
      if (best > .4) { x.strokeStyle = `rgba(255,79,154,${best})`; x.lineWidth = 3;[ph, -ph].forEach(p => { x.beginPath(); for (let i = 0; i <= 50; i++) { const yy = top + (yw - top) * i / 50, dx = 26 * p * Math.cos(bn * Math.PI / 2 * i / 50); i ? x.lineTo(310 + dx, yy) : x.moveTo(310 + dx, yy); } x.stroke(); }); }
      stx(x, '소리 크기', 40, 60, K.wht, 14); rrect(x, 40, 72, 34, 170, 10, 'rgba(255,255,255,.1)'); rrect(x, 40, 242 - 170 * best, 34, 170 * best, 10, best > .93 ? K.grn : K.yel); if (best > .93) stx(x, '공명!', 84, 100, K.grn, 20);
      stx(x, 'λ = 340 ÷ 680 = 50 cm', 440, 80, K.wht, 14); stx(x, '공명 깊이:', 440, 110, K.wht, 14);['λ/4 = 12.5 cm', '3λ/4 = 37.5 cm', '5λ/4 = 62.5 cm'].forEach((s, i) => stx(x, s, 440, 136 + i * 24, Math.abs(y - (12.5 + i * 25)) < 1 ? K.grn : K.dim, 14)); stx(x, '간격은 λ/2 = 25 cm', 440, 222, K.teal, 13); return; }
    const X0 = 60, L = 520, mid = 130, env = s => ty === 0 ? Math.sin(n * Math.PI * s) : ty === 1 ? Math.cos(n * Math.PI * s) : Math.cos(n * Math.PI * s / 2);
    if (ty === 0) { rrect(x, X0 - 10, mid - 50, 10, 100, 4, K.dim); rrect(x, X0 + L, mid - 50, 10, 100, 4, K.dim); } else { rrect(x, X0, mid - 52, L, 6, 3, K.dim); rrect(x, X0, mid + 46, L, 6, 3, K.dim); if (ty === 2) rrect(x, X0 + L, mid - 52, 8, 104, 3, K.dim); }
    [[ph, K.pink, 4], [-ph, 'rgba(255,79,154,.3)', 2]].forEach(([p, col, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); for (let i = 0; i <= 100; i++) { const X = X0 + L * i / 100, Y = mid - 40 * p * env(i / 100); i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); });
    for (let i = 0; i <= 200; i++) { const s = i / 200, e = Math.abs(env(s)); if (e < .012) { x.fillStyle = K.sky; x.beginPath(); x.arc(X0 + L * s, mid, 6, 0, 7); x.fill(); stx(x, '마디', X0 + L * s, mid + 76, K.sky, 12, 'center'); i += 6; } else if (e > .9995) { stx(x, '배', X0 + L * s, mid - 62, K.yel, 12, 'center'); i += 6; } }
    const lamk = ty === 2 ? 4 / n : 2 / n, vv = ty === 0 ? 100 : 340; stx(x, `길이 l = 1 m 안에 ${ty === 2 ? 'λ/4가 ' + n + '개' : 'λ/2가 ' + n + '개'}`, 60, 232, K.wht, 15); stx(x, `λ = ${ty === 2 ? '4l' : '2l'}/${n} = ${fmt(lamk, 2)} m`, 60, 258, K.teal, 15); stx(x, `f = v/λ = ${vv} ÷ ${fmt(lamk, 2)} = ${fmt(vv / lamk, 0)} Hz`, 60, 284, K.yel, 16); if (ty === 2) stx(x, '막힌 관은 홀수 배만!', 430, 258, K.red, 13);
  });
};

/* ───────── 공식 관계 탐구 ───────── */
const RELS = {
  PFA: { eq: 'P = F ÷ A', out: ['압력 P', 'N/m²', v => v.F / v.A], vars: [['F', '힘 F', 400, 'N'], ['A', '넓이 A', 2, 'm²']] },
  WPV: { eq: 'W = P × ΔV', out: ['한 일 W', 'J', v => v.P * v.V], vars: [['P', '압력 P', 200, 'N/m²'], ['V', '부피 변화 ΔV', 3, 'm³']] },
  U: { eq: 'U = (3/2) × n × R × T', out: ['내부 에너지 U', 'J', v => 1.5 * v.n * 8.3 * v.T], vars: [['n', '몰수 n', 1, 'mol'], ['T', '절대 온도 T', 400, 'K']] },
  GAS: { eq: 'V = n R T ÷ P  (PV = nRT)', out: ['부피 V', '', v => v.T / v.P], vars: [['P', '압력 P', 1, '기압'], ['T', '절대 온도 T', 300, 'K']] },
  GASP: { eq: 'P = n R T ÷ V', out: ['압력 P', '', v => v.T / v.V], vars: [['V', '부피 V', 1, 'L'], ['T', '절대 온도 T', 300, 'K']] },
  EFF: { eq: 'e = W ÷ Q₁', out: ['열효율 e', '', v => v.W / v.Q], vars: [['W', '한 일 W', 400, 'J'], ['Q', '받은 열 Q₁', 1000, 'J']] },
  S: { eq: 'ΔS = Q ÷ T', out: ['엔트로피 변화 ΔS', 'J/K', v => v.Q / v.T], vars: [['Q', '받은 열 Q', 600, 'J'], ['T', '절대 온도 T', 300, 'K']] },
  FKX: { eq: 'F = k × x  (크기)', out: ['탄성력 F', 'N', v => v.k * v.x], vars: [['k', '용수철 상수 k', 25, 'N/m'], ['x', '늘어난 길이 x', .4, 'm']] },
  TMK: { eq: 'T = 2π √(m ÷ k)', out: ['주기 T', '초', v => 2 * Math.PI * Math.sqrt(v.m / v.k)], vars: [['m', '질량 m', 1, 'kg'], ['k', '용수철 상수 k', 25, 'N/m']] },
  VFL: { eq: 'v = f × λ   →   λ = v ÷ f', out: ['파장 λ', 'cm', v => v.v / v.f], vars: [['f', '진동수 f', 1, 'Hz'], ['v', '속력 v (매질이 정함)', 60, 'cm/s']] },
  VTM: { eq: 'v = √(T ÷ μ)', out: ['줄 파동의 속력 v', 'm/s', v => Math.sqrt(v.T / v.mu)], vars: [['T', '장력 T', 100, 'N'], ['mu', '선밀도 μ', .01, 'kg/m']] },
  FN: { eq: 'f = n × v ÷ (2 l)', out: ['진동수 f', 'Hz', v => v.n * v.v / (2 * v.l)], vars: [['n', '배진동 n', 1, ''], ['l', '줄 길이 l', 1, 'm'], ['v', '속력 v', 100, 'm/s']] }
};
function REL(box, o) {
  const R = RELS[o.rel], v0 = {}, v = {}; R.vars.forEach(a => { v0[a[0]] = a[2]; v[a[0]] = a[2]; }); const base = R.out[2](v0);
  const w = mk('div', 'rel'); box.appendChild(w); w.appendChild(mk('div', 'releq', '🔍 공식 관계 탐구 &nbsp; <b>' + R.eq + '</b>')); const rows = mk('div'), outd = mk('div', 'relout'), msg = mk('div', 'relmsg', '버튼을 눌러 하나만 바꿔 보세요. 결과가 어떻게 변하나요?'); w.appendChild(rows); w.appendChild(outd); w.appendChild(msg);
  const say = (name, k, before) => { const r = R.out[2](v) / before, near = (a, b) => Math.abs(a - b) < .01; let s; if (near(r, k)) s = `${k > 1 ? k + '배' : '절반'}가 돼요 → <b>비례</b> 관계`; else if (near(r, 1 / k)) s = `${k > 1 ? '절반' : '2배'}이 돼요 → <b>반비례</b> 관계`; else if (near(r, Math.sqrt(k))) s = `√2 ≈ ${k > 1 ? '1.41' : '0.71'}배 → <b>제곱근(√)에 비례</b>. 2배로 만들려면 4배가 필요해요`; else if (near(r, 1 / Math.sqrt(k))) s = `${k > 1 ? '약 0.71' : '약 1.41'}배 → <b>제곱근(√)에 반비례</b>`; else if (near(r, 1)) s = '변하지 않아요'; else s = fmt(r) + '배가 돼요'; msg.innerHTML = `<b>${name}</b>을(를) ${k > 1 ? '2배' : '절반'}으로 → <b>${R.out[0]}</b>은(는) ${s}`; };
  const draw = () => {
    rows.innerHTML = ''; R.vars.forEach(a => { const r = mk('div', 'relrow'), ratio = v[a[0]] / v0[a[0]]; r.appendChild(mk('span', 'rn', a[1])); const dn = mk('button', '', '÷2'), up = mk('button', '', '×2'); dn.onclick = () => { if (ratio <= .26) return; const b = R.out[2](v); v[a[0]] /= 2; draw(); say(a[1], .5, b); }; up.onclick = () => { if (ratio >= 3.9) return; const b = R.out[2](v); v[a[0]] *= 2; draw(); say(a[1], 2, b); }; r.appendChild(dn); const bw = mk('span', 'rbar', `<i style="width:${Math.min(100, ratio * 25)}%"></i>`); r.appendChild(bw); r.appendChild(up); r.appendChild(mk('span', 'rv', fmt(v[a[0]], 3) + ' ' + a[3])); rows.appendChild(r); });
    const val = R.out[2](v), ro = val / base; outd.innerHTML = `<span class="rn">→ ${R.out[0]}</span><span class="rbar big"><i style="width:${Math.min(100, ro * 25)}%"></i></span><span class="rv"><b>${fmt(val, 3)} ${R.out[1]}</b> <small>(처음의 ${fmt(ro, 2)}배)</small></span>`;
  };
  const rs = mk('button', '', '초기화'); rs.className = 'relreset'; rs.onclick = () => { Object.assign(v, v0); draw(); msg.textContent = '버튼을 눌러 하나만 바꿔 보세요.'; }; w.appendChild(rs); draw();
}
function mountFx(el, fx) { fx.forEach(f => { const b = mk('div', 'fx'); el.appendChild(b); if (f.rel) REL(b, f); else SC[f.s](b, f); }); }
