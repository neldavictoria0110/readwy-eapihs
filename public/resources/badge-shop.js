/* READwy Badge Shop (journey ticket page).
   Since 2026-11-28 the shop uses READwy POINTS (resources/quests.js) instead of coins, with prices doubled to match.
   Each learner's old coin balance is kept: on the first visit their coins (×2) become a floor for what they can
   spend, so nobody loses anything. The shop also shows the My Badges, Privileges, Points and Word Vault tabs
   (resources/quests-ui.js). Old coin rules, kept for that one-time conversion:
     Reading Lab: 15 coins for each text whose questions are passed, 15 for each passed writing task;
     Inkventure: 10 coins for each station task won, 10 for each writing task saved;
     Catch-Up Express: 10 coins for each submitted activity.
   Coins buy badges. Badges are for looks and give small privileges (ticket colours, a boarding whistle,
   special ticket finishes). They never change a score, open a locked stop or skip any work.
   The shop is drawn over the live station scene of the journey page (frosted glass, wood-and-glass cases,
   metal medals). Progress is saved in this browser for each learner. */
(() => {
  const STORE = 'READwy_new_2026_local_';
  const read = (k, f = null) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v } catch { return f } };
  const user = read(STORE + 'user', {}) || {};
  if (!user || user.role === 'teacher') return;
  const learner = String(user.id || user.lrn || user.email || 'local').trim().toLowerCase();
  const RECORD_KEY = STORE + 'badges_' + learner;

  const BADGES = [
    { id: 'ticket', name: 'Ticket Holder', tier: 'Bronze', price: 100,
      perks: ['Bronze badge pinned on your journey ticket', 'Your badge title shown on the ticket'] },
    { id: 'conductor', name: 'Conductor', tier: 'Silver', price: 300,
      perks: ['Silver badge on your ticket', 'Unlock Navy and Burgundy ticket colours', 'A train whistle when you board'] },
    { id: 'stationmaster', name: 'Station Master', tier: 'Gold', price: 800,
      perks: ['Gold badge on your ticket', 'Gold-foil ticket with a shimmer', 'All Conductor privileges'] },
    { id: 'captain', name: 'Express Captain', tier: 'Gem', price: 1800,
      perks: ['Gem badge on your ticket', 'Sparkling gem ticket', 'Glowing boarding panel', 'All earlier privileges'] },
    { id: 'legend', name: 'Grand Central Legend', tier: 'Crown', price: null, earn: 'Finish all six Reading Lab stations',
      perks: ['Crown badge, earned and never sold', 'Diamond legend ticket', 'All privileges'] }
  ];
  const RANK = Object.fromEntries(BADGES.map((b, i) => [b.id, i]));
  const THEMES = [
    { id: 'forest', name: 'Forest green', need: null },
    { id: 'navy', name: 'Navy', need: 'conductor' },
    { id: 'burgundy', name: 'Burgundy', need: 'conductor' },
    { id: 'gold', name: 'Gold foil', need: 'stationmaster' },
    { id: 'gem', name: 'Gem sparkle', need: 'captain' },
    { id: 'legend', name: 'Diamond legend', need: 'legend' }
  ];

  /* ---------- coins ---------- */
  function sraProgress() { return read('sra-rw-journey-v1', {}) || {} }
  function legendEarned() {
    const P = sraProgress(); if (!P.texts) return false;
    const start = Number(P.start ?? 0);
    for (let level = start; level < 6; level++) for (let n = 1; n <= 10; n++) {
      const t = P.texts[`${7 + level}-${n}`]; if (!(t && t.quizPassed && t.writing && t.writing.passed)) return false;
    }
    return true;
  }
  function earned() {
    let coins = 0;
    const P = sraProgress();
    for (const t of Object.values(P.texts || {})) { if (t?.quizPassed) coins += 15; if (t?.writing?.passed) coins += 15 }
    const ivKey = 'readwy-interv-stations-v1-' + encodeURIComponent(String(user.id || user.lrn || user.email || user.name || 'local'));
    const iv = read(ivKey, {}) || {};
    for (const grade of Object.values(iv.st || {})) for (const station of Object.values(grade || {})) for (const task of Object.values(station?.t || {})) {
      if (task?.g?.won) coins += 10; if (task?.w) coins += 10;
    }
    const seen = new Set();
    const countSubmitted = v => { if (!v || typeof v !== 'object') return 0; let n = v.submitted === true ? 1 : 0; for (const x of Object.values(v)) n += countSubmitted(x); return n };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      const m = k.match(/^READwy_new_2026_local_(?:student_[^_]+_)?(aral_responses_v2_\d+)$/); if (!m || seen.has(m[1])) continue;
      seen.add(m[1]); coins += 10 * countSubmitted(read(k, {}));
    }
    return coins;
  }
  function record() {
    const r = read(RECORD_KEY, {}) || {};
    const out = { spent: Math.max(0, Number(r.spent) || 0), owned: Array.isArray(r.owned) ? r.owned.filter(id => RANK[id] != null) : [], equipped: r.equipped || '', theme: r.theme || 'forest',
      unit: r.unit || 'coins', floor: Math.max(0, Number(r.floor) || 0) };
    // One-time switch from coins to points: spent coins ×2 (prices doubled) and the old earnings ×2 kept as a floor.
    if (out.unit !== 'points' && window.READwyQuests) {
      out.floor = earned() * 2; out.spent = out.spent * 2; out.unit = 'points';
      saveRecord(out);
    }
    return out;
  }
  function saveRecord(r) { try { localStorage.setItem(RECORD_KEY, JSON.stringify(r)) } catch {} }
  function owns(r, id) { return id === 'legend' ? legendEarned() : r.owned.includes(id) }
  function highest(r) { let best = -1; for (const b of BADGES) if (owns(r, b.id)) best = Math.max(best, RANK[b.id]); return best }
  function themeOpen(r, t) { return !t.need || highest(r) >= RANK[t.need] || (t.need === 'legend' && legendEarned()) }
  const points = r => window.READwyQuests ? Math.max(window.READwyQuests.total(), r.floor || 0) : earned();
  const balance = r => Math.max(0, points(r) - r.spent);

  /* ---------- medals (metal, ribbon, emblem) ---------- */
  const METAL = {
    Bronze: ['#ffe0bd', '#d08a52', '#8a4b22', '#4d240b'], Silver: ['#ffffff', '#d7dde6', '#8f9aa8', '#4b5563'],
    Gold: ['#fff6c8', '#f2c94c', '#b8860b', '#5e4206'], Gem: ['#f4ecff', '#b59cff', '#5b3fb8', '#26145e'], Crown: ['#fffbe6', '#ffd75e', '#c98d0a', '#6b4600']
  };
  const RIBBON = { Bronze: ['#1d5b3a', '#2f8a5a'], Silver: ['#1b3b6f', '#2f63b5'], Gold: ['#7a1622', '#b8303f'], Gem: ['#3b1d6e', '#6a3fc0'], Crown: ['#0f3a27', '#c9a14a'] };
  let uid = 0;
  function medal(tier, size = 120) {
    const m = METAL[tier], rb = RIBBON[tier], id = 'rwm' + (++uid);
    const emblem = tier === 'Crown'
      ? `<path d="M34 70 L40 44 L52 58 L60 38 L68 58 L80 44 L86 70 Z" fill="url(#${id}e)" stroke="${m[3]}" stroke-width="1.6"/><rect x="34" y="70" width="52" height="7" rx="2" fill="url(#${id}e)" stroke="${m[3]}" stroke-width="1.2"/><circle cx="60" cy="54" r="4.5" fill="#e8f6ff" stroke="#7fb4d6"/>`
      : tier === 'Gem'
        ? `<path d="M60 36 L80 52 L60 86 L40 52 Z" fill="url(#${id}g)" stroke="#2a1660" stroke-width="1.4"/><path d="M40 52 H80 M60 36 L52 52 L60 86 L68 52 Z" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>`
        : `<g transform="translate(60 60)"><path d="M-21 6 h34 l8 -10 h-6 v-8 h-6 v8 h-8 v-12 h-14 l-4 4 v18 z" fill="${m[3]}" opacity=".85"/><circle cx="-13" cy="10" r="5" fill="${m[3]}"/><circle cx="7" cy="10" r="5" fill="${m[3]}"/><path d="M-26 -16 l3.4 7 7.6 1.1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1.1z" transform="translate(0 -8) scale(.55)" fill="${m[0]}"/></g>`;
    return `<svg class="rw-medal-svg" viewBox="0 0 120 150" width="${size}" height="${size * 1.25}" aria-hidden="true">
<defs>
 <radialGradient id="${id}m" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${m[0]}"/><stop offset=".35" stop-color="${m[1]}"/><stop offset=".75" stop-color="${m[2]}"/><stop offset="1" stop-color="${m[3]}"/></radialGradient>
 <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${m[3]}"/><stop offset=".5" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[3]}"/></linearGradient>
 <linearGradient id="${id}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${METAL.Gold[0]}"/><stop offset=".5" stop-color="${METAL.Gold[1]}"/><stop offset="1" stop-color="${METAL.Gold[2]}"/></linearGradient>
 <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6d8ff"/><stop offset=".45" stop-color="#8b5cf6"/><stop offset="1" stop-color="#2e1065"/></linearGradient>
 <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rb[0]}"/><stop offset=".5" stop-color="${rb[1]}"/><stop offset="1" stop-color="${rb[0]}"/></linearGradient>
 <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".45"/></filter>
</defs>
<path d="M38 100 L26 146 L42 136 L50 148 L58 106 Z M82 100 L94 146 L78 136 L70 148 L62 106 Z" fill="url(#${id}b)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
<g filter="url(#${id}s)"><circle cx="60" cy="62" r="46" fill="url(#${id}m)"/><circle cx="60" cy="62" r="46" fill="none" stroke="url(#${id}r)" stroke-width="5"/>
<circle cx="60" cy="62" r="37" fill="none" stroke="${m[3]}" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="2 3"/>${emblem}
<ellipse cx="45" cy="38" rx="20" ry="9" fill="#fff" opacity=".35" transform="rotate(-28 45 38)"/></g></svg>`;
  }

  /* ---------- styles ---------- */
  const css = document.createElement('style');
  css.id = 'rw-badge-shop-style';
  css.textContent = `
.rw-shop-open{position:fixed;left:10px;top:52px;z-index:41;display:grid;place-items:center;width:58px;height:50px;padding:0;border:0;border-radius:14px;cursor:pointer;
 background:radial-gradient(ellipse at 50% 0%,rgba(255,230,150,.28),transparent 60%),linear-gradient(180deg,#1f5c40,#0f3a27);
 box-shadow:inset 0 0 0 2px #c9a14a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(233,196,106,.55),0 6px 14px rgba(0,0,0,.45);transition:transform .2s,box-shadow .2s}
.rw-shop-open svg{width:44px;height:40px;display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,.45))}
.rw-shop-open:hover,.rw-shop-open:focus-visible{transform:translateY(-2px);outline:none;box-shadow:inset 0 0 0 2px #e9c46a,inset 0 0 0 4px #0f3a27,inset 0 0 0 5px rgba(255,220,130,.85),0 0 16px rgba(255,214,120,.45),0 8px 18px rgba(0,0,0,.5)}
.rw-shop-open:hover .rw-awning{animation:rwAwning .6s ease}
@keyframes rwAwning{40%{transform:translateY(-1.5px)}}
.rw-coin{display:inline-block;flex:none;width:1.2em;height:1.2em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c8,#f2c94c 40%,#b8860b 78%,#6b4600);box-shadow:inset 0 0 0 2px rgba(110,70,0,.55),0 1px 2px rgba(0,0,0,.45)}
.rw-coin::after{content:'R';display:grid;place-items:center;height:100%;color:#6b4600;font:900 .62em/1 Georgia,serif}
.rw-pin{position:fixed;z-index:42;width:58px;pointer-events:auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));animation:rwPinIn .6s cubic-bezier(.2,1.6,.4,1)}
.rw-pin svg{width:100%;height:auto;display:block}
.rw-pin b{position:absolute;left:50%;top:100%;translate:-50% -2px;white-space:nowrap;padding:1px 8px;border-radius:999px;background:#0f3a27;color:#ffe9a8;font:700 10px/1.5 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 0 0 1px #c9a14a}
@keyframes rwPinIn{from{transform:scale(.3) rotate(-30deg);opacity:0}}
.pf-ticket[data-rw-theme=navy] .tk-top{background:linear-gradient(100deg,#0f2a52,#1f4f92 55%,#0f2a52)!important}
.pf-ticket[data-rw-theme=navy] .pf-stub{background:linear-gradient(170deg,#1f4f92,#12356a 60%,#0a1f40)!important}
.pf-ticket[data-rw-theme=burgundy] .tk-top{background:linear-gradient(100deg,#4a0d18,#8a1d2c 55%,#4a0d18)!important}
.pf-ticket[data-rw-theme=burgundy] .pf-stub{background:linear-gradient(170deg,#8a1d2c,#5e1220 60%,#3d0a14)!important}
.pf-ticket[data-rw-theme=gold] .tk-top{background:linear-gradient(100deg,#8a5a0b,#e9c46a 45%,#fff3c8 55%,#b8860b)!important}
.pf-ticket[data-rw-theme=gold] .tk-top span{color:#2b1d07!important;text-shadow:0 1px 0 rgba(255,255,255,.5)!important}
.pf-ticket[data-rw-theme=gold] .pf-stub{background:linear-gradient(170deg,#9a6c12,#6b4600 60%,#4a3000)!important}
.pf-ticket[data-rw-theme=gem] .tk-top{background:linear-gradient(100deg,#2a1257,#6a3fc0 55%,#2a1257)!important}
.pf-ticket[data-rw-theme=gem] .pf-stub{background:linear-gradient(170deg,#6a3fc0,#3b1d6e 60%,#22104a)!important}
.pf-ticket[data-rw-theme=legend] .tk-top{background:linear-gradient(100deg,#1c2b3e,#5b7a99 45%,#dfeaf5 52%,#5b7a99 60%,#1c2b3e)!important}
.pf-ticket[data-rw-theme=legend] .pf-stub{background:linear-gradient(170deg,#3e5873,#22344a 60%,#141f2e)!important}
.rw-ticket-fx{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:inherit;overflow:hidden}
.pf-ticket[data-rw-theme=gold] .rw-ticket-fx,.pf-ticket[data-rw-theme=legend] .rw-ticket-fx{background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 45%,transparent 55%) -150% 0/60% 100% no-repeat;animation:rwShine 3.6s ease-in-out infinite}
.pf-ticket[data-rw-theme=gem] .rw-ticket-fx,.pf-ticket[data-rw-theme=legend] .rw-ticket-fx{background-image:radial-gradient(circle,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle,#fff 0 1px,transparent 2px),linear-gradient(105deg,transparent 35%,rgba(255,255,255,.4) 45%,transparent 55%);background-size:120px 90px,70px 60px,60% 100%;background-repeat:repeat,repeat,no-repeat;background-position:0 0,30px 20px,-150% 0;animation:rwSparkle 2.4s ease-in-out infinite alternate,rwShine 4s ease-in-out infinite}
@keyframes rwShine{0%,40%{background-position-x:-150%}100%{background-position-x:250%}}
@keyframes rwSparkle{from{opacity:.55}to{opacity:1}}
.pf-stub.rw-glow{box-shadow:0 0 0 3px #b59cff,0 0 26px 6px rgba(181,156,255,.6)!important}
/* ---------- the game-style shop screen ---------- */
.rw-shop{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;gap:clamp(6px,1.4vh,12px);box-sizing:border-box;overflow:hidden;color:#fff;font-family:"Nunito","Trebuchet MS","Segoe UI",system-ui,sans-serif;
 padding:max(clamp(6px,1.6vh,16px),env(safe-area-inset-top)) max(clamp(8px,1.6vw,22px),env(safe-area-inset-right)) max(clamp(6px,1.6vh,16px),env(safe-area-inset-bottom)) max(clamp(8px,1.6vw,22px),env(safe-area-inset-left));
 background:radial-gradient(90% 70% at 0% 0%,rgba(255,95,162,.75),transparent 60%),radial-gradient(90% 80% at 100% 0%,rgba(62,198,255,.7),transparent 60%),radial-gradient(100% 80% at 50% 120%,rgba(124,77,255,.9),transparent 60%),linear-gradient(160deg,#1b1450,#2a0f4f 50%,#0d1b4a);
 animation:rwShopIn .4s cubic-bezier(.22,.9,.28,1)}
.rwg-stars{position:absolute;inset:0;pointer-events:none;opacity:.7;background-image:radial-gradient(2px 2px at 12% 22%,#fff,transparent),radial-gradient(1.5px 1.5px at 38% 70%,#fff,transparent),radial-gradient(2px 2px at 66% 18%,#fff,transparent),radial-gradient(1.5px 1.5px at 82% 62%,#fff,transparent),radial-gradient(2.5px 2.5px at 52% 42%,#ffe36e,transparent),radial-gradient(1.5px 1.5px at 92% 88%,#fff,transparent);background-size:340px 340px;animation:rwgTwinkle 3.5s ease-in-out infinite alternate}
@keyframes rwgTwinkle{to{opacity:.3;background-position:12px -8px}}
body:has(.rw-shop) #rwBadge{display:none!important}
.rw-shop.closing{animation:rwShopOut .3s ease-in forwards}
@keyframes rwShopIn{from{opacity:0;transform:scale(1.04)}}
@keyframes rwShopOut{to{opacity:0;transform:scale(1.03)}}
.rwg-top,.rw-tabs,.rwg-stage{position:relative}
.rwg-top{flex:none;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
.rwg-x{display:grid;place-items:center;width:clamp(38px,6.4vh,50px);aspect-ratio:1;border:0;border-radius:14px;cursor:pointer;color:#fff;font:900 clamp(18px,3vh,24px)/1 system-ui;background:linear-gradient(180deg,#ff7a8a,#e0335a);box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 4px 0 #9c1d3c,0 8px 16px rgba(0,0,0,.35);touch-action:manipulation}
.rwg-x:active{transform:translateY(3px);box-shadow:0 1px 0 #9c1d3c}
.rwg-title{justify-self:center;display:flex;align-items:center;gap:.35em;min-width:0;font:900 clamp(18px,4.2vh,34px)/1 "Nunito","Trebuchet MS",system-ui,sans-serif;letter-spacing:.01em;text-shadow:0 3px 0 rgba(0,0,0,.3),0 0 18px rgba(255,255,255,.35);white-space:nowrap}
.rwg-title span{display:inline-block;animation:rwgBob 2.6s ease-in-out infinite}
@keyframes rwgBob{50%{transform:translateY(-4px) rotate(-6deg)}}
.rw-purse{display:flex;align-items:center;gap:8px;padding:4px 16px 4px 6px;border-radius:999px;color:#4a2300;background:linear-gradient(180deg,#fff3a6,#ffc21a 55%,#ff9f1c);box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #b86400,0 8px 16px rgba(0,0,0,.35)}
.rw-purse .rw-coin{width:clamp(24px,4.6vh,36px);height:clamp(24px,4.6vh,36px)}
.rw-purse b{font:900 clamp(16px,3.6vh,28px)/1 "Nunito","Trebuchet MS",system-ui,sans-serif}
.rw-purse.bump b{animation:rwgBump .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes rwgBump{40%{transform:scale(1.35)}}
.rw-tabs{flex:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(4px,1vw,10px);width:min(100%,920px);margin:0 auto}
.rw-tab{--a:#ffd23f;--b:#ff9f1c;--d:#b86400;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;min-height:clamp(44px,8.6vh,68px);padding:4px;border:0;border-radius:18px;cursor:pointer;color:#fff;
 font:900 clamp(10px,1.8vh,14px)/1.1 "Nunito","Trebuchet MS",system-ui,sans-serif;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 2px rgba(255,255,255,.18),0 4px 0 rgba(0,0,0,.25);transition:transform .15s,background .2s;touch-action:manipulation}
.rw-tab .i{font-size:clamp(18px,3.8vh,30px);line-height:1}
.rw-tab .l{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rw-tab:hover{transform:translateY(-2px)}
.rw-tab[data-tab=badges]{--a:#ff9ad5;--b:#e0458f;--d:#8f1d55}.rw-tab[data-tab=privileges]{--a:#d9a7ff;--b:#7c3aed;--d:#45168f}
.rw-tab[data-tab=points]{--a:#7cf29c;--b:#13a37f;--d:#0a5e48}.rw-tab[data-tab=vault]{--a:#a7e3ff;--b:#3f7fe0;--d:#1d3f8a}
.rw-tab[aria-selected=true]{background:linear-gradient(180deg,var(--a),var(--b));box-shadow:inset 0 2px 0 rgba(255,255,255,.45),0 4px 0 var(--d),0 0 20px var(--b);transform:translateY(-2px)}
.rw-tab[aria-selected=true] .i{animation:rwgBob 2.2s ease-in-out infinite}
.rwg-stage{flex:1 1 0;min-height:0;min-width:0}
.rwg-shopview,.rw-panel{position:absolute;inset:0}
.rwg-shopview{display:flex;flex-direction:column;gap:clamp(6px,1.4vh,12px)}
.rwg-shopview[hidden],.rw-panel[hidden]{display:none!important}
.rw-cases{flex:1 1 0;min-height:0;display:grid;justify-content:center;align-content:center;gap:var(--gap,12px)}
.rw-case{--c1:#ffe36e;--c2:#f5a300;--g:#ffd23f;container-type:size;position:relative;width:var(--w,180px);height:var(--h,260px);box-sizing:border-box;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;justify-items:center;align-items:center;gap:clamp(3px,1.4vh,10px);padding:7% 8% 8%;border-radius:clamp(14px,2.4vh,24px);text-align:center;color:#fff;
 background:radial-gradient(120% 55% at 50% 0%,rgba(255,255,255,.55),transparent 60%),linear-gradient(170deg,var(--c1),var(--c2));box-shadow:inset 0 0 0 3px rgba(255,255,255,.4),0 6px 0 rgba(0,0,0,.25),0 12px 26px rgba(0,0,0,.35);animation:rwCaseIn .55s cubic-bezier(.2,1.4,.4,1) backwards;transition:transform .2s}
.rw-case:nth-child(2){animation-delay:.06s}.rw-case:nth-child(3){animation-delay:.12s}.rw-case:nth-child(4){animation-delay:.18s}.rw-case:nth-child(5){animation-delay:.24s}
@keyframes rwCaseIn{from{opacity:0;transform:translateY(24px) scale(.9)}}
.rw-case:hover{transform:translateY(-5px) rotate(-1deg)}
.rw-case.t-Bronze{--c1:#ffb070;--c2:#e0612a;--g:#ff8a3d}.rw-case.t-Silver{--c1:#a7e3ff;--c2:#3f7fe0;--g:#6cc4ff}.rw-case.t-Gold{--c1:#ffe36e;--c2:#f5a300;--g:#ffd23f}
.rw-case.t-Gem{--c1:#d9a7ff;--c2:#7c3aed;--g:#b388ff}.rw-case.t-Crown{--c1:#ff9ad5;--c2:#c2185b;--g:#ff6fd8}
.rw-case.locked{filter:saturate(.6) brightness(.82)}
.rw-tier{padding:.35em .9em;border-radius:999px;font:900 min(5.4cqh,8.5cqw)/1 "Nunito",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;background:rgba(0,0,0,.25)}
.rw-case-glass{position:relative;width:100%;height:100%;min-height:0;display:grid;place-items:center;border-radius:min(8cqw,20px);background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.6),rgba(255,255,255,.1) 55%,transparent 70%)}
.rw-case .rw-medal-svg{height:100%;max-height:100%;width:auto;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35));transition:transform .35s}
.rw-case:hover .rw-medal-svg{transform:rotate(-6deg) scale(1.06)}
.rw-case.locked .rw-medal-svg{filter:grayscale(.75) brightness(.8)}
.rw-case.locked .rw-case-glass::after{content:'🔒';position:absolute;font-size:min(12cqh,18cqw);opacity:.95;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
.rw-case h3{margin:0;max-width:100%;font:900 min(8.2cqh,11.5cqw)/1.05 "Nunito","Trebuchet MS",system-ui,sans-serif;text-shadow:0 2px 0 rgba(0,0,0,.25)}
.rw-perks{display:flex;gap:2.5cqw;font-size:min(7.5cqh,11cqw);line-height:1}
.rw-perks span{display:grid;place-items:center;width:1.55em;height:1.55em;border-radius:50%;background:rgba(255,255,255,.32);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}
.rw-buy{width:100%;min-height:min(14cqh,46px);display:flex;align-items:center;justify-content:center;gap:.35em;border:0;border-radius:999px;cursor:pointer;color:#4a2300;font:900 min(7.6cqh,11cqw)/1 "Nunito","Trebuchet MS",system-ui,sans-serif;
 background:linear-gradient(180deg,#fff7c2,#ffd23f);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),0 4px 0 #c27c00;transition:transform .1s;touch-action:manipulation}
.rw-buy .rw-coin{width:1.15em;height:1.15em}
.rw-buy:not(:disabled):hover{transform:translateY(-1px);filter:brightness(1.05)}
.rw-buy:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 #c27c00}
.rw-buy:not(:disabled){animation:rwgGlow 2s ease-in-out infinite}
@keyframes rwgGlow{50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.7),0 4px 0 #c27c00,0 0 16px #fff6}}
.rw-buy:disabled{cursor:default;color:rgba(255,255,255,.92);background:rgba(0,0,0,.28);box-shadow:inset 0 0 0 2px rgba(255,255,255,.2);animation:none}
.rw-buy.equip{color:#053b1c;background:linear-gradient(180deg,#b8ffcf,#2ecc71);box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #1a8a47}
.rw-buy.on{color:#2b2b2b;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.45);animation:none}
.rw-case.equipped{box-shadow:inset 0 0 0 3px #fff,0 0 0 4px var(--g),0 0 34px var(--g),0 12px 26px rgba(0,0,0,.35)}
.rw-case.equipped::before{content:'✓';position:absolute;top:-10px;right:-10px;z-index:2;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;color:#053b1c;font:900 17px/1 system-ui;background:linear-gradient(180deg,#b8ffcf,#2ecc71);box-shadow:0 3px 0 #1a8a47,0 4px 10px rgba(0,0,0,.35)}
.rw-case.bought .rw-medal-svg{animation:rwBought .9s cubic-bezier(.2,1.5,.4,1)}
@keyframes rwBought{0%{transform:scale(.4) rotate(-35deg)}60%{transform:scale(1.18) rotate(8deg)}100%{transform:none}}
.rw-themes{flex:none;align-self:center;display:flex;align-items:center;gap:clamp(6px,1.4vw,12px);max-width:100%;box-sizing:border-box;padding:clamp(4px,1vh,8px) clamp(10px,2vw,18px);border-radius:999px;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 2px rgba(255,255,255,.22)}
.rw-tlabel{font-size:clamp(18px,3.6vh,28px);line-height:1}
.rw-chip{position:relative;flex:none;width:clamp(30px,5.8vh,44px);aspect-ratio:1;padding:0;border:0;border-radius:50%;cursor:pointer;font-size:clamp(11px,2.2vh,16px);background:var(--sw);box-shadow:inset 0 0 0 3px rgba(255,255,255,.6),0 3px 0 rgba(0,0,0,.3);transition:transform .15s;touch-action:manipulation}
.rw-chip:hover:not(:disabled){transform:scale(1.1)}
.rw-chip.on{transform:scale(1.14);box-shadow:inset 0 0 0 3px #fff,0 0 0 3px #ffd23f,0 0 16px #ffd23f}
.rw-chip:disabled{cursor:not-allowed;filter:grayscale(.6) brightness(.6)}
.rw-shop-msg{position:absolute;left:50%;bottom:max(16px,env(safe-area-inset-bottom));z-index:3;translate:-50% 0;scale:.85;margin:0;padding:10px 20px;border-radius:999px;max-width:min(92vw,520px);text-align:center;pointer-events:none;opacity:0;transition:opacity .25s,scale .3s cubic-bezier(.2,1.4,.4,1);
 color:#fff;font:900 clamp(13px,2.2vh,16px)/1.3 "Nunito","Trebuchet MS",system-ui,sans-serif;background:linear-gradient(180deg,#36d1dc,#5b86e5);box-shadow:0 4px 0 #2b4f9e,0 10px 22px rgba(0,0,0,.4)}
.rw-shop-msg.show{opacity:1;scale:1}
@media (max-height:480px){.rw-tab{flex-direction:row;gap:6px;min-height:36px}.rw-tab .i{font-size:18px}.rwg-x{width:36px}.rwg-title{font-size:20px}.rw-purse{padding:2px 12px 2px 4px}}
@media (max-width:520px){.rw-tab .l{font-size:10px}.rwg-title b{display:none}.rwg-title span{font-size:1.3em}}

@media (prefers-reduced-motion:reduce){.rw-shop,.rw-case,.rw-pin,.rw-ticket-fx,.rw-case.bought .rw-medal-svg,.rwg-stars,.rwg-title span,.rw-tab .i,.rw-buy{animation:none!important}}`;
  document.head.append(css);

  /* ---------- sounds (Web Audio, no files) ---------- */
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac } catch { return null } };
  function coinSound() {
    const a = audio(); if (!a) return; const t = a.currentTime;
    [988, 1319].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * .08); g.gain.linearRampToValueAtTime(.08, t + i * .08 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .08 + .25); o.connect(g).connect(a.destination); o.start(t + i * .08); o.stop(t + i * .08 + .3) });
  }
  function whistle() {
    const a = audio(); if (!a) return; const t = a.currentTime;
    [[784, 0], [988, 0]].forEach(([f]) => { const o = a.createOscillator(), g = a.createGain(), v = a.createOscillator(), vg = a.createGain(); o.type = 'triangle'; o.frequency.value = f; v.frequency.value = 7; vg.gain.value = 9; v.connect(vg).connect(o.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .06); g.gain.setValueAtTime(.07, t + .7); g.gain.exponentialRampToValueAtTime(.001, t + 1.1); o.connect(g).connect(a.destination); o.start(t); v.start(t); o.stop(t + 1.15); v.stop(t + 1.15) });
  }

  /* ---------- ticket decoration (pin, theme, glow, whistle) ---------- */
  function decorate() {
    const r = record(), ticket = document.querySelector('.pf-ticket'), stub = document.querySelector('.pf-stub');
    if (!ticket) return;
    const theme = THEMES.find(t => t.id === r.theme && themeOpen(r, t)) || THEMES[0];
    if (theme.id === 'forest') ticket.removeAttribute('data-rw-theme'); else ticket.setAttribute('data-rw-theme', theme.id);
    if (!ticket.querySelector(':scope>.rw-ticket-fx')) { const fx = document.createElement('div'); fx.className = 'rw-ticket-fx'; fx.setAttribute('aria-hidden', 'true'); ticket.append(fx) }
    if (stub) {
      if (getComputedStyle(stub).position === 'static') stub.style.position = 'relative';
      stub.classList.toggle('rw-glow', highest(r) >= RANK.captain);
      const eq = BADGES.find(b => b.id === r.equipped && owns(r, b.id));
      let pin = document.querySelector('body>.rw-pin');
      if (!eq) { document.querySelector('body>.rw-pin')?.remove(); return }
      if (!pin || pin.dataset.id !== eq.id) { pin?.remove(); pin = document.createElement('div'); pin.className = 'rw-pin'; pin.dataset.id = eq.id; pin.title = eq.name + ' badge'; pin.innerHTML = medal(eq.tier, 58) + `<b>${eq.name}</b>`; document.body.append(pin) }
      const sr = stub.getBoundingClientRect(), pw = pin.offsetWidth || 58; pin.style.left = Math.round(sr.left - pw * .35) + 'px'; pin.style.top = Math.round(sr.top - pw * .45) + 'px';
    }
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest?.('.pf-stub button'); if (!btn || !/board/i.test(btn.textContent)) return;
    if (highest(record()) >= RANK.conductor) whistle();
  }, true);

  /* ---------- the shop (game-style screen) ---------- */
  let shop = null;
  function say(text) { const m = shop?.querySelector('.rw-shop-msg'); if (!m) return; m.textContent = text; m.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => m.classList.remove('show'), 2600) }
  // Small icons instead of long privilege lists (the full text is in the tooltip).
  const PERK_ICONS = {
    ticket: [['📌', 'Badge pinned on your ticket'], ['🏷️', 'Badge title on your ticket']],
    conductor: [['🎨', 'Navy and Burgundy ticket colours'], ['🔔', 'Train whistle when you board']],
    stationmaster: [['✨', 'Gold-foil ticket with a shimmer'], ['🎨', 'All Conductor colours']],
    captain: [['💎', 'Sparkling gem ticket'], ['🌟', 'Glowing boarding panel']],
    legend: [['👑', 'Crown badge, earned and never sold'], ['💠', 'Diamond legend ticket']]
  };
  function caseHTML(b, r, pts) {
    const own = owns(r, b.id), eq = r.equipped === b.id && own;
    let btn;
    if (b.price == null) btn = own ? (eq ? '<button class="rw-buy on" disabled>✓ Wearing</button>' : '<button class="rw-buy equip" data-act="equip">Wear</button>') : `<button class="rw-buy" disabled title="${b.earn}" aria-label="${b.earn}">🏆 Earn it</button>`;
    else if (eq) btn = '<button class="rw-buy on" disabled>✓ Wearing</button>';
    else if (own) btn = '<button class="rw-buy equip" data-act="equip">Wear</button>';
    else if (pts >= b.price) btn = `<button class="rw-buy" data-act="buy" aria-label="Buy for ${b.price} points"><i class="rw-coin"></i>${b.price}</button>`;
    else btn = `<button class="rw-buy" disabled aria-label="Need ${b.price - pts} more points">🔒 ${b.price}</button>`;
    const locked = !own && (b.price == null || pts < b.price);
    return `<article class="rw-case t-${b.tier}${own ? ' owned' : ''}${eq ? ' equipped' : ''}${locked ? ' locked' : ''}" data-id="${b.id}" title="${b.perks.join(' · ')}">
<span class="rw-tier">${b.tier}</span><div class="rw-case-glass">${medal(b.tier, 120)}</div><h3>${b.name}</h3>
<div class="rw-perks">${(PERK_ICONS[b.id] || []).map(([i, t]) => `<span title="${t}" aria-label="${t}">${i}</span>`).join('')}</div>${btn}</article>`;
  }
  const SWATCH = { forest: '#1d5b3a', navy: '#1b3b6f', burgundy: '#7a1622', gold: 'linear-gradient(135deg,#fff6c8,#d4a017)', gem: 'linear-gradient(135deg,#e6d8ff,#6a3fc0)', legend: 'linear-gradient(135deg,#fff,#a8c8e0)' };
  /* Size n equal cards (height = aspect × width) so they all fit the grid's box, as large as possible (up to max px). */
  function fitGrid(grid, n, aspect, gap, max) {
    const W = grid.clientWidth, H = grid.clientHeight;
    let best = 0, cols = 1;
    for (let c = 1; c <= n; c++) {
      const rows = Math.ceil(n / c), w = Math.min((W - (c - 1) * gap) / c, (H - (rows - 1) * gap) / rows / aspect);
      if (w > best) { best = w; cols = c }
    }
    const w = Math.max(20, Math.floor(Math.min(best, max)));
    grid.style.setProperty('--gap', gap + 'px');
    grid.style.gridTemplateColumns = `repeat(${cols},${w}px)`;
    grid.style.setProperty('--w', w + 'px'); grid.style.setProperty('--h', Math.floor(w * aspect) + 'px');
    return w;
  }
  window.readwyFitGrid = fitGrid;
  function layout() {
    if (!shop) return;
    const tab = shop.dataset.tab || 'shop';
    if (tab === 'shop') { const g = shop.querySelector('.rw-cases'); if (g.clientHeight) fitGrid(g, BADGES.length, 1.5, innerWidth < 600 ? 10 : 16, 230) }
    else window.READwyQuestsUI?.layout?.(tab, shop.querySelector('.rw-panel'));
  }
  function render(bought) {
    if (!shop) return;
    const r = record(), pts = balance(r), purse = shop.querySelector('.rw-purse b');
    if (purse.textContent !== String(pts)) { purse.textContent = pts; purse.parentElement.classList.remove('bump'); void purse.offsetWidth; purse.parentElement.classList.add('bump') }
    shop.querySelector('.rw-cases').innerHTML = BADGES.map(b => caseHTML(b, r, pts)).join('');
    if (bought) shop.querySelector(`.rw-case[data-id="${bought}"]`)?.classList.add('bought');
    shop.querySelector('.rw-themes').innerHTML = '<span class="rw-tlabel" title="Ticket colour" aria-hidden="true">🎟️</span>' + THEMES.map(t => {
      const open = themeOpen(r, t), on = r.theme === t.id && open;
      return `<button class="rw-chip${on ? ' on' : ''}" data-theme="${t.id}" style="--sw:${SWATCH[t.id]}" ${open ? '' : 'disabled'} title="${open ? t.name : '🔒 ' + BADGES[RANK[t.need]].name + ' badge'}" aria-label="${t.name} ticket${open ? '' : ' (locked)'}" aria-pressed="${on}">${open ? '' : '🔒'}</button>`;
    }).join('');
    layout();
  }
  const TABS = [['shop', '🏪', 'Shop'], ['badges', '🏅', 'Badges'], ['privileges', '✨', 'Perks'], ['points', '⭐', 'Points'], ['vault', '📒', 'Words']];
  const TITLES = { shop: 'Badge Shop', badges: 'My Badges', privileges: 'Privileges', points: 'Points', vault: 'Word Vault' };
  function open() {
    if (shop) return;
    shop = document.createElement('div');
    shop.className = 'rw-shop'; shop.setAttribute('role', 'dialog'); shop.setAttribute('aria-modal', 'true'); shop.setAttribute('aria-label', 'READwy Badge Shop');
    shop.innerHTML = `<div class="rwg-stars" aria-hidden="true"></div>
<header class="rwg-top"><button class="rw-shop-close rwg-x" type="button" aria-label="Back to ticket" title="Back to ticket">✕</button>
<div class="rwg-title"><span aria-hidden="true">🏪</span><b>Badge Shop</b></div>
<div class="rw-purse" aria-label="Your points to spend" title="Points to spend"><i class="rw-coin"></i><b>0</b></div></header>
<nav class="rw-tabs" role="tablist" aria-label="Badge Shop pages">${TABS.map(([id, icon, label]) => `<button type="button" class="rw-tab" role="tab" data-tab="${id}" aria-selected="${id === 'shop'}" aria-label="${TITLES[id]}"><span class="i" aria-hidden="true">${icon}</span><span class="l">${label}</span></button>`).join('')}</nav>
<main class="rwg-stage"><div class="rwg-shopview"><div class="rw-cases"></div><div class="rw-themes"></div></div><div class="rw-panel" hidden></div></main>
<p class="rw-shop-msg" role="status" aria-live="polite"></p>`;
    document.body.append(shop);
    shop.dataset.tab = 'shop';
    render();
    requestAnimationFrame(layout);
    shop.addEventListener('click', e => {
      if (e.target.closest('.rw-shop-close')) return close();
      const tab = e.target.closest('.rw-tab'); if (tab) return showTab(tab.dataset.tab);
      if (e.target.closest('.rw-panel')) { if (window.READwyQuestsUI?.panelClick(e)) { showTab(shop.dataset.tab); render() } return }
      const chip = e.target.closest('.rw-chip'); if (chip && !chip.disabled) { const r = record(); r.theme = chip.dataset.theme; saveRecord(r); render(); decorate(); say('🎟️ New ticket colour!'); return }
      const btn = e.target.closest('.rw-buy[data-act]'); if (!btn) return;
      const id = btn.closest('.rw-case').dataset.id, b = BADGES[RANK[id]], r = record();
      if (btn.dataset.act === 'buy') {
        if (owns(r, id) || b.price == null) return;
        if (balance(r) < b.price) return say('Not enough points yet!');
        r.spent += b.price; r.owned.push(id); r.equipped = id; saveRecord(r); coinSound(); render(id); decorate();
        try { window.READwyQuests?.confetti?.(70) } catch {}
        say(`🎉 ${b.name} unlocked!`);
      } else if (btn.dataset.act === 'equip') { r.equipped = id; saveRecord(r); render(); decorate(); say(`✨ Wearing ${b.name}`) }
    });
    shop.querySelector('.rw-shop-close').focus({ preventScroll: true });
  }
  function showTab(id) {
    if (!shop) return;
    if (!window.READwyQuestsUI) id = 'shop';
    shop.dataset.tab = id;
    shop.querySelectorAll('.rw-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
    shop.querySelector('.rwg-title').innerHTML = `<span aria-hidden="true">${TABS.find(t => t[0] === id)[1]}</span><b>${TITLES[id]}</b>`;
    const isShop = id === 'shop', p = shop.querySelector('.rw-panel');
    shop.querySelector('.rwg-shopview').hidden = !isShop;
    p.hidden = isShop;
    if (!isShop) p.innerHTML = window.READwyQuestsUI.panel(id);
    layout();
  }
  addEventListener('resize', () => { if (!shop) return; clearTimeout(showTab.r); showTab.r = setTimeout(() => showTab(shop.dataset.tab || 'shop'), 120) });
  function close() { if (!shop) return; const s = shop; shop = null; s.classList.add('closing'); setTimeout(() => s.remove(), 300); document.querySelector('.rw-shop-open')?.focus({ preventScroll: true }) }
  addEventListener('keydown', e => { if (e.key === 'Escape' && shop) close() });

  function addButton() {
    if (!document.querySelector('.pf') || document.querySelector('.rw-shop-open')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rw-shop-open'; b.innerHTML = "<svg viewBox=\"0 0 48 44\" aria-hidden=\"true\"><defs><linearGradient id=\"rwShopGold\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff3c8\"/><stop offset=\".55\" stop-color=\"#e9c46a\"/><stop offset=\"1\" stop-color=\"#a8761e\"/></linearGradient></defs><rect x=\"7\" y=\"17\" width=\"34\" height=\"23\" rx=\"1.5\" fill=\"#fff4dc\" stroke=\"#7a5214\" stroke-width=\"1.4\"/><rect x=\"10\" y=\"22\" width=\"12\" height=\"9\" rx=\"1\" fill=\"#9fd3e8\" stroke=\"#7a5214\" stroke-width=\"1\"/><path d=\"M11 24.5l4-2M11 28l7-4\" stroke=\"#fff\" stroke-width=\".9\" opacity=\".8\"/><rect x=\"27\" y=\"22\" width=\"10\" height=\"18\" rx=\"1\" fill=\"#1f5c40\" stroke=\"#7a5214\" stroke-width=\"1\"/><circle cx=\"34.5\" cy=\"31.5\" r=\".9\" fill=\"#e9c46a\"/><g class=\"rw-awning\"><path d=\"M5 9h38l3 8H2z\" fill=\"url(#rwShopGold)\" stroke=\"#7a5214\" stroke-width=\"1.2\"/><path d=\"M8.4 9 6.5 17M15.3 9 14 17M22.1 9 21.5 17M28.9 9 29 17M35.7 9 36.5 17M41.6 9 44 17\" stroke=\"#b8303f\" stroke-width=\"3.4\"/><path d=\"M2 17q2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0 2.4 3.4 4.8 0\" fill=\"#e9c46a\" stroke=\"#7a5214\" stroke-width=\"1.1\"/><rect x=\"17\" y=\"3\" width=\"14\" height=\"6\" rx=\"1.5\" fill=\"#0f3a27\" stroke=\"#e9c46a\" stroke-width=\"1\"/><circle cx=\"24\" cy=\"6\" r=\"1.8\" fill=\"url(#rwShopGold)\"/></g><circle cx=\"17\" cy=\"35.5\" r=\"4.6\" fill=\"url(#rwShopGold)\" stroke=\"#7a5214\" stroke-width=\"1\"/><text x=\"17\" y=\"37.6\" text-anchor=\"middle\" font-family=\"Georgia,serif\" font-weight=\"900\" font-size=\"6\" fill=\"#6b4600\">R</text></svg>"; b.title = 'Badge Shop';
    b.setAttribute('aria-label', 'Open the Badge Shop, badges and privileges'); b.addEventListener('click', open);
    document.body.append(b);
  }
  /* Ticket page layout. Landscape: BACK and BADGE SHOP stand in a column on the left and the three top frames
     (platform, departure board, announcement) shrink to fit the space to their right, so nothing overlaps.
     Portrait: the frames keep their grid and BADGE SHOP sits beside BACK (or under it on a very narrow screen). */
  function fitTop() {
    const back = document.querySelector('.journey>.back'), btn = document.querySelector('.rw-shop-open'), top = document.querySelector('.pf-top');
    if (!back || !btn || !top) return;
    // BACK appears a moment after the page: until it has a size, keep the default spot and check again soon.
    if (!back.getBoundingClientRect().width) { btn.style.removeProperty('left'); btn.style.removeProperty('top'); clearTimeout(fitTop.wait); fitTop.wait = setTimeout(fitTop, 250); return }
    const W = innerWidth, H = innerHeight, gap = 8;
    const parts = [...top.children].filter(k => k.getBoundingClientRect().width > 0 || k.style.zoom);
    parts.forEach(k => { k.style.zoom = '' }); top.style.removeProperty('padding-left'); top.style.removeProperty('padding-right'); ['left', 'right', 'width', 'transform', 'translate', 'margin-left', 'margin-right'].forEach(p => top.style.removeProperty(p));
    if (H > W) {
      // Portrait: BACK and BADGE SHOP sit in one row a small gap below the frames (never touching them).
      const framesBottom = Math.max(0, ...[...top.querySelectorAll(':scope>*,:scope>*>*')].map(k => k.getBoundingClientRect()).filter(r => r.width > 40 && r.height > 20).map(r => r.bottom));
      if (framesBottom > 0) { back.style.setProperty('top', Math.round(framesBottom + 10) + 'px', 'important'); back.style.setProperty('bottom', 'auto', 'important') }
    } else { back.style.removeProperty('top'); back.style.removeProperty('bottom') }
    const b = back.getBoundingClientRect();
    if (H > W) {
      const w = btn.offsetWidth || 150;
      if (b.right + gap + w <= W - 8) { btn.style.left = Math.round(b.right + gap) + 'px'; btn.style.top = Math.round(b.top + (b.height - btn.offsetHeight) / 2) + 'px' }
      else { btn.style.left = Math.round(b.left) + 'px'; btn.style.top = Math.round(b.bottom + gap) + 'px' }
      return;
    }
    btn.style.left = Math.round(b.left) + 'px'; btn.style.top = Math.round(b.bottom + gap) + 'px';
    const reserve = Math.ceil(Math.max(b.right, b.left + btn.offsetWidth)) + 14;
    const shown = [...top.children].filter(k => k.getBoundingClientRect().width > 0);
    if (!shown.length) return;
    for (const [p, v] of [['left', '0px'], ['right', 'auto'], ['width', '100%'], ['transform', 'none'], ['translate', 'none'], ['margin-left', '0px'], ['margin-right', '0px']]) top.style.setProperty(p, v, 'important');
    top.style.setProperty('padding-left', reserve + 'px', 'important'); top.style.setProperty('padding-right', '12px', 'important');
    const first = shown[0].getBoundingClientRect(), last = shown[shown.length - 1].getBoundingClientRect();
    const tcs = getComputedStyle(top), between = (parseFloat(tcs.columnGap) || 0) * (shown.length - 1);
    const natural = last.right - first.left - between, room = W - reserve - 12 - between;
    if (natural > room) { const z = Math.max(.5, room / natural); shown.forEach(k => { k.style.zoom = z.toFixed(3) }) }
  }
  const tick = () => { addButton(); fitTop(); decorate() };
  addEventListener('DOMContentLoaded', () => { tick(); new MutationObserver(() => { clearTimeout(tick.t); tick.t = setTimeout(tick, 120) }).observe(document.body, { childList: true, subtree: true }) });
  addEventListener('load', () => { tick(); setTimeout(tick, 1200); setTimeout(tick, 2600) });
  addEventListener('resize', () => { clearTimeout(tick.r); tick.r = setTimeout(tick, 80) });
  addEventListener('orientationchange', () => setTimeout(tick, 300));
  window.readwyBadgeShop = { open, close, earned, balance: () => balance(record()), record };
})();
