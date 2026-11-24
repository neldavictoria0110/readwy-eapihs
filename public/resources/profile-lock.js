/* The learner's details and photo come from sign-up and can be changed only in the Reading Check-In profile.
   Every other journey (ORST, WST, Aral, InterV, SRA, post-test and the Student Profile page) shows the
   same details read-only: fields cannot be typed in, there is no Upload photo and no Save button. */
(() => {
  const NOTE = '🔒 These details come from your sign-up. You can change them, and your photo, only in the Reading Check-In profile.';
  const isORST = () => !!document.querySelector('.xo,.xc');
  const inGST = () => !isORST() && !!document.querySelector('.gst-book-screen,.xg-bookzone');
  window.readwyProfileEditable = inGST;

  const style = document.createElement('style');
  style.textContent = `
.rw-locked input[readonly],.rw-locked select:disabled{cursor:default;opacity:1;color:inherit;-webkit-text-fill-color:currentColor;box-shadow:none}
.rw-locked select:disabled{appearance:none;-webkit-appearance:none;background-image:none}
.rw-locked input[readonly]:focus{outline:none}
.rw-lock-note{margin:.4em 0;font:italic 600 .92em/1.35 Georgia,serif;color:#7a5a12}`;
  document.head.append(style);

  const FORMS = '#xgTkForm.xg-tk-fields, form.student-profile, .gst-utility-form, .ivprof form, form[onsubmit*="saveProfile"]';
  function lock(form) {
    if (form.dataset.rwLocked) return;
    form.dataset.rwLocked = '1';
    form.classList.add('rw-locked');
    for (const field of form.querySelectorAll('input,select,textarea')) {
      if (field.type === 'file') continue;
      if (field.tagName === 'SELECT') field.disabled = true; else field.readOnly = true;
      field.setAttribute('aria-readonly', 'true');
    }
    const root = form.closest('.xg-tk, .ivx-in') || form.parentElement || form;
    // no photo upload, no save
    root.querySelectorAll('.xg-tk-up, label[for="profilePhoto"], #profilePhoto, #photoStatus, .xg-tk-save, [data-save], button[type="submit"]').forEach(node => node.remove());
    form.querySelectorAll('button[type="submit"], .btn').forEach(node => node.remove());
    const status = root.querySelector('#xgTkStatus, .ivx-msg');
    if (status) status.textContent = NOTE;
    else if (!form.querySelector('.rw-lock-note')) {
      const note = document.createElement('p');
      note.className = 'rw-lock-note';
      note.textContent = NOTE;
      form.prepend(note);
    }
    const head = root.querySelector('.ivx-meta span');
    if (head) head.textContent = 'Your details from sign-up.';
    const tip = document.getElementById('xoTip');
    if (tip && root.classList?.contains('xg-tk')) tip.textContent = 'These are your sign-up details. Change them in the Reading Check-In profile.';
  }
  let queued = false;
  const scan = () => {
    queued = false;
    if (inGST()) return;
    document.querySelectorAll(FORMS).forEach(lock);
  };
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(scan); } })
    .observe(document.documentElement, {childList: true, subtree: true});

  // A locked form never saves, even if a save is triggered some other way.
  document.addEventListener('submit', event => {
    if (event.target?.dataset?.rwLocked) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  const guardUpload = () => {
    const original = window.uploadStudentPhoto;
    if (typeof original !== 'function' || original.rwGuard) return;
    window.uploadStudentPhoto = function (input) {
      if (!inGST()) { if (input) input.value = ''; return; }
      return original.apply(this, arguments);
    };
    window.uploadStudentPhoto.rwGuard = true;
  };
  guardUpload();
  addEventListener('load', guardUpload, {once: true});
})();
