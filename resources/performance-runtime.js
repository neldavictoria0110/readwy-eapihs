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
