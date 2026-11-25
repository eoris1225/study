/* 햄토리: 보조 친구 3D (Mixamo 리그 → 뼈를 직접 움직여 감정 표현) */
import * as THREE from 'three';
import { FBXLoader } from '../vendor/jsm/loaders/FBXLoader.js';

const cv = document.getElementById('ham');
const R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace;
const S = new THREE.Scene();
S.add(new THREE.HemisphereLight('#ffffff', '#6a6a88', 2.4));
const sun = new THREE.DirectionalLight('#fff4e0', 1.6); sun.position.set(6, 14, 18); S.add(sun);
const cam = new THREE.PerspectiveCamera(30, 1, 1, 300); cam.position.set(0, 7.6, 44); cam.lookAt(0, 6.6, 0);
const root = new THREE.Group(); S.add(root);
const shadow = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .22 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .05; S.add(shadow);

let skin = null, B = {}, rest = {}, ready = false, mood = 'idle', moodUntil = 0, talkUntil = 0, cur = {}, t = 0;
const NAMES = { L: 'mixamorigLeftArm', R: 'mixamorigRightArm', LF: 'mixamorigLeftForeArm', RF: 'mixamorigRightForeArm', H: 'mixamorigHead', N: 'mixamorigNeck', S: 'mixamorigSpine1', LL: 'mixamorigLeftUpLeg', RL: 'mixamorigRightUpLeg' };

(async () => {
  const mgr = new THREE.LoadingManager(); mgr.setURLModifier(u => /\.(png|jpe?g|tga)$/i.test(u) ? 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' : u);
  const o = await new FBXLoader(mgr).loadAsync('models/ham/Ham.fbx?v=1');
  const tex = new THREE.TextureLoader().load('models/ham/ham.jpg?v=1'); tex.colorSpace = THREE.SRGBColorSpace;
  o.traverse(n => { if (n.isBone) B[n.name] = n; if (n.isMesh) { n.frustumCulled = false;
    const ms = [].concat(n.material).map(m => m.name.includes('Eye') ? Object.assign(new THREE.MeshPhongMaterial({ color: '#08080c', specular: '#8a8a8a', shininess: 80 }), { userData: { eye: 1 } }) : m.name.includes('Hige') ? new THREE.MeshBasicMaterial({ color: '#3a3a40' }) : new THREE.MeshToonMaterial({ map: tex }));
    n.material = ms.length === 1 ? ms[0] : ms; if (n.isSkinnedMesh) skin = n; } });
  root.add(o); o.updateMatrixWorld(true);
  /* 눈: 원본(Unity)처럼 반짝이는 검은 눈 + 하이라이트 */
  if (skin) { const g = skin.geometry, pos = g.attributes.position, idx = g.index, eyeMat = [].concat(skin.material).findIndex(m => m.userData.eye);
    const grp = g.groups.find(x => x.materialIndex === eyeMat); const head = B.mixamorigHead;
    if (grp && head) { const v = new THREE.Vector3(), boxes = [new THREE.Box3(), new THREE.Box3()];
      for (let i = grp.start; i < grp.start + grp.count; i++) { const k = idx ? idx.getX(i) : i; skin.getVertexPosition(k, v); skin.localToWorld(v); boxes[v.x < 0 ? 0 : 1].expandByPoint(v); }
      for (const bx of boxes) { if (bx.isEmpty()) continue; const sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3());
        for (const [dx, dy, r] of [[.18, .2, .2], [-.16, -.18, .09]]) { const hl = new THREE.Mesh(new THREE.SphereGeometry(Math.max(sz.x, sz.y) * r, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
          const w = new THREE.Vector3(c.x + sz.x * dx * (c.x < 0 ? -1 : 1) * -1, c.y + sz.y * dy, bx.max.z); head.worldToLocal(w); hl.position.copy(w); head.add(hl); } } } }
  const rq = o.getWorldQuaternion(new THREE.Quaternion()).invert();
  for (const [n, b] of Object.entries(B)) rest[n] = { l: b.quaternion.clone(), w: rq.clone().multiply(b.getWorldQuaternion(new THREE.Quaternion())) };
  ready = true; cv.classList.add('on');
})();

/* 월드 기준 오일러 회전량 [x,y,z]. L은 화면 오른쪽 팔(캐릭터의 왼팔). */
const POSE = {
  idle: () => ({ L: [0, -.55, -.75], R: [0, .55, .75], H: [.04 + Math.sin(t * 1.3) * .03, Math.sin(t * .6) * .12, Math.sin(t * .9) * .05] }),
  talk: () => ({ L: [0, -.6, -.6 + Math.sin(t * 6) * .12], R: [0, .6, .6 - Math.sin(t * 6 + 1) * .12], H: [.04 + Math.sin(t * 9) * .07, Math.sin(t * 1.1) * .15, 0] }),
  explain: () => ({ L: [0, -.25, .2 + Math.sin(t * 3) * .08], R: [0, .55, .8], H: [0, .35 + Math.sin(t * 2) * .05, -.08], S: [0, .12, 0] }),
  joy: () => ({ L: [0, -.3, .85 + Math.sin(t * 14) * .25], R: [0, .3, -.85 - Math.sin(t * 14) * .25], H: [-.12, 0, Math.sin(t * 7) * .12] }),
  surprise: () => ({ L: [0, -.2, 1.0], R: [0, .2, -1.0], H: [-.28, 0, 0], S: [-.12, 0, 0] }),
  sad: () => ({ L: [0, -.15, -1.15], R: [0, .15, 1.15], H: [.5, 0, .08], S: [.22, 0, 0] }),
  angry: () => ({ L: [0, -.9, -.5], R: [0, .9, .5], H: [.15, Math.sin(t * 16) * .12, 0], S: [.1, 0, 0] }),
  sleepy: () => ({ L: [0, -.5, -1.0], R: [0, .5, 1.0], H: [.32, 0, .35 + Math.sin(t * .8) * .05] }),
  think: () => ({ L: [0, -.55, -.75], R: [-.2, 1.2, -.2], H: [.1, -.2, .2] }),
};
const ALIAS = { 기본: 'idle', 기쁨: 'joy', 놀람: 'surprise', 슬픔: 'sad', 설명: 'explain', 화남: 'angry', 졸림: 'sleepy', 고민: 'think' };

const qW = new THREE.Quaternion(), qT = new THREE.Quaternion(), eu = new THREE.Euler();
function apply(P) {
  for (const [n, r] of Object.entries(rest)) B[n].quaternion.copy(r.l);
  for (const [k, e] of Object.entries(P)) { const n = NAMES[k], b = B[n], r = rest[n]; if (!b) continue; eu.set(e[0], e[1], e[2], 'YXZ'); qW.setFromEuler(eu); qT.copy(r.w).invert().multiply(qW).multiply(r.w); b.quaternion.copy(r.l).multiply(qT); }
}
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
  if (!ready || cv.hidden) return;
  const m = now < moodUntil ? mood : (now < talkUntil ? 'talk' : 'idle');
  const P = (POSE[m] || POSE.idle)(); if (now < talkUntil && m !== 'talk') P.H = [(P.H ? P.H[0] : 0) + Math.sin(t * 10) * .05, P.H ? P.H[1] : 0, P.H ? P.H[2] : 0];
  const k = 1 - Math.exp(-dt * 9);
  for (const key of Object.keys(NAMES)) { const tg = P[key] || [0, 0, 0]; const c = cur[key] || (cur[key] = [0, 0, 0]); for (let i = 0; i < 3; i++) c[i] += (tg[i] - c[i]) * k; }
  apply(cur);
  /* 몸 전체 움직임 */
  let y = Math.abs(Math.sin(t * 2.6)) * .12, ry = .32 + Math.sin(t * .5) * .08, rz = 0, x = 0;
  if (m === 'joy') { y = Math.abs(Math.sin(t * 7)) * 2.6; ry = .32 + Math.sin(t * 3.5) * .5; }
  if (m === 'surprise') { y = Math.max(0, Math.sin(Math.min(Math.PI, (moodUntil - now) / 160))) * 1.2; }
  if (m === 'sad') { y = 0; rz = .06; }
  if (m === 'angry') { x = Math.sin(t * 30) * .25; }
  if (m === 'sleepy') { rz = .1 + Math.sin(t * .8) * .04; y = 0; }
  if (m === 'talk' || m === 'explain') y = Math.abs(Math.sin(t * 5)) * .35;
  root.position.set(x, y, 0); root.rotation.set(0, ry, rz); shadow.scale.setScalar(1 - y * .08);
  R.render(S, cam);
}
requestAnimationFrame(loop);

export function size() { const r = cv.getBoundingClientRect(); if (!r.width) return; R.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); }
addEventListener('resize', size);
/* 감정: 이름(한글/영문) · 지속(ms, 0이면 계속) */
export function feel(m, ms = 1600) { m = ALIAS[m] || m || 'idle'; mood = m; moodUntil = performance.now() + (ms || 1e9); }
export function talk(ms = 1400) { talkUntil = performance.now() + ms; }
export function calm() { mood = 'idle'; moodUntil = 0; }
