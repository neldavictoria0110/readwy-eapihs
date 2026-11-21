/* ORST: when the microphone is refused, work out WHY and give the matching steps
   (the original message only said "Microphone denied"). The three usual causes:
   1. an editor's built-in preview window (e.g. VS Code) — it has no microphone access at all;
   2. the browser has blocked the microphone for this site;
   3. Windows privacy settings block the microphone for all browsers. */
(() => {
  let sitePermission = 'unknown';
  const watchPermission = async () => {
    try {
      const status = await navigator.permissions.query({name: 'microphone'});
      sitePermission = status.state;
      status.onchange = () => { sitePermission = status.state; };
    } catch {}
  };
  watchPermission();

  const ua = navigator.userAgent;
  const inEditorPreview = /\bElectron\//.test(ua) || /\bCode\//.test(ua) || /vscode/i.test(ua);
  const isEdge = /\bEdg\//.test(ua);
  const settingsPage = isEdge ? 'edge://settings/content/microphone' : 'chrome://settings/content/microphone';

  function helpFor(error) {
    if (inEditorPreview) {
      return 'This preview window cannot use the microphone. Open ' + location.origin + ' in Chrome or Edge, then try again.';
    }
    if (sitePermission === 'denied') {
      return 'The browser has blocked the microphone for this site. Click the icon at the left of the web address ' +
        '(ⓘ "Not secure" or the sliders icon) › Site settings › Microphone › Allow, then reload. ' +
        'Or open ' + settingsPage + ' and remove this site from "Not allowed".';
    }
    return 'Windows is blocking the microphone. Open Windows Settings › Privacy & security › Microphone, turn on ' +
      '"Microphone access" and "Let desktop apps access your microphone", then reload this page.';
  }
  window.readwyMicHelp = helpFor;

  /* The Reading Timer digits sit inside their dark slot with a margin (they filled it edge to edge). */
  const style = document.createElement('style');
  style.textContent = '.xc .xc-timer{font-size:40px;letter-spacing:.02em;padding-top:2px}';
  document.head.append(style);

  /* A silent recording (wrong or muted microphone) explains how to fix it, during and after recording. */
  const SILENT_HELP = 'I can’t hear you! In Windows Settings › System › Sound › Input, choose your microphone and check it isn’t muted, then record again.';
  let warnedSession = -1;
  setInterval(() => {
    try {
      if (!orstPaint.recording || warnedSession === orstCapture.session) return;
      if (orstCaptureElapsed() > 4000 && orstCapture.samples > 8 && orstCapture.peak < .003) {
        warnedSession = orstCapture.session;
        orstAudioStatus('Recording', SILENT_HELP);
      }
    } catch {}
  }, 500);

  const install = () => {
    const status = window.orstAudioStatus;
    if (typeof status === 'function' && !status.readwyHelp) {
      window.orstAudioStatus = function (state, text) {
        if (typeof text === 'string' && /No microphone sound detected/.test(text)) text = 'No voice was recorded. ' + SILENT_HELP;
        return status.call(this, state, text);
      };
      window.orstAudioStatus.readwyHelp = true;
    }
    const original = window.orstMicError;
    if (typeof original !== 'function' || original.readwyHelp) return;
    window.orstMicError = function (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return helpFor(error);
      return original.apply(this, arguments);
    };
    window.orstMicError.readwyHelp = true;
  };
  install();
  addEventListener('load', install, {once: true});
})();
