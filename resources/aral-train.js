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
  const FALLBACK = [['#e0475b', '#9c1c33'], ['#2fbf7a', '#14704a'], ['#4a86e8', '#1d4597'], ['#f2a23a', '#b5600c'], ['#9b6be0', '#5a2f9c'], ['#2bb3c4', '#11707e'], ['#d8a93c', '#8a6114']];
  function pictureColours(url, k) {
    const svg = safe(() => decodeURIComponent(String(url).split(',').slice(1).join(',')), '');
    const stops = [...svg.matchAll(/stop-color="(#[0-9a-fA-F]{3,8}|rgb[^"]+)"/g)].map(m => m[1]);
    return stops.length >= 2 ? [stops[0], stops[1]] : FALLBACK[k % FALLBACK.length];
  }

  /* ---------- the train ---------- */
  const ENGINE = `<li class="at-engine" aria-hidden="true"><svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMax meet">
<defs><linearGradient id="atBoiler" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a30"/><stop offset=".3" stop-color="#3e2614"/><stop offset=".75" stop-color="#22140a"/><stop offset="1" stop-color="#3a2414"/></linearGradient>
<linearGradient id="atGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".5" stop-color="#d9a233"/><stop offset="1" stop-color="#7a4a0c"/></linearGradient>
<linearGradient id="atCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a2433"/><stop offset="1" stop-color="#4a0f1a"/></linearGradient>
<radialGradient id="atGlow"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffd76a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb02e" stop-opacity="0"/></radialGradient>
<radialGradient id="atSteam"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#eef1f6" stop-opacity=".7"/><stop offset="1" stop-color="#dfe4ec" stop-opacity="0"/></radialGradient>
<clipPath id="atCabWin"><rect x="196" y="112" width="70" height="62" rx="9"/></clipPath></defs>
<g class="at-steam">${[0, 1, 2, 3].map(k => `<circle cx="78" cy="84" r="20" fill="url(#atSteam)" style="animation-delay:${k * .4}s"/>`).join('')}</g>
<rect x="62" y="90" width="32" height="62" fill="url(#atBoiler)"/><rect x="54" y="82" width="48" height="14" rx="5" fill="url(#atGold)"/>
<rect x="18" y="150" width="172" height="86" rx="40" fill="url(#atBoiler)"/>${[60, 110, 160].map(x => `<rect x="${x}" y="148" width="9" height="90" rx="3" fill="url(#atGold)"/>`).join('')}
<path d="M120 150q20-36 40 0z" fill="url(#atGold)"/>
<circle cx="22" cy="192" r="34" fill="#1a1a1e" stroke="url(#atGold)" stroke-width="5"/><circle cx="22" cy="192" r="13" fill="url(#atGold)"/>
<circle cx="10" cy="146" r="10" fill="#fff6d0" stroke="url(#atGold)" stroke-width="3"/><circle class="at-lamp" cx="4" cy="146" r="28" fill="url(#atGlow)"/>
<rect x="184" y="92" width="108" height="150" rx="8" fill="url(#atCab)" stroke="#1e1008" stroke-width="3"/><rect x="176" y="82" width="124" height="16" rx="6" fill="#1c1410"/>
<rect x="196" y="112" width="70" height="62" rx="9" fill="#2a1a10"/><g clip-path="url(#atCabWin)"><svg x="192" y="104" width="78" height="84" viewBox="120 0 280 290" preserveAspectRatio="xMidYMin slice"><image href="${typeof ARAL_STATION_IMG !== 'undefined' ? ARAL_STATION_IMG : 'resources/aral/station/'}conductor-full.webp" width="411" height="603"/></svg></g>
<rect x="196" y="112" width="70" height="62" rx="9" fill="none" stroke="#e0b25a" stroke-width="4"/><rect x="190" y="206" width="96" height="6" fill="#e0b25a"/>
<path d="M4 238h288" stroke="#1d1410" stroke-width="10"/><path d="M-4 236l22-20h10l-12 20z" fill="#7a1220" stroke="#e0b25a" stroke-width="2"/>
<g class="at-wheel" style="transform-origin:78px 258px"><circle cx="78" cy="258" r="34" fill="#151518" stroke="#c9973f" stroke-width="4"/>${[0, 45, 90, 135].map(a => `<path d="M78 228v60" stroke="#d9b25a" stroke-width="4" transform="rotate(${a} 78 258)"/>`).join('')}<circle cx="78" cy="258" r="9" fill="#e8c879"/></g>
<g class="at-wheel" style="transform-origin:156px 258px"><circle cx="156" cy="258" r="34" fill="#151518" stroke="#c9973f" stroke-width="4"/>${[0, 45, 90, 135].map(a => `<path d="M156 228v60" stroke="#d9b25a" stroke-width="4" transform="rotate(${a} 156 258)"/>`).join('')}<circle cx="156" cy="258" r="9" fill="#e8c879"/></g>
<g class="at-wheel" style="transform-origin:238px 268px"><circle cx="238" cy="268" r="24" fill="#151518" stroke="#c9973f" stroke-width="4"/>${[0, 60, 120].map(a => `<path d="M238 246v44" stroke="#d9b25a" stroke-width="3" transform="rotate(${a} 238 268)"/>`).join('')}<circle cx="238" cy="268" r="7" fill="#e8c879"/></g>
<rect x="70" y="252" width="92" height="10" rx="4" fill="url(#atGold)"/></svg></li>`;

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
      (locked ? '<span class="at-stamp lock" aria-hidden="true">Locked</span>' : '') +
      `</button></li>`;
  }
  function trainBoard(items) {
    const focus = Math.max(0, items.findIndex(it => it.state === 'next'));
    return `<div class="at-view" data-focus="${focus}"><ol class="at-loop"><li class="at-set"><ol class="at-cars">${items.map(carHTML).reverse().join('')}${ENGINE}</ol></li></ol>` +
      `<div class="at-track" aria-hidden="true"></div></div>`;
  }

  // Make the loop seamless: repeat the carriage set until it fills the frame, then roll one set-width per cycle.
  function startTrain() {
    const view = document.querySelector('.at-view'); if (!view) return;
    const loop = view.querySelector('.at-loop'), first = loop.querySelector('.at-set');
    loop.querySelectorAll('.at-set.at-copy').forEach(n => n.remove());
    const setW = first.getBoundingClientRect().width, viewW = view.clientWidth;
    if (!setW || !viewW) return;
        const copies = Math.ceil(viewW / setW) + 1;
    for (let c = 0; c < copies; c++) {
      const copy = first.cloneNode(true);
      copy.classList.add('at-copy'); copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
      copy.querySelectorAll('button').forEach(b => b.tabIndex = -1);
      loop.append(copy);
    }
    const speed = Math.max(40, viewW / 14); // px per second: a carriage crosses the frame in about 14 seconds
    const dur = setW / speed;
    // Start with the learner's next carriage in the middle of the frame.
    const cars = first.querySelectorAll('.at-car'), target = cars[cars.length - 1 - (Number(view.dataset.focus) || 0)]; // carriages are drawn last-to-first
    let offset = target ? target.offsetLeft + target.offsetWidth / 2 - viewW / 2 : 0;
    offset = ((offset % setW) + setW) % setW;
    loop.style.setProperty('--shift', setW + 'px');
    loop.style.setProperty('--dur', dur.toFixed(2) + 's');
    // the loop runs from translateX(-setW) to 0, so the target is centred at t = (setW - offset) / setW of a cycle
    loop.style.animationDelay = (-((setW - offset) / setW) * dur).toFixed(2) + 's';
    loop.classList.remove('at-run'); void loop.offsetWidth; loop.classList.add('at-run');
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
  renderAralStart = function () {
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
.at-loop{position:absolute;inset:0 auto 0 0;display:flex;margin:0;padding:0;list-style:none;width:max-content;will-change:transform}
.at-loop.at-run{animation:atRoll var(--dur,40s) linear infinite}
.at-set{display:flex;height:100%}
.at-cars{display:flex;align-items:flex-end;gap:1.2cqw;height:100%;margin:0;padding:1.4cqh 1.2cqw 4.6%;list-style:none}
@keyframes atRoll{from{transform:translateX(calc(-1 * var(--shift,0px)))}to{transform:translateX(0)}}
.at-engine{flex:0 0 auto;height:72%;aspect-ratio:1;position:relative}
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
.at-loop.at-run .at-wheels i,.at-loop.at-run .at-wheel{animation:atSpin 1.1s linear infinite}
@keyframes atSpin{to{rotate:360deg}}
.at-loop.at-run .at-engine .at-wheel{animation-direction:reverse} /* the engine drawing is mirrored */
.at-steam circle{animation:atPuff 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes atPuff{0%{transform:translate(0,0) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(40px,-70px) scale(1.6);opacity:0}}
.at-car.next>button{animation:atGlow 1.8s ease-in-out infinite}
.at-car.next .at-go{background:linear-gradient(#ffd76a,#f5a623)}
.at-car.done .at-go{background:#dff5e6;color:#14623d}
.at-car.locked>button{cursor:not-allowed}
.at-car.locked .at-go{background:#3a2a1c;color:#ffd9c9}
.at-stamp{position:absolute;z-index:3;left:50%;top:44%;translate:-50% -50%;rotate:-13deg;padding:.2em .6em;border:.2em double currentColor;border-radius:.4em;background:#fff6e8e0;font:900 clamp(13px,1.45cqw,24px)/1 'Courier New',Courier,monospace;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;pointer-events:none;box-shadow:0 .2cqh .6cqh #0005}
.at-stamp.lock{color:#b3261e}
.at-stamp.done{color:#1f8f57;top:30%}
.at-shake{animation:atShake .45s ease both!important}
@keyframes atGlow{0%,100%{filter:drop-shadow(0 0 .2cqw #ffd76a) drop-shadow(0 .9cqh 1.1cqh #000b)}50%{filter:drop-shadow(0 0 1.4cqw #ffcf4d) drop-shadow(0 .9cqh 1.1cqh #000b)}}
@keyframes atShake{0%,100%{translate:0}20%{translate:-.8cqw}40%{translate:.8cqw}60%{translate:-.5cqw}80%{translate:.5cqw}}
@media (max-width:760px){.at-car{width:clamp(170px,46vw,240px)}}
/* The train always rolls, even while the app briefly switches on reduced motion during page loading. */
.at-loop.at-run{animation-play-state:running!important}`;
  document.head.append(css);

  // If the learner is already on an ARAL page when this loads, redraw it with the new look and locks.
  safe(() => { if (typeof activeModule !== 'undefined' && activeModule === 'aral' && document.querySelector('.st-screen') && typeof renderAral === 'function') renderAral(); });
})();
