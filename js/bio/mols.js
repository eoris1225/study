/* 분자 모형: 탄소 개수가 눈에 보이게 (포도당 6 → 피루브산 3 → 아세틸 2) */
import * as THREE from 'three';
import { label } from './engine.js?v=202611231459';

const G = { s: new THREE.SphereGeometry(1, 20, 14), cyl: new THREE.CylinderGeometry(.16, .16, 1, 8), cap: new THREE.CapsuleGeometry(.55, 1.1, 6, 14), ring: new THREE.TorusGeometry(.8, .14, 8, 24) };
const M = {};
const mat = (k, c, e, ei = 1, o = {}) =>M[k] || (M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, emissive: e || '#000', emissiveIntensity: ei * .45, roughness: .35, metalness: .1 }, o)));
const C = () =>mat('C', '#3a3f52', '#1b2240', .9);
const O = () =>mat('O', '#ff4a4a', '#7a0000', .8);
const H = () =>mat('H', '#f4f6ff', '#5a6070', .5);
const P = () =>mat('P', '#c48bff', '#6a2ad0', 1.4);
const bond = () =>mat('B', '#9fb3c8', '#223344', .5);

function sph(m, r, x = 0, y = 0, z = 0) { const s = new THREE.Mesh(G.s, m); s.scale.setScalar(r); s.position.set(x, y, z); return s; }
function link(g, a, b) { const d = new THREE.Vector3().subVectors(b, a); const c = new THREE.Mesh(G.cyl, bond()); c.scale.set(1, d.length(), 1); c.position.copy(a).addScaledVector(d, .5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(c); }
function chain(g, n, gap = 1.15, curve = 0) { const pts = []; for (let i = 0; i < n; i++) { const p = new THREE.Vector3((i - (n - 1) / 2) * gap, Math.sin(i * 1.3) * curve, 0); pts.push(p); g.add(sph(C(), .5, p.x, p.y, p.z)); if (i) link(g, pts[i - 1], p); } return pts; }
function ring6(g, r = 1.25) { const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const p = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0); pts.push(p); g.add(sph(C(), .48, p.x, p.y, p.z)); if (i) link(g, pts[i - 1], p); } link(g, pts[5], pts[0]); return pts; }
const TAGS = {};
function tag(g, text, y, color, scale = .55) { const k = text + color + scale; const l = (TAGS[k] || (TAGS[k] = label(text, { size: 52, scale, border: color, color: '#fff' }))).clone(); l.position.y = y; g.add(l); g.userData.tag = l; return l; }
function glow(color, r = 1.2, i = 1.5) { return sph(mat('glow' + color, color, color, i, { transparent: true, opacity: .25, depthWrite: false }), r); }

const BUILD = {
  ATP(g) { const core = sph(mat('atp', '#ffd23f', '#ffb000', 2.2), .55); g.add(core); for (let i = 0; i < 3; i++) { const p = sph(P(), .26, .75 + i * .55, 0, 0); g.add(p); } g.add(glow('#ffcc33', 1.15, 2)); tag(g, 'ATP', 1.5, '#ffd23f', .42); },
  NADH(g) { const c = new THREE.Mesh(G.cap, mat('nadh', '#4aa8ff', '#1f6bff', 2.2)); c.rotation.z = Math.PI / 2; c.scale.setScalar(.7); g.add(c); g.add(glow('#3b8cff', 1.3, 1.8)); tag(g, 'NADH', 1.4, '#4aa8ff', .45); },
  FADH2(g) { const c = new THREE.Mesh(G.cap, mat('fadh', '#47e38a', '#11b85a', 2.2)); c.rotation.z = Math.PI / 2; c.scale.setScalar(.7); g.add(c); g.add(glow('#33dd77', 1.3, 1.8)); tag(g, 'FADH₂', 1.4, '#47e38a', .45); },
  NAD(g) { const r = new THREE.Mesh(G.ring, mat('nad', '#8fb8ff', '#2a4a90', 1)); g.add(r); tag(g, 'NAD⁺', 1.3, '#8fb8ff', .4); },
  glucose(g) { const pts = ring6(g); pts.forEach((p, i) => { if (i % 2 === 0) g.add(sph(O(), .26, p.x * 1.45, p.y * 1.45, 0)); }); tag(g, '포도당 C₆', 2.4, '#7fffe0'); },
  fbp(g) { ring6(g); g.add(sph(P(), .42, -2, 0, 0)); g.add(sph(P(), .42, 2, 0, 0)); tag(g, '과당 2인산 (불안정!)', 2.4, '#c48bff'); },
  pgal(g) { chain(g, 3); g.add(sph(P(), .38, 2, 0, 0)); tag(g, 'PGAL C₃', 1.5, '#c48bff', .45); },
  pyruvate(g) { const p = chain(g, 3, 1.15, .2); g.add(sph(O(), .3, p[2].x + .6, .6, 0)); g.add(sph(O(), .3, p[1].x, -.75, 0)); g.add(glow('#ff9a3c', 1.9, .9)); tag(g, '피루브산 C₃', 1.7, '#ff9a3c', .5); },
  acetyl(g) { const p = chain(g, 2); const coa = sph(mat('coa', '#2fd4c4', '#0b8f88', 1.6), .75, 1.7, 0, 0); g.add(coa); link(g, p[1], coa.position); tag(g, '아세틸 CoA (C₂)', 1.7, '#2fd4c4', .5); },
  CO2(g) { g.add(sph(mat('co2c', '#8a8f99', '#303540', .6), .45)); g.add(sph(O(), .38, -.8, 0, 0)); g.add(sph(O(), .38, .8, 0, 0)); tag(g, 'CO₂', 1.1, '#aab2bf', .38); },
  O2(g) { g.add(sph(mat('o2', '#ff5a5a', '#ff2020', 1.8), .5, -.42, 0, 0)); g.add(sph(mat('o2', '#ff5a5a', '#ff2020', 1.8), .5, .42, 0, 0)); g.add(glow('#ff4040', 1.25, 1.4)); tag(g, 'O₂', 1.3, '#ff6a6a', .42); },
  H2O(g) { g.add(sph(mat('h2o', '#58c8ff', '#1a7fd0', 1.6), .5)); g.add(sph(H(), .28, -.48, .38, 0)); g.add(sph(H(), .28, .48, .38, 0)); },
  lactate(g) { chain(g, 3, 1.15, .2); g.add(glow('#ff6fae', 1.9, .9)); tag(g, '젖산 C₃', 1.6, '#ff6fae', .48); },
  acetald(g) { chain(g, 2); g.add(sph(O(), .3, 1, .6, 0)); tag(g, '아세트알데하이드 C₂', 1.4, '#ffd27f', .45); },
  ethanol(g) { chain(g, 2); g.add(sph(O(), .3, 1.1, .5, 0)); g.add(glow('#ffe27a', 1.6, .9)); tag(g, '에탄올 C₂', 1.4, '#ffe27a', .48); },
  NADPH(g) { const c = new THREE.Mesh(G.cap, mat('nadph', '#7a8aff', '#3a3aff', 2.2)); c.rotation.z = Math.PI / 2; c.scale.setScalar(.7); g.add(c); g.add(glow('#5a6aff', 1.3, 1.8)); tag(g, 'NADPH', 1.4, '#7a8aff', .45); },
  subS(g) { g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat('subS', '#5af0ff', '#1a9ab0', 1.6))); tag(g, '기질 ■', 1.5, '#5af0ff', .42); },
  prod(g) { g.add(new THREE.Mesh(new THREE.TetrahedronGeometry(.8), mat('prod', '#ffd23f', '#c08000', 1.8))); tag(g, '생성물', 1.2, '#ffd23f', .38); },
  cof(g) { g.add(new THREE.Mesh(new THREE.OctahedronGeometry(.6), mat('cof', '#ff9ad5', '#ff3a9a', 2.4))); g.add(glow('#ff6ab0', .9, 1.6)); tag(g, '조효소', 1.2, '#ff9ad5', .4); },
  RuBP(g) { chain(g, 5, .9); g.add(sph(P(), .3, -2.4, 0, 0)); g.add(sph(P(), .3, 2.4, 0, 0)); tag(g, 'RuBP C₅', 1.4, '#b8ff7a', .42); },
  PG3(g) { chain(g, 3); g.add(sph(P(), .34, 1.9, 0, 0)); tag(g, '3PG C₃', 1.4, '#ffd23f', .42); },
  Hp(g) { g.add(sph(mat('hp', '#ff7a9a', '#ff2a5a', 2.4), .3)); },
  e(g) { g.add(sph(mat('el', '#fff27a', '#ffd000', 3), .22)); }
};
export function mol(type) { const g = new THREE.Group(); (BUILD[type] || BUILD.e)(g); g.userData.type = type; g.userData.spin = Math.random() * 2 + .5; return g; }
export const NAME = { ATP: 'ATP', NADH: 'NADH', FADH2: 'FADH₂', NAD: 'NAD⁺', glucose: '포도당', fbp: '과당 2인산', pgal: 'PGAL', pyruvate: '피루브산', acetyl: '아세틸 CoA', CO2: 'CO₂', O2: 'O₂', H2O: 'H₂O', lactate: '젖산', NADPH: 'NADPH', subS: '기질', cof: '조효소', RuBP: 'RuBP', PG3: '3PG', prod: '생성물', acetald: '아세트알데하이드', ethanol: '에탄올' };
