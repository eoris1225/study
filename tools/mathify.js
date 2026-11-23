/* 텍스트 수식 → 진짜 분수 · 루트 (HTML/CSS). 태그 · SVG · style 안은 건드리지 않음.
   (A)/(B), a/b → 위아래 분수 / √(X), √{X}, √2 → 루트 */
const WORD = /[A-Za-z0-9가-힣.₀-₉⁰-⁹²³¹ⁿ⁻'|Δαθπ∞°]/;
function atoms(s) { const out = []; let i = 0;
  const grp = (o, c) => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === o) d++; else if (s[j] === c && --d === 0) return j; } return -1; };
  const one = () => { const ch = s[i];
    if (ch === '(' || ch === '{') { const e = grp(ch, ch === '(' ? ')' : '}'); if (e > 0) { const a = { t: 'g', o: ch, inner: s.slice(i + 1, e) }; i = e + 1; return a; } }
    if (ch === '√') { i++; while (s[i] === ' ') i++; const a = i < s.length ? one() : { t: 'w', v: '' }; return { t: 'r', a }; }
    if (WORD.test(ch)) { let j = i; while (j < s.length && WORD.test(s[j])) j++; const a = { t: 'w', v: s.slice(i, j) }; i = j; return a; }
    i++; return { t: 'o', v: ch }; };
  while (i < s.length) out.push(one()); return out; }
function render(s) { const A = atoms(s);
  for (let k = 1; k < A.length - 1; k++) if (A[k].t === 'o' && A[k].v === '/' && A[k - 1].t !== 'o' && A[k + 1].t !== 'o') { A.splice(k - 1, 3, { t: 'f', n: A[k - 1], d: A[k + 1] }); k--; }
  return A.map(at).join(''); }
const bare = a => a.t === 'g' ? render(a.inner) : at(a);
function at(a) { if (a.t === 'w' || a.t === 'o') return a.v; if (a.t === 'g') return (a.o === '{' ? '(' : '(') + render(a.inner) + ')';
  if (a.t === 'r') return `<span class="rad">√<span class="rc">${bare(a.a)}</span></span>`;
  if (a.t === 'f') return `<span class="fr"><span>${bare(a.n)}</span><span>${bare(a.d)}</span></span>`; return ''; }
module.exports = html => html.split(/(<svg[\s\S]*?<\/svg>|<style[\s\S]*?<\/style>|<title>[\s\S]*?<\/title>|<[^>]+>)/).map((p, i) => i % 2 ? p : (/[√/]/.test(p) ? render(p) : p)).join('');
module.exports.css = `.fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 .12em;font-size:.95em;line-height:1.15}.fr>span:first-child{border-bottom:1px solid currentColor;padding:0 .15em}.fr>span:last-child{padding:0 .15em}
.rad{white-space:nowrap}.rad .rc{border-top:1px solid currentColor;padding:.05em .1em 0;margin-left:-.02em}`;
