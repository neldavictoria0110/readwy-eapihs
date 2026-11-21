/* InterV objective writing rubric.
   Five analytic criteria, each scored 1–4 (Beginning, Developing, Proficient, Advanced), adapted from the
   6+1 Trait Writing model (ideas, organization, word choice, sentence fluency, conventions), common analytic
   rubrics for text-based writing (claim/evidence/elaboration), and DepEd analytic scoring practice.
   Every score is computed from countable features of the response so the same text always gets the same score.
   Raw score /20 → percentage → DepEd transmuted grade (DO 8, s. 2015) → descriptor. */
const IV_RUBRIC={
 levels:['','Beginning','Developing','Proficient','Advanced'],
 criteria:[
  {key:'content',name:'Content & Task Completion',desc:'Answers the prompt fully: required length, target words, and key ideas.'},
  {key:'evidence',name:'Evidence & Elaboration',desc:'Supports ideas with reasons, examples, or text evidence in the writer’s own words.'},
  {key:'organization',name:'Organization & Coherence',desc:'Clear topic sentence, logical order, transitions, and a concluding sentence.'},
  {key:'language',name:'Language & Style',desc:'Varied sentences, precise and varied vocabulary, appropriate register.'},
  {key:'conventions',name:'Conventions',desc:'Capitalization, end punctuation, spacing, and sentence boundaries.'}
 ],
 minWords:{7:50,8:70,9:90,10:110,11:130,12:150},
 minSentences:{7:4,8:5,9:5,10:6,11:6,12:7}
};
const IV_TRANSITIONS=['first','second','third','next','then','after that','afterward','finally','lastly','also','in addition','additionally','moreover','furthermore','besides','however','but','although','though','on the other hand','in contrast','nevertheless','nonetheless','yet','instead','whereas','while','because','since','therefore','thus','consequently','as a result','so','hence','for example','for instance','such as','in fact','similarly','likewise','in conclusion','to conclude','overall','in summary','to sum up','in short','meanwhile','later','eventually','when','before','during','despite'];
const IV_EVIDENCE=['because','since','for example','for instance','such as','according to','the text','the passage','the story','the author','the writer','the article','the source','the data','the study','the survey','this shows','this suggests','this means','this proves','evidence','states that','says that','shows that','explains that','as shown','based on','in the text','clue'];
const IV_CONCLUDE=['in conclusion','to conclude','therefore','thus','overall','in summary','to sum up','in short','finally','as a result','this shows','this proves','that is why','for these reasons','clearly','ultimately'];
const IV_INFORMAL=['gonna','wanna','kinda','sorta','stuff','things like that','lol','omg','totally','basically','a lot of','lots of','tons of','super ','really really','gotta','ya','u ','ur '];
const IV_STOP=new Set('the a an and or but of to in on at for is are was were be been it its this that these those they their them she he her his him have has had with from as by can may will would should not no so if than then there here i you we our your my me us do does did just very also into out up about over more most some any all'.split(' '));

function ivRubricTokens(text){return (String(text).toLowerCase().match(/[a-zà-ÿñ][a-zà-ÿñ'’-]*|\d+(?:[.,]\d+)*%?/g)||[]).map(w=>w.replace(/[’]/g,"'"))}
function ivRubricSentences(text){return String(text).replace(/\s+/g,' ').trim().split(/(?<=[.!?…]["”’)]?)\s+(?=["“‘(]?[A-Za-z0-9À-ÿ])/).map(s=>s.trim()).filter(s=>ivRubricTokens(s).length>=3)}
function ivRubricHas(lower,words,entry){
 // entry: "a|b" alternatives; punctuation entries are matched literally; words match whole words or word stems.
 return String(entry).split('|').some(alt=>{alt=alt.toLowerCase();if(!/[a-z0-9]/.test(alt))return lower.includes(alt);
  if(alt.includes(' '))return lower.includes(alt);
  return words.some(w=>w===alt||(alt.length>=4&&w.startsWith(alt))||(alt.length>=5&&w.startsWith(alt.slice(0,-1))))})}
function ivRubricAffix(words,entry){const a=String(entry).toLowerCase();
 return words.some(w=>w.length>=a.length+3&&(w.startsWith(a)||w.endsWith(a)))}
function ivRubricCopyRatio(text,src){
 if(!src)return 0;const a=ivRubricTokens(text),b=ivRubricTokens(src);if(a.length<6||b.length<6)return 0;
 const grams=new Set();for(let i=0;i+5<=b.length;i++)grams.add(b.slice(i,i+5).join(' '));
 let hit=0,total=0;for(let i=0;i+5<=a.length;i++){total++;if(grams.has(a.slice(i,i+5).join(' ')))hit++}
 return total?hit/total:0}
function ivTransmute(raw){const t=raw>=60?75+(raw-60)/1.6:60+raw/4;return Math.min(100,Math.round(t))}
function ivDescriptor(g){return g>=90?'Outstanding':g>=85?'Very Satisfactory':g>=80?'Satisfactory':g>=75?'Fairly Satisfactory':'Did Not Meet Expectations'}
function ivRubricLimits(w,grade){
 const base=IV_RUBRIC.minWords[grade]||80;let min=w.m||base;if(w.rewrite)min=Math.round(min*0.55);
 const sent=w.rewrite?3:(w.s||IV_RUBRIC.minSentences[grade]||5);return {min,sent}}

/* Live checklist shown while the learner writes (same measures the scorer uses). */
function ivRubricChecklist(text,w,grade){
 const lower=String(text).toLowerCase(),words=ivRubricTokens(text),sents=ivRubricSentences(text),{min,sent}=ivRubricLimits(w,grade);
 const items=[{label:`At least ${min} words`,done:words.length>=min,now:words.length+' words'},{label:`At least ${sent} complete sentences`,done:sents.length>=sent,now:sents.length+' sentences'}];
 if(w.u&&w.u.length){const need=Math.min(w.need||Math.min(3,w.u.length),w.u.length),hit=w.u.filter(e=>w.morph?String(e).split('|').some(x=>ivRubricAffix(words,x)):ivRubricHas(lower,words,e)).length;items.push({label:`Use ${need} of the required words/elements`,done:hit>=need,now:hit+' used'})}
 if(w.e)items.push({label:'Support with evidence (because, for example, the text says…)',done:IV_EVIDENCE.filter(m=>lower.includes(m)).length>=2,now:''});
 if(w.quote)items.push({label:'Quote the text (use quotation marks)',done:/["“”]/.test(text),now:''});
 const n=w.num||w.nums;if(n)items.push({label:`Use at least ${n} numbers/dates from the source`,done:(text.match(/\d+/g)||[]).length>=n,now:''});
 return items}

function ivScoreWriting(text,w,grade){
 const raw=String(text||'').trim(),lower=raw.toLowerCase(),words=ivRubricTokens(raw),sents=ivRubricSentences(raw),{min,sent}=ivRubricLimits(w,grade);
 const notes={content:[],evidence:[],organization:[],language:[],conventions:[]},flags=[];
 const clamp=v=>Math.max(1,Math.min(4,Math.round(v)));
 /* 1. Content & task completion */
 const parts=[];const lr=words.length/min;parts.push(lr>=1?1:lr>=.75?.7:lr>=.5?.45:.2);
 if(lr<1)notes.content.push(`Length: ${words.length}/${min} words.`);else notes.content.push(`Meets the length goal (${words.length} words).`);
 if(w.u&&w.u.length){const need=Math.min(w.need||Math.min(3,w.u.length),w.u.length);const used=w.u.filter(e=>w.morph?String(e).split('|').some(x=>ivRubricAffix(words,x)):ivRubricHas(lower,words,e));
  parts.push(Math.min(1,used.length/need));notes.content.push(used.length>=need?`Uses ${used.length} required words/elements.`:`Uses ${used.length} of ${need} required words/elements.`)}
 if(w.k&&w.k.length){const hit=w.k.filter(e=>ivRubricHas(lower,words,e)).length,cov=hit/w.k.length;parts.push(Math.min(1,cov/0.6));notes.content.push(`Key ideas covered: ${hit} of ${w.k.length}.`)}
 const n=w.num||w.nums;if(n){const c=(raw.match(/\d+/g)||[]).length;parts.push(Math.min(1,c/n));if(c<n)notes.content.push(`Include at least ${n} numbers from the source.`)}
 if(w.sum||w.objective){const op=['i think','i believe','in my opinion','i feel','the best','the worst','i like','i love'].filter(m=>lower.includes(m)).length;if(op){parts.push(.4);notes.content.push('A summary should not include personal opinions.')}}
 let content=1+3*(parts.reduce((a,b)=>a+b,0)/parts.length);if(lr<.5)content=Math.min(content,2);
 /* 2. Evidence & elaboration */
 const markers=IV_EVIDENCE.filter(m=>lower.includes(m)).length,quotes=(raw.match(/["“][^"”]{3,}["”]/g)||[]).length,avgLen=sents.length?words.length/sents.length:words.length;
 let evidence=w.e?(markers>=3?4:markers===2?3:markers===1?2:1):(markers>=2?4:markers===1?3:avgLen>=9?3:2);
 if(w.quote&&!quotes){evidence=Math.min(evidence,3);notes.evidence.push('Add a direct quotation from the text.')}
 notes.evidence.push(markers?`Uses ${markers} evidence/reasoning signal${markers>1?'s':''}.`:'Add reasons or evidence (because, for example, the text says…).');
 const copy=ivRubricCopyRatio(raw,w.src||'');
 if(copy>.6&&w.rewrite){content=Math.min(content,2);flags.push('Too close to the original wording; restate it in your own words.')}
 else if(copy>.5&&!w.rewrite){evidence=Math.min(evidence,2);flags.push('Much of the response copies the source; explain in your own words.')}
 /* 3. Organization & coherence */
 let org=0;if(sents.length>=sent)org+=1;else if(sents.length>=Math.ceil(sent/2))org+=.5;
 const trans=IV_TRANSITIONS.filter(t=>new RegExp('(^|[^a-z])'+t.replace(/ /g,'\\s+')+'([^a-z]|$)').test(lower));
 org+=trans.length>=3?1:trans.length>=1?.5:0;
 const first=(sents[0]||'').toLowerCase(),last=(sents[sents.length-1]||'').toLowerCase();
 const keyList=[...(w.k||[]),...(w.u||[])].flatMap(e=>String(e).split('|')).filter(e=>/[a-z]/.test(e));
 const firstWords=ivRubricTokens(first);
 if(firstWords.length>=6&&(!keyList.length||keyList.some(k=>first.includes(k.toLowerCase()))))org+=1;else if(firstWords.length>=6)org+=.5;
 if(sents.length>=3&&(IV_CONCLUDE.some(c=>last.includes(c))||firstWords.filter(x=>x.length>4&&!IV_STOP.has(x)).some(x=>last.includes(x))))org+=1;
 const organization=clamp(1+org*0.75);
 notes.organization.push(`${sents.length}/${sent} sentences; transitions used: ${trans.length?trans.slice(0,4).join(', '):'none'}.`);
 if(org<3)notes.organization.push('Begin with a clear topic sentence and end with a concluding sentence.');
 /* 4. Language & style */
 const sample=words.slice(0,120),ttr=sample.length?new Set(sample).size/sample.length:0;
 const lens=sents.map(s=>ivRubricTokens(s).length),mean=lens.reduce((a,b)=>a+b,0)/(lens.length||1),sd=Math.sqrt(lens.reduce((a,b)=>a+(b-mean)**2,0)/(lens.length||1));
 const starters=sents.map(s=>ivRubricTokens(s)[0]),startRatio=starters.length?new Set(starters).size/starters.length:0;
 const content_words=words.filter(x=>!IV_STOP.has(x)&&/[a-z]/.test(x)),avgWord=content_words.reduce((a,b)=>a+b.length,0)/(content_words.length||1),thr=5.2+(grade-7)*0.12;
 let lang=0;lang+=ttr>=.6?1:ttr>=.5?.5:0;lang+=sents.length<2?0:sd>=4?1:sd>=2.5?.5:0;lang+=startRatio>=.75?1:startRatio>=.5?.5:0;lang+=avgWord>=thr?1:avgWord>=thr-.5?.5:0;
 const informal=IV_INFORMAL.filter(m=>(' '+lower+' ').includes(' '+m.trim()+' ')||lower.includes(m.trim()+' ')).length,contractions=(lower.match(/\b\w+'(t|re|ll|ve|d|m)\b/g)||[]).length;
 if(w.formal||grade>=11){lang-=Math.min(1.5,informal*.5+(w.formal?contractions*.25:0));if(informal)notes.language.push('Avoid informal words in academic writing.')}
 let language=clamp(1+lang*0.75);if(lr<.5){language=Math.min(language,2);notes.language.push('Write more to show your range of language.')}
 notes.language.push(`Word variety ${(ttr*100|0)}%; sentence-length variety ${sd.toFixed(1)}; varied sentence openings ${(startRatio*100|0)}%.`);
 /* 5. Conventions */
 let err=0;const conv=[];
 sents.forEach(s=>{const c=s.replace(/^["“‘(]+/,'');if(c&&/[a-z]/.test(c[0]))err++;});
 if(raw&&!/[.!?…]["”’)]?$/.test(raw))err++,conv.push('End your last sentence with punctuation.');
 const lowerI=(raw.match(/(^|\s)i(\s|'|’|$)/g)||[]).length;if(lowerI){err+=lowerI;conv.push('Capitalize “I”.')}
 const dbl=(raw.match(/\b(\w+)\s+\1\b/gi)||[]).filter(m=>!/^(had had|that that)$/i.test(m)).length;if(dbl){err+=dbl;conv.push('Remove repeated words.')}
 const nospace=(raw.match(/[a-z][.!?,;:][A-Za-z]{2,}/g)||[]).filter(m=>!/^[a-z]\.[a-z]/i.test(m)).length;if(nospace){err+=nospace;conv.push('Add a space after punctuation.')}
 const runons=lens.filter(l=>l>45).length;if(runons){err+=runons;conv.push('Break very long sentences into shorter ones.')}
 const multi=(raw.match(/[!?]{2,}/g)||[]).length;if(multi){err+=multi;conv.push('Use single end punctuation marks.')}
 if(sents.length&&sents.filter(s=>/[a-z]/.test(s.replace(/^["“‘(]+/,'')[0])).length)conv.unshift('Begin every sentence with a capital letter.');
 const rate=err/Math.max(1,sents.length),conventions=rate===0?4:rate<=.25?3:rate<=.6?2:1;
 notes.conventions.push(err?`${err} mechanics issue${err>1?'s':''} found.`:'No mechanics issues found.',...conv.slice(0,3));
 notes.conventions.push('Spelling is reviewed by your teacher.');
 const scores={content:clamp(content),evidence:clamp(evidence),organization,language,conventions};
 const total=Object.values(scores).reduce((a,b)=>a+b,0),pct=Math.round(total/20*100),transmuted=ivTransmute(pct);
 return {scores,total,pct,transmuted,descriptor:ivDescriptor(transmuted),words:words.length,sentences:sents.length,min,sent,notes,flags,at:new Date().toISOString(),version:1};
}
