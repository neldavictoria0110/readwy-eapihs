/* Keep the page-class hooks used by performance.css in sync with browser state. */
(() => {
  const detectMobileSafety = () => {
    try {
      const coarse = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
      const small = Math.min(screen.width, screen.height) <= 820 || matchMedia('(max-width: 900px)').matches;
      const iPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
      return coarse && (small || iPhone);
    } catch (error) {
      return false;
    }
  };
  if (typeof window.__READWY_MOBILE_SAFETY__ !== 'boolean') {
    window.__READWY_MOBILE_SAFETY__ = detectMobileSafety();
  }
  if (typeof window.readwyMobileSafetyActive !== 'function') {
    window.readwyMobileSafetyActive = () => window.__READWY_MOBILE_SAFETY__ === true;
  }
  const sync = () => {
    document.documentElement.classList.toggle('rw-page-hidden', document.hidden);
    document.documentElement.classList.toggle('rw-mobile-safe', window.readwyMobileSafetyActive());
  };
  document.addEventListener('visibilitychange', sync);
  sync();
})();

/* Faster page changes. READWY_MOTION_SPEED = how many times faster than the original design.
   While a page change runs (html.book-traveling), every finite animation and transition on the page
   (CSS keyframes, CSS transitions and element.animate) plays at that speed, delays included.
   waitForTransitionMotion() in navigation.js divides its waits by the same number, so nothing is cut
   short or left waiting. Endless decorative loops (owl idling, steam, sparkles) are left at normal speed. */
(() => {
  const SPEED = 2;
  if (typeof document.getAnimations !== 'function') return; // very old browsers: keep the original timing
  window.READWY_MOTION_SPEED = SPEED;
  const html = document.documentElement;
  const sped = new WeakSet();
  let frame = 0;
  const finite = animation => {
    try { return animation.effect && animation.effect.getComputedTiming().iterations !== Infinity; } catch { return false; }
  };
  const speedUp = () => {
    frame = 0;
    if (!html.classList.contains('book-traveling')) return;
    for (const animation of document.getAnimations()) {
      if (sped.has(animation) || !finite(animation)) continue;
      sped.add(animation);
      try { animation.updatePlaybackRate(animation.playbackRate * SPEED); } catch {}
    }
    frame = requestAnimationFrame(speedUp);
  };
  const watch = () => { if (html.classList.contains('book-traveling') && !frame) speedUp(); };
  new MutationObserver(watch).observe(html, {attributes: true, attributeFilter: ['class']});
  watch();
})();
