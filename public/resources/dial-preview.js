/* Local visual demo: 0110 opens the dial. */
function renderDialPreview(){
  app.innerHTML=`<section class="dial-preview" aria-label="Combination dial preview"><button type="button" class="dial-fullscreen" data-fullscreen>Full screen ⛶</button><p class="dial-eyebrow">READwy · A little mystery</p><p>Type or tap the code <strong>0110</strong>.</p><div class="dial-stage"><span class="dial-pointer" aria-hidden="true">▼</span><div class="dial" role="img" aria-label="Combination dial">${Array.from({length:10},(_,n)=>`<span class="dial-number" style="--n:${n}">${n}</span>`).join('')}<span class="dial-hub" aria-hidden="true">✦</span></div></div><output class="dial-code" aria-live="polite">— — — —</output><p class="dial-status" role="status">Your story is waiting.</p><div class="dial-keypad">${Array.from({length:10},(_,n)=>`<button type="button" data-digit="${n}">${n}</button>`).join('')}</div><div class="dial-actions"><button type="button" data-reset>Reset</button><button type="button" data-continue>Continue to login →</button></div></section>`;
  const screen=app.querySelector('.dial-preview'),dial=screen.querySelector('.dial');
  let code='',angle=0,unlocked=false;
  const status=screen.querySelector('.dial-status'),output=screen.querySelector('.dial-code');
  dial.turnTo=n=>{angle+=((n*36-angle)%360+360)%360;dial.style.transform=`rotate(${-angle}deg)`};
  dial.reset=()=>{code='';unlocked=false;angle=0;dial.style.transform='rotate(0deg)';screen.classList.remove('is-unlocked');output.textContent='— — — —';status.textContent='Your story is waiting.'};
  const api={check:async value=>value==='0110'};
  async function enterDigit(digit){
    if(unlocked||code.length===4)return;
    dial.turnTo(+digit);code+=digit;
    output.textContent=code.padEnd(4,'—').split('').join(' ');
    if(code.length<4)return;
    const ok=await api.check(code);
    if(!screen.isConnected)return;
    if(ok){unlocked=true;screen.classList.add('is-unlocked');status.textContent='Unlocked! Your next chapter awaits.'}
    else{dial.reset();status.textContent='Try again — the preview code is 0110.'}
  }
  screen.querySelectorAll('[data-digit]').forEach(button=>button.onclick=()=>enterDigit(button.dataset.digit));
  screen.querySelector('[data-fullscreen]').onclick=async()=>{
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }catch{status.textContent='Use your browser’s full screen option to expand the preview.'}
  };
  screen.querySelector('[data-reset]').onclick=()=>dial.reset();
  screen.querySelector('[data-continue]').onclick=()=>go('login');
  // Replace the previous preview listener when this screen is opened again.
  window.readwyDialController?.abort();
  const controller=new AbortController();window.readwyDialController=controller;
  addEventListener('keydown',e=>{
    if(!screen.isConnected){controller.abort();return}
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||!/^\d$/.test(e.key))return;
    e.preventDefault();enterDigit(e.key);
  },{signal:controller.signal});
}
