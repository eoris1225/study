'use strict';
/* 분류형 → 직접 달려가 받아내는 액션 */
MG.sort = (cfg, el, done, ctx) => {
  const L = lifeUI(el, ctx.lives), h = hud(el), c = cv(el, 720, 400), x = c.getContext('2d'); c.style.touchAction = 'none';
  const W = 720, H = 400, FY = 330, n = cfg.bins.length, zw = W / n, COL = ['#ff4f9a', '#2de2c6', '#ffd23f', '#9d7bff'], F = s => `800 ${s}px system-ui,"Apple SD Gothic Neo","Noto Sans KR",sans-serif`;
  const look = (typeof S !== 'undefined' && S && S.look) || { skin: '#ffa630', hair: '#2a6bff', hairStyle: 1, outfit: '#7a2cf0' };
  let q = shuffle(cfg.items), total = q.length, px = W / 2, target = null, slam = false, cy = -40, cx = W / 2, fin = false, wait = 0, fb = '← → 로 달려가서, 떨어지는 카드를 알맞은 칸에서 받아요!', flash = null, streak = 0, t = 0, dir = 1, walk = false, hop = 0, shake = 0; const keys = {}, base = (H - 60) / (cfg.dur || 6);
  const wrap = (s, mw, f) => { x.font = f; const out = ['']; for (const w of s.split(' ')) { const cur = out[out.length - 1]; if (cur && x.measureText(cur + ' ' + w).width > mw) out.push(w); else out[out.length - 1] = cur ? cur + ' ' + w : w; } return out; };
  const zone = X => Math.max(0, Math.min(n - 1, Math.floor(X / zw)));
  const settle = () => { const it = q[0], z = zone(px); if (z === it.bin) { q.shift(); streak++; hop = 1; flash = { z, ok: 1, life: .5 }; fb = `<span class="ok">✔ 「${it.text}」 = ${cfg.bins[z]}${it.why ? ' — ' + it.why : ''}${streak > 2 ? ` · ${streak}연속!` : ''}</span>`; Sfx.play('orb'); if (!q.length) { fin = true; Sfx.play('win'); return setTimeout(() => done(true), 500); } }
    else { q.push(q.shift()); streak = 0; shake = .3; wait = 1.8; flash = { z: it.bin, ok: 0, life: 1.8 }; fb = `<span class="no">✖ 「${it.text}」 = <b>${cfg.bins[it.bin]}</b>${it.why ? ' (' + it.why + ')' : ''}</span>`; if (L.hit()) { fin = true; return done(false); } }
    cy = -40; cx = W / 2; slam = false; target = null; };
  const kd = e => { if (!el.isConnected) { removeEventListener('keydown', kd); removeEventListener('keyup', ku); return; } keys[e.code] = 1; const d = +e.key - 1; if (d >= 0 && d < n) { target = d; slam = true; } if (e.code === 'ArrowDown' || e.code === 'Space') { slam = true; e.preventDefault(); } if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { target = null; e.preventDefault(); } }, ku = e => keys[e.code] = 0;
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  c.onpointerdown = e => { const z = zone(pos(c, e).x); if (target === z || zone(px) === z) slam = true; target = z; };
  loop(el, dt => {
    if (fin) return; t += dt; if (shake > 0) shake -= dt; if (hop > 0) hop -= dt * 2.5; if (flash) { flash.life -= dt; if (flash.life <= 0) flash = null; }
    let v = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0); if (!v && target != null) { const tx = (target + .5) * zw; v = Math.abs(tx - px) > 6 ? Math.sign(tx - px) : 0; }
    px = Math.max(24, Math.min(W - 24, px + v * 460 * dt)); walk = !!v; if (v) dir = v;
    if (wait > 0) wait -= dt; else { const arrived = target == null || Math.abs((target + .5) * zw - px) < 8; cy += (slam && arrived ? 900 : base * (1 + Math.min(streak, 6) * .08)) * dt; cx += (px - cx) * Math.min(1, dt * 5); if (cy >= FY - 70) settle(); }
    if (fin) return;
    x.save(); x.translate(shake > 0 ? (Math.random() - .5) * 12 : 0, 0);
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fe3ff'); g.addColorStop(1, '#c9b6ff'); x.fillStyle = g; x.fillRect(-10, 0, W + 20, H);
    for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc((i * 190 + t * 12) % (W + 120) - 60, 50 + i % 2 * 46, 30 + i % 3 * 10, 0, 7); x.fill(); }
    cfg.bins.forEach((b, i) => { const on = zone(px) === i, fl = flash && flash.z === i; x.fillStyle = fl ? (flash.ok ? '#5dfc9b' : '#fff') : COL[i % 4]; x.globalAlpha = on || fl ? 1 : .72; x.beginPath(); x.roundRect ? x.roundRect(i * zw + 6, FY, zw - 12, H - FY + 20, 18) : x.rect(i * zw + 6, FY, zw - 12, H - FY); x.fill(); x.globalAlpha = 1; x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(i * zw + 18, FY + 6, zw - 36, 5);
      const f = F(n > 3 ? 14 : 17), ls = wrap(b, zw - 30, f); x.font = f; x.fillStyle = '#2a0f5e'; x.textAlign = 'center'; ls.slice(0, 3).forEach((s, k) => x.fillText(s, (i + .5) * zw, FY + 32 + k * 19)); if (fl && !flash.ok) { x.strokeStyle = '#ff3d6e'; x.lineWidth = 6; x.strokeRect(i * zw + 9, FY + 3, zw - 18, H - FY); } });
    x.fillStyle = 'rgba(42,15,94,.2)'; x.beginPath(); x.ellipse(px, FY, 20, 5, 0, 0, 7); x.fill();
    Art.chibi(x, px, FY - Math.max(0, Math.sin(Math.max(0, hop) * Math.PI)) * 30, 1.5, look, { t, walk, dir, air: hop > 0 });
    if (wait <= 0 && q.length) { const it = q[0], f = F(17), ls = wrap(it.text, 250, f), bw = Math.min(290, Math.max(...ls.map(s => x.measureText(s).width)) + 36), bh = ls.length * 23 + 22; x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.setLineDash([4, 6]); x.beginPath(); x.moveTo(cx, cy + bh / 2); x.lineTo(cx, FY - 74); x.stroke(); x.setLineDash([]);
      x.fillStyle = 'rgba(42,15,94,.25)'; x.beginPath(); x.roundRect ? x.roundRect(cx - bw / 2, cy - bh / 2 + 5, bw, bh, 16) : x.rect(cx - bw / 2, cy - bh / 2 + 5, bw, bh); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 16) : x.rect(cx - bw / 2, cy - bh / 2, bw, bh); x.fill(); x.fillStyle = '#2a0f5e'; x.font = f; x.textAlign = 'center'; ls.forEach((s, k) => x.fillText(s, cx, cy - bh / 2 + 28 + k * 23)); }
    x.restore();
    h.innerHTML = `<b>${cfg.ask}</b> · 남은 것 ${q.length}/${total} <small>(칸을 누르거나 숫자 키: 달려가서 바로 받기 · ↓: 빨리 떨어뜨리기)</small><br>${fb}`;
  });
};
if (window.HOW) HOW.sort = '← → (또는 칸 누르기)로 달려가, 떨어지는 카드를 알맞은 칸에서 받으세요.';
