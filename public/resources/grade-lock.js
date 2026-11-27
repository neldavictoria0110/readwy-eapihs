/* Reading materials follow the grade the learner signed up with.
   Voice Station and Story Depot open on that grade, and the other grades' passages/tasks stay locked
   (GST already opens on the sign-up grade). The developer view and teachers are not locked. */
(() => {
  const currentUser = () => (typeof user !== 'undefined' && user) || null;
  function learnerGrade() {
    const u = currentUser();
    if (!u || u.role === 'teacher' || u.dev) return null;
    try { if (sessionStorage.getItem('readwy-dev-view') === '1') return null; } catch {}
    const g = Number(u.grade);
    return [7, 8, 9, 10].includes(g) ? g : null;
  }
  const notice = text => {
    const bubble = document.querySelector('.xc #xoTip, .xc-bubble');
    if (bubble) { bubble.textContent = text; return; }
    if (typeof showPageStatus === 'function') { try { showPageStatus(text); return; } catch {} }
  };
  const lockedMessage = (g, x) => `You are in Grade ${g}, so Grade ${x} is locked. Choose Grade ${g}.`;

  const style = document.createElement('style');
  style.textContent = `
.xo-tile.rw-grade-locked,.wst-grade-choice.rw-grade-locked{position:relative;filter:grayscale(.85);opacity:.5;cursor:not-allowed}
.xo-tile.rw-grade-locked::after,.wst-grade-choice.rw-grade-locked::after{content:'🔒';position:absolute;right:10px;top:8px;font-size:18px;line-height:1}`;
  document.head.append(style);

  function wrap(name, gradeOf, before) {
    const original = window[name];
    if (typeof original !== 'function' || original.readwyGradeLocked) return;
    window[name] = function (...args) {
      const g = learnerGrade();
      if (g) {
        const x = gradeOf(...args);
        if (x !== null && x !== g) { notice(lockedMessage(g, x)); return; }
        before?.(g);
      }
      return original.apply(this, args);
    };
    window[name].readwyGradeLocked = true;
  }
  const install = () => {
    // Voice Station painted screen: actions like "grade:8".
    wrap('xoAct', action => { const m = /^grade:(\d+)$/.exec(String(action)); return m ? Number(m[1]) : null; });
    wrap('orstChooseGrade', grade => Number(grade));
    wrap('wstChooseGrade', grade => Number(grade));
    // Opening Voice Station or Story Depot starts on the learner's own grade.
    wrap('startORSTSpell', () => null, g => { selectedGrade = g; });
    wrap('openWST', () => null, g => { selectedGrade = g; });
  };
  install();
  addEventListener('load', install, {once: true});

  // Grey out and lock the other grades on the choose-grade screens.
  const mark = () => {
    const g = learnerGrade();
    document.querySelectorAll('.xo-tile[onclick*="grade:"], .wst-grade-choice[onclick*="wstChooseGrade"]').forEach(el => {
      const x = Number((/grade:(\d+)|wstChooseGrade\((\d+)\)/.exec(el.getAttribute('onclick')) || []).slice(1).find(Boolean));
      const locked = !!g && x !== g;
      el.classList.toggle('rw-grade-locked', locked);
      if (locked) { el.setAttribute('aria-disabled', 'true'); el.title = lockedMessage(g, x); }
      else { el.removeAttribute('aria-disabled'); el.removeAttribute('title'); }
    });
  };
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mark(); });
  }).observe(document.documentElement, {childList: true, subtree: true});
})();
