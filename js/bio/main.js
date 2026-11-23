/* 미토: 세포 속 발전소 — 플레이어 · 아이템 · 미션 스크립트 */
import * as THREE from 'three';
import { E, initEngine, initInput, readMove, IN, tween, wait, stepTweens, fly, ease, burst, stepBursts, shake, SHAKE, sfx, label, setQuality } from './engine.js';
import { W, buildWorld, stepWorld, POS, MITO, CELL, NUC, mitoConstrain, makeRing, TCA_ST, setHplus } from './world.js';
import { mol, NAME } from './mols.js';
import { HUD, toast, banner, flash, say, choose, quiz, pickQs, marker, SAVE, save, chem } from './ui.js';

const $ = s => document.querySelector(s);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
initEngine($('#game')); initInput({ joy: $('#joy'), knob: $('#joy i'), bUp: $('#bUp'), bDn: $('#bDn'), bAct: $('#bAct'), bDash: $('#bDash') });
buildWorld();

/* ── 플레이어: 미토 ── */
const P = { g: new THREE.Group(), vel: V(0, 0, 0), inMito: false, carry: [], dashT: 0, face: 0 };
{
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshStandardMaterial({ color: '#7ff8ff', emissive: '#1fd8e8', emissiveIntensity: 1.3, roughness: .25 })); P.g.add(body); P.body = body;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 24), new THREE.MeshStandardMaterial({ color: '#bffcff', emissive: '#3ff', emissiveIntensity: .4, transparent: true, opacity: .22, depthWrite: false })); P.g.add(shell);
  const eyeW = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: .6 }), eyeB = new THREE.MeshBasicMaterial({ color: '#061018' });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.26, 16, 12), eyeW); e.position.set(s * .38, .25, .86); P.g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), eyeB); p.position.set(s * .38, .25, 1.08); P.g.add(p); }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.6, .08, 8, 40), new THREE.MeshStandardMaterial({ color: '#fff7a0', emissive: '#ffe040', emissiveIntensity: 3 })); halo.rotation.x = Math.PI / 2; halo.position.y = .2; P.g.add(halo); P.halo = halo;
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.ConeGeometry(.35, 1.1, 10), new THREE.MeshStandardMaterial({ color: '#5af0ff', emissive: '#2bd', emissiveIntensity: 1.2 })); f.rotation.z = s * Math.PI / 2.4; f.position.set(s * 1.15, -.1, -.2); P.g.add(f); }
  const light = new THREE.PointLight('#7ff8ff', 14, 16, 1.8); light.position.y = 1; P.g.add(light);
  P.g.position.copy(POS.start); E.scene.add(P.g);
}
/* ── 아이템 ── */
const ITEMS = []; /* {o, type, mode:'free'|'carry'|'gone', vel, collect:bool, drift} */
const ENERGY = { ATP: 1, NADH: 1, FADH2: 1 };
function spawn(type, pos, o = {}) { const m = mol(type); m.position.copy(pos); m.scale.setScalar(o.scale || 1); E.scene.add(m); const it = Object.assign({ o: m, type, mode: 'free', vel: o.vel || V(0, 0, 0), collect: o.collect !== false, t: 0 }, o); ITEMS.push(it); if (o.pop !== false) { m.scale.setScalar(.01); tween(.45, k => m.scale.setScalar((o.scale || 1) * ease.back(k))); } return it; }
function kill(it) { it.mode = 'gone'; E.scene.remove(it.o); const i = ITEMS.indexOf(it); if (i >= 0) ITEMS.splice(i, 1); const c = P.carry.indexOf(it); if (c >= 0) P.carry.splice(c, 1); }
function carrying(type) { return P.carry.filter(c => c.type === type); }
/* 운반 중인 것 꺼내서 target으로 날리기 */
function deliver(type, n, target, each) { const L = carrying(type).slice(0, n); L.forEach((it, i) => { P.carry.splice(P.carry.indexOf(it), 1); it.mode = 'fly'; setTimeout(() => { sfx('drop'); fly(it.o, target, .7, 3, () => { kill(it); each && each(it); }); }, i * 160); }); return L.length; }
const counts = { ATP: 0, NADH: 0, FADH2: 0 };
function collect(it) { /* 에너지 운반체: 플레이어에게 흡수 */
  it.mode = 'fly'; fly(it.o, () => P.g.position, .35, 1, () => { kill(it); counts[it.type]++; HUD.add(it.type, 1); sfx(it.type === 'ATP' ? 'atp' : 'pick'); burst(P.g.position, it.type === 'ATP' ? '#ffd23f' : it.type === 'NADH' ? '#4aa8ff' : '#47e38a', 14, 5, .6, .3); it.onGet && it.onGet(); });
}

/* ── 결산판 ── */
const B = { ATP: 0, NADH: 0, FADH2: 0, CO2: 0, H2O: 0 };
function board() { HUD.board([['ATP', B.ATP, '#ffd23f'], ['NADH', B.NADH, '#4aa8ff'], ['FADH2', B.FADH2, '#47e38a'], ['CO2', B.CO2, '#aab2bf'], ['H2O', B.H2O, '#58c8ff']]); }
function bAdd(k, d) { B[k] += d; board(); }

/* ── 조건 대기 ── */
const UNTIL = [];
function until(fn) { return new Promise(r => UNTIL.push({ fn, r })); }
let TARGET = null; function target(v) { TARGET = v ? v.clone() : null; }
function inRing(ring, r = 4.2, h = 9) { const p = P.g.position, c = ring.position; return Math.hypot(p.x - c.x, p.z - c.z) < r && p.y > c.y - 2.5 && p.y < c.y + h; }
const ringOf = ring => ring.position.clone().add(V(0, 3, 0));

/* ── 카메라 ── */
const camT = V(), camP = V(); let camOverride = null;
function stepCam(dt) {
  if (camOverride) { E.cam.position.lerp(camOverride.pos, 1 - Math.exp(-dt * 2.5)); camT.lerp(camOverride.look, 1 - Math.exp(-dt * 3)); E.cam.lookAt(camT); return; }
  const tgt = P.g.position.clone().add(V(0, 1.4, 0)); const dist = 9.5;
  const off = V(Math.sin(IN.yaw) * Math.cos(IN.pitch), Math.sin(IN.pitch), Math.cos(IN.yaw) * Math.cos(IN.pitch)).multiplyScalar(-dist);
  const want = tgt.clone().add(off);
  /* 카메라가 미토콘드리아 막 밖으로 새지 않게 */
  if (P.inMito) { const ab = MITO.b.clone().sub(MITO.a); const t = Math.max(0, Math.min(1, want.clone().sub(MITO.a).dot(ab) / ab.lengthSq())); const q = MITO.a.clone().addScaledVector(ab, t); const d = want.distanceTo(q); if (d > MITO.r - 2.5) want.copy(q).addScaledVector(want.clone().sub(q).normalize(), MITO.r - 2.5); }
  camP.lerp(want, 1 - Math.exp(-dt * 7)); camT.lerp(tgt, 1 - Math.exp(-dt * 10));
  E.cam.position.copy(camP); if (SHAKE.v > 0) { E.cam.position.add(V((Math.random() - .5) * SHAKE.v, (Math.random() - .5) * SHAKE.v, (Math.random() - .5) * SHAKE.v)); SHAKE.v *= Math.exp(-dt * 6); if (SHAKE.v < .01) SHAKE.v = 0; } E.cam.lookAt(camT);
}
async function showcase(pos, look, sec = 2.6) { camOverride = { pos, look }; await wait(sec); camOverride = null; }

/* ── 루프 ── */
let last = performance.now(), T = 0; const tmp = V();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
  const mv = IN.locked ? { x: 0, y: 0, u: 0, act: false } : readMove();
  /* 이동 (카메라 기준) */
  const fwd = V(-Math.sin(IN.yaw), 0, -Math.cos(IN.yaw)).multiplyScalar(-1), right = V(Math.cos(IN.yaw), 0, -Math.sin(IN.yaw)).multiplyScalar(-1);
  const want = V(0, 0, 0).addScaledVector(fwd, mv.y).addScaledVector(right, mv.x); want.y = mv.u;
  if (IN.dash && !IN.locked) { P.dashT = .35; IN.dash = false; sfx('whoosh'); burst(P.g.position, '#7ff8ff', 18, 6, .5, .3); }
  const sp = P.dashT > 0 ? 34 : 15; P.dashT -= dt;
  P.vel.lerp(want.multiplyScalar(sp), 1 - Math.exp(-dt * 5));
  const was = P.inMito; P.g.position.addScaledVector(P.vel, dt);
  /* 경계: 세포막, 핵, 미토콘드리아 */
  const p = P.g.position; const dc = p.distanceTo(CELL.c); if (dc > CELL.r - 4) p.sub(CELL.c).setLength(CELL.r - 4).add(CELL.c);
  const dn = p.distanceTo(NUC.c); if (dn < NUC.r + 2) p.sub(NUC.c).setLength(NUC.r + 2).add(NUC.c);
  P.inMito = mitoConstrain(p, was); if (P.inMito !== was) { toast(P.inMito ? '🟠 마이토콘드리아 <b>바탕질</b> 진입' : '🔵 <b>세포질</b>로 나옴', P.inMito ? '#ff9a3c' : '#5af0ff'); sfx('whoosh'); }
  /* 몸 방향·흔들림 */
  const hv = Math.hypot(P.vel.x, P.vel.z); if (hv > .5) P.face = Math.atan2(P.vel.x, P.vel.z); P.g.rotation.y += ((P.face - P.g.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 8);
  P.body.position.y = Math.sin(T * 3) * .12; P.halo.rotation.z += dt * 2; P.halo.position.y = .2 + Math.sin(T * 3) * .12;
  /* 운반 중인 분자: 미토 주위를 공전 */
  P.carry.forEach((c, i) => { const a = T * 1.6 + i / Math.max(1, P.carry.length) * Math.PI * 2; tmp.set(Math.cos(a) * 3, 1.2 + Math.sin(T * 2 + i) * .4, Math.sin(a) * 3).add(p); c.o.position.lerp(tmp, 1 - Math.exp(-dt * 8)); c.o.rotation.y += dt * 1.5; });
  /* 떠다니는 아이템: 드리프트 + 자석 + 줍기 */
  for (let i = ITEMS.length - 1; i >= 0; i--) { const it = ITEMS[i]; if (it.mode !== 'free') continue; it.t += dt; it.o.position.addScaledVector(it.vel, dt); it.vel.multiplyScalar(1 - dt * .6); it.o.rotation.y += dt * it.o.userData.spin; it.o.position.y += Math.sin(T * 1.7 + i) * .006;
    if (it.life && it.t > it.life) { tween(.5, k => it.o.scale.setScalar(1 - k), () => kill(it)); it.mode = 'fade'; continue; }
    if (!it.collect || IN.locked) continue; const d = it.o.position.distanceTo(p);
    if (ENERGY[it.type]) { if (d < (it.magnet || 9)) collect(it); }
    else if (d < 3.4 && P.carry.length < 10) { it.mode = 'carry'; P.carry.push(it); sfx('pick'); toast(`${NAME[it.type] || it.type} 획득`, '#7fffe0'); it.onGet && it.onGet(); } }
  for (let i = UNTIL.length - 1; i >= 0; i--) if (UNTIL[i].fn()) { const u = UNTIL.splice(i, 1)[0]; u.r(); }
  if (IN.actPress) IN.actPress = false;
  stepTweens(dt); stepBursts(dt); stepWorld(dt, T); stepMission(dt); stepCam(dt);
  marker(E.cam, TARGET, THREE);
  if (E.bloom.enabled) E.composer.render(); else E.R.render(E.scene, E.cam);
  requestAnimationFrame(loop);
}
let stepMission = () => { };

/* ════════════════ 미션 ════════════════ */
const MISSIONS = [
  { id: 'intro', t: '1. 세포 속으로', d: 'ATP · 마이토콘드리아 구조', run: mIntro },
  { id: 'gly', t: '2. 해당 과정', d: '포도당 → 피루브산 2 (세포질)', run: mGly },
  { id: 'pyr', t: '3. 피루브산의 산화', d: '마이토콘드리아 입장 → 아세틸 CoA', run: mPyr },
  { id: 'tca', t: '4. TCA 회로', d: '회전 바퀴에서 NADH · FADH₂ · ATP', run: mTCA },
  { id: 'etc', t: '5. 전자 전달계 · 32 ATP', d: 'H⁺ 댐과 ATP 합성 효소 터빈', run: mETC },
  { id: 'poison', t: '6. 독극물 사건', d: '사이안화물 · 올리고마이신 · DNP', run: mPoison },
  { id: 'ferm', t: '7. 산소가 끊겼다 — 발효', d: '젖산 발효 · 알코올 발효 · NAD⁺ 재생', run: mFerm },
  { id: 'boss', t: '8. 최종 시험 — 피로 괴물', d: '다른 연료 · 호흡률 · 효모 실험 · 종합', run: mBoss }
];
async function gate(chs, n, title) { HUD.obj(''); target(null); const qs = pickQs(chs, n); if (!qs.length) return; await say([['s', `🔒 <b>${title}</b> — 문제 ${qs.length}개. 맞힐 때마다 ATP 보너스!`]]); const r = await quiz(qs, title); if (r.right) { HUD.add('ATP', r.right); counts.ATP += r.right; } banner(`${r.right} / ${r.total}`, r.right === r.total ? '완벽! 관문 통과' : '틀린 문제는 메뉴의 “오답 다시 풀기”에 저장됐어요', r.right === r.total ? '#ffd23f' : '#ff9a3c'); await wait(1.2); }
function done(k) { SAVE.reached = Math.max(SAVE.reached, k + 1); save(); }

/* 1. 세포 속으로 */
async function mIntro() {
  HUD.mission('세포 속으로', 'ATP는 세포의 에너지 화폐');
  await showcase(V(30, 25, 100), V(0, 0, 40), 2.2);
  await say(['안녕! 난 <b>미토</b>. 여기는 세포 속이야. 주변에 떠다니는 건 세포질의 단백질·리보솜들이야.', '세포가 일할 때 쓰는 에너지 화폐는 <b>ATP</b>. 마지막 인산이 떨어져 <b>ADP + Pi</b>가 될 때 에너지가 나와.', '세포 호흡 = 포도당 같은 유기물을 분해해서 그 에너지로 <b>ATP를 만드는 것</b>. 산소 호흡 · 무산소 호흡 · 발효 세 종류가 있어.', '먼저 주변에 떠 있는 <b>ATP 5개</b>를 모아 줘. 곧 해당 과정에 밑천으로 투자해야 하거든!']);
  let got = 0; const L = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; L.push(spawn('ATP', POS.start.clone().add(V(Math.cos(a) * 18, (i % 2) * 4, Math.sin(a) * 14 - 10)), { magnet: 5, onGet: () => got++ })); }
  HUD.obj('✨ 떠다니는 <b>ATP</b> 모으기 (조이스틱으로 이동, 화면 끌어서 시점)');
  stepMission = () => { const n = L.find(x => x.mode === 'free'); target(n ? n.o.position : null); HUD.obj(`✨ <b>ATP</b> 모으기 ${got} / 5`); };
  await until(() => got >= 5); stepMission = () => { }; target(null); banner('ATP 5개!', '해당 과정의 밑천 확보');
  await showcase(V(60, 18, -45), V(0, 0, -85), 2.8);
  await say(['저기 주황색 거대한 게 <b>마이토콘드리아</b>. 세포의 발전소야.', '<b>외막</b>과 <b>내막</b> 두 겹의 막. 내막이 안쪽으로 접힌 주름이 <b>크리스타</b> → 반응 장소(면적)를 넓혀 줘.', '안쪽 액체는 <b>바탕질(기질)</b>. 자기만의 <b>DNA, 라이보솜</b>, 호흡 효소가 있어. 그래서 원래 독립된 세균이었다는 <b>세포내 공생설</b>의 증거가 돼.', '근육·간·신경 세포처럼 에너지를 많이 쓰는 세포에 특히 많아.']);
  await gate(['s1'], 3, '세포 속으로 관문'); done(0);
}
/* 2. 해당 과정 */
async function mGly() {
  HUD.mission('해당 과정', '세포질 · 산소 없어도 OK'); B.ATP = 0; B.NADH = 0; B.FADH2 = 0; B.CO2 = 0; B.H2O = 0; board();
  if ((HUD.inv.ATP || 0) < 2) { HUD.set('ATP', 5); }
  await say(['산소 호흡은 3단계: <b>해당 과정</b>(세포질) → <b>피루브산 산화·TCA 회로</b>(바탕질) → <b>산화적 인산화</b>(내막).', '첫 단계 해당 과정은 <b>세포질</b>에서, <b>산소 없이도</b> 일어나. 포도당(C6) 1개를 피루브산(C3) 2개로 쪼개는 거야.', '세포막의 <b>포도당 수송체</b>로 가서 포도당을 받아 와!']);
  const glu = spawn('glucose', POS.glutOut.clone().add(V(0, 0, 6)), { collect: false }); fly(glu.o, POS.glutOut, 1.2, 0, () => glu.collect = true);
  HUD.obj('🍬 포도당 수송체에서 <b>포도당</b> 받기'); target(POS.glutOut); await until(() => glu.mode === 'carry');
  HUD.obj('🏭 <b>해당 과정 공장</b> 투입구로 가져가기'); target(ringOf(W.factIn)); await until(() => inRing(W.factIn) && carrying('glucose').length);
  target(null); deliver('glucose', 1, W.factIn.position.clone().add(V(0, 2, 0))); await wait(.9);
  /* 연출: 컨베이어 위를 흐르는 포도당 */
  const show = async () => {
    camOverride = { pos: POS.factory.clone().add(V(4, 16, 26)), look: POS.factory.clone().add(V(0, 0, -4)) };
    const path = W.factPath; let m = mol('glucose'); E.scene.add(m); m.position.copy(path.getPoint(0)); sfx('machine');
    const ride = (a, b, dur) => new Promise(r => tween(dur, k => { const q = path.getPoint(a + (b - a) * ease.inOut(k)); m.position.copy(q).add(V(0, .5, 0)); m.rotation.z += .05; }, r));
    await say([['s', '<b>에너지 투자기</b>: 안정한 포도당에 ATP 2개의 인산을 붙여 <b>불안정하게</b> 만든다 → 쪼개기 쉬워짐!']]);
    const ok1 = await choose('투자기에서 쓰는 ATP는 몇 개?', ['1개', '2개', '4개'], 1);
    for (let i = 0; i < 2; i++) { HUD.add('ATP', -1); const a = mol('ATP'); a.position.copy(P.g.position); E.scene.add(a); fly(a, () => m.position, .7, 4, () => { E.scene.remove(a); burst(m.position, '#c48bff', 20, 5, .6); sfx('drop'); }); await wait(.35); }
    bAdd('ATP', -2); await wait(.6); await ride(0, .25, 1.4);
    const fb = mol('fbp'); fb.position.copy(m.position); E.scene.remove(m); m = fb; E.scene.add(m); burst(m.position, '#c48bff', 30, 6); toast('포도당 → <b>과당 2인산</b>', '#c48bff');
    await ride(.25, .42, 1); /* 쪼개기 */
    shake(.5); sfx('boom'); flash('rgba(200,140,255,.35)'); const p0 = m.position.clone(); E.scene.remove(m);
    const halves = [mol('pgal'), mol('pgal')]; halves.forEach((h, i) => { h.position.copy(p0); E.scene.add(h); }); toast('C6 → <b>PGAL(C3) × 2</b>', '#c48bff');
    await new Promise(r => tween(1.6, k => { const q = path.getPoint(.42 + .3 * ease.inOut(k)); halves.forEach((h, i) => h.position.copy(q).add(V(0, i ? 2.2 : -.6, i ? 1.5 : -1.5))); }, r));
    await say([['s', '<b>에너지 회수기</b>: PGAL에서 수소가 빠져 <b>NAD⁺ → NADH</b>, 그리고 <b>기질 수준 인산화</b>로 ADP → ATP!']]);
    halves.forEach(h => { for (let j = 0; j < 1; j++) spawn('NADH', h.position.clone().add(V(0, 2, 0)), { vel: V((Math.random() - .5) * 6, 5, (Math.random() - .5) * 6), magnet: 14 }); }); bAdd('NADH', 2); sfx('pick'); await wait(.8);
    await new Promise(r => tween(1.2, k => { const q = path.getPoint(.72 + .28 * ease.inOut(k)); halves.forEach((h, i) => h.position.copy(q).add(V(0, i ? 2.2 : -.6, i ? 1.5 : -1.5))); }, r));
    halves.forEach(h => { for (let j = 0; j < 2; j++) spawn('ATP', h.position.clone().add(V(0, 1, 0)), { vel: V((Math.random() - .5) * 8, 6, (Math.random() - .5) * 8), magnet: 14 }); }); bAdd('ATP', 4); sfx('atp');
    const outs = halves.map((h, i) => { E.scene.remove(h); return spawn('pyruvate', POS.factOut.clone().add(V(4, i * 2.5, i * 3)), { vel: V(3, 0, 2) }); });
    toast('PGAL → <b>피루브산 × 2</b>', '#ff9a3c'); camOverride = null; return outs;
  };
  const pyr = await show();
  HUD.obj('⚡ 튀어나온 <b>ATP 4 · NADH 2</b>와 <b>피루브산 2</b> 모두 모으기'); stepMission = () => { const n = pyr.find(x => x.mode === 'free'); target(n ? n.o.position : null); };
  await until(() => pyr.every(x => x.mode === 'carry') && !ITEMS.some(x => ENERGY[x.type] && x.mode === 'free')); stepMission = () => { }; target(null);
  banner('해당 과정 완료!', '투자 −2 ATP · 회수 +4 ATP → <b>순 +2 ATP</b>, 2 NADH, 피루브산 2');
  await say(['정리! 포도당 → <b>2 피루브산 + 2 NADH + 2 ATP(순)</b>. 경로는 포도당 → 과당 2인산 → 2 PGAL → 2 BPGA → 2 피루브산.', 'ATP를 효소가 기질의 인산을 ADP에 직접 붙여서 만들었지? 그게 <b>기질 수준 인산화</b>야.']);
  await gate(['s2'], 3, '해당 과정 관문'); done(1);
}
/* 3. 피루브산의 산화 */
async function mPyr() {
  HUD.mission('피루브산의 산화', '바탕질 · CO₂가 처음 나온다'); ensureCarry('pyruvate', 2);
  await say(['<b>산소가 있으면</b> 피루브산은 마이토콘드리아 안으로 들어가. 입구까지 날아가자! (⚡ 버튼 = 대시)']);
  HUD.obj('🟠 <b>마이토콘드리아 입구</b>로'); target(MITO.gate.clone().add(V(-10, 0, 0))); await until(() => P.inMito); target(null);
  await say(['여기가 <b>바탕질</b>. 피루브산을 <b>피루브산 산화 장치</b>에 넣어.']);
  HUD.obj('🔬 피루브산 2개를 <b>산화 장치</b>에 투입'); target(ringOf(W.pdhIn)); await until(() => inRing(W.pdhIn) && carrying('pyruvate').length);
  target(null); const core = W.pdh.position.clone(); const acs = [];
  camOverride = { pos: core.clone().add(V(14, 6, 14)), look: core };
  await new Promise(res => { let n = 0; deliver('pyruvate', 2, core, () => { n++; sfx('machine'); shake(.3);
    const co2 = spawn('CO2', core.clone().add(V(0, 3, 0)), { vel: V((Math.random() - .5) * 4, 7, (Math.random() - .5) * 4), collect: false, life: 4 }); bAdd('CO2', 1); toast('탈탄산: <b>CO₂</b> 방출', '#aab2bf');
    spawn('NADH', core.clone().add(V(2, 2, 2)), { vel: V(4, 2, 4), magnet: 16 }); bAdd('NADH', 1);
    acs.push(spawn('acetyl', core.clone().add(V(4, -1, 0)), { vel: V(5, -1, (n - 1.5) * 4) })); if (n === 2) res(); }); });
  await wait(1); camOverride = null;
  await say(['피루브산(C3) + <b>조효소 A</b> → <b>아세틸 CoA(C2)</b> + <b>CO₂</b> + <b>NADH</b>. 탄소 하나가 CO₂로 빠졌어 (탈탄산).', '⚠ 여기서는 <b>ATP가 안 생겨</b>! 시험 단골 함정.']);
  HUD.obj('🧪 <b>아세틸 CoA 2</b>와 NADH 모으기'); stepMission = () => { const n = acs.find(x => x.mode === 'free'); target(n ? n.o.position : null); };
  await until(() => acs.every(x => x.mode === 'carry') && !ITEMS.some(x => ENERGY[x.type] && x.mode === 'free')); stepMission = () => { }; target(null);
  banner('피루브산 산화 완료', '2 CO₂ · 2 NADH · 2 아세틸 CoA');
  await gate(['s3'], 3, '피루브산 산화 관문'); done(2);
}
/* 4. TCA 회로 */
async function mTCA() {
  HUD.mission('TCA 회로', '바탕질 · 한 바퀴 = 아세틸 CoA 1개'); ensureCarry('acetyl', 2); if (!P.inMito) { P.g.position.copy(POS.pdh).add(V(4, 4, 6)); P.inMito = true; }
  await say(['<b>TCA 회로</b>! 아세틸 CoA(C2)가 <b>옥살아세트산(C4)</b>과 합쳐져 <b>시트르산(C6)</b>이 되고, 바퀴를 돌며 다시 옥살아세트산으로 돌아와.', '돌면서 <b>CO₂ 2개</b>가 빠지고, 수소는 <b>NADH 3 · FADH₂ 1</b>에 실리고, <b>ATP 1</b>이 생겨. 바퀴 옆 노란 링에 아세틸 CoA를 넣어!']);
  HUD.obj('🎡 <b>아세틸 CoA</b>를 TCA 회로 투입구에'); target(ringOf(W.tcaIn)); await until(() => inRing(W.tcaIn) && carrying('acetyl').length); target(null);
  const wheel = W.tcaWheel, nodes = W.tcaNodes;
  for (let turn = 0; turn < 2; turn++) {
    camOverride = { pos: POS.tca.clone().add(V(22, 4, 6)), look: POS.tca.clone() };
    const top = nodes[0].getWorldPosition(V()); await new Promise(r => deliver('acetyl', 1, top, r)); sfx('machine');
    let ride = mol('acetyl'); nodes[0].add(ride); ride.scale.setScalar(.6); ride.position.set(0, 0, 2);
    toast('아세틸 CoA + 옥살아세트산 → <b>시트르산 C₆</b>', '#ffd23f');
    for (let s = 1; s <= 6; s++) {
      const st = TCA_ST[s % 6]; const from = wheel.rotation.x;
      /* 바퀴 회전 (다음 정거장이 맨 위로) */
      await new Promise(r => tween(turn ? .7 : 1.1, k => { wheel.rotation.x = from - (Math.PI / 3) * ease.inOut(k); }, r));
      nodes.forEach(n => n.children[0].material.emissiveIntensity = 1.4); const node = nodes[s % 6]; node.children[0].material.emissiveIntensity = 4;
      if (ride.parent) ride.parent.remove(ride); node.add(ride);
      if (st.out) {
        if (turn === 0) { const right = st.out.map(o => NAME[o] || o).join(' + '); const fake = [['CO2', 'NADH', 'FADH2'], ['ATP'], ['NADH', 'ATP'], ['CO2'], ['FADH2', 'ATP']].map(f => f.map(o => NAME[o]).join(' + ')).filter(f => f !== right); const opts = [right, fake[(s) % fake.length], fake[(s + 2) % fake.length]].sort(() => Math.random() - .5); const ok = await choose(`${TCA_ST[(s + 5) % 6].name} → <b>${st.name}</b><br>이 단계에서 나오는 것은?`, opts, opts.indexOf(right)); if (ok) { HUD.add('ATP', 1); toast('정답 보너스 +1 ATP', '#ffd23f'); } }
        const wp = node.getWorldPosition(V()); shake(.25);
        st.out.forEach((o, j) => { if (o === 'CO2') { spawn('CO2', wp.clone(), { vel: V(6, 5 + j, (Math.random() - .5) * 6), collect: false, life: 3.5 }); bAdd('CO2', 1); } else { spawn(o, wp.clone().add(V(1, j, 0)), { vel: V(7, (Math.random() - .3) * 5, (Math.random() - .5) * 8), magnet: 30 }); bAdd(o === 'FADH2' ? 'FADH2' : o, 1); } });
        sfx(st.out.includes('ATP') ? 'atp' : 'pick'); toast(`${st.name}: ${st.out.map(o => '<b>' + (NAME[o] || o) + '</b>').join(' · ')}`, st.col);
        await wait(turn ? .35 : .7);
      }
    }
    ride.parent && ride.parent.remove(ride); camOverride = null;
    banner(`${turn + 1}바퀴 완료`, 'CO₂ 2 · NADH 3 · FADH₂ 1 · ATP 1'); await wait(.8);
    if (turn === 0) { HUD.obj('🎡 두 번째 <b>아세틸 CoA</b> 투입'); target(ringOf(W.tcaIn)); await until(() => inRing(W.tcaIn)); target(null); }
  }
  HUD.obj('⚡ 남은 에너지 운반체 줍기'); await until(() => !ITEMS.some(x => ENERGY[x.type] && x.mode === 'free'));
  await say(['포도당 1개 기준 TCA 회로는 <b>두 바퀴</b>: CO₂ 4 · NADH 6 · FADH₂ 2 · ATP 2.', '지금까지 결산판을 봐! 아직 ATP는 4개뿐. 진짜 대박은 <b>NADH 10개, FADH₂ 2개</b>에 실린 전자야 → 전자 전달계로!']);
  await gate(['s4'], 3, 'TCA 회로 관문'); done(3);
}
/* 5. 전자 전달계 */
async function mETC() {
  HUD.mission('전자 전달계 · 산화적 인산화', '내막 · 화학 삼투'); if (!P.inMito) { P.g.position.copy(POS.tca).add(V(0, 0, 12)); P.inMito = true; }
  if (B.NADH < 10) { B.ATP = 4; B.NADH = 10; B.FADH2 = 2; B.CO2 = 6; board(); }
  HUD.set('NADH', 10); HUD.set('FADH2', 2); setHplus(0);
  await showcase(V(-12, 6, -72), V(POS.etcX, 0, -85), 2.4);
  await say(['여기가 <b>내막(크리스타)</b>의 전자 전달계. NADH와 FADH₂가 <b>고에너지 전자</b>를 내려놓는 곳이야.', '전자가 복합체 Ⅰ → Q → Ⅲ → 사이토크롬 c → Ⅳ로 흐르면서 나온 에너지로 <b>H⁺를 막 사이 공간으로 퍼 올려</b>. (능동 수송)', '전자의 <b>최종 수용체는 O₂</b>! 전자 + H⁺ + O₂ → <b>H₂O</b>.']);
  let nadh = 0, fad = 0, o2n = 0; const O2s = [];
  for (let i = 0; i < 6; i++) O2s.push(spawn('O2', V(-8 + Math.random() * 14, (Math.random() - .5) * 18, -85 + (Math.random() - .5) * 22), { vel: V(0, 0, 0) }));
  const chain = () => { const pts = [W.cI, W.Q, W.cIII, W.cytc, W.cIV].map(o => o.getWorldPosition ? o.getWorldPosition(V()) : o.position.clone()); return pts; };
  const runE = (fromII) => { const pts = chain(); if (fromII) pts[0] = W.cII.getWorldPosition(V()); const e = mol('e'); e.scale.setScalar(1.6); e.position.copy(pts[0]); E.scene.add(e); let k = 0; const step = () => { if (k >= pts.length - 1) { E.scene.remove(e); return; } fly(e, pts[k + 1], .35, .5, () => { k++; step(); }); }; step(); };
  stepMission = () => { HUD.obj(`🔵 NADH → 복합체 Ⅰ <b>${nadh}/10</b> · 🟢 FADH₂ → 복합체 Ⅱ <b>${fad}/2</b> · 🔴 O₂ 잡아서 복합체 Ⅳ <b>${o2n}/6</b>`);
    if (nadh < 10 && inRing(W.inI)) { nadh = 10; HUD.set('NADH', 0); for (let i = 0; i < 10; i++) setTimeout(() => { runE(false); sfx('pick'); setHplus(.06 * (i + 1)); }, i * 180); toast('NADH 1개당 H⁺를 많이 퍼 올림 (≈2.5 ATP)', '#4aa8ff'); }
    if (fad < 2 && inRing(W.inII)) { fad = 2; HUD.set('FADH2', 0); for (let i = 0; i < 2; i++) setTimeout(() => { runE(true); sfx('pick'); setHplus(.6 + .1 * (i + 1)); }, i * 250); toast('FADH₂는 복합체 Ⅱ로 → Ⅰ을 건너뛰어 H⁺를 덜 퍼 올림 (≈1.5 ATP)', '#47e38a'); }
    const hold = carrying('O2').length; if (hold && inRing(W.inIV)) { const n = deliver('O2', hold, W.cIV.getWorldPosition(V()), () => { o2n++; for (let j = 0; j < 2; j++) spawn('H2O', W.cIV.getWorldPosition(V()).add(V(2, 0, 0)), { vel: V(5, (Math.random() - .5) * 6, (Math.random() - .5) * 6), collect: false, life: 3 }); bAdd('H2O', 2); }); }
    const free = O2s.find(x => x.mode === 'free'); target(nadh < 10 ? ringOf(W.inI) : fad < 2 ? ringOf(W.inII) : hold ? ringOf(W.inIV) : free ? free.o.position : null);
    if ((nadh || fad) && o2n === 0 && Math.random() < .02) W.cIV.userData.body.material.emissiveIntensity = 2.5 + Math.random();
  };
  await until(() => nadh >= 10 && fad >= 2 && o2n >= 6); stepMission = () => { }; target(null); setHplus(1);
  await say(['막 사이 공간에 <b>H⁺가 가득</b>! 안팎의 농도 차 = 물이 가득 찬 댐이야. (막 사이 공간 pH ↓)', '이제 H⁺가 <b>ATP 합성 효소</b>를 통해 바탕질로 흘러 내려오면서 터빈을 돌려 → ADP + Pi → <b>ATP</b>. 이게 <b>화학 삼투</b>, <b>산화적 인산화</b>야.', '터빈 링 안에 들어가서 <b>✋ 버튼(또는 E)을 꾹 누르고</b> 있어!']);
  target(ringOf(W.inSyn)); let made = 0, spin = 0; const goal = 28;
  stepMission = dt => { const on = inRing(W.inSyn) && (IN.act || IN.keys.KeyE); HUD.obj(`⚙ ATP 합성 효소 터빈 돌리기 — <b>${made.toFixed(1)}</b> / 28 ATP ${on ? '' : '(링 안에서 ✋ 꾹)'}`);
    spin += ((on ? 14 : 0) - spin) * Math.min(1, dt * 3); W.synRotor.rotation.x += spin * dt; W.synHead.rotation.x += spin * dt * .3;
    if (on) { const before = Math.floor(made); made = Math.min(goal, made + dt * 5.5); setHplus(1 - made / goal * .85); if (Math.floor(made) > before) { const a = spawn('ATP', W.synHead.getWorldPosition(V()).add(V(1, 0, 0)), { vel: V(6, (Math.random() - .5) * 6, (Math.random() - .5) * 6), magnet: 40 }); bAdd('ATP', 1); if (Math.random() < .3) shake(.15); } } };
  await until(() => made >= goal); stepMission = () => { }; target(null); await wait(.6);
  flash('rgba(255,220,80,.5)'); sfx('win'); shake(.8); for (let i = 0; i < 4; i++) burst(P.g.position.clone().add(V(0, 3, 0)), ['#ffd23f', '#fff', '#ff9a3c', '#7ff8ff'][i], 60, 14, 1.6, .5);
  banner('32 ATP 달성!', 'NADH 10 × 2.5 + FADH₂ 2 × 1.5 = <b>28</b> + 기질 수준 <b>4</b>', '#ffd23f');
  await say(['<b>C₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 32ATP</b>', '포도당은 <b>산화</b>되어 CO₂가 되고(수소·전자 잃음), O₂는 <b>환원</b>되어 H₂O가 돼(수소·전자 얻음).', '포도당 에너지의 약 <b>34%</b>만 ATP에 저장되고 나머지는 <b>열</b>로 나가. 그래서 체온 유지에도 쓰여!']);
  await gate(['s5', 's6'], 4, '전자 전달계·결산 관문'); done(4);
}
/* 6. 독극물 사건 */
async function mPoison() {
  HUD.mission('독극물 사건', '전자 전달 저해제 · ATP 합성 효소 저해제 · 짝풀림제'); if (!P.inMito) { P.g.position.set(-14, 2, -80); P.inMito = true; } setHplus(.9);
  await showcase(V(-12, 8, -70), V(POS.etcX, 0, -85), 2);
  await say([['x', '⚠ 경보! 정체불명의 분자가 내막에 침입했다!'], '수사관 미토 출동! <b>증상 계기판</b>을 보고 범인을 맞혀 줘.']);
  const G = $('#gauges'); G.hidden = false; const setG = (o2, hp, et, atp) => { const a = v => v > 0 ? '<b class="up">▲</b>' : v < 0 ? '<b class="dn">▼</b>' : '<b>－</b>'; G.innerHTML = `<div>O₂ 소모 ${a(o2)}</div><div>H⁺ 농도 차 ${a(hp)}</div><div>전자 전달 ${a(et)}</div><div>ATP 합성 ${a(atp)}</div>`; };
  const swarm = (to, col) => { for (let i = 0; i < 26; i++) { const e = mol('e'); e.children[0].material = e.children[0].material.clone(); e.children[0].material.color.set(col); e.children[0].material.emissive.set(col); e.position.copy(P.g.position).add(V((Math.random() - .5) * 20, (Math.random() - .5) * 14, (Math.random() - .5) * 20)); E.scene.add(e); fly(e, to.clone().add(V((Math.random() - .5) * 3, (Math.random() - .5) * 3, (Math.random() - .5) * 3)), 1 + Math.random() * .6, 3, () => E.scene.remove(e)); } };
  const cases = [
    { at: () => W.cIV.getWorldPosition(V()), col: '#7a00ff', g: [-1, -1, -1, -1], ans: 0, fx: () => { W.cIV.userData.body.material.emissiveIntensity = 0; W.cIV.userData.body.material.color.set('#222'); setHplus(.2); }, undo: () => { W.cIV.userData.body.material.color.set('#ff5a5a'); W.cIV.userData.body.material.emissiveIntensity = .8; setHplus(.9); },
      why: '<b>사이안화물</b>: 복합체 Ⅳ가 O₂에 전자를 못 넘김 → 전자 전달 멈춤 → O₂ 소모 ↓, H⁺ 퍼 올리기 ↓ → 농도 차 ↓ → ATP ↓' },
    { at: () => W.syn.getWorldPosition(V()), col: '#ff2a2a', g: [-1, 1, -1, -1], ans: 1, fx: () => { W.synRotor.material.color.set('#444'); W.synRotor.material.emissiveIntensity = 0; setHplus(1); }, undo: () => { W.synRotor.material.color.set('#ffd23f'); W.synRotor.material.emissiveIntensity = 1.6; setHplus(.9); },
      why: '<b>올리고마이신</b>: ATP 합성 효소의 H⁺ 통로를 막음 → H⁺가 못 내려와 농도 차 ↑ → 더 퍼 올리기 힘들어 전자 전달 ↓, O₂ 소모 ↓ → ATP ↓' },
    { at: () => W.etcMem.getWorldPosition(V()), col: '#ffe000', g: [1, -1, 1, -1], ans: 2, fx: () => { W.etcMem.material.emissive.set('#ff2000'); W.etcMem.material.emissiveIntensity = 1.6; setHplus(.15); }, undo: () => { W.etcMem.material.emissive.set('#5a1d00'); W.etcMem.material.emissiveIntensity = .6; setHplus(.9); },
      why: '<b>DNP(짝풀림제)</b>: 내막에 H⁺ 구멍을 뚫음 → 농도 차 ↓ → ATP ↓. 세포는 농도 차를 회복하려고 전자 전달 ↑, O₂ 소모 ↑. 에너지는 <b>열</b>로 → 체온 ↑' }
  ];
  const names = ['사이안화물 (전자 전달 저해)', '올리고마이신 (ATP 합성 효소 저해)', 'DNP (짝풀림제)'];
  for (let i = 0; i < 3; i++) { const c = cases[i]; setG(0, 0, 0, 0); toast(`사건 ${i + 1}`, '#ff5a8a'); swarm(c.at(), c.col); sfx('boom'); await wait(1.6); shake(.6); c.fx(); setG(...c.g); target(c.at());
    camOverride = { pos: c.at().add(V(12, 5, 8)), look: c.at() }; await wait(1.6); camOverride = null;
    const ok = await choose(`사건 ${i + 1} — 계기판: ${$('#gauges').innerText.replace(/\n/g, ' · ')}<br>범인은?`, names, c.ans);
    await say([['s', (ok ? '✔ 검거! ' : '✘ 범인은 따로 있었다… ') + c.why]]); c.undo(); target(null); }
  G.hidden = true; banner('사건 해결!', '세 독극물의 증상 패턴을 기억하자'); await gate(['s7'], 3, '독극물 관문'); done(5);
}
/* 7. 발효 */
async function mFerm() {
  HUD.mission('산소가 끊겼다 — 발효', '세포질 · NAD⁺ 재생이 목적'); if (P.inMito) { P.g.position.copy(MITO.gate).add(V(10, 0, 0)); P.inMito = false; }
  E.scene.fog.color.set('#2a0a14'); E.scene.background.set('#14040a'); W.lights.sun.color.set('#ff6a6a'); flash('rgba(255,40,60,.45)'); shake(.6); sfx('boom');
  await say([['x', '🚨 산소 공급 중단! (격렬한 운동 중인 근육 세포)'], 'O₂가 없으면 전자 전달계가 멈추고 → NADH가 전자를 못 내려놔 → <b>NAD⁺가 바닥나</b>.', '해당 과정은 PGAL에서 수소를 떼어 NAD⁺에 실어야 하는데, NAD⁺가 없으면 <b>해당 과정까지 멈춰</b>. 그럼 ATP 0!', '해결책 = <b>발효</b>: NADH의 수소를 피루브산에 넘겨서 <b>NAD⁺를 재생</b>하는 거야.']);
  W.ldh.visible = true; const r1 = makeRing(POS.ldh.clone().add(V(0, -3, 0)), '#ff6fae', '피루브산 + NADH'); HUD.set('NAD', 0);
  const pyr = [0, 1].map(i => spawn('pyruvate', POS.factOut.clone().add(V(3, 1, 4 + i * 3)), { vel: V(2, 0, 3) })); HUD.set('NADH', 2);
  HUD.obj('💪 피루브산 2개를 <b>젖산 발효 효소</b>로'); stepMission = () => { const n = pyr.find(x => x.mode === 'free'); target(n ? n.o.position : ringOf(r1)); };
  await until(() => inRing(r1) && carrying('pyruvate').length >= 2); stepMission = () => { }; target(null);
  camOverride = { pos: POS.ldh.clone().add(V(10, 6, 14)), look: POS.ldh.clone() };
  await new Promise(res => { let n = 0; deliver('pyruvate', 2, W.ldh.position.clone().add(V(0, 4, 0)), () => { n++; HUD.add('NADH', -1); HUD.add('NAD', 1); sfx('machine'); const l = spawn('lactate', W.ldh.position.clone().add(V(3, 5, 0)), { vel: V(3, 2, (n - 1.5) * 4), collect: false, life: 6 }); const nad = mol('NAD'); nad.position.copy(W.ldh.position).add(V(0, 6, 0)); E.scene.add(nad); fly(nad, POS.factIn.clone().add(V(0, 3, 0)), 1.4, 6, () => { E.scene.remove(nad); burst(POS.factIn.clone().add(V(0, 3, 0)), '#8fb8ff', 20, 5); }); if (n === 2) res(); }); });
  await wait(1); camOverride = null;
  banner('젖산 발효', '피루브산 + NADH → 젖산 + NAD⁺ (CO₂ 없음)', '#ff6fae');
  await say(['피루브산(C3)이 <b>환원</b>되어 <b>젖산(C3)</b>, NADH는 <b>산화</b>되어 NAD⁺로 재생 → 해당 과정이 다시 돈다!', '전체: C₆H₁₂O₆ → 2C₃H₆O₃ + <b>2ATP</b>. ATP는 해당 과정의 2개뿐. 쌓인 젖산은 간으로 가서 다시 포도당이 되기도 해.']);
  await gate(['s8'], 2, '젖산 발효 관문');
  /* 효모 */
  await say(['이번엔 <b>효모</b> 속! 효모는 피루브산을 다르게 처리해.']); W.yeast.visible = true; const r2 = makeRing(POS.yeast.clone().add(V(0, -3, 0)), '#ffe27a', '피루브산 + NADH');
  const py2 = [0, 1].map(i => spawn('pyruvate', POS.factOut.clone().add(V(6, 2, 8 + i * 3)), { vel: V(4, 0, 3) })); HUD.set('NADH', 2);
  HUD.obj('🍞 피루브산 2개를 <b>알코올 발효 효소</b>로'); stepMission = () => { const n = py2.find(x => x.mode === 'free'); target(n ? n.o.position : ringOf(r2)); };
  await until(() => inRing(r2) && carrying('pyruvate').length >= 2); stepMission = () => { }; target(null);
  camOverride = { pos: POS.yeast.clone().add(V(10, 6, 14)), look: POS.yeast.clone() };
  await new Promise(res => { let n = 0; deliver('pyruvate', 2, W.yeast.position.clone().add(V(0, 4, 0)), async () => { n++; const k = n; sfx('machine');
    spawn('CO2', W.yeast.position.clone().add(V(0, 6, 0)), { vel: V(0, 8, 0), collect: false, life: 3 }); toast('1단계 탈탄산: <b>CO₂</b> ↑ (빵 구멍!)', '#aab2bf');
    const ac = spawn('acetald', W.yeast.position.clone().add(V(3, 4, 0)), { collect: false, pop: true }); await wait(1);
    kill(ac); HUD.add('NADH', -1); HUD.add('NAD', 1); spawn('ethanol', W.yeast.position.clone().add(V(4, 4, (k - 1.5) * 4)), { vel: V(3, 1, 0), collect: false, life: 6 }); toast('2단계 환원: NADH → <b>에탄올</b> + NAD⁺', '#ffe27a'); if (k === 2) res(); }); });
  await wait(1.2); camOverride = null;
  banner('알코올 발효', '피루브산 → (CO₂) 아세트알데하이드 → (NADH) 에탄올', '#ffe27a');
  await say(['비교! 젖산 발효: CO₂ <b>없음</b>, 젖산(C3) / 알코올 발효: CO₂ <b>있음</b>, 에탄올(C2). 둘 다 <b>세포질</b>, 둘 다 <b>2ATP</b>, 목적은 <b>NAD⁺ 재생</b>.', '빵 구멍 = CO₂, 술 = 에탄올. 요구르트·김치는 젖산균의 젖산 발효!']);
  E.scene.fog.color.set('#0a2230'); E.scene.background.set('#06121c'); W.lights.sun.color.set('#cfefff');
  await gate(['s11', 's12'], 4, '알코올 발효·생활 속 발효 관문'); done(6);
}
/* 8. 최종 보스 */
async function mBoss() {
  HUD.mission('최종 시험 — 피로 괴물', '틀리면 공격당한다'); if (P.inMito) { P.g.position.copy(MITO.gate).add(V(10, 0, 0)); P.inMito = false; }
  const boss = new THREE.Group(); boss.position.copy(POS.arena).add(V(0, 6, -24)); E.scene.add(boss);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 2), new THREE.MeshStandardMaterial({ color: '#2a0030', emissive: '#a0005a', emissiveIntensity: 1.6, flatShading: true, roughness: .4 })); boss.add(core);
  const spikes = new THREE.InstancedMesh(new THREE.ConeGeometry(.9, 5, 8), new THREE.MeshStandardMaterial({ color: '#5a0040', emissive: '#ff2a8a', emissiveIntensity: 2 }), 40); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < 40; i++) { const d = new THREE.Vector3().randomDirection(); q.setFromUnitVectors(V(0, 1, 0), d); m4.compose(d.clone().multiplyScalar(7), q, V(1, 1, 1)); spikes.setMatrixAt(i, m4); } boss.add(spikes);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffef5a' })); e.position.set(s * 2.2, 1.5, 5.6); boss.add(e); }
  const hpL = label('피로 괴물 ■■■■■■■■', { scale: 1.2, border: '#ff2a8a', color: '#ffd0e8' }); hpL.position.y = 13; boss.add(hpL);
  stepMission = dt => { boss.rotation.y += dt * .6; core.rotation.x += dt * .3; boss.position.y = POS.arena.y + 6 + Math.sin(T * 1.5) * 1.5; };
  P.g.position.copy(POS.arena).add(V(0, 0, 16)); IN.yaw = Math.PI; IN.pitch = -.05;
  await showcase(POS.arena.clone().add(V(16, 10, 26)), boss.position.clone(), 2.4);
  await say([['x', '크크크… 나는 <b>피로 괴물</b>. 네가 배운 걸 다 잊게 해 주지!'], '마지막 시험이야. 맞히면 <b>ATP 빔</b>, 틀리면 하트가 깎여. 하트 3개!']);
  let hp = 8, hearts = 3; const qs = pickQs(['s9', 's10', 's2', 's4', 's5', 's6', 's8', 's11'], 14);
  for (const qq of qs) {
    if (hp <= 0 || hearts <= 0) break;
    const r = await quiz([qq], `보스전 · 남은 체력 ${hp} · ❤ ${hearts}`);
    if (r.right) { hp--; const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe066', transparent: true, opacity: .9, blending: THREE.AdditiveBlending })); E.scene.add(beam); const a = P.g.position.clone(), b = boss.position.clone(); const d = b.clone().sub(a); beam.position.copy(a).addScaledVector(d, .5); beam.scale.set(1, d.length(), 1); beam.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); sfx('boom'); shake(.5); burst(b, '#ffe066', 80, 16, 1.2, .6); tween(.5, k => { beam.material.opacity = .9 * (1 - k); }, () => E.scene.remove(beam)); hpL.material.map.dispose(); const nl = label('피로 괴물 ' + '■'.repeat(hp) + '□'.repeat(8 - hp), { scale: 1.2, border: '#ff2a8a', color: '#ffd0e8' }); hpL.material = nl.material; }
    else { hearts--; flash('rgba(255,0,80,.5)'); shake(1); sfx('bad'); toast(`❤ ${hearts} 남음`, '#ff5a8a'); }
    await wait(.6);
  }
  stepMission = () => { };
  if (hp <= 0 || hearts > 0) { tween(1.2, k => { boss.scale.setScalar(1 - k); boss.rotation.y += .3; }, () => E.scene.remove(boss)); for (let i = 0; i < 6; i++) setTimeout(() => burst(POS.arena.clone().add(V(0, 12, -24)), ['#ffd23f', '#ff2a8a', '#7ff8ff'][i % 3], 90, 20, 1.6, .6), i * 200); sfx('win');
    banner('클리어!', '세포 호흡 마스터 — 미토의 발전소를 지켜 냈다', '#ffd23f'); SAVE.best = Math.max(SAVE.best, hearts); done(7);
    await say(['해냈어! 정리 한 번 더:', '해당 과정(세포질) 2ATP · 피루브산 산화(바탕질) ATP 0 · TCA(바탕질) 2ATP · 산화적 인산화(내막) 28ATP = <b>32 ATP</b>.', '지방은 글리세롤·지방산 → 아세틸 CoA(β 산화), 단백질은 아미노산 → 탈아미노 → 암모니아는 요소로. 호흡률은 탄수화물 1, 단백질 0.8, 지방 0.7!', '메뉴에서 챕터를 골라 다시 하거나, <b>오답 다시 풀기</b>로 틀린 문제를 복습해 봐.']); }
  else { E.scene.remove(boss); banner('패배…', '하트가 다 떨어졌어요. 메뉴에서 다시 도전!', '#ff5a8a'); }
}
function ensureCarry(type, n) { const have = carrying(type).length; for (let i = have; i < n; i++) { const it = spawn(type, P.g.position.clone().add(V(2, 2, 0))); it.mode = 'carry'; P.carry.push(it); } }

/* ════════════════ 메뉴 ════════════════ */
let running = false;
async function play(from) {
  running = true; $('#menu').hidden = true; $('#hud').hidden = false;
  P.carry.slice().forEach(kill); ITEMS.slice().forEach(kill);
  if (from > 0) { HUD.set('ATP', 5); } else HUD.set('ATP', 0); HUD.set('NADH', 0); HUD.set('FADH2', 0); HUD.set('NAD', 0);
  if (from >= 1 && from <= 4) { if (from >= 2) { B.ATP = 2; B.NADH = 2; } if (from >= 3) { B.NADH = 4; B.CO2 = 2; } if (from >= 4) { B.ATP = 4; B.NADH = 10; B.FADH2 = 2; B.CO2 = 6; } board(); } else if (from > 4) HUD.board(null);
  if (from < 2) P.g.position.copy(POS.start), P.inMito = false;
  for (let k = from; k < MISSIONS.length; k++) { HUD.obj(''); target(null); stepMission = () => { }; await MISSIONS[k].run(); if (k === 4) HUD.board(null); if (k < MISSIONS.length - 1) { banner('다음 챕터', MISSIONS[k + 1].t, '#7fffe0'); await wait(1.6); } }
  running = false; menu();
}
function menu() {
  const m = $('#menu'); m.hidden = false; $('#hud').hidden = true; IN.locked = false;
  const last = Math.min(SAVE.reached, MISSIONS.length - 1);
  m.innerHTML = `<div class="mc"><h1>MITO<small>세포 속 발전소</small></h1><p class="sub">미토가 되어 포도당 하나에서 ATP 32개를 뽑아내라</p>
  <div class="mb"><button class="pri" data-a="go">${SAVE.reached ? `▶ 이어하기 — ${MISSIONS[last].t}` : '▶ 시작하기'}</button><button data-a="new">↺ 처음부터</button></div>
  <h3>챕터</h3><div class="chs">${MISSIONS.map((x, i) => `<button data-c="${i}" class="${i < SAVE.reached ? 'cl' : ''}"><b>${x.t}</b><small>${chem(x.d)}</small></button>`).join('')}</div>
  <div class="mb"><button data-a="wrong">📕 오답 다시 풀기 (${SAVE.wrong.length})</button><button data-a="cards">🃏 암기 카드</button><button data-a="q">화질: ${({ low: '낮음', mid: '보통', high: '높음' })[E.quality]}</button><button data-a="home">🏠 과목 선택</button></div>
  <p class="help">조작 — 왼쪽 화면 끌기: 이동 · 오른쪽 화면 끌기: 시점 · ▲▼ 위아래 · ⚡ 대시 · ✋ 행동<br>키보드 — WASD 이동 · 마우스 드래그 시점 · Space/C 위아래 · Shift 대시 · E 행동</p></div>`;
  m.onclick = async e => { const b = e.target.closest('button'); if (!b) return; sfx('pick');
    if (b.dataset.c) return play(+b.dataset.c); const a = b.dataset.a;
    if (a === 'go') return play(last); if (a === 'new') return play(0);
    if (a === 'q') return setQuality(({ low: 'mid', mid: 'high', high: 'low' })[E.quality]); if (a === 'home') location.href = 'index.html';
    if (a === 'wrong') { const qs = (window.BQ || []).filter(q => SAVE.wrong.includes(q.id)).slice(0, 10); if (!qs.length) { toast('틀린 문제가 없어요!'); return; } m.hidden = true; await quiz(qs, '오답 다시 풀기'); menu(); }
    if (a === 'cards') cards(); };
}
function cards() { const c = $('#cards'); c.hidden = false; c.innerHTML = `<div class="ch"><b>🃏 암기 카드 — 눌러서 뒤집기</b><button>닫기</button></div><div class="cg">${(window.BCARDS || []).map(([f, b]) => `<div class="cd"><div class="f">${chem(f)}</div><div class="b">${b.split(/(<[^>]+>)/).map(p => p.startsWith('<') ? p : chem(p)).join('')}</div></div>`).join('')}</div>`; c.querySelector('button').onclick = () => c.hidden = true; c.querySelectorAll('.cd').forEach(d => d.onclick = () => { d.classList.toggle('on'); sfx('pick'); }); }

$('#bMenu').onclick = () => { if (confirm('메뉴로 나갈까요? (진행 중인 챕터는 처음부터 다시 시작해요)')) location.reload(); };
/* 테스트용 (주소 끝에 #dev) */
if (location.hash === '#dev') window.BIO = { P, IN, ITEMS, target: () => TARGET, tp(v) { const ab = MITO.b.clone().sub(MITO.a); const t = Math.max(0, Math.min(1, v.clone().sub(MITO.a).dot(ab) / ab.lengthSq())); P.inMito = v.distanceTo(MITO.a.clone().addScaledVector(ab, t)) < MITO.r; P.g.position.copy(v); }, rings: () => W };
menu(); requestAnimationFrame(loop);
/* 메뉴 뒤 배경: 천천히 도는 카메라 */
camOverride = { pos: V(70, 30, 90), look: V(0, 0, -40) };
const _play = play; play = async (k) => { camOverride = null; IN.yaw = Math.PI; IN.pitch = -.18; return _play(k); };
