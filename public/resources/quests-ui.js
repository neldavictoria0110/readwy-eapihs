/* READwy Quests on the journey ticket page: the post-test countdown, the learner's equipped title and dashboard
   colour theme, and the My Badges / Privileges / Points / Word Vault panels shown as tabs in the Badge Shop.
   Rules, point values and saving are in resources/quests.js. */
(() => {
  const Q = window.READwyQuests;
  if (!Q || !Q.isLearner()) return;
  const esc = Q.esc;
  const PREFIX = 'READwy_new_2026_local_';
  const readLS = (k, f = null) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v } catch { return f } };
  const me = () => readLS(PREFIX + 'user', {}) || {};

  const css = document.createElement('style');
  css.textContent = `
.rwq-count{position:fixed;left:50%;top:0;z-index:45;translate:-50% 0;opacity:0;transition:opacity .4s ease;display:block;width:max-content;max-width:94%;box-sizing:border-box;padding:6px 16px;border-radius:999px;text-wrap:balance;
 background:linear-gradient(180deg,#1f5c40,#0b2f1f);color:#fff3c8;font:700 clamp(12px,1.9vh,15px)/1.3 system-ui,sans-serif;box-shadow:inset 0 0 0 2px #c9a14a,0 8px 18px rgba(0,0,0,.5);text-align:center;pointer-events:none}
.rwq-count.ready{background:linear-gradient(180deg,#e9c46a,#b8860b);color:#2b1d07;box-shadow:inset 0 0 0 2px #fff3c8,0 0 18px rgba(255,214,120,.6),0 8px 18px rgba(0,0,0,.5);animation:rwqPulse 2.4s ease-in-out infinite}
.rwq-count b{font-size:1.15em}
@keyframes rwqPulse{50%{transform:scale(1.03)}}
.rwq-ticket-title{display:block;margin-top:2px;color:#8a5a00;font:italic 800 clamp(8px,.8vw,12px)/1.2 Georgia,serif;letter-spacing:.04em}
body[data-rwq-theme]::after{content:'';position:fixed;inset:0;z-index:30;pointer-events:none;mix-blend-mode:soft-light;opacity:.75}
body[data-rwq-theme=sunrise]::after{background:linear-gradient(160deg,#ffb36b,#ff6f91 60%,#ffd36b)}
body[data-rwq-theme=ocean]::after{background:linear-gradient(160deg,#5ee7df,#2f6fe0 70%)}
body[data-rwq-theme=aurora]::after{background:linear-gradient(160deg,#7cf29c,#5ee7df 40%,#8b5cf6 80%);animation:rwqAurora 9s ease-in-out infinite alternate;background-size:200% 200%}
body[data-rwq-theme=starlight]::after{background:radial-gradient(circle at 20% 20%,#fff 0 1px,transparent 2px) 0 0/90px 90px,radial-gradient(circle at 60% 70%,#fff 0 1px,transparent 2px) 0 0/130px 130px,linear-gradient(160deg,#1b1f4b,#6c4bd8 60%,#c9b6ff);opacity:.85}
@keyframes rwqAurora{to{background-position:100% 100%}}
.rw-tabs{flex:none;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:0 auto}
.rw-tab{min-height:38px;padding:6px 14px;border:0;border-radius:999px;cursor:pointer;font:800 clamp(11px,1.9vh,14px)/1.1 system-ui,sans-serif;color:#3b2604;background:#efe2c2;box-shadow:inset 0 0 0 1px #c9a14a,0 3px 8px rgba(0,0,0,.35);touch-action:manipulation}
.rw-tab[aria-selected=true]{background:linear-gradient(180deg,#1f5c40,#0f3a27);color:#ffe9a8;box-shadow:inset 0 0 0 2px #e9c46a,0 3px 8px rgba(0,0,0,.35)}
.rw-panel{flex:1 1 0;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;margin:0 auto;width:min(1150px,100%);box-sizing:border-box;padding:clamp(10px,2vh,18px);border-radius:18px;
 background:rgba(255,248,232,.96);color:#2b1d07;box-shadow:inset 0 0 0 2px #c9a14a,0 10px 24px rgba(0,0,0,.45);font:500 14px/1.45 system-ui,sans-serif}
.rw-panel h3{margin:.2em 0 .5em;font:800 clamp(15px,2.4vh,19px)/1.2 Georgia,serif;color:#0f3a27}
.rw-panel h4{margin:1em 0 .4em;font:800 13px/1.2 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#8a5a00}
.rw-panel p.rwq-note{margin:.2em 0 .8em;color:#5a4320}
.rwq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.rwq-bcard{display:grid;justify-items:center;gap:4px;padding:10px 8px;border-radius:14px;text-align:center;background:#fffdf6;box-shadow:inset 0 0 0 1px #e3cf9f}
.rwq-bcard b{font:800 13px/1.2 system-ui}.rwq-bcard small{font:600 11px/1.3 system-ui;color:#6b5530}
.rwq-bcard .rwq-tier{font:900 9px/1.4 system-ui;letter-spacing:.14em;text-transform:uppercase;padding:1px 8px;border-radius:999px;color:#fff}
.rwq-tier[data-t=Bronze]{background:#a8683a}.rwq-tier[data-t=Silver]{background:#7d8794}.rwq-tier[data-t=Gold]{background:#b8860b}.rwq-tier[data-t=Legendary]{background:linear-gradient(90deg,#ff6f91,#8b5cf6)}
.rwq-bcard.locked{background:#f1ece0}.rwq-bcard.locked b{color:#7a6a4a}
.rwq-chips{display:flex;flex-wrap:wrap;gap:8px}
.rwq-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:6px 14px;border:0;border-radius:999px;cursor:pointer;font:700 13px/1.2 system-ui;color:#2b1d07;background:#efe2c2;box-shadow:inset 0 0 0 1px #c9a14a;touch-action:manipulation}
.rwq-chip.on{background:#0f3a27;color:#ffe9a8;box-shadow:inset 0 0 0 2px #e9c46a}
.rwq-chip:disabled{cursor:not-allowed;opacity:.55}
.rwq-chip i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
.rwq-passenger{display:flex;align-items:center;gap:14px;padding:12px;border-radius:16px;background:linear-gradient(180deg,#fffaf0,#f3e3bd);box-shadow:inset 0 0 0 1px #c9a14a}
.rwq-avatar{position:relative;flex:none;display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:linear-gradient(160deg,#2f8a5a,#0f3a27);color:#ffe9a8;font:900 24px/1 Georgia,serif}
.rwq-avatar[data-frame=bronze]{box-shadow:0 0 0 4px #c98a52,0 0 0 6px #6b3d1a}
.rwq-avatar[data-frame=silver]{box-shadow:0 0 0 4px #dfe5ec,0 0 0 6px #7d8794,0 0 12px #cfd6df}
.rwq-avatar[data-frame=gold]{box-shadow:0 0 0 4px #f2c94c,0 0 0 6px #8a5a0b,0 0 16px #f2c94c}
.rwq-avatar[data-frame=legend]::before{content:'';position:absolute;inset:-6px;border-radius:50%;z-index:-1;background:conic-gradient(#ff6f91,#ffd36b,#7cf29c,#5ee7df,#8b5cf6,#ff6f91);animation:rwqSpin 4s linear infinite}
.rwq-avatar[data-frame=legend]{isolation:isolate}
.rwq-passenger b{display:block;font:800 17px/1.2 Georgia,serif}.rwq-passenger em{display:block;color:#8a5a00;font:italic 700 14px/1.3 Georgia,serif}
.rwq-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:10px}
.rwq-stat{padding:10px;border-radius:14px;background:#0f3a27;color:#ffe9a8;text-align:center;box-shadow:inset 0 0 0 2px #c9a14a}
.rwq-stat b{display:block;font:800 24px/1.1 Georgia,serif}.rwq-stat small{font:700 11px/1.3 system-ui;letter-spacing:.1em;text-transform:uppercase;color:#e9c46a}
.rwq-log{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.rwq-log li{display:flex;justify-content:space-between;gap:10px;padding:6px 10px;border-radius:10px;background:#fffdf6;box-shadow:inset 0 0 0 1px #eadbb4;font-size:13px}
.rwq-log li b{flex:none;color:#2f8a5a}.rwq-log li small{display:block;color:#7a6a4a}
.rwq-words{display:flex;flex-wrap:wrap;gap:6px}
.rwq-word{padding:4px 12px;border-radius:999px;background:#fffdf6;box-shadow:inset 0 0 0 1px #c9a14a;font:700 14px/1.4 Georgia,serif}
.rwq-word small{margin-left:6px;color:#8a7650;font:600 11px system-ui}
.rwq-howto{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px 16px;margin:0;padding:0;list-style:none;font-size:13px}
.rwq-howto li{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #e0cc9a;padding:3px 0}.rwq-howto li b{color:#2f8a5a}
@media (max-width:700px),(max-height:500px){.rwq-count{font-size:12px;padding:5px 12px}}
@media (max-width:700px){.rwq-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}}
@media (prefers-reduced-motion:reduce){.rwq-count.ready,body[data-rwq-theme]::after,.rwq-avatar::before{animation:none!important}}`;
  document.head.append(css);

  /* ---------- the countdown, title and theme on the ticket page ---------- */
  function gateState() {
    try { const g = readLS(PREFIX + 'journey_gate_' + Q.learnerKey(), {}) || {}; return g } catch { return {} }
  }
  function countdown() {
    const s = Q.load(), date = Q.postTestDate(), main = s.main?.program;
    const mainDone = !!(main && (s.snap?.dest?.[main]?.done || gateState().doneBy?.[main]));
    let el = document.querySelector('.rwq-count');
    let text = '', ready = false;
    if (!s.postTest && main) {
      if (mainDone) { text = '🎟️ <b>Your post-test is ready!</b>'; ready = true }
      else if (date) {
        const n = Q.daysUntil(date);
        if (n <= 0) { text = '🎟️ <b>Your post-test is ready!</b>'; ready = true }
        else text = `⏳ Post-test opens in <b>${n} day${n === 1 ? '' : 's'}</b>. Finish your Main Quest!`;
      }
    }
    const ticket = document.querySelector('.pf-ticket');
    if (!text || !ticket || !ticket.getBoundingClientRect().width) { el?.remove(); return }
    if (!el) { el = document.createElement('div'); el.className = 'rwq-count'; el.setAttribute('role', 'status'); document.body.append(el) }
    if (el.innerHTML !== text) el.innerHTML = text;
    el.classList.toggle('ready', ready);
    // A tab just above the ticket (over the station scene), so it never covers the stops or the frames.
    // It stays hidden while the ticket is still sliding in, then fades in above it.
    const r = ticket.getBoundingClientRect(), still = Math.abs(r.top - (countdown.lastTop ?? -9999)) < 1 && r.bottom > 0 && r.top < innerHeight;
    countdown.lastTop = r.top;
    el.style.left = Math.round(r.left + r.width / 2) + 'px';
    el.style.top = Math.max(4, Math.round(r.top - el.offsetHeight - 8)) + 'px';
    el.style.opacity = still ? '1' : '0';
  }
  function decorate() {
    const s = Q.load();
    const theme = Q.THEMES.find(t => t.id === s.equipped.theme && Q.needMet(s, t.need));
    if (theme && theme.id !== 'station') document.body.dataset.rwqTheme = theme.id; else delete document.body.dataset.rwqTheme;
    const title = Q.TITLES.find(t => t.id === s.equipped.title && Q.needMet(s, t.need) && t.id !== 'passenger');
    const box = document.querySelector('.tk-title');
    let tag = box?.querySelector('.rwq-ticket-title');
    if (box && title) { if (!tag) { tag = document.createElement('span'); tag.className = 'rwq-ticket-title'; box.append(tag) } tag.textContent = '“' + title.name + '”' }
    else tag?.remove();
    countdown();
  }

  /* ---------- panels (tabs in the Badge Shop) ---------- */
  const initials = n => String(n || 'R').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'R';
  function badgesPanel() {
    const s = Q.load(), mine = Q.owned(s).length;
    const cats = ['Skill', 'Destination', 'Streak', 'Explorer', 'Improvement', 'Points', 'Secret'];
    return `<h3>My Badges · ${mine} of ${Q.BADGES.length}</h3><p class="rwq-note">Colourful badges are yours. Grey ones show how to earn them. Secret badges stay hidden until you find them.</p>` +
      cats.map(cat => `<h4>${cat}${cat === 'Secret' ? ' badges' : ''}</h4><div class="rwq-grid">${Q.BADGES.filter(b => b.cat === cat).map(b => {
        const got = !!s.badges[b.id], hidden = b.secret && !got;
        return `<div class="rwq-bcard${got ? '' : ' locked'}">${Q.badgeHTML(b, { locked: !got, size: 62 })}<b>${hidden ? '???' : esc(b.name)}</b><span class="rwq-tier" data-t="${b.tier}">${b.tier}</span><small>${hidden ? 'Keep exploring to discover this badge.' : got ? 'Earned!' : 'How to earn: ' + esc(b.how)}</small></div>`;
      }).join('')}</div>`).join('');
  }
  function chips(list, kind, s) {
    return `<div class="rwq-chips">${list.map(x => {
      const open = Q.needMet(s, x.need), on = s.equipped[kind] === x.id && open;
      return `<button type="button" class="rwq-chip${on ? ' on' : ''}" data-rwq-equip="${kind}" data-id="${x.id}" ${open ? '' : 'disabled'} title="${open ? esc(x.name) : esc(Q.needText(x.need))}">${x.swatch ? `<i style="background:${x.swatch}"></i>` : ''}${esc(x.name)}${open ? '' : ' 🔒'}</button>`;
    }).join('')}</div>`;
  }
  function privilegesPanel() {
    const s = Q.load(), u = me(), frame = Q.FRAMES.find(f => f.id === s.equipped.frame && Q.needMet(s, f.need)) || Q.FRAMES[0];
    const title = Q.TITLES.find(t => t.id === s.equipped.title && Q.needMet(s, t.need)) || Q.TITLES[0];
    const tk = Q.tokens(s), main = s.main?.program, mainDone = !!(main && s.snap?.dest?.[main]?.done);
    const sides = ['aral', 'interv', 'sra'].filter(d => d !== main);
    const preview = !main ? '<p class="rwq-note">Take the Keypass first to get your Main Quest.</p>'
      : mainDone ? '<p class="rwq-note">Your Side Quests are already open. Enjoy exploring!</p>'
      : Q.previewAllowed(s) ? `<p class="rwq-note">Your Gold badge lets you preview one Side Quest before you finish your Main Quest. Preview work does not earn points.</p><div class="rwq-chips">${sides.map(d => `<button type="button" class="rwq-chip${s.preview === d ? ' on' : ''}" data-rwq-preview="${d}">${esc(Q.NAMES[d])}</button>`).join('')}${s.preview ? '<button type="button" class="rwq-chip" data-rwq-preview="">Stop preview</button>' : ''}</div>`
      : '<p class="rwq-note">🔒 Earn any Gold badge to preview one Side Quest early (without points).</p>';
    return `<div class="rwq-passenger"><span class="rwq-avatar" data-frame="${frame.id}">${esc(initials(u.name))}</span><span><b>${esc(u.name || 'Passenger')}</b><em>“${esc(title.name)}”</em></span></div>
<h4>Avatar frame</h4>${chips(Q.FRAMES, 'frame', s)}
<h4>Dashboard colour theme</h4>${chips(Q.THEMES, 'theme', s)}
<h4>Profile title</h4>${chips(Q.TITLES, 'title', s)}
<h4>Hint tokens</h4><p class="rwq-note">You have <b>${tk.hint}</b> hint token${tk.hint === 1 ? '' : 's'}. You get one for every ${Q.POINTS.hintTokenEvery} points and one for every Gold or Legendary badge. Inkventure uses a hint token first when you ask for a hint.</p>
<h4>Early access to a Side Quest</h4>${preview}`;
  }
  function pointsPanel() {
    const s = Q.load(), P = Q.POINTS, all = Object.entries(s.log).map(([k, a]) => ({ k, ...a })).sort((a, b) => (b.t || 0) - (a.t || 0));
    const week = all.filter(a => Date.now() - (a.t || 0) < 7 * 864e5).reduce((n, a) => n + (a.a || 0), 0);
    const shopSpent = Math.max(0, Number((readLS(PREFIX + 'badges_' + Q.learnerKey(), {}) || {}).spent) || 0);
    const row = (label, v) => `<li><span>${label}</span><b>${v}</b></li>`;
    return `<div class="rwq-stats"><div class="rwq-stat"><b>${Q.total(s)}</b><small>Points earned</small></div><div class="rwq-stat"><b>${week}</b><small>This week</small></div>
<div class="rwq-stat"><b>${Q.streak(s)}</b><small>Day streak</small></div><div class="rwq-stat"><b>${Math.max(0, Q.total(s) - shopSpent)}</b><small>To spend</small></div></div>
<h4>How to earn points</h4><ul class="rwq-howto">${row('Finish Keypass / Voice Station / Spellscript', P.keypass + ' each')}${row('Daily login', P.dailyLogin)}${row('Login streak 3 / 7 / 14 / 30 days', Object.values(P.streakBonus).join(' / '))}
${row('Finish a lesson or task', P.task + '+')}${row('90%+ accuracy on a task', '+' + P.accuracyBonus)}${row('Finish your Main Quest', P.mainQuestFinished)}${row('Take the Post-Test', P.postTest)}
${row('Post-Test improvement', '+' + P.improvementPerPoint + ' per point')}${row('Word Vault word (Reading Lab)', '+' + P.readingLab.wordVaultWord)}${row('Side Quest: Challenge / Review', '×' + P.sideQuest.challenge + ' / ×' + P.sideQuest.review)}</ul>
<p class="rwq-note">Task points are evened out so every destination's Main Quest is worth about the same. Points never change your Keypass or Post-Test score.</p>
<h4>Recent points</h4>${all.length ? `<ul class="rwq-log">${all.slice(0, 40).map(a => `<li><span>${esc(a.r)}<small>${a.t ? new Date(a.t).toLocaleString() : ''}</small></span><b>+${a.a}</b></li>`).join('')}</ul>` : '<p class="rwq-note">No points yet. Finish a task to earn your first points!</p>'}`;
  }
  function vaultPanel() {
    const v = readLS(Q.vaultKey(), []) || [], C = Q.POINTS.readingLab;
    return `<h3>📒 Word Vault · ${v.length} word${v.length === 1 ? '' : 's'}</h3>
<p class="rwq-note">Collect new words from Reading Lab passages: <b>double-tap</b> (or double-click) a word while you read, then tap “Add to Word Vault”. Each new word earns +${C.wordVaultWord} points (up to ${C.wordVaultMax} words).</p>
${v.length ? `<div class="rwq-words">${v.slice().reverse().map(x => `<span class="rwq-word">${esc(x.w)}${x.src ? `<small>${esc(x.src)}</small>` : ''}</span>`).join('')}</div>` : '<p class="rwq-note">Your vault is empty. Open the Reading Lab and collect your first word!</p>'}`;
  }
  const PANELS = { badges: badgesPanel, privileges: privilegesPanel, points: pointsPanel, vault: vaultPanel };
  function panel(name) { try { return (PANELS[name] || badgesPanel)() } catch (e) { return '<p>Could not show this page.</p>' } }
  // Clicks inside a panel. Returns true when it changed something (the panel is drawn again).
  function panelClick(e) {
    const eq = e.target.closest('[data-rwq-equip]');
    if (eq && !eq.disabled) { const s = Q.load(); s.equipped[eq.dataset.rwqEquip] = eq.dataset.id; Q.save(s); decorate(); Q.sync(); return true }
    const pv = e.target.closest('[data-rwq-preview]');
    if (pv) { const s = Q.load(); s.preview = pv.dataset.rwqPreview || null; Q.save(s); return true }
    return false;
  }

  const tick = () => { decorate() };
  addEventListener('DOMContentLoaded', tick);
  addEventListener('load', () => { tick(); setTimeout(tick, 1500) });
  addEventListener('readwy-quests-change', tick);
  addEventListener('resize', () => { clearTimeout(tick.r); tick.r = setTimeout(countdown, 120) });
  addEventListener('orientationchange', () => setTimeout(countdown, 350));
  setTimeout(countdown, 2600); setTimeout(countdown, 5000);
  setInterval(() => { if (!document.hidden) countdown() }, 500); // follows the ticket while it slides in or the screen turns
  window.READwyQuestsUI = { panel, panelClick, decorate };
})();
