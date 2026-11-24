/* 일본 문화 — 「스즈 소리, 유나 목소리」  VRChat 상황극 스타일 스토리 학습
   모델: KB Poka Blind Girl / Blondy (Kilerbomb, 무료·수정 허용 라이선스, models/LICENSE_KB_Poka.txt) */
import * as THREE from 'three';
import { FBXLoader } from '../vendor/jsm/loaders/FBXLoader.js';

const $ = s => document.querySelector(s);
const ST = window.JPSTORY, QB = window.JPQUIZ;
const SAVEK = 'jp_story_v1';
let SAVE = { ep: 0, i: 0, aff: 50, right: {}, done: {}, miss: {}, words: {} }; try { Object.assign(SAVE, JSON.parse(localStorage.getItem(SAVEK)) || {}); } catch (e) { }
const save = () => { try { localStorage.setItem(SAVEK, JSON.stringify(SAVE)); } catch (e) { } };

/* ── 렌더러 ── */
const R = new THREE.WebGLRenderer({ antialias: true, canvas: $('#cv') }); R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(34, 1, .1, 400);
const hemi = new THREE.HemisphereLight('#ffffff', '#6a5a50', 1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff2e0', 2.2); sun.position.set(8, 18, 12); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(sun);
function resize() { const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); } addEventListener('resize', resize); resize();

/* ── 텍스처 도우미 ── */
const TL = new THREE.TextureLoader();
const tex = (u, rep) => { const t = TL.load(u); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } return t; };
function ctex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const M = (c, o = {}) => new THREE.MeshToonMaterial(Object.assign({ color: c }, o));
const box = (w, h, d, m) => { const x = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m.isMaterial ? m : M(m)); x.castShadow = x.receiveShadow = true; return x; };
const cyl = (r1, r2, h, m, s = 16) => { const x = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m.isMaterial ? m : M(m)); x.castShadow = true; return x; };
const at = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };

/* ── 아바타 ── */
const FACES = {
  o: { n: 0, blink: 1, lol: 2, ugh: 3, smile: 4, sad: 5, oh: 6, wow: 7, meh: 8, grin: 9, mad: 10, sleepy: 8, cry: 5, shy: 4, happy: 2, smug: 9, worry: 5, pout: 5, shout: 7, think: 8 },
  s: { n: 0, blink: 1, happy: 2, worry: 3, smug: 4, oh: 5, pout: 6, grin: 7, smile: 8, lol: 8, teeth: 9, shout: 10, wow: 10, blush: 11, shy: 11, sad: 3, cry: 3, mad: 6, think: 0, sleepy: 1, meh: 0 }
};
const AV = {};
const DEF = {
  s: { fbx: 'models/blindy/BlindGirl_PrimaryOutfitOnly_NoStencilMesh.fbx', face: 'models/blindy/Blindgirl_faces_eyes.png', body: 'models/blindy/bodyo.png', hair: 'models/blindy/hairdo.png', name: '야마시타 스즈', tag: '山下 鈴', col: '#ff9ab8' },
  o: { fbx: 'models/blondy/Blondy_NoStencilMesh.fbx', face: 'models/blondy/BlondyFaces_eyes.png', body: 'models/blondy/bodyo.png', hair: 'models/blondy/hairdo.png', name: '한유나 (나)', tag: 'Han Yuna', col: '#ffd23f' }
};
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
async function loadAvatar(k) {
  const d = DEF[k], o = await new FBXLoader().loadAsync(d.fbx); const g = new THREE.Group(); g.add(o); scene.add(g);
  const ft = tex(d.face); ft.repeat.set(.25, .25); ft.offset.set(0, .75);
  const B = {}; o.traverse(n => { if (n.isBone) B[n.name] = n; if (n.isMesh) { n.castShadow = true; n.frustumCulled = false;
    n.material = [].concat(n.material).map(m => m.name.includes('face') ? new THREE.MeshToonMaterial({ map: ft }) : new THREE.MeshToonMaterial({ map: tex(m.name.includes('hair') ? d.hair : d.body) })); } });
  o.updateMatrixWorld(true); const rq = o.getWorldQuaternion(new THREE.Quaternion()).invert();
  const rest = {}; for (const [n, b] of Object.entries(B)) rest[n] = { l: b.quaternion.clone(), w: rq.clone().multiply(b.getWorldQuaternion(new THREE.Quaternion())), p: b.position.clone() };
  const a = { k, g, o, B, rest, ft, face: 'n', faceT: 0, mot: 'idle', motT: 0, prev: null, prevT: 0, blend: 1, tgt: null, walkT: 0, props: {}, talk: 0, cell: 0 };
  /* 명찰 (VRChat 네임플레이트) */
  const np = document.createElement('div'); np.className = 'np'; np.innerHTML = `<b>${d.name}</b><small>${d.tag}</small><i class="mic"></i>`; np.style.setProperty('--c', d.col); $('#np').appendChild(np); a.np = np;
  AV[k] = a; return a;
}
function setFace(a, f) { const i = FACES[a.k][f] ?? FACES[a.k].n; a.cell = i; a.face = f; a.ft.offset.set((i % 4) * .25, .75 - Math.floor(i / 4) * .25); }
const qW = new THREE.Quaternion(), qT = new THREE.Quaternion(), eu = new THREE.Euler();
function applyPose(a, P) {
  for (const [n, r] of Object.entries(a.rest)) a.B[n].quaternion.copy(r.l);
  for (const [n, e] of Object.entries(P)) { const b = a.B[n], r = a.rest[n]; if (!b) continue; eu.set(e[0] || 0, e[1] || 0, e[2] || 0, 'YXZ'); qW.setFromEuler(eu);
    qT.copy(r.w).invert().multiply(qW).multiply(r.w); b.quaternion.copy(r.l).multiply(qT); }
}
/* 포즈 합치기 */
const add = (A, Bp, w = 1) => { for (const [k, v] of Object.entries(Bp)) { const o = A[k] || (A[k] = [0, 0, 0]); for (let i = 0; i < 3; i++) o[i] += (v[i] || 0) * w; } return A; };
const S = Math.sin, PI = Math.PI;
const ARMS_DOWN = { upperarm_L: [0, 0, -.95], upperarm_R: [0, 0, .95], forearm_L: [-.15, 0, -.1], forearm_R: [-.15, 0, .1] };
/* 동작: t(초) → 포즈 */
const MOT = {
  idle: t => ({ spine1: [S(t * 1.6) * .015, 0, S(t * .7) * .015], head: [S(t * .9) * .03, S(t * .5) * .06, 0], upperarm_L: [0, 0, S(t * 1.6) * .02], upperarm_R: [0, 0, -S(t * 1.6) * .02] }),
  talk: t => ({ head: [S(t * 6) * .05, S(t * 2) * .08, 0], forearm_R: [-.5 - S(t * 4) * .2, 0, 0], upperarm_R: [-.25, 0, -.1] }),
  nod: t => ({ head: [Math.max(0, S(t * 9)) * .35 * Math.max(0, 1 - t / 1.4), 0, 0] }),
  shake: t => ({ head: [0, S(t * 10) * .35 * Math.max(0, 1 - t / 1.6), 0] }),
  tilt: t => ({ head: [0, 0, .28 * Math.min(1, t * 4)], neck: [0, 0, .1] }),
  bow15: t => bow(t, .26), bow30: t => bow(t, .52), bow45: t => bow(t, .8),
  wave: t => ({ upperarm_R: [0, 0, -1.25], forearm_R: [0, 0, -.6 + S(t * 9) * .45], head: [0, 0, -.08] }),
  wave2: t => ({ upperarm_R: [0, 0, -1.3], forearm_R: [0, 0, -.5 + S(t * 9) * .45], upperarm_L: [0, 0, 1.3], forearm_L: [0, 0, .5 - S(t * 9) * .45] }),
  hands: t => ({ upperarm_L: [-.45, 0, .15], upperarm_R: [-.45, 0, -.15], forearm_L: [-.9, .5, 0], forearm_R: [-.9, -.5, 0], head: [.12, 0, 0] }),
  shy: t => ({ upperarm_L: [-.3, 0, .18], upperarm_R: [-.3, 0, -.18], forearm_L: [-.7, .6, 0], forearm_R: [-.7, -.6, 0], head: [.3, S(t * 2) * .05, .1], spine2: [.08, 0, 0] }),
  give: t => ({ upperarm_L: [-1.1, 0, .2], upperarm_R: [-1.1, 0, -.2], forearm_L: [-.3, .3, 0], forearm_R: [-.3, -.3, 0], spine1: [.18, 0, 0], head: [.15, 0, 0] }),
  point: t => ({ upperarm_R: [-1.3, 0, .35], forearm_R: [-.1, 0, 0], head: [0, -.1, 0] }),
  think: t => ({ upperarm_R: [-.6, 0, .25], forearm_R: [-1.9, -.3, 0], head: [.1, 0, .15 + S(t) * .04] }),
  mouth: t => ({ upperarm_R: [-.55, 0, .3], forearm_R: [-2.1, -.3, 0], head: [.12, 0, 0] }),
  clap: t => { const k = Math.abs(S(t * 8)) * .28; return { upperarm_L: [-.8, 0, .1 + k], upperarm_R: [-.8, 0, -.1 - k], forearm_L: [-.6, .7, 0], forearm_R: [-.6, -.7, 0] }; },
  jump: t => ({ upperarm_L: [0, 0, 1.6], upperarm_R: [0, 0, -1.6], forearm_L: [0, 0, .3], forearm_R: [0, 0, -.3], _y: Math.max(0, S(t * 7)) * 1.2 * (t < 1.8 ? 1 : 0) }),
  fist: t => ({ upperarm_R: [0, 0, -1.5 - Math.max(0, S(t * 6)) * .3], forearm_R: [0, 0, -.9], head: [-.12, 0, 0] }),
  laugh: t => ({ spine2: [.12 + S(t * 14) * .05, 0, 0], head: [-.15 + S(t * 14) * .06, 0, 0], upperarm_L: [-.3, 0, .2], upperarm_R: [-.3, 0, -.2], forearm_L: [-1, .5, 0], forearm_R: [-1, -.5, 0] }),
  cry: t => ({ head: [.42, 0, S(t * 3) * .05], spine2: [.15, 0, 0], upperarm_L: [-.6, 0, .25], upperarm_R: [-.6, 0, -.25], forearm_L: [-1.8, .2, 0], forearm_R: [-1.8, -.2, 0], _sh: S(t * 18) * .02 }),
  sulk: t => ({ upperarm_L: [-.55, 0, .25], upperarm_R: [-.55, 0, -.25], forearm_L: [-1.2, 1.1, 0], forearm_R: [-1.2, -1.1, 0], head: [-.05, .35, 0] }),
  shrug: t => ({ upperarm_L: [-.2, 0, .55], upperarm_R: [-.2, 0, -.55], forearm_L: [-.8, -.5, 0], forearm_R: [-.8, .5, 0], head: [0, 0, .15], shoulder_L: [0, 0, .15], shoulder_R: [0, 0, -.15] }),
  hug: t => ({ upperarm_L: [-1.25, -.3, .35], upperarm_R: [-1.25, .3, -.35], forearm_L: [0, 1.1, 0], forearm_R: [0, -1.1, 0], spine1: [.1, 0, 0], head: [.1, 0, .15] }),
  pat: t => ({ upperarm_R: [-1.7, 0, .1], forearm_R: [-.5 + S(t * 8) * .15, 0, 0], head: [.08, 0, -.1] }),
  pray: t => { const c = t < 1.6 ? Math.abs(S(t * 6)) * .3 : 0; return { upperarm_L: [-.9, 0, .05 + c], upperarm_R: [-.9, 0, -.05 - c], forearm_L: [-.7, .75, 0], forearm_R: [-.7, -.75, 0], head: [t > 1.6 ? .35 : .1, 0, 0], spine1: [t > 1.6 ? .25 : 0, 0, 0] }; },
  throw: t => ({ upperarm_R: [-1.6 + S(t * 7) * .7, 0, -.2], forearm_R: [-.4, 0, 0], spine2: [S(t * 7) * .1, -.2, 0] }),
  dance: t => ({ upperarm_L: [-.6 + S(t * 3) * .5, 0, 1 + S(t * 3) * .3], upperarm_R: [-.6 - S(t * 3) * .5, 0, -1 + S(t * 3) * .3], forearm_L: [0, 0, .6], forearm_R: [0, 0, -.6], spine1: [0, S(t * 3) * .2, 0], _y: Math.abs(S(t * 3)) * .15 }),
  cane: t => ({ upperarm_R: [-.35, 0, .55], forearm_R: [-.4 + S(t * 4) * .15, 0, 0], head: [.06, S(t * .8) * .25, 0] }),
  listen: t => ({ head: [-.05, .45, .18], upperarm_R: [-.5, 0, .3], forearm_R: [-1.9, -.4, 0] }),
  eat: t => ({ upperarm_R: [-.6, 0, .25], forearm_R: [-1.8 - Math.max(0, S(t * 5)) * .3, -.2, 0], upperarm_L: [-.6, 0, .2], forearm_L: [-.9, .5, 0], head: [.15, 0, 0] }),
  card: t => ({ upperarm_R: [-.9 - Math.max(0, S(t * 5)) * .4, 0, .3], forearm_R: [-.2, 0, 0], spine1: [.35, 0, 0], head: [.25, 0, 0] }),
  sleep: t => ({ head: [.45, 0, .3 + S(t) * .03], spine2: [.1, 0, .05] }),
  stretch: t => ({ upperarm_L: [0, 0, 1.9], upperarm_R: [0, 0, -1.9], forearm_L: [0, 0, .6], forearm_R: [0, 0, -.6], spine1: [-.1, 0, S(t * 2) * .1] })
};
function bow(t, d) { const k = t < .6 ? t / .6 : t < 1.8 ? 1 : Math.max(0, 1 - (t - 1.8) / .6); return { spine1: [d * k * .6, 0, 0], spine2: [d * k * .4, 0, 0], head: [.1 * k, 0, 0], upperarm_L: [-.2 * k, 0, .1], upperarm_R: [-.2 * k, 0, -.1], forearm_L: [-.3 * k, .3 * k, 0], forearm_R: [-.3 * k, -.3 * k, 0] }; }
function motion(a, m) { if (!m || m === a.mot) { a.motT = Math.min(a.motT, .01); a.mot = m || a.mot; return; } a.prev = a.mot; a.prevT = a.motT; a.mot = m; a.motT = 0; a.blend = 0; }
const ONCE = { nod: 1.6, shake: 1.8, bow15: 2.6, bow30: 2.6, bow45: 2.6, jump: 2, throw: 2.5 };
function stepAvatar(a, dt, T) {
  a.motT += dt; a.prevT += dt; a.blend = Math.min(1, a.blend + dt * 4);
  if (ONCE[a.mot] && a.motT > ONCE[a.mot]) motion(a, 'idle');
  const P = add(add({}, ARMS_DOWN), MOT.idle(T + (a.k === 's' ? 1 : 0)));
  const cur = (MOT[a.mot] || MOT.idle)(a.motT), pr = a.prev ? (MOT[a.prev] || MOT.idle)(a.prevT) : {};
  if (a.blend < 1) add(P, pr, 1 - a.blend); add(P, cur, a.blend);
  if (a.talk > 0 && (a.mot === 'idle')) add(P, MOT.talk(T), .6);
  /* 걷기 */
  let wy = 0; if (a.tgt) { const g = a.g, d = a.tgt.p.clone().sub(g.position); d.y = 0; const L = d.length();
    if (L < .05) { g.position.copy(a.tgt.p); if (a.tgt.ry !== undefined) g.rotation.y = a.tgt.ry; a.tgt = null; }
    else { const sp = (a.k === 's' ? 3.2 : 5) * dt; g.position.addScaledVector(d.normalize(), Math.min(sp, L)); const ry = Math.atan2(d.x, d.z); g.rotation.y += ((((ry - g.rotation.y) % (2 * PI)) + 3 * PI) % (2 * PI) - PI) * Math.min(1, dt * 8);
      a.walkT += dt * 7; add(P, { upper_leg_L: [S(a.walkT) * .45, 0, 0], upper_leg_R: [-S(a.walkT) * .45, 0, 0], lower__leg_L: [-Math.max(0, -S(a.walkT)) * .6, 0, 0], lower__leg_R: [-Math.max(0, S(a.walkT)) * .6, 0, 0], upperarm_L: [-S(a.walkT) * .25, 0, 0], upperarm_R: [S(a.walkT) * .25, 0, 0] }); wy = Math.abs(S(a.walkT)) * .12; } }
  const y = (P._y ? P._y[0] : 0) + wy; const sh = P._sh ? P._sh[0] : 0; delete P._y; delete P._sh;
  a.o.position.set(sh, y, 0); applyPose(a, P);
  /* 깜빡임 */
  a.faceT -= dt; if (a.faceT < 0) { const base = a.face; if (FACES[a.k][base] !== undefined && ['n', 'smile', 'worry', 'oh', 'smug', 'mad', 'pout', 'sad', 'meh', 'think'].includes(base)) { a.ft.offset.set(.25, .75); setTimeout(() => setFace(a, a.face), 110); } a.faceT = 2.5 + Math.random() * 3; }
  if (a.talk > 0) a.talk -= dt;
  /* 지팡이 */
  if (a.props.cane) { const h = a.B.hand_R; h.updateMatrixWorld(); h.getWorldPosition(a.props.cane.position); a.props.cane.position.y -= 0; const tip = a.g.position.clone().add(V3(0, 0, 0)).add(V3(Math.sin(a.g.rotation.y) * 2.2, 0, Math.cos(a.g.rotation.y) * 2.2)); tip.x += S(T * 4) * .5 * Math.cos(a.g.rotation.y); a.props.cane.lookAt(tip); }
  for (const [n, p] of Object.entries(a.props)) if (n !== 'cane' && p) { const h = a.B[p.userData.bone || 'hand_R']; h.updateMatrixWorld(); h.getWorldPosition(p.position); p.position.add(p.userData.off || V3(0, 0, 0)); }
}
/* 소품 */
function makeProp(n) {
  const g = new THREE.Group();
  if (n === 'cane') { const c = cyl(.06, .06, 6.2, M('#f4f4f4')); c.rotation.x = PI / 2; c.position.z = 3.1; g.add(c); const r = cyl(.07, .07, .9, M('#d22')); r.rotation.x = PI / 2; r.position.z = 5.8; g.add(r); return g; }
  if (n === 'card') { const c = box(1, .02, .6, M('#fff')); g.add(c); g.userData.off = V3(0, .1, .3); return g; }
  if (n === 'gift') { g.add(box(1.4, 1, 1, M('#d9455f'))); g.add(box(1.45, .15, 1.05, M('#ffd23f'))); g.add(box(.15, 1.05, 1.05, M('#ffd23f'))); g.userData.off = V3(0, -.2, .7); return g; }
  if (n === 'bag') { g.add(box(1.2, 1.5, .5, M('#c8a070'))); g.userData.off = V3(0, -.9, 0); return g; }
  if (n === 'karuta') { g.add(box(.5, .02, .72, M('#f8f0d8'))); g.userData.off = V3(0, 0, .2); return g; }
  if (n === 'phone') { g.add(box(.45, .9, .06, M('#222'))); g.userData.off = V3(0, .3, .2); return g; }
  if (n === 'beans') { g.add(box(.9, .5, .9, M('#b5874a'))); g.userData.off = V3(0, 0, .4); g.userData.bone = 'hand_L'; return g; }
  if (n === 'sparkler') { g.add(cyl(.02, .02, 1.2, M('#888'))); const s = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffcc55' })); s.position.y = .6; g.add(s); g.userData.off = V3(0, .4, .3); return g; }
  if (n === 'tanzaku') { g.add(box(.35, 1.1, .02, M('#ff7ab0'))); g.userData.off = V3(0, .3, .3); return g; }
  if (n === 'bouquet') { g.add(cyl(.35, .1, 1, M('#e8e0c8'))); for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 8), M(['#ff9ab8', '#fff', '#ffd23f'][i % 3])); f.position.set(S(i * 2) * .25, .6, Math.cos(i * 2) * .25); g.add(f); } g.userData.off = V3(0, 0, .5); return g; }
  return g;
}
function prop(k, n, on = true) { const a = AV[k]; if (!a) return; if (a.props[n]) { scene.remove(a.props[n]); delete a.props[n]; } if (on) { const p = makeProp(n); scene.add(p); a.props[n] = p; } }

/* ── 배경 (월드) ── */
let WORLD = null, FX = null;
const wood = ctex(256, 256, (x, w, h) => { x.fillStyle = '#b48455'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(90,50,20,${.1 + Math.random() * .2})`; x.beginPath(); x.moveTo(0, i * 7 + Math.random() * 4); x.bezierCurveTo(80, i * 7 + 6, 170, i * 7 - 6, 256, i * 7 + 2); x.stroke(); } }, [4, 4]);
const tatami = ctex(256, 256, (x, w, h) => { x.fillStyle = '#c9c48a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 128; i++) { x.fillStyle = `rgba(110,110,50,${.08 + (i % 2) * .08})`; x.fillRect(0, i * 2, w, 1); } x.fillStyle = '#2c3a2a'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10); }, [3, 6]);
const shoji = ctex(256, 256, (x, w, h) => { x.fillStyle = '#f6f0e2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5530'; x.lineWidth = 6; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); } }, [1, 1]);
const board = ctex(512, 256, (x, w, h) => { x.fillStyle = '#244a36'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a30'; x.lineWidth = 14; x.strokeRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.75)'; x.font = '900 40px sans-serif'; x.fillText('今日の日直', 30, 70); x.font = '700 30px sans-serif'; x.fillText('山下 ・ ハン', 40, 130); });
const signTex = (t, bg = '#fff', fg = '#222', w = 512, h = 128, f = 64) => ctex(w, h, (x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = `900 ${f}px "Noto Sans JP",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, w / 2, h / 2 + 4); });
function sky(top, bot) { return new THREE.Mesh(new THREE.SphereGeometry(180, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(bot) } }, vertexShader: 'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'uniform vec3 a,b;varying float h;void main(){gl_FragColor=vec4(mix(b,a,clamp(h*1.4+.2,0.,1.)),1.);}' })); }
function ground(c, s = 80, map) { const g = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshToonMaterial({ color: map ? '#fff' : c, map })); g.rotation.x = -PI / 2; g.receiveShadow = true; return g; }
function lantern(col = '#ff5a3a') { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 10), new THREE.MeshBasicMaterial({ color: col })); b.scale.y = 1.25; g.add(b); g.add(at(cyl(.4, .4, .15, M('#222')), 0, .95, 0)); g.add(at(cyl(.4, .4, .15, M('#222')), 0, -.95, 0)); return g; }
function tree(c = '#4a8a3a', h = 7) { const g = new THREE.Group(); g.add(at(cyl(.4, .6, h, M('#6a4a2a')), 0, h / 2, 0)); const f = new THREE.Mesh(new THREE.IcosahedronGeometry(h * .45, 1), M(c, { flatShading: true })); f.position.y = h; f.castShadow = true; g.add(f); return g; }
const WORLDS = {
  genkan(g) { g.add(sky('#9ac8f0', '#f6e8d8')); g.add(ground('#8a8070', 80)); const fl = box(30, 1.2, 18, M('#fff', { map: wood })); fl.position.set(0, .6, -6); g.add(fl);
    g.add(at(box(30, 14, .5, M('#efe6d4')), 0, 7, -15)); for (let i = -2; i <= 2; i++) g.add(at(box(5, 9, .2, M('#fff', { map: shoji })), i * 5.4, 5.7, -14.6));
    g.add(at(box(6, .8, 3, M('#7a5530')), 9, 1.6, -11)); /* 신발장 */ 
    for (let i = 0; i < 3; i++) { const sh = box(.9, .5, 2, M(['#333', '#a33', '#335'][i])); sh.position.set(-4 + i * 1.6, 1.45, 2.2); g.add(sh); }
    g.add(at(box(2.2, 3, .2, M('#fff', { map: signTex('山下', '#f8f2e4', '#333', 256, 256, 120) })), 13, 9, -14.6)); return { o: [0, 1.2, 6, PI], s: [0, 1.2, -1, 0] }; },
  room(g) { g.add(sky('#ffd0a0', '#fff0e0')); const fl = ground('#fff', 60, tatami); fl.position.y = .01; g.add(fl);
    [[-14, 0], [14, 0]].forEach(([x]) => g.add(at(box(.5, 14, 40, M('#efe6d4')), x, 7, 0))); g.add(at(box(30, 14, .5, M('#efe6d4')), 0, 7, -12));
    for (let i = -2; i <= 2; i++) g.add(at(box(5, 9, .2, M('#fff', { map: shoji })), i * 5.4, 5.5, -11.6));
    const k = box(7, 2.2, 5, M('#8a3a2a')); k.position.set(0, 1.1, 2); g.add(k); g.add(at(box(6, .3, 4, M('#c8a070')), 0, 2.3, 2)); /* 고타쓰 */
    g.add(at(box(4, 6, 1.5, M('#5a3a1a')), 10, 3, -10)); return { o: [-3.5, 0, 6, PI * .85], s: [3.5, 0, 6, -PI * .85] }; },
  class(g) { g.add(sky('#bfe0ff', '#ffffff')); const fl = ground('#fff', 80, wood); g.add(fl); g.add(at(box(40, 14, .4, M('#f2efe6')), 0, 7, -14)); g.add(at(box(16, 6, .2, M('#fff', { map: board })), 0, 6.5, -13.7));
    g.add(at(box(.4, 14, 40, M('#f2efe6')), -18, 7, 0)); for (let i = 0; i < 3; i++) g.add(at(box(.2, 6, 7, new THREE.MeshBasicMaterial({ color: '#cfeaff' })), 17.8, 7, -8 + i * 8));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const d = new THREE.Group(); d.add(at(box(3, .2, 2, M('#c89a60')), 0, 3, 0)); d.add(at(box(2.6, 2.9, .2, M('#8a8a8a')), 0, 1.5, -.9)); d.position.set(-9 + c * 6, 0, -4 + r * 6 + (r > 0 ? 6 : 0)); g.add(d); }
    return { o: [-2.5, 0, 4, PI * .9], s: [2.5, 0, 4, -PI * .9] }; },
  club(g) { WORLDS.room(g); for (let i = 0; i < 24; i++) { const c = box(.5, .03, .72, M('#f8f0d8')); c.position.set(-4 + (i % 8) * .7, .05, 1 + Math.floor(i / 8) * 1); g.add(c); } g.add(at(box(6, 2, .2, M('#fff', { map: signTex('競技かるた部', '#fff', '#a22', 512, 160, 60) })), 0, 9, -11.5)); return { o: [-3.5, 0, 6, PI * .85], s: [3.5, 0, 6, -PI * .85] }; },
  shrine(g, night) { g.add(sky(night ? '#0a1030' : '#9ac8f0', night ? '#2a2050' : '#f0f0ff')); g.add(ground(night ? '#5a5a6a' : '#c8c0a8', 120));
    const tor = new THREE.Group(); const red = M('#d8342a'); tor.add(at(cyl(.5, .55, 12, red), -6, 6, 0)); tor.add(at(cyl(.5, .55, 12, red), 6, 6, 0)); tor.add(at(box(16, .9, 1, M('#222')), 0, 12.3, 0)); tor.add(at(box(14, .6, .7, red), 0, 10.4, 0)); tor.position.z = -6; g.add(tor);
    const hall = new THREE.Group(); hall.add(at(box(18, 8, 10, M('#a8623a')), 0, 4, 0)); const roof = new THREE.Mesh(new THREE.ConeGeometry(15, 6, 4), M('#3a4a3a')); roof.rotation.y = PI / 4; roof.position.y = 11; roof.scale.z = .7; hall.add(roof); hall.position.set(0, 0, -30); g.add(hall);
    g.add(at(box(3, 2, 2, M('#7a5530')), 0, 1, -24)); /* 새전함 */ const bell = cyl(.6, .9, 1.4, M('#c8a040')); bell.position.set(0, 7, -24.5); g.add(bell);
    for (let i = 0; i < 8; i++) { const l = lantern(night ? '#ffb060' : '#f8f0e0'); l.position.set(i % 2 ? 8 : -8, 3, -2 - Math.floor(i / 2) * 7); g.add(l); }
    for (let i = 0; i < 10; i++) g.add(at(tree('#2a5a2a', 9), (i % 2 ? 1 : -1) * (16 + Math.random() * 10), 0, -10 - i * 6));
    if (night) { scene.fog = new THREE.Fog('#1a1838', 40, 140); } return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  festival(g) { WORLDS.shrine(g, true); for (let i = 0; i < 30; i++) { const l = lantern(['#ff5a3a', '#ffd060', '#ff9ab8'][i % 3]); l.scale.setScalar(.6); l.position.set(-14 + (i % 15) * 2, 9 + S(i) * .5, i < 15 ? 4 : -4); g.add(l); }
    const yag = new THREE.Group(); yag.add(at(box(6, 4, 6, M('#8a2a2a')), 0, 2, 0)); yag.add(at(box(7, .4, 7, M('#ffd060')), 0, 4.2, 0)); yag.position.set(0, 0, -14); g.add(yag);
    for (let i = 0; i < 3; i++) { const b = new THREE.Group(); b.add(at(cyl(.15, .15, 14, M('#4a9a3a')), 0, 7, 0)); for (let j = 0; j < 14; j++) { const t = box(.3, 1, .03, M(['#ff7ab0', '#7ab8ff', '#ffe27a', '#9aff7a'][j % 4])); t.position.set(S(j * 3) * 1.8, 6 + (j % 7) * 1.1, Math.cos(j * 3) * 1.8); b.add(t); } b.position.set(-12 + i * 12, 0, -2); g.add(b); }
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  street(g) { g.add(sky('#ffc8d8', '#fff8f0')); g.add(ground('#9a9a9a', 120)); for (let i = 0; i < 12; i++) { const t = tree('#ffb8d0', 8); t.position.set((i % 2 ? 1 : -1) * 9, 0, -40 + i * 7); g.add(t); }
    for (let i = 0; i < 6; i++) g.add(at(box(8, 10 + (i % 3) * 3, 8, M(['#e8dcc8', '#d8d0c0', '#f0e8d8'][i % 3])), (i % 2 ? 1 : -1) * 20, 5, -30 + i * 10)); return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  school(g) { g.add(sky('#9ac8f0', '#ffffff')); g.add(ground('#c8b48a', 160)); const sb = box(60, 16, 10, M('#f2f0ea')); sb.position.set(0, 8, -40); g.add(sb); for (let i = 0; i < 10; i++) g.add(at(box(4, 2.5, .2, new THREE.MeshBasicMaterial({ color: '#bfe0ff' })), -24 + i * 5.3, 11, -34.9));
    g.add(at(box(3, 3, .2, M('#fff', { map: signTex('時計', '#fff', '#222', 128, 128, 40) })), 0, 14.5, -34.8)); for (let i = 0; i < 6; i++) { const t = tree('#ffb8d0', 9); t.position.set(-30 + i * 12, 0, -25); g.add(t); }
    for (let i = 0; i < 8; i++) { const b = new THREE.Group(); b.add(at(new THREE.Mesh(new THREE.TorusGeometry(.8, .1, 6, 16), M('#333')), -.9, .9, 0)); b.add(at(new THREE.Mesh(new THREE.TorusGeometry(.8, .1, 6, 16), M('#333')), .9, .9, 0)); b.children.forEach(c => c.rotation.y = PI / 2); b.position.set(16 + (i % 4) * 1.2, 0, -10 - Math.floor(i / 4) * 3); b.rotation.y = PI / 2; g.add(b); }
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  hospital(g) { g.add(sky('#e8f0ff', '#ffffff')); g.add(ground('#e8e8e0', 60)); g.add(at(box(30, 14, .4, M('#f4f6f8')), 0, 7, -10)); g.add(at(box(.4, 14, 30, M('#f4f6f8')), -14, 7, 0));
    const bed = new THREE.Group(); bed.add(at(box(5, 1.6, 9, M('#fff')), 0, 1.6, 0)); bed.add(at(box(5, 3, .4, M('#9ab')), 0, 2.5, -4.4)); bed.position.set(5, 0, -3); g.add(bed); g.add(at(box(6, 6, .2, new THREE.MeshBasicMaterial({ color: '#cfeaff' })), 13.8, 7, -2)); return { o: [-1.5, 0, 4, PI * .8], s: [4, 0, 0, -PI * .6] }; },
  airport(g) { g.add(sky('#cfe4ff', '#ffffff')); g.add(ground('#d8dce0', 160)); g.add(at(box(80, 18, .5, M('#eef2f6')), 0, 9, -24)); for (let i = 0; i < 6; i++) g.add(at(box(10, 12, .2, new THREE.MeshBasicMaterial({ color: '#9fd0ff' })), -30 + i * 12, 9, -23.6));
    g.add(at(box(14, 2.2, .3, M('#fff', { map: signTex('出発口  Departure  출국', '#1a3a6a', '#fff', 1024, 160, 70) })), 0, 13, -10)); g.add(at(box(.6, 11, .6, M('#888')), -7, 5.5, -10)); g.add(at(box(.6, 11, .6, M('#888')), 7, 5.5, -10));
    return { o: [0, 0, -6, 0], s: [0, 0, 4, PI] }; },
  stadium(g) { g.add(sky('#7ab8ff', '#ffffff')); g.add(ground('#c88a5a', 200)); const field = ground('#3a8a3a', 60); field.position.set(0, .02, -20); g.add(field);
    for (let i = 0; i < 5; i++) g.add(at(box(80, 3, 4, M(['#e8e8e8', '#d8d8d8'][i % 2])), 0, 1.5 + i * 2.2, 20 + i * 4)); g.add(at(box(30, 8, 1, M('#fff', { map: signTex('全国高等学校野球選手権', '#1a5a2a', '#fff', 1024, 256, 70) })), 0, 14, -60));
    return { o: [-2.5, 0, 6, PI * .9], s: [2.5, 0, 6, -PI * .9] }; },
  kyoto(g) { WORLDS.street(g); for (let i = 0; i < 5; i++) { const p = new THREE.Group(); p.add(at(box(6 - i * .8, 3, 6 - i * .8, M('#a8623a')), 0, 1.5, 0)); const r = new THREE.Mesh(new THREE.ConeGeometry((7 - i * .8) * .75, 1.4, 4), M('#2a3a3a')); r.rotation.y = PI / 4; r.position.y = 3.6; p.add(r); p.position.set(14, i * 3.8, -30); g.add(p); } return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; }
};
let SPOTS = null;
function setWorld(n) {
  if (WORLD) scene.remove(WORLD); scene.fog = null; WORLD = new THREE.Group(); SPOTS = (WORLDS[n] || WORLDS.room)(WORLD, false); scene.add(WORLD);
  const night = ['festival'].includes(n) || (n === 'shrine' && CUR.night); hemi.intensity = night ? 1.1 : 1.6; sun.intensity = night ? .8 : 2.2; R.toneMappingExposure = night ? 1.35 : 1.05;
  /* 나란히 선 장면은 서로 마주 보면서 카메라(+z) 쪽으로 살짝 */
  if (Math.abs(SPOTS.o[2] - SPOTS.s[2]) < 1.5) { const k = SPOTS.o[0] < SPOTS.s[0] ? 1 : -1; SPOTS.o[3] = k * 1.15; SPOTS.s[3] = -k * 1.15; }
  place('o', SPOTS.o); place('s', SPOTS.s); FXclear();
}
function place(k, p) { const a = AV[k]; if (!a || !p) return; a.g.position.set(p[0], p[1] || 0, p[2]); a.g.rotation.y = p[3] || 0; a.tgt = null; }
function walk(k, x, z, ry) { const a = AV[k]; if (a) a.tgt = { p: V3(x, a.g.position.y, z), ry }; }

/* ── 효과: 벚꽃 · 눈 · 불꽃 · 반딧불 ── */
let parts = null;
function FXclear() { if (parts) { scene.remove(parts.m); parts = null; } }
function fx(kind) { FXclear(); if (!kind) return; const n = kind === 'fireworks' ? 600 : 260, geo = new THREE.BufferGeometry(), P = new Float32Array(n * 3), V = [];
  for (let i = 0; i < n; i++) { P[i * 3] = (Math.random() - .5) * 50; P[i * 3 + 1] = Math.random() * 25; P[i * 3 + 2] = (Math.random() - .5) * 40; V.push(Math.random()); }
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); const col = { sakura: '#ffb8d0', snow: '#ffffff', fireworks: '#ffd060', firefly: '#d8ff60', confetti: '#ff7ab0', beans: '#c8a060' }[kind] || '#fff';
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: kind === 'fireworks' ? .35 : .45, transparent: true, opacity: .9, depthWrite: false })); scene.add(m); parts = { m, kind, V, t: 0 }; }
function stepFX(dt) { if (!parts) return; parts.t += dt; const P = parts.m.geometry.attributes.position, k = parts.kind;
  for (let i = 0; i < P.count; i++) { let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const v = parts.V[i];
    if (k === 'fireworks') { const c = Math.floor(i / 100), ph = (parts.t * .5 + c * .37) % 1, cx = ((c * 37) % 7 - 3) * 8, cy = 30 + (c % 3) * 5, a = i * 2.39996, r = ph * 12 * (0.6 + v * .4); x = cx + Math.cos(a) * r; y = cy + Math.sin(a * .7) * r - ph * ph * 6; z = -40 + Math.sin(a) * r * .5; parts.m.material.color.setHSL((c * .17 + .05) % 1, .9, .6); parts.m.material.opacity = 1 - ph; }
    else if (k === 'firefly') { x += S(parts.t + v * 9) * dt; y = 2 + Math.abs(S(parts.t * .5 + v * 7)) * 6; }
    else { y -= dt * (k === 'snow' ? 1.5 : 2.2) * (.5 + v); x += S(parts.t + v * 6) * dt * 1.5; if (y < 0) y = 25; }
    P.setXYZ(i, x, y, z); } P.needsUpdate = true; }

/* ── 카메라 연출 ── */
let shot = 'two', camT = 0, shake = 0;
const camPos = V3(0, 6, 20), camLook = V3(0, 5, 0);
function shotTarget() { const o = AV.o.g.position, s = AV.s.g.position, mid = o.clone().add(s).multiplyScalar(.5), d = s.clone().sub(o); d.y = 0; const L = Math.max(3, d.length()); d.normalize(); const side = V3(-d.z, 0, d.x);
  const sw = S(camT * .25) * .6; let p, l;
  if (shot === 'suzu') { p = o.clone().addScaledVector(d, -2.2).addScaledVector(side, 4.2).add(V3(0, 7.7, 0)); l = s.clone().add(V3(0, 6.8, 0)); }
  else if (shot === 'onna') { p = s.clone().addScaledVector(d, 2.2).addScaledVector(side, 4.2).add(V3(0, 7.7, 0)); l = o.clone().add(V3(0, 6.8, 0)); }
  else if (shot === 'close') { p = s.clone().addScaledVector(d, -2.6).addScaledVector(side, 3).add(V3(sw * .5, 7.3, 0)); l = s.clone().add(V3(0, 6.9, 0)); }
  else if (shot === 'closeo') { p = o.clone().addScaledVector(d, 2.6).addScaledVector(side, 3).add(V3(sw * .5, 7.3, 0)); l = o.clone().add(V3(0, 6.9, 0)); }
  else if (shot === 'wide') { p = mid.clone().addScaledVector(side, 26 + L).add(V3(sw * 4, 12, 0)); l = mid.clone().add(V3(0, 4, 0)); }
  else if (shot === 'sky') { p = mid.clone().addScaledVector(side, 18).add(V3(0, 4, 0)); l = mid.clone().add(V3(0, 18, -20)); }
  else { p = mid.clone().addScaledVector(side, 13 + L * .6).add(V3(sw, 7, 0)); l = mid.clone().add(V3(0, 5.6, 0)); }
  return [p, l]; }
function stepCam(dt) { camT += dt; const [p, l] = shotTarget(); const k = Math.min(1, dt * 2.6); camPos.lerp(p, k); camLook.lerp(l, k); cam.position.copy(camPos); if (shake > 0) { shake -= dt; cam.position.x += (Math.random() - .5) * shake; cam.position.y += (Math.random() - .5) * shake; } cam.lookAt(camLook); }

/* ── 명찰 · 말풍선 위치 ── */
const tmpV = V3(0, 0, 0);
function stepTags() { for (const a of Object.values(AV)) { a.B.head.getWorldPosition(tmpV); tmpV.y += 2.6; tmpV.project(cam); const vis = tmpV.z < 1; a.np.style.display = vis ? '' : 'none';
  a.np.style.transform = `translate(${(tmpV.x * .5 + .5) * innerWidth}px,${(-tmpV.y * .5 + .5) * innerHeight}px) translate(-50%,-100%)`; a.np.classList.toggle('talk', a.talk > 0); } }

/* ── TTS (캐릭터마다 다른 기계 더빙 목소리) ── */
const VO = { n: { lang: 'ko', pitch: .55, rate: .92 }, o: { lang: 'ko', pitch: 1.15, rate: 1.08 }, s: { lang: 'ko', pitch: 1.65, rate: .98, jp: 1.7 }, m: { lang: 'ko', pitch: 1.05, rate: .95, jp: 1.1 }, d: { lang: 'ko', pitch: .7, rate: .95, jp: .7 }, h: { lang: 'ko', pitch: 2, rate: 1.12, jp: 2 }, k: { lang: 'ko', pitch: 1.3, rate: .9, jp: 1.25 }, t: { lang: 'ko', pitch: .8, rate: .92, jp: .8 }, r: { lang: 'ko', pitch: .95, rate: 1.05, jp: .95 }, f: { lang: 'ko', pitch: .6, rate: .9, jp: .6 } };
let voices = [], voiceOn = true, speedK = 1; try { voiceOn = localStorage.getItem('jp_voice') !== '0'; } catch (e) { }
const loadV = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { } }; if ('speechSynthesis' in window) { loadV(); speechSynthesis.onvoiceschanged = loadV; } else voiceOn = false;
const pickV = (lang, k) => { const L = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang)); if (!L.length) return null; const idx = { n: 0, o: 1, s: 2, m: 3, d: 0, h: 2, k: 1, t: 0, r: 1 }[k] || 0; return L[idx % L.length]; };
const clean = s => s.replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, '').replace(/[·…]/g, ' ').replace(/[~♡♪]/g, '');
function speak(who, html) { return new Promise(res => { if (!voiceOn) return res();
  try { speechSynthesis.cancel(); } catch (e) { } const V = VO[who] || VO.n; const segs = [];
  /* 「일본어」는 일본어 목소리로 */
  const re = /「([^」]+)」/g; let last = 0, m; const t = clean(html);
  while ((m = re.exec(t))) { if (m.index > last) segs.push(['ko', t.slice(last, m.index)]); segs.push([/[぀-ヿ一-鿿]/.test(m[1]) ? 'ja' : 'ko', m[1]]); last = re.lastIndex; } if (last < t.length) segs.push(['ko', t.slice(last)]);
  const list = segs.filter(s => s[1].trim()); if (!list.length) return res(); let i = 0, done = false; const fin = () => { if (!done) { done = true; res(); } };
  const next = () => { if (i >= list.length) return fin(); const [lg, tx] = list[i++]; const u = new SpeechSynthesisUtterance(tx); u.lang = lg === 'ja' ? 'ja-JP' : 'ko-KR'; const v = pickV(lg, who); if (v) u.voice = v;
    u.pitch = Math.min(2, lg === 'ja' ? (V.jp || V.pitch) : V.pitch); u.rate = (V.rate) * speedK * (lg === 'ja' ? .95 : 1); u.onend = next; u.onerror = next; speechSynthesis.speak(u); };
  next(); setTimeout(fin, 3000 + t.length * 160); }); }

/* ── 화면 UI ── */
const NAMES = { n: '', o: '한유나', s: '야마시타 스즈', m: '스즈 엄마 (유미코)', d: '스즈 아빠 (다케시)', h: '하나 (스즈 동생, 7살)', k: '시라이시 미야코 선배', t: '다나카 선생님', r: '반 친구', f: '시라이시 아버님' };
const COLS = { n: '#cfd8ff', o: '#ffd23f', s: '#ff9ab8', m: '#ffb070', d: '#8ac8ff', h: '#ffe27a', k: '#b8a0ff', t: '#9adfb0', r: '#7fe0ff', f: '#c8b090' };
const box$ = $('#dlg'), nm = $('#dlg .nm'), tx$ = $('#dlg .tx');
let typing = null, auto = true; try { auto = localStorage.getItem('jp_auto') !== '0'; } catch (e) { }
function typeOut(html) { return new Promise(res => { clearInterval(typing); const plain = html; let n = 0; const total = plain.replace(/<[^>]+>/g, '').length; tx$.innerHTML = '';
  typing = setInterval(() => { n += 2; if (n >= total) { clearInterval(typing); typing = null; tx$.innerHTML = html; res(); return; } tx$.innerHTML = cutHTML(html, n); }, 22); tx$.onclick = () => { if (typing) { clearInterval(typing); typing = null; tx$.innerHTML = html; res(); } }; }); }
function cutHTML(h, n) { let out = '', c = 0, inTag = false; for (const ch of h) { if (ch === '<') inTag = true; if (inTag) { out += ch; if (ch === '>') inTag = false; continue; } if (c >= n) break; out += ch; c++; } return out; }
let waitTap = null;
function tapWait(ms) { return new Promise(res => { let t = null; const go = () => { clearTimeout(t); box$.onclick = null; waitTap = null; res(); }; waitTap = go; box$.onclick = e => { if (e.target.closest('button')) return; go(); }; if (auto && ms) t = setTimeout(go, ms); }); }
document.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && waitTap && !$('#menu').offsetParent) { e.preventDefault(); waitTap(); } });

/* 액션 메뉴 (VRChat 원형 메뉴) — 유나의 선택 */
function radial(q, opts) { return new Promise(res => { const w = $('#radial'); const n = opts.length; const ord = opts.map((_, i) => i).sort(() => Math.random() - .5);
  w.innerHTML = `<div class="rq">${q}</div><div class="ring">${ord.map((k, j) => { const a = -PI / 2 + j * 2 * PI / n; return `<button data-k="${k}" style="--x:${Math.cos(a) * 150}px;--y:${Math.sin(a) * 150}px">${opts[k]}</button>`; }).join('')}<div class="hub">🎮<small>유나의 선택</small></div></div>`;
  w.hidden = false; w.onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; w.hidden = true; res(+b.dataset.k); }; }); }

/* ── 교과서 확인 문제 (월드 안 퀴즈 보드) ── */
async function quiz(id) {
  const set = QB[id]; if (!set) return; const w = $('#quiz'); let right = 0;
  for (let i = 0; i < set.qs.length; i++) { const q = set.qs[i];
    const ord = q.o.map((_, k) => k); if (!q.keep) ord.sort(() => Math.random() - .5);
    w.innerHTML = `<div class="qb"><div class="qh"><b>📝 ${set.t}</b><span>${i + 1} / ${set.qs.length}</span></div><div class="qs">${set.src || ''}</div><div class="qq">${q.q}</div><div class="qo">${ord.map(k => `<button data-k="${k}">${q.o[k]}</button>`).join('')}</div><div class="qx"></div></div>`;
    w.hidden = false; speak('n', q.q.replace(/<[^>]+>/g, ''));
    const ok = await new Promise(res => { let tries = 0; w.onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, x = w.querySelector('.qx');
      if (k === q.a) { b.classList.add('right'); w.querySelectorAll('[data-k]').forEach(z => z.disabled = true); x.className = 'qx ok'; x.innerHTML = `⭕ 정답! ${q.e || ''}<button class="nx">다음 ▶</button>`; react(true); x.querySelector('.nx').onclick = () => res(tries === 0); }
      else { tries++; b.classList.add('wrong'); b.disabled = true; react(false); if (tries >= 2 || q.o.length <= 2) { w.querySelectorAll('[data-k]').forEach(z => z.disabled = true); w.querySelector(`[data-k="${q.a}"]`).classList.add('right'); x.className = 'qx no'; x.innerHTML = `정답은 <b>${q.o[q.a]}</b>. ${q.e || ''}<button class="nx">다음 ▶</button>`; x.querySelector('.nx').onclick = () => res(false); } else { x.className = 'qx no'; x.innerHTML = '아깝다! 한 번 더 골라 봐.'; } } }; });
    if (ok) right++; SAVE.right[id + ':' + i] = ok ? 1 : 0; save(); }
  w.hidden = true; SAVE.done[id] = right + '/' + set.qs.length; save(); toast(`${set.t}: ${right} / ${set.qs.length}`); }
function react(ok) { const s = AV.s; if (!s) return; setFace(s, ok ? 'happy' : 'worry'); motion(s, ok ? 'clap' : 'tilt'); setTimeout(() => { motion(s, 'idle'); setFace(s, 'n'); }, 1600); }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
/* 대사 속 일본어 → 발음·뜻 칩 (누르면 일본어로 읽어 줌) */
const WORDS = (window.JPWORDS || []).map(w => ({ w, keys: w[0].split('・').map(x => x.replace(/[\s、。！？!?,]/g, '')) }));
function showWords(html) { hideWords(); const t = html.replace(/<[^>]+>/g, '').replace(/[\s、。！？!?,]/g, ''); const hit = WORDS.filter(x => x.keys.some(k => k.length > 1 && t.includes(k))).slice(0, 3); if (!hit.length) return;
  const d = document.createElement('div'); d.className = 'jw'; d.innerHTML = hit.map(({ w }) => `<button data-jp="${w[0]}"><b>${w[0]}</b><i>${w[1]}</i><span>${w[2]}</span></button>`).join(''); box$.appendChild(d);
  hit.forEach(({ w }) => { SAVE.words[w[0]] = (SAVE.words[w[0]] || 0) + 1; }); save();
  d.onclick = e => { const b = e.target.closest('[data-jp]'); if (b) { e.stopPropagation(); sayJP(b.dataset.jp); } }; }
function hideWords() { box$.querySelectorAll('.jw').forEach(x => x.remove()); }
function sayJP(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/[〜・]/g, ' ')); u.lang = 'ja-JP'; const v = pickV('ja', 's'); if (v) u.voice = v; u.rate = .85; speechSynthesis.speak(u); } catch (e) { } }
/* 🗂 일본어 외우기: 카드 (뜻 → 일본어), 모르는 카드는 다시 나옴 */
async function cards(part) { const L = (window.JPWORDS || []).filter(w => !part || w[4] === part); const deck = L.slice().sort(() => Math.random() - .5); const w$ = $('#quiz'); let known = 0;
  while (deck.length) { const w = deck.shift();
    w$.innerHTML = `<div class="qb fc"><div class="qh"><b>🗂 일본어 외우기 ${part ? part + '과' : '전체'}</b><span>남은 카드 ${deck.length + 1} · 외움 ${known}</span></div><div class="fq">${w[2]}</div><div class="ft">💡 ${w[3]}</div><div class="fa" hidden><b>${w[0]}</b><i>${w[1]}</i></div><div class="qo"><button data-a="show">👀 정답 보기 (누르면 읽어 줌)</button></div><button class="nx" data-a="x">그만하기</button></div>`; w$.hidden = false;
    const r = await new Promise(res => { w$.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'show') { w$.querySelector('.fa').hidden = false; sayJP(w[0]); w$.querySelector('.qo').innerHTML = '<button data-a="ok">⭕ 외웠어</button><button data-a="no">🔁 한 번 더</button><button data-a="say">🔊 다시 듣기</button>'; }
      else if (a === 'say') sayJP(w[0]); else res(a); }; });
    if (r === 'x') break; if (r === 'ok') known++; else deck.splice(Math.min(deck.length, 3), 0, w); }
  w$.hidden = true; toast(`🗂 외운 카드 ${known}개`); }
function heart(dv) { SAVE.aff = Math.max(0, Math.min(100, SAVE.aff + dv)); save(); $('#aff i').style.width = SAVE.aff + '%'; $('#aff b').textContent = SAVE.aff; const f = document.createElement('div'); f.className = 'hp ' + (dv > 0 ? 'up' : 'dn'); f.textContent = (dv > 0 ? '💗 +' : '💔 ') + dv; document.body.appendChild(f); setTimeout(() => f.remove(), 1500); }

/* ── 스토리 진행 ── */
const CUR = { ep: 0, i: 0, night: false };
async function runEp(ep, i0 = 0) {
  CUR.ep = ep; const E = ST[ep]; $('#menu').hidden = true; $('#hud').hidden = false; $('#eptag').textContent = E.t;
  /* 시작 위치까지의 배경·자세를 다시 계산 */
  let bg = E.lines.find(x => x.bg)?.bg || 'room';
  for (let j = 0; j < i0; j++) { const x = E.lines[j]; if (x && x.bg) { bg = x.bg; CUR.night = !!x.night; } }
  setWorld(bg);
  for (let i = i0; i < E.lines.length; i++) {
    CUR.i = i; SAVE.ep = ep; SAVE.i = i; save(); $('#prog').textContent = `${E.t} · ${Math.round(i / E.lines.length * 100)}%`;
    const L = E.lines[i]; if (STOP) return;
    if (!Array.isArray(L)) { await directive(L); continue; }
    const [who, face, mot, text] = L;
    for (const k of ['o', 's']) AV[k].talk = 0;
    if (AV[who]) { if (face) setFace(AV[who], face); if (mot) motion(AV[who], mot); AV[who].talk = 2 + text.length * .05; }
    box$.className = 'who-' + who; nm.textContent = NAMES[who] || ''; nm.style.color = COLS[who] || '#fff'; nm.hidden = !NAMES[who];
    if (who !== 'n' && !AV[who]) { $('#guest').hidden = false; $('#guest').innerHTML = `<i style="--c:${COLS[who]}">●</i> ${NAMES[who]} <small>음성 참가 중 · 아바타 로딩…</small>`; } else $('#guest').hidden = true;
    const sp = speak(who, text); await typeOut(text); showWords(text);
    const t0 = performance.now(); await Promise.race([sp, new Promise(r => setTimeout(r, 400 + text.length * 70))]);
    await tapWait(Math.max(700, 1800 - (performance.now() - t0)) + (box$.querySelector('.jw') ? 2200 : 0)); hideWords();
  }
  SAVE.ep = ep + 1; SAVE.i = 0; save();
  if (ep + 1 < ST.length) { await card(`${E.t} 끝`, '다음 에피소드로 →'); return runEp(ep + 1, 0); }
  await card('🌸 엔딩', '처음으로 돌아가기'); menu();
}
async function directive(D) {
  if (D.bg) { CUR.night = !!D.night; await fade(() => setWorld(D.bg)); }
  if (D.title) await card(D.title, D.sub || '', true);
  if (D.place) { const p = $('#place'); p.innerHTML = D.place; p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); }
  if (D.shot) shot = D.shot;
  if (D.pos) for (const [k, v] of Object.entries(D.pos)) place(k, v);
  if (D.walk) for (const [k, v] of Object.entries(D.walk)) walk(k, v[0], v[1], v[2]);
  if (D.prop) for (const [k, n, on] of D.prop) prop(k, n, on !== false);
  if (D.fx !== undefined) fx(D.fx);
  if (D.shake) shake = D.shake;
  if (D.mot) for (const [k, m] of Object.entries(D.mot)) motion(AV[k], m);
  if (D.face) for (const [k, f] of Object.entries(D.face)) setFace(AV[k], f);
  if (D.sfx) sfx(D.sfx);
  if (D.wait) await new Promise(r => setTimeout(r, D.wait));
  const sayS = async (face, mot, line, extra) => { setFace(AV.s, face); motion(AV.s, mot); box$.className = 'who-s'; nm.hidden = false; nm.textContent = NAMES.s; nm.style.color = COLS.s; AV.s.talk = 2 + line.length * .05; speak('s', line); await typeOut(line + (extra || '')); showWords(line + (extra || '')); await tapWait(0); hideWords(); };
  /* 시험 선택지: 정답이면 호감도 크게, 틀려도 스즈가 다정하게 알려 주고 그대로 진행 (복습 목록에 저장) */
  if (D.ask) { const [q, opts, ans, why, okLine, noLine] = D.ask; box$.className = 'who-n'; nm.hidden = true; tx$.innerHTML = '🎮 ' + q; speak('n', q); const k = await radial(q, opts);
    const tag = 'ask:' + CUR.ep + ':' + CUR.i;
    if (k === ans) { heart(+3); sfx('ok'); delete SAVE.miss[tag]; save(); await sayS('happy', 'nod', okLine || '정답!', `<span class="why">📘 ${why}</span>`); }
    else { heart(+1); sfx('pop'); SAVE.miss[tag] = [q, opts[ans], why]; save(); await sayS('smile', 'tilt', (noLine || '음, 그건 이렇게 하는 거야.'), `<span class="why">🌱 정답은 <b>${opts[ans]}</b><br>📘 ${why}</span>`); }
    motion(AV.s, 'idle'); }
  /* 관계 선택지: 어느 쪽을 골라도 좋은 장면 + 배울 거리 */
  if (D.pick) { const [q, opts, learn] = D.pick; box$.className = 'who-n'; nm.hidden = true; tx$.innerHTML = '💗 ' + q; speak('n', q); const k = await radial(q, opts.map(o => o[0]));
    const [, face, mot, line, by] = opts[k]; heart(+2); sfx('ok'); if (by) motion(AV.o, by); await sayS(face, mot, line, learn ? `<span class="why">📘 ${learn}</span>` : ''); motion(AV.s, 'idle'); }
  if (D.quiz) await quiz(D.quiz);
}
function fade(fn) { return new Promise(res => { const f = $('#fade'); f.classList.add('on'); setTimeout(() => { fn(); f.classList.remove('on'); setTimeout(res, 500); }, 500); }); }
function card(t, s, auto2) { return new Promise(res => { const c = $('#card'); c.innerHTML = `<h2>${t}</h2><p>${s}</p>${auto2 ? '' : '<button>계속 ▶</button>'}`; c.hidden = false; speak('n', t.replace(/[🌸🎬]/g, ''));
  const go = () => { c.hidden = true; res(); }; if (auto2) setTimeout(go, 2600); else c.querySelector('button').onclick = go; c.onclick = e => { if (auto2) go(); }; }); }
/* 효과음 (합성) */
let AC = null; function sfx(k) { try { AC = AC || new AudioContext(); const o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination); const t = AC.currentTime;
  const S2 = { ok: [[660, 0], [990, .08]], ng: [[220, 0], [160, .12]], bell: [[1320, 0], [1320, .4]], gong: [[110, 0], [100, 1.2]], door: [[520, 0], [780, .1]], pop: [[400, 0], [900, .05]], clap: [[900, 0], [300, .03]] }[k] || [[440, 0]];
  o.type = k === 'gong' ? 'sine' : k === 'bell' ? 'triangle' : 'square'; S2.forEach(([f, d]) => o.frequency.setValueAtTime(f, t + d)); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + (k === 'gong' ? 2.5 : k === 'bell' ? 1 : .3)); o.start(t); o.stop(t + 2.6); } catch (e) { } }

/* ── 메뉴 ── */
let STOP = false;
function menu() { STOP = true; try { speechSynthesis.cancel(); } catch (e) { } $('#hud').hidden = true; $('#quiz').hidden = true; $('#radial').hidden = true; const m = $('#menu'); m.hidden = false; tx$.innerHTML = ''; nm.hidden = true; hideWords();
  setWorld('street'); fx('sakura'); shot = 'wide'; place('s', [2.5, 0, 0, -.4]); place('o', [-2.5, 0, 0, .4]); setFace(AV.s, 'happy'); setFace(AV.o, 'smile'); motion(AV.o, 'wave');
  m.innerHTML = `<div class="mc"><h1>스즈 소리, 유나 목소리<small>鈴の音、ユナの声 — 일본 문화 4·5·6과 스토리</small></h1>
  <p class="lead">한국에서 온 교환학생 <b style="color:#ffd23f">한유나</b>(나)와 앞을 보지 못하는 일본 소녀 <b style="color:#ff9ab8">야마시타 스즈</b>의 1년. 내가 고르는 선택지가 곧 시험 문제!</p>
  <div class="aff">💗 스즈 호감도 <b>${SAVE.aff}</b></div>
  <button class="pri big" data-go="cont">${SAVE.ep || SAVE.i ? '▶ 이어서 — ' + (ST[Math.min(SAVE.ep, ST.length - 1)] || ST[0]).t : '▶ 처음부터 시작'}</button>
  <div class="eps">${ST.map((e, i) => `<button data-ep="${i}"><b>${e.t}</b><small>${e.d || ''}</small></button>`).join('')}</div>
  <h3>🗂 일본어 외우기 <small style="font:12px sans-serif;opacity:.7">뜻 보고 떠올리기 → 소리로 확인</small></h3><div class="eps qz"><button data-cd="4"><b>4과 표현</b><small>인사·방문·선물·가족</small></button><button data-cd="5"><b>5과 표현</b><small>학교·호칭</small></button><button data-cd="6"><b>6과 표현</b><small>연중행사·축하</small></button><button data-cd="0"><b>전체 섞기</b><small>${(window.JPWORDS || []).length}개</small></button></div>
  ${Object.keys(SAVE.miss).length ? `<h3>🌱 스토리에서 놓친 문제 ${Object.keys(SAVE.miss).length}개</h3><div class="eps"><button data-mi="1"><b>다시 보기</b><small>틀렸던 선택지만 모아서</small></button></div>` : ''}
  <h3>📝 교과서 문제만 풀기</h3><div class="eps qz">${Object.entries(QB).filter(([k]) => k[0] !== '_').map(([k, v]) => `<button data-q="${k}"><b>${v.t}</b><small>${SAVE.done[k] ? '최근 ' + SAVE.done[k] : v.qs.length + '문제'}</small></button>`).join('')}</div>
  <div class="opt"><button data-o="voice">${voiceOn ? '🔊 더빙 켜짐' : '🔇 더빙 꺼짐'}</button><button data-o="auto">${auto ? '⏩ 자동 넘김' : '👆 눌러서 넘김'}</button><button data-o="home">🏠 홈</button></div>
  <p class="cr">3D 모델: Kilerbomb “Poka” Blind Girl · Blondy (무료 라이선스, 비영리 사용)</p></div>`;
  m.onclick = async e => { const b = e.target.closest('button'); if (!b) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (b.dataset.go) { STOP = false; return runEp(Math.min(SAVE.ep, ST.length - 1), SAVE.ep < ST.length ? SAVE.i : 0); }
    if (b.dataset.ep) { STOP = false; return runEp(+b.dataset.ep, 0); }
    if (b.dataset.q) { m.hidden = true; await quiz(b.dataset.q); return menu(); }
    if (b.dataset.cd) { m.hidden = true; await cards(+b.dataset.cd); return menu(); }
    if (b.dataset.mi) { m.hidden = true; QB._miss = { t: '스토리에서 놓친 문제', qs: Object.values(SAVE.miss).map(([q, a, e]) => { const wrongs = Object.values(SAVE.miss).map(x => x[1]).filter(x => x !== a).sort(() => Math.random() - .5).slice(0, 2); return { q, o: [a, ...wrongs], a: 0, e }; }) }; await quiz('_miss'); delete QB._miss; return menu(); }
    if (b.dataset.o === 'voice') { voiceOn = !voiceOn; try { localStorage.setItem('jp_voice', voiceOn ? '1' : '0'); } catch (e) { } if (voiceOn) speak('s', '「はじめまして」 안녕, 나는 스즈야.'); return menu(); }
    if (b.dataset.o === 'auto') { auto = !auto; try { localStorage.setItem('jp_auto', auto ? '1' : '0'); } catch (e) { } return menu(); }
    if (b.dataset.o === 'home') location.href = 'index.html'; };
}
$('#bm').onclick = () => menu();
$('#bauto').onclick = () => { auto = !auto; $('#bauto').textContent = auto ? '⏩ 자동' : '👆 수동'; try { localStorage.setItem('jp_auto', auto ? '1' : '0'); } catch (e) { } };
$('#bauto').textContent = auto ? '⏩ 자동' : '👆 수동';
$('#bshot').onclick = () => { const L = ['two', 'suzu', 'onna', 'close', 'wide']; shot = L[(L.indexOf(shot) + 1) % L.length]; };
$('#aff i').style.width = SAVE.aff + '%'; $('#aff b').textContent = SAVE.aff;

/* ── 루프 ── */
const clock = new THREE.Clock(); let T = 0;
function loop() { const dt = Math.min(.05, clock.getDelta()); T += dt; for (const a of Object.values(AV)) stepAvatar(a, dt, T); stepFX(dt); stepCam(dt); R.render(scene, cam); stepTags(); requestAnimationFrame(loop); }
(async () => {
  $('#boot').textContent = '아바타 불러오는 중… (VRChat 월드 접속 중)';
  await Promise.all([loadAvatar('s'), loadAvatar('o')]); setFace(AV.s, 'n'); setFace(AV.o, 'n');
  $('#boot').remove(); loop(); menu();
  window.__JP = { AV, motion, setFace, setWorld, shot: s => shot = s, runEp, quiz, fx };
})().catch(e => { $('#boot').textContent = '불러오기 실패: ' + e.message; console.error(e); });
