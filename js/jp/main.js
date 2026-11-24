/* 일본 문화 — 「스즈 소리, 유나 목소리」  VRChat 상황극 스타일 스토리 학습
   모델: KB Poka Blind Girl / Blondy (Kilerbomb, 무료·수정 허용 라이선스, models/LICENSE_KB_Poka.txt) */
import * as THREE from 'three';
import { FBXLoader } from '../vendor/jsm/loaders/FBXLoader.js';

const $ = s => document.querySelector(s);
const IC = (n, o) => window.ICON(n, o);
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
function resize() { const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); try { uiCam.aspect = w / h; uiCam.updateProjectionMatrix(); fitBook(); } catch (e) { } } addEventListener('resize', resize); resize();

/* ── 텍스처 도우미 ── */
const TL = new THREE.TextureLoader();
const tex = (u, rep) => { const t = TL.load(u); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } return t; };
function ctex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const M = (c, o = {}) => new THREE.MeshToonMaterial(Object.assign({ color: c }, o));
const box = (w, h, d, m) => { const x = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m.isMaterial ? m : M(m)); x.castShadow = x.receiveShadow = true; return x; };
const cyl = (r1, r2, h, m, s = 16) => { const x = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s), m.isMaterial ? m : M(m)); x.castShadow = true; return x; };
const at = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };

/* ── 아바타 ── */
const FACE_ALIAS = { smile_mask: 'smile', blush: 'shy', ear_red: 'blush', look_away: 'shy' };
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
  const np = document.createElement('div'); np.className = 'np'; np.innerHTML = `<b>${d.name}</b><small>${d.tag}</small><i class="mic">${IC('talk')}</i>`; np.style.setProperty('--c', d.col); $('#np').appendChild(np); a.np = np;
  AV[k] = a; return a;
}
/* ── 만화 기호: 표정 텍스처가 몇 개 안 돼서, 머리 옆에 손으로 그린 기호를 띄워 감정을 보탬 ── */
const EMO_OF = { cry: 'tear', sad: 'gloom', blush: 'blush', shy: 'blush', ear_red: 'blush', mad: 'anger', pout: 'anger', wow: 'surprise', shout: 'surprise', oh: 'surprise', worry: 'sweat', meh: 'sweat', ugh: 'sweat', happy: 'sparkle', lol: 'sparkle', teeth: 'sparkle', grin: 'sparkle', sleepy: 'zzz' };
const EMO_KEEP = ['blush', 'tear', 'gloom'], EMO_TX = {};
function emoTex(k) { if (EMO_TX[k]) return EMO_TX[k]; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.lineCap = g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = '#1d1b22';
  const drop = (col) => { g.fillStyle = col; g.beginPath(); g.moveTo(64, 12); g.bezierCurveTo(104, 68, 98, 114, 64, 114); g.bezierCurveTo(30, 114, 24, 68, 64, 12); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(52, 82, 7, 13, .3, 0, 7); g.fill(); };
  if (k === 'blush') { g.fillStyle = 'rgba(255,105,140,.5)'; g.beginPath(); g.ellipse(64, 64, 56, 28, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(215,50,85,.85)'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(28 + i * 22, 82); g.lineTo(42 + i * 22, 46); g.stroke(); } }
  else if (k === 'tear') drop('#7ac8ff'); else if (k === 'sweat') drop('#bfe6ff');
  else if (k === 'anger') { g.strokeStyle = '#e02a3a'; g.lineWidth = 11; [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => { const x = 30 + i * 68, y = 30 + j * 68; g.beginPath(); g.arc(x, y, 22, (i ? .5 : 0) * PI + (j ? (i ? 0 : .5) * PI : (i ? .5 : 1) * PI), (i ? .5 : 0) * PI + (j ? (i ? .5 : 1) * PI : (i ? 1 : 1.5) * PI)); g.stroke(); }); }
  else if (k === 'surprise') { g.lineWidth = 9; [[64, 10, 64, 52], [20, 34, 40, 62], [108, 34, 88, 62]].forEach(([a, b2, c2, d]) => { g.beginPath(); g.moveTo(a, b2); g.lineTo(c2, d); g.stroke(); }); }
  else if (k === 'gloom') { g.strokeStyle = 'rgba(90,80,170,.75)'; g.lineWidth = 5; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(14 + i * 17, 6); for (let y = 6; y < 120; y += 12) g.lineTo(14 + i * 17 + (y % 24 ? 3 : -3), y); g.stroke(); } }
  else if (k === 'sparkle') { g.fillStyle = '#ffe14a'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 14 : 54, an = i * PI / 4 - PI / 2; g.lineTo(64 + Math.cos(an) * r, 64 + Math.sin(an) * r); } g.closePath(); g.fill(); g.stroke(); }
  else if (k === 'zzz') { g.fillStyle = '#fff'; g.font = `700 80px ${"Gaegu, sans-serif"}`; g.strokeText('Z', 30, 100); g.fillText('Z', 30, 100); }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return EMO_TX[k] = tx; }
/* 얼굴 기준 위치 (머리뼈 기준, 모델 공간: x 옆, y 위, z 앞) */
const EMO_POS = { blush: [[-.32, .2, .5, .55], [.32, .2, .5, .55]], tear: [[-.24, .5, .5, .32], [.24, .5, .5, .32]], sweat: [[-.8, 1.1, .3, .6]], anger: [[-.6, 1.25, .35, .7], [.6, 1.25, .35, .7]], surprise: [[-.6, 1.45, .3, .9], [.6, 1.45, .3, .9]], gloom: [[0, .9, .55, 1.3]], sparkle: [[-.9, 1.3, .2, .6], [.95, .95, .2, .45], [.55, 1.7, .2, .4]], zzz: [[.8, 1.6, .2, .7]] };
function setEmote(a, k) { if (a.emo && a.emo.k === k) { a.emo.t = 0; return; } clearEmote(a); const sp = EMO_POS[k].map(([, , , s]) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoTex(k), transparent: true, depthWrite: false })); m.scale.setScalar(s); scene.add(m); return m; }); a.emo = { k, t: 0, sp }; }
function clearEmote(a) { if (a.emo) a.emo.sp.forEach(s => { scene.remove(s); s.material.dispose(); }); a.emo = null; }
const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), vE = new THREE.Vector3(), vH = new THREE.Vector3();
function stepEmote(a, dt) { const e = a.emo; if (!e) return; e.t += dt; if (!EMO_KEEP.includes(e.k) && e.t > 2.4) return clearEmote(a);
  a.B.head.getWorldPosition(vH); a.o.getWorldQuaternion(qA); const qh = a.B.head.getWorldQuaternion(qB); const qm = qA.clone().invert().multiply(qh).multiply(a.rest.head.w.clone().invert());
  EMO_POS[e.k].forEach(([x, y, z], i) => { vE.set(x, y, z); if (e.k === 'tear') vE.y -= ((e.t * .9 + i * .45) % 1) * .8; if (e.k === 'sweat') vE.y -= Math.min(.5, e.t * .3); if (e.k === 'zzz') vE.y += (e.t % 1.5) * .5;
    vE.applyQuaternion(qm).applyQuaternion(qA).add(vH); const s = e.sp[i]; s.position.copy(vE);
    s.material.opacity = e.k === 'tear' ? 1 - ((e.t * .9 + i * .45) % 1) * .6 : EMO_KEEP.includes(e.k) ? 1 : Math.min(1, (2.4 - e.t) * 2);
    if (e.k === 'surprise' || e.k === 'anger') s.scale.setScalar(EMO_POS[e.k][i][3] * (1 + Math.max(0, .3 - e.t) * 1.5)); if (e.k === 'sparkle') s.material.rotation = e.t * 2 + i; }); }
function setFace(a, f) { f = FACES[a.k][f] !== undefined ? f : (FACE_ALIAS[f] || f); const i = FACES[a.k][f] ?? FACES[a.k].n; a.cell = i; const prevF = a.face; a.face = f; const ek = EMO_OF[f] || null; if (ek && (EMO_KEEP.includes(ek) || prevF !== f)) setEmote(a, ek); else if (!ek && a.emo && EMO_KEEP.includes(a.emo.k)) clearEmote(a); a.ft.offset.set((i % 4) * .25, .75 - Math.floor(i / 4) * .25); }
const qW = new THREE.Quaternion(), qT = new THREE.Quaternion(), eu = new THREE.Euler();
function applyPose(a, P) {
  for (const [n, r] of Object.entries(a.rest)) a.B[n].quaternion.copy(r.l);
  for (const [n, e] of Object.entries(P)) { const b = a.B[n], r = a.rest[n]; if (!b) continue; eu.set(e[0] || 0, e[1] || 0, e[2] || 0, 'YXZ'); qW.setFromEuler(eu);
    qT.copy(r.w).invert().multiply(qW).multiply(r.w); b.quaternion.copy(r.l).multiply(qT); }
}
/* 포즈 합치기 */
const add = (A, Bp, w = 1) => { for (const [k, v0] of Object.entries(Bp)) { const v = typeof v0 === 'number' ? [v0] : v0; const o = A[k] || (A[k] = [0, 0, 0]); for (let i = 0; i < 3; i++) o[i] += (v[i] || 0) * w; } return A; };
const S = Math.sin, PI = Math.PI;
const ARMS_DOWN = { upperarm_L: [0, 0, -.95], upperarm_R: [0, 0, .95], forearm_L: [-.15, 0, -.1], forearm_R: [-.15, 0, .1] };
/* 동작: t(초) → 포즈 */
const MOT = {
  idle: t => ({ spine1: [S(t * 1.6) * .015, 0, S(t * .7) * .015], head: [S(t * .9) * .03, S(t * .5) * .06, 0], upperarm_L: [0, 0, S(t * 1.6) * .02], upperarm_R: [0, 0, -S(t * 1.6) * .02] }),
  talk: t => ({ head: [S(t * 6) * .05, S(t * 2) * .08, 0], forearm_R: [-.5 - S(t * 4) * .2, 0, 0], upperarm_R: [-.25, 0, -.1] }),
  talk2: t => ({ head: [S(t * 5) * .06, 0, S(t * 1.5) * .05], upperarm_L: [-.35, 0, .15], upperarm_R: [-.35, 0, -.15], forearm_L: [-.7 - S(t * 3) * .15, .5, 0], forearm_R: [-.7 - S(t * 3 + 1) * .15, -.5, 0] }),
  talk3: t => ({ head: [.06 + S(t * 6) * .04, S(t * 1.2) * .1, 0], upperarm_L: [-.4, 0, .2], forearm_L: [-1.5 - S(t * 2) * .1, .5, 0], spine1: [S(t * 2) * .03, 0, 0] }),
  fid_hair: t => ({ upperarm_L: [-.5, 0, .9], forearm_L: [-1.9, .2, 0], head: [0, 0, -.12] }),
  fid_look: t => ({ head: [-.05, S(t * 1.4) * .5, 0], neck: [0, S(t * 1.4) * .2, 0] }),
  fid_sway: t => ({ spine1: [0, 0, S(t * 1.3) * .08], hips: [0, 0, -S(t * 1.3) * .05], head: [0, 0, S(t * 1.3) * .06] }),
  fid_stretch: t => ({ upperarm_L: [-.3, 0, 1.4], upperarm_R: [-.3, 0, -1.4], forearm_L: [0, 0, .6], forearm_R: [0, 0, -.6], spine1: [-.12, 0, 0], head: [-.2, 0, 0] }),
  fid_cane: t => ({ upperarm_R: [-.35, 0, .55], forearm_R: [-.4 + Math.max(0, S(t * 7)) * .3, 0, 0], head: [.1, -.35, .15] }),
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
  look_away: t => ({ head: [.15, .65 * Math.min(1, t * 4), .1], neck: [0, .2, 0], upperarm_R: [-.4, 0, .2], forearm_R: [-1.6, -.3, 0] }),
  ear_red: t => ({ upperarm_L: [-.3, 0, .18], upperarm_R: [-.3, 0, -.18], forearm_L: [-.7, .6, 0], forearm_R: [-.7, -.6, 0], head: [.32, 0, .12], spine2: [.08, 0, 0] }),
  reach_miss: t => ({ upperarm_L: [-1.15 + S(t * 1.6) * .12, 0, .25], upperarm_R: [-1.15 - S(t * 1.6) * .12, 0, -.25], forearm_L: [-.25, .2, 0], forearm_R: [-.25, -.2, 0], spine1: [.18, 0, 0], head: [.1, S(t * .9) * .12, .1] }),
  grip_sleeve: t => ({ upperarm_R: [-.85, 0, .1], forearm_R: [-.6, -.35, 0], upperarm_L: [-.3, 0, .2], forearm_L: [-.9, .5, 0], head: [.22, 0, .06], spine1: [.08, 0, 0] }),
  lean_in: t => { const k = Math.min(1, t * 2); return { spine1: [.25 * k, 0, 0], spine2: [.15 * k, 0, 0], head: [-.05, 0, .08 * k], upperarm_L: [-1.2 * k, 0, .3], upperarm_R: [-1.2 * k, 0, -.3], forearm_L: [-.6 * k, .45, 0], forearm_R: [-.6 * k, -.45, 0] }; },
  flinch_sound: t => ({ upperarm_L: [-.4, 0, .5], upperarm_R: [-.4, 0, -.5], forearm_L: [-2, .6, 0], forearm_R: [-2, -.6, 0], head: [.3, 0, 0], spine2: [.15, 0, 0], shoulder_L: [0, 0, .12], shoulder_R: [0, 0, -.12], _sh: S(t * 22) * .015 }),
  crouch_bury: t => { const k = Math.min(1, t * 2.5); return { upper_leg_L: [-1.9 * k, 0, .15 * k], upper_leg_R: [-1.9 * k, 0, -.15 * k], lower__leg_L: [2.4 * k, 0, 0], lower__leg_R: [2.4 * k, 0, 0], spine1: [.55 * k, 0, 0], spine2: [.35 * k, 0, 0], head: [.5 * k, 0, 0], upperarm_L: [-.9 * k, 0, .35], upperarm_R: [-.9 * k, 0, -.35], forearm_L: [-1.6 * k, .6, 0], forearm_R: [-1.6 * k, -.6, 0], _y: -2.1 * k, _sh: S(t * 16) * .012 }; },
  stretch: t => ({ upperarm_L: [0, 0, 1.9], upperarm_R: [0, 0, -1.9], forearm_L: [0, 0, .6], forearm_R: [0, 0, -.6], spine1: [-.1, 0, S(t * 2) * .1] })
};
function bow(t, d) { const k = t < .6 ? t / .6 : t < 1.8 ? 1 : Math.max(0, 1 - (t - 1.8) / .6); return { spine1: [d * k * .6, 0, 0], spine2: [d * k * .4, 0, 0], head: [.1 * k, 0, 0], upperarm_L: [-.2 * k, 0, .1], upperarm_R: [-.2 * k, 0, -.1], forearm_L: [-.3 * k, .3 * k, 0], forearm_R: [-.3 * k, -.3 * k, 0] }; }
const MOT_ALIAS = { smile: 'nod', smile_mask: 'bow15', mad: 'sulk', shout: 'fist', blush: 'shy', ugh: 'shrug' };
function motion(a, m) { if (m && !MOT[m] && MOT_ALIAS[m]) m = MOT_ALIAS[m]; if (!m || m === a.mot) { a.motT = Math.min(a.motT, .01); a.mot = m || a.mot; return; } a.prev = a.mot; a.prevT = a.motT; a.mot = m; a.motT = 0; a.blend = 0; }
const ONCE = { nod: 1.6, shake: 1.8, bow15: 2.6, bow30: 2.6, bow45: 2.6, jump: 2, throw: 2.5 };
function stepAvatar(a, dt, T) {
  a.motT += dt; a.prevT += dt; a.blend = Math.min(1, a.blend + dt * 4);
  if (ONCE[a.mot] && a.motT > ONCE[a.mot]) motion(a, 'idle');
  const P = add(add({}, ARMS_DOWN), MOT.idle(T + (a.k === 's' ? 1 : 0)));
  const cur = (MOT[a.mot] || MOT.idle)(a.motT), pr = a.prev ? (MOT[a.prev] || MOT.idle)(a.prevT) : {};
  if (a.blend < 1) add(P, pr, 1 - a.blend); add(P, cur, a.blend);
  if (a.talk > 0 && (a.mot === 'idle')) add(P, MOT['talk' + (a.tv || '')](T), .6);
  /* 가만히 있을 때 가끔 하는 잔동작 */
  if (a.fidT === undefined) a.fidT = 5 + Math.random() * 6; a.fidT -= dt;
  if (!a.fid && a.fidT < 0 && a.mot === 'idle' && a.talk <= 0 && !BOOK) { const L = a.k === 's' ? (a.props.cane ? ['fid_cane', 'fid_sway', 'fid_look'] : ['fid_sway', 'fid_hair', 'fid_look']) : ['fid_hair', 'fid_look', 'fid_sway', 'fid_stretch']; a.fid = { n: L[Math.floor(Math.random() * L.length)], t: 0 }; a.fidT = 7 + Math.random() * 8; }
  if (a.fid) { a.fid.t += dt; if (a.mot !== 'idle' || a.fid.t > 2.6) a.fid = null; else add(P, MOT[a.fid.n](a.fid.t), S(Math.min(1, a.fid.t / 2.6) * PI)); }
  /* 상대 쪽으로 고개 돌리기. 스즈는 앞이 안 보여서 얼굴 대신 귀를 소리 쪽으로 */
  const oth = AV[a.k === 's' ? 'o' : 's']; let lk = 0;
  if (oth && !['crouch_bury', 'sleep', 'pray', 'bow15', 'bow30', 'bow45', 'cry'].includes(a.mot)) { const dv = oth.g.position.clone().sub(a.g.position); let an = Math.atan2(dv.x, dv.z) - a.g.rotation.y; an = ((an + 3 * PI) % (2 * PI)) - PI; lk = Math.max(-.75, Math.min(.75, an)); if (a.k === 's') lk = Math.max(-.95, Math.min(.95, lk + (lk >= 0 ? .35 : -.35))); }
  a.look = (a.look || 0) + (lk - (a.look || 0)) * Math.min(1, dt * 3); add(P, { head: [0, a.look * .55, a.k === 's' ? Math.abs(a.look) * .12 : 0], neck: [0, a.look * .3, 0] });
  /* 걷기 */
  let wy = 0; if (a.tgt) { const g = a.g, d = a.tgt.p.clone().sub(g.position); d.y = 0; const L = d.length();
    if (L < .05) { g.position.copy(a.tgt.p); if (a.tgt.ry !== undefined) g.rotation.y = a.tgt.ry; a.tgt = null; }
    else { const sp = (a.k === 's' ? 3.2 : 5) * dt; g.position.addScaledVector(d.normalize(), Math.min(sp, L)); const ry = Math.atan2(d.x, d.z); g.rotation.y += ((((ry - g.rotation.y) % (2 * PI)) + 3 * PI) % (2 * PI) - PI) * Math.min(1, dt * 8);
      a.walkT += dt * 7; add(P, { upper_leg_L: [S(a.walkT) * .45, 0, 0], upper_leg_R: [-S(a.walkT) * .45, 0, 0], lower__leg_L: [-Math.max(0, -S(a.walkT)) * .6, 0, 0], lower__leg_R: [-Math.max(0, S(a.walkT)) * .6, 0, 0], upperarm_L: [-S(a.walkT) * .25, 0, 0], upperarm_R: [S(a.walkT) * .25, 0, 0] }); wy = Math.abs(S(a.walkT)) * .12; } }
  const y = (P._y ? P._y[0] : 0) + wy; const sh = P._sh ? P._sh[0] : 0; delete P._y; delete P._sh;
  a.o.position.set(sh, y, 0); a.dy = y < 0 ? y * 1.15 : 0; applyPose(a, P); stepEmote(a, dt);
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
/* ── 로우폴리 소품·자연물 도우미 (각진 면 그대로 보이게 flatShading) ── */
const F = c => M(c, { flatShading: true });
const lp = (geo, c) => { const m = new THREE.Mesh(geo, c.isMaterial ? c : F(c)); m.castShadow = m.receiveShadow = true; return m; };
const B = (w, h, d, c) => lp(new THREE.BoxGeometry(w, h, d), c);
const Cy = (r1, r2, h, c, s = 7) => lp(new THREE.CylinderGeometry(r1, r2, h, s), c);
const glow = c => new THREE.MeshBasicMaterial({ color: c });
const put = (g, o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
const rnd = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const R0 = rnd(7); const rr = (a, b) => a + R0() * (b - a);
function season() { return ['spring', 'spring', 'summer', 'summer', 'autumn', 'winter', 'early'][CUR.ep] || 'spring'; }
function leafCols() { return { spring: ['#ffb8d0', '#ffcadc', '#f7a6c2'], summer: ['#4f9a3c', '#3f8a34', '#62ad4c'], autumn: ['#e0702a', '#e0a832', '#c84a2a'], winter: null, early: ['#f2d6de', null, null] }[season()]; }
function tree(c, h = 7) { const g = new THREE.Group(); put(g, Cy(.35, .6, h, '#6a4a2a', 6), 0, h / 2, 0);
  for (let i = 0; i < 3; i++) put(g, Cy(.1, .2, h * .42, '#6a4a2a', 5), S(i * 2.1) * .7, h * .78, Math.cos(i * 2.1) * .7, 0, Math.cos(i * 2.1) * .7, -S(i * 2.1) * .7);
  const cols = c ? [c, c, c] : leafCols(); if (cols) for (let i = 0; i < 5; i++) { const col = cols[i % 3]; if (!col) continue; const f = lp(new THREE.IcosahedronGeometry(h * (.22 + (i % 2) * .07), 0), col); put(g, f, S(i * 1.7) * h * .24, h * (.92 + (i % 3) * .1), Math.cos(i * 1.7) * h * .22, i * 2, i); }
  return g; }
function cedar(h = 12) { const g = new THREE.Group(); put(g, Cy(.3, .5, h * .4, '#5a3a22', 5), 0, h * .2, 0); for (let i = 0; i < 3; i++) put(g, lp(new THREE.ConeGeometry(h * (.27 - i * .06), h * .42, 7), ['#2f5a34', '#356a3a', '#3d7442'][i]), 0, h * (.38 + i * .2), 0, i); return g; }
function pine(h = 7) { const g = new THREE.Group(); put(g, Cy(.25, .45, h, '#5a3a22', 5), 0, h / 2, 0, 0, 0, .15); for (let i = 0; i < 3; i++) { const f = lp(new THREE.IcosahedronGeometry(1.6 - i * .2, 0), '#2e5a36'); f.scale.y = .45; put(g, f, -.6 + i * .9, h * (.6 + i * .17), (i - 1) * .5); } return g; }
function bush(r = 1.2, c = '#4a8a3a') { const m = lp(new THREE.IcosahedronGeometry(r, 0), c); m.scale.y = .7; m.position.y = r * .45; m.rotation.y = r * 5; return m; }
function rock(r = 1) { const m = lp(new THREE.DodecahedronGeometry(r, 0), '#8c8a84'); m.scale.set(1, .6, .9); m.position.y = r * .25; m.rotation.y = r * 3; return m; }
function scatter(g, geo, cols, n, x0, x1, z0, z1, y = .3, sc = [.6, 1.4]) { const im = new THREE.InstancedMesh(geo, F('#ffffff'), n); const o = new THREE.Object3D(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { o.position.set(rr(x0, x1), y, rr(z0, z1)); o.rotation.set(rr(-.3, .3), rr(0, 6), rr(-.3, .3)); o.scale.setScalar(rr(sc[0], sc[1])); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.set(cols[i % cols.length])); }
  im.receiveShadow = true; g.add(im); return im; }
const grass = (g, n, x0, x1, z0, z1) => scatter(g, new THREE.ConeGeometry(.13, .8, 3), season() === 'winter' ? ['#a8a888', '#b8b49a'] : season() === 'autumn' ? ['#a8a048', '#8a9a40'] : ['#5aa848', '#4a9a3c', '#6ab858'], n, x0, x1, z0, z1, .35);
const flowers = (g, n, x0, x1, z0, z1) => season() === 'winter' ? null : scatter(g, new THREE.IcosahedronGeometry(.18, 0), ['#ffffff', '#ffd23f', '#ff8fb0', '#b8a0ff'], n, x0, x1, z0, z1, .4, [.7, 1.3]);
function cloud(g, x, y, z, s = 1) { const c = new THREE.Group(); for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(4 * s * (1 - i * .15), 0), glow('#ffffff')); m.scale.y = .55; m.position.set((i - 1.5) * 4.5 * s, (i % 2) * s, 0); c.add(m); } c.position.set(x, y, z); g.add(c); }
function mountains(g, col = '#9ab0c8') { for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(rr(30, 55), rr(25, 45), 5), M(col, { flatShading: true })); m.position.set(-160 + i * 40, 8, -150 - (i % 2) * 15); m.rotation.y = i; g.add(m); } }
function outdoor(g, top, bot, mt = true) { g.add(sky(top, bot)); if (mt) mountains(g, season() === 'winter' ? '#c8d0dc' : season() === 'autumn' ? '#b0a090' : '#9ab0c8'); for (let i = 0; i < 5; i++) cloud(g, -90 + i * 45, rr(45, 70), -120 + rr(-20, 20), rr(.8, 1.4)); }
function gable(w, d, h, c) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(0, h); s.lineTo(w / 2, 0); s.lineTo(-w / 2, 0); const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2); return lp(geo, c); }
function house(w, h, d, wall, roof) { const g = new THREE.Group(); put(g, B(w, h, d, wall), 0, h / 2, 0); put(g, gable(w + 1.6, d + 1.6, h * .45, roof), 0, h, 0);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) put(g, B(1.8, 1.6, .2, glow(j ? '#9fc3e0' : '#f6e8c0')), -w / 4 + i * w / 2, h * (.3 + j * .4), d / 2 + .1);
  put(g, B(1.8, 3.6, .2, '#6a4a2a'), 0, 1.8, d / 2 + .12); return g; }
function blockWall(len, c = '#b8b4aa') { const g = new THREE.Group(); put(g, B(len, 3, .6, c), 0, 1.5, 0); put(g, B(len + .2, .3, .8, '#9a968c'), 0, 3.1, 0); for (let x = -len / 2 + 2; x < len / 2; x += 4) put(g, B(.08, 2.9, .62, '#a29e94'), x, 1.5, 0); return g; }
function pole(h = 20) { const g = new THREE.Group(); put(g, Cy(.35, .45, h, '#a8a49a', 8), 0, h / 2, 0); put(g, B(4, .3, .3, '#7a7670'), 0, h - 2, 0); put(g, Cy(.6, .6, 1.4, '#8a8a84', 8), .8, h - 4, 0); put(g, B(.8, 1, .3, '#f2d040'), 0, 6, .35); return g; }
function wires(g, pts, h = 17.6) { const m = new THREE.LineBasicMaterial({ color: '#222' }); for (const dx of [-1.6, 0, 1.6]) { const P = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; for (let k = 0; k <= 8; k++) { const t = k / 8; P.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t + dx, h - S(t * PI) * .8, a[1] + (b[1] - a[1]) * t)); } } g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(P), m)); } }
function vending(c = '#d8343a') { const g = new THREE.Group(); put(g, B(3, 8, 2.4, c), 0, 4, 0); put(g, B(2.5, 3.4, .1, glow('#f4f8ff')), 0, 5.6, 1.22);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) put(g, Cy(.18, .18, .7, glow(['#e04040', '#40a0e0', '#f0c040', '#40c080', '#ffffff'][(r + k) % 5]), 6), -.9 + k * .45, 4.4 + r * 1.1, 1.3);
  put(g, B(2.4, .8, .2, '#222'), 0, 1.4, 1.22); return g; }
function lamp(h = 12) { const g = new THREE.Group(); put(g, Cy(.18, .25, h, '#5a5e66', 6), 0, h / 2, 0); put(g, B(.3, .3, 2.4, '#5a5e66'), 0, h, 1); put(g, B(.7, .3, 1, glow('#fff6d8')), 0, h - .3, 2); return g; }
function mailbox() { const g = new THREE.Group(); put(g, Cy(.9, .9, 4, '#d8302a', 10), 0, 2, 0); put(g, lp(new THREE.SphereGeometry(.9, 10, 5, 0, 6.29, 0, 1.6), '#d8302a'), 0, 4, 0); put(g, B(1, .15, .3, '#222'), 0, 3.4, .85); return g; }
function bike() { const g = new THREE.Group(); const w = new THREE.TorusGeometry(.8, .1, 5, 12); put(g, lp(w, '#333'), -1, .9, 0, PI / 2); put(g, lp(w.clone(), '#333'), 1, .9, 0, PI / 2); put(g, B(2.2, .12, .12, '#c8c8d0'), 0, 1.5, 0, 0, 0, .2); put(g, B(.12, 1.2, .12, '#c8c8d0'), .9, 1.9, 0); put(g, B(.12, .12, 1.2, '#333'), .9, 2.5, 0); put(g, B(.8, .2, .4, '#222'), -.6, 2, 0); g.rotation.y = PI / 2; return g; }
function bench(w = 6) { const g = new THREE.Group(); put(g, B(w, .3, 1.6, '#a87850'), 0, 2, 0); put(g, B(w, 1.2, .25, '#a87850'), 0, 3, -.7); for (const x of [-w / 2 + .5, w / 2 - .5]) put(g, B(.3, 2, 1.4, '#555'), x, 1, 0); return g; }
function plant(h = 2.5, pot = '#b86a3a') { const g = new THREE.Group(); put(g, Cy(.8, .6, 1.4, pot, 8), 0, .7, 0); for (let i = 0; i < 6; i++) put(g, lp(new THREE.ConeGeometry(.35, h, 4), '#3f8a34'), S(i) * .3, 1.4 + h / 2, Math.cos(i) * .3, i, S(i * 2) * .35, Math.cos(i * 2) * .35); return g; }
/* 실내 */
const plaster = '#eee4cf', pillar = '#6a4a2c';
function walls(g, w, d, h, c = plaster, ceil = true, sides = true) { put(g, B(w, h, .5, c), 0, h / 2, -d / 2); if (sides) { put(g, B(.5, h, d, c), -w / 2, h / 2, 0); put(g, B(.5, h, d, c), w / 2, h / 2, 0); }
  for (const x of [-w / 2 + .3, -w / 6, w / 6, w / 2 - .3]) put(g, B(.6, h, .6, pillar), x, h / 2, -d / 2 + .3); put(g, B(w, .5, .6, pillar), 0, h - .25, -d / 2 + .3); put(g, B(w, .6, .7, pillar), 0, .3, -d / 2 + .3);
  if (ceil) put(g, B(w, .3, d, '#c8a070'), 0, h + .15, 0); }
function zabuton(c = '#8a3a4a') { const m = B(2.4, .4, 2.4, c); m.position.y = .2; const g = new THREE.Group(); g.add(m); return g; }
function kotatsu(c = '#9a4a3a') { const g = new THREE.Group(); put(g, B(8, 1.8, 6, c), 0, .9, 0); put(g, B(8.6, .2, 6.6, c), 0, 1.75, 0); put(g, B(6.4, .28, 4.4, '#c8a070'), 0, 2.05, 0);
  put(g, Cy(1, .7, .5, '#d8c8a0', 10), 1.4, 2.45, .3); for (let i = 0; i < 4; i++) put(g, lp(new THREE.IcosahedronGeometry(.36, 1), '#ff9a2a'), 1.4 + S(i * 1.6) * .45, 2.85 + (i === 3 ? .3 : 0), .3 + Math.cos(i * 1.6) * .45);
  put(g, Cy(.5, .6, .9, '#4a6a5a', 8), -1.6, 2.6, -.4); put(g, Cy(.25, .2, .45, '#f2ece0', 8), -.6, 2.4, .8); put(g, Cy(.25, .2, .45, '#f2ece0', 8), -2.4, 2.4, .9); return g; }
function tansu() { const g = new THREE.Group(); put(g, B(5, 6, 2, '#7a4a2a'), 0, 3, 0); for (let i = 0; i < 4; i++) { put(g, B(4.6, .08, .05, '#3a2210'), 0, 1.2 + i * 1.3, 1.02); put(g, B(.6, .15, .1, '#c8a040'), -1.2, .7 + i * 1.3, 1.05); put(g, B(.6, .15, .1, '#c8a040'), 1.2, .7 + i * 1.3, 1.05); } return g; }
function tv() { const g = new THREE.Group(); put(g, B(6, 1.6, 2, '#5a4030'), 0, .8, 0); put(g, B(5.2, 3, .25, '#18181c'), 0, 3.3, 0); put(g, B(4.8, 2.6, .05, glow('#2a3a52')), 0, 3.3, .14); return g; }
function scrollArt(txt) { return ctex(128, 384, (x, w, h) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a3a2a'; x.fillRect(0, 0, w, 16); x.fillRect(0, h - 16, w, 16); x.fillStyle = '#222'; x.font = '700 64px "Noto Sans JP",serif'; x.textAlign = 'center'; [...txt].forEach((c, i) => x.fillText(c, w / 2, 100 + i * 80)); }); }
function tokonoma(txt = '一期一会') { const g = new THREE.Group(); put(g, B(6, .6, 3, '#5a3a22'), 0, .3, 0); put(g, B(2, 6, .05, M('#fff', { map: scrollArt(txt) })), 0, 6.2, -1.3);
  put(g, Cy(.4, .6, 1.4, '#3a5a7a', 8), 1.6, 1.3, 0); for (let i = 0; i < 4; i++) put(g, Cy(.04, .04, 2.2, '#4a7a3a', 4), 1.6 + S(i) * .3, 3, Math.cos(i) * .2, 0, S(i) * .3, Math.cos(i) * .3); for (let i = 0; i < 3; i++) put(g, lp(new THREE.IcosahedronGeometry(.3, 0), ['#ff8fb0', '#fff', '#ffd23f'][i]), 1.6 + (i - 1) * .4, 4.1 + i * .2, 0); return g; }
function pendant(y = 13) { const g = new THREE.Group(); put(g, Cy(.03, .03, 2, '#222', 4), 0, y - 1, 0); put(g, lp(new THREE.CylinderGeometry(.8, 1.8, 1.2, 8, 1, true), '#f0e2c0'), 0, y - 2.4, 0); put(g, lp(new THREE.SphereGeometry(.4, 8, 6), glow('#fff4d0')), 0, y - 2.6, 0); return g; }
function wallClock() { const g = new THREE.Group(); put(g, Cy(1, 1, .2, '#5a4030', 12), 0, 0, 0, 0, PI / 2); put(g, Cy(.85, .85, .05, glow('#fbf6e9'), 12), 0, 0, .12, 0, PI / 2); put(g, B(.08, .6, .05, '#222'), 0, .25, .17); put(g, B(.45, .08, .05, '#222'), .2, 0, .17); return g; }
function windowView(w, h, skyC = '#bfe0ff', curtain = '#e8d8b8') { const g = new THREE.Group(); put(g, B(w, h, .1, glow(skyC)), 0, 0, 0); put(g, B(w + .4, .3, .4, '#e8e8e8'), 0, h / 2, 0); put(g, B(w + .4, .3, .4, '#e8e8e8'), 0, -h / 2, 0); put(g, B(.25, h, .4, '#e8e8e8'), 0, 0, 0);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) put(g, B(.5, h + .4, .3, curtain), s * (w / 2 - .2 - i * .45), 0, .4 + (i % 2) * .15); return g; }
function bookshelf() { const g = new THREE.Group(); put(g, B(4, 7, 1.4, '#8a6040'), 0, 3.5, 0); for (let r = 0; r < 3; r++) { let x = -1.7; while (x < 1.6) { const w = rr(.25, .45), h = rr(1.2, 1.8); put(g, B(w, h, 1, ['#c84a3a', '#3a6ac8', '#e8c040', '#4a9a5a', '#f2ece0'][Math.floor(rr(0, 5))]), x + w / 2, 1 + r * 2.2 + h / 2, .25); x += w + .03; } } return g; }
function desk() { const g = new THREE.Group(); put(g, B(3, .2, 2, '#c8a070'), 0, 3.3, 0); put(g, B(2.8, .8, 1.8, '#9a9aa0'), 0, 2.8, 0); for (const [x, z] of [[-1.3, -.8], [1.3, -.8], [-1.3, .8], [1.3, .8]]) put(g, Cy(.07, .07, 3.2, '#8a8a90', 5), x, 1.6, z);
  const ch = new THREE.Group(); put(ch, B(1.8, .15, 1.6, '#c8a070'), 0, 2, 0); put(ch, B(1.8, 1.4, .12, '#c8a070'), 0, 3, .8); for (const [x, z] of [[-.8, -.7], [.8, -.7], [-.8, .7], [.8, .7]]) put(ch, Cy(.06, .06, 2, '#8a8a90', 5), x, 1, z); put(g, ch, 0, 0, 2); return g; }
function stoneLantern() { const g = new THREE.Group(); put(g, Cy(.9, 1.1, .6, '#9a968c', 6), 0, .3, 0); put(g, Cy(.35, .45, 2.6, '#9a968c', 6), 0, 1.9, 0); put(g, B(1.6, 1.2, 1.6, '#a8a49a'), 0, 3.8, 0); put(g, B(.8, .6, 1.7, glow('#fff0c0')), 0, 3.8, 0); put(g, lp(new THREE.ConeGeometry(1.5, 1, 4), '#8c887e'), 0, 4.9, 0, PI / 4); return g; }
function komainu(flip) { const g = new THREE.Group(); put(g, B(2, 1.2, 2, '#8c887e'), 0, .6, 0); put(g, B(1.2, 1.6, 1.4, '#a8a49a'), 0, 2, 0); put(g, B(1.1, 1, 1.1, '#a8a49a'), 0, 3.3, .4); put(g, B(.4, .3, .3, '#8c887e'), flip ? .5 : -.5, 3.9, .4); g.rotation.y = flip ? -.4 : .4; return g; }
function stall(label, awn) { const g = new THREE.Group(); put(g, B(6, 2.8, 2.4, '#c8a070'), 0, 1.4, 0); for (const x of [-2.8, 2.8]) put(g, Cy(.12, .12, 7, '#8a6a4a', 5), x, 3.5, -1);
  const stripe = ctex(256, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#fff' : awn; x.fillRect(i * 32, 0, 32, h); } }); put(g, B(6.6, .2, 3.4, M('#fff', { map: stripe })), 0, 7, .2, 0, -.25);
  put(g, B(4.4, 1.2, .1, M('#fff', { map: signTex(label, '#fff8e8', '#a22', 512, 140, 72) })), 0, 5.6, -.9); for (let i = 0; i < 3; i++) put(g, lantern(awn), -1.8 + i * 1.8, 6.2, 1.4).scale.setScalar(.35); return g; }
function plane() { const g = new THREE.Group(); put(g, Cy(1.6, 1.6, 22, '#f4f6f8', 10), 0, 0, 0, 0, 0, PI / 2); put(g, lp(new THREE.SphereGeometry(1.6, 10, 8), '#f4f6f8'), 11, 0, 0); put(g, B(6, .3, 24, '#e8ecf0'), 1, -.6, 0); put(g, B(3, 4, .3, '#2a5aa8'), -10, 2.6, 0); put(g, B(14, .15, 1.2, '#2a5aa8'), 0, .4, 1.62); return g; }
function boardTex(lines, bg = '#244a36', fg = 'rgba(255,255,255,.8)') { return ctex(512, 256, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a30'; x.lineWidth = 14; x.strokeRect(0, 0, w, h); x.fillStyle = fg; lines.forEach(([t, s, px, py]) => { x.font = `700 ${s}px "Noto Sans JP",sans-serif`; x.fillText(t, px, py); }); }); }
const tileTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#a8a294'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a766a'; x.lineWidth = 3; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); } }, [4, 4]);
const roadTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#6e6e72'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .08})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } x.fillStyle = '#f2f2f2'; x.fillRect(w / 2 - 3, 0, 6, h / 2); }, [1, 12]);
const ivyTex = ctex(256, 128, (x, w, h) => { x.fillStyle = '#2f6a2a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { x.fillStyle = ['#3f8a34', '#2a5a26', '#4a9a3c'][i % 3]; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 4, 0, 7); x.fill(); } }, [6, 1]);
const crowdTex = ctex(256, 128, (x, w, h) => { x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = ['#fff', '#e84a4a', '#3a6ac8', '#f0c040', '#222', '#f4d0b0'][i % 6]; x.fillRect(Math.random() * w, Math.random() * h, 3, 4); } }, [8, 1]);
const lattice = ctex(128, 256, (x, w, h) => { x.fillStyle = '#3a2416'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a3a22'; for (let i = 0; i < 16; i++) x.fillRect(i * 8, 0, 4, h); }, [6, 1]);
function tatamiBase(g) { g.add(sky('#ffd0a0', '#fff0e0')); const fl = ground('#fff', 60, tatami); fl.position.y = .01; g.add(fl); walls(g, 28, 24, 13);
  for (let i = -2; i <= 1; i++) put(g, B(5, 9, .2, M('#fff', { map: shoji })), i * 5.4 - 2.7, 5.2, -11.6); }
const WORLDS = {
  genkan(g) { outdoor(g, '#9ac8f0', '#f6e8d8', false); g.add(ground('#8a8070', 80));
    put(g, B(30, .9, 10, M('#fff', { map: tileTex })), 0, .45, 8);                    /* 토방(돌바닥) */
    put(g, B(30, 2, 18, M('#fff', { map: wood })), 0, 1, -6); put(g, B(30, .5, .6, '#5a3a22'), 0, 1.8, 3.1); /* 마루 + 문턱 */
    walls(g, 30, 30, 14.5, plaster, true, false); for (let i = -2; i <= 2; i++) put(g, B(5, 9, .2, M('#fff', { map: shoji })), i * 5.4, 6.6, -14.6);
    const ge = new THREE.Group(); put(ge, B(8, 4.5, 2.4, '#7a5530'), 0, 2.25, 0); for (let i = 0; i < 4; i++) put(ge, B(1.9, 4.1, .1, '#8a6540'), -3 + i * 2, 2.25, 1.22); put(ge, B(.7, 1.6, .7, '#3a5a7a'), 2.6, 5.3, 0); put(ge, lp(new THREE.IcosahedronGeometry(.6, 0), '#ff8fb0'), 2.6, 6.4, 0); put(ge, B(1.4, 1, .1, M('#fff', { map: signTex('ようこそ', '#fff8e8', '#a22', 256, 160, 52) })), -2, 5, 0, .2); put(g, ge, 11, .9, 8, -PI / 2);
    for (let i = 0; i < 3; i++) put(g, B(.9, .5, 2, ['#333', '#a33', '#335'][i]), -6 + i * 1.6, 1.15, 6);
    for (const x of [-1.2, 1.2]) put(g, B(.9, .25, 2, '#d8a8b8'), x, 2.15, -1.2);                                  /* 손님용 슬리퍼 */
    const um = new THREE.Group(); put(um, Cy(.7, .6, 2.6, '#5a6a7a', 8), 0, 1.3, 0); put(um, Cy(.06, .06, 4, '#222', 4), .2, 2.6, 0, 0, .1); put(um, lp(new THREE.ConeGeometry(.35, 2.4, 6), '#3a6ac8'), .3, 3.4, 0, 0, .1); put(g, um, -12, .9, 10);
    put(g, B(2.2, 3, .2, M('#fff', { map: signTex('山下', '#f8f2e4', '#333', 256, 256, 120) })), 13, 9, -14.6); put(g, plant(), -12, 2, -10); put(g, pendant(14.5), 0, 0, -4);
    return { o: [0, .9, 6, PI], s: [0, 2, -1, 0] }; },
  room(g) { tatamiBase(g); put(g, tokonoma(), 10, 0, -10.3); put(g, kotatsu(), 0, 0, 2); for (const [x, z, c] of [[0, -2, '#3a5a8a'], [-5.5, 2, '#8a3a4a'], [5.5, 2, '#8a3a4a']]) put(g, zabuton(c), x, 0, z);
    put(g, tansu(), -12, 0, -8, PI / 2); put(g, tv(), -12, 0, 2, PI / 2); put(g, plant(3), 12, 0, 6); put(g, pendant(13), 0, 0, 1); const ck = wallClock(); put(g, ck, 5, 10.5, -11.7);
    put(g, B(1.6, 2.2, .05, M('#fff', { map: boardTex([['3', 90, 200, 150]], '#fbf6e9', '#c22') })), -6, 9, -11.7); put(g, bookshelf(), 13.4, 0, -3, -PI / 2);
    return { o: [-3.5, 0, 6, PI * .85], s: [3.5, 0, 6, -PI * .85] }; },
  class(g) { g.add(sky('#bfe0ff', '#ffffff')); g.add(ground('#fff', 80, wood)); walls(g, 36, 32, 14, '#f2efe6');
    put(g, B(16, 6, .2, M('#fff', { map: boardTex([['5月 4日 (月)', 34, 24, 50], ['日直  山下 ・ ハン', 30, 24, 100], ['今日の目標: あいさつをしよう', 28, 24, 180]]) })), 0, 6.5, -15.6);
    put(g, B(16.6, .3, .6, '#7a5a30'), 0, 3.4, -15.4); put(g, B(5, 3.6, 2.4, '#a87850'), 0, 1.8, -12.5); const ck = wallClock(); put(g, ck, 10, 11, -15.6);
    for (let i = 0; i < 3; i++) put(g, windowView(7, 6), 17.6, 7, -9 + i * 9, -PI / 2);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) put(g, desk(), -9 + c * 6, 0, -6 + r * 7 + (r > 0 ? 3 : 0), PI);
    for (let i = 0; i < 6; i++) put(g, B(2.6, 2.6, 2, '#8a8a92'), -10 + i * 3, 1.3, 15); put(g, B(.1, 4, 10, '#c8a070'), -17.6, 7.5, 2);
    for (let i = 0; i < 4; i++) put(g, B(.05, 1.8, 1.4, ['#fff', '#ffe8a0', '#d8f0ff', '#ffd8e0'][i]), -17.5, 7.6, -2 + i * 2.5);
    for (let i = 0; i < 3; i++) for (const x of [-8, 8]) put(g, B(1, .3, 8, glow('#ffffff')), x, 13.7, -8 + i * 9); put(g, B(.3, 9, 4, '#a87850'), -17.6, 4.5, -12);
    return { o: [-2.5, 0, 4, PI * .9], s: [2.5, 0, 4, -PI * .9] }; },
  club(g) { tatamiBase(g); put(g, tokonoma('一意専心'), 10, 0, -10.3); put(g, pendant(13), -4, 0, 0); put(g, pendant(13), 4, 0, 0); put(g, B(6, 4, .1, M('#fff', { map: boardTex([['7月 練習予定', 30, 20, 50], ['月水金  4:00〜', 26, 20, 110], ['大会まで あと 12日!', 28, 20, 180]], '#f4f4f0', '#222') })), -9, 7.5, -11.6); for (let i = 0; i < 4; i++) put(g, zabuton('#5a4a8a'), -6 + i * 4, 0, 8); for (let side = 0; side < 2; side++) for (let i = 0; i < 24; i++) { const c = B(.5, .03, .72, '#f8f0d8'); c.position.set(-4.2 + (i % 8) * .62, .05, -4 + side * 2.4 + Math.floor(i / 8) * .8); g.add(c); }
    put(g, B(6, 2, .2, M('#fff', { map: signTex('競技かるた部', '#fff', '#a22', 512, 160, 60) })), 0, 9.5, -11.3); put(g, B(3, 2.6, 2, '#7a5530'), -9, 1.3, -6); put(g, B(1.4, .6, 1, '#c84a3a'), -9, 2.9, -6);
    for (let i = 0; i < 3; i++) { const t = new THREE.Group(); put(t, Cy(.3, .5, .4, '#c8a040', 8), 0, .2, 0); put(t, Cy(.1, .1, .8, '#c8a040', 6), 0, .8, 0); put(t, lp(new THREE.CylinderGeometry(.7, .3, 1, 8), '#e8c040'), 0, 1.7, 0); put(g, t, 10.5 + i * 1.2, 6.3, -9.5); }
    return { o: [-3.5, 0, 6, PI * .85], s: [3.5, 0, 6, -PI * .85] }; },
  shrine(g, night) { night = night || CUR.night; if (night) { g.add(sky('#0a1030', '#2a2050')); for (let i = 0; i < 120; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(.4), glow('#fff')); s.position.set(rr(-150, 150), rr(40, 120), rr(-170, -60)); g.add(s); } } else outdoor(g, '#9ac8f0', '#f0f0ff');
    g.add(ground(night ? '#5a5a6a' : '#c8c0a8', 140)); for (let i = 0; i < 9; i++) put(g, B(5, .2, 3, '#a8a49a'), 0, .1, 6 - i * 4);
    const tor = new THREE.Group(), red = '#d8342a'; put(tor, Cy(.5, .6, 12, red, 8), -6, 6, 0); put(tor, Cy(.5, .6, 12, red, 8), 6, 6, 0); put(tor, B(17, .9, 1.2, '#222'), 0, 12.4, 0); put(tor, B(15, .7, .7, red), 0, 10.4, 0); put(tor, B(1, 2, .5, '#222'), 0, 11.4, 0); tor.position.z = -6; g.add(tor);
    const hall = new THREE.Group(); put(hall, B(18, 8, 10, '#a8623a'), 0, 4, 0); for (const x of [-8, -3, 3, 8]) put(hall, Cy(.5, .5, 8, '#7a3a22', 8), x, 4, 5.2); put(hall, gable(24, 15, 6, '#3a4a3a'), 0, 8, 0);
    put(hall, lp(new THREE.TorusGeometry(5, .45, 6, 16, PI), '#d8c890'), 0, 9, 5.6, 0, 0, PI); for (let i = 0; i < 4; i++) put(hall, B(.5, 1.4, .05, glow('#ffffff')), -3 + i * 2, 7.8, 5.7); put(hall, B(18.6, 1.2, 1, '#5a5a4a'), 0, .6, 5.4); hall.position.set(0, 0, -30); g.add(hall);
    put(g, B(3.4, 2, 2, '#7a5530'), 0, 1, -24); put(g, Cy(.6, .9, 1.4, '#c8a040', 8), 0, 7, -24.5); put(g, Cy(.12, .12, 5, '#e8d8a0', 5), 0, 4, -24.5);
    for (let i = 0; i < 6; i++) put(g, stoneLantern(), i % 2 ? 7 : -7, 0, -2 - Math.floor(i / 2) * 7);
    put(g, komainu(false), -5, 0, -14); put(g, komainu(true), 5, 0, -14);
    const ema = new THREE.Group(); put(ema, B(6, .3, .3, '#7a5530'), 0, 4, 0); for (const x of [-2.8, 2.8]) put(ema, B(.3, 4, .3, '#7a5530'), x, 2, 0); for (let i = 0; i < 9; i++) put(ema, B(.6, .45, .05, '#e8c890'), -2.2 + (i % 5) * 1.1, 3.4 - Math.floor(i / 5) * .6, .2, 0, 0, rr(-.2, .2)); put(g, ema, 12, 0, -20, -.5);
    const ch = new THREE.Group(); put(ch, B(4, 1.4, 2, '#8c887e'), 0, .7, 0); put(ch, B(3.6, .1, 1.6, glow('#6ab0d8')), 0, 1.42, 0); for (const x of [-2, 2]) put(ch, Cy(.2, .2, 6, '#7a3a22', 6), x, 3, 0); put(ch, gable(5.6, 3, 1.6, '#3a4a3a'), 0, 6, 0); put(g, ch, -12, 0, -18, .4);
    for (let i = 0; i < 12; i++) put(g, cedar(rr(11, 16)), (i % 2 ? 1 : -1) * rr(16, 28), 0, -6 - i * 5); for (let i = 0; i < 6; i++) put(g, bush(rr(1, 1.8), '#3f7a3a'), (i % 2 ? 1 : -1) * rr(10, 14), 0, rr(-30, 6));
    if (night) scene.fog = new THREE.Fog('#1a1838', 40, 140); return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  festival(g) { WORLDS.shrine(g, true); const lm = new THREE.LineBasicMaterial({ color: '#111' });
    for (const z of [4, -4]) { g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 16 }, (_, i) => new THREE.Vector3(-15 + i * 2, 9.6 - S(i / 15 * PI) * .8, z))), lm)); for (let i = 0; i < 15; i++) { const l = lantern(['#ff5a3a', '#ffd060', '#ff9ab8'][i % 3]); l.scale.setScalar(.55); l.position.set(-14 + i * 2, 8.6 - S((i + .5) / 15 * PI) * .8, z); g.add(l); } }
    [['たこ焼き', '#d8342a'], ['わたあめ', '#ff8fb0'], ['金魚すくい', '#3a6ac8'], ['やきそば', '#e8a030'], ['かき氷', '#4ab0d8'], ['ラムネ', '#40b080']].forEach(([t, c], i) => put(g, stall(t, c), i % 2 ? 13 : -13, 0, 2 - Math.floor(i / 2) * 8, i % 2 ? -PI / 2 : PI / 2));
    const yag = new THREE.Group(); for (const [x, z] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) put(yag, Cy(.25, .25, 7, '#8a2a2a', 5), x, 3.5, z); put(yag, B(6.4, .4, 6.4, '#8a2a2a'), 0, 4.2, 0); put(yag, Cy(1.2, 1.2, 1.6, '#c84a3a', 10), 0, 5.2, 0, 0, PI / 2); put(yag, gable(7, 7, 2, '#3a2a2a'), 0, 7, 0); yag.position.set(0, 0, -16); g.add(yag);
    for (let i = 0; i < 3; i++) { const b = new THREE.Group(); put(b, Cy(.15, .15, 14, '#4a9a3a', 5), 0, 7, 0); for (let j = 0; j < 14; j++) put(b, B(.3, 1, .03, ['#ff7ab0', '#7ab8ff', '#ffe27a', '#9aff7a'][j % 4]), S(j * 3) * 1.8, 6 + (j % 7) * 1.1, Math.cos(j * 3) * 1.8); b.position.set(-12 + i * 12, 0, -10); g.add(b); }
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  street(g) { outdoor(g, '#ffc8d8', '#fff8f0'); g.add(ground(season() === 'winter' ? '#e4e6ea' : '#9aa08a', 160)); const rd = ground('#fff', 1, roadTex); rd.scale.set(10, 160, 1); rd.position.y = .02; g.add(rd);
    for (const x of [-6, 6]) put(g, B(2.4, .5, 160, '#c8c4ba'), x, .25, 0); for (let i = 0; i < 6; i++) put(g, B(1.2, .03, 5, glow('#f4f4f4')), -3.6 + i * 1.45, .04, 14);
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { put(g, house(rr(9, 12), rr(8, 10), 9, ['#f2ece0', '#e8dcc8', '#dfe6ea', '#f0e0d0'][i % 4], ['#4a5a6a', '#6a3a2a', '#3a4a3a'][i % 3]), s * 21, 0, -50 + i * 14, s < 0 ? PI / 2 : -PI / 2); put(g, blockWall(10), s * 14.5, 0, -50 + i * 14, PI / 2); }
    const pts = []; for (let i = 0; i < 6; i++) { put(g, pole(), 8, 0, -45 + i * 16); pts.push([8, -45 + i * 16]); } wires(g, pts);
    for (let i = 0; i < 6; i++) put(g, tree(null, 8), (i % 2 ? 1 : -1) * 10, 0, -38 + i * 10);
    put(g, vending('#d8343a'), -9.5, .5, -6, PI / 2); put(g, vending('#2a6ac8'), -9.5, .5, -2.6, PI / 2); put(g, mailbox(), 9.6, .5, 10); put(g, lamp(), -8, 0, 18, PI / 2);
    for (let i = 0; i < 8; i++) put(g, bush(rr(.8, 1.4), '#4a8a3a'), (i % 2 ? 1 : -1) * rr(11.5, 13.5), 0, -40 + i * 9); grass(g, 130, -14, -7.4, -60, 30); grass(g, 130, 7.4, 14, -60, 30); flowers(g, 60, -14, -8, -40, 20);
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  school(g) { outdoor(g, '#9ac8f0', '#ffffff'); g.add(ground('#c8b48a', 200));
    const sb = new THREE.Group(); put(sb, B(64, 18, 12, '#f2f0ea'), 0, 9, 0); for (let f = 0; f < 3; f++) for (let i = 0; i < 12; i++) put(sb, B(3.6, 2.6, .2, glow('#bfe0ff')), -27 + i * 4.9, 4 + f * 5.2, 6.1); for (let f = 0; f < 3; f++) put(sb, B(64, .3, .4, '#d8d4ca'), 0, 2.3 + f * 5.2, 6.2);
    put(sb, Cy(2, 2, .4, glow('#fbf6e9'), 16), 0, 21, 6, 0, PI / 2); put(sb, B(14, 4, 2, '#f2f0ea'), 0, 20, 0); put(sb, B(10, 1, 8, '#8a8a8a'), 0, 4.5, 9); for (const x of [-4.5, 4.5]) put(sb, Cy(.3, .3, 4.5, '#8a8a8a', 6), x, 2.25, 12.5);
    for (let i = 0; i < 30; i++) put(sb, B(.12, 1.8, .12, '#6a8a6a'), -30 + i * 2.06, 18.9, 5.8); sb.position.z = -42; g.add(sb);
    for (const x of [-9, 9]) { put(g, B(2.2, 7, 2.2, '#b8b4aa'), x, 3.5, 14); } put(g, B(1.4, 4.4, .2, M('#fff', { map: signTex('桜丘高等学校', '#f8f6ee', '#222', 128, 512, 50) })), 9, 4.2, 15.2);
    const rack = new THREE.Group(); put(rack, B(16, .3, 5, '#6a7a8a'), 0, 6, 0); for (const x of [-7.6, 7.6]) put(rack, Cy(.2, .2, 6, '#6a7a8a', 6), x, 3, -2); for (let i = 0; i < 9; i++) put(rack, bike(), -7 + i * 1.75, 0, 0); put(g, rack, 20, 0, -14, -PI / 2);
    for (let i = 0; i < 7; i++) put(g, tree(null, 9), -32 + i * 10.5, 0, -26); const gl = new THREE.Group(); for (const x of [-3, 3]) put(gl, Cy(.15, .15, 5, '#fff', 5), x, 2.5, 0); put(gl, Cy(.15, .15, 6, '#fff', 5), 0, 5, 0, 0, 0, PI / 2); put(g, gl, -30, 0, 0, PI / 2);
    for (let i = 0; i < 40; i++) put(g, B(.12, 4, .12, '#6a6a6a'), -40 + i * 2, 2, 22); put(g, B(80, 2.5, .05, M('#fff', { transparent: true, opacity: .35 })), 0, 2.8, 22);
    for (let i = 0; i < 6; i++) put(g, bush(rr(1, 1.5), '#4a8a3a'), -14 + i * 2.4, 0, -33); flowers(g, 70, -16, 0, -34, -31); grass(g, 160, -40, 40, 16, 21);
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; },
  hospital(g) { g.add(sky('#e8f0ff', '#ffffff')); g.add(ground('#dfe2e4', 60)); put(g, B(30, 14, .4, '#f4f6f8'), 0, 7, -10); put(g, B(.4, 14, 30, '#f4f6f8'), -14, 7, 0); put(g, B(30, .3, 30, '#f8fafc'), 0, 14, 0);
    const bed = new THREE.Group(); put(bed, B(5, 1.6, 9, '#ffffff'), 0, 1.6, 0); put(bed, B(5, 3, .4, '#9ab'), 0, 2.5, -4.4); put(bed, B(5, 2, .4, '#9ab'), 0, 2, 4.4); put(bed, B(3.4, .6, 1.6, '#f6f8fb'), 0, 2.6, -3.4); put(bed, B(5.2, .3, 5.6, '#bfd4e8'), 0, 2.45, 1.2); for (const x of [-2.6, 2.6]) put(bed, B(.15, .8, 4, '#c8ccd0'), x, 3, -.5); bed.position.set(5, 0, -3); g.add(bed);
    const iv = new THREE.Group(); put(iv, Cy(.08, .08, 9, '#c8ccd0', 5), 0, 4.5, 0); put(iv, Cy(.8, .8, .2, '#888', 5), 0, .2, 0); put(iv, B(.8, 1.2, .3, glow('#e8f4ff')), .4, 8.2, 0); put(g, iv, 9.5, 0, -6);
    const cab = new THREE.Group(); put(cab, B(2.4, 3.4, 2.2, '#e8e0d0'), 0, 1.7, 0); put(cab, Cy(.35, .45, 1, '#88b0d8', 8), -.4, 3.9, 0); for (let i = 0; i < 5; i++) put(cab, lp(new THREE.IcosahedronGeometry(.3, 0), '#ffd23f'), -.4 + S(i * 1.3) * .35, 4.8 + (i % 2) * .3, Math.cos(i * 1.3) * .3); put(cab, lp(new THREE.IcosahedronGeometry(.32, 1), '#ff9a2a'), .6, 3.7, .3); put(g, cab, .8, 0, -6);
    put(g, windowView(8, 6, '#9fd0ff', '#e8eef4'), 13.6, 7, -2, -PI / 2); put(g, B(.2, .2, 14, '#c8ccd0'), 10, 13.4, -2); for (let i = 0; i < 6; i++) put(g, B(.15, 11, 1.2, '#eaf2f6'), 10, 7.8, -8 + i * 1.3, rr(-.3, .3));
    put(g, B(2, .3, 2, '#7a8aa0'), -3, 2.2, 3); put(g, B(2, 2.4, .25, '#7a8aa0'), -3, 3.2, 2); put(g, B(4.4, 3, .2, '#18181c'), -6, 10, -9.8); put(g, B(5, 9.5, .3, '#c8d4e0'), -10, 4.75, -9.7);
    return { o: [-1.5, 0, 4, PI * .8], s: [4, 0, 0, -PI * .6] }; },
  airport(g) { outdoor(g, '#cfe4ff', '#ffffff'); g.add(ground('#d8dce0', 200)); put(g, B(80, 18, .5, M('#9fd0ff', { transparent: true, opacity: .55 })), 0, 9, -24); for (let i = 0; i < 9; i++) put(g, B(.4, 18, .7, '#8a9aaa'), -32 + i * 8, 9, -24);
    put(g, B(80, .5, 30, '#eef2f6'), 0, 18, -10); for (let i = 0; i < 4; i++) put(g, B(1, .3, 22, glow('#ffffff')), -24 + i * 16, 17.7, -10);
    put(g, plane(), 6, 7, -55, -.3); put(g, plane(), -40, 7, -80, .4);
    const fb = ctex(512, 256, (x, w, h) => { x.fillStyle = '#10182a'; x.fillRect(0, 0, w, h); x.font = '700 22px "Noto Sans JP",sans-serif'; x.fillStyle = '#ffd23f'; x.fillText('出発  DEPARTURES', 16, 32); [['10:35', 'ソウル/仁川', 'ICN', '搭乗中'], ['10:50', '台北', 'TPE', '定刻'], ['11:05', '釜山', 'PUS', '定刻'], ['11:20', '上海', 'PVG', '遅延'], ['11:40', 'シンガポール', 'SIN', '定刻']].forEach((r, i) => { x.fillStyle = i ? '#e8f0ff' : '#7cf0a0'; r.forEach((c, j) => x.fillText(c, 16 + [0, 90, 300, 380][j], 74 + i * 38)); }); });
    put(g, B(12, 6, .3, M('#fff', { map: fb })), -12, 11, -9.8); put(g, B(14, 2.2, .3, M('#fff', { map: signTex('出発口  Departure  출국', '#1a3a6a', '#fff', 1024, 160, 70) })), 0, 13, -10); put(g, B(.6, 11, .6, '#888'), -7, 5.5, -10); put(g, B(.6, 11, .6, '#888'), 7, 5.5, -10);
    put(g, B(.5, 18, 70, M('#9fd0ff', { transparent: true, opacity: .5 })), 28, 9, 0); for (let i = 0; i < 8; i++) put(g, B(.7, 18, .4, '#8a9aaa'), 28, 9, -28 + i * 8); put(g, plane(), 60, 6, 6, PI / 2 + .3); put(g, B(.3, 2.4, 10, M('#fff', { map: signTex('搭乗口 12  Gate', '#1a3a6a', '#fff', 1024, 200, 80) })), 27.5, 14, 0);
    for (let r = 0; r < 2; r++) put(g, bench(10), 18, 0, 4 + r * 5, -PI / 2); for (let i = 0; i < 3; i++) put(g, B(5, 3.4, 2, '#c8ccd4'), -22 + i * 7, 1.7, 4); put(g, plant(3), 10, 0, -6); put(g, plant(3), -10, 0, -6);
    return { o: [0, 0, -6, 0], s: [0, 0, 4, PI] }; },
  stadium(g) { outdoor(g, '#7ab8ff', '#ffffff', false); g.add(ground('#c88a5a', 220)); const field = ground('#3a8a3a', 70); field.position.set(0, .02, -26); g.add(field);
    const dia = ground('#b87a4a', 18); dia.rotation.z = PI / 4; dia.position.set(0, .04, -8); g.add(dia); for (const [x, z] of [[0, -16], [8, -8], [-8, -8], [0, 0]]) put(g, B(1, .2, 1, '#ffffff'), x, .1, z, PI / 4);
    for (let i = 0; i < 6; i++) put(g, B(90, 3, 4, M('#fff', { map: crowdTex })), 0, 1.5 + i * 2.4, 22 + i * 4);
    put(g, B(90, 6, 1, M('#fff', { map: ivyTex })), 0, 3, -62); put(g, B(30, 10, 1, M('#fff', { map: boardTex([['甲子園', 40, 20, 50], ['1 2 3 4 5 6 7 8 9', 30, 20, 120], ['0 0 1 0 2 0 0 0 1', 30, 20, 170], ['0 1 0 0 0 3 0 0 X', 30, 20, 220]], '#10301a') })), 0, 14, -63);
    for (const x of [-40, 40]) { put(g, Cy(.6, .8, 30, '#8a8a8a', 6), x, 15, -50); put(g, B(8, 4, 1, glow('#fffbe8')), x, 30, -50); }
    return { o: [-2.5, 0, 6, PI * .9], s: [2.5, 0, 6, -PI * .9] }; },
  kyoto(g) { outdoor(g, '#ffd8b8', '#fff8f0'); g.add(ground('#b8ae9a', 160)); for (let i = 0; i < 30; i++) put(g, B(rr(1.4, 2.2), .15, rr(1.4, 2.2), ['#9a968c', '#a8a49a', '#8c887e'][i % 3]), rr(-5, 5), .08, rr(-40, 20), rr(0, 1));
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const h = new THREE.Group(); put(h, B(10, 7, 9, '#5a3a22'), 0, 3.5, 0); put(h, B(9, 5, .1, M('#fff', { map: lattice })), 0, 3.2, 4.55); put(h, gable(11.6, 10.6, 3, '#2a2a2a'), 0, 7, 0); put(h, B(10.6, .4, 1.6, '#2a2a2a'), 0, 4.8, 5); put(h, lantern('#f8e8c0'), 3, 5.6, 5.3).scale.setScalar(.4); put(g, h, s * 13, 0, -40 + i * 11, s < 0 ? PI / 2 : -PI / 2); }
    const pg = new THREE.Group(); for (let i = 0; i < 5; i++) { const w = 7 - i * .9; put(pg, B(w, 3, w, '#a8623a'), 0, 1.5 + i * 4, 0); put(pg, lp(new THREE.ConeGeometry(w * .95, 1.6, 4), '#2a3a3a'), 0, 3.8 + i * 4, 0, PI / 4); } put(pg, Cy(.2, .2, 6, '#c8a040', 5), 0, 23, 0); for (let i = 0; i < 6; i++) put(pg, Cy(.6, .6, .2, '#c8a040', 8), 0, 21 + i * .8, 0); pg.position.set(16, 0, -48); g.add(pg);
    for (let i = 0; i < 6; i++) put(g, tree(['#d8402a', '#e8702a', '#e0a832'][i % 3], 7), (i % 2 ? 1 : -1) * 6.5, 0, -30 + i * 9); for (let i = 0; i < 4; i++) put(g, stoneLantern(), (i % 2 ? 1 : -1) * 5.5, 0, -12 + i * 6);
    return { o: [-2.5, 0, 5, PI * .9], s: [2.5, 0, 5, -PI * .9] }; }
};
let SPOTS = null;
function setWorld(n) {
  if (WORLD) scene.remove(WORLD); scene.fog = null; WORLD = new THREE.Group(); SPOTS = (WORLDS[n] || WORLDS.room)(WORLD, false); scene.add(WORLD);
  const night = ['festival'].includes(n) || (n === 'shrine' && CUR.night); light(night ? '밤달빛' : '기본');
  /* 나란히 선 장면은 서로 마주 보면서 카메라(+z) 쪽으로 살짝 */
  if (Math.abs(SPOTS.o[2] - SPOTS.s[2]) < 1.5) { const k = SPOTS.o[0] < SPOTS.s[0] ? 1 : -1; SPOTS.o[3] = k * 1.15; SPOTS.s[3] = -k * 1.15; }
  place('o', SPOTS.o); place('s', SPOTS.s); FXclear();
  roll = 0; fovT = 34; $('#view').classList.remove('on'); $('#noise').className = '';
  if (CUR.rain && !['room', 'genkan', 'class', 'club', 'hospital'].includes(n)) fx('rain');
}
const LIGHTS = { 벚꽃역광: { h: '#ffe6f0', g: '#8a6a7a', hi: 1.5, s: '#ffd0c0', si: 2.6, sp: [-10, 9, -18], ex: 1.18 }, 저녁실내: { h: '#ffd8a8', g: '#6a4a30', hi: 1.15, s: '#ffb070', si: 1.6, sp: [12, 8, 6], ex: 1.05 }, 아침햇살: { h: '#fff4e4', g: '#7a6a58', hi: 1.65, s: '#ffe6c0', si: 2.5, sp: [14, 10, 10], ex: 1.12 }, 정오햇살: { h: '#ffffff', g: '#7a7064', hi: 1.75, s: '#fffaf0', si: 2.6, sp: [4, 22, 6], ex: 1.08 }, 오후노을_시작: { h: '#ffe8cc', g: '#6a5040', hi: 1.45, s: '#ffc890', si: 2.2, sp: [16, 9, 8], ex: 1.08 }, 오후노을: { h: '#ffd4a8', g: '#5a3a28', hi: 1.25, s: '#ff9a50', si: 2.1, sp: [18, 5, 6], ex: 1.12 }, 저녁노을_어스름: { h: '#c8a8e0', g: '#3a2a40', hi: 1, s: '#ff9a70', si: 1.3, sp: [-16, 4, -10], ex: 1.18 }, 밤달빛: { h: '#9ab0ff', g: '#20203a', hi: .75, s: '#b8c8ff', si: .9, sp: [-8, 14, 4], ex: 1.25 }, 기본: { h: '#ffffff', g: '#6a5a50', hi: 1.6, s: '#fff2e0', si: 2.2, sp: [8, 18, 12], ex: 1.05 },
  오후햇살: { h: '#fff0d8', g: '#7a6450', hi: 1.7, s: '#ffe0a8', si: 2.6, sp: [14, 14, 8], ex: 1.12 }, 오후실내: { h: '#ffe8c8', g: '#6a5038', hi: 1.4, s: '#ffd090', si: 2, sp: [14, 10, 6], ex: 1.06 },
  장마_오후: { h: '#b8c8d8', g: '#4a5058', hi: 1.1, s: '#c8d4e0', si: 1, sp: [-6, 12, 8], ex: 1 }, 장마_역광: { h: '#c8d0e0', g: '#4a4a58', hi: 1.15, s: '#ffe2c0', si: 2, sp: [-10, 7, -16], ex: 1.14 }, 장마_저녁: { h: '#7a8aa8', g: '#20262e', hi: .8, s: '#9aaac0', si: .7, sp: [-8, 12, 6], ex: 1.05 },
  병원형광등: { h: '#eef4ff', g: '#8a9098', hi: 1.55, s: '#e8f0ff', si: 1.4, sp: [0, 20, 4], ex: 1 }, 밤형광등: { h: '#dfe8ff', g: '#30343e', hi: 1.1, s: '#e8eeff', si: 1.1, sp: [0, 18, 4], ex: 1 }, 체육관빛: { h: '#fff8ec', g: '#6a6050', hi: 1.6, s: '#fff4e0', si: 2, sp: [0, 24, 6], ex: 1.04 },
  겨울오후: { h: '#e8eef8', g: '#5a5a68', hi: 1.4, s: '#fff0dc', si: 1.6, sp: [12, 10, 8], ex: 1.05 }, 고타쓰: { h: '#ffb880', g: '#2a1a18', hi: .85, s: '#ff9a5a', si: 1.3, sp: [4, 4, 8], ex: 1.2 }, 겨울아침: { h: '#f4f8ff', g: '#8a8c98', hi: 1.75, s: '#ffffff', si: 2.2, sp: [10, 12, 10], ex: 1.12 },
  겨울저녁: { h: '#8a9ac8', g: '#28283a', hi: .95, s: '#ffb880', si: 1.1, sp: [-12, 5, 6], ex: 1.12 }, 겨울흐림: { h: '#c8ccd4', g: '#4a4c54', hi: 1.25, s: '#d8dce4', si: .9, sp: [0, 18, 6], ex: 1 }, 오후노을_저채도: { h: '#c8b8a8', g: '#3a3430', hi: 1, s: '#e0a880', si: 1.2, sp: [18, 5, 4], ex: 1.02 },
  축제등불: { h: '#ffb878', g: '#2a1a30', hi: 1, s: '#ff9a50', si: 1.5, sp: [10, 6, 8], ex: 1.2 }, 불꽃빛: { h: '#ffb8d8', g: '#2a1a3a', hi: .95, s: '#ffd070', si: 1.7, sp: [-6, 16, -14], ex: 1.25 } };
function light(n) { const k = LIGHTS[n] ? n : /장마|비/.test(n) ? (/저녁|밤/.test(n) ? '장마_저녁' : '장마_오후') : /형광/.test(n) ? '병원형광등' : /등불|제등/.test(n) ? '축제등불' : /불꽃/.test(n) ? '불꽃빛' : /밤|달/.test(n) ? '밤달빛' : /어스름|저녁노을/.test(n) ? '저녁노을_어스름' : /노을|석양/.test(n) ? '오후노을' : /아침/.test(n) ? '아침햇살' : /정오|낮/.test(n) ? '정오햇살' : /벚꽃/.test(n) ? '벚꽃역광' : /실내|저녁/.test(n) ? '저녁실내' : '기본'; const L = LIGHTS[k]; hemi.color.set(L.h); hemi.groundColor.set(L.g); hemi.intensity = L.hi; sun.color.set(L.s); sun.intensity = L.si; sun.position.set(...L.sp); R.toneMappingExposure = L.ex; }
function place(k, p) { const a = AV[k]; if (!a || !p) return; a.g.position.set(p[0], p[1] || 0, p[2]); a.g.rotation.y = p[3] || 0; a.tgt = null; }
function walk(k, x, z, ry) { const a = AV[k]; if (a) a.tgt = { p: V3(x, a.g.position.y, z), ry }; }

/* ── 효과: 벚꽃 · 눈 · 불꽃 · 반딧불 ── */
let parts = null;
function FXclear() { if (parts) { scene.remove(parts.m); parts = null; } }
function fx(kind) { FXclear(); if (!kind) return; const n = kind === 'fireworks' ? 600 : kind === 'rain_heavy' ? 900 : kind === 'rain' ? 500 : 260, geo = new THREE.BufferGeometry(), P = new Float32Array(n * 3), V = [];
  for (let i = 0; i < n; i++) { P[i * 3] = (Math.random() - .5) * 50; P[i * 3 + 1] = Math.random() * 25; P[i * 3 + 2] = (Math.random() - .5) * 40; V.push(Math.random()); }
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); const col = { sakura: '#ffb8d0', snow: '#ffffff', fireworks: '#ffd060', firefly: '#d8ff60', confetti: '#ff7ab0', beans: '#c8a060', rain: '#cfdcff', rain_heavy: '#bcd0ff' }[kind] || '#fff';
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: kind === 'fireworks' ? .35 : /rain/.test(kind) ? .18 : .45, transparent: true, opacity: /rain/.test(kind) ? .7 : .9, depthWrite: false })); scene.add(m); parts = { m, kind, V, t: 0 }; }
function stepFX(dt) { if (!parts) return; parts.t += dt; const P = parts.m.geometry.attributes.position, k = parts.kind;
  for (let i = 0; i < P.count; i++) { let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const v = parts.V[i];
    if (k === 'fireworks') { const c = Math.floor(i / 100), ph = (parts.t * .5 + c * .37) % 1, cx = ((c * 37) % 7 - 3) * 8, cy = 30 + (c % 3) * 5, a = i * 2.39996, r = ph * 12 * (0.6 + v * .4); x = cx + Math.cos(a) * r; y = cy + Math.sin(a * .7) * r - ph * ph * 6; z = -40 + Math.sin(a) * r * .5; parts.m.material.color.setHSL((c * .17 + .05) % 1, .9, .6); parts.m.material.opacity = 1 - ph; }
    else if (k === 'firefly') { x += S(parts.t + v * 9) * dt; y = 2 + Math.abs(S(parts.t * .5 + v * 7)) * 6; }
    else if (/rain/.test(k)) { y -= dt * (k === 'rain_heavy' ? 34 : 24) * (.7 + v * .5); x -= dt * 2; if (y < 0) { y = 25; x = (Math.random() - .5) * 50; } }
    else { y -= dt * (k === 'snow' ? 1.5 : 2.2) * (.5 + v); x += S(parts.t + v * 6) * dt * 1.5; if (y < 0) y = 25; }
    P.setXYZ(i, x, y, z); } P.needsUpdate = true; }

/* ── 카메라 연출 ── */
let shot = 'two', camT = 0, shake = 0, roll = 0, rollC = 0, fovT = 34, fovRate = 2;
const camPos = V3(0, 6, 20), camLook = V3(0, 5, 0);
function shotTarget() { const o = AV.o.g.position, s = AV.s.g.position, mid = o.clone().add(s).multiplyScalar(.5), d = s.clone().sub(o); d.y = 0; const L = Math.max(3, d.length()); d.normalize(); const side = V3(-d.z, 0, d.x);
  const sw = S(camT * .25) * .6; let p, l;
  if (shot === 'suzu') { p = o.clone().addScaledVector(d, -2.2).addScaledVector(side, 4.2).add(V3(0, 7.7, 0)); l = s.clone().add(V3(0, 6.8, 0)); }
  else if (shot === 'onna') { p = s.clone().addScaledVector(d, 2.2).addScaledVector(side, 4.2).add(V3(0, 7.7, 0)); l = o.clone().add(V3(0, 6.8, 0)); }
  else if (shot === 'close') { const dy = AV.s.dy || 0; p = s.clone().addScaledVector(d, -2.6).addScaledVector(side, 3).add(V3(sw * .5, 7.3 + dy * .8, 0)); l = s.clone().add(V3(0, 6.9 + dy, 0)); }
  else if (shot === 'closeo') { const dy = AV.o.dy || 0; p = o.clone().addScaledVector(d, 2.6).addScaledVector(side, 3).add(V3(sw * .5, 7.3 + dy * .8, 0)); l = o.clone().add(V3(0, 6.9 + dy, 0)); }
  else if (shot === 'wide') { p = mid.clone().addScaledVector(side, 26 + L).add(V3(sw * 4, 12, 0)); l = mid.clone().add(V3(0, 4, 0)); }
  else if (shot === 'sky') { p = mid.clone().addScaledVector(side, 18).add(V3(0, 4, 0)); l = mid.clone().add(V3(0, 18, -20)); }
  else { p = mid.clone().addScaledVector(side, 13 + L * .6).add(V3(sw, 7, 0)); l = mid.clone().add(V3(0, 5.6, 0)); }
  /* 세로 화면(폰)에서는 뒤로 물러나서 둘 다 보이게, 쪼그려 앉으면 클로즈업도 조금 물러남 */
  let f = cam.aspect < 1 ? Math.min(2, .8 / cam.aspect) : 1; if ((shot === 'close' && (AV.s.dy || 0) < -1) || (shot === 'closeo' && (AV.o.dy || 0) < -1)) f *= 1.5;
  if (f !== 1) p = l.clone().add(p.clone().sub(l).multiplyScalar(f));
  return [p, l]; }
function stepCam(dt) { camT += dt; const [p, l] = shotTarget(); const k = Math.min(1, dt * 2.6); camPos.lerp(p, k); camLook.lerp(l, k); cam.position.copy(camPos); if (shake > 0) { shake -= dt; cam.position.x += (Math.random() - .5) * shake; cam.position.y += (Math.random() - .5) * shake; } cam.lookAt(camLook); rollC += (roll - rollC) * Math.min(1, dt * 6); if (rollC) cam.rotateZ(rollC); if (Math.abs(cam.fov - fovT) > .01) { cam.fov += (fovT - cam.fov) * Math.min(1, dt * fovRate); cam.updateProjectionMatrix(); } }

/* ── 명찰 · 말풍선 위치 ── */
const tmpV = V3(0, 0, 0);
function stepTags() { for (const a of Object.values(AV)) { a.B.head.getWorldPosition(tmpV); tmpV.y += 2.6; tmpV.project(cam); const vis = tmpV.z < 1; a.np.style.display = vis ? '' : 'none';
  a.np.style.transform = `translate(${(tmpV.x * .5 + .5) * innerWidth}px,${(-tmpV.y * .5 + .5) * innerHeight}px) translate(-50%,-100%)`; a.np.classList.toggle('talk', a.talk > 0); } }

/* ── TTS: 일본어만 읽음 (한국어는 읽지 않음). 캐릭터마다 목소리·높이·빠르기 ── */
const VO = { s: { p: 1.3, r: .92, v: 0 }, o: { p: .95, r: .98, v: 1 }, m: { p: 1.08, r: .95, v: 2 }, d: { p: .7, r: .92, v: 3 }, h: { p: 1.55, r: 1.05, v: 0 }, k: { p: 1.12, r: .88, v: 1 }, t: { p: .8, r: .95, v: 3 }, r: { p: 1, r: 1, v: 2 }, f: { p: .7, r: .9, v: 3 }, n: { p: 1, r: .9, v: 0 } };
let voices = [], voiceOn = true; try { voiceOn = localStorage.getItem('jp_voice') !== '0'; } catch (e) { }
const loadV = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { } }; if ('speechSynthesis' in window) { loadV(); speechSynthesis.onvoiceschanged = loadV; } else voiceOn = false;
const jaVoices = () => { const L = voices.filter(v => v.lang && /^ja/i.test(v.lang)); return L.sort((a, b) => (/(Google|Siri|Premium|Enhanced|Neural|Natural|Nanami|Kyoko|O-ren|Haruka)/i.test(b.name) ? 1 : 0) - (/(Google|Siri|Premium|Enhanced|Neural|Natural|Nanami|Kyoko|O-ren|Haruka)/i.test(a.name) ? 1 : 0)); };
function sayJP(t, who = 's') { return new Promise(res => { if (!voiceOn || !t) return res(); try { const V = VO[who] || VO.s, L = jaVoices(); const u = new SpeechSynthesisUtterance(t.replace(/[〜・『』]/g, ' ').replace(/……/g, '…')); u.lang = 'ja-JP'; if (L.length) u.voice = L[V.v % L.length]; u.pitch = V.p; u.rate = V.r; u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 2500 + t.length * 220); } catch (e) { res(); } }); }
function speak(who, text) { try { speechSynthesis.cancel(); } catch (e) { } if (!voiceOn || who === 'n') return Promise.resolve(); const L = window.JA.japaneseOf(text); return L.reduce((p, t) => p.then(() => sayJP(t, who)), Promise.resolve()); }
/* ── 화면 UI ── */
const SPK = { 하루토: 'u', 나: 'n', 유나: 'o', 스즈: 's', 엄마: 'm', 아빠: 'd', 하나: 'h', 미야코: 'k', 선생님: 't', 반친구: 'r', 선배아빠: 'f' }, SPK_RE = /^(하루토|선배아빠|선생님|반친구|미야코|유나|스즈|엄마|아빠|하나|나)\s*(?:\[([^\]]*)\])?\s*:\s*/;
const NAMES = { n: '', o: '한유나', s: '야마시타 스즈', m: '스즈 엄마 (유미코)', d: '스즈 아빠 (다케시)', h: '하나 (스즈 동생, 7살)', k: '시라이시 미야코 선배', t: '다나카 선생님', r: '반 친구', f: '시라이시 아버님', u: '타카하시 하루토 선배' };
const COLS = { n: '#cfd8ff', o: '#ffd23f', s: '#ff9ab8', m: '#ffb070', d: '#8ac8ff', h: '#ffe27a', k: '#b8a0ff', t: '#9adfb0', r: '#7fe0ff', f: '#c8b090', u: '#8fd0a8' };
const box$ = $('#dlg'), nm = $('#dlg .nm'), tx$ = $('#dlg .tx');
let typing = null, auto = false; try { auto = localStorage.getItem('jp_auto') === '1'; } catch (e) { }
let TSPD = 2, TREM = '';
const fmt = (t, tr) => window.JA.render(String(t).replace(/\*([^*]+)\*/g, '<i>$1</i>')) + (tr ? `<div class="tr">${tr}</div>` : '');
const LOG = [];
function typeOut(html) { return new Promise(res => { clearInterval(typing); const plain = html; let n = 0; const total = plain.replace(/<[^>]+>/g, '').length; tx$.innerHTML = '';
  typing = setInterval(() => { n += TSPD; if (n >= total) { clearInterval(typing); typing = null; tx$.innerHTML = html; res(); return; } tx$.innerHTML = cutHTML(html, n); }, TSPD === 1 ? 38 : 22); tx$.onclick = () => { if (typing) { clearInterval(typing); typing = null; tx$.innerHTML = html; res(); } }; }); }
function cutHTML(h, n) { let out = '', c = 0, inTag = false; for (const ch of h) { if (ch === '<') inTag = true; if (inTag) { out += ch; if (ch === '>') inTag = false; continue; } if (c >= n) break; out += ch; c++; } return out; }
let waitTap = null;
function tapWait(ms) { return new Promise(res => { let t = null; const go = () => { clearTimeout(t); waitTap = null; res(); }; waitTap = go; if (auto && ms) t = setTimeout(function tick() { if (BOOK) t = setTimeout(tick, 500); else go(); }, ms); }); }
const BLOCK = '#hud, #radial, #quiz, #menu, #card, #log, #jpop, #notebook, .jp, button, select';
document.addEventListener('pointerup', e => { if (BOOK) { if (!(e.target.closest && e.target.closest('#nbui, #nbx'))) bookTurn(e.clientX < innerWidth / 2 ? -1 : 1); return; } if (e.target.closest && e.target.closest(BLOCK)) return; if (typing) { tx$.click(); return; } if (waitTap) waitTap(); });
document.addEventListener('keydown', e => { if (BOOK) { if (e.key === 'ArrowLeft') bookTurn(-1); else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') bookTurn(1); else if (e.key === 'Escape') closeBook(); e.preventDefault(); return; } if ((e.key === ' ' || e.key === 'Enter') && waitTap && $('#menu').hidden) { e.preventDefault(); if (typing) tx$.click(); else waitTap(); } });
/* 일본어 누르면: 뜻 · 발음 · 읽어 주기 */
document.addEventListener('click', e => { const j = e.target.closest && e.target.closest('.jp'); const pop = $('#jpop');
  if (!j) { if (!e.target.closest('#jpop')) pop.hidden = true; return; } e.stopPropagation();
  const tr = j.closest('.tx, .lg') && j.closest('.tx, .lg').querySelector('.tr'); const mean = j.dataset.m || (tr ? tr.textContent : '');
  pop.innerHTML = `<b>${j.dataset.jp}</b><i>${j.dataset.p}</i>${mean ? `<span>${mean}</span>` : ''}<button data-say>${IC('sound')} 다시 듣기</button>`; pop.hidden = false;
  const r = j.getBoundingClientRect(); pop.style.left = Math.min(innerWidth - 300, Math.max(8, r.left)) + 'px'; pop.style.top = Math.max(8, r.top - pop.offsetHeight - 10) + 'px';
  const who = j.closest('[data-who]') ? j.closest('[data-who]').dataset.who : 's'; try { speechSynthesis.cancel(); } catch (x) { } sayJP(j.dataset.jp, who === 'n' ? 's' : who);
  pop.querySelector('[data-say]').onclick = ev => { ev.stopPropagation(); try { speechSynthesis.cancel(); } catch (x) { } sayJP(j.dataset.jp, who === 'n' ? 's' : who); }; }, true);
/* 대사 기록 */
function showLog() { const w = $('#log'); w.innerHTML = `<div class="lh"><b>${IC('log')} 대사 기록</b><button class="xb" data-x>${IC('x')} 닫기</button></div><div class="lb">${LOG.length ? LOG.map(([who, h]) => `<div class="lg" data-who="${who}">${NAMES[who] ? `<em style="color:${COLS[who]}">${NAMES[who]}</em>` : ''}<div>${h}</div></div>`).join('') : '<p>아직 기록이 없어요. 스토리를 진행하면 여기에 쌓여요. 일본어를 누르면 뜻·발음이 나오고 읽어 줘요.</p>'}</div>`;
  w.hidden = false; const lb = w.querySelector('.lb'); lb.scrollTop = lb.scrollHeight; w.querySelector('[data-x]').onclick = () => { w.hidden = true; $('#jpop').hidden = true; }; }
/* 유나의 생존 수첩 */
const NOTE = { 가족호칭_내남구분_친외가: ['가족 호칭', '내 가족은 낮춤(ちち·はは·あに·あね), 남의 가족은 높임(おとうさん·おかあさん). 친가·외가 구분 없음: 삼촌·외삼촌·고모부·이모부 = おじさん, 숙모·외숙모·고모·이모 = おばさん. 막내 기준으로 통일 (엄마가 큰딸을 おねえちゃん).'], 교복_변화_다양성: ['교복', '대부분 교복을 입음. 남 가쿠란(学ラン)·여 세일러복 → 1980년대 무렵부터 재킷형(블레이저) 증가. 요즘은 학생이 교복을 직접 정하는 학교, 치마·바지 선택, 남녀 공용 교복도.'], 고교생의하루_시간표: ['고교생의 하루', '8:00~8:30 등교 (자전거 통학 많음, 넓은 자전거 주차장) → 12:10 점심 (교실 도시락·식당·급식, 매점에서 간식·학용품) → 3:40 청소 (학생이 당번 정해 직접) → 4:00 동아리 → 7:00 학원 (한 곳에서 여러 과목).'], 부카츠_교사지도_운동부특징: ['동아리 (部活)', '운동부 / 문화부(관악·서예·다도·가루타…, 없으면 새로 만들기도). 운동부: 주 3~5회 자발적, 아침 수업 전·주말에도, 프로 선수가 되기도. 안 하고 바로 집에 가면 귀가부(帰宅部). 교사에게 지도는 업무 부담이지만 평생 이어지는 관계가 되기도. 전국 대회: 운동부 인터하이(7~8월), 문화부 전국 고교 종합 문화제(7월 말~8월 초).'], 방문예절_체류시간_외투: ['방문 예절', '약속 잡기 → 선물 준비 → 외투는 밖에서 벗어 손에 걸고 초인종 → 신발 코 바깥쪽 → 선물은 쇼핑백에서 꺼내 양손으로 → 문지방·다다미 테두리·방석 밟지 않기 → 화장실은 「トイレ、かりてもいいですか」 → 너무 오래 머물지 않기 → 외투는 현관을 나온 뒤에 입기 → 돌아와서 감사 문자·전화.'], 선물_금기품목_4종: ['선물하면 안 되는 것', '병문안: 화분(根付く=寝付く, 앓아누움)·흰 꽃(죽음)·붉은 꽃(피) / 집들이: 라이터·초·재떨이·붉은 꽃(화재) / 상사: 신발·양말·슬리퍼(밟는다) / 결혼: 칼·가위(인연을 끊음)·도자기·유리(깨짐).'], 인사말_만날때_헤어질때: ['만날 때·헤어질 때 인사', '아침 おはよう(ございます)·낮 こんにちは·저녁 こんばんは. 매일 보는 친구·가족끼리는 こんにちは를 잘 안 씀, 직장에선 시간 상관없이 おはようございます. さようなら = 오래 헤어질 때. 매일 보는 친구엔 じゃあね·またね·また明日·バイバイ, 손윗사람엔 失礼します.'], 계절선물_오추겐_오세이보: ['계절 선물·답례', 'お中元(오추겐) = 7월 중순, お歳暮(오세이보) = 12월. 상사·신세 진 사람에게, 요즘은 백화점·택배로. 선물 이름: プレゼント(생일·크리스마스)·おみやげ(여행·출장)·てみやげ(방문)·おかえし(답례, 받은 것의 1/3~반).'], 연하장_인사말_앞면세로쓰기: ['연하장', '12/15~25에 넣으면 1월 1일에 배달. 1949년 복권(추첨 번호) 붙은 연하 엽서 시작, 100년 넘는 풍습. 앞면은 세로쓰기(받는 사람 우편번호·주소·이름, 보내는 사람). 인사말: あけましておめでとうございます / 昨年はたいへんお世話になりました / よい一年になりますように / 今年もどうぞよろしくおねがいします. よいおとしを는 연말 인사라 쓰면 안 됨.'], 설음식_오세치재료뜻_오조니_나나쿠사가유: ['설 음식', '오세치: 찬합, 설날 3일간, 연말에 미리 (요즘 백화점·호텔). 새우 장수, 밤조림 풍작, 긴톤 금전운, 검은콩 건강·근면, 홍백 어묵 축하, 청어알 자손 번영, 다시마 좋은 운. 오조니: 간토 네모 구운 떡+맑은 장국 / 간사이 둥근 떡+된장. 1월 7일 나나쿠사가유(7가지 봄나물 죽).'], 설장식_가도마쓰_시메카자리_가가미모치: ['설 장식', '도시가미사마를 맞이하려고: 대문 옆·현관 입구에 가도마쓰(門松), 현관에 시메카자리(무병장수, 신이 깃듦), 집 안에 둥근 거울 모양 찹쌀떡 가가미모치(鏡餅).'], 하쓰모데_대화단어_배열문장: ['하쓰모데 대화', '先生、あけましておめでとうございます。/ れんが いつも お世話に なって おります。/ れん君は いつも いっしょうけんめい 練習して いますよ。/ 次の 大会も がんばろうね。/ はい、がんばります。今年も よろしく おねがいします。 단어: ご~(존경 접두어)·~部·いつも·お世話になる·いっしょうけんめい·練習·次·大会·がんばる·今年.'], 해피먼데이_4대공휴일: ['성인의 날·해피 먼데이', '성인의 날: 원래 1/15 → 2000년부터 1월 둘째 월요일. 해피 먼데이 제도(월요일로 옮겨 3일 연휴): 성인의 날·바다의 날(7월 셋째 월)·경로의 날(9월 셋째 월)·스포츠의 날(10월 둘째 월). 2022년 4월부터 성인 18세(지자체 행사는 20세 기준 많음). 남자 정장, 여자 후리소데(비싸서 대여).'], 월별공휴일_어머니아버지의날_총정리: ['어머니의 날·아버지의 날', '일본은 어머니의 날(5월 둘째 일요일)과 아버지의 날(6월 셋째 일요일)이 따로 있다(미국·캐나다·중국도). 어린이 행사: 히나마쓰리 3/3 → 단고노셋쿠 5/5 → 시치고산 11/15.'], 연간행사_공휴일: ['연간 행사·공휴일', '1월 1일 설날·둘째 월 성인의 날 / 2월 3일경 세쓰분·11일 건국 기념일·14일 밸런타인·23일 일왕 생일 / 3월 3일 히나마쓰리·14일 화이트데이·21일경 춘분 / 4월 하나미·29일 쇼와의 날 / 5월 3일 헌법 기념일·4일 녹색의 날·5일 어린이날(단고노셋쿠)·둘째 일 어머니의 날 / 6월 셋째 일 아버지의 날 / 7월 7일 다나바타·셋째 월 바다의 날 / 8월 11일 산의 날·15일경 오봉 / 9월 음력 8/15 쓰키미·셋째 월 경로의 날·23일경 추분 / 10월 둘째 월 스포츠의 날·31일 핼러윈 / 11월 3일 문화의 날·15일 시치고산·23일 근로 감사의 날 / 12월 25일 크리스마스·31일 오미소카. 공휴일이 일요일이면 다음 날 대체 휴일, 4/29~5/5 골든위크, 해피 먼데이 제도로 월요일 3일 연휴.'], 고시엔_야구대회: ['고시엔 (甲子園)', '전국 고교 야구 선수권 대회. 100년 넘는 역사, 매년 8월, TV 생중계. 지역 예선 3,000팀 이상 → 대표 학교 출전. 한 번 지면 끝인 토너먼트, 진 팀은 구장의 흙을 담아 감.'], 성씨_통계_지역유래: ['성씨', '약 10만~30만 종. 많은 성: 사토·스즈키·다카하시·다나카·이토. 귀족·무사만 쓰다가 메이지 유신 이후 서민도. 지형·방향 조합(山下·小川·田中·前田·森), 지방 유래(가고시마 아리무라). 부부는 법률상 같은 성 → 부부 별성 요구 ↑.'] };
function note(k) { SAVE.notes = SAVE.notes || {}; const first = !SAVE.notes[k]; SAVE.notes[k] = 1; save(); const [t, d] = NOTE[k] || [k.replace(/_/g, ' '), '']; const n = document.createElement('div'); n.className = 'nb tape'; n.innerHTML = `<small>${IC('note')} 유나의 생존 수첩 ${first ? '· 새 항목' : ''}</small><b>${t}</b>${d ? `<p>${d}</p>` : ''}`; document.body.appendChild(n); setTimeout(() => n.classList.add('off'), 6500); setTimeout(() => n.remove(), 7200); }
/* ── 3D 생존 수첩: 로우폴리 공책을 화면 앞에 띄워서 한 장씩 넘겨 봄 ── */
const uiScene = new THREE.Scene(), uiCam = new THREE.PerspectiveCamera(32, 1, .1, 60);
uiScene.add(new THREE.HemisphereLight('#ffffff', '#7a7060', 1.6)); { const l = new THREE.DirectionalLight('#fff4e0', 1.5); l.position.set(-3, 5, 6); uiScene.add(l); }
{ const dim = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .55, depthWrite: false })); dim.position.z = -8; uiScene.add(dim); }
let BOOK = null;
const LM = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
const HAND = "Gaegu, 'Gowun Dodum', sans-serif";
function paperBG(g, w, h, seed) { const r = rnd(seed + 11); g.fillStyle = '#fbf6e9'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c9d7ee'; g.lineWidth = 2; for (let y = 100; y < h - 34; y += 40) { g.beginPath(); g.moveTo(8, y + r() * 2 - 1); g.lineTo(w - 8, y + r() * 2 - 1); g.stroke(); }
  g.strokeStyle = '#e98a8a'; g.beginPath(); g.moveTo(58, 0); g.lineTo(56 + r() * 4, h); g.stroke();
  g.fillStyle = 'rgba(120,90,40,.06)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 50, 0, 7); g.fill(); } }
function wrap(g, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let line = '';
  for (const word of para.split(/(\s+)/)) { if (!word) continue; const t2 = line + word; if (g.measureText(t2).width <= maxW) { line = t2; continue; }
    if (line.trim()) out.push(line.trimEnd()); line = word.trimStart();
    while (g.measureText(line).width > maxW) { let k = line.length; while (k > 1 && g.measureText(line.slice(0, k)).width > maxW) k--; out.push(line.slice(0, k)); line = line.slice(k); } }
  if (line.trim()) out.push(line.trimEnd()); } return out; }
function scribble(g, pts, r) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, x + (r() - .5) * 3, y + (r() - .5) * 3)); g.stroke(); }
function drawEntry(g, w, h, title, body, num, seed) { paperBG(g, w, h, seed); const r = rnd(seed + 3);
  g.font = `700 42px ${HAND}`; const tw = Math.min(g.measureText(title).width, w - 90);
  g.save(); g.translate(66, 64); g.rotate(-.025); g.fillStyle = 'rgba(255,212,60,.6)'; g.fillRect(-4, -4, tw + 14, 28); g.restore();
  g.fillStyle = '#23202c'; g.fillText(title, 70, 78, w - 90);
  let fs = 28, lines = []; const maxH = h - 170;
  for (; fs >= 16; fs--) { g.font = `${fs}px ${HAND}`; lines = wrap(g, body.replace(/ \/ /g, '\n'), w - 104); if (lines.length * fs * 1.42 <= maxH) break; }
  g.fillStyle = '#2b2d48'; lines.forEach((l, i) => g.fillText(l, 72, 132 + i * fs * 1.42));
  g.strokeStyle = '#23202c'; g.lineWidth = 3; scribble(g, [[w - 92, h - 70], [w - 70, h - 52], [w - 40, h - 96]], r);
  g.font = `22px ${HAND}`; g.fillStyle = '#8a8a8a'; g.fillText(`- ${num} -`, w / 2 - 22, h - 22); }
function drawIntro(g, w, h, n, N) { paperBG(g, w, h, 5); const r = rnd(9);
  g.fillStyle = '#23202c'; g.save(); g.translate(82, 140); g.rotate(-.05); g.font = `700 58px ${HAND}`; g.fillText('유나의', 0, 0); g.fillText('생존 수첩', 14, 64); g.restore();
  g.font = `30px ${HAND}`; g.fillText(`모은 항목  ${n} / ${N}`, 86, 300); g.font = `25px ${HAND}`; g.fillStyle = '#4a4a66';
  wrap(g, '일본에서 1년. 이것만 외우면 산다. 시험에도 나옴!!', w - 120).forEach((l, i) => g.fillText(l, 86, 350 + i * 34));
  g.strokeStyle = '#23202c'; g.lineWidth = 4; const cx = 250, cy = 540;   /* 대충 그린 고양이 */
  scribble(g, Array.from({ length: 19 }, (_, i) => [cx + Math.cos(i / 18 * 6.283) * 78, cy + Math.sin(i / 18 * 6.283) * 62]), r);
  scribble(g, [[cx - 66, cy - 30], [cx - 58, cy - 96], [cx - 22, cy - 58]], r); scribble(g, [[cx + 66, cy - 30], [cx + 58, cy - 96], [cx + 22, cy - 58]], r);
  g.fillStyle = '#23202c'; g.beginPath(); g.arc(cx - 26, cy - 6, 6, 0, 7); g.arc(cx + 26, cy - 6, 6, 0, 7); g.fill();
  scribble(g, [[cx - 8, cy + 14], [cx, cy + 22], [cx + 8, cy + 14]], r); [[-1, 0], [-1, 14], [1, 0], [1, 14]].forEach(([s, d]) => scribble(g, [[cx + s * 40, cy + 12 + d], [cx + s * 96, cy + 4 + d * 1.6]], r));
  g.font = `24px ${HAND}`; g.fillText('바보 고양이 (나 아님)', cx - 100, cy + 104);
  g.fillStyle = '#8a8a8a'; g.font = `21px ${HAND}`; g.fillText('← → 넘기기 · 화면 양쪽 눌러도 됨', 74, h - 26); }
function drawEmpty(g, w, h) { paperBG(g, w, h, 13); g.fillStyle = '#6a6a80'; g.font = `30px ${HAND}`; wrap(g, '아직 텅 빔. 스토리를 하다 보면 한 장씩 채워짐.', w - 120).forEach((l, i) => g.fillText(l, 80, 170 + i * 40)); }
function buildBook(pages) {
  const G = new THREE.Group(), W = 2.15, H = 3, cover = LM('#a84a38'), edge = LM('#ece4cf');
  const pm = () => new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const half = side => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.BoxGeometry(W + .12, H + .16, .07), cover); c.position.set(side * (W / 2 + .03), 0, -.1); g.add(c);
    const st = new THREE.Mesh(new THREE.BoxGeometry(W, H, .1), edge); st.position.set(side * W / 2, 0, -.02); g.add(st);
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(W - .05, H - .05), pm()); pg.position.set(side * W / 2, 0, .035); g.add(pg); g.userData.page = pg; return g; };
  const L = half(-1), Rt = half(1); L.rotation.y = .09;
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, H + .16, 5), cover); spine.position.z = -.11;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .5), new THREE.MeshLambertMaterial({ map: ctex(260, 100, (g, w, h) => { g.fillStyle = '#fbf6e9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#23202c'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#23202c'; g.font = `700 44px ${HAND}`; g.fillText('생존 수첩', 26, 66); }) }));
  label.position.set(W / 2, .6, -.14); label.rotation.y = PI; Rt.add(label);
  const flip = new THREE.Group(), fa = new THREE.Mesh(new THREE.PlaneGeometry(W - .05, H - .05), pm()), fb = new THREE.Mesh(new THREE.PlaneGeometry(W - .05, H - .05), pm());
  fa.position.x = W / 2; fb.position.x = W / 2; fb.rotation.y = PI; fb.position.z = -.002; flip.add(fa, fb); flip.position.z = .05; flip.visible = false;
  G.add(L, Rt, spine, flip); G.rotation.x = -.32;
  return { G, L, Rt, flip, fa, fb, pages, s: 0, t: 0, open: 0, closing: false, anim: null };
}
const setMap = (mesh, tx) => { mesh.material.map = tx || null; mesh.material.needsUpdate = true; };
function showSpread(B) { setMap(B.L.userData.page, B.pages[B.s * 2]); setMap(B.Rt.userData.page, B.pages[B.s * 2 + 1]); bookUI(); }
function bookUI() { const B = BOOK; if (!B) return; const n = Math.ceil(B.pages.length / 2); $('#nbui').innerHTML = `<button data-b="-1" ${B.s ? '' : 'disabled'}>${IC('left')} 앞장</button><span>${B.s + 1} / ${n}</span><button data-b="1" ${B.s < n - 1 ? '' : 'disabled'}>뒷장 ${IC('right')}</button>`;
  $('#nbui').onclick = e => { const b = e.target.closest('[data-b]'); if (b) bookTurn(+b.dataset.b); }; }
function bookTurn(d) { const B = BOOK; if (!B || B.anim || B.closing || B.open < 1) return; const n = Math.ceil(B.pages.length / 2), s2 = B.s + d; if (s2 < 0 || s2 >= n) return;
  sfx('rustle'); const P = B.pages;
  if (d > 0) { setMap(B.fa, P[B.s * 2 + 1]); setMap(B.fb, P[s2 * 2]); setMap(B.Rt.userData.page, P[s2 * 2 + 1]); B.anim = { from: 0, to: -PI, k: 0, done: () => setMap(B.L.userData.page, P[s2 * 2]) }; }
  else { setMap(B.fb, P[B.s * 2]); setMap(B.fa, P[s2 * 2 + 1]); setMap(B.L.userData.page, P[s2 * 2]); B.anim = { from: -PI, to: 0, k: 0, done: () => setMap(B.Rt.userData.page, P[s2 * 2 + 1]) }; }
  B.flip.visible = true; B.flip.rotation.y = B.anim.from; B.s = s2; bookUI(); }
function stepBook(dt) { const B = BOOK; B.t += dt;
  B.open = B.closing ? Math.max(0, B.open - dt * 2.4) : Math.min(1, B.open + dt * 1.8); const e = 1 - Math.pow(1 - B.open, 3);
  B.Rt.rotation.y = (-PI + .06) * (1 - Math.min(1, Math.max(0, B.open * 1.6 - .4))) - .09 * Math.min(1, B.open * 1.6);
  B.G.position.y = -4.5 * (1 - e) + S(B.t * 1.3) * .03; B.G.rotation.z = S(B.t * .9) * .012 - .02;
  if (B.anim) { const a = B.anim; a.k = Math.min(1, a.k + dt * 2.2); const q = a.k < .5 ? 2 * a.k * a.k : 1 - Math.pow(-2 * a.k + 2, 2) / 2; B.flip.rotation.y = a.from + (a.to - a.from) * q; if (a.k >= 1) { a.done(); B.flip.visible = false; B.anim = null; } }
  if (B.closing && B.open <= 0) { uiScene.remove(B.G); B.pages.forEach(p => p && p.dispose()); BOOK = null; document.body.classList.remove('book'); $('#nbui').hidden = $('#nbx').hidden = true; if (B.fromMenu) $('#menu').hidden = false; } }
function fitBook() { const tn = Math.tan(uiCam.fov * PI / 360), d = Math.max(2.65 / (tn * uiCam.aspect), 2.05 / tn) + .2; uiCam.position.set(0, .15, d); uiCam.lookAt(0, -.05, 0); }
async function notebook(fromMenu) { if (BOOK) return; try { await Promise.all([document.fonts.load(`700 42px Gaegu`), document.fonts.load(`28px Gaegu`)]); } catch (e) { }
  const ks = Object.keys(SAVE.notes || {}), N = Object.keys(NOTE).length; const pages = [ctex(512, 720, (g, w, h) => drawIntro(g, w, h, ks.length, N))];
  if (!ks.length) pages.push(ctex(512, 720, drawEmpty)); ks.forEach((k, i) => { const [tt, d] = NOTE[k] || [k.replace(/_/g, ' '), '']; pages.push(ctex(512, 720, (g, w, h) => drawEntry(g, w, h, tt, d, i + 1, i * 7 + 3))); });
  if (pages.length % 2) pages.push(ctex(512, 720, (g, w, h) => paperBG(g, w, h, 99)));
  pages.forEach(p => { p.anisotropy = 4; });
  BOOK = buildBook(pages); BOOK.fromMenu = !!fromMenu; uiScene.add(BOOK.G); showSpread(BOOK); uiCam.aspect = innerWidth / innerHeight; uiCam.updateProjectionMatrix(); fitBook(); sfx('rustle');
  document.body.classList.add('book'); if (fromMenu) $('#menu').hidden = true;
  $('#nbui').hidden = false; const x = $('#nbx'); x.innerHTML = `<button class="xb">${IC('x')} 닫기</button>`; x.hidden = false; x.onclick = () => closeBook(); }
function closeBook() { if (BOOK && !BOOK.closing) { BOOK.closing = true; sfx('rustle'); } }

/* 액션 메뉴 (VRChat 원형 메뉴) — 유나의 선택 */
function radial(q, opts) { return new Promise(res => { const w = $('#radial'); const n = opts.length; const ord = opts.map((_, i) => i).sort(() => Math.random() - .5);
  w.innerHTML = `<div class="rq">${IC('ask')}${fmt(q)}</div><div class="slips">${ord.map((k, j) => `<button data-k="${k}"><em>${j + 1}.</em><span>${window.JA.render(opts[k]).replace(/class="jp"/g, 'class="jpo"')}</span></button>`).join('')}</div>`;
  w.hidden = false; box$.style.visibility = 'hidden'; w.onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; w.hidden = true; box$.style.visibility = ''; res(+b.dataset.k); }; }); }

/* ── 교과서 확인 문제 (월드 안 퀴즈 보드) ── */
async function quiz(id) {
  const set = QB[id]; if (!set) return; const w = $('#quiz'); let right = 0;
  for (let i = 0; i < set.qs.length; i++) { const q = set.qs[i];
    const ord = q.o.map((_, k) => k); if (!q.keep) ord.sort(() => Math.random() - .5);
    w.innerHTML = `<div class="qb"><div class="qh"><b>${IC('pencil')} ${set.t}</b><span>${i + 1} / ${set.qs.length}</span></div><div class="qs">${set.src || ''}</div><div class="qq">${q.q}</div><div class="qo">${ord.map(k => `<button data-k="${k}">${q.o[k]}</button>`).join('')}</div><div class="qx"></div></div>`;
    w.hidden = false;
    const ok = await new Promise(res => { let tries = 0; w.onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = +b.dataset.k, x = w.querySelector('.qx');
      if (k === q.a) { b.classList.add('right'); w.querySelectorAll('[data-k]').forEach(z => z.disabled = true); x.className = 'qx ok'; x.innerHTML = `${IC('o')} 정답! ${q.e || ''}<button class="nx">다음 ${IC('right')}</button>`; react(true); x.querySelector('.nx').onclick = () => res(tries === 0); }
      else { tries++; b.classList.add('wrong'); b.disabled = true; react(false); if (tries >= 2 || q.o.length <= 2) { w.querySelectorAll('[data-k]').forEach(z => z.disabled = true); w.querySelector(`[data-k="${q.a}"]`).classList.add('right'); x.className = 'qx no'; x.innerHTML = `${IC('x')} 정답은 <b>${q.o[q.a]}</b>. ${q.e || ''}<button class="nx">다음 ${IC('right')}</button>`; x.querySelector('.nx').onclick = () => res(false); } else { x.className = 'qx no'; x.innerHTML = '아깝다! 한 번 더 골라 봐.'; } } }; });
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
/* 일본어 외우기: 카드 (뜻 → 일본어), 모르는 카드는 다시 나옴 */
async function cards(part) { const L = (window.JPWORDS || []).filter(w => !part || w[4] === part); const deck = L.slice().sort(() => Math.random() - .5); const w$ = $('#quiz'); let known = 0;
  while (deck.length) { const w = deck.shift();
    w$.innerHTML = `<div class="qb fc"><div class="qh"><b>${IC('cards')} 일본어 외우기 ${part ? part + '과' : '전체'}</b><span>남은 카드 ${deck.length + 1} · 외움 ${known}</span></div><div class="fq">${w[2]}</div><div class="ft">${IC('bulb')} ${w[3]}</div><div class="fa" hidden><b>${w[0]}</b><i>${w[1]}</i></div><div class="qo"><button data-a="show">${IC('eye')} 정답 보기 (누르면 읽어 줌)</button></div><button class="nx" data-a="x">그만하기</button></div>`; w$.hidden = false;
    const r = await new Promise(res => { w$.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'show') { w$.querySelector('.fa').hidden = false; sayJP(w[0]); w$.querySelector('.qo').innerHTML = `<button data-a="ok">${IC('check')} 외웠어</button><button data-a="no">${IC('again')} 한 번 더</button><button data-a="say">${IC('sound')} 다시 듣기</button>`; }
      else if (a === 'say') sayJP(w[0]); else res(a); }; });
    if (r === 'x') break; if (r === 'ok') known++; else deck.splice(Math.min(deck.length, 3), 0, w); }
  w$.hidden = true; toast(`${IC('cards')} 외운 카드 ${known}개`); }
function heart(dv) { SAVE.aff = Math.max(0, Math.min(100, SAVE.aff + dv)); save(); $('#aff i').style.width = SAVE.aff + '%'; $('#aff b').textContent = SAVE.aff; const f = document.createElement('div'); f.className = 'hp ' + (dv > 0 ? 'up' : 'dn'); f.innerHTML = IC(dv > 0 ? 'heart' : 'broken') + (dv > 0 ? '+' : '') + dv; document.body.appendChild(f); setTimeout(() => f.remove(), 1500); }

/* ── 스토리 진행 ── */
const CUR = { ep: 0, i: 0, night: false, rain: false };
async function runEp(ep, i0 = 0) {
  CUR.ep = ep; const E = ST[ep]; $('#menu').hidden = true; $('#hud').hidden = false; $('#eptag').textContent = E.t;
  /* 시작 위치까지의 배경·자세를 다시 계산 */
  let bg = E.lines.find(x => x.bg)?.bg || 'room';
  CUR.rain = false; for (let j = 0; j < i0; j++) { const x = E.lines[j]; if (x && x.bg) { bg = x.bg; CUR.night = !!x.night; CUR.rain = !!x.rain; } }
  setWorld(bg); let lt = '기본'; for (let j = 0; j < i0; j++) { const x = E.lines[j]; if (x && x.light) lt = x.light; } light(lt); TSPD = 2; TREM = '';
  for (let i = i0; i < E.lines.length; i++) {
    CUR.i = i; SAVE.ep = ep; SAVE.i = i; save(); $('#prog').textContent = `${Math.round(i / E.lines.length * 100)}%`;
    const L = E.lines[i]; if (STOP) return;
    if (!Array.isArray(L)) { await directive(L); continue; }
    const [who, face, mot, text, tr] = L;
    for (const k of ['o', 's']) AV[k].talk = 0;
    if (AV[who]) { if (face) setFace(AV[who], face); if (mot) motion(AV[who], mot); AV[who].talk = 2 + text.length * .05; AV[who].tv = ['', '2', '3'][Math.floor(Math.random() * 3)]; }
    box$.className = 'who-' + who; nm.textContent = NAMES[who] || ''; nm.style.color = COLS[who] || '#fff'; nm.hidden = !NAMES[who];
    if (who !== 'n' && !AV[who]) { $('#guest').hidden = false; $('#guest').innerHTML = `<i style="color:${COLS[who]}">${IC('talk')}</i> ${NAMES[who]} <small>음성 참가 중 · 아바타 로딩…</small>`; } else $('#guest').hidden = true;
    const html = fmt(text, tr); box$.dataset.who = who; tx$.classList.toggle('trem1', TREM === '약함'); tx$.classList.toggle('trem2', TREM === '강함'); TREM = '';
    LOG.push([who, html]); if (LOG.length > 300) LOG.shift();
    const sp = speak(who, text); await typeOut(html);
    const t0 = performance.now();
    await tapWait(1200 + text.length * 45); await Promise.race([sp, new Promise(r => setTimeout(r, 0))]);
  }
  SAVE.ep = ep + 1; SAVE.i = 0; save();
  if (ep + 1 < ST.length) { await card(`${E.t} 끝`, '다음 에피소드로 →'); return runEp(ep + 1, 0); }
  await card('엔딩', '처음으로 돌아가기'); menu();
}
async function directive(D) {
  if (D.bg) { CUR.night = !!D.night; CUR.rain = !!D.rain; await fade(() => setWorld(D.bg)); }
  if (D.title) await card(D.title, D.sub || '', true);
  if (D.place) { const p = $('#place'); p.className = 'tape'; p.innerHTML = IC('pin') + '<span>' + D.place.replace(/^📍\s*/, '') + '</span>'; p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); }
  if (D.shot) { if (/^틸트/.test(D.shot)) roll = .2; else if (/^줌인/.test(D.shot)) { fovT = 22; fovRate = /느림/.test(D.shot) ? .35 : 2; } else if (/^줌아웃/.test(D.shot)) { fovT = 34; fovRate = /느림/.test(D.shot) ? .35 : 2; } else { shot = D.shot; roll = 0; fovT = 34; fovRate = 2; } }
  if (D.flash) { const f = $('#flash'); f.style.background = /검|black/.test(D.flash) ? '#000' : /빨|red/.test(D.flash) ? '#ff3040' : '#fff'; f.style.animationDuration = /느림/.test(D.flash) ? '.9s' : '.35s'; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
  if (D.view) $('#view').classList.toggle('on', !/복귀|없음|끔/.test(D.view));
  if (D.noise) { $('#noise').className = /없음|끔/.test(D.noise) ? '' : /강/.test(D.noise) ? 's2' : 's1'; if (/강/.test(D.noise)) sfx('ring'); }
  if (D.pos) for (const [k, v] of Object.entries(D.pos)) place(k, v);
  if (D.walk) for (const [k, v] of Object.entries(D.walk)) walk(k, v[0], v[1], v[2]);
  if (D.prop) for (const [k, n, on] of D.prop) prop(k, n, on !== false);
  if (D.fx !== undefined) fx(D.fx);
  if (D.shake) shake = D.shake;
  if (D.mot) for (const [k, m] of Object.entries(D.mot)) motion(AV[k], m);
  if (D.face) for (const [k, f] of Object.entries(D.face)) setFace(AV[k], f);
  if (D.sfx) sfx(D.sfx);
  if (D.wait) await new Promise(r => setTimeout(r, D.wait));
  if (D.light) light(D.light);
  if (D.tspeed) TSPD = { 느림: 1, 보통: 2, 빠름: 4 }[D.tspeed] || 2;
  if (D.tremble) TREM = D.tremble;
  if (D.note) note(D.note);
  if (D.breath) { tx$.innerHTML = ''; nm.hidden = true; await new Promise(r => setTimeout(r, D.breath)); }
  const sayS = async (face, mot, line, extra) => { let who = 's'; const sp = line.match(SPK_RE); if (sp) { who = SPK[sp[1]]; line = line.slice(sp[0].length); if (sp[2]) { const [f, m] = sp[2].split('/'); if (f) face = f; if (m) mot = m; } }
    for (const k of ['o', 's']) AV[k].talk = 0; if (AV[who]) { setFace(AV[who], face); motion(AV[who], mot); AV[who].talk = 2 + line.length * .05; }
    box$.className = 'who-' + who; nm.hidden = !NAMES[who]; nm.textContent = NAMES[who] || ''; nm.style.color = COLS[who] || '#fff'; box$.dataset.who = who; const h = fmt(line) + (extra ? window.JA.render(extra) : ''); LOG.push([who, h]); speak(who, line); await typeOut(h); await tapWait(0); };
  /* 시험 선택지: 정답이면 호감도 크게, 틀려도 스즈가 다정하게 알려 주고 그대로 진행 (복습 목록에 저장) */
  if (D.ask) { const [q, opts, ans, why, okLine, noLine] = D.ask; box$.className = 'who-n'; nm.hidden = true; tx$.innerHTML = IC('ask') + ' ' + fmt(q); const k = await radial(q, opts);
    const tag = 'ask:' + CUR.ep + ':' + CUR.i;
    if (k === ans) { heart(+3); sfx('ok'); delete SAVE.miss[tag]; save(); await sayS('happy', 'nod', okLine || '정답!', `<span class="why">${IC('book')} ${why}</span>`); }
    else { heart(+1); sfx('pop'); SAVE.miss[tag] = [q, opts[ans], why]; save(); await sayS('smile', 'tilt', (noLine || '음, 그건 이렇게 하는 거야.'), `<span class="why">${IC('sprout')} 정답은 <b>${opts[ans]}</b><br>${IC('book')} ${why}</span>`); }
    motion(AV.s, 'idle'); }
  /* 관계 선택지: 어느 쪽을 골라도 좋은 장면 + 배울 거리 */
  if (D.pick) { const [q, opts, learn] = D.pick; box$.className = 'who-n'; nm.hidden = true; tx$.innerHTML = IC('heart') + ' ' + fmt(q); const k = await radial(q, opts.map(o => o[0]));
    const [, face, mot, line, by] = opts[k]; heart(+2); sfx('ok'); if (by) motion(AV.o, by); await sayS(face, mot, line, learn ? `<span class="why">${IC('book')} ${learn}</span>` : ''); motion(AV.s, 'idle'); }
  if (D.quiz) await quiz(D.quiz);
}
function fade(fn) { return new Promise(res => { const f = $('#fade'); f.classList.add('on'); setTimeout(() => { fn(); f.classList.remove('on'); setTimeout(res, 500); }, 500); }); }
function card(t, s, auto2) { return new Promise(res => { const c = $('#card'); c.innerHTML = `<h2>${t}</h2><p>${s}</p>${auto2 ? '' : `<button>계속 ${IC('right')}</button>`}`; c.hidden = false; 
  const go = () => { c.hidden = true; res(); }; if (auto2) setTimeout(go, 2600); else c.querySelector('button').onclick = go; c.onclick = e => { if (auto2) go(); }; }); }
/* 효과음 (합성) */
const SFX_ALIAS = { broom_clean: 'rustle', paper_rustle: 'rustle', tv_soft_snow: 'rain_soft', shrine_bell_crowd: 'crowd', room_chatter: 'crowd', school_chime_crowd: 'crowd', airport_announce: 'crowd', cane_drop: 'clatter', footsteps_run: 'steps', heartbeat_fast: 'heart', knee_drop: 'thud', door_slam: 'thud', station_crowd: 'crowd', ceramic_clatter: 'clatter', cane_clatter: 'clatter', cloth_rustle: 'rustle', rain_loop: 'rain', rain_heavy: 'rain', rain_heavy_muffled: 'rain_soft', rain_soft: 'rain_soft', slip: 'slip', crash_rain: 'crash', rain_crash_flashback: 'crash', thunder_distant: 'thunder', summer_cicada_night: 'cicada', crowd_cheer: 'cheer', taiko_bon: 'taiko', fireworks_big: 'boom', door_open: 'door', door_slide: 'door', cane_tap: 'tap', footsteps_fast: 'tap', brush_hair: 'tap', bike_bell: 'bell', birds_morning: 'chime', cicada_spring_wind: 'chime', night_crickets: 'chime', evening_chime: 'bell', wind_sakura: 'chime' };
/* 잡음 계열 효과음: [필터, 주파수, 길이(초), 크기, 올라오는 시간] */
const NZ = { rain: ['bandpass', 1800, 2.6, .14, .3], rain_soft: ['lowpass', 900, 2.6, .08, .4], crowd: ['bandpass', 700, 2.2, .1, .3], cheer: ['bandpass', 1200, 2.8, .22, .08], rustle: ['highpass', 3000, .6, .07, .05], slip: ['bandpass', 2600, .28, .18, .01], clatter: ['highpass', 2500, .4, .16, .005], crash: ['lowpass', 700, .9, .35, .005], thunder: ['lowpass', 220, 3.2, .4, .5], cicada: ['bandpass', 5200, 2.4, .05, .3], boom: ['lowpass', 420, 1.6, .3, .01], thud: ['lowpass', 300, .5, .3, .005] };
function noiseSfx(k) { const [ft, fq, d, v, at] = NZ[k], t = AC.currentTime, len = Math.ceil(AC.sampleRate * d), b = AC.createBuffer(1, len, AC.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = ft; f.frequency.value = fq; f.Q.value = k === 'cicada' ? 8 : .7; s.connect(f); f.connect(g); g.connect(AC.destination);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.start(t); s.stop(t + d);
  if (k === 'crash' || k === 'boom' || k === 'thud') thump(k === 'boom' ? 55 : 80, 0); if (k === 'clatter') tone(1800, .25, 'triangle'); }
function thump(f, dl) { const t = AC.currentTime + dl, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + .15); o.connect(g); g.connect(AC.destination); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.0001, t + .7); o.start(t); o.stop(t + .8); }
function tone(f, d, type = 'sine', v = .06) { const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; o.connect(g); g.connect(AC.destination); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .05); }
let AC = null; function sfx(k) { k = SFX_ALIAS[k] || k; try { AC = AC || new AudioContext(); if (NZ[k]) return noiseSfx(k); if (k === 'taiko') { [0, .45, .9].forEach(d => thump(70, d)); return; } if (k === 'heart') { [0, .16, .55, .71, 1.1, 1.26, 1.65, 1.81].forEach(d => thump(50, d)); return; } if (k === 'steps') { [0, .18, .36, .54, .72, .9].forEach(d => setTimeout(() => noiseSfx('rustle'), d * 1000)); return; } if (k === 'ring') return tone(5800, 2.6, 'sine', .02); const o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination); const t = AC.currentTime;
  const S2 = { tap: [[1200, 0], [900, .04]], chime: [[2093, 0], [2637, .12]], ok: [[660, 0], [990, .08]], ng: [[220, 0], [160, .12]], bell: [[1320, 0], [1320, .4]], gong: [[110, 0], [100, 1.2]], door: [[520, 0], [780, .1]], pop: [[400, 0], [900, .05]], clap: [[900, 0], [300, .03]] }[k] || [[440, 0]];
  o.type = k === 'gong' ? 'sine' : k === 'bell' ? 'triangle' : 'square'; S2.forEach(([f, d]) => o.frequency.setValueAtTime(f, t + d)); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + (k === 'gong' ? 2.5 : k === 'bell' ? 1 : .3)); o.start(t); o.stop(t + 2.6); } catch (e) { } }

/* ── 메뉴 ── */
let STOP = false;
function menu() { STOP = true; try { speechSynthesis.cancel(); } catch (e) { } $('#hud').hidden = true; $('#quiz').hidden = true; $('#radial').hidden = true; box$.style.visibility = ''; const m = $('#menu'); m.hidden = false; tx$.innerHTML = ''; nm.hidden = true; hideWords();
  CUR.ep = 0; setWorld('street'); fx('sakura'); shot = 'wide'; place('s', [2.5, 0, 0, -.4]); place('o', [-2.5, 0, 0, .4]); setFace(AV.s, 'happy'); setFace(AV.o, 'smile'); motion(AV.o, 'wave');
  m.innerHTML = `<div class="mc"><h1>스즈 소리, 유나 목소리<small>鈴の音、ユナの声 — 일본 문화 4·5·6과 스토리</small></h1>
  <p class="lead">한국에서 온 교환학생 <b class="yu">한유나</b>(나)와 앞을 보지 못하는 일본 소녀 <b class="su">야마시타 스즈</b>의 1년. 내가 고르는 선택지가 곧 시험 문제!</p>
  <div class="aff">${IC('heart')} 스즈 호감도 <b>${SAVE.aff}</b></div>
  <button class="pri big" data-go="cont">${IC('play')}${SAVE.ep || SAVE.i ? '이어서 — ' + (ST[Math.min(SAVE.ep, ST.length - 1)] || ST[0]).t : '처음부터 시작'}</button>
  <div class="eps">${ST.map((e, i) => `<button data-ep="${i}"><b>${e.t}</b><small>${e.d || ''}</small></button>`).join('')}</div>
  <h3>${IC('cards')} 일본어 외우기 <small>뜻 보고 떠올리기 → 소리로 확인</small></h3><div class="eps qz"><button data-cd="4"><b>4과 표현</b><small>인사·방문·선물·가족</small></button><button data-cd="5"><b>5과 표현</b><small>학교·호칭</small></button><button data-cd="6"><b>6과 표현</b><small>연중행사·축하</small></button><button data-cd="0"><b>전체 섞기</b><small>${(window.JPWORDS || []).length}개</small></button></div>
  ${Object.keys(SAVE.miss).length ? `<h3>${IC('sprout')} 스토리에서 놓친 문제 ${Object.keys(SAVE.miss).length}개</h3><div class="eps"><button data-mi="1"><b>다시 보기</b><small>틀렸던 선택지만 모아서</small></button></div>` : ''}
  <h3>${IC('pencil')} 교과서 문제만 풀기</h3><div class="eps qz">${Object.entries(QB).filter(([k]) => k[0] !== '_').map(([k, v]) => `<button data-q="${k}"><b>${v.t}</b><small>${SAVE.done[k] ? '최근 ' + SAVE.done[k] : v.qs.length + '문제'}</small></button>`).join('')}</div>
  <div class="opt"><button data-o="log">${IC('log')} 대사 기록</button><button data-o="note">${IC('note')} 생존 수첩</button></div><div class="opt"><button data-o="voice">${voiceOn ? IC('sound') + ' 일본어 음성 켜짐' : IC('mute') + ' 일본어 음성 꺼짐'}</button><button data-o="auto">${auto ? IC('auto') + ' 자동 넘김' : IC('tap') + ' 눌러서 넘김'}</button><button data-o="home">${IC('home')} 홈</button></div>
  <p class="cr">3D 모델: Kilerbomb “Poka” Blind Girl · Blondy (무료 라이선스, 비영리 사용)</p></div>`;
  m.onclick = async e => { const b = e.target.closest('button'); if (!b) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (b.dataset.go) { STOP = false; return runEp(Math.min(SAVE.ep, ST.length - 1), SAVE.ep < ST.length ? SAVE.i : 0); }
    if (b.dataset.ep) { STOP = false; return runEp(+b.dataset.ep, 0); }
    if (b.dataset.q) { m.hidden = true; await quiz(b.dataset.q); return menu(); }
    if (b.dataset.cd) { m.hidden = true; await cards(+b.dataset.cd); return menu(); }
    if (b.dataset.mi) { m.hidden = true; QB._miss = { t: '스토리에서 놓친 문제', qs: Object.values(SAVE.miss).map(([q, a, e]) => { const wrongs = Object.values(SAVE.miss).map(x => x[1]).filter(x => x !== a).sort(() => Math.random() - .5).slice(0, 2); return { q, o: [a, ...wrongs], a: 0, e }; }) }; await quiz('_miss'); delete QB._miss; return menu(); }
    if (b.dataset.o === 'voice') { voiceOn = !voiceOn; try { localStorage.setItem('jp_voice', voiceOn ? '1' : '0'); } catch (e) { } if (voiceOn) sayJP('はじめまして。すずです。', 's'); return menu(); }
    if (b.dataset.o === 'auto') { auto = !auto; try { localStorage.setItem('jp_auto', auto ? '1' : '0'); } catch (e) { } return menu(); }
    if (b.dataset.o === 'log') return showLog();
    if (b.dataset.o === 'note') return notebook(true);
    if (b.dataset.o === 'home') location.href = 'index.html'; };
}
$('#bm').innerHTML = IC('menu'); $('#blog').innerHTML = IC('log'); $('#bnote').innerHTML = IC('note'); $('#bshot').innerHTML = IC('cam'); $('#aff').insertAdjacentHTML('afterbegin', IC('heart'));
$('#bm').onclick = () => menu();
const autoLabel = () => { $('#bauto').innerHTML = auto ? IC('auto') + '자동' : IC('tap') + '수동'; };
$('#bauto').onclick = () => { auto = !auto; autoLabel(); try { localStorage.setItem('jp_auto', auto ? '1' : '0'); } catch (e) { } };
autoLabel();
$('#blog').onclick = () => showLog(); $('#bnote').onclick = () => notebook();
$('#bshot').onclick = () => { const L = ['two', 'suzu', 'onna', 'close', 'wide']; shot = L[(L.indexOf(shot) + 1) % L.length]; };
$('#aff i').style.width = SAVE.aff + '%'; $('#aff b').textContent = SAVE.aff;

/* ── 루프 ── */
const clock = new THREE.Clock(); let T = 0;
function loop() { const dt = Math.min(.05, clock.getDelta()); T += dt; for (const a of Object.values(AV)) stepAvatar(a, dt, T); stepFX(dt); stepCam(dt); R.render(scene, cam); if (BOOK) { stepBook(dt); R.autoClear = false; R.clearDepth(); R.render(uiScene, uiCam); R.autoClear = true; } stepTags(); requestAnimationFrame(loop); }
(async () => {
  $('#boot').textContent = '불러오는 중…';
  await Promise.all([loadAvatar('s'), loadAvatar('o')]); setFace(AV.s, 'n'); setFace(AV.o, 'n');
  $('#boot').remove(); loop(); menu();
  window.__JP = { AV, motion, setFace, setEmote, EMO_POS, setWorld, shot: s => shot = s, runEp, quiz, fx, book: () => BOOK };
})().catch(e => { $('#boot').textContent = '불러오기 실패: ' + e.message; console.error(e); });
