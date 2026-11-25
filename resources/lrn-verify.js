/* Learner sign-up: the LRN must belong to the chosen grade and section, and one LRN = one account.

   The school's class lists ("Section Names" folder) are imported into Firestore by
   scripts/import-section-lists.cjs. On the sign-up form a learner chooses GRADE and SECTION and types
   the LRN; if that section has a list, the app looks up exactly that one learner and asks
   "Is this you?" with the learner's own name (class lists can never be browsed). Only after
   "Yes, that's me" can the account be created, and the name fields are filled from the list.
   Sections without a list yet (for now Grades 9, 11, 12 except Grade 9 Open High) sign up unchecked.

   Every learner account claims its LRN on the server (lrnClaims / lrnOwners, see firestore.rules):
   a second account with the same LRN is refused, and the half-made account is removed again.
   Teacher sign-up and the developer view are not affected. */
(() => {
  const API_KEY = 'AIzaSyADjYOGoVAoFR6IkTbP_U2D_RYMpZeIrFI';
  const DOCS = 'https://firestore.googleapis.com/v1/projects/readwy-bda35/databases/readwy-records/documents';
  const IDT = 'https://identitytoolkit.googleapis.com/v1/accounts';
  const MAX_MISSES = 5, COOL_DOWN_MS = 60000;
  const sectionKey = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const role = () => { try { return readwyRole; } catch { return ''; } }; // eslint-disable-line no-undef
  const isStudentSignup = form => role() !== 'teacher' && !!form?.elements?.lrn && !form.elements.lrn.disabled;

  // Obvious made-up LRNs: one repeated digit, or a straight run like 123456789012.
  function fakeLrn(lrn) {
    if (/^(\d)\1{11}$/.test(lrn)) return true;
    const up = '012345678901234567890', down = '987654321098765432109';
    return up.includes(lrn) || down.includes(lrn);
  }

  /* ---------- Firestore lookups (one document at a time; lists are never readable) ---------- */
  const directory = new Map();
  async function listedSections(grade) {
    if (!directory.has(grade)) {
      directory.set(grade, fetch(`${DOCS}/sectionDirectory/g${grade}?key=${API_KEY}`)
        .then(r => (r.ok ? r.json() : null))
        .then(d => new Set((d?.fields?.sections?.arrayValue?.values || []).map(v => v.stringValue)))
        .catch(() => { directory.delete(grade); return null; }));
    }
    return directory.get(grade);
  }
  async function findLearner(grade, section, lrn) {
    const id = `g${grade}-${sectionKey(section)}-${lrn}`;
    const res = await fetch(`${DOCS}/sectionLearners/${id}?key=${API_KEY}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Cannot reach the class list right now. Check your connection and try again.');
    const f = (await res.json()).fields || {};
    const s = k => f[k]?.stringValue || '';
    return { id, name: s('name'), lastName: s('lastName'), firstName: s('firstName'), middleInitial: s('middleInitial') };
  }

  /* ---------- the "Is this you?" box ---------- */
  const style = document.createElement('style');
  style.textContent = `
.lrn-check{display:none;margin:2px 0 0;padding:8px 10px;border-radius:10px;font:600 12px/1.35 system-ui,sans-serif;text-align:left}
.lrn-check.show{display:block}
.lrn-check.ok{background:#e8f6ea;border:1px solid #2e8b4a;color:#14462a}
.lrn-check.ask{background:#fff6dc;border:1px solid #c9a14a;color:#3b2a08}
.lrn-check.bad{background:#fdeceb;border:1px solid #c0392b;color:#6b1a12}
.lrn-check.info{background:#eef3fb;border:1px solid #7f9cc9;color:#1d3557}
.lrn-check b{font-size:13px}
.lrn-check button{margin:6px 6px 0 0;padding:5px 10px;border-radius:999px;border:1px solid currentColor;background:#fff;color:inherit;font:700 12px system-ui,sans-serif;cursor:pointer}
.lrn-check button.yes{background:#2e8b4a;border-color:#2e8b4a;color:#fff}
#signup input[readonly]{background:#f1efe8!important;color:#3b3b3b!important}`;
  document.head.append(style);

  const state = { verified: null, listed: false, misses: 0, coolUntil: 0, seq: 0 };

  function box(form) {
    let b = form.querySelector('.lrn-check');
    if (!b) {
      b = document.createElement('div');
      b.className = 'lrn-check';
      b.setAttribute('role', 'status');
      b.setAttribute('aria-live', 'polite');
      const row = form.querySelector('.signup-school-row') || form.elements.lrn.closest('label');
      row.after(b);
    }
    return b;
  }
  function say(form, kind, html) {
    const b = box(form);
    b.className = 'lrn-check' + (kind ? ' show ' + kind : '');
    b.innerHTML = html || '';
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function lockNames(form, learner) {
    const f = form.elements;
    for (const [field, value] of [['lastName', learner?.lastName], ['firstName', learner?.firstName], ['middleInitial', learner?.middleInitial]]) {
      if (!f[field]) continue;
      if (learner) { f[field].value = value || ''; f[field].readOnly = true; }
      else f[field].readOnly = false;
    }
  }
  function reset(form) {
    if (state.verified) lockNames(form, null);
    state.verified = null;
  }

  async function check(form) {
    if (!isStudentSignup(form)) { say(form, ''); return; }
    const f = form.elements, lrn = String(f.lrn.value || '').replace(/\D/g, ''), grade = Number(f.grade?.value), section = f.section?.value || '';
    const run = ++state.seq;
    reset(form);
    if (lrn.length !== 12 || !grade || !section) { state.listed = false; say(form, ''); return; }
    if (fakeLrn(lrn)) { say(form, 'bad', 'That LRN does not look real. Type the 12-digit LRN written on your school records.'); return; }
    const sections = await listedSections(grade);
    if (run !== state.seq) return;
    state.listed = !!sections && sections.has(section);
    if (!state.listed) {
      say(form, 'info', `The Grade ${grade} – ${esc(section)} class list is not loaded yet, so your LRN will be saved and checked later.`);
      return;
    }
    if (Date.now() < state.coolUntil) {
      say(form, 'bad', 'Too many LRNs were not found. Please wait a minute, then check your LRN and section with your adviser.');
      return;
    }
    say(form, 'info', 'Checking your LRN on the class list…');
    let learner;
    try { learner = await findLearner(grade, section, lrn); }
    catch (e) { if (run === state.seq) say(form, 'bad', esc(e.message)); return; }
    if (run !== state.seq) return;
    if (!learner) {
      state.misses += 1;
      if (state.misses >= MAX_MISSES) { state.coolUntil = Date.now() + COOL_DOWN_MS; state.misses = 0; }
      say(form, 'bad', `This LRN is not on the Grade ${grade} – ${esc(section)} class list. Check your LRN, grade and section, or ask your adviser.`);
      return;
    }
    state.misses = 0;
    say(form, 'ask', `<b>Is this you?</b><br>${esc(learner.name)}<br><button type="button" class="yes">Yes, that's me</button><button type="button" class="no">No</button>`);
    const b = box(form);
    b.querySelector('.yes').onclick = () => {
      state.verified = { ...learner, lrn, grade, section };
      lockNames(form, learner);
      say(form, 'ok', `✔ Verified: ${esc(learner.name)} · Grade ${grade} – ${esc(section)}`);
    };
    b.querySelector('.no').onclick = () => say(form, 'bad', 'Then this LRN is not yours. Check your LRN and section, or ask your adviser.');
  }

  function attach(form) {
    if (!form || form.dataset.lrnVerify) return;
    form.dataset.lrnVerify = '1';
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(() => check(form), 350); };
    for (const name of ['lrn', 'grade', 'section']) {
      const el = form.elements[name];
      if (!el) continue;
      el.addEventListener('input', later);
      el.addEventListener('change', later);
    }
  }

  // Block "Create account" until a listed learner has confirmed "Yes, that's me" (runs before the form's own handler).
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form?.id !== 'signup' || !isStudentSignup(form)) return;
    const f = form.elements, lrn = String(f.lrn.value || '').replace(/\D/g, '');
    let problem = '';
    if (lrn.length === 12 && fakeLrn(lrn)) problem = 'That LRN does not look real. Type the 12-digit LRN written on your school records.';
    else if (state.listed && !(state.verified && state.verified.lrn === lrn && state.verified.section === f.section.value && state.verified.grade === Number(f.grade.value)))
      problem = 'Confirm your name first: check your LRN, grade and section, then press "Yes, that\'s me".';
    if (!problem) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    say(form, 'bad', esc(problem));
    if (typeof readwyStatus === 'function') readwyStatus(problem); // eslint-disable-line no-undef
  }, true);

  /* ---------- account creation with the LRN claim ---------- */
  async function idt(path, body) {
    const res = await fetch(`${IDT}:${path}?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = String(data.error?.message || '').split(' ')[0];
      const map = { EMAIL_EXISTS: 'auth/email-already-in-use', INVALID_EMAIL: 'auth/invalid-email', WEAK_PASSWORD: 'auth/weak-password', TOO_MANY_ATTEMPTS_TRY_LATER: 'auth/too-many-requests' };
      const err = new Error(data.error?.message || 'Could not create the account.');
      if (map[code]) err.code = map[code];
      throw err;
    }
    return data;
  }
  async function claim(idToken, uid, lrn, learnerId) {
    const name = p => DOCS.replace('https://firestore.googleapis.com/v1/', '') + p;
    const body = { writes: [
      { update: { name: name(`/lrnClaims/${lrn}`), fields: { uid: { stringValue: uid }, learnerId: { stringValue: learnerId } } },
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { exists: false } },
      { update: { name: name(`/lrnOwners/${uid}`), fields: { lrn: { stringValue: lrn } } },
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { exists: false } }
    ] };
    const res = await fetch(`${DOCS.replace(/\/documents$/, '')}/documents:commit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify(body)
    });
    if (res.ok) return;
    const data = await res.json().catch(() => ({}));
    const status = data.error?.status || '';
    if (status === 'ALREADY_EXISTS' || status === 'PERMISSION_DENIED' || status === 'FAILED_PRECONDITION')
      throw new Error('This LRN is already registered to another READwy account. If this is really your LRN, ask your adviser for help.');
    throw new Error('Could not save your LRN. Check your connection and try again.');
  }
  // Student accounts: create → claim the LRN (undo on failure) → send the verification email.
  async function createStudentAccount(email, password) {
    const form = document.getElementById('signup');
    const lrn = String(form?.elements?.lrn?.value || '').replace(/\D/g, '');
    if (lrn.length !== 12 || fakeLrn(lrn)) throw new Error('Type your real 12-digit LRN.');
    const v = state.verified;
    const learnerId = state.listed ? (v && v.lrn === lrn ? v.id : null) : `unlisted-${lrn}`;
    if (!learnerId) throw new Error('Confirm your name first: check your LRN, grade and section, then press "Yes, that\'s me".');
    const made = await idt('signUp', { email, password, returnSecureToken: true });
    try {
      await claim(made.idToken, made.localId, lrn, learnerId);
    } catch (error) {
      try { await idt('delete', { idToken: made.idToken }); } catch {}
      throw error;
    }
    try { await idt('sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: made.idToken }); } catch {}
    return { uid: made.localId, email };
  }
  function wrapAuth() {
    const auth = window.READwyAuth;
    if (!auth || auth.readwyLrnWrapped) return !!auth;
    const original = auth.createAccount;
    auth.createAccount = function (email, password) {
      const form = document.getElementById('signup');
      return isStudentSignup(form) ? createStudentAccount(email, password) : original.call(this, email, password);
    };
    auth.readwyLrnWrapped = true;
    return true;
  }

  function start() {
    attach(document.getElementById('signup'));
    if (!wrapAuth()) { const timer = setInterval(() => { if (wrapAuth()) clearInterval(timer); }, 200); setTimeout(() => clearInterval(timer), 30000); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.readwyLrnVerify = { fakeLrn, sectionKey };
})();
