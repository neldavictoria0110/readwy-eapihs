/* Press the existing painted pixels inward; do not add a visible control layer. */
const orstFeedback={busy:false,frame:null,hoverAction:null};
function orstControlBox(area){return area?.dataset?.artCoords?.split(',').map(Number)}
function orstSelection(ctx,box,color='#207bfa',checked=false){
 const [x1,y1,x2,y2]=box,w=x2-x1,h=y2-y1,r=Math.min(22,h/2);
 ctx.save();ctx.beginPath();ctx.roundRect(x1+3,y1+3,w-6,h-6,r);ctx.fillStyle=color+'18';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.stroke();ctx.restore();
 if(checked){ctx.save();ctx.beginPath();ctx.arc(x1+55,y1+h/2,28,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x1+43,y1+h/2);ctx.lineTo(x1+52,y1+h/2+9);ctx.lineTo(x1+69,y1+h/2-10);ctx.stroke();ctx.restore()}
}
function orstPaintSelections(ctx){
 const s=orstPaint.stage;
 if(s===7){const question=orstPassages()[orstPaint.passage].questions[orstPaint.question],answer=orstPaint.draft?.answers[orstPaint.question],index=question.options.findIndex(o=>o.key===answer);if(index>=0)orstSelection(ctx,[678,377+index*86,1378,454+index*86],'#1269ed',true)}
 if(s===4&&orstPaint.hasChosenPassage){const boxes=[[460,255,915,505],[940,255,1395,505],[460,525,915,775],[940,525,1395,775]];orstSelection(ctx,boxes[orstPaint.passage],'#ffe18a')}
 if(s===5&&orstPaint.panelMode==='details'&&orstPaint.miscueIndex>=0){if(orstCanViewMiscue(orstPaint.miscueIndex))orstSelection(ctx,orstMiscueBox(5,orstPaint.miscueIndex),'#1269ed')}
 if(s===9){const records=orstSavedPassages();records.forEach(({record},i)=>{if(record||orstPaint.hasChosenPassage&&i===orstPaint.passage)orstSelection(ctx,[317+i*272,322,578+i*272,701],record?'#15b786':'#207bfa')})}
 const focused=document.activeElement;if(focused?.tagName==='AREA'&&typeof orstAreaShape==='function'){ctx.save();orstButtonPath(ctx,orstAreaShape(focused));ctx.strokeStyle='#f4c45e';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 if(orstFeedback.hoverAction){const hovered=[...document.querySelectorAll('.orst-painted-board [data-action]')].find(area=>area.dataset.action===orstFeedback.hoverAction);if(hovered)orstHoverRecess(ctx,orstControlBox(hovered),orstAreaShape(hovered))}
 document.querySelectorAll('.orst-painted-board area[data-action]').forEach(area=>{const action=area.dataset.action;if(action.startsWith('answer:'))area.setAttribute('aria-pressed',String(orstPaint.draft?.answers[orstPaint.question]===action.slice(7)));if(action.startsWith('question:'))area.setAttribute('aria-current',Number(action.slice(9))===orstPaint.question?'step':'false')});
}
function orstPressControl(area){
 const canvas=document.getElementById('orstPaintedArtwork'),box=orstControlBox(area);if(!canvas||!box)return;
 if(orstFeedback.frame!==null)cancelAnimationFrame(orstFeedback.frame);
 const shot=document.createElement('canvas');shot.width=canvas.width;shot.height=canvas.height;shot.getContext('2d').drawImage(canvas,0,0);
 const shape=typeof orstAreaShape==='function'?orstAreaShape(area):null;
 const ctx=canvas.getContext('2d'),start=performance.now(),reduced=orstReducedMotion();
 const draw=now=>{
  if(!canvas.isConnected)return;
  const t=Math.min(1,(now-start)/190),amount=reduced?.65:Math.sin(Math.PI*t),[x1,y1,x2,y2]=box,w=x2-x1,h=y2-y1,shrink=.025*amount;
  ctx.drawImage(shot,x1,y1,w,h,x1,y1,w,h);ctx.save();if(shape)orstButtonPath(ctx,shape);else{ctx.beginPath();ctx.roundRect(x1,y1,w,h,Math.min(22,h/2))}ctx.clip();
  ctx.fillStyle='#06152d';ctx.fillRect(x1,y1,w,h);ctx.drawImage(shot,x1,y1,w,h,x1+w*shrink/2,y1+h*shrink/2+3*amount,w*(1-shrink),h*(1-shrink));
  const shade=ctx.createLinearGradient(x1,y1,x1,y2);shade.addColorStop(0,`rgba(2,12,35,${.27*amount})`);shade.addColorStop(.5,`rgba(255,226,155,${.1*amount})`);shade.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=shade;ctx.fillRect(x1,y1,w,h);ctx.restore();
  if(t<1&&!reduced)orstFeedback.frame=requestAnimationFrame(draw);else orstFeedback.frame=null;
 };
 draw(start);
}
function orstActivateControl(action,event){
 if(orstFeedback.busy)return;
 const area=event.currentTarget,shiftKey=event.shiftKey;
 orstPressControl(area);orstFeedback.busy=true;
 if(action==='record'||action==='record-label'||action==='play'){orstFeedback.busy=false;return orstPaintAction(action,{shiftKey})}
 setTimeout(()=>{orstFeedback.busy=false;orstPaintAction(action,{shiftKey})},orstReducedMotion()?0:200);
}
function orstFocusControl(){orstPaintCanvas()}

function orstHoverRecess(ctx,box,shape){
 if(!box)return;const [x1,y1,x2,y2]=box,w=x2-x1,h=y2-y1;
 const crop=document.createElement('canvas');crop.width=w;crop.height=h;crop.getContext('2d').drawImage(ctx.canvas,x1,y1,w,h,0,0,w,h);
 ctx.save();if(shape)orstButtonPath(ctx,shape);else{ctx.beginPath();ctx.roundRect(x1,y1,w,h,Math.min(22,h/2))}ctx.clip();ctx.fillStyle='#132744';ctx.fillRect(x1,y1,w,h);
 ctx.drawImage(crop,x1+w*.008,y1+2+h*.008,w*.984,h*.984);
 const shadow=ctx.createLinearGradient(0,y1,0,y2);shadow.addColorStop(0,'rgba(0,8,25,.24)');shadow.addColorStop(.4,'rgba(0,8,25,.04)');shadow.addColorStop(1,'rgba(255,227,168,.06)');ctx.fillStyle=shadow;ctx.fillRect(x1,y1,w,h);ctx.restore();
}
function orstHoverControl(area){if(!area?.isConnected)return;orstFeedback.hoverAction=area.dataset.action;orstPaintCanvas()}
function orstUnhoverControl(area){if(orstFeedback.hoverAction===area?.dataset?.action){orstFeedback.hoverAction=null;orstPaintCanvas()}}
