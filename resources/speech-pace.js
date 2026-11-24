/* Every speaking owl and read-aloud button in READwy talks at a natural pace.
   Older screens asked for slow speech (rate 0.82-0.98); this lifts every utterance by 15% (the Settings
   speech-rate slider still applies on top). Utterances marked __rwPaced already chose their own speed. */
(() => {
  try {
    const P = window.SpeechSynthesis && window.SpeechSynthesis.prototype;
    if (!P || P.__rwPace) return;
    const speak = P.speak;
    P.speak = function (u) {
      try { if (u && !u.__rwPaced) { u.__rwPaced = true; u.rate = Math.max(.5, Math.min(1.8, (Number(u.rate) || 1) * 1.15)); } } catch (e) {}
      return speak.call(this, u);
    };
    P.__rwPace = true;
  } catch (e) {}
})();
