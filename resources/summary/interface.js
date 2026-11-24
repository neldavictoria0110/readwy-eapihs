/* The supplied summary artwork supplies every surface and button. */
function assessmentSummaryData(grade){
 const gst=load('assessment_'+grade,{}),oral=load('oral_'+grade,{}),writing=load('wst_submission_'+grade,null),review=load('wst_score_'+grade,null);
 const validScore=result=>result&&Number.isFinite(result.score)&&Number.isFinite(result.total)&&result.total>0&&result.score>=0&&result.score<=result.total;
 const gstScored=validScore(gst),wstScored=validScore(review);
 const oralValid=Number.isFinite(oral.words)&&oral.words>0&&Number.isFinite(oral.miscues)&&oral.miscues>=0&&oral.miscues<=oral.words;
 const seconds=Number.isFinite(oral.seconds)&&oral.seconds>0?oral.seconds:null;
 const passage=orstSourcePassages(grade).find(p=>p.title===oral.title);
 return {grade,gst,oral,writing,review,gstScored,wstScored,oralValid,seconds,level:oral.readingLevel||passage?.level||'—',accuracy:oralValid?100*(oral.words-oral.miscues)/oral.words:null,wcpm:oralValid&&seconds?Math.round((oral.words-oral.miscues)*60/seconds):null};
}
function renderAssessmentSummary(){
 page='assessment-summary';activeModule='wst';nav.innerHTML='';stopOwlFlight();owl.dataset.motion='still';owl.style.display='none';
 const d=assessmentSummaryData(selectedGrade),values=[];
 const text=(name,x,y,width,content,size=16,extra='')=>values.push(`<div class="summary-live ${extra}" data-summary="${name}" style="left:${x}px;top:${y}px;width:${width}px;font-size:${size}px">${h(content)}</div>`);
 const bar=(x,y,width,value,color)=>values.push(`<span class="summary-bar" style="left:${x}px;top:${y}px;width:${width*Math.max(0,Math.min(100,value))/100}px;background:${color}"></span>`);
 const percentage=(score,total)=>(100*score/total).toFixed(1)+'%';
 text('learner',1453,43,180,user?.name||'Learner',16);
 text('grade',1453,67,180,'Grade '+selectedGrade,13);
 text('gst-score',198,326,185,d.gstScored?`${d.gst.score} / ${d.gst.total}`:'Not taken',d.gstScored?34:22);
 text('gst-result',465,333,128,d.gstScored?percentage(d.gst.score,d.gst.total):'Pending',15,'summary-badge');
 text('gst-caption',432,365,168,d.gstScored?'Recorded GST result':'No scored attempt yet',14,'summary-center');
 bar(199,367,181,d.gstScored?100*d.gst.score/d.gst.total:0,'#298653');
 [436,459,482,505].forEach((y,i)=>text('gst-skill-'+i,449,y-3,27,'—',14));
 const minutes=Number.isFinite(d.gst.elapsedMs)?Math.round(d.gst.elapsedMs/60000):null;
 text('gst-time',553,465,54,minutes===null?'—':minutes+' min',18,'summary-center');
 text('gst-strength',245,563,350,d.gstScored?`${d.gst.score} correct responses`:'No scored GST result yet',15);
 text('gst-improve',245,636,350,d.gstScored?`${d.gst.total-d.gst.score} incorrect or unanswered responses`:'Complete the GST to record a result.',15);
 text('gst-next',245,705,350,'Review the saved GST responses with your teacher.',14);
 text('orst-level',677,338,95,d.oralValid?d.level:'—',18,'summary-center');
 text('orst-correct',827,381,37,d.oralValid?d.oral.words-d.oral.miscues:'—',18,'summary-center');
 text('orst-miscues',827,414,37,d.oralValid?d.oral.miscues:'—',18,'summary-center');
 text('orst-fluency',827,447,37,d.wcpm??'—',18,'summary-center');
 text('orst-time',793,482,82,d.seconds?Math.round(d.seconds)+' sec':'—',15,'summary-center');
 text('orst-result',941,341,124,d.accuracy===null?'Pending':d.accuracy.toFixed(1)+'% accuracy',13,'summary-badge');
 text('orst-caption',901,373,171,Number.isFinite(d.oral.comprehension)?'Comprehension: '+d.oral.comprehension.toFixed(1)+'%':'No comprehension score yet',14,'summary-center');
 text('orst-strength',714,563,353,d.oralValid?`${d.oral.words-d.oral.miscues} words read correctly`:'No oral reading result yet',15);
 text('orst-improve',714,636,353,d.oralValid?`${d.oral.miscues} observed miscues`:'Complete an observed reading first.',15);
 text('orst-next',714,705,353,'Review your passage and recorded reading with your teacher.',14);
 text('wst-score',1136,329,180,d.wstScored?`${d.review.score} / ${d.review.total}`:d.writing?'Pending review':'Not submitted',d.wstScored?33:21);
 text('wst-result',1395,333,130,d.wstScored?percentage(d.review.score,d.review.total):'Pending review',13,'summary-badge');
 text('wst-caption',1347,367,180,d.writing?'Submitted · '+d.writing.words+' words':'No writing submitted yet',14,'summary-center');
 bar(1136,367,169,d.wstScored?100*d.review.score/d.review.total:0,'#286a91');
 ['organization','ideas','grammar','mechanics'].forEach((key,index)=>{
  const value=d.wstScored&&Number.isFinite(d.review.components?.[key])?d.review.components[key]:null;
  text('wst-'+key,1482,434+index*23,35,value===null?'—':value,14);
  bar(1311,436+index*23,146,value??0,['#659ec2','#659ec2','#c9a143','#548d9b'][index]);
 });
 text('wst-strength',1186,563,335,d.writing?'Writing submitted · '+d.writing.words+' words':'No writing submitted yet',15);
 text('wst-improve',1186,636,335,d.wstScored?'See your teacher’s scored feedback.':'Writing score awaits teacher review.',15);
 text('wst-next',1186,705,335,'Discuss your paragraph and writing feedback with your teacher.',14);
 const overall=`GST: ${d.gstScored?d.gst.score+'/'+d.gst.total:'not scored'}. ORST: ${d.accuracy===null?'not scored':d.accuracy.toFixed(1)+'% word-reading accuracy'}. WST: ${d.wstScored?d.review.score+'/'+d.review.total:d.writing?'submitted, awaiting teacher scoring':'not submitted'}. Your teacher can review the saved attempts for placement.`;
 text('overall',514,830,555,overall,15,'summary-on-navy');
 text('placement',1185,824,155,'Pending review',14,'summary-badge');
 text('placement-note',1135,864,230,'Overall placement requires teacher review.',14,'summary-center');
 const button=(label,x,y,width,height,action)=>`<button class="summary-image-control" type="button" aria-label="${label}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px" onclick="${action}"></button>`;
 const controls=button('Home',29,133,90,64,"showDashboard()")+button('Learner profile',29,207,90,62,"go('profile')")+button('Assessments',29,276,90,62,"go('map')")+button('Assessment results',29,345,90,66,'renderAssessmentSummary()')+button('Assessment library',29,416,90,66,'openAssessmentLibrary()')+button('Open GST',158,194,474,86,"openModule('gst')")+button('Open ORST',646,194,447,86,"openModule('orst')")+button('Open WST',1106,194,446,86,'openWST()')+button('Open learner profile',1380,27,275,70,"go('profile')")+button('Detailed saved results',328,768,760,145,"openModule('reports')");
 app.innerHTML=`<section class="assessment-summary-screen" aria-label="Assessment summary"><div class="assessment-summary-board"><img src="resources/summary/clean-summary.png" alt="Assessment Summary — GST, ORST, and WST" class="assessment-summary-art" draggable="false">${values.join('')}${controls}</div></section>`;
 positionAssessmentSummary();app.scrollTo(0,0);
}
function positionAssessmentSummary(){
 const screen=app.querySelector('.assessment-summary-screen'),board=screen?.querySelector('.assessment-summary-board');if(!board)return;
 board.style.transform=`translate(0px,0px) scale(${screen.clientWidth/1672},${screen.clientHeight/941})`;
}
function openAssessmentLibrary(){
 if(navigationBusy)return false;activeModule='assessment-library';return transition('work',renderAssessmentLibrary);
}
function renderAssessmentLibrary(){
 activeModule='assessment-library';workLayout('Assessment Library',`<div class="resources">${[7,8,9,10].map(grade=>`<a href="${safeURL(RES+'Assessment File/ORST Graded Passages/G'+grade+' GRADED PASSAGE.docx')}" download>Grade ${grade} — original oral reading passages</a>`).join('')}</div>`);
}
(()=>{
 const previousRender=render,previousModule=modulePage;
 render=function(){if(page==='assessment-summary')return renderAssessmentSummary();return previousRender()};
 modulePage=function(mod){if(mod==='assessment-library')return renderAssessmentLibrary();return previousModule(mod)};
})();
window.addEventListener('resize',positionAssessmentSummary,{passive:true});
