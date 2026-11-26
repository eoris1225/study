/* 국어 1시간 자습 프린트 — 기말 범위 12지문 (다른 과목 1시간 프린트와 같은 틀)
   지문마다: 🎯 한 줄 주제 → 문단별 핵심 문장(원문) · 쉬운 말 · 내 필기 칸 → 한눈 비교표 → ⚠ 함정 → O/X 6 → 문제 / 맨 뒤 정답·근거
   node tools/print_ko.js  →  korean_print.html (저장소 루트)   ·  PDF: node tools/print_ko.js --pdf  →  print/korean-1hour.pdf */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'); global.window = {};
const R = f => fs.readFileSync(path.join(ROOT, 'js', 'ko', f), 'utf8');
eval(R('core.js')); global.KO = window.KO;
for (const f of ['d_law.js', 'd_bio.js', 'd_tech.js', 'd_soc.js', 'd_text.js']) eval(R(f));
const NUM = ['①', '②', '③', '④', '⑤'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* 원문 마크업 → 인쇄용: **핵심어** 굵게, 나머지 표시는 지움 */
const clean = s => esc(s).replace(/\[\[FIG:[^\]]+\]\]/g, '').replace(/\(\(|\)\)/g, '').replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>').replace(/\[\[([^\]]+?)\]\]/g, '$1').replace(/\{\{([^}]+?)\}\}/g, '<span class="bx">$1</span>').replace(/__([\s\S]+?)__/g, '<u>$1</u>');
/* 문단에서 핵심 문장(((…))이 걸친 문장)만 최대 3개 */
function keySents(raw) { const parts = raw.split(/(?<=[.?!](?:\)\)|\*\*|__|”|")*)\s+/), out = [];
  for (const s of parts) if (/\(\(|\)\)/.test(s) && out.length < 3) out.push(clean(s).trim());
  return out.length ? out : [clean(parts[0])]; }
const box = s => s.replace(/\{\{([^}]+?)\}\}/g, '<span class="bx">$1</span>');

const ORDER = [ /* [id, 분] — 김선홍T 다음 오홍주T */
  ['warrant', 4], ['review', 3], ['dopamine', 5], ['nwp', 5], ['honneth', 5], ['ecg', 7], ['argue', 3],
  ['disclose', 5], ['mrf', 4], ['shapley', 4], ['arch', 7], ['anthro', 5]];
const pickOx = p => { const n = p.ox.length, k = Math.min(6, n), idx = []; for (let i = 0; i < k; i++) idx.push(Math.round(i * (n - 1) / Math.max(1, k - 1))); return [...new Set(idx)]; };
const pickQ = p => p.exam ? p.quiz.map((q, i) => i).filter(i => /기출/.test(p.quiz[i].tag)) : (() => { const mc = p.quiz.map((q, i) => i).filter(i => p.quiz[i].opts); return mc.length ? [mc[mc.length - 1]] : []; })();

let qn = 0, oxn = 0; const ANS = [];
function section(id, min) { const p = KO.get(id); const oxI = pickOx(p), qI = pickQ(p); const oxStart = oxn + 1;
  const rows = p.paras.map((raw, i) => { const n = p.notes[i] || {}; return `<tr><th>${i + 1}</th><td class="ks">${keySents(raw).join(' <span class="dots">…</span> ')}</td><td>${esc(n.sum || '')}${n.point ? `<div class="pt">★ ${esc(n.point)}</div>` : ''}</td><td class="memo"></td></tr>`; }).join('');
  const traps = p.notes.map((n, i) => n.trap ? `<li><b>${i + 1}문단</b> ${esc(n.trap)}</li>` : '').join('');
  const tb = p.table ? `<table class="cmp"><tr>${p.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${p.table.rows.map(r => `<tr>${r.map((c, j) => j ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</table>` : '';
  const ox = oxI.map(i => { oxn++; return `<li><span class="n">${oxn}</span> ${esc(p.ox[i][0])} <span class="b">(   )</span></li>`; }).join('');
  const qs = qI.map(i => { const q = p.quiz[i]; qn++; ANS.push({ qn, id, q }); return `<div class="pr"><span class="n">문제 ${qn}.</span> <span class="tag">${esc(q.tag)}</span> ${box(esc(q.q))}
    ${q.img ? `<img class="qimg" src="${q.img}">` : ''}${q.bogi ? `<div class="bogi"><span>&lt;보기&gt;</span>${esc(q.bogi)}</div>` : ''}
    <ol class="opts">${q.opts.map((o, k) => `<li><b>${NUM[k]}</b> ${esc(o)}</li>`).join('')}</ol></div>`; }).join('');
  ANS.push({ ox: oxI.map((i, k) => ({ n: oxStart + k, a: p.ox[i][1], why: p.ox[i][2] })), id });
  return `<div class="sec"><h2>${p.emoji} ${esc(p.title)} <small>${esc(p.src)} · 약 ${min}분</small></h2>
<div class="theme">🎯 ${esc(p.theme)}</div>
<table class="kt"><tr><th style="width:5mm">¶</th><th>핵심 문장 (원문에서)</th><th style="width:31%">쉬운 말로</th><th style="width:16%">내 필기</th></tr>${rows}</table>
${p.id === 'ecg' ? '<img class="fig" src="img/ko/ecg_fig.png">' : ''}
<div class="duo"><div class="dl">${tb}</div><div class="dr"><div class="warn"><b class="t">⚠ 함정</b><ul>${traps}</ul></div></div></div>
<div class="oxb"><b>O/X</b> <small>맞으면 O, 틀리면 X — 틀린 곳에 밑줄</small><ol class="ox">${ox}</ol></div>
${qs}</div>`; }

const plan = (() => { let t = 0; const row = (who, ids) => { const a = t; const s = ids.map(([id, m]) => { t += m; return `${KO.get(id).title.replace(/\s*\(.*?\)\s*/g, '').split(':')[0]} (${m}분)`; }).join(' · '); return `<tr><th>${a}~${t}분</th><td><b>${who}</b> ${s}</td></tr>`; };
  return `<table class="plan"><tr><th>읽는 법</th><td>각 지문: <b>🎯 주제</b> → 표의 <b>핵심 문장</b>을 읽고, 가운데 <b>쉬운 말</b> 칸을 손으로 가린 채 무슨 뜻인지 말해 보기 → <b>⚠ 함정</b> → <b>O/X</b> → <b>문제</b>. 오른쪽 <b>내 필기</b> 칸엔 헷갈린 것만.</td></tr>
${row('김선홍T', ORDER.slice(0, 7))}${row('오홍주T', ORDER.slice(7))}<tr><th>${t}~60분</th><td>맨 뒤 <b>정답·근거</b>로 채점 → 틀린 O/X는 근거 문단을 앱(원문 탭 🔊 듣기)으로 다시 보기</td></tr></table>
<div class="tip">⏱ 시간이 모자라면: 지문마다 <b>🎯 주제 + ⚠ 함정 + O/X</b>만. 9월·10월 학평(심전도·건축법)은 기출이니 문제까지 꼭.</div>`; })();

function answers() { let h = '<div class="ans"><h2>정답 · 근거</h2>';
  for (const a of ANS) {
    if (a.ox) h += `<p><b>${esc(KO.get(a.id).title.split(/[:(]/)[0].trim())} O/X</b> ${a.ox.map(o => `${o.n} <b>${o.a ? 'O' : 'X'}</b>${o.a ? '' : `(${esc(o.why)})`}`).join(' · ')}</p>`;
    else h += `<p><b>문제 ${a.qn}. ${NUM[a.q.a]}</b> ${esc(a.q.why[a.q.a].replace(/^⭕\s*|^❌\s*/, ''))}</p>`;
  }
  return h + '</div>'; }

const css = `@page{size:A4;margin:11mm 11mm 12mm}
body{font-family:'Noto Sans KR',sans-serif;font-size:9.4pt;line-height:1.45;color:#111;margin:0}
.wrap{max-width:188mm;margin:0 auto}
h1{font-size:19pt;margin:0 0 2mm;font-weight:900}
h2{font-size:12pt;margin:3mm 0 1.6mm;padding:1.4mm 3mm;background:#111;color:#fff;border-radius:2mm;break-after:avoid}h2 small{font-weight:400;font-size:8.2pt;opacity:.85}
table{border-collapse:collapse;width:100%;margin:1mm 0 1.6mm}td,th{border:1px solid #666;padding:.8mm 1.5mm;vertical-align:top;font-size:8.7pt;line-height:1.42}th{background:#eee;text-align:left}
.plan th{width:22mm;text-align:center}.tip{border:1.2px dashed #555;border-radius:2mm;padding:1.4mm 3mm;margin:1.5mm 0 3mm;font-size:8.8pt}
.sec{break-before:auto}
.theme{font-weight:700;font-size:9.6pt;margin:0 0 1.2mm;break-after:avoid}
.kt tr{break-inside:avoid}.kt th:first-child{text-align:center}.kt .ks{font-family:'Noto Serif KR',serif;font-size:8.6pt}
.dots{color:#999}.bx{border:1px solid #111;padding:0 .8mm}
.memo{background:repeating-linear-gradient(#fff 0 5.6mm,#d4d4d4 5.6mm 5.85mm)}
.duo{display:flex;gap:3mm;align-items:flex-start}.dl{flex:1.15;min-width:0}.dr{flex:1;min-width:0}
.cmp td,.cmp th{font-size:8.1pt;padding:.6mm 1.2mm}.cmp tr:first-child th{background:#111;color:#fff}
.kt .pt{font-size:7.9pt;color:#333;margin-top:.8mm;padding-top:.6mm;border-top:1px dotted #999}
.warn,.oxb{border:1.2px solid #111;border-radius:2mm;padding:1.2mm 2.4mm;margin:1mm 0;font-size:8.4pt;break-inside:avoid}
.warn{border:1.4px dashed #b91c1c;margin-top:1mm}.warn b.t{color:#b91c1c}.oxb small{color:#555;font-size:7.6pt}
ul{margin:.6mm 0 0;padding-left:4mm}li{margin:0 0 .5mm}
.ox{margin:.6mm 0 0;padding-left:0;list-style:none;columns:2;column-gap:5mm}.ox li{font-size:8.3pt;break-inside:avoid}.ox .n{font-weight:900;display:inline-block;min-width:5mm}.ox .b{white-space:pre;font-weight:700}
.pr{border-top:1.4px dashed #111;padding-top:1.4mm;margin-top:2mm;break-inside:avoid;font-size:9pt}.pr .n{font-weight:900}.tag{font-size:7.6pt;background:#111;color:#fff;border-radius:1mm;padding:0 1.2mm}
.opts{list-style:none;padding-left:2mm;margin:1mm 0 0}.opts li{font-size:8.6pt;margin:0 0 .4mm}
.bogi{border:1px solid #555;padding:1.6mm 2.4mm 1.2mm;margin:1.4mm 0;position:relative;white-space:pre-line;font-family:'Noto Serif KR',serif;font-size:8.5pt}.bogi>span{position:absolute;top:-2.4mm;left:45%;background:#fff;padding:0 1.5mm;font-family:'Noto Sans KR';font-weight:700;font-size:8pt;white-space:normal}
.qimg{display:block;max-width:112mm;max-height:64mm;margin:1mm 0;border:1px solid #ccc}.fig{display:block;max-width:70mm;margin:1mm auto}
.ans{break-before:page;columns:2;column-gap:5mm}.ans h2{column-span:all;margin-top:0}.ans p{margin:0 0 1.4mm;font-size:8.2pt;line-height:1.42;break-inside:avoid}
@media screen{body{background:#e9e4d8}.wrap{background:#fff;padding:10mm 12mm;margin:6mm auto;box-shadow:0 2px 10px #0003}.btn{position:fixed;right:12px;top:12px;font:700 14px sans-serif;padding:6px 12px;border:1.5px solid #111;border-radius:4px;background:#5affd0;cursor:pointer}}
@media print{.btn{display:none}.wrap{padding:0}}`;

const body = `<h1>국어 1시간 — 기말 범위 지문 다시 보기</h1>${plan}${ORDER.map(([id, m]) => section(id, m)).join('')}${answers()}
<div class="tip" style="margin-top:4mm">더 하고 싶으면: 앱 <b>국어</b> → 지문마다 원문(필기·🔊 듣기) · 분석 · 애니 · O/X 전부 · 빈칸 · 문제 전부 / 첫 화면 🔥 전 범위 O/X 섞어 풀기. 참고 지문(혈압, 프린트 4쪽)은 범위 밖이라 프린트에서 뺐어요.</div>`;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>국어 1시간 자습 프린트</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Noto+Serif+KR:wght@400;700&display=swap"><style>${css}</style></head>
<body><button class="btn" onclick="print()">인쇄하기</button><div class="wrap">${body}</div></body></html>`;
fs.writeFileSync(path.join(ROOT, 'korean_print.html'), html);
console.log('korean_print.html', (html.length / 1024).toFixed(0) + 'KB, 문제', qn, 'O/X', oxn);

if (process.argv.includes('--pdf')) (async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto('file://' + path.join(ROOT, 'korean_print.html'), { waitUntil: 'networkidle' }); await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: path.join(ROOT, 'print', 'korean-1hour.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('print/korean-1hour.pdf');
})();
