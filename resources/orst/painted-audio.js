/* Actual microphone capture owns the timer and has priority over recognition. */
const orstCapture={session:0,restore:0,finalizing:false,starting:false,status:'Idle',blob:null,elapsedMs:0,activeStarted:null,meter:null,peak:0,samples:0,interrupted:false};
function orstRecorderOptions(){const types=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'],probe=document.createElement('audio'),mimeType=types.find(type=>MediaRecorder.isTypeSupported?.(type)&&probe.canPlayType(type));return mimeType?{mimeType}:undefined}
function orstMicError(error){return {NotAllowedError:'Microphone denied. Allow it in browser settings.',SecurityError:'Use HTTPS or localhost for microphone access.',NotFoundError:'No microphone found. Connect or select a microphone.',NotReadableError:'Microphone unavailable. Close other audio apps.',AbortError:'Recording interrupted. Try again.',NotSupportedError:'This browser cannot record the selected audio format.'}[error?.name]||'Recording failed. Check your microphone and try again.'}
function orstAudioStatus(status,message){orstCapture.status=status;if(message!==undefined)orstPaint.message=message;orstPaintCanvas()}
function orstCaptureElapsed(){return orstCapture.elapsedMs+(orstCapture.activeStarted===null?0:Math.max(0,Date.now()-orstCapture.activeStarted))}
function orstReleasePlayer(){const audio=orstPaint.audio;if(audio){audio.pause();audio.removeAttribute('src');audio.load()}orstPaint.audio=null;if(orstPaint.url)URL.revokeObjectURL(orstPaint.url);orstPaint.url=null;orstPaint.audioReady=false}
function orstSetPlayback(blob){
 orstReleasePlayer();orstCapture.blob=blob;orstPaint.url=URL.createObjectURL(blob);
 const audio=new Audio();audio.controls=true;audio.preload='auto';audio.setAttribute('aria-label','Your recorded reading: play, pause, seek and volume');audio.className='orst-native-audio';audio.src=orstPaint.url;orstPaint.audio=audio;
 const valid=()=>orstPaint.audio===audio;
 audio.addEventListener('canplay',()=>{if(!valid())return;orstPaint.audioReady=true;if(!orstCapture.finalizing&&!orstPaint.recording)orstAudioStatus('Ready to Play',orstPaint.draft?.audioSilent?'Ready to Play. No microphone sound detected.':'Ready to Play')});
 audio.addEventListener('loadedmetadata',()=>{if(valid()){if(audio.readyState>=2)orstPaint.audioReady=true;orstPaintCanvas()}});
 for(const event of ['play','pause','ended','timeupdate','volumechange'])audio.addEventListener(event,()=>{if(!valid())return;if(event==='play')orstPaint.message='Playing';if(event==='pause')orstPaint.message='Paused';if(event==='ended')orstPaint.message='Playback finished';orstPaintCanvas()});
 audio.addEventListener('error',()=>{if(valid()){orstPaint.audioReady=false;orstAudioStatus('Error','Playback format unavailable. Download the audio or record again.')}});
 audio.load();orstSyncAudioHUD?.();
}
async function orstRestoreAudio(){
 const key=orstDraftKey();if(orstCapture.restorePending&&orstCapture.restoreKey===key)return orstCapture.restorePending;
 orstCapture.restoreKey=key;const generation=++orstCapture.restore;orstReleasePlayer();orstCapture.blob=null;
 const pending=(async()=>{try{
  const stored=await orstAudioRead(key);if(generation!==orstCapture.restore||key!==orstDraftKey())return;
  if(!stored.blob?.size){if(orstPaint.draft?.recorded)orstAudioStatus('Error','The saved result has no audio file. Please record again.');return}
  const blob=await orstCompatibleAudio(stored.blob);if(generation!==orstCapture.restore||key!==orstDraftKey())return;
  if(stored.meta?.recordingId&&orstPaint.draft?.recordingId!==stored.meta.recordingId)orstPaint.draft=orstNormalizeDraft({...orstNewDraft(),...stored.meta});
  orstPaint.draft.audioMime=blob.type;orstPaint.draft.audioBytes=blob.size;orstSaveDraft();orstSetPlayback(blob);orstAudioStatus('Processing','Loading your saved recording…');
 }catch{orstAudioStatus('Error','Saved audio could not be loaded. Please record again.')}finally{if(orstCapture.restorePending===pending)orstCapture.restorePending=null}})();
 orstCapture.restorePending=pending;return pending;
}
function orstStartCaptureMeter(stream){orstStartPCM(stream).catch(()=>{})}
function orstSampleCaptureMeter(){const meter=orstCapture.meter;if(!meter)return;meter.analyser.getByteTimeDomainData(meter.data);let sum=0;for(const n of meter.data)sum+=((n-128)/128)**2;orstCapture.peak=Math.max(orstCapture.peak,Math.sqrt(sum/meter.data.length));orstCapture.samples++}
function orstStopCaptureMeter(){const meter=orstCapture.meter;orstCapture.meter=null;if(meter){try{meter.source.disconnect();meter.context.close().catch(()=>{})}catch{}}}
function orstRequestStop(){
 const recorder=orstPaint.recorder;if(!recorder||orstCapture.finalizing)return;
 if(recorder.state==='recording'||recorder.state==='paused'){orstCapture.finalizing=true;orstAudioStatus('Processing','Processing your recorded voice…');try{recorder.requestData()}catch{}try{recorder.stop()}catch(error){orstAudioStatus('Error',orstMicError(error))}}
}
async function orstTogglePaintedRecording(){
 if(orstPaint.requesting||orstCapture.starting||orstCapture.finalizing)return;
 if(orstPaint.recording)return orstRequestStop();
 if(typeof orstDataReset!=='undefined'&&orstDataReset.pending){orstAudioStatus('Idle','Preparing your cleared assessment. Please wait.');return}
 if(orstAttemptCount()>=2){orstAudioStatus('Ready to Play','You have used both reading attempts. Choose Read with Teacher.');return}
 if(!window.isSecureContext){orstAudioStatus('Error','Microphone access requires HTTPS or localhost.');return}
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){orstAudioStatus('Error','Microphone recording is unsupported in this browser.');return}
 if((orstPaint.draft?.recorded||orstCapture.blob)&&!window.confirm('Start a new reading attempt? Your previous saved recording will be kept.'))return;
 const session=++orstCapture.session,key=orstDraftKey(),previousDraft=structuredClone(orstPaint.draft||orstNewDraft());orstCapture.restore++;orstPaint.requesting=true;orstCapture.interrupted=false;
 orstPreparePCM();orstAudioStatus('Requesting Microphone','Requesting Microphone — please choose Allow.');
 // This permission request happens synchronously in the trusted Record click.
 let permission;try{permission=navigator.mediaDevices.getUserMedia({audio:true})}catch(error){orstPaint.requesting=false;orstCancelPCM();orstAudioStatus('Error',orstMicError(error));return}
 let stream;
 try{
  stream=await permission;
  if(session!==orstCapture.session||key!==orstDraftKey()||!document.querySelector('.orst-painted-screen')){stream.getTracks().forEach(track=>track.stop());orstCancelPCM();return}
  orstPaint.audio?.pause();orstPaint.stream=stream;
  const recorder=new MediaRecorder(stream,orstRecorderOptions()),chunks=[];let captureError=null,began=false;
  orstPaint.recorder=recorder;orstCapture.starting=true;orstCapture.elapsedMs=0;orstCapture.activeStarted=null;
  if(load(key+'_recording_count',null)===null)save(key+'_recording_count',{count:orstAttemptCount()});
  recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data)};
  recorder.onstart=()=>{
   if(session!==orstCapture.session){recorder.stop();return}
   began=true;orstCapture.starting=false;orstCapture.activeStarted=Date.now();orstPaint.started=Date.now();orstPaint.recording=true;orstPaint.draft=orstNewDraft();orstPaint.panelMode='reading';orstPaint.miscueIndex=-1;orstPaint.readingPage=0;
   orstStartCaptureMeter(stream);orstAudioStatus('Recording','Recording — click Stop when finished.');orstReviewControls();
   // Recognition is optional; a failure must never stop or replace the captured voice.
   try{orstStartPaintedSpeech()}catch{orstPaint.draft.analysisStatus='unavailable'}
   orstPaint.timer=setInterval(()=>{orstSampleCaptureMeter();orstPaintCanvas()},200);
  };
  recorder.onpause=()=>{if(orstCapture.activeStarted!==null){orstCapture.elapsedMs+=Date.now()-orstCapture.activeStarted;orstCapture.activeStarted=null}orstPaint.message='Recording interrupted or paused';orstPaintCanvas()};
  recorder.onresume=()=>{orstCapture.activeStarted=Date.now();orstAudioStatus('Recording','Recording resumed')};
  recorder.onerror=event=>{captureError=event.error||new Error('Audio capture failed');orstRequestStop()};
  for(const track of stream.getAudioTracks()){
   track.addEventListener('ended',()=>{if(orstPaint.recording&&!orstCapture.finalizing){orstCapture.interrupted=true;orstRequestStop()}},{once:true});
   track.addEventListener('mute',()=>{setTimeout(()=>{if(track.muted&&orstPaint.recording&&typeof orstAbortPaintedSpeech==='function'){orstAbortPaintedSpeech();orstPaint.draft.analysisStatus='unavailable';orstPaint.draft.speechReason='Live recognition stopped to protect microphone recording';orstPaintCanvas()}},600)});
  }
  recorder.onstop=async()=>{
   const seconds=orstCaptureElapsed()/1000;orstCapture.activeStarted=null;orstPaint.recording=false;orstCapture.starting=false;orstCapture.finalizing=true;clearInterval(orstPaint.timer);orstSampleCaptureMeter();
   const soundKnown=orstCapture.samples>0,silent=soundKnown&&orstCapture.peak<.003,pcmBlob=orstFinishPCM(seconds);orstStopCaptureMeter();
   try{if(document.visibilityState==='hidden'){orstAbortPaintedSpeech()}else await orstFinishPaintedSpeech()}catch{orstPaint.draft.analysisStatus='unavailable'}
   stream.getTracks().forEach(track=>track.stop());
   if(session!==orstCapture.session||key!==orstDraftKey()){orstCapture.finalizing=false;return}
   const mime=recorder.mimeType||chunks.find(chunk=>chunk.type)?.type||'',originalBlob=new Blob(chunks,mime?{type:mime}:{}),blob=pcmBlob||await orstCompatibleAudio(originalBlob);
   if(!began||captureError||!blob.size||seconds<=0){orstPaint.draft=previousDraft;orstCapture.finalizing=false;orstAudioStatus('Error',captureError?orstMicError(captureError):'No voice audio was created. Please record again.');orstReviewControls();return}
   const draft=orstPaint.draft;draft.recorded=true;draft.seconds=seconds;draft.audioMime=blob.type;draft.audioBytes=blob.size;draft.recordingId=crypto.randomUUID();draft.audioSilent=silent;draft.interrupted=orstCapture.interrupted;draft.recordedAt=new Date().toISOString();
   if(silent)draft.analysisStatus='audio-silent';orstCountSuccessfulReading();orstPaint.panelMode='details';orstPaint.miscueIndex=-1;orstPaint.evidencePage=0;
   try{await orstAudioCommit(key,blob,structuredClone(draft),previousDraft)}catch{draft.sessionOnly=true}
   orstCapture.finalizing=false;orstSaveDraft();orstSetPlayback(blob);orstReviewControls();
   orstAudioStatus('Processing',draft.sessionOnly?'Audio is ready for this session; download it to keep a copy.':silent?'Audio saved, but no microphone sound detected.':orstCapture.interrupted?'Interrupted recording saved.':'Processing playback…');
  };
  recorder.start(250); // The timer is started by onstart, not by this method call.
 }catch(error){stream?.getTracks().forEach(track=>track.stop());orstPaint.recording=false;orstCapture.starting=false;orstCapture.finalizing=false;orstPaint.draft=previousDraft;orstAbortPaintedSpeech();orstStopCaptureMeter();orstCancelPCM();orstAudioStatus('Error',orstMicError(error))}
 finally{if(session===orstCapture.session)orstPaint.requesting=false}
}
async function orstPlayPaintedRecording(replay=false){
 if(orstPaint.recording||orstCapture.finalizing){orstPaint.message='Stop recording before playback.';orstPaintCanvas();return}
 if(!orstPaint.url)await orstRestoreAudio();
 const audio=orstPaint.audio;if(!audio){orstPaint.message='Record your voice before pressing Play.';orstPaintCanvas();return}
 if(!replay&&!audio.paused&&!audio.ended){audio.pause();return}
 if(replay||audio.ended||(Number.isFinite(audio.duration)&&audio.currentTime>=audio.duration-.05))audio.currentTime=0;
 audio.muted=false;
 try{await audio.play()}catch(error){orstAudioStatus('Error',error.name==='NotAllowedError'?'Tap Play to allow audio playback.':'Playback failed. Download the recording or record again.')}
}
function orstStopPaintedAudio(){orstRequestStop();orstPaint.audio?.pause()}
function orstPaintedAudioLabel(){if(orstPaint.recording)return orstDuration(orstCaptureElapsed()/1000);if(orstCapture.finalizing||orstCapture.starting)return 'Processing…';const audio=orstPaint.audio;if(audio&&(audio.currentTime>0||!audio.paused))return orstDuration(audio.currentTime)+' / '+orstDuration(Number.isFinite(audio.duration)?audio.duration:orstPaint.draft?.seconds);return orstDuration(orstPaint.draft?.seconds)}
function orstRecordingExtension(mime){if(/mp4|aac/i.test(mime))return 'm4a';if(/ogg/i.test(mime))return 'ogg';if(/wav/i.test(mime))return 'wav';if(/webm/i.test(mime))return 'webm';return 'audio'}
async function orstDownloadRecording(){
 if(orstPaint.recording||orstCapture.finalizing)return;
 if(!orstCapture.blob?.size)await orstRestoreAudio();
 const blob=orstCapture.blob;if(!blob?.size){orstAudioStatus('Error','No audio file is available. Record your reading first.');return}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ORST-Grade-${selectedGrade}-Passage-${orstPaint.passage+1}-Attempt-${orstPaint.draft.readingAttempts||orstAttemptCount()}.${orstRecordingExtension(blob.type)}`;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 orstPaint.message='Recording downloaded as '+orstRecordingExtension(blob.type).toUpperCase();orstPaintCanvas();
}
async function orstDeleteRecording(){
 if(!orstPaint.draft?.recorded||orstPaint.recording||orstCapture.finalizing)return;
 if(!window.confirm('Delete this recorded audio? Other attempts and completed assessment results will not be deleted.'))return;
 const key=orstDraftKey(),id=orstPaint.draft.recordingId;
 try{await orstAudioRemoveCurrent(key,id)}catch{orstAudioStatus('Error','Could not delete the stored recording. Try again.');return}
 orstReleasePlayer();orstCapture.blob=null;orstPaint.draft=orstNewDraft();orstPaint.panelMode='title';orstSaveDraft();orstReviewControls();orstAudioStatus('Idle','Recording deleted.');
}
window.addEventListener('pagehide',orstStopPaintedAudio);
window.addEventListener('beforeunload',event=>{if(orstPaint.recording||orstCapture.finalizing){event.preventDefault();event.returnValue=''}});
