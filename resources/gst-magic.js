/* GST book scene:
   1. The train window shows wizards on broomsticks flying across the sunset sky over the hills.
      (No goal rings or game balls: the scene must not resemble any book or film's sport.)
   2. Gus's two wands swirl with light that then spreads outward as sparkles.
   Both are added whenever the GST scene is drawn, and both sit still for anyone who prefers reduced motion.
   ORST shares some GST class names, so everything here is limited to the GST book (.xg without .xc). */
(() => {
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduced-motion');

  const style = document.createElement('style');
  style.id = 'gst-magic-style';
  style.textContent = `
.xg:not(.xc) .xg-game{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.xg:not(.xc) .xg-game svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.xg:not(.xc) .xg-glass>.xg-poles,.xg:not(.xc) .xg-glass>.xg-mull{z-index:2}
/* The window shows the sunset sky and the hills below it (about 23%–90% of the picture). */
.xg:not(.xc) .xg-strip{top:-35%;height:150%}
.xg:not(.xc) .xg-strip img{filter:none;margin-right:-1px}
.xg-game .gm-credit{position:absolute;right:16%;bottom:3px;font:500 9px/1 system-ui,sans-serif;color:#fff;opacity:.55;text-shadow:0 1px 2px #000}
.xg-game .gm-twinkle{animation:gmTwinkle 2.6s ease-in-out infinite}
.xg-game .gm-twinkle:nth-of-type(3n){animation-delay:.9s}.xg-game .gm-twinkle:nth-of-type(3n+1){animation-delay:1.7s}
@keyframes gmTwinkle{0%,100%{opacity:.25}50%{opacity:1}}
.xg:not(.xc) .xg-gusp{position:relative}
.xg-wandlayer{position:absolute;pointer-events:none;z-index:2;animation:xgBob 4s ease-in-out infinite;transform-origin:50% 95%}
.xg-wandlayer.talk{animation:xgTalk .5s ease-in-out infinite}
.reduced-motion .xg-wandlayer{animation:none}
@media (prefers-reduced-motion:reduce){.xg-wandlayer{animation:none}}
/* Wand tips: two invisible anchors; the light itself is drawn on a canvas as living magic
   (glowing motes that curl up and fade, with soft light trails) instead of drawn rings and dots. */
.xg-wandfx{position:absolute;width:2px;height:2px;pointer-events:none}
.xg-wandfx.l{left:15%;top:40%}.xg-wandfx.r{left:88%;top:41%}
.xg-wandcanvas{position:absolute;left:-60%;top:-60%;width:220%;height:220%;pointer-events:none;mix-blend-mode:screen}`;
  document.head.append(style);

  // The view: a real photograph (Chocolate Hills, Bohol, at sunset) in place of the painted castle valley.
  const WINDOW_PHOTO = 'resources/gst-book/window-chocolate-hills.jpg';
  const PHOTO_CREDIT = 'Photo: Vyacheslav Argenberg, CC BY 4.0 (Wikimedia Commons)';

  // A rider on a broomstick, facing right, drawn as a back-lit silhouette against the sunset sky.
  const rider = (id, robe, rim) => `<g id="${id}" filter="url(#gmMotion)">
    <path d="M-22 2 L18 -1" stroke="#22150a" stroke-width="2" stroke-linecap="round"/>
    <path d="M-22 2 L-31 -3 L-33 2 L-31 7 Z" fill="#3a2812"/>
    <path d="M-5 0 L-15 1 L-9 -11 Z" fill="${robe}"/>
    <path d="M-6 -1 Q-2 -12 3 -1 Z" fill="${robe}"/>
    <circle cx="-1" cy="-13" r="3.4" fill="#1d130c"/>
    <path d="M-4.6 -14.6 Q-1 -18.6 2.8 -14.6" fill="none" stroke="${rim}" stroke-width=".9" opacity=".85"/>
    <path d="M-6 -1 Q-2 -12 3 -1" fill="none" stroke="${rim}" stroke-width=".7" opacity=".7"/>
    <path d="M2 -6 L9 -2" stroke="#1d130c" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
  const stars = Array.from({length: 10}, (_, i) =>
    `<circle class="gm-twinkle" cx="${(i * 389 + 60) % 1000}" cy="${3 + (i * 29) % 16}" r=".6" fill="#fff8dc" opacity=".6"/>`).join('');
  // Riders cross the window one way and loop round off-screen, so nobody flies upside down.
  const flight = (who, path, dur, begin = '0s') =>
    `<use href="#${who}"><animateMotion dur="${dur}" begin="${begin}" repeatCount="indefinite" path="${path}"/></use>`;

  function gameSvg() {
    return `<svg viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="gmDusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241a3a" stop-opacity=".38"/><stop offset=".4" stop-color="#3a2a4a" stop-opacity=".08"/><stop offset="1" stop-color="#120c08" stop-opacity=".18"/>
    </linearGradient>
    <filter id="gmMotion" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".45 .15"/></filter>
    <radialGradient id="gmGold" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#f6c94a"/><stop offset="1" stop-color="#b8861b"/></radialGradient>
    <radialGradient id="gmRed" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".6" stop-color="#c0352b"/><stop offset="1" stop-color="#6e1712"/></radialGradient>
    <radialGradient id="gmHalo"><stop offset="0" stop-color="#fff2a8" stop-opacity=".9"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>
    ${rider('gmRiderA', '#3a1418', '#ffb46a')}${rider('gmRiderBright', '#12292a', '#ffd9a0')}
    <g id="gmRiderB"><use href="#gmRiderBright" transform="scale(-1 1)"/></g>
  </defs>
  <rect width="1000" height="100" fill="url(#gmDusk)"/>
  ${stars}
  ${flight('gmRiderA', 'M-60 62 C200 22 450 76 700 36 S950 56 1060 46', '11s')}
  ${flight('gmRiderB', 'M1060 40 C800 76 560 22 320 56 S80 42 -60 36', '12s', '-3s')}
  ${flight('gmRiderA', 'M-60 30 C250 50 520 14 760 48 S980 26 1060 32', '14s', '-7s')}
  ${flight('gmRiderB', 'M1060 74 C780 46 480 86 240 52 S40 72 -60 76', '13s', '-9s')}
</svg>`;
  }

  function wandFx(side) {
    return `<span class="xg-wandfx ${side}" aria-hidden="true"></span>`;
  }

  /* ---------- Living wand light ----------
     Each wand tip gives off a steady stream of glowing motes: they rise and curl like smoke, twinkle
     and fade, in gold with touches of white and violet. A soft glow breathes at the tip. Drawn with
     additive light and a fading trail, so it reads as light rather than a drawing. */
  const MOTE_COLORS = [[255, 236, 170], [255, 214, 120], [255, 250, 230], [214, 190, 255], [170, 220, 255]];
  function startWandLight(layer) {
    const canvas = document.createElement('canvas');
    canvas.className = 'xg-wandcanvas';
    layer.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const motes = [];
    let w = 0, h = 0, dpr = 1, last = performance.now();
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    new ResizeObserver(size).observe(canvas);
    // wand tips in canvas coordinates (canvas spans 220% of the layer, offset by 60%)
    const tips = () => [[.15, .40], [.88, .41]].map(([x, y]) => [w * (.6 + x) / 2.2, h * (.6 + y) / 2.2]);
    const spawn = (x, y, burst) => {
      const c = MOTE_COLORS[Math.random() < .72 ? (Math.random() < .5 ? 0 : 1) : 2 + Math.floor(Math.random() * 3)];
      const a = -Math.PI / 2 + (Math.random() - .5) * (burst ? Math.PI * 2 : 1.6);
      const sp = (burst ? 40 : 14) + Math.random() * (burst ? 90 : 26);
      motes.push({x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1,
        decay: .45 + Math.random() * .6, r: .8 + Math.random() * 1.8, c, spin: (Math.random() - .5) * 4, tw: Math.random() * 6});
    };
    const frame = now => {
      if (!canvas.isConnected) return;
      if (document.hidden || reduceMotion()) {
        ctx.clearRect(0, 0, w, h);
        setTimeout(() => requestAnimationFrame(frame), 500);
        return;
      }
      if (now - last < 1000 / 30) { requestAnimationFrame(frame); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      // fade what was drawn before: soft light trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const reduce = false;
      tips().forEach(([x, y], k) => {
        const breathe = .75 + .25 * Math.sin(now / 420 + k * 1.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, w * .045 * breathe);
        g.addColorStop(0, 'rgba(255,252,235,.95)'); g.addColorStop(.25, 'rgba(255,224,140,.55)'); g.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, w * .045 * breathe, 0, 7); ctx.fill();
        if (!reduce && Math.random() < 32 * dt * 3) spawn(x + (Math.random() - .5) * 3, y + (Math.random() - .5) * 3, false);
      });
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life -= m.decay * dt;
        if (m.life <= 0) { motes.splice(i, 1); continue; }
        // a gentle curl, like rising smoke
        const curl = Math.sin(m.y * .05 + now / 500 + m.tw) * 18 + m.spin * 6;
        m.vx += curl * dt; m.vy -= 10 * dt; m.vx *= .985; m.vy *= .985;
        m.px = m.x; m.py = m.y; m.x += m.vx * dt; m.y += m.vy * dt;
        const a = m.life * (.55 + .45 * Math.sin(now / 90 + m.tw));
        const [r, g2, b] = m.c;
        ctx.strokeStyle = `rgba(${r},${g2},${b},${a * .55})`; ctx.lineWidth = m.r * 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(m.px, m.py); ctx.lineTo(m.x, m.y); ctx.stroke();
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
        glow.addColorStop(0, `rgba(255,255,245,${a})`); glow.addColorStop(.3, `rgba(${r},${g2},${b},${a * .7})`); glow.addColorStop(1, `rgba(${r},${g2},${b},0)`);
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, 7); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return {burst: n => tips().forEach(([x, y]) => { for (let i = 0; i < n; i++) spawn(x, y, true); })};
  }

  function decorate(root = document) {
    root.querySelectorAll('.xg:not(.xc) .xg-glass').forEach(glass => {
      const strip = glass.querySelector('.xg-strip');
      // The strip pans by half its width, so 8 alternating copies keep the scroll seamless on wide screens.
      if (strip && strip.children.length === 4) [...strip.children].forEach(img => strip.append(img.cloneNode()));
      glass.querySelectorAll('.xg-strip img').forEach(img => {
        if (!img.src.endsWith(WINDOW_PHOTO)) img.src = WINDOW_PHOTO;
      });
      if (glass.querySelector('.xg-game')) return;
      glass.title = PHOTO_CREDIT;
      const game = document.createElement('div');
      game.className = 'xg-game';
      game.setAttribute('aria-hidden', 'true');
      game.innerHTML = gameSvg() + `<small class="gm-credit">${PHOTO_CREDIT}</small>`;
      strip ? strip.after(game) : glass.prepend(game);
      if (reduceMotion()) game.querySelector('svg')?.pauseAnimations?.();
      useWizardImages(game.querySelector('svg'));
    });
    // Gus's picture casts a drop shadow that would darken the light, so the wand light sits on its own
    // layer laid exactly over Gus, bobbing and talking in step with him.
    root.querySelectorAll('.xg:not(.xc) .xg-gus').forEach(gus => {
      if (gus.nextElementSibling?.classList.contains('xg-wandlayer')) return;
      const layer = document.createElement('div');
      layer.className = 'xg-wandlayer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = wandFx('l') + wandFx('r');
      gus.after(layer);
      layer.readwyLight = startWandLight(layer);
      const place = () => {
        Object.assign(layer.style, {left: gus.offsetLeft + 'px', top: gus.offsetTop + 'px', width: gus.offsetWidth + 'px', height: gus.offsetHeight + 'px'});
      };
      const syncTalk = () => layer.classList.toggle('talk', gus.classList.contains('talk'));
      place(); syncTalk();
      new ResizeObserver(place).observe(gus);
      new MutationObserver(syncTalk).observe(gus, {attributes: true, attributeFilter: ['class']});
      window.addEventListener('resize', place);
      layer.style.pointerEvents = 'auto';
      layer.style.cursor = 'pointer';
      layer.title = 'Click Gus for a spell';
    });
    wrapBegin();
    if (!castOnOpen && document.querySelector('.xg:not(.xc) .xg-wandlayer')) {
      castOnOpen = true;
      setTimeout(castSpell, 900);
    }
  }

  /* ---------- The spell ("abrakadabra") ----------
     Gus sways as if waving his wand; a large spiral of light swirls out from the wand tip, then sparks
     burst out and a soft wave of light spreads across the whole screen. It plays when the GST opens,
     when the test begins, and when Gus is clicked — never on a loop during the test. */
  let casting = false;
  function castSpell() {
    if (casting || reduceMotion()) return;
    const gus = document.querySelector('.xg:not(.xc) .xg-gus');
    const tip = document.querySelector('.xg:not(.xc) .xg-wandlayer .xg-wandfx.r');
    if (!gus || !tip || !gus.getClientRects().length) return;
    casting = true;
    const layer = gus.nextElementSibling?.classList.contains('xg-wandlayer') ? gus.nextElementSibling : null;
    // The wand-waving motion is added on top of Gus's own bobbing.
    const sway = [
      {transform: 'rotate(0deg) translate(0,0)'},
      {transform: 'rotate(-9deg) translate(-3%,-2%)', offset: .18},
      {transform: 'rotate(7deg) translate(3%,-4%)', offset: .38},
      {transform: 'rotate(-6deg) translate(-2%,-1%)', offset: .58},
      {transform: 'rotate(10deg) translate(2%,-3%)', offset: .74},
      {transform: 'rotate(0deg) translate(0,0)'}
    ];
    const swayOptions = {duration: 1800, easing: 'ease-in-out', composite: 'add'};
    try { gus.animate(sway, swayOptions); layer?.animate(sway, swayOptions); } catch {}

    const canvas = document.createElement('canvas');
    canvas.className = 'gm-spell';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '9999', pointerEvents: 'none'});
    document.body.append(canvas);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // A real-looking spell: a vortex of hundreds of glowing motes pours from the wand tip and whirls
    // outward (each leaving a fading light trail), then bursts into streaking sparks and a soft wave of
    // light that washes over the screen.
    const motes = [];
    const start = performance.now();
    const SWIRL = 1600, BURST = 1800, total = SWIRL + BURST;
    const reach = Math.hypot(innerWidth, innerHeight);
    const COLORS = [[255, 238, 176], [255, 210, 110], [255, 252, 236], [205, 180, 255], [160, 214, 255]];
    const pick = () => COLORS[Math.random() < .7 ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3)];
    const glow = (x, y, r, a, c = [255, 214, 120]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,253,240,${a})`); g.addColorStop(.3, `rgba(${c[0]},${c[1]},${c[2]},${a * .65})`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    let last = start, burst = false;
    const frame = now => {
      const t = now - start, dt = Math.min(.05, (now - last) / 1000); last = now;
      const box = tip.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const unit = Math.max(30, (gus.getBoundingClientRect().width || 120) * .5);
      // fade the previous frame instead of clearing: every mote leaves a soft trail of light
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'lighter';
      if (t < SWIRL) {
        const p = t / SWIRL;
        // three arms of the vortex, released as the wand circles
        for (let arm = 0; arm < 3; arm++) for (let k = 0; k < 4; k++) {
          const ang = p * Math.PI * 6 + arm * Math.PI * 2 / 3 + (Math.random() - .5) * .35;
          motes.push({x: cx, y: cy, ang, rad: unit * .05, vr: unit * (1.1 + Math.random() * 1.4), va: 3.2 + Math.random() * 1.6,
            life: 1, decay: .55 + Math.random() * .5, r: 1 + Math.random() * 2.2, c: pick(), tw: Math.random() * 6, mode: 'swirl'});
        }
        glow(cx, cy, unit * (.35 + .25 * Math.sin(t / 70)), .9);
      } else if (!burst) {
        burst = true;
        for (let i = 0; i < 260; i++) {
          const a = Math.random() * Math.PI * 2, sp = unit * (2 + Math.random() * 9);
          motes.push({x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: .35 + Math.random() * .5,
            r: .8 + Math.random() * 2.4, c: pick(), tw: Math.random() * 6, mode: 'spark'});
        }
      }
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life -= m.decay * dt;
        if (m.life <= 0) { motes.splice(i, 1); continue; }
        const px = m.x, py = m.y;
        if (m.mode === 'swirl') {
          m.ang += m.va * dt; m.rad += m.vr * dt; m.va *= .992;
          m.x = cx + Math.cos(m.ang) * m.rad; m.y = cy + Math.sin(m.ang) * m.rad * .78 - (1 - m.life) * unit * .4;
        } else {
          m.x += m.vx * dt; m.y += m.vy * dt; m.vx *= .96; m.vy = m.vy * .96 + unit * .6 * dt;
        }
        const a = m.life * (.6 + .4 * Math.sin(now / 80 + m.tw)), c = m.c;
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * .7})`; ctx.lineWidth = m.r * 1.3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(m.x, m.y); ctx.stroke();
        glow(m.x, m.y, m.r * 4.5, a, c);
      }
      if (t >= SWIRL) {
        const p = Math.min(1, (t - SWIRL) / BURST);
        // the light spreads from the wand tip over the whole screen, then fades
        const wave = reach * (.08 + p * 1.05), a = .32 * (1 - p);
        const g = ctx.createRadialGradient(cx, cy, wave * .5, cx, cy, wave);
        g.addColorStop(0, `rgba(255,240,190,${a * .25})`); g.addColorStop(.85, `rgba(255,224,150,${a})`); g.addColorStop(1, 'rgba(255,224,150,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, innerWidth, innerHeight);
        if (p < .25) glow(cx, cy, unit * (1.6 - p * 3), 1 - p * 4);
      }
      if (t < total || motes.length) requestAnimationFrame(frame);
      else { canvas.remove(); casting = false; }
    };
    layer?.readwyLight?.burst(40);
    requestAnimationFrame(frame);
  }
  window.readwyCastSpell = castSpell;
  let castOnOpen = false;
  document.addEventListener('click', event => {
    if (event.target.closest?.('.xg:not(.xc) .xg-gus, .xg:not(.xc) .xg-wandlayer')) castSpell();
  });
  const wrapBegin = () => {
    if (typeof window.xgBegin !== 'function' || window.xgBegin.readwySpell) return;
    const original = window.xgBegin;
    window.xgBegin = function (...args) { const r = original.apply(this, args); setTimeout(castSpell, 250); return r; };
    window.xgBegin.readwySpell = true;
  };

  /* ---------- Photorealistic wizards (supplied images) ----------
     Put PNGs with transparent backgrounds, riders facing RIGHT, in resources/gst-book/:
     wizard-rider-1.png and wizard-rider-2.png. When they are present they replace the drawn silhouettes;
     until then the silhouettes are used. */
  // A supplied PNG wins; otherwise the painted wizards that ship with READwy (wizard-rider-N.svg) are used.
  const tryImage = src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth ? src : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const wizardImages = [1, 2].map(async n =>
    tryImage(`resources/gst-book/wizard-rider-${n}.svg`)); // the painted wizards that ship with READwy (no PNG was ever supplied; asking for one cost a failed request on every page)
  function useWizardImages(svg) {
    Promise.all(wizardImages).then(([first, second]) => {
      [['gmRiderA', first], ['gmRiderBright', second || first]].forEach(([id, src]) => {
        const g = src && svg.querySelector('#' + id);
        if (!g) return;
        g.removeAttribute('filter');
        g.innerHTML = `<image href="${src}" x="-42" y="-33" width="84" height="56" preserveAspectRatio="xMidYMid meet"/>`;
      });
    });
  }

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; decorate(); });
  }).observe(document.documentElement, {childList: true, subtree: true});
  decorate();
})();
