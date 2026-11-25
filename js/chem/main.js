/* 화학 개념 강의: 교과서 순서 · 3D 무대 · 확인 질문 · 교과서 문제(사진) · 펜 필기 · 진행 저장 */
import { show, has, view } from './stage.js?v=5';
import * as HAM from './ham.js?v=4';
const $ = s => document.querySelector(s);
const C = window.CHEM, Q = window.CHEMQ;
const KEY = 'chem_v1';
let SAVE = { pos: null, res: {} }; try { Object.assign(SAVE, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) { } };
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/* 절 목록 평탄화 */
const SECS = []; C.forEach((u, ui) => u.ch.forEach((c, ci) => c.secs.forEach((s, si) => SECS.push({ ui, ci, si, u, c, s, label: `${u.t.split('.')[0]}-${ci + 1} · ${s.t}` }))));
const card = $('#card'), head = $('#card .hd'), body = $('#card .bd'), foot = $('#card .ft');

/* 레이아웃: 카드 옆 빈 공간에 3D */
function layout() { const port = innerWidth < 820 || innerHeight > innerWidth; document.body.classList.toggle('port', port);
  const sub = $('#sub'), fp = $('#figp'), ctl = $('#ctl'), hc = $('#ham'), menuOn = !$('#menu').hidden; let hp;
  ctl.style.bottom = ''; ctl.style.left = '';
  if (menuOn) { hp = port ? null : [Math.max(10, (innerWidth - 560) / 2 - 170), innerHeight * .5 - 200, 340, 400]; view(0, 0); }
  else if (!card.hidden) { const r = card.getBoundingClientRect(); if (port) { view(0, (innerHeight - r.top) / 2); hp = [innerWidth - 112, 100, 104, 124]; } else { view((innerWidth - r.left) / 2, 0); hp = [8, innerHeight - 196, 150, 180]; ctl.style.left = '166px'; } }
  else if (!sub.hidden) { const sr = sub.getBoundingClientRect(), subH = innerHeight - sr.top; ctl.style.bottom = (subH + 10) + 'px'; let ox = 0, oy = subH / 2;
    if (!fp.hidden) { const fr = fp.getBoundingClientRect(); if (port) oy -= fr.bottom / 2 - 20; else ox = (innerWidth - fr.left) / 2; } view(ox, oy);
    const w = port ? 104 : 150, h = port ? 124 : 180; hp = bigHam ? (port ? [innerWidth / 2 - 130, sr.top - 330, 260, 310] : [innerWidth / 2 - 170, Math.max(50, sr.top - 400), 340, 400]) : [sr.left + (port ? 2 : 6), sr.top - h * .42, w, h];  if (!bigHam) ctl.style.left = (hp[0] + hp[2] + 4) + 'px'; }
  else view(0, 0);
  if (hp) { hc.hidden = false; Object.assign(hc.style, { left: hp[0] + 'px', top: hp[1] + 'px', width: hp[2] + 'px', height: hp[3] + 'px' }); HAM.size(); const hb = $('#hb'); hb.style.left = Math.min(hp[0] + hp[2] * .55, innerWidth - 170) + 'px'; hb.style.top = Math.max(50, hp[1] - 8) + 'px'; } else hc.hidden = true; }
addEventListener('resize', layout);
function fig(name) { return name ? `<div class="fig"><img src="img/chem/${name}.jpg" alt="교과서 그림"><button class="zb" data-z>🔍 크게</button></div>` : ''; }
body.addEventListener('click', e => { const z = e.target.closest('[data-z]'); if (z) { e.stopPropagation(); window.__zoomfig && window.__zoomfig(z.parentNode.querySelector('img')); } });
function wait() { return new Promise(res => { foot.onclick = e => { const b = e.target.closest('[data-b]'); if (b) res(b.dataset.b); }; }); }
function setFoot(html) { foot.innerHTML = html; }
function topbar(t) { $('#top span').textContent = t; hud(); }

/* ── 게임 레이어: XP · 콤보 · 효과음 · 콘페티 ── */
let AC = null; function beep(f = 660, d = .08, type = 'sine', v = .07) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d + .02); } catch (e) { } }
let combo = 0;
const sfx = { ok() { beep(660, .07); setTimeout(() => beep(820 + Math.min(combo, 10) * 45, .1), 60); }, no() { beep(170, .2, 'square', .035); }, win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .13, 'triangle'), i * 90)); } };
const lvl = () => 1 + Math.floor(Math.sqrt((SAVE.xp || 0) / 60));
function hud() { const el = $('#xp'); if (el) el.innerHTML = `Lv ${lvl()} · ⭐ ${SAVE.xp || 0}${combo >= 2 ? ` · <b>🔥×${combo}</b>` : ''}`; }
function pop(t, x, y) { const d = document.createElement('div'); d.className = 'pop'; d.textContent = t; d.style.left = (x ?? innerWidth / 2) + 'px'; d.style.top = (y ?? innerHeight / 2) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 950); }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1900); }
function confetti(n = 46) { for (let i = 0; i < n; i++) { const d = document.createElement('i'); d.className = 'cf'; d.style.left = Math.random() * 100 + 'vw'; d.style.background = `hsl(${Math.random() * 360},90%,62%)`; d.style.animationDuration = (1.1 + Math.random()) + 's'; d.style.animationDelay = Math.random() * .3 + 's'; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); } }
function gain(n, x, y) { const mult = 1 + Math.min(4, Math.floor(combo / 3)) * .5, v = Math.round(n * mult), before = lvl(); SAVE.xp = (SAVE.xp || 0) + v; save(); hud(); pop(`+${v} XP`, x, y); if (lvl() > before) { toast(`🎉 레벨 업! <b>Lv ${lvl()}</b>`); confetti(); sfx.win(); } }
const OKS = ['찍! 정답!', '역시 내 파트너!', '좋았어!', '천재 아냐?', '찍찍찍!'], NOS = ['앗, 다시!', '찍… 괜찮아', '함정이었어!', '한 번 더 보자', '으앗'];
const pick = a => a[Math.floor(Math.random() * a.length)];
let hbT = null; function bubble(t) { const hb = $('#hb'); if ($('#ham').hidden) return; hb.textContent = t; hb.hidden = false; hb.classList.remove('in'); void hb.offsetWidth; hb.classList.add('in'); clearTimeout(hbT); hbT = setTimeout(() => hb.hidden = true, 1600); }
function hit(ok, el, n = 10) { HAM.feel(ok ? 'joy' : 'sad', 1300); if (!card.hidden) bubble(ok ? pick(OKS) : pick(NOS)); const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null; if (ok) { combo++; sfx.ok(); gain(n, r && r.left + r.width / 2, r && r.top); if (combo % 5 === 0) { confetti(30); toast(`🔥 <b>${combo} 콤보!</b> XP 배율 ×${(1 + Math.min(4, Math.floor(combo / 3)) * .5).toFixed(1)}`); } }
  else { combo = 0; sfx.no(); hud(); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); } }

/* ── 3D 미션: 직접 조작해서 목표 달성 ── */
const MIS = {
  exoendo: ['흡열로 바꿔서 온도계를 차갑게 만들어 봐 ❄️', s => s.cold], calor: ['Δt가 10 ℃를 넘을 때까지 반응시켜 봐 🌡️', s => s.dT >= 10],
  bond: ['H–H 결합을 끝까지 끊어 436 kJ을 채워 봐 ✂️', s => s.e >= 425], bondH2O: ['과정 2까지 진행해서 O–H 결합을 만들어 봐 🔗', s => s.stage === 'p'],
  entropy: ['기체로 바꿔 엔트로피를 최대로! 💨', s => s.st === 'g'], nh3: ['반응시켜서 기체 분자 수가 줄어드는 걸 확인해 봐', s => s.on],
  mix: ['꼭지를 열어 두 기체를 섞어 봐 🔓', s => s.open], system: ['열린계·닫힌계·고립계를 모두 눌러 봐', s => s.sys && Object.keys(s.sys).length >= 3],
  spont: ['ΔH > 0 인데도 자발적인 반응을 만들어 봐 🎯', s => s.endoSpont], mgHCl: ['H₂ 압력을 1 atm 넘게 모아 봐 🫧', s => s.p >= 1],
  rate: ['A가 절반 남을 때까지 지켜봐 ⏳', s => s.a <= .5], avgrate: ['A가 절반 남을 때까지 접선을 따라가 봐 📈', s => s.a <= .5],
  ratelaw: ['반응 속도를 처음의 8배로 만들어 봐 ✖️', s => s.x >= 8], halflife: ['반감기 3번을 지나게 해 봐 ⏱️', s => s.half >= 3],
  collision: ['(가) 충돌로 반응을 일으켜 봐 💥', s => s.tries && s.tries.a], ea: ['공의 에너지를 조절해서 언덕을 넘겨 봐 ⚽', s => s.over],
  conc: ['노란 입자 농도를 최대로 올려 충돌을 늘려 봐 🟡', s => s.n >= 4], pressure: ['외부 압력을 높여 충돌을 늘려 봐 ⬇', s => s.hi],
  surface: ['고체를 잘게 쪼개 표면적을 늘려 봐 🔨', s => s.split], maxwell: ['온도를 2 이상 올려 Eₐ를 넘는 분자를 늘려 봐 🔥', s => s.T >= 2],
  maxwellcat: ['정촉매를 넣어 Eₐ를 낮춰 봐 🧪', s => s.cats && s.cats[1]], catalyst: ['정촉매와 부촉매를 둘 다 써 봐', s => s.cats && s.cats.p && s.cats.m],
  converter: ['유해 기체 5개를 정화해 봐 🚗', s => s.conv >= 5] };
let misT = null;
function mission(key) { const el = $('#mis'); clearInterval(misT); const m = MIS[key]; if (!m) { el.hidden = true; return; } const ok0 = SAVE.mis && SAVE.mis[key]; el.hidden = false; el.className = ok0 ? 'done' : '';
  el.innerHTML = ok0 ? `🎮 미션 완료 ✅ <span>${m[0]}</span>` : `🎮 <b>미션</b> ${m[0]} <span>+50 XP</span>`; if (ok0) return;
  misT = setInterval(() => { const s = window.__chemState || {}; if (s.key !== key) return; let ok = false; try { ok = !!m[1](s); } catch (e) { } if (!ok) return; clearInterval(misT); (SAVE.mis = SAVE.mis || {})[key] = 1; save(); el.className = 'done pulse'; el.innerHTML = `🎮 <b>미션 성공!</b> ${m[0]} ✅`; sfx.win(); confetti(); gain(50); HAM.feel('joy', 2200); bubble('미션 성공! 찍찍!'); }, 250); }
function noMission() { clearInterval(misT); $('#mis').hidden = true; }

/* ── ⚡ 빈칸 러시: 학습지 빈칸을 칩으로 빠르게 ── */
function blanks(list, t) { return new Promise(async res => { card.hidden = false; layout(); head.innerHTML = `<b>⚡ 빈칸 러시</b><span>${t}</span>`; let good = 0;
  for (let n = 0; n < list.length; n++) { const [sent, ans, wr] = list[n], opts = shuffle([ans, ...wr]); const t0 = Date.now();
    body.innerHTML = `<div class="bar"><i style="width:${n / list.length * 100}%"></i></div><p class="hint">${n + 1} / ${list.length} · 빨리 맞히면 보너스 ⚡</p><p class="bl">${sent.replace('___', '<span class="slot">?</span>')}</p><div class="chips">${opts.map(o => `<button>${o}</button>`).join('')}</div><div class="fb"></div>`; setFoot('');
    await new Promise(r2 => { let miss = 0; body.querySelector('.chips').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; const slot = body.querySelector('.slot');
      if (b.textContent === ans) { b.classList.add('ok'); slot.textContent = ans; slot.classList.add('ok'); body.querySelectorAll('.chips button').forEach(x => x.disabled = true); if (!miss) { good++; hit(true, b, 5); if (Date.now() - t0 < 4000) { gain(5); pop('⚡ 빠름!', innerWidth / 2, 120); } } setTimeout(r2, miss ? 1100 : 550); }
      else { b.classList.add('no'); b.disabled = true; hit(false); if (++miss >= 2) { slot.textContent = ans; slot.classList.add('no'); body.querySelectorAll('.chips button').forEach(x => { x.disabled = true; if (x.textContent === ans) x.classList.add('ok'); }); setTimeout(r2, 1300); } } }; }); }
  const perfect = good === list.length; if (perfect) { confetti(); sfx.win(); gain(20); }
  body.innerHTML = `<div class="bar"><i style="width:100%"></i></div><p class="big">${perfect ? '💯 퍼펙트!' : '✅ 빈칸 러시 끝'}</p><p class="q">${good} / ${list.length} 한 번에 정답</p>`;
  setFoot('<button class="pri" data-b="next">다음 ▶</button>'); await wait(); res(); }); }

/* ── ⚡ 스피드 런 보스: 90초 · 하트 3개 ── */
let bossTok = null;
function boss(uid) { const tok = bossTok = {}; noMission(); subOff(); $('#menu').hidden = true; $('#top').hidden = false; card.hidden = false; show('collision'); layout(); topbar(`⚡ 스피드 런 · ${uid}`);
  const pool = shuffle(SECS.filter(x => x.u.id === uid).flatMap(x => [...(x.s.ask || []).map(q => [q[0], q[1], q[2], q[3]]), ...(x.s.blanks || []).map(([s, a, w]) => [s.replace('___', '<b>＿＿</b>'), [a, ...w], 0, ''])]));
  let i = 0, okN = 0, score = 0, lives = 3, tl = 90, run = true; combo = 0; hud();
  const bar = () => head.innerHTML = `<b>⚡ 스피드 런</b><span>⏱ ${Math.ceil(tl)}초 · ${'❤️'.repeat(lives)}${'🖤'.repeat(3 - lives)} · ${score}점</span>`;
  const end = () => { if (!run) return; run = false; clearInterval(tm); const best = (SAVE.best = SAVE.best || {})[uid] || 0, nb = score > best; if (nb) { SAVE.best[uid] = score; save(); confetti(70); sfx.win(); } gain(Math.round(score / 2));
    body.innerHTML = `<p class="big">${nb ? '🏆 신기록!' : '⏱ 끝!'}</p><p class="q">점수 <b>${score}</b> · 최고 ${Math.max(best, score)}</p><p class="hint">${i}문제 중 <b>${okN}</b>개 정답 · 틀린 개념은 해당 절로 돌아가 복습!</p>`;
    setFoot('<button data-b="menu">☰ 메뉴</button><button class="pri" data-b="again">🔁 다시 도전</button>'); wait().then(a => a === 'again' ? boss(uid) : menu()); };
  const tm = setInterval(() => { if (bossTok !== tok) return clearInterval(tm); tl -= .25; bar(); if (tl <= 0) end(); }, 250);
  const next = () => { if (!run || bossTok !== tok) return; if (i >= pool.length) return end(); const [q, o, a] = pool[i++], ord = shuffle(o.map((_, k) => k)); bar();
    body.innerHTML = `<p class="q">${q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join('')}</div>`; setFoot('');
    body.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || !run) return; body.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); });
      if (+b.dataset.k === a) { okN++; score += 10 + Math.min(combo, 10) * 2; hit(true, b, 3); tl = Math.min(90, tl + 1.5); setTimeout(next, 280); }
      else { b.classList.add('no'); hit(false); lives--; bar(); if (lives <= 0) setTimeout(end, 700); else setTimeout(next, 900); } }; };
  next(); }

/* ── 스토리: 대본(docs/chem/대본.txt) · 영화 자막 · 아무 데나 탭하면 다음 ── */
const STORY = {};
/* 대본 속 $…$ 수식 → HTML (ΔH, 아래첨자, 위첨자, °, × …) */
function tex(m) { const T = []; m = m.replace(/</g, '\u0003').replace(/>/g, '\u0004').replace(/\^\\circ/g, '°').replace(/\\text\{([^{}]*)\}/g, (_, x) => '\u0001' + (T.push(x) - 1) + '\u0002');
  m = m.replace(/\\Delta\s*/g, 'Δ').replace(/\\circ/g, '°').replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/\\le(q)?/g, '≤').replace(/\\ge(q)?/g, '≥').replace(/\\(to|rightarrow)/g, '→').replace(/\\,|\;|\\ /g, ' ').replace(/-/g, '−');
  m = m.replace(/(^|[^\u0001\d])([A-Za-z])(?![A-Za-z])/g, '$1<i>$2</i>');
  m = m.replace(/([_^])\{([^{}]*)\}/g, (_, k, x) => k === '_' ? `<sub>${x}</sub>` : `<sup>${x}</sup>`).replace(/([_^])(\u0001\d+\u0002|<i>.<\/i>|.)/g, (_, k, x) => k === '_' ? `<sub>${x}</sub>` : `<sup>${x}</sup>`);
  return '<span class="m">' + m.replace(/\u0001(\d+)\u0002/g, (_, i) => T[i]).replace(/\u0003/g, '&lt;').replace(/\u0004/g, '&gt;') + '</span>'; }
const rich = t => t.replace(/\$([^$]+)\$/g, (_, m) => tex(m));
try { const txt = await (await fetch(encodeURI('docs/chem/대본.txt') + '?v=2')).text(); let cur = null;
  for (const raw of txt.split('\n')) { const l = raw.trim(); if (!l || l.startsWith('#')) continue; let m;
    if ((m = l.match(/^===\s*(.+?)\s*===$/))) { cur = STORY[m[1].replace(/\s*\|\s*/, '|')] = []; continue; } if (!cur) continue;
    if ((m = l.match(/^\[지문\]\s*(.*)$/))) cur.push({ who: '지문', text: rich(m[1]) });
    else if ((m = l.match(/^([^:()\[]{1,8}?)\s*(?:\(([^)]*)\))?\s*:\s*(.+)$/))) cur.push({ who: m[1].trim(), mood: m[2], text: rich(m[3]) }); } } catch (e) { }
let adv = null, pd = null;
addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY }; }, true);
addEventListener('pointerup', e => { if (!adv || !pd || $('#sub').hidden) return; if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 10) return; if (e.target.closest('button,input,select,label,a,#ctl,#gph,#top,#card,#menu,#mis,#zoomfig')) return; adv('next'); });
addEventListener('keydown', e => { if (!adv || $('#sub').hidden) return; if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); adv('next'); } else if (e.key === 'ArrowLeft' && !$('#sub [data-sback]').hidden) adv('prev'); });
document.addEventListener('click', e => { if (e.target.closest('#sub [data-sback]') && adv) { e.stopPropagation(); adv('prev'); } });
function subOn() { const sub = $('#sub'); if (sub.hidden) { sub.hidden = false; card.hidden = true; document.body.classList.add('story'); } }
function subOff() { adv = null; $('#sub').hidden = true; document.body.classList.remove('story'); figShow(null); }
function figShow(f) { const fp = $('#figp'); if (!f) { fp.hidden = true; return; } if (fp.dataset.f !== f) { fp.dataset.f = f; fp.innerHTML = `<img src="img/chem/${f}.jpg" alt="교과서 그림"><button class="zb" data-z>🔍 크게</button>`; fp.querySelector('img').onload = layout; } fp.hidden = false; }
$('#figp').addEventListener('click', e => { if (e.target.closest('[data-z]')) window.__zoomfig && window.__zoomfig($('#figp img')); });
function line(L, o = {}) { const sub = $('#sub'); subOn(); const who = L.who; sub.className = who === '지문' ? 'nar' : who === '햄토리' ? 'ham' : 'me';
  sub.querySelector('.who').textContent = who === '지문' ? '' : who; const tx = sub.querySelector('.tx'); tx.innerHTML = L.text; tx.classList.remove('in'); void tx.offsetWidth; tx.classList.add('in');
  sub.querySelector('.op').innerHTML = ''; sub.querySelector('[data-sback]').hidden = !o.back; sub.querySelector('.pg').textContent = o.prog || ''; sub.querySelector('.go').hidden = !!o.noTap;
  if (who === '햄토리') { if (L.mood && L.mood !== '기본') HAM.feel(L.mood, 2600); else HAM.calm(); HAM.talk(Math.min(4200, 700 + L.text.replace(/<[^>]+>/g, '').length * 45)); } else HAM.calm(); layout(); return tx; }
function say(L, o = {}) { return new Promise(res => { line(L, o); adv = v => { adv = null; res(v); }; }); }
let bigHam = false;
async function scene(lines) { card.hidden = true; bigHam = true; for (let i = 0; i < lines.length;) { const a = await say(lines[i], { back: i > 0, prog: `${i + 1}/${lines.length}` }); i = a === 'prev' ? Math.max(0, i - 1) : i + 1; } bigHam = false; layout(); }
function askStory([q, o, a, why]) { return new Promise(res => { const tx = line({ who: '햄토리', mood: '고민', text: '✋ ' + q }, { noTap: true }); const op = $('#sub .op'), ord = shuffle(o.map((_, k) => k)); let tries = 0;
  op.innerHTML = ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join(''); layout();
  op.onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k;
    if (k === a || ++tries >= 2) { hit(k === a, b); op.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); }); if (k !== a) b.classList.add('no');
      tx.innerHTML = (k === a ? '⭕ <b>맞아!</b> ' : `정답은 <b>${o[a]}</b>. `) + why; $('#sub .go').hidden = false; layout(); setTimeout(() => { adv = () => { adv = null; res(); }; }, 250); }
    else { hit(false); b.classList.add('no'); b.disabled = true; tx.innerHTML = '✋ ' + q + '<br><small>찍… 다시 한 번! 방금 설명을 떠올려 봐.</small>'; layout(); } }; }); }

/* ── 개념 진행 (스토리 모드) ── */
async function run(start) {
  $('#menu').hidden = true; $('#top').hidden = false; card.hidden = true; bossTok = null;
  let idx = start ? start.i : 0, st = start ? start.st || 0 : 0;
  if (idx === 0 && st === 0 && STORY['프롤로그']) { topbar('프롤로그 · 시험 전날 밤'); noMission(); show('none'); await scene(STORY['프롤로그']); }
  while (idx < SECS.length) {
    const X = SECS[idx], S = X.s; topbar(`${X.c.t} › ${S.t}  (${idx + 1}/${SECS.length})`);
    const state = i => { let f = null, sc = null; for (let k = 0; k <= i; k++) { const x = S.steps[k]; if (x[1]) f = x[1]; if (x[2]) sc = x[2]; } return { f, sc }; };
    let i = Math.min(st, S.steps.length - 1); let back = false;
    if (st < 900) {
      if (st === 0 && STORY[S.t + '|시작']) { const { sc } = state(S.steps.length - 1); figShow(null); noMission(); if (sc) show(state(0).sc || sc); await scene(STORY[S.t + '|시작']); }
      for (;;) { const { f, sc } = state(i); figShow(f); if (sc) { show(sc); mission(sc); } else noMission();
        SAVE.pos = { i: idx, st: i }; save();
        const a = await say({ who: '햄토리', mood: i === 0 ? '설명' : null, text: S.steps[i][0] }, { back: !(idx === 0 && i === 0), prog: `설명 ${i + 1}/${S.steps.length}${sc ? ' · 3D는 끌어서 돌리고 버튼으로 조작' : ''}` });
        if (a === 'prev') { if (i > 0) { i--; continue; } back = true; break; } if (i < S.steps.length - 1) { i++; continue; } break; }
      if (back) { idx = Math.max(0, idx - 1); st = 0; continue; }
      figShow(null);
      for (const q of S.ask || []) await askStory(q);
      if (S.blanks && S.blanks.length) { await say({ who: '햄토리', mood: '기쁨', text: '⚡ <b>빈칸 러시!</b> 학습지 빈칸이야. 빨리 맞히면 보너스!' }); subOff(); await blanks(S.blanks, S.t); }
      SAVE.pos = { i: idx, st: 900 }; save();
    }
    const ps = (S.probs || []).filter(id => Q[id]);
    if (ps.length) { await say({ who: '햄토리', mood: '놀람', text: `📁 <b>사건 파일 ${ps.length}개</b> 도착! 근데 문제 보기 전에… 이게 <b>무슨 반응인지</b>부터 알아야 풀려. 풀이 개념 먼저!` }); subOff();
      if (await cardsPage(S.t) === 'menu') return menu();
      for (const id of ps) { const r = await prob(id); if (r === 'menu') return menu(); } card.hidden = true; }
    if (STORY[S.t + '|끝']) await scene(STORY[S.t + '|끝']);
    idx++; st = 0; SAVE.pos = { i: idx, st: 0 }; save();
  }
  SAVE.pos = null; save(); confetti(90); sfx.win(); subOff(); menu();
}
function ask([q, o, a, why], t) { return new Promise(res => { const ord = shuffle(o.map((_, k) => k)); head.innerHTML = `<b>✋ 확인</b><span>${t}</span>`;
  body.innerHTML = `<p class="q">${q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join('')}</div><div class="fb"></div>`; setFoot(''); let tries = 0;
  body.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = body.querySelector('.fb');
    if (k === a || ++tries >= 2) { hit(k === a, b); body.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); }); if (k !== a) b.classList.add('no'); fb.className = 'fb ' + (k === a ? 'ok' : 'no'); fb.innerHTML = `${k === a ? '⭕ 맞아!' : `정답은 <b>${o[a]}</b>`} <span>${why}</span>`; setFoot('<button class="pri" data-b="next">다음 ▶</button>'); wait().then(res); }
    else { hit(false); b.classList.add('no'); b.disabled = true; fb.className = 'fb no'; fb.innerHTML = '다시 한 번! 위 설명을 떠올려 봐.'; } }; }); }

/* ── 교과서 문제 ── */
function prob(id) { return new Promise(async res => { const P = Q[id]; if (!P) return res(); head.innerHTML = `<b>📝 교과서 문제</b><span>${P.src}</span>`; card.hidden = false; layout();
  const SV = window.CHEMSOLVE, sx = SECS.find(x => (x.s.probs || []).includes(id)), pa = SV ? SV.probHTML(id, sx ? sx.s.t : '') : '';
  const top = `${pa}${fig(P.img)}<div class="tools"><button data-ink>✍️ 필기</button><button data-clr>지우기</button><button data-skip>정답만 보기</button></div>`;
  let right = true, fin = false; const done = (ok) => { if (fin) return; fin = true; if (ok) { gain(30); toast('💯 <b>완벽!</b> 문제 클리어'); confetti(24); } SAVE.res[id] = ok ? 1 : 0; save(); setFoot(`<button data-b="menu">☰ 메뉴</button><button class="pri" data-b="next">다음 ▶</button>`); wait().then(a => res(a === 'menu' ? 'menu' : null)); };
  const answer = () => `<div class="ans">✅ <b>정답</b> ${P.ans || (P.o ? P.o[P.a] : '')}</div>`;
  setFoot('');
  if (P.type === 'bogi') { body.innerHTML = top + `<p class="q">보기를 하나씩 판단해 봐.</p>` + P.items.map(([l, t], k) => `<div class="bg" data-i="${k}"><p><b>${l}.</b> ${t}</p><div class="ox"><button data-v="1">⭕ 맞다</button><button data-v="0">❌ 틀리다</button></div><div class="why"></div></div>`).join('') + '<div class="end"></div>';
    let left = P.items.length; body.querySelectorAll('.bg').forEach(el => el.querySelector('.ox').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const [, , truth, why] = P.items[+el.dataset.i]; const ok = (b.dataset.v === '1') === truth; if (!ok) right = false; hit(ok, b, 5);
      el.querySelectorAll('button').forEach(x => { x.disabled = true; if ((x.dataset.v === '1') === truth) x.classList.add('ok'); }); if (!ok) b.classList.add('no'); el.querySelector('.why').innerHTML = `${ok ? '⭕' : '❌'} ${truth ? '맞는 말' : '틀린 말'} — ${why}`; if (--left === 0) { body.querySelector('.end').innerHTML = answer(); done(right); } }); }
  else if (P.type === 'mc') { const ord = shuffle(P.o.map((_, k) => k)); body.innerHTML = top + `<p class="q">${P.q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${P.o[k]}</button>`).join('')}</div><div class="fb"></div>`; let tries = 0;
    body.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = body.querySelector('.fb'); if (k !== P.a) { right = false; tries++; hit(false); b.classList.add('no'); b.disabled = true; if (tries < 2) { fb.className = 'fb no'; fb.innerHTML = '다시 한 번!'; return; } }
      if (k === P.a) hit(true, b); body.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === P.a) x.classList.add('ok'); }); fb.className = 'fb ' + (k === P.a ? 'ok' : 'no'); fb.innerHTML = `${k === P.a ? '⭕ 정답!' : `정답은 <b>${P.o[P.a]}</b>`} <span>${P.ex}</span>`; done(right); }; }
  else { body.innerHTML = top + '<p class="q">사진의 문제를 먼저 직접 풀어 봐 (✍️ 필기). 막히면 한 단계씩 같이 풀자.</p><div class="steps"></div><div class="end"></div>';
    const box = body.querySelector('.steps'); for (let s = 0; s < P.steps.length; s++) { const [q, o, a, why] = P.steps[s]; const ord = shuffle(o.map((_, k) => k)); const el = document.createElement('div'); el.className = 'gs'; el.innerHTML = `<p><b>${s + 1}.</b> ${q}</p><div class="opts">${ord.map(k => `<button data-k="${k}">${o[k]}</button>`).join('')}</div><div class="fb"></div>`; box.appendChild(el); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await new Promise(r2 => { let tries = 0; el.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, fb = el.querySelector('.fb'); if (k !== a) { right = false; tries++; hit(false); b.classList.add('no'); b.disabled = true; if (tries < 2) { fb.className = 'fb no'; fb.innerHTML = '음, 다시 생각해 봐.'; return; } } else hit(true, b, 5);
        el.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (+x.dataset.k === a) x.classList.add('ok'); }); fb.className = 'fb ' + (k === a ? 'ok' : 'no'); fb.innerHTML = `${k === a ? '⭕' : `→ <b>${o[a]}</b>`} <span>${why}</span>`; r2(); }; }); }
    body.querySelector('.end').innerHTML = answer(); body.querySelector('.end').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); done(right); }
  body.querySelector('[data-skip]').onclick = () => { if (!body.querySelector('.ans')) { body.insertAdjacentHTML('beforeend', answer() + (P.type === 'bogi' ? P.items.map(([l, t, v, w]) => `<p class="why">${l}. ${v ? '⭕' : '❌'} ${w}</p>`).join('') : P.type === 'steps' ? P.steps.map(([q, o, a, w], i) => `<p class="why">${i + 1}. ${q} → <b>${o[a]}</b> ${w}</p>`).join('') : '')); done(false); } };
  inkSetup(); }); }

/* ── 필기: [✍️ 필기] 켜면 손가락·펜·마우스 다 쓰기, 두 손가락으로 스크롤. 꺼져 있어도 펜(S펜)은 바로 쓰기 ──
   잉크는 사진(흰 바탕)·카드(어두운 바탕) 둘 다 잘 보이는 색, 풀이가 아래로 늘어나면 캔버스도 같이 늘어남 */
const INKC = ['#ff3b6b', '#3b8bff', '#1fbf6a'];
let ink = null, inkOn = false, inkCol = 0; try { inkOn = localStorage.getItem('chem_ink') === '1'; } catch (e) { }
function inkCanvas() { if (ink && ink.cv.isConnected) return ink; const cv = document.createElement('canvas'); cv.className = 'ink'; body.appendChild(cv); ink = { cv, g: cv.getContext('2d'), r: Math.min(2, devicePixelRatio || 1), w: 0, h: 0 }; inkFit(); return ink; }
function inkFit() { const w = body.clientWidth, h = Math.max(body.scrollHeight, body.clientHeight); if (ink.w === w && ink.h >= h) return;
  let snap = null; if (ink.w) { snap = document.createElement('canvas'); snap.width = ink.cv.width; snap.height = ink.cv.height; snap.getContext('2d').drawImage(ink.cv, 0, 0); }
  ink.cv.width = w * ink.r; ink.cv.height = h * ink.r; ink.cv.style.width = w + 'px'; ink.cv.style.height = h + 'px'; if (snap) ink.g.drawImage(snap, 0, 0); ink.w = w; ink.h = h; }
function inkUI() { const b = body.querySelector('[data-ink]'); if (!b) return; b.classList.toggle('on', inkOn); b.innerHTML = inkOn ? '✍️ 필기 중 <small>(두 손가락=스크롤)</small>' : '✍️ 필기'; body.classList.toggle('inking', inkOn);
  const c = body.querySelector('[data-col]'); if (c) c.innerHTML = `<i style="display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-2px;background:${INKC[inkCol]}"></i> 색`; }
function inkSetup() { const b = body.querySelector('[data-ink]'), clr = body.querySelector('[data-clr]'); if (!b) return; ink = null;
  if (!body.querySelector('[data-col]')) clr.insertAdjacentHTML('beforebegin', '<button data-col></button>');
  b.onclick = () => { inkOn = !inkOn; try { localStorage.setItem('chem_ink', inkOn ? '1' : '0'); } catch (e) { } if (inkOn) inkCanvas(); inkUI(); };
  body.querySelector('[data-col]').onclick = () => { inkCol = (inkCol + 1) % INKC.length; inkUI(); };
  clr.onclick = () => { if (ink) ink.g.clearRect(0, 0, ink.cv.width, ink.cv.height); }; if (inkOn) inkCanvas(); inkUI(); }
const TP = new Map(); let stroke = null, sy = null; const avgY = () => [...TP.values()].reduce((a, b) => a + b, 0) / TP.size;
body.addEventListener('pointerdown', e => { if (!body.querySelector('[data-ink]')) return; if (!inkOn && e.pointerType !== 'pen') return; if (e.target.closest('button,a,input,select,label')) return;
  if (e.pointerType === 'touch') { TP.set(e.pointerId, e.clientY); if (TP.size >= 2) { stroke = null; sy = avgY(); return; } }
  inkCanvas(); inkFit(); const r = ink.cv.getBoundingClientRect(); stroke = { id: e.pointerId, x: (e.clientX - r.left) * ink.r, y: (e.clientY - r.top) * ink.r }; e.preventDefault(); try { body.setPointerCapture(e.pointerId); } catch (er) { } });
body.addEventListener('pointermove', e => { if (TP.has(e.pointerId)) TP.set(e.pointerId, e.clientY); if (TP.size >= 2 && sy != null) { const a = avgY(); body.scrollTop -= a - sy; sy = a; return; }
  if (!stroke || e.pointerId !== stroke.id || !ink) return; const r = ink.cv.getBoundingClientRect(), x = (e.clientX - r.left) * ink.r, y = (e.clientY - r.top) * ink.r, g = ink.g;
  const pr = e.pointerType === 'pen' && e.pressure ? e.pressure : .5; g.strokeStyle = INKC[inkCol]; g.lineWidth = (1.6 + pr * 2.6) * ink.r; g.lineCap = g.lineJoin = 'round';
  g.beginPath(); g.moveTo(stroke.x, stroke.y); g.lineTo(x, y); g.stroke(); stroke.x = x; stroke.y = y; e.preventDefault(); });
const up = e => { TP.delete(e.pointerId); if (TP.size < 2) sy = null; if (stroke && e.pointerId === stroke.id) stroke = null; };
body.addEventListener('pointerup', up); body.addEventListener('pointercancel', up);

/* ── 메뉴 ── */
/* 문제풀이 개념 카드 (절마다 문제 들어가기 전에, 메뉴에서도 따로 볼 수 있음) */
function cardsPage(t, all) { return new Promise(res => { const SV = window.CHEMSOLVE; if (!SV) return res(); const ids = all ? Object.keys(SV.CARDS) : SV.secCards(t); if (!ids.length) return res();
  card.hidden = false; layout(); head.innerHTML = `<b>📚 문제풀이 개념</b><span>${all ? '전체 카드' : t}</span>`; body.scrollTop = 0;
  body.innerHTML = `<p class="hint">문제를 보면 먼저 <b>"이게 무슨 반응이지?"</b> → 카드의 <b>풀이 순서</b>대로. 함정은 시험에 진짜 나옴.</p>` + ids.map((c, i) => SV.cardHTML(c, !all && i === 0)).join('');
  setFoot(all ? '<button class="pri" data-b="menu">☰ 메뉴</button>' : '<button data-b="menu">☰ 메뉴</button><button class="pri" data-b="next">알겠어, 문제 풀기 ▶</button>'); wait().then(res); }); }
async function solveList(ids, title) { $('#menu').hidden = true; $('#top').hidden = false; topbar(title); for (const id of ids) { const r = await prob(id); if (r === 'menu') break; } menu(); }
function menu() { bossTok = null; noMission(); subOff(); HAM.feel('joy', 1500); card.hidden = true; $('#top').hidden = true; layout(); show('maxwell'); const m = $('#menu'); m.hidden = false; layout();
  const cur = SAVE.pos ? SECS[Math.min(SAVE.pos.i, SECS.length - 1)] : null; const allQ = Object.keys(Q); const wrong = allQ.filter(id => SAVE.res[id] === 0); const doneN = allQ.filter(id => id in SAVE.res).length;
  const unitQ = u => SECS.filter(x => x.u.id === u).flatMap(x => x.s.probs || []);
  m.innerHTML = `<div class="mc"><h1>햄토리와 시험 전날 밤 <small>화학 Ⅲ 화학 변화의 자발성 · Ⅳ 반응 속도 · 🐹 햄토리랑 사건을 풀면서 공부하기</small></h1>
   <button class="big pri" data-go>${cur ? '▶ 이어서 — ' + cur.label : '▶ 처음부터 시작'}</button>
   <div class="row"><select data-sec>${SECS.map((x, i) => `<option value="${i}" ${cur && x === cur ? 'selected' : ''}>${x.label}</option>`).join('')}</select><button data-from>여기부터</button></div>
   <h3>📝 교과서 문제 <small>${doneN}/${allQ.length} 풀이</small></h3>
   <div class="grid"><button data-u="III">Ⅲ 문제 전부 (${unitQ('III').length})</button><button data-u="IV">Ⅳ 문제 전부 (${unitQ('IV').length})</button>${wrong.length ? `<button data-w>🔁 틀린 문제 (${wrong.length})</button>` : ''}</div>
   <div class="grid" style="margin-top:6px"><button data-cards>📚 문제풀이 개념 카드 <small>무슨 반응인지·풀이 순서·함정</small></button></div>
   <h3>⚡ 스피드 런 <small>90초 · ❤️×3 · 확인 질문 + 빈칸 총출동</small></h3>
   <div class="grid"><button data-boss="III">Ⅲ 보스전 <small>최고 ${(SAVE.best || {}).III || 0}</small></button><button data-boss="IV">Ⅳ 보스전 <small>최고 ${(SAVE.best || {}).IV || 0}</small></button></div>
   <p class="tip">🎮 3D 미션 ${Object.keys(SAVE.mis || {}).length} / ${Object.keys(MIS).length} 달성 · Lv ${lvl()} · ⭐ ${SAVE.xp || 0} XP</p>
   <div class="row"><button data-home>🏠 홈</button></div>
   <p class="tip">왼쪽 3D는 끌어서 돌리고 버튼·슬라이더로 직접 조작할 수 있어. 교과서 그림은 🔍로만 커져 (실수로 안 커짐). 문제에서 ✍️ 필기를 켜면 손가락·펜으로 쓰고 두 손가락으로 스크롤 (S펜은 필기 안 켜도 써짐).</p></div>`;
  m.onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.go !== undefined) return run(SAVE.pos || { i: 0, st: 0 });
    if (b.dataset.from !== undefined) return run({ i: +m.querySelector('[data-sec]').value, st: 0 });
    if (b.dataset.u) return solveList(unitQ(b.dataset.u), b.textContent);
    if (b.dataset.boss) return boss(b.dataset.boss);
    if (b.dataset.cards !== undefined) { m.hidden = true; $('#top').hidden = false; topbar('📚 문제풀이 개념 카드'); return cardsPage('', true).then(() => menu()); }
    if (b.dataset.w !== undefined) return solveList(wrong, '틀린 문제 다시');
    if (b.dataset.home !== undefined) location.href = 'index.html'; };
}
$('#top button').onclick = () => menu();
menu();
