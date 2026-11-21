/* One learner profile for every page.
   Sign-up saves the profile under the account email; every Profile button (GST book, ORST TV,
   InterV card, Student Profile page) reads and saves the same record through persistStudentProfile.
   This file keeps that record complete and consistent:
   - fills any missing detail from the sign-up record (teacher name, gender, section, names, photo);
   - keeps first name / last name / M.I. in step with the edited full name;
   - also stores edits under the sign-in email, so the next sign-in shows them even if the email field changed;
   - adds the Gender field to Profile forms that lack it, and makes Section a grade-based list;
   - keeps details when a Firebase session replaces the user, and when another tab saves. */
(() => {
  const prefix = () => (typeof STORE !== 'undefined' ? STORE : 'READwy_new_2026_local_');
  const getUser = () => (typeof user !== 'undefined' && user) || null;
  const filled = value => value !== undefined && value !== null && String(value).trim() !== '';
  const emailKey = value => String(value || '').trim().toLowerCase();
  const readJson = key => { try { return JSON.parse(localStorage.getItem(prefix() + key) || 'null'); } catch { return null; } };
  const writeJson = (key, value) => { try { localStorage.setItem(prefix() + key, JSON.stringify(value)); return true; } catch { return false; } };
  const profiles = () => readJson('studentProfiles') || {};
  const GENDERS = [['', 'Prefer not to say'], ['female', 'Female'], ['male', 'Male']];
  const normGender = value => { const v = emailKey(value); return /^(f|female|girl|babae)$/.test(v) ? 'female' : /^(m|male|boy|lalaki)$/.test(v) ? 'male' : ''; };

  // "Surname, First name M." -> parts (the format used by sign-up and every Profile form).
  function nameParts(name) {
    const [last, rest = ''] = String(name || '').split(',');
    const words = rest.trim().split(/\s+/).filter(Boolean);
    let middleInitial = '';
    if (words.length > 1 && /^[A-Za-z]{1,3}\.?$/.test(words[words.length - 1]) && (/\.$/.test(words[words.length - 1]) || words[words.length - 1].length === 1)) {
      middleInitial = words.pop().replace(/\./g, '').toUpperCase();
    }
    return { lastName: last.trim(), firstName: words.join(' '), middleInitial };
  }
  function withNames(profile) {
    const out = { ...profile };
    if (filled(out.name) && String(out.name).includes(',')) Object.assign(out, nameParts(out.name));
    else if (!filled(out.name) && (filled(out.lastName) || filled(out.firstName))) {
      out.name = `${out.lastName || ''}, ${out.firstName || ''}${out.middleInitial ? ' ' + out.middleInitial + '.' : ''}`.trim();
    }
    if (filled(out.gender)) out.gender = normGender(out.gender) || out.gender;
    return out;
  }
  // Values from `over` win only when they are not empty.
  function fillFrom(base, over) {
    const out = { ...(base || {}) };
    for (const [key, value] of Object.entries(over || {})) if (filled(value)) out[key] = value;
    return out;
  }
  function signupRecord(profile) {
    const all = profiles();
    return all[emailKey(profile.accountEmail)] || all[emailKey(profile.email)] || null;
  }
  function complete(profile) {
    if (!profile || profile.role === 'teacher') return profile;
    return withNames(fillFrom(signupRecord(profile), profile));
  }
  window.readwyCompleteProfile = complete;

  function refreshVisible(profile) {
    const header = document.querySelector('#xcStudent span');
    if (header) header.textContent = 'Student: ' + (profile.name || 'Guest Reader');
    document.dispatchEvent(new CustomEvent('readwy:profile-updated', { detail: profile }));
  }

  // 1. Every save goes through here.
  if (typeof persistStudentProfile === 'function') {
    const basePersist = persistStudentProfile;
    persistStudentProfile = function (profile) {
      const previous = getUser() || {};
      const account = emailKey(previous.accountEmail || previous.email || profile.accountEmail || profile.email);
      const full = withNames({ ...previous, ...profile });
      if (account) full.accountEmail = account;
      basePersist(full);
      if (account && account !== emailKey(full.email)) {
        const all = profiles();
        all[account] = full;
        writeJson('studentProfiles', all);
      }
      refreshVisible(full);
    };
  }

  // 2. On page load, fill the current learner from the sign-up record.
  const current = getUser();
  if (current && current.role !== 'teacher' && (filled(current.email) || filled(current.accountEmail))) {
    const fullProfile = complete(current);
    if (JSON.stringify(fullProfile) !== JSON.stringify(current)) {
      user = fullProfile;
      writeJson('user', fullProfile);
    }
  }

  // 3. A Firebase session replaces the user with fewer fields; keep the saved details.
  const baseFirebase = window.readwySetFirebaseSession;
  if (typeof baseFirebase === 'function') {
    window.readwySetFirebaseSession = (authUser, profile) => {
      baseFirebase(authUser, profile);
      const now = getUser();
      if (!now || now.role !== 'student') return;
      const stored = readJson('user');
      const same = stored && emailKey(stored.accountEmail || stored.email) === emailKey(now.email);
      user = complete(fillFrom(same ? stored : {}, now));
      writeJson('user', user);
    };
  }

  // 4. Another tab or app page saved the profile.
  window.addEventListener('storage', event => {
    if (event.key !== prefix() + 'user' || !event.newValue) return;
    try { user = JSON.parse(event.newValue); refreshVisible(user); } catch {}
  });

  // 5. Profile forms: add Gender where missing; Section becomes a list for the chosen grade.
  const sectionsFor = grade => (typeof readwyTPSectionsFor === 'function' ? readwyTPSectionsFor(grade) : []);
  function addGender(form, profile) {
    if (!form || form.elements.gender) return;
    const nameLabel = form.elements.name?.closest('label');
    const sectionLabel = form.elements.section?.closest('label');
    if (!nameLabel) return;
    const label = document.createElement('label');
    label.className = nameLabel.className;
    const caption = document.createElement('span');
    caption.textContent = 'Gender';
    const select = document.createElement('select');
    select.name = 'gender';
    const currentGender = normGender(profile.gender);
    for (const [value, text] of GENDERS) select.add(new Option(text, value, false, value === currentGender));
    label.append(caption, select);
    (sectionLabel || nameLabel).after(label);
  }
  function sectionList(form) {
    const input = form?.querySelector('input[name="section"]');
    const grade = form?.elements.grade;
    if (!input || !grade || !sectionsFor(7).length) return;
    const select = document.createElement('select');
    select.name = 'section';
    if (input.id) select.id = input.id;
    if (input.className) select.className = input.className;
    let currentSection = input.value.trim();
    const fill = () => {
      const names = sectionsFor(grade.value);
      const match = names.find(n => n.toLowerCase() === currentSection.toLowerCase());
      select.innerHTML = '';
      select.add(new Option(names.length ? 'Choose a section' : 'Choose a grade first', ''));
      for (const n of names) select.add(new Option(n, n, false, n === match));
      // Keep an older saved value (for example "A") visible until the learner picks a real section.
      if (currentSection && !match) select.add(new Option(currentSection, currentSection, false, true));
    };
    fill();
    select.addEventListener('change', () => { currentSection = select.value; });
    grade.addEventListener('change', () => { currentSection = ''; fill(); });
    input.replaceWith(select);
  }
  function upgrade(form) {
    if (!form || form.dataset.readwyProfileSync) return;
    form.dataset.readwyProfileSync = '1';
    const profile = complete(getUser() || {}) || {};
    addGender(form, profile);
    sectionList(form);
  }
  const wrapRender = (name, findForm) => {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function (...args) {
      const result = original.apply(this, args);
      try { upgrade(findForm(...args)); } catch (error) { console.error('Profile form sync failed', error); }
      return result;
    };
  };
  wrapRender('xgTicket', kind => (kind === 'profile' ? document.getElementById('xgTkForm') : null));
  wrapRender('ivRenderProfile', () => document.querySelector('.ivprof form'));
  wrapRender('renderProfile', () => document.querySelector('form.student-profile'));

  // Save handlers copy fields by hand; hand them the chosen gender first.
  const takeGender = form => {
    const u = getUser();
    if (u && form?.elements?.gender) u.gender = form.elements.gender.value;
  };
  document.addEventListener('submit', event => {
    if (event.target.id === 'xgTkForm' || event.target.classList?.contains('student-profile')) takeGender(event.target);
  }, true);
  document.addEventListener('click', event => {
    const saveButton = event.target.closest?.('.ivprof [data-save]');
    if (saveButton) takeGender(saveButton.closest('.ivprof')?.querySelector('form'));
  }, true);
})();
