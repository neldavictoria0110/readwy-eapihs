/* Front-of-book views retain the application's existing authentication and modules. */
(()=>{
 const originalRender=render;
 const pendingAssessmentKey='readwy-subject-assessment-v1';
 let pendingAssessment='';
 try{
  const savedAssessment=sessionStorage.getItem(pendingAssessmentKey);
  if(['Filipino','Mathematics'].includes(savedAssessment))pendingAssessment=savedAssessment
 }catch(error){console.error('READwy selected subject could not be restored.',error)}
 let joiningRole='',signupEmail='',selectedLearningArea=pendingAssessment||'English';
 if(pendingAssessment)window.addEventListener('load',()=>{
  if(!user||user.role!=='student'||!window.READwySubjectLabs){console.error('READwy subject assessment could not start because the student session or module is unavailable.');return}
  try{sessionStorage.removeItem(pendingAssessmentKey)}catch(error){console.error('READwy selected subject could not be cleared.',error)}
  // Show the chosen subject's journey (its six stations); the learner starts the check-in from there.
  window.READwySubjectLabs.openJourney(pendingAssessment)
 },{once:true});
 window.getStoryViewState=()=>({joiningRole,selectedLearningArea});
 window.restoreStoryViewState=function(state){joiningRole=['student','teacher'].includes(state?.joiningRole)?state.joiningRole:'';selectedLearningArea=['English','Filipino','Mathematics'].includes(state?.selectedLearningArea)?state.selectedLearningArea:'English'};
 // Outlines measured in the original 1672 x 940 map coordinates.
 const mapStageOutlines=[
 [[58,448],[64,355],[91,326],[134,307],[179,330],[197,371],[207,445],[211,484],[201,507],[78,513],[58,495]],
 [[274,498],[289,458],[301,385],[340,337],[377,379],[405,390],[417,454],[446,490],[443,540],[431,560],[304,572],[274,549]],
 [[502,497],[523,474],[541,420],[573,414],[577,353],[598,345],[606,424],[647,396],[630,452],[674,468],[685,508],[676,543],[523,553],[503,535]],
 [[755,507],[781,480],[797,454],[811,421],[831,418],[829,390],[850,375],[869,415],[902,422],[918,470],[936,500],[934,551],[918,571],[785,576],[760,559]],
 [[1009,506],[1022,474],[1040,454],[1041,408],[1064,385],[1089,401],[1106,430],[1136,422],[1155,449],[1178,474],[1184,514],[1176,554],[1157,568],[1032,568],[1010,550]],
 [[1235,492],[1247,462],[1261,442],[1282,415],[1323,390],[1361,412],[1391,437],[1408,464],[1422,491],[1426,535],[1410,553],[1262,558],[1237,541]],
 [[1463,477],[1474,440],[1503,431],[1507,379],[1531,355],[1561,350],[1582,370],[1590,431],[1621,430],[1640,465],[1644,513],[1633,538],[1490,546],[1464,527]]
 ];
 function mapStageButton([name,title,module],index){
  const points=mapStageOutlines[index],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,hg=Math.max(...ys)-y;
  const polygon=points.map(p=>((p[0]-x)/w*100).toFixed(3)+'% '+((p[1]-y)/hg*100).toFixed(3)+'%').join(',');
  const path='M'+points.map(p=>p.join(' ')).join('L')+'Z';
  return '<button class="map-stage-hit" type="button" style="left:'+x/1672*100+'%;top:'+y/940*100+'%;width:'+w/1672*100+'%;height:'+hg/940*100+'%;--stage-shape:polygon('+polygon+')" aria-label="Open '+title+'" onclick="openModule(\''+module+'\')"><svg viewBox="'+[x,y,w,hg].join(' ')+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+path+'"/></svg></button>';
 }
 const learningAreas=['English','Filipino','Mathematics'];
 window.chooseLearningArea=function(name){if(navigationBusy||!learningAreas.includes(name))return;selectedLearningArea=name;
  // Remove unselected subjects before the outgoing transition is captured.
  app.querySelectorAll('.flashlight-subject,.learning-subject-card').forEach(node=>{if(!node.textContent.includes(name))node.remove()});
  if(name!=='English'&&window.READwySubjectLabs){window.READwySubjectLabs.startPlacement();return}
  go('journey')};
 const artwork='UI%20and%20owl/background/new-story/';
 const bookObserver=new ResizeObserver(positionBookForm);let observedBoard;
 function livingBookDrawing(){return `<svg class="story-living-drawing" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><image id="storyOriginalPainting" href="${artwork}login-reference.png" width="1672" height="941"/><filter id="storyWaterMotion" filterUnits="userSpaceOnUse" x="535" y="620" width="270" height="165"><feTurbulence type="fractalNoise" baseFrequency=".018 .075" numOctaves="1" seed="7"><animate attributeName="baseFrequency" values=".018 .075;.024 .10;.018 .075" dur="4s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="storyLeafMotion" filterUnits="userSpaceOnUse" x="215" y="600" width="365" height="125"><feTurbulence type="fractalNoise" baseFrequency=".014 .024" numOctaves="1" seed="3"><animate attributeName="baseFrequency" values=".014 .024;.02 .032;.014 .024" dur="6s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter><filter id="storySoftMask"><feGaussianBlur stdDeviation="3"/></filter><mask id="storyRiverMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><path d="M552 716 Q593 695 641 704 L779 697 L789 755 Q689 770 558 761Z M753 636 L781 632 L788 709 L753 710Z" fill="white" filter="url(#storySoftMask)"/></mask><mask id="storyTreesMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><path d="M243 637 Q284 617 319 638 L332 678 L278 700 L229 689Z M478 638 Q521 616 549 650 L563 696 L513 711 L471 690Z" fill="white" filter="url(#storySoftMask)"/></mask><clipPath id="storyPaintingBounds"><path d="M212 423 L343 423 L454 416 L574 427 L687 421 L780 441 L791 760 L386 772 L187 750Z"/></clipPath><mask id="storyWindowsMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><g fill="white" filter="url(#storySoftMask)"><ellipse cx="351" cy="548" rx="9" ry="25"/><ellipse cx="417" cy="546" rx="8" ry="24"/><ellipse cx="468" cy="591" rx="9" ry="23"/><ellipse cx="513" cy="549" rx="8" ry="24"/><ellipse cx="554" cy="608" rx="7" ry="18"/></g></mask></defs><g clip-path="url(#storyPaintingBounds)"><g class="story-water-paint" mask="url(#storyRiverMask)"><use href="#storyOriginalPainting" filter="url(#storyWaterMotion)"/></g><g class="story-tree-paint" mask="url(#storyTreesMask)"><use href="#storyOriginalPainting" filter="url(#storyLeafMotion)"/></g><g class="story-window-paint" mask="url(#storyWindowsMask)"><use href="#storyOriginalPainting"/></g></g></svg>`}
 function pageEdgeLuminance(kind='login'){
  const gst=kind==='gst';
  const paths=gst?['M979 142Q806 105 480 127Q452 128 451 153L431 764Q429 793 461 798Q770 784 979 828','M979 142Q1185 112 1469 120Q1496 119 1498 148L1521 771Q1524 801 1495 805Q1195 787 979 828']:['M808 208Q580 92 246 118Q231 122 225 155L133 781Q450 838 819 835','M816 210Q1100 128 1429 128Q1442 127 1448 174L1530 800Q1155 830 822 841'];
  return `<svg class="book-edge-luminance" viewBox="0 0 ${gst?'1536 1024':'1672 941'}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${paths.map((d,i)=>`<g class="page-edge-radiance" style="--edge-delay:${-i*1.7}s"><path class="page-edge-halo" d="${d}"/><path class="page-edge-gold" d="${d}"/><path class="page-edge-core" d="${d}"/><path class="page-edge-flow" d="${d}"/></g>`).join('')}</svg>`;
 }
 function smoothBookPaper(){return `<svg class="story-clean-paper" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true"><path class="clean-paper-right" d="M884 280 Q1100 240 1368 224 L1440 812 Q1145 806 908 831Z" fill="#ffe8b5" style="filter:blur(7px)"/><path class="clean-paper-left" d="M319 211 Q566 201 750 269 L776 789 Q480 772 245 758Z" fill="#ffe8b5" style="filter:blur(7px)"/></svg>`}
 function frame(kind,content){queueMicrotask(positionBookForm);return `<section class="story-screen story-${kind==='areas'?'learning':kind}" aria-label="${{login:'Login or sign up',areas:'Choose your learning area',map:'Your learning journey'}[kind]||'Sign up'}"><div class="story-board"><img class="story-backdrop" src="${artwork+(kind==='login'?'auth-ink-page.png':kind+'-reference.png')}" alt=">${kind==='login'?'<div class="welcome-panel-overlay" aria-hidden="true"></div>'+livingBookDrawing():''}${content}</div></section>`}
 // Keep the controls inside the inner gold frame of the login artwork.
 function positionBookForm(){
  const form=document.querySelector('.story-auth'),board=form?.closest('.story-board');if(!board)return;
  if(observedBoard!==board){bookObserver.disconnect();bookObserver.observe(board);observedBoard=board}
  const w=board.clientWidth,h=board.clientHeight;
  // Measured inner emboss corners in the original 1672 × 941 artwork (not the book silhouette).
  const frame=[[864,264],[1382,223],[1455,827],[893,831]]
   .map(([x,y])=>[x/1672,y/941]);
  const inset=(u,v)=>[0,1].map(axis=>((1-u)*(1-v)*frame[0][axis]+u*(1-v)*frame[1][axis]+u*v*frame[2][axis]+(1-u)*v*frame[3][axis])*(axis?h:w));
  const [p0,p1,p2,p3]=[inset(.055,.055),inset(.945,.055),inset(.945,.945),inset(.055,.945)];
  const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0];
  const dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];
  const det=dx1*dy2-dx2*dy1,g=(dx3*dy2-dx2*dy3)/det,j=(dx1*dy3-dx3*dy1)/det;
  const a=p1[0]-p0[0]+g*p1[0],b=p1[1]-p0[1]+g*p1[1],c=p3[0]-p0[0]+j*p3[0],d=p3[1]-p0[1]+j*p3[1];
  form.style.transform=`matrix3d(${a/500},${b/500},0,${g/500},${c/660},${d/660},0,${j/660},0,0,1,0,${p0[0]},${p0[1]},0,1)`;
  const left=board.querySelector('.discovery-welcome,.chosen-world-page');
  if(left){
   // Inner left-page emboss: inset from the curved top and outer gold rules.
   // Use the illustrated gold rule, with the same inset along every edge.
   // The outer edge fans out toward the foot of the page.
   const emboss=[[300,170],[770,228],[791,842],[218,819]];
   const leftInset=(u,v)=>[0,1].map(axis=>(1-u)*(1-v)*emboss[0][axis]+u*(1-v)*emboss[1][axis]+u*v*emboss[2][axis]+(1-u)*v*emboss[3][axis]);
   const leftCorners=board.closest('.chosen-subject-screen')
    ?[leftInset(.08,.08),leftInset(.92,.08),leftInset(.92,.92),leftInset(.08,.92)]
    :[[313,216],[747,262],[776,786],[237,759]];
   const [q0,q1,q2,q3]=leftCorners.map(([x,y])=>[x*w/1672,y*h/941]);
   const ux=q1[0]-q2[0],vx=q3[0]-q2[0],wx=q0[0]-q1[0]+q2[0]-q3[0];
   const uy=q1[1]-q2[1],vy=q3[1]-q2[1],wy=q0[1]-q1[1]+q2[1]-q3[1];
   const denominator=ux*vy-vx*uy,px=(wx*vy-vx*wy)/denominator,py=(ux*wy-wx*uy)/denominator;
   const ax=q1[0]-q0[0]+px*q1[0],ay=q1[1]-q0[1]+px*q1[1],bx=q3[0]-q0[0]+py*q3[0],by=q3[1]-q0[1]+py*q3[1];
   left.style.transform=`matrix3d(${ax/500},${ay/500},0,${px/500},${bx/660},${by/660},0,${py/660},0,0,1,0,${q0[0]},${q0[1]},0,1)`;
  }

 }
 window.addEventListener('resize',positionBookForm,{passive:true});
 function releaseOwl(){document.getElementById('landscape-shell').append(owl)}
 function quiet(){
  releaseOwl();stopWelcomeWandering();
  if(!['startup','dial-preview','login','signup','subject','areas-preview','subjects-spread','journey','map'].includes(page)){stopOwlFlight();owl.style.display='none'}
  nav.innerHTML='';
 }
 const back=(destination,label='← Back')=>`<button class="story-back" type="button" onclick="go('${destination}')">${label}</button>`;

 function joiningSpellHeading(){
  let letterIndex=0;
  const lines=['Who is joining?'].map(line=>`<span class="joining-spell-line" aria-hidden="true">${Array.from(line,letter=>`<span class="joining-spell-letter" style="--spell-index:${letterIndex++}">${letter===' '?'&#160;':letter}</span>`).join('')}</span>`).join('');
  return `<h1 class="joining-spell" aria-label="Who is joining?" style="--spell-start:${navigationBusy?2250:200}ms">${lines}</h1>`;
 }
 function renderJoining(){app.innerHTML=frame('login',`<div class="story-auth story-joining" style="--spell-start:${navigationBusy?2250:200}ms"><p class="story-kicker">The enchanted academy of reading</p><div class="story-page-seal" aria-hidden="true">✦</div>${joiningSpellHeading()}<p class="story-intro">Every reader has a story.<br>Choose how yours begins.</p><div class="story-role-choices"><button type="button" data-role="student" onclick="chooseJoiningRole('student')"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 10q10-4 19 2 9-6 19-2v27q-10-4-19 2-9-6-19-2Z M24 12v27 M10 17q5-1 9 1 M29 18q5-2 9-1"/></svg><span>Student<small>Begin your learning adventure</small></span><b aria-hidden="true">›</b></button><button type="button" data-role="teacher" onclick="chooseJoiningRole('teacher')"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 7h32v25H8Z M24 32v10 M15 42h18 M14 15h20 M14 22h12"/></svg><span>Teacher<small>Guide the next chapter</small></span><b aria-hidden="true">›</b></button></div><p class="story-bottom-motto">Read · Explore · Grow</p></div>${back('startup')}`)}
 window.chooseJoiningRole=function(role){if(navigationBusy||!['student','teacher'].includes(role))return;joiningRole=role;transition('login',()=>{renderLoginDetails();setOwl('login')})};
 window.changeJoiningRole=function(){if(navigationBusy)return;joiningRole='';signupEmail='';go('login')};
 function renderLogin(){if(joiningRole)renderLoginDetails();else renderJoining()}
 function discoverySpellText(lines,step=0){
  let index=0;
  return lines.map(line=>line.split(' ').map(word=>`<span class="discovery-spell-word" style="--ink-step:${step}ms;--ink-word:${index++}">${h(word)}</span>`).join(' ')).join('<br>');
 }
 function renderDiscovery(){
  app.innerHTML=frame('login',`<div class="learning-area-heading discovery-welcome"><p>${discoverySpellText(['The enchanted academy of reading'])}</p><h1>${discoverySpellText(['Welcome,',user?.role==='teacher'?'Teacher':'Student'],350)}</h1><h2>${discoverySpellText(['Discover your','learning areas'],800)}</h2><button class="discovery-all" type="button" onclick="go('subjects-spread')">${discoverySpellText(['View all learning areas →'],1450)}</button></div><div class="story-auth flashlight-page"><div class="flashlight-subjects">${['English','Filipino','Mathematics'].map((name,i)=>`<button type="button" class="flashlight-subject" onclick="chooseLearningArea('${name}')"><strong>${discoverySpellText([name],i*180)}</strong><small>${discoverySpellText(['Begin your adventure →'],i*180+150)}</small></button>`).join('')}</div><div class="flashlight-sensor" aria-hidden="true"></div><p class="flashlight-hint">${discoverySpellText(['Move your cursor to reveal','and click your assigned subject.'],900)}</p></div>`);
  app.querySelector('.story-backdrop').src=artwork+'discovery-blank.png';
  app.querySelector('.story-screen').classList.add('discovery-screen');
  app.querySelector('.story-screen').style.setProperty('--discovery-start',(navigationBusy?1850:120)+'ms');
  const surface=app.querySelector('.flashlight-page'),sensor=app.querySelector('.flashlight-sensor');
  function shine(event){
   surface.style.setProperty('--beam-x',event.offsetX+'px');surface.style.setProperty('--beam-y',event.offsetY+'px');surface.classList.add('beam-visible');
   const index=Math.min(2,Math.max(0,Math.floor(event.offsetY/sensor.clientHeight*3)));
   surface.querySelectorAll('.flashlight-subject').forEach((subject,i)=>subject.classList.toggle('is-magnified',i===index));
  }
  sensor.addEventListener('pointermove',shine);sensor.addEventListener('pointerdown',shine);
  sensor.addEventListener('pointerleave',()=>{surface.classList.remove('beam-visible');surface.querySelectorAll('.is-magnified').forEach(subject=>subject.classList.remove('is-magnified'))});
  sensor.addEventListener('click',event=>{
   const index=Math.min(2,Math.max(0,Math.floor(event.offsetY/sensor.clientHeight*3)));
   chooseLearningArea(learningAreas[index]);
  });
 }
 function renderChosenWorld(){
  if(typeof selectedLearningArea!=='undefined'&&selectedLearningArea!=='English'&&window.READwySubjectLabs){window.READwySubjectLabs.renderWelcome();return}
  app.innerHTML=frame('login',`<div class="chosen-world-page"><h1>Your Chosen World</h1><button class="chosen-subject-reveal" type="button" aria-label="Explore your English world with the magnifying glass"><span class="chosen-subject-ink"><svg class="original-english-subject" viewBox="165 210 480 630" role="img" aria-label="English"><defs><clipPath id="englishSubjectArch"><path d="M445 222 C376 246 272 300 236 407 L205 683 L177 736 L170 790 Q177 820 211 828 L563 832 Q597 826 609 797 L627 414 Q589 293 445 222Z"/></clipPath></defs><image href="${artwork}areas-reference.png" width="1672" height="941" clip-path="url(#englishSubjectArch)"/></svg></span></button><p class="chosen-ink-hint">Move your cursor or tap to discover your world.</p></div><div class="story-auth chosen-journey-page"><div class="book-journey-map"><div class="book-journey-reveal"><img src="${artwork}map-portrait.png" alt="Your learning journey: Reading Check-In, Voice Station, Story Depot, Catch-Up Express, InterV, Reading Lab and Post-Test"><span class="book-map-start-label">Start →</span></div><button class="book-map-sensor" type="button" aria-label="Start your learning journey" aria-describedby="journeyStartHint"></button><p class="journey-start-instruction" id="journeyStartHint">Move your cursor or tap to find Start, then click it.</p></div></div>`);
  app.querySelector('.story-screen').classList.add('chosen-subject-screen');
  app.querySelector('.story-backdrop').src=artwork+'discovery-blank.png';
  const subject=app.querySelector('.chosen-subject-reveal');
  function reveal(surface,event){
   surface.style.setProperty('--beam-x',event.offsetX+'px');surface.style.setProperty('--beam-y',event.offsetY+'px');surface.classList.add('beam-visible');
  }
  subject.addEventListener('pointermove',event=>reveal(subject,event));
  subject.addEventListener('pointerdown',event=>reveal(subject,event));
  subject.addEventListener('pointerleave',()=>subject.classList.remove('beam-visible'));
  const map=app.querySelector('.book-journey-map'),sensor=app.querySelector('.book-map-sensor');
  const shine=event=>reveal(map,event);
  sensor.addEventListener('pointermove',shine);sensor.addEventListener('pointerdown',shine);
  sensor.addEventListener('pointerleave',()=>map.classList.remove('beam-visible'));
  sensor.addEventListener('click',event=>{
   // The hidden Start occupies the same page coordinates as its ink label.
   if(!navigationBusy&&(event.detail===0||(event.offsetY>=map.clientHeight-170&&event.offsetY<=map.clientHeight-115)))go('map');
  });
  sensor.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!navigationBusy)go('map')}
  });
 }
 function renderLoginDetails(){app.innerHTML=frame('login',`<div class="story-auth story-credentials"><p class="story-kicker">Your next chapter</p><h1>Welcome, ${joiningRole==='teacher'?'Teacher':'Student'}</h1><div class="story-roles" hidden><button class="login-role" type="button" data-role="student" aria-pressed="false" onclick="selectDemoRole('student')">Student</button><button class="login-role" type="button" data-role="teacher" aria-pressed="false" onclick="selectDemoRole('teacher')">Teacher</button></div><form id="demoLoginForm" onsubmit="demoLogin(event)"><label>Email or Username<input class="login-field" id="loginEmail" type="text" autocomplete="username" placeholder="Email or Username" required disabled></label><label>Password<span class="story-password"><input class="login-field" id="loginPassword" type="password" autocomplete="current-password" placeholder="Password" required disabled><button class="login-visibility" type="button" aria-label="Show password" onclick="toggleDemoPassword()" disabled>Show</button></span></label><div class="story-options"><label><input id="rememberDemo" type="checkbox" onchange="rememberDemoEmail(this)" disabled> Remember me</label><button type="button" onclick="requestDemoReset()">Forgot password?</button></div><button class="story-enter login-submit" type="submit" disabled>Enter ✦</button></form><p class="story-signup-prompt">Create my account? <button type="button" onclick="openDemoSignup()">Sign up</button></p><div class="login-status" role="status" aria-live="polite"></div><div id="authModalRoot"></div></div><button class="story-back" type="button" onclick="changeJoiningRole()">← Change account type</button>`);initializeDemoLogin();selectDemoRole(joiningRole)}
 openDemoSignup=function(){if(navigationBusy)return;signupEmail=document.getElementById('loginEmail')?.value.trim()||'';authRole='';go('signup')};
 renderSignup=function(role=joiningRole){
  quiet();setOwl(role?'signup-form':'signup-role');
  if(!['student','teacher'].includes(role)){renderJoining();return}
  joiningRole=role;
  const input=(id,label,type='text',attrs='')=>`<label>${label}<input id="${id}" name="${id}" type="${type}" placeholder="${label}" ${attrs} required></label>`;
  const select=(id,label,values)=>`<div class="story-select-field"><span id="${id}Label">${label}</span><div class="story-select"><select class="story-native-select" id="${id}" name="${id}" required tabindex="-1" aria-hidden="true"><option value="">Choose…</option>${values.map(v=>`<option>${v}</option>`).join('')}</select><button class="story-select-trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-required="true" aria-controls="${id}Options" aria-labelledby="${id}Label ${id}Value"><span id="${id}Value">Choose…</span><span aria-hidden="true">⌄</span></button><div class="story-select-options" id="${id}Options" role="listbox" aria-labelledby="${id}Label" hidden>${values.map((v,i)=>`<div id="${id}Option${i}" role="option" aria-selected="false" data-value="${v}">${v}</div>`).join('')}</div></div></div>`;
  const lrnField=`<div class="story-lrn-field">${input('signupLrn','Official LRN','text','inputmode="numeric" pattern="[0-9]{12}" minlength="12" maxlength="12" autocomplete="off" aria-describedby="signupLrnHelp"')}<small id="signupLrnHelp">Use the assigned LRN; do not invent one. <a href="https://lis.deped.gov.ph" target="_blank" rel="noopener noreferrer">Open DepEd LIS</a>.</small></div>`;
  const fields=role==='student'
   ?`${input('signupLastName','Last name','text','autocomplete="family-name"')}${input('signupFirstName','First name','text','autocomplete="given-name"')}<label>M.I.<input name="signupMiddleInitial" maxlength="1" autocomplete="additional-name"></label>${lrnField}${input('signupEmail','Email','email','autocomplete="email"')}${select('signupGrade','Grade',['7','8','9','10'])}${input('signupSection','Section')}${select('signupGender','Gender',['Female','Male','Prefer not to say'])}${select('signupLearningArea','Learning area',['English','Filipino','Mathematics'])}${input('signupTeacherName','Teacher name')}`
   :`${input('signupTeacherName','Name','text','autocomplete="name"')}${select('signupLearningArea','Learning area',['English','Filipino','Mathematics'])}${input('signupCode','Code')}`;
  app.innerHTML=frame('login',`<div class="story-auth story-register" data-registration="${role}"><p class="story-kicker">Your academy enrolment</p><h1>${role==='student'?'Student':'Teacher'} registration</h1><form class="story-signup-form" novalidate onsubmit="submitSignupForm(event,'${role}')"><div class="story-fields">${fields}<label>Password<span class="story-password"><input id="signupPassword" name="signupPassword" type="password" placeholder="Password" minlength="8" autocomplete="new-password" required><button type="button" aria-label="Show password" onclick="toggleSignupPassword(this)">Show</button></span></label></div><p class="signup-form-status" role="status" aria-live="polite"></p><button class="story-enter" type="submit">Create My Account ✦</button></form></div><button class="story-back" type="button" onclick="changeJoiningRole()">← Change account type</button>`);const email=app.querySelector('[name=signupEmail]');if(email&&signupEmail)email.value=signupEmail
 };
 render=function(){
  renderStartupSlide.cleanup?.();
  releaseOwl();
  if(!['startup','dial-preview','login','signup','subject','areas-preview','subjects-spread','journey','map','subject-task'].includes(page))return originalRender();
  quiet();
  if(page==='startup'){joiningRole='';signupEmail='';renderStartupSlide();}
  else if(page==='dial-preview')renderDialPreview();
  else if(page==='login')renderLogin();
  else if(page==='signup')renderSignup();
  else if(page==='subject'||page==='areas-preview')renderDiscovery();
  else if(page==='subjects-spread'){
   app.innerHTML=frame('login',`<div class="learning-area-heading"><p>The enchanted academy of reading</p><h1>Choose Your<br>Learning Area</h1><span aria-hidden="true">✦</span></div><div class="story-auth learning-subjects"><div class="learning-subject-list">${['English','Filipino','Mathematics'].map((name,i)=>`<button class="learning-subject-card" type="button" onclick="chooseLearningArea('${name}')"><span class="learning-subject-image" style="--subject-position:${i*50}%" aria-hidden="true"></span><span class="learning-subject-label"><strong>${name}</strong><small>Begin your adventure →</small></span></button>`).join('')}</div></div><button class="story-back" onclick="go('areas-preview')">← Back</button>`);
   app.querySelector('.story-screen').classList.add('subject-selection-screen');
   app.querySelector('.story-backdrop').src=artwork+'learning-blank.png';
  }
  else if(page==='subject-task'&&window.READwySubjectLabs)window.READwySubjectLabs.renderTask();
  else if(page==='map'&&selectedLearningArea!=='English'&&window.READwySubjectLabs)window.READwySubjectLabs.renderMap();
  else if(page==='journey'){
   renderChosenWorld();
  }
  else app.innerHTML=`<section class="story-screen journey-panorama"><div class="journey-scroll" tabindex="0" aria-label="Learning journey. Scroll left or right to explore."><div class="journey-wide-art"><img class="journey-landscape-hd" src="${artwork}map-reference.png" width="1672" height="940" alt="Your Learning Journey: Reading Check-In, Voice Station, Story Depot, Catch-Up Express, InterV, Reading Lab and Post-Test" decoding="async" fetchpriority="high"><div class="story-destinations">${MAP_DESTINATIONS.map(mapStageButton).join('')}</div></div></div></section>`;
  if(['journey','map'].includes(page)&&app.querySelector('.story-screen')){
   const destination=page==='map'?'journey':'subject';
   const label=page==='map'?'Back to book':'Learning areas';
   app.querySelector('.story-screen').insertAdjacentHTML('beforeend',`<button class="journey-back" type="button" onclick="go('${destination}')"><span class="journey-back-arrow" aria-hidden="true">&#8592;</span><span>${label}</span><span class="journey-back-star" aria-hidden="true">&#10022;</span></button>`);
  }
  if(selectedLearningArea==='English'||!['journey','map','subject-task'].includes(page))setOwl(page);
 };
 let openSelect=null,typeBuffer='',typeTime=0;
 function closeSelect(){if(!openSelect)return;openSelect.querySelector('.story-select-options').hidden=true;const trigger=openSelect.querySelector('.story-select-trigger');trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');openSelect.closest('.story-select-field').style.zIndex='';openSelect=null}
 function highlightOption(index){const options=[...openSelect.querySelectorAll('[role=option]')];index=(index+options.length)%options.length;options.forEach((o,i)=>o.classList.toggle('is-active',i===index));openSelect.querySelector('.story-select-trigger').setAttribute('aria-activedescendant',options[index].id);options[index].scrollIntoView({block:'nearest'})}
 function showSelect(control){closeSelect();openSelect=control;const menu=control.querySelector('.story-select-options'),trigger=control.querySelector('.story-select-trigger'),form=control.closest('.story-auth');menu.hidden=false;trigger.setAttribute('aria-expanded','true');control.closest('.story-select-field').style.zIndex='30';
  // Measure in page coordinates so the menu remains on the same tilted surface.
  let top=0,node=control;while(node&&node!==form){top+=node.offsetTop;node=node.offsetParent}top-=form.scrollTop;
  const below=form.clientHeight-top-control.offsetHeight-12,above=top-12,up=below<150&&above>below;menu.classList.toggle('opens-up',up);menu.style.maxHeight=Math.min(180,Math.max(70,up?above:below))+'px';
  const selected=[...control.querySelectorAll('[role=option]')].findIndex(o=>o.getAttribute('aria-selected')==='true');highlightOption(Math.max(0,selected));
 }
 function chooseOption(option){const control=option.closest('.story-select'),select=control.querySelector('select');select.value=option.dataset.value;control.querySelector('.story-select-trigger span').textContent=select.value;control.querySelectorAll('[role=option]').forEach(o=>o.setAttribute('aria-selected',String(o===option)));select.dispatchEvent(new Event('change',{bubbles:true}));const trigger=control.querySelector('.story-select-trigger');closeSelect();trigger.focus({preventScroll:true})}
 app.addEventListener('click',event=>{const trigger=event.target.closest('.story-select-trigger'),option=event.target.closest('.story-select [role=option]');if(trigger){const control=trigger.closest('.story-select');if(openSelect===control)closeSelect();else showSelect(control)}else if(option)chooseOption(option)});
 document.addEventListener('pointerdown',event=>{if(openSelect&&!openSelect.contains(event.target))closeSelect()});
 app.addEventListener('keydown',event=>{const trigger=event.target.closest('.story-select-trigger');if(!trigger)return;const control=trigger.closest('.story-select');if(event.key==='Tab'){closeSelect();return}if(event.key==='Escape'){event.preventDefault();closeSelect();return}const keys=['ArrowDown','ArrowUp','Home','End','Enter',' '];if(!keys.includes(event.key)&&!(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey))return;event.preventDefault();const wasOpen=openSelect===control;if(!wasOpen)showSelect(control);const options=[...control.querySelectorAll('[role=option]')],active=options.findIndex(o=>o.classList.contains('is-active'));if(event.key==='Enter'||event.key===' '){if(wasOpen)chooseOption(options[active]);return}if(event.key==='Home')highlightOption(0);else if(event.key==='End')highlightOption(options.length-1);else if(event.key==='ArrowDown')highlightOption(wasOpen?active+1:active);else if(event.key==='ArrowUp')highlightOption(wasOpen?active-1:options.length-1);else{const now=performance.now();typeBuffer=now-typeTime>700?event.key:typeBuffer+event.key;typeTime=now;const index=options.findIndex(o=>o.textContent.toLowerCase().startsWith(typeBuffer.toLowerCase()));if(index>=0)highlightOption(index)}});
 app.addEventListener('invalid',event=>{if(event.target.matches('.story-native-select')){event.preventDefault();event.target.closest('.story-select').querySelector('.story-select-trigger').focus({preventScroll:true})}},true);
 function syncBookDrawing(){const gstBook=app.querySelector('.gst-book-group');if(gstBook&&!gstBook.querySelector('.book-edge-luminance'))gstBook.insertAdjacentHTML('beforeend',pageEdgeLuminance('gst'));const still=document.hidden||owlMotionPreference.matches||document.documentElement.classList.contains('reduced-motion');document.querySelectorAll('.story-living-drawing,.story-living-journey').forEach(svg=>{if(still)svg.pauseAnimations();else svg.unpauseAnimations()})}
 document.addEventListener('visibilitychange',syncBookDrawing);
 owlMotionPreference.addEventListener('change',syncBookDrawing);
 new MutationObserver(syncBookDrawing).observe(app,{childList:true});
 new MutationObserver(syncBookDrawing).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 
})();