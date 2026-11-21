(()=>{
 const validTimer=state=>state&&state.durationMs===GST_TIME_LIMIT_MS&&Number.isFinite(state.startedAt)&&state.startedAt!==null&&Number.isFinite(state.deadline)&&state.deadline>=state.startedAt;
 function isNewAttempt(state,report){
  const submittedAt=Date.parse(report?.submittedAt||report?.date||'');
  return state?.startedAt!==null&&state?.startedAt!==undefined&&Number.isFinite(submittedAt)&&state.startedAt>submittedAt;
 }
 gstIsSubmitted=function(answers=load('answer_'+gstBook.grade,{})){
  const report=load('assessment_'+gstBook.grade,{}),data=GST_BOOK_DATA[String(gstBook.grade)],timer=gstTimerState();
  if(report.status!=='submitted'||isNewAttempt(timer,report))return false;
  return data.questions.every(question=>(answers[question.number]??null)===(report.submittedAnswers?.[question.number]??null));
 };

 let submittingTimeout=false;
 function submitExpiredAttempt(){
  const state=gstTimerState(),data=GST_BOOK_DATA[String(gstBook.grade)];
  if(submittingTimeout||state.startedAt===null||state.finishedAt!==null||gstTimeRemaining(state)>0)return false;
  submittingTimeout=true;
  try{
   const now=Date.now(),answers=load('answer_'+gstBook.grade,{}),completedAt=new Date(now).toISOString(),result=gstScoreAnswers(gstBook.grade,answers);
   const answered=data.questions.filter(question=>['A','B','C','D'].includes(answers[question.number])).length;
   state.remainingMs=0;state.finishedAt=now;
   gstTimers.set(gstBook.grade,state);
   save('gst_timer_'+gstBook.grade,state);
   save('assessment_'+gstBook.grade,{
    ...load('assessment_'+gstBook.grade,{}),...result,type:'gst',answered,answers,status:'submitted',timedOut:true,
    date:completedAt,submittedAt:completedAt,submittedAnswers:{...answers},startedAt:state.startedAt,
    completedAt:now,elapsedMs:now-state.startedAt,remainingMs:0
   });
   gstBook.index=data.questions.length;gstBook.review=false;
   if(document.querySelector('.gst-book-screen'))renderGSTBookSpread();
   return true;
  }finally{submittingTimeout=false}
 }

 const renderGSTTimer=updateGSTTimer;
 updateGSTTimer=function(){
  const clock=document.getElementById('gstTimer');
  if(clock)renderGSTTimer();
  if(submitExpiredAttempt())return;
  const state=gstTimerState();
  if(!clock&&state.startedAt!==null&&state.finishedAt===null&&gstTimerInterval===null)gstTimerInterval=setInterval(updateGSTTimer,250);
 };

 const saveGSTAnswer=answerGSTBook;
 answerGSTBook=function(number,letter){
  const state=gstTimerState();
  if(gstIsSubmitted())return;
  if(state.startedAt!==null&&gstTimeRemaining(state)===0){submitExpiredAttempt();return}
  return saveGSTAnswer(number,letter);
 };

 const openGSTAssessment=openGSTBook;
 openGSTBook=function(){
  const grade=Number(user?.grade),selected=[7,8,9,10].includes(grade)?grade:selectedGrade;
  const savedTimer=load('gst_timer_'+selected,null),report=load('assessment_'+selected,{});
  const data=GST_BOOK_DATA[String(selected)],savedAnswers=load('answer_'+selected,{});
  const completedTimeout=validTimer(savedTimer)&&savedTimer.finishedAt!==null&&report.status==='submitted'&&report.timedOut===true&&
   data.questions.every(question=>(savedAnswers[question.number]??null)===(report.submittedAnswers?.[question.number]??null));
  const resumeAttempt=validTimer(savedTimer)&&savedTimer.finishedAt===null&&(!report.status||report.status!=='submitted'||isNewAttempt(savedTimer,report));
  const resumeIndex=load('gst_resume_'+selected,0);
  openGSTAssessment();
  if(!resumeAttempt&&!completedTimeout)return;
  gstBook.grade=selected;selectedGrade=selected;
  gstTimers.set(selected,savedTimer);
  save('gst_timer_'+selected,savedTimer);
  const count=data.questions.length;
  gstBook.index=completedTimeout||gstTimeRemaining(savedTimer)===0?count:Math.max(0,Math.min(count-1,Number.isInteger(resumeIndex)?resumeIndex:0));
  gstBook.review=false;
  renderGSTBookSpread();
 };
})();
