/* Turn the existing artwork; carry the original owl through the story. */
let bookSnapshotSerial=0;
function captureBookScreen(){
 const snapshotPrefix='readwy-snapshot-'+(++bookSnapshotSerial)+'-',ids=new Map();
 for(const element of app.querySelectorAll('[id]'))ids.set(element.id,snapshotPrefix+element.id);
 const localReferences=value=>value.replace(/url\((['"]?)(.*?)\1\)/g,(match,quote,url)=>{
  const id=url.slice(url.lastIndexOf('#')+1);return ids.has(id)?'url("#'+ids.get(id)+'")':match;
 }).replace(/^#(.+)$/, (match,id)=>ids.has(id)?'#'+ids.get(id):match);

 const properties=['display','position','top','right','bottom','left','width','height','min-width','max-width','min-height','max-height','box-sizing','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','overflow','overflow-x','overflow-y','border','border-radius','border-top','border-right','border-bottom','border-left','background','background-image','background-size','background-position','background-repeat','color','font-family','font-size','font-style','font-weight','font-variant','line-height','letter-spacing','text-align','text-transform','text-shadow','text-decoration','white-space','vertical-align','opacity','visibility','box-shadow','filter','clip-path','object-fit','object-position','aspect-ratio','transform','transform-origin','z-index','flex','flex-direction','flex-wrap','flex-shrink','align-items','align-self','justify-content','gap','row-gap','column-gap','grid-template-columns','grid-template-rows','grid-auto-rows','grid-column','grid-row','fill','stop-color','stop-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin'];
 function copy(node){
  if(node.nodeType===Node.TEXT_NODE)return node.cloneNode();
  if(node.nodeType!==Node.ELEMENT_NODE||node.matches('script,.book-edge-luminance,.story-living-drawing,.story-living-journey,.startup-owl-light,.owl-magic-dust,.story-environment,.story-scene-sparks'))return null;
  const clone=node.cloneNode(false),style=getComputedStyle(node);
  for(const attribute of [...clone.attributes]){
   if(attribute.name==='id'){if(ids.has(attribute.value))clone.setAttribute('id',ids.get(attribute.value));else clone.removeAttribute('id')}
   else if(attribute.name==='class'||attribute.name==='name'||attribute.name.startsWith('on'))clone.removeAttribute(attribute.name);
   else clone.setAttribute(attribute.name,localReferences(attribute.value));
  }
  clone.style.cssText=properties.map(property=>`${property}:${localReferences(style.getPropertyValue(property))}`).join(';');
  clone.style.animation='none';clone.style.transition='none';clone.style.pointerEvents='none';
  if(node instanceof HTMLInputElement){clone.value=node.value;clone.checked=node.checked}
  if(node instanceof HTMLTextAreaElement){clone.textContent=node.value;return clone}
  for(const child of node.childNodes){const copied=copy(child);if(copied)clone.append(copied)}
  if(node instanceof HTMLSelectElement)clone.value=node.value;
  return clone;
 }
 const snapshot=copy(app);
 snapshot.style.position='absolute';snapshot.style.inset='auto';snapshot.style.left='0';snapshot.style.top=-app.scrollTop+'px';snapshot.style.width=app.clientWidth+'px';snapshot.style.height=app.scrollHeight+'px';snapshot.style.overflow='hidden';snapshot.style.transform='none';snapshot.style.margin='0';snapshot.setAttribute('aria-hidden','true');
 return snapshot;
}
// Page-change waits run at READWY_MOTION_SPEED (set by performance-runtime.js together with the matching
// CSS animation speed-up), so the waits and the animations they wait for always stay in step.
function waitForTransitionMotion(duration){duration/=Math.max(1,Number(globalThis.READWY_MOTION_SPEED)||1);return new Promise(resolve=>{let start;function tick(now){start??=now;if(now-start<duration)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)})}
async function animatePageTransition(to,renderDestination){
 if(navigationBusy)return false;
 navigationBusy=true;
 const cover=document.getElementById('transition');
 let outgoingPassage=null,outgoingVisibility='';
 const commit=()=>{page=to;if(renderDestination)renderDestination();else render();scrollAppToTop()};
 try{
  const mobileSafe=typeof globalThis.readwyMobileSafetyActive==='function'?globalThis.readwyMobileSafetyActive():((nav=>/iPhone|iPad|iPod/i.test(nav.userAgent||'')||((nav.maxTouchPoints||0)>1&&/Macintosh/i.test(nav.userAgent||'')))(globalThis.navigator||{}));
  document.documentElement.classList.add('book-traveling');
  const storyPages=['startup','login','signup','subject','areas-preview','subjects-spread','journey','map'];
  const keepOwl=storyPages.includes(page)&&storyPages.includes(to);
  if(keepOwl)document.documentElement.classList.add('owl-story-travel');
  else stopOwlFlight();
  stopWelcomeWandering();
  if(document.querySelector('.gst-book-screen'))stopGSTOwlSpeech();
  app.inert=true;nav.inert=true;app.setAttribute('aria-busy','true');
  if(mobileSafe||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')){commit();return true}
  const mapShortcut=['journey','map'].includes(page)&&['work','orst-welcome','wst'].includes(to);
  const gstToReading=to==='orst-welcome'&&!!document.querySelector('.gst-book-screen');
  const readingToWriting=to==='wst'&&page!=='wst'&&!!document.querySelector('.orst-interface-screen');
  const aralTravel=to==='work'&&typeof activeModule!=='undefined'&&activeModule==='aral';
  if(to==='orst-welcome'||to==='orst-grade'||(to==='work'&&typeof activeModule!=='undefined'&&activeModule==='orst')||document.querySelector('.orst-grade-screen,.orst-artwork-welcome,.orst-interface-screen')){
   outgoingPassage=app.querySelector('.orst-passage-copy');
   if(outgoingPassage){outgoingVisibility=outgoingPassage.style.visibility;outgoingPassage.style.visibility='hidden'}
   const previousScreen=captureBookScreen();
   const scaleX=app.clientWidth/1672,scaleY=app.clientHeight/941;
   cover.style.setProperty('--orst-grade-focus-x',((page==='orst-grade'?828+(selectedGrade-7)*190:1000)*scaleX)+'px');
   cover.style.setProperty('--orst-grade-focus-y',(424*scaleY)+'px');
   cover.innerHTML='<div class="orst-grade-departure" aria-hidden="true"></div><div class="orst-grade-arrival" aria-hidden="true"></div>';
   cover.querySelector('.orst-grade-departure').append(previousScreen);
   cover.className='orst-grade-zoom orst-grade-zoom-loading';
   commit();
   await Promise.all([...app.querySelectorAll('img')].map(async image=>{try{await image.decode()}catch{}}));
   cover.querySelector('.orst-grade-arrival').append(captureBookScreen());
   cover.classList.remove('orst-grade-zoom-loading');
   await waitForTransitionMotion(1100);return true;
  }
  if((page==='orst-welcome'&&to==='orst-grade')||mapShortcut||(page==='startup'&&to==='login')||(page==='journey'&&to==='map')||(page==='map'&&to==='journey')){
   const previousScreen=captureBookScreen();
   const board=app.querySelector('.story-board');
   const width=app.clientWidth,height=app.clientHeight;
   const bw=board?.clientWidth||width,bh=board?.clientHeight||height;
   // Use canvas coordinates so the portal also follows the rotated mobile layout.
   cover.style.setProperty('--map-focus-x',((width-bw)/2+bw*.69)+'px');
   cover.style.setProperty('--map-focus-y',((height-bh)/2+bh*.50)+'px');
   cover.innerHTML='<div class="enchanted-map-source" aria-hidden="true"></div><div class="enchanted-map-destination" aria-hidden="true"></div><div class="enchanted-map-aura" aria-hidden="true"></div><div class="enchanted-map-gate" aria-hidden="true"><div class="enchanted-map-runes">&#10022; &#8902; &#10023; &#8902; &#10022; &#8902; &#10023; &#8902;</div></div><div class="enchanted-map-stars" aria-hidden="true"></div>';
   cover.querySelector('.enchanted-map-source').append(previousScreen);
   cover.querySelector('.enchanted-map-stars').innerHTML=Array.from({length:40},(_,i)=>'<i style="--star-angle:'+i*137.5+'deg;--star-distance:'+(100+i%8*45)+'px;--star-delay:'+i%7*65+'ms">&#10022;</i>').join('');
   cover.className='enchanted-map-transition enchanted-map-loading';
   commit();app.classList.add('enchanted-map-live');
   const gstWelcome=app.querySelector('.gst-book-canvas[data-scene="welcome"]');
   if(gstWelcome)prepareGSTLetterReveal(gstWelcome);
   await Promise.all([...app.querySelectorAll('img')].map(async image=>{try{await image.decode()}catch{}}));
   const destinationScreen=captureBookScreen();destinationScreen.style.opacity='1';
   cover.querySelector('.enchanted-map-destination').append(destinationScreen);
   cover.classList.remove('enchanted-map-loading');
   await waitForTransitionMotion(3400);
   if(gstWelcome)gstWelcome.classList.add('gst-letters-revealing');
   return true;
  }
  if(gstToReading||readingToWriting||aralTravel){
   const wandPath='UI%20and%20owl/owl%20poses/wand%20clean.png';
   if(typeof Image!=='undefined'){
    const assets=[wandPath];
    if(to==='orst-welcome'&&typeof ORST_WELCOME_ART!=='undefined'&&typeof ORST_OWL_ART!=='undefined')assets.push(ORST_WELCOME_ART,ORST_OWL_ART);
    await Promise.all(assets.map(async src=>{const image=new Image();image.src=src;try{await image.decode()}catch{}}));
   }
   cover.innerHTML=`<div class="wand-cast-shade" aria-hidden="true"></div><div class="wand-cast-orbit" aria-hidden="true"><div class="wand-cast-trail"></div><div class="wand-cast-wand"><div class="wand-cast-art"><img src="${wandPath}" alt="" draggable="false"><span class="wand-cast-tip"></span></div></div><div class="wand-cast-sparks">${Array.from({length:18},(_,i)=>`<i style="--cast-angle:${i*20}deg;--cast-delay:${i%6*55}ms">&#10022;</i>`).join('')}</div></div><div class="wand-cast-luminance" aria-hidden="true"></div>`;
   cover.className='assessment-wand-cast';
   // Change pages only at the sustained, fully opaque peak of the glow.
   await waitForTransitionMotion(1400);commit();
   await waitForTransitionMotion(1000);return true;
  }  if(to==='orst-welcome'||(to==='work'&&typeof activeModule!=='undefined'&&activeModule==='orst')){
   const previousScreen=captureBookScreen();
   cover.innerHTML='<div class="orst-voice-upper" aria-hidden="true"></div><div class="orst-voice-lower" aria-hidden="true"></div><svg class="orst-voice-wave" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 100 H270 Q290 100 300 82 T330 100 Q345 130 360 100 L380 44 405 162 435 24 465 178 495 58 525 136 550 78 Q570 115 590 100 H1000"/></svg>';
   cover.querySelector('.orst-voice-upper').append(previousScreen.cloneNode(true));
   cover.querySelector('.orst-voice-lower').append(previousScreen);
   cover.className='orst-voice-morph';commit();
   app.classList.add('orst-voice-destination');
   await waitForTransitionMotion(1500);return true;
  }
  if(to==='wst'&&page!=='wst'){
   const previousScreen=captureBookScreen();
   cover.innerHTML='<div class="wst-brush-source" aria-hidden="true"></div><svg class="wst-brush-trail" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M-60 70 Q260 190 490 320 T1060 540"/></svg>';
   cover.querySelector('.wst-brush-source').append(previousScreen);
   cover.className='wst-brush-morph';commit();
   app.classList.add('wst-brush-destination');
   await waitForTransitionMotion(1400);return true;
  }
  if((page==='login'&&['login','subject','areas-preview'].includes(to))||(['subject','areas-preview','subjects-spread'].includes(page)&&to==='journey')){
   const previousScreen=captureBookScreen();
   cover.innerHTML='<div class="welcome-ribbon-source" aria-hidden="true"></div><div class="welcome-ribbon-light" aria-hidden="true"></div>';
   cover.querySelector('.welcome-ribbon-source').append(previousScreen);
   cover.className='welcome-ribbon-morph';
   commit();
   app.classList.add('welcome-ribbon-destination');
   await waitForTransitionMotion(1800);return true;
  }
  // Remaining chapters share a paper-to-paper morph; assessments keep their own layout.
  const assessment=['wst','orst-welcome','assessment-summary'].includes(to)||(to==='work'&&typeof activeModule!=='undefined'&&['gst','orst','sra','interv'].includes(activeModule));
  const quick=page===to;
  const previousScreen=captureBookScreen();
  const width=app.clientWidth,height=app.clientHeight;
  cover.innerHTML='<div class="chapter-morph-source" aria-hidden="true"></div><div class="chapter-morph-light" aria-hidden="true"></div>';
  cover.querySelector('.chapter-morph-source').append(previousScreen);
  cover.className='chapter-morph'+(assessment?' assessment-morph':'')+(quick?' chapter-morph-quick':'');
  commit();
  await Promise.resolve();
  if(!assessment&&!app.querySelector('.story-screen')){
   const host=document.createElement('section');host.className='book-content-host';
   const board=document.createElement('div');board.className='book-content-board';
   const paper=document.createElement('div');paper.className='book-content-paper';
   const content=document.createElement('div');content.className='book-content-live';
   content.style.width=width+'px';content.style.height=height+'px';
   while(app.firstChild)content.append(app.firstChild);
   paper.append(content);board.append(paper);host.append(board);app.append(host);
   const fit=()=>{content.style.transform=`scale(${paper.clientWidth/width},${paper.clientHeight/height})`};
   fit();const observer=new ResizeObserver(fit);observer.observe(paper);host._bookObserver=observer;
  }
  app.classList.add('chapter-morph-live');
  if(quick)app.classList.add('chapter-morph-quick');
  await waitForTransitionMotion(quick?1100:1500);
  return true;
 }finally{
  if(outgoingPassage?.isConnected)outgoingPassage.style.visibility=outgoingVisibility;
  app.classList?.remove('orst-hall-arriving');
  app.classList?.remove('startup-morph-destination');
  app.classList?.remove('welcome-ribbon-destination');
  app.classList?.remove('map-morph-live','enchanted-map-live');
  app.classList?.remove('orst-voice-destination');
  app.classList?.remove('wst-brush-destination');
  app.classList?.remove('chapter-morph-live');
  app.classList?.remove('chapter-morph-quick');
  for(const property of ['--map-start-x','--map-start-y','--map-scale-x','--map-scale-y','--map-focus-x','--map-focus-y'])cover.style.removeProperty(property);
  cover.style.removeProperty('--orst-grade-focus-x');cover.style.removeProperty('--orst-grade-focus-y');
  cover.className='transition';cover.innerHTML='';for(const property of ['--turn-time','--screen-width','--screen-height','--journey-time'])cover.style.removeProperty(property);
  document.documentElement.classList.remove('book-traveling');
  document.documentElement.classList.remove('owl-story-travel');
  app.removeAttribute('aria-busy');app.inert=false;nav.inert=false;navigationBusy=false;
 }
}