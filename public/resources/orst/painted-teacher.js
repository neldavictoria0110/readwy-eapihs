/* Teacher-observed reading uses the registered section teacher's code, never a shared default. */
const orstTeacher={active:false,key:null,counts:Array(7).fill(0),validating:false,message:''};
function orstTeacherMode(){return orstPaint.stage===6&&orstTeacher.active&&orstTeacher.key===orstDraftKey()}
function orstOpenTeacherReading(){
 if(orstPaint.recording||orstCapture.finalizing||orstPaint.requesting)return;
 if(user?.role!=='student'||Number(user.grade)!==Number(selectedGrade)){orstPaint.message='Use the grade registered to this student for teacher assessment.';orstPaintCanvas();return}
 if(orstAttemptCount()<2){orstPaint.message='Read with Teacher becomes available after two attempts.';orstPaintCanvas();return}
 orstPaint.audio?.pause();orstTeacher.active=true;orstTeacher.key=orstDraftKey();orstTeacher.counts=Array(7).fill(0);orstTeacher.message='';orstPaint.message='';orstGoStage(6);
}
function orstChangeTeacherMiscue(index,delta){
 if(!orstTeacherMode()||orstTeacher.validating||!Number.isInteger(index)||index<0||index>6||![1,-1].includes(delta))return;
 const next=orstTeacher.counts[index]+delta,total=orstTeacher.counts.reduce((a,b)=>a+b,0)+delta;
 if(next<0)return;if(total>orstPassages()[orstPaint.passage].words){orstTeacher.message='Total miscues cannot exceed passage words.';orstPaintCanvas();return}
 orstTeacher.counts[index]=next;orstTeacher.message='';orstPaintCanvas();
}
async function orstSubmitTeacherReading(){
 if(!orstTeacherMode()||orstTeacher.validating)return;
 const input=document.getElementById('orstTeacherCode'),code=input?.value||'';if(!code){orstTeacher.message='Enter the assigned teacher’s code.';orstPaintCanvas();input?.focus();return}
 const key=orstDraftKey(),counts=[...orstTeacher.counts],studentId=user?.id||user?.lrn||user?.email,grade=selectedGrade;
 orstTeacher.validating=true;orstTeacher.message='Validating teacher code…';orstPaintCanvas();
 try{
  const result=await readwyValidateAssignedTeacher(code);if(key!==orstDraftKey()||grade!==selectedGrade||studentId!==(user?.id||user?.lrn||user?.email)||!orstTeacherMode())return;
  if(!result.ok){orstTeacher.message=result.message;return}
  const now=new Date().toISOString();
  orstPaint.draft={...orstNewDraft(),teacherValidated:true,teacherObservation:{...result,validatedAt:now,counts:[...counts]},manualReview:true,pronunciationReviewed:true,readingCoverageComplete:true,analysisStatus:'teacher-observed',miscues:counts,reviewed:true,seconds:null,readingAttempts:orstAttemptCount(),answers:{},completed:false};
  orstSaveDraft();if(input)input.value='';orstTeacher.active=false;orstPaint.question=0;orstGoStage(7);
 }catch{orstTeacher.message='Teacher validation failed. Try again.'}finally{orstTeacher.validating=false;if(orstTeacherMode())orstPaintCanvas()}
}
function orstTeacherRegions(){
 const r=orstRegion,regions=[];
 for(let i=0;i<7;i++){const y=296+i*59+28.5;regions.push(r('Decrease '+ORST_MISCUES[i],[1447,y-18,1483,y+18],'teacher-minus:'+i),r('Increase '+ORST_MISCUES[i],[1533,y-18,1569,y+18],'teacher-plus:'+i))}
 regions.push(r('Back to passage',[777,841,1004,915],'teacher-back'),r('Submit teacher-observed miscues',[1233,841,1505,915],'teacher-submit'));return regions.join('');
}
function orstPaintTeacherUI(ctx,text,art){
 if(orstPaint.stage===5){
  const limited=orstAttemptCount()>=2&&!orstPaint.recording;
  ctx.fillStyle='#fff1ad';ctx.fillRect(244,395,367,40);
  [[245,169,orstPaint.recording?'Stop':'Click to Start',limited, '#ff2460'],[426,184,'Read with Teacher',!limited,'#0766e9']].forEach(([x,w,label,disabled,color])=>{ctx.fillStyle=disabled?'#e3e8ed':color;ctx.beginPath();ctx.roundRect(x,396,w,37,18);ctx.fill();text(label,x+w/2,414,w-12,label==='Read with Teacher'?19:21,700,'center',disabled?'#65718b':'#fff')});
  if(orstPaint.message)text(orstPaint.message,1040,686,700,19,500,'center');
 }
 if(orstPaint.stage!==6)return;
 // Remove View Details from the supplied artwork, including on automatic analysis.
 ctx.drawImage(art,1577,724,4,76,1190,724,383,76);
 if(!orstTeacherMode()){document.getElementById('orstTeacherCode')?.remove();return}
 const gradient=ctx.createLinearGradient(366,213,970,810);gradient.addColorStop(0,'#e6f6ff');gradient.addColorStop(1,'#bce9ff');ctx.fillStyle=gradient;ctx.strokeStyle='#3487f5';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(366,213,604,597,25);ctx.fill();ctx.stroke();
 text('Oral Reading Analysis',390,253,550,37,700);
 text(orstPassages()[orstPaint.passage].title,407,303,530,26,700);
 const words=orstPassages()[orstPaint.passage].words,total=orstTeacher.counts.reduce((a,b)=>a+b,0),ors=100*(words-total)/words;
 const rows=[['Passage Words',words],['Total Miscues',total],['Oral Reading Score (WRS)',ors.toFixed(1)+'%'],['Automatic Attempts',orstAttemptCount()+' / 2'],['Assessment Mode','With Teacher']];
 rows.forEach(([label,value],i)=>{const y=335+i*55;ctx.fillStyle='#fbfdff';ctx.beginPath();ctx.roundRect(390,y,560,45,11);ctx.fill();text(label,407,y+23,365,24,500);text(value,931,y+23,175,25,700,'right')});
 text('('+words+' − '+total+') ÷ '+words+' × 100',670,642,530,26,700,'center');
 text('Assigned Teacher Code',407,677,520,23,700);
 ctx.fillStyle='#fff';ctx.strokeStyle='#8eb8f1';ctx.beginPath();ctx.roundRect(405,696,530,52,13);ctx.fill();ctx.stroke();
 if(orstTeacher.message)orstWrap(ctx,orstTeacher.message,530,20).slice(0,2).forEach((line,i)=>text(line,407,773+i*23,530,20,500));
 for(let i=0;i<7;i++){
  const y=296+i*59,cy=y+28.5;
  // Clear the original number, then draw shape-matched minus/count/plus controls.
  ctx.fillStyle='#fcffff';ctx.fillRect(1435,y+1,136,55);
  for(const [x,label] of [[1465,'−'],[1551,'+']]){ctx.fillStyle='#0866e8';ctx.beginPath();ctx.arc(x,cy,18,0,Math.PI*2);ctx.fill();text(label,x,cy,30,29,700,'center','#fff')}
  text(orstTeacher.counts[i],1508,cy,40,27,700,'center');
 }
 text('Count each observed miscue once.',1290,763,520,23,500,'center');
 ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(780,844,221,68,34);ctx.fill();text('Back',890,879,200,30,700,'center');
 ctx.fillStyle='#075be2';ctx.beginPath();ctx.roundRect(1236,844,266,68,34);ctx.fill();text('Submit',1369,879,235,31,700,'center','#fff');
 const board=document.querySelector('.orst-painted-board');let input=document.getElementById('orstTeacherCode');
 if(!input){input=document.createElement('input');input.id='orstTeacherCode';input.type='password';input.autocomplete='off';input.setAttribute('aria-label','Assigned teacher code');input.className='orst-teacher-code';input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();orstSubmitTeacherReading()}};board?.append(input)}input.disabled=orstTeacher.validating;
}
