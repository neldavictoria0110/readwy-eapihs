/* Artwork-space outlines: decorative glow/shadow outside a button is not a button. */
function orstButtonShape(stage,action,fallback){
 const round=(box,r)=>({box,r}),circle=(x,y,r)=>({box:[x-r,y-r,x+r,y+r],circle:[x,y,r]});
 const [command,value]=action.split(':');
 if(stage===5&&action==='read-with-teacher')return round([426,396,610,433],18);
 if(stage===5&&action==='record-label')return round([245,396,414,433],18);
 if(stage===6&&command==='teacher-minus')return circle(1465,324.5+Number(value)*59,18);
 if(stage===6&&command==='teacher-plus')return circle(1551,324.5+Number(value)*59,18);
 if(stage===6&&action==='teacher-submit')return round([1233,841,1505,915],37);
 if(stage===6&&action==='teacher-back')return round([777,841,1004,915],37);
 if(command==='miscue'&&[5,6].includes(stage)&&typeof orstMiscueBox==='function')return round(orstMiscueBox(stage,Number(value)),13);
 if(stage===1&&action==='stage:2')return round([1120,718,1578,827],55);
 if(stage===2){if(command==='grade'){const i=Number(value)-7;return round([464+i%2*492,312+Math.floor(i/2)*264,923+i%2*492,548+Math.floor(i/2)*264],29)}if(command==='home')return round([1350,43,1625,121],39)}
 if(stage===3&&action==='stage:4')return round([798,750,1278,852],51);
 if(stage===4){if(command==='passage'){const i=Number(value);return round([464+i%2*475,256+Math.floor(i/2)*269,911+i%2*475,505+Math.floor(i/2)*269],28)}if(action==='stage:3')return round([803,805,1007,880],27)}
 if(stage===5){if(command==='record')return circle(419,340,47);if(command==='play')return {box:[274,459,298,489],polygon:[[275,460],[275,487],[296,474]]};if(command==='previous-reading')return round([670,707,925,784],25);if(command==='next-reading')return round([1154,707,1427,785],27);if(command==='miscue'){const i=Number(value);return round([244+i%2*200,600+Math.floor(i/2)*58,435+i%2*175,651+Math.floor(i/2)*58],15)}}
 if(stage===6){if(command==='play')return circle(477,348,45);if(command==='reread')return round([777,841,1004,915],37);if(command==='questions')return round([1233,841,1505,915],37);if(command==='details')return round([1193,730,1568,795],27);if(command==='miscue'){const i=Number(value);return round([1012,298+i*69,1570,365+i*69],15)}}
 if(stage===7){if(command==='question'){const i=Number(value);return circle(314+i%5*65,305+Math.floor(i/5)*66,27)}if(command==='answer'){const i='ABCD'.indexOf(value);return round([681,379+i*86,1372,453+i*86],20)}if(command==='previous-question')return round([672,744,928,823],25);if(command==='next-question')return round([1062,744,1378,823],26)}
 if(stage===8){if(command==='reread')return round([702,768,1062,860],46);if(command==='progress')return round([1095,763,1548,870],54)}
 if(stage===9){if(command==='passage'){const i=Number(value);return round([318+i*272,327,577+i*272,697],27)}if(action==='stage:4')return round([75,790,305,872],30);if(command==='continue')return round([992,791,1586,875],42)}
 if(stage===10){if(command==='report')return round([571,776,977,866],45);if(command==='home')return round([993,776,1553,866],45)}
 return round(fallback||[0,0,0,0],0);
}
function orstButtonPath(ctx,shape){
 ctx.beginPath();if(shape.polygon){shape.polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath()}
 else if(shape.circle){ctx.arc(...shape.circle,0,Math.PI*2)}
 else{const [x1,y1,x2,y2]=shape.box;ctx.roundRect(x1,y1,x2-x1,y2-y1,shape.r||0)}
}
function orstButtonPolygon(shape){
 if(shape.polygon)return shape.polygon.flat();
 if(shape.circle){const [x,y,r]=shape.circle;return Array.from({length:48},(_,i)=>[x+Math.cos(i*Math.PI/24)*r,y+Math.sin(i*Math.PI/24)*r]).flat()}
 const [x1,y1,x2,y2]=shape.box,r=shape.r||0;if(!r)return [x1,y1,x2,y1,x2,y2,x1,y2];
 return [[x2-r,y1+r,-Math.PI/2],[x2-r,y2-r,0],[x1+r,y2-r,Math.PI/2],[x1+r,y1+r,Math.PI]].flatMap(([x,y,start])=>Array.from({length:9},(_,i)=>[x+Math.cos(start+i*Math.PI/16)*r,y+Math.sin(start+i*Math.PI/16)*r]).flat());
}
function orstAreaShape(area){const fallback=orstControlBox(area);return orstButtonShape(orstPaint.stage,area?.dataset?.action||'',fallback)}
