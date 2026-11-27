/* The complete supplied SRA document is embedded in the sole index.html. */
function renderSRA(){
 page='work';activeModule='sra';nav.innerHTML='';
 stopOwlFlight();stopWelcomeWandering();owl.style.display='none';
 app.innerHTML='<section class="sra-express-screen" aria-label="READwy Reading Lab"><iframe class="sra-express-frame" title="READwy Reading Lab — complete reading journey" allow="fullscreen" allowfullscreen></iframe><button class="sra-express-journey" type="button">← Journey map</button></section>';
 const frame=app.querySelector('.sra-express-frame');
 frame.srcdoc=JSON.parse(document.getElementById('sra-express-document').textContent);
 frame.addEventListener('load',()=>frame.contentDocument?.getElementById('stage')?.focus({preventScroll:true}),{once:true});
 app.querySelector('.sra-express-journey').addEventListener('click',()=>go('map'));
 readwySraFit();
}
/* Landscape phones: the Reading Lab is drawn at a 1200 px design width and scaled to the screen, so every
   screen (journey, station, reading, quiz, placement, writing) fits without scrolling, as on a laptop.
   Portrait phones, tablets and computers are unchanged. */
const READWY_SRA_DESIGN_WIDTH=1200;
function readwySraFit(){
 if(typeof document==='undefined'||!document.querySelector)return;
 const screen=document.querySelector('.sra-express-screen'),frame=screen&&screen.querySelector('.sra-express-frame');
 if(!frame||!frame.style)return;
 const w=screen.clientWidth,h=screen.clientHeight;
 if(!(w>h&&h<=500&&w<READWY_SRA_DESIGN_WIDTH&&h>0)){if(frame.style.transform)frame.removeAttribute('style');return}
 const scale=w/READWY_SRA_DESIGN_WIDTH;
 frame.style.cssText=`position:absolute;left:0;top:0;width:${READWY_SRA_DESIGN_WIDTH}px;height:${Math.ceil(h/scale)}px;transform:scale(${scale});transform-origin:0 0`;
}
if(typeof addEventListener==='function'&&!globalThis.__readwySraFit){
 globalThis.__readwySraFit=true;
 let fitTimer=0;const refit=()=>{clearTimeout(fitTimer);fitTimer=setTimeout(readwySraFit,60)};
 addEventListener('resize',refit);addEventListener('orientationchange',refit);
 if(globalThis.visualViewport)globalThis.visualViewport.addEventListener('resize',refit);
}
