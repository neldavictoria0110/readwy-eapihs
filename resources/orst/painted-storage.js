/* Local-only, attempt-addressed audio. No cross-device synchronization is implied. */
function orstAudioDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('readwy-orst-audio-v1',2);request.onupgradeneeded=()=>{const db=request.result;for(const name of ['recordings','metadata'])if(!db.objectStoreNames.contains(name))db.createObjectStore(name)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function orstAudioRead(key){const db=await orstAudioDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(['recordings','metadata']),a=tx.objectStore('recordings').get(key),b=tx.objectStore('metadata').get(key);tx.oncomplete=()=>resolve({blob:a.result,meta:b.result});tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
async function orstAudioCommit(key,blob,meta,previousDraft){
 const db=await orstAudioDB();try{await new Promise((resolve,reject)=>{
  const tx=db.transaction(['recordings','metadata'],'readwrite'),audio=tx.objectStore('recordings'),metadata=tx.objectStore('metadata'),oldAudio=audio.get(key),oldMeta=metadata.get(key);
  oldAudio.onsuccess=()=>{if(oldAudio.result){const id=previousDraft?.recordingId||'legacy',archive=key+'_audio_'+id;audio.put(oldAudio.result,archive);metadata.put({...previousDraft,archived:true},archive)}};
  const archive=key+'_audio_'+meta.recordingId;audio.put(blob,archive);metadata.put(meta,archive);
  // Queue pointer updates after both reads, preserving the old attempt before replacement.
  oldMeta.onsuccess=()=>{audio.put(blob,key);metadata.put(meta,key)};
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Recording storage aborted'));
 })}finally{db.close()}
}
async function orstAudioRemoveCurrent(key,id){const db=await orstAudioDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction(['recordings','metadata'],'readwrite'),audio=tx.objectStore('recordings'),metadata=tx.objectStore('metadata'),request=metadata.get(key);request.onsuccess=()=>{if(!request.result||request.result.recordingId===id){audio.delete(key);metadata.delete(key)}audio.delete(key+'_audio_'+id);metadata.delete(key+'_audio_'+id)};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
