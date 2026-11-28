/* READwy Quests: Main Quest and Side Quests, the teacher's post-test date, points, badges and privileges.

   Main Quest  = the destination the Keypass score assigns. Finishing it unlocks the Post-Test and the other two
                 destinations as Side Quests (optional, for points and badges only; they never block the Post-Test).
   Post-Test   = opens when the Main Quest is finished OR when the section's post-test date (set by the teacher) arrives.
   Points      = one central award function (awardPoints). Every award has a unique key, so it is never counted twice,
                 and is logged with its reason and time in this browser and in Firebase (studentProgress/{uid}/points).
   Badges and privileges never change a score, the Keypass placement or the Post-Test result.

   Loaded in the main app page (where progress is read) and in the journey ticket page (where it is shown). */
(() => {
  if (window.READwyQuests) return;

  /* ======================= POINT VALUES — change them here ======================= */
  const POINTS = {
    keypass: 100, voiceStation: 100, spellscript: 100,        // finishing each assessment
    dailyLogin: 10,                                             // once per day
    streakBonus: { 3: 30, 7: 75, 14: 150, 30: 300 },            // login streak bonuses (days: points)
    task: 20,                                                   // finishing a lesson / task
    accuracyBonus: 10, accuracyAt: 0.9,                         // extra for 90%+ accuracy on a task
    mainQuestFinished: 200,
    postTest: 100,
    improvementPerPoint: 10,                                    // per Keypass point gained (post-test % on a 0–40 scale)
    /* Balance rule: all of a destination's Main Quest work (tasks, accuracy bonuses and its own extras below) is
       scaled to this total, so Catch-Up Express, Inkventure and the Reading Lab are worth the same.
       The Reading Lab's Word Vault adds at most readingLab.wordVaultMax × wordVaultWord on top (under 10%). */
    destinationTotal: 1500,
    catchUp: { weekFinished: 40 },                              // extra for each finished week (weeks 2–8)
    inkventure: { gameStep: 25, gameStepPoints: 10, gameSteps: 5 }, // station game score: points per 25 game points, up to 5 steps
    readingLab: {
      comprehension: { 8: 5, 9: 10, 10: 15 },                   // by quiz score out of 10
      streakEvery: 5, streakPoints: 5,                          // +5 for every 5 right answers in a row
      speedImproved: 10,                                        // reading speed beats your previous best
      summary: 10, summaryBonus: 5, summaryMinWords: 40,        // written response after a passage
      wordVaultWord: 2, wordVaultMax: 60                        // Word Vault: points per new word, words counted
    },
    sideQuest: { challenge: 1.5, review: 0.5 },                 // Side Quest multipliers
    hintTokenEvery: 300                                         // one hint token for every 300 points earned
  };
  /* Keypass score bands. Learners who submitted the Keypass before BAND_CHANGE keep the old bands. */
  const BAND_CHANGE = Date.parse('2026-11-28T11:00:00+08:00');
  const bandOld = s => s <= 16 ? 'aral' : s <= 27 ? 'interv' : 'sra';
  const bandNew = s => s <= 15 ? 'aral' : s <= 27 ? 'interv' : 'sra';
  /* ================================================================================ */

  const PREFIX = 'READwy_new_2026_local_';
  const NAMES = { aral: 'Catch-Up Express', interv: 'Inkventure', sra: 'READwy Reading Lab' };
  const LEVEL = { aral: 1, interv: 2, sra: 3 };
  const DESTS = ['aral', 'interv', 'sra'];
  const readLS = (k, f = null) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v } catch { return f } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function currentUser() {
    try { if (typeof user !== 'undefined' && user) return user } catch {}
    return readLS(PREFIX + 'user', {}) || {};
  }
  const learnerKey = (u = currentUser()) => String(u.id || u.lrn || u.email || 'local').trim().toLowerCase();
  const isLearner = () => { const u = currentUser(); return !!u && u.role !== 'teacher' && !u.dev && !!(u.id || u.lrn || u.email || u.name) };
  const storeKey = () => PREFIX + 'quests_' + learnerKey();
  const vaultKey = () => PREFIX + 'wordvault_' + learnerKey();
  const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayNumber = s => { const [y, m, d] = String(s).split('-').map(Number); return Math.round(new Date(y, m - 1, d).getTime() / 864e5) };

  /* ---------- the learner's quest record (safe defaults for old accounts) ---------- */
  function blank() {
    return { v: 1, log: {}, synced: {}, badges: {}, seen: {}, equipped: { frame: 'none', theme: 'station', title: 'passenger' },
      tokensUsed: { hint: 0 }, loginDays: [], flags: {}, main: null, celebrated: false, preview: null,
      postTestStart: null, postTest: null, postTestDate: null, snap: null };
  }
  function load() {
    const s = readLS(storeKey(), null);
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    return { ...b, ...s, equipped: { ...b.equipped, ...(s.equipped || {}) }, tokensUsed: { ...b.tokensUsed, ...(s.tokensUsed || {}) },
      log: s.log || {}, synced: s.synced || {}, badges: s.badges || {}, seen: s.seen || {}, flags: s.flags || {}, loginDays: Array.isArray(s.loginDays) ? s.loginDays : [] };
  }
  function save(st) { writeLS(storeKey(), st); emit() }
  let emitT = 0;
  function emit() { clearTimeout(emitT); emitT = setTimeout(() => { try { dispatchEvent(new CustomEvent('readwy-quests-change')) } catch {} }, 60) }
  const total = (st = load()) => Object.values(st.log).reduce((n, a) => n + (Number(a.a) || 0), 0);

  /* ---------- the one award function ---------- */
  let st = null; // record being updated during a scan (saved once at the end)
  function award(key, amount, reason) {
    const own = !st; const s = st || load();
    key = String(key).replace(/\//g, '|').slice(0, 150);
    if (s.log[key]) return 0;
    amount = Math.max(0, Math.round(Number(amount) || 0));
    s.log[key] = { a: amount, r: String(reason || 'Points').slice(0, 150), t: Date.now() };
    if (own) { save(s); afterChange() }
    return amount;
  }
  // Public: awardPoints(studentId, amount, reason[, key]). Without a key the award is unique per reason and day.
  function awardPoints(studentId, amount, reason, key) {
    if (!isLearner() || (studentId && String(studentId).toLowerCase() !== learnerKey() && studentId !== currentUser().id)) return 0;
    return award(key || `custom:${reason}:${localDay()}`, amount, reason);
  }

  /* ---------- Main Quest, Side Quests and the post-test date ---------- */
  function mainQuestFor(score, report = {}, grade) {
    if (!Number.isFinite(Number(score))) return null;
    score = Number(score);
    const s = load();
    if (s.main && s.main.score === score && Number(s.main.grade) === Number(grade)) return s.main.program;
    const at = Date.parse(report.submittedAt || report.completedAt || report.date || '') || 0;
    const rule = at && at >= BAND_CHANGE ? 'new' : 'old';
    const program = (rule === 'new' ? bandNew : bandOld)(score);
    if (isLearner()) { s.main = { program, score, grade: Number(grade) || null, rule, at: Date.now() }; save(s) }
    return program;
  }
  const sideKind = (main, dest) => !main || dest === main ? 'main' : LEVEL[dest] > LEVEL[main] ? 'challenge' : 'review';
  function postTestDate() { const d = load().postTestDate; return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null }
  function daysUntil(date) { return date ? dayNumber(date) - dayNumber(localDay()) : null }
  const dateArrived = () => { const d = postTestDate(); return !!d && daysUntil(d) <= 0 };
  const fmtDate = d => { if (!d) return ''; const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
  /* Shared journey rules for both gates. done = {aral, interv, sra} (each destination finished). */
  function rules({ score, report, grade, done = {} }) {
    const program = mainQuestFor(score, report, grade);
    const mainDone = !!(program && done[program]);
    const s = load();
    const preview = !mainDone && s.preview && DESTS.includes(s.preview) && s.preview !== program && previewAllowed(s) ? s.preview : null;
    const open = {}, kinds = {}, messages = {};
    for (const d of DESTS) {
      kinds[d] = sideKind(program, d);
      open[d] = d === program || mainDone || d === preview;
      if (!open[d]) messages[d] = 'Finish your Main Quest to unlock Side Quests.';
    }
    open.reports = mainDone || dateArrived();
    const date = postTestDate();
    if (!open.reports) messages.reports = date
      ? `The Post-Test opens on ${fmtDate(date)}, or as soon as you finish your Main Quest (${NAMES[program]}).`
      : `The Post-Test opens after you finish your Main Quest (${NAMES[program]}).`;
    return { program, mainDone, preview, open, kinds, messages, postTestDate: date };
  }

  /* ---------- reading progress (main app page only: it has the destinations' own functions) ---------- */
  const words = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
  function withGrade(grade, fn) {
    try {
      if (typeof selectedGrade === 'undefined') return fn();
      const prev = selectedGrade;
      try { selectedGrade = grade; return fn() } finally { selectedGrade = prev }
    } catch { return null }
  }
  const L = (k, f) => { try { return typeof window.load === 'function' ? window.load(k, f) : readLS(PREFIX + k, f) } catch { return f } };
  function collectAral(grade) {
    return withGrade(grade, () => {
      if (typeof aralW !== 'function' || typeof aralLessonState !== 'function') return null;
      const P = POINTS, W = aralW() || {}, items = []; let n1 = 0, done = 0;
      for (const s of [1, 2, 3, 4]) (W[s]?.activities || []).forEach((_, i) => {
        n1++;
        if (aralLessonState(s, i)?.submitted) { done++; items.push({ key: `aral:${grade}:w1:s${s}:a${i + 1}`, raw: P.task, reason: `Catch-Up Express · Week 1, session ${s}, activity ${i + 1}` }) }
      });
      const recs = (typeof aralRecords === 'function' ? aralRecords() : {}) || {};
      for (let w = 2; w <= 8; w++) if (recs[w]?.complete) { done++; items.push({ key: `aral:${grade}:w${w}`, raw: P.task + P.catchUp.weekFinished, reason: `Catch-Up Express · Week ${w} finished` }) }
      const all = typeof aralWeekDone === 'function' && [1, 2, 3, 4, 5, 6, 7, 8].every(w => aralWeekDone(w));
      const count = n1 + 7;
      return { items, rawMax: n1 * P.task + 7 * (P.task + P.catchUp.weekFinished), done: !!all, pct: all ? 100 : Math.min(99, Math.round(100 * done / count)) };
    });
  }
  function collectInterv() {
    try {
      if (typeof intervStationStore !== 'function' || typeof INTERV_STATIONS === 'undefined') return null;
      const P = POINTS, I = P.inkventure, store = intervStationStore(), g = typeof ivGrade === 'function' ? ivGrade() : 7, by = (store.st || {})[g] || {};
      const items = []; let done = 0;
      for (const station of INTERV_STATIONS) {
        const d = by[station.key] || { t: {} }, name = station.name || station.title || station.key;
        for (let t = 1; t <= 5; t++) {
          const r = d.t?.[t];
          if (!(r && r.g?.won && r.w)) continue;
          done++;
          items.push({ key: `iv:${g}:${station.key}:${t}`, raw: P.task, reason: `Inkventure · ${name}, task ${t}` });
          if ((Number(r.g.lives) || 0) >= 3 || Number(r.w?.score?.transmuted) >= 90) items.push({ key: `iv:${g}:${station.key}:${t}:acc`, raw: P.accuracyBonus, reason: `Inkventure · 90%+ on ${name}, task ${t}` });
          if ((Number(r.g.lives) || 0) >= 3) flag('perfect');
        }
        const steps = Math.min(I.gameSteps, Math.floor((Number(d.pts) || 0) / I.gameStep));
        for (let k = 1; k <= steps; k++) items.push({ key: `iv:${g}:${station.key}:game${k}`, raw: I.gameStepPoints, reason: `Inkventure · ${name} game score reached ${k * I.gameStep}` });
      }
      const n = INTERV_STATIONS.length * 5;
      return { items, rawMax: n * (P.task + P.accuracyBonus) + INTERV_STATIONS.length * I.gameSteps * I.gameStepPoints, done: done >= n, pct: Math.min(100, Math.round(100 * done / n)) };
    } catch { return null }
  }
  function collectSra() {
    const P = POINTS, C = P.readingLab, Pr = readLS('sra-rw-journey-v1', {}) || {}, texts = Pr.texts || {};
    const start = Math.max(0, Math.min(5, Number(Pr.start ?? 0) || 0));
    const ids = []; for (let lv = start; lv < 6; lv++) for (let n = 1; n <= 10; n++) ids.push(`${7 + lv}-${n}`);
    const perText = P.task + P.accuracyBonus + C.comprehension[10] + Math.floor(10 / C.streakEvery) * C.streakPoints + C.speedImproved + C.summary + C.summaryBonus;
    const items = []; let complete = 0;
    for (const id of ids) {
      const t = texts[id]; if (!t) continue;
      const sc = Number(t.quiz?.score) || 0;
      if (t.quizPassed) {
        items.push({ key: `sra:${id}`, raw: P.task, reason: `Reading Lab · passage ${id} finished` });
        if (sc / 10 >= P.accuracyAt) items.push({ key: `sra:${id}:acc`, raw: P.accuracyBonus, reason: `Reading Lab · 90%+ on passage ${id}` });
        if (C.comprehension[sc]) items.push({ key: `sra:${id}:comp`, raw: C.comprehension[sc], reason: `Reading Lab · comprehension ${sc}/10 on passage ${id}` });
        const runs = Math.floor(Math.min(10, Number(t.quiz?.run) || 0) / C.streakEvery);
        for (let k = 1; k <= runs; k++) items.push({ key: `sra:${id}:run${k}`, raw: C.streakPoints, reason: `Reading Lab · ${k * C.streakEvery} right answers in a row (${id})` });
        if (sc === 10) flag('perfect');
      }
      if (t.writing) {
        items.push({ key: `sra:${id}:sum`, raw: C.summary, reason: `Reading Lab · written response for ${id}` });
        if (words(t.writing.text) >= C.summaryMinWords) items.push({ key: `sra:${id}:sumx`, raw: C.summaryBonus, reason: `Reading Lab · response of ${C.summaryMinWords}+ words (${id})` });
      }
      if (t.quizPassed && t.writing?.passed) complete++;
    }
    // Reading speed: each passage read faster than every earlier one (words per minute) earns a bonus.
    let best = 0;
    ids.map(id => [id, texts[id]]).filter(([, t]) => t && t.words > 20 && t.readMs > 5000)
      .sort((a, b) => String(a[1].quiz?.at || '').localeCompare(String(b[1].quiz?.at || '')))
      .forEach(([id, t]) => { const wpm = t.words / (t.readMs / 60000); if (wpm > 400) return; if (best && wpm > best) items.push({ key: `sra:${id}:speed`, raw: C.speedImproved, reason: `Reading Lab · faster reading (${Math.round(wpm)} words a minute)` }); best = Math.max(best, wpm) });
    return { items, rawMax: ids.length * perText, done: complete >= ids.length && ids.length > 0, pct: Math.min(100, Math.round(100 * complete / Math.max(1, ids.length))), best: Math.round(best) };
  }
  function flag(name) { const s = st || load(); if (!s.flags[name]) { s.flags[name] = Date.now(); if (!st) save(s) } }
  function collect() {
    if (!isLearner()) return null;
    const gate = window.readwyJourneyGate, gs = gate?.status?.();
    if (!gs || gs.exploring || gs.senior) return null;
    const grade = gs.grade;
    const post = L('post_result_' + grade, null);
    const runs = Array.isArray(post?.runs) ? post.runs.filter(r => Number(r.total) > 0) : [];
    const pct = runs.length ? runs.reduce((n, r) => n + (Number.isFinite(Number(r.pct)) ? Number(r.pct) : 100 * r.score / r.total), 0) / runs.length : null;
    return {
      at: Date.now(), grade, gst: !!gs.gst, score: gs.score, orst: !!gs.orst, wst: !!gs.wst,
      dest: { aral: collectAral(grade), interv: collectInterv(), sra: collectSra() },
      post: { taken: !!post && runs.length > 0, pct: pct == null ? null : Math.round(pct * 10) / 10 }
    };
  }

  /* ---------- scan: turn saved progress into awards (never twice) ---------- */
  function scan(snap) {
    if (!isLearner()) return;
    st = load();
    try {
      if (snap) st.snap = { ...snap, dest: Object.fromEntries(Object.entries(snap.dest).map(([k, d]) => [k, d ? { done: d.done, pct: d.pct } : null])) };
      const S = snap || null;
      if (!S) {
        // Ticket page: the assessments the app has already recorded as finished.
        const g = readLS(PREFIX + 'journey_gate_' + learnerKey(), {}) || {};
        if (g.gst) award('assess:keypass', POINTS.keypass, 'Finished the Keypass');
        if (g.orst) award('assess:voice', POINTS.voiceStation, 'Finished the Voice Station');
        if (g.wst) award('assess:spellscript', POINTS.spellscript, 'Finished Spellscript');
      }
      if (S) {
        if (S.gst) award('assess:keypass', POINTS.keypass, 'Finished the Keypass');
        if (S.orst) award('assess:voice', POINTS.voiceStation, 'Finished the Voice Station');
        if (S.wst) award('assess:spellscript', POINTS.spellscript, 'Finished Spellscript');
        const main = st.main?.program || null, mainDone = !!(main && S.dest[main]?.done);
        for (const d of DESTS) {
          const info = S.dest[d]; if (!info || !main) continue;
          const kind = sideKind(main, d);
          let mult = kind === 'main' ? 1 : mainDone ? POINTS.sideQuest[kind] : null;
          if (mult == null && st.preview === d && previewAllowed(st)) mult = 0;   // preview: plays, but no points
          if (mult == null) continue;
          if (kind !== 'main' && info.items.length) st.flags['side-start'] = st.flags['side-start'] || Date.now();
          const scale = POINTS.destinationTotal / Math.max(1, info.rawMax);
          const tag = kind === 'main' ? '' : mult === 0 ? ' (preview, no points)' : kind === 'challenge' ? ` (Challenge ×${POINTS.sideQuest.challenge})` : ` (Review ×${POINTS.sideQuest.review})`;
          for (const it of info.items) award(it.key, it.raw * scale * mult, it.reason + tag);
          if (info.done) st.flags['done-' + d] = st.flags['done-' + d] || Date.now();
        }
        if (mainDone) { award('main:done', POINTS.mainQuestFinished, `Finished your Main Quest (${NAMES[main]})`); st.mainDoneAt = st.mainDoneAt || Date.now() }
        if (S.post?.taken) {
          if (!st.postTest) {
            const pre = st.postTestStart || { percent: mainPercent(st), beforeDate: beforeDate(st) };
            st.postTest = { takenAt: Date.now(), percent: pre.percent, beforeDate: pre.beforeDate, pct: S.post.pct };
          }
          award('posttest:done', POINTS.postTest, 'Took the Post-Test');
          if (Number.isFinite(S.score) && S.post.pct != null) {
            const gain = Math.round(S.post.pct * 40 / 100) - S.score;
            st.postTest.gain = gain;
            if (gain > 0) award('posttest:improve', gain * POINTS.improvementPerPoint, `Post-Test improvement: +${gain} over the Keypass`);
          }
        }
      }
      const vault = readLS(vaultKey(), []) || [];
      vault.slice(0, POINTS.readingLab.wordVaultMax).forEach(v => award('vault:' + String(v.w).toLowerCase(), POINTS.readingLab.wordVaultWord, `Word Vault: “${v.w}”`));
      checkBadges(st);
    } finally { const s = st; st = null; save(s); afterChange() }
  }
  function mainPercent(s = load()) { const m = s.main?.program; return m && s.snap?.dest?.[m] ? s.snap.dest[m].pct : 0 }
  function beforeDate(s = load()) { const d = typeof s.postTestDate === 'string' ? s.postTestDate : null; return d ? daysUntil(d) > 0 : false }
  function markPostTestStart() { if (!isLearner()) return; const s = load(); if (s.postTest || s.postTestStart) return; s.postTestStart = { at: Date.now(), percent: mainPercent(s), beforeDate: beforeDate(s) }; save(s) }

  /* ---------- daily login and streaks ---------- */
  function login() {
    if (!isLearner()) return;
    st = load();
    try {
      const today = localDay(), days = st.loginDays;
      if (!days.includes(today)) {
        const last = days[days.length - 1];
        if (last && dayNumber(today) - dayNumber(last) >= 7) st.flags.comeback = st.flags.comeback || Date.now();
        days.push(today); while (days.length > 90) days.shift();
      }
      award('login:' + today, POINTS.dailyLogin, 'Daily login');
      const h = new Date().getHours();
      if (h >= 20 || h < 5) st.flags.night = st.flags.night || Date.now();
      if (h >= 5 && h < 7) st.flags.early = st.flags.early || Date.now();
      const run = streak(st), startDay = days[days.length - run];
      for (const [n, pts] of Object.entries(POINTS.streakBonus)) if (run >= Number(n)) award(`streak:${n}:${startDay}`, pts, `${n}-day login streak`);
      st.flags.bestStreak = Math.max(Number(st.flags.bestStreak) || 0, run);
      checkBadges(st);
    } finally { const s = st; st = null; save(s); afterChange() }
  }
  function streak(s = load()) {
    const days = s.loginDays; if (!days.length) return 0;
    let run = 1;
    for (let i = days.length - 1; i > 0; i--) { if (dayNumber(days[i]) - dayNumber(days[i - 1]) === 1) run++; else break }
    return dayNumber(localDay()) - dayNumber(days[days.length - 1]) <= 1 ? run : 0;
  }

  /* ---------- badges ---------- */
  const TIERS = { Bronze: 1, Silver: 2, Gold: 3, Legendary: 4 };
  const B = (id, cat, name, tier, icon, color, how, test, secret) => ({ id, cat, name, tier, icon, color, how, test, secret: !!secret });
  const done = (s, d) => !!(s.flags['done-' + d] || s.snap?.dest?.[d]?.done);
  const BADGES = [
    B('skill-reader', 'Skill', 'Reader', 'Silver', '📘', '#2f6fe0', 'Finish the Keypass', s => !!(s.log['assess:keypass'])),
    B('skill-speaker', 'Skill', 'Speaker', 'Silver', '🎤', '#f08a24', 'Finish the Voice Station', s => !!(s.log['assess:voice'])),
    B('skill-writer', 'Skill', 'Writer', 'Silver', '✍️', '#8b4fd8', 'Finish Spellscript', s => !!(s.log['assess:spellscript'])),
    B('dest-aral', 'Destination', 'Catch-Up Conductor', 'Gold', '🚂', '#d9462b', 'Finish Catch-Up Express', s => done(s, 'aral')),
    B('dest-interv', 'Destination', 'Inkventure Voyager', 'Gold', '🖋️', '#1d8a8a', 'Finish Inkventure', s => done(s, 'interv')),
    B('dest-sra', 'Destination', 'Gem Collector', 'Gold', '💎', '#2e9e5b', 'Finish the READwy Reading Lab', s => done(s, 'sra')),
    B('streak-3', 'Streak', 'Warm Up', 'Bronze', '🔥', '#e8622c', 'Log in 3 days in a row', s => (s.flags.bestStreak || 0) >= 3),
    B('streak-7', 'Streak', 'On Track', 'Silver', '🔥', '#e8622c', 'Log in 7 days in a row', s => (s.flags.bestStreak || 0) >= 7),
    B('streak-14', 'Streak', 'Full Steam', 'Gold', '🔥', '#e8622c', 'Log in 14 days in a row', s => (s.flags.bestStreak || 0) >= 14),
    B('streak-30', 'Streak', 'Unstoppable', 'Legendary', '🔥', '#e8622c', 'Log in 30 days in a row', s => (s.flags.bestStreak || 0) >= 30),
    B('explorer-start', 'Explorer', 'Trailblazer', 'Bronze', '🧭', '#b7791f', 'Start a Side Quest', s => !!s.flags['side-start']),
    B('explorer-finish', 'Explorer', 'Grand Tourer', 'Gold', '🗺️', '#b7791f', 'Finish a Side Quest', s => !!s.main && DESTS.some(d => d !== s.main.program && done(s, d))),
    B('explorer-all', 'Explorer', 'World Traveler', 'Legendary', '🌍', '#b7791f', 'Finish all three destinations', s => DESTS.every(d => done(s, d))),
    B('improve-1', 'Improvement', 'On the Rise', 'Bronze', '📈', '#13a37f', 'Score higher on the Post-Test than on the Keypass', s => (s.postTest?.gain || 0) >= 1),
    B('improve-5', 'Improvement', 'Big Leap', 'Silver', '📈', '#13a37f', 'Gain 5 or more points on the Post-Test', s => (s.postTest?.gain || 0) >= 5),
    B('improve-10', 'Improvement', 'Sky High', 'Gold', '🚀', '#13a37f', 'Gain 10 or more points on the Post-Test', s => (s.postTest?.gain || 0) >= 10),
    B('improve-15', 'Improvement', 'Breakthrough', 'Legendary', '🚀', '#13a37f', 'Gain 15 or more points on the Post-Test', s => (s.postTest?.gain || 0) >= 15),
    B('points-500', 'Points', 'Point Collector', 'Bronze', '⭐', '#d4a017', 'Earn 500 points', s => total(s) >= 500),
    B('points-1000', 'Points', 'Point Gatherer', 'Silver', '⭐', '#d4a017', 'Earn 1,000 points', s => total(s) >= 1000),
    B('points-2500', 'Points', 'Point Champion', 'Gold', '🌟', '#d4a017', 'Earn 2,500 points', s => total(s) >= 2500),
    B('points-5000', 'Points', 'Point Legend', 'Legendary', '🌟', '#d4a017', 'Earn 5,000 points', s => total(s) >= 5000),
    B('secret-night', 'Secret', 'Night Owl', 'Silver', '🦉', '#3b3f8f', 'Practise after 8 in the evening', s => !!s.flags.night, true),
    B('secret-early', 'Secret', 'Early Bird', 'Silver', '🐦', '#e0a106', 'Practise before 7 in the morning', s => !!s.flags.early, true),
    B('secret-perfect', 'Secret', 'Perfect Ten', 'Gold', '🎯', '#c2185b', 'Get a perfect score on a task', s => !!s.flags.perfect, true),
    B('secret-words', 'Secret', 'Word Hoarder', 'Gold', '📚', '#6d4c41', 'Collect 25 words in your Word Vault', () => (readLS(vaultKey(), []) || []).length >= 25, true),
    B('secret-comeback', 'Secret', 'Comeback Kid', 'Bronze', '💪', '#00897b', 'Come back after a week away', s => !!s.flags.comeback, true)
  ];
  const BY_ID = Object.fromEntries(BADGES.map(b => [b.id, b]));
  let popQueue = [];
  function checkBadges(s) {
    for (const b of BADGES) {
      let ok = false; try { ok = !!b.test(s) } catch {}
      if (ok && !s.badges[b.id]) { s.badges[b.id] = Date.now(); popQueue.push(b.id) }
    }
  }
  const owned = (s = load()) => BADGES.filter(b => s.badges[b.id]);
  const hasTier = (s, tier) => owned(s).some(b => TIERS[b.tier] >= TIERS[tier]);
  const previewAllowed = s => hasTier(s, 'Gold');

  /* ---------- privileges ---------- */
  const FRAMES = [
    { id: 'none', name: 'Plain', need: null }, { id: 'bronze', name: 'Bronze frame', need: { tier: 'Bronze' } },
    { id: 'silver', name: 'Silver frame', need: { tier: 'Silver' } }, { id: 'gold', name: 'Gold frame', need: { tier: 'Gold' } },
    { id: 'legend', name: 'Legendary frame', need: { tier: 'Legendary' } }
  ];
  const THEMES = [
    { id: 'station', name: 'Station', need: null, swatch: '#3a5a40' }, { id: 'sunrise', name: 'Sunrise', need: { points: 500 }, swatch: 'linear-gradient(135deg,#ffb36b,#ff6f91)' },
    { id: 'ocean', name: 'Ocean', need: { badge: 'streak-7' }, swatch: 'linear-gradient(135deg,#5ee7df,#2f6fe0)' },
    { id: 'aurora', name: 'Aurora', need: { tier: 'Gold' }, swatch: 'linear-gradient(135deg,#7cf29c,#8b5cf6)' },
    { id: 'starlight', name: 'Starlight', need: { tier: 'Legendary' }, swatch: 'linear-gradient(135deg,#1b1f4b,#c9b6ff)' }
  ];
  const TITLES = [
    { id: 'passenger', name: 'Passenger', need: null }, { id: 'word-wizard', name: 'Word Wizard', need: { badge: 'skill-reader' } },
    { id: 'voice-victor', name: 'Voice Victor', need: { badge: 'skill-speaker' } }, { id: 'story-seeker', name: 'Story Seeker', need: { badge: 'skill-writer' } },
    { id: 'trailblazer', name: 'Trailblazer', need: { badge: 'explorer-start' } }, { id: 'streak-star', name: 'Streak Star', need: { badge: 'streak-7' } },
    { id: 'rising-star', name: 'Rising Star', need: { badge: 'improve-1' } }, { id: 'legend', name: 'Legend of the Line', need: { tier: 'Legendary' } }
  ];
  function needMet(s, need) {
    if (!need) return true;
    if (need.tier) return hasTier(s, need.tier);
    if (need.badge) return !!s.badges[need.badge];
    if (need.points) return total(s) >= need.points;
    return false;
  }
  const needText = need => !need ? '' : need.tier ? `Earn any ${need.tier} badge` : need.badge ? `Earn the ${BY_ID[need.badge]?.secret ? '???' : BY_ID[need.badge]?.name} badge` : `Earn ${need.points} points`;
  function tokens(s = load()) {
    const earned = Math.floor(total(s) / POINTS.hintTokenEvery) + owned(s).filter(b => TIERS[b.tier] >= TIERS.Gold).length;
    return { hint: Math.max(0, earned - (Number(s.tokensUsed.hint) || 0)) };
  }
  function useHintToken() { const s = load(); if (tokens(s).hint < 1) return false; s.tokensUsed.hint = (Number(s.tokensUsed.hint) || 0) + 1; save(s); afterChange(); return true }

  /* ---------- Firebase (points log, totals, badges, quest status) ---------- */
  let api = null, syncT = 0, stopWatch = null;
  function summary(s = load()) {
    const main = s.main?.program || null;
    const shop = readLS(PREFIX + 'badges_' + learnerKey(), {}) || {};
    const side = {};
    for (const d of DESTS) if (main && d !== main && s.snap?.dest?.[d]) side[d] = { kind: sideKind(main, d), percent: s.snap.dest[d].pct || 0 };
    return {
      totalPoints: total(s), spentPoints: Math.max(0, Number(shop.spent) || 0),
      badges: Object.keys(s.badges).filter(id => BY_ID[id]).concat((shop.owned || []).map(id => 'shop-' + id)).slice(0, 200),
      equipped: s.equipped, tokens: tokens(s), mainQuest: main, mainQuestDone: !!(main && s.snap?.dest?.[main]?.done),
      mainQuestCompletionPercent: Math.max(0, Math.min(100, Number(mainPercent(s)) || 0)), sideQuests: side,
      wordVault: (readLS(vaultKey(), []) || []).slice(0, 500).map(v => String(v.w).slice(0, 40)), loginStreak: streak(s),
      postTestTaken: !!s.postTest,
      ...(s.postTest ? { postTestTakenBeforeDate: !!s.postTest.beforeDate, postTestMainQuestPercent: Math.max(0, Math.min(100, Number(s.postTest.percent) || 0)) } : {})
    };
  }
  function afterChange() {
    showPops();
    clearTimeout(syncT); syncT = setTimeout(sync, 2500);
  }
  async function sync() {
    if (!api || api.profile?.role !== 'student') return;
    const s = load();
    const pending = Object.entries(s.log).filter(([k]) => !s.synced[k]).map(([key, a]) => ({ key, amount: a.a, reason: a.r, localAt: new Date(a.t || Date.now()).toISOString() }));
    try {
      const saved = await api.saveQuestProgress(summary(s), pending);
      if (saved.length) { const n = load(); saved.forEach(k => { n.synced[k] = 1 }); writeLS(storeKey(), n) }
    } catch (e) { /* offline or rules not ready: try again on the next change */ }
  }
  async function connect() {
    if (!window.readwyFirebaseReady) return;
    try { api = await window.readwyFirebaseReady } catch { return }
    if (!api || api.profile?.role !== 'student') return;
    try {
      const remote = await api.loadQuestAwards();
      if (remote.length) {
        const s = load();
        for (const a of remote) { if (!a?.key) continue; if (!s.log[a.key]) s.log[a.key] = { a: Number(a.amount) || 0, r: a.reason || 'Points', t: Date.parse(a.localAt) || Date.now() }; s.synced[a.key] = 1 }
        checkBadges(s); save(s);
      }
    } catch {}
    try {
      stopWatch?.();
      stopWatch = api.watchSectionPostTestDate(({ postTestDate }) => {
        const s = load(); if (s.postTestDate === postTestDate) return;
        s.postTestDate = postTestDate; save(s);
        try { window.readwyJourneyGate?.publish?.() } catch {}
      });
    } catch {}
    afterChange();
  }

  /* ---------- pop-ups: badge earned, Main Quest finished ---------- */
  const css = document.createElement('style');
  css.textContent = `
.rwq-badge{--c:#2f6fe0;position:relative;display:grid;place-items:center;width:var(--s,74px);aspect-ratio:1;border-radius:50%;font-size:calc(var(--s,74px)*.42);line-height:1;isolation:isolate;
 background:radial-gradient(circle at 50% 38%,#fff 0 30%,color-mix(in srgb,var(--c) 18%,#fff) 31% 52%,var(--c) 53% 100%);box-shadow:0 0 0 calc(var(--s,74px)*.06) var(--rim),0 4px 10px rgba(0,0,0,.45)}
.rwq-badge>i{font-style:normal;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
.rwq-badge[data-tier=Bronze]{--rim:#c98a52}.rwq-badge[data-tier=Silver]{--rim:#cfd6df}.rwq-badge[data-tier=Gold]{--rim:#f2c94c}.rwq-badge[data-tier=Legendary]{--rim:#c9b6ff}
.rwq-badge[data-tier=Gold]::after,.rwq-badge[data-tier=Silver]::after{content:'';position:absolute;inset:0;border-radius:50%;z-index:-1;box-shadow:0 0 14px 2px var(--rim)}
.rwq-badge[data-tier=Legendary]::before{content:'';position:absolute;inset:calc(var(--s,74px)*-.1);border-radius:50%;z-index:-1;background:conic-gradient(#ff6f91,#ffd36b,#7cf29c,#5ee7df,#8b5cf6,#ff6f91);animation:rwqSpin 4s linear infinite;filter:blur(1px)}
.rwq-badge[data-tier=Legendary]::after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.75) 48%,transparent 60%) -150% 0/60% 100% no-repeat;animation:rwqShine 2.8s ease-in-out infinite}
.rwq-badge.locked{filter:grayscale(1) brightness(.7);opacity:.65}.rwq-badge.locked::before,.rwq-badge.locked::after{animation:none;display:none}
@keyframes rwqSpin{to{transform:rotate(1turn)}}@keyframes rwqShine{0%,35%{background-position-x:-150%}100%{background-position-x:250%}}
.rwq-pop{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));z-index:2147482000;translate:-50% 0;display:flex;align-items:center;gap:14px;width:min(92vw,420px);box-sizing:border-box;padding:12px 18px 12px 12px;border-radius:18px;
 background:linear-gradient(180deg,#1f5c40,#0b2f1f);color:#fff3c8;box-shadow:inset 0 0 0 2px #c9a14a,0 14px 30px rgba(0,0,0,.55);font:600 14px/1.35 system-ui,sans-serif;animation:rwqPop .7s cubic-bezier(.2,1.5,.4,1)}
.rwq-pop b{display:block;font:800 17px/1.2 Georgia,serif;color:#ffe9a8}.rwq-pop small{display:block;color:#e9c46a;letter-spacing:.12em;font-weight:800;font-size:11px;text-transform:uppercase}
.rwq-pop .rwq-badge{flex:none;--s:64px;animation:rwqBadgeIn 1s cubic-bezier(.2,1.6,.4,1)}
.rwq-pop.out{animation:rwqOut .35s ease-in forwards}
@keyframes rwqPop{from{opacity:0;transform:translateY(-30px) scale(.9)}}@keyframes rwqOut{to{opacity:0;transform:translateY(-20px)}}
@keyframes rwqBadgeIn{0%{transform:scale(.2) rotate(-40deg)}60%{transform:scale(1.15) rotate(8deg)}100%{transform:none}}
.rwq-confetti{position:fixed;inset:0;pointer-events:none;z-index:2147481999;overflow:hidden}
.rwq-confetti i{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;animation:rwqFall linear forwards}
@keyframes rwqFall{to{transform:translateY(110vh) rotate(720deg)}}
.rwq-celebrate{position:fixed;inset:0;z-index:2147482100;display:grid;place-items:center;padding:16px;background:rgba(8,6,2,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:rwqFade .4s ease}
.rwq-card{width:min(94vw,520px);max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:clamp(16px,3vh,28px);border-radius:22px;text-align:center;color:#2b1d07;
 background:radial-gradient(ellipse at 50% 0%,#fffaf0,#f6e7c4);box-shadow:inset 0 0 0 3px #c9a14a,inset 0 0 0 7px #fff6e0,inset 0 0 0 8px rgba(201,161,74,.6),0 24px 50px rgba(0,0,0,.6);font:500 15px/1.45 system-ui,sans-serif;animation:rwqPop .6s cubic-bezier(.2,1.4,.4,1)}
.rwq-card h2{margin:.2em 0 .3em;font:800 clamp(22px,4vh,30px)/1.15 Georgia,serif;color:#0f3a27}
.rwq-card .rwq-trophy{font-size:clamp(46px,9vh,72px);line-height:1;animation:rwqBadgeIn 1s cubic-bezier(.2,1.6,.4,1)}
.rwq-actions{display:grid;gap:10px;margin-top:16px}
.rwq-btn{min-height:46px;padding:10px 16px;border:0;border-radius:999px;cursor:pointer;font:800 16px/1.2 system-ui,sans-serif;touch-action:manipulation}
.rwq-btn.primary{background:linear-gradient(180deg,#2f8a5a,#0f3a27);color:#ffe9a8;box-shadow:inset 0 0 0 2px #c9a14a,0 6px 14px rgba(0,0,0,.35)}
.rwq-btn.light{background:linear-gradient(180deg,#fff3c8,#e9c46a);color:#3b2604;box-shadow:inset 0 0 0 2px #a8761e}
@keyframes rwqFade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.rwq-badge::before,.rwq-badge::after,.rwq-pop,.rwq-card,.rwq-confetti{animation:none!important}}`;
  (document.head || document.documentElement).append(css);
  function badgeHTML(b, opts = {}) {
    const hidden = b.secret && opts.locked;
    return `<span class="rwq-badge${opts.locked ? ' locked' : ''}" data-tier="${b.tier}" style="--c:${b.color};${opts.size ? `--s:${opts.size}px` : ''}" aria-hidden="true"><i>${hidden ? '❔' : b.icon}</i></span>`;
  }
  function confetti(n = 60) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'rwq-confetti';
    const colors = ['#f2c94c', '#ff6f91', '#5ee7df', '#7cf29c', '#8b5cf6', '#ff9f43'];
    for (let i = 0; i < n; i++) { const c = document.createElement('i'); c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length]; c.style.animationDuration = (1.8 + Math.random() * 1.8) + 's'; c.style.animationDelay = Math.random() * .6 + 's'; box.append(c) }
    document.body.append(box); setTimeout(() => box.remove(), 4500);
  }
  function chime() {
    try {
      if (typeof readwyCanPlaySound === 'function' && !readwyCanPlaySound()) return;
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const a = chime.ac = chime.ac || new A(); if (a.state === 'suspended') a.resume();
      const t = a.currentTime; [784, 988, 1319].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * .1); g.gain.linearRampToValueAtTime(.09, t + i * .1 + .02); g.gain.exponentialRampToValueAtTime(.001, t + i * .1 + .5); o.connect(g).connect(a.destination); o.start(t + i * .1); o.stop(t + i * .1 + .55) });
    } catch {}
  }
  let popping = false;
  function showPops() {
    if (popping || !document.body || document.hidden || window.top !== window && document.visibilityState !== 'visible') return;
    const s = load();
    const next = BADGES.find(b => s.badges[b.id] && !s.seen[b.id]);
    if (!next) return;
    // Only one page (the top one) shows pop-ups.
    try { if (window.top !== window && window.top.READwyQuests) return } catch {}
    popping = true;
    s.seen[next.id] = Date.now(); writeLS(storeKey(), s);
    const el = document.createElement('div'); el.className = 'rwq-pop'; el.setAttribute('role', 'status');
    el.innerHTML = `${badgeHTML(next)}<span><small>New badge · ${next.tier}</small><b>${esc(next.name)}</b>${esc(next.how)}</span>`;
    document.body.append(el); confetti(40); chime();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); popping = false; showPops() }, 380) }, 3800);
  }
  function celebrate(program) {
    const s = load(); if (s.celebrated || document.querySelector('.rwq-celebrate')) return;
    s.celebrated = Date.now(); save(s);
    const wrap = document.createElement('div'); wrap.className = 'rwq-celebrate'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Main Quest complete');
    wrap.innerHTML = `<div class="rwq-card"><div class="rwq-trophy" aria-hidden="true">🏆</div><h2>Main Quest complete!</h2>
<p>You finished <b>${esc(NAMES[program])}</b>. +${POINTS.mainQuestFinished} points!</p>
<p>The Post-Test is now open. The other two destinations are open too, as <b>Side Quests</b> for extra points and badges.</p>
<div class="rwq-actions"><button class="rwq-btn primary" type="button" data-go="post">Take Post-Test (recommended)</button><button class="rwq-btn light" type="button" data-go="explore">Explore Other Destinations</button></div></div>`;
    document.body.append(wrap); confetti(90); chime();
    wrap.querySelector('[data-go=post]').focus({ preventScroll: true });
    wrap.addEventListener('click', e => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      wrap.remove();
      if (b.dataset.go === 'post') {
        if (typeof window.openModule === 'function' && document.querySelector('#app,.app,main')) { try { window.openModule('reports'); return } catch {} }
        location.href = 'index.html?journeyModule=reports';
      } else if (!/view=map/.test(location.search)) location.href = 'index.html?view=map';
    });
  }

  /* ---------- running ---------- */
  const isApp = () => typeof window.readwyJourneyGate === 'object';
  function tick() {
    if (!isLearner()) return;
    if (isApp()) { const snap = collect(); if (snap) scan(snap) } else scan(null);
    const s = load(), main = s.main?.program;
    if (main && s.snap?.dest?.[main]?.done && !s.celebrated) {
      // Learners who finished before this feature existed are not interrupted by a late celebration.
      if (s.mainDoneAt && Date.now() - s.mainDoneAt < 7 * 864e5) celebrate(main); else { s.celebrated = Date.now(); save(s) }
    }
  }
  function start() {
    if (!isLearner()) return;
    login();
    tick();
    connect();
    setInterval(() => { if (!document.hidden) tick() }, 6000);
    addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); showPops() } });
    // Inkventure hints: use a hint token first (before Bonus Game credits or reward points).
    const wrapHint = () => {
      const orig = window.ivBuyHint; if (typeof orig !== 'function' || orig.rwq) return;
      window.ivBuyHint = function (id) {
        try { const w = typeof ivWallet === 'function' && ivWallet(); if (w && w.hasHint && w.hasHint(id)) return orig.apply(this, arguments) } catch {}
        if (useHintToken()) return { ok: true, how: '1 hint token' };
        return orig.apply(this, arguments);
      };
      window.ivBuyHint.rwq = true;
    };
    wrapHint(); addEventListener('load', wrapHint);
    // The moment a learner opens the Post-Test: remember their Main Quest progress and whether it was before the date.
    const wrapOpen = () => {
      const orig = window.openModule; if (typeof orig !== 'function' || orig.rwq) return;
      window.openModule = function (mod) { if (mod === 'reports') markPostTestStart(); return orig.apply(this, arguments) };
      Object.assign(window.openModule, orig); window.openModule.rwq = true;
    };
    addEventListener('load', () => setTimeout(wrapOpen, 0));
    if (/journeyModule=reports/.test(location.search)) markPostTestStart();
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();

  window.READwyQuests = {
    POINTS, NAMES, BADGES, FRAMES, THEMES, TITLES, TIERS,
    awardPoints, rules, mainQuestFor, sideKind, postTestDate, daysUntil, fmtDate, dateArrived,
    load, save, total, tokens, useHintToken, streak, owned, needMet, needText, badgeHTML, previewAllowed,
    collect, scan, tick, summary, sync, celebrate, confetti, learnerKey, vaultKey, isLearner, esc,
    setPostTestDateLocal(date) { const s = load(); s.postTestDate = date; save(s) }
  };
})();
