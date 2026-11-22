/* 영어 자습용 인쇄물(HTML) 생성: node tools/print_english.js <out.html> <fontCssDir>
   지문 중심: 왼쪽 영어(끊어 읽기) / 오른쪽 해석(접어서 가리기) / ★ 핵심 포인트 한 줄.
   교과서·프린트 지문은 확인 문제 3개씩, 모의고사는 문항마다 정답·근거 한 줄. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', 'js', 'en');
global.window = global; global.PASSAGES = []; global.QUEST = {};
for (const f of ['data.js', 'ne4.js', 'ne5.js', 'mock25.js', 'mock26.js', 'money.js', 'quests.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const OUT = process.argv[2], FONT = process.argv[3] || '';
const SAME = Object.assign({ id: 'same' }, EN, { paras: EN.paras.map(p => Object.assign({}, p, { quest: QUEST[p.id] })) });
const byId = id => id === 'same' ? SAME : PASSAGES.find(p => p.id === id);
const LIST = [['ne4', '교과서 4과', 9], ['ne5', '교과서 5과', 9], ['money', '프린트 ① The History of Money', 6], ['same', '프린트 ② The Same and Not the Same', 10], ['m25', '2025 고2 10월 모의고사 29~40', 12], ['m26', '2026 고2 10월 모의고사 21, 29~42', 14]];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const circ = ['①', '②', '③', '④', '⑤'];
const ko = t => (t || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/* 영어: 고친 형태로, 빈칸 정답은 굵게, 끊어 읽기 / 유지 */
const en = t => esc(t.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '\u0001$1\u0002').replace(/\[\[([^\]]*)\]\]/g, '\u0001$1\u0002').replace(/<[^>]+>/g, '').replace(/^→\s*/, '→ ')).replace(/ \/ /g, ' <i>/</i> ').replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>');
/* ★ 포인트: 문장의 첫 문법 메모만, 짧게 */
const point = s => { const n = (s[3] || [])[0]; if (!n) return ''; let t = n.replace(/<b>/g, '\u0001').replace(/<\/b>/g, '\u0002').replace(/<[^>]+>/g, '').trim(); if (t.length > 70) t = t.slice(0, 68) + '…'; return esc(t).replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>'); };
const ANS = []; let qn = 0;

function passage(id, label, min) {
  const ps = byId(id); let h = `<div class="ps${['ne5', 'same'].includes(id) ? ' cont' : ''}"><h2>${label} <small>· 약 ${min}분</small></h2><p class="gist">🎯 ${esc(ps.gist || '')}</p>`;
  if (ps.structure && !ps.exam) h += `<div class="flow">${ps.structure.map(([a, b]) => `<span><b>${esc(a)}</b> ${esc(b.split(/[.。]/)[0])}</span>`).join('<em>→</em>')}</div>`;
  ps.paras.forEach(p => {
    h += `<h3>${esc(p.name)}</h3>`;
    if (p.q) { const q = p.q; const a = typeof q.ans === 'number' ? circ[q.ans] + (q.opts && q.opts[q.ans] && !/^[①-⑤]$/.test(q.opts[q.ans]) ? ' ' + esc(ko(q.opts[q.ans])) : '') : esc(String(q.ans)); h += `<p class="key">정답 <b>${a}</b> — ${esc(ko(q.why || ''))}</p>`; }
    h += `<table class="st">${p.s.map(s => { const pt = point(s); return `<tr><td class="e">${en(s[0])}${pt ? `<div class="pt">★ ${pt}</div>` : ''}</td><td class="k">${esc(ko(s[2]))}</td></tr>`; }).join('')}</table>`;
  });
  /* 확인 문제 3개: 교과서·프린트만 (문법 2 + 해석 함정 1) */
  if (!ps.exam) {
    const G = [], W = []; ps.paras.forEach(p => { const q = p.quest || (ps.quest || {})[p.id] || {}; (q.gram || []).forEach(g => G.push(g)); (q.wrong || []).forEach(w => p.s[w[0]] && W.push([p.s[w[0]], w])); });
    const pick = [G[0], G[Math.floor(G.length / 2)]].filter(Boolean); let qh = '', ah = '';
    pick.forEach(g => { qn++; const [q, opts, ans, why] = g; qh += `<div class="q"><b>${qn}.</b> ${q}<div class="opts">${opts.map((o, k) => `<span>${circ[k]} ${o}</span>`).join('')}</div></div>`; ah += `<p><b>${qn}.</b> ${circ[ans]} — ${why}</p>`; });
    const w = W[Math.floor(W.length / 3)]; if (w) { qn++; qh += `<div class="q"><b>${qn}.</b> 이 해석은 어디가 틀렸을까? <span class="enq">${en(w[0][0]).replace(/ <i>\/<\/i> /g, ' ')}</span><div class="wk">✗ ${esc(w[1][2])}</div></div>`; ah += `<p><b>${qn}.</b> ${esc(w[1][4])}</p>`; }
    h += `<div class="chk"><b>✅ 확인 3문제</b>${qh}</div>`; ANS.push([label, ah]);
  }
  return h + '</div>';
}

const css = `
${FONT ? `@import url('${FONT}/400.css');@import url('${FONT}/700.css');@import url('${FONT}/900.css');` : ''}
@page{size:A4;margin:9mm 9mm 10mm}
body{font-family:'Noto Sans KR',sans-serif;font-size:9.5pt;line-height:1.45;color:#111;margin:0}
h1{font-size:20pt;margin:0 0 3mm;font-weight:900}
h2{font-size:13pt;margin:0 0 2mm;padding:1.5mm 3mm;background:#111;color:#fff;border-radius:1.5mm;break-after:avoid}h2 small{font-weight:400;font-size:9pt;opacity:.8}
h3{font-size:9.5pt;margin:1.8mm 0 .6mm;break-after:avoid;border-left:4px solid #111;padding-left:2mm}
.ps{break-before:page}.ps.cont{break-before:auto;margin-top:4mm}.gist{margin:0 0 1.5mm;font-weight:700}
.flow{font-size:8.5pt;margin-bottom:1.5mm;line-height:1.6}.flow em{font-style:normal;margin:0 1mm;color:#888}.flow b{background:#eee;padding:0 1mm}
.key{margin:0 0 1mm;font-size:8.6pt;background:#fff6d6;border:1px solid #e0c060;padding:1mm 2mm;border-radius:1mm;break-after:avoid}
table.st{border-collapse:collapse;width:100%}
.st td{vertical-align:top;padding:.5mm 1.2mm;border-bottom:1px solid #e2e2e2}
.st td.e{width:63%;font-family:'Charter','Bitstream Charter','Caladea',serif;font-size:9.2pt;line-height:1.36;border-right:1.5px dashed #888}
.st td.e i{color:#c2410c;font-style:normal;font-family:'Noto Sans KR'}
.st td.k{font-size:7.9pt;color:#333;line-height:1.36}
.st tr{break-inside:avoid}
.pt{font-family:'Noto Sans KR';font-size:7.4pt;color:#1d4ed8;line-height:1.3;margin-top:.2mm}
.chk{border:1.5px solid #111;border-radius:2mm;padding:2mm 3mm;margin-top:2.5mm;break-inside:avoid}
.q{margin:1.2mm 0;font-size:9pt}.opts{display:flex;flex-wrap:wrap;gap:0 4mm;margin-left:3mm}.enq{font-family:'Charter',serif;display:block;margin:.5mm 0}.wk{color:#b91c1c}
table.tt{border-collapse:collapse;width:100%}.tt td,.tt th{border:1px solid #333;padding:1.6mm 2mm;vertical-align:top;font-size:9.5pt}.tt th{background:#eee;width:24mm}
.ans p{margin:0 0 1.2mm;font-size:9pt}.ans h3{margin-top:2mm}
.tip{border:1.5px dashed #555;padding:2mm 3mm;margin:2.5mm 0}
`;
let body = '';
LIST.forEach(([id, l, m]) => { body += passage(id, l, m); });
let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>영어 지문 자습 프린트</title><style>${css}</style></head><body>
<h1>영어 1시간 — 지문 다시 보기</h1>
<table class="tt">
<tr><th>읽는 법</th><td>오른쪽 <b>해석 칸을 접어서(점선) 가리고</b> 왼쪽 영어만 읽기 → <b>/</b> 단위로 끊어서 머릿속으로 해석 → 막히면 펼쳐서 확인. 파란 <b>★</b> = 시험에 나오는 문법 포인트.</td></tr>
<tr><th>0~18분</th><td>교과서 4과 (9분) · 5과 (9분) — 지문 끝 <b>확인 3문제</b>까지</td></tr>
<tr><th>18~34분</th><td>프린트 History of Money (6분) · The Same and Not the Same (10분)</td></tr>
<tr><th>34~60분</th><td>모의고사 2025 (12분) · 2026 (14분) — 문항마다 노란 칸 <b>정답·근거</b>를 먼저 읽고 지문에서 근거 문장 찾기</td></tr>
</table>
<div class="tip">⏱ 시간이 모자라면: 각 지문에서 ★ 있는 문장만 읽고 넘어가도 돼요. 확인 문제 정답은 맨 뒤 한 쪽.</div>
${body}
<div class="ps ans"><h2>확인 문제 정답</h2>${ANS.map(([t, a]) => `<h3>${t}</h3>${a}`).join('')}</div>
</body></html>`;
fs.writeFileSync(OUT, html); console.log('ok', qn, 'questions');
