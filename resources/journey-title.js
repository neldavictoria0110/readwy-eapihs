/* READwy letter-by-letter pen writing v2 */
(() => {
 'use strict';
 const text = document.getElementById('journeyTitleText');
 const textPath = text?.querySelector('textPath');
 const pen = document.getElementById('journeyPen');
 const backdrop = document.querySelector('.journey-backdrop');
 const back = document.querySelector('.journey>.back');
 const clip = document.getElementById('titleInkReveal');
 const pieces = [...document.querySelectorAll('.map-piece')];
 const stages = [...document.querySelectorAll('.stage')];
 if (!text || !textPath || !pen || !backdrop) return;

 // Build individually hidden SVG characters BEFORE a drawing frame can show text.
 // This is independent of SVG clip-path compatibility in Safari/iOS WebKit.
 const label = textPath.textContent;
 const NS = 'http://www.w3.org/2000/svg';
 textPath.replaceChildren();
 textPath.setAttribute('xml:space','preserve');
 const glyphs = Array.from(label, character => {
  const span = document.createElementNS(NS, 'tspan');
  span.textContent = character;
  span.setAttribute('class', 'readwy-ink-letter');
  span.style.visibility = 'hidden';
  span.style.opacity = '0';
  textPath.appendChild(span);
  return span;
 });
 // Do not rely on the previous coarse clip for hiding text.  Letter gating wins.
 text.removeAttribute('clip-path');
 if (clip) clip.setAttribute('width', '0');

 function showGlyph(index, alpha = 1) {
  if (!glyphs[index]) return;
  glyphs[index].style.visibility = 'visible';
  glyphs[index].style.opacity = String(alpha);
  if (alpha >= 1) glyphs[index].classList.add('is-written');
  else glyphs[index].classList.add('is-writing');
 }
 function revealStage(piece, index) {
  piece.classList.add('is-revealed');
  stages[index]?.classList.add('is-revealed');
  if (index === pieces.length - 1 && back) back.hidden = false;
 }
 function revealMap() {
  backdrop.classList.add('is-visible');
  pieces.forEach((piece, i) => setTimeout(() => revealStage(piece, i), 900 + i * 650));
 }
 function finish() {
  glyphs.forEach((_, i) => showGlyph(i));
  pen.style.opacity = '0';
  pen.classList.add('finished');
  revealMap();
 }
 let started = false;
 async function write() {
  if (started) return;
  started = true;
  try {
   await document.fonts.ready;
   await new Promise(resolve => requestAnimationFrame(resolve));
   const count = text.getNumberOfChars();
   if (count !== glyphs.length || count === 0) throw Error('Unexpected SVG character layout');
   const positions = glyphs.map((_, i) => ({
    start: text.getStartPositionOfChar(i),
    end: text.getEndPositionOfChar(i)
   }));
   if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
   let began = null, completed = -1;
   const msPerLetter = 115;
   function tick(time) {
    if (began === null) began = time;
    const progress = Math.min(count, (time - began) / msPerLetter);
    const active = Math.min(count - 1, Math.floor(progress));
    // Finished characters stay visible; the one under the pen fades in.
    while (completed + 1 < active) { completed++; showGlyph(completed); }
    const fraction = progress >= count ? 1 : progress - active;
    if (progress < count) showGlyph(active, Math.max(.04, fraction));
    const a = positions[active].start, b = positions[active].end;
    const x = a.x + (b.x-a.x)*fraction;
    const y = a.y + (b.y-a.y)*fraction;
    const angle = Math.atan2(b.y-a.y, b.x-a.x) * 180 / Math.PI;
    pen.style.opacity = progress < count ? '1' : '0';
    pen.setAttribute('transform', `translate(${x} ${y}) rotate(${angle - 18})`);
    if (progress < count) requestAnimationFrame(tick);
    else finish();
   }
   requestAnimationFrame(tick);
  } catch (error) {
   console.error('READwy pen writing could not start:', error);
   // Graceful fallback rather than a permanently blank title.
   finish();
  }
 }
 window.startJourneyTitle = write;
 if (new URLSearchParams(location.search).get('launchHold') !== '1') {
  if (document.readyState === 'complete') write();
  else window.addEventListener('load', write, {once:true});
 }
})();
