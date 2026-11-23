/* 개념 3D 애니메이션: 개념 카드가 열려 있는 동안 화면 왼쪽(카메라 앞)에서 그 개념을 움직여서 보여 준다.
   ANIM.play(key) — key는 개념 카드의 그림 키(ea, es, atp, mem …). ANIM.stop() */
import * as THREE from 'three';
import { E, label, dotTex } from './engine.js?v=202611231451';
import { mol } from './mols.js?v=202611231451';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (c, e, ei = .5, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, emissive: e || c, emissiveIntensity: ei, roughness: .45 }, o));
const sph = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
const lab = (t, col = '#9fe', s = .5) => label(t, { scale: s, border: col });
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));   /* t가 a~b 사이에서 0→1 */
const lerpV = (a, b, k) => a.clone().lerp(b, k);

/* 빛나는 입자 (H⁺, 전자, 열) */
function dots(n, col, size = .55) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); }
function setDots(p, fn) { const a = p.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const v = fn(i); a.setXYZ(i, v.x, v.y, v.z); } a.needsUpdate = true; }
/* 탄소 공 n개 사슬 */
function chain(n, col = '#3a3f52', gap = 1.1) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const s = sph(.42, M(col, '#223', .4)); s.position.x = (i - (n - 1) / 2) * gap; g.add(s); } return g; }
/* 곡선 언덕 (에너지 그래프를 3D 띠로) */
function hill(r, p, top, col, w = 1.2) { const pts = []; for (let i = 0; i <= 60; i++) { const x = -9 + i * .3; const k = (x + 9) / 18; const base = r + (p - r) * (1 / (1 + Math.exp(-(x - 1.5) * 1.4))); const bump = (top - Math.max(r, p) * .2 - base * .8) * Math.exp(-((x + .5) ** 2) / 3.2); pts.push(V(x, base + Math.max(0, bump), 0)); } const c = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 120, .18, 8), M(col, col, .9)); m.userData.c = c; return m; }
const yAt = (c, x) => { let best = 0, bd = 1e9; for (let i = 0; i <= 100; i++) { const q = c.getPoint(i / 100); const d = Math.abs(q.x - x); if (d < bd) { bd = d; best = q.y; } } return best; };
/* 효소(팩맨 모양) */
function enzyme(col = '#3fd88a', notch = 'tri') { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 24, .55, Math.PI * 2 - 1.1), M(col, col, .35, { side: THREE.DoubleSide })); body.rotation.y = Math.PI / 2; body.rotation.z = Math.PI / 2; g.add(body); g.userData.body = body;
  const ew = new THREE.MeshBasicMaterial({ color: '#fff' }), ep = new THREE.MeshBasicMaterial({ color: '#061018' }); for (const s of [-1, 1]) { const e = sph(.3, ew); e.position.set(s * .7, -.6, 1.7); g.add(e); const q = sph(.15, ep); q.position.set(s * .7, -.6, 1.95); g.add(q); } return g; }
const shapeMesh = (k, col) => new THREE.Mesh(k === 'tri' ? new THREE.TetrahedronGeometry(.75) : k === 'box' ? new THREE.BoxGeometry(1.1, 1.1, 1.1) : new THREE.SphereGeometry(.6, 20, 14), M(col, col, .6));
/* 막 (판) + 단백질 */
function membrane(w, h, col = '#c4682a') { const g = new THREE.Group(); const top = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 8, 6), M(col, col, .3), Math.round(w / .6) * 2); const m4 = new THREE.Matrix4(); let k = 0; for (let x = -w / 2; x < w / 2 && k < top.count - 1; x += .6) { m4.makeTranslation(x, .9, 0); top.setMatrixAt(k++, m4); m4.makeTranslation(x, -.9, 0); top.setMatrixAt(k++, m4); } g.add(top); const core = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, 1.6), M('#3a2410', '#2a1608', .2, { transparent: true, opacity: .65 })); g.add(core); return g; }


/* ═══ 개그 연출 도구 ═══ */
/* 만화 말풍선 같은 큰 외침 글자: 튀어나오며 흔들림 */
function shout(g, text, col = '#ffe066', size = 1) { const l = label(text, { scale: .9 * size, bg: 'rgba(0,0,0,.55)', border: col, color: col }); g.add(l); l.userData.base = l.scale.clone(); l.visible = false; return l; }
function pop(l, t, a, b, wob = .15) { const on = t >= a && t < b; l.visible = on; if (!on) return; const k = Math.min(1, (t - a) * 6); const s = (k < 1 ? 1.6 - .6 * k : 1) * (1 + Math.sin(t * 30) * wob * Math.max(0, 1 - (t - a))); l.scale.copy(l.userData.base).multiplyScalar(s); l.material.rotation = Math.sin(t * 12) * .06; }
/* 지지직 번개 */
function zap(n = 6) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3)); g.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: i % 2 ? '#fff' : '#ffe066', transparent: true }))); } return g; }
function zapAt(z, a, b, amp = .5, on = true) { z.visible = on; if (!on) return; z.children.forEach(L => { const p = L.geometry.attributes.position; for (let i = 0; i < 8; i++) { const k = i / 7; p.setXYZ(i, a.x + (b.x - a.x) * k + (i && i < 7 ? (Math.random() - .5) * amp : 0), a.y + (b.y - a.y) * k + (i && i < 7 ? (Math.random() - .5) * amp * 2 : 0), a.z + (Math.random() - .5) * amp); } p.needsUpdate = true; }); }
/* 폭발 섬광 + 파편 */
function boom(col = '#ffe066') { const g = new THREE.Group(); const fl = sph(1, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(fl); const ring = new THREE.Mesh(new THREE.RingGeometry(.8, 1.1, 40), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); g.add(ring); const d = dots(80, col, .9); g.add(d); g.userData = { fl, ring, d }; g.visible = false; return g; }
function boomAt(b, pos, t, t0, size = 4) { const k = t - t0; b.visible = k >= 0 && k < 1.4; if (!b.visible) return; b.position.copy(pos); const { fl, ring, d } = b.userData; fl.scale.setScalar(.3 + k * size); fl.material.opacity = Math.max(0, .9 - k * 1.2); ring.scale.setScalar(1 + k * size * 1.6); ring.material.opacity = Math.max(0, .8 - k); setDots(d, i => V(Math.sin(i * 2.3) * k * size * 1.8, Math.cos(i * 1.7) * k * size * 1.8 - k * k * 2, Math.sin(i * .7) * k * 2)); d.material.opacity = Math.max(0, 1 - k * .8); }
let SHK = 0; const shakeNow = v => { SHK = Math.max(SHK, v); };
/* 땀방울 */
function sweat() { const d = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), M('#7ad8ff', '#3aa8ff', .6)); d.scale.set(.8, 1.3, .8); return d; }

/* ═══ 장면들: (g) => update(t) ═══ */
const S = {};
/* 활성화 에너지: 공이 언덕을 오르다 실패 → 효소로 낮아진 언덕은 넘어감 */
S.ea = g => { const red = hill(3, 0, 8, '#ff6a7a'); g.add(red); const ball = sph(.6, M('#ffd23f', '#ffb000', 1)); g.add(ball); const sw = sweat(); g.add(sw); const h1 = shout(g, '헉… 헉… 너무 높아…', '#ffe066', .7), h2 = shout(g, '으아아아 미끄러진다~!', '#ff6a7a', .8); const l1 = lab('반응물', '#fff'); l1.position.set(-7.5, 4.6, 0); g.add(l1); const l2 = lab('생성물', '#fff'); l2.position.set(7, 1.6, 0); g.add(l2);
  const ea = lab('활성화 에너지', '#ff6a7a', .55); ea.position.set(2.6, 6.4, 0); g.add(ea); const arr = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 1, 6), M('#ff6a7a')); arr.position.set(-.5, 5.5, .3); g.add(arr);
  return t => { t %= 6; const x = t < 2.5 ? -8 + 6.5 * ease(seg(t, 0, 2.5)) : -1.5 - 6.5 * ease(seg(t, 2.8, 5)); ball.position.set(x, yAt(red.userData.c, x) + .75, 0); const top = yAt(red.userData.c, -.5), base = 3; arr.scale.y = top - base; arr.position.y = (top + base) / 2 + .75; ea.visible = t > 1.2; sw.position.copy(ball.position).add(V(.6, .7 - (t * 2 % 1) * .6, .3)); sw.visible = t > 1 && t < 2.8; pop(h1, t, 1, 2.7); h1.position.copy(ball.position).add(V(0, 2.4, 1)); pop(h2, t, 2.8, 4.8); h2.position.copy(ball.position).add(V(0, 2.2, 1)); }; };
S.eaE = g => { const red = hill(3, 0, 8, '#ff6a7a'); const blue = hill(3, 0, 5, '#5ab8ff'); g.add(red, blue); red.material.opacity = .35; red.material.transparent = true; const ball = sph(.6, M('#ffd23f', '#ffb000', 1)); g.add(ball); const en = enzyme('#3fd88a'); en.scale.setScalar(.45); g.add(en);
  const l = lab('효소가 언덕을 낮춤 → 넘어간다!', '#5ab8ff', .5); l.position.set(0, 9, 0); g.add(l); const go = shout(g, '가즈아아아~!!', '#5aff9a', .8), ok = shout(g, '어? 생각보다 쉬운데?', '#ffe066', .65);
  return t => { t %= 5; const x = -8 + 16 * ease(seg(t, .3, 4.2)); ball.position.set(x, yAt(blue.userData.c, x) + .75, 0); en.position.copy(ball.position).add(V(-1.2, .8, 0)); en.rotation.y = 0; pop(go, t, .3, 1.8); go.position.copy(ball.position).add(V(0, 2.6, 1)); pop(ok, t, 2.2, 4.4); ok.position.copy(ball.position).add(V(0, 2.4, 1)); }; };
S.calc = S.eaE;
S.dh = g => { const red = hill(4, 1, 8, '#ff6a7a'); g.add(red); const bar = new THREE.Mesh(new THREE.BoxGeometry(.5, 1, .5), M('#ffd23f', '#ffd23f', 1)); g.add(bar); const l = lab('반응열 = 반응물 − 생성물', '#ffd23f', .5); l.position.set(3, 8.5, 0); g.add(l);
  const ball = sph(.55, M('#ffd23f')); g.add(ball);
  return t => { t %= 5; const x = -8 + 16 * ease(seg(t, .2, 3.4)); ball.position.set(x, yAt(red.userData.c, x) + .7, 0); const k = seg(t, 3.4, 4.2); bar.scale.y = Math.max(.01, 3 * k); bar.position.set(8.5, 1 + 1.5 * k + .7, 0); }; };
S.exo = g => { const c = hill(6, 1, 9, '#ff9a3c'); g.add(c); const ball = sph(.6, M('#ffd23f')); g.add(ball); const heat = dots(60, '#ff6a3a', .7); g.add(heat); const l = lab('발열: 에너지 방출 (이화 작용)', '#ff9a3c', .5); l.position.set(0, 10, 0); g.add(l);
  return t => { t %= 5; const x = -8 + 16 * ease(seg(t, .2, 3.2)); ball.position.set(x, yAt(c.userData.c, x) + .75, 0); const k = seg(t, 2.6, 5); setDots(heat, i => V(6 + Math.sin(i) * k * 4, 2 + k * 6 * ((i % 7) / 7) , Math.cos(i * 1.7) * k * 3)); heat.material.opacity = 1 - k; }; };
S.endoE = g => { const c = hill(1, 6, 9, '#5ab8ff'); g.add(c); const ball = sph(.6, M('#ffd23f')); g.add(ball); const heat = dots(60, '#ffcc33', .7); g.add(heat); const l = lab('흡열: 에너지 흡수 (동화 작용)', '#5ab8ff', .5); l.position.set(0, 10.5, 0); g.add(l);
  return t => { t %= 5; const k = seg(t, 0, 1.6); setDots(heat, i => V(-7 + Math.sin(i) * (1 - k) * 4, 1 + (1 - k) * 5 * ((i % 7) / 7), Math.cos(i * 1.7) * (1 - k) * 3)); heat.material.opacity = 1 - k * .8; const x = -8 + 16 * ease(seg(t, 1.4, 4.4)); ball.position.set(x, yAt(c.userData.c, x) + .75, 0); }; };
/* 물질대사: 작은 분자 → 큰 분자(에너지 흡수), 큰 분자 → 작은 분자(방출) */
S.meta = g => { const balls = []; for (let i = 0; i < 6; i++) { const b = sph(.5, M(['#5af0ff', '#ffd23f', '#ff9ad5'][i % 3])); g.add(b); balls.push(b); } const l = lab('', '#9fe', .5); g.add(l); l.position.set(0, 4.5, 0); let mode = -1; const heat = dots(50, '#ffcc33', .6); g.add(heat);
  return t => { t %= 8; const join = t < 4, k = join ? ease(seg(t, .5, 3)) : ease(seg(t, 4.5, 7)); const m = join ? 0 : 1; if (m !== mode) { mode = m; g.remove(l); const nl = lab(join ? '동화 작용: 작은 분자 → 큰 분자 (에너지 흡수)' : '이화 작용: 큰 분자 → 작은 분자 (에너지 방출)', join ? '#5ab8ff' : '#ff9a3c', .48); nl.position.set(0, 4.5, 0); g.add(nl); Object.assign(l, { visible: false }); g.userData.nl && g.remove(g.userData.nl); g.userData.nl = nl; }
    balls.forEach((b, i) => { const spread = V((i - 2.5) * 2.6, Math.sin(i * 2) * 1.5, Math.cos(i) * 1.2), tight = V((i - 2.5) * 1, 0, 0); b.position.copy(join ? lerpV(spread, tight, k) : lerpV(tight, spread, k)); });
    setDots(heat, i => join ? V(Math.sin(i) * 7 * (1 - k), Math.cos(i * 1.3) * 4 * (1 - k), 0) : V(Math.sin(i) * 7 * k, Math.cos(i * 1.3) * 4 * k, 0)); heat.material.opacity = join ? 1 - k : 1 - k * .7; }; };
/* 효소·기질: 모양이 안 맞는 건 튕기고, 맞는 건 들어가서 쪼개짐 → 효소 재사용 */
S.es = g => { const en = enzyme('#3fd88a'); en.rotation.z = 0; g.add(en); const wrong = shapeMesh('box', '#ff9ad5'), right = shapeMesh('tri', '#5af0ff'); g.add(wrong, right); const a = shapeMesh('tri', '#5af0ff'), b = shapeMesh('tri', '#5af0ff'); a.scale.setScalar(.6); b.scale.setScalar(.6); g.add(a, b);
  const l = lab('활성 부위와 모양이 맞는 기질만 결합 (기질 특이성)', '#3fd88a', .45); l.position.set(0, 5, 0); g.add(l); const n1 = shout(g, '퉤! 안 맞잖아', '#ff6a7a', .75), n2 = shout(g, '딸깍! 딱 맞음', '#5aff9a', .75), n3 = shout(g, '쪼개기 완료~ 다음 손님!', '#ffe066', .65);
  return t => { t %= 7; en.position.set(0, 0, 0); en.rotation.z = Math.PI / 2;
    const kw = seg(t, 0, 1.2), kb = seg(t, 1.2, 2); wrong.position.set(6 - 4.2 * kw + 4 * kb, 2.4 - 2 * kw + 2 * kb, 0); wrong.rotation.x = t * 3; wrong.visible = t < 2.2;
    const kr = ease(seg(t, 2.4, 3.6)); right.position.set(6 - 5.4 * kr, 2 * (1 - kr), 0); right.visible = t < 4.2; right.rotation.y = t;
    const ks = ease(seg(t, 4.2, 5.6)); a.visible = b.visible = t >= 4.2; a.position.set(.6 + 5 * ks, 2 * ks, 0); b.position.set(.6 + 5 * ks, -2 * ks, 0);
    en.userData.body.material.emissiveIntensity = t > 3.6 && t < 4.4 ? 1.4 : .35; pop(n1, t, 1.1, 2.4); n1.position.set(3, 3.6, 1); pop(n2, t, 3.5, 4.4); n2.position.set(0, 3.4, 1); pop(n3, t, 4.6, 6.6); n3.position.set(2, -3.2, 1); if (t > 1.15 && t < 1.25) shakeNow(.3); }; };
S.gibil = S.es;
S.cof = g => { const en = enzyme('#888'); en.rotation.z = Math.PI / 2; g.add(en); const c = new THREE.Mesh(new THREE.OctahedronGeometry(.7), M('#ff9ad5', '#ff3a9a', 1)); g.add(c); const l1 = lab('주효소 (단백질) — 혼자선 활성 없음', '#aaa', .45); l1.position.set(0, 4.4, 0); g.add(l1); const l2 = lab('+ 보조 인자 = 전효소 → 활성!', '#ff9ad5', .5); l2.position.set(0, -4, 0); g.add(l2);
  return t => { t %= 6; const k = ease(seg(t, .8, 2.4)); c.position.set(-6 + 5.4 * k, 3 - 3 * k, 0); c.rotation.y = t * 2; const on = t > 2.4; en.userData.body.material.color.set(on ? '#3fd88a' : '#888'); en.userData.body.material.emissive.set(on ? '#3fd88a' : '#333'); en.userData.body.material.emissiveIntensity = on ? .6 + .3 * Math.sin(t * 6) : .1; l2.visible = on; }; };
S.tph = g => { const en = enzyme('#3fd88a'); en.rotation.z = Math.PI / 2; g.add(en); const th = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 6, 12), M('#eee', '#888', .2)); th.position.set(5, 0, 0); g.add(th); const mer = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 1, 10), M('#ff3a3a', '#ff3a3a', 1)); g.add(mer); const l = lab('', '#fff', .45); g.add(l); const sw1 = sweat(), sw2 = sweat(); g.add(sw1, sw2); const m1 = shout(g, '덥다… 덥다…', '#ffe066', .65), m2 = shout(g, '으악 녹는다아아…', '#ff6a5a', .8);
  return t => { t %= 7; const k = seg(t, .5, 5); [sw1, sw2].forEach((d, i) => { d.visible = k > .4; d.position.set((i ? 1.6 : -1.6), 1.6 - ((t * 1.5 + i * .5) % 1) * 2.5, 1.8); }); pop(m1, t, 2.2, 3.6); m1.position.set(0, 3.2, 1); pop(m2, t, 3.7, 6.5); m2.position.set(0, 3.2, 1); mer.scale.y = .5 + 5.4 * k; mer.position.set(5, -3 + mer.scale.y / 2, 0); const hot = k > .65; en.position.x = hot ? (Math.random() - .5) * .3 : 0; en.userData.body.scale.set(1, 1 + (hot ? Math.sin(t * 9) * .25 * (k - .65) * 4 : 0), 1 + (hot ? (k - .65) * 1.5 : 0)); en.userData.body.material.color.set(hot ? '#a05a3a' : '#3fd88a'); en.userData.body.material.emissive.set(hot ? '#5a2a1a' : '#3fd88a');
    if (g.userData.lt !== hot) { g.userData.lt = hot; g.remove(g.userData.ll || l); const nl = lab(hot ? '너무 뜨거우면 단백질 구조가 변형 = 변성 → 활성 잃음' : '최적 온도까지는 반응 속도 증가', hot ? '#ff6a5a' : '#3fd88a', .45); nl.position.set(0, 4.6, 0); g.add(nl); g.userData.ll = nl; } }; };
S.sat = g => { const ens = []; for (let i = 0; i < 4; i++) { const e = enzyme('#3fd88a'); e.scale.setScalar(.45); e.rotation.z = Math.PI / 2; e.position.set((i - 1.5) * 3, -1, 0); g.add(e); ens.push(e); } const subs = []; for (let i = 0; i < 10; i++) { const s = shapeMesh('tri', '#5af0ff'); s.scale.setScalar(.5); g.add(s); subs.push(s); } const l = lab('', '#fff', .45); g.add(l);
  return t => { t %= 8; const n = Math.min(10, Math.floor(t * 1.6)); subs.forEach((s, i) => { s.visible = i < n; if (i < 4) s.position.lerpVectors(V((i - 1.5) * 3, 4, 0), V((i - 1.5) * 3 + .3, -1, 0), seg(t, i * .6, i * .6 + .8)); else s.position.set((i - 6.5) * 1.3, 4 + Math.sin(t * 2 + i) * .5, 0); s.rotation.y = t; });
    const full = n > 4; if (g.userData.f !== full) { g.userData.f = full; g.remove(g.userData.ll || l); const nl = lab(full ? '효소가 모두 일하는 중 → 기질을 더 넣어도 속도 일정 (포화)' : '기질이 늘수록 일하는 효소가 늘어 빨라짐', full ? '#ffd23f' : '#5af0ff', .42); nl.position.set(0, 6.2, 0); g.add(nl); g.userData.ll = nl; } }; };
S.inh = g => { const e1 = enzyme('#3fd88a'), e2 = enzyme('#3fd88a'); [e1, e2].forEach((e, i) => { e.scale.setScalar(.7); e.rotation.z = Math.PI / 2; e.position.set(i ? 4.5 : -4.5, 0, 0); g.add(e); }); const ci = shapeMesh('tri', '#ff6a5a'), ni = shapeMesh('ball', '#ff6a5a'); g.add(ci, ni); const s1 = shapeMesh('tri', '#5af0ff'), s2 = shapeMesh('tri', '#5af0ff'); [s1, s2].forEach(s => s.scale.setScalar(.6)); g.add(s1, s2);
  const a = lab('경쟁적: 활성 부위를 차지', '#ff9a3c', .42); a.position.set(-4.5, 3.6, 0); g.add(a); const b = lab('비경쟁적: 다른 곳에 붙어 모양을 바꿈', '#ff9a3c', .42); b.position.set(4.5, 3.6, 0); g.add(b);
  return t => { t %= 6; const k = ease(seg(t, .3, 1.6)); ci.position.set(-4.5 + .4, 4 - 4 * k, 0); ni.position.set(4.5 - 1.6, -3 + 1.4 * k, -.6); e2.userData.body.scale.set(1, 1, 1 - .35 * k); const k2 = seg(t, 2, 3.4), k3 = seg(t, 3.4, 4.2); s1.position.set(-8 + 2.8 * k2 - 2 * k3, 1.5, 0); s2.position.set(1 + 2.8 * k2 - 1.5 * k3, 1.5 + k3, 0); s1.rotation.y = s2.rotation.y = t * 2; }; };
S.kinds = g => { const a = sph(.7, M('#5af0ff')), b = sph(.7, M('#ff9ad5')); g.add(a, b); const w = mol('H2O'); g.add(w); const l = lab('가수 분해: 물을 넣어 쪼갠다 (소화 효소)', '#5af0ff', .45); l.position.set(0, 4, 0); g.add(l);
  return t => { t %= 5; const k = ease(seg(t, .3, 1.8)), s = ease(seg(t, 1.8, 3.2)); w.position.set(0, 4 - 3.4 * k, 0); w.visible = t < 2.2; a.position.set(-.7 - 3 * s, 0, 0); b.position.set(.7 + 3 * s, 0, 0); }; };
/* ATP: 끝 인산이 떨어지며 에너지 → 다시 충전 */
S.atp = g => {
  const base = sph(1, M('#ffd23f', '#ffb000', .8)); base.position.x = -2.2; g.add(base); const bl = lab('아데노신', '#ffd23f', .42); bl.position.set(-2.2, 1.8, 0); g.add(bl);
  const P = [0, 1, 2].map(i => { const p = sph(.62, M('#c48bff', '#6a2ad0', 1)); p.position.set(.2 + i * 1.6, 0, 0); g.add(p); const t = lab('P', '#fff', .35); t.position.set(0, 0, .7); p.add(t); return p; });
  const bond = (a, b, col) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 1, 10), M(col, col, .8)); m.rotation.z = Math.PI / 2; g.add(m); return m; };
  const b1 = bond(0, 1, '#aab'), hot = bond(1, 2, '#ffe066'); const z = zap(5); g.add(z); const bm = boom('#ffe066'); g.add(bm);
  const glow = sph(1.1, new THREE.MeshBasicMaterial({ color: '#ffe066', transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(glow);
  const s1 = shout(g, '✨ 고에너지 인산 결합 ✨', '#ffe066', .8), s2 = shout(g, '으어어어어억…!!', '#ff9a3c', 1.1), s3 = shout(g, '툭!!!', '#ff4a4a', 1.6), s4 = shout(g, 'ADP + Pᵢ + 에너지 콸콸', '#5af0ff', .75), s5 = shout(g, '세포호흡: 다시 철컥! (충전)', '#5aff9a', .75);
  const sp = dots(40, '#ffe066', .7); g.add(sp);
  return t => { t %= 10;
    /* 0~2.5 번쩍번쩍 / 2.5~4.6 늘어나며 으어억 / 4.6 툭 + 폭발 / 6.6~8.4 재결합 */
    const strain = seg(t, 2.5, 4.6), fly = seg(t, 4.6, 6.2), back = ease(seg(t, 6.8, 8.4));
    const x3 = 3.4 + strain * 2.2 + fly * 6 - (strain * 2.2 + 6) * back, y3 = fly * 2.5 * (1 - back);
    P[2].position.set(x3 + (t > 2.5 && t < 4.6 ? (Math.random() - .5) * .25 * strain : 0), y3, 0); P[2].rotation.z = fly * 8;
    P[1].position.x = 1.8 + (t > 2.5 && t < 4.6 ? (Math.random() - .5) * .1 : 0);
    b1.position.set(1, 0, 0); b1.scale.y = 1;
    const broken = t >= 4.6 && t < 8.4; hot.visible = !broken; const ax = 1.8, bx = P[2].position.x; hot.position.set((ax + bx) / 2, P[2].position.y / 2, 0); hot.scale.set(1 - strain * .55, Math.max(.1, bx - ax), 1 - strain * .55);
    const flick = .9 + Math.sin(t * 40) * .5 + Math.random() * .6; hot.material.emissiveIntensity = broken ? 0 : 1.4 * flick + strain * 3; hot.material.color.set(strain > .6 ? '#ffffff' : '#ffe066');
    glow.position.copy(hot.position); glow.visible = !broken; glow.scale.set(Math.max(1, bx - ax) * 1.2, 1 + Math.sin(t * 20) * .2 + strain, 1); glow.material.opacity = .25 + .15 * Math.sin(t * 25) + strain * .3;
    zapAt(z, V(ax, 0, 0), P[2].position, .6 + strain, !broken && (t < 2.5 ? Math.sin(t * 9) > .2 : true));
    setDots(sp, i => { const a = i / 40 * Math.PI * 2 + t * 3; return hot.position.clone().add(V(Math.cos(a) * (1.2 + strain), Math.sin(a * 2) * .8, Math.sin(a) * .8)); }); sp.visible = !broken;
    boomAt(bm, V(ax + 1.2, 0, 0), t, 4.6, 4); if (t >= 4.6 && t < 4.75) shakeNow(1.2); if (t > 2.5 && t < 4.6) shakeNow(.08 + strain * .25);
    pop(s1, t, .3, 2.5); s1.position.set(2.5, 3, 1); pop(s2, t, 2.6, 4.6, .3); s2.position.set(3.5, 3.3, 1); pop(s3, t, 4.6, 5.8, .1); s3.position.set(4, 2, 2); pop(s4, t, 5.6, 6.9); s4.position.set(0, -2.6, 1); pop(s5, t, 7, 9.6); s5.position.set(0, -2.6, 1);
  }; };

/* 산화·환원: 포도당이 수소(전자)를 잃고 NAD⁺가 받음 */
S.redox = g => { const glu = mol('glucose'); g.add(glu); glu.position.x = -4; const nad = mol('NAD'); g.add(nad); nad.position.x = 5; const hs = []; for (let i = 0; i < 2; i++) { const h = sph(.3, M('#fff27a', '#ffd000', 2)); g.add(h); hs.push(h); } const l1 = lab('잃음 = 산화', '#ff6a7a', .5); l1.position.set(-4, -3.4, 0); g.add(l1); const r1 = shout(g, '내 전자 돌려줘!!', '#ff6a7a', .7), r2 = shout(g, '냠! 잘 받았어~', '#5ab8ff', .7); const l2 = lab('얻음 = 환원', '#5ab8ff', .5); l2.position.set(5, -3.4, 0); g.add(l2);
  return t => { t %= 5; hs.forEach((h, i) => { const k = ease(seg(t, .5 + i * .4, 2.2 + i * .4)); h.position.lerpVectors(V(-3 + i, 1.6, 0), V(5, .4 + i * .5, 0), k); h.position.y += Math.sin(k * Math.PI) * 2; }); glu.rotation.z = t * .3; pop(r1, t, 1.2, 3); r1.position.set(-4, 3.2, 1); pop(r2, t, 2.6, 4.6); r2.position.set(5, 2.8, 1); }; };
S.nad = g => { const nad = mol('NAD'); g.add(nad); const nadh = mol('NADH'); g.add(nadh); const hs = [sph(.3, M('#fff27a', '#ffd000', 2)), sph(.3, M('#ff7a9a', '#ff2a5a', 2))]; hs.forEach(h => g.add(h)); const l = lab('NAD⁺ + 2H → NADH + H⁺ (전자 택배 출발)', '#4aa8ff', .45); l.position.set(0, 3.6, 0); g.add(l);
  return t => { t %= 5; const k = ease(seg(t, .3, 1.6)); hs.forEach((h, i) => h.position.lerpVectors(V(-5, 2 - i * 2, 0), V(0, 0, 0), k)); hs.forEach(h => h.visible = t < 1.7); nad.visible = t < 1.7; nadh.visible = t >= 1.7; const d = ease(seg(t, 2.4, 4.4)); nadh.position.set(9 * d, 0, 0); }; };
/* 세포호흡 지도: 4단계를 차례로 빛나게 */
S.resp = g => { const st = ['해당 과정\n세포질', '피루브산 산화\n기질', 'TCA 회로\n기질', '산화적 인산화\n내막'], cs = ['#ffd23f', '#2fd4c4', '#ff9a3c', '#ff6a7a']; const boxes = st.map((s, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 1), M(cs[i], cs[i], .2)); b.position.set((i - 1.5) * 4, 0, 0); g.add(b); const l = lab(s, cs[i], .42); l.position.set((i - 1.5) * 4, 2.2, 0); g.add(l); return b; }); const ball = mol('glucose'); ball.scale.setScalar(.45); g.add(ball);
  return t => { t %= 8; const i = Math.min(3, Math.floor(t / 1.8)); boxes.forEach((b, j) => b.material.emissiveIntensity = j === i ? 1.2 : .15); ball.position.set((t / 1.8 - 1.5) * 4 - 2, -2, 0); }; };
/* 마이토콘드리아 단면 */
S.mito = g => { const outer = new THREE.Mesh(new THREE.CapsuleGeometry(3.2, 6, 12, 32), M('#ff9a4a', '#a83a00', .2, { transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false })); outer.rotation.z = Math.PI / 2; g.add(outer); const inner = new THREE.Mesh(new THREE.CapsuleGeometry(2.7, 6, 12, 32), M('#ffb36b', '#c0500a', .3, { transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false })); inner.rotation.z = Math.PI / 2; g.add(inner);
  for (let i = 0; i < 6; i++) { const cr = new THREE.Mesh(new THREE.BoxGeometry(.25, 3.2, 3), M('#ff9f5a', '#c4500c', .6)); cr.position.set(-3.5 + i * 1.4, (i % 2 ? 1 : -1) * 1.2, 0); g.add(cr); }
  [['외막', 0, 4.1], ['막사이공간', 6.6, 3.2], ['내막·크리스타 (ATP 대량 생산)', -3, -4], ['기질 (TCA 회로)', 3, 0]].forEach(([s, x, y]) => { const l = lab(s, '#ffb070', .42); l.position.set(x, y, 1); g.add(l); });
  return t => { g.rotation.y = Math.sin(t * .4) * .5; }; };
S.endo = g => { const host = sph(4, M('#5af0ff', '#1a8aa0', .2, { transparent: true, opacity: .2, depthWrite: false })); g.add(host); const bac = new THREE.Mesh(new THREE.CapsuleGeometry(.6, 1.4, 8, 16), M('#ff9a4a', '#ff6a00', .8)); bac.rotation.z = Math.PI / 2; g.add(bac); const l = lab('원핵세포가 들어와 공생 → 마이토콘드리아·엽록체', '#ff9a4a', .45); l.position.set(0, 5.2, 0); g.add(l);
  return t => { t %= 6; const k = ease(seg(t, .3, 2.6)); bac.position.set(9 - 9 * k, 1 - k, 0); bac.rotation.y = t; const m = seg(t, 2.6, 3.4); bac.scale.setScalar(1 + m * .3); }; };
S.chlS = g => { const outer = sph(1, M('#5aff7a', '#0a7a20', .2, { transparent: true, opacity: .25, depthWrite: false })); outer.scale.set(5, 3, 3); g.add(outer); for (let s = 0; s < 3; s++) for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, .22, 24), M('#3fdc5a', '#0f8a2a', .6)); d.position.set(-2.6 + s * 2.6, -1 + k * .3, 0); g.add(d); }
  [['그라나 (타이라코이드 더미) → 명반응', 0, 1.6], ['스트로마 → 캘빈 회로', 0, -2.4]].forEach(([s, x, y]) => { const l = lab(s, '#8aff6a', .42); l.position.set(x, y, 2); g.add(l); }); return t => { g.rotation.y = Math.sin(t * .4) * .6; }; };
/* 탄소 세기 */
function carbonSplit(g, from, to, extraOut, msg) { const A = chain(from); g.add(A); const B = to.map(n => { const c = chain(n); g.add(c); return c; }); const out = extraOut ? mol('CO2') : null; if (out) g.add(out); const l = lab(msg, '#ffd23f', .45); l.position.set(0, 3.6, 0); g.add(l);
  return t => { t %= 5; const k = ease(seg(t, 1, 2.6)); A.visible = t < 1; B.forEach((b, i) => { b.visible = t >= 1; b.position.set((i - (B.length - 1) / 2) * 4 * k, 0, 0); }); if (out) { out.visible = t >= 1; out.position.set(0, 3 * k - 1, 1.5 * k); } }; }
S.glyC = g => carbonSplit(g, 6, [3, 3], false, '포도당 C₆ → 피루브산 C₃ × 2 (산소 없이, 세포질)');
S.glyPath = g => { const glu = chain(6); g.add(glu); const p1 = sph(.4, M('#c48bff', '#6a2ad0', 1)), p2 = sph(.4, M('#c48bff', '#6a2ad0', 1)); g.add(p1, p2); const halves = [chain(3), chain(3)]; halves.forEach(h => g.add(h)); const atp = []; for (let i = 0; i < 4; i++) { const a = mol('ATP'); a.scale.setScalar(.6); g.add(a); atp.push(a); } const l = lab('', '#fff', .45); g.add(l);
  return t => { t %= 8; const k1 = ease(seg(t, .3, 1.6)); p1.position.set(-6 + 2.7 * k1, 3 - 3 * k1, 0); p2.position.set(6 - 2.7 * k1, 3 - 3 * k1, 0); const sp = ease(seg(t, 2.4, 3.6)); glu.visible = t < 2.4; halves.forEach((h, i) => { h.visible = t >= 2.4; h.position.set((i ? 1 : -1) * (1.6 + 2.4 * sp), 0, 0); }); p1.visible = p2.visible = t < 2.4;
    atp.forEach((a, i) => { const k = ease(seg(t, 4.4 + i * .3, 5.6 + i * .3)); a.visible = t > 4.4 + i * .3; a.position.set((i < 2 ? -4 : 4) + (i % 2) * .8, 2 * k, 2 * k); });
    const ph = t < 2.4 ? 0 : t < 4.4 ? 1 : 2; if (g.userData.p !== ph) { g.userData.p = ph; g.remove(g.userData.ll || l); const nl = lab(['ATP 2개 투자: 인산을 붙여 불안정하게', '쪼개기: C₆ → C₃ + C₃', '회수: ATP 4개 + NADH 2개 → 순 2 ATP'][ph], '#ffd23f', .45); nl.position.set(0, 4, 0); g.add(nl); g.userData.ll = nl; } }; };
S.pyrC = g => carbonSplit(g, 3, [2], true, '피루브산 C₃ → 아세틸 CoA C₂ + CO₂ (ATP 없음!)');
S.tcaC = g => { const ring = new THREE.Mesh(new THREE.TorusGeometry(4, .25, 10, 60), M('#ffd27a', '#ff9a20', .8)); g.add(ring); const seq = [6, 5, 4, 4, 4], node = chain(6); g.add(node); const co2 = [mol('CO2'), mol('CO2')]; co2.forEach(c => g.add(c)); const l = lab('C₂ + C₄ → C₆ → C₅ → C₄ … 탄소가 줄 때 CO₂', '#ffd23f', .45); l.position.set(0, 6, 0); g.add(l);
  return t => { t %= 8; const a = t / 8 * Math.PI * 2; node.position.set(Math.sin(a) * 4, Math.cos(a) * 4, .6); const n = seq[Math.min(4, Math.floor(t / 1.6))]; node.children.forEach((c, i) => c.visible = i < n); ring.rotation.z = -a * .2;
    co2.forEach((c, i) => { const k = seg(t, 1.6 * (i + 1), 1.6 * (i + 1) + 1.4); c.visible = k > 0 && k < 1; c.position.copy(node.position).multiplyScalar(1 + k * .8).add(V(0, 0, k * 2)); }); }; };
S.count = g => { const atps = []; for (let i = 0; i < 32; i++) { const a = mol('ATP'); a.scale.setScalar(.38); g.add(a); atps.push(a); } const l = lab('', '#ffd23f', .55); g.add(l);
  return t => { t %= 9; const n = Math.floor(Math.min(32, t < 1 ? 2 : t < 2 ? 4 : 4 + (t - 2) * 6)); atps.forEach((a, i) => { a.visible = i < n; a.position.set((i % 8 - 3.5) * 1.3, Math.floor(i / 8) * 1.3 - 2, 0); a.rotation.y = t; });
    const ph = n <= 2 ? 0 : n <= 4 ? 1 : 2; if (g.userData.p !== ph || ph === 2) { g.userData.p = ph; g.remove(g.userData.ll || l); const nl = lab(['해당 과정 2', '+ TCA 회로 2 = 4 (기질 수준)', `+ 산화적 인산화 ${n - 4} → 총 ${n}`][ph], '#ffd23f', .55); nl.position.set(0, 4.2, 0); g.add(nl); g.userData.ll = nl; } }; };
/* 전자 계단 */
S.elev = g => { const cs = ['#4aa8ff', '#8a5aff', '#c48bff', '#ff5a5a'], names = ['NADH', 'Ⅰ', 'Ⅲ', 'Ⅳ → O₂']; cs.forEach((c, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, .7, 1.4), M(c, c, .5)); b.position.set(-5 + i * 3.4, 4 - i * 2.2, 0); g.add(b); const l = lab(names[i], c, .42); l.position.set(-5 + i * 3.4, 4.9 - i * 2.2, 0); g.add(l); }); const e = sph(.35, M('#fff27a', '#ffd000', 2.5)); g.add(e); const hp = dots(30, '#ff5a8a', .7); g.add(hp); const l = lab('전자가 계단을 내려가며 나온 에너지로 H⁺를 퍼 올림', '#fff27a', .42); l.position.set(0, 6.3, 0); g.add(l); const e1 = shout(g, '우와아아~ 미끄럼틀!', '#ffe066', .65), e2 = shout(g, '옥시: 잡았다! → 물', '#ff6a7a', .65);
  return t => { t %= 5; const k = t / 4; const i = Math.min(2.999, k * 3), j = Math.floor(i), f = i - j; e.position.set(-5 + (j + f) * 3.4, 4.6 - j * 2.2 - (f > .7 ? (f - .7) / .3 * 2.2 : 0), 0); setDots(hp, q => V(-3.3 + (q % 3) * 3.4, ((q * 7) % 10) / 10 * 6 * Math.min(1, k * 1.3) - 1, -1.2)); pop(e1, t, .3, 3); e1.position.copy(e.position).add(V(0, 1.8, 1)); pop(e2, t, 3.8, 5); e2.position.set(5, -3.6, 1); }; };
/* 막과 H⁺ 펌프, ATP 합성 효소 터빈 */
function memScene(g, L) { const m = membrane(16, 2); g.add(m); const pumps = [-5, -1.5, 2].map(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 2.6, 14), M('#8a5aff', '#8a5aff', .5)); p.position.set(x, 0, 0); g.add(p); return p; }); const syn = new THREE.Group(); syn.position.set(6, 0, 0); g.add(syn); const rot = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.6, 10), M('#ffd23f', '#ff9a00', .9)); syn.add(rot); const head = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 12), M('#ff9a3c', '#ff6a00', .7)); head.position.y = -2.6; syn.add(head);
  const hp = dots(80, '#ff5a8a', .75); g.add(hp); const w1 = shout(g, 'H⁺들: 나가게 해 줘~!!', '#ff5a8a', .6), w2 = shout(g, '위이이잉~ 터빈 풀가동 → ATP 퐁퐁', '#ffd23f', .6); const atp = mol('ATP'); atp.scale.setScalar(.6); g.add(atp);
  L.forEach(([s, x, y, c]) => { const l = lab(s, c, .42); l.position.set(x, y, 0); g.add(l); });
  return t => { setDots(hp, i => { const ph = (t * .6 + i / 80) % 1; if (i < 50) { const px = [-5, -1.5, 2][i % 3]; return ph < .5 ? V(px + Math.sin(i) * .3, -2 + ph * 2 * 5, .4) : V(px + Math.sin(i * 3) * 3, 2.2 + Math.cos(i * 1.7) * .9, .4); } return V(6 + Math.sin(i) * .3, 3 - ph * 6, .8); }); rot.rotation.y = t * 6; head.rotation.y = t * 2; const k = (t * .8) % 1; atp.position.set(6 + k * 2, -3.4 - k * 2, 1); const tt = t % 6; pop(w1, tt, .2, 2.8); w1.position.set(-2, 5.4, 1); pop(w2, tt, 3, 5.8); w2.position.set(3, -5.2, 1); }; };
S.mem = g => memScene(g, [['막사이공간 (H⁺ 많음)', 0, 4.2, '#ff5a8a'], ['기질', -4, -4, '#9fe'], ['ATP 합성 효소', 6, 2.4, '#ffd23f']]);
S.chl = g => memScene(g, [['타이라코이드 내부 (H⁺ 많음)', 0, 4.2, '#ff5a8a'], ['스트로마', -4, -4, '#9fe'], ['ATP 합성 효소 (광인산화)', 6, 2.4, '#ffd23f']]);
S.ferm = g => { const py = mol('pyruvate'); g.add(py); const lac = mol('lactate'); g.add(lac); const nadh = mol('NADH'), nad = mol('NAD'); g.add(nadh, nad); const l = lab('산소 없음 → NADH의 수소를 피루브산에게 → NAD⁺ 재생 → 해당 과정 계속', '#ff6fae', .42); l.position.set(0, 4.6, 0); g.add(l);
  return t => { t %= 6; const k = ease(seg(t, .5, 2)); nadh.position.set(-6 + 5 * k, 1.5, 0); nadh.visible = t < 2.2; py.position.set(0, 0, 0); py.visible = t < 2.2; lac.visible = t >= 2.2; const r = ease(seg(t, 2.4, 4.4)); nad.visible = t >= 2.2; nad.position.set(-1 - 6 * r, 1.5 + Math.sin(r * Math.PI) * 2, 0); }; };
/* 빛 흡수 스펙트럼: 빨강·파랑 흡수, 초록 반사 */
S.spec = g => { const leaf = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), M('#3fdc5a', '#0f8a2a', .5, { side: THREE.DoubleSide })); leaf.scale.set(1.4, 1, 1); g.add(leaf); const cols = ['#7a5cff', '#3fa0ff', '#3fdc5a', '#ffd23f', '#ff4a4a']; const rays = cols.map((c, i) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1, 6), M(c, c, 1.5)); g.add(r); return r; }); const l = lab('청자색·적색은 흡수, 녹색은 반사 → 잎이 녹색', '#8aff6a', .45); l.position.set(0, 5, 0); g.add(l);
  return t => { t %= 3; rays.forEach((r, i) => { const x = (i - 2) * 1.2, absorb = i !== 2 && i !== 3; const k = t / 3; const len = absorb ? Math.min(1, k * 1.6) * 6 : (k < .5 ? k * 2 * 6 : 6); const y0 = 8; r.scale.y = Math.max(.01, len); r.position.set(x - 3, y0 - len / 2, 0); r.rotation.z = .5; if (!absorb && k > .5) { r.position.set(x + 2.5 * (k - .5) * 4, 2 + (k - .5) * 8, 0); r.rotation.z = -.5; } }); }; };
S.ps = S.spec;
/* 명반응 Z: 물 분해 → 광계Ⅱ → 광계Ⅰ → NADPH */
S.z = g => { const p2 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1.4), M('#8a5aff', '#8a5aff', .6)); p2.position.set(-4, -1, 0); const p1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1.4), M('#5a8aff', '#5a8aff', .6)); p1.position.set(2, -1, 0); g.add(p2, p1); [['광계 Ⅱ (P680)', -4, -2.2], ['광계 Ⅰ (P700)', 2, -2.2], ['NADP⁺ → NADPH', 7, 2]].forEach(([s, x, y]) => { const l = lab(s, '#9fe', .42); l.position.set(x, y, 0); g.add(l); });
  const w = mol('H2O'); g.add(w); const o2 = mol('O2'); o2.scale.setScalar(.7); g.add(o2); const e = sph(.32, M('#fff27a', '#ffd000', 2.5)); g.add(e); const sun = sph(.8, M('#ffe066', '#ffcc00', 2)); g.add(sun); const nad = mol('NADPH'); nad.scale.setScalar(.8); g.add(nad);
  const path = new THREE.CatmullRomCurve3([V(-4, -1, 0), V(-3, 4, 0), V(-1, 1.5, 0), V(2, -1, 0), V(3, 4, 0), V(6.5, 1, 0)]);
  return t => { t %= 6; const kw = seg(t, 0, 1); w.position.set(-7 + 3 * kw, -3.4, 0); w.visible = t < 1.2; o2.visible = t > 1; o2.position.set(-5, -3.4 + (t - 1) * 1.6, 0); sun.position.set(-6 + Math.sin(t) * .3, 6, 0); const ke = seg(t, 1, 5); e.position.copy(path.getPoint(ke)); nad.visible = t > 5; nad.position.set(7, .6, 0); }; };
S.calvin = g => { const ring = new THREE.Mesh(new THREE.TorusGeometry(4, .25, 10, 60), M('#b8ff7a', '#5ac020', .8)); g.add(ring); const co = mol('CO2'); g.add(co); const pg = mol('pgal'); pg.scale.setScalar(.8); g.add(pg); const st = [['RuBP C₅', 0, 4.6], ['3PG C₃', 4.8, 0], ['PGAL C₃', 0, -4.8], ['RuBP 재생', -5, 0]]; st.forEach(([s, x, y]) => { const l = lab(s, '#b8ff7a', .42); l.position.set(x, y + .9, 0); g.add(l); }); const atp = mol('ATP'), nadph = mol('NADPH'); atp.scale.setScalar(.6); nadph.scale.setScalar(.6); g.add(atp, nadph); const l = lab('CO₂ 고정 → ATP·NADPH로 환원 → 당(PGAL) → RuBP 재생', '#b8ff7a', .42); l.position.set(0, 7, 0); g.add(l);
  return t => { t %= 6; ring.rotation.z = -t * .5; const k = ease(seg(t, 0, 1.2)); co.position.set(-7 + 7 * k, 7 - 2.6 * k, 0); co.visible = t < 1.4; const a = ease(seg(t, 1.8, 3)); atp.position.set(8 - 3.4 * a, -2 + a, 0); nadph.position.set(8 - 3.4 * a, -3.4 + a, 0); atp.visible = nadph.visible = t < 3.2; const p = ease(seg(t, 3.6, 5.4)); pg.visible = t > 3.6; pg.position.set(0, -4.8 - p * 3, p * 2); }; };
S.photoAll = S.calvin;
S.cmp = g => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(1.6, 2.4, 8, 20), M('#ff9a4a', '#a83a00', .4)); m.rotation.z = Math.PI / 2; m.position.x = 4.5; const c = sph(1, M('#5aff7a', '#0a7a20', .4)); c.scale.set(2.4, 1.6, 1.6); c.position.x = -4.5; g.add(m, c); [['엽록체: 광합성 (동화)', -4.5, 2.8, '#8aff6a'], ['마이토콘드리아: 세포호흡 (이화)', 4.5, 2.8, '#ff9a4a']].forEach(([s, x, y, col]) => { const l = lab(s, col, .42); l.position.set(x, y, 0); g.add(l); });
  const glu = mol('glucose'); glu.scale.setScalar(.45); const o2 = mol('O2'); o2.scale.setScalar(.6); const co2 = mol('CO2'); co2.scale.setScalar(.7); g.add(glu, o2, co2);
  return t => { t %= 4; const k = t / 4; glu.position.set(-2 + 4 * k, 1, 0); o2.position.set(-2 + 4 * k, -.4, 0); co2.position.set(2 - 4 * k, -1.8, 0); }; };
S.subs = g => { const cols = [['탄수화물 → 포도당 → 해당 과정', '#ffd23f'], ['지방 → 지방산 → 아세틸 CoA', '#ff9a3c'], ['단백질 → 아미노산 (−NH₃) → TCA 회로', '#ff6fae']]; const balls = cols.map(([s, c], i) => { const l = lab(s, c, .42); l.position.set(-4, 3 - i * 2.4, 0); g.add(l); const b = sph(.5, M(c)); g.add(b); return b; }); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, .2, 8, 40), M('#ffd27a', '#ff9a20', .8)); ring.position.set(6, 0, 0); g.add(ring); const lt = lab('같은 세포호흡 경로', '#ffd23f', .45); lt.position.set(6, 2.4, 0); g.add(lt);
  return t => { ring.rotation.z = t; balls.forEach((b, i) => { const k = ((t * .5 + i * .3) % 1); b.position.set(1 + k * 5, 3 - i * 2.4 + (0 - (3 - i * 2.4)) * k, 0); }); }; };
S.exp = S.z; S.rf = S.spec;


/* ═══ 3D 친구: 눈 깜빡, 말할 때 입·팔 움직임 ═══ */
const FCOL = { mito: '#5af0ff', enzy: '#3fd88a', atty: '#ffd23f', nadi: '#4aa8ff', oxy: '#ff6a7a', chloe: '#5aff7a' };
function friend(k) {
  const col = FCOL[k] || FCOL.mito, g = new THREE.Group(), mat = M(col, col, .35);
  let body; if (k === 'atty') body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 1.8), mat); else if (k === 'nadi') { body = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1.6, 8, 16), mat); body.rotation.z = Math.PI / 2; } else if (k === 'oxy') { body = new THREE.Group(); const a = sph(1.2, mat), b = sph(1.2, mat); a.position.x = -.8; b.position.x = .8; body.add(a, b); } else if (k === 'enzy') { body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 28, 20, .6, Math.PI * 2 - 1.2), M(col, col, .35, { side: THREE.DoubleSide })); body.rotation.x = -Math.PI / 2; body.rotation.z = Math.PI; } else { body = sph(1.4, mat); if (k === 'chloe') body.scale.set(1.3, 1, 1); }
  g.add(body);
  if (k === 'mito') { const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, .1, 8, 40), M('#ffe27a', '#ffcc00', .9)); halo.rotation.x = Math.PI / 2.3; g.add(halo); g.userData.halo = halo; }
  if (k === 'atty') for (let i = 0; i < 3; i++) { const p = sph(.28, M('#8a4aff', '#6a2ad0', .8)); p.position.set(-.7 + i * .7, -1.6, .9); g.add(p); }
  const eyes = [-1, 1].map(s => { const e = new THREE.Group(); const w = sph(.36, new THREE.MeshBasicMaterial({ color: '#fff' })); const p = sph(.18, new THREE.MeshBasicMaterial({ color: '#061018' })); p.position.z = .26; const hl = sph(.06, new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(.07, .08, .4); e.add(w, p, hl); e.position.set(s * .55, .35, 1.25); g.add(e); return e; });
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 10), new THREE.MeshBasicMaterial({ color: '#4a0f1a' })); mouth.position.set(0, -.45, 1.3); mouth.scale.set(1, .25, .4); g.add(mouth);
  const blush = [-1, 1].map(s => { const b = sph(.2, new THREE.MeshBasicMaterial({ color: '#ff7a9a', transparent: true, opacity: .55 })); b.scale.set(1, .6, .3); b.position.set(s * 1, -.15, 1.15); g.add(b); return b; });
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(.18, .9, 6, 10), mat); m.position.y = -.55; a.add(m); const hand = sph(.26, mat); hand.position.y = -1.1; a.add(hand); a.position.set(s * 1.45, -.1, .2); g.add(a); return a; });
  let blinkAt = 1 + Math.random() * 2, talkUntil = 0, gesture = 0;
  g.userData.talk = (sec) => { talkUntil = performance.now() / 1000 + sec; gesture = (gesture + 1) % 3; };
  g.userData.update = t => { const now = performance.now() / 1000, talking = now < talkUntil;
    g.position.y = Math.sin(t * 2.2) * .18; g.rotation.y = Math.sin(t * .9) * .25; g.rotation.z = Math.sin(t * 1.3) * .05;
    if (t > blinkAt) { const b = t - blinkAt; const s = b < .12 ? 1 - b / .12 : b < .24 ? (b - .12) / .12 : 1; eyes.forEach(e => e.scale.y = Math.max(.08, s)); if (b > .24) blinkAt = t + 2 + Math.random() * 2.5; } else eyes.forEach(e => e.scale.y = 1);
    mouth.scale.y = talking ? .25 + Math.abs(Math.sin(t * 14)) * .55 + Math.random() * .1 : .2; mouth.scale.x = talking ? 1.1 : .8;
    const w = talking ? 1 : .2; if (gesture === 0) { arms[0].rotation.z = -(.3 + Math.abs(Math.sin(t * 5)) * 1.6 * w); arms[1].rotation.z = .3 + Math.sin(t * 2) * .2; }
    else if (gesture === 1) { arms[0].rotation.z = -.4 - Math.sin(t * 6) * .3 * w; arms[1].rotation.z = .4 + Math.sin(t * 6 + 1) * .3 * w + w * .8; }
    else { arms.forEach((a, i) => a.rotation.z = (i ? 1 : -1) * (2.2 * w + .3 + Math.sin(t * 8) * .25 * w)); }
    if (g.userData.halo) g.userData.halo.rotation.z = t; };
  return g;
}

/* ═══ 재생기 ═══ */
let cur = null, T0 = 0, upd = null, bg = null;
export const ANIM = {
  has: k => !!S[k],
  play(key, sp) {
    if (cur && cur.userData.key === key && cur.userData.sp === sp) { this.talk(); return; } this.stop(); if (!sp && (!key || !S[key])) return;
    const g = new THREE.Group(); g.userData.key = key; const stage = new THREE.Group(); stage.add(g);
    const fr = friend(sp || 'mito'); fr.scale.setScalar(1.25); stage.add(fr); stage.userData.fr = fr; fr.position.set(S[key] ? -11 : 0, S[key] ? -5.5 : 0, 2);
    /* 뒤를 살짝 어둡게 가려 세포 배경과 구분 */
    bg = new THREE.Mesh(new THREE.CircleGeometry(13, 48), new THREE.MeshBasicMaterial({ color: '#031018', transparent: true, opacity: .94 })); bg.position.z = -3; stage.add(bg);
    const light = new THREE.PointLight('#ffffff', 40, 60, 1.5); light.position.set(0, 4, 10); stage.add(light);
    E.scene.add(stage); cur = stage; cur.userData.key = key; cur.userData.sp = sp; upd = S[key] ? S[key](g) : () => { }; this.talk(); T0 = performance.now(); g.scale.setScalar(.01);
  },
  talk(sec = 3.2) { if (cur && cur.userData.fr) cur.userData.fr.userData.talk(sec); },
  stop() { if (cur) { E.scene.remove(cur); cur.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } cur = null; upd = null; },
  /* 매 프레임: 카메라 앞에 붙여서 항상 보이게 */
  step() { if (!cur || !upd) return; const cam = E.cam, d = 17; const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd); cur.position.copy(cam.position).addScaledVector(fwd, d); cur.quaternion.copy(cam.quaternion);
    const t = (performance.now() - T0) / 1000, g = cur.children[0]; const s = Math.min(1, t * 3); g.scale.setScalar(1.1 * (s < 1 ? 1 - Math.pow(1 - s, 3) : 1)); try { upd(t); } catch (e) { console.warn(e); } const fr = cur.userData.fr; if (fr) { const base = S[cur.userData.key] ? V(-11, -5.5, 2) : V(0, 0, 2); fr.userData.update(t); fr.position.x = base.x; fr.position.y += base.y; }
    if (SHK > .01) { cur.position.add(V((Math.random() - .5) * SHK, (Math.random() - .5) * SHK, 0)); SHK *= .85; } }
};
window.ANIM = ANIM;
