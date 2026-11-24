'use strict';
/* 일본어 → 한글 발음 + 대사 속 일본어 표시.
   대본 표기: 「일본어」, 「일본어|뜻」, 「漢字{かな}|뜻」  (한자는 {읽기}를 주거나 READ 사전에서 찾음) */
(() => {
const C = { '': 11, k: 15, g: 0, s: 9, z: 12, t: 16, d: 3, n: 2, h: 18, b: 7, p: 17, m: 6, r: 5, ch: 14, j: 12, sh: 9, f: 18, w: 11, y: 11, ts: 14 };
const V = { a: 0, i: 20, u: 13, e: 5, o: 8, ya: 2, yu: 17, yo: 12, wa: 9, eu: 18 };
const ROW = { '': 'あいうえお', k: 'かきくけこ', g: 'がぎぐげご', s: 'さしすせそ', z: 'ざじずぜぞ', t: 'たちつてと', d: 'だぢづでど', n: 'なにぬねの', h: 'はひふへほ', b: 'ばびぶべぼ', p: 'ぱぴぷぺぽ', m: 'まみむめも', r: 'らりるれろ' };
const K = {}; for (const [c, row] of Object.entries(ROW)) [...row].forEach((ch, i) => { K[ch] = [c, 'aiueo'[i]]; });
Object.assign(K, { し: ['sh', 'i'], ち: ['ch', 'i'], つ: ['ts', 'eu'], す: ['s', 'eu'], ず: ['z', 'eu'], づ: ['z', 'eu'], じ: ['j', 'i'], ぢ: ['j', 'i'], ふ: ['h', 'u'], や: ['y', 'ya'], ゆ: ['y', 'yu'], よ: ['y', 'yo'], わ: ['w', 'wa'], を: ['', 'o'] });
const SMALL = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' };
const syl = (c, v, f = 0) => String.fromCharCode(0xAC00 + (C[c] * 21 + V[v]) * 28 + f);
const toHira = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
function kana2hangul(src) {
  const s = toHira(src).replace(/んにちは/g, 'んにちわ').replace(/んばんは/g, 'んばんわ'); const out = []; // [c, v, final] 또는 문자열
  for (let i = 0; i < s.length; i++) { const ch = s[i], nx = s[i + 1];
    if (ch === 'ん') { out.push({ fin: 'n' }); continue; }
    if (ch === 'っ') { out.push({ fin: 't' }); continue; }
    if (ch === 'ー') { out.push('-'); continue; }
    if (K[ch]) { let [c, v] = K[ch];
      if (nx && SMALL[nx]) { v = SMALL[nx]; i++; }
      else if (nx && 'ぁぃぅぇぉ'.includes(nx)) { v = { ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o' }[nx]; if (c === 'h' && ch === 'ふ') c = 'f'; i++; }
      const pv = out.length && Array.isArray(out[out.length - 1]) ? out[out.length - 1][1] : null;
      if (c === '' && pv && (v === pv[pv.length - 1] || (v === 'u' && pv.endsWith('o')) || (v === 'i' && pv === 'e') || (v === 'u' && pv === 'yu'))) { out.push('-'); continue; }
      out.push([c, v]); continue; }
    out.push(ch === '、' ? ', ' : ch === '。' ? '. ' : ch); }
  let res = '';
  for (let i = 0; i < out.length; i++) { const x = out[i];
    if (Array.isArray(x)) { let f = 0; const nx = out[i + 1];
      if (nx && nx.fin) { const after = out[i + 2]; if (nx.fin === 't') f = 19; else f = after && Array.isArray(after) && ['m', 'b', 'p'].includes(after[0]) ? 16 : 4; i++; }
      res += syl(x[0], x[1], f); }
    else if (x && x.fin) res += x.fin === 'n' ? '응' : '';
    else res += x; }
  return res; }
/* 한자 읽기 */
const READ = { 山下: 'やました', 田中: 'たなか', 鈴: 'すず', 先生: 'せんせい', 失礼: 'しつれい', 明日: 'あした', 中元: 'ちゅうげん', 歳暮: 'せいぼ', 今年: 'ことし', 世話: 'せわ', 昨年: 'さくねん', 元気: 'げんき', 発表: 'はっぴょう', 質問: 'しつもん', 部活: 'ぶかつ', 帰宅部: 'きたくぶ', 文化祭: 'ぶんかさい', 甲子園: 'こうしえん', 鬼: 'おに', 外: 'そと', 福: 'ふく', 内: 'うち', 大晦日: 'おおみそか', 初詣: 'はつもうで', 年玉: 'としだま', 門松: 'かどまつ', 鏡餅: 'かがみもち', 料理: 'りょうり', 雑煮: 'ぞうに', 七草: 'ななくさ', 年越: 'としこし', 祭: 'まつり', 端午: 'たんご', 節句: 'せっく', 鯉: 'こい', 七五三: 'しちごさん', 千歳飴: 'ちとせあめ', 七夕: 'たなばた', 短冊: 'たんざく', 盆: 'ぼん', 節分: 'せつぶん', 成人: 'せいじん', 日: 'ひ', 大吉: 'だいきち', 中吉: 'ちゅうきち', 大凶: 'だいきょう', 女: 'おんな', 半: 'はん', 読手: 'どくしゅ', 全国大会: 'ぜんこくたいかい', 勝: 'か', 桃: 'もも', 卒業: 'そつぎょう', 誕生日: 'たんじょうび', 家族: 'かぞく', 一緒: 'いっしょ', 父: 'ちち', 母: 'はは', 大会: 'たいかい', 練習: 'れんしゅう', 頑張: 'がんば', 本当: 'ほんとう', 申: 'もう', 訳: 'わけ', 今日: 'きょう', 鬼は外: 'おにわそと', 福は内: 'ふくわうち' };
const KEYS = Object.keys(READ).sort((a, b) => b.length - a.length);
function reading(jp) { let s = jp; for (const k of KEYS) s = s.split(k).join(READ[k]); return s; }
function pron(jp, rd) { return kana2hangul(rd || reading(jp)).replace(/\s+/g, ' ').trim(); }
/* 대사 HTML 만들기: 일본어는 클릭 가능 + 아래에 한글 발음 */
const WORDMEAN = () => { const m = {}; (window.JPWORDS || []).forEach(w => w[0].split('・').forEach(k => m[k.replace(/[\s、。！？]/g, '')] = w[2])); return m; };
let WM = null;
function meaningOf(jp) { WM = WM || WORDMEAN(); const k = jp.replace(/[\s、。！？!?〜]/g, ''); if (WM[k]) return WM[k]; for (const [w, m] of Object.entries(WM)) if (w.length > 2 && k.includes(w)) return m + ' …'; return ''; }
function render(text) {
  return text.replace(/「([^」|{]+)(?:\{([^}]+)\})?(?:\|([^」]+))?」/g, (all, jp, rd, mean) => {
    if (!/[぀-ヿ一-鿿]/.test(jp)) return '「' + jp + (mean ? '' : '') + '」';
    const m = mean || meaningOf(jp); const p = pron(jp, rd);
    return `<span class="jp" data-jp="${jp}" data-p="${p}" data-m="${(m || '').replace(/"/g, '&quot;')}"><span class="jj">${jp}</span><span class="jk">${p}</span></span>`; }); }
function japaneseOf(text) { const L = []; text.replace(/「([^」|{]+)(?:\{[^}]+\})?(?:\|[^」]+)?」/g, (a, jp) => { if (/[぀-ヿ一-鿿]/.test(jp)) L.push(jp); }); return L; }
window.JA = { kana2hangul, pron, render, japaneseOf, meaningOf };
})();
