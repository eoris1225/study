'use strict';
/* 개념 컷신: 전체 화면 캔버스 애니메이션 + 영화식 하단 자막.
   한 컷 = { dur, bg?, lines: [[초, 화자, 자막]], draw(x, t, k) }  (가상 해상도 1280×720, 화면을 꽉 채움) */
const Cut = (() => {
  const VW = 1280, VH = 720;
  function play(shots, onDone) {
    const ov = mk('div', 'cutov'), cv = mk('canvas', 'cutcv'), sub = mk('div', 'cutsub'), skip = mk('button', 'cutskip', '건너뛰기 ▸▸'), prog = mk('div', 'cutprog'), ctl = mk('div', 'cutctl'), bPrev = mk('button', '', '⏮ 이전'), bPause = mk('button', '', '⏸ 멈춤'), bNext = mk('button', '', '다음 ⏭'), big = mk('div', 'cutbig', '⏸');
    ctl.append(bPrev, bPause, bNext); ov.append(cv, prog, sub, big, ctl, skip); document.body.appendChild(ov);
    const x = cv.getContext('2d');
    let i = -1, t0 = 0, raf = 0, shown = '', alive = true, paused = false, pAt = 0;
    const fit = () => { const d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(ov.clientWidth * d); cv.height = Math.round(ov.clientHeight * d); };
    fit(); window.addEventListener('resize', fit);
    const end = () => { if (!alive) return; alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', fit); window.removeEventListener('keydown', onKey); ov.remove(); onDone && onDone(); };
    const setPause = v => { if (v === paused) return; const now = performance.now(); if (v) pAt = now; else t0 += now - pAt; paused = v; bPause.textContent = v ? '▶ 재생' : '⏸ 멈춤'; ov.classList.toggle('paused', v); };
    const go = j => { i = Math.max(0, j) - 1; next(); };
    const next = () => { i++; if (i >= shots.length) return end(); t0 = performance.now(); pAt = t0; shown = ''; sub.innerHTML = ''; prog.innerHTML = shots.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join(''); };
    skip.onclick = e => { e.stopPropagation(); end(); };
    ov.onclick = () => setPause(!paused);
    bPause.onclick = e => { e.stopPropagation(); setPause(!paused); };
    bNext.onclick = e => { e.stopPropagation(); next(); };
    bPrev.onclick = e => { e.stopPropagation(); const t = ((paused ? pAt : performance.now()) - t0) / 1000; go(t > 2 ? i : i - 1); };
    const onKey = e => { if (e.code === 'Space') { e.preventDefault(); setPause(!paused); } else if (e.code === 'ArrowRight') next(); else if (e.code === 'ArrowLeft') bPrev.onclick(e); }; window.addEventListener('keydown', onKey);
    const frame = now => {
      if (!alive) return;
      const s = shots[i], t = ((paused ? pAt : now) - t0) / 1000, k = Math.min(1, t / s.dur);
      const sc = Math.max(cv.width / VW, cv.height / VH), ox = (cv.width - VW * sc) / 2, oy = (cv.height - VH * sc) / 2;
      x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = s.base || '#2a1a7a'; x.fillRect(0, 0, cv.width, cv.height);
      x.setTransform(sc, 0, 0, sc, ox, oy); x.lineCap = 'round'; x.lineJoin = 'round';
      s.draw(x, t, k);
      let cur = null; for (const L of s.lines || []) if (t >= L[0]) cur = L;
      const key = cur ? cur[0] + cur[2] : '';
      if (key !== shown) { shown = key; sub.innerHTML = cur ? `${cur[1] !== 'narr' ? `<span class="who" style="--who:${whoColor(cur[1])}">${T(whoName(cur[1]))}</span>` : ''}<div class="txt">${T(cur[2])}</div>` : ''; }
      if (!paused && t > s.dur + (s.hold ?? 1.2)) next();
      raf = requestAnimationFrame(frame);
    };
    next(); raf = requestAnimationFrame(frame);
  }
  return { play, VW, VH };
})();
function whoName(w) { if (w === 'me') return '{name}'; if (CH[w]) return `{${w}}`; return w; }

/* ---------- 컷신 그리기 도구 ---------- */
const CX = (() => {
  const E = Art.ease, cl = v => Math.max(0, Math.min(1, v)), seg = (t, a, b) => cl((t - a) / (b - a));
  const F = w => `800 ${w}px Pretendard, SUIT, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif`;
  /* 밝은 단색 배경: 큰 부드러운 원 + 짧은 대시 질감 */
  const plain = (x, c1, c2, t) => {
    const g = x.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(-400, -300, 2080, 1320);
    x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(200 + i * 260 + Math.sin(t * .2 + i) * 20, 120 + (i % 2) * 380, 140 + i * 18, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 4; x.beginPath(); for (let i = 0; i < 26; i++) { const a = (i * 97 % 1280), b = (i * 53 % 640) + 40; x.moveTo(a, b); x.lineTo(a + 20 + (i % 3) * 8, b); } x.stroke();
  };
  /* 둥근 라벨 */
  const pill = (x, cx, cy, text, k = 1, bg = '#fff', fg = '#2a0f5e', size = 26) => {
    if (k <= 0) return; const s = E.back(cl(k)); x.save(); x.translate(cx, cy); x.scale(s, s); x.font = F(size);
    const w = x.measureText(text).width + size * 1.1, h = size * 1.6;
    x.fillStyle = 'rgba(42,15,94,.25)'; rr(x, -w / 2, -h / 2 + 4, w, h, h / 2); x.fill(); x.fillStyle = bg; rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill();
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 0, 2); x.restore();
  };
  const text = (x, s, cx, cy, size = 30, col = '#fff', k = 1, align = 'center') => { if (k <= 0) return; x.save(); x.globalAlpha = cl(k); x.font = F(size); x.textAlign = align; x.textBaseline = 'middle'; x.lineWidth = size * .22; x.strokeStyle = 'rgba(42,15,94,.6)'; x.strokeText(s, cx, cy + (1 - E.io(cl(k))) * 10); x.fillStyle = col; x.fillText(s, cx, cy + (1 - E.io(cl(k))) * 10); x.restore(); };
  /* 두꺼운 둥근 화살표: k 만큼 그려짐 */
  const arrow = (x, x0, y0, x1, y1, col, w = 10, k = 1) => {
    if (k <= 0) return; k = E.io(cl(k)); const ex = x0 + (x1 - x0) * k, ey = y0 + (y1 - y0) * k, a = Math.atan2(ey - y0, ex - x0);
    x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex - Math.cos(a) * w, ey - Math.sin(a) * w); x.stroke();
    x.fillStyle = col; x.beginPath(); x.moveTo(ex + Math.cos(a) * w * .6, ey + Math.sin(a) * w * .6); x.lineTo(ex - Math.cos(a - .55) * w * 2.4, ey - Math.sin(a - .55) * w * 2.4); x.lineTo(ex - Math.cos(a + .55) * w * 2.4, ey - Math.sin(a + .55) * w * 2.4); x.closePath(); x.fill();
  };
  const dbl = (x, cx, y0, y1, col, w = 8, k = 1) => { arrow(x, cx, (y0 + y1) / 2, cx, y0, col, w, k); arrow(x, cx, (y0 + y1) / 2, cx, y1, col, w, k); };
  /* 치수선: 양끝 눈금 + 가운데 라벨 */
  const dimH = (x, x0, x1, y, label, k = 1, col = '#fff') => { if (k <= 0) return; const e = E.io(cl(k)), m = (x0 + x1) / 2, h = (x1 - x0) / 2 * e; x.strokeStyle = col; x.lineWidth = 5; x.beginPath(); x.moveTo(m - h, y); x.lineTo(m + h, y); x.moveTo(m - h, y - 14); x.lineTo(m - h, y + 14); x.moveTo(m + h, y - 14); x.lineTo(m + h, y + 14); x.stroke(); pill(x, m, y - 34, label, (k - .4) * 2); };
  const dimV = (x, xx, y0, y1, label, k = 1, col = '#fff') => { if (k <= 0) return; const e = E.io(cl(k)), m = (y0 + y1) / 2, h = (y1 - y0) / 2 * e; x.strokeStyle = col; x.lineWidth = 5; x.beginPath(); x.moveTo(xx, m - h); x.lineTo(xx, m + h); x.moveTo(xx - 14, m - h); x.lineTo(xx + 14, m - h); x.moveTo(xx - 14, m + h); x.lineTo(xx + 14, m + h); x.stroke(); pill(x, xx + 60, m, label, (k - .4) * 2); };
  /* 줄 + 구슬: f(X) = 높이 오프셋 */
  const rope = (x, x0, x1, y, f, opt = {}) => {
    const col = opt.col || '#40238f', bead = opt.bead || '#ff6fa8', gap = opt.gap || 46;
    x.strokeStyle = 'rgba(42,15,94,.18)'; x.lineWidth = 12; x.beginPath(); for (let X = x0; X <= x1; X += 6) { const Y = y + f(X) + 10; X === x0 ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke();
    x.strokeStyle = col; x.lineWidth = 9; x.beginPath(); for (let X = x0; X <= x1; X += 6) { const Y = y + f(X); X === x0 ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke();
    if (opt.beads !== false) for (let X = x0 + gap / 2; X < x1; X += gap) ball(x, X, y + f(X), 13, bead);
  };
  const ball = (x, cx, cy, r, col) => { const g = x.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); g.addColorStop(0, Art.lt(col, .45)); g.addColorStop(1, col); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(cx - r * .35, cy - r * .42, r * .3, r * .18, -.6, 0, 7); x.fill(); };
  const ring = (x, cx, cy, r, col, t) => { x.strokeStyle = col; x.lineWidth = 5; x.globalAlpha = .6 + .4 * Math.sin(t * 6); x.beginPath(); x.arc(cx, cy, r + 4 * Math.sin(t * 6), 0, 7); x.stroke(); x.globalAlpha = 1; };
  /* 관중: 둥근 몸 + 머리 + 점 눈. up 0~1 이면 일어나 팔을 든다 */
  const fan = (x, cx, base, col, skin, up, s = 1) => {
    const lift = up * 34 * s; x.save(); x.translate(cx, base);
    x.fillStyle = Art.dk(col, .15); for (const d of [-1, 1]) { x.save(); x.translate(d * 14 * s, -52 * s - lift); x.rotate(d * (.35 + up * 2.4)); rr(x, -5 * s, -4 * s, 10 * s, 34 * s, 5 * s); x.fill(); x.fillStyle = skin; x.beginPath(); x.arc(0, 32 * s, 6 * s, 0, 7); x.fill(); x.fillStyle = Art.dk(col, .15); x.restore(); }
    x.fillStyle = col; rr(x, -22 * s, -64 * s - lift, 44 * s, 64 * s + lift, 20 * s); x.fill();
    x.fillStyle = skin; x.beginPath(); x.arc(0, -84 * s - lift, 22 * s, 0, 7); x.fill();
    x.fillStyle = '#2a1746'; x.beginPath(); x.arc(-7 * s, -84 * s - lift, 3.4 * s, 0, 7); x.arc(7 * s, -84 * s - lift, 3.4 * s, 0, 7); x.fill();
    if (up > .5) { x.fillStyle = '#c23a5e'; x.beginPath(); x.ellipse(0, -74 * s - lift, 5 * s, 4 * s * up, 0, 0, 7); x.fill(); }
    x.restore();
  };
  const clock = (x, cx, cy, r, k, label) => { x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.strokeStyle = '#ffd23f'; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, r - 8, -Math.PI / 2, -Math.PI / 2 + 7 * cl(k) * .8976); x.stroke(); text(x, label, cx, cy, 30); };
  /* 용수철 코일 하나 */
  const coil = (x, cx, cy, h, col) => { x.fillStyle = col; rr(x, cx - 5, cy - h / 2, 10, h, 5); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; rr(x, cx - 3, cy - h / 2 + 6, 3, h * .4, 1.5); x.fill(); };
  return { seg, cl, E, F, plain, pill, text, arrow, dbl, dimH, dimV, rope, ball, ring, fan, clock, coil };
})();
