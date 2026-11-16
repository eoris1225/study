'use strict';
/* 물리 기믹: 길 자체가 물리 법칙으로 움직인다 + 동료 수다 */
const Gim = (() => {
  const SETS = [['lift', 'draft'], ['lift', 'draft'], ['draft', 'lift'], ['spring', 'osc'], ['travel', 'osc'], ['standing', 'travel'], ['standing', 'spring']];
  const pill = (x, X, Y, s, col = '#fff', fg = '#2a0f5e') => { x.font = '800 13px system-ui,sans-serif'; const w = x.measureText(s).width + 18; x.fillStyle = 'rgba(42,15,94,.25)'; rrp(x, X - w / 2, Y - 9, w, 24, 12); x.fill(); x.fillStyle = col; rrp(x, X - w / 2, Y - 12, w, 24, 12); x.fill(); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, X, Y + 1); x.textBaseline = 'alphabetic'; };
  const rrp = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  const plank = (x, q, col) => { x.fillStyle = 'rgba(42,15,94,.25)'; rrp(x, q.x, q.y + 4, q.w, q.h, 7); x.fill(); x.fillStyle = col; rrp(x, q.x, q.y, q.w, q.h, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.45)'; rrp(x, q.x + 5, q.y + 3, q.w - 10, 4, 2); x.fill(); };
  const first = {}; const note = (k, lines) => { if (!first[k]) { first[k] = 1; say(lines); } };
  /* c: {plats, orbs, zones, GY, ground(a), span(v)} → 사용한 길이 */
  const make = {
    lift(pos, c) { // 등압 팽창 리프트: 올라서면 가열 → 부피 증가 → 높은 턱으로
      const GY = c.GY, q = { x: pos + 70, y: GY, w: 96, h: 16, T: 0, up(dt, t, p, on) { this.T = Math.max(0, Math.min(1, this.T + (on ? dt * .75 : -dt * .45))); const e = this.T * this.T * (3 - 2 * this.T); this.y = GY - e * 150; if (on) note('lift', [['ignis', '올라타! 내가 데울게. 기체는 뜨거워지면 부푼다고!'], ['clausia', '압력이 그대로니까 부피가 온도에 비례하는 거야. 샤를 법칙.']]); },
        draw(x, t) { const hh = GY - this.y, T = this.T; x.fillStyle = 'rgba(255,255,255,.25)'; rrp(x, this.x - 6, this.y, this.w + 12, hh + 6, 8); x.fill(); x.fillStyle = `rgba(255,${Math.round(190 - T * 110)},${Math.round(120 - T * 80)},.5)`; x.fillRect(this.x, this.y + 14, this.w, Math.max(0, hh - 12)); for (let i = 0; i < 9; i++) { const u = Math.abs(((t * (.5 + T * 2) + i * .37) % 2) - 1), v = Math.abs(((t * (.4 + T * 1.6) + i * .61) % 2) - 1); x.fillStyle = '#fff'; x.beginPath(); x.arc(this.x + 8 + u * (this.w - 16), this.y + 18 + v * Math.max(4, hh - 22), 4, 0, 7); x.fill(); } plank(x, this, '#ffd23f'); for (let i = 0; i < 3; i++) if (T > .02) { const fx = this.x + 22 + i * 26, fh = 10 + T * 14 + Math.sin(t * 12 + i) * 4; x.fillStyle = i % 2 ? '#ff8a3d' : '#ff5470'; x.beginPath(); x.moveTo(fx - 8, GY + 4); x.quadraticCurveTo(fx, GY - fh, fx + 8, GY + 4); x.fill(); } pill(x, this.x + this.w / 2, GY - 190, '올라서면 가열: T↑ → V↑ (등압)'); } };
      c.plats.push(q); c.plats.push({ x: pos + 180, y: GY - 130, w: 250, h: 430, g: 1 }); for (let k = 0; k < 4; k++) c.orbs.push({ x: pos + 215 + k * 44, y: GY - 172 }); return 520;
    },
    draft(pos, c) { // 뜨거운 공기 기둥: 데워진 공기는 팽창해 가벼워져 위로
      const GY = c.GY; c.ground(pos + 40); c.span(pos + 380); c.plats.push({ x: pos + 170, y: GY - 6, w: 80, h: 320, g: 1 });
      c.zones.push({ x: pos + 160, w: 100, up(dt, t, p) { if (p.x > this.x && p.x < this.x + this.w && p.y > GY - 330) { p.vy = Math.max(-360, p.vy - 3300 * dt); p.boost = .15; note('draft', [['ignis', '뜨거운 공기는 위로 올라가지! 타고 날아!'], ['resona', '와아— 구름도 이렇게 만들어진대요. 올라가면서 식는 거죠!']]); } },
        draw(x, t) { for (let i = 0; i < 7; i++) { const pp = (t * .6 + i / 7) % 1, X = this.x + 15 + (i * 37) % 70 + Math.sin(t * 3 + i) * 8, Y = GY - 10 - pp * 300; x.strokeStyle = `rgba(255,255,255,${.8 * (1 - pp)})`; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(X, Y + 22); x.quadraticCurveTo(X + 8, Y + 11, X, Y); x.stroke(); } for (let i = 0; i < 3; i++) { const fx = this.x + 26 + i * 24, fh = 20 + Math.sin(t * 11 + i) * 6; x.fillStyle = i % 2 ? '#ffd23f' : '#ff8a3d'; x.beginPath(); x.moveTo(fx - 9, GY - 6); x.quadraticCurveTo(fx, GY - 6 - fh * 1.5, fx + 9, GY - 6); x.fill(); } pill(x, this.x + 50, GY - 350, '뜨거운 공기는 팽창 → 상승'); } });
      for (let k = 0; k < 5; k++) c.orbs.push({ x: pos + 210, y: GY - 90 - k * 46 }); return 560;
    },
    spring(pos, c) { // 용수철 발판: 탄성 퍼텐셜 에너지 → 운동 에너지
      const GY = c.GY, q = { x: pos + 138, y: GY - 26, w: 72, h: 14, c: 0, up(dt) { this.c = Math.max(0, this.c - dt * 3); this.y = GY - 26 + Math.sin(Math.min(1, this.c) * Math.PI) * 14; }, land(p) { this.c = 1; p.vy = -1000; p.boost = .6; note('spring', [['resona', '용수철이 눌렸다 펴지면서 에너지를 돌려줘요. 통— 통—!'], ['clausia', '½kx²이 ½mv²으로. 낭비 없는 거래야. 마음에 들어.']]); },
        draw(x, t) { x.strokeStyle = '#fff'; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); const n = 6, top = this.y + 12; for (let i = 0; i <= n; i++) { const Y = top + (GY - top) * i / n; x.lineTo(this.x + this.w / 2 + (i % 2 ? -16 : 16) * (i && i < n ? 1 : 0), Y); } x.stroke(); plank(x, this, '#ff4f9a'); pill(x, this.x + this.w / 2, GY - 70, '밟으면 통! (탄성 에너지)'); } };
      c.plats.push(q); c.plats.push({ x: pos + 210, y: GY - 200, w: 240, h: 500, g: 1 }); for (let k = 0; k < 4; k++) c.orbs.push({ x: pos + 174, y: GY - 120 - k * 50 }); return 540;
    },
    osc(pos, c) { // 단진동 발판: 무거울수록 주기가 길다
      const GY = c.GY; c.ground(pos + 30); c.span(pos + 500);
      [[150, 1, '가벼움: 빠름'], [340, 4, '무거움: 느림 (T ∝ √m)']].forEach(([cx, m, lab], k) => { const w = 60 + m * 8; c.plats.push({ x: pos + cx, y: GY, w, step: 14, h: 16 + m * 5, x0: pos + cx - w / 2, up(dt, t) { this.x = this.x0 + 62 * Math.sin(t * 3.2 / Math.sqrt(m) + k); }, draw(x, t) { x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 4; x.beginPath(); const a = this.x0 - 90, n = 9; x.moveTo(a, this.y + 10); for (let i = 1; i <= n; i++) x.lineTo(a + (this.x - a) * i / n, this.y + 10 + (i % 2 ? -7 : 7) * (i < n ? 1 : 0)); x.stroke(); x.fillStyle = '#fff'; rrp(x, a - 8, this.y - 6, 8, 34, 4); x.fill(); plank(x, this, m > 1 ? '#7a2cf0' : '#2de2c6'); pill(x, this.x0 + w / 2, GY - 60 - k * 0, lab); } }); c.orbs.push({ x: pos + cx + 20, y: GY - 60 }); });
      return 660;
    },
    travel(pos, c) { // 진행파 다리: 마루를 타고 건넌다
      const GY = c.GY, n = 9, W0 = 46; c.ground(pos + 30); c.span(pos + 30 + n * W0 + 20);
      for (let i = 0; i < n; i++) c.plats.push({ x: pos + 36 + i * W0, y: GY, w: W0 - 2, step: 34, h: 14, up(dt, t, p, on) { this.y = GY - 4 + 30 * Math.sin(i * .75 - t * 2.4); if (on) note('travel', [['resona', '파도는 옆으로 가는데, 발판은 위아래로만 움직여요. 매질은 제자리!'], ['ignis', '그럼 난 왜 멀미가 나지…']]); }, draw(x) { plank(x, this, i % 2 ? '#4cc3ff' : '#2a7bff'); if (i === 4) pill(x, this.x + 20, GY - 80, '진행파: 파형만 → 이동'); } });
      for (let k = 0; k < 4; k++) c.orbs.push({ x: pos + 100 + k * 90, y: GY - 80 }); return n * W0 + 280;
    },
    standing(pos, c) { // 정상파 다리: 마디는 안 움직이고 배는 크게 출렁
      const GY = c.GY, n = 11, W0 = 44, L = n - 1; c.ground(pos + 30); c.span(pos + 30 + n * W0 + 20);
      for (let i = 0; i < n; i++) { const amp = Math.sin(2 * Math.PI * i / L), node = Math.abs(amp) < .05; c.plats.push({ x: pos + 36 + i * W0, y: GY, w: W0 - 2, step: 44, h: 14, up(dt, t, p, on) { this.y = GY - 4 + 58 * amp * Math.cos(t * 3); if (on && !node) note('standing', [['resona', '여긴 “배”예요, 제일 크게 출렁이는 곳! 안 움직이는 “마디”를 디뎌 봐요.'], ['clausia', '마디 사이 간격은 반 파장. 외워 둬.']]); }, draw(x) { plank(x, this, node ? '#ffd23f' : '#ff4f9a'); if (node) pill(x, this.x + 19, GY + 40, '마디'); else if (Math.abs(Math.abs(amp) - 1) < .1) pill(x, this.x + 19, GY - 96, '배'); } }); }
      for (let k = 0; k < 3; k++) c.orbs.push({ x: pos + 36 + [2.5, 5, 7.5][k] * W0 + 19, y: GY - 110 }); return n * W0 + 280;
    }
  };
  /* ---------- 동료 수다 ---------- */
  const BANTER = [
    [['ignis', '아, 배고파. 누가 열 좀 안 흘렸나?'], ['clausia', '열을 흘리는 건 당신뿐이야.']],
    [['resona', '둘 다 발 박자가 안 맞아요. 하나, 둘, 하나, 둘!'], ['ignis', '난 4행정이라 박자가 넷이야!']],
    [['clausia', '…춥지는 않아? 아니, 걱정하는 게 아니라 효율 얘기야.'], ['ignis', '오, 걱정해 주는 거야?'], ['clausia', '효율 얘기라고 했어.']],
    [['ignis', '{name}, 저 덩어리 내가 태워 버릴까?'], ['clausia', '이해해야 사라진다니까. 태우면 엔트로피만 늘어.']],
    [['resona', '클라우지아 씨 모자, 은근히 음이 높아요. 톡 치면 “라” 소리 나요.'], ['clausia', '치지 마.']],
    [['ignis', '난 받은 열은 꼭 일로 갚아. 그게 의리지.'], ['clausia', '전부는 못 갚잖아. 일부는 버리지.'], ['ignis', '…그건 우주 탓이야.']],
    [['resona', '방금 바람 소리 들었어요? 진동수가 440 Hz쯤 됐어요!'], ['ignis', '난 그냥 “휘잉”으로 들렸는데.']],
    [['clausia', '이그니스. 아까 계산, 틀리지 않았더라.'], ['ignis', '뭐? 칭찬이야?!'], ['clausia', '기록이야.']],
    [['resona', '{name} 님 걸음걸이는 주기가 일정해서 좋아요. 메트로놈 같아요!']],
    [['ignis', '레조나, 넌 왜 맨날 통통 뛰어?'], ['resona', '걷는 것보다 에너지가 덜 들거든요! …아마도요!']],
    [['clausia', '확률적으로, 우리가 이 길에서 길을 잃을 가능성은 낮아.'], ['ignis', '길이 하나뿐이잖아.'], ['clausia', '그래서 낮다고.']],
    [['ignis', '시험 끝나면 뭐 할 거야?'], ['resona', '노래요!'], ['clausia', '복습.'], ['ignis', '…난 잘 건데.']]
  ];
  let queue = [], cur = null, wait = 6, used = 0;
  function say(lines) { const ok = lines.filter(l => S.party.includes(l[0])); if (ok.length) queue = ok.slice(); }
  function tick(dt, busy) { if (busy) { cur = null; queue = []; return; } if (cur) { cur.life -= dt; if (cur.life <= 0) cur = null; return; } if (queue.length) { const l = queue.shift(); cur = { id: l[0], s: T(l[1]), life: 1.6 + l[1].length * .06 }; wait = 7 + Math.random() * 6; return; } wait -= dt; if (wait <= 0 && S.party.length) { say(BANTER[(used++ * 5 + S.party.length) % BANTER.length]); wait = 3; } }
  function bubble(x, pos) { if (!cur) return; const q = pos(cur.id); if (!q) return; x.font = '800 15px system-ui,sans-serif'; const words = cur.s.split(' '), lines = ['']; words.forEach(w => { if (x.measureText(lines[lines.length - 1] + ' ' + w).width > 230) lines.push(w); else lines[lines.length - 1] += (lines[lines.length - 1] ? ' ' : '') + w; }); const w = Math.max(...lines.map(l => x.measureText(l).width)) + 26, h = lines.length * 20 + 16, k = Math.min(1, (1.6 + cur.s.length * .06 - cur.life) * 6, cur.life * 5), X = q.x, Y = q.y - 86; x.save(); x.translate(X, Y); x.scale(k, k); x.fillStyle = 'rgba(42,15,94,.25)'; rrp(x, -w / 2, -h + 4, w, h, 14); x.fill(); x.fillStyle = '#fff'; rrp(x, -w / 2, -h, w, h, 14); x.fill(); x.beginPath(); x.moveTo(-8, -1); x.lineTo(0, 12); x.lineTo(8, -1); x.fill(); x.fillStyle = '#2a0f5e'; x.textAlign = 'center'; lines.forEach((l, i) => x.fillText(l, 0, -h + 24 + i * 20)); x.restore(); }
  return { pick: (ci, r) => { const s = SETS[ci % SETS.length]; return s[Math.floor(r * s.length)]; }, make, tick, bubble, say };
})();
