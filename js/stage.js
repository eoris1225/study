'use strict';
/* 무대 연출: 대사를 화면에서 '보여 준다'. 배경 + 배우 동작 + 화면 효과 → Cut 엔진으로 재생 */
const Stage = (() => {
  const GY = 560, cl = v => Math.max(0, Math.min(1, v)), seg = (k, a, b) => cl((k - a) / Math.max(.0001, b - a)), io = u => u * u * (3 - 2 * u);
  const rrp = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  const E = (x, a, b, rx, ry, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(a, b, Math.max(0, rx), Math.max(0, ry), 0, 0, 7); x.fill(); };
  const grad = (x, c1, c2) => { const g = x.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(-200, -200, 1680, 1120); };
  const BG = {
    shrine(x, t) { // 무너진 성소: 새벽빛, 부러진 기둥, 잔해, 빛줄기, 먼지
      grad(x, '#2a1a6e', '#ff9a7a'); E(x, 980, 470, 150, 150, 'rgba(255,240,200,.35)'); E(x, 980, 470, 90, 90, '#fff3c4');
      x.fillStyle = '#3b2a86'; x.beginPath(); x.moveTo(-50, 720); for (let X = -50; X <= 1330; X += 40) x.lineTo(X, 470 - Math.sin(X * .004) * 50 - Math.sin(X * .013) * 20); x.lineTo(1330, 720); x.fill();
      x.fillStyle = 'rgba(255,255,255,.10)'; x.beginPath(); x.moveTo(120, -40); x.lineTo(330, -40); x.lineTo(760, GY); x.lineTo(430, GY); x.fill();
      [[90, 330], [250, 190], [470, 400], [820, 150], [1010, 300], [1180, 110]].forEach(([cx, h], i) => { x.fillStyle = i % 2 ? '#5a45b0' : '#4a3aa0'; rrp(x, cx - 34, GY - h, 68, h + 10, 8); x.fill(); x.fillStyle = '#6b58c4'; rrp(x, cx - 44, GY - h - 8, 88, 22, 8); x.fill(); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(cx - 22, GY - h + 20, 8, h - 30); if (h < 250) { x.fillStyle = '#4a3aa0'; x.beginPath(); x.moveTo(cx - 34, GY - h); x.lineTo(cx - 10, GY - h - 30); x.lineTo(cx + 12, GY - h - 6); x.lineTo(cx + 34, GY - h - 22); x.lineTo(cx + 34, GY - h + 6); x.fill(); } });
      x.strokeStyle = '#5a45b0'; x.lineWidth = 40; x.lineCap = 'round'; x.beginPath(); x.arc(360, GY - 190, 120, Math.PI, Math.PI * 1.55); x.stroke();
      x.fillStyle = '#2f2270'; x.fillRect(-50, GY, 1400, 200); x.fillStyle = '#4a3aa0'; rrp(x, -50, GY - 6, 1400, 22, 8); x.fill();
      [[180, 30], [560, 46], [700, 24], [900, 38], [1100, 28]].forEach(([cx, r]) => { E(x, cx, GY + 2, r, r * .55, '#5a45b0'); E(x, cx - r * .3, GY - r * .2, r * .4, r * .25, '#6b58c4'); });
      x.strokeStyle = 'rgba(20,10,60,.5)'; x.lineWidth = 4; x.beginPath(); x.moveTo(300, GY + 30); x.lineTo(380, GY + 60); x.lineTo(360, GY + 110); x.moveTo(820, GY + 20); x.lineTo(760, GY + 80); x.stroke();
      for (let i = 0; i < 26; i++) E(x, (i * 137 + t * 14) % 1300, 80 + (i * 71) % 440 + Math.sin(t + i) * 12, 2 + i % 3, 2 + i % 3, 'rgba(255,240,210,.5)');
    },
    tomb(x, t) { // 현의 무덤: 거대한 현, 가운데 제단
      grad(x, '#14083a', '#5a2a9a'); for (let i = 0; i < 30; i++) E(x, (i * 211) % 1280, (i * 97) % 420, 1.5 + i % 3, 1.5 + i % 3, `rgba(255,255,255,${.3 + .3 * Math.sin(t * 2 + i)})`);
      for (let i = 0; i < 13; i++) { const X = 60 + i * 97, slack = i % 4 === 1; x.strokeStyle = slack ? 'rgba(255,255,255,.18)' : 'rgba(255,220,160,.4)'; x.lineWidth = 3 + i % 3; x.beginPath(); x.moveTo(X, -20); if (slack) x.quadraticCurveTo(X + 60, 260, X + 30 + Math.sin(t + i) * 6, 400); else x.quadraticCurveTo(X + Math.sin(t * 5 + i) * 5, 280, X, GY); x.stroke(); }
      x.fillStyle = '#2a1466'; x.fillRect(-50, GY, 1400, 200); x.fillStyle = '#6a3fd4'; rrp(x, -50, GY - 6, 1400, 20, 8); x.fill();
      E(x, 640, GY + 6, 190, 30, 'rgba(255,210,120,.25)'); E(x, 640, GY + 6, 120, 18, 'rgba(255,230,170,.5)');
    },
    beach(x, t) { // 해 질 녘 해안
      grad(x, '#ff8fb3', '#ffcf7a'); E(x, 640, 430, 190, 190, 'rgba(255,255,255,.25)'); E(x, 640, 430, 120, 120, '#fff3b0');
      x.fillStyle = '#ff7a8a'; x.fillRect(-50, 430, 1400, 140); for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 5; x.beginPath(); for (let X = -50; X < 1330; X += 20) { const Y = 450 + i * 20 + Math.sin(X * .02 + t * 1.5 + i) * 5; X === -50 ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke(); }
      x.fillStyle = '#ffe2a8'; x.fillRect(-50, GY - 10, 1400, 220); x.fillStyle = '#fff1cf'; rrp(x, -50, GY - 16, 1400, 22, 10); x.fill();
    },
    boiler(x, t) { // 식어 가는 보일러실
      grad(x, '#2a1038', '#a0482e'); x.fillStyle = '#3b1a4a'; x.fillRect(-50, 0, 1400, 120);
      [[80, 60, 500], [200, 30, 380], [1150, 50, 460]].forEach(([X, w, h]) => { x.fillStyle = '#5a2a5e'; rrp(x, X, GY - h, w, h, 14); x.fill(); x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(X + 8, GY - h + 10, 8, h - 20); });
      x.strokeStyle = '#6b3468'; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(110, 150); x.lineTo(700, 150); x.lineTo(700, 250); x.stroke(); x.strokeStyle = '#8a4a78'; x.lineWidth = 8; x.beginPath(); x.moveTo(110, 140); x.lineTo(690, 140); x.stroke();
      x.fillStyle = '#4a2050'; rrp(x, 600, 230, 360, GY - 230, 60); x.fill(); x.fillStyle = '#6b3468'; rrp(x, 600, 230, 360, 60, 30); x.fill(); for (let i = 0; i < 6; i++) E(x, 630 + i * 60, 260, 7, 7, '#8a4a78'); x.fillStyle = '#1a0a24'; rrp(x, 700, 400, 160, 110, 20); x.fill();
      x.fillStyle = '#2a1038'; x.fillRect(-50, GY, 1400, 200); x.fillStyle = '#6b3468'; rrp(x, -50, GY - 6, 1400, 20, 8); x.fill();
      for (let i = 0; i < 14; i++) E(x, (i * 173 + t * 8) % 1300, 100 + (i * 67) % 400, 2, 2, 'rgba(255,220,200,.35)');
    },
    ch(x, t, sc) { // 그 장의 맵 배경 그대로 + 밤이면 어둡게
      const th = Art.THEMES[(sc.ci || 0) % Art.THEMES.length]; x.save(); x.translate(-60, 0); Art.bg(x, 1400, 720, 260 + t * 6, th, t, GY); Art.ground(x, -40, GY, 1500, 240, th, false); x.restore();
      if (sc.night) { x.fillStyle = 'rgba(16,8,70,.55)'; x.fillRect(-200, -200, 1680, 1120); for (let i = 0; i < 24; i++) E(x, (i * 211) % 1280, (i * 67) % 300, 2, 2, `rgba(255,255,255,${.4 + .4 * Math.sin(t * 2 + i)})`); }
    },
    void(x, t) { grad(x, '#05030f', '#140a2e'); for (let i = 0; i < 16; i++) E(x, (i * 173) % 1280, (i * 91 + t * 10) % 720, 2, 2, 'rgba(255,255,255,.25)'); }
  };
  const look = id => id === 'me' ? S.look : compC(id);
  function actor(x, a, t, k) {
    const u = a.at ? seg(k, a.at[0], a.at[1]) : 1, e = io(u), s = a.s || 3, L = look(a.id); let X = a.x, Y = GY, rot = 0, alpha = 1, walk = false, air = false, dir = a.dir || 1;
    const p = a.pose || 'stand';
    if (p === 'walk') { X = a.x + (a.x1 - a.x) * e; walk = u > 0 && u < 1; dir = Math.sign(a.x1 - a.x) || 1; }
    else if (p === 'lie') rot = 1; else if (p === 'rise') { rot = 1 - e; if (u > 0 && u < 1) Y -= Math.sin(u * Math.PI) * 10; } else if (p === 'fall') rot = e;
    else if (p === 'ash' || p === 'shatter' || p === 'fade' || p === 'light') alpha = 1 - e; else if (p === 'lift') { Y -= e * 150; air = true; } else if (p === 'jumpjoy') { Y -= Math.abs(Math.sin(t * 6)) * 40; air = true; } 
    if (alpha <= 0) return;
    if (!rot) E(x, X, GY + 4, 16 * s, 4 * s, `rgba(20,6,60,${.25 * alpha})`);
    if (p === 'ash' && u > 0) { E(x, X, Y - 100, 150 * (1 - e) + 40, 150 * (1 - e) + 40, `rgba(255,255,255,${.5 * (1 - e)})`); for (let i = 0; i < 22; i++) { const pp = cl(u * 1.4 - i * .02); E(x, X + Math.sin(i * 2.3) * 60 * pp + Math.sin(t * 3 + i) * 6, Y - 60 - i * 5 - pp * 260, 5 - pp * 3, 5 - pp * 3, i % 2 ? `rgba(255,140,60,${1 - pp})` : `rgba(90,70,90,${1 - pp})`); } }
    if (p === 'shatter' && u > 0) for (let i = 0; i < 18; i++) { const an = i * .7, d = e * (120 + i * 12); x.save(); x.translate(X + Math.cos(an) * d, Y - 90 + Math.sin(an) * d + e * e * 120); x.rotate(an + e * 4); x.fillStyle = `rgba(190,235,255,${1 - e * .8})`; x.beginPath(); x.moveTo(-10, 0); x.lineTo(0, -16); x.lineTo(12, 4); x.fill(); x.restore(); }
    if (p === 'light' && u > 0) { E(x, X, Y - 90, 60 + e * 260, 60 + e * 260, `rgba(255,255,255,${.6 * (1 - e) + .2})`); for (let i = 0; i < 16; i++) E(x, X + Math.sin(i * 1.9) * 80 * e, Y - 40 - i * 14 - e * 200, 5, 5, `rgba(255,240,180,${1 - e})`); }
    x.save(); x.globalAlpha = alpha; x.translate(X, Y); if (rot) { x.translate(0, -8 * s * rot); x.rotate(-rot * Math.PI / 2 * (a.flip ? -1 : 1)); }
    if (p === 'sit') { x.fillStyle = '#5a3a2a'; x.beginPath(); x.ellipse(0, -6, 17 * s, 5 * s, 0, 0, 7); x.fill(); x.translate(0, -10); x.scale(1, .86); }
    Art.chibi(x, 0, 0, s, L, { t: t + (a.id.length), walk, dir, air }); x.restore();
    if (a.sing) for (let i = 0; i < 4; i++) { const pp = (t * .45 + i / 4) % 1; x.globalAlpha = (1 - pp) * alpha; x.fillStyle = '#fff'; x.font = '800 40px sans-serif'; x.fillText(i % 2 ? '♪' : '♫', X + 30 + pp * 80 + Math.sin(t * 2 + i) * 16, Y - 190 - pp * 170); x.globalAlpha = 1; }
  }
  function boss(x, b, t, k) { const u = b.at ? seg(k, b.at[0], b.at[1]) : 1, e = io(u), p = b.pose || 'loom'; let Y = GY + 30, al = 1, s = b.s || 6.5; if (p === 'rise') Y += (1 - e) * 420; if (p === 'break') { al = 1 - e; s *= 1 + e * .25; } if (al <= 0) return; x.save(); x.globalAlpha = al; if (p === 'break') x.translate((Math.random() - .5) * 20 * (1 - e), 0); E(x, b.x || 1030, GY + 6, 200, 26, 'rgba(0,0,0,.35)'); Art.monster(x, b.x || 1030, Y, s, 2, '#3a1466', t * (p === 'cast' ? 2 : 1), true); x.restore();
    if (p === 'cast') { const X = (b.x || 1030) - 60; for (let i = 0; i < 5; i++) { const r = ((t * 220 + i * 160) % 800); x.strokeStyle = `rgba(255,60,110,${cl(1 - r / 800) * .7})`; x.lineWidth = 10; x.beginPath(); x.arc(X, GY - 220, r, Math.PI * .6, Math.PI * 1.4); x.stroke(); } } }
  function fx(x, f, t, k) {
    const u = seg(k, f.at[0], f.at[1]), e = io(u), bell = Math.sin(cl(u) * Math.PI);
    if (f.k === 'flash') { x.fillStyle = `rgba(255,255,255,${f.hold ? e : bell})`; x.fillRect(-200, -200, 1680, 1120); }
    else if (f.k === 'red') { const g = x.createRadialGradient(640, 360, 200, 640, 360, 800); g.addColorStop(0, 'rgba(255,0,60,0)'); g.addColorStop(1, `rgba(255,0,60,${.6 * bell})`); x.fillStyle = g; x.fillRect(-200, -200, 1680, 1120); }
    else if (f.k === 'dark') { x.fillStyle = `rgba(0,0,0,${f.out ? 1 - e : e})`; x.fillRect(-200, -200, 1680, 1120); }
    else if (f.k === 'frost') { x.fillStyle = `rgba(150,210,255,${.35 * bell})`; x.fillRect(-200, -200, 1680, 1120); }
    else if (f.k === 'pillar' && u > 0) { const w = (f.w || 150) * e; const g = x.createLinearGradient(640 - w, 0, 640 + w, 0); g.addColorStop(0, 'rgba(255,240,190,0)'); g.addColorStop(.5, `rgba(255,240,190,${.75 * e})`); g.addColorStop(1, 'rgba(255,240,190,0)'); x.fillStyle = g; x.fillRect(640 - w, -100, w * 2, GY + 110); }
    else if (f.k === 'ice' && u > 0) for (let i = 0; i < 7; i++) { const X = (f.x || 640) - 60 + i * 20, h = (40 + (i % 3) * 30) * e; x.fillStyle = i % 2 ? '#bfeaff' : '#8fd3ff'; x.beginPath(); x.moveTo(X - 12, GY + 4); x.lineTo(X, GY - h); x.lineTo(X + 12, GY + 4); x.fill(); }
    else if (f.k === 'card' && u > 0) { const sc = Art.ease.back(cl(u * 3)); x.save(); x.translate(640, 300); x.scale(sc, sc); x.rotate(-.03); x.fillStyle = 'rgba(0,0,0,.3)'; rrp(x, -400, -84, 800, 180, 18); x.fill(); x.fillStyle = '#fff8e6'; rrp(x, -400, -96, 800, 180, 18); x.fill(); x.strokeStyle = '#e5d6b0'; x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-360, -40 + i * 44); x.lineTo(360, -40 + i * 44); x.stroke(); } x.fillStyle = '#3a2a6e'; x.font = '800 34px system-ui,sans-serif'; x.textAlign = 'center'; (f.text || '').split('|').forEach((s, i, a) => x.fillText(s, 0, -6 + (i - (a.length - 1) / 2) * 46)); x.restore(); }
    else if (f.k === 'title' && u > 0) { x.save(); x.globalAlpha = cl(u * 2.5); x.fillStyle = f.col || '#ffd23f'; x.font = '800 90px system-ui,sans-serif'; x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 20; x.fillText(f.text, 640, 330 + (1 - io(cl(u * 2))) * 30); x.restore(); }
    else if (f.k === 'gauge') { const lv = f.a + (f.b - f.a) * e + (f.flick ? Math.sin(t * 23) * .012 + (Math.sin(t * 3.1) > .8 ? .03 : 0) : 0), cx = f.x || 930, cy = f.y || 280, r = 150, on = lv > .3, pop = Art.ease.back(cl(k * 5));
      x.save(); x.translate(cx, cy); x.scale(pop, pop); if (on) E(x, 0, 0, r + 60 + Math.sin(t * 5) * 8, r + 60 + Math.sin(t * 5) * 8, `rgba(255,170,60,${.25 + lv * .25})`);
      E(x, 0, 8, r + 16, r + 16, 'rgba(0,0,0,.3)'); E(x, 0, 0, r + 16, r + 16, '#c9772e'); E(x, 0, 0, r, r, on ? '#fff3d6' : '#4a3a52');
      for (let i = 0; i <= 10; i++) { const an = Math.PI * (1 + i / 10); x.strokeStyle = i > 7 ? '#ff4f5e' : on ? '#3a2a4a' : '#7a6a82'; x.lineWidth = i % 5 ? 5 : 9; x.beginPath(); x.moveTo(Math.cos(an) * (r - 14), Math.sin(an) * (r - 14)); x.lineTo(Math.cos(an) * (r - (i % 5 ? 32 : 44)), Math.sin(an) * (r - (i % 5 ? 32 : 44))); x.stroke(); }
      const na = Math.PI * (1 + cl(lv)); x.strokeStyle = on ? '#ff4f5e' : '#8a7a92'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(na) * (r - 40), Math.sin(na) * (r - 40)); x.stroke(); E(x, 0, 0, 16, 16, '#c9772e');
      x.fillStyle = on ? '#3a2a4a' : '#8a7a92'; x.font = '800 30px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(on ? '♥ ' + Math.round(lv * 100) : '· · ·', 0, 70); x.restore();
      x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 4; x.setLineDash([8, 10]); x.beginPath(); x.moveTo(cx - 150, cy + 90); x.lineTo(f.tx || 560, GY - 60); x.stroke(); x.setLineDash([]);
      if (on) for (let i = 0; i < 5; i++) { const pp = (t * .5 + i / 5) % 1; E(x, (f.tx || 560) - 40 + i * 20 + Math.sin(t * 2 + i) * 8, GY - 120 - pp * 200, 10 + pp * 22, 10 + pp * 22, `rgba(255,255,255,${.5 * (1 - pp)})`); } }
    else if (f.k === 'fire') { const X = f.x || 640; E(x, X, GY - 60, 230, 200, 'rgba(255,170,60,.22)'); x.strokeStyle = '#5a3a2a'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(X - 46, GY + 2); x.lineTo(X + 46, GY - 14); x.moveTo(X - 46, GY - 14); x.lineTo(X + 46, GY + 2); x.stroke();
      [['#ff5470', 46, 120], ['#ff8a3d', 34, 92], ['#ffd23f', 20, 60]].forEach(([c, w, h], i) => { const hh = h + Math.sin(t * 9 + i * 2) * 14; x.fillStyle = c; x.beginPath(); x.moveTo(X - w, GY - 10); x.quadraticCurveTo(X - w * .5 + Math.sin(t * 7 + i) * 10, GY - hh * .7, X + Math.sin(t * 5 + i) * 8, GY - 10 - hh); x.quadraticCurveTo(X + w * .7, GY - hh * .5, X + w, GY - 10); x.fill(); });
      for (let i = 0; i < 6; i++) { const pp = (t * .5 + i / 6) % 1; E(x, X + Math.sin(i * 2 + t) * 30, GY - 120 - pp * 220, 3, 3, `rgba(255,200,90,${1 - pp})`); } }
    else if (f.k === 'grab' && u > 0) { x.strokeStyle = '#fff'; x.lineWidth = 8; x.globalAlpha = bell; for (let i = 0; i < 6; i++) { const an = i * 1.05; x.beginPath(); x.moveTo((f.x || 640) + Math.cos(an) * 50, GY - 150 + Math.sin(an) * 50); x.lineTo((f.x || 640) + Math.cos(an) * 90, GY - 150 + Math.sin(an) * 90); x.stroke(); } x.globalAlpha = 1; }
  }
  const dur = s => 1.7 + s.replace(/<[^>]+>/g, '').length * .075;
  function build(scenes) {
    return scenes.map(sc => { let t0 = .5; const lines = (sc.lines || []).map(([w, s]) => { const L = [t0, w === 'n' ? 'narr' : w === 't' ? 'me' : w === 'm' ? 'me' : w === 'b' ? '침묵의 지휘자' : ({ i: 'ignis', c: 'clausia', r: 'resona' }[w]), w === 't' ? `<i>(${s})</i>` : s]; t0 += dur(s); return L; }); const D = Math.max(sc.min || 3, t0 + .3);
      const fired = new Set(); let lastK = 1e9; const FXS = { flash: 'impact', red: 'heart', dark: 'dark', frost: 'frost', pillar: 'choir', ice: 'ice', card: 'paper', grab: 'grab', shake: 'rumble' }, POS = { ash: 'fire', shatter: 'glass', light: 'choir', fade: 'dark', fall: 'thud', rise: 'rise', lift: 'lift' }, BOS = { rise: 'roar', cast: 'cast', break: 'explode' };
      const cue = (t, k) => { if (k + .001 < lastK) fired.clear(); lastK = k; const fire = (key, at, snd) => { if (!fired.has(key) && k >= at) { fired.add(key); if (snd) Sfx.play(snd); } };
        if (!fired.has('m')) { fired.add('m'); if (sc.mood) Sfx.music(sc.mood); }
        (sc.fx || []).forEach((f, i) => { if (f.k === 'title') fire('f' + i, f.at[0], /회차/.test(f.text) ? 'rewind' : 'gong'); else if (f.k === 'gauge') fire('f' + i, f.at[0], f.b > f.a ? 'gauge' : 'heart'); else if (f.k === 'fire') fire('fc' + Math.floor(t / .7), 0, 'crackle'); else fire('f' + i, f.at[0], FXS[f.k]); });
        (sc.act || []).forEach((a, i) => { if (a.at) fire('a' + i, a.at[0], POS[a.pose]); if (a.sing) fire('s' + i + '_' + Math.floor(t / .55), .02, 'harp'); if (a.pose === 'walk' && a.at && k > a.at[0] && k < a.at[1]) fire('w' + i + '_' + Math.floor(t / .28), 0, 'step'); if (a.pose === 'jumpjoy' && i === (sc.act.findIndex(q => q.pose === 'jumpjoy'))) fire('j' + Math.floor(t / (Math.PI / 6)), 0, 'boing'); });
        if (sc.boss) { const b = sc.boss; fire('b', b.at ? b.at[0] : 0, BOS[b.pose]); if (b.pose === 'cast') fire('bc' + Math.floor(t / 2.6), .05, 'cast'); } };
      return { dur: D, hold: .2, base: '#0b0820', lines, draw(x, t, k) { cue(t, k); const sh = (sc.fx || []).find(f => f.k === 'shake' && k >= f.at[0] && k <= f.at[1]); x.save(); if (sh) x.translate((Math.random() - .5) * 26, (Math.random() - .5) * 18); const z = 1 + .04 * k; x.translate(640, 360); x.scale(z, z); x.translate(-640, -360); (BG[sc.bg] || BG.void)(x, t, sc); (sc.fx || []).filter(f => f.under).forEach(f => fx(x, f, t, k)); if (sc.boss) boss(x, sc.boss, t, k); (sc.act || []).forEach(a => actor(x, a, t, k)); (sc.fx || []).filter(f => !f.under && f.k !== 'shake').forEach(f => fx(x, f, t, k)); x.restore(); } }; });
  }
  const play = (scenes, cb) => Cut.play(build(scenes), cb);
  return { play, build };
})();
