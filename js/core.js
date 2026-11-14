'use strict';
const $ = s => document.querySelector(s);
const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const G = { chapters: [], S: null };
const KEY = 'twilight_entropy_save_v1';
let S;

const CH = {
  ignis: { name: '이그니스', title: '열역학 1법칙의 기관사', hair: '#e2552b', cloak: '#7a1f12', eye: '#ffd166', icon: '🔥', joint: '단열 강타 — 보스전 생명 +1' },
  clausia: { name: '클라우지아', title: '엔트로피의 마법사', hair: '#b9c7ff', cloak: '#2a2a5a', eye: '#9be7ff', icon: '❄️', joint: '카르노의 가호 — 보스전 생명 +1' },
  resona: { name: '레조나', title: '탄성파의 음유시인', hair: '#6fe3c1', cloak: '#124a42', eye: '#fff3a0', icon: '🎻', joint: '공명 화음 — 보스전 생명 +1' }
};
const TRAITS = { heat: ['🔥 열의 성향', '열역학 챕터에서 생명 +1'], entropy: ['❄️ 엔트로피의 성향', '제2법칙 챕터에서 생명 +1'], wave: ['🎵 파동의 성향', '진동·파동·소리 챕터에서 생명 +1'] };

function avatar(c, size = 72) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><rect width="64" height="64" rx="10" fill="#15121c"/><path d="M6 64 Q32 30 58 64Z" fill="${c.cloak}"/><circle cx="32" cy="28" r="14" fill="#f1d3b8"/><path d="M17 29 Q15 8 32 9 Q49 8 47 29 Q42 17 32 18 Q22 17 17 29Z" fill="${c.hair}"/><circle cx="27" cy="30" r="2" fill="${c.eye}"/><circle cx="37" cy="30" r="2" fill="${c.eye}"/><text x="46" y="16" font-size="13">${c.icon || ''}</text></svg>`;
}
function meC() { return { hair: S.hair, cloak: S.cloak, eye: '#ffffff', icon: '✦' }; }
function compC(id) { const c = Object.assign({}, CH[id]); if (S.custom[id]) Object.assign(c, S.custom[id]); return c; }
function whoInfo(w) {
  if (w === 'narr') return null;
  if (w === 'me') return { name: S.name, port: avatar(meC()) };
  if (CH[w]) { const c = compC(w); return { name: c.name, port: avatar(c) }; }
  return { name: w.n, port: `<div style="font-size:54px">${w.i}</div>` };
}
function T(s) { return String(s).replace(/\{name\}/g, S.name).replace(/\{(ignis|clausia|resona)\}/g, (_, id) => compC(id).name); }

function fresh() {
  return { name: '조율사', hair: '#3a3a55', cloak: '#4a2d6b', trait: 'heat', ch: 0, step: 0, maxCh: 0, appr: { ignis: 0, clausia: 0, resona: 0 }, party: [], custom: {}, talks: {}, mistakes: [], cleared: {} };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.appr) return Object.assign(fresh(), s); } catch (e) { } return null; }

/* ---------- modal ---------- */
function openModal(build) { const b = $('#modalBody'); b.innerHTML = ''; $('#modal').hidden = false; build(b); }
function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }

/* ---------- VN primitives ---------- */
function renderSay(el, st, onNext) {
  el.innerHTML = '';
  const v = mk('div', 'vn'); const info = whoInfo(st.who);
  if (st.art) v.appendChild(mk('div', 'scene', st.art));
  const d = mk('div', 'dlg' + (info ? '' : ' narr'));
  if (info) d.appendChild(mk('div', 'port', info.port));
  const body = mk('div'); if (info) body.appendChild(mk('div', 'who', info.name));
  body.appendChild(mk('div', 'txt', T(st.text))); body.appendChild(mk('div', 'more', '▼ 눌러서 계속'));
  d.appendChild(body); d.onclick = onNext; v.appendChild(d); el.appendChild(v);
}
function renderChoice(el, st, onDone) {
  el.innerHTML = '';
  const v = mk('div', 'vn'); const info = whoInfo(st.who || 'narr');
  const d = mk('div', 'dlg'); d.style.cursor = 'default';
  if (info) d.appendChild(mk('div', 'port', info.port));
  const body = mk('div'); if (info) body.appendChild(mk('div', 'who', info.name));
  body.appendChild(mk('div', 'txt', T(st.q))); d.appendChild(body); v.appendChild(d);
  const cs = mk('div', 'choices');
  st.opts.forEach(o => {
    const b = mk('button', '', '▸ ' + T(o.text));
    b.onclick = () => {
      let note = '';
      if (o.appr) for (const k in o.appr) { if (S.party.includes(k)) { const before = S.appr[k]; S.appr[k] = Math.max(0, S.appr[k] + o.appr[k]); note += `<br><small>${compC(k).name} 호감도 ${o.appr[k] > 0 ? '▲' : '▼'}</small>`; if (before < 3 && S.appr[k] >= 3) note += `<br><b style="color:var(--gold)">✦ 합동기 해금: ${CH[k].joint}</b>`; } }
      save();
      renderSay(el, { who: o.who || st.who || 'narr', text: (o.reply || '…') + note }, onDone);
    };
    cs.appendChild(b);
  });
  v.appendChild(cs); el.appendChild(v);
}
function playScene(el, steps, onEnd) {
  let i = 0;
  (function go() {
    const st = steps[i++]; if (!st) return onEnd();
    if (st.t === 'say') renderSay(el, st, go); else if (st.t === 'choice') renderChoice(el, st, go); else go();
  })();
}

/* ---------- game panel ---------- */
function livesFor(st, chIdx) {
  let n = 3; const ch = G.chapters[chIdx];
  if (ch && ch.trait === S.trait) n++;
  if (st.boss) n += S.party.filter(id => S.appr[id] >= 3).length;
  return n;
}
function gamePanel(el, st, chIdx, stepIdx, onWin) {
  el.innerHTML = '';
  const p = mk('div', 'gp');
  p.appendChild(mk('h2', '', (st.boss ? '☠ ' : '⚙ ') + st.title));
  p.appendChild(mk('div', 'brief', T(st.brief || '')));
  if (st.formula) p.appendChild(mk('div', 'formula', st.formula));
  const lives = livesFor(st, chIdx);
  const row = mk('div', 'btnrow'); const go = mk('button', 'pri', '시작'); row.appendChild(go);
  p.appendChild(row); el.appendChild(p);
  go.onclick = () => {
    row.remove();
    const area = mk('div'); p.appendChild(area);
    MG[st.g](st.cfg, area, ok => {
      const end = mk('div');
      if (ok) {
        end.appendChild(mk('div', 'msg good', '✦ 조율 성공! ' + T(st.win || '')));
        const b = mk('button', 'pri', '계속'); b.onclick = onWin; end.appendChild(b);
      } else {
        const key = chIdx + ':' + stepIdx; let m = S.mistakes.find(x => x.key === key);
        if (!m) { m = { key, ch: chIdx, step: stepIdx, n: 0 }; S.mistakes.push(m); } m.n++; save();
        end.appendChild(mk('div', 'msg bad', '✖ 조율 실패… <br><b>복습 포인트:</b> ' + (st.lesson || st.formula || '')));
        const r = mk('div', 'btnrow');
        const b = mk('button', 'pri', '다시 도전'); b.onclick = () => gamePanel(el, st, chIdx, stepIdx, onWin);
        const g = mk('button', '', '📖 마도서 보기'); g.onclick = () => openBook(chIdx);
        r.appendChild(b); r.appendChild(g); end.appendChild(r);
      }
      p.appendChild(end); end.scrollIntoView({ block: 'nearest' });
    }, { lives });
  };
}

/* ---------- main flow ---------- */
function next() { S.step++; save(); run(); }
function run() {
  const st0 = $('#stage'); const ch = G.chapters[S.ch];
  if (!ch) return ending();
  if (S.ch > S.maxCh) S.maxCh = S.ch;
  $('#chTitle').textContent = ch.title; st0.style.setProperty('--glow', ch.glow || '#2a1a3a');
  const st = ch.steps[S.step];
  if (!st) { S.cleared[S.ch] = true; S.ch++; S.step = 0; save(); return run(); }
  if (st.t === 'say') renderSay(st0, st, next);
  else if (st.t === 'choice') renderChoice(st0, st, next);
  else if (st.t === 'game') gamePanel(st0, st, S.ch, S.step, next);
  else if (st.t === 'recruit') recruit(st0, st);
  else if (st.t === 'camp') { st0.innerHTML = ''; const d = mk('div', 'gp', '<h2>🏕 야영지</h2><div class="brief">모닥불이 타오른다. 동료들과 이야기를 나누고 다음 여정을 준비하자.</div>'); const r = mk('div', 'btnrow'); const a = mk('button', '', '동료와 대화'); a.onclick = openCamp; const b = mk('button', 'pri', '길을 떠난다'); b.onclick = next; r.appendChild(a); r.appendChild(b); d.appendChild(r); st0.appendChild(d); }
  else next();
  window.scrollTo(0, 0);
}
function recruit(el, st) {
  if (!S.party.includes(st.id)) S.party.push(st.id);
  const c = CH[st.id]; el.innerHTML = '';
  const f = mk('div', 'form');
  f.appendChild(mk('div', '', `<h2 style="color:var(--gold);margin:0">✦ 동료 영입: ${c.name}</h2><small>${c.title}</small>`));
  const pv = mk('div', 'port'); f.appendChild(pv);
  const cur = Object.assign({ name: c.name, hair: c.hair, cloak: c.cloak }, S.custom[st.id] || {});
  const draw = () => pv.innerHTML = avatar(Object.assign({}, c, cur), 96);
  const l1 = mk('label', '', '부를 이름(별명)'); const i1 = mk('input'); i1.type = 'text'; i1.maxLength = 10; i1.value = cur.name; l1.appendChild(i1);
  const l2 = mk('label', '', '머리 색 / 망토 색'); const r = mk('div', 'row');
  const h = mk('input'); h.type = 'color'; h.value = cur.hair; const k = mk('input'); k.type = 'color'; k.value = cur.cloak;
  h.oninput = () => { cur.hair = h.value; draw(); }; k.oninput = () => { cur.cloak = k.value; draw(); };
  r.appendChild(h); r.appendChild(k); l2.appendChild(r);
  const b = mk('button', 'pri', '함께 간다');
  b.onclick = () => { cur.name = i1.value.trim() || c.name; S.custom[st.id] = cur; next(); };
  f.appendChild(l1); f.appendChild(l2); f.appendChild(b); el.appendChild(f); draw();
}
function ending() {
  $('#chTitle').textContent = '여정은 계속된다';
  $('#stage').innerHTML = `<div class="title"><div style="font-size:70px">🌒</div><h1>다음 악장을 기다리며</h1><p>지금까지 조율한 법칙은 마도서에 모두 기록되었다.<br>다음 교재 페이지가 도착하면 새로운 챕터가 이어진다.<br><br>그동안 <b>📖 마도서 → 훈련장</b>에서 미니게임을 반복해 손에 익히자.</p><div class="btns"><button class="pri" onclick="openBook()">📖 마도서 / 훈련장</button><button onclick="openMenu()">챕터 다시 플레이</button></div></div>`;
}

/* ---------- camp / status / book / menu ---------- */
function hearts(n) { return '<span class="heart">' + '♥'.repeat(Math.min(n, 5)) + '</span><span class="dim">' + '♡'.repeat(Math.max(0, 5 - n)) + '</span>'; }
function openCamp() {
  openModal(b => {
    b.appendChild(mk('h2', '', '🏕 야영지'));
    if (!S.party.length) { b.appendChild(mk('p', 'dim', '아직 함께하는 동료가 없다.')); return; }
    const area = mk('div'); b.appendChild(area);
    (function list() {
      area.innerHTML = '';
      S.party.forEach(id => {
        const c = compC(id); const card = mk('div', 'card2');
        card.appendChild(mk('div', '', avatar(c, 64)));
        const g = mk('div', 'grow', `<b>${c.name}</b> <small>${CH[id].title}</small><br>${hearts(S.appr[id])} ${S.appr[id] >= 3 ? '<small style="color:var(--gold)">✦ ' + CH[id].joint + '</small>' : '<small>호감도 3에서 합동기 해금</small>'}`);
        G.chapters.forEach((ch, ci) => {
          if (ci > S.maxCh) return;
          (ch.camp || []).filter(t => t.who === id).forEach(t => {
            if (ci === S.ch && t.after != null && S.step < t.after) return;
            const done = S.talks[t.id]; const bt = mk('button', '', (done ? '✓ ' : '💬 ') + t.title); bt.style.margin = '6px 6px 0 0'; bt.style.fontSize = '13px';
            bt.onclick = () => { const keep = done ? JSON.stringify(S.appr) : null; playScene(area, t.steps, () => { if (keep) S.appr = JSON.parse(keep); S.talks[t.id] = true; save(); list(); }); };
            g.appendChild(bt);
          });
        });
        card.appendChild(g); area.appendChild(card);
      });
    })();
  });
}
function openStat() {
  openModal(b => {
    b.appendChild(mk('h2', '', '🧙 조율사의 상태'));
    b.appendChild(mk('div', 'card2', `<div>${avatar(meC(), 80)}</div><div class="grow"><b>${S.name}</b><br>${TRAITS[S.trait][0]} — <small>${TRAITS[S.trait][1]}</small><br><small>클리어한 챕터: ${Object.keys(S.cleared).length} / ${G.chapters.length} · 오답 기록: ${S.mistakes.length}건</small></div>`));
    S.party.forEach(id => { const c = compC(id); b.appendChild(mk('div', 'card2', `<div>${avatar(c, 64)}</div><div class="grow"><b>${c.name}</b> <small>${CH[id].title}</small><br>호감도 ${hearts(S.appr[id])}</div>`)); });
  });
}
function gameSteps(maxCh) { const out = []; G.chapters.forEach((ch, ci) => { if (ci > maxCh) return; ch.steps.forEach((st, si) => { if (st.t === 'game') out.push({ ci, si, st }); }); }); return out; }
function openBook(tabCh) {
  openModal(b => {
    b.appendChild(mk('h2', '', '📖 조율사의 마도서'));
    const tabs = mk('div', 'tabs'), body = mk('div'); b.appendChild(tabs); b.appendChild(body);
    const show = (key, btn) => {
      [...tabs.children].forEach(x => x.classList.remove('on')); btn.classList.add('on'); body.innerHTML = '';
      if (typeof key === 'number') body.appendChild(mk('div', 'notes', G.chapters[key].notes));
      else {
        const items = key === 'wrong' ? S.mistakes.map(m => ({ ci: m.ch, si: m.step, st: G.chapters[m.ch].steps[m.step], n: m.n })).filter(x => x.st) : gameSteps(S.maxCh);
        if (!items.length) body.appendChild(mk('p', 'dim', key === 'wrong' ? '아직 실패한 조율이 없다. 훌륭하다.' : '아직 기록이 없다.'));
        const lst = mk('div', 'list'); body.appendChild(lst);
        items.forEach(it => {
          const bt = mk('button', '', `[${it.ci + 1}장] ${it.st.title}${it.n ? ` <small>— 실패 ${it.n}회</small>` : ''}${it.st.lesson && key === 'wrong' ? `<br><small>${it.st.lesson}</small>` : ''}`);
          bt.onclick = () => gamePanel(body, it.st, it.ci, it.si, () => show(key, btn)); lst.appendChild(bt);
        });
      }
    };
    G.chapters.forEach((ch, ci) => { if (ci > S.maxCh) return; const bt = mk('button', '', (ci + 1) + '장'); bt.title = ch.title; bt.onclick = () => show(ci, bt); tabs.appendChild(bt); });
    const w = mk('button', '', '✖ 오답 복습장'); w.onclick = () => show('wrong', w); tabs.appendChild(w);
    const t = mk('button', '', '⚔ 훈련장'); t.onclick = () => show('train', t); tabs.appendChild(t);
    const first = typeof tabCh === 'number' ? Math.min(tabCh, S.maxCh) : Math.min(S.ch, S.maxCh, G.chapters.length - 1);
    show(first, tabs.children[first]);
  });
}
function openMenu() {
  openModal(b => {
    b.appendChild(mk('h2', '', '☰ 메뉴'));
    b.appendChild(mk('p', 'dim', '진행 상황은 이 브라우저에 자동 저장된다.'));
    const lst = mk('div', 'list'); b.appendChild(lst);
    G.chapters.forEach((ch, ci) => { if (ci > S.maxCh) return; const bt = mk('button', '', `${S.cleared[ci] ? '✓' : '▶'} ${ch.title} — 처음부터`); bt.onclick = () => { S.ch = ci; S.step = 0; save(); closeModal(); run(); }; lst.appendChild(bt); });
    const ex = mk('button', '', '💾 세이브 코드 내보내기 / 불러오기'); lst.appendChild(ex);
    ex.onclick = () => { const v = prompt('아래 코드를 복사해 보관하거나, 다른 기기의 코드를 붙여넣고 확인을 누르세요.', btoa(unescape(encodeURIComponent(JSON.stringify(S))))); if (v) { try { const s = JSON.parse(decodeURIComponent(escape(atob(v)))); if (s && s.appr) { S = G.S = Object.assign(fresh(), s); save(); closeModal(); run(); } } catch (e) { alert('코드를 읽을 수 없다.'); } } };
    const nw = mk('button', '', '⚠ 새로 시작 (저장 삭제)'); lst.appendChild(nw);
    nw.onclick = () => { if (confirm('모든 진행 상황을 지우고 처음부터 시작할까요?')) { localStorage.removeItem(KEY); closeModal(); titleScreen(); } };
  });
}

/* ---------- title & customization ---------- */
function titleScreen() {
  const st = $('#stage'); $('#chTitle').textContent = '엔트로피의 황혼';
  const sv = load();
  st.innerHTML = `<div class="title"><div style="font-size:70px">🌘</div><h1>엔트로피의 황혼과<br>공명의 노래</h1><p>Twilight of Entropy<br><small>세계의 열원이 꺼져간다. 잃어버린 물리 법칙을 조율하라.</small></p><div class="btns"></div></div>`;
  const bs = st.querySelector('.btns');
  if (sv) { const c = mk('button', 'pri', `이어하기 — ${sv.name} (${Math.min(sv.ch + 1, G.chapters.length)}장)`); c.onclick = () => { S = G.S = sv; run(); }; bs.appendChild(c); }
  const n = mk('button', sv ? '' : 'pri', '새로운 여정'); n.onclick = () => { if (sv && !confirm('기존 저장을 덮어쓰고 새로 시작할까요?')) return; customize(); }; bs.appendChild(n);
}
function customize() {
  S = G.S = fresh(); const st = $('#stage'); st.innerHTML = '';
  const f = mk('div', 'form'); f.appendChild(mk('h2', '', '<span style="color:var(--gold)">✦ 조율사의 각성</span>'));
  const pv = mk('div', 'port'); f.appendChild(pv); const draw = () => pv.innerHTML = avatar(meC(), 96);
  const l1 = mk('label', '', '이름'); const i1 = mk('input'); i1.type = 'text'; i1.maxLength = 10; i1.placeholder = '조율사'; l1.appendChild(i1);
  const l2 = mk('label', '', '머리 색 / 망토 색'); const r = mk('div', 'row');
  const h = mk('input'); h.type = 'color'; h.value = S.hair; const k = mk('input'); k.type = 'color'; k.value = S.cloak;
  h.oninput = () => { S.hair = h.value; draw(); }; k.oninput = () => { S.cloak = k.value; draw(); }; r.appendChild(h); r.appendChild(k); l2.appendChild(r);
  const l3 = mk('label', '', '초기 물리 성향'); const pk = mk('div', 'pick');
  Object.keys(TRAITS).forEach(id => { const bt = mk('button', id === S.trait ? 'on' : '', `${TRAITS[id][0]}<br><small>${TRAITS[id][1]}</small>`); bt.type = 'button'; bt.onclick = () => { S.trait = id; [...pk.children].forEach(x => x.classList.remove('on')); bt.classList.add('on'); }; pk.appendChild(bt); });
  l3.appendChild(pk);
  const go = mk('button', 'pri', '여정을 시작한다'); go.onclick = () => { S.name = i1.value.trim() || '조율사'; save(); run(); };
  f.appendChild(l1); f.appendChild(l2); f.appendChild(l3); f.appendChild(go); st.appendChild(f); draw();
}

G.boot = () => {
  $('#bCamp').onclick = () => S && openCamp(); $('#bBook').onclick = () => S && openBook(); $('#bStat').onclick = () => S && openStat(); $('#bMenu').onclick = () => S && openMenu();
  $('#modalX').onclick = closeModal;
  titleScreen();
};

/* chapter authoring helpers */
const say = (who, text, art) => ({ t: 'say', who, text, art });
const N = (text, art) => say('narr', text, art);
const game = (g, title, o) => Object.assign({ t: 'game', g, title }, o);
