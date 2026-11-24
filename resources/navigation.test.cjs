const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup({reduced=false,source='startup'}={}){
 const classes=new Set(),nodes=new Map(),calls=[],waits=[];
 function node(){return {style:{setProperty(){},removeProperty(){}},classList:{add(){}},append(){},prepend(child){this.innerHTML=(child.innerHTML||'')+(this.innerHTML||'')},cloneNode(){return node()},insertAdjacentHTML(position,html){this.innerHTML=position==='afterbegin'?html+(this.innerHTML||''):(this.innerHTML||'')+html},querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)},querySelectorAll(){return []}}}
 const cover=node();cover.innerHTML='';
 const app={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},inert:false,clientWidth:1672,clientHeight:941,querySelector(selector){return selector.includes('story-login')||selector==='.story-screen'?node():null},querySelectorAll(){return []},setAttribute(){},removeAttribute(){}};
 const c={page:source,navigationBusy:false,app,nav:{inert:false},document:{documentElement:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}},getElementById:()=>cover,querySelector:selector=>selector===c.sourceScreen?{}:null,createElement:node},matchMedia:()=>({matches:reduced}),stopGSTOwlSpeech(){},stopOwlFlight(){},stopWelcomeWandering(){},stopStartupWriting(){},scrollAppToTop(){},render(){calls.push(c.page)},safeURL:x=>x,IMG:'UI%20and%20owl/',owlFiles:{startup:'owl poses/animated flying owl.svg'}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/navigation.js','utf8'),c);
 c.captureBookScreen=node;c.waitForTransitionMotion=duration=>new Promise(resolve=>waits.push({duration,resolve}));
 return {c,cover,calls,waits,classes};
}
test('startup morph locks navigation until the login scene settles',async()=>{
 const {c,cover,calls,waits,classes}=setup();const pending=c.animatePageTransition('login');
 assert.equal(await c.animatePageTransition('map'),false);await Promise.resolve();
 assert.equal(c.app.inert,true);assert.equal(c.nav.inert,true);assert.deepEqual(calls,['login']);assert.equal(waits[0].duration,2200);
 assert.equal(cover.className,'startup-morph-transition');assert(cover.innerHTML.includes('startup-morph-source'));assert(cover.innerHTML.includes('morphBookLeft'));assert(cover.innerHTML.includes('morphBookRight'));assert(cover.innerHTML.includes('morphBookEmblem'));assert(cover.innerHTML.includes('morph-joining-paper'));assert(cover.innerHTML.includes('morphJoiningPaperTone'));assert(classes.has('startup-morph-destination'));assert(classes.has('book-traveling'));
 waits[0].resolve();assert.equal(await pending,true);assert.equal(c.navigationBusy,false);assert.equal(c.app.inert,false);assert.equal(cover.innerHTML,'');assert(!classes.has('book-traveling'));assert(!classes.has('startup-morph-destination'));
});
test('learning areas reveal the journey inside the book before the full map',async()=>{
 const {c,cover,waits}=setup({source:'subject'});const pending=c.animatePageTransition('journey');await Promise.resolve();
 assert.equal(waits[0].duration,1800);assert.equal(cover.className,'welcome-ribbon-morph');assert(cover.innerHTML.includes('welcome-ribbon-source'));waits[0].resolve();await pending;
});
test('reduced motion renders once and skips animation',async()=>{
 const {c,calls,waits}=setup({reduced:true});assert.equal(await c.animatePageTransition('login'),true);assert.deepEqual(calls,['login']);assert.equal(waits.length,0);assert.equal(c.navigationBusy,false);assert.equal(c.app.inert,false);
});
test('module callbacks render once; failures release navigation',async()=>{
 const {c,calls}=setup({reduced:true});let count=0;await c.animatePageTransition('work',()=>count++);assert.equal(count,1);assert.deepEqual(calls,[]);
 await assert.rejects(c.animatePageTransition('work',()=>{throw Error('render failed')}),/render failed/);assert.equal(c.navigationBusy,false);assert.equal(c.app.inert,false);assert.equal(c.nav.inert,false);
});

test('login chapters and authenticated welcome use the ribbon morph',async()=>{
 for(const destination of ['login','subject','areas-preview']){
  const {c,cover,waits,classes}=setup({source:'login'});let renders=0;
  const pending=c.animatePageTransition(destination,()=>renders++);
  assert.equal(renders,1);assert.equal(c.page,destination);
  assert.equal(cover.className,'welcome-ribbon-morph');assert(cover.innerHTML.includes('welcome-ribbon-source'));
  assert(classes.has('welcome-ribbon-destination'));assert.equal(c.app.inert,true);
  assert.equal(waits[0].duration,1800);waits[0].resolve();await pending;
  assert(!classes.has('welcome-ribbon-destination'));assert.equal(c.app.inert,false);assert.equal(cover.innerHTML,'');
 }
});
test('welcome ribbon cleanup runs when rendering fails',async()=>{
 const {c,classes}=setup({source:'login'});
 await assert.rejects(c.animatePageTransition('subject',()=>{throw Error('welcome failed')}),/welcome failed/);
 assert.equal(c.navigationBusy,false);assert.equal(c.app.inert,false);assert(!classes.has('welcome-ribbon-destination'));
});
test('reduced motion bypasses the welcome ribbon',async()=>{
 const {c,waits}=setup({source:'login',reduced:true});let renders=0;
 await c.animatePageTransition('subject',()=>renders++);assert.equal(renders,1);assert.equal(waits.length,0);
});

test('every subject selection entrance uses the welcome ribbon',async()=>{
 for(const source of ['subject','areas-preview','subjects-spread']){
  const {c,cover,waits}=setup({source});const pending=c.animatePageTransition('journey');
  assert.equal(cover.className,'welcome-ribbon-morph');assert.equal(c.page,'journey');
  assert.equal(waits[0].duration,1800);waits[0].resolve();await pending;
 }
});

test('Start expands the book map into the full map and releases navigation',async()=>{
 const {c,cover,waits,classes,calls}=setup({source:'journey'});
 const pending=c.animatePageTransition('map');await Promise.resolve();
 assert.equal(cover.className,'map-zoom-morph');assert(cover.innerHTML.includes('map-morph-window'));assert(!cover.innerHTML.includes('readwy-light-ring'));
 assert.deepEqual(calls,['map']);assert(classes.has('map-morph-live'));assert.equal(c.app.inert,true);
 assert.equal(waits[0].duration,2100);waits[0].resolve();await pending;
 assert(!classes.has('map-morph-live'));assert.equal(c.navigationBusy,false);assert.equal(cover.innerHTML,'');
});
test('reduced motion opens the full map immediately',async()=>{
 const {c,waits,calls}=setup({source:'journey',reduced:true});await c.animatePageTransition('map');
 assert.deepEqual(calls,['map']);assert.equal(waits.length,0);assert.equal(c.app.inert,false);
});

test('remaining story, assessment and return routes use chapter morphs',async()=>{
 for(const [source,to,activeModule] of [['login','signup',''],['signup','login',''],['login','startup',''],['subject','subjects-spread',''],['journey','subject',''],['work','map','']]){
  const {c,cover,waits,classes}=setup({source});c.activeModule=activeModule;let draws=0;
  const pending=c.animatePageTransition(to,()=>draws++);await Promise.resolve();
  assert(cover.className.includes('chapter-morph'),source+' -> '+to);assert(!cover.className.includes('twirl'));assert.equal(draws,1);assert.equal(c.page,to);
  assert(classes.has('chapter-morph-live'));assert.equal(waits[0].duration,1500);
  waits[0].resolve();await pending;assert(!classes.has('chapter-morph-live'));assert.equal(c.navigationBusy,false);
 }
});
test('chapter morph releases navigation if destination rendering fails',async()=>{
 const {c,classes}=setup({source:'signup'});
 await assert.rejects(c.animatePageTransition('login',()=>{throw Error('chapter failed')}),/chapter failed/);
 assert.equal(c.navigationBusy,false);assert.equal(c.app.inert,false);assert(!classes.has('chapter-morph-live'));
});

async function checkWand(source,to,module,screen){
 const {c,cover,waits}=setup({source});c.activeModule=module;c.sourceScreen=screen;let draws=0;
 const pending=c.animatePageTransition(to,()=>draws++);
 assert.equal(cover.className,'assessment-wand-cast');assert(cover.innerHTML.includes('wand%20clean.png'));assert(cover.innerHTML.includes('wand-cast-luminance'));
 assert.equal(draws,0,'keep the source page until the luminous peak');assert.equal(c.page,source);assert.equal(c.app.inert,true);assert.equal(waits[0].duration,1400);
 waits[0].resolve();await new Promise(setImmediate);
 assert.equal(draws,1);assert.equal(c.page,to);assert.equal(waits[1].duration,1000);assert.equal(c.app.inert,true);
 waits[1].resolve();await pending;
 assert.equal(draws,1);assert.equal(cover.innerHTML,'');assert.equal(c.app.inert,false);assert.equal(c.navigationBusy,false);
}
test('all seven map stages use the twirling wand and luminous reveal',async()=>{
 for(const [module,to] of [['gst','work'],['orst','orst-welcome'],['srst','wst'],['aral','work'],['interv','work'],['sra','work'],['reports','work']])await checkWand('map',to,module);
});
test('GST to ORST and ORST to WST internal links use the same wand sequence',async()=>{
 await checkWand('work','orst-welcome','orst','.gst-book-screen');
 await checkWand('work','wst','orst','.orst-interface-screen');
});
test('journey stage entrances use the wand too',async()=>{await checkWand('journey','work','gst')});
test('wand sequence skips animation with reduced motion',async()=>{
 for(const [source,to,screen] of [['map','work',null],['work','orst-welcome','.gst-book-screen'],['work','wst','.orst-interface-screen']]){
  const {c,waits}=setup({source,reduced:true});c.activeModule='gst';c.sourceScreen=screen;let draws=0;
  await c.animatePageTransition(to,()=>draws++);assert.equal(draws,1);assert.equal(waits.length,0);assert.equal(c.app.inert,false);
 }
});
test('wand cleanup releases navigation if rendering fails at the luminous peak',async()=>{
 const {c,cover,waits}=setup({source:'map'});c.activeModule='gst';
 const pending=c.animatePageTransition('work',()=>{throw Error('wand destination failed')});
 const rejected=assert.rejects(pending,/wand destination failed/);waits[0].resolve();await rejected;
 assert.equal(c.app.inert,false);assert.equal(c.navigationBusy,false);assert.equal(cover.innerHTML,'');
});test('ORST grade confirmation zooms into the selected card and releases navigation',async()=>{
 const {c,cover,waits}=setup({source:'orst-grade'});
 c.activeModule='orst';c.selectedGrade=7;c.app.querySelectorAll=()=>[];cover.classList.remove=()=>{};
 let renders=0;const pending=c.animatePageTransition('work',()=>renders++);
 await Promise.resolve();await Promise.resolve();
 assert.equal(renders,1);assert.equal(cover.className,'orst-grade-zoom orst-grade-zoom-loading');
 assert.equal(waits[0].duration,1100);assert.equal(c.navigationBusy,true);
 waits[0].resolve();assert.equal(await pending,true);assert.equal(c.navigationBusy,false);assert.equal(cover.className,'transition');
});
test('ORST uses the same zoom when opening, advancing and returning',async()=>{
 for(const [source,to,module] of [['map','orst-welcome','orst'],['orst-welcome','orst-grade','orst'],['work','work','orst'],['work','orst-grade','orst'],['work','map','orst']]){
  const {c,cover,waits}=setup({source});c.activeModule=module;c.selectedGrade=8;c.app.querySelectorAll=()=>[];cover.classList.remove=()=>{};
  if(source==='work')c.sourceScreen='.orst-grade-screen,.orst-artwork-welcome,.orst-interface-screen';
  const pending=c.animatePageTransition(to,()=>{});await Promise.resolve();await Promise.resolve();
  assert(cover.className.startsWith('orst-grade-zoom'),source+' → '+to);assert.equal(waits[0].duration,1100);
  waits[0].resolve();await pending;assert.equal(c.navigationBusy,false);
 }
});
