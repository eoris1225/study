#!/usr/bin/env node
/* 일본 문화 스토리 대본 ↔ 게임 데이터 변환
   node tools/jp_script.js export   → docs/jp/대본.txt  (지금 게임의 대본을 사람이 고치기 쉬운 글로)
   node tools/jp_script.js build    → js/jp/story.js    (고친 대본.txt를 게임에 넣기) */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), TXT = path.join(ROOT, 'docs/jp/대본.txt'), JS = path.join(ROOT, 'js/jp/story.js');
const WHO = { n: '나', o: '유나', s: '스즈', m: '엄마', d: '아빠', h: '하나', k: '미야코', t: '선생님', r: '반친구', f: '선배아빠', u: '하루토' };
const OHW = Object.fromEntries(Object.entries(WHO).map(([k, v]) => [v, k]));
const CHAR = { o: '유나', s: '스즈' }, RCHAR = { 유나: 'o', 스즈: 's' };

function exportTxt() {
  global.window = {}; delete require.cache[JS]; require(JS); const ST = window.JPSTORY; const out = [];
  out.push('# 대본 형식 설명은 docs/jp/대본_쓰는법.md 참고. 이 파일을 고친 뒤  node tools/jp_script.js build  하면 게임에 들어가요.', '');
  for (const E of ST) { out.push(`=== ${E.t} | ${E.d || ''}`, '');
    for (const L of E.lines) {
      if (Array.isArray(L)) { const [w, f, m, t, tr] = L; const fm = f || m ? ` [${f || ''}/${m || ''}]` : ''; out.push(`${WHO[w] || w}${fm}: ${t}`); if (tr) out.push(`   (${tr})`); continue; }
      for (const [k, v] of Object.entries(L)) {
        if (k === 'bg') out.push(`@배경 ${v}${L.night ? ' 밤' : ''}${L.rain ? ' 장마' : ''}`);
        else if (k === 'night' || k === 'rain' || k === 'sub' || k === 'once') continue;
        else if (k === 'title') out.push(`@제목 ${v}${L.sub ? ' / ' + L.sub : ''}`);
        else if (k === 'place') out.push(`@장소 ${v.replace(/^📍\s*/, '')}`);
        else if (k === 'shot') out.push(`@카메라 ${v}`);
        else if (k === 'fx') out.push(`@효과 ${v || '없음'}`);
        else if (k === 'shake') out.push(`@흔들림 ${v}`);
        else if (k === 'sfx') out.push(`@소리 ${v}`);
        else if (k === 'wait') out.push(`@대기 ${v}`);
        else if (k === 'quiz') out.push(`@문제 ${v}`);
        else if (k === 'light') out.push(`@조명 ${v}`);
        else if (k === 'breath') out.push(`@호흡 ${v}`);
        else if (k === 'tspeed') out.push(`@텍스트속도 ${v}`);
        else if (k === 'tremble') out.push(`@글자떨림 ${v}`);
        else if (k === 'note') out.push(`@수첩 ${v}`);
        else if (k === 'flash') out.push(`@플래시 ${v}`);
        else if (k === 'view') out.push(`@시점 ${v}`);
        else if (k === 'noise') out.push(`@노이즈 ${v}`);
        else if (k === 'pos') for (const [c, p] of Object.entries(v)) out.push(`@위치 ${CHAR[c]} ${p.join(' ')}`);
        else if (k === 'walk') for (const [c, p] of Object.entries(v)) out.push(`@걷기 ${CHAR[c]} ${p.join(' ')}`);
        else if (k === 'mot') for (const [c, m] of Object.entries(v)) out.push(`@동작 ${CHAR[c]} ${m}`);
        else if (k === 'face') for (const [c, f] of Object.entries(v)) out.push(`@표정 ${CHAR[c]} ${f}`);
        else if (k === 'prop') for (const [c, n, on] of v) out.push(`@소품 ${CHAR[c]} ${n}${on === false ? ' 끔' : ''}`);
        else if (k === 'ask') { const [q, opts, a, why, ok, no] = v; out.push(`@선택 ${q}`); opts.forEach((o, i) => out.push(`  ${i === a ? '*' : '-'} ${o}`)); out.push(`  해설: ${why}`); if (ok) out.push(`  맞으면: ${ok}`); if (no) out.push(`  틀리면: ${no}`); }
        else if (k === 'pick') { const [q, opts, learn] = v; out.push(`@마음선택 ${q}`); opts.forEach(o => out.push(`  - ${o[0]} | ${o[1]}/${o[2]}${o[4] ? '/' + o[4] : ''} | ${o[3]}`)); if (learn) out.push(`  배움: ${learn}`); }
        else out.push(`@?? ${k} ${JSON.stringify(v)}`); } }
    out.push(''); }
  fs.mkdirSync(path.dirname(TXT), { recursive: true }); fs.writeFileSync(TXT, out.join('\n')); console.log('→', TXT, out.length, '줄');
}

function build() {
  const lines = fs.readFileSync(TXT, 'utf8').split('\n'); const ST = []; let E = null, cur = null; const errs = [];
  const C = (n, ln) => { const c = RCHAR[n]; if (!c) errs.push(`${ln}줄: 캐릭터 이름은 유나/스즈만 (${n})`); return c; };
  lines.forEach((raw, i) => { const ln = i + 1, l = raw.replace(/\s+$/, ''); if (!l.trim() || l.startsWith('#')) return;
    if (l.startsWith('=== ')) { const [t, d] = l.slice(4).split('|').map(x => x.trim()); E = { t, d, lines: [] }; ST.push(E); cur = null; return; }
    if (!E) { errs.push(`${ln}줄: 첫 에피소드 줄(=== 제목 | 설명)이 먼저 와야 해요`); return; }
    if (/^\s+\(/.test(l) && !cur) { const last = E.lines[E.lines.length - 1]; if (Array.isArray(last)) { last[4] = l.trim().replace(/^\(|\)$/g, ''); return; } errs.push(`${ln}줄: (번역) 줄은 대사 바로 아래에만`); return; }
    if (/^\s+/.test(l) && cur) { const t = l.trim();
      if (cur.ask) { const A = cur.ask; if (/^[*-] /.test(t)) { if (t[0] === '*') A[2] = A[1].length; A[1].push(t.slice(2)); } else if (t.startsWith('해설:')) A[3] = t.slice(3).trim(); else if (t.startsWith('맞으면:')) A[4] = t.slice(4).trim(); else if (t.startsWith('틀리면:')) A[5] = t.slice(4).trim(); else errs.push(`${ln}줄: @선택 아래는 * 정답 / - 보기 / 해설: / 맞으면: / 틀리면:`); return; }
      if (cur.pick) { const P = cur.pick; if (t.startsWith('- ')) { const [o, fm, line] = t.slice(2).split('|').map(x => x.trim()); const [f, m, by] = (fm || '').split('/'); const r = [o, f || 'smile', m || 'idle', line || '']; if (by) r.push(by); P[1].push(r); } else if (t.startsWith('배움:')) P[2] = t.slice(3).trim(); else errs.push(`${ln}줄: @마음선택 아래는 - 보기 | 표정/동작 | 스즈 대사 / 배움:`); return; }
      errs.push(`${ln}줄: 들여쓰기 줄은 @선택·@마음선택 아래에만`); return; }
    cur = null;
    if (l.startsWith('@')) { const sp = l.indexOf(' '), cmd = sp < 0 ? l.slice(1) : l.slice(1, sp), arg = sp < 0 ? '' : l.slice(sp + 1).trim(), a = arg.split(/\s+/); let D = {}; const argC = arg.replace(/\s*\([^)]*\)\s*$/, '');
      if (cmd === '배경') { D.bg = a[0]; if (a.includes('밤')) D.night = true; if (a.includes('장마') || a.includes('비')) D.rain = true; }
      else if (cmd === '제목') { const [t, s] = arg.split(' / '); D.title = t; if (s) D.sub = s; }
      else if (cmd === '장소') D.place = arg;
      else if (cmd === '카메라') D.shot = argC;
      else if (cmd === '효과') D.fx = argC === '없음' ? null : argC;
      else if (cmd === '흔들림') D.shake = +arg;
      else if (cmd === '소리') D.sfx = argC;
      else if (cmd === '대기') D.wait = +arg;
      else if (cmd === '문제') D.quiz = argC;
      else if (cmd === '조명') D.light = argC;
      else if (cmd === '호흡') D.breath = +argC;
      else if (cmd === '텍스트속도') D.tspeed = argC;
      else if (cmd === '글자떨림') D.tremble = argC;
      else if (cmd === '수첩') D.note = argC;
      else if (cmd === '플래시') D.flash = argC || '흰색 빠름';
      else if (cmd === '시점') D.view = argC;
      else if (cmd === '노이즈') D.noise = argC;
      else if (cmd === '위치') D.pos = { [C(a[0], ln)]: a.slice(1).map(Number) };
      else if (cmd === '걷기') D.walk = { [C(a[0], ln)]: a.slice(1).map(Number) };
      else if (cmd === '동작') D.mot = { [C(a[0], ln)]: a[1] };
      else if (cmd === '표정') D.face = { [C(a[0], ln)]: a[1] };
      else if (cmd === '소품') D.prop = [[C(a[0], ln), a[1], a[2] !== '끔']];
      else if (cmd === '선택') { D.ask = [arg, [], 0, '']; cur = D; }
      else if (cmd === '마음선택') { D.pick = [arg, [], '']; cur = D; }
      else { errs.push(`${ln}줄: 모르는 명령 @${cmd}`); return; }
      E.lines.push(D); return; }
    const m = l.match(/^([^\s:[]+)\s*(?:\[([^\]]*)\])?\s*:\s*(.*)$/);
    if (!m || !OHW[m[1]]) { errs.push(`${ln}줄: "이름: 대사" 형식이 아니에요 → ${l.slice(0, 30)}`); return; }
    const w = OHW[m[1]]; const [f, mo] = (m[2] || '').split('/'); E.lines.push([w, f || null, mo || null, m[3]]); });
  if (errs.length) { console.error('고칠 곳:\n' + errs.join('\n')); process.exit(1); }
  const js = `'use strict';\n/* 이 파일은 docs/jp/대본.txt 에서 자동으로 만들어져요 (node tools/jp_script.js build). 대본을 고치려면 대본.txt를 고치세요. */\nwindow.JPSTORY = ${JSON.stringify(ST, null, 1)};\n`;
  fs.writeFileSync(JS, js); console.log('→', JS, ST.length, '에피소드', ST.reduce((a, e) => a + e.lines.length, 0), '줄');
}
/* 게임에 나오는 일본어 문구를 전부 모음 → tools/jp_yomi.py 가 읽기(후리가나)·발음을 만듦 */
function texts() { global.window = {}; for (const f of ['js/jp/words.js', 'js/jp/ja.js', 'js/jp/story.js', 'js/jp/quiz.js', 'js/jp/notebook.js']) { delete require.cache[path.join(ROOT, f)]; require(path.join(ROOT, f)); }
  const S = new Set(), walk = v => { if (typeof v === 'string') window.JA.japaneseOf(v).forEach(x => S.add(x)); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(window.JPSTORY); walk(window.JPQUIZ); (window.JPWORDS || []).forEach(w => w[0].split('・').forEach(x => S.add(x.trim()))); (window.NOTEBOOK.allTerms ? window.NOTEBOOK.allTerms() : []).forEach(x => S.add(x));
  fs.writeFileSync(path.join(ROOT, 'tools/.jp_texts.json'), JSON.stringify([...S])); console.log('→ tools/.jp_texts.json', S.size, '개'); }
/* 음성 녹음 계획: 대사마다 누가, 어떤 감정·속삭임·뜸으로 말하는지 → tools/jp_voice.py 가 VOICEVOX로 녹음 */
function voiceplan() { global.window = {}; for (const f of ['js/jp/words.js', 'js/jp/ja.js', 'js/jp/story.js', 'js/jp/quiz.js', 'js/jp/notebook.js']) { delete require.cache[path.join(ROOT, f)]; require(path.join(ROOT, f)); }
  const JA = window.JA, plan = new Map(), add = (who, text, ctx) => JA.japaneseOf(text).forEach(seg => { const k = `${who}|${seg}`; if (!plan.has(k) || (ctx.spoken && !plan.get(k).spoken)) plan.set(k, Object.assign({ key: k, who, text: seg }, ctx)); });
  const spoken = t => /「/.test(t) && !/[가-힣]/.test(t.replace(/「[^」]*」/g, '').replace(/[(（][^)）]*[)）]/g, ''));   // 일본어로 말한 대사 (자동 재생·감정)
  const WHISPER = /(속삭|귓가|귓속|소곤|나지막|목소리를 낮|작게 중얼|아주 작게|입술을 가져다|숨결로|귀 가까이|잠긴 목소리)/;
  const SPK = { 하루토: 'u', 나: 'n', 유나: 'o', 스즈: 's', 엄마: 'm', 아빠: 'd', 하나: 'h', 미야코: 'k', 선생님: 't', 반친구: 'r', 선배아빠: 'f' };
  const split = (line, defFace) => { const m = line.match(/^(하루토|선배아빠|선생님|반친구|미야코|유나|스즈|엄마|아빠|하나|나)\s*(?:\[([^\]]*)\])?\s*:\s*/); if (!m) return ['s', defFace, line]; const [f] = (m[2] || '').split('/'); return [SPK[m[1]], f || defFace, line.slice(m[0].length)]; };
  for (const E of window.JPSTORY) { let breath = 0, slow = 0, tremble = 0; const hist = [];
    for (const L of E.lines) {
      if (!Array.isArray(L)) { if (L.breath) breath = L.breath; if (L.tspeed) slow = L.tspeed === '느림' ? 1 : L.tspeed === '빠름' ? -1 : 0; if (L.tremble) tremble = 1;
        const ctx = { whisper: hist.slice(-2).some(h => WHISPER.test(h)), slow, breath: 0, tremble: 0 };
        if (L.ask) { const [, , , , ok, no] = L.ask; for (const x of [ok, no]) if (x) { const [w, f, tx] = split(x, 'happy'); add(w, tx, Object.assign({}, ctx, { face: f, spoken: spoken(tx) })); } }
        if (L.pick) L.pick[1].forEach(o => { const [w, f, tx] = split(o[3], o[1]); add(w, tx, Object.assign({}, ctx, { face: f, spoken: spoken(tx) })); });
        continue; }
      const [who, face, mot, text, tr] = L;
      if (who !== 'n') add(who, text, { spoken: spoken(text), face, mot, whisper: hist.slice(-2).some(h => WHISPER.test(h)) || /^\((속삭|작게|귓속|속닥)/.test(text) || /^\((속삭|작게|속닥)/.test(tr || ''), slow, breath, tremble, label: (text.match(/^\(([^)]*)\)/) || [])[1] || '' });
      hist.push(text + ' ' + (tr || '')); breath = 0; tremble = 0; } }
  const gen = new Set(); const walk = v => { if (typeof v === 'string') JA.japaneseOf(v).forEach(x => gen.add(x)); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(window.JPSTORY); walk(window.JPQUIZ); (window.JPWORDS || []).forEach(w => w[0].split('・').forEach(x => gen.add(x.trim()))); (window.NOTEBOOK.allTerms ? window.NOTEBOOK.allTerms() : []).forEach(x => gen.add(x));
  gen.forEach(seg => { const k = `w|${seg}`; if (!plan.has(k)) plan.set(k, { key: k, who: 'w', text: seg }); });
  fs.writeFileSync(path.join(ROOT, 'tools/.jp_voice_plan.json'), JSON.stringify([...plan.values()])); console.log('→ tools/.jp_voice_plan.json', plan.size, '개'); }
const CMD = { export: exportTxt, build, texts, voiceplan };
CMD[process.argv[2]] ? CMD[process.argv[2]]() : console.log('사용법: node tools/jp_script.js export | build | texts');
