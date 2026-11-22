'use strict';
/* 문장 구조도: 끊어 읽기 조각마다 역할(주절·관계절·전치사구·부사절·to부정사·분사구)을 정하고,
   주절에서 주어(S)·동사(V)·목적어/보어(O/C)를 색으로 표시한다. 자동 분석이라 가끔 틀릴 수 있다. */
const Syntax = (() => {
  const W = s => new Set(s.split(' '));
  const SUB = W('when if although though because as while whereas once since before after until unless whether');
  const REL = W('who whom whose which where');
  const PREP = W('in on at of for by with from about during despite through without including like between among against under over into onto toward towards across within beyond upon via due according regardless near thanks along around behind beneath');
  const AUX = W('am is are was were be been being have has had do does did can could will would shall should may might must');
  const CO = W('and but or so yet');
  const ART = W('the a an this these those my your his her its our their');
  const ADV = W('not never also often always still even just only now then already sometimes usually probably indeed however therefore thus perhaps actually really very too largely simply mainly');
  const DET = W('the a an this that these those my your his her its our their some any every each no all many much more most few several');
  const SAYV = W('say says said think thinks thought know knows knew believe believes believed show shows showed shown mean means meant indicate indicates realize realized predict predicts note notes argue argues suggest suggests insist insisted find found reveal revealed reveals ensure ensures hope tell tells told teach taught explain explains demand demands require requires imagine conclude remark remarked recognize');
  const VB = W('accept add affect agree allow appear apply argue arise ask assume attempt avoid base become begin believe belong bring build buy call care carry cause change choose claim clear close come compare complete concern conclude confirm connect consider consist contain continue contribute control convert cost create cut deal decide decline define depend describe design destroy determine develop die differ discover display divide draw drive drop earn eat emphasize enable encourage end engage enhance enjoy ensure enter establish evolve examine exist expect experience explain express face fail fall feel fill find finish fit focus follow force forget form free gain get give go grow happen hear help hide highlight hold hope identify ignore illustrate imagine imply improve include increase indicate influence inform insist involve join judge keep know lack last lay lead learn leave lend let lie like link listen live look lose love make manage manipulate mark match matter mean measure meet mention mind miss move need note notice observe obtain occur offer open operate own pass pay perceive perform place plan play point prefer prepare present preserve prevent produce protect provide prove pull push put reach react read realize receive reduce reflect regard relate rely remain remember remove repeat replace report represent require respond rest result return reveal rise run save say see seek seem sell send serve set shape share show shrink sit solve speak spend spread stand start stay stem steal stop study suffer suggest supply support suppose surround survive take talk teach tell tend think throw touch transform travel treat trust try turn understand unite use value view wait walk want watch wear win wonder work worry write yield');
  const IRR = W('was were been became began brought built bought came chose cost cut dealt drew drove fell felt found forgot froze gave got went grew heard held hid kept knew laid led left lent lay lost made meant met paid put ran rose said saw sought sold sent set shook shone shrank sat spoke spent spread stood stole struck took taught told thought threw understood woke wore won wrote');
  const baseOf = l => VB.has(l) ? l : l.endsWith('ies') && VB.has(l.slice(0, -3) + 'y') ? l : l.endsWith('es') && VB.has(l.slice(0, -2)) ? l : l.endsWith('s') && VB.has(l.slice(0, -1)) ? l : l.endsWith('ied') && VB.has(l.slice(0, -3) + 'y') ? l : l.endsWith('ed') && (VB.has(l.slice(0, -2)) || VB.has(l.slice(0, -1)) || VB.has(l.slice(0, -3))) ? l : IRR.has(l) ? l : '';
  const lk = w => (typeof lookup === 'function' ? lookup(w) : null) || '';
  const sense = w => lk(w).replace(/^\([^)]*\)\s*/, '').split(/[/,(]/)[0].trim();
  const NOTLY = W('family supply apply reply ally italy july only early fly rely likely');
  const isAdv = l => ADV.has(l) || (/ly$/.test(l) && l.length > 4 && !NOTLY.has(l)) || W('first second third finally besides sometimes however instead indeed thus therefore furthermore alternatively moreover').has(l);
  function isVerb(w, prev) {
    const l = w.toLowerCase(); if (AUX.has(l)) return true; if (DET.has(l) || PREP.has(l) || SUB.has(l) || REL.has(l) || CO.has(l)) return false;
    if (prev && ART.has(prev)) return false;
    const s = sense(l); if (s && /[^ ]다$/.test(s)) return true; if (baseOf(l)) return true; if (!s) return /(ed)$/.test(l) && l.length > 4 && !/ness$|less$/.test(l) ? null : false; return false;
  }
  const plain = c => c.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/<[^>]+>/g, '').replace(/[①-⑤]/g, '').replace(/^\s*\([A-C]\)\s*|^→\s*/, '').trim();
  const words = c => c.match(/[A-Za-zÀ-ÿ'’\-]+|[^\sA-Za-zÀ-ÿ'’\-]+/g) || [];
  function chunkType(c, i, prevLast) {
    let ws = words(c).filter(x => /[A-Za-z]/.test(x)).map(x => x.toLowerCase()); if (ws.length > 1 && isAdv(ws[0]) && /(ing|ed)$/.test(ws[1])) ws = ws.slice(1); const f = ws[0] || '', f2 = ws[1] || '';
    if (f === 'to' && ws[2] && isAdv(f2) && isVerb(ws[2]) === true) return 'inf';
    if (f === 'in' && f2 === 'order' || (f === 'to' && ws[1] && (isVerb(ws[1]) === true && !AUX.has(ws[1]) || ws[1] === 'be' || ws[1] === 'have'))) return 'inf';
    if (f === 'so' && f2 === 'that' || f === 'even' && (f2 === 'if' || f2 === 'though')) return 'sub';
    if (SUB.has(f) && i > 0 || SUB.has(f) && f !== 'as' && f !== 'since' || (f === 'as' && i === 0)) return 'sub';
    if (REL.has(f)) return i ? 'rel' : 'main';
    if (f === 'that' && i > 0) return prevLast && (SAYV.has(prevLast) || isVerb(prevLast) === true) ? 'ncl' : 'rel';
    if (f === 'what' && i > 0) return 'ncl';
    if (PREP.has(f) && !(f === 'to')) return 'prep';
    if (f === 'to') return 'prep';
    if (i > 0 && !AUX.has(f) && (/ing$/.test(f) && f.length > 4 && f !== 'thing' || /ed$/.test(f) && f.length > 4 && (!f2 || PREP.has(f2) || f2 === 'to' || isAdv(f2)))) return 'part';
    if (CO.has(f) && i > 0) return 'co';
    return 'main';
  }
  const LBL = { main: '', co: '', sub: '부사절', rel: '관계절 ↩', ncl: '명사절', prep: '전치사구', inf: 'to부정사', part: '분사구 ↩' };
  const TIP = { sub: '때·조건·이유·양보 등을 덧붙이는 절', rel: '바로 앞 명사를 꾸며요', ncl: '“~라는 것” 덩어리로 목적어/주어 역할', prep: '장소·방법·대상 등을 덧붙여요', inf: '~하기 위해 / ~할 / ~하는 것', part: '앞 명사를 꾸미거나 “~하면서”' };
  /* 한 문장 분석 */
  function analyze(en) {
    const chunks = en.split(' / ').map(plain); let prevLast = ''; let gotV = false;
    const out = chunks.map((c, i) => { const t = chunkType(c, i, prevLast); const ws = words(c); const lw = ws.filter(x => /[A-Za-z]/.test(x)); prevLast = (lw[lw.length - 1] || '').toLowerCase(); return { c, t, ws, tags: [] }; });
    const hasV = ch => { let pv = ''; return ch.ws.some(w => { const l = w.toLowerCase(); const v = /[A-Za-z]/.test(w) && isVerb(w, pv) === true && !(pv === 'to'); pv = l; return v; }); };
    let pend = false; for (const ch of out) { if (ch.t === 'main' || ch.t === 'co') { if (hasV(ch)) break; const lw = ch.ws.filter(w => /[A-Za-z]/.test(w)); if (lw.length && !lw.every(w => isAdv(w.toLowerCase()))) pend = true; } else if (ch.t === 'part' && pend && /ed$/.test((ch.ws.find(w => /[A-Za-z]/.test(w) && !isAdv(w.toLowerCase())) || '').toLowerCase())) { ch.t = 'main'; break; } }
    /* 주절 조각에서 S V O 찾기 */
    for (let k = 0; k < out.length; k++) { const ch = out[k]; if (!(ch.t === 'main' || ch.t === 'co')) continue;
      let vi = -1; const ws = ch.ws; let prev = '', inRel = false; for (let j = 0; j < ws.length; j++) { const w = ws[j]; if (!/[A-Za-z]/.test(w)) continue; const l = w.toLowerCase(); if (j > 0 && /^(that|which|who)$/.test(l) && !AUX.has(prev)) { inRel = true; prev = l; continue; } if (j === 0 && (CO.has(l) || l === 'there' || /ly$/.test(l) && !AUX.has(l))) { prev = l; continue; } const v = isVerb(w, prev); if (v === true && inRel) { inRel = false; prev = l; continue; } if (v === true && !(prev === 'the' || prev === 'a' || prev === 'to' || prev === 'of' || prev === 'for' || isAdv(l))) { vi = j; break; } prev = l; }
      if (vi < 0) { const lw = ws.filter(w => /[A-Za-z]/.test(w)); const allAdv = lw.every(w => isAdv(w.toLowerCase())) || /^(what is more|in fact|for example|for instance|as a result)$/i.test(lw.join(' '));
        const nx = out[k + 1]; const nextIsV = nx && (nx.t === 'main') && nx.ws[0] && isVerb(nx.ws[0]) === true;
        if (!allAdv && !gotV && nextIsV) ch.tags = ws.map(w => /[A-Za-z]/.test(w) && !isAdv(w.toLowerCase()) ? 'S' : '');
        else if (!allAdv && gotV && k > 0 && out[k - 1].tags.some(x => x === 'V' || x === 'O') && ch.t === 'main') ch.tags = ws.map(w => /[A-Za-z]/.test(w) ? 'O' : '');
        continue; }
      let ve = vi; while (ve + 1 < ws.length && (AUX.has(ws[ve].toLowerCase()) || ADV.has(ws[ve + 1].toLowerCase()) || /^(not|n't)$/i.test(ws[ve + 1])) && (isVerb(ws[ve + 1]) === true || ADV.has(ws[ve + 1].toLowerCase()) || ws[ve + 1].toLowerCase() === 'not' || /(ed|en|ing)$/.test(ws[ve + 1]))) ve++;
      if (ve + 1 < ws.length && AUX.has(ws[ve].toLowerCase()) === false && false) ve++;
      let stopO = false; ch.tags = ws.map((w, j) => { if (!/[A-Za-z]/.test(w)) return ''; const l = w.toLowerCase(); if (j < vi) return (j === 0 && CO.has(l)) || isAdv(l) || l === 'there' ? '' : 'S'; if (j <= ve) return isAdv(l) ? '' : 'V'; if (stopO || (PREP.has(l) && l !== 'of' && j > ve + 1)) { stopO = true; return ''; } return 'O'; });
      if (ch.t === 'main' && vi === 0 && k > 0 && gotV) { for (let q = k - 1; q >= 0; q--) { if (out[q].t !== 'main') break; out[q].tags = out[q].tags.map((x, j) => x === 'V' || x === 'O' ? 'S' : x); } }
      if (ch.t === 'main' && ws.slice(0, vi).filter(w => /[A-Za-z]/.test(w)).every(w => isAdv(w.toLowerCase())) && k > 0 && !gotV) { for (let q = k - 1; q >= 0; q--) { if (/^(prep|rel|part)$/.test(out[q].t)) continue; if (out[q].t !== 'main') break; const lw = out[q].ws.filter(w => /[A-Za-z]/.test(w)); if (lw.every(w => isAdv(w.toLowerCase()))) break; out[q].tags = out[q].ws.map(w => /[A-Za-z]/.test(w) && !isAdv(w.toLowerCase()) ? 'S' : ''); } }
      gotV = true; }
    return out;
  }
  /* 화면 */
  function render(s) {
    const kos = s[1].split(' | '); const A = analyze(s[0]);
    const html = A.map((ch, i) => { const toks = ch.ws.map((w, j) => { const tg = ch.tags[j]; return tg ? `<span class="t${tg}">${w}</span>` : w; }).join(' ').replace(/ ([,.;:?!”’)])/g, '$1').replace(/([“‘(]) /g, '$1');
      const lab = LBL[ch.t]; return `<div class="sx sx-${ch.t}"${TIP[ch.t] ? ` title="${TIP[ch.t]}"` : ''}>${lab ? `<span class="sxl">${lab}</span>` : ''}<div class="sxe">${toks}</div><div class="sxk">${kos[i] || ''}</div></div>`; }).join('<span class="sxa">›</span>');
    return `<div class="sxwrap">${html}</div><div class="sxleg"><span class="tS">주어 S</span><span class="tV">동사 V</span><span class="tO">목적어·보어 O/C</span><span class="lg rel">관계절·분사구 ↩ 앞 명사 꾸밈</span><span class="lg prep">전치사구</span><span class="lg sub">부사절</span><span class="lg inf">to부정사</span><span class="lg ncl">명사절</span></div><div class="dim sxnote">자동 분석이라 가끔 틀릴 수 있어요. 문법 메모가 우선이에요.</div>`;
  }
  return { analyze, render };
})();
