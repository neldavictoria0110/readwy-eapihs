const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function setup(profile,authenticated=true){
 const stored=new Map();
 const status={textContent:''};
 const location={href:'https://readwy-eapihs.onrender.com/index.html?view=train',assigned:'',assign(url){this.assigned=url}};
 const context={
  window:null,
  location,
  URL,
  document:{getElementById:()=>status},
  localStorage:{getItem:key=>key==='READwy_new_2026_local_user'&&profile?JSON.stringify(profile):null},
  sessionStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,String(value))},
  console:{error(){}}
 };
 context.window=context;
 context.__readwyAuthEntered=authenticated;
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(__dirname+'/train-subject-launch.js','utf8'),context);
 return {context,location,status,stored};
}

test('train subject choices open the signed-in student assessment route',()=>{
 for(const subject of ['Mathematics','Filipino']){
  const {context,location,status,stored}=setup({role:'student',grade:8});
  context.openReadwySubjectAssessment(subject);
  assert.equal(stored.get('readwy-subject-assessment-v1'),subject);
  assert.equal(new URL(location.assigned).searchParams.get('view'),'application');
  assert.equal(status.textContent,`Opening your ${subject} assessment…`);
 }
});

test('train subject choices require an authenticated Grade 7–10 student',()=>{
 const anonymous=setup(null,false);
 anonymous.context.openReadwySubjectAssessment('Mathematics');
 assert.equal(anonymous.location.assigned,'');
 assert.match(anonymous.status.textContent,/Sign in as a student/);
 const outOfRange=setup({role:'student',grade:11});
 outOfRange.context.openReadwySubjectAssessment('Filipino');
 assert.equal(outOfRange.location.assigned,'');
 assert.match(outOfRange.status.textContent,/Grades 7–10/);
});

test('build embeds the train launcher and app assessment handoff',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const marker='<script id="readwy-page-sources" type="application/json">';
 const start=html.indexOf(marker);
 assert.notEqual(start,-1);
 const bodyStart=start+marker.length,end=html.indexOf('</script>',bodyStart);
 const pages=JSON.parse(html.slice(bodyStart,end));
 assert.match(pages.train,/data-source="resources\/train-subject-launch\.js"/);
 assert.match(pages.train,/openReadwySubjectAssessment\(button\.dataset\.subject\)/);
 assert.match(pages.application,/readwy-subject-assessment-v1/);
 assert.match(pages.application,/READwySubjectLabs\.startPlacement\(\)/);
});
