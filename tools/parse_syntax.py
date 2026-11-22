# spaCy로 모든 문장을 분석해 조각별 역할(main/rel/part/prep/sub/inf/ncl/co/appos)과
# 단어별 성분(S/V/O)을 만들어 js/en/sx_data.js로 저장
import json, sys, spacy
nlp = spacy.load('en_core_web_sm')
src, dst = sys.argv[1], sys.argv[2]
data = json.load(open(src))
MODS = {'relcl', 'acl', 'prep', 'advcl', 'appos', 'agent', 'ccomp', 'csubj', 'xcomp', 'advmod', 'npadvmod', 'parataxis', 'mark', 'cc'}
SUBMARK = {'when', 'if', 'although', 'though', 'because', 'as', 'while', 'whereas', 'once', 'since', 'before', 'after', 'until', 'unless', 'whether', 'so'}

def np_core(tok):
    """명사구에서 꾸밈 절·구를 뺀 핵심 토큰들"""
    keep = []
    def walk(t):
        keep.append(t)
        for c in t.children:
            if c.dep_ in ('relcl', 'acl', 'prep', 'advcl', 'appos', 'punct', 'cc') and c.i != tok.i:
                continue
            if c.dep_ == 'conj':
                walk(c); continue
            walk(c)
    walk(tok)
    return keep

def clause_roles(verb, tags):
    """동사(절의 머리)를 받아 S, V, O를 표시"""
    tags[verb.i] = 'V'
    for c in verb.children:
        if c.dep_ in ('aux', 'auxpass', 'neg') or (c.dep_ == 'prt'):
            tags[c.i] = 'V'
    for c in verb.children:
        if c.dep_ in ('nsubj', 'nsubjpass', 'csubj', 'csubjpass'):
            for t in np_core(c): tags.setdefault(t.i, 'S')
        elif c.dep_ == 'expl':
            pass
        elif c.dep_ in ('dobj', 'attr', 'acomp', 'oprd', 'dative'):
            for t in np_core(c): tags.setdefault(t.i, 'O')
    if not any(c.dep_ in ('nsubj', 'nsubjpass', 'csubj', 'csubjpass') for c in verb.children):
        for c in verb.children:
            if c.dep_ == 'attr' and any(x.dep_ == 'expl' for x in verb.children):
                for t in np_core(c): tags[t.i] = 'S'

PREPS = {'in','on','at','of','for','by','with','from','about','during','despite','through','without','including','like','between','among','against','under','over','into','onto','toward','towards','across','within','beyond','upon','via','due','according','regardless','near','thanks','along','around','behind','beneath','to','as'}
def chunk_type(span_toks, root):
    toks = set(t.i for t in span_toks)
    if root.i in toks: return 'main'
    w = [t.lower_ for t in span_toks if t.is_alpha]
    f, f2 = (w + ['', ''])[0], (w + ['', ''])[1]
    # 주절 성분이 표시된 조각(등위절 등)은 주절로
    if f in ('and', 'but', 'or', 'so', 'yet') and any(t.dep_ in ('nsubj', 'nsubjpass') and t.head.dep_ in ('conj', 'ROOT') for t in span_toks): return 'co'
    if f == 'in' and f2 == 'order' or f == 'so' and f2 == 'as': return 'inf'
    if f == 'to' and len(span_toks) > 1 and any(t.pos_ in ('VERB', 'AUX') and t.i == span_toks[1].i or (t.pos_ == 'VERB' and t.i == span_toks[min(2, len(span_toks)-1)].i) for t in span_toks): return 'inf'
    if f in ('which', 'who', 'whom', 'whose') or (f == 'where' and span_toks[0].dep_ != 'advmod'): return 'rel'
    if f in SUBMARK and f not in ('as', 'so') or f == 'even' and f2 in ('if', 'though') or f == 'so' and f2 == 'that': return 'sub'
    if f in ('that', 'what', 'how', 'whether', 'why'):
        t0 = span_toks[0]
        if f == 'that' and t0.dep_ in ('nsubj', 'nsubjpass', 'dobj') and t0.head.dep_ == 'relcl': return 'rel'
        return 'ncl'
    if f in PREPS and span_toks[0].pos_ == 'ADP': return 'prep'
    top = [t for t in span_toks if t.head.i not in toks or t.head.i == t.i]
    if not top: return 'main'
    # 가장 위(루트에 가까운) 토큰
    def depth(t):
        d = 0
        while t.head.i != t.i: t = t.head; d += 1
        return d
    t = min(top, key=depth)
    first = span_toks[0].lower_
    dep = t.dep_
    if dep == 'conj' and t.head.i == root.i and t.pos_ in ('VERB', 'AUX'): return 'co'
    if dep == 'conj' and t.pos_ in ('VERB', 'AUX'): return 'co'
    if dep == 'relcl': return 'inf' if first == 'to' else 'rel'
    if dep == 'acl':
        if first == 'to' or any(x.lower_ == 'to' and x.dep_ == 'aux' for x in t.children): return 'inf'
        if first in ('that',) or t.tag_ in ('VBZ', 'VBP', 'VBD') and any(x.dep_ in ('nsubj', 'nsubjpass') for x in t.children): return 'rel'
        return 'part'
    if dep == 'advcl':
        if first in SUBMARK or any(x.dep_ == 'mark' for x in t.children if x.i in toks): return 'sub'
        if first == 'to' or first == 'in': return 'inf'
        return 'part'
    if dep in ('prep', 'agent', 'pcomp'):
        if first == 'to' and t.lower_ == 'to' and any(x.pos_ == 'VERB' for x in t.children): return 'inf'
        return 'prep'
    if dep == 'csubj' and t.lower_.endswith('ing'): return 'main'
    if dep in ('ccomp', 'csubj'): return 'ncl'
    if dep == 'xcomp': return 'inf' if first == 'to' else 'main'
    if dep == 'appos': return 'appos'
    if dep in ('pobj',): return 'prep'
    return 'main'

out = {}
for item in data:
    chunks = item['chunks']
    text = ' '.join(chunks)
    doc = nlp(text)
    # 조각 경계(문자 위치)
    bounds, pos = [], 0
    for c in chunks:
        bounds.append((pos, pos + len(c))); pos += len(c) + 1
    sents = list(doc.sents)
    tags = {}
    roots = []
    main_heads = set()
    for s in sents:
        r = s.root; roots.append(r)
        clause_roles(r, tags)
        for c in r.children:
            if c.dep_ == 'conj' and c.pos_ in ('VERB', 'AUX'):
                clause_roles(c, tags)
            if c.dep_ in ('ccomp', 'parataxis') and c.i < r.i and any(x.dep_ in ('nsubj', 'nsubjpass') for x in c.children) and not any(x.dep_ == 'mark' for x in c.children):
                clause_roles(c, tags); main_heads.add(c.i)
    res = []
    for (a, b) in bounds:
        toks = [t for t in doc if t.idx >= a and t.idx < b]
        if not toks: res.append(['main', []]); continue
        root = next((r for r in roots if r.sent.start <= toks[0].i < r.sent.end), roots[0])
        ct = 'main' if any(t.i in main_heads for t in toks) else chunk_type(toks, root)
        # 꾸밈 조각 안의 단어는 주절 성분 표시를 하지 않는다 (단, 등위절 co는 자체 S/V/O 유지)
        row = []
        for t in toks:
            tg = tags.get(t.i, '')
            if ct not in ('main', 'co'): tg = ''
            row.append([t.text, tg, 1 if t.whitespace_ else 0])
        res.append([ct, row])
    out[item['key']] = res
open(dst, 'w').write("'use strict';\n/* spaCy(en_core_web_sm) 의존 구문 분석으로 미리 계산한 문장 구조 */\nwindow.SXD = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n")
print(len(out))
