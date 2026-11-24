const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const main=fs.readFileSync(__dirname+'/../../index.html','utf8');const source=Buffer.from(main.match(/<template id="readwy-playlab-source">([^<]+)<\/template>/)[1],'base64').toString();
const c={};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('const games='),source.lastIndexOf('\nconst $='))+';globalThis.items=games',c);
const entry=c.items.find(g=>g.id==='pipes'),script=entry.html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(){const context={};vm.createContext(context);vm.runInContext(script.slice(script.indexOf('class PipeRun'),script.indexOf('const canvas='))+';globalThis.Engine=PipeRun',context);const events=[],game=new context.Engine((type,data)=>events.push({type,...data}));game.start();return {game,events};}
function advance(game,seconds,input={}){for(let n=0;n<Math.ceil(seconds/.016);n++)game.step(.016,input);}
test('Pipe Runner appears as a playable Arcade entry with keyboard and touch controls',()=>{assert(entry);assert.equal(entry.category,'Arcade');assert(entry.tags.includes('mario'));new vm.Script(script);for(const id of ['left','right','jump','start'])assert(entry.html.includes('id="'+id+'"'));assert(!fs.readFileSync(__dirname+'/playlab.js','utf8').includes('Watch video'));});
test('movement collides with pipes, and jumps can clear the tallest pipe',()=>{const {game}=create();game.enemies=[];advance(game,.3);game.player.x=440;game.step(.02,{right:true});assert.equal(game.player.x,442);game.player.x=2000;game.player.y=game.floor-game.player.h;game.player.grounded=true;const floor=game.floor;let highest=game.player.y;for(let i=0;i<40;i++){game.step(.016,{jump:true});highest=Math.min(highest,game.player.y)}assert(floor-highest-game.player.h>=136);});
test('question blocks give one coin, and enemies can be stomped',()=>{const {game}=create();game.enemies=[];game.pickups=[];advance(game,.3);game.player.x=294;advance(game,.3,{jump:true});assert.equal(game.coins,1);const score=game.score;advance(game,1);advance(game,.3,{jump:true});assert.equal(game.coins,1);assert.equal(game.score,score);const e={x:600,y:424,w:32,h:32,min:590,max:650,v:0,alive:true};game.enemies=[e];Object.assign(game.player,{x:601,y:385,vy:180});game.step(.016);assert.equal(e.alive,false);assert(game.player.vy<0);assert.equal(game.score,score+200);});
test('checkpoint survives a fall and completed rounds emit exactly one result',()=>{const {game,events}=create();game.player.x=2800;game.step(.016);assert.equal(game.spawn,2730);game.player.y=610;game.step(.016);assert.equal(game.player.x,2730);assert.equal(game.lives,2);game.player.x=game.flag;game.step(.016);assert.equal(game.phase,'won');game.win();game.step(.02);assert.equal(events.filter(e=>e.type==='playlab-result').length,1);assert.equal(events.at(-1).won,true);game.start();assert.equal(game.coins,0);assert.equal(game.lives,3);for(let i=0;i<3;i++){game.player.y=610;game.step(.016)}assert.equal(game.phase,'lost');assert.equal(events.at(-1).won,false);});
function browserRuntime(){
 let now=1000,raf,watchdog;const listeners={},elements={};
 const ctx=new Proxy({},{get:(o,key)=>key in o?o[key]:()=>{}});
 const element=id=>elements[id]??={textContent:'',dataset:{},listeners:{},getContext:()=>ctx,focus(){},setPointerCapture(){},addEventListener(type,fn){this.listeners[type]=fn}};
 const c={document:{hidden:false,getElementById:element,addEventListener(){}},parent:{postMessage(){}},performance:{now:()=>now},requestAnimationFrame:fn=>{raf=fn},setInterval:fn=>{watchdog=fn},addEventListener:(type,fn)=>listeners[type]=fn};
 vm.createContext(c);vm.runInContext(script,c);
 return {elements,listeners,run:s=>vm.runInContext(s,c),frame(ms){now+=ms;raf(now)},fallback(ms){now+=ms;watchdog()},key(type,key){listeners[type]({key,repeat:false,preventDefault(){}})}};
}
test('real canvas tap starts, keyboard moves and jumps, and stalled frames catch up',()=>{
 const b=browserRuntime();assert.equal(b.run('game.phase'),'ready');b.elements.world.listeners.pointerdown();assert.equal(b.run('game.phase'),'playing');
 b.key('keydown','ArrowRight');b.frame(400);assert(b.run('game.player.x')>140,'400ms should advance about 100px, not a single 25ms step');assert(b.run('game.time')<179.7);
 b.key('keyup','ArrowRight');const x=b.run('game.player.x');b.frame(100);assert.equal(b.run('game.player.x'),x);
 b.key('keydown',' ');b.frame(100);assert(b.run('game.player.vy')<0);b.key('keyup',' ');
});
test('preview watchdog advances without RAF, and touch controls resume paused play',()=>{
 const b=browserRuntime();b.elements.start.onclick();b.elements.right.onpointerdown({preventDefault(){},pointerId:1});b.fallback(300);assert(b.run('game.player.x')>110);
 b.elements.right.listeners.pointerup();const x=b.run('game.player.x');b.fallback(150);assert.equal(b.run('game.player.x'),x);
 b.key('keydown','p');assert.equal(b.run('game.phase'),'paused');b.elements.jump.onpointerdown({preventDefault(){},pointerId:2});assert.equal(b.run('game.phase'),'playing');b.fallback(100);assert(b.run('game.player.vy')<0);
});
test('Start redraws immediately and explicit play survives a preview with no animation frames',()=>{
 const b=browserRuntime();assert.equal(b.elements.world.dataset.phase,'ready');b.elements.world.listeners.pointerdown();assert.equal(b.elements.world.dataset.phase,'playing');
 b.run('document.hidden=true');b.key('keydown','ArrowRight');b.fallback(800);assert(b.run('game.player.x')>200);assert(b.run('game.time')<179.3);
 b.key('keydown','p');assert.equal(b.elements.world.dataset.phase,'paused');
});
test('a quick jump tap is registered even between delayed animation frames',()=>{
 const b=browserRuntime();b.elements.start.onclick();b.fallback(300);assert.equal(b.run('game.player.grounded'),true);
 b.key('keydown',' ');assert(b.run('game.player.vy')<0,'jump must start immediately rather than waiting for RAF');b.key('keyup',' ');b.fallback(80);assert(b.run('game.player.y')<390);
});
