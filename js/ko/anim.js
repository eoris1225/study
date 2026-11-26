/* 국어 독서 — 학습 애니메이션 엔진: 단계별 자막 · 재생/이전/다음 · 직접 조작(실험실) · 연필 친구 '밑줄이'
   장면 좌표는 660×440 고정, 화면 폭에 맞춰 확대/축소 */
window.KOA = (() => {
  const SC = {}, LW = 660, LH = 440;
  const C = { bg: '#fffdf6', ink: '#23222b', blue: '#2457d6', red: '#d6402f', green: '#14935a', yel: '#ffd84d', org: '#e8862a', pur: '#7a4fd1', gray: '#9a917f', navy: '#1f2a44', sky: '#e3ecff', pink: '#ffe1e8', mint: '#e2f6ea', cream: '#fff5d6', lg: '#eee8da' };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t = clamp(t, 0, 1), t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const seg = (u, a, b) => clamp((u - a) / (b - a), 0, 1);
  const FONT = (s, b, hand) => `${b ? 700 : 400} ${s}px ${hand ? "'Gaegu',cursive" : "'Noto Sans KR',sans-serif"}`;
  function kit(g) {
    const k = {
      g, W: LW, H: LH,
      rr(x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } },
      txt(s, x, y, o = {}) { g.save(); g.font = FONT(o.size || 17, o.bold, o.hand); g.fillStyle = o.color || C.ink; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle'; if (o.alpha != null) g.globalAlpha = o.alpha;
        const lines = String(s).split('\n'), lh = (o.size || 17) * (o.lh || 1.25); lines.forEach((l, i) => g.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh)); g.restore(); },
      box(x, y, w, h, label, o = {}) { g.save(); if (o.alpha != null) g.globalAlpha = o.alpha; if (o.shadow !== false) { k.rr(x + 2, y + 3, w, h, o.r || 12, '#00000014'); }
        k.rr(x, y, w, h, o.r || 12, o.fill || '#fff', o.stroke || C.ink, o.lw || 2); if (label) k.txt(label, x + w / 2, y + h / 2, { size: o.size || 16, bold: o.bold !== false, color: o.color || C.ink, hand: o.hand }); g.restore(); },
      circ(x, y, r, fill, stroke, lw) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } },
      line(pts, color, w, dash) { g.save(); g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.strokeStyle = color || C.ink; g.lineWidth = w || 2; g.lineCap = g.lineJoin = 'round'; if (dash) g.setLineDash(dash); g.stroke(); g.restore(); },
      arrow(x1, y1, x2, y2, o = {}) { const p = o.p == null ? 1 : clamp(o.p, 0, 1); if (p <= 0) return; const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1), hs = o.head || 11;
        g.save(); if (o.alpha != null) g.globalAlpha = o.alpha; g.strokeStyle = g.fillStyle = o.color || C.ink; g.lineWidth = o.w || 3; g.lineCap = 'round'; if (o.dash) g.setLineDash(o.dash);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(ex - Math.cos(a) * hs * .6, ey - Math.sin(a) * hs * .6); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(a - .45) * hs, ey - Math.sin(a - .45) * hs); g.lineTo(ex - Math.cos(a + .45) * hs, ey - Math.sin(a + .45) * hs); g.closePath(); g.fill();
        if (o.label) k.txt(o.label, (x1 + ex) / 2 + (o.lx || 0), (y1 + ey) / 2 + (o.ly || -12), { size: o.ls || 14, bold: true, color: o.color || C.ink }); g.restore(); },
      person(x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); const col = o.color || '#ffcf9e', sh = o.shirt || C.blue;
        k.rr(-16, 10, 32, 38, 12, sh); k.circ(0, -6, 17, col, C.ink, 2);
        g.fillStyle = C.ink; const bl = (Math.sin((o.t || 0) * 1.3) > .97) ? .2 : 1; g.beginPath(); g.ellipse(-6, -8, 2.2, 2.6 * bl, 0, 0, 7); g.ellipse(6, -8, 2.2, 2.6 * bl, 0, 0, 7); g.fill();
        g.lineWidth = 2; g.strokeStyle = C.ink; g.beginPath(); if (o.face === 'sad') g.arc(0, 6, 5, Math.PI * 1.15, Math.PI * 1.85); else if (o.face === 'o') g.arc(0, 2, 3, 0, 7); else g.arc(0, -1, 5, Math.PI * .15, Math.PI * .85); g.stroke();
        if (o.hat) { k.rr(-18, -28, 36, 8, 3, o.hat); k.rr(-11, -40, 22, 14, 4, o.hat); }
        if (o.label) k.txt(o.label, 0, 62, { size: 14, bold: true }); g.restore(); },
      spark(x, y, r, t, col) { g.save(); g.translate(x, y); g.rotate(t * 2); g.strokeStyle = col || C.org; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * r * .45, Math.sin(a) * r * .45); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); } g.restore(); },
      tag(s, x, y, col, o = {}) { g.save(); g.font = FONT(o.size || 14, true); const w = g.measureText(s).width + 14, h = (o.size || 14) + 10; if (o.alpha != null) g.globalAlpha = o.alpha; k.rr(x - w / 2, y - h / 2, w, h, h / 2, col || C.navy); k.txt(s, x, y + 1, { size: o.size || 14, bold: true, color: o.color || '#fff' }); g.restore(); },
      hand(s, x, y, o = {}) { k.txt(s, x, y, { ...o, hand: true, size: o.size || 22, bold: true, color: o.color || C.blue }); }
    };
    return k;
  }
  /* 연필 친구 '밑줄이' */
  function mascot(k, x, y, t, jump) { const g = k.g; g.save(); const hop = jump > 0 ? Math.sin(Math.min(1, jump) * Math.PI) * 14 : 0; g.translate(x, y - Math.abs(Math.sin(t * 2.2)) * 3 - hop); g.rotate(Math.sin(t * 1.4) * .06);
    k.rr(-11, -40, 22, 52, 5, '#ffcc33', C.ink, 2); k.rr(-11, -48, 22, 10, 4, '#f49ab0', C.ink, 2); g.beginPath(); g.moveTo(-11, 12); g.lineTo(11, 12); g.lineTo(0, 30); g.closePath(); g.fillStyle = '#f2d3a5'; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-3.5, 24); g.lineTo(3.5, 24); g.lineTo(0, 30); g.closePath(); g.fillStyle = C.ink; g.fill();
    const bl = (t % 3.4) < .12 ? .15 : 1; g.fillStyle = C.ink; g.beginPath(); g.ellipse(-4.5, -20, 2.2, 3 * bl, 0, 0, 7); g.ellipse(4.5, -20, 2.2, 3 * bl, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(0, -13, 4, .2, Math.PI - .2); g.lineWidth = 1.8; g.stroke(); g.restore(); }

  function mount(el, id, p) {
    const sc = SC[id]; if (!sc) { el.innerHTML = '<p style="padding:20px">애니메이션 준비 중</p>'; return { destroy() { } }; }
    el.innerHTML = `<div class="anim"><canvas></canvas><div class="rot">📱 그림이 작으면 폰을 가로로 돌리거나 ⛶ 버튼을 눌러 크게 보세요</div><div class="acap"></div><div class="actl"><button class="pv">◀ 이전</button><button class="play">⏸ 멈춤</button><button class="nx">다음 ▶</button><div class="dots"></div><button class="fs" title="전체 화면">⛶</button></div><div class="alab"></div></div>`;
    const box = el.querySelector('.anim'), cv = box.querySelector('canvas'), cap = box.querySelector('.acap'), lab = box.querySelector('.alab'), dots = box.querySelector('.dots'), pb = box.querySelector('.play');
    const S = { t: 0, k: 0, st: 0, playing: true, jump: 0 }; sc.init && sc.init(S, p);
    const steps = sc.steps; dots.innerHTML = steps.map((_, i) => `<i data-i="${i}"></i>`).join('');
    if (sc.lab) { lab.innerHTML = sc.lab.html; sc.lab.bind(lab, S); }
    let g = cv.getContext('2d'), k = kit(g), scale = 1, raf = 0, last = performance.now(), alive = true;
    function resize() { const w = cv.clientWidth || el.clientWidth, d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(w * d); cv.height = Math.round(w * LH / LW * d); scale = cv.width / LW; }
    function setStep(i) { S.k = clamp(i, 0, steps.length - 1); S.st = 0; S.jump = 1; const s = steps[S.k];
      cap.innerHTML = `<span class="stp">${S.k + 1}/${steps.length}</span>${s.cap}`; dots.querySelectorAll('i').forEach((d, j) => d.classList.toggle('on', j === S.k));
      lab.classList.toggle('on', !!s.lab); if (s.lab && sc.lab && sc.lab.enter) sc.lab.enter(lab, S); if (s.enter) s.enter(S); }
    function setPlay(v) { S.playing = v; pb.textContent = v ? '⏸ 멈춤' : '▶ 재생'; }
    box.querySelector('.pv').onclick = () => { setStep(S.k - 1); };
    box.querySelector('.nx').onclick = () => { if (S.k < steps.length - 1) setStep(S.k + 1); };
    pb.onclick = () => { if (!S.playing && S.k === steps.length - 1 && S.st > (steps[S.k].dur || 6)) setStep(0); setPlay(!S.playing); };
    dots.onclick = e => { const d = e.target.closest('i'); if (d) setStep(+d.dataset.i); };
    box.querySelector('.fs').onclick = async () => { try { if (!document.fullscreenElement) { await box.requestFullscreen(); try { await screen.orientation.lock('landscape'); } catch (e) { } } else await document.exitFullscreen(); } catch (e) { } setTimeout(resize, 300); };
    cv.addEventListener('pointerdown', e => { if (!sc.tap) return; const r = cv.getBoundingClientRect(); sc.tap((e.clientX - r.left) / r.width * LW, (e.clientY - r.top) / r.height * LH, S, steps[S.k]); });
    function frame(now) { if (!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; S.t += dt; S.jump = Math.max(0, S.jump - dt * 2.5);
      const s = steps[S.k], dur = s.dur || 6; if (S.playing) { S.st += dt; if (S.st > dur + 1.4 && !s.lab) { if (S.k < steps.length - 1) setStep(S.k + 1); else setPlay(false); } } else if (s.lab) S.st += dt;
      const u = clamp(S.st / dur, 0, 1);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(scale, 0, 0, scale, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, LW, LH);
      try { sc.draw(k, S, u, s); } catch (err) { console.error(err); }
      mascot(k, LW - 26, LH - 34, S.t, S.jump);
      raf = requestAnimationFrame(frame); }
    const ro = new ResizeObserver(resize); ro.observe(cv); resize(); setStep(0); raf = requestAnimationFrame(frame);
    return { destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); }, resize };
  }
  return { def: (id, s) => SC[id] = s, mount, C, clamp, lerp, ease, seg, LW, LH };
})();
