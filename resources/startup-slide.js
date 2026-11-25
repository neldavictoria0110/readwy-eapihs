function renderStartupSlide(){
 app.innerHTML=`<section class="story-screen story-startup startup-slide-screen" aria-label="READwy — The Enchanted Academy of Reading"><div class="startup-slide-art"><object class="startup-login-title" type="image/svg+xml" data="resources/readwy-login-title.svg" aria-hidden="true" tabindex="-1"></object><div class="startup-slide-track"><span class="startup-slide-label" aria-hidden="true">Slide to Open</span><div class="startup-slide-book" role="slider" tabindex="0" aria-label="Slide the book right to open" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Slide the book to the right end to open"><img class="startup-book-art" src="resources/open-book.svg" alt="" draggable="false"></div></div></div><div class="startup-orientation-prompt" role="status" aria-live="polite"><div class="startup-orientation-card"><div class="startup-orientation-device" aria-hidden="true"></div><strong>Rotate your device</strong><span>READwy is designed for landscape.</span></div></div></section>`;

 const art=app.querySelector('.startup-slide-art'),track=app.querySelector('.startup-slide-track'),book=app.querySelector('.startup-slide-book');
 if(typeof window.readwyStationLayer!=='function')throw new Error('The login station backdrop is unavailable');
 const scene=window.readwyStationLayer(art,{zoom:1,focusWide:(w,h)=>w/h>1.5?870:836,shade:false,loginFrames:true,mobileFit:true,mobileAlignY:.38});
 const titleLayer=app.querySelector('.startup-login-title');
 if(!titleLayer||!scene.querySelector('.rs-cam')){scene.remove();throw new Error('The login title animation is unavailable');}
 const mobileSafe=typeof window.readwyMobileSafetyActive==='function'&&window.readwyMobileSafetyActive();
 if(mobileSafe){
  const calmTitle=()=>{try{const titleDoc=titleLayer.contentDocument;if(titleDoc&&titleDoc.documentElement)titleDoc.documentElement.classList.add('rw-mobile-safe')}catch(e){}};
  titleLayer.addEventListener('load',calmTitle);
  calmTitle();
 }
 scene.append(titleLayer);
 function fitTitleLayer(){
  const width=art.clientWidth,height=art.clientHeight;
  if(!width||!height)return;
  const scale=Math.max(width/1672,height/941)*(width<height?1:.93);
  titleLayer.style.width=(Math.min(1450,width*.94/scale)*scale*.70/1.5)+'px';
 }
 fitTitleLayer();
 // READWY_SLIDER_FRAME_FIX_V3
 let progress=0,drag=null,completed=false,paintId=0;
 let travelCss=0,travelScreen=1,lastPercent=-1;

 function measure(){
  const rect=track.getBoundingClientRect();
  travelCss=Math.max(0,track.clientWidth-book.offsetWidth);
  const scale=rect.width/Math.max(1,track.clientWidth);
  travelScreen=Math.max(1,travelCss*scale);
 }

 function paint(){
  paintId=0;
  if(!book.isConnected)return;
  track.style.setProperty('--startup-label-cover-width',(progress*74.5)+'%');
  book.style.transform='translate3d('+(progress*travelCss)+'px,0,0)';
 }

 function update(value){
  progress=Math.max(0,Math.min(1,value));
  const percent=Math.round(progress*100);

  if(percent!==lastPercent){
   lastPercent=percent;
   book.setAttribute('aria-valuenow',percent);
   book.setAttribute('aria-valuetext',percent+' percent. Slide right to open.');
  }

  paint(); // READWY_QUICK_STARTUP_V4
 }

 book.style.left='0px';
 measure();
 update(0);
 function finish(){
  if(completed||navigationBusy)return;
  
  completed=true;update(1);book.setAttribute('aria-valuetext','Complete. Opening the next page.');
  window.location.assign('index.html?view=train');
 }
 function reset(){book.classList.remove('is-dragging');track.classList.remove('is-dragging');update(0)}
 track.addEventListener('pointerdown',event=>{
  if(completed||navigationBusy||event.isPrimary===false||event.button!==0)return;
  event.preventDefault();
  book.focus({preventScroll:true});
  measure();
  track.setPointerCapture(event.pointerId);
  drag={id:event.pointerId,x:event.clientX,start:progress,travel:travelScreen};
  book.classList.add('is-dragging');track.classList.add('is-dragging');
 });
 track.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId||completed)return;
  update(drag.start+(event.clientX-drag.x)/drag.travel);
  if(progress>=1){drag=null;finish()}
 });
 function release(event){if(drag?.id!==event.pointerId)return;drag=null;if(!completed){if(progress>=.95)finish();else reset()}}
 track.addEventListener('pointerup',release);
 track.addEventListener('pointercancel',release);
 track.addEventListener('lostpointercapture',release);
 book.addEventListener('keydown',event=>{
  if(completed||navigationBusy)return;
  if(!['ArrowRight','ArrowLeft','Home'].includes(event.key))return;
  event.preventDefault();
  update(event.key==='Home'?0:progress+(event.key==='ArrowRight'?.1:-.1));
  if(progress>=.999)finish();
 });
 const observer=new ResizeObserver(()=>{if(book.isConnected){measure();update(progress)}fitTitleLayer()});
 observer.observe(track);
 renderStartupSlide.cleanup=()=>{observer.disconnect();if(paintId)cancelAnimationFrame(paintId);scene.remove()};
}