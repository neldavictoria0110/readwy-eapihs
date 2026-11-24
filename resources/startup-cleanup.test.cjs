const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const payload=html.match(/<script id="readwy-page-sources"[^>]*>([\s\S]*?)<\/script>/);

test('entry payload is valid and the startup uses the login page backdrop',()=>{
 assert(payload,'Missing embedded page payload');
 const pages=JSON.parse(payload[1]);
 const app=pages.application;
 assert.equal(typeof app,'string');
 const sceneScript='<script src="resources/station-scene.js"></script>';
 assert(html.indexOf(sceneScript)>=0&&html.indexOf(sceneScript)<html.indexOf(payload[0]),'Shared station renderer must load before the embedded app');
 assert(!app.includes('<link rel="preload" as="image" href="UI%20and%20owl/interv%20file/realistic-study-atlas.png">'),'Legacy artwork must not be preloaded for every startup visit');
 for(const obsolete of [
  'resources/roaming-owl.js',
  'owl poses/animated flying owl.svg',
  'startup-scene-motion.svg',
  'startup-title-motion.svg',
  'resources/startup-slide-backdrop.png',
  'startup-slide-wipe'
 ])assert(!app.includes(obsolete),'Unexpected legacy startup reference: '+obsolete);
 assert(app.includes('let setOwl=()=>{owl.removeAttribute(\'src\');owl.dataset.motion=\'still\';owl.style.display=\'none\'}'));
 assert(app.includes('Slide to Open'));
 for(const asset of ['station-journey.webp','station-hall-hd.webp','readwy-title-cutout.png'])
  assert(fs.existsSync(path.join(root,'resources',asset)),'Missing login scene asset: '+asset);
 const css=app.match(/<style data-source="resources\/startup-slide\.css">([\s\S]*?)<\/style>/);
 assert(css,'Missing embedded startup stylesheet');
 assert.equal(css[1].trim(),fs.readFileSync(path.join(root,'resources','startup-slide.css'),'utf8').trim());
 assert(css[1].includes('border:3px solid #c9a14a'));
 assert(css[1].includes('Palatino Linotype'));
 assert(css[1].includes('width:40%;height:10%'));
 assert(css[1].includes('clamp(32px,3.5cqh,60px)'));
 assert(css[1].includes('border-radius:22px'));
 assert(!css[1].includes('border-radius:999px'));
 assert(css[1].includes('.startup-login-title'));
 const startup=fs.readFileSync(path.join(root,'resources','startup-slide.js'),'utf8');
 assert(startup.includes('<div class="startup-orientation-prompt"'));
 assert(startup.includes('Rotate your device'));
 assert(css[1].includes('@media(orientation:portrait) and (max-width:1100px)'));
 assert(css[1].includes('.startup-orientation-prompt{display:flex}'));
 assert(css[1].includes('body:has(.startup-orientation-prompt) #rwBadge{display:none!important}'));
 assert(startup.includes('window.readwyStationLayer(art,{zoom:1,focusWide:(w,h)=>w/h>1.5?870:836,shade:false,loginFrames:true,mobileFit:true,mobileAlignY:.38})'));
 assert(startup.includes('data="resources/readwy-login-title.svg"'));
 assert(startup.includes('(Math.min(1450,width*.94/scale)*scale*.70/1.5)'));
 assert(!startup.includes('titleLayer.style.left='));
 assert(css[1].includes('left:50%'));
 assert(css[1].includes('z-index:6'));
 assert(css[1].includes('width:677px'));
 assert(app.includes(startup.trim()),'Embedded startup script is out of sync');
 assert(app.includes(fs.readFileSync(path.join(root,'resources','interv','stations.js'),'utf8').trim()),'Embedded station activity script is out of sync');
 const scene=fs.readFileSync(path.join(root,'resources','station-scene.js'),'utf8');
 assert(scene.includes('const ensureStyles=()=>{'));
 assert(scene.includes('window.readwyStationLayer=(host,o={})=>{\n  ensureStyles();'));
 assert(scene.includes('.rs-clear-shade .rs-sign{z-index:4;box-shadow:none}'));
 assert(scene.includes('.rs-clear-shade .rs-board{z-index:4;box-shadow:inset'));
 assert(scene.includes('.rs-startup-login-frames .rs-sign:not(.r){left:200px!important;top:350px!important;width:380px!important;height:170px!important'));
 assert(scene.includes('.rs-startup-login-frames .rs-board{left:200px!important;top:540px!important;width:380px!important;height:170px!important;padding:14px 18px!important'));
 assert(scene.includes('.rs-startup-login-frames .rs-board p{line-height:1.25!important}'));
 assert(scene.includes('.rs-startup-login-frames .rs-board .rs-dots{margin-top:4px!important}'));
 assert(scene.includes('o.mobileFit===true&&W<H'));
 assert(scene.includes('.rs-startup-login-frames .rs-sign:not(.r){left:30px!important;top:380px!important;width:1530px!important;height:330px!important'));
 assert(scene.includes('.rs-startup-login-frames .rs-sign.r{left:940px!important;top:30px!important;width:700px!important;height:340px!important'));
 assert(scene.includes('.rs-startup-login-frames .rs-board{left:30px!important;top:730px!important;width:1530px!important;height:360px!important'));
 assert(css[1].includes('width:min(180vw,720px)'));
 assert(scene.includes("CLEAN_IMG='resources/station-journey.webp'"));
 assert(scene.includes('src="${o.loginFrames===true?CLEAN_IMG:IMG}"'));
 assert(scene.includes('.rs-startup-login-frames .rs-piece:not(.rs-sign){background-image:url(${CLEAN_IMG})!important}'));
 assert(scene.includes('background:#052B1E!important'));
 assert(scene.includes('box-shadow:inset 0 0 0 4px #0f3d27,inset 0 0 0 5px #c9a14a!important'));
 assert(scene.includes("${o.shade===false?'':'<div class=\"rs-shade\"></div>'}"));
 assert(app.includes(scene.trim()),'Embedded application scene renderer is out of sync');
 assert(pages.train.includes(scene.trim()),'Embedded login scene renderer is out of sync');
 const titleSvg=fs.readFileSync(path.join(root,'resources','readwy-login-title.svg'),'utf8');
 assert(titleSvg.includes('class="title-staged title-playing"'));
 assert(titleSvg.includes('class="falling-letter"'));
 assert(titleSvg.includes('class="banner-entrance"'));
 assert(titleSvg.includes('@keyframes readwy-title-fall-v4'));
 assert(titleSvg.includes('@keyframes readwy-academy-once-v5'));
 assert(titleSvg.includes('id="rt-title-depth"'));
 assert(titleSvg.includes('.falling-letter,.settled-letter-glow{filter:url(#rt-title-depth)}'));
 assert(titleSvg.includes('5.2s ease-out var(--letter-delay,0s) infinite both'));
 assert(titleSvg.includes('1.45s ease-out 1 forwards'));
 assert(!titleSvg.includes('infinite !important'),'The banner must not spin continuously');
 assert(titleSvg.includes('href="readwy-title-cutout.png"'));
 assert(!titleSvg.includes('rt-tHalo'),'Startup title must not add its dark halo');
 for(const file of ['public/index.html','public/resources/station-scene.js']){
  const publicFile=fs.readFileSync(path.join(root,file),'utf8');
  if(file.endsWith('index.html')){
   assert(publicFile.includes(sceneScript),'Public app is missing the shared station renderer');
   assert(!publicFile.includes('<link rel="preload" as="image" href="UI%20and%20owl/interv%20file/realistic-study-atlas.png">'));
   const publicPayload=publicFile.match(/<script id="readwy-page-sources"[^>]*>([\s\S]*?)<\/script>/);
   assert(publicPayload,'Public app is missing its embedded payload');
   const publicPages=JSON.parse(publicPayload[1]);
   assert(publicPages.application.includes(startup.trim()),'Public startup script is out of sync');
   assert(publicPages.application.includes(scene.trim()),'Public application scene renderer is out of sync');
   assert(publicPages.train.includes(scene.trim()),'Public login scene renderer is out of sync');
  }else assert.equal(publicFile,scene,'Public station renderer is out of sync');
 }
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.equal(manifest.orientation,'landscape');
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'public','manifest.webmanifest'),'utf8')),manifest);
 assert.equal(fs.readFileSync(path.join(root,'public','resources','startup-slide.js'),'utf8').trim(),startup.trim());
 assert.equal(fs.readFileSync(path.join(root,'public','resources','startup-slide.css'),'utf8').trim(),fs.readFileSync(path.join(root,'resources','startup-slide.css'),'utf8').trim());
 assert.equal(fs.readFileSync(path.join(root,'public','resources','readwy-login-title.svg'),'utf8').trim(),titleSvg.trim());
 assert(!pages.train.includes('resources/startup-slide-backdrop.png'));
 assert(pages.train.includes("ART='resources/readwy-title-cutout.png'"));
});

test('embedded app scripts and slider code parse',()=>{
 const app=JSON.parse(payload[1]).application;
 for(const match of app.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(match[1].includes('application/json'))continue;
  new vm.Script(match[2],{filename:match[1]||'embedded app script'});
 }
 const start='<script data-source="resources/startup-slide.js">';
 const at=app.indexOf(start);
 assert(at>=0,'Missing startup slider source');
 const end=app.indexOf('</script>',at+start.length);
 new vm.Script(app.slice(at+start.length,end),{filename:'startup-slide.js'});
});
