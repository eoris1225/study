'use strict';
/* 문제 위에 직접 필기: 펜(스타일러스)은 문제 카드 위에 쓰고, 손가락·마우스는 원래대로 누르기.
   「손가락으로도 쓰기」를 켜면 모든 입력이 필기. 필기는 문제마다 저장 (bio_ink_v1) */
(() => {
  const KEY = 'bio_ink_v1'; let ink = {}; try { ink = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { }
  const quiz = document.getElementById('quiz'); if (!quiz) return;
  const bar = document.createElement('div'); bar.id = 'inkbar'; bar.hidden = true;
  bar.innerHTML = `<button data-c="#ffe27a" class="on" title="노랑">●</button><button data-c="#ff6a5a" title="빨강">●</button><button data-c="#7ab8ff" title="파랑">●</button><button data-c="#ffffff" title="흰색">●</button><button data-e>지우개</button><button data-x>지우기</button><button data-a>손가락으로도 쓰기</button>`;
  document.body.appendChild(bar);
  let col = '#ffe27a', erase = false, all = false, key = null, cv = null, g = null, cur = null, justDrew = 0;
  try { all = localStorage.getItem('bio_inkall') === '1'; } catch (e) { }
  bar.querySelector('[data-a]').classList.toggle('on', all);
  const d = () => Math.min(2, devicePixelRatio || 1);
  function attach() { const qc = quiz.querySelector('.qc'); if (!qc) return; if (cv && cv.parentNode === qc) { size(); return; }
    cv = document.createElement('canvas'); cv.className = 'inkcv'; qc.appendChild(cv); g = cv.getContext('2d'); size(true); }
  function size(fresh) { const qc = cv.parentNode, w = qc.scrollWidth, h = qc.scrollHeight, r = d();
    if (!fresh && cv.width === Math.round(w * r) && cv.height === Math.round(h * r)) return;
    const keep = !fresh && cv.width ? cv.toDataURL() : null; cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    if (keep) draw(keep); else if (key && ink[key]) draw(ink[key]); }
  function draw(src) { const im = new Image(), c0 = cv; im.onload = () => { if (cv === c0) c0.getContext('2d').drawImage(im, 0, 0); }; im.src = src; }
  function store() { if (!key || !cv) return; ink[key] = cv.toDataURL('image/png'); const ks = Object.keys(ink); if (ks.length > 60) delete ink[ks[0]]; try { localStorage.setItem(KEY, JSON.stringify(ink)); } catch (e) { delete ink[ks[0]]; } }
  const pos = e => { const r = cv.getBoundingClientRect(), s = d(); return [(e.clientX - r.left) * s, (e.clientY - r.top) * s]; };
  const wants = e => cv && !bar.hidden && (e.pointerType === 'pen' || all) && !e.target.closest('#inkbar');
  quiz.addEventListener('pointerdown', e => { if (!wants(e)) return; e.preventDefault(); e.stopPropagation(); quiz.setPointerCapture(e.pointerId); cur = { p: pos(e), id: e.pointerId }; }, true);
  quiz.addEventListener('pointermove', e => { if (!cur || e.pointerId !== cur.id) return; e.preventDefault(); e.stopPropagation(); const p = pos(e), s = d();
    g.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; g.strokeStyle = col; g.lineCap = g.lineJoin = 'round'; g.lineWidth = (erase ? 24 : (e.pointerType === 'pen' && e.pressure > 0 ? 1.2 + e.pressure * 2.4 : 2.6)) * s;
    g.beginPath(); g.moveTo(cur.p[0], cur.p[1]); g.lineTo(p[0], p[1]); g.stroke(); cur.p = p; }, true);
  const up = e => { if (cur && e.pointerId === cur.id) { e.stopPropagation(); cur = null; justDrew = Date.now(); store(); } };
  quiz.addEventListener('pointerup', up, true); quiz.addEventListener('pointercancel', up, true);
  /* 펜으로 쓴 직후의 클릭은 버튼을 누르지 않게 */
  quiz.addEventListener('click', e => { if (Date.now() - justDrew < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
  bar.onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.c || b.dataset.e !== undefined) { erase = b.dataset.e !== undefined; if (b.dataset.c) col = b.dataset.c; bar.querySelectorAll('[data-c],[data-e]').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.dataset.x !== undefined && cv) { g.clearRect(0, 0, cv.width, cv.height); store(); }
    if (b.dataset.a !== undefined) { all = !all; b.classList.toggle('on', all); try { localStorage.setItem('bio_inkall', all ? '1' : '0'); } catch (e) { } } };
  /* 문제가 바뀌면 그 문제의 필기로 */
  const sync = () => { if (quiz.hidden) { if (key) store(); bar.hidden = true; key = null; cv = null; quiz.classList.remove('inkon'); return; }
    bar.hidden = false; quiz.classList.add('inkon');
    const q = quiz.querySelector('.qq'), src = quiz.querySelector('.src'); const k = 'q:' + ((src ? src.textContent : '') + '|' + (q ? q.textContent : '')).slice(0, 90);
    if (k !== key) { if (key && cv) store(); key = k; cv = null; }
    requestAnimationFrame(attach); };
  new MutationObserver(sync).observe(quiz, { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true });
})();
