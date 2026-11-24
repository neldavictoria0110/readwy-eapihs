const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('application/json')).map(m=>{const src=m[1].match(/src="([^"]+)"/);return {file:src?src[1]:'index.html',source:src?fs.readFileSync(path.join(root,src[1]),'utf8'):m[2]}});
const css=[{file:'index.html',source:[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n')},...[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>({file:m[1],source:fs.readFileSync(path.join(root,m[1]),'utf8')}))];
function exists(p,from='index.html'){if(!p||p.includes('${')||p.startsWith('#')||/^(data:|https?:|blob:)/.test(p))return;const target=path.resolve(root,path.dirname(from),decodeURIComponent(p.split('?')[0]));assert(target.startsWith(root+path.sep));assert(fs.existsSync(target),'Missing '+p+' referenced by '+from)}
test('every loaded script parses and all literal resources resolve',()=>{
 for(const script of scripts){new vm.Script(script.source,{filename:script.file});for(const m of script.source.matchAll(/(?:src|href)="([^"<>]+)"/g))exists(m[1]);for(const m of script.source.matchAll(/["']((?:resources|UI(?:%20| )and(?:%20| )owl)\/[^"'\n]*\.(?:png|svg|jpg|pdf|docx|xlsx))["']/g))exists(m[1])}
 for(const sheet of css)for(const m of sheet.source.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g))exists(m[1].trim(),sheet.file);
 for(const m of html.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g))exists(m[1]);
});
test('dynamic scenes, writing panels, grade documents and manifest icon exist',()=>{
 for(const name of ['startup','login','areas','map']){const rel='UI and owl/background/new-story/'+name+'-reference.png';const rootP=path.join(root,rel),pubP=path.join(root,'public',rel);assert(fs.existsSync(rootP)||fs.existsSync(pubP),'Missing '+rel+' referenced by index.html');}
 exists('resources/aral/station/station-hall.webp');
 exists('resources/station-journey.webp');
 exists('resources/wst/trial-wst.jpg');
 assert.deepEqual(fs.readFileSync(path.join(root,'resources/wst/trial-wst.jpg')),fs.readFileSync(path.join(root,'public/resources/wst/trial-wst.jpg')));
 for(const grade of [7,8,9,10])exists('resources/Assessment File/ORST Graded Passages/G'+grade+' GRADED PASSAGE.docx');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));for(const icon of manifest.icons)exists(icon.src);
});

test('PWA monogram icons match their declared sizes and deployed copies',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const size of [192,512]){
  const name=`resources/icons/readwy-${size}.png`,icon=manifest.icons.find(item=>item.src===name);
  assert(icon,`Manifest is missing ${name}`);
  assert.equal(icon.sizes,`${size}x${size}`);
 }
 assert(html.includes('resources/icons/readwy-180.png'),'Apple touch icon is missing');
 for(const size of [180,192,512]){
  const name=`readwy-${size}.png`,source=fs.readFileSync(path.join(root,'resources/icons',name));
  const deployed=fs.readFileSync(path.join(root,'public/resources/icons',name));
  assert.equal(source.toString('hex',0,8),'89504e470d0a1a0a',`${name} is not a PNG`);
  assert.equal(source.readUInt32BE(16),size,`${name} has the wrong width`);
  assert.equal(source.readUInt32BE(20),size,`${name} has the wrong height`);
  assert.deepEqual(deployed,source,`${name} is out of sync in public`);
 }
});
