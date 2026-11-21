/* Real microphone PCM -> signed 16-bit WAV. Never rename a compressed file. */
const orstPCM={context:null,source:null,node:null,gain:null,blocks:[],samples:0,rate:0,generation:0};
function orstWavBlob(blocks,sampleRate){
 const length=blocks.reduce((n,block)=>n+block.length,0);if(!length)return null;
 const buffer=new ArrayBuffer(44+length*2),view=new DataView(buffer);
 const tag=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))};
 tag(0,'RIFF');view.setUint32(4,36+length*2,true);tag(8,'WAVE');tag(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,length*2,true);
 let offset=44;for(const block of blocks)for(const value of block){const sample=Math.max(-1,Math.min(1,Number.isFinite(value)?value:0));view.setInt16(offset,Math.round(sample*(sample<0?32768:32767)),true);offset+=2}
 return new Blob([buffer],{type:'audio/wav'});
}
function orstPreparePCM(){
 orstPCM.generation++;orstPCM.blocks=[];orstPCM.samples=0;orstPCM.rate=0;
 const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
 try{orstPCM.context=new Context();orstPCM.context.resume().catch(()=>{})}catch{orstPCM.context=null}
}
async function orstStartPCM(stream){
 const context=orstPCM.context;if(!context)return;
 const generation=orstPCM.generation,source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();analyser.fftSize=1024;source.connect(analyser);
 orstPCM.source=source;orstPCM.rate=context.sampleRate;orstCapture.meter={context,source,analyser,data:new Uint8Array(analyser.fftSize)};orstCapture.peak=0;orstCapture.samples=0;
 const collect=block=>{if(generation===orstPCM.generation&&orstPaint.recording&&orstPaint.recorder?.state==='recording'){orstPCM.blocks.push(block);orstPCM.samples+=block.length}};
 let node;
 if(context.audioWorklet&&typeof AudioWorkletNode!=='undefined'){
  const code="class ORSTPCM extends AudioWorkletProcessor { process(inputs,outputs) { const channels=inputs[0]; if(channels?.length){const mono=new Float32Array(channels[0].length);for(const channel of channels)for(let i=0;i<mono.length;i++)mono[i]+=channel[i]/channels.length;this.port.postMessage(mono,[mono.buffer]);}return true;}} registerProcessor('orst-pcm',ORSTPCM);";
  const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
  try{await context.audioWorklet.addModule(url);if(generation!==orstPCM.generation||!orstPaint.recording)return;node=new AudioWorkletNode(context,'orst-pcm');node.port.onmessage=event=>collect(event.data)}catch{}finally{URL.revokeObjectURL(url)}
 }
 if(!node){if(!context.createScriptProcessor)return;node=context.createScriptProcessor(4096,1,1);node.onaudioprocess=event=>collect(new Float32Array(event.inputBuffer.getChannelData(0)))}
 if(generation!==orstPCM.generation||!orstPaint.recording){node.disconnect();return}
 const gain=context.createGain();gain.gain.value=0;source.connect(node);node.connect(gain);gain.connect(context.destination);orstPCM.node=node;orstPCM.gain=gain;context.resume().catch(()=>{});
}
function orstFinishPCM(seconds){
 const enough=orstPCM.rate&&orstPCM.samples/orstPCM.rate>=Math.max(.08,seconds*.65);
 const blob=enough?orstWavBlob(orstPCM.blocks,orstPCM.rate):null;
 for(const node of [orstPCM.node,orstPCM.gain])try{node?.disconnect()}catch{}
 if(orstPCM.node?.port)orstPCM.node.port.onmessage=null;
 if(orstPCM.node)orstPCM.node.onaudioprocess=null;
 orstPCM.blocks=[];orstPCM.node=null;orstPCM.gain=null;orstPCM.generation++;return blob;
}
function orstCancelPCM(){orstFinishPCM(Infinity);const context=orstPCM.context;orstPCM.context=null;try{context?.close().catch(()=>{})}catch{}}
async function orstCompatibleAudio(blob){
 if(!blob?.size||/wav/i.test(blob.type))return blob;
 const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return blob;
 let context;try{context=new Context();const buffer=await context.decodeAudioData(await blob.arrayBuffer()),mono=new Float32Array(buffer.length);for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<data.length;i++)mono[i]+=data[i]/buffer.numberOfChannels}return orstWavBlob([mono],buffer.sampleRate)||blob}catch{return blob}finally{try{await context?.close()}catch{}}
}
