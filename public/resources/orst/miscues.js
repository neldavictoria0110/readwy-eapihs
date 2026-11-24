/* Speech recognition provides reviewable word comparisons, not pronunciation scores. */
function orstReadingTokens(text){return (text.toLowerCase().replace(/[’‘]/g,"'").match(/[a-z0-9]+(?:'[a-z0-9]+)*/g)||[])}
function orstCompareReading(expectedText,spokenText){
 const expected=orstReadingTokens(expectedText),spoken=orstReadingTokens(spokenText),n=expected.length,m=spoken.length;
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
 return {counts,evidence:evidence.reverse(),wordsCompared:end};
}
function orstStartReadingDetection(){
 orstInterface.detectionReviewed=false;
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const key=orstAttemptKey(),session=orstInterface.session;
 const status=message=>save(key,{...load(key,{}),detectionStatus:message});
 if(!Recognition){status('Automatic word comparison is unavailable in this browser. Review the recording and enter observed counts.');return}
 let recognition;
 try{recognition=new Recognition()}catch{status('Speech recognition is unavailable. Review the recording and enter observed counts.');return}
 recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=false;
 orstInterface.recognition=recognition;orstInterface.recognizedText='';
 status('Listening for recognized words. Counts are provisional and require review.');
 recognition.onresult=event=>{
  if(session!==orstInterface.session||key!==orstAttemptKey()||orstInterface.detectionReviewed)return;
  for(let index=event.resultIndex;index<event.results.length;index++)if(event.results[index].isFinal)orstInterface.recognizedText+=' '+event.results[index][0].transcript;
  if(!orstInterface.recognizedText.trim())return;
  const comparison=orstCompareReading(orstCurrentPassage().body.join(' '),orstInterface.recognizedText);
  save(key,{...load(key,{}),miscueCounts:comparison.counts,miscueEvidence:comparison.evidence,recognizedText:orstInterface.recognizedText.trim(),wordsCompared:comparison.wordsCompared,miscues:Object.values(comparison.counts).reduce((sum,count)=>sum+count,0),detectionSource:'speech',detectionStatus:'Suggested word differences from speech recognition. Review with the recording; mispronunciation requires teacher observation. Unread trailing words are not counted.'});
  if(typeof Event==='function')window.dispatchEvent(new Event('orst-miscues-updated'));
 };
 recognition.onerror=event=>{
  if(session!==orstInterface.session||key!==orstAttemptKey()||orstInterface.detectionReviewed)return;
  status('Speech recognition '+(event.error||'is unavailable')+'. Counts may be incomplete; review the recording and enter observed miscues.');
  if(typeof Event==='function')window.dispatchEvent(new Event('orst-miscues-updated'));
  orstInterface.recognition=null;
 };
 recognition.onend=()=>{
  if(orstInterface.recognition!==recognition||orstInterface.started===null||session!==orstInterface.session)return;
  try{recognition.start()}catch{orstInterface.recognition=null}
 };
 try{recognition.start()}catch{orstInterface.recognition=null;status('Speech recognition could not start. Review the recording and enter observed miscues.')}
}
function orstStopReadingDetection(){const recognition=orstInterface.recognition;orstInterface.recognition=null;try{recognition?.stop()}catch{}}
