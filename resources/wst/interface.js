/* Four writing panels, displayed individually in source order. */
const wstInterface={step:0,grade:7,text:'',submitted:false};
function openWST(){
 if(navigationBusy||orstInterface.busy)return false;
 orstStopAudio();wstInterface.step=0;const signupGrade=Number(user?.grade);if([7,8,9,10].includes(signupGrade))selectedGrade=signupGrade;wstInterface.grade=selectedGrade;
 wstInterface.text=load('wst_draft_'+selectedGrade,{text:''}).text||'';wstInterface.submitted=false;
 return transition('wst',()=>renderWSTInterface());
}
function wstChooseGrade(grade){
 if(navigationBusy||![7,8,9,10].includes(grade))return false;
 wstInterface.grade=grade;selectedGrade=grade;
 wstInterface.text=load('wst_draft_'+grade,{text:''}).text||'';wstInterface.submitted=false;
 return wstTurnTo(1);
}
function wstSaveDraft(text){
 wstInterface.text=text;wstInterface.submitted=false;
 save('wst_draft_'+wstInterface.grade,{text,date:new Date().toISOString()});
 const counter=app.querySelector('.wst-word-count');if(counter)counter.textContent='Word Count: '+wstWordCount(text);
}
function wstWordCount(text){return text.trim()?text.trim().split(/\s+/).length:0}
function wstTurnTo(step){
 if(navigationBusy||!Number.isInteger(step)||step<0||step>3||step===wstInterface.step)return false;
 const editor=app.querySelector('.wst-editor');if(editor)wstSaveDraft(editor.value);
 return transition('wst',()=>{wstInterface.step=step;renderWSTInterface()});
}
function wstSubmit(){
 if(navigationBusy||wstInterface.submitted)return false;
 if(wstInterface.step!==3)return wstTurnTo(3);
 if(!wstInterface.text.trim())return wstTurnTo(2);
 const result={grade:wstInterface.grade,text:wstInterface.text,words:wstWordCount(wstInterface.text),date:new Date().toISOString()};
 if(load('wst_submission_'+wstInterface.grade,null)?.text!==result.text)save('wst_score_'+wstInterface.grade,null);
 save('wst_submission_'+wstInterface.grade,result);
 return transition('assessment-summary',()=>{wstInterface.submitted=true;renderAssessmentSummary()});
}
/* Each flying sheet is clipped directly from the original welcome painting. */
function wstFloatingPapers(){
 const papers=[
  {x:890,y:120,path:'M843 118L895 63L936 96L891 175L868 153Z',delay:-3.8,duration:12,drift:-100},
  {x:952,y:304,path:'M881 302L981 245Q994 264 1025 279L941 363Q908 351 881 302Z',delay:-1.2,duration:11,drift:180},
  {x:1070,y:250,path:'M1016 192Q1055 202 1092 197Q1112 228 1124 300L1063 308Q1052 248 1016 192Z',delay:-5.6,duration:13,drift:260},
  {x:1550,y:40,path:'M1494 100Q1528 67 1546 0H1604Q1591 41 1575 72Z',delay:-9.2,duration:14,drift:-120},
  {x:1640,y:194,path:'M1587 225Q1614 195 1644 178L1672 156V188Q1636 210 1587 225Z',delay:-7.4,duration:12.5,drift:80}
 ];
 const original='UI%20and%20owl/wst%20file/1.png';
 return `<svg class="wst-floating-papers" viewBox="0 0 1672 941" aria-hidden="true" focusable="false"><defs><clipPath id="wst-paper-clean-regions">${papers.map(p=>`<path d="${p.path}" stroke="white" stroke-width="10" stroke-linejoin="round"/>`).join('')}</clipPath>${papers.map((p,i)=>`<clipPath id="wst-paper-${i}"><path d="${p.path}"/></clipPath>`).join('')}</defs>${papers.map((p,i)=>`<g class="wst-floating-sheet" style="--paper-x:${p.x}px;--paper-y:${p.y}px;--paper-launch-x:${1035-p.x}px;--paper-launch-y:${510-p.y}px;--paper-drift:${p.drift}px;--paper-exit-y:${-p.y-160}px;--paper-duration:${p.duration}s;--paper-delay:${p.delay}s"><image href="${original}" width="1672" height="941" clip-path="url(#wst-paper-${i})"/></g>`).join('')}</svg>`;
}
function renderWSTInterface(){
 page='wst';activeModule='wst';nav.innerHTML='';stopOwlFlight();owl.dataset.motion='still';owl.style.display='none';
 const step=wstInterface.step;
 const backgrounds=["resources/wst/welcome-paper-clean.png",... [2,3,4].map(number=>`resources/wst/stage-${number}-hd.png`)];
 let controls='';
 if(step===0)controls='<button class="wst-art-control wst-welcome-start" aria-label="Start Writing Test" onclick="wstTurnTo(1)"></button><button class="wst-art-control wst-welcome-journey" aria-label="Back to Journey Map" onclick="go(\'map\')"></button><button class="wst-art-control wst-welcome-hear" aria-label="Hear writing test instructions" onclick="speakWSTWelcome()"></button>';
 else{
  const top=step===1?29:26;
  const activePhase=step===3&&wstInterface.submitted?4:step;
  controls=[['Prompt',1],['Write',2],['Review',3],['Submit',4]].map(([name,index],i)=>`<button class="wst-art-control wst-stage-link" data-phase="${index}" ${activePhase===index?'aria-current="step"':''} style="top:${top+i*12}%" type="button" aria-label="${name}" onclick="${index===4?'wstSubmit()':`wstTurnTo(${index})`}"><svg class="wst-phase-outline" viewBox="0 0 180 56" preserveAspectRatio="none" aria-hidden="true"><path class="wst-phase-wash" d="M27 2 44 9H164L170 19 175 28 170 37 164 47H44L27 54 9 44 2 28 9 12Z"/><path class="wst-phase-edge" d="M27 2 44 9H164L170 19 175 28 170 37 164 47H44L27 54 9 44 2 28 9 12Z"/></svg></button>`).join('');
 }
 if(step===1)controls+='<button class="wst-art-control wst-start-writing" type="button" aria-label="Start Writing" onclick="wstTurnTo(2)"></button>';
 if(step===2)controls+=`<textarea class="wst-editor" aria-label="Write your paragraph about a place that makes you happy" oninput="wstSaveDraft(this.value)" spellcheck="true">${h(wstInterface.text)}</textarea><span class="wst-word-count">Word Count: ${wstWordCount(wstInterface.text)}</span>`;
 if(step===3)controls+=`<div class="wst-review-text" tabindex="0" aria-label="Review your writing">${h(wstInterface.text)}</div><button class="wst-art-control wst-edit" type="button" aria-label="Edit your writing" onclick="wstTurnTo(2)"></button><button class="wst-art-control wst-submit" type="button" aria-label="Submit your writing" onclick="wstSubmit()"></button><p class="wst-save-status" role="status">${wstInterface.submitted?'Writing submitted on this device.':''}</p>`;
 app.innerHTML=`<section class="wst-interface-screen" aria-label="Writing Screening Test, interface ${step+1} of 4"><div class="wst-interface-board" data-step="${step}"><img class="wst-original-panel" src="${backgrounds[step]}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" draggable="false">${step===0?wstFloatingPapers():''}${controls}</div></section>`;
 if(step<3){const next=new Image();next.src=backgrounds[step+1]}
 positionWSTInterface();app.scrollTo(0,0);
}
function positionWSTInterface(){
 const screen=app.querySelector('.wst-interface-screen'),board=screen?.querySelector('.wst-interface-board');if(!board)return;
 board.style.transform=`translate(0px,0px) scale(${screen.clientWidth/834},${screen.clientHeight/468})`;
}
(()=>{
 const previousRender=render;
 render=function(){if(page==='wst')return renderWSTInterface();return previousRender()};
})();
window.addEventListener('resize',positionWSTInterface,{passive:true});

function speakWSTWelcome(){if(!readwyCanPlaySound())return;if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance("Show what you can do as a writer. This activity checks how well you can write clear sentences, organize ideas, and express your thoughts. Use precise and interesting words. Organize your ideas in a clear and logical way. Bring your ideas to life with your unique voice.");speech.lang="en-US";speech.rate=.9*readwySpeechRate();speech.volume=readwyVolume();window.speechSynthesis.speak(speech);}
