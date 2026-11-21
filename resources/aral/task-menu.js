const aralTaskMenu={page:0};
function aralOpenTask(index){
 if(navigationBusy||!Number.isInteger(index)||index<0||index>7)return;
 if(aralLessonView.active)aralLessonSaveDraft();
 aralTaskMenu.page=Math.floor(index/4);
 if(index===0)return aralStartTaskOne();
 return animatePageTransition('work',()=>{aralLessonView.active=true;aralLessonView.session=1;aralLessonView.index=index;aralLessonView.feedback=false;renderAralLesson()});
}
function aralTaskScroll(direction){
 if(navigationBusy)return;
 aralTaskMenu.page=Math.max(0,Math.min(1,aralTaskMenu.page+direction));renderAralTaskMenu();
}
function renderAralTaskMenu(){
 setOwl('work');nav.innerHTML='';const source='output/aral/3.png';
 let controls=aralControl('Back to Week 1',2.5,5.7,13.4,6.7,'aralShow(6)')+aralControl('Toggle sound cues',82,3,5.5,9,'aralSound()')+aralControl('Help',87.5,3,5.5,9,"aralNotice('Use the left and right arrows to browse seven tasks and the Self-Assessment Selfie. Select Start or Review to open an activity.')")+aralControl('Settings',93,3,5.5,9,"go('settings')");
 for(let card=0;card<4;card++){
  const index=aralTaskMenu.page*4+card,activity=ARAL_WEEK1[1].activities[index],done=aralLessonState(1,index).submitted,left=17.1+card*17.5;
  controls+=`<div class="aral-task-card-label" style="left:${left}%;top:39%;width:15.3%;height:8.5%"><small>${index===7?'Reflection':'Task '+(index+1)}</small><strong>${h(activity.title)}</strong></div>`;
  if(aralTaskMenu.page===1)controls+=`<span class="aral-task-card-symbol" style="left:${left}%;top:48%;width:15.3%;height:12%" aria-hidden="true">${['♡','Aa','✎','▣'][card]}</span>`;
  if(done)controls+=`<span class="aral-menu-check" style="left:${left+12}%;top:39%" aria-label="${h(activity.title)} submitted">✓</span><span class="aral-menu-review" style="left:${left+2.2}%;top:63%;width:11%">Review</span>`;
  controls+=aralControl(`${done?'Review':'Start'} ${index===7?'Self-Assessment Selfie':'Task '+(index+1)}`,19+card*17.5,61,14,9,`aralOpenTask(${index})`);
 }
 controls+=`<div class="aral-task-pagination"><button type="button" aria-label="Previous tasks" onclick="aralTaskScroll(-1)" ${aralTaskMenu.page===0?'disabled':''}>‹</button><span aria-live="polite">${aralTaskMenu.page===0?'Tasks 1–4':'Tasks 5–7 · Selfie'}</span><button type="button" aria-label="Next tasks" onclick="aralTaskScroll(1)" ${aralTaskMenu.page===1?'disabled':''}>›</button></div>`;
 app.innerHTML=`<section class="aral-screen" aria-label="Session 1 Word Explorer task menu"><div class="aral-board" style="--owl-x:10%;--owl-y:65%"><img class="aral-art" src="${source}" width="1586" height="992" alt="Session 1 Word Explorer"><img class="aral-living-owl" src="${source}" alt="" aria-hidden="true" style="--owl-x:10%;--owl-y:65%;--owl-w:9%;--owl-h:13%">${aralOwlBlink(3)}${controls}<p class="aral-message" role="status" aria-live="polite"></p></div></section>`;
}
function renderAralTaskSummary(){
 setOwl('work');nav.innerHTML='';const source='output/aral/task.png',count=aralRecords()[1]?.task1?.answers?.length||0;
 let controls=aralControl('Back to Session 1 tasks',2,4,11.5,7,'aralShow(3)')+aralControl('Toggle sound cues',81.5,4,4.8,8,'aralSound()')+aralControl('Help',87,4,4.8,8,"aralNotice('Task 1 is saved. Choose Start Task 2 to rate and describe your mood, or return to Session 1 to browse all tasks.')")+aralControl('Settings',93,4,5,8,"go('settings')")+aralControl('Review Task 1',17,78,17,8,'aralOpenTask(0)')+aralControl('Start Task 2',37,73,26,12,'aralOpenTask(1)')+aralControl('Back to Session 1',66,78,17,8,'aralShow(3)');
 app.innerHTML=`<section class="aral-screen" aria-label="Task 1 completed; next is Task 2"><div class="aral-board" style="--owl-x:13%;--owl-y:51%"><img class="aral-art" src="${source}" width="1672" height="941" alt="Task 1 completed, Session 1 Word Explorer"><img class="aral-living-owl" src="${source}" alt="" aria-hidden="true" style="--owl-x:13%;--owl-y:51%;--owl-w:10%;--owl-h:18%">${aralOwlBlink('task')}<span class="aral-summary-response-count">${count} response${count===1?'':'s'} saved.</span><span class="aral-summary-completion">Task 1 of 7<br>submitted.</span><span class="aral-summary-directions">Rate your mood, then describe it in three sentences.</span><span class="aral-summary-next-count">Next: Task 2 of 7</span>${controls}<p class="aral-message" role="status" aria-live="polite"></p></div></section>`;
}
