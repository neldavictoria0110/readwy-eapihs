/* The falling READwy title on the sign-in (train) page.
   The letters are cut from one large picture. On phones that picture often arrives after the letters have already
   "fallen" (invisible), so the title just appears. Here the letters wait, unseen, until the picture is ready and the
   page is visible, then the fall and the academy banner play from the start (at most 4 seconds of waiting). */
(() => {
  const css = document.createElement('style');
  css.textContent = `.rs-login-title svg.rt-wait .falling-letter,.rs-login-title svg.rt-wait .banner-entrance,.rs-login-title svg.rt-wait .settled-letter-glow{animation:none!important;opacity:0!important}`;
  (document.head || document.documentElement).append(css);
  const done = new WeakSet();
  function prepare(svg) {
    if (!svg || done.has(svg)) return;
    done.add(svg);
    svg.classList.add('rt-wait');
    const art = svg.querySelector('image');
    const href = art && (art.getAttribute('href') || art.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
    let started = false;
    const play = () => {
      if (started) return; started = true;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        svg.classList.remove('rt-wait');
        // restart every animation of the title from its first frame
        svg.querySelectorAll('.falling-letter,.banner-entrance,.settled-letter-glow').forEach(el => { el.style.animation = 'none'; void el.getBoundingClientRect(); el.style.animation = '' });
      }));
    };
    const whenVisible = () => { if (document.visibilityState === 'visible') play(); else addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') play() }, { once: true }) };
    setTimeout(play, 4000);
    if (!href) return whenVisible();
    const img = new Image();
    img.onload = img.onerror = () => { (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(whenVisible) };
    img.src = href;
    if (img.complete && img.naturalWidth) whenVisible();
  }
  const scan = () => document.querySelectorAll('.rs-login-title svg').forEach(prepare);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
