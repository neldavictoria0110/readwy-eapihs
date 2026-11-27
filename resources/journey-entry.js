/* Launch the program assigned to a stage on the portrait learning map. */
window.addEventListener('load',()=>{
 const requested=new URLSearchParams(location.search).get('journeyModule');
 const programs={gst:'gst',orst:'orst',wst:'wst',srst:'wst',aral:'aral',interv:'interv',sra:'sra',reports:'reports'};
 if(!Object.prototype.hasOwnProperty.call(programs,requested))return;
 // Journey order and score-based placement (resources/journey-gate.js): a locked stage returns to the map.
 const gate=window.readwyJourneyGate?.allows(programs[requested]);
 if(gate&&!gate.ok){
  try{sessionStorage.setItem('readwy-journey-gate-message',gate.message)}catch{}
  location.replace('index.html?view=map');
  return;
 }
 // Programs use the landscape application; their map buttons return to the portrait map.
 const originalGo=go;
 go=function(destination){
  if(destination==='map'||destination==='journey'){readwyGo('index.html?view=map');return}
  return originalGo(destination);
 };
 const enter=async()=>{
  if(navigationBusy){setTimeout(enter,80);return}
  // Keypass enters directly after the new guidance/morph flow; skip the old map portal.
  try{
   if(programs[requested]==='gst')openGSTBook();
   else await openModule(programs[requested]);
   await Promise.race([
    Promise.all([...app.querySelectorAll('img')].map(image=>image.decode().catch(()=>{}))),
    new Promise(resolve=>setTimeout(resolve,programs[requested]==='aral'?600:2500))
   ]);
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  }finally{
   window.journeyProgramReady=true;
   if(new URLSearchParams(location.search).get('morphHold')!=='1'){
    document.documentElement.classList.add('program-arrival');
    document.documentElement.classList.remove('program-loading');
   }
  }
 };
 enter();
},{once:true});

