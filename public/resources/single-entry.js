/* Every screen is embedded in index.html; routes select a view without extra HTML files. */
(()=>{
 const pages=JSON.parse(document.getElementById('readwy-page-sources').textContent);
 window.readwyPageSources=pages;
 window.readwyDeveloperAuthSource=pages.train||'';
 try{sessionStorage.setItem('readwyDeveloperAuthSource',window.readwyDeveloperAuthSource)}catch{}
 const query=new URLSearchParams(location.search);
 if(query.get('view')==='startup'){
  try{sessionStorage.removeItem('READwy_current_view_v1')}catch{}
 }
 const teacherDeveloperRoute=query.get('journeyModule')==='reports'&&(()=>{
  try{
   const user=JSON.parse(localStorage.getItem('READwy_new_2026_local_user')||'null');
   return user?.role==='teacher';
  }catch{return false}
 })();
 if(teacherDeveloperRoute){
  try{sessionStorage.removeItem('READwy_current_view_v1')}catch{}
  history.replaceState(null,'',`${location.pathname}?view=teacher-preview${location.hash}`);
 }
 let requested=teacherDeveloperRoute?'teacher-preview':query.get('view');
 // When a subject has already opened, keep a reload/duplicate launch on the journey.
 // The old sign-in address can otherwise reappear during the animated hand-off on iOS.
 try{
  const signedIn=JSON.parse(localStorage.getItem('READwy_new_2026_local_user')||'null');
  const journeyOpened=sessionStorage.getItem('readwyJourneyOpened')==='1';
  if(requested==='train'&&journeyOpened&&signedIn){
   requested='map';
   history.replaceState(null,'',`${location.pathname}?view=map${location.hash}`);
  }
 }catch{}
 const program=!teacherDeveloperRoute&&/^(gst|orst|wst|srst|aral|interv|sra|reports)$/.test(query.get('journeyModule')||'');
 const key=program||(requested==='startup'||requested==='launch'||requested==='login')?'application':Object.prototype.hasOwnProperty.call(pages,requested)?requested:'application';
 document.open();document.write(pages[key]);document.close();
 })();
