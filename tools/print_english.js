/* 영어 자습용 인쇄물(HTML) 생성: node tools/print_english.js <out.html> <fontCssDir>
   앱 데이터(지문·문제·사전·문법·각인 모드)를 그대로 써서 1시간용 프린트를 만든다. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', 'js', 'en');
global.window = global; global.PASSAGES = []; global.QUEST = {};
for (const f of ['data.js', 'ne4.js', 'ne5.js', 'mock25.js', 'mock26.js', 'money.js', 'quests.js', 'grammar.js', 'dict.js', 'dict2.js', 'dict3.js', 'dict4.js', 'dict5.js', 'flash_data.js', 'flash_same.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const OUT = process.argv[2], FONT = process.argv[3] || '';
const SAME = Object.assign({ id: 'same', title: 'The Same and Not the Same (프린트)' }, EN, { paras: EN.paras.map(p => Object.assign({}, p, { quest: QUEST[p.id] })) });
const byId = id => id === 'same' ? SAME : PASSAGES.find(p => p.id === id);
const ORDER = [['ne4', '교과서 4과'], ['ne5', '교과서 5과'], ['money', '프린트 ① The History of Money'], ['same', '프린트 ② The Same and Not the Same'], ['m25', '2025 고2 10월 모의고사 29~40'], ['m26', '2026 고2 10월 모의고사 21, 29~42']];
/* 시드 고정 난수 (매번 같은 프린트) */
let seed = 20261123; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = t => t.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, '').replace(/ \/ /g, ' ').replace(/^→\s*/, '').replace(/^\([A-C]\)\s*|^[①-⑤]\s*/, '').replace(/\s*[①-⑤]\s*/g, ' ').replace(/\s+/g, ' ').trim();
const ko = t => (t || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const circ = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
const ROLEC = { 배경: '#64748b', 주제: '#d97706', 주장: '#d97706', 근거: '#16a34a', 예시: '#2563eb', 반전: '#dc2626', 대조: '#9333ea', 결과: '#0d9488', 결론: '#ea580c', 비유: '#0891b2', 정의: '#4f46e5', 질문: '#db2777', 정답: '#ca8a04', 요약: '#ca8a04', 함정: '#dc2626', 전환: '#a855f7' };
const ANS = []; /* [섹션, html] */
let qn = 0;

/* ── 1. 흐름 지도 ── */
function flowMap(id, label) {
  const ps = byId(id); let h = `<h3>${label}</h3><p class="gist">${esc(ps.gist || '')}</p>`;
  if (ps.structure) h += `<table class="struct">${ps.structure.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>`;
  const hasF = ps.paras.some(p => FLASH[p.id]);
  if (hasF) {
    h += `<div class="flow">`; ps.paras.forEach(p => { const F = FLASH[p.id]; if (!F) return; h += `<div class="fp"><b>${esc(p.name)}</b>${F.map(f => `<div class="fr"><i style="color:${ROLEC[f[2]] || '#555'};border-color:${ROLEC[f[2]] || '#555'}">${f[2]}</i><span class="em">${f[0]}</span>${esc(f[1])}</div>`).join('')}</div>`; }); h += `</div>`;
  }
  return h;
}

/* ── 2. 문제 ── */
function gramQs() {
  let h = '', a = '';
  ORDER.slice(0, 4).forEach(([id, label]) => { const ps = byId(id); const list = []; ps.paras.forEach(p => { const q = p.quest || (ps.quest || {})[p.id] || {}; (q.gram || []).forEach(g => list.push(g)); }); if (!list.length) return;
    h += `<h4>${label}</h4>`; list.forEach(g => { qn++; const [q, opts, ans, why] = g; const sh = shuffle(opts.map((o, k) => [o, k])); const ai = sh.findIndex(x => x[1] === ans);
      h += `<div class="q"><b>${qn}.</b> ${q}<div class="opts">${sh.map((o, k) => `<span>${circ[k]} ${o[0]}</span>`).join('')}</div></div>`; a += `<p><b>${qn}.</b> ${circ[ai]} — ${why}</p>`; }); });
  ANS.push(['A. 어법·문법', a]); return h;
}
function orderQs() {
  let h = '', a = ''; const sets = [['ne4', 2], ['ne5', 2], ['money', 2], ['same', 2]];
  sets.forEach(([id, n]) => { const ps = byId(id); const cand = shuffle(ps.paras.filter(p => p.s.filter(s => !/^→/.test(s[0])).length >= 4)).slice(0, n);
    cand.forEach(p => { const real = p.s.filter(s => !/^→/.test(s[0])); const st = Math.floor(rnd() * (real.length - 3)); const given = real[st], part = real.slice(st + 1, st + 4); const lab = ['(A)', '(B)', '(C)']; const sh = shuffle(part.map((s, k) => [s, k])); qn++;
      h += `<div class="q"><b>${qn}.</b> 주어진 글 다음에 이어질 순서로 알맞은 것은? <span class="src">(${esc(p.name)})</span><div class="given">${esc(plain(given[0]))}</div>${sh.map(([s], k) => `<div class="pt"><b>${lab[k]}</b> ${esc(plain(s[0]))}</div>`).join('')}<div class="line">답: ______ - ______ - ______</div></div>`;
      const ord = part.map((_, k) => lab[sh.findIndex(x => x[1] === k)]).join(' - ');
      a += `<p><b>${qn}.</b> ${ord}<br><span class="dim">${esc(ko(given[2]))} → ${part.map(s => esc(ko(s[2]))).join(' → ')}</span></p>`; }); });
  ANS.push(['B. 순서 배열', a]); return h;
}
function insertQs() {
  let h = '', a = ''; const sets = [['ne4', 2], ['ne5', 2], ['money', 1], ['same', 2]];
  sets.forEach(([id, n]) => { const ps = byId(id); const cand = shuffle(ps.paras.filter(p => p.s.filter(s => !/^→/.test(s[0])).length >= 5)).slice(0, n);
    cand.forEach(p => { const real = p.s.filter(s => !/^→/.test(s[0])); const at = 1 + Math.floor(rnd() * (real.length - 1)); const giv = real[at]; const rest = real.filter((_, k) => k !== at); qn++;
      /* 슬롯: rest[0] 뒤부터 최대 5개 */ const off = Math.max(0, Math.min(at - 1 - Math.floor(rnd() * 5), rest.length - 5)); let body = ''; let slot = 0, ansSlot = -1;
      rest.forEach((s, k) => { if (k > off && slot < 5) { if (k === at) ansSlot = slot; body += ` <b class="slot">( ${circ[slot]} )</b> `; slot++; } body += esc(plain(s[0])) + ' '; });
      if (at === real.length - 1 && slot < 5) { ansSlot = slot; body += ` <b class="slot">( ${circ[slot]} )</b>`; }
      h += `<div class="q"><b>${qn}.</b> 글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은? <span class="src">(${esc(p.name)})</span><div class="given">${esc(plain(giv[0]))}</div><div class="pas">${body}</div></div>`;
      a += `<p><b>${qn}.</b> ${circ[ansSlot]} <span class="dim">— 주어진 문장: ${esc(ko(giv[2]))} / 앞 문장: ${esc(ko(real[at - 1][2]))}</span></p>`; }); });
  ANS.push(['C. 문장 삽입', a]); return h;
}
function clozeQs() {
  let h = '<div class="cl">', a = ''; const pool = [];
  ORDER.slice(0, 4).forEach(([id]) => { const ps = byId(id); ps.paras.forEach(p => { const q = p.quest || (ps.quest || {})[p.id] || {}; (q.voc || []).forEach(v => { const w = v[0]; if (/[~A-Z]|\b(A|B|O)\b/.test(w) || w.length < 5) return; const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'); const s = p.s.find(s => re.test(plain(s[0]))); if (s) pool.push([w, v[1], plain(s[0]), re]); }); }); });
  shuffle(pool).slice(0, 18).forEach(([w, m, s, re]) => { qn++; const blank = s.replace(re, `<u>${w[0]}${'_'.repeat(Math.max(4, w.length - 1))}</u>`); h += `<div class="q"><b>${qn}.</b> ${blank.replace(/<u>(.*?)<\/u>/, (x) => x)} <span class="hint">(${esc(m)})</span></div>`; a += `<span><b>${qn}.</b> ${esc(w)}</span> `; });
  ANS.push(['D. 빈칸 (첫 글자 + 뜻 힌트)', `<p class="inline">${a}</p>`]); return h + '</div>';
}
function wrongQs() {
  let h = '', a = ''; const list = [];
  ORDER.slice(0, 4).forEach(([id]) => { const ps = byId(id); ps.paras.forEach(p => { const q = p.quest || (ps.quest || {})[p.id] || {}; (q.wrong || []).forEach(w => { const s = p.s[w[0]]; if (s) list.push([s, w]); }); }); });
  shuffle(list).slice(0, 12).forEach(([s, w]) => { qn++; h += `<div class="q"><b>${qn}.</b> <span class="en">${esc(plain(s[0]))}</span><div class="wk">✗ 틀린 해석: ${esc(w[2])}</div><div class="line">어디가 왜 틀렸을까? ______________________________________________</div></div>`; a += `<p><b>${qn}.</b> ${esc(w[4])}<br><span class="dim">바른 해석: ${esc(ko(s[2]))}</span></p>`; });
  ANS.push(['E. 틀린 해석 고치기', a]); return h;
}

/* ── 3. 단어 (가리고 외우기) ── */
function vocab() {
  let h = ''; ORDER.slice(0, 4).forEach(([id, label]) => { const ps = byId(id); const seen = new Set(); const L = []; ps.paras.forEach(p => { const q = p.quest || (ps.quest || {})[p.id] || {}; (q.voc || []).forEach(v => { const k = v[0].toLowerCase(); if (!seen.has(k)) { seen.add(k); L.push(v); } }); });
    h += `<h4>${label} (${L.length})</h4>${L.map(v => `<div class="vr"><span class="c">□</span><span class="w">${esc(v[0])}</span><span class="m">${esc(v[1])}</span></div>`).join('')}`; });
  /* 모의고사 핵심 어휘: 각인 모드 핵심어 중 사전에 있는 단어 */
  ['m25', 'm26'].forEach(id => { const ps = byId(id); const seen = new Set(); const L = []; ps.paras.forEach(p => p.s.forEach(s => plain(s[0]).split(/[^A-Za-z\-]+/).forEach(w => { const k = w.toLowerCase(); if (k.length >= 9 && !seen.has(k) && DICT[k]) { seen.add(k); L.push([w, DICT[k]]); } })));
    const L2 = L.slice(0, 50); h += `<h4>${ORDER.find(x => x[0] === id)[1]} — 핵심 긴 단어 ${L2.length}</h4>${L2.map(v => `<div class="vr"><span class="c">□</span><span class="w">${esc(v[0])}</span><span class="m">${esc(v[1])}</span></div>`).join('')}`; });
  return h;
}
/* ── 4. 모의고사 정답·근거 ── */
function mockKey() {
  let h = ''; ['m25', 'm26'].forEach(id => { const ps = byId(id); h += `<h4>${ORDER.find(x => x[0] === id)[1]}</h4><table class="mk">`; ps.paras.forEach(p => { if (!p.q) return; const q = p.q; const ans = Array.isArray(q.ans) ? q.ans.map(i => circ[i]).join(', ') : (typeof q.ans === 'number' ? circ[q.ans] + (q.opts && q.opts[q.ans] && !/^[①-⑤]$/.test(q.opts[q.ans]) ? ' ' + esc(ko(q.opts[q.ans])) : '') : esc(String(q.ans)));
    h += `<tr><th>${esc(p.name)}</th><td><b>${ans}</b><br>${ko(q.why || '')}</td></tr>`; }); h += `</table>`; }); return h;
}
/* ── 5. 문법 노트 ── */
function grammar() { return GRAM.map(t => `<div class="gt"><h4>${t.icon} ${esc(t.title)}</h4>${t.cards.map(c => `<div class="gc"><b>${c.h}</b><div>${c.b}</div></div>`).join('')}</div>`).join(''); }

const css = `
${FONT ? `@import url('${FONT}/400.css');@import url('${FONT}/700.css');@import url('${FONT}/900.css');` : ''}
@page{size:A4;margin:13mm 12mm 14mm}
body{font-family:'Noto Sans KR',sans-serif;font-size:10.2pt;line-height:1.5;color:#111;margin:0}
h1{font-size:22pt;margin:0 0 4mm;font-weight:900}h2{font-size:15pt;margin:0 0 3mm;padding:2mm 3mm;background:#111;color:#fff;border-radius:2mm;break-after:avoid}
h3{font-size:12.5pt;margin:4mm 0 1.5mm;border-bottom:2px solid #111;break-after:avoid}h4{font-size:11pt;margin:3mm 0 1.5mm;break-after:avoid}
.part{break-before:page}.dim{color:#555}.src{color:#666;font-size:8.5pt}
.en,.given,.pt,.pas,.cl .q,.voc .w{font-family:'Charter','Bitstream Charter','Caladea',serif}
table{border-collapse:collapse;width:100%}
.tt td,.tt th{border:1px solid #333;padding:2mm;vertical-align:top}.tt th{background:#eee;width:22mm}
.struct th{width:30mm;text-align:left;vertical-align:top;padding:1mm 2mm;background:#f2f2f2;border:1px solid #ccc;font-size:9pt}.struct td{padding:1mm 2mm;border:1px solid #ccc;font-size:9pt}
.gist{margin:0 0 1.5mm;font-weight:700;font-size:9.5pt}
.flow{columns:2;column-gap:5mm;margin-top:2mm}.fp{break-inside:avoid;margin-bottom:2mm}.fp>b{display:block;font-size:9pt;background:#f2f2f2;padding:.5mm 1.5mm;margin-bottom:.5mm}
.fr{font-size:8.6pt;line-height:1.35;padding:.3mm 0;display:flex;gap:1.2mm;align-items:baseline}.fr i{font-style:normal;font-size:7pt;font-weight:900;border:1px solid;border-radius:1mm;padding:0 .6mm;flex:none;min-width:7mm;text-align:center}.fr .em{flex:none;font-size:8pt}
.q{margin:0 0 2.2mm;break-inside:avoid}.two .q{font-size:9.4pt}.opts{display:flex;flex-wrap:wrap;gap:.3mm 4mm;margin:.4mm 0 0 3mm;font-size:9pt}
.given{border:1.2px solid #111;padding:1.5mm 2.5mm;margin:1mm 0;font-size:10.5pt}.pt{margin:.6mm 0 .6mm 2mm;font-size:10.5pt}.pas{font-size:10.5pt;line-height:1.65}.slot{font-family:'Noto Sans KR';font-weight:900}
.line{margin-top:1mm;color:#444}.wk{color:#b91c1c;margin:.6mm 0}.hint{color:#555;font-size:8.5pt;font-family:'Noto Sans KR'}
.two{columns:2;column-gap:6mm}.two .q{break-inside:avoid}
.voc{margin-bottom:2mm}.voc td{border-bottom:1px solid #ddd;padding:.6mm 1.5mm;font-size:9pt}.voc .w{width:38%;font-size:10pt}.voc .m{color:#333}.voc .c{width:5mm;color:#999}
.vwrap{columns:2;column-gap:6mm}.vr{display:flex;gap:1.5mm;font-size:8.8pt;line-height:1.35;border-bottom:1px solid #e3e3e3;padding:.4mm 0;break-inside:avoid}.vr .w{font-family:'Charter','Bitstream Charter',serif;font-size:9.6pt;width:34%;flex:none;font-weight:700}.vr .m{color:#333}.vr .c{color:#aaa;flex:none}.vwrap table{break-inside:auto}.vwrap h4{break-after:avoid}
.mk th{width:40mm;text-align:left;vertical-align:top;font-size:9pt;padding:1.2mm;border:1px solid #bbb;background:#f6f6f6}.mk td{font-size:9pt;padding:1.2mm 2mm;border:1px solid #bbb}
.ans p{margin:0 0 1.4mm;font-size:9pt;break-inside:avoid}.ans .inline span{display:inline-block;margin-right:4mm}
.gt{break-inside:avoid-page;margin-bottom:2mm}.gc{font-size:8.8pt;margin:0 0 1.5mm;padding-left:2mm;border-left:2px solid #999}.gc>b{display:block}
.gc .box{border:1px solid #333;padding:1mm 2mm;margin:1mm 0;font-weight:700}.gc .eg{background:#f4f4f4;padding:1mm 2mm;margin:1mm 0;font-family:'Charter',serif}
.gnote{columns:2;column-gap:6mm;font-size:8.6pt}.gnote .gt{break-inside:auto}
.tip{border:1.5px dashed #555;padding:2mm 3mm;margin:2mm 0;font-size:9.5pt}
.chk{font-size:9pt}.chk td{border:1px solid #999;padding:1.2mm 2mm}
`;
let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>영어 자습 프린트</title><style>${css}</style></head><body>`;
html += `<h1>영어 1시간 자습 프린트</h1><p>범위: 교과서 4·5과 / 프린트 2지문 (History of Money, The Same and Not the Same) / 2025·2026 고2 10월 모의고사</p>
<table class="tt"><tr><th>0~10분</th><td><b>① 흐름 지도</b>: 지문마다 <b>구조표 → 한 줄 핵심</b>을 위에서 아래로 소리 없이 입으로 읽기. 역할 딱지(반전·결론·정답)에 표시된 문장은 시험에 나오는 자리예요.</td></tr>
<tr><th>10~35분</th><td><b>② 변형 문제</b>: A 어법·문법 → B 순서 → C 삽입 → D 빈칸 → E 틀린 해석. <b>답은 뒤에 있으니 끝까지 다 풀고</b> 한꺼번에 채점. 모르는 건 ☆ 표시하고 넘어가기.</td></tr>
<tr><th>35~45분</th><td><b>③ 채점 + ☆ 다시 보기</b>: 틀린 문제의 해설을 읽고, 문법 이름이 나오면 맨 뒤 <b>문법 노트</b>에서 그 칸만 찾아 읽기.</td></tr>
<tr><th>45~57분</th><td><b>④ 단어 가리고 외우기</b>: 뜻 칸을 손이나 종이로 가리고 영어만 보고 뜻 말하기. 모르면 □에 체크 → 체크한 것만 2바퀴.</td></tr>
<tr><th>57~60분</th><td><b>⑤ 모의고사 정답·근거 표</b> 훑기: 문항마다 “왜 그게 답인지” 한 줄씩.</td></tr></table>
<div class="tip">💡 <b>검색 없이 푸는 법</b>: 모르는 단어 → 뒤쪽 단어장 / 문법 용어 → 맨 뒤 문법 노트 / 해석 → 정답·해설에 한국어 해석이 같이 있어요. 이 프린트 하나로 끝나게 만들었어요.</div>
<h3>표시 읽는 법</h3><p class="chk">역할 딱지: <b style="color:#d97706">주제</b> 글의 핵심 · <b style="color:#dc2626">반전</b> But/Yet/However 자리 (빈칸·삽입 단골) · <b style="color:#16a34a">근거</b> · <b style="color:#2563eb">예시</b> · <b style="color:#9333ea">대조</b> · <b style="color:#0d9488">결과</b> · <b style="color:#ea580c">결론</b> · <b style="color:#ca8a04">정답</b> 빈칸 정답이 있던 문장 · <b style="color:#dc2626">함정</b> 무관한 문장</p>`;
html += `<div class="part"><h2>① 흐름 지도 (10분)</h2>${ORDER.map(([id, l]) => flowMap(id, l)).join('')}</div>`;
qn = 0;
html += `<div class="part"><h2>② 변형 문제 (25분)</h2><h3>A. 어법·문법 — 알맞은 것을 고르세요</h3><div class="two">${gramQs()}</div>`;
html += `<h3>B. 순서 배열</h3>${orderQs()}<h3>C. 문장 삽입</h3>${insertQs()}<h3>D. 빈칸 — 첫 글자와 뜻을 보고 단어를 쓰세요</h3>${clozeQs()}<h3>E. 틀린 해석 고치기</h3>${wrongQs()}</div>`;
html += `<div class="part ans"><h2>정답 및 해설</h2>${ANS.map(([t, a]) => `<h3>${t}</h3>${a}`).join('')}</div>`;
html += `<div class="part"><h2>④ 단어 — 뜻 칸을 가리고 외우기</h2><div class="vwrap">${vocab()}</div></div>`;
html += `<div class="part"><h2>⑤ 모의고사 정답·근거 한눈에</h2>${mockKey()}</div>`;
html += `<div class="part"><h2>부록 — 문법 노트 (찾아보기용)</h2><div class="gnote">${grammar()}</div></div>`;
html += `</body></html>`;
fs.writeFileSync(OUT, html); console.log('ok', qn, 'questions', (html.length / 1024).toFixed(0) + 'KB');
