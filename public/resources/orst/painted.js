/* A single composited image is the interface; native image-map areas activate its painted controls. */
const orstPaint={stage:1,passage:0,question:0,readingPage:0,draft:null,images:new Map(),generation:0,recording:false,requesting:false,recorder:null,stream:null,audio:null,url:null,timer:null,message:'',details:false,panelMode:'title',miscueIndex:-1,evidencePage:0};
const ORST_ART_SIZE={width:1672,height:941};
function orstStageAsset(stage){return [1,2,4].includes(stage)?`UI and owl/orst file/new orst/${stage}.png`:`resources/orst/painted/${stage}.png`}
function orstArt(stage){
 if(!orstPaint.images.has(stage))orstPaint.images.set(stage,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('ORST artwork could not load'));img.src=orstStageAsset(stage)}));
 return orstPaint.images.get(stage);
}
function orstRegion(label,coords,action){const outline=typeof orstButtonShape==='function'?orstButtonShape(orstPaint.stage,action,coords):null;const polygon=outline?orstButtonPolygon(outline):null;if(outline)coords=outline.box;return `<area role="button" shape="${polygon?'poly':'rect'}" data-art-polygon="${polygon?polygon.join(','):''}" data-action="${action}" data-art-coords="${coords.join(',')}" coords="${coords.join(',')}" href="#" alt="${h(label)}" aria-label="${h(label)}" onpointerenter="orstHoverControl(this)" onpointerleave="orstUnhoverControl(this)" onfocus="orstFocusControl()" onblur="orstFocusControl()" onkeydown="if(event.key===' '){event.preventDefault();this.click()}" onclick="event.preventDefault();orstActivateControl('${action}',event)">`}
function orstStageRegions(){
 const s=orstPaint.stage,r=(label,coords,action)=>orstRegion(label,coords,action),regions=[];
 if(s===1)regions.push(r('Start ORST',[1110,705,1595,840],'stage:2'));
 if(s===2){regions.push(r('Back to Home',[1340,35,1630,125],'home'));[[465,310,925,550],[955,310,1420,550],[465,575,925,815],[955,575,1420,815]].forEach((box,i)=>regions.push(r('Grade '+(7+i),box,'grade:'+(7+i))))}
 if(s===3)regions.push(r("I'm ready",[790,745,1290,865],'stage:4'));
 if(s===4){[[460,255,915,505],[940,255,1395,505],[460,525,915,775],[940,525,1395,775]].forEach((box,i)=>regions.push(r('Passage '+(i+1),box,'passage:'+i)));regions.push(r('Back',[800,802,1015,885],'stage:3'))}
 if(s===5){regions.push(r('Read with Teacher',[426,396,610,433],'read-with-teacher'),r('Start or stop reading',[245,396,414,433],'record-label'));regions.push(r(orstPaint.recording?'Stop recording':'Record your reading',[245,270,610,435],'record'),r('Play your recording',[245,440,610,505],'play'),r('Previous',[665,704,930,787],'previous-reading'),r('Next',[1150,705,1430,788],'next-reading'));ORST_MISCUES.forEach((label,i)=>{if(orstCanViewMiscue(i))regions.push(r(label+': view words read incorrectly',orstMiscueBox(5,i),'miscue:'+i))})}
 if(s===6&&typeof orstTeacherMode==='function'&&orstTeacherMode())return orstTeacherRegions();
 if(s===6){regions.push(r('Play your recording',[425,295,530,393],'play'),r('Reread',[775,838,1008,918],'reread'),r('Next: comprehension',[1230,835,1510,918],'questions'));for(let i=0;i<ORST_MISCUES.length;i++)if(orstCanViewMiscue(i))regions.push(r(ORST_MISCUES[i]+': view words read incorrectly',orstMiscueBox(6,i),'miscue:'+i))}
 if(s===7){const passage=orstPassages()[orstPaint.passage];passage.questions.forEach((_,i)=>{regions.push(r('Question '+(i+1),[285+i%5*65,276+Math.floor(i/5)*66,341+i%5*65,333+Math.floor(i/5)*66],'question:'+i))});(passage.questions[orstPaint.question]?.options||[]).forEach((o,i)=>regions.push(r(o.key+': '+o.text,[678,377+i*86,1378,454+i*86],'answer:'+o.key)));regions.push(r('Previous question',[668,740,934,828],'previous-question'),r('Next question',[1060,740,1384,828],'next-question'))}
 if(s===8)regions.push(r('Reread passage',[696,757,1067,866],'reread'),r('Continue',[1090,757,1554,873],'progress'));
 if(s===9){for(let i=0;i<4;i++)regions.push(r('Passage '+(i+1),[317+i*272,322,578+i*272,701],'passage:'+i));regions.push(r('Back',[72,788,309,879],'stage:4'),r('Continue to next passage',[990,785,1592,880],'continue'))}
 if(s===10)regions.push(r('View detailed report',[565,770,984,873],'report'),r('Continue to Learning Journey',[988,768,1555,873],'home'));
 return regions.join('');
}
function renderORSTPainted(){
 page='orst-welcome';activeModule='orst';nav.innerHTML='';setOwl('signup-form');
 orstPaint.draft=orstNormalizeDraft(orstPaint.draft||orstNewDraft());
 const stage=orstPaint.stage;
 if(typeof orstFeedback!=='undefined')orstFeedback.hoverAction=null;
 app.innerHTML=`<section class="orst-painted-screen" aria-label="ORST interface ${stage} of 10"><div class="orst-painted-board"><canvas id="orstPaintedArtwork" width="1672" height="941" aria-hidden="true"></canvas><img id="orstLiveArtwork" src="${orstStageAsset(stage)}" width="1672" height="941" alt="ORST interface ${stage} of 10" usemap="#orstLiveActions" draggable="false"><map name="orstLiveActions">${orstStageRegions()}</map><p class="orst-screenreader" id="orstLiveStatus" aria-live="polite"></p></div></section>`;
 positionORSTPainted();orstPaintCanvas();app.scrollTo(0,0);
}
function positionORSTPainted(){
 const screen=document.querySelector('.orst-painted-screen'),board=screen?.querySelector('.orst-painted-board');if(!board)return;
 const width=screen.clientWidth,height=screen.clientHeight;
 // Full viewport presentation: artwork and its native map share exactly the same axes.
 Object.assign(board.style,{width:width+'px',height:height+'px'});
 board.querySelectorAll('area[data-art-coords]').forEach(area=>{area.coords=(area.dataset.artPolygon||area.dataset.artCoords).split(',').map((n,i)=>Math.round(Number(n)*(i%2?height/941:width/1672))).join(',')});
}
function orstCanvasText(ctx,text,x,y,width,size=32,weight=500,align='left',color='#06114d'){
 ctx.font=`${weight} ${size}px ${weight>=600?'"Arial Rounded MT Bold", Arial':'Arial'}, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
 while(ctx.measureText(String(text)).width>width&&size>12){size--;ctx.font=`${weight} ${size}px ${weight>=600?'"Arial Rounded MT Bold", Arial':'Arial'}, sans-serif`}
 ctx.fillText(String(text),x,y);
}
function orstWrap(ctx,text,width,size){
 ctx.font=`${size}px Arial, sans-serif`;const lines=[];let line='';
 for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines;
}
function orstReadingPages(passage){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');const lines=passage.body.flatMap(p=>[...orstWrap(ctx,p,705,31),'']);
 const pages=[];for(let i=0;i<lines.length;i+=6)pages.push(lines.slice(i,i+6));return pages.length?pages:[[]];
}
function orstDuration(seconds){const n=Math.max(0,Math.floor(seconds||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}

function orstTrimQuestionArtwork(ctx,art,questionCount,optionCount){
 // Restore the artwork's own background at unused slots; no blank placeholder controls.
 for(let i=questionCount;i<10;i++){
  const x=283+i%5*65,y=275+Math.floor(i/5)*66;
  ctx.drawImage(art,609,y,4,60,x,y,62,60);
 }
 for(let i=optionCount;i<4;i++){
  const y=375+i*86;
  ctx.drawImage(art,1382,y,12,82,677,y,702,82);
 }
}

async function orstPaintCanvas(){
 const token=++orstPaint.generation,stage=orstPaint.stage;
 try{
  const art=await orstArt(stage);if(token!==orstPaint.generation)return;
  const canvas=document.getElementById('orstPaintedArtwork');if(!canvas)return;canvas.width=1672;canvas.height=941;const c=canvas.getContext('2d');c.drawImage(art,0,0,1672,941);
  const passage=orstPassages()[orstPaint.passage],draft=orstPaint.draft||orstNewDraft(),score=passage?orstScoreDraft(draft,passage):null;
  const text=(s,x,y,w,size=32,weight=500,align='left',color)=>orstCanvasText(c,s,x,y,w,size,weight,align,color);
  const badge=(x,y,w,passageBadge=true)=>{if(passageBadge){text('Grade '+selectedGrade,x-w*.27,y,w*.44,27,700,'center','#fff');text('Passage '+(orstPaint.passage+1),x+w*.27,y,w*.44,27,700,'center','#fff')}else text('Grade '+selectedGrade,x,y,w,28,700,'center','#fff')};
  if(stage===3)badge(1358,149,160,false);
  if(stage===5){badge(1260,140,315);orstPaintPassagePanel(c,text,passage);text(orstPaint.recording?'Click to Stop':orstPaint.message||'Click to Start',420,414,335,26,700,'center');text(typeof orstPaintedAudioLabel==='function'?orstPaintedAudioLabel():orstDuration(orstPaint.recording?(Date.now()-orstPaint.started)/1000:draft.seconds),520,475,150,22,700,'center');}
  if(stage===6){badge(1436,130,320);text(typeof orstPaintedAudioLabel==='function'?orstPaintedAudioLabel():orstDuration(draft.seconds),823,344,190,27,700,'center');orstPaintAnalysisRows(c,text,passage,draft);const analysisMessage=orstPaint.message||(draft.recorded?(draft.transcript?'Automatic word comparison':draft.analysisStatus==='unsupported'?'Speech recognition unsupported':'No transcript — review recording'):'No analysis yet');text(analysisMessage,680,305,440,16,500,'center');}
  if(stage===7){orstTrimQuestionArtwork(c,art,passage.questions.length,passage.questions[orstPaint.question].options.length);badge(1210,122,370);const q=passage.questions[orstPaint.question];text('Question '+(orstPaint.question+1)+' of '+passage.questions.length,680,216,650,25,700);c.fillStyle='#d4e3f8';c.fillRect(680,235,692,20);c.fillStyle='#0869ee';c.fillRect(680,235,692*(orstPaint.question+1)/passage.questions.length,20);let qsize=30;while(orstWrap(c,q.text,680,qsize).length>2&&qsize>18)qsize--;orstWrap(c,q.text,680,qsize).forEach((line,i)=>text(line,680,299+i*38,680,qsize,700));q.options.forEach((o,i)=>{const selected=draft.answers[orstPaint.question]===o.key;if(selected){c.fillStyle='#d9eaff';c.fillRect(789,383+i*86,569,65)}let osize=27;while(orstWrap(c,o.text,550,osize).length>2&&osize>18)osize--;orstWrap(c,o.text,550,osize).forEach((line,j)=>text(line,798,414+i*86+j*29,550,osize,selected?700:500))});for(let i=0;i<passage.questions.length;i++){const x=314+i%5*65,y=305+Math.floor(i/5)*66;c.beginPath();c.arc(x,y,26,0,Math.PI*2);c.fillStyle=i===orstPaint.question?'#0959e5':draft.answers[i]?'#d7f3e9':'#fff';c.fill();text(i+1,x,y,45,27,700,'center',i===orstPaint.question?'#fff':'#06114d')}if(orstPaint.message)text(orstPaint.message,1030,716,650,19,500,'center')}
  if(stage===5||stage===6)orstPaintMiscueRows(c,text,art,draft);
  if(stage>=8)orstPaintOfficialResults(c,text,stage,passage,draft,score,badge,art);
  if(typeof orstPaintTeacherUI==='function')orstPaintTeacherUI(c,text,art);
  if(typeof orstSyncAudioHUD==='function')orstSyncAudioHUD();
  if(typeof orstPaintAudioControls==='function')orstPaintAudioControls(c,text);
  if(typeof orstRefreshOwlMotion==='function')orstRefreshOwlMotion(canvas);
  if(typeof orstPaintSelections==='function')orstPaintSelections(c);
  if(token!==orstPaint.generation)return;const image=document.getElementById('orstLiveArtwork');if(image){image.dataset.ready='true';image.alt=`ORST screen ${stage}. Grade ${selectedGrade}. ${stage>=8?'Saved records: '+orstReadAttempts().filter(a=>a.grade===selectedGrade).length:''}`}
  const status=document.getElementById('orstLiveStatus');if(status)status.textContent=orstPaint.message;
 }catch(error){const image=document.getElementById('orstLiveArtwork');if(image)image.alt=error.message;console.error(error)}
}
function orstGoStage(stage){if(!Number.isInteger(stage)||stage<1||stage>10||orstPaint.requesting||(typeof orstCapture!=='undefined'&&(orstCapture.finalizing||orstCapture.starting)))return;if(orstPaint.recording){orstPaint.message='Stop recording before continuing';orstPaintCanvas();return}orstPaint.audio?.pause();orstPaint.stage=stage;orstPaint.message='';orstPaint.details=false;renderORSTPainted()}
function orstChoosePaintedPassage(index){if(index<0||index>3)return;orstPaint.passage=index;orstPaint.panelMode='title';orstPaint.miscueIndex=-1;orstPaint.evidencePage=0;orstPaint.hasChosenPassage=true;orstPaint.question=0;orstPaint.readingPage=0;orstPaint.draft=orstLoadDraft();orstRestoreAudio();orstGoStage(5)}
function orstPaintAction(action,event={}){
 const [command,value]=action.split(':'),draft=orstPaint.draft;
 if(command==='stage')return orstGoStage(Number(value));
 if(command==='grade'){selectedGrade=Number(value);orstPaint.passage=0;orstPaint.draft=orstLoadDraft();return orstGoStage(3)}
 if(command==='home'){orstStopPaintedAudio();return go('map')}
 if(command==='passage')return orstChoosePaintedPassage(Number(value));
 if(command==='read-with-teacher')return orstOpenTeacherReading();
 if(command==='teacher-minus'||command==='teacher-plus')return orstChangeTeacherMiscue(Number(value),command==='teacher-plus'?1:-1);
 if(command==='teacher-submit')return orstSubmitTeacherReading();
 if(command==='teacher-back'){orstTeacher.active=false;return orstGoStage(5)}
 if(command==='record-label')return orstTogglePaintedRecording();
 if(command==='record')return orstTogglePaintedRecording();
 if(command==='play')return orstPlayPaintedRecording();
 if(command==='miscue')return orstShowMiscue(Number(value));
 if(command==='details')return orstShowMiscue(-1);
 if(command==='previous-reading'){
  if(orstPaint.recording&&orstPaint.readingPage>0){orstPaint.readingPage--;return orstPaintCanvas()}
  if(orstPaint.panelMode==='details'&&orstPaint.evidencePage>0){orstPaint.evidencePage--;return orstPaintCanvas()}
  return orstGoStage(4);
 }
 if(command==='next-reading'){
  if(orstPaint.recording){const pages=orstReadingPages(orstPassages()[orstPaint.passage]);if(orstPaint.readingPage<pages.length-1){orstPaint.readingPage++;return orstPaintCanvas()}orstPaint.message='Stop recording to submit your reading';return orstPaintCanvas()}
  if(!orstReadingSubmitted())return;
  if(orstPaint.panelMode==='details'){const pages=Math.ceil(orstMiscueItems(orstPaint.miscueIndex??-1).length/3);if(orstPaint.evidencePage<pages-1){orstPaint.evidencePage++;return orstPaintCanvas()}}
  return orstGoStage(6);
 }
 if(command==='reread'){orstPaint.panelMode='title';orstPaint.miscueIndex=-1;orstPaint.readingPage=0;return orstGoStage(5)}
 if(command==='questions'){if(!draft?.recorded||!orstPaint.audioReady){orstPaint.message='Wait until your recording is ready to play';return orstPaintCanvas()}if(draft.audioSilent){orstPaint.message='No microphone sound detected — record again';return orstPaintCanvas()}draft.reviewed=true;orstSaveDraft();orstPaint.question=0;return orstGoStage(7)}
 if(command==='question'){const n=Number(value);if(n<0||n>=orstPassages()[orstPaint.passage].questions.length)return;orstPaint.question=n;orstPaint.message='';return renderORSTPainted()}
 if(command==='answer'){if(!orstPassages()[orstPaint.passage].questions[orstPaint.question].options.some(o=>o.key===value))return;draft.answers[orstPaint.question]=value;orstSaveDraft();return orstPaintCanvas()}
 if(command==='previous-question'){if(orstPaint.question>0){orstPaint.question--;return renderORSTPainted()}return orstGoStage(6)}
 if(command==='next-question'){const passage=orstPassages()[orstPaint.passage];if(!draft.answers[orstPaint.question]){orstPaint.message='Select an answer before continuing';return orstPaintCanvas()}if(orstPaint.question<passage.questions.length-1){orstPaint.question++;orstPaint.message='';return renderORSTPainted()}return orstCompletePaintedPassage()}
 if(command==='progress')return orstGoStage(9);
 if(command==='continue'){const next=orstSavedPassages().findIndex(r=>!r.record);return next<0?orstGoStage(10):orstChoosePaintedPassage(next)}
 if(command==='report')return orstDownloadReport();
}
function orstCompletePaintedPassage(){
 const passage=orstPassages()[orstPaint.passage],draft=orstPaint.draft;
 if(!(draft?.recorded||draft?.teacherValidated)||!draft.reviewed||passage.questions.some((_,i)=>!draft.answers[i]))return false;
 if(draft.completed){orstGoStage(8);return true}
 draft.completed=true;const result=orstScoreDraft(draft,passage);if(!result){orstSaveDraft();orstGoStage(8);return true}const saved=saveOrstAttempt({...result,correct:result.correct,total:passage.questions.length,date:new Date().toISOString(),passageIndex:orstPaint.passage,title:passage.title,answers:{...draft.answers},miscueCounts:[...draft.miscues],transcript:draft.transcript,miscueEvidence:draft.miscueEvidence,analysisStatus:draft.analysisStatus,wordsCompared:draft.wordsCompared,readingAttempts:orstAttemptCount(),teacherValidated:draft.teacherValidated,teacherObservation:draft.teacherObservation,recordingId:draft.recordingId,audioMime:draft.audioMime,manualReview:draft.manualReview,pronunciationReviewed:draft.pronunciationReviewed,miscueSchema:7,legacyCombinedMiscues:draft.legacyCombinedMiscues,miscueMigrationReview:draft.miscueMigrationReview});
 if(!saved){draft.completed=false;return false}orstSaveDraft();orstGoStage(8);return true;
}
function orstAudioDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('readwy-orst-audio-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('recordings');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function orstStoreAudio(blob,key){const db=await orstAudioDB();return new Promise((resolve,reject)=>{const tx=db.transaction('recordings','readwrite');tx.objectStore('recordings').put(blob,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function orstRestoreAudio(){
 orstPaint.audio?.pause();if(orstPaint.url)URL.revokeObjectURL(orstPaint.url);orstPaint.url=null;orstPaint.audio=null;const key=orstDraftKey();
 try{const db=await orstAudioDB();const tx=db.transaction('recordings'),request=tx.objectStore('recordings').get(key);request.onsuccess=()=>{db.close();if(key===orstDraftKey()&&request.result)orstPaint.url=URL.createObjectURL(request.result)}}catch{}
}
async function orstTogglePaintedRecording(){
 if(orstPaint.requesting)return;if(orstPaint.recording){orstPaint.recorder.stop();return}
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){orstPaint.message='Microphone unavailable';return orstPaintCanvas()}
 orstPaint.requesting=true;const key=orstDraftKey();
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(key!==orstDraftKey()||!document.querySelector('.orst-painted-screen')){stream.getTracks().forEach(t=>t.stop());return}
  orstPaint.audio?.pause();const recorder=new MediaRecorder(stream),chunks=[];orstPaint.recorder=recorder;orstPaint.stream=stream;
  recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
  recorder.onstop=async()=>{const seconds=Math.max(.1,(Date.now()-orstPaint.started)/1000);orstPaint.recording=false;clearInterval(orstPaint.timer);stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(key!==orstDraftKey())return;if(blob.size){orstPaint.draft.recorded=true;orstPaint.draft.seconds=seconds;orstPaint.draft.completed=false;orstPaint.draft.reviewed=false;orstSaveDraft();if(orstPaint.url)URL.revokeObjectURL(orstPaint.url);orstPaint.url=URL.createObjectURL(blob);try{await orstStoreAudio(blob,key)}catch{orstPaint.message='Recording available for this session'}}orstPaintCanvas()};
  orstPaint.draft={...orstNewDraft()};orstSaveDraft();recorder.start();orstPaint.started=Date.now();orstPaint.recording=true;orstPaint.message='';orstPaint.timer=setInterval(()=>orstPaintCanvas(),1000);orstPaintCanvas();
 }catch{orstPaint.message='Microphone permission needed';orstPaintCanvas()}finally{orstPaint.requesting=false}
}
function orstPlayPaintedRecording(){if(orstPaint.recording)return;if(!orstPaint.url){orstPaint.message='No recording yet';return orstPaintCanvas()}if(orstPaint.audio&&!orstPaint.audio.paused){orstPaint.audio.pause();return}orstPaint.audio??=new Audio(orstPaint.url);orstPaint.audio.play().catch(()=>{orstPaint.message='Playback unavailable';orstPaintCanvas()})}
function orstStopPaintedAudio(){if(orstPaint.recorder?.state==='recording')orstPaint.recorder.stop();orstPaint.audio?.pause();orstPaint.stream?.getTracks().forEach(t=>t.stop());clearInterval(orstPaint.timer)}
function orstDownloadReport(){
 const rows=orstSavedPassages();const report={grade:selectedGrade,recordCount:rows.filter(r=>r.record).length,passages:rows.map((r,index)=>({passageNumber:index+1,title:r.passage.title,result:r.record})),scoring:'WRS = (source passage words - total of all seven miscues) / source passage words × 100. CS = correct answers / actual questions × 100. Percentages are compared before display rounding. The profile is the lower WRS/CS band; this matches the six supplied examples and extends the three unspecified combinations as an application rule. Automatic counts and provisional answer keys require review. No 20/10/30-point or combined 120-point grading is used.'};
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ORST-Grade-'+selectedGrade+'-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
window.addEventListener('resize',positionORSTPainted,{passive:true});


