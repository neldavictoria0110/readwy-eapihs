/* Physical viewport -> full-screen canvas. The canvas takes the device's own shape, so
   nothing is letterboxed. Portrait devices show landscape pages turned a quarter-turn. */
function readwyDisplayLayout(width,height,portrait,insets={},startup=false){
 const left=Math.max(0,insets.left||0),right=Math.max(0,insets.right||0);
 const top=Math.max(0,insets.top||0),bottom=Math.max(0,insets.bottom||0);
 const availableWidth=Math.max(1,width-left-right),availableHeight=Math.max(1,height-top-bottom);
 if(startup&&portrait){
  const scale=availableWidth/1080;
  return {width:1080,height:availableHeight/scale,scale,left,top,rotate:0};
 }
 const rotate=portrait?90:0;
 const across=portrait?availableHeight:availableWidth,down=portrait?availableWidth:availableHeight;
 const wide=across/down>=16/9;
 const canvasWidth=wide?1080*across/down:1920,canvasHeight=wide?1080:1920*down/across;
 return {width:canvasWidth,height:canvasHeight,scale:across/canvasWidth,left:portrait?left+availableWidth:left,top,rotate};
}
/* Pointer position as fractions of an element, correct on the turned portrait canvas too. */
function readwyCanvasPoint(event,element){
 const box=element.getBoundingClientRect();
 return document.documentElement.hasAttribute('data-display-portrait')
  ?{x:(event.clientY-box.top)/box.height,y:(box.right-event.clientX)/box.width}
  :{x:(event.clientX-box.left)/box.width,y:(event.clientY-box.top)/box.height};
}
function readwyCanvasX(event){return document.documentElement.hasAttribute('data-display-portrait')?event.clientY:event.clientX}

(()=>{
 const root=document.documentElement;
 let queued=false;
 function refresh(){
  queued=false;
  const viewport=window.visualViewport;
  const zoomed=viewport&&viewport.scale>1.05;
  const width=!zoomed&&viewport?viewport.width:window.innerWidth;
  const height=!zoomed&&viewport?viewport.height:window.innerHeight;
  const startup=!!document.querySelector('.story-startup,.startup-slide-screen');
  const portrait=height>width;
  const layout=readwyDisplayLayout(width,height,portrait,{},startup);
  root.toggleAttribute('data-startup-portrait',startup&&portrait);
  root.toggleAttribute('data-display-portrait',layout.rotate!==0);
  root.style.setProperty('--display-rotate',layout.rotate+'deg');
  root.style.setProperty('--display-scale',layout.scale);
  root.style.setProperty('--landscape-width',layout.width+'px');
  root.style.setProperty('--landscape-height',layout.height+'px');
  root.style.setProperty('--display-left',(layout.left+(!zoomed&&viewport?viewport.offsetLeft:0))+'px');
  root.style.setProperty('--display-top',(layout.top+(!zoomed&&viewport?viewport.offsetTop:0))+'px');
  requestAnimationFrame(()=>{
   positionGSTBook();positionORSTWelcome();positionORSTInterface();positionWSTInterface();positionAssessmentSummary();
  });
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh)}}
 window.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('fullscreenchange',schedule);
 new MutationObserver(schedule).observe(document.getElementById('app'),{childList:true});
 refresh();
})();


