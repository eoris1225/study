/* 3D로 그려 보기: 문제의 점을 자동으로 넣고, 점·선분·벡터·구·직선·내분점·무게중심을 3D로 확인 */
export function initPlot({ THREE, view, G, M, line, arrow, dot, label, axes, clear, restore, setAuto, setDist, setShift }) {
  const KEY = 'geo_plot_v1'; let store = {}; try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { }
  const btn = document.createElement('button'); btn.id = 'plotBtn'; btn.textContent = '📍 3D로 그려 보기'; btn.hidden = true; view.appendChild(btn);
  const pn = document.createElement('div'); pn.id = 'plot'; pn.hidden = true;
  pn.innerHTML = `<div class="ph"><b>3D로 그려 보기</b><button data-fold>◀ 접기</button><button data-x>닫기 ✕</button></div>
  <textarea spellcheck="false" placeholder="한 줄에 하나씩"></textarea>
  <div class="ex">${['A(1, 2, 3)', '선분 AB', '벡터 AB', '중점 AB', '내분 AB 2:1', '무게중심 ABC', '삼각형 ABC', '구 (1, 2, 3) 3', '직선 A (1, 2, 1)', '직선 AB'].map(s => `<button>${s}</button>`).join('')}</div>
  <div class="pb"><button data-go class="pri">그리기 ▶</button></div><div class="out"></div>`;
  view.appendChild(pn);
  const ta = pn.querySelector('textarea'), out = pn.querySelector('.out'); let key = null, prob = '';
  const COL = ['#c8392b', '#1f4fb8', '#1f8a5a', '#d9761a', '#7a3fb0', '#22201c'];
  const num = s => { s = s.trim().replace('−', '-'); if (/^-?\d+(\.\d+)?\/\d+$/.test(s)) { const [a, b] = s.split('/'); return +a / +b; } const r = s.match(/^(-?\d*)√(\d+)$/); if (r) return (r[1] === '' ? 1 : r[1] === '-' ? -1 : +r[1]) * Math.sqrt(+r[2]); return +s; };
  const vec = s => { const m = s.match(/\(([^)]*)\)/); if (!m) return null; const v = m[1].split(',').map(num); if (v.length === 2) v.push(0); return v.length === 3 && v.every(x => isFinite(x)) ? v : null; };
  const f = x => { const r = Math.round(x * 100) / 100; return Number.isInteger(r) ? `${r}` : `${r}`; };
  const fv = v => `(${v.map(f).join(', ')})`;
  const sqf = d2 => { const n = Math.round(d2 * 1e6) / 1e6; if (Math.abs(n - Math.round(n)) < 1e-6) { const m = Math.round(n); for (let k = Math.floor(Math.sqrt(m)); k > 1; k--) if (m % (k * k) === 0) { const r = m / (k * k); return r === 1 ? `${k}` : `${k}√${r}`; } return Number.isInteger(Math.sqrt(m)) ? `${Math.sqrt(m)}` : `√${m}`; } return Math.sqrt(d2).toFixed(3); };
  const sub = (a, b) => a.map((x, i) => x - b[i]), len2 = v => v.reduce((s, x) => s + x * x, 0);
  function points(text) { const P = {}; for (const m of text.matchAll(/([A-Z][₀-₉0-9′']?)\s*\(\s*(-?[\d.√/−]+)\s*,\s*(-?[\d.√/−]+)\s*(?:,\s*(-?[\d.√/−]+)\s*)?\)/g)) { const v = [num(m[2]), num(m[3]), m[4] != null ? num(m[4]) : 0]; if (v.every(isFinite)) P[m[1]] = v; } return P; }
  function draw() { const lines = ta.value.split('\n').map(s => s.trim()).filter(Boolean); const P = {}, res = [], items = [];
    for (const ln of lines) { let m;
      try {
        if ((m = ln.match(/^(xy|yz|zx)평면$/))) { items.push(['pl', m[1]]); res.push(`${m[1]}평면: ${{ xy: 'z = 0 (바닥)', yz: 'x = 0 (벽)', zx: 'y = 0 (벽)' }[m[1]]}`); continue; }
        if ((m = ln.match(/^([A-Z][₀-₉0-9′']?)\s*(\(.*\))$/))) { const v = vec(m[2]); if (!v) throw 0; P[m[1]] = v; items.push(['pt', m[1], v]); res.push(`${m[1]}${fv(v)} · O에서 거리 ${sqf(len2(v))}`); continue; }
        if ((m = ln.match(/^(?:선분\s*)?([A-Z])([A-Z])$/)) || (m = ln.match(/^선분\s*([A-Z])\s*([A-Z])$/))) { const [a, b] = [P[m[1]], P[m[2]]]; if (!a || !b) throw 0; items.push(['seg', a, b]); res.push(`선분 ${m[1]}${m[2]} 길이 = <b>${sqf(len2(sub(b, a)))}</b>`); continue; }
        if ((m = ln.match(/^벡터\s*([A-Z])\s*([A-Z])$/))) { const [a, b] = [P[m[1]], P[m[2]]]; if (!a || !b) throw 0; const d = sub(b, a); items.push(['vec', a, b, `${m[1]}${m[2]}`]); res.push(`벡터 ${m[1]}${m[2]} = <b>${fv(d)}</b>, 크기 ${sqf(len2(d))}`); continue; }
        if ((m = ln.match(/^중점\s*([A-Z])\s*([A-Z])$/))) { const [a, b] = [P[m[1]], P[m[2]]]; if (!a || !b) throw 0; const v = a.map((x, i) => (x + b[i]) / 2); P.M = v; items.push(['seg', a, b], ['pt', 'M', v]); res.push(`${m[1]}${m[2]}의 중점 M = <b>${fv(v)}</b>`); continue; }
        if ((m = ln.match(/^내분\s*([A-Z])\s*([A-Z])\s+(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/))) { const [a, b] = [P[m[1]], P[m[2]]], p = +m[3], q = +m[4]; if (!a || !b) throw 0; const v = a.map((x, i) => (p * b[i] + q * x) / (p + q)); P.P = v; items.push(['seg', a, b], ['pt', 'P', v]); res.push(`${m[1]}${m[2]}를 ${p}:${q}로 내분 P = <b>${fv(v)}</b>`); continue; }
        if ((m = ln.match(/^무게중심\s*([A-Z])\s*([A-Z])\s*([A-Z])$/))) { const T = [P[m[1]], P[m[2]], P[m[3]]]; if (T.some(x => !x)) throw 0; const v = [0, 1, 2].map(i => (T[0][i] + T[1][i] + T[2][i]) / 3); P.G = v; items.push(['tri', ...T], ['pt', 'G', v]); res.push(`무게중심 G = <b>${fv(v)}</b>`); continue; }
        if ((m = ln.match(/^삼각형\s*([A-Z])\s*([A-Z])\s*([A-Z])$/))) { const T = [P[m[1]], P[m[2]], P[m[3]]]; if (T.some(x => !x)) throw 0; items.push(['tri', ...T]); const [ab, bc, ca] = [len2(sub(T[1], T[0])), len2(sub(T[2], T[1])), len2(sub(T[0], T[2]))]; res.push(`삼각형 ${m[1]}${m[2]}${m[3]}: 세 변 ${sqf(ab)}, ${sqf(bc)}, ${sqf(ca)}`); continue; }
        if ((m = ln.match(/^구\s*(.+?)\s+(-?[\d.√/]+)$/))) { const c = P[m[1].trim()] || vec(m[1]); const r = num(m[2]); if (!c || !(r > 0)) throw 0; items.push(['sph', c, r]); const tm = (v, n) => v === 0 ? `${n}²` : `(${n}${v > 0 ? '−' : '+'}${f(Math.abs(v))})²`; res.push(`구: <b>${tm(c[0], 'x')} + ${tm(c[1], 'y')} + ${tm(c[2], 'z')} = ${f(r * r)}</b>`); continue; }
        if ((m = ln.match(/^직선\s*([A-Z])\s*([A-Z])$/))) { const [a, b] = [P[m[1]], P[m[2]]]; if (!a || !b) throw 0; const u = sub(b, a); items.push(['line', a, u]); res.push(`직선 ${m[1]}${m[2]}: 방향벡터 ${fv(u)}`); continue; }
        if ((m = ln.match(/^직선\s*(\S+)\s+(\(.*\))$/))) { const a = P[m[1]] || vec(m[1]), u = vec(m[2]); if (!a || !u) throw 0; items.push(['line', a, u]); res.push(`직선: 점 ${fv(a)}, 방향 ${fv(u)}`); continue; }
        throw 0;
      } catch (e) { res.push(`<span class="bad">이해 못 한 줄: ${ln}</span>`); } }
    const all = items.flatMap(it => it.filter(x => Array.isArray(x))).flat(), n = Math.max(5, Math.ceil(Math.max(0, ...all.map(Math.abs)) + 1));
    clear(); axes(n); setDist && setDist(n * 3.6); let ci = 0; const P3 = v => M(v[0], v[1], v[2]);
    items.forEach(it => { const col = COL[ci++ % COL.length];
      if (it[0] === 'pt') { const p = P3(it[2]); dot(p, col, .16); label(`${it[1]}${fv(it[2])}`, p, col, .42);
        /* 좌표축까지 점선 상자 */ const [a, b, c] = it[2]; [[M(a, b, c), M(a, b, 0)], [M(a, b, 0), M(a, 0, 0)], [M(a, b, 0), M(0, b, 0)]].forEach(([u, v]) => line(u, v, '#b8b0a0', true)); }
      if (it[0] === 'pl') { const pc = { xy: '#1f4fb8', yz: '#c8392b', zx: '#1f8a5a' }[it[1]], q = new THREE.Mesh(new THREE.PlaneGeometry(n * 1.6, n * 1.6), new THREE.MeshBasicMaterial({ color: pc, transparent: true, opacity: .13, side: THREE.DoubleSide, depthWrite: false }));
        if (it[1] === 'xy') q.rotation.x = -Math.PI / 2; if (it[1] === 'zx') q.rotation.y = Math.PI / 2; G.add(q); label(it[1] + '평면', it[1] === 'xy' ? M(n * .7, n * .7, 0) : it[1] === 'zx' ? M(n * .7, 0, n * .7) : M(0, n * .7, n * .7), pc, .45); }
      if (it[0] === 'seg') line(P3(it[1]), P3(it[2]), col);
      if (it[0] === 'vec') { arrow(P3(it[1]), P3(it[2]), col, 1.2); }
      if (it[0] === 'tri') { const g = new THREE.BufferGeometry().setFromPoints([P3(it[1]), P3(it[2]), P3(it[3])]); g.setIndex([0, 1, 2]); G.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .18, side: THREE.DoubleSide }))); [[1, 2], [2, 3], [3, 1]].forEach(([i, j]) => line(P3(it[i]), P3(it[j]), col)); }
      if (it[0] === 'sph') { const s = new THREE.Mesh(new THREE.SphereGeometry(it[2], 20, 12), new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .18 })); s.position.copy(P3(it[1])); G.add(s); dot(P3(it[1]), col, .12); }
      if (it[0] === 'line') { const [a, u] = [it[1], it[2]], L = Math.sqrt(len2(u)) || 1, k = (n * 1.6) / L; line(P3(a.map((x, i) => x - k * u[i])), P3(a.map((x, i) => x + k * u[i])), col); arrow(P3(a), P3(a.map((x, i) => x + u[i])), col, 1); } });
    out.innerHTML = res.join('<br>') || '아직 그린 게 없어요';
    if (key) { store[key] = ta.value; try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } } }
  const shift = () => setShift && setShift(pn.hidden || pn.classList.contains('fold') ? 0 : pn.offsetWidth / 2 + 6);
  pn.querySelector('[data-fold]').onclick = e => { pn.classList.toggle('fold'); e.target.textContent = pn.classList.contains('fold') ? '▶ 펼치기' : '◀ 접기'; shift(); };
  function open() { pn.hidden = false; requestAnimationFrame(shift); btn.hidden = true; setAuto(false);
    if (key && store[key]) ta.value = store[key]; else { const P = points(prob); ta.value = Object.entries(P).map(([k, v]) => `${k}(${v.map(f).join(', ')})`).join('\n'); }
    document.body.classList.add('plotting'); draw(); }
  function close() { pn.hidden = true; setShift && setShift(0); btn.hidden = !key; document.body.classList.remove('plotting'); restore(); }
  btn.onclick = open; pn.querySelector('[data-x]').onclick = close; pn.querySelector('[data-go]').onclick = draw;
  pn.querySelector('.ex').onclick = e => { const b = e.target.closest('button'); if (!b) return; ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + b.textContent; draw(); };
  ta.addEventListener('pointerdown', e => e.stopPropagation());
  function showWith(extra) { open(); const have = new Set(ta.value.split('\n').map(x => x.trim())); const add = extra.filter(x => !have.has(x)); if (add.length) ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + add.join('\n'); draw(); }
  return { showWith, set(k, text) { key = k; prob = text || ''; if (!pn.hidden) close(); btn.hidden = !k; }, hide() { key = null; if (!pn.hidden) close(); btn.hidden = true; } };
}
