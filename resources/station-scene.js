/* READwy HD station layer: the animated Victorian station used by the login, sign-up and startup screens. */
(()=>{
 if(window.readwyStationLayer)return;
 const IMG='resources/station-hall-hd.webp',CLEAN_IMG='resources/station-journey.webp',ART='resources/readwy-title-cutout.png',IW=1672,IH=941;
 const css=`
.rs-wrap{position:absolute;inset:0;overflow:hidden;background:#140d08;z-index:0;pointer-events:none}
.rs-stage{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px;transform-origin:0 0}
.rs-cam{position:absolute;inset:0;transform-origin:55% 55%;animation:rsCam 28s ease-in-out infinite alternate}
@keyframes rsCam{to{transform:scale(1.04) translate(-8px,-4px)}}
.rs-bg{position:absolute;inset:0;width:${IW}px;height:${IH}px;display:block}
.rs-piece{position:absolute;background-image:url(${IMG});background-size:${IW}px ${IH}px}
.rs-banner{animation:rsSway 5s ease-in-out infinite}.rs-banner.b2{animation-duration:6.3s;animation-delay:-2s}
@keyframes rsSway{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}
.rs-sign{animation:rsSwing 7s ease-in-out infinite;box-shadow:0 10px 18px #0006}.rs-sign.r{animation-delay:-3.5s}
@keyframes rsSwing{0%,100%{transform:rotate(-.6deg)}50%{transform:rotate(.6deg)}}
.rs-signtext{position:absolute;inset:14px 12px;display:grid;place-content:center;gap:6px;text-align:center;color:#f3e2b0}
.rs-signtext small{font:700 11px system-ui,sans-serif;letter-spacing:.16em;white-space:nowrap;color:#d9bf7c}
.rs-signtext b{font:700 27px/1.05 Georgia,serif;white-space:nowrap;color:#ffe6a8;text-shadow:0 0 12px #ffd76a66}
.rs-signtext span{font:600 14px system-ui,sans-serif;color:#d7e8d0;letter-spacing:.06em}
.rs-sign.r .rs-signtext b{font:700 50px/1 'Courier New',ui-monospace,monospace;color:#ffc56a;text-shadow:0 0 14px #ffb84d99}
.rs-blink{animation:rsBlink 1.4s steps(2) infinite}@keyframes rsBlink{50%{opacity:.35}}
.rs-board{position:absolute;left:300px;top:500px;width:416px;height:222px;box-sizing:border-box;padding:20px 24px;border-radius:10px;background:radial-gradient(120% 90% at 50% 20%,#1d5c3d,#124530 55%,#0a2e1d);color:#f3e2b0;box-shadow:inset 0 0 0 3px #c9a14a,inset 0 0 0 6px #0f3d27,inset 0 0 0 7px #c9a14a,0 16px 26px #0009;text-align:center;font-family:Georgia,serif}
.rs-clear-shade .rs-sign{z-index:4;box-shadow:none}
.rs-clear-shade .rs-board{z-index:4;box-shadow:inset 0 0 0 3px #c9a14a,inset 0 0 0 6px #0f3d27,inset 0 0 0 7px #c9a14a}
.rs-startup-login-frames .rs-cam{animation:none!important;transform:none!important}
.rs-startup-login-frames .rs-sign{animation:none!important}
.rs-startup-login-frames .rs-piece:not(.rs-sign){background-image:url(${CLEAN_IMG})!important}
.rs-startup-login-frames .rs-sign:not(.r){left:200px!important;top:350px!important;width:380px!important;height:170px!important;box-sizing:border-box!important;background:#052B1E!important;border:3px solid #c9a14a!important;border-radius:10px!important;box-shadow:inset 0 0 0 4px #0f3d27,inset 0 0 0 5px #c9a14a!important;translate:-64px 0}
.rs-startup-login-frames .rs-board{left:200px!important;top:540px!important;width:380px!important;height:170px!important;padding:14px 18px!important;background:#052B1E!important;box-shadow:inset 0 0 0 3px #c9a14a,inset 0 0 0 6px #0f3d27,inset 0 0 0 7px #c9a14a!important;translate:-64px 0}
.rs-board:before,.rs-board:after{content:'';position:absolute;bottom:-20px;width:12px;height:22px;background:linear-gradient(90deg,#2a1c0e,#5a3d1c,#2a1c0e)}
.rs-board:before{left:40px}.rs-board:after{right:40px}
.rs-board small{display:block;font:700 13px system-ui,sans-serif;letter-spacing:.3em;color:#d9bf7c}
.rs-board b{display:block;margin:8px 0 6px;font:700 34px/1.05 Georgia,serif;color:#ffe6a8;text-shadow:0 0 14px #ffd76a55}
.rs-board p{margin:0;font:italic 400 18px/1.45 Georgia,serif;color:#e8dcc0}
@media(max-aspect-ratio:3/4){
.rs-wrap.rs-startup-login-frames::before{content:'';position:absolute;inset:-20px;z-index:0;pointer-events:none;background:linear-gradient(#07182b99,#07182b99),url(${CLEAN_IMG}) center/cover no-repeat;filter:blur(18px) brightness(.7);transform:scale(1.04)}
.rs-startup-login-frames .rs-stage{z-index:1}
.rs-startup-login-frames .rs-sign:not(.r){left:30px!important;top:380px!important;width:1530px!important;height:330px!important;translate:0 0!important}
.rs-startup-login-frames .rs-sign.r{left:940px!important;top:30px!important;width:700px!important;height:340px!important;background:#052B1E!important;background-image:none!important;border:3px solid #c9a14a!important;box-shadow:inset 0 0 0 4px #0f3d27,inset 0 0 0 5px #c9a14a!important}
.rs-startup-login-frames .rs-signtext{inset:30px 32px!important;gap:14px!important}
.rs-startup-login-frames .rs-signtext small{font-size:50px!important;letter-spacing:.14em!important}
.rs-startup-login-frames .rs-signtext b{font-size:78px!important}
.rs-startup-login-frames .rs-signtext span{font-size:42px!important}
.rs-startup-login-frames .rs-sign.r .rs-signtext b{font-size:88px!important}
.rs-startup-login-frames .rs-board{left:30px!important;top:730px!important;width:1530px!important;height:360px!important;padding:24px 36px!important;translate:0 0!important}
.rs-startup-login-frames .rs-board small{font-size:46px!important;letter-spacing:.2em!important}
.rs-startup-login-frames .rs-board b{margin:10px 0 6px!important;font-size:76px!important}
.rs-startup-login-frames .rs-board p{font-size:38px!important;line-height:1.15!important}
.rs-startup-login-frames .rs-board .rs-dots{margin-top:8px!important;font-size:30px!important}
}
.rs-board .rs-dots{margin-top:10px;font:700 13px ui-monospace,Menlo,monospace;letter-spacing:.14em;color:#ffc56a}
/* Keep the Welcome Aboard text inside its frame, centred with even space above and below. */
.rs-board{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.rs-board small,.rs-board b,.rs-board p,.rs-board .rs-dots{flex:0 0 auto;margin:0}
.rs-board b{font-size:30px}
.rs-board p{font-size:16px;line-height:1.35}
.rs-startup-login-frames .rs-board small{font-size:12px}
.rs-startup-login-frames .rs-board b{font-size:28px}
.rs-startup-login-frames .rs-board p{font-size:15px;line-height:1.3}
.rs-startup-login-frames .rs-board .rs-dots{font-size:12px}
.rs-glow{position:absolute;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);border-radius:50%;background:radial-gradient(circle,#ffe2a0cc,#ffb84d55 40%,#ffb84d00 70%);mix-blend-mode:screen;animation:rsFlick 2.2s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes rsFlick{0%,100%{opacity:.85;transform:scale(1)}20%{opacity:.6;transform:scale(.94)}35%{opacity:1;transform:scale(1.05)}60%{opacity:.72}80%{opacity:.95;transform:scale(1.02)}}
.rs-rays{position:absolute;inset:0;mix-blend-mode:screen}
.rs-rays i{position:absolute;top:-60px;width:150px;height:900px;background:linear-gradient(#fff4cf66,#fff4cf00 85%);transform:skewX(28deg);transform-origin:top;filter:blur(8px);animation:rsRay 9s ease-in-out infinite;animation-delay:var(--d)}
@keyframes rsRay{0%,100%{opacity:.25;translate:0 0}50%{opacity:.6;translate:-40px 0}}
.rs-floor{position:absolute;left:0;right:0;top:690px;bottom:0;mix-blend-mode:soft-light;opacity:.55;background:repeating-linear-gradient(100deg,#fff0 0 60px,#fff6 70px,#fff0 90px 160px);background-size:400px 100%;animation:rsShimmer 6s linear infinite}
@keyframes rsShimmer{to{background-position:400px 0}}
.rs-fx,.rs-far{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px}
.rs-dt{animation:rsDistant 16s linear infinite}
@keyframes rsDistant{0%{transform:translateX(640px);opacity:0}6%{opacity:1}90%{opacity:1}100%{transform:translateX(150px);opacity:0}}
.rs-bird{position:absolute;left:0;top:0;opacity:0}
.rs-bird path{transform-origin:30px 16px;animation:rsFlap .32s ease-in-out infinite alternate}.rs-bird path+path{animation-delay:-.32s}
@keyframes rsFlap{to{transform:scaleY(-.6)}}
.rs-shade{position:absolute;inset:0;background:radial-gradient(130% 100% at 50% 45%,#0000 55%,#0008 100%),linear-gradient(#0006,#0000 22%)}
@media(prefers-reduced-motion:reduce){.rs-cam,.rs-banner,.rs-sign,.rs-glow,.rs-rays i,.rs-floor,.rs-blink,.rs-dt{animation:none!important}}`;
 const ensureStyles=()=>{
  let st=document.getElementById('readwyStationLayerCSS');
  if(!st){st=document.createElement('style');st.id='readwyStationLayerCSS';st.textContent=css}
  if(!st.isConnected)document.head.appendChild(st);
 };
 ensureStyles();
 const piece=(cls,x,y,w,h,poly,orig,inner='')=>`<div class="rs-piece ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background-position:${-x}px ${-y}px;clip-path:polygon(${poly});transform-origin:${orig}">${inner}</div>`;
 window.readwyStationLayer=(host,o={})=>{
  ensureStyles();
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const wrap=document.createElement('div');wrap.className='rs-wrap';if(o.shade===false)wrap.classList.add('rs-clear-shade');if(o.loginFrames===true)wrap.classList.add('rs-startup-login-frames');wrap.setAttribute('aria-hidden','true');
  const sg=o.sign||{small:'THE READING EXPRESS',big:'PLATFORM 7½',blink:'● NOW BOARDING'},bd=o.board||{small:'WELCOME ABOARD',big:'The Reading Express',text:'Departing daily for the Enchanted Academy of Reading.'};
  wrap.innerHTML=`<div class="rs-stage"><div class="rs-cam">
<img class="rs-bg" src="${o.loginFrames===true?CLEAN_IMG:IMG}" alt="" draggable="false">
<svg class="rs-far" viewBox="0 0 ${IW} ${IH}"><defs><image id="rsArt" href="${ART}" width="851" height="1847"/><clipPath id="rsTrainClip"><path d="M172 974 178 944 192 937 205 919 229 919 228 942 268 941 296 948 306 956 681 1038 683 1067 306 1019 172 998Z"/></clipPath><clipPath id="rsView"><path d="M240 140H585V318H240Z"/></clipPath><linearGradient id="rsHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b6d8" stop-opacity="0"/><stop offset="1" stop-color="#e8c9b8" stop-opacity=".45"/></linearGradient></defs>
<g clip-path="url(#rsView)"><path d="M230 316 H600 V330 H230Z" fill="#5a5470" opacity=".75"/>${[0,1,2,3,4,5,6,7,8].map(k=>`<path d="M${236+k*42} 330 v-6 a14 9 0 0 1 28 0 v6z" fill="#3f3a58" opacity=".7"/>`).join('')}
<g class="rs-dt"><g transform="translate(0 312) scale(.3) rotate(-10.6) translate(-178 -982)" style="filter:brightness(1.3) saturate(.85) sepia(.2)"><g clip-path="url(#rsTrainClip)"><use href="#rsArt"/></g></g></g>
<rect x="230" y="140" width="370" height="190" fill="url(#rsHaze)"/></g></svg>
<div class="rs-rays"><i style="left:980px;--d:0s"></i><i style="left:1120px;--d:-3s"></i><i style="left:1260px;--d:-6s"></i><i style="left:760px;--d:-1.5s"></i></div>
${piece('rs-banner',356,0,108,236,'0 0,100% 0,100% 86%,50% 100%,0 86%','50% 0')}
${piece('rs-banner b2',846,70,80,180,'0 0,100% 0,100% 82%,50% 100%,0 82%','50% 0')}
${piece('rs-sign',336,318,236,180,'0 0,100% 0,100% 100%,0 100%','50% 0',`<div class="rs-signtext"><small>${sg.small}</small><b>${sg.big}</b><span class="rs-blink">${sg.blink}</span></div>`)}
${piece('rs-sign r',1336,236,200,212,'0 0,100% 0,100% 100%,0 100%','50% 0',`<div class="rs-signtext"><small>NEXT DEPARTURE</small><b class="rs-count">02:00</b><span class="rs-time"></span></div>`)}
<div class="rs-board"><small>${bd.small}</small><b>${bd.big}</b><p>${bd.text}</p><div class="rs-dots">✦ PLATFORM 7½ ✦</div></div>
<i class="rs-glow" style="left:205px;top:245px;--s:150px"></i><i class="rs-glow" style="left:1500px;top:140px;--s:170px;--d:-.7s"></i><i class="rs-glow" style="left:1548px;top:612px;--s:190px;--d:-1.3s"></i><i class="rs-glow" style="left:1142px;top:262px;--s:110px;--d:-.4s"></i>
<div class="rs-floor"></div>
<canvas class="rs-fx" width="${IW}" height="${IH}"></canvas>
<svg class="rs-bird" viewBox="0 0 60 30" width="46" height="23"><path d="M30 16 Q18 2 2 8 Q16 10 30 18Z" fill="#2a1f14"/><path d="M30 16 Q42 2 58 8 Q44 10 30 18Z" fill="#2a1f14"/><ellipse cx="30" cy="17" rx="7" ry="3.5" fill="#2a1f14"/></svg>
</div></div>${o.shade===false?'':'<div class="rs-shade"></div>'}`;
  host.prepend(wrap);
  const stage=wrap.querySelector('.rs-stage');
  const fit=()=>{const W=wrap.clientWidth,H=wrap.clientHeight;if(!W||!H)return;const mobileFit=o.mobileFit===true&&W<H,s=mobileFit?Math.min(W/IW,H/IH):Math.max(W/IW,H/IH)*(W<H?1:(o.zoom||1)),wideFocus=typeof o.focusWide==='function'?o.focusWide(W,H,s):(o.focusWide??IW/2),focus=W<H?(o.focusTall??640):wideFocus;let x=mobileFit?(W-IW*s)/2:W/2-focus*s;x=Math.min(0,Math.max(W-IW*s,x));const y=(H-IH*s)*(mobileFit?(o.mobileAlignY??.28):(o.alignY??.5));stage.style.transform=`translate(${x}px,${y}px) scale(${s})`};
  fit();addEventListener('resize',fit);new ResizeObserver(fit).observe(wrap);
  let left=120;const clock=()=>{if(!wrap.isConnected)return;left=left<=0?120:left-1;wrap.querySelector('.rs-count').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;const d=new Date();wrap.querySelector('.rs-time').textContent=`Station time ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};clock();const ci=setInterval(()=>{if(!wrap.isConnected)clearInterval(ci);else clock()},1000);
  const cv=wrap.querySelector('.rs-fx'),ctx=cv.getContext('2d'),parts=[],dust=[];for(let i=0;i<80;i++)dust.push({x:700+Math.random()*900,y:40+Math.random()*560,v:4+Math.random()*10,a:Math.random()*6.28,r:.8+Math.random()*1.8});
  let last=performance.now(),chuff=0,hiss=0;
  const loop=now=>{if(!wrap.isConnected)return;const dt=Math.min(.05,(now-last)/1000);last=now;ctx.clearRect(0,0,IW,IH);
   if(!reduce){chuff-=dt;hiss-=dt;if(chuff<=0){chuff=.6;for(let n=0;n<5;n++)parts.push({x:600+Math.random()*14,y:322,r:9+Math.random()*7,vx:-6+Math.random()*12,vy:-(70+Math.random()*40),life:0,max:3.6+Math.random()*1.5,smoke:1,g:175+Math.floor(Math.random()*45)})}
    if(hiss<=0){hiss=.14;parts.push({x:1000+Math.random()*260,y:668+Math.random()*12,r:14+Math.random()*14,vx:-(20+Math.random()*40),vy:-(6+Math.random()*10),life:0,max:2.6+Math.random()*1.6})}}
   for(let k=parts.length-1;k>=0;k--){const p=parts[k];p.life+=dt;const t=p.life/p.max;if(t>=1){parts.splice(k,1);continue}if(p.smoke){p.vy*=1-dt*.5;p.vx+=dt*10}p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=(p.smoke?18:16)*dt;
    const a=p.smoke?.6*Math.pow(1-t,1.3):.32*Math.sin(Math.PI*t),c=p.smoke?`${p.g},${p.g+3},${p.g+8}`:'246,244,238';const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.6,`rgba(${c},${a*.5})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
   for(const m of dust){if(!reduce){m.a+=dt*.6;m.y+=m.v*dt*.35;m.x+=Math.sin(m.a)*6*dt;if(m.y>620){m.y=40;m.x=700+Math.random()*900}}ctx.fillStyle=`rgba(255,236,190,${.35+.3*Math.sin(m.a*2)})`;ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,7);ctx.fill()}
   requestAnimationFrame(loop)};
  requestAnimationFrame(loop);
  const bird=wrap.querySelector('.rs-bird');const fly=()=>{if(reduce||!wrap.isConnected)return;const y=110+Math.random()*90,t0=performance.now(),dur=7000;const step=now=>{const t=(now-t0)/dur;if(t>1){bird.style.opacity=0;return}bird.style.opacity=1;bird.style.transform=`translate(${(-80+t*1850).toFixed(0)}px,${(y+Math.sin(t*9)*14).toFixed(0)}px)`;requestAnimationFrame(step)};requestAnimationFrame(step)};setTimeout(fly,3500);const bi=setInterval(()=>{if(!wrap.isConnected)clearInterval(bi);else fly()},16000);
  return wrap;
 };
})();
