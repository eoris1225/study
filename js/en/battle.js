'use strict';
/* 영어 전투: 맞히면 내 캐릭터와 동료가 공격, 틀리면 몬스터가 반격. 몬스터는 지문의 핵심 단어 이름을 달고 나오고,
   쓰러뜨리면 그 단어 카드를 모은다. 캐릭터는 물리 게임 저장(외모·동료)을 그대로 불러온다. */
const Battle = (() => {
  const PAL = ['#ff6b8b', '#7cc8ff', '#3ddc97', '#ffb547', '#b18cff', '#ff8a3d'];
  const COMP = { ignis: { rig: 'ignis', skin: '#f9a77c', hair: '#e2552b', hairStyle: 3, eye: '#ffb300', outfit: '#8a2a1a', wings: false, acc: 5 }, clausia: { rig: 'clausia', skin: '#ffc2c0', hair: '#b9c7ff', hairStyle: 1, eye: '#5aa9ff', outfit: '#3a3a8a', wings: true, wingColor: 'rgba(170,220,255,.7)', acc: 2 }, resona: { rig: 'resona', skin: '#ffbb96', hair: '#6fe3c1', hairStyle: 2, eye: '#2f9e6f', outfit: '#1f7a5a', wings: true, wingColor: 'rgba(210,255,170,.7)', acc: 3 } };
  const CNAME = { ignis: '이그니스', clausia: '클라우지아', resona: '레조나' };
  const CHEER = { ignis: ['좋아, 그 기세!', '한 방 더!', '불꽃처럼 간다!'], clausia: ['정확해요.', '흐름을 읽었네요.', '깔끔한 해석이에요.'], resona: ['리듬 좋아~', '그 문장, 울림이 있어!', '다음 소절!'] };
  const OUCH = { ignis: ['괜찮아, 다시!', '흔들리지 마.'], clausia: ['문장 구조를 다시 봐요.', '주어부터 찾아요.'], resona: ['쉼표 뒤를 봐 봐!', '천천히 끊어 읽자.'] };
  function hero() { try { const s = JSON.parse(localStorage.getItem('twilight_entropy_save_v1')); if (s && s.look) return { look: Object.assign({ skin: '#ffb594', hair: '#5a4a8a', hairStyle: 0, eye: '#6b4a2f', outfit: '#6a3fa0', wings: false, acc: 0 }, s.look), name: s.name || '조율사', party: (s.party && s.party.length ? s.party : ['ignis', 'clausia', 'resona']).slice(0, 2) }; } catch (e) { } return { look: { skin: '#ffb594', hair: '#5a4a8a', hairStyle: 0, eye: '#6b4a2f', outfit: '#6a3fa0', wings: false, acc: 0 }, name: '조율사', party: ['ignis', 'clausia'] }; }
  function mount(parent, total, words, opt = {}) {
    const H = hero(); const wrap = document.createElement('div'); wrap.className = 'bt'; const cv = document.createElement('canvas'); const msg = document.createElement('div'); msg.className = 'btmsg'; wrap.append(cv, msg); parent.appendChild(wrap); const x = cv.getContext('2d');
    const per = opt.boss ? total : Math.max(3, Math.min(5, Math.ceil(total / 3))); const waves = []; let left = total; let wi = 0; while (left > 0) { const hp = Math.min(per, left); waves.push(hp); left -= hp; }
    const pool = (words || []).slice(); const mons = waves.map((hp, k) => { const last = k === waves.length - 1 && waves.length > 1; const w = pool.length ? pool[(k * 7 + 3) % pool.length] : ['?', '']; return { hp, max: hp, kind: k % 4, col: PAL[k % PAL.length], boss: opt.boss || last && total >= 10, word: w[0], mean: w[1] }; });
    let t = 0, raf = 0, alive = true, shake = 0, flash = 0, lunge = 0, mhit = 0, pops = [], dead = 0, enter = 1, won = false;
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = wrap.clientWidth * d; cv.height = 190 * d; cv.style.height = '190px'; }; fit(); addEventListener('resize', fit);
    const say = (who, s) => { msg.innerHTML = `<b>${who}</b> ${s}`; msg.classList.remove('in'); void msg.offsetWidth; msg.classList.add('in'); };
    const cur = () => mons[wi];
    say('⚔', `<b>${cur().word}</b> ${cur().boss ? '보스' : '몬스터'}가 나타났다! <span class="dim">${cur().mean || ''}</span>`);
    function frame(now) { if (!alive) return; if (!wrap.isConnected) { alive = false; removeEventListener('resize', fit); return; } t += 1 / 60; const d = Math.min(2, devicePixelRatio || 1), W = cv.width / d, Hh = cv.height / d; x.setTransform(d, 0, 0, d, 0, 0);
      const sx = shake > 0 ? (Math.random() - .5) * shake : 0; shake *= .86; x.save(); x.translate(sx, 0);
      const g = x.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#2b2170'); g.addColorStop(1, '#5a3bb0'); x.fillStyle = g; x.fillRect(-10, 0, W + 20, Hh);
      for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc((i * 97 + t * 10) % W, (i * 53) % 120, 1.5, 0, 7); x.fill(); }
      x.fillStyle = '#3b2f6b'; x.beginPath(); x.ellipse(W / 2, Hh + 40, W * .7, 80, 0, 0, 7); x.fill();
      /* 우리 편 */
      const L = lunge > 0 ? Math.sin(lunge * Math.PI) * 40 : 0; lunge = Math.max(0, lunge - .06);
      H.party.forEach((c, i) => { if (COMP[c] && (typeof Art !== "undefined")) { x.save(); Art.chibi(x, 56 + i * 64 + L * .5, Hh - 16 - i * 6, .85, COMP[c], { t, walk: L > 0 ? 1 : 0 }); x.restore(); } });
      if ((typeof Art !== "undefined")) Art.chibi(x, 190 + L, Hh - 12, 1, H.look, { t, walk: L > 0 ? 1 : 0 });
      /* 몬스터 */
      const m = cur(); if (m) { enter = Math.max(0, enter - .04); const mx = W - 110 + enter * 200, my = Hh - 22 + (dead > 0 ? dead * 60 : 0), sc = (m.boss ? 1.5 : 1.1) * (1 - dead * .8);
        x.save(); x.globalAlpha = 1 - dead; if (mhit > 0) { x.translate((Math.random() - .5) * 10 * mhit, 0); } if ((typeof Art !== "undefined") && sc > 0.05) Art.monster(x, mx, my, sc, m.kind, mhit > 0 && Math.floor(t * 30) % 2 ? '#ffffff' : m.col, t, m.boss); x.restore(); mhit = Math.max(0, mhit - .05);
        x.fillStyle = 'rgba(0,0,0,.4)'; x.beginPath(); x.roundRect(W - 200, 14, 180, 30, 8); x.fill(); x.fillStyle = '#fff'; x.font = '800 13px system-ui'; x.textAlign = 'left'; x.fillText((m.boss ? '👑 ' : '') + m.word, W - 192, 27); x.fillStyle = '#ffffff33'; x.fillRect(W - 192, 33, 164, 6); x.fillStyle = m.hp / m.max > .3 ? '#3ddc97' : '#ff6b8b'; x.fillRect(W - 192, 33, 164 * m.hp / m.max, 6);
        x.fillStyle = '#fff'; x.font = '700 12px system-ui'; x.textAlign = 'right'; x.fillText(`${wi + 1}/${mons.length}`, W - 14, 60); }
      if (dead > 0) { dead += .04; if (dead >= 1) { dead = 0; wi++; enter = 1; if (wi < mons.length) say('⚔', `다음! <b>${cur().word}</b> ${cur().boss ? '보스' : '몬스터'} 등장 <span class="dim">${cur().mean || ''}</span>`); } }
      /* 데미지 숫자·이펙트 */
      pops = pops.filter(p => p.l > 0); pops.forEach(p => { p.l -= .025; p.y -= 1; x.globalAlpha = Math.min(1, p.l * 2); x.fillStyle = p.c; x.font = `900 ${p.s}px system-ui`; x.textAlign = 'center'; x.fillText(p.txt, p.x, p.y); x.globalAlpha = 1; });
      if (flash > 0) { x.fillStyle = `rgba(255,60,90,${flash * .35})`; x.fillRect(-10, 0, W + 20, Hh); flash -= .05; }
      x.restore(); raf = requestAnimationFrame(frame); }
    raf = requestAnimationFrame(frame);
    const api = {
      hit(crit, combo) { const m = cur(); if (!m || dead) return; lunge = 1; setTimeout(() => { mhit = 1; m.hp = Math.max(0, m.hp - 1); const W = cv.width / Math.min(2, devicePixelRatio || 1); pops.push({ x: W - 110, y: 80, txt: crit ? `CRITICAL!` : `-${10 + (combo || 0) * 3}`, c: crit ? '#ffd23f' : '#fff', s: crit ? 24 : 20, l: 1 }); try { Sfx.play(crit ? 'stomp' : 'bonk'); } catch (e) { }
          if (m.hp <= 0) { dead = .01; try { Sfx.play('win'); } catch (e) { } SV.cards = SV.cards || {}; const ck = (opt.ps || '') + '|' + m.word; const nw = !SV.cards[ck]; SV.cards[ck] = m.mean || 1; save(); say('🃏', `<b>${m.word}</b> 처치! ${nw ? '새 단어 카드 획득' : '카드 강화'} <span class="dim">${m.mean || ''}</span>`); }
          else if (combo >= 2 || Math.random() < .5) { const c = H.party[Math.floor(Math.random() * H.party.length)]; if (CHEER[c]) say(CNAME[c], CHEER[c][Math.floor(Math.random() * 3)]); } }, 180); },
      hurt() { shake = 14; flash = 1; try { Sfx.play('hurt'); } catch (e) { } const c = H.party[Math.floor(Math.random() * H.party.length)]; if (OUCH[c]) say(CNAME[c], OUCH[c][Math.floor(Math.random() * 2)]); },
      killed() { return mons.filter(m => m.hp <= 0).length; }, count: mons.length,
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', fit); }
    };
    return api;
  }
  return { mount };
})();
