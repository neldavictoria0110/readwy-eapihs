/* READwy Quests on the journey ticket page: the post-test countdown, the learner's equipped title and dashboard
   colour theme, and the game-style My Badges / Privileges / Points / Word Vault tabs of the Badge Shop.
   Every tab fits the screen without scrolling: tiles are sized from the free space (layout()), long lists show
   what fits plus "+N", and anything still too big is zoomed down a little.
   Rules, point values and saving are in resources/quests.js. */
(() => {
  const Q = window.READwyQuests;
  if (!Q || !Q.isLearner()) return;
  const esc = Q.esc;
  const PREFIX = 'READwy_new_2026_local_';
  const readLS = (k, f = null) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v } catch { return f } };
  const me = () => readLS(PREFIX + 'user', {}) || {};
  const FONT = '"Nunito","Trebuchet MS","Segoe UI",system-ui,sans-serif';

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

/* ---------- game tabs ---------- */
.rw-panel{container-type:size;color:#fff;font-family:${FONT}}
.rwq-v{width:100%;height:100%;box-sizing:border-box;display:grid;gap:clamp(14px,3cqh,22px) clamp(8px,1.6cqh,14px);min-height:0;padding-top:12px;animation:rwqIn .35s cubic-bezier(.2,1,.3,1)}
@keyframes rwqIn{from{opacity:0;transform:translateY(10px)}}
.rwq-glass{border-radius:clamp(14px,3cqh,24px);background:linear-gradient(180deg,rgba(31,92,64,.55),rgba(7,29,19,.6));box-shadow:inset 0 0 0 2px rgba(233,196,106,.42),0 6px 18px rgba(0,0,0,.28)}
.rwq-pill{display:inline-flex;align-items:center;gap:.4em;padding:.25em .8em;border-radius:999px;font-weight:900;background:rgba(0,0,0,.25)}
[data-t=Bronze]{--c1:#ffb070;--c2:#e0612a;--g:#ff8a3d}[data-t=Silver]{--c1:#a7e3ff;--c2:#3f7fe0;--g:#6cc4ff}
[data-t=Gold]{--c1:#ffe36e;--c2:#f5a300;--g:#ffd23f}[data-t=Legendary]{--c1:#ff9ad5;--c2:#7c3aed;--g:#d18bff}

.rwq-badges{grid-template-rows:auto minmax(0,1fr) auto}
.rwq-bhead{display:flex;align-items:center;justify-content:center;gap:12px;font-weight:900;font-size:clamp(13px,3.2cqh,20px)}
.rwq-bar{flex:1;max-width:460px;height:clamp(10px,2.4cqh,18px);border-radius:999px;background:rgba(7,29,19,.7);overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.2)}
.rwq-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2f8a5a,#7cf29c,#e9c46a,#fff3c8);box-shadow:0 0 12px #e9c46a}
.rwq-hall{display:flex;flex-direction:column;min-height:0}.rwq-hall .rwq-bgrid{flex:1 1 0}
.rwq-bgrid{--w:80px;display:grid;justify-content:center;align-content:center;gap:var(--gap,8px);min-height:0}
.rwq-btile{position:relative;width:var(--w);height:calc(var(--w)*1.2);box-sizing:border-box;display:grid;grid-template-rows:minmax(0,1fr) auto;justify-items:center;align-items:center;padding:8% 4% 6%;border:0;border-radius:calc(var(--w)*.22);cursor:pointer;color:#fff;
 background:radial-gradient(110% 60% at 50% 0%,rgba(255,255,255,.5),transparent 60%),linear-gradient(170deg,var(--c1),var(--c2));box-shadow:inset 0 0 0 2px rgba(255,255,255,.4),0 4px 0 rgba(0,0,0,.25);transition:transform .15s;font-family:inherit;touch-action:manipulation}
.rwq-btile:hover{transform:translateY(-3px) scale(1.04)}
.rwq-btile .rwq-badge{--s:calc(var(--w)*.62)}
.rwq-btile span{max-width:100%;overflow:hidden;white-space:nowrap;font:900 calc(var(--w)*.125)/1.1 ${FONT};text-shadow:0 1px 0 rgba(0,0,0,.3)}
.rwq-bgrid.tiny .rwq-btile{height:var(--w);padding:8%}.rwq-bgrid.tiny .rwq-btile span{display:none}.rwq-bgrid.tiny .rwq-btile .rwq-badge{--s:calc(var(--w)*.74)}
.rwq-btile.locked{background:linear-gradient(180deg,rgba(31,92,64,.45),rgba(7,29,19,.6));box-shadow:inset 0 0 0 2px rgba(233,196,106,.25)}
.rwq-btile.locked span{opacity:.7}
.rwq-btile.got[data-t=Legendary]::after,.rwq-btile.got[data-t=Gold]::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.6) 48%,transparent 60%) -150% 0/60% 100% no-repeat;animation:rwqShine 3.2s ease-in-out infinite}
.rwq-btile.sel{outline:3px solid #fff;outline-offset:2px;transform:scale(1.07)}
.rwq-binfo{display:flex;align-items:center;justify-content:center;gap:10px;min-height:clamp(34px,8cqh,54px);padding:4px 16px;border-radius:999px;color:#ffe9a8;background:rgba(7,29,19,.7);font-weight:800;font-size:clamp(12px,2.8cqh,16px);text-align:center;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14)}
.rwq-binfo .rwq-badge{--s:clamp(26px,6cqh,40px);flex:none}
.rwq-binfo b{font-weight:900}
.rwq-tierpill{padding:.15em .7em;border-radius:999px;font-size:.78em;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#2b1300;background:linear-gradient(180deg,var(--c1),var(--c2))}

.rwq-priv{grid-template-columns:minmax(0,.85fr) minmax(0,2fr);grid-template-rows:auto auto;align-content:safe center}
.rwq-me{grid-row:1/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(10px,2.6cqh,18px);padding:clamp(12px,3cqh,22px);text-align:center;min-width:0}
.rwq-who{display:flex;flex-direction:column;align-items:center;gap:clamp(8px,2cqh,14px);min-width:0;max-width:100%}
.rwq-me b{max-width:100%;overflow-wrap:break-word;text-wrap:balance}
/* Avatars: a green-and-gold medallion; frames are polished metal rings with a jewel on top. The ring and jewel
   sit inside a reserved margin (--fr), so a frame never covers the name or the next option. */
.rwq-avatar{--fr:calc(var(--a,64px)*.17);position:relative;flex:none;display:grid;place-items:center;width:var(--a,64px);aspect-ratio:1;margin:var(--fr);border-radius:50%;color:#ffe9a8;font:900 calc(var(--a,64px)*.36)/1 Georgia,"Times New Roman",serif;text-shadow:0 2px 0 rgba(0,0,0,.4);isolation:isolate;
 background:radial-gradient(circle at 35% 28%,#3fa877,#1f5c40 55%,#0b2f1f);box-shadow:inset 0 0 0 calc(var(--a,64px)*.035) rgba(233,196,106,.6),inset 0 -6px 12px rgba(0,0,0,.35)}
.rwq-me .rwq-avatar{--a:clamp(66px,min(26cqh,15cqw),132px)}
.rwq-avatar[data-frame]:not([data-frame=none])::before{content:'';position:absolute;inset:calc(var(--a,64px)*-.13);z-index:-1;border-radius:50%;background:conic-gradient(from 20deg,var(--m1),var(--m2),var(--m3),var(--m2),var(--m1),var(--m3),var(--m1));
 -webkit-mask:radial-gradient(circle,transparent 63.5%,#000 64.5%);mask:radial-gradient(circle,transparent 63.5%,#000 64.5%);box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.rwq-avatar[data-frame]:not([data-frame=none])::after{content:'';position:absolute;left:50%;top:calc(var(--a,64px)*-.2);width:calc(var(--a,64px)*.2);aspect-ratio:1;translate:-50% 0;rotate:45deg;border-radius:22%;
 background:radial-gradient(circle at 30% 30%,#fff,var(--j1) 35%,var(--j2) 80%);box-shadow:0 0 0 calc(var(--a,64px)*.025) var(--m2),0 2px 6px rgba(0,0,0,.45),0 0 10px var(--j1)}
.rwq-avatar[data-frame=bronze]{--m1:#6b3a17;--m2:#e7a36b;--m3:#a65e2c;--j1:#7cf29c;--j2:#13804f}
.rwq-avatar[data-frame=silver]{--m1:#7d8794;--m2:#ffffff;--m3:#c3ccd6;--j1:#8fd3ff;--j2:#2f6fe0}
.rwq-avatar[data-frame=gold]{--m1:#8a5a0b;--m2:#fff3a6;--m3:#e9b93c;--j1:#ff7a8a;--j2:#b8303f}
.rwq-avatar[data-frame=gold]::before{filter:drop-shadow(0 0 6px rgba(255,214,120,.7))}
.rwq-avatar[data-frame=legend]{--m1:#ff6f91;--m2:#fff3c8;--m3:#8b5cf6;--j1:#e8f6ff;--j2:#7fb4d6}
.rwq-avatar[data-frame=legend]::before{background:conic-gradient(#ff6f91,#ffd36b,#7cf29c,#5ee7df,#8b5cf6,#ff6f91);animation:rwqSpin 5s linear infinite;filter:drop-shadow(0 0 8px rgba(209,139,255,.8))}
.rwq-me b{font:900 clamp(15px,4cqh,24px)/1.1 ${FONT}}
.rwq-ribbon{padding:.3em 1.3em;border-radius:8px;font:900 clamp(12px,3cqh,17px)/1.2 Georgia,serif;color:#2b1d07;background:linear-gradient(180deg,#fff3c8,#e9c46a);box-shadow:0 3px 0 #8a5a0b;clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%)}
.rwq-pick{display:grid;grid-template-rows:repeat(3,auto);align-content:start;gap:clamp(8px,2cqh,14px)}
.rwq-priv>.rwq-fr{min-height:auto}
.rwq-row{display:flex;align-items:center;gap:clamp(12px,2cqw,18px);padding:clamp(6px,1.4cqh,10px) clamp(12px,2cqw,18px)}
.rwq-rl{flex:none;display:grid;place-items:center;align-content:center;gap:2px;width:clamp(44px,9cqh,60px);aspect-ratio:1;border-radius:14px;font-size:clamp(18px,4.2cqh,26px);line-height:1;background:linear-gradient(180deg,#1f5c40,#0b2f1f);box-shadow:inset 0 0 0 1.5px #c9a14a}
.rwq-rl small{font:900 clamp(7px,1.4cqh,9px)/1 "Nunito",system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#e9c46a}
.rwq-opts{display:flex;flex-wrap:wrap;align-items:center;gap:clamp(10px,1.8cqw,18px) clamp(12px,2.2cqw,22px);min-width:0}
.rwq-opt{position:relative;display:grid;place-items:center;border:0;padding:0;background:none;cursor:pointer;font-family:inherit;touch-action:manipulation;transition:transform .15s}
.rwq-opt:hover:not(:disabled){transform:scale(1.08)}
.rwq-opt:disabled{cursor:not-allowed}
.rwq-opt:disabled>*{filter:grayscale(.75);opacity:.55}
.rwq-opt.rwq-topt:disabled>*{opacity:.75;filter:none}.rwq-opt.rwq-topt:disabled::after{content:none;display:none}
.rwq-opt:disabled::after{content:'🔒';position:absolute;z-index:3;left:50%;top:50%;translate:-50% -50%;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:12px;line-height:1;background:rgba(7,29,19,.88);box-shadow:0 0 0 1.5px #e9c46a,0 2px 5px rgba(0,0,0,.5)}
.rwq-opt.on{transform:scale(1.1)}
.rwq-fopt .rwq-avatar{--a:clamp(30px,7cqh,44px)}
.rwq-fopt.on{transform:none}.rwq-fopt.on .rwq-avatar{box-shadow:inset 0 0 0 2px #fff3c8,0 0 0 calc(var(--a)*.32) rgba(233,196,106,.22)}
.rwq-sw{width:clamp(30px,7cqh,42px);aspect-ratio:1;border-radius:50%;background:var(--sw);box-shadow:inset 0 0 0 3px rgba(255,255,255,.6),0 3px 0 rgba(0,0,0,.3)}
.rwq-sw.on{box-shadow:inset 0 0 0 3px #fff,0 0 0 3px #e9c46a,0 0 14px #e9c46a}
.rwq-tchip{display:block;padding:clamp(5px,1.2cqh,8px) clamp(10px,1.8cqw,16px);border-radius:999px;color:#ffe9a8;font-weight:900;font-size:clamp(11px,2.5cqh,14px);background:rgba(7,29,19,.6);box-shadow:inset 0 0 0 1.5px rgba(233,196,106,.55)}
.rwq-tchip.on{color:#2b1d07;background:linear-gradient(180deg,#fff3c8,#e9c46a);box-shadow:0 3px 0 #8a5a0b}
.rwq-perks{display:grid;grid-template-columns:1fr 1fr;gap:clamp(6px,1.6cqh,12px)}
.rwq-perk{display:flex;align-items:center;gap:12px;padding:clamp(6px,1.8cqh,12px) 14px;min-width:0}
.rwq-perk>i{font-style:normal;font-size:clamp(24px,6cqh,38px);line-height:1}
.rwq-perk b{display:block;font:900 clamp(18px,5cqh,30px)/1 ${FONT}}
.rwq-perk small{display:block;font-weight:800;font-size:clamp(10px,2.2cqh,13px);opacity:.85}
.rwq-perk .rwq-opts{margin-top:4px}
.rwq-mini{padding:.35em .8em;border:0;border-radius:999px;cursor:pointer;font:900 clamp(11px,2.3cqh,13px)/1.1 ${FONT};color:#053b1c;background:linear-gradient(180deg,#b8ffcf,#2ecc71);box-shadow:0 3px 0 #1a8a47}
.rwq-mini.on{color:#3d1d00;background:linear-gradient(180deg,#fff7c2,#ffd23f);box-shadow:0 3px 0 #c27c00}
.rwq-perk.hint{background:linear-gradient(160deg,rgba(233,196,106,.38),rgba(15,58,39,.65))}
.rwq-perk.peek{background:linear-gradient(160deg,rgba(47,138,90,.6),rgba(7,29,19,.65))}

.rwq-pts{grid-template-rows:auto minmax(0,1fr)}
.rwq-stats4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(6px,1.6cqh,12px)}
.rwq-st{display:grid;justify-items:center;gap:2px;padding:clamp(6px,2cqh,14px) 6px;border-radius:clamp(14px,3cqh,22px);text-align:center;background:linear-gradient(170deg,var(--c1),var(--c2));box-shadow:inset 0 0 0 2px rgba(255,255,255,.35),0 4px 0 rgba(0,0,0,.25)}
.rwq-st i{font-style:normal;font-size:clamp(20px,5.5cqh,34px);line-height:1}
.rwq-st b{font:900 clamp(20px,7cqh,42px)/1 ${FONT};text-shadow:0 2px 0 rgba(0,0,0,.25)}
.rwq-st small{font-weight:900;font-size:clamp(9px,2.2cqh,13px);letter-spacing:.08em;text-transform:uppercase;opacity:.95}
.rwq-st.a{--c1:#ffe36e;--c2:#f5a300;color:#3d1d00}.rwq-st.b{--c1:#7cf29c;--c2:#13a37f}.rwq-st.c{--c1:#ffb070;--c2:#e0412a}.rwq-st.d{--c1:#a7e3ff;--c2:#3f7fe0}
.rwq-lower{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(6px,1.6cqh,12px);min-height:0}
.rwq-earn{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:clamp(6px,1.4cqh,12px);min-height:0}
.rwq-lootbox{display:flex;flex-direction:column;min-height:0}.rwq-lootbox .rwq-feed{flex:1 1 0;padding:0}.rwq-lootbox .rwq-wall{flex:1 1 0;padding:4px}
.rwq-e{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:0;max-height:150px;align-self:center;padding:clamp(4px,1.2cqh,10px) 2px;border-radius:14px;text-align:center;overflow:hidden;
 background:radial-gradient(circle at 50% 30%,rgba(233,196,106,.22),transparent 65%),rgba(7,29,19,.55);box-shadow:inset 0 0 0 1.5px rgba(233,196,106,.35);transition:transform .15s}
.rwq-e:hover{transform:translateY(-3px) scale(1.04)}
.rwq-e i{font-style:normal;font-size:clamp(16px,4.6cqh,28px);line-height:1}
.rwq-e b{font:900 clamp(12px,3.4cqh,20px)/1.1 ${FONT};color:#ffe36e}
.rwq-e small{font-weight:800;font-size:clamp(8px,1.9cqh,11px);line-height:1.1;opacity:.85;padding:0 3px}
.rwq-feed{display:flex;flex-direction:column;gap:clamp(4px,1cqh,8px);padding:clamp(6px,1.6cqh,12px);min-height:0;overflow:hidden;margin:0;list-style:none}
.rwq-feed li{flex:none;display:flex;align-items:center;gap:8px;padding:clamp(4px,1.2cqh,8px) 10px;border-radius:12px;background:rgba(0,0,0,.22);font-weight:800;font-size:clamp(11px,2.5cqh,14px)}
.rwq-feed li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rwq-feed li b{flex:none;padding:.1em .6em;border-radius:999px;color:#053b1c;background:#7cf29c;font-weight:900}
.rwq-feed .rwq-empty{flex:1;display:grid;place-items:center;text-align:center;opacity:.85;font-weight:800;background:none}
.rwq-feed .rwq-more{justify-content:center;background:rgba(255,255,255,.18)}

.rwq-vault{grid-template-columns:minmax(0,.8fr) minmax(0,2fr)}
.rwq-vhead{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,2cqh,14px);padding:12px;text-align:center}
.rwq-ring{--p:0;width:clamp(90px,min(40cqh,22cqw),190px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#e9c46a calc(var(--p)*1%),rgba(233,196,106,.15) 0);box-shadow:0 0 24px rgba(233,196,106,.35)}
.rwq-ring>div{width:80%;aspect-ratio:1;border-radius:50%;display:grid;place-content:center;background:linear-gradient(160deg,#1f5c40,#0b2f1f);box-shadow:inset 0 0 0 3px rgba(233,196,106,.35)}
.rwq-ring b{font:900 clamp(26px,9cqh,54px)/1 ${FONT}}.rwq-ring small{font-weight:900;font-size:clamp(10px,2.4cqh,14px);letter-spacing:.1em;text-transform:uppercase;opacity:.85}
.rwq-vtip{font-weight:800;font-size:clamp(11px,2.6cqh,15px);line-height:1.4}
.rwq-wall{display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:clamp(6px,1.4cqh,10px);padding:clamp(8px,2cqh,16px);min-height:0;overflow:hidden}
.rwq-word{padding:.35em .9em;border-radius:14px;font:900 clamp(13px,3.2cqh,20px)/1.2 ${FONT};color:#fff;background:linear-gradient(170deg,var(--c1),var(--c2));box-shadow:0 3px 0 rgba(0,0,0,.25);text-shadow:0 1px 0 rgba(0,0,0,.25)}
.rwq-word:nth-child(5n+1){--c1:#ff9ad5;--c2:#e0458f}.rwq-word:nth-child(5n+2){--c1:#a7e3ff;--c2:#3f7fe0}.rwq-word:nth-child(5n+3){--c1:#7cf29c;--c2:#13a37f}.rwq-word:nth-child(5n+4){--c1:#ffe36e;--c2:#f5a300;color:#3d1d00;text-shadow:none}.rwq-word:nth-child(5n){--c1:#d9a7ff;--c2:#7c3aed}
.rwq-word:nth-child(odd){rotate:-2deg}.rwq-word:nth-child(3n){rotate:2deg}
.rwq-more{padding:.35em .9em;border-radius:14px;font:900 clamp(13px,3.2cqh,20px)/1.2 ${FONT};background:rgba(255,255,255,.2)}
.rwq-vempty{display:grid;place-items:center;text-align:center;font-weight:900;font-size:clamp(14px,3.6cqh,22px)}
.rwq-vempty i{display:inline-block;font-style:normal;font-size:clamp(44px,16cqh,96px);line-height:1;animation:rwqBob 2.4s ease-in-out infinite}
@keyframes rwqBob{50%{transform:translateY(-8px) rotate(-4deg)}}

@container (orientation: portrait){
 .rwq-priv{grid-template-columns:1fr;grid-template-rows:auto auto auto}
 .rwq-me{grid-row:auto;flex-direction:row;justify-content:center;gap:clamp(12px,4cqw,22px);text-align:left}.rwq-me .rwq-avatar{--a:clamp(54px,10cqh,90px)}
 .rwq-who{align-items:flex-start}.rwq-fopt .rwq-avatar{--a:clamp(26px,5.4cqh,38px)}.rwq-sw{width:clamp(28px,6cqh,38px)}
 .rwq-priv{grid-template-rows:auto auto auto;align-content:start}
 .rwq-stats4{grid-template-columns:repeat(2,minmax(0,1fr))}
 .rwq-lower{grid-template-columns:1fr;grid-template-rows:minmax(0,1.1fr) minmax(0,1fr)}
 .rwq-vault{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
 .rwq-vhead{flex-direction:row}.rwq-ring{width:clamp(90px,22cqh,160px)}
}
@media (prefers-reduced-motion:reduce){.rwq-count.ready,body[data-rwq-theme]::after,.rwq-avatar::before,.rwq-v,.rwq-btile::after,.rwq-vempty i{animation:none!important}}`;
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

  /* ---------- game tabs ---------- */
  const initials = n => String(n || 'R').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'R';
  let selected = null;
  function infoHTML(b, s) {
    if (!b) return '👆 Tap a badge';
    const got = !!s.badges[b.id], hidden = b.secret && !got;
    return `${Q.badgeHTML(b, { locked: !got })}<b>${hidden ? '???' : esc(b.name)}</b><span class="rwq-tierpill" data-t="${b.tier}">${b.tier}</span><span>${hidden ? '🔍 Secret badge' : got ? '✅ Earned!' : '🎯 ' + esc(b.how)}</span>`;
  }
  function badgesPanel() {
    const s = Q.load(), mine = Q.owned(s).length, all = Q.BADGES.length;
    // Earned badges first, then the rest in their usual order.
    const list = Q.BADGES.slice().sort((a, b) => (!!s.badges[b.id]) - (!!s.badges[a.id]));
    return `<div class="rwq-v rwq-badges">
<div class="rwq-bhead"><span>🏅</span><span class="rwq-bar" role="img" aria-label="${mine} of ${all} badges"><i style="width:${Math.round(100 * mine / all)}%"></i></span><span>${mine}/${all}</span></div>
<section class="rwq-fr rwq-hall" data-c="amethyst"><span class="rwq-plate">🏆 Trophy Hall</span><div class="rwq-bgrid">${list.map(b => {
      const got = !!s.badges[b.id], hidden = b.secret && !got;
      return `<button type="button" class="rwq-btile${got ? ' got' : ' locked'}${selected === b.id ? ' sel' : ''}" data-b="${b.id}" data-t="${b.tier}" aria-label="${hidden ? 'Secret badge' : esc(b.name)}, ${b.tier}${got ? ', earned' : ''}">${Q.badgeHTML(b, { locked: !got })}<span>${hidden ? '???' : esc(b.name)}</span></button>`;
    }).join('')}</div></section>
<div class="rwq-binfo" aria-live="polite">${infoHTML(Q.BADGES.find(b => b.id === selected), s)}</div></div>`;
  }
  function opts(list, kind, s, draw) {
    return list.map(x => {
      const open = Q.needMet(s, x.need), on = s.equipped[kind] === x.id && open;
      return `<button type="button" class="rwq-opt ${draw.cls}${on ? ' on' : ''}" data-rwq-equip="${kind}" data-id="${x.id}" ${open ? '' : 'disabled'} title="${open ? esc(x.name) : '🔒 ' + esc(Q.needText(x.need))}" aria-label="${esc(x.name)}${open ? '' : ' (locked)'}" aria-pressed="${on}">${draw.html(x, on)}</button>`;
    }).join('');
  }
  function privilegesPanel() {
    const s = Q.load(), u = me(), frame = Q.FRAMES.find(f => f.id === s.equipped.frame && Q.needMet(s, f.need)) || Q.FRAMES[0];
    const title = Q.TITLES.find(t => t.id === s.equipped.title && Q.needMet(s, t.need)) || Q.TITLES[0];
    const tk = Q.tokens(s), main = s.main?.program, mainDone = !!(main && s.snap?.dest?.[main]?.done);
    const sides = ['aral', 'interv', 'sra'].filter(d => d !== main);
    const peek = !main ? '<small>🔒 After Keypass</small>' : mainDone ? '<small>✅ All open</small>'
      : Q.previewAllowed(s) ? `<span class="rwq-opts">${sides.map(d => `<button type="button" class="rwq-mini${s.preview === d ? ' on' : ''}" data-rwq-preview="${s.preview === d ? '' : d}" title="Preview without points">${esc(Q.NAMES[d].replace('READwy ', ''))}</button>`).join('')}</span>`
      : '<small>🔒 Any Gold badge</small>';
    const ini = esc(initials(u.name));
    return `<div class="rwq-v rwq-priv">
<section class="rwq-me rwq-fr" data-c="sapphire"><span class="rwq-plate">🎫 Passenger Card</span><span class="rwq-avatar" data-frame="${frame.id}">${ini}</span><span class="rwq-who"><b>${esc(u.name || 'Passenger')}</b><span class="rwq-ribbon">${esc(title.name)}</span></span></section>
<div class="rwq-pick rwq-fr" data-c="ruby"><span class="rwq-plate">👑 Wardrobe</span>
 <div class="rwq-row rwq-glass"><span class="rwq-rl" title="Avatar frame">🖼️<small>Frame</small></span><div class="rwq-opts">${opts(Q.FRAMES, 'frame', s, { cls: 'rwq-fopt', html: f => `<span class="rwq-avatar" data-frame="${f.id}">${ini}</span>` })}</div></div>
 <div class="rwq-row rwq-glass"><span class="rwq-rl" title="Colour theme">🎨<small>Theme</small></span><div class="rwq-opts">${opts(Q.THEMES, 'theme', s, { cls: '', html: (t, on) => `<span class="rwq-sw${on ? ' on' : ''}" style="--sw:${t.swatch}"></span>` })}</div></div>
 <div class="rwq-row rwq-glass"><span class="rwq-rl" title="Profile title">🏷️<small>Title</small></span><div class="rwq-opts">${opts(Q.TITLES, 'title', s, { cls: 'rwq-topt', html: (t, on) => `<span class="rwq-tchip${on ? ' on' : ''}">${Q.needMet(s, t.need) ? '' : '🔒 '}${esc(t.name)}</span>` })}</div></div>
</div>
<div class="rwq-perks rwq-fr" data-c="teal"><span class="rwq-plate">⚡ Power-Ups</span><div class="rwq-perk rwq-glass hint" title="Used first when you ask for a hint in Inkventure"><i>💡</i><span><b>${tk.hint}</b><small>Hint tokens</small></span></div>
<div class="rwq-perk rwq-glass peek" title="Preview one Side Quest early (no points)"><i>🔭</i><span><small>Early access</small>${peek}</span></div></div></div>`;
  }
  function pointsPanel() {
    const s = Q.load(), P = Q.POINTS, all = Object.entries(s.log).map(([k, a]) => ({ k, ...a })).filter(a => a.a > 0).sort((a, b) => (b.t || 0) - (a.t || 0));
    const week = all.filter(a => Date.now() - (a.t || 0) < 7 * 864e5).reduce((n, a) => n + (a.a || 0), 0);
    const spent = Math.max(0, Number((readLS(PREFIX + 'badges_' + Q.learnerKey(), {}) || {}).spent) || 0);
    const st = (c, i, v, l) => `<div class="rwq-st ${c}"><i>${i}</i><b>${v}</b><small>${l}</small></div>`;
    const e = (i, v, l) => `<div class="rwq-e" title="${l}: ${v}"><i>${i}</i><b>${v}</b><small>${l}</small></div>`;
    return `<div class="rwq-v rwq-pts">
<div class="rwq-stats4">${st('a', '⭐', Q.total(s), 'Total')}${st('b', '📅', week, 'This week')}${st('c', '🔥', Q.streak(s), 'Day streak')}${st('d', '🛒', Math.max(0, Q.total(s) - spent), 'To spend')}</div>
<div class="rwq-lower">
 <div class="rwq-earn rwq-fr" data-c="sapphire"><span class="rwq-plate">🎯 How to Earn</span>${e('✅', '+' + P.task, 'Task')}${e('🎯', '+' + P.accuracyBonus, '90%+')}${e('📅', '+' + P.dailyLogin, 'Daily')}${e('🔥', '+' + P.streakBonus[3] + '–' + P.streakBonus[30], 'Streak')}${e('🔑', '+' + P.keypass, 'Keypass')}${e('🏁', '+' + P.mainQuestFinished, 'Main Quest')}${e('📝', '+' + P.postTest, 'Post-Test')}${e('📒', '+' + P.readingLab.wordVaultWord, 'Word')}</div>
 <div class="rwq-fr rwq-lootbox" data-c="amber"><span class="rwq-plate">💰 Recent Loot</span><ul class="rwq-feed" data-trim data-total="${all.length}">${all.length ? all.slice(0, 30).map(a => `<li title="${esc(a.r)}"><span>${esc(a.r)}</span><b>+${a.a}</b></li>`).join('') : '<li class="rwq-empty">🚀 Finish a task to earn points!</li>'}</ul></div>
</div></div>`;
  }
  function vaultPanel() {
    const v = readLS(Q.vaultKey(), []) || [], C = Q.POINTS.readingLab, pct = Math.min(100, Math.round(100 * v.length / C.wordVaultMax));
    return `<div class="rwq-v rwq-vault">
<div class="rwq-vhead rwq-fr" data-c="amethyst"><span class="rwq-plate">🔐 The Vault</span><div class="rwq-ring" style="--p:${pct}" role="img" aria-label="${v.length} words"><div><b>${v.length}</b><small>words</small></div></div>
<span class="rwq-vtip">👆👆 Double-tap a word<br>in the Reading Lab<br><span class="rwq-pill">+${C.wordVaultWord} ⭐ each</span></span></div>
<div class="rwq-fr rwq-lootbox" data-c="teal"><span class="rwq-plate">📚 Word Collection</span>
${v.length ? `<div class="rwq-wall" data-trim data-total="${v.length}">${v.slice(-80).reverse().map(x => `<span class="rwq-word" title="${esc(x.src || '')}">${esc(x.w)}</span>`).join('')}</div>`
      : '<div class="rwq-wall rwq-vempty"><span><i>📖</i><br>Your vault is empty</span></div>'}</div></div>`;
  }
  const PANELS = { badges: badgesPanel, privileges: privilegesPanel, points: pointsPanel, vault: vaultPanel };
  function panel(name) { try { return (PANELS[name] || badgesPanel)() } catch (e) { return '<p>Could not show this page.</p>' } }

  /* ---------- fitting every tab into the screen ---------- */
  function trim(list) {
    if (!list || list.scrollHeight <= list.clientHeight + 1) return;
    const total = Number(list.dataset.total) || list.children.length;
    let more = null;
    while (list.children.length > 1 && list.scrollHeight > list.clientHeight + 1) {
      if (more) more.remove();
      list.lastElementChild.remove();
      more = document.createElement(list.tagName === 'UL' ? 'li' : 'span'); more.className = 'rwq-more';
      more.textContent = `+${total - list.children.length} more`;
      list.append(more);
    }
  }
  function layout(name, panelEl) {
    if (!panelEl) return;
    const v = panelEl.firstElementChild; if (!v) return;
    v.style.zoom = '';
    const grid = v.querySelector('.rwq-bgrid');
    if (grid && window.readwyFitGrid) {
      grid.classList.remove('tiny');
      const w = window.readwyFitGrid(grid, grid.children.length, 1.2, 8, 130);
      if (w < 64) { grid.classList.add('tiny'); window.readwyFitGrid(grid, grid.children.length, 1, 6, 130) }
    }
    v.querySelectorAll('.rwq-btile span').forEach(label => {
      label.style.fontSize = '';
      let size = parseFloat(getComputedStyle(label).fontSize) || 12;
      while (label.scrollWidth > label.clientWidth + 0.5 && size > 6.5) { size -= 0.5; label.style.fontSize = size + 'px' }
    });
    v.querySelectorAll('[data-trim]').forEach(trim);
    // Last resort: shrink the whole tab a little so nothing is cut off and nothing scrolls.
    const H = panelEl.clientHeight, W = panelEl.clientWidth, need = v.scrollHeight, wide = v.scrollWidth;
    if (need > H + 1 || wide > W + 1) v.style.zoom = String(Math.max(.55, Math.min(H / need, W / wide)));
  }
  // Clicks inside a tab. Returns true when it changed something (the tab is drawn again).
  function panelClick(e) {
    const tile = e.target.closest('[data-b]');
    if (tile) {
      selected = tile.dataset.b;
      tile.parentElement.querySelectorAll('.sel').forEach(t => t.classList.remove('sel')); tile.classList.add('sel');
      const info = tile.closest('.rwq-v').querySelector('.rwq-binfo'); if (info) info.innerHTML = infoHTML(Q.BADGES.find(b => b.id === selected), Q.load());
      return false;
    }
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
  window.READwyQuestsUI = { panel, panelClick, layout, decorate };
})();
