/* Keep the page-class hooks used by performance.css in sync with browser state. */
(() => {
  const sync = () => document.documentElement.classList.toggle('rw-page-hidden', document.hidden);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
