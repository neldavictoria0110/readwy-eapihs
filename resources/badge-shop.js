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
 background:radial-gradient(80% 60% at 50% -10%,rgba(255,226,140,.38),transparent 60%),radial-gradient(70% 70% at 0% 100%,rgba(47,138,90,.55),transparent 60%),radial-gradient(70% 70% at 100% 100%,rgba(201,161,74,.28),transparent 60%),linear-gradient(165deg,#14462f,#0b2f1f 55%,#071d13);box-shadow:inset 0 0 0 3px rgba(201,161,74,.55),inset 0 0 0 7px #0b2f1f,inset 0 0 0 8px rgba(233,196,106,.45);
 animation:rwShopIn .4s cubic-bezier(.22,.9,.28,1)}
.rwg-stars{position:absolute;inset:0;pointer-events:none;opacity:.75;background-image:radial-gradient(2px 2px at 12% 22%,#ffe9a8,transparent),radial-gradient(1.5px 1.5px at 38% 70%,#fff3c8,transparent),radial-gradient(2px 2px at 66% 18%,#e9c46a,transparent),radial-gradient(1.5px 1.5px at 82% 62%,#ffe9a8,transparent),radial-gradient(2.5px 2.5px at 52% 42%,#ffd76a,transparent),radial-gradient(1.5px 1.5px at 92% 88%,#fff3c8,transparent);background-size:340px 340px;animation:rwgTwinkle 3.5s ease-in-out infinite alternate}
@keyframes rwgTwinkle{to{opacity:.3;background-position:12px -8px}}
body:has(.rw-shop) #rwBadge{display:none!important}
.rw-shop.closing{animation:rwShopOut .3s ease-in forwards}
@keyframes rwShopIn{from{opacity:0;transform:scale(1.04)}}
@keyframes rwShopOut{to{opacity:0;transform:scale(1.03)}}
.rwg-top,.rw-tabs,.rwg-stage{position:relative}
.rwg-top{flex:none;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:10px;margin-top:8px}
.rwg-top .rw-purse{justify-self:end}
.rwg-x{display:grid;place-items:center;width:clamp(38px,6.4vh,50px);aspect-ratio:1;border:0;border-radius:14px;cursor:pointer;color:#fff;font:900 clamp(18px,3vh,24px)/1 system-ui;background:linear-gradient(180deg,#b8303f,#7a1622);box-shadow:inset 0 0 0 2px #e9c46a,inset 0 2px 0 rgba(255,255,255,.3),0 4px 0 #4a0d18,0 8px 16px rgba(0,0,0,.35);touch-action:manipulation}
.rwg-x:active{transform:translateY(3px);box-shadow:inset 0 0 0 2px #e9c46a,0 1px 0 #4a0d18}
.rwg-title{justify-self:center;display:flex;align-items:center;gap:.35em;min-width:0;color:#ffe9a8;font:900 clamp(18px,4.2vh,34px)/1 Georgia,"Times New Roman",serif;letter-spacing:.03em;text-shadow:0 3px 0 #04140c,0 0 18px rgba(233,196,106,.45);white-space:nowrap}
.rwg-title span{display:inline-block;animation:rwgBob 2.6s ease-in-out infinite}
@keyframes rwgBob{50%{transform:translateY(-4px) rotate(-6deg)}}
.rw-purse{display:flex;align-items:center;gap:8px;padding:4px 16px 4px 6px;border-radius:999px;color:#4a2300;background:linear-gradient(180deg,#fff3a6,#ffc21a 55%,#ff9f1c);box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #b86400,0 8px 16px rgba(0,0,0,.35)}
.rw-purse .rw-coin{width:clamp(24px,4.6vh,36px);height:clamp(24px,4.6vh,36px)}
.rw-purse b{font:900 clamp(16px,3.6vh,28px)/1 "Nunito","Trebuchet MS",system-ui,sans-serif}
.rw-purse.bump b{animation:rwgBump .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes rwgBump{40%{transform:scale(1.35)}}
.rw-tabs{flex:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(4px,1vw,10px);width:min(100%,920px);margin:0 auto}
.rw-tab{--a:#fff3c8;--b:#e9c46a;--d:#8a5a0b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;min-height:clamp(44px,8.6vh,68px);padding:4px;border:0;border-radius:18px;cursor:pointer;color:#fff;
 color:#ffe9a8;font:900 clamp(10px,1.8vh,14px)/1.1 "Nunito","Trebuchet MS",system-ui,sans-serif;background:linear-gradient(180deg,rgba(47,138,90,.55),rgba(15,58,39,.75));box-shadow:inset 0 0 0 2px rgba(233,196,106,.45),0 4px 0 rgba(0,0,0,.35);transition:transform .15s,background .2s;touch-action:manipulation}
.rw-tab .i{font-size:clamp(18px,3.8vh,30px);line-height:1}
.rw-tab .l{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rw-tab:hover{transform:translateY(-2px)}
.rw-tab[aria-selected=true]{color:#2b1d07;background:linear-gradient(180deg,var(--a),var(--b));box-shadow:inset 0 0 0 2px #fff3c8,inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 var(--d),0 0 18px rgba(233,196,106,.55);transform:translateY(-2px)}
.rw-tab[aria-selected=true] .i{animation:rwgBob 2.2s ease-in-out infinite}
.rwg-stage{flex:1 1 0;min-height:0;min-width:0}
.rwg-shopview,.rw-panel{position:absolute;inset:0}
.rwg-shopview{display:flex;flex-direction:column;gap:clamp(6px,1.4vh,12px)}
.rwg-shopview[hidden],.rw-panel[hidden]{display:none!important}
.rwg-counter{flex:1 1 0;display:flex;flex-direction:column;min-height:0;margin-top:10px}
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
.rw-themes{flex:none;align-self:center;display:flex;align-items:center;gap:clamp(6px,1.4vw,12px);max-width:100%;box-sizing:border-box;padding:clamp(4px,1vh,8px) clamp(10px,2vw,18px);border-radius:999px;background:rgba(7,29,19,.6);box-shadow:inset 0 0 0 2px rgba(233,196,106,.5)}
.rw-tlabel{font-size:clamp(18px,3.6vh,28px);line-height:1}
.rw-chip{position:relative;flex:none;width:clamp(30px,5.8vh,44px);aspect-ratio:1;padding:0;border:0;border-radius:50%;cursor:pointer;font-size:clamp(11px,2.2vh,16px);background:var(--sw);box-shadow:inset 0 0 0 3px rgba(255,255,255,.6),0 3px 0 rgba(0,0,0,.3);transition:transform .15s;touch-action:manipulation}
.rw-chip:hover:not(:disabled){transform:scale(1.1)}
.rw-chip.on{transform:scale(1.14);box-shadow:inset 0 0 0 3px #fff,0 0 0 3px #ffd23f,0 0 16px #ffd23f}
.rw-chip:disabled{cursor:not-allowed;filter:grayscale(.6) brightness(.6)}
.rw-shop-msg{position:absolute;left:50%;bottom:max(16px,env(safe-area-inset-bottom));z-index:3;translate:-50% 0;scale:.85;margin:0;padding:10px 20px;border-radius:999px;max-width:min(92vw,520px);text-align:center;pointer-events:none;opacity:0;transition:opacity .25s,scale .3s cubic-bezier(.2,1.4,.4,1);
 color:#ffe9a8;font:900 clamp(13px,2.2vh,16px)/1.3 "Nunito","Trebuchet MS",system-ui,sans-serif;background:linear-gradient(180deg,#2f8a5a,#0f3a27);box-shadow:inset 0 0 0 2px #e9c46a,0 4px 0 #04140c,0 10px 22px rgba(0,0,0,.4)}
.rw-shop-msg.show{opacity:1;scale:1}
/* ---------- game frames, nameplates, scene illustration, player level ---------- */
.rwg-scene{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.16}
.rwg-bunting{position:absolute;left:0;right:0;top:0;height:22px;pointer-events:none;opacity:.9;
 background:linear-gradient(180deg,#c9a14a 0 2px,transparent 2px),conic-gradient(from 150deg at 50% 0,transparent 0,transparent 60deg,var(--fl) 0) 0 2px/44px 20px repeat-x;
 --fl:#b8303f;-webkit-mask:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.rwg-bunting.b2{--fl:#e9c46a;background-position:0 0,22px 2px}
.rwq-fr{position:relative;box-sizing:border-box;min-height:0;border-radius:18px;padding:clamp(16px,3.2vh,26px) clamp(8px,1.4vw,16px) clamp(8px,1.4vh,14px);
 background:radial-gradient(circle at 11px 11px,#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),radial-gradient(circle at calc(100% - 11px) 11px,#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),
  radial-gradient(circle at 11px calc(100% - 11px),#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),radial-gradient(circle at calc(100% - 11px) calc(100% - 11px),#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),
  repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 8px,transparent 8px 16px),linear-gradient(180deg,rgba(31,92,64,.72),rgba(7,29,19,.82));
 box-shadow:inset 0 0 0 2px #c9a14a,inset 0 0 0 5px rgba(7,29,19,.9),inset 0 0 0 6px rgba(233,196,106,.45),0 10px 24px rgba(0,0,0,.4)}
.rwq-plate{position:absolute;left:50%;top:0;z-index:2;translate:-50% -48%;display:inline-flex;align-items:center;gap:.4em;max-width:88%;padding:.28em 1.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
 color:#2b1d07;font:900 clamp(10px,1.9vh,14px)/1.15 Georgia,"Times New Roman",serif;letter-spacing:.12em;text-transform:uppercase;
 background:linear-gradient(180deg,#fff3c8,#e9c46a 55%,#b8862a);box-shadow:inset 0 0 0 1.5px #8a5a0b,inset 0 2px 0 rgba(255,255,255,.6),0 4px 10px rgba(0,0,0,.45);
 clip-path:polygon(0 50%,8% 0,92% 0,100% 50%,92% 100%,8% 100%)}
.rwg-lv{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;border-radius:999px;background:rgba(7,29,19,.75);box-shadow:inset 0 0 0 2px rgba(233,196,106,.55)}
.rwg-lv b{display:grid;place-items:center;width:clamp(32px,5.6vh,44px);aspect-ratio:1;border-radius:50%;color:#2b1d07;font:900 clamp(11px,2vh,15px)/1 Georgia,serif;
 background:radial-gradient(circle at 35% 30%,#fff3c8,#e9c46a 55%,#8a5a0b);box-shadow:0 0 0 2px #0b2f1f,0 0 0 3.5px #e9c46a,0 0 12px rgba(233,196,106,.6)}
.rwg-lv span{display:grid;gap:3px;min-width:clamp(70px,10vw,130px)}
.rwg-lv small{color:#ffe9a8;font:900 clamp(9px,1.6vh,12px)/1 "Nunito",system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.rwg-xp{height:8px;border-radius:999px;background:rgba(0,0,0,.45);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(233,196,106,.4)}
.rwg-xp i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2f8a5a,#7cf29c,#e9c46a);box-shadow:0 0 8px #7cf29c;animation:rwgXp 1.2s cubic-bezier(.2,.8,.3,1) both}
@keyframes rwgXp{from{width:0}}
.rwg-left{display:flex;align-items:center;gap:10px;min-width:0}
@media (max-width:620px){.rwg-lv span{display:none}.rwg-lv{padding:3px}}
/* Colourful metal frames on the green backdrop: each section has its own jewel colour (ruby, sapphire, amethyst,
   amber, teal), a polished bevelled rim, brass rivets and a matching enamel nameplate. */
.rwq-fr{--f1:#e9c46a;--f2:#b8862a;--f3:#5a3a08;--tint:rgba(233,196,106,.18)}
.rwq-fr[data-c=ruby]{--f1:#ff8a9a;--f2:#c8243c;--f3:#5c0a18;--tint:rgba(232,60,90,.22)}
.rwq-fr[data-c=sapphire]{--f1:#9fd3ff;--f2:#2f6fe0;--f3:#0c2a66;--tint:rgba(62,140,255,.22)}
.rwq-fr[data-c=amethyst]{--f1:#e2c2ff;--f2:#8b4fd8;--f3:#331060;--tint:rgba(150,90,230,.24)}
.rwq-fr[data-c=amber]{--f1:#ffe08a;--f2:#e08a00;--f3:#5a3300;--tint:rgba(255,170,40,.2)}
.rwq-fr[data-c=teal]{--f1:#9ff5e2;--f2:#13a3a0;--f3:#06403e;--tint:rgba(30,200,190,.2)}
.rwq-fr{background:radial-gradient(circle at 11px 11px,#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),radial-gradient(circle at calc(100% - 11px) 11px,#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),
  radial-gradient(circle at 11px calc(100% - 11px),#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),radial-gradient(circle at calc(100% - 11px) calc(100% - 11px),#fff3c8 0 2px,#a8761e 2.6px 3.6px,transparent 4.2px),
  radial-gradient(120% 70% at 50% 0%,var(--tint),transparent 70%),linear-gradient(180deg,rgba(12,40,28,.82),rgba(5,20,13,.9));
 box-shadow:inset 0 0 0 2px var(--f1),inset 0 0 0 4px var(--f2),inset 0 0 0 6px var(--f3),inset 0 0 0 7px rgba(255,255,255,.18),inset 0 10px 22px rgba(255,255,255,.06),0 12px 26px rgba(0,0,0,.45),0 0 18px color-mix(in srgb,var(--f2) 35%,transparent)}
.rwq-plate{color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.45);background:linear-gradient(180deg,var(--f1),var(--f2) 55%,var(--f3));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.55),inset 0 2px 0 rgba(255,255,255,.5),0 4px 10px rgba(0,0,0,.5)}
.rwq-fr[data-c=amber] .rwq-plate{color:#2b1300;text-shadow:0 1px 0 rgba(255,255,255,.45)}
.rwq-fr .rwq-glass{background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--f1) 45%,transparent)}
.rwq-fr .rwq-rl{background:linear-gradient(180deg,var(--f2),var(--f3));box-shadow:inset 0 0 0 1.5px var(--f1),inset 0 2px 0 rgba(255,255,255,.35)}
.rwq-fr .rwq-rl small{color:#fff}
/* tabs: each a different enamel colour with a bevel */
.rw-tab{--a:#ffe08a;--b:#e08a00;--d:#7a4a00;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.4);background:linear-gradient(180deg,color-mix(in srgb,var(--b) 55%,#0b2f1f),color-mix(in srgb,var(--b) 25%,#071d13));box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--a) 70%,transparent),inset 0 2px 0 rgba(255,255,255,.25),0 4px 0 rgba(0,0,0,.4)}
.rw-tab[data-tab=badges]{--a:#e2c2ff;--b:#8b4fd8;--d:#331060}.rw-tab[data-tab=privileges]{--a:#ff8a9a;--b:#c8243c;--d:#5c0a18}
.rw-tab[data-tab=points]{--a:#9fd3ff;--b:#2f6fe0;--d:#0c2a66}.rw-tab[data-tab=vault]{--a:#9ff5e2;--b:#13a3a0;--d:#06403e}
.rw-tab[aria-selected=true]{color:#fff;background:linear-gradient(180deg,var(--a),var(--b) 60%,var(--d));box-shadow:inset 0 0 0 2px rgba(255,255,255,.7),inset 0 3px 0 rgba(255,255,255,.55),0 4px 0 var(--d),0 0 20px var(--b);text-shadow:0 1px 1px rgba(0,0,0,.5)}
.rw-tab[data-tab=shop][aria-selected=true]{color:#2b1300;text-shadow:0 1px 0 rgba(255,255,255,.5)}
/* colourful bunting and hanging lanterns (original drawings) */
.rwg-bunting{height:26px;opacity:1;background:none}
.rwg-bunting svg{display:block;width:100%;height:100%}
.rwg-bunting.b2{display:none}
.rwg-lantern{position:absolute;top:0;width:clamp(26px,4vw,44px);pointer-events:none;filter:drop-shadow(0 0 14px rgba(255,190,80,.75));animation:rwgSway 4s ease-in-out infinite;transform-origin:50% 0}
.rwg-lantern.l{left:clamp(70px,11vw,170px)}.rwg-lantern.r{right:clamp(150px,18vw,280px);animation-delay:-2s}
@keyframes rwgSway{50%{rotate:4deg}}
@media (max-width:700px),(max-height:480px){.rwg-lantern{display:none}}
.rwg-scene{opacity:.22}
/* privileges never spill upwards over the tabs */
.rwq-priv{align-content:start}.rwq-pick{align-content:start}
@media (prefers-reduced-motion:reduce){.rwg-lantern{animation:none}}
@media (max-height:480px){.rwg-lv b{width:30px}.rwq-fr{padding-top:14px}}
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
    try {
      const total = window.READwyQuests ? window.READwyQuests.total() : pts, lv = Math.floor(total / 250) + 1, xp = Math.round((total % 250) / 2.5);
      const lvEl = shop.querySelector('.rwg-lv'); lvEl.querySelector('b').textContent = lv; lvEl.querySelector('small').textContent = 'Level ' + lv + ' · ' + (total % 250) + '/250 XP'; lvEl.querySelector('.rwg-xp i').style.width = xp + '%';
    } catch {}
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
    shop.innerHTML = `<svg class="rwg-scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="none" stroke="#e9c46a" stroke-width="6"><path d="M-20 210Q130 40 280 210Q430 40 580 210Q730 40 880 210Q1030 40 1180 210Q1330 40 1480 210"/><path d="M-20 240H1220" stroke-width="3"/></g><g fill="#e9c46a"><rect x="-14" y="200" width="28" height="560" rx="6"/><rect x="286" y="200" width="28" height="560" rx="6"/><rect x="586" y="200" width="28" height="560" rx="6"/><rect x="886" y="200" width="28" height="560" rx="6"/><rect x="1186" y="200" width="28" height="560" rx="6"/><rect x="0" y="752" width="1200" height="8"/><rect x="0" y="784" width="1200" height="8"/><rect x="0" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="40" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="80" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="120" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="160" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="200" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="240" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="280" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="320" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="360" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="400" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="440" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="480" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="520" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="560" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="600" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="640" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="680" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="720" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="760" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="800" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="840" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="880" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="920" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="960" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1000" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1040" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1080" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1120" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1160" y="748" width="14" height="52" rx="2" opacity=".6"/><rect x="1200" y="748" width="14" height="52" rx="2" opacity=".6"/><g transform="translate(840 560)"><rect x="0" y="70" width="230" height="90" rx="30" fill="#2f9e5a"/><rect x="190" y="20" width="110" height="140" rx="10"/><rect x="40" y="20" width="34" height="56" rx="6"/><rect x="28" y="10" width="58" height="16" rx="6"/><rect x="200" y="0" width="120" height="26" rx="8"/><circle cx="60" cy="168" r="34"/><circle cx="150" cy="168" r="34"/><circle cx="250" cy="168" r="34"/><path d="M-40 160L0 110V160Z"/></g><g transform="translate(130 600) scale(.8)"><rect x="0" y="40" width="260" height="140" rx="16" fill="#c8243c"/><rect x="20" y="62" width="60" height="50" rx="6" fill="#0b2f1f"/><rect x="100" y="62" width="60" height="50" rx="6" fill="#0b2f1f"/><rect x="180" y="62" width="60" height="50" rx="6" fill="#0b2f1f"/><circle cx="60" cy="190" r="26"/><circle cx="200" cy="190" r="26"/></g></g><g fill="#fff3c8" opacity=".8"><circle cx="300" cy="300" r="5"/><circle cx="900" cy="330" r="4"/><circle cx="610" cy="280" r="6"/></g></svg><div class="rwg-stars" aria-hidden="true"></div><div class="rwg-bunting" aria-hidden="true"><svg viewBox="0 0 1400 26" preserveAspectRatio="none"><path d="M0 3 Q700 14 1400 3" stroke="#c9a14a" stroke-width="2" fill="none"/><path d="M4 3.6 L34 4.2 L19 23.6Z" fill="#e83c5a"/><path d="M4 3.6 L34 4.2 L19 10.6Z" fill="#fff" opacity=".28"/><path d="M44 4.7 L74 5.3 L59 24.7Z" fill="#ffb020"/><path d="M44 4.7 L74 5.3 L59 11.7Z" fill="#fff" opacity=".28"/><path d="M84 5.8 L114 6.4 L99 25.8Z" fill="#2f9e5a"/><path d="M84 5.8 L114 6.4 L99 12.8Z" fill="#fff" opacity=".28"/><path d="M124 6.8 L154 7.4 L139 26.8Z" fill="#2f6fe0"/><path d="M124 6.8 L154 7.4 L139 13.8Z" fill="#fff" opacity=".28"/><path d="M164 7.7 L194 8.3 L179 27.7Z" fill="#8b4fd8"/><path d="M164 7.7 L194 8.3 L179 14.7Z" fill="#fff" opacity=".28"/><path d="M204 8.5 L234 9.1 L219 28.5Z" fill="#ff7a3d"/><path d="M204 8.5 L234 9.1 L219 15.5Z" fill="#fff" opacity=".28"/><path d="M244 9.3 L274 9.9 L259 29.3Z" fill="#13a3a0"/><path d="M244 9.3 L274 9.9 L259 16.3Z" fill="#fff" opacity=".28"/><path d="M284 10.0 L314 10.6 L299 30.0Z" fill="#e83c5a"/><path d="M284 10.0 L314 10.6 L299 17.0Z" fill="#fff" opacity=".28"/><path d="M324 10.7 L354 11.3 L339 30.7Z" fill="#ffb020"/><path d="M324 10.7 L354 11.3 L339 17.7Z" fill="#fff" opacity=".28"/><path d="M364 11.3 L394 11.9 L379 31.3Z" fill="#2f9e5a"/><path d="M364 11.3 L394 11.9 L379 18.3Z" fill="#fff" opacity=".28"/><path d="M404 11.8 L434 12.4 L419 31.8Z" fill="#2f6fe0"/><path d="M404 11.8 L434 12.4 L419 18.8Z" fill="#fff" opacity=".28"/><path d="M444 12.2 L474 12.8 L459 32.2Z" fill="#8b4fd8"/><path d="M444 12.2 L474 12.8 L459 19.2Z" fill="#fff" opacity=".28"/><path d="M484 12.6 L514 13.2 L499 32.6Z" fill="#ff7a3d"/><path d="M484 12.6 L514 13.2 L499 19.6Z" fill="#fff" opacity=".28"/><path d="M524 12.9 L554 13.5 L539 32.9Z" fill="#13a3a0"/><path d="M524 12.9 L554 13.5 L539 19.9Z" fill="#fff" opacity=".28"/><path d="M564 13.1 L594 13.7 L579 33.1Z" fill="#e83c5a"/><path d="M564 13.1 L594 13.7 L579 20.1Z" fill="#fff" opacity=".28"/><path d="M604 13.3 L634 13.9 L619 33.3Z" fill="#ffb020"/><path d="M604 13.3 L634 13.9 L619 20.3Z" fill="#fff" opacity=".28"/><path d="M644 13.4 L674 14.0 L659 33.4Z" fill="#2f9e5a"/><path d="M644 13.4 L674 14.0 L659 20.4Z" fill="#fff" opacity=".28"/><path d="M684 13.4 L714 14.0 L699 33.5Z" fill="#2f6fe0"/><path d="M684 13.4 L714 14.0 L699 20.4Z" fill="#fff" opacity=".28"/><path d="M724 13.4 L754 14.0 L739 33.4Z" fill="#8b4fd8"/><path d="M724 13.4 L754 14.0 L739 20.4Z" fill="#fff" opacity=".28"/><path d="M764 13.3 L794 13.9 L779 33.3Z" fill="#ff7a3d"/><path d="M764 13.3 L794 13.9 L779 20.3Z" fill="#fff" opacity=".28"/><path d="M804 13.1 L834 13.7 L819 33.1Z" fill="#13a3a0"/><path d="M804 13.1 L834 13.7 L819 20.1Z" fill="#fff" opacity=".28"/><path d="M844 12.9 L874 13.5 L859 32.9Z" fill="#e83c5a"/><path d="M844 12.9 L874 13.5 L859 19.9Z" fill="#fff" opacity=".28"/><path d="M884 12.6 L914 13.2 L899 32.6Z" fill="#ffb020"/><path d="M884 12.6 L914 13.2 L899 19.6Z" fill="#fff" opacity=".28"/><path d="M924 12.2 L954 12.8 L939 32.2Z" fill="#2f9e5a"/><path d="M924 12.2 L954 12.8 L939 19.2Z" fill="#fff" opacity=".28"/><path d="M964 11.8 L994 12.4 L979 31.8Z" fill="#2f6fe0"/><path d="M964 11.8 L994 12.4 L979 18.8Z" fill="#fff" opacity=".28"/><path d="M1004 11.3 L1034 11.9 L1019 31.3Z" fill="#8b4fd8"/><path d="M1004 11.3 L1034 11.9 L1019 18.3Z" fill="#fff" opacity=".28"/><path d="M1044 10.7 L1074 11.3 L1059 30.7Z" fill="#ff7a3d"/><path d="M1044 10.7 L1074 11.3 L1059 17.7Z" fill="#fff" opacity=".28"/><path d="M1084 10.0 L1114 10.6 L1099 30.0Z" fill="#13a3a0"/><path d="M1084 10.0 L1114 10.6 L1099 17.0Z" fill="#fff" opacity=".28"/><path d="M1124 9.3 L1154 9.9 L1139 29.3Z" fill="#e83c5a"/><path d="M1124 9.3 L1154 9.9 L1139 16.3Z" fill="#fff" opacity=".28"/><path d="M1164 8.5 L1194 9.1 L1179 28.5Z" fill="#ffb020"/><path d="M1164 8.5 L1194 9.1 L1179 15.5Z" fill="#fff" opacity=".28"/><path d="M1204 7.7 L1234 8.3 L1219 27.7Z" fill="#2f9e5a"/><path d="M1204 7.7 L1234 8.3 L1219 14.7Z" fill="#fff" opacity=".28"/><path d="M1244 6.8 L1274 7.4 L1259 26.8Z" fill="#2f6fe0"/><path d="M1244 6.8 L1274 7.4 L1259 13.8Z" fill="#fff" opacity=".28"/><path d="M1284 5.8 L1314 6.4 L1299 25.8Z" fill="#8b4fd8"/><path d="M1284 5.8 L1314 6.4 L1299 12.8Z" fill="#fff" opacity=".28"/><path d="M1324 4.7 L1354 5.3 L1339 24.7Z" fill="#ff7a3d"/><path d="M1324 4.7 L1354 5.3 L1339 11.7Z" fill="#fff" opacity=".28"/><path d="M1364 3.6 L1394 4.2 L1379 23.6Z" fill="#13a3a0"/><path d="M1364 3.6 L1394 4.2 L1379 10.6Z" fill="#fff" opacity=".28"/></svg></div><span class="rwg-lantern l" aria-hidden="true"><svg viewBox="0 0 40 90" aria-hidden="true"><line x1="20" y1="0" x2="20" y2="22" stroke="#c9a14a" stroke-width="2"/><path d="M12 22h16l3 6H9z" fill="#3a2a10" stroke="#c9a14a"/><rect x="10" y="28" width="20" height="36" rx="4" fill="#ffd36b" stroke="#8a5a0b" stroke-width="2"/><rect x="14" y="32" width="12" height="28" rx="3" fill="#fff6d0"/><path d="M8 64h24l-3 8H11z" fill="#3a2a10" stroke="#c9a14a"/><line x1="20" y1="28" x2="20" y2="64" stroke="#8a5a0b" stroke-width="1.5"/></svg></span><span class="rwg-lantern r" aria-hidden="true"><svg viewBox="0 0 40 90" aria-hidden="true"><line x1="20" y1="0" x2="20" y2="22" stroke="#c9a14a" stroke-width="2"/><path d="M12 22h16l3 6H9z" fill="#3a2a10" stroke="#c9a14a"/><rect x="10" y="28" width="20" height="36" rx="4" fill="#ffd36b" stroke="#8a5a0b" stroke-width="2"/><rect x="14" y="32" width="12" height="28" rx="3" fill="#fff6d0"/><path d="M8 64h24l-3 8H11z" fill="#3a2a10" stroke="#c9a14a"/><line x1="20" y1="28" x2="20" y2="64" stroke="#8a5a0b" stroke-width="1.5"/></svg></span>
<header class="rwg-top"><div class="rwg-left"><button class="rw-shop-close rwg-x" type="button" aria-label="Back to ticket" title="Back to ticket">✕</button><div class="rwg-lv" title="Your level grows with every 250 points"><b>1</b><span><small>Level</small><span class="rwg-xp"><i style="width:0"></i></span></span></div></div>
<div class="rwg-title"><span aria-hidden="true">🏪</span><b>Badge Shop</b></div>
<div class="rw-purse" aria-label="Your points to spend" title="Points to spend"><i class="rw-coin"></i><b>0</b></div></header>
<nav class="rw-tabs" role="tablist" aria-label="Badge Shop pages">${TABS.map(([id, icon, label]) => `<button type="button" class="rw-tab" role="tab" data-tab="${id}" aria-selected="${id === 'shop'}" aria-label="${TITLES[id]}"><span class="i" aria-hidden="true">${icon}</span><span class="l">${label}</span></button>`).join('')}</nav>
<main class="rwg-stage"><div class="rwg-shopview"><section class="rwq-fr rwg-counter" data-c="amber"><span class="rwq-plate">🏪 Badge Counter</span><div class="rw-cases"></div></section><div class="rw-themes"></div></div><div class="rw-panel" hidden></div></main>
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
