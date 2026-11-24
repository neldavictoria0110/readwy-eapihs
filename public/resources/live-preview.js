/* The bundled local preview emits changes over SSE. Production/file pages opt out. */
(()=>{
 if(!['localhost','127.0.0.1'].includes(location.hostname)||location.port!=='4173'||typeof EventSource==='undefined')return;
 const events=new EventSource('/__readwy/live');let refreshing=false;
 events.addEventListener('change',event=>{
  let files;try{files=JSON.parse(event.data)}catch{return}
  if(!Array.isArray(files)||!files.length)return;
  if(files.every(file=>file.endsWith('.css'))){
   for(const link of document.querySelectorAll('link[rel=stylesheet]')){
    const url=new URL(link.href);if(!files.includes(decodeURIComponent(url.pathname).replace(/^\//,'')))continue;
    url.searchParams.set('updated',Date.now());const next=link.cloneNode();next.href=url.href;next.onload=()=>link.remove();link.after(next);
   }
   return;
  }
  if(refreshing)return;refreshing=true;rememberReadwyView();location.reload();
 });
})();
