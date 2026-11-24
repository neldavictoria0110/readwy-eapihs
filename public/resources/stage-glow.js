/* Pointer and keyboard focus illuminate each whole stage's alpha silhouette. */
(()=>{
 const stages=[...document.querySelectorAll('.stage')];
 const pieces=[...document.querySelectorAll('.map-piece')];
 stages.forEach((stage,index)=>{
  const update=()=>pieces[index]?.classList.toggle('is-highlighted',stage.matches(':hover')||document.activeElement===stage);
  for(const event of ['pointerenter','pointerleave','focus','blur'])stage.addEventListener(event,update);
 });
})();
