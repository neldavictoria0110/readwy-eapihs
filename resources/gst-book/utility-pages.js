/* Settings and Profile are leaves in the current GST book, never new assessments. */
let gstUtilityPage=null;
function gstRememberQuestion(){
 const count=GST_BOOK_DATA[String(gstBook.grade)].questions.length;
 if(gstBook.index>=0&&gstBook.index<count)save('gst_resume_'+gstBook.grade,gstBook.index);
}
function gstUtilitySnapshot(page,anchorX,anchorY){
 const copy=gstPageSnapshot(page),style=getComputedStyle(page);
 copy.style.setProperty('left',(parseFloat(style.left)-anchorX)+'px','important');
 copy.style.setProperty('top',(parseFloat(style.top)-anchorY)+'px','important');
 return copy;
}
async function gstFlipContent(commit,direction=1){
 if(gstBook.busy)return;const spread=document.getElementById('gstSpread');if(!spread)return;
 const forward=direction===1,oldLeft=spread.querySelector('.gst-left'),oldRight=spread.querySelector('.gst-right');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced-motion');
 if(reduced||!oldLeft||!oldRight){commit();return}
 gstBook.busy=true;let leaf,rest,frame;
 try{
  const spine=980,top=18,width=550,height=735;
  const duration=1600;
  const front=gstUtilitySnapshot(forward?oldRight:oldLeft,forward?spine:spine-width,top);
  const resting=gstUtilitySnapshot(forward?oldLeft:oldRight,forward?spine-width:spine,top);
  const oldBackdrop=getComputedStyle(spread.closest('.gst-book-canvas')).backgroundImage;
  commit();
  const landing=spread.querySelector(forward?'.gst-left':'.gst-right');if(!landing)return;
  const back=gstUtilitySnapshot(landing,forward?spine-width:spine,top);
  rest=document.createElement('div');rest.className='gst-utility-rest';rest.inert=true;rest.setAttribute('aria-hidden','true');
  Object.assign(rest.style,{left:(forward?spine-width:spine)+'px',top:top+'px',width:width+'px',height:height+'px',right:'auto',bottom:'auto',backgroundImage:oldBackdrop,backgroundSize:'1536px 1024px',backgroundPosition:(-(forward?spine-width:spine))+'px '+(-top)+'px',backgroundColor:'#fff3d5'});
  rest.appendChild(resting);spread.appendChild(rest);
  leaf=document.createElement('div');leaf.className='gst-utility-leaf';leaf.inert=true;leaf.setAttribute('aria-hidden','true');
  Object.assign(leaf.style,{left:(forward?spine:spine-width)+'px',top:top+'px',width:width+'px',height:height+'px',transformOrigin:forward?'0 50%':'100% 50%'});
  for(const [content,isBack] of [[front,false],[back,true]]){
   const face=document.createElement('div');face.className='gst-utility-face'+(isBack?' gst-utility-face-back':'');
   const faceX=isBack?(forward?spine-width:spine):(forward?spine:spine-width);
   face.style.backgroundImage='url("resources/gst-book/assessment-clean-welcome.png")';
   face.style.backgroundSize='1536px 1024px';face.style.backgroundPosition=(-faceX)+'px '+(-top)+'px';
   const rightFace=(forward&&!isBack)||(!forward&&isBack);
   face.style.clipPath=rightFace?'path("M0 42 Q12 17 80 14 Q295 13 505 0 L548 714 Q525 735 445 728 Q180 722 0 735Z")':'path("M15 27 Q285 -6 550 36 L550 735 Q500 705 390 710 L0 710Z")';
   face.appendChild(content);
   const shade=document.createElement('div');shade.className='gst-utility-shade';face.appendChild(shade);
   shade.animate([{opacity:0},{opacity:.17,offset:.5},{opacity:0}],{duration,easing:'ease-in-out'});
   leaf.appendChild(face);
  }
  spread.appendChild(leaf);spread.classList.add('gst-utility-turning');
  const animation=leaf.animate(gstPhysicalTurnFrames(direction),{duration,easing:'cubic-bezier(.42,0,.58,1)',fill:'forwards'});
  function uncover(){if((animation.effect.getComputedTiming().progress||0)>=.5)rest?.remove();else frame=requestAnimationFrame(uncover)}
  frame=requestAnimationFrame(uncover);
  await animation.finished;
 }finally{cancelAnimationFrame(frame);leaf?.remove();rest?.remove();spread.classList.remove('gst-utility-turning');gstBook.busy=false}
 const heading=spread.querySelector('.gst-right h2');heading?.focus({preventScroll:true});
}
function gstBuildUtilitySpread(kind,title,markup){
 const template=document.createElement('template');template.innerHTML=markup;
 const form=template.content.querySelector('form');form.className='gst-utility-form';form.id='gstUtilityForm';
 const left=document.createElement('section'),right=document.createElement('section');
 left.className='gst-paper gst-left gst-utility-paper';right.className='gst-paper gst-right gst-utility-paper';
 left.setAttribute('aria-label',title);right.setAttribute('aria-label',kind==='profile'?'Student details':'Sound and preferences');
 left.innerHTML='<h2 tabindex="-1">'+h(title)+'</h2>';right.innerHTML='<h2 tabindex="-1">'+(kind==='profile'?'Student Details':'Sound & Comfort')+'</h2>';
 const leftBody=document.createElement('div'),rightBody=document.createElement('div');leftBody.className=rightBody.className='gst-utility-content';
 left.appendChild(leftBody);right.appendChild(rightBody);
 function field(name,target){
  const control=form.elements.namedItem(name);if(!control)return;
  const preference=control.closest('.preference-row');if(preference){target.appendChild(preference);return}
  const row=document.createElement('div');row.className='gst-utility-field';
  const label=control.closest('label')||(control.id?form.querySelector('label[for="'+control.id+'"]'):null);
  if(label)row.appendChild(label);if(!row.contains(control))row.appendChild(control);target.appendChild(row);
 }
 if(kind==='profile'){
  const photo=form.querySelector('.profile-photo-box');if(photo)leftBody.appendChild(photo);
  ['name','lrn'].forEach(name=>field(name,leftBody));
  ['grade','section','teacherName','email'].forEach(name=>field(name,rightBody));
 }else{
  ['theme','readingSize','lineSpacing','highContrast'].forEach(name=>field(name,leftBody));
  ['sound','volume','speechRate','reduceMotion'].forEach(name=>field(name,rightBody));
 }
 const actions=document.createElement('div');actions.className='gst-utility-actions';
 form.querySelectorAll('button').forEach(button=>{
  if(button.getAttribute('onclick')==='openGSTBook()'){button.removeAttribute('onclick');button.textContent='Back to question';button.onclick=()=>gstCloseUtility()}
  actions.appendChild(button);
 });
 const status=form.querySelector('#settingsStatus,#profileStatus');rightBody.appendChild(actions);if(status)rightBody.appendChild(status);
 form.replaceChildren(left,right);return form;
}
function renderStudentPage(kind,title,markup){
 if(!document.querySelector('.gst-book-screen')){workLayout(title,markup);return false}
 gstRememberQuestion();
 gstFlipContent(()=>{
  gstUtilityPage=kind;const spread=document.getElementById('gstSpread'),canvas=spread.closest('.gst-book-canvas');
  const form=gstBuildUtilitySpread(kind,title,markup);
  spread.replaceChildren(form);spread.classList.remove('gst-assessment','gst-summary-spread');
  canvas.dataset.utility=kind;canvas.classList.add('gst-showing-utility');
  canvas.querySelectorAll('.gst-page-hotspots,.gst-painted-next,.gst-welcome-next,.gst-review-return').forEach(control=>{control.hidden=true;control.style.visibility='hidden'});
  page='work';activeModule='gst';nav.innerHTML='';
 },1);
 return true;
}
function gstRestoreControls(){
 const canvas=document.querySelector('.gst-book-canvas');canvas?.classList.remove('gst-showing-utility');if(canvas)delete canvas.dataset.utility;
 canvas?.querySelectorAll('.gst-page-hotspots,.gst-painted-next,.gst-welcome-next,.gst-review-return').forEach(control=>{control.hidden=false;control.style.removeProperty('visibility')});
 gstUtilityPage=null;
}
function gstCloseUtility(){if(gstBook.busy)return;gstFlipContent(()=>{gstRestoreControls();renderGSTBookSpread();positionGSTBook()},-1)}
gstHome=function(){
 if(gstBook.busy)return;gstRememberQuestion();stopGSTOwlSpeech();
 return gstFlipContent(()=>{gstRestoreControls();gstBook.review=false;gstBook.index=-1;renderGSTBookSpread();positionGSTBook()},-1);
};
/* All GST navigation uses the same full-sheet hinge, speed and parchment. */
async function gstOpenQuestion(index,direction=1){
 if(gstBook.busy)return;
 const count=GST_BOOK_DATA[String(gstBook.grade)].questions.length;
 const next=Math.max(0,Math.min(count-1,index));
 gstRememberQuestion();
 const preserveLeft=!gstUtilityPage&&gstSharesSelection(gstBook.index,next);
 await gstFlipContent(()=>{
  gstRestoreControls();gstBook.review=false;gstBook.index=next;
  renderGSTBookSpread({preserveLeft});positionGSTBook();
 },direction);
 gstRememberQuestion();
}
turnGSTPage=async function(direction){
 if(gstBook.busy||![-1,1].includes(direction)||!document.querySelector('.gst-book-screen'))return;
 if(gstUtilityPage)return gstCloseUtility();
 const count=GST_BOOK_DATA[String(gstBook.grade)].questions.length;
 if(direction===1&&gstBook.index===count-1)return gstNextAction();
 if(direction===1&&gstBook.index>=count)return;
 if(gstBook.index===-1&&direction===1){
  const resume=load('gst_resume_'+gstBook.grade,null);
  startGSTTimer();
  return gstOpenQuestion(Number.isInteger(resume)&&resume>=0&&resume<count?resume:0,1);
 }
 const next=gstBook.index+direction;
 if(next===-1)return gstHome();
 if(next<0)return;
 return gstOpenQuestion(next,direction);
};
jumpGSTQuestion=function(index){return gstOpenQuestion(index,index<gstBook.index?-1:1)};
showGSTSummarySpread=async function(review){
 if(gstBook.busy)return;
 gstRememberQuestion();
 const count=GST_BOOK_DATA[String(gstBook.grade)].questions.length;
 if(gstBook.index<count)gstBook.returnIndex=Math.max(0,Math.min(count-1,gstBook.index));
 return gstFlipContent(()=>{
  gstRestoreControls();gstBook.review=review;gstBook.index=count;
  renderGSTBookSpread();positionGSTBook();
 },1);
};
