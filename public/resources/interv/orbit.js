/* Existing painted competencies orbit as upright items; no new icon artwork. */
(()=>{
'use strict';
const items=[
 {name:'Vocabulary',comp:0,x:503,y:303,label:[415,346,178,48]},
 {name:'Comprehension',comp:3,x:700,y:438,label:[615,482,171,46]},
 {name:'Writing',comp:4,x:700,y:636,label:[618,680,162,47]},
 {name:'Review',comp:5,x:503,y:757,label:[431,802,145,47]},
 {name:'Inference',comp:2,x:309,y:636,label:[231,680,150,46]},
 {name:'Fluency',comp:1,x:309,y:438,label:[233,482,150,45]}
];
function position(index,step){const progress=((index+step)%6+6)%6,i=Math.floor(progress),t=progress-i;const p0=items[(i+5)%6],p1=items[i],p2=items[(i+1)%6],p3=items[(i+2)%6];const spline=axis=>.5*(2*p1[axis]+(-p0[axis]+p2[axis])*t+(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*t*t+(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*t*t*t);return {x:spline('x'),y:spline('y')}}
function mount(board,onChoose){
 const ns='http://www.w3.org/2000/svg',make=tag=>document.createElementNS(ns,tag),svg=make('svg');svg.classList.add('interv-competency-orbit');svg.setAttribute('viewBox','0 0 1448 1086');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-label','Clockwise competency wheel');const defs=make('defs');svg.append(defs);const groups=[];let frame=0,disposed=false;
 items.forEach((item,index)=>{const group=make('g');group.classList.add('interv-orbit-item');group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label','Open '+item.name);const clip=make('clipPath');clip.id='interv-orbit-medallion-'+index;clip.setAttribute('clipPathUnits','userSpaceOnUse');const circle=make('circle');circle.setAttribute('cx',item.x);circle.setAttribute('cy',item.y);circle.setAttribute('r','78');clip.append(circle);const label=make('rect');for(const [key,value] of Object.entries({x:item.label[0],y:item.label[1],width:item.label[2],height:item.label[3],rx:21}))label.setAttribute(key,String(value));clip.append(label);defs.append(clip);const image=make('image');image.setAttribute('href','UI%20and%20owl/interv%20file/1.png');image.setAttribute('width','1448');image.setAttribute('height','1086');image.setAttribute('clip-path','url(#'+clip.id+')');image.setAttribute('aria-hidden','true');group.append(image);const choose=()=>onChoose(item);group.addEventListener('click',choose);group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose()}});groups.push(group);svg.append(group)});board.append(svg);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),start=performance.now();function tick(now){if(disposed||!board.isConnected)return;groups.forEach((group,index)=>{const p=position(index,reduced.matches?0:(now-start)/6000);group.setAttribute('transform',`translate(${p.x-items[index].x} ${p.y-items[index].y})`)});frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);
 return {destroy(){disposed=true;cancelAnimationFrame(frame);svg.remove()}};
}
globalThis.InterVOrbit=Object.freeze({items,position,mount});
})();
