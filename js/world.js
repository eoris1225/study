'use strict';
/* 횡스크롤 월드 */
const World = (() => {
  const H = 540, GY = 430, PW = 26, PH = 50;
  let cv, x, W = 960, VH = 540, sc = 1, raf = 0, last = 0, t = 0;
  let zones = [], shake = 0; let ch, th, plats, orbs, slimes, events, endX, p, cam, hist, fx, busy, banner, bannerT, floatTxt;
  const keys = {}, pad = { l: 0, r: 0, j: 0 };
  const stage = () => $('#stage');
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }; }

  function groupEvents(steps) {
    const ev = []; let from = 0;
    steps.forEach((s, i) => {
      if (s.t === 'game') { ev.push({ from, to: i, kind: s.boss ? 'boss' : 'monster', st: s }); from = i + 1; }
      else if (s.t === 'recruit') { ev.push({ from, to: i, kind: 'recruit', id: s.id }); from = i + 1; }
      else if (s.t === 'camp') { ev.push({ from, to: i, kind: 'camp' }); from = i + 1; }
    });
    ev.push({ from, to: steps.length - 1, kind: 'portal' });
    return ev;
  }
  function build(ci) {
    ch = ci; th = Art.THEMES[ci % Art.THEMES.length]; const R = rng(ci * 7919 + 101), steps = G.chapters[ci].steps;
    plats = []; orbs = []; slimes = []; zones = []; events = groupEvents(steps); fx = []; floatTxt = [];
    let cur = 0, spanStart = -400; const ground = (a, b) => plats.push({ x: a, y: GY, w: b - a, h: 300, g: 1 });
    events.forEach((ev, i) => {
      const dist = i === 0 ? 620 : 1700 + R() * 500, ex = cur + dist; let pos = cur + (i === 0 ? 9999 : 260);
      while (pos < ex - 1150) {
        if (R() < .5 && pos < ex - 1450) { const gk = Gim.pick(ci, R()); pos += Gim.make[gk](pos, { plats, orbs, zones, GY, ground: a => ground(spanStart, a), span: v => { spanStart = v; } }); continue; }
        const r = Math.floor(R() * 5);
        if (r === 0) { slimes.push({ x: pos + 120, y: GY, a: pos + 30, b: pos + 230, d: 1, dead: 0 }); for (let k = 0; k < 3; k++) orbs.push({ x: pos + 70 + k * 40, y: GY - 120 }); pos += 330; }
        else if (r === 1) { const w = 120 + R() * 30; ground(spanStart, pos); spanStart = pos + w; for (let k = 0; k < 3; k++) orbs.push({ x: pos + w / 2 + (k - 1) * 40, y: GY - 90 - (k === 1 ? 30 : 0) }); pos += w + 210; }
        else if (r === 2) { plats.push({ x: pos + 30, y: GY - 70, w: 100, h: 18 }, { x: pos + 180, y: GY - 140, w: 110, h: 18 }); for (let k = 0; k < 3; k++) orbs.push({ x: pos + 205 + k * 30, y: GY - 172 }); slimes.push({ x: pos + 380, y: GY, a: pos + 320, b: pos + 460, d: -1, dead: 0 }); pos += 500; }
        else if (r === 3) { ground(spanStart, pos); spanStart = pos + 300; plats.push({ x: pos + 90, y: GY - 20, w: 120, h: 18 }); for (let k = 0; k < 3; k++) orbs.push({ x: pos + 120 + k * 30, y: GY - 62 }); pos += 520; }
        else { for (let k = 0; k < 5; k++) orbs.push({ x: pos + 40 + k * 36, y: GY - 40 - Math.sin(k / 4 * Math.PI) * 60 }); pos += 260; }
      }
      ev.x = ex; ev.done = false; cur = ex; ev.hov = 0; ev.sx = ex - 60;
      if (ev.kind === 'monster' || ev.kind === 'boss') { const gk = ['lift', 'lift', 'draft', 'spring', 'spring', 'standing', 'standing'][ci % 7], off = { lift: 250, draft: 160, spring: 280, standing: 335 }[gk], a0 = ex - off; Gim.make[gk](a0, { plats, orbs: [], zones, GY, ground: a => ground(spanStart, a), span: v => { spanStart = v; } }); ev.hov = { lift: 215, draft: 250, spring: 285, standing: 150 }[gk]; ev.sx = { lift: a0 + 300, draft: a0 + 430, spring: a0 + 330, standing: a0 + 590 }[gk]; ev.gk = gk; cur = Math.max(cur, ev.sx + 60); }
    });
    endX = cur + 500; ground(spanStart, endX + 600);
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    sc = Math.min(h / H, w / 720); W = w / sc; VH = h / sc; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; x.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
  }
  function spawnAt(xx) { p = { x: xx, y: GY - PH - 330, vx: 0, vy: 0, on: false, dir: 1, hp: 3 + ((S.up || {}).hp ? 1 : 0), inv: 0, coy: 0, safe: xx, walk: 0 }; cam = Math.max(-200, xx - W * .35); hist = []; for (let i = 120; i >= 0; i--) hist.push({ x: xx - i * 3, y: GY - PH, dir: 1, walk: 0, on: true }); }

  function load() {
    $('#game').hidden = false; stage().className = ''; stage().innerHTML = '';
    if (!cv) { cv = $('#world'); x = cv.getContext('2d'); addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200)); bind(); }
    resize(); Gim.reset(); build(S.ch);
    let sx = 80; events.forEach(ev => { if (S.step > ev.to) { ev.done = true; sx = ev.sx; } });
    spawnAt(sx); busy = false; banner = G.chapters[S.ch].title; bannerT = 3.2;
    $('#chTitle').textContent = G.chapters[S.ch].title;
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; $('#game').hidden = true; }

  function bind() {
    addEventListener('keydown', e => { if ($('#game').hidden) return; keys[e.code] = 1; if (!busy && $('#modal').hidden && ['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
    addEventListener('keyup', e => { keys[e.code] = 0; });
    const hook = (id, k) => { const b = $(id); b.oncontextmenu = e => e.preventDefault(); b.onpointerdown = e => { pad[k] = 1; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) { } }; b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => pad[k] = 0; };
    hook('#pL', 'l'); hook('#pR', 'r'); hook('#pJ', 'j');
  }

  function say(text, col = '#ffd166') { floatTxt.push({ x: p.x, y: p.y - 30, s: text, col, life: 1.1 }); }
  function burst(X, Y, col, n = 12) { for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = 60 + Math.random() * 160; fx.push({ x: X, y: Y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: .7, col }); } }
  function hurt() {
    if (p.inv > 0) return; p.hp--; p.inv = 1.4; Sfx.play('hurt'); shake = .3; burst(p.x, p.y + 20, '#ff6b6b', 8); say('아얏!', '#ff8a8a');
    if (p.hp <= 0) { p.hp = 3; p.x = p.safe; p.y = GY - PH - 330; p.vx = p.vy = 0; say('다시 일어선다!', '#9fe3ff'); }
  }

  function runEvent(ev) {
    busy = true; p.vx = 0; pad.l = pad.r = pad.j = 0; for (const k in keys) keys[k] = 0;
    const steps = G.chapters[ch].steps, sg = stage(); let i = Math.max(ev.from, S.step);
    (function go() {
      if (i > ev.to) return finish(ev);
      const s = steps[i], nx = () => { i++; S.step = i; save(); go(); };
      if (s.t === 'say') { sg.className = 'dlgmode'; renderSay(sg, s, nx); }
      else if (s.t === 'choice') { sg.className = 'dlgmode'; renderChoice(sg, s, nx); }
      else if (s.t === 'game') { sg.className = 'full'; gamePanel(sg, s, ch, i, nx); sg.scrollTop = 0; }
      else if (s.t === 'recruit') { sg.className = 'full'; recruit(sg, s, nx); }
      else if (s.t === 'fate') Loops.fate(s, () => { $('#game').hidden = false; cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); nx(); });
      else if (s.t === 'camp') {
        sg.className = 'dlgmode'; sg.innerHTML = ''; const d = mk('div', 'gp', '<h2>🏕 야영지</h2><div class="brief">모닥불이 타오른다. 동료들과 이야기를 나누고 다음 여정을 준비하자. (체력 회복!)</div>'); p.hp = 3;
        const r = mk('div', 'btnrow'), a = mk('button', '', '💬 동료와 대화'), b = mk('button', 'pri', '길을 떠난다'); a.onclick = openCamp; b.onclick = nx; r.appendChild(a); r.appendChild(b); d.appendChild(r); sg.appendChild(d);
      } else nx();
    })();
  }
  function finish(ev) {
    const sg = stage(); sg.className = ''; sg.innerHTML = ''; ev.done = true; busy = false; p.safe = ev.sx; Sfx.play('win'); shake = .35;
    if (ev.kind === 'monster' || ev.kind === 'boss') { burst(ev.x + 50, GY - 30, '#ffd166', 30); const n = ev.kind === 'boss' ? 10 : 5; for (let k = 0; k < n; k++) orbs.push({ x: ev.x + 30 + k * 26, y: GY - 60 - (k % 2) * 30 }); say(ev.kind === 'boss' ? '보스 격파!' : '격파!'); }
    if (ev.kind === 'recruit') { burst(ev.x + 50, GY - 40, '#9fe3ff', 24); say('동료가 되었다!', '#9fe3ff'); }
    if (ev === events[events.length - 1]) {
      S.cleared[ch] = true; S.ch = ch + 1; S.step = 0; save(); banner = '✦ 챕터 클리어 ✦'; bannerT = 2.2; busy = true;
      const doneCh = ch; setTimeout(() => { const go = () => { if (G.chapters[S.ch]) load(); else { stop(); ending(); } }; const secs = PSEC.filter(q => q.ch === doneCh); if (!secs.length) return go(); const sg = stage(); sg.className = 'full'; sg.innerHTML = ''; const d = mk('div', 'gp', `<h2>🎉 ${doneCh + 1}장 클리어!</h2><div class="brief">이제 이 단원의 <b>실제 학교 문제</b>를 풀어 볼 차례예요. 문제집에서 풀고 오면 실력이 붙어요.</div>`); const r = mk('div', 'btnrow'); secs.forEach(q => { const bt = mk('button', 'pri', '📝 ' + q.title); bt.onclick = () => openWorkbook(q.id); r.appendChild(bt); }); const nx = mk('button', '', '다음 장으로 ▶'); nx.onclick = go; r.appendChild(nx); d.appendChild(r); sg.appendChild(d); }, 2000);
    }
  }

  function update(dt) {
    t += dt; if (bannerT > 0) bannerT -= dt;
    const next = events.find(e => !e.done);
    if (!busy && $('#modal').hidden) {
      const L = keys.ArrowLeft || keys.KeyA || pad.l, Rr = keys.ArrowRight || keys.KeyD || pad.r, J = keys.Space || keys.ArrowUp || keys.KeyW || pad.j;
      const tv = (Rr ? 1 : 0) - (L ? 1 : 0); p.vx += (tv * 250 - p.vx) * Math.min(1, dt * 12); if (tv) p.dir = tv; p.walk = Math.abs(p.vx) > 30;
      p.coy = p.on ? .1 : p.coy - dt;
      if (J && p.coy > 0 && !p.jl) { const pv = p.gq && p.gq.vyp < -40 ? p.gq.vyp * 2.3 : 0; p.vy = -590 + pv; if (pv) { p.boost = .5; say('타이밍 점프!', '#fff'); Sfx.play('spring'); } else Sfx.play('jump'); p.coy = 0; p.on = false; p.dj = 1; burst(p.x, p.y + PH, '#ffffff', 4); }
      else if (J && !p.jl && !p.on && p.dj && (S.up || {}).dj) { p.vy = -520; p.dj = 0; Sfx.play('jump2'); burst(p.x, p.y + PH, '#ffd23f', 8); } p.jl = J;
      if (!J && p.vy < -220 && !(p.boost > 0)) p.vy = -220;
      if (J && S.look.wings && p.vy > 110) p.vy = 110; // 요정은 점프를 누르고 있으면 활공
    } else { p.vx *= .8; p.walk = false; }
    if (p.boost > 0) p.boost -= dt; Gim.tick(dt, busy);
    for (const q of plats) if (q.up) { const ox = q.x, oy = q.y; q.up(dt, t, p, p.gq === q); q.vyp = (q.y - oy) / Math.max(dt, .001); if (p.gq === q) { p.x += q.x - ox; p.y += q.y - oy; } }
    for (const z of zones) z.up(dt, t, p);
    p.vy += 1500 * dt; if (p.inv > 0) p.inv -= dt;
    // X
    let nx = p.x + p.vx * dt; if (nx < -150) nx = -150; if (next && nx > next.x + (next.hov ? 96 : -46)) nx = next.x + (next.hov ? 96 : -46); if (nx > endX) nx = endX;
    for (const q of plats) if (nx + PW / 2 > q.x && nx - PW / 2 < q.x + q.w && p.y + PH > q.y + 4 && p.y < q.y + q.h) { if (!q.step && (q.g || p.y + PH > q.y + 10)) { nx = p.vx > 0 ? q.x - PW / 2 : q.x + q.w + PW / 2; p.vx = 0; } }
    p.x = nx;
    // Y
    let ny = p.y + p.vy * dt; p.on = false; const pg = p.gq; p.gq = null;
    for (const q of plats) if (p.x + PW / 2 > q.x + 2 && p.x - PW / 2 < q.x + q.w - 2) {
      if (p.vy >= 0 && p.y + PH <= q.y + (q.step || 6) && ny + PH >= q.y) { if (p.vy > 500) Sfx.play('land'); if (q.g) p.combo = 0; ny = q.y - PH; p.vy = 0; p.on = true; if (!q.g || !p.gq) p.gq = q; if (q.g) p.safe = Math.max(q.x + 30, Math.min(q.x + q.w - 30, p.x)); }
      else if (!q.g && p.vy < 0 && p.y >= q.y + q.h - 4 && ny <= q.y + q.h) { ny = q.y + q.h; p.vy = 0; }
    }
    p.y = ny; if (p.gq && p.gq !== pg && p.gq.land) p.gq.land(p);
    if (p.y > H + 120) { p.inv = 0; hurt(); p.x = p.safe; p.y = GY - PH - 330; p.vx = p.vy = 0; }
    // orbs
    if ((S.up || {}).mag) for (const o of orbs) if (!o.got) { const dx = p.x - o.x, dy = p.y + PH / 2 - o.y, d = Math.hypot(dx, dy); if (d < 150 && d > 1) { o.x += dx / d * 420 * dt; o.y += dy / d * 420 * dt; } }
    for (const o of orbs) if (!o.got && Math.abs(o.x - p.x) < 26 && Math.abs(o.y - (p.y + PH / 2)) < 36) { o.got = 1; Sfx.play('orb'); S.orbs = (S.orbs || 0) + 1; burst(o.x, o.y, '#ffe27a', 5); if (S.orbs % 25 === 0) { say('공명 조각 ' + S.orbs + '개! 전투 생명 +1', '#ffe27a'); save(); } }
    // slimes
    for (const s of slimes) {
      if (s.dead) { s.dead += dt; continue; } s.x += s.d * 46 * dt; if (s.x > s.b) s.d = -1; if (s.x < s.a) s.d = 1;
      if (Math.abs(s.x - p.x) < 26 && p.y + PH > s.y - 24 && p.y < s.y) { if (p.vy > 80 && p.y + PH < s.y - 4) { s.dead = .01; p.vy = -420; p.dj = 1; Sfx.play('stomp'); shake = .15; p.combo = (p.combo || 0) + 1; if (p.combo > 1) { say(p.combo + ' 콤보! +' + p.combo, '#ffd23f'); S.orbs = (S.orbs || 0) + p.combo; } burst(s.x, s.y - 12, th.slime, 10); orbs.push({ x: s.x, y: s.y - 70 }); } else if (!busy) { hurt(); p.vx = (p.x < s.x ? -1 : 1) * 260; p.vy = -260; } }
    }
    // events
    if (!busy && next) {
      if (next.hov > 4) { const X = next.x + 50, my = GY - next.hov, sc2 = next.kind === 'boss' ? 2 : 1.15; if (Math.abs(p.x - X) < 380) { next.near = (next.near || 0) + dt; if (next.near > 28) next.hov = Math.max(0, next.hov - 90 * dt); }
        if (Math.abs(p.x - X) < 30 * sc2 + 13 && p.y < my + 6 && p.y + PH > my - 56 * sc2) { Sfx.play('bonk'); shake = .4; burst(X, my - 30, '#fff', 24); say('잡았다!', '#fff'); p.vy = -300; next.hov = 0; runEvent(next); } }
      else if (p.on && Math.abs(next.x - p.x) < 150) runEvent(next);
    }
    if (shake > 0) shake -= dt;
    cam += (Math.max(-200, Math.min(endX + 300 - W, p.x - W * .38)) - cam) * Math.min(1, dt * 6);
    { const h = hist[hist.length - 1]; if (!h || Math.hypot(p.x - h.x, p.y - h.y) > 3) { hist.push({ x: p.x, y: p.y, dir: p.dir, walk: p.walk, on: p.on }); if (hist.length > 400) hist.shift(); } else { h.dir = p.dir; h.on = p.on; } }
    for (const f of fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 500 * dt; f.life -= dt; } fx = fx.filter(f => f.life > 0);
    for (const f of floatTxt) { f.y -= 40 * dt; f.life -= dt; } floatTxt = floatTxt.filter(f => f.life > 0);
  }

  function draw() {
    x.save(); x.fillStyle = th.sky[0]; x.fillRect(0, 0, W, VH); x.translate(0, VH - H);
    Art.bg(x, W, H, cam, th, t, GY); if (VH > H) { x.fillStyle = th.sky[0]; x.fillRect(0, -(VH - H), W, VH - H + 1); }
    x.translate(-cam + (shake > 0 ? (Math.random() - .5) * 14 * shake / .4 : 0), shake > 0 ? (Math.random() - .5) * 10 * shake / .4 : 0);
    for (const q of plats) if (q.x + q.w > cam && q.x < cam + W) { if (q.draw) q.draw(x, t); else Art.ground(x, q.x, q.y, q.w, q.h, th, !q.g); }
    for (const z of zones) if (z.x + 300 > cam && z.x - 200 < cam + W) z.draw(x, t);
    const next = events.find(e => !e.done);
    events.forEach((ev, i) => {
      if (ev.x < cam - 300 || ev.x > cam + W + 300) return; const X = ev.x + 50;
      if (ev.kind === 'camp') Art.campfire(x, X - 30, GY, t);
      else if (ev.kind === 'portal') Art.portal(x, X + 10, GY, t);
      else if (ev.kind === 'recruit') { if (!ev.done) { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(X, GY, 16, 4, 0, 0, 7); x.fill(); if (ev.id === 'ignis' && Math.abs(p.x - X) > 190) { x.save(); x.translate(X, GY - 10); x.rotate(-Math.PI / 2); Art.chibi(x, 0, 0, 1.35, compC(ev.id), { t: 0, dir: 1 }); x.restore(); x.fillStyle = '#fff'; x.font = '800 16px sans-serif'; x.fillText('z' + (Math.floor(t * 2) % 2 ? 'Z' : 'z'), X + 30, GY - 50 - (t * 20 % 20)); } else Art.chibi(x, X, GY, 1.35, compC(ev.id), { t, dir: -1 }); } }
      else if (!ev.done) { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(X, GY, ev.kind === 'boss' ? 50 : 28, 6, 0, 0, 7); x.fill(); Art.monster(x, X, GY - (ev.hov || 0) + (ev.hov ? Math.sin(t * 2.2 + i) * 8 : 0), ev.kind === 'boss' ? 2 : 1.15, (i + ch) % 4, ev.kind === 'boss' ? '#b0457a' : th.slime, t, ev.kind === 'boss'); }
      if (ev === next && !busy) { Art.marker(x, X, GY - (ev.hov || 0) - (ev.kind === 'boss' ? 160 : ev.kind === 'recruit' ? 120 : 108), t, ev.kind); if (ev.hov > 4 && Math.abs(p.x - X) < 420) { x.font = '800 14px system-ui,sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = 'rgba(42,15,94,.6)'; const tip = { lift: '리프트에 올라 데워서 올라가 덩어리를 잡아라!', draft: '뜨거운 공기를 타고 올라가 잡아라!', spring: '용수철을 밟고 튀어 올라 잡아라!', standing: '“배”에서 올라가는 순간 점프! 덩어리를 잡아라!' }[ev.gk]; x.strokeText(tip, X - 60, GY + 70); x.fillStyle = '#fff'; x.fillText(tip, X - 60, GY + 70); } }
    });
    for (const o of orbs) if (!o.got && o.x > cam - 20 && o.x < cam + W + 20) Art.orb(x, o.x, o.y, t);
    for (const s of slimes) if (s.x > cam - 40 && s.x < cam + W + 40 && (!s.dead || s.dead < .35)) Art.slime(x, s.x, s.y, th.slime, t + s.a, !!s.dead);
    // companions
    /* 동료: 주인공이 지나온 길을 따라 일정 거리(64px)씩 떨어져 따라온다. 멈춰 있어도 간격 유지 */
    const trail = D => { let acc = 0; for (let j = hist.length - 1; j > 0; j--) { const a = hist[j], b = hist[j - 1], d = Math.hypot(a.x - b.x, a.y - b.y); if (acc + d >= D) { const u = (D - acc) / d; return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, on: b.on, dir: a.dir }; } acc += d; } return hist[0] || p; };
    const gaps = []; S.party.reduce((acc, id, k) => { const g = acc + 58 + (id === 'ignis' || S.party[k - 1] === 'ignis' ? 20 : 0); gaps.push(g); return g; }, 0);
    for (let k = S.party.length - 1; k >= 0; k--) { const id = S.party[k], hI = trail(gaps[k]), L = compC(id), fdir = Math.abs(hI.x - p.x) > 8 ? Math.sign(p.x - hI.x) : p.dir; if (hI.on) { x.fillStyle = 'rgba(20,6,60,.2)'; x.beginPath(); x.ellipse(hI.x, hI.y + PH, 13, 3.5, 0, 0, 7); x.fill(); } Art.chibi(x, hI.x, hI.y + PH, L.wings ? 1 : 1.14, L, { t: t + k * 1.7, walk: !!p.walk, dir: fdir, air: !hI.on }); }
    Gim.bubble(x, id => { const k = S.party.indexOf(id); if (k < 0) return null; const h = trail(gaps[k]); return { x: h.x, y: h.y + PH }; });
    // player
    if (p.on) { x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(p.x, p.y + PH, 14, 4, 0, 0, 7); x.fill(); }
    if (!(p.inv > 0 && Math.floor(t * 14) % 2)) Art.chibi(x, p.x, p.y + PH, 1.2, S.look, { t, walk: p.walk, dir: p.dir, air: !p.on });
    for (const f of fx) { x.globalAlpha = Math.max(0, f.life / .7); x.fillStyle = f.col; x.fillRect(f.x - 3, f.y - 3, 6, 6); } x.globalAlpha = 1;
    for (const f of floatTxt) { x.globalAlpha = Math.min(1, f.life * 2); x.fillStyle = f.col; x.font = 'bold 18px serif'; x.textAlign = 'center'; x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeText(f.s, f.x, f.y); x.fillText(f.s, f.x, f.y); } x.globalAlpha = 1;
    x.translate(cam, 0); Art.fg(x, W, H, cam, th, t, GY);
    x.restore();
    // HUD
    for (let k = 0; k < Math.max(3, p.hp); k++) Art.heart(x, 26 + k * 30, 28, 11, k < p.hp);
    Art.orb(x, 26, 62, 0); x.textAlign = 'left'; x.font = '800 18px system-ui,sans-serif'; x.lineWidth = 4; x.strokeStyle = 'rgba(42,15,94,.55)'; x.strokeText(S.orbs || 0, 44, 69); x.fillStyle = '#fff'; x.fillText(S.orbs || 0, 44, 69);
    if (next && !busy && next.x > cam + W) { x.fillStyle = `rgba(255,209,102,${.6 + .4 * Math.sin(t * 5)})`; x.font = 'bold 26px serif'; x.textAlign = 'right'; x.fillText('▶▶', W - 14, VH / 2); }
    if (bannerT > 0) { const k = Math.min(1, bannerT), e = bannerT > 2 ? Art.ease.back(Math.min(1, (3.2 - bannerT) * 4 + .2)) : 1; x.globalAlpha = k; x.font = '800 26px system-ui,sans-serif'; x.textAlign = 'center'; const bw = x.measureText(banner).width + 64, by = VH * .3; x.save(); x.translate(W / 2, by); x.scale(e, e); x.fillStyle = 'rgba(42,15,94,.25)'; rr(x, -bw / 2, 6, bw, 58, 29); x.fill(); x.fillStyle = '#fff'; rr(x, -bw / 2, 0, bw, 58, 29); x.fill(); x.fillStyle = '#ff5f8f'; rr(x, -bw / 2 + 10, 10, 8, 38, 4); x.fill(); x.fillStyle = '#2a0f5e'; x.fillText(banner, 4, 39); x.restore(); x.globalAlpha = 1; }
    $('#pad').style.display = busy ? 'none' : '';
  }
  function frame(now) { const dt = Math.min(.033, (now - last) / 1000); last = now; update(dt); draw(); raf = requestAnimationFrame(frame); }
  function skip() { const n = events.find(e => !e.done); if (!n) return; S.step = n.to + 1; if (n === events[events.length - 1]) { S.cleared[ch] = true; S.ch = ch + 1; S.step = 0; } save(); const sg = stage(); sg.className = ''; sg.innerHTML = ''; run(); }
  return { skip, load, stop, _dbg: () => ({ p, plats, slimes, events, busy, GY }) };
})();
