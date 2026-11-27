/* Local student profile and accessible application preferences. */
function readwyAudioSettings(){return load('preferences',{})}
function readwyCanPlaySound(){return readwyAudioSettings().sound!==false}
function readwyVolume(){const p=readwyAudioSettings();return p.sound===false?0:Math.max(0,Math.min(1,Number(p.volume??.8)))}
function readwySpeechRate(){return Math.max(.6,Math.min(1.4,Number(readwyAudioSettings().speechRate??1)))}
function gstHome(){if(gstBook.busy)return;stopGSTOwlSpeech();gstBook.review=false;gstBook.index=-1;renderGSTBookSpread();positionGSTBook()}
applyPreferences=function(){
 const p=load('preferences',{});document.documentElement.dataset.theme=p.theme==='light'?'light':'dark';
 document.documentElement.classList.toggle('reduced-motion',!!p.reduceMotion);
 document.documentElement.style.setProperty('--reading-size',(p.readingSize||19)+'px');
 document.documentElement.style.setProperty('--reading-line-height',String(p.lineSpacing||1.55));
 document.documentElement.classList.toggle('reading-high-contrast',!!p.highContrast);
 document.querySelectorAll('audio,video').forEach(media=>{media.muted=p.sound===false;media.volume=readwyVolume()});
 if(p.sound===false)window.speechSynthesis?.cancel();
};
function preferenceSwitch(name,title,checked,detail){
 return `<div class="preference-row preference-switch-row"><label for="setting-${name}"><span class="preference-title">${title}</span><span class="preference-detail">${detail}</span></label><input class="preference-switch" id="setting-${name}" name="${name}" type="checkbox" role="switch" ${checked?'checked':''}></div>`;
}
function preferenceSlider(name,title,value,min,max,step,detail,unit=''){
 return `<div class="preference-row"><label for="setting-${name}"><span class="preference-title">${title}</span><output id="value-${name}" for="setting-${name}">${value}${unit}</output></label><input id="setting-${name}" name="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" oninput="document.getElementById('value-${name}').value=this.value+'${unit}'"><span class="preference-detail">${detail}</span></div>`;
}
renderSettings=function(){
 const p=load('preferences',{});
 const markup=`<form class="settings-form card" onsubmit="savePreferences(event)">
 ${preferenceSwitch('theme','Dark mode',p.theme!=='light','Slide to switch between light and dark.')}
 ${preferenceSlider('readingSize','Text size',p.readingSize||19,17,27,2,'Adjust the reading passages.',' px')}
 ${preferenceSlider('lineSpacing','Line spacing',p.lineSpacing||1.55,1.2,2,.05,'Give each line more room.','×')}
 ${preferenceSwitch('highContrast','Stronger text contrast',!!p.highContrast,'Darker ink for easier reading.')}
 ${preferenceSwitch('sound','Sound & narration',p.sound!==false,'Hear instructions and sound cues.')}
 ${preferenceSlider('volume','Volume',Math.round((p.volume??.8)*100),0,100,5,'Set a comfortable listening level.','%')}
 ${preferenceSlider('speechRate','Narration speed',p.speechRate||1,.6,1.4,.1,'Slow down or speed up spoken instructions.','×')}
 ${preferenceSwitch('reduceMotion','Gentle animations',!!p.reduceMotion,'Reduce page turns and decorative motion.')}
 <button class="btn" type="submit">Save Settings</button><button class="btn secondary" type="button" onclick="openGSTBook()">Back to Keypass</button><p role="status" id="settingsStatus"></p></form>`;
 const inBook=renderStudentPage('settings','Settings',markup);if(!inBook){page='settings';renderToolbar()}
};
savePreferences=function(event){
 event.preventDefault();const f=event.currentTarget;
 const p={...load('preferences',{}),theme:f.elements.theme.checked?'dark':'light',sound:f.elements.sound.checked,volume:Number(f.elements.volume.value)/100,reduceMotion:f.elements.reduceMotion.checked,readingSize:Number(f.elements.readingSize.value),lineSpacing:Number(f.elements.lineSpacing.value),highContrast:f.elements.highContrast.checked,speechRate:Number(f.elements.speechRate.value)};
 try{localStorage.setItem(STORE+'preferences',JSON.stringify(p));applyPreferences();document.getElementById('settingsStatus').textContent='Settings saved.'}catch{document.getElementById('settingsStatus').textContent='Unable to save settings. Browser storage may be full.'}
};
function studentProfileField(name,label,value,attrs=''){return `<label for="profile-${name}">${label}</label><input class="forminput" id="profile-${name}" name="${name}" value="${h(value||'')}" ${attrs}>`}
renderProfile=function(){
 const p=user||{};
 const inBook=renderStudentPage('profile','Student Profile',`<form class="settings-form card student-profile" onsubmit="saveProfile(event)"><div class="profile-photo-box">${p.photo?`<img id="studentPhoto" src="${h(p.photo)}" alt="Student profile photo">`:'<div class="photo-placeholder" id="studentPhoto">Your photo</div>'}<label for="profilePhoto">Upload photo</label><input id="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" onchange="uploadStudentPhoto(this)"><p id="photoStatus" role="status"></p></div>${studentProfileField('name','Full name (Surname, First name, M.I.)',p.name,'required maxlength="100" autocomplete="name"')}${studentProfileField('lrn','LRN',p.lrn,'inputmode="numeric" pattern="[0-9]{12}" maxlength="12"') }<label for="profile-grade">Grade</label><select class="forminput" id="profile-grade" name="grade">${[7,8,9,10,11,12].map(g=>`<option value="${g}" ${Number(p.grade||selectedGrade)===g?'selected':''}>Grade ${g}</option>`).join('')}</select>${studentProfileField('section','Section',p.section,'maxlength="80"')}${studentProfileField('teacherName','Name of Teacher',p.teacherName,'maxlength="100"')}${studentProfileField('email','DepEd Email',p.email,'type="email" autocomplete="email"')}<button class="btn" type="submit">Save Profile</button><button class="btn secondary" type="button" onclick="openGSTBook()">Back to Keypass</button><p id="profileStatus" role="status"></p></form>`);if(!inBook){page='profile';renderToolbar()}
};
function persistStudentProfile(profile){
 const profiles=load('studentProfiles',{});if(profile.email)profiles[profile.email.trim().toLowerCase()]=profile;
 const previous=localStorage.getItem(STORE+'studentProfiles');
 try{localStorage.setItem(STORE+'studentProfiles',JSON.stringify(profiles));localStorage.setItem(STORE+'user',JSON.stringify(profile))}catch(error){try{if(previous===null)localStorage.removeItem(STORE+'studentProfiles');else localStorage.setItem(STORE+'studentProfiles',previous)}catch{}throw error}
 user=profile;if([7,8,9,10,11,12].includes(Number(profile.grade)))selectedGrade=Number(profile.grade);
}
saveProfile=function(event){
 event.preventDefault();const f=event.currentTarget;if(!f.reportValidity())return;
 const profile={...(user||{}),role:'student',name:f.elements.name.value.trim(),lrn:f.elements.lrn.value.trim(),grade:Number(f.elements.grade.value),section:f.elements.section.value.trim(),teacherName:f.elements.teacherName.value.trim(),email:f.elements.email.value.trim().toLowerCase()};
 if(!profile.name){document.getElementById('profileStatus').textContent='Enter your full name.';return}
 try{persistStudentProfile(profile);document.getElementById('profileStatus').textContent='Profile saved.'}catch{document.getElementById('profileStatus').textContent='Unable to save. Browser storage may be full.'}
};
async function uploadStudentPhoto(input){
 const file=input.files[0],status=document.getElementById('photoStatus');if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){status.textContent='Choose a JPG, PNG, or WebP photo under 5 MB.';input.value='';return}
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const context=canvas.getContext('2d'),side=Math.min(image.naturalWidth,image.naturalHeight);
  context.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,256,256);
  const photo=canvas.toDataURL('image/jpeg',.85);persistStudentProfile({...user,photo});
  const preview=document.createElement('img');preview.id='studentPhoto';preview.alt='Student profile photo';preview.src=photo;document.getElementById('studentPhoto').replaceWith(preview);status.textContent='Photo saved.';
 }catch{status.textContent='Unable to save this photo. Try a different image or free browser storage.'}finally{URL.revokeObjectURL(url)}
}
document.addEventListener('play',event=>{
 const media=event.target;if(media instanceof HTMLMediaElement){media.muted=!readwyCanPlaySound();media.volume=readwyVolume()}
},true);
applyPreferences();
