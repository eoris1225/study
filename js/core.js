'use strict';
const $ = s => document.querySelector(s);
const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const G = { chapters: [], S: null };
const KEY = 'twilight_entropy_save_v1';
let S;

const CH = {
  ignis: { name: '이그니스', title: '열역학 1법칙의 기관사 (인간)', joint: '단열 강타 — 보스전 생명 +1', look: { rig: 'ignis', skin: '#f9a77c', hair: '#e2552b', hairStyle: 3, eye: '#ffb300', outfit: '#8a2a1a', wings: false, acc: 5 } },
  clausia: { name: '클라우지아', title: '엔트로피의 마법사 (얼음 요정)', joint: '카르노의 가호 — 보스전 생명 +1', look: { rig: 'clausia', skin: '#ffc2c0', hair: '#b9c7ff', hairStyle: 1, eye: '#5aa9ff', outfit: '#3a3a8a', wings: true, wingColor: 'rgba(170,220,255,.7)', acc: 2 } },
  resona: { name: '레조나', title: '탄성파의 음유시인 (숲 요정)', joint: '공명 화음 — 보스전 생명 +1', look: { rig: 'resona', skin: '#ffbb96', hair: '#6fe3c1', hairStyle: 2, eye: '#2f9e6f', outfit: '#1f7a5a', wings: true, wingColor: 'rgba(210,255,170,.7)', acc: 3 } }
};
const TRAITS = { heat: ['🔥 열의 성향', '열역학 챕터에서 생명 +1'], entropy: ['❄️ 엔트로피의 성향', '제2법칙 챕터에서 생명 +1'], wave: ['🎵 파동의 성향', '진동·파동·소리 챕터에서 생명 +1'] };

function avatar(L, size = 72) { return Art.portrait(L, size); }
function meC() { return S.look; }
function compC(id) { const c = Object.assign({ name: CH[id].name }, CH[id].look), u = S.custom[id]; if (u) { if (u.name) c.name = u.name; if (u.hair) c.hair = u.hair; if (u.outfit || u.cloak) c.outfit = u.outfit || u.cloak; } return c; }
function whoInfo(w) {
  if (w === 'narr') return null;
  if (w === 'me') return { name: S.name, port: avatar(meC()) };
  if (CH[w]) { const c = compC(w); return { name: c.name, port: avatar(c) }; }
  return { name: w.n, port: `<div style="font-size:54px">${w.i}</div>` };
}
function T(s) { return String(s).replace(/\{name\}/g, S.name).replace(/\{(ignis|clausia|resona)\}/g, (_, id) => compC(id).name); }

function fresh() {
  return { name: '조율사', look: { skin: '#ffb594', hair: '#5a4a8a', hairStyle: 0, eye: '#6b4a2f', outfit: '#6a3fa0', wings: false, wingColor: 'rgba(255,220,250,.7)', acc: 0 }, orbs: 0, trait: 'heat', ch: 0, step: 0, maxCh: 0, appr: { ignis: 0, clausia: 0, resona: 0 }, party: [], custom: {}, talks: {}, mistakes: [], cleared: {} };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.appr) { const f = fresh(); return Object.assign(f, s, { look: Object.assign(f.look, s.look || {}) }); } } catch (e) { } return null; }

/* ---------- modal ---------- */
function openModal(build) { const b = $('#modalBody'); b.innerHTML = ''; $('#modal').hidden = false; build(b); }
function closeModal() { $('#modalBox').classList.remove('wide'); $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }

/* ---------- VN primitives ---------- */
function whoColor(w) { return { me: '#ffd23f', ignis: '#ff9a6a', clausia: '#9fe0ff', resona: '#b6f27a' }[w] || '#ffffff'; }
function renderSay(el, st, onNext) {
  el.innerHTML = '';
  const v = mk('div', 'vn'); const info = whoInfo(st.who);
  if (st.art) v.appendChild(mk('div', 'scene', st.art));
  const d = mk('div', 'dlg' + (info ? '' : ' narr'));
  d.style.setProperty('--who', whoColor(st.who));
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
  n += Math.min(2, Math.floor((S.orbs || 0) / 25));
  return n;
}
function findLesson(chIdx, st) { return ((window.LESSONS || {})[chIdx] || []).find(l => l.match.some(m => st.title.includes(m))); }
function findTip(st) { const T0 = window.TIPS || {}; const k = Object.keys(T0).find(k => st.title.includes(k)); return k ? T0[k] : null; }
function lessonView(el, les, onDone, doneLabel, textMode) {
  if (!textMode && window.CUTS && CUTS[les.id] && typeof Cut !== 'undefined') {
    const qs = les.cards.filter(c => c.q), after = Object.assign({}, les, { cards: qs.length ? qs : les.cards, _full: les });
    return Cut.play(CUTS[les.id], () => lessonView(el, after, onDone, doneLabel, true));
  }
  let i = 0; S.seen = S.seen || {};
  (function show() {
    el.innerHTML = ''; const c = les.cards[i], box = mk('div', 'gp lesson');
    box.appendChild(mk('div', 'ltop', `📘 개념 수업 · ${les.title} <span class="dots">${les.cards.map((_, k) => k === i ? '●' : '○').join('')}</span>`));
    if (les._full) { const rb = mk('div', 'btnrow cutagain'), a = mk('button', '', '▶ 컷신 다시 보기'), b = mk('button', '', '📄 설명 글로 읽기'); a.onclick = () => lessonView(el, les._full, onDone, doneLabel); b.onclick = () => lessonView(el, les._full, onDone, doneLabel, true); rb.append(a, b); box.appendChild(rb); }
    const nav = mk('div', 'btnrow'), prev = mk('button', '', '◀ 이전'), nx = mk('button', 'pri', i === les.cards.length - 1 ? (doneLabel || '수업 끝! ▶') : '다음 ▶');
    prev.disabled = i === 0; prev.onclick = () => { i--; show(); };
    nx.onclick = () => { if (i === les.cards.length - 1) { S.seen[les.id] = 1; save(); onDone(); } else { i++; show(); } };
    if (c.q) {
      box.appendChild(mk('h2', '', '✏️ 확인 문제')); box.appendChild(mk('div', 'brief', c.q));
      const ch = mk('div', 'choices'), fb = mk('div', 'msg'); nx.disabled = true;
      c.a.forEach((a, k) => { const b = mk('button', '', a); b.onclick = () => { if (k === c.c) { fb.className = 'msg good'; fb.innerHTML = '✔ 맞아요! ' + c.why; nx.disabled = false;[...ch.children].forEach(x => x.disabled = true); b.style.borderColor = 'var(--green)'; } else { fb.className = 'msg bad'; fb.innerHTML = '✖ 다시 생각해 봐요. ' + (c.hint || ''); b.disabled = true; } }; ch.appendChild(b); });
      box.appendChild(ch); box.appendChild(fb);
    } else { box.appendChild(mk('h2', '', c.h)); const fx = (window.CARD_FX || {})[les.id + ':' + i]; if (fx) mountFx(box, fx); box.appendChild(mk('div', 'brief lbody', T(c.b))); }
    nav.appendChild(prev); nav.appendChild(nx); box.appendChild(nav); el.appendChild(box); el.scrollTop = 0;
  })();
}
function gamePanel(el, st, chIdx, stepIdx, onWin) {
  el.innerHTML = ''; S.seen = S.seen || {};
  const les = findLesson(chIdx, st), again = () => gamePanel(el, st, chIdx, stepIdx, onWin);
  const p = mk('div', 'gp');
  p.appendChild(mk('h2', '', (st.boss ? '☠ ' : '⚙ ') + st.title));
  p.appendChild(mk('div', 'brief', T(st.brief || '')));
  if (st.formula) p.appendChild(mk('div', 'formula', st.formula));
  const lives = livesFor(st, chIdx);
  const row = mk('div', 'btnrow'); const go = mk('button', 'pri', '⚔ 전투 시작');
  if (les) { const lb = mk('button', S.seen[les.id] ? '' : 'pri', S.seen[les.id] ? '📘 개념 다시 보기' : '📘 먼저 개념 배우기 (처음이라면 여기!)'); lb.onclick = () => lessonView(el, les, again, '수업 끝! 전투하러 가기 ▶'); row.appendChild(lb); if (!S.seen[les.id]) { go.className = ''; go.textContent = '이미 알아요 — 바로 전투'; } }
  row.appendChild(go); p.appendChild(row); el.appendChild(p);
  go.onclick = () => {
    row.remove(); p.classList.add('playing', 'g-' + st.g);
    const help = mk('div', 'helpbar'), how = (window.HOW || {})[st.g], tip = findTip(st) || st.lesson;
    if (how) help.appendChild(mk('span', 'how', '🎮 ' + how));
    if (tip) { const hb = mk('button', '', '💡 힌트'), tv = mk('div', 'tipbox', tip); tv.hidden = true; hb.onclick = () => tv.hidden = !tv.hidden; help.appendChild(hb); help.appendChild(tv); }
    p.appendChild(help);
    const area = mk('div', 'mgarea'); p.appendChild(area);
    MG[st.g](st.cfg, area, ok => {
      const end = mk('div');
      if (ok) {
        end.appendChild(mk('div', 'msg good', '✦ 조율 성공! ' + T(st.win || '') + (st.lesson ? '<br><small>📌 정리: ' + st.lesson + '</small>' : '')));
        const b = mk('button', 'pri', '계속'); b.onclick = onWin; end.appendChild(b);
      } else {
        const key = chIdx + ':' + stepIdx; let m = S.mistakes.find(x => x.key === key);
        if (!m) { m = { key, ch: chIdx, step: stepIdx, n: 0 }; S.mistakes.push(m); } m.n++; save();
        end.appendChild(mk('div', 'msg bad', '✖ 아쉽다! 괜찮아요, 다시 하면 됩니다.<br><b>📌 핵심:</b> ' + (st.lesson || st.formula || '') + (tip && tip !== st.lesson ? '<br><b>💡 힌트:</b> ' + tip : '')));
        const r = mk('div', 'btnrow');
        const b = mk('button', 'pri', '다시 도전'); b.onclick = again; r.appendChild(b);
        if (les) { const lb = mk('button', '', '📘 개념 다시 배우기'); lb.onclick = () => lessonView(el, les, again, '다시 도전하러 가기 ▶'); r.appendChild(lb); }
        const g = mk('button', '', '📖 마도서'); g.onclick = () => openBook(chIdx); r.appendChild(g); end.appendChild(r);
      }
      p.appendChild(end); end.scrollIntoView({ block: 'nearest' });
    }, { lives, boss: !!st.boss });
  };
}

/* ---------- main flow ---------- */
function showFull(build) { World.stop(); const st = $('#stage'); st.className = 'full'; st.innerHTML = ''; build(st); st.scrollTop = 0; }
function run() {
  if (!G.chapters[S.ch]) { World.stop(); return ending(); }
  if (S.ch > S.maxCh) S.maxCh = S.ch;
  World.load();
}
function recruit(el, st, next) {
  if (!S.party.includes(st.id)) S.party.push(st.id);
  const c = CH[st.id]; el.innerHTML = '';
  const f = mk('div', 'form');
  f.appendChild(mk('div', '', `<h2 style="color:var(--gold);margin:0">✦ 동료 영입: ${c.name}</h2><small>${c.title}</small>`));
  const pv = mk('div', 'port'); f.appendChild(pv);
  const cur = Object.assign({ name: c.name, hair: c.look.hair, outfit: c.look.outfit }, S.custom[st.id] || {}); if (cur.cloak) { cur.outfit = cur.cloak; delete cur.cloak; }
  const draw = () => pv.innerHTML = avatar(Object.assign({}, c.look, { hair: cur.hair, outfit: cur.outfit }), 110);
  const l1 = mk('label', '', '부를 이름(별명)'); const i1 = mk('input'); i1.type = 'text'; i1.maxLength = 10; i1.value = cur.name; l1.appendChild(i1);
  const l2 = mk('label', '', '머리 색 / 옷 색'); const r = mk('div', 'row');
  const h = mk('input'); h.type = 'color'; h.value = cur.hair; const k = mk('input'); k.type = 'color'; k.value = cur.outfit;
  h.oninput = () => { cur.hair = h.value; draw(); }; k.oninput = () => { cur.outfit = k.value; draw(); };
  r.appendChild(h); r.appendChild(k); l2.appendChild(r);
  const b = mk('button', 'pri', '함께 간다');
  b.onclick = () => { cur.name = i1.value.trim() || c.name; S.custom[st.id] = cur; next(); };
  f.appendChild(l1); f.appendChild(l2); f.appendChild(b); el.appendChild(f); draw();
}
function ending() {
  showFull(st => { st.innerHTML = `<div class="title"><div style="font-size:70px">🌒</div><h1>다음 악장을 기다리며</h1><p>지금까지 조율한 법칙은 마도서에 모두 기록되었다.<br>다음 교재 페이지가 도착하면 새로운 챕터가 이어진다.<br><br>그동안 <b>📖 마도서 → 훈련장</b>에서 미니게임을 반복해 손에 익히자.</p><div class="btns"><button class="pri" onclick="openWorkbook()">📝 실전 문제집 풀기</button><button onclick="openBook()">📖 마도서 / 훈련장</button><button onclick="openMenu()">챕터 다시 플레이</button></div></div>`; });
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
    b.appendChild(mk('div', 'card2', `<div>${avatar(meC(), 80)}</div><div class="grow"><b>${S.name}</b> <small>${S.look.wings ? '요정' : '인간'} · ✦ 공명 조각 ${S.orbs || 0}개</small><br>${TRAITS[S.trait][0]} — <small>${TRAITS[S.trait][1]}</small><br><small>클리어한 챕터: ${Object.keys(S.cleared).length} / ${G.chapters.length} · 오답 기록: ${S.mistakes.length}건</small></div>`));
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
      else if (key === 'learn') { const lst = mk('div', 'list'); body.appendChild(lst); G.chapters.forEach((ch, ci) => { if (ci > S.maxCh) return; ((window.LESSONS || {})[ci] || []).forEach(l => { const bt = mk('button', '', `[${ci + 1}장] 📘 ${l.title}${(S.seen || {})[l.id] ? ' <small>✓ 수강</small>' : ''}`); bt.onclick = () => lessonView(body, l, () => show(key, btn), '목록으로 ▶'); lst.appendChild(bt); }); }); }
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
    const lt = mk('button', '', '📘 수업'); lt.onclick = () => show('learn', lt); tabs.appendChild(lt);
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
    const shop = mk('div', 'shop'); S.up = S.up || {}; const drawShop = () => { shop.innerHTML = `<b>🛒 상점</b> <small>공명 조각 ✦ ${S.orbs || 0}개</small>`; [['dj', '이단 점프', '공중에서 한 번 더 점프', 30], ['mag', '조각 자석', '가까운 조각이 끌려온다', 25], ['hp', '하트 +1', '체력이 4칸이 된다', 40]].forEach(([k, n, d, c]) => { const bt = mk('button', '', S.up[k] ? `✓ ${n} <small>보유 중</small>` : `${n} — ✦${c} <small>${d}</small>`); bt.disabled = !!S.up[k] || (S.orbs || 0) < c; bt.onclick = () => { S.orbs -= c; S.up[k] = 1; save(); Sfx.play('buy'); drawShop(); }; shop.appendChild(bt); }); const mu = mk('button', '', S.mute ? '🔇 효과음 꺼짐' : '🔊 효과음 켜짐'); mu.onclick = () => { S.mute = !S.mute; save(); drawShop(); }; shop.appendChild(mu); }; drawShop(); lst.appendChild(shop);
    const sk = mk('button', 'pri', '⏭ 지금 구간 건너뛰기 (다음 만남으로)'); sk.onclick = () => { closeModal(); World.skip(); }; lst.appendChild(sk);
    const nav = mk('div', 'btnrow'), pv = mk('button', '', '◀ 이전 장'), nx = mk('button', '', '다음 장 ▶'); pv.disabled = S.ch <= 0; nx.disabled = S.ch >= G.chapters.length - 1; pv.onclick = () => { S.ch--; S.step = 0; save(); closeModal(); run(); }; nx.onclick = () => { S.ch++; S.step = 0; save(); closeModal(); run(); }; nav.append(pv, nx); lst.appendChild(nav);
    G.chapters.forEach((ch, ci) => { const bt = mk('button', '', `${S.cleared[ci] ? '✓' : '▶'} ${ch.title} — 처음부터`); bt.onclick = () => { S.ch = ci; S.step = 0; save(); closeModal(); run(); }; lst.appendChild(bt); });
    const ex = mk('button', '', '💾 세이브 코드 내보내기 / 불러오기'); lst.appendChild(ex);
    ex.onclick = () => { const v = prompt('아래 코드를 복사해 보관하거나, 다른 기기의 코드를 붙여넣고 확인을 누르세요.', btoa(unescape(encodeURIComponent(JSON.stringify(S))))); if (v) { try { const s = JSON.parse(decodeURIComponent(escape(atob(v)))); if (s && s.appr) { S = G.S = Object.assign(fresh(), s); save(); closeModal(); run(); } } catch (e) { alert('코드를 읽을 수 없다.'); } } };
    const nw = mk('button', '', '⚠ 새로 시작 (저장 삭제)'); lst.appendChild(nw);
    nw.onclick = () => { if (confirm('모든 진행 상황을 지우고 처음부터 시작할까요?')) { localStorage.removeItem(KEY); closeModal(); titleScreen(); } };
  });
}

/* ---------- title & customization ---------- */
function titleScreen() {
  World.stop(); const st = $('#stage'); st.className = 'full'; $('#chTitle').textContent = '';
  const sv = load();
  st.innerHTML = `<div class="title"><div id="tArt"></div><h1>엔트로피의 황혼과 <br>공명의 노래</h1><p>Twilight of Entropy<br><small>세계의 열원이 꺼져간다. 잃어버린 물리 법칙을 조율하라.</small></p><div class="btns"></div></div>`;
  const bs = st.querySelector('.btns');
  st.querySelector('#tArt').innerHTML = '<div class="trio">' + ['ignis', 'clausia', 'resona'].map(id => avatar(CH[id].look, 84)).join('') + '</div>';
  if (sv) { const c = mk('button', 'pri', `이어하기 — ${sv.name} (${Math.min(sv.ch + 1, G.chapters.length)}장)`); c.onclick = () => { S = G.S = sv; goFull(); run(); }; bs.appendChild(c); }
  const wbb = mk('button', '', '📝 실전 문제집 바로 풀기'); wbb.onclick = () => { if (!S) S = G.S = sv || fresh(); openWorkbook(); };
  const n = mk('button', sv ? '' : 'pri', '새로운 여정'); n.onclick = () => { if (sv && !confirm('기존 저장을 덮어쓰고 새로 시작할까요?')) return; customize(); }; bs.appendChild(n); bs.appendChild(wbb);
}
function goFull() { try { const e = document.documentElement; if (('ontouchstart' in window) && e.requestFullscreen && !document.fullscreenElement) e.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { })).catch(() => { }); } catch (e) { } }
function customize() {
  S = G.S = fresh(); const st = $('#stage'); st.className = 'full'; st.innerHTML = ''; const L = S.look;
  const f = mk('div', 'form custom'); const left = mk('div', 'cprev'), right = mk('div', 'copts'); f.appendChild(left); f.appendChild(right); st.appendChild(f);
  left.appendChild(mk('h2', '', '<span style="color:var(--gold)">✦ 조율사의 각성</span>'));
  const pc = mk('canvas'); pc.width = 260; pc.height = 260; left.appendChild(pc); const px = pc.getContext('2d');
  (function anim(now) { if (!pc.isConnected) return; px.clearRect(0, 0, 260, 260); px.fillStyle = 'rgba(0,0,0,.3)'; px.beginPath(); px.ellipse(130, 232, 46, 10, 0, 0, 7); px.fill(); Art.chibi(px, 130, 230, 3.1, L, { t: now / 1000, walk: true, dir: 1 }); requestAnimationFrame(anim); })(0);
  const row = (label, node) => { const l = mk('label', '', label); l.appendChild(node); right.appendChild(l); };
  const i1 = mk('input'); i1.type = 'text'; i1.maxLength = 10; i1.placeholder = '조율사'; row('이름', i1);
  const pick = (opts, get, set) => { const pk = mk('div', 'pick'); opts.forEach((o, i) => { const b = mk('button', get() === i ? 'on' : '', o); b.type = 'button'; b.onclick = () => { set(i); [...pk.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); }; pk.appendChild(b); }); return pk; };
  row('종족', pick(['🧑 인간', '🧚 요정'], () => L.wings ? 1 : 0, i => L.wings = !!i));
  row('머리 모양', pick(Art.HAIRS, () => L.hairStyle, i => L.hairStyle = i));
  row('장식', pick(Art.ACCS, () => L.acc, i => L.acc = i));
  const colors = mk('div', 'row'); [['머리', 'hair'], ['옷', 'outfit'], ['눈', 'eye'], ['피부', 'skin']].forEach(([n, k]) => { const w = mk('span', 'cc', n + ' '); const c = mk('input'); c.type = 'color'; c.value = L[k]; c.oninput = () => L[k] = c.value; w.appendChild(c); colors.appendChild(w); }); row('색상', colors);
  const tr = mk('div', 'pick'); Object.keys(TRAITS).forEach(id => { const bt = mk('button', id === S.trait ? 'on' : '', `${TRAITS[id][0]}<br><small>${TRAITS[id][1]}</small>`); bt.type = 'button'; bt.onclick = () => { S.trait = id; [...tr.children].forEach(c => c.classList.remove('on')); bt.classList.add('on'); }; tr.appendChild(bt); }); row('초기 물리 성향', tr);
  const go = mk('button', 'pri', '여정을 시작한다 ▶'); go.onclick = () => { S.name = i1.value.trim() || '조율사'; save(); goFull(); run(); }; right.appendChild(go);
}

G.boot = () => {
  $('#bCamp').onclick = () => S && openCamp(); $('#bBook').onclick = () => S && openBook(); $('#bStat').onclick = () => S && openStat(); $('#bMenu').onclick = () => S && openMenu(); $('#bWb').onclick = () => S && openWorkbook();
  $('#modalX').onclick = closeModal;
  titleScreen();
};

/* chapter authoring helpers */
const say = (who, text, art) => ({ t: 'say', who, text, art });
const N = (text, art) => say('narr', text, art);
const game = (g, title, o) => Object.assign({ t: 'game', g, title }, o);
