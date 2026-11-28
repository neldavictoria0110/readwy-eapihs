/* Every speaking owl and read-aloud button in READwy talks at a natural pace.
   Older screens asked for slow speech (rate 0.82-0.98); this lifts every utterance by 15% (the Settings
   speech-rate slider still applies on top). Utterances marked __rwPaced already chose their own speed.

   Voices that start by themselves: browsers only let a page speak after the learner has tapped that page.
   READwy opens the journey ticket and other screens inside a frame of the page the learner already tapped
   (for example the train page after sign-in), so speech is sent through the nearest same-site page that has
   been tapped. Events (start, end, error) still reach the screen that asked to speak.
   When no tapped page exists (a screen opened straight from a link), speech that the browser refuses is kept
   and played at the learner's first tap anywhere on the screen (readwySpeakOrWait). */
(() => {
  try {
    const P = window.SpeechSynthesis && window.SpeechSynthesis.prototype;
    if (!P || P.__rwPace) return;
    const speak = P.speak, cancel = P.cancel;
    const activated = w => { try { return !!(w.navigator.userActivation && w.navigator.userActivation.hasBeenActive) } catch (e) { return false } };
    // The nearest same-site parent page that the learner has tapped (null when this page itself may speak).
    const host = () => {
      if (activated(window) || window.top === window) return null;
      let w = window;
      try { while (w !== w.top) { w = w.parent; if (w.speechSynthesis && activated(w)) return w } } catch (e) {}
      return null;
    };
    const relay = (u, h) => {
      const v = new h.SpeechSynthesisUtterance(u.text);
      for (const k of ['lang', 'pitch', 'rate', 'volume']) try { v[k] = u[k] } catch (e) {}
      try { if (u.voice) v.voice = h.speechSynthesis.getVoices().find(x => x.name === u.voice.name) || null } catch (e) {}
      v.__rwPaced = true;
      const forward = type => e => {
        try {
          const Ev = type === 'error' ? window.SpeechSynthesisErrorEvent : window.SpeechSynthesisEvent;
          const init = { utterance: u, charIndex: e.charIndex || 0, elapsedTime: e.elapsedTime || 0, name: e.name || '' };
          if (type === 'error') init.error = e.error;
          u.dispatchEvent(Ev ? new Ev(type, init) : new Event(type));
        } catch (err) { try { const f = u['on' + type]; if (typeof f === 'function') f.call(u, e) } catch (x) {} }
      };
      for (const t of ['start', 'end', 'error', 'boundary', 'pause', 'resume', 'mark']) v.addEventListener(t, forward(t));
      window.__rwSpeechHost = h;
      return speak.call(h.speechSynthesis, v);
    };
    P.speak = function (u) {
      try { if (u && !u.__rwPaced) { u.__rwPaced = true; u.rate = Math.max(.5, Math.min(1.8, (Number(u.rate) || 1) * 1.15)); } } catch (e) {}
      try { if (this === window.speechSynthesis && u) { const h = host(); if (h) return relay(u, h) } } catch (e) {}
      return speak.call(this, u);
    };
    P.cancel = function () {
      try { if (this === window.speechSynthesis && window.__rwSpeechHost) window.__rwSpeechHost.speechSynthesis.cancel() } catch (e) {}
      return cancel.call(this);
    };
    P.__rwPace = true;
    // True when speech may start without waiting for a tap (this page or a parent page has been tapped).
    window.readwyCanSpeakNow = () => activated(window) || !!host();

    /* Speak now; if the browser refuses because the page has not been tapped yet, speak at the first tap.
       Taps on buttons and links are left alone (they do their own thing, for example Listen speaks itself). */
    let waiting = null;
    window.readwySpeakOrWait = (makeUtterance, onWaiting) => {
      const synth = window.speechSynthesis; if (!synth || !window.SpeechSynthesisUtterance) return;
      const arm = () => {
        if (waiting) return; onWaiting && onWaiting(true);
        waiting = e => {
          if (e.isTrusted === false) return;
          const control = e.target && e.target.closest && e.target.closest('button,a,area,input,select,textarea,label,[role=button]');
          removeEventListener('pointerup', waiting, true); removeEventListener('keydown', waiting, true); waiting = null; onWaiting && onWaiting(false);
          if (!control) { try { synth.cancel(); synth.speak(makeUtterance()) } catch (err) {} }
        };
        addEventListener('pointerup', waiting, true); addEventListener('keydown', waiting, true);
      };
      let started = false;
      const u = makeUtterance();
      u.addEventListener('start', () => { started = true });
      u.addEventListener('error', e => { if (!started && e.error === 'not-allowed') arm() });
      try { synth.cancel(); synth.speak(u) } catch (e) { arm(); return }
      setTimeout(() => { if (!started && !synth.speaking && !(window.__rwSpeechHost && window.__rwSpeechHost.speechSynthesis.speaking)) arm() }, 1800);
    };
  } catch (e) {}
})();
