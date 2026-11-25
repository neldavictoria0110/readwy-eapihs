/* The complete supplied SRA document is embedded in the sole index.html. */
function renderSRA(){
 page='work';activeModule='sra';nav.innerHTML='';
 stopOwlFlight();stopWelcomeWandering();owl.style.display='none';
 app.innerHTML='<section class="sra-express-screen" aria-label="READwy Reading Lab"><iframe class="sra-express-frame" title="READwy Reading Lab — complete reading journey" allow="fullscreen" allowfullscreen></iframe><button class="sra-express-journey" type="button">← Journey map</button></section>';
 const frame=app.querySelector('.sra-express-frame');
 frame.srcdoc=JSON.parse(document.getElementById('sra-express-document').textContent);
 frame.addEventListener('load',()=>frame.contentDocument?.getElementById('stage')?.focus({preventScroll:true}),{once:true});
 app.querySelector('.sra-express-journey').addEventListener('click',()=>go('map'));
}
