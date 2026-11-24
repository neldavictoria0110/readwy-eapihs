/* InterV painted pages, in program order:
   Dashboard (welcome.js) -> Station page (5 tasks) -> Task page (10 activities + writing task)
   -> Station games (original InterV games, distributed by competency) -> InterV Games arcade.
   Task content comes only from the original InterV program (InterVLegacyData: G vocabulary, F fluency,
   I inference, R reading passages, W writing) for the learner's profile grade; see IV_BUILD below.
   Every activity is scored automatically; hints cost Playlab credits. */

/* ---------- Stations ---------- */
const IV_ORDER=['fl','vo','co','in','cr'];
const IV_ST={
 fl:{name:'Fluency Junction',sub:'Read smoothly. Build speed. Shine brighter!',motto:['Smooth','Reading','Leads to','Success'],book:['Read','Fluently'],goal:'Read in smooth phrases with the right pauses!',hint:'Group the words that belong together, then press Listen to hear a model.'},
 vo:{name:'Vocabulary Terminal',sub:'Learn words. Use words. Own words!',motto:['Strong','Words','Build','Readers'],book:['Know','Words'],goal:'Choose the meaning that fits the context!',hint:'Look at the words around it for clues.'},
 co:{name:'Comprehension Crossing',sub:'Read closely. Find details. Understand fully!',motto:['Careful','Readers','Grasp','More'],book:['Read to','Know'],goal:'Answer using details from the text!',hint:'Go back to the passage and find the sentence that answers it.'},
 in:{name:'Inference Station',sub:'Spot clues. Think deeper. Read between the lines!',motto:['Clues','Lead to','Smart','Answers'],book:['Think','Deeper'],goal:'Back every conclusion with a clue!',hint:'Choose the answer that fits ALL the clues.'},
 cr:{name:'Critical Depot',sub:'Write clearly. Revise wisely. Build strong paragraphs!',motto:['Clear','Writing','Shows','Thinking'],book:['Write','Clearly'],goal:'Build correct, clear sentences and paragraphs!',hint:'Read the whole sentence carefully and check every word.'}
};
/* The original InterV challenge games, placed in the competency closest to each game's goal.
   [old competency index, old game index]: 0 Vocabulary, 1 Fluency, 2 Inferencing, 3 Comprehension, 4 Writing. All 25 are used. */
const IV_ST_GAMES={fl:[[1,0],[1,1],[1,2],[1,3],[1,4],[4,0]],vo:[[0,0],[0,1],[0,2],[0,3],[0,4],[4,1]],co:[[3,0],[3,1],[3,2],[3,4],[4,2]],in:[[2,0],[2,1],[2,2],[2,4],[4,4]],cr:[[3,3],[2,3],[4,3]]};
function ivGrade(){const u=(typeof user!=='undefined'&&user)||{},g=Number(u.grade);if(g>=7&&g<=12)return g;const s=typeof selectedGrade!=='undefined'?Number(selectedGrade):NaN;return s>=7&&s<=12?s:7}
const IV_COMP={vo:0,fl:1,in:2,co:3,cr:4},IV_TASK_CACHE={};
function ivTasks(key){
 const g=ivGrade(),id=g+':'+key;if(IV_TASK_CACHE[id])return IV_TASK_CACHE[id];
 try{ivLegacyMerge()}catch(e){}const L=globalThis.InterVLegacyData;if(!L||!L.G?.[g]||!IV_BUILD[key])return [];
 let tasks;try{tasks=IV_BUILD[key](L,g)}catch(e){console.error('InterV: could not build tasks',e);return []}
 const cat=globalThis.InterVGames?.catalog?.[IV_COMP[key]]||[];tasks.forEach((t,i)=>{t.n=cat[i]?.[0]||('Task '+(i+1))});
 // Writing difficulty grows from Task 1 (a few sentences) to Task 5 (a full composition with evidence).
 const base=(typeof IV_RUBRIC!=='undefined'&&IV_RUBRIC.minWords[g])||80,bs=(typeof IV_RUBRIC!=='undefined'&&IV_RUBRIC.minSentences[g])||5;
 tasks.forEach((t,i)=>{const L=IV_WRITE_LEVELS[i];if(!t.w||!L)return;const m=Math.max(20,Math.round(base*L.f/5)*5),sn=Math.max(2,Math.round(bs*L.sf));
  t.w={...t.w,m,s:sn,lv:i+1,lvName:L.name,need:Math.min(t.w.need||1,L.need),e:L.e?1:t.w.e,p:`Level ${i+1} · ${L.name} (at least ${m} words, ${sn} sentences). ${L.how} ${t.w.p}`}});
 return IV_TASK_CACHE[id]=tasks}
const IV_WRITE_LEVELS=[
 {name:'Sentence Builder',f:.4,sf:.5,need:1,how:'Write a few clear, complete sentences.'},
 {name:'Short Paragraph',f:.6,sf:.7,need:2,how:'Write one short paragraph with a topic sentence.'},
 {name:'Paragraph',f:.8,sf:.85,need:3,how:'Write a full paragraph: topic sentence, details, closing sentence.'},
 {name:'Developed Paragraph',f:1,sf:1,need:3,e:1,how:'Develop your ideas and support them with evidence or examples.'},
 {name:'Composition',f:1.3,sf:1.3,need:3,e:1,how:'Write a well-organized composition with an introduction, body and conclusion, using evidence.'}];
function ivStData(store,key,g=ivGrade()){store.st=store.st||{};store.st[g]=store.st[g]||{};return store.st[g][key]=store.st[g][key]||{sel:1,pts:0,t:{}}}
function ivTaskRec(store,key,t){const d=ivStData(store,key);return d.t[t]=d.t[t]||{r:[],w:null}}
// A task is done when its station game is won and its ★ writing is submitted.
function ivTaskDone(rec){return !!(rec&&rec.g?.won&&rec.w)}
// Stars: hearts left when the game was won (1–3), plus one for writing graded 80 or higher.
function ivTaskStars(rec){let s=rec?.g?.won?Math.max(1,Math.min(3,rec.g.lives||1)):0;if(rec?.w&&rec.w.score?.transmuted>=80)s++;return s}
function ivNextTask(key){const s=intervStationStore(),d=ivStData(s,key);for(let t=1;t<=5;t++)if(!ivTaskDone(d.t[t]))return t;return 1}
let ivLast={st:'fl'};

/* ---------- Helpers ---------- */
const ivEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ivWrap(text,max){const out=[];let line='';for(const w of String(text).split(/\s+/)){if(line&&(line+' '+w).length>max){out.push(line);line=w}else line=line?line+' '+w:w}if(line)out.push(line);return out}
function ivLines(lines,x,cy,lh,cls,size,anchor='middle',maxW=0){const y0=cy-(lines.length-1)*lh/2;return lines.map((l,i)=>`<text class="${cls}" x="${x}" y="${(y0+i*lh).toFixed(1)}" font-size="${size}" text-anchor="${anchor}"${maxW&&l.length*size*.55>maxW?` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"`:''}>${ivEsc(l)}</text>`).join('')}
function ivStar(cx,cy,R){let p='';for(let i=0;i<10;i++){const r=i%2?R*.45:R,a=Math.PI/5*i-Math.PI/2;p+=(cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1)+' '}return `<polygon points="${p}" fill="url(#ivpGoldStar)" stroke="#b86d06" stroke-width="${(R/11).toFixed(2)}"/>`}
function ivShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function ivSeeded(a,seed){a=a.slice();let s=(seed>>>0)||1;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function ivHash(str){let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function ivFirstName(){const p=(typeof user!=='undefined'&&user)||{},parts=String(p.name||'').trim().split(',');return((parts.length>1?parts[1]:parts[0]).trim().split(/\s+/)[0]||'').trim()||'Learner'}
function ivSay(text,rate=.95){const s=window.speechSynthesis,U=window.SpeechSynthesisUtterance;if(!s||!U)return;if(typeof readwyCanPlaySound==='function'&&!readwyCanPlaySound())return;s.cancel();const u=new U(String(text).replace(/[·\[\]]/g,''));u.rate=rate;s.speak(u)}
let ivTimers=[],ivRec=null,ivLegacyRuntime=null;
function ivLater(fn,ms){const t=setTimeout(fn,ms);ivTimers.push(t);return t}
function ivStopAll(){ivTimers.forEach(clearTimeout);ivTimers=[];clearInterval(ivRaceClock);try{ivRec?.abort()}catch(e){}ivRec=null;window.speechSynthesis?.cancel();try{ivLegacyRuntime?.destroy()}catch(e){}ivLegacyRuntime=null;if(typeof ivArcStop==='function')ivArcStop()}
// Points from tasks go to the station; points from the InterV Games bar are reward points (s.gpts, per game in s.gp)
// that pay for hints (s.gspent).
let ivCurGame='';
function ivAward(points,key){const s=intervStationStore();s.points=(Number(s.points)||0)+points;if(key){const d=ivStData(s,key);d.pts=(d.pts||0)+points}
 else{s.gpts=(Number(s.gpts)||0)+points;if(ivCurGame){s.gp=s.gp||{};s.gp[ivCurGame]=(s.gp[ivCurGame]||0)+points}}intervStationSave(s);return s}
const IV_HINT_COST=20;
function ivRewardBalance(){const s=intervStationStore();return Math.max(0,(Number(s.gpts)||0)-(Number(s.gspent)||0))}
// Pay for one hint: a Bonus Game credit if there is one, otherwise 20 reward points.
function ivBuyHint(id){const w=ivWallet();if(w&&w.hasHint(id))return {ok:true,how:'already unlocked'};
 if(w&&w.balance()>0){const r=w.buyHint(id);if(r.ok)return {ok:true,how:'1 Bonus Game credit'}}
 const s=intervStationStore(),bal=Math.max(0,(Number(s.gpts)||0)-(Number(s.gspent)||0));if(bal<IV_HINT_COST)return {ok:false};
 s.gspent=(Number(s.gspent)||0)+IV_HINT_COST;intervStationSave(s);return {ok:true,how:IV_HINT_COST+' reward points'}}
const IV_NAV764=[[142,206],[211,282],[286,358],[362,440],[444,510],[515,592]];
const IV_STATION_HEAD={head:{avatar:[1408.5,48.5,37.8],hello:[1463,44,21],pts:[1495,71.5,23]},nav:{y:[18,82],x:[[368,525],[535,700],[705,865],[870,1025],[1035,1165],[1170,1312]]},exit:[1597,26,42,48]};
const IV_TASK_HEAD={head:{avatar:[1396.5,50,37.8],hello:[1453,43,21],pts:[1485,72,23]},nav:{y:[18,82],x:[[358,520],[528,698],[705,862],[868,1022],[1030,1165],[1170,1318]]},exit:[1590,26,46,48]};

/* ---------- Page engine ---------- */
function ivPage(cfg){
 ivStopAll();page='work';activeModule='interv';nav.innerHTML='';setOwl('signup-form');
 const {img,w,h,fit,label,head}=cfg,profile=(typeof user!=='undefined'&&user)||{};
 const [ax,ay,ar]=head.avatar;
 app.innerHTML=`<section class="sra-welcome-screen interv-welcome-screen ivd-screen ivp-screen ivp-${fit}" aria-label="${ivEsc(label)}">${fit==='contain'?`<div class="ivp-blur" style="background-image:url('${ivHD(img)}')"></div>`:''}<div class="ivp-board" style="--ar:${w}/${h}"><img src="${ivHD(img)}" onerror="this.onerror=null;this.src='${img}'" alt="" draggable="false" decoding="async"><svg class="ivd-live" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="ivpClip"><circle cx="${ax}" cy="${ay}" r="${ar}"/></clipPath><filter id="ivpShadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="${(h/600).toFixed(2)}" stdDeviation="${(h/800).toFixed(2)}" flood-color="#021133" flood-opacity=".85"/></filter><filter id="ivpGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(w/300).toFixed(1)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="ivpGoldStar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset=".55" stop-color="#ffc928"/><stop offset="1" stop-color="#f09a0c"/></linearGradient><linearGradient id="ivpGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f3a315"/></linearGradient><linearGradient id="ivpTile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcebff"/><stop offset="1" stop-color="#9fc4f2"/></linearGradient></defs><image clip-path="url(#ivpClip)" x="${ax-ar}" y="${ay-ar}" width="${ar*2}" height="${ar*2}" preserveAspectRatio="xMidYMid slice" href="${ivEsc(intervDashAvatar(profile))}"/><text class="ivd-text ivp-hello" x="${head.hello[0]}" y="${head.hello[1]}" font-size="${head.hello[2]}" filter="url(#ivpShadow)"></text><text class="ivd-text ivp-pts" x="${head.pts[0]}" y="${head.pts[1]}" font-size="${head.pts[2]}" filter="url(#ivpShadow)"></text>${cfg.svg||''}</svg><div class="ivp-dyn"></div><p class="ivd-sr" role="status" aria-live="polite"></p></div></section>`;
 const board=app.querySelector('.ivp-board'),svg=board.querySelector('svg'),dyn=board.querySelector('.ivp-dyn');
 const pc=(v,t)=>(v/t*100).toFixed(3)+'%';
 const hello=svg.querySelector('.ivp-hello');hello.textContent='Hello, '+ivFirstName()+'!';
 try{const max=head.helloMax||(w>1000?128:72);if(hello.getComputedTextLength()>max){hello.setAttribute('textLength',max);hello.setAttribute('lengthAdjust','spacingAndGlyphs')}}catch(e){}
 const api={board,svg,w,h,
  box(b){return {left:pc(b[0],w),top:pc(b[1],h),width:pc(b[2],w),height:pc(b[3],h)}},
  pts(){svg.querySelector('.ivp-pts').textContent=intervDashStats().points.toLocaleString()+' pts'},
  g(name){let g=svg.querySelector('g[data-g="'+name+'"]');if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.dataset.g=name;svg.append(g)}return g},
  draw(name,markup){api.g(name).innerHTML=markup},
  say(msg){board.querySelector('.ivd-sr').textContent=msg},
  hit(label,box,fn,radius,layer){const b=document.createElement('button');b.type='button';b.className='ivd-hit';b.setAttribute('aria-label',label);Object.assign(b.style,api.box(box),{borderRadius:radius||'1.6vh'});if(typeof ivHitArt==='function')ivHitArt(b,ivHD(img),box,w,h);b.addEventListener('click',fn);(layer||board).append(b);return b},
  layer(cls,box){const d=document.createElement('div');d.className=cls;Object.assign(d.style,api.box(box));board.append(d);return d},
  clearDyn(){dyn.innerHTML=''},dyn,
  bubble(text){const b=cfg.bubble;if(!b)return;let size=b.size,lines=ivWrap(text,b.chars);if(lines.length>b.rows){size=b.size*.84;lines=ivWrap(text,Math.round(b.chars*1.2))}if(lines.length>b.rows+1){size=b.size*.72;lines=ivWrap(text,Math.round(b.chars*1.42))}api.draw('bubble',ivLines(lines,b.x,b.y,size*1.2,'ivp-ink',size,'middle',b.maxW));api.say(text);if(typeof ivOwlTalk==='function')ivOwlTalk(board,String(text).length*55)}
 };
 api.pts();
 const toStation=()=>renderStation(ivLast.st);
 const navActions=[()=>renderInter(),cfg.stations||toStation,()=>ivRenderProgress(),()=>ivRenderRewards(),()=>ivRenderProfile(),()=>ivRenderSettings()];
 const navNames=['InterV home','Stations','Progress','Rewards','Profile','Settings'];
 if(img===IV_PAGE_ART&&typeof ivHallLayout==='function'){ivHallLayout(api,cfg,navActions,navNames);app.scrollTo(0,0);return api}
 cfg.nav.x.forEach((x,i)=>api.hit(navNames[i],[x[0],cfg.nav.y[0],x[1]-x[0],cfg.nav.y[1]-cfg.nav.y[0]],navActions[i],'99px'));
 api.hit('Your profile',[ax-ar-3,ay-ar-3,ar*2+6,ar*2+6],()=>go('profile'),'50%');
 if(cfg.exit)api.hit('Leave InterV and return to the learning journey',cfg.exit,()=>go('map'),'1vh');
 if(typeof ivDecorate==='function')ivDecorate(board,img,w,h);
 app.scrollTo(0,0);
 return api;
}
/* ---------- Hall layout: sharp backdrop, large activity frame ----------
   The hall painting stays sharp. The owl, its speech bubble, the Goal plaque, the title banner, the logo and
   Keep Going are the painted ones, at their painted places. The activity frame spans from the owl to the right
   edge (covering the painted Hearts and Remember plaques); the top toolbar and the games bar sit exactly over
   the painted ones. */
const IV_V3={tabs:[352,13,976,74],me:[1340,7,318,92]};
function ivHallLayout(api,cfg,acts,names){
 const {board}=api,V=IV_V3,profile=(typeof user!=='undefined'&&user)||{};
 board.closest('.ivp-screen').classList.add('ivv3');ivApplyTheme(board,cfg.label);
 // Backing behind the activity frame (shows while the frame rolls).
 
 // Top toolbar over the painted one (same size, no highlighted tab).
 const icons=['🏠','🚉','📊','🏆','👤','⚙️'],labels=['Home','Stations','Progress','Rewards','Profile','Settings'];
 const tb=api.layer('ivnav3',V.tabs);
 tb.innerHTML=`<nav class="ivnav3-tabs" aria-label="InterV menu">${labels.map((l,i)=>`<button type="button" data-i="${i}" aria-label="${ivEsc(names[i])}"><span>${icons[i]}</span>${l}</button>`).join('')}</nav>`;
 const me=api.layer('ivnav3 ivnav3-me',V.me);
 me.innerHTML=`<button type="button" class="ivnav3-av" data-me aria-label="Your profile"><img src="${ivEsc(intervDashAvatar(profile))}" alt=""></button><span><b>Hello, ${ivEsc(ivFirstName())}!</b><small>⭐ <em class="ivnav3-pts"></em> pts</small></span><button type="button" class="ivnav3-exit" data-exit aria-label="Leave InterV and return to the learning journey">⎋</button>`;
 const click=e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.i)return acts[Number(t.dataset.i)]();if('me' in t.dataset)return ivRenderProfile();if('exit' in t.dataset)return go('map')};
 tb.addEventListener('click',click);me.addEventListener('click',click);
 const pts0=api.pts;api.pts=()=>{pts0();const p=me.querySelector('.ivnav3-pts');if(p)p.textContent=intervDashStats().points.toLocaleString()};api.pts();
 if(typeof ivDecorate==='function'){ivDecorate(board,IV_PAGE_ART,api.w,api.h);board.querySelectorAll('.iva-lamp,.iva-glint,.iva-banner,.iva-train,.iva-sweep,.iva-dust').forEach(e=>e.remove())}
}function ivFitText(el,min=6){if(!el)return;let size=parseFloat(getComputedStyle(el).fontSize)||16;let guard=40;while(guard-->0&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)&&size>min){size*=.93;el.style.fontSize=size+'px'}}
function ivTitle(name,sub,arc){
 // Station banner (curved) or task banner (flat): draw the station name and subtitle in the banner's serif style.
 if(arc){const ts=Math.min(54,440/(name.length*.6)),ss=Math.min(23,410/(sub.length*.56));
  return `<path id="ivArcT" d="M612 194 Q852 166 1092 194" fill="none"/><path id="ivArcS" d="M622 229 Q852 206 1082 229" fill="none"/><text class="ivp-serif" font-size="${ts.toFixed(1)}"><textPath href="#ivArcT" startOffset="50%" text-anchor="middle">${ivEsc(name)}</textPath></text><text class="ivp-serif ivp-italic" font-size="${ss.toFixed(1)}"><textPath href="#ivArcS" startOffset="50%" text-anchor="middle">${ivEsc(sub)}</textPath></text>`}
 const ts=Math.min(44,400/(name.length*.55)),ss=Math.min(32,420/(sub.length*.5));
 return `<text class="ivp-serif" x="852" y="160" font-size="${ts.toFixed(1)}" text-anchor="middle">${ivEsc(name)}</text><text class="ivp-serif" x="852" y="206" font-size="${ss.toFixed(1)}" text-anchor="middle">${ivEsc(sub)}</text>`}
function ivTaskGoal(text){let lines=ivWrap(text,19),size=15;if(lines.length>3){lines=ivWrap(text,23);size=13}return ivLines(lines.slice(0,3),248,738,size*1.25,'ivp-ink',size,'middle',150)}
function ivTips(tips){
 // Remember panel: two tips, each at most two lines beside its painted check mark (y≈617 and y≈680).
 return tips.slice(0,2).map((tip,i)=>{let size=17,lines=ivWrap(tip,20);if(lines.length>2){size=15;lines=ivWrap(tip,23)}if(lines.length>2){size=13.5;lines=ivWrap(tip,26).slice(0,2)}return ivLines(lines,1433,i?697:631,size*1.25,'ivp-ink',size,'start',172)}).join('')}
function ivStationArt(S){
 const motto=S.motto.map((m,i)=>`<text class="ivp-motto" x="88.5" y="${196+i*31}" font-size="${Math.min(21,84/(m.length*.55)).toFixed(1)}" text-anchor="middle">${ivEsc(m)}</text>`).join('');
 const book=`<g transform="rotate(24 246 560)">${S.book.map((b,i)=>`<text class="ivp-book" x="246" y="${552+i*33}" font-size="${Math.min(27,96/(b.length*.55)).toFixed(1)}" text-anchor="middle">${ivEsc(b)}</text>`).join('')}</g>`;
 return motto+book}

/* ---------- One backdrop for all of InterV ----------
   Home, stations, tasks and games all use the same painted hall (task page art): the owl, hall, train, top
   navigation and bottom games bar never move. Only the title banner, the central board, the plaques and the
   owl's speech bubble change from page to page. */
const IV_PAGE_ART='resources/interv/pages/task-generic.png';
const IV_BUBBLE={x:295,y:186,size:25,chars:23,rows:3,maxW:236};
const IV_ST_ICON={fl:'📖',vo:'📚',co:'💡',in:'🔍',cr:'📋'};
const IV_ST_COLOR={fl:'#2f7de1',vo:'#2fa64f',co:'#8e5bd6',in:'#13a19c',cr:'#e8812b'};
const IV_GAME_ICON={hangman:'🔤',memory:'🃏',wordle:'🔐',domino:'🁫',bullseye:'🎯',sprint:'🚂',quiz:'🪜',crossing:'🧭',ttt:'⭕',connect4:'🔴',board:'🎲',whack:'🔨',blaster:'🚀',bomb:'💣',bingo:'🎱',dig:'⛏️',race:'🏎️',beadwheel:'📿',fishing:'🎣',slice:'✂️',tower:'🏗️',slide:'🧩',snake:'🐍',balloon:'🎈',typerush:'⌨️'};
// Relabel the painted "Attempts" plaque (same plaque on every page).
function ivPlaque(P,label){P.draw('plaque',`<defs><linearGradient id="ivgPlq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8dfae"/><stop offset="1" stop-color="#f1d09a"/></linearGradient></defs><rect x="1398" y="374" width="186" height="38" rx="10" fill="url(#ivgPlq)"/><text class="ivp-serif" x="1491" y="404" font-size="${label.length>8?27:33}" text-anchor="middle" style="fill:#13205a">${ivEsc(label)}</text>`)}
function ivHallPage(label,stations){return ivPage({img:IV_PAGE_ART,w:1672,h:941,fit:'fill',label,...IV_TASK_HEAD,stations,bubble:IV_BUBBLE})}
function ivStationProgress(key){const D=ivStData(intervStationStore(),key);let won=0,done=0,writings=0;for(let t=1;t<=5;t++){const r=D.t[t];if(r?.g?.won)won++;if(r?.w)writings++;if(ivTaskDone(r))done++}return {D,won,done,writings,pct:Math.round((won+writings)/10*100)}}

/* ---------- Home: choose a reading station ---------- */
const IV_HOME_ART='resources/interv/reading-adventure-dashboard-live.hd.webp',IV_HOME_PANEL=[505,284,845,304];
function ivRenderHome(){
 const stats=intervDashStats(),first=ivFirstName(),next=INTERV_STATIONS[Math.max(0,stats.next)]||INTERV_STATIONS[0];
 const P=ivHallPage('InterV home: choose a reading station',()=>renderStation(next.key));
 P.draw('title',ivTitle('Welcome to InterV!','Your Reading Adventure Awaits!',false));
 P.draw('goal',ivTaskGoal('Pick a station. Small steps, big progress!'));P.draw('tips',ivTips(['Finish every task in a station.','Win the game, then write.']));
 ivPlaque(P,'Progress');P.draw('attempts',ivAttemptStars(Math.round(stats.pct/100*3),`${stats.pct}%`));
 const frame=P.layer('ivx ivhome',IV_FRAME);
 frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>Choose your reading station</b><span>Hello, ${ivEsc(first)}! · ${stats.points.toLocaleString()} points · ${stats.done} of 25 tasks done</span></div></header>
  <div class="ivhs-wrap"><div class="ivhs-panel"><div class="ivhs-art"></div>
   <svg class="ivhs-svg" viewBox="${IV_HOME_PANEL.join(' ')}" preserveAspectRatio="none" aria-hidden="true"><svg x="505" y="416" width="44" height="36" viewBox="505 410 44 1" preserveAspectRatio="none"><image href="${IV_HOME_ART}" width="1672" height="941" preserveAspectRatio="none"/></svg><svg x="505" y="452" width="44" height="62" viewBox="505 517 44 1" preserveAspectRatio="none"><image href="${IV_HOME_ART}" width="1672" height="941" preserveAspectRatio="none"/></svg><text class="ivd-text ivd-card" x="1252" y="479" text-anchor="middle">Critical</text><text class="ivd-text ivd-card" x="1252" y="505" text-anchor="middle">Depot</text></svg>
   ${INTERV_STATIONS.map(s=>{const p=ivStationProgress(s.key),[x,y,w,h]=s.box,[px,py,pw,ph]=IV_HOME_PANEL,pc=(v,t)=>(v/t*100).toFixed(3)+'%';
    return `<button type="button" class="ivhs-tile${s.key===next.key?' next':''}${p.done===5?' done':''}" data-st="${s.key}" aria-label="${ivEsc(s.name)}: ${p.done} of 5 tasks done" style="left:${pc(x-px,pw)};top:${pc(y-py,ph)};width:${pc(w,pw)};height:${pc(h,ph)}">${s.key===next.key?'<em>Next stop</em>':p.done===5?'<em>✔ Done</em>':''}<span class="ivhs-chip">${p.done}/5 tasks</span></button>`}).join('')}
  </div><button type="button" class="ivhs-go" data-go>▶ Continue: ${ivEsc(next.name)}</button></div></div>`;
 // The original painted "Choose Your Reading Station" panel, shown crisp from the dashboard artwork.
 const art=frame.querySelector('.ivhs-art');if(typeof ivArtBg==='function')ivArtBg(art,IV_HOME_ART,IV_HOME_PANEL,1672,941);
 frame.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.st)return renderStation(d.st);if('go' in d)return renderStation(next.key)});
 P.hit('Continue your journey',[1310,825,338,92],()=>renderStation(next.key),'99px').classList.add('ivh-idle');
 ivGamesBar(P,()=>renderInter());
 P.bubble(`Hi, ${first}! Choose a reading station.`);
}

/* ---------- Progress: score summary for each competency ---------- */
const IV_COMP_NAME={fl:'Fluency',vo:'Vocabulary',co:'Comprehension',in:'Inference',cr:'Writing'};
function ivRenderProgress(){
 const g=ivGrade();let tot={won:0,writ:0,correct:0,stars:0,pts:0,grades:[]};
 const rows=IV_ORDER.map(key=>{const D=ivStData(intervStationStore(),key);let won=0,writ=0,correct=0,stars=0;const grades=[];
  for(let t=1;t<=5;t++){const r=D.t[t];if(r?.g?.won)won++;correct+=r?.g?.correct||0;stars+=ivTaskStars(r);if(r?.w){writ++;grades.push(r.w.score?.transmuted||0)}}
  const avg=grades.length?Math.round(grades.reduce((a,b)=>a+b,0)/grades.length):null,mastery=Math.round((won+writ)/10*100);
  tot.won+=won;tot.writ+=writ;tot.correct+=correct;tot.stars+=stars;tot.pts+=D.pts||0;tot.grades.push(...grades);
  return {key,won,writ,correct,stars,avg,pts:D.pts||0,mastery}});
 const avgAll=tot.grades.length?Math.round(tot.grades.reduce((a,b)=>a+b,0)/tot.grades.length):null,pctAll=Math.round((tot.won+tot.writ)/50*100);
 const P=ivHallPage('InterV: my progress',()=>renderStation(ivLast.st));
 P.draw('title',ivTitle('My Progress',`Grade ${g} · scores in every competency`,false));
 P.draw('goal',ivTaskGoal('Win every game and write well in all five!'));P.draw('tips',ivTips(['Mastery = games won + writing done.','Grade = average writing score.']));
 ivPlaque(P,'Overall');P.draw('attempts',ivAttemptStars(Math.round(pctAll/100*3),`${pctAll}%`));
 const frame=P.layer('ivx ivprog',IV_FRAME);
 frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>📊 Score summary by competency</b><span>${tot.won}/25 games won · ${tot.writ}/25 writings · ${tot.pts.toLocaleString()} task points${avgAll!=null?` · average writing grade ${avgAll}`:''}</span></div></header>
  <div class="ivpr-grid">${rows.map(r=>`<button type="button" class="ivpr-card" data-st="${r.key}" style="--c:${IV_ST_COLOR[r.key]}"><div class="ivpr-top"><span>${IV_ST_ICON[r.key]}</span><b>${ivEsc(IV_COMP_NAME[r.key])}</b></div>
   <div class="ivpr-ring" style="--p:${r.mastery}"><b>${r.mastery}%</b><small>mastery</small></div>
   <dl><div><dt>Games</dt><dd>${r.won}/5</dd></div><div><dt>Writing</dt><dd>${r.writ}/5</dd></div><div><dt>Grade</dt><dd>${r.avg??'–'}</dd></div><div><dt>Correct</dt><dd>${r.correct}</dd></div><div><dt>Stars</dt><dd>${r.stars}★</dd></div><div><dt>Points</dt><dd>${r.pts.toLocaleString()}</dd></div></dl></button>`).join('')}</div></div>`;
 frame.addEventListener('click',ev=>{const b=ev.target.closest('[data-st]');if(b)renderStation(b.dataset.st)});
 P.hit('Keep going',[1310,825,338,92],()=>renderInter(),'99px').classList.add('ivh-idle');
 ivGamesBar(P,()=>ivRenderProgress());
 P.bubble(`You have won ${tot.won} of 25 games. Tap a competency to practise it!`);
}
/* ---------- Rewards: points earned in the InterV Games; they unlock hints in the tasks ---------- */
function ivRenderRewards(){
 const s=intervStationStore(),w=ivWallet(),earned=Number(s.gpts)||0,spent=Number(s.gspent)||0,bal=Math.max(0,earned-spent),cred=w?w.balance():0,gp=s.gp||{},plays=s.games||{};
 const list=[['Word Puzzle','🧩',renderIvWordPuzzle],['Memory Match','🃏',renderIvMemory],['Reading Race','🏁',renderIvReadingRace],['Word Spinner','🎡',renderIvSpinner],['Challenge Game','🏆',renderIvChallenge]];
 const hints=Math.floor(bal/IV_HINT_COST)+cred;
 const P=ivHallPage('InterV: my rewards',()=>renderStation(ivLast.st));
 P.draw('title',ivTitle('My Rewards','Points from the InterV Games',false));
 P.draw('goal',ivTaskGoal('Play games, earn points, unlock hints!'));P.draw('tips',ivTips([`1 hint = ${IV_HINT_COST} points.`,'Or use 1 Bonus Game credit.']));
 ivPlaque(P,'Hints');P.draw('attempts',ivAttemptStars(Math.min(3,hints),`${hints} ready`));
 const frame=P.layer('ivx ivrew',IV_FRAME);
 frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>🏆 Points earned in the InterV Games</b><span>Each hint in a task costs ${IV_HINT_COST} reward points (or 1 Bonus Game credit).</span></div></header>
  <div class="ivrw-body"><div class="ivrw-sum"><div><small>Earned</small><b>${earned.toLocaleString()}</b></div><div><small>Spent on hints</small><b>${spent.toLocaleString()}</b></div><div class="big"><small>Reward points left</small><b>${bal.toLocaleString()}</b></div><div><small>🎁 Bonus credits</small><b>${cred}</b></div><div class="hint"><small>💡 Hints you can unlock</small><b>${hints}</b></div></div>
   <div class="ivrw-list">${list.map(([n,ic],i)=>`<button type="button" class="ivrw-row" data-g="${i}"><span>${ic}</span><b>${n}</b><small>played ${plays[n]||0}×</small><em>${(gp[n]||0).toLocaleString()} pts</em></button>`).join('')}<button type="button" class="ivrw-row bonus" data-bonus><span>🎁</span><b>Bonus Game</b><small>win rounds for credits</small><em>${cred} credit${cred===1?'':'s'}</em></button></div></div></div>`;
 frame.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.g){ivGamesBack=()=>ivRenderRewards();return list[Number(b.dataset.g)][2]()}if('bonus' in b.dataset)return ivOpenPlaylab(P,()=>ivRenderRewards())});
 P.hit('Keep going',[1310,825,338,92],()=>renderInter(),'99px').classList.add('ivh-idle');
 ivGamesBar(P,()=>ivRenderRewards());
 P.bubble(hints?`You can unlock ${hints} hint${hints===1?'':'s'}! Play more games to earn more.`:`Play the InterV Games to earn points for hints!`);
}

/* ---------- Colour themes: each InterV page carries its own tone (frame, title strip, roll) ---------- */
const IV_THEMES={home:['#3f4fc4','#ff8a3d'],fl:['#2f7de1','#ffd447'],vo:['#23a05a','#ffe27a'],co:['#8e5bd6','#ffd447'],in:['#13a19c','#ffcf5a'],cr:['#e8742b','#fff0b8'],
 progress:['#5b4fd6','#7fe0c2'],rewards:['#d98a12','#fff3c4'],games:['#d6457e','#ffe27a'],profile:['#c2417a','#ffd6e6'],settings:['#4a6378','#bfe3ff']};
function ivThemeOf(label){const l=String(label||'').toLowerCase();
 for(const k of IV_ORDER)if(l.startsWith(IV_ST[k].name.toLowerCase()))return k;
 if(l.includes('progress'))return 'progress';if(l.includes('reward'))return 'rewards';if(l.includes('profile'))return 'profile';if(l.includes('setting'))return 'settings';
 if(l.includes('home'))return 'home';return 'games'}
function ivApplyTheme(board,label){const k=ivThemeOf(label),[c,a]=IV_THEMES[k];const sc=board.closest('.ivp-screen');sc.dataset.ivTheme=k;sc.style.setProperty('--ivc',c);sc.style.setProperty('--iva',a)}

/* ---------- Profile and Settings inside the InterV hall ---------- */
function ivRenderProfile(){
 const u=(typeof user!=='undefined'&&user)||{},st=intervDashStats(),g=ivGrade();
 const P=ivHallPage('InterV: my profile',()=>renderStation(ivLast.st));
 P.draw('title',ivTitle('My Profile','Your InterV passenger card',false));P.draw('goal',ivTaskGoal('Keep your details up to date!'));
 const frame=P.layer('ivx ivprof',IV_FRAME);
 const f=(n,l,v,a='')=>`<label class="ivpf-f"><span>${l}</span><input name="${n}" value="${ivEsc(v||'')}" ${a}></label>`;
 frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>👤 Passenger card</b><span>Changes are saved to your READwy profile.</span></div></header>
  <div class="ivpf-body"><aside class="ivpf-card"><img src="${ivEsc(intervDashAvatar(u))}" alt=""><b>${ivEsc(u.name||'Learner')}</b><small>Grade ${g}${u.section?' · '+ivEsc(u.section):''}</small>
   <div class="ivpf-stats"><div><b>${st.points.toLocaleString()}</b><small>points</small></div><div><b>${st.done}/25</b><small>tasks done</small></div><div><b>${st.pct}%</b><small>progress</small></div></div></aside>
   <form class="ivpf-form" novalidate>${f('name','Full name (Surname, First name, M.I.)',u.name,'required maxlength="100" autocomplete="name"')}${f('lrn','LRN (12 digits)',u.lrn,'inputmode="numeric" pattern="[0-9]{12}" maxlength="12"')}
    <label class="ivpf-f"><span>Grade</span><select name="grade">${[7,8,9,10,11,12].map(n=>`<option value="${n}"${Number(u.grade||g)===n?' selected':''}>Grade ${n}</option>`).join('')}</select></label>
    ${f('section','Section',u.section,'maxlength="80"')}${f('teacherName','Name of teacher',u.teacherName,'maxlength="100"')}${f('email','DepEd email',u.email,'type="email" autocomplete="email"')}</form></div>
  <footer class="ivx-foot"><span class="ivx-msg" role="status"></span><button type="button" class="ivx-b ivx-check" data-save>✔ Save profile</button></footer></div>`;
 const form=frame.querySelector('form'),msg=frame.querySelector('.ivx-msg');
 frame.querySelector('[data-save]').onclick=()=>{const e=form.elements;if(!e.name.value.trim()){msg.textContent='Please enter your full name.';e.name.focus();return}
  if(!form.checkValidity()){const bad=[...e].find(x=>!x.checkValidity());msg.textContent=bad?.name==='lrn'?'The LRN must be exactly 12 digits.':bad?.name==='email'?'Please enter a valid email.':'Please check the details.';bad?.focus();return}
  const profile={...u,role:u.role||'student',name:e.name.value.trim(),lrn:e.lrn.value.trim(),grade:Number(e.grade.value),section:e.section.value.trim(),teacherName:e.teacherName.value.trim(),email:e.email.value.trim().toLowerCase()};
  try{persistStudentProfile(profile);for(const k in IV_TASK_CACHE)delete IV_TASK_CACHE[k];msg.textContent='Profile saved ✓';P.bubble('Your profile is saved!')}catch(err){msg.textContent='Unable to save. Browser storage may be full.'}};
 P.hit('Keep going',[1310,825,338,92],()=>renderInter(),'99px');ivGamesBar(P,()=>ivRenderProfile());
 P.bubble(`Hi, ${ivFirstName()}! Check your details.`);
}
function ivRenderSettings(){
 const p=load('preferences',{});
 const P=ivHallPage('InterV: settings',()=>renderStation(ivLast.st));
 P.draw('title',ivTitle('Settings','Make InterV comfortable for you',false));P.draw('goal',ivTaskGoal('Set sound, speed and reading size.'));
 const frame=P.layer('ivx ivset',IV_FRAME);
 const sw=(n,t,d,on)=>`<label class="ivse-row"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" role="switch" name="${n}"${on?' checked':''}></label>`;
 const sl=(n,t,d,v,min,max,step,unit)=>`<label class="ivse-row"><span><b>${t} <output>${v}${unit}</output></b><small>${d}</small></span><input type="range" name="${n}" min="${min}" max="${max}" step="${step}" value="${v}" data-unit="${unit}"></label>`;
 frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>⚙️ Settings</b><span>These settings apply to all of READwy.</span></div></header>
  <form class="ivse-form">${sw('sound','Sound','Music, effects and read-aloud',p.sound!==false)}${sl('volume','Volume','How loud sounds play',Math.round((p.volume??.8)*100),0,100,5,'%')}
   ${sl('speechRate','Read-aloud speed','How fast 🔊 Listen reads',p.speechRate??1,.6,1.4,.1,'×')}${sl('readingSize','Reading size','Text size in the reading books',p.readingSize||19,15,28,1,' px')}
   ${sw('reduceMotion','Calm motion','Fewer animations and transitions',!!p.reduceMotion)}${sw('highContrast','High contrast','Stronger text colours',!!p.highContrast)}</form>
  <footer class="ivx-foot"><span class="ivx-msg" role="status"></span><button type="button" class="ivx-b ivx-check" data-save>✔ Save settings</button></footer></div>`;
 const form=frame.querySelector('form'),msg=frame.querySelector('.ivx-msg');
 form.addEventListener('input',e=>{const r=e.target;if(r.type==='range')r.closest('label').querySelector('output').textContent=r.value+r.dataset.unit});
 frame.querySelector('[data-save]').onclick=()=>{const e=form.elements,np={...load('preferences',{}),sound:e.sound.checked,volume:Number(e.volume.value)/100,speechRate:Number(e.speechRate.value),readingSize:Number(e.readingSize.value),reduceMotion:e.reduceMotion.checked,highContrast:e.highContrast.checked};
  try{localStorage.setItem(STORE+'preferences',JSON.stringify(np));if(typeof applyPreferences==='function')applyPreferences();msg.textContent='Settings saved ✓';P.bubble('Settings saved!')}catch(err){msg.textContent='Unable to save settings.'}};
 P.hit('Keep going',[1310,825,338,92],()=>renderInter(),'99px');ivGamesBar(P,()=>ivRenderSettings());
 P.bubble('Make InterV just right for you.');
}
/* ---------- Station: choose a task ---------- */
function renderStation(key,mode){
 key=IV_ST[key]?key:(ivLast.st||'fl');ivLast.st=key;
 const S=IV_ST[key],tasks=ivTasks(key),prog=ivStationProgress(key),D=prog.D;let selected=Number(D.sel)||ivNextTask(key);
 const P=ivHallPage(S.name+': choose a task',()=>renderInter());
 P.draw('title',ivTitle(S.name,S.sub,false));
 P.draw('goal',ivTaskGoal(S.goal));P.draw('tips',ivTips(['Pick a task, then press Start.','Win the game, then write.']));
 ivPlaque(P,'Progress');P.draw('attempts',ivAttemptStars(Math.round(prog.done/5*3),`${prog.done}/5 tasks`));
 const frame=P.layer('ivx ivst',IV_FRAME);
 const paint=()=>{
  frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>${IV_ST_ICON[key]} Choose a task</b><span>${ivEsc(S.name)} · Grade ${ivGrade()} · ${prog.won} of 5 games won · ${(D.pts||0).toLocaleString()} points</span></div></header>
   <div class="ivst-cards">${tasks.map((t,i)=>{const kind=IV_ARCADE[key][i],gname=(typeof ARAL_GAMES!=='undefined'&&ARAL_GAMES[kind]?.name)||'',r=D.t[i+1],n=ivTaskStars(r),st=ivTaskDone(r)?'✔ Done':r?.g?.won?'★ Write next':'';
    return `<button type="button" class="ivst-card${i+1===selected?' sel':''}${ivTaskDone(r)?' done':''}" data-t="${i+1}" style="--c:${IV_ST_COLOR[key]}"><span class="ivst-num">Task ${i+1}</span><span class="ivst-ic">${IV_GAME_ICON[kind]||'🎮'}</span><b>${ivEsc(t.n)}</b><small>${ivEsc(gname)}</small><span class="ivst-stars">${'★'.repeat(n)}${'☆'.repeat(4-n)}</span>${st?`<em>${st}</em>`:''}</button>`}).join('')}</div>
   <footer class="ivx-foot"><button type="button" class="ivx-b ivx-listen" data-home>◀ All stations</button><span class="ivx-msg"></span><button type="button" class="ivx-b ivx-check" data-start>▶ Start Task ${selected}</button></footer></div>`};
 const select=t=>{selected=t;const s=intervStationStore();ivStData(s,key).sel=t;intervStationSave(s);paint();P.say('Task '+t+' selected: '+(tasks[t-1]?.n||''))};
 frame.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.t){const t=Number(d.t);return t===selected?renderTask(key,t):select(t)}
  if('start' in d)return renderTask(key,selected);if('home' in d)return renderInter()});
 paint();
 P.hit('Start the selected task',[1310,825,338,92],()=>renderTask(key,selected),'99px').classList.add('ivh-idle');
 ivGamesBar(P,()=>renderStation(key));
 P.bubble(`${S.name}! Pick a task, then press Start.`);
 if(mode==='games'){frame.remove();ivStationGames(P,key)}
}
function ivRingSectors(cx,cy,r0,r1,pct){
 const stops=[[0,[246,214,58]],[.35,[155,209,60]],[.62,[92,184,66]],[1,[31,180,223]]];
 const colour=t=>{for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const[a,ca]=stops[i-1],[b,cb]=stops[i],u=(t-a)/(b-a);return 'rgb('+ca.map((v,k)=>Math.round(v+(cb[k]-v)*u)).join(',')+')'}return 'rgb(31,180,223)'};
 const pt=(r,a)=>(cx+r*Math.sin(a)).toFixed(2)+' '+(cy-r*Math.cos(a)).toFixed(2);let out='';const steps=Math.round(pct*1.8);
 for(let i=0;i<steps;i++){const a0=i/180*Math.PI*2,a1=Math.min(steps,i+1.25)/180*Math.PI*2;out+='<path d="M'+pt(r1,a0)+'A'+r1+' '+r1+' 0 0 1 '+pt(r1,a1)+'L'+pt(r0,a1)+'A'+r0+' '+r0+' 0 0 0 '+pt(r0,a0)+'Z" fill="'+colour(i/180)+'"/>'}
 return out;
}
/* Station games: the original InterV games that belong to this competency, shown over the task board. */
function ivStationGames(P,key){
 const IG=globalThis.InterVGames;const g=ivGrade(),list=IV_ST_GAMES[key],store=intervStationStore();
 P.board.querySelector('.ivp-gpanel')?.remove();const panel=P.layer('ivp-gpanel',IV_FRAME);
 panel.innerHTML=`<div class="ivp-gpanel-head"><b>${ivEsc(IV_ST[key].name)} Games</b><span>Grade ${g} · 5 rounds each</span><button type="button" class="ivp-pill" data-back>◀ Back to Tasks</button></div><div class="ivp-gcards">${list.map(([c,t],i)=>{const meta=IG?.catalog?.[c]?.[t]||['Game','🎮',''],rec=(store.lg?.[g]||{})[c+'-'+t]||{},n=Object.values(rec.sc||{}).filter(v=>v===1).length;
  return `<button type="button" class="ivp-gcard" data-game="${i}"><span class="ivp-gicon">${meta[1]}</span><b>${ivEsc(meta[0])}</b><small>${ivEsc(meta[2])}</small><em>${'★'.repeat(n)}${'☆'.repeat(5-n)} ${n}/5</em></button>`}).join('')}</div>`;
 panel.querySelector('[data-back]').onclick=()=>renderStation(key);
 panel.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>renderLegacyGame(key,Number(b.dataset.game)));
 P.say(IV_ST[key].name+' games. Choose a game.');
}

/* ---------- Task content: built only from the original InterV program ----------
   Each station = one old competency; each task = one old InterV game (names from InterVGames.catalog).
   A task has 10 auto-scored activities: two question types x the grade's five old content sets,
   plus a ★ writing task on old content, scored by the rubric. */
const ivUniq=a=>{const seen=new Set();return a.filter(x=>{if(x==null)return false;const k=String(x).trim().toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true})};
function ivPool(list,i,f,answer,n,seed){const ans=String(answer).trim().toLowerCase();return ivSeeded(ivUniq(list.map((x,j)=>j===i?null:f(x,j))).filter(v=>String(v).trim().toLowerCase()!==ans),seed).slice(0,n)}
function ivMC(q,answer,wrong,x={}){return {k:'mc',q,opts:ivUniq([answer,...wrong]),...x}}
// Ordering item: parts in the correct order; dec = decoy pieces that do not belong (harder grades).
function ivOrd(q,parts,x={}){const {decoys,...rest}=x,P=parts.map(p=>String(p).trim()).filter(Boolean),dec=ivUniq(decoys||[]).filter(d=>!P.some(p=>ivLow(p)===ivLow(d)));
 return {k:'order',q:dec.length?`${q} Careful: ${dec.length} piece${dec.length>1?'s do':' does'} not belong!`:q,parts:P,dec,...rest}}
/* Grade-level difficulty: 1 = Grades 7–8, 2 = Grades 9–10, 3 = Grades 11–12. */
const IV_LVL=g=>g<=8?1:g<=10?2:3;
// Names: words written with a capital in the middle of a sentence somewhere in the grade's original content (Mira, Ana…).
function ivCorpus(L,g){const proper=new Set(['i']);
 const walk=v=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk);
  else if(typeof v==='string'&&/[.!?]["”’]?\s*$/.test(v))ivSents(String(v).replace(/\s*\|\s*/g,' ')).forEach(sen=>ivWords(sen).forEach((w,i)=>{const c=ivClean(w);if(i>0&&!/^[“"‘]/.test(w)&&!/[“"]$/.test(ivWords(sen)[i-1]||'')&&/^[A-Z][a-z]/.test(c))proper.add(c.toLowerCase())}))};
 for(const k of ['G','F','I','R','W'])walk(L[k]?.[g]);return proper}
// Ordering tiles must not give away the order: no sentence-start capital (names keep theirs), no quotation marks, no closing punctuation.
function ivTile(s,proper){let t=String(s).trim().replace(/[“”"]/g,'').replace(/[.!?]+$/,'').trim();const m=t.match(/^([A-Z][a-z’']*)(.*)$/s);if(m&&!proper.has(m[1].toLowerCase()))t=m[1].toLowerCase()+m[2];return t}
// Harder grades: split the longest word groups into smaller pieces (only groups of 4+ words).
function ivFiner(chunks,times){const c=chunks.slice();for(let n=0;n<times;n++){const i=c.reduce((b,x,k)=>ivWords(x).length>ivWords(c[b]).length?k:b,0),w=ivWords(c[i]);if(w.length<4)break;const h=Math.ceil(w.length/2);c.splice(i,1,w.slice(0,h).join(' '),w.slice(h).join(' '))}return c}
const ivCap=s=>String(s).charAt(0).toUpperCase()+String(s).slice(1);
const ivLow=s=>String(s).toLowerCase();
const ivWords=s=>String(s).split(/\s+/).filter(Boolean);
const ivBare=w=>String(w).toLowerCase().replace(/[^a-z0-9’'-]/g,'');
const ivClean=w=>String(w).replace(/^[“"‘(]+|[.,;:!?”")]+$/g,'');
const ivSents=s=>(String(s).match(/[^.!?]+[.!?]+["”’]?/g)||[String(s)]).map(x=>x.trim()).filter(Boolean);
const ivRx=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function ivBlank(text,word){const re=new RegExp('\\b'+ivRx(word)+'\\b','i');return re.test(text)?text.replace(re,'_____'):text}
function ivKeyWords(text,n){const stop=new Set('about after again also being before because between could their there these those which while where would should other their them they were with from have this that than then into only more most some such each very will your what when whom whose learners students'.split(' '));return ivUniq(ivWords(text).map(ivBare).filter(w=>w.length>=5&&!stop.has(w))).slice(0,n)}
// Transition words found in the original Writing sets, grouped by the relationship they show.
const IV_LINKS={cause:['because','since'],result:['therefore','as a result','consequently','thus'],contrast:['but','however','nevertheless','nonetheless','in contrast','by contrast','yet'],addition:['moreover','additionally','in addition','furthermore'],time:['meanwhile','eventually','afterward']};
const IV_LINK_LABEL={cause:'a reason or cause',result:'a result or effect',contrast:'a contrast or surprise',addition:'an added idea',time:'a time relationship'};
const ivLinkKind=w=>Object.keys(IV_LINKS).find(k=>IV_LINKS[k].includes(ivLow(w).trim()))||null;
// Fluency helpers: thought groups come from the " | " marks in the original sentences.
const ivChunks=s=>String(s).split('|').map(x=>x.trim()).filter(Boolean);
function ivSplitVersions(chunks){
 const groups=chunks.map(ivWords),flat=groups.flat(),cuts=[];let n=0;for(let i=0;i<groups.length-1;i++){n+=groups[i].length;cuts.push(n)}
 const make=cs=>{const out=[];let a=0;for(const c of [...cs,flat.length]){out.push(flat.slice(a,c).join(' '));a=c}return out.join(' / ')};
 const ok=make(cuts),vs=[];for(const d of [-1,1,-2,2]){const cs=cuts.map(c=>c+d);if(cs.every((c,i)=>c>0&&c<flat.length&&(i===0||c>cs[i-1])))vs.push(make(cs))}
 return {ok,wrong:ivUniq(vs).filter(v=>v!==ok)}}
function ivInnerWords(chunks){const out=[];chunks.map(ivWords).forEach(ws=>ws.forEach((w,i)=>{if(i<ws.length-1)out.push(ivClean(w))}));return ivUniq(out).filter(w=>w.length>3)}
// Writing helper: which words of the incorrect sentence differ from the correct one (longest common subsequence).
function ivDiff(good,bad){const A=ivWords(good),B=ivWords(bad),a=A.map(ivBare),b=B.map(ivBare),m=a.length,n=b.length;
 const T=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)T[i][j]=a[i]===b[j]?T[i+1][j+1]+1:Math.max(T[i+1][j],T[i][j+1]);
 const keep=new Set();let i=0,j=0;while(i<m&&j<n){if(a[i]===b[j]){keep.add(j);i++;j++}else if(T[i+1][j]>=T[i][j+1])i++;else j++}
 return {A,B,errs:B.map((w,k)=>keep.has(k)?null:k).filter(k=>k!=null),kept:B.map((w,k)=>keep.has(k)?k:null).filter(k=>k!=null),aligned:m===n}}
const ivSyn=y=>y[1]==='antonym'?'an antonym (opposite meaning)':'a synonym (same meaning)';

const IV_BUILD={
 /* Vocabulary Terminal: G.hunt, G.picture, G.context, G.syn, G.morph */
 vo(L,g){const G=L.G[g],W=L.W[g],s=ivHash('vo'+g),H=G.hunt,PI=G.picture,C=G.context,SY=G.syn,M=G.morph;
  const write=(i,list)=>({p:`Write a paragraph of your own about “${W[i][6]}” ${W[i][5]}. Use at least 3 of these words correctly: ${list.join(', ')}.`,u:list,need:3});
  return [
   {s:'Read each clue, then find the hidden word it describes.',t:['Read the topic and the clue first.','Rebuild long words letter by letter.'],w:write(0,ivUniq(H.map(h=>ivLow(h[1])))),
    i:[...H.map((h,j)=>ivMC('Which hidden word matches the clue?',ivLow(h[1]),ivPool(H,j,x=>ivLow(x[1]),h[1],3,s+j),{ctx:`${h[0]} clue: “${h[2]}”`})),
       ...H.map(h=>ivOrd(`Rebuild the hidden word that means “${h[2]}”.`,[...String(h[1]).toUpperCase()],{letters:true,ctx:h[0]}))]},
   {s:'Look at the picture clues and match them to the right word.',t:['Say what each picture shows.','Find the word that links them.'],w:write(1,ivUniq(PI.map(p=>p[1]))),
    i:[...PI.map(p=>ivMC('Which word do the picture clues show?',p[1],p.slice(2),{emoji:p[0]})),
       ...PI.map((p,j)=>ivMC(`Which picture clues match the word “${p[1]}”?`,p[0],ivPool(PI,j,x=>x[0],p[0],3,s+10+j),{emojiOpts:true}))]},
   {s:'Use the words around the highlighted word to unlock its meaning.',t:['Read the whole sentence first.','Try each meaning in the sentence.'],w:write(2,ivUniq(C.map(c=>ivLow(c[1])))),
    i:[...C.map(c=>ivMC(`What does “${c[1]}” mean in this sentence?`,c[2],c.slice(3),{ctx:c[0],mark:c[1]})),
       ...C.map((c,j)=>ivMC('Which word completes the sentence?',c[1],ivPool(C,j,x=>x[1],c[1],3,s+20+j),{ctx:ivBlank(c[0],c[1])}))]},
   {s:'Decide if words share the same meaning or have opposite meanings.',t:['Synonym = same meaning.','Antonym = opposite meaning.'],w:write(3,ivUniq(SY.map(y=>ivLow(y[0])))),
    i:[...SY.map(y=>ivMC(`Which word is ${ivSyn(y)} of “${y[0]}”?`,y[2],y.slice(3))),
       ...SY.map((y,j)=>ivMC(`“${y[2]}” is ${ivSyn(y)} of which word?`,y[0],ivPool(SY,j,x=>x[0],y[0],3,s+30+j)))]},
   {s:'Break long words into parts. Each part carries meaning.',t:['Find the prefix or suffix.','Use its meaning to read the word.'],w:{...write(4,ivUniq(M.map(m=>ivLow(m[0])))),need:2},
    i:[...M.map(m=>ivMC(`What does the word part “${m[1]}” mean in “${m[0]}”?`,m[2],m.slice(3))),
       ...M.map((m,j)=>{const part=ivLow(m[1]).replace(/-/g,'');return ivMC(`Which word has a word part that means “${m[2]}”?`,m[0],ivPool(M,j,x=>ivLow(x[0]).includes(part)?null:x[0],m[0],3,s+40+j))})]}
  ]},
 /* Fluency Junction: F (phrased sentences with tone and pause), R passages for listening */
 fl(L,g){const F=L.F[g],R=L.R[g],W=L.W[g],s=ivHash('fl'+g),ch=F.map(f=>ivChunks(f[0])),plain=ch.map(c=>c.join(' ')),lv=IV_LVL(g),cor=ivCorpus(L,g);
  // Phrase ordering: clue-free tiles; Grades 9–10 split one long group and add 1 decoy, Grades 11–12 split two and add 2 decoys.
  const pulse=(c,j)=>{const pieces=ivFiner(c,lv-1).map(p=>ivTile(p,cor)),pool=ivSeeded(ch.flatMap((x,k)=>k===j?[]:x).map(p=>ivTile(p,cor)),s+60+j);
   return ivOrd(lv===1?'Tap the phrases in order to read the sentence smoothly.':'Tap the word groups in order to read the sentence smoothly.',pieces,{listen:plain[j],full:plain[j],decoys:pool.slice(0,lv-1)})};
  // Echo: Grades 9–12 hear near-miss versions (one phrase swapped with a phrase from another sentence).
  const near=(j,n)=>Array.from({length:n},(_,k)=>{const c=ch[j].slice(),o=ch[(j+1+k)%ch.length],pos=k%2?c.length-1:Math.min(1,c.length-1);c[pos]=o[Math.min(pos,o.length-1)];return c.join(' ')});
  const echo=(p,j)=>{const nm=near(j,lv-1);return ivMC('Press 🔊 Listen. Which sentence did you hear?',p,[...nm,...ivPool(plain,j,x=>x,p,3-nm.length,s+j)],{listen:p,hide:true})};
  const linkers=ivUniq(F.map(f=>ivBare(ivWords(String(f[0]).replace(/^[“"]/,''))[0]||''))).filter(w=>['after','although','when','because','despite','while','though','since','before','unless','until'].includes(w));
  const link=linkers.length>=2?linkers:ivUniq([...linkers,'because','although','when']);
  const write=i=>({p:`Write a paragraph about “${W[i][6]}” ${W[i][5]}. Then read it aloud in smooth phrases. Begin at least 2 sentences with linking words such as: ${link.join(', ')}.`,u:link,need:2});
  const pause=(f,j)=>{const tip=String(f[4]).trim(),word=(tip.match(/[“"](.+?)[”"]/)||[])[1]||'',inner=ivInnerWords(ch[j]).filter(w=>!ivLow(word).split(/\s+/).includes(ivLow(w)));
   if(/^stress/i.test(tip))return ivMC('Which word or words should get extra stress when you read this aloud?',word,ivSeeded(inner,s+20+j).slice(0,3),{ctx:plain[j],listen:plain[j]});
   return ivMC('Where is the best place to pause?',ivCap(tip),ivSeeded(inner,s+20+j).slice(0,3).map(w=>`Pause after “${w}”`),{ctx:plain[j],listen:plain[j]})};
  const pause2=(c,j)=>{const last=ivClean(ivWords(c[1]).slice(-1)[0]);return ivMC('After the first pause, where should you pause next?',`Pause after “${last}”`,ivSeeded(ivInnerWords(c),s+50+j).filter(w=>ivLow(w)!==ivLow(last)).slice(0,3).map(w=>`Pause after “${w}”`),{ctx:plain[j],listen:plain[j]})};
  const spans=c=>{const w0=ivWords(c[0]),w1=ivWords(c[1]),w2=ivWords(c[2]||'');return ivUniq([[...w0.slice(-2),...w1.slice(0,1)].join(' '),[...w1.slice(-1),...w2.slice(0,2)].join(' '),[...w0.slice(-1),...w1.slice(0,2)].join(' ')]).filter(x=>x!==c[1])};
  return [
   {s:'Read in thought groups, not word by word.',t:['Words that belong together go together.','Press Listen to hear a model.'],w:write(0),
    i:[...ch.map(pulse),
       ...ch.map((c,j)=>{const v=ivSplitVersions(c);return ivMC('Which version is split into thought groups correctly?',v.ok,v.wrong.slice(0,3),{listen:plain[j]})})]},
   {s:'Listen carefully, like an echo. Then choose what you heard.',t:['Listen once for the whole idea.','Listen again for details.'],w:write(1),
    i:[...plain.map(echo),
       ...R.map((r,j)=>ivMC('Press 🔊 Listen to the passage. Which detail did you hear?',r[7],[r[8],...ivPool(R,j,x=>x[7],r[7],2,s+10+j)],{listen:r[1],hide:true,ptitle:r[0]}))]},
   {s:'Good readers pause at the end of each thought group.',t:['Pause where a thought ends.','Do not stop in the middle of a phrase.'],w:write(2),
    i:[...F.map(pause),...ch.map(pause2)]},
   {s:'Your voice should match the feeling of the sentence.',t:['Ask: how does the speaker feel?','Match your voice to that feeling.'],w:write(3),
    i:[...F.map((f,j)=>ivMC('Which tone of voice fits this sentence best?',f[1],[f[2],f[3]],{ctx:plain[j],listen:plain[j]})),
       ...F.map((f,j)=>ivMC(`Which sentence should be read in a “${f[1]}” voice?`,plain[j],ivPool(F,j,(x,k)=>ivLow(x[1])===ivLow(f[1])?null:plain[k],plain[j],3,s+30+j)))]},
   {s:'Read like an actor: keep each phrase together.',t:['A phrase is a group that means one thing.','Read the whole phrase in one breath.'],w:write(4),
    i:[...ch.map((c,j)=>ivMC('Which group of words should be read together as one phrase?',c[1],spans(c),{ctx:plain[j],listen:plain[j]})),
       ...ch.map((c,j)=>ivMC('Which phrase completes the sentence?',c[c.length-1],ivPool(ch,j,x=>x[x.length-1],c[c.length-1],3,s+40+j),{ctx:[...c.slice(0,-1),'_____'].join(' ')}))]}
  ]},
 /* Inference Station: I = [clue, inference, wrong, wrong, evidence, prediction, trait, reasoning] */
 in(L,g){const I=L.I[g],s=ivHash('in'+g);
  const write=i=>({p:`Read the clue: “${I[i][0]}” Write a paragraph that states what you can infer, gives the evidence from the clue, and predicts what may happen next.`,src:I[i][0],k:ivKeyWords(I[i][1]+' '+I[i][5],4),e:1});
  return [
   {s:'Be a detective: use the clue to work out what is not said.',t:['Find the clue words.','Pick the idea ALL the clues support.'],w:write(0),
    i:[...I.map(x=>ivMC('What can you infer from the clue?',x[1],[x[2],x[3]],{ctx:x[0]})),
       ...I.map((x,j)=>ivMC('Which clue best supports this inference?',x[0],ivPool(I,j,y=>y[0],x[0],3,s+j),{ctx:`Inference: ${x[1]}`}))]},
   {s:'Use the clue to predict what will happen next.',t:['A good prediction follows the clue.','Clue → inference → prediction.'],w:write(1),
    i:[...I.map((x,j)=>ivMC('What will most likely happen next?',x[5],[x[3],...ivPool(I,j,y=>y[5],x[5],2,s+10+j)],{ctx:x[0]})),
       ...I.map(x=>ivOrd('Tap the cards in order: clue → inference → prediction.',[x[0],x[1],x[5]]))]},
   {s:'Read the actions to find out how a person feels or what they are like.',t:['Actions show character.','Ask why the person acted that way.'],w:write(2),
    i:[...I.map((x,j)=>ivMC('Which word best describes the person or group?',x[6],ivPool(I,j,y=>y[6],x[6],3,s+20+j),{ctx:x[0]})),
       ...I.map((x,j)=>ivMC('Which sentence best explains the reasoning?',x[7],ivPool(I,j,y=>y[7],x[7],3,s+30+j),{ctx:`${x[0]} → ${x[1]}`}))]},
   {s:'Connect each conclusion to evidence. Evidence is what the text actually says.',t:['Evidence = what the text says.','Inference = what you figure out.'],w:write(3),
    i:[...I.map(x=>ivMC('Which sentence states the EVIDENCE (what the text says), not an inference?',x[4],[x[1],x[5],x[7]],{ctx:x[0]})),
       ...I.map(x=>ivMC('Which conclusion is NOT supported by the clue?',x[2],[x[1],x[4],x[5]],{ctx:x[0]}))]},
   {s:'One event leads to another, like falling dominoes.',t:['Find what happened first.','Then follow each effect.'],w:write(4),
    i:[...I.map((x,j)=>ivMC('Which event most likely led to this result?',x[0],ivPool(I,j,y=>y[0],x[0],3,s+40+j),{ctx:`Result: ${x[5]}`})),
       ...I.map(x=>ivOrd('Tap the dominoes in order: what happened → what it shows → what may follow → why it matters.',[x[0],x[1],x[5],x[7]]))]}
  ]},
 /* Comprehension Crossing: R = [title, passage, event1, event2, event3, lesson, summary, detail, unsupported claim] */
 co(L,g){const R=L.R[g],s=ivHash('co'+g),pass=r=>({title:r[0],text:r[1]});
  const write=i=>({p:`Write a summary of “${R[i][0]}” in your own words. State the main idea, then tell the key events in order.`,src:R[i][1],k:ivKeyWords(R[i][6],4),u:['first|began|at first','then|next|after|later','finally|in the end|last|lastly'],need:2});
  return [
   {s:'Explore the passage. Answer only from what it says.',t:['Read the whole passage first.','Check each choice against the text.'],w:write(0),
    i:[...R.map((r,j)=>ivMC('According to the passage, which statement is true?',r[7],[r[8],...ivPool(R,j,x=>x[7],r[7],2,s+j)],{passage:pass(r)})),
       ...R.map((r,j)=>ivMC('Which title fits this passage best?',r[0],ivPool(R,j,x=>x[0],r[0],3,s+10+j),{passage:{...pass(r),noTitle:true}}))]},
   {s:'Put events on the timeline in the order they happened.',t:['Look for time words.','First, next, last.'],w:write(1),
    i:[...R.map(r=>ivOrd('Tap the events in the order they happened.',[r[2],r[3],r[4]],{passage:pass(r)})),
       ...R.map((r,j)=>j%2?ivMC('Which event happened LAST?',r[4],[r[2],r[3]],{passage:pass(r)}):ivMC('Which event happened FIRST?',r[2],[r[3],r[4]],{passage:pass(r)}))]},
   {s:'The main idea is what the whole passage is mostly about.',t:['Main idea covers the whole text.','A detail tells about one part.'],w:write(2),
    i:[...R.map((r,j)=>ivMC('What lesson or main idea does the passage teach?',r[5],ivPool(R,j,x=>x[5],r[5],3,s+20+j),{passage:pass(r)})),
       ...R.map(r=>ivMC('Which sentence is a supporting DETAIL, not the main idea?',r[7],[r[5],r[6]],{passage:pass(r)}))]},
   {s:'Stamp each claim: is it supported by the passage or not?',t:['Supported = the passage says it.','Not supported = it goes beyond the text.'],w:write(3),
    i:[...R.map((r,j)=>ivMC('Stamp this claim. Is it supported by the passage?',j%2?'Not supported by the passage':'Supported by the passage',['Supported by the passage','Not supported by the passage'],{passage:pass(r),ctx:`Claim: ${j%2?r[8]:r[7]}`})),
       ...R.map((r,j)=>ivMC('Stamp this claim. Is it supported by the passage?',j%2?'Supported by the passage':'Not supported by the passage',['Supported by the passage','Not supported by the passage'],{passage:pass(r),ctx:`Claim: ${j%2?r[7]:r[8]}`}))]},
   {s:'Squeeze the passage into its most important idea.',t:['A summary is short and complete.','Leave out small details.'],w:write(4),
    i:[...R.map(r=>ivMC('Which is the best one-sentence summary?',r[6],[r[7],r[2],r[8]],{passage:pass(r)})),
       ...R.map(r=>ivOrd('Build a summary: tap the events in order, then the lesson last.',[r[2],r[3],r[4],r[5]],{passage:pass(r)}))]}
  ]},
 /* Critical Depot (Writing): W = [correct sentence, incorrect sentence, transition sentence, transition, 3-sentence paragraph, picture clues, topic] */
 cr(L,g){const W=L.W[g],s=ivHash('cr'+g),all=[7,8,9,10,11,12].flatMap(n=>(L.W[n]||[]).map(w=>w[3]));
  const links=ivUniq(W.map(w=>w[3]));
  const write=i=>({p:`Compose a paragraph about “${W[i][6]}” ${W[i][5]}. Use at least one transition such as “${W[i][3]}”, and arrange your ideas in a clear order.`,u:links,need:1,k:ivKeyWords(W[i][4],3)});
  const proof=w=>{const d=ivDiff(w[0],w[1]);if(!d.errs.length)return ivMC('Which sentence is written correctly?',w[0],[w[1]]);
   const err=ivClean(d.B[d.errs[0]]),ok=ivSeeded(d.kept.map(k=>ivClean(d.B[k])).filter(x=>x.length>3&&ivLow(x)!==ivLow(err)),ivHash(w[1])).slice(0,3);
   return ivMC('Which word in this sentence is used incorrectly?',err,ok,{ctx:w[1]})};
  const fixed=w=>{const d=ivDiff(w[0],w[1]),opts=[w[1]];if(d.aligned&&d.errs.length>1){const B=d.B.slice();B[d.errs[0]]=d.A[d.errs[0]];opts.push(B.join(' '))}return ivMC('Choose the corrected sentence.',w[0],opts)};
  const bridge=w=>{const kind=ivLinkKind(w[3]);return ivMC('Which transition completes the sentence?',w[3],ivSeeded(ivUniq(all).filter(x=>ivLow(x)!==ivLow(w[3])&&ivLinkKind(x)!==kind),ivHash(w[2])).slice(0,3),{ctx:w[2]})};
  const relation=w=>{const kind=ivLinkKind(w[3]);if(!kind)return bridge(w);return ivMC(`What relationship does “${w[3]}” show in this sentence?`,IV_LINK_LABEL[kind],ivSeeded(Object.keys(IV_LINK_LABEL).filter(k=>k!==kind).map(k=>IV_LINK_LABEL[k]),ivHash(w[3]+g)).slice(0,3),{ctx:w[2].replace('___',w[3]),mark:w[3]})};
  return [
   {s:'Catch the falling words and build a correct sentence.',t:['Start with who or what.','Then add the action.'],w:write(0),
    i:[...W.map(w=>{const d=ivDiff(w[0],w[1]),lv=IV_LVL(g),cor=ivCorpus(L,g);
       return ivOrd('Tap the words in order to build a correct sentence.',ivWords(w[0]).map(x=>ivTile(x,cor)),{full:w[0],decoys:d.errs.map(k=>ivTile(d.B[k],cor)).slice(0,lv)})}),
       ...W.map(w=>ivMC('Which sentence is written correctly?',w[0],[w[1]]))]},
   {s:'You are the proofreader. Find and fix the errors.',t:['Check subject-verb agreement.','Check word forms (-s, -ed, -ly).'],w:write(1),
    i:[...W.map(proof),...W.map(fixed)]},
   {s:'Transitions are bridges that join ideas.',t:['Ask how the two ideas connect.','Result, contrast, or added idea?'],w:write(2),
    i:[...W.map(bridge),...W.map(relation)]},
   {s:'Build the paragraph tower one sentence at a time.',t:['Start with what happened first.','End with the result.'],w:write(3),
    i:[...W.map(w=>ivOrd('Tap the sentences in order to build the paragraph.',ivSents(w[4]))),
       ...W.map((w,j)=>ivMC('Which topic does this paragraph develop?',w[6],ivPool(W,j,x=>x[6],w[6],3,s+j),{ctx:w[4]}))]},
   {s:'Plan your story: topic first, then a strong opening sentence.',t:['Picture clues point to a topic.','A good opening names the topic.'],w:write(4),
    i:[...W.map((w,j)=>ivMC('Which topic do these picture clues suggest?',w[6],ivPool(W,j,x=>x[6],w[6],3,s+10+j),{emoji:w[5]})),
       ...W.map((w,j)=>ivMC(`Which sentence would best open a paragraph about “${w[6]}”?`,w[0],ivPool(W,j,x=>x[0],w[0],3,s+20+j)))]}
  ]}
};

/* ---------- Task page: one large activity board over the painted frame ---------- */
const IV_FRAME=[414,244,1244,550]; // the activity board: as large as the painted page allows (owl, plaques and games bar stay visible)
const IV_ATT_STARS=[1434,1491,1548.7],IV_ATT_Y=433,IV_ATT_R=25; // the three painted star slots on the Attempts plaque
let ivFlu=null;
function ivWallet(){if(!globalThis.ReadwyHintCredits)return null;const u=(typeof user!=='undefined'&&user)||null;return globalThis.ReadwyHintCredits.createWallet(globalThis.localStorage,u?(u.id||u.lrn||u.email||u.name||'local'):'local')}
function ivMarkText(text,word){const e=ivEsc(text);if(!word)return e;return e.replace(new RegExp('\\b('+ivRx(ivEsc(word))+')\\b','i'),'<mark>$1</mark>')}
// Largest font size (binary search) at which the content still fits its box without scrolling.
// The box's scrollbar is hidden while measuring (a scrollbar narrows the content and makes the result unstable),
// and the final size keeps a small safety margin.
function ivFitBox(box,inner,min,max){if(!box||!inner)return;const ov=box.style.overflow;box.style.overflow='hidden';
 const fits=()=>box.scrollHeight<=box.clientHeight&&box.scrollWidth<=box.clientWidth;
 let lo=min,hi=Math.max(min,max),best=min;for(let n=0;n<11;n++){const mid=(lo+hi)/2;inner.style.fontSize=mid+'px';if(fits()){best=mid;lo=mid}else hi=mid}
 best=Math.max(min,best*.97);inner.style.fontSize=best+'px';while(!fits()&&best>min){best*=.95;inner.style.fontSize=best+'px'}
 box.style.overflow=ov}
function ivFitFrame(frame,qMax=.085,pMax=.05){const h=frame.clientHeight||400;ivFitBox(frame.querySelector('.ivx-q'),frame.querySelector('.ivx-qin'),9,h*qMax);ivFitBox(frame.querySelector('.ivx-pass'),frame.querySelector('.ivx-ptext'),10,h*pMax)}
function ivAttemptStars(n,label){return IV_ATT_STARS.slice(0,Math.max(0,Math.min(3,n))).map(x=>ivStar(x,IV_ATT_Y,IV_ATT_R)).join('')+`<text class="ivp-ink" x="1491" y="489" font-size="32" text-anchor="middle">${ivEsc(label)}</text>`}
/* Bottom games bar: InterV Games, the six painted games, and the Bonus Game (Playlab) added at the right end of the same bar. */
function ivOpenPlaylab(P,after){const wallet=ivWallet();if(!globalThis.ReadwyPlaylab||!wallet){P.bubble('The Bonus Game is not available right now.');return}
 globalThis.ReadwyPlaylab.open({wallet,onReturn:()=>{if(!P.board.isConnected)return;ivBarBadge(P);P.bubble(`You have ${wallet.balance()} hint credit${wallet.balance()===1?'':'s'}. Use them for hints!`);after?.()}})}
function ivBarBadge(P){const b=P.board.querySelector('.ivbar-badge');if(b){const w=ivWallet();b.textContent=w?w.balance():0}}
/* InterV games toolbar: drawn over the painted games pill in the same navy-and-gold style, with every game in one
   row of equal slots. All games live here (InterV Games hub, the five arcade games, this station's games, Bonus Game). */
const IV_BAR=[16,795,1282,138];
function ivGamesBar(P,back){
 P.board.querySelector('.ivbar')?.remove();
 const bar=P.layer('ivbar',IV_BAR),w=ivWallet(),st=IV_ST[ivLast.st]?ivLast.st:'fl';
 const items=[['hub','🎮','InterV Games',()=>renderIntervGames()],['puzzle','🧩','Word Puzzle',()=>renderIvWordPuzzle()],['memory','🃏','Memory Match',()=>renderIvMemory()],['race','🏁','Reading Race',()=>renderIvReadingRace()],
  ['spinner','🎡','Word Spinner',()=>renderIvSpinner()],['challenge','🏆','Challenge',()=>renderIvChallenge()],['bonus','🎁','Bonus Game',null]];
 bar.innerHTML=`<nav class="ivbar-in" aria-label="InterV games">${items.map(([k,ic,n])=>`<button type="button" class="ivbar-b${k==='hub'?' hub':''}${k==='bonus'?' bonus':''}" data-k="${k}"><span class="ivbar-ic">${ic}</span><span class="ivbar-t">${n}</span>${k==='bonus'?`<i class="ivbar-badge" title="Bonus credits">${w?w.balance():0}</i>`:''}</button>`).join('')}</nav>`;
 bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const it=items.find(x=>x[0]===b.dataset.k);if(!it)return;
  if(it[0]==='bonus')return ivOpenPlaylab(P);ivGamesBack=back;it[3]()});
}
/* ---------- Station tasks as arcade games (ARAL arcade style, InterV instructional level) ----------
   Every one of the 25 tasks uses a different arcade game from the shared READwy game library (ARAL_GAME_RUN),
   fed only with the task's original InterV content. Difficulty is set for instructional-level readers — above ARAL
   (frustration level), below Reading Lab (independent level) — and rises with the grade:
   Grades 7–8 need 7 correct, 9–10 need 8, 11–12 need 9 (ARAL needs 6); four answer choices instead of three;
   more words and rounds at higher grades. ARAL's own games are not changed: InterV runs tuned copies of them. */
const IV_ARCADE={
 vo:['hangman','memory','wordle','domino','bullseye'],
 fl:['sprint','quiz','crossing','ttt','connect4'],
 co:['board','whack','blaster','bomb','bingo'],
 in:['dig','race','beadwheel','fishing','slice'],
 cr:['tower','slide','snake','balloon','typerush']};
// Plain, short "how to play" steps for every game (shown on the start card and under ❓).
const IV_HOW={
 hangman:['Read the clue.','Tap letters to spell the word.','A wrong letter pops a balloon.'],
 memory:['Tap two cards to flip them.','Find the two cards that go together.','Match every pair to win.'],
 wordle:['Read the clue.','Type a word and press ENTER.','Green = right letter, right spot. Yellow = right letter, wrong spot.'],
 domino:['Read the word at the top.','Tap the domino that shows its meaning.'],
 bullseye:['Read the question.','The arrow swings. Tap (or press Space) when it points at the right answer.'],
 sprint:['Read all the floating phrases.','Tap them in the order you would read them.','A wrong tap costs a heart.'],
 quiz:['Press 🔊 to hear the sentence.','Tap the sentence you heard.','Each right answer climbs one rung.'],
 crossing:['Read the sentence at the top.','Tap a tile in the next row up: only words where you PAUSE are safe.','Reach the top row to clear the round.'],
 ttt:['Answer the question at the top.','Right answer? Tap an empty square to place your ✕.','Get 3 ✕ in a row before the Owl does.'],
 connect4:['Answer the question at the top.','Right answer? Tap a column to drop your disc.','Get 4 discs in a row before the Owl does.'],
 board:['Read the passage on the left.','Answer the question to roll the die.','Reach square 20 to win.'],
 whack:['Read the question.','Tap the mole holding the right answer.'],
 blaster:['Read the question.','Move your ship under the rock with the right answer and tap to shoot.'],
 bomb:['Read the claim and the passage.','Tap the right stamp before the fuse burns out.'],
 bingo:['Read the question that is called.','Tap its answer on your card.','Get 3 in a row for BINGO!'],
 dig:['Answer the question to earn a shovel.','Tap a square to dig.','🔥 = very close, 🌡️ = near, ❄️ = far.'],
 race:['Read the clue and the question.','Tap the right answer to move your car.','Reach the finish before the Owl.'],
 beadwheel:['Read the clue.','Tap the letters on the wheel in order to spell the word.'],
 fishing:['Move the boat over a fish.','Tap to drop the hook.','Hook only fish that carry EVIDENCE.'],
 slice:['Drag your finger or mouse across a card to slice it.','Slice only the SUPPORTED conclusions.'],
 tower:['Tap the word that comes first.','Keep tapping in sentence order to build the tower.'],
 slide:['Read which word to fix.','Tap a tile next to the empty space to slide it.','Spell the corrected word.'],
 snake:['Use the arrow keys or swipe to steer.','Eat only the transitions named at the top.'],
 balloon:['Read the question.','Pop the balloon with the right answer.'],
 typerush:['Words fall from the top.','Type a word exactly and press ENTER before it lands.']};
// One worked example per game, built from the same task's content for a neighbouring grade (so it never gives away an answer).
/* ---------- "Watch how to play": a live mini replica of each game that plays itself ----------
   Built from the same task's content for a neighbouring grade (never the learner's own answers). A hand cursor
   performs the correct moves step by step, then the demo loops. */
const IV_DEMO={};let ivDemoN=0;
const ivCut=(s,n)=>{s=String(s);return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s};
function ivDemoQ(kind,X){const d=X.d;
 if(kind==='domino'&&d.pairs?.length){const p=d.pairs[0];return {q:`What does “${p[0]}” mean?`,ok:p[1],bad:d.pairs.slice(1,3).map(x=>x[1]),word:p[0]}}
 const q=(d.qs||[])[0];return q?{q:q.q,ok:q.ok,bad:q.bad.slice(0,2)}:null}
function ivDemoMake(kind,X){
 const id='d'+(++ivDemoN),e=s=>ivEsc(s),d=X.d,r0=X.rounds?.[0]||{};let html='',run=null;
 const MC=['quiz','ttt','connect4','board','whack','blaster','bomb','bingo','dig','race','balloon','bullseye','domino'];
 if(MC.includes(kind)){const Q=ivDemoQ(kind,X);if(!Q)return '';const hasSide=!['whack','balloon','blaster'].includes(kind);
  const opts=[Q.bad[0],Q.ok,Q.bad[1]].filter(x=>x!=null).map(o=>`<b class="dm-o"${o===Q.ok?' data-ok':''}>${e(ivCut(o,hasSide?34:46))}</b>`).join('');
  const side={quiz:`<div class="dm-ladder"><i>4</i><i>3</i><i>2</i><i class="dm-r1">1</i></div>`,
   ttt:`<div class="dm-ttt"><i>✕</i><i></i><i>◯</i><i></i><i>✕</i><i></i><i>◯</i><i></i><i class="dm-t"></i></div>`,
   connect4:`<div class="dm-c4">${'<i></i>'.repeat(8)}<i class="o"></i><i></i><i class="r"></i><i class="o"></i></div><div class="dm-c4col"></div>`,
   board:`<div class="dm-board">${[1,2,3,4,5,6].map(n=>`<i>${n}</i>`).join('')}<span class="dm-tok">🔵</span><span class="dm-die">🎲</span></div>`,
   bomb:`<div class="dm-bomb">💣<div class="dm-fuse"><i></i></div></div>`,
   bingo:`<div class="dm-bingo">${[Q.bad[0],'★',Q.ok,'★',Q.bad[1],'★'].map((x,i)=>`<i${x===Q.ok?' class="dm-cell"':''}>${e(ivCut(x||'★',14))}</i>`).join('')}</div>`,
   dig:`<div class="dm-dig">${'<i></i>'.repeat(5)}<i class="dm-spot"></i>${'<i></i>'.repeat(2)}</div>`,
   race:`<div class="dm-race"><div><span class="dm-car">🏎️</span></div><div><span>🦉</span></div></div>`,
   bullseye:`<div class="dm-target"><span class="dm-arrow">➶</span></div>`,
   domino:`<div class="dm-chain"><i>⚀ ⚃</i><i class="dm-new">${e(ivCut(Q.word||'',12))}</i></div>`}[kind]||'';
  html=`${side?`<div class="dm-side">${side}</div>`:''}<div class="dm-main"><p class="dm-q">${e(ivCut(Q.q,side?80:110))}</p><div class="dm-opts">${opts}</div>${kind==='blaster'?'<span class="dm-ship">🚀</span>':''}</div>`;
  run=async({$,tap,wait,st})=>{await wait(600);const ok=$('.dm-o[data-ok]');
   if(kind==='blaster'){const sh=$('.dm-ship'),r=ok.getBoundingClientRect(),m=$('.dm-main').getBoundingClientRect();await tap(ok);sh.style.left=(r.left-m.left+r.width/2)+'px';await wait(500);st.classList.add('dm-zap');ok.classList.add('ok','boom');return}
   await tap(ok);ok.classList.add('ok');await wait(450);
   const reward={quiz:()=>$('.dm-r1').classList.add('lit'),ttt:async()=>{await tap($('.dm-t'));$('.dm-t').textContent='✕';$('.dm-ttt').classList.add('win')},
    connect4:async()=>{await tap($('.dm-c4col'));st.classList.add('dm-drop')},board:()=>st.classList.add('dm-roll'),whack:()=>ok.classList.add('boom'),balloon:()=>ok.classList.add('boom'),
    bomb:()=>st.classList.add('dm-defuse'),bingo:async()=>{await tap($('.dm-cell'));$('.dm-cell').classList.add('ok')},dig:async()=>{await tap($('.dm-spot'));$('.dm-spot').classList.add('ok')},
    race:()=>st.classList.add('dm-go'),bullseye:()=>st.classList.add('dm-shoot'),domino:()=>st.classList.add('dm-link')}[kind];
   await reward?.()}}
 else if(kind==='sprint'||kind==='tower'){const items=(kind==='sprint'?r0.items:r0.order?.items)||[];if(!items.length)return '';const list=items.slice(0,6),sh=ivSeeded(list.map((t,i)=>({t,i})),11);
  html=kind==='sprint'?`<p class="dm-q">Tap the phrases in reading order.</p><div class="dm-float">${sh.map((x,k)=>`<b class="dm-chip" data-i="${x.i}" style="--k:${k}">${e(ivCut(x.t,26))}</b>`).join('')}</div><div class="dm-rail">🚂</div>`
   :`<p class="dm-q">Tap the words in sentence order.</p><div class="dm-tw"><div class="dm-pile">${sh.map(x=>`<b class="dm-chip" data-i="${x.i}">${e(x.t)}</b>`).join('')}</div><div class="dm-stack"></div></div>`;
  run=async({$,tap,wait})=>{await wait(500);for(let i=0;i<list.length;i++){const c=$(`.dm-chip[data-i="${i}"]`);await tap(c);c.classList.add('ok');await wait(200);const b=document.createElement('b');b.textContent=c.textContent;b.className='dm-in';(kind==='sprint'?$('.dm-rail'):$('.dm-stack')).append(b);c.classList.add('gone')}}}
 else if(['hangman','wordle','beadwheel','slide','typerush'].includes(kind)){
  const s=kind==='slide'?{w:r0.word,clue:r0.clue}:kind==='typerush'?{w:(d.good||[])[0],clue:'Type the falling word, then press ENTER.'}:(kind==='wordle'?d.wordle:d.singles)?.[0];if(!s?.w)return '';
  const W=String(s.w).toUpperCase().slice(0,10),letters=[...W];
  if(kind==='typerush'){html=`<p class="dm-q">${e(s.clue)}</p><div class="dm-sky"><b class="dm-fall">${e(s.w)}</b></div><div class="dm-type"><span></span><i>ENTER</i></div>`;
   run=async({$,wait,tap})=>{await wait(900);const box=$('.dm-type span');for(const ch of String(s.w)){box.textContent+=ch;await wait(120)}await tap($('.dm-type i'));$('.dm-fall').classList.add('boom')}}
  else if(kind==='beadwheel'){html=`<p class="dm-q">${e(ivCut(s.clue,90))}</p><div class="dm-wheel">${ivSeeded(letters.map((c,i)=>({c,i})),5).map((x,k,a)=>`<b class="dm-bead" data-i="${x.i}" style="--a:${k*360/a.length}deg">${x.c}</b>`).join('')}</div><div class="dm-neck"></div>`;
   run=async({$,tap,wait})=>{await wait(500);for(let i=0;i<letters.length;i++){const b=$(`.dm-bead[data-i="${i}"]`);await tap(b);b.classList.add('gone');$('.dm-neck').textContent+=letters[i]}}}
  else{const keys=kind==='slide'?ivSeeded(letters.map((c,i)=>({c,i})),3):[...new Set(ivSeeded([...letters,...'AEIRST'.split('').filter(c=>!letters.includes(c)).slice(0,3)],9))].map(c=>({c}));
   html=`<p class="dm-q">${e(ivCut(s.clue,90))}</p>${kind==='hangman'?'<div class="dm-ball">🎈🎈🎈🎈</div>':''}<div class="dm-slots${kind==='wordle'?' dm-wrow':''}">${letters.map(()=>'<i></i>').join('')}</div><div class="dm-keys">${keys.map(k=>`<b class="dm-key" data-c="${k.c}"${k.i!=null?` data-i="${k.i}"`:''}>${k.c}</b>`).join('')}${kind==='wordle'?'<b class="dm-key dm-enter">ENTER</b>':''}</div>`;
   run=async({$,$$,tap,wait,st})=>{await wait(500);const slots=$$('.dm-slots i');
    if(kind==='hangman'){for(const c of [...new Set(letters)]){const k=$(`.dm-key[data-c="${c}"]`);await tap(k);k.classList.add('ok');letters.forEach((x,i)=>{if(x===c)slots[i].textContent=c})}return}
    for(let i=0;i<letters.length;i++){const k=kind==='slide'?$(`.dm-key[data-i="${i}"]`):$(`.dm-key[data-c="${letters[i]}"]`);await tap(k);if(kind==='slide')k.classList.add('gone');else k.classList.add('ok');slots[i].textContent=letters[i];slots[i].classList.add('in')}
    if(kind==='wordle'){await tap($('.dm-enter'));st.classList.add('dm-green')}}}}
 else if(kind==='memory'){const pairs=(d.pairs||[]).slice(0,3);if(pairs.length<2)return '';const cards=ivSeeded(pairs.flatMap((p,k)=>[{t:p[0],k},{t:p[1],k}]),4);
  html=`<p class="dm-q">Flip two cards. Find the ones that go together.</p><div class="dm-mem">${cards.map((c,i)=>`<b class="dm-card" data-k="${c.k}" data-n="${i}"><span>${e(ivCut(c.t,16))}</span></b>`).join('')}</div>`;
  run=async({$$,tap,wait})=>{await wait(500);for(const k of [0,1]){for(const c of $$(`.dm-card[data-k="${k}"]`)){await tap(c);c.classList.add('up')}await wait(300);$$(`.dm-card[data-k="${k}"]`).forEach(c=>c.classList.add('ok'))}}}
 else if(['fishing','slice','snake','crossing'].includes(kind)){
  const good=(kind==='crossing'?r0.good:d.good)||[],bad=(kind==='crossing'?r0.bad:d.bad)||[];if(!good.length||!bad.length)return '';
  const what=kind==='crossing'?'Step only on the words where you PAUSE.':`Only: ${d.what||'the right ones'}`;
  if(kind==='crossing'){const rows=[0,1,2].map(r=>{const g=good[r%good.length],bs=ivSeeded(bad,r+2).slice(0,2);return ivSeeded([{t:g,ok:1},...bs.map(t=>({t}))],r+7)});
   html=`<p class="dm-q">${e(ivCut(r0.what||what,110))}</p><div class="dm-cross">${rows.slice().reverse().map((row,ri)=>row.map(c=>`<b class="dm-tile"${c.ok?` data-r="${2-ri}"`:''}>${e(ivCut(c.t,14))}</b>`).join('')).join('')}</div>`;
   run=async({$,tap,wait})=>{await wait(500);for(const r of [0,1,2]){const t=$(`.dm-tile[data-r="${r}"]`);await tap(t);t.classList.add('ok');t.textContent='🦉 '+t.textContent}}}
  else{const items=[{t:good[0],ok:1},{t:bad[0]},{t:good[1]||good[0],ok:1}];
   html=`<p class="dm-q">${e(ivCut(what,90))}</p><div class="dm-sea dm-${kind}">${kind==='fishing'?'<span class="dm-boat">🚣</span><i class="dm-line"></i>':''}${kind==='snake'?'<span class="dm-snk">🐍</span>':''}${items.map((x,i)=>`<b class="dm-fish" style="--k:${i}"${x.ok?' data-ok':''}>${e(ivCut(x.t,34))}</b>`).join('')}</div>`;
   run=async({$,$$,tap,wait,st})=>{await wait(500);const sea=$('.dm-sea');for(const f of $$('.dm-fish[data-ok]')){f.classList.add('hold');await wait(150);
    if(kind==='snake'){const s=$('.dm-snk'),a=sea.getBoundingClientRect(),r=f.getBoundingClientRect();s.style.left=(r.left-a.left)+'px';s.style.top=(r.top-a.top)+'px';await wait(700)}
    else if(kind==='fishing'){const a=sea.getBoundingClientRect(),r=f.getBoundingClientRect();$('.dm-boat').style.left=$('.dm-line').style.left=(r.left-a.left+r.width/2)+'px';await tap(f);$('.dm-line').style.height=(r.top-a.top)+'px';await wait(450)}
    else await tap(f);
    f.classList.add('ok',kind==='slice'?'cut':'caught');await wait(300)}
    $('.dm-fish:not([data-ok])').classList.add('skip')}}}
 if(!run)return '';IV_DEMO[id]=run;
 return `<div class="ivdm ivdm-${kind}" data-demo="${id}"><div class="ivdm-st">${html}</div><i class="ivdm-hand" aria-hidden="true">👆</i></div>`}
function ivDemoStart(root){root?.querySelectorAll('.ivdm:not(.on)').forEach(box=>{box.classList.add('on');const fn=IV_DEMO[box.dataset.demo];if(!fn)return;
 const st=box.querySelector('.ivdm-st'),tpl=st.innerHTML,hand=box.querySelector('.ivdm-hand');
 const wait=ms=>new Promise((res,rej)=>setTimeout(()=>box.isConnected?res():rej('gone'),ms));
 const tap=async el=>{if(!el)return;const b=box.getBoundingClientRect(),r=el.getBoundingClientRect(),k=box.offsetWidth?b.width/box.offsetWidth:1;hand.classList.add('show');hand.style.left=((r.left-b.left+r.width*.5)/k)+'px';hand.style.top=((r.top-b.top+r.height*.5)/k)+'px';await wait(620);hand.classList.add('press');el.classList.add('dm-hit');await wait(200);hand.classList.remove('press')};
 const $=s=>st.querySelector(s),$$=s=>[...st.querySelectorAll(s)];
 (async()=>{try{for(;;){st.innerHTML=tpl;st.className='ivdm-st';hand.classList.remove('show');await wait(400);await fn({$,$$,tap,wait,st,hand});await wait(1800)}}catch(e){}})()})}
function ivExample(kind,X){const d=X.d,r0=X.rounds?.[0]||{},e=ivEsc,q=(d.qs||[])[0];
 const pick=a=>a&&a.length?a[0]:null,arrow=' <i>→</i> ';
 switch(kind){
  case 'hangman':case 'beadwheel':{const s=pick(d.singles);return s?`Clue: “${e(s.clue)}”${arrow}<b>${e(s.w)}</b>`:''}
  case 'wordle':{const s=pick(d.wordle);return s?`Clue: “${e(s.clue)}”${arrow}<b>${e(s.w)}</b>`:''}
  case 'memory':{const p=pick(d.pairs);return p?`<b>${e(p[0])}</b> goes with <b>${e(p[1])}</b>`:''}
  case 'domino':{const p=pick(d.pairs);return p?`<b>${e(p[0])}</b>${arrow}${e(p[1])}`:''}
  case 'sprint':{const it=r0.items||[];return it.length?`${ivSeeded(it,7).map(x=>`<kbd class="ivarc-chip">${e(x)}</kbd>`).join(' ')}${arrow}<b>${e(it.join(' / '))}</b>`:''}
  case 'tower':{const it=r0.order?.items||[];return it.length?`${ivSeeded(it,7).map(x=>`<kbd class="ivarc-chip">${e(x)}</kbd>`).join(' ')}${arrow}<b>${e(it.join(' '))}</b>`:''}
  case 'crossing':return r0.what?`In “${e((r0.what.match(/“(.+)”/)||[])[1]||'')}”, the safe tiles are <b>${(r0.good||[]).map(e).join('</b> and <b>')}</b>.`:'';
  case 'slide':return r0.clue?`${e(r0.clue)}${arrow}<b>${e(r0.word)}</b>`:'';
  case 'snake':case 'fishing':case 'slice':return d.good?.length?`✔ <b>${e(d.good[0])}</b> belongs &nbsp; ✘ <s>${e(d.bad[0]||'')}</s> does not`:'';
  case 'typerush':return d.good?.length?`See <b>${e(d.good[0])}</b> falling? Type <b>${e(d.good[0])}</b> and press ENTER.`:'';
  default:return q?`${e(q.q)}${arrow}<b>${e(q.ok)}</b>`:''}}
const IV_ARC_LEVEL=g=>{const lv=IV_LVL(g);return {lv,need:[7,8,9][lv-1],words:[4,5,5][lv-1],rounds:[3,4,5][lv-1],bad:3}};
/* Canvas games in InterV: light backdrop, and everything drawn larger so the game fills the frame.
   The drawing is scaled by s; the game sees a world of W/s x H/s, and pointer positions are mapped into it. */
// Games whose answers are whole sentences (Track Runner lanes) keep the original scale so the sentences fit.
// 'layout': games that move page elements (Sequence Sprint cards) use the stage's full layout size as their world.
function ivArcScale(stage){if(stage.dataset.ivScale==='layout'){const r=stage.getBoundingClientRect();return stage.clientWidth?r.width/stage.clientWidth:1}if(stage.dataset.ivScale)return Number(stage.dataset.ivScale)||1;const r=stage.getBoundingClientRect();return Math.max(1.5,Math.min(2.8,r.width/420))}
function ivCanvas(stage){
 const c=document.createElement('canvas');stage.querySelector('canvas')?.remove();stage.prepend(c);const ctx=c.getContext('2d');let s=ivArcScale(stage);
 const native=c.getBoundingClientRect.bind(c);
 c.getBoundingClientRect=()=>{const r=native();return {left:r.left,top:r.top,x:r.x,y:r.y,width:r.width/s,height:r.height/s,right:r.left+r.width/s,bottom:r.top+r.height/s}};
 const wrap=fn=>e=>{const r=native();fn({clientX:r.left+(e.clientX-r.left)/s,clientY:r.top+(e.clientY-r.top)/s,button:e.button,pointerId:e.pointerId,type:e.type,target:e.target,preventDefault:()=>e.preventDefault(),stopPropagation:()=>e.stopPropagation()})};
 for(const prop of ['onpointerdown','onpointermove','onpointerup','onpointerleave','onclick','onmousedown','onmousemove','onmouseup']){let h=null,w=null;const type=prop.slice(2);
  Object.defineProperty(c,prop,{configurable:true,get:()=>h,set:v=>{if(w)c.removeEventListener(type,w);h=v;w=typeof v==='function'?wrap(v):null;if(w)c.addEventListener(type,w)}})}
 const fit=()=>{const r=stage.getBoundingClientRect(),d=devicePixelRatio||1;s=ivArcScale(stage);const cw=Math.max(1,Math.round(r.width*d)),ch=Math.max(1,Math.round(r.height*d));if(c.width!==cw)c.width=cw;if(c.height!==ch)c.height=ch;ctx.setTransform(d*s,0,0,d*s,0,0);return {W:r.width/s,H:r.height/s}};
 return {c,ctx,fit}}
function ivSky(ctx,W,H,t){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#eaf4ff');g.addColorStop(1,'#cfe2fb');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffffffaa';for(let k=0;k<26;k++){const x=(k*137.5)%W,y=((k*71)%H+t*0.008*(k%3+1))%H;ctx.beginPath();ctx.arc(x,y,1.6+(k%3),0,7);ctx.fill()}}
// Tuned copies of the shared games: targets, word counts and option counts come from the InterV spec.
const IV_ARC_RUN={};
function ivArcRunner(kind){
 if(IV_ARC_RUN[kind])return IV_ARC_RUN[kind];
 let fn=null;try{fn=ARAL_GAME_RUN[kind]}catch(e){}
 if(typeof fn!=='function')return null;
 let src=String(fn);
 src=src.replace(/\bneed=(\d+)/g,'need=(run.spec.ivNeed||$1)').replace(/\bgoal=(\d+)/g,'goal=(run.spec.ivNeed||$1)').replace(/(need=[^;,]*?)Math\.min\((\d+),/g,'$1Math.min((run.spec.ivNeed||$2),')
  .replace('d.singles.slice(0,3)','d.singles.slice(0,run.spec.ivWords||3)').replace('d.wordle.slice(0,2)','d.wordle.slice(0,run.spec.ivWords||2)')
  .replace(/\.slice\(0,4\),need=pool\.length/,'.slice(0,run.spec.ivWords||4),need=pool.length').replace('d.order.items.slice(0,8)','d.order.items.slice(0,run.spec.ivItems||8)')
  .replace(/q\.bad\.slice\(0,2\)/g,'q.bad.slice(0,run.spec.ivBad||2)').replace('aralArcadeShuffle(d.pairs).slice(0,7)','aralArcadeShuffle(d.pairs).slice(0,run.spec.ivPairs||7)')
  .replace(/aralCanvas\(stage\)/g,'ivCanvas(stage)').replace(/aralSky\(/g,'ivSky(')
  .replace("fillStyle='#3b2410';ctx.fillRect(0,0,W,H)","fillStyle='#f7e7c8';ctx.fillRect(0,0,W,H)").replace("fillStyle='#173a2a';ctx.fillRect(0,0,W,H)","fillStyle='#dcf1e3';ctx.fillRect(0,0,W,H)").replace(/fillStyle='#1d4632'/g,"fillStyle='#c4e6d1'");
 try{IV_ARC_RUN[kind]=(0,eval)('('+src+')')}catch(e){console.warn('InterV: using the original game',kind,e);IV_ARC_RUN[kind]=fn}
 return IV_ARC_RUN[kind]}
// Multiple-choice items -> game questions {q, ok, bad}.
const ivQ=(it,label)=>({q:[label,it.emoji,it.hide?'':it.ctx,it.q].filter(Boolean).join(' — '),ok:it.opts[0],bad:it.opts.slice(1)});
const ivQs=(items,label)=>items.filter(it=>it.k==='mc').map((it,n)=>ivQ(it,typeof label==='function'?label(it,n):label));
function ivGameData(key,ti,L,g,task){
 const A=IV_ARC_LEVEL(g),kind=IV_ARCADE[key][ti],G=L.G[g],F=L.F[g],I=L.I[g],R=L.R[g],W=L.W[g],cor=ivCorpus(L,g);
 const base={kind,qs:[],pairs:[],singles:[],wordle:[],good:[],bad:[],what:'',oks:[],search:[],topic:task.n,order:null};
 const out={kind,d:base,rounds:null,listen:{},passages:null};
 const pIndex=t=>Math.max(0,R.findIndex(r=>r[0]===t));
 const coLabel=it=>it.passage?`📜 Passage ${pIndex(it.passage.title)+1}`:'';
 if(key==='vo'){
  if(ti===0)base.singles=G.hunt.map(h=>({w:String(h[1]).toUpperCase(),clue:`${h[0]} — ${h[2]}`}));
  if(ti===1){base.pairs=G.picture.map(p=>[p[0],p[1]]);if(A.lv>1)base.pairs.push(...G.context.slice(0,A.lv-1).map(c=>[c[1],c[2]]))}
  if(ti===2)base.wordle=ivSeeded([...G.context.map(c=>({w:String(c[1]).toUpperCase(),clue:ivBlank(c[0],c[1])})),...G.hunt.map(h=>({w:String(h[1]).toUpperCase(),clue:h[2]}))].filter(x=>/^[A-Z]{4,10}$/.test(x.w)),ivHash('wd'+g));
  if(ti===3)base.pairs=[...G.syn.map(y=>[y[0],`${y[1]==='antonym'?'the opposite of':'the same as'} “${y[2]}”`]),...G.context.map(c=>[c[1],c[2]])];
  if(ti===4)base.qs=ivQs(task.i);
 }
 if(key==='fl'){const ch=F.map(f=>ivChunks(f[0]));
  if(ti===0)out.rounds=ivSeeded(ch,ivHash('fr'+g)).slice(0,A.rounds).map(c=>({items:ivFiner(c,A.lv).map(p=>ivTile(p,cor))}));
  if(ti===1){let e=0,p=0;base.qs=task.i.filter(it=>it.k==='mc').map(it=>{const lab=it.ptitle?`🔊 Passage ${++p}`:`🔊 Echo ${++e}`;out.listen[lab]=it.listen;return {q:`${lab}: ${it.q.replace(/^Press 🔊 Listen( to the passage)?\.\s*/,'')}`,ok:it.opts[0],bad:it.opts.slice(1)}})}
  // Pause Painter: one sentence per round; the safe tiles are the words a reader pauses after (ends of thought groups).
  if(ti===2)out.rounds=ivSeeded(ch.map((c,j)=>j),ivHash('fp'+g)).slice(0,A.rounds).map(j=>{const c=ch[j],good=ivUniq(c.slice(0,-1).map(x=>ivClean(ivWords(x).slice(-1)[0]))),bad=ivUniq(c.flatMap(ivWords).map(ivClean).filter(w=>w.length>2&&!good.some(x=>ivLow(x)===ivLow(w))));
   return {good,bad,what:`the words where you PAUSE in: “${c.join(' ')}”`}});
  if(ti>=3)base.qs=ivQs(task.i);
 }
 if(key==='co'){out.passages=R.map(r=>({title:r[0],text:r[1]}));
  if(ti===1){base.qs=R.flatMap((r,j)=>{const lab=`📜 Passage ${j+1}`;return [{q:`${lab} — Which event happened FIRST?`,ok:r[2],bad:[r[3],r[4],r[8]]},{q:`${lab} — Which event happened LAST?`,ok:r[4],bad:[r[2],r[3],r[8]]},{q:`${lab} — What happened right after: “${r[2]}”?`,ok:r[3],bad:[r[4],r[8],r[6]]}]})}
  else base.qs=ivQs(task.i,coLabel);
  if(ti===4)base.oks=ivUniq(base.qs.map(q=>q.ok));
 }
 if(key==='in'){
  if(ti===2){base.singles=I.filter(x=>/^[a-z]{4,11}$/i.test(x[6])).map(x=>({w:String(x[6]).toUpperCase(),clue:`Which word describes them? “${x[0]}”`}))}
  else if(ti===3){base.what='EVIDENCE (what the text actually says)';base.good=ivUniq([...I.map(x=>x[4]),...R.map(r=>r[7])]);base.bad=ivUniq(I.flatMap(x=>[x[1],x[5],x[2]]))}
  else if(ti===4){base.what='conclusions SUPPORTED by the clues';base.good=ivUniq(I.flatMap(x=>[x[1],x[5]]));base.bad=ivUniq(I.flatMap(x=>[x[2],x[3]]))}
  else base.qs=ivQs(task.i);
 }
 if(key==='cr'){
  if(ti===0)out.rounds=ivSeeded(W,ivHash('cw'+g)).slice(0,A.rounds).map(w=>({order:{label:'Build the sentence',items:ivWords(w[0]).map(x=>ivTile(x,cor))}}));
  if(ti===1){const fixes=W.map(w=>{const d=ivDiff(w[0],w[1]);if(!d.aligned||!d.errs.length)return null;const k=d.errs.find(k=>/^[A-Za-z]{4,10}$/.test(ivClean(d.A[k])));return k==null?null:{word:ivClean(d.A[k]).toUpperCase(),clue:`Fix “${ivClean(d.B[k])}” in: ${w[1]}`}}).filter(Boolean);out.rounds=fixes.slice(0,A.rounds)}
  if(ti===2){const all=ivUniq([7,8,9,10,11,12].flatMap(n=>(L.W[n]||[]).map(w=>w[3])).concat(Object.values(IV_LINKS).flat()));const kind2=g%2?'contrast':'result';base.what=`transitions that show ${IV_LINK_LABEL[kind2].toUpperCase()}`;base.good=all.filter(x=>ivLinkKind(x)===kind2);base.bad=all.filter(x=>ivLinkKind(x)&&ivLinkKind(x)!==kind2)}
  if(ti===3){base.qs=W.flatMap((w,j)=>{const s=ivSents(w[4]);if(s.length<3)return [];const lab=`¶ “${w[6]}”`;return [{q:`${lab} — Which sentence comes FIRST?`,ok:s[0],bad:[s[1],s[2],w[0]]},{q:`${lab} — Which sentence comes right after: “${s[0]}”?`,ok:s[1],bad:[s[2],s[0],w[0]]},{q:`${lab} — Which sentence comes LAST?`,ok:s[2],bad:[s[0],s[1],w[0]]}]})}
  if(ti===4)base.good=ivUniq(W.flatMap(w=>ivKeyWords(w[0]+' '+w[4],4))).filter(x=>/^[a-z]{5,12}$/.test(x));
 }
 return out}
/* Arcade task page */
let ivArcadeRun=null;
function ivArcStop(){try{ivArcadeRun?.stop?.()}catch(e){}try{ivArcadeRun?.cleanup?.()}catch(e){}ivArcadeRun=null}
function renderTask(key,t,start){
 key=IV_ST[key]?key:'fl';ivLast.st=key;const S=IV_ST[key],task=ivTasks(key)[t-1];if(!task)return renderStation(key);
 const g=ivGrade(),A=IV_ARC_LEVEL(g);let L=null;try{ivLegacyMerge()}catch(e){}L=globalThis.InterVLegacyData;
 const GD=L?ivGameData(key,t-1,L,g,task):null,kind=GD?.kind,info=kind&&typeof ARAL_GAMES!=='undefined'?ARAL_GAMES[kind]:null,runner=kind?ivArcRunner(kind):null;
 const P=ivPage({img:'resources/interv/pages/task-generic.png',w:1672,h:941,fit:'fill',label:S.name+': '+task.n,...IV_TASK_HEAD,stations:()=>renderStation(key),bubble:{x:295,y:186,size:25,chars:23,rows:3,maxW:236}});
 P.draw('title',ivTitle(S.name,`Task ${t}: ${task.n}`,false));
 P.draw('goal',ivTaskGoal(S.goal));P.draw('tips',ivTips(task.t));
 P.draw('plaque',`<defs><linearGradient id="ivgPlq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8dfae"/><stop offset="1" stop-color="#f1d09a"/></linearGradient></defs><rect x="1398" y="374" width="186" height="38" rx="10" fill="url(#ivgPlq)"/><text class="ivp-serif" x="1491" y="404" font-size="33" text-anchor="middle" style="fill:#13205a">Hearts</text>`);
 ivGamesBar(P,()=>renderTask(key,t));
 const recNow=()=>ivTaskRec(intervStationStore(),key,t);
 const frame=P.layer('ivx ivarc'+(GD?.passages?' with-pass':''),IV_FRAME);
 if(!GD||!runner||!info){frame.innerHTML=`<div class="ivx-in"><div class="ivx-body"><section class="ivx-q"><div class="ivx-qin"><p class="ivx-qt">This game could not load. Please go back and try again.</p></div></section></div></div>`;return}
 const name=`${task.n} · ${info.name}`;
 frame.innerHTML=`${GD.passages?'<aside class="ivarc-pass" aria-label="Passage"><div class="ivarc-ptext"><p>Start the game to see the passage for each question.</p></div></aside>':''}<div class="ag ivag" role="group" aria-label="${ivEsc(name)}"><div class="ag-top"><span class="ag-name">🎮 ${ivEsc(info.name)}</span><span class="ag-goal"></span><span class="ag-hud"><span class="lives">❤❤❤</span><span class="score">0 / ${A.need}</span><span class="time"></span></span><button type="button" class="ivarc-listen ivarc-hintbtn" data-hint aria-label="Hint (costs ${IV_HINT_COST} reward points)">💡</button><button type="button" class="ivarc-listen" data-help aria-label="How to play" aria-expanded="false">❓</button><button type="button" class="ivarc-listen" data-listen aria-label="Listen">🔊</button></div><div class="ag-q"></div><div class="ag-stage"></div></div>`;
 const el=frame.querySelector('.ag'),stage=el.querySelector('.ag-stage'),goalEl=el.querySelector('.ag-goal');
 if(kind==='sprint')stage.dataset.ivScale='layout'; const rounds=GD.rounds,nRounds=rounds?rounds.length:1;let round=0,correct=0,wrong=0,livesNow=3,lastScore=0,playing=false;
 const how=IV_HOW[kind]||(Array.isArray(info.how)?info.how:[info.how||'']);
 let exHTML='';try{const gEx=g>7?g-1:8,taskEx=IV_BUILD[key](L,gEx)[t-1],X=ivGameData(key,t-1,L,gEx,taskEx);const demo=ivDemoMake(kind,X),ex=ivExample(kind,X);if(demo)exHTML=`<div class="ivarc-ex ivarc-demo"><span>Watch how to play</span>${demo}</div>`;else if(ex)exHTML=`<div class="ivarc-ex"><span>Example</span><p>${ex}</p></div>`}catch(e){}
 const howList=`<ol class="ivarc-how">${how.map(x=>`<li>${ivEsc(x)}</li>`).join('')}</ol>${exHTML}`;
 const goalText=()=>rounds?`Round ${round+1}/${nRounds}`:(['ttt','connect4','board','dig','bingo'].includes(kind)?'Win the board':['hangman','wordle','beadwheel'].includes(kind)?`Solve ${A.words} words`:kind==='memory'?'Match all pairs':`Win: ${A.need} right`);
 const specFor=()=>{const extra=rounds?rounds[round]:{};const d={...GD.d,...(extra.order?{order:extra.order}:{}),...(extra.word?{word:extra.word,clue:extra.clue}:{}),...(extra.good?{good:extra.good,bad:extra.bad,what:extra.what}:{})};
  return {kind,name:info.name,d,qs:d.qs.map(q=>({...q,bad:q.bad.slice(0,A.bad)})),need:A.need,ivNeed:kind==='domino'?Math.min(A.need,d.pairs.length-1):A.need,ivWords:A.words,ivBad:A.bad,ivItems:14,ivPairs:d.pairs.length||7,good:d.good,bad:d.bad,items:extra.items||d.order?.items}};
 const run={el,spec:specFor(),keys:{},stop:null,onKey:null};
 const screen=(html,btns)=>{stage.querySelector('.ag-screen')?.remove();const s=document.createElement('div');s.className='ag-screen';s.innerHTML=html;const row=document.createElement('div');row.className='ivarc-btns';btns.forEach(([txt,fn,ghost])=>{const b=document.createElement('button');b.type='button';b.className='ag-btn'+(ghost?' ghost':'');b.textContent=txt;b.onclick=fn;row.appendChild(b)});s.appendChild(row);stage.appendChild(s);
  // Fit the whole card (title, steps, example, buttons) inside the play area: no scrolling, nothing hidden.
  const base=parseFloat(getComputedStyle(s).fontSize)||18;ivFitBox(s,s,10,base*(s.querySelector('.ivarc-demo')?2.1:1.6));ivDemoStart(s);row.querySelector('button')?.focus({preventScroll:true})};
 const showPlaque=()=>P.draw('attempts',ivAttemptStars(livesNow,`${correct} correct`));
 // Watch the game's HUD: every new point is a correct answer, every lost heart a wrong one.
 const hud=el.querySelector('.ag-hud');
 const readHud=()=>{const sc=hud.querySelector('.score')?.textContent||'',lv=hud.querySelector('.lives')?.textContent||'';const n=parseInt(sc,10)||0,h=(lv.match(/❤/g)||[]).length;
  if(playing){if(n>lastScore)correct+=n-lastScore;if(h<livesNow)wrong+=livesNow-h}lastScore=n;livesNow=h;showPlaque()};
 const mo=new MutationObserver(readHud);mo.observe(hud,{subtree:true,childList:true,characterData:true});
 // Comprehension: show the passage for the current question; never show the title while a title question is on screen.
 const pass=frame.querySelector('.ivarc-pass');let shownP=-1,shownT=null;
 const syncPassage=()=>{if(!pass)return;const txt=el.textContent||'';const m=txt.match(/📜 Passage (\d)/);if(!m)return;const n=Number(m[1])-1,noTitle=/title/i.test(el.querySelector('.ag-q')?.textContent+' '+(stage.querySelector('.gx-qcard,.gx-show')?.textContent||''));if(n===shownP&&noTitle===shownT)return;shownP=n;shownT=noTitle;const p=GD.passages[n];if(!p)return;
  pass.innerHTML=`<div class="ivarc-ptext"><h3>📜 Passage ${n+1}${noTitle?'':`: ${ivEsc(p.title)}`}</h3>${String(p.text).split(/\n\n+/).map(x=>`<p>${ivEsc(x)}</p>`).join('')}</div>`;ivFitBox(pass,pass.querySelector('.ivarc-ptext'),12,(frame.clientHeight||500)*.065)};
 const mo2=new MutationObserver(()=>syncPassage());mo2.observe(el,{subtree:true,childList:true,characterData:true});
 // Board-style games (buttons and cards): grow the text until the game fills the play area.
 let fitQueued=false,lastSig='';
 const fitDom=()=>{fitQueued=false;if(!stage.isConnected)return;const gx=stage.querySelector('.gx');if(!gx||stage.querySelector('canvas'))return;
  const sig=gx.childElementCount+':'+gx.textContent.length+':'+stage.clientWidth;if(sig===lastSig)return;lastSig=sig;
  const fits=()=>gx.scrollHeight<=gx.clientHeight+1&&gx.scrollWidth<=gx.clientWidth+1;
  let lo=12,hi=Math.max(20,stage.clientHeight*.16),best=lo;for(let n=0;n<10;n++){const mid=(lo+hi)/2;stage.style.fontSize=mid+'px';if(fits()){best=mid;lo=mid}else hi=mid}
  stage.style.fontSize=(best*.96)+'px'};
 const queueFit=()=>{if(!fitQueued){fitQueued=true;requestAnimationFrame(fitDom)}};
 const mo3=new MutationObserver(queueFit);mo3.observe(stage,{childList:true,subtree:true});
 const ro3=new ResizeObserver(()=>{lastSig='';queueFit()});ro3.observe(stage);
 const listen=()=>{const txt=el.textContent||'';const lab=Object.keys(GD.listen).find(k=>txt.includes(k));if(lab)return ivSay(GD.listen[lab],.92);
  const pm=txt.match(/📜 Passage (\d)/);if(pm&&GD.passages){const p=GD.passages[Number(pm[1])-1];return ivSay(p.text,.95)}
  const q=el.querySelector('.ag-q')?.textContent||stage.querySelector('.gx-qcard')?.textContent||'';ivSay(q.replace(/[🔊📜¶🎯❓🔎🁣]/g,''))};
 frame.querySelector('[data-listen]').onclick=listen;
 // 💡 Hint: a clue for the item on screen, paid with reward points from the InterV Games (or a Bonus Game credit).
 const hintFor=()=>{const qt=(el.querySelector('.ag-q')?.textContent||'')+' '+(stage.querySelector('.gx-qcard')?.textContent||''),d=run.spec.d,r0=rounds?rounds[round]:null,start=s=>ivWords(s).slice(0,Math.min(3,Math.ceil(ivWords(s).length/2))).join(' ');
  const q=(d.qs||[]).find(x=>qt.includes(x.q.slice(-38)));if(q)return `The answer begins with “${start(q.ok)}…”`;
  const sg=[...(d.singles||[]),...(d.wordle||[])].find(x=>qt.includes(String(x.clue).slice(-30)));if(sg)return `The word starts with “${sg.w.slice(0,2)}” and ends with “${sg.w.slice(-1)}” (${sg.w.length} letters).`;
  if(r0?.items)return `Start with “${r0.items[0]}”.`;if(r0?.order)return `The first word is “${r0.order.items[0]}”.`;if(r0?.word)return `The fixed word starts with “${r0.word.slice(0,2)}”.`;
  if(r0?.good)return `One safe word is “${r0.good[0]}”.`;
  if(d.good?.length&&d.bad?.length)return `“${d.good[Math.floor(Math.random()*d.good.length)]}” belongs. “${d.bad[0]}” does not.`;
  if(d.good?.length)return `Try “${d.good[0]}”.`;
  if(d.pairs?.length){const p=d.pairs[Math.floor(Math.random()*d.pairs.length)];return `“${p[0]}” goes with “${p[1]}”.`}
  return 'Read the question again slowly — every clue is in the words.'};
 let hintN=0;
 frame.querySelector('[data-hint]').onclick=()=>{el.querySelector('.ivarc-help')?.remove();if(!playing){P.bubble('Press Play first, then use a hint.');return}
  const text=hintFor(),buy=ivBuyHint(['ivh',g,key,t,round,correct,hintN++].join(':'));const box=document.createElement('div');box.className='ivarc-help';
  box.innerHTML=buy.ok?`<b>💡 Hint</b><p class="ivarc-hinttext">${ivEsc(text)}</p><small>Paid with ${ivEsc(buy.how)} · ${ivRewardBalance()} reward points left</small><button type="button" class="ag-btn">Got it</button>`
   :`<b>💡 Not enough reward points</b><p class="ivarc-hinttext">A hint costs ${IV_HINT_COST} reward points. You have ${ivRewardBalance()}. Play the InterV Games below to earn more!</p><button type="button" class="ag-btn">OK</button>`;
  box.querySelector('button').onclick=()=>box.remove();el.appendChild(box)};
 const helpBtn=frame.querySelector('[data-help]');
 helpBtn.onclick=()=>{const open=el.querySelector('.ivarc-help');if(open){open.remove();helpBtn.setAttribute('aria-expanded','false');return}
  const box=document.createElement('div');box.className='ivarc-help';box.innerHTML=`<b>How to play</b>${howList}<button type="button" class="ag-btn">Got it</button>`;box.querySelector('button').onclick=()=>{box.remove();helpBtn.setAttribute('aria-expanded','false')};el.appendChild(box);ivDemoStart(box);helpBtn.setAttribute('aria-expanded','true')};
 const key2=e=>{if(!frame.isConnected){removeEventListener('keydown',key2);return}run.onKey?.(e)};addEventListener('keydown',key2);
 const finish=won=>{playing=false;try{run.stop?.()}catch(e){}
  const s=intervStationStore(),r=ivTaskRec(s,key,t),prev=r.g||{},pts=won?50+10*livesNow:5*correct,best=Math.max(prev.best||0,pts),gain=best-(prev.best||0);
  r.g={won:!!(prev.won||won),lives:Math.max(prev.lives||0,won?livesNow:0),best,correct:Math.max(prev.correct||0,correct),plays:(prev.plays||0)+1,kind,at:new Date().toISOString()};
  if(gain>0){s.points=(Number(s.points)||0)+gain;const d=ivStData(s,key);d.pts=(d.pts||0)+gain}intervStationSave(s);P.pts();
  const wDone=!!recNow().w;
  if(won){try{aralSfx('win');aralBurst?.(el,30)}catch(e){}
   screen(`<div class="ag-big">🏆</div><h3>You won!</h3><p>${'❤'.repeat(livesNow)} · ${correct} right${gain?` · +${gain} pts`:''}</p><p>${wDone?'Play again to beat your best.':'Next: the ★ writing challenge.'}</p>`,
    wDone?[['↻ Play again',begin],['◀ Back to station',()=>renderStation(key),1]]:[['★ Writing challenge',()=>ivWriting(P,key,t,task)],['↻ Play again',begin,1]]);
   P.bubble(wDone?'Great game! Try for all three hearts.':'You won! Now show what you learned in the writing challenge.')}
  else{try{aralSfx('buzz')}catch(e){}screen(`<div class="ag-big">💥</div><h3>Out of hearts</h3><p>${correct} right${gain?` · +${gain} pts`:''}. Read carefully and try again!</p>`,[['↻ Try again',begin],['◀ Back to station',()=>renderStation(key),1]]);P.bubble('Read carefully and try again. Every try makes you stronger!')}};
 const startRound=()=>{stage.querySelector('.ag-screen')?.remove();try{run.stop?.()}catch(e){}run.onKey=null;run.keys={};run.spec=specFor();lastScore=0;livesNow=3;
  let tm=hud.querySelector('.time');if(!tm){tm=document.createElement('span');tm.className='time';hud.appendChild(tm)}tm.textContent='';goalEl.textContent=goalText();
  playing=true;runner(run,stage,{win:()=>{if(round<nRounds-1){playing=false;try{run.stop?.()}catch(e){}round++;try{aralSfx('ding')}catch(e){}screen(`<div class="ag-big">⭐</div><h3>Round ${round} cleared!</h3>`,[['▶ Next round',startRound]]);return}finish(true)},lose:()=>finish(false)})};
 function begin(){round=0;correct=0;wrong=0;livesNow=3;showPlaque();startRound()}
 ivArcadeRun={stop:()=>{playing=false;try{run.stop?.()}catch(e){}},cleanup:()=>{mo.disconnect();mo2.disconnect();mo3.disconnect();ro3.disconnect();removeEventListener('keydown',key2)}};
 const rec=recNow(),best=rec.g?.won?`<p class="ivarc-best">Your best: ${'⭐'.repeat(rec.g.lives||0)} · ${rec.g.best} points</p>`:'';
 goalEl.textContent=goalText();showPlaque();
 screen(`<h3>🎮 ${ivEsc(task.n)}</h3><p class="ivarc-sub">How to play</p>${howList}<p class="ivarc-sub">${ivEsc(goalText())} · 3 ❤</p>${best}`,
  [['▶ Play',begin],...(rec.w||rec.g?.won?[['★ Writing',()=>ivWriting(P,key,t,task),1]]:[])]);
 P.bubble(task.s);
 if(Number.isInteger(start)&&start===10)ivWriting(P,key,t,task);
}
/* Passage panel (Comprehension Crossing) */
function ivPassage(P,task,back){
 P.board.querySelector('.ivp-panel')?.remove();
 const panel=P.layer('ivp-panel',IV_FRAME);
 panel.innerHTML=`<div class="ivp-panel-head"><b>📜 ${ivEsc(task.pt||'Passage')}</b><span><button type="button" class="ivp-pill" data-listen>🔊 Listen</button></span></div><div class="ivp-panel-body ivp-passage">${String(task.p).split(/\n\n+/).map(x=>`<p>${ivEsc(x)}</p>`).join('')}</div><div class="ivp-panel-foot"><button type="button" class="ivp-btn" data-close>${back?'◀ Back to the question':'Start the questions ▶'}</button></div>`;
 panel.querySelector('[data-listen]').onclick=()=>ivSay((task.pt?task.pt+'. ':'')+task.p,.95);
 panel.querySelector('[data-close]').onclick=()=>{window.speechSynthesis?.cancel();panel.remove()};
 P.bubble('Read the passage carefully. You can open it again anytime with the Passage button.');
}
/* Writing panel: the last step (★) of every task, scored with the objective rubric and saved for teacher review. */
function ivWritingLog(){try{return JSON.parse(localStorage.getItem('readwy-interv-writing-v1')||'[]')||[]}catch(e){return []}}
function ivWritingLogSave(list){try{localStorage.setItem('readwy-interv-writing-v1',JSON.stringify(list));return true}catch(e){return false}}
function ivWriting(P,key,t,task){
 P.board.querySelector('.ivp-panel')?.remove();
 const g=ivGrade(),w=task.w,S=IV_ST[key],rec=ivTaskRec(intervStationStore(),key,t);
 const panel=P.layer('ivp-panel ivp-write',IV_FRAME);
 const showForm=(draft)=>{
  panel.innerHTML=`<div class="ivp-panel-head"><b>✍️ Writing Task · Task ${t}</b><span>Grade ${g} · ${ivEsc(S.name)}</span></div><div class="ivp-panel-body"><p class="ivw-prompt">${ivEsc(w.p)}</p>${w.src?`<blockquote class="ivw-src">${ivEsc(w.src)}</blockquote>`:''}${task.p?`<button type="button" class="ivp-pill" data-passage>📜 Reread the passage</button>`:''}<textarea class="ivw-text" aria-label="Your writing" spellcheck="true" placeholder="Write your response here...">${ivEsc(draft||'')}</textarea><ul class="ivw-check"></ul></div><div class="ivp-panel-foot"><button type="button" class="ivp-btn ghost" data-back>◀ Back to game</button><span class="ivw-msg" role="status"></span><button type="button" class="ivp-btn" data-submit>Submit for scoring ✓</button></div>`;
  const ta=panel.querySelector('textarea'),list=panel.querySelector('.ivw-check'),msg=panel.querySelector('.ivw-msg');
  const update=()=>{const items=ivRubricChecklist(ta.value,w,g);list.innerHTML=items.map(x=>`<li class="${x.done?'ok':''}">${x.done?'✅':'⬜'} ${ivEsc(x.label)}${x.now?` <small>(${ivEsc(x.now)})</small>`:''}</li>`).join('');try{localStorage.setItem('readwy-interv-draft-'+key+g+t,ta.value)}catch(e){}};
  ta.addEventListener('input',update);update();
  panel.querySelector('[data-back]').onclick=()=>panel.remove();
  panel.querySelector('[data-passage]')?.addEventListener('click',()=>ivPassage(P,task,true));
  panel.querySelector('[data-submit]').onclick=()=>{
   const text=ta.value.trim(),{min}=ivRubricLimits(w,g),words=ivRubricTokens(text).length,sents=ivRubricSentences(text).length;
   if(words<Math.ceil(min*.5)||sents<2){msg.textContent=`Write at least ${Math.ceil(min*.5)} words in 2 or more sentences before submitting.`;return}
   const score=ivScoreWriting(text,w,g),s=intervStationStore(),r=ivTaskRec(s,key,t),first=!r.w;
   const attempts=(r.w?.attempts||0)+1;r.w={text,score,attempts,at:score.at};
   const pts=first?Math.round(score.transmuted/5):0;if(pts){s.points=(Number(s.points)||0)+pts;const d=ivStData(s,key);d.pts=(d.pts||0)+pts}
   intervStationSave(s);
   const u=(typeof user!=='undefined'&&user)||{},id=[u.email||u.lrn||u.name||'local',g,key,t].join('|'),log=ivWritingLog().filter(x=>x.id!==id);
   log.push({id,learner:{name:u.name||'Local learner',lrn:u.lrn||'',email:u.email||'',section:u.section||'',grade:g},grade:g,station:key,stationName:S.name,task:t,taskName:task.n,prompt:w.p,text,auto:score,attempts,review:null,submittedAt:score.at});
   ivWritingLogSave(log);P.pts();
   try{localStorage.removeItem('readwy-interv-draft-'+key+g+t)}catch(e){}
   showResult(r.w,pts)};
 };
 const showResult=(wr,pts)=>{const sc=wr.score;
  panel.innerHTML=`<div class="ivp-panel-head"><b>✍️ Writing Result · Task ${t}</b><span>${sc.transmuted} · ${ivEsc(sc.descriptor)}</span></div><div class="ivp-panel-body"><div class="ivw-total"><strong>${sc.total}/20</strong><span>Raw ${sc.pct}% → Grade ${sc.transmuted}<br>${ivEsc(sc.descriptor)}${pts?` · +${pts} pts`:''}</span></div>${sc.flags.length?`<p class="ivw-flag">⚠️ ${sc.flags.map(ivEsc).join(' ')}</p>`:''}<table class="ivw-table"><tbody>${IV_RUBRIC.criteria.map(c=>`<tr><th>${ivEsc(c.name)}<small>${ivEsc(c.desc)}</small></th><td><b>${sc.scores[c.key]}/4</b><small>${IV_RUBRIC.levels[sc.scores[c.key]]}</small></td><td>${sc.notes[c.key].map(ivEsc).join('<br>')}</td></tr>`).join('')}</tbody></table><p class="ivw-note">Saved for your teacher’s review in Reports. Your teacher may adjust the score after reading your work.</p></div><div class="ivp-panel-foot"><button type="button" class="ivp-btn ghost" data-revise>✎ Revise &amp; resubmit</button><button type="button" class="ivp-btn" data-done>Back to ${ivEsc(S.name)} ▶</button></div>`;
  panel.querySelector('[data-revise]').onclick=()=>showForm(wr.text);
  panel.querySelector('[data-done]').onclick=()=>renderStation(key);
  P.bubble(sc.transmuted>=85?'Excellent writing! Your teacher will review it too.':sc.transmuted>=75?'Good work! Read the feedback to make it even better.':'Nice try! Use the feedback, then revise and resubmit.')};
 let draft='';try{draft=localStorage.getItem('readwy-interv-draft-'+key+g+t)||''}catch(e){}
 if(rec.w)showResult(rec.w,0);else{showForm(draft);P.bubble('Writing task! Read the prompt, plan, then write. Watch the checklist.')}
}

/* ---------- Original InterV games, themed (legacy engine) ---------- */
function ivLegacyEnsure(){
 // The original InterV app defines its content when it mounts; mount it once off-screen, then dispose of it.
 if(globalThis.InterVLegacyData||typeof renderInterActivities!=='function')return;
 const saved=app.innerHTML;try{renderInterActivities({grade:7});globalThis.readwyInterV?.destroy?.()}catch(e){}app.innerHTML=saved}
function ivLegacyMerge(){ivLegacyEnsure();const L=globalThis.InterVLegacyData,X=globalThis.IV_LEGACY_EXTRA;if(!L||!X)return;for(const k of ['G','F','I','R','W'])for(const g of [11,12])if(L[k]&&!L[k][g])L[k][g]=X[k][g]}
function renderLegacyGame(key,gi,round){
 ivLegacyMerge();const IG=globalThis.InterVGames,L=globalThis.InterVLegacyData;
 if(!IG||!L){return renderStation(key,'games')}
 const [comp,task]=IV_ST_GAMES[key][gi],g=ivGrade(),meta=IG.catalog[comp][task],S=IV_ST[key];
 const recOf=()=>{const s=intervStationStore();s.lg=s.lg||{};s.lg[g]=s.lg[g]||{};return {s,r:s.lg[g][comp+'-'+task]=s.lg[g][comp+'-'+task]||{sc:{},ev:{},art:{}}}};
 const firstOpen=[0,1,2,3,4].find(n=>!(n in (recOf().r.sc)));
 let cur=Number.isInteger(round)?round:(firstOpen??0);const media={recorded:false,played:false,url:''},hints={};
 const P=ivPage({img:'resources/interv/pages/task-generic.png',w:1672,h:941,fit:'fill',label:S.name+' game: '+meta[0],...IV_TASK_HEAD,stations:()=>renderStation(key,'games'),bubble:{x:295,y:186,size:25,chars:23,rows:3,maxW:236}});
 P.draw('title',ivTitle(S.name,meta[0],false));
 P.draw('goal',ivTaskGoal('Finish all 5 rounds of this game!'));
 P.draw('tips',ivTips([meta[2],'Hints are free in station games.']));
 const paintRounds=()=>{const sc=recOf().r.sc,n=Object.values(sc).filter(v=>v===1).length;P.draw('attempts',ivAttemptStars(Math.round(n/5*3),`${n}/5 rounds`))};
 const host=P.layer('ivp-legacy',IV_FRAME);const root=host.attachShadow({mode:'open'});
 const css=(globalThis.InterVLegacyStyles||'')+IG.styles+`:host{all:initial;display:block;width:100%;height:100%;min-height:0!important;background:transparent!important}.ivl{height:100%;overflow:auto;background:#fffaf0;border:3px solid #d9a441;border-radius:18px;padding:14px;box-sizing:border-box;font:500 19px/1.4 "Baloo 2","Segoe UI",sans-serif;color:#2b2b50}.ivl .layout{display:grid;grid-template-columns:150px 1fr;gap:14px}.ivl .heading{display:flex;justify-content:space-between;align-items:center;gap:10px}.ivl .heading h1{font-size:26px;margin:0}.ivl .heading img{width:46px;height:46px;border-radius:10px;vertical-align:middle;margin-right:8px}.ivl .sideitem{display:block;width:100%;margin:4px 0}`;
 root.innerHTML=`<style>${css}</style><div class="ivl"><div class="ivl-app"></div></div>`;
 const wrap=root.querySelector('.ivl'),appEl=root.querySelector('.ivl-app');
 const fitZoom=()=>{const wpx=host.clientWidth;if(wpx)wrap.style.zoom=Math.max(.5,Math.min(1.4,wpx/900)).toFixed(3)};fitZoom();
 const ro=new ResizeObserver(fitZoom);ro.observe(host);
 const shuffle=(a,seed)=>ivSeeded(a,seed);
 const checkpoint=()=>{if(comp===4){const w=L.W[g][cur];return {prompt:'Which sentence is written correctly?',opts:[w[0],w[1]],answer:w[0]}}const f=L.F[g][cur];return {prompt:`Which tone best fits: “${f[0].replaceAll(' | ',' ')}”?`,opts:[f[1],f[2],f[3]],answer:f[1]}};
 const interactive=IG.mount({app:appEl,root,data:L,esc:ivEsc,shuffle,
  get:()=>({grade:g,comp,task,round:cur,attempt:1}),isPlay:()=>true,checkpoint,
  creditBalance:()=>'free',hasHint:()=>!!hints[cur],purchaseHint:()=>{hints[cur]=true;return {ok:true}},openPlaylab:()=>{ivGamesBack=()=>renderLegacyGame(key,gi,cur);renderIntervGames()},
  scored:()=>cur in recOf().r.sc,result:()=>recOf().r.sc[cur],roundStatus:n=>recOf().r.sc[n],
  artifact:()=>recOf().r.art[cur]||'',response:()=>recOf().r.ev[cur]?.response||null,
  saveArtifact:text=>{const {s,r}=recOf();r.art[cur]=text;intervStationSave(s);return true},
  media:()=>media,say:text=>ivSay(text),
  score:(correct,kind,evidence)=>{const {s,r}=recOf();if(cur in r.sc)return true;r.sc[cur]=correct?1:0;r.ev[cur]={kind,...evidence,at:new Date().toISOString()};intervStationSave(s);if(correct)ivAward(10,key);P.pts();paintRounds();P.bubble(correct?'Round complete! +10 points.':'Round recorded. Review the answer, then go to the next round.');return true}});
 ivLegacyRuntime={destroy(){ro.disconnect();try{interactive.destroy()}catch(e){}if(media.rec&&media.rec.state!=='inactive')try{media.rec.stop()}catch(e){};media.stream?.getTracks().forEach(t=>t.stop())}};
 const go2=n=>{cur=n;media.recorded=false;media.played=false;interactive.reset();interactive.render();paintRounds();P.bubble(meta[2])};
 appEl.addEventListener('click',async ev=>{const b=ev.target.closest('button,[data-round],[data-nav],[data-next]');if(!b)return;
  if(b.dataset.nav!==undefined){ev.preventDefault();return renderStation(key,'games')}
  if(b.dataset.round!==undefined){ev.preventDefault();return go2(Number(b.dataset.round))}
  if(b.dataset.next!==undefined){ev.preventDefault();if(cur<4)return go2(cur+1);return renderStation(key,'games')}
  const reading=()=>{try{return IG.spec(L,{grade:g,comp,task,round:cur}).reading||''}catch(e){return ''}};
  if(b.id==='hear'){ivSay(reading());return}
  if(b.id==='startrec'){try{media.stream=await navigator.mediaDevices.getUserMedia({audio:true});const chunks=[];media.rec=new MediaRecorder(media.stream);media.rec.ondataavailable=e=>chunks.push(e.data);media.rec.onstop=()=>{media.url=URL.createObjectURL(new Blob(chunks));media.recorded=true;media.stream.getTracks().forEach(t=>t.stop());interactive.render()};media.rec.start();b.disabled=true;const st=root.getElementById('stoprec');if(st)st.disabled=false;const m=root.getElementById('micstatus');if(m)m.textContent='Recording… read aloud, then press Stop.'}catch(e){const m=root.getElementById('micstatus');if(m)m.textContent='Microphone unavailable. Allow microphone access to record.'}return}
  if(b.id==='stoprec'){try{media.rec?.stop()}catch(e){}return}
  if(b.id==='playrec'&&media.url){const a=new Audio(media.url);a.onplay=()=>{media.played=true};a.onended=()=>interactive.render();a.play();return}
 });
 P.hit('Back to station games',[1310,825,338,92],()=>renderStation(key,'games'),'99px');
 ivGamesBar(P,()=>renderLegacyGame(key,gi,cur));
 interactive.render();paintRounds();P.bubble(meta[2]);
}

/* ---------- InterV Games hub and arcade games ----------
   Drawn full screen on the crisp station artwork (task page) inside the same activity frame as the tasks.
   The Attempts plaque shows the game score; the games bar (with the Bonus Game) stays at the bottom. */
let ivGamesBack=()=>renderStation(ivLast.st);
const IV_PUZZLE_WORDS=[['reading','What you do with a book.'],['story','A tale with a beginning and an end.'],['journey','A long trip.'],['library','A place full of books to borrow.'],['chapter','One part of a book.'],['meaning','What a word tells you.'],['explore','To look around and discover.'],['station','Where a train stops.'],['lesson','Something you learn.'],['author','The person who writes a book.']];
const IV_MEMORY_PAIRS=[['big','large'],['fast','quick'],['happy','glad'],['start','begin'],['small','tiny'],['shut','close'],['smart','clever'],['angry','mad'],['look','see'],['easy','simple'],['story','tale'],['gift','present']];
const IV_RACE=[
 ['The cat jumped over the fence.',['The cat slept.','The cat jumped.','The cat ran away.'],1],
 ['Maria shut the window when the rain started.',['Maria opened the door.','Maria shut the window.','Maria went outside.'],1],
 ['The bus was late, so Ben walked to school.',['Ben walked to school.','Ben rode the bus.','Ben stayed home.'],0],
 ['Lina waters the plants every morning.',['Lina forgets the plants.','Lina waters the plants.','Lina sells the plants.'],1],
 ['The library opens at eight o’clock.',['It opens at eight.','It is closed all day.','It opens at noon.'],0],
 ['Tom’s dog barked at the mail carrier.',['The dog slept quietly.','A cat barked.','The dog barked.'],2],
 ['After lunch, the class read a story together.',['The class read a story.','The class ate dinner.','The class went home.'],0],
 ['The old bridge was closed for repairs.',['The bridge was new.','The bridge was closed.','The bridge was painted.'],1],
 ['Ana saved her coins to buy a book.',['Ana lost her coins.','Ana bought shoes.','Ana saved for a book.'],2],
 ['The farmer picked ripe mangoes from the tree.',['He picked mangoes.','He planted rice.','He sold the tree.'],0]
];
const IV_SPINNER=[
 [['brave','full of courage'],['gentle','soft and kind'],['brilliant','very bright'],['honest','truthful'],['kind','caring'],['calm','quiet, peaceful']],
 [['ancient','very old'],['fragile','easy to break'],['generous','likes to share'],['curious','wants to know'],['enormous','very big'],['timid','shy and scared']]
];
const IV_CHALLENGE=[
 ['Which is a synonym for “happy”?',['sad','joyful','angry','tired'],1],
 ['Which is an antonym for “ancient”?',['old','modern','broken','huge'],1],
 ['Which word means “very tired”?',['exhausted','excited','eager','early'],0],
 ['Which is a synonym for “begin”?',['finish','start','stop','end'],1],
 ['Which is an antonym for “generous”?',['kind','selfish','helpful','friendly'],1],
 ['Fill in: “Handle the ___ glass with care.”',['fragile','heavy','noisy','brave'],0],
 ['Which is a synonym for “enormous”?',['tiny','huge','thin','short'],1],
 ['Which is an antonym for “timid”?',['shy','quiet','bold','gentle'],2],
 ['Which word means “to look at closely”?',['examine','ignore','forget','hurry'],0],
 ['Which is a synonym for “difficult”?',['easy','simple','hard','quick'],2]
];
const IV_GAME_INFO={
 hub:{name:'Learn • Play • Earn',goal:'Play games to earn more points!',tips:['Every game builds reading skills.','The Bonus Game earns hint credits.'],say:'Games help you build reading skills while having fun! Choose a game.'},
 puzzle:{name:'Word Puzzle',icon:'🧩',desc:'Unscramble the letters to build the word.',goal:'Unscramble every word!',tips:['Look for a word part you know.','Press Hint to reveal a letter.'],say:'Unscramble the letters to form a correct word!'},
 memory:{name:'Memory Match',icon:'🃏',desc:'Find pairs of words with the same meaning.',goal:'Match all six pairs in few moves!',tips:['Remember where each word is.','Pairs mean the same thing.'],say:'Find the matching cards! Each pair means the same.'},
 race:{name:'Reading Race',icon:'🏁',desc:'Read fast and pick the matching sentence.',goal:'Answer before the clock runs out!',tips:['Read the whole sentence first.','Pick the choice that means the same.'],say:'Read the sentence and choose the correct answer before time runs out!'},
 spinner:{name:'Word Spinner',icon:'🎡',desc:'Spin the wheel and choose the meaning.',goal:'Know the meaning of every word!',tips:['Press SPIN to get a word.','Choose the meaning that fits.'],say:'Spin the wheel, read the word, and choose the correct meaning!'},
 challenge:{name:'Challenge Game',icon:'🏆',desc:'Ten word challenges. Perfect score = +50 bonus!',goal:'Get all ten right for a +50 bonus!',tips:['Synonym = same meaning.','Antonym = opposite meaning.'],say:'Solve the challenge and earn bonus points!'}
};
function ivPlayed(name){const s=intervStationStore();s.games={...(s.games||{}),[name]:((s.games||{})[name]||0)+1};intervStationSave(s)}
function ivGamePage(key,label){const info=IV_GAME_INFO[key];ivCurGame=key==='hub'?'':info.name;
 const P=ivPage({img:'resources/interv/pages/task-generic.png',w:1672,h:941,fit:'fill',label,...IV_TASK_HEAD,stations:()=>renderStation(ivLast.st),bubble:{x:295,y:186,size:25,chars:23,rows:3,maxW:236}});
 P.draw('title',ivTitle('InterV Games',info.name,false));
 P.draw('goal',ivTaskGoal(info.goal));P.draw('tips',ivTips(info.tips));
 // Relabel the painted "Attempts" plaque as the game's score board.
 P.draw('plaque',`<defs><linearGradient id="ivgPlq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8dfae"/><stop offset="1" stop-color="#f1d09a"/></linearGradient></defs><rect x="1398" y="374" width="186" height="38" rx="10" fill="url(#ivgPlq)"/><text class="ivp-serif" x="1491" y="404" font-size="33" text-anchor="middle" style="fill:#13205a">Score</text>`);
 const frame=P.layer('ivx ivg ivg-page-'+key,IV_FRAME);
 ivGamesBar(P,ivGamesBack);
 P.hit(key==='hub'?'Back to the station':'Back to InterV Games',[1310,825,338,92],()=>key==='hub'?ivGamesBack():renderIntervGames(),'99px').classList.add('ivh-idle');
 const g={P,frame,
  score(pts,stars){P.draw('attempts',ivAttemptStars(stars,`${pts} pts`))},
  shell(meta,body,foot,hud=''){frame.innerHTML=`<div class="ivx-in"><header class="ivx-head"><div class="ivx-meta"><b>${meta[0]}</b><span>${meta[1]||''}</span></div><div class="ivg-hud">${hud}</div></header><div class="ivx-body"><section class="ivx-q"><div class="ivx-qin">${body}</div></section></div><footer class="ivx-foot">${foot||''}</footer></div>`;g.fit()},
  fit(){if(frame.isConnected)ivFitFrame(frame,.09)},
  on(fn){frame.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b&&!b.disabled)fn(b.dataset,b)})}};
 const ro=new ResizeObserver(()=>{if(!frame.isConnected)return ro.disconnect();g.fit()});ro.observe(frame);
 document.fonts?.ready?.then(()=>g.fit());
 P.bubble(info.say);
 return g}
const ivOptBtn=(o,k,state)=>`<button type="button" class="ivx-opt${state?' '+state:''}" data-k="${k}"${state?' disabled':''}><b>${'ABCD'[k]}</b><span>${ivEsc(o)}</span></button>`;
function renderIntervGames(back){
 if(typeof back==='function')ivGamesBack=back;
 const G=ivGamePage('hub','InterV Games: choose a game'),plays=intervStationStore().games||{};
 const list=[['puzzle',renderIvWordPuzzle],['memory',renderIvMemory],['race',renderIvReadingRace],['spinner',renderIvSpinner],['challenge',renderIvChallenge]];
 const w=ivWallet();G.score(intervDashStats().points,0);
 G.shell(['InterV Games','Choose a game to play'],`<div class="ivg-hub">${list.map(([k],i)=>{const f=IV_GAME_INFO[k];return `<button type="button" class="ivg-card" data-g="${i}"><span class="ivg-ic">${f.icon}</span><b>${f.name}</b><small>${f.desc}</small><em>Played ${plays[f.name]||0}×</em></button>`}).join('')}<button type="button" class="ivg-card bonus" data-bonus><span class="ivg-ic">🎁</span><b>Bonus Game</b><small>Win Playlab rounds to earn hint credits.</small><em>🪙 ${w?w.balance():0} credits</em></button></div>`,
  `<button type="button" class="ivx-b ivx-listen" data-back>◀ Back</button><span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-pick>🎲 Choose for me</button>`);
 G.on(d=>{if('g' in d)return list[Number(d.g)][1]();if('bonus' in d)return ivOpenPlaylab(G.P,()=>renderIntervGames());if('back' in d)return ivGamesBack();
  if('pick' in d){const p=list.slice().sort((a,b)=>(plays[IV_GAME_INFO[a[0]].name]||0)-(plays[IV_GAME_INFO[b[0]].name]||0))[0];return p[1]()}});
}
/* Word Puzzle */
function renderIvWordPuzzle(){
 const G=ivGamePage('puzzle','Word Puzzle: unscramble the letters');ivPlayed('Word Puzzle');
 const words=ivShuffle(IV_PUZZLE_WORDS);let i=0,attempt=1,score=0,right=0,letters=[],picked=[],locked=false,finished=false,status='',reveal=0;
 const scramble=w=>{let s;do{s=ivShuffle([...w])}while(s.join('')===w&&w.length>1);return s};
 const paint=()=>{G.score(score,Math.round(right/words.length*3));
  if(finished)return G.shell(['Word Puzzle','Puzzle complete!'],`<p class="ivx-qt">You solved ${right} of ${words.length} words and scored ${score} points!</p>`,`<span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-again>↻ Play again</button>`);
  const guess=picked.map(k=>letters[k]).join('');
  G.shell(['Word Puzzle',`Word ${i+1} of ${words.length} · Try ${Math.min(attempt,3)} of 3`],
   `<p class="ivx-qt">Unscramble the letters to make a word.</p>${reveal?`<p class="ivx-ctx">Clue: ${ivEsc(words[i][1])}</p>`:''}<div class="ivx-slots letters ivg-answer">${guess?[...guess].map((l,k)=>`<button type="button" class="ivx-tile placed" data-un="${k}">${ivEsc(l)}</button>`).join(''):'<span class="ivx-ph">Tap the letters below.</span>'}</div><div class="ivx-tiles letters">${letters.map((l,k)=>picked.includes(k)?'':`<button type="button" class="ivx-tile" data-l="${k}"${locked?' disabled':''}>${ivEsc(l.toUpperCase())}</button>`).join('')}</div>${status?`<p class="ivg-status">${status}</p>`:''}`,
   `<button type="button" class="ivx-b ivx-hint" data-hint${locked?' disabled':''}>💡 Clue</button><button type="button" class="ivx-b ivx-listen" data-clear${locked?' disabled':''}>↺ Clear</button><span class="ivx-msg"></span><button type="button" class="ivx-b ivx-check" data-check${locked?' disabled':''}>✔ Check</button>`)};
 const load=()=>{letters=scramble(words[i][0]);picked=[];attempt=1;locked=false;status='';reveal=0;paint();G.P.bubble('Unscramble the letters to form a correct word!')};
 const next=()=>{i++;if(i>=words.length){finished=true;paint();G.P.bubble(`Puzzle complete! You scored ${score} points.`);return}load()};
 const check=()=>{if(locked)return;const w=words[i][0],guess=picked.map(k=>letters[k]).join('');if(guess.length<w.length){G.P.bubble('Use all the letters first.');return}
  if(guess===w){const pts=attempt===1?10:5;score+=pts;right++;ivAward(pts);G.P.pts();locked=true;status=`✔ Correct! “${w}” +${pts}`;paint();G.P.bubble('Correct! Great job!');ivLater(next,1300)}
  else{attempt++;picked=[];if(attempt>3){locked=true;status=`The word was “${w}”.`;paint();G.P.bubble(`The word was “${w}”. Let’s try the next one.`);ivLater(next,1900)}else{paint();G.P.bubble(`Not quite. Try again! Attempt ${attempt} of 3.`)}}};
 G.on(d=>{if('again' in d)return renderIvWordPuzzle();if('l' in d){picked.push(Number(d.l));return paint()}if('un' in d){picked.splice(Number(d.un),1);return paint()}
  if('clear' in d){picked=[];return paint()}if('hint' in d){reveal=1;paint();return G.P.bubble(`Clue: ${words[i][1]}`)}if('check' in d)return check()});
 load();
}
/* Memory Match */
function renderIvMemory(){
 const G=ivGamePage('memory','Memory Match: find the pairs');ivPlayed('Memory Match');
 let cards,open,matched,moves,score,busy;
 const start=()=>{const pairs=ivShuffle(IV_MEMORY_PAIRS).slice(0,6);cards=ivShuffle(pairs.flatMap((p,k)=>[{w:p[0],k},{w:p[1],k}]));open=[];matched=new Set();moves=0;score=0;busy=false;paint();G.P.bubble('Find the matching cards! Each pair means the same.')};
 const paint=()=>{G.score(score,Math.round(matched.size/12*3));const won=matched.size===12;
  G.shell(['Memory Match',won?`All pairs found in ${moves} moves!`:`${matched.size/2} of 6 pairs · ${moves} moves`],
   `<div class="ivg-cards">${cards.map((c,n)=>{const up=open.includes(n)||matched.has(n);return `<button type="button" class="ivg-mc${up?' up':''}${matched.has(n)?' ok':''}" data-c="${n}"${matched.has(n)?' disabled':''} aria-label="${up?ivEsc(c.w):'Hidden card '+(n+1)}"><span>${up?ivEsc(c.w):'★'}</span></button>`}).join('')}</div>`,
   `<span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-again>↻ New game</button>`)};
 const flip=n=>{if(busy||open.includes(n)||matched.has(n))return;open.push(n);paint();
  if(open.length===2){moves++;const [a,b]=open;
   if(cards[a].k===cards[b].k){matched.add(a);matched.add(b);open=[];score+=10;ivAward(10);G.P.pts();paint();G.P.bubble(matched.size===12?`You found all the pairs in ${moves} moves!`:`A match! “${cards[a].w}” and “${cards[b].w}” mean the same.`)}
   else{busy=true;paint();G.P.bubble('Not a pair. Remember where they are!');ivLater(()=>{open=[];busy=false;paint()},1000)}}};
 G.on(d=>{if('again' in d)return start();if('c' in d)return flip(Number(d.c))});
 start();
}
/* Reading Race */
let ivRaceClock=0;
function renderIvReadingRace(){
 const G=ivGamePage('race','Reading Race: read the sentence and choose the answer');ivPlayed('Reading Race');
 let order,i,score,time,locked,finished,right,pick;
 const paint=()=>{G.score(score,Math.round(right/order.length*3));
  if(finished)return G.shell(['Reading Race','Race finished!'],`<p class="ivx-qt">${right} of ${order.length} correct · ${score} points!</p>`,`<span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-again>↻ Race again</button>`);
  const [s,opts,ans]=order[i];
  G.shell(['Reading Race',`Sentence ${i+1} of ${order.length}`],`<p class="ivx-ctx ivg-big">${ivEsc(s)}</p><p class="ivx-qt">Which sentence matches?</p><div class="ivx-opts one">${opts.map((o,k)=>ivOptBtn(o,k,locked?(k===ans?'ok':k===pick?'no':''):'')).join('')}</div>`,'',`<span class="ivg-clock${time<=10?' low':''}">⏱ 0:${String(Math.max(0,time)).padStart(2,'0')}</span>`)};
 const clock=()=>{const c=G.frame.querySelector('.ivg-clock');if(c){c.textContent='⏱ 0:'+String(Math.max(0,time)).padStart(2,'0');c.classList.toggle('low',time<=10)}};
 const answer=k=>{if(locked)return;locked=true;pick=k;clearInterval(ivRaceClock);const ans=order[i][2];
  if(k===ans){score+=10;right++;ivAward(10);G.P.pts();G.P.bubble('Correct! Keep racing!')}else G.P.bubble(k<0?'Time is up! Here is the right answer.':'Not quite. The green answer matches the sentence.');
  paint();ivLater(()=>{i++;if(i>=order.length){finished=true;paint();G.P.bubble(`Race finished! ${right} of ${order.length} correct.`);return}ask()},1500)};
 const ask=()=>{locked=false;pick=-1;time=45;paint();clearInterval(ivRaceClock);ivRaceClock=setInterval(()=>{if(!G.frame.isConnected)return clearInterval(ivRaceClock);time--;clock();if(time<=0)answer(-1)},1000)};
 const start=()=>{order=ivShuffle(IV_RACE);i=0;score=0;right=0;finished=false;ask()};
 G.on(d=>{if('again' in d)return start();if('k' in d)return answer(Number(d.k))});
 start();
}
/* Word Spinner */
function renderIvSpinner(){
 const G=ivGamePage('spinner','Word Spinner: spin, read and choose the meaning');ivPlayed('Word Spinner');
 const all=IV_SPINNER.flat();let set,done,current,opts,score,spinning,answered,right,finished,rot=0,pick=-1;
 const wheel=()=>`<div class="ivg-wheelwrap"><i class="ivg-pointer"></i><div class="ivg-wheel" style="transform:rotate(${rot}deg)">${IV_SPINNER[set].map(([w],k)=>`<span class="ivg-wl${done.has(k)&&k!==current?' used':''}${k===current&&!spinning?' cur':''}" style="--a:${k*60+30}deg"><b>${ivEsc(w)}</b></span>`).join('')}</div><button type="button" class="ivg-spin" data-spin${spinning?' disabled':''}>SPIN</button></div>`;
 const paint=()=>{G.score(score,Math.round(right/all.length*3));
  if(finished)return G.shell(['Word Spinner','All words spun!'],`<p class="ivx-qt">${right} of ${all.length} correct · ${score} points!</p>`,`<span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-again>↻ Play again</button>`);
  const w=current>=0?IV_SPINNER[set][current]:null;
  G.shell(['Word Spinner',`Wheel ${set+1} of ${IV_SPINNER.length} · ${done.size} of 6 words`],`<div class="ivg-spinrow">${wheel()}<div class="ivg-mean"><p class="ivx-qt">${w&&!spinning?`What does “${ivEsc(w[0])}” mean?`:'Press SPIN to get a word.'}</p><div class="ivx-opts one">${(opts&&!spinning?opts:[]).map((o,k)=>ivOptBtn(o,k,answered?(o===w[1]?'ok':k===pick?'no':''):'')).join('')}</div></div></div>`,'')};
 const spin=()=>{if(spinning)return;if(current>=0&&!answered){G.P.bubble('Choose the meaning of the highlighted word first.');return}
  const left=IV_SPINNER[set].map((_,k)=>k).filter(k=>!done.has(k));
  if(!left.length){if(set+1<IV_SPINNER.length){set++;done=new Set();current=-1;opts=null;paint();G.P.bubble('New words on the wheel! Press SPIN.');return}finished=true;paint();G.P.bubble(`All words spun! ${right} of ${all.length} correct.`);return}
  const target=left[Math.floor(Math.random()*left.length)],aim=((-(target*60+30))%360+360)%360,now=((rot%360)+360)%360;rot+=1080+((aim-now+360)%360);
  spinning=true;answered=false;opts=null;current=target;pick=-1;paint();
  ivLater(()=>{spinning=false;const w=IV_SPINNER[set][target],wrongs=ivShuffle(all.filter(x=>x[1]!==w[1])).slice(0,3).map(x=>x[1]);opts=ivShuffle([w[1],...wrongs]);paint();ivSay(w[0]);G.P.bubble(`Your word is “${w[0]}”. Choose its meaning!`)},ivReducedMotion()?50:2300)};
 const choose=k=>{if(spinning||current<0||answered||!opts)return;answered=true;pick=k;const w=IV_SPINNER[set][current];done.add(current);
  if(opts[k]===w[1]){score+=10;right++;ivAward(10);G.P.pts();G.P.bubble(`Yes! “${w[0]}” means ${w[1]}. Press SPIN.`)}else G.P.bubble(`“${w[0]}” means ${w[1]}. Press SPIN for the next word.`);paint()};
 const start=()=>{set=0;done=new Set();current=-1;opts=null;score=0;spinning=false;answered=false;right=0;finished=false;pick=-1;paint();G.P.bubble('Spin the wheel, read the word, and choose the correct meaning!')};
 G.on(d=>{if('again' in d)return start();if('spin' in d)return spin();if('k' in d)return choose(Number(d.k))});
 start();
}
function ivReducedMotion(){return matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced-motion')}
/* Challenge Game */
function renderIvChallenge(){
 const G=ivGamePage('challenge','Challenge Game: think, solve and win');ivPlayed('Challenge Game');
 let order,i,score,right,locked,finished,pick;
 const paint=()=>{G.score(score,Math.round(right/order.length*3));
  if(finished)return G.shell(['Challenge Game','Challenge complete!'],`<p class="ivx-qt">${right} of ${order.length} correct · ${score} points${right===order.length?' including the +50 perfect-score bonus':''}!</p>`,`<span class="ivx-msg"></span><button type="button" class="ivx-b ivx-next" data-again>↻ Play again</button>`);
  const [q,opts,ans]=order[i];
  G.shell(['Challenge Game',`Challenge ${i+1} of ${order.length} · Perfect score = +50 bonus`],`<p class="ivx-qt ivg-big">${ivEsc(q)}</p><div class="ivx-opts">${opts.map((o,k)=>ivOptBtn(o,k,locked?(k===ans?'ok':k===pick?'no':''):'')).join('')}</div>`,'')};
 const answer=k=>{if(locked)return;locked=true;pick=k;const ans=order[i][2];
  if(k===ans){score+=10;right++;ivAward(10);G.P.pts();G.P.bubble('Correct! You are a champion in the making!')}else G.P.bubble(`Good try! The correct answer is “${order[i][1][ans]}”.`);paint();
  ivLater(()=>{i++;if(i>=order.length){finished=true;if(right===order.length){score+=50;ivAward(50);G.P.pts();G.P.bubble('Perfect score! Bonus +50 points!')}else G.P.bubble(`Challenge complete! ${right} of ${order.length} correct.`);paint();return}locked=false;pick=-1;paint();G.P.bubble('Solve the challenge and earn bonus points!')},1500)};
 const start=()=>{order=ivShuffle(IV_CHALLENGE);i=0;score=0;right=0;locked=false;finished=false;pick=-1;paint();G.P.bubble('Solve the challenge and earn bonus points!')};
 G.on(d=>{if('again' in d)return start();if('k' in d)return answer(Number(d.k))});
 start();
}

/* ---------- Reports: InterV writing review for teachers ---------- */
function ivReportsSection(){
 const log=ivWritingLog().sort((a,b)=>String(b.submittedAt).localeCompare(String(a.submittedAt)));
 const isTeacher=typeof user!=='undefined'&&user?.role==='teacher';
 const final=x=>x.review?{scores:x.review.scores,total:Object.values(x.review.scores).reduce((a,b)=>a+b,0)}:{scores:x.auto.scores,total:x.auto.total};
 const rows=log.map((x,n)=>{const f=final(x),pct=Math.round(f.total/20*100),tg=ivTransmute(pct);
  return `<details class="ivr-item"><summary><b>${ivEsc(x.learner.name)}</b> · Grade ${x.grade} · ${ivEsc(x.stationName)} · Task ${x.task}: ${ivEsc(x.taskName)} <span class="ivr-badge ${x.review?'rev':''}">${tg} ${ivEsc(ivDescriptor(tg))}${x.review?' · reviewed':' · auto-scored'}</span></summary>
  <p><strong>Prompt:</strong> ${ivEsc(x.prompt)}</p><blockquote class="ivr-text">${ivEsc(x.text).replace(/\n/g,'<br>')}</blockquote>
  <p class="ivr-meta">${x.auto.words} words · ${x.auto.sentences} sentences · attempt ${x.attempts} · submitted ${ivEsc(new Date(x.submittedAt).toLocaleString())}${x.auto.flags.length?' · ⚠️ '+x.auto.flags.map(ivEsc).join(' '):''}</p>
  <form class="ivr-form" data-id="${ivEsc(x.id)}"><table class="ivr-table"><thead><tr><th>Criterion</th><th>Auto</th><th>Evidence from scoring</th><th>Teacher score</th></tr></thead><tbody>${IV_RUBRIC.criteria.map(c=>`<tr><td>${ivEsc(c.name)}</td><td>${x.auto.scores[c.key]}/4</td><td>${x.auto.notes[c.key].map(ivEsc).join('<br>')}</td><td><select name="${c.key}"${isTeacher?'':' disabled'}>${[1,2,3,4].map(v=>`<option value="${v}"${f.scores[c.key]===v?' selected':''}>${v} – ${IV_RUBRIC.levels[v]}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table>
  <label>Teacher comment<textarea name="comment" rows="2"${isTeacher?'':' disabled'}>${ivEsc(x.review?.comment||'')}</textarea></label>${isTeacher?'<button class="btn" type="submit">Save review</button>':'<p class="muted">Only a signed-in teacher can change the final score.</p>'}${x.review?`<p class="muted">Reviewed by ${ivEsc(x.review.by)} on ${ivEsc(new Date(x.review.at).toLocaleString())}. Final: ${f.total}/20 (${tg}).</p>`:''}<span role="status"></span></form></details>`}).join('');
 return `<section class="ivr"><h2>InterV Writing Tasks</h2><p class="muted">Each writing task is auto-scored with a 5-criterion analytic rubric (1 Beginning – 4 Advanced): ${IV_RUBRIC.criteria.map(c=>ivEsc(c.name)).join(', ')}. Raw scores (out of 20) are converted with the DepEd transmutation table (DO 8, s. 2015). Teachers may review and adjust each criterion.</p>${log.length?rows:'<p>No writing tasks have been submitted yet.</p>'}${log.length?'<button class="btn secondary" type="button" data-ivr-csv>Export InterV writing as CSV</button>':''}</section>`;
}
function ivReportsWire(root){
 root.querySelectorAll('.ivr-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const log=ivWritingLog(),x=log.find(y=>y.id===f.dataset.id);if(!x)return;
  const scores={};IV_RUBRIC.criteria.forEach(c=>scores[c.key]=Number(f.elements[c.key].value));
  x.review={scores,comment:f.elements.comment.value.trim(),by:(user&&user.name)||'Teacher',at:new Date().toISOString()};
  f.querySelector('[role=status]').textContent=ivWritingLogSave(log)?'Review saved.':'Unable to save.';}));
 root.querySelector('[data-ivr-csv]')?.addEventListener('click',()=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const head=['Learner','LRN','Section','Grade','Station','Task','Words','Auto total','Auto grade','Final total','Final grade','Descriptor','Reviewed','Comment','Submitted','Response'];
  const lines=ivWritingLog().map(x=>{const fs=x.review?Object.values(x.review.scores).reduce((a,b)=>a+b,0):x.auto.total,tg=ivTransmute(Math.round(fs/20*100));return [x.learner.name,x.learner.lrn,x.learner.section,x.grade,x.stationName,'Task '+x.task+': '+x.taskName,x.auto.words,x.auto.total,x.auto.transmuted,fs,tg,ivDescriptor(tg),x.review?'yes':'no',x.review?.comment||'',x.submittedAt,x.text].map(q).join(',')});
  const blob=new Blob([[head.map(q).join(','),...lines].join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='interv-writing.csv';a.click()});
}
(function(){const base=typeof renderReports==='function'?renderReports:null;if(!base)return;
 renderReports=function(){const r=base.apply(this,arguments);try{const h=[...app.querySelectorAll('h2')].find(x=>/Original School Report/.test(x.textContent));const wrap=document.createElement('div');wrap.innerHTML=ivReportsSection();if(h)h.parentNode.insertBefore(wrap,h);else (app.querySelector('.workarea')||app).append(wrap);ivReportsWire(wrap)}catch(e){console.error(e)}return r}})();
