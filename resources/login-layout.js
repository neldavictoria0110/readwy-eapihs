/* Startup / login layout on wide screens (frames on the left, card in the middle):
   - keep a clear gap between the Platform / Welcome Aboard frames and the login/sign-up card,
     narrowing the card (it stays centred) when needed;
   - put the READwy title and its "Enchanted Academy" banner at the top-left, lined up with the
     Platform frame's left edge and sitting just above it. */
(() => {
  /* "Choose Your Subject": no glow (no white halo or glowing text), and the subjects and the
     "Back to sign in" button sit together as one group with even spacing. */
  const style = document.createElement('style');
  style.id = 'readwy-subject-picker-style';
  style.textContent = `
#subjectPicker{justify-content:center!important}
#subjectPicker .subject-choices{flex:0 0 auto!important;margin-top:clamp(14px,2.4dvh,22px)!important;padding:0!important;gap:clamp(10px,1.6dvh,16px)!important}
#subjectPicker .subject-choice{min-height:clamp(60px,10.5dvh,92px);background:#f4efe3!important;border:1px solid #d9c38a!important;
 box-shadow:0 3px 8px rgba(8,30,20,.35)!important;filter:none!important}
#subjectPicker .subject-choice:hover{background:#faf6ec!important}
#subjectPicker .subject-choice[aria-pressed=true]{border-color:#b8862e!important;box-shadow:0 0 0 2px #b8862e,0 3px 8px rgba(8,30,20,.35)!important}
#subjectPicker .subject-choice span{text-shadow:none!important}
#subjectPicker .subject-symbol{box-shadow:none!important}
#subjectPicker h2{text-shadow:0 1px 2px rgba(0,0,0,.45)!important}
#subjectPicker .subject-back{margin:clamp(16px,2.6dvh,24px) auto 0;padding:8px 18px;border:1px solid #c9a14a;border-radius:999px;
 background:rgba(8,30,20,.35);color:#f3e2b0;font:600 13px system-ui,sans-serif}
#subjectPicker .subject-back:hover{background:rgba(8,30,20,.55)}
@media (max-height:700px){#subjectPicker .subject-choice{min-height:clamp(48px,9dvh,66px)}#subjectPicker .subject-back{margin-top:14px;margin-bottom:0;padding:6px 16px}}`;
  document.head.append(style);

  const GAP =() => Math.round(Math.min(56, Math.max(18, innerWidth * .03)));
  const MIN_CARD = 300;
  let cssCardWidth = 0;

  function layout() {
    const sign = document.querySelector('.rs-sign:not(.r)');
    const board = document.querySelector('.rs-board');
    const scene = document.querySelector('.car-scene');
    const title = document.querySelector('.rs-login-title');
    if (!sign || !scene) return;
    const s = sign.getBoundingClientRect(), bd = board?.getBoundingClientRect();
    // Only when the frames sit beside the card (desktop / landscape). Portrait stacks them; leave it alone.
    const beside = innerWidth >= 700 && innerWidth > innerHeight && s.width > 0 && s.right < innerWidth / 2;
    if (!beside) {
      ['width', 'left', 'transform'].forEach(p => scene.style.removeProperty(p));
      if (title) ['left', 'top', 'width', 'transform'].forEach(p => title.style.removeProperty(p));
      return;
    }
    // 1. Card: centred on the screen with at least GAP to the right of the frames. On narrow screens
    //    where that does not fit, it is centred in the space between the frames and the Next Departure board.
    if (!scene.style.width) cssCardWidth = scene.getBoundingClientRect().width;
    const gap = GAP();
    const framesRight = Math.max(s.right, bd?.right || 0);
    // The card is centred in the open space between the left frames and the Next Departure board,
    // and widens to use that space (up to a comfortable reading width).
    const departure = document.querySelector('.rs-sign.r')?.getBoundingClientRect();
    const right = departure && departure.width && departure.left > framesRight ? departure.left - gap : innerWidth - gap;
    const left = framesRight + gap;
    const MAX_CARD = Math.max(cssCardWidth, 600);
    const width = Math.max(MIN_CARD, Math.min(MAX_CARD, right - left));
    const centre = left + (right - left) / 2;
    scene.style.setProperty('width', Math.round(width) + 'px', 'important');
    scene.style.setProperty('left', Math.round(centre) + 'px', 'important');
    scene.style.setProperty('transform', 'translateX(-50%)', 'important');

    // 2. Title: left edge on the Platform frame's left edge, bottom just above the frame.
    if (title) {
      const svg = title.querySelector('svg');
      const box = svg?.viewBox?.baseVal;
      const ratio = box && box.width ? box.height / box.width : .61;
      const top = Math.max(8, Math.round(innerHeight * .02));
      const space = s.top - 14 - top;
      const w = Math.max(160, Math.min(s.width * 1.12, space / ratio));
      title.style.setProperty('left', Math.round(s.left) + 'px', 'important');
      title.style.setProperty('top', top + 'px', 'important');
      title.style.setProperty('width', Math.round(w) + 'px', 'important');
      title.style.setProperty('transform', 'none', 'important');
    }
  }

  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(layout); };
  addEventListener('resize', schedule);
  addEventListener('orientationchange', schedule);
  addEventListener('load', schedule);
  // The station scene is built by script after the page starts; keep up while it settles.
  let tries = 0;
  const settle = setInterval(() => { schedule(); if (++tries > 5) clearInterval(settle); }, 500);
  schedule();
})();
