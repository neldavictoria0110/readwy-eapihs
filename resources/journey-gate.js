/* Learning-journey order (Grades 7–10):
   Before the Reading Check-In: only the Reading Check-In is open.
   After the Reading Check-In is submitted: the Reading Check-In stays open to view results and edit the profile, but its answers
   are final (it cannot be retaken). ORST, WST and the one program that matches the Reading Check-In score open together:
     0–16 → Catch-Up Express, 17–27 → InterV (Intervention Program), 28–40 → SRA Program.
   The Post-Test opens only after every task in that program is finished.
   "Finished" uses each program's own completion rule:
     Catch-Up Express   – all 8 weeks done (aralWeekDone)
     InterV – all 25 station tasks complete (intervDashStats)
     SRA    – every text from the learner's starting level to the last level passed (quiz + writing).
   Grades 11–12 keep their existing rule (InterV and SRA only). The developer view is never locked.
   The result is also saved for the portrait journey map, which shows locks from it.

   Exploration period (School Year 2026–2027): until EXPLORE_UNTIL every learner, in any grade, may explore
   Catch-Up Express, InterV and SRA freely. Reading Check-In, ORST and WST stay visible but locked (they are taken at the opening of a
   school year). From EXPLORE_UNTIL (opening of SY 2027–2028) the Reading Check-In-score rules above apply again by themselves.
   Change EXPLORE_UNTIL here AND in journey-gate-map.js when DepEd announces the official opening date. */
(() => {
  const EXPLORE_UNTIL = Date.parse('2027-06-01T00:00:00+08:00');
  const exploring = () => Date.now() < EXPLORE_UNTIL;
  const EXPLORE_MESSAGE = 'The Reading Check-In, ORST and WST open at the start of School Year 2027–2028 (June 1, 2027). This school year, explore the Catch-Up Express, InterV and Reading Lab programs.';
  const PREFIX = typeof STORE !== 'undefined' ? STORE : 'READwy_new_2026_local_';
  const NAMES = {gst: 'Reading Check-In', orst: 'ORST', wst: 'WST', aral: 'Catch-Up Express', interv: 'InterV Program', sra: 'Reading Lab', reports: 'Post-Test'};
  const PROGRAMS = ['aral', 'interv', 'sra'];
  const currentUser = () => (typeof user !== 'undefined' && user) || null;
  const safe = (fn, fallback = false) => { try { return fn(); } catch { return fallback; } };
  function developerView() {
    const u = currentUser();
    return !!(u && u.dev) || safe(() => sessionStorage.getItem('readwy-dev-view') === '1');
  }
  function learnerKey(u = currentUser() || {}) {
    return String(u.id || u.lrn || u.email || 'local').trim().toLowerCase();
  }
  function withGrade(grade, fn) {
    if (typeof selectedGrade === 'undefined') return safe(fn);
    const previous = selectedGrade;
    try { selectedGrade = grade; return fn(); } catch { return false; } finally { selectedGrade = previous; }
  }
  function sraFinished() {
    return safe(() => {
      const P = JSON.parse(localStorage.getItem('sra-rw-journey-v1') || 'null');
      if (!P || !P.texts) return false;
      const start = Number(P.start ?? 0);
      for (let level = start; level < 6; level++) {
        for (let n = 1; n <= 10; n++) {
          const t = P.texts[`${7 + level}-${n}`];
          if (!(t && t.quizPassed && t.writing && t.writing.passed)) return false;
        }
      }
      return true;
    });
  }
  function programFor(score) {
    if (!Number.isFinite(score)) return null;
    return score <= 16 ? 'aral' : score <= 27 ? 'interv' : 'sra';
  }
  function status() {
    const u = currentUser() || {};
    const grade = Number(u.grade) || (typeof selectedGrade !== 'undefined' ? Number(selectedGrade) : 7);
    if (exploring()) {
      return {grade, exploring: true, open: {gst: false, orst: false, wst: false, aral: true, interv: true, sra: true, reports: false}};
    }
    if (grade >= 11) {
      return {grade, senior: true, open: {gst: false, orst: false, wst: false, aral: false, interv: true, sra: true, reports: false}};
    }
    const report = safe(() => load('assessment_' + grade, {}), {}) || {};
    const gst = report.status === 'submitted' && Number.isFinite(Number(report.score));
    const score = gst ? Number(report.score) : null;
    const orst = withGrade(grade, () => orstSavedPassages().length > 0 && orstSavedPassages().every(p => p.record));
    const wst = !!safe(() => load('wst_submission_' + grade, null), null);
    const program = programFor(score);
    const screened = gst && orst && wst;
    const programDone = !program ? false
      : program === 'aral' ? withGrade(grade, () => [1, 2, 3, 4, 5, 6, 7, 8].every(w => aralWeekDone(w)))
      : program === 'interv' ? safe(() => intervDashStats().pct >= 100)
      : sraFinished();
    const open = {
      // The Reading Check-In stays open after submission (results, profile and photo), but it cannot be retaken.
      gst: true,
      orst: gst,
      wst: gst,
      aral: gst && program === 'aral',
      interv: gst && program === 'interv',
      sra: gst && program === 'sra',
      reports: gst && programDone
    };
    return {grade, gst, orst, wst, score, program, screened, programDone, open};
  }
  function message(mod, s = status()) {
    if (s.exploring) return mod === 'reports'
      ? 'The Post-Test opens with the Reading Check-In at the start of School Year 2027–2028 (June 1, 2027).'
      : EXPLORE_MESSAGE;
    if (s.senior) return `For Grade ${s.grade}, the open journeys are InterV and Reading Lab.`;
    if (mod === 'gst') return `You have already taken the Reading Check-In (score ${s.score} of 40).`;
    if (!s.gst) return `Take the Reading Check-In first. Your ${NAMES[mod]} opens after you submit the Reading Check-In.`;
    if (PROGRAMS.includes(mod) || mod === 'reports') {
      if (mod === 'reports') return `The Post-Test opens after you finish every task in the ${NAMES[s.program]}.`;
      return `Your Reading Check-In score is ${s.score} of 40, so your journey is the ${NAMES[s.program]}. Only that program is open for you.`;
    }
    return 'This stage is not open yet.';
  }
  function allows(mod) {
    const key = mod === 'srst' ? 'wst' : mod;
    if (developerView() || !(key in NAMES)) return {ok: true};
    if (safe(() => currentUser()?.role === 'teacher')) return {ok: true}; // teachers open every stage (the Post-Test route is their dashboard)
    const s = status();
    return s.open[key] ? {ok: true} : {ok: false, message: message(key, s)};
  }
  // Saved for the portrait journey map (a separate page that cannot run these checks itself).
  function publish() {
    const u = currentUser();
    if (!u || u.role === 'teacher') return;
    const s = status();
    const messages = Object.fromEntries(Object.keys(NAMES).map(k => [k, s.open[k] ? '' : message(k, s)]));
    safe(() => localStorage.setItem(PREFIX + 'journey_gate_' + learnerKey(u), JSON.stringify({...s, messages, updatedAt: Date.now()})));
  }
  function notify(text) {
    if (typeof showPageStatus === 'function') { try { showPageStatus(text); return; } catch {} }
    window.alert(text);
  }
  window.readwyJourneyGate = {status, allows, message, publish, programFor, learnerKey, exploring};

  // In-app entries to a journey.
  const guard = (name, moduleOf) => {
    const original = window[name];
    if (typeof original !== 'function' || original.readwyGated) return;
    window[name] = function (...args) {
      const check = allows(moduleOf(...args));
      if (!check.ok) { notify(check.message); return; }
      return original.apply(this, args);
    };
    window[name].readwyGated = true;
  };
  const installGuards = () => {
    guard('openModule', mod => mod);
    guard('openWST', () => 'wst');
    guard('startORSTSpell', () => 'orst');
  };
  installGuards();
  window.addEventListener('load', () => { installGuards(); publish(); }, {once: true});

  // Keep the map's copy up to date whenever progress is saved.
  // A submitted Reading Check-In is final: its answers and score cannot be changed or submitted again.
  function gstLocked(key, value) {
    const m = /^(answer|assessment)_(\d+)$/.exec(String(key));
    if (!m || developerView()) return false;
    const report = safe(() => load('assessment_' + m[2], {}), {}) || {};
    if (!(report.status === 'submitted' && Number.isFinite(Number(report.score)))) return false;
    if (m[1] === 'answer') return true;
    // Extra details (for example the time taken) may still be added to the submitted record.
    const v = value || {};
    return v.status !== 'submitted' || Number(v.score) !== Number(report.score) ||
      JSON.stringify(v.submittedAnswers || null) !== JSON.stringify(report.submittedAnswers || null);
  }
  window.readwyGstLocked = gstLocked;
  let timer = 0;
  if (typeof save === 'function') {
    const baseSave = save;
    save = function (...args) {
      if (gstLocked(args[0], args[1])) return;
      const result = baseSave.apply(this, args);
      clearTimeout(timer);
      timer = setTimeout(publish, 400);
      return result;
    };
  }
  window.addEventListener('pagehide', publish);
  publish();
})();
