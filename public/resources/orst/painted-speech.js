/* Speech recognition provides reviewable word comparisons, not pronunciation scores. */
function orstSpeechTokens(text){return (text.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z0-9]+(?:'[a-z0-9]+)*/g)||[])}
function orstAlignSpokenReading(expectedText,spokenText){
 const expected=orstSpeechTokens(expectedText),rawSpoken=orstSpeechTokens(spokenText),spoken=[],repeated=[];
 const allowed=new Map();let last='',run=0;
 for(const word of expected){run=word===last?run+1:1;allowed.set(word,Math.max(allowed.get(word)||1,run));last=word}
 last='';run=0;
 for(const word of rawSpoken){run=word===last?run+1:1;if(run>(allowed.get(word)||1))repeated.push({type:'repetition',expected:'',spoken:word});else spoken.push(word);last=word}
 const n=expected.length,m=spoken.length;
 const counts={mispronunciation:0,omission:0,substitution:0,insertion:0,repetition:0,transposition:0,reversal:0},evidence=[];
 if(!m)return {counts,evidence,wordsCompared:0};
 const cost=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=0;i<=n;i++)cost[i][0]=i;
 for(let j=0;j<=m;j++)cost[0][j]=j;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){
  cost[i][j]=Math.min(cost[i-1][j]+1,cost[i][j-1]+1,cost[i-1][j-1]+(expected[i-1]===spoken[j-1]?0:1));
  if(i>1&&j>1&&expected[i-1]===spoken[j-2]&&expected[i-2]===spoken[j-1])cost[i][j]=Math.min(cost[i][j],cost[i-2][j-2]+1);
 }
 // Do not mark the unread remainder as omissions when a learner pauses early.
 let end=0;
 for(let i=1;i<=n;i++)if(cost[i][m]<cost[end][m]||(cost[i][m]===cost[end][m]&&Math.abs(i-m)<Math.abs(end-m)))end=i;
 let i=end,j=m;
 const add=(type,original,heard)=>{counts[type]++;evidence.push({type,expected:original,spoken:heard})};
 while(i||j){
  if(i&&j&&expected[i-1]===spoken[j-1]&&cost[i][j]===cost[i-1][j-1]){i--;j--;continue}
  if(i>1&&j>1&&expected[i-1]===spoken[j-2]&&expected[i-2]===spoken[j-1]&&cost[i][j]===cost[i-2][j-2]+1){add('transposition',expected.slice(i-2,i).join(' '),spoken.slice(j-2,j).join(' '));i-=2;j-=2;continue}
  if(i&&j&&cost[i][j]===cost[i-1][j-1]+1){const original=expected[i-1],heard=spoken[j-1];add(original.length>1&&original.split('').reverse().join('')===heard?'reversal':'substitution',original,heard);i--;j--;continue}
  if(i&&cost[i][j]===cost[i-1][j]+1){add('omission',expected[i-1],'');i--;continue}
  const heard=spoken[j-1],repeat=(j>1&&heard===spoken[j-2])||(j<m&&heard===spoken[j])||(i>0&&heard===expected[i-1]);add(repeat?'repetition':'insertion','',heard);j--;
 }
 counts.repetition+=repeated.length;return {counts,evidence:[...evidence.reverse(),...repeated],wordsCompared:end};
}
const orstSpeech={recognition:null,session:0,segments:new Map(),interim:new Map(),run:0,pending:null,finish:null,retry:null,error:null};
function orstUpdateSpeechAnalysis(){
 const draft=orstPaint.draft;if(!draft)return;
 const transcript=[...orstSpeech.segments.values()].join(' ').trim();if(!transcript)return;
 const comparison=orstAlignSpokenReading(orstPassages()[orstPaint.passage].body.join(' '),transcript);
 draft.readingCoverageComplete=comparison.wordsCompared===orstSpeechTokens(orstPassages()[orstPaint.passage].body.join(' ')).length;
 draft.transcript=transcript;draft.wordsCompared=comparison.wordsCompared;draft.miscueEvidence=comparison.evidence;
 draft.miscues=[0,comparison.counts.omission,comparison.counts.substitution,comparison.counts.insertion,comparison.counts.repetition,comparison.counts.transposition,comparison.counts.reversal];
 draft.analysisStatus=orstSpeech.error?'partial':'estimated';draft.pronunciationReviewed=false;draft.reviewed=false;
 orstSaveDraft();orstPaintCanvas();
}
function orstStartPaintedSpeech(){
 orstAbortPaintedSpeech();const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){orstPaint.draft.analysisStatus='unsupported';return}
 const session=++orstSpeech.session,key=orstDraftKey();orstSpeech.segments=new Map();orstSpeech.interim=new Map();orstSpeech.run=0;orstSpeech.error=null;
 let recognition;try{recognition=new Recognition()}catch{orstPaint.draft.analysisStatus='unsupported';return}
 orstSpeech.recognition=recognition;recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
 orstPaint.draft.analysisStatus='listening';
 const valid=()=>orstSpeech.session===session&&orstDraftKey()===key;
 recognition.onresult=event=>{if(!valid())return;for(let i=event.resultIndex;i<event.results.length;i++){const result=event.results[i];const key=orstSpeech.run+':'+i;if(result.isFinal){orstSpeech.segments.set(key,result[0].transcript);orstSpeech.interim.delete(key)}else orstSpeech.interim.set(key,result[0].transcript)}orstUpdateSpeechAnalysis();orstPaintCanvas()};
 recognition.onerror=event=>{
  if(!valid())return;orstSpeech.error=event.error||'unavailable';
  if(!orstPaint.draft.transcript)orstPaint.draft.analysisStatus='unavailable';else orstPaint.draft.analysisStatus='partial';
  if(['not-allowed','service-not-allowed','network','audio-capture'].includes(event.error))orstSpeech.recognition=null;
  orstSaveDraft();orstPaintCanvas();
 };
 recognition.onend=()=>{
  if(!valid())return;
  if(orstSpeech.finish){const finish=orstSpeech.finish;orstSpeech.finish=null;finish();return}
  if(orstPaint.recording&&orstSpeech.recognition===recognition&&!orstSpeech.error){orstSpeech.run++;orstSpeech.retry=setTimeout(()=>{if(valid()&&orstPaint.recording)try{recognition.start()}catch{}},250)}
 };
 try{recognition.start()}catch{orstPaint.draft.analysisStatus='unavailable';orstSpeech.recognition=null}
}
function orstFinishPaintedSpeech(){
 clearTimeout(orstSpeech.retry);
 return new Promise(resolve=>{
  const recognition=orstSpeech.recognition;
  const finish=()=>{orstSpeech.recognition=null;orstUpdateSpeechAnalysis();if(!orstPaint.draft.transcript)orstPaint.draft.analysisStatus=orstPaint.draft.analysisStatus==='unsupported'?'unsupported':'no-speech';resolve()};
  if(!recognition){finish();return}
  let done=false;const once=()=>{if(done)return;done=true;orstSpeech.finish=null;finish()};orstSpeech.finish=once;
  try{recognition.stop()}catch{once()}
  setTimeout(once,1200);
 });
}
function orstAbortPaintedSpeech(){
 clearTimeout(orstSpeech.retry);orstSpeech.session++;orstSpeech.finish=null;const recognition=orstSpeech.recognition;orstSpeech.recognition=null;try{recognition?.abort()}catch{}
}
