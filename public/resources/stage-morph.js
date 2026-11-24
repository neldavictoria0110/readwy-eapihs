/* Expand the chosen stage into the landscape guidance page. */
(()=>{
 let opening=false;
 document.querySelectorAll('.stage').forEach(stage=>stage.addEventListener('click',async event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(opening)return;opening=true;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){location.assign(stage.href);return}
  const rect=stage.getBoundingClientRect();
  const cover=document.createElement('div');
  Object.assign(cover.style,{position:'fixed',inset:'0',background:'#061526',zIndex:'100',pointerEvents:'auto'});
  cover.setAttribute('aria-hidden','true');document.body.appendChild(cover);
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  try{await cover.animate([{clipPath:`circle(0px at ${x}px ${y}px)`},{clipPath:`circle(${radius}px at ${x}px ${y}px)`}],{duration:700,easing:'cubic-bezier(.22,.65,.2,1)',fill:'forwards'}).finished}catch{}
  location.assign(stage.href);
 }));
})();
