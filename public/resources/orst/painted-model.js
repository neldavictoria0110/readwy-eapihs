/* Passage content comes from the supplied grade documents; illustrative screen data is never loaded. */
const ORST_MISCUES=['Mispronunciation','Omission','Substitution','Insertion','Repetition','Transposition','Reversal'];
const ORST_REVIEWED_KEYS={
 'Anansi’s Web':['B','B','B','A','A','C'],
 'Amy’s Good Deed':['C','B','A','B','C','D','C'],
 'Dreams':['A','D','A','D','C','B','C','A'],
 'Lili the Lizard and Koko the Gecko':['D','C','B','B','A',['A','B'],['A','B'],['A','D'],'C','A'],
 'The Amazing World of Coral Reefs':[['C','D'],'D','B','C',['A','B'],'C','C','B','A',['A','B','C']],
 "Tesla's AI Robot Ready in September":[['A','B','C','D'],'D','C','A','D',['A','B'],'A','A','C',['A','B','C']],
 'Butuan Archeological Sites':['B','A',['B','C'],'B','C','A','D','A','B','A']
};
function orstPassages(grade=selectedGrade){
 const lines=SOURCE_DATA.orst[String(grade)]||[],starts=[];
 lines.forEach((s,i)=>{if(/^Learner[’']s Copy$/i.test(s.trim()))starts.push(i)});
 return starts.map((start,index)=>{
  const a=lines.slice(start,starts[index+1]??lines.length),q=a.findIndex(s=>/^Questions$/i.test(s.trim()));
  const title=a[3]||'Passage '+(index+1),raw=a.slice(4,q<0?a.length:q),notes=raw.findIndex(s=>/^(?:Reference|No\.? of Words|Number of words|Written by|SOURCE:)/i.test(s));
  const body=(notes<0?raw:raw.slice(0,notes)).map(s=>s.replace(/^\[\d+\]\s*/,'')),groups=[];
  for(const line of a.slice(q+1)){if(/^\s*\d+[.)]/.test(line))groups.push([line]);else if(groups.length)groups.at(-1).push(line)}
  const questions=groups.map(group=>{
   const text=group.join('\n'),matches=[...text.matchAll(/(?:^|[\t\n ]+)([a-d])[.)]\s+/gi)];
   const options=matches.map((m,i)=>({key:m[1].toUpperCase(),text:text.slice(m.index+m[0].length,matches[i+1]?.index??text.length).trim()})).sort((x,y)=>x.key.localeCompare(y.key));
   return {text:text.slice(0,matches[0]?.index??text.length).replace(/^\s*\d+[.)]\s*/,''),options};
  });
  const stated=raw.map(s=>s.match(/^(?:No\.? of Words|Number of words):\s*(\d+)/i)).find(Boolean);
  const bodyWords=body.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return {title,body,questions,bodyWords,declaredWords:stated?Number(stated[1]):null,wordCountMismatch:!!stated&&Number(stated[1])!==bodyWords,words:stated?Number(stated[1]):bodyWords,key:ORST_REVIEWED_KEYS[title]||[]};
 });
}
function orstNewDraft(){return {recorded:false,seconds:0,miscues:[0,0,0,0,0,0,0],miscueSchema:7,reviewed:false,analysisStatus:'not-started',transcript:'',pronunciationReviewed:false,manualReview:false,answers:{},completed:false}}
function orstDraftKey(){return orstRecordKey()+'_draft_'+selectedGrade+'_'+orstPaint.passage}
function orstLoadDraft(){return orstNormalizeDraft({...orstNewDraft(),...load(orstDraftKey(),{})})}
function orstSaveDraft(){if(typeof orstCapture!=='undefined'&&(orstPaint.recording||orstCapture.starting||orstCapture.finalizing||orstPaint.draft?.sessionOnly))return;save(orstDraftKey(),orstPaint.draft)}
function orstNormalizeDraft(draft){
 if(!draft)return orstNewDraft();
 if(draft.miscues?.length===6){
  const evidence=draft.miscueEvidence||[],transposition=evidence.filter(e=>e.type==='transposition').length,reversal=evidence.filter(e=>e.type==='reversal').length,combined=draft.miscues[5];
  draft.miscues=[...draft.miscues.slice(0,5),transposition,reversal];
  if(transposition+reversal!==combined){draft.legacyCombinedMiscues=combined;draft.miscues[5]=0;draft.miscues[6]=0;draft.miscueMigrationReview=true}
 }
 draft.answers=draft.answers||{};draft.miscueSchema=7;return draft;
}
function orstMiscueBox(stage,index){
 if(stage===5){const x=244+index%2*200,y=600+Math.floor(index/2)*45;return [x,y,x+(index%2?168:191),y+40]}
 const y=296+index*59;return [1011,y,1572,y+57];
}
function orstTotalMiscues(draft){return draft.miscues.reduce((sum,n)=>sum+n,0)+(draft.legacyCombinedMiscues||0)}
function orstScoreBand(score,type){
 if(!Number.isFinite(score)||score<0||score>100)return null;
 return type==='WRS'?(score>=97?'Independent':score>=90?'Instructional':'Frustration'):(score>=80?'Independent':score>=59?'Instructional':'Frustration');
}
function orstReadingMeasure(draft,passage){
 orstNormalizeDraft(draft);
 const miscues=orstTotalMiscues(draft),warnings=[];
 const observed=!!draft.manualReview&&!!draft.pronunciationReviewed;
 const coverage=observed||draft.readingCoverageComplete===true||!!draft.transcript&&draft.wordsCompared>=(typeof orstSpeechTokens==='function'?orstSpeechTokens(passage.body.join(' ')).length:passage.body.join(' ').split(/\s+/).length);
 if(!observed)warnings.push('Automatic differences require review against the recording, including pronunciation.');
 if(!coverage)warnings.push('A complete passage reading has not been confirmed.');
 if(passage.wordCountMismatch)warnings.push('The source states '+passage.words+' words; the displayed passage contains '+passage.bodyWords+' whitespace-separated words. Verify the source count.');
 if(draft.miscueMigrationReview)warnings.push('A legacy Transposition/Reversal count has not been separated.');
 if(miscues>passage.words)warnings.push('Miscues exceed passage words; verify the observed counts.');
 if(draft.audioSilent)warnings.push('No microphone sound detected.');
 const accuracy=(draft.recorded||draft.teacherValidated)&&!draft.audioSilent&&coverage&&miscues<=passage.words&&!draft.miscueMigrationReview?100*(passage.words-miscues)/passage.words:null;
 return {miscues,warnings,observed,coverage,accuracy};
}
function orstScoreDraft(draft,passage){
 if(!(draft?.recorded||draft?.teacherValidated)||!draft.reviewed||!draft.completed||!passage?.questions?.length)return null;
 orstNormalizeDraft(draft);
 if(draft.teacherValidated&&(!draft.teacherObservation?.teacherId||draft.teacherObservation.counts?.length!==7||draft.miscues.some((count,i)=>count!==draft.teacherObservation.counts[i])))return null;
 if(!draft.miscues.every(n=>Number.isInteger(n)&&n>=0)||!Number.isInteger(passage.words)||passage.words<=0)return null;
 if(passage.questions.some((q,i)=>!q.options.some(o=>o.key===draft.answers[i])))return null;
 const {miscues,warnings,observed,coverage,accuracy}=orstReadingMeasure(draft,passage);
 let correct=0,keyValid=true,keyProvisional=false;
 passage.questions.forEach((q,i)=>{const accepted=Array.isArray(passage.key[i])?passage.key[i]:[passage.key[i]];if(accepted.length>1)keyProvisional=true;if(!accepted.length||accepted.some(k=>!q.options.some(o=>o.key===k)))keyValid=false;if(accepted.includes(draft.answers[i]))correct++});
 if(!keyValid)warnings.push('The answer key is incomplete or invalid.');
 if(keyProvisional)warnings.push('Alternative answers in the provisional key need teacher confirmation.');
 const comprehension=keyValid?100*correct/passage.questions.length:null;
 const wrLevel=orstScoreBand(accuracy,'WRS'),csLevel=orstScoreBand(comprehension,'CS');
 const suggestedProfile=orstProfile(accuracy,comprehension);
 const extendedCombination=['Independent/Frustration','Instructional/Instructional','Frustration/Independent'].includes(wrLevel+'/'+csLevel);
 if(extendedCombination)warnings.push('This combination uses the application lower-band rule; the supplied profile reference does not specify it.');
 const verified=observed&&coverage&&!passage.wordCountMismatch&&!draft.miscueMigrationReview&&!draft.audioSilent&&keyValid&&!keyProvisional&&miscues<=passage.words;
 return {scoringVersion:2,accuracy,wrs:accuracy,oralReadingScore:accuracy,correct,comprehension,cs:comprehension,words:passage.words,declaredWords:passage.declaredWords,bodyWords:passage.bodyWords,miscues,miscueCounts:[...draft.miscues],seconds:draft.seconds,wordReadingLevel:wrLevel,comprehensionLevel:csLevel,suggestedProfile,level:suggestedProfile,profileStatus:suggestedProfile==='Pending assessment'?'pending':verified?'observed':'estimated',profileRule:'lower of WRS and CS bands',profileRuleExtended:extendedCombination,verified,wrsStatus:accuracy===null?'pending':observed?'observed':'estimated',csStatus:!keyValid?'pending':keyProvisional?'provisional-key':'scored',scoringWarnings:warnings,readingCoverageComplete:coverage,formula:{wrs:'(passage words - total miscues) / passage words * 100',cs:'correct answers / actual questions * 100'},sourceFiles:['Assessment File/miscues.png','Assessment File/WRS and CS Interpretation.jpg','Assessment File/Reading Profile.jpg']};
}
function orstProfile(accuracy,comprehension){
 const wr=orstScoreBand(accuracy,'WRS'),rc=orstScoreBand(comprehension,'CS');
 if(!wr||!rc)return 'Pending assessment';
 const bands=['Independent','Instructional','Frustration'];return bands[Math.max(bands.indexOf(wr),bands.indexOf(rc))];
}
function orstSavedPassages(){return orstPassages().map((p,index)=>{const records=orstReadAttempts().filter(a=>a.grade===selectedGrade&&a.passageIndex===index);return {passage:p,record:orstRecalculateRecord(records.at(-1),p)}})}

function orstRecalculateRecord(record,passage){
 if(!record)return null;
 const draft=orstNormalizeDraft({...orstNewDraft(),...record,recorded:!record.teacherValidated,reviewed:true,completed:true,miscues:record.miscueCounts||[0,0,0,0,0,0,0],manualReview:record.manualReview===true,pronunciationReviewed:record.pronunciationReviewed===true});
 if(!record.miscueCounts){draft.miscueMigrationReview=true;draft.legacyCombinedMiscues=record.miscues}
 const result=orstScoreDraft(draft,passage);const {totalPoints,oralPoints,comprehensionPoints,...current}=record;return {...current,...(result||{accuracy:null,comprehension:null,level:'Pending assessment',scoringWarnings:['Legacy result needs assessment review.']}),legacyScoring:record.scoringVersion!==2};
}
