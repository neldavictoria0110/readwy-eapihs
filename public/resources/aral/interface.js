/* Original full-size Catch-Up Express images; percentage hit areas follow the painted controls. */
const aralView={panel:1,week:1,answers:[],wordIndex:0,message:'',sound:false};
const aralSource='output/aral/';
function aralPanelSource(panel){const clean={2:'sessions-clean',4:'activity-clean',6:'progress-clean'};if(clean[panel])return 'resources/aral/'+clean[panel]+'.png';if(panel==='task')return 'output/aral/task.png';return panel===1?'resources/aral/weeks-idle.png':aralSource+panel+'.png'}
function aralRecords(){return load('aral_responses_v2_'+selectedGrade,{})}
const ARAL_ASSOCIATION_WORDS=['CLUES','MAJESTIC','FILTER','FAMED'];
function aralTaskOneRounds(){const task=aralRecords()[aralView.week]?.task1;return task?.rounds||((task?.answers?.length)?[{word:'CLUES',answers:task.answers}]:[])}
function aralTaskOneComplete(){const task=aralRecords()[aralView.week]?.task1;return task?.complete===true&&ARAL_ASSOCIATION_WORDS.every((word,index)=>task.rounds?.[index]?.word===word&&task.rounds[index].answers?.length)}
function aralStartTaskOne(){
 if(navigationBusy)return;
 const rounds=aralTaskOneRounds(),task=aralRecords()[aralView.week]?.task1;
 const pending=task?.complete===false&&Number.isInteger(task.nextRound)?task.nextRound:ARAL_ASSOCIATION_WORDS.findIndex((_,index)=>!rounds[index]?.answers?.length);
 aralView.wordIndex=pending<0?0:pending;aralView.answers=rounds[aralView.wordIndex]?.answers||[];
 if(typeof aralLessonView!=='undefined')aralLessonView.active=false;
 return aralShow(4);
}
function aralRetryTaskOne(){aralView.wordIndex=0;aralView.answers=aralTaskOneRounds()[0]?.answers||[];return aralShow(4)}
function aralOwlBlink(panel){
 // Eye coordinates refer to the original 1586 × 992 paintings.
 const eyes=({task:[[199,462,27,36],[262,452,27,36]],1:[[1191,207,19,26],[1241,216,20,26]],2:[[180,516,29,37],[258,516,29,37]],3:[[158,620,22,29],[216,618,22,29]],4:[[164,535,28,37],[245,543,29,37]],5:[[222,426,26,35],[293,421,26,35]],6:[[158,718,22,29],[215,722,22,29]],7:[[1016,99,17,23],[1062,100,17,23]]})[panel];
 return `<svg class="aral-owl-blinks" viewBox="0 0 1586 992" preserveAspectRatio="none" aria-hidden="true"><defs>${eyes.map(([x,y,rx,ry],i)=>`<clipPath id="aralEye${panel}-${i}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath>`).join('')}</defs>${eyes.map(([x,y,rx,ry],i)=>`<g clip-path="url(#aralEye${panel}-${i})"><g class="aral-eyelid"><ellipse cx="${x}" cy="${y}" rx="${rx+1}" ry="${ry+1}" fill="#f4dfae"/><path d="M${x-rx} ${y} Q${x} ${y+ry*.55} ${x+rx} ${y}" fill="none" stroke="#654025" stroke-width="3" stroke-linecap="round"/></g></g>`).join('')}</svg>`;
}
function aralControl(label,x,y,w,height,action){
 return `<button type="button" class="aral-control" aria-label="${h(label)}" title="${h(label)}" style="left:${x}%;top:${y}%;width:${w}%;height:${height}%" onclick="${action}"></button>`;
}
async function aralShow(panel){
 if(navigationBusy)return;
 const image=new Image();image.src=aralPanelSource(panel);try{await image.decode()}catch{}
 return animatePageTransition('work',()=>{aralView.panel=panel;aralView.message='';renderAral()});
}
function aralWeek(week){aralView.week=week;aralView.answers=aralRecords()[week]?.task1?.answers||[];if(week!==1)return aralWorkbook();return aralShow(aralTaskOneComplete()?6:2)}
function aralNotice(message){aralView.message=message;const status=app.querySelector('.aral-message');if(status)status.textContent=message}
function aralSound(){if(!readwyCanPlaySound()){aralView.sound=false;aralNotice('Sound is disabled in Settings.');return}aralView.sound=!aralView.sound;if(aralView.sound){try{const Audio=window.AudioContext||window.webkitAudioContext;const context=new Audio(),osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.setValueAtTime(660,context.currentTime);gain.gain.setValueAtTime(.06*readwyVolume(),context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.4);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.4);osc.onended=()=>context.close()}catch{}}aralNotice(aralView.sound?'Sound cues on.':'Sound cues off.')}
function aralWorkbook(){aralNotice('All activities are inside the Catch-Up Express journey.')}
async function aralSubmit(event){
 event?.preventDefault();if(navigationBusy||aralView.submitting)return;
 const answers=[...app.querySelectorAll('.aral-input')].map(input=>input.value.trim()).filter(Boolean);
 if(!answers.length){aralNotice('Write at least one associated word before submitting.');app.querySelector('.aral-input').focus();return}
 aralView.submitting=true;
 try{
 const index=aralView.wordIndex,rounds=aralTaskOneRounds().slice();
 rounds[index]={word:ARAL_ASSOCIATION_WORDS[index],answers:[...new Set(answers)],submittedAt:new Date().toISOString()};
 const complete=index===3&&ARAL_ASSOCIATION_WORDS.every((word,i)=>rounds[i]?.word===word&&rounds[i].answers.length);
 const records=aralRecords();records[aralView.week]={...(records[aralView.week]||{}),task1:{rounds,answers:rounds.flatMap(round=>round?.answers||[]),complete,nextRound:complete?0:index+1,submittedAt:complete?new Date().toISOString():null}};save('aral_responses_v2_'+selectedGrade,records);
 if(!complete){aralView.wordIndex=index+1;aralView.answers=rounds[index+1]?.answers||[];return await aralShow(4)}
 aralView.answers=rounds.flatMap(round=>round.answers);return await aralShow(5);
 }finally{aralView.submitting=false}
}
function renderAral(){
 if(typeof aralLessonView!=='undefined'&&aralLessonView.active)return renderAralLesson();
 if(aralView.panel===3&&typeof renderAralTaskMenu==='function')return renderAralTaskMenu();
 if(aralView.panel==='task')return renderAralTaskSummary();
 const p=aralView.panel,source=aralPanelSource(p),records=aralRecords();
 setOwl('work');nav.innerHTML='';
 let controls='';const button=(...args)=>controls+=aralControl(...args);
 if(p!==1){const back=({2:[2.5,4.8,11,6],3:[2.5,5.7,13.4,6.7],4:[2.5,5,13.4,7],5:[1.8,3.8,12,6],6:[2.5,4.8,11.5,6.7],7:[1.7,3,12,5.7]})[p];button('Back',...back,`aralShow(${({2:1,3:2,4:3,5:4,6:7,7:6})[p]})`)}
 if(p===1)button('Home — learning journey',2.5,4.7,12.2,6,"go('map')");
 if(p===1)button('Back to learning journey',2.5,13.2,11.2,6,"go('map')");
 const iconX=p===4?[77,84,91]:[82,87.5,93];
 button('Toggle sound cues',iconX[0],3,5.5,9,'aralSound()');button('Help',iconX[1],3,5.5,9,"aralNotice('Choose Week 1 and a session. Submit each activity to save your work. Checks show submitted work, not a mastery score.')");button(p===4?'Home — learning journey':'Settings',iconX[2],3,5.5,9,p===4?"go('map')":"go('settings')");
 if(p===1||p===7){for(let week=1;week<=8;week++){const col=(week-1)%4,row=Math.floor((week-1)/4);const bounds=p===1?[[296,380,182,176],[584,397,181,169],[865,398,180,166],[1173,398,180,168],[269,648,182,166],[557,649,185,164],[856,649,181,165],[1190,649,180,165]][week-1]:[col*284+(row?235:295),row?566:337,200,147];button(`Open week ${week}`,bounds[0]/1586*100,bounds[1]/992*100,bounds[2]/1586*100,bounds[3]/992*100,`aralWeek(${week})`);if(p===7&&!records[week]?.complete)controls+=`<span class="aral-progress-count" style="left:${(row?18.5:21.2)+col*18.4}%;top:${row?65:42.5}%;width:4.6%;height:6.8%" aria-label="Week ${week}: ${records[week]?.task1?'Task 1 submitted':'not completed'}">${records[week]?.task1?'1 task':'—'}</span>`}if(p===7){button('Back to learning journey',2,10,20,6,"go('map')");button('Continue learning',79,85,19,10,'aralWeek(1)')}}
 if(p===2||p===6){for(let session=1;session<=4;session++)button(session===1?'Start or review Session 1':`Start or review Session ${session}`,p===2?79:73.5,(p===2?38:37)+(session-1)*11.7,p===2?15:13,8,session===1?'aralShow(3)':`aralOpenSession(${session})`)}
 if(p===4){controls+=`<h1 class="aral-lesson-title"><span>Task 1: I Can Associate</span></h1><span class="aral-lesson-counter">${aralView.wordIndex+1}/4</span><span class="aral-association-word">${ARAL_ASSOCIATION_WORDS[aralView.wordIndex]}</span>`;for(let i=0;i<6;i++)controls+=`<input class="aral-input" name="word${i+1}" aria-label="Associated word ${i+1}" maxlength="60" value="${h(aralView.answers[i]||'')}" style="left:${28.8+i%2*22}%;top:${48.6+Math.floor(i/2)*6.9}%;width:20.3%;height:5.3%">`;button('Submit Task 1',39,70.5,22,9,'aralSubmit(event)')}
 if(p===5){controls+=`<div class="aral-feedback-copy" role="status"><p>${aralView.answers.length} response${aralView.answers.length===1?'':'s'} saved.</p>${aralView.answers.map(word=>`<span>${h(word)}</span>`).join('')}<p>Submitted for teacher review; no automatic score.</p></div>`;button('Try again',29,64,21,11,'aralRetryTaskOne()');button('Next — view task progress',51,64,21,11,"aralShow('task')")}
 const owl=({1:[77,25,8,13],2:[14,58,10,17],3:[10,65,9,13],4:[13,61,11,18],5:[15,50,10,18],6:[11,76,8,13],7:[66,12,5,9]})[p];
 app.innerHTML=`<section class="aral-screen" aria-label="Catch-Up Express learning program"><div class="aral-board" style="--owl-x:${owl[0]}%;--owl-y:${owl[1]}%"><img class="aral-art" src="${source}" width="1586" height="992" alt="Catch-Up Express ${['','weekly journey','Week 1 sessions','Word Explorer tasks','I Can Associate','feedback','session progress','weekly progress'][p]}" decoding="async" fetchpriority="high"><img class="aral-living-owl" src="${source}" alt="" aria-hidden="true" style="--owl-x:${owl[0]}%;--owl-y:${owl[1]}%;--owl-w:${owl[2]}%;--owl-h:${owl[3]}%">${aralOwlBlink(p)}${controls}<p class="aral-message" role="status" aria-live="polite">${h(aralView.message)}</p></div></section>`;
 if(typeof aralEnhanceSessionList==='function')aralEnhanceSessionList(p);
}
