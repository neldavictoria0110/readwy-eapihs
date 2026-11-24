/* Lift the logo's open book and settle it onto the live startup slider. */
(()=>{
 const link=document.querySelector('main a'),logo=link.querySelector('img');
 const frame=document.querySelector('.startup-reveal'),book=document.querySelector('.morph-book');
 const halo=document.querySelector('.book-halo'),status=document.querySelector('.launch-status');
 const source=book.querySelector('.logo-book-source'),landing=book.querySelector('.landing-book');
 let opening=false;
 const animate=(element,frames,options)=>element.animate(frames,{fill:'forwards',...options}).finished;
 async function startupBook(){
  const deadline=performance.now()+12000;
  while(performance.now()<deadline){
   const slider=frame.contentDocument?.querySelector('.startup-slide-book');
   if(slider&&slider.getBoundingClientRect().width>0){
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return slider;
   }
   await new Promise(resolve=>setTimeout(resolve,80));
  }
  throw Error('Startup loading timed out');
 }
 link.addEventListener('click',async event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(opening)return;opening=true;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){location.assign(link.href);return}
  let slider;
  try{
   const r=logo.getBoundingClientRect();
   const w=r.width*640/1254,h=r.height*190/1254;
   const x=r.left+r.width*310/1254,y=r.top+r.height*620/1254;
   Object.assign(book.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
   Object.assign(halo.style,{left:x+w/2-45+'px',top:y+h/2-45+'px'});
   status.textContent='Opening READwy…';
   await Promise.all([
    animate(halo,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.5)'}],{duration:450,easing:'ease-out'}),
    animate(book,[{opacity:0,transform:'scale(1)'},{opacity:1,transform:'scale(1.12)'}],{duration:450,easing:'ease-out'})
   ]);
   slider=await startupBook();
   const motion=frame.contentDocument.querySelector('.startup-scene-motion');
   let sceneRoot;
   const sceneDeadline=performance.now()+5000;
   while(motion&&performance.now()<sceneDeadline){
    sceneRoot=motion.contentDocument?.documentElement;
    if(sceneRoot?.localName==='svg')break;
    await new Promise(resolve=>setTimeout(resolve,80));
   }
   if(sceneRoot?.localName==='svg')sceneRoot.classList.add('title-staged');

   const target=slider.getBoundingClientRect(),frameRect=frame.getBoundingClientRect();
   const tx=target.left+frameRect.left,ty=target.top+frameRect.top;
   slider.style.opacity='0';
   document.body.classList.add('is-opening');frame.style.visibility='visible';
   const cx=x+w/2,cy=y+h/2;
   const radius=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
   const dx=tx+target.width/2-cx,dy=ty+target.height/2-cy;
   const midWidth=Math.min(210,innerWidth*.45),midHeight=midWidth*.5;
   await Promise.all([
    animate(book,[
     {opacity:1,left:x+'px',top:y+'px',width:w+'px',height:h+'px',transform:'scale(1.12)'},
     {opacity:1,left:(innerWidth-midWidth)/2+'px',top:innerHeight*.42+'px',width:midWidth+'px',height:midHeight+'px',transform:'scale(1) rotate(-5deg)',offset:.45},
     {opacity:1,left:tx+'px',top:ty+'px',width:target.width+'px',height:target.height+'px',transform:'scale(1) rotate(0deg)'}
    ],{duration:2000,easing:'cubic-bezier(.3,.05,.2,1)'}),
    animate(source,[{opacity:1},{opacity:1,offset:.3},{opacity:0,offset:.8},{opacity:0}],{duration:2000}),
    animate(landing,[{opacity:0},{opacity:0,offset:.3},{opacity:1,offset:.8},{opacity:1}],{duration:2000}),
    animate(halo,[{opacity:1,transform:'scale(1.5)'},{opacity:.5,transform:`translate(${dx*.5}px,${dy*.5}px) scale(3)`,offset:.55},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(1)`}],{duration:2000}),
    animate(frame,[{clipPath:`circle(0px at ${cx}px ${cy}px)`},{clipPath:`circle(${radius}px at ${cx}px ${cy}px)`}],{duration:1600,delay:180,easing:'cubic-bezier(.6,0,.2,1)'})
   ]);
   slider.style.opacity='';book.style.visibility='hidden';halo.style.visibility='hidden';
   sceneRoot?.classList.add('title-playing');
   frame.style.clipPath='none';frame.inert=false;frame.removeAttribute('aria-hidden');frame.removeAttribute('tabindex');
   document.querySelector('main').hidden=true;status.textContent='';
   frame.contentWindow.focus();slider.focus({preventScroll:true});
  }catch{if(slider)slider.style.opacity='';location.assign(link.href)}
 });
})();
