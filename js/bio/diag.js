'use strict';
/* 개념 카드·문제용 그림: 에너지 그래프(활성화 에너지, 반응열) */
(() => {
  /* o: { r: 반응물, p: 생성물, a: 효소 없을 때 꼭대기, b: 효소 있을 때 꼭대기(없으면 생략), num: 눈금 숫자 표시, marks: ['ea','eb','dh'] } */
  function energy(o) {
    const W = 360, H = 220, L = 46, B = 190, T = 18, max = o.max || 110, y = v => B - (v / max) * (B - T);
    const xs = [L + 10, L + 70, L + 150, L + 230, W - 20];
    const curve = top => `M${L + 6},${y(o.r)} L${xs[1]},${y(o.r)} C${xs[1] + 40},${y(o.r)} ${xs[2] - 30},${y(top)} ${xs[2]},${y(top)} C${xs[2] + 30},${y(top)} ${xs[3] - 40},${y(o.p)} ${xs[3]},${y(o.p)} L${W - 14},${y(o.p)}`;
    const arrow = (x, v1, v2, col, txt, left) => `<line x1="${x}" y1="${y(v1)}" x2="${x}" y2="${y(v2)}" stroke="${col}" stroke-width="2.2" marker-start="url(#ah)" marker-end="url(#ah)"/><text x="${left ? x - 20 : x + 6}" y="${(y(v1) + y(v2)) / 2 + 4}" fill="${col}" font-size="13" font-weight="800">${txt}</text>`;
    const dash = v => `<line x1="${L}" y1="${y(v)}" x2="${W - 10}" y2="${y(v)}" stroke="#ffffff33" stroke-dasharray="4 4"/>`;
    const tick = v => o.num ? `<text x="${L - 6}" y="${y(v) + 4}" fill="#cfe" font-size="11" text-anchor="end">${v}</text>` : '';
    const m = o.marks || ['ea', 'eb', 'dh'];
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:420px;display:block;margin:6px auto" font-family="Noto Sans KR,sans-serif">
<defs><marker id="ah" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="context-stroke"/></marker></defs>
<line x1="${L}" y1="${T - 6}" x2="${L}" y2="${B}" stroke="#9fe" stroke-width="1.5"/><line x1="${L}" y1="${B}" x2="${W - 8}" y2="${B}" stroke="#9fe" stroke-width="1.5"/>
<text x="10" y="${T + 4}" fill="#9fe" font-size="11">에너지</text><text x="${W - 70}" y="${B + 16}" fill="#9fe" font-size="11">반응의 진행</text>
${dash(o.r)}${dash(o.p)}${dash(o.a)}${o.b != null ? dash(o.b) : ''}${tick(o.r)}${tick(o.p)}${tick(o.a)}${o.b != null ? tick(o.b) : ''}
<path d="${curve(o.a)}" fill="none" stroke="#ff6a7a" stroke-width="3"/>${o.b != null ? `<path d="${curve(o.b)}" fill="none" stroke="#5ab8ff" stroke-width="3" stroke-dasharray="7 4"/>` : ''}
<text x="${L + 8}" y="${y(o.r) - 6}" fill="#fff" font-size="12" font-weight="700">반응물</text><text x="${xs[3] + 4}" y="${y(o.p) - 6}" fill="#fff" font-size="12" font-weight="700">생성물</text>`;
    if (m.includes('ea')) s += arrow(xs[2] + 9, o.r, o.a, '#ff6a7a', '㉠');
    if (o.b != null && m.includes('eb')) s += arrow(xs[2] - 9, o.r, o.b, '#5ab8ff', '㉡', true);
    if (m.includes('dh')) s += arrow(W - 30, o.r, o.p, '#ffd23f', '㉢');
    s += `<text x="${L + 6}" y="${H - 2}" fill="#ff6a7a" font-size="11">— 효소 없음</text>${o.b != null ? `<text x="${L + 92}" y="${H - 2}" fill="#5ab8ff" font-size="11">- - 효소 있음</text>` : ''}</svg>`;
    return s;
  }
  window.energySVG = energy;
  window.BDIAG = {
    ea: energy({ r: 40, p: 10, a: 100, marks: ['ea'] }) + '<p class="cap">㉠ = 꼭대기 − 반응물 = <b>활성화 에너지</b>. 반응물이 이만큼 에너지를 받아야 반응이 시작된다.</p>',
    eaE: energy({ r: 40, p: 10, a: 100, b: 70, marks: ['ea', 'eb'] }) + '<p class="cap">효소가 있으면 꼭대기가 낮아진다: ㉡(효소 있음) &lt; ㉠(효소 없음). 반응물·생성물 높이는 그대로.</p>',
    dh: energy({ r: 40, p: 10, a: 100, marks: ['dh'] }) + '<p class="cap">㉢ = 반응물 − 생성물 = <b>반응열</b>. 꼭대기와는 상관없다.</p>',
    exo: energy({ r: 70, p: 20, a: 100, b: 85, marks: ['dh'] }) + '<p class="cap"><b>발열 반응</b>: 생성물이 더 낮다 → 차이만큼 에너지 <b>방출</b>. 큰 분자 → 작은 분자(<b>이화 작용</b>, 예: 세포호흡).</p>',
    endo: energy({ r: 20, p: 60, a: 95, b: 75, marks: ['dh'] }) + '<p class="cap"><b>흡열 반응</b>: 생성물이 더 높다 → 차이만큼 에너지 <b>흡수</b>. 작은 분자 → 큰 분자(<b>동화 작용</b>, 예: 광합성).</p>',
    calc: energy({ r: 40, p: 10, a: 100, b: 70, num: true }) + '<p class="cap">숫자로 구하기 (단위 kJ): ㉠ = 100 − 40 = <b>60</b>, ㉡ = 70 − 40 = <b>30</b>, ㉢ = 40 − 10 = <b>30 방출</b>. 효소가 낮춘 양 = 100 − 70 = 30.</p>'
  };
})();
