
/* Inkventure Reading Adventure Dashboard: the supplied artwork is the full-screen backdrop.
   Live values (avatar, greeting, points, progress ring, activity count) are drawn in the artwork's
   own coordinate space (1672 x 941) so they stay locked to the painted panels at every screen size. */
const INTERV_DASH={w:1672,h:941,activities:25};
const INTERV_STATIONS=[
 {name:'Fluency Junction',key:'fl',box:[527,352,146,222]},
 {name:'Vocabulary Terminal',key:'vo',box:[693,352,148,222]},
 {name:'Comprehension Crossing',key:'co',box:[860,352,149,222]},
 {name:'Inference Station',key:'in',box:[1027,352,147,222]},
 {name:'Critical Depot',key:'cr',box:[1190,352,143,222]}
];
function intervLearnerKey(){return encodeURIComponent(String(typeof user!=='undefined'&&user?(user.id||user.lrn||user.email||user.name):'local'))}
// Learner progress for every station, task, writing task and game (per grade).
// Content version 2: station tasks are built from the original Inkventure program, so answers saved against the
// earlier task content are moved aside (kept as stV1) instead of being shown against different questions.
const INTERV_CONTENT_VERSION=3; // 3: station tasks became arcade games (results kept in r.g)
function intervStationStore(){let s;try{s=JSON.parse(localStorage.getItem('readwy-interv-stations-v1-'+intervLearnerKey())||'{}')||{}}catch(e){s={}}
 if(s.cv!==INTERV_CONTENT_VERSION){if(s.st){const bk='stV'+(s.cv||1);if(!s[bk])s[bk]=s.st}delete s.st;s.cv=INTERV_CONTENT_VERSION;intervStationSave(s)}
 return s}
function intervStationSave(store){try{localStorage.setItem('readwy-interv-stations-v1-'+intervLearnerKey(),JSON.stringify(store))}catch(e){}}
function intervDashStats(){
 // A task is complete when its 10 activities are answered and its writing task is submitted (5 stations x 5 tasks = 25).
 const store=intervStationStore(),g=typeof ivGrade==='function'?ivGrade():7,byGrade=(store.st||{})[g]||{};
 let done=0,next=-1;
 INTERV_STATIONS.forEach((s,i)=>{const d=byGrade[s.key]||{t:{}};let complete=0;for(let t=1;t<=5;t++){const r=d.t?.[t];if(r&&r.g?.won&&r.w)complete++}done+=complete;if(next<0&&complete<5)next=i});
 return {done,pct:Math.min(100,Math.round(done/INTERV_DASH.activities*100)),points:Number(store.points)||0,next};
}function intervDashAvatar(profile){
 if(profile.photo)return profile.photo;
 const g=String(profile.gender||profile.sex||'').toLowerCase();
 return 'resources/interv/'+(/^(male|m|boy)$/.test(g)?'avatar-boy.svg':/^(female|f|girl)$/.test(g)?'avatar-girl.svg':'avatar-learner.svg');
}
function intervDashRing(pct){
 // Conic progress arc drawn as thin sectors so it carries the artwork's yellow → green → cyan sweep.
 const cx=540.5,cy=726.5,r0=47.4,r1=63.8,stops=[[0,[246,214,58]],[.35,[155,209,60]],[.62,[92,184,66]],[1,[31,180,223]]];
 const colour=t=>{for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const[a,ca]=stops[i-1],[b,cb]=stops[i],u=(t-a)/(b-a);return 'rgb('+ca.map((v,k)=>Math.round(v+(cb[k]-v)*u)).join(',')+')'}return 'rgb(31,180,223)'};
 const pt=(r,a)=>(cx+r*Math.sin(a)).toFixed(2)+' '+(cy-r*Math.cos(a)).toFixed(2);
 let out='';const steps=Math.round(pct*1.8);
 for(let i=0;i<steps;i++){const a0=i/180*Math.PI*2,a1=Math.min(steps,i+1.25)/180*Math.PI*2;
  out+='<path d="M'+pt(r1,a0)+'A'+r1+' '+r1+' 0 0 1 '+pt(r1,a1)+'L'+pt(r0,a1)+'A'+r0+' '+r0+' 0 0 0 '+pt(r0,a0)+'Z" fill="'+colour(i/180)+'"/>'}
 return out;
}
let intervDashSpeaking=false;
function intervDashSpeak(button,text){
 const synth=window.speechSynthesis,Utter=window.SpeechSynthesisUtterance;
 if(intervDashSpeaking||!synth||!Utter){synth?.cancel();intervDashSpeaking=false;button.setAttribute('aria-pressed','false');return}
 if(typeof readwyCanPlaySound==='function'&&!readwyCanPlaySound())return;
 const u=new Utter(text);u.rate=.95;u.onend=u.onerror=()=>{intervDashSpeaking=false;button.setAttribute('aria-pressed','false')};
 synth.cancel();synth.speak(u);intervDashSpeaking=true;button.setAttribute('aria-pressed','true');
}
function renderInterDashboard(){
 // Inkventure uses one painted hall for every page; the home page is drawn on it by stations.js.
 if(typeof ivRenderHome==='function')return ivRenderHome();
 page='work';activeModule='interv';nav.innerHTML='';setOwl('signup-form');
 window.speechSynthesis?.cancel();intervDashSpeaking=false;
 const profile=(typeof user!=='undefined'&&user)||{},stats=intervDashStats();
 // Profile names are entered as "Surname, First name, M.I."; greet the learner by first name.
 const fullName=String(profile.name||'').trim(),parts=fullName.split(',');
 const first=((parts.length>1?parts[1]:parts[0]).trim().split(/\s+/)[0]||'').trim()||'Learner';
 const W=INTERV_DASH.w,H=INTERV_DASH.h,pc=(v,t)=>(v/t*100).toFixed(3)+'%';
 const svg='<svg class="ivd-live" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true">'
  +'<defs><clipPath id="ivdAvatarClip"><circle cx="1396.3" cy="52" r="37.8"/></clipPath>'
  +'<filter id="ivdShadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.2" flood-color="#021133" flood-opacity=".85"/></filter></defs>'
  +'<image class="ivd-avatar" clip-path="url(#ivdAvatarClip)" x="1358.5" y="14.2" width="75.6" height="75.6" preserveAspectRatio="xMidYMid slice"/>'
  +'<g class="ivd-ring">'+intervDashRing(stats.pct)+'</g>'
  +'<text class="ivd-text ivd-pct" x="541" y="742.5" text-anchor="middle" filter="url(#ivdShadow)"></text>'
  +'<text class="ivd-text ivd-count" x="652.5" y="714" filter="url(#ivdShadow)"></text>'
  +'<text class="ivd-text ivd-hello" x="1452" y="43.5" filter="url(#ivdShadow)"></text>'
  +'<text class="ivd-text ivd-pts" x="1482.5" y="72.5" filter="url(#ivdShadow)"></text>'
  +'<text class="ivd-text ivd-card" x="1252" y="479" text-anchor="middle" filter="url(#ivdShadow)">Critical</text><text class="ivd-text ivd-card" x="1252" y="505" text-anchor="middle" filter="url(#ivdShadow)">Depot</text>'
  +'</svg>';
 app.innerHTML='<section class="sra-welcome-screen interv-welcome-screen ivd-screen" aria-label="Inkventure Reading Adventure Dashboard"><div class="interv-welcome-board ivd-board"><img src="resources/interv/reading-adventure-dashboard-live.hd.webp" onerror="this.onerror=null;this.src=\'resources/interv/reading-adventure-dashboard-live.png\'" alt="" draggable="false" decoding="async">'+svg+'<p class="ivd-sr" role="status"></p></div></section>';
 const board=app.querySelector('.ivd-board'),q=s=>board.querySelector(s);
 q('.ivd-avatar').setAttribute('href',intervDashAvatar(profile));
 q('.ivd-pct').textContent=stats.pct+'%';
 q('.ivd-count').textContent=stats.done+' / '+INTERV_DASH.activities;
 q('.ivd-hello').textContent='Hello, '+first+'!';
 q('.ivd-pts').textContent=stats.points.toLocaleString()+' pts';
 const hello=q('.ivd-hello');try{if(hello.getComputedTextLength()>128){hello.setAttribute('textLength','128');hello.setAttribute('lengthAdjust','spacingAndGlyphs')}}catch(e){}
 q('.ivd-sr').textContent=`Hello, ${first}. ${stats.points} points. Progress ${stats.pct} percent, ${stats.done} of ${INTERV_DASH.activities} activities completed.`;
 const summary=()=>{window.__reportsClassic=true;openModule('reports')},station=k=>renderStation(k);
 const hit=(label,box,action,radius)=>{const b=document.createElement('button');b.type='button';b.className='ivd-hit';b.setAttribute('aria-label',label);
  Object.assign(b.style,{left:pc(box[0],W),top:pc(box[1],H),width:pc(box[2],W),height:pc(box[3],H),borderRadius:radius||'3vh'});if(typeof ivHitArt==='function')ivHitArt(b,'resources/interv/reading-adventure-dashboard-live.hd.webp',box,W,H);b.addEventListener('click',action);board.append(b);return b};
 hit('Home',[372,20,156,62],()=>showDashboard(),'99px');
 hit('Stations',[540,20,162,62],()=>station(INTERV_STATIONS[Math.max(0,stats.next)].key),'99px');
 hit('Progress',[705,20,162,62],summary,'99px');
 hit('Rewards',[870,20,160,62],summary,'99px');
 hit('Profile',[1035,20,130,62],()=>go('profile'),'99px');
 hit('Settings',[1170,20,142,62],()=>go('settings'),'99px');
 hit('Your profile',[1354,9,86,86],()=>go('profile'),'50%');
 hit('Leave Inkventure and return to the learning journey',[1585,25,56,56],()=>go('map'),'14px');
 INTERV_STATIONS.forEach(s=>hit(s.name,s.box,()=>station(s.key),'4.5vh 4.5vh 2.5vh 2.5vh'));
 hit('Your progress: '+stats.pct+' percent',[458,607,330,205],summary);
 hit('Your achievements',[806,607,332,205],summary);
 hit('Claim rewards',[1192,752,228,56],summary,'99px');
 const tts=hit('Text-to-Speech: read this page aloud',[200,872,222,56],()=>{if(!intervDashSpeaking&&typeof ivOwlTalk==='function')ivOwlTalk(board,9000);intervDashSpeak(tts,`Welcome to Inkventure, ${first}! Your reading adventure awaits. You have ${stats.points} points, and you have completed ${stats.done} of ${INTERV_DASH.activities} activities. Choose your reading station: Fluency Junction, Vocabulary Terminal, Comprehension Crossing, Inference Station, or Critical Depot. Small steps, big progress!`)},'99px');
 tts.setAttribute('aria-pressed','false');
 hit('Continue your journey',[1276,848,358,86],()=>station(INTERV_STATIONS[Math.max(0,stats.next)].key),'99px').classList.add('ivh-idle');
 if(typeof ivDecorate==='function'){ivDecorate(board,'resources/interv/reading-adventure-dashboard-live.png',W,H);setTimeout(()=>ivOwlTalk(board,1800),900)}
 app.scrollTo(0,0);
}
function renderInter(){renderInterDashboard()}

