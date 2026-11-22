'use strict';
/* 사운드 연결: 대사 목소리, 버튼, 미니게임 결과, 컷신 분위기 음악 */
(() => {
  const _rs = renderSay; renderSay = function (el, st, on) { _rs(el, st, on); Sfx.voice(st.who, st.text); };
  const _rc = renderChoice; renderChoice = function (el, st, on) { _rc(el, st, on); Sfx.play('chime'); };
  const _lf = lifeUI; lifeUI = function (el, n) { const o = _lf(el, n), h = o.hit; o.hit = () => { Sfx.play('wrong'); return h(); }; return o; };
  for (const k in MG) { const f = MG[k]; if (k === 'sort') continue; MG[k] = (cfg, el, done, ctx) => f(cfg, el, ok => { Sfx.play(ok ? 'win' : 'lose'); done(ok); }, ctx); }
  addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b && !b.closest('#pad')) Sfx.play('click'); }, true);
  const MOOD = { wake1: 'title', wake2: 'sad', wake3: 'sad', die1: 'sad', die2: 'sad', stop3: 'tense', happy: 'happy', gauge0: 'tense', gauge1: 'ch0' };
  for (const k in MOOD) { const f = STAGES[k]; if (!f) continue; STAGES[k] = (...a) => { const sc = f(...a); if (sc[0]) sc[0].mood = MOOD[k]; if (k === 'happy') sc.forEach(s => { if (s.bg === 'beach') s.mood = 'camp'; }); return sc; }; }
  const _beat = STAGES.beat; STAGES.beat = st => { const sc = _beat(st); if (sc[0]) sc[0].mood = st.beat === 'camp' ? 'camp' : st.beat === 'boss' ? 'boss' : null; return sc; };
  Sfx.music('title');
})();

/* 배경 음악 스타일 적용 (팝·발라드·로파이) */
(() => { const _run = run; run = function () { try { Sfx.style((G.S && G.S.bgmStyle) || null); } catch (e) { } return _run.apply(this, arguments); }; })();
