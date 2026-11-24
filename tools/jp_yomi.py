#!/usr/bin/env python3
"""일본어 읽기(후리가나)·발음 데이터 만들기.
   node tools/jp_script.js texts  →  python3 tools/jp_yomi.py  →  js/jp/yomi.js
   필요: pip install fugashi unidic-lite  (형태소 분석기 + 사전. 결과 파일만 게임에 들어감)"""
import json, os, re, fugashi
ROOT = os.path.join(os.path.dirname(__file__), '..')
KANJI = re.compile(r'[一-鿿々〆ヶ]')
KANA = re.compile(r'[぀-ヿ]')
hira = lambda s: ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)
tagger = fugashi.Tagger()

def annotate(surface, kana):
    """買っ/かっ → 買{か}っ, お中元/おちゅうげん → お中元{おちゅうげん} 식으로 한자 부분에만 읽기. ⟦밑글자⟧{읽기} 형식."""
    if not kana or not KANJI.search(surface):
        return surface
    r = hira(kana); s = surface; pre = suf = ''
    while s and r and KANA.search(s[-1]) and hira(s[-1]) == r[-1]:
        suf = s[-1] + suf; s = s[:-1]; r = r[:-1]
    while s and r and KANA.search(s[0]) and hira(s[0]) == r[0]:
        pre += s[0]; s = s[1:]; r = r[1:]
    return f'{pre}⟦{s}⟧{{{r}}}{suf}' if s and r else surface

def run(text):
    ann, pron, prev = [], [], None
    for w in tagger(text):
        f = w.feature
        kana = getattr(f, 'kana', None); pr = getattr(f, 'pron', None)
        ann.append(annotate(w.surface, kana))
        p = hira(pr) if pr and pr != '*' else (hira(kana) if kana and kana != '*' else w.surface)
        # 발음 줄 띄어쓰기: 조사·조동사·접미사·기호는 앞말에 붙이고, 나머지는 새 덩어리로
        attach = f.pos1 in ('助詞', '助動詞', '接尾辞', '補助記号') or (f.pos1 == '動詞' and f.pos2 == '非自立可能' and pron) or not pron or (prev is not None and (prev.feature.pos1 == '接頭辞' or prev.surface in '『「（(…'))
        pron.append(p if attach or pron[-1].endswith(' ') else ' ' + p); prev = w
    # 형태소 분석이 공백을 지우므로 원문 공백 위치를 되살림
    return [''.join(ann) if ' ' not in text and '　' not in text else text_with_spaces(text, ann), ''.join(pron)]

def text_with_spaces(text, ann):
    out, i = [], 0
    for a in ann:
        plain = re.sub(r'\{[^}]*\}|[⟦⟧]', '', a)
        while i < len(text) and text[i] in ' 　' and not plain.startswith(text[i]):
            out.append(text[i]); i += 1
        out.append(a); i += len(plain)
    out.append(text[i:])
    return ''.join(out)

texts = json.load(open(os.path.join(ROOT, 'tools/.jp_texts.json'), encoding='utf8'))
Y = {t: run(t) for t in texts if t.strip()}
with open(os.path.join(ROOT, 'js/jp/yomi.js'), 'w', encoding='utf8') as fo:
    fo.write("'use strict';\n/* 자동 생성 (tools/jp_yomi.py). 일본어 문구 → [읽기 표시(漢字{かな}), 발음(히라가나)] */\nwindow.JPYOMI = ")
    json.dump(Y, fo, ensure_ascii=False, separators=(',', ':'))
    fo.write(';\n')
print('→ js/jp/yomi.js', len(Y), '개')
