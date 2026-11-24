/* Assessment Summary, rebuilt as a sharp HTML page (the old one was a 1672x941 picture stretched to the screen).
   Two tabs: "Overview" (Reading Check-In, ORST, WST and the overall recommendation) and "My WST Submission"
   (essay, plan and writing level). WST's "View Submission" opens the second tab instead of a pop-up. */
(() => {
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600;7..72,700&family=Source+Sans+3:wght@400;600;700&display=swap';
  document.head.append(font);

  const style = document.createElement('style');
  style.textContent = `
.hd-sum{--navy:#0d1f45;--navy2:#16336b;--gold:#e3bd71;--gold2:#f6dc8f;--paper:#fbf4e2;--paper2:#f2e3c2;--ink:#2a2116;--muted:#6b5d45;
 position:relative;width:100%;height:var(--landscape-height,100dvh);overflow:hidden;container-type:size;background:#081429;color:var(--ink);font-family:"Source Sans 3",system-ui,sans-serif}
.hd-sum *{box-sizing:border-box}
.hd-bg{position:absolute;inset:-24px;background:url("resources/summary/summary-nobar.png") center/cover no-repeat;filter:blur(6px) brightness(.5) saturate(1.15);transform:scale(1.04)}
.hd-bg::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(8,20,41,.15),rgba(8,20,41,.7) 75%)}
.hd-wrap{position:relative;height:100%;display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:clamp(6px,1.6cqh,16px);padding:clamp(8px,2.2cqh,22px) clamp(10px,2.2cqw,34px)}
.hd-top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px}
.hd-back{justify-self:start;display:inline-flex;align-items:center;gap:.55em;padding:.55em 1.1em .55em .7em;border-radius:999px;border:2px solid var(--gold);background:linear-gradient(#1b3a78,#0d1f45);color:var(--gold2);font:700 clamp(12px,2.1cqh,18px) Literata,Georgia,serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.15);transition:transform .15s,box-shadow .15s}
.hd-back:hover,.hd-back:focus-visible{transform:translateY(-1px);box-shadow:0 0 0 3px rgba(246,220,143,.35),0 6px 18px rgba(0,0,0,.5);outline:none}
.hd-back .ic{display:grid;place-items:center;width:1.7em;height:1.7em;border-radius:50%;background:var(--gold);color:var(--navy);font-size:.9em}
.hd-title{text-align:center;color:#fff;line-height:1.05}
.hd-title small{display:block;font:700 clamp(9px,1.45cqh,13px) "Source Sans 3",sans-serif;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
.hd-title h1{margin:.12em 0 0;font:700 clamp(20px,5.2cqh,48px) Cinzel,Georgia,serif;color:var(--gold2);text-shadow:0 2px 0 #6e4e17,0 4px 16px rgba(0,0,0,.6);letter-spacing:.03em}
.hd-learner{justify-self:end;display:flex;align-items:center;gap:.7em;padding:.4em 1em .4em .45em;border-radius:999px;background:linear-gradient(var(--paper),var(--paper2));border:2px solid var(--gold);box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer;font:inherit;color:var(--ink);text-align:left}
.hd-learner .av{display:grid;place-items:center;width:clamp(26px,5cqh,44px);height:clamp(26px,5cqh,44px);border-radius:50%;background:linear-gradient(#1b3a78,#0d1f45);color:var(--gold2);font:700 clamp(11px,1.9cqh,17px) Cinzel,serif;border:2px solid var(--gold)}
.hd-learner b{display:block;font:700 clamp(12px,1.9cqh,17px) Literata,Georgia,serif}
.hd-learner span{font-size:clamp(10px,1.5cqh,13px);color:var(--muted)}
.hd-tabs{justify-self:center;display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(8,20,41,.75);border:1px solid rgba(227,189,113,.55)}
.hd-tabs button{border:0;border-radius:999px;padding:.45em 1.3em;background:none;color:#e9dcc0;font:600 clamp(11px,1.8cqh,16px) "Source Sans 3",sans-serif;cursor:pointer}
.hd-tabs button[aria-selected=true]{background:linear-gradient(var(--gold2),#d8a94e);color:var(--navy);box-shadow:0 2px 8px rgba(0,0,0,.35)}
.hd-tabs button:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
.hd-pane{min-height:0}
.hd-pane[hidden]{display:none}
/* overview */
.hd-over{height:100%;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:clamp(6px,1.6cqh,16px)}
.hd-cards{min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.6cqw,24px)}
.hd-card{min-height:0;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:linear-gradient(var(--paper),var(--paper2));border:2px solid var(--gold);box-shadow:0 10px 28px rgba(0,0,0,.5),inset 0 0 0 4px rgba(255,255,255,.35),inset 0 0 0 5px rgba(201,151,62,.45)}
.hd-head{display:flex;align-items:center;gap:.75em;padding:clamp(6px,1.4cqh,14px) clamp(10px,1.2cqw,18px);background:linear-gradient(var(--navy2),var(--navy));border-bottom:2px solid var(--gold);color:#fff}
.hd-head .badge{flex:none;display:grid;place-items:center;width:clamp(30px,6.4cqh,58px);height:clamp(30px,6.4cqh,58px);border-radius:50%;background:radial-gradient(circle at 35% 30%,#2b5bb0,#0d1f45 70%);border:2px solid var(--gold);box-shadow:0 0 12px rgba(246,220,143,.35)}
.hd-head .badge svg{width:58%;height:58%;fill:none;stroke:var(--gold2);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.hd-head h2{margin:0;font:700 clamp(15px,3.3cqh,30px) Cinzel,Georgia,serif;color:var(--gold2);line-height:1}
.hd-head p{margin:.2em 0 0;font:500 clamp(10px,1.6cqh,15px) Literata,Georgia,serif;color:#dfe6f5}
.hd-body{flex:1;min-height:0;overflow:auto;scrollbar-width:none;padding:clamp(8px,1.6cqh,16px) clamp(10px,1.2cqw,18px);display:flex;flex-direction:column;gap:clamp(5px,1.1cqh,11px)}
.hd-body::-webkit-scrollbar{display:none}
.hd-score{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.hd-score .big{font:700 clamp(18px,4.4cqh,40px) Literata,Georgia,serif;color:var(--navy)}
.hd-score .big.none{font-size:clamp(14px,2.6cqh,24px);color:var(--muted)}
.hd-chip{display:inline-block;padding:.25em .8em;border-radius:999px;font:700 clamp(10px,1.6cqh,14px) "Source Sans 3",sans-serif;color:#fff;white-space:nowrap}
.hd-cap{font-size:clamp(10px,1.8cqh,15px);color:var(--muted)}
.hd-bar{height:clamp(6px,1.1cqh,10px);border-radius:99px;background:#e2d6bb;overflow:hidden}
.hd-bar i{display:block;height:100%;border-radius:inherit}
.hd-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(4px,.8cqh,8px)}
.hd-stat{padding:.35em .6em;border-radius:10px;background:rgba(255,255,255,.55);border:1px solid #e3d2a8}
.hd-stat small{display:block;font:700 clamp(8px,1.35cqh,12px) "Source Sans 3",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.hd-stat b{font:700 clamp(12px,2.1cqh,19px) Literata,Georgia,serif;color:var(--navy)}
.hd-crit{display:grid;grid-template-columns:auto minmax(40px,1fr) auto;align-items:center;gap:6px 10px;font-size:clamp(10px,1.85cqh,16px)}
.hd-crit b{font-weight:700;color:var(--navy)}
.hd-notes{margin-top:auto;display:grid;gap:clamp(3px,.7cqh,7px);padding-top:clamp(4px,1cqh,10px);border-top:1px dashed #cdb684}
.hd-note{display:grid;grid-template-columns:auto 1fr;gap:.55em;align-items:start;font-size:clamp(10px,1.85cqh,16px);line-height:1.3}
.hd-note .d{display:grid;place-items:center;width:1.5em;height:1.5em;border-radius:50%;color:#fff;font-size:.8em;font-weight:700}
.hd-note em{display:block;font:600 normal .92em Literata,Georgia,serif;color:var(--navy2)}
.hd-link{align-self:flex-start;border:0;background:none;padding:0;color:#1b4fa0;font:700 clamp(11px,1.6cqh,14px) "Source Sans 3",sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.hd-rec{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:clamp(8px,1.4cqw,20px);padding:clamp(8px,1.6cqh,14px) clamp(12px,1.6cqw,24px);border-radius:16px;background:linear-gradient(rgba(22,51,107,.94),rgba(13,31,69,.96));border:2px solid var(--gold);color:#f3ead6;box-shadow:0 10px 28px rgba(0,0,0,.5)}
.hd-rec .shield{display:grid;place-items:center;width:clamp(34px,7cqh,60px);height:clamp(34px,7cqh,60px);border-radius:14px 14px 50% 50%;background:linear-gradient(#24488e,#0d1f45);border:2px solid var(--gold);color:var(--gold2);font-size:clamp(16px,3.4cqh,30px)}
.hd-rec h3{margin:0 0 .2em;font:700 clamp(13px,2.4cqh,22px) Cinzel,Georgia,serif;color:var(--gold2)}
.hd-rec p{margin:0;font-size:clamp(11px,1.7cqh,15px);line-height:1.35}
.hd-rec .acts{display:flex;flex-direction:column;align-items:stretch;gap:6px}
.hd-btn{border-radius:999px;padding:.5em 1.2em;font:700 clamp(11px,1.7cqh,15px) "Source Sans 3",sans-serif;cursor:pointer;border:2px solid var(--gold);white-space:nowrap}
.hd-btn.gold{background:linear-gradient(var(--gold2),#d4a344);color:var(--navy)}
.hd-btn.ghost{background:transparent;color:var(--gold2)}
.hd-btn:focus-visible,.hd-link:focus-visible,.hd-learner:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
/* submission */
.hd-subm{height:100%;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:clamp(8px,1.6cqw,24px)}
.hd-paper{min-height:0;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:var(--paper);border:2px solid var(--gold);box-shadow:0 10px 28px rgba(0,0,0,.5)}
.hd-meta{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;padding:clamp(6px,1.3cqh,12px) clamp(12px,1.4cqw,22px);background:linear-gradient(var(--navy2),var(--navy));border-bottom:2px solid var(--gold);color:#e9e2cf;font-size:clamp(10px,1.55cqh,14px)}
.hd-meta h2{flex:1 1 100%;margin:0;font:700 clamp(14px,2.8cqh,26px) Cinzel,Georgia,serif;color:var(--gold2)}
.hd-meta b{color:#fff}
.hd-scroll{flex:1;min-height:0;overflow:auto;padding:clamp(10px,2cqh,22px) clamp(14px,2cqw,32px);scrollbar-width:thin;scrollbar-color:#c9a24a transparent}
.hd-prompt{margin:0 0 1em;padding:.7em 1em;border-left:4px solid var(--gold);border-radius:8px;background:#f3e6c7;font:500 clamp(11px,1.7cqh,15px)/1.45 Literata,Georgia,serif;color:var(--ink)}
.hd-prompt small{display:block;font:700 .75em "Source Sans 3",sans-serif;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;margin-bottom:.2em}
.hd-essay{font:400 clamp(12px,2cqh,18px)/1.7 Literata,Georgia,serif;color:#1f1a12;background:repeating-linear-gradient(transparent 0 calc(1.7em - 1px),rgba(27,79,160,.12) calc(1.7em - 1px) 1.7em)}
.hd-essay p{margin:0 0 .85em;text-indent:1.6em}
.hd-plan{margin-top:1em;border-top:1px dashed #cdb684;padding-top:.6em}
.hd-plan summary{cursor:pointer;font:700 clamp(11px,1.7cqh,15px) Literata,Georgia,serif;color:var(--navy2)}
.hd-plan pre{white-space:pre-wrap;font:400 clamp(11px,1.6cqh,14px)/1.5 "Source Sans 3",sans-serif;color:var(--ink);margin:.5em 0 0}
.hd-level{min-height:0;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:linear-gradient(var(--paper),var(--paper2));border:2px solid var(--gold);box-shadow:0 10px 28px rgba(0,0,0,.5)}
.hd-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(4px,.9cqh,8px)}
.hd-writer{display:flex;align-items:center;gap:.8em;padding:.6em .9em;border-radius:12px;color:#fff}
.hd-writer b{font:700 clamp(14px,2.6cqh,24px) Cinzel,Georgia,serif}
.hd-writer span{font-size:clamp(10px,1.5cqh,13px);line-height:1.3}
.hd-rubric{display:grid;gap:clamp(5px,1cqh,10px)}
.hd-rubric .row{display:grid;grid-template-columns:1fr auto;gap:3px 8px;font-size:clamp(10px,1.8cqh,15px)}
.hd-rubric .row b{color:var(--navy);font-weight:700}
.hd-rubric .row .hd-bar{grid-column:1/-1}
.hd-rubric .row p{grid-column:1/-1;margin:0;color:var(--muted);line-height:1.3}
.hd-empty{height:100%;display:grid;place-items:center;text-align:center;color:#f3ead6}
.hd-empty div{max-width:440px;padding:24px;border-radius:16px;background:rgba(13,31,69,.9);border:2px solid var(--gold)}
.hd-empty h2{font:700 clamp(16px,3cqh,26px) Cinzel,Georgia,serif;color:var(--gold2);margin:0 0 .4em}
@container (max-aspect-ratio:4/3){.hd-cards{grid-template-columns:1fr;overflow:auto}.hd-subm{grid-template-columns:1fr;overflow:auto}}
@media (prefers-reduced-motion:no-preference){.hd-pane:not([hidden]){animation:hdIn .35s ease-out}@keyframes hdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}`;
  document.head.append(style);

  const ICON = {
    gst: '<svg viewBox="0 0 24 24"><path d="M3 5.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8V19c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z"/><path d="M12 6.3v13.5"/></svg>',
    orst: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>',
    wst: '<svg viewBox="0 0 24 24"><path d="M20 3c-7 1-12 6-13.5 13.5L5 21l4.5-1.5C17 18 20 11 20 3z"/><path d="M6.5 16.5 13 10"/></svg>'
  };
  const ORIG_NEED = 90;
  const LEVEL_COLOR = {Independent: '#2f7d1a', Instructional: '#b77b00', Frustration: '#b8283a'};
  const esc = s => (typeof h === 'function' ? h(s) : String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])));
  const pct = (a, b) => (100 * a / b).toFixed(1) + '%';
  const bar = (v, color) => `<div class="hd-bar"><i style="width:${Math.max(0, Math.min(100, v))}%;background:${color}"></i></div>`;
  const note = (kind, title, text) => {
    const d = {s: ['#2f7d1a', '★'], i: ['#c98a00', '!'], n: ['#5b3c99', '➜']}[kind];
    return `<div class="hd-note"><span class="d" style="background:${d[0]}">${d[1]}</span><div><em>${title}</em>${esc(text)}</div></div>`;
  };
  const card = (key, name, full, body) => `<article class="hd-card"><header class="hd-head"><span class="badge">${ICON[key]}</span><div><h2>${name}</h2><p>${full}</p></div></header><div class="hd-body">${body}</div></article>`;

  function overview(d) {
    const gst = d.gstScored
      ? `<div class="hd-score"><span class="big">${d.gst.score} / ${d.gst.total}</span><span class="hd-chip" style="background:#2f7d1a">${pct(d.gst.score, d.gst.total)}</span></div>${bar(100 * d.gst.score / d.gst.total, '#2f8f55')}<span class="hd-cap">Recorded Reading Check-In result</span>`
      : `<div class="hd-score"><span class="big none">Not taken</span><span class="hd-chip" style="background:#7a7466">Pending</span></div>${bar(0, '#2f8f55')}<span class="hd-cap">No scored attempt yet</span>`;
    const minutes = Number.isFinite(d.gst.elapsedMs) ? Math.round(d.gst.elapsedMs / 60000) + ' min' : '—';
    const prog = d.gstScored && d.gst.score > 0 ? (window.readwyJourneyGate?.programFor?.(Number(d.gst.score)) || null) : null;
    const PROG = {aral: ['ARAL Program', '#f2b215', '#1b1a14'], interv: ['InterV Program', '#0f7a71', '#fff'], sra: ['Reading Lab', '#1a52c4', '#fff']};
    const place = prog ? `<div class="hd-place"><small>Your journey (placement)</small><span style="background:${PROG[prog][1]};color:${PROG[prog][2]}">${PROG[prog][0]}</span><em>The Reading Check-In score decides the program; the ORST and WST open too.</em></div>` : `<div class="hd-place"><small>Your journey (placement)</small><span style="background:#7a7466;color:#fff">Pending</span><em>Your program is chosen after the Reading Check-In is scored.</em></div>`;
    const gstBody = gst + `<div class="hd-stats"><div class="hd-stat"><small>Correct</small><b>${d.gstScored ? d.gst.score : '—'}</b></div><div class="hd-stat"><small>Time</small><b>${minutes}</b></div></div>` + place +
      `<div class="hd-notes">${note('s', 'Strengths', d.gstScored ? `${d.gst.score} correct responses` : 'No scored Reading Check-In result yet')}${note('i', 'Needs improvement', d.gstScored ? `${d.gst.total - d.gst.score} incorrect or unanswered responses` : 'Complete the Reading Check-In to record a result.')}${note('n', 'Next step', 'Review the saved Reading Check-In responses with your teacher.')}</div>`;

    const orstBody = `<div class="hd-score"><span class="big${d.oralValid ? '' : ' none'}">${d.oralValid ? esc(d.level) : 'Not taken'}</span><span class="hd-chip" style="background:${d.accuracy === null ? '#7a7466' : '#b77b00'}">${d.accuracy === null ? 'Pending' : d.accuracy.toFixed(1) + '% accuracy'}</span></div>` +
      `${bar(d.accuracy ?? 0, '#c98a00')}<span class="hd-cap">${Number.isFinite(d.oral.comprehension) ? 'Comprehension: ' + d.oral.comprehension.toFixed(1) + '%' : 'Reading level · no comprehension score yet'}</span>` +
      `<div class="hd-stats"><div class="hd-stat"><small>Words correct</small><b>${d.oralValid ? d.oral.words - d.oral.miscues : '—'}</b></div><div class="hd-stat"><small>Miscues</small><b>${d.oralValid ? d.oral.miscues : '—'}</b></div><div class="hd-stat"><small>Fluency (WCPM)</small><b>${d.wcpm ?? '—'}</b></div><div class="hd-stat"><small>Time</small><b>${d.seconds ? Math.round(d.seconds) + ' sec' : '—'}</b></div></div>` +
      `<div class="hd-notes">${note('s', 'Strengths', d.oralValid ? `${d.oral.words - d.oral.miscues} words read correctly` : 'No oral reading result yet')}${note('i', 'Needs improvement', d.oralValid ? `${d.oral.miscues} observed miscues` : 'Complete an observed reading first.')}${note('n', 'Next step', 'Review your passage and recorded reading with your teacher.')}</div>`;

    const held = d.writing?.status === 'needs-review';
    const res = held ? null : d.writing?.result;
    const T40 = !held ? d.writing?.total40 : null, TR = !held ? d.writing?.traits : null;
    const wst = T40
      ? `<div class="hd-score"><span class="big">${T40.score} / 40</span><span class="hd-chip" style="background:${LEVEL_COLOR[T40.writer] || '#1b4fa0'}">${esc(T40.writer)}</span></div>${bar(T40.percent, '#286a91')}`
      : d.wstScored && res
      ? `<div class="hd-score"><span class="big">${d.review.score} / ${d.review.total}</span><span class="hd-chip" style="background:${LEVEL_COLOR[res.writer] || '#1b4fa0'}">${esc(res.writer || '')}</span></div>${bar(100 * d.review.score / d.review.total, '#286a91')}`
      : `<div class="hd-score"><span class="big none">${d.writing ? 'Pending review' : 'Not submitted'}</span><span class="hd-chip" style="background:#7a7466">Pending</span></div>${bar(0, '#286a91')}`;
    const crit = TR ? `<div class="hd-crit">${TR.traits.map(c => `<span>${esc(c.name)}</span>${bar(c.level / 6 * 100, c.level >= 4 ? '#2f8f55' : c.level === 3 ? '#c98a00' : '#c0392b')}<b>${c.level}/6</b>`).join('')}</div>`
      : res?.criteria?.length ? `<div class="hd-crit">${res.criteria.map(c => `<span>${esc(c.name)}</span>${bar(c.score * 25, '#4f8fbf')}<b>${c.score}/4</b>`).join('')}</div>` : '';
    const partA = T40 ? `<div class="hd-stats"><div class="hd-stat"><small>Part A · Skills</small><b>${T40.partA.score}/20</b></div><div class="hd-stat"><small>Part B · Writing</small><b>${T40.partB.score}/20</b></div></div>` : '';
    const wstBody = wst + partA + `<span class="hd-cap">${held ? `Held for teacher review · ${d.writing.integrity?.original ?? '—'}% original writing` : T40 ? esc(T40.proficiency) + ' · Part B: 6+1 Trait® Writing' : d.writing ? 'Submitted · ' + d.writing.words + ' words' : 'No writing submitted yet'}</span>` + crit +
      (d.writing ? `<button class="hd-link" type="button" data-tab-go="submission">Read my submission →</button>` : '') +
      `<div class="hd-notes">${note('n', 'Next step', T40 ? 'Your teacher confirms your WST rating. Your next stop opens on the Journey Map.' : 'Discuss your writing feedback with your teacher.')}</div>`;

    const overall = `Reading Check-In: ${d.gstScored ? d.gst.score + '/' + d.gst.total : 'not scored'}. ORST: ${d.accuracy === null ? 'not scored' : d.accuracy.toFixed(1) + '% word-reading accuracy'}. WST: ${d.writing?.total40 && d.writing.status !== 'needs-review' ? d.writing.total40.score + '/40 (' + d.writing.total40.writer + ')' : d.wstScored ? d.review.score + '/' + d.review.total : d.writing ? 'submitted, awaiting teacher scoring' : 'not submitted'}. Your teacher reviews the saved attempts for placement.`;
    return `<div class="hd-over"><div class="hd-cards">${card('gst', 'Check-In', 'Reading Check-In', gstBody)}${card('orst', 'ORST', 'Oral Reading Screening Test', orstBody)}${card('wst', 'WST', 'Writing Screening Test', wstBody)}</div>
      <section class="hd-rec"><span class="shield">✦</span><div><h3>Overall Recommendation</h3><p>${esc(overall)}</p></div><div class="acts"><span class="hd-chip" style="background:#b77b00;text-align:center">Placement: pending teacher review</span><button class="hd-btn ghost" type="button" data-act="reports">Detailed saved results</button></div></section></div>`;
  }

  function submission(d) {
    const r = d.writing;
    if (!r) return `<div class="hd-empty"><div><h2>No writing yet</h2><p>Finish the Writing Screening Test to see your submission here.</p><button class="hd-btn gold" type="button" data-act="wst">Open WST</button></div></div>`;
    const dt = new Date(r.date), when = isNaN(dt) ? '—' : dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    const paras = String(r.text || '').split(/\n+/).filter(Boolean);
    const prompt = window.readwyWSTPrompt || '';
    const res = r.result;
    const paper = `<section class="hd-paper"><div class="hd-meta"><h2>My Essay</h2><span>Student <b>${esc(r.name || user?.name || '—')}</b></span><span>Grade <b>${esc(r.grade)}</b>${r.type ? ' · ' + esc(r.type) : ''}</span><span>Words <b>${esc(r.words)}</b></span><span>Submitted <b>${esc(when)}</b>${r.timedOut ? ' (time up)' : ''}</span></div>
      <div class="hd-scroll">${prompt ? `<p class="hd-prompt"><small>Prompt</small>${esc(prompt)}</p>` : ''}<div class="hd-essay">${paras.map(p => `<p>${esc(p)}</p>`).join('') || '<p>(empty)</p>'}</div>
      ${r.plan ? `<details class="hd-plan"><summary>My plan</summary><pre>${esc(r.plan)}</pre></details>` : ''}</div></section>`;
    let level;
    if (r.status === 'needs-review' && r.integrity) {
      const g = r.integrity;
      level = `<section class="hd-level"><header class="hd-head"><span class="badge">${ICON.wst}</span><div><h2>Held for Review</h2><p>Originality check</p></div></header><div class="hd-body">
        <div class="hd-writer" style="background:#b8283a"><b>${g.original}%</b><span>original writing · ${ORIG_NEED}% needed</span></div>
        <div class="hd-facts"><div class="hd-stat"><small>Copied from sources</small><b>${g.copiedPct}%</b></div><div class="hd-stat"><small>Entered in blocks</small><b>${g.bulkPct}%</b></div><div class="hd-stat"><small>Quoted (allowed)</small><b>${g.quotedPct}%</b></div><div class="hd-stat"><small>Paste attempts</small><b>${(g.pastes || 0) + (g.drops || 0)}</b></div></div>
        <div class="hd-rubric">${(g.sources || []).map(s => `<div class="row"><b>${esc(s.title)}</b><b>${s.copiedPct}%</b>${bar(s.copiedPct, '#c0392b')}<p>${s.passages.map(p => `“${esc(p.words)}”`).join(' · ')}${s.link ? ` · <a href="${esc(s.link)}" target="_blank" rel="noopener">open source ↗</a>` : ''}</p></div>`).join('')}</div>
        <span class="hd-cap">Your teacher reviews this essay before it gets a score. ${esc(g.limits || '')}</span></div></section>`;
    } else if (r.traits && r.total40) {
      const T = r.total40, tr = r.traits, lc = l => l >= 4 ? '#2f8f55' : l === 3 ? '#c98a00' : '#c0392b';
      level = `<section class="hd-level"><header class="hd-head"><span class="badge">${ICON.wst}</span><div><h2>My Writing Level</h2><p>Part A (20) + Part B (20) = 40 points</p></div></header><div class="hd-body">
        <div class="hd-writer" style="background:${LEVEL_COLOR[T.writer] || '#1b4fa0'}"><b>${esc(T.writer)}</b><span>WST total ${T.score}/40 · ${esc(T.proficiency)} · ${esc(T.descriptor)}</span></div>
        <div class="hd-facts"><div class="hd-stat"><small>Part A · Writing skills</small><b>${T.partA.score} / 20</b></div><div class="hd-stat"><small>Part B · Writing activity</small><b>${T.partB.score} / 20 · ${esc(tr.overall)}</b></div></div>
        <div class="hd-rubric">${tr.traits.map(c => `<div class="row"><b>${esc(c.name)}</b><b>${c.level}/6 · ${esc(c.label)}</b>${bar(c.level / 6 * 100, lc(c.level))}<p>${esc(c.desc)}</p></div>`).join('')}</div>
        <span class="hd-cap">Part B scored with the 6+1 Trait® Writing rubric (Education Northwest, 2021); levels 4–6 are proficient. Total interpreted with DepEd DO 8, s. 2015 and DO 73, s. 2012. Your teacher confirms the final rating.</span></div></section>`;
    } else if (res) {
      level = `<section class="hd-level"><header class="hd-head"><span class="badge">${ICON.wst}</span><div><h2>My Writing Level</h2><p>Scored with the WST rubric</p></div></header><div class="hd-body">
        <div class="hd-writer" style="background:${LEVEL_COLOR[res.writer] || '#1b4fa0'}"><b>${esc(res.writer)}</b><span>Writer level · ${res.score}/${res.total}</span></div>
        <div class="hd-rubric">${(res.criteria || []).map(c => `<div class="row"><b>${esc(c.name)}</b><b>${c.score}/4</b>${bar(c.score * 25, '#4f8fbf')}<p>${esc(c.desc)}</p></div>`).join('')}</div>
        <span class="hd-cap">Estimated automatically by READwy. Your teacher confirms the final rating.</span></div></section>`;
    } else {
      level = `<section class="hd-level"><header class="hd-head"><span class="badge">${ICON.wst}</span><div><h2>My Writing Level</h2><p>Awaiting scoring</p></div></header><div class="hd-body"><p>Your teacher will score this essay.</p></div></section>`;
    }
    return `<div class="hd-subm">${paper}${level}</div>`;
  }

  function render(tab) {
    page = 'assessment-summary'; activeModule = 'wst';
    try { nav.innerHTML = ''; stopOwlFlight(); owl.dataset.motion = 'still'; owl.style.display = 'none'; } catch {}
    const d = assessmentSummaryData(selectedGrade);
    const name = user?.name || 'Learner';
    const initials = name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'R';
    app.innerHTML = `<section class="hd-sum" aria-label="Assessment summary"><div class="hd-bg"></div><div class="hd-wrap">
      <header class="hd-top"><button class="hd-back" type="button" data-act="journey"><span class="ic">↩</span>Back to Journey</button>
        <div class="hd-title"><small>READwy · Results</small><h1>Assessment Summary</h1></div>
        <button class="hd-learner" type="button" data-act="profile" aria-label="Open learner profile"><span class="av">${esc(initials)}</span><span><b>${esc(name)}</b><span>Grade ${esc(selectedGrade)}</span></span></button></header>
      <div class="hd-tabs" role="tablist"><button role="tab" type="button" data-tab="overview">Overview</button><button role="tab" type="button" data-tab="submission">My WST Submission</button></div>
      <div class="hd-pane" data-pane="overview" role="tabpanel">${overview(d)}</div>
      <div class="hd-pane" data-pane="submission" role="tabpanel">${submission(d)}</div></div></section>`;
    const root = app.querySelector('.hd-sum');
    const select = t => {
      root.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
      root.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== t; });
    };
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-tab],[data-tab-go]');
      if (t) return select(t.dataset.tab || t.dataset.tabGo);
      const a = e.target.closest('[data-act]'); if (!a) return;
      try {
        if (a.dataset.act === 'journey') go('map');
        else if (a.dataset.act === 'profile') go('profile');
        else if (a.dataset.act === 'reports') openModule('reports');
        else if (a.dataset.act === 'wst') openWST();
      } catch {}
    });
    select(tab === 'submission' ? 'submission' : 'overview');
    try { app.scrollTo(0, 0); } catch {}
  }

  const install = () => {
    if (typeof window.renderAssessmentSummary !== 'function' || window.renderAssessmentSummary.readwyHD) return;
    window.renderAssessmentSummary = function () {
      const tab = window.readwySummaryTab; window.readwySummaryTab = null;
      return render(tab);
    };
    window.renderAssessmentSummary.readwyHD = true;
    // WST "View Submission": open the summary on the submission tab.
    window.readwyOpenSubmission = prompt => {
      window.readwyWSTPrompt = prompt || window.readwyWSTPrompt || '';
      window.readwySummaryTab = 'submission';
      return transition('assessment-summary', () => window.renderAssessmentSummary());
    };
  };
  install();
  addEventListener('load', install, {once: true});
})();

/* My WST Submission: larger, easier-to-read text that fills each panel (no empty lower half). */
(() => {
  const s = document.createElement('style');
  s.textContent = `
.hd-subm{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important}
.hd-meta{font-size:clamp(12px,2.1cqh,19px)!important;gap:6px 22px!important}
.hd-meta h2{font-size:clamp(18px,3.6cqh,34px)!important}
.hd-scroll{display:flex;flex-direction:column;gap:clamp(8px,1.8cqh,18px);padding:clamp(12px,2.4cqh,26px) clamp(16px,2.2cqw,36px)!important}
.hd-prompt{margin:0!important;font-size:clamp(13px,2.35cqh,21px)!important}
.hd-prompt small{font-size:.7em!important}
.hd-essay{flex:1 0 auto;font-size:clamp(15px,3cqh,27px)!important;line-height:1.75!important}
.hd-plan{margin-top:0!important;padding:clamp(8px,1.6cqh,14px) clamp(10px,1.4cqw,18px)!important;border:1px dashed #cdb684;border-top:1px dashed #cdb684!important;border-radius:12px;background:rgba(255,255,255,.45)}
.hd-plan summary{font-size:clamp(14px,2.4cqh,22px)!important}
.hd-plan pre{font-size:clamp(13px,2.2cqh,19px)!important;line-height:1.5!important}
.hd-level .hd-body{gap:clamp(6px,1.4cqh,14px)!important}
.hd-level .hd-stat small{font-size:clamp(10px,1.6cqh,14px)!important}
.hd-level .hd-stat b{font-size:clamp(15px,2.9cqh,26px)!important}
.hd-level .hd-writer{padding:clamp(8px,1.6cqh,16px) clamp(12px,1.4cqw,20px)!important}
.hd-level .hd-writer b{font-size:clamp(18px,3.6cqh,32px)!important}
.hd-level .hd-writer span{font-size:clamp(12px,2cqh,17px)!important}
.hd-level .hd-rubric{flex:1 1 auto;display:flex!important;flex-direction:column;justify-content:space-between;gap:clamp(6px,1.2cqh,12px)!important}
.hd-level .hd-rubric .row{font-size:clamp(13px,2.25cqh,20px)!important;gap:4px 10px!important}
.hd-level .hd-rubric .row .hd-bar{height:clamp(8px,1.4cqh,13px)!important}
.hd-level .hd-rubric .row p{font-size:clamp(12px,1.95cqh,17px)!important;line-height:1.35!important}
.hd-level .hd-cap{font-size:clamp(11px,1.8cqh,15px)!important}
.hd-card .hd-body{font-size:clamp(12px,2cqh,17px)}
.hd-card .hd-cap,.hd-card .hd-note{font-size:clamp(12px,2cqh,17px)!important}
.hd-card .hd-crit{font-size:clamp(12px,2.1cqh,18px)!important}
.hd-card .hd-stat b{font-size:clamp(14px,2.6cqh,23px)!important}
.hd-card .hd-stat small{font-size:clamp(9px,1.5cqh,13px)!important}`;
  document.head.append(s);
  // open "My plan" by default so it uses the space instead of hiding behind a toggle
  new MutationObserver(() => document.querySelectorAll('.hd-plan:not([data-open])').forEach(d => { d.open = true; d.dataset.open = '1'; }))
    .observe(document.documentElement, {childList: true, subtree: true});
})();

/* Assessment Summary: a quick, smooth cross-fade in and out (the general page-turn scaled the page
   inside a book frame for 1.5 s, which looked glitchy here), and a larger, fuller Overview. */
(() => {
  const s = document.createElement('style');
  s.textContent = `
.hd-cards .hd-head h2{font-size:clamp(18px,4.2cqh,38px)!important}
.hd-cards .hd-head p{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-cards .hd-head .badge{width:clamp(34px,7.4cqh,66px)!important;height:clamp(34px,7.4cqh,66px)!important}
.hd-cards .hd-body{gap:clamp(6px,1.5cqh,14px)!important;padding:clamp(10px,2cqh,20px) clamp(12px,1.4cqw,22px)!important;overflow:hidden!important}
.hd-cards .hd-score .big{font-size:clamp(22px,5.6cqh,50px)!important}
.hd-cards .hd-score .big.none{font-size:clamp(17px,3.6cqh,32px)!important}
.hd-cards .hd-chip{font-size:clamp(11px,2cqh,17px)!important}
.hd-cards .hd-bar{height:clamp(8px,1.5cqh,14px)!important}
.hd-cards .hd-cap{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-cards .hd-stats{gap:clamp(6px,1.2cqh,12px)!important}
.hd-cards .hd-stat{padding:.5em .8em!important}
.hd-cards .hd-stat small{font-size:clamp(10px,1.7cqh,15px)!important}
.hd-cards .hd-stat b{font-size:clamp(16px,3.2cqh,29px)!important}
.hd-cards .hd-crit{font-size:clamp(12px,2.2cqh,19px)!important;gap:clamp(6px,1.3cqh,12px) 10px!important}
.hd-cards .hd-link{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-cards .hd-notes{gap:clamp(5px,1.2cqh,11px)!important}
.hd-cards .hd-note{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-place{display:grid;gap:.35em;margin-top:.3em;padding:.7em .9em;border-radius:12px;background:rgba(255,255,255,.55);border:1px solid #e3d2a8}
.hd-place small{font:800 clamp(10px,1.6cqh,14px) "Source Sans 3",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#6b5d45}
.hd-place span{justify-self:start;padding:.3em 1em;border-radius:10px;font:800 clamp(15px,2.9cqh,26px) "Nunito","Segoe UI",sans-serif}
.hd-place em{font:italic clamp(11px,1.9cqh,16px) Georgia,serif;color:#5f5a4d}
.hd-rec h3{font-size:clamp(15px,3cqh,27px)!important}
.hd-rec p{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-rec .hd-btn,.hd-rec .hd-chip{font-size:clamp(11px,2cqh,17px)!important}
.hd-tabs button{font-size:clamp(12px,2.2cqh,19px)!important}
.hd-back{font-size:clamp(13px,2.4cqh,20px)!important}
.hd-learner b{font-size:clamp(13px,2.3cqh,20px)!important}`;
  document.head.append(s);

  const quick = (to, renderDestination) => {
    if (typeof navigationBusy !== 'undefined' && navigationBusy) return false;
    try { navigationBusy = true; } catch {}
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduced-motion');
    const commit = () => {
      try { stopOwlFlight(); } catch {}
      page = to;
      if (renderDestination) renderDestination(); else render();
      try { scrollAppToTop(); } catch {}
    };
    const done = () => { app.style.opacity = ''; try { navigationBusy = false; } catch {} };
    if (reduce) { try { commit(); } finally { done(); } return true; }
    const out = app.animate([{opacity: 1}, {opacity: 0}], {duration: 140, easing: 'ease-in', fill: 'forwards'});
    out.finished.then(() => {
      try { commit(); } catch (e) { console.error(e); }
      out.cancel();
      app.animate([{opacity: 0, transform: 'scale(.985)'}, {opacity: 1, transform: 'none'}], {duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)'})
        .finished.finally(done);
    }, done);
    return true;
  };
  const install = () => {
    if (typeof window.transition !== 'function' || window.transition.readwyQuick) return;
    const base = window.transition;
    window.transition = function (to, renderDestination) {
      if (to === 'assessment-summary' || (typeof page !== 'undefined' && page === 'assessment-summary' && to !== 'map'))
        return quick(to, renderDestination);
      return base.apply(this, arguments);
    };
    window.transition.readwyQuick = true;
  };
  install();
  addEventListener('load', install, {once: true});
})();

(()=>{const s=document.createElement('style');s.textContent='.hd-cards .hd-body:has(.hd-crit){gap:clamp(4px,1cqh,10px)!important}.hd-cards .hd-body:has(.hd-crit) .hd-crit{gap:clamp(3px,.75cqh,8px) 10px!important;font-size:clamp(11px,2cqh,17px)!important}.hd-cards .hd-body:has(.hd-crit) .hd-notes{padding-top:clamp(3px,.8cqh,8px)!important;gap:clamp(3px,.8cqh,8px)!important}';document.head.append(s)})();

