/* 국어 지문 평문 내보내기 → tools/ko_voice.py 입력: node tools/ko_paras.js > /tmp/paras.json */
const fs = require('fs'), path = require('path'); global.window = {};
const R = f => fs.readFileSync(path.join(__dirname, '..', 'js', 'ko', f), 'utf8');
eval(R('core.js')); global.KO = window.KO;
for (const f of ['d_law.js', 'd_bio.js', 'd_tech.js', 'd_soc.js', 'd_text.js']) eval(R(f));
const out = {}; KO.P.forEach(p => { out[p.id] = { title: p.title, paras: p.paras.map(x => KO.plain(x).replace(/\s+/g, ' ').trim()) }; });
process.stdout.write(JSON.stringify(out, null, 1));
