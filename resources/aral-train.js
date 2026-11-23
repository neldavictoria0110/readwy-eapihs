/* ARAL Program: stops shown as a train, and one-step-at-a-time locking.
   - A platform's stops (activities) are drawn as train carriages, one colour per stop, each with its activity title.
   - Weeks, platforms and stops open in order: the next one unlocks only when everything before it is finished.
     Finished items stay open for review. Teachers and the developer view are never locked.
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

  /* ---------- progress and lock rules ---------- */
  const weeks = () => Object.keys(typeof ARAL_WEEKS !== 'undefined' ? ARAL_WEEKS : {}).map(Number).filter(w => w >= 1).sort((a, b) => a - b);
  function weekComplete(w) {
    const p = safe(() => aralWeekProgress(w), []);
    const total = p.reduce((c, x) => c + x.total, 0), done = p.reduce((c, x) => c + x.done, 0);
    return total > 0 && done === total;
  }
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
    if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.remove('at-shake'); void el.offsetWidth; el.classList.add('at-shake');
    }
  };
  const weekMsg = w => `🔒 Week ${w} opens after you finish every stop of Week ${weeks().filter(k => k < w).find(k => !weekComplete(k)) ?? w - 1}.`;
  const sessionMsg = s => { const keys = aralSessionKeys(aralView.week || 1), first = keys.find(k => k < s && !sessionDone(k)); return `🔒 Platform ${s} opens after you finish Platform ${first ?? s - 1}.`; };
  const stopMsg = (s, i) => { let j = 0; while (j < i && submitted(s, j)) j++; return `🔒 Finish Stop ${aralBoardTaskNumber(s, j)} first. Then Stop ${aralBoardTaskNumber(s, i)} opens.`; };

  /* ---------- the stops page: a train of carriages ---------- */
  const CARS = [
    ['ruby', '#b3243a'], ['emerald', '#1f8f57'], ['sapphire', '#2a5db0'],
    ['amber', '#d9780f'], ['amethyst', '#7a48b0'], ['diamond', '#178a9e'], ['gold', '#a8741c']
  ];
  function carHTML(s, i, a, state) {
    const num = aralBoardTaskNumber(s, i), [name, colour] = CARS[i % CARS.length];
    const does = safe(() => aralDoes(a), []).slice(0, 2).join(' · ');
    const go = state === 'done' ? '✓ Review' : state === 'next' ? '▶ Board now' : state === 'locked' ? '🔒 Locked' : '★ Start';
    const click = state === 'locked' ? 'aralTrainLocked(this)' : `aralBoardOpenTask(${s},${i})`;
    const label = state === 'locked' ? `Stop ${num}: ${a.title} (locked)` : `${state === 'done' ? 'Review' : 'Start'} Stop ${num}: ${a.title}`;
    return `<li class="at-car ${state}" style="--i:${i};--car:${colour}" data-car="${name}">` +
      `<button type="button" onclick="${click}" aria-label="${esc(label)}"${state === 'locked' ? ` aria-disabled="true" data-lock="${esc(stopMsg(s, i))}"` : ''}>` +
      `<span class="at-roof" aria-hidden="true"></span>` +
      `<span class="at-body"><span class="at-plate">STOP ${num}</span>` +
      `<span class="at-windows" aria-hidden="true"><i></i><i></i><i></i></span>` +
      `<b class="at-title">${esc(a.title)}</b>${does ? `<span class="at-does">${does}</span>` : ''}` +
      `<span class="at-go">${go}</span></span>` +
      `<span class="at-wheels" aria-hidden="true"><i></i><i></i><i></i><i></i></span>` +
      (state === 'done' ? '<span class="at-stamp done" aria-hidden="true">Arrived</span>' : '') +
      (state === 'locked' ? '<span class="at-stamp lock" aria-hidden="true">Locked</span>' : '') +
      `</button></li>`;
  }
  renderAralTaskMenu = function () {
    const s = aralTaskMenu.session || 1, week = aralW()[s], acts = week.activities, n = acts.length;
    setOwl('work'); nav.innerHTML = '';
    const done = acts.map((_, i) => submitted(s, i)), count = done.filter(Boolean).length, next = done.indexOf(false), all = count === n;
    const cars = acts.map((a, i) => carHTML(s, i, a, done[i] ? 'done' : i === next ? 'next' : stopLocked(s, i) ? 'locked' : 'todo')).join('');
    const msg = all ? `Hooray! You cleared all ${n} stops of Platform ${s}. Tap any carriage to look back.`
      : count ? `Great riding! ${n - count} stop${n - count === 1 ? '' : 's'} left. Board Stop ${aralBoardTaskNumber(s, next)} next.`
      : `All aboard! Platform ${s} has ${n} carriages. Start with Stop ${aralBoardTaskNumber(s, 0)}. Each carriage opens after you finish the one before it.`;
    app.innerHTML = aralStation({
      label: `Platform ${s} · Week ${aralView.week || 1} · Session ${s}`, title: esc(week.title),
      sub: `${week.pages ? `Workbook pages ${esc(week.pages)} · ` : ''}${n} stops`, say: msg, back: 'aralShow(6)',
      board: aralRail(done, n, 'stops cleared') + `<ol class="at-train">${cars}</ol>`,
      foot: `<button type="button" class="st-depart" onclick="aralBoardContinue()">${all ? 'Review Stop 1' : '▶ Board the next stop'}</button>`
    });
  };

  /* ---------- weeks and platforms: lock the ones not yet reached ---------- */
  function lockTickets(isLocked, message) {
    [...document.querySelectorAll('.st-tickets .st-ticket')].forEach((t, k) => {
      if (!isLocked(k)) return;
      t.classList.remove('next', 'todo'); t.classList.add('locked');
      t.dataset.lock = message(k);
      t.setAttribute('onclick', 'aralTrainLocked(this)');
      t.setAttribute('aria-disabled', 'true');
      t.setAttribute('aria-label', (t.getAttribute('aria-label') || '').replace(/ \(locked\)$/, '') + ' (locked)');
      const go = t.querySelector('.st-go'); if (go) go.textContent = '🔒 Locked';
      if (!t.querySelector('.at-stamp')) t.insertAdjacentHTML('beforeend', '<span class="at-stamp lock" aria-hidden="true">Locked</span>');
    });
  }
  { const original = renderAralStart; renderAralStart = function () {
    const r = original.apply(this, arguments);
    safe(() => { const ws = weeks(); lockTickets(k => weekLocked(ws[k]), k => weekMsg(ws[k])); });
    return r;
  }; }
  { const original = renderAralWeek; renderAralWeek = function () {
    const r = original.apply(this, arguments);
    safe(() => { const keys = aralSessionKeys(aralView.week || 1); lockTickets(k => sessionLocked(keys[k]), k => sessionMsg(keys[k])); });
    return r;
  }; }

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
.at-train{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3.4cqh 2.2cqw;margin:0;padding:2.2cqh 1cqw 2.6cqh;list-style:none;align-content:center;scrollbar-color:#c9973f #2a1a0e}
.at-car{position:relative;display:flex;min-width:0;animation:atArrive .8s cubic-bezier(.18,.85,.25,1) calc(var(--i)*.09s) both}
.at-car:not(:nth-child(3n)):not(:last-child)::after{content:'';position:absolute;z-index:0;right:-2.3cqw;bottom:3.6cqh;width:2.4cqw;height:.9cqh;border-radius:.4cqh;background:linear-gradient(#5b5b60,#1d1d20);box-shadow:0 0 0 .12cqh #c9973f}
.at-car>button{position:relative;z-index:1;appearance:none;border:0;background:none;padding:0;margin:0;cursor:pointer;flex:1;min-width:0;display:flex;flex-direction:column;color:#fff;font:inherit;text-align:center;filter:drop-shadow(0 .9cqh 1.1cqh #000b);transition:transform .2s ease,filter .2s ease}
.at-car>button:hover,.at-car>button:focus-visible{transform:translateY(-.7cqh)}
.at-car>button:focus-visible{outline:.25cqw solid #ffd76a;outline-offset:.4cqw;border-radius:1cqw}
.at-roof{height:1.9cqh;margin:0 5%;border-radius:1.4cqw 1.4cqw 0 0;background:linear-gradient(#6a5444,#241810);box-shadow:inset 0 .3cqh 0 #ffffff22}
.at-body{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:.8cqh;padding:1.3cqh 1cqw 1.5cqh;border-radius:.8cqw;
 background:linear-gradient(180deg,color-mix(in srgb,var(--car) 62%,#fff) 0,var(--car) 18%,color-mix(in srgb,var(--car) 72%,#000) 100%);
 border:.22cqw solid #e0b25a;box-shadow:inset 0 -1.1cqh 0 #00000033,inset 0 .3cqh 0 #ffffff55}
.at-body::after{content:'';position:absolute;left:4%;right:4%;bottom:2.2cqh;height:.45cqh;border-radius:9px;background:#e0b25a;opacity:.8}
.at-plate{font:900 clamp(10px,1.05cqw,17px)/1.2 Cinzel,Georgia,serif;letter-spacing:.12em;padding:.15em .8em;border-radius:999px;background:#1d1408;color:#ffd76a;border:.12cqw solid #e0b25a}
.at-windows{display:flex;gap:.7cqw;width:100%;justify-content:center}
.at-windows i{flex:1;max-width:2.8cqw;aspect-ratio:3/4;border-radius:.6cqw .6cqw .25cqw .25cqw;background:linear-gradient(#fff4cc,#f3b04c);border:.16cqw solid #e0b25a;box-shadow:inset 0 0 .7cqw #b86b12}
.at-title{font:800 clamp(12px,1.3cqw,21px)/1.2 system-ui,'Segoe UI',sans-serif;text-shadow:0 .1em .25em #000a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em;overflow-wrap:anywhere}
.at-does{font:600 clamp(10px,.9cqw,14px)/1.25 system-ui,sans-serif;opacity:.95}
.at-go{margin-top:auto;margin-bottom:1.4cqh;padding:.3em 1em;border-radius:999px;background:#fffaf0;color:#2b1a0b;font:900 clamp(11px,1.05cqw,16px)/1.2 system-ui,sans-serif;box-shadow:0 .3cqh .6cqh #0006}
.at-wheels{display:flex;justify-content:space-between;padding:0 9%;margin-top:-1.3cqh;height:3cqh;position:relative;z-index:1}
.at-wheels i{width:3cqh;height:3cqh;border-radius:50%;border:.25cqh solid #c9973f;background:radial-gradient(circle,#e8c879 0 18%,transparent 20%),repeating-conic-gradient(#d9b25a 0 8deg,#151518 8deg 45deg);animation:atRoll .8s linear calc(var(--i)*.09s) both}
.at-car.next>button{animation:atGlow 1.8s ease-in-out infinite}
.at-car.next .at-go{background:linear-gradient(#ffd76a,#f5a623)}
.at-car.done .at-go{background:#dff5e6;color:#14623d}
.at-car.locked>button{cursor:not-allowed;filter:grayscale(.85) brightness(.72) drop-shadow(0 .9cqh 1.1cqh #000b)}
.at-car.locked .at-windows i{background:linear-gradient(#6b6b6b,#3b3b3b);box-shadow:none}
.at-stamp{position:absolute;z-index:3;left:50%;top:46%;translate:-50% -50%;rotate:-13deg;padding:.2em .6em;border:.2em double currentColor;border-radius:.4em;background:#fff6e8d9;font:900 clamp(12px,1.35cqw,22px)/1 'Courier New',Courier,monospace;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;pointer-events:none;box-shadow:0 .2cqh .6cqh #0005}
.at-stamp.lock{color:#b3261e}
.at-stamp.done{color:#1f8f57;top:30%}
.st-ticket{position:relative}
.st-ticket.locked{cursor:not-allowed;filter:grayscale(.85) brightness(.75);animation:none!important}
.st-ticket.locked .st-go{background:#7a6a5a!important}
.at-shake{animation:atShake .45s ease both!important}
@keyframes atArrive{0%{transform:translateX(70cqw);opacity:0}70%{transform:translateX(-.6cqw);opacity:1}85%{transform:translateX(.25cqw)}100%{transform:none;opacity:1}}
@keyframes atRoll{from{rotate:-540deg}to{rotate:0deg}}
@keyframes atGlow{0%,100%{filter:drop-shadow(0 0 .2cqw #ffd76a) drop-shadow(0 .9cqh 1.1cqh #000b)}50%{filter:drop-shadow(0 0 1.4cqw #ffcf4d) drop-shadow(0 .9cqh 1.1cqh #000b)}}
@keyframes atShake{0%,100%{translate:0}20%{translate:-.8cqw}40%{translate:.8cqw}60%{translate:-.5cqw}80%{translate:.5cqw}}
@media (max-width:760px){.at-train{grid-template-columns:repeat(2,minmax(0,1fr))}.at-car:not(:nth-child(3n)):not(:last-child)::after{display:none}.at-car:nth-child(odd):not(:last-child)::after{display:block}}
@media (prefers-reduced-motion:reduce){.at-car,.at-wheels i,.at-car.next>button{animation:none!important}}
html.reduced-motion .at-car,html.reduced-motion .at-wheels i,html.reduced-motion .at-car.next>button{animation:none!important}`;
  document.head.append(css);

  // If the learner is already on an ARAL page when this loads, redraw it with the new look and locks.
  safe(() => { if (typeof activeModule !== 'undefined' && activeModule === 'aral' && document.querySelector('.st-screen') && typeof renderAral === 'function') renderAral(); });
})();
