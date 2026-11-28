/* Sign-up sections, typed by the user (no school section list):
   - Student: Section is a text box (only Grade and Gender are lists).
   - Teacher: each row is Grade (list) + Section (typed) + Class code (typed, required). A row must be complete before
     another can be added, and every code on the form must be different. The codes are saved with the sections on
     the teacher's first verified sign-in; READwy then makes sure no two sections anywhere share a code. */
(() => {
  const form = () => document.getElementById('signup');
  const CODE = /^[A-Z0-9]{4,10}$/;
  const say = text => { try { typeof readwyStatus === 'function' ? readwyStatus(text) : 0 } catch {} };
  const cleanCode = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const css = document.createElement('style');
  css.textContent = `
#signup .teacher-section-row{grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr) minmax(0,1fr) 26px!important}
#signup .teacher-section-head{grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr) minmax(0,1fr) 26px!important}
#signup .teacher-section-row input{min-width:0;width:100%;box-sizing:border-box}
@media (max-width:480px){#signup .teacher-section-row,#signup .teacher-section-head{grid-template-columns:minmax(74px,.95fr) minmax(0,1.05fr) minmax(0,.95fr) 24px!important;gap:5px!important}#signup .teacher-section-row select,#signup .teacher-section-row input{font-size:12px!important;padding-left:6px!important;padding-right:4px!important}}
#signup .teacher-code{text-transform:uppercase;letter-spacing:.08em;font-weight:700}
#signup .teacher-code.bad,#signup .teacher-section.bad{outline:2px solid #c0392b;outline-offset:-1px}
#signup .teacher-code.good{outline:2px solid #2e8b4a;outline-offset:-1px}
/* Student form: 7 equal rows now (Class code added under Name of teacher), with one even gap between them. */
#signup:not(.is-teacher) .signup-fields{grid-template-rows:repeat(7,minmax(0,1fr))!important;row-gap:clamp(5px,1.2dvh,12px)!important}
#signup .student-code-field input{text-transform:uppercase;letter-spacing:.08em;font-weight:700}
#signup .student-code-field input::placeholder{text-transform:none;letter-spacing:normal;font-weight:400}
@media (max-height:500px){#signup:not(.is-teacher) .signup-fields{row-gap:3px!important}}
#signup:not(.is-teacher) .signup-fields>label:not([hidden]):not([data-teacher-only]){display:flex;flex-direction:column;justify-content:flex-end}
`;
  document.head.append(css);

  // Student: Section is typed.
  function studentSectionBox(f) {
    const old = f?.querySelector('select[name="section"]');
    if (!old) return;
    const input = document.createElement('input');
    input.name = 'section'; input.type = 'text'; input.required = true; input.maxLength = 60;
    input.placeholder = 'Section'; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Section');
    if (old.value) input.value = old.value;
    old.replaceWith(input);
  }

  // Student: the class code from the teacher, under "Name of teacher". It joins the student to that section.
  function studentCodeBox(f) {
    if (!f || f.querySelector('input[name="classCode"]')) return;
    const teacher = f.querySelector('input[name="teacherName"]')?.closest('label');
    if (!teacher) return;
    const label = document.createElement('label');
    label.setAttribute('data-student-only', ''); label.className = 'student-code-field';
    label.innerHTML = 'CLASS CODE<input name="classCode" required maxlength="24" placeholder="Code from your teacher" autocomplete="off" autocapitalize="characters" spellcheck="false" title="The class code your teacher gave you (for example RIZAL7)">';
    if (teacher.hidden) label.hidden = true;
    teacher.after(label);
    const box = label.querySelector('input');
    box.addEventListener('input', () => { const p = box.selectionStart; box.value = box.value.replace(/\s+/g, '').toUpperCase(); try { box.setSelectionRange(p, p) } catch {} box.setCustomValidity(''); say('') });
  }

  // Teacher: Grade + Section + Code rows.
  const grades = () => (typeof READWY_GRADES !== 'undefined' && Array.isArray(READWY_GRADES) ? READWY_GRADES : [7, 8, 9, 10]);
  function rows() { return [...document.querySelectorAll('#teacherSectionRows .teacher-section-row')] }
  function rowProblem(row, all = rows()) {
    const grade = row.querySelector('.teacher-grade'), section = row.querySelector('.teacher-section'), code = row.querySelector('.teacher-code');
    if (!grade.value) return [grade, 'Choose the grade level for this section.'];
    if (!section.value.trim()) return [section, 'Type the section name.'];
    const c = cleanCode(code.value);
    if (!c) return [code, 'Give this section a class code (4–10 letters or numbers).'];
    if (!CODE.test(c)) return [code, 'A class code has 4–10 letters or numbers, with no spaces.'];
    if (all.some(r => r !== row && cleanCode(r.querySelector('.teacher-code').value) === c)) return [code, `The code ${c} is already used for another section. Each section needs its own code.`];
    const key = `${grade.value}|${section.value.trim().toLowerCase()}`;
    if (all.some(r => r !== row && `${r.querySelector('.teacher-grade').value}|${r.querySelector('.teacher-section').value.trim().toLowerCase()}` === key)) return [section, 'This section is already in your list.'];
    return null;
  }
  function mark(row) {
    const code = row.querySelector('.teacher-code'), c = cleanCode(code.value);
    const dup = c && rows().some(r => r !== row && cleanCode(r.querySelector('.teacher-code').value) === c);
    code.classList.toggle('bad', !!c && (!CODE.test(c) || dup));
    code.classList.toggle('good', CODE.test(c) && !dup);
    code.setCustomValidity(!c ? 'Give this section a class code.' : !CODE.test(c) ? 'Use 4–10 letters or numbers.' : dup ? 'Each section needs its own code.' : '');
  }
  function newRow() {
    const list = document.getElementById('teacherSectionRows');
    const n = list.children.length + 1;
    const row = document.createElement('div'); row.className = 'teacher-section-row';
    row.innerHTML = `<select class="teacher-grade" required aria-label="Grade level, row ${n}"><option value="" disabled selected>Grade</option>${grades().map(g => `<option value="${g}">Grade ${g}</option>`).join('')}</select>` +
      `<input class="teacher-section" type="text" required maxlength="60" placeholder="Section" autocomplete="off" aria-label="Section name, row ${n}">` +
      `<input class="teacher-code" type="text" required maxlength="10" placeholder="Code" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Class code for this section, row ${n}" title="4–10 letters or numbers, e.g. RIZAL7">` +
      `<button type="button" class="teacher-section-remove" aria-label="Remove section, row ${n}">×</button>`;
    const code = row.querySelector('.teacher-code');
    code.addEventListener('input', () => { const p = code.selectionStart; code.value = cleanCode(code.value); try { code.setSelectionRange(p, p) } catch {} rows().forEach(mark); say('') });
    row.querySelector('.teacher-section').addEventListener('input', () => say(''));
    row.querySelector('.teacher-grade').addEventListener('change', () => say(''));
    row.querySelector('.teacher-section-remove').addEventListener('click', () => {
      if (rows().length <= 1) { row.querySelectorAll('input').forEach(i => { i.value = '' }); row.querySelector('select').selectedIndex = 0; rows().forEach(mark); return }
      row.remove(); rows().forEach(mark); say('');
    });
    list.append(row); mark(row);
    return row;
  }
  // "+ Add section": only after the last row is complete.
  window.addTeacherSectionRow = function () {
    const list = document.getElementById('teacherSectionRows'); if (!list) return;
    if (list.children.length >= 30) { say('You can add up to 30 sections.'); return }
    const last = rows().at(-1);
    if (last) { const p = rowProblem(last); if (p) { say(p[1]); p[0].focus({ preventScroll: true }); p[0].reportValidity?.(); return } }
    const row = newRow();
    if (rows().length > 1) { row.scrollIntoView({ block: 'nearest' }); row.querySelector('select').focus({ preventScroll: true }) }
  };
  window.syncTeacherSectionRow = function () {};
  window.readTeacherSections = function () {
    return rows().map(r => ({ grade: Number(r.querySelector('.teacher-grade').value), section: r.querySelector('.teacher-section').value.trim(), code: cleanCode(r.querySelector('.teacher-code').value) }));
  };
  function teacherRows() {
    const list = document.getElementById('teacherSectionRows'); if (!list) return;
    const head = document.querySelector('.teacher-section-head');
    if (head && !head.querySelector('.code-head')) { const s = document.createElement('span'); s.className = 'code-head'; s.textContent = 'CODE'; head.append(s) }
    if (!rows().some(r => r.querySelector('.teacher-code'))) { list.innerHTML = ''; newRow() }
  }
  // Teacher sign-up is checked before it is sent: every row complete, every code valid and different.
  document.addEventListener('submit', event => {
    const f = event.target;
    if (f?.id === 'signup' && !f.classList.contains('is-teacher')) {
      const box = f.querySelector('input[name="classCode"]');
      if (!box || box.disabled || box.closest('[hidden]')) return;
      const code = box.value.replace(/\s+/g, '');
      const ok = /^[A-Z0-9]{4,10}$/i.test(code) || /^[a-f0-9]{24}$/i.test(code);
      if (!ok) { event.preventDefault(); event.stopImmediatePropagation(); box.setCustomValidity('Type the class code from your teacher (4–10 letters or numbers).'); box.reportValidity(); say('Type the class code from your teacher.'); return }
      // Kept for the first sign-in, which joins the student to that section (resources/firebase-client.js).
      try {
        const email = String(f.elements.email?.value || '').trim().toLowerCase(), k = 'READwy_new_2026_local_pending_class_codes';
        const pending = JSON.parse(localStorage.getItem(k) || '{}'); pending[email] = /^[a-f0-9]{24}$/i.test(code) ? code.toLowerCase() : code.toUpperCase();
        localStorage.setItem(k, JSON.stringify(pending));
      } catch {}
      return;
    }
    if (f?.id !== 'signup' || !f.classList.contains('is-teacher')) return;
    for (const row of rows()) {
      const p = rowProblem(row);
      if (p) { event.preventDefault(); event.stopImmediatePropagation(); say(p[1]); p[0].focus({ preventScroll: true }); return }
    }
  }, true);

  const init = () => { studentSectionBox(form()); studentCodeBox(form()); teacherRows() };
  init();
  addEventListener('load', init);
  // The form is redrawn when the role changes: keep the typed fields.
  const f0 = form();
  if (f0) new MutationObserver(() => { if (f0.querySelector('select[name="section"]') || !f0.querySelector('input[name="classCode"]') || (document.getElementById('teacherSectionRows') && !rows().some(r => r.querySelector('.teacher-code')))) init() }).observe(f0, { childList: true, subtree: true });
})();
