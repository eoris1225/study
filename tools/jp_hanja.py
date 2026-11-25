#!/usr/bin/env python3
"""일본어 한자 → 한국 한자음 표 (외우기 도우미). js/jp/*.js 에 나오는 한자를 모아 js/jp/hanja.js 로.
   필요: pip install hanja   실행: python3 tools/jp_hanja.py"""
import glob, json, os, re
import hanja
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FIX = {'円': '원', '々': '(반복)', '込': '입', '畑': '전', '峠': '상', '働': '동', '匁': '문'}   # 일본 글자·일본식 한자
chars = set()
for f in glob.glob(os.path.join(ROOT, 'js/jp/*.js')):
    if f.endswith(('hanja.js', 'voice.js')): continue
    chars |= set(re.findall(r'[一-龯々]', open(f, encoding='utf8').read()))
out = {}
for c in sorted(chars):
    if c in FIX: out[c] = FIX[c]; continue
    r = hanja.translate('一' + c, 'substitution')[1:]          # 낱글자 원래 음 (두음법칙 안 쓰게 앞에 한 글자 붙임)
    if re.fullmatch(r'[가-힣]', r): out[c] = r
with open(os.path.join(ROOT, 'js/jp/hanja.js'), 'w', encoding='utf8') as fo:
    fo.write("'use strict';\n/* 자동 생성 (tools/jp_hanja.py). 한자 → 한국 한자음: 아는 한국어 단어로 일본 한자 외우기 */\n")
    fo.write('window.JPHANJA = '); json.dump(out, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
print('→ js/jp/hanja.js', len(out), '/', len(chars), '자', '빠짐:', ''.join(sorted(chars - set(out))))
