'use strict';
/* 지문 애니메이션: 납작한 색면·둥근 인물·부드러운 움직임. 가상 해상도 1280×720.
   장면 = { dur, bg:[위색, 아래색], lines:[[초, 자막(한국어), 영어 키 문장?]], draw(x, t) } */
const EScene = (() => {
  const VW = 1280, VH = 720;
  const E = { o: k => 1 - Math.pow(1 - k, 3), io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
  const cl = v => Math.max(0, Math.min(1, v)), seg = (t, a, b) => cl((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.roundRect(X, Y, W, H, R); };
  const circ = (x, X, Y, R, c) => { x.fillStyle = c; x.beginPath(); x.arc(X, Y, Math.max(0, R), 0, 7); x.fill(); };
  const txt = (x, s, X, Y, size, c, al = 'center', w = 800) => { x.font = `${w} ${size}px "Pretendard","Noto Sans KR",system-ui,sans-serif`; x.textAlign = al; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(s, X, Y); };
  const serif = (x, s, X, Y, size, c, al = 'center') => { x.font = `italic 700 ${size}px Georgia,"Times New Roman",serif`; x.textAlign = al; x.textBaseline = 'middle'; x.fillStyle = c; x.fillText(s, X, Y); };
  const alpha = (x, a, f) => { x.save(); x.globalAlpha *= cl(a); f(); x.restore(); };
  const pop = (x, k, X, Y, f) => { if (k <= 0) return; const s = E.back(cl(k)); x.save(); x.translate(X, Y); x.scale(s, s); x.globalAlpha *= cl(k * 2); f(); x.restore(); };
  function bg(x, t, a, b) { const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 26; i++) { const px = (i * 173 + t * (8 + i % 5 * 3)) % (VW + 40) - 20, py = (i * 97) % VH; circ(x, px, py, 1.5 + i % 3, 'rgba(255,255,255,.12)'); } }
  function ground(x, c, y = 600) { x.fillStyle = c; x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(VW / 2, y - 30, VW, y); x.lineTo(VW, VH); x.lineTo(0, VH); x.fill(); }
  /* 사람: 둥근 머리 + 알약 몸. o = { c 몸색, s 피부, hat, coat(흰 가운), steth, tie, sad, look, bob, hair } */
  function person(x, X, Y, sc, t, o = {}) {
    x.save(); x.translate(X, Y + Math.sin(t * 2 + X) * (o.bob ?? 3)); x.scale(sc, sc);
    x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(0, 92, 46, 10, 0, 0, 7); x.fill();
    x.fillStyle = o.coat ? '#f4f1ff' : (o.c || '#5b6cff'); rr(x, -38, 0, 76, 92, 34); x.fill();
    if (o.coat) { x.fillStyle = o.c || '#5b6cff'; rr(x, -10, 4, 20, 60, 8); x.fill(); }
    if (o.tie) { x.fillStyle = o.tie; x.beginPath(); x.moveTo(0, 6); x.lineTo(8, 16); x.lineTo(0, 54); x.lineTo(-8, 16); x.fill(); }
    if (o.steth) { x.strokeStyle = '#333a'; x.lineWidth = 4; x.beginPath(); x.arc(0, 20, 18, .2, Math.PI - .2); x.stroke(); circ(x, 12, 36, 5, '#9aa'); }
    circ(x, 0, -30, 34, o.s || '#ffd9b8');
    if (o.hair) { x.fillStyle = o.hair; x.beginPath(); x.arc(0, -36, 35, Math.PI * 1.05, Math.PI * 1.95); x.fill(); }
    const lk = (o.look || 0) * 6, bl = (Math.sin(t * 1.3 + X) > .97) ? .15 : 1;
    x.fillStyle = '#1d1535'; x.save(); x.translate(lk, 0); x.beginPath(); x.ellipse(-11, -30, 4, 5 * bl, 0, 0, 7); x.ellipse(11, -30, 4, 5 * bl, 0, 0, 7); x.fill();
    x.strokeStyle = '#1d1535'; x.lineWidth = 3; x.beginPath(); if (o.sad) x.arc(0, -10, 8, Math.PI * 1.2, Math.PI * 1.8); else x.arc(0, -20, 8, .3, Math.PI - .3); x.stroke(); x.restore();
    if (o.hat) { x.fillStyle = o.hat; rr(x, -30, -74, 60, 20, 8); x.fill(); rr(x, -40, -58, 80, 8, 4); x.fill(); }
    x.restore();
  }
  function pill(x, X, Y, s, rot, a = '#fff', b = '#ff6b8b') { x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s); x.fillStyle = a; rr(x, -40, -16, 40, 32, 16); x.fill(); x.fillStyle = b; rr(x, 0, -16, 40, 32, 16); x.fill(); x.fillStyle = 'rgba(255,255,255,.5)'; rr(x, -32, -10, 24, 6, 3); x.fill(); x.restore(); }
  function bottle(x, X, Y, s, label) { x.save(); x.translate(X, Y); x.scale(s, s); x.fillStyle = '#ffb547'; rr(x, -50, -70, 100, 140, 22); x.fill(); x.fillStyle = '#fff'; rr(x, -60, -100, 120, 34, 12); x.fill(); x.fillStyle = '#fff6e5'; rr(x, -42, -30, 84, 60, 8); x.fill(); txt(x, label, 0, 0, 18, '#c2410c'); x.restore(); }
  function doc(x, X, Y, s, rot, c = '#fff', lines = 4) { x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s); x.fillStyle = c; rr(x, -34, -44, 68, 88, 6); x.fill(); x.fillStyle = '#c9c2e8'; for (let i = 0; i < lines; i++) rr(x, -24, -30 + i * 16, 48 - (i % 2) * 14, 6, 3), x.fill(); x.restore(); }
  function scale(x, X, Y, tilt, lw, rw) { x.save(); x.translate(X, Y); x.fillStyle = '#e8e3ff'; rr(x, -8, -10, 16, 190, 6); x.fill(); rr(x, -70, 170, 140, 20, 8); x.fill(); x.rotate(tilt); x.fillStyle = '#ffffff'; rr(x, -230, -14, 460, 14, 7); x.fill(); x.restore();
    const ly = Y - Math.sin(tilt) * 220, ry = Y + Math.sin(tilt) * 220; [[X - 220, ly, lw], [X + 220, ry, rw]].forEach(([px, py, f]) => { x.strokeStyle = '#fff8'; x.lineWidth = 3; x.beginPath(); x.moveTo(px, py); x.lineTo(px - 60, py + 90); x.moveTo(px, py); x.lineTo(px + 60, py + 90); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(px, py + 92, 74, 16, 0, 0, 7); x.fill(); x.save(); x.translate(px, py + 80); f && f(); x.restore(); }); }
  function molecule(x, X, Y, s, t, flip, hue) { x.save(); x.translate(X, Y); x.scale(s * (flip ? -1 : 1), s); x.rotate(Math.sin(t * .8) * .15);
    const arms = [[-90, -60, '#ff6b8b', 26], [95, -40, '#ffd23f', 30], [-40, 95, '#3ddc97', 22], [70, 80, '#7cc8ff', 20]];
    arms.forEach(([dx, dy, c, r]) => { x.strokeStyle = '#ffffffaa'; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(dx, dy); x.stroke(); circ(x, dx, dy, r, c); circ(x, dx - r * .3, dy - r * .3, r * .3, 'rgba(255,255,255,.45)'); });
    circ(x, 0, 0, 34, hue || '#3b2f6b'); txt(x, 'C', 0, 2, 30, '#fff'); x.restore(); }
  function hand(x, X, Y, s, flip, c) { x.save(); x.translate(X, Y); x.scale(s * (flip ? -1 : 1), s); x.fillStyle = c; rr(x, -40, -10, 80, 90, 30); x.fill(); [[-34, -50], [-12, -70], [10, -72], [30, -58]].forEach(([fx, fy]) => { rr(x, fx - 8, fy, 18, 70, 9); x.fill(); }); x.save(); x.rotate(-.6); rr(x, -70, 10, 18, 56, 9); x.fill(); x.restore(); x.restore(); }
  function whistle(x, X, Y, s, c = '#ffd23f') { x.save(); x.translate(X, Y); x.scale(s, s); x.fillStyle = c; rr(x, -40, -18, 60, 36, 18); x.fill(); circ(x, 22, 0, 26, c); circ(x, 22, 0, 10, '#0003'); x.restore(); }
  function sound(x, X, Y, k, c = '#fff') { for (let i = 0; i < 3; i++) { const r = 20 + i * 18 + (k * 40) % 18; x.strokeStyle = c; x.globalAlpha = .7 - i * .2; x.lineWidth = 5; x.beginPath(); x.arc(X, Y, r, -.7, .7); x.stroke(); } x.globalAlpha = 1; }
  function label(x, s, X, Y, k, c = '#fff', bgc = 'rgba(20,10,50,.55)', size = 26) { pop(x, k, X, Y, () => { x.font = `800 ${size}px system-ui,sans-serif`; const w = x.measureText(s).width + 34; x.fillStyle = bgc; rr(x, -w / 2, -size * .9, w, size * 1.8, size * .9); x.fill(); txt(x, s, 0, 1, size, c); }); }
  function child(x, X, Y, s, t, glow) { x.save(); x.translate(X, Y); x.scale(s, s); const g = x.createRadialGradient(0, -20, 4, 0, -20, 90); g.addColorStop(0, `rgba(255,220,150,${.55 * glow})`); g.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, -20, 90, 0, 7); x.fill();
    x.fillStyle = '#ffe3c4'; x.beginPath(); x.arc(0, -40, 26, 0, 7); x.fill(); x.fillStyle = '#ffcfa0'; rr(x, -26, -14, 52, 60, 24); x.fill(); x.fillStyle = '#1d1535'; x.beginPath(); x.ellipse(-8, -42, 3, 4, 0, 0, 7); x.ellipse(8, -42, 3, 4, 0, 0, 7); x.fill(); x.restore(); }

  const SC = {
    p1: [
      { dur: 9, bg: ['#ffb36b', '#ff6b8b'], lines: [[0, '1957년 독일. 그뤼넨탈이라는 회사가 새 수면제를 내놓았다.'], [3, '“아무 부작용 없는 안전한 약.” 임신부들도 입덧 때문에 먹었다.'], [6, '그리고 팔다리가 짧은 아기가 수천 명 태어났다. 이게 탈리도마이드 사건이다.']],
        draw(x, t) { bg(x, t, '#ffcf8a', '#ff7a8f'); ground(x, '#e0567a'); const k = E.o(seg(t, 0, 1.2)); bottle(x, lerp(-100, 330, k), 380, 1.3, 'SAFE!'); for (let i = 0; i < 6; i++) pill(x, 330 + Math.cos(t * 1.5 + i) * 140, 380 + Math.sin(t * 1.5 + i) * 80, .7, t + i, '#fff', '#ff6b8b');
          alpha(x, seg(t, 2.8, 3.6), () => person(x, 820, 430, 1.4, t, { c: '#8f6bff', hair: '#5a3b2a' }));
          alpha(x, seg(t, 5.6, 7), () => { for (let i = 0; i < 9; i++) child(x, 660 + (i % 5) * 105, 200 + Math.floor(i / 5) * 110, .7, t, .7); }); } },
      { dur: 9.5, bg: ['#2b2170', '#5a3bb0'], lines: [[0, '재판이 열렸다. 주요 관계자 일곱 명 중 다섯 명이 <b>의사</b>(physicians)였다.', 'Of the seven principals in the case, five were physicians.'], [4.2, '화학자는 단 한 명, 쿤츠. 그런데 그는 <b>피고인석에 없었다</b>.', 'he was not one of the defendants'], [7, '재판은 보상 합의로 흐지부지. <b>헛수고</b>(futile)였다.']],
        draw(x, t) { bg(x, t, '#2b2170', '#5a3bb0'); x.fillStyle = '#3d2f8f'; rr(x, 140, 420, 1000, 200, 20); x.fill(); txt(x, 'DEFENDANTS', 640, 450, 22, '#b9a8ff');
          for (let i = 0; i < 7; i++) { const k = seg(t, .4 + i * .35, 1 + i * .35); pop(x, k, 0, 0, () => person(x, 220 + i * 140, 500, .75, t, { coat: i < 5, steth: i < 5, c: i < 5 ? '#5b6cff' : '#333a66', tie: i >= 5 ? '#ff6b8b' : null })); }
          alpha(x, seg(t, 4.2, 5), () => { person(x, 1040, 250, .9, t, { coat: 1, c: '#3ddc97', look: -1 }); label(x, 'chemist: Kunz', 1040, 140, 1, '#3ddc97'); });
          const k2 = seg(t, 7, 8); if (k2) { x.save(); x.translate(640, 300); x.rotate(-.2); x.globalAlpha = k2; x.strokeStyle = '#ff6b8b'; x.lineWidth = 10; rr(x, -170, -50, 340, 100, 14); x.stroke(); txt(x, 'FUTILE', 0, 4, 64, '#ff6b8b'); x.restore(); } } },
      { dur: 7.5, bg: ['#141038', '#2b2170'], lines: [[0, '그렇다면 묻자. 이것이 정말 <b>화학</b>의 재앙인가?', 'Is thalidomide a chemical disaster?'], [3.5, '왜 이걸 화학 탓으로 돌리는가? 그래도 글쓴이는 말한다. 화학도 <b>죄를 나눠 져야 할 이유가 두 가지</b> 있다고.', 'two reasons for chemistry to share in the guilt']],
        draw(x, t) { bg(x, t, '#141038', '#2b2170'); serif(x, 'Is thalidomide a', 640, 230, 56, '#fff'); const k = seg(t, .8, 1.6); x.save(); x.translate(640, 330); x.scale(1 + .1 * Math.sin(t * 3) * k, 1); serif(x, 'chemical', 0, 0, 96 * (0.6 + .4 * k), '#ffd23f'); x.restore(); serif(x, 'disaster?', 640, 430, 56, '#fff');
          const k2 = seg(t, 3.5, 4.5); pop(x, k2, 300, 560, () => { txt(x, '①', 0, 0, 60, '#3ddc97'); }); pop(x, seg(t, 4.2, 5), 980, 560, () => { txt(x, '②', 0, 0, 60, '#3ddc97'); }); } }
    ],
    p2: [
      { dur: 8.5, bg: ['#a7f0c9', '#3ddc97'], lines: [[0, '화학자들은 늘 말한다. “천연이면 안전하다고? 몰라서 하는 소리!”', 'Chemists like to lambaste the public for its ignorance'], [4, '독버섯도 천연이다. 맞는 말이다. 모든 물질은 화학 물질이니까.']],
        draw(x, t) { bg(x, t, '#c9f7dd', '#3ddc97'); ground(x, '#2bb37a'); person(x, 300, 420, 1.3, t, { coat: 1, c: '#3ddc97', look: 1 }); const k = seg(t, .6, 1.4); pop(x, k, 470, 260, () => { x.fillStyle = '#fff'; rr(x, -10, -50, 280, 100, 30); x.fill(); txt(x, '천연 = 안전? ✗', 130, 0, 34, '#e0567a'); });
          [[760, 480], [900, 500], [1040, 470]].forEach(([mx, my], i) => alpha(x, seg(t, 3.6 + i * .4, 4.4 + i * .4), () => { x.fillStyle = '#fff6e5'; rr(x, mx - 14, my - 30, 28, 70, 10); x.fill(); x.fillStyle = '#e0567a'; x.beginPath(); x.ellipse(mx, my - 34, 60, 40, 0, Math.PI, 0); x.fill(); circ(x, mx - 20, my - 50, 8, '#fff'); circ(x, mx + 18, my - 44, 6, '#fff'); }));
          label(x, 'natural ≠ safe', 900, 330, seg(t, 5, 5.8), '#fff', '#e0567a'); } },
      { dur: 9, bg: ['#2b2170', '#141038'], lines: [[0, '그렇다면 공평해야 한다. 천연물이 해로울 수 있다고 가르쳤다면,', 'once you have taught people ... that the natural may sometimes hurt you'], [4, '<b>합성물도</b> 해로울 수 있다는 걸 숨기면 안 된다. 그리고 이 화학 물질은 실제로 해를 끼쳤다.', 'This chemical did harm.']],
        draw(x, t) { bg(x, t, '#2b2170', '#141038'); const tilt = lerp(0, -.12, E.io(seg(t, 4, 6))); scale(x, 640, 230, tilt, () => { x.fillStyle = '#e0567a'; x.beginPath(); x.ellipse(0, -20, 40, 26, 0, Math.PI, 0); x.fill(); txt(x, 'natural', 0, 20, 20, '#fff'); }, () => { pill(x, 0, -24, .9, .2); txt(x, 'synthetic', 0, 20, 20, '#fff'); });
          label(x, 'may hurt', 420, 160, seg(t, 1.5, 2.3), '#fff', '#e0567a', 22); label(x, 'may ALSO hurt', 860, 160, seg(t, 4.2, 5), '#fff', '#e0567a', 22); alpha(x, seg(t, 6.5, 7.3), () => serif(x, 'This chemical did harm.', 640, 630, 48, '#ffd23f')); } }
    ],
    p3: [
      { dur: 11, bg: ['#7cc8ff', '#3b6bff'], lines: [[0, '세상에는 “화학 재앙”이 고를 수 있을 만큼 많다.', 'a variety of "chemical disasters" to choose from'], [2.6, '인도 보팔의 독가스, 탈선한 벤젠·염소 탱크 화차,'], [5.4, 'DDT, 오존층을 뚫은 프레온 가스, 일본과 브라질의 수은 중독.'], [8.4, '글쓴이는 이 중 무엇을 골라도 됐다. 그런데 탈리도마이드를 골랐다.', 'I could have discussed any of these.']],
        draw(x, t) { bg(x, t, '#a9dcff', '#3b6bff'); x.fillStyle = '#4f86ff'; circ(x, 640, 420, 300, '#5d93ff'); x.fillStyle = '#3ddc97'; [[520, 330, 120, 70], [720, 380, 90, 110], [600, 520, 140, 60], [800, 520, 70, 50]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(a, b, c, d, .3, 0, 7); x.fill(); });
          const items = [['☁', 'Bhopal', 380, 260, 2.6], ['🚃', 'benzene', 900, 260, 3.4], ['🧴', 'DDT', 330, 520, 5.4], ['⭕', 'CFC → ozone', 950, 470, 6], ['🐟', 'mercury', 640, 640, 6.8]];
          items.forEach(([ic, nm, ix, iy, at]) => pop(x, seg(t, at, at + .7), ix, iy + Math.sin(t * 2 + ix) * 6, () => { x.fillStyle = '#fff'; rr(x, -90, -46, 180, 92, 24); x.fill(); txt(x, ic, -50, 0, 40, '#000', 'center', 400); txt(x, nm, 24, 0, 22, '#2b2170'); }));
          alpha(x, seg(t, 8.4, 9.2), () => { bottle(x, 640, 140, .8, 'thalidomide'); }); } },
      { dur: 9, bg: ['#2b2170', '#5a3bb0'], lines: [[0, '사례마다 누군가는 “이건 화학 문제가 아니야”라며 <b>면책</b>을 주장할 수 있다.', 'one could argue for an exculpation'], [4.2, '심지어 화학이 영웅이었다고도. 프레온이 오존을 파괴한다는 걸 밝힌 건 화학자 롤런드와 몰리나였으니까.', 'who but chemists ... found the connection']],
        draw(x, t) { bg(x, t, '#2b2170', '#5a3bb0'); pop(x, seg(t, .3, 1.1), 360, 330, () => { x.fillStyle = '#7cc8ff'; x.beginPath(); x.moveTo(0, -120); x.lineTo(110, -80); x.lineTo(100, 40); x.quadraticCurveTo(0, 140, -100, 40); x.lineTo(-110, -80); x.fill(); txt(x, 'NOT', 0, -20, 40, '#fff'); txt(x, 'chemistry', 0, 24, 26, '#fff'); });
          alpha(x, seg(t, 4.2, 5), () => { person(x, 840, 430, 1, t, { coat: 1, c: '#ffd23f' }); person(x, 1000, 440, 1, t, { coat: 1, c: '#ff6b8b', hair: '#222' }); const r = 70 + Math.sin(t * 2) * 6; x.strokeStyle = '#fff'; x.lineWidth = 10; x.beginPath(); x.arc(920, 210, r, 0, 7); x.stroke(); circ(x, 920, 210, r - 8, 'rgba(124,200,255,.25)'); circ(x, 920, 210, 26 + Math.sin(t) * 4, '#141038'); x.lineWidth = 14; x.beginPath(); x.moveTo(970, 260); x.lineTo(1020, 320); x.stroke(); }); } }
    ],
    p4: [
      { dur: 9, bg: ['#ffd23f', '#ff9a3c'], lines: [[0, '모든 사례 밑바닥엔 돈, 그리고 그 어두운 면인 <b>탐욕</b>이 있다.', 'economics and its dark side, greed, are dominant'], [3.6, '화학자들이 무역 흑자와 궤양약 타가메트 같은 <b>공을 차지한다면</b>, 탓도 받아야 한다. 적어도 일부는.', 'if chemists take credit ... we also have to be willing to accept the blame']],
        draw(x, t) { bg(x, t, '#ffe27a', '#ff9a3c'); for (let i = 0; i < 8; i++) { const y = (t * 120 + i * 90) % 800 - 60; circ(x, 120 + i * 140, y, 22, '#fff3'); txt(x, '$', 120 + i * 140, y, 26, '#c2410c'); }
          const tilt = lerp(.12, 0, E.io(seg(t, 4.5, 6.5))); scale(x, 640, 230, tilt, () => { txt(x, '🏆', 0, -30, 50, '#000', 'center', 400); txt(x, 'credit', 0, 20, 22, '#2b2170'); }, () => { alpha(x, seg(t, 4.5, 5.2), () => { txt(x, '⚠', 0, -30, 50, '#000', 'center', 400); txt(x, 'blame', 0, 20, 22, '#e0567a'); }); }); } },
      { dur: 10, bg: ['#2b2170', '#141038'], lines: [[0, '부작용 보고가 회사로 <b>쏟아져 들어왔다</b>. 그런데 그뤼넨탈의 화학자 누구도 입을 열지 않았다.', 'as reports of harmful effects just flooded in'], [5, '<b>아무도 호루라기를 불지 않았다</b>. 분 것은 다른 의사들과, 좀 선정적이긴 해도 자유로운 언론뿐.', 'No one blew a whistle.']],
        draw(x, t) { bg(x, t, '#2b2170', '#141038'); x.fillStyle = '#4b3ca0'; rr(x, 140, 200, 340, 380, 12); x.fill(); x.fillStyle = '#ffd23f88'; for (let i = 0; i < 6; i++) rr(x, 170 + (i % 3) * 100, 230 + Math.floor(i / 3) * 90, 70, 50, 6), x.fill(); txt(x, 'GRÜNENTHAL', 310, 540, 26, '#fff');
          for (let i = 0; i < 14; i++) { const k = ((t - i * .3) % 3) / 3; if (t < i * .3) continue; doc(x, lerp(1200, 420, k), 320 + Math.sin(i * 7) * 120 - k * 30, .7, k * 3 + i, '#fff'); }
          alpha(x, seg(t, 2, 3), () => { person(x, 640, 460, .85, t, { coat: 1, c: '#3ddc97', sad: 1 }); x.fillStyle = '#fff'; rr(x, 600, 300, 80, 50, 16); x.fill(); txt(x, '…', 640, 322, 30, '#2b2170'); });
          alpha(x, seg(t, 5.5, 6.5), () => { person(x, 800, 470, .85, t, { coat: 1, steth: 1, c: '#5b6cff' }); whistle(x, 870, 420, .8); sound(x, 930, 420, t * 3); x.fillStyle = '#fff'; rr(x, 940, 500, 170, 110, 8); x.fill(); txt(x, 'PRESS', 1025, 530, 24, '#e0567a'); x.fillStyle = '#ccc'; for (let i = 0; i < 3; i++) rr(x, 958, 556 + i * 14, 134, 6, 3), x.fill(); }); } }
    ],
    p5: [
      { dur: 10, bg: ['#141038', '#3b2f6b'], lines: [[0, '화학적으로 흥미로운 점이 하나 더 있다. 탈리도마이드엔 서로 다른 네 원자단이 붙은 탄소가 있다.', 'one carbon in it with four different substituents'], [4.5, '그래서 <b>키랄</b>(chiral)하다. 왼손과 오른손처럼, 거울에 비춘 모습과 겹쳐지지 않는다.', 'thalidomide is chiral']],
        draw(x, t) { bg(x, t, '#141038', '#3b2f6b'); const k = seg(t, 4.5, 6); molecule(x, lerp(640, 400, E.io(k)), 340, 1.3, t, false); if (k > 0) { x.fillStyle = 'rgba(180,220,255,.25)'; rr(x, 630, 120, 20, 440, 10); x.fill(); alpha(x, k, () => molecule(x, 880, 340, 1.3, t, true)); }
          alpha(x, seg(t, 6.5, 7.5), () => { hand(x, 400, 600, .8, false, '#ffd9b8'); hand(x, 880, 600, .8, true, '#ffd9b8'); }); } },
      { dur: 11, bg: ['#3b2f6b', '#141038'], lines: [[0, '처음 만든 반응에서는 왼손형과 오른손형이 <b>같은 양</b>으로 생겼고, 그대로 섞인 채 팔렸다.', 'equal amounts of the left- and right-handed forms'], [4.6, '두 형태는 기형을 일으키는 정도가 크게 다르다는 증거가 있다(논란은 있다).', 'the two enantiomers differ vastly in teratogenicity'], [7.8, '게다가 “무해한” 쪽이 <b>몸속에서 “해로운” 쪽으로 바뀐다</b>. 세상은 결코 단순하지 않다.', 'The world is never simple.']],
        draw(x, t) { bg(x, t, '#3b2f6b', '#141038'); x.fillStyle = '#fff2'; rr(x, 360, 160, 560, 320, 40); x.fill();
          for (let i = 0; i < 10; i++) { const L = i % 2 === 0; const px = 420 + (i % 5) * 110, py = 250 + Math.floor(i / 5) * 140 + Math.sin(t * 2 + i) * 8; const turn = L && seg(t, 8.5 + i * .1, 9.5 + i * .1); molecule(x, px, py, .35, t + i, !L || turn > .5, L ? (turn > .5 ? '#e0567a' : '#3ddc97') : '#e0567a'); }
          alpha(x, seg(t, 4.6, 5.4), () => { label(x, 'harmless?', 300, 560, 1, '#fff', '#3ddc97', 24); label(x, 'harmful', 980, 560, 1, '#fff', '#e0567a', 24); }); } }
    ],
    p6: [
      { dur: 9, bg: ['#ff6b8b', '#b8325e'], lines: [[0, '“그냥 <b>나쁜 과학</b>이었던 거잖아?”', 'Surely the behavior of Grünenthal is just bad science, isn\'t it?'], [3, '과학이 제대로, 아니 그럭저럭이라도 됐더라면 이 일은 없었을 거라는 말. 글쓴이의 답은 <b>두 갈래</b>다.', 'Were the science done well ... this would not have happened.']],
        draw(x, t) { bg(x, t, '#ff9ab0', '#b8325e'); const k = seg(t, 3, 5); x.save(); x.translate(640, 330); x.fillStyle = '#fff'; rr(x, -260, -130, 520, 260, 30); x.fill(); txt(x, k < .5 ? 'BAD SCIENCE ?' : 'IF … had been done well', 0, -30, k < .5 ? 52 : 38, '#b8325e'); txt(x, '→ would not have happened', 0, 50, 30, '#2b2170'); x.restore();
          for (let i = 0; i < 2; i++) pop(x, seg(t, 6 + i * .6, 6.8 + i * .6), 420 + i * 440, 590, () => { x.fillStyle = '#ffd23f'; rr(x, -120, -36, 240, 72, 36); x.fill(); txt(x, i ? 'answer ②' : 'answer ①', 0, 2, 30, '#2b2170'); }); } },
      { dur: 11, bg: ['#2b2170', '#5a3bb0'], lines: [[0, '첫째, 형편없는 과학이었다. 과학 전체는 엉성함, 과장, 사기가 좀 섞여도 굴러간다.', 'it will easily survive sloppiness, hype, and even fraud'], [5, '하지만 <b>사람 목숨이 걸린 과학</b>은 나쁠 여유가 없다.', 'the kind of science that touches on human lives cannot afford to be bad']],
        draw(x, t) { bg(x, t, '#2b2170', '#5a3bb0'); x.save(); x.translate(380, 360); x.rotate(t * .6); x.fillStyle = '#7cc8ff'; for (let i = 0; i < 10; i++) { x.rotate(Math.PI / 5); rr(x, -20, -150, 40, 50, 8); x.fill(); } circ(x, 0, 0, 120, '#7cc8ff'); circ(x, 0, 0, 50, '#2b2170'); x.restore(); txt(x, 'science', 380, 360, 24, '#fff');
          ['sloppiness', 'hype', 'fraud'].forEach((w, i) => { const a = t * 1.2 + i * 2; label(x, w, 380 + Math.cos(a) * 200, 360 + Math.sin(a) * 200, seg(t, .5 + i * .6, 1.2 + i * .6), '#fff', '#e0567a', 20); });
          alpha(x, seg(t, 5, 6), () => { x.save(); x.translate(940, 360); x.fillStyle = '#ffd23f'; for (let i = 0; i < 10; i++) { x.rotate(Math.PI / 5); rr(x, -20, -150, 40, 50, 8); x.fill(); } circ(x, 0, 0, 120, '#ffd23f'); x.restore(); txt(x, '♥', 940, 340, 64, '#e0567a', 'center', 400); txt(x, 'human lives', 940, 400, 22, '#2b2170'); label(x, 'NO room for bad', 940, 590, 1, '#fff', '#e0567a', 24); }); } },
      { dur: 10.5, bg: ['#141038', '#2b2170'], lines: [[0, '그런데도 진정제 시장의 그 많은 경쟁사 중 단 한 곳도, 단 한 사람도 <b>소리치지 않았다</b>.', 'not a single drug company, not a single individual screamed'], [5, '시스템이 실패했다. 해결책은 1960년대 세계 곳곳에 천천히 도입된 <b>약물 시험 법률</b>에서 나왔다.', 'legislation on drug testing ... in the 1960s']],
        draw(x, t) { bg(x, t, '#141038', '#2b2170'); for (let i = 0; i < 6; i++) person(x, 170 + i * 120, 470, .7, t, { c: ['#5b6cff', '#3ddc97', '#ffb547', '#8f6bff', '#ff6b8b', '#7cc8ff'][i], sad: 1 }); alpha(x, seg(t, 1, 2), () => { x.strokeStyle = '#fff6'; x.lineWidth = 4; x.setLineDash([10, 10]); rr(x, 110, 300, 720, 280, 30); x.stroke(); x.setLineDash([]); txt(x, '(silence)', 470, 330, 26, '#fff8'); });
          const k = seg(t, 5, 6.2); pop(x, k, 1040, 370, () => { doc(x, 0, 0, 2.2, -.05, '#fff', 5); txt(x, 'LAW', 0, -70, 30, '#2b2170'); x.save(); x.rotate(-.3); x.strokeStyle = '#e0567a'; x.lineWidth = 6; x.beginPath(); x.arc(30, 60, 40, 0, 7); x.stroke(); txt(x, '1960s', 30, 60, 20, '#e0567a'); x.restore(); }); } }
    ],
    p7: [
      { dur: 10, bg: ['#c9c2e8', '#6b6390'], lines: [[0, '둘째, 이건 그냥 나쁜 과학이 아니다. 한나 아렌트가 말한 <b>“악의 평범성”</b>과 맞닿은, 시스템의 은밀한 실패다.', 'the banality of evil, in Hannah Arendt\'s famous phrase'], [5, '의사, 영업 사원, 자료 조작자, 변호사, 학술지 편집자. 이들 중 누구도 그저 순전한 악인은 아니었다.', 'none of these were just plain evil']],
        draw(x, t) { bg(x, t, '#d9d3f3', '#6b6390'); const g = x.createLinearGradient(0, 0, VW, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#9b95b8'); g.addColorStop(1, '#1d1535'); x.fillStyle = g; rr(x, 60, 560, 1160, 60, 30); x.fill(); txt(x, 'white', 120, 590, 20, '#2b2170'); txt(x, 'black', 1160, 590, 20, '#fff');
          const roles = [['doctor', { coat: 1, steth: 1, c: '#5b6cff' }], ['salesman', { c: '#ffb547', tie: '#e0567a' }], ['data', { coat: 1, c: '#8f6bff' }], ['lawyer', { c: '#333a66', tie: '#7cc8ff' }], ['editor', { c: '#3ddc97', hair: '#5a3b2a' }]];
          roles.forEach(([nm, o], i) => { const k = seg(t, .5 + i * .5, 1.3 + i * .5); if (!k) return; const X = 220 + i * 210; person(x, X, 380, .9, t, o); label(x, nm, X, 270, k, '#fff', 'rgba(20,10,50,.6)', 18); });
          alpha(x, seg(t, 5.5, 6.5), () => serif(x, 'not monsters — ordinary people', 640, 150, 40, '#2b2170')); } },
      { dur: 12, bg: ['#9b95b8', '#3b3560'], lines: [[0, '그들도 무언가를 듣고 보았다. 하지만 의심할지, 회사 방침을 따를지 사이의 <b>회색 지대</b>에서', 'in the gray area between doubting ... or following company policy'], [4.4, '여기서 조금, 저기서 조금, 회사 쪽을 골랐다. 그리고 살짝 비튼 메시지를 다음 사람에게 넘겼다.', 'passed along a selected, slightly distorted message'], [8.4, '다음 사람은 자료를 조금 더 주무르고, 나쁜 소식 메모는 읽지 않고, 부작용은 “히스테리” 탓으로 돌렸다.', 'attributed that reaction to hysteria']],
        draw(x, t) { bg(x, t, '#b3adcf', '#3b3560'); const n = 5; for (let i = 0; i < n; i++) { const X = 200 + i * 220; const shade = Math.round(lerp(230, 60, i / (n - 1))); person(x, X, 420, .8, t, { c: `rgb(${shade},${shade},${shade + 20})` }); }
          const k = seg(t, 4.4, 11); const pos = k * (n - 1), i0 = Math.floor(pos), f = pos - i0, X = lerp(200 + i0 * 220, 200 + Math.min(n - 1, i0 + 1) * 220, E.io(f)); const c = Math.round(lerp(255, 90, k)); x.save(); x.translate(X, 300 - Math.sin(f * Math.PI) * 60); x.rotate(Math.sin(t * 3) * .1 * k); x.fillStyle = `rgb(255,${c},${c})`; rr(x, -46, -30, 92, 60, 8); x.fill(); x.strokeStyle = '#2b2170'; x.lineWidth = 3; x.beginPath(); x.moveTo(-46, -30); x.lineTo(0, 6); x.lineTo(46, -30); x.stroke(); x.restore();
          alpha(x, seg(t, 9.4, 10.2), () => { x.save(); x.translate(1000, 200); x.rotate(-.2); x.strokeStyle = '#e0567a'; x.lineWidth = 6; rr(x, -110, -34, 220, 68, 10); x.stroke(); txt(x, 'HYSTERIA', 0, 2, 34, '#e0567a'); x.restore(); }); } }
    ],
    p8: [
      { dur: 11, bg: ['#7cc8ff', '#5b6cff'], lines: [[0, '그 뒤 법이 생겨 문제를 고쳤다. 그런데 반대쪽에선 이렇게 말한다. “이제 <b>너무 지나친</b> 거 아냐?”', 'but now haven\'t we gone overboard?'], [4.6, '“안전성·효능 시험 때문에 신약 하나 내는 데 1억 달러가 들고, 개발자의 창의성은 숨이 막힌다.”', 'it costs $100 million to bring a drug to the market'], [8, '“그래서 약이 덜 나오고, 간접적으로 생명을 잃는다.” 이 주장에 따르면 그렇다.', 'so this argument goes']],
        draw(x, t) { bg(x, t, '#a9dcff', '#5b6cff'); const wall = E.o(seg(t, .4, 1.6)); x.fillStyle = '#e8e3ff'; for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { if (r > wall * 6) continue; rr(x, 600 + c * 50 + (r % 2) * 25, 560 - r * 60, 46, 54, 6); x.fill(); } txt(x, 'TESTS', 680, 200, 26, '#fff');
          person(x, 320, 440, 1.1, t, { coat: 1, c: '#ffd23f', sad: seg(t, 4.6, 5) > .5 }); for (let i = 0; i < 5; i++) { const k = ((t * .4 + i * .2) % 1); pill(x, lerp(400, 590, k), 380 + i * 24, .5, k * 6, '#fff', '#3ddc97'); }
          alpha(x, seg(t, 4.6, 5.4), () => { for (let i = 0; i < 6; i++) { x.fillStyle = '#3ddc97'; rr(x, 940, 540 - i * 32, 150, 26, 8); x.fill(); txt(x, '$', 1015, 553 - i * 32, 20, '#145c3e'); } txt(x, '$100,000,000', 1015, 300, 30, '#fff'); }); } }
    ],
    p9: [
      { dur: 11, bg: ['#ffb36b', '#e0567a'], lines: [[0, '이 말을 들으면 글쓴이는 하고 싶지 않은 일을 하고 싶어진다. <b>탈리도마이드 아이의 사진</b>을 보여 주는 것.', 'show the picture of a thalidomide child'], [5, '문제는 규제 때문에 <b>잃었을지 모르는</b> 생명이 아니라, 규제 덕분에 <b>구한</b> 생명이다.', 'not ... how many lives might have been lost ... but of how many lives have been saved']],
        draw(x, t) { bg(x, t, '#ffd29a', '#e0567a'); pop(x, seg(t, .5, 1.5), 640, 300, () => { x.fillStyle = '#fff'; rr(x, -150, -170, 300, 300, 10); x.fill(); x.fillStyle = '#ffe9d0'; rr(x, -130, -150, 260, 220, 6); x.fill(); child(x, 0, 20, 1.6, t, .9); });
          alpha(x, seg(t, 5, 6), () => { label(x, 'lost?', 300, 560, 1, '#fff', '#6b6390', 30); label(x, 'saved', 980, 560, 1, '#fff', '#3ddc97', 40); for (let i = 0; i < 12; i++) circ(x, 860 + (i % 6) * 48, 630 + Math.floor(i / 6) * 40 + Math.sin(t * 3 + i) * 4, 12, '#fff'); }); } }
    ],
    p10: [
      { dur: 12, bg: ['#2b2170', '#141038'], lines: [[0, '위험과 이익을 저울질하는 계산이 있다 해도,', 'If there be a calculus of risks and benefits'], [3, '약 때문에 장애를 안고 태어난 <b>아이 한 명</b>의 무게는 구한 어떤 생명, 수백 명의 생명보다 무겁다.', 'it outweighs any life or hundreds of lives saved'], [7.4, '팔천 명의 아이와 부모들의 고통. 세상 무엇도 정당화할 수 없다. <b>다시는 일어나면 안 된다.</b>', 'It must not happen again!']],
        draw(x, t) { bg(x, t, '#2b2170', '#141038'); const tilt = lerp(0, -.16, E.io(seg(t, 3, 5.5))); scale(x, 640, 200, tilt, () => child(x, 0, -10, .8, t, 1), () => { for (let i = 0; i < 20; i++) circ(x, -50 + (i % 5) * 25, -10 - Math.floor(i / 5) * 18, 9, '#ffffffcc'); });
          alpha(x, seg(t, 7.4, 9), () => { for (let i = 0; i < 160; i++) { const a = i * 2.39996, r = 8 * Math.sqrt(i) * 4; circ(x, 640 + Math.cos(a) * r * 1.6, 560 + Math.sin(a) * r * .3, 2.5, `rgba(255,220,150,${.4 + .4 * Math.sin(t * 2 + i)})`); } }); } }
    ],
    p11: [
      { dur: 12, bg: ['#141038', '#3b2f6b'], lines: [[0, '“같고도 다른 것.” 이 주제가 탈리도마이드 이야기에서 이토록 선명하다.', 'The theme of the same and not the same'], [4, '약을 만들고 판 사람들은 다른 진정제와 <b>닮은 점</b>만 보기로 했다.', 'chose to see its resemblance to other sedatives'], [7.6, '그리고 거울상 분자의 효과와 독성이 <b>다를 수 있다</b>는 점은 보지 않기로 했다.', 'They chose not to see ...']],
        draw(x, t) { bg(x, t, '#141038', '#3b2f6b'); x.fillStyle = 'rgba(180,220,255,.22)'; rr(x, 628, 100, 24, 480, 12); x.fill(); molecule(x, 400, 330, 1.2, t, false, '#3ddc97'); const look = seg(t, 7.6, 9);
          molecule(x, 880, 330, 1.2, t, true, look > .5 ? '#e0567a' : '#3ddc97'); alpha(x, seg(t, 4, 5), () => { label(x, 'the same', 400, 560, 1, '#fff', '#3ddc97', 30); }); alpha(x, look, () => { label(x, 'not the same', 880, 560, 1, '#fff', '#e0567a', 30); });
          alpha(x, seg(t, 9.5, 11), () => serif(x, 'The Same and Not the Same', 640, 660, 44, '#ffd23f')); } }
    ]
  };

  /* 재생기: 일시정지 / 이전 / 다음 / 건너뛰기, 영화식 자막(한국어 + 영어 원문 조각) */
  function play(id, onDone) {
    const shots = SC[id]; if (!shots) { onDone && onDone(); return; }
    const ov = document.createElement('div'); ov.className = 'esc';
    ov.innerHTML = `<canvas></canvas><div class="esc-prog"></div><div class="esc-sub"><div class="ko"></div><div class="en"></div></div><div class="esc-ctl"><button data-a="prev">⏮</button><button data-a="pause">⏸</button><button data-a="next">⏭</button><button data-a="voice">${SV.sceneVoice ? '🔊' : '🔇'}</button></div><button class="esc-skip">건너뛰기 ▸▸</button>`;
    document.body.appendChild(ov); const cv = ov.querySelector('canvas'), x = cv.getContext('2d'), ko = ov.querySelector('.ko'), en = ov.querySelector('.en'), prog = ov.querySelector('.esc-prog'), bP = ov.querySelector('[data-a=pause]');
    let i = -1, t0 = 0, raf = 0, alive = true, paused = false, pAt = 0, shown = '';
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = ov.clientWidth * d; cv.height = ov.clientHeight * d; }; fit(); addEventListener('resize', fit);
    const end = skipped => { if (!alive) return; alive = false; if (typeof Reader !== 'undefined') Reader.stop(); cancelAnimationFrame(raf); removeEventListener('resize', fit); removeEventListener('keydown', key); ov.remove(); onDone && onDone(!!skipped); };
    const setP = v => { const n = performance.now(); if (v === paused) return; if (v) { pAt = n; try { speechSynthesis.pause(); } catch (e) { } } else { t0 += n - pAt; try { speechSynthesis.resume(); } catch (e) { } } paused = v; bP.textContent = v ? '▶' : '⏸'; ov.classList.toggle('paused', v); };
    const go = j => { if (j >= shots.length) return end(false); if (i >= 0) Snd.play('whoosh'); i = Math.max(0, j); t0 = performance.now(); pAt = t0; shown = ''; prog.innerHTML = shots.map((_, k) => `<i class="${k < i ? 'd' : k === i ? 'o' : ''}"></i>`).join(''); };
    ov.querySelector('.esc-skip').onclick = e => { e.stopPropagation(); end(true); };
    ov.querySelector('.esc-ctl').onclick = e => { e.stopPropagation(); const a = e.target.dataset.a; if (a === 'pause') setP(!paused); if (a === 'voice') { SV.sceneVoice = !SV.sceneVoice; save(); e.target.textContent = SV.sceneVoice ? '🔊' : '🔇'; if (!SV.sceneVoice) Reader.stop(); } if (a === 'next') go(i + 1); if (a === 'prev') { const tt = ((paused ? pAt : performance.now()) - t0) / 1000; go(tt > 2 ? i : i - 1); } };
    cv.onclick = () => setP(!paused);
    const key = e => { if (e.code === 'Space') { e.preventDefault(); setP(!paused); } if (e.code === 'ArrowRight') go(i + 1); if (e.code === 'ArrowLeft') go(i - 1); }; addEventListener('keydown', key);
    const frame = now => { if (!alive) return; const s = shots[i], t = Math.max(0, ((paused ? pAt : now) - t0) / 1000);
      const band = Math.min(cv.height * .2, cv.width * .12), ah = cv.height - band, sc = Math.max(cv.width / VW, ah / VH), ox = (cv.width - VW * sc) / 2, oy = Math.min(0, ah - 660 * sc); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = s.bg[1]; x.fillRect(0, 0, cv.width, cv.height); x.setTransform(sc, 0, 0, sc, ox, oy); x.lineCap = 'round'; x.lineJoin = 'round';
      try { s.draw(x, t); } catch (err) { }
      let cur = null; for (const L of s.lines) if (t >= L[0]) cur = L; const k = cur ? cur[0] + cur[1] : ''; if (k !== shown) { shown = k; ko.innerHTML = cur ? cur[1] : ''; en.textContent = cur && cur[2] ? cur[2] : ''; ov.classList.remove('subin'); void ov.offsetWidth; ov.classList.add('subin'); if (cur) Snd.play('tick'); if (cur && cur[2] && typeof Reader !== 'undefined') Reader.line(cur[2]); }
      if (!paused && t > s.dur + 1) go(i + 1); raf = requestAnimationFrame(frame); };
    go(0); raf = requestAnimationFrame(frame);
  }
  return { play, SC, has: id => !!SC[id], add: (id, shots) => { SC[id] = shots; }, K: { VW, VH, E, cl, seg, lerp, rr, circ, txt, serif, alpha, pop, bg, ground, person, pill, bottle, doc, scale, molecule, hand, whistle, sound, label, child } };
})();
