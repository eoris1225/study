/* 개념 설명용 3D 무대: 카드가 오른쪽에 있을 때 왼쪽 빈 공간(카메라 앞)에 개념별 3D 애니메이션 + 3D 친구 */
import * as THREE from 'three';
import { E, shake, sfx } from './engine.js?v=202611231432';

const ROOT = new THREE.Group(); ROOT.visible = false;
const STS = new THREE.Scene(); STS.add(new THREE.AmbientLight('#ffffff', 1.1)); { const d = new THREE.DirectionalLight('#ffffff', 1.6); d.position.set(3, 5, 8); STS.add(d); }
let built = false, cur = null, curKey = null, t0 = 0, T = 0, friend = null, talkUntil = 0, hopT = 0;
const pops = [];
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const M = (c, e = .35, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, emissive: c, emissiveIntensity: e, roughness: .45, metalness: .05 }, o));
const sph = (r, c, e) => new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M(c, e));
const box = (w, h, d, c, e) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, e));
const cyl = (r, h, c, e) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), M(c, e));
function tx(str, col = '#fff', size = .7, bg) { const cv = document.createElement('canvas'), x = cv.getContext('2d'); const f = '900 64px Noto Sans KR, sans-serif'; x.font = f; const w = Math.ceil(x.measureText(str).width) + 40; cv.width = w; cv.height = 96;
  x.font = f; x.textBaseline = 'middle'; x.lineJoin = 'round'; if (bg) { x.fillStyle = bg; x.beginPath(); x.roundRect ? x.roundRect(4, 8, w - 8, 80, 24) : x.rect(4, 8, w - 8, 80); x.fill(); }
  x.lineWidth = 12; x.strokeStyle = '#120c06'; x.strokeText(str, 20, 50); x.fillStyle = col; x.fillText(str, 20, 50);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false, transparent: true })); s.scale.set(size * 1.35 * w / 96, size * 1.35, 1); s.renderOrder = 10; return s; }
const at = (o, x, y, z = 0) => { o.position.set(x, y, z); return o; };
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = k => { k = cl(k); return k * k * (3 - 2 * k); };
/* 한 번 뜨는 만화 글씨 */
function pop(g, str, x, y, col = '#ffd23f', size = 1.1) { const s = tx(str, col, size); s.position.set(x, y, 1); s.userData = { life: 1.1, k: 0, base: s.scale.clone() }; g.add(s); pops.push(s); }
/* 반짝이 가루 */
function sparks(g, x, y, col = '#ffd23f', n = 18, sp = 4, inward = false) { for (let i = 0; i < n; i++) { const p = sph(.08 + Math.random() * .08, col, 2); const a = Math.random() * 6.28, b = Math.random() * 3.14, v = V(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b) * .4).multiplyScalar(sp * (.5 + Math.random()));
    p.userData = { v, life: .9, k: 0, inward, o: V(x, y, 0) }; p.position.set(x, y, 0).addScaledVector(inward ? v : V(), inward ? .45 : 0); g.add(p); pops.push(p); } }
/* 에너지 언덕 (반응물 r, 꼭대기 top, 생성물 p) — x -6 ~ 6 */
const hillY = (x, r, top, p) => { const b = r + (p - r) * sm((x + 1.5) / 3); return b + (top - (r + p) / 2) * Math.exp(-((x / 1.25) ** 2)); };
function hill(r, top, p, col, w = .16) { const pts = []; for (let i = 0; i <= 60; i++) { const x = -6 + i / 5; pts.push(V(x, hillY(x, r, top, p), 0)); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, w, 8), M(col, .8)); }
function bracket(g, x, y1, y2, col, lab) { const h = Math.abs(y2 - y1); const c = at(cyl(.06, h, col, 1.5), x, (y1 + y2) / 2); g.add(c); [y1, y2].forEach(y => g.add(at(box(.5, .06, .06, col, 1.5), x, y))); if (lab) g.add(at(tx(lab, col, .55), x + 1.4, (y1 + y2) / 2)); return c; }
function enzymeMesh(col = '#3fd88a') { const g = new THREE.Group(); const b = sph(1.3, col, .3); b.scale.set(1.25, 1, .8); g.add(b); const notch = box(.9, .9, 1.4, '#0a1a12', 0); notch.position.y = 1.05; g.add(notch); g.add(at(eyesOn(.35), 0, .1, 1)); return g; }
function eyesOn(s = .3) { const g = new THREE.Group(); [-1, 1].forEach(k => { const w = sph(s, '#ffffff', .6); w.position.x = k * s * 1.4; const p = sph(s * .5, '#111111', 0); p.position.set(k * s * 1.4, 0, s * .7); g.add(w, p); }); g.userData.eyes = true; return g; }
function carbon(n, col = '#8a96a6') { const g = new THREE.Group(); for (let i = 0; i < n; i++) { g.add(at(sph(.42, col, .25), (i - (n - 1) / 2) * 1, 0)); if (i) g.add(at(box(.6, .1, .1, '#cfe', .6), (i - .5 - (n - 1) / 2) * 1, 0)); } return g; }
function capsule(col, lab, w = 1.8) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CapsuleGeometry(.45, w - .9, 6, 14), M(col, .7)); c.rotation.z = Math.PI / 2; g.add(c); if (lab) g.add(at(tx(lab, '#fff', .45), 0, .85)); return g; }
function membrane(w, col = '#d9b25a') { const g = new THREE.Group(); g.add(box(w, .5, 1.2, col, .25)); for (let i = 0; i < w * 2; i++) { g.add(at(sph(.13, '#ffe3a0', .4), -w / 2 + .25 + i * .5, .3, .45)); g.add(at(sph(.13, '#ffe3a0', .4), -w / 2 + .25 + i * .5, -.3, .45)); } return g; }

/* ── 개념별 장면: (g) => 매 프레임 update(t, dt) ── */
const SC = {
  meta(g) { const big = new THREE.Group(); for (let i = 0; i < 6; i++) big.add(at(sph(.55, '#ffb3d0', .4), Math.cos(i) * .7, Math.sin(i * 1.7) * .6, 0)); g.add(big); const sm6 = [];
    for (let i = 0; i < 6; i++) { const s = sph(.55, '#ffb3d0', .4); g.add(s); sm6.push(s); }
    const L1 = at(tx('이화 작용 (분해)', '#ff8a6a', .6), 0, 3.6), L2 = at(tx('동화 작용 (합성)', '#7ab8ff', .6), 0, 3.6); g.add(L1, L2); let last = -1;
    return t => { const ph = t % 8, splitK = ph < 4 ? sm((ph - .8) / 1.4) : 1 - sm((ph - 4.8) / 1.4); L1.visible = ph < 4; L2.visible = ph >= 4; big.visible = splitK < .05;
      sm6.forEach((s, i) => { s.visible = !big.visible; const home = V(Math.cos(i) * .7, Math.sin(i * 1.7) * .6, 0), far = V(Math.cos(i * 1.05) * 4.2, Math.sin(i * 1.05) * 2.4, 0); s.position.lerpVectors(home, far, splitK); });
      const st = ph < 4 ? (ph > 2.2 ? 1 : 0) : (ph > 6.2 ? 2 : 0); if (st !== last) { last = st; if (st === 1) { sparks(g, 0, 0, '#ff9a3c', 26, 5); pop(g, '에너지 방출!', 0, -2.6, '#ff9a3c'); } if (st === 2) { sparks(g, 0, 0, '#7ab8ff', 26, 5, true); pop(g, '에너지 흡수!', 0, -2.6, '#7ab8ff'); } } }; },
  energy(g, o) { const r = o.r ?? 0, p = o.p ?? -2, top = o.top ?? 3.2, topE = o.topE ?? 1;
    g.add(at(box(.08, 7, .08, '#cfe', .5), -6.6, .3)); g.add(at(box(13, .08, .08, '#cfe', .5), 0, -3.2)); g.add(at(tx('에너지', '#cfe', .45), -6.2, 4)); g.add(at(tx('반응의 진행 →', '#cfe', .42), 4.8, -3.8));
    const H1 = hill(r, top, p, '#ff6a5a'); g.add(H1); let H2 = null; if (o.enz) { H2 = hill(r, topE, p, '#5ab8ff'); g.add(H2); g.add(at(tx('효소 있음', '#5ab8ff', .45), 0, topE + .9)); g.add(at(tx('효소 없음', '#ff8a7a', .45), 0, top + .7)); }
    g.add(at(tx('반응물', '#ffb3a0', .45), -4.6, r - .7)); g.add(at(tx('생성물', '#a0d8ff', .45), 4.6, p - .7));
    if (o.ea) bracket(g, -1.9, r, o.enz ? topE : top, '#ffd23f', o.enz ? '낮아진 활성화 에너지' : '활성화 에너지');
    if (o.dh) bracket(g, 5.6, r, p, '#c8a0ff', '반응열');
    const ball = sph(.42, '#ffd23f', 1.1); g.add(ball); let last = -1;
    return t => { const per = 5, ph = t % per, cyc = Math.floor(t / per); const lowRoad = o.enz; const tp = lowRoad ? topE : top;
      let x; if (!lowRoad && o.fail) { const k = ph < 2.2 ? sm(ph / 2.2) : 1 - sm((ph - 2.2) / 1.6); x = lerp(-5, -1.2, k); if (ph > 2.15 && ph < 2.3 && last !== cyc) { last = cyc; shake(.3); pop(g, '못 넘어!', -1, top + .6, '#ff6a5a', .9); sfx('bad'); } }
      else { x = lerp(-5, 5, sm(ph / 3.6)); if (ph > 3.6 && last !== cyc) { last = cyc; if (o.exo) { sparks(g, 5, p, '#ff9a3c', 30, 5); pop(g, '에너지 방출!', 3.6, p + 2, '#ff9a3c'); } else if (o.endo) { sparks(g, 5, p, '#7ab8ff', 30, 5, true); pop(g, '에너지 흡수!', 3.6, p + 2, '#7ab8ff'); } else pop(g, lowRoad ? '슝~ 쉽게 넘음!' : '넘었다!', 2.5, tp + .8, '#5affd0', .8); } }
      ball.position.set(x, hillY(x, r, tp, p) + .5, .2); ball.rotation.z -= .1; }; },
  es(g) { const enz = enzymeMesh(); g.add(at(enz, 0, -1.2)); g.add(at(tx('효소', '#5aff9a', .55), 0, -3.4)); const sub = box(.85, .85, .85, '#ffd23f', .8); g.add(sub); const halves = [box(.42, .85, .85, '#ffd23f', .8), box(.42, .85, .85, '#ffd23f', .8)]; halves.forEach(h => g.add(h));
    const wrong = new THREE.Mesh(new THREE.ConeGeometry(.6, 1, 3), M('#ff7a6a', .6)); g.add(wrong); let last = -1;
    return t => { const per = 6, ph = t % per, cyc = Math.floor(t / per);
      wrong.visible = ph < 1.8; if (ph < 1.8) { const k = ph < 1 ? sm(ph) : 1 - sm((ph - 1) / .8); wrong.position.set(lerp(-5, -.3, k), lerp(3, .3, k), 0); if (ph > .95 && last !== cyc * 3) { last = cyc * 3; pop(g, '모양이 안 맞아!', -2, 2.4, '#ff6a5a', .7); shake(.2); } }
      sub.visible = ph >= 1.8 && ph < 3.8; if (sub.visible) { const k = sm((ph - 1.8) / 1); sub.position.set(lerp(5, 0, k), lerp(3, -.1, k), 0); sub.rotation.y = (1 - k) * 4; if (ph > 2.8 && last !== cyc * 3 + 1) { last = cyc * 3 + 1; pop(g, '딸깍! 효소·기질 복합체', 0, 2.3, '#5affd0', .7); shake(.25); } }
      halves.forEach((h, i) => { h.visible = ph >= 3.8; const k = sm((ph - 3.8) / 1.2); h.position.set((i ? 1 : -1) * (.25 + k * 4), -.1 + k * 2.6, 0); h.rotation.z = (i ? -1 : 1) * k * 3; });
      if (ph > 3.8 && last !== cyc * 3 + 2) { last = cyc * 3 + 2; pop(g, '생성물! 효소는 그대로 재사용', 0, -4.4, '#ffd23f', .55); sparks(g, 0, -.1, '#ffd23f', 16, 3); } }; },
  gibil(g) { const enz = enzymeMesh(); g.add(at(enz, -3.2, -.8)); const s = at(box(.85, .85, .85, '#ffd23f', .8), -3.2, .4); g.add(s); g.add(at(tx('효소의 기질 = 반응물', '#ffd23f', .5), -3.2, -3));
    const mo = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 2.4, 8, 20), M('#ff9a50', .25, { transparent: true, opacity: .5 })); mo.rotation.z = Math.PI / 2; g.add(at(mo, 3.2, 0)); const inn = new THREE.Mesh(new THREE.CapsuleGeometry(1, 2, 8, 20), M('#ffd23f', .35, { transparent: true, opacity: .55 })); inn.rotation.z = Math.PI / 2; g.add(at(inn, 3.2, 0));
    g.add(at(tx('마이토콘드리아 기질 = 내막 안 공간', '#ffb070', .45), 3.2, -2.4)); return t => { s.position.y = .4 + Math.sin(t * 3) * .1; inn.scale.setScalar(1 + Math.sin(t * 2) * .03); }; },
  cof(g) { const enz = enzymeMesh('#7a8088'); g.add(at(enz, 0, -.6)); const slot = at(sph(.45, '#20262c', 0), 0, -1.8, .8); g.add(slot); const co = sph(.42, '#4aa8ff', 1); g.add(co); const L = at(tx('주효소 (단백질만) — 작동 X', '#c8ccd0', .5), 0, 2.4); g.add(L); let done = -1;
    return t => { const per = 5, ph = t % per, cyc = Math.floor(t / per); const k = sm((ph - .8) / 1.2); co.position.set(lerp(5, 0, k), lerp(-3.5, -1.8, k), .9); const on = ph > 2;
      enz.children[0].material.color.set(on ? '#3fd88a' : '#7a8088'); enz.children[0].material.emissive.set(on ? '#3fd88a' : '#7a8088'); L.visible = !on;
      if (on && done !== cyc) { done = cyc; pop(g, '찰칵! 전효소 = 주효소 + 보조 인자', 0, 2.4, '#5affd0', .55); sparks(g, 0, -.6, '#5affd0', 24, 4); shake(.2); } }; },
  kinds(g) { const a = sph(.8, '#ffb3d0', .4), b = sph(.8, '#ffb3d0', .4), bond = box(.7, .15, .15, '#fff', 1); g.add(a, b, bond); const w = sph(.35, '#5ac8ff', 1); g.add(w); const atp = sph(.45, '#ffd23f', 1.2); g.add(atp);
    const L = at(tx('', '#fff', .5), 0, 2.6); g.add(L); let st = -1; const setL = s => { g.remove(L); const n = at(tx(s, '#fff', .55), 0, 2.6); g.add(n); return n; }; let lab = L;
    return t => { const per = 8, ph = t % per; const sep = ph < 1.5 ? 0 : ph < 4 ? sm((ph - 1.5) / .6) : 1 - sm((ph - 5.5) / .8);
      a.position.set(-1 - sep * 1.4, 0, 0); b.position.set(1 + sep * 1.4, 0, 0); bond.visible = sep < .1;
      w.visible = ph < 1.6; w.position.set(0, lerp(4, .2, sm(ph / 1.4)), .6); atp.visible = ph > 4 && ph < 5.6; atp.position.set(0, lerp(-4, 0, sm((ph - 4) / 1.4)), .6);
      const s = ph < 4 ? 0 : 1; if (s !== st) { st = s; lab = (g.remove(lab), at(tx(s ? 'ATP 써서 붙이기 = 연결 효소' : '물 넣어 쪼개기 = 가수 분해 효소', s ? '#ffd23f' : '#5ac8ff', .55), 0, 2.6)); g.add(lab); }
      if (ph > 1.45 && ph < 1.52) { pop(g, '쪼갬!', 0, 1.3, '#5ac8ff', .8); shake(.15); } if (ph > 5.45 && ph < 5.52) { pop(g, '붙임!', 0, 1.3, '#ffd23f', .8); sparks(g, 0, 0, '#ffd23f', 14, 3); } }; },
  tph(g) { const enz = enzymeMesh(); g.add(at(enz, -1.4, -.4)); const th = at(cyl(.22, 6, '#ffffff', .2), 3.6, 0); th.material.transparent = true; th.material.opacity = .3; g.add(th); const merc = cyl(.16, 1, '#ff4a3a', 1.2); g.add(merc);
    const lab = at(tx('최적 온도', '#5affd0', .5), 3.6, 3.6); g.add(lab); let last = -1;
    return t => { const per = 7, ph = t % per, cyc = Math.floor(t / per), temp = cl(ph / 5.5); merc.scale.y = .2 + temp * 5.6; merc.position.set(3.6, -3 + merc.scale.y / 2, 0);
      const melt = cl((temp - .6) / .35); enz.scale.set(1 + melt * .5, 1 - melt * .55, 1); enz.rotation.z = Math.sin(t * (4 + temp * 20)) * (.05 + temp * .15);
      enz.children[0].material.color.setHSL(.38 - melt * .38, .6, .5); enz.children[0].material.emissive.copy(enz.children[0].material.color);
      if (melt > .9 && last !== cyc) { last = cyc; pop(g, '으아아 변성!! 모양 망가짐', -1.4, 2.4, '#ff6a5a', .65); shake(.3); } }; },
  sat(g) { const E5 = []; for (let i = 0; i < 4; i++) { const e = enzymeMesh(); e.scale.setScalar(.55); g.add(at(e, -4.5 + i * 3, -2.3)); E5.push(e); } const S = []; for (let i = 0; i < 16; i++) { const s = box(.4, .4, .4, '#ffd23f', .8); g.add(s); S.push(s); }
    const lab = at(tx('', '#fff'), 0, 3.4); g.add(lab); let ll = lab, st = -1;
    return t => { const per = 9, ph = t % per, n = Math.floor(cl(ph / 6) * 16); S.forEach((s, i) => { s.visible = i < n; const slot = i % 4, lvl = Math.floor(i / 4); s.position.set(-4.5 + slot * 3 + Math.sin(t * 2 + i) * .1, -1.45 + lvl * .7 + (lvl ? .4 : 0), .5); });
      const k = n >= 4 ? 1 : 0; if (k !== st) { st = k; g.remove(ll); ll = at(tx(k ? '효소가 다 찼다 → 속도 일정 (포화)' : '기질이 늘수록 빨라져요', k ? '#ff9a3c' : '#5affd0', .55), 0, 3.4); g.add(ll); if (k) { pop(g, '꽉 참!', 0, 1.6, '#ff9a3c'); shake(.15); } } }; },
  inh(g) { const e1 = enzymeMesh(), e2 = enzymeMesh(); g.add(at(e1, -3.2, -.8), at(e2, 3.2, -.8)); g.add(at(tx('경쟁적 억제제', '#ff7a6a', .5), -3.2, -3.1), at(tx('비경쟁적 억제제', '#c8a0ff', .5), 3.2, -3.1));
    const ci = box(.85, .85, .85, '#ff5a5a', .8); g.add(ci); const nc = sph(.5, '#c8a0ff', 1); g.add(nc); const sub = box(.85, .85, .85, '#ffd23f', .8); g.add(sub); let l1 = -1;
    return t => { const per = 6, ph = t % per, cyc = Math.floor(t / per), k = sm(ph / 1.4); ci.position.set(-3.2, lerp(4, .3, k), 0); nc.position.set(lerp(6.5, 4.6, k), lerp(-3, -1.4, k), .6);
      e2.children[1].rotation.z = sm((ph - 1.4) / .6) * .7; e2.children[1].scale.x = 1 - sm((ph - 1.4) / .6) * .4; sub.visible = ph > 2.2; const k2 = sm((ph - 2.2) / 1.2); sub.position.set(lerp(0, 3.2, k2), lerp(3.5, 1.3, k2), 0);
      if (ph > 1.4 && l1 !== cyc) { l1 = cyc; pop(g, '자리 뺏음!', -3.2, 2.3, '#ff7a6a', .7); pop(g, '모양 찌그러뜨림!', 3.2, 2.3, '#c8a0ff', .7); shake(.2); } if (ph > 3.4 && ph < 3.47) pop(g, '안 들어가!', 3.2, 3.2, '#ffd23f', .6); }; },
  atp(g) { const ad = at(box(1.4, 1.1, .8, '#7a8aff', .4), -4.4, 0), ri = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .5, 5), M('#5af0aa', .4)); ri.rotation.x = Math.PI / 2; at(ri, -2.6, 0); g.add(ad, ri);
    g.add(at(tx('아데닌', '#fff', .4), -4.4, -1), at(tx('리보스', '#fff', .4), -2.6, -1)); const P = [0, 1, 2].map(i => at(sph(.5, '#ff9a3c', .6), -.9 + i * 1.6, 0)); P.forEach(p => g.add(p)); [-1.75, -.1].forEach(x => g.add(at(box(.6, .12, .12, '#cfe', .5), x, 0)));
    const bond = box(.9, .2, .2, '#ffd23f', 3); g.add(at(bond, 1.5, 0)); const glow = sph(.9, '#ffd23f', 2); glow.material.transparent = true; glow.material.opacity = .25; g.add(at(glow, 1.5, 0)); const L = at(tx('⚡ 고에너지 인산 결합 ⚡', '#ffd23f', .55), 1.5, 1.6); g.add(L); let snapped = -1;
    return t => { const per = 6, ph = t % per, cyc = Math.floor(t / per); const pull = ph < 2 ? 0 : ph < 3.4 ? sm((ph - 2) / 1.4) : 0; const gone = ph >= 3.4 && ph < 5.6;
      P[2].position.set(2.3 + pull * 1.6 + (gone ? sm((ph - 3.4) / .5) * 4 : 0), (gone ? sm((ph - 3.4) / .5) * 1.5 : 0) + (pull ? (Math.random() - .5) * pull * .2 : 0), 0);
      bond.visible = !gone; bond.scale.set(1 + pull * 2.2, 1 - pull * .7, 1 - pull * .7); bond.position.x = 1.5 + pull * .8; glow.visible = !gone; glow.scale.setScalar(1 + Math.sin(t * 12) * .15 + pull); bond.material.emissiveIntensity = 2 + Math.sin(t * 20) * 1.2;
      L.visible = !gone && pull < .1; if (pull > .2 && Math.random() < .3) { shake(.05 + pull * .1); } if (pull > .3 && Math.floor(ph * 6) % 3 === 0 && Math.random() < .2) pop(g, '으' + '어'.repeat(2 + Math.floor(pull * 6)) + '억', 1.5, 2.2, '#ffe9a0', .6 + pull * .4);
      if (gone && snapped !== cyc) { snapped = cyc; shake(.9); sfx('boom'); sparks(g, 1.8, 0, '#ffd23f', 50, 7); sparks(g, 1.8, 0, '#ffffff', 20, 5); pop(g, '뚝!!!', 1.6, 1.8, '#ff5a3a', 2); setTimeout(() => pop(g, 'ADP + Pᵢ + 에너지!!', 1.5, -2.2, '#ffd23f', .8), 300); } }; },
  redox(g) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, .5, 6), M('#ffb3d0', .35)); gl.rotation.x = Math.PI / 2; g.add(at(gl, -3.2, 0)); g.add(at(tx('포도당', '#fff', .45), -3.2, -1.8));
    const nad = capsule('#8fb8ff', 'NAD⁺'); g.add(at(nad, 3, 0)); const H = sph(.3, '#ffffff', 1.2); g.add(H); let last = -1, lab = null;
    return t => { const per = 4, ph = t % per, cyc = Math.floor(t / per), k = sm((ph - .5) / 1.6); H.position.set(lerp(-2, 3, k), Math.sin(k * Math.PI) * 2.4, .4); H.visible = ph < 2.2;
      if (ph > 2.1 && last !== cyc) { last = cyc; pop(g, '포도당: 산화됨 (수소 잃음)', -3.2, 2.2, '#ffb3d0', .55); pop(g, 'NAD⁺ → NADH 환원됨!', 3, 2.2, '#7ab8ff', .55); nad.children[0].material.color.set('#2a6aff'); sparks(g, 3, 0, '#7ab8ff', 16, 3); }
      if (ph < .3) nad.children[0].material.color.set('#8fb8ff'); }; },
  resp(g) { const st = [['해당 과정', '세포질', '#ffb3d0'], ['피루브산 산화', '기질', '#ffd23f'], ['TCA 회로', '기질', '#9ccf6a'], ['산화적 인산화', '내막', '#5af0ff']];
    st.forEach(([a, b, c], i) => { const x = -5 + i * 3.4; g.add(at(box(2.6, 1.3, .6, c, .35), x, 0)); g.add(at(tx(a, '#120c06', .4), x, .15, .4)); g.add(at(tx(b, c, .4), x, -1.2)); if (i) g.add(at(box(.6, .12, .12, '#fff', .8), x - 1.7, 0)); });
    const m = sph(.35, '#ffffff', 1.5); g.add(m); return t => { const k = (t % 6) / 6; const x = -5 + k * 3 * 3.4; m.position.set(x, .95 + Math.abs(Math.sin(k * 18)) * .4, .4); }; },
  mito(g) { const W = 4.6, H = 2.3;
    const shell = (rx, ry, col, op, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .35, transparent: true, opacity: op, roughness: .5 })); m.scale.set(rx, ry, .9); m.position.z = z; return m; };
    g.add(shell(W + .5, H + .5, '#ff8a3a', .55, -.6), shell(W + .2, H + .2, '#ffc8a0', .5, -.4), shell(W, H, '#ffd23f', .95, -.2), shell(W - .3, H - .3, '#3a6aa8', 1, 0));
    for (let i = 0; i < 7; i++) { const x = -3.3 + i * 1.1, up = i % 2 === 0, h = 2.4; const c = box(.28, h, .3, '#ffd23f', .7); g.add(at(c, x, up ? H - .3 - h / 2 : -(H - .3) + h / 2, .1)); }
    const L = (s2, x, y, lx, ly, col) => { g.add(at(tx(s2, col, .5, '#120c06cc'), lx, ly, 1)); g.add(at(box(.04, .04, .04, col, 1), x, y, .5)); const d = V(x - lx, y - ly, 0); const ln = box(d.length(), .06, .06, col, 1.2); ln.position.set((x + lx) / 2, (y + ly) / 2, .5); ln.rotation.z = Math.atan2(d.y, d.x); g.add(ln); };
    L('외막', -W - .4, .8, -6.3, 2.6, '#ff9a5a'); L('막사이공간', W + .1, .9, 5.8, 3, '#ffc8a0'); L('내막 (주름 = 크리스타)', -1.1, -H + .1, -3.4, -3.6, '#ffd23f'); L('기질 (TCA 회로)', 1, 0, 4.4, -3.4, '#8ac8ff');
    return t => { g.rotation.y = Math.sin(t * .5) * .25; }; },
  endo(g) { const host = sph(3.2, '#16323e', .2); host.material.transparent = true; host.material.opacity = .35; g.add(host); const bac = new THREE.Mesh(new THREE.CapsuleGeometry(.6, 1.2, 8, 16), M('#ff9a5a', .4)); bac.rotation.z = Math.PI / 2; g.add(bac);
    const wrap = new THREE.Mesh(new THREE.CapsuleGeometry(.78, 1.2, 8, 16), M('#7fd0e0', .3, { transparent: true, opacity: .35 })); wrap.rotation.z = Math.PI / 2; g.add(wrap); const dna = new THREE.Mesh(new THREE.TorusGeometry(.25, .05, 8, 24), M('#ff5aa8', 1.2)); g.add(dna); let last = -1;
    return t => { const per = 7, ph = t % per, cyc = Math.floor(t / per), k = sm(ph / 2); bac.position.set(lerp(6, .5, k), 0, 0); wrap.position.copy(bac.position); wrap.visible = ph > 2.2; dna.position.copy(bac.position).add(V(0, 0, .7));
      if (ph > 2.2 && last !== cyc) { last = cyc; pop(g, '꿀꺽! 이중막 완성', 0, 3.8, '#7fd0e0', .7); } if (ph > 4.5) { const d = sm((ph - 4.5) / 1); bac.scale.set(1 + d * .3, 1, 1); } else bac.scale.set(1, 1, 1); if (ph > 4.4 && ph < 4.47) pop(g, '자기 DNA로 스스로 분열!', 0, -3.8, '#ff9ad0', .6); }; },
  glyC(g) { const c6 = carbon(6, '#ffb3d0'); g.add(c6); const A = carbon(3, '#ffd23f'), B = carbon(3, '#ffd23f'); g.add(A, B); const lab = at(tx('포도당 (C₆)', '#ffb3d0', .55), 0, 1.8); g.add(lab); let last = -1;
    return t => { const per = 6, ph = t % per, cyc = Math.floor(t / per), k = sm((ph - 2) / 1); c6.visible = ph < 2; A.visible = B.visible = !c6.visible; A.position.set(-1.5 - k * 1.2, k * 1.4, 0); B.position.set(1.5 + k * 1.2, -k * 1.4, 0);
      if (ph > 2 && last !== cyc) { last = cyc; pop(g, '싹둑!! 피루브산(C₃) × 2', 0, 2.8, '#ffd23f', .8); shake(.3); sparks(g, 0, 0, '#ffd23f', 20, 4); } c6.position.y = Math.sin(t * 6) * .05 * (ph > 1.2 ? 4 : 0); }; },
  pyrC(g) { const c = carbon(3, '#ffd23f'); g.add(c); const co2 = sph(.5, '#c0c8d0', .6); g.add(co2); const coa = at(box(1.2, .8, .6, '#c08aff', .6), 0, 0); g.add(coa); let last = -1;
    return t => { const per = 6, ph = t % per, cyc = Math.floor(t / per); c.children.forEach((m, i) => { if (i === 4) m.visible = ph < 1.5; }); const k = sm((ph - 1.5) / 1.5); co2.visible = ph > 1.5; co2.position.set(1 + k * 3, k * 3, 0);
      coa.visible = ph > 3.4; coa.position.set(lerp(5, -2.2, sm((ph - 3.4) / .8)), 0, 0); if (ph > 1.5 && last !== cyc) { last = cyc; pop(g, '뽁! CO₂ 탈출 (탈탄산)', 2, 2.5, '#e0e8f0', .7); shake(.2); } if (ph > 4.2 && ph < 4.27) pop(g, '아세틸 CoA (C₂) · ATP는 0개!', 0, -2, '#c08aff', .6); }; },
  tcaC(g) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, .2, 12, 60), M('#ffd23f', .5)); g.add(ring); const nodes = []; for (let i = 0; i < 4; i++) { const n = sph(.5, '#8a96a6', .3); g.add(n); nodes.push(n); } g.add(at(tx('TCA 회로', '#ffd23f', .6), 0, 0));
    const outs = [['CO₂', '#c0c8d0'], ['NADH', '#4aa8ff'], ['CO₂', '#c0c8d0'], ['NADH', '#4aa8ff'], ['ATP', '#ffd23f'], ['FADH₂', '#47e38a'], ['NADH', '#4aa8ff']]; let last = -1;
    return t => { ring.rotation.z = -t * .6; nodes.forEach((n, i) => { const a = -t * .6 + i * Math.PI / 2; n.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, .2); }); const s = Math.floor(t / .9); if (s !== last) { last = s; const [str, col] = outs[s % outs.length]; const a = -t * .6; pop(g, str, Math.cos(a) * 4, Math.sin(a) * 3.4, col, .7); } }; },
  elev(g) { const lv = [['NADH', 3], ['Ⅰ', 2.2], ['Q', 1.2], ['Ⅲ', .4], ['c', -.6], ['Ⅳ', -1.6], ['O₂', -3]]; lv.forEach(([s, y], i) => { g.add(at(box(1.5, .25, 1, i === 6 ? '#ff5a5a' : '#5aa8ff', .5), -5 + i * 1.65, y)); g.add(at(tx(s, '#fff', .45), -5 + i * 1.65, y + .6)); });
    const e = sph(.32, '#7ff8ff', 1.8); g.add(e); g.add(at(tx('전자: 높은 에너지 → 낮은 에너지', '#7ff8ff', .5), 0, 4)); let last = -1;
    return t => { const per = 5, ph = t % per, k = ph / 4.2, i = Math.min(5, Math.floor(k * 6)), f = k * 6 - i; const [, y0] = lv[i], [, y1] = lv[Math.min(6, i + 1)]; e.position.set(-5 + (i + f) * 1.65, lerp(y0, y1, sm(f)) + .45 + Math.sin(f * Math.PI) * .6, .4);
      if (i !== last) { last = i; if (i === 1 || i === 3 || i === 5) pop(g, 'H⁺ 퍼 올림!', -5 + i * 1.65, lv[i][1] + 1.6, '#ff5a8a', .5); } if (ph > 4.2 && ph < 4.27) { pop(g, 'O₂ + e⁻ + H⁺ → H₂O', 4.9, -1.6, '#ff8a8a', .55); sparks(g, 4.9, -3, '#5ac8ff', 14, 3); } }; },
  mem(g) { g.add(at(membrane(12), 0, 0)); g.add(at(tx('막사이공간 (H⁺ 많음)', '#ff8aa8', .45), -3.4, 3.6), at(tx('기질', '#ffe9a0', .45), -4.6, -3.4)); const syn = new THREE.Group(); syn.add(cyl(.45, 2, '#c8a0ff', .5)); const rot = new THREE.Mesh(new THREE.TorusGeometry(.8, .22, 8, 20), M('#a080ff', .6)); rot.position.y = -1.6; syn.add(rot); g.add(at(syn, 4, 0));
    const H = []; for (let i = 0; i < 14; i++) { const h = sph(.18, '#ff5a8a', 1.4); g.add(h); H.push(h); } let last = -1;
    return t => { rot.rotation.z = t * 6; H.forEach((h, i) => { const k = ((t * .35 + i / 14) % 1); if (i % 2) h.position.set(-4 + (i % 5) * 1.2, lerp(-2.4, 2.6, sm(k * 2)), .7); else h.position.set(4 + Math.sin(i) * .2, lerp(2.4, -2.6, k), .9); });
      const s = Math.floor(t / 1.4); if (s !== last) { last = s; pop(g, s % 2 ? 'ATP 뿅!' : '뺑글뺑글 (화학 삼투)', 4, -3.2, s % 2 ? '#ffd23f' : '#c8a0ff', .55); if (s % 2) sparks(g, 4, -2.2, '#ffd23f', 10, 2.5); } }; },
  ferm(g) { const wheel = new THREE.Mesh(new THREE.TorusGeometry(1.4, .25, 10, 40), M('#ffb3d0', .4)); g.add(at(wheel, -3, 0)); g.add(at(tx('해당 과정', '#ffb3d0', .45), -3, -2.2));
    const sh = capsule('#8fb8ff', 'NAD⁺', 1.4); g.add(sh); g.add(at(tx('발효 = NAD⁺ 재생!', '#5affd0', .6), 0, 3.6)); const lac = at(sph(.6, '#ffe9a0', .6), 3.4, 0); g.add(lac); g.add(at(tx('피루브산 → 젖산', '#ffe9a0', .45), 3.4, -1.4));
    return t => { wheel.rotation.z = -t * 2; const k = (t % 3) / 3; const a = k * Math.PI * 2; sh.position.set(Math.cos(a) * 3.2, Math.sin(a) * 1.6, .5); const nadh = Math.sin(a) < 0; sh.children[0].material.color.set(nadh ? '#2a6aff' : '#8fb8ff'); }; },
  photoAll(g) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 12), M('#3fdc5a', .3)); leaf.scale.set(1.6, .6, .5); g.add(leaf); const sun = at(sph(.8, '#ffe066', 2), -5, 3.4); g.add(sun);
    g.add(at(tx('6CO₂ + 12H₂O → 포도당 + 6O₂ + 6H₂O', '#b8ff7a', .5), 0, -3)); const ins = ['CO₂', 'H₂O'].map((s, i) => { const o = at(tx(s, '#c0e8ff', .5), 0, 0); g.add(o); return o; }), outs = ['포도당', 'O₂'].map(s => { const o = at(tx(s, '#ffd23f', .5), 0, 0); g.add(o); return o; });
    const rays = []; for (let i = 0; i < 4; i++) { const r = box(3.6, .07, .07, '#ffe066', 2); g.add(r); rays.push(r); }
    return t => { rays.forEach((r, i) => { const k = (t * .8 + i / 4) % 1; r.position.set(lerp(-4.2, -1, k), lerp(2.8, .6, k) + i * .2, .3); r.rotation.z = -.6; });
      ins.forEach((o, i) => { const k = (t * .4 + i * .5) % 1; o.position.set(lerp(5.5, 1.2, k), lerp(2 - i * 3, 0, k), .5); }); outs.forEach((o, i) => { const k = (t * .4 + .25 + i * .5) % 1; o.position.set(lerp(1.5, 5.5, k), lerp(0, -1.8 + i * 3.4, k), .5); }); }; },
  chlS(g) { const o = sph(3, '#3fdc5a', .2); o.scale.set(1.5, .9, .6); o.material.transparent = true; o.material.opacity = .3; g.add(o); for (let s = 0; s < 3; s++) for (let j = 0; j < 5; j++) g.add(at(cyl(.6, .2, '#2aa84a', .5), -2.4 + s * 2.4, -1 + j * .35));
    [['그라나 (타이라코이드 쌓임)', 0, 1.9, '#b8ff9a'], ['스트로마', 2.8, -1.8, '#e0ffd0'], ['이중막', -3.8, 2.6, '#9affb0']].forEach(([s, x, y, c]) => g.add(at(tx(s, c, .45), x, y, 2))); return t => { g.rotation.y = Math.sin(t * .6) * .6; }; },
  ps(g) { const ring = []; for (let i = 0; i < 10; i++) { const p = sph(.3, '#3fdc5a', .6); g.add(p); ring.push(p); } const rc = sph(.55, '#b8ff7a', 1.5); g.add(rc); g.add(at(tx('반응 중심 (P680 / P700)', '#b8ff7a', .45), 0, -1.1), at(tx('집광 복합체: 빛을 모아 전달', '#9affb0', .45), 0, 3.2));
    const e = sph(.25, '#7ff8ff', 2); g.add(e); const sun = sph(.6, '#ffe066', 2); g.add(at(sun, -5, 2.8)); let last = -1;
    return t => { ring.forEach((p, i) => { const a = i / 10 * 6.28 + t * .3; p.position.set(Math.cos(a) * 2.4, Math.sin(a) * 1.5, 0); p.material.emissiveIntensity = .6 + Math.max(0, Math.sin(t * 6 - i)) * 2; }); const ph = t % 3, k = ph > 1.8 ? sm((ph - 1.8) / .8) : 0; e.position.set(k * 3.5, .4 + k * 3, .5); e.visible = ph > 1.8;
      const c = Math.floor(t / 3); if (ph > 1.8 && last !== c) { last = c; pop(g, '전자 발사!', 2.4, 2.4, '#7ff8ff', .6); } }; },
  spec(g) { const prism = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.6, 3), M('#ffffff', .4, { transparent: true, opacity: .4 })); prism.rotation.x = Math.PI / 2; g.add(at(prism, -3.5, 0)); g.add(at(box(3, .08, .08, '#ffffff', 2), -6, 0));
    const cols = ['#7a3fff', '#3f6fff', '#3fd06a', '#ffe03f', '#ff9a3f', '#ff3f3f'], rays = cols.map((c, i) => { const r = box(5, .14, .14, c, 2); r.rotation.z = (i - 2.5) * .08; g.add(at(r, -.6, (i - 2.5) * .2)); return r; });
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 10), M('#3fdc5a', .4)); leaf.scale.set(.4, 1.6, 1); g.add(at(leaf, 2.4, 0)); const refl = at(box(3, .14, .14, '#3fd06a', 2.5), 3.6, 1.8); refl.rotation.z = .6; g.add(refl);
    g.add(at(tx('청자색·적색 꿀꺽! 초록은 퉤 (반사)', '#b8ff7a', .5), 0, 3)); return t => { refl.material.emissiveIntensity = 1.5 + Math.sin(t * 6); leaf.scale.y = 1.6 + Math.sin(t * 5) * .05; }; },
  rf(g) { const paper = at(box(1.6, 7, .1, '#f4f0e6', .2), 0, 0); g.add(paper); const sol = at(box(1.62, 1, .12, '#5ac8ff', .5), 0, -3.2); g.add(sol); const bands = [['카로틴', .95, '#ffb000'], ['엽록소 a', .68, '#2aa87a'], ['엽록소 b', .54, '#9acd32'], ['잔토필', .46, '#ffe14a']].map(([n, rf, c]) => { const b = box(1.3, .28, .14, c, .8); g.add(b); const l = tx(n, c, .4); g.add(l); return [b, l, rf]; });
    const front = box(1.64, .06, .14, '#4a8aff', 1); g.add(front); return t => { const k = sm((t % 7) / 5), o = -2.6, fy = o + k * 5.8; sol.scale.y = 1; front.position.set(0, fy, .05); bands.forEach(([b, l, rf]) => { b.position.set(0, o + rf * (fy - o), .08); l.position.set(2, b.position.y, .1); }); }; },
  z(g) { const pts = [[-5, -2, 'P680'], [-4.4, 2.6, 'P680*'], [-2.6, 1.4, ''], [-1, .2, ''], [.6, -1.2, 'P700'], [1.2, 3.2, 'P700*'], [3, 2.2, ''], [4.8, 1.2, 'NADP⁺']];
    pts.forEach(([x, y, s], i) => { g.add(at(box(.9, .3, .4, s.startsWith('P') ? '#3fdc5a' : '#5ab8ff', .6), x, y)); if (s) g.add(at(tx(s, '#fff', .38), x, y + .5)); }); g.add(at(tx('Z 도식: 빛을 두 번 받아 점프!', '#ffe066', .5), 0, 4.2));
    const e = sph(.3, '#7ff8ff', 2); g.add(e); const w = at(tx('H₂O → O₂', '#7ab8ff', .45), -5.4, -3); g.add(w); let last = -1;
    return t => { const per = 6, k = (t % per) / per * 7, i = Math.min(6, Math.floor(k)), f = k - i; const a = pts[i], b = pts[i + 1]; e.position.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f) + .4, .3);
      if (i !== last) { last = i; if (i === 0) { pop(g, '☀ 빛! 점프!', -4.6, 3.6, '#ffe066', .6); sparks(g, -5, -2, '#7ab8ff', 10, 2); } if (i === 4) pop(g, '☀ 한 번 더 점프!', 1, 4, '#ffe066', .6); if (i === 6) pop(g, 'NADPH 완성', 4.4, 2.2, '#9aaaff', .55); } }; },
  chl(g) { g.add(at(membrane(12, '#3aa84a'), 0, 0)); g.add(at(tx('스트로마 (H⁺ 적음)', '#e0ffd0', .45), -3.6, 3.4), at(tx('타이라코이드 내부 (H⁺ 많음)', '#ff8aa8', .45), -2.8, -3.4)); const syn = new THREE.Group(); syn.add(cyl(.45, 2, '#c8a0ff', .5)); const rot = new THREE.Mesh(new THREE.TorusGeometry(.8, .22, 8, 20), M('#a080ff', .6)); rot.position.y = 1.6; syn.add(rot); g.add(at(syn, 4, 0));
    const H = []; for (let i = 0; i < 12; i++) { const h = sph(.18, '#ff5a8a', 1.4); g.add(h); H.push(h); } return t => { rot.rotation.z = -t * 6; H.forEach((h, i) => { const k = ((t * .35 + i / 12) % 1); if (i % 2) h.position.set(-4 + (i % 5) * 1.2, lerp(2.4, -2.6, sm(k * 2)), .7); else h.position.set(4, lerp(-2.4, 2.6, k), .9); }); }; },
  exp(g) { const fl = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.8, 3, 20, 1, true), M('#9fe8ff', .2, { transparent: true, opacity: .3, side: THREE.DoubleSide })); g.add(at(fl, 0, -.8)); const liq = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 1.6, 20), M('#3fdc5a', .4)); g.add(at(liq, 0, -1.5));
    const B = []; for (let i = 0; i < 10; i++) { const b = sph(.15, '#ffffff', 1); g.add(b); B.push(b); } g.add(at(tx('빛 → O₂ 보글보글', '#b8ff7a', .55), 0, 2.6)); return t => { B.forEach((b, i) => { const k = (t * .6 + i / 10) % 1; b.position.set(Math.sin(i * 3) * .9, -2 + k * 3.4, .4); }); }; },
  calvin(g) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, .22, 12, 60), M('#8aff6a', .5)); g.add(ring); const st = [['RuBP', 90, '#8aff6a'], ['3PG', -30, '#ffd23f'], ['PGAL', 210, '#ff8aae']]; st.forEach(([s, a, c]) => { const r = a * Math.PI / 180; g.add(at(sph(.6, c, .6), Math.cos(r) * 2.6, Math.sin(r) * 2.6)); g.add(at(tx(s, c, .45), Math.cos(r) * 3.9, Math.sin(r) * 3.6)); });
    const co2 = at(tx('CO₂', '#c0c8d0', .55), 0, 0); g.add(co2); const out = at(tx('포도당!', '#ffd23f', .6), 0, 0); g.add(out); g.add(at(tx('캘빈 회로 (스트로마)', '#8aff6a', .5), 0, 0)); let last = -1;
    return t => { ring.rotation.z = t * .5; const k = (t % 4) / 4; co2.position.set(lerp(5.5, 2.2, sm(k * 1.5)), lerp(3, 1.4, sm(k * 1.5)), .5); co2.visible = k < .7; out.position.set(lerp(-2.4, -5.5, sm((k - .5) * 2)), lerp(-1.4, -3, sm((k - .5) * 2)), .5); out.visible = k > .5;
      const c = Math.floor(t / 4); if (k > .3 && last !== c) { last = c; pop(g, '탄소 고정! (루비스코)', 2, 3.4, '#ffd23f', .55); } }; },
  cmp(g) { const a = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 2.2, 8, 20), M('#ff9a50', .4)); a.rotation.z = Math.PI / 2; g.add(at(a, -3.2, .5)); const b = sph(1.6, '#3fdc5a', .4); b.scale.set(1.5, .9, .6); g.add(at(b, 3.2, .5));
    g.add(at(tx('세포호흡: 이화 · O₂ 받음', '#ffb070', .45), -3.2, -1.6), at(tx('광합성: 동화 · NADP⁺ 받음', '#9affb0', .45), 3.2, -1.6), at(tx('공통: 전자전달계 + ATP 합성 효소', '#ffd23f', .5), 0, 3.4));
    const arr = [0, 1].map(i => { const r = box(2.2, .1, .1, i ? '#3fdc5a' : '#ff9a50', 1.5); g.add(r); return r; }); return t => { arr[0].position.set(0, 1 + Math.sin(t * 3) * .1, 0); arr[1].position.set(0, 0 - Math.sin(t * 3) * .1, 0); }; },
  subs(g) { const F = [['녹말', '#ffb3d0'], ['지방', '#ffe9a0'], ['단백질', '#c08aff']].map(([s, c], i) => { const o = new THREE.Group(); for (let j = 0; j < 4; j++) o.add(at(sph(.4, c, .5), (j % 2) * .7, Math.floor(j / 2) * .7)); g.add(at(o, -5, 2.4 - i * 2.2)); g.add(at(tx(s, c, .42), -5.6, 1.6 - i * 2.2)); return o; });
    const fun = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 20, 1, true), M('#5af0ff', .3, { transparent: true, opacity: .4, side: THREE.DoubleSide })); fun.rotation.z = Math.PI; g.add(at(fun, 3, .6)); g.add(at(tx('세포호흡 → ATP', '#5af0ff', .5), 3, -1.6));
    return t => { F.forEach((o, i) => { const k = ((t * .3 + i / 3) % 1); o.children.forEach((s, j) => { s.position.set((j % 2) * .7 + k * (7 + j * .3), Math.floor(j / 2) * .7 - k * (2.4 - i * 2.2 - .6) * (k > .6 ? 1 : .8), 0); }); }); }; }
};
const ALIAS = { ea: ['energy', { fail: true, ea: true }], eaE: ['energy', { enz: true, ea: true }], calc: ['energy', { enz: true, ea: true, dh: true }], dh: ['energy', { dh: true }], exo: ['energy', { exo: true, dh: true }], endoE: ['energy', { endo: true, dh: true, p: 2, top: 4, topE: 3 }],
  nad: ['redox'], glyPath: ['glyC'], count: ['tcaC'], es: ['es'], photoAll: ['photoAll'], chlS: ['chlS'] };

/* ── 3D 친구 ── */
function makeFriend(col) { const g = new THREE.Group(); const body = sph(1, col, .35); body.scale.set(1.05, 1, .9); g.add(body); const eyes = eyesOn(.26); eyes.position.set(0, .2, .82); g.add(eyes);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.22, .06, 8, 16, Math.PI), M('#2a0a0a', 0)); mouth.rotation.z = Math.PI; mouth.position.set(0, -.3, .9); g.add(mouth);
  const arms = [-1, 1].map(k => { const a = new THREE.Group(); const c = new THREE.Mesh(new THREE.CapsuleGeometry(.14, .7, 4, 8), M(col, .35)); c.position.y = -.45; a.add(c); a.position.set(k * 1, -.05, 0); g.add(a); return a; });
  g.userData = { body, eyes, mouth, arms }; return g; }
function stepFriend(t, dt) { if (!friend) return; const u = friend.userData; const blink = (t % 3.4) < .12; u.eyes.scale.y = blink ? .1 : 1; const talking = performance.now() < talkUntil;
  u.mouth.scale.set(1, talking ? .6 + Math.abs(Math.sin(t * 14)) * 1.2 : .7, 1); hopT = Math.max(0, hopT - dt);
  friend.position.y = -3.3 + Math.sin(t * 2.2) * .12 + Math.sin(hopT * 10) * hopT * 1.2; friend.rotation.z = Math.sin(t * 1.4) * .06;
  u.arms[0].rotation.z = -.4 - Math.sin(t * 3) * .25 - (talking ? Math.abs(Math.sin(t * 5)) * .5 : 0); u.arms[1].rotation.z = .4 + (talking ? 1.4 + Math.sin(t * 7) * .5 : Math.sin(t * 2.5) * .2); }

export function stageStep(dt) { if (!ROOT.visible || !E.cam) return; T += dt;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(E.cam.quaternion); ROOT.position.copy(E.cam.position).addScaledVector(fwd, 15); ROOT.quaternion.copy(E.cam.quaternion);
  stepZoom(dt); if (cur && !zoom) try { cur(T - t0, dt); } catch (e) { console.error('[stage]', e); cur = null; }
  for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i], u = p.userData; u.k += dt; if (u.k > u.life) { p.parent && p.parent.remove(p); pops.splice(i, 1); continue; } const k = u.k / u.life;
    if (p.isSprite) { const s = k < .12 ? .4 + k / .12 * .8 : 1.2 - (k - .12) * .25; p.scale.copy(u.base).multiplyScalar(s); p.material.opacity = k > .7 ? (1 - k) / .3 : 1; p.position.y += dt * .6; }
    else { if (u.inward) p.position.copy(u.o).addScaledVector(u.v, .45 * (1 - k)); else p.position.addScaledVector(u.v, dt); p.material.opacity = 1 - k; p.material.transparent = true; } }
  stepFriend(T, dt); }
/* ── 어디서 · 왜 ── */
const KEYLOC = { meta: 'cell', ea: 'mol', dh: 'mol', exo: 'mol', endoE: 'mol', eaE: 'mol', calc: 'mol', gibil: 'mol', es: 'mol', cof: 'mol', kinds: 'mol', tph: 'mol', sat: 'mol', inh: 'mol',
  atp: 'cell', redox: 'cell', nad: 'cell', resp: 'cell', mito: 'mito', endo: 'cell', glyC: 'cyto', glyPath: 'cyto', pyrC: 'matrix', tcaC: 'matrix', count: 'matrix', elev: 'inner', mem: 'inner',
  ferm: 'cyto', photoAll: 'chloro', chlS: 'chloro', ps: 'thyla', spec: 'chloro', rf: 'lab', z: 'thyla', chl: 'thyla', exp: 'lab', calvin: 'stroma', cmp: 'cell', subs: 'body' };
const WHY = { meta: '살아 있으려면 물질을 쪼개 에너지를 얻고(이화), 몸을 만들어야(동화) 해서', ea: '반응물이 생성물이 되려면 에너지 언덕을 넘어야 해서', dh: '반응물과 생성물의 에너지 높이가 달라서', exo: '큰 분자가 쪼개지면 남는 에너지가 나와서',
  endoE: '작은 분자로 큰 분자를 만들려면 에너지를 넣어야 해서', eaE: '체온은 낮아서, 효소가 언덕을 낮춰야 반응이 빨라져서', calc: '효소는 꼭대기만 낮추고 출발·도착 높이는 그대로라서', gibil: '같은 말 "기질"이 두 가지 뜻으로 쓰여서',
  es: '활성 부위 모양이 맞는 기질만 붙어야 해서 (특이성)', cof: '단백질만으로는 활성 부위가 완성되지 않는 효소가 있어서', kinds: '효소마다 하는 일(쪼개기·붙이기…)이 정해져 있어서', tph: '효소는 단백질이라 열·pH에 모양이 변해서',
  sat: '효소 수가 정해져 있어서 다 차면 더 빨라질 수 없어서', inh: '억제제가 활성 부위를 뺏거나 모양을 바꿔서', atp: '포도당 에너지는 너무 큰 덩어리라, 바로 쓰기 좋은 작은 단위(ATP)로 나눠 둬야 해서', redox: '포도당의 에너지는 전자 속에 있어서 — 전자를 에너지가 낮은 O₂ 쪽으로 옮겨야 그 차이만큼 에너지가 나와서',
  nad: '전자를 O₂에 바로 주면 열로 다 날아가니까, NAD⁺에 잠깐 실어 전자전달계에서 조금씩 쓰려고', resp: '한 번에 태우면 열로 다 날아가니까, 단계별로 나눠 ATP로 저장하려고', mito: '산소 호흡의 대부분이 여기서 일어나서', endo: '원래 독립된 세균이 세포 안에 들어와 살게 돼서',
  glyC: '포도당을 반으로 쪼개 ATP 2 · NADH 2를 얻으려고 (산소 필요 없음)', glyPath: '먼저 ATP 2개를 투자해야 포도당이 쪼개지기 쉬워져서', pyrC: '피루브산을 TCA 회로에 들어갈 수 있는 아세틸 CoA로 바꾸려고',
  tcaC: '탄소를 CO₂로 다 떼어 내면서 전자(NADH · FADH₂)를 최대한 모으려고', count: '포도당 1개에서 얻는 양을 계산하려고', elev: '전자가 에너지를 내려놓아야 그 힘으로 H⁺를 퍼 올려서',
  mem: 'H⁺가 다시 흘러 들어오는 힘으로 ATP를 대량 생산하려고 (화학 삼투)', ferm: '산소가 없을 때 NAD⁺를 재생해 해당 과정을 계속 돌리려고', photoAll: '빛에너지를 포도당(화학 에너지)에 저장하려고',
  chlS: '막(명반응)과 액체(캘빈 회로)에서 일을 나눠 하려고', ps: '색소들이 빛을 모아 반응 중심으로 몰아줘야 해서', spec: '엽록소가 흡수하는 색의 빛만 광합성에 쓰여서', rf: '색소마다 녹는 정도가 달라 분리돼서',
  z: '빛을 두 번 받아 전자를 NADP⁺까지 올려 보내려고', chl: 'H⁺ 농도 차로 ATP를 만들려고 (광인산화)', exp: '광합성에서 무엇이 나오고 어디서 오는지 확인하려고', calvin: '명반응의 ATP · NADPH로 CO₂를 포도당으로 바꾸려고',
  cmp: '두 과정이 서로의 재료를 만들어 주는 짝이라서', subs: '탄수화물 말고 지방 · 단백질도 에너지원으로 쓰려고' };
const LOC = {
  body: { n: '우리 몸', chain: ['body'] }, cell: { n: '세포', chain: ['body', 'cell'] }, cyto: { n: '세포질 (세포 안 액체)', chain: ['body', 'cell', 'cyto'] }, mito: { n: '마이토콘드리아', chain: ['body', 'cell', 'mitoL'] },
  matrix: { n: '마이토콘드리아 기질 (내막 안쪽)', chain: ['body', 'cell', 'mitoL', 'matrix'] }, inner: { n: '마이토콘드리아 내막', chain: ['body', 'cell', 'mitoL', 'inner'] }, mol: { n: '세포 속 효소 분자 (분자 수준)', chain: ['cell', 'mol'] },
  chloro: { n: '엽록체 (잎 세포)', chain: ['leaf', 'pcell', 'chloro'] }, stroma: { n: '엽록체 스트로마 (액체)', chain: ['leaf', 'pcell', 'chloro', 'stromaL'] }, thyla: { n: '엽록체 타이라코이드 막', chain: ['leaf', 'pcell', 'chloro', 'thylaL'] }, lab: { n: '실험실', chain: ['labL'] } };
/* 각 단계 그림 + 다음 단계가 튀어나올 초점 */
const LV = {
  body(g) { const sk = '#f0c8a8'; g.add(at(sph(.9, sk, .3), 0, 3.2)); const t = new THREE.Mesh(new THREE.CapsuleGeometry(1, 2, 8, 16), M('#5a8ad0', .3)); g.add(at(t, 0, .8)); [-1, 1].forEach(k => { const a = new THREE.Mesh(new THREE.CapsuleGeometry(.32, 2, 6, 12), M(sk, .3)); a.position.set(k * 1.5, .7, 0); a.rotation.z = k * .25; g.add(a); const l = new THREE.Mesh(new THREE.CapsuleGeometry(.4, 2.2, 6, 12), M('#3a4a6a', .3)); l.position.set(k * .55, -2.3, 0); g.add(l); });
    const hot = sph(.35, '#ff5a5a', 2); g.add(at(hot, 1.55, .6, .4)); g.userData.focus = V(1.55, .6, 0); g.userData.lab = '우리 몸 → 근육'; },
  cell(g) { const c = sph(4.2, '#f0b0c8', .2); c.material.transparent = true; c.material.opacity = .35; c.scale.z = .5; g.add(c); g.add(at(sph(1.2, '#8a5ad0', .4), -1.2, .6)); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .7, 6, 12), M('#ff8a3a', .6)); m.rotation.z = i; m.position.set(Math.cos(i * 1.1) * 2.6, Math.sin(i * 1.1) * 2, .3); g.add(m); }
    for (let i = 0; i < 40; i++) g.add(at(sph(.06, '#ffffff', .8), (Math.random() - .5) * 7, (Math.random() - .5) * 5, .4)); g.userData.focus = V(Math.cos(1.1) * 2.6, Math.sin(1.1) * 2, 0); g.userData.lab = '세포'; },
  cyto(g) { for (let i = 0; i < 70; i++) g.add(at(sph(.08 + Math.random() * .1, ['#ffe0f0', '#ffd0a0', '#c0e0ff'][i % 3], .7), (Math.random() - .5) * 14, (Math.random() - .5) * 9, -1)); const w = sph(9, '#f0b0c8', .15); w.material.transparent = true; w.material.opacity = .15; w.material.side = THREE.BackSide; g.add(w); g.userData.focus = V(0, 0, 0); g.userData.lab = '세포질'; },
  mitoL(g) { const o = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, 4, 10, 24), M('#ff8a3a', .4, { transparent: true, opacity: .7 })); o.rotation.z = Math.PI / 2; g.add(o); const n = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 3.6, 10, 24), M('#ffd23f', .35)); n.rotation.z = Math.PI / 2; g.add(at(n, 0, 0, .2));
    for (let i = 0; i < 6; i++) g.add(at(box(.2, 1.8, .4, '#c89010', .4), -2.5 + i, (i % 2 ? .5 : -.5), .5)); g.userData.focus = V(.5, 0, 0); g.userData.lab = '마이토콘드리아'; },
  matrix(g) { const l = sph(10, '#2a5a98', .25); l.material.side = THREE.BackSide; g.add(l); [-1, 1].forEach(k => { for (let i = 0; i < 4; i++) g.add(at(box(.4, 6, 1, '#ffd23f', .5), k * (6.5 + (i % 2) * .4), -2 + i * 1.3, -3)); }); for (let i = 0; i < 30; i++) g.add(at(sph(.1, '#a0d0ff', .9), (Math.random() - .5) * 12, (Math.random() - .5) * 8, -2.5)); g.userData.focus = V(0, 0, 0); g.userData.lab = '기질'; },
  inner(g) { g.add(at(box(20, 3.6, 1, '#ffd23f', .35), 0, 0, -3)); const top = box(20, 6, .5, '#ff9a7a', .2); g.add(at(top, 0, 5, -3.5)); const bot = box(20, 6, .5, '#2a5a98', .2); g.add(at(bot, 0, -5, -3.5)); g.add(at(tx('막사이공간 (H⁺ 많음)', '#ffc8a0', .6), -5, 5.5, -2), at(tx('내막', '#ffd23f', .6), -7, 0, -2), at(tx('기질', '#8ac8ff', .6), -5, -5.5, -2)); g.userData.focus = V(0, 0, 0); g.userData.lab = '내막'; },
  mol(g) { for (let i = 0; i < 26; i++) { const m = sph(.15 + Math.random() * .3, ['#5aff9a', '#ffd23f', '#ff8aa8', '#8ac8ff'][i % 4], .6); g.add(at(m, (Math.random() - .5) * 14, (Math.random() - .5) * 9, -2 - Math.random() * 2)); } g.userData.focus = V(0, 0, 0); g.userData.lab = '분자'; },
  leaf(g) { const l = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 16), M('#3fdc5a', .3)); l.scale.set(1.4, .7, .2); g.add(l); g.add(at(box(8, .08, .1, '#9aff7a', .6), 0, 0, .3)); for (let i = -2; i <= 2; i++) { const v = box(2.2, .06, .1, '#9aff7a', .6); v.rotation.z = (i % 2 ? .5 : -.5); g.add(at(v, i * 1.3, (i % 2 ? .5 : -.5), .3)); } g.add(at(sph(.3, '#ffe066', 2), 1.4, .4, .4)); g.userData.focus = V(1.4, .4, 0); g.userData.lab = '잎'; },
  pcell(g) { g.add(box(8, 5.4, .4, '#2a8a3a', .25)); g.add(at(box(7.4, 4.8, .5, '#c8f0c0', .25), 0, 0, .1)); g.add(at(sph(.9, '#8a5ad0', .4), -2.4, 1.2, .5)); for (let i = 0; i < 7; i++) { const c = sph(.5, '#3fdc5a', .6); c.scale.set(1.6, .8, .6); g.add(at(c, -2 + (i % 4) * 1.6, -1.4 + Math.floor(i / 4) * 2.2, .6)); } g.userData.focus = V(1.2, .8, 0); g.userData.lab = '잎 세포'; },
  chloro(g) { const o = sph(3, '#3fdc5a', .3); o.scale.set(1.6, .9, .5); o.material.transparent = true; o.material.opacity = .6; g.add(o); for (let s2 = 0; s2 < 4; s2++) for (let j = 0; j < 5; j++) g.add(at(cyl(.5, .16, '#1f8a3a', .6), -3 + s2 * 2, -1 + j * .3, .6)); g.userData.focus = V(1, .8, 0); g.userData.lab = '엽록체'; },
  stromaL(g) { const l = sph(10, '#9ae08a', .2); l.material.side = THREE.BackSide; g.add(l); [-1, 1].forEach(k => { for (let j = 0; j < 6; j++) g.add(at(cyl(1.2, .3, '#1f8a3a', .5), k * 7, -3 + j * .45, -3)); }); g.userData.focus = V(0, 0, 0); g.userData.lab = '스트로마'; },
  thylaL(g) { g.add(at(box(20, 3.6, 1, '#3aa84a', .4), 0, 0, -3)); g.add(at(box(20, 6, .5, '#c8f0c0', .2), 0, 5, -3.5)); g.add(at(box(20, 6, .5, '#2a6a3a', .2), 0, -5, -3.5)); g.add(at(tx('스트로마', '#e0ffd0', .6), -5, 5.5, -2), at(tx('타이라코이드 막', '#9aff9a', .6), -7, 0, -2), at(tx('타이라코이드 내부 (H⁺ 많음)', '#ffc8a0', .6), -4, -5.5, -2)); g.userData.focus = V(0, 0, 0); g.userData.lab = '타이라코이드 막'; },
  labL(g) { g.add(at(box(14, .4, 3, '#8a6a4a', .3), 0, -3.4, -2)); g.userData.focus = V(0, 0, 0); g.userData.lab = '실험실'; } };
const setOp = (g, o) => g.traverse(m => { if (m.material) { m.material.transparent = true; m.material.opacity = (m.userData.op0 ??= m.material.opacity) * o; } });
let zoom = null, curLoc = null, locBg = null;
const tag = document.createElement('div'); tag.id = 'stLoc'; tag.hidden = true; document.body.appendChild(tag);
{ const st = document.createElement('style'); st.textContent = `#stLoc{position:fixed;left:14px;top:62px;z-index:21;max-width:min(46vw,560px);pointer-events:none;font-family:'Noto Sans KR',sans-serif}
#stLoc .w{display:inline-block;background:#120c06e8;border:2px solid #ffd23f;border-radius:12px;padding:6px 12px;font-size:19px;font-weight:900;color:#ffd23f;box-shadow:0 4px 14px #000a}
#stLoc .y{margin-top:6px;background:#120c06d8;border-left:4px solid #5affd0;border-radius:8px;padding:6px 10px;font-size:15px;line-height:1.55;color:#eafff8}#stLoc .y b{color:#5affd0}
#stLoc .z{margin-top:6px;font-size:14px;color:#ffe9a0;font-weight:700;letter-spacing:.5px}`; document.head.appendChild(st); }
function startZoom(loc) { const L = LOC[loc]; if (!L) return; const from = curLoc ? LOC[curLoc].chain : []; let k0 = 0; while (k0 < from.length && from[k0] === L.chain[k0]) k0++;
  const chain = L.chain.slice(Math.max(0, k0 - 1)); const levels = chain.map(id => { const g = new THREE.Group(); LV[id](g); g.visible = false; ROOT.add(g); return g; });
  zoom = { levels, t: 0, per: 1.05, chain }; curLoc = loc; }
function stepZoom(dt) { if (!zoom) return; zoom.t += dt; const { levels, per } = zoom, n = levels.length, k = zoom.t / per, i = Math.floor(k), f = sm(k - i);
  levels.forEach((g, j) => { g.visible = j === i || j === i + 1; });
  const A = levels[i], B = levels[i + 1];
  if (A) { const fc = A.userData.focus, s = B ? 1 + f * f * 7 : 1; A.scale.setScalar(s); A.position.set(fc.x * (1 - s), fc.y * (1 - s), -1); setOp(A, B ? 1 - f : 1); }
  if (B) { const fc = A.userData.focus, s = .1 + f * .9; B.scale.setScalar(s); B.position.set(fc.x * (1 - f), fc.y * (1 - f), -1); setOp(B, f); }
  const lab = (B && f > .5 ? B : A).userData.lab; tag.querySelector('.z') && (tag.querySelector('.z').textContent = '🔍 ' + zoom.chain.map(id => { const g = levels[zoom.chain.indexOf(id)]; return g.userData.lab; }).join(' → '));
  if (i >= n - 1) { /* 도착: 마지막 장소를 흐린 배경으로 */ if (locBg) ROOT.remove(locBg); locBg = levels[n - 1]; locBg.scale.setScalar(1.4); locBg.position.set(0, 0, -5); setOp(locBg, .45); levels.slice(0, -1).forEach(g => ROOT.remove(g)); zoom = null; if (ROOT.userData.stage) ROOT.userData.stage.visible = true; t0 = T; } }
export function stageShow(key, col, words) {
  if (!E.scene) return; if (!built) { built = true; STS.add(ROOT); const back = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ color: '#0d0a08', transparent: true, opacity: .93, depthWrite: false })); back.position.z = -9; back.renderOrder = -1; ROOT.add(back); ROOT.userData.back = back; }
  if (!key) { ROOT.visible = false; tag.hidden = true; curLoc = null; curKey = null; zoom = null; if (locBg) { ROOT.remove(locBg); locBg = null; } return; } ROOT.visible = true; tag.hidden = false;
  if (words) talkUntil = performance.now() + Math.min(6000, 600 + words * 55); hopT = .6;
  const c = col || '#5af0ff'; if (!friend || friend.userData.col !== c) { if (friend) ROOT.remove(friend); friend = makeFriend(c); friend.userData.col = c; friend.position.set(-6.2, -3.3, 1); friend.scale.setScalar(.9); ROOT.add(friend); }
  if (key === curKey) return; curKey = key;
  if (ROOT.userData.stage) ROOT.remove(ROOT.userData.stage); pops.length = 0;
  const g = new THREE.Group(); g.position.set(.6, .3, 0); g.scale.setScalar(1.12); ROOT.add(g); ROOT.userData.stage = g;
  const [name, opt] = ALIAS[key] || [key]; const fn = SC[name]; cur = fn ? fn(g, opt || {}) : null; if (!fn) g.add(at(tx('🔬', '#fff', 1.5), 0, 0)); t0 = T;
  const loc = KEYLOC[key] || 'cell'; tag.innerHTML = `<div class="w">📍 어디서? ${LOC[loc].n}</div>${WHY[key] ? `<div class="y"><b>왜?</b> ${WHY[key]}</div>` : ''}<div class="z"></div>`;
  if (loc !== curLoc) { if (locBg) { ROOT.remove(locBg); locBg = null; } g.visible = false; startZoom(loc); } else tag.querySelector('.z').textContent = ''; }
export const stageHas = k => !!(SC[(ALIAS[k] || [k])[0]]);

/* 세포 화면을 다 그린 뒤 그 위에 무대를 따로 그림 (배경과 안 겹치게) */
export function stageRender() { if (!ROOT.visible || !E.R) return; const R = E.R, a = R.autoClear; R.autoClear = false; R.clearDepth(); R.render(STS, E.cam); R.autoClear = a; }
window.__stageFF = sec => { for (let i = 0; i < sec / .05; i++) stageStep(.05); };
