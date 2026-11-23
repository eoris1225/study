'use strict';
/* 문제 풀 때 펜 연습장: 문제 창(#quiz)이 열리면 왼쪽에 모눈 연습장. 문제마다 필기 저장 (bio_ink_v1) */
(() => {
  const KEY = 'bio_ink_v1'; let ink = {}; try { ink = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { }
  let penOnly = false; try { penOnly = localStorage.getItem('bio_penonly') === '1'; } catch (e) { }
  const pad = document.createElement('div'); pad.id = 'qpad'; pad.hidden = true;
  pad.innerHTML = `<canvas></canvas><div class="pt"><button data-c="#2a2118" class="on">검정</button><button data-c="#c8392b">빨강</button><button data-c="#1f4fb8">파랑</button><button data-e>지우개</button><button data-x>전체 지우기</button><button data-p class="${penOnly ? 'on' : ''}">펜만 인식</button></div>`;
  document.body.appendChild(pad);
  const cv = pad.querySelector('canvas'), g = cv.getContext('2d'); let col = '#2a2118', erase = false, key = null, cur = null;
  function fit() { const r = pad.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; g.setTransform(d, 0, 0, d, 0, 0); load(); }
  function load() { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.restore(); const s = key && ink[key]; if (!s) return; const im = new Image(); const k0 = key; im.onload = () => { if (key !== k0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(im, 0, 0, cv.width, cv.height); g.restore(); }; im.src = s; }
  function store() { if (!key) return; ink[key] = cv.toDataURL('image/png'); const ks = Object.keys(ink); if (ks.length > 40) delete ink[ks[0]]; try { localStorage.setItem(KEY, JSON.stringify(ink)); } catch (e) { delete ink[ks[0]]; } }
  new ResizeObserver(() => { if (!pad.hidden) fit(); }).observe(pad);
  cv.addEventListener('pointerdown', e => { if (penOnly && e.pointerType !== 'pen') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); cur = { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId }; });
  cv.addEventListener('pointermove', e => { if (!cur || e.pointerId !== cur.id) return; const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    g.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; g.strokeStyle = col; g.lineCap = g.lineJoin = 'round'; g.lineWidth = erase ? 26 : (e.pointerType === 'pen' && e.pressure > 0 ? 1.2 + e.pressure * 2.6 : 2.4);
    g.beginPath(); g.moveTo(cur.x, cur.y); g.lineTo(x, y); g.stroke(); cur.x = x; cur.y = y; });
  const up = e => { if (cur && e.pointerId === cur.id) { cur = null; store(); } }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  pad.querySelector('.pt').onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.c || b.dataset.e !== undefined) { erase = b.dataset.e !== undefined; if (b.dataset.c) col = b.dataset.c; pad.querySelectorAll('[data-c],[data-e]').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.dataset.x !== undefined && confirm('이 문제의 필기를 모두 지울까요?')) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.restore(); store(); }
    if (b.dataset.p !== undefined) { penOnly = !penOnly; b.classList.toggle('on', penOnly); try { localStorage.setItem('bio_penonly', penOnly ? '1' : '0'); } catch (e) { } } };
  /* 문제 창 감시: 열리면 연습장 켜고, 문제가 바뀌면 그 문제의 필기로 */
  const quiz = document.getElementById('quiz'); if (!quiz) return;
  const sync = () => { const open = !quiz.hidden; if (!open) { if (!pad.hidden) store(); pad.hidden = true; key = null; document.body.classList.remove('padon'); return; }
    const q = quiz.querySelector('.qq'), src = quiz.querySelector('.src'); const k = 'q:' + ((src ? src.textContent : '') + '|' + (q ? q.textContent : '')).slice(0, 90);
    if (pad.hidden) { pad.hidden = false; document.body.classList.add('padon'); key = k; fit(); return; }
    if (k !== key) { store(); key = k; load(); } };
  new MutationObserver(sync).observe(quiz, { attributes: true, attributeFilter: ['hidden'], childList: true });
})();
