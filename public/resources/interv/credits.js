/* Hint credits never read or write InterV answer scores. */
(()=>{
'use strict';
function createWallet(storage,owner){
 const key='readwy-hint-credits-v1-'+encodeURIComponent(String(owner));
 function read(){try{const raw=JSON.parse(storage.getItem(key)||'{}');return {balance:Number.isSafeInteger(raw.balance)&&raw.balance>=0?raw.balance:0,wins:raw.wins&&typeof raw.wins==='object'?raw.wins:{},hints:raw.hints&&typeof raw.hints==='object'?raw.hints:{}}}catch{return {balance:0,wins:{},hints:{}}}}
 function write(state){try{storage.setItem(key,JSON.stringify(state));return true}catch{return false}}
 const own=(obj,id)=>Object.prototype.hasOwnProperty.call(obj,id);
 return Object.freeze({balance:()=>read().balance,hasHint:id=>own(read().hints,String(id)),
  awardWin(id){if(typeof id!=='string'||!id||id.length>200)return false;const s=read();if(own(s.wins,id)||s.balance===Number.MAX_SAFE_INTEGER)return false;s.wins[id]=true;s.balance++;return write(s)},
  buyHint(id){if(typeof id!=='string'||!id||id.length>200)return {ok:false,error:'This hint could not be identified.'};const s=read();if(own(s.hints,id))return {ok:true,charged:false};if(s.balance<1)return {ok:false,error:'You need 1 hint credit. Win a Playlab round to earn one, or continue answering without a hint.'};s.balance--;s.hints[id]=true;if(!write(s))return {ok:false,error:'Your hint credit could not be saved. No hint was purchased. Check browser storage and try again.'};return {ok:true,charged:true}}
 });
}
globalThis.ReadwyHintCredits=Object.freeze({createWallet});
})();
