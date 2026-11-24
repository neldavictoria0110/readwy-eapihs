
const gstBook={grade:7,index:-1,busy:false,animation:null,review:false,returnIndex:0};
// Start a 45-minute attempt when the student clicks Begin test.
const GST_TIME_LIMIT_MS=45*60*1000;
const gstTimers=new Map();
let gstTimerInterval=null;
function gstTimerState(grade=gstBook.grade){
 if(!gstTimers.has(grade)){
  const saved=load('gst_timer_'+grade,null);
  const valid=saved&&saved.durationMs===GST_TIME_LIMIT_MS&&Number.isFinite(saved.startedAt)&&Number.isFinite(saved.deadline)&&saved.deadline>=saved.startedAt;
  gstTimers.set(grade,valid?saved:{durationMs:GST_TIME_LIMIT_MS,startedAt:null,deadline:null,finishedAt:null,remainingMs:GST_TIME_LIMIT_MS});
 }
 return gstTimers.get(grade);
}
function gstTimeRemaining(state=gstTimerState(),now=Date.now()){
 return Math.max(0,state.finishedAt!==null?state.remainingMs:state.deadline===null?GST_TIME_LIMIT_MS:state.deadline-now);
}
function updateGSTTimer(){
 const clock=document.getElementById('gstTimer');
 if(!clock){clearInterval(gstTimerInterval);gstTimerInterval=null;return}
 const state=gstTimerState(),remaining=gstTimeRemaining(state),seconds=Math.ceil(remaining/1000);
 const minutes=Math.floor(seconds/60),rest=seconds%60;
 clock.textContent=String(minutes).padStart(2,'0')+':'+String(rest).padStart(2,'0');
 clock.setAttribute('datetime',`PT${seconds}S`);
 clock.setAttribute('aria-label',`Time remaining: ${minutes} minutes ${rest} seconds${state.finishedAt!==null?'. Test completed':''}`);
 if(state.startedAt===null||state.finishedAt!==null||remaining===0){clearInterval(gstTimerInterval);gstTimerInterval=null}
}
function startGSTTimer(restart=false){
 let state=gstTimerState();
 if(restart||state.startedAt===null||state.finishedAt!==null||gstTimeRemaining(state)===0){
  const now=Date.now();
  state={durationMs:GST_TIME_LIMIT_MS,startedAt:now,deadline:now+GST_TIME_LIMIT_MS,finishedAt:null,remainingMs:GST_TIME_LIMIT_MS};
  gstTimers.set(gstBook.grade,state);save('gst_timer_'+gstBook.grade,state);
 }
 syncGSTTimer();
}
function syncGSTTimer(){
 const state=gstTimerState();
 updateGSTTimer();
 if(state.startedAt!==null&&state.finishedAt===null&&gstTimeRemaining(state)>0&&gstTimerInterval===null)gstTimerInterval=setInterval(updateGSTTimer,1000);
}
function finishGSTTimer(){
 const state=gstTimerState();if(state.startedAt===null||state.finishedAt!==null)return;
 const now=Date.now();state.remainingMs=gstTimeRemaining(state,now);state.finishedAt=now;
 save('gst_timer_'+gstBook.grade,state);
 const answers=load('answer_'+gstBook.grade,{});
 save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),type:'gst',answered:Object.values(answers).filter(v=>['A','B','C','D'].includes(v)).length,answers,date:new Date(now).toISOString(),startedAt:state.startedAt,completedAt:now,elapsedMs:now-state.startedAt,remainingMs:state.remainingMs});
 updateGSTTimer();
}
const GST_PHOTO_DESCRIPTIONS=['Flowers at sunset','A Venus flytrap','Tropical rainfall','Recycling materials','A person looking across an African landscape','A Philippine festival','A river at dawn','A forest and cleared land','Two woodland paths','A supportive conversation','Ocean waves','A classroom brain model','A person facing the morning sun','Friends talking outdoors','A weaving loom','A farmer in a rice field'];
function openGSTBook(){
 for(const file of ['2-right-full.png','3.png','4-next-only.png']){const image=new Image();image.src='UI%20and%20owl/gst/'+file;}

 page='work';activeModule='gst';const signupGrade=Number(user?.grade);gstBook.grade=[7,8,9,10].includes(signupGrade)?signupGrade:selectedGrade;selectedGrade=gstBook.grade;gstBook.index=-1;gstBook.busy=false;gstBook.review=false;
 // Entering the title page prepares a fresh, idle timer; only Begin test starts it.
 clearInterval(gstTimerInterval);gstTimerInterval=null;
 const idleTimer={durationMs:GST_TIME_LIMIT_MS,startedAt:null,deadline:null,finishedAt:null,remainingMs:GST_TIME_LIMIT_MS};
 gstTimers.set(gstBook.grade,idleTimer);save('gst_timer_'+gstBook.grade,idleTimer);
 stopGSTOwlSpeech();
 nav.innerHTML='';setOwl('signup-form');
 app.innerHTML=`<section class="gst-book-screen" aria-label="Group Screening Test book"><div class="gst-book-canvas">${gstLivingOwlMarkup()}<div class="gst-book-underlay" aria-hidden="true"></div><div class="gst-owl-repair" aria-hidden="true"></div><div class="gst-owl-actor gst-owl-idle" id="gstOwlActor" aria-hidden="true"><div class="gst-owl-sprite"></div><div class="gst-owl-eyelids"></div></div><div class="gst-book-group"><div class="gst-book-art" aria-hidden="true"></div><div class="gst-spread" id="gstSpread"></div><button class="gst-painted-next" type="button" aria-label="Next: begin the Group Screening Test" onclick="gstNextAction()"></button></div><button class="gst-result-proceed" type="button" aria-label="Proceed to Oral Reading Screening Test" onclick="openModule('orst')"></button><nav class="gst-page-hotspots" aria-label="Book pages"><button class="gst-previous-page" aria-label="Previous page" onclick="turnGSTPage(-1)">Previous</button><button class="gst-next-page" aria-label="Next page" onclick="gstNextAction()">Next</button><button class="gst-return-sheet" type="button" onclick="showGSTSummary()">Answer Sheet</button></nav><div class="gst-owl-message"><div class="gst-owl-parchment" aria-hidden="true"></div><button class="gst-owl-audio" type="button" aria-label="Read the owl’s instructions aloud" aria-pressed="false" onclick="speakGSTOwl(this)"></button></div><time class="gst-timer" id="gstTimer" role="timer" aria-live="off" aria-label="Time remaining: 45 minutes">45:00</time><nav class="gst-art-tabs" aria-label="Screening tests"><button aria-label="Group Screening Test" onclick="showGSTGrades()"></button><button aria-label="Oral Reading Screening Test" onclick="openModule('orst')"></button><button aria-label="Writing Screening Test" onclick="openModule('srst')"></button></nav><nav class="gst-backdrop-toolbar" aria-label="Test navigation"><button class="gst-toolbar-journey" aria-label="Journey" onclick="go('map')"></button><button class="gst-toolbar-profile" aria-label="Profile" onclick="renderProfile()"></button><button class="gst-toolbar-progress" aria-label="Achievements and saved answers" onclick="showGSTSummary()"></button><button class="gst-toolbar-book" aria-label="Home" onclick="gstHome()"></button><button class="gst-toolbar-messages" aria-label="Messages" onclick="showGSTMessage()"></button><button class="gst-toolbar-settings" aria-label="Settings" onclick="renderSettings()"></button><button class="gst-toolbar-exit" aria-label="Exit test" onclick="go('map')"></button></nav></div></section>`;
 const spread=document.getElementById('gstSpread');let start=null;
 spread.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;start={x:event.clientX,y:event.clientY,id:event.pointerId,target:event.target};});
 spread.addEventListener('pointerup',event=>{if(!start||start.id!==event.pointerId)return;const portrait=document.documentElement.hasAttribute('data-display-portrait'),dx=portrait?event.clientY-start.y:event.clientX-start.x,dy=portrait?event.clientX-start.x:event.clientY-start.y;start=null;if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;turnGSTPage(dx<0?1:-1);});
 spread.addEventListener('pointercancel',()=>{start=null});
 renderGSTBookSpread();positionGSTBook();app.scrollTo(0,0);
 gstCatStart();
}
/* The cat reads to itself, grows sleepy and dozes off. Answering or turning a page wakes it to read again. */
const gstCatTimes={read:16000,drowsy:6500};let gstCatTimers=[];
function gstCatSet(state){const cat=document.getElementById('gstCat');if(!cat)return false;cat.classList.remove('is-reading','is-drowsy','is-asleep');cat.classList.add('is-'+state);return true}
function gstCatWake(){
 gstCatTimers.forEach(clearTimeout);gstCatTimers=[];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')){gstCatSet('asleep');return}
 if(!gstCatSet('reading'))return;
 gstCatTimers=[setTimeout(()=>gstCatSet('drowsy'),gstCatTimes.read),setTimeout(()=>gstCatSet('asleep'),gstCatTimes.read+gstCatTimes.drowsy)];
}
/* The owl praises effort only, never whether an answer is right. */
const GST_OWL_CHEERS={1:'Great start! Keep going.',5:'5 done. Nice work!',10:'10 done. You are doing well!',20:'Halfway there. Keep it up!',30:'Only 10 more. You can do it!',40:'All done! Press Review to check.'};
let gstCheerTimer=0;
function gstOwlCheer(text){
 const bubble=document.getElementById('gstOwlCheer');if(!bubble)return;
 clearTimeout(gstCheerTimer);bubble.textContent=text;bubble.classList.add('is-on');
 gstCheerTimer=setTimeout(()=>bubble.classList.remove('is-on'),4200);
}
function gstCatStart(){
 const screen=document.querySelector('.gst-book-screen');if(!screen)return;
 for(const type of ['pointerdown','keydown'])screen.addEventListener(type,gstCatWake,{passive:true});
 gstCatWake();
 setTimeout(()=>gstOwlCheer("Hi, I'm Gus! We will do this together."),900);
 setTimeout(()=>readwyOwlAuto('gst'),800);
 document.fonts?.addEventListener?.('loadingdone',()=>fitGSTBookText());
 ['700 20px Cinzel','400 20px Lora','600 20px Lora','italic 14px Lora'].forEach(font=>document.fonts?.load?.(font));
}
function gstBookLayout(width,height){
 // Fill the shared landscape stage with the original artwork and its controls.
 const scaleX=width/1536,scaleY=height/1024,scale=scaleY,offsetX=0,offsetY=0;
 return {scale,scaleX,scaleY,offsetX,offsetY,visibleBottom:1024,bookShift:0,bookScale:1,bookShiftY:0,toolbarHeight:125,toolbarTop:865,controlsTop:766};
}
function positionGSTBook(){
 const screen=document.querySelector('.gst-book-screen'),canvas=screen?.querySelector('.gst-book-canvas');if(!canvas)return;
 const layout=gstBookLayout(screen.clientWidth,screen.clientHeight);
 canvas.style.transform=`translate(${layout.offsetX}px,${layout.offsetY}px) scale(${layout.scaleX},${layout.scaleY})`;
 canvas.style.setProperty('--gst-book-shift',layout.bookShift+'px');
 canvas.style.setProperty('--gst-book-scale',layout.bookScale);
 canvas.style.setProperty('--gst-book-shift-y',layout.bookShiftY+'px');
 const controls=canvas.querySelector('.gst-page-hotspots');
 if(controls){controls.style.top=layout.controlsTop+'px';controls.style.left='665px'}
 canvas.style.setProperty('--gst-paper-height',Math.min(550,layout.visibleBottom-215-170)+'px');
 canvas.querySelector('.gst-backdrop-toolbar').style.top=layout.toolbarTop+'px';
 fitGSTBookText();
}

function showGSTGrades(){if(gstBook.busy)return;gstBook.review=false;gstBook.index=-1;renderGSTBookSpread();}

function gstPhoto(group){const row=gstBook.grade-7,alt=GST_PHOTO_DESCRIPTIONS[row*4+group];return `<figure class="gst-context-photo"><div role="img" aria-label="${h(alt)}" style="--gst-photo-column:${group};--gst-photo-row:${row};background-position:${group*100/3}% ${row*100/3}%"></div><figcaption>Reading illustration · ${h(alt)}</figcaption></figure>`;}
function gstSelectionCopy(passage){
 const text=passage.text||'',lines=text.split('\n');
 if(text.startsWith('Plant Intelligence '))return {title:'Plant Intelligence',body:text.slice('Plant Intelligence '.length)};
 const hasTitle=lines.length>1&&lines[0].length<110&&!/^(source|questions written|infographic from)/i.test(lines[0]);
 return {title:hasTitle?lines.shift():'Reading selection',body:hasTitle?lines.join('\n'):text};
}
const GST_INFOGRAPHIC_DETAILS={
 7:{title:'Solid Waste Management',source:'Infographic from: DENR-EMB Region 1 Website: https://r1.emb.gov.ph/organizational-chart/'},
 8:{title:'Deforestation',source:'Source: original Grade 8 GST assessment infographic.'},
 9:{title:'Brain Aneurysms',source:'Adapted from: http://www.bafound.org/brain-aneurysm-basics'},
 10:{title:'Transforming Philippine Agriculture',source:'Source: www.da.gov.ph'}
};
function gstSelectionLayout(passage,grade=gstBook.grade){
 const body=[],sources=[];let sourceStarted=false;
 for(const line of (passage.text||'').split('\n')){
  const match=line.match(/(?:sources?\s*:|infographic from\s*:|questions written by|https?:\/\/|www\.)/i);
  if(match){if(!sourceStarted&&match.index>0)body.push(line.slice(0,match.index).trim());sources.push(line.slice(match.index));sourceStarted=true}
  else if(sourceStarted)sources.push(line);else body.push(line);
 }
 const infographic=passage.images.length>0,selection=gstSelectionCopy({...passage,text:body.join('\n')}),details=GST_INFOGRAPHIC_DETAILS[grade];
 const bodyLines=selection.body.split('\n'),authorLines=[];
 while(bodyLines.length>1&&/^(by\s|from\s+["\u201c]|from greek|([A-Z][a-z]+\s+){1,3}([A-Z]\.\s+)?[A-Z][a-z]+$)/i.test(bodyLines[0].trim())&&bodyLines[0].length<60&&(authorLines.length||/^(by\s|from\s)/i.test(bodyLines[0].trim())||/^([A-Z][a-z]+\s+){1,3}([A-Z]\.\s+)?[A-Z][a-z]+$/.test(bodyLines[0].trim()))&&(authorLines.length===0||/^(by\s|from\s)/i.test(bodyLines[0].trim())))authorLines.push(bodyLines.shift().trim());
 /* Word counts are dropped, references go to the small credit, writers go under the title. */
 const kept=[],moved=[],writers=[];let inReferences=false;
 for(const raw of bodyLines){
  let line=raw.trim().replace(/\s*\(\d+\s+words\)\s*$/i,'');
  if(!line)continue;
  if(/^references?\s*:?$/i.test(line)){inReferences=true;moved.push(line);continue}
  if(inReferences){moved.push(line);continue}
  const count=line.match(/^(?:no\.?|number)\s+of\s+words\s*:?\s*\d+\s*(.*)$/i);
  if(count){line=count[1].trim();if(!line)continue}
  line=line.replace(/^\((written by [^)]*)\)$/i,'$1');
  if(/^written by\s/i.test(line)){writers.push(line);continue}
  if(/^prepared by\s/i.test(line)){moved.push(line);continue}
  kept.push(line);
 }
 const lengths=kept.map(line=>line.length).sort((x,y)=>x-y),prose=lengths.length>0&&lengths[lengths.length>>1]>=60;
 let paragraphs=kept;
 if(prose){
  const numbered=kept.some(line=>/^\[\d+\]$/.test(line));paragraphs=[];
  for(const line of kept){
   const last=paragraphs[paragraphs.length-1];
   const join=last!==undefined&&(numbered?!/^\[\d+\]/.test(line):(/^[a-z]/.test(line)||!/[.!?:"\u201d)]$/.test(last)));
   if(join)paragraphs[paragraphs.length-1]=last+' '+line;else paragraphs.push(line);
  }
 }
 selection.body=paragraphs.join('\n');selection.prose=prose;
 selection.author=[...authorLines,...writers].join('\n');
 const credit=[...moved,...sources].join(' ').replace(/([a-z])(SOURCE:)/g,'$1 $2').trim();
 return {...selection,title:infographic?details.title:selection.title,infographic,source:credit||(infographic?details.source:'')};
}
// Measure actual rendered text in book coordinates, independent of scene scaling.
/* Long questions take room from the answers; long passages take room from the picture. */
function gstFlowPage(root){
 if(!root.classList?.contains('gst-assessment'))return;
 const frame=root.querySelector('.gst-right .gst-question-frame'),text=frame?.querySelector('.gst-template-question-text'),right=frame?.closest('.gst-right');
 if(text&&right&&frame.offsetWidth){
  let size=21;text.style.fontSize=size+'px';
  while(size>15&&frame.offsetHeight>292){size-=1;text.style.fontSize=size+'px'}
  const top=12+frame.offsetHeight+10,gap=frame.offsetHeight>150?8:12,each=Math.max(56,Math.min(118,(634-top-3*gap)/4));
  right.style.setProperty('--opt-top',top+'px');right.style.setProperty('--opt-gap',gap+'px');right.style.setProperty('--opt-h',each+'px');
  right.querySelectorAll('.gst-template-option-text').forEach(option=>{option.style.fontSize='';for(let s=21;s>=13&&(option.scrollHeight>option.clientHeight+1||option.scrollWidth>option.clientWidth+1);s-=1)option.style.fontSize=s+'px'});
 }
 const leftPage=root.querySelector('.gst-left'),title=leftPage?.querySelector('.gst-template-title'),author=leftPage?.querySelector('.gst-template-author');
 if(!title)return;
 let top=title.offsetTop+title.offsetHeight+6;
 if(author){author.style.top=(top-4)+'px';top+=author.offsetHeight+4}
 const rule=leftPage.querySelector('.gst-title-rule');
 if(rule){rule.style.top=top+'px';top+=rule.offsetHeight+8}
 const passage=leftPage.querySelector('.gst-template-passage'),picture=leftPage.querySelector('.gst-template-illustration'),credit=leftPage.querySelector('.gst-source-credit');
 const bottom=credit?580:622;
 if(passage){
  passage.style.top=top+'px';passage.style.height=(bottom-top)+'px';
  passage.classList.toggle('gst-passage-more',passage.scrollHeight>passage.clientHeight+2);
 }
 if(picture){picture.style.top=top+'px';picture.style.height=(bottom-top)+'px'}
}
function fitGSTBookText(root=document.getElementById('gstSpread')){
 if(!root?.querySelectorAll)return;
 gstFlowPage(root);
 root.querySelectorAll('.gst-template-title').forEach(frame=>{
  const copy=frame.querySelector('.gst-fit-copy');
  if(!copy||!frame.clientWidth||!frame.clientHeight)return;
  const maximum=frame.classList.contains('gst-template-title')?28:24;
  function fits(size){
   frame.style.fontSize=size+'px';
   return copy.scrollWidth<=frame.clientWidth&&copy.scrollHeight<=frame.clientHeight;
  }
  if(fits(maximum))return;
  let low=1,high=maximum;
  // Find the largest size that keeps the full title or question inside its frame.
  for(let step=0;step<14;step++){
   const middle=(low+high)/2;
   if(fits(middle))low=middle;else high=middle;
  }
  fits(Math.floor(low*100)/100);
 });
}
function gstSharesSelection(from,to,grade=gstBook.grade){
 const data=GST_BOOK_DATA[String(grade)];
 if(from<0||to<0||from>=data.questions.length||to>=data.questions.length)return false;
 const a=data.passages[data.questions[from].group],b=data.passages[data.questions[to].group];
 return a.text===b.text&&JSON.stringify(a.images)===JSON.stringify(b.images);
}
function gstApplySpreadMarkup(spread,markup,preserveLeft){
 const left=preserveLeft?spread.querySelector?.('.gst-left'):null,right=preserveLeft?spread.querySelector?.('.gst-right'):null;
 if(left&&right){
  const template=document.createElement('template');template.innerHTML=markup;
  const newRight=template.content.querySelector('.gst-right'),newCount=template.content.querySelector('.gst-template-question-count'),count=left.querySelector('.gst-template-question-count');
  if(newRight){right.replaceWith(newRight);if(count&&newCount){count.textContent=newCount.textContent;count.setAttribute('aria-label',newCount.getAttribute('aria-label'))}return}
 }
 spread.innerHTML=markup;
}
function gstScoreAnswers(grade,answers){
 const data=GST_BOOK_DATA[String(grade)],key=GST_ANSWER_KEYS[String(grade)];
 if(!key||key.length!==data.questions.length)throw new Error('Complete reviewed answer key required');
 let score=0,creditedItems=0;
 const details=data.questions.map(q=>{
  const item=key.find(entry=>entry.number===q.number);
  if(!item)throw new Error('Missing answer key for question '+q.number);
  const correct=item.accepted.includes(answers[q.number]);
  if(correct)score++;if(correct&&item.credit)creditedItems++;
  return {number:q.number,answer:answers[q.number]||null,correct,accepted:item.accepted,credit:!!item.credit};
 });
 return {score,total:data.questions.length,percentage:Math.round(100*score/data.questions.length),creditedItems,answerKeyVersion:GST_ANSWER_KEY_VERSION,details};
}
function gstResultsMarkup(result){
 const incorrect=result.total-result.score;
 return `<section class="gst-paper gst-left gst-summary-paper gst-designed-summary"><div class="gst-plaque"><p class="gst-summary-eyebrow">YOUR READING CHAPTER</p><h1 class="gst-summary-ribbon">Test completed</h1></div><div class="gst-score-medallion"><strong>${result.percentage}%</strong><span>overall score</span></div><div class="gst-summary-statrow"><div><b>${result.score}</b><span>Correct answers</span></div><div><b>${incorrect}</b><span>For practice</span></div></div><div class="gst-summary-closing"><span aria-hidden="true">&#10022;</span><p>Your answers have been submitted.</p><small>Every page is a step forward.</small></div></section><section class="gst-paper gst-right gst-summary-paper gst-designed-summary gst-next-chapter"><div class="gst-plaque"><p class="gst-summary-eyebrow">THE ADVENTURE CONTINUES</p><h2>Your next chapter</h2></div><div class="gst-next-goal-art" role="img" aria-label="Illustrated books and microphone"></div><h3>Oral Reading<br>Screening Test</h3><p>Bring the story to life with your voice.</p><div class="gst-next-details"><div><b>Read aloud</b><span>Follow the passage at your own pace.</span></div><div><b>Show your fluency</b><span>Let your accuracy and expression shine.</span></div></div><button class="btn gst-continue-orst" onclick="go('map')">Continue to ORST &rarr;</button></section>`;
}
function gstReviewMarkup(data,saved,count,submitted){
 const remaining=data.questions.length-count;
 return `<section class="gst-paper gst-left gst-summary-paper gst-designed-summary"><div class="gst-plaque"><p class="gst-summary-eyebrow">PAUSE &amp; REFLECT</p><h1 class="gst-summary-ribbon">Review your answers</h1></div><div class="gst-score-medallion"><strong>${count}</strong><span>of ${data.questions.length} answered</span></div><div class="gst-summary-statrow"><div><b>${remaining}</b><span>Still to answer</span></div><div><b>${Math.round(count/data.questions.length*100)}%</b><span>Complete</span></div></div><div class="gst-summary-closing"><span aria-hidden="true">&#10022;</span><p>One last look before you finish.</p><small>Select a question on the facing page to revisit your answer.</small></div></section><section class="gst-paper gst-right gst-summary-paper gst-review-page"><div class="gst-plaque"><p class="gst-summary-eyebrow">QUESTIONS 1 TO ${data.questions.length}</p><h2>Your answer sheet</h2></div><div class="gst-review">${data.questions.map(q=>'<button'+(saved[q.number]?' class="is-answered"':'')+' aria-label="Review question '+q.number+(saved[q.number]?', answer '+saved[q.number]:', unanswered')+'" onclick="jumpGSTQuestion('+(q.number-1)+')">'+q.number+'<span>'+ (saved[q.number]||'&#8212;')+'</span></button>').join('')}</div><p class="gst-review-note" id="gstSubmitStatus" role="status">${submitted?'Your answers have been submitted.':remaining===0?'All questions answered. Ready to finish?':remaining+' unanswered. Complete every question before submitting.'}</p>${submitted?'<button class="btn gst-review-submit" onclick="showGSTResults()">View results &rarr;</button>':'<button class="btn gst-review-submit" onclick="submitGSTBook()" '+(remaining?'disabled':'')+'>Submit answers</button>'}</section>`;
}

function renderGSTBookSpread({preserveLeft=false}={}){
 const spread=document.getElementById('gstSpread');if(!spread)return;const data=GST_BOOK_DATA[String(gstBook.grade)],saved=load('answer_'+gstBook.grade,{}),count=data.questions.filter(q=>['A','B','C','D'].includes(saved[q.number])).length,submitted=gstIsSubmitted(saved),showResults=submitted&&!gstBook.review&&gstBook.index>=data.questions.length;
 if(gstBook.index===-1){spread.innerHTML=`<section class="gst-paper gst-left gst-title-paper" aria-label="Group Screening Test title"><p class="gst-title-kicker">READwy &#183; Grade ${gstBook.grade}</p><div class="gst-title-emblem" aria-hidden="true"><svg viewBox="0 0 200 150" fill="none"><defs><radialGradient id="gstBookGlow"><stop stop-color="#ffe9a8" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd877" stop-opacity=".35"/><stop offset="1" stop-color="#ffd877" stop-opacity="0"/></radialGradient><linearGradient id="gstBookCover" x2="0" y2="1"><stop stop-color="#24508c"/><stop offset="1" stop-color="#0d2548"/></linearGradient><linearGradient id="gstPageL" x2="1"><stop stop-color="#fff9e8"/><stop offset=".8" stop-color="#fbeac4"/><stop offset="1" stop-color="#e2c489"/></linearGradient><linearGradient id="gstPageR" x1="1" x2="0"><stop stop-color="#fff9e8"/><stop offset=".8" stop-color="#fbeac4"/><stop offset="1" stop-color="#e2c489"/></linearGradient></defs><ellipse class="gst-book-glow" cx="100" cy="66" rx="96" ry="66" fill="url(#gstBookGlow)"/><path d="M12 50Q55 34 100 54Q145 34 188 50L182 136Q142 124 100 144Q58 124 18 136Z" fill="url(#gstBookCover)" stroke="#e8bd66" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 44Q60 28 98 50V134Q60 116 26 126Z" fill="url(#gstPageL)" stroke="#c9994a" stroke-width="1.2"/><path d="M180 44Q140 28 102 50V134Q140 116 174 126Z" fill="url(#gstPageR)" stroke="#c9994a" stroke-width="1.2"/><path d="M36 56Q62 48 86 62M35 70Q62 62 86 76M34 84Q62 76 86 90M33 98Q60 90 86 104M164 56Q138 48 114 62M165 70Q138 62 114 76M166 84Q138 76 114 90M167 98Q140 90 114 104" stroke="#b5832a" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><path class="gst-book-turn" d="M102 50Q140 28 178 44L172 126Q138 116 102 134Z" fill="url(#gstPageR)" stroke="#c9994a" stroke-width="1.2"/><path d="M100 50V142" stroke="#8a5f22" stroke-width="2.2"/><path d="M128 124V148L135 141L142 148V120Z" fill="#c8323c" stroke="#7d1a22" stroke-width="1"/><text class="gst-book-letter l1" x="66" y="34" fill="#c9862a">A</text><text class="gst-book-letter l2" x="96" y="30" fill="#24508c">b</text><text class="gst-book-letter l3" x="128" y="34" fill="#c8323c">C</text><path class="gst-book-star s1" d="M26 12l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#f8cb60"/><path class="gst-book-star s2" d="M172 8l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#f8cb60"/><path class="gst-book-star s3" d="M100 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#fff1c7"/></svg></div><h1><span class="gst-title-overline">Group</span><br>Screening<br>Test</h1><div class="gst-title-flourish" aria-hidden="true"><span></span>&#10022;<span></span></div><p class="gst-title-subtitle">The Gateway of Discovery</p><p class="gst-title-motto"><span>Read</span><span>Think</span><span>Explore</span></p></section><section class="gst-paper gst-right gst-title-paper gst-title-directions" aria-label="Test directions"><div class="gst-plaque"><p class="gst-summary-eyebrow">YOU CAN DO THIS</p><h2>Before you begin</h2></div><ol class="gst-steps"><li><span class="gst-step-icon" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M4 8Q12 4 20 9Q28 4 36 8V32Q28 28 20 33Q12 28 4 32Z" fill="#fff4d8" stroke="#ffe6a9" stroke-width="2" stroke-linejoin="round"/><path d="M20 9V33" stroke="#ffe6a9" stroke-width="2"/></svg></span><span class="gst-step-copy"><b>Read</b><small>Read each story slowly.</small></span></li><li><span class="gst-step-icon" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 4A12 12 0 0 0 13 26V30H27V26A12 12 0 0 0 20 4Z" fill="#fff4d8" stroke="#ffe6a9" stroke-width="2"/><path d="M15 35H25" stroke="#ffe6a9" stroke-width="3" stroke-linecap="round"/></svg></span><span class="gst-step-copy"><b>Think</b><small>What is the story telling you?</small></span></li><li><span class="gst-step-icon" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#fff4d8" stroke="#ffe6a9" stroke-width="2"/><path d="M12 20L18 26L29 14" stroke="#173a6b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span><span class="gst-step-copy"><b>Pick</b><small>Choose the best answer.</small></span></li></ol><div class="gst-title-facts"><span><b>40</b> questions</span><span><b>45</b> minutes</span></div><p class="gst-title-note">The timer starts when you press Begin. Your answers save by themselves, and you can go back and change them.</p><div class="gst-title-actions"><button type="button" class="gst-title-begin btn" onclick="stopGSTOwlSpeech();gstNextAction()">Begin test &rarr;</button></div></section>`;}


 else if(showResults){const result=gstScoreAnswers(gstBook.grade,saved);spread.innerHTML=gstResultsMarkup(result);save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),...result})}
 else if(gstBook.index>=data.questions.length){spread.innerHTML=gstReviewMarkup(data,saved,count,submitted);save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),type:'gst',answered:count,date:new Date().toISOString(),answers:saved});}
 else{
  const q=data.questions[gstBook.index],passage=data.passages[q.group],selection=gstSelectionLayout(passage);
  spread.classList.add('gst-assessment');
  const markup=`<section class="gst-paper gst-left${selection.infographic?' gst-infographic-page':''}" aria-label="Reading selection"><div class="gst-left-content-clean" aria-hidden="true"></div><h2 class="gst-template-title"><span class="gst-fit-copy">${h(selection.title)}</span></h2>${selection.author?`<p class="gst-template-author">${h(selection.author)}</p>`:''}<div class="gst-title-rule" aria-hidden="true"><span>✦</span></div>${selection.infographic?'':`<div class="gst-template-passage${selection.prose?' gst-passage-prose':''}" tabindex="0" aria-label="Reading passage">${selection.body.split('\n').map(t=>`<p>${h(t)}</p>`).join('')}</div>`}${passage.images.length?`<div class="gst-template-illustration">${passage.images.map(src=>`<a href="${safeURL(src)}" target="_blank" rel="noopener" aria-label="Open ${h(selection.title)} infographic at full size"><img src="${safeURL(src)}" alt="${h(selection.title)} — original reading selection infographic"></a>`).join('')}</div>`:''}${selection.source?`<small class="gst-source-credit">${h(selection.source)}</small>`:''}</section><section class="gst-paper gst-right"><div class="gst-question-frame"><span class="gst-template-question-count" aria-label="Question ${q.number} of ${data.questions.length}">Question ${q.number} of ${data.questions.length}</span><h2 class="gst-template-question-text${/\n/.test(q.question)?' gst-question-list':''}" id="gstQuestionTitle"><span class="gst-fit-copy">${h(q.question)}</span></h2><span class="gst-progress" aria-hidden="true"><i style="width:${count/data.questions.length*100}%"></i></span></div><fieldset class="gst-template-options" aria-labelledby="gstQuestionTitle">${['A','B','C','D'].map((letter,index)=>`<label class="gst-template-option gst-template-option-${letter}${q.optionIllustrations?.[letter]?' has-illustration':''}" aria-label="${letter}. ${h(q.options[letter]||'See original source')}"><input type="radio" name="gstAnswer" value="${letter}" ${saved[q.number]===letter?'checked':''} onchange="answerGSTBook(${q.number},'${letter}')"><span class="gst-template-option-text" tabindex="0">${h(q.options[letter]||'See original source')}</span>${q.optionIllustrations?.[letter]?`<img class="gst-option-illustration" src="${safeURL(q.optionIllustrations[letter])}" alt="">`:''}</label>`).join('')}</fieldset><p class="gst-save-status gst-template-save" id="gstSaveStatus" role="status">${saved[q.number]?'Answer '+saved[q.number]+' saved':''}</p></section>`;
  gstApplySpreadMarkup(spread,markup,preserveLeft);
 }
 if(gstBook.index<0||gstBook.index>=data.questions.length)spread.classList.remove('gst-assessment');
 spread.classList.toggle('gst-summary-spread',gstBook.index>=data.questions.length);
 if(showResults)spread.classList.add('gst-results');else spread.classList.remove('gst-results');
 spread.closest('.gst-book-canvas').dataset.scene=gstBook.index===-1?'welcome':showResults?'results':gstBook.review?'review':'test';
 spread.closest('.gst-book-canvas').dataset.finalQuestion=String(gstBook.index===data.questions.length-1);
 const controls=document.querySelector('.gst-page-hotspots');if(controls)controls.hidden=false;
 const canvas=spread.closest('.gst-book-canvas');canvas.querySelector('.gst-review-return')?.remove();
 if(gstBook.review){const back=document.createElement('button');back.type='button';back.className='gst-review-return btn';back.textContent='Back to questions';back.onclick=()=>jumpGSTQuestion(gstBook.returnIndex);canvas.append(back);}

 const previous=document.querySelector('.gst-previous-page'),next=document.querySelector('.gst-next-page');
 if(previous)previous.disabled=gstBook.index===-1;
 if(next){const submit=gstBook.index>=data.questions.length-1;next.textContent=submit?'Submit':'Next \u2192';next.disabled=gstBook.review&&submitted;next.onclick=showResults?()=>openModule('orst'):gstNextAction;next.setAttribute('aria-label',submit?'Submit answers':'Next page')}
 const answerSheet=document.querySelector('.gst-return-sheet');if(answerSheet){answerSheet.disabled=false;answerSheet.textContent=gstBook.review?'Back to Test':'Review';answerSheet.onclick=gstBook.review?()=>jumpGSTQuestion(gstBook.returnIndex):showGSTSummary;}

 positionGSTRightPage(spread);
 fitGSTBookText(spread);
 syncGSTTimer();

}
function gstIsSubmitted(answers=load('answer_'+gstBook.grade,{})){
 const report=load('assessment_'+gstBook.grade,{}),data=GST_BOOK_DATA[String(gstBook.grade)];
 return report.status==='submitted'&&data.questions.every(q=>['A','B','C','D'].includes(answers[q.number])&&report.submittedAnswers?.[q.number]===answers[q.number]);
}
function gstNextAction(){
 if(gstBook.index>=GST_BOOK_DATA[String(gstBook.grade)].questions.length-1)return submitGSTBook();
 return turnGSTPage(1);
}
function submitGSTBook(){
 const data=GST_BOOK_DATA[String(gstBook.grade)],answers=load('answer_'+gstBook.grade,{});
 if(gstBook.busy||gstBook.index<data.questions.length-1)return false;
 if(!data.questions.every(q=>['A','B','C','D'].includes(answers[q.number]))){showGSTSummary();return false;}
 if(!gstIsSubmitted(answers))save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),type:'gst',answered:data.questions.length,answers,status:'submitted',submittedAt:new Date().toISOString(),submittedAnswers:{...answers},...gstScoreAnswers(gstBook.grade,answers)});
 finishGSTTimer();showGSTResults();return true;
}
function answerGSTBook(number,letter){
 if(!['A','B','C','D'].includes(letter)||gstBook.busy)return;
 selectedGrade=gstBook.grade;
 const isDone=saved=>Object.values(saved).filter(v=>['A','B','C','D'].includes(v)).length;
 const answeredBefore=isDone(load('answer_'+gstBook.grade,{}));
 storeAnswer(number,letter);
 const answeredNow=isDone(load('answer_'+gstBook.grade,{}));
 if(answeredNow>answeredBefore&&GST_OWL_CHEERS[answeredNow])gstOwlCheer(GST_OWL_CHEERS[answeredNow]);
 const progress=document.querySelector('#gstSpread>.gst-right .gst-progress i');if(progress)progress.style.width=answeredNow/GST_BOOK_DATA[String(gstBook.grade)].questions.length*100+'%';
 const status=document.getElementById('gstSaveStatus');if(status)status.textContent='Answer '+letter+' saved';
 // Keep the timer running until submission.
}

function gstPhysicalTurnFrames(direction){
 // A single hinge rotation: no vertical lift, skew, or secondary settling.
 return [{transform:'rotateY(0deg)'},{transform:'rotateY('+(-direction*180)+'deg)'}];
}
function gstPageSnapshot(page){
 const copy=page.cloneNode(true),style=getComputedStyle(page);
 // Freeze every text/control layout before the destination changes its ancestors.
 const originals=[page,...page.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
 originals.forEach((original,index)=>{
  const computed=getComputedStyle(original),clone=clones[index];
  for(const property of computed)clone.style.setProperty(property,computed.getPropertyValue(property),'important');
  clone.style.setProperty('animation','none','important');
  clone.style.setProperty('transition','none','important');
  clone.scrollTop=original.scrollTop;clone.scrollLeft=original.scrollLeft;
 });
 copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 copy.querySelectorAll('input').forEach(node=>node.removeAttribute('name'));
 copy.style.setProperty('left',(parseFloat(style.left)-(page.classList.contains('gst-right')?980:455))+'px','important');
 copy.style.setProperty('top',(parseFloat(style.top)-46)+'px','important');
 return copy;
}
async function animateGSTPhysicalTurn(spread,next,direction,preserveLeft){
 const forward=direction===1,outgoing=spread.querySelector(forward?'.gst-right':'.gst-left');
 const oldAssessment=spread.classList.contains('gst-assessment');
 const front=gstPageSnapshot(outgoing),resting=spread.querySelector(forward?'.gst-left':'.gst-right');
 // Answer buttons remain on the resting page, never on the turning paper.
 front.querySelectorAll('.gst-template-options,.gst-save-status').forEach(node=>node.remove());
 const oldRest=!preserveLeft&&resting?gstPageSnapshot(resting):null;
 if(oldRest){const style=getComputedStyle(resting);oldRest.style.setProperty('left',style.left,'important');oldRest.style.setProperty('top',style.top,'important');}
 if(oldRest){oldRest.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));oldRest.querySelectorAll('input').forEach(node=>node.removeAttribute('name'))}
 gstBook.index=next;renderGSTBookSpread({preserveLeft});
 const landing=spread.querySelector(forward?'.gst-left':'.gst-right'),back=gstPageSnapshot(landing);
 back.querySelectorAll('.gst-template-options,.gst-save-status').forEach(node=>node.remove());
 const leaf=document.createElement('div');leaf.className='gst-physical-leaf '+(forward?'gst-physical-forward':'gst-physical-backward');
 leaf.setAttribute('aria-hidden','true');leaf.setAttribute('inert','');
 function face(content,backside,assessment){
  const surface=document.createElement('div');
  surface.className='gst-leaf-face '+(backside?'gst-leaf-back':'gst-leaf-front')+(assessment?' gst-assessment':'')+(content.classList.contains('gst-summary-paper')?' gst-summary-spread':'')+(content.classList.contains('gst-left')?' gst-face-left':' gst-face-right');
  surface.style.backgroundColor='#fff3d5';
  surface.appendChild(content);
  const shade=document.createElement('div');shade.className='gst-leaf-shade';surface.appendChild(shade);
  leaf.appendChild(surface);
  shade.animate([{opacity:0},{opacity:.24,offset:.45},{opacity:.1,offset:.7},{opacity:0}],{duration:760,easing:'ease-in-out'});
 }
 face(front,false,oldAssessment);face(back,true,spread.classList.contains('gst-assessment'));
 let oldPage=null,uncover=null;
 if(oldRest){
  oldPage=document.createElement('div');oldPage.className='gst-resting-page'+(oldAssessment?' gst-assessment':'');
  oldPage.setAttribute('aria-hidden','true');oldPage.setAttribute('inert','');
  oldPage.appendChild(oldRest);spread.appendChild(oldPage);
  uncover=setTimeout(()=>oldPage.remove(),380);
 }
 spread.appendChild(leaf);
 try{
  gstBook.animation=leaf.animate(gstPhysicalTurnFrames(direction),{duration:760,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});
  await gstBook.animation.finished;
 }finally{clearTimeout(uncover);oldPage?.remove();leaf.remove()}
}
async function turnGSTPage(direction){
 if(gstBook.busy||![-1,1].includes(direction)||!document.querySelector('.gst-book-screen'))return;
 if(gstBook.index>=GST_BOOK_DATA[String(gstBook.grade)].questions.length&&gstIsSubmitted()){if(direction===-1)jumpGSTQuestion(39);return;}
 if(direction===1&&gstBook.index===39)return gstNextAction();
 gstBook.review=false;const data=GST_BOOK_DATA[String(gstBook.grade)],next=gstBook.index+direction;
 if(next< -1||next>data.questions.length)return;
 if(gstBook.index===-1||next===-1){
 if(next===0)startGSTTimer();
 const spread=document.getElementById('gstSpread');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion');
 gstBook.busy=true;spread.classList.add('gst-turning');spread.setAttribute('aria-busy','true');
 try{
 const artwork=new Image();artwork.src='resources/gst-book/assessment-plain-book.webp';try{await artwork.decode()}catch{}
 if(reduce){gstBook.index=next;renderGSTBookSpread();}
 else await animateGSTPhysicalTurn(spread,next,direction,false);
 }finally{spread.classList.remove('gst-turning');spread.removeAttribute('aria-busy');gstBook.animation=null;gstBook.busy=false;}
 return;
}
 const spread=document.getElementById('gstSpread'),preserveLeft=gstSharesSelection(gstBook.index,next),right=spread.querySelector?.('.gst-right');
 if((typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)||document.documentElement?.classList?.contains('reduced-motion')||typeof right?.animate!=='function'||typeof right?.cloneNode!=='function'){gstBook.index=next;renderGSTBookSpread({preserveLeft});return}
 gstBook.busy=true;spread.classList.add('gst-turning');spread.setAttribute('aria-busy','true');
 const focusWithin=spread.contains(document.activeElement),focusTarget=document.activeElement;
 try{await animateGSTPhysicalTurn(spread,next,direction,preserveLeft)}
 catch(error){if(spread.isConnected){gstBook.index=next;renderGSTBookSpread({preserveLeft})}}
 finally{spread.classList.remove('gst-turning');spread.removeAttribute('aria-busy');gstBook.animation=null;gstBook.busy=false}
 if(focusWithin&&spread.isConnected){const heading=spread.querySelector('.gst-right h2');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})}}
 else if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});
}

function jumpGSTQuestion(index){if(gstBook.busy)return;gstBook.review=false;const next=Math.max(0,Math.min(39,index)),preserveLeft=gstSharesSelection(gstBook.index,next);gstBook.index=next;renderGSTBookSpread({preserveLeft});}
async function showGSTSummarySpread(review){
 if(gstBook.busy)return;
 const spread=document.getElementById('gstSpread');if(!spread)return;
 gstBook.returnIndex=Math.min(39,gstBook.index);gstBook.review=review;gstBook.busy=true;
 try{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')){gstBook.index=40;renderGSTBookSpread()}
  else if(gstBook.index>=40){
   // Replace summary spreads only after the previous ink has faded away.
   gstBook.animation=spread.animate([{opacity:1},{opacity:0}],{duration:150,easing:'ease-out',fill:'forwards'});
   await gstBook.animation.finished;
   gstBook.index=40;renderGSTBookSpread();
   gstBook.animation.cancel();
   gstBook.animation=spread.animate([{opacity:0},{opacity:1}],{duration:260,easing:'ease-in',fill:'both'});
   await gstBook.animation.finished;gstBook.animation.cancel();
  }
  else await animateGSTPhysicalTurn(spread,40,1,false);
 }finally{gstBook.busy=false;gstBook.animation=null}
}
function showGSTSummary(){return showGSTSummarySpread(true)}
function showGSTResults(){return showGSTSummarySpread(false)}
window.addEventListener('resize',positionGSTBook,{passive:true});
document.addEventListener('keydown',event=>{if(!document.querySelector('.gst-book-screen')||/INPUT|SELECT|TEXTAREA/.test(event.target.tagName)||event.target.closest('.gst-template-passage,.gst-template-option-text,.gst-template-question-text'))return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turnGSTPage(event.key==='ArrowRight'?1:-1);}});

function showGSTMessage(){const status=document.getElementById('gstSaveStatus');if(status)status.textContent='No messages. Your answers are saved on this browser.';else{const screen=document.querySelector('.gst-book-screen');if(screen){let message=screen.querySelector('.gst-message-status');if(!message){message=document.createElement('p');message.className='registration-sr-only gst-message-status';message.setAttribute('role','status');screen.append(message)}message.textContent='No messages. Your answers are saved on this browser.'}}}

// Repeat measurement if browser fonts finish loading after the first render.
document.fonts?.ready.then(()=>fitGSTBookText());

const GST_OWL_MESSAGE="Hi there! Let's begin the Group Screening Test. Read each item carefully and choose the best answer. You can do it!";
let gstOwlUtterance=null,gstOwlAudioButton=null;
function setGSTOwlSpeaking(speaking){document.getElementById('gstOwlActor')?.classList?.toggle('is-speaking',speaking)}
function stopGSTOwlSpeech(){
 setGSTOwlSpeaking(false);
 if(gstOwlUtterance)window.speechSynthesis?.cancel();
 gstOwlUtterance=null;
 if(gstOwlAudioButton){gstOwlAudioButton.setAttribute('aria-pressed','false');gstOwlAudioButton.setAttribute('aria-label','Read the owl’s instructions aloud')}
 gstOwlAudioButton=null;
}
function speakGSTOwl(button,text){
 if(typeof readwyCanPlaySound==='function'&&!readwyCanPlaySound())return;
 if(gstOwlUtterance){stopGSTOwlSpeech();return}
 const synthesis=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
 if(!synthesis||!Utterance){
  const status=document.getElementById('gstSaveStatus');if(status)status.textContent='Speech playback is unavailable in this browser.';
  return;
 }
 const utterance=new Utterance(text||GST_OWL_MESSAGE),voices=synthesis.getVoices();
 utterance.voice=voices.find(voice=>/^en-PH/i.test(voice.lang))||voices.find(voice=>/^en-US/i.test(voice.lang))||voices.find(voice=>/^en/i.test(voice.lang))||null;
 utterance.lang=utterance.voice?.lang||'en-US';utterance.rate=.92*(typeof readwySpeechRate==='function'?readwySpeechRate():1);utterance.pitch=1.08;utterance.volume=typeof readwyVolume==='function'?readwyVolume():1;
 gstOwlUtterance=utterance;gstOwlAudioButton=button;
 button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Stop the owl’s instructions');
 utterance.onstart=()=>{if(gstOwlUtterance===utterance)setGSTOwlSpeaking(true)};
 const finished=()=>{if(gstOwlUtterance===utterance){setGSTOwlSpeaking(false);gstOwlUtterance=null;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Read the owl’s instructions aloud');gstOwlAudioButton=null}};
 utterance.onend=finished;utterance.onerror=finished;
 synthesis.cancel();synthesis.resume();synthesis.speak(utterance);
}

/* Each page's content is mapped onto the page's painted corners, so everything on it shares the page's perspective. */
const GST_PAGE_FIT={left:{rect:[480,61,490,640],quad:[[468,62],[962,62],[964,702],[446,702]]},right:{rect:[1006,72,455,650],quad:[[1000,66],[1464,66],[1501,719],[1000,714]]},rightHome:{rect:[1006,72,455,650],quad:[[1000,66],[1464,66],[1480,716],[1000,712]]}};
function gstPageMatrix(fit,left,top){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=fit.quad,[rx,ry,rw,rh]=fit.rect;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,det=dx1*dy2-dx2*dy1;
 const g=(dx3*dy2-dx2*dy3)/det,j=(dx1*dy3-dx3*dy1)/det;
 const P=[[x1-x0+g*x1,x3-x0+j*x3,x0],[y1-y0+g*y1,y3-y0+j*y3,y0],[g,j,1]],U=[[1/rw,0,(left-rx)/rw],[0,1/rh,(top-ry)/rh],[0,0,1]];
 const mul=(A,B)=>A.map(r=>[0,1,2].map(c=>r[0]*B[0][c]+r[1]*B[1][c]+r[2]*B[2][c]));
 const m=mul([[1,0,-left],[0,1,-top],[0,0,1]],mul(P,U));
 return `matrix3d(${m[0][0]},${m[1][0]},0,${m[2][0]},${m[0][1]},${m[1][1]},0,${m[2][1]},0,0,1,0,${m[0][2]},${m[1][2]},0,${m[2][2]})`;
}
function gstFitPaper(page,fit){const style=getComputedStyle(page);page.style.transformOrigin='0 0';page.style.transform=gstPageMatrix(fit,parseFloat(style.left)||0,parseFloat(style.top)||0)}
function positionGSTRightPage(spread){
 const panel=spread?.querySelector('.gst-right'),leftPage=spread?.querySelector('.gst-left');
 if(leftPage)gstFitPaper(leftPage,GST_PAGE_FIT.left);
 if(!panel)return;
 gstFitPaper(panel,spread.closest('.gst-book-canvas')?.dataset.scene==='test'?GST_PAGE_FIT.right:GST_PAGE_FIT.rightHome);return;
 // Fit the entire answer sheet to the inset of the illustrated gold frame.
 const [p0,p1,p2,p3]=[[1016,84],[1439,80],[1464,687],[1016,687]];
 const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0];
 const dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];
 const det=dx1*dy2-dx2*dy1,g=(dx3*dy2-dx2*dy3)/det,j=(dx1*dy3-dx3*dy1)/det;
 panel.style.transform=`matrix3d(${(p1[0]-p0[0]+g*p1[0])/455},${(p1[1]-p0[1]+g*p1[1])/455},0,${g/455},${(p3[0]-p0[0]+j*p3[0])/650},${(p3[1]-p0[1]+j*p3[1])/650},0,${j/650},0,0,1,0,${p0[0]},${p0[1]},0,1)`;
}

function gstLivingOwlMarkup(){return (typeof readwyOwlPlate==='function'?readwyOwlPlate('gst'):'')+'<div class="gst-owl-cheer" id="gstOwlCheer" role="status"></div>'+"<div class=\"gst-cat is-asleep\" id=\"gstCat\" aria-hidden=\"true\"><div class=\"gst-cat-body\" style=\"left:296px;top:678px;width:120px;height:79px;transform-origin:44px 74px\"></div><div class=\"gst-cat-chest\" style=\"left:360px;top:694px;width:77px;height:71px\"></div><div class=\"gst-cat-pose\" style=\"left:360px;top:694px;width:77px;height:71px;transform-origin:35px 64px\"><div class=\"gst-cat-move\" style=\"transform-origin:35px 64px\"><div class=\"gst-cat-head\"></div><svg class=\"gst-cat-eyes\" viewBox=\"0 0 77 71\" aria-hidden=\"true\"><g transform=\"translate(30.19999999999999 45.60000000000002)\"><ellipse class=\"gst-cat-eyefur\" rx=\"8.5\" ry=\"5.6\"/><g class=\"gst-cat-open\"><ellipse rx=\"5.6\" ry=\"4.7\" fill=\"#2a2320\"/><ellipse cy=\".3\" rx=\"4.6\" ry=\"3.9\" fill=\"#9a8f4c\"/><g class=\"gst-cat-pupil\"><ellipse cy=\"1\" rx=\"2.5\" ry=\"3.2\" fill=\"#141110\"/><circle cx=\"1\" cy=\"-.6\" r=\".9\" fill=\"#fff\"/></g><path d=\"M-6.6-1.8Q0-6 6.6-1.8\" fill=\"none\" stroke=\"#54392f\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></g><path class=\"gst-cat-shut\" d=\"M-6.8-1Q0 3.6 6.8-1\" fill=\"none\" stroke=\"#54392f\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></g><g transform=\"translate(58.19999999999999 45.200000000000045)\"><ellipse class=\"gst-cat-eyefur\" rx=\"8.5\" ry=\"5.6\"/><g class=\"gst-cat-open\"><ellipse rx=\"5.6\" ry=\"4.7\" fill=\"#2a2320\"/><ellipse cy=\".3\" rx=\"4.6\" ry=\"3.9\" fill=\"#9a8f4c\"/><g class=\"gst-cat-pupil\"><ellipse cy=\"1\" rx=\"2.5\" ry=\"3.2\" fill=\"#141110\"/><circle cx=\"1\" cy=\"-.6\" r=\".9\" fill=\"#fff\"/></g><path d=\"M-6.6-1.8Q0-6 6.6-1.8\" fill=\"none\" stroke=\"#54392f\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></g><path class=\"gst-cat-shut\" d=\"M-6.8-1Q0 3.6 6.8-1\" fill=\"none\" stroke=\"#54392f\" stroke-width=\"1.7\" stroke-linecap=\"round\"/></g></svg></div></div><div class=\"gst-cat-paw\" style=\"left:330px;top:748px;width:31px;height:27px;transform-origin:8px 20px\"></div><svg class=\"gst-cat-page\" viewBox=\"0 0 76 34\"><path d=\"M1 3Q30-2 72 5L75 28Q40 22 2 31Z\" fill=\"#fff6e6\" stroke=\"#caa77c\" stroke-width=\".8\"/><path d=\"M12 10l42 2M12 16l48 2M12 22l34 1\" stroke=\"#d9503f\" stroke-width=\"1.6\" stroke-linecap=\"round\" opacity=\".7\"/></svg><span class=\"gst-cat-z z1\">z</span><span class=\"gst-cat-z z2\">z</span><span class=\"gst-cat-z z3\">Z</span></div>"+'<div class="gst-wand-clean" aria-hidden="true"></div><div class="gst-live-wand" aria-hidden="true"><img src="UI%20and%20owl/owl%20poses/wand%20clean.png" alt=""></div><div class="gst-live-grip" aria-hidden="true"></div><svg class="gst-live-eyes" viewBox="0 0 1536 1024" aria-hidden="true"><defs><linearGradient id="gstLidTone" x2="0" y2="1"><stop stop-color="#b56a29"/><stop offset=".65" stop-color="#f5d7a5"/><stop offset="1" stop-color="#fff0d4"/></linearGradient><clipPath id="gstEyeBounds"><ellipse cx="160" cy="305" rx="25" ry="29"/><ellipse cx="230" cy="298" rx="22" ry="28"/></clipPath></defs><g clip-path="url(#gstEyeBounds)"><g class="gst-live-lids"><ellipse cx="160" cy="305" rx="26" ry="30" fill="url(#gstLidTone)"/><ellipse cx="230" cy="298" rx="23" ry="29" fill="url(#gstLidTone)"/><path d="M136 309 Q160 324 184 309 M209 302 Q230 317 251 302" fill="none" stroke="#653615" stroke-width="3"/></g></g></svg>';}


// The same drifting, glowing letters used on the joining page, on the live book text.
function prepareGSTLetterReveal(canvas){
 let index=0;
 canvas.querySelectorAll('.gst-title-paper').forEach((paper)=>{
  const walker=document.createTreeWalker(paper,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())if(walker.currentNode.textContent.trim()&&!walker.currentNode.parentElement.closest('svg,[aria-hidden="true"]'))nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   const accessible=document.createElement('span');accessible.className='gst-ink-accessible';accessible.textContent=node.textContent;fragment.append(accessible);
   node.textContent.split(/(\s+)/).forEach(word=>{
    if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));return}
    const group=document.createElement('span');group.className='gst-ink-word';group.setAttribute('aria-hidden','true');
    Array.from(word).forEach(letter=>{const span=document.createElement('span');span.className='gst-ink-letter';span.textContent=letter;span.style.setProperty('--ink-delay',(90+index++*27.5)+'ms');group.append(span)});
    fragment.append(group);
   });node.replaceWith(fragment);
  });
 });
 canvas.classList.add('gst-letters-ready');
}

