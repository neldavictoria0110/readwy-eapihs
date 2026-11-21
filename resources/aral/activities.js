/* Week 1 sessions use the workbook inside the supplied painted activity frame. */
const aralLessonView={active:false,session:2,index:0,feedback:false};
function aralLessonRecords(){return load('aral_week1_sessions_'+selectedGrade,{})}
function aralLessonState(session=aralLessonView.session,index=aralLessonView.index){if(session===1&&index===0&&typeof aralTaskOneComplete==='function'&&aralTaskOneComplete())return {values:{words:aralRecords()[1].task1.answers.join(', ')},submitted:true};return aralLessonRecords()[session]?.[index]||{values:{},submitted:false}}
function aralSessionComplete(session){const activities=ARAL_WEEK1[session]?.activities;return !!activities&&activities.every((_,index)=>aralLessonState(session,index).submitted)}
function aralSessionProgress(session){const activities=ARAL_WEEK1[session]?.activities||[];return {done:activities.filter((_,index)=>aralLessonState(session,index).submitted).length,total:activities.length}}
function aralWeekSubmittedCount(){return [1,2,3,4].reduce((count,session)=>count+aralSessionProgress(session).done,0)}
function aralOpenSession(session){
 if(navigationBusy)return;
 const activities=ARAL_WEEK1[session].activities;
 const pending=activities.findIndex((_,index)=>!aralLessonState(session,index).submitted);
 return animatePageTransition('work',()=>{aralLessonView.active=true;aralLessonView.session=session;aralLessonView.index=pending<0?0:pending;aralLessonView.feedback=false;renderAralLesson()});
}
function aralLessonSwitch(index){
 if(aralLessonView.session===1&&index===0&&typeof aralOpenTask==='function')return aralOpenTask(0);
 if(navigationBusy)return;
 aralLessonSaveDraft();
 return animatePageTransition('work',()=>{aralLessonView.index=index;aralLessonView.feedback=false;renderAralLesson()});
}
function aralLessonExit(){if(navigationBusy)return;aralLessonSaveDraft();aralLessonView.active=false;return aralShow(aralLessonView.session===1?3:6)}
function aralLessonValues(){
 const form=app.querySelector('#aralLessonForm');if(!form)return null;
 const values={};
 for(const field of form.querySelectorAll('[name]')){
  if(field.type==='checkbox'){values[field.name]??=[];if(field.checked)values[field.name].push(field.value)}
  else values[field.name]=field.value;
 }
 for(const canvas of form.querySelectorAll('canvas[data-name]'))values[canvas.dataset.name]=canvas.dataset.drawing||'';
 return values;
}
function aralLessonSaveDraft(){
 const values=aralLessonValues();if(!values)return;
 const records=aralLessonRecords(),session=aralLessonView.session,index=aralLessonView.index,old=records[session]?.[index]||{};
 const changed=JSON.stringify(old.values||{})!==JSON.stringify(values);
 records[session]??={};records[session][index]={...old,values,submitted:changed?false:!!old.submitted};save('aral_week1_sessions_'+selectedGrade,records);
}
function aralLessonSubmit(event){
 event?.preventDefault();if(navigationBusy)return false;
 const form=app.querySelector('#aralLessonForm');if(!form||!form.reportValidity())return false;
 const values=aralLessonValues(),activity=ARAL_WEEK1[aralLessonView.session].activities[aralLessonView.index];
 let message='';
 if(activity.either&&!activity.either.some(name=>String(values[name]||'').trim()))message=activity.either.length===1?'Draw your learning snapshot before submitting.':'Draw your pet or write a paragraph before submitting.';
 for(const field of activity.fields){if(['multi','check'].includes(field.type)&&!values[field.name]?.length)message='Choose at least one option for '+field.label+'.'}
 const status=app.querySelector('.aral-lesson-validation');
 if(message){status.textContent=message;status.focus();return false}
 const records=aralLessonRecords(),session=aralLessonView.session,index=aralLessonView.index;
 records[session]??={};records[session][index]={values,submitted:true,submittedAt:new Date().toISOString()};save('aral_week1_sessions_'+selectedGrade,records);
 aralLessonView.feedback=true;renderAralLesson();return true;
}
function aralLessonNext(){const next=aralLessonView.index+1;if(next<ARAL_WEEK1[aralLessonView.session].activities.length)return aralLessonSwitch(next);return aralLessonExit()}
function aralLessonField(field,values){
 const value=name=>h(String(values[name]??''));
 if(field.type==='table'){
  const fixed=Array.isArray(field.rows),rows=fixed?field.rows:Array.from({length:field.rows},()=>null);
  return `<div class="aral-table-wrap"><table><thead><tr>${field.columns.map(title=>`<th scope="col">${h(title)}</th>`).join('')}</tr></thead><tbody>${rows.map((row,r)=>`<tr>${field.columns.map((title,c)=>{if(fixed&&c===0)return `<th scope="row">${h(row)}</th>`;const name=field.name+'_'+r+'_'+c;return `<td><input name="${name}" aria-label="${h(fixed?row:'Row '+(r+1))}: ${h(title)}" value="${value(name)}" required maxlength="300"></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
 }
 if(field.type==='drawing')return `<fieldset class="aral-drawing"><legend>${h(field.label)}</legend><canvas width="900" height="300" data-name="${field.name}" aria-label="${h(field.label)}">Use the accompanying text response if drawing is unavailable.</canvas><button type="button" onclick="aralClearDrawing('${field.name}')">Clear drawing</button></fieldset>`;
 if(field.type==='select')return `<label>${h(field.label)}<select aria-label="${h(field.label)}" name="${field.name}" required><option value="">Choose…</option>${field.options.map(option=>`<option value="${h(option)}" ${values[field.name]===option?'selected':''}>${h(option)}</option>`).join('')}</select></label>`;
 if(field.type==='check'||field.type==='multi')return `<fieldset><legend>${h(field.label)}</legend>${field.options.map(option=>`<label class="aral-check"><input type="checkbox" name="${field.name}" value="${h(option)}" ${(values[field.name]||[]).includes(option)?'checked':''}>${h(option)}</label>`).join('')}</fieldset>`;
 return `<label>${h(field.label)}<textarea aria-label="${h(field.label)}" name="${field.name}" ${field.optional?'':'required'} maxlength="6000" rows="3">${value(field.name)}</textarea></label>`;
}
function aralClearDrawing(name){const canvas=app.querySelector(`canvas[data-name="${name}"]`);canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);canvas.dataset.drawing='';aralLessonSaveDraft()}
function aralAttachDrawings(values){
 const form=app.querySelector('#aralLessonForm');if(!form)return;
 form.addEventListener('input',aralLessonSaveDraft);form.addEventListener('change',aralLessonSaveDraft);
 for(const canvas of form.querySelectorAll('canvas[data-name]')){
  const context=canvas.getContext('2d');let drawing=false;
  canvas.dataset.drawing=values[canvas.dataset.name]||'';
  if(canvas.dataset.drawing){const image=new Image();image.onload=()=>context.drawImage(image,0,0);image.src=canvas.dataset.drawing}
  // The app rotates its landscape shell on portrait devices. Invert its real
  // viewport quad instead of treating rotated pointer coordinates as unrotated.
  const point=event=>{const rect=canvas.getBoundingClientRect(),portrait=document.documentElement.hasAttribute('data-display-portrait');return portrait?{x:(event.clientY-rect.top)/rect.height*canvas.width,y:(rect.right-event.clientX)/rect.width*canvas.height}:{x:(event.clientX-rect.left)/rect.width*canvas.width,y:(event.clientY-rect.top)/rect.height*canvas.height}};
  canvas.addEventListener('pointerdown',event=>{drawing=true;canvas.setPointerCapture(event.pointerId);const p=point(event);context.beginPath();context.moveTo(p.x,p.y);context.lineWidth=3;context.lineCap='round';context.strokeStyle='#382719';context.lineTo(p.x+.1,p.y+.1);context.stroke()});
  canvas.addEventListener('pointermove',event=>{if(!drawing)return;const p=point(event);context.lineTo(p.x,p.y);context.stroke()});
  const finish=()=>{if(!drawing)return;drawing=false;canvas.dataset.drawing=canvas.toDataURL('image/png');aralLessonSaveDraft()};canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
 }
}
function aralLessonReviewHTML(activity,values){
 return activity.fields.map(field=>{
  if(field.type==='drawing')return values[field.name]?`<figure><img src="${h(values[field.name])}" alt="${h(field.label)}"><figcaption>${h(field.label)}</figcaption></figure>`:'';
  if(field.type==='table')return aralLessonField(field,values).replaceAll('<input ','<input readonly ');
  const response=Array.isArray(values[field.name])?values[field.name].join(', '):values[field.name];return `<p><strong>${h(field.label)}</strong><br>${h(response||'—')}</p>`;
 }).join('');
}
function renderAralLesson(){
 const session=ARAL_WEEK1[aralLessonView.session],index=aralLessonView.index,activity=session.activities[index],state=aralLessonState(),values=state.values||{},feedback=aralLessonView.feedback;
 const source=aralPanelSource(4);setOwl('work');nav.innerHTML='';
 let controls=aralControl('Back to Week 1',2.5,5,13.4,7,'aralLessonExit()')+aralControl('Home — learning journey',91,3,5.5,9,"aralLessonView.active=false;go('map')")+aralControl('Toggle sound cues',77,3,5.5,9,'aralSound()')+aralControl('Help',84,3,5.5,9,"aralNotice('Work through each activity. Submit saves your responses for teacher review. Use the activity selector to revisit saved work.')");
 // Reuse the painted Submit button as the only main action.
 controls+=aralControl(feedback?(index+1<session.activities.length?'Next activity':'Return to Week 1'):'Submit activity',39,70.5,22,9,feedback?'aralLessonNext()':'aralLessonSubmit(event)');
 const body=feedback?`<div class="aral-lesson-feedback"><h2>Activity submitted</h2><p>Your responses are saved on this browser for teacher review.</p>${aralLessonReviewHTML(activity,values)}</div>`:`<form id="aralLessonForm" onsubmit="aralLessonSubmit(event)"><p class="aral-lesson-directions">${h(activity.directions)}</p>${activity.note?`<p>${h(activity.note)}</p>`:''}${activity.image?`<img class="aral-workbook-figure" src="resources/aral/workbook/${activity.image}.png" alt="${h(activity.image==='nature'?'Nalayag Monolith, Jaybanga Rice Terraces, and Malabrigo Beach':activity.image==='pets'?'Ferret, puppy, and Shih Tzu from the workbook':'Workbook reference-material table and uses')}">`:''}${activity.passage?`<details ${activity.fields.length===1?'open':''}><summary>${h(activity.passageTitle)} — ${h(activity.author)}</summary><div class="aral-passage">${activity.passage.split('\n\n').map(paragraph=>`<p>${h(paragraph)}</p>`).join('')}</div></details>`:''}${activity.video?`<p><a href="${activity.video}" target="_blank" rel="noopener">Watch the workbook’s video lesson</a>${activity.extraVideo?` · <a href="${activity.extraVideo}" target="_blank" rel="noopener">Digital Library System video</a>`:''}</p>`:''}${activity.fields.map(field=>aralLessonField(field,values)).join('')}<p class="aral-lesson-validation" role="alert" tabindex="-1"></p><button class="aral-form-submit" type="submit">Submit activity</button></form>`;
 app.innerHTML=`<section class="aral-screen" aria-label="Week 1 Session ${aralLessonView.session}"><div class="aral-board" style="--owl-x:13%;--owl-y:61%"><img class="aral-art" src="${source}" width="1586" height="992" alt="ARAL magical activity frame"><img class="aral-living-owl" src="${source}" alt="" aria-hidden="true" style="--owl-x:13%;--owl-y:61%;--owl-w:11%;--owl-h:18%">${aralOwlBlink(4)}<h1 class="aral-lesson-title"><small>Session ${aralLessonView.session}</small><span>${h(activity.title)}</span></h1><span class="aral-lesson-counter">${index+1}/${session.activities.length}</span><div class="aral-lesson-guidance">Read, explore, and share your ideas. Your work is saved as you go.</div><div class="aral-lesson-sheet"><div class="aral-lesson-navigation"><label for="aralActivitySelect">Activity</label><select id="aralActivitySelect" onchange="aralLessonSwitch(Number(this.value))">${session.activities.map((item,i)=>`<option value="${i}" ${i===index?'selected':''}>${aralLessonState(aralLessonView.session,i).submitted?'✓ ':''}${item.number||i+1}. ${h(item.title)}</option>`).join('')}</select><small>Workbook p. ${activity.page}</small></div>${body}</div>${controls}${feedback?`<span class="aral-lesson-action-label">${index+1<session.activities.length?'Next activity':'Week 1'}</span>`:''}<p class="aral-message" role="status" aria-live="polite"></p></div></section>`;
 aralAttachDrawings(values);
}
function aralEnhanceSessionList(panel){
 if(panel===7){
  const count=aralWeekSubmittedCount(),badge=app.querySelector('.aral-progress-count');
  if(badge&&count){badge.textContent=String(count);badge.setAttribute('aria-label',`Week 1: ${count} activities submitted`)}
 }
 if(panel!==2&&panel!==6)return;
 const board=app.querySelector('.aral-board');if(!board)return;
 for(const session of [2,3,4]){
  const name=document.createElement('span');name.className='aral-session-name';
  name.style.cssText=`left:${panel===2?59.2:52.1}%;top:${(panel===2?54.4:53.8)+(session-2)*11.7}%;width:${panel===2?19.5:18.5}%;height:4.9%`;
  const lettering=document.createElement('span');lettering.textContent=ARAL_WEEK1[session].title;name.append(lettering);board.append(name);const fit=()=>{const available=name.clientWidth-parseFloat(getComputedStyle(name).paddingLeft)-parseFloat(getComputedStyle(name).paddingRight);lettering.style.transform=`scaleX(${Math.min(1,available/Math.max(1,lettering.scrollWidth))})`};fit();const observer=new ResizeObserver(fit);observer.observe(name);
  if(aralSessionComplete(session)){
   const check=document.createElement('span');check.className='aral-session-complete';check.textContent='✓';check.setAttribute('aria-label',`Session ${session} completed`);check.style.cssText=`left:${panel===2?76:70}%;top:${(panel===2?51:50)+(session-2)*11.7}%`;board.append(check);
  }
 }
}
