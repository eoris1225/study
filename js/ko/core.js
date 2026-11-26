/* 국어 독서: 지문 등록소 + 마크업 해석 */
window.KO = {
  P: [],
  add(p) { this.P.push(p); },
  get(id) { return this.P.find(p => p.id === id); },
  /* **핵심어**  ((핵심 문장))  [[논리 표지]]  {{원문 네모}}  __원문 밑줄__  [[FIG:경로]] */
  mark(s) {
    const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let h = esc(s);
    h = h.replace(/\[\[FIG:([^\]]+)\]\]/g, '<figure class="fig"><img src="$1" alt="그림" loading="lazy"><figcaption>&lt;그림&gt; <button class="tapme" data-zoom="$1">🔍 크게</button></figcaption></figure>');
    h = h.replace(/\(\(([\s\S]+?)\)\)/g, '<span class="ks">$1</span>');
    h = h.replace(/\*\*([\s\S]+?)\*\*/g, '<b class="kw">$1</b>');
    h = h.replace(/\[\[([^\]]+?)\]\]/g, '<span class="cj">$1</span>');
    h = h.replace(/\{\{([^}]+?)\}\}/g, '<span class="bx">$1</span>');
    h = h.replace(/__([\s\S]+?)__/g, '<u class="ul">$1</u>');
    return h;
  },
  plain(s) { return s.replace(/\[\[FIG:[^\]]+\]\]/g, '').replace(/\(\(|\)\)|\*\*|\[\[|\]\]|\{\{|\}\}|__/g, ''); }
};
