const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(role='student',busy=false){
 const handlers={},chosen=[],properties={};
 const node={style:{setProperty:(key,value)=>properties[key]=value},classList:{add(){},remove(){}},clientHeight:530,addEventListener:(name,fn)=>handlers[name]=fn};
 const c={navigationBusy:busy,user:{role},artwork:'',learningAreas:['English'],chooseLearningArea:name=>chosen.push(name),frame:(_,content)=>content,h:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),app:{innerHTML:'',querySelector:()=>node}};
 const source=fs.readFileSync(__dirname+'/new-story.js','utf8');vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function discoverySpellText('),source.indexOf(' function renderChosenWorld(')),c);c.renderDiscovery();return {c,handlers,chosen,properties};
}
test('discovery text uses the correct role and spell lettering without subject artwork cards',()=>{
 for(const role of ['student','teacher']){
  const {c,properties}=setup(role,true);assert(c.app.innerHTML.includes(role==='student'?'Student':'Teacher'));assert(c.app.innerHTML.includes('discovery-spell-word'));assert(!c.app.innerHTML.includes('flashlight-art'));assert.equal(properties['--discovery-start'],'1850ms');
 }
 const css=fs.readFileSync(__dirname+'/new-story.css','utf8');assert(css.includes('.discovery-screen .story-clean-paper{display:none}'));assert(css.includes('.story-login.discovery-screen .flashlight-page{background:none;border:0;box-shadow:none}'));
});
test('the flashlight page offers English only, wherever it is tapped',()=>{
 const {handlers,chosen}=setup();for(const y of [40,250,490])handlers.click({offsetY:y});assert.deepEqual(chosen,['English','English','English']);assert(handlers.pointerdown);assert(handlers.pointermove);
});
test('Mathematics and Filipino are not offered anywhere in the start screens',()=>{
 const {c}=setup();assert(!/Mathematics|Filipino/.test(c.app.innerHTML));
 const source=fs.readFileSync(__dirname+'/new-story.js','utf8');assert(!/Mathematics|Filipino|READwySubjectLabs|'subject-task'/.test(source));
});
test('choosing English removes the other subjects before navigation captures the outgoing page',()=>{
 const entries=['English','Filipino','Mathematics'].map(name=>({textContent:name,removed:false,remove(){this.removed=true}}));let checked=false;const c={navigationBusy:false,selectedLearningArea:'',app:{querySelectorAll:()=>entries},go:page=>{assert.equal(page,'journey');assert.equal(entries[0].removed,false);assert.equal(entries[1].removed,true);assert.equal(entries[2].removed,true);checked=true}};c.window=c;vm.createContext(c);const source=fs.readFileSync(__dirname+'/new-story.js','utf8');vm.runInContext(source.slice(source.indexOf(" const learningAreas="),source.indexOf(" const artwork=")),c);c.chooseLearningArea('English');assert(checked);assert.equal(c.selectedLearningArea,'English');
});
test('only English can be chosen as a learning area',()=>{
 for(const name of ['Mathematics','Filipino']){
  let navigated=false;
  const c={navigationBusy:false,selectedLearningArea:'English',app:{querySelectorAll:()=>[]},go(){navigated=true}};
  c.window=c;vm.createContext(c);const source=fs.readFileSync(__dirname+'/new-story.js','utf8');vm.runInContext(source.slice(source.indexOf(" const learningAreas="),source.indexOf(" const artwork=")),c);c.chooseLearningArea(name);
  assert.equal(c.selectedLearningArea,'English');assert.equal(navigated,false)
 }
});
