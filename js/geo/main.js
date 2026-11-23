/* 기하 — 설명(3D 그림) → 직접 조작 확인 → 교과서 문제. 생명과학과 완전히 분리 (저장 키 geo_v1) */
import * as THREE from 'three';
import { initPlot } from './plot.js?v=2';
const $ = s => document.querySelector(s);
const CH = window.GEO;
const KEY = 'geo_v1';
let S = { ch: 0, step: 0, wrong: [], right: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

/* ── 3D ── */
const view = $('#view');
const R = new THREE.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio)); view.appendChild(R.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#f6f1e4');
const cam = new THREE.PerspectiveCamera(40, 1, .1, 200);
let yaw = .75, pitch = .42, dist = 14, auto = true;
const tgt = new THREE.Vector3(0, .5, 0); let panMode = false;
function place() { cam.position.set(tgt.x + Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z + Math.cos(yaw) * Math.cos(pitch) * dist); cam.lookAt(tgt); }
/* 화면을 끌어 시야 이동: 카메라의 오른쪽/위 방향으로 목표점을 옮김 */
function pan(dx, dy) { const k = dist * .0016, r = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0), u = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1); tgt.addScaledVector(r, -dx * k).addScaledVector(u, dy * k); }
function fit() { const w = view.clientWidth, h = view.clientHeight; R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
new ResizeObserver(fit).observe(view); fit();
let drag = null; const pts = new Map();
view.addEventListener('pointerdown', e => { const pd = document.getElementById('pad'); if (pd && !pd.hidden && !pd.classList.contains('peek')) return; if (e.target.closest && e.target.closest('.pt')) return; auto = false; pts.set(e.pointerId, [e.clientX, e.clientY]); drag = [e.clientX, e.clientY, yaw, pitch]; view.setPointerCapture(e.pointerId); });
view.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 2) { const [p, q] = [...pts.values()]; const d = Math.hypot(p[0] - q[0], p[1] - q[1]), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (drag.d) { dist = Math.max(4, Math.min(60, dist * drag.d / d)); pan(mx - drag.mx, my - drag.my); } drag.d = d; drag.mx = mx; drag.my = my; return; }
  if (panMode || e.shiftKey || (e.buttons & 6)) { pan(e.clientX - prev[0], e.clientY - prev[1]); return; }
  yaw -= (e.clientX - prev[0]) * .008; pitch = Math.max(-1.2, Math.min(1.4, pitch + (e.clientY - prev[1]) * .008)); });
const up = e => { pts.delete(e.pointerId); if (drag) drag.d = 0; }; view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
view.addEventListener('wheel', e => { e.preventDefault(); dist = Math.max(4, Math.min(60, dist * (1 + Math.sign(e.deltaY) * .08))); }, { passive: false });
view.addEventListener('contextmenu', e => e.preventDefault());
{ const nv = document.createElement('div'); nv.id = 'nav3d'; nv.innerHTML = '<button data-z="-1">＋</button><button data-z="1">－</button><button data-p>✥ 이동</button><button data-r>⟲ 처음</button>'; view.appendChild(nv);
  nv.addEventListener('pointerdown', e => e.stopPropagation());
  nv.onclick = e => { const b = e.target.closest('button'); if (!b) return; auto = false; if (b.dataset.z) dist = Math.max(4, Math.min(60, dist * (1 + b.dataset.z * .2))); if (b.dataset.p !== undefined) { panMode = !panMode; b.classList.toggle('on', panMode); } if (b.dataset.r !== undefined) { tgt.set(0, .5, 0); yaw = .75; pitch = .42; dist = 14; } }; }
(function loop() { if (auto) yaw += .0025; place(); R.render(scene, cam); requestAnimationFrame(loop); })();

/* 수학 좌표 (x 앞, y 오른쪽, z 위) → three 좌표 */
const M = (x, y, z) => new THREE.Vector3(y, z, x);
const G = new THREE.Group(); scene.add(G);
const mat = c => new THREE.LineBasicMaterial({ color: c });
function line(a, b, c = '#6b665c', dash = false) { const g = new THREE.BufferGeometry().setFromPoints([a, b]); const l = new THREE.Line(g, dash ? new THREE.LineDashedMaterial({ color: c, dashSize: .2, gapSize: .15 }) : mat(c)); if (dash) l.computeLineDistances(); G.add(l); return l; }
function arrow(a, b, c, w = 1) { const d = b.clone().sub(a), L = d.length(); if (L < .01) return; const h = new THREE.ArrowHelper(d.normalize(), a, L, c, Math.min(.55, L * .35) * w, Math.min(.3, L * .2) * w); G.add(h); }
function dot(p, c = '#c8392b', r = .14) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: c })); m.position.copy(p); G.add(m); }
function label(t, p, c = '#22201c', s = .55) { const cv = document.createElement('canvas'), x = cv.getContext('2d'); x.font = '700 44px Gowun Dodum, Noto Sans KR, sans-serif'; const w = x.measureText(t).width + 20; cv.width = w; cv.height = 60;
  x.font = '700 44px Gowun Dodum, Noto Sans KR, sans-serif'; x.fillStyle = c; x.strokeStyle = '#f6f1e4'; x.lineWidth = 9; x.strokeText(t, 10, 46); x.fillText(t, 10, 46);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false })); sp.scale.set(s * w / 60, s, 1); sp.position.copy(p).add(new THREE.Vector3(0, .35, 0)); G.add(sp); }
function axes(n = 6) { [[M(n, 0, 0), 'x'], [M(0, n, 0), 'y'], [M(0, 0, n), 'z']].forEach(([v, t]) => { line(v.clone().multiplyScalar(-1), v, '#9a9384'); arrow(v.clone().multiplyScalar(.95), v.clone().multiplyScalar(1.05), '#22201c'); label(t, v.clone().multiplyScalar(1.08), '#22201c'); });
  label('O', M(0, 0, 0), '#22201c', .45);
  for (let i = -n + 1; i < n; i++) if (i) [M(i, 0, 0), M(0, i, 0), M(0, 0, i)].forEach(p => dot(p, '#b5ad9c', .05)); }
function clear() { while (G.children.length) { const o = G.children.pop(); o.traverse(q => { q.geometry && q.geometry.dispose(); q.material && (q.material.map && q.material.map.dispose(), q.material.dispose()); }); } }
const P = (a) => M(a[0], a[1], a[2]);

/* ── 장면: 컨트롤 + 그리기 + 목표 확인 ── */
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.round(n), d) || 1; n = Math.round(n) / g; d /= g; return d === 1 ? `${n}` : `${n}/${d}`; };
const sq = v => { const n = Math.round(v); if (Math.abs(n - v) > 1e-9) return v.toFixed(2); for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) if (n % (k * k) === 0) { const r = n / (k * k); return r === 1 ? `${k}` : `${k}√${r}`; } return Number.isInteger(Math.sqrt(n)) ? `${Math.sqrt(n)}` : `√${n}`; };
const SC = {
  coord: { c: [['a (x)', -5, 5, 1, 1], ['b (y)', -5, 5, 1, 1], ['c (z)', -5, 5, 1, 2]], f([a, b, c]) {
      axes(); const p = M(a, b, c); dot(p); label(`P(${a}, ${b}, ${c})`, p, '#c8392b');
      const A = M(a, 0, 0), B = M(0, b, 0), Cc = M(0, 0, c), ab = M(a, b, 0), bc = M(0, b, c), ca = M(a, 0, c);
      [[p, ab], [p, bc], [p, ca], [ab, A], [ab, B], [bc, B], [bc, Cc], [ca, A], [ca, Cc]].forEach(([u, v]) => line(u, v, '#1f8a5a', true));
      [A, B, Cc].forEach(q => dot(q, '#1f8a5a', .1)); line(M(0, 0, 0), p, '#d9761a');
      return { r: `P(<b>${a}, ${b}, ${c}</b>)<br>OP = √(${a}² + ${b}² + ${c}²) = <b>${sq(a * a + b * b + c * c)}</b><br>xy평면 대칭 (${a}, ${b}, ${-c}) · x축 대칭 (${a}, ${-b}, ${-c})`, done: a === 2 && b === -3 && c === 4, msg: '좌표는 축과 만나는 값! OP = √(4 + 9 + 16) = √29' }; } },
  divide: { c: [['m', 1, 5, 1, 3], ['n', 1, 5, 1, 1]], f([m, n]) {
      axes(); const A = [5, -2, 3], B = [2, 1, 6]; const Pn = A.map((x, i) => m * B[i] + n * x);
      line(P(A), P(B), '#8fa8ff'); dot(P(A), '#d9761a'); dot(P(B), '#1f4fb8'); label('A(5, −2, 3)', P(A), '#b85a10', .45); label('B(2, 1, 6)', P(B), '#1f4fb8', .45);
      const p = Pn.map(v => v / (m + n)); dot(P(p), '#c8392b', .18); label(`P (${m} : ${n})`, P(p), '#c8392b', .5);
      return { r: `AB를 <b>${m} : ${n}</b>로 내분<br>P = ( (${m}·2 + ${n}·5)/${m + n}, … ) = (<b>${Pn.map(v => frac(v, m + n)).join(', ')}</b>)`, done: m * 2 === n, msg: '1 : 2 → (1·B + 2·A)/3 = (4, −1, 4). m은 B 쪽, n은 A 쪽에 곱해요.' }; } },
  sphere: { c: [['중심 a', -3, 3, 1, 0], ['중심 b', -3, 3, 1, 0], ['중심 c', -3, 3, 1, 0], ['반지름 r', 1, 4, 1, 3]], f([a, b, c, r]) {
      axes(); const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: '#1f4fb8', wireframe: true, transparent: true, opacity: .35 })); s.position.copy(M(a, b, c)); G.add(s);
      dot(M(a, b, c)); label(`C(${a}, ${b}, ${c})`, M(a, b, c), '#c8392b', .45); line(M(a, b, c), M(a, b, c + r), '#d9761a'); label(`r = ${r}`, M(a, b, c + r / 2), '#b85a10', .4);
      const t = (v, s) => v === 0 ? `${s}²` : `(${s}${v > 0 ? '−' : '+'}${Math.abs(v)})²`;
      return { r: `<b>${t(a, 'x')} + ${t(b, 'y')} + ${t(c, 'z')} = ${r * r}</b><br>xy평면과 만나는 원의 반지름: ${Math.abs(c) < r ? sq(r * r - c * c) : '만나지 않음 (접하면 r = |c|)'}`, done: a === 2 && b === 0 && c === -1 && r === 2, msg: '(x−2)² + y² + (z+1)² = 4. 부호는 중심 좌표와 반대!' }; } },
  cube: { c: [['평행이동 t', 0, 1, .05, 0]], f([t]) {
      const s = 3, o = -1.5; const V = { A: [o, o, o + s], B: [o + s, o, o + s], C: [o + s, o + s, o + s], D: [o, o + s, o + s], E: [o, o, o], F: [o + s, o, o], G: [o + s, o + s, o], H: [o, o + s, o] };
      [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']].forEach(([p, q]) => line(P(V[p]), P(V[q]), '#9a9384'));
      Object.entries(V).forEach(([k, v]) => label(k, P(v), '#22201c', .45));
      arrow(P(V.D), P(V.C), '#1f8a5a'); const sh = [0, s * t, 0]; arrow(P(V.A.map((x, i) => x + sh[i])), P(V.B.map((x, i) => x + sh[i])), '#c8392b', 1.3);
      return { r: `<v>AB</v>를 <v>AD</v> 방향으로 ${Math.round(t * 100)}% 평행이동<br>크기·방향이 같으면 위치가 달라도 <b>같은 벡터</b>`, done: t >= .99, msg: '<v>AB</v> = <v>DC</v> = <v>EF</v> = <v>HG</v> — 모두 같은 벡터!' }; } },
  add: { c: [['b의 각도', 0, 180, 5, 40]], f([th]) {
      axes(4); const a = [3, 0, 0], r = th * Math.PI / 180, b = [2.5 * Math.cos(r), 2.5 * Math.sin(r), 0]; const s = a.map((x, i) => x + b[i]), d = a.map((x, i) => x - b[i]);
      const O = M(0, 0, 0); arrow(O, P(a), '#d9761a'); label('a', P(a), '#b85a10'); arrow(O, P(b), '#1f4fb8'); label('b', P(b), '#1f4fb8');
      line(P(a), P(s), '#1f4fb8', true); line(P(b), P(s), '#d9761a', true); arrow(O, P(s), '#c8392b', 1.2); label('a+b', P(s), '#c8392b');
      arrow(P(b), P(a), '#7a3fb0'); label('a−b', P(a).clone().add(P(b)).multiplyScalar(.5), '#7a3fb0', .45);
      const L = v => Math.hypot(...v); return { r: `|<v>a</v> + <v>b</v>| = <b>${L(s).toFixed(2)}</b> · |<v>a</v> − <v>b</v>| = <b>${L(d).toFixed(2)}</b><br>노란 대각선 = 합 (평행사변형법), 보라 = 차 (<v>b</v>의 끝 → <v>a</v>의 끝)`, done: th === 90, msg: '두 대각선 길이가 같으면 직사각형 → <v>a</v> ⊥ <v>b</v>. 내적으로 보면 4<v>a</v>·<v>b</v> = 0!' }; } },
  scale: { c: [['k', -3, 3, .5, 1]], f([k]) {
      axes(4); const a = [1.2, 1, .6], O = M(0, 0, 0); arrow(O, P(a), '#d9761a'); label('a', P(a), '#b85a10');
      const off = M(0, 0, -.6); arrow(off, P(a.map(x => -2 * x)).add(off), '#1f8a5a'); label('목표', P(a.map(x => -2 * x)).add(off), '#1f8a5a', .4);
      arrow(O, P(a.map(x => k * x)), '#c8392b', 1.2); label(`${k}a`, P(a.map(x => k * x)), '#c8392b', .45);
      return { r: `k = <b>${k}</b> → ${k > 0 ? '같은 방향' : k < 0 ? '반대 방향' : '영벡터'}, 크기 <b>${Math.abs(k)}</b>배`, done: k === -2, msg: '−2<v>a</v>: 반대 방향, 크기 2배. 평행 ⇔ <v>b</v> = k<v>a</v>' }; } },
  pos: { c: [['t', 0, 1, .1, .2]], f([t]) {
      axes(4); const A = [4, -2, 1], B = [-1, 3, 3], O = M(0, 0, 0); const p = A.map((x, i) => (1 - t) * x + t * B[i]);
      arrow(O, P(A), '#d9761a'); label('A (a)', P(A), '#b85a10', .45); arrow(O, P(B), '#1f4fb8'); label('B (b)', P(B), '#1f4fb8', .45); line(P(A), P(B), '#6b665c');
      arrow(O, P(p), '#c8392b', 1.2); label('P', P(p), '#c8392b');
      const m = Math.round(t * 10), n = 10 - m, g = gcd(m, n) || 1;
      return { r: `<v>p</v> = (1−t)<v>a</v> + t<v>b</v>, t = <b>${t.toFixed(1)}</b><br>AP : PB = <b>${m / g} : ${n / g}</b>`, done: Math.abs(t - .6) < .01, msg: '3 : 2 내분 → <v>p</v> = (3<v>b</v> + 2<v>a</v>)/5 = (2/5)<v>a</v> + (3/5)<v>b</v>' }; } },
  comp: { c: [['a₁', -4, 4, 1, 1], ['a₂', -4, 4, 1, 1], ['a₃', -4, 4, 1, 1]], f([x, y, z]) {
      axes(5); const O = M(0, 0, 0); arrow(O, M(x, 0, 0), '#c8392b'); arrow(M(x, 0, 0), M(x, y, 0), '#1f8a5a'); arrow(M(x, y, 0), M(x, y, z), '#1f4fb8');
      arrow(O, M(x, y, z), '#c8392b', 1.2); label(`a = (${x}, ${y}, ${z})`, M(x, y, z), '#c8392b', .45); line(O, M(x, y, 0), '#22201c44', true);
      return { r: `<v>a</v> = <b style="color:#c8392b">${x}</b><v>e₁</v> + <b style="color:#1f8a5a">${y}</b><v>e₂</v> + <b style="color:#1f4fb8">${z}</b><v>e₃</v><br>|<v>a</v>| = <b>${sq(x * x + y * y + z * z)}</b>`, done: x === 2 && y === 3 && z === -1, msg: '(2, 3, −1) = 2<v>e₁</v> + 3<v>e₂</v> − <v>e₃</v>, 크기 √14' }; } },
  dot: { c: [['각 θ', 0, 180, 5, 45]], f([th]) {
      axes(4); const r = th * Math.PI / 180, O = M(0, 0, 0), a = [3, 0, 0], b = [2 * Math.cos(r), 2 * Math.sin(r), 0];
      arrow(O, P(a), '#d9761a'); label('a', P(a), '#b85a10'); arrow(O, P(b), '#1f4fb8'); label('b', P(b), '#1f4fb8');
      line(P(b), M(b[0], 0, 0), '#22201c88', true); arrow(O, M(b[0], 0, 0), '#c8392b', .8); label('정사영', M(b[0], 0, 0), '#c8392b', .35);
      const d = 6 * Math.cos(r); return { r: `<v>a</v>·<v>b</v> = |<v>a</v>||<v>b</v>|cos θ = 3·2·cos ${th}° = <b>${Math.abs(d) < 1e-9 ? 0 : d.toFixed(2)}</b><br>${th < 90 ? '예각 → 양수' : th > 90 ? '둔각 → 음수' : '직각 → 0'}`, done: th === 90, msg: '<v>a</v> ⊥ <v>b</v> ⇔ <v>a</v>·<v>b</v> = 0' }; } },
  line: { c: [['t', -3, 3, .5, 0]], f([t]) {
      axes(5); const A = [1, -2, 1], u = [1, 2, 1], O = M(0, 0, 0), B = A.map((x, i) => x + 2 * u[i]), p = A.map((x, i) => x + t * u[i]);
      line(P(A.map((x, i) => x - 4 * u[i])), P(A.map((x, i) => x + 4 * u[i])), '#6b665c'); arrow(O, P(A), '#d9761a'); label('A(1, −2, 1)', P(A), '#b85a10', .42);
      arrow(P(A), P(A.map((x, i) => x + u[i])), '#1f8a5a', 1); label('u', P(A.map((x, i) => x + u[i] / 2)), '#1f8a5a', .4); dot(P(B), '#1f4fb8'); label('B(3, 2, 3)', P(B), '#1f4fb8', .42);
      arrow(O, P(p), '#c8392b', 1.1); label('P', P(p), '#c8392b');
      return { r: `<v>p</v> = <v>a</v> + t<v>u</v>, <v>u</v> = (1, 2, 1), t = <b>${t}</b><br>P = (<b>${p.join(', ')}</b>)<br>직선: <b>x − 1 = (y + 2)/2 = z − 1</b>`, done: t === 2, msg: 't = 2에서 B. 방향벡터 성분이 분모, 지나는 점이 분자에!' }; } }
};


/* ── 펜 연습장: 문제 풀 때 왼쪽이 모눈 종이로 바뀜. 문제마다 필기 저장 (geo_ink_v1) ── */
const INK = 'geo_ink_v1'; let ink = {}; try { ink = JSON.parse(localStorage.getItem(INK)) || {}; } catch (e) { }
const pad = document.createElement('div'); pad.id = 'pad'; pad.hidden = true;
pad.innerHTML = `<canvas></canvas><div class="pt"><button data-c="#22201c" class="on">검정</button><button data-c="#c8392b">빨강</button><button data-c="#1f4fb8">파랑</button><button data-e>지우개</button><button data-x>전체 지우기</button><button data-p>펜만 인식</button><button data-v>3D 보기</button></div>`;
view.appendChild(pad);
const pc = pad.querySelector('canvas'), px = pc.getContext('2d'); let penCol = '#22201c', erase = false, penOnly = false, padKey = null, cur = null;
try { penOnly = localStorage.getItem('geo_penonly') === '1'; } catch (e) { }
pad.querySelector('[data-p]').classList.toggle('on', penOnly);
function padFit() { const r = pad.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); const old = pc.width ? pc.toDataURL() : null; pc.width = r.width * d; pc.height = r.height * d; pc.style.width = r.width + 'px'; pc.style.height = r.height + 'px'; px.setTransform(d, 0, 0, d, 0, 0); if (old && padKey) load(padKey); }
new ResizeObserver(() => { if (!pad.hidden) padFit(); }).observe(view);
function load(k) { px.clearRect(0, 0, pc.width, pc.height); const src = ink[k]; if (!src) return; const im = new Image(); im.onload = () => { px.save(); px.setTransform(1, 0, 0, 1, 0, 0); px.drawImage(im, 0, 0, pc.width, pc.height); px.restore(); }; im.src = src; }
function store() { if (!padKey) return; ink[padKey] = pc.toDataURL('image/png'); const keys = Object.keys(ink); if (keys.length > 40) delete ink[keys[0]]; try { localStorage.setItem(INK, JSON.stringify(ink)); } catch (e) { delete ink[keys[0]]; } }
function padOn(k) { padKey = k; pad.hidden = false; padFit(); load(k); }
function padOff() { if (!pad.hidden) store(); pad.hidden = true; padKey = null; }
pc.addEventListener('pointerdown', e => { if (penOnly && e.pointerType !== 'pen') return; e.stopPropagation(); pc.setPointerCapture(e.pointerId); const r = pc.getBoundingClientRect(); cur = { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId }; });
pc.addEventListener('pointermove', e => { if (!cur || e.pointerId !== cur.id) return; e.stopPropagation(); const r = pc.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  px.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; px.strokeStyle = penCol; px.lineCap = px.lineJoin = 'round'; px.lineWidth = erase ? 26 : (e.pressure > 0 && e.pointerType === 'pen' ? 1.2 + e.pressure * 2.6 : 2.4);
  px.beginPath(); px.moveTo(cur.x, cur.y); px.lineTo(x, y); px.stroke(); cur.x = x; cur.y = y; });
const padUp = e => { if (cur && e.pointerId === cur.id) { cur = null; store(); } }; pc.addEventListener('pointerup', padUp); pc.addEventListener('pointercancel', padUp);
pad.querySelector('.pt').onclick = e => { const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.c) { penCol = b.dataset.c; erase = false; pad.querySelectorAll('[data-c],[data-e]').forEach(x => x.classList.toggle('on', x === b)); }
  if (b.dataset.e !== undefined) { erase = true; pad.querySelectorAll('[data-c],[data-e]').forEach(x => x.classList.toggle('on', x === b)); }
  if (b.dataset.x !== undefined && confirm('이 문제의 필기를 모두 지울까요?')) { px.clearRect(0, 0, pc.width, pc.height); store(); }
  if (b.dataset.p !== undefined) { penOnly = !penOnly; b.classList.toggle('on', penOnly); try { localStorage.setItem('geo_penonly', penOnly ? '1' : '0'); } catch (e) { } }
  if (b.dataset.v !== undefined) { pad.classList.toggle('peek'); b.textContent = pad.classList.contains('peek') ? '연습장으로' : '3D 보기'; } };
let curScene = null;
const plot = initPlot({ THREE, view, G, M, line, arrow, dot, label, axes, clear, restore: () => { if (curScene) setScene(curScene, null); }, setAuto: v => { auto = v; }, setDist: d => { dist = Math.max(10, Math.min(40, d)); } });
/* ── 흐름 ── */
const face = `<svg class="pf" viewBox="0 0 64 64" fill="none" stroke="#22201c" stroke-width="2.6" stroke-linejoin="round"><path d="M10 22 L24 10 L56 12 L54 46 L40 58 L8 56Z" fill="#fff"/><path d="M10 22 L42 24 L40 58 M42 24 L56 12"/><circle cx="20" cy="36" r="2.6" fill="#22201c"/><circle cx="32" cy="37" r="2.6" fill="#22201c"/><path d="M20 46 q6 4 12 0"/><path d="M44 30 l6 -4" stroke="#c8392b"/></svg>`;
const hd = $('#hd'), body = $('#body'), ft = $('#ft');
function header(c) { hd.innerHTML = `${face}<div><b>${c.t}</b><small>교과서 ${c.p} · 큐비와 함께</small></div><button class="mb">목차</button>`; hd.querySelector('.mb').onclick = menu; }
function foot(btns) { ft.innerHTML = ''; btns.forEach(([t, f, cls]) => { const b = document.createElement('button'); b.textContent = t; if (cls) b.className = cls; b.onclick = f; ft.appendChild(b); }); body.scrollTop = 0; }
let ctlVals = [];
function setScene(name, interactive) { curScene = name; const sc = SC[name]; ctlVals = sc.c.map(c => c[4]); const run = () => { clear(); return sc.f(ctlVals); }; let out = run();
  if (!interactive) return null;
  const box = document.createElement('div'); box.className = 'ctl'; const read = document.createElement('div'); read.className = 'read'; read.innerHTML = out.r;
  sc.c.forEach(([n, lo, hi, st], i) => { const lb = document.createElement('span'); lb.textContent = n; const inp = document.createElement('input'); inp.type = 'range'; inp.min = lo; inp.max = hi; inp.step = st; inp.value = ctlVals[i]; const v = document.createElement('b'); v.textContent = ctlVals[i];
    inp.oninput = () => { ctlVals[i] = +inp.value; v.textContent = inp.value; out = run(); read.innerHTML = out.r; check(); }; box.append(lb, inp, v); });
  let hit = false; const okEl = document.createElement('div'); okEl.className = 'ok'; okEl.hidden = true;
  const check = () => { if (out.done && !hit) { hit = true; okEl.hidden = false; okEl.innerHTML = '✓ 성공! ' + out.msg; interactive(); } };
  return [box, read, okEl]; }

function show() { const c = CH[S.ch]; if (!c) return menu(); S.pos = S.pos || {}; S.seen = S.seen || {}; S.pos[c.id] = S.step; S.seen[c.id + '@' + S.step] = 1; header(c); save(); padOff(); pad.classList.remove('peek'); plot.hide();
  const L = c.learn.length, n = c.probs.length;
  if (S.step < L) { const [t, x] = c.learn[S.step]; setScene(c.scene, null); auto = true;
    body.innerHTML = `<span class="tag">개념 ${S.step + 1} / ${L}</span><div class="prog">${c.learn.map((_, i) => `<i class="${i <= S.step ? 'on' : ''}"></i>`).join('')}</div><div class="bub">${face}<div class="card"><h2>${t}</h2>${x}</div></div><p class="paper">왼쪽 3D 그림은 끌어서 돌릴 수 있어요 (두 손가락으로 확대).</p>`;
    foot([...(S.step ? [['◀ 이전', () => { S.step--; show(); }]] : []), ['다음 ▶', () => { S.step++; show(); }, 'pri']]); return; }
  if (S.step === L) { body.innerHTML = `<span class="tag">직접 해 보기</span><div class="card">${c.mission}</div>`; const next = () => { nb.disabled = false; };
    const els = setScene(c.scene, next); body.append(...els); foot([['건너뛰기', () => { S.step++; show(); }], ['문제 풀기 ▶', () => { S.step++; show(); }, 'pri']]); const nb = ft.lastChild; nb.disabled = true; return; }
  const k = S.step - L - 1; if (k >= n) { S.right[c.id] = 1; S.ch++; S.step = 0; save(); return show(); }
  const q = c.probs[k]; padOn(c.id + ':' + k); setScene(c.scene, null); plot.set(c.id + ':' + k, q.q);
  body.innerHTML = probHTML(c, k, q, `<span class="tag">교과서 문제 ${k + 1} / ${n}</span><div class="prog">${c.probs.map((_, i) => `<i class="${i <= k ? 'on' : ''}"></i>`).join('')}</div>`) + `<p class="paper">왼쪽 연습장에 펜으로 풀어 보세요. 막히면 힌트를 하나씩. (필기는 문제마다 저장돼요)</p>`;
  const key = c.id + ':' + k;
  hintButtons(c, q, null, () => foot([['✗ 틀림', () => { if (!S.wrong.includes(key)) S.wrong.push(key); S.step++; show(); }], ['✓ 맞음', () => { S.wrong = S.wrong.filter(x => x !== key); S.step++; show(); }, 'pri']]), key); }


/* ── 문제 화면: 그림 + 단계별 힌트 → 풀이 ── */
const KEYTIP = { c1: '두 점 사이의 거리 √{(Δx)² + (Δy)² + (Δz)²} · 축 위면 나머지 좌표 0, 좌표평면 위면 그 평면에 없는 좌표 0', c2: '내분점 ((mx₂+nx₁)/(m+n), …) · 중점은 평균 · 무게중심은 세 점 좌표의 평균', c3: '(x−a)² + (y−b)² + (z−c)² = r² · 일반형은 완전제곱식으로 바꿔 중심·반지름 찾기', c4: '크기와 방향이 모두 같아야 같은 벡터 · 시점 위치는 상관없음', c5: '꼬리-머리 잇기: AB + BC = AC · 뺄셈 AB − AC = CB · −AB = BA', c6: '평행 ⇔ 한쪽이 다른 쪽의 실수배 · 세 점 한 직선 ⇔ AC = k·AB', c7: '위치벡터: AB = b − a · m:n 내분점 (mb + na)/(m + n)', c8: '성분끼리 계산 · 크기 √(x² + y² + z²) · AB = (B 성분 − A 성분)', c9: 'a·b = |a||b|cosθ = x₁x₂ + y₁y₂ + z₁z₂ · 수직 ⇔ a·b = 0 · |a|² = a·a', c10: '(x−x₁)/a = (y−y₁)/b = (z−z₁)/c, 방향벡터 (a, b, c) · 두 직선의 각은 방향벡터의 각 (cos는 절댓값)' };
function hintSteps(q, id) { if (window.GEOHS && window.GEOHS[id]) return window.GEOHS[id]; if (q.hs) return q.hs; const h = (q.h || '').replace(/<br>/g, ' '); let parts = h.split(/\s*(?=\(\d\))|(?<=[.:])\s+(?=[^\d\s])|\s→\s/).map(x => x.trim()).filter(x => x.length > 1); if (parts.length < 2 && h.includes('→')) parts = h.split('→').map(x => x.trim()); return parts; }
function probHTML(c, k, q, tag) { const fig = window.GEOFIG && window.GEOFIG[c.id + ':' + k]; return `${tag}<div class="card"><div class="src">${q.s}</div>${fig ? `<div class="fig">${fig()}</div>` : ''}<div class="q">${q.q}</div></div><div class="hints"></div><div class="ans" hidden><b>답</b> ${q.a}${q.h ? `<div class="h"><b>전체 풀이</b> ${q.h}</div>` : ''}</div>`; }
function guideRun(id, box, done) { const G = window.GEOQA[id]; let i = 0;
  const step = () => { if (i >= G.length) { box.insertAdjacentHTML('beforeend', `<div class="gq end"><div class="bub2">${face}<p>좋아, 길은 다 찾았어! 이제 <b>연습장에 직접 계산</b>해서 답을 써 보고, 답·풀이로 확인해.</p></div></div>`); done(); body.scrollTop = 1e5; return; }
    const [qq, opts0, ans0, why] = G[i], d = document.createElement('div'); d.className = 'gq'; let tries = 0;
    const ord = opts0.map((_, k) => k).sort(() => Math.random() - .5), opts = ord.map(k => opts0[k]), ans = ord.indexOf(ans0);
    d.innerHTML = `<div class="bub2">${face}<p><span class="no">${i + 1}/${G.length}</span> ${qq}</p></div><div class="opts">${opts.map((o, k) => `<button data-k="${k}">${o}</button>`).join('')}</div><div class="why" hidden></div>`;
    box.appendChild(d); body.scrollTop = 1e5;
    d.querySelector('.opts').onclick = e => { const b = e.target.closest('button'); if (!b || d.dataset.ok) return; const k = +b.dataset.k;
      if (k !== ans) { tries++; b.classList.add('no'); b.disabled = true; const w = d.querySelector('.why'); w.hidden = false; w.className = 'why bad';
        w.innerHTML = tries >= 2 ? `괜찮아, 정답은 <b>${opts[ans]}</b>. ${why}` : '음… 다시 생각해 봐! 왜 그런지 한 번 더.'; if (tries >= 2) { d.dataset.ok = 1; d.querySelectorAll('.opts button')[ans].classList.add('ok'); next(d); } return; }
      d.dataset.ok = 1; b.classList.add('ok'); const w = d.querySelector('.why'); w.hidden = false; w.className = 'why good'; w.innerHTML = `${tries ? '그렇지!' : '맞아! 👍'} ${why}`; next(d); };
  };
  const next = d => { const nb = document.createElement('button'); nb.className = 'gnext'; nb.textContent = i + 1 < G.length ? '다음 질문 ▶' : '정리 ▶'; nb.onclick = () => { nb.remove(); i++; step(); }; d.appendChild(nb); body.scrollTop = 1e5; };
  step(); }
function hintButtons(c, q, onDone, finish, id) { if (window.GEOQA && window.GEOQA[id]) { const box = body.querySelector('.hints'); let started = false;
    const showAns = () => { body.querySelector('.ans').hidden = false; finish(); body.scrollTop = 1e5; };
    foot([['🧭 같이 풀기', () => { if (started) return; started = true; foot([['답·풀이 보기', showAns, 'pri']]); guideRun(id, box, () => {}); }, 'pri'], ['답·풀이 보기', showAns]]); return; }
  const steps = hintSteps(q, id), box = body.querySelector('.hints'); let n = 0;
  const showHint = () => { if (n === 0) box.innerHTML += `<div class="hint k"><b>핵심 개념</b> ${KEYTIP[c.id] || ''}</div>`; else box.innerHTML += `<div class="hint"><b>힌트 ${n}</b> ${steps[n - 1]}</div>`; n++; render(); body.scrollTop = 1e5; };
  const render = () => { const left = steps.length + 1 - n; foot([...(left > 0 ? [[n === 0 ? '💡 힌트' : `💡 다음 힌트 (${left})`, showHint]] : []), ['답·풀이 보기', () => { body.querySelector('.ans').hidden = false; finish(); body.scrollTop = 1e5; }, 'pri']]); };
  render(); }
let wq = null;
function wrongMode() { $('#menu').hidden = true; wq = S.wrong.slice(); nextWrong(); }
function nextWrong() { if (!wq.length) { wq = null; return menu(); } const [id, k] = wq[0].split(':'); const c = CH.find(x => x.id === id), q = c.probs[+k]; header(c); setScene(c.scene, null); padOff(); padOn(wq[0]); plot.set(wq[0], q.q);
  body.innerHTML = probHTML(c, +k, q, `<span class="tag">오답 다시 — 남은 ${wq.length}</span>`);
  hintButtons(c, q, null, () => foot([['✗ 또 틀림', () => { wq.shift(); nextWrong(); }], ['✓ 맞음', () => { S.wrong = S.wrong.filter(x => x !== wq[0]); save(); wq.shift(); nextWrong(); }, 'pri']]), id + ':' + k); }

/* 챕터의 원하는 단계부터: 개념 n · 직접 해 보기 · 문제 n */
function stepPick(ci) { const c = CH[ci], m = $('#menu'), L = c.learn.length, P = (S.pos || {})[c.id], seen = S.seen || {};
  const btn = (st, t, sub) => `<button data-go="${ci}:${st}" class="${seen[c.id + '@' + st] ? 'seen' : ''}${P === st ? ' here' : ''}"><b>${seen[c.id + '@' + st] ? '✓ ' : ''}${t}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
  const ps = c.probs.map((q, k) => { const w = S.wrong.includes(c.id + ':' + k); return btn(L + 1 + k, `문제 ${k + 1}${w ? ' ✗' : ''}`, q.s); });
  m.innerHTML = `<div class="mc"><h1>${ci + 1}. ${c.t}</h1><p>${c.p} · 원하는 곳을 눌러 거기서부터 시작해요.</p>
  <div class="row">${P != null ? `<button data-go="${ci}:${P}">이어하기 (마지막 위치)</button>` : ''}<button class="s" data-back>◀ 목차</button></div>
  <h3>개념 설명</h3><div class="ch">${c.learn.map(([t], i) => btn(i, `개념 ${i + 1}`, t)).join('')}</div>
  <h3>직접 해 보기</h3><div class="ch">${btn(L, '3D 조작 확인')}</div>
  <h3>교과서 문제</h3><div class="ch">${ps.join('')}</div></div>`; m.scrollTop = 0; }
function menu() { padOff(); plot.hide(); const m = $('#menu'); m.hidden = false;
  m.innerHTML = `<div class="mc"><h1>기하 — 공간좌표와 벡터</h1><p>범위 p80~152, p160~166 (p153~158 평면과 구의 방정식 제외). 설명 → 직접 해 보기 → 교과서 문제 순서로 자동 진행돼요.</p>
  <div class="row"><button data-a="go">${S.ch < CH.length ? `이어하기 — ${CH[S.ch].t}` : '처음부터 다시'}</button><button class="s" data-a="wrong">오답 다시 (${S.wrong.length})</button><button class="s" data-a="home">과목 선택</button></div>
  <div class="ch">${CH.map((c, i) => `<button data-c="${i}" class="${S.right[c.id] ? 'done' : ''}"><b>${S.right[c.id] ? '✓ ' : ''}${i + 1}. ${c.t}</b><small>${c.p} · 문제 ${c.probs.length}개</small></button>`).join('')}</div></div>`;
  m.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.c) return stepPick(+b.dataset.c); if (b.dataset.go) { const [ci, st] = b.dataset.go.split(':').map(Number); S.ch = ci; S.step = st; m.hidden = true; return show(); } if (b.dataset.back !== undefined) return menu();
    const a = b.dataset.a; if (a === 'go') { if (S.ch >= CH.length) { S.ch = 0; S.step = 0; } m.hidden = true; show(); } if (a === 'wrong') { if (S.wrong.length) wrongMode(); } if (a === 'home') location.href = 'index.html'; }; }

if (S.ch < CH.length) show(); else menu();
