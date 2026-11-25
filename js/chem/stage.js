/* 화학 3D 무대: 개념마다 직접 만지는 3D 장면 + 실시간 그래프 */
import * as THREE from 'three';
import { dress } from './gag3d.js?v=3';

const $ = s => document.querySelector(s);
const cv = $('#stage');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false });
R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#14182a');
const cam = new THREE.PerspectiveCamera(40, 1, .1, 200);
scene.add(new THREE.HemisphereLight('#ffffff', '#3a3050', 1.3));
const sun = new THREE.DirectionalLight('#ffffff', 1.6); sun.position.set(5, 9, 8); scene.add(sun);
let ROOT = new THREE.Group(); scene.add(ROOT);
let ST = window.__chemState = {};
let upd = null, T = 0, dragYaw = 0, dragPitch = 0;
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .4, metalness: .05 }, o));
const sph = (r, c, o) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), M(c, o));
const box = (w, h, d, c, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o));
const cyl = (r1, r2, h, c, o) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 28), M(c, o));
const at = (o, x, y, z = 0) => { o.position.set(x, y, z); return o; };
function stick(a, b, c = '#cfd8e8', r = .08) { const d = b.clone().sub(a), m = cyl(r, r, d.length(), c); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); return m; }
function label(t, col = '#fff', size = .55, bg = 'rgba(10,12,30,.7)') { const c = document.createElement('canvas'), x = c.getContext('2d'); const f = '700 56px "Noto Sans KR",sans-serif'; x.font = f; const w = Math.ceil(x.measureText(t).width) + 36; c.width = w; c.height = 84; x.font = f;
  if (bg) { x.fillStyle = bg; x.beginPath(); x.roundRect ? x.roundRect(2, 4, w - 4, 76, 20) : x.rect(2, 4, w - 4, 76); x.fill(); } x.fillStyle = col; x.textBaseline = 'middle'; x.fillText(t, 18, 44);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(size * w / 84, size, 1); s.renderOrder = 9; s.userData.set = nt => { const ns = label(nt, col, size, bg); s.material.map.dispose(); s.material.map = ns.material.map; s.scale.copy(ns.scale); }; return s; }
const COL = { H: '#f2f4f8', O: '#e8443a', N: '#3a6ae8', C: '#3a3a44', I: '#7a3ab8', Cl: '#3ad86a', A: '#3a8ae8', B: '#e85a4a', Y: '#f0c030', P: '#7a3aa8', Mg: '#c8ccd4', heat: '#ff8a30' };
const atom = (e, r) => sph(r || ({ H: .28, O: .42, N: .42, C: .45, I: .55, Cl: .48 }[e] || .4), COL[e] || e);
function molecule(spec) { /* [[elem,x,y,z],...], bonds [[i,j]] */ const g = new THREE.Group(); const [atoms, bonds = []] = spec; const ps = atoms.map(([e, x, y, z = 0]) => { const a = atom(e); a.position.set(x, y, z); g.add(a); return a.position; }); bonds.forEach(([i, j]) => g.add(stick(ps[i], ps[j]))); return g; }
const MOL = { H2: [[['H', -.35, 0], ['H', .35, 0]], [[0, 1]]], O2: [[['O', -.5, 0], ['O', .5, 0]], [[0, 1]]], N2: [[['N', -.5, 0], ['N', .5, 0]], [[0, 1]]], H2O: [[['O', 0, 0], ['H', -.6, -.45], ['H', .6, -.45]], [[0, 1], [0, 2]]], CO2: [[['C', 0, 0], ['O', -.85, 0], ['O', .85, 0]], [[0, 1], [0, 2]]], CO: [[['C', -.45, 0], ['O', .45, 0]], [[0, 1]]], NO: [[['N', -.45, 0], ['O', .45, 0]], [[0, 1]]], NH3: [[['N', 0, .1], ['H', -.6, -.35, .2], ['H', .6, -.35, .2], ['H', 0, -.35, -.6]], [[0, 1], [0, 2], [0, 3]]], HI: [[['I', .2, 0], ['H', -.55, 0]], [[0, 1]]], CH4: [[['C', 0, 0], ['H', .6, .6, .6], ['H', -.6, -.6, .6], ['H', -.6, .6, -.6], ['H', .6, -.6, -.6]], [[0, 1], [0, 2], [0, 3], [0, 4]]] };
const mol = k => molecule(MOL[k]);

/* ── 화면 위 조작부 · 그래프 ── */
const ctl = $('#ctl'), gph = $('#gph'), gx = gph.getContext('2d');
let graphFn = null;
function ui() { ctl.innerHTML = ''; ctl.hidden = true; graphFn = null; gph.hidden = true; }
function btn(t, fn, on) { ctl.hidden = false; const b = document.createElement('button'); b.textContent = t; if (on) b.classList.add('on'); b.onclick = e => { e.stopPropagation(); fn(b); }; ctl.appendChild(b); return b; }
function group(list, cur, fn) { const bs = list.map(([k, t]) => btn(t, () => { bs.forEach(x => x.classList.toggle('on', x === b0(k))); fn(k); }, k === cur)); const b0 = k => bs[list.findIndex(x => x[0] === k)]; return bs; }
function slider(t, min, max, val, step, fn) { ctl.hidden = false; const w = document.createElement('label'); w.innerHTML = `<span>${t}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><b>${val}</b>`; const i = w.querySelector('input'), o = w.querySelector('b'); i.oninput = () => { o.textContent = i.value; fn(+i.value); }; ctl.appendChild(w); fn(val); return i; }
function graph(fn) { graphFn = fn; gph.hidden = false; }
function axes(x0, y0, w, h, xl, yl) { gx.strokeStyle = '#cfd6ee'; gx.lineWidth = 2; gx.beginPath(); gx.moveTo(x0, y0 - h); gx.lineTo(x0, y0); gx.lineTo(x0 + w, y0); gx.stroke(); gx.fillStyle = '#cfd6ee'; gx.font = '14px "Noto Sans KR"'; gx.fillText(xl, x0 + w - gx.measureText(xl).width, y0 + 18); gx.save(); gx.translate(x0 - 8, y0 - h); gx.fillText(yl, 4, -4); gx.restore(); }
function poly(pts, col, wd = 3, dash) { gx.strokeStyle = col; gx.lineWidth = wd; gx.setLineDash(dash || []); gx.beginPath(); pts.forEach(([x, y], i) => i ? gx.lineTo(x, y) : gx.moveTo(x, y)); gx.stroke(); gx.setLineDash([]); }
function txt(t, x, y, col = '#fff', sz = 14) { gx.fillStyle = col; gx.font = `700 ${sz}px "Noto Sans KR"`; gx.fillText(t, x, y); }

/* 입자 상자 */
function particleBox(g, n, size, col, speed = 2) { const ps = []; for (let i = 0; i < n; i++) { const p = sph(.18, col); p.position.set((Math.random() - .5) * size[0], (Math.random() - .5) * size[1], (Math.random() - .5) * size[2]); p.userData.v = V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(speed); g.add(p); ps.push(p); } return ps; }
function moveParticles(ps, size, dt, k = 1) { let hits = 0; for (const p of ps) { p.position.addScaledVector(p.userData.v, dt * k); ['x', 'y', 'z'].forEach((a, i) => { const L = size[i] / 2; if (p.position[a] > L) { p.position[a] = L; p.userData.v[a] *= -1; } if (p.position[a] < -L) { p.position[a] = -L; p.userData.v[a] *= -1; } }); } return hits; }
const wire = (w, h, d, c = '#8ab0ff') => new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color: c }));
function hillCurve(r, top, p, w = 9) { const pts = []; for (let i = 0; i <= 80; i++) { const x = -w / 2 + w * i / 80; const s = 1 / (1 + Math.exp(-(x) * 2.2)); const base = r + (p - r) * s; pts.push(V(x, base + (top - (r + p) / 2) * Math.exp(-(x * x) / 1.4), 0)); } return pts; }
const tube = (pts, c, r = .09) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, r, 10), M(c, { emissive: c, emissiveIntensity: .3 }));
const heatBits = [];
function emitHeat(g, from, dir, n = 6, col = COL.heat) { for (let i = 0; i < n; i++) { const p = sph(.1, col, { emissive: col, emissiveIntensity: 1 }); p.position.copy(from); p.userData = { v: dir.clone().add(V((Math.random() - .5) * 1.5, (Math.random() - .5) * 1.5, (Math.random() - .5))).multiplyScalar(2.2), life: 1.4 }; g.add(p); heatBits.push(p); } }
function stepHeat(dt) { for (let i = heatBits.length - 1; i >= 0; i--) { const p = heatBits[i]; p.userData.life -= dt; p.position.addScaledVector(p.userData.v, dt); p.material.transparent = true; p.material.opacity = Math.max(0, p.userData.life / 1.4); if (p.userData.life <= 0) { p.parent && p.parent.remove(p); heatBits.splice(i, 1); } } }
function thermo(g, x, y) { const t = new THREE.Group(); const glass = cyl(.16, .16, 3, '#ffffff', { transparent: true, opacity: .3 }); t.add(glass); const bulb = at(sph(.28, '#ff4a3a'), 0, -1.6); t.add(bulb); const col = cyl(.1, .1, 1, '#ff4a3a'); t.add(col); t.position.set(x, y, 0); g.add(t); t.userData.set = v => { const h = Math.max(.05, Math.min(2.9, v)); col.scale.y = h; col.position.y = -1.45 + h / 2; }; return t; }

/* ── 장면들 ── */
const SC = {
  exoendo(g) { let mode = 'exo', ph = 0; const top = at(box(3.2, .2, 2, '#4a8ae8'), -2.6, 1.2), low = at(box(3.2, .2, 2, '#e8784a'), 2.6, -1.4); g.add(top, low);
    const lt = at(label('반응물', '#bfe0ff'), -2.6, 2.6), lp = at(label('생성물', '#ffd0b8'), 2.6, -.1); g.add(lt, lp); const th = thermo(g, 5.6, .3); const tl = at(label('주위 온도', '#ffd0a0', .4), 5.6, 2.3); g.add(tl);
    const m = at(mol('CH4'), -2.6, 1.9); g.add(m); let temp = 1.2; const dh = at(label('ΔH < 0 · 발열', '#ffb070', .6), 0, 3.4); g.add(dh);
    group([['exo', '🔥 발열 (ΔH<0)'], ['endo', '❄️ 흡열 (ΔH>0)']], 'exo', k => { mode = k; ST.endoSeen = ST.endoSeen || k === 'endo'; ph = 0; const ex = k === 'exo'; top.position.y = ex ? 1.2 : -1.4; low.position.y = ex ? -1.4 : 1.2; lt.position.y = top.position.y + 1.4; lp.position.y = low.position.y + 1.3; dh.userData.set(ex ? 'ΔH < 0 · 발열' : 'ΔH > 0 · 흡열'); temp = 1.2; });
    btn('▶ 다시', () => { ph = 0; temp = 1.2; });
    return (t, dt) => { ph += dt; const k = Math.min(1, ph / 2.2), s = k * k * (3 - 2 * k); m.position.set(-2.6 + 5.2 * s, top.position.y + .7 + (low.position.y - top.position.y) * s + Math.sin(Math.PI * s) * 1.2, 0); m.rotation.y += dt;
      if (ph > 2.2 && ph < 2.3) { if (mode === 'exo') emitHeat(g, m.position, V(1.2, .5, 0), 18); else emitHeat(g, V(5.6, 0, 0), V(-1.2, .3, 0), 18, '#7ab8ff'); }
      if (ph > 2.2) temp += (mode === 'exo' ? 1 : -1) * dt * .8; if (mode === 'endo' && temp < .5) ST.cold = true; if (mode === 'exo' && temp > 2.4) ST.hot = true; temp = Math.max(.2, Math.min(2.6, temp)); th.userData.set(temp); if (ph > 5.5) { ph = 0; temp = 1.2; } }; },
  calor(g) { const cup = cyl(1.6, 1.3, 3, '#ffffff', { transparent: true, opacity: .35 }); g.add(cup); const water = at(cyl(1.5, 1.25, 2, '#5aa8ff', { transparent: true, opacity: .55 }), 0, -.45); g.add(water);
    const th = thermo(g, .5, .9); const lid = at(box(3.4, .15, 3.4, '#e8e8e8'), 0, 1.55); g.add(lid); const q = at(label('Q = c × m × Δt', '#ffe27a', .55), 0, 3.4); g.add(q); const dt$ = at(label('Δt = 0.0 °C', '#ff9a7a', .5), 3.6, .6); g.add(dt$);
    let t0 = 0, run = true; btn('🧪 NaOH 넣기 (발열)', () => { t0 = 0; run = true; }); btn('⏸ 멈춤', () => run = !run);
    return (t, dt) => { if (run) t0 += dt; const dT = Math.min(10.3, t0 * 3); ST.dT = dT; th.userData.set(.6 + dT / 6); dt$.userData.set(`Δt = ${dT.toFixed(1)} °C`); if (Math.random() < dt * 8 && dT < 10) emitHeat(g, V((Math.random() - .5) * 2, -.5, 0), V(0, .8, 0), 1, '#ffd07a'); }; },
  bond(g) { const a = at(atom('H', .45), -.4, 0), b = at(atom('H', .45), .4, 0); g.add(a, b); const st = stick(a.position, b.position); g.add(st);
    const bar = at(box(.7, .1, .7, '#ff8a3a', { emissive: '#ff8a3a', emissiveIntensity: .4 }), 4, -2); g.add(bar); const lb = at(label('흡수한 에너지 0 kJ', '#ffd0a0', .45), 4, 2.6); g.add(lb); g.add(at(label('H–H 결합 에너지 436 kJ/mol', '#bfe0ff', .5), 0, 3.4));
    let tgt = 1, cur = 0; group([['cut', '✂️ 결합 끊기 (흡수)'], ['make', '🔗 결합 만들기 (방출)']], 'cut', k => { tgt = k === 'cut' ? 1 : 0; if (k === 'make') emitHeat(g, V(0, 0, 0), V(0, 1, 0), 20); });
    return (t, dt) => { cur += (tgt - cur) * Math.min(1, dt * 1.5); const d = .4 + cur * 2.2; a.position.x = -d; b.position.x = d; st.visible = cur < .35; st.scale.y = 1 + cur * 3; ST.e = 436 * cur; const e = 436 * cur; bar.scale.y = .1 + cur * 40; bar.position.y = -2 + bar.scale.y * .05; lb.userData.set(`흡수한 에너지 ${e.toFixed(0)} kJ`); }; },
  bondH2O(g) { const sets = { r: [['H', -3, 1.2], ['H', -2.3, 1.2], ['H', -3, -.4], ['H', -2.3, -.4], ['O', -1, .4], ['O', 0, .4]], a: [['H', -3.5, 2.2], ['H', -1.5, 2.8], ['H', .5, 2.4], ['H', 2, 2.9], ['O', -.8, 1.8], ['O', 1.4, 1.6]], p: [['H', 1.7, 1], ['H', 3.1, 1], ['O', 2.4, 1.5], ['H', 1.7, -.6], ['H', 3.1, -.6], ['O', 2.4, -.1]] };
    const map = { r: [0, 1, 2, 3, 4, 5], a: [0, 1, 2, 3, 4, 5], p: [0, 1, 3, 4, 2, 5] }; const atoms = sets.r.map(([e, x, y]) => { const a = at(atom(e), x, y); g.add(a); return a; });
    const lab = at(label('반응물: 2H₂ + O₂', '#bfe0ff', .55), 0, 3.6); g.add(lab); let stage = 'r', k = 1;
    const go = s => { stage = s; k = 0; ST.stage = s; lab.userData.set({ r: '반응물: 2H₂ + O₂', a: '과정 1: 결합을 모두 끊음 → 흡수 (ΔH > 0)', p: '과정 2: O–H 4개 생성 → 방출 (ΔH < 0)' }[s]); if (s === 'p') emitHeat(g, V(2.4, .5, 0), V(1, 1, 0), 24); };
    group([['r', '① 반응물'], ['a', '② 결합 끊기'], ['p', '③ 결합 만들기']], 'r', go);
    return (t, dt) => { k = Math.min(1, k + dt * .8); const S = sets[stage], ord = map[stage]; atoms.forEach((a, i) => { const j = ord.indexOf(i); const tg = S[j] || S[i]; a.position.lerp(V(tg[1], tg[2], 0), .06); a.position.y += Math.sin(t * 3 + i) * .002; }); }; },
  hess(g) { const lv = [[2, 'CaO + 2HCl'], [.6, 'Ca(OH)₂ + 2HCl'], [-2, 'CaCl₂ + H₂O']]; lv.forEach(([y, t], i) => { g.add(at(box(8, .08, .6, '#5a7aa8'), 0, y)); g.add(at(label(t, '#dfe8ff', .42, null), -4.2, y + .35)); });
    const b1 = at(sph(.3, '#ffd23f', { emissive: '#ffd23f', emissiveIntensity: .5 }), 3, 2.3), b2 = at(sph(.3, '#5affd0', { emissive: '#5affd0', emissiveIntensity: .5 }), -1, 2.3); g.add(b1, b2);
    g.add(at(label('경로 1: ΔH₁ = −189.3', '#ffd23f', .42), 3, -2.8), at(label('경로 2: −76.9 + (−112.4) = −189.3', '#5affd0', .42), -1, -2.8));
    return (t, dt) => { const k = (t % 4) / 3, s = Math.min(1, k); b1.position.y = 2.3 - 4.3 * s; const s2 = Math.min(1, k); b2.position.y = s2 < .5 ? 2.3 - 1.4 * (s2 / .5) * 1 : .9 - 2.9 * ((s2 - .5) / .5); b2.position.x = s2 < .5 ? -1 : 0; }; },
  hf(g) { g.add(at(box(9, .06, .6, '#ffffff'), 0, 0)); g.add(at(label('원소 물질 (H₂, O₂, C 흑연) = 0', '#ffffff', .4, null), -1.8, .35));
    const L = [['C 다이아몬드', 1.88, '#9adfff'], ['CH₄', -74.8, '#5affd0'], ['H₂O(l)', -285.8, '#5aa8ff'], ['CO₂', -393.5, '#ffb070']];
    const bars = L.map(([n, v, c], i) => { const h = Math.abs(v) / 100; const b = at(box(1.2, h, .8, c), -3 + i * 2.1, v > 0 ? h / 2 : -h / 2); b.scale.y = .01; g.add(b); g.add(at(label(`${n} ${v}`, c, .36), -3 + i * 2.1, v > 0 ? h + .5 : -h - .4)); return [b, v]; });
    return (t, dt) => bars.forEach(([b, v]) => { b.scale.y = Math.min(1, b.scale.y + dt * .7); b.position.y = (v > 0 ? 1 : -1) * Math.abs(v) / 200 * b.scale.y; }); },
  entropy(g) { const size = [6, 4, 4]; g.add(wire(...size)); const ps = []; const n = 27; for (let i = 0; i < n; i++) { const p = sph(.22, '#5aa8ff'); p.userData = { home: V((i % 3 - 1) * .55, (Math.floor(i / 3) % 3 - 1) * .55 - 1.3, (Math.floor(i / 9) - 1) * .55), v: V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(3) }; p.position.copy(p.userData.home); g.add(p); ps.push(p); }
    let st = 's'; const meter = at(box(.5, 1, .5, '#ffd23f', { emissive: '#ffd23f', emissiveIntensity: .4 }), 4, -2); g.add(meter); const ml = at(label('엔트로피 S', '#ffe27a', .45), 4, 2.6); g.add(ml);
    group([['s', '🧊 고체'], ['l', '💧 액체'], ['g', '💨 기체']], 's', k => st = k);
    return (t, dt) => { ST.st = st; const S = { s: .6, l: 1.4, g: 4 }[st]; meter.scale.y += (S - meter.scale.y) * dt * 3; meter.position.y = -2 + meter.scale.y / 2;
      for (const p of ps) { const u = p.userData; if (st === 's') { p.position.lerp(u.home.clone().add(V(Math.sin(t * 20 + u.home.x * 9) * .04, Math.cos(t * 23 + u.home.y * 7) * .04, 0)), .2); }
        else if (st === 'l') { p.position.addScaledVector(u.v, dt * .35); if (p.position.y > -.6) u.v.y = -Math.abs(u.v.y); ['x', 'y', 'z'].forEach((a, i) => { const L = size[i] / 2 - .2; if (Math.abs(p.position[a]) > L) { u.v[a] *= -1; p.position[a] = Math.sign(p.position[a]) * L; } }); }
        else { p.position.addScaledVector(u.v, dt); ['x', 'y', 'z'].forEach((a, i) => { const L = size[i] / 2 - .2; if (Math.abs(p.position[a]) > L) { u.v[a] *= -1; p.position[a] = Math.sign(p.position[a]) * L; } }); } } }; },
  nh3(g) { const left = [mol('N2'), mol('H2'), mol('H2'), mol('H2')], right = [mol('NH3'), mol('NH3')]; left.forEach((m, i) => { m.position.set(-3 + (i % 2) * 1.6, 1 - Math.floor(i / 2) * 1.8, 0); g.add(m); }); right.forEach((m, i) => { m.position.set(2.5 + i * 1.8, 0, 0); m.visible = false; g.add(m); });
    const lb = at(label('기체 분자 4개', '#bfe0ff', .5), 0, 3); g.add(lb); g.add(at(label('N₂ + 3H₂ → 2NH₃', '#ffe27a', .5), 0, -3)); let on = false;
    btn('▶ 반응시키기', () => { on = !on; ST.on = on; right.forEach(m => m.visible = on); left.forEach(m => m.visible = !on); lb.userData.set(on ? '기체 분자 2개 → ΔS < 0' : '기체 분자 4개'); });
    return (t, dt) => [...left, ...right].forEach((m, i) => { m.rotation.y += dt * (.5 + i * .1); m.position.y += Math.sin(t * 2 + i) * .003; }); },
  mix(g) { g.add(at(wire(4, 3, 3), -2.3, 0), at(wire(4, 3, 3), 2.3, 0)); const wall = at(box(.1, 3, 3, '#8ab0ff', { transparent: true, opacity: .5 }), 0, 0); g.add(wall);
    const ps = [...particleBox(g, 22, [3.6, 2.6, 2.6], '#e8443a'), ...particleBox(g, 22, [3.6, 2.6, 2.6], '#3a6ae8')]; ps.forEach((p, i) => p.position.x += i < 22 ? -2.3 : 2.3); let open = false; const lb = at(label('칸막이 닫힘', '#fff', .5), 0, 2.4); g.add(lb);
    btn('🔓 꼭지 열기', b => { open = !open; ST.open = ST.open || open; wall.visible = !open; b.textContent = open ? '🔒 다시 나누기' : '🔓 꼭지 열기'; lb.userData.set(open ? '저절로 섞임 → 엔트로피 증가' : '칸막이 닫힘'); if (!open) ps.forEach((p, i) => p.position.x = (i < 22 ? -2.3 : 2.3) + (Math.random() - .5) * 3); });
    return (t, dt) => ps.forEach((p, i) => { p.position.addScaledVector(p.userData.v, dt); const left = i < 22; const minX = open ? -4.1 : left ? -4.1 : .2, maxX = open ? 4.1 : left ? -.2 : 4.1; if (p.position.x < minX || p.position.x > maxX) { p.userData.v.x *= -1; p.position.x = Math.max(minX, Math.min(maxX, p.position.x)); } ['y', 'z'].forEach(a => { if (Math.abs(p.position[a]) > 1.3) { p.userData.v[a] *= -1; p.position[a] = Math.sign(p.position[a]) * 1.3; } }); }); },
  system(g) { const sys = sph(1.6, '#5aa8ff', { transparent: true, opacity: .35 }); g.add(sys); g.add(at(label('계', '#bfe0ff', .6), 0, 0), at(label('주위', '#ffe2a0', .6), 0, 3.2)); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, .05, 8, 64), M('#ffffff')); g.add(ring);
    let mode = 'iso'; const lb = at(label('고립계: 물질 ✕ 에너지 ✕', '#fff', .5), 0, -3); g.add(lb); let acc = 0;
    group([['iso', '🧴 고립계'], ['closed', '🥤 닫힌계'], ['open', '☕ 열린계']], 'iso', k => { mode = k; lb.userData.set({ iso: '고립계: 물질 ✕ 에너지 ✕', closed: '닫힌계: 에너지만 교환', open: '열린계: 물질 ⭕ 에너지 ⭕' }[k]); (ST.sys = ST.sys || {})[k] = 1; });
    return (t, dt) => { acc += dt; ring.material.color.set(mode === 'iso' ? '#ffffff' : mode === 'closed' ? '#ffd23f' : '#5affd0'); if (acc > .25) { acc = 0; const a = Math.random() * 6.28, d = V(Math.cos(a), Math.sin(a), 0); if (mode !== 'iso') emitHeat(g, d.clone().multiplyScalar(1.2), d, 1); if (mode === 'open') emitHeat(g, d.clone().multiplyScalar(-3), d.clone().multiplyScalar(.6), 1, '#5aa8ff'); } }; },
  spont(g) { const bars = [['ΔS계', '#5aa8ff', -2.5], ['ΔS주위', '#ffb070', 0], ['ΔS전체', '#5affd0', 2.5]].map(([n, c, x]) => { const b = at(box(1.4, 1, .8, c), x, 0); g.add(b); g.add(at(label(n, c, .45), x, -3)); return b; }); g.add(at(box(8, .04, .6, '#ffffff'), 0, 0));
    let dH = -1, dS = 1, big = 1.5; const res = at(label('', '#fff', .6), 0, 3.2); g.add(res);
    const set = () => { const sS = dS * (dH * dS < 0 ? 1 : big), sSur = -dH * (dH * dS < 0 ? 1 : 3 - big); const vals = [sS, sSur, sS + sSur]; vals.forEach((v, i) => bars[i].userData.t = v); const tot = sS + sSur; ST.dH = dH; ST.dS = dS; ST.tot = tot; if (dH > 0 && dS > 0 && tot > 0) ST.endoSpont = true; if (dH < 0 && dS < 0 && tot > 0) ST.exoNegS = true; res.userData.set(tot > 0 ? 'ΔS전체 > 0 → 자발적 ✔' : 'ΔS전체 < 0 → 비자발적 ✕'); };
    group([['-', 'ΔH < 0 (발열)'], ['+', 'ΔH > 0 (흡열)']], '-', k => { dH = k === '-' ? -1 : 1; set(); }); group([['+', 'ΔS계 > 0'], ['-', 'ΔS계 < 0']], '+', k => { dS = k === '+' ? 1 : -1; set(); });
    slider('|ΔS계| 크기', .5, 2.5, 1.5, .1, v => { big = v; set(); });
    return (t, dt) => bars.forEach(b => { const v = b.userData.t || 0; b.scale.y += (v - b.scale.y) * dt * 4; if (Math.abs(b.scale.y) < .02) b.scale.y = .02; b.position.y = b.scale.y / 2; }); },
  mgHCl(g) { const fl = cyl(.6, 1.8, 3, '#ffffff', { transparent: true, opacity: .25 }); g.add(fl); const liq = at(cyl(.95, 1.75, 1.3, '#9adfff', { transparent: true, opacity: .45 }), 0, -.85); g.add(liq); const mg = at(box(1.4, .08, .3, COL.Mg, { metalness: .8 }), 0, -1.2); g.add(mg);
    const gauge = at(label('압력 0.00 atm', '#ffe27a', .5), 3.6, 1.5); g.add(gauge); const bub = []; let p = 0, tt = 0, run = true;
    btn('🔁 처음부터', () => { p = 0; tt = 0; mg.scale.x = 1; data.length = 0; }); const data = [];
    graph(() => { gx.clearRect(0, 0, 360, 220); axes(40, 190, 300, 160, '시간', 'H₂ 압력'); poly(data.map(([x, y]) => [40 + x * 12, 190 - y * 60]), '#ffe27a'); });
    return (t, dt) => { if (run && mg.scale.x > .02) { tt += dt; const r = .35 * mg.scale.x; mg.scale.x = Math.max(.01, mg.scale.x - r * dt * .5); p += r * dt; if (Math.random() < r * 1.5) { const b = at(sph(.07, '#ffffff', { transparent: true, opacity: .8 }), (Math.random() - .5) * 1.2, -1.15); g.add(b); bub.push(b); } if (data.length === 0 || tt - data[data.length - 1][0] > .2) data.push([tt, p]); }
      ST.p = p; gauge.userData.set(`압력 ${p.toFixed(2)} atm`); for (let i = bub.length - 1; i >= 0; i--) { bub[i].position.y += dt * 1.2; if (bub[i].position.y > -.2) { g.remove(bub[i]); bub.splice(i, 1); } } }; },
  rate(g, o = {}) { const size = [6, 4, 3]; g.add(wire(...size)); const ps = particleBox(g, 60, size, COL.A, 1.5); let tt = 0; const data = [];
    btn('🔁 다시', () => { ps.forEach(p => { p.material.color.set(COL.A); p.userData.b = false; }); tt = 0; data.length = 0; });
    graph(() => { gx.clearRect(0, 0, 360, 220); axes(40, 190, 300, 160, '시간', '농도'); poly(data.map(([x, a]) => [40 + x * 10, 190 - a * 150]), '#5aa8ff'); poly(data.map(([x, a]) => [40 + x * 10, 190 - (1 - a) * 150]), '#ff7a6a'); txt('A', 300, 40, '#5aa8ff'); txt('B', 320, 40, '#ff7a6a');
      if (o.tangent && data.length > 10) { const i = Math.max(1, Math.min(data.length - 2, Math.floor((tt * .35) % 1 * data.length))); const [x1, y1] = data[i - 1], [x2, y2] = data[i + 1]; const m = (y2 - y1) / (x2 - x1 || 1), [xc, yc] = data[i]; poly([[40 + (xc - 4) * 10, 190 - (yc - 4 * m) * 150], [40 + (xc + 4) * 10, 190 - (yc + 4 * m) * 150]], '#ffe27a', 2); txt('접선 = 순간 반응 속도', 120, 30, '#ffe27a'); poly([[40, 190 - data[0][1] * 150], [40 + xc * 10, 190 - yc * 150]], '#c8a0ff', 2, [6, 4]); txt('할선 = 평균 반응 속도', 120, 50, '#c8a0ff'); } });
    return (t, dt) => { tt += dt; moveParticles(ps, size, dt); for (const p of ps) if (!p.userData.b && Math.random() < dt * .12) { p.userData.b = true; p.material.color.set(COL.B); } const a = ps.filter(p => !p.userData.b).length / ps.length; ST.a = a; if (!data.length || tt - data[data.length - 1][0] > .25) data.push([tt, a]); if (tt > 29) { ps.forEach(p => { p.material.color.set(COL.A); p.userData.b = false; }); tt = 0; data.length = 0; } }; },
  avgrate(g) { return SC.rate(g, { tangent: true }); },
  ratelaw(g) { const size = [6, 4, 3]; g.add(wire(...size)); let nNO = 1, nO2 = 1, no = [], o2 = []; const rebuild = () => { [...no, ...o2].forEach(p => g.remove(p)); no = particleBox(g, 8 * nNO, size, COL.N, 1.6); o2 = particleBox(g, 8 * nO2, size, COL.O, 1.6); };
    const lb = at(label('', '#ffe27a', .55), 0, 2.8); g.add(lb); const set = () => { rebuild(); ST.x = nNO * nNO * nO2; lb.userData.set(`v = k[NO]²[O₂] → 처음의 ${nNO * nNO * nO2}배`); };
    group([[1, '[NO] ×1'], [2, '[NO] ×2']], 1, k => { nNO = k; set(); }); group([[1, '[O₂] ×1'], [2, '[O₂] ×2']], 1, k => { nO2 = k; set(); }); set();
    graph(() => { gx.clearRect(0, 0, 360, 220); txt('초기 반응 속도 (상댓값)', 20, 26, '#ffe27a'); const v = nNO * nNO * nO2; for (let i = 0; i < v; i++) { gx.fillStyle = '#ffd23f'; gx.fillRect(30 + i * 38, 60, 30, 120); } txt(`${v}배`, 30 + v * 38, 130, '#fff', 22); });
    return (t, dt) => { moveParticles(no, size, dt); moveParticles(o2, size, dt); }; },
  halflife(g) { const ps = []; for (let i = 0; i < 64; i++) { const p = at(sph(.2, COL.A), (i % 8 - 3.5) * .6, (Math.floor(i / 8) - 3.5) * .5); g.add(p); ps.push(p); } let tt = 0, half = 0; const lb = at(label('[A]₀', '#bfe0ff', .55), 0, 2.6); g.add(lb); const data = [[0, 1]];
    graph(() => { gx.clearRect(0, 0, 360, 220); axes(40, 190, 300, 160, '시간', '[A]'); const pts = []; for (let x = 0; x <= 4; x += .05) pts.push([40 + x * 70, 190 - Math.pow(.5, x) * 150]); poly(pts, '#5aa8ff'); for (let i = 1; i <= 3; i++) { poly([[40 + i * 70, 190], [40 + i * 70, 190 - Math.pow(.5, i) * 150]], '#ffe27a', 1, [4, 4]); txt(`${i}t½`, 30 + i * 70, 208, '#ffe27a', 12); } const x = Math.min(4, tt / 2.5); gx.fillStyle = '#ff7a6a'; gx.beginPath(); gx.arc(40 + x * 70, 190 - Math.pow(.5, x) * 150, 6, 0, 7); gx.fill(); });
    btn('🔁 다시', () => { tt = 0; half = 0; ps.forEach(p => { p.visible = true; p.material.color.set(COL.A); }); lb.userData.set('[A]₀'); });
    return (t, dt) => { tt += dt; const h = Math.floor(tt / 2.5); if (h > half && h <= 4) { half = h; ST.half = Math.max(ST.half || 0, h); const alive = ps.filter(p => p.material.color.getHexString() === '3a8ae8'); alive.sort(() => Math.random() - .5).slice(0, alive.length / 2).forEach(p => p.material.color.set('#555a66')); lb.userData.set(`반감기 ${h}번 → [A]₀ × (½)${'⁰¹²³⁴'[h]} = ${64 / Math.pow(2, h)}/64`); } if (tt > 13) { tt = 0; half = 0; ps.forEach(p => p.material.color.set(COL.A)); lb.userData.set('[A]₀'); } }; },
  collision(g) { const A = mol('HI'), B = mol('HI'); g.add(A, B); const lb = at(label('(가) 방향 적합 + 빠르게 → 반응!', '#5affd0', .5), 0, 2.8); g.add(lb); let mode = 'a', ph = 0; const prods = [mol('H2'), molecule([[['I', -.55, 0], ['I', .55, 0]], [[0, 1]]])]; prods.forEach(p => { p.visible = false; g.add(p); });
    const reset = () => { ph = 0; A.visible = B.visible = true; prods.forEach(p => p.visible = false); };
    group([['a', '(가) 적합+빠름'], ['b', '(나) 방향 ✕'], ['c', '(다) 너무 느림']], 'a', k => { mode = k; reset(); lb.userData.set({ a: '(가) 방향 적합 + 빠르게 → 반응!', b: '(나) 방향이 맞지 않음 → 반응 ✕', c: '(다) 방향은 맞지만 에너지 부족 → 반응 ✕' }[k]); });
    return (t, dt) => { ph += dt * (mode === 'c' ? .5 : 1); const k = Math.min(1, ph / 1.5); A.rotation.z = mode === 'b' ? 0 : Math.PI; B.rotation.z = 0; A.position.set(-4 + 3.1 * k, 0, 0); B.position.set(4 - 3.1 * k, 0, 0);
      if (ph > 1.5 && ph < 1.55) { ST.tries = (ST.tries || {}); ST.tries[mode] = 1; if (mode === 'a') { A.visible = B.visible = false; prods.forEach(p => p.visible = true); emitHeat(g, V(0, 0, 0), V(0, 1, 0), 14, '#fff27a'); } }
      if (ph > 1.5) { const s = (ph - 1.5); if (mode === 'a') { prods[0].position.set(-.3 - s * 2, .3 + s, 0); prods[1].position.set(.3 + s * 2, -.3 - s, 0); } else { A.position.x = -.9 - s * 2; B.position.x = .9 + s * 2; } }
      if (ph > 3.8) reset(); }; },
  ea(g) { const pts = hillCurve(-1, 2.6, -1.8); g.add(tube(pts, '#ff7a6a')); const ball = sph(.32, '#ffd23f', { emissive: '#ffd23f', emissiveIntensity: .4 }); g.add(ball); g.add(at(label('활성화물', '#ffd0a0', .42), 0, 3.4), at(label('반응물', '#bfe0ff', .42), -4, -.3), at(label('생성물', '#ffd0b8', .42), 4, -1.1));
    const eaLine = at(box(.04, 3.6, .04, '#ffe27a'), -2.6, .8); g.add(eaLine); g.add(at(label('Eₐ', '#ffe27a', .45), -3, 1)); let E = 2, ph = 0, ok = false; const res = at(label('', '#fff', .5), 0, -2.8); g.add(res);
    slider('공의 에너지', .5, 5, 2, .1, v => { E = v; ph = 0; }); btn('▶ 굴리기', () => ph = 0);
    return (t, dt) => { ph += dt * .45; const need = 3.6; ok = E >= need; ST.E = E; if (ok && ph > .9) ST.over = true; if (!ok && ph > 1.5) ST.back = true; const peak = ok ? 1 : Math.min(1, E / need) * .5; const s = ok ? Math.min(1, ph) : (ph < .5 ? ph / .5 * peak : Math.max(0, peak - (ph - .5) / .5 * peak)); const i = Math.floor(s * (pts.length - 1)); ball.position.copy(pts[i]).add(V(0, .35, 0)); res.userData.set(ok ? 'Eₐ 이상 → 넘어감 (반응)' : 'Eₐ 부족 → 되돌아옴'); if (ph > 2.4) ph = 0; }; },
  conc(g) { const size = [6, 4, 3]; g.add(wire(...size)); let y = [], p = [], n = 2, hits = 0, acc = 0; const lb = at(label('', '#ffe27a', .5), 0, 2.8); g.add(lb);
    const build = k => { [...y, ...p].forEach(q => g.remove(q)); y = particleBox(g, k * 3, size, COL.Y, 1.8); p = particleBox(g, 6, size, COL.P, 1.8); hits = 0; acc = 0; }; slider('노란 입자 농도', 1, 4, 2, 1, v => { n = v; build(v); });
    return (t, dt) => { moveParticles(y, size, dt); moveParticles(p, size, dt); acc += dt; for (const a of y) for (const b of p) if (a.position.distanceToSquared(b.position) < .14) { hits++; b.scale.setScalar(1.6); } p.forEach(b => b.scale.lerp(V(1, 1, 1), .1)); ST.n = n; lb.userData.set(`충돌 ${(hits / Math.max(1, acc)).toFixed(0)} 회/초`); if (acc > 6) { acc = 0; hits = 0; } }; },
  pressure(g) { const cylw = cyl(2, 2, 4.2, '#ffffff', { transparent: true, opacity: .15, side: THREE.DoubleSide }); g.add(cylw); const pis = at(cyl(1.95, 1.95, .3, '#3a3a50'), 0, 2); g.add(pis); const ps = particleBox(g, 30, [2.6, 3.6, 2.6], '#5ad87a', 2); let top = 2, tg = 2, hits = 0, acc = 0; const lb = at(label('', '#ffe27a', .5), 3.6, 1); g.add(lb);
    group([['lo', '⬆ 낮은 압력'], ['hi', '⬇ 외부 압력 증가']], 'lo', k => { tg = k === 'hi' ? .2 : 2; ST.hi = ST.hi || k === 'hi'; hits = 0; acc = 0; });
    return (t, dt) => { top += (tg - top) * dt * 2; pis.position.y = top; acc += dt; for (const q of ps) { q.position.addScaledVector(q.userData.v, dt); const h = top - .2; if (q.position.y > h) { q.position.y = h; q.userData.v.y *= -1; hits++; } if (q.position.y < -2) { q.position.y = -2; q.userData.v.y *= -1; hits++; } const r = Math.hypot(q.position.x, q.position.z); if (r > 1.8) { q.position.x *= 1.8 / r; q.position.z *= 1.8 / r; q.userData.v.x *= -1; q.userData.v.z *= -1; hits++; } } lb.userData.set(`벽·입자 충돌 ${(hits / Math.max(.5, acc)).toFixed(0)}/초`); if (acc > 5) { acc = 0; hits = 0; } }; },
  surface(g) { const big = box(2, 2, 2, '#c87a4a'); g.add(big); const small = []; for (let i = 0; i < 8; i++) { const b = box(1, 1, 1, '#c87a4a'); b.visible = false; b.userData.t = V((i % 2 - .5) * 2.4, (Math.floor(i / 2) % 2 - .5) * 2.4, (Math.floor(i / 4) - .5) * 2.4); g.add(b); small.push(b); } const lb = at(label('표면적 24 cm²', '#ffe27a', .5), 0, 3); g.add(lb); let split = false;
    btn('🔨 잘게 쪼개기', b => { split = !split; ST.split = ST.split || split; big.visible = !split; small.forEach(s => { s.visible = split; s.position.set(0, 0, 0); }); lb.userData.set(split ? '표면적 48 cm² (2배) → 충돌 ↑' : '표면적 24 cm²'); b.textContent = split ? '🧱 다시 붙이기' : '🔨 잘게 쪼개기'; });
    const ox = particleBox(g, 24, [8, 6, 5], '#e8443a', 1.6);
    return (t, dt) => { moveParticles(ox, [8, 6, 5], dt); small.forEach(s => s.position.lerp(s.userData.t, .05)); g.rotation.y = Math.sin(t * .3) * .4; }; },
  maxwell(g, o = {}) { let Tm = 1, ea = 6.5, cat = 0; const size = [6, 3.5, 3]; g.add(wire(...size)); const ps = particleBox(g, 50, size, '#5aa8ff', 1.5);
    slider('온도', 1, 2.5, 1, .1, v => { Tm = v; ST.T = v; }); if (o.catalyst) group([[0, '촉매 없음'], [1, '정촉매 (Eₐ↓)'], [-1, '부촉매 (Eₐ↑)']], 0, k => { cat = k; (ST.cats = ST.cats || {})[k] = 1; });
    const f = (x, T) => x * Math.exp(-x * x / (T * T * 4)) / (T * T);
    graph(() => { gx.clearRect(0, 0, 360, 220); axes(40, 190, 300, 160, '운동 에너지', '분자 수'); const E = ea - cat * 2; const sx = x => 40 + x * 25, sy = y => 190 - y * 260;
      const p1 = [], p2 = []; for (let x = 0; x <= 12; x += .1) { p1.push([sx(x), sy(f(x, 1))]); p2.push([sx(x), sy(f(x, Tm))]); }
      gx.fillStyle = 'rgba(255,120,100,.35)'; gx.beginPath(); gx.moveTo(sx(E), 190); for (let x = E; x <= 12; x += .1) gx.lineTo(sx(x), sy(f(x, Tm))); gx.lineTo(sx(12), 190); gx.fill();
      poly(p1, '#5aa8ff'); if (Tm > 1.05) poly(p2, '#ff7a6a'); poly([[sx(E), 190], [sx(E), 40]], '#ffe27a', 2, [5, 4]); txt('Eₐ', sx(E) + 4, 50, '#ffe27a'); txt('T₁', 70, 70, '#5aa8ff'); if (Tm > 1.05) txt(`T₂ (온도 ${Tm.toFixed(1)}배)`, 120, 100, '#ff7a6a'); txt('빗금 = 반응 가능한 분자', 150, 30, '#ffb0a0', 12); });
    return (t, dt) => { for (const p of ps) { const sp = p.userData.v.length(); const e = sp * Tm; p.material.color.set(e * 2.6 > ea - cat * 2 ? '#ff6a4a' : '#5aa8ff'); p.material.emissive = p.material.color; p.material.emissiveIntensity = e * 2.6 > ea - cat * 2 ? .6 : 0; } moveParticles(ps, size, dt, Tm); }; },
  catalyst(g) { const hi = tube(hillCurve(-1, 3, -2), '#ff7a6a'), lo = tube(hillCurve(-1, 1.2, -2), '#5affd0'), up = tube(hillCurve(-1, 4, -2), '#c8a0ff'); g.add(hi, lo, up); lo.visible = up.visible = false; g.add(at(label('ΔH (그대로)', '#ffe27a', .42), 4.2, -1.4));
    const lb = at(label('촉매 없음', '#ff7a6a', .5), 0, 4.2); g.add(lb);
    group([['n', '촉매 없음'], ['p', '정촉매'], ['m', '부촉매']], 'n', k => { (ST.cats = ST.cats || {})[k] = 1; lo.visible = k === 'p'; up.visible = k === 'm'; lb.userData.set({ n: '촉매 없음', p: '정촉매: Eₐ ↓ → 빨라짐 (ΔH 그대로)', m: '부촉매: Eₐ ↑ → 느려짐 (ΔH 그대로)' }[k]); });
    return (t, dt) => { g.rotation.y = Math.sin(t * .4) * .25; }; },
  maxwellcat(g) { return SC.maxwell(g, { catalyst: true }); },
  converter(g) { for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) g.add(at(sph(.34, '#c8b070', { metalness: .7, roughness: .3 }), i * .7 + (j % 2) * .35, -2, j * .6)); g.add(at(label('백금(Pt)·로듐(Rh)·팔라듐(Pd) 촉매 표면', '#ffe27a', .42), 0, -3));
    const ms = []; const spawn = () => { const k = Math.random() < .5 ? 'NO' : 'CO'; const m = mol(k); m.position.set((Math.random() - .5) * 6, 3, (Math.random() - .5) * 2); m.userData = { k, ph: 0 }; g.add(m); ms.push(m); };
    const lb = at(label('2NO + 2CO → N₂ + 2CO₂', '#fff', .5), 0, 3.5); g.add(lb); let acc = 0;
    return (t, dt) => { acc += dt; if (acc > .6) { acc = 0; spawn(); } for (let i = ms.length - 1; i >= 0; i--) { const m = ms[i], u = m.userData; u.ph += dt; if (u.ph < 1.6) m.position.y = 3 - u.ph * 3; else if (!u.done) { u.done = true; ST.conv = (ST.conv || 0) + 1; g.remove(m); const nm = mol(u.k === 'NO' ? 'N2' : 'CO2'); nm.position.copy(m.position); nm.userData = { ph: 0, out: true }; g.add(nm); ms[i] = nm; emitHeat(g, nm.position, V(0, 1, 0), 3, '#fff27a'); } if (u.out) { m.position.y += dt * 2; m.rotation.y += dt; if (m.position.y > 4) { g.remove(m); ms.splice(i, 1); } } } }; },
};
SC.catalystDist = SC.maxwellcat;

/* ── 공개 함수 ── */
let curKey = null;
export function show(key) {
  if (key === curKey) return; curKey = key; ST = window.__chemState = { key }; scene.remove(ROOT); ROOT = new THREE.Group(); scene.add(ROOT); heatBits.length = 0; ui(); dragYaw = 0; dragPitch = 0;
  const fn = SC[key], u0 = fn ? fn(ROOT) : null; let dr = null; try { dr = dress(key, ROOT, scene); } catch (e) { console.error(e); }
  upd = (u0 || dr) ? (t, dt) => { if (u0) u0(t, dt); if (dr) dr(t); } : null;   /* 장면 + 병맛 종이 햄 */
  if (key === 'catalyst') { /* 촉매 절은 분포 곡선도 같이 */ }
}
export const has = k => !!SC[k];
let VIEW = { x: 0, y: 0 };
export function view(offX, offY) { VIEW = { x: offX, y: offY }; window.__chemCardMode = Math.abs(offX) > 20; resize(); }
function resize() { const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; cam.setViewOffset(w, h, VIEW.x, VIEW.y, w, h); cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
/* 끌어서 돌려 보기 */
let drag = null; cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; }); addEventListener('pointerup', () => drag = null);
addEventListener('pointermove', e => { if (!drag) return; dragYaw += (e.clientX - drag[0]) * .006; dragPitch = Math.max(-.6, Math.min(.6, dragPitch + (e.clientY - drag[1]) * .004)); drag = [e.clientX, e.clientY]; });
const clock = new THREE.Clock();
(function loop() { const dt = Math.min(.05, clock.getDelta()); T += dt; const d = 15; cam.position.set(Math.sin(dragYaw) * d * Math.cos(dragPitch), 1.5 + Math.sin(dragPitch) * d, Math.cos(dragYaw) * d * Math.cos(dragPitch)); cam.lookAt(0, .3, 0);
  if (upd) try { upd(T, dt); } catch (e) { console.error(e); upd = null; } stepHeat(dt); if (graphFn) try { graphFn(); } catch (e) { } R.render(scene, cam); requestAnimationFrame(loop); })();
window.__chemStage = { show, has };
