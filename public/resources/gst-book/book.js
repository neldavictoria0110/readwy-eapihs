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
 if(state.startedAt!==null&&state.finishedAt===null&&gstTimeRemaining(state)>0&&gstTimerInterval===null)gstTimerInterval=setInterval(updateGSTTimer,250);
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
 return {...selection,title:infographic?details.title:selection.title,infographic,source:sources.join(' ').trim()||(infographic?details.source:'')};
}
// Measure actual rendered text in book coordinates, independent of scene scaling.
function fitGSTBookText(root=document.getElementById('gstSpread')){
 if(!root?.querySelectorAll)return;
 root.querySelectorAll('.gst-template-title,.gst-template-question-text').forEach(frame=>{
  const copy=frame.querySelector('.gst-fit-copy');
  if(!copy||!frame.clientWidth||!frame.clientHeight)return;
  const maximum=frame.classList.contains('gst-template-title')?28:28;
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
 return `<section class="gst-paper gst-left gst-summary-paper gst-designed-summary"><p class="gst-summary-eyebrow">YOUR READING CHAPTER</p><h1 class="gst-summary-ribbon">Test completed</h1><div class="gst-score-medallion"><strong>${result.percentage}%</strong><span>overall score</span></div><div class="gst-summary-statrow"><div><b>${result.score}</b><span>Correct answers</span></div><div><b>${incorrect}</b><span>For practice</span></div></div><div class="gst-summary-closing"><span aria-hidden="true">&#10022;</span><p>Your answers have been submitted.</p><small>Every page is a step forward.</small></div></section><section class="gst-paper gst-right gst-summary-paper gst-designed-summary gst-next-chapter"><p class="gst-summary-eyebrow">THE ADVENTURE CONTINUES</p><h2>Your next chapter</h2><div class="gst-next-goal-art" role="img" aria-label="Illustrated books and microphone"></div><h3>Oral Reading<br>Screening Test</h3><p>Bring the story to life with your voice.</p><div class="gst-next-details"><div><b>Read aloud</b><span>Follow the passage at your own pace.</span></div><div><b>Show your fluency</b><span>Let your accuracy and expression shine.</span></div></div><button class="btn gst-continue-orst" onclick="go('map')">Continue to ORST &rarr;</button></section>`;
}
function gstReviewMarkup(data,saved,count,submitted){
 const remaining=data.questions.length-count;
 return `<section class="gst-paper gst-left gst-summary-paper gst-designed-summary"><p class="gst-summary-eyebrow">PAUSE &amp; REFLECT</p><h1 class="gst-summary-ribbon">Review your answers</h1><div class="gst-score-medallion"><strong>${count}</strong><span>of ${data.questions.length} answered</span></div><div class="gst-summary-statrow"><div><b>${remaining}</b><span>Still to answer</span></div><div><b>${Math.round(count/data.questions.length*100)}%</b><span>Complete</span></div></div><div class="gst-summary-closing"><span aria-hidden="true">&#10022;</span><p>One last look before you finish.</p><small>Select a question on the facing page to revisit your answer.</small></div></section><section class="gst-paper gst-right gst-summary-paper gst-review-page"><h2>Your answer sheet</h2><div class="gst-review">${data.questions.map(q=>'<button aria-label="Review question '+q.number+(saved[q.number]?', answer '+saved[q.number]:', unanswered')+'" onclick="jumpGSTQuestion('+(q.number-1)+')">'+q.number+'<span>'+ (saved[q.number]||'&#8212;')+'</span></button>').join('')}</div><p class="gst-review-note" id="gstSubmitStatus" role="status">${submitted?'Your answers have been submitted.':remaining===0?'All questions answered. Ready to finish?':remaining+' unanswered. Complete every question before submitting.'}</p>${submitted?'<button class="btn gst-review-submit" onclick="showGSTResults()">View results &rarr;</button>':'<button class="btn gst-review-submit" onclick="submitGSTBook()" '+(remaining?'disabled':'')+'>Submit answers</button>'}</section>`;
}

function renderGSTBookSpread({preserveLeft=false}={}){
 const spread=document.getElementById('gstSpread');if(!spread)return;const data=GST_BOOK_DATA[String(gstBook.grade)],saved=load('answer_'+gstBook.grade,{}),count=data.questions.filter(q=>['A','B','C','D'].includes(saved[q.number])).length,submitted=gstIsSubmitted(saved),showResults=submitted&&!gstBook.review&&gstBook.index>=data.questions.length;
 if(gstBook.index===-1){spread.innerHTML=`<section class="gst-paper gst-left gst-title-paper" aria-label="Group Screening Test title"><p class="gst-title-kicker">READwy &#183; Grade ${gstBook.grade}</p><div class="gst-title-emblem" aria-hidden="true"><svg viewBox="0 0 120 100" fill="none"><path d="M12 27Q34 17 60 32Q86 17 108 27L103 81Q82 72 60 87Q38 72 17 81Z" fill="#fff1b4" stroke="#c39139" stroke-width="3"/><path d="M60 32V87M21 38Q38 33 51 42M22 49Q38 44 51 53M69 42Q82 33 99 38M69 53Q82 44 98 49" stroke="#b58538" stroke-width="2.5" stroke-linecap="round"/><path d="M60 4L64 15L76 19L64 23L60 35L56 23L44 19L56 15Z" fill="#f8cb60"/><path d="M20 9L22 15L28 17L22 19L20 25L18 19L12 17L18 15ZM100 8L102 14L108 16L102 18L100 24L98 18L92 16L98 14Z" fill="#cf9b41"/></svg></div><h1><span class="gst-title-overline">Group</span><br>Screening<br>Test</h1><div class="gst-title-flourish" aria-hidden="true"><span></span>&#10022;<span></span></div><p class="gst-title-subtitle">The Gateway of Discovery</p><p class="gst-title-motto">Read &#183; Think &#183; Explore</p></section><section class="gst-paper gst-right gst-title-paper gst-title-directions" aria-label="Test directions"><h2>Before you begin</h2><div class="gst-title-facts"><span><b>40</b> questions</span><span><b>45</b> minutes</span></div><p>The Group Screening Test checks your reading comprehension through a timed set of questions.</p><p>Read each selection carefully and choose the best answer for each of the 40 questions.</p><p>You have 45 minutes. The timer starts once you hit the button.</p><button type="button" class="gst-title-begin btn" onclick="gstNextAction()">Begin test &rarr;</button></section>`;}


 else if(showResults){const result=gstScoreAnswers(gstBook.grade,saved);spread.innerHTML=gstResultsMarkup(result);save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),...result})}
 else if(gstBook.index>=data.questions.length){spread.innerHTML=gstReviewMarkup(data,saved,count,submitted);save('assessment_'+gstBook.grade,{...load('assessment_'+gstBook.grade,{}),type:'gst',answered:count,date:new Date().toISOString(),answers:saved});}
 else{
  const q=data.questions[gstBook.index],passage=data.passages[q.group],selection=gstSelectionLayout(passage);
  spread.classList.add('gst-assessment');
  const markup=`<section class="gst-paper gst-left${selection.infographic?' gst-infographic-page':''}" aria-label="Reading selection. Literal Comprehension (Items 1 to 7)"><div class="gst-left-content-clean" aria-hidden="true"></div><span class="gst-template-question-count" aria-label="Question ${q.number} of ${data.questions.length}">Question ${q.number} of ${data.questions.length}</span><span class="gst-page-grade">Literal Comprehension<br><small>(Items 1-7)</small></span><h2 class="gst-template-title"><span class="gst-fit-copy">${h(selection.title)}</span></h2>${selection.infographic?'':`<div class="gst-template-passage" tabindex="0" aria-label="Reading passage">${selection.body.split('\n').map(t=>`<p>${h(t)}</p>`).join('')}</div>`}<div class="gst-template-illustration">${passage.images.length?passage.images.map(src=>`<a href="${safeURL(src)}" target="_blank" rel="noopener" aria-label="Open ${h(selection.title)} infographic at full size"><img src="${safeURL(src)}" alt="${h(selection.title)} — original reading selection infographic"></a>`).join(''):gstPhoto(q.group)}</div>${selection.source?`<small class="gst-source-credit">${h(selection.source)}</small>`:''}</section><section class="gst-paper gst-right"><span class="gst-template-question-number" aria-hidden="true">${q.number}</span><h2 class="gst-template-question-text" id="gstQuestionTitle"><span class="gst-fit-copy">${h(q.question)}</span></h2><fieldset class="gst-template-options" aria-labelledby="gstQuestionTitle">${['A','B','C','D'].map((letter,index)=>`<label class="gst-template-option gst-template-option-${letter}${q.optionIllustrations?.[letter]?' has-illustration':''}" aria-label="${letter}. ${h(q.options[letter]||'See original source')}"><input type="radio" name="gstAnswer" value="${letter}" ${saved[q.number]===letter?'checked':''} onchange="answerGSTBook(${q.number},'${letter}')"><span class="gst-template-option-text" tabindex="0">${h(q.options[letter]||'See original source')}</span>${q.optionIllustrations?.[letter]?`<img class="gst-option-illustration" src="${safeURL(q.optionIllustrations[letter])}" alt="">`:''}</label>`).join('')}</fieldset><p class="gst-save-status gst-template-save" id="gstSaveStatus" role="status">${saved[q.number]?'Answer '+saved[q.number]+' saved':''}</p></section>`;
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
 selectedGrade=gstBook.grade;storeAnswer(number,letter);
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
 const artwork=new Image();artwork.src='resources/gst-book/assessment-clear-page.png';try{await artwork.decode()}catch{}
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
function speakGSTOwl(button){
 if(typeof readwyCanPlaySound==='function'&&!readwyCanPlaySound())return;
 if(gstOwlUtterance){stopGSTOwlSpeech();return}
 const synthesis=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
 if(!synthesis||!Utterance){
  const status=document.getElementById('gstSaveStatus');if(status)status.textContent='Speech playback is unavailable in this browser.';
  return;
 }
 const utterance=new Utterance(GST_OWL_MESSAGE),voices=synthesis.getVoices();
 utterance.voice=voices.find(voice=>/^en-PH/i.test(voice.lang))||voices.find(voice=>/^en-US/i.test(voice.lang))||voices.find(voice=>/^en/i.test(voice.lang))||null;
 utterance.lang=utterance.voice?.lang||'en-US';utterance.rate=.92*(typeof readwySpeechRate==='function'?readwySpeechRate():1);utterance.pitch=1.08;utterance.volume=typeof readwyVolume==='function'?readwyVolume():1;
 gstOwlUtterance=utterance;gstOwlAudioButton=button;
 button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Stop the owl’s instructions');
 utterance.onstart=()=>{if(gstOwlUtterance===utterance)setGSTOwlSpeaking(true)};
 const finished=()=>{if(gstOwlUtterance===utterance){setGSTOwlSpeaking(false);gstOwlUtterance=null;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Read the owl’s instructions aloud');gstOwlAudioButton=null}};
 utterance.onend=finished;utterance.onerror=finished;
 synthesis.cancel();synthesis.resume();synthesis.speak(utterance);
}

function positionGSTRightPage(spread){
 const panel=spread?.querySelector('.gst-right');if(!panel)return;
 if(spread.closest('.gst-book-canvas')?.dataset.scene!=='review'){panel.style.transform='none';return}
 // Fit the entire answer sheet to the inset of the illustrated gold frame.
 const [p0,p1,p2,p3]=[[1016,84],[1439,80],[1464,687],[1016,687]];
 const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0];
 const dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];
 const det=dx1*dy2-dx2*dy1,g=(dx3*dy2-dx2*dy3)/det,j=(dx1*dy3-dx3*dy1)/det;
 panel.style.transform=`matrix3d(${(p1[0]-p0[0]+g*p1[0])/455},${(p1[1]-p0[1]+g*p1[1])/455},0,${g/455},${(p3[0]-p0[0]+j*p3[0])/650},${(p3[1]-p0[1]+j*p3[1])/650},0,${j/650},0,0,1,0,${p0[0]},${p0[1]},0,1)`;
}

function gstLivingOwlMarkup(){return '<div class="gst-wand-clean" aria-hidden="true"></div><div class="gst-live-wand" aria-hidden="true"><img src="UI%20and%20owl/owl%20poses/wand%20clean.png" alt=""></div><div class="gst-live-grip" aria-hidden="true"></div><svg class="gst-live-eyes" viewBox="0 0 1536 1024" aria-hidden="true"><defs><linearGradient id="gstLidTone" x2="0" y2="1"><stop stop-color="#b56a29"/><stop offset=".65" stop-color="#f5d7a5"/><stop offset="1" stop-color="#fff0d4"/></linearGradient><clipPath id="gstEyeBounds"><ellipse cx="160" cy="305" rx="25" ry="29"/><ellipse cx="230" cy="298" rx="22" ry="28"/></clipPath></defs><g clip-path="url(#gstEyeBounds)"><g class="gst-live-lids"><ellipse cx="160" cy="305" rx="26" ry="30" fill="url(#gstLidTone)"/><ellipse cx="230" cy="298" rx="23" ry="29" fill="url(#gstLidTone)"/><path d="M136 309 Q160 324 184 309 M209 302 Q230 317 251 302" fill="none" stroke="#653615" stroke-width="3"/></g></g></svg>';}


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
