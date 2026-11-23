'use strict';
/* 문제 속 그림(사진·그래프)을 누르면 크게: 두 손가락 확대, 끌어서 이동, 휠 확대, 두 번 누르면 원래대로 */
(() => {
  const ov = document.createElement('div'); ov.id = 'zoomfig'; ov.hidden = true;
  ov.innerHTML = '<div class="zf-in"></div><div class="zf-bar"><button data-z="1">＋</button><button data-z="-1">－</button><button data-r>⟲</button><button data-x>닫기 ✕</button></div><div class="zf-tip">두 손가락으로 확대 · 끌어서 이동 · 두 번 누르면 원래대로</div>';
  const st = document.createElement('style');
  st.textContent = `#zoomfig{position:fixed;inset:0;user-select:none;-webkit-user-select:none;z-index:200;background:rgba(10,8,6,.92);touch-action:none;overflow:hidden}#zoomfig .zf-in{position:absolute;left:50%;top:50%;transform-origin:0 0;will-change:transform}
#zoomfig .zf-in>*{display:block;max-width:none!important;width:min(92vw,1400px);height:auto;background:#fff;border-radius:6px}
#zoomfig .zf-bar{position:absolute;right:12px;top:12px;display:flex;gap:6px}#zoomfig button{font:700 16px sans-serif;padding:8px 14px;border-radius:10px;border:2px solid #fff6;background:#2a2118;color:#fff}
#zoomfig .zf-tip{position:absolute;left:0;right:0;bottom:12px;text-align:center;color:#ddd;font:13px sans-serif}
.fig img,.fig svg,.qimg img,.card img{cursor:zoom-in}`;
  document.head.appendChild(st); document.addEventListener('DOMContentLoaded', () => document.body.appendChild(ov)); if (document.body) document.body.appendChild(ov);
  const inn = ov.querySelector('.zf-in'); let s = 1, x = 0, y = 0, w0 = 0, h0 = 0; const P = new Map(); let g = null, lastTap = 0;
  const apply = () => { inn.style.transform = `translate(${x - w0 / 2 * s}px,${y - h0 / 2 * s}px) scale(${s})`; };
  const reset = () => { s = 1; x = 0; y = 0; apply(); };
  function open(el) { inn.innerHTML = ''; const c = el.cloneNode(true); c.removeAttribute('width'); c.removeAttribute('height'); c.style.cssText = ''; let a = el, bg = ''; while (a && a !== document.documentElement) { const b = getComputedStyle(a).backgroundColor; if (b && b !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(b)) { bg = b; break; } a = a.parentElement; } c.style.background = bg || getComputedStyle(document.body).backgroundColor; c.style.padding = '10px'; inn.appendChild(c); ov.hidden = false;
    requestAnimationFrame(() => { const r = c.getBoundingClientRect(); w0 = r.width; h0 = r.height; if (h0 > innerHeight * .9) { c.style.width = (w0 * innerHeight * .9 / h0) + 'px'; const r2 = c.getBoundingClientRect(); w0 = r2.width; h0 = r2.height; } reset(); }); }
  const zoomAt = (k, cx, cy) => { const ns = Math.max(.5, Math.min(8, s * k)); const ox = cx - innerWidth / 2, oy = cy - innerHeight / 2; x = ox - (ox - x) * ns / s; y = oy - (oy - y) * ns / s; s = ns; apply(); };
  ov.addEventListener('pointerdown', e => { if (e.target.closest('.zf-bar')) return; ov.setPointerCapture(e.pointerId); P.set(e.pointerId, [e.clientX, e.clientY]);
    const now = Date.now(); if (P.size === 1 && now - lastTap < 300) reset(); lastTap = now; g = null; });
  ov.addEventListener('pointermove', e => { if (!P.has(e.pointerId)) return; const pr = P.get(e.pointerId); P.set(e.pointerId, [e.clientX, e.clientY]);
    if (P.size >= 2) { const [a, b] = [...P.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if (g) { zoomAt(d / g.d, mx, my); x += mx - g.mx; y += my - g.my; apply(); } g = { d, mx, my }; return; }
    x += e.clientX - pr[0]; y += e.clientY - pr[1]; apply(); });
  const up = e => { P.delete(e.pointerId); g = null; }; ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', up);
  ov.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  ov.querySelector('.zf-bar').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.z) zoomAt(b.dataset.z > 0 ? 1.3 : 1 / 1.3, innerWidth / 2, innerHeight / 2); if (b.dataset.r !== undefined) reset(); if (b.dataset.x !== undefined) ov.hidden = true; };
  addEventListener('keydown', e => { if (e.key === 'Escape') ov.hidden = true; });
  /* 그림 누르면 열기 (버튼·입력칸은 제외) */
  document.addEventListener('click', e => { if (!ov.hidden) return; const t = e.target; if (!t.closest || t.closest('button, input, textarea, .zf-bar, #lab, #pad')) return;
    const box = t.closest('.fig, .qimg'); if (box && box.dataset.drag) return; if (t.closest('.fig[data-fk]')) return; let el = null; if (box) el = box.querySelector('img, svg'); else if (t.tagName === 'IMG' && t.closest('#quiz, #body, .card')) el = t;
    if (!el) return; e.preventDefault(); e.stopPropagation(); open(el); }, true);
})();
