(()=>{
 const subjects=new Set(['Filipino','Mathematics']);
 window.openReadwySubjectAssessment=function(subject){
  if(!subjects.has(subject))return;
  const status=document.getElementById('subjectStatus');
  let profile;
  try{profile=JSON.parse(localStorage.getItem('READwy_new_2026_local_user')||'null')}
  catch(error){console.error('READwy student profile could not be read.',error);if(status)status.textContent='Sign in again before starting this assessment.';return}
  if(!window.__readwyAuthEntered||profile?.role!=='student'){
   if(status)status.textContent='Sign in as a student before starting this assessment.';
   return
  }
  if(![7,8,9,10].includes(Number(profile.grade))){
   if(status)status.textContent='Mathematics and Filipino assessments are currently available for Grades 7–10.';
   return
  }
  try{sessionStorage.setItem('readwy-subject-assessment-v1',subject)}
  catch(error){console.error('READwy subject assessment could not be prepared.',error);if(status)status.textContent='The assessment could not be opened. Please try again.';return}
  if(status)status.textContent=`Opening your ${subject} assessment…`;
  const target=new URL(location.href);
  target.search='';
  target.searchParams.set('view','application');
  target.hash='';
  location.assign(target.href)
 }
})();
