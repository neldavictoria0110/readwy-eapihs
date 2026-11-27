(()=>{
 /* READwy Mathematics and Filipino journeys (Grades 7–10).
    Every item is original READwy content. Mathematics items are built from grade-level templates whose
    wrong choices come from common mistakes; Filipino items are written per grade. Internal ids, storage keys
    and global function names are unchanged. */
 const STATIONS={
  Mathematics:[
   {id:'number',name:'Number Sense'},
   {id:'algebra',name:'Algebra'},
   {id:'geometry',name:'Geometry & Measurement'},
   {id:'functions',name:'Patterns & Functions'},
   {id:'data',name:'Statistics & Probability'},
   {id:'modeling',name:'Problem Solving & Modeling'}
  ],
  Filipino:[
   {id:'vocabulary',name:'Talasalitaan'},
   {id:'reading',name:'Pagbasa'},
   {id:'grammar',name:'Gramatika at Wika'},
   {id:'speaking',name:'Pakikinig at Pagsasalita'},
   {id:'writing',name:'Pagsulat at Pagrebisa'},
   {id:'research',name:'Pananaliksik at Pagpapahayag'}
  ]
 };
 const TOPICS={
  Mathematics:{
   7:{number:'Integers, fractions, decimals and percents',algebra:'Expressions and linear equations',geometry:'Angles, polygons, area and circles',functions:'Number patterns and simple rules',data:'Mean, median, mode, range and chance',modeling:'Rates, discounts, savings and fencing problems'},
   8:{number:'Laws of exponents, scientific notation and square roots',algebra:'Factoring, systems of equations and inequalities',geometry:'Parallel lines, triangles and the Pythagorean theorem',functions:'Slope, intercepts and linear functions',data:'Probability and counting',modeling:'Proportions, budgets and linear models'},
   9:{number:'Radicals and rational exponents',algebra:'Quadratic equations',geometry:'Similarity, parallelograms and trigonometry',functions:'Quadratic functions and variation',data:'Compound events and data summaries',modeling:'Area, motion, shadows and work problems'},
   10:{number:'Arithmetic and geometric sequences',algebra:'Polynomials, remainder and factor theorems',geometry:'Circles and coordinate geometry',functions:'Polynomial functions and their graphs',data:'Permutations, combinations, probability and quartiles',modeling:'Savings, growth, selection and arc problems'}
  },
  Filipino:{
   7:{vocabulary:'Kahulugan ng salita batay sa pangungusap',reading:'Pagbasa ng tekstong pasalaysay at nagbibigay-kaalaman',grammar:'Ng at nang, rin at din, aspekto ng pandiwa, bantas',speaking:'Pagpapakilala, pagtatanong at pakikinig sa panuto',writing:'Talatang naglalarawan at nagsasalaysay',research:'Pinagkunan ng impormasyon at pagtatala'},
   8:{vocabulary:'Kahulugan ng salita sa iba’t ibang konteksto',reading:'Opinyon at katotohanan, paghahambing, pananaw',grammar:'Hudyat ng sanhi at bunga, paghahambing, kohesyon',speaking:'Pagsang-ayon at pagsalungat, panayam, pag-uulat',writing:'Opinyon, paghahambing, balita at rebyu',research:'Paraphrase, buod, sarbey at pagbanggit ng sanggunian'},
   9:{vocabulary:'Malalalim na salita at matatalinghagang pahayag',reading:'Editoryal, pangangatwiran, tema at simbolismo',grammar:'Pokus ng pandiwa, tayutay, pang-abay, paninsay',speaking:'Talumpati, panghihikayat at pagbibigay-katuwiran',writing:'Editoryal, talumpati at pagsusuri',research:'Pagkiling, etika, datos at sanhi laban sa ugnayan'},
   10:{vocabulary:'Salitang akademiko at pampanitikan',reading:'Mapanuring pagbasa ng midya, panitikan at pananaliksik',grammar:'Pokus sa ganapan, sanhi at direksiyon; kohesyon; salin',speaking:'Debate, round table at mapanuring pakikinig',writing:'Posisyong papel, kritikal na rebyu at abstrak',research:'Sintesis, kredibilidad, sitasyon at etika ng pananaliksik'}
  }
 };
 const GRADE_FOCUS={
  Mathematics:{
   7:'Integers, fractions and percents; expressions and linear equations; angles, polygons and circles; patterns; mean, median, mode and chance.',
   8:'Exponents and scientific notation; factoring, systems and inequalities; parallel lines and triangles; slope and linear functions; probability and counting.',
   9:'Radicals and rational exponents; quadratic equations and functions; variation; similarity, parallelograms and trigonometry; compound events.',
   10:'Sequences and series; polynomials and the remainder and factor theorems; circles and coordinate geometry; permutations, combinations and quartiles.'
  },
  Filipino:{
   7:'Talasalitaan sa konteksto, pag-unawa sa tekstong pasalaysay at nagbibigay-kaalaman, wastong gamit ng salita at bantas, at organisadong talata.',
   8:'Opinyon at katotohanan, paghahambing at pananaw sa teksto, hudyat ng sanhi at bunga, at pagsulat ng opinyon, balita at rebyu.',
   9:'Mapanuring pagbasa ng editoryal at akdang pampanitikan, pokus ng pandiwa, tayutay, panghihikayat at etika ng pananaliksik.',
   10:'Pagsusuri ng midya at panitikan, sintesis ng mga sanggunian, pokus ng pandiwa at kohesyon, debate, at posisyong papel.'
  }
 };

 /* ---------- formatting helpers ---------- */
 const MINUS='−';
 const neg=s=>String(s).replace(/^-/,MINUS);
 const N=x=>{const r=Math.round(Number(x)*100)/100;return neg(Number.isInteger(r)?String(r):String(r))};
 const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
 const F=(n,d)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;return d===1?N(n):neg(`${n}/${d}`)};
 const P=x=>`₱${N(x)}`;
 const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
 const sup=n=>String(n).split('').map(c=>SUP[c]||c).join('');
 const xp=n=>n===1?'x':n===0?'1':`x${sup(n)}`;
 // "3x + 8", "3x − 2", "−x + 4"
 const lin=(m,b,v='x')=>{const mt=m===0?'':m===1?v:m===-1?`${MINUS}${v}`:`${neg(m)}${v}`;if(!mt)return N(b);return b===0?mt:`${mt} ${b<0?MINUS:'+'} ${Math.abs(b)}`};
 const pick=(v,arr)=>arr[v%arr.length];
 function shuffleChoices(prompt,choices){
  const shift=Array.from(String(prompt)).reduce((sum,char)=>(sum+char.charCodeAt(0))%choices.length,0);
  choices.push(...choices.splice(0,shift));return choices
 }
 // One multiple-choice item: the answer plus up to three distinct wrong choices (filled from nearby values if needed).
 function mc(prompt,answer,wrongs,explanation,context=''){
  const a=String(answer),choices=[a];
  for(const w of wrongs.map(String))if(w&&!choices.includes(w)&&choices.length<4)choices.push(w);
  const base=Number(String(a).replace(MINUS,'-').replace(/[^0-9.\-]/g,''));
  if(choices.length<4&&Number.isFinite(base)){
   const pre=a.match(/^[^0-9\-−]*/)[0],post=a.match(/[^0-9.]*$/)[0];
   for(const d of [1,-1,2,-2,3,5,10]){const c=pre+N(base+d)+post;if(!choices.includes(c))choices.push(c);if(choices.length===4)break}
  }
  return {type:'choice',prompt,choices:shuffleChoices(prompt,choices),answer:a,explanation,context}
 }

 /* ---------- Mathematics item bank: MATH[grade][station] = templates (variant) => item ---------- */
 const MATH={
  7:{
   number:[
    v=>{const a=pick(v,[3,5,7]),b=pick(v,[8,11,13]);return mc(`What is ${a} + (${MINUS}${b})?`,N(a-b),[N(a+b),N(b-a),N(-(a+b))],`The signs are different, so subtract the absolute values: ${b} ${MINUS} ${a} = ${b-a}. Keep the sign of the number with the larger absolute value (${MINUS}${b}). Answer: ${N(a-b)}.`)},
    v=>{const a=pick(v,[4,6,9]),b=pick(v,[7,5,8]);return mc(`What is (${MINUS}${a}) × (${MINUS}${b})?`,N(a*b),[N(-a*b),N(-(a+b)),N(a+b)],`A negative times a negative is positive: ${a} × ${b} = ${a*b}.`)},
    v=>{const [a,b,c,d]=pick(v,[[1,2,1,3],[2,3,1,4],[1,4,2,5]]);return mc(`What is ${a}/${b} + ${c}/${d}?`,F(a*d+b*c,b*d),[`${a+c}/${b+d}`,`${a+c}/${b*d}`,`${a*c}/${b*d}`],`Use a common denominator: ${a}/${b} = ${a*d}/${b*d} and ${c}/${d} = ${b*c}/${b*d}. Add the numerators: ${a*d+b*c}/${b*d} = ${F(a*d+b*c,b*d)}. Do not add the denominators.`)},
    v=>{const d=pick(v,[0.45,0.08,1.2]);return mc(`Write ${d} as a percent.`,`${N(d*100)}%`,[`${N(d)}%`,`${N(d*10)}%`,`${N(d*1000)}%`],`Multiply the decimal by 100: ${d} × 100 = ${N(d*100)}, so ${d} = ${N(d*100)}%.`)},
    v=>{const [p,n]=pick(v,[[15,240],[35,180],[12.5,320]]),ans=p*n/100;return mc(`What is ${p}% of ${n}?`,N(ans),[N(p*n/10),N(n-ans),N(n/p)],`${p}% of ${n} = ${p}/100 × ${n} = ${N(ans)}.`)}
   ],
   algebra:[
    v=>{const [m,c,x]=pick(v,[[3,4,-2],[5,2,-3],[4,7,-1]]);return mc(`Evaluate ${m}x ${MINUS} ${c} when x = ${N(x)}.`,N(m*x-c),[N(-m*x-c),N(m*x+c),N(-(m*x-c))],`Substitute: ${m}(${N(x)}) ${MINUS} ${c} = ${N(m*x)} ${MINUS} ${c} = ${N(m*x-c)}.`)},
    v=>{const [a,b,c,d]=pick(v,[[4,3,1,5],[6,2,4,9],[7,8,3,1]]);return mc(`Simplify ${a}x + ${b} ${MINUS} ${c===1?'':c}x + ${d}.`,lin(a-c,b+d),[lin(a+c,b+d),lin(a-c,b-d),`${a-c+b+d}x`],`Combine like terms: (${a} ${MINUS} ${c})x + (${b} + ${d}) = ${lin(a-c,b+d)}. Terms with x and numbers without x cannot be combined.`)},
    v=>{const [a,b]=pick(v,[[7,12],[9,4],[15,6]]);return mc(`Solve for x: x ${MINUS} ${a} = ${b}.`,N(b+a),[N(b-a),N(a-b),N(a*b)],`Add ${a} to both sides: x = ${b} + ${a} = ${b+a}.`)},
    v=>{const [a,b,c]=pick(v,[[3,5,26],[4,7,39],[6,9,45]]);return mc(`Solve for x: ${a}x + ${b} = ${c}.`,N((c-b)/a),[N((c+b)/a),N(c/a-b),N(c-b-a)],`Subtract ${b}: ${a}x = ${c-b}. Divide by ${a}: x = ${N((c-b)/a)}.`)},
    v=>{const [txt,ans,w]=pick(v,[['five less than twice a number n',`2n ${MINUS} 5`,[`5 ${MINUS} 2n`,`2(n ${MINUS} 5)`,'2n + 5']],['three more than the product of 4 and n','4n + 3',['4(n + 3)','3n + 4','4 + n + 3']],['the quotient of n and 6, decreased by 2',`n/6 ${MINUS} 2`,[`6/n ${MINUS} 2`,`(n ${MINUS} 2)/6`,`2 ${MINUS} n/6`]]]);return mc(`Which expression means “${txt}”?`,ans,w,`Translate in order: “${txt}” is written ${ans}. Watch the order in “less than” and where the grouping goes.`)}
   ],
   geometry:[
    v=>{const a=pick(v,[38,57,71]);return mc(`Two angles are complementary. One angle measures ${a}°. What is the other angle?`,`${90-a}°`,[`${180-a}°`,`${90+a}°`,`${a}°`],`Complementary angles add up to 90°: 90° ${MINUS} ${a}° = ${90-a}°.`)},
    v=>{const a=pick(v,[65,112,143]);return mc(`Two angles are supplementary. One angle measures ${a}°. What is the other angle?`,`${180-a}°`,[`${Math.abs(90-a)}°`,`${180+a}°`,`${360-a}°`],`Supplementary angles add up to 180°: 180° ${MINUS} ${a}° = ${180-a}°.`)},
    v=>{const [n,name]=pick(v,[[5,'pentagon'],[6,'hexagon'],[8,'octagon']]);return mc(`What is the sum of the interior angles of a ${name}?`,`${(n-2)*180}°`,[`${n*180}°`,`${(n-1)*180}°`,'360°'],`Use (n ${MINUS} 2) × 180°. A ${name} has ${n} sides: (${n} ${MINUS} 2) × 180° = ${(n-2)*180}°.`)},
    v=>{const [b,h]=pick(v,[[10,6],[14,9],[7,12]]);return mc(`A triangle has a base of ${b} cm and a height of ${h} cm. What is its area?`,`${N(b*h/2)} cm²`,[`${b*h} cm²`,`${b+h} cm²`,`${2*(b+h)} cm²`],`Area of a triangle = (base × height) ÷ 2 = (${b} × ${h}) ÷ 2 = ${N(b*h/2)} cm².`)},
    v=>{const r=pick(v,[5,3,10]);return mc(`Use π ≈ 3.14. What is the area of a circle with radius ${r} cm?`,`${N(3.14*r*r)} cm²`,[`${N(2*3.14*r)} cm²`,`${N(3.14*4*r*r)} cm²`,`${N(3.14*r)} cm²`],`Area = πr² = 3.14 × ${r}² = 3.14 × ${r*r} = ${N(3.14*r*r)} cm². (2πr is the circumference, not the area.)`)}
   ],
   functions:[
    v=>{const [s,d]=pick(v,[[4,6],[-3,4],[15,-4]]),t=[0,1,2,3].map(i=>N(s+i*d)).join(', ');return mc(`What is the next term? ${t}, …`,N(s+4*d),[N(s+5*d),N(s+3*d),N(s+4*d+1)],`The pattern changes by ${N(d)} each time. Next term: ${N(s+3*d)} + (${N(d)}) = ${N(s+4*d)}.`)},
    v=>{const [s,d,n]=pick(v,[[5,3,10],[2,7,8],[30,-4,12]]);return mc(`A pattern starts at ${s} and changes by ${N(d)} each step. What is term number ${n}?`,N(s+(n-1)*d),[N(s+n*d),N(n*d),N(s+(n+1)*d)],`Term n = first term + (n ${MINUS} 1) × change = ${s} + (${n-1})(${N(d)}) = ${N(s+(n-1)*d)}.`)},
    v=>{const [m,b]=pick(v,[[2,3],[3,-1],[5,2]]),pts=[1,2,3].map(x=>`(${x}, ${N(m*x+b)})`).join(', ');return mc(`Which rule fits all the points ${pts}?`,`y = ${lin(m,b)}`,[`y = ${lin(m+b,0)}`,`y = ${lin(1,m+b-1)}`,`y = ${lin(m,0)}`],`When x goes up by 1, y goes up by ${m}, so y = ${m}x + b. Using (1, ${N(m+b)}): b = ${N(b)}. Rule: y = ${lin(m,b)}. Check every point, not just the first.`)},
    v=>{const [m,b,x]=pick(v,[[4,-3,5],[-2,7,3],[6,-5,-2]]);return mc(`If y = ${lin(m,b)}, what is y when x = ${N(x)}?`,N(m*x+b),[N(m*x-b),N(m+x+b),N(m*(x+b))],`Substitute: ${N(m)}(${N(x)}) + (${N(b)}) = ${N(m*x)} + (${N(b)}) = ${N(m*x+b)}.`)},
    v=>{const [m,b,x]=pick(v,[[2,-1,3],[3,4,2],[-1,5,4]]),y=m*x+b;return mc(`Which ordered pair satisfies y = ${lin(m,b)}?`,`(${N(x)}, ${N(y)})`,[`(${N(y)}, ${N(x)})`,`(${N(x)}, ${N(m*x-b)})`,`(${N(x+1)}, ${N(y)})`],`Substitute x = ${N(x)}: y = ${N(m)}(${N(x)}) + (${N(b)}) = ${N(y)}, so (${N(x)}, ${N(y)}) works. The first number in a pair is x.`)}
   ],
   data:[
    v=>{const L=pick(v,[[12,15,9,20,14],[7,11,8,10],[23,18,25,30,19]]),sum=L.reduce((a,b)=>a+b,0),s=[...L].sort((a,b)=>a-b),med=s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;return mc(`What is the mean of ${L.join(', ')}?`,N(sum/L.length),[N(med),N(s[s.length-1]-s[0]),N(sum/(L.length+1))],`Add the values (${sum}) and divide by how many there are (${L.length}): ${sum} ÷ ${L.length} = ${N(sum/L.length)}.`)},
    v=>{const L=pick(v,[[3,8,5,12],[12,7,15,9,4,10],[21,18,25,30]]),s=[...L].sort((a,b)=>a-b),i=s.length/2,med=(s[i-1]+s[i])/2,mean=L.reduce((a,b)=>a+b,0)/L.length;return mc(`What is the median of ${L.join(', ')}?`,N(med),[N(mean),N(s[i-1]),N(s[i])],`Order the data: ${s.join(', ')}. With an even count, the median is the mean of the two middle values: (${s[i-1]} + ${s[i]}) ÷ 2 = ${N(med)}.`)},
    v=>{const [L,mode,second]=pick(v,[[[4,7,7,2,9,7,2],7,2],[[15,12,15,18,12,15,20],15,12],[[3,3,5,6,6,6,8],6,3]]);return mc(`What is the mode of ${L.join(', ')}?`,N(mode),[N(second),N(L.filter(x=>x===mode).length),N(Math.max(...L))],`The mode is the value that appears most often. ${mode} appears ${L.filter(x=>x===mode).length} times.`)},
    v=>{const L=pick(v,[[18,25,12,30,21],[6,14,9,3,11],[45,52,38,60,41]]),mx=Math.max(...L),mn=Math.min(...L);return mc(`What is the range of ${L.join(', ')}?`,N(mx-mn),[N(mx),N(mn),N(Math.abs(L[L.length-1]-L[0]))],`Range = highest ${MINUS} lowest = ${mx} ${MINUS} ${mn} = ${mx-mn}.`)},
    v=>{const [r,b,g]=pick(v,[[3,4,3],[4,6,5],[2,7,3]]),t=r+b+g;return mc(`A bag has ${r} red, ${b} blue and ${g} green marbles. One marble is picked without looking. What is P(blue)?`,F(b,t),[F(b,r+g),F(t-b,t),F(1,t)],`P(blue) = number of blue ÷ total = ${b}/${t} = ${F(b,t)}.`)}
   ],
   modeling:[
    v=>{const [q1,p1,q2,p2]=pick(v,[[3,96,5,150],[4,130,6,189],[2,57,5,140]]),u1=p1/q1,u2=p2/q2,best=Math.min(u1,u2);return mc(`Pack A has ${q1} pens for ₱${p1}. Pack B has ${q2} pens for ₱${p2}. What is the lower price per pen?`,P(best),[P(Math.max(u1,u2)),P((p2-p1)/(q2-q1)),P((p1+p2)/(q1+q2))],`Unit price A = ₱${p1} ÷ ${q1} = ${P(u1)}; unit price B = ₱${p2} ÷ ${q2} = ${P(u2)}. The lower unit price is ${P(best)}.`)},
    v=>{const [p,d]=pick(v,[[450,20],[1200,15],[680,25]]);return mc(`A bag costs ₱${p}. It is on sale at ${d}% off. What is the sale price?`,P(p*(100-d)/100),[P(p*d/100),P(p-d),P(p*(100+d)/100)],`Discount = ${d}% of ₱${p} = ${P(p*d/100)}. Sale price = ₱${p} ${MINUS} ${P(p*d/100)} = ${P(p*(100-d)/100)}.`)},
    v=>{const [s,d,t]=pick(v,[[120,35,330],[50,45,365],[200,60,560]]);return mc(`Ana has ₱${s} and saves ₱${d} every week. After how many weeks will she have ₱${t}?`,N((t-s)/d),[N(t/d),N((t+s)/d),N(t-s)],`Write ${s} + ${d}w = ${t}. Subtract ${s}: ${d}w = ${t-s}. Divide: w = ${N((t-s)/d)} weeks.`)},
    v=>{const [l,w,c]=pick(v,[[12,8,45],[15,6,60],[20,9,35]]);return mc(`A rectangular garden is ${l} m long and ${w} m wide. Fencing costs ₱${c} per meter. How much will it cost to fence the whole garden?`,P(2*(l+w)*c),[P(l*w*c),P((l+w)*c),P(2*(l+w))],`Fence goes around the garden, so use the perimeter: 2(${l} + ${w}) = ${2*(l+w)} m. Cost = ${2*(l+w)} × ₱${c} = ${P(2*(l+w)*c)}.`)}
   ]
  },
  8:{
   number:[
    v=>{const [a,b]=pick(v,[[3,4],[5,2],[7,3]]);return mc(`Simplify ${xp(a)} · ${xp(b)}.`,xp(a+b),[xp(a*b),xp(Math.abs(a-b)),`2${xp(a+b)}`],`When multiplying powers with the same base, add the exponents: ${a} + ${b} = ${a+b}, so the answer is ${xp(a+b)}.`)},
    v=>{const [a,b]=pick(v,[[2,3],[4,2],[3,5]]);return mc(`Simplify (${xp(a)})${sup(b)}.`,xp(a*b),[xp(a+b),`${b}${xp(a)}`,`${a}${xp(b)}`],`A power of a power: multiply the exponents. ${a} × ${b} = ${a*b}, so the answer is ${xp(a*b)}.`)},
    v=>{const [a,n]=pick(v,[[2,3],[5,2],[10,4]]),p=a**n;return mc(`What is ${a}${sup(-n)}?`,`1/${p}`,[N(-p),N(-a*n),N(p)],`A negative exponent means a reciprocal: ${a}${sup(-n)} = 1/${a}${sup(n)} = 1/${p}. It is not a negative number.`)},
    v=>pick(v,[
     ()=>mc('Write 0.00056 in scientific notation.',`5.6 × 10${sup(-4)}`,[`5.6 × 10${sup(4)}`,`5.6 × 10${sup(-3)}`,`56 × 10${sup(-5)}`],'Move the decimal point 4 places to the right to get 5.6 (a number from 1 to less than 10). Moving right means a negative exponent: 5.6 × 10⁻⁴.'),
     ()=>mc('Write 3 400 000 in scientific notation.',`3.4 × 10${sup(6)}`,[`3.4 × 10${sup(5)}`,`34 × 10${sup(5)}`,`3.4 × 10${sup(-6)}`],'Move the decimal point 6 places to the left to get 3.4. Large numbers have a positive exponent: 3.4 × 10⁶.'),
     ()=>mc('Write 0.0702 in scientific notation.',`7.02 × 10${sup(-2)}`,[`7.02 × 10${sup(2)}`,`7.2 × 10${sup(-2)}`,`70.2 × 10${sup(-3)}`],'Move the decimal point 2 places to the right to get 7.02. Keep every digit, including the zero inside: 7.02 × 10⁻².')
    ])(),
    v=>{const n=pick(v,[50,90,130]),k=Math.floor(Math.sqrt(n));return mc(`√${n} lies between which two consecutive whole numbers?`,`${k} and ${k+1}`,[`${k-1} and ${k}`,`${k+1} and ${k+2}`,`${n/2} and ${n/2+1}`],`${k}² = ${k*k} and ${k+1}² = ${(k+1)*(k+1)}. Since ${k*k} < ${n} < ${(k+1)*(k+1)}, √${n} is between ${k} and ${k+1}.`)}
   ],
   algebra:[
    v=>{const [a,b]=pick(v,[[6,9],[8,12],[10,15]]),g=gcd(a,b);return mc(`Factor completely: ${a}x² + ${b}x.`,`${g}x(${a/g}x + ${b/g})`,[`${g}(${a/g}x² + ${b/g}x)`,`x(${a}x + ${b})`,`${g}x(${a/g}x + ${b})`],`The greatest common factor of ${a}x² and ${b}x is ${g}x. Divide each term by ${g}x: ${g}x(${a/g}x + ${b/g}).`)},
    v=>{const k=pick(v,[7,9,5]);return mc(`Factor: x² ${MINUS} ${k*k}.`,`(x + ${k})(x ${MINUS} ${k})`,[`(x ${MINUS} ${k})²`,`(x + ${k})²`,`x(x ${MINUS} ${k*k})`],`x² ${MINUS} ${k*k} is a difference of two squares: a² ${MINUS} b² = (a + b)(a ${MINUS} b), so (x + ${k})(x ${MINUS} ${k}).`)},
    v=>{const [p,q]=pick(v,[[3,5],[2,7],[4,6]]);return mc(`Factor: x² + ${p+q}x + ${p*q}.`,`(x + ${p})(x + ${q})`,[`(x ${MINUS} ${p})(x ${MINUS} ${q})`,`(x + 1)(x + ${p*q})`,`(x + ${p})(x ${MINUS} ${q})`],`Find two numbers whose product is ${p*q} and whose sum is ${p+q}: ${p} and ${q}. So x² + ${p+q}x + ${p*q} = (x + ${p})(x + ${q}).`)},
    v=>{const [s,d]=pick(v,[[12,4],[15,3],[20,6]]);return mc(`Solve the system: x + y = ${s} and x ${MINUS} y = ${d}. What is x?`,N((s+d)/2),[N((s-d)/2),N(s+d),N(s-d)],`Add the two equations: 2x = ${s+d}, so x = ${N((s+d)/2)}. (y = ${N((s-d)/2)}.)`)},
    v=>{const [a,b,c]=pick(v,[[3,4,11],[2,7,9],[4,3,21]]);return mc(`Solve: ${a}x ${MINUS} ${b} < ${c}.`,`x < ${N((c+b)/a)}`,[`x > ${N((c+b)/a)}`,`x < ${N((c-b)/a)}`,`x ≤ ${N((c+b)/a)}`],`Add ${b}: ${a}x < ${c+b}. Divide by ${a} (positive, so the sign stays): x < ${N((c+b)/a)}.`)}
   ],
   geometry:[
    v=>pick(v,[
     ()=>mc('Two parallel lines are cut by a transversal. One angle is 72°. What is its alternate interior angle?','72°',['108°','18°','288°'],'Alternate interior angles formed by parallel lines are equal, so the angle is 72°.'),
     ()=>mc('Two parallel lines are cut by a transversal. One interior angle is 115°. What is the same-side interior angle?','65°',['115°','25°','245°'],'Same-side interior angles are supplementary: 180° − 115° = 65°.'),
     ()=>mc('Two parallel lines are cut by a transversal. One angle is 48°. What is its corresponding angle?','48°',['132°','42°','312°'],'Corresponding angles formed by parallel lines are equal, so the angle is 48°.')
    ])(),
    v=>{const [a,b]=pick(v,[[47,68],[90,35],[110,25]]);return mc(`Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`,`${180-a-b}°`,[`${a+b}°`,`${360-a-b}°`,`${Math.abs(90-a)}°`],`The angles of a triangle add up to 180°: 180° ${MINUS} ${a}° ${MINUS} ${b}° = ${180-a-b}°.`)},
    v=>{const [a,b]=pick(v,[[40,75],[55,62],[33,90]]);return mc(`In a triangle, two interior angles measure ${a}° and ${b}°. What is the exterior angle at the third vertex?`,`${a+b}°`,[`${180-a-b}°`,`${Math.abs(a-b)}°`,`${360-a-b}°`,`${180-a}°`],`An exterior angle equals the sum of the two remote interior angles: ${a}° + ${b}° = ${a+b}°.`)},
    v=>{const [ok,w]=pick(v,[['5 cm, 7 cm, 10 cm',['3 cm, 4 cm, 8 cm','2 cm, 6 cm, 9 cm','4 cm, 5 cm, 9 cm']],['6 cm, 8 cm, 12 cm',['5 cm, 5 cm, 11 cm','3 cm, 7 cm, 10 cm','2 cm, 9 cm, 12 cm']],['9 cm, 10 cm, 18 cm',['4 cm, 6 cm, 10 cm','7 cm, 8 cm, 16 cm','3 cm, 12 cm, 16 cm']]]);return mc('Which set of lengths can form a triangle?',ok,w,'The sum of the two shorter sides must be greater than the longest side. Only this set passes; equal sums (like 4 + 5 = 9) make a flat line, not a triangle.')},
    v=>{const [a,b]=pick(v,[[6,8],[5,12],[9,12]]),c=Math.sqrt(a*a+b*b);return mc(`A right triangle has legs ${a} cm and ${b} cm. How long is the hypotenuse?`,`${N(c)} cm`,[`${a+b} cm`,`${a*a+b*b} cm`,`${2*b} cm`],`c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}, so c = √${a*a+b*b} = ${N(c)} cm. Remember to take the square root.`)}
   ],
   functions:[
    v=>{const [x1,y1,x2,y2]=pick(v,[[1,3,4,12],[-2,5,2,-3],[0,-4,6,-1]]);return mc(`What is the slope of the line through (${N(x1)}, ${N(y1)}) and (${N(x2)}, ${N(y2)})?`,F(y2-y1,x2-x1),[F(x2-x1,y2-y1),F(-(y2-y1),x2-x1),F(y2+y1,x2+x1)],`m = (y₂ ${MINUS} y₁)/(x₂ ${MINUS} x₁) = (${N(y2)} ${MINUS} ${N(y1)})/(${N(x2)} ${MINUS} ${N(x1)}) = ${F(y2-y1,x2-x1)}. Rise over run, not run over rise.`)},
    v=>pick(v,[
     ()=>mc(`In y = ${MINUS}3x + 7, what is the slope?`,`${MINUS}3`,['7','3',`${MINUS}7`],'In y = mx + b, m is the slope. Here m = −3 (keep the sign).'),
     ()=>mc(`In y = 2x ${MINUS} 5, what is the y-intercept?`,`${MINUS}5`,['5','2',`${MINUS}2`],'In y = mx + b, b is the y-intercept. Here b = −5, so the line crosses the y-axis at (0, −5).'),
     ()=>mc('In y = 4x, what is the y-intercept?','0',['4','1',`${MINUS}4`],'y = 4x is the same as y = 4x + 0, so the y-intercept is 0. The line passes through the origin.')
    ])(),
    v=>{const [m,b,x]=pick(v,[[-4,9,3],[5,-8,-2],[-2,-3,-6]]);return mc(`If f(x) = ${lin(m,b)}, what is f(${N(x)})?`,N(m*x+b),[N(m*x-b),N(-(m*x+b)),N(m+x+b)],`Replace x with ${N(x)}: ${N(m)}(${N(x)}) + (${N(b)}) = ${N(m*x)} + (${N(b)}) = ${N(m*x+b)}.`)},
    v=>{const [m,b]=pick(v,[[2,-8],[-3,15],[5,10]]);return mc(`What is the x-intercept of y = ${lin(m,b)}?`,N(-b/m),[N(b),N(b/m),N(m)],`At the x-intercept, y = 0: 0 = ${lin(m,b)}, so x = ${N(-b)}/${N(m)} = ${N(-b/m)}.`)},
    v=>pick(v,[
     ()=>mc(`Which line is parallel to y = 3x ${MINUS} 2?`,'y = 3x + 5',[`y = ${MINUS}3x ${MINUS} 2`,`y = ${MINUS}(1/3)x + 1`,'y = 2x + 3'],'Parallel lines have the same slope. Only y = 3x + 5 also has slope 3.'),
     ()=>mc(`Which line is parallel to y = ${MINUS}2x + 1?`,`y = ${MINUS}2x ${MINUS} 4`,['y = 2x + 1','y = (1/2)x + 1',`y = ${MINUS}x + 2`],'Parallel lines have the same slope. Only y = −2x − 4 also has slope −2.'),
     ()=>mc('Which line is parallel to y = 0.5x + 3?',`y = 0.5x ${MINUS} 6`,[`y = ${MINUS}2x + 3`,'y = 2x + 3','y = 3x + 0.5'],'Parallel lines have the same slope. Only y = 0.5x − 6 also has slope 0.5.')
    ])()
   ],
   data:[
    v=>pick(v,[
     ()=>mc('A fair die is rolled. What is P(a number greater than 4)?','1/3',['1/6','2/3','1/2'],'Numbers greater than 4 are 5 and 6: 2 out of 6 outcomes. 2/6 = 1/3.'),
     ()=>mc('A fair die is rolled. What is P(an even number)?','1/2',['1/3','1/6','3/2'],'Even numbers are 2, 4 and 6: 3 out of 6 outcomes. 3/6 = 1/2. A probability cannot be greater than 1.'),
     ()=>mc('A fair die is rolled. What is P(not 6)?','5/6',['1/6','6/5','1/5'],'P(not 6) = 1 − P(6) = 1 − 1/6 = 5/6.')
    ])(),
    v=>{const p=pick(v,[0.35,0.62,0.08]);return mc(`The chance of rain tomorrow is ${p}. What is the probability that it will NOT rain?`,N(1-p),[N(p),N(1+p),'0.5'],`P(not rain) = 1 ${MINUS} P(rain) = 1 ${MINUS} ${p} = ${N(1-p)}.`)},
    v=>{const [list,txt]=pick(v,[[[3,4],'3 shirts and 4 pairs of pants'],[[5,3,2],'5 shirts, 3 pairs of pants and 2 pairs of shoes'],[[4,6],'4 sandwiches and 6 drinks']]),prod=list.reduce((a,b)=>a*b,1),sum=list.reduce((a,b)=>a+b,0);return mc(`How many different outfits or combos can be made from ${txt}, choosing one of each?`,N(prod),[N(sum),N(prod-1),N(Math.max(...list)*2)],`Use the fundamental counting principle: multiply the choices. ${list.join(' × ')} = ${prod}.`)},
    v=>{const [m,L]=pick(v,[[8,[7,9,6]],[15,[12,18,14]],[20,[25,17,19]]]),s=L.reduce((a,b)=>a+b,0);return mc(`The mean of 4 quiz scores is ${m}. Three of the scores are ${L.join(', ')}. What is the fourth score?`,N(4*m-s),[N(m),N(s/3),N(4*m)],`The total of the 4 scores is 4 × ${m} = ${4*m}. The three known scores add up to ${s}. Fourth score = ${4*m} ${MINUS} ${s} = ${4*m-s}.`)},
    v=>{const [n,h]=pick(v,[[50,28],[40,17],[80,44]]);return mc(`A coin was tossed ${n} times and landed on heads ${h} times. What is the experimental probability of heads?`,F(h,n),['1/2',F(n-h,n),F(h,n-h)],`Experimental probability = times heads happened ÷ total tosses = ${h}/${n} = ${F(h,n)}. (1/2 is the theoretical probability.)`)}
   ],
   modeling:[
    v=>{const [k,d]=pick(v,[[5,7.5],[20,3.5],[12,6]]);return mc(`On a map, 1 cm represents ${k} km. Two towns are ${d} cm apart on the map. What is the actual distance?`,`${N(k*d)} km`,[`${N(d/k)} km`,`${N(k+d)} km`,`${N(k*d/10)} km`],`Use the scale as a rate: ${d} cm × ${k} km per cm = ${N(k*d)} km.`)},
    v=>{const [B,F0,c]=pick(v,[[500,80,35],[300,45,28],[1000,150,95]]);return mc(`You have ₱${B}. The entrance fee is ₱${F0}, and each snack costs ₱${c}. What is the greatest number of snacks you can buy?`,N(Math.floor((B-F0)/c)),[N(Math.floor(B/c)),N(Math.floor((B-F0)/c)+1),N(Math.floor((B+F0)/c))],`Solve ${F0} + ${c}s ≤ ${B}: ${c}s ≤ ${B-F0}, so s ≤ ${N((B-F0)/c)}. You can only buy whole snacks: ${Math.floor((B-F0)/c)}.`)},
    v=>{const [f,r]=pick(v,[[40,13.5],[45,15],[50,12]]);return mc(`A taxi charges ₱${f} flag-down plus ₱${r} per kilometer. Which equation gives the fare C for d kilometers?`,`C = ${r}d + ${f}`,[`C = ${f}d + ${r}`,`C = (${r} + ${f})d`,`C = ${r} + ${f} + d`],`The ₱${r} is charged for every kilometer (it multiplies d). The ₱${f} is charged once. So C = ${r}d + ${f}.`)},
    v=>{const [o,n]=pick(v,[[250,300],[80,92],[1200,1500]]);return mc(`The price of a book went from ₱${o} to ₱${n}. What is the percent increase?`,`${N((n-o)/o*100)}%`,[`${N(n-o)}%`,`${N((n-o)/n*100)}%`,`${N(n/o*100)}%`],`Percent increase = (new ${MINUS} old) ÷ old × 100 = (${n} ${MINUS} ${o}) ÷ ${o} × 100 = ${N((n-o)/o*100)}%. Divide by the original price.`)}
   ]
  },
  9:{
   number:[
    v=>{const [ans,w,ex]=pick(v,[['6√2',['2√18','3√8','36√2'],'√72 = √(36 × 2) = 6√2. Use the largest perfect-square factor.'],['4√3',['2√12','16√3','3√4'],'√48 = √(16 × 3) = 4√3. Use the largest perfect-square factor.'],['10√2',['2√50','5√8','100√2'],'√200 = √(100 × 2) = 10√2. Use the largest perfect-square factor.']]),n=pick(v,[72,48,200]);return mc(`Simplify √${n} completely.`,ans,w,ex)},
    v=>{const [a,b,k]=pick(v,[[3,5,2],[7,2,3],[4,9,5]]);return mc(`Simplify ${a}√${k} + ${b}√${k}.`,`${a+b}√${k}`,[`${a+b}√${2*k}`,`${a*b}√${k}`,`${a+b} + √${k}`],`These are like radicals (same √${k}), so add the coefficients: (${a} + ${b})√${k} = ${a+b}√${k}. The radicand does not change.`)},
    v=>pick(v,[
     ()=>mc('Simplify 5x⁰ (x ≠ 0).','5',['0','1','5x'],'Any nonzero number to the power 0 is 1, so 5x⁰ = 5 × 1 = 5. The exponent applies only to x.'),
     ()=>mc('Simplify (2³)⁻¹.','1/8',[`${MINUS}8`,`${MINUS}6`,'8'],'2³ = 8, and a power of −1 means the reciprocal: 1/8.'),
     ()=>mc('Simplify 3⁻².','1/9',[`${MINUS}9`,`${MINUS}6`,'9'],'3⁻² = 1/3² = 1/9. A negative exponent gives a reciprocal, not a negative number.')
    ])(),
    v=>{const [txt,ans,w,ex]=pick(v,[['8^(2/3)','4',['5.33','2','64'],'8^(2/3) = (∛8)² = 2² = 4. The denominator 3 means cube root; the numerator 2 means square.'],['27^(2/3)','9',['18','3','729'],'27^(2/3) = (∛27)² = 3² = 9.'],['16^(3/4)','8',['12','2','4096'],'16^(3/4) = (⁴√16)³ = 2³ = 8.']]);return mc(`Evaluate ${txt}.`,ans,w,ex)},
    v=>{const [n,k,ans,w]=pick(v,[[6,3,'2√3',['6√3','3√3','2/√3']],[10,5,'2√5',['10√5','5√5','2/√5']],[8,2,'4√2',['8√2','2√2','4/√2']]]);return mc(`Rationalize the denominator: ${n}/√${k}.`,ans,w,`Multiply top and bottom by √${k}: ${n}√${k}/${k} = ${ans}.`)}
   ],
   algebra:[
    v=>{const [r1,r2]=pick(v,[[2,5],[-3,4],[-6,-1]]),b=-(r1+r2),c=r1*r2,eq=`x² ${b<0?MINUS:'+'} ${Math.abs(b)===1?'':Math.abs(b)}x ${c<0?MINUS:'+'} ${Math.abs(c)} = 0`;return mc(`Solve by factoring: ${eq}.`,`x = ${N(r1)} or x = ${N(r2)}`,[`x = ${N(-r1)} or x = ${N(-r2)}`,`x = ${N(b)} or x = ${N(c)}`,`x = 1 or x = ${N(c)}`],`Factor: (x ${r1<0?'+':MINUS} ${Math.abs(r1)})(x ${r2<0?'+':MINUS} ${Math.abs(r2)}) = 0. Set each factor to zero: x = ${N(r1)} or x = ${N(r2)}.`)},
    v=>{const [a,b,c]=pick(v,[[1,-6,9],[2,3,5],[1,-2,-8]]),D=b*b-4*a*c,kinds=['two distinct real roots','two equal real roots','no real roots','infinitely many roots'],ans=D>0?kinds[0]:D===0?kinds[1]:kinds[2];return mc(`Use the discriminant to describe the roots of ${a===1?'':a}x² ${b<0?MINUS:'+'} ${Math.abs(b)}x ${c<0?MINUS:'+'} ${Math.abs(c)} = 0.`,ans,kinds.filter(k=>k!==ans),`b² ${MINUS} 4ac = (${N(b)})² ${MINUS} 4(${a})(${N(c)}) = ${N(D)}. ${D>0?'Positive: two distinct real roots.':D===0?'Zero: two equal real roots.':'Negative: no real roots.'}`)},
    v=>pick(v,[
     ()=>mc(`What is the sum of the roots of 2x² ${MINUS} 8x + 6 = 0?`,'4',[`${MINUS}4`,'3',`${MINUS}8`],'Sum of roots = −b/a = −(−8)/2 = 4.'),
     ()=>mc(`What is the product of the roots of x² + 5x ${MINUS} 14 = 0?`,`${MINUS}14`,['14',`${MINUS}5`,'5'],'Product of roots = c/a = −14/1 = −14.'),
     ()=>mc(`What is the sum of the roots of 3x² ${MINUS} 12x + 9 = 0?`,'4',[`${MINUS}4`,'3','12'],'Sum of roots = −b/a = −(−12)/3 = 4.')
    ])(),
    v=>pick(v,[
     ()=>mc(`Use the quadratic formula to solve x² ${MINUS} 4x + 1 = 0.`,'x = 2 ± √3',[`x = ${MINUS}2 ± √3`,'x = 4 ± √3','x = 2 ± √5'],'x = [4 ± √(16 − 4)]/2 = (4 ± √12)/2 = (4 ± 2√3)/2 = 2 ± √3.'),
     ()=>mc(`Use the quadratic formula to solve x² + 2x ${MINUS} 4 = 0.`,`x = ${MINUS}1 ± √5`,['x = 1 ± √5',`x = ${MINUS}2 ± √5`,`x = ${MINUS}1 ± √3`],'x = [−2 ± √(4 + 16)]/2 = (−2 ± √20)/2 = (−2 ± 2√5)/2 = −1 ± √5.'),
     ()=>mc(`Use the quadratic formula to solve 2x² ${MINUS} 4x ${MINUS} 1 = 0.`,'x = (2 ± √6)/2',[`x = (${MINUS}2 ± √6)/2`,'x = 2 ± √6','x = (2 ± √2)/2'],'x = [4 ± √(16 + 8)]/4 = (4 ± √24)/4 = (4 ± 2√6)/4 = (2 ± √6)/2.')
    ])(),
    v=>{const b=pick(v,[6,10,-8]);return mc(`What number completes the square: x² ${b<0?MINUS:'+'} ${Math.abs(b)}x + ___?`,N((b/2)**2),[N(b/2),N(b*b),N(2*b)],`Take half of the x-coefficient and square it: (${N(b)}/2)² = (${N(b/2)})² = ${N((b/2)**2)}.`)}
   ],
   geometry:[
    v=>{const [a,b,c]=pick(v,[[4,6,10],[5,8,15],[3,7,12]]);return mc(`△ABC ~ △DEF. AB = ${a}, DE = ${b} and BC = ${c}. Find EF.`,N(c*b/a),[N(c+(b-a)),N(c*a/b),N(a*b/c)],`Corresponding sides are proportional: EF/BC = DE/AB, so EF = ${c} × ${b}/${a} = ${N(c*b/a)}. Similar figures grow by multiplying, not adding.`)},
    v=>{const a=pick(v,[65,112,78]);return mc(`In parallelogram ABCD, ∠A = ${a}°. What is ∠B?`,`${180-a}°`,[`${a}°`,`${360-a}°`,`${Math.abs(360-2*a)}°`],`Consecutive angles of a parallelogram are supplementary: 180° ${MINUS} ${a}° = ${180-a}°. (∠C = ∠A because opposite angles are equal.)`)},
    v=>pick(v,[
     ()=>mc('In a 30°-60°-90° triangle the hypotenuse is 10 cm. How long is the shorter leg?','5 cm',['5√3 cm','10√3 cm','5√2 cm'],'The shorter leg (opposite 30°) is half the hypotenuse: 10 ÷ 2 = 5 cm.'),
     ()=>mc('In a 30°-60°-90° triangle the hypotenuse is 14 cm. How long is the longer leg?','7√3 cm',['7 cm','14√3 cm','7√2 cm'],'The shorter leg is 14 ÷ 2 = 7 cm. The longer leg is the shorter leg × √3 = 7√3 cm.'),
     ()=>mc('In a 30°-60°-90° triangle the hypotenuse is 22 cm. How long is the shorter leg?','11 cm',['11√3 cm','22√2 cm','11√2 cm'],'The shorter leg (opposite 30°) is half the hypotenuse: 22 ÷ 2 = 11 cm.')
    ])(),
    v=>{const [o,a,h,ask]=pick(v,[[3,4,5,'sin'],[5,12,13,'cos'],[8,15,17,'tan']]),val={sin:`${o}/${h}`,cos:`${a}/${h}`,tan:`${o}/${a}`},w={sin:[`${a}/${h}`,`${o}/${a}`,`${h}/${o}`],cos:[`${o}/${h}`,`${o}/${a}`,`${h}/${a}`],tan:[`${a}/${o}`,`${o}/${h}`,`${a}/${h}`]};return mc(`In right triangle ABC (right angle at C), the side opposite ∠A is ${o}, the side adjacent to ∠A is ${a}, and the hypotenuse is ${h}. What is ${ask} A?`,val[ask],w[ask],`SOH-CAH-TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent. So ${ask} A = ${val[ask]}.`)},
    v=>pick(v,[
     ()=>mc('An 8 m ladder leans against a wall and makes a 30° angle with the ground. How high up the wall does it reach? (sin 30° = 0.5)','4 m',['16 m','8.5 m','2 m'],'height = ladder × sin 30° = 8 × 0.5 = 4 m.'),
     ()=>mc('A 10 m ramp rises at 60° from the ground. How high is the top of the ramp? (sin 60° ≈ 0.87)','8.7 m',['11.49 m','10.87 m','5 m'],'height = 10 × sin 60° ≈ 10 × 0.87 = 8.7 m.'),
     ()=>mc('From 12 m away, the angle of elevation to the top of a tree is 45°. How tall is the tree? (tan 45° = 1)','12 m',['6 m','24 m','13 m'],'height = distance × tan 45° = 12 × 1 = 12 m.')
    ])()
   ],
   functions:[
    v=>{const [a,h,k]=pick(v,[[2,3,-5],[-1,-4,6],[3,1,2]]);return mc(`What is the vertex of y = ${a===1?'':a===-1?MINUS:a}(x ${h<0?'+':MINUS} ${Math.abs(h)})² ${k<0?MINUS:'+'} ${Math.abs(k)}?`,`(${N(h)}, ${N(k)})`,[`(${N(-h)}, ${N(k)})`,`(${N(h)}, ${N(-k)})`,`(${N(k)}, ${N(h)})`],`In y = a(x ${MINUS} h)² + k the vertex is (h, k). Here h = ${N(h)} and k = ${N(k)}. Watch the sign inside the parentheses.`)},
    v=>{const [a,b,c]=pick(v,[[1,-6,5],[2,8,-3],[-1,4,7]]);return mc(`What is the axis of symmetry of y = ${a===1?'':a===-1?MINUS:a}x² ${b<0?MINUS:'+'} ${Math.abs(b)}x ${c<0?MINUS:'+'} ${Math.abs(c)}?`,`x = ${N(-b/(2*a))}`,[`x = ${N(b/(2*a))}`,`x = ${N(-b/a)}`,`x = ${N(c)}`],`x = ${MINUS}b/(2a) = ${MINUS}(${N(b)})/(2 × ${N(a)}) = ${N(-b/(2*a))}.`)},
    v=>{const [y1,x1,x2]=pick(v,[[12,4,10],[18,6,15],[35,7,3]]),k=y1/x1;return mc(`y varies directly as x. y = ${y1} when x = ${x1}. Find y when x = ${x2}.`,N(k*x2),[N(y1*x1/x2),N(y1+(x2-x1)),N(k)],`Find k: k = y/x = ${y1}/${x1} = ${N(k)}. Then y = ${N(k)} × ${x2} = ${N(k*x2)}.`)},
    v=>{const [y1,x1,x2]=pick(v,[[8,3,6],[12,5,4],[20,3,12]]),k=y1*x1;return mc(`y varies inversely as x. y = ${y1} when x = ${x1}. Find y when x = ${x2}.`,N(k/x2),[N(y1/x1*x2),N(k),N(y1-(x2-x1))],`Find k: k = xy = ${x1} × ${y1} = ${k}. Then y = ${k}/${x2} = ${N(k/x2)}. When x gets bigger, y gets smaller.`)},
    v=>{const [a,b,c,x]=pick(v,[[1,-3,2,4],[2,1,-5,-2],[-1,4,3,2]]),f=a*x*x+b*x+c;return mc(`If f(x) = ${a===1?'':a===-1?MINUS:a}x² ${b<0?MINUS:'+'} ${Math.abs(b)===1?'':Math.abs(b)}x ${c<0?MINUS:'+'} ${Math.abs(c)}, what is f(${N(x)})?`,N(f),[N(a*2*x+b*x+c),N(-(a*x*x)+b*x+c),N(a*x*x-b*x+c)],`f(${N(x)}) = ${N(a)}(${N(x)})² + (${N(b)})(${N(x)}) + (${N(c)}) = ${N(a*x*x)} + (${N(b*x)}) + (${N(c)}) = ${N(f)}. Square x first.`)}
   ],
   data:[
    v=>pick(v,[
     ()=>mc('A coin is tossed and a die is rolled. What is P(heads and 6)?','1/12',['2/3','1/8','7/12'],'The events are independent, so multiply: 1/2 × 1/6 = 1/12.'),
     ()=>mc('Two fair coins are tossed. What is P(two heads)?','1/4',['1/2','1','1/3'],'Independent events: 1/2 × 1/2 = 1/4.'),
     ()=>mc('A spinner with 4 equal parts (1 to 4) is spun twice. What is P(4, then 4)?','1/16',['1/8','1/4','1/2'],'Independent events: 1/4 × 1/4 = 1/16.')
    ])(),
    v=>{const [q,e,p]=pick(v,[[85,78,92],[90,72,80],[70,88,95]]),w=0.2*q+0.5*e+0.3*p;return mc(`Grades are weighted: quizzes 20%, exam 50%, project 30%. A learner scored ${q} (quizzes), ${e} (exam) and ${p} (project). What is the weighted average?`,N(w),[N((q+e+p)/3),N(e),N((q+p)/2)],`Weighted average = 0.2(${q}) + 0.5(${e}) + 0.3(${p}) = ${N(0.2*q)} + ${N(0.5*e)} + ${N(0.3*p)} = ${N(w)}.`)},
    v=>{const L=pick(v,[[3.5,2.1,4.8,2.9,3.7],[15,22,18,30,25,19,21],[120,95,110,130,105]]),s=[...L].sort((a,b)=>a-b),med=s[(s.length-1)/2],mean=L.reduce((a,b)=>a+b,0)/L.length;return mc(`What is the median of ${L.join(', ')}?`,N(med),[N(L[(L.length-1)/2]),N(mean),N(s[s.length-1]-s[0])],`Order the data first: ${s.join(', ')}. The middle value is ${N(med)}.`)},
    v=>{const [n,f]=pick(v,[[40,14],[25,9],[80,52]]);return mc(`In a survey of ${n} learners, ${f} chose reading as their favorite hobby. What percent is that?`,`${N(f/n*100)}%`,[`${f}%`,`${N(100-f/n*100)}%`,`${N(n/f)}%`],`Percent = part ÷ whole × 100 = ${f} ÷ ${n} × 100 = ${N(f/n*100)}%.`)},
    v=>pick(v,[
     ()=>mc('A fair die is rolled. What is P(1 or 6)?','1/3',['1/36','1/6','2/3'],'1 and 6 cannot happen together (mutually exclusive), so add: 1/6 + 1/6 = 2/6 = 1/3.'),
     ()=>mc('A card is drawn from 10 cards numbered 1 to 10. What is P(even or 7)?','3/5',['1/2','1/10','1/20'],'Even numbers: 5 cards; the number 7: 1 card. They do not overlap, so add: 5/10 + 1/10 = 6/10 = 3/5.'),
     ()=>mc('A bag has 4 red, 3 blue and 5 green balls. What is P(red or blue)?','7/12',['1/12','1/3','7/24'],'Red and blue do not overlap, so add: 4/12 + 3/12 = 7/12.')
    ])()
   ],
   modeling:[
    v=>{const [A,x]=pick(v,[[60,6],[45,5],[96,8]]);return mc(`A rectangular garden is x m wide and (x + 4) m long. Its area is ${A} m². What is x?`,N(x),[N(Math.sqrt(A)),N(x+4),N(A/4)],`x(x + 4) = ${A} → x² + 4x ${MINUS} ${A} = 0 → (x ${MINUS} ${x})(x + ${x+4}) = 0. Width cannot be negative, so x = ${x} m.`)},
    v=>{const vv=pick(v,[20,30,40]);return mc(`A ball is thrown up. Its height is h = ${MINUS}5t² + ${vv}t meters after t seconds. What is its maximum height?`,`${N(vv*vv/20)} m`,[`${N(vv/10)} m`,`${N(vv*vv/10)} m`,`${vv-5} m`],`The highest point is at t = ${MINUS}b/(2a) = ${vv}/10 = ${N(vv/10)} s. Then h = ${MINUS}5(${N(vv/10)})² + ${vv}(${N(vv/10)}) = ${N(vv*vv/20)} m. (${N(vv/10)} is the time, not the height.)`)},
    v=>{const [h1,s1,s2]=pick(v,[[2,3,15],[1.5,2,12],[3,4.5,18]]);return mc(`A ${h1} m post casts a ${s1} m shadow. At the same time a tree casts a ${s2} m shadow. How tall is the tree?`,`${N(h1*s2/s1)} m`,[`${N(s2-(s1-h1))} m`,`${N(s2*s1/h1)} m`,`${N(h1+s2)} m`],`The triangles are similar: height/shadow is the same. h/${s2} = ${h1}/${s1}, so h = ${h1} × ${s2}/${s1} = ${N(h1*s2/s1)} m.`)},
    v=>{const [a,b]=pick(v,[[6,3],[4,12],[10,15]]),t=a*b/(a+b);return mc(`Rosa can paint a room in ${a} hours. Carlo can paint it in ${b} hours. How long will it take if they work together?`,`${N(t)} hours`,[`${N((a+b)/2)} hours`,`${a+b} hours`,`${N(Math.min(a,b)/2)} hours`],`Add the rates: 1/${a} + 1/${b} = ${F(a+b,a*b)} of the room per hour. Time = 1 ÷ ${F(a+b,a*b)} = ${N(t)} hours.`)}
   ]
  },
  10:{
   number:[
    v=>{const [a,d,n]=pick(v,[[7,4,20],[-5,3,15],[50,-6,12]]);return mc(`An arithmetic sequence has first term ${N(a)} and common difference ${N(d)}. What is the ${n}th term?`,N(a+(n-1)*d),[N(a+n*d),N(n*d),N(a+(n+1)*d)],`aₙ = a₁ + (n ${MINUS} 1)d = ${N(a)} + (${n-1})(${N(d)}) = ${N(a+(n-1)*d)}.`)},
    v=>{const [a,d,n]=pick(v,[[3,5,10],[10,-2,8],[1,4,12]]),an=a+(n-1)*d,S=n/2*(a+an);return mc(`Find the sum of the first ${n} terms of the arithmetic sequence ${[0,1,2].map(i=>N(a+i*d)).join(', ')}, …`,N(S),[N(n*an),N(an),N((n-1)/2*(2*a+(n-2)*d))],`Sₙ = n/2 (a₁ + aₙ). Here a${n} = ${N(an)}, so S = ${n}/2 × (${N(a)} + ${N(an)}) = ${N(S)}.`)},
    v=>{const [a,r,n,rt]=pick(v,[[3,2,6,'2'],[80,0.5,5,'1/2'],[2,-3,5,`${MINUS}3`]]),an=a*r**(n-1);return mc(`A geometric sequence has first term ${a} and common ratio ${rt}. What is the ${n}th term?`,N(an),[N(a*r**n),N(a*r*(n-1)),N(r**(n-1))],`aₙ = a₁ · r^(n ${MINUS} 1) = ${a} · (${rt})^${n-1} = ${N(an)}.`)},
    v=>{const [a,r,n]=pick(v,[[2,3,5],[1,2,8],[5,2,4]]),S=a*(r**n-1)/(r-1);return mc(`Find the sum of the first ${n} terms of the geometric sequence ${[0,1,2].map(i=>a*r**i).join(', ')}, …`,N(S),[N(a*r**(n-1)),N(a*r**n),N(n*a)],`Sₙ = a₁(rⁿ ${MINUS} 1)/(r ${MINUS} 1) = ${a}(${r}^${n} ${MINUS} 1)/(${r} ${MINUS} 1) = ${a}(${r**n-1})/${r-1} = ${N(S)}.`)},
    v=>pick(v,[
     ()=>mc(`What is the common ratio of 6, ${MINUS}12, 24, ${MINUS}48, …?`,`${MINUS}2`,['2',`${MINUS}18`,'1/2'],'Divide a term by the term before it: −12 ÷ 6 = −2. The sign alternates, so the ratio is negative.'),
     ()=>mc('Which sequence is geometric?','4, 12, 36, 108',['4, 8, 12, 16','1, 4, 9, 16','2, 4, 7, 11'],'In a geometric sequence each term is multiplied by the same number. 4, 12, 36, 108 multiplies by 3 each time. (4, 8, 12, 16 adds 4: that is arithmetic.)'),
     ()=>mc('What is the next term of 81, 27, 9, 3, …?','1',['0',`${MINUS}3`,'1/3'],'Each term is multiplied by 1/3: 3 × 1/3 = 1.')
    ])()
   ],
   algebra:[
    v=>pick(v,[
     ()=>mc(`What is the remainder when P(x) = x³ ${MINUS} 2x² + 3x ${MINUS} 5 is divided by (x ${MINUS} 2)?`,'1',[`${MINUS}27`,`${MINUS}5`,`${MINUS}3`],'Remainder theorem: the remainder is P(2) = 8 − 8 + 6 − 5 = 1. Use x = 2 (the opposite sign of the divisor’s constant).'),
     ()=>mc('What is the remainder when P(x) = 2x³ + x² − 4x + 6 is divided by (x + 1)?','9',['5','6','3'],'Remainder theorem: P(−1) = −2 + 1 + 4 + 6 = 9.'),
     ()=>mc(`What is the remainder when P(x) = x⁴ ${MINUS} 3x² + x ${MINUS} 2 is divided by (x ${MINUS} 3)?`,'55',['49',`${MINUS}2`,`${MINUS}3`],'Remainder theorem: P(3) = 81 − 27 + 3 − 2 = 55.')
    ])(),
    v=>pick(v,[
     ()=>mc(`Which is a factor of x³ ${MINUS} 6x² + 11x ${MINUS} 6?`,`x ${MINUS} 1`,['x + 1','x + 2','x + 6'],'Factor theorem: (x − 1) is a factor because P(1) = 1 − 6 + 11 − 6 = 0.'),
     ()=>mc(`Which is a factor of x³ + 2x² ${MINUS} 5x ${MINUS} 6?`,`x ${MINUS} 2`,['x + 2',`x ${MINUS} 3`,`x ${MINUS} 6`],'Factor theorem: P(2) = 8 + 8 − 10 − 6 = 0, so (x − 2) is a factor.'),
     ()=>mc(`Which is a factor of 2x³ ${MINUS} 3x² ${MINUS} 3x + 2?`,'x + 1',[`x ${MINUS} 1`,'x + 2',`x ${MINUS} 3`],'Factor theorem: P(−1) = −2 − 3 + 3 + 2 = 0, so (x + 1) is a factor.')
    ])(),
    v=>pick(v,[
     ()=>mc(`What is the leading coefficient of 4x² ${MINUS} 7x⁵ + 3x ${MINUS} 1?`,`${MINUS}7`,['4','5',`${MINUS}1`],'Write the polynomial in standard form: −7x⁵ + 4x² + 3x − 1. The leading term is −7x⁵, so the leading coefficient is −7.'),
     ()=>mc(`What is the degree of (2x³ + 1)(x² ${MINUS} 4)?`,'5',['6','3','2'],'Multiply the leading terms: 2x³ · x² = 2x⁵, so the degree is 5 (add the degrees).'),
     ()=>mc(`What is the leading term of 3x(x ${MINUS} 2)(2x + 5)?`,'6x³',['3x³','6x²','5x³'],'Multiply the leading parts: 3x · x · 2x = 6x³.')
    ])(),
    v=>pick(v,[
     ()=>mc(`What are the zeros of P(x) = (x ${MINUS} 3)(x + 2)(2x ${MINUS} 1)?`,`3, ${MINUS}2, 1/2`,[`${MINUS}3, 2, ${MINUS}1/2`,`3, ${MINUS}2, 1`,'3, 2, 2'],'Set each factor to zero: x − 3 = 0 → 3; x + 2 = 0 → −2; 2x − 1 = 0 → 1/2.'),
     ()=>mc(`What are the zeros of P(x) = x(x + 4)(x ${MINUS} 5)?`,`0, ${MINUS}4, 5`,[`${MINUS}4, 5`,`0, 4, ${MINUS}5`,`1, ${MINUS}4, 5`],'Set each factor to zero: x = 0, x + 4 = 0 → −4, x − 5 = 0 → 5. Do not forget the factor x.'),
     ()=>mc(`What are the zeros of P(x) = (x ${MINUS} 1)²(x + 6)?`,`1 (multiplicity 2) and ${MINUS}6`,[`${MINUS}1 and 6`,'1 and 6','1 only'],'x − 1 = 0 gives 1, which appears twice (multiplicity 2); x + 6 = 0 gives −6.')
    ])(),
    v=>pick(v,[
     ()=>mc('Divide: (x² + 5x + 6) ÷ (x + 2).','x + 3',[`x ${MINUS} 3`,'x + 7','x² + 3'],'x² + 5x + 6 = (x + 2)(x + 3), so the quotient is x + 3.'),
     ()=>mc(`Divide: (x² ${MINUS} x ${MINUS} 12) ÷ (x ${MINUS} 4).`,'x + 3',[`x ${MINUS} 3`,'x + 4',`x ${MINUS} 4`],'x² − x − 12 = (x − 4)(x + 3), so the quotient is x + 3.'),
     ()=>mc('Divide: (2x² + 7x + 3) ÷ (x + 3).','2x + 1',['2x + 3',`2x ${MINUS} 1`,'x + 1'],'2x² + 7x + 3 = (x + 3)(2x + 1), so the quotient is 2x + 1.')
    ])()
   ],
   geometry:[
    v=>{const arc=pick(v,[100,140,76]);return mc(`An inscribed angle intercepts an arc of ${arc}°. What is the measure of the inscribed angle?`,`${arc/2}°`,[`${arc}°`,`${2*arc}°`,`${180-arc/2}°`],`An inscribed angle is half its intercepted arc: ${arc}° ÷ 2 = ${arc/2}°. (A central angle would equal the arc.)`)},
    v=>{const [r,d]=pick(v,[[5,13],[6,10],[8,17]]);return mc(`PT is tangent to circle O at T. The radius OT = ${r} cm and OP = ${d} cm. How long is PT?`,`${N(Math.sqrt(d*d-r*r))} cm`,[`${d-r} cm`,`${d+r} cm`,`${N(Math.sqrt(d*d+r*r))} cm`],`A tangent is perpendicular to the radius, so △OTP is a right triangle with hypotenuse OP: PT = √(${d}² ${MINUS} ${r}²) = √${d*d-r*r} = ${N(Math.sqrt(d*d-r*r))} cm.`)},
    v=>{const [x1,y1,x2,y2]=pick(v,[[1,2,4,6],[-2,3,4,-5],[0,0,5,12]]),dx=x2-x1,dy=y2-y1;return mc(`What is the distance between (${N(x1)}, ${N(y1)}) and (${N(x2)}, ${N(y2)})?`,N(Math.sqrt(dx*dx+dy*dy)),[N(Math.abs(dx)+Math.abs(dy)),N(dx*dx+dy*dy),N(Math.sqrt(Math.abs(dx*dx-dy*dy))),N(Math.abs(dx-dy))],`d = √[(${N(x2)} ${MINUS} ${N(x1)})² + (${N(y2)} ${MINUS} ${N(y1)})²] = √(${dx*dx} + ${dy*dy}) = √${dx*dx+dy*dy} = ${N(Math.sqrt(dx*dx+dy*dy))}.`)},
    v=>{const [x1,y1,x2,y2]=pick(v,[[2,-4,8,6],[-3,5,7,-1],[0,9,-6,3]]),mx=(x1+x2)/2,my=(y1+y2)/2;return mc(`What is the midpoint of the segment joining (${N(x1)}, ${N(y1)}) and (${N(x2)}, ${N(y2)})?`,`(${N(mx)}, ${N(my)})`,[`(${N((x2-x1)/2)}, ${N((y2-y1)/2)})`,`(${N(x1+x2)}, ${N(y1+y2)})`,`(${N(my)}, ${N(mx)})`],`Average the coordinates: ((${N(x1)} + ${N(x2)})/2, (${N(y1)} + ${N(y2)})/2) = (${N(mx)}, ${N(my)}).`)},
    v=>pick(v,[
     ()=>mc(`What are the center and radius of (x ${MINUS} 3)² + (y + 2)² = 49?`,`center (3, ${MINUS}2), radius 7`,[`center (${MINUS}3, 2), radius 7`,`center (3, ${MINUS}2), radius 49`,'center (3, 2), radius 7'],'In (x − h)² + (y − k)² = r², the center is (h, k) and the radius is √r². Here (3, −2) and √49 = 7.'),
     ()=>mc('What are the center and radius of (x + 1)² + y² = 25?',`center (${MINUS}1, 0), radius 5`,['center (1, 0), radius 5',`center (${MINUS}1, 0), radius 25`,`center (0, ${MINUS}1), radius 5`],'x + 1 = x − (−1), so h = −1; y² = (y − 0)², so k = 0. Radius = √25 = 5.'),
     ()=>mc(`What are the center and radius of x² + (y ${MINUS} 4)² = 18?`,'center (0, 4), radius 3√2',[`center (0, ${MINUS}4), radius 3√2`,'center (0, 4), radius 9','center (4, 0), radius 3√2'],'The center is (0, 4). The radius is √18 = √(9 × 2) = 3√2.')
    ])()
   ],
   functions:[
    v=>pick(v,[
     ()=>mc(`If f(x) = 2x³ ${MINUS} x + 4, what is f(${MINUS}2)?`,`${MINUS}10`,['22',`${MINUS}14`,`${MINUS}6`],'f(−2) = 2(−8) − (−2) + 4 = −16 + 2 + 4 = −10. A negative number cubed stays negative.'),
     ()=>mc(`If f(x) = x⁴ ${MINUS} 3x², what is f(2)?`,'4',['28',`${MINUS}4`,'10'],'f(2) = 2⁴ − 3(2²) = 16 − 12 = 4.'),
     ()=>mc(`If f(x) = x³ + 2x² ${MINUS} 5, what is f(${MINUS}3)?`,`${MINUS}14`,['40',`${MINUS}50`,'4'],'f(−3) = (−27) + 2(9) − 5 = −27 + 18 − 5 = −14.')
    ])(),
    v=>{const [fx,ans]=pick(v,[[`f(x) = ${MINUS}2x³ + x`,'rises to the left and falls to the right'],[`f(x) = x⁴ ${MINUS} 5x²`,'rises on both ends'],[`f(x) = 3x⁵ ${MINUS} 2x`,'falls to the left and rises to the right']]),all=['rises to the left and falls to the right','falls to the left and rises to the right','rises on both ends','falls on both ends'];return mc(`Describe the end behavior of the graph of ${fx}.`,ans,all.filter(a=>a!==ans),'Look at the leading term. Odd degree: the ends go opposite ways (positive leading coefficient: falls left, rises right). Even degree: both ends go the same way (positive: both rise).')},
    v=>pick(v,[
     ()=>mc('At most how many turning points can the graph of a degree-4 polynomial have?','3',['4','5','2'],'A polynomial of degree n has at most n − 1 turning points: 4 − 1 = 3.'),
     ()=>mc('At most how many turning points can the graph of a degree-5 polynomial have?','4',['5','6','3'],'A polynomial of degree n has at most n − 1 turning points: 5 − 1 = 4.'),
     ()=>mc('At most how many x-intercepts can the graph of a cubic (degree-3) polynomial have?','3',['2','4','1'],'A polynomial of degree n has at most n real zeros, so a cubic has at most 3 x-intercepts.')
    ])(),
    v=>pick(v,[
     ()=>mc(`What is the y-intercept of f(x) = (x ${MINUS} 2)(x + 3)(x ${MINUS} 1)?`,'6',[`${MINUS}6`,'0','2'],'Set x = 0: (−2)(3)(−1) = 6.'),
     ()=>mc(`What is the y-intercept of f(x) = (x + 4)(x ${MINUS} 1)²?`,'4',[`${MINUS}4`,'0','1'],'Set x = 0: (4)(−1)² = 4 × 1 = 4.'),
     ()=>mc(`What is the y-intercept of f(x) = 2x(x ${MINUS} 5) + 7?`,'7',['0',`${MINUS}10`,'2'],'Set x = 0: 2(0)(−5) + 7 = 7.')
    ])(),
    v=>pick(v,[
     ()=>mc(`For which x-values is f(x) = x² ${MINUS} 4 equal to 0?`,`x = 2 or x = ${MINUS}2`,['x = 4 only','x = 2 only','x = 16'],'x² − 4 = (x − 2)(x + 2) = 0, so x = 2 or x = −2.'),
     ()=>mc(`For which x-values is f(x) = x³ ${MINUS} 9x equal to 0?`,`x = 0, 3 or ${MINUS}3`,[`x = 3 or ${MINUS}3`,'x = 9','x = 0 or 9'],'x³ − 9x = x(x − 3)(x + 3) = 0, so x = 0, 3 or −3.'),
     ()=>mc(`For which x-values is f(x) = x² + 2x ${MINUS} 15 equal to 0?`,`x = 3 or x = ${MINUS}5`,[`x = ${MINUS}3 or x = 5`,'x = 15',`x = 1 or x = ${MINUS}15`],'x² + 2x − 15 = (x − 3)(x + 5) = 0, so x = 3 or x = −5.')
    ])()
   ],
   data:[
    v=>{const [n,r]=pick(v,[[6,3],[8,2],[7,4]]),fact=k=>k<=1?1:k*fact(k-1),P0=fact(n)/fact(n-r),C0=P0/fact(r);return mc(`In how many ways can ${r} learners be chosen from ${n} and lined up in order? (Find ₙPᵣ = ${n}P${r}.)`,N(P0),[N(C0),N(n**r),N(n*r)],`Order matters, so use permutations: ${n}P${r} = ${n}!/(${n} ${MINUS} ${r})! = ${N(P0)}.`)},
    v=>{const [n,r]=pick(v,[[10,3],[8,4],[12,2]]),fact=k=>k<=1?1:k*fact(k-1),C0=fact(n)/(fact(r)*fact(n-r)),P0=fact(n)/fact(n-r),C1=fact(n)/(fact(r-1)*fact(n-r+1));return mc(`How many groups of ${r} can be formed from ${n} people? (Find ${n}C${r}.)`,N(C0),[N(P0),N(n*r),N(C1)],`Order does not matter, so use combinations: ${n}C${r} = ${n}!/(${r}!(${n} ${MINUS} ${r})!) = ${N(C0)}.`)},
    v=>pick(v,[
     ()=>mc('Two learners are chosen at random from 4 boys and 3 girls. What is P(both are girls)?','1/7',['2/7','3/7','9/49'],'C(3,2)/C(7,2) = 3/21 = 1/7. The second pick has one fewer girl and one fewer person.'),
     ()=>mc('Two cards are drawn without replacement from 5 red and 5 black cards. What is P(both red)?','2/9',['1/4','1/2','1/5'],'C(5,2)/C(10,2) = 10/45 = 2/9. (1/4 would be with replacement.)'),
     ()=>mc('Three marbles are drawn from 6 marbles, 2 of which are green. What is P(no green)?','1/5',['2/3','8/27','1/3'],'C(4,3)/C(6,3) = 4/20 = 1/5.')
    ])(),
    v=>pick(v,[
     ()=>mc('Find the first quartile (Q₁) of 12, 15, 18, 20, 22, 25, 27, 30, 31, 35, 40.','18',['15','20','25'],'There are 11 values. Q₁ is at position (n + 1)/4 = 3, so Q₁ = 18. (25 is the median, Q₂.)'),
     ()=>mc('Find the third quartile (Q₃) of 2, 4, 6, 7, 9, 11, 15.','11',['9','15','7'],'There are 7 values. Q₃ is at position 3(n + 1)/4 = 6, so Q₃ = 11.'),
     ()=>mc('Find the third quartile (Q₃) of 5, 8, 9, 12, 14, 15, 17, 21, 24, 26, 29.','24',['21','26','15'],'There are 11 values. Q₃ is at position 3(n + 1)/4 = 9, so Q₃ = 24.')
    ])(),
    v=>pick(v,[
     ()=>mc('A and B are mutually exclusive. P(A) = 0.3 and P(B) = 0.45. What is P(A or B)?','0.75',['0.135','0.15','1'],'Mutually exclusive events cannot happen together, so add: 0.3 + 0.45 = 0.75.'),
     ()=>mc('P(A) = 0.5, P(B) = 0.4 and P(A and B) = 0.2. What is P(A or B)?','0.7',['0.9','0.3','1.1'],'P(A or B) = P(A) + P(B) − P(A and B) = 0.5 + 0.4 − 0.2 = 0.7. Subtract the overlap once.'),
     ()=>mc('A fair die is rolled. What is P(even or greater than 3)?','2/3',['1','1/3','1/2'],'Even: 2, 4, 6. Greater than 3: 4, 5, 6. Together: 2, 4, 5, 6 → 4/6 = 2/3. Do not count 4 and 6 twice.')
    ])()
   ],
   modeling:[
    v=>{const [a,d,n]=pick(v,[[20,10,12],[50,5,20],[15,15,10]]),S=n/2*(2*a+(n-1)*d);return mc(`Lea saves ₱${a} in week 1 and ₱${d} more each week after that. How much has she saved in total after ${n} weeks?`,P(S),[P(a+(n-1)*d),P(n*a),P(n/2*(2*a+n*d))],`This is an arithmetic series. Week ${n} amount = ${a} + (${n-1})(${d}) = ₱${a+(n-1)*d}. Total = ${n}/2 × (${a} + ${a+(n-1)*d}) = ${P(S)}.`)},
    v=>{const [N0,h]=pick(v,[[500,4],[1200,3],[250,6]]);return mc(`A bacteria culture starts with ${N0} cells and doubles every hour. How many cells are there after ${h} hours?`,N(N0*2**h),[N(N0*2*h),N(N0*2**(h-1)),N(N0*2**(h+1)),N(N0*h)],`Doubling is geometric growth: ${N0} × 2^${h} = ${N0} × ${2**h} = ${N(N0*2**h)}.`)},
    v=>{const n=pick(v,[8,10,6]);return mc(`A club has ${n} candidates. In how many ways can it choose a president, a vice president and a secretary?`,N(n*(n-1)*(n-2)),[N(n*(n-1)*(n-2)/6),N(3*n),N(n**3)],`The positions are different, so order matters: ${n}P3 = ${n} × ${n-1} × ${n-2} = ${N(n*(n-1)*(n-2))}.`)},
    v=>{const [r,t]=pick(v,[[10,72],[15,120],[12,45]]);return mc(`A pizza has radius ${r} cm. A slice has a central angle of ${t}°. How long is the curved crust of the slice? (Use π ≈ 3.14.)`,`${N(2*3.14*r*t/360)} cm`,[`${N(3.14*r*r*t/360)} cm`,`${N(2*3.14*r)} cm`,`${N(3.14*r*t/360)} cm`,`${N(2*3.14*r*t/180)} cm`],`Arc length = (θ/360) × 2πr = (${t}/360) × 2 × 3.14 × ${r} = ${N(2*3.14*r*t/360)} cm. (The other formula, πr²θ/360, is the area of the slice.)`)}
   ]
  }
 };
 const MATH_WRITING={
  7:['Explain, step by step, how you would find the total cost of school supplies after a 10% discount. Show the operations and units you used.','Write your own word problem about saving money that can be solved with a linear equation. Solve it and explain why your answer makes sense.'],
  8:['Describe a real situation that a linear function can model (for example, a phone load plan or a taxi fare). Give the equation and explain what the slope and the y-intercept mean.','Write and solve a problem that uses a linear inequality to decide how many items you can buy within a budget. Explain each step.'],
  9:['A ball is thrown upward. Explain how a quadratic function can describe its height and how you would find its maximum height.','Write a problem about similar triangles or trigonometry from your community (shadows, ladders, ramps). Solve it and explain your reasoning.'],
  10:['Plan a savings goal using an arithmetic or a geometric sequence. Show the formula you used and explain which sequence fits your plan and why.','Write a counting or probability problem about a school event (raffle, election or team selection). Solve it and explain why you used a permutation or a combination.']
 };
 function mathActivity(grade,id,index){
  const bank=MATH[grade]||MATH[7];
  if(id==='modeling'&&index>=8){
   return {type:'write',prompt:MATH_WRITING[grade][index-8],minimum:{7:150,8:200,9:250,10:300}[grade]||150,checks:['I stated the important data and units.','I showed the operation, equation or model I used.','I explained why my answer is reasonable.'],explanation:'Compare your explanation with the checklist. Your teacher reviews written answers.'}
  }
  const list=bank[id];const per=id==='modeling'?4:5;
  return list[index%per](Math.floor(index/per))
 }
 // Check-in: one unseen variant (variant 2) from each station.
 function mathPlacement(grade,k){
  const id=STATIONS.Mathematics[k].id,list=(MATH[grade]||MATH[7])[id];
  return list[k%list.length](2)
 }

 /* ---------- Filipino item bank (original READwy text, written per grade). Item format: [tanong, tamang sagot, mali, mali, mali] ---------- */
 const FIL={
  7:{
   words:[
    ['masinop','maingat at maayos','Sa pag-aayos ng mga aklat, naging masinop si Lito.'],
    ['marahan','dahan-dahan','Marahan niyang isinara ang pinto upang hindi makaistorbo.'],
    ['matatag','hindi madaling sumuko','Nanatiling matatag ang pangkat kahit mahirap ang gawain.'],
    ['payak','simple at hindi magarbo','Payak ang kanilang silid ngunit malinis at maaliwalas.'],
    ['masigla','malakas at puno ng sigla','Masigla siyang nakilahok sa palaro sa paaralan.'],
    ['salat','kulang o kapos','Salat sa tubig ang bukid matapos ang mahabang tag-init.'],
    ['mahinahon','kalmado at hindi padalos-dalos','Mahinahon siyang nagpaliwanag sa kaniyang kaklase.'],
    ['taimtim','tapat at buong-pusong ginagawa','Taimtim na nanalangin ang mag-anak bago kumain.'],
    ['marikit','maganda at kaaya-aya','Marikit ang tanawin sa tabi ng ilog.'],
    ['pagsamo','magalang na pakiusap','Dinig sa kaniyang tinig ang pagsamo na ingatan ang mga punla.']
   ],
   passages:[
    {text:'Tuwing Sabado, tumutulong si Ella sa kaniyang lola sa pagtitinda ng kakanin sa palengke. Maaga silang gumigising upang lutuin ang puto at kutsinta. Bago umuwi, binibilang ni Ella ang kinita at isinusulat ito sa maliit na kuwaderno. Sabi ng kaniyang lola, ang maingat na pagtatala ang dahilan kung bakit hindi sila nalulugi.',
     qs:[['Ano ang ginagawa ni Ella bago sila umuwi?','Binibilang niya ang kinita at itinatala ito.','Nagluluto siya ng puto at kutsinta para bukas.','Namimili siya ng sangkap para sa kakanin.','Ipinamimigay niya ang natirang kakanin.'],
         ['Ayon sa lola, bakit hindi sila nalulugi?','Dahil maingat nilang itinatala ang kinita.','Dahil maaga silang dumarating sa palengke.','Dahil masarap ang luto ng kaniyang lola.','Dahil marami silang suki tuwing Sabado.']]},
    {text:'Ang bakawan ay mga punong tumutubo sa baybaying-dagat. Pinipigilan ng mga ugat nito ang pagguho ng lupa kapag malakas ang alon. Nagsisilbi rin itong tirahan ng maliliit na isda at alimango. Kaya sa ilang bayan sa Pilipinas, nagtatanim ang mga mag-aaral ng bakawan tuwing Buwan ng Kalikasan.',
     qs:[['Ano ang pangunahing ideya ng teksto?','Mahalaga ang bakawan sa baybayin at sa mga hayop dito.','Mas mataas ang bakawan kaysa sa ibang puno sa bundok.','Tuwing Buwan ng Kalikasan lamang tumutubo ang bakawan.','Ang mga alimango ang nagtatanim ng bakawan sa baybayin.'],
         ['Paano nakatutulong ang ugat ng bakawan?','Pinipigilan nito ang pagguho ng lupa sa baybayin.','Nagbibigay ito ng tubig-tabang sa mga isda.','Pinabibilis nito ang paglaki ng mga alimango.','Pinalalakas nito ang alon sa dalampasigan.']]},
    {text:'Napulot ni Paolo ang isang pitakang naiwan ng matandang babae sa upuan ng dyip. Napansin niyang may pangalan at numero ng telepono sa loob nito. Agad siyang bumaba sa sumunod na kanto at hinanap ang babae sa paradahan. Nang makita niya ito, ngumiti ang babae at paulit-ulit na nagpasalamat.',
     qs:[['Anong katangian ni Paolo ang ipinakikita ng kaniyang ginawa?','Tapat siya at handang tumulong sa iba.','Mausisa siya sa mga gamit ng ibang tao.','Nagmamadali siyang makarating sa paaralan.','Mahiyain siya kaya iniwasan niya ang babae.'],
         ['Ano ang ginawa ni Paolo matapos makita ang pangalan at numero?','Bumaba siya at hinanap ang babae sa paradahan.','Tinawagan niya ang numerong nasa loob ng pitaka.','Ibinigay niya ang pitaka sa tsuper ng dyip.','Dinala niya ang pitaka sa himpilan ng pulis.']]},
    {text:'Sa aming baryo, nagbabayanihan ang magkakapitbahay tuwing anihan. Sabay-sabay nilang ginagapas ang palay ng isang pamilya, saka lilipat sa bukid ng iba. Walang bayad ang tulong, ngunit may salu-salo pagkatapos ng trabaho. Dahil dito, mas mabilis natatapos ang anihan at lalong tumitibay ang samahan sa baryo.',
     qs:[['Ano ang bunga ng bayanihan tuwing anihan?','Mabilis natatapos ang ani at tumitibay ang samahan.','Tumataas ang bayad sa mga manggagawa sa bukid.','Iisang pamilya lamang ang nakapag-aani sa baryo.','Lumiliit ang ani dahil sa dami ng nagtatrabaho.'],
         ['Ano ang natatanggap ng mga tumutulong sa anihan?','Isang salu-salo pagkatapos ng trabaho.','Bahagi ng aning palay ng pamilya.','Maliit na halagang ibinabayad bawat araw.','Libreng sakay papunta sa bayan.']]},
    {text:'Binasa ni Mika ang paalala sa pinto ng silid-aklatan: “Ibalik ang hiniram na aklat sa loob ng pitong araw. May multang limang piso bawat araw ng pagkaantala.” Siyam na araw na mula nang humiram siya ng aklat.',
     qs:[['Magkano ang multa ni Mika kung ibabalik niya ang aklat ngayon?','Sampung piso, dahil dalawang araw siyang naantala.','Apatnapu’t limang piso, dahil siyam na araw na.','Limang piso, dahil isang aklat lamang ang hiniram.','Tatlumpu’t limang piso, dahil pitong araw ang palugit.'],
         ['Ano ang layunin ng paalala?','Ipaalam ang tuntunin sa paghiram at pagbabalik ng aklat.','Hikayatin ang mga mag-aaral na bumili ng sariling aklat.','Ipakilala ang mga bagong aklat sa silid-aklatan.','Ipaliwanag kung paano isusulat ang isang ulat-aklat.']]}
   ],
   grammar:[
    ['Alin ang wastong pangungusap?','Tumakbo nang mabilis ang aso papunta sa bakuran.','Tumakbo ng mabilis ang aso papunta sa bakuran.','Tumakbo nang mabilis ang aso papunta nang bakuran.','Tumakbo ng mabilis ang aso papunta nang bakuran.'],
    ['Alin ang wastong gamit ng rin o din?','Masaya rin ang mga bata sa palaruan.','Masaya din ang mga bata sa palaruan.','Masayang din ang mga bata sa palaruan.','Masaya ring ang mga bata sa palaruan.'],
    ['Alin ang wastong aspekto ng pandiwa?','Bukas, magtatanim kami ng puno sa liwasan.','Bukas, nagtanim kami ng puno sa liwasan.','Bukas, nagtatanim kami ng puno sa liwasan.','Bukas, katatanim namin ng puno sa liwasan.'],
    ['Alin ang wastong gamit ng may o mayroon?','Mayroon siyang dalang payong kanina.','May siyang dalang payong kanina.','Mayroong siyang dalang payong kanina.','May roon siyang dalang payong kanina.'],
    ['Alin ang gumamit ng angkop na pang-ugnay?','Nag-aral siyang mabuti, kaya pumasa siya sa pagsusulit.','Nag-aral siyang mabuti, ngunit pumasa siya sa pagsusulit.','Nag-aral siyang mabuti, kung pumasa siya sa pagsusulit.','Nag-aral siyang mabuti, upang pumasa siya kahapon.'],
    ['Alin ang wastong paghahambing?','Mas mataas ang puno ng niyog kaysa sa puno ng bayabas.','Mas mataas ang puno ng niyog kaysa ang puno ng bayabas.','Mas mataas ang puno ng niyog keysa sa puno ng bayabas.','Mas mas mataas ang puno ng niyog sa puno ng bayabas.'],
    ['Alin ang wastong gamit ng gitling?','Nag-ensayo ang koro bago ang palatuntunan.','Nagensayo ang koro bago ang palatuntunan.','Nag ensayo ang koro bago ang palatuntunan.','Nag-en-sayo ang koro bago ang palatuntunan.'],
    ['Alin ang may wastong bantas?','Saan ka pupunta pagkatapos ng klase?','Saan ka pupunta pagkatapos ng klase.','Saan ka pupunta, pagkatapos ng klase!','Saan, ka pupunta pagkatapos ng klase?'],
    ['Alin ang wastong paggamit ng malaking titik?','Bumisita kami sa Bulkang Mayon noong Abril.','Bumisita kami sa bulkang mayon noong abril.','Bumisita kami sa Bulkang mayon noong Abril.','bumisita kami sa Bulkang Mayon noong abril.'],
    ['Alin ang wastong gamit ng panghalip?','Ibinigay ko sa kaniya ang aklat na hiniram niya.','Ibinigay ko sa siya ang aklat na hiniram niya.','Ibinigay ko sa kaniya ang aklat na hiniram siya.','Ibinigay ako sa kaniya ang aklat na hiniram niya.']
   ],
   speaking:[
    ['Magpapakilala ka sa bagong klase. Alin ang pinakaangkop na panimula?','Magandang umaga po. Ako si Carlo, mula sa Baitang 7.','Magandang umaga po. Ang paborito kong ulam ay adobo.','Hoy, mga kaklase, ako si Carlo, tandaan n’yo ako.','Magandang umaga po. Gusto ko na pong umuwi nang maaga.'],
    ['Narinig mo sa anunsiyo: “Lilipat ang pulong mula sa Silid 5 patungo sa silid-aklatan, alas-dos ng hapon.” Saan at kailan ang pulong?','Sa silid-aklatan, alas-dos ng hapon','Sa Silid 5, alas-dos ng hapon','Sa silid-aklatan, alas-singko ng hapon','Sa Silid 2, alas-dos ng umaga'],
    ['Nagtatanong ka ng direksiyon sa isang nakatatanda. Alin ang angkop?','Mawalang-galang na po, saan po ang daan papunta sa munisipyo?','Mawalang-galang na po, puwede po ba ninyo akong samahan buong araw?','Saan ang munisipyo? Pakibilisan, nagmamadali ako ngayon.','Mawalang-galang na po, kayo po ba ang alkalde ng bayang ito?'],
    ['Nahuli ka sa klase. Ano ang angkop mong sabihin sa guro?','Paumanhin po sa pagkahuli; naantala po ang aming sinakyan.','Paumanhin po, pero hindi naman po mahalaga ang unang oras.','Ma’am, kayo po kasi ang nagsimula nang masyadong maaga.','Paumanhin po; bukas na lang po ako papasok nang tuluyan.'],
    ['Sabi ng guro: “Basahin ang pahina 12, sagutin ang bilang 1 hanggang 3, at ipasa bukas.” Ano ang UNANG gagawin mo?','Basahin ang pahina 12.','Sagutin ang bilang 1 hanggang 3.','Ipasa ang sagot bukas ng umaga.','Basahin ang pahina 13.'],
    ['Kaarawan ng iyong guro. Alin ang angkop na pagbati?','Maligayang kaarawan po, Ma’am! Salamat po sa inyong paggabay.','Maligayang kaarawan po, Ma’am! Ilang taon na po kayo talaga?','Maligayang kaarawan po! May pasok po ba tayo bukas, Ma’am?','Maligayang kaarawan po, Ma’am! Bigyan n’yo po kami ng handa.'],
    ['Inaya ka ng kaibigan na maglaro, pero may takdang-aralin ka. Paano ka tatanggi nang magalang?','Salamat sa pag-aya, pero tatapusin ko muna ang takdang-aralin ko.','Ayoko nga, hindi ako mahilig makipaglaro sa inyo kahit kailan.','Sige, sasama ako; bahala na ang takdang-aralin ko mamaya.','Salamat, pero hindi ko na gagawin ang takdang-aralin ko.'],
    ['Sa kuwentong napakinggan mo, paulit-ulit na tinulungan ng tauhan ang mga kapitbahay kahit siya ay pagod. Ano ang pangunahing mensahe?','Mahalaga ang pagtulong sa kapuwa kahit mahirap.','Dapat munang magpahinga bago tumulong sa iba.','Mas mabuting umiwas sa mga kapitbahay na maingay.','Ang mga kapitbahay ay dapat laging magpasalamat.'],
    ['Hindi mo narinig ang petsa ng pagsusulit. Paano ka magtatanong?','Paumanhin po, kailan po ulit ang petsa ng pagsusulit?','Paumanhin po, ilang tanong po ba ang lalabas sa pagsusulit?','Paumanhin po, puwede po bang huwag nang ituloy ang pagsusulit?','Paumanhin po, sino po ang gagawa ng ating pagsusulit?'],
    ['Itinuturo mo sa isang bisita ang klinika. Alin ang pinakamalinaw?','Diretso po kayo, kumanan sa ikalawang pasilyo, nasa kaliwa po.','Diyan lang po iyon, malapit lang po sa may bandang doon.','Hindi ko po alam, baka po nasa kabilang paaralan po iyon.','Diretso po kayo, tapos hanapin na lang po ninyo ang klinika.']
   ],
   research:[
    ['Alin ang pinakamainam na sanggunian tungkol sa kasaysayan ng inyong bayan?','Aklat o tala mula sa munisipyo o museo ng bayan','Komento ng hindi kilalang tao sa social media','Pelikulang piksiyon na kinunan sa ibang bayan','Kuwento ng kaibigang hindi taga-roon'],
    ['Ano ang dapat itala kapag kumuha ka ng impormasyon mula sa aklat?','Pamagat, may-akda at taon ng paglilimbag','Kulay ng pabalat at kapal ng aklat','Pangalan ng tindahang pinagbilhan','Presyo ng aklat at petsa ng pagbili'],
    ['Alin ang mahusay na tanong pampananaliksik?','Paano nakaaapekto ang araw-araw na pagbabasa sa bokabularyo?','Gusto mo bang magbasa ng aklat sa umaga o sa gabi?','Ano ang pangalan ng aklatan sa ating paaralan ngayon?','Mahilig ba ang mga kaklase ko sa makakapal na aklat?'],
    ['Kinopya mo ang isang pangungusap mula sa aklat. Ano ang dapat mong gawin?','Lagyan ng panipi at banggitin ang pinagkunan.','Palitan ang isang salita para maging iyo na ito.','Isulat nang buo nang walang anumang pagbanggit.','Itago ito upang hindi malaman ng iyong guro.'],
    ['Aling website ang mas mapagkakatiwalaan para sa impormasyon tungkol sa bagyo?','Opisyal na website ng PAGASA','Blog ng isang hindi kilalang manunulat','Pahinang puno ng patalastas at walang petsa','Video na walang binanggit na pinagkunan'],
    ['Ano ang unang hakbang sa pananaliksik?','Tukuyin ang paksa at ang tanong na sasagutin.','Isulat agad ang konklusyon ng pananaliksik.','Ipasa ang ulat bago magsimulang magbasa.','Pumili ng magandang kulay para sa pabalat.'],
    ['Bakit mahalaga ang petsa ng isang artikulo?','Upang malaman kung napapanahon ang impormasyon.','Upang malaman kung mahaba o maikli ang artikulo.','Upang malaman ang kaarawan ng sumulat nito.','Upang malaman kung ilang pahina ang artikulo.'],
    ['Nagsarbey ka sa 10 kaklase. Ano ang tamang paraan ng pag-uulat?','Iulat ang eksaktong bilang ng sagot ng 10 kaklase.','Sabihing ito ang gusto ng buong paaralan.','Dagdagan ang bilang upang mas kapani-paniwala.','Iulat lamang ang mga sagot na gusto mo.'],
    ['Alin ang KATOTOHANAN (hindi opinyon)?','Ang Pilipinas ay binubuo ng mahigit 7,000 pulo.','Ang Pilipinas ang pinakamagandang bansa sa mundo.','Mas masarap ang mangga kaysa sa saging.','Masaya ang lahat ng tao tuwing tag-ulan.'],
    ['Paano isasaayos ang mga tala mula sa iba’t ibang aklat?','Pangkatin ayon sa paksa at itala ang pinagkunan.','Pagsamahin lahat nang walang anumang pagkakaayos.','Isulat lamang ang mga salitang mahirap basahin.','Itapon ang mga talang hindi magkakatulad.']
   ],
   writing:['Ilarawan ang isang lugar sa inyong pamayanan na mahalaga sa iyo. Gamitin ang limang pandama.','Isalaysay ang isang pagkakataong natuto ka mula sa isang pagkakamali.','Sumulat ng talatang nagpapaliwanag kung paano inihahanda ang isang lutuing Pilipino na alam mo.','Ilarawan ang isang taong hinahangaan mo at ipaliwanag kung bakit.','Isalaysay ang isang karanasan ng bayanihan sa inyong lugar.','Sumulat ng liham-pasasalamat sa isang guro o kawani ng paaralan.','Ipaliwanag kung paano mapangangalagaan ang kalinisan ng inyong silid-aralan.','Sumulat ng sariling maikling alamat tungkol sa isang halaman o hayop sa inyong lugar.','Ihambing ang buhay mo noong elementarya at ngayon sa sekondarya.','Sumulat ng talata tungkol sa isang tradisyon ng inyong pamilya tuwing may okasyon.'],
   placement:[
    ['Ano ang kasingkahulugan ng “maalinsangan”?','mainit at kulob','malamig at mahangin','basa at maputik','maliwanag at maaraw'],
    ['Bakit kaya nagdala ng payong si Rina?','Inaasahan niyang uulan mamaya.','Gusto niyang ipahiram ito sa guro.','Bago ang payong at nais niyang ipakita.','Nakalimutan niyang ibalik ito kahapon.','Nagdala si Rina ng payong kahit maaraw pa sa umaga. Madilim na ang mga ulap sa bundok.'],
    ['Alin ang wastong pangungusap?','Kumain kami ng hapunan nang sabay-sabay.','Kumain kami nang hapunan ng sabay-sabay.','Kumain kami ng hapunan ng sabay-sabay.','Kumain kami nang hapunan nang sabay-sabay.'],
    ['Nais mong humiram ng lapis sa katabi. Ano ang angkop sabihin?','Puwede ko bang mahiram ang lapis mo sandali?','Akin na ang lapis mo, kailangan ko ngayon.','Puwede bang sa iyo na lang ang gawa ko?','Bakit ang dami mong lapis sa bag mo?'],
    ['Saan pinakamainam hanapin ang kahulugan ng isang salita?','Sa diksiyonaryo','Sa kalendaryo','Sa resibo','Sa mapa'],
    ['Ano ang kasalungat ng “masipag”?','tamad','matiyaga','masikap','masigasig']
   ]
  },
  8:{
   words:[
    ['mapanuri','maingat magsuri bago maniwala','Mapanuri si Nena at sinuri muna niya ang datos.'],
    ['masalimuot','maraming bahagi at mahirap unawain','Masalimuot ang suliranin kaya hinati nila ito sa mga hakbang.'],
    ['masikhay','masipag at matiyaga','Masikhay na nagsanay ang pangkat bago ang pagtatanghal.'],
    ['marubdob','matindi at taimtim','Marubdob ang hangarin niyang makatulong sa pamayanan.'],
    ['hinuha','pasyang batay sa mga pahiwatig','Mula sa bakas sa lupa, gumawa sila ng hinuha tungkol sa ulan.'],
    ['salungat','kabaligtaran o hindi magkatugma','Salungat sa tala ang unang pahayag ng ulat.'],
    ['makabuluhan','may mahalagang saysay','Makabuluhan ang talakayan dahil nakapagbahagi ang lahat.'],
    ['matiyaga','hindi agad sumusuko kahit matagal','Matiyagang hinintay ni Rico na tumubo ang mga binhi.'],
    ['pahiwatig','palatandaang tumutulong sa pag-unawa','Ang madidilim na ulap ay pahiwatig ng paparating na ulan.'],
    ['paninindigan','matibay na panig o paniniwala','Ipinaliwanag niya ang kaniyang paninindigan gamit ang ebidensiya.']
   ],
   passages:[
    {text:'Ayon sa tala ng barangay, umabot sa 320 ang nagparehistro sa libreng klinika noong Sabado, mas mataas ng 80 kaysa noong nakaraang buwan. Para sa kapitan, ito ang pinakamatagumpay na programa ng barangay ngayong taon. Gayunman, napansin ng mga boluntaryo na kulang ang upuan sa pila at marami ang naghintay nang mahigit dalawang oras.',
     qs:[['Alin ang OPINYON sa teksto?','Ito ang pinakamatagumpay na programa ng barangay ngayong taon.','Umabot sa 320 ang nagparehistro sa klinika noong Sabado.','Mas mataas ng 80 ang bilang kaysa noong nakaraang buwan.','Maraming naghintay nang mahigit dalawang oras sa pila.'],
         ['Batay sa teksto, ano ang dapat ayusin sa susunod na klinika?','Ang daloy ng pila at ang dami ng upuan para sa naghihintay.','Ang bilang ng gamot na ipinamimigay nang libre sa klinika.','Ang araw ng klinika upang gawin na lamang ito tuwing Linggo.','Ang pagpaparehistro upang mabawasan ang mga dumarating.']]},
    {text:'Parehong paraan ng pag-iimbak ng pagkain ang pagpapatuyo at pag-aasin. Sa pagpapatuyo, inaalis ang tubig sa tulong ng init ng araw, kaya mahalaga ang maaraw na panahon. Sa pag-aasin naman, hinihigop ng asin ang tubig mula sa isda o karne, kaya magagawa ito kahit maulap. Kapwa nilalabanan ng dalawang paraan ang mikrobyong nabubuhay sa basang pagkain.',
     qs:[['Ano ang PAGKAKAIBA ng dalawang paraan ayon sa teksto?','Kailangan ng araw sa pagpapatuyo, ngunit hindi sa pag-aasin.','Para sa isda lamang ang pagpapatuyo at hindi ang pag-aasin.','Mas mabilis masira ang pagkaing inasnan kaysa sa pinatuyo.','Ginagamitan ng tubig ang pag-aasin upang lumambot ang karne.'],
         ['Bakit parehong mabisa ang dalawang paraan?','Parehong inaalis ang tubig na kailangan ng mikrobyo.','Parehong pinalalasa ang pagkain upang hindi masira.','Parehong ginagawa lamang kapag maulap ang panahon.','Parehong ginagamitan ng yelo ang isda at karne.']]},
    {text:'Hindi ko inakalang ako ang pipiliing kumatawan sa aming klase sa paligsahan sa pagtula. Nanginginig ang aking tuhod nang umakyat ako sa entablado. Ngunit nang makita ko si Inay sa ikatlong hanay, tahimik na tumatango, unti-unting lumuwag ang aking dibdib at malinaw kong nabigkas ang unang taludtod.',
     qs:[['Sa anong pananaw isinalaysay ang teksto?','Unang panauhan, dahil ang tagapagsalaysay ang tauhan.','Ikatlong panauhan, dahil si Inay ang nagsasalaysay.','Ikalawang panauhan, dahil kinakausap ang mambabasa.','Ikatlong panauhan, dahil may tagamasid sa entablado.'],
         ['Paano nagbago ang damdamin ng tagapagsalaysay?','Mula sa kaba ay naging panatag ang kaniyang loob.','Mula sa tuwa ay naging lungkot ang kaniyang loob.','Mula sa galit ay naging hiya ang kaniyang loob.','Mula sa pagod ay naging antok ang kaniyang loob.']]},
    {text:'Iminungkahi ng konseho ng mag-aaral na gawing “araw na walang plastik” ang bawat Biyernes. Sa araw na ito, hindi magtitinda ang kantina ng inuming nasa boteng plastik, at hihikayatin ang lahat na magdala ng sariling baso. Ayon sa konseho, makababawas ito ng humigit-kumulang 1,500 bote bawat buwan. May ilang magulang naman na nag-aalalang mauuhaw ang mga batang makalilimot magdala ng baso.',
     qs:[['Ano ang pangunahing layunin ng mungkahi?','Bawasan ang basurang plastik sa paaralan.','Paramihin ang mabibiling inumin sa kantina.','Hikayatin ang mga magulang na magtinda ng baso.','Paikliin ang klase tuwing araw ng Biyernes.'],
         ['Ano ang alalahanin ng ilang magulang?','Maaaring mauhaw ang mga batang walang dalang baso.','Masyadong mahal ang mga basong ibinebenta sa kantina.','Hindi sapat ang 1,500 bote na mababawas bawat buwan.','Magsasara na ang kantina tuwing araw ng Biyernes.']]},
    {text:'Sa pagtatapos ng markahan, nagulat si Lito na mababa ang kaniyang marka sa proyekto. Inamin niyang ipinagpaliban niya ang gawain hanggang sa huling gabi. Ngumiti ang kaniyang guro at sinabing, “Kung ano ang itinanim, siya ring aanihin.” Mula noon, gumawa si Lito ng iskedyul para sa bawat proyekto.',
     qs:[['Ano ang ibig sabihin ng kasabihan sa sitwasyon ni Lito?','Ang bunga ng gawain ay nakasalalay sa pagsisikap.','Dapat magtanim ng gulay upang may maani sa huli.','Mas mahalaga ang marka kaysa sa natutuhan sa proyekto.','Hindi na mababago ang markang natanggap sa paaralan.'],
         ['Ano ang ipinakitang pagbabago ni Lito?','Nagplano siya ng oras para sa bawat proyekto.','Humingi siya ng mas mataas na marka sa guro.','Tumigil na siya sa paggawa ng mga proyekto.','Nagpatulong siya sa kapatid sa bawat gawain.']]}
   ],
   grammar:[
    ['Alin ang gumamit ng wastong hudyat ng sanhi?','Bumaha sa kalsada dahil barado ang mga kanal.','Bumaha sa kalsada kaya barado ang mga kanal.','Bumaha sa kalsada upang barado ang mga kanal.','Bumaha sa kalsada samantalang barado ang mga kanal.'],
    ['Alin ang gumamit ng eupemistikong pahayag para sa salitang “namatay”?','Sumakabilang-buhay na ang kaniyang lolo.','Natigok na raw ang kaniyang lolo.','Nadapa na kanina ang kaniyang lolo.','Nag-almusal na ang kaniyang lolo.'],
    ['Alin ang wastong paghahambing na magkatulad?','Magkasintaas sina Ana at Bea.','Magkasingtaas sina Ana at Bea.','Magkasintaas si Ana at si Bea.','Kasintaas sina Ana at Bea.'],
    ['Alin ang pangungusap na angkop sa HULING hakbang ng isang proseso?','Sa huli, ilagay ang nilutong ulam sa malinis na lalagyan.','Una, hugasan nang mabuti ang lahat ng sangkap na gagamitin.','Samantala, painitin ang kawali habang hinihiwa ang gulay.','Bukod dito, maaari ring gumamit ng ibang uri ng gulay.'],
    ['Alin ang wastong panghalip na tumutukoy kay Jose?','Masipag na mag-aaral si Jose. Siya ang laging nauuna sa klase.','Masipag na mag-aaral si Jose. Sila ang laging nauuna sa klase.','Masipag na mag-aaral si Jose. Ito ang laging nauuna sa klase.','Masipag na mag-aaral si Jose. Kami ang laging nauuna sa klase.'],
    ['Alin ang gumamit ng angkop na pang-ugnay?','Nagkasundo na ang dalawang panig; kung gayon, masisimulan na ang proyekto.','Nagkasundo na ang dalawang panig; samantala, masisimulan na ang proyekto.','Nagkasundo na ang dalawang panig; subalit, masisimulan na ang proyekto.','Nagkasundo na ang dalawang panig; kapag, masisimulan na ang proyekto.'],
    ['Alin ang wastong gamit ng pang-abay na pamanahon?','Tuwing Lunes, nagtataas kami ng watawat.','Tuwing Lunes, nagtaas kami ng watawat bukas.','Kahapon, magtataas kami ng watawat.','Tuwing Lunes, nagtataas kami nang watawat.'],
    ['Alin ang pangungusap na may sugnay na di-makapag-iisa?','Kapag tumila na ang ulan, maglalaro kami sa labas.','Tumila na ang ulan, at naglaro kami sa labas ng bahay.','Naglaro kami sa labas ng bahay buong hapon kahapon.','Malakas ang ulan kahapon sa aming bayan sa probinsiya.'],
    ['Alin ang wastong pangungusap?','Inoperahan siya ng doktor noong isang linggo.','Inoperan siya ng doktor noong isang linggo.','Inoperahan siya nang doktor noong isang linggo.','Inoperahan siya ng doktor nang isang linggo.'],
    ['Alin ang gumamit ng pananda ng opinyon?','Sa tingin ko, mas maayos ang ikalawang plano.','Ayon sa tala, natapos ang plano noong Mayo.','Batay sa sukat, 20 metro ang haba ng bakod.','Napatunayan ng pagsusuri na ligtas ang tulay.']
   ],
   speaking:[
    ['Sa isang talakayan, nais mong sumang-ayon at magdagdag ng punto. Alin ang angkop?','Sang-ayon ako, at idadagdag kong makatitipid din tayo sa kuryente.','Sang-ayon ako sa iyo, kaya wala na akong ibang masasabi pa.','Hindi ako sang-ayon, pero hindi ko rin alam kung bakit ganoon.','Sang-ayon ako sa iyo dahil magkaibigan tayo mula pa noon.'],
    ['Narinig mo sa balita: “Ayon sa PAGASA, magiging maulap na may pulu-pulong pag-ulan sa Visayas ngayong hapon.” Ano ang wastong buod?','Maaaring umulan sa ilang bahagi ng Visayas ngayong hapon.','Uulan nang malakas sa buong Pilipinas ngayong hapon.','Magiging maaraw sa buong Visayas sa buong araw ngayon.','May bagyong papasok sa Visayas mamayang gabi.'],
    ['Iinterbyuhin mo ang isang magsasaka. Alin ang mahusay na bukas na tanong?','Paano po ninyo hinaharap ang mga hamon tuwing tag-ulan?','Magsasaka po ba kayo mula pa noong kayo ay bata pa?','Masaya po ba kayo sa inyong hanapbuhay sa ngayon?','May tanim po ba kayong palay ngayong taon?'],
    ['Paano ka sasalungat nang magalang sa isang kaklase?','Iginagalang ko ang pananaw mo, pero may datos tayong dapat ding tingnan.','Iginagalang ko ang iyong pananaw, kaya hindi na ako magsasalita pa.','Mali ang iyong pananaw at wala ka talagang alam tungkol sa paksa.','Iginagalang kita, pero mas matalino ako kaya ako ang tama rito.'],
    ['Sinabi ng isang tagapagsalita: “Bumaba ng 30% ang aksidente matapos lagyan ng ilaw ang kalsada, batay sa ulat ng pulisya.” Anong suporta ang ginamit?','Estadistika mula sa isang opisyal na ulat','Personal na karanasan ng tagapagsalita','Kasabihan o salawikain ng matatanda','Opinyon ng isang sikat na artista'],
    ['Paano ka magbibigay ng puna sa presentasyon ng kaklase?','Malinaw ang datos mo; mas gaganda pa kung lalakihan ang titik sa slide.','Ang ganda ng presentasyon mo, wala akong maipupuna kahit kaunti.','Hindi ko nagustuhan ang presentasyon mo dahil nakababagot ang paksa.','Malinaw ang datos, pero mas maganda sana kung iba ang nag-ulat.'],
    ['Ikaw ang tagapagpadaloy at may dalawang sabay na nagsasalita. Ano ang sasabihin mo?','Isa-isa po tayo; mauna po si Ana, kasunod si Ben.','Tumigil na kayong dalawa, wala namang nakikinig.','Hayaan na lang nating sabay-sabay silang magsalita.','Si Ana na lang ang magsasalita; huwag na si Ben.'],
    ['Sinabi ng kaibigan mo nang may buntong-hininga: “Ayos lang ako.” Ano ang maaaring ipahiwatig nito?','Maaaring may dinaramdam siya kahit sinasabing ayos lang.','Tiyak na masayang-masaya siya at walang anumang problema.','Nais na niyang matapos agad ang inyong mahabang usapan.','Wala siyang narinig sa anumang sinabi mo kanina.'],
    ['Iuulat mo sa klase ang resulta ng sarbey. Alin ang pinakaangkop na pahayag?','Batay sa sarbey sa 40 kaklase, 25 ang mas gustong magbasa ng e-libro.','Sa tingin ko, halos lahat ay mahilig magbasa ng e-libro ngayon.','Marami raw ang gusto ng e-libro, sabi ng ilan kong kaibigan.','Gusto ko ang e-libro kaya iyon na ang lumabas na resulta.'],
    ['Namatayan ng lolo ang iyong kaklase. Ano ang angkop mong sabihin?','Nakikiramay ako; nandito lang ako kung kailangan mo ng kausap.','Nakikiramay ako; kailan ka nga ulit papasok sa ating klase?','Nakikiramay ako, pero matanda na rin naman ang lolo mo.','Nakikiramay ako; sana may pagkain sa lamay mamayang gabi.']
   ],
   research:[
    ['Alin ang PRIMARYANG sanggunian?','Talaarawan ng isang sundalo noong digmaan','Aklat-aralin tungkol sa digmaan','Ensiklopedya tungkol sa kasaysayan','Artikulong nagbubuod ng ibang pag-aaral'],
    ['Alin ang wastong paraphrase ng “Nakatutulong ang ehersisyo sa pagbawas ng stress”?','Nababawasan ang stress kapag regular na nag-eehersisyo.','Nakatutulong ang ehersisyo sa pagbawas ng stress.','Nakadaragdag ng stress ang regular na pag-eehersisyo.','Ang ehersisyo ay para lamang sa mga atleta at manlalaro.'],
    ['Gagawa ka ng sarbey. Alin ang tanong na WALANG kinikilingan?','Ilang oras ka nagbabasa sa isang linggo?','Hindi ba’t nakatatamad talagang magbasa?','Gaano ka kasaya sa nakaiinip na aklatan?','Bakit ayaw ng lahat sa makakapal na aklat?'],
    ['Ano ang buod?','Maikling pagpapahayag ng mahahalagang ideya','Pagkopya ng buong teksto nang salita-sa-salita','Pagdaragdag ng sariling opinyon sa bawat talata','Paglilista ng lahat ng detalye sa teksto'],
    ['Bakit kailangang itala ang sanggunian sa dulo ng ulat?','Upang masuri ng mambabasa ang pinagkunan ng impormasyon.','Upang magmukhang mahaba at makapal ang kabuuang ulat.','Upang mapalitan ang sariling paliwanag sa loob ng ulat.','Upang hindi na kailangang magsulat pa ng sariling buod.'],
    ['Magkaiba ang sinasabi ng dalawang sanggunian. Ano ang gagawin mo?','Ihambing ang petsa, may-akda at ebidensiya ng bawat isa.','Piliin ang sangguniang may mas makulay na disenyo.','Gamitin ang unang sangguniang nakita sa paghahanap.','Huwag nang banggitin ang alinman sa dalawang sanggunian.'],
    ['Alin ang wastong pagbanggit sa loob ng teksto?','Ayon kay Reyes (2021), tumaas ang bilang ng nagbabasa.','Ayon sa isang tao, tumaas ang bilang ng nagbabasa.','Tumaas ang bilang ng nagbabasa, sabi sa internet.','Ayon sa aklat na nabasa ko, tumaas ang nagbabasa.'],
    ['Ano ang haypotesis?','Pansamantalang sagot na susubukin ng pananaliksik','Huling konklusyon matapos ang pananaliksik','Listahan ng lahat ng sanggunian sa ulat','Pamagat ng pananaliksik sa unang pahina'],
    ['Alin ang angkop na datos para sa tanong na “Gaano kadalas gumamit ng aklatan ang mga mag-aaral?”','Talaan ng paghiram ng aklat sa loob ng isang buwan','Larawan ng aklatan na kinunan noong isang taon','Pangalan ng mga librarian sa paaralan','Listahan ng mga aklat na bagong dating'],
    ['Ano ang plahiyo?','Paggamit ng ideya o salita ng iba nang hindi kinikilala','Pagbanggit nang wasto sa pinagkunan ng ideya','Paggawa ng sariling buod gamit ang sariling salita','Pagtatanong sa guro tungkol sa paksa ng ulat']
   ],
   writing:['Ipahayag ang iyong opinyon: Dapat bang may takdang-aralin tuwing katapusan ng linggo? Magbigay ng dalawang dahilan.','Ihambing ang pagbabasa ng nakalimbag na aklat at ng e-libro. Alin ang mas angkop sa iyo at bakit?','Sumulat ng maikling balita tungkol sa isang gawain sa inyong paaralan. Sagutin ang sino, ano, kailan, saan at bakit.','Sumulat ng rebyu ng isang pelikula o palabas na napanood mo. Banggitin ang kalakasan at kahinaan nito.','Ipaliwanag ang sanhi at bunga ng isang suliraning pangkapaligiran sa inyong lugar.','Sumulat ng liham sa kapitan ng barangay na nagmumungkahi ng isang proyekto para sa kabataan.','Ipaliwanag ang kahulugan ng isang salawikain at iugnay ito sa sariling karanasan.','Sumulat ng talatang sumasang-ayon o sumasalungat sa paggamit ng cellphone sa loob ng klase.','Ilahad ang mga hakbang sa paglutas ng di-pagkakaunawaan sa isang pangkat.','Sumulat ng sanaysay tungkol sa kahalagahan ng wikang Filipino sa pagkakaisa ng mga Pilipino.'],
   placement:[
    ['Ano ang kahulugan ng “nagpupuyos” sa “Nagpupuyos ang kaniyang damdamin sa galit”?','matinding nag-aalab','mahinahong naghihintay','tahimik na umiiyak','masayang tumatawa'],
    ['Bakit natuloy ang palaro?','May bubong ang bagong gym.','Tumigil ang ulan bago ang palaro.','Inilipat ang palaro sa ibang araw.','Kakaunti ang dumalo sa palaro.','Bagaman umuulan nang malakas, natuloy ang palaro dahil may bubong ang bagong gym ng paaralan.'],
    ['Alin ang pangungusap na nagpapahayag ng sanhi at bunga?','Nag-ensayo siya araw-araw kaya nanalo siya sa paligsahan.','Nag-ensayo siya araw-araw at kumain sa kantina pagkatapos.','Nag-ensayo siya araw-araw noong nakaraang buwan sa gym.','Nag-ensayo siya araw-araw kasama si Lito at si Ana.'],
    ['Alin ang magalang na pagsalungat?','Naiintindihan ko, pero may iba akong pananaw rito.','Mali ka at hindi kita pakikinggan kahit kailan.','Tama ka, kaya wala na akong masasabi pa rito.','Bahala ka na, hindi na ako makikialam dito.'],
    ['Alin ang OPINYON?','Pinakamasarap ang luto sa aming kantina.','Bukas ang kantina mula 7:00 hanggang 4:00.','May 12 mesa sa kantina ng paaralan.','Nagtitinda ang kantina ng kanin at ulam.'],
    ['Ano ang ibig sabihin ng “nagtaingang-kawali”?','nagbingi-bingihan','nagluto ng ulam','nakinig nang mabuti','nabasag ang kawali']
   ]
  },
  9:{
   words:[
    ['masinop','mahusay magplano at mag-ayos','Masinop na inilista ng pangkat ang mga ginastos sa proyekto.'],
    ['mapagkakatiwalaan','karapat-dapat paniwalaan','Mapagkakatiwalaan ang ulat dahil malinaw ang pinagmulan ng datos.'],
    ['masusi','detalyado at maingat magsuri','Masusi nilang sinuri ang dalawang magkaibang paliwanag.'],
    ['di-matatawaran','napakahalaga o napakahusay','Di-matatawaran ang ambag ng mga boluntaryo sa gawain.'],
    ['pagsalungat','pagpapahayag ng hindi pagsang-ayon','Nagbigay siya ng magalang na pagsalungat at matibay na dahilan.'],
    ['pananagutan','tungkuling dapat gampanan','Pananagutan ng bawat kasapi ang pag-aalaga sa kagamitan.'],
    ['mapanghikayat','nakahihikayat dahil may malinaw na dahilan','Mapanghikayat ang panukala dahil may datos at kongkretong plano.'],
    ['paglilinaw','pagbibigay-linaw sa kahulugan','Humingi siya ng paglilinaw bago sumagot sa tanong.'],
    ['pagkiling','pagpabor sa isang panig nang hindi patas','Napansin ng mambabasa ang pagkiling sa pagpili ng mga halimbawa.'],
    ['saligan','batayang pinagmumulan ng ideya','Ang talaan ng sanggunian ang saligan ng pananaliksik.']
   ],
   passages:[
    {text:'Hindi sapat na magpatayo ng bagong silid-aralan kung walang guro at aklat na tutugon sa mga mag-aaral. Sa nakaraang tatlong taon, dumami ang gusali sa ating dibisyon, ngunit nananatiling 50 mag-aaral bawat klase sa maraming paaralan. Kung tunay nating nais ang dekalidad na edukasyon, dapat isabay ang pagkuha ng guro sa bawat bagong gusaling itatayo.',
     qs:[['Ano ang pangunahing paninindigan ng sumulat?','Dapat isabay ang pagkuha ng guro sa pagpapatayo ng gusali.','Dapat nang ihinto ang pagpapatayo ng mga bagong gusali.','Sapat na ang mga bagong gusali upang gumanda ang edukasyon.','Dapat bawasan ang mga aklat upang dumami ang mga guro.'],
         ['Anong datos ang ginamit upang suportahan ang paninindigan?','Nananatiling 50 mag-aaral bawat klase sa maraming paaralan.','Dumarami ang mga magulang na muling nag-aaral sa gabi.','Bumaba ang presyo ng mga aklat sa nakaraang taon.','Tatlong bagong dibisyon ang itinatag sa rehiyon.']]},
    {text:'Sinabi ng isang tagapagsalita sa pulong: “Huwag ninyong paniwalaan ang mungkahi ni Bb. Reyes tungkol sa bagong iskedyul ng klase. Bago pa lamang siya sa paaralan at hindi pa niya kilala ang mga mag-aaral.”',
     qs:[['Bakit mahina ang pangangatwiran ng tagapagsalita?','Tinuligsa niya ang tao sa halip na ang mungkahi mismo.','Gumamit siya ng tiyak na datos tungkol sa iskedyul.','Inihambing niya nang patas ang dalawang iskedyul.','Binanggit niya ang mga sanggunian ng kaniyang pahayag.'],
         ['Ano ang mas makatwirang tugon sa mungkahi?','Suriin ang epekto ng bagong iskedyul sa mga mag-aaral.','Hintaying tumagal si Bb. Reyes bago siya pakinggan.','Tanggapin agad ang mungkahi dahil guro ang nagbigay.','Itanong sa mga bisita kung sino ang mas sikat na guro.']]},
    {text:'Tuwing dumaraan ang alkalde, yumuyuko ang mga tao sa plasa kahit hindi nila alam kung bakit. Si Andres lamang ang nanatiling nakatayo. “Iginagalang ko ang tungkulin,” wika niya, “ngunit hindi ako yuyuko dahil sa takot.” Kinabukasan, tinanggal siya sa trabaho sa munisipyo.',
     qs:[['Ano ang pinakaangkop na tema ng akda?','Ang paninindigan ay may kaakibat na sakripisyo.','Dapat ituro sa bata ang paggalang sa nakatatanda.','Masayang sumasalubong ang mga tao sa alkalde.','Madaling makakuha ng trabaho sa munisipyo.'],
         ['Ano ang sinisimbolo ng pagyuko ng mga tao?','Ang pagsunod dahil sa takot sa may kapangyarihan.','Ang pagod ng mga tao matapos ang trabaho sa plasa.','Ang paghahanda ng plasa para sa isang pagdiriwang.','Ang paghanga ng mga tao sa ganda ng munisipyo.']]},
    {text:'Sa isang sarbey ng 200 mag-aaral, 68% ang nagsabing gumagamit sila ng cellphone nang higit sa limang oras araw-araw. Kasabay nito, 55% ang nag-ulat na kulang sila sa tulog tuwing may pasok. Iminungkahi ng mananaliksik na magtakda ang mga pamilya ng oras na walang gadyet bago matulog.',
     qs:[['Ilan sa mga sinarbey ang gumagamit ng cellphone nang higit sa limang oras araw-araw?','136 na mag-aaral','68 na mag-aaral','110 na mag-aaral','132 na mag-aaral'],
         ['Alin ang maingat na konklusyon mula sa datos?','Maaaring may kaugnayan ang paggamit ng cellphone at kakulangan sa tulog.','Tiyak na ang cellphone ang tanging sanhi ng kakulangan ng tulog ng lahat.','Lahat ng mag-aaral sa buong bansa ay kulang sa tulog tuwing may pasok.','Walang anumang kaugnayan ang paggamit ng gadyet sa tulog ng mag-aaral.']]},
    {text:'“Mga kabataan, hanggang kailan tayo maghihintay? Hanggang kailan natin hahayaang mapuno ng basura ang ating ilog? Ngayon ang panahon ng pagkilos — hindi bukas, hindi sa susunod na taon, kundi ngayon!”',
     qs:[['Anong paraan ng panghihikayat ang ginamit ng nagsasalita?','Retorikal na tanong at pag-uulit ng mga salita','Paglalahad ng estadistika mula sa isang pag-aaral','Pagbanggit ng eksperto upang patunayan ang pahayag','Paghahambing ng dalawang ilog sa magkaibang bayan'],
         ['Ano ang nais mangyari ng nagsasalita?','Kumilos agad ang kabataan upang linisin ang ilog.','Maghintay ang kabataan ng utos mula sa pamahalaan.','Pag-aralan muna ng kabataan ang kasaysayan ng ilog.','Ilipat ng kabataan ang basura sa ibang bahagi ng ilog.']]}
   ],
   grammar:[
    ['Alin ang nagpapahayag ng PINAKAMASIDHING galit?','Nagngingitngit siya sa nangyaring pandaraya.','Nainis siya sa nangyaring pandaraya.','Nagalit siya sa nangyaring pandaraya.','Nayamot siya sa nangyaring pandaraya.'],
    ['Ano ang ibig sabihin ng idyomang “nagbibilang ng poste”?','walang trabaho','nagtitinda ng kuryente','nagbibilang ng sasakyan','nag-aayos ng kalsada'],
    ['Alin ang pangungusap na nasa POKUS SA LAYON?','Binili ni Ana ang bagong aklat.','Bumili si Ana ng bagong aklat.','Ibinili ni Ana ng aklat ang kapatid.','Ipinambili ni Ana ng aklat ang pera.'],
    ['Alin ang gumamit ng hudyat ng pananaw?','Ayon sa ulat ng DepEd, dumami ang nagbabasa ngayong taon.','Dahil sa programa, dumami ang nagbabasa ngayong taon.','Kaya naman dumami ang nagbabasa ngayong taon sa paaralan.','Sa wakas, dumami rin ang nagbabasa ngayong taon.'],
    ['Alin ang gumamit ng angkop na pangatnig na paninsay?','Maliit ang kaniyang sahod; gayunman, nakapag-ipon siya para sa pag-aaral.','Maliit ang kaniyang sahod; samakatuwid, nakapag-ipon siya para sa pag-aaral.','Maliit ang kaniyang sahod; bukod dito, nakapag-ipon siya para sa pag-aaral.','Maliit ang kaniyang sahod; dahil dito, nakapag-ipon siya para sa pag-aaral.'],
    ['Alin ang may pang-abay na pamaraan?','Mahinahong ipinaliwanag ng guro ang aralin.','Kahapon ipinaliwanag ng guro ang aralin.','Sa silid ipinaliwanag ng guro ang aralin.','Marahil ipinaliwanag ng guro ang aralin.'],
    ['Anong tayutay ang “Ang kaniyang mga mata ay bituing nagniningning”?','Pagwawangis (metapora)','Pagtutulad (simile)','Pagsasatao','Pagmamalabis'],
    ['Alin ang wastong baybay ayon sa ortograpiyang Filipino?','Kailangan natin ng sapat na enerhiya araw-araw.','Kailangan natin ng sapat na energiya araw-araw.','Kailangan natin ng sapat na enerhya araw-araw.','Kailangan natin ng sapat na inerhiya araw-araw.'],
    ['Alin ang gumamit ng katapora (panghalip na nauuna sa pangngalang tinutukoy)?','Dahil sa kaniyang sipag, naging iskolar si Lea.','Masipag si Lea kaya naging iskolar siya.','Naging iskolar si Lea dahil masipag si Lea.','Masisipag ang mga iskolar sa aming paaralan.'],
    ['Alin ang pangungusap na WALANG PAKSA?','Maligayang kaarawan sa iyo, Lola!','Masaya ang kaarawan ni Lola kahapon.','Si Lola ay nagdiwang ng kaarawan.','Nagluto ng pansit ang aking lola.']
   ],
   speaking:[
    ['Magbibigay ka ng talumpati sa pagtatapos. Alin ang angkop na panimula?','Sa ating mga magulang, guro at kapuwa magsisipagtapos, magandang hapon po.','Uy, mga kaklase, sa wakas ay tapos na rin ang mahaba nating kalbaryo!','Magandang hapon po; hindi ko po talaga inihanda ang talumpating ito.','Sa ating mga panauhin, pakinggan muna ninyo ang mahaba kong reklamo.'],
    ['Inilahad ng nagsasalita ang datos tungkol sa baha at hiniling sa tagapakinig na sumali sa paglilinis ng estero. Ano ang layunin ng talumpati?','Manghikayat na kumilos para sa kalinisan','Magbigay-aliw sa pamamagitan ng kuwento','Maglahad ng kasaysayan ng isang estero','Ipaliwanag kung paano itinatayo ang estero'],
    ['Ipagtatanggol mo ang mungkahing maglagay ng bentilador sa silid-aralan. Alin ang pinakamatibay na katuwiran?','Ayon sa klinika, dumami ang nahihilo tuwing mainit; makatutulong ang bentilador.','Gusto ng lahat ng kaklase ko ang bentilador kaya dapat na itong bilhin agad.','Mayroon nang bentilador sa ibang paaralan kaya dapat mayroon din tayo.','Mainit talaga sa silid, at ayaw ko talaga ng mainit na silid-aralan.'],
    ['Sa isang forum tungkol sa bagong patakaran, alin ang mahusay na tanong sa panelista?','Paano po susukatin kung nagtagumpay ang patakaran pagkalipas ng isang taon?','Bakit po kayo pumayag sa ganitong patakarang wala namang kuwenta sa amin?','Kayo po ba talaga ang gumawa ng patakarang ito o may iba pang gumawa?','Puwede po bang huwag na lang ipatupad ang patakarang ito sa paaralan?'],
    ['Sa isang patalastas: “Siyam sa sampung doktor ang gumagamit ng aming sabon!” Ano ang mapanuring tanong?','Ilan at sinong doktor ang tinanong, at sino ang nagsarbey?','Anong kulay at amoy ang mayroon ang sabong ito sa ngayon?','Magkano ang sabon at saan ito mabibili sa ating bayan?','Ilang taon na ang kompanyang gumagawa ng sabong ito?'],
    ['Nagkakaiba ang gusto ng pangkat sa paksa ng proyekto. Alin ang mahusay na mungkahi?','Pakinggan natin ang bawat panig, saka tayo bumoto nang patas.','Ako ang lider kaya ang paksa ko na lang ang ating susundin.','Huwag na tayong gumawa ng proyekto para walang mag-away.','Ang paksa ng pinakamaingay sa pangkat ang ating susundin.'],
    ['Alin ang angkop na pormal na pagbabalita?','Ayon sa pamunuan ng paaralan, sisimulan ang pagsasaayos ng aklatan sa Lunes.','Sabi-sabi, aayusin na raw ang aklatan, pero hindi pa talaga sigurado.','Grabe, aayusin na ang aklatan natin, sana naman ay gumanda na.','Baka sa Lunes na, pero ewan ko kung talagang matutuloy ang ayos.'],
    ['Binigkas ang tula nang mahina at paulit-ulit ang linyang “Nasaan ka, Inang Bayan?” Anong damdamin ang nangingibabaw?','Pangungulila at paghahanap','Pagdiriwang at kagalakan','Pagkainip at pagkabagot','Pagmamalaki at paghahambog'],
    ['Alin ang angkop na mungkahi sa kapitan ng barangay?','Iminumungkahi po namin na maglagay ng ilaw sa daan, sapagkat madilim ito tuwing gabi.','Iminumungkahi po namin na ayusin na ninyo agad ang lahat ng problema sa barangay.','Kayo po ang may kasalanan kaya kayo ang dapat mag-ayos ng madilim na daan.','Iminumungkahi po namin na lumipat na lang ang mga nakatira sa madilim na daan.'],
    ['Pinuna ng guro ang konklusyon ng iyong sanaysay. Ano ang angkop na tugon?','Salamat po; babaguhin ko ito upang tumugma sa aking ebidensiya.','Salamat po, pero sa tingin ko po ay perpekto na ang aking sanaysay.','Pasensiya na po, kinopya ko lang naman po iyon mula sa internet.','Salamat po; ipagagawa ko na lang po sa kapatid ko ang pagbabago.']
   ],
   research:[
    ['Alin ang may pinakamalaking posibilidad ng pagkiling?','Pag-aaral tungkol sa inumin na pinondohan ng gumagawa nito','Pag-aaral ng unibersidad na may bukas at malinaw na datos','Ulat ng ahensiyang may malinaw na pamamaraan at sanggunian','Pagsusuring nirepaso at sinuri ng ibang mananaliksik'],
    ['Ano ang may-alam na pahintulot (informed consent) sa pananaliksik?','Pagpayag ng kalahok matapos ipaliwanag ang layunin at panganib','Pagpilit sa kalahok na sagutin ang lahat ng tanong sa sarbey','Paglalathala ng pangalan ng kalahok nang walang paalam sa kaniya','Pagbibigay ng marka sa kalahok batay sa kaniyang mga sagot'],
    ['Sabay na tumataas ang benta ng sorbetes at ang bilang ng nalulunod tuwing tag-init. Ano ang tamang hinuha?','Magkaugnay sila dahil sa init, hindi dahil sanhi ng isa ang isa.','Ang sorbetes ang tuwirang sanhi ng pagkalunod ng mga tao sa dagat.','Ang pagkalunod ng mga tao ang sanhi ng pagbili nila ng sorbetes.','Walang anumang ugnayan ang dalawang pangyayaring ito sa tag-init.'],
    ['Bakit mahalaga ang laki ng sample?','Mas maaasahan ang resulta kapag sapat ang dami ng kalahok.','Mas mabilis matapos ang pag-aaral kapag kaunti ang kalahok.','Mas gumaganda ang pamagat kapag marami ang kalahok.','Hindi mahalaga ang dami basta may sumagot.'],
    ['Alin ang KUWALITATIBONG datos?','Mga sagot sa panayam tungkol sa karanasan sa pag-aaral','Bilang ng mag-aaral na pumapasok sa paaralan bawat araw','Average na iskor ng klase sa pagsusulit sa Filipino','Porsiyento ng mag-aaral na may sariling aklat sa bahay'],
    ['Ano ang layunin ng kaugnay na literatura?','Ipakita ang mga naunang pag-aaral at ang puwang na pupunan','Ilista ang lahat ng aklat na nabasa ng mananaliksik sa buhay','Palitan ang resulta ng sariling pag-aaral ng resulta ng iba','Magbigay ng opinyon tungkol sa mga manunulat at kanilang buhay'],
    ['Hindi tugma ang datos sa iyong haypotesis. Ano ang etikal na gawin?','Iulat ang resulta nang tapat at ipaliwanag ang posibleng dahilan.','Baguhin ang datos upang tumugma ito sa iyong haypotesis sa simula.','Alisin ang lahat ng sagot na hindi sang-ayon sa iyong haypotesis.','Huwag nang iulat ang buong pananaliksik sa klase at sa guro.'],
    ['Alin ang angkop na pamamaraan upang malaman ang opinyon ng 300 mag-aaral?','Sarbey na may malinaw at patas na mga tanong','Panayam sa isang matalik na kaibigan','Pagbasa ng nobela tungkol sa paaralan','Pagmamasid sa isang klase sa loob ng isang oras'],
    ['Ano ang pagkakaiba ng sanhi at ugnayan (correlation)?','Sa sanhi, isa ang nagdudulot ng isa; sa ugnayan, sabay lang silang nagbabago.','Magkasingkahulugan ang dalawang salitang ito sa lahat ng uri ng pananaliksik.','Sa ugnayan, laging ang unang pangyayari ang nagdudulot ng ikalawang pangyayari.','Ginagamit lamang ang sanhi sa agham at hindi kailanman sa pag-aaral ng wika.'],
    ['Paano dapat isulat ang konklusyon ng pananaliksik?','Ibatay ito sa resulta at kilalanin ang mga limitasyon.','Isulat ang gusto mong resulta bago pa magsimula.','Gawin itong mas malawak kaysa sa saklaw ng datos.','Ulitin lamang ang pamagat nang mas mahaba.']
   ],
   writing:['Sumulat ng editoryal tungkol sa isang isyu sa inyong paaralan. Maglahad ng paninindigan at ebidensiya.','Ipagtanggol o tutulan: Dapat bang gawing sapilitan ang serbisyong pampamayanan para sa mga mag-aaral?','Suriin ang isang patalastas na napanood mo. Anong paraan ng panghihikayat ang ginamit nito?','Sumulat ng talumpati para sa Araw ng Kabataan na nanghihikayat ng isang tiyak na pagkilos.','Ipaliwanag kung paano ipinakikita ng isang akdang binasa mo ang isang suliraning panlipunan.','Sumulat ng liham sa patnugot na tumutugon sa isang balitang nabasa mo.','Ihambing ang dalawang panig ng isang isyu at ipaliwanag kung alin ang mas makatwiran.','Sumulat ng sanaysay tungkol sa pananagutan ng kabataan sa paggamit ng social media.','Magmungkahi ng solusyon sa isang suliranin sa transportasyon sa inyong lugar at ipaliwanag ang posibleng epekto nito.','Sumulat ng repleksiyon tungkol sa isang pagpapahalagang natutuhan mo sa isang akdang pampanitikan.'],
   placement:[
    ['Ano ang kahulugan ng “naghihikahos”?','naghihirap sa buhay','nagmamadali sa trabaho','nagpapahinga nang matagal','nagdiriwang ng tagumpay'],
    ['Ano ang kahinaan ng pahayag ng konsehal?','Wala itong kongkretong plano o batayan.','Masyado itong mahaba at maraming detalye.','Gumamit ito ng maraming datos at tsart.','Hindi ito tungkol sa baha sa kanilang lugar.','Sinabi ng konsehal na bababa ang baha kapag inayos ang drainage, ngunit wala siyang inilahad na plano o badyet.'],
    ['Alin ang nasa pokus sa layon?','Niluto ni Ana ang adobo.','Nagluto si Ana ng adobo.','Ipinagluto ni Ana ang kapatid.','Ipinanluto ni Ana ang kawali.'],
    ['Alin ang pinakamatibay na katuwiran?','Ayon sa klinika, bumaba ang nahihilo nang ayusin ang bentilasyon.','Gusto ko ang bagong bentilasyon kaya dapat itong gawin sa lahat.','Sabi ng kaibigan ko, maganda raw ang bagong bentilasyon sa silid.','Mayroon nito ang kabilang bayan kaya dapat mayroon din tayo.'],
    ['Alin ang KUWANTITATIBONG datos?','Average na iskor ng klase sa pagsusulit','Kuwento ng karanasan ng isang mag-aaral','Paglalarawan sa damdamin ng guro','Opinyon tungkol sa silid-aklatan'],
    ['Anong tayutay ang “Umiiyak ang langit”?','Pagsasatao','Pagtutulad','Pagmamalabis','Pagtawag']
   ]
  },
  10:{
   words:[
    ['masinop','sistematikong nag-iingat at nag-aayos','Masinop niyang inihambing ang mga sanggunian bago bumuo ng konklusyon.'],
    ['mapanimbang','maingat na isinasaalang-alang ang magkabilang panig','Mapanimbang ang pagsusuri dahil kinilala nito ang mga limitasyon.'],
    ['masalimuot','magkakaugnay at mahirap himayin','Masalimuot ang isyu kaya gumamit sila ng maraming mapagkakatiwalaang sanggunian.'],
    ['makatwiran','may lohikal at sapat na batayan','Makatwiran ang pasya dahil sinuri ang mga datos at epekto nito.'],
    ['pagpapalagay','ideyang tinatanggap muna ngunit kailangan pang patunayan','Hindi dapat ituring na katotohanan ang pagpapalagay na walang ebidensiya.'],
    ['pagsasakatuparan','aktuwal na pagsasagawa ng plano','Nagsimula ang pagsasakatuparan ng proyekto matapos aprubahan ang badyet.'],
    ['salungatan','pagkakaiba o pagtutunggali ng ideya','Ipinaliwanag ng sanaysay ang salungatan ng dalawang pananaw.'],
    ['pagpapakahulugan','pagbibigay ng kahulugan batay sa konteksto','Nagbabago ang pagpapakahulugan sa salita ayon sa gamit nito.'],
    ['pagpapatibay','pagbibigay-suporta sa pahayag','Nagbigay siya ng halimbawa bilang pagpapatibay sa kaniyang punto.'],
    ['pananalig','matibay na pagtitiwala o paniniwala','Nakasalalay sa ebidensiya, hindi lamang sa pananalig, ang konklusyon.']
   ],
   passages:[
    {text:'Kumalat sa social media ang isang larawang nagsasabing “Walang pasok bukas sa buong rehiyon!” Walang logo ng anumang ahensiya ang larawan, at ang account na nag-post nito ay ginawa lamang noong isang araw. Samantala, wala pang anunsiyo sa opisyal na pahina ng dibisyon.',
     qs:[['Ano ang pinakamatibay na dahilan upang pagdudahan ang post?','Wala itong opisyal na pinagmulan at bago lamang ang account.','Maraming tao na ang nagbahagi at nag-like sa larawan.','Malalaki at makukulay ang mga titik sa larawan.','Gusto ng maraming mag-aaral na walang pasok bukas.'],
         ['Ano ang pinakaangkop na gawin bago ito ibahagi?','Tingnan ang opisyal na pahina ng dibisyon o paaralan.','Ibahagi agad upang mabilis itong malaman ng kaklase.','Itanong sa mga kaibigan kung naniniwala sila rito.','Hintayin kung ilang tao pa ang magbabahagi nito.']]},
    {text:'Isang mangingisda ang nakahuli ng gintong isda na nangakong tutuparin ang tatlo niyang hiling. Humiling siya ng bahay, pagkatapos ay ng palasyo, at sa huli ay ng kapangyarihang mag-utos sa dagat. Kinabukasan, nagising siyang muli sa luma niyang kubo, hawak ang sirang lambat.',
     qs:[['Anong aral ang pinakamahusay na sinusuportahan ng akda?','Ang labis na paghahangad ay maaaring mauwi sa pagkawala.','Dapat laging gumamit ng bagong lambat ang mangingisda.','Mapanganib ang dagat kaya hindi dapat pumalaot.','Sapat na ang tatlong hiling para sa sinumang tao.'],
         ['Ano ang ipinahihiwatig ng “sirang lambat” sa wakas?','Bumalik siya sa dating kalagayan, at mas masahol pa.','Nagkaroon siya ng bagong hanapbuhay sa palasyo.','Masipag siyang nag-ayos ng lambat buong gabi.','Nahuli niyang muli ang gintong isda kinabukasan.']]},
    {text:'Pinag-aralan ng dalawang pangkat ang epekto ng pagbabasa nang malakas sa Baitang 10. Sa Pag-aaral A (120 mag-aaral, isang semestre), tumaas ng 12% ang iskor sa pag-unawa. Sa Pag-aaral B (30 mag-aaral, dalawang linggo), walang makabuluhang pagbabago.',
     qs:[['Bakit maaaring mas mapagkakatiwalaan ang Pag-aaral A?','Mas marami ang kalahok at mas mahaba ang panahon ng pag-aaral.','Mas maikli ang panahon kaya mas madaling sukatin ang resulta.','Mas mataas ang iskor kaya tiyak na tama ang resulta nito.','Mas kaunti ang kalahok kaya mas nasuri ang bawat isa.'],
         ['Ano ang pinakamakatwirang sintesis ng dalawang pag-aaral?','Maaaring makatulong ang pagbasa nang malakas kung matagal itong ginagawa.','Walang silbi ang pagbasa nang malakas sa anumang baitang o paaralan.','Pinatutunayan ng dalawa na laging tumataas ang iskor ng lahat.','Dapat sundin lamang ang pag-aaral na may mas maliit na pangkat.']]},
    {text:'“Bilang nars na naglingkod nang dalawampung taon sa ospital ng lalawigan, nakita ko kung paano nagliligtas ng buhay ang maagang pagpapabakuna. Noong nakaraang taon, 9 sa bawat 10 batang naospital dahil sa tigdas ay hindi bakunado.”',
     qs:[['Paano itinatag ng nagsasalita ang kaniyang kredibilidad (ethos)?','Binanggit niya ang dalawampung taon niyang karanasan bilang nars.','Gumamit siya ng nakaaantig na kuwento tungkol sa isang batang may sakit.','Nagbigay siya ng mga tanong na walang tiyak na sagot sa tagapakinig.','Inulit-ulit niya ang salitang bakuna sa kabuuan ng talumpati.'],
         ['Aling bahagi ang halimbawa ng logos (lohika at datos)?','9 sa bawat 10 batang naospital ay hindi bakunado.','Naglingkod siya nang dalawampung taon sa ospital.','Nakita niya kung paano nagliligtas ng buhay ang bakuna.','Siya ay isang nars sa ospital ng lalawigan.']]},
    {text:'Sa isang maikling kuwento, nakapagtapos sa Maynila ang anak ng magsasaka ngunit tumangging bumalik sa probinsiya. Sa huling eksena, tinanaw niya mula sa bintana ng kaniyang opisina ang mga gusaling tumatakip sa araw at naalala ang malawak na palayan.',
     qs:[['Kung susuriin gamit ang dulog sosyolohikal, ano ang maaaring paksain?','Ang paglipat ng kabataan mula sa probinsiya patungong lungsod.','Ang paggamit ng tugma at sukat sa bawat taludtod ng akda.','Ang talambuhay ng manunulat at ng kaniyang buong pamilya.','Ang bilang ng mga tauhan sa simula ng maikling kuwento.'],
         ['Ano ang ipinahihiwatig ng paghahambing ng gusali at palayan?','May pangungulila siya sa payak na buhay na iniwan.','Mas gusto niya ang tanawin ng matataas na gusali.','Nais niyang magtayo ng opisina sa gitna ng palayan.','Nag-aaral siya ng arkitektura sa isang unibersidad.']]}
   ],
   grammar:[
    ['Alin ang nasa POKUS SA GANAPAN?','Pinagtaniman ni Lolo ng mais ang bakanteng lote.','Nagtanim si Lolo ng mais sa bakanteng lote.','Itinanim ni Lolo ang mais sa bakanteng lote.','Ipinantanim ni Lolo ng mais ang bagong asarol.'],
    ['Alin ang nasa POKUS SA SANHI?','Ikinatuwa ng mga magulang ang pagtatapos ng anak.','Natuwa ang mga magulang sa pagtatapos ng anak.','Pinasalamatan ng mga magulang ang guro ng anak.','Ang mga magulang ay natuwa sa kanilang anak.'],
    ['Alin ang nasa POKUS SA DIREKSIYON?','Sinulatan ni Mara ang kaniyang kaibigan sa Cebu.','Sumulat si Mara sa kaniyang kaibigan sa Cebu.','Isinulat ni Mara ang liham para sa kaibigan.','Ipinansulat ni Mara ng liham ang bagong pluma.'],
    ['Alin ang gumamit ng kasingkahulugan upang maiwasan ang pag-uulit?','Mabilis tumakbo ang kabayo. Matulin din itong lumangoy.','Mabilis tumakbo ang kabayo. Mabilis din itong lumangoy.','Mabilis tumakbo ang kabayo. Mabagal naman itong lumangoy.','Mabilis tumakbo ang kabayo. Ang kabayo ay lumalangoy.'],
    ['Alin ang pangungusap na angkop sa KONKLUSYON ng isang sanaysay na nangangatwiran?','Samakatuwid, kailangang ipagpatuloy ang programa sa pagbasa.','Halimbawa, may programa sa pagbasa ang ilang paaralan.','Gayunpaman, may mga guro na tutol sa programa sa pagbasa.','Bukod dito, may mga aklat na bagong dating sa aklatan.'],
    ['Alin ang pinakaangkop na salin ng “Actions speak louder than words”?','Higit na makahulugan ang gawa kaysa sa salita.','Ang aksiyon ay nagsasalita nang mas malakas kaysa salita.','Malakas magsalita ang mga taong laging kumikilos.','Mas maingay ang aksiyon kaysa sa mga salita.'],
    ['Alin ang wastong gamit ng sina o sila?','Dumating sina Liza at Marco sa pulong.','Dumating sila Liza at Marco sa pulong.','Dumating si Liza at Marco sa pulong.','Dumating sina Liza at si Marco sa pulong.'],
    ['Alin ang pahayag na nagbibigay ng PATUNAY?','Ipinakikita ng datos ng PAGASA na tumaas ang temperatura.','Sa palagay ko, mas mainit ngayon kaysa noong nakaraang taon.','Marahil ay iinit pa ang panahon sa mga susunod na buwan.','Tila mas maalinsangan ang hapon ngayon kaysa kahapon.'],
    ['Alin ang wastong gamit ng ng at nang?','Nagsalita siya nang may paggalang sa mga panauhin.','Nagsalita siya ng may paggalang sa mga panauhin.','Nagsalita siya nang may paggalang nang mga panauhin.','Nagsalita siya ng may paggalang nang mga panauhin.'],
    ['Alin ang pinakamahusay na pahayag ng tesis para sa sanaysay tungkol sa online na pag-aaral?','Dapat palakasin ng paaralan ang suporta sa online na pag-aaral ng lahat.','Maraming mag-aaral ang may sariling cellphone sa ating panahon ngayon.','Ang online na pag-aaral ay ginagawa sa harap ng kompyuter o cellphone.','Noong 2020, nagsimula sa online ang maraming klase sa iba’t ibang paaralan.']
   ],
   speaking:[
    ['Sinabi ng kalaban sa debate: “Walang silbi ang online na klase.” Alin ang pinakamahusay na pagtutol?','Ayon sa ulat ng dibisyon, napanatili ng online na klase ang pag-aaral.','Walang silbi rin naman ang lahat ng argumento ninyo mula pa kanina sa debate.','Nagsisinungaling kayo at hindi kayo dapat paniwalaan ng mga hurado rito.','Mahilig ako sa online na klase kaya tiyak na mali ang inyong sinabi.'],
    ['Ikaw ang moderator ng round table. Alin ang angkop na paglipat sa susunod na panelista?','Salamat, Dr. Cruz. Hingin naman natin ang pananaw ni Bb. Santos.','Tapos na po kayo, Dr. Cruz? Sige, ako na lang po ang magsasalita.','Hindi na po natin kailangan ang pananaw ng iba; sapat na po kayo.','Bb. Santos, sagutin ninyo agad dahil kanina pa kayo tahimik diyan.'],
    ['May kaklase kang galing sa ibang bansa na nag-aaral pa lamang ng Filipino. Paano ka makikipag-usap nang angkop?','Magsalita nang malinaw at dahan-dahan, at gumamit ng halimbawa o kilos.','Magsalita nang mabilis upang masanay siya agad sa ating wika.','Iwasan muna siyang kausapin hanggang matuto siya ng Filipino.','Gumamit ng maraming salitang balbal upang maging kaswal ang usapan.'],
    ['Napanood mo ang isang vlog na nagsasabing gamot sa lahat ng sakit ang isang halamang-gamot. Ano ang mapanuring tugon?','Alamin kung may pag-aaral o pahayag mula sa ahensiyang pangkalusugan.','Bilhin agad ito dahil napakarami nang views at likes ng vlog na ito.','Ibahagi agad sa buong pamilya upang masubukan din nila ang halaman.','Paniwalaan ito dahil maganda at malinaw ang pagkakagawa ng video.'],
    ['Sinabi ng siyentipiko sa panayam na tumataas ang dagat dahil natutunaw ang yelo at umiinit ang tubig. Alin ang tumpak na buod?','Dalawang sanhi ang binanggit: pagkatunaw ng yelo at pag-init ng tubig.','Iisang sanhi lamang ang binanggit: ang pag-ulan sa malalayong bansa.','Sinabi niyang bumababa ang dagat dahil unti-unting lumalamig ang mundo.','Ang labis na pangingisda ang pangunahing sanhi ng pagtaas ng dagat.'],
    ['Gagawa ka ng patalastas para sa proyektong pangkalikasan. Alin ang etikal?','Ipakita ang tunay na datos at ang magagawa ng bawat isa sa komunidad.','Palakihin ang bilang ng punong naitanim upang mas maging kahanga-hanga.','Gamitin ang larawan ng isang artista kahit hindi siya pumayag dito.','Takutin ang mga tao na may multa kahit walang ganoong batas.'],
    ['Ipaliliwanag mo sa Baitang 7 ang “kredibilidad ng sanggunian.” Alin ang angkop?','Ibig sabihin nito, mapagkakatiwalaan ang pinagkunan dahil kilala at may batayan.','Ito ang tawag sa haba at kapal ng isang aklat sa loob ng silid-aklatan.','Ito ang bilang ng beses na lumabas ang isang paksa sa paghahanap sa internet.','Ito ang pagkakaroon ng maganda at makulay na disenyo ng isang website.'],
    ['Sinabi ng kandidato: “Sumama na kayo! Halos lahat sa barangay ay boboto na sa akin!” Anong uri ng propaganda ito?','Bandwagon o pagsakay sa nakararami','Testimonial mula sa isang eksperto','Paglalahad ng tiyak na datos','Paghahambing ng mga plataporma'],
    ['Tinanong ka ng reporter tungkol sa proyekto ng inyong klase. Alin ang malinaw na sagot?','Nagtanim kami ng 200 bakawan sa loob ng tatlong buwan, katuwang ang barangay.','Marami po kaming ginawa, basta po maganda ang naging resulta sa huli.','Hindi ko po alam; ang lider po namin ang nakaaalam ng lahat ng detalye.','Ah, eh, siguro po mga ilan, hindi ko na po masyadong maalala ngayon.'],
    ['Paano mo tatapusin ang isang talakayan?','Bilang paglalagom, nagkasundo tayo sa dalawang hakbang na ilalahad sa Lunes.','Bilang paglalagom, wala tayong napagkasunduan kaya ulitin natin bukas.','Sa tingin ko po, walang patutunguhan ang lahat ng pinag-usapan natin.','Bilang paglalagom, ako na lang po ang magpapasya para sa ating lahat.']
   ],
   research:[
    ['Ano ang triangulation sa pananaliksik?','Paggamit ng iba’t ibang pinagkunan o paraan upang patunayan ang resulta','Paghahati ng papel sa tatlong bahagi na magkakapareho ang haba at lapad','Pagpili ng tatlong pinakamadaling tanong sa isang sarbey ng paaralan','Pagsulat ng tatlong magkakaibang konklusyon sa iisang tanong ng pag-aaral'],
    ['Alin ang pinakamapagkakatiwalaang sanggunian para sa papel pang-akademiko?','Artikulo sa journal na nirepaso ng kapuwa eksperto','Post sa social media na maraming shares at likes','Komento sa isang forum na walang pangalan ng sumulat','Patalastas ng kompanya tungkol sa sarili nitong produkto'],
    ['Ano ang sintesis?','Pagbuo ng bagong pag-unawa mula sa ilang sanggunian','Paglilista ng mga sanggunian ayon sa alpabeto','Pagkopya ng pinakamahabang talata ng sanggunian','Pagbubuod ng iisang sanggunian lamang'],
    ['Ano ang dapat gawin kapag gumamit ka ng AI sa paggawa ng ulat?','Ipaalam ang paggamit nito at suriin ang katumpakan ng nilalaman.','Isumite ang output nang buo bilang sarili mong akda sa guro.','Itago ang paggamit nito upang mas tumaas ang iyong marka sa klase.','Huwag nang basahin ang output dahil laging tama ang sagot nito.'],
    ['Alin ang wastong sangguniang APA (ika-7 edisyon) para sa aklat?','Santos, M. (2020). Wika at lipunan. Aklatang Bayan.','Wika at lipunan, Santos, 2020, aklat na mabuti.','Santos Maria Wika at Lipunan Aklatang Bayan 2020','(2020) Aklatang Bayan: Santos, Wika at lipunan.'],
    ['May 25 kalahok mula sa iisang paaralan ang isang pag-aaral. Ano ang limitasyon nito?','Hindi maaaring gawing pangkalahatan ang resulta sa buong bansa.','Masyadong marami ang kalahok upang masuri nang mabuti ang bawat isa.','Tiyak na mali ang lahat ng resulta ng pag-aaral na ito sa paaralan.','Hindi na kailangang ulitin pa ang ganitong pag-aaral kailanman.'],
    ['Salungat ang resulta ng dalawang mapagkakatiwalaang pag-aaral. Ano ang pinakamainam na gawin?','Ilahad ang dalawang resulta at suriin ang pagkakaiba ng pamamaraan.','Piliin ang pag-aaral na sang-ayon sa iyong sariling opinyon.','Huwag nang banggitin ang alinman sa dalawang pag-aaral.','Pagsamahin ang mga numero upang makakuha ng average.'],
    ['Alin ang angkop na pamagat ng pananaliksik?','Ugnayan ng Oras ng Pagbabasa at Iskor sa Pag-unawa ng Baitang 10','Ang Pagbabasa ay Masaya at Dapat Gawin ng Lahat ng Tao Araw-araw','Basahin Mo Ito Kung Gusto Mong Tumalino Agad sa Loob ng Klase','Mga Bagay na Napansin Ko sa Aklatan Noong Isang Lunes ng Umaga'],
    ['Ano ang layunin ng etikal na pagrepaso bago ang pananaliksik?','Tiyaking ligtas at iginagalang ang mga kalahok','Tiyaking mataas ang magiging iskor ng mananaliksik','Paikliin ang panahon ng pangangalap ng datos','Pumili ng pinakamadaling paksa sa klase'],
    ['Paano maiiwasan ang plahiyo sa pagbubuod ng isang artikulo?','Isulat sa sariling salita at banggitin pa rin ang pinagkunan.','Palitan lamang ang ilang salita at huwag nang banggitin.','Kopyahin ang buong talata ngunit ibahin ang pamagat.','Gumamit ng ibang font upang magmukhang orihinal.']
   ],
   writing:['Sumulat ng posisyong papel tungkol sa isang isyung pambansa. Gumamit ng hindi bababa sa dalawang ebidensiya.','Suriin ang isang akda gamit ang isang dulog pampanitikan (halimbawa: sosyolohikal o humanismo).','Bumuo ng buod at sintesis ng dalawang artikulong nabasa mo tungkol sa iisang paksa.','Sumulat ng kritikal na rebyu ng isang dokumentaryo. Suriin ang kredibilidad ng mga pinagkunan nito.','Ipaliwanag ang epekto ng globalisasyon sa kultura ng kabataang Pilipino.','Sumulat ng panukalang proyekto para sa inyong komunidad. Ilahad ang layunin, hakbang at inaasahang bunga.','Ihambing ang isang akdang Pilipino at isang akdang banyaga na may magkatulad na tema.','Sumulat ng sanaysay na nangangatwiran tungkol sa paggamit ng artificial intelligence sa pag-aaral.','Suriin kung paano inilalarawan ng midya ang isang sektor ng lipunan (halimbawa: magsasaka, OFW o kabataan).','Sumulat ng abstrak ng isang maliit na pananaliksik na nais mong isagawa: paksa, tanong, pamamaraan at inaasahang resulta.'],
   placement:[
    ['Ano ang kahulugan ng “mapanghamon” sa “mapanghamong panahon”?','nangangailangan ng tibay at pagsisikap','puno ng saya at masiglang pagdiriwang','madali at walang anumang problema','tahimik, payapa at walang gulo'],
    ['Alin ang pinakamakatwirang mungkahi?','Paunlarin ang turismo kasabay ng maayos na pamamahala ng basura.','Ipagbawal na ang lahat ng turista sa buong lalawigan.','Huwag nang pansinin ang basura dahil tumaas naman ang kita.','Ilipat na lamang ang basura sa kalapit na lalawigan.','Ayon sa isang ulat, tumaas ng 15% ang turismo sa lalawigan, ngunit dumami rin ang basura sa mga dalampasigan.'],
    ['Alin ang nasa pokus sa ganapan?','Pinaglabhan ni Lola ang batis.','Naglaba si Lola sa batis.','Nilabhan ni Lola ang damit.','Ipinanlaba ni Lola ang sabon.'],
    ['Ikaw ang moderator. Alin ang angkop na paglipat sa susunod na tagapagsalita?','Salamat sa inyong pananaw; pakinggan naman natin ang ikalawang panelista.','Tama na po iyan; wala na po tayong oras para sa inyong sinasabi.','Pakiulit po ninyo ang sinabi ninyo nang mas mahaba at mas detalyado.','Hindi na po natin kailangan ang pananaw ng iba pang panelista.'],
    ['Ano ang nirepasong artikulo (peer-reviewed)?','Artikulong sinuri ng ibang eksperto bago inilathala','Post na maraming likes at shares sa social media','Patalastas na may larawan ng isang sikat na artista','Blog na walang pangalan ng may-akda o petsa'],
    ['Ano ang kahulugan ng “globalisasyon”?','pag-uugnayan ng mga bansa sa ekonomiya at kultura','paglalakbay ng isang tao sa iba’t ibang bansa','paggawa ng globo para sa isang proyekto sa klase','pagsasara ng hangganan ng bansa sa mga dayuhan']
   ]
  }
 };
 function filChoice(row,explanation,context=''){
  const [prompt,answer,...rest]=row;
  const wrongs=rest.slice(0,3),ctx=context||rest[3]||'';
  return mc(prompt,answer,wrongs,explanation,ctx)
 }
 function filipinoActivity(grade,id,index){
  const bank=FIL[grade]||FIL[7];
  if(id==='vocabulary'){
   const entry=bank.words[index%bank.words.length];
   // Wrong meanings: the three other meanings closest in length, so length gives no clue.
   const others=bank.words.filter(w=>w!==entry).map(w=>w[1]).sort((a,b)=>Math.abs(a.length-entry[1].length)-Math.abs(b.length-entry[1].length)).slice(0,3);
   return mc(`Basahin: “${entry[2]}” Ano ang kahulugan ng “${entry[0]}” batay sa pangungusap?`,entry[1],others,`Sa konteksto, ang “${entry[0]}” ay nangangahulugang ${entry[1]}.`)
  }
  if(id==='reading'){
   const passage=bank.passages[Math.floor(index/2)%bank.passages.length],row=passage.qs[index%2];
   return filChoice(row,`Balikan ang teksto. Ang sagot na sinusuportahan nito: “${row[1]}”`,passage.text)
  }
  if(id==='grammar'){const row=bank.grammar[index%bank.grammar.length];return filChoice(row,`Wastong sagot: “${row[1]}”`)}
  if(id==='speaking'){const row=bank.speaking[index%bank.speaking.length];return filChoice(row,`Pinakaangkop: “${row[1]}” Malinaw, magalang at tumutugon ito sa sitwasyon.`)}
  if(id==='writing'){
   const minimum={7:300,8:400,9:500,10:600}[grade]||300;
   return {type:'write',prompt:bank.writing[index%bank.writing.length],minimum,checks:['May malinaw na pangunahing ideya.','May kaugnay na detalye, halimbawa o ebidensiya.','Nasuri ang baybay, bantas at daloy.'],explanation:'Gamitin ang talaan bilang sariling gabay. Ang guro ang magsusuri sa kalidad ng iyong sulatin.'}
  }
  const row=bank.research[index%bank.research.length];
  return filChoice(row,`Wastong sagot: “${row[1]}”`)
 }
 function filipinoPlacement(grade,k){
  const bank=FIL[grade]||FIL[7],row=bank.placement[k%bank.placement.length];
  return filChoice(row,`Wastong sagot: “${row[1]}”`)
 }

 /* ---------- journey engine ---------- */
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const AREA_KEY='readwy-subject-area-v1';
 const T={
  Mathematics:{correct:'Correct!',again:'Not yet. Try again — there is no penalty.',pickFirst:'Choose an answer first.',placeOk:'Correct! You may continue.',placeNo:'Thanks for answering. Check the explanation, then continue.',saved:'Your answer and checklist were saved. Your teacher reviews written work.',more:n=>`Add more to your answer. Write at least ${n} characters.`,checks:'Tick at least two checklist items you reviewed.',lede:'Build confidence with number sense, algebra, geometry, functions, statistics and real-world problem solving.',note:'A short check-in shows where to begin. It is not a final grade.',footer:'Show your steps and check your units when solving.'},
  Filipino:{correct:'Tama!',again:'Hindi pa. Subukang muli; walang bawas sa iyong puntos.',pickFirst:'Pumili muna ng sagot.',placeOk:'Tama! Maaari ka nang magpatuloy.',placeNo:'Salamat sa pagsagot. Basahin ang paliwanag at magpatuloy.',saved:'Nai-save ang iyong sagot at pagninilay. Ang guro ang magsusuri sa iyong sulatin.',more:n=>`Dagdagan pa ang sagot. Kailangan ng hindi bababa sa ${n} titik.`,checks:'Pumili ng hindi bababa sa dalawang pamantayang nasuri mo.',lede:'Palawakin ang pag-unawa sa pagbasa, wika, pakikinig at pagsasalita, pagsulat at pananaliksik.',note:'May maikling paunang pagsusuri upang makita kung saan magsisimula. Hindi ito panghuling marka.',footer:'Sariling gawa ang bawat sagot; magbalik-aral at sumubok muli kung kailangan.'}
 };
 const readStoredUser=()=>{try{return JSON.parse(localStorage.getItem('READwy_new_2026_local_user')||'null')}catch{return null}};
 // The app's live user, completed with the saved sign-up profile (the live object can be missing the grade).
 function getProfile(){
  const live=typeof user!=='undefined'&&user?user:{},stored=readStoredUser()||{};
  const merged={...stored};
  for(const [k,v] of Object.entries(live))if(v!==''&&v!==null&&v!==undefined)merged[k]=v;
  const liveGrade=Number(live.grade),storedGrade=Number(stored.grade);
  if([7,8,9,10].includes(storedGrade)&&!(live.authSource==='firebase'&&[7,8,9,10].includes(liveGrade)))merged.grade=storedGrade;
  return merged
 }
 const gradeFor=profile=>{
  const raw=Number.parseInt(String(profile?.grade??''),10);
  if(raw>=7&&raw<=10)return raw;
  const selected=typeof selectedGrade!=='undefined'?Number.parseInt(String(selectedGrade),10):NaN;
  return selected>=7&&selected<=10?selected:7
 };
 function getArea(){
  // The app keeps the chosen subject inside its story module (getStoryViewState); older pages used a global.
  const story=globalThis.getStoryViewState?.()?.selectedLearningArea;
  if(STATIONS[story])return story;
  if(typeof selectedLearningArea!=='undefined'&&STATIONS[selectedLearningArea])return selectedLearningArea;
  try{const saved=sessionStorage.getItem(AREA_KEY);if(STATIONS[saved])return saved}catch{}
  return story||'English'
 }
 const slug=area=>area==='Mathematics'?'math':'filipino';
 const stationById=(area,id)=>(STATIONS[area]||[]).find(station=>station.id===id);
 const topicFor=(area,grade,id)=>TOPICS[area]?.[grade]?.[id]||'';
 const makeProgress=(area,grade)=>({version:1,subject:slug(area),grade,placement:null,stations:{},updatedAt:new Date().toISOString()});
 const learnerKey=profile=>encodeURIComponent(String(profile?.id||profile?.lrn||profile?.email||profile?.name||'local'));
 const storageKey=(area,grade,profile)=>`readwy-${slug(area)}-journey-v1-g${grade}-${learnerKey(profile)}`;
 const progressCache=new Map(),storageReadFailures=new Set();
 let activeTask=null,storageWarning='';
 try{
  if(typeof sessionStorage!=='undefined'){
   const savedTask=JSON.parse(sessionStorage.getItem('readwy-subject-task-v1')||'null');
   if(savedTask&&['Mathematics','Filipino'].includes(savedTask.area)&&['placement','station'].includes(savedTask.mode)&&Number.isInteger(savedTask.index))activeTask=savedTask
  }
 }catch(error){console.error('READwy subject activity could not be restored.',error)}
 function saveActiveTask(){
  try{if(typeof sessionStorage==='undefined')throw new Error('Session storage is unavailable.');if(activeTask)sessionStorage.setItem('readwy-subject-task-v1',JSON.stringify(activeTask));else sessionStorage.removeItem('readwy-subject-task-v1')}
  catch(error){console.error('READwy subject activity state could not be saved.',error);storageWarning='Your current activity could not be restored after leaving this page.'}
 }
 function progressFor(area,grade=gradeFor(getProfile()),profile=getProfile()){
  const key=storageKey(area,grade,profile);
  if(progressCache.has(key))return progressCache.get(key);
  const empty=makeProgress(area,grade);
  try{
   const raw=localStorage.getItem(key);
   if(raw){
    const saved=JSON.parse(raw);
    if(saved&&saved.version===1&&saved.subject===slug(area)&&saved.grade===grade&&saved.stations&&typeof saved.stations==='object'){
     progressCache.set(key,saved);return saved
    }
    throw new Error('Saved subject progress has an unsupported format.')
   }
  }catch(error){
   console.error('READwy subject progress could not be loaded.',error);
   storageReadFailures.add(key);
   storageWarning='Saved progress could not be read. Changes in this session may not persist.'
  }
  progressCache.set(key,empty);return empty
 }
 function activityFor(area,grade,stationId,index){
  if(area==='Mathematics')return mathActivity(grade,stationId,index);
  return filipinoActivity(grade,stationId,index)
 }
 function placementItem(area,grade,k){return area==='Mathematics'?mathPlacement(grade,k):filipinoPlacement(grade,k)}
 // What the teacher sees: check-in score and, per station, correct answers and written responses.
 function teacherSummary(area,progress){
  const grade=progress.grade;
  return {grade,updatedAt:progress.updatedAt,placement:progress.placement,stations:STATIONS[area].map(station=>{
   const answers=progress.stations[station.id]?.answers||{};let correct=0,choiceItems=0,done=0;const responses=[];
   for(let i=0;i<10;i++){
    const item=activityFor(area,grade,station.id,i),a=answers[i];
    if(item.type==='write'){if(a?.response)responses.push({activity:i+1,prompt:String(item.prompt).slice(0,160),response:String(a.response).slice(0,700)})}
    else{choiceItems++;if(a?.correct)correct++}
    if(a?.done)done++
   }
   return {id:station.id,name:station.name,correct,choiceItems,done,complete:stationComplete(area,progress,station.id),responses}
  })}
 }
 function syncTeacher(area,progress){
  try{
   const ready=globalThis.readwyFirebaseReady;
   if(!ready||typeof ready.then!=='function')return;
   const summary=teacherSummary(area,progress);
   ready.then(api=>api&&typeof api.syncSubjectJourney==='function'?api.syncSubjectJourney(area,summary):null)
    .catch(error=>console.error('READwy subject results could not be sent to the teacher.',error))
  }catch(error){console.error('READwy subject results could not be prepared for the teacher.',error)}
 }
 function persist(area,progress,profile=getProfile()){
  const key=storageKey(area,progress.grade,profile);
  progress.updatedAt=new Date().toISOString();
  if(storageReadFailures.has(key)){storageWarning='Saved progress could not be read. Changes in this session will not overwrite it.';return false}
  try{localStorage.setItem(key,JSON.stringify(progress));storageWarning=''}
  catch(error){console.error('READwy subject progress could not be saved.',error);storageWarning='Progress could not be saved on this device. Check browser storage settings.';return false}
  syncTeacher(area,progress);
  return true
 }
 function completedCount(progress,stationId){
  const answers=progress.stations[stationId]?.answers||{};
  return Object.values(answers).filter(item=>item&&item.done).length
 }
 function correctCount(progress,stationId){
  const answers=progress.stations[stationId]?.answers||{};
  return Object.values(answers).filter(item=>item&&item.correct).length
 }
 function stationComplete(area,progress,stationId){
  const answers=progress.stations[stationId]?.answers||{};
  if(area==='Filipino'&&stationId==='writing')return completedCount(progress,stationId)>=8;
  if(area==='Mathematics'&&stationId==='modeling')return correctCount(progress,stationId)>=6&&answers[8]?.done&&answers[9]?.done;
  return correctCount(progress,stationId)>=8
 }
 function stationUnlocked(area,progress,index){
  if(!progress.placement)return false;
  if(index===0)return true;
  return stationComplete(area,progress,STATIONS[area][index-1].id)
 }
 const allComplete=(area,progress)=>STATIONS[area].every(station=>stationComplete(area,progress,station.id));
 function noticeMarkup(){return storageWarning?`<p class="rw-subject-warning" role="status">${escapeHtml(storageWarning)}</p>`:''}
 function header(area,grade,subtitle=''){
  return `<header class="rw-subject-header"><button type="button" class="rw-subject-brand" onclick="window.readwySubjectBack()" aria-label="Back to learning areas"><span aria-hidden="true">R</span><strong>READwy <small>${escapeHtml(area)}</small></strong></button><div class="rw-subject-grade">Grade ${grade}${subtitle?` · ${escapeHtml(subtitle)}`:''}</div><button type="button" class="rw-subject-quiet" onclick="window.readwySubjectBack()">Learning areas</button></header>`
 }
 function renderWelcome(){
  const area=getArea();if(!STATIONS[area])return;
  const grade=gradeFor(getProfile()),t=T[area];
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,'Your learning journey')}<section class="rw-subject-welcome"><p class="rw-subject-eyebrow">A new learning adventure</p><h1>${escapeHtml(area)}</h1><p class="rw-subject-lede">${escapeHtml(t.lede)}</p><div class="rw-subject-welcome-grid">${STATIONS[area].map((station,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(station.name)}</strong></article>`).join('')}</div><p class="rw-subject-grade-focus"><strong>Grade ${grade} focus:</strong> ${escapeHtml(GRADE_FOCUS[area][grade])}</p><p class="rw-subject-note">${escapeHtml(t.note)}</p><div class="rw-subject-actions"><button class="rw-subject-primary" type="button" onclick="window.go('map')">Start ${escapeHtml(area)} journey</button><button class="rw-subject-secondary" type="button" onclick="window.readwySubjectBack()">Choose another learning area</button></div></section>${noticeMarkup()}</div></main>`
 }
 function renderMap(){
  const area=getArea();if(!STATIONS[area])return;
  const grade=gradeFor(getProfile()),progress=progressFor(area,grade),stations=STATIONS[area],total=stations.reduce((sum,station)=>sum+completedCount(progress,station.id),0),completed=allComplete(area,progress);
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,'Journey map')}<section class="rw-subject-map"><div class="rw-subject-map-heading"><div><p class="rw-subject-eyebrow">Your progress</p><h1>${escapeHtml(area)} Journey</h1><p>Six stations · 10 activities each · work at your own pace.</p></div><div class="rw-subject-progress" aria-label="${total} of 60 activities complete"><strong>${total}<small>/60</small></strong><span>activities</span></div></div>${progress.placement?`<p class="rw-subject-checkin-done" role="status">Check-in complete · ${progress.placement.score}/${progress.placement.total} correct. This is a starting point, not a grade.</p>`:`<section class="rw-subject-checkin"><div><strong>Start with a short check-in</strong><p>Six questions help you see what you already know. Your result will not block the journey.</p></div><button class="rw-subject-primary" type="button" onclick="window.readwySubjectStartPlacement()">Start check-in</button></section>`}${runtime.feedback?`<p class="rw-subject-warning" role="status">${escapeHtml(runtime.feedback)}</p>`:''}<div class="rw-subject-stations">${stations.map((station,index)=>{
   const count=completedCount(progress,station.id),isDone=stationComplete(area,progress,station.id),unlocked=stationUnlocked(area,progress,index),status=isDone?'Complete':unlocked?'Open':'Locked',need=area==='Mathematics'&&station.id==='modeling'?'Get 6 correct and save both written tasks':'Earn 8 to open the next station';
   return `<article class="rw-subject-station ${isDone?'is-complete':''} ${!unlocked?'is-locked':''}"><div class="rw-subject-station-number">${index+1}</div><div class="rw-subject-station-copy"><span class="rw-subject-status">${status}</span><h2>${escapeHtml(station.name)}</h2><p>${escapeHtml(topicFor(area,grade,station.id))}</p><div class="rw-subject-meter" role="progressbar" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="10"><span style="width:${count*10}%"></span></div><small>${count}/10 activities · ${isDone?'Mastered':unlocked?need:progress.placement?'Finish the previous station first':'Take the check-in first'}</small></div><button type="button" class="rw-subject-station-button" ${unlocked?'':'disabled'} onclick="window.readwySubjectOpenStation('${station.id}')">${unlocked?(isDone?'Review':'Open station'):'Locked'}</button></article>`
  }).join('')}</div><p class="rw-subject-footer-note">${escapeHtml(T[area].footer)}</p>${completed?`<section class="rw-subject-finish" role="status"><div><strong>Journey complete!</strong><p>You completed all six ${escapeHtml(area)} stations.</p></div><button type="button" class="rw-subject-primary" onclick="window.readwySubjectCertificate()">View certificate</button></section>`:''}</section>${storageWarning?noticeMarkup():''}${runtime.certificate?certificateMarkup(area,grade,progress):''}</div></main>`;
  runtime.feedback=''
 }
 const runtime={certificate:false,feedback:''};
 function certificateMarkup(area,grade,progress){
  const learner=escapeHtml(getProfile().name||'Learner');
  return `<div class="rw-subject-certificate-layer" role="dialog" aria-modal="true" aria-labelledby="rwSubjectCertificateTitle"><section class="rw-subject-certificate"><button class="rw-subject-certificate-close" type="button" onclick="window.readwySubjectCloseCertificate()" aria-label="Close certificate">×</button><p>READwy Learning Journey</p><h1 id="rwSubjectCertificateTitle">Certificate of Completion</h1><span>Presented to</span><h2>${learner}</h2><p>for completing the Grade ${grade} ${escapeHtml(area)} journey and its six learning stations.</p><small>${new Date(progress.updatedAt||Date.now()).toLocaleDateString()}</small><div class="rw-subject-actions"><button class="rw-subject-primary" type="button" onclick="window.print()">Print certificate</button><button class="rw-subject-secondary" type="button" onclick="window.readwySubjectCloseCertificate()">Close</button></div></section></div>`
 }
 function renderTask(){
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade);
  let session=activeTask;
  if(session&&(session.area!==area||session.grade!==grade)){activeTask=null;saveActiveTask();session=null}
  if(!STATIONS[area]||!session){renderMap();return}
  const placement=session.mode==='placement',station=placement?null:stationById(area,session.stationId);
  if(!placement&&!station){renderMap();return}
  const item=placement?placementItem(area,grade,session.index):activityFor(area,grade,station.id,session.index);
  if(!item){renderMap();return}
  const record=placement?null:(progress.stations[station.id]?.answers||{})[session.index];
  const placementAnswer=placement?(session.answers||[])[session.index]:null;
  const context=item.context?`<blockquote class="rw-subject-passage">${escapeHtml(item.context)}</blockquote>`:'';
  const writing=item.type==='write';
  const fil=area==='Filipino';
  const writingUI=writing?`<label class="rw-subject-writing-label" for="rwSubjectResponse">${fil?'Ang iyong sagot':'Your response'}</label><textarea id="rwSubjectResponse" minlength="${item.minimum}" placeholder="${fil?'Isulat dito ang sarili mong sagot.':'Write your own response here.'}">${escapeHtml(record?.response||session.draft||'')}</textarea><p class="rw-subject-minimum">${fil?`Hindi bababa sa ${item.minimum} titik. Ang guro ang magsusuri ng iyong sulatin.`:`At least ${item.minimum} characters. Your teacher reviews written work.`}</p><fieldset class="rw-subject-checks"><legend>${fil?'Suriin ang iyong gawa':'Review your work'}</legend>${item.checks.map((check,index)=>`<label><input type="checkbox" name="rwSubjectCheck" value="${index}" ${(record?.checks||session.checks||[]).includes(index)?'checked':''}> ${escapeHtml(check)}</label>`).join('')}</fieldset><button type="button" class="rw-subject-primary" onclick="window.readwySubjectSubmitWriting()">${fil?'I-save ang sagot':'Save response'}</button>`:'';
  const choices=writing?'':`<div class="rw-subject-choices">${item.choices.map((choice,index)=>`<button type="button" onclick="window.readwySubjectAnswer(${index})">${String.fromCharCode(65+index)}. ${escapeHtml(choice)}</button>`).join('')}</div>`;
  const alreadyDone=!!record?.done,feedback=runtime.feedback||'';
  const showExplanation=item.explanation&&(alreadyDone||!!placementAnswer);
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,placement?'Check-in':station.name)}<section class="rw-subject-task"><div class="rw-subject-task-top"><button type="button" class="rw-subject-secondary" onclick="window.readwySubjectBackToMap()">← Journey map</button><span>${placement?`Check-in · ${session.index+1} of 6`:`Activity ${session.index+1} of 10`}</span></div><div class="rw-subject-task-progress"><span style="width:${((session.index+1)/(placement?6:10))*100}%"></span></div><p class="rw-subject-eyebrow">${placement?'A low-stakes starting point':escapeHtml(station.name)}</p><h1>${escapeHtml(item.prompt)}</h1>${context}${writingUI}${choices}<p class="rw-subject-feedback" role="status" aria-live="polite">${alreadyDone&&!feedback?(fil?'Tapos na. Maaari kang magpatuloy o bumalik sa mapa.':'Completed. You may continue or return to your map.'):escapeHtml(feedback)}</p>${showExplanation?`<p class="rw-subject-explanation">${escapeHtml(item.explanation)}</p>`:''}<div class="rw-subject-task-actions">${placement?`<button type="button" class="rw-subject-primary" onclick="window.readwySubjectNextPlacement()">${session.index<5?'Next question':'Finish check-in'}</button>`:alreadyDone?`<button type="button" class="rw-subject-primary" onclick="window.readwySubjectNext()">Next activity</button>`:''}<button type="button" class="rw-subject-secondary" onclick="window.readwySubjectBackToMap()">Return to map</button></div>${noticeMarkup()}</section></div></main>`;
  runtime.feedback='';
  if(fil&&item.context&&typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined'){
   const speakButton=document.createElement('button');speakButton.type='button';speakButton.className='rw-subject-speak';speakButton.textContent='Pakinggan ang teksto (kung may Filipino voice)';
   speakButton.onclick=()=>{const utterance=new SpeechSynthesisUtterance(item.context);utterance.lang='fil-PH';speechSynthesis.cancel();speechSynthesis.speak(utterance)};
   app.querySelector('.rw-subject-passage')?.after(speakButton)
  }
 }
 // Opened from the train's subject list: show this subject's journey (welcome page with its six stations).
 function openJourney(area){
  if(!STATIONS[area])return;
  try{sessionStorage.setItem(AREA_KEY,area)}catch{}
  try{const story=globalThis.getStoryViewState?.();if(story&&story.selectedLearningArea!==area)globalThis.restoreStoryViewState?.({...story,selectedLearningArea:area})}catch{}
  runtime.certificate=false;runtime.feedback='';activeTask=null;saveActiveTask();
  go('journey')
 }
 function startPlacement(){
  runtime.certificate=false;runtime.feedback='';activeTask={mode:'placement',index:0,answers:[],area:getArea(),grade:gradeFor(getProfile())};saveActiveTask();go('subject-task')
 }
 function openStation(stationId){
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),station=stationById(area,stationId),index=STATIONS[area]?.findIndex(item=>item.id===stationId)??-1;
  if(!station||index<0||!stationUnlocked(area,progress,index)){runtime.feedback=progress.placement?'Complete the previous station to unlock this one.':'Take the short check-in first.';renderMap();return}
  const answers=progress.stations[stationId]?.answers||{},next=Array.from({length:10},(_,i)=>i).find(i=>!answers[i]?.done);
  runtime.certificate=false;runtime.feedback='';activeTask={mode:'station',stationId,index:next===undefined?0:next,area,grade};saveActiveTask();go('subject-task')
 }
 function answer(choiceIndex){
  if(!activeTask)return;
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),t=T[area]||T.Mathematics;
  const placement=activeTask.mode==='placement',station=placement?null:stationById(area,activeTask.stationId);
  const item=placement?placementItem(area,grade,activeTask.index):activityFor(area,grade,station.id,activeTask.index),choice=item.choices?.[choiceIndex];
  if(choice===undefined)return;
  if(placement){
   activeTask.answers=activeTask.answers||[];
   if(activeTask.answers[activeTask.index]){renderTask();return} // the first answer counts in the check-in
   activeTask.answers[activeTask.index]={correct:choice===item.answer,choice};
   runtime.feedback=choice===item.answer?t.placeOk:t.placeNo;
   saveActiveTask();
  }else{
   const data=progress.stations[station.id]||(progress.stations[station.id]={answers:{}});
   const existing=data.answers[activeTask.index]||{attempts:0};
   existing.attempts++;
   existing.correct=existing.correct||choice===item.answer;
   existing.done=existing.correct;
   data.answers[activeTask.index]=existing;
   runtime.feedback=choice===item.answer?t.correct:t.again;
   persist(area,progress)
  }
  renderTask()
 }
 function submitWriting(){
  if(!activeTask||activeTask.mode!=='station')return;
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),station=stationById(area,activeTask.stationId),item=activityFor(area,grade,station.id,activeTask.index),textarea=app.querySelector('#rwSubjectResponse'),text=textarea?.value.trim()||'',checks=[...app.querySelectorAll('input[name="rwSubjectCheck"]:checked')].map(input=>Number(input.value)),t=T[area]||T.Mathematics;
  activeTask.draft=text;activeTask.checks=checks;saveActiveTask();
  if(text.length<item.minimum){runtime.feedback=t.more(item.minimum);renderTask();return}
  if(checks.length<2){runtime.feedback=t.checks;renderTask();return}
  const data=progress.stations[station.id]||(progress.stations[station.id]={answers:{}});
  const existing=data.answers[activeTask.index]||{attempts:0};existing.attempts++;existing.done=true;existing.correct=false;existing.response=text;existing.checks=checks;data.answers[activeTask.index]=existing;
  runtime.feedback=t.saved;
  persist(area,progress);renderTask()
 }
 function next(){
  if(!activeTask||activeTask.mode!=='station')return;
  if(activeTask.index<9){activeTask.index++;runtime.feedback='';saveActiveTask();renderTask();return}
  activeTask=null;saveActiveTask();runtime.feedback='';go('map')
 }
 function nextPlacement(){
  if(!activeTask||activeTask.mode!=='placement')return;
  const area=getArea(),t=T[area]||T.Mathematics;
  if(!(activeTask.answers||[])[activeTask.index]){runtime.feedback=t.pickFirst;renderTask();return}
  if(activeTask.index<5){activeTask.index++;runtime.feedback='';saveActiveTask();renderTask();return}
  const grade=gradeFor(getProfile()),progress=progressFor(area,grade),answers=activeTask.answers||[],score=answers.filter(answer=>answer?.correct).length;
  progress.placement={score,total:6,completedAt:new Date().toISOString()};
  persist(area,progress);activeTask=null;saveActiveTask();runtime.feedback='';go('map')
 }
 function backToMap(){runtime.feedback='';activeTask=null;saveActiveTask();go('map')}
 // "Learning areas": back to the train's subject list (not the old open-book screens).
 function back(){
  runtime.feedback='';activeTask=null;saveActiveTask();runtime.certificate=false;
  try{sessionStorage.removeItem(AREA_KEY);sessionStorage.removeItem('readwyJourneyOpened');sessionStorage.removeItem('READwy_current_view_v1')}catch{}
  location.assign('index.html?view=train')
 }
 function showCertificate(){runtime.certificate=true;renderMap()}
 function closeCertificate(){runtime.certificate=false;renderMap()}
 function openFirstActivity(stationId){openStation(stationId)}
 function render(areaOverride){
  const area=areaOverride||getArea();
  if(!STATIONS[area])return;
  if(page==='subject-task')renderTask();
  else if(page==='journey')renderWelcome();
  else renderMap()
 }
 const api={stations:STATIONS,gradeFocus:GRADE_FOCUS,topics:TOPICS,activityFor,placementItem,progressFor,stationComplete,stationUnlocked,allComplete,storageKey,teacherSummary,renderWelcome,renderMap,renderTask,openJourney,startPlacement,openStation,answer,submitWriting,next,nextPlacement,backToMap,back,showCertificate,closeCertificate,render};
 globalThis.READwySubjectLabs=api;
 globalThis.readwySubjectStartPlacement=startPlacement;
 globalThis.readwySubjectOpenStation=openFirstActivity;
 globalThis.readwySubjectAnswer=answer;
 globalThis.readwySubjectSubmitWriting=submitWriting;
 globalThis.readwySubjectNext=next;
 globalThis.readwySubjectNextPlacement=nextPlacement;
 globalThis.readwySubjectBackToMap=backToMap;
 globalThis.readwySubjectBack=back;
 globalThis.readwySubjectCertificate=showCertificate;
 globalThis.readwySubjectCloseCertificate=closeCertificate
})();
