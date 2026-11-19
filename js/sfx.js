'use strict';
/* 사운드: WebAudio 합성 효과음 + 목소리 블립 + 장별 배경 음악(생성형) */
const Sfx = (() => {
  let ac = null, sfxBus, musBus, rev, noiseBuf, mood = null, next = 0, step = 0, fadeUntil = 0;
  const sfxOn = () => !(G.S && G.S.mute), musOn = () => !(G.S && (G.S.mute || G.S.nobgm));
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  function init() {
    if (ac) return ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.connect(comp); musBus = ac.createGain(); musBus.gain.value = 0; musBus.connect(comp);
    rev = ac.createConvolver(); const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } rev.buffer = ir; const rg = ac.createGain(); rg.gain.value = .45; rev.connect(rg); rg.connect(comp);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    fadeUntil = ac.currentTime; setInterval(tick, 120); return ac;
  }
  const ctx = () => { const a = init(); if (a && a.state === 'suspended') a.resume(); return a; };
  const envl = (g, t, att, v, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, v), t + att); g.gain.exponentialRampToValueAtTime(.0001, t + att + d); };
  function O({ f = 440, f1, d = .2, type = 'sine', v = .12, delay = 0, when, a: att = .005, lp, q = 1, rv = 0, music, vib = 0 }) {
    const A = ctx(); if (!A || (music ? !musOn() : !sfxOn())) return; const t = when != null ? when : A.currentTime + delay, o = A.createOscillator(), g = A.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + att + d);
    if (vib) { const l = A.createOscillator(), lg = A.createGain(); l.frequency.value = vib; lg.gain.value = f * .025; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + att + d + .1); }
    let n = o; if (lp) { const fl = A.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; fl.Q.value = q; o.connect(fl); n = fl; }
    n.connect(g); envl(g, t, att, v, d); g.connect(music ? musBus : sfxBus); if (rv) { const s = A.createGain(); s.gain.value = rv; g.connect(s); s.connect(rev); } o.start(t); o.stop(t + att + d + .05);
  }
  function Nz({ d = .2, v = .1, delay = 0, when, type = 'lowpass', f = 1000, f1, q = 1, a: att = .005, rv = 0, music }) {
    const A = ctx(); if (!A || (music ? !musOn() : !sfxOn())) return; const t = when != null ? when : A.currentTime + delay, s = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain();
    s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + att + d); fl.Q.value = q;
    s.connect(fl); fl.connect(g); envl(g, t, att, v, d); g.connect(music ? musBus : sfxBus); if (rv) { const r = A.createGain(); r.gain.value = rv; g.connect(r); r.connect(rev); } s.start(t, Math.random()); s.stop(t + att + d + .05);
  }
  const P = {
    jump: () => O({ f: 320, f1: 640, d: .14, type: 'square', v: .05, lp: 2400 }), jump2: () => { O({ f: 480, f1: 960, d: .14, type: 'square', v: .05, lp: 2600 }); O({ f: 1300, f1: 1900, d: .08, v: .04, delay: .05 }); },
    orb: () => { O({ f: 1320, d: .08, v: .09 }); O({ f: 1760, d: .16, v: .07, delay: .06, rv: .2 }); },
    stomp: () => { O({ f: 220, f1: 60, d: .16, type: 'triangle', v: .25 }); Nz({ d: .08, v: .1, f: 1800, type: 'bandpass' }); },
    hurt: () => { O({ f: 330, f1: 90, d: .3, type: 'sawtooth', v: .1, lp: 1800 }); Nz({ d: .15, v: .07, f: 800 }); },
    spring: () => O({ f: 160, f1: 900, d: .32, type: 'triangle', v: .18, vib: 18 }),
    bonk: () => { O({ f: 160, f1: 55, d: .25, type: 'triangle', v: .3 }); O({ f: 520, f1: 260, d: .2, type: 'square', v: .05, lp: 1500 }); Nz({ d: .12, v: .12, f: 2500, type: 'bandpass' }); },
    buy: () => [660, 880, 1100, 1320].forEach((f, i) => O({ f, d: .1, type: 'square', v: .045, delay: i * .07, lp: 3000 })),
    win: () => [523, 659, 784, 1047].forEach((f, i) => O({ f, d: i === 3 ? .55 : .14, type: 'triangle', v: .13, delay: i * .09, rv: .25 })),
    lose: () => [392, 349, 311, 262].forEach((f, i) => O({ f, d: i === 3 ? .55 : .16, type: 'triangle', v: .11, delay: i * .12, rv: .2 })),
    wrong: () => { O({ f: 200, f1: 150, d: .16, type: 'square', v: .06, lp: 900 }); O({ f: 150, f1: 110, d: .22, type: 'square', v: .06, lp: 900, delay: .12 }); },
    talk: () => O({ f: 500 + Math.random() * 200, f1: 420, d: .05, type: 'square', v: .025, lp: 2000 }),
    land: () => { O({ f: 140, f1: 70, d: .08, type: 'triangle', v: .1 }); Nz({ d: .05, v: .05, f: 600 }); },
    step: () => Nz({ d: .045, v: .03, f: 450 + Math.random() * 300, type: 'bandpass', q: 2 }),
    click: () => O({ f: 900, f1: 700, d: .035, type: 'triangle', v: .05 }), tick: () => O({ f: 1400, d: .025, v: .03 }),
    whoosh: () => Nz({ d: .4, v: .07, f: 300, f1: 2400, type: 'bandpass', q: .8, a: .14 }),
    impact: () => { O({ f: 90, f1: 35, d: .6, v: .38 }); Nz({ d: .4, v: .18, f: 1200, f1: 200, rv: .3 }); },
    rumble: () => { Nz({ d: 1.1, v: .22, f: 120, a: .15 }); O({ f: 45, f1: 36, d: 1, v: .2, a: .12 }); },
    roar: () => { O({ f: 110, f1: 55, d: 1.2, type: 'sawtooth', v: .13, lp: 600, vib: 7, a: .1 }); Nz({ d: 1, v: .1, f: 400, type: 'bandpass', a: .1, rv: .3 }); },
    cast: () => { O({ f: 70, f1: 140, d: 1.3, type: 'sawtooth', v: .07, lp: 500, a: .4, rv: .4 }); O({ f: 880, f1: 1760, d: .8, v: .025, a: .3, rv: .5 }); },
    fire: () => { Nz({ d: 1.4, v: .16, f: 600, f1: 3000, type: 'bandpass', q: .6, a: .3, rv: .2 }); O({ f: 200, f1: 600, d: 1.2, type: 'sawtooth', v: .045, lp: 900, a: .4 }); },
    crackle: () => { for (let i = 0; i < 6; i++) Nz({ d: .02, v: .05 + Math.random() * .05, f: 2000 + Math.random() * 3000, type: 'highpass', delay: Math.random() * .6 }); },
    ice: () => { [2093, 2637, 3136, 2349].forEach((f, i) => O({ f, d: .25, v: .035, delay: i * .05, rv: .4 })); Nz({ d: .3, v: .05, f: 6000, type: 'highpass', a: .1 }); },
    glass: () => { for (let i = 0; i < 9; i++) O({ f: 1800 + Math.random() * 2600, d: .18 + Math.random() * .3, v: .045, delay: Math.random() * .25, rv: .5 }); Nz({ d: .35, v: .13, f: 5000, type: 'highpass' }); },
    choir: () => [57, 64, 69, 73, 76].forEach((n, i) => O({ f: NOTE(n), d: 2.4, type: 'sawtooth', v: .03, a: .6, lp: 1400, vib: 5, rv: .8, delay: i * .05 })),
    gong: () => { [110, 165, 220, 331, 442].forEach((f, i) => O({ f, d: 3, v: .13 / (i + 1), rv: .7 })); Nz({ d: .2, v: .05, f: 400 }); },
    rewind: () => { O({ f: 1600, f1: 120, d: 1.1, type: 'sawtooth', v: .045, lp: 2000, a: .05, rv: .4 }); Nz({ d: 1, v: .07, f: 4000, f1: 300, type: 'bandpass', a: .05 }); },
    paper: () => { Nz({ d: .18, v: .07, f: 3000, type: 'bandpass', q: .7 }); Nz({ d: .14, v: .05, f: 2000, type: 'bandpass', delay: .1 }); },
    thud: () => { O({ f: 120, f1: 45, d: .35, v: .28 }); Nz({ d: .18, v: .1, f: 400 }); },
    chime: () => [76, 83, 88].forEach((n, i) => O({ f: NOTE(n), d: .9, v: .05, delay: i * .12, rv: .6 })),
    rise: () => { Nz({ d: .35, v: .04, f: 800, f1: 2400, type: 'bandpass', a: .12 }); O({ f: NOTE(72), d: .6, v: .045, delay: .2, rv: .5 }); },
    boing: () => O({ f: 300, f1: 700, d: .16, type: 'triangle', v: .06, vib: 25 }), lift: () => Nz({ d: .5, v: .07, f: 400, f1: 2000, type: 'bandpass', a: .15 }),
    harp: () => { const sc = [0, 2, 4, 7, 9, 12, 14, 16]; O({ f: NOTE(72 + sc[Math.floor(Math.random() * sc.length)]), d: .9, type: 'triangle', v: .06, rv: .5 }); },
    heart: () => { O({ f: 60, f1: 40, d: .16, v: .32 }); O({ f: 60, f1: 40, d: .2, v: .22, delay: .22 }); },
    explode: () => { Nz({ d: 1.6, v: .32, f: 2000, f1: 80, rv: .5 }); O({ f: 70, f1: 25, d: 1.4, v: .38 }); },
    gauge: () => { O({ f: 200, f1: 900, d: 1.4, type: 'triangle', v: .06, a: .2 }); [72, 76, 79].forEach((n, i) => O({ f: NOTE(n), d: .6, v: .05, delay: 1.3 + i * .1, rv: .5 })); },
    banner: () => [67, 72, 79].forEach((n, i) => O({ f: NOTE(n), d: .5, type: 'triangle', v: .07, delay: i * .1, rv: .4 })),
    grab: () => { Nz({ d: .12, v: .14, f: 900, type: 'bandpass' }); O({ f: 180, f1: 90, d: .15, v: .2 }); },
    dark: () => O({ f: 55, d: 2, v: .11, a: .6, lp: 300, rv: .3 }),
    frost: () => { Nz({ d: 1.2, v: .07, f: 5000, type: 'highpass', a: .4, rv: .5 }); [84, 91].forEach((n, i) => O({ f: NOTE(n), d: 1, v: .03, delay: .2 + i * .2, rv: .7 })); },
    growl: () => O({ f: 130, f1: 90, d: .5, type: 'sawtooth', v: .05, lp: 500, vib: 9, a: .08 })
  };
  /* 캐릭터 목소리: 대사 길이만큼 짧은 음절 */
  const VOX = { ignis: { f: 150, type: 'sawtooth', lp: 900, v: .045, s: .25 }, clausia: { f: 640, type: 'sine', v: .045, s: .1 }, resona: { f: 540, type: 'triangle', v: .055, s: .35, vib: 12 }, me: { f: 300, type: 'sine', lp: 700, v: .05, s: .15 }, boss: { f: 70, type: 'sawtooth', lp: 380, v: .07, s: .08 }, mon: { f: 240, type: 'square', lp: 1200, v: .03, s: .4 }, other: { f: 420, type: 'triangle', v: .04, s: .2 } };
  function voice(who, text) {
    let k = 'other'; if (who && typeof who === 'object') k = /지휘자/.test(who.n || '') ? 'boss' : 'mon'; else if (who === 'narr' || who == null) return P.tick(); else if (VOX[who]) k = who; else if (/지휘자/.test(who)) k = 'boss';
    const V = VOX[k], raw = String(text || ''), plain = raw.replace(/<[^>]+>/g, ''), soft = /^\s*(<i[^>]*>)?\s*\(/.test(raw), n = Math.max(2, Math.min(9, Math.round(plain.length / 5)));
    for (let i = 0; i < n; i++) { const f = V.f * (1 + (Math.random() - .5) * V.s); O({ f, f1: f * .88, d: .055, type: V.type, v: V.v * (soft ? .45 : 1), lp: soft ? 600 : (V.lp || 3200), delay: i * .075, vib: V.vib || 0 }); }
  }
  /* 배경 음악: 8분음표 격자에 패드·베이스·아르페지오를 그때그때 생성 */
  const M = {
    title: { r: 57, p: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], sc: [0, 2, 4, 7, 9], bpm: 66, arp: .45, bell: 1 },
    ch0: { r: 53, p: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], sc: [0, 2, 4, 7, 9], bpm: 84, arp: .5, bass: 1 },
    ch1: { r: 50, p: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]], sc: [0, 2, 3, 7, 9], bpm: 96, arp: .5, bass: 2, hat: 1 },
    ch2: { r: 52, p: [[0, 3, 7], [-4, 0, 3], [5, 8, 12], [-2, 2, 5]], sc: [0, 3, 5, 7, 10], bpm: 72, arp: .35, bell: 1 },
    ch3: { r: 55, p: [[0, 4, 7], [2, 5, 9], [5, 9, 12], [0, 4, 7]], sc: [0, 2, 4, 7, 9], bpm: 92, arp: .55, bass: 1 },
    ch4: { r: 57, p: [[0, 4, 7], [5, 9, 12], [2, 5, 9], [7, 11, 14]], sc: [0, 2, 4, 7, 9], bpm: 88, arp: .5, bass: 1 },
    ch5: { r: 50, p: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]], sc: [0, 2, 3, 5, 7, 10], bpm: 70, arp: .3, organ: 1 },
    ch6: { r: 47, p: [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-5, -1, 2]], sc: [0, 2, 3, 7, 10], bpm: 76, arp: .4, bell: 1, bass: 1 },
    camp: { r: 53, p: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], sc: [0, 2, 4, 7, 9], bpm: 62, arp: .7, box: 1 },
    boss: { r: 48, p: [[0, 3, 7], [0, 3, 7], [-4, 0, 3], [-2, 2, 5]], sc: [0, 3, 5, 6, 7, 10], bpm: 132, arp: .45, bass: 3, hat: 1 },
    sad: { r: 57, p: [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-5, -2, 2]], sc: [0, 2, 3, 7, 10], bpm: 58, arp: .35, piano: 1 },
    tense: { r: 45, p: [[0, 3, 7], [1, 4, 8], [0, 3, 7], [-1, 3, 6]], sc: [0, 1, 3, 7], bpm: 80, arp: .12, heart: 1, drone: 1 },
    happy: { r: 60, p: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], sc: [0, 2, 4, 7, 9], bpm: 104, arp: .7, bass: 1, bell: 1 }
  };
  function beat(t) {
    const m = M[mood]; if (!m) return; const e8 = 60 / m.bpm / 2, pos = step % 8, chd = m.p[Math.floor(step / 8) % m.p.length], R = m.r, loop = (G.S && G.S.loop) || 1, tired = mood.startsWith('ch') && loop >= 3;
    if (pos === 0) { chd.forEach(n => O({ f: NOTE(R + 12 + n), d: e8 * 8, a: e8 * 2.5, type: m.organ ? 'square' : 'triangle', v: m.organ ? .012 : .02, lp: loop >= 2 ? 700 : 1100, rv: .4, music: 1, when: t })); if (m.drone) O({ f: NOTE(R - 12), d: e8 * 8, a: e8 * 3, type: 'sawtooth', v: .03, lp: 220, music: 1, when: t }); }
    if (m.bass && (m.bass === 3 || pos === 0 || pos === 4 || (m.bass === 2 && (pos === 3 || pos === 6)))) O({ f: NOTE(R - 12 + chd[0]), d: m.bass === 3 ? e8 * .8 : e8 * 1.8, type: m.bass === 3 ? 'sawtooth' : 'triangle', v: m.bass === 3 ? .04 : .06, lp: 500, music: 1, when: t });
    if (m.hat && pos % 2 === 1) Nz({ d: .03, v: .015, f: 7000, type: 'highpass', music: 1, when: t });
    if (m.heart && (pos === 0 || pos === 1)) O({ f: 58, f1: 40, d: .18, v: pos ? .12 : .18, music: 1, when: t + (pos ? .05 : 0) });
    if (Math.random() < m.arp * (tired ? .45 : 1)) { const n = R + 24 + m.sc[Math.floor(Math.random() * m.sc.length)] + (Math.random() < .25 ? 12 : 0); O({ f: NOTE(n + (m.box ? 12 : 0)), d: m.piano ? 1.4 : m.box ? .3 : m.bell ? .9 : .4, type: m.bell || m.box ? 'sine' : 'triangle', v: m.box ? .03 : .028, rv: .45, music: 1, when: t }); }
  }
  function tick() {
    if (!ac || ac.state !== 'running') return; const now = ac.currentTime, g = musBus.gain;
    if (fadeUntil && now >= fadeUntil) { fadeUntil = 0; g.cancelScheduledValues(now); g.setValueAtTime(.0001, now); g.linearRampToValueAtTime(musOn() ? 1 : 0, now + 1.2); }
    if (!mood || !M[mood] || !musOn()) return; const e8 = 60 / M[mood].bpm / 2; if (next < now) next = now + .05; while (next < now + .5) { beat(next); next += e8; step++; }
  }
  function music(m) { if (m === mood) return; mood = m; step = 0; if (!ac) return; const now = ac.currentTime, g = musBus.gain; g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + .5); next = now + .55; fadeUntil = now + .55; }
  function refresh() { if (!ac) return; musBus.gain.cancelScheduledValues(ac.currentTime); musBus.gain.setTargetAtTime(musOn() ? 1 : 0, ac.currentTime, .2); }
  const unlock = () => { const first = !ac; ctx(); if (first && ac) fadeUntil = ac.currentTime + .05; };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, { passive: true, capture: true }));
  return { play: k => { try { P[k] && P[k](); } catch (e) { } }, voice: (w, s) => { try { voice(w, s); } catch (e) { } }, music, refresh };
})();
