const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup(){
 const records=new Map();
 const sessionRecords=new Map();
 const context={
  user:{id:'student-1',grade:7,name:'Learner'},
  selectedGrade:7,
  localStorage:{
   getItem:key=>records.has(key)?records.get(key):null,
   setItem:(key,value)=>records.set(key,String(value))
  },
  sessionStorage:{
   getItem:key=>sessionRecords.has(key)?sessionRecords.get(key):null,
   setItem:(key,value)=>sessionRecords.set(key,String(value)),
   removeItem:key=>sessionRecords.delete(key)
  },
  console
 };
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(__dirname+'/subject-labs.js','utf8'),context);
 return {api:context.READwySubjectLabs,records,sessionRecords,context};
}

test('both subjects expose six stations and original grade-specific activity sets',()=>{
 const {api}=setup();
 for(const area of ['Mathematics','Filipino']){
  assert.equal(api.stations[area].length,6);
  for(let grade=7;grade<=10;grade++){
   assert(api.gradeFocus[area][grade]);
   for(const station of api.stations[area]){
    for(let index=0;index<10;index++){
     const activity=api.activityFor(area,grade,station.id,index);
     assert(activity.prompt,`${area}, Grade ${grade}, ${station.id}, ${index}`);
     if(activity.type==='choice'){
      assert.equal(activity.choices.length,4);
      assert(activity.choices.includes(activity.answer));
      assert(activity.explanation);
     }else{
      assert.equal(activity.type,'write');
      assert(activity.minimum>=45);
      assert(activity.checks.length>=3);
     }
    }
   }
  }
 }
});

test('progress keys isolate subjects, grades, and learners',()=>{
 const {api}=setup(),learner={id:'learner-1',grade:7},other={id:'learner-2',grade:7};
 const math7=api.storageKey('Mathematics',7,learner);
 assert.notEqual(math7,api.storageKey('Filipino',7,learner));
 assert.notEqual(math7,api.storageKey('Mathematics',8,{...learner,grade:8}));
 assert.notEqual(math7,api.storageKey('Mathematics',7,other));
});

test('welcome and map render the selected subject without the English journey map',()=>{
 const {api,context}=setup();
 context.app={innerHTML:''};
 context.selectedLearningArea='Mathematics';
 api.renderWelcome();
 assert.match(context.app.innerHTML,/Grade 7 focus/);
 assert.match(context.app.innerHTML,/Number &amp; Ratio/);
 assert.doesNotMatch(context.app.innerHTML,/Reading Check-In/);
 api.renderMap();
 assert.match(context.app.innerHTML,/Start check-in/);
 assert.match(context.app.innerHTML,/Geometry &amp; Measurement/);
 assert.match(context.app.innerHTML,/Locked/);
 context.selectedLearningArea='Filipino';
 api.renderWelcome();
 assert.match(context.app.innerHTML,/Talasalitaan/);
 assert.match(context.app.innerHTML,/Grade 7 focus/);
});

test('invalid writing submission retains the learner draft and self-review checks',()=>{
 const {api,sessionRecords,context}=setup();
 context.selectedLearningArea='Filipino';
 context.go=()=>{};
 context.app={
  innerHTML:'',
  querySelector:()=>({value:'short'}),
  querySelectorAll:()=>[]
 };
 const grade=7,profile=context.user,progress=api.progressFor('Filipino',grade,profile);
 progress.placement={score:2,total:6};
 const station=api.stations.Filipino.find(item=>Array.from({length:10},(_,index)=>api.activityFor('Filipino',grade,item.id,index)).some(activity=>activity.type==='write'));
 const writingIndex=Array.from({length:10},(_,index)=>api.activityFor('Filipino',grade,station.id,index)).findIndex(activity=>activity.type==='write');
 progress.stations[station.id]={answers:Object.fromEntries(Array.from({length:writingIndex},(_,index)=>[index,{done:true,correct:true,attempts:1}]))};
 const stationIndex=api.stations.Filipino.indexOf(station);
 for(const prior of api.stations.Filipino.slice(0,stationIndex)){
  progress.stations[prior.id]={answers:Object.fromEntries(Array.from({length:10},(_,index)=>[index,{done:true,correct:true,attempts:1}]))};
 }
 api.openStation(station.id);
 assert.equal(JSON.parse(sessionRecords.get('readwy-subject-task-v1')).index,writingIndex);
 api.submitWriting();
 const saved=JSON.parse(sessionRecords.get('readwy-subject-task-v1'));
 assert.equal(saved.draft,'short');
 assert.deepEqual(saved.checks,[]);
 assert.match(context.app.innerHTML,/short/);
 assert.match(context.app.innerHTML,/Dagdagan pa ang sagot/);
});

test('station mastery unlocks the next station only after its requirements are met',()=>{
 const {api}=setup(),profile={id:'student-1',grade:7};
 const math=api.progressFor('Mathematics',7,profile);
 math.placement={score:2,total:6};
 math.stations.number={answers:Object.fromEntries(Array.from({length:8},(_,index)=>[index,{done:true,correct:true}]))};
 assert(api.stationComplete('Mathematics',math,'number'));
 assert(api.stationUnlocked('Mathematics',math,1));
 assert(!api.stationUnlocked('Mathematics',math,2));
 math.stations.modeling={answers:Object.fromEntries([
  ...Array.from({length:8},(_,index)=>[index,{done:true,correct:true}]),
  [8,{done:true,correct:false}],
  [9,{done:true,correct:false}]
 ])};
 assert(api.stationComplete('Mathematics',math,'modeling'));
 const filipino=api.progressFor('Filipino',7,profile);
 filipino.placement={score:4,total:6};
 filipino.stations.writing={answers:Object.fromEntries(Array.from({length:8},(_,index)=>[index,{done:true,correct:false}]))};
 assert(api.stationComplete('Filipino',filipino,'writing'));
});
