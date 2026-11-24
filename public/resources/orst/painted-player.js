/* All visible controls are painted into the original artwork. DOM targets are invisible. */
function orstSyncAudioHUD(){
 document.getElementById('orstAudioHUD')?.remove();
 const board=document.querySelector('.orst-painted-board');if(!board)return;
 if(typeof orstTeacherMode==='function'&&orstTeacherMode()){document.getElementById('orstArtworkPlay')?.remove();document.getElementById('orstArtworkDownload')?.remove();return}
 if([5,6].includes(orstPaint.stage)&&orstPaint.draft?.recorded&&!orstCapture.blob&&!orstCapture.restorePending&&orstCapture.status!=='Error')orstRestoreAudio();
 for(const [id,label,action] of [['orstArtworkPlay','Play your recording',()=>orstPlayPaintedRecording()],['orstArtworkDownload','Download your recording',orstDownloadRecording]]){
  let button=document.getElementById(id);
  if(![5,6].includes(orstPaint.stage)){button?.remove();continue}
  if(!button){button=document.createElement('button');button.id=id;button.className='orst-artwork-action';button.type='button';button.onclick=event=>{if(id==='orstArtworkPlay')orstPressControl(button);action()};board.append(button)}
  button.dataset.stage=orstPaint.stage;button.setAttribute('aria-label',label);
  if(id==='orstArtworkPlay'&&typeof orstButtonShape==='function'){const shape=orstButtonShape(orstPaint.stage,'play');button.dataset.action='play';button.dataset.artCoords=shape.box.join(',');button.onpointerenter=()=>orstHoverControl(button);button.onpointerleave=()=>orstUnhoverControl(button);if(shape.circle)button.style.clipPath='circle(50% at 50% 50%)'}
  button.disabled=orstPaint.recording||orstPaint.requesting||orstCapture.starting||orstCapture.finalizing;
 }
 if(orstPaint.audio&&!board.contains(orstPaint.audio)){orstPaint.audio.controls=false;orstPaint.audio.hidden=true;board.append(orstPaint.audio)}
}
function orstPaintAudioControls(ctx,text){
 if(![5,6].includes(orstPaint.stage)||typeof orstTeacherMode==='function'&&orstTeacherMode())return;
 const ready=!!orstCapture.blob?.size&&!orstPaint.recording&&!orstCapture.finalizing;
 const playing=orstPaint.audio&&!orstPaint.audio.paused;
 if(orstPaint.stage===5){
  // Reuse the original audio strip, with no added panel or floating content.
  ctx.fillStyle='#fffce8';ctx.beginPath();ctx.roundRect(245,444,365,61,18);ctx.fill();
  ctx.fillStyle='#06114d';
  if(playing){ctx.fillRect(274,462,6,23);ctx.fillRect(287,462,6,23)}else{ctx.beginPath();ctx.moveTo(275,460);ctx.lineTo(275,487);ctx.lineTo(296,473.5);ctx.closePath();ctx.fill()}
  const seconds=orstPaint.recording?orstCaptureElapsed()/1000:orstPaint.audio?.currentTime||orstPaint.draft?.seconds;
  text(orstDuration(seconds),370,475,110,28,700,'center');
  text('Download',529,475,142,26,700,'center',ready?'#06114d':'#778098');
 }else{
  ctx.fillStyle='#fffdf0';ctx.fillRect(535,382,390,78);ctx.fillRect(405,394,130,66);
  text('Download',680,422,250,30,700,'center',ready?'#06114d':'#778098');
 }
}
