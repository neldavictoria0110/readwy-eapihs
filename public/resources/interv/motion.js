/* Inkventure motion layer:
   1. Train-themed page transitions between the dashboard, stations, tasks and games.
   2. Living backdrops: the owl breathes, tilts its head, blinks, winks, talks and waves; lamps flicker, stars twinkle,
      light sweeps the glass roof, dust floats, banners sway, the clock ticks and the train rocks gently.
   3. Hover motion: the painted button under the pointer lifts and floats instead of glowing.
   Everything works in the artwork's own pixel space, so it stays aligned at every screen size. */
const IV_OWLS={"reading-adventure-dashboard-live":{"w":1672,"h":941,"head":[168,180,340,295],"pivot":[335,470],"eyes":[[287,342,31,31],[382,360,25,28]],"jaw":[300,374,70,54],"body":[60,180,520,700],"hand":[435,392,118,120],"wrist":[455,492],"lamps":[[25,140,40],[1333,240,34],[1640,120,40],[505,292,16]],"stars":[[545,195,30],[1130,195,30],[85,393,14],[1585,738,14]],"clock":[120,182,46],"banners":[[38,255,82,175,80,258]],"sky":[[560,40,560,110],[1200,230,120,70]],"lids":[{"top":"#e3bda7","bot":"#f7f0eb"},{"top":"#e0c3b0","bot":"#f2e0d6"}],"handMask":"resources/interv/anim/hand-reading-adventure-dashboard-live.png","handFill":"0.30"},"station-generic":{"w":1672,"h":941,"head":[158,165,290,290],"pivot":[300,455],"eyes":[[262,325,30,30],[356,342,25,28]],"jaw":[270,355,68,56],"body":[40,150,480,700],"hand":[398,380,120,130],"wrist":[422,478],"lamps":[[1555,135,36],[1375,215,22],[1240,220,18],[1290,235,16],[465,225,20],[290,130,20]],"stars":[[580,200,28],[1128,200,28],[86,350,14]],"sky":[[620,40,460,60],[1210,230,110,70]],"lids":[{"top":"#bc9281","bot":"#f3eae7"},{"top":"#d3b8aa","bot":"#f2dcd1"}],"handMask":"resources/interv/anim/hand-station-generic.png","handFill":"0.30"},"task-generic":{"w":1672,"h":941,"head":[125,245,290,275],"pivot":[270,515],"eyes":[[237,390,31,31],[333,417,25,27]],"jaw":[243,425,72,58],"body":[40,230,480,620],"hand":[418,436,94,100],"wrist":[440,520],"lamps":[[52,145,40],[432,210,20],[1578,125,36]],"stars":[[563,178,26],[1148,178,26],[153,707,12]],"sky":[[600,30,560,50],[1345,170,110,60]],"lids":[{"top":"#ddbeb0","bot":"#fcfbf9"},{"top":"#daaf9b","bot":"#f3dbcc"}],"handMask":"resources/interv/anim/hand-task-generic.png","handFill":"0.53"},"games-hub":{"w":764,"h":419,"head":[48,104,165,138],"pivot":[130,242],"eyes":[[97,182,16,16],[152,180,15,15]],"jaw":[111,193,42,30],"body":[10,100,240,319],"hand":[188,178,66,70],"wrist":[200,240],"lamps":[],"stars":[[290,110,9],[475,110,9]],"sky":[[260,50,420,40]],"lids":[{"top":"#cbaca2","bot":"#fdeddf"},{"top":"#b39a8f","bot":"#fbf3ed"}],"handMask":"resources/interv/anim/hand-games-hub.png","handFill":"0.45"},"game-word-puzzle":{"w":764,"h":419,"head":[18,126,160,132],"pivot":[100,262],"eyes":[[77,210,16,16],[127,208,15,15]],"jaw":[85,221,38,32],"body":[0,120,220,299],"hand":[153,226,54,56],"wrist":[160,276],"lamps":[],"stars":[[268,80,8]],"sky":[[400,60,250,30]],"lids":[{"top":"#b39c92","bot":"#fdf8f3"},{"top":"#82624c","bot":"#faecde"}],"handMask":"resources/interv/anim/hand-game-word-puzzle.png","handFill":"0.59"},"game-memory-match":{"w":764,"h":312,"head":[28,92,136,116],"pivot":[95,212],"eyes":[[92,167,15,15],[140,167,14,14]],"jaw":[101,178,32,24],"body":[0,90,200,222],"lamps":[],"stars":[[226,75,8]],"sky":[[520,40,200,40]],"lids":[{"top":"#ac978f","bot":"#fdf4eb"},{"top":"#a0857a","bot":"#fcf2e7"}]},"game-reading-race":{"w":764,"h":312,"head":[8,98,130,120],"pivot":[75,222],"eyes":[[70,167,15,15],[112,165,14,14]],"jaw":[81,178,32,24],"body":[0,95,190,217],"hand":[136,178,38,60],"wrist":[142,234],"lamps":[],"stars":[[224,80,8]],"sky":[[400,20,250,40]],"lids":[{"top":"#896855","bot":"#fdefe2"},{"top":"#977c6f","bot":"#edd5c7"}],"handMask":"resources/interv/anim/hand-game-reading-race.png","handFill":"0.56"},"game-word-spinner":{"w":764,"h":280,"head":[28,102,134,118],"pivot":[95,222],"eyes":[[88,172,14,14],[132,170,13,13]],"jaw":[98,181,32,22],"body":[10,100,190,180],"lamps":[],"stars":[[246,75,8]],"sky":[[480,40,250,30]],"lids":[{"top":"#9c8073","bot":"#fdf3ea"},{"top":"#805f49","bot":"#faefe7"}]},"game-challenge":{"w":764,"h":280,"head":[22,98,140,120],"pivot":[90,222],"eyes":[[77,165,15,15],[125,165,14,14]],"jaw":[88,178,32,24],"body":[5,95,190,185],"lamps":[],"stars":[[232,72,8]],"sky":[[480,40,250,30]],"lids":[{"top":"#8a6f61","bot":"#f9dec4"},{"top":"#967767","bot":"#f7e9e0"}]}};
IV_OWLS['station-fluency']=IV_OWLS['station-generic'];IV_OWLS['task-fluency']=IV_OWLS['task-generic'];
const IV_TRAINS={'reading-adventure-dashboard-live':[1345,185,327,390],'station-generic':[1350,165,322,400],'task-generic':[1335,185,337,385]};
IV_TRAINS['station-fluency']=IV_TRAINS['station-generic'];IV_TRAINS['task-fluency']=IV_TRAINS['task-generic'];
const ivReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion');
function ivHD(src){return String(src).replace(/\.png$/,'.hd.webp')}
function ivArtKey(src){return String(src).split('/').pop().replace(/\.(hd\.webp|png)$/,'')}
function ivPct(v,t){return (v/t*100).toFixed(3)+'%'}
/* background that shows exactly the artwork under a box (used by clones and hover lifts) */
function ivArtBg(el,img,box,W,H){const [x,y,w,h]=box;
 el.style.backgroundImage=`url("${img}")`;el.style.backgroundRepeat='no-repeat';
 el.style.backgroundSize=`${(W/w*100).toFixed(3)}% ${(H/h*100).toFixed(3)}%`;
 el.style.backgroundPosition=`${(w>=W?0:x/(W-w)*100).toFixed(3)}% ${(h>=H?0:y/(H-h)*100).toFixed(3)}%`}
function ivHitArt(btn,img,box,W,H){
 if(!btn||!img)return;const [x,y,w,h]=box,probe=document.createElement('i');ivArtBg(probe,img,box,W,H);
 btn.style.setProperty('--ivh-img',probe.style.backgroundImage);btn.style.setProperty('--ivh-size',probe.style.backgroundSize);btn.style.setProperty('--ivh-pos',probe.style.backgroundPosition);
 btn.classList.add('ivh');if(w*h<W*H*0.002)btn.classList.add('ivh-small')}

/* ---------- Living backdrop ---------- */
function ivDecorate(board,img,W,H){
 if(!board||board.querySelector('.iva'))return;
 const key=ivArtKey(img),O=IV_OWLS[key],hd=ivHD(img),layer=document.createElement('div');
 layer.className='iva';layer.setAttribute('aria-hidden','true');
 const place=(el,box,parent)=>{const [x,y,w,h]=box;let px=0,py=0,pw=W,ph=H;if(parent){[px,py,pw,ph]=parent}Object.assign(el.style,{left:ivPct(x-px,pw),top:ivPct(y-py,ph),width:ivPct(w,pw),height:ivPct(h,ph)});return el};
 const clone=(cls,box,parent)=>{const d=document.createElement('div');d.className='iva-clone '+cls;place(d,box,parent);ivArtBg(d,hd,box,W,H);return d};
 const origin=(el,box,pt)=>{el.style.transformOrigin=`${ivPct(pt[0]-box[0],box[2])} ${ivPct(pt[1]-box[1],box[3])}`};
 // ambient: light sweep over the glass roof and floating dust
 const sweep=document.createElement('div');sweep.className='iva-sweep';layer.append(sweep);
 for(let i=0;i<16;i++){const d=document.createElement('i');d.className='iva-dust';const s=(Math.random()*.35+.25).toFixed(2);Object.assign(d.style,{left:(Math.random()*100).toFixed(1)+'%',top:(40+Math.random()*60).toFixed(1)+'%','--s':s,animationDuration:(9+Math.random()*9).toFixed(1)+'s',animationDelay:(-Math.random()*16).toFixed(1)+'s'});layer.append(d)}
 if(O){
  for(const [x,y,r] of O.lamps||[]){const l=document.createElement('i');l.className='iva-lamp';place(l,[x-r*1.6,y-r*1.6,r*3.2,r*3.2]);l.style.animationDelay=(-Math.random()*4).toFixed(2)+'s';l.style.animationDuration=(2.6+Math.random()*2.4).toFixed(2)+'s';layer.append(l)}
  const glint=(x,y,r,delay)=>{const g=document.createElement('i');g.className='iva-glint';place(g,[x-r,y-r,r*2,r*2]);g.style.animationDelay=delay.toFixed(2)+'s';g.style.animationDuration=(3+Math.random()*3).toFixed(2)+'s';layer.append(g)};
  (O.stars||[]).forEach(([x,y,r],i)=>glint(x,y,r*1.4,i*.7));
  for(const [sx,sy,sw,sh] of O.sky||[])for(let i=0;i<4;i++)glint(sx+Math.random()*sw,sy+Math.random()*sh,(W>1000?9:4)+Math.random()*(W>1000?8:4),Math.random()*5);
  for(const [bx,by,bw,bh,ox,oy] of O.banners||[]){const b=clone('iva-banner',[bx,by,bw,bh]);origin(b,[bx,by,bw,bh],[ox,oy]);layer.append(b)}
  const tb=IV_TRAINS[key];if(tb){const t=clone('iva-train',tb);layer.append(t)}
  if(O.clock){const [cx,cy,r]=O.clock,c=document.createElement('div');c.className='iva-clock';place(c,[cx-r,cy-r,r*2,r*2]);c.innerHTML='<i class="iva-sec"></i><i class="iva-min"></i>';layer.append(c)}
  // owl: breathing body, tilting head with blinking eyes and a talking beak, waving wing
  const body=clone('iva-body',O.body);origin(body,O.body,[O.body[0]+O.body[2]/2,O.body[1]+O.body[3]]);layer.append(body);
  const head=clone('iva-head',O.head);origin(head,O.head,O.pivot);
  O.eyes.forEach(([cx,cy,rx,ry],i)=>{const eye=document.createElement('div');eye.className='iva-eye iva-eye'+i;place(eye,[cx-rx,cy-ry,rx*2,ry*2],O.head);
   const lid=document.createElement('i');lid.style.background=`linear-gradient(180deg,${O.lids[i].top} 0%,${O.lids[i].top} 35%,${O.lids[i].bot} 100%)`;eye.append(lid);head.append(eye)});
  const jb=O.jaw,mouth=document.createElement('i');mouth.className='iva-mouth';place(mouth,[jb[0]+jb[2]*.2,jb[1]+jb[3]*.12,jb[2]*.6,jb[3]*.5],O.head);head.append(mouth);
  const jaw=clone('iva-jaw',jb,O.head);ivArtBg(jaw,hd,jb,W,H);head.append(jaw);
  layer.append(head);
  if(O.hand&&O.handMask){const hand=clone('iva-hand',O.hand);hand.style.webkitMaskImage=hand.style.maskImage=`url("${O.handMask}")`;origin(hand,O.hand,O.wrist);layer.append(hand)}
 }
 const img0=board.querySelector(':scope>img');(img0?.nextSibling?board.insertBefore(layer,img0.nextSibling):board.prepend(layer));
 ivPreloadAll();
}
function ivOwlTalk(board,ms){const a=board?.querySelector?.('.iva');if(!a)return;a.classList.add('talk');clearTimeout(a._talk);a._talk=setTimeout(()=>a.classList.remove('talk'),Math.max(700,Math.min(4200,ms||1500)))}
let ivPreloaded=false;
function ivPreloadAll(){if(ivPreloaded)return;ivPreloaded=true;const list=['pages/task-generic','reading-adventure-dashboard-live'];
 const go=()=>list.forEach(n=>{const i=new Image();i.decoding='async';i.src='resources/interv/'+n+'.hd.webp'});if(window.requestIdleCallback)requestIdleCallback(go,{timeout:3000});else setTimeout(go,1200)}

/* ---------- Train transition: one short pass of a small train over a crossfade ----------
   The new page is drawn at once underneath; the previous page stays on top (already decoded, so no blank frame)
   and fades out as soon as the new artwork is ready while a small Inkventure train runs along the platform.
   Forward moves run left -> right; going back (to stations or home) runs right -> left with the engine facing left.
   Only transform and opacity are animated, so it stays smooth on slower computers. */
const IV_ENGINE=`<svg class="ivt-engine" viewBox="0 0 150 86" aria-hidden="true"><defs><linearGradient id="ivtB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1e4d"/><stop offset=".2" stop-color="#4b74d1"/><stop offset=".42" stop-color="#2148a3"/><stop offset=".85" stop-color="#0f2560"/><stop offset="1" stop-color="#071433"/></linearGradient><linearGradient id="ivtG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".4" stop-color="#d9a441"/><stop offset=".65" stop-color="#ffe08a"/><stop offset="1" stop-color="#9a6b1c"/></linearGradient><radialGradient id="ivtL"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffd67a"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient></defs>
<rect x="4" y="14" width="44" height="50" rx="6" fill="url(#ivtB)" stroke="url(#ivtG)" stroke-width="2.5"/><rect x="0" y="9" width="52" height="8" rx="4" fill="#0a173d" stroke="url(#ivtG)" stroke-width="1.5"/><rect x="12" y="22" width="28" height="17" rx="3" fill="#ffe3a0" stroke="url(#ivtG)" stroke-width="2"/>
<rect x="44" y="34" width="86" height="32" rx="15" fill="url(#ivtB)"/><rect x="66" y="34" width="4" height="32" fill="url(#ivtG)"/><rect x="92" y="34" width="4" height="32" fill="url(#ivtG)"/><rect x="116" y="34" width="3" height="32" fill="url(#ivtG)"/>
<path d="M104 12h16l-3 23h-10Z" fill="url(#ivtB)" stroke="url(#ivtG)" stroke-width="1.5"/><rect x="101" y="8" width="22" height="6" rx="2" fill="url(#ivtG)"/><ellipse cx="82" cy="34" rx="8" ry="4.5" fill="url(#ivtG)"/>
<circle cx="140" cy="46" r="13" fill="url(#ivtL)"/><circle cx="136" cy="46" r="5" fill="url(#ivtG)"/><path d="M128 62 L148 74 H122Z" fill="url(#ivtG)"/><text x="88" y="56" font-family="Georgia,serif" font-weight="700" font-size="9" fill="#ffe08a" text-anchor="middle">Inkventure</text>
<g class="ivt-w"><circle cx="26" cy="72" r="11" fill="#0c0f1e" stroke="url(#ivtG)" stroke-width="2.5"/><path d="M26 61v22M15 72h22M18 64l16 16M34 64 18 80" stroke="#c99a3a" stroke-width="1.6"/></g><g class="ivt-w"><circle cx="70" cy="72" r="11" fill="#0c0f1e" stroke="url(#ivtG)" stroke-width="2.5"/><path d="M70 61v22M59 72h22M62 64l16 16M78 64 62 80" stroke="#c99a3a" stroke-width="1.6"/></g><g class="ivt-w"><circle cx="100" cy="74" r="9" fill="#0c0f1e" stroke="url(#ivtG)" stroke-width="2.5"/><path d="M100 65v18M91 74h18" stroke="#c99a3a" stroke-width="1.6"/></g><g class="ivt-w"><circle cx="122" cy="74" r="9" fill="#0c0f1e" stroke="url(#ivtG)" stroke-width="2.5"/><path d="M122 65v18M113 74h18" stroke="#c99a3a" stroke-width="1.6"/></g><rect x="22" y="70" width="52" height="4" rx="2" fill="url(#ivtG)"/></svg>`;
const ivEscT=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let ivLevelNow=0,ivTransitTok=0;
/* Departure-board flip. Every Inkventure page shares one painted hall, so only the changing parts move:
   the old board flips away the moment a button is tapped, the new board flips in like a railway departure
   board, and the title, plaques and owl's words fade to their new text. Forward flips down; going back flips up.
   Only transform and opacity are animated. (The big train is kept for opening each learning program.) */
const IV_ROLL_MS=900;
/* Rolled-ticket transition: the next page is built first, underneath. The current activity frame then rolls up
   onto a paper roll that forms at its left edge and travels to the right, uncovering the next page's frame as it
   goes. Nothing behind the frame (painted board, glow) is ever shown. */
function ivArtReady(screen,timeout=1200){const img=screen?.querySelector('.ivp-board>img,.ivd-board>img');if(!img)return Promise.resolve();
 const done=img.complete&&img.naturalWidth?(img.decode?img.decode().catch(()=>{}):Promise.resolve()):new Promise(r=>{img.addEventListener('load',()=>r(),{once:true});img.addEventListener('error',()=>r(),{once:true})});
 return Promise.race([done,new Promise(r=>setTimeout(r,timeout))])}
const IV_ROLL_SEL='.ivx,.ivp-gpanel,.ivp-panel,.ivp-legacy';
// Position in #app's own (unscaled) pixels: the landscape shell scales the whole app to fit the window.
function ivRollRect(el){if(!el)return null;const a=app.getBoundingClientRect(),r=el.getBoundingClientRect(),kx=a.width?app.offsetWidth/a.width:1,ky=a.height?app.offsetHeight/a.height:1;return {x:(r.left-a.left)*kx+app.scrollLeft,y:(r.top-a.top)*ky+app.scrollTop,w:r.width*kx,h:r.height*ky}}
function ivRollEl(){const roll=document.createElement('div');roll.className='ivt6-roll';roll.setAttribute('aria-hidden','true');
 roll.innerHTML='<div class="ivt6-body"><div class="ivt6-skin"></div><div class="ivt6-shade"></div></div><i class="ivt6-end t"></i><i class="ivt6-end b"></i>';app.append(roll);
 const turn=roll.querySelector('.ivt6-skin').animate([{transform:'translateX(0)'},{transform:'translateX(-50%)'}],{duration:700,iterations:Infinity});return {roll,turn}}
function ivTransit(render,label,level){
 ivLevelNow=level;
 const old=app.querySelector(':scope>.ivd-screen:not(.ivt2-old)');
 if(ivReduced()||!old){render();return}
 const tok=++ivTransitTok;
 app.querySelectorAll(':scope>.ivt2-old,:scope>.ivt6-roll').forEach(e=>e.remove());
 // The visible frame of the current page (the topmost one: a panel over the board wins).
 const frames=[...old.querySelectorAll(IV_ROLL_SEL)].filter(e=>e.offsetWidth);const oldFrame=frames[frames.length-1];
 old.inert=true;render();
 const fresh=app.querySelector(':scope>.ivd-screen:not(.ivt2-old):not([inert])');
 if(!fresh||fresh===old||!oldFrame){old.remove();return}
 // Keep only the old frame on top of the new page; everything else of the old page is identical, so hide it.
 old.classList.add('ivt2-old','ivt7-old');old.setAttribute('aria-hidden','true');app.append(old);
 oldFrame.classList.add('ivt7-keep');
 const r=ivRollRect(oldFrame),{roll,turn}=ivRollEl(),_tone=roll.style.setProperty('--ivc',(getComputedStyle(fresh).getPropertyValue('--ivc')||'#173f95').trim()),D0=Math.max(10,r.h*.03),D1=Math.max(30,r.h*.14),t0=performance.now();
 const step=now=>{if(tok!==ivTransitTok){roll.remove();old.remove();return}
  const t=Math.min(1,(now-t0)/IV_ROLL_MS),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,x=r.x+r.w*e,d=D0+(D1-D0)*e;
  Object.assign(roll.style,{left:(x-d/2)+'px',top:(r.y-r.h*.012)+'px',width:d+'px',height:(r.h*1.024)+'px',opacity:t>.9?String((1-t)/.1):'1'});
  oldFrame.style.clipPath=`inset(-2% -2% -2% ${(e*100).toFixed(2)}%)`;
  if(t<1)requestAnimationFrame(step);else{turn.cancel();roll.remove();old.remove()}};
 requestAnimationFrame(step);
}
/* Route every Inkventure page change through the train. Level decides the direction (lower level = going back). */
(function(){
 const wrap=(name,label,level)=>{const raw=globalThis[name];if(typeof raw!=='function'||raw._ivt)return;const f=function(...a){return ivTransit(()=>raw.apply(this,a),label(...a),level)};f._ivt=true;globalThis[name]=f};
 const stName=k=>(typeof IV_ST!=='undefined'&&IV_ST[k]?.name)||'Reading Station';
 wrap('renderInterDashboard',()=>'Inkventure Station',0);
 wrap('renderStation',(k,m)=>stName(k)+(m==='games'?' Games':''),1);
 wrap('renderTask',(k,t)=>`${stName(k)} · Task ${t}`,2);
 wrap('renderLegacyGame',(k)=>stName(k)+' Games',2);
 wrap('renderIntervGames',()=>'Inkventure Games',1.5);
 wrap('ivRenderProgress',()=>'My Progress',0.5);
 wrap('ivRenderRewards',()=>'My Rewards',0.5);
 wrap('ivRenderProfile',()=>'My Profile',0.5);
 wrap('ivRenderSettings',()=>'Settings',0.5);
 [['renderIvWordPuzzle','Word Puzzle'],['renderIvMemory','Memory Match'],['renderIvReadingRace','Reading Race'],['renderIvSpinner','Word Spinner'],['renderIvChallenge','Challenge Game']].forEach(([n,l])=>wrap(n,()=>l,2));
})();
