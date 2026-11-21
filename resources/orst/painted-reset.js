/* User-requested one-time reset: ORST data only; accounts, GST and artwork are retained. */
const orstDataReset={pending:true,promise:null};
async function orstResetOldAssessmentData(){
 const marker=STORE+'orst_teacher_reset_v1';
 try{
  if(localStorage.getItem(marker)==='done')return;
  const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(STORE)&&/^(orst(?:_|-)|oral_)/i.test(key.slice(STORE.length)))keys.push(key)}
  for(const key of keys)localStorage.removeItem(key);
  const db=await orstAudioDB();try{await new Promise((resolve,reject)=>{const names=Array.from(db.objectStoreNames);if(!names.length){resolve();return}const tx=db.transaction(names,'readwrite');for(const name of names)tx.objectStore(name).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}
  orstReleasePlayer();orstCapture.blob=null;orstPaint.draft=orstNewDraft();orstPaint.hasChosenPassage=false;orstPaint.stage=1;orstPaint.passage=0;orstPaint.question=0;orstTeacher.active=false;localStorage.setItem(marker,'done');
 }catch{orstPaint.message='Old ORST data could not be cleared. Enable browser storage and reload.'}finally{orstDataReset.pending=false;if(document.querySelector('.orst-painted-screen')){orstPaint.draft=orstLoadDraft();renderORSTPainted()}}
}
function orstBeginDataReset(){orstDataReset.promise=orstResetOldAssessmentData()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',orstBeginDataReset,{once:true});else orstBeginDataReset();
