const wstInterface={step:0,grade:7,text:'',plan:'',submitted:false,mode:'draft',checks:{},ticket:null};
const WST_TIME_LIMIT_MS=45*60*1000;
const WST_ASSESSMENTS={
 7:{type:'Argumentative essay',task:'Should the U.S. capital stay in Washington, D.C., or move to a new location? Use information from the source texts to support your position.',pdf:'https://flfast.org/content/contentresources/en/2022_BEST-Sample-Items_7W_508.pdf',checks:['I clearly state my position.','I use relevant evidence from the source texts.','I explain how the evidence supports my reasons.','My ideas are organized from beginning to end.','I reread for clear sentences and conventions.']},
 8:{type:'Expository essay',task:'How can clothing influence people’s thoughts and actions? Explain your ideas using information from the source texts.',pdf:'https://flfast.org/content/contentresources/en/2022_BEST-Sample-Items_8W_508.pdf',checks:['I clearly explain how clothing can affect people.','I use relevant information from the source texts.','I explain the connections between details and my ideas.','My ideas are organized from beginning to end.','I reread for clear sentences and conventions.']},
 9:{type:'Argumentative essay',task:'Should community service be required for high school students? Use information from the source texts to support your position.',pdf:'https://flfast.org/content/contentresources/en/2022_BEST-Sample-Items_9W_508.pdf',checks:['I clearly state my position.','I use relevant evidence from the source texts.','I explain how the evidence supports my reasons.','My ideas are organized from beginning to end.','I reread for clear sentences and conventions.']},
 10:{type:'Expository essay',task:'What are the benefits of pushing beyond a person’s comfort zone? Explain your ideas using information from the source texts.',pdf:'https://flfast.org/content/contentresources/en/2022_BEST-Sample-Items_10W_508.pdf',checks:['I clearly explain the benefits of pushing beyond a comfort zone.','I use relevant information from the source texts.','I explain the connections between details and my ideas.','My ideas are organized from beginning to end.','I reread for clear sentences and conventions.']}
};
let wstTimerInterval=null;

function wstAssessment(grade=wstInterface.grade){return WST_ASSESSMENTS[grade]||WST_ASSESSMENTS[7]}
function wstTimerState(grade=wstInterface.grade){
 const saved=load('wst_timer_'+grade,null);
 const valid=saved&&saved.durationMs===WST_TIME_LIMIT_MS&&Number.isFinite(saved.startedAt)&&Number.isFinite(saved.deadline)&&saved.deadline>=saved.startedAt&&(saved.finishedAt===null||Number.isFinite(saved.finishedAt))&&Number.isFinite(saved.remainingMs)&&saved.remainingMs>=0&&saved.remainingMs<=WST_TIME_LIMIT_MS;
 return valid?saved:{durationMs:WST_TIME_LIMIT_MS,startedAt:null,deadline:null,finishedAt:null,remainingMs:WST_TIME_LIMIT_MS};
}
function wstTimeRemaining(state=wstTimerState(),now=Date.now()){
 return Math.max(0,state.finishedAt!==null?state.remainingMs:state.deadline===null?WST_TIME_LIMIT_MS:state.deadline-now);
}
function wstFormatTime(remaining=wstTimeRemaining()){
 const seconds=Math.ceil(remaining/1000);
 return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
function wstStartTimer(){
 let state=wstTimerState();
 if(state.startedAt===null||state.finishedAt!==null||wstTimeRemaining(state)===0){
  const now=Date.now();
  state={durationMs:WST_TIME_LIMIT_MS,startedAt:now,deadline:now+WST_TIME_LIMIT_MS,finishedAt:null,remainingMs:WST_TIME_LIMIT_MS};
  save('wst_timer_'+wstInterface.grade,state);
 }
 wstSyncTimer();return state;
}
function wstSyncTimer(){
 wstUpdateTimer();const state=wstTimerState();
 if(state.startedAt!==null&&state.finishedAt===null&&wstTimeRemaining(state)>0&&wstTimerInterval===null)wstTimerInterval=setInterval(wstUpdateTimer,250);
}
function wstUpdateTimer(){
 const state=wstTimerState(),clock=app.querySelector('.wst-timer'),remaining=wstTimeRemaining(state),seconds=Math.ceil(remaining/1000);
 if(clock){
  clock.textContent=wstFormatTime(remaining);
  clock.setAttribute('datetime',`PT${seconds}S`);
  clock.setAttribute('aria-label',`Practice time remaining: ${Math.floor(seconds/60)} minutes ${seconds%60} seconds`);
 }
 if(state.startedAt!==null&&state.finishedAt===null&&remaining===0){
  const editor=app.querySelector('.wst-editor');if(editor)wstSaveDraft(editor.value);
  wstSubmit(true);
 }
 if(state.startedAt===null||state.finishedAt!==null){clearInterval(wstTimerInterval);wstTimerInterval=null}
}
function wstLoadGrade(grade){
 wstInterface.grade=grade;selectedGrade=grade;
 wstInterface.text=load('wst_draft_'+grade,{text:''}).text||'';
 wstInterface.plan=load('wst_plan_'+grade,{text:''}).text||'';
 wstInterface.checks=load('wst_checks_'+grade,{})||{};
 wstInterface.submitted=!!load('wst_submission_'+grade,null);
}
function wstFinishSubmission(timedOut=false){
 const result={grade:wstInterface.grade,text:wstInterface.text,plan:wstInterface.plan,words:wstWordCount(wstInterface.text),date:new Date().toISOString(),timedOut};
 if(load('wst_submission_'+wstInterface.grade,null)?.text!==result.text)save('wst_score_'+wstInterface.grade,null);
 save('wst_submission_'+wstInterface.grade,result);wstInterface.submitted=true;
 const state=wstTimerState();
 if(state.startedAt!==null&&state.finishedAt===null){state.remainingMs=wstTimeRemaining(state);state.finishedAt=Date.now();save('wst_timer_'+wstInterface.grade,state)}
 clearInterval(wstTimerInterval);wstTimerInterval=null;
 return result;
}
function openWST(){
 if(navigationBusy||orstInterface.busy)return false;
 orstStopAudio();wstInterface.step=0;wstInterface.ticket=null;
 const signupGrade=Number(user?.grade);if([7,8,9,10].includes(signupGrade))selectedGrade=signupGrade;
 wstLoadGrade(selectedGrade);
 return transition('wst',()=>{renderWSTInterface();wstSyncTimer()});
}
function wstChooseGrade(grade){
 if(navigationBusy||![7,8,9,10].includes(grade))return false;
 wstLoadGrade(grade);
 if(page==='wst'&&wstInterface.step===0){renderWSTInterface();return true}
 wstInterface.ticket=null;
 return wstTurnTo(0);
}
function wstSaveDraft(text){
 wstInterface.text=text;wstInterface.submitted=false;
 save('wst_draft_'+wstInterface.grade,{text,date:new Date().toISOString()});
 const counter=app.querySelector('.wst-word-count');if(counter)counter.textContent=`${wstWordCount(text)} words`;
 const status=app.querySelector('.wst-draft-status');if(status)status.textContent='Saved on this device';
}
function wstSavePlan(text){
 wstInterface.plan=text;
 save('wst_plan_'+wstInterface.grade,{text,date:new Date().toISOString()});
 const status=app.querySelector('.wst-plan-status');if(status)status.textContent='Plan saved';
}
function wstSetMode(mode){
 if(!['plan','draft'].includes(mode))return false;
 const editor=app.querySelector('.wst-editor');if(editor)wstSaveDraft(editor.value);
 const planner=app.querySelector('.wst-planner');if(planner)wstSavePlan(planner.value);
 wstInterface.mode=mode;renderWSTInterface();return true;
}
function wstSetCheck(index,checked){
 if(!Number.isInteger(index)||index<0||index>=wstAssessment().checks.length)return false;
 wstInterface.checks={...wstInterface.checks,[index]:!!checked};
 save('wst_checks_'+wstInterface.grade,wstInterface.checks);
 const summary=app.querySelector('.wst-review-progress');
 if(summary)summary.textContent=`${Object.values(wstInterface.checks).filter(Boolean).length} of ${wstAssessment().checks.length} reflection checks`;
 return true;
}
function wstWordCount(text){return text.trim()?text.trim().split(/\s+/).length:0}
function wstTurnTo(step){
 if(navigationBusy||!Number.isInteger(step)||step<0||step>3||step===wstInterface.step)return false;
 const editor=app.querySelector('.wst-editor');if(editor)wstSaveDraft(editor.value);
 const planner=app.querySelector('.wst-planner');if(planner)wstSavePlan(planner.value);
 if(step===2){wstInterface.submitted=false;wstStartTimer()}
 wstInterface.ticket=null;
 return transition('wst',()=>{wstInterface.step=step;renderWSTInterface()});
}
function wstSubmit(timedOut=false){
 if(navigationBusy||wstInterface.submitted)return false;
 if(!timedOut&&wstInterface.step!==3)return wstTurnTo(3);
 if(!timedOut&&!wstInterface.text.trim())return wstTurnTo(2);
 wstFinishSubmission(timedOut);
 if(page!=='wst')return true;
 return transition('assessment-summary',()=>renderAssessmentSummary());
}
function wstGradeSelector(){
 return `<div class="wst-grade-selector" role="group" aria-label="Select assessment grade">${[7,8,9,10].map(grade=>`<button class="wst-grade-choice" type="button" aria-pressed="${wstInterface.grade===grade}" onclick="wstChooseGrade(${grade})">Grade ${grade}</button>`).join('')}</div>`;
}
function wstProgress(){
 const labels=['Choose grade','Read the task','Plan & write','Reflect & submit'];
 return `<nav class="wst-progress" aria-label="Writing steps">${labels.map((label,index)=>`<span class="wst-progress-step ${index===wstInterface.step?'is-current':''} ${index<wstInterface.step?'is-done':''}" ${index===wstInterface.step?'aria-current="step"':''}><span>${index<wstInterface.step?'✓':index+1}</span>${label}</span>`).join('')}</nav>`;
}
function wstTaskCard(){
 const assessment=wstAssessment();
 return `<section class="wst-task-card"><div class="wst-task-label"><span class="wst-task-icon" aria-hidden="true">✦</span><span>YOUR WRITING TASK · GRADE ${wstInterface.grade}</span><span class="wst-task-type">${h(assessment.type)}</span></div><p>${h(assessment.task)}</p><a class="wst-source-link" href="${assessment.pdf}" target="_blank" rel="noopener noreferrer">Open official sample and source texts <span aria-hidden="true">↗</span></a></section>`;
}
function wstHeader(){
 const timed=wstInterface.step===2||wstInterface.step===3;
 const sampleLink=timed?`<a class="wst-header-link" href="${wstAssessment().pdf}" target="_blank" rel="noopener noreferrer">Source texts ↗</a>`:'';
 const timer=timed?`<div class="wst-timer-wrap"><span>Practice timer</span><time class="wst-timer" role="timer" aria-live="off" datetime="PT${Math.ceil(wstTimeRemaining()/1000)}S">${wstFormatTime()}</time></div>`:'';
 return `<header class="wst-header"><a class="wst-brand" href="#" onclick="go('map');return false" aria-label="READwy Writing Express home"><span class="wst-brand-emblem" aria-hidden="true">W</span><span><small>READwy · FLORIDA B.E.S.T.</small><strong>Writing Screening Test</strong></span></a><div class="wst-header-tools">${sampleLink}${timer}<button class="wst-home-button" type="button" onclick="go('map')">Exit to journey</button></div></header>`;
}
function wstWelcomeContent(){
 return `<section class="wst-trial-landing" aria-label="Writing Express WST home"><div class="wst-trial-image-wrap"><img class="wst-trial-art" src="resources/wst/trial-wst.jpg" alt="Writing Express at a sunny station, with a locomotive and four learning cards"><span class="wst-art-title">Writing Screening Test</span><div class="wst-station-glimmer" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wst-trial-hotspots" aria-label="WST dashboard actions"><button class="wst-trial-hotspot wst-hotspot-practice" type="button" aria-label="Practice Items: explore the released sample task" onclick="wstOpenTicket('practice')"></button><button class="wst-trial-hotspot wst-hotspot-test" type="button" aria-label="Take the Test: begin your timed writing practice" onclick="wstOpenTicket('test')"></button><button class="wst-trial-hotspot wst-hotspot-progress" type="button" aria-label="My Progress: view your saved writing progress" onclick="wstShowProgress()"></button><button class="wst-trial-hotspot wst-hotspot-tools" type="button" aria-label="Test Tools: open the official sample and source texts" onclick="wstOpenTicket('tools')"></button></div></div><div class="wst-trial-mobile-actions" aria-label="Writing Express actions"><button type="button" onclick="wstOpenTicket('practice')">Practice Items</button><button type="button" onclick="wstOpenTicket('test')">Take the Test</button><button type="button" onclick="wstShowProgress()">My Progress</button><button type="button" onclick="wstOpenTicket('tools')">Test Tools</button></div>${wstTicketContent()}</section>`;
}
function wstTicketContent(){
 if(!wstInterface.ticket)return '';
 const assessment=wstAssessment(),gradeOptions=[7,8,9,10].map(grade=>`<option value="${grade}" ${grade===wstInterface.grade?'selected':''}>Grade ${grade}</option>`).join('');
 const gradeSelect=`<label class="wst-ticket-grade">Practice grade <select aria-label="Choose assessment grade" onchange="wstChooseGrade(Number(this.value))">${gradeOptions}</select></label>`;
 const tickets={
  practice:{label:'PRACTICE PASS',title:'Your writing task',description:`Read the released Grade ${wstInterface.grade} prompt, then explore the source texts before you plan.`,detail:`<p class="wst-ticket-prompt">${h(assessment.task)}</p><a class="wst-ticket-link" href="${assessment.pdf}" target="_blank" rel="noopener noreferrer">Open official sample and source texts <span aria-hidden="true">↗</span></a>`,action:'Read the task',onclick:'wstTurnTo(1)',meta:'PRACTICE'},
  test:{label:'WRITING EXPRESS PASS',title:'Ready to write?',description:`Your ${assessment.type.toLowerCase()} practice is ready. Your plan and essay save on this device.`,detail:`<p class="wst-ticket-detail-copy">Board for a 45-minute self-guided practice. Open the source packet whenever you need it.</p><div class="wst-ticket-facts"><span><small>WRITING TIME</small><strong>45 minutes</strong></span><span><small>RESPONSE</small><strong>${h(assessment.type)}</strong></span></div>`,action:'Start writing practice',onclick:'wstTurnTo(2)',meta:'DEPARTURE'},
  progress:{label:'JOURNEY RECEIPT',title:'Your writing progress',description:'Your saved work stays on this device until you submit it for teacher review.',detail:`<div class="wst-ticket-facts"><span><small>PLANNING WORDS</small><strong>${wstWordCount(wstInterface.plan)}</strong></span><span><small>DRAFT WORDS</small><strong>${wstWordCount(wstInterface.text)}</strong></span><span><small>REFLECTION</small><strong>${Object.values(wstInterface.checks).filter(Boolean).length} of ${assessment.checks.length} checks</strong></span><span><small>STATUS</small><strong>${load('wst_submission_'+wstInterface.grade,null)?'Submitted':'Saved on device'}</strong></span></div>`,action:wstWordCount(wstInterface.text)||wstWordCount(wstInterface.plan)?'Continue writing':'Explore the task',onclick:wstWordCount(wstInterface.text)||wstWordCount(wstInterface.plan)?"wstOpenDashboardRoute(2,'draft')":"wstTurnTo(1)",meta:'PROGRESS'},
  tools:{label:'TRAVELER TOOLS',title:'Official sample materials',description:`Review the released Grade ${wstInterface.grade} writing sample and source texts in a new tab.`,detail:`<div class="wst-ticket-facts"><span><small>GRADE</small><strong>${wstInterface.grade}</strong></span><span><small>TASK TYPE</small><strong>${h(assessment.type)}</strong></span></div><p class="wst-ticket-detail-copy">These official sample materials open separately, so your writing workspace stays right here.</p>`,action:'Open official sample',href:assessment.pdf,meta:'SOURCE PACKET'}
 };
 const ticket=tickets[wstInterface.ticket];
 if(!ticket)return '';
 const action=ticket.href?`<a class="wst-primary-button wst-ticket-action" href="${ticket.href}" target="_blank" rel="noopener noreferrer">${ticket.action} <span aria-hidden="true">↗</span></a>`:`<button class="wst-primary-button wst-ticket-action" type="button" onclick="${ticket.onclick}">${ticket.action} <span aria-hidden="true">→</span></button>`;
 return `<dialog class="wst-progress-dialog wst-ticket-dialog" aria-labelledby="wst-ticket-title"><div class="wst-ticket-shell"><button class="wst-progress-close" type="button" aria-label="Close ticket" onclick="wstCloseTicket()">×</button><div class="wst-ticket-main"><p class="wst-ticket-kicker">${ticket.label}</p><h2 id="wst-ticket-title">${ticket.title}</h2><p class="wst-ticket-description">${ticket.description}</p>${gradeSelect}${ticket.detail}${action}</div><aside class="wst-ticket-stub" aria-label="Ticket details"><span class="wst-ticket-stamp" aria-hidden="true">W</span><p>WRITING<br>EXPRESS</p><strong>${ticket.meta}</strong><span class="wst-ticket-code" aria-hidden="true"></span><small>GRADE ${wstInterface.grade} · WST</small></aside></div></dialog>`;
}
function wstOpenTicket(ticket){
 if(!['practice','test','progress','tools'].includes(ticket))return false;
 wstInterface.ticket=ticket;renderWSTInterface();
 const dialog=app.querySelector('.wst-ticket-dialog');
 if(!dialog)return false;
 if(typeof dialog.showModal==='function'){if(!dialog.open)dialog.showModal()}else dialog.setAttribute('open','');
 return true;
}
function wstCloseTicket(){
 wstInterface.ticket=null;
 const dialog=app.querySelector('.wst-ticket-dialog');if(dialog&&typeof dialog.close==='function')dialog.close();
}
function wstShowProgress(){return wstOpenTicket('progress')}
function wstOpenDashboardRoute(step,mode){
 if(!Number.isInteger(step)||step<1||step>3||!['read','plan','draft'].includes(mode))return false;
 if(step===2)wstInterface.mode=mode;
 return wstTurnTo(step);
}
function wstTaskContent(){
 return `<div class="wst-page-heading"><div><p class="wst-eyebrow">STOP 1 · UNDERSTAND THE TASK</p><h2>Read, think, then plan.</h2><p>You can open the released source packet separately. It will not replace your writing workspace.</p></div><button class="wst-secondary-button" type="button" onclick="wstTurnTo(0)">Change grade</button></div>${wstTaskCard()}<section class="wst-coach-card"><span class="wst-coach-icon" aria-hidden="true">✎</span><div><h3>Before you write</h3><p>Think about what the task asks you to explain or argue. As you read the sources, note details you may want to use and why they support your ideas.</p></div></section><div class="wst-page-actions"><button class="wst-primary-button" type="button" onclick="wstTurnTo(2)">Open my writing desk <span aria-hidden="true">→</span></button></div>`;
}
function wstPlanningPane(){
 return `<div class="wst-plan-scaffold"><div class="wst-plan-intro"><span class="wst-plan-number">01</span><div><h3>Shape your thinking</h3><p>Capture rough ideas first. Your plan stays private to this device unless you submit your response.</p></div></div><label for="wst-planner">Your plan and source notes</label><textarea class="wst-planner" id="wst-planner" aria-label="Plan your ideas and notes from the sources" placeholder="Main idea or position…&#10;&#10;Reason or key idea 1 + source detail…&#10;&#10;Reason or key idea 2 + source detail…&#10;&#10;How I will organize my response…&#10;">${h(wstInterface.plan)}</textarea><div class="wst-plan-hints"><span>What is my main idea?</span><span>Which source details help?</span><span>How will I connect them?</span></div><p class="wst-plan-status" role="status">Plan saves automatically</p></div>`;
}
function wstDraftPane(){
 return `<div class="wst-draft-pane"><div class="wst-draft-toolbar"><div><h3>Your essay</h3><p>Write in your own words. Use the source texts to support your thinking.</p></div><span class="wst-word-count">${wstWordCount(wstInterface.text)} words</span></div><label class="wst-visually-hidden" for="wst-essay">Write your Florida B.E.S.T. Writing response</label><textarea class="wst-editor" id="wst-essay" aria-label="Write your Florida B.E.S.T. Writing response" placeholder="Begin with your central idea. Develop your ideas in organized paragraphs and use details from the sources where they strengthen your explanation." spellcheck="true" oninput="wstSaveDraft(this.value)">${h(wstInterface.text)}</textarea><div class="wst-editor-foot"><p class="wst-draft-status" role="status">Saved on this device</p><span>Use paragraphs to organize your ideas</span></div></div>`;
}
function wstWritingContent(){
 const writingStarted=wstTimerState().startedAt!==null;
 return `<div class="wst-writing-title"><div><p class="wst-eyebrow">STOP 2 · YOUR WRITING DESK</p><h2>Write in your own voice.</h2></div><p class="wst-save-badge"><span aria-hidden="true">●</span> Saves automatically</p></div>${wstTaskCard()}<div class="wst-workspace"><nav class="wst-work-tabs" aria-label="Writing tools"><button type="button" class="${wstInterface.mode==='plan'?'is-active':''}" aria-pressed="${wstInterface.mode==='plan'}" onclick="wstSetMode('plan')"><span>01</span> Plan</button><button type="button" class="${wstInterface.mode==='draft'?'is-active':''}" aria-pressed="${wstInterface.mode==='draft'}" onclick="wstSetMode('draft')"><span>02</span> Draft</button></nav><section class="wst-work-area">${wstInterface.mode==='plan'?wstPlanningPane():wstDraftPane()}</section></div><div class="wst-page-actions wst-writing-actions">${writingStarted?'<span class="wst-time-note">Your practice clock is running.</span>':''}<button class="wst-primary-button" type="button" onclick="wstTurnTo(3)">Continue to reflection <span aria-hidden="true">→</span></button></div>`;
}
function wstReflectionContent(){
 const assessment=wstAssessment(),checked=Object.values(wstInterface.checks).filter(Boolean).length;
 return `<div class="wst-page-heading"><div><p class="wst-eyebrow">STOP 3 · WRITER’S REFLECTION</p><h2>Read your work like a writer.</h2><p>This is a reflection guide, not an automatic score. Your teacher reviews submitted writing.</p></div><button class="wst-secondary-button" type="button" onclick="wstTurnTo(2)">Back to writing</button></div>${wstTaskCard()}<div class="wst-reflection-layout"><section class="wst-review-card"><div class="wst-review-heading"><div><p class="wst-eyebrow">YOUR RESPONSE</p><h3>${wstWordCount(wstInterface.text)} words</h3></div><button class="wst-secondary-button" type="button" onclick="wstTurnTo(2)">Edit response</button></div><div class="wst-review-text" tabindex="0" aria-label="Read your essay">${h(wstInterface.text)}</div></section><section class="wst-check-card"><p class="wst-eyebrow">SELF-REFLECTION · NO SCORE</p><h3>Before you submit</h3><p>Check what you have reviewed. You can return to your essay at any time.</p><div class="wst-check-list">${assessment.checks.map((item,index)=>`<label class="wst-check-item"><input type="checkbox" ${wstInterface.checks[index]?'checked':''} onchange="wstSetCheck(${index},this.checked)"><span>${h(item)}</span></label>`).join('')}</div><p class="wst-review-progress" role="status">${checked} of ${assessment.checks.length} reflection checks</p></section></div><div class="wst-page-actions"><button class="wst-primary-button" type="button" onclick="wstSubmit()">Submit for teacher review <span aria-hidden="true">→</span></button></div>`;
}
function renderWSTInterface(){
 page='wst';activeModule='wst';nav.innerHTML='';stopOwlFlight();owl.dataset.motion='still';owl.style.display='none';
 const step=wstInterface.step;
 const content=[wstWelcomeContent,wstTaskContent,wstWritingContent,wstReflectionContent][step]();
 if(step===0){
  app.innerHTML=`<section class="wst-assessment-screen wst-landing-screen"><div class="wst-trial-stage">${content}</div></section>`;
  positionWSTInterface();
  if(wstInterface.ticket){const dialog=app.querySelector('.wst-ticket-dialog');if(dialog&&typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal()}
  app.scrollTo(0,0);return;
 }
 app.innerHTML=`<section class="wst-assessment-screen"><div class="wst-train-lights" aria-hidden="true"><span></span><span></span><span></span></div><div class="wst-assessment-shell">${wstHeader()}${wstProgress()}<main class="wst-assessment-main" aria-label="Florida B.E.S.T. Writing practice, step ${step+1} of 4">${content}</main><footer class="wst-footer"><span>WRITING SCREENING TEST · READ, THINK, PLAN & WRITE</span><span>Released sample tasks · teacher-reviewed writing</span></footer></div></section>`;
 wstSyncTimer();positionWSTInterface();app.scrollTo(0,0);
}
function positionWSTInterface(){
 const screen=app.querySelector('.wst-assessment-screen');if(!screen)return;
 screen.style.setProperty('--wst-height',`${app.clientHeight||window.innerHeight}px`);
}
(()=>{
 const previousRender=render;
 render=function(){if(page==='wst')return renderWSTInterface();return previousRender()};
})();
window.addEventListener('resize',positionWSTInterface,{passive:true});
function speakWSTWelcome(){
 if(!readwyCanPlaySound()||!window.speechSynthesis)return;
 window.speechSynthesis.cancel();
 const speech=new SpeechSynthesisUtterance('Welcome to Writing Express. Choose your grade and explore the writing task. Plan your ideas, write in your own voice, and use the reflection checklist before you submit for teacher review.');
 speech.lang='en-US';speech.rate=.9*readwySpeechRate();speech.volume=readwyVolume();window.speechSynthesis.speak(speech);
}
