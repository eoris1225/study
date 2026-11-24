#!/usr/bin/env python3
"""VOICEVOX로 일본어 대사 미리 녹음 → audio/jp/*.mp3 + js/jp/voice.js (게임이 읽는 목록)
   node tools/jp_script.js voiceplan  →  python3 tools/jp_voice.py
   필요: voicevox_core 0.16 (파이썬 wheel), VOICEVOX ONNX Runtime, open_jtalk 사전, 음성 모델(.vvm)
   환경 변수 VV_DIR 아래에 voicevox_onnxruntime-*/lib, open_jtalk_dic_utf_8-1.11, vvms/*.vvm 이 있어야 함.

   캐릭터마다 목소리와 감정 스타일을 나누고, 대본의 맥락(속삭임·뜸·표정·말 빠르기)에 맞춰
   스타일, 말 속도, 음높이, 억양, 음량, 앞뒤 쉼, 쉼표 길이를 바꿔서 녹음함."""
import glob, hashlib, json, os, re, subprocess, sys
from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
VV = os.environ.get('VV_DIR', '/tmp/vv')
OUT = os.path.join(ROOT, 'audio', 'jp')

# 캐릭터 → VOICEVOX 화자·스타일 ID (감정별). 크레딧은 아래 CREDIT
CAST = {
    's': dict(name='ユーレイちゃん', normal=102, happy=103, sweet=103, sad=104, cry=104, angry=102, whisper=105),
    'o': dict(name='九州そら', normal=16, happy=15, sweet=15, sad=16, cry=16, angry=18, whisper=19),
    'm': dict(name='もち子さん', normal=20, happy=79, sweet=79, sad=77, cry=77, angry=78, whisper=80),
    'd': dict(name='玄野武宏', normal=11, happy=39, sweet=39, sad=41, cry=41, angry=40, whisper=11),
    'h': dict(name='櫻歌ミコ', normal=45, happy=45, sweet=45, sad=45, cry=45, angry=45, whisper=45),
    'k': dict(name='冥鳴ひまり', normal=14, happy=14, sweet=14, sad=14, cry=14, angry=14, whisper=14),
    't': dict(name='青山龍星', normal=13, happy=83, sweet=84, sad=85, cry=85, angry=81, whisper=86),
    'r': dict(name='春日部つむぎ', normal=8, happy=8, sweet=8, sad=8, cry=8, angry=8, whisper=8),
    'f': dict(name='剣崎雌雄', normal=21, happy=21, sweet=21, sad=21, cry=21, angry=21, whisper=21),
    'u': dict(name='白上虎太郎', normal=12, happy=32, sweet=12, sad=35, cry=35, angry=34, whisper=12),
    'w': dict(name='ユーレイちゃん', normal=102, happy=102, sweet=102, sad=102, cry=102, angry=102, whisper=102),
}
LABEL_VOICE = {'렌 어머님': (10, '雨晴はう'), '공식 낭독자': (30, 'No.7')}
FACE_EMO = {'happy': 'happy', 'lol': 'happy', 'teeth': 'happy', 'grin': 'happy', 'smug': 'happy', 'blush': 'sweet', 'shy': 'sweet', 'ear_red': 'sweet',
            'sad': 'sad', 'worry': 'sad', 'cry': 'cry', 'shout': 'angry', 'wow': 'angry', 'mad': 'angry', 'pout': 'angry', 'sleepy': 'sad'}

def emotion(p):
    if not p.get('spoken'): return 'normal'                      # 한국어 문장 속 단어 = 터치할 때만, 또박또박 학습용
    if p.get('whisper'): return 'whisper'
    f = p.get('face') or ''
    if f in FACE_EMO: return FACE_EMO[f]
    t = p['text']
    if re.search(r'(えへへ|あはは|ふふ|やった|ピンポーン|大正解)', t): return 'happy'
    if re.search(r'(……っ|うぅ|ごめん(ね|なさい)…)', t): return 'cry'
    if re.search(r'(！！|!!|っ！)', t): return 'angry'
    return 'normal'

def clean(t):
    s = re.sub(r'[가-힣ㄱ-ㆎ]+', '', t)            # 한글 빼기
    s = s.replace('〜', 'ー').replace('~', 'ー')
    s = re.sub(r'[『』「」()（）♡♪★☆]', '', s)
    s = re.sub(r'—+|──+', '、', s)
    s = re.sub(r'…+|\.{3,}', '、', s)
    s = re.sub(r'[！!]{2,}', '！', s).replace('?!', '？').replace('？！', '？')
    s = re.sub(r'、{2,}', '、', s).strip()
    s = re.sub(r'^[、。！？\s]+', '', s)
    return s

def params(p, emo):
    t = p['text']; q = dict(speed=1.0, pitch=0.0, inton=1.05, vol=1.0, pre=0.1, post=0.12, pause=1.0)
    if not p.get('spoken'): return dict(speed=0.88, pitch=0.0, inton=1.0, vol=1.0, pre=0.05, post=0.1, pause=1.0)
    if emo == 'happy': q.update(inton=1.2, pitch=0.02, speed=1.03)
    if emo == 'sweet': q.update(inton=1.1, speed=0.95)
    if emo == 'sad': q.update(speed=0.9, inton=0.85, pitch=-0.02, pause=1.4)
    if emo == 'cry': q.update(speed=0.87, inton=1.25, pause=1.6, post=0.35)
    if emo == 'angry': q.update(speed=1.08, inton=1.35, vol=1.3)
    if emo == 'whisper': q.update(speed=0.92, inton=0.85, pause=1.3)
    if p.get('slow') == 1: q['speed'] *= 0.9
    if p.get('slow') == -1: q['speed'] *= 1.1
    if p.get('tremble'): q['inton'] += 0.15
    if p.get('breath'): q['pre'] += min(1.0, p['breath'] / 1000 * 0.7)
    if re.match(r'^[(（]?[^)]*[)）]?\s*[…\.]', t) or t.startswith('…'): q['pre'] += 0.45; q['pause'] *= 1.2
    if re.search(r'…+[」』]?\s*$', t): q['post'] = max(q['post'], 0.45)
    if t.count('…') >= 4: q['pause'] *= 1.3                      # 뜸을 많이 들이는 대사
    return q

def main():
    plan = json.load(open(os.path.join(ROOT, 'tools/.jp_voice_plan.json'), encoding='utf8'))
    os.makedirs(OUT, exist_ok=True)
    ort = Onnxruntime.load_once(filename=glob.glob(f'{VV}/**/libvoicevox_onnxruntime.so', recursive=True)[0])
    syn = Synthesizer(ort, OpenJtalk(f'{VV}/open_jtalk_dic_utf_8-1.11'))
    style_vvm = {}
    for f in glob.glob(f'{VV}/vvms/*.vvm'):
        with VoiceModelFile.open(f) as m:
            for c in m.metas:
                for s in c.styles: style_vvm[s.id] = f
    loaded = set()
    def need(sid):
        f = style_vvm[sid]
        if f not in loaded:
            with VoiceModelFile.open(f) as m: syn.load_voice_model(m)
            loaded.add(f)
    manifest, used, done = {}, set(), 0
    for p in plan:
        txt = clean(p['text'])
        if not re.search(r'[ぁ-ゖァ-ヺ一-龯]', txt): continue
        cast = CAST[p['who']]; emo = emotion(p); sid = cast[emo]; who_name = cast['name']
        for lab, (lsid, lname) in LABEL_VOICE.items():
            if lab in (p.get('label') or ''): sid, who_name = lsid, lname
        q = params(p, emo)
        h = hashlib.sha1(json.dumps([sid, q, txt], ensure_ascii=False).encode()).hexdigest()[:12]
        rel = f'audio/jp/{h}.mp3'; manifest[p['key']] = rel; used.add(who_name)
        if os.path.exists(os.path.join(ROOT, rel)): continue
        need(sid)
        aq = syn.create_audio_query(txt, sid)
        aq.speed_scale, aq.pitch_scale, aq.intonation_scale, aq.volume_scale = q['speed'], q['pitch'], q['inton'], q['vol']
        aq.pre_phoneme_length, aq.post_phoneme_length = q['pre'], q['post']
        for ap in aq.accent_phrases:                                   # 쉼표 쉼 길이 (뜸 들이기)
            pm = ap.pause_mora
            if pm is not None:
                if isinstance(pm, dict): pm['vowel_length'] = pm['vowel_length'] * q['pause']
                else: pm.vowel_length = pm.vowel_length * q['pause']
        wav = syn.synthesis(aq, sid)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'wav', '-i', 'pipe:0', '-ac', '1', '-ar', '24000', '-b:a', '32k', os.path.join(ROOT, rel)], input=wav, check=True)
        done += 1
        if done % 25 == 0: print(done, 'clips', flush=True)
    keep = set(manifest.values())
    for f in glob.glob(os.path.join(OUT, '*.mp3')):                   # 안 쓰는 옛 파일 정리
        if os.path.relpath(f, ROOT) not in keep: os.remove(f)
    with open(os.path.join(ROOT, 'js/jp/voice.js'), 'w', encoding='utf8') as fo:
        fo.write("'use strict';\n/* 자동 생성 (tools/jp_voice.py). 일본어 대사 → 미리 녹음한 VOICEVOX 음성 파일 */\n")
        fo.write('window.JPVOICE_CREDIT = ' + json.dumps(sorted(used), ensure_ascii=False) + ';\n')
        fo.write('window.JPVOICE = '); json.dump(manifest, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
    print('done', len(manifest), 'entries,', done, 'new clips')

if __name__ == '__main__':
    main()
