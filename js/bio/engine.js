/* 미토: 엔진 — 렌더러, 블룸, 입력(조이스틱·드래그·키보드), 3인칭 카메라, 트윈, 파티클, 글자 스프라이트, 효과음 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const E = {};
const mobile = matchMedia('(pointer:coarse)').matches;
E.mobile = mobile;
E.quality = (() => { try { return localStorage.getItem('bio_q') || (mobile ? 'mid' : 'high'); } catch (e) { return 'mid'; } })();

export function initEngine(host) {
  const R = new THREE.WebGLRenderer({ antialias: E.quality === 'high', powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, E.quality === 'low' ? 1 : E.quality === 'mid' ? 1.25 : 1.75));
  R.setSize(innerWidth, innerHeight); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .82; R.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(R.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06121c'); scene.fog = new THREE.FogExp2('#0a2230', 0.012);
  const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 900);
  const composer = new EffectComposer(R); composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.28, 0.35, 0.62); composer.addPass(bloom); composer.addPass(new OutputPass());
  bloom.enabled = E.quality !== 'low';
  addEventListener('resize', () => { R.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
  Object.assign(E, { R, scene, cam, composer, bloom, THREE });
  return E;
}
export function setQuality(q) { E.quality = q; try { localStorage.setItem('bio_q', q); } catch (e) { } location.reload(); }

/* ── 입력 ── */
export const IN = { mx: 0, my: 0, up: 0, act: false, actPress: false, dash: false, yaw: Math.PI, pitch: -0.18, keys: {}, locked: false };
export function initInput(ui) {
  const K = IN.keys;
  addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; K[e.code] = 1; if (e.code === 'KeyE' || e.code === 'Enter') IN.actPress = true; if (e.code === 'ShiftLeft') IN.dash = true; });
  addEventListener('keyup', e => { K[e.code] = 0; });
  /* 조이스틱: 화면 왼쪽 40% 아무 곳이나 */
  const joy = ui.joy, knob = ui.knob; let jid = null, jx = 0, jy = 0;
  /* 카메라 드래그: 나머지 영역 */
  let did = null, dx = 0, dy = 0;
  const cv = E.R.domElement;
  const down = e => {
    if (IN.locked) return;
    for (const t of e.changedTouches || [e]) {
      const id = t.identifier ?? 'm';
      if (t.clientX < innerWidth * 0.42 && jid === null && (e.changedTouches || e.pointerType === 'touch')) { jid = id; jx = t.clientX; jy = t.clientY; joy.style.left = (jx - 60) + 'px'; joy.style.top = (jy - 60) + 'px'; joy.classList.add('on'); }
      else if (did === null) { did = id; dx = t.clientX; dy = t.clientY; }
    }
  };
  const move = e => {
    for (const t of e.changedTouches || [e]) {
      const id = t.identifier ?? 'm';
      if (id === jid) { let ox = t.clientX - jx, oy = t.clientY - jy; const L = Math.hypot(ox, oy), M = 50; if (L > M) { ox *= M / L; oy *= M / L; } knob.style.transform = `translate(${ox}px,${oy}px)`; IN.mx = ox / M; IN.my = -oy / M; }
      else if (id === did) { IN.yaw -= (t.clientX - dx) * 0.0055; IN.pitch = Math.max(-1.1, Math.min(0.75, IN.pitch - (t.clientY - dy) * 0.004)); dx = t.clientX; dy = t.clientY; }
    }
  };
  const up = e => { for (const t of e.changedTouches || [e]) { const id = t.identifier ?? 'm'; if (id === jid) { jid = null; IN.mx = IN.my = 0; knob.style.transform = ''; joy.classList.remove('on'); } if (id === did) did = null; } };
  cv.addEventListener('touchstart', e => { e.preventDefault(); down(e); }, { passive: false });
  cv.addEventListener('touchmove', e => { e.preventDefault(); move(e); }, { passive: false });
  cv.addEventListener('touchend', up); cv.addEventListener('touchcancel', up);
  cv.addEventListener('mousedown', e => { down(e); }); addEventListener('mousemove', e => { if (did === 'm') move(e); }); addEventListener('mouseup', up);
  /* 버튼 */
  const hold = (el, on, off) => { if (!el) return; const a = e => { e.preventDefault(); e.stopPropagation(); on(); el.classList.add('on'); }, b = e => { e.preventDefault(); off && off(); el.classList.remove('on'); }; el.addEventListener('touchstart', a, { passive: false }); el.addEventListener('touchend', b); el.addEventListener('mousedown', a); el.addEventListener('mouseup', b); el.addEventListener('mouseleave', b); };
  hold(ui.bUp, () => IN.upB = 1, () => IN.upB = 0); hold(ui.bDn, () => IN.dnB = 1, () => IN.dnB = 0);
  hold(ui.bAct, () => { IN.act = true; IN.actPress = true; }, () => IN.act = false); hold(ui.bDash, () => IN.dash = true);
}
export function readMove() {
  const K = IN.keys; let x = IN.mx, y = IN.my;
  if (K.KeyW || K.ArrowUp) y += 1; if (K.KeyS || K.ArrowDown) y -= 1; if (K.KeyA || K.ArrowLeft) x -= 1; if (K.KeyD || K.ArrowRight) x += 1;
  const L = Math.hypot(x, y); if (L > 1) { x /= L; y /= L; }
  const u = (K.Space || IN.upB ? 1 : 0) - (K.KeyC || K.ControlLeft || IN.dnB ? 1 : 0);
  const act = IN.act || !!K.KeyE;
  return { x, y, u, act };
}

/* ── 트윈 ── */
const TW = [];
export function tween(dur, fn, done) { const t = { t: 0, dur, fn, done }; TW.push(t); return t; }
export function wait(s) { return new Promise(r => tween(s, () => { }, r)); }
export function stepTweens(dt) { for (let i = TW.length - 1; i >= 0; i--) { const t = TW[i]; t.t += dt; const k = Math.min(1, t.t / t.dur); t.fn(k); if (k >= 1) { TW.splice(i, 1); t.done && t.done(); } } }
export const ease = { out: k => 1 - Math.pow(1 - k, 3), inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
/* 물체를 곡선으로 날려 보내기 (target: Vector3 또는 () => Vector3) */
export function fly(obj, target, dur = .8, arc = 4, done) {
  const a = obj.position.clone(); const tv = () => typeof target === 'function' ? target() : target;
  return tween(dur, k => { const e = ease.inOut(k); const b = tv(); obj.position.lerpVectors(a, b, e); obj.position.y += Math.sin(Math.PI * e) * arc; }, done);
}

/* ── 글자 스프라이트 ── */
export function label(text, o = {}) {
  const fs = o.size || 64, pad = 18; const c = document.createElement('canvas'); const x = c.getContext('2d');
  x.font = `900 ${fs}px "Noto Sans KR", system-ui, sans-serif`; const lines = String(text).split('\n'); const w = Math.max(...lines.map(l => x.measureText(l).width)) + pad * 2, h = lines.length * fs * 1.2 + pad * 2;
  c.width = Math.ceil(w); c.height = Math.ceil(h); x.font = `900 ${fs}px "Noto Sans KR", system-ui, sans-serif`;
  if (o.bg !== false) { x.fillStyle = o.bg || 'rgba(4,20,30,.72)'; x.strokeStyle = o.border || 'rgba(120,255,230,.9)'; x.lineWidth = 5; const r = 22; x.beginPath(); x.roundRect(3, 3, c.width - 6, c.height - 6, r); x.fill(); x.stroke(); }
  x.fillStyle = o.color || '#eafffb'; x.textAlign = 'center'; x.textBaseline = 'middle'; lines.forEach((l, i) => x.fillText(l, c.width / 2, pad + fs * .6 + i * fs * 1.2));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, depthTest: o.depthTest !== false });
  const s = new THREE.Sprite(m); const sc = (o.scale || 1) * 0.012; s.scale.set(c.width * sc, c.height * sc, 1); s.renderOrder = 10; return s;
}

/* ── 파티클 폭발 ── */
const BURSTS = [];
export function burst(pos, color = '#7fffe0', n = 40, speed = 8, life = 1.1, size = .35) {
  const g = new THREE.BufferGeometry(); const P = new Float32Array(n * 3), V = [];
  for (let i = 0; i < n; i++) { P[i * 3] = pos.x; P[i * 3 + 1] = pos.y; P[i * 3 + 2] = pos.z; const v = new THREE.Vector3().randomDirection().multiplyScalar(speed * (.4 + Math.random() * .8)); V.push(v); }
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  const m = new THREE.PointsMaterial({ color, size: size * .8, opacity: .7, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: dotTex() });
  const p = new THREE.Points(g, m); E.scene.add(p); BURSTS.push({ p, V, t: 0, life });
}
export function stepBursts(dt) { for (let i = BURSTS.length - 1; i >= 0; i--) { const b = BURSTS[i]; b.t += dt; const a = b.p.geometry.attributes.position; for (let k = 0; k < b.V.length; k++) { a.array[k * 3] += b.V[k].x * dt; a.array[k * 3 + 1] += b.V[k].y * dt; a.array[k * 3 + 2] += b.V[k].z * dt; b.V[k].multiplyScalar(1 - dt * 2.2); } a.needsUpdate = true; b.p.material.opacity = Math.max(0, 1 - b.t / b.life); if (b.t > b.life) { E.scene.remove(b.p); b.p.geometry.dispose(); b.p.material.dispose(); BURSTS.splice(i, 1); } } }
let _dot = null;
export function dotTex() { if (_dot) return _dot; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); _dot = new THREE.CanvasTexture(c); return _dot; }

/* ── 화면 흔들림 ── */
export const SHAKE = { v: 0 };
export function shake(v = .6) { SHAKE.v = Math.max(SHAKE.v, v); }

/* ── 효과음 (WebAudio 합성, 배경음 없음) ── */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
export function sfx(n) {
  const a = ac(); if (!a || E.mute) return; const t = a.currentTime; const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination);
  const env = (v, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + .02); };
  if (n === 'pick') { o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1760, t + .12); env(.18, .18); }
  else if (n === 'atp') { o.type = 'triangle'; o.frequency.setValueAtTime(1046, t); o.frequency.setValueAtTime(1568, t + .07); env(.16, .22); }
  else if (n === 'drop') { o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + .2); env(.2, .25); }
  else if (n === 'machine') { o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(140, t + .9); env(.09, 1); }
  else if (n === 'ok') { o.type = 'triangle'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(880, t + .1); o.frequency.setValueAtTime(1320, t + .2); env(.2, .4); }
  else if (n === 'bad') { o.type = 'square'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(90, t + .3); env(.12, .35); }
  else if (n === 'boom') { o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(30, t + .6); env(.25, .7); }
  else if (n === 'whoosh') { o.type = 'sine'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(1200, t + .3); env(.08, .35); }
  else if (n === 'win') { [523, 659, 784, 1046].forEach((f, i) => { const o2 = a.createOscillator(), g2 = a.createGain(); o2.type = 'triangle'; o2.frequency.value = f; o2.connect(g2); g2.connect(a.destination); const s = t + i * .11; g2.gain.setValueAtTime(.0001, s); g2.gain.exponentialRampToValueAtTime(.16, s + .02); g2.gain.exponentialRampToValueAtTime(.0001, s + .5); o2.start(s); o2.stop(s + .55); }); o.disconnect(); }
  else { o.type = 'sine'; o.frequency.value = 600; env(.1, .1); }
}
