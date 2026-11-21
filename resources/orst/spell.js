/* ORST welcome: keep the assessment separate from the spell introduction. */
const ORST_WELCOME_ART='UI and owl/stages/ORST trial scenery.png';
const ORST_OWL_ART='UI and owl/stages/ORST trial owl wandless.png';
let orstSpellRunning=false;
function orstReducedMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')}
function startORSTSpell(){
 if(orstSpellRunning||navigationBusy)return false;
 activeModule='orst';
 return transition('orst-welcome',()=>renderORSTWelcome());
}
function renderORSTWelcome(){
 page='orst-welcome';activeModule='orst';nav.innerHTML='';setOwl('signup-form');
 const grade=Number(user?.grade);if([7,8,9,10].includes(grade))selectedGrade=grade;
 app.innerHTML="<section class=\"orst-welcome-screen orst-artwork-welcome\" aria-label=\"Oral Reading Screening Test welcome\"><div class=\"orst-welcome-artboard\"><img class=\"orst-welcome-original\" src=\"UI%20and%20owl/orst%20file/1.png?v=1792741591054\" alt=\"ORST: The Hall of Echoes. Read aloud, then answer comprehension questions.\" draggable=\"false\"><button class=\"orst-welcome-hit orst-welcome-begin\" aria-label=\"Begin ORST\" onclick=\"beginORSTTrial()\"></button><button class=\"orst-welcome-hit orst-welcome-book\" aria-label=\"Read the passage\" data-stage=\"read\"></button><button class=\"orst-welcome-hit orst-welcome-mic\" aria-label=\"Begin ORST\" onclick=\"beginORSTTrial()\"></button><button class=\"orst-welcome-hit orst-welcome-question\" aria-label=\"Comprehension questions\" data-stage=\"questions\"></button><button class=\"orst-welcome-hit orst-welcome-stage orst-welcome-stage-0\" aria-label=\"read\" data-stage=\"read\"></button><button class=\"orst-welcome-hit orst-welcome-stage orst-welcome-stage-1\" aria-label=\"record\" data-stage=\"record\"></button><button class=\"orst-welcome-hit orst-welcome-stage orst-welcome-stage-2\" aria-label=\"questions\" data-stage=\"questions\"></button><button class=\"orst-welcome-hit orst-welcome-stage orst-welcome-stage-3\" aria-label=\"results\" data-stage=\"results\"></button></div></section>";
 app.querySelector(".orst-welcome-artboard").insertAdjacentHTML("beforeend","<button class=\"orst-welcome-hit orst-painted-journey\" type=\"button\" aria-label=\"Learning journey map\" onclick=\"go('map')\"></button>");
 app.querySelectorAll("[data-stage]").forEach(button=>button.onclick=()=>openORSTWelcomeStage(button.dataset.stage));
 animateORSTBackdropOwl();
 positionORSTWelcome();app.scrollTo(0,0);
}
async function openORSTWelcomeStage(stage){if(navigationBusy)return;await beginORSTTrial();if(app.querySelector('.orst-interface-screen'))return orstSelectStage(stage);}

function positionORSTWelcome(){
 const screen=document.querySelector('.orst-welcome-screen'),board=screen?.querySelector('.orst-welcome-artboard');if(!board)return;
 board.style.transform=`translate(0px,0px) scale(${screen.clientWidth/1672},${screen.clientHeight/941})`;
 const copy=board.querySelector('.orst-welcome-copy');
 if(copy)copy.style.transform='matrix3d(1,0,0,0,-.025,1,0,0,0,0,1,0,650,158,0,1)';
}
function beginORSTTrial(){if(navigationBusy)return false;activeModule='orst';return transition('orst-grade',renderORSTGradeSelection)}
window.addEventListener('resize',positionORSTWelcome,{passive:true});

function castORSTWelcomeOwl(button){
 if(button.classList.contains('is-delighted'))return;
 button.classList.add('is-delighted');
 button.getAnimations?.({subtree:true}).forEach(animation=>{animation.currentTime=0});
 const greeting=document.querySelector('.orst-owl-greeting');
 greeting?.classList.add('is-visible');
 setTimeout(()=>{button.classList.remove('is-delighted');greeting?.classList.remove('is-visible')},5600);
}

// Animate pixels belonging to the painted owl; no second owl or cutout is added.
function animateORSTBackdropOwl(){
 const board=app.querySelector('.orst-welcome-artboard');if(!board)return;
 const field='<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><defs><radialGradient id="breath"><stop stop-color="#805000"/><stop offset="1" stop-color="#808000"/></radialGradient></defs><path fill="#808000" d="M0 0h1672v941H0z"/><ellipse cx="90" cy="609" rx="86" ry="102" fill="url(#breath)"/></svg>';
 const map='data:image/svg+xml,'+encodeURIComponent(field);
 const reduced=orstReducedMotion();
 board.insertAdjacentHTML('beforeend',`<svg class="orst-painted-owl-life" viewBox="0 0 1672 941" aria-hidden="true" focusable="false"><defs><filter id="orstPaintedBreath" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${map}" result="breathMap"/><feDisplacementMap in="SourceGraphic" in2="breathMap" scale="0" xChannelSelector="R" yChannelSelector="G">${reduced?'':'<animate attributeName="scale" values="0;22;0;14;0" dur="6.8s" repeatCount="indefinite"/>'}</feDisplacementMap></filter><linearGradient id="orstPaintedLid" x2="0" y2="1"><stop stop-color="#76563d"/><stop offset=".35" stop-color="#d4c6a8"/><stop offset="1" stop-color="#f8edd2"/></linearGradient></defs><g filter="url(#orstPaintedBreath)"><g class="orst-painted-blink"><ellipse cx="107" cy="554" rx="12" ry="13" fill="url(#orstPaintedLid)"/><ellipse cx="141" cy="558" rx="8" ry="11" fill="url(#orstPaintedLid)"/><path d="M96 556 Q107 563 118 556 M134 560 Q141 565 148 560" fill="none" stroke="#5d4129" stroke-width="1.5"/></g></g></svg>`);
 board.querySelector('.orst-welcome-original').style.filter=reduced?'none':'url(#orstPaintedBreath)';
}

// Trace the gold frame in the backdrop, including its pointed crest and foot.
function orstGradeBackdropLight(){
 const outline='M 747 320 Q 748 309 766 307 L 805 303 Q 818 301 828 290 Q 838 302 851 304 L 895 309 Q 909 311 909 326 L 909 530 Q 907 540 891 542 L 847 549 L 828 558 L 809 550 L 760 542 Q 744 539 744 526 Z';
 return `<svg class="orst-grade-backdrop-light" viewBox="0 0 1672 941" aria-hidden="true" focusable="false"><defs>${[7,8,9,10].map((grade,i)=>`<clipPath id="orst-grade-frame-${grade}"><path d="${outline}" transform="translate(${i*190} 0)"/></clipPath>`).join('')}</defs>${[7,8,9,10].map(grade=>`<g class="orst-backdrop-lit-grade orst-backdrop-lit-grade-${grade}" style="--card-x:${828+(grade-7)*190}px;--card-y:424px"><path class="orst-card-recess" d="${outline}" transform="translate(${(grade-7)*190} 0)"/><image class="orst-card-pressed-art" href="UI%20and%20owl/orst%20file/2.png" width="1672" height="941" clip-path="url(#orst-grade-frame-${grade})"/></g>`).join('')}</svg>`;
}
function renderORSTGradeSelection(){
 if(typeof orstStopAudio==='function')orstStopAudio();
 page='orst-grade';activeModule='orst';nav.innerHTML='';setOwl('signup-form');
 app.innerHTML=`<section class="orst-welcome-screen orst-grade-screen" aria-label="Select your ORST grade level"><div class="orst-welcome-artboard"><img class="orst-welcome-original" src="UI%20and%20owl/orst%20file/2.png" usemap="#orst-grade-map" alt="Select your grade level. Read a passage aloud and answer comprehension questions. A microphone is required; find a quiet place and read clearly." draggable="false">${orstGradeBackdropLight()}${orstSelectionCleanupArtwork('grade')}<map name="orst-grade-map">${[7,8,9,10].map((grade,i)=>`<area class="orst-grade-choice" shape="poly" coords="${[[747,320],[766,307],[805,303],[828,290],[851,304],[895,309],[909,326],[909,530],[891,542],[847,549],[828,558],[809,550],[760,542],[744,526]].map(([x,y])=>[x+i*190,y].join(',')).join(',')}" href="#" role="button" data-grade="${grade}" aria-label="Grade ${grade}" aria-pressed="${selectedGrade===grade}" onclick="selectORSTEntryGrade(${grade});return false">`).join('')}<area shape="rect" coords="875,660,1308,742" href="#" role="button" aria-label="Start ORST with selected grade" onclick="startORSTSelectedGrade();return false"><area shape="rect" coords="1454,8,1643,63" href="#" role="button" aria-label="Back to ORST welcome" onclick="go('orst-welcome');return false"><area shape="rect" coords="31,811,189,912" href="#" role="button" aria-label="Learning journey" onclick="go('map');return false"></map></div></section>`;
 positionORSTWelcome();orstTrackToolbarHover('grade');app.scrollTo(0,0);
}
function selectORSTEntryGrade(grade){
 if(navigationBusy||![7,8,9,10].includes(grade))return;
 selectedGrade=grade;
 app.querySelectorAll('.orst-grade-choice').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.grade)===grade)));
}
function startORSTSelectedGrade(){
 if(navigationBusy)return false;orstResetAttempt();orstInterface.index=0;orstInterface.stage='choose';
 return transition('work',()=>modulePage('orst'));
}

