/* Recording and playback meter share the artwork's audio strip. */
function orstFormatDuration(milliseconds){
 const seconds=Math.max(0,Math.floor((Number.isFinite(milliseconds)?milliseconds:0)/1000));
 return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
function orstElapsedMilliseconds(){return orstInterface.elapsed+(orstInterface.started===null?0:Math.max(0,Date.now()-orstInterface.started))}
function orstAudioMeterState(){return orstInterface.audioMeter??={context:null,analyser:null,source:null,samples:null,peaks:[],lastPeak:0,frame:null,lastFrame:0}}
function orstStopAudioMeter(){
 const meter=orstAudioMeterState();if(meter.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(meter.frame);meter.frame=null;
 try{meter.source?.disconnect()}catch{}
 if(meter.context){try{meter.context.close()?.catch(()=>{})}catch{}}
 meter.context=null;meter.analyser=null;meter.source=null;meter.samples=null;
}
function orstStartAudioMeter(stream){
 orstStopAudioMeter();const meter=orstAudioMeterState();meter.peaks=[];meter.lastPeak=0;meter.lastFrame=0;meter.lastFrame=0;
 const AudioContext=window.AudioContext||window.webkitAudioContext;
 if(stream&&AudioContext){
  try{
   meter.context=new AudioContext();meter.analyser=meter.context.createAnalyser();meter.analyser.fftSize=1024;
   meter.samples=new Uint8Array(meter.analyser.fftSize);meter.source=meter.context.createMediaStreamSource(stream);meter.source.connect(meter.analyser);
   if(meter.context.state==='suspended')meter.context.resume().catch(()=>{});
  }catch{orstStopAudioMeter()}
 }
 orstRunAudioMeter();
}
function orstPaintAudioMeter(){
 const meter=orstAudioMeterState(),audio=orstInterface.playback,recording=orstInterface.started!==null;
 const elapsed=orstElapsedMilliseconds(),duration=audio&&Number.isFinite(audio.duration)&&audio.duration>0?audio.duration*1000:orstInterface.elapsed;
 const current=audio?Math.min((audio.currentTime||0)*1000,duration):elapsed;
 const timer=document.getElementById('orstAudioMeterTime');
 if(timer){
  const text=recording?orstFormatDuration(elapsed):audio?orstFormatDuration(current)+' / '+orstFormatDuration(duration):orstFormatDuration(elapsed);
  if(timer.textContent!==text)timer.textContent=text;
  timer.title=recording?(orstInterface.stream?'Recording time':'Reading timer only; microphone recording is unavailable'):audio?'Playback time / recording duration':'Recording duration';
 }
 const readingTime=document.getElementById('orstPaintedElapsed');if(readingTime)readingTime.textContent=orstFormatDuration(elapsed);
 const board=app.querySelector('.orst-interface-board');board?.classList?.toggle('orst-recording-active',recording);board?.classList?.toggle('orst-playback-active',!!audio&&!audio.paused&&!audio.ended);
 const record=app.querySelector('.orst-record-area');record?.setAttribute('aria-pressed',String(recording));
 const play=app.querySelector('.orst-play-area');play?.setAttribute('aria-pressed',String(!!audio&&!audio.paused&&!audio.ended));play?.setAttribute('aria-label',audio&&!audio.paused?'Pause reading recording':'Play reading recording');
 const canvas=document.getElementById('orstAudioWaveform'),context=canvas?.getContext('2d');if(!context)return;
 const count=68,values=[];
 if(recording&&meter.analyser&&meter.samples){
  meter.analyser.getByteTimeDomainData(meter.samples);
  let energy=0;
  for(let i=0;i<count;i++){
   let local=0;const start=Math.floor(i*meter.samples.length/count),end=Math.floor((i+1)*meter.samples.length/count);
   for(let j=start;j<end;j++){const value=(meter.samples[j]-128)/128;local+=value*value}
   const amplitude=Math.sqrt(local/Math.max(1,end-start));values.push(amplitude);energy+=amplitude;
  }
  if(Date.now()-meter.lastPeak>=100){meter.peaks.push(energy/count);meter.lastPeak=Date.now()}
 }else for(let i=0;i<count;i++)values.push(meter.peaks.length?meter.peaks[Math.min(meter.peaks.length-1,Math.floor(i*meter.peaks.length/count))]:0);
 context.clearRect(0,0,canvas.width,canvas.height);
 const fraction=duration>0?current/duration:0;
 for(let i=0;i<count;i++){
  const height=Math.max(2,Math.min(canvas.height-4,values[i]*canvas.height*3));
  context.fillStyle=recording||!audio||i/count<=fraction?'#e9cc8a':'#756340';
  context.fillRect(i*canvas.width/count,(canvas.height-height)/2,2.5,height);
 }
}
function orstRunAudioMeter(){
 const meter=orstAudioMeterState();if(meter.frame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(meter.frame);
 const frame=()=>{
  meter.frame=null;if(!app.querySelector('.orst-reading-meter'))return;
   const now=performance.now();
   if(document.hidden||now-meter.lastFrame<66){meter.frame=requestAnimationFrame(frame);return}
   meter.lastFrame=now;orstPaintAudioMeter();
  const audio=orstInterface.playback;
  if((orstInterface.started!==null||(audio&&!audio.paused&&!audio.ended))&&typeof requestAnimationFrame==='function')meter.frame=requestAnimationFrame(frame);
 };
 frame();
}
function orstSeekRecording(event){
 const audio=orstInterface.playback;if(!audio||orstInterface.started!==null)return;
 const image=app.querySelector('.orst-interface-backdrop'),bounds=image?.getBoundingClientRect();if(!bounds)return;
 const x=readwyCanvasPoint(event,image).x*1672,fraction=Math.max(0,Math.min(1,(x-1120)/308));
 const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:orstInterface.elapsed/1000;
 if(duration>0){try{audio.currentTime=fraction*duration}catch{}}orstPaintAudioMeter();
}
