/* Controls follow the enlarged oral-reading page artwork. */
const orstInterface={index:0,stage:'read',started:null,elapsed:0,stream:null,recorder:null,url:null,timer:null,playback:null,busy:false,session:0};
function orstSourcePassages(grade){
 const source=SOURCE_DATA.orst[String(grade)]||[],starts=[];
 source.forEach((line,i)=>{if(/^Learner[’']s Copy$/i.test(line.trim()))starts.push(i)});
 return starts.map((start,index)=>{
  const lines=source.slice(start,starts[index+1]??source.length);
  const gradeIndex=lines.findIndex(line=>/^Grade\s+\d+$/i.test(line.trim()));
  const titleIndex=gradeIndex>=0?gradeIndex+1:lines.findIndex(line=>/^Graded Passage$/i.test(line.trim()))+1;
  const questionIndex=lines.findIndex(line=>/^Questions$/i.test(line.trim()));
  const paragraphs=lines.slice(titleIndex+1,questionIndex<0?lines.length:questionIndex);
  const body=paragraphs.filter(line=>!/^Reference:|^Number of words:|^Questions written/i.test(line));
  return {title:lines[titleIndex]||`Passage ${index+1}`,level:gradeIndex>=0?lines[gradeIndex]:'',paragraphs,body,questions:questionIndex<0?[]:lines.slice(questionIndex+1)};
 });
}
function orstCurrentPassage(){return orstSourcePassages(selectedGrade)[orstInterface.index]}
function orstAttemptKey(){return 'orst_attempt_'+selectedGrade+'_'+orstInterface.index}
function orstQuestionGroups(passage){
 const groups=[];
 for(const line of passage.questions){if(/^\s*\d+[.)]/.test(line))groups.push([line]);else if(groups.length)groups.at(-1).push(line)}
 return groups;
}
function orstWordCount(passage){return passage.body.join(' ').replace(/\[\d+\]/g,'').trim().split(/\s+/).filter(Boolean).length}
function orstStopAudio(){
 if(typeof orstStopReadingDetection==='function')orstStopReadingDetection();
 if(orstInterface.recorder?.state==='recording')orstInterface.recorder.stop();
 orstInterface.stream?.getTracks().forEach(track=>track.stop());orstInterface.stream=null;
 if(orstInterface.started!==null){orstInterface.elapsed+=Date.now()-orstInterface.started;orstInterface.started=null}
 clearInterval(orstInterface.timer);orstInterface.timer=null;
 if(typeof orstStopAudioMeter==='function'){orstStopAudioMeter();orstPaintAudioMeter()}
}
function orstResetAttempt(){
 orstInterface.session++;
 orstInterface.playback?.pause();orstInterface.playback=null;
 orstStopAudio();if(orstInterface.url)URL.revokeObjectURL(orstInterface.url);
 orstInterface.url=null;orstInterface.elapsed=0;orstInterface.stage='read';if(orstInterface.audioMeter)orstInterface.audioMeter.peaks=[];
}
const ORST_GRADE_ART={
 7:{color:'#08764e',glow:'#67ffc2',files:['Grade7_Interface_3_Passage_Selection.png','Grade7_Interface_4_Oral_Reading.png','Grade7_Interface_5_Comprehension.png','Grade7_Interface_6_Miscue_Analysis.png']},
 8:{color:'#886000',glow:'#ffe06c',files:['Grade_8_Image_3_Passage_Selection.png','Grade_8_Image_4_Oral_Reading.png','Grade_8_Image_5_Comprehension_Test.png','Grade_8_Image_6_Miscue_Analysis.png']},
 9:{color:'#642090',glow:'#d493ff',files:['Grade_9_Image_3_Passage_Selection.png','Grade_9_Image_4_Oral_Reading.png','Grade_9_Image_5_Comprehension_Test.png','Grade_9_Image_6_Miscue_Analysis.png']},
 10:{color:'#873416',glow:'#ffae70',files:['Grade_10_Image_3_Passage_Selection.png','Grade_10_Image_4_Oral_Reading.png','Grade_10_Image_5_Comprehension_Test.png','Grade_10_Image_6_Miscue_Analysis.png']}
};
function orstArtwork(stage){const theme=ORST_GRADE_ART[selectedGrade]||ORST_GRADE_ART[7];return encodeURI('UI and owl/orst file/Grade '+selectedGrade+'/'+theme.files[{choose:0,read:1,record:1,questions:2,results:3}[stage]??0])}
// Live vector details keep the illustrated passage toolbar free of status badges.
function orstPassageToolbarDetails(){
 const badges=[330,577,849,1117,1369].map(x=>`<circle cx="${x}" cy="866" r="20" fill="#002d20"/>`).join('');
 const face=(x,icon)=>`<g class="orst-toolbar-colored-icon"><circle cx="${x}" cy="849" r="36" fill="#003524"/><g transform="translate(${x} 849)" fill="none" stroke="#f4d481" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${icon}</g></g>`;
 return `<svg class="orst-toolbar-details" viewBox="0 0 1672 941" aria-hidden="true">${badges}<circle cx="414" cy="824" r="14" fill="#003524"/><path d="M399 815Q414 821 421 837" fill="none" stroke="#bca468" stroke-width="2"/>${face(897,'<rect x="-7" y="-22" width="14" height="29" rx="7" fill="#d8b45c"/><path d="M-14-2v5a14 14 0 0 0 28 0v-5 M0 17v8 M-9 25H9"/>')}${face(1170,'<path d="M-17-20H9l11 11v29h-37Z" fill="#c8aa60"/><path d="M9-20v12h11"/><path d="M-5-6q0-10 10-8q12 4 1 12q-5 3-5 8" stroke="#254e38"/><circle cx="1" cy="13" r="1.5" fill="#254e38" stroke="none"/>')}${face(1416,'<path d="M-21 20V1h8v19Z M-5 20v-34h8v34Z M11 20v-44h8v44Z" fill="#e6c978" stroke-width="1.5"/>')}</svg>`;
}
function orstSelectionCleanupArtwork(mode){
 const grade=mode==='grade',asset=grade?'resources/orst/grade-selection-clean.png':`resources/orst/grade-${selectedGrade}-passage-selection-clean.png`;
 const circles=grade?[[437,850],[713,850],[965,850],[1227,850]]:[[384,849],[637,849],[897,849],[1170,849],[1416,849]];
 const journey=grade?[31,811,158,101]:[65,811,160,101];
 const shapes=[`<rect x="${journey[0]}" y="${journey[1]}" width="${journey[2]}" height="${journey[3]}" rx="18"/>`,...circles.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="40"/>`)];
 return `<svg class="orst-selection-clean-layer" viewBox="0 0 1672 941" aria-hidden="true"><defs><clipPath id="orst-${mode}-toolbar-clean"><path d="M0 787H1672V941H0Z ${grade?'M850 642H1335V787H850Z':'M795 642H1347V787H795Z'}"/></clipPath></defs><image href="${asset}" width="1672" height="941" preserveAspectRatio="none" clip-path="url(#orst-${mode}-toolbar-clean)"/></svg><svg class="orst-toolbar-hover-art" viewBox="0 0 1672 941" aria-hidden="true"><defs>${shapes.map((shape,i)=>`<clipPath id="orst-${mode}-toolbar-hover-${i}">${shape}</clipPath>`).join('')}</defs>${shapes.map((_,i)=>`<g class="orst-toolbar-hover-light" data-toolbar-light="${i}"><image href="${asset}" width="1672" height="941" preserveAspectRatio="none" clip-path="url(#orst-${mode}-toolbar-hover-${i})"/></g>`).join('')}</svg>${grade?'':orstPassageToolbarDetails()}`;
}
function orstTrackToolbarHover(mode){
 const screen=app.querySelector(mode==='grade'?'.orst-grade-screen':'.orst-interface-screen');if(!screen?.addEventListener)return;
 const centers=mode==='grade'?[[110,860],[437,850],[713,850],[965,850],[1227,850]]:[[145,860],[384,849],[637,849],[897,849],[1170,849],[1416,849]];
 screen.addEventListener('pointermove',event=>{
  const image=screen.querySelector('.orst-welcome-original,.orst-interface-backdrop'),bounds=image?.getBoundingClientRect();if(!bounds?.width)return;
  const point=readwyCanvasPoint(event,image),x=point.x*1672,y=point.y*941;
  const index=centers.findIndex(([cx,cy],i)=>i===0?Math.abs(x-cx)<80&&y>810&&y<918:Math.hypot(x-cx,y-cy)<=44||(Math.abs(x-cx)<110&&y>885&&y<920));
  if(index<0)screen.removeAttribute('data-orst-toolbar-hover');else screen.dataset.orstToolbarHover=String(index);
 },{passive:true});
 screen.addEventListener('pointerleave',()=>screen.removeAttribute('data-orst-toolbar-hover'));
}
function orstPassagePressedArtwork(){
 const outline='M 642 382 L 651 355 L 718 334 L 746 315 L 773 335 L 835 354 L 851 378 L 851 610 L 835 630 L 774 640 L 746 653 L 718 640 L 655 629 L 642 612 Z';
 return `<svg class="orst-passage-backdrop-press" viewBox="0 0 1672 941" aria-hidden="true" focusable="false"><defs>${[0,1,2,3].map(i=>`<clipPath id="orst-passage-frame-${i}"><path d="${outline}" transform="translate(${i*220} 0)"/></clipPath>`).join('')}</defs>${[0,1,2,3].map(i=>`<g class="orst-pressed-passage orst-pressed-passage-${i}" style="--card-x:${746+i*220}px;--card-y:484px"><path class="orst-card-recess" d="${outline}" transform="translate(${i*220} 0)"/><image class="orst-card-pressed-art" href="${orstArtwork('choose')}" width="1672" height="941" clip-path="url(#orst-passage-frame-${i})"/></g>`).join('')}</svg>`;
}
function orstReadingArtworkControls(){
 const passage=orstCurrentPassage();
 return `<svg class="orst-reading-clean-plate" viewBox="0 0 1672 941" aria-hidden="true"><defs><clipPath id="orst-audio-clean-region"><path d="M1101 146H1563V326H1101Z"/></clipPath><clipPath id="orst-comprehension-button-clean-region"><path d="M329 758H850V873H329Z"/></clipPath><clipPath id="orst-reading-clean-regions"><path d="M180 190H1008V735H180Z M830 75H995V133H830Z M1450 277H1543V312H1450Z M1108 606H1550V672H1108Z"/></clipPath></defs><image href="resources/orst/reading-clean.png" width="1672" height="941" preserveAspectRatio="none" clip-path="url(#orst-reading-clean-regions)"/><image href="resources/orst/grade-${selectedGrade}-reading-button-clean.png" width="1672" height="941" preserveAspectRatio="none" clip-path="url(#orst-comprehension-button-clean-region)"/><image href="resources/orst/grade-${selectedGrade}-audio-clean.png" width="1672" height="941" preserveAspectRatio="none" clip-path="url(#orst-audio-clean-region)"/></svg>${orstAudioControlsArtwork()}<map name="orst-reading-map"><area class="orst-record-area" shape="circle" coords="1183,198,43" href="#" role="button" aria-label="${orstInterface.started!==null?'Finish recording':'Record reading'}" onclick="orstToggleReading();return false"><area class="orst-play-area" shape="circle" coords="1329,198,43" href="#" role="button" aria-label="Play reading recording" onclick="orstPlayRecording();return false"><area class="orst-stop-area" shape="circle" coords="1473,198,43" href="#" role="button" aria-label="Stop audio and recording" onclick="orstFinishRecording();return false"><area shape="rect" coords="1115,275,1435,316" href="#" role="button" aria-label="Seek within reading recording" onclick="orstSeekRecording(event);return false"><area shape="rect" coords="1110,85,1545,145" href="#" role="button" aria-label="Read aloud with teacher" onclick="orstReadWithTeacher();return false"><area shape="rect" coords="345,769,835,851" href="#" role="button" aria-label="Comprehension test" onclick="orstSelectStage('questions');return false"><area shape="rect" coords="1090,744,1575,887" href="#" role="button" aria-label="Miscue analysis" onclick="orstSelectStage('results');return false"></map><button class="orst-back-to-passages" type="button" aria-label="Back to passage selection" onclick="orstSelectStage('choose')">← Passages</button><span class="orst-painted-grade-label">Grade ${selectedGrade}<br>${h(passage.level.replace(/^Grade/i,'Passage'))}</span><div class="orst-painted-reading-stats"><span>${orstWordCount(passage)}</span><span>${orstInterface.elapsed?' '+orstWordCount(passage):'—'}</span><span id="orstPaintedElapsed">${typeof orstFormatDuration==='function'?orstFormatDuration(orstInterface.elapsed):Math.floor(orstInterface.elapsed/1000)+'s'}</span><span>${orstInterface.elapsed?Math.round(orstWordCount(passage)*60000/orstInterface.elapsed):'—'}</span></div>`;
}
function orstAudioControlsArtwork(){
 return `<svg class="orst-audio-controls-art" viewBox="0 0 1672 941" aria-hidden="true"><defs><linearGradient id="orst-record-face" x2="0" y2="1"><stop stop-color="#bf3840"/><stop offset="1" stop-color="#76171c"/></linearGradient><linearGradient id="orst-play-face" x2="0" y2="1"><stop stop-color="var(--orst-theme)"/><stop offset="1" stop-color="#10242d"/></linearGradient></defs><circle class="orst-record-ring" cx="1183" cy="198" r="41" fill="url(#orst-record-face)" stroke="#d5b26b" stroke-width="3"/><circle cx="1183" cy="198" r="36" fill="none" stroke="#fff1cf44" stroke-width="1"/><g fill="none" stroke="#fff7e2" stroke-width="3.5" stroke-linecap="round"><rect x="1177" y="180" width="12" height="23" rx="6"/><path d="M1171 195v3a12 12 0 0 0 24 0v-3 M1183 210v8 M1176 218h14"/></g><circle class="orst-play-ring" cx="1329" cy="198" r="41" fill="url(#orst-play-face)" stroke="#d5b26b" stroke-width="3"/><circle cx="1329" cy="198" r="36" fill="none" stroke="#fff1cf44" stroke-width="1"/><path class="orst-play-symbol" d="M1319 181L1347 198L1319 215Z" fill="#fff4d1"/><g class="orst-pause-symbol" fill="#fff4d1"><rect x="1318" y="182" width="8" height="32" rx="1"/><rect x="1332" y="182" width="8" height="32" rx="1"/></g><circle class="orst-stop-ring" cx="1473" cy="198" r="41" fill="#14252c" stroke="#d5b26b" stroke-width="3"/><circle cx="1473" cy="198" r="36" fill="none" stroke="#fff1cf44" stroke-width="1"/><rect x="1460" y="185" width="26" height="26" rx="2" fill="#fff4d1"/></svg><div class="orst-reading-meter"><canvas id="orstAudioWaveform" width="308" height="32" aria-hidden="true"></canvas><span id="orstAudioMeterTime" role="timer" aria-label="Recording and playback time">${typeof orstFormatDuration==='function'?orstFormatDuration(orstInterface.elapsed):'00:00'}</span></div>`;
}
function orstPlayRecording(){
 if(orstInterface.started!==null||orstInterface.busy){orstRenderPanel('Finish recording before pressing Play.');return}
 if(!orstInterface.url){orstRenderPanel('Record your reading first, then press Play.');return}
 const previous=orstInterface.playback;
 if(previous&&!previous.paused){previous.pause();if(typeof orstPaintAudioMeter==='function')orstPaintAudioMeter();return}
 const audio=previous||new Audio(orstInterface.url);orstInterface.playback=audio;
 if(audio.ended)audio.currentTime=0;
 const update=()=>{if(typeof orstRunAudioMeter==='function')orstRunAudioMeter()};
 audio.onplay=update;audio.onpause=update;audio.onended=update;audio.ontimeupdate=update;audio.onloadedmetadata=update;
 audio.play().then(update).catch(()=>orstRenderPanel('Playback is unavailable. Please try again.'));
}
function orstFinishRecording(){
 orstInterface.playback?.pause();if(orstInterface.playback)try{orstInterface.playback.currentTime=0}catch{}
 window.speechSynthesis?.cancel();orstStopAudio();
 if(app.querySelector('.orst-themed-screen'))renderORST();
}
function orstReadWithTeacher(){
 if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){orstRenderPanel('Read the passage aloud with your teacher.');return}
 window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(orstCurrentPassage().body.join(' '));speech.lang='en-US';speech.rate=.85*readwySpeechRate();speech.volume=readwyVolume();if(readwyCanPlaySound())window.speechSynthesis.speak(speech);
}
renderORST=function(){
 page='work';activeModule='orst';nav.innerHTML='';
 stopOwlFlight();owl.dataset.motion='still';owl.style.display='none';
 const theme=ORST_GRADE_ART[selectedGrade],choosing=orstInterface.stage==='choose';
 app.innerHTML=`<section class="orst-interface-screen orst-themed-screen" style="--orst-theme:${theme.color};--orst-glow:${theme.glow}" aria-label="Grade ${selectedGrade} Voice Station"><div class="orst-interface-board" data-stage="${orstInterface.stage}"><img class="orst-interface-backdrop" src="${orstArtwork(orstInterface.stage)}" ${choosing?'usemap="#orst-passage-map"':['read','record'].includes(orstInterface.stage)?'usemap="#orst-reading-map"':''} alt="Grade ${selectedGrade} · ${choosing?'Select a passage':orstInterface.stage==='questions'?'Comprehension test':orstInterface.stage==='results'?'Miscue analysis':'Oral reading'}" draggable="false">${choosing?orstPassagePressedArtwork()+orstSelectionCleanupArtwork('passage')+`<map name="orst-passage-map">${orstSourcePassages(selectedGrade).map((p,i)=>`<area class="orst-passage-card" shape="poly" coords="${[[642,382],[651,355],[718,334],[746,315],[773,335],[835,354],[851,378],[851,610],[835,630],[774,640],[746,653],[718,640],[655,629],[642,612]].map(([x,y])=>[x+i*220,y].join(',')).join(',')}" href="#" role="button" data-passage="${i}" aria-label="${h(p.level)}: ${h(p.title)}" aria-pressed="${orstInterface.index===i}" onclick="orstChoosePassage(${i});return false">`).join('')}<area shape="rect" coords="1460,15,1655,80" href="#" role="button" aria-label="ORST welcome" onclick="go('orst-welcome');return false"><area shape="rect" coords="60,805,228,918" href="#" role="button" aria-label="Journey" onclick="go('map');return false"><area shape="rect" coords="260,805,505,918" href="#" role="button" aria-label="Select grade level" onclick="orstReturnToGrades();return false"><area shape="rect" coords="550,805,745,918" href="#" role="button" aria-label="Choose passage" onclick="orstSelectStage('choose');return false"><area shape="rect" coords="785,805,1025,918" href="#" role="button" aria-label="Read selected passage" onclick="orstSelectStage('read');return false"><area shape="rect" coords="1040,805,1270,918" href="#" role="button" aria-label="Comprehension test" onclick="orstSelectStage('questions');return false"><area shape="rect" coords="1310,805,1535,918" href="#" role="button" aria-label="Miscue analysis" onclick="orstSelectStage('results');return false"><area shape="rect" coords="814,661,1328,742" href="#" role="button" aria-label="Read selected passage" onclick="orstSelectStage('read');return false"></map>`:'<article class="orst-passage-copy" tabindex="0" aria-label="Passage and reading assessment"></article>'}${['read','record'].includes(orstInterface.stage)?orstReadingArtworkControls():''}</div></section>`;
 positionORSTInterface();orstRenderPanel();if(choosing)orstTrackToolbarHover('passage');if(typeof orstRunAudioMeter==='function')orstRunAudioMeter();app.scrollTo(0,0);
};
function positionORSTInterface(){
 const screen=app.querySelector('.orst-interface-screen'),board=screen?.querySelector('.orst-interface-board');if(!board)return;
 board.style.transform=`translate(0px,0px) scale(${screen.clientWidth/1672},${screen.clientHeight/941})`;
 const panel=screen.querySelector('.orst-passage-copy');if(!panel)return;
 if(screen.classList?.contains('orst-themed-screen'))return;
 const [p0,p1,p2,p3]=[[584,253],[1189,252],[1231,684],[584,685]];
 const ux=p1[0]-p2[0],vx=p3[0]-p2[0],wx=p0[0]-p1[0]+p2[0]-p3[0];
 const uy=p1[1]-p2[1],vy=p3[1]-p2[1],wy=p0[1]-p1[1]+p2[1]-p3[1];
 const denominator=ux*vy-vx*uy,g=(wx*vy-vx*wy)/denominator,j=(ux*wy-wx*uy)/denominator;
 const ax=p1[0]-p0[0]+g*p1[0],ay=p1[1]-p0[1]+g*p1[1],bx=p3[0]-p0[0]+j*p3[0],by=p3[1]-p0[1]+j*p3[1];
 panel.style.transform=`matrix3d(${ax/640},${ay/640},0,${g/640},${bx/440},${by/440},0,${j/440},0,0,1,0,${p0[0]},${p0[1]},0,1)`;
}
function orstChooseGrade(grade){
 if(![7,8,9,10].includes(grade)||orstInterface.busy)return;
 orstResetAttempt();selectedGrade=grade;orstInterface.index=0;orstInterface.stage='choose';renderORST();
}
function orstChoosePassage(index){
 if(!Number.isInteger(index)||index<0||index>=orstSourcePassages(selectedGrade).length||orstInterface.busy)return;
 const choosing=orstInterface.stage==='choose';
 orstResetAttempt();orstInterface.index=index;
 if(choosing){
  orstInterface.stage='choose';
  app.querySelectorAll('.orst-passage-card').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.passage)===index)));
 }else orstRenderPanel();
}
function orstReadingTextMarkup(passage){
 const notesAt=passage.paragraphs.findIndex(line=>/^(?:references?(?::|$)|source:|number of words:|no\. of words:|written by|questions written)/i.test(line.trim()));
 const body=notesAt<0?passage.paragraphs:passage.paragraphs.slice(0,notesAt);
 const notes=notesAt<0?[]:passage.paragraphs.slice(notesAt);
 return `<div class="orst-reading-body">${body.map(line=>`<p>${h(line)}</p>`).join('')}</div>`+(notes.length?`<footer class="orst-reading-reference">${notes.map(line=>`<p>${h(line)}</p>`).join('')}</footer>`:'');
}
function orstRenderPanel(message=''){
 const panel=app.querySelector('.orst-passage-copy'),passage=orstCurrentPassage();if(!panel||!passage)return;
 const colors={7:'#134b38',8:'#654700',9:'#54236a',10:'#783318'};
 panel.style?.setProperty('--orst-ink',colors[selectedGrade]||colors[7]);
 const attempt=load(orstAttemptKey(),{}),groups=orstQuestionGroups(passage);
 const picker=['read','record'].includes(orstInterface.stage)?'':`<select class="orst-passage-picker" aria-label="Choose a passage" onchange="orstChoosePassage(Number(this.value))">${orstSourcePassages(selectedGrade).map((p,index)=>`<option value="${index}" ${index===orstInterface.index?'selected':''}>Passage ${index+1}${p.level?' · '+h(p.level):''}</option>`).join('')}</select>`;
 let content='';
 if(['read','record'].includes(orstInterface.stage))content=`<div class="orst-reading-scroll" role="region" aria-label="Scrollable passage text" tabindex="0">${orstReadingTextMarkup(passage)}</div>`;
 if(orstInterface.stage==='questions')content=groups.map((group,index)=>`<p>${group.map(h).join('<br>')}</p><textarea rows="2" aria-label="Answer question ${index+1}" onchange="orstSaveAnswer(${index},this.value)">${h(attempt.answers?.[index]||'')}</textarea>`).join('');
 if(orstInterface.stage==='results'){
  const words=orstWordCount(passage);
  content=`<form onsubmit="orstSaveProfile(event)"><p class="orst-passage-meta">${words} words · ${Math.round(orstInterface.elapsed/1000)} seconds</p>${orstInterface.url?`<audio controls src="${orstInterface.url}" aria-label="Your reading recording"></audio>`:''}<label>Observed miscues<input name="miscues" type="number" min="0" max="${words}" value="${attempt.miscues??0}" required></label><label>Correct answers<input name="correct" type="number" min="0" max="${groups.length}" value="${attempt.correct??0}" required> / ${groups.length}</label>${attempt.accuracy!==undefined?`<p>Word-reading accuracy: ${attempt.accuracy.toFixed(2)}%<br>Comprehension: ${attempt.comprehension===null?'—':attempt.comprehension.toFixed(2)+'%'}</p>`:''}</form>`;
 }
 panel.innerHTML=picker+`<h2>${h(passage.title)}</h2>`+(message?`<p class="orst-live-status" role="status">${h(message)}</p>`:'')+`<p class="orst-live-status" id="orstReadingTime" aria-live="off">${orstInterface.started!==null?'Reading · '+Math.floor((Date.now()-orstInterface.started+orstInterface.elapsed)/1000)+' seconds':''}</p>`+content;
 if(['read','record'].includes(orstInterface.stage)){
  const title=panel.querySelector?.('h2');
  if(title){
   let size=40;title.style.fontSize=size+'px';
   while(size>22&&title.scrollWidth>title.clientWidth){size--;title.style.fontSize=size+'px'}
   if(title.scrollWidth>title.clientWidth)title.style.whiteSpace='normal';
  }
 }
 app.querySelectorAll('.orst-step-control').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('orst-step-'+orstInterface.stage))));
 const microphone=app.querySelector('.orst-microphone-control');microphone?.setAttribute('aria-pressed',String(orstInterface.started!==null));microphone?.setAttribute('aria-label',orstInterface.started!==null?'Finish reading aloud':'Start reading aloud');
}
async function orstToggleReading(){
 if(orstInterface.busy)return;
 if(orstInterface.started!==null){orstStopAudio();orstInterface.stage='read';if(app.querySelector('.orst-themed-screen'))renderORST();else orstRenderPanel();return}
 orstInterface.busy=true;
 orstInterface.playback?.pause();orstInterface.playback=null;orstInterface.elapsed=0;
 if(orstInterface.url){URL.revokeObjectURL(orstInterface.url);orstInterface.url=null}
 const session=orstInterface.session;
 try{
  let recording=false;
  if(navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined'){
   try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(session!==orstInterface.session||!app.querySelector('.orst-interface-screen')){stream.getTracks().forEach(track=>track.stop());return}
    orstInterface.stream=stream;const recorder=new MediaRecorder(stream),chunks=[];orstInterface.recorder=recorder;
    const key=orstAttemptKey();
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
    recorder.onstop=()=>{
     if(session!==orstInterface.session||key!==orstAttemptKey())return;
     if(orstInterface.url)URL.revokeObjectURL(orstInterface.url);
     orstInterface.url=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));
     if(orstInterface.stage==='results')orstRenderPanel();if(typeof orstPaintAudioMeter==='function')orstPaintAudioMeter();
    };
    recorder.start();recording=true;
   }catch{/* Permission can be declined; the observed reading timer still works. */}
  }
  orstInterface.started=Date.now();if(recording&&typeof orstStartReadingDetection==='function')orstStartReadingDetection();orstInterface.stage='record';if(app.querySelector('.orst-themed-screen'))renderORST();orstRenderPanel(recording?'Reading is being recorded on this device.':'Reading timer started; microphone recording is unavailable.');
  if(typeof orstStartAudioMeter==='function')orstStartAudioMeter(orstInterface.stream);
  orstInterface.timer=setInterval(()=>{
   const paintedClock=document.getElementById('orstPaintedElapsed');if(paintedClock)paintedClock.textContent=typeof orstFormatDuration==='function'?orstFormatDuration(Date.now()-orstInterface.started+orstInterface.elapsed):Math.floor((Date.now()-orstInterface.started+orstInterface.elapsed)/1000)+'s';
   const clock=document.getElementById('orstReadingTime');
   if(!clock){orstStopAudio();return}
   clock.textContent='Reading · '+Math.floor((Date.now()-orstInterface.started+orstInterface.elapsed)/1000)+' seconds';
  },1000);
 }finally{orstInterface.busy=false}
}
function orstSaveAnswer(index,value){const attempt=load(orstAttemptKey(),{});(attempt.answers??={})[index]=value;save(orstAttemptKey(),attempt)}
function orstReturnToGrades(){
 if(navigationBusy||orstInterface.busy)return false;
 orstStopAudio();return transition('orst-grade',renderORSTGradeSelection);
}
function orstComprehensionItem(group){
 const text=group.slice(1).join('\n');
 const options=[...text.matchAll(/(?:^|[\t\n ]+)([a-d])[.)]\s*([\s\S]*?)(?=(?:[\t\n ]+[a-d][.)]\s)|$)/gi)].map(match=>({key:match[1].toLowerCase(),text:match[2].trim()}));
 options.sort((a,b)=>a.key.localeCompare(b.key));
 return {question:group[0],options};
}
function orstFitAssessmentPanel(dialog){
 const miscue=dialog.classList.contains('orst-miscue-page');
 const geometry=miscue?{width:950,height:1656,x:48,y:40,cropWidth:874,cropHeight:1572}:{width:584,height:941,x:30,y:125,cropWidth:532,cropHeight:783};
 let canvas=dialog.querySelector('.orst-panel-canvas');
 if(!canvas){
  canvas=document.createElement('div');canvas.className='orst-panel-canvas';
  while(dialog.firstChild)canvas.append(dialog.firstChild);
  dialog.append(canvas);
 }
 dialog.classList.add('orst-fitted-panel');dialog.dataset.grade=String(selectedGrade);
 const theme=ORST_GRADE_ART[selectedGrade];
 dialog.style.setProperty('--orst-theme',theme.color);dialog.style.setProperty('--orst-glow',theme.glow);
 const fit=()=>{
  const screen=app.querySelector('.orst-interface-screen');if(!screen||!dialog.isConnected)return;
  const bounds=screen.getBoundingClientRect();
  const scale=Math.min(bounds.height*.9/geometry.cropHeight,bounds.width*.86/geometry.cropWidth);
  const width=geometry.cropWidth*scale,height=geometry.cropHeight*scale;
  Object.assign(dialog.style,{width:width+'px',height:height+'px',maxWidth:'none',maxHeight:'none',left:bounds.left+(bounds.width-width)/2+'px',top:bounds.top+(bounds.height-height)/2+'px'});
  const liveCanvas=dialog.querySelector('.orst-panel-canvas');
  Object.assign(liveCanvas.style,{width:geometry.width+'px',height:geometry.height+'px',left:-geometry.x*scale+'px',top:-geometry.y*scale+'px',transform:`scale(${scale})`});
 };
 if(!dialog._orstFit){
  dialog._orstFit=()=>fit();window.addEventListener('resize',dialog._orstFit);
  dialog.addEventListener('close',()=>window.removeEventListener('resize',dialog._orstFit),{once:true});
 }
 fit();
}
function orstOpenComprehension(){
 const groups=orstQuestionGroups(orstCurrentPassage()),dialog=document.createElement('dialog'),opener=document.activeElement;
 dialog.className='orst-assessment-dialog orst-comprehension-page';dialog.setAttribute('aria-label','Comprehension test');
 let sheet=0;const perSheet=2,totalSheets=Math.max(1,Math.ceil(groups.length/perSheet));
 const close=()=>{dialog.close();dialog.remove();opener?.focus()};
 const draw=()=>{
  const attempt=load(orstAttemptKey(),{}),start=sheet*perSheet;
  dialog.innerHTML=`<img class="orst-comprehension-original" src="${orstArtwork('questions')}" alt=""><svg class="orst-comprehension-clean" viewBox="0 0 584 941" aria-hidden="true"><defs><clipPath id="orst-comprehension-footer"><path d="M391 808H481V852H391Z"/></clipPath><clipPath id="orst-comprehension-blank"><path d="M65 228H535V780H65Z M105 808H204V852H105Z M270 808H332V856H270Z"/></clipPath></defs><image href="resources/orst/comprehension-clean.png" width="584" height="941" preserveAspectRatio="none" clip-path="url(#orst-comprehension-blank)"/><image class="orst-colored-patch" href="resources/orst/comprehension-clean.png" width="584" height="941" preserveAspectRatio="none" clip-path="url(#orst-comprehension-footer)"/></svg><button class="orst-overlay-close" type="button" aria-label="Close comprehension test">×</button><p class="orst-comprehension-meta">Grade ${selectedGrade} · ${h(orstCurrentPassage().level.replace(/^Grade/i,'Passage'))}<span>${groups.length} questions</span></p><form class="orst-comprehension-form"><div class="orst-comprehension-items">${groups.slice(start,start+perSheet).map((group,offset)=>{
   const index=start+offset,item=orstComprehensionItem(group),answer=attempt.answers?.[index]||'';
   return `<fieldset><legend>${h(item.question)}</legend>${item.options.length?item.options.map(option=>`<label><input type="radio" name="answer${index}" value="${option.key}" ${answer.toLowerCase()===option.key?'checked':''} onchange="orstSaveAnswer(${index},this.value)"><span>${option.key}. ${h(option.text)}</span></label>`).join(''):`<textarea aria-label="Answer question ${index+1}" onchange="orstSaveAnswer(${index},this.value)">${h(answer)}</textarea>`}</fieldset>`;
  }).join('')}</div><button class="orst-comprehension-previous" type="button" ${sheet===0?'disabled':''}>Previous</button><span class="orst-comprehension-counter">${sheet+1} / ${totalSheets}</span><button class="orst-comprehension-next" type="submit">${sheet===totalSheets-1?'Submit':'Next'}</button></form>`;
  orstFitAssessmentPanel(dialog);
  dialog.querySelector('.orst-overlay-close').onclick=close;
  dialog.querySelector('.orst-comprehension-previous').onclick=()=>{if(sheet>0){sheet--;draw()}};
  dialog.querySelector('form').onsubmit=event=>{event.preventDefault();if(sheet<totalSheets-1){sheet++;draw()}else close()};
 };
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});draw();app.querySelector('.orst-interface-screen').append(dialog);dialog.showModal();orstFitAssessmentPanel(dialog);
}
const ORST_MISCUE_TYPES=[['mispronunciation','Mispronunciation','The word is read incorrectly and does not sound like the word in the text.'],['omission','Omission','A word in the passage is skipped.'],['substitution','Substitution','A different word is read in place of the printed word.'],['insertion','Insertion','An extra word is added while reading.'],['repetition','Repetition','A word or phrase is repeated.'],['transposition','Transposition','Words are read in a different order.'],['reversal','Reversal','Letters or words are read in reverse.']];
function orstMiscueRowY(sourceY){return 235+(sourceY-235)*1005/660}
function orstMiscueArtworkLayout(){
 const art=orstArtwork('results');
 return `<svg class="orst-miscue-original" viewBox="0 0 950 1656" aria-hidden="true"><svg width="950" height="235" viewBox="0 0 950 235" preserveAspectRatio="none"><image href="${art}" width="950" height="1656"/></svg><svg y="235" width="950" height="1005" viewBox="0 235 950 660" preserveAspectRatio="none"><image href="${art}" width="950" height="1656"/></svg>${ORST_MISCUE_TYPES.map((_,i)=>{
 const sourceY=260+i*86,targetY=orstMiscueRowY(sourceY),targetHeight=86*1005/660;
 return `<svg x="128" y="${targetY}" width="534" height="${targetHeight}" viewBox="640 ${sourceY} 17 86" preserveAspectRatio="none"><image href="resources/orst/miscue-clean.png" width="950" height="1656"/></svg><svg x="123" y="${targetY+(targetHeight-99)/2}" width="115" height="99" viewBox="130 ${sourceY} 100 86"><image href="resources/orst/miscue-clean.png" width="950" height="1656"/></svg>`;
 }).join('')}<svg y="1240" width="950" height="416" viewBox="0 895 950 761" preserveAspectRatio="none"><image href="resources/orst/miscue-clean.png" width="950" height="1656"/></svg></svg>`;
}
function orstOpenMiscueAnalysis(){
 const passage=orstCurrentPassage(),attempt=load(orstAttemptKey(),{}),words=orstWordCount(passage),total=orstQuestionGroups(passage).length;
 const dialog=document.createElement('dialog'),opener=document.activeElement;let category=null;
 const notes={...attempt.miscueNotes};
 dialog.className='orst-assessment-dialog orst-miscue-page';dialog.setAttribute('aria-label','Miscue analysis');
 const close=()=>{window.removeEventListener('orst-miscues-updated',refreshDetected);dialog.close();dialog.remove();opener?.focus()};
 dialog.innerHTML=`${orstMiscueArtworkLayout()}<svg class="orst-miscue-clean" viewBox="0 0 950 1656" aria-hidden="true"><defs><clipPath id="orst-miscue-header"><path d="M245 155H760V205H245Z"/></clipPath><clipPath id="orst-miscue-blank"><path d="${ORST_MISCUE_TYPES.map((_,i)=>`M675 ${275+i*86}H792V${329+i*86}H675Z`).join(' ')}"/></clipPath></defs><g transform="translate(0 -122.840909) scale(1 1.52272727)"><image href="resources/orst/miscue-clean.png" width="950" height="1656" preserveAspectRatio="none" clip-path="url(#orst-miscue-blank)"/></g><svg x="245" y="155" width="515" height="50" viewBox="180 155 60 50" preserveAspectRatio="none"><image href="${orstArtwork('results')}" width="950" height="1656"/></svg></svg><button class="orst-miscue-close" type="button" aria-label="Close miscue analysis"></button><p class="orst-miscue-passage">${h(passage.title)}</p><form class="orst-miscue-form">${ORST_MISCUE_TYPES.map(([key,label],i)=>`<button class="orst-miscue-category" type="button" style="top:${orstMiscueRowY(263+i*86)/1656*100}%" data-category="${i}" aria-label="View ${label} analysis">${label}</button><input class="orst-miscue-count" style="top:${orstMiscueRowY(275+i*86)/1656*100}%" type="number" name="${key}" aria-label="${label} count" min="0" max="${words}" value="${attempt.miscueCounts?.[key]??(i===0?attempt.miscues??0:0)}" required>`).join('')}<section class="orst-miscue-details"><div class="orst-miscue-view"><div class="orst-miscue-summary-view"><p class="orst-miscue-summary" aria-live="polite"></p></div><div class="orst-miscue-detail-view" hidden><button class="orst-miscue-collapse" type="button" aria-label="Return to miscue summary">−</button><h3 class="orst-miscue-detail-title"></h3><p class="orst-miscue-definition"></p><div class="orst-miscue-evidence"></div><label>Reading observations<textarea class="orst-miscue-notes" rows="2" placeholder="Word in passage, student reading, time, or context"></textarea></label></div></div><input name="correct" type="hidden" value="${attempt.correct??0}"><input name="miscues" type="hidden"><p class="orst-miscue-error" role="status"></p><button class="orst-overlay-submit" type="submit">Save analysis</button></section></form>`;
 orstFitAssessmentPanel(dialog);
 const form=dialog.querySelector('form'),notesField=dialog.querySelector('textarea');
 let countsEdited=false;
 const animateView=()=>{const view=dialog.querySelector('.orst-miscue-view');if(!orstReducedMotion())view.animate?.([{opacity:.2,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'})};
 const showEvidence=key=>{
  const evidence=load(orstAttemptKey(),{}).miscueEvidence?.filter(item=>item.type===key)||[];
  dialog.querySelector('.orst-miscue-evidence').innerHTML=evidence.length?`<table><thead><tr><th>In passage</th><th>Recognized reading</th></tr></thead><tbody>${evidence.map(item=>`<tr><td>${h(item.expected||'—')}</td><td>${h(item.spoken||'—')}</td></tr>`).join('')}</tbody></table>`:'<p>No word-level evidence is available for this category. Review the recording and add observations.</p>';
 };
 const choose=index=>{
  category=index;const [key,label,definition]=ORST_MISCUE_TYPES[index];
  dialog.querySelector('.orst-miscue-summary-view').hidden=true;dialog.querySelector('.orst-miscue-detail-view').hidden=false;
  dialog.querySelector('.orst-miscue-detail-title').textContent=label+' ('+form.elements[key].value+')';dialog.querySelector('.orst-miscue-definition').textContent=definition;notesField.value=notes[key]||'';showEvidence(key);
  dialog.querySelectorAll('.orst-miscue-category').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));animateView();
 };
 notesField.oninput=()=>{if(category!==null)notes[ORST_MISCUE_TYPES[category][0]]=notesField.value};
 const update=()=>{
  const sum=ORST_MISCUE_TYPES.reduce((n,[key])=>n+Number(form.elements[key].value||0),0);form.elements.miscues.value=sum;
  dialog.querySelector('.orst-miscue-summary').textContent=`Total miscues: ${sum}`;

  if(category!==null){const [key,label]=ORST_MISCUE_TYPES[category];dialog.querySelector('.orst-miscue-detail-title').textContent=label+' ('+form.elements[key].value+')'}return sum;
 };
 const refreshDetected=()=>{
  if(countsEdited)return;const latest=load(orstAttemptKey(),{});
  ORST_MISCUE_TYPES.forEach(([key])=>form.elements[key].value=latest.miscueCounts?.[key]||0);
  update();if(category!==null)showEvidence(ORST_MISCUE_TYPES[category][0]);
 };
 window.addEventListener('orst-miscues-updated',refreshDetected);
 dialog.querySelector('.orst-miscue-collapse').onclick=()=>{
  category=null;dialog.querySelector('.orst-miscue-summary-view').hidden=false;dialog.querySelector('.orst-miscue-detail-view').hidden=true;
  dialog.querySelectorAll('.orst-miscue-category').forEach(button=>button.setAttribute('aria-pressed','false'));animateView();
 };
 dialog.querySelectorAll('.orst-miscue-category').forEach(button=>button.onclick=()=>choose(Number(button.dataset.category)));
 dialog.querySelectorAll('.orst-miscue-count').forEach(input=>input.oninput=()=>{countsEdited=true;update()});
 dialog.querySelector('.orst-miscue-close').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
 form.onsubmit=event=>{
  event.preventDefault();if(!form.reportValidity())return;
  if(update()>words){dialog.querySelector('.orst-miscue-error').textContent='Total miscues cannot exceed the passage word count.';return}
  const miscueCounts=Object.fromEntries(ORST_MISCUE_TYPES.map(([key])=>[key,Number(form.elements[key].value)]));
  orstInterface.detectionReviewed=true;
  save(orstAttemptKey(),{...load(orstAttemptKey(),{}),miscueCounts,miscueNotes:notes});
  if(orstSaveProfile(event))close();
 };
 update();app.querySelector('.orst-interface-screen').append(dialog);dialog.showModal();orstFitAssessmentPanel(dialog);
}
function orstOpenAssessmentOverlay(kind){
 if(orstInterface.busy||app.querySelector('.orst-assessment-dialog'))return;
 orstStopAudio();orstInterface.playback?.pause();window.speechSynthesis?.cancel();
 if(kind==='questions')return orstOpenComprehension();
 return orstOpenMiscueAnalysis();
}
function orstSelectStage(stage){
 if(orstInterface.busy||(typeof navigationBusy!=='undefined'&&navigationBusy))return;
 if(stage==='record')return orstToggleReading();
 if(stage==='choose'){orstInterface.playback?.pause();window.speechSynthesis?.cancel()}
 if(!['choose','read','questions','results'].includes(stage))return;
 if(['questions','results'].includes(stage)&&app.querySelector('.orst-themed-screen')&&typeof document.createElement==='function')return orstOpenAssessmentOverlay(stage);
 orstStopAudio();
 if(app.querySelector('.orst-themed-screen')&&typeof transition==='function'){
  if(stage===orstInterface.stage)return;
  return transition('work',()=>{orstInterface.stage=stage;renderORST()});
 }
 orstInterface.stage=stage;orstRenderPanel();
}
function orstSaveProfile(event){
 event?.preventDefault();const form=app.querySelector('.orst-assessment-dialog form')||app.querySelector('.orst-passage-copy form');if(!form||!form.reportValidity())return;
 const passage=orstCurrentPassage(),words=orstWordCount(passage),total=orstQuestionGroups(passage).length;
 const miscues=Number(form.elements.miscues.value),correct=Number(form.elements.correct.value);
 if(!Number.isInteger(miscues)||!Number.isInteger(correct)||miscues<0||miscues>words||correct<0||correct>total)return;
 const result={...load(orstAttemptKey(),{}),title:passage.title,words,miscues,correct,total,accuracy:100*(words-miscues)/words,comprehension:total?100*correct/total:null,seconds:orstInterface.elapsed/1000,date:new Date().toISOString()};
 save(orstAttemptKey(),result);save('oral_'+selectedGrade,result);if(!app.querySelector('.orst-assessment-dialog'))orstRenderPanel('Reading profile saved.');return true;
}
new MutationObserver(()=>{if(!app.querySelector('.orst-interface-screen'))orstStopAudio()}).observe(app,{childList:true});
window.addEventListener('resize',positionORSTInterface,{passive:true});

function orstOpenWST(){
 if(navigationBusy||orstInterface.busy)return false;
 return openWST();
}
