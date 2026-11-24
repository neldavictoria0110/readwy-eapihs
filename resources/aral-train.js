/* ARAL Program: a moving train inside the station frame, and one-step-at-a-time locking.
   - Weeks, platforms (sessions) and stops (activities) are tall train carriages pulled by a steam engine.
     The train faces right and rolls through the centre frame left to right: the engine comes in first,
     then carriage 1, 2, 3 … behind it, and they leave on the right, in a loop.
     It never stops, so the learner taps a carriage as it rolls by.
   - Each carriage carries its picture, number, title, progress and its own Continue / Review button,
     and is coloured with the colours of the picture it carries.
   - Weeks, platforms and stops open in order: the next one unlocks only when everything before it is finished.
     Finished items stay open for review. Locked carriages keep their colours under a LOCKED stamp.
     Teachers and the developer view are never locked.
   Loaded after the app's own scripts (see copy-index.cjs), so it wraps the final versions of the ARAL functions. */
(() => {
  if (typeof renderAralTaskMenu !== 'function' || typeof aralStation !== 'function') return;

  const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
  const currentUser = () => (typeof user !== 'undefined' && user) || null;
  const unlockedRole = () => {
    const u = currentUser();
    return !!(u && (u.role === 'teacher' || u.dev)) || safe(() => sessionStorage.getItem('readwy-dev-view') === '1', false);
  };
  const esc = s => (typeof h === 'function' ? h(s) : String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`));
  const reducedMotion = () => safe(() => matchMedia('(prefers-reduced-motion: reduce)').matches, false) ||
    document.documentElement.classList.contains('reduced-motion');

  /* ---------- progress and lock rules ---------- */
  const weeks = () => Object.keys(typeof ARAL_WEEKS !== 'undefined' ? ARAL_WEEKS : {}).map(Number).filter(w => w >= 1).sort((a, b) => a - b);
  const weekCounts = w => { const p = safe(() => aralWeekProgress(w), []); return {total: p.reduce((c, x) => c + x.total, 0), done: p.reduce((c, x) => c + x.done, 0)}; };
  function weekComplete(w) { const c = weekCounts(w); return c.total > 0 && c.done === c.total; }
  function weekLocked(w) {
    if (unlockedRole() || weekComplete(w)) return false;
    return weeks().filter(k => k < w).some(k => !weekComplete(k));
  }
  const sessionDone = s => { const p = aralSessionProgress(s); return p.total > 0 && p.done === p.total; };
  function sessionLocked(s) {
    if (unlockedRole() || sessionDone(s)) return false;
    if (weekLocked(aralView.week || 1)) return true;
    const keys = aralSessionKeys(aralView.week || 1);
    return keys.slice(0, keys.indexOf(s)).some(k => !sessionDone(k));
  }
  const submitted = (s, i) => !!safe(() => aralLessonState(s, i).submitted, false);
  function stopLocked(s, i) {
    if (unlockedRole() || submitted(s, i)) return false;
    if (sessionLocked(s)) return true;
    for (let j = 0; j < i; j++) if (!submitted(s, j)) return true;
    return false;
  }

  /* ---------- "this is locked" feedback ---------- */
  function say(text) {
    if (typeof aralNotice === 'function') aralNotice(text);
    const bubble = document.querySelector('.st-bubble');
    if (bubble) bubble.textContent = text;
  }
  window.aralTrainLocked = function (el) {
    say(el?.dataset?.lock || 'Finish the stop before this one first.');
    if (el && !reducedMotion()) { el.classList.remove('at-shake'); void el.offsetWidth; el.classList.add('at-shake'); }
  };
  const weekMsg = w => `🔒 Week ${w} opens after you finish every stop of Week ${weeks().filter(k => k < w).find(k => !weekComplete(k)) ?? w - 1}.`;
  const sessionMsg = s => { const keys = aralSessionKeys(aralView.week || 1), first = keys.find(k => k < s && !sessionDone(k)); return `🔒 Platform ${s} opens after you finish Platform ${first ?? s - 1}.`; };
  const stopMsg = (s, i) => { let j = 0; while (j < i && submitted(s, j)) j++; return `🔒 Finish Stop ${aralBoardTaskNumber(s, j)} first. Then Stop ${aralBoardTaskNumber(s, i)} opens.`; };

  /* ---------- carriage colours come from the picture the carriage carries ---------- */
  // Bright jewel tones that sit well on the dark-brown and gold train. Each carriage takes the jewel nearest
  // the hue of its picture, and no two carriages in one train share a colour.
  const JEWELS = [
    { h: 352, c: ['#ff4d6a', '#a3123a'] }, // ruby
    { h: 24, c: ['#ff8c2e', '#b8420a'] },  // tangerine
    { h: 46, c: ['#f7b500', '#9a5800'] },  // sunflower
    { h: 145, c: ['#2ed47f', '#0b7a45'] }, // emerald
    { h: 186, c: ['#1fc8dc', '#0a6f82'] }, // teal
    { h: 214, c: ['#3d8bff', '#1a43b0'] }, // sapphire
    { h: 268, c: ['#a463ff', '#5523b5'] }, // violet
    { h: 326, c: ['#ff4fae', '#a3166a'] }, // magenta
  ];
  let usedJewels = new Set();
  function hueOf(c) {
    let m = /^#([0-9a-f]{3,8})$/i.exec(c), r, g, b;
    if (m) { let x = m[1]; if (x.length < 6) x = [...x.slice(0, 3)].map(d => d + d).join(''); [r, g, b] = [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16) / 255); }
    else { m = String(c).match(/[d.]+/g); if (!m || m.length < 3) return null; [r, g, b] = m.slice(0, 3).map(v => +v / 255); }
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < .08) return null; // grey: no hue to follow
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }
  function pictureColours(url, k) {
    const svg = safe(() => decodeURIComponent(String(url).split(',').slice(1).join(',')), '');
    const hue = [...svg.matchAll(/stop-color="(#[0-9a-fA-F]{3,8}|rgb[^"]+)"/g)].map(m => hueOf(m[1])).find(x => x != null);
    const gap = j => hue == null ? ((j - k) % JEWELS.length + JEWELS.length) % JEWELS.length : Math.min(Math.abs(JEWELS[j].h - hue), 360 - Math.abs(JEWELS[j].h - hue));
    if (usedJewels.size >= JEWELS.length) usedJewels = new Set();
    const pick = JEWELS.map((_, j) => j).filter(j => !usedJewels.has(j)).sort((x, y) => gap(x) - gap(y))[0];
    usedJewels.add(pick);
    return JEWELS[pick].c;
  }

  /* ---------- the train ---------- */
  // Same locomotive as the Reading Express transition train (train-nav.js), in the ARAL brown and gold.
  const ENGINE = `<li class="at-engine" aria-hidden="true"><svg viewBox="0 0 110 78" preserveAspectRatio="xMidYMax meet"><defs><linearGradient id="atBoiler" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1d4a"/><stop offset=".18" stop-color="#6f93f0"/><stop offset=".35" stop-color="#2f56c8"/><stop offset=".8" stop-color="#17307a"/><stop offset="1" stop-color="#0a1638"/></linearGradient><linearGradient id="atCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0566e"/><stop offset=".3" stop-color="#b3263f"/><stop offset="1" stop-color="#5c0f1f"/></linearGradient><linearGradient id="atBr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e7ae"/><stop offset=".35" stop-color="#9a7428"/><stop offset=".6" stop-color="#f3dc98"/><stop offset="1" stop-color="#7a5a1f"/></linearGradient><radialGradient id="atLamp"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffd67a"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient><radialGradient id="atSteam"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#eef1f6" stop-opacity=".7"/><stop offset="1" stop-color="#dfe4ec" stop-opacity="0"/></radialGradient></defs>
<g class="at-steam">${[0, 1, 2, 3].map(k => `<circle cx="30" cy="10" r="6" fill="url(#atSteam)" style="animation-delay:${k * .4}s"/>`).join('')}</g>
<path d="M23 14h14l-2 18H25Z" fill="url(#atBoiler)"/><rect x="21" y="12" width="18" height="4" rx="1.5" fill="url(#atBr)"/><rect x="8" y="30" width="66" height="28" rx="13" fill="url(#atBoiler)"/><rect x="26" y="30" width="3" height="28" fill="url(#atBr)"/><rect x="48" y="30" width="3" height="28" fill="url(#atBr)"/><ellipse cx="44" cy="30" rx="7" ry="4" fill="url(#atBr)"/><rect x="68" y="16" width="38" height="44" rx="5" fill="url(#atCab)"/><rect x="64" y="12" width="46" height="6" rx="3" fill="#2a0a12"/><rect x="75" y="22" width="24" height="15" rx="2" fill="#ffe3a0" stroke="url(#atBr)" stroke-width="2"/><circle class="at-lamp" cx="5" cy="40" r="10" fill="url(#atLamp)"/><circle cx="7" cy="40" r="4" fill="url(#atBr)"/><path d="M8 54 L0 64 H16Z" fill="url(#atBr)"/>
<g class="at-wheel"><circle cx="26" cy="64" r="10" fill="#141418" stroke="url(#atBr)" stroke-width="2.5"/><path d="M26 54v20M16 64h20M19 57l14 14M33 57 19 71" stroke="#8a6a26" stroke-width="1.5"/><circle cx="26" cy="64" r="2.5" fill="url(#atBr)"/></g><g class="at-wheel"><circle cx="52" cy="64" r="10" fill="#141418" stroke="url(#atBr)" stroke-width="2.5"/><path d="M52 54v20M42 64h20M45 57l14 14M59 57 45 71" stroke="#8a6a26" stroke-width="1.5"/><circle cx="52" cy="64" r="2.5" fill="url(#atBr)"/></g><g class="at-wheel"><circle cx="88" cy="66" r="8" fill="#141418" stroke="url(#atBr)" stroke-width="2.5"/><path d="M88 58v16M80 66h16" stroke="#8a6a26" stroke-width="1.5"/><circle cx="88" cy="66" r="2" fill="url(#atBr)"/></g><rect x="24" y="62" width="30" height="3" rx="1.5" fill="url(#atBr)"/></svg></li>`;

  // item: {plate, small, title, lines[], img, state, action, lock, go, label}
  function carHTML(it, k) {
    const [c1, c2] = pictureColours(it.img, k);
    const locked = it.state === 'locked';
    return `<li class="at-car ${it.state}" style="--c1:${c1};--c2:${c2}">` +
      `<button type="button" onclick="${locked ? 'aralTrainLocked(this)' : it.action}" aria-label="${esc(it.label + (locked ? ' (locked)' : ''))}"${locked ? ` aria-disabled="true" data-lock="${esc(it.lock)}"` : ''}>` +
      `<span class="at-roof" aria-hidden="true"></span>` +
      `<span class="at-body"><span class="at-plate">${esc(it.plate)}</span>` +
      `<span class="at-window"><img src="${it.img}" alt="" draggable="false"></span>` +
      (it.small ? `<small class="at-small">${esc(it.small)}</small>` : '') +
      `<b class="at-title">${esc(it.title)}</b>` +
      (it.lines || []).filter(Boolean).map(l => `<span class="at-line">${esc(l)}</span>`).join('') +
      `<span class="at-go">${locked ? '🔒 Locked' : it.go}</span></span>` +
      `<span class="at-wheels" aria-hidden="true"><i></i><i></i></span>` +
      (it.state === 'done' ? '<span class="at-stamp done" aria-hidden="true">Arrived</span>' : '') +
      (locked ? `<span class="at-seal" aria-hidden="true"><small>${esc(it.plate)}</small><b>LOCKED</b><small>★ READwy ★</small></span>` : '') +
      `</button></li>`;
  }
  function trainBoard(items) {
    const focus = Math.max(0, items.findIndex(it => it.state === 'next'));
    usedJewels = new Set();
    return `<div class="at-view" data-focus="${focus}"><ol class="at-loop"><li class="at-set"><ol class="at-cars">${items.map(carHTML).reverse().join('')}${ENGINE}</ol></li></ol>` +
      `<div class="at-track" aria-hidden="true"></div></div>`;
  }

  // Like the Reading Express between pages: the engine rolls in from the left and slows to a stop,
  // pauses with steam puffing, then pulls away and every carriage passes before the train leaves on the right.
  let trainRAF = 0;
  // The Reading Express transition tells this page it is still sliding in ('moving') and when it has arrived.
  let rwMovingAt = -1e9;
  if (typeof addEventListener === 'function') addEventListener('message', e => { const d = e.data; if (d && d.rw === 'moving') rwMovingAt = performance.now(); else if (d && d.rw === 'arrived') rwMovingAt = -1e9; });
  const offstage = () => safe(() => {
    if (performance.now() - rwMovingAt < 400) return true;
    if (document.hidden || document.documentElement.classList.contains('program-loading')) return true;
    const fr = window.frameElement; // inside the transition's page frame: wait until that frame is the live page
    return !!(fr && fr.classList.contains('rw-frame') && !fr.classList.contains('active'));
  }, false);
  function startTrain() {
    cancelAnimationFrame(trainRAF);
    const view = document.querySelector('.at-view'); if (!view) return;
    const loop = view.querySelector('.at-loop');
    loop.querySelectorAll('.at-set.at-copy').forEach(n => n.remove());
    const trainW = loop.getBoundingClientRect().width, viewW = view.clientWidth;
    if (!trainW || !viewW) return;
    const cruise = Math.max(45, viewW / 14);     // steady speed: about 14 seconds to cross the frame
    const stopX = viewW * 0.62 - trainW;         // engine front pauses a little past the middle
    const BRAKE = 2, PAUSE = 1.2, SPEEDUP = 2, GAP = .8; // seconds
    const rampDist = cruise * BRAKE / 2;         // distance used to ease to a stop / back up to speed
    const inTime = Math.max(0, (stopX + trainW - rampDist) / cruise); // slow roll in from the left edge
    const outTime = Math.max(0, (viewW - stopX - rampDist) / cruise); // slow roll out to the right
    const lap = inTime + BRAKE + PAUSE + SPEEDUP + outTime + GAP;
    const at = t => {
      if (t < inTime) return [-trainW + cruise * t, true];
      t -= inTime; if (t < BRAKE) return [stopX - rampDist + cruise * t - cruise * t * t / (2 * BRAKE), true];
      t -= BRAKE; if (t < PAUSE) return [stopX, false];
      t -= PAUSE; if (t < SPEEDUP) return [stopX + cruise * t * t / (2 * SPEEDUP), true];
      t -= SPEEDUP; if (t < outTime) return [stopX + rampDist + cruise * t, true];
      return [viewW + 10, false];
    };
    loop.classList.add('at-run');
    let t0 = 0, moving = null;
    const step = now => {
      if (!loop.isConnected) return;
      // Wait off-screen (left) until the learner can actually see this page: it is loaded hidden behind
      // the Reading Express transition, so the train must not start rolling before it arrives.
      if (offstage()) { t0 = 0; loop.style.transform = 'translate3d(' + (-trainW - 20) + 'px,0,0)'; if (moving !== false) { moving = false; loop.classList.remove('at-moving'); } trainRAF = requestAnimationFrame(step); return; }
      if (!t0) t0 = now;
      const [x, m] = at(((now - t0) / 1000) % lap);
      loop.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      if (m !== moving) { moving = m; loop.classList.toggle('at-moving', m); }
      trainRAF = requestAnimationFrame(step);
    };
    trainRAF = requestAnimationFrame(step);
  }
  let observer = null;
  function afterRender() {
    requestAnimationFrame(() => {
      startTrain();
      const view = document.querySelector('.at-view');
      if (!view || typeof ResizeObserver === 'undefined') return;
      observer?.disconnect();
      let lastW = view.clientWidth, timer = 0;
      observer = new ResizeObserver(() => { if (Math.abs(view.clientWidth - lastW) < 2) return; lastW = view.clientWidth; clearTimeout(timer); timer = setTimeout(startTrain, 120); });
      observer.observe(view);
    });
  }
  const goText = (state, started) => state === 'done' ? '✓ Review' : state === 'locked' ? '🔒 Locked' : started ? '▶ Continue' : state === 'next' ? '▶ Board now' : '★ Start';

  /* ---------- page 1: the eight weeks ---------- */
  renderAral = renderAralStart = function () {
    setOwl('work'); nav.innerHTML = '';
    const ws = weeks(), counts = ws.map(weekCounts), done = counts.map(c => c.total > 0 && c.done === c.total), next = done.indexOf(false);
    const items = ws.map((w, k) => {
      const W = ARAL_WEEKS[w], state = done[k] ? 'done' : weekLocked(w) ? 'locked' : k === next ? 'next' : 'todo';
      return {plate: `WEEK ${w}`, title: W.title, lines: [`${aralSessionKeys(w).length} sessions`, `${counts[k].done} of ${counts[k].total} stops`],
        img: safe(() => aralScene(ARAL_SCENE.week[k]), ''), state, action: `aralWeek(${w})`, lock: weekMsg(w),
        go: goText(state, counts[k].done > 0), label: `Week ${w}: ${W.title}`};
    });
    const all = counts.reduce((a, c) => a + c.done, 0);
    app.innerHTML = aralStation({label: 'Reading Express · ARAL Program', title: '8-Week Learning Journey', sub: 'Every week is a new station. Every activity is a stop.',
      say: all ? `Welcome back, reader! You have cleared ${all} stops so far. Week ${next < 0 ? ws[ws.length - 1] : ws[next]} is waiting for you!` : 'Hello, reader! I’m Tala. Each week is a carriage on our reading train. Let’s board Week 1!',
      plate: true, back: "go('map')", board: aralRail(done, ws.length, 'weeks completed') + trainBoard(items)});
    afterRender();
    setTimeout(() => safe(() => readwyOwlAuto('aral')), 900);
  };

  /* ---------- page 2: a week's platforms (sessions) ---------- */
  renderAralWeek = function () {
    setOwl('work'); nav.innerHTML = '';
    const w = aralView.week || 1, W = ARAL_WEEKS[w], keys = aralSessionKeys(w), prog = keys.map(aralSessionProgress),
      done = prog.map(p => p.total > 0 && p.done === p.total), next = done.indexOf(false);
    const items = keys.map((s, k) => {
      const state = done[k] ? 'done' : sessionLocked(s) ? 'locked' : k === next ? 'next' : 'todo';
      const img = safe(() => w === 1 ? aralScene(ARAL_SCENE.session[s]) : aralStopURL(s, 0, W.sessions[s].activities[0]), '');
      return {plate: `PLATFORM ${s}`, small: `Session ${s}`, title: W.sessions[s].title, lines: [`${prog[k].done} of ${prog[k].total} stops`],
        img, state, action: `aralOpenSession(${s})`, lock: sessionMsg(s), go: goText(state, prog[k].done > 0), label: `Platform ${s}: ${W.sessions[s].title}`};
    });
    const total = prog.reduce((c, p) => c + p.done, 0), nx = next < 0 ? keys[0] : keys[next];
    app.innerHTML = aralStation({label: `Week ${w} Station`, title: esc(W.title), sub: `${keys.length} platforms · one session each`,
      say: next < 0 ? `Amazing! You finished every session of Week ${w}!` : total ? `Nice riding! Platform ${nx} is waiting for you.` : `Week ${w} has ${keys.length} platforms. Start at Platform ${keys[0]}, ${W.sessions[keys[0]].title}!`,
      back: 'aralShow(1)', board: aralRail(done, keys.length, 'sessions completed') + trainBoard(items)});
    afterRender();
  };

  /* ---------- page 3: a platform's stops (activities) ---------- */
  renderAralTaskMenu = function () {
    const s = aralTaskMenu.session || 1, week = aralW()[s], acts = week.activities, n = acts.length;
    setOwl('work'); nav.innerHTML = '';
    const done = acts.map((_, i) => submitted(s, i)), count = done.filter(Boolean).length, next = done.indexOf(false), all = count === n;
    const items = acts.map((a, i) => {
      const num = aralBoardTaskNumber(s, i), state = done[i] ? 'done' : i === next && !stopLocked(s, i) ? 'next' : stopLocked(s, i) ? 'locked' : 'todo';
      return {plate: `STOP ${num}`, small: `Activity ${num}`, title: a.title, lines: [safe(() => aralDoes(a), []).slice(0, 3).join(' · ')],
        img: safe(() => aralStopURL(s, i, a), ''), state, action: `aralBoardOpenTask(${s},${i})`, lock: stopMsg(s, i),
        go: goText(state, false), label: `Stop ${num}: ${a.title}`};
    });
    const msg = all ? `Hooray! You cleared all ${n} stops of Platform ${s}. Tap any carriage to look back.`
      : count ? `Great riding! ${n - count} stop${n - count === 1 ? '' : 's'} left. Board Stop ${aralBoardTaskNumber(s, next)} next.`
      : `All aboard! Platform ${s} has ${n} carriages. Start with Stop ${aralBoardTaskNumber(s, 0)}. Each carriage opens after you finish the one before it.`;
    app.innerHTML = aralStation({label: `Platform ${s} · Week ${aralView.week || 1} · Session ${s}`, title: esc(week.title),
      sub: `${week.pages ? `Workbook pages ${esc(week.pages)} · ` : ''}${n} stops`, say: msg, back: 'aralShow(6)',
      board: aralRail(done, n, 'stops cleared') + trainBoard(items)});
    afterRender();
  };

  /* ---------- guards: every way into a week, platform or stop checks the lock ---------- */
  { const original = aralWeek; aralWeek = function (w) {
    if (weekLocked(Number(w))) return say(weekMsg(Number(w)));
    return original.apply(this, arguments);
  }; }
  { const original = aralOpenSession; aralOpenSession = function (s) {
    if (sessionLocked(Number(s))) return say(sessionMsg(Number(s)));
    return original.apply(this, arguments);
  }; }
  { const original = aralBoardOpenTask; aralBoardOpenTask = function (s, i) {
    if (stopLocked(Number(s), Number(i))) return say(stopMsg(Number(s), Number(i)));
    return original.apply(this, arguments);
  }; }
  if (typeof aralLessonSwitch === 'function') { const original = aralLessonSwitch; aralLessonSwitch = function (i) {
    const s = aralLessonView.session;
    if (stopLocked(Number(s), Number(i))) return say(stopMsg(Number(s), Number(i)));
    return original.apply(this, arguments);
  }; }
  if (typeof aralOpenTask === 'function') { const original = aralOpenTask; aralOpenTask = function (i) {
    if ((aralView.week || 1) === 1 && stopLocked(1, Number(i))) return say(stopMsg(1, Number(i)));
    return original.apply(this, arguments);
  }; }

  /* ---------- look ---------- */
  const css = document.createElement('style');
  css.dataset.source = 'resources/aral-train.js';
  css.textContent = `
/* the old train that crossed the bottom of the station is replaced by the train in the frame */
.st-screen .st-track,.st-screen .st-train-lane{display:none!important}
.at-view{position:relative;flex:1;min-height:max(300px,46cqh);overflow:hidden;margin:1cqh -1.6cqw 0;padding:0;
 background:linear-gradient(#0000 0,#0000 86%,#1b120a 86%,#120c06 100%);mask-image:linear-gradient(90deg,#0000,#000 4%,#000 96%,#0000);-webkit-mask-image:linear-gradient(90deg,#0000,#000 4%,#000 96%,#0000)}
.at-track{position:absolute;left:0;right:0;bottom:4.2%;height:1.4cqh;pointer-events:none;
 background:linear-gradient(#b9a37f,#6d5a40) top/100% 30% no-repeat,repeating-linear-gradient(90deg,#4a3420 0 1.6cqw,#0000 1.6cqw 3.4cqw) bottom/100% 70% no-repeat}
.at-loop{position:absolute;z-index:1;inset:0 auto calc(4.2% + 1.1cqh) 0;display:flex;margin:0;padding:0;list-style:none;width:max-content;will-change:transform;transform:translateX(-100%)}
.at-set{display:flex;height:100%}
.at-cars{display:flex;align-items:flex-end;gap:1.2cqw;height:100%;margin:0;padding:1.4cqh 1.2cqw 0;list-style:none}
.at-engine{flex:0 0 auto;width:clamp(210px,21cqw,350px);filter:drop-shadow(0 0 .6cqw #ffd76a99) drop-shadow(0 .6cqh .8cqh #000a);aspect-ratio:110/78;position:relative;margin-left:-.6cqw}
.at-engine svg{width:100%;height:100%;overflow:visible;display:block;transform:scaleX(-1)}
.at-car{position:relative;flex:0 0 auto;height:100%;width:clamp(190px,18.5cqw,320px);display:flex}
.at-car::after{content:'';position:absolute;right:-1.3cqw;bottom:7%;width:1.4cqw;height:1cqh;border-radius:.4cqh;background:linear-gradient(#5b5b60,#1d1d20);box-shadow:0 0 0 .12cqh #c9973f}
.at-car>button{position:relative;appearance:none;border:0;background:none;padding:0;margin:0;cursor:pointer;flex:1;min-width:0;display:flex;flex-direction:column;color:#fff;font:inherit;text-align:center;
 filter:drop-shadow(0 .9cqh 1.1cqh #000b);transition:transform .2s ease,filter .2s ease}
.at-car>button:hover,.at-car>button:focus-visible{transform:translateY(-.8cqh)}
.at-car>button:focus-visible{outline:.25cqw solid #ffd76a;outline-offset:.4cqw;border-radius:1cqw}
.at-roof{flex:0 0 auto;height:2.2cqh;margin:0 6%;border-radius:1.6cqw 1.6cqw 0 0;background:linear-gradient(#6a5444,#241810);box-shadow:inset 0 .3cqh 0 #ffffff22}
.at-body{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;gap:.9cqh;padding:1.4cqh 1cqw 0;border-radius:.9cqw;overflow:hidden;
 background:linear-gradient(160deg,var(--c1) 0%,var(--c2) 100%);border:.25cqw solid #e0b25a;box-shadow:inset 0 -1.4cqh 0 #00000038,inset 0 .35cqh 0 #ffffff55,inset 0 0 2cqw #0000002a}
.at-body::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,#ffffff0d 0 .5cqw,#0000 .5cqw 3cqw);pointer-events:none}
.at-plate{position:relative;font:900 clamp(11px,1.15cqw,19px)/1.2 Cinzel,Georgia,serif;letter-spacing:.12em;padding:.2em .9em;border-radius:999px;background:#1d1408;color:#ffd76a;border:.12cqw solid #e0b25a;box-shadow:0 .2cqh .5cqh #0006}
.at-window{position:relative;flex:0 1 auto;width:100%;aspect-ratio:5/3;max-height:34%;min-height:0;border-radius:.8cqw;overflow:hidden;border:.25cqw solid #e0b25a;box-shadow:inset 0 0 1cqw #0008,0 .3cqh .6cqh #0005;background:#0003}
.at-window img{width:100%;height:100%;object-fit:cover;display:block}
.at-small{position:relative;font:800 clamp(10px,.9cqw,14px)/1.1 system-ui,'Segoe UI',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff3c9;opacity:.95}
.at-title{position:relative;font:800 clamp(13px,1.35cqw,22px)/1.2 system-ui,'Segoe UI',sans-serif;text-shadow:0 .1em .25em #000b;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.at-line{position:relative;font:700 clamp(11px,.95cqw,15px)/1.25 system-ui,sans-serif;padding:.15em .7em;border-radius:999px;background:#00000038;text-shadow:0 1px 2px #0008}
.at-go{position:relative;margin-top:auto;margin-bottom:2.6cqh;padding:.35em 1.1em;border-radius:999px;background:#fffaf0;color:#2b1a0b;font:900 clamp(12px,1.1cqw,17px)/1.2 system-ui,sans-serif;box-shadow:0 .3cqh .6cqh #0006}
.at-wheels{flex:0 0 auto;display:flex;justify-content:space-between;padding:0 12%;margin-top:-1.6cqh;height:3.6cqh;position:relative;z-index:1}
.at-wheels i{height:100%;aspect-ratio:1;border-radius:50%;border:.28cqh solid #c9973f;background:radial-gradient(circle,#e8c879 0 18%,transparent 20%),repeating-conic-gradient(#d9b25a 0 8deg,#151518 8deg 45deg)}
.at-loop.at-moving .at-wheels i,.at-loop.at-moving .at-wheel{animation:atSpin 1.6s linear infinite}
@keyframes atSpin{to{rotate:360deg}}
.at-wheel{transform-box:fill-box;transform-origin:center}
.at-loop.at-moving .at-engine .at-wheel{animation-direction:reverse} /* the engine drawing is mirrored */
.at-steam circle{animation:atPuff 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes atPuff{0%{transform:translate(0,0) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(16px,-26px) scale(2.2);opacity:0}}
.at-car.next>button{animation:atGlow 1.8s ease-in-out infinite}
.at-car.next .at-go{background:linear-gradient(#ffd76a,#f5a623)}
.at-car.done .at-go{background:#dff5e6;color:#14623d}
.at-car.locked>button{cursor:not-allowed}
.at-car.locked .at-go{background:#3a2a1c;color:#ffd9c9}
.at-stamp{position:absolute;z-index:3;left:50%;top:44%;translate:-50% -50%;rotate:-13deg;padding:.2em .6em;border:.2em double currentColor;border-radius:.4em;background:#fff6e8e0;font:900 clamp(13px,1.45cqw,24px)/1 'Courier New',Courier,monospace;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;pointer-events:none;box-shadow:0 .2cqh .6cqh #0005}
/* round rubber stamp, same shape as the PLATFORM 7½ stamp on the journey ticket */
.at-seal{position:absolute;z-index:3;left:50%;top:74%;translate:-50% -50%;rotate:-16deg;display:grid;place-items:center;align-content:center;gap:.25em;width:clamp(92px,10cqw,150px);aspect-ratio:1;border-radius:50%;border:.18em solid currentColor;outline:.1em solid currentColor;outline-offset:-.42em;box-shadow:0 0 .4em #0006,inset 0 0 .4em #0006;background:transparent;color:#fff4d6;text-shadow:0 .08em .18em #000a;font:900 clamp(11px,1.05cqw,17px)/1 'Courier New',Courier,monospace;text-align:center;text-transform:uppercase;pointer-events:none}
.at-seal small{font-size:.72em;letter-spacing:.08em;max-width:80%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-seal b{font-size:1.32em;letter-spacing:.1em;padding:.14em 0;border-top:.12em solid currentColor;border-bottom:.12em solid currentColor}
.at-stamp.done{color:#1f8f57;top:30%}
.at-shake{animation:atShake .45s ease both!important}
@keyframes atGlow{0%,100%{filter:drop-shadow(0 0 .2cqw #ffd76a) drop-shadow(0 .9cqh 1.1cqh #000b)}50%{filter:drop-shadow(0 0 1.4cqw #ffcf4d) drop-shadow(0 .9cqh 1.1cqh #000b)}}
@keyframes atShake{0%,100%{translate:0}20%{translate:-.8cqw}40%{translate:.8cqw}60%{translate:-.5cqw}80%{translate:.5cqw}}
@media (max-width:760px){.at-car{width:clamp(170px,46vw,240px)}}
/* The train always rolls, even while the app briefly switches on reduced motion during page loading. */
.at-loop.at-moving .at-wheels i,.at-loop.at-moving .at-wheel{animation-play-state:running!important}`;
  document.head.append(css);

  // If the learner is already on an ARAL page when this loads, redraw it with the new look and locks.
  safe(() => { if (typeof activeModule !== 'undefined' && activeModule === 'aral' && document.querySelector('.st-screen') && typeof renderAral === 'function') renderAral(); });
  // On slow phones the ARAL page can draw before every helper script has loaded; redraw once the page is fully loaded.
  if (typeof addEventListener === 'function') addEventListener('load', () => safe(() => { if (typeof activeModule !== 'undefined' && activeModule === 'aral' && typeof renderAral === 'function') renderAral(); }));
})();
