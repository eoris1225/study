'use strict';
/* 5장(파동) 개념 컷신 */
window.CUTS = window.CUTS || {};
(() => {
  const { seg, cl, E, plain, pill, text, arrow, dbl, dimH, dimV, rope, ball, ring, fan, clock, coil } = CX;
  const TAU = Math.PI * 2, SEA = Art.THEMES[4], GY = 600;
  const sea = (x, t) => { Art.bg(x, 1280, 720, 0, SEA, t, GY); Art.ground(x, -40, GY, 1360, 200, SEA, false); };
  const post = (x, X) => { x.fillStyle = '#8a4a2c'; rr(x, X - 12, 380, 24, GY - 378, 8); x.fill(); x.fillStyle = '#a8643a'; rr(x, X - 16, 372, 32, 16, 8); x.fill(); };
  const sine = (A, lam, x0, ph) => X => -A * Math.sin(TAU * (X - x0) / lam - ph);
  const BEAD0 = 100 + 23, beadX = n => BEAD0 + 46 * n;
  const hi = (x, X, Y, t, col = '#ffd23f') => { ring(x, X, Y, 24, '#fff', t); ball(x, X, Y, 17, col); };
  const resona = (x, X, t, walk) => Art.chibi(x, X, GY, 3, Object.assign({ name: '' }, CH.resona.look), { t, dir: 1, walk });

  /* ---------- 5a: 파동이란 ---------- */
  CUTS['5a'] = [
    { dur: 6, lines: [[0, 'narr', '바다의 노래가 멈춘 해안.'], [1.4, 'resona', '이 줄 끝을 한 번 툭 흔들어 볼게!'], [3.2, 'narr', '한 곳의 흔들림이 옆으로, 또 옆으로 전해진다. 이게 <b>파동</b>이다.']],
      draw(x, t) {
        sea(x, t); post(x, 1190);
        const c = 330, f = X => { const u = (X - 230) - c * (t - 1.6); return -80 * Math.exp(-((u / 75) ** 2)); };
        rope(x, 230, 1190, 430, f, { gap: 46 }); resona(x, 160, t, false);
        if (t > 3.2) pill(x, 230 + c * (t - 1.6), 300, '파동 →', (t - 3.2) * 3, '#ffd23f');
      } },
    { dur: 7.5, lines: [[0, 'narr', '그럼 줄 위의 <b>이 구슬</b>은 파동을 따라 오른쪽으로 갈까?'], [3.2, 'narr', '아니. 제자리에서 <b>위아래로만</b> 오르내린다.'], [5.4, 'narr', '앞으로 가는 건 <b>흔들림(에너지)</b>뿐. 줄은 그대로다.']],
      draw(x, t) {
        sea(x, t); post(x, 1190);
        const A = 70 * E.io(seg(t, 0, 1)), f = sine(A, 340, 100, t * TAU * .45), BX = beadX(11);
        rope(x, 100, 1190, 420, f);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.setLineDash([6, 10]); x.lineWidth = 3; x.beginPath(); x.moveTo(BX, 420 - 90); x.lineTo(BX, 420 + 90); x.stroke(); x.setLineDash([]);
        hi(x, BX, 420 + f(BX), t);
        if (t > 1 && t < 3.6) { arrow(x, BX + 40, 300, BX + 200, 300, 'rgba(255,255,255,.9)', 10, seg(t, 1, 1.6)); text(x, '?', BX + 230, 300, 60, '#ffd23f', seg(t, 1.6, 2)); }
        if (t >= 3.2) { const k = seg(t, 3.2, 3.6); x.save(); x.globalAlpha = .35; arrow(x, BX + 40, 300, BX + 200, 300, '#fff', 10, 1); x.restore(); x.strokeStyle = '#ff4f6d'; x.lineWidth = 12; x.beginPath(); x.moveTo(BX + 95, 270); x.lineTo(BX + 95 + 50 * k, 270 + 60 * k); x.moveTo(BX + 145, 270); x.lineTo(BX + 145 - 50 * k, 270 + 60 * k); x.stroke(); dbl(x, BX - 60, 330, 510, '#ffd23f', 9, seg(t, 3.4, 4)); pill(x, BX - 60, 560, '제자리 진동', seg(t, 3.8, 4.3), '#ffd23f'); }
        if (t > 5.4) { const p = (t - 5.4) * 260; arrow(x, 120, 230, 120 + Math.min(1000, p), 230, '#ff8a3c', 14, 1); pill(x, 120 + Math.min(1000, p) - 80, 180, '에너지', seg(t, 5.6, 6), '#ff8a3c', '#fff'); }
      } },
    { dur: 7, base: '#1f6fe0', lines: [[0, 'narr', '경기장 파도타기 응원과 똑같다.'], [2.4, 'narr', '파도는 관중석을 따라 쭉 지나가지만'], [4.4, 'narr', '사람들은 <b>자기 자리에서</b> 일어났다 앉을 뿐이다.']],
      draw(x, t) {
        const g = x.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, '#1f6fe0'); g.addColorStop(1, '#8ff0e6'); x.fillStyle = g; x.fillRect(-400, -300, 2080, 1320);
        x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(160 + i * 260, 110, 18, 0, 7); x.fill(); x.fillRect(150 + i * 260, 110, 20, 120); }
        const cols = ['#ff5f8f', '#ffd23f', '#22c4a0', '#7a5cff', '#ff8a3c', '#4cc2ff'], skins = ['#ffb594', '#f9a77c', '#ffc2c0', '#d98a62'], crest = -150 + 230 * (t - .3);
        for (let row = 0; row < 2; row++) {
          const base = row ? 600 : 470, s = row ? 1.15 : .9, sp = row ? 96 : 84, off = row ? 50 : 20;
          x.fillStyle = row ? '#2a1a7a' : '#40238f'; rr(x, -60, base - 4, 1400, 30, 14); x.fill();
          for (let i = 0; i < 16; i++) { const cx = off + i * sp, up = Math.exp(-(((cx - crest) / 110) ** 2)); fan(x, cx, base, cols[(i + row * 3) % 6], skins[(i + row) % 4], up, s); }
        }
        x.fillStyle = '#2a1a7a'; rr(x, -60, 626, 1400, 120, 0); x.fill();
        const HX = 50 + 6 * 96; if (t > 4.4) { const up = Math.exp(-(((HX - crest) / 110) ** 2)); ring(x, HX, 600 - 100 * 1.15 - up * 34 * 1.15, 40, '#fff', t); dbl(x, HX + 70, 380, 540, '#ffd23f', 9, seg(t, 4.4, 5)); pill(x, HX, 300, '자리는 그대로', seg(t, 4.8, 5.3), '#ffd23f'); }
        if (t > 2.4) arrow(x, Math.max(60, crest - 260), 240, Math.max(80, crest), 240, '#ff8a3c', 14, 1);
      } },
    { dur: 6, base: '#2a1a7a', lines: [[0, 'narr', '정리하면.'], [1.2, 'narr', '<b>파동</b>은 진동이 퍼져 나가는 것, <b>매질</b>은 그 진동을 전해 주는 물질.'], [3.8, 'narr', '매질은 제자리에서 진동하고, <b>에너지만</b> 전달된다.']],
      draw(x, t) {
        plain(x, '#2a1a7a', '#5a3fc0', t);
        const f = sine(70, 340, 100, t * TAU * .45), BX = beadX(13);
        rope(x, 100, 1180, 400, f, { bead: '#ff9fc4', col: '#c9b6ff' }); hi(x, BX, 400 + f(BX), t);
        arrow(x, 140, 220, 140 + 980 * E.io(seg(t, 1.2, 2.4)), 220, '#ff8a3c', 16, 1);
        pill(x, 640, 160, '파동 = 에너지가 이동 →', seg(t, 1.6, 2.1), '#ff8a3c', '#fff', 30);
        dbl(x, BX + 70, 310, 490, '#ffd23f', 9, seg(t, 3.8, 4.3)); pill(x, BX + 70, 550, '매질 = 제자리 진동', seg(t, 4.1, 4.6), '#ffd23f', '#2a0f5e', 28);
      } }
  ];

  /* ---------- 5b: 파동의 용어와 위상 ---------- */
  CUTS['5b'] = [
    { dur: 7.5, base: '#3a2fb0', lines: [[0, 'narr', '파동을 한 순간 멈춰 세워 보자.'], [1.2, 'narr', '가장 높은 곳이 <b>마루</b>, 가장 낮은 곳이 <b>골</b>.'], [3.2, 'narr', '가운데 선에서 마루까지의 높이가 <b>진폭 A</b>.'], [5.2, 'narr', '마루에서 다음 마루까지의 거리가 <b>파장 λ</b>.']],
      draw(x, t) {
        plain(x, '#3a2fb0', '#6a3fd0', t);
        const ph = TAU * .45 * Math.max(0, .9 - t) * 1.2, f = sine(100, 360, 100, ph), Y = 380;
        x.strokeStyle = 'rgba(255,255,255,.4)'; x.setLineDash([10, 12]); x.lineWidth = 3; x.beginPath(); x.moveTo(80, Y); x.lineTo(1200, Y); x.stroke(); x.setLineDash([]);
        rope(x, 100, 1180, Y, f, { bead: '#ff9fc4', col: '#c9b6ff' });
        pill(x, 190, Y - 160, '마루', seg(t, 1.3, 1.8), '#ffd23f'); pill(x, 550, Y - 160, '마루', seg(t, 1.5, 2), '#ffd23f');
        pill(x, 370, Y + 160, '골', seg(t, 2, 2.5), '#7fd8ff'); pill(x, 730, Y + 160, '골', seg(t, 2.2, 2.7), '#7fd8ff');
        dimV(x, 950, Y - 100, Y, '진폭 A', seg(t, 3.3, 4.1));
        dimH(x, 190, 550, Y - 230, '파장 λ', seg(t, 5.3, 6.2));
      } },
    { dur: 8.5, base: '#3a2fb0', lines: [[0, 'narr', '<b>위상</b>은 “지금 진동의 어느 단계인가”.'], [2, 'narr', '한 파장(λ) 떨어진 두 점은 언제나 <b>똑같이</b> 움직인다. 위상이 같다.'], [5.2, 'narr', '반 파장(λ/2) 떨어지면 <b>정반대</b>로 움직인다. 위상이 반대.']],
      draw(x, t) {
        plain(x, '#3a2fb0', '#6a3fd0', t);
        const f = sine(90, 368, 100, t * TAU * .4), Y = 400, A = beadX(2), B = beadX(10), C = beadX(6);
        rope(x, 100, 1180, Y, f, { bead: '#ff9fc4', col: '#c9b6ff' });
        if (t > 2) { hi(x, A, Y + f(A), t); hi(x, B, Y + f(B), t); x.strokeStyle = 'rgba(255,210,63,.8)'; x.lineWidth = 4; x.setLineDash([8, 10]); x.beginPath(); x.moveTo(A, Y + f(A)); x.lineTo(B, Y + f(B)); x.stroke(); x.setLineDash([]); pill(x, (A + B) / 2, 170, '같은 위상 (λ 차이)', seg(t, 2.4, 2.9), '#ffd23f'); }
        if (t > 5.2) { hi(x, C, Y + f(C), t, '#4cc2ff'); pill(x, C, 560, '반대 위상 (λ/2 차이)', seg(t, 5.5, 6), '#7fd8ff'); dbl(x, C + 50, Y - 70, Y + 70, '#7fd8ff', 7, seg(t, 5.4, 5.9)); dbl(x, A - 50, Y - 70, Y + 70, '#ffd23f', 7, seg(t, 5.4, 5.9)); }
      } }
  ];

  /* ---------- 5c: v = fλ ---------- */
  CUTS['5c'] = [
    { dur: 9, base: '#11308a', lines: [[0, 'narr', '구슬 하나가 위아래로 <b>한 번</b> 완전히 오르내리는 데 걸리는 시간, 주기 <b>T</b>.'], [3.6, 'narr', '바로 그동안, 마루는 정확히 <b>한 파장 λ</b>만큼 앞으로 간다.'], [6.4, 'narr', '그러니 속력은 λ ÷ T. 1/T이 진동수 f니까 <b>v = fλ</b>.']],
      draw(x, t) {
        plain(x, '#11308a', '#2f6fe0', t);
        const T = 3, tau = Math.min(T, Math.max(0, t - .6)), lam = 380, Y = 420, f = sine(85, lam, 100, TAU * tau / T), BX = beadX(2);
        const crest0 = 100 + lam / 4, crest = crest0 + lam * tau / T;
        rope(x, 100, 1180, Y, f, { bead: '#ff9fc4', col: '#bfe6ff' });
        hi(x, BX, Y + f(BX), t);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(crest0, Y - 120); x.lineTo(crest0, Y - 210); x.lineTo(crest0 + 40, Y - 195); x.lineTo(crest0, Y - 180); x.fill();
        x.strokeStyle = '#ff8a3c'; x.lineWidth = 6; x.beginPath(); x.moveTo(crest, Y - 100); x.lineTo(crest, Y - 210); x.stroke(); x.fillStyle = '#ff8a3c'; x.beginPath(); x.moveTo(crest, Y - 210); x.lineTo(crest + 44, Y - 194); x.lineTo(crest, Y - 178); x.fill();
        clock(x, 1110, 130, 64, tau / T, tau >= T ? 'T' : (tau).toFixed(1) + 's');
        dimH(x, crest0, crest0 + lam, Y - 250, '한 파장 λ', seg(t, 3.8, 4.6));
        if (t > 6.4) pill(x, 640, 600, 'v = λ / T = f λ', seg(t, 6.6, 7.1), '#ffd23f', '#2a0f5e', 44);
      } },
    { dur: 8.5, base: '#11308a', lines: [[0, 'narr', '손을 <b>두 배 빨리</b> 흔들면?'], [2.6, 'narr', '파장이 <b>반</b>으로 줄어든다. 그런데 두 깃발은 나란히 간다. <b>속력은 그대로</b>.'], [5.8, 'resona', '속력은 손이 아니라 <b>줄(매질)</b>이 정하는 거야!']],
      draw(x, t) {
        plain(x, '#11308a', '#2f6fe0', t);
        const v = 120, rows = [[200, 380, '#bfe6ff', 'f'], [430, 190, '#ffd6a0', '2f']];
        for (const [Y, lam, col, lab] of rows) {
          const f = X => -60 * Math.sin(TAU * (X - 100 - v * t) / lam);
          rope(x, 100, 1180, Y, f, { bead: '#ff9fc4', col, gap: lam / 8 > 30 ? 46 : 46 });
          let cr = 100 + lam / 4 + v * t; while (cr > 1100) cr -= lam * Math.ceil((cr - 1100) / lam);
          x.strokeStyle = '#ff8a3c'; x.lineWidth = 6; x.beginPath(); x.moveTo(cr, Y - 70); x.lineTo(cr, Y - 150); x.stroke(); x.fillStyle = '#ff8a3c'; x.beginPath(); x.moveTo(cr, Y - 150); x.lineTo(cr + 36, Y - 137); x.lineTo(cr, Y - 124); x.fill();
          pill(x, 60, Y, lab, 1, lab === 'f' ? '#bfe6ff' : '#ffd6a0');
          if (t > 2.6) dimH(x, 700, 700 + lam, Y + 95, lab === 'f' ? 'λ' : 'λ/2', seg(t, 2.8, 3.6));
        }
        if (t > 5.8) pill(x, 640, 590, '속력 v 는 매질이 정한다', seg(t, 6, 6.5), '#ffd23f', '#2a0f5e', 32);
      } }
  ];

  /* ---------- 5d: 횡파와 종파 ---------- */
  const speaker = (x, X, Y, t) => { const p = Math.sin(t * TAU * 1.2) * 6; x.fillStyle = '#40238f'; rr(x, X - 60, Y - 70, 70, 140, 18); x.fill(); x.fillStyle = '#7a5cff'; x.beginPath(); x.moveTo(X + 6, Y - 60); x.lineTo(X + 40 + p, Y - 90); x.lineTo(X + 40 + p, Y + 90); x.lineTo(X + 6, Y + 60); x.closePath(); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.ellipse(X + 40 + p, Y, 10, 90, 0, 0, 7); x.fill(); };
  CUTS['5d'] = [
    { dur: 6.5, base: '#0b5f8a', lines: [[0, 'narr', '줄을 <b>위아래로</b> 흔들면, 구슬은 위아래로 떨고 파동은 옆으로 간다.'], [3.2, 'narr', '떨림과 진행이 <b>수직</b>. 이게 <b>횡파</b>다.']],
      draw(x, t) {
        plain(x, '#0b5f8a', '#22b0c8', t);
        const f = sine(80 * E.io(seg(t, 0, .8)), 340, 100, t * TAU * .45), Y = 400, BX = beadX(10);
        rope(x, 100, 1180, Y, f, { bead: '#ff9fc4', col: '#e6fbff' }); hi(x, BX, Y + f(BX), t);
        dbl(x, BX - 70, Y - 95, Y + 95, '#ffd23f', 9, seg(t, 1, 1.5)); text(x, '떨림', BX - 70, Y - 135, 26, '#ffd23f', seg(t, 1.2, 1.6));
        arrow(x, 300, 190, 980, 190, '#ff8a3c', 14, seg(t, 1.6, 2.4)); text(x, '진행', 640, 145, 28, '#ff8a3c', seg(t, 2, 2.4));
        pill(x, 640, 610, '횡파 : 떨림 ⊥ 진행', seg(t, 3.3, 3.8), '#fff', '#0b5f8a', 34);
      } },
    { dur: 8.5, base: '#0b5f8a', lines: [[0, 'narr', '이번엔 용수철을 <b>앞뒤로</b> 민다. 코일이 빽빽한 곳(<b>밀</b>)과 성긴 곳(<b>소</b>)이 생긴다.'], [3.6, 'narr', '떨림과 진행이 <b>같은 방향</b>. 이게 <b>종파</b>.'], [5.8, 'narr', '소리가 바로 이것. 스피커가 공기를 밀었다 당겼다 하는 <b>종파</b>다.']],
      draw(x, t) {
        plain(x, '#0b5f8a', '#22b0c8', t);
        const lam = 300, w = TAU * .5, A = 16 * E.io(seg(t, 0, .8)), Y = 400, k = TAU / lam, hiN = 22;
        speaker(x, 120, Y, t);
        x.fillStyle = 'rgba(255,255,255,.18)'; rr(x, 170, Y - 4, 1030, 8, 4); x.fill();
        for (let n = 0; n < 40; n++) { const X0 = 200 + n * 25, X = X0 + A * Math.sin(k * (X0 - 200) - w * t); coil(x, X, Y, n === hiN ? 140 : 120, n === hiN ? '#ffd23f' : '#e6fbff'); }
        const Xh = 200 + hiN * 25 + A * Math.sin(k * (hiN * 25) - w * t);
        arrow(x, Xh, Y + 110, Xh + 40, Y + 110, '#ffd23f', 7, seg(t, 1, 1.4)); arrow(x, Xh, Y + 110, Xh - 40, Y + 110, '#ffd23f', 7, seg(t, 1, 1.4));
        for (let m = -1; m < 6; m++) { const Xc = 200 + (Math.PI + w * t) / k - lam * m, Xr = Xc - lam / 2; if (Xc > 220 && Xc < 1190) pill(x, Xc, Y - 120, '밀', seg(t, .8, 1.3), '#ff5f8f', '#fff', 24); if (Xr > 220 && Xr < 1190) pill(x, Xr, Y - 120, '소', seg(t, 1, 1.5), '#fff', '#0b5f8a', 24); }
        arrow(x, 360, 190, 980, 190, '#ff8a3c', 14, seg(t, 3.4, 4)); pill(x, 640, 610, '종파 : 떨림 ∥ 진행', seg(t, 3.8, 4.3), '#fff', '#0b5f8a', 34);
      } }
  ];
})();
