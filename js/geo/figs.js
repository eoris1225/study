'use strict';
/* 기하 문제 그림 (직접 그림): 문제 조건만 표시, 답은 그리지 않음.  GEOFIG['c5:2'] = () => svg 문자열 */
(() => {
  const INK = '#22201c', R = '#c8392b', B = '#1f4fb8', P = '#6b665c', G = '#2f7d4a';
  const box = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w * 1.15}px;display:block;margin:6px auto" font-family="Gowun Dodum, Noto Sans KR, sans-serif" font-size="15"><defs><marker id="ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>${body}</svg>`;
  const L = (a, b, o = {}) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${o.c || INK}" stroke-width="${o.w || 1.8}" ${o.d ? 'stroke-dasharray="5 4"' : ''} ${o.ar ? 'marker-end="url(#ga)"' : ''}/>`;
  const T = (p, s, o = {}) => `<text x="${p[0] + (o.dx || 0)}" y="${p[1] + (o.dy || 0)}" fill="${o.c || INK}" font-size="${o.s || 15}" text-anchor="${o.a || 'middle'}" font-weight="${o.b ? 700 : 400}">${s}</text>`;
  const D = (p, c = INK, r = 3.2) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${c}"/>`;
  const poly = (ps, o = {}) => `<polygon points="${ps.map(p => p.join(',')).join(' ')}" fill="${o.f || 'none'}" stroke="${o.c || INK}" stroke-width="${o.w || 1.8}"/>`;
  const mid = (a, b, t = .5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const away = (p, c, k = 14) => { const dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * k, p[1] + dy / l * k + 5]; };
  /* 돌려 보기: 그림을 끌면 VIEW가 바뀌고 다시 그림. 회전 중심은 PIV */
  const VIEW = window.GEOVIEW = { yaw: 0, pitch: 0 }; let PIV = [0, 0, 0], USED = false;
  const ROT = P => { if (!VIEW.yaw && !VIEW.pitch) return P; let x = P[0] - PIV[0], y = P[1] - PIV[1], z = P[2] - PIV[2]; const cy = Math.cos(VIEW.yaw), sy = Math.sin(VIEW.yaw), cp = Math.cos(VIEW.pitch), sp = Math.sin(VIEW.pitch);
    [x, y] = [x * cy - y * sy, x * sy + y * cy]; [x, z] = [x * cp - z * sp, x * sp + z * cp]; return [x + PIV[0], y + PIV[1], z + PIV[2]]; };
  /* 3D 사영: x 오른쪽, y 안쪽(비스듬히), z 위 */
  const pj = (o, s) => { USED = true; return P => { const [x, y, z] = ROT(P); return [o[0] + s * (x + .5 * y), o[1] - s * (z + .32 * y)]; }; };
  /* 직육면체 ABCD-EFGH: 아래 ABCD, 위 EFGH (E는 A 위) */
  function cuboid(a, b, c, s, o, extra = '') {
    PIV = [a / 2, b / 2, c / 2]; const p = pj(o, s), V = { A: [0, 0, 0], B: [a, 0, 0], C: [a, b, 0], D: [0, b, 0], E: [0, 0, c], F: [a, 0, c], G: [a, b, c], H: [0, b, c] };
    const P2 = {}; for (const k in V) P2[k] = p(V[k]);
    const hidden = [['A', 'D'], ['D', 'C'], ['D', 'H']], edges = [['A', 'B'], ['B', 'C'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['A', 'E'], ['B', 'F'], ['C', 'G']];
    const ctr = p([a / 2, b / 2, c / 2]);
    return { P: P2, p, V, svg: edges.map(([u, v]) => L(P2[u], P2[v])).join('') + hidden.map(([u, v]) => L(P2[u], P2[v], { d: 1, c: P })).join('') + Object.keys(P2).map(k => T(away(P2[k], ctr, 14), k, { b: 1 })).join('') + extra };
  }
  /* 교과서식 좌표축: x축은 앞(왼쪽 아래), y축 오른쪽, z축 위 */
  const pjA = (o, s) => { USED = true; return P => { const [x, y, z] = ROT(P); return [o[0] + s * (y - .6 * x), o[1] - s * (z - .4 * x)]; }; };
  function axes(o, s, n = 5) { const p = pjA(o, s); return { p, svg: L(p([0, 0, 0]), p([n, 0, 0]), { ar: 1 }) + L(p([0, 0, 0]), p([0, n, 0]), { ar: 1 }) + L(p([0, 0, 0]), p([0, 0, n]), { ar: 1 }) + T(p([n, 0, 0]), 'x', { dx: -10, dy: 10 }) + T(p([0, n, 0]), 'y', { dx: 10, dy: 5 }) + T(p([0, 0, n]), 'z', { dy: -6 }) + T(p([0, 0, 0]), 'O', { dx: -10, dy: 14 }) }; }
  const reg = (n, c, r, rot = -Math.PI / 2) => Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos(rot + k * 2 * Math.PI / n), c[1] + r * Math.sin(rot + k * 2 * Math.PI / n)]);
  function hexagon(extra = '', withO = true) { const c = [170, 120], V = reg(6, c, 90, Math.PI); const N = 'ABCDEF'; /* A 왼쪽부터 시계 반대 */
    return box(340, 240, poly(V) + (withO ? L(V[0], V[3], { c: P, d: 1 }) + L(V[1], V[4], { c: P, d: 1 }) + L(V[2], V[5], { c: P, d: 1 }) + D(c) + T(c, 'O', { dx: 12, dy: -6 }) : '') + V.map((v, k) => T(away(v, c, 16), N[k], { b: 1 })).join('') + extra(V, c)); }
  const F = {};
  /* ── c1 ── */
  F['c1:6'] = () => { const a = axes([205, 180], 26, 6); const p = a.p, A = p([4, -1, 3]), A2 = p([4, -1, -3]), Bp = p([2, 1, 5]);
    return box(360, 300, a.svg + poly([p([-1, -3, 0]), p([7, -3, 0]), p([7, 5, 0]), p([-1, 5, 0])], { c: '#9aa', f: 'rgba(31,79,184,.06)' }) + D(A, R) + T(A, 'A(4, −1, 3)', { dx: -10, dy: -8, a: 'end', c: R }) + D(Bp, B) + T(Bp, 'B(2, 1, 5)', { dx: 8, dy: -6, a: 'start', c: B }) + D(A2, P) + T(A2, 'A′ (?)', { dx: -8, dy: 16, a: 'end', c: P }) + L(A, A2, { c: P, d: 1 }) + T(p([6.5, 4.5, 0]), 'xy평면', { c: '#557', s: 13, dy: 18 })).replace('viewBox="0 0 360 300"', 'viewBox="0 0 360 330"'); };
  F['c1:7'] = () => { const a = axes([120, 175], 26, 6); const p = a.p, Pt = p([4, 3, 5]), H = p([4, 3, 0]), l1 = p([10, 2, 0]), l2 = p([5.2, 6.4, 0]), Q = p([4 + 3.6, 3 + 1.2, 0]);
    return box(380, 300, a.svg + L(l1, l2, { c: G, w: 2.4 }) + T(l1, 'l', { dx: -10, c: G, b: 1 }) + D(Pt, R) + T(Pt, 'P(4, 3, 5)', { dx: 8, dy: -6, a: 'start', c: R }) + D(H) + T(H, 'H', { dx: 10, dy: 14 }) + L(Pt, H, { d: 1 }) + L(H, Q, { c: B, d: 1 }) + T(mid(H, Q), '6', { dx: 10, c: B, b: 1 }) + L(Pt, Q, { c: R, d: 1 }) + T(mid(Pt, Q), '?', { dx: -10, c: R, b: 1 })); };
  F['c2:8'] = () => { const a = axes([160, 190], 34, 4.5); const p = a.p, X = p([2, 3, 1]), A = p([2, 0, 0]), Bp = p([0, 3, 0]), C = p([0, 0, 1]);
    return box(360, 300, a.svg + D(X, R) + T(X, '(2, 3, 1)', { dx: 8, dy: -6, a: 'start', c: R }) + [A, Bp, C].map(q => L(X, q, { c: P, d: 1 })).join('') + D(A, B) + T(A, 'A', { dx: -6, dy: 18, c: B, b: 1 }) + D(Bp, B) + T(Bp, 'B', { dy: 18, c: B, b: 1 }) + D(C, B) + T(C, 'C', { dx: -14, c: B, b: 1 }) + L(A, Bp, { c: B }) + L(Bp, C, { c: B }) + T(p([2, 3.6, 2.2]), 'D = ?', { c: G, b: 1 })); };
  /* ── c2 ── */
  F['c2:5'] = () => { const O = [60, 210], A = [300, 150], Bp = [130, 40];
    return box(360, 240, poly([O, A, Bp]) + T(O, 'O', { dx: -12, dy: 6, b: 1 }) + T(A, 'A(8, 6, 0)', { dx: 6, dy: 18, b: 1 }) + T(Bp, 'B(−3, 0, 4)', { dy: -10, b: 1 }) + L(O, mid(Bp, A, .667), { c: R, d: 1 }) + D(mid(Bp, A, .667), R) + T(mid(Bp, A, .667), 'P', { dx: 10, dy: -6, c: R, b: 1 }) + `<path d="M84 204 A 26 26 0 0 0 78 188" fill="none" stroke="${R}"/><path d="M90 196 A 34 34 0 0 0 80 180" fill="none" stroke="${R}"/>` + T([170, 230], '∠AOB의 이등분선이 AB와 만나는 점 P', { s: 13, c: P })); };
  F['c2:7'] = () => { const c = cuboid(6, 6, 6, 22, [70, 250]); const M = mid(c.P.B, c.P.F), Pp = mid(c.P.D, M, 2 / 3);
    return box(330, 290, c.svg + D(M, R) + T(M, 'M', { dx: 14, dy: 4, c: R, b: 1 }) + L(c.P.D, M, { c: R, d: 1 }) + D(Pp, B) + T(Pp, 'P', { dx: -4, dy: -10, c: B, b: 1 }) + L(c.P.H, Pp, { c: B, w: 2.4 }) + T(mid(c.P.A, c.P.B), '6', { dy: 18 }) + T([165, 282], 'DP : PM = 2 : 1', { s: 13, c: P })); };
  /* ── c3 ── */
  F['c3:7'] = () => { const a = axes([180, 250], 18, 7); const p = a.p, Lt = p([0, 0, 10]), C = p([0, 0, 4]), r = 3 * 18;
    return box(380, 300, a.svg + `<ellipse cx="${p([0, 0, 0])[0]}" cy="${p([0, 0, 0])[1]}" rx="${4.2 * 18 * 1.3}" ry="${4.2 * 18 * .45}" fill="rgba(34,32,28,.15)" stroke="${P}" stroke-dasharray="4 3"/>` + `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" fill="rgba(31,79,184,.08)" stroke="${B}" stroke-width="2"/>` + D(Lt, R, 5) + T(Lt, 'P(0, 0, 10) 빛', { dx: 10, a: 'start', c: R, b: 1 }) + L(Lt, [C[0] - r * .95, C[1] + r * .3], { c: '#e0a020', d: 1 }) + L(Lt, [C[0] + r * .95, C[1] + r * .3], { c: '#e0a020', d: 1 }) + D(C, B) + T(C, '(0, 0, 4), r = 3', { dx: r + 6, a: 'start', c: B, s: 13 }) + T(p([3, 4, 0]), '그림자', { c: P, s: 13 })); };
  F['c3:8'] = () => { const C = [200, 150], r = 70, Pp = [40, 60], t = 0.9; const Q = [C[0] - r * Math.cos(t), C[1] - r * Math.sin(t)];
    return box(320, 240, `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" fill="rgba(31,79,184,.07)" stroke="${B}" stroke-width="2"/>` + D(C, B) + T(C, '중심 C', { dy: 18, c: B }) + D(Pp, R) + T(Pp, 'P(1, 3, 2)', { dy: -8, c: R, b: 1 }) + L(Pp, Q, { c: R, w: 2.4 }) + D(Q) + T(Q, 'Q', { dx: 6, dy: -8, b: 1 }) + L(C, Q, { c: B, d: 1 }) + L(Pp, C, { c: P, d: 1 }) + T(mid(C, Q), 'r', { dx: 10, c: B }) + T([160, 232], 'CQ ⊥ PQ (접선)', { s: 13, c: P })); };
  /* ── c4 ── */
  F['c4:0'] = () => box(320, 270, cuboid(5, 5, 5, 26, [70, 240]).svg + T([160, 262], '한 모서리의 길이 1인 정육면체', { s: 13, c: P }));
  F['c4:1'] = () => { const A = [170, 30], Bp = [60, 220], C = [280, 220], Dd = mid(A, Bp), E = mid(Bp, C), Ff = mid(C, A);
    return box(340, 250, poly([A, Bp, C]) + poly([Dd, E, Ff], { c: P }) + [[A, 'A', 0, -8], [Bp, 'B', -10, 8], [C, 'C', 10, 8], [Dd, 'D', -12, 0], [E, 'E', 0, 20], [Ff, 'F', 12, 0]].map(([q, s, dx, dy]) => D(q) + T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c4:2'] = () => box(340, 270, cuboid(7, 4, 4, 26, [50, 230]).svg);
  F['c4:3'] = () => hexagon(() => '');
  /* ── c5 ── */
  F['c5:2'] = () => hexagon((V, c) => L(c, V[0], { c: R, w: 2.4, ar: 1 }) + T(mid(c, V[0]), 'a', { dy: -6, c: R, b: 1 }) + L(c, V[2], { c: B, w: 2.4, ar: 1 }) + T(mid(c, V[2]), 'b', { dx: 10, c: B, b: 1 }));
  F['c5:3'] = () => { const c = cuboid(7, 4, 4, 26, [50, 230]); return box(340, 270, c.svg + L(c.P.A, c.P.B, { c: R, w: 2.6, ar: 1 }) + T(mid(c.P.A, c.P.B), 'a', { dy: 18, c: R, b: 1 }) + L(c.P.A, c.P.D, { c: B, w: 2.6, ar: 1 }) + T(mid(c.P.A, c.P.D), 'b', { dx: -10, c: B, b: 1 }) + L(c.P.A, c.P.E, { c: G, w: 2.6, ar: 1 }) + T(mid(c.P.A, c.P.E), 'c', { dx: -12, c: G, b: 1 })); };
  F['c5:4'] = () => { const A = [50, 40], Bp = [50, 200], C = [300, 200], Dd = [300, 40], O = mid(A, C);
    return box(350, 240, poly([A, Bp, C, Dd]) + L(A, C, { c: P, d: 1 }) + L(Bp, Dd, { c: P, d: 1 }) + L(O, A, { c: R, w: 2.4, ar: 1 }) + T(mid(O, A), 'a', { dy: -6, c: R, b: 1 }) + L(O, Dd, { c: B, w: 2.4, ar: 1 }) + T(mid(O, Dd), 'b', { dy: -6, c: B, b: 1 }) + D(O) + T(O, 'O', { dy: 20 }) + [[A, 'A'], [Bp, 'B'], [C, 'C'], [Dd, 'D']].map(([q, s]) => T(away(q, O, 14), s, { b: 1 })).join('')); };
  F['c5:6'] = () => hexagon((V) => L(V[0], V[1], { c: R, w: 2.4, ar: 1 }) + T(mid(V[0], V[1]), 'a', { dx: -10, c: R, b: 1 }) + L(V[1], V[2], { c: B, w: 2.4, ar: 1 }) + T(mid(V[1], V[2]), 'b', { dy: 18, c: B, b: 1 }) + L(V[2], V[3], { c: G, w: 2.4, ar: 1 }) + T(mid(V[2], V[3]), 'c', { dx: 10, c: G, b: 1 }), false);
  F['c5:7'] = () => { const p = pj([80, 220], 34), A = p([0, 0, 0]), Bp = p([4, 0, 0]), C = p([4, 4, 0]), Dd = p([0, 4, 0]), O = p([2, 2, 4.2]);
    return box(320, 260, L(A, Bp) + L(Bp, C) + L(A, Dd, { d: 1, c: P }) + L(Dd, C, { d: 1, c: P }) + L(O, Dd, { d: 1, c: P }) + L(O, A, { c: R, w: 2.4, ar: 1 }) + L(O, Bp, { c: B, w: 2.4, ar: 1 }) + L(O, C, { c: G, w: 2.4, ar: 1 }) + L(Bp, Dd, { c: '#a07020', d: 1 }) + T(mid(O, A), 'a', { dx: -10, c: R, b: 1 }) + T(mid(O, Bp), 'b', { dx: 10, c: B, b: 1 }) + T(mid(O, C), 'c', { dx: 10, c: G, b: 1 }) + [[O, 'O', 0, -10], [A, 'A', -10, 14], [Bp, 'B', 6, 18], [C, 'C', 12, 6], [Dd, 'D', -12, -2]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c5:8'] = () => { const A = [60, 40], Bp = [60, 220], C = [240, 220], Dd = [240, 40], M = mid(A, Bp), N = mid(A, Dd);
    return box(300, 250, poly([A, Bp, C, Dd]) + D(M, R) + D(N, R) + T(M, 'M', { dx: -14, c: R, b: 1 }) + T(N, 'N', { dy: -8, c: R, b: 1 }) + L(M, N, { c: R, d: 1 }) + L(M, Bp, { c: B, d: 1 }) + [[A, 'A', -10, -4], [Bp, 'B', -10, 14], [C, 'C', 10, 14], [Dd, 'D', 10, -4]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c5:9'] = () => { const A = [70, 50], Bp = [40, 210], C = [300, 220], Dd = [250, 40], M = mid(A, Bp), N = mid(C, Dd);
    return box(340, 250, poly([A, Bp, C, Dd]) + D(M, R) + D(N, R) + T(M, 'M', { dx: -14, c: R, b: 1 }) + T(N, 'N', { dx: 14, c: R, b: 1 }) + L(M, N, { c: R, d: 1 }) + [[A, 'A', -8, -6], [Bp, 'B', -10, 14], [C, 'C', 10, 14], [Dd, 'D', 8, -6]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c5:10'] = () => box(340, 270, cuboid(7, 4, 4, 26, [50, 230]).svg);
  F['c5:11'] = () => { const A = [40, 30], Bp = [40, 190], C = [300, 190], Dd = [300, 30], O = mid(A, C);
    return box(340, 220, poly([A, Bp, C, Dd]) + L(A, C, { c: P, d: 1 }) + L(Bp, Dd, { c: P, d: 1 }) + D(O, R) + T(O, 'O', { dy: 20, c: R }) + T(mid(A, Dd), '8', { dy: -6 }) + T(mid(A, Bp), '6', { dx: -12 }) + [[A, 'A', -10, 0], [Bp, 'B', -10, 12], [C, 'C', 10, 12], [Dd, 'D', 10, 0]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c5:12'] = () => { const c = cuboid(4, 6, 2, 26, [60, 200]); return box(340, 250, c.svg + T(mid(c.P.A, c.P.B), '2', { dy: 18, c: R, b: 1 }) + T(mid(c.P.B, c.P.C), '3', { dx: 12, c: R, b: 1 }) + T(mid(c.P.B, c.P.F), '1', { dx: 10, c: R, b: 1 })); };
  /* ── c6 ── */
  F['c6:5'] = () => { const O = [60, 230], r = 180, A = [O[0] + r, O[1]], Bp = [O[0], O[1] - r], C = [O[0] + r * .5, O[1] - r * .866];
    return box(300, 270, `<path d="M${A[0]} ${A[1]} A ${r} ${r} 0 0 0 ${Bp[0]} ${Bp[1]}" fill="none" stroke="${INK}" stroke-width="1.8"/>` + L(O, A, { c: R, w: 2.4, ar: 1 }) + L(O, Bp, { c: B, w: 2.4, ar: 1 }) + L(O, C, { c: G, w: 2.4, ar: 1 }) + `<path d="M${O[0] + 36} ${O[1]} A 36 36 0 0 0 ${O[0] + 18} ${O[1] - 31}" fill="none" stroke="${G}"/>` + T([O[0] + 44, O[1] - 18], '60°', { s: 13, c: G }) + T(mid(O, A), 'a', { dy: 18, c: R, b: 1 }) + T(mid(O, Bp), 'b', { dx: -12, c: B, b: 1 }) + T(away(C, O), 'C', { b: 1 }) + T(O, 'O', { dx: -12, dy: 8, b: 1 }) + T(A, 'A', { dy: 18, b: 1 }) + T(Bp, 'B', { dx: -12, b: 1 }) + T(mid(O, A, .8), '4', { dy: -6, s: 13 })); };
  F['c6:9'] = () => { const A = [170, 30], Bp = [40, 220], C = [300, 220];
    return box(340, 250, poly([A, Bp, C]) + [[A, 'A', 0, -8], [Bp, 'B', -10, 10], [C, 'C', 10, 10]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('') + T([170, 245], 'P는 AB 위, Q는 BC 위, R은 CA 위', { s: 13, c: P })); };
  F['c6:10'] = () => { const O = [160, 230], s = 22, C = [O[0], O[1] - 4 * s];
    return box(320, 260, L([20, O[1]], [300, O[1]], { ar: 1 }) + L([O[0], 250], [O[0], 20], { ar: 1 }) + T([300, O[1] + 16], 'x') + T([O[0] + 10, 24], 'y') + T(O, 'O', { dx: -10, dy: 16 }) + `<circle cx="${C[0]}" cy="${C[1]}" r="${2 * s}" fill="none" stroke="${B}" stroke-width="2"/>` + `<circle cx="${O[0]}" cy="${O[1]}" r="${s * 1.2}" fill="none" stroke="${R}" stroke-dasharray="4 3"/>` + T(C, '(0, 4)', { dx: 10, a: 'start', s: 13, c: B }) + T([C[0] + 2 * s + 6, C[1] + 4], 'r = 2', { a: 'start', s: 13, c: B }) + T([O[0] + s * 1.3, O[1] - s * 1.1], '단위원', { a: 'start', s: 12, c: R }) + L(O, [C[0] + 2 * s * .866, C[1] + 2 * s * .5], { c: P, d: 1 }) + L(O, [C[0] - 2 * s * .866, C[1] + 2 * s * .5], { c: P, d: 1 })); };
  /* ── c7 ── */
  F['c7:3'] = () => { const p = pj([60, 220], 30), O = p([3, 3, 5]), A = p([0, 0, 0]), Bp = p([6, 0, 0]), C = p([3, 6, 0]), Pp = mid(O, C, 1 / 3), Q = mid(A, Bp, 1 / 3);
    return box(320, 270, L(O, A) + L(O, Bp) + L(A, Bp) + L(Bp, C) + L(O, C, { d: 1, c: P }) + L(A, C, { d: 1, c: P }) + D(Pp, R) + T(Pp, 'P', { dx: 12, c: R, b: 1 }) + D(Q, R) + T(Q, 'Q', { dy: 18, c: R, b: 1 }) + L(Pp, Q, { c: R, w: 2.4, ar: 1 }) + [[O, 'O', 0, -10], [A, 'A', -12, 8], [Bp, 'B', 12, 8], [C, 'C', 12, -2]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('') + T([160, 262], 'OP : PC = 1 : 2,  AQ : QB = 1 : 2', { s: 13, c: P })); };
  F['c7:5'] = () => { const A = [60, 40], Bp = [60, 210], C = [300, 210], Pp = mid(Bp, C, .33), Q = mid(Bp, C, .33);
    return box(340, 250, poly([A, Bp, C]) + D(mid(A, Bp, 1 / 3), R) + T(mid(A, Bp, 1 / 3), 'P', { dx: -14, c: R, b: 1 }) + D(mid(Bp, C, 1 / 3), R) + T(mid(Bp, C, 1 / 3), 'Q', { dy: 20, c: R, b: 1 }) + L(mid(A, Bp, 1 / 3), mid(Bp, C, 1 / 3), { c: R, d: 1 }) + [[A, 'A', -10, -4], [Bp, 'B', -10, 14], [C, 'C', 10, 14]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('') + T([200, 240], 'AP : PB = 1 : 2,  BQ : QC = 1 : 2', { s: 13, c: P })); };
  F['c7:6'] = () => { const Bp = [70, 210], C = [70, 40], A = [168, 210];
    return box(340, 250, poly([A, Bp, C]) + `<path d="M70 192 L88 192 L88 210" fill="none" stroke="${INK}"/>` + T(mid(Bp, C), '2√3', { dx: -22 }) + T([A[0] - 30, 202], '60°', { s: 13, c: R }) + D(mid(Bp, C), R) + T(mid(Bp, C), 'P', { dx: 14, c: R, b: 1 }) + [[A, 'A', 10, 8], [Bp, 'B', -10, 14], [C, 'C', -10, -4]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('')); };
  F['c7:7'] = () => { const A = [170, 30], Bp = [40, 230], C = [300, 230], Dd = mid(A, Bp, 2 / 3), E = mid(A, C, .75), Ff = mid(A, C, .25);
    return box(340, 260, poly([A, Bp, C]) + [[Dd, 'D'], [E, 'E'], [Ff, 'F']].map(([q, s]) => D(q, R) + T(q, s, { dx: s === 'D' ? -14 : 14, c: R, b: 1 })).join('') + [[A, 'A', 0, -8], [Bp, 'B', -10, 12], [C, 'C', 10, 12]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('') + T(mid(Bp, C), '3', { dy: 20 })); };
  /* ── c9 ── */
  F['c9:3'] = () => { const c = cuboid(6, 2, 4, 26, [50, 220]); return box(330, 260, c.svg + T(mid(c.P.A, c.P.B), '3', { dy: 18, c: R, b: 1 }) + T(mid(c.P.A, c.P.D), '1', { dx: -12, c: R, b: 1 }) + T(mid(c.P.A, c.P.E), '2', { dx: -12, c: R, b: 1 })); };
  F['c9:12'] = () => { const a = axes([150, 185], 24, 7.5); const p = a.p, A = p([4, 0, 0]), Bp = p([0, 6, 0]), C = p([0, 0, 6]), Dd = mid(A, Bp), E = mid(Bp, C, 2 / 3);
    return box(360, 290, a.svg + poly([A, Bp, C], { c: B, f: 'rgba(31,79,184,.05)' }) + [[A, 'A(4,0,0)', 0, 18], [Bp, 'B(0,6,0)', 10, 16], [C, 'C(0,0,6)', 12, 0]].map(([q, s, dx, dy]) => D(q, B) + T(q, s, { dx, dy, s: 13, c: B, a: 'start' })).join('') + D(Dd, R) + T(Dd, 'D', { dy: 18, c: R, b: 1 }) + D(E, R) + T(E, 'E', { dx: 12, c: R, b: 1 }) + L(Dd, E, { c: R, w: 2.4 })); };
  F['c9:13'] = () => { const c = cuboid(6, 3, 3, 26, [50, 210]); return box(330, 250, c.svg + L(c.P.A, c.P.G, { c: R, w: 2.2 }) + L(c.P.D, c.P.F, { c: B, w: 2.2 }) + T(mid(c.P.A, c.P.B), '2', { dy: 18 }) + T(mid(c.P.A, c.P.D), '1', { dx: -12 }) + T(mid(c.P.A, c.P.E), '1', { dx: -12 })); };
  F['c9:15'] = () => { const p = pj([60, 220], 34), O = p([3, 1.7, 4.9]), A = p([0, 0, 0]), Bp = p([6, 0, 0]), C = p([3, 5.2, 0]), Gg = [(O[0] + A[0] + Bp[0]) / 3, (O[1] + A[1] + Bp[1]) / 3], M = mid(Bp, C);
    return box(320, 270, L(O, A) + L(O, Bp) + L(A, Bp) + L(Bp, C) + L(O, C) + L(A, C, { d: 1, c: P }) + D(Gg, R) + T(Gg, 'G', { dx: -12, c: R, b: 1 }) + D(M, B) + T(M, 'M', { dx: 14, c: B, b: 1 }) + L(Bp, Gg, { c: R, d: 1 }) + L(Gg, M, { c: B, d: 1 }) + [[O, 'O', 0, -10], [A, 'A', -12, 8], [Bp, 'B', 12, 10], [C, 'C', 12, -2]].map(([q, s, dx, dy]) => T(q, s, { dx, dy, b: 1 })).join('') + T([160, 262], '모든 모서리의 길이 1', { s: 13, c: P })); };
  F['c3:5'] = () => { const a = axes([190, 175], 26, 6); const p = a.p, X = p([3, 1, 2]);
    return box(360, 280, a.svg + D(X, R) + T(X, '(3, 1, 2)', { dx: 8, dy: -6, a: 'start', c: R }) + T([180, 272], '세 좌표평면에 모두 접하는 구 → 중심 (r, r, r)', { s: 13, c: P })); };
  for (const k in F) { const f = F[k]; F[k] = () => { PIV = [0, 0, 0]; USED = false; const out = f(); window.GEOFIG_3D = USED; return out; }; }
  window.GEOFIG = F;
})();
