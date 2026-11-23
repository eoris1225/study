/* 미토: 세계 — 세포막 · 세포질 · 핵 · 마이토콘드리아(외막/내막/크리스타) · 효소 기계들 */
import * as THREE from 'three';
import { E, label, dotTex } from './engine.js';

export const W = {};
const V = (x, y, z) =>new THREE.Vector3(x, y, z);
const std = (c, e, ei = 1, o = {}) =>new THREE.MeshStandardMaterial(Object.assign({ color: c, emissive: e || '#000', emissiveIntensity: ei * .45, roughness: .45, metalness: .05 }, o));
const glass = (c, e, op = .25, ei = .6) =>new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: ei * .5, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, roughness: .2 });

export const CELL = { c: V(0, 0, -20), r: 135 };
export const MITO = { a: V(-32, 0, -85), b: V(32, 0, -85), r: 20, gate: V(52, 0, -85) };
export const NUC = { c: V(-78, 6, 10), r: 26 };
export const POS = {
  start: V(0, 2, 72), glut: null, factory: V(-22, 0, 28), factIn: V(-34, 0, 28), factOut: V(-8, 0, 30),
  pdh: V(38, 0, -85), tca: V(8, 0, -85), etcX: -30, ldh: V(-26, 0, 52), yeast: V(6, 0, 52), arena: V(0, 6, 40)
};

export function buildWorld() {
  const S = E.scene, Q = E.quality;
  /* 빛 */
  S.add(new THREE.HemisphereLight('#9ff6ff', '#2a0f3a', .75));
  const sun = new THREE.DirectionalLight('#cfefff', .65); sun.position.set(30, 60, 40); S.add(sun);
  const mitoL = new THREE.PointLight('#ff8a3d', 60, 70, 1.6); mitoL.position.set(10, 6, -85); S.add(mitoL);
  const etcL = new THREE.PointLight('#ff4a7a', 30, 40, 1.6); etcL.position.set(-18, 4, -85); S.add(etcL);
  const facL = new THREE.PointLight('#5af0ff', 40, 50, 1.6); facL.position.set(-20, 8, 28); S.add(facL);
  W.lights = { mitoL, etcL, facL, sun };

  /* 세포막 (안쪽에서 보이는 거대한 구) + 지질 머리 */
  const memb = new THREE.Mesh(new THREE.SphereGeometry(CELL.r, 64, 40), std('#1d5560', '#0b3440', .9, { side: THREE.BackSide, roughness: .8 }));
  memb.position.copy(CELL.c); S.add(memb);
  const nHead = Q === 'low' ? 1400 : 3200; const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(1.1, 8, 6), std('#5fd6c7', '#1a7f78', .7), nHead); const m4 = new THREE.Matrix4();
  for (let i = 0; i < nHead; i++) { const d = new THREE.Vector3().randomDirection(); const p = d.clone().multiplyScalar(CELL.r - .6).add(CELL.c); m4.makeTranslation(p.x, p.y, p.z); heads.setMatrixAt(i, m4); } S.add(heads);

  /* 포도당 수송체 (세포막에 박힌 통로) */
  const gd = new THREE.Vector3(.42, .05, 1).normalize(); POS.glut = gd.clone().multiplyScalar(CELL.r - 8).add(CELL.c); POS.glutOut = gd.clone().multiplyScalar(CELL.r - 16).add(CELL.c);
  const glut = new THREE.Group(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const c = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 16, 12), std('#3fa0ff', '#1450c0', 1.2)); c.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2); glut.add(c); }
  const gring = new THREE.Mesh(new THREE.TorusGeometry(3.4, .35, 10, 40), std('#9ff', '#5ff', 3)); gring.rotation.x = Math.PI / 2; gring.position.y = -7; glut.add(gring);
  glut.position.copy(gd.clone().multiplyScalar(CELL.r).add(CELL.c)); glut.quaternion.setFromUnitVectors(V(0, 1, 0), gd.clone().negate()); S.add(glut);
  const gl = label('포도당 수송체\n(세포막)', { scale: 1.1, border: '#3fa0ff' }); gl.position.copy(POS.glutOut).add(V(0, 9, 0)); S.add(gl);

  /* 세포질 입자 (떠다니는 먼지) */
  const nP = Q === 'low' ? 1500 : 3500; const pg = new THREE.BufferGeometry(); const pa = new Float32Array(nP * 3);
  for (let i = 0; i < nP; i++) { const d = new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * (CELL.r - 4)).add(CELL.c); pa.set([d.x, d.y, d.z], i * 3); }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  W.dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#7fe8ff', size: .45, map: dotTex(), transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(W.dust);

  /* 세포 골격 (가는 실) */
  for (let i = 0; i < 26; i++) { const a = new THREE.Vector3().randomDirection().multiplyScalar(CELL.r - 6).add(CELL.c), b = new THREE.Vector3().randomDirection().multiplyScalar(CELL.r - 6).add(CELL.c); const d = b.clone().sub(a); const c = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, d.length(), 5), std('#88ffe8', '#2a9', .6, { transparent: true, opacity: .16, depthWrite: false })); c.position.copy(a).addScaledVector(d, .5); c.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); S.add(c); }

  /* 핵 + 소포체 + 리보솜 */
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(NUC.r, 48, 32), std('#5b3aa8', '#2c1270', 1.1, { roughness: .6 })); nuc.position.copy(NUC.c); S.add(nuc);
  const nin = new THREE.Mesh(new THREE.SphereGeometry(NUC.r * .45, 24, 16), std('#b48cff', '#7040ff', 1.8)); nin.position.copy(NUC.c).add(V(8, 4, 6)); S.add(nin);
  const nl = label('핵', { scale: 1.4, border: '#b48cff' }); nl.position.copy(NUC.c).add(V(0, NUC.r + 5, 0)); S.add(nl);
  for (let k = 0; k < 5; k++) { const pts = []; for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI * 1.1 + k * .5; const r = NUC.r + 7 + k * 3.2; pts.push(V(NUC.c.x + Math.cos(a) * r, NUC.c.y - 10 + k * 4 + Math.sin(i) * 2, NUC.c.z + Math.sin(a) * r)); } const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 1.1, 8), std('#3e6fd8', '#1a3a90', .9, { transparent: true, opacity: .75 })); S.add(tube); }
  const nR = Q === 'low' ? 250 : 600; const ribo = new THREE.InstancedMesh(new THREE.SphereGeometry(.45, 8, 6), std('#ffd0f0', '#a04080', 1.2), nR);
  for (let i = 0; i < nR; i++) { const d = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 90).add(CELL.c); m4.makeTranslation(d.x, d.y, d.z); ribo.setMatrixAt(i, m4); } S.add(ribo);
  for (let i = 0; i < 24; i++) { const r = 1.5 + Math.random() * 3; const v = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), glass('#b6fff2', '#2fbfa0', .22, .5)); const d = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 80).add(CELL.c); if (d.distanceTo(MITO.a.clone().add(MITO.b).multiplyScalar(.5)) < 45) continue; v.position.copy(d); S.add(v); }

  buildMito(S); buildFactory(S); buildPDH(S); buildTCA(S); buildETC(S); buildFerment(S); buildEnzymeLab(); buildChloroplast();
  return W;
}

/* ── 마이토콘드리아 ── */
function buildMito(S) {
  const c = MITO.a.clone().add(MITO.b).multiplyScalar(.5), len = MITO.a.distanceTo(MITO.b);
  const g = new THREE.Group(); g.position.copy(c); S.add(g); W.mito = g;
  const outer = new THREE.Mesh(new THREE.CapsuleGeometry(MITO.r, len, 16, 48), glass('#ff9a4a', '#a83a00', .2, .7)); outer.rotation.z = Math.PI / 2; g.add(outer);
  const inner = new THREE.Mesh(new THREE.CapsuleGeometry(MITO.r - 1.6, len, 16, 48), glass('#ffb36b', '#c0500a', .12, .9)); inner.rotation.z = Math.PI / 2; g.add(inner);
  /* 크리스타: 내막이 안으로 접힌 주름 (가장자리에서만 → 가운데는 비행 공간) */
  const crMat = std('#ff9f5a', '#c4500c', 1.1, { transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const x = -6 + i * 6.5; if (x > 30) break; for (const s of [1, -1]) { const cr = new THREE.Mesh(new THREE.CapsuleGeometry(1.1, 5.5, 6, 12), crMat); cr.scale.set(1, 1, 6); cr.position.set(x, s * 15.2, (i % 2 ? 1 : -1) * 2); g.add(cr); const cr2 = cr.clone(); cr2.position.set(x + 3, 0, s * 15.2); cr2.rotation.x = Math.PI / 2; g.add(cr2); } }
  /* 바탕질 반짝이 */
  const n = 900, pg = new THREE.BufferGeometry(), pa = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const x = (Math.random() - .5) * len * .95, a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (MITO.r - 3); pa.set([x, Math.cos(a) * r, Math.sin(a) * r], i * 3); }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ffb070', size: .5, map: dotTex(), transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })));
  /* 입구 */
  const gate = new THREE.Group(); gate.position.copy(MITO.gate); S.add(gate);
  const gr = new THREE.Mesh(new THREE.TorusGeometry(6.5, .6, 12, 48), std('#fff0a0', '#ffb000', 3)); gr.rotation.y = Math.PI / 2; gate.add(gr); W.gateRing = gr;
  const gl = label('마이토콘드리아 입구\n(외막·내막 통과)', { scale: 1, border: '#ffb000' }); gl.position.set(4, 10, 0); gate.add(gl);
  const ml = label('마이토콘드리아', { scale: 2, border: '#ff9a4a' }); ml.position.copy(c).add(V(0, MITO.r + 7, 0)); S.add(ml);
  const zone = (t, x, y, col) => { const l = label(t, { scale: .9, border: col }); l.position.set(c.x + x, y, c.z); S.add(l); };
  zone('바탕질 (기질)', 22, 13, '#ffb070');
}
/* 캡슐 충돌: 안/밖을 막고 입구로만 드나들게 */
export function mitoConstrain(p, wasInside) {
  const ab = MITO.b.clone().sub(MITO.a); const t = Math.max(0, Math.min(1, p.clone().sub(MITO.a).dot(ab) / ab.lengthSq())); const q = MITO.a.clone().addScaledVector(ab, t);
  const d = p.distanceTo(q), sdf = d - MITO.r; const inGate = p.x >MITO.b.x + 8 && Math.hypot(p.y - MITO.gate.y, p.z - MITO.gate.z) < 6.2;
  const dir = d > 1e-4 ? p.clone().sub(q).divideScalar(d) : V(0, 1, 0);
  if (!inGate) { if (wasInside && sdf > -1.6) p.copy(q).addScaledVector(dir, MITO.r - 1.6); else if (!wasInside && sdf < 1.6) p.copy(q).addScaledVector(dir, MITO.r + 1.6); }
  return (p.distanceTo(q) - MITO.r) < 0;
}

/* ── 해당 과정 공장 (세포질) ── */
function buildFactory(S) {
  const g = new THREE.Group(); S.add(g); W.factory = g;
  const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(V(POS.factIn.x + k * (POS.factOut.x - POS.factIn.x), Math.sin(k * Math.PI) * 4, POS.factIn.z - Math.sin(k * Math.PI) * 9)); }
  W.factPath = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(W.factPath, 120, 1.5, 12), glass('#7ff8ff', '#1ac0d0', .25, 1)));
  W.enzymes = []; const cols = ['#5af0ff', '#7affc4', '#ffd36b', '#ff9ad5', '#b49bff'];
  for (let i = 0; i < 10; i++) { const p = W.factPath.getPoint((i + .5) / 10); const e = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 1), std(cols[i % 5], cols[i % 5], .45, { flatShading: true })); e.position.copy(p).add(V(0, 3.2, 0)); g.add(e); W.enzymes.push(e); }
  const base = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 1.2, 48), std('#123848', '#0a2a38', .8)); base.position.set(POS.factory.x, -6, POS.factory.z - 3); g.add(base);
  W.factIn = ring(S, POS.factIn, '#5af0ff', '투입구');
  const l = label('해당 과정 공장\n세포질 · 산소 필요 없음', { scale: 1.3, border: '#5af0ff' }); l.position.set(POS.factory.x, 13, POS.factory.z - 6); S.add(l);
  W.factCounter = null;
}
/* 바닥 링 (투입 지점) */
function ring(S, p, col, text) {
  const g = new THREE.Group(); g.position.copy(p); S.add(g);
  const r = new THREE.Mesh(new THREE.TorusGeometry(3.4, .28, 10, 48), std(col, col, 2.5)); r.rotation.x = Math.PI / 2; g.add(r);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 14, 32, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .09, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); beam.position.y = 6; g.add(beam);
  if (text) { const l = label(text, { scale: .7, border: col }); l.position.y = 8.5; g.add(l); g.userData.label = l; }
  g.userData.r = r; return g;
}
export function makeRing(p, col, text) { return ring(E.scene, p, col, text); }

/* ── 피루브산 탈수소 효소 복합체 (바탕질 입구 쪽) ── */
function buildPDH(S) {
  const g = new THREE.Group(); g.position.copy(POS.pdh).add(V(-4, 0, 0)); S.add(g); W.pdh = g;
  const ico = new THREE.IcosahedronGeometry(1, 0); const vs = ico.attributes.position;
  for (let i = 0; i < vs.count; i += 3) { const v = V(vs.getX(i), vs.getY(i), vs.getZ(i)).multiplyScalar(3.4); const b = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), std('#2fd4c4', '#0b8f88', 1.3)); b.position.copy(v); g.add(b); }
  g.add(new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 14), std('#c0fff8', '#3fffe8', 2.2)));
  const l = label('피루브산 산화 장치\n(탈탄산 + 탈수소)', { scale: .9, border: '#2fd4c4' }); l.position.set(0, 8, 0); g.add(l);
  W.pdhIn = ring(S, POS.pdh.clone().add(V(2, -5, 0)), '#2fd4c4', '피루브산 투입');
}

/* ── TCA 회로 바퀴 ── */
export const TCA_ST = [
  { c: 4, name: '옥살아세트산 C₄', col: '#2fd4c4' }, { c: 6, name: '시트르산 C₆', col: '#ffd23f' }, { c: 5, name: '5탄소 화합물', col: '#ff9a3c', out: ['CO2', 'NADH'] },
  { c: 4, name: '4탄소 화합물', col: '#ff6fae', out: ['CO2', 'NADH', 'ATP'] }, { c: 4, name: '4탄소 화합물', col: '#b49bff', out: ['FADH2'] }, { c: 4, name: '옥살아세트산 C₄', col: '#2fd4c4', out: ['NADH'] }
];
function buildTCA(S) {
  const g = new THREE.Group(); g.position.copy(POS.tca); S.add(g); W.tca = g;
  const wheel = new THREE.Group(); g.add(wheel); W.tcaWheel = wheel; wheel.rotation.y = Math.PI / 2;
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(9, .55, 14, 80), std('#ffd27a', '#ff9a20', 1.8)));
  for (let i = 0; i < 12; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 9, 6), std('#ffe3a8', '#aa6a10', .8)); sp.rotation.z = i / 12 * Math.PI * 2; sp.position.set(Math.sin(-sp.rotation.z) * 4.5, Math.cos(sp.rotation.z) * 4.5, 0); wheel.add(sp); }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(2, 20, 14), std('#fff0c0', '#ffb000', 2.5)); wheel.add(hub);
  W.tcaNodes = [];
  const N = 8; const stIdx = [0, 1, 2, 3, 4, 5]; /* 6개 정거장 + 2개 장식 */
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const st = TCA_ST[i]; const n = new THREE.Group(); n.position.set(Math.sin(a) * 9, Math.cos(a) * 9, 0); const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 12), std(st.col, st.col, 1.4)); n.add(b); const l = label(st.name, { scale: .55, border: st.col }); l.position.y = 2.6; n.add(l); wheel.add(n); W.tcaNodes.push(n); }
  const l = label('TCA 회로\n(바탕질)', { scale: 1.2, border: '#ffd23f' }); l.position.set(0, 15, 0); g.add(l);
  W.tcaIn = ring(S, POS.tca.clone().add(V(6, -9, 9)), '#ffd23f', '아세틸 CoA 투입');
}

/* ── 전자 전달계 (내막 크리스타 벽) ── */
function buildETC(S) {
  const x = POS.etcX, c = POS.tca.clone(); c.x = x;
  const memTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#5a2a14'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { g.fillStyle = `hsl(${20 + Math.random() * 20},80%,${50 + Math.random() * 15}%)`; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 6 + Math.random() * 3, 0, 7); g.fill(); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const mem = new THREE.Mesh(new THREE.CircleGeometry(MITO.r - 1.7, 64), new THREE.MeshStandardMaterial({ map: memTex, emissive: '#5a1d00', emissiveIntensity: .6, transparent: true, opacity: .78, side: THREE.DoubleSide, roughness: .7 }));
  mem.position.copy(c); mem.rotation.y = Math.PI / 2; S.add(mem); W.etcMem = mem;
  const lm = label('내막 (크리스타) — 전자 전달계', { scale: 1, border: '#ff8a3d' }); lm.position.copy(c).add(V(1, 15, 0)); S.add(lm);
  const ls = label('막 사이 공간 →', { scale: .8, border: '#ff4a7a' }); ls.position.copy(c).add(V(-6, -14, 0)); S.add(ls);
  const g = new THREE.Group(); S.add(g); W.etc = g; const at = (z, y = 0) =>V(x + 1.6, c.y + y, c.z + z);
  const comp = (name, z, col, sz, y = 0) => { const o = new THREE.Group(); o.position.copy(at(z, y)); const b = new THREE.Mesh(new THREE.CapsuleGeometry(sz * .6, sz, 8, 16), std(col, col, .8, { roughness: .5 })); b.rotation.z = Math.PI / 2; b.rotation.y = Math.PI / 2; o.add(b); const l = label(name, { scale: .55, border: col }); l.position.set(1.5, sz + 1.2, 0); o.add(l); g.add(o); o.userData.body = b; return o; };
  W.cI = comp('복합체 Ⅰ\n(NADH)', -12, '#4aa8ff', 3.4, 1); W.cII = comp('복합체 Ⅱ\n(FADH₂)', -6.5, '#47e38a', 2.2, -4); W.cIII = comp('복합체 Ⅲ', -1, '#c48bff', 3);
  W.cIV = comp('복합체 Ⅳ\n(O₂ → H₂O)', 5, '#ff5a5a', 3, 1);
  /* ATP 합성 효소: 막에 박힌 회전자 + 줄기 + 머리 */
  const sy = new THREE.Group(); sy.position.copy(at(12.5, -1)); g.add(sy); W.syn = sy;
  const rot = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 2, 12), std('#ffd23f', '#ff9a00', 1.6)); rot.rotation.z = Math.PI / 2; rot.position.x = -1.4; sy.add(rot); W.synRotor = rot;
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 4, 10), std('#ffe9a0', '#b07a10', 1)); stalk.rotation.z = Math.PI / 2; stalk.position.x = 1.2; sy.add(stalk);
  const head = new THREE.Group(); head.position.x = 4.6; sy.add(head); W.synHead = head;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const s = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), std(i % 2 ? '#ffd23f' : '#ff9a3c', i % 2 ? '#ffb000' : '#ff6a00', 1.4)); s.position.set(0, Math.cos(a) * 1.6, Math.sin(a) * 1.6); head.add(s); }
  const sl = label('ATP 합성 효소', { scale: .65, border: '#ffd23f' }); sl.position.set(3, 5, 0); sy.add(sl);
  /* 이동성 운반체 (조효소 Q, 사이토크롬 c) */
  W.Q = new THREE.Mesh(new THREE.SphereGeometry(.6, 12, 8), std('#ffe27a', '#ffcc00', 2.5)); W.Q.position.copy(at(-4, -2)); g.add(W.Q);
  W.cytc = new THREE.Mesh(new THREE.SphereGeometry(.6, 12, 8), std('#ff9a9a', '#ff3030', 2.5)); W.cytc.position.copy(at(2, 2)); g.add(W.cytc);
  /* 막 사이 공간의 H+ */
  const n = 1400, pg = new THREE.BufferGeometry(), pa = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 15; pa.set([x - 1.5 - Math.random() * 16, c.y + Math.cos(a) * r, c.z + Math.sin(a) * r], i * 3); }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); pg.setDrawRange(0, 0);
  W.hp = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ff5a8a', size: .9, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(W.hp); W.hpMax = n;
  W.inI = ring(S, at(-12, -7).add(V(3, 0, 0)), '#4aa8ff', 'NADH'); W.inII = ring(S, at(-6.5, -11).add(V(3, 0, 0)), '#47e38a', 'FADH₂'); W.inIV = ring(S, at(5, -7).add(V(3, 0, 0)), '#ff5a5a', 'O₂'); W.inSyn = ring(S, at(12.5, -8).add(V(4, 0, 0)), '#ffd23f', '터빈 돌리기');
  [W.inI, W.inII, W.inIV, W.inSyn].forEach(r =>r.rotation.z = 0);
}
export function setHplus(f) { W.hp.geometry.setDrawRange(0, Math.round(Math.max(0, Math.min(1, f)) * W.hpMax)); }

/* ── 발효 장치 (세포질) ── */
function buildFerment(S) {
  const mk = (p, col, t) => { const g = new THREE.Group(); g.position.copy(p); S.add(g); const core = new THREE.Mesh(new THREE.TorusKnotGeometry(2.4, .7, 90, 12), std(col, col, 1.1)); core.position.y = 4; g.add(core); g.userData.core = core; const l = label(t, { scale: .85, border: col }); l.position.y = 10; g.add(l); g.visible = false; return g; };
  W.ldh = mk(POS.ldh, '#ff6fae', '젖산 발효 효소\n(근육 세포)'); W.yeast = mk(POS.yeast, '#ffe27a', '알코올 발효 효소\n(효모)');
}

/* 매 프레임 */
export function stepWorld(dt, t) {
  if (W.dust) W.dust.rotation.y += dt * .004;
  if (W.gateRing) W.gateRing.rotation.x += dt * .8;
  W.enzymes && W.enzymes.forEach((e, i) => { e.rotation.y += dt * (.4 + i * .05); e.position.y += Math.sin(t * 2 + i) * .004; });
  if (W.pdh) W.pdh.rotation.y += dt * .25;
  if (W.ldh && W.ldh.visible) W.ldh.userData.core.rotation.y += dt; if (W.yeast && W.yeast.visible) W.yeast.userData.core.rotation.y += dt;
  if (W.Q) { W.Q.position.y += Math.sin(t * 3) * .01; } if (W.cytc) W.cytc.position.y += Math.cos(t * 2.6) * .01;
}

/* ════════ 효소 실험실 (세포질, 시작 지점 왼쪽) ════════ */
export const ENZ = { hillA: V(-62, 0, 88), hillB: V(-28, 0, 88), hill: V(-45, 0, 88), keys: [V(-66, 0, 64), V(-54, 0, 60), V(-42, 0, 64)], apo: V(-12, 0, 94) };
export const KEY_TYPES = ['subT', 'subS', 'subC'];
export function buildEnzymeLab() {
  const S = E.scene; const g = new THREE.Group(); S.add(g); W.lab = g;
  /* 활성화 에너지 언덕: 빨강(효소 없음) / 파랑(효소 있음) */
  const hill = (H, col) => { const sh = new THREE.Shape(); sh.moveTo(-14, 0); for (let i = 0; i <= 40; i++) { const x = -14 + i * .7; sh.lineTo(x, H * Math.exp(-x * x / 22)); } sh.lineTo(14, 0); sh.lineTo(-14, 0); const geo = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); const m = new THREE.Mesh(geo, std(col, col, .9, { transparent: true, opacity: .75 })); m.position.copy(ENZ.hill).add(V(0, -6, -4)); g.add(m); return m; };
  W.hillRed = hill(16, '#ff4a5a'); W.hillBlue = hill(7, '#3fa0ff'); W.hillBlue.visible = false;
  const l = label('활성화 에너지 언덕\n(효소가 없으면 못 넘는다)', { scale: .9, border: '#ff4a5a' }); l.position.copy(ENZ.hill).add(V(0, 15, 0)); g.add(l); W.hillLabel = l;
  W.ringA = makeRing(ENZ.hillA.clone().add(V(0, -4, 0)), '#ff9a3c', '반응물 투입'); W.ringB = makeRing(ENZ.hillB.clone().add(V(0, -4, 0)), '#3fa0ff', '생성물');
  /* 효소 세 개: 활성 부위 모양(삼각·사각·원) */
  W.keyEnz = ENZ.keys.map((p, i) => { const o = new THREE.Group(); o.position.copy(p).add(V(0, 2, 0)); const body = new THREE.Mesh(new THREE.SphereGeometry(3, 28, 20, .7, Math.PI * 2 - 1.4), std(['#3fd88a', '#5af0ff', '#ffb547'][i], ['#1a8a50', '#1a8aa0', '#a06010'][i], .9, { side: THREE.DoubleSide })); body.rotation.y = Math.PI / 2; o.add(body); const site = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.2, [3, 4, 24][i]), std('#fff', '#fff', 1.5, { wireframe: true })); site.rotation.x = Math.PI / 2; site.position.z = 2.6; o.add(site); const t = label(['효소 ▲', '효소 ■', '효소 ●'][i], { scale: .6, border: ['#3fd88a', '#5af0ff', '#ffb547'][i] }); t.position.y = 5; o.add(t); g.add(o); o.userData.ring = makeRing(p.clone().add(V(0, -4, 4)), ['#3fd88a', '#5af0ff', '#ffb547'][i], ''); return o; });
  /* 주효소 (보조 인자가 없으면 회색) */
  const apo = new THREE.Group(); apo.position.copy(ENZ.apo).add(V(0, 2, 0)); const ab = new THREE.Mesh(new THREE.TorusKnotGeometry(2.2, .8, 80, 12), std('#777', '#222', .4)); apo.add(ab); apo.userData.body = ab; const al = label('주효소 (단백질만)\n→ 혼자서는 활성 없음', { scale: .6, border: '#999' }); al.position.y = 6; apo.add(al); apo.userData.label = al; g.add(apo); W.apo = apo; W.apoRing = makeRing(ENZ.apo.clone().add(V(0, -4, 4)), '#8fb8ff', '조효소');
  const lt = label('효소 공방', { scale: 1.6, border: '#3fd88a' }); lt.position.set(-45, 22, 76); g.add(lt);
}
function makeRingLocal(p, c, t) { return makeRing(p, c, t); }

/* ════════ 엽록체 (세포질 오른쪽) ════════ */
export const CHL = { c: V(80, 0, 0), r: V(24, 16, 34), gate: V(56, 0, 0) };
export function buildChloroplast() {
  const S = E.scene, c = CHL.c; const g = new THREE.Group(); g.position.copy(c); S.add(g); W.chl = g;
  const ell = (k, col, e, op) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), glass(col, e, op, .7)); m.scale.set(CHL.r.x * k, CHL.r.y * k, CHL.r.z * k); g.add(m); return m; };
  ell(1, '#5aff7a', '#0a7a20', .18); ell(.94, '#8aff9a', '#109030', .1);
  /* 그라나 (틸라코이드 더미) */
  const disc = new THREE.CylinderGeometry(3.2, 3.2, .7, 28), dm = std('#3fdc5a', '#0f8a2a', 1.2, { transparent: true, opacity: .9 });
  [[-8, -6, -22], [6, -7, -24], [-10, -8, 20], [4, -6, 24], [-14, 4, -4]].forEach(([x, y, z]) => { for (let k = 0; k < 6; k++) { const d = new THREE.Mesh(disc, dm); d.position.set(x, y + k * 1, z); g.add(d); } });
  const gl = label('그라나 (틸라코이드 더미)', { scale: .7, border: '#3fdc5a' }); gl.position.set(-8, 2, -22); g.add(gl);
  const sl = label('스트로마', { scale: .8, border: '#9fffb0' }); sl.position.set(-12, 10, 10); g.add(sl);
  const tl = label('엽록체', { scale: 2, border: '#5aff7a' }); tl.position.set(0, CHL.r.y + 7, 0); g.add(tl);
  /* 입구 */
  const gate = new THREE.Mesh(new THREE.TorusGeometry(6.5, .6, 12, 48), std('#d0ffa0', '#8aff40', 3)); gate.position.copy(CHL.gate); gate.rotation.y = Math.PI / 2; S.add(gate); W.chlGate = gate;
  const gtl = label('엽록체 입구', { scale: .9, border: '#8aff40' }); gtl.position.copy(CHL.gate).add(V(-2, 9, 0)); S.add(gtl);
  /* 햇빛 기둥 */
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 6, 60, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); b.position.set(c.x + 6 + (i % 2) * 6, 30, c.z - 12 + i * 8); S.add(b); }
  /* 틸라코이드 막 벽 (명반응) — 앞(-x)은 스트로마, 뒤(+x)는 틸라코이드 내부 */
  const px = c.x + 8; W.thyX = px;
  const mem = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), std('#2fa84a', '#0c6a24', .9, { transparent: true, opacity: .7, side: THREE.DoubleSide })); mem.position.set(px, 0, c.z); mem.rotation.y = Math.PI / 2; S.add(mem); W.thyMem = mem;
  const ml = label('틸라코이드 막 — 명반응', { scale: .9, border: '#3fdc5a' }); ml.position.set(px - 1, 13, c.z); S.add(ml);
  const il = label('← 스트로마 | 틸라코이드 내부 →', { scale: .6, border: '#9fffb0' }); il.position.set(px, -13, c.z); S.add(il);
  const comp = (name, z, col, sz, y = 0) => { const o = new THREE.Group(); o.position.set(px - 1.5, y, c.z + z); const b = new THREE.Mesh(new THREE.CapsuleGeometry(sz * .6, sz, 8, 16), std(col, col, .9)); b.rotation.x = Math.PI / 2; o.add(b); const l = label(name, { scale: .55, border: col }); l.position.set(-1, sz + 1.6, 0); o.add(l); S.add(o); o.userData.body = b; return o; };
  W.ps2 = comp('광계 Ⅱ\n(P680)', -11, '#8a5aff', 3.2); W.cytb = comp('전자 전달계\n(사이토크롬)', -4, '#ff6a8a', 2.4, -1); W.ps1 = comp('광계 Ⅰ\n(P700)', 3, '#5a8aff', 3.2); W.nadpR = comp('NADP⁺ 환원', 8, '#4aa8ff', 1.8, 3);
  const sy = new THREE.Group(); sy.position.set(px, -2, c.z + 12); S.add(sy); const rot = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 2, 12), std('#ffd23f', '#ff9a00', 1.6)); rot.rotation.z = Math.PI / 2; rot.position.x = 1.4; sy.add(rot); W.cSynRotor = rot;
  const st = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 4, 10), std('#ffe9a0', '#b07a10', 1)); st.rotation.z = Math.PI / 2; st.position.x = -1.4; sy.add(st);
  const hd = new THREE.Group(); hd.position.x = -4.4; sy.add(hd); W.cSynHead = hd; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const s = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), std(i % 2 ? '#ffd23f' : '#ff9a3c', '#ff8a00', 1.4)); s.position.set(0, Math.cos(a) * 1.5, Math.sin(a) * 1.5); hd.add(s); }
  const syl = label('ATP 합성 효소\n(머리는 스트로마 쪽)', { scale: .55, border: '#ffd23f' }); syl.position.set(-3, 5, 0); sy.add(syl); W.cSyn = sy;
  /* 틸라코이드 내부 H+ */
  const n = 900, pg = new THREE.BufferGeometry(), pa = new Float32Array(n * 3); for (let i = 0; i < n; i++) pa.set([px + 1 + Math.random() * 9, (Math.random() - .5) * 18, c.z + (Math.random() - .5) * 26], i * 3);
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); pg.setDrawRange(0, 0); W.lumen = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ff5a8a', size: .9, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(W.lumen); W.lumenMax = n;
  W.inPS2 = makeRing(V(px - 4, -8, c.z - 11), '#8a5aff', '광계 Ⅱ (빛)'); W.inPS1 = makeRing(V(px - 4, -8, c.z + 3), '#5a8aff', '광계 Ⅰ (빛)'); W.inCSyn = makeRing(V(px - 6, -9, c.z + 12), '#ffd23f', '터빈 돌리기');
  /* 캘빈 회로 바퀴 (스트로마) */
  const cg = new THREE.Group(); cg.position.set(c.x - 8, 0, c.z + 2); S.add(cg); W.calvin = cg; const wh = new THREE.Group(); cg.add(wh); wh.rotation.y = Math.PI / 2; W.calWheel = wh;
  wh.add(new THREE.Mesh(new THREE.TorusGeometry(7.5, .5, 14, 70), std('#b8ff7a', '#5ac020', 1.8)));
  W.calNodes = []; CAL_ST.forEach((s, i) => { const a = i / CAL_ST.length * Math.PI * 2; const n2 = new THREE.Group(); n2.position.set(Math.sin(a) * 7.5, Math.cos(a) * 7.5, 0); n2.add(new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), std(s.col, s.col, 1.4))); const l2 = label(s.name, { scale: .5, border: s.col }); l2.position.y = 2.5; n2.add(l2); wh.add(n2); W.calNodes.push(n2); });
  const cl = label('캘빈 회로 (탄소 고정)\n스트로마', { scale: .9, border: '#b8ff7a' }); cl.position.set(0, 12, 0); cg.add(cl);
  W.inCal = makeRing(V(c.x - 2, -9, c.z + 10), '#b8ff7a', 'CO₂ 투입');
}
export const CAL_ST = [{ name: 'RuBP (C₅) ×3', col: '#b8ff7a' }, { name: '3PG (C₃) ×6', col: '#ffd23f' }, { name: 'PGAL (C₃) ×6', col: '#ff9a3c' }, { name: 'PGAL 1개 → 포도당 쪽', col: '#ff6fae' }];
export function setLumen(f) { W.lumen.geometry.setDrawRange(0, Math.round(Math.max(0, Math.min(1, f)) * W.lumenMax)); }
export function chloroConstrain(p, wasInside) {
  const d = p.clone().sub(CHL.c); const f = Math.sqrt((d.x / CHL.r.x) ** 2 + (d.y / CHL.r.y) ** 2 + (d.z / CHL.r.z) ** 2);
  const inGate = p.x < CHL.c.x - CHL.r.x + 7 && Math.hypot(p.y - CHL.gate.y, p.z - CHL.gate.z) < 6.2;
  if (!inGate) { if (wasInside && f > .9) p.copy(CHL.c).add(d.multiplyScalar(.9 / f)); else if (!wasInside && f < 1.08 && f > 1e-3) p.copy(CHL.c).add(d.multiplyScalar(1.08 / f)); }
  const d2 = p.clone().sub(CHL.c); return Math.sqrt((d2.x / CHL.r.x) ** 2 + (d2.y / CHL.r.y) ** 2 + (d2.z / CHL.r.z) ** 2) < 1;
}
