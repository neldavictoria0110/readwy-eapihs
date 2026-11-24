/* BLOCK:trainnav */
/* Seamless Reading Express navigation between the journey ticket and every stop.
   The next page is loaded in the background (in a full-screen frame of this same document) while the train runs;
   the train crosses the screen and pulls that page in behind its last carriage. The URL changes with pushState,
   so the browser never reloads and no blank, white or blue frame is ever shown.
   Forward (journey -> stop): engine faces right, train runs left -> right, next page follows from the left.
   Return (stop -> journey): engine faces left, train runs right -> left, journey page follows from the right. */
(function(){
if(window.readwyTrainGo)return;
const abs=h=>new URL(h,location.href).href;
const isJourney=h=>{try{return new URL(h,location.href).searchParams.get('view')==='map'}catch(e){return false}};
let topGo=null;try{if(window.top!==window&&window.top.location.origin===location.origin&&window.top.readwyTrainGo)topGo=window.top.readwyTrainGo}catch(e){}
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced-motion');
const labelOf=h=>{try{const u=new URL(h,location.href),m=u.searchParams.get('journeyModule');return isJourney(h)?'Your Learning Journey':({gst:'Group Screening Test',orst:'Oral Reading Screening Test',wst:'Writing Screening Test',srst:'Silent Reading Screening Test',aral:'ARAL Program',interv:'Intervention Program',sra:'Reading Lab',reports:'Post-Test'})[m]||'Reading Express'}catch(e){return 'Reading Express'}};

/* Pages inside the frame hand navigation to the top window. */
window.readwyGo=function(href,label){if(topGo)return topGo(abs(href),label);return window.readwyTrainGo(abs(href),label)};
window.readwyTrainDepart=window.readwyGo;
window.readwyTrainArrive=function(){};
if(topGo){
 // Loading hidden behind the train: skip this page's own opening animation and fade so it is ready sooner.
 const H=document.documentElement,had=H.classList.contains('reduced-motion');
 // The journey ticket arrives already in place behind the train (no unfold / fade-in of its own).
 {const st=document.createElement('style');st.textContent='html.map-unfold .journey-wide,html.map-unfold .journey-wide-stages{animation:none!important;opacity:1!important;filter:none!important;transform:none!important}';(document.head||H).appendChild(st)}
 const settle=()=>{for(const el of document.querySelectorAll('.pf-ticket,.pf-cap')){if(el.classList.contains('in')||new URLSearchParams(location.search).get('launchHold')==='1')continue;const tr=el.style.transition;el.style.transition='none';el.classList.add('in');void el.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition=tr}))}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settle);else settle();
 addEventListener('load',settle);
 if(H.classList.contains('program-loading')){
  const st=document.createElement('style');st.textContent='html.program-arrival body{transition:none!important}';(document.head||H).appendChild(st);
  H.classList.add('reduced-motion');
  const mo=new MutationObserver(()=>{if(H.classList.contains('program-loading')){if(!H.classList.contains('reduced-motion'))H.classList.add('reduced-motion')}else{mo.disconnect();if(!had)H.classList.remove('reduced-motion')}});
  mo.observe(H,{attributes:true,attributeFilter:['class']});
 }
 addEventListener('click',e=>{const a=e.target.closest?.('a.stage');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();topGo(a.href,(a.getAttribute('aria-label')||'').replace(/^\d+\.\s*/,''))},true);
 const pre=e=>{const a=e.target.closest?.('a.stage');if(a)try{window.top.readwyTrainPreload(a.href)}catch(x){}};
 addEventListener('pointerover',pre,{passive:true});addEventListener('pointerdown',pre,{passive:true});addEventListener('touchstart',pre,{passive:true});
 window.readwyTrainGo=topGo;return;
}

/* ---------- top window ---------- */
const css=`
#rwStage{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
#rwStage.on{pointer-events:all}
.rw-frame{position:absolute;left:0;top:0;width:100vw;height:100vh;height:100dvh;border:0;background:transparent;will-change:transform}
.rw-frame.pre{visibility:hidden;transform:translate3d(-300vw,0,0)}
.rw-frame.moving{box-shadow:0 0 40px rgba(0,0,0,.55)}
html.rw-hosted body>*:not(#rwStage){visibility:hidden!important}
html.rw-hosted,html.rw-hosted body{overflow:hidden!important}
.rw-train-layer{position:absolute;left:0;top:0;overflow:hidden;pointer-events:none;--rw-h:120px}
.rw-train{position:absolute;left:0;display:flex;align-items:flex-end;will-change:transform}
.rw-car{position:relative;flex:none;width:calc(var(--rw-h)*1.85);height:var(--rw-h);margin:0 calc(var(--rw-h)*.045);border-radius:calc(var(--rw-h)*.12) calc(var(--rw-h)*.12) calc(var(--rw-h)*.04) calc(var(--rw-h)*.04);background:linear-gradient(180deg,#2a0a12 0,#a1344c 5%,#7b2337 11%,#5a1828 30%,#4a1220 70%,#2c0a13 100%);box-shadow:inset 0 0 0 3px #c9a24a,inset 0 calc(var(--rw-h)*-.13) 0 #1c070d,0 14px 26px rgba(0,0,0,.6);animation:rwBob .42s ease-in-out infinite alternate}
.rw-car:nth-child(2n){animation-delay:.15s}
.rw-train-layer[data-pal] .rw-car{background:linear-gradient(180deg,var(--rw-c0) 0,var(--rw-c1) 5%,var(--rw-c2) 11%,var(--rw-c3) 30%,var(--rw-c3) 70%,var(--rw-c0) 100%);box-shadow:inset 0 0 0 3px var(--rw-tr),inset 0 calc(var(--rw-h)*-.13) 0 var(--rw-c0),0 14px 26px rgba(0,0,0,.6)}
.rw-train-layer[data-pal] .rw-name{background:linear-gradient(180deg,var(--rw-c0),var(--rw-c3));border-color:var(--rw-tr)}
.rw-train-layer[data-pal] .rw-wins i{box-shadow:inset 0 0 0 3px var(--rw-c0),inset 0 0 0 5px var(--rw-tr),0 0 calc(var(--rw-h)*.12) rgba(255,190,100,.45)}
.rw-roof{position:absolute;left:-2%;right:-2%;top:-6%;height:11%;border-radius:40% 40% 8px 8px/100% 100% 8px 8px;background:linear-gradient(180deg,#3a3a40,#121216);box-shadow:inset 0 2px 0 rgba(255,255,255,.18)}
.rw-wins{position:absolute;left:7%;right:7%;top:16%;height:34%;display:flex;gap:5%}
.rw-wins i{flex:1;border-radius:10% 10% 4% 4%;background:radial-gradient(ellipse at 50% 65%,#fff2c4,#f6c56a 55%,#b56e1e 100%);box-shadow:inset 0 0 0 3px #2a0d14,inset 0 0 0 5px #b8913d,0 0 calc(var(--rw-h)*.12) rgba(255,190,100,.45)}
.rw-name{position:absolute;left:50%;top:60%;transform:translateX(-50%);padding:.15em .8em;border-radius:6px;background:linear-gradient(180deg,#1c070d,#3a0d18);border:2px solid #c9a24a;font:700 calc(var(--rw-h)*.075) Cinzel,Georgia,serif;letter-spacing:.14em;color:#f3dc98;white-space:nowrap}
.rw-bogie{position:absolute;bottom:calc(var(--rw-h)*-.1);display:flex;gap:calc(var(--rw-h)*.04)}.rw-bogie.a{left:8%}.rw-bogie.b{right:8%}
.rw-bogie i{width:calc(var(--rw-h)*.2);height:calc(var(--rw-h)*.2);border-radius:50%;background:radial-gradient(circle,#f3dc98 0 12%,#5a4216 14% 18%,transparent 20%),repeating-conic-gradient(#1a1a1d 0 14deg,#4b4b52 14deg 30deg);box-shadow:0 0 0 3px #2b2b30,inset 0 0 0 4px #8a6a26;animation:rwSpin .38s linear infinite}
.rw-engine{flex:none;overflow:visible}
.rw-engine.face-right{transform:scaleX(-1)}
.rw-engine .tw{animation:rwSpin .38s linear infinite;transform-box:fill-box;transform-origin:center}
.rw-coupler{flex:none;align-self:center;width:calc(var(--rw-h)*.16);height:calc(var(--rw-h)*.06);margin-top:calc(var(--rw-h)*.25);border-radius:3px;background:linear-gradient(135deg,#f7e7ae,#a8822f 50%,#f3dc98)}
.rw-rail{position:absolute;left:0;right:0;height:calc(var(--rw-h)*.16);background:linear-gradient(180deg,transparent 0 18%,#d9dde4 18%,#8a909a 38%,#3c4048 46%,transparent 46%),repeating-linear-gradient(90deg,#3a2416 0 calc(var(--rw-h)*.06),#5a3a24 calc(var(--rw-h)*.06) calc(var(--rw-h)*.07),transparent calc(var(--rw-h)*.07) calc(var(--rw-h)*.144));filter:drop-shadow(0 4px 6px rgba(0,0,0,.6));will-change:transform}
.rw-puff{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(240,242,248,.85),rgba(210,214,226,.5) 55%,rgba(200,204,216,0) 72%);animation:rwPuff 1.3s ease-out forwards}
@keyframes rwSpin{to{transform:rotate(360deg)}}
@keyframes rwBob{to{transform:translateY(-2px)}}
@keyframes rwPuff{from{transform:translate(0,0) scale(.35);opacity:.95}to{transform:translate(calc(var(--rw-dx)*1px),calc(var(--rw-h)*-.8)) scale(2.4);opacity:0}}
`;
const engineSVG=(w,h,face)=>`<svg class="rw-engine ${face}" width="${w}" height="${h}" viewBox="0 0 110 78" aria-hidden="true"><defs><linearGradient id="rwBoiler" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".18" stop-color="#4a66b8"/><stop offset=".35" stop-color="#22397e"/><stop offset=".8" stop-color="#101c44"/><stop offset="1" stop-color="#050a1c"/></linearGradient><linearGradient id="rwCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a1344c"/><stop offset=".3" stop-color="#6b1d2e"/><stop offset="1" stop-color="#2c0a13"/></linearGradient><linearGradient id="rwBr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e7ae"/><stop offset=".35" stop-color="#9a7428"/><stop offset=".6" stop-color="#f3dc98"/><stop offset="1" stop-color="#7a5a1f"/></linearGradient><radialGradient id="rwLamp"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffd67a"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient></defs><path d="M23 14h14l-2 18H25Z" fill="url(#rwBoiler)"/><rect x="21" y="12" width="18" height="4" rx="1.5" fill="url(#rwBr)"/><rect x="8" y="30" width="66" height="28" rx="13" fill="url(#rwBoiler)"/><rect x="26" y="30" width="3" height="28" fill="url(#rwBr)"/><rect x="48" y="30" width="3" height="28" fill="url(#rwBr)"/><ellipse cx="44" cy="30" rx="7" ry="4" fill="url(#rwBr)"/><rect x="68" y="16" width="38" height="44" rx="5" fill="url(#rwCab)"/><rect x="64" y="12" width="46" height="6" rx="3" fill="#1c070d"/><rect x="75" y="22" width="24" height="15" rx="2" fill="#ffe3a0" stroke="url(#rwBr)" stroke-width="2"/><circle cx="5" cy="40" r="10" fill="url(#rwLamp)"/><circle cx="7" cy="40" r="4" fill="url(#rwBr)"/><path d="M8 54 L0 64 H16Z" fill="url(#rwBr)"/><g class="tw"><circle cx="26" cy="64" r="10" fill="#141418" stroke="url(#rwBr)" stroke-width="2.5"/><path d="M26 54v20M16 64h20M19 57l14 14M33 57 19 71" stroke="#8a6a26" stroke-width="1.5"/><circle cx="26" cy="64" r="2.5" fill="url(#rwBr)"/></g><g class="tw"><circle cx="52" cy="64" r="10" fill="#141418" stroke="url(#rwBr)" stroke-width="2.5"/><path d="M52 54v20M42 64h20M45 57l14 14M59 57 45 71" stroke="#8a6a26" stroke-width="1.5"/><circle cx="52" cy="64" r="2.5" fill="url(#rwBr)"/></g><g class="tw"><circle cx="88" cy="66" r="8" fill="#141418" stroke="url(#rwBr)" stroke-width="2.5"/><path d="M88 58v16M80 66h16" stroke="#8a6a26" stroke-width="1.5"/><circle cx="88" cy="66" r="2" fill="url(#rwBr)"/></g><rect x="24" y="62" width="30" height="3" rx="1.5" fill="url(#rwBr)"/></svg>`;
function frame(){
 /* Phones held upright draw the app on a rotated landscape canvas; run the train along that canvas. */
 const W=innerWidth,H=innerHeight;let rot=false;
 try{const fr=document.querySelector('#rwStage .rw-frame.active');const d=fr?.contentDocument||document;const shell=d.getElementById('landscape-shell');if(shell){const m=getComputedStyle(shell).transform;const v=m&&m!=='none'?m.match(/-?[\d.e]+/g).map(Number):null;rot=v?!!(Math.abs(v[0])<1e-3&&v[1]>0):H>W}}catch(e){}
 return rot?{w:H,h:W,rot:true,t:`translate(${W}px,0) rotate(90deg)`}:{w:W,h:H,rot:false,t:'none'};
}
function stage(){
 if(!document.getElementById('rw-style')){const st=document.createElement('style');st.id='rw-style';st.textContent=css;document.head.appendChild(st)}
 let s=document.getElementById('rwStage');if(!s){s=document.createElement('div');s.id='rwStage';document.body.appendChild(s)}
 return s;
}
/* ---- background loading ---- */
const preloads=new Map();
function makeFrame(href){
 const s=stage(),f=document.createElement('iframe');f.className='rw-frame pre';f.setAttribute('allow','fullscreen; microphone; camera; autoplay; clipboard-write; speaker-selection');f.setAttribute('title','READwy');
 f._ready=false;f.addEventListener('load',()=>{f._loaded=true});f.src=href;s.appendChild(f);return f;
}
function frameReady(f){
 if(!f._loaded)return false;
 try{const d=f.contentDocument;if(!d||d.readyState!=='complete')return false;const h=d.documentElement,b=d.body;if(!b||h.classList.contains('program-loading'))return false;
  if(parseFloat(f.contentWindow.getComputedStyle(b).opacity)<.95)return false;
  return [...d.images].every(i=>!i.src||i.complete||i.loading==='lazy')}catch(e){return true}
}
window.readwyTrainPreload=function(href){
 href=abs(href);if(preloads.has(href))return preloads.get(href);
 for(const [k,f] of preloads)if(!f._inUse){f.remove();preloads.delete(k)}
 const f=makeFrame(href);preloads.set(href,f);return f;
};
/* ---- the run ---- */
let busy=false,queued=null;
/* Train colours follow the destination program's UI. [car dark, car light, car mid, car base, trim, boiler x5] */
const RW_PAL={gst:['#20140a','#9c6a35','#6e4a22','#4f3416','#c9a24a','#0b2a18','#4fa36b','#21633b','#123a22','#06180d'],
 orst:['#2a1408','#c4783a','#93552a','#6b3a1c','#e0b25a','#0a1230','#4a66b8','#22397e','#101c44','#050a1c'],
 wst:['#0a1a3a','#5aa7e6','#2b6cc4','#1b4c96','#f4c542','#0a1230','#3a5fc0','#1d3c8c','#0e214e','#050a1c'],
 srst:['#0a1a3a','#5aa7e6','#2b6cc4','#1b4c96','#f4c542','#0a1230','#3a5fc0','#1d3c8c','#0e214e','#050a1c'],
 aral:['#1a0e06','#7a4a26','#5a3418','#3e2410','#c9a24a','#1a0e06','#6b4a30','#4a2c16','#2e1a0b','#120903'],
 interv:['#10204f','#6c8cf0','#3b5bd1','#2741a0','#ffd447','#062a2c','#38b8b0','#14807a','#0d4d4a','#041a1b'],
 sra:['#2a0a12','#a1344c','#7b2337','#5a1828','#c9a24a','#2a0a12','#8a3a4a','#5a1828','#3a0d18','#1c070d'],
 reports:['#082418','#3f9a66','#1f6b45','#134a30','#d9b45a','#1e1208','#8a5a2c','#5e3c1c','#3a2410','#140b04'],
 journey:['#0a2e1d','#3f9a66','#1d5c3d','#155236','#c9a14a','#06190f','#4fa36b','#1d5c3d','#0f3d27','#04120a']};
function rwPalette(href){let k='';try{const u=new URL(href,location.href);k=u.searchParams.get('journeyModule')||(u.searchParams.get('view')==='map'?'journey':'')}catch(e){}const p=RW_PAL[k];return p?{k,p}:null}
function buildTrain(layer,f,dir,label,href){
 const h=Math.round(Math.min(f.h*.2,f.w*.13)),eh=Math.round(h*1.18),ew=Math.round(eh*110/78),base=Math.round(f.h*.82);
 layer.style.setProperty('--rw-h',h+'px');
 const names=dir>0?['READwy','Express']:['Express','READwy'];
 const car=n=>`<div class="rw-car"><div class="rw-roof"></div><div class="rw-wins"><i></i><i></i><i></i></div><div class="rw-name">${n}</div><div class="rw-bogie a"><i></i><i></i></div><div class="rw-bogie b"><i></i><i></i></div></div>`;
 let eng=engineSVG(ew,eh,dir>0?'face-right':'face-left');
 const pal=rwPalette(href);
 if(pal){const p=pal.p;layer.dataset.pal=pal.k;[['--rw-c0',p[0]],['--rw-c1',p[1]],['--rw-c2',p[2]],['--rw-c3',p[3]],['--rw-tr',p[4]]].forEach(([n,v])=>layer.style.setProperty(n,v));
  eng=eng.replace('stop-color="#0a1230"','stop-color="'+p[5]+'"').replace('stop-color="#4a66b8"','stop-color="'+p[6]+'"').replace('stop-color="#22397e"','stop-color="'+p[7]+'"').replace('stop-color="#101c44"','stop-color="'+p[8]+'"').replace('stop-color="#050a1c"','stop-color="'+p[9]+'"').replace('stop-color="#a1344c"','stop-color="'+p[1]+'"').replace('stop-color="#6b1d2e"','stop-color="'+p[3]+'"').replace('stop-color="#2c0a13"','stop-color="'+p[0]+'"')}
 // forward: [coupler] cars ... engine(front, right)   return: engine(front, left) ... cars [coupler]
 const html=dir>0?`<i class="rw-coupler"></i>${names.map(car).join('')}${eng}`:`${eng}${names.map(car).join('')}<i class="rw-coupler"></i>`;
 layer.innerHTML=`<div class="rw-rail" style="top:${base-Math.round(h*.04)}px"></div><div class="rw-train" style="top:${base-eh}px;height:${eh}px">${html}</div>`;
 const train=layer.querySelector('.rw-train');return {train,len:train.scrollWidth,h,eh,ew,base,eng:train.querySelector('.rw-engine')};
}
window.readwyTrainGo=async function(href,label,opts={}){
 href=abs(href);
 if(busy){queued=[href,label,opts];return}
 const dir=opts.dir||(isJourney(href)?-1:1);
 if(reduce()){location.assign(href);return}
 busy=true;
 const s=stage();s.classList.add('on');
 const nf=window.readwyTrainPreload(href);nf._inUse=true;preloads.delete(href);
 const prev=s.querySelector('.rw-frame.active');
 const f=frame(),layer=document.createElement('div');layer.className='rw-train-layer';Object.assign(layer.style,{width:f.w+'px',height:f.h+'px',transform:f.t,transformOrigin:'0 0'});
 s.appendChild(layer);const T=buildTrain(layer,f,dir,label||labelOf(href),href);
 nf.classList.remove('pre');nf.classList.add('moving');nf.style.zIndex=2;layer.style.zIndex=3;
 const W=f.w,len=T.len,axis=f.rot?'Y':'X';
 // train position x = left edge of the train in frame coordinates
 const start=dir>0?-len:W,end=dir>0?W+30:-len-30,dist=Math.abs(end-start);
 const vmax=dist/1.55;let x=start,v=0,t0=performance.now(),last=t0,lastPuff=0,waitSince=0;
 const place=()=>{
  T.train.style.transform=`translate3d(${x}px,0,0)`;
  const tail=dir>0?x:x+len;                       // where the next page is hitched
  const off=dir>0?Math.min(0,tail-W):Math.max(0,tail); // page edge follows the tail, then rests at 0
  nf.style.transform=axis==='X'?`translate3d(${off}px,0,0)`:`translate3d(0,${off}px,0)`;
  return off};
 place();
 await new Promise(res=>{
  const step=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;
   const ready=frameReady(nf)||now-t0>4000;
   const tail=dir>0?x:x+len,hold=dir>0?-12:W+12,dToHold=dir>0?hold-tail:tail-hold;
   let target=vmax;if(!ready&&dToHold<vmax*.6)target=Math.max(0,dToHold*3.2);
   const accel=now-t0<350?2.6:7;v+=(target-v)*Math.min(1,dt*accel);
   x+=dir*v*dt;
   const off=place();
   try{nf.contentWindow.postMessage({rw:'moving'},'*')}catch(e){} // the arriving page waits (e.g. the ARAL train stays off-screen)
   if(now-lastPuff>95&&v>vmax*.15){lastPuff=now;const ex=dir>0?x+len-T.ew*.73:x+T.ew*.73,ey=T.base-T.eh*.86;if(ex>-T.h&&ex<W+T.h){const p=document.createElement('i');p.className='rw-puff';const sz=T.h*.32;p.style.setProperty('--rw-dx',String(-dir*T.h*.9));Object.assign(p.style,{left:ex-sz/2+'px',top:ey-sz/2+'px',width:sz+'px',height:sz+'px'});layer.appendChild(p);setTimeout(()=>p.remove(),1350)}}
   if(dir>0?x>=end:x<=end){res();return}
   requestAnimationFrame(step)};
  requestAnimationFrame(step)});
 // commit: the new page is now the live page
 nf.style.transform='none';nf.classList.remove('moving');nf.classList.add('active');try{nf.contentWindow.postMessage({rw:'arrived'},'*')}catch(e){}nf.style.zIndex=1;layer.remove();
 if(prev){prev.classList.remove('active');try{prev.src='about:blank'}catch(e){}setTimeout(()=>prev.remove(),50)}
 document.documentElement.classList.add('rw-hosted');
 try{document.querySelectorAll('body>audio,body>video').forEach(m=>m.pause());window.speechSynthesis?.cancel()}catch(e){}
 if(!opts.noPush)try{history.pushState({rw:href},'',href)}catch(e){}
 try{document.title=nf.contentDocument.title||document.title}catch(e){}
 s.classList.remove('on');try{nf.contentWindow.focus()}catch(e){}
 busy=false;
 if(queued){const q=queued;queued=null;window.readwyTrainGo(...q)}
};
addEventListener('popstate',()=>{const href=location.href;const cur=document.querySelector('#rwStage .rw-frame.active');if(!cur&&!document.documentElement.classList.contains('rw-hosted'))return;window.readwyTrainGo(href,'',{noPush:true})});
/* Journey ticket stops (this window): ride the train and preload on hover. */
addEventListener('click',e=>{const a=e.target.closest?.('a.stage');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();window.readwyTrainGo(a.href,(a.getAttribute('aria-label')||'').replace(/^\d+\.\s*/,''))},true);
const pre=e=>{const a=e.target.closest?.('a.stage');if(a)window.readwyTrainPreload(a.href)};
addEventListener('pointerover',pre,{passive:true});addEventListener('pointerdown',pre,{passive:true});addEventListener('touchstart',pre,{passive:true});
})();
/* END BLOCK:trainnav */
