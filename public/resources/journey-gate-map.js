/* Portrait journey map: show which stages are open for this learner and explain locked ones instead of
   opening them. The app checks again on entry (journey-gate.js), so this is a guide, not the only lock. */
(() => {
  const PREFIX = 'READwy_new_2026_local_';
  const read = key => { try { return JSON.parse(localStorage.getItem(PREFIX + key) || 'null'); } catch { return null; } };
  const u = read('user') || {};
  const dev = !!u.dev || (() => { try { return sessionStorage.getItem('readwy-dev-view') === '1'; } catch { return false; } })();
  const key = String(u.id || u.lrn || u.email || 'local').trim().toLowerCase();
  const saved = read('journey_gate_' + key);
  // Worked out here from the learner's saved Reading Check-In, so the ticket is right as soon as the learner enters
  // (same rules as journey-gate.js). Only "program finished" needs the app's saved check.
  const NAMES = {aral: 'Catch-Up Express', interv: 'InterV Program', sra: 'Reading Lab'};
  // Exploration period (SY 2026–2027): same date as journey-gate.js — change both together.
  const EXPLORE_UNTIL = Date.parse('2027-06-01T00:00:00+08:00');
  const STAMPED = ['gst', 'orst', 'wst', 'reports'];
  const gate = (() => {
    if (u.role === 'teacher') return null;
    const grade = Number(u.grade) || 7;
    if (Date.now() < EXPLORE_UNTIL) {
      const msg = 'The Reading Check-In, ORST and WST open at the start of School Year 2027–2028 (June 1, 2027). This school year, explore the Catch-Up Express, InterV and Reading Lab programs.';
      return {exploring: true,
        open: {gst: false, orst: false, wst: false, aral: true, interv: true, sra: true, reports: false},
        messages: {gst: msg, orst: msg, wst: msg, reports: 'The Post-Test opens with the Reading Check-In at the start of School Year 2027–2028 (June 1, 2027).'}};
    }
    if (grade >= 11) {
      const msg = `For Grade ${grade}, the open journeys are InterV and Reading Lab.`;
      return {open: {gst: false, orst: false, wst: false, aral: false, interv: true, sra: true, reports: false},
        messages: {gst: msg, orst: msg, wst: msg, aral: msg, reports: msg}};
    }
    const scoped = u.role === 'student' && u.id ? `student_${u.id}_` : '';
    const report = read(scoped + 'assessment_' + grade) || read('assessment_' + grade) || {};
    const taken = report.status === 'submitted' && Number.isFinite(Number(report.score));
    if (!taken) {
      const msg = 'Take the Reading Check-In first. This stop opens after you submit the Reading Check-In.';
      return {open: {gst: true, orst: false, wst: false, aral: false, interv: false, sra: false, reports: false},
        messages: {orst: msg, wst: msg, aral: msg, interv: msg, sra: msg, reports: msg}};
    }
    const score = Number(report.score);
    const program = score <= 16 ? 'aral' : score <= 27 ? 'interv' : 'sra';
    const finished = !!(saved && saved.program === program && saved.programDone);
    const placed = `Your Reading Check-In score is ${score} of 40, so your journey is the ${NAMES[program]}. Only that program is open for you.`;
    return {
      program, score,
      // Reading Check-In stays open after submission to see results and edit the profile (it cannot be retaken).
      open: {gst: true, orst: true, wst: true, aral: program === 'aral', interv: program === 'interv', sra: program === 'sra', reports: finished},
      messages: {aral: placed, interv: placed, sra: placed,
        reports: `The Post-Test opens after you finish every task in the ${NAMES[program]}.`}
    };
  })();

  const style = document.createElement('style');
  style.textContent = `
a.stage.rw-locked{cursor:not-allowed}
a.stage.rw-locked::after{content:'🔒';position:absolute;right:6%;top:50%;translate:0 -50%;display:grid;place-items:center;width:clamp(26px,9vw,40px);aspect-ratio:1;border-radius:50%;
 background:#1d1408e6;border:2px solid #d9b45a;box-shadow:0 3px 8px #0008;font-size:clamp(13px,4.4vw,20px);line-height:1}
a.stage.rw-locked::before{content:'';position:absolute;inset:0;border-radius:14px;background:#120c0688;backdrop-filter:grayscale(.85) brightness(.75);-webkit-backdrop-filter:grayscale(.85) brightness(.75)}
a.stage.rw-yours::after{content:'★ Your program';position:absolute;right:4%;bottom:6%;padding:3px 9px;border-radius:999px;background:#f3cf6a;color:#2b1d05;font:800 clamp(9px,2.6vw,12px)/1.2 system-ui,sans-serif;box-shadow:0 2px 6px #0007}
.pf-dest.rw-locked{cursor:not-allowed;filter:grayscale(.9);opacity:.55}
.pf-dest.rw-locked .hole::after{content:'🔒';display:grid;place-items:center;width:100%;height:100%;font-size:.75em;line-height:1}
.pf-dest.rw-yours{box-shadow:0 0 0 3px #e2b33c,0 0 14px #f3cf6a99!important}
.pf-dest.rw-yours::after{content:'★ Yours';display:block;margin-top:2px;color:#8a5a00;font:800 10px/1 system-ui,sans-serif}
/* Exploration period: a red rubber "LOCKED" ticket stamp pressed over Reading Check-In, ORST, WST and the Post-Test (no padlock badge). */
a.stage.rw-stamped::after,.pf-dest.rw-stamped .hole::after{content:none}
a.stage.rw-stamped::before{background:#120c0655;backdrop-filter:grayscale(.6) brightness(.9);-webkit-backdrop-filter:grayscale(.6) brightness(.9)}
.pf-dest.rw-stamped{opacity:.8;filter:grayscale(.5)}
.rw-stamp{position:absolute;left:50%;top:50%;z-index:6;translate:-50% -50%;rotate:-14deg;display:grid;justify-items:center;gap:.12em;padding:.28em .6em .32em;
 border:.18em double #b3261e;border-radius:.4em;background:rgba(255,244,228,.78);color:#b3261e;
 font:900 clamp(13px,4.6vw,24px)/1 'Courier New',Courier,monospace;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;
 box-shadow:0 0 0 .06em rgba(179,38,30,.35),0 2px 6px #0005;text-shadow:0 0 1px rgba(179,38,30,.6);pointer-events:none}
.rw-stamp small{font-size:.42em;letter-spacing:.12em;font-weight:800}
.pf-dest .rw-stamp{font-size:clamp(8px,.75vw,11px);border-width:.2em;padding:.25em .4em;rotate:-12deg;filter:none}
.rw-gate-note{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));z-index:99999;translate:-50% 0;width:min(92vw,520px);padding:12px 16px;border-radius:14px;
 background:#1d1408f2;border:2px solid #d9b45a;color:#fff4d6;font:600 15px/1.4 system-ui,sans-serif;text-align:center;box-shadow:0 10px 24px #000a}`;
  document.head.append(style);

  let noteTimer = 0;
  function note(text) {
    let el = document.querySelector('.rw-gate-note');
    if (!el) { el = document.createElement('div'); el.className = 'rw-gate-note'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { el.hidden = true; }, 6000);
  }

  // A message handed over by the app after it turned a learner back from a locked stage.
  try {
    const handed = sessionStorage.getItem('readwy-journey-gate-message');
    if (handed) { sessionStorage.removeItem('readwy-journey-gate-message'); addEventListener('load', () => note(handed)); }
  } catch {}

  if (dev || !gate || !gate.open) return;
  // The map has two ways in: the illustrated stages (a.stage) and the ticket's numbered stops (.pf-dest, in journey order).
  const TICKET_ORDER = ['gst', 'orst', 'wst', 'aral', 'interv', 'sra', 'reports'];
  const programOf = el => el.dataset.program || TICKET_ORDER[Number(el.dataset.i)];
  const apply = el => {
    const program = programOf(el);
    if (!program || !(program in gate.open)) return;
    const locked = !gate.open[program];
    el.classList.toggle('rw-locked', locked);
    el.classList.toggle('rw-yours', !locked && program === gate.program);
    const stamped = locked && !!gate.exploring && STAMPED.includes(program);
    el.classList.toggle('rw-stamped', stamped);
    const stamp = el.querySelector(':scope>.rw-stamp');
    if (stamped && !stamp) {
      const s = document.createElement('span');
      s.className = 'rw-stamp';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = 'Locked<small>SY 2027–2028</small>';
      el.append(s);
    } else if (!stamped && stamp) stamp.remove();
    if (locked) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
    const label = (el.getAttribute('aria-label') || '').replace(/ \(locked\)$/, '');
    if (label) el.setAttribute('aria-label', locked ? label + ' (locked)' : label);
  };
  const mark = () => document.querySelectorAll('a.stage[data-program], .pf-dest[data-i]').forEach(apply);
  mark();
  addEventListener('DOMContentLoaded', () => {
    mark();
    new MutationObserver(mark).observe(document.body, {childList: true, subtree: true});
  });
  // Runs before the map's own handlers (window capture fires before document capture).
  const block = event => {
    const el = event.target.closest?.('a.stage.rw-locked, .pf-dest.rw-locked');
    if (!el) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === 'click') note(gate.messages?.[programOf(el)] || 'This stage is not open yet.');
  };
  for (const type of ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend']) addEventListener(type, block, {capture: true, passive: false});
})();


/* Journey ticket: the Back button as a green-and-gold ticket stub that matches the ticket header
   and the "Board the train" button (it was a plain dark-blue pill). */
(() => {
  const style = document.createElement('style');
  style.textContent = `
.journey>.back{display:inline-flex!important;align-items:center;gap:.5em;bottom:max(6px,env(safe-area-inset-bottom))!important;padding:5px 16px 5px 5px!important;border:0!important;border-radius:999px!important;
 background:radial-gradient(ellipse at 50% 0%,rgba(255,230,150,.25),transparent 60%),linear-gradient(180deg,#1f5c40,#0f3a27)!important;
 color:#ffe9a8!important;font:700 14px/1 Georgia,"Times New Roman",serif!important;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 1px 0 #0a2618;
 box-shadow:inset 0 0 0 2px #c9a14a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(233,196,106,.55),0 6px 14px rgba(0,0,0,.45)!important;
 transition:transform .2s,box-shadow .2s;overflow:hidden}
.journey>.back[hidden]{display:none!important}
.journey>.back::before{content:'';flex:none;width:24px;height:24px;border-radius:50%;
 background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14.5 6.5L9 12l5.5 5.5' fill='none' stroke='%235a3a08' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/62% no-repeat,
  radial-gradient(circle at 35% 30%,#fff2b8,#e9c46a 45%,#a8761e);box-shadow:0 0 0 1.5px #7a5214,0 0 10px rgba(255,214,120,.5)}
.journey>.back:hover,.journey>.back:focus-visible{transform:translateY(-2px);outline:none!important;
 box-shadow:inset 0 0 0 2px #e9c46a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(255,220,130,.85),0 0 16px rgba(255,214,120,.45),0 8px 18px rgba(0,0,0,.5)!important}
.journey>.back:active{transform:translateY(0) scale(.97)}`;
  document.head.append(style);
})();
