/* Animate the supplied artwork in place. No sprites, UI panels or exported bitmap copies. */
const orstOwlPoses={
 1:{box:[815,55,1475,565],body:[1165,355,170,205],head:[1172,269,115,115],eyes:[[1146,269,29,32],[1218,289,24,29]],wings:[[922,238,116,172,-1],[1350,308,110,125,1]],flight:true},
 2:{box:[30,390,430,761],body:[223,594,178,160],head:[244,499,116,97],eyes:[[228,502,26,30],[298,518,21,26]]},
 3:{box:[100,245,548,679],body:[298,553,179,135],head:[304,394,115,100],eyes:[[278,399,32,36],[363,395,26,33]]},
 4:{box:[5,320,347,650],body:[175,536,150,110],head:[181,434,92,75],eyes:[[171,440,22,25],[232,440,18,23]],wings:[[307,475,30,65,1]]},
 5:{box:[0,324,208,634],body:[96,550,98,83],head:[107,445,85,67],eyes:[[85,449,22,25],[147,446,18,24]]},
 6:{box:[0,231,354,626],body:[169,524,151,101],head:[175,365,106,83],eyes:[[147,366,28,30],[220,361,22,27]]},
 7:{box:[4,417,430,751],body:[179,652,153,95],head:[236,546,94,78],eyes:[[213,544,23,26],[279,548,19,24]]},
 8:{box:[78,175,662,635],body:[304,499,194,134],head:[337,338,123,112],eyes:[[321,337,31,36],[404,359,25,30]],wings:[[543,411,106,145,1]]},
 9:{box:[0,356,313,699],body:[137,601,130,95],head:[149,482,95,79],eyes:[[128,479,23,26],[189,488,19,24]]},
 10:{box:[79,312,446,729],body:[252,621,154,104],head:[245,470,108,93],eyes:[[223,471,27,31],[298,462,23,29]]}
};
const orstOwlMotion={canvas:null,base:null,stage:0,frame:0,last:0,mesh:null,frames:0};
function orstMotionWeight(x,y,region){const [cx,cy,rx,ry]=region,q=((x-cx)/rx)**2+((y-cy)/ry)**2;return q>=1?0:(1-q)**2}
function orstOwlBlink(time,stage){const phase=(time+stage*.37)%5.9;for(const [start,length] of [[1.8,.29],[2.2,.23]]){const t=(phase-start)/length;if(t>=0&&t<=1)return Math.sin(Math.PI*t)**2}return 0}
function orstOwlPoint(x,y,time,pose,stage){
 const body=orstMotionWeight(x,y,pose.body),head=orstMotionWeight(x,y,pose.head),slow=time*1.6+stage*.45;
 let dx=(Math.sin(slow*.67)*(pose.flight?3.2:1.5))*body,dy=Math.sin(slow)*(pose.flight?6:2.3)*body;
 // A small attentive head tilt; feet remain planted on perched pages.
 dx+=(y-pose.head[1])*Math.sin(slow*.53)*.017*head;
 dy-=(x-pose.head[0])*Math.sin(slow*.53)*.017*head;
 for(const wing of pose.wings||[]){const weight=orstMotionWeight(x,y,wing);dy+=Math.sin(time*(pose.flight?5.4:2.2))*weight*(pose.flight?19:4.5);dx+=Math.cos(time*(pose.flight?5.4:2.2))*weight*wing[4]*(pose.flight?4:1.3)}
 const blink=orstOwlBlink(time,stage);
 for(const eye of pose.eyes){const ex=(x-eye[0])/eye[2],ey=(y-eye[1])/eye[3];const edge=Math.max(0,1-(ex/1.8)**2-(ey/1.9)**2);dy-=(y-eye[1])*blink*.98*edge}
 return [x+dx,y+dy];
}
function orstOwlMesh(pose){
 const [x1,y1,x2,y2]=pose.box,xs=[],ys=[];
 for(let x=x1;x<x2;x+=26)xs.push(x);xs.push(x2);
 for(let y=y1;y<y2;y+=26)ys.push(y);ys.push(y2);
 for(const [x,y,rx,ry] of pose.eyes){for(const n of [-1.8,-1,-.45,0,.45,1,1.8]){xs.push(Math.max(x1,Math.min(x2,x+n*rx)));ys.push(Math.max(y1,Math.min(y2,y+n*ry)))}}
 return {xs:[...new Set(xs)].sort((a,b)=>a-b),ys:[...new Set(ys)].sort((a,b)=>a-b)};
}
function orstDrawOwlTriangle(ctx,base,source,dest){
 const [a,b,c]=source,[p,q,r]=dest,den=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(!den)return;
 const m11=((q[0]-p[0])*(c[1]-a[1])-(r[0]-p[0])*(b[1]-a[1]))/den,m21=((r[0]-p[0])*(b[0]-a[0])-(q[0]-p[0])*(c[0]-a[0]))/den;
 const m12=((q[1]-p[1])*(c[1]-a[1])-(r[1]-p[1])*(b[1]-a[1]))/den,m22=((r[1]-p[1])*(b[0]-a[0])-(q[1]-p[1])*(c[0]-a[0]))/den;
 const cx=(p[0]+q[0]+r[0])/3,cy=(p[1]+q[1]+r[1])/3;
 ctx.save();ctx.beginPath();for(let i=0;i<3;i++){const v=dest[i],length=Math.hypot(v[0]-cx,v[1]-cy)||1,x=v[0]+(v[0]-cx)/length*.45,y=v[1]+(v[1]-cy)/length*.45;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.clip();
 ctx.setTransform(m11,m12,m21,m22,p[0]-m11*a[0]-m21*a[1],p[1]-m12*a[0]-m22*a[1]);
 const minX=Math.min(a[0],b[0],c[0]),minY=Math.min(a[1],b[1],c[1]),w=Math.max(a[0],b[0],c[0])-minX,h=Math.max(a[1],b[1],c[1])-minY;
 const sx=Math.max(0,minX-2),sy=Math.max(0,minY-2),sw=Math.min(base.width-sx,w+4),sh=Math.min(base.height-sy,h+4);ctx.drawImage(base,sx,sy,sw,sh,sx,sy,sw,sh);ctx.restore();
}
function orstDrawOwlFrame(time){
 const state=orstOwlMotion,pose=orstOwlPoses[state.stage];if(!pose||!state.base||!state.canvas?.isConnected)return;
 const ctx=state.canvas.getContext('2d'),[x1,y1,x2,y2]=pose.box;
 ctx.drawImage(state.base,x1,y1,x2-x1,y2-y1,x1,y1,x2-x1,y2-y1);
 const {xs,ys}=state.mesh,points=ys.map(y=>xs.map(x=>orstOwlPoint(x,y,time,pose,state.stage)));
 for(let j=0;j<ys.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const a=[xs[i],ys[j]],b=[xs[i+1],ys[j]],c=[xs[i+1],ys[j+1]],d=[xs[i],ys[j+1]];
  orstDrawOwlTriangle(ctx,state.base,[a,b,c],[points[j][i],points[j][i+1],points[j+1][i+1]]);
  orstDrawOwlTriangle(ctx,state.base,[a,c,d],[points[j][i],points[j+1][i+1],points[j+1][i]]);
 }
 state.frames++;
}
function orstRefreshOwlMotion(canvas){
 const state=orstOwlMotion,changed=state.canvas!==canvas||state.stage!==orstPaint.stage;
 state.canvas=canvas;state.stage=orstPaint.stage;
 if(!state.base)state.base=document.createElement('canvas');state.base.width=canvas.width;state.base.height=canvas.height;state.base.getContext('2d').drawImage(canvas,0,0);
 if(changed)state.mesh=orstOwlMesh(orstOwlPoses[state.stage]);
 if(!state.frame&&!document.hidden&&!orstReducedMotion())state.frame=setTimeout(orstAnimateOwl,0);
}
function orstAnimateOwl(){
 const state=orstOwlMotion;state.frame=0;
 if(!state.canvas?.isConnected||document.hidden||orstReducedMotion())return;
 orstDrawOwlFrame(performance.now()/1000);
 state.frame=setTimeout(orstAnimateOwl,1000/30);
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&orstOwlMotion.canvas?.isConnected&&!orstOwlMotion.frame)orstOwlMotion.frame=setTimeout(orstAnimateOwl,0)});
