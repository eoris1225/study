'use strict';
/* 효과음(WebAudio 합성) */
const Sfx = (() => {
  let ac = null; const on = () => !(G.S && G.S.mute);
  const ctx = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (ac && ac.state === 'suspended') ac.resume(); return ac; };
  const tone = (f0, f1, d, type = 'sine', vol = .18, delay = 0) => { const a = ctx(); if (!a || !on()) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + delay; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02); };
  const P = {
    jump: () => tone(320, 620, .14, 'square', .07), jump2: () => tone(480, 900, .14, 'square', .07), orb: () => { tone(880, 1320, .08, 'sine', .14); tone(1320, 1760, .1, 'sine', .1, .06); },
    stomp: () => { tone(220, 70, .16, 'triangle', .25); tone(700, 1100, .08, 'square', .06, .03); }, hurt: () => tone(300, 90, .3, 'sawtooth', .14), spring: () => tone(180, 900, .28, 'triangle', .2),
    bonk: () => { tone(160, 60, .22, 'triangle', .3); tone(500, 250, .2, 'square', .08); }, lift: () => tone(110, 160, .12, 'sine', .05), buy: () => [660, 880, 1100].forEach((f, i) => tone(f, f, .1, 'square', .08, i * .08)),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .16, 'triangle', .16, i * .1)), talk: () => tone(500 + Math.random() * 200, 420, .05, 'square', .03), land: () => tone(140, 80, .07, 'triangle', .1)
  };
  return { play: k => { try { P[k] && P[k](); } catch (e) { } } };
})();
