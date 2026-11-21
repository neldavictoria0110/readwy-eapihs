/* Seven source-listed miscues, with official percentages instead of invented point totals. */
function orstScorePercent(value){return Number.isFinite(value)?value.toFixed(1)+'%':'Pending'}
function orstPaintMiscueRows(ctx,text,art,draft){
 const submitted=!!draft.recorded,counts=draft.miscues||[],labels=ORST_MISCUES;
 if(orstPaint.stage===5){
  ctx.drawImage(art,617,596,3,185,244,596,369,185);
  labels.forEach((label,i)=>{const [x,y,x2,y2]=orstMiscueBox(5,i);ctx.fillStyle='#fbfffd';ctx.beginPath();ctx.roundRect(x,y,x2-x,y2-y,13);ctx.fill();text(label,x+12,y+20,x2-x-44,19,500);ctx.beginPath();ctx.arc(x2-20,y+20,10,0,Math.PI*2);ctx.fillStyle='#ffd4ca';ctx.fill();text((i===0&&submitted&&!draft.pronunciationReviewed||i>=5&&draft.miscueMigrationReview)?'—':counts[i]||0,x2-20,y+20,19,14,700,'center')});
 }else if(orstPaint.stage===6){
  ctx.drawImage(art,1577,293,4,421,1010,293,565,421);
  labels.forEach((label,i)=>{
   const [x,y,x2,y2]=orstMiscueBox(6,i),cy=(y+y2)/2;
   ctx.fillStyle='#fcffff';ctx.beginPath();ctx.roundRect(x,y,x2-x,y2-y,13);ctx.fill();
   const sourceIndex=i===5?5:i===6?5:i;
   ctx.drawImage(art,1033,302+sourceIndex*69,61,60,1038,y+6,48,46);
   text(label,1145,cy,330,31,700);
   ctx.beginPath();ctx.arc(1528,cy,21,0,Math.PI*2);ctx.fillStyle='#ff2861';ctx.fill();
   const unknown=i===0&&submitted&&!draft.pronunciationReviewed||i>=5&&draft.miscueMigrationReview;
   text(unknown?'—':counts[i]||0,1528,cy,37,27,700,'center','#fff');
  });
 }
}
function orstPaintOfficialResults(ctx,text,stage,passage,draft,score,badge,art){
 if(stage===8){
  badge(1535,66,200,false);text('Passage '+(orstPaint.passage+1),1055,340,630,55,700,'center');
  if(!score)text('No result yet',1055,366,630,46,700,'center');
  const rows=[['Oral Reading Score',score?orstScorePercent(score.accuracy):'No result yet'],['Comprehension (CS)',score?orstScorePercent(score.comprehension):'No result yet'],['Reading Profile',score?.level||'No result yet']];
  rows.forEach(([label,value],i)=>{const y=466+i*95;const sx=i===2?1120:1180;ctx.drawImage(art,sx,y-32,1337-sx,64,847,y-32,490,64);if(i===0){text(label,858,y-12,300,29,700);text('(WRS)',858,y+19,300,22,500)}else text(label,858,y,300,i===2?30:29,700);text(value,1326,y,156,i===2?25:34,700,'right')});
  if(score){const candidate=score.suggestedProfile!=='Pending assessment'?score.suggestedProfile+' profile (estimated)':score.scoringWarnings[0]||'Review the recording with your teacher.';text(score.verified?'Based on WRS and CS for this passage.':candidate,1055,720,625,21,500,'center')}
  text(orstPaint.passage<3?'Continue to':'View Your',1320,795,355,29,700,'center','#fff');text(orstPaint.passage<3?'Passage '+(orstPaint.passage+2):'Progress',1320,835,355,31,700,'center','#fff');
 }
 if(stage===9){
  badge(1204,103,220,false);const records=orstSavedPassages();records.forEach(({record},i)=>{const x=447+i*272;text(record?'WRS '+orstScorePercent(record.accuracy):'No result yet',x,651,235,23,700,'center');if(record)text('CS '+orstScorePercent(record.comprehension),x,681,235,23,700,'center')});
  const next=records.findIndex(r=>!r.record);text(next<0?'View Passage Profiles':'Continue to Passage '+(next+1),1260,835,530,31,700,'center','#fff');
 }
 if(stage===10){
  badge(1295,137,180,false);const records=orstSavedPassages(),completed=records.filter(r=>r.record).length;
  records.forEach(({record},i)=>text(record?orstScorePercent(record.accuracy)+' / '+orstScorePercent(record.comprehension):'No result yet',1334,233+i*55,270,24,700,'right'));
  ctx.drawImage(art,1150,449,185,63,879,449,456,63);text('WRS / CS',889,482,250,31,700);text('Per passage',1335,482,220,26,700,'right');
  text(completed?'See profiles':'No result yet',632,466,330,31,700,'center');
  text(completed+' of 4 passages completed',670,586,670,28,700);
  records.forEach(({record},i)=>{const label=record?(record.verified?record.level:record.suggestedProfile&&record.suggestedProfile!=='Pending assessment'?record.suggestedProfile+' (estimated)':'Pending assessment'):'No result yet';text('Passage '+(i+1)+': '+label,675,624+i*25,660,22,500)});
 }
}
