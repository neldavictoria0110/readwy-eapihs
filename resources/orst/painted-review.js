/* The passage is revealed only during capture; after submission its panel becomes evidence. */
function orstReadingSubmitted(){return !!orstPaint.draft?.recorded&&!orstPaint.recording&&!orstPaint.requesting&&!(typeof orstCapture!=='undefined'&&orstCapture.finalizing)}
function orstMiscueItems(index){
 if(!orstReadingSubmitted())return [];
 const types=['mispronunciation','omission','substitution','insertion','repetition','transposition','reversal'];
 return (orstPaint.draft.miscueEvidence||[]).filter(item=>index<0||item.type===types[index]);
}
function orstCanViewMiscue(index){return orstReadingSubmitted()&&(orstPaint.draft.miscues[index]||0)>0&&orstMiscueItems(index).length>0}
function orstShowMiscue(index){
 if(index>=0&&!orstCanViewMiscue(index)||index<0&&!orstMiscueItems(-1).length)return false;
 orstPaint.panelMode='details';orstPaint.miscueIndex=index;orstPaint.evidencePage=0;orstGoStage(5);return true;
}
function orstEvidencePair(item){
 if(item.type==='repetition')return {spoken:[item.spoken,item.spoken].join(' '),expected:item.spoken||item.expected||'—'};
 return {spoken:item.spoken||'—',expected:item.expected||'—'};
}
function orstPaintPassagePanel(ctx,text,passage){
 if(orstPaint.recording){
  text(passage.title,686,279,685,50,700);
  const pages=orstReadingPages(passage);pages[Math.min(orstPaint.readingPage,pages.length-1)].forEach((line,i)=>text(line,686,350+i*43,705,31));
  text('Live Recognized Words',686,635,705,21,700);
  const live=typeof orstSpeech==='undefined'?'':([...orstSpeech.segments.values(),...orstSpeech.interim.values()].join(' ').trim());
  const fallback=orstPaint.draft.analysisStatus==='unsupported'?'Live recognition is unsupported in this browser.':'Listening…';
  orstWrap(ctx,live.slice(-160)||fallback,705,22).slice(0,2).forEach((line,i)=>text(line,686,665+i*26,705,22));
  return;
 }
 if(orstPaint.panelMode!=='details'){
  text(passage.title,686,279,685,50,700);
  return;
 }
 const selected=orstPaint.miscueIndex??-1,items=orstMiscueItems(selected),perPage=3,page=orstPaint.evidencePage||0;
 text(selected>=0?ORST_MISCUES[selected]:'Reading details',686,279,685,42,700);
 const translations=['Maling Bigkas','Pagkakaltas','Pagpapalit','Pagsisingit','Pag-uulit','Pagpapalit ng lugar','Paglilipat'];if(selected>=0)text(translations[selected],686,313,685,21,500);
 if(!items.length){text('Select a miscue to view details.',1040,450,680,28,500,'center');return}
 text('You read',710,344,305,24,700);text('Expected',1080,344,305,24,700);
 items.slice(page*perPage,(page+1)*perPage).forEach((item,i)=>{
  const pair=orstEvidencePair(item),y=409+i*95;
  ctx.fillStyle='#f1f6fc';ctx.beginPath();ctx.roundRect(684,y-27,714,77,14);ctx.fill();
  [pair.spoken,pair.expected].forEach((content,col)=>{let size=29;while(orstWrap(ctx,content,303,size).length>2&&size>18)size--;orstWrap(ctx,content,303,size).slice(0,2).forEach((line,j)=>text(line,710+col*370,y+j*29,303,size,500))});
 });
 if(items.length>perPage)text((page+1)+' / '+Math.ceil(items.length/perPage),1040,687,200,19,500,'center');
}
function orstAttemptCount(){const stored=load(orstDraftKey()+'_recording_count',null),value=stored&&typeof stored==='object'?stored.count:stored;if(Number.isInteger(value)&&value>=0)return value;return orstPaint.draft?.recorded?Math.max(1,orstPaint.draft.readingAttempts||0):0}
function orstCountSuccessfulReading(){const count=Math.min(2,orstAttemptCount()+1);save(orstDraftKey()+'_recording_count',{count});orstPaint.draft.readingAttempts=count;return count}
function orstPaintAnalysisRows(ctx,text,passage,draft){
 const measure=orstReadingMeasure(draft,passage),words=draft.recorded&&draft.transcript?(typeof orstSpeechTokens==='function'?orstSpeechTokens(draft.transcript).length:draft.transcript.trim().split(/\s+/).length):0;
 const rows=[['Recognized / Passage',words+' / '+passage.words],['Total Miscues',draft.recorded?measure.miscues:0],['Oral Reading Score (WRS)',draft.recorded?orstScorePercent(measure.accuracy):'No result yet'],['Time',orstDuration(draft.seconds)],['WPM (recognized)',words&&draft.seconds?Math.round(words*60/draft.seconds):0],['Reading Attempts',orstAttemptCount()+' / 2']];
 rows.forEach(([label,value],i)=>{const y=580+i*34;ctx.fillStyle='#fbfdff';ctx.beginPath();ctx.roundRect(390,y,560,30,8);ctx.fill();text(label,407,y+15,370,22,500);text(value,933,y+15,190,23,700,'right')});
}
function orstReviewControls(){
 const map=document.querySelector('.orst-painted-board map');if(!map)return;
 map.innerHTML=orstStageRegions();positionORSTPainted();
}
