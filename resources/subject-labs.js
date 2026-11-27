(()=>{
 const STATIONS={
  Mathematics:[
   {id:'number',name:'Number & Ratio',goal:'Work with rational numbers, ratios, rates, and percentages.'},
   {id:'algebra',name:'Patterns & Algebra',goal:'Represent patterns and solve equations with clear steps.'},
   {id:'geometry',name:'Geometry & Measurement',goal:'Use geometric properties and measurement to solve problems.'},
   {id:'functions',name:'Functions',goal:'Describe relationships, tables, rules, and graphs.'},
   {id:'data',name:'Data & Probability',goal:'Summarize data and reason about chance.'},
   {id:'modeling',name:'Modeling & Reasoning',goal:'Translate everyday situations into mathematics and explain a solution.'}
  ],
  Filipino:[
   {id:'vocabulary',name:'Talasalitaan',goal:'Gamitin ang pahiwatig sa pangungusap upang maunawaan ang mga salita.'},
   {id:'reading',name:'Pagbasa',goal:'Unawain ang detalye, sanhi, hinuha, at mensahe ng teksto.'},
   {id:'grammar',name:'Gramatika at Wika',goal:'Piliin at gamitin ang malinaw at wastong pahayag.'},
   {id:'speaking',name:'Pakikinig at Pagsasalita',goal:'Unawain ang sitwasyon at tumugon nang malinaw at angkop.'},
   {id:'writing',name:'Pagsulat at Pagrebisa',goal:'Bumuo at magrebisa ng sariling talata ayon sa layunin.'},
   {id:'research',name:'Pananaliksik at Pagpapahayag',goal:'Suriin ang pahayag, ebidensiya, at mapagkakatiwalaang sanggunian.'}
  ]
 };
 const GRADE_FOCUS={
  Mathematics:{
   7:'Rational numbers, ratios, introductory algebra, geometric measurement, and data displays.',
   8:'Proportional relationships, exponents, linear equations, geometry, and probability.',
   9:'Polynomial and quadratic reasoning, coordinate geometry, similarity, and statistical summaries.',
   10:'Functions, quadratic relationships, trigonometric applications, probability, and integrated modeling.'
  },
  Filipino:{
   7:'Talasalitaan sa konteksto, pag-unawa sa tekstong pasalaysay at nagbibigay-kaalaman, gramatika, at organisadong talata.',
   8:'Iba-ibang estruktura at pananaw sa teksto, pagbubuod, kohesyon, at mas masalimuot na pangungusap.',
   9:'Mapanuring pagbasa, pagsusuri ng pahayag at ebidensiya, pangangatwiran, at pormal na pagsulat.',
   10:'Pagsusuri ng panitikan at midya, sintesis, pananaliksik, kredibilidad ng sanggunian, at pormal na pagpapahayag.'
  }
 };
 const WORDS={
  7:[
   ['masinop','maingat at maayos','Sa pag-aayos ng mga aklat, naging masinop si Lito.'],
   ['marahan','dahan-dahan','Marahan niyang isinara ang pinto upang hindi makaistorbo.'],
   ['matatag','hindi madaling sumuko','Nanatiling matatag ang pangkat kahit mahirap ang gawain.'],
   ['payak','simple at hindi magarbo','Payak ang kanilang silid ngunit malinis at maaliwalas.'],
   ['masigla','malakas at puno ng sigla','Masigla siyang nakilahok sa palaro sa paaralan.'],
   ['salat','kulang o kapos','Salat sa tubig ang bukid matapos ang mahabang tag-init.'],
   ['mahinahon','kalmado at hindi padalos-dalos','Mahinahon siyang nagpaliwanag sa kaniyang kaklase.'],
   ['bukal','kusang-loob at tapat','Bukal sa loob niyang tumulong sa paglilinis.'],
   ['marikit','maganda at kaaya-aya','Marikit ang tanawin sa tabi ng ilog.'],
   ['pagsamo','magalang na pakiusap','Dinig sa kaniyang tinig ang pagsamo na ingatan ang mga punla.']
  ],
  8:[
   ['mapanuri','maingat magsuri bago maniwala','Mapanuri si Nena at sinuri muna niya ang datos.'],
   ['masalimuot','maraming bahagi at mahirap unawain','Masalimuot ang suliranin kaya hinati nila ito sa mga hakbang.'],
   ['masikhay','masipag at matiyaga','Masikhay na nagsanay ang pangkat bago ang pagtatanghal.'],
   ['marubdob','matindi at taimtim','Marubdob ang hangarin niyang makatulong sa pamayanan.'],
   ['hinuha','pasyang batay sa mga pahiwatig','Mula sa bakas sa lupa, gumawa sila ng hinuha tungkol sa ulan.'],
   ['salungat','kabaligtaran o hindi magkatugma','Salungat sa tala ang unang pahayag ng ulat.'],
   ['makabuluhan','may mahalagang saysay','Makabuluhan ang talakayan dahil nakapagbahagi ang lahat.'],
   ['masikhay','maingat na nagsisikap','Masikhay niyang inayos ang datos para sa presentasyon.'],
   ['pahiwatig','palatandaang tumutulong sa pag-unawa','Ang madidilim na ulap ay pahiwatig ng paparating na ulan.'],
   ['paninindigan','matibay na panig o paniniwala','Ipinaliwanag niya ang kaniyang paninindigan gamit ang ebidensiya.']
  ],
  9:[
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
  10:[
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
  ]
 };
 const PASSAGES=[
  {text:'Nagtanim si Mara ng pechay sa paso sa paaralan. Araw-araw niya itong dinidiligan at inilalagay sa lugar na nasisikatan ng araw.',fact:'Dinidiligan ni Mara ang pechay araw-araw.',reason:'Kailangan ng halaman ang tubig at sikat ng araw upang lumago.',inference:'Masinop si Mara sa pag-aalaga ng halaman.',message:'Ang tuloy-tuloy na pag-aalaga ay nakatutulong sa paglago ng halaman.'},
  {text:'Naglagay ang klase ng mga basurahang may hiwalay na lalagyan para sa papel at plastik. Pagkaraan ng isang linggo, mas kaunti ang halo-halong basura.',fact:'Pinaghiwalay ng klase ang papel at plastik.',reason:'Mas madaling ayusin at muling gamitin ang magkakahiwalay na basura.',inference:'Nakatulong ang bagong sistema sa kalinisan ng silid.',message:'Nagiging mabisa ang pangangalaga sa kapaligiran kapag sama-samang kumikilos.'},
  {text:'Nagsara ang tulay matapos ang malakas na ulan. Gumamit ang mga mag-aaral ng mas mahabang ligtas na daan upang makarating sa paaralan.',fact:'Nagsara ang tulay matapos ang malakas na ulan.',reason:'Nais ng mga mag-aaral na makarating nang ligtas sa paaralan.',inference:'Handa silang maglaan ng dagdag na oras upang makaiwas sa panganib.',message:'Dapat unahin ang kaligtasan kahit kailangan ng ibang ruta.'},
  {text:'Nakita ni Ben na nalanta ang mga punla sa paso. Sinuri niya ang lupa at napansing tuyo ito bago siya nagdilig.',fact:'Tuyo ang lupa sa paso.',reason:'Nagdilig si Ben dahil tuyo ang lupa.',inference:'Sinuri muna ni Ben ang kalagayan ng punla bago kumilos.',message:'Mahalagang alamin muna ang sanhi ng problema bago magpasya.'},
  {text:'Nag-anyaya ang silid-aklatan ng palitan ng aklat. Nagdala ang mga mag-aaral ng librong nabasa na nila at pumili ng bagong babasahin.',fact:'Nagpalitan ng mga aklat ang mga mag-aaral.',reason:'Nais nilang magkaroon ng bagong babasahin nang hindi bumibili ng aklat.',inference:'Pinahahalagahan ng mga mag-aaral ang pagbabahagi ng kaalaman.',message:'Napapalawak ang kaalaman kapag ibinabahagi ang mga babasahin.'},
  {text:'Nag-ensayo si Lira ng maikling talumpati. Minarkahan niya ang mga salitang bibigyang-diin at huminto sa bawat bantas.',fact:'Nag-ensayo si Lira ng talumpati.',reason:'Minarkahan niya ang mga salitang bibigyang-diin upang luminaw ang mensahe.',inference:'Pinaghandaan ni Lira kung paano mauunawaan ng tagapakinig ang kaniyang ideya.',message:'Nakadaragdag sa linaw ng pagsasalita ang maingat na paghahanda.'},
  {text:'Sa pamilihan, inihambing ni Omar ang presyo at dami ng laman ng dalawang pakete. Pinili niya ang mas sulit para sa pangangailangan ng pamilya.',fact:'Inihambing ni Omar ang presyo at dami ng dalawang pakete.',reason:'Nais niyang piliin ang mas sulit para sa pangangailangan ng pamilya.',inference:'Maingat si Omar sa paggamit ng badyet.',message:'Dapat ihambing ang impormasyon bago bumili.'},
  {text:'Nagbasa si Aya ng dalawang ulat tungkol sa bagyo. Tiningnan niya kung sino ang sumulat at kung kailan inilathala ang bawat ulat.',fact:'Sinuri ni Aya ang sumulat at petsa ng mga ulat.',reason:'Mahalagang alamin ang pinagmulan at petsa upang masuri ang impormasyon.',inference:'Hindi agad naniwala si Aya sa unang impormasyong nabasa niya.',message:'Suriin ang pinagmulan at pagiging bago ng impormasyon.'},
  {text:'Naghanda ang pangkat ng poster tungkol sa pagtitipid ng tubig. Gumamit sila ng datos mula sa tala ng paaralan at nagbanggit ng pinagmulan nito.',fact:'Gumamit ang pangkat ng datos mula sa tala ng paaralan.',reason:'Binanggit nila ang pinagmulan upang malaman ng mambabasa kung saan galing ang datos.',inference:'Nais ng pangkat na maging malinaw at mapatutunayan ang kanilang mensahe.',message:'Pinatitibay ng malinaw na sanggunian ang isang pahayag.'},
  {text:'Nagsulat si Noel ng mungkahi para sa mas ligtas na tawiran. Inayos niya ang sulat upang ilahad muna ang suliranin, saka ang ebidensiya at panukala.',fact:'Inayos ni Noel ang sulat ayon sa suliranin, ebidensiya, at panukala.',reason:'Nais niyang maging malinaw ang batayan at solusyon sa kaniyang mungkahi.',inference:'Inisip ni Noel kung paano susundan ng mambabasa ang kaniyang pangangatwiran.',message:'Nagiging kapani-paniwala ang panukala kapag malinaw ang lohika at batayan.'}
 ];
 const GRAMMAR=[
  ['Naglinis kami ng silid-aralan bago magsimula ang klase.','Naglinis kami nang silid-aralan bago magsimula ang klase.','Nag linis kami ng silid-aralan bago magsimula ang klase.','Naglinis kami ng silid aralan bago magsimula ang klase.'],
  ['Kapag umuulan, nagdadala si Lira ng payong.','Kapag umuulan nagdadala, si Lira ng payong.','Kapag umuulan nagdadala si Lira, ng payong.','Kapag, umuulan nagdadala si Lira ng payong.'],
  ['Nagbasa si Marco at nagsulat siya ng buod.','Nagbasa si Marco at nagsulat siya nang buod.','Nagbasa si Marco, at nagsulat siya ng buod?','Nagbasa si Marco at nagsulat nang siya ng buod.'],
  ['Maingat na sinuri ng pangkat ang mga tala bago magpasya.','Maingat na sinuri ng pangkat ang mga tala bago magpasya?','Maingat sinuri ng pangkat ang mga tala bago magpasya.','Maingat na sinuri nang pangkat ang mga tala bago magpasya.'],
  ['Ipinasa ni Ana ang ulat na ginawa ng kanilang pangkat.','Ipinasa ni Ana ang ulat na ginawa ng kanila pangkat.','Ipinasa ni Ana ang ulat na ginagawa ng kanilang pangkat kahapon.','Ipinasa ni Ana ang ulat ginawa ng kanilang pangkat na.'],
  ['Nagtanim sila ng punla, kaya naging luntian ang bakuran.','Nagtanim sila ng punla, ngunit naging luntian ang bakuran dahil dito.','Nagtanim sila ng punla kaya, naging luntian ang bakuran.','Nagtanim sila ng punla; dahil naging luntian ang bakuran kaya.'],
  ['Ayon sa tala, tumaas ang bilang ng mga mambabasa ngayong buwan.','Ayon sa tala tumaas, ang bilang ng mga mambabasa ngayong buwan.','Ayon sa tala, tumaas ang bilang ng mga mambabasa ngayong buwan?','Ayon sa tala, tumaas bilang ng mga mambabasa ngayong buwan.'],
  ['Bagaman maikli ang oras, natapos ng pangkat ang pananaliksik.','Bagaman maikli ang oras natapos, ng pangkat ang pananaliksik.','Bagaman maikli ang oras; natapos ng pangkat ang pananaliksik dahil.','Bagaman maikli ang oras, natapos ang pangkat ng pananaliksik.'],
  ['Nagbigay siya ng halimbawa upang suportahan ang kaniyang pahayag.','Nagbigay siya ng halimbawa para suportahan kaniyang ang pahayag.','Nagbigay siya nang halimbawa upang suportahan ang kaniyang pahayag.','Nagbigay siya ng halimbawa upang suportahan ng kaniyang pahayag.'],
  ['Ipinakita ng ulat ang datos at ipinaliwanag ang limitasyon nito.','Ipinakita ng ulat ang datos pero, ipinaliwanag ang limitasyon nito.','Ipinakita ng ulat ang mga datos at ipinaliwanag nito ang limitasyon.','Ipinakita ng ulat datos at ipinaliwanag limitasyon nito ang.']
 ];
 const SPEAKING=[
  ['May kaklaseng hindi pa nakapagsasalita sa talakayan. Ano ang pinakamainam mong sabihin?',['“Gusto mo bang ibahagi ang iyong ideya? Makikinig kami.”','“Bilisan mo, tapos na kami.”','“Hindi mahalaga ang sasabihin mo.”','“Ako na lang ang sasagot.”'],0],
  ['Hindi mo naunawaan ang panuto. Paano ka magtatanong nang magalang?',['“Maaari po bang ipaliwanag muli ang ikalawang hakbang?”','“Walang saysay ang panutong ito.”','“Hindi ko gagawin iyan.”','“Ulitin mo nga, hindi ko narinig.”'],0],
  ['May magkaibang pananaw sa pangkat. Alin ang makatutulong sa usapan?',['“Pakinggan muna natin ang bawat dahilan bago magpasya.”','“Mali ka, tapos ang usapan.”','“Huwag na tayong magsalita.”','“Piliin natin ang pinakamalakas ang boses.”'],0],
  ['Magbibigay ka ng ulat sa klase. Ano ang magandang panimula?',['“Tatalakayin ko ang resulta, ang batayan nito, at ang susunod na hakbang.”','“May sasabihin ako, bahala na kayo.”','“Hindi ko alam kung bakit ako narito.”','“Wala nang kailangang paliwanag.”'],0],
  ['May narinig kang pahayag na walang binanggit na sanggunian. Ano ang magalang na tugon?',['“Maaari po bang malaman kung saan nagmula ang impormasyong iyon?”','“Sigurado akong gawa-gawa iyan.”','“Ipasa na lang natin kahit walang batayan.”','“Huwag na nating alamin.”'],0],
  ['Kailangan mong hindi sumang-ayon sa mungkahi. Ano ang pinakamainam na pahayag?',['“Nauunawaan ko ang mungkahi; may datos akong nais idagdag bago tayo magpasya.”','“Wala kang alam.”','“Hindi, dahil ayaw ko.”','“Tumahimik ka na lang.”'],0],
  ['May tagapakinig na nalilito sa paliwanag. Ano ang dapat mong gawin?',['“Uulitin ko ang pangunahing ideya at magbibigay ng isang halimbawa.”','“Hindi mo ba naiintindihan?”','“Laktawan na natin ang paliwanag.”','“Mas lalakasan ko lang ang boses.”'],0],
  ['Isinasara mo ang talakayan matapos marinig ang lahat. Alin ang malinaw na buod?',['“Magkakatulad ang layunin natin; susubukan natin ang mungkahing may pinakamatibay na batayan.”','“Tapos na. Huwag nang magtanong.”','“Walang saysay ang mga sinabi natin.”','“Ako ang masusunod dahil ako ang nauna.”'],0],
  ['Nais mong magbigay ng puna sa kaklase. Alin ang nakatuon sa gawa at hindi sa tao?',['“Malinaw ang pangunahing ideya; magdagdag tayo ng ebidensiya sa ikalawang talata.”','“Hindi ka mahusay magsulat.”','“Ayusin mo iyan, hindi ko gusto.”','“Wala akong sasabihin.”'],0],
  ['May mahalagang pahayag sa presentasyon. Paano mo ito susuportahan?',['“Ilalahad ko ang pinagmulan ng datos at ipaliliwanag kung paano ito sumusuporta sa punto.”','“Maniwala na lang kayo sa akin.”','“Hindi na kailangan ang paliwanag.”','“Narinig ko lang ito sa iba.”'],0]
 ];
 const WRITING_PROMPTS=[
  'Ilarawan ang isang paraan upang mapangalagaan ng klase ang kalinisan ng paaralan.',
  'Isalaysay ang isang pagkakataong nagtulungan ang mga tao sa inyong pamayanan.',
  'Ipaliwanag kung bakit mahalagang suriin ang impormasyon bago ito ibahagi.',
  'Sumulat ng mungkahi upang mahikayat ang mga mag-aaral na magbasa.',
  'Ihambing ang dalawang paraan ng pagtitipid ng tubig at pumili ng mas angkop.',
  'Ilarawan ang isang suliranin sa paaralan at magmungkahi ng makatuwirang solusyon.',
  'Ipaliwanag kung paano nakatutulong ang maayos na paghahanda sa isang pangkatang gawain.',
  'Bumuo ng maikling paninindigan tungkol sa pangangalaga sa pampublikong lugar at magbigay ng dahilan.',
  'Sumulat ng talata na naghahambing ng dalawang sanggunian tungkol sa iisang paksa.',
  'Bumuo ng malinaw na panukala, suportahan ito ng halimbawa, at tapusin sa isang kongklusyon.'
 ];
 const RESEARCH=[
  ['May dalawang ulat na magkaiba ang petsa. Ano ang unang dapat suriin?',['Petsa at pinagmulan ng bawat ulat','Kulay ng pamagat','Haba ng pahina lamang','Kung alin ang unang nakita sa social media'],0],
  ['Alin ang pinakamainam na ebidensiya para sa pahayag tungkol sa bilang ng mag-aaral?',['Talaan ng bilang na may petsa at pinagmulan','Haka-haka ng isang kakilala','Larawang walang paliwanag','Pamagat na maraming tandang padamdam'],0],
  ['May pahayag na walang may-akda at walang sanggunian. Ano ang dapat gawin?',['Humanap ng mapatutunayang sanggunian bago ito gamitin','Ibahagi agad dahil maikli','Ituring itong opisyal na ulat','Baguhin ang pamagat at gamitin'],0],
  ['Ano ang kaibahan ng opinyon at katotohanan?',['Ang katotohanan ay maaaring siyasatin; ang opinyon ay nagpapahayag ng pananaw','Pareho silang laging nasusukat','Ang opinyon ay laging tama','Ang katotohanan ay hindi nangangailangan ng batayan'],0],
  ['Aling sanggunian ang mas angkop sa pananaliksik tungkol sa lokal na panahon?',['Opisyal at napapanahong tala ng panahon','Lumang komento na walang petsa','Hindi kilalang larawan','Pahayag na walang pinagmulan'],0],
  ['Ano ang dapat gawin kapag hindi sinusuportahan ng datos ang unang palagay?',['Baguhin ang palagay at ipaliwanag ang bagong konklusyon','Itago ang datos','Piliin lamang ang bahaging pabor sa palagay','Sabihing mali ang lahat ng sanggunian'],0],
  ['Paano maiiwasan ang pagkiling sa paghahambing ng dalawang panig?',['Ipakita nang patas ang ebidensiya at limitasyon ng bawat panig','Gamitin lamang ang paboritong panig','Alisin ang magkasalungat na datos','Piliin ang pinakamadaling sagot'],0],
  ['Bakit kailangang itala ang sanggunian?',['Upang masuri at mahanap ng mambabasa ang pinagmulan','Upang humaba ang papel','Upang palitan ang sariling paliwanag','Upang hindi na suriin ang datos'],0],
  ['Aling pangungusap ang may pahayag at batayan?',['“Dapat maglagay ng basurahan dahil ipinakita ng tala ang pagdami ng kalat.”','“Dapat ito dahil ganoon lang.”','“Maraming tao ang nagsabi.”','“Maganda ang ideya at wala nang tanong.”'],0],
  ['Ano ang pinakamainam na kongklusyon mula sa limitadong datos?',['Sabihin kung ano ang ipinakikita at kilalanin ang hindi pa napatutunayan','Gumawa ng malawak na pahayag tungkol sa lahat','Itago ang limitasyon','Magdagdag ng bilang na hindi sinukat'],0]
 ];
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const gradeFor=profile=>{
  const raw=Number.parseInt(String(profile?.grade??''),10);
  if(raw>=7&&raw<=10)return raw;
  const selected=typeof selectedGrade!=='undefined'?Number.parseInt(String(selectedGrade),10):NaN;
  return selected>=7&&selected<=10?selected:7
 };
 const slug=area=>area==='Mathematics'?'math':'filipino';
 const stationById=(area,id)=>(STATIONS[area]||[]).find(station=>station.id===id);
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
 function progressFor(area,grade=gradeFor(typeof user!=='undefined'?user:null),profile=typeof user!=='undefined'?user:null){
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
 function persist(area,progress,profile=typeof user!=='undefined'?user:null){
  const key=storageKey(area,progress.grade,profile);
  progress.updatedAt=new Date().toISOString();
  if(storageReadFailures.has(key)){storageWarning='Saved progress could not be read. Changes in this session will not overwrite it.';return false}
  try{localStorage.setItem(key,JSON.stringify(progress));storageWarning='';return true}
  catch(error){console.error('READwy subject progress could not be saved.',error);storageWarning='Progress could not be saved on this device. Check browser storage settings.';return false}
 }
 const formatNumber=value=>Number.isInteger(value)?String(value):String(Number(value.toFixed(2)));
 function choiceItem(prompt,options,answer,explanation,context=''){
  const choices=options.map(String),shift=Array.from(String(prompt)).reduce((sum,char)=>(sum+char.charCodeAt(0))%choices.length,0);
  choices.push(...choices.splice(0,shift));
  return {type:'choice',prompt,choices,answer:String(answer),explanation,context}
 }
 function numericItem(prompt,answer,explanation){
  const correct=formatNumber(answer),options=[correct];
  for(const delta of [1,-1,2,-2,3,-3,5,-5]){
   const candidate=formatNumber(answer+delta);
   if(!options.includes(candidate))options.push(candidate);
   if(options.length===4)break
  }
  return choiceItem(prompt,options,correct,explanation)
 }
 function mathActivity(grade,id,index){
  const n=index+1,a=index+3,b=index+2;
  if(id==='number'){
   if(grade===7){const answer=a-b;return numericItem(`Kuwentahin: ${a} + (−${b}).`,answer,`Idagdag ang positibong bilang at ang negatibong bilang: ${a} − ${b} = ${answer}.`)}
   if(grade===8){const answer=b*2;return numericItem(`Sa timpla, ${a} tasa ng tubig ang katapat ng ${b} kutsara ng katas. Kung dodoblehin ang timpla, ilang kutsara ng katas ang kailangan?`,answer,`Doblehin ang magkabilang bahagi ng ratio: ${b} × 2 = ${answer}.`)}
   if(grade===9){const base=(index+4)*20,rate=[10,15,20,25,30,35,40,45,50,60][index];const answer=base*rate/100;return numericItem(`Magkano ang ${rate}% ng ₱${base}?`,answer,`${rate}/100 × ${base} = ${formatNumber(answer)}.`)}
   const x=(index+2)/4,y=(index+1)/2,answer=Number((x+y).toFixed(2));return numericItem(`Kuwentahin ang ${formatNumber(x)} + ${formatNumber(y)}.`,answer,`Pagsamahin ang mga decimal: ${formatNumber(x)} + ${formatNumber(y)} = ${formatNumber(answer)}.`)
  }
  if(id==='algebra'){
   if(grade===7){const answer=index+2,c=answer+a;return numericItem(`Hanapin ang x: x + ${a} = ${c}.`,answer,`Ibawas ang ${a} sa magkabilang panig: x = ${c} − ${a} = ${answer}.`)}
   if(grade===8){const coefficient=index%4+2,answer=index+2,c=coefficient*answer+b;return numericItem(`Lutasin ang ${coefficient}x + ${b} = ${c}.`,answer,`Ibawas ang ${b}, pagkatapos hatiin sa ${coefficient}: x = ${answer}.`)}
   if(grade===9){const coefficient=index%3+2,answer=index+2,offset=index%4+1,c=coefficient*(answer+offset);return numericItem(`Lutasin ang ${coefficient}(x + ${offset}) = ${c}.`,answer,`Hatiin sa ${coefficient}: x + ${offset} = ${c/coefficient}; kaya x = ${answer}.`)}
   const answer=index%6+2,square=answer*answer;return numericItem(`Ano ang positibong solusyon ng x² = ${square}?`,answer,`${answer} × ${answer} = ${square}, kaya ang positibong solusyon ay ${answer}.`)
  }
  if(id==='geometry'){
   if(grade===7){const w=index+3,h=index%5+2,answer=2*(w+h);return numericItem(`Ano ang perimeter ng parihabang may habang ${w} cm at lapad na ${h} cm?`,answer,`P = 2(l + w) = 2(${w} + ${h}) = ${answer} cm.`)}
   if(grade===8){const base=index+4,height=index%4+3,answer=base*height/2;return numericItem(`Ano ang lawak ng tatsulok na may base na ${base} cm at taas na ${height} cm?`,answer,`A = (base × taas) ÷ 2 = (${base} × ${height}) ÷ 2 = ${formatNumber(answer)} cm².`)}
   if(grade===9){const legA=index%5+3,legB=legA+1,hypotenuse=Math.round(Math.sqrt(legA*legA+legB*legB));return numericItem(`Sa right triangle, ang mga paa ay ${legA} at ${legB} cm. Alin ang pinakamalapit na haba ng hypotenuse?`,hypotenuse,`Gamit ang a² + b² = c², c = √(${legA}² + ${legB}²) ≈ ${hypotenuse} cm.`)}
   const radius=index%5+2,answer=Number((2*3.14*radius).toFixed(2));return numericItem(`Gamitin ang π ≈ 3.14. Ano ang circumference ng bilog na may radius na ${radius} cm?`,answer,`C = 2πr = 2 × 3.14 × ${radius} ≈ ${formatNumber(answer)} cm.`)
  }
  if(id==='functions'){
   if(grade===7){const start=index+1,step=index%4+2,term=step*n+start-step;return numericItem(`Nagsisimula sa ${start} ang pattern at nadaragdagan ng ${step} sa bawat hakbang. Ano ang ika-${n} termino?`,term,`Ika-${n} termino = ${start} + (${n-1} × ${step}) = ${term}.`)}
   if(grade===8){const x=index+2,m=index%4+2,c=index+1,answer=m*x+c;return numericItem(`Kung f(x) = ${m}x + ${c}, ano ang f(${x})?`,answer,`Palitan ang x: ${m}(${x}) + ${c} = ${answer}.`)}
   if(grade===9){const slope=index%4+1,x1=index%3+1,y1=index%5+2,x2=x1+2,y2=y1+slope*(x2-x1);return numericItem(`Ano ang slope ng linyang dumaraan sa (${x1}, ${y1}) at (${x2}, ${y2})?`,slope,`m = (y₂ − y₁)/(x₂ − x₁) = (${y2} − ${y1})/(${x2} − ${x1}) = ${slope}.`)}
   const x=index%5+1,coefficient=index%3+1,constant=index+2,answer=x*x+coefficient*x+constant;return numericItem(`Kung f(x) = x² + ${coefficient}x + ${constant}, ano ang f(${x})?`,answer,`f(${x}) = ${x}² + ${coefficient}(${x}) + ${constant} = ${answer}.`)
  }
  if(id==='data'){
   if(grade===7){const values=[n,n+2,n+4,n+6],answer=values.reduce((sum,value)=>sum+value,0)/values.length;return numericItem(`Hanapin ang mean ng ${values.join(', ')}.`,answer,`Idagdag ang mga bilang at hatiin sa ${values.length}: ${answer}.`)}
   if(grade===8){const values=[n+7,n+1,n+5,n+3,n+9].sort((x,y)=>x-y),answer=values[2];return numericItem(`Hanapin ang median ng ${values.join(', ')}.`,answer,`Ayusin ang mga bilang. Ang nasa gitna ay ${answer}.`)}
   if(grade===9){const red=index%4+1,total=red+5;return choiceItem(`May ${red} pulang bola at ${total-red} asul na bola sa supot. Ano ang probabilidad na makakuha ng pula?`,[`${red}/${total}`,`${total}/${red}`,`${total-red}/${total}`,`1/${red}`],`${red}/${total}`,`May ${red} pulang bola sa kabuuang ${total}, kaya P(pula) = ${red}/${total}.`)}
   const values=[n,n+2,n+2,n+4,n+6],answer=n+2;return numericItem(`Hanapin ang mode ng ${values.join(', ')}.`,answer,`${answer} ang pinakamadalas lumitaw, kaya ito ang mode.`)
  }
  const count=index+2,unit=index%4+2;
  if(grade===7){const answer=count*unit;return numericItem(`${count} pangkat ang may tig-${unit} mag-aaral. Ilang mag-aaral ito sa kabuuan?`,answer,`Paramihin ang bilang ng pangkat sa bawat pangkat: ${count} × ${unit} = ${answer}.`)}
  if(grade===8){const total=(index+3)*12,items=index+3,answer=total/items;return numericItem(`Nagkakahalaga ng ₱${total} ang ${items} magkakaparehong kuwaderno. Magkano ang isang kuwaderno?`,answer,`Hatiin ang kabuuang halaga sa ${items}: ₱${total} ÷ ${items} = ₱${answer}.`)}
  if(grade===9){const price=(index+4)*50,discount=10+(index%4)*5,answer=price*(1-discount/100);return numericItem(`May ${discount}% bawas sa presyong ₱${price}. Magkano ang babayaran?`,answer,`Bawas = ₱${price} × ${discount}% = ₱${price*discount/100}; bayad = ₱${formatNumber(answer)}.`)}
  const base=(index+2)*20,rate=index%4+5,answer=base+rate*3;return numericItem(`May panimulang ₱${base} at dagdag na ₱${rate} bawat kilometro. Magkano ang kabuuan sa 3 km?`,answer,`Kabuuan = panimula + 3 × rate = ₱${base} + 3(₱${rate}) = ₱${answer}.`)
 }
 function filipinoActivity(grade,id,index){
  if(id==='vocabulary'){
   const level=WORDS[grade]||WORDS[7],entry=level[index%level.length],wrong=[level[(index+3)%10][1],level[(index+6)%10][1],level[(index+8)%10][1]];
   return choiceItem(`Basahin: “${entry[2]}” Ano ang kahulugan ng “${entry[0]}” batay sa pangungusap?`,[entry[1],...wrong],entry[1],`Sa konteksto, ang “${entry[0]}” ay nangangahulugang ${entry[1]}.`)
  }
  if(id==='reading'){
   const passage=PASSAGES[index%PASSAGES.length],field=grade===7?'fact':grade===8?'reason':grade===9?'inference':'message',label={fact:'Aling detalye ang binanggit sa teksto?',reason:'Bakit ginawa ang kilos na inilalarawan?',inference:'Anong hinuha ang sinusuportahan ng mga detalye?',message:'Aling mensahe ang pinakamainam na buod ng teksto?'}[field],answer=passage[field],distractors=['Hindi binanggit sa teksto ang kilos na ito.','Ipinakikita ng teksto ang kabaligtarang pangyayari.','Walang sapat na detalye upang suportahan ito.'];
   return choiceItem(label,[answer,...distractors],answer,`Balikan ang teksto at iugnay ang sagot sa mga detalyeng ibinigay.`,passage.text)
  }
  if(id==='grammar'){
   const options=GRAMMAR[index%GRAMMAR.length],correct=options[0];
   return choiceItem(`Alin ang malinaw at wastong pagkakabuo ng pangungusap?`,options,correct,'Suriin ang gamit ng salita, ayos ng pangungusap, at bantas.')
  }
  if(id==='speaking'){
   const [prompt,options,correctIndex]=SPEAKING[index%SPEAKING.length];
   return choiceItem(prompt,options,options[correctIndex],'Pumili ng tugong malinaw, magalang, at angkop sa kausap.')
  }
  if(id==='writing'){
   const minimum={7:45,8:70,9:100,10:130}[grade]||45;
   return {type:'write',prompt:WRITING_PROMPTS[index%WRITING_PROMPTS.length],minimum,checks:['May malinaw na pangunahing ideya.','May kaugnay na detalye o halimbawa.','Nasuri ang baybay, bantas, at daloy.'],explanation:'Gamitin ang talaan bilang sariling gabay. Hindi awtomatikong binibigyan ng marka ang kalidad ng iyong sulatin.'}
  }
  const [prompt,options,correctIndex]=RESEARCH[index%RESEARCH.length];
  return choiceItem(prompt,options,options[correctIndex],`Piliin ang hakbang na nagtataguyod ng malinaw, patas, at mapatutunayang pagpapahayag.`)
 }
 function activityFor(area,grade,stationId,index){
  if(area==='Mathematics')return stationId==='modeling'&&index>=8
   ?{type:'write',prompt:index===8?'Ipaliwanag ang mga hakbang sa paglutas ng isang suliranin sa badyet o sukat na pinag-aralan mo. Ipakita ang datos, operasyon, at sagot.':'Bumuo ng sariling praktikal na suliranin na malulutas gamit ang matematika. Ipakita ang modelo at ipaliwanag kung bakit makatwiran ang sagot.',minimum:{7:45,8:70,9:100,10:130}[grade]||45,checks:['Nailahad ang mahahalagang datos.','Naipakita ang angkop na operasyon o modelo.','Naipaliwanag kung bakit makatwiran ang sagot.'],explanation:'Ihambing ang sariling paliwanag sa mga hakbang at tiyaking malinaw ang yunit.'}
   :mathActivity(grade,stationId,index);
  return filipinoActivity(grade,stationId,index)
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
  if(area==='Mathematics'&&stationId==='modeling')return correctCount(progress,stationId)>=8&&answers[8]?.done&&answers[9]?.done;
  return correctCount(progress,stationId)>=8
 }
 function stationUnlocked(area,progress,index){
  if(!progress.placement)return false;
  if(index===0)return true;
  return stationComplete(area,progress,STATIONS[area][index-1].id)
 }
 const allComplete=(area,progress)=>STATIONS[area].every(station=>stationComplete(area,progress,station.id));
 function getProfile(){return typeof user!=='undefined'&&user?user:{}}
 function getArea(){return typeof selectedLearningArea!=='undefined'?selectedLearningArea:'English'}
 function noticeMarkup(){return storageWarning?`<p class="rw-subject-warning" role="status">${escapeHtml(storageWarning)}</p>`:''}
 function header(area,grade,subtitle=''){
  return `<header class="rw-subject-header"><button type="button" class="rw-subject-brand" onclick="window.go('subject')" aria-label="Back to learning areas"><span aria-hidden="true">R</span><strong>READwy <small>${escapeHtml(area)}</small></strong></button><div class="rw-subject-grade">Grade ${grade}${subtitle?` · ${escapeHtml(subtitle)}`:''}</div><button type="button" class="rw-subject-quiet" onclick="window.readwySubjectBack()">Learning areas</button></header>`
 }
 function renderWelcome(){
  const area=getArea();if(!STATIONS[area])return;
  const profile=getProfile(),grade=gradeFor(profile);
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,'Your learning journey')}<section class="rw-subject-welcome"><p class="rw-subject-eyebrow">A new learning adventure</p><h1>${escapeHtml(area)}</h1><p class="rw-subject-lede">${area==='Mathematics'?'Build confidence by exploring number, patterns, geometry, data, and real-world problem solving.':'Palawakin ang pag-unawa sa pagbasa, wika, pagsasalita, pagsulat, at pananaliksik.'}</p><div class="rw-subject-welcome-grid">${STATIONS[area].map((station,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(station.name)}</strong></article>`).join('')}</div><p class="rw-subject-grade-focus"><strong>Grade ${grade} focus:</strong> ${escapeHtml(GRADE_FOCUS[area][grade])}</p><p class="rw-subject-note">${area==='Mathematics'?'A low-stakes check-in helps you begin. It is not a final grade.':'May paunang pagsusuri upang makita kung saan magsisimula. Hindi ito panghuling marka.'}</p><div class="rw-subject-actions"><button class="rw-subject-primary" type="button" onclick="window.go('map')">Start ${escapeHtml(area)} journey</button><button class="rw-subject-secondary" type="button" onclick="window.readwySubjectBack()">Choose another learning area</button></div></section>${noticeMarkup()}</div></main>`
 }
 function renderMap(){
  const area=getArea();if(!STATIONS[area])return;
  const grade=gradeFor(getProfile()),progress=progressFor(area,grade),stations=STATIONS[area],total=stations.reduce((sum,station)=>sum+completedCount(progress,station.id),0),done=stations.filter(station=>stationComplete(area,progress,station.id)).length,completed=allComplete(area,progress);
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,'Journey map')}<section class="rw-subject-map"><div class="rw-subject-map-heading"><div><p class="rw-subject-eyebrow">Your progress</p><h1>${escapeHtml(area)} Journey</h1><p>Six stations · 10 activities each · work at your own pace.</p></div><div class="rw-subject-progress" aria-label="${total} of 60 activities complete"><strong>${total}<small>/60</small></strong><span>activities</span></div></div>${progress.placement?`<p class="rw-subject-checkin-done" role="status">Check-in complete · ${progress.placement.score}/${progress.placement.total} correct. This is a starting point, not a grade.</p>`:`<section class="rw-subject-checkin"><div><strong>Start with a short check-in</strong><p>Six questions help you see what you already know. Your result will not block the journey.</p></div><button class="rw-subject-primary" type="button" onclick="window.readwySubjectStartPlacement()">Start check-in</button></section>`}<div class="rw-subject-stations">${stations.map((station,index)=>{
   const count=completedCount(progress,station.id),isDone=stationComplete(area,progress,station.id),unlocked=stationUnlocked(area,progress,index),status=isDone?'Complete':unlocked?'Open':'Locked';
   return `<article class="rw-subject-station ${isDone?'is-complete':''} ${!unlocked?'is-locked':''}"><div class="rw-subject-station-number">${index+1}</div><div class="rw-subject-station-copy"><span class="rw-subject-status">${status}</span><h2>${escapeHtml(station.name)}</h2><p>${escapeHtml(station.goal)}</p><div class="rw-subject-meter" role="progressbar" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="10"><span style="width:${count*10}%"></span></div><small>${count}/10 activities · ${isDone?'Mastered':unlocked?'Earn 8 correct to open the next station':'Finish the previous station first'}</small></div><button type="button" class="rw-subject-station-button" ${unlocked?'':'disabled'} onclick="window.readwySubjectOpenStation('${station.id}')">${unlocked?(isDone?'Review':'Open station'):'Locked'}</button></article>`
  }).join('')}</div><p class="rw-subject-footer-note">${area==='Mathematics'?'Show your steps and check units when solving.':'Sariling gawa ang bawat teksto at gawain; magbalik-aral at sumubok muli kung kinakailangan.'}</p>${completed?`<section class="rw-subject-finish" role="status"><div><strong>Journey complete!</strong><p>You completed all six ${escapeHtml(area)} stations.</p></div><button type="button" class="rw-subject-primary" onclick="window.readwySubjectCertificate()">View certificate</button></section>`:''}</section>${storageWarning?noticeMarkup():''}${runtime.certificate?certificateMarkup(area,grade,progress):''}</div></main>`
 }
 const runtime={certificate:false,feedback:''};
 function certificateMarkup(area,grade,progress){
  const learner=escapeHtml(getProfile().name||'Learner');
  return `<div class="rw-subject-certificate-layer" role="dialog" aria-modal="true" aria-labelledby="rwSubjectCertificateTitle"><section class="rw-subject-certificate"><button class="rw-subject-certificate-close" type="button" onclick="window.readwySubjectCloseCertificate()" aria-label="Close certificate">×</button><p>READwy Learning Journey</p><h1 id="rwSubjectCertificateTitle">Certificate of Completion</h1><span>Presented to</span><h2>${learner}</h2><p>for completing the Grade ${grade} ${escapeHtml(area)} journey and its six learning stations.</p><small>${new Date(progress.updatedAt||Date.now()).toLocaleDateString()}</small><div class="rw-subject-actions"><button class="rw-subject-primary" type="button" onclick="window.print()">Print certificate</button><button class="rw-subject-secondary" type="button" onclick="window.readwySubjectCloseCertificate()">Close</button></div></section></div>`
 }
 function renderTask(){
  const area=getArea(),profile=getProfile(),grade=gradeFor(profile),progress=progressFor(area,grade);
  let session=activeTask;
  if(session&&(session.area!==area||session.grade!==grade)){activeTask=null;saveActiveTask();session=null}
  if(!STATIONS[area]||!session){renderMap();return}
  const station=session.mode==='placement'?null:stationById(area,session.stationId);
  if(session.mode!=='placement'&&!station){renderMap();return}
  const items=session.mode==='placement'?Array.from({length:6},(_,index)=>activityFor(area,grade,area==='Mathematics'?'number':'vocabulary',index)):null;
  const item=session.mode==='placement'?items[session.index]:activityFor(area,grade,station.id,session.index);
  if(!item){renderMap();return}
  const record=session.mode==='placement'?null:(progress.stations[station.id]?.answers||{})[session.index];
  const context=item.context?`<blockquote class="rw-subject-passage">${escapeHtml(item.context)}</blockquote>`:'';
  const writing=item.type==='write';
  const writingUI=writing?`<label class="rw-subject-writing-label" for="rwSubjectResponse">Your response</label><textarea id="rwSubjectResponse" minlength="${item.minimum}" placeholder="Write your own response here.">${escapeHtml(record?.response||session.draft||'')}</textarea><p class="rw-subject-minimum">At least ${item.minimum} characters; your work is saved as a draft when submitted.</p><fieldset class="rw-subject-checks"><legend>Review your work</legend>${item.checks.map((check,index)=>`<label><input type="checkbox" name="rwSubjectCheck" value="${index}" ${(record?.checks||session.checks||[]).includes(index)?'checked':''}> ${escapeHtml(check)}</label>`).join('')}</fieldset><button type="button" class="rw-subject-primary" onclick="window.readwySubjectSubmitWriting()">Save response</button>`:'';
  const choices=writing?'':`<div class="rw-subject-choices">${item.choices.map((choice,index)=>`<button type="button" onclick="window.readwySubjectAnswer(${index})">${String.fromCharCode(65+index)}. ${escapeHtml(choice)}</button>`).join('')}</div>`;
  const alreadyDone=!!record?.done,feedback=runtime.feedback||'';
  app.innerHTML=`<main class="rw-subject-screen rw-subject-${slug(area)}"><div class="rw-subject-shell">${header(area,grade,session.mode==='placement'?'Check-in':station.name)}<section class="rw-subject-task"><div class="rw-subject-task-top"><button type="button" class="rw-subject-secondary" onclick="window.readwySubjectBackToMap()">← Journey map</button><span>${session.mode==='placement'?'Check-in':`Activity ${session.index+1} of 10`}</span></div><div class="rw-subject-task-progress"><span style="width:${((session.index+1)/(session.mode==='placement'?6:10))*100}%"></span></div><p class="rw-subject-eyebrow">${session.mode==='placement'?'A low-stakes starting point':escapeHtml(station.name)}</p><h1>${escapeHtml(item.prompt)}</h1>${context}${writingUI}${choices}<p class="rw-subject-feedback" role="status" aria-live="polite">${alreadyDone?'Completed. You may continue or return to your map.':escapeHtml(feedback)}</p>${item.explanation&&alreadyDone?`<p class="rw-subject-explanation">${escapeHtml(item.explanation)}</p>`:''}<div class="rw-subject-task-actions">${session.mode==='placement'?`<button type="button" class="rw-subject-primary" onclick="window.readwySubjectNextPlacement()">Next question</button>`:alreadyDone?`<button type="button" class="rw-subject-primary" onclick="window.readwySubjectNext()">Next activity</button>`:''}<button type="button" class="rw-subject-secondary" onclick="window.readwySubjectBackToMap()">Return to map</button></div>${noticeMarkup()}</section></div></main>`;
  if(area==='Filipino'&&item.context&&typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined'){
   const speakButton=document.createElement('button');speakButton.type='button';speakButton.className='rw-subject-speak';speakButton.textContent='Pakinggan ang teksto (kung may Filipino voice)';
   speakButton.onclick=()=>{const utterance=new SpeechSynthesisUtterance(item.context);utterance.lang='fil-PH';speechSynthesis.cancel();speechSynthesis.speak(utterance)};
   app.querySelector('.rw-subject-passage')?.after(speakButton)
  }
 }
 function startPlacement(){
  runtime.certificate=false;runtime.feedback='';activeTask={mode:'placement',index:0,answers:[],area:getArea(),grade:gradeFor(getProfile())};saveActiveTask();go('subject-task')
 }
 function openStation(stationId){
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),station=stationById(area,stationId),index=STATIONS[area]?.findIndex(item=>item.id===stationId)??-1;
  if(!station||index<0||!stationUnlocked(area,progress,index)){runtime.feedback='Complete the previous step to unlock this station.';renderMap();return}
  const answers=progress.stations[stationId]?.answers||{},next=Array.from({length:10},(_,i)=>i).find(i=>!answers[i]?.done);
  runtime.certificate=false;runtime.feedback='';activeTask={mode:'station',stationId,index:next===undefined?0:next,area,grade};saveActiveTask();go('subject-task')
 }
 function answer(choiceIndex){
  if(!activeTask)return;
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade);
  const placement=activeTask.mode==='placement',station=placement?null:stationById(area,activeTask.stationId),item=activityFor(area,grade,placement?(area==='Mathematics'?'number':'vocabulary'):station.id,activeTask.index),choice=item.choices[choiceIndex];
  if(choice===undefined)return;
  if(placement){
   activeTask.answers=activeTask.answers||[];
   activeTask.answers[activeTask.index]={correct:choice===item.answer};
   runtime.feedback=choice===item.answer?'Tama! Maaari ka nang magpatuloy.':'Salamat sa pagsagot. Tingnan ang paliwanag at magpatuloy.';
   saveActiveTask();
  }else{
   const data=progress.stations[station.id]||(progress.stations[station.id]={answers:{}});
   const existing=data.answers[activeTask.index]||{attempts:0};
   existing.attempts++;
   existing.correct=existing.correct||choice===item.answer;
   existing.done=existing.correct;
   data.answers[activeTask.index]=existing;
   runtime.feedback=choice===item.answer?'Tama!':'Hindi pa. Subukang muli; walang bawas sa iyong puntos.';
   persist(area,progress)
  }
  renderTask()
 }
 function submitWriting(){
  if(!activeTask||activeTask.mode!=='station')return;
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),station=stationById(area,activeTask.stationId),item=activityFor(area,grade,station.id,activeTask.index),textarea=app.querySelector('#rwSubjectResponse'),text=textarea?.value.trim()||'',checks=[...app.querySelectorAll('input[name="rwSubjectCheck"]:checked')].map(input=>Number(input.value));
  activeTask.draft=text;activeTask.checks=checks;saveActiveTask();
  if(text.length<item.minimum){runtime.feedback=`Dagdagan pa ang sagot. Kailangan ng hindi bababa sa ${item.minimum} character.`;renderTask();return}
  if(checks.length<2){runtime.feedback='Pumili ng hindi bababa sa dalawang pamantayan na nasuri mo.';renderTask();return}
  const data=progress.stations[station.id]||(progress.stations[station.id]={answers:{}});
  const existing=data.answers[activeTask.index]||{attempts:0};existing.attempts++;existing.done=true;existing.correct=false;existing.response=text;existing.checks=checks;data.answers[activeTask.index]=existing;
  runtime.feedback='Nai-save ang iyong sariling sagot at pagninilay. Hindi awtomatikong hinuhusgahan ang kalidad ng sulatin.';
  persist(area,progress);renderTask()
 }
 function next(){
  if(!activeTask||activeTask.mode!=='station')return;
  if(activeTask.index<9){activeTask.index++;runtime.feedback='';saveActiveTask();renderTask();return}
  activeTask=null;saveActiveTask();runtime.feedback='';go('map')
 }
 function nextPlacement(){
  if(!activeTask||activeTask.mode!=='placement')return;
  if(activeTask.index<5){activeTask.index++;runtime.feedback='';saveActiveTask();renderTask();return}
  const area=getArea(),grade=gradeFor(getProfile()),progress=progressFor(area,grade),answers=activeTask.answers||[],score=answers.filter(answer=>answer?.correct).length;
  progress.placement={score,total:6,completedAt:new Date().toISOString()};
  persist(area,progress);activeTask=null;saveActiveTask();runtime.feedback='';go('map')
 }
 function backToMap(){runtime.feedback='';activeTask=null;saveActiveTask();go('map')}
 function back(){
  runtime.feedback='';activeTask=null;saveActiveTask();runtime.certificate=false;go('subject')
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
 const api={stations:STATIONS,gradeFocus:GRADE_FOCUS,activityFor,progressFor,stationComplete,stationUnlocked,allComplete,storageKey,renderWelcome,renderMap,renderTask,startPlacement,openStation,answer,submitWriting,next,nextPlacement,backToMap,back,showCertificate,closeCertificate,render};
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
