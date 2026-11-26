/* 응원 친구: 사용자가 이 기기에서 직접 고른 MMD 모델(zip)을 3D로 띄워 응원·힌트를 준다.
   - 모델 파일은 사이트(레포)에 올리지 않는다: 제작자 규약을 확인하지 못했으므로, 기기 브라우저(IndexedDB)에만 저장.
   - 4096 텍스처는 가져올 때 한 번 1024로 줄여 저장 → 폰 메모리 보호.
   - 물리(머리카락·치마)는 끄고, 뼈를 직접 돌려 숨쉬기·끄덕·만세·손 흔들기·화이팅, 표정 모프로 웃음·쑥스러움·곤란함. */
import * as THREE from 'three';
import { MMDLoader } from '../vendor/jsm/loaders/MMDLoader.js';
import { unzip } from '../vendor/jsm/libs/fflate.module.js';

const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const SS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
let cfg = { on: true, big: false, voice: false }; try { Object.assign(cfg, JSON.parse(LS('ko_buddy') || '{}')); } catch (e) { }
const saveCfg = () => SS('ko_buddy', JSON.stringify(cfg));

/* ── IndexedDB ── */
const db = () => new Promise((res, rej) => { const r = indexedDB.open('ko_buddy', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idb = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction('f', mode), q = fn(tx.objectStore('f')); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); }); };
const getModel = () => idb('readonly', s => s.get('model')).catch(() => null);
const putModel = v => idb('readwrite', s => s.put(v, 'model'));
const delModel = () => idb('readwrite', s => s.delete('model'));

/* ── 화면 ── */
const el = document.createElement('div'); el.id = 'buddy'; el.hidden = true;
el.innerHTML = `<div class="bd-bubble" hidden></div><div class="bd-stage"><canvas></canvas><div class="bd-msg"></div></div><div class="bd-bar"><button data-b="size" title="크기">⤢</button><button data-b="voice" title="목소리">🔇</button><button data-b="hide" title="숨기기">✕</button></div>`;
const btn = document.createElement('button'); btn.id = 'buddyBtn'; btn.textContent = '🌸';
const sheet = document.createElement('div'); sheet.id = 'buddySheet'; sheet.hidden = true;
sheet.innerHTML = `<div class="bs-box"><h3>🌸 응원 친구 불러오기</h3>
  <p>받은 모델 <b>zip 파일</b>을 골라 주세요. (예: SakurabaEma_ByPOWER_v1_0.zip)</p>
  <p class="tip">모델 파일은 <b>이 기기 브라우저에만</b> 저장되고 사이트에는 올라가지 않아요. 제작자 이용 규약을 아직 확인하지 못해서, 공개된 곳에 올리지 않는 방식으로 했어요. 기기마다 한 번씩만 고르면 돼요.</p>
  <label class="bs-file">📂 zip 파일 고르기<input type="file" accept=".zip,application/zip"></label>
  <div class="bs-prog"></div>
  <div class="bs-row"><button data-s="close">닫기</button><button data-s="del">저장된 모델 지우기</button></div></div>`;
document.body.append(el, btn, sheet);
const cv = el.querySelector('canvas'), bub = el.querySelector('.bd-bubble'), msg = el.querySelector('.bd-msg');

function layout() { el.classList.toggle('bdbig', cfg.big); el.querySelector('[data-b=voice]').textContent = cfg.voice ? '🔊' : '🔇'; resize(); }
let hasModel = false, ready = false;
function showState() { el.hidden = !(hasModel && cfg.on); btn.hidden = hasModel && cfg.on; btn.textContent = hasModel ? '🌸' : '🌸 응원 친구'; btn.classList.toggle('pill', !hasModel); layout(); }

/* ── 3D ── */
let R = null, scene, cam, mesh = null, B = {}, rest = {}, M = {}, raf = 0, last = 0;
function initGL() { if (R) return true; try { R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { msg.textContent = '이 기기에서는 3D를 그릴 수 없어요'; return false; }
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0x000000, 0);
  scene = new THREE.Scene(); scene.add(new THREE.AmbientLight('#ffffff', 2.2)); const d = new THREE.DirectionalLight('#ffffff', 1.4); d.position.set(-2, 4, 6); scene.add(d);
  cam = new THREE.PerspectiveCamera(22, 1, 1, 200); resize(); return true; }
function resize() { if (!R) return; const w = cv.clientWidth || 120, h = cv.clientHeight || 170; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); frame(); if (ready) R.render(scene, cam); }
function frame() { if (!cam) return; cam.position.set(0, 15.2, 27); cam.lookAt(0, 14.7, 0); }

const norm = p => decodeURIComponent(p).replace(/\\/g, '/').replace(/^.*?buddymodel\//, '').toLowerCase();
async function loadModel(rec) { if (!initGL()) return; msg.textContent = '불러오는 중…'; const urls = {};
  for (const [k, blob] of Object.entries(rec.files)) urls[k.toLowerCase()] = URL.createObjectURL(blob);
  const mgr = new THREE.LoadingManager(); mgr.setURLModifier(u => { if (/^(blob:|data:)/.test(u)) return u; const k = norm(u); return urls[k] || urls[k.replace(/^.*\//, 'textures/')] || u; });
  const loader = new MMDLoader(mgr);
  try { mesh = await loader.loadAsync('buddymodel/' + rec.pmx); } catch (e) { console.error(e); msg.textContent = '모델을 열지 못했어요'; return; }
  mesh.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); scene.add(mesh);
  for (const b of mesh.skeleton.bones) { B[b.name] = b; rest[b.name] = b.quaternion.clone(); }
  M = mesh.morphTargetDictionary || {}; ready = true; msg.textContent = ''; say(pick(L.hello), 'wave', 'smile'); loop(0); }

/* ── 움직임 ── */
const E = new THREE.Euler(), Q = new THREE.Quaternion();
function rot(name, x, y, z) { const b = B[name]; if (!b) return; E.set(x, y, z, 'XYZ'); Q.setFromEuler(E); b.quaternion.copy(rest[name]).multiply(Q); }
const mood = { face: 'neutral', until: 0 }, act = { name: 'idle', t0: 0, dur: 0 }; let talkUntil = 0, mw = {};
const FACES = { neutral: {}, smile: { 'Ex_笑顔': 1 }, shy: { 'Ex_照れ': 1 }, trouble: { 'Ex_困る': 1 }, surprise: { 'Ex_びっくり': 1 }, sad: { 'Ex_悲しい': .7 }, wink: { 'ウィンク': 1, '口角上げ': .6 } };
function morph(name, w) { const i = M[name]; if (i == null) return; mw[name] = w; }
/* 자세: 팔은 "윗팔·아래팔이 향할 방향"을 정해 그 방향으로 뼈를 겨눔(모델 기준: +x = 에마의 왼쪽, +y 위, +z 앞).
   머리·몸·뛰기는 값으로. 모두 목표값을 부드럽게 따라감 */
const V3 = THREE.Vector3, v = (x, y, z) => new V3(x, y, z).normalize(), mir = d => new V3(-d.x, d.y, d.z);
const ARM = { L: ['左腕', '左ひじ', '左手首'], R: ['右腕', '右ひじ', '右手首'] }, restDir = {}, cur = {};
const IDLE = { uL: v(.22, -1, .06), fL: v(.12, -1, .16) };
function poseOf(on, t) { /* 왼팔(L) 기준 방향, 오른팔은 따로 주지 않으면 거울 */
  let uL = IDLE.uL, fL = IDLE.fL, uR = null, fR = null, H = { hx: 0, hy: 0, hz: 0, bz: 0, hop: 0 };
  if (on === 'cheer') { const w = Math.sin(t * 9) * .18; uL = v(.6, .8, .12); fL = v(.25 + w, 1, .1); uR = mir(v(.6, .8, .12)); fR = mir(v(.25 - w, 1, .1)); H = { hx: -.12, hy: 0, hz: 0, bz: 0, hop: Math.abs(Math.sin(t * 7)) * .35 }; }
  if (on === 'wave') { uR = v(-1, .12, .2); fR = v(-.15 + Math.sin(t * 10) * .4, 1, .2); H = { hx: 0, hy: -.08, hz: .13, bz: -.03, hop: 0 }; }
  if (on === 'fight') { const b = Math.abs(Math.sin(t * 8)); uL = v(.4, -.85, .4); fL = v(-.2, .85, .55); H = { hx: b * .1, hy: 0, hz: 0, bz: 0, hop: b * .15 }; }
  if (on === 'shy') { uL = v(.2, -1, .3); fL = v(-.5, -.3, .8); H = { hx: .16, hy: 0, hz: -.1, bz: Math.sin(t * 2.4) * .05, hop: 0 }; }
  if (on === 'think') { uR = v(-.3, -.85, .45); fR = v(.45, .85, .35); H = { hx: .05, hy: 0, hz: .2, bz: .05, hop: 0 }; }
  if (on === 'nod') H.hx = Math.abs(Math.sin(t * 6)) * .26;
  return { uL, fL, uR: uR || mir(uL), fR: fR || mir(fL), ...H }; }
const qp = new THREE.Quaternion(), qw = new THREE.Quaternion();
function aim(name, dir) { const b = B[name]; if (!b || !restDir[name]) return; b.parent.updateWorldMatrix(true, false); b.parent.getWorldQuaternion(qp); qw.setFromUnitVectors(restDir[name], dir); b.quaternion.copy(qp.invert()).multiply(qw); }
function initArms() { mesh.updateMatrixWorld(true); const wp = n => B[n].getWorldPosition(new V3());
  for (const s of ['L', 'R']) { const [a, e, h] = ARM[s]; if (!B[a] || !B[e] || !B[h]) continue; restDir[a] = wp(e).sub(wp(a)).normalize(); restDir[e] = wp(h).sub(wp(e)).normalize(); }
  Object.assign(cur, poseOf('idle', 0)); for (const k of ['uL', 'fL', 'uR', 'fR']) cur[k] = cur[k].clone(); }
function setPose(t, a) { const now = performance.now() / 1000, u = act.dur ? (now - act.t0) / act.dur : 1, on = u < 1 ? act.name : 'idle';
  if (!cur.uL) initArms(); const T = poseOf(on, t), k = Math.min(1, a * 7);
  for (const key of ['uL', 'fL', 'uR', 'fR']) cur[key].lerp(T[key], k).normalize();
  for (const key of ['hx', 'hy', 'hz', 'bz', 'hop']) cur[key] = (cur[key] || 0) + (T[key] - (cur[key] || 0)) * k;
  const br = Math.sin(t * 1.6) * .025, sway = Math.sin(t * .7) * .03;
  rot('上半身', br, 0, sway + cur.bz); rot('上半身2', br * .6, 0, 0);
  const hx = cur.hx + Math.sin(t * .9) * .03, hy = cur.hy + Math.sin(t * .5) * .06, hz = cur.hz + Math.sin(t * .63) * .04;
  rot('首', hx * .4, hy * .4, hz * .4); rot('頭', hx * .6, hy * .6, hz * .6);
  aim('左腕', cur.uL); aim('左ひじ', cur.fL); aim('右腕', cur.uR); aim('右ひじ', cur.fR);
  const c = B['センター']; if (c) { c.userData.y0 ??= c.position.y; c.position.y = c.userData.y0 + cur.hop; }
  /* 표정 */ for (const key in mw) mw[key] = 0; const f = FACES[now < mood.until ? mood.face : 'neutral'] || {}; for (const [key, w] of Object.entries(f)) morph(key, w);
  if (!f['Ex_笑顔'] && !f['ウィンク']) morph('まばたき', (t % 3.7) < .13 ? 1 : 0);
  if (now < talkUntil && !f['Ex_笑顔']) morph(['あ', 'い', 'う', 'え', 'お'][Math.floor(t * 9) % 5], .35 + .3 * Math.abs(Math.sin(t * 17)));
  else if (now < talkUntil) morph('あ', .3 * Math.abs(Math.sin(t * 15)));
  const inf = mesh.morphTargetInfluences; for (const [key, i] of Object.entries(M)) inf[i] += ((mw[key] || 0) - inf[i]) * Math.min(1, a * 12); }
function loop(ts) { raf = requestAnimationFrame(loop); if (el.hidden || document.hidden || !ready) return; const dt = Math.min(.1, (ts - last) / 1000); if (dt < 1 / 40) return; last = ts; setPose(ts / 1000, dt); R.render(scene, cam); }
function doAct(name, face, dur = 1.8) { act.name = name; act.t0 = performance.now() / 1000; act.dur = dur; if (face) { mood.face = face; mood.until = act.t0 + dur + 1.2; } }

/* ── 말풍선 · 목소리 ── */
let bubT = 0;
function say(text, action, face) { if (!text) return; if (action) doAct(action, face); else if (face) { mood.face = face; mood.until = performance.now() / 1000 + 3; }
  const target = el.hidden ? null : bub; const box = target || toastBox(); box.innerHTML = text; box.hidden = false; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  talkUntil = performance.now() / 1000 + Math.min(4, .9 + text.replace(/<[^>]+>/g, '').length * .06); clearTimeout(bubT); bubT = setTimeout(() => { box.hidden = true; }, 3800 + text.length * 45);
  if (cfg.voice && 'speechSynthesis' in window) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, '').replace(/[🌸✨💪📖⭕❌☕🎉👍🔥💡]/gu, '')); u.lang = 'ko-KR'; u.pitch = 1.45; u.rate = 1.05; speechSynthesis.speak(u); } catch (e) { } } }
let tb = null; function toastBox() { if (!tb) { tb = document.createElement('div'); tb.className = 'bd-bubble solo'; document.body.appendChild(tb); } return tb; }
const pick = a => a[Math.floor(Math.random() * a.length)];
const cut = (s, n = 70) => { s = String(s || '').replace(/<[^>]+>/g, ''); return s.length > n ? s.slice(0, n) + '…' : s; };
const L = {
  hello: ['왔구나! 오늘도 같이 해 보자 🌸', '에마가 옆에서 응원할게!', '준비됐어? 한 지문씩 차근차근 가자!'],
  read: ['천천히 읽어 봐. 핵심어에 동그라미 치는 거 잊지 말고!', '접속어(따라서·반면·다만)에 네모 치면서 읽으면 구조가 보여!', '읽기 시간도 재 볼래? ⏱ 버튼!'],
  note: ['문단마다 <b>출제 포인트</b>랑 <b>함정</b>은 꼭 보고 가자!', '구조도를 손으로 한 번 따라 그려 보면 머리에 쏙 들어와!'],
  anim: ['움직이는 그림으로 보면 더 잘 들어올 거야!', '마지막 단계 실험실에서 직접 만져 봐!'],
  ox: ['O/X는 근거 문장을 떠올리면서 풀자!', '헷갈리면 지문으로 가서 확인해도 돼!'],
  blank: ['먼저 머릿속으로 채우고 눌러 보기!', '펜으로 빈칸에 써 보고 확인해도 좋아!'],
  quiz: ['선지마다 지문 근거에 밑줄 치면서 풀어 보자!', '할 수 있어! 💪'],
  right: ['정답! 대단해 ✨', '역시! 근거 정확해!', '좋아, 이 기세로 가자!', '완벽해! 🎉', '오~ 이제 완전 내 거네?'],
  streak: ['연속 정답 {n}개! 천재 아니야?!', '{n}연속! 에마 감동했어…!'],
  wrong: ['괜찮아, 틀린 건 다시 보면 돼.', '아깝다! 다음엔 꼭 맞힐 거야.', '틀려도 괜찮아. 지금 알았으니까 시험에선 안 틀려!'],
  tap: ['에헤헤… 공부하다 말고 날 찌르면 어떡해~', '시험 범위 다 끝내면 같이 축하하자!', '모르는 게 나오면 🔍 분석 탭부터 보자!', '오늘 목표는 지문 몇 개? 같이 정해 볼까?', '물 마셨어? 뇌도 물이 필요하대!'],
  rest: ['벌써 {m}분이나 했어! 5분만 쉬고 오자 ☕', '{m}분 집중했네, 대단해! 잠깐 스트레칭~'],
  idle: ['어디 갔어…? 에마 기다리는 중!', '잠깐 쉬는 중이야? 돌아오면 이어서 하자!'],
  late: ['벌써 늦었어… 너무 무리하지는 마.', '밤늦게까지 고생 많아. 조금만 더 하고 자자!'],
  model: ['예시 답이랑 내 답을 비교해 봐!', '핵심 단어가 들어갔는지 체크!'],
  done: ['이 지문 끝! 진짜 수고했어 🎉', '다음 지문도 같이 가자!']
};

/* ── 공부 이벤트에 반응 ── */
let streak = 0, lastRoute = 0, start = Date.now(), lastAct = Date.now(), restN = 1, idleSaid = false;
document.addEventListener('ko:route', e => { if (!ready) return; const { tab } = e.detail || {}; const now = Date.now(); if (now - lastRoute < 6000) return; lastRoute = now;
  const p = e.detail && e.detail.p; if (tab === 'read' && p && Math.random() < .5) say(`이 지문 한 줄 요약 힌트: ${cut(p.theme, 60)}`, 'nod'); else if (L[tab]) say(pick(L[tab]), tab === 'quiz' ? 'fight' : 'nod', 'smile'); });
document.addEventListener('ko:answer', e => { if (!ready) return; const d = e.detail || {}; if (d.ok) { streak++; if (streak >= 3 && streak % 3 === 0) say(pick(L.streak).replace('{n}', streak), 'cheer', 'smile'); else say(pick(L.right), Math.random() < .5 ? 'cheer' : 'nod', 'smile'); }
  else { streak = 0; say(`${pick(L.wrong)}${d.why ? `<br><small>💡 ${cut(d.why, 80)}</small>` : ''}`, 'fight', 'trouble'); } });
document.addEventListener('ko:model', () => { if (ready) say(pick(L.model), 'think'); });
document.addEventListener('ko:done', () => { if (ready) say(pick(L.done), 'cheer', 'smile'); });
['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => { lastAct = Date.now(); idleSaid = false; }, true));
setInterval(() => { if (!ready || el.hidden && !cfg.on) return; const m = Math.floor((Date.now() - start) / 60000);
  if (m >= 25 * restN) { restN++; say(pick(L.rest).replace('{m}', m), 'wave', 'smile'); }
  if (!idleSaid && Date.now() - lastAct > 150000) { idleSaid = true; say(pick(L.idle), 'wave'); } }, 15000);
cv.addEventListener('click', () => { if (!ready) return; const h = new Date().getHours(); if ((h >= 23 || h < 4) && Math.random() < .4) return say(pick(L.late), 'nod', 'trouble'); const r = Math.random(); say(pick(L.tap), r < .33 ? 'shy' : r < .66 ? 'wave' : 'nod', r < .33 ? 'shy' : 'smile'); });

/* ── 버튼 ── */
el.querySelector('.bd-bar').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const a = b.dataset.b;
  if (a === 'size') { cfg.big = !cfg.big; } if (a === 'voice') { cfg.voice = !cfg.voice; if (!cfg.voice && 'speechSynthesis' in window) speechSynthesis.cancel(); } if (a === 'hide') { cfg.on = false; } saveCfg(); showState(); });
btn.addEventListener('click', async () => { if (hasModel) { cfg.on = true; saveCfg(); showState(); if (!ready && !mesh) boot(); else if (ready) say(pick(L.hello), 'wave', 'smile'); } else sheet.hidden = false; });
sheet.addEventListener('click', async e => { const b = e.target.closest('[data-s]'); if (!b) return; if (b.dataset.s === 'close') sheet.hidden = true;
  if (b.dataset.s === 'del' && confirm('이 기기에 저장된 응원 친구 모델을 지울까요?')) { await delModel(); hasModel = false; location.reload(); } });
sheet.querySelector('input').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const pg = sheet.querySelector('.bs-prog');
  try { pg.textContent = '압축 푸는 중… (조금 걸려요)'; const rec = await importZip(new Uint8Array(await f.arrayBuffer()), s => pg.textContent = s); await putModel(rec); pg.textContent = '완료! 🌸'; hasModel = true; cfg.on = true; saveCfg(); sheet.hidden = true; showState(); boot(rec); }
  catch (er) { console.error(er); pg.textContent = '❌ ' + (er.message || er); } });

/* zip → { pmx, files: {상대경로: Blob} } (텍스처는 1024로 줄임) */
function importZip(u8, prog) { return new Promise((res, rej) => unzip(u8, async (err, files) => { if (err) return rej(new Error('zip을 열 수 없어요'));
  try { const names = Object.keys(files), pmx = names.find(n => /\.pmx$/i.test(n)); if (!pmx) throw new Error('zip 안에 .pmx 모델이 없어요');
    const base = pmx.replace(/[^/]*$/, ''), out = {}, imgs = names.filter(n => n.startsWith(base) && /\.(png|jpe?g|bmp|tga|spa|sph)$/i.test(n));
    out[pmx.slice(base.length)] = new Blob([files[pmx]]); let i = 0;
    for (const n of imgs) { prog(`그림 줄이는 중… ${++i}/${imgs.length}`); out[n.slice(base.length)] = await shrink(new Blob([files[n]], { type: /png$/i.test(n) ? 'image/png' : /jpe?g$/i.test(n) ? 'image/jpeg' : '' }), n); }
    res({ pmx: pmx.slice(base.length), files: out, at: Date.now() }); } catch (er) { rej(er); } })); }
async function shrink(blob, n) { if (!/\.(png|jpe?g)$/i.test(n)) return blob; try { const bm = await createImageBitmap(blob); const s = Math.min(1, 1024 / Math.max(bm.width, bm.height)); if (s >= 1) { bm.close && bm.close(); return blob; }
    const c = document.createElement('canvas'); c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); bm.close && bm.close();
    return await new Promise(r => c.toBlob(b => r(b || blob), 'image/png')); } catch (e) { return blob; } }

async function boot(rec) { rec = rec || await getModel(); if (!rec) return; hasModel = true; showState(); if (!mesh) loadModel(rec); }
(async () => { const rec = await getModel(); hasModel = !!rec; showState(); if (rec && cfg.on) setTimeout(() => boot(rec), 600); })();
addEventListener('resize', () => setTimeout(resize, 100));
window.KOBuddy = { say, doAct, get ready() { return ready; } };
