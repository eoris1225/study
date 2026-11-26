#!/usr/bin/env python3
"""국어 지문 낭독 녹음: Coqui XTTS-v2(다국어, 한국어 지원) → audio/ko/*.mp3 + js/ko/voice.js
   - 화자 배정(CAST/PLAN): 기본 내레이터, 관점이 갈리는 지문은 관점마다 다른 목소리, 직접 인용은 인용 화자
   - 숫자·단위·영문 약어를 한국어 읽기로 바꿈 (48시간 → 마흔여덟 시간, 80km → 팔십 킬로미터, D1 → 디 원 …)
   - 문장마다 녹음 → Whisper로 받아쓰기해 글자 오류율(CER) 검사, 높으면 다시 녹음(최대 3번, 가장 좋은 것)
   - 문단별 mp3 + 문장별 시작·끝 시간 → 화면에서 읽는 문장 형광 표시
   사용: node tools/ko_paras.js > paras.json && python3 tools/ko_voice.py paras.json [pid ...]
   XTTS-v2 모델 라이선스: Coqui Public Model License(비상업). 음성은 합성 음성."""
import hashlib, json, os, re, subprocess, sys, time, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'audio', 'ko')
CACHE = os.environ.get('KO_TTS_CACHE', '/tmp/ko_tts_cache')
SR = 24000

# ── 화자 ──
CAST = {   # 화자는 Whisper 받아쓰기로 한국어 발음 정확도(CER)를 재서 고름 (0~2%)
    'nar': dict(name='내레이터', spk='Ana Florence', speed=1.0),
    'alt': dict(name='두 번째 화자', spk='Sofia Hellen', speed=1.0),
    'man': dict(name='남성 화자', spk='Xavier Hayasaka', speed=1.0),
    'old': dict(name='인용 화자', spk='Baldur Sanjin', speed=0.96),
}
# 지문별 문단 화자 (없으면 전부 nar). 값: 문단 번호 → 화자, 문장 안 "…" 인용은 QUOTE[pid]
PLAN = {
    'honneth': {0: 'man', 1: 'man', 2: 'alt', 3: 'alt', 4: 'alt'},     # 호네트 = 남성, 버틀러 = 두 번째 내레이터
    'anthro': {3: 'man', 4: 'man', 5: 'alt', 6: 'alt', 7: 'alt'},       # 비관론(러브록) = 남성, 낙관론 = 두 번째 내레이터
}
QUOTE = {'anthro': 'old'}   # 맥닐의 직접 인용
LABEL = {('honneth', 'man'): '호네트', ('honneth', 'alt'): '버틀러', ('anthro', 'man'): '비관론', ('anthro', 'alt'): '낙관론', ('anthro', 'old'): '존 맥닐 (인용)'}

# ── 숫자 읽기 ──
D = '영일이삼사오육칠팔구'
def sino(n):
    n = int(n)
    if n == 0: return '영'
    out = ''
    for unit, word in ((10 ** 8, '억'), (10 ** 4, '만')):
        if n >= unit: out += ('' if (n // unit == 1 and word == '만') else sino4(n // unit)) + word; n %= unit
    return out + sino4(n)
def sino4(n):
    s = ''
    for v, w in ((1000, '천'), (100, '백'), (10, '십')):
        q = n // v
        if q: s += ('' if q == 1 else D[q]) + w
        n %= v
    return s + (D[n] if n else '')
NATIVE1 = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
NATIVE10 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']
def native(n):
    n = int(n)
    if n >= 100: return sino(n)
    t, o = divmod(n, 10)
    if n == 20: return '스무'
    return NATIVE10[t] + NATIVE1[o]
NATIVE_CTR = '시간|가지|개|명|살|마리|편|곳|번째'

ABBR = [(r'QRS', '큐알에스'), (r'RAAS', '라스'), (r'DAT', '디에이티'), (r'D1', '디원'), (r'D2', '디투'),
        (r'P파', '피파'), (r'T파', '티파'), (r'R파', '알파'), (r'Q파', '큐파'), (r'S파', '에스파'), (r'EOG', '이오지'), (r'CO₂', '이산화 탄소')]
def norm(s):
    s = re.sub(r'[｢｣『』「」‘’“”"\']', '', s)
    s = s.replace('…', ', ').replace('·', ', ').replace('ㆍ', ', ')
    s = re.sub(r'[㉠-㉿]\s*', '', s)
    s = re.sub(r'\s*[(（]\s*', ' ', s); s = re.sub(r'\s*[)）]', '', s)
    for a, b in ABBR: s = s.replace(a, b)
    s = s.replace('안지오텐신Ⅰ', '안지오텐신 일').replace('안지오텐신Ⅱ', '안지오텐신 이').replace('Ⅰ', '일').replace('Ⅱ', '이')
    s = re.sub(r'(\d+)⁴', lambda m: m.group(1) + '의 사제곱', s)
    s = re.sub(r'(\d+)\s*/\s*(\d+)', lambda m: f'{m.group(2)}분의 {m.group(1)}', s)
    s = re.sub(r'(\d+)분의\s*(\d+)', lambda m: f'{sino(m.group(1))}분의 {sino(m.group(2))}', s)
    s = re.sub(r'(\d[\d,]*)\s*~\s*(\d[\d,]*)', lambda m: f'{m.group(1)}에서 {m.group(2)}', s)
    s = re.sub(r'(\d[\d,]*)\s*km', lambda m: m.group(1) + ' 킬로미터', s)
    s = re.sub(r'(\d[\d,]*)\s*m(?![a-zA-Z])', lambda m: m.group(1) + ' 미터', s)
    s = s.replace('㎡', ' 제곱미터').replace('°', ' 도').replace('%', ' 퍼센트')
    s = re.sub(r'제(\d+)', lambda m: '제' + sino(m.group(1)) + ' ', s)
    s = re.sub(r'(\d[\d,]*)\s*(' + NATIVE_CTR + ')', lambda m: native(m.group(1).replace(',', '')) + ' ' + m.group(2), s)
    s = re.sub(r'(\d[\d,]*)\s*(년|월|일|원|인|차|층|분|초|세기|배|억)', lambda m: sino(m.group(1).replace(',', '')) + (' ' if m.group(2) not in ('억',) else '') + m.group(2), s)
    s = re.sub(r'\d[\d,]*', lambda m: sino(m.group(0).replace(',', '')), s)
    s = re.sub(r'[A-Za-z]+', lambda m: ' '.join(m.group(0)), s)
    s = re.sub(r'\s*,\s*(,\s*)+', ', ', s); s = re.sub(r'\s+', ' ', s).strip(' ,')
    return s

def sentences(p):
    """문단 → [(원문 문장, 인용 여부)] : 문장 끝(다./요./?/!) 기준, 큰따옴표 인용은 따로"""
    out = []
    for part in re.split(r'(“[^”]*”|"[^"]*")', p):
        if not part.strip(): continue
        q = part.startswith(('“', '"'))
        for s in re.split(r'(?<=[.?!])\s+', part.strip()):
            if s.strip() and not re.match(r'^[—–-]\s*《', s.strip()): out.append((s.strip(), q))   # 출처 표시(— 《책》에서)는 읽지 않음
    return out

# ── 합성 ──
_tts = None
def tts():
    global _tts
    if _tts is None:
        os.environ['COQUI_TOS_AGREED'] = '1'   # 사용자가 CPML(비상업)에 동의함
        import torch; torch.set_num_threads(int(os.environ.get('KO_THREADS', '4')))
        from TTS.api import TTS
        _tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2').to('cpu')
    return _tts
_asr = None
def asr(wav):
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
    x = np.interp(np.arange(0, len(wav), SR / 16000), np.arange(len(wav)), wav).astype(np.float32)   # 24k → 16k
    segs, _ = _asr.transcribe(x, language='ko', beam_size=1, vad_filter=False)
    return ''.join(s.text for s in segs)
def cer(ref, hyp):
    f = lambda x: re.sub(r'[^가-힣0-9a-zA-Z]', '', x)
    a, b = f(ref), f(hyp)
    if not a: return 0.0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i] + [0] * len(b)
        for j, cb in enumerate(b, 1): cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb))
        prev = cur
    return prev[-1] / len(a)
def trim(w, th=0.012):
    idx = np.where(np.abs(w) > th)[0]
    if not len(idx): return w
    a, b = max(0, idx[0] - int(.04 * SR)), min(len(w), idx[-1] + int(.08 * SR))
    return w[a:b]
def pieces(text, lim=88):
    """XTTS 한국어는 95자를 넘으면 끝이 잘릴 수 있음 → 쉼표, 그다음 연결 어미(-며/-고/-면/-서/-여/-써/-록/-지만/-므로/-는데) 뒤에서 나눔"""
    if len(text) <= lim: return [text]
    mid = len(text) // 2
    def best(rx):
        c = [m.end() for m in re.finditer(rx, text) if min(m.start(), len(text) - m.end()) >= max(15, len(text) * .25)]   # 짧은 조각은 XTTS가 웅얼거림을 만듦 → 고르게 나눔
        return min(c, key=lambda i: abs(i - mid)) if c else None
    cut = None
    for rx in (r', ', r'(?:며|고|면|서|여|써|록|지만|므로|는데|은데|니까)\s', r'\s'):
        c = best(rx)
        if c and max(c, len(text) - c) <= max(lim, len(text) * .75): cut = c; break
        if cut is None and c: cut = c
    return pieces(text[:cut].strip(' ,'), lim) + pieces(text[cut:].strip(' ,'), lim)
def synth(text, who):
    ps = pieces(text)
    if len(ps) == 1: return synth1(text, who)
    ws, worst, tries = [], 0.0, 0
    for k, p in enumerate(ps):
        w, info = synth1(p, who); worst = max(worst, info['cer']); tries += info['tries']
        if k: ws.append(np.zeros(int(SR * .14), dtype=np.float32))
        ws.append(w)
    return np.concatenate(ws), {'cer': worst, 'tries': tries}
def synth1(text, who):
    c = CAST[who]; key = hashlib.sha1(f"{c['spk']}|{c['speed']}|{text}".encode()).hexdigest()[:16]
    os.makedirs(CACHE, exist_ok=True); f = os.path.join(CACHE, key + '.npy'); jf = f + '.json'
    if os.path.exists(f): return np.load(f), json.load(open(jf))
    best = None
    for k in range(3):
        w = np.array(tts().tts(text=text, speaker=c['spk'], language='ko', speed=c['speed'], split_sentences=False, temperature=.65 if k == 0 else .5), dtype=np.float32)
        w = trim(w); e = cer(text, asr(w))
        if best is None or e < best[1]: best = (w, e)
        if e <= .12: break
    np.save(f, best[0]); json.dump({'cer': best[1], 'tries': k + 1}, open(jf, 'w'))
    return best[0], {'cer': best[1], 'tries': k + 1}

def mp3(w, path):
    pcm = (np.clip(w, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '40k', '-ar', '24000', path], input=pcm, check=True)

def build(pid, P, voice):
    os.makedirs(OUT, exist_ok=True); entry = {'paras': []}; log = []
    for i, para in enumerate(P['paras']):
        who0 = PLAN.get(pid, {}).get(i, 'nar'); segs = []; chunks = []; t = 0.0
        for j, (s, q) in enumerate(sentences(para)):
            who = QUOTE.get(pid, who0) if q else who0
            spoken = norm(s)
            if not re.search(r'[가-힣]', spoken): continue
            w, info = synth(spoken, who); log.append((pid, i, j, who, round(info['cer'], 3), info['tries'], s[:30]))
            gap = np.zeros(int(SR * (.18 if j else .05)), dtype=np.float32)
            chunks += [gap, w]; t += len(gap) / SR
            segs.append([round(t, 2), round(t + len(w) / SR, 2), s, who]); t += len(w) / SR
        chunks.append(np.zeros(int(SR * .35), dtype=np.float32))
        name = f'{pid}_{i + 1}.mp3'; mp3(np.concatenate(chunks), os.path.join(OUT, name))
        entry['paras'].append({'f': 'audio/ko/' + name, 'segs': segs})
        print(f'{pid} ¶{i + 1}: {len(segs)}문장 {t:.1f}초', flush=True)
    entry['spk'] = {k: LABEL.get((pid, k), CAST[k]['name']) for k in CAST}
    voice[pid] = entry
    return log

def write_js(voice):
    credit = sorted({CAST[k]['spk'] for k in CAST})
    js = '/* 자동 생성: tools/ko_voice.py — 국어 지문 낭독 (Coqui XTTS-v2 합성 음성, CPML 비상업) */\nwindow.KOVOICE = ' + json.dumps({'credit': 'Coqui XTTS-v2 (Coqui Public Model License, 비상업) · 합성 음성', 'cast': {k: CAST[k]['name'] for k in CAST}, 'p': voice}, ensure_ascii=False) + ';\n'
    open(os.path.join(ROOT, 'js', 'ko', 'voice.js'), 'w').write(js)

if __name__ == '__main__':
    data = json.load(open(sys.argv[1])); want = sys.argv[2:] or list(data)
    vf = os.path.join(ROOT, 'js', 'ko', 'voice.js'); voice = {}
    if os.path.exists(vf):
        try: voice = json.loads(open(vf).read().split('window.KOVOICE = ', 1)[1].rstrip().rstrip(';'))['p']
        except Exception: voice = {}
    for pid in want:
        t0 = time.time(); log = build(pid, data[pid], voice); write_js(voice)
        bad = [l for l in log if l[4] > .2]
        print(f'== {pid} 완료 {time.time() - t0:.0f}초, 문장 {len(log)}개, CER>0.2: {len(bad)}', flush=True)
        for l in bad: print('   ⚠', l, flush=True)
