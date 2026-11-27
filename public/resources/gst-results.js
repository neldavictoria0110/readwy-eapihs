/* Reading Check-In results (Grades 7–10 book, ".xg" without ".xc"):
   1. The results page no longer shows which answers are correct (no green numbers, no right/wrong marks
      when reviewing an answer).
   2. While reviewing, a "Results" button returns to the results page from any question.
   3. "What my score means" opens the placement rules (Reading Check-In 1–15 Catch-Up Express, 16–27 InterV, 28–40 SRA), redrawn
      sharply from the teacher guide picture, with the learner's own range highlighted. */
(() => {
  const isGST = () => !document.querySelector('.xc,.xo');
  const PROGRAMS = {
    aral: {range: 'Check-In 1–15', level: 'Frustration level', pill: 'Catch-Up Express',
      text: 'You will start with the Catch-Up Express. It builds your reading skills step by step, with a teacher guiding you through short lessons and practice.'},
    interv: {range: 'Check-In 16–27', level: '', pill: 'InterV Program',
      text: 'You will join the InterV Program. Its stations give you focused practice on the reading skills you still need.'},
    sra: {range: 'Check-In 28–40', level: '', pill: 'Reading Lab',
      text: 'You will join the Reading Lab. You read texts at your own level and move up as you pass each one.'}
  };
  const programFor = score => (window.readwyJourneyGate?.programFor?.(score)) || (score <= 15 ? 'aral' : score <= 27 ? 'interv' : 'sra');

  // A crisp train like the guide's: navy locomotive, yellow coach, orange rail fence.
  const TRAIN = `<svg class="xgp-train" viewBox="0 0 220 64" aria-hidden="true">
    <g stroke="#c4561a" stroke-width="3" stroke-linecap="round"><path d="M4 55H216M4 61H216"/>${Array.from({length: 12}, (_, i) => `<path d="M${10 + i * 18.3} 50V64"/>`).join('')}</g>
    <g><rect x="22" y="22" width="54" height="24" rx="4" fill="#1d3f8f"/><rect x="58" y="12" width="20" height="34" rx="3" fill="#163273"/>
      <rect x="32" y="12" width="7" height="12" rx="1.5" fill="#163273"/><rect x="62" y="17" width="12" height="9" rx="1.5" fill="#cfe3ff"/>
      <rect x="26" y="27" width="28" height="4" rx="2" fill="#f2c94c"/><circle cx="20" cy="36" r="4" fill="#ffe08a"/>
      <circle cx="34" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/><circle cx="50" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/><circle cx="68" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/></g>
    <g><rect x="84" y="14" width="118" height="32" rx="5" fill="#f5b81f"/><rect x="84" y="12" width="118" height="6" rx="3" fill="#1d3f8f"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${92 + i * 27}" y="22" width="19" height="12" rx="2" fill="#fff7d6"/>`).join('')}
      <rect x="84" y="40" width="118" height="4" fill="#1d3f8f"/>
      <circle cx="100" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/><circle cx="118" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/>
      <circle cx="168" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/><circle cx="186" cy="48" r="5" fill="#0f1f45" stroke="#f2c94c" stroke-width="1.5"/></g>
    <path d="M76 34H84" stroke="#0f1f45" stroke-width="3"/></svg>`;
  const BUS = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M5 14h22" stroke="currentColor" stroke-width="2.4"/><circle cx="11" cy="25" r="2.6" fill="currentColor"/><circle cx="21" cy="25" r="2.6" fill="currentColor"/></svg>`;
  const RAIL = `<svg viewBox="0 0 120 30" aria-hidden="true"><path d="M2 9C40 3 80 3 118 9M2 21C40 15 80 15 118 21" fill="none" stroke="#e8a21c" stroke-width="3.2" stroke-linecap="round"/>${Array.from({length: 8}, (_, i) => `<path d="M${10 + i * 14.5} 4V27" stroke="#e8a21c" stroke-width="3.2" stroke-linecap="round"/>`).join('')}</svg>`;
  const CHECK = `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#2e9b45"/><path d="M9 16.5l5 5L23.5 11" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const style = document.createElement('style');
  style.textContent = `
.xg .xg-grid button.xgr-plain{background:linear-gradient(180deg,#1d5a3d,#124530);color:#f3dc98;border-color:#c9a14a;box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 2px 4px rgba(0,0,0,.25)}
.xg .xg-grid button.xgr-plain:hover,.xg .xg-grid button.xgr-plain:focus-visible{background:linear-gradient(180deg,#26704c,#17583c);color:#fff3c4;outline:none;box-shadow:0 0 0 2px #e9c46a,0 3px 8px rgba(0,0,0,.3)}
.xg .xgr-mean{position:relative;display:flex;align-items:center;justify-content:center;gap:.9em;width:100%;margin-top:.45em;padding:.38em 1em;border:0;border-radius:.7em;cursor:pointer;text-align:center;color:#f7e6b0;
 background:radial-gradient(ellipse at 50% 0%,rgba(255,230,150,.28),transparent 60%),linear-gradient(180deg,#1f5c40,#0f3a27);
 box-shadow:inset 0 0 0 2px #c9a14a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(233,196,106,.6),0 6px 14px rgba(40,25,5,.35);overflow:hidden;transition:transform .2s,box-shadow .2s}
.xg .xgr-mean::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,240,190,.35) 50%,transparent 65%);transform:translateX(-120%);animation:xgrShine 3.8s ease-in-out infinite}
@keyframes xgrShine{0%,55%{transform:translateX(-120%)}85%,100%{transform:translateX(120%)}}
.xg .xgr-mean:hover,.xg .xgr-mean:focus-visible{transform:translateY(-2px);outline:none;box-shadow:inset 0 0 0 2px #e9c46a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(255,220,130,.85),0 0 18px rgba(255,214,120,.45),0 8px 18px rgba(40,25,5,.4)}
.xg .xgr-txt{position:relative;display:flex;flex-direction:column;align-items:center;line-height:1.1}
.xg .xgr-txt b{font:700 1.05em Cinzel,Georgia,serif;letter-spacing:.08em;color:#ffe9a8;text-shadow:0 1px 0 #0a2618,0 0 10px rgba(255,214,120,.35)}
.xg .xgr-txt small{margin-top:.12em;font:italic .68em Georgia,serif;color:#e9d9a8;letter-spacing:.02em}
.xg .xgr-seal{position:relative;display:grid;place-items:center;width:1.5em;height:1.5em;flex:none;border-radius:50%;font-size:.85em;color:#5a3a08;
 background:radial-gradient(circle at 35% 30%,#fff2b8,#e9c46a 45%,#a8761e);box-shadow:0 0 0 1.5px #7a5214,0 0 10px rgba(255,214,120,.55)}
@media (prefers-reduced-motion:reduce){.xg .xgr-mean::before{animation:none;display:none}}
.xg-foot .xgr-results{font-size:.85em;padding-inline:1em}
.xgp{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;gap:1.5cqw;padding:2.2cqw 3.2cqw 1.8cqw;border-radius:6px;
 background:linear-gradient(90deg,#fbf4e4,#fffaf0 46%,#efe3c7 50%,#fffaf0 54%,#fbf4e4);box-shadow:0 10px 30px rgba(0,0,0,.45);color:#13254f;
 font-family:"Nunito","Segoe UI Rounded","Segoe UI",Arial,sans-serif;animation:xgpIn .45s ease-out}
@keyframes xgpIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.xgp-head{display:flex;align-items:center;gap:1.6cqw}
.xgp-head .ic{width:4.4cqw;height:4.4cqw;color:#1d3f8f;flex:none}
.xgp-head h2{margin:0;font:900 3.1cqw/1 "Nunito","Segoe UI",Arial,sans-serif;color:#13254f;letter-spacing:-.01em}
.xgp-head .rail{margin-left:auto;width:12cqw;flex:none}
.xgp-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2cqw}
.xgp-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:.35cqw;padding:1.2cqw 1.2cqw 1.1cqw;border-radius:2cqw;border:.25cqw solid;text-align:center;transition:transform .2s}
.xgp-card.aral{background:linear-gradient(180deg,#fff2cc,#fde39e);border-color:#f0c35a}
.xgp-card.interv{background:linear-gradient(180deg,#e8f7f1,#cdeee2);border-color:#9fd8c3}
.xgp-card.sra{background:linear-gradient(180deg,#e9f1ff,#cfe0fd);border-color:#a9c5f3}
.xgp-card h3{margin:0;font:900 2.9cqw/1.05 "Nunito","Segoe UI",Arial,sans-serif;color:#0f1d3d}
.xgp-card .lv{margin:0;font:800 1.75cqw/1.1 "Nunito","Segoe UI",Arial,sans-serif;color:#1d2a44;min-height:1.1em}
.xgp-train{width:78%;height:auto;margin:0}
.xgp-pill{width:100%;padding:.6cqw .6cqw;border-radius:1.4cqw;font:900 2cqw/1.1 "Nunito","Segoe UI",Arial,sans-serif;box-shadow:inset 0 -.35cqw 0 rgba(0,0,0,.18),0 .4cqw .8cqw rgba(0,0,0,.15)}
.xgp-card.aral .xgp-pill{background:linear-gradient(180deg,#ffd34d,#f2b215);color:#1b1a14}
.xgp-card.interv .xgp-pill{background:linear-gradient(180deg,#22a397,#0f7a71);color:#fff}
.xgp-card.sra .xgp-pill{background:linear-gradient(180deg,#2f74e6,#1a52c4);color:#fff}
.xgp-card.you{transform:translateY(-.6cqw);box-shadow:0 0 0 .5cqw #fff,0 0 0 .9cqw #13254f,0 1.4cqw 2.4cqw rgba(19,37,79,.3)}
.xgp-card.dim{opacity:.62;filter:saturate(.75)}
.xgp-card .tag{position:absolute;top:-1.5cqw;left:50%;translate:-50% 0;padding:.35cqw 1.2cqw;border-radius:99px;background:#13254f;color:#ffe08a;font:900 1.35cqw/1 "Nunito","Segoe UI",Arial,sans-serif;letter-spacing:.08em;white-space:nowrap}
.xgp-rule{display:flex;align-items:center;gap:1.2cqw;margin:0;padding:.7cqw 1.4cqw;border-radius:1.6cqw;background:linear-gradient(90deg,#fff6d8,#fdf0c9);border:.2cqw solid #f1d98a;font:800 1.7cqw/1.25 "Nunito","Segoe UI",Arial,sans-serif;color:#13254f}
.xgp-rule svg{width:3.2cqw;height:3.2cqw;flex:none}
.xgp-you{display:flex;align-items:center;gap:1.8cqw;padding:.9cqw 1.6cqw;border-radius:1.6cqw;background:#13254f;color:#f3ead6}
.xgp-you .sc{flex:none;text-align:center;line-height:1}
.xgp-you .sc b{display:block;font:900 3.4cqw/1 "Nunito","Segoe UI",Arial,sans-serif;color:#ffe08a}
.xgp-you .sc small{font:800 1.3cqw "Nunito","Segoe UI",Arial,sans-serif;letter-spacing:.12em;color:#c9d3ec}
.xgp-you p{margin:0;font:600 1.55cqw/1.35 "Nunito","Segoe UI",Arial,sans-serif}
.xgp-you p strong{color:#ffe08a}
.xgp-foot{display:flex;justify-content:space-between;margin-top:auto}`;
  document.head.append(style);

  function placementHTML() {
    const rep = (typeof load === 'function' ? load('assessment_' + xg.grade, {}) : {}) || {};
    const n = xgData().questions.length, score = Number(rep.score);
    const has = Number.isFinite(score) && score > 0, mine = has ? programFor(score) : null;
    const cards = Object.entries(PROGRAMS).map(([key, p]) =>
      `<div class="xgp-card ${key}${mine === key ? ' you' : mine ? ' dim' : ''}">${mine === key ? '<span class="tag">YOUR SCORE</span>' : ''}<h3>${p.range}</h3><p class="lv">${p.level}</p>${TRAIN}<div class="xgp-pill">${p.pill}</div></div>`).join('');
    const you = has
      ? `<div class="xgp-you"><div class="sc"><b>${score}/${n}</b><small>YOUR Reading Check-In</small></div><p>Your score is in the <strong>${PROGRAMS[mine].range.replace('Check-In ', '')}</strong> range, so your journey is the <strong>${PROGRAMS[mine].pill}</strong>. The ORST and WST open too.</p></div>`
      : `<div class="xgp-you"><div class="sc"><b>—</b><small>YOUR Reading Check-In</small></div><p>A missing Reading Check-In or a score of 0 is <strong>pending review</strong>. Your teacher will check your test before your journey is chosen.</p></div>`;
    return `<div class="xgp" role="dialog" aria-label="What your Reading Check-In score means">
      <div class="xgp-head"><span class="ic">${BUS}</span><h2>Placement rules</h2><span class="rail">${RAIL}</span></div>
      <div class="xgp-cards">${cards}</div>
      <p class="xgp-rule">${CHECK}Reading Check-In determines placement, regardless of ORST and WST results.</p>
      ${you}
      <div class="xgp-foot"><button class="xg-btn" type="button" onclick="readwyGstPlacement(false)">◀ Back to results</button><button class="xg-btn gold" type="button" onclick="readwyGo('index.html?view=map')">Back to journey ▶</button></div></div>`;
  }
  window.readwyGstPlacement = (show = true) => {
    const book = document.getElementById('xgBook');
    if (!book) return;
    book.querySelector('.xgp')?.remove();
    if (!show) return;
    book.insertAdjacentHTML('beforeend', placementHTML());
    try { aralSfx?.('pop'); } catch {}
  };

  const install = () => {
    const original = window.xgPages;
    if (typeof original !== 'function' || original.readwyResults) return;
    window.xgPages = function (i) {
      const pages = original.apply(this, arguments);
      if (!isGST() || !Array.isArray(pages)) return pages;
      const n = xgData().questions.length;
      let [l, r] = pages;
      if (i >= n && gstIsSubmitted()) {
        // results: plain numbers (no "correct" colouring) and the placement button
        r = r.replace(/<button class="(done)?" onclick="xgGo\(/g, '<button class="xgr-plain" onclick="xgGo(')
          .replace('Green = correct. Tap a number to review it.', 'Tap a number to look at your answer again.');
        l = l.replace(/(<p class="by">[\s\S]*?<\/p>)(<\/div>)$/, `$1<button class="xgr-mean" type="button" onclick="readwyGstPlacement()" aria-label="Unlock my score: see what your score means"><span class="xgr-seal" aria-hidden="true">✦</span><span class="xgr-txt"><b>Unlock My Score</b><small>See where your journey begins</small></span><span class="xgr-seal" aria-hidden="true">✦</span></button>$2`);
      } else if (i >= 0 && i < n && xg.review) {
        // reviewing: show only the learner's own choice, and a way back to the results
        r = r.replace(/class="xg-opt ([^"]*)"/g, (m, cls) => `class="xg-opt ${cls.replace(/\b(ok|bad)\b/g, '').trim()}"`)
          .replace(/<div class="xg-prog">[\s\S]*?<\/div>/, `<button class="xg-btn xgr-results" type="button" onclick="xgGo(${n},1,false)">▦ Results</button>`);
      }
      return [l, r];
    };
    window.xgPages.readwyResults = true;
    // Leaving the results page (or turning a page) closes the placement view.
    const go = window.xgGo;
    if (typeof go === 'function' && !go.readwyResults) {
      window.xgGo = function () { document.querySelector('#xgBook .xgp')?.remove(); return go.apply(this, arguments); };
      window.xgGo.readwyResults = true;
    }
  };
  install();
  addEventListener('load', install, {once: true});
})();
