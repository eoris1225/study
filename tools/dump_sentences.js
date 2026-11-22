// 모든 지문의 문장을 끊어 읽기 조각(평문)으로 뽑아 JSON으로 저장
global.window = {};
const R = '/home/user/study/js/en/';
['data.js', 'ne4.js', 'ne5.js', 'mock25.js', 'mock26.js', 'money.js'].forEach(f => require(R + f));
const plain = c => c.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, '').replace(/[①-⑤]/g, '').replace(/^\s*\([A-C]\)\s*|^→\s*/, '').replace(/\s+/g, ' ').trim();
const out = [];
const lib = [Object.assign(window.EN, { id: 'same' })].concat(window.PASSAGES);
lib.forEach(ps => ps.paras.forEach(p => p.s.forEach((s, si) => out.push({ key: `${ps.id}|${p.id}|${si}`, chunks: s[0].split(' / ').map(plain) }))));
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.length);
