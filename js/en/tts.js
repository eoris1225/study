'use strict';
/* 낭독: 브라우저 음성(Web Speech)으로 끊어 읽기 단위 낭독. 역할별 목소리 / 돌아가며 읽기 / 한 목소리, 속도 조절, 해석 같이 읽기 */
const Reader = (() => {
  const SS = window.speechSynthesis; const ok = !!SS && typeof SpeechSynthesisUtterance !== 'undefined';
  let voices = [], token = 0, playing = false, paused = false, bar = null, cur = null;
  const cfg = () => { SV.tts = Object.assign({ rate: 0.9, mode: 'drama', ko: false }, SV.tts || {}); return SV.tts; };
  const load = () => { if (!ok) return; voices = SS.getVoices(); };
  if (ok) { load(); SS.onvoiceschanged = load; }
  const en = () => { const v = voices.filter(v => /^en/i.test(v.lang)); const pref = v.filter(v => /natural|neural|google|samantha|daniel|karen|moira|serena|aria|guy|jenny/i.test(v.name)); return (pref.length >= 2 ? pref.concat(v.filter(x => !pref.includes(x))) : v); };
  const koV = () => voices.find(v => /^ko/i.test(v.lang));
  /* 배역: 목소리 + 높낮이 + 빠르기 */
  function cast() {
    const E = en(), pick = (i, fb) => E.length ? E[i % E.length] : null; const one = E.length < 2;
    return {
      author: { v: pick(0), pitch: 1, rate: 1, name: '글쓴이' },
      ask: { v: pick(1), pitch: one ? 1.25 : 1.1, rate: .95, name: '질문' },
      oppo: { v: pick(2), pitch: one ? .75 : .9, rate: 1.05, name: '반론' },
      cry: { v: pick(0), pitch: 1.15, rate: .82, name: '외침' },
      list: { v: pick(3), pitch: one ? 1.1 : 1, rate: 1.08, name: '열거' },
      ens: E.slice(0, 5).map((v, i) => ({ v, pitch: one ? [1, 1.2, .85, 1.1, .95][i] : 1, rate: 1, name: '낭독 ' + (i + 1) }))
    };
  }
  /* 문장 → 배역 */
  const OPPO = { p8: [2, 3], p6: [0] };
  function roleOf(pid, si, s, k) {
    const C = cast(), m = cfg().mode, t = s[0].replace(/<[^>]+>/g, '');
    if (m === 'one') return C.author;
    if (m === 'round') { const E = C.ens.length ? C.ens : [C.author]; return E[k % E.length]; }
    if ((OPPO[pid] || []).includes(si)) return C.oppo;
    if (/!\s*$/.test(t)) return C.cry;
    if (/\?\s*$/.test(t)) return C.ask;
    if (/^There (is|are|was) /.test(t) && pid === 'p3') return C.list;
    return C.author;
  }
  function speak(text, role, rate, lang) {
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(text); if (lang === 'ko') { u.lang = 'ko-KR'; const k = koV(); if (k) u.voice = k; u.rate = Math.min(1.4, rate * 1.1); }
      else { u.lang = 'en-US'; if (role.v) u.voice = role.v; u.pitch = role.pitch; u.rate = Math.max(.4, Math.min(2, rate * role.rate)); }
      let done = false; const fin = () => { if (!done) { done = true; clearTimeout(guard); res(); } };
      const guard = setTimeout(fin, 2500 + text.length * 160 / (u.rate || 1)); /* onend가 안 오는 기기 대비 */
      u.onend = u.onerror = fin; SS.speak(u);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clean = c => c.replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/[①-⑤]/g, '').replace(/<[^>]+>/g, '').replace(/—/g, ',').replace(/\s+/g, ' ').trim();
  function mark(el, i) { document.querySelectorAll('.speaking').forEach(e => e.classList.remove('speaking')); if (!el) return; el.classList.add('speaking'); if (i != null) { const c = el.querySelectorAll('.ck')[i]; if (c) c.classList.add('speaking'); } const r = el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  /* items: [{el, s, pid, si}] */
  async function run(items, from = 0) {
    if (!ok) { alert('이 브라우저는 읽어 주기(음성 합성)를 지원하지 않아요. 크롬이나 사파리 최신 버전에서 열어 주세요.'); return; }
    stop(); const my = ++token; playing = true; paused = false; sync();
    for (let k = from; k < items.length; k++) {
      const it = items[k]; cur = { items, k }; const role = roleOf(it.pid, it.si, it.s, k); const ens = it.s[0].split(' / '); if (bar) bar.querySelector('.who').textContent = '🎙 ' + role.name;
      const short = clean(it.s[0]).split(' ').length <= 6;
      for (let i = 0; i < ens.length; i++) {
        if (my !== token) return; mark(it.el, i); const r = cfg().rate;
        await speak(clean(ens[i]), role, short ? r * .9 : r);
        while (paused && my === token) await wait(120);
        if (my !== token) return; await wait((i < ens.length - 1 ? 140 : 420) / r);
      }
      if (cfg().ko && my === token) { if (it.el) it.el.classList.add('show-tr'); await speak(it.s[2].replace(/<[^>]+>/g, ''), {}, cfg().rate, 'ko'); await wait(300); }
      if (short && my === token) await wait(350 / cfg().rate);
    }
    if (my === token) { playing = false; mark(null); sync(); }
  }
  function stop() { token++; playing = false; paused = false; if (ok) SS.cancel(); mark(null); sync(); }
  function pause() { if (!playing) return; paused = !paused; if (paused) SS.pause(); else SS.resume(); sync(); }
  function sync() { if (!bar) return; bar.querySelector('[data-a=play]').textContent = playing ? (paused ? '▶ 계속' : '⏸ 멈춤') : '▶ 전체 듣기'; bar.classList.toggle('on', playing); if (!playing) bar.querySelector('.who').textContent = ''; }
  /* 낭독 막대: container 안의 .sent 들을 읽는다 */
  function attach(container, getItems) {
    const c = cfg(); bar = h('div', 'rbar');
    bar.innerHTML = `<button data-a="play">▶ 전체 듣기</button><button data-a="stop">⏹</button><label class="spd">속도 <input type="range" min="0.5" max="1.6" step="0.05" value="${c.rate}"><b>${c.rate.toFixed(2)}×</b></label><select><option value="drama">🎭 역할별 목소리</option><option value="round">👥 돌아가며 읽기</option><option value="one">🎙 한 목소리</option></select><label class="kot"><input type="checkbox" ${c.ko ? 'checked' : ''}> 해석도 읽기</label><span class="who"></span>`;
    bar.querySelector('select').value = c.mode;
    bar.onclick = e => { const a = e.target.dataset.a; if (a === 'play') { if (playing) pause(); else run(getItems()); } if (a === 'stop') stop(); };
    const rg = bar.querySelector('input[type=range]'); rg.oninput = () => { c.rate = +rg.value; bar.querySelector('.spd b').textContent = c.rate.toFixed(2) + '×'; save(); };
    bar.querySelector('select').onchange = e => { c.mode = e.target.value; save(); if (playing && cur) run(cur.items, cur.k); };
    bar.querySelector('.kot input').onchange = e => { c.ko = e.target.checked; save(); };
    container.appendChild(bar); return bar;
  }
  function playOne(items, k) { run(items, k).then(() => { }); }
  /* 한 문장만: 끝나면 멈춤 */
  function one(item) { run([item]); }
  /* 애니메이션 자막 영어 조각 읽기 */
  function line(text) { if (!ok || !SV.sceneVoice || !text) return; SS.cancel(); const C = cast(); speak(clean(text), /\?$/.test(text) ? C.ask : C.author, cfg().rate); }
  /* 단어 하나 발음: 낭독 중이면 끊지 않고 건너뜀 */
  function word(w) { if (!ok || !w || playing) return; SS.cancel(); const C = cast(); speak(w.replace(/[^A-Za-zÀ-ÿ'’\- ]/g, ''), C.author, Math.min(cfg().rate, .9)); }
  return { word, ok, run, stop, pause, attach, one, line, playOne, cast, get playing() { return playing; } };
})();
