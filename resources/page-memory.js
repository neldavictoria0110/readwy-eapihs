
/* Restore the current tab after edits and refreshes, without replaying navigation. */
const READWY_VIEW_KEY='READwy_current_view_v1';
const READWY_PAGES=['startup','dial-preview','login','signup','forgot','subject','areas-preview','subjects-spread','journey','map','orst-welcome','work','wst','assessment-summary','settings','profile'];
const READWY_MODULES=['dashboard','gst','orst','srst','aral','interv','sra','reports','wst','assessment-library'];
function rememberReadwyView(){
 try{
  const elapsed=orstInterface.elapsed+(orstInterface.started===null?0:Date.now()-orstInterface.started);
  const scrolls=['.journey-scroll','.orst-passage-copy','.wst-editor'].map(selector=>{const el=app.querySelector(selector);return el?{selector,x:el.scrollLeft,y:el.scrollTop}:null}).filter(Boolean);
  const fields=[...app.querySelectorAll('.orst-passage-copy input,.orst-passage-copy textarea')].map(el=>({name:el.name,value:el.value}));
  const state={version:1,page,activeModule,grade:selectedGrade,story:window.getStoryViewState?.(),gstIndex:gstBook.index,orst:{index:orstInterface.index,stage:orstInterface.stage,newStage:typeof orstNew!=='undefined'?orstNew.stage:undefined,elapsed},wst:{step:wstInterface.step,grade:wstInterface.grade,submitted:wstInterface.submitted,mode:wstInterface.mode},scrolls,appScroll:app.scrollTop,fields};
  sessionStorage.setItem(READWY_VIEW_KEY,JSON.stringify(state));
 }catch{/* Disabled storage must never prevent navigation. */}
}
function restoreReadwyView(state){
 if(!state||state.version!==1||!READWY_PAGES.includes(state.page))return false;
 selectedGrade=[7,8,9,10].includes(state.grade)?state.grade:7;
 activeModule=READWY_MODULES.includes(state.activeModule)?state.activeModule:'';
 if(state.page==='work'&&!activeModule)return false;
 user=load('user',null);window.restoreStoryViewState?.(state.story);
 page=state.page;
 if(state.orst){
  if(typeof orstNew!=='undefined'&&Number.isInteger(state.orst.newStage)&&state.orst.newStage>=1&&state.orst.newStage<=12)orstNew.stage=state.orst.newStage;
  const index=Number(state.orst.index),count=orstSourcePassages(selectedGrade).length;
  orstInterface.index=Number.isInteger(index)&&index>=0&&index<count?index:0;
  orstInterface.stage=['read','questions','results'].includes(state.orst.stage)?state.orst.stage:'read';
  orstInterface.elapsed=Number.isFinite(state.orst.elapsed)&&state.orst.elapsed>=0?state.orst.elapsed:0;
  orstInterface.started=null;
 }
 if(page==='wst'){
  wstInterface.step=Number.isInteger(state.wst?.step)&&state.wst.step>=0&&state.wst.step<=3?state.wst.step:0;
  wstInterface.grade=selectedGrade;
  wstInterface.text=load('wst_draft_'+selectedGrade,{text:''}).text||'';
  wstInterface.plan=load('wst_plan_'+selectedGrade,{text:''}).text||'';
  wstInterface.checks=load('wst_checks_'+selectedGrade,{})||{};
  wstInterface.submitted=!!state.wst?.submitted;
  wstInterface.mode=['plan','draft'].includes(state.wst?.mode)?state.wst.mode:'draft';
 }
 render();
 if(page==='work'&&activeModule==='gst'&&Number.isInteger(state.gstIndex)){
  gstBook.index=Math.max(-1,Math.min(GST_BOOK_DATA[String(selectedGrade)].questions.length,state.gstIndex));renderGSTBookSpread();
 }
 if(Array.isArray(state.fields)){
  const fields=app.querySelectorAll('.orst-passage-copy input,.orst-passage-copy textarea');
  state.fields.forEach((saved,index)=>{if(fields[index]&&fields[index].name===saved.name)fields[index].value=String(saved.value??'')});
 }
 requestAnimationFrame(()=>{
  app.scrollTop=Number(state.appScroll)||0;
  for(const saved of Array.isArray(state.scrolls)?state.scrolls:[]){
   if(!['.journey-scroll','.orst-passage-copy','.wst-editor'].includes(saved.selector))continue;
   const el=app.querySelector(saved.selector);if(el){el.scrollLeft=Number(saved.x)||0;el.scrollTop=Number(saved.y)||0}
  }
 });
 return true;
}
function startReadwy(){
 let restored=false;
 const requestedView=new URLSearchParams(location.search).get('view');
 let teacherPreview=false;
 try{teacherPreview=requestedView==='teacher-preview'&&(window.readwyDeveloperTeacherPreview===true||sessionStorage.getItem('READWY_startup_teacher_preview')==='1'||(()=>{try{return load('user',null)?.role==='teacher'}catch{return false}})())}catch{}
 if(teacherPreview){
  // The teacher portal draws this route itself; a stale saved page must never paint over it.
  restored=true;
 }else if(new URLSearchParams(location.search).get('journeyModule')){
  // A programme route owns this document. Never let a stale saved login/startup
  // page repaint over the requested station screen.
  const requestedModule=new URLSearchParams(location.search).get('journeyModule');
  const moduleMap={gst:'gst',orst:'orst',wst:'wst',srst:'wst',aral:'aral',interv:'interv',sra:'sra',reports:'reports'};
  user=load('user',null);
  activeModule=moduleMap[requestedModule]||'gst';
  page=activeModule==='wst'?'wst':'work';
  restored=true;
  render();
 }else if(requestedView==='login'||requestedView==='startup'){
  page=requestedView;activeModule='';
  history.replaceState(null,'',location.pathname+location.hash);
 }else try{restored=restoreReadwyView(JSON.parse(sessionStorage.getItem(READWY_VIEW_KEY)))}catch{page='startup';activeModule=''}
 if(!restored)render();
 let timer;
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(rememberReadwyView,900)};
 new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
 app.addEventListener('scroll',schedule,{capture:true,passive:true});
 app.addEventListener('input',schedule);
 window.addEventListener('pagehide',rememberReadwyView);
 rememberReadwyView();
}
