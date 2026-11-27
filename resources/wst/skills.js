/* Spellscript Part A: Writing Skills (multiple choice, 20 items per grade).
   Written for READwy. It covers the same skill areas as standardized writing tests such as the
   Test of Written Language (vocabulary, spelling, punctuation and capitalization, logical sentences,
   sentence combining) plus paragraph organization, with Philippine contexts and the Spellscript topic of each grade.
   Scoring uses the same DepEd scales as the essay: percent -> DO 8 s. 2015 transmuted grade -> descriptor,
   DO 73 s. 2012 level of proficiency (Beginning to Advanced) and writer level
   (Independent / Instructional / Frustration, adapted from Phil-IRI).
   It is a READwy screening tool, not a nationally normed test. */
const WSK_SKILLS={voc:'Vocabulary in context',spl:'Spelling',pun:'Punctuation & capitalization',use:'Grammar & logical sentences',com:'Sentence combining',org:'Paragraph organization'};
const WSK_ORDER=['voc','voc','voc','spl','spl','spl','pun','pun','pun','pun','use','use','use','use','com','com','com','org','org','org'];
const WSK_ITEMS={
7:[
['Read: “The rescuers worked <u>tirelessly</u> through the night to save the stranded families.” What does <i>tirelessly</i> mean?',['without stopping','carelessly','quietly','angrily'],0],
['Read: “Mang Tonyo was <u>reluctant</u> to leave his house even when the river began to rise.” What does <i>reluctant</i> mean?',['unwilling','excited','quick','proud'],0],
['Which word best completes the sentence? “Our teacher asked us to ____ our essays before submitting them so we could fix our mistakes.”',['reverse','revise','remove','receive'],1],
['Which word is spelled correctly?',['neccessary','necesary','necessary','neccesary'],2],
['Which sentence has a misspelled word?',['We recieved the relief goods yesterday.','Their house is near the plaza.','The weather was cool and breezy.','She brought her umbrella to school.'],0],
['Which word correctly completes the sentence? “Please put the plastic and the paper in ____ bins.”',['seperate','separate','sepparate','seperete'],1],
['Which sentence is punctuated correctly?',['My favorite foods are, adobo sinigang and pancit.','My favorite foods are adobo sinigang, and, pancit.','My favorite foods are adobo, sinigang, and pancit.','My favorite foods, are adobo, sinigang and pancit.'],2],
['Which sentence uses capital letters correctly?',['we visited manila bay last sunday.','We visited Manila Bay last Sunday.','We visited manila Bay last sunday.','We Visited Manila bay Last Sunday.'],1],
['Which sentence should end with a question mark?',['Please close the door','I wonder what time it is','Where did you put my notebook','The bus is late again'],2],
['Which word correctly completes the sentence? “All the ____ uniforms were washed before the program.” (The uniforms belong to many students.)',['student’s','students','students’','students’s'],2],
['Which verb completes the sentence? “Each of the learners ____ a library card.”',['has','have','having','are having'],0],
['Which verb completes the sentence? “Yesterday, my brother ____ his bike to school.”',['ride','rides','riding','rode'],3],
['Which sentence makes sense?',['Because it was raining, we left our umbrellas at home to stay dry.','Because it was raining, we brought our umbrellas.','It was raining, so the ground stayed completely dry.','Although it was raining, we brought umbrellas because it was sunny.'],1],
['Which word completes the sentence? “Ana and ____ will lead the group report.”',['me','myself','I','mine'],2],
['Combine: “The jeepney was crowded. We still found seats.”',['The jeepney was crowded, so we still found seats.','The jeepney was crowded, but we still found seats.','The jeepney was crowded because we still found seats.','The jeepney was crowded, we still found seats.'],1],
['Combine: “Lito plays the guitar. Lito sings in the choir.”',['Lito plays the guitar, Lito sings in the choir.','Lito plays the guitar but sings in the choir.','Lito, plays the guitar sings in the choir.','Lito plays the guitar and sings in the choir.'],3],
['Combine: “We stayed indoors. The storm was strong.”',['We stayed indoors because the storm was strong.','We stayed indoors although the storm was strong.','The storm was strong because we stayed indoors.','We stayed indoors, the storm was strong.'],0],
['Which is the best topic sentence for a paragraph about saving water at home?',['Water is made of hydrogen and oxygen.','My cousin lives near a river.','There are simple ways every family can save water at home.','Some people like swimming in the summer.'],2],
['Put the sentences in order. (1) Then, she mixed the flour and the eggs. (2) First, Lola gathered all the ingredients. (3) Finally, she baked the bibingka for twenty minutes.',['1, 2, 3','2, 1, 3','3, 2, 1','2, 3, 1'],1],
['Which word best fills the blank? “Our class planted twenty trees. ____, we put up a fence to protect them.”',['However','For example','Afterward','Instead'],2]],
8:[
['Read: “The scientist’s explanation was so <u>lucid</u> that even the younger students understood it.” What does <i>lucid</i> mean?',['long','clear','boring','confusing'],1],
['Read: “Coral reefs are <u>fragile</u>, so divers must not touch them.” What does <i>fragile</i> mean?',['easily damaged','very large','brightly colored','hard to find'],0],
['Which word best completes the sentence? “Overfishing can ____ fish populations until too few are left to recover.”',['complete','repeat','deplete','delete'],2],
['Which word is spelled correctly?',['enviroment','environment','envirnment','environmnet'],1],
['Which sentence has a misspelled word?',['The tide began to rise at noon.','Plastic waste harms sea turtles.','The fishermen were greatful for the calm sea.','The divers studied the reef carefully.'],2],
['Which word is spelled correctly?',['ocassionally','occassionally','ocasionally','occasionally'],3],
['Which sentence is punctuated correctly?',['After the storm passed, the fishermen returned to sea.','After the storm, passed the fishermen returned to sea.','After the storm passed the fishermen, returned to sea.','After, the storm passed the fishermen returned to sea.'],0],
['Which sentence uses quotation marks correctly?',['The guide said “please do not step on the coral”.','The guide said, please do not step on the coral.','The guide said, “Please do not step on the coral.”','The guide, said “Please do not step on the coral.”'],2],
['Which sentence uses capital letters correctly?',['The philippine sea lies east of luzon.','The Philippine Sea lies east of Luzon.','The Philippine sea lies East of Luzon.','the Philippine Sea lies east of luzon.'],1],
['Which sentence uses the semicolon correctly?',['The sea; was calm the boats left early.','The sea was calm; and the boats left early.','The sea was calm the boats; left early.','The sea was calm; the boats left early.'],3],
['Which verb completes the sentence? “Neither the captain nor the crew members ____ ready to sail.”',['was','were','is','has been'],1],
['Which completes the sentence? “By the time we reached the shore, the boat ____.”',['has already leave','already leaves','had already left','will already left'],2],
['Which sentence makes sense?',['The beach was clean because volunteers had thrown more trash on it.','The beach was dirty because volunteers had collected all the trash.','The beach was clean because volunteers had collected the trash.','Although volunteers collected the trash, the beach was clean.'],2],
['Which sentence is written correctly?',['Swimming near the reef, a sea turtle was seen by Maria.','Swimming near the reef, Maria saw a sea turtle.','Maria saw a sea turtle, swimming near the reef she was.','Near the reef swimming, saw Maria a sea turtle.'],1],
['Combine: “Mangroves protect the coast. Mangroves give fish a place to breed.”',['Mangroves protect the coast and give fish a place to breed.','Mangroves protect the coast, mangroves give fish a place to breed.','Mangroves protect the coast but give fish a place to breed.','Mangroves, protecting the coast, fish breed.'],0],
['Combine: “The fisherman was tired. He kept rowing home.”',['Because the fisherman was tired, he kept rowing home.','The fisherman was tired, therefore he kept rowing home.','Although the fisherman was tired, he kept rowing home.','The fisherman was tired he kept rowing home.'],2],
['Combine: “The reef is in Tubbataha. The reef is protected by law. The reef is a World Heritage Site.”',['The reef is in Tubbataha, the reef is protected by law, the reef is a World Heritage Site.','The reef in Tubbataha, a World Heritage Site, is protected by law.','Protected by law the reef, Tubbataha is a World Heritage Site in.','The reef is in Tubbataha and the reef is protected and the reef is a World Heritage Site.'],1],
['A paragraph is about plastic in the ocean. Which sentence does NOT belong?',['Plastic bags can look like jellyfish to sea turtles.','Many seabirds eat small pieces of plastic.','Some plastic takes hundreds of years to break down.','Basketball is a popular sport in the Philippines.'],3],
['Which is the best concluding sentence for a paragraph about why we must protect mangroves?',['Mangroves have roots.','Protecting mangroves today keeps our coasts and our food supply safe tomorrow.','My uncle owns a boat.','Next, we will discuss volcanoes.'],1],
['Which word best fills the blank? “Many people think the sea will always provide fish. ____, fish catches have dropped in recent years.”',['Similarly','As a result','However','For instance'],2]],
9:[
['Read: “The proposal was <u>controversial</u>; some parents strongly supported it while others opposed it.” What does <i>controversial</i> mean?',['widely accepted','causing disagreement','very old','easy to understand'],1],
['Read: “Learning in the mother tongue can <u>facilitate</u> understanding in the early grades.” What does <i>facilitate</i> mean?',['prevent','measure','make easier','delay'],2],
['Which word best completes the sentence? “The speaker cited several studies to ____ her claim.”',['substantiate','abandon','dismiss','postpone'],0],
['Which word is spelled correctly?',['accomodate','acommodate','acomodate','accommodate'],3],
['Which sentence has a misspelled word?',['The principal gave a brief speech.','The debate team made a convincing arguement.','Their claim was supported by evidence.','The audience listened attentively.'],1],
['Which word is spelled correctly?',['independant','indipendent','independent','independint'],2],
['Which sentence uses the colon correctly?',['Bring three things to the debate: your notes, a pen, and a timer.','Bring: three things to the debate your notes, a pen, and a timer.','Bring three things to the debate your notes: a pen, and a timer.','Bring three: things to the debate, your notes a pen and a timer.'],0],
['Which sentence uses commas correctly?',['Mrs. Reyes who teaches Filipino, coached our team.','Mrs. Reyes, who teaches Filipino coached our team.','Mrs. Reyes, who teaches Filipino, coached our team.','Mrs. Reyes who, teaches Filipino coached our team.'],2],
['Which pair completes the sentence? “The school changed ____ policy, and now ____ easier to borrow books.”',['it’s … its','its … it’s','its’ … its','it’s … it’s'],1],
['Which sentence is NOT a run-on?',['Many learners speak Bisaya at home they understand lessons in Bisaya more easily.','Many learners speak Bisaya at home, they understand lessons in Bisaya more easily.','Many learners speak Bisaya, at home so they understand lessons in Bisaya more easily.','Many learners speak Bisaya at home, so they understand lessons in Bisaya more easily.'],3],
['Which sentence is written correctly?',['The new policy aims to improve reading, strengthening writing, and building confidence.','The new policy aims to improve reading, strengthen writing, and build confidence.','The new policy aims improving reading, to strengthen writing, and confidence.','The new policy aims to improve reading, writing that is stronger, and to build confidence.'],1],
['Which verb completes the sentence? “One of the reasons for the new rules ____ to keep students safe.”',['are','were','is','have been'],2],
['Which evidence best supports the claim “Mother-tongue instruction helps young learners understand lessons”?',['The mother tongue is spoken in many homes.','Studies show pupils taught in their home language answer comprehension questions more accurately.','Some teachers prefer English.','Books in Filipino are colorful.'],1],
['Which sentence is the clearest?',['When Ana met Lisa, she handed her the notes.','When Ana met Lisa, she gave them to her.','When Ana met Lisa, Ana handed Lisa the notes.','They handed her the notes when she met her.'],2],
['Combine: “Some say English should be used from Grade 1. Others believe the mother tongue works better.”',['While some say English should be used from Grade 1, others believe the mother tongue works better.','Some say English should be used from Grade 1, others believe the mother tongue works better.','Some say English should be used from Grade 1 because others believe the mother tongue works better.','Some say English, others believe, should be used from Grade 1 the mother tongue works better.'],0],
['Combine: “The policy was changed. The change happened in 2025. Teachers were surprised.”',['The policy was changed, it happened in 2025, teachers were surprised.','Teachers were surprised, the policy, in 2025, was changed it happened.','In 2025 surprised teachers the policy was changed.','Teachers were surprised when the policy was changed in 2025.'],3],
['Combine: “Reading at home builds vocabulary. It also improves writing.”',['Reading at home builds vocabulary, also it improves writing.','Reading at home not only builds vocabulary but also improves writing.','Reading at home builds vocabulary but improves writing.','Reading at home, builds vocabulary improves writing.'],1],
['Which sentence states a clear claim for an argument?',['Many languages are spoken in the Philippines.','Some people have opinions about language.','Schools should allow learners to use their mother tongue in Grades 1 to 3.','Language is interesting to study.'],2],
['Which sentence best answers a counterclaim?',['English is important.','Everyone agrees with me.','People who disagree are wrong.','Some argue that English should start early; however, research shows children learn English better after mastering their first language.'],3],
['Put the sentences in order. (1) For example, a 2019 study found that pupils taught in their home language read better. (2) Mother-tongue instruction improves early reading. (3) Therefore, schools should keep it in the early grades.',['2, 1, 3','1, 2, 3','3, 1, 2','1, 3, 2'],0]],
10:[
['Read: “The heat during April and May is <u>detrimental</u> to learning in crowded classrooms.” What does <i>detrimental</i> mean?',['helpful','unrelated','harmful','common'],2],
['Read: “The committee will <u>deliberate</u> before making a final decision on the school calendar.” What does <i>deliberate</i> mean here?',['think carefully and discuss','announce quickly','refuse to act','celebrate'],0],
['Which phrase best completes the sentence? “Opening classes in August would ____ the rainy season, when classes are often suspended.”',['compensate','coincide with','contradict','conclude'],1],
['Which word is spelled correctly?',['consciencious','conscientous','concientious','conscientious'],3],
['Which sentence has a misspelled word?',['The heat index reached dangerous levels.','The new calender will be released next month.','Several schools shifted to blended learning.','The department considered many factors.'],1],
['Which word is spelled correctly?',['maintainance','maintenence','maintenance','maintanance'],2],
['Which sentence is punctuated correctly?',['The hottest months—April and May—are now part of the school year.','The hottest months, April and May are now part of the school year.','The hottest months April, and May—are now part of the school year.','The hottest—months April and May are now part of the school year.'],0],
['Which sentence is punctuated correctly?',['The heat was intense and, many learners felt dizzy.','The heat, was intense and many learners felt dizzy.','The heat was intense, and many learners felt dizzy.','The heat was intense and many, learners felt dizzy.'],2],
['Which sentence quotes a source correctly?',['According to PAGASA, “the heat index may reach 42 °C in some areas.”','According to PAGASA “the heat index may reach 42 °C in some areas”.','According, to PAGASA, the heat index may reach “42 °C” in some areas.','According to “PAGASA,” the heat index may reach 42 °C in some areas'],0],
['Which sentence uses capital letters correctly?',['The department of education announced the change in may.','The Department Of Education announced the Change in May.','The Department of Education announced the change in May.','the Department of education announced the change in May.'],2],
['Which verb completes the sentence? “If the school year ____ in June, learners would avoid the hottest months in class.”',['opens','opened','will open','had opened would'],1],
['Which verb completes the sentence? “Every teacher and every student ____ affected by the heat.”',['is','are','were being','have'],0],
['Which word best fills the blank? “The new calendar avoids the hottest months; ____, it may shorten the summer vacation.”',['therefore','however','for example','similarly'],1],
['Which sentence is written correctly?',['The heat in May is worse than January.','The heat in May is more worse than in January.','May’s heat is worst than January’s.','The heat in May is worse than the heat in January.'],3],
['Combine: “DepEd studied the problem. It considered weather data. It also surveyed teachers.”',['DepEd studied the problem, it considered weather data, it also surveyed teachers.','DepEd studied the problem by considering weather data and surveying teachers.','DepEd studied weather data, the problem, and teachers surveyed it.','Considering weather data DepEd, the problem was studied surveying teachers.'],1],
['Combine: “The policy has benefits. It also has drawbacks. Both must be weighed.”',['The policy has benefits, it also has drawbacks, both must be weighed.','The policy has benefits but drawbacks it also has weighed.','The policy has both benefits and drawbacks, which must be weighed carefully.','Benefits the policy has, drawbacks too, weighed must be both.'],2],
['Combine: “Classes were suspended. The heat index was too high. This happened in April.”',['In April, classes were suspended because the heat index was too high.','Classes were suspended, the heat index was too high in April it happened.','Because classes were suspended, the heat index was too high in April.','The heat index in April was suspended because classes were too high.'],0],
['Which is the best thesis statement for an argument?',['The school year has many months.','Some people like summer.','This essay is about school.','The school year should open in June so that learners avoid studying during the hottest months.'],3],
['Which evidence best supports the claim “Hot classrooms reduce learning”?',['Many learners like cold drinks.','A study found that test scores drop as classroom temperature rises above 30 °C.','Summer is the best time for vacations.','Some classrooms have windows.'],1],
['What should a strong concluding paragraph of an argument do?',['Introduce a brand-new topic.','List every source again word for word.','Restate the claim and leave readers with a final reason or call to action.','Apologize for the writer’s opinion.'],2]]
};
const WSK_N=20,WSK_WEIGHT=.4; // overall Spellscript = 40% Part A + 60% essay
const wskEsc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const wskItems=()=>(WSK_ITEMS[G]||WSK_ITEMS[7]).map((it,i)=>({n:i+1,s:WSK_ORDER[i],q:it[0],o:it[1],a:it[2]}));
function wskState(){ST.skills=ST.skills||{i:0,ans:{}};return ST.skills}
function wskLabels(pct){const g=transmute(pct);return {grade:g,descriptor:descriptor(g),proficiency:proficiency(g),writer:writerLevel(g)}}
function wskScore(){const st=wskState(),items=wskItems(),by={};let score=0;
 items.forEach(it=>{by[it.s]=by[it.s]||{c:0,t:0};by[it.s].t++;if(st.ans[it.n]===it.a){score++;by[it.s].c++}});
 const pct=score/WSK_N*100;return {score,total:WSK_N,percent:pct,...wskLabels(pct),bySkill:by,answers:{...st.ans},date:new Date().toISOString(),grade_level:G}}
/* score bands for 20 items (worked out from the same transmutation table) */
function wskBands(){const rows=[];let cur=null;for(let s=WSK_N;s>=0;s--){const L=wskLabels(s/WSK_N*100),k=L.proficiency;if(!cur||cur.k!==k){cur={k,hi:s,lo:s,writer:L.writer,descriptor:L.descriptor};rows.push(cur)}else cur.lo=s}return rows}
const WSK_COL={Independent:'#2f7d1a',Instructional:'#b77b00',Frustration:'#b8283a'};

const wskStyle=document.createElement('style');wskStyle.textContent=`
#wsk{position:fixed;z-index:18;display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,29%);border-radius:18px;overflow:hidden;
 background:radial-gradient(ellipse at 40% 30%,#fffaf0,#f6ead0);box-shadow:inset 0 0 0 2px #5c3d14,inset 0 0 0 5px #d4a64a,inset 0 0 0 7px #805a1e,0 14px 30px rgba(0,0,0,.55);
 font-family:"Source Sans 3","Segoe UI",sans-serif;color:#1d2340;animation:wskIn .45s ease-out}
@keyframes wskIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
#wsk .main{display:flex;flex-direction:column;min-height:0;padding:3.2% 3.4% 2.6%;gap:2.2%}
#wsk .stub{display:flex;flex-direction:column;align-items:center;gap:3%;padding:4% 6%;border-left:3px dotted #8a6a2e;background:rgba(255,248,232,.6);min-height:0}
#wsk .kick{display:flex;align-items:center;justify-content:space-between;gap:10px;font:800 1.05em/1.2 "Source Sans 3",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a6a2e}
#wsk .wchip{padding:.28em .9em;border-radius:99px;background:#0d1f45;color:#f6dc8e;letter-spacing:.04em;text-transform:none;font-weight:700;font-size:.92em;white-space:nowrap}
#wsk h2{margin:0;font:700 1.95em/1.12 Literata,Georgia,serif;color:#0d1f45}
#wsk .q{font:600 1.45em/1.45 Literata,Georgia,serif;color:#1d2340}
#wsk .q u{text-decoration-color:#c9a14a;text-decoration-thickness:2px}
#wsk .opts{display:grid;gap:1.6vh;margin-top:auto}
#wsk .opt{display:flex;align-items:center;gap:.9em;width:100%;padding:.62em 1em;border-radius:14px;border:1.5px solid #d9c18a;background:#fffdf6;cursor:pointer;text-align:left;font:500 1.25em/1.3 Literata,Georgia,serif;color:#1d2340;transition:background .15s,box-shadow .15s}
#wsk .opt b{display:grid;place-items:center;flex:none;width:1.9em;height:1.9em;border-radius:50%;border:2px solid #c9a14a;font:800 .85em "Source Sans 3",sans-serif;color:#8a6a2e}
#wsk .opt:hover{background:#fff6dd}#wsk .opt.on{background:linear-gradient(180deg,#1b3a78,#0d1f45);border-color:#e9c46a;color:#fff8e6;box-shadow:0 4px 10px rgba(0,0,0,.25)}
#wsk .opt.on b{background:#f6dc8e;color:#0d1f45;border-color:#f6dc8e}
#wsk .opt:focus-visible{outline:3px solid #e9c46a;outline-offset:2px}
#wsk .stub h3{margin:0;font:700 1.25em/1 Literata,Georgia,serif;color:#0d1f45;text-align:center}
#wsk .stub small{font:800 .78em "Source Sans 3",sans-serif;letter-spacing:.16em;color:#8a6a2e}
#wsk .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%}
#wsk .grid button{aspect-ratio:1.25;border-radius:9px;border:1.5px solid #c9a14a;background:#fffaf0;color:#3b2a14;font:800 1em "Source Sans 3",sans-serif;cursor:pointer}
#wsk .grid button.done{background:linear-gradient(180deg,#1d5a3d,#124530);color:#f3dc98}
#wsk .grid button.cur{box-shadow:0 0 0 3px #e9c46a}
#wsk .nav{display:flex;gap:8px;width:100%;margin-top:auto}
#wsk .btn{flex:1;padding:.6em .8em;border-radius:99px;border:2px solid #0d1f45;background:#fffaf0;color:#0d1f45;font:800 1em "Source Sans 3",sans-serif;cursor:pointer}
#wsk .btn.gold{border-color:#a8761e;background:linear-gradient(180deg,#ffd75e,#f0b323);color:#2b1a00}
#wsk .btn:disabled{opacity:.45;cursor:default}
#wsk .prog{width:100%;height:10px;border-radius:99px;background:#e6d6b0;overflow:hidden}#wsk .prog i{display:block;height:100%;background:#1f6b3d}
/* interpretation */
#wsk .res{display:grid;grid-template-columns:auto 1fr;gap:4%;align-items:center}
#wsk .big{font:800 5em/1 Literata,Georgia,serif;color:#0d1f45;text-align:center}#wsk .big small{display:block;font:700 .28em "Source Sans 3",sans-serif;color:#8a6a2e;letter-spacing:.12em;margin-top:.4em}
#wsk .lvl{display:inline-block;padding:.3em 1em;border-radius:12px;color:#fff;font:800 1.6em/1.1 Literata,Georgia,serif}
#wsk .facts{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:.6em}
#wsk .facts span{padding:.25em .7em;border-radius:99px;background:#fff;border:1px solid #e0cc98;font:700 .98em "Source Sans 3",sans-serif}
#wsk .note{margin:.5em 0 0;font:500 1.12em/1.4 Literata,Georgia,serif}
#wsk .skills{display:grid;grid-template-columns:1fr 1fr;gap:2.2vh 4%;margin-top:1.5vh;padding:2.2vh 2.4%;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid #e3d2a8}#wsk .skh{grid-column:1/-1;font:800 .95em "Source Sans 3",sans-serif;letter-spacing:.14em;color:#8a6a2e}
#wsk .sk{display:grid;grid-template-columns:1fr auto;gap:4px;font:700 1.02em "Source Sans 3",sans-serif}
#wsk .sk .bar{grid-column:1/-1;height:9px;border-radius:99px;background:#e6d6b0;overflow:hidden}#wsk .sk .bar i{display:block;height:100%;border-radius:99px}
#wsk table{width:100%;border-collapse:collapse;font:600 .9em "Source Sans 3",sans-serif}
#wsk th{background:#0d1f45;color:#f6dc8e;padding:5px 6px;text-align:left;font-size:.92em}
#wsk td{padding:5px 6px;border-bottom:1px solid #e3d2a8}
#wsk td:first-child{white-space:nowrap}#wsk tr.me td{background:#fff1c4;font-weight:800}
#wsk .nextb ol{margin:0;padding-left:1.2em;font:600 1.02em/1.45 "Source Sans 3",sans-serif;color:#1d2340;align-self:stretch}#wsk .nextb h3{font-size:1.6em;line-height:1.1}#wsk .src{font:500 .74em/1.3 "Source Sans 3",sans-serif;color:#6b5d45;text-align:left}
@media (prefers-reduced-motion:reduce){#wsk{animation:none}}`;
document.head.appendChild(wskStyle);

function wskBox(el){const L=wstLayout();Object.assign(el.style,{left:L.tx+'px',top:L.ty+'px',width:L.tw+'px',height:L.th+'px',fontSize:Math.max(11,Math.min(L.th/34,L.tw/56))+'px'})}
function wskClose(){document.getElementById('wsk')?.remove()}
addEventListener('resize',()=>{const w=document.getElementById('wsk');if(w)wskBox(w)});
function wskMount(html){let w=document.getElementById('wsk');if(!w){w=document.createElement('section');w.id='wsk';w.setAttribute('role','region');w.setAttribute('aria-label','WST Part A: Writing Skills');document.body.appendChild(w)}
 wskBox(w);w.innerHTML=html;return w}

function wstSkills(){const saved=pLoad('wst_skills_'+G,null);if(saved)return wskResult(saved);
 ST.stage='skills';persist();wskQuestion(wskState().i||0);
 setTimeout(()=>{try{say('Part A. Choose the best answer for each question. Then you will write your essay.')}catch(e){}},400)}
function wskQuestion(i){const st=wskState(),items=wskItems();i=Math.max(0,Math.min(WSK_N-1,i));st.i=i;persist();
 const it=items[i],done=Object.keys(st.ans).length,all=done===WSK_N;
 const w=wskMount(`<div class="main"><div class="kick"><span>Spellscript Part A · Writing Skills</span><span class="wchip">${WSK_SKILLS[it.s]}</span></div>
  <h2>Question ${it.n} of ${WSK_N}</h2><div class="q">${it.q}</div>
  <div class="opts" role="radiogroup" aria-label="Answer choices">${it.o.map((o,k)=>`<button type="button" class="opt${st.ans[it.n]===k?' on':''}" role="radio" aria-checked="${st.ans[it.n]===k}" data-k="${k}"><b>${'ABCD'[k]}</b><span>${wskEsc(o)}</span></button>`).join('')}</div></div>
  <div class="stub"><small>PART A</small><h3>${done} / ${WSK_N}<br><small>ANSWERED</small></h3><div class="prog"><i style="width:${done/WSK_N*100}%"></i></div>
  <div class="grid">${items.map(x=>`<button type="button" data-go="${x.n-1}" class="${st.ans[x.n]!=null?'done':''}${x.n===it.n?' cur':''}" aria-label="Question ${x.n}">${x.n}</button>`).join('')}</div>
  <div class="nav"><button type="button" class="btn" data-prev ${i===0?'disabled':''}>◀ Back</button>${i<WSK_N-1?'<button type="button" class="btn gold" data-next>Next ▶</button>':`<button type="button" class="btn gold" data-submit ${all?'':'disabled'}>Submit ✓</button>`}</div></div>`);
 w.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{try{ac();SFX.pop()}catch(e){}st.ans[it.n]=+b.dataset.k;persist();setTimeout(()=>wskQuestion(i<WSK_N-1?i+1:i),220)});
 w.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>wskQuestion(+b.dataset.go));
 w.querySelector('[data-prev]').onclick=()=>wskQuestion(i-1);
 const nx=w.querySelector('[data-next]');if(nx)nx.onclick=()=>wskQuestion(i+1);
 const sb=w.querySelector('[data-submit]');if(sb)sb.onclick=wskSubmit;
 w.querySelector('.opt.on,.opt')?.focus({preventScroll:true})}
function wskSubmit(){const st=wskState(),miss=wskItems().filter(x=>st.ans[x.n]==null);
 if(miss.length){try{SFX.buzz()}catch(e){}return notice(`Answer question ${miss.map(m=>m.n).join(', ')} first.`)}
 sheet('Submit Part A?',`<p>You answered all ${WSK_N} questions. <b>You cannot change your answers after you submit.</b></p>`,[['Keep checking','ghost',closeSheet],['Submit Part A','gold',()=>{closeSheet();const r=wskScore();pSave('wst_skills_'+G,r);ST.skillsDone=true;persist();try{SFX.fanfare?.()}catch(e){}wskResult(r)}]])}

/* ---------- Part B: the writing activity, scored with 6+1 Trait® Writing ----------
   Source: Education Northwest, 6+1 Trait® Writing Rubrics, Grades 3–12 (2021).
   Six traits are scored on its 6-point scale (1 Beginning, 2 Emerging, 3 Developing, 4 Capable,
   5 Experienced, 6 Exceptional; 4–6 = proficient). Presentation (+1) is not scored: the essay is typed.
   Part B points = trait total ÷ 36 × 20. Spellscript total = Part A (20) + Part B (20) = 40 points. */
const TRAIT_LEVELS=['','Beginning','Emerging','Developing','Capable','Experienced','Exceptional'];
const TRAITS=[
 {k:'ideas',name:'Ideas',q:'Does the writer engage the reader with fresh information or perspective on a focused topic?',d:['','No clear main idea; few or no details.','A main idea is hinted at; details are thin or off-topic.','A main idea is present; details are general or uneven.','A clear, focused main idea supported by relevant details from the sources.','A focused main idea well developed with specific, well-chosen evidence.','A sharply focused main idea, richly developed with insightful evidence.']},
 {k:'org',name:'Organization',q:'Does the organizational structure enhance the ideas and make them easier to understand?',d:['','No clear beginning, middle or end.','Ideas are listed with little order.','Has a beginning and end; order and transitions are routine.','Clear introduction, body and conclusion; transitions connect most ideas.','Logical, effective structure with smooth transitions.','A purposeful structure that carries the reader through the ideas.']},
 {k:'voice',name:'Voice',q:'Is the voice appropriate to the task, purpose, and audience?',d:['','No sense of the writer or the audience.','Voice is flat or inappropriate for the task.','Voice is sincere but inconsistent for the purpose.','Voice fits the purpose and audience most of the time.','Engaging voice that suits the task and audience.','Compelling, confident voice ideally suited to purpose and audience.']},
 {k:'word',name:'Word Choice',q:'Does the language convey precise and compelling meaning and/or create a vivid picture for the reader?',d:['','Words are limited or misused.','Words are vague, repeated or general.','Words are correct but ordinary; some repetition.','Words are accurate and varied; meaning is clear.','Precise, varied words that strengthen the meaning.','Vivid, precise words chosen with care for effect.']},
 {k:'flu',name:'Sentence Fluency',q:'Does the writer control sentences so the text flows smoothly when read aloud?',d:['','Sentences are incomplete, run-on or hard to read.','Sentences are simple and repetitive; reader stumbles.','Sentences are mostly correct but mechanical; few transitions.','Varied sentences that are usually correct and flow smoothly.','A variety of well-built sentences with rhythm and flow.','Strong, varied sentences with compelling rhythm.']},
 {k:'conv',name:'Conventions',q:'How well does the text illustrate the writer’s proficiency with grade-appropriate conventions?',d:['','Many errors make the text very hard to read.','Many errors; the text needs much editing.','Some errors in spelling, punctuation or capitalization.','Mostly correct conventions; minor editing needed.','Consistently correct conventions; very limited editing.','Virtually error-free; conventions enhance readability.']}];
const to6=s=>[0,1,2,4,5][Math.max(1,Math.min(4,Math.round(s)))]; // 1–4 rubric -> 6+1 levels (auto estimate tops at 5)
function traitScore(text){const base=scoreEssay(),c=Object.fromEntries(base.criteria.map(x=>[x.k,x.score]));
 const sents=(text.match(/[^.!?]+[.!?]+/g)||[text]).map(s=>s.trim()).filter(Boolean),lens=sents.map(s=>words(s)),n=lens.length||1;
 const avg=lens.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(lens.reduce((a,b)=>a+(b-avg)**2,0)/n);
 const starts=new Set(sents.map(s=>(s.split(/\s+/)[0]||'').toLowerCase())).size/n;
 const wl=(text.toLowerCase().match(/[a-z']+/g)||[]),content=wl.filter(w=>w.length>3),ttr=content.length?new Set(content).size/content.length:0,longw=wl.length?wl.filter(w=>w.length>=7).length/wl.length:0;
 const trans=(text.match(/\b(first|second|next|then|finally|also|in addition|however|therefore|as a result|for example|for instance|because|although|in conclusion|moreover|furthermore|on the other hand)\b/gi)||[]).length;
 const audience=(text.match(/\b(we|our|you|your|us|families|students|learners|readers|everyone)\b/gi)||[]).length/Math.max(1,wl.length);
 const t={ideas:to6((c.ideas+c.evid)/2),org:to6(c.org),conv:to6(c.conv)};
 t.word=Math.max(1,Math.min(5,1+(ttr>=.5)+(ttr>=.62)+(longw>=.12)+(longw>=.18)));
 t.flu=Math.max(1,Math.min(5,1+(avg>=9&&avg<=28)+(sd>=5)+(starts>=.65)+(trans>=Math.max(3,n/3))));
 t.voice=Math.max(1,Math.min(5,Math.round((t.ideas+t.word+t.flu)/3)+(audience>=.03?0:-1)-(/\b(gonna|wanna|lol|kinda)\b/i.test(text)?1:0)));
 const short=words(text)<(MINW[G]||150);if(short)for(const k in t)t[k]=Math.min(t[k],3);
 const sum=TRAITS.reduce((a,x)=>a+t[x.k],0),points=Math.round(sum/36*20),avgT=sum/6;
 return {model:'6+1 Trait Writing (Education Northwest, 2021)',traits:TRAITS.map(x=>({k:x.k,name:x.name,level:t[x.k],label:TRAIT_LEVELS[t[x.k]],desc:x.d[t[x.k]],q:x.q})),
  sum,points,total:20,average:avgT,overall:TRAIT_LEVELS[Math.round(avgT)],proficient:avgT>=4,short,words:words(text)}}
function wstTotal(partB){const a=pLoad('wst_skills_'+G,null);if(!a||!partB)return null;const score=a.score+partB.points,pct=score/40*100;
 return {score,total:40,percent:pct,partA:{score:a.score,total:a.total,writer:a.writer},partB:{score:partB.points,total:20,level:partB.overall},...wskLabels(pct)}}
function nextStepsHTML(){let prog='';try{const s=PP?.readwyJourneyGate?.status?.();const N={aral:'Catch-Up Express',interv:'Inkventure',sra:'Reading Lab'};if(s&&s.program)prog=N[s.program]}catch(e){}
 return `<div style="margin:0 0 12px;padding:12px 14px;border-radius:12px;background:#eef7e8;border:1.5px solid #8cc47a"><b style="font:800 1.05em Literata,Georgia,serif;color:#1f5c30">✅ What happens next</b>
  <ol style="margin:.4em 0 0;padding-left:1.2em;line-height:1.5"><li>Your Spellscript is complete. Your answers and essay are saved and sent to your teacher.</li><li>Your teacher reviews your essay and confirms the final rating.</li>
  <li>Press <b>Return Home</b> to go back to your Journey Map.${prog?` Your next stop is the <b>${prog}</b>, chosen from your GST score.`:' Your next stop opens on the map.'}</li><li>Open <b>View Submission</b> any time to see your essay and scores.</li></ol></div>`}

function wskResult(r){const col=WSK_COL[r.writer];
 const skills=Object.entries(WSK_SKILLS).map(([k,name])=>{const b=r.bySkill[k]||{c:0,t:0},p=b.t?b.c/b.t*100:0;return `<div class="sk"><span>${name}</span><span>${b.c}/${b.t}</span><div class="bar"><i style="width:${p}%;background:${p>=75?'#2f7d1a':p>=50?'#c98a00':'#b8283a'}"></i></div></div>`}).join('');
 const goB=!ST.startedAt;
 wskMount(`<div class="main"><div class="kick"><span>Spellscript Part A · Writing Skills · Done</span><span class="wchip">Grade ${G}</span></div>
  <div class="res"><div class="big">${r.score}/${r.total}<small>PART A POINTS</small></div>
   <div><span class="lvl" style="background:${col}">Part A: ${r.writer}</span><div class="facts"><span>Proficiency: ${r.proficiency}</span><span>Descriptor: ${r.descriptor}</span></div>
   <p class="note">This is only half of your Spellscript. Your final writing level comes from Part A + Part B (40 points).</p></div></div>
  <div class="skills"><div class="skh">PART A SCORE BY SKILL</div>${skills}</div></div>
  <div class="stub nextb"><small>WHAT HAPPENS NEXT</small><h3>Part B<br><span style="font-size:.75em">Writing Activity</span></h3>
   <ol><li>Read the writing prompt and the 3 sources.</li><li>Plan your ideas.</li><li>Write your essay (at least ${MINW[G]||150} words) in <b>45 minutes</b>.</li><li>Review and submit.</li></ol>
   <p class="src">Part B is worth <b>20 points</b>, scored with the 6+1 Trait® Writing rubric (Education Northwest). Part A + Part B = 40 points.</p>
   <div class="nav"><button type="button" class="btn gold" data-cont>${goB?'Start Part B ▶':'Back to Part B ▶'}</button></div></div>`).querySelector('[data-cont]').onclick=wskToEssay}
function wskToEssay(){wskClose();
 if(!ST.startedAt){ST.startedAt=Date.now();ST.deadline=ST.startedAt+LIMIT;pSave('wst_timer_'+G,{durationMs:LIMIT,startedAt:ST.startedAt,deadline:ST.deadline,finishedAt:null,remainingMs:LIMIT});persist();notice('⏱ Part B: Writing Activity. Your 45 minutes start now.')}
 resume()}
/* Part B result + Spellscript total (40) */
function partBHTML(rec){const tr=rec.traits,tot=rec.total40;if(!tr)return '';
 const lvlCol=l=>l>=4?'#2f7d1a':l===3?'#c98a00':'#b8283a';
 const head=tot?`<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px;padding:12px 14px;border-radius:12px;background:#0d1f45;color:#f3ead6">
   <b style="font:800 1.25em Literata,Georgia,serif;color:#ffe08a">Spellscript total: ${tot.score} / 40</b>
   <span class="fact" style="background:${WSK_COL[tot.writer]};color:#fff;border-color:${WSK_COL[tot.writer]}"><small style="color:#fff3c4">WRITER LEVEL</small>${tot.writer}</span>
   <span class="fact" style="background:#fffaf0;color:#0d1f45"><small style="color:#8a6a2e">PROFICIENCY</small>${tot.proficiency}</span><span class="fact" style="background:#fffaf0;color:#0d1f45"><small style="color:#8a6a2e">PART A · SKILLS</small>${tot.partA.score}/20</span><span class="fact" style="background:#fffaf0;color:#0d1f45"><small style="color:#8a6a2e">PART B · WRITING</small>${tot.partB.score}/20</span></div>
   <p style="margin:.2em 0 .6em">${LEVEL_NOTE[tot.writer]}</p>`:'';
 return head+`<h3 style="margin:.4em 0 .3em">Part B · Writing Activity: ${tr.points}/20 · ${tr.overall}${tr.proficient?' (proficient)':' (not yet proficient)'}</h3>
  <table style="border-collapse:collapse;width:100%;font-size:.88em">${tr.traits.map((t,i)=>`<tr style="background:${i%2?'#fff':'#fbf3df'}"><td style="padding:6px;font-weight:800;white-space:nowrap;vertical-align:top">${t.name}</td><td style="padding:6px;text-align:center;vertical-align:top;white-space:nowrap"><b style="color:${lvlCol(t.level)}">${t.level}/6</b><br><small>${t.label}</small></td><td style="padding:6px;vertical-align:top">${t.desc}<br><small style="color:#5b5f6e">${t.q}</small></td></tr>`).join('')}</table>
  <p style="font-size:.8em;color:#5b5f6e">Part B is estimated automatically with the 6+1 Trait® Writing rubric (Education Northwest, 2021). Your teacher confirms the final rating.</p>`}
function rubric61HTML(){const pts=[['Part A · Writing Skills','20 multiple-choice items: vocabulary, spelling, punctuation & capitalization, grammar & logical sentences, sentence combining, paragraph organization','20'],['Part B · Writing Activity','Essay scored with 6+1 Trait® Writing: six traits × 1–6 points; trait total ÷ 36 × 20','20'],['WST total','Part A + Part B','40']];
 const bands=[];let cur=null;for(let s=40;s>=0;s--){const L=wskLabels(s/40*100);if(!cur||cur.k!==L.proficiency){cur={k:L.proficiency,hi:s,lo:s,w:L.writer,d:L.descriptor};bands.push(cur)}else cur.lo=s}
 return `<h3 style="margin-top:0">How the Spellscript is scored (40 points)</h3><table style="border-collapse:collapse;width:100%;font-size:.85em">${pts.map((r,i)=>`<tr style="background:${i%2?'#fff':'#fbf3df'}"><td style="padding:6px;font-weight:800">${r[0]}</td><td style="padding:6px">${r[1]}</td><td style="padding:6px;text-align:center;font-weight:900">${r[2]}</td></tr>`).join('')}</table>
 <h3>Part B rubric: 6+1 Trait® Writing</h3><p style="font-size:.85em">Each trait gets a level from 1 to 6: <b>1 Beginning · 2 Emerging · 3 Developing</b> (not yet proficient) · <b>4 Capable · 5 Experienced · 6 Exceptional</b> (proficient).</p>
 <div style="overflow:auto"><table style="border-collapse:collapse;width:100%;font-size:.78em"><tr style="background:#1d3466;color:#fff"><th style="padding:5px;text-align:left">Trait</th><th style="padding:5px">6 Exceptional</th><th style="padding:5px">4 Capable</th><th style="padding:5px">2 Emerging</th></tr>${TRAITS.map((t,i)=>`<tr style="background:${i%2?'#fff':'#fbf3df'}"><td style="padding:5px;vertical-align:top"><b>${t.name}</b><br><small style="color:#5b5f6e">${t.q}</small></td><td style="padding:5px;vertical-align:top">${t.d[6]}</td><td style="padding:5px;vertical-align:top">${t.d[4]}</td><td style="padding:5px;vertical-align:top">${t.d[2]}</td></tr>`).join('')}</table></div>
 <h3>What the total means</h3><table style="border-collapse:collapse;width:100%;font-size:.85em"><tr style="background:#1d3466;color:#fff"><th style="padding:5px">Total (of 40)</th><th style="padding:5px">Level of proficiency</th><th style="padding:5px">Descriptor</th><th style="padding:5px">Writer level</th></tr>${bands.map((b,i)=>`<tr style="background:${i%2?'#fff':'#fbf3df'}"><td style="padding:5px;text-align:center">${b.lo}–${b.hi}</td><td style="padding:5px">${b.k}</td><td style="padding:5px">${b.d}</td><td style="padding:5px">${b.w}</td></tr>`).join('')}</table>
 <p style="font-size:.8em;color:#5b5f6e">Sources: Education Northwest, 6+1 Trait® Writing Rubrics, Grades 3–12 (2021); DepEd Order No. 8, s. 2015 (transmutation and descriptors); DepEd Order No. 73, s. 2012 (levels of proficiency); writer levels adapted from the Phil-IRI (independent, instructional, frustration). Part A is a READwy screening test, not a nationally normed test.</p>`}
/* toolbar chip: which part of the Spellscript the learner is in */
setInterval(()=>{try{if(document.hidden)return;const bar=document.getElementById('wstbar');if(!bar)return;let c=bar.querySelector('.wpart');
 if(!c){c=document.createElement('span');c.className='wpart';c.style.cssText='display:none;margin-left:.8em;padding:.15em .8em;border-radius:99px;background:linear-gradient(180deg,#ffd75e,#f0b323);color:#2b1a00;font:800 .82em "Source Sans 3",sans-serif;letter-spacing:.06em;white-space:nowrap';bar.querySelector('.brand')?.after(c)}
 const sc=typeof S!=='undefined'?S.scene:'',txt=document.getElementById('wsk')&&!ST.skillsDone?'PART A · WRITING SKILLS':['explore','plan','write','review'].includes(sc)?'PART B · WRITING ACTIVITY':'';
 if(c.textContent!==txt){c.textContent=txt;c.style.display=txt?'':'none'}}catch(e){}},800);
(()=>{const install=()=>{
 if(typeof show==='function'&&!show.wsk){const o=show;show=function(name){wskClose();const r=o.apply(this,arguments);return r};show.wsk=1}
 if(typeof resultHTML==='function'&&!resultHTML.wsk){const o=resultHTML;resultHTML=function(r){const rec=pLoad('wst_submission_'+G,null);if(rec&&rec.traits&&rec.status!=='needs-review')return nextStepsHTML()+partBHTML(rec);return nextStepsHTML()+o.apply(this,arguments)};resultHTML.wsk=1}
 if(typeof rubricHTML==='function'&&!rubricHTML.wsk){rubricHTML=function(){return rubric61HTML()};rubricHTML.wsk=1}
 if(typeof finishSubmission==='function'&&!finishSubmission.wsk){const o=finishSubmission;finishSubmission=function(){const ret=o.apply(this,arguments);try{const rec=pLoad('wst_submission_'+G,null);if(rec){const a=pLoad('wst_skills_'+G,null);rec.skills=a||null;
   if(rec.status!=='needs-review'){rec.traits=traitScore(rec.text||essayText());rec.total40=wstTotal(rec.traits);
    if(rec.total40)pSave('wst_score_'+G,{score:rec.total40.score,total:40,percent:rec.total40.percent,partA:rec.total40.partA,partB:rec.total40.partB,writer:rec.total40.writer,proficiency:rec.total40.proficiency,traits:rec.traits.traits,model:rec.traits.model,date:rec.date})}
   pSave('wst_submission_'+G,rec)}}catch(e){console.error(e)}return ret};finishSubmission.wsk=1}
 if(typeof resume==='function'&&!resume.wsk){const o=resume;resume=function(){if(ST.stage==='skills'&&!ST.skillsDone&&!ST.startedAt)return wstSkills();return o.apply(this,arguments)};resume.wsk=1}};
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',install);else install();addEventListener('load',install);})();
