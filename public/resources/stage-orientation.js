(()=>{
 const names={gst:'GST — General Skills Test',orst:'ORST — Oral Reading',wst:'Writing Screening Test',aral:'ARAL Program',interv:'Intervention Program',sra:'SRA Program',reports:'Post-Test — Assessment Reports'};
 const program=new URLSearchParams(location.search).get('program');
 if(!Object.prototype.hasOwnProperty.call(names,program)){location.replace('index.html?view=map');return}
 let opening=false,timer;
 const animate=(element,keyframes,options)=>element.animate(keyframes,{fill:'forwards',...options}).finished;
 async function settlePhoneLandscape(){
  const group=document.querySelector('main .phone');
  const current=getComputedStyle(group).transform;
  group.style.animation='none';group.style.transform=current;
  const turn=group.animate([{transform:current},{transform:'rotate(-90deg)'}],{duration:550,easing:'cubic-bezier(.22,.65,.2,1)',fill:'forwards'});
  await turn.finished;group.style.transform='rotate(-90deg)';turn.cancel();
 }
 async function morphIntoGST(landscapeReady){
  const frame=document.createElement('iframe');frame.title='GST — Group Screening Test';frame.inert=true;
  Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'10',background:'#061526',visibility:'hidden',clipPath:'circle(0px at 50% 50%)'});
  frame.src='index.html?journeyModule=gst&morphHold=1';document.body.appendChild(frame);
  const deadline=performance.now()+20000;
  while(performance.now()<deadline){
   if(frame.contentWindow?.journeyProgramReady)break;
   await new Promise(resolve=>setTimeout(resolve,80));
  }
  if(!frame.contentWindow?.journeyProgramReady)throw Error('GST did not load');
  await landscapeReady;
  const original=document.querySelector('main>svg'),from=original.getBoundingClientRect();
  const phone=original.cloneNode(true);phone.id='gst-morph-phone';phone.removeAttribute('aria-hidden');phone.setAttribute('aria-hidden','true');
  phone.querySelector('.phone').style.cssText='animation:none;transform:rotate(-90deg);transform-origin:60px 60px';
  Object.assign(phone.style,{position:'fixed',left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',margin:'0',zIndex:'12',color:'#eac77c',pointerEvents:'none'});
  document.body.appendChild(phone);original.style.visibility='hidden';
  const canvas=frame.contentDocument.querySelector('.gst-book-canvas');
  if(!canvas)throw Error('GST book not available');
  const emblem=frame.contentDocument.querySelector('.gst-title-paper .gst-title-emblem svg');
  if(!emblem)throw Error('GST title book not available');
  const target=emblem.getBoundingClientRect();
  // Follow the live title emblem, including viewport scaling and orientation changes.
  const x=target.left+target.width*.5,y=target.top+target.height*.58;
  const size=Math.max(24,target.width*1.15);
  frame.contentDocument.documentElement.classList.remove('program-loading','program-arrival');
  frame.style.visibility='visible';
  document.body.classList.add('departing');
  await animate(phone,[
   {left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',transform:'none',opacity:1},
   {left:(x-size/2)+'px',top:(y-size/2)+'px',width:size+'px',height:size+'px',transform:'none',opacity:1}
  ],{duration:1100,easing:'cubic-bezier(.22,.65,.2,1)'});
  const rx=target.width*.52,ry=target.height*.43;
  await Promise.all([
   animate(phone,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.02)'}],{duration:450}),
   animate(frame,[{clipPath:`ellipse(0px 0px at ${x}px ${y}px)`},{clipPath:`ellipse(${rx}px ${ry}px at ${x}px ${y}px)`}],{duration:450,easing:'ease-out'})
  ]);
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  await animate(frame,[{clipPath:`ellipse(${rx}px ${ry}px at ${x}px ${y}px)`},{clipPath:`ellipse(${radius}px ${radius}px at ${x}px ${y}px)`}],{duration:900,easing:'cubic-bezier(.4,0,.2,1)'});
  frame.style.clipPath='none';frame.inert=false;phone.remove();document.querySelector('main').hidden=true;frame.contentWindow.focus();
 }
 async function open(){
  if(opening)return;opening=true;clearTimeout(timer);
  document.getElementById('openProgram').disabled=true;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(program==='gst'&&!reduced){
   try{const landscapeReady=settlePhoneLandscape();await morphIntoGST(landscapeReady);return}catch{}
  }
  document.body.classList.add('departing');
  if(!reduced)await new Promise(resolve=>setTimeout(resolve,400));
  location.replace('index.html?journeyModule='+encodeURIComponent(program));
 }
 const landscape=matchMedia('(orientation: landscape)');
 const desktop=matchMedia('(hover: hover) and (pointer: fine)');
 document.getElementById('openProgram').addEventListener('click',open);
 function check(){
  clearTimeout(timer);
  if(landscape.matches||desktop.matches){document.getElementById('heading').textContent='Your screen is ready';timer=setTimeout(open,850)}
  else{document.getElementById('heading').textContent='Turn your phone sideways';}
 }
 landscape.addEventListener('change',check);check();
})();
