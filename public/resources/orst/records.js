/* Real ORST attempts only. Opening an interface never creates a score or record. */
function orstRecordKey(){
 const learner=typeof user!=='undefined'&&user?(user.id||user.lrn||user.email||user.name||'local'):'local';
 return 'orst_attempts_v1_'+encodeURIComponent(String(learner));
}
function orstValidateAttempt(attempt){
 const integer=value=>typeof value==='number'&&Number.isInteger(value);
 return !!attempt&&[7,8,9,10].includes(attempt.grade)&&integer(attempt.words)&&attempt.words>0&&integer(attempt.miscues)&&attempt.miscues>=0&&attempt.miscues<=attempt.words&&integer(attempt.correct)&&integer(attempt.total)&&attempt.total>0&&attempt.correct>=0&&attempt.correct<=attempt.total&&typeof attempt.completedAt==='string'&&Number.isFinite(Date.parse(attempt.completedAt));
}
function orstReadAttempts(){
 const stored=load(orstRecordKey(),[]);
 return Array.isArray(stored)?stored.filter(orstValidateAttempt):[];
}
function orstSummary(attempts=orstReadAttempts(),grade=selectedGrade){
 const records=attempts.filter(attempt=>orstValidateAttempt(attempt)&&attempt.grade===grade);
 if(!records.length)return {recordCount:0,score:0,accuracy:null,comprehension:null,analysis:null,latest:null};
 const latest=records[records.length-1];
 return {recordCount:records.length,score:latest.correct,accuracy:latest.scoringVersion===2?latest.accuracy:100*(latest.words-latest.miscues)/latest.words,comprehension:latest.scoringVersion===2?latest.comprehension:100*latest.correct/latest.total,analysis:{words:latest.words,miscues:latest.miscues,correct:latest.correct,total:latest.total},latest};
}
function saveOrstAttempt(observation){
 const attempt={teacherValidated:observation.teacherValidated,teacherObservation:observation.teacherObservation,scoringVersion:observation.scoringVersion,declaredWords:observation.declaredWords,bodyWords:observation.bodyWords,recordingId:observation.recordingId,audioMime:observation.audioMime,miscueSchema:observation.miscueSchema,legacyCombinedMiscues:observation.legacyCombinedMiscues,miscueMigrationReview:observation.miscueMigrationReview,wrs:observation.wrs,oralReadingScore:observation.oralReadingScore,cs:observation.cs,wordReadingLevel:observation.wordReadingLevel,comprehensionLevel:observation.comprehensionLevel,suggestedProfile:observation.suggestedProfile,profileStatus:observation.profileStatus,profileRule:observation.profileRule,profileRuleExtended:observation.profileRuleExtended,verified:observation.verified,wrsStatus:observation.wrsStatus,csStatus:observation.csStatus,scoringWarnings:observation.scoringWarnings,sourceFiles:observation.sourceFiles,formula:observation.formula,readingCoverageComplete:observation.readingCoverageComplete,manualReview:observation.manualReview,pronunciationReviewed:observation.pronunciationReviewed,readingAttempts:observation.readingAttempts,transcript:observation.transcript,miscueEvidence:observation.miscueEvidence,analysisStatus:observation.analysisStatus,wordsCompared:observation.wordsCompared,passageIndex:observation.passageIndex,title:observation.title,answers:observation.answers,miscueCounts:observation.miscueCounts,accuracy:observation.accuracy,comprehension:observation.comprehension,totalPoints:observation.totalPoints,oralPoints:observation.oralPoints,comprehensionPoints:observation.comprehensionPoints,level:observation.level,grade:selectedGrade,words:observation.words,miscues:observation.miscues,correct:observation.correct,total:observation.total,seconds:observation.seconds??null,completedAt:observation.date||new Date().toISOString()};
 if(!orstValidateAttempt(attempt))return false;
 const records=orstReadAttempts();records.push(attempt);save(orstRecordKey(),records);return true;
}
