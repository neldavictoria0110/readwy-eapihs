/* Welcome voices for the learning journeys: when a journey's welcome screen appears, its guide speaks by itself
   (Keypass: Gus, Voice Station: Orson, Inkventure: the welcome greeting). The Listen buttons still replay it.
   If the browser has not been tapped yet, the voice starts at the first tap (see speech-pace.js).
   Catch-Up Express (Tala), Spellscript and the Post-Test already greet by themselves; the Reading Lab greets
   from its own page. Nothing speaks when the learner has turned sound off. */
(() => {
  if (window.__rwWelcomeVoice) return; window.__rwWelcomeVoice = true;
  const seen = new WeakSet();
  const soundOn = () => typeof readwyCanPlaySound !== 'function' || readwyCanPlaySound();
  const say = text => window.readwySpeakOrWait && window.readwySpeakOrWait(() => { const u = new SpeechSynthesisUtterance(text); u.rate = .95; u.lang = 'en-US'; return u });
  const RULES = [
    { sel: '.xg-listen', run: () => typeof readwyOwlSpeak === 'function' && readwyOwlSpeak('gst', true) },
    { sel: '.xo-listen,#xoOwl', run: () => typeof readwyOwlSpeak === 'function' && readwyOwlSpeak('orst', true) },
    { sel: '.interv-welcome-screen', run: el => {
      const m = el.textContent.replace(/\s+/g, ' ').match(/Hi, [^!]{1,40}! Stations open one at a time\.[^.]*\./);
      say('Welcome to Inkventure! Your reading adventure awaits! ' + (m ? m[0] : 'Pick a station to begin.'));
    } }
  ];
  setInterval(() => {
    if (document.hidden) return;
    for (const r of RULES) {
      const el = document.querySelector(r.sel);
      if (!el || seen.has(el) || !el.getBoundingClientRect().width) continue;
      seen.add(el);
      setTimeout(() => {
        try { if (!el.isConnected || !soundOn() || window.speechSynthesis?.speaking) return; r.run(el) } catch (e) {}
      }, 900);
    }
  }, 600);
})();
