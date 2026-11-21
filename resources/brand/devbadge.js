/* READwy monogram badge (lower right of every page). Its colours follow the screen it sits on.
   Tap it 5 times, then enter the developer code, to open the Developer view (no sign-in needed).
   This is a convenience for testing, not security: anyone who reads the page source can find the check. */
(()=>{if(window.top!==window||window.__readwyBadge)return;window.__readwyBadge=1;
const LOGO='resources/brand/',STORE='READwy_new_2026_local_',DEVKEY='readwy-dev-view';
const CODE_HASH=1420959262; // hash of the developer code
const hash=s=>{let h=0;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))|0;return h>>>0};
/* ---------- colour of the screen underneath ---------- */
const MOD={interv:[30,91,184],sra:[34,70,150],wst:[29,52,102],srst:[29,52,102],reports:[30,107,60],gst:[124,58,160],orst:[176,74,36],aral:[200,120,20],train:[29,110,61],map:[29,110,61],launch:[29,110,61]};
const parse=s=>{const m=String(s).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);return m?[+m[1],+m[2],+m[3],m[4]==null?1:+m[4]]:null};
const hsl=([r,g,b])=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;const s=d?d/(1-Math.abs(2*l-1)):0;let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return [h,s,l]};
function colourAt(doc,x,y,depth=0){let els;try{els=doc.elementsFromPoint(x,y)}catch(e){return null}
 for(const el of els){if(el.id==='rwBadge'||el.closest?.('#rwBadge,#rwDev'))continue;
  if(el.tagName==='IFRAME'&&depth<2){try{const r=el.getBoundingClientRect(),kk=r.width/(el.clientWidth||r.width),c=colourAt(el.contentDocument,(x-r.left)/kk,(y-r.top)/kk,depth+1);if(c)return c}catch(e){}}
  const cs=(el.ownerDocument.defaultView||window).getComputedStyle(el);const cands=[parse(cs.backgroundColor),...(cs.backgroundImage.match(/rgba?\([^)]+\)/g)||[]).map(parse)];
  for(const c of cands){if(!c||c[3]<.45)continue;const [,s,l]=hsl(c);if(s>.22&&l>.12&&l<.78)return c.slice(0,3)}}
 return null}
function moduleNow(){const q=new URLSearchParams(location.search);let m=q.get('journeyModule')||q.get('view')||'';
 try{if(typeof activeModule!=='undefined'&&activeModule&&typeof page!=='undefined'&&page!=='map')m=activeModule}catch(e){}
 if(document.querySelector('.sra-express-frame'))m='sra';if(document.querySelector('.wst-express-frame'))m='wst';if(document.querySelector('.post-express-frame'))m='reports';return m||'train'}
function theme(){const mod=moduleNow();if(['sra','wst','srst','reports','interv','train','map','launch'].includes(mod)&&MOD[mod])return MOD[mod];const W=innerWidth,H=innerHeight,pts=[[.5,.03],[.2,.04],[.8,.04],[.5,.97],[.04,.5],[.96,.3]];const found=[];
 for(const [px,py] of pts){const c=colourAt(document,W*px,H*py);if(c)found.push(c)}
 if(found.length){// most common hue family wins
  const bins={};found.forEach(c=>{const k=Math.round(hsl(c)[0]/30);(bins[k]=bins[k]||[]).push(c)});const best=Object.values(bins).sort((a,b)=>b.length-a.length)[0];return best[0]}
 return MOD[moduleNow()]||[200,160,90]}
const mix=(c,t,a)=>c.map((v,i)=>Math.round(v+(t[i]-v)*a));
const fromHsl=(h,s,l)=>{const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return [f(0),f(8),f(4)].map(v=>Math.round(v*255))};
const shade=(c,l,smin)=>{const [h,s]=hsl(c);return fromHsl(h,Math.max(s,smin),l)};const css=c=>`rgb(${c.join(',')})`;
/* ---------- the badge ---------- */
const st=document.createElement('style');st.textContent=`
#rwBadge{position:fixed;z-index:2147483000;width:44px;height:44px;border-radius:50%;border:2px solid var(--rwL,#e9d19a);padding:0;cursor:pointer;background:var(--rwD,#151515);box-shadow:0 3px 10px #0007,0 0 0 1px #0004;opacity:.92;transition:transform .15s,opacity .2s,background .6s,border-color .6s;-webkit-tap-highlight-color:transparent}
#rwBadge:hover{opacity:1;transform:scale(1.08)}#rwBadge.tap{animation:rwTap .25s ease}@keyframes rwTap{50%{transform:scale(.86)}}
#rwBadge i{position:absolute;inset:3px;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;transition:background .6s}
#rwBadge .g{--m:url(${LOGO}logo-gold.png);background:var(--rwL,#c9a76a)}#rwBadge .w{--m:url(${LOGO}logo-white.png);background:#fffaf0}
#rwDev{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;background:#0008;font:500 16px system-ui,"Segoe UI",sans-serif;color:#1a1a1a}
#rwDev .p{width:min(94vw,640px);max-height:92vh;overflow:auto;border-radius:20px;background:#fffdf7;box-shadow:0 20px 60px #000a;border:3px solid var(--rwL)}
#rwDev header{display:flex;align-items:center;gap:12px;padding:14px 20px;background:var(--rwD);color:#fff;font:800 20px Georgia,serif}
#rwDev header i{width:40px;height:40px;flex:none;border-radius:50%;background:#111 url(${LOGO}logo-original.png) center/cover;border:2px solid var(--rwL)}
#rwDev header button{margin-left:auto;border:2px solid var(--rwL);background:#fff2;color:#fff;border-radius:99px;padding:4px 14px;font:700 14px system-ui;cursor:pointer}
#rwDev .b{padding:16px 22px}#rwDev .warn{background:#fff4d6;border:1px solid #e3c271;border-radius:10px;padding:8px 12px;font-size:14px;margin-bottom:12px}
#rwDev label{display:flex;flex-direction:column;gap:4px;font:700 13px system-ui;letter-spacing:.04em;color:#555}
#rwDev input,#rwDev select{font:600 17px system-ui;padding:9px 12px;border:2px solid #d6c79f;border-radius:10px;background:#fff;color:#1a1a1a}
#rwDev .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}#rwDev .grid .full{grid-column:1/-1}
#rwDev h4{margin:14px 0 6px;font:800 15px system-ui;letter-spacing:.06em;color:var(--rwD)}
#rwDev .go{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:6px}
#rwDev .go button,#rwDev .act button{padding:8px 8px;border-radius:10px;border:2px solid var(--rwD);background:#fff;color:var(--rwD);font:800 14px system-ui;cursor:pointer}
#rwDev .go button:hover{background:var(--rwD);color:#fff}
#rwDev .act{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}#rwDev .act .red{border-color:#b3261e;color:#b3261e}
#rwDev .code{font:700 18px ui-monospace,monospace;letter-spacing:.3em;text-align:center;width:100%;padding:7px 10px}
#rwDev.small .p{width:min(88vw,330px)}#rwDev.small header{padding:9px 14px;font-size:15px;gap:8px}#rwDev.small header i{width:28px;height:28px}#rwDev.small header button{font-size:12px;padding:2px 10px}#rwDev.small .b{padding:12px 14px;font-size:14px}#rwDev.small .act button{padding:7px 12px;font-size:13px}#rwDev.small .msg{font-size:13px;min-height:1.2em;margin-top:4px}
#rwDev .scr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}#rwDev .scr button{padding:7px 8px;border-radius:9px;border:1.5px solid var(--rwD);background:#fff;color:var(--rwD);font:700 13px system-ui;cursor:pointer;text-align:left}#rwDev .scr button:hover{background:var(--rwD);color:#fff}
#rwDev .msg{min-height:1.4em;margin-top:8px;font-weight:700;color:#b3261e;text-align:center}
#rwDev .shake{animation:rwShake .35s}@keyframes rwShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
document.head.appendChild(st);
const btn=document.createElement('button');btn.id='rwBadge';btn.type='button';btn.setAttribute('aria-label','READwy');
btn.innerHTML='<i class="g"></i><i class="w"></i>';
const mount=()=>{if(!document.body)return setTimeout(mount,50);if(!btn.isConnected)document.body.appendChild(btn);paint()};
/* The badge sits in whichever corner is free: no buttons, fields or text under it. It stays put while its corner
   stays free, so it does not jump around; if every corner is busy it waits just above the controls in the lower right. */
let corner='br';
function busyIn(B,H){let lift=0,hit=false;
 const scan=(doc,ox,oy,depth,k=1)=>{let list;try{list=doc.querySelectorAll('button,a[href],input,select,textarea,[role=button],[onclick],.hit,.opt,.tab,h1,h2,h3,p,label,li,td,th,.chip,.clock,.lbl,iframe')}catch(e){return}
  for(const el of list){if(el.id==='rwBadge'||el.closest('#rwBadge,#rwDev'))continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
   const L=r.left*k+ox,T=r.top*k+oy,R=r.right*k+ox,Bm=r.bottom*k+oy;if(!(L<B.r&&R>B.l&&T<B.b&&Bm>B.t))continue;
   if(el.tagName==='IFRAME'){if(depth<2){try{const kk=k*(r.width/(el.clientWidth||r.width));scan(el.contentDocument,L+el.clientLeft*kk,T+el.clientTop*kk,depth+1,kk)}catch(e){}}continue}
   if((R-L)*(Bm-T)>innerWidth*innerHeight*.35)continue; // large containers do not count
   const cs=(doc.defaultView||window).getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)continue;
   hit=true;if(T>H*.4)lift=Math.max(lift,H-T+8)}};
 scan(document,0,0,0);return {hit,lift}}
function place(){const W=innerWidth,H=innerHeight,m=6,s=58;
 const box={br:{l:W-s-m,r:W-m,t:H-s-m,b:H-m},bl:{l:m,r:s+m,t:H-s-m,b:H-m},tr:{l:W-s-m,r:W-m,t:m,b:s+m},tl:{l:m,r:s+m,t:m,b:s+m}};
 let pick=null,lift=0;for(const c of [corner,'br','bl','tr','tl']){const b=busyIn(box[c],H);if(!b.hit){pick=c;break}if(c==='br')lift=b.lift}
 if(!pick){pick='br'}else lift=0;corner=pick;
 const S=btn.style;S.left=S.right=S.top=S.bottom='';const g='max(10px,env(safe-area-inset-%s))';
 if(pick[1]==='r')S.right=g.replace('%s','right');else S.left=g.replace('%s','left');
 if(pick[0]==='b')S.bottom=lift?lift+'px':g.replace('%s','bottom');else S.top=g.replace('%s','top')}
/* Exact colours for each learning-journey screen: [badge fill, rim + logo], taken from that screen's own
   palette, so the badge looks like part of the UI instead of guessing from the pixels around it. */
const has=(sel,doc=document)=>{try{return !!doc.querySelector(sel)}catch(e){return false}};
function frameDoc(sel){try{return document.querySelector(sel)?.contentDocument||null}catch(e){return null}}
function screenTheme(){
 if(has('#rwDev'))return null;
 if(has('.teacher-portal'))return [[31,75,45],[224,184,77]];               // teacher portal: green rail, gold
 if(has('.hd-sum'))return [[13,31,69],[227,189,113]];                      // assessment summary: navy, gold
 if(has('.xc,.xo'))return [[122,28,30],[242,201,76]];                      // ORST TV carriage: train red, brass
 if(has('.xg,.gst-book-screen'))return [[18,69,48],[243,220,152]];         // GST book: forest green, gold leaf
 if(has('.wst-express-frame'))return [[11,35,71],[217,174,85]];            // WST: navy toolbar, gold
 if(has('.journey,.pf-dest,.stage'))return [[15,58,39],[201,161,74]];      // journey ticket / map: ticket green, gold
 const mod=moduleNow();
 if(mod==='map')return [[15,58,39],[201,161,74]];
 if(['train','launch','startup',''].includes(mod))return [[22,74,48],[233,196,106]]; // station start & login
 return null}
function paint(){place();const fixed=screenTheme();const c=theme(),D=fixed?fixed[0]:shade(c,.22,.55),L=fixed?fixed[1]:shade(c,.74,.6);[btn,dlgRoot].forEach(e=>{if(!e)return;e.style.setProperty('--rwD',css(D));e.style.setProperty('--rwL',css(L))})}let taps=0,tT=0,dlgRoot=null;
btn.onclick=e=>{e.stopPropagation();btn.classList.remove('tap');void btn.offsetWidth;btn.classList.add('tap');clearTimeout(tT);taps++;
 if(taps>=5){taps=0;sessionStorage.getItem(DEVKEY)==='1'?panel():askCode();return}
 tT=setTimeout(()=>{taps=0},1500)};
function dialog(title,html,small){close();dlgRoot=document.createElement('div');dlgRoot.id='rwDev';if(small)dlgRoot.className='small';dlgRoot.innerHTML=`<div class="p" role="dialog" aria-modal="true" aria-label="${title}"><header><i></i><span>${title}</span><button type="button" data-x>✕ Close</button></header><div class="b">${html}</div></div>`;
 document.body.appendChild(dlgRoot);paint();dlgRoot.querySelector('[data-x]').onclick=close;dlgRoot.onclick=e=>{if(e.target===dlgRoot)close()};return dlgRoot}
function close(){if(dlgRoot){dlgRoot.remove();dlgRoot=null}}
addEventListener('keydown',e=>{if(e.key==='Escape')close()});
function askCode(){const d=dialog('Access',`<p style="margin:0 0 8px">Enter the access code.</p><input class="code" inputmode="numeric" maxlength="6" autocomplete="off" aria-label="Developer code"><div class="msg" role="alert"></div><div class="act" style="justify-content:center;margin-top:10px"><button type="button" data-ok style="background:var(--rwD);color:#fff;border-color:var(--rwD)">Open</button></div>`,true);
 const inp=d.querySelector('input'),msg=d.querySelector('.msg'),p=d.querySelector('.p');inp.focus();
 const ok=()=>{if(hash(inp.value.trim())===CODE_HASH){sessionStorage.setItem(DEVKEY,'1');devFrames(true);paint();panel()}else{msg.textContent='Wrong code.';p.classList.remove('shake');void p.offsetWidth;p.classList.add('shake');inp.select()}};
 d.querySelector('[data-ok]').onclick=ok;inp.onkeydown=e=>{if(e.key==='Enter')ok()}}
/* ---------- developer view ---------- */
const read=k=>{try{return JSON.parse(localStorage.getItem(STORE+k))}catch(e){return null}};
const write=(k,v)=>{try{localStorage.setItem(STORE+k,JSON.stringify(v))}catch(e){}};
function developerIdentity(role,grade=7){
 const user=role==='teacher'
  ?{id:'readwy-dev-teacher',role:'teacher',dev:true,name:'Developer Teacher',firstName:'Developer',grade:7,sections:[{grade:7,section:'A'}],learningArea:'English',email:'developer.teacher@readwy.local'}
  :{role:'student',dev:true,name:'Developer',firstName:'Developer',grade,section:'A',gender:'female',email:'developer@readwy.local',lrn:'000000000000'};
 write('user',user);
 if(role==='student'){const profiles=read('studentProfiles')||{};profiles[user.email]=user;write('studentProfiles',profiles)}
 try{localStorage.setItem('readwySelectedRole',role)}catch(e){}
 return {uid:`readwy-dev-${role}`,email:user.email,displayName:user.name,emailVerified:true,providerData:[]};
}
window.readwyOpenDeveloperTeacherPreview=function(sessionOnly=false){
 if(sessionOnly){
  try{sessionStorage.setItem('READWY_startup_teacher_preview','1')}
  catch(error){window.alert('The teacher preview could not open because this browser session cannot store its temporary state.');return}
 }else developerIdentity('teacher');
 try{sessionStorage.removeItem('READwy_current_view_v1')}catch(e){}
 location.href='index.html?view=teacher-preview';
};
function enterDeveloperAuth(){
 if(sessionStorage.getItem(DEVKEY)!=='1'||typeof readwyAuthenticated!=='function')return false;
 let role=typeof readwyRole!=='undefined'?readwyRole:'';
 if(role!=='student'&&role!=='teacher'){try{role=localStorage.getItem('readwySelectedRole')||''}catch(e){}}
 if(role!=='student'&&role!=='teacher')role='student';
 const user=developerIdentity(role,7);
 if(typeof mode!=='undefined'&&mode==='role'&&typeof chooseReadwyRole==='function'){
  readwyAuthenticated(user);
  chooseReadwyRole(role);
  return true;
 }
 if((typeof readwyRole==='undefined'||!readwyRole)&&typeof applyReadwyRole==='function')applyReadwyRole(role);
 readwyAuthenticated(user);
 return true;
}
/* Developer mode skips signing IN only. CREATE ACCOUNT always creates a real account, otherwise the
   page looks signed up while no account exists and the later sign-in fails ("email or password is incorrect"). */
function interceptDeveloperAuth(event){
 if(sessionStorage.getItem(DEVKEY)!=='1'||typeof readwyAuthenticated!=='function')return;
 const target=event.target instanceof Element?event.target.closest('#login button.primary,.social-login button,.forgot-password,#readwyLinkSend'):null;
 if(!target)return;
 event.preventDefault();event.stopImmediatePropagation();enterDeveloperAuth();
}
document.addEventListener('click',interceptDeveloperAuth,true);
document.addEventListener('submit',event=>{
 if(sessionStorage.getItem(DEVKEY)!=='1'||typeof readwyAuthenticated!=='function')return;
 if(!event.target.matches('#login,#readwyEmailLinkForm'))return;
 event.preventDefault();event.stopImmediatePropagation();enterDeveloperAuth();
},true);
document.addEventListener('keydown',event=>{
 if(event.key!=='Enter'||sessionStorage.getItem(DEVKEY)!=='1'||typeof readwyAuthenticated!=='function')return;
 const input=event.target instanceof Element?event.target.closest('#login input,#readwyEmailLinkForm input'):null;
 if(!input)return;
 event.preventDefault();event.stopImmediatePropagation();enterDeveloperAuth();
},true);
/* what each grade level has: Grades 7-10 take every assessment; Grades 11-12 start with InterV and SRA only */
const PROG=[['Journey map','index.html?view=map'],['GST','index.html?journeyModule=gst'],['ORST','index.html?journeyModule=orst'],['WST','index.html?journeyModule=wst'],['ARAL','index.html?journeyModule=aral'],['InterV','index.html?journeyModule=interv'],['SRA','index.html?journeyModule=sra'],['Post-Test','index.html?journeyModule=reports']];
const BY_GRADE=g=>g>=11?PROG.filter(p=>['Journey map','InterV','SRA'].includes(p[0])):PROG;
/* screens of the program that is open now (each program lists its own), so any screen can be inspected directly */
let SCR=[];
function devFrames(on){document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.DEV=on}catch(e){}})}
function screensHTML(){SCR=[];let title='';devFrames(true);
 for(const [sel,name] of [['.sra-express-frame','SRA'],['.wst-express-frame','WST'],['.post-express-frame','Post-Test']]){const f=document.querySelector(sel);try{if(f&&f.contentWindow.readwyDevScreens){SCR=f.contentWindow.readwyDevScreens();title=name}}catch(e){}}
 if(!SCR.length){try{const m=typeof activeModule!=='undefined'?activeModule:'';
  if(m==='orst'&&typeof ORST_NEW_STAGES!=='undefined'){title='ORST';SCR=ORST_NEW_STAGES.map((s,i)=>[`Stage ${i+1} · ${s[1]}`,()=>{orstNew.stage=i+1;renderORSTNew()}])}
  else if(m==='gst'&&typeof gstBook!=='undefined'){title='GST';const n=GST_BOOK_DATA[String(selectedGrade)].questions.length;SCR=[['Cover',-1],['Question 1',0],['Question 10',9],['Question 20',19],['Question 30',29],[`Question ${n}`,n-1],['End of test',n]].map(([t,i])=>[t,()=>{gstBook.index=i;renderGSTBookSpread()}])}}catch(e){}}
 return SCR.length?`<h4>SCREENS IN ${title.toUpperCase()}</h4><div class="scr">${SCR.map((s,i)=>`<button type="button" data-scr="${i}">${s[0]}</button>`).join('')}</div>`:''}function panel(){
 const d=dialog('Developer view',`<div class="warn">⚠️ <b>Not signed in.</b> No locks: every page opens, and nothing has to be answered or submitted.</div>
 ${screensHTML()}
 <h4>STARTUP AND SIGN-IN</h4><div class="go"><button type="button" data-v="startup">Startup</button><button type="button" data-v="login">Login</button><button type="button" data-v="signup">Sign up</button><button type="button" data-v="teacher">Teacher view</button></div>
 ${[7,8,9,10,11,12].map(g=>`<h4>GRADE ${g}${g>=11?' · InterV and SRA only':''}</h4><div class="go">${BY_GRADE(g).map(([t])=>`<button type="button" data-g="${g}" data-p="${t}">${t}</button>`).join('')}</div>`).join('')}
 <div class="act"><button type="button" class="red" data-erase>🗑️ Erase all test progress</button><button type="button" data-exit>Exit developer view</button></div><div class="msg"></div>`);
 const learner=g=>developerIdentity('student',g);
 d.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const g=+b.dataset.g;learner(g);location.href=PROG.find(p=>p[0]===b.dataset.p)[1]});
 d.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=b.dataset.v;
  if(v==='startup'){location.href='index.html?view=startup';return}
  if(v==='teacher'){window.readwyOpenDeveloperTeacherPreview();return}
  try{sessionStorage.setItem('readwy-dev-goto',v)}catch(e){}location.href='index.html?view=train'});
 d.querySelectorAll('[data-scr]').forEach(b=>b.onclick=()=>{const it=SCR[+b.dataset.scr];close();try{it[1]()}catch(e){alert('This screen could not open: '+e.message)}});
 d.querySelector('[data-erase]').onclick=()=>{if(!confirm('Erase ALL saved READwy progress in this browser (every learner)? This cannot be undone.'))return;
  const keep=new Set([STORE+'user',STORE+'studentProfiles']);Object.keys(localStorage).filter(k=>/^(READwy|readwy|sra-|wst-|post-)/.test(k)&&!keep.has(k)).forEach(k=>localStorage.removeItem(k));
  Object.keys(sessionStorage).filter(k=>k!==DEVKEY).forEach(k=>sessionStorage.removeItem(k));d.querySelector('.msg').style.color='#1e6b3c';d.querySelector('.msg').textContent='All test progress was erased.'};
 d.querySelector('[data-exit]').onclick=()=>{sessionStorage.removeItem(DEVKEY);const u2=read('user');if(u2&&u2.dev){try{localStorage.removeItem(STORE+'user')}catch(e){}}close();paint();location.href='index.html?view=startup'}}
/* on the login page, open the Login or Sign-up card the developer asked for */
(()=>{let v='';try{v=sessionStorage.getItem('readwy-dev-goto')||'';sessionStorage.removeItem('readwy-dev-goto')}catch(e){}if(!v)return;
 const tryOpen=(n=0)=>{try{if(typeof chooseReadwyRole==='function'&&typeof mode!=='undefined'){if(mode==='role')chooseReadwyRole('student');if(v==='signup')setTimeout(()=>{try{if(mode!=='signup')toggle()}catch(e){}},1300);return}}catch(e){}if(n<60)setTimeout(()=>tryOpen(n+1),250)};tryOpen()})();mount();setInterval(()=>{if(!btn.isConnected&&document.body)document.body.appendChild(btn);paint()},1500);
})();
