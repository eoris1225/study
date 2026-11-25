/* 3D 무대 병맛 소품: 장면마다 배경색·책상이 바뀌고, 대충 그린 종이 인형 햄스터(나무젓가락에 꽂힘)가
   그 장면에 맞는 짓을 뚝뚝 끊기는 동작(초당 5컷)으로 함. 효과 떡칠 없이 "사람이 일부러 못 그린" 느낌. */
import * as THREE from 'three';

/* 삐뚤빼뚤 손그림 */
function paper(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.lineCap = x.lineJoin = 'round'; draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const J = (a = 3) => (Math.random() - .5) * a;
function wob(x, pts, close) { x.beginPath(); pts.forEach(([px, py], i) => { const a = px + J(), b = py + J(); i ? x.lineTo(a, b) : x.moveTo(a, b); }); if (close) x.closePath(); }
function blob(x, cx, cy, rx, ry, n = 14) { const P = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; P.push([cx + Math.cos(a) * rx * (1 + J(.12)), cy + Math.sin(a) * ry * (1 + J(.12))]); } wob(x, P, true); }
function ham(x, w, h, o = {}) { x.lineWidth = 7; x.strokeStyle = '#2a2026';
  blob(x, w * .5, h * .58, w * .36, h * .3); x.fillStyle = '#f3e3cc'; x.fill(); x.stroke();                     // 몸 (감자)
  for (const s of [-1, 1]) { blob(x, w * (.5 + s * .22), h * .3, w * .08, h * .07, 9); x.fillStyle = '#f0b8b0'; x.fill(); x.stroke(); }   // 귀
  x.fillStyle = '#111'; for (const s of [-1, 1]) { x.beginPath(); x.arc(w * (.5 + s * .11) + J(4), h * .5 + J(4), o.x ? 0 : 7, 0, 7); x.fill(); }
  if (o.x) { x.lineWidth = 5; for (const s of [-1, 1]) { const cx = w * (.5 + s * .11), cy = h * .5; wob(x, [[cx - 9, cy - 9], [cx + 9, cy + 9]]); x.stroke(); wob(x, [[cx + 9, cy - 9], [cx - 9, cy + 9]]); x.stroke(); } }
  x.fillStyle = '#ff7a9a'; x.beginPath(); x.arc(w * .5, h * .57, 5, 0, 7); x.fill();                             // 코
  x.lineWidth = 4; wob(x, [[w * .44, h * .63], [w * .5, h * .66], [w * .56, h * .63]]); x.stroke();          // 입
  x.lineWidth = 6; for (const s of [-1, 1]) { wob(x, [[w * (.5 + s * .14), h * .86], [w * (.5 + s * .16), h * .95]]); x.stroke(); } // 다리 두 개 (대충)
  for (const s of [-1, 1]) { wob(x, [[w * (.5 + s * .3), h * .58], [w * (.5 + s * .42), h * (o.up ? .38 : .66)]]); x.stroke(); }   // 팔
  if (o.txt) { x.font = '700 40px Jua, sans-serif'; x.fillStyle = '#2a2026'; x.fillText(o.txt, w * .06 + J(6), h * .14); } }
const PROP = {
  ice: (x, w, h) => { x.lineWidth = 6; x.strokeStyle = '#2a4a8a'; wob(x, [[20, 30], [w - 20, 22], [w - 25, h - 20], [25, h - 28]], true); x.fillStyle = '#bfe6ff'; x.fill(); x.stroke(); x.font = '700 38px Jua'; x.fillStyle = '#2a4a8a'; x.fillText('얼음', 40, h / 2 + 12); },
  wheel: (x, w, h) => { x.lineWidth = 8; x.strokeStyle = '#555'; blob(x, w / 2, h / 2, w * .44, h * .44, 18); x.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; wob(x, [[w / 2, h / 2], [w / 2 + Math.cos(a) * w * .42, h / 2 + Math.sin(a) * h * .42]]); x.stroke(); } },
  seed: (x, w, h) => { x.lineWidth = 6; x.strokeStyle = '#2a2026'; wob(x, [[w / 2, 10], [w - 25, h / 2], [w / 2, h - 10], [25, h / 2]], true); x.fillStyle = '#3a3a3a'; x.fill(); x.stroke(); x.strokeStyle = '#eee'; x.lineWidth = 4; wob(x, [[w / 2, 22], [w / 2, h - 22]]); x.stroke(); },
  towel: (x, w, h) => { x.lineWidth = 6; x.strokeStyle = '#a03050'; wob(x, [[10, 20], [w - 10, 14], [w - 16, h - 10], [16, h - 16]], true); x.fillStyle = '#ffb0c8'; x.fill(); x.stroke(); },
  cape: (x, w, h) => { x.lineWidth = 6; x.strokeStyle = '#601020'; wob(x, [[w * .3, 10], [w * .7, 10], [w - 10, h - 10], [10, h - 14]], true); x.fillStyle = '#e83a4a'; x.fill(); x.stroke(); x.font = '700 44px Jua'; x.fillStyle = '#ffe27a'; x.fillText('촉', w * .38, h * .62); },
  hammer: (x, w, h) => { x.lineWidth = 7; x.strokeStyle = '#2a2026'; wob(x, [[w / 2, 40], [w / 2, h - 10]]); x.stroke(); wob(x, [[w * .2, 14], [w * .8, 14], [w * .8, 50], [w * .2, 50]], true); x.fillStyle = '#888'; x.fill(); x.stroke(); },
  sign: (x, w, h, t) => { x.lineWidth = 6; x.strokeStyle = '#2a2026'; wob(x, [[8, 8], [w - 8, 12], [w - 12, h - 8], [10, h - 12]], true); x.fillStyle = '#fff6c8'; x.fill(); x.stroke(); x.font = '700 40px Jua'; x.fillStyle = '#2a2026'; x.textAlign = 'center'; x.fillText(t, w / 2, h / 2 + 14); },
  zzz: (x) => { x.font = '700 60px Jua'; x.fillStyle = '#cfd6ff'; x.fillText('Z', 10, 70); x.font = '700 42px Jua'; x.fillText('z', 60, 40); x.fillText('z', 90, 18); },
  sweat: (x) => { x.fillStyle = '#7ad8ff'; x.strokeStyle = '#2a4a8a'; x.lineWidth = 4; wob(x, [[30, 10], [50, 50], [30, 62], [12, 50]], true); x.fill(); x.stroke(); },
};
const card = (tex, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: .05 })); return m; };
const pt = (name, w = 1, h = 1, arg) => card(paper(256, 256 * h / w, (x, W, H) => PROP[name](x, W, H, arg)), w, h);

/* 장면별 배경색 · 소품 · 햄 개그 */
const LOOK = {
  exoendo: ['#16243a', 'shiver', 'ice'], calor: ['#1a2a2e', 'bath', 'towel'], bond: ['#2a1a2e', 'pull'], bondH2O: ['#2a1f1a', 'juggle'], hess: ['#1a2a1e', 'climb', 'sign:계단'], hf: ['#26221a', 'point', 'sign:= 0'],
  entropy: ['#2a1a1a', 'mess'], nh3: ['#1a1e2e', 'clap'], mix: ['#1e1a2a', 'peek'], system: ['#1a262a', 'hug', 'sign:계'], spont: ['#24201a', 'flex'], mgHCl: ['#1a2420', 'cough', 'sweat'],
  rate: ['#1e1a2a', 'run', 'wheel'], avgrate: ['#1e1a2a', 'run', 'wheel'], ratelaw: ['#201a26', 'count', 'sign:2배?'], halflife: ['#1a221a', 'eat', 'seed'], collision: ['#2a1a20', 'bonk'], ea: ['#22201a', 'push', 'seed'],
  conc: ['#1a1e26', 'squeeze'], pressure: ['#26201a', 'squish'], surface: ['#201e1a', 'hammer', 'hammer'], maxwell: ['#1a1a26', 'sleep', 'zzz'], catalyst: ['#2a1a1a', 'fly', 'cape'], maxwellcat: ['#2a1a1a', 'fly', 'cape'],
  converter: ['#1e1e1e', 'cough', 'sweat'], catalystDist: ['#2a1a1a', 'fly', 'cape'],
};
const st = (t, f = 5) => Math.floor(t * f) / f;      // 뚝뚝 끊기는 시간

export function dress(key, root, scene) {
  const L = LOOK[key] || ['#14182a', ['sleep', 'peek', 'clap', 'flex'][Math.floor(Math.random() * 4)], null];
  scene.background = new THREE.Color(L[0]);
  /* 책상 (나무) + 연필·지우개 대충 */
  const desk = new THREE.Mesh(new THREE.BoxGeometry(30, .4, 12), new THREE.MeshStandardMaterial({ color: '#6a4a32', roughness: .9 })); desk.position.set(0, -3.9, -1); root.add(desk);
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 3.4, 6), new THREE.MeshStandardMaterial({ color: '#ffd23f' })); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = .5; pencil.position.set(-5.5, -3.55, 2.2); root.add(pencil);
  const eraser = new THREE.Mesh(new THREE.BoxGeometry(.9, .4, .5), new THREE.MeshStandardMaterial({ color: '#ff9ab0' })); eraser.position.set(5.6, -3.5, 2.4); eraser.rotation.y = .3; root.add(eraser);
  /* 종이 햄 (나무젓가락에 꽂은 인형) */
  const G = new THREE.Group(); G.position.set(4.3, -2.2, 2.6); root.add(G);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.5, .05), new THREE.MeshStandardMaterial({ color: '#d8b07a' })); stick.position.y = -.85; G.add(stick);
  const faces = { n: paper(256, 256, (x, w, h) => ham(x, w, h)), x: paper(256, 256, (x, w, h) => ham(x, w, h, { x: 1 })), up: paper(256, 256, (x, w, h) => ham(x, w, h, { up: 1 })) };
  const H = card(faces.n, 1.6, 1.6); H.position.y = .45; G.add(H);
  const setF = k => { if (H.material.map !== faces[k]) { H.material.map = faces[k]; H.material.needsUpdate = true; } };
  let P = null; if (L[2]) { const [n, arg] = L[2].split(':'); P = n === 'sign' ? pt('sign', 1.3, .7, arg) : n === 'wheel' ? pt('wheel', 2, 2) : pt(n, n === 'zzz' ? .8 : .9, n === 'zzz' ? .8 : .9); root.add(P); }
  const g = L[1];
  let off = [0, 0, 0]; if (P) { const p = G.position; off = { ice: [-.9, .4, .1], towel: [0, 1.25, .05], cape: [0, .3, -.05], hammer: [.8, .6, .05], seed: [-1, .1, 0], zzz: [.6, 1.4, 0], sweat: [.7, 1.1, .05], wheel: [0, .4, -.1] }[L[2].split(':')[0]] || [-1.1, .5, 0]; P.position.set(p.x + off[0], p.y + off[1], p.z + off[2]); P.userData.o = P.position.clone(); }
  return (T) => { const t = st(T), k = Math.floor(T * 5);
    G.rotation.set(0, 0, 0); H.rotation.set(0, 0, 0); H.position.set(0, .45, 0); H.scale.set(1, 1, 1); setF('n'); const bx = document.body.classList.contains('story') ? -6.4 : window.__chemCardMode ? -1.5 : 4.3;   /* 스토리 땐 큰 햄토리·라벨 피해서 왼쪽 아래 */ let gx = bx, gy = -2.2; if (P) { P.position.set(bx + off[0], -2.2 + off[1], 2.6 + off[2]); P.userData.o = P.position.clone(); }
    switch (g) {
      case 'shiver': H.position.x = (k % 2 ? .06 : -.06); H.rotation.z = (k % 2 ? .05 : -.05); break;                                   // 덜덜
      case 'bath': H.position.y = .2 + (k % 4 === 0 ? .15 : 0); G.rotation.z = Math.sin(t * 3) * .1; break;
      case 'pull': G.rotation.z = .35 + (k % 3) * .04; H.position.x = -.1; break;                                                       // 낑낑 당기기
      case 'juggle': setF('up'); H.position.y = .45 + (k % 2) * .25; break;
      case 'climb': { const s = Math.floor(T / .8) % 6; gy = -2.2 + Math.min(s, 3) * .5; gx = bx - Math.min(s, 3) * .4; if (s >= 4) { setF('x'); G.rotation.z = 1.4; gy = -2.6; } break; }   // 계단 오르다 굴러떨어짐
      case 'point': setF('up'); G.rotation.z = (k % 6 < 3) ? .2 : -.1; break;
      case 'mess': setF(k % 8 < 4 ? 'up' : 'n'); G.rotation.y = (k % 4) * Math.PI / 2; break;                                            // 방 어지르며 뱅글
      case 'clap': setF(k % 2 ? 'up' : 'n'); break;
      case 'peek': gy = -2.2 - (k % 10 < 6 ? 1.1 : 0); break;                                                                           // 책상 밑에서 빼꼼
      case 'hug': setF('up'); H.scale.set(1 + (k % 2) * .08, 1, 1); break;
      case 'flex': setF('up'); H.scale.setScalar(k % 4 < 2 ? 1 : 1.15); break;
      case 'cough': setF(k % 6 === 0 ? 'x' : 'n'); H.position.y = .45 + (k % 6 === 0 ? -.12 : 0); G.rotation.z = k % 6 === 0 ? .25 : 0; break;
      case 'run': H.position.y = .45 + (k % 2) * .12; G.rotation.z = -.15; if (P) P.rotation.z = -st(T, 8) * 4; break;                  // 쳇바퀴 전력질주
      case 'count': G.rotation.z = (k % 4) * .08; setF(k % 8 === 7 ? 'x' : 'n'); break;                                               // 세다가 머리 터짐
      case 'eat': H.scale.set(1 + (k % 2) * .12, 1 - (k % 2) * .06, 1); if (P) P.scale.setScalar(Math.max(.2, 1 - (T % 6) / 6)); break;  // 우걱우걱 (씨앗 작아짐)
      case 'bonk': { const c = Math.floor(T / 1.6) % 2; if (c && (T % 1.6) < .6) { setF('x'); G.rotation.z = 1.2; gy = -2.5; } break; }  // 분자에 맞고 쓰러짐
      case 'push': { const ph = (T % 4) / 4; gx = bx - st(ph, 6) * 2; G.rotation.z = -.4; if (ph > .8) { gx = bx; setF('x'); G.rotation.z = .6; } if (P) P.position.set(gx - 1, -1.7 + st(ph, 6) * 1.2, 2.6); break; }   // 씨앗 밀어 올리다 굴러내려옴
      case 'squeeze': G.rotation.y = (k % 2) * .4; H.scale.set(.8, 1.15, 1); break;
      case 'squish': H.scale.set(k % 6 < 3 ? 1.4 : 1, k % 6 < 3 ? .45 : 1, 1); H.position.y = k % 6 < 3 ? .05 : .45; break;          // 납작
      case 'hammer': if (P) { P.rotation.z = k % 2 ? -.9 : .2; } break;
      case 'sleep': H.rotation.z = .5; G.rotation.z = .3; gy = -2.35; if (P) P.position.y = P.userData.o.y + (k % 4) * .08; break;
      case 'fly': setF('up'); gx = bx + Math.sin(st(T, 4) * 1.4) * 1.2; gy = -1.6 + (k % 2) * .15; G.rotation.z = -.35; if (P) { P.position.set(gx - .1, gy + .3, 2.55); P.rotation.z = (k % 2) * .2; } break;   // 망토 두르고 날기 (낮은 길)
    }
    G.position.set(gx, gy, 2.6); };
}
