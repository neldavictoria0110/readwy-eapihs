/* Local account/section linkage. Cross-device or tamper-resistant authorization needs a server. */
function readwySchoolAccounts(){const accounts=load('school_accounts_v1',[]);return Array.isArray(accounts)?accounts:[]}
function readwyAccountPublic(account){return {id:account.id,name:account.name,email:account.email,username:account.username,role:account.role,grade:account.grade,section:account.section,learningArea:account.learningArea,teacherName:account.teacherName,teacherId:account.teacherId,lrn:account.lrn}}
function readwyNormalizeSection(value){return String(value||'').trim().replace(/\s+/g,' ').toLowerCase()}
async function readwySecretHash(value,salt){const bytes=new TextEncoder().encode(value),key=await crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveBits']);const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:150000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,'0')).join('')}
async function readwyMakeSecret(value){const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));return {salt,hash:await readwySecretHash(value,salt)}}
async function readwyCheckSecret(value,secret){if(!secret?.hash||!Array.isArray(secret.salt))return false;return await readwySecretHash(value,secret.salt)===secret.hash}
function readwyAssignedTeachers(student=user){
 if(!student||student.role!=='student'||!student.section)return [];
 const accounts=readwySchoolAccounts(),grade=Number(student.grade),section=readwyNormalizeSection(student.section);
 return accounts.filter(t=>t.role==='teacher'&&(!student.teacherId||student.teacherId===t.id)&&(!student.teacherName||readwyNormalizeSection(student.teacherName)===readwyNormalizeSection(t.name))&&t.sections?.some(s=>Number(s.grade)===grade&&readwyNormalizeSection(s.section)===section)&&(!student.learningArea||t.learningArea===student.learningArea));
}
async function readwyValidateAssignedTeacher(code,student=user){
 const teachers=readwyAssignedTeachers(student);
 if(teachers.length!==1)return {ok:false,message:teachers.length?'More than one teacher is assigned. Ask the teacher to correct the section assignment.':'No assigned teacher found for this student’s grade and section.'};
 const teacher=teachers[0];if(!await readwyCheckSecret(code,teacher.codeSecret))return {ok:false,message:'The code does not match this section’s assigned teacher.'};
 return {ok:true,teacherId:teacher.id,teacherName:teacher.name,section:student.section,grade:Number(student.grade),validationMode:'local-browser'};
}
function readwyTeacherSections(){
 if(user?.role!=='teacher')return;
 const teacher=readwySchoolAccounts().find(a=>a.id===user.id&&a.role==='teacher');
 if(!teacher){showPageStatus('Register a teacher account first to set a code and assign sections.');return}
 activeModule='teacher-sections';
 workLayout('My Teaching Sections',`<p>Teacher: ${h(teacher.name)} · ${h(teacher.learningArea)}. Enter each section you handle. Your registered code will validate oral-reading counts for students in these sections on this browser.</p><form id="teacherSectionsForm" onsubmit="readwySaveTeacherSection(event)"><div class="row"><label>Grade <select name="grade" class="forminput">${[7,8,9,10].map(g=>`<option>${g}</option>`).join('')}</select></label><label>Section <input class="forminput" name="section" required maxlength="80"></label><button class="btn" type="submit">Add Section</button></div><p role="status" id="teacherSectionStatus"></p></form><div class="cards">${(teacher.sections||[]).map((s,i)=>`<div class="card">Grade ${Number(s.grade)} · ${h(s.section)} <button class="btn secondary" onclick="readwyRemoveTeacherSection(${i})">Remove Section</button></div>`).join('')}</div>`);
}
function readwySaveTeacherSection(event){
 event.preventDefault();const form=event.currentTarget,accounts=readwySchoolAccounts(),teacher=accounts.find(a=>a.id===user?.id&&a.role==='teacher');if(!teacher)return;
 const section=form.elements.section.value.trim(),grade=Number(form.elements.grade.value);if(!section||![7,8,9,10].includes(grade))return;
 const conflict=accounts.some(a=>a.role==='teacher'&&a.id!==teacher.id&&a.learningArea===teacher.learningArea&&a.sections?.some(s=>Number(s.grade)===grade&&readwyNormalizeSection(s.section)===readwyNormalizeSection(section)));
 if(conflict){document.getElementById('teacherSectionStatus').textContent='Another teacher already handles this grade/section in this learning area.';return}
 teacher.sections=teacher.sections||[];if(!teacher.sections.some(s=>Number(s.grade)===grade&&readwyNormalizeSection(s.section)===readwyNormalizeSection(section)))teacher.sections.push({grade,section});save('school_accounts_v1',accounts);readwyTeacherSections();
}
function readwyRemoveTeacherSection(index){const accounts=readwySchoolAccounts(),teacher=accounts.find(a=>a.id===user?.id&&a.role==='teacher');if(!teacher||!Number.isInteger(index)||!teacher.sections?.[index])return;teacher.sections.splice(index,1);save('school_accounts_v1',accounts);readwyTeacherSections()}
function readwyInstallTeacherAccounts(){
 const originalLogin=demoLogin,originalModule=modulePage,originalSignup=renderSignup;
 renderSignup=function(...args){const result=originalSignup(...args),code=document.getElementById('signupCode');if(code){code.type='password';code.autocomplete='new-password'}return result};
 submitSignupForm=async function(event,role){
  event.preventDefault();const form=event.currentTarget,status=form.querySelector('.signup-form-status');
  if(!form.checkValidity()){form.reportValidity();return}
  const value=name=>String(form.elements[name]?.value||'').trim();
  if(role==='student'&&!/^\d{12}$/.test(value('signupLrn'))){status.textContent='LRN must contain 12 digits.';return}
  const name=role==='teacher'?value('signupTeacherName'):[value('signupFirstName'),value('signupLastName')].join(' '),username=(role==='teacher'?name:value('signupEmail')).toLowerCase();
  const accounts=readwySchoolAccounts();if(accounts.some(a=>a.username===username)){status.textContent='This account is already registered. Please sign in.';return}
  if(role==='teacher'&&value('signupCode').length<4){status.textContent='Choose a teacher code of at least four characters.';return}
  const button=form.querySelector('[type=submit]');if(button)button.disabled=true;status.textContent='Creating your local account…';
  try{
   const account={id:crypto.randomUUID(),role,name,username,email:value('signupEmail'),grade:Number(value('signupGrade'))||7,section:value('signupSection'),learningArea:value('signupLearningArea'),lrn:value('signupLrn'),teacherName:role==='student'?value('signupTeacherName'):'',sections:[],passwordSecret:await readwyMakeSecret(value('signupPassword'))};
   if(role==='teacher')account.codeSecret=await readwyMakeSecret(value('signupCode'));
   accounts.push(account);save('school_accounts_v1',accounts);if(!readwySchoolAccounts().some(a=>a.id===account.id))throw new Error('Account storage failed');user=readwyAccountPublic(account);selectedGrade=user.grade;save('user',user);
   if(role==='teacher')readwyTeacherSections();else go('subject');
  }catch{status.textContent='Account could not be saved. Use a supported browser on HTTPS or localhost.';if(button)button.disabled=false}
 };
 demoLogin=async function(event){
  const login=document.getElementById('loginEmail')?.value.trim().toLowerCase(),account=readwySchoolAccounts().find(a=>a.username===login||a.email&&a.email.toLowerCase()===login);
  if(!account)return originalLogin(event);event.preventDefault();
  if(account.role!==authRole){setLoginStatus('Choose the account’s correct role.');return}
  try{if(!await readwyCheckSecret(document.getElementById('loginPassword').value,account.passwordSecret)){setLoginStatus('Password does not match.');return}}catch{setLoginStatus('Sign-in is unavailable in this browser.');return}
  user=readwyAccountPublic(account);selectedGrade=user.grade;save('user',user);if(user.role==='teacher')readwyTeacherSections();else go('subject');
 };
 modulePage=function(mod){if(mod==='teacher-sections')return readwyTeacherSections();const result=originalModule(mod);if(mod==='dashboard'&&user?.role==='teacher'){const root=app.querySelector('.workarea');if(root)root.insertAdjacentHTML('afterbegin','<p><button class="btn" onclick="readwyTeacherSections()">My Teaching Sections</button></p>')}return result};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',readwyInstallTeacherAccounts,{once:true});else readwyInstallTeacherAccounts();
